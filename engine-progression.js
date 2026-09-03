"use strict";
/* CAGE LEGACY — js/engine-progression.js
   Extrait d'engine.js (chantier 4 : refactorisation progressive du moteur).
   Regroupe les responsabilites "progression du combattant" : vieillissement
   et declin (isDeclining/isHeavy/applyAging), blessures (INJURY_TYPES/
   rollInjury), fraicheur (freshnessTier), deltas d'entrainement bornes
   (softCapDelta/convertZeroGain/applyDeltas), catalogue de competences
   (tirerRarete/skillHasEffect/poolEligible/grantSkill/rollSkill),
   epithetes de fin de carriere (epithets), et le moteur de texte contextuel
   (TEXT_POOLS/registerTextPool/txtPick).

   Deplace a l'IDENTIQUE depuis engine.js : memes noms de fonctions, memes
   signatures, memes ancres ANCRE:/FIN ANCRE, comportement strictement
   inchange. Scope global classique (pas d'import/export) : depend des
   primitives d'engine.js (rnd/pick/clamp/num/ATTR_KEYS/TRAINABLE/CHIN/
   eff/overall...) et de SKILLS (data-skills.js, charge avant engine.js),
   donc CHARGE JUSTE APRES engine.js dans index.html — jamais avant lui,
   jamais apres state.js/ui-*.js qui appellent ces fonctions (makeFighter,
   pickFinishMove, executeCampTier... restes dans engine.js/engine-events.js
   les appellent au runtime, apres chargement complet de tous les scripts). */

/* ==== [ANCRE: V2-39] — levier 2/3 des "+5 combats sur une carrière
   complète" : le pic avant déclin s'allonge d'environ un an (36/38 →
   37/39). Les leviers 1 (bande de combats/an élargie, RI(1,4) vétéran)
   et 3 (durée de contrat dépendante de la réputation, fightsByRep
   ci-dessous dans generateContract()) existaient déjà avant ce lot,
   posés par un correctif antérieur à ce document (CORRECTIF_DUREE_
   CARRIERE / DUREE_CONTRAT_REPUTATION) — seul le déclin restait à
   toucher. Validation : sim_v39_careers.js (script jetable, résultats
   dans le message de commit). ==== */
