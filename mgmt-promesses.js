"use strict";
/* ==== [ANCRE: MGMT_LOT5_H7_PROMESSES] — Lot 5 H7, catalogue §8 : les traits
   cachés et leur mot, les demandes, les promesses, la loyauté, et les
   décisions contraires qui deviennent de la charge.

   - Les sept traits (discipline, ambition, loyauté, sang-froid, tempérament,
     exposition, fair-play) se déduisent de l'identifiant (mgmt-humanite.js) :
     le joueur n'en voit jamais un chiffre, seulement UN MOT.
   - Un combattant demande — la carte principale, un classé, une revanche.
     La demande est un fait ; la réponse (promettre, refuser) en est un autre.
   - Une promesse est un fait avec une échéance. Tenue, rompue, en cours : se
     LIT dans l'historique des combats, rien n'est stocké (règle du bureau).
   - La loyauté se dérive du trait et de ce que le joueur a fait : une promesse
     tenue la renforce, une promesse rompue ou un refus la ronge.
   - Les décisions contraires pèsent sur la charge (H5) : refus, promesse
     rompue, combat de titre d'un combattant au sang-froid faible, combat
     imposé pendant son jeûne. Poids de 10 à 30 (catalogue §8.2).
   Aucun texte d'auteur n'est écrit ici : les mots viennent du catalogue §8,
   les libellés de demande de §8.2 ; les étiquettes d'état sont fonctionnelles.
   Parties neuves seulement (comme H4, H5, H6). ==== */

/** Le mot d'un trait extrême — ceux que le catalogue §8.2 nomme. Un trait
 *  sans mot nommé (sang-froid, discipline basse…) ne se dit pas. */
const MGMT_TRAITS_MOTS={
  discipline:{haut:{texte:'Professionnel',relu:false}},
  ambition:{haut:{texte:'Carriériste',relu:false}},
  loyaute:{haut:{texte:'Fidèle',relu:false}},
  temperament:{bas:{texte:'Instable',relu:false}},
  exposition:{haut:{texte:'Grande gueule',relu:false},bas:{texte:'Discret',relu:false}},
  fairPlay:{haut:{texte:'Réglo',relu:false}},
};
/** Seuils (échelle 1 à 20) : un trait n'a de mot qu'à l'extrême. */
const MGMT_TRAIT_HAUT=16;
const MGMT_TRAIT_BAS=5;

/** Ce qu'un combattant peut demander (catalogue §8.2). */
const MGMT_DEMANDES={
  'carte-principale':{libelle:'La carte principale',relu:false},
  'un-classe':{libelle:'Un classé',relu:false},
  'revanche':{libelle:'Une revanche',relu:false},
  /* Lot 5 H10 (scénario n° 2, la trilogie) : « le troisième combat » du contrat §5. */
  'trilogie':{libelle:'Le troisième combat',relu:false},
  /* Lot 5 H10 (scénario n° 29, la descente aux enfers) : une pause se tient en NE bookant PAS. */
  'pause':{libelle:'Une pause',relu:false},
};
const MGMT_PROMESSE_CYCLES=3;
const MGMT_DEMANDE_EXPIRE=3;
const MGMT_DEMANDE_MAX_OUVERTES=2;
const MGMT_DEMANDE_PAR_CYCLE=0.02;
/** Poids (charge) des décisions contraires, de 10 à 30. */
const MGMT_CONTRARIE_REFUS=10;
const MGMT_CONTRARIE_ROMPUE=20;
const MGMT_CONTRARIE_TITRE=20;
const MGMT_CONTRARIE_JEUNE=15;
/** Loyauté : ce que valent les gestes du joueur (sur l'échelle 1 à 20). */
const MGMT_LOYAUTE_TENUE=3;
const MGMT_LOYAUTE_ROMPUE=-5;
const MGMT_LOYAUTE_REFUS=-2;
const MGMT_TITRE_SANGFROID_FAIBLE=6;

/* ---- Les traits ------------------------------------------------------ */

/** Un trait de 1 à 20, déduit de l'identifiant (même flux que mgmtIdentite). */
function mgmtTrait(f,cle){
  return 1+Math.floor(mgmtIdentiteStream(f.id,'trait-'+cle)()*20);
}

