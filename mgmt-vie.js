"use strict";
/* ==== [ANCRE: MGMT_LOT5_H5_VIE] — Lot 5 H5, catalogue §6.2 : les moments de
   vie. Chaque cycle, chaque combattant a une petite chance de vivre un moment
   (MGMT_MOMENTS, mgmt-humanite-data.js), tirée sur un flux séparé 'vie'
   semé par (id, cycle) : aucun tirage de la RNG du jeu, le même combattant
   vit les mêmes moments à chaque rejeu.

   - Un combattant de Split garde ses moments comme FAITS (kind 'moment_vie',
     QO-9 : ils ne disparaissent jamais, même si la table change).
   - Un combattant du monde extérieur n'a rien de stocké : ses moments se
     dérivent de son identité (id, cycle) — la règle du bureau.
   - La CHARGE (somme des poids des moments de l'année écoulée) est dérivée,
     jamais stockée, jamais affichée en chiffre (contrat §8). Au-delà de 150
     le combattant est chargé : blessure au camp plus probable, forme en
     baisse (paramètre `dynamic` du profil). Au-delà de 300 il est au bord :
     un retrait devient probable. Les moments heureux pèsent dans la charge
     mais ne comptent pas dans le risque de blessure (modèle stress-blessure).
   Aucun texte n'est écrit ici : les libellés sont ceux du catalogue. ==== */

/** Moments par combattant et par an, en moyenne (contrat H5 : 1 à 2). */
const MGMT_VIE_PAR_AN=1.5;
/** Fenêtre de la charge : l'année écoulée, en cycles (10,4 par an). */
const MGMT_VIE_FENETRE=Math.ceil(MGMT_EXT_YEAR_WEEKS/MGMT_EVENT_WEEKS);
const MGMT_CHARGE_SEUIL=150;
const MGMT_CHARGE_BORD=300;
/** Risque de blessure ajouté à un combat, par palier de charge. */
const MGMT_VIE_RISQUE_CHARGE=0.04;
const MGMT_VIE_RISQUE_BORD=0.10;
/** Forme en baisse (points de `dynamic`, ×0,3 dans l'overall). */
const MGMT_VIE_FORME_CHARGE=6;
const MGMT_VIE_FORME_BORD=12;
/** Chance d'un retrait quand il est au bord, par cycle. */
const MGMT_VIE_RETRAIT_BORD=0.35;
const MGMT_VIE_RETRAIT_CYCLES=2;

/** Moments que l'état du jeu déclenche (classement, ceinture, combat,
 *  poids, retraite) : ils ne se tirent pas au hasard, un futur lot les
 *  branche sur l'événement. */
const MGMT_VIE_CONTEXTUELS=new Set(['monte-categorie','descend-categorie','plus-couper-poids',
  'pesee-ratee','coupe-dangereuse','annonce-retraite','revient-retraite','retraite-ancien-coequipier',
  'devient-champion','perd-ceinture','entre-top-15','sort-top-15','serie-trois-defaites',
  'serie-cinq-victoires','premiere-victoire-ko','premier-ko-subi','combat-annule-veille',
  'victoire-volee','blesse-gravement-adversaire','combat-annee','premier-combat-public',
  'surnom-presse','coequipier-booke-contre-lui','coequipier-booké-contre-lui','offre-autre-organisation',
  'clash-autre-organisation','rival-appelle-public','change-agent','reclame-augmentation',
  'bourse-publiee','commotion-sparring','blessure-entrainement','sparring-tourne-bagarre',
  'maladie-semaine-combat','controle-antidopage-positif']);

/** Moments heureux : ils pèsent dans une vie, jamais dans le risque de blessure. */
const MGMT_VIE_HEUREUX=new Set(['naissance-enfant','mariage','reconciliation','adopte-chien',
  'achete-maison-parents','premiere-grosse-prime','nouveau-sponsor','arrete-alcool','obtient-nationalite',
  'obtient-papiers','ceinture-noire','diplome-obtenu','consultant-television','documentaire-vie',
  'video-virale','reunion-famille-pays','enfant-debuts-sport-combat','parents-premiere-fois',
  'nouveau-partenaire-celebre','engagement-associatif','visite-ecole-ancien-quartier','tatouage-nom-ville',
  'chante-hymne-match-foot','revient-reseaux','ouvre-salle','lance-marque-vetements','voyage-pelerinage',
  'reprend-emploi','grossesse-compagne','grossesse-annoncee','tourne-film-serie']);