function isDeclining(f){ return f.age>=(isHeavy(f)?39:37); }
function isHeavy(f){ return f.div==='H-heavy'||f.div==='H-lheavy'; }
function applyAging(f){ const A=f.age; const declineLog=[];
  if(isDeclining(f)){ // déclin, poids lourds plus tardif
    // ==== [ANCRE: NOTIF_DECLIN_VIEILLESSE] — item demandé : toute baisse
    // d'attribut doit venir UNIQUEMENT du vieillissement, d'un choix de
    // Classe, ou du menton — jamais d'une compétence ou d'un entraînement
    // (déjà le cas : audité, aucune compétence n'a de fx négatif, aucun
    // entraînement ne baisse un attribut réel, seuls morale/forme le font).
    // Ce qui manquait : (1) prévenir clairement le joueur quand LE
    // VIEILLISSEMENT fait baisser un attribut, et (2) empêcher qu'une
    // compétence ou un entraînement ultérieur ne fasse remonter un attribut
    // au-delà du plafond qu'il vient d'atteindre par le déclin — sinon le
    // déclin serait cosmétique. f.agedCeilings[k] fige ce nouveau plafond,
    // lu par applyDeltas()/grantSkill() en plus du potentiel habituel.
    /* ==== [ANCRE: V2-39] — "déclin plus progressif" : les 3 premières
       années après l'entrée en déclin restent douces (RI(0,1)), le rythme
       antérieur (RI(0,2)) ne reprend qu'ensuite — un pic étiré ne sert à
       rien si la chute qui suit est aussi brutale qu'avant. */
    const yearsIntoDecline=A-(isHeavy(f)?39:37);
    const declineCap=yearsIntoDecline<3?1:2;
    const dec=k=>{ const before=f.attrs[k]; const after=clamp(before-RI(0,declineCap),1,100);
      if(after<before){ f.attrs[k]=after; declineLog.push({key:k,label:attrLabel(k),before,after});
        if(!f.agedCeilings) f.agedCeilings={}; f.agedCeilings[k]=after; }
    };
    dec('footSpeed');dec('handSpeed');dec('cardio');dec('explosiveness'); if(A>=39){dec('power');dec('recovery');}
    const chinBefore=f.attrs.chin, chinAfter=clamp(chinBefore-(A>=38?RI(0,declineCap):0),1,100);
    if(chinAfter<chinBefore){ f.attrs.chin=chinAfter; declineLog.push({key:'chin',label:attrLabel('chin'),before:chinBefore,after:chinAfter});
      if(!f.agedCeilings) f.agedCeilings={}; f.agedCeilings.chin=chinAfter; }
    if(rnd()<0.3) f.morale=clamp(f.morale-5,0,100); // voir ses capacités chuter mine le moral
  } else if(A>=27){ /* pic : stable */ }
  f.age++; f.overall=overall(f);
  if(declineLog.length){ f.lastAgingDecline={age:f.age,items:declineLog}; }
  return declineLog;
}
/* ------------------ INFIRMERIE — catalogue de blessures ---------------- */
const INJURY_TYPES=[
 {name:'Déchirure ligamentaire (genou)',fights:5},
 {name:'Fracture orbitale',fights:4},
 {name:'Fracture de la main',fights:3},
 {name:'Commotion cérébrale sévère',fights:3},
 {name:'Entorse grave à la cheville',fights:2},
];
function rollInjury(){ return pick(INJURY_TYPES); }
/* ==== [ANCRE: V2-11] — Fraîcheur : jauge interne (0-100, jamais affichée en
   chiffre) qui borne combien de sparring/stages un combattant Faith peut
   enchaîner avant que le corps ne dise stop. Cinq paliers qualitatifs,
   seul le libellé est montré (règle FA-21 : jamais de % ni de nombre brut
   dans l'interface). f.freshness vit sur le combattant Faith (ui-08 : init
   à la création, consommée par faithSparring()/faithCamp(), restaurée par
   faithRest() et par le simple écoulement des mois, faithAdvanceMonth()). */
function freshnessTier(f){
  const v=(f && f.freshness!=null)?f.freshness:80;
  if(v>=80) return {tier:'affute',label:'Affûté'};
  if(v>=55) return {tier:'pret',label:'Prêt'};
  if(v>=30) return {tier:'emousse',label:'Émoussé'};
  if(v>=12) return {tier:'vide',label:'Vidé'};
  return {tier:'about',label:'À bout'};
}
/* progression BORNÉE : un choix applique un delta net d'attributs ( up/down),
   plafonné par le potentiel — pas d'amélioration infinie. */
/* ==== [ANCRE: V2-36] — règle 7 (jamais de récompense nulle) : un gain
   plafonné (attribut déjà au maximum) sortait de applyDeltas() sans
   laisser AUCUNE trace (real===0 => rien poussé dans `applied`) — l'écran
   qui affiche le résultat n'avait donc rien à montrer, et le joueur
   voyait parfois "10 -> 10" ou rien du tout selon l'écran, sans jamais
   savoir qu'un gain avait bien été TENTÉ. Convertit un gain plafonné en
   un point sur un attribut voisin de la même famille (ATTR.tech/ment/
   phys) s'il en reste un non plafonné, sinon en un petit bonus d'argent
   — jamais silencieux, toujours annoncé (converted:true, lu par les
   écrans qui affichent `applied`). ==== */