/** Lit l'historique du joueur avec ce combattant : promesses, refus. */
function mgmtGestes(m,f){
  const out={tenues:0,rompues:0,refus:0};
  for(const p of mgmtPromesses(m,f)){
    if(p.etat==='tenue') out.tenues++; else if(p.etat==='rompue') out.rompues++;
  }
  for(const x of m.facts||[]){ if(x&&x.k==='refus'&&x.a===f.id) out.refus++; }
  return out;
}

/** Loyauté dérivée (1 à 20) : le trait, plus ce que le joueur a fait. Jamais
 *  stockée ni affichée en chiffre. */
function mgmtLoyaute(m,f){
  const g=mgmtGestes(m,f);
  return clamp(mgmtTrait(f,'loyaute')+MGMT_LOYAUTE_TENUE*g.tenues+MGMT_LOYAUTE_ROMPUE*g.rompues+MGMT_LOYAUTE_REFUS*g.refus,1,20);
}

/** Le mot d'un combattant : son trait le plus extrême parmi ceux que le
 *  catalogue nomme (la loyauté lue après les gestes du joueur), ou null.
 *  @returns {string|null} */
function mgmtTraitMot(m,f){
  let meilleur=null;
  for(const cle of Object.keys(MGMT_TRAITS_MOTS)){
    const v=cle==='loyaute'?mgmtLoyaute(m,f):mgmtTrait(f,cle);
    const mots=MGMT_TRAITS_MOTS[cle];
    let mot=null;
    if(v>=MGMT_TRAIT_HAUT&&mots.haut) mot=mots.haut.texte;
    else if(v<=MGMT_TRAIT_BAS&&mots.bas) mot=mots.bas.texte;
    if(!mot) continue;
    const ecart=Math.abs(v-10.5);
    if(!meilleur||ecart>meilleur.ecart) meilleur={mot,ecart};
  }
  return meilleur?meilleur.mot:null;
}

/* ---- Les promesses : un fait, un état lu dans l'historique ----------- */

/** Les promesses d'un combattant avec leur état dérivé : 'tenue' (le combat
 *  promis s'est joué avant l'échéance), 'rompue' (l'échéance est passée),
 *  'en cours'. @returns {Array<{i:number,want:string,target:string|null,c:number,due:number,etat:string}>} */
function mgmtPromesses(m,f){
  const out=[];
  (m.facts||[]).forEach((x,i)=>{
    if(!x||x.k!=='promesse'||x.a!==f.id) return;
    const joue=(m.hist||[]).some(t=>t&&t.c>x.c&&t.c<=x.due
      &&(t.a.id===f.id||t.b.id===f.id)
      &&(x.want!=='carte-principale'||t.slot==='main')
      &&(!x.target||t.a.id===x.target||t.b.id===x.target));
    /* Une pause est tenue quand le combattant n'a pas combattu jusqu'à l'échéance, rompue s'il a combattu. */
    const etat=x.want==='pause'?(joue?'rompue':(m.cycle>x.due?'tenue':'en cours')):(joue?'tenue':(m.cycle>x.due?'rompue':'en cours'));
    out.push({i,want:x.want,target:x.target||null,c:x.c,due:x.due,etat});
  });
  return out;
}

/* ---- Les demandes ----------------------------------------------------- */

/** Les demandes sans réponse et pas encore périmées : [{i,a,want,target,c}]. */
function mgmtDemandesOuvertes(m){
  const rep=new Set();
  for(const x of m.facts||[]){ if((x.k==='promesse'||x.k==='refus')&&Number.isSafeInteger(x.d)) rep.add(x.d); }
  const out=[];
  (m.facts||[]).forEach((x,i)=>{
    if(!x||x.k!=='demande'||rep.has(i)||m.cycle-x.c>MGMT_DEMANDE_EXPIRE) return;
    const f=mgmtFighterById(m,x.a);
    if(!f||mgmtIsRetired(f)) return;
    out.push({i,a:x.a,want:x.want,target:x.target||null,c:x.c});
  });
  return out;
}