/** Cycles d'absence qu'un moment impose à un combattant de Split disponible
 *  (mgmtAvailable lit f.susp). Les effets du catalogue qui supposent un
 *  système absent (agent, camps, argent personnel) restent en texte. */
const MGMT_VIE_ABSENCE={'naissance-enfant':1,'grossesse-annoncee':6,'deces-parent':1,
  'deces-frere-soeur':1,'enfant-malade':1,'operation-chirurgicale':4,'blessure-hors-cage':2,
  'depression-declaree':2,'blues-apres-combat':1,'garde-a-vue':1,'condamnation':3,
  'tourne-film-serie':1,'voyage-pelerinage':1,'coach-meurt':1,'bagarre-bar':1,
  'retourne-au-pays':2,'mois-de-jeune-camp':1,'probleme-visa':1};

/** Flux 'vie' d'un combattant à un cycle : séparé, sans RNG de partie. */
function mgmtVieStream(id,cycle,couche){
  return mulberry32(duelFnv1a32('mgmt-vie|'+String(id)+'|'+cycle+'|'+(couche||'moment')));
}

function mgmtVieMomentById(id){
  return MGMT_MOMENTS.find(x=>x.id===id)||null;
}

/** Moments tirables au hasard pour un combattant (sexe de la catégorie). */
function mgmtVieEligibles(f){
  const genre=(divById(f.div)||{}).gender;
  return MGMT_MOMENTS.filter(x=>!MGMT_VIE_CONTEXTUELS.has(x.id)
    &&!(x.id==='grossesse-annoncee'&&genre!=='F')&&!(x.id==='grossesse-compagne'&&genre==='F'));
}

/** Le moment qu'un combattant vit à un cycle donné, ou null. Pur. Les
 *  drames sont plus rares que les petites joies : poids de tirage 1 / poids. */
function mgmtVieMomentAt(f,cycle){
  if(!f||!Number.isSafeInteger(cycle)) return null;
  const r=mgmtVieStream(f.id,cycle);
  const p=MGMT_VIE_PAR_AN/(MGMT_EXT_YEAR_WEEKS/MGMT_EVENT_WEEKS);
  if(r()>=p) return null;
  const liste=mgmtVieEligibles(f);
  const total=liste.reduce((n,x)=>n+1/x.poids,0);
  let t=r()*total;
  for(const x of liste){ t-=1/x.poids; if(t<0) return x; }
  return liste[liste.length-1];
}

/** Les moments d'un combattant, du plus récent au plus ancien : [{c, moment}].
 *  Split : les faits gardés. Monde extérieur : dérivés de (id, cycle) depuis
 *  son entrée, sur les 40 derniers cycles. */
function mgmtVieDe(m,f){
  if(!m||!f) return [];
  const out=[];
  if((m.roster||[]).some(o=>o.id===f.id)){
    for(const x of m.facts||[]){
      if(x&&x.k==='moment_vie'&&x.a===f.id){
        const moment=mgmtVieMomentById(x.m);
        if(moment) out.push({c:x.c,moment});
      }
    }
  }else{
    const ligne=(m.exterieur||[]).find(o=>o.id===f.id);
    const debut=Math.max(0,m.cycle-40,ligne&&Number.isSafeInteger(ligne.born)?ligne.born:0);
    for(let c=debut;c<=m.cycle;c++){
      const moment=mgmtVieMomentAt(f,c);
      if(moment) out.push({c,moment});
    }
  }
  return out.sort((a,b)=>b.c-a.c);
}

/** Charge de l'année écoulée : somme des poids. Dérivée, jamais stockée ;
 *  `risque` ne retient que les moments non heureux (contrat §6.2).
 *  @returns {number} */