function attrFamilyOf(statKey){
  if(ATTR.tech.some(a=>a[0]===statKey)) return ATTR.tech;
  if(ATTR.ment.some(a=>a[0]===statKey)) return ATTR.ment;
  if(ATTR.phys.some(a=>a[0]===statKey)) return ATTR.phys;
  return null;
}
function convertZeroGain(f,statKey){
  const fam=attrFamilyOf(statKey);
  if(fam){
    for(const [nk] of fam){
      if(nk===statKey || f.attrs[nk]===undefined) continue;
      // Même logique que skillHasEffect() (V3_DIMINISHING_RETURNS) : le seuil
      // de potentiel n'est plus un mur, seul le déclin par l'âge (ou 100) l'est.
      const cap=(f.agedCeilings && f.agedCeilings[nk]!=null)?f.agedCeilings[nk]:100;
      const before=f.attrs[nk];
      if(before<cap){
        const after=clamp(Math.min(before+1,cap),1,100);
        if(after>before){ f.attrs[nk]=after;
          return {key:nk,label:attrLabel(nk),delta:after-before,before,after,converted:true,fromLabel:attrLabel(statKey)};
        }
      }
    }
  }
  f.earnings=(f.earnings||0)+2;
  return {key:null,label:null,delta:0,converted:true,money:2,fromLabel:attrLabel(statKey)};
}
/* ==== [ANCRE: V3_DIMINISHING_RETURNS] — Plan V3 LOT 7 §5.7.3/P17 : "Pas de
   palier minimum ou maximum […] Si le combattant a la chance d'avoir les
   bonnes compétences, fait les bons camps d'entraînement, les bons choix,
   il peut devenir le meilleur combattant de l'histoire." Le plafond dur de
   potentiel (f.potential+4 / f.maxAttrs[k], ci-dessous jusqu'à ce lot)
   remplacé par un rendement décroissant : EN DESSOUS du seuil, la
   progression est strictement inchangée (aucune régression de contenu) ;
   AU-DESSUS, chaque gain est réduit selon l'écart déjà creusé au-delà du
   seuil — 90→95 coûte beaucoup plus que 50→55, mais reste possible, sans
   jamais s'arrêter net. Le plafond de déclin par l'âge (f.agedCeilings,
   ANCRE PLAFOND_DECLIN_VIEILLESSE, juste en dessous) N'EST PAS concerné —
   "le déclin par l'âge reste" (spec, point 4) : lui seul demeure un mur
   dur, un choix narratif assumé (le corps vieillit, l'entraînement seul ne
   défait jamais ça), pas une limite arbitraire de potentiel. */
function softCapDelta(before,dv,ceiling){
  if(dv<=0) return before+dv;
  if(before<ceiling) return before+dv;
  const overshoot=before-ceiling;
  const factor=Math.max(0.05,1/(1+overshoot*0.5));
  return before+dv*factor;
}
/* ==== [FIN ANCRE] ==== */
function applyDeltas(f,deltas){ const applied=[]; for(const [k,dv] of deltas){
    if(k==='morale'){ f.morale=clamp(f.morale+dv,0,100); applied.push(['Moral',dv]); continue; }
    if(k==='form'){ f.form=clamp(f.form+dv,0,100); applied.push(['Forme',dv]); continue; }
    const before=f.attrs[k]; let after=before+dv;
    // Rendement décroissant au-delà du seuil de potentiel (V3_DIMINISHING_RETURNS
    // ci-dessus) — plus de mur dur : la valeur déjà acquise n'est jamais reprise,
    // mais la progression au-delà ralentit au lieu de s'arrêter.
    if(dv>0) after=softCapDelta(before,dv,(f.maxAttrs && f.maxAttrs[k]!=null) ? f.maxAttrs[k] : f.potential+4);
    // ==== [ANCRE: PLAFOND_DECLIN_VIEILLESSE] — item demandé : un attribut
    // rabaissé par le vieillissement (f.agedCeilings, cf. applyAging) ne peut
    // plus jamais être remonté par un entraînement au-delà de ce plafond —
    // sinon le déclin lié à l'âge serait annulable, ce qui n'a pas de sens.
    if(dv>0 && f.agedCeilings && f.agedCeilings[k]!=null) after=Math.min(after, Math.max(before, f.agedCeilings[k]));
    f.attrs[k]=clamp(after,1,100); const real=Math.round(f.attrs[k]-before);
    if(real!==0) applied.push({key:k,label:attrLabel(k),delta:real,before,after:f.attrs[k]});
    else if(dv>0) applied.push(convertZeroGain(f,k));
  } f.overall=overall(f); return applied;
}
/* ==== [ANCRE: TIRAGE] — moteur de compétences en deux temps (plan §6/§18).
   Corrigé par rapport à la version brute reçue : les attributs vivent dans
   f.attrs (pas f.stats), le pays est f.countryKey (pas f.country), et le
   générateur aléatoire doit être rnd() (seedé, reproductible) et non
   Math.random(). Bornes /1-100 et recalcul de l'overall ajoutés, comme le
   faisait l'ancien rollSkill(). ==== */