/** Les demandes qu'un combattant peut formuler, selon son état. */
function mgmtDemandesPossibles(m,f){
  const out=[];
  const ambition=mgmtTrait(f,'ambition');
  const rang=mgmtDivisionRank(m,f,'organization');
  const parmain=(m.hist||[]).some(t=>t&&t.slot==='main'&&t.c>m.cycle-4&&(t.a.id===f.id||t.b.id===f.id));
  if(ambition>=8&&rang!==null&&rang<=8&&!parmain) out.push({want:'carte-principale'});
  if(ambition>=10&&rang!==null&&rang>5){
    const tete=mgmtDivisionRanking(m,f.div,'organization').slice(0,5).filter(o=>o.id!==f.id);
    if(tete.length) out.push({want:'un-classe',cibles:tete.map(o=>o.id)});
  }
  const dernier=mgmtResultats(m,f)[0];
  if(dernier==='loss'){
    for(let i=m.hist.length-1;i>=0;i--){
      const t=m.hist[i];
      if(!t||t.c<m.cycle-6) break;
      const cote=t.a.id===f.id?'A':(t.b.id===f.id?'B':null);
      if(!cote) continue;
      const adv=(cote==='A'?t.b:t.a).id;
      if(t.winner!=='D'&&t.winner!==cote&&mgmtFighterById(m,adv)&&!mgmtIsRetired(mgmtFighterById(m,adv))){ out.push({want:'revanche',cibles:[adv]}); }
      break;
    }
  }
  return out;
}

/** Ouverture d'un cycle (parties neuves) : au plus une nouvelle demande, au
 *  plus deux ouvertes. Flux 'demande' semé par (id, cycle) — aucun tirage de
 *  la RNG du jeu. @returns {object|null} le fait posé. */
function mgmtDemandesOuvreCycle(m){
  if(!m||m.effectifs!==1||!Number.isSafeInteger(m.cycle)) return null;
  if(mgmtDemandesOuvertes(m).length>=MGMT_DEMANDE_MAX_OUVERTES) return null;
  const deja=new Set(mgmtDemandesOuvertes(m).map(d=>d.a));
  /* Lot 5 H10 : l'histoire impose d'abord — la revanche après une défaite
     humiliante, le troisième combat après une victoire partout. */
  if(typeof mgmtDemandesImposees==='function'){
    for(const imp of mgmtDemandesImposees(m)){
      const f=mgmtFighterById(m,imp.a);
      if(!f||f.retired||deja.has(f.id)||mgmtEngaged(m,f)) continue;
      if(mgmtPromesses(m,f).some(p=>p.etat==='en cours')) continue;
      if((m.facts||[]).some(x=>x&&x.k==='demande'&&x.a===imp.a&&x.want===imp.want&&(x.target||null)===(imp.target||null)&&m.cycle-x.c<=MGMT_DEMANDE_EXPIRE)) continue;
      /* Correctif du 06/10 : une demande sans cible (deuil, dernière danse, pause) n'écrit PAS
         target:null — la validation le refusait et la partie ne se rechargeait plus. */
      const fait={c:m.cycle,k:'demande',a:imp.a,want:imp.want,...(imp.target?{target:imp.target}:{})};
      mgmtAddFact(m,fait);
      return fait;
    }
  }
  let meilleur=null;
  for(const f of m.roster){
    if(!f||f.retired||deja.has(f.id)||mgmtEngaged(m,f)) continue;
    if(mgmtPromesses(m,f).some(p=>p.etat==='en cours')) continue;
    const r=mgmtIdentiteStream(f.id,'demande|'+m.cycle);
    const tirage=r();
    const p=MGMT_DEMANDE_PAR_CYCLE*(mgmtTrait(f,'ambition')/10)*(mgmtLoyaute(m,f)<=5?1.5:1);
    if(tirage>=p) continue;
    const possibles=mgmtDemandesPossibles(m,f);
    if(!possibles.length) continue;
    const choix=possibles[Math.floor(r()*possibles.length)];
    const cible=choix.cibles?choix.cibles[Math.floor(r()*choix.cibles.length)]:null;
    if(!meilleur||tirage<meilleur.tirage) meilleur={tirage,fait:{c:m.cycle,k:'demande',a:f.id,want:choix.want,...(cible?{target:cible}:{})}};
  }
  if(!meilleur) return null;
  mgmtAddFact(m,meilleur.fait);
  return meilleur.fait;
}