function mgmtVieCharge(m,f,cycle,risque){
  const fin=Number.isSafeInteger(cycle)?cycle:(m?m.cycle:0);
  let somme=0;
  for(const {c,moment} of mgmtVieDe(m,f)){
    if(c>fin||c<=fin-MGMT_VIE_FENETRE) continue;
    if(risque&&MGMT_VIE_HEUREUX.has(moment.id)) continue;
    somme+=moment.poids;
  }
  /* Lot 5 H7 : les décisions contraires du joueur (refus, promesse rompue,
     titre au sang-froid faible, jeûne imposé) pèsent aussi, et comptent
     dans le risque de blessure. */
  if(typeof mgmtContrarieCharge==='function'&&m&&Array.isArray(m.facts)&&(m.roster||[]).some(o=>o.id===f.id)){
    somme+=mgmtContrarieCharge(m,f,fin,MGMT_VIE_FENETRE);
  }
  return somme;
}

/** Les moments qu'un joueur peut lire : ceux que la presse ou le combattant
 *  relaie. Un moment sans relais reste privé (contrat §6.2). */
function mgmtVieRelayes(m,f){
  return mgmtVieDe(m,f).filter(x=>x.moment.relais.length>0);
}

/** Risque de blessure ajouté à un combat par la charge de l'année. 0 tant
 *  que le combattant n'est pas chargé : le combat d'avant est identique. */
function mgmtVieRisqueBlessure(m,f,cycle){
  const ch=mgmtVieCharge(m,f,cycle,true);
  return ch>MGMT_CHARGE_BORD?MGMT_VIE_RISQUE_BORD:(ch>MGMT_CHARGE_SEUIL?MGMT_VIE_RISQUE_CHARGE:0);
}

/** Forme en baisse (points de `dynamic`, ≤ 0) selon la charge. */
function mgmtVieFormeBaisse(m,f,cycle){
  const ch=mgmtVieCharge(m,f,cycle,true);
  return ch>MGMT_CHARGE_BORD?-MGMT_VIE_FORME_BORD:(ch>MGMT_CHARGE_SEUIL?-MGMT_VIE_FORME_CHARGE:0);
}

/** Ouverture d'un cycle (parties neuves seulement) : chaque combattant actif de Split vit, ou non, son
 *  moment ; le moment devient un fait gardé, et son absence éventuelle
 *  s'applique (jamais à un combattant déjà booké sur la carte). Un
 *  combattant au bord peut aussi être retiré un temps. Aucun tirage de la
 *  RNG du jeu. @returns {number} moments vécus ce cycle. */
function mgmtVieOuvreCycle(m){
  if(!m||!Array.isArray(m.roster)||!Number.isSafeInteger(m.cycle)) return 0;
  /* Une partie d'avant H4 (effectifs 0) garde son comportement : les moments
     de vie ne s'ouvrent que dans une partie neuve, comme les nouveaux effectifs. */
  if(m.effectifs!==1) return 0;
  let n=0;
  for(const f of m.roster){
    if(!f||f.retired) continue;
    const moment=mgmtVieMomentAt(f,m.cycle);
    const engage=mgmtEngaged(m,f);
    if(moment){
      mgmtAddFact(m,{c:m.cycle,k:'moment_vie',a:f.id,m:moment.id});
      n++;
      const absence=MGMT_VIE_ABSENCE[moment.id];
      if(absence&&!engage){
        f.susp=Math.max(Number.isSafeInteger(f.susp)?f.susp:0,m.cycle+absence-1);
      }
    }
    if(!engage&&mgmtVieCharge(m,f,m.cycle,true)>MGMT_CHARGE_BORD
      &&mgmtVieStream(f.id,m.cycle,'bord')()<MGMT_VIE_RETRAIT_BORD){
      f.susp=Math.max(Number.isSafeInteger(f.susp)?f.susp:0,m.cycle+MGMT_VIE_RETRAIT_CYCLES-1);
    }
  }
  return n;
}
/* ==== [FIN ANCRE] ==== */