const SKILL_CONSTANTS = {
  // Taux de tirage augmenté (item demandé : ~10 compétences par partie en
  // moyenne, contre ~8 auparavant) et plafond de carrière relevé en
  // conséquence (9 → 10).
  BASE_RATE: 0.12, DROUGHT_INC: 0.012,
  // ==== [ANCRE: CORRECTIF_BAISSE_RARETE_HAUT_TIER] — item demandé : retour
  // en arrière sur RARETE_BOOST_HAUT_TIER (trop de E/L/M en jeu), puis
  // ajustement fin demandé explicitement : Mythique à 0.12% (0.0012) et
  // Légendaire à 4.5% pile. Épique laissé à 10% (valeur pré-boost déjà
  // posée juste avant), Commune/Rare réajustés en proportion pour combler
  // les 85.5 points restants.
  MYTHIC_CHANCE: 0.0012,
  MAX_CAREER_SKILLS: 10, AGE_META: 34,
};
function tirerRarete(){ const roll=rnd()*100;
  if(roll<55.5) return 'C'; if(roll<85.5) return 'R'; if(roll<95.5) return 'E'; return 'L';
}
// ==== [ANCRE: SKILL_SANS_EFFET] — bug remonté : une compétence pouvait être
// tirée alors que TOUS les attributs qu'elle affecte étaient déjà à leur
// plafond (potentiel/maxAttrs/agedCeilings) — le gain réel valait alors 0,
// rendant la compétence inutile. Même formule de plafond que grantSkill().
function skillHasEffect(f, s){
  if(!s.fx) return true;
  return Object.keys(s.fx).some(stat=>{
    const dv=s.fx[stat];
    if(dv<=0 || !f.attrs || f.attrs[stat]===undefined) return true;
    /* ==== [CORRECTIF V3_DIMINISHING_RETURNS] — le seuil de potentiel n'est
       plus un mur (cf. softCapDelta, engine.js) : une compétence garde un
       effet réel tant que l'attribut n'a pas atteint son SEUL vrai plafond
       restant, le déclin par l'âge (agedCeilings) ou 100 à défaut. Un
       rendement décroissant très faible reste un gain non nul — jamais
       "sans effet" tant que la marge existe. ==== */
    const cap=(f.agedCeilings && f.agedCeilings[stat]!=null) ? f.agedCeilings[stat] : 100;
    return f.attrs[stat] < cap;
  });
}
function poolEligible(f, isEndOfCareer, isCapped){
  return SKILLS.filter(s=>{
    if(f.skills && f.skills.includes(s.id)) return false;
    if(s.fam==='gen') return false;                 // jamais tiré en carrière, seulement à la création
    if(!skillHasEffect(f, s)) return false;
    if(s.fam==='meta') return isEndOfCareer;
    if(isCapped) return false;
    if(s.fam==='style' && s.key===f.style) return true;
    if(s.fam==='country' && s.key===f.countryKey) return true;
    return false;
  });
}
function getFallbackSkill(pool, baseRarity){ const hierarchy=['L','E','R','C'];
  let startIndex=hierarchy.indexOf(baseRarity); if(startIndex===-1) startIndex=0;
  for(let i=startIndex;i<hierarchy.length;i++){ const available=pool.filter(s=>s.rar===hierarchy[i]);
    if(available.length>0) return available[Math.floor(rnd()*available.length)]; }
  return null;
}
function grantSkill(f, skill){ if(!f.skills) f.skills=[]; f.skills.push(skill.id);
  // ==== [ANCRE: CAP_COMPETENCE_ATTRIBUT] — bug remonté : une compétence
  // pouvait faire dépasser le plafond de potentiel d'un attribut (borne déjà
  // appliquée pour toute PROGRESSION normale via applyDeltas, mais absente
  // ici). Même règle : un gain positif ne peut jamais dépasser le potentiel
  // (ou maxAttrs si défini), mais ne redescend jamais une valeur déjà acquise
  // au-dessus de ce plafond (ex. via une autre compétence antérieure).
  // ==== [ANCRE: CORRECTIF_DELTA_AFFICHE_COMPETENCE] — bug remonté : l'écran
  // "Compétence débloquée" recalculait le "avant" en faisant after-fx[stat],
  // en supposant que le delta nominal du fx avait été appliqué intégralement.
  // Or juste au-dessus, ce gain est clampé au plafond : si le clamp a réduit
  // le delta réel, l'"avant" recalculé était faux (trop bas), affichant un
  // gain gonflé qui n'a jamais eu lieu. On capture ici le VRAI "avant" par
  // stat (avant tout clamp) dans _realBefore, attaché à une COPIE renvoyée
  // (jamais à l'objet SKILLS partagé, qui resterait alors pollué pour tous
  // les futurs tirages/combattants).
  const realBefore={};
  if(skill.fx){ for(const stat in skill.fx){ if(f.attrs && f.attrs[stat]!==undefined){
    const dv=skill.fx[stat]; const before=f.attrs[stat]; realBefore[stat]=before; let after=before+dv;
    // Même rendement décroissant qu'applyDeltas() (ANCRE V3_DIMINISHING_RETURNS,
    // engine.js) — une compétence ne doit pas contourner la règle que suit
    // tout le reste de la progression.
    if(dv>0) after=softCapDelta(before,dv,(f.maxAttrs && f.maxAttrs[stat]!=null) ? f.maxAttrs[stat] : f.potential+4);
    if(dv>0 && f.agedCeilings && f.agedCeilings[stat]!=null) after=Math.min(after, Math.max(before, f.agedCeilings[stat]));
    f.attrs[stat]=clamp(after,1,100);
  } } }
  if(typeof applySynergyBuffs==='function') applySynergyBuffs(f);
  f.overall=overall(f);
  return Object.keys(realBefore).length ? Object.assign({},skill,{_realBefore:realBefore}) : skill;
}
function rollSkill(f){
  if(!f._drought) f._drought=0; if(!f.skills) f.skills=[];
  let careerCount=0, hasMythic=false;
  f.skills.forEach(skillId=>{ const s=SKILLS.find(x=>x.id===skillId); if(s){ if(s.fam==='style'||s.fam==='country') careerCount++; if(s.rar==='M') hasMythic=true; } });
  const isCapped=careerCount>=SKILL_CONSTANTS.MAX_CAREER_SKILLS;
  const isEndOfCareer=(f.age>=SKILL_CONSTANTS.AGE_META);
  // 1) Jet Mythique — entièrement séparé, testé à CHAQUE combat, indépendant
  //    du plafond et de la sécheresse (sinon il ne se déclenche presque jamais,
  //    comme observé lors des tests : 0% au lieu des ~4%/carrière visés).
  if(!hasMythic && rnd()<SKILL_CONSTANTS.MYTHIC_CHANCE){
    const mythics=SKILLS.filter(s=>s.rar==='M' && s.fam==='style' && s.key===f.style && !(f.skills||[]).includes(s.id) && skillHasEffect(f, s));
    if(mythics.length>0) return grantSkill(f, mythics[Math.floor(rnd()*mythics.length)]);
  }
  // 2) Pool éligible pour le tirage normal (style/pays/méta selon contexte)
  const pool=poolEligible(f, isEndOfCareer, isCapped);
  if(pool.length===0) return null;
  const unlockChance=SKILL_CONSTANTS.BASE_RATE + (f._drought*SKILL_CONSTANTS.DROUGHT_INC);
  if(rnd()>unlockChance){ f._drought++; return null; }
  /* ==== [ANCRE: CORRECTIF_DROUGHT_ATTRIBUTION_CONFIRMEE] — bug trouvé : la
     disette était remise à zéro dès que ce jet réussissait, avant même de
     savoir si une compétence serait réellement accordée. isCapped (plafond
     de compétences de carrière atteint) ou un pool sans skill correspondant
     à la rareté tirée (finalSkill null) pouvaient donc consommer toute la
     disette accumulée sans jamais rien accorder au joueur. Remise à zéro
     déplacée juste avant chaque retour de grantSkill() réussi. ==== */
  if(isEndOfCareer){ const metaPool=pool.filter(s=>s.fam==='meta');
    if(metaPool.length>0 && rnd()<0.25){ f._drought=0; return grantSkill(f, metaPool[Math.floor(rnd()*metaPool.length)]); } }
  if(isCapped) return null;
  const rarityDrawn=tirerRarete(); const finalSkill=getFallbackSkill(pool, rarityDrawn);
  if(finalSkill){ f._drought=0; return grantSkill(f, finalSkill); }
  return null;
}
/* ==== [FIN ANCRE] ==== */
/* épithètes de fin de carrière (uniques, certains liés à la catégorie) */
function epithets(f){ const e=[]; const fights=f.W+f.L+f.D; const wr=f.W/Math.max(1,fights);
  if(f.ko>=12)e.push('Machine à KO'); if(f.sub>=12)e.push('Le chasseur de cou');
  if(f.titles>=1&&f.L===0)e.push('L\u2019Invaincu'); if(f.defenses>=5)e.push('Le monarque');
  if(f.attrs.power>=92&&/plume|paille|mouche|coq/i.test(f.divName))e.push('Le Ngannou des petits gabarits');
  if(f.skills.includes('bjj29'))e.push('L\u2019Anaconda'); if(f.skills.includes('bjj36'))e.push('Le Tordeur');
  if(f.morale>=85&&f.titles>=1)e.push('Le favori du public'); if(wr>=0.85&&fights>=15)e.push('Le prodige');
  if(f.koLoss>=6)e.push('La guerre l\u2019a marqué'); if(!e.length)e.push('L\u2019artisan de la cage');
  return e;
}