/** Répond à une demande : 'promettre' (échéance dans MGMT_PROMESSE_CYCLES
 *  cycles) ou 'refuser'. @returns {boolean} */
function mgmtRepondreDemande(m,i,reponse){
  const x=m&&m.facts&&m.facts[i];
  if(!x||x.k!=='demande'||!mgmtDemandesOuvertes(m).some(d=>d.i===i)) return false;
  if(reponse==='promettre'){
    mgmtAddFact(m,{c:m.cycle,k:'promesse',a:x.a,want:x.want,...(x.target?{target:x.target}:{}),due:m.cycle+MGMT_PROMESSE_CYCLES,d:i});
    return true;
  }
  if(reponse==='refuser'){ mgmtAddFact(m,{c:m.cycle,k:'refus',a:x.a,d:i}); return true; }
  return false;
}

/* ---- Les décisions contraires, en charge ----------------------------- */

/** Charge ajoutée par les décisions du joueur dans l'année : refus, promesses
 *  rompues (comptées à leur échéance), faits « contrarie ». */
function mgmtContrarieCharge(m,f,fin,fenetre){
  let somme=0;
  const dedans=c=>c<=fin&&c>fin-fenetre;
  for(const x of m.facts||[]){
    if(!x||x.a!==f.id) continue;
    if(x.k==='refus'&&dedans(x.c)) somme+=MGMT_CONTRARIE_REFUS;
    else if(x.k==='contrarie'&&dedans(x.c)) somme+=x.p;
  }
  for(const p of mgmtPromesses(m,f)){ if(p.etat==='rompue'&&dedans(p.due)) somme+=MGMT_CONTRARIE_ROMPUE; }
  return somme;
}

/** Après une soirée : le combat de titre d'un combattant au sang-froid faible
 *  et le combat imposé pendant son jeûne deviennent des moments pesants.
 *  @returns {number} faits posés. */
function mgmtContrariesApresSoiree(m,combats){
  if(!m||m.effectifs!==1||!Array.isArray(combats)) return 0;
  let n=0;
  for(const t of combats){
    /* Lot 5 T7 (scénario n° 3, le coéquipier) : booker deux combattants du même camp l'un contre l'autre. */
    if(typeof mgmtMemeCamp==='function'){
      const fa=mgmtFighterById(m,t.a.id), fb=mgmtFighterById(m,t.b.id);
      if(fa&&fb&&mgmtMemeCamp(m,fa,fb)){
        for(const id of [t.a.id,t.b.id]){ mgmtAddFact(m,{c:t.c,k:'contrarie',a:id,p:MGMT_CONTRARIE_COEQUIPIER,why:'coequipier'}); n++; }
      }
    }
    /* Lot 5 H10 (scénario n° 23, la fratrie) : des frères et sœurs ne se combattent jamais. */
    if(typeof mgmtFratrie==='function'){
      const fa=mgmtFighterById(m,t.a.id);
      if(fa&&mgmtFratrie(m,fa).includes(t.b.id)){
        for(const id of [t.a.id,t.b.id]){ mgmtAddFact(m,{c:t.c,k:'contrarie',a:id,p:MGMT_CONTRARIE_FRATRIE,why:'fratrie'}); n++; }
      }
    }
    for(const id of [t.a.id,t.b.id]){
      const f=mgmtFighterById(m,id);
      if(!f) continue;
      if(t.rounds===5&&mgmtTrait(f,'sangFroid')<=MGMT_TITRE_SANGFROID_FAIBLE){
        mgmtAddFact(m,{c:t.c,k:'contrarie',a:id,p:MGMT_CONTRARIE_TITRE,why:'titre'}); n++;
      }
      if((m.facts||[]).some(x=>x&&x.k==='moment_vie'&&x.a===id&&x.m==='mois-de-jeune-camp'&&x.c>=t.c-1&&x.c<=t.c)){
        mgmtAddFact(m,{c:t.c,k:'contrarie',a:id,p:MGMT_CONTRARIE_JEUNE,why:'jeune'}); n++;
      }
    }
  }
  return n;
}
/* ==== [FIN ANCRE] ==== */