/* ==== [ANCRE: TEXT_ENGINE] — Plan V3 LOT 0 §4.2. Moteur de tirage contextuel
   générique : une chaîne visible n'est plus « la même à chaque combat » mais
   un pool d'entrées {id, text, req(ctx), weight, tier} filtré par le contexte
   courant et protégé d'une répétition rapprochée par un carnet persistant
   (F.textLedger). N'ATTEND PAS que les pools existants (data-faith-content.js)
   soient déjà au format {req,weight,tier} — ils restent de simples tableaux
   de chaînes pour l'instant, migrés lot par lot (LOT 4/5/6/7, chacun sur ses
   propres écrans) ; TEXT_POOLS n'accueille QUE les pools déjà migrés. Une
   entrée sans `req` est valide (silencieusement toujours éligible) mais
   `tools/lint-content.js` (§6.3) l'interdira dans les pools à haute
   fréquence — ce n'est pas au moteur de le refuser à l'exécution. */
const TEXT_POOLS={};
/** @param {string} poolId @param {{id:string,text:string,req?:(ctx:object)=>boolean,weight?:number,tier?:string}[]} entries */
function registerTextPool(poolId,entries){ TEXT_POOLS[poolId]=entries||[]; }
function ensureTextLedger(F){
  if(!F) return null;
  if(!F.textLedger||typeof F.textLedger!=='object') F.textLedger={};
  return F.textLedger;
}
/** Tire une entrée d'un pool enregistré, filtrée par ctx.req/tier, pondérée
 *  par weight, et jamais identique à une des dernières tirées de ce pool
 *  (fenêtre = min(8, taille du pool / 3), §4.2). Retourne '' si le pool est
 *  vide ou inconnu — jamais d'exception, jamais de texte fabriqué. */
function txtPick(poolId,ctx){
  ctx=ctx||{};
  const pool=TEXT_POOLS[poolId];
  if(!pool||!pool.length) return '';
  let elig=pool.filter(e=>(!e.req||e.req(ctx)) && (!e.tier||!ctx.rankTier||e.tier===ctx.rankTier));
  if(!elig.length) elig=pool.filter(e=>!e.req); // repli : au moins les entrées sans condition, jamais un pool vide
  if(!elig.length) elig=pool; // dernier repli : mieux vaut une redite qu'une chaîne vide
  /* ==== [CORRECTIF V2-32ter] — ledgerKey optionnel (repli sur poolId) :
     un même pool tiré plusieurs fois par écran pour des sous-catégories
     disjointes (ex. faith_pressconf_posture, une entrée par tier) partageait
     une seule fenêtre anti-répétition pour les trois tiers — au bout de deux
     conférences les 5 entrées d'un tier pouvaient toutes être "récentes" et
     le repli ci-dessous annulait tout l'effet. Un ledgerKey par tier isole
     la fenêtre de chaque sous-catégorie sans toucher au comportement des
     appelants qui ne le fournissent pas. ==== */
  const ledgerKey=ctx.ledgerKey||poolId;
  const ledger=ctx.F?ensureTextLedger(ctx.F):null;
  const recent=ledger&&ledger[ledgerKey]?ledger[ledgerKey]:[];
  const window=Math.min(8,Math.max(1,Math.floor(pool.length/3)));
  let candidates=elig.filter(e=>!recent.includes(e.id));
  if(!candidates.length) candidates=elig; // tout le pool éligible a déjà été vu récemment : on retire quand même plutôt que de bloquer
  const totalWeight=candidates.reduce((s,e)=>s+(e.weight||1),0);
  let roll=rnd()*totalWeight, chosen=candidates[0];
  for(const e of candidates){ roll-=(e.weight||1); if(roll<=0){ chosen=e; break; } }
  if(ledger){
    if(!ledger[ledgerKey]) ledger[ledgerKey]=[];
    ledger[ledgerKey].push(chosen.id);
    while(ledger[ledgerKey].length>window) ledger[ledgerKey].shift();
  }
  /* ==== [ANCRE: TEXT_ENGINE_INTERPOLATION] — Plan V3 LOT 5 : "toute phrase
     fréquente doit consommer >=1 jeton de contexte" (§4.2). `text` peut
     être une fonction (ctx)=>string plutôt qu'une chaîne figée — c'est
     elle qui permet à un pool de rester générique (un seul id ledger,
     dédupliqué normalement) tout en nommant l'adversaire réel, son
     palmarès, etc. à chaque tirage. Chaînes figées toujours acceptées,
     inchangé pour les pools déjà écrits ainsi (LOT 0). ==== */
  return typeof chosen.text==='function'?chosen.text(ctx):chosen.text;
}
/* ==== [FIN ANCRE] ==== */

