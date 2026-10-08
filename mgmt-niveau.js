"use strict";
/* ==== [ANCRE: MGMT_BRIEF_LOT2_NIVEAU] — Brief du 06/10/2026, lot 2 : un niveau
   propre à chaque combattant. Jusqu'ici un combattant de Split n'avait pas de
   niveau à lui : mgmtCombatProfile le recalculait à chaque combat à partir de
   son ratio de victoires (mgmtLevelForRecord, borné 40-80) — un espoir à 3-0
   valait un champion, un vétéran à 50 % tombait au plancher, le camp ne
   faisait progresser personne.
   Maintenant, pour une partie à niveaux (m.niveaux===1), chaque ligne porte
   TROIS valeurs stockées :
   - niv : son niveau actuel (40 à 80, l'échelle du profil de combat) ;
   - pot : son potentiel, que le niveau vise avant le pic ;
   - pic : l'âge de son pic.
   La loi d'évolution : avant le pic le niveau monte vers le potentiel (à chaque
   combat et à chaque anniversaire, le camp accélérant ou freinant), après le pic
   il décline avec l'âge ; une défaite ne coûte jamais qu'un point. Le palmarès
   est une CONSÉQUENCE : à la création on tire d'abord le niveau, puis un bilan
   cohérent avec lui — mais gonflé ou dégonflé par ce que l'organisation
   d'origine valait. Aucun chiffre de niveau n'est jamais affiché.
   Tout se tire sur le flux d'identité de la ligne (mgmtIdentiteStream), jamais
   sur la RNG de la partie. La trace d'un combat enregistre le niveau d'AVANT le
   combat (mgmtTraceSide) : le rejeu retrouve le même combat ; les traces
   d'avant le lot n'en portent pas et gardent l'ancienne loi.
   Décisions ouvertes (brief, « À trancher », lot 2) : l'âge de pic est tiré par
   combattant (26 à 30 ans), le même flux pour toutes les catégories — à dire si
   la catégorie ou le style doit le changer ; la part de palmarès gonflés est
   celle de MGMT_NIV_BIAIS_*. ==== */

const MGMT_NIV_MIN=40;
const MGMT_NIV_MAX=80;
/** L'âge de pic : de 26 à 30 ans. */
const MGMT_NIV_PIC_MIN=26;
const MGMT_NIV_PIC_SPREAD=5;
/** Le potentiel : de 50 à 80, tiré en moyenne de trois flux (la plupart des combattants au milieu). */
const MGMT_NIV_POT_MIN=50;
const MGMT_NIV_POT_MAX=80;
/** Avant le pic : part de l'écart au potentiel gagnée à chaque combat (au plus MGMT_NIV_COMBAT_MAX points)
 *  et à chaque anniversaire (au plus MGMT_NIV_AN_MAX). */
const MGMT_NIV_PART_COMBAT=0.14;
const MGMT_NIV_COMBAT_MAX=3.5;
const MGMT_NIV_PART_AN=0.10;
const MGMT_NIV_AN_MAX=2;
/** Une défaite ne coûte jamais plus de ce nombre de points. */
const MGMT_NIV_DEFAITE=1;
/** Après le pic, le déclin ne commence qu'à pic + ce nombre d'années, puis MGMT_NIV_DECLIN points par an. */
const MGMT_NIV_DECLIN_DELAI=3;
const MGMT_NIV_DECLIN=1.2;
/** Le camp change la progression d'avant le pic d'au plus cette part (qualité −1, 0 ou +1). */
const MGMT_NIV_CAMP=0.2;
/** Le biais du palmarès : un combattant dont le bilan vient d'une organisation plus faible (gonflé) ou plus
 *  forte (dégonflé) que ce qu'il vaut. Biais = (u − PART_BAS) × ETENDUE, en points de niveau. */
const MGMT_NIV_BIAIS_BAS=0.45;
const MGMT_NIV_BIAIS_ETENDUE=26;
/** La rouille : après tant de cycles sans combat, une baisse passagère de forme (points de dynamique), au plus
 *  MGMT_NIV_ROUILLE_MAX, effacée au combat suivant (le lot 9 y branche ses paliers d'attente). */
const MGMT_NIV_ROUILLE_DELAI=12;
const MGMT_NIV_ROUILLE_PAR_CYCLE=0.5;
const MGMT_NIV_ROUILLE_MAX=5;

function mgmtNivFlux(id,couche){ return mgmtIdentiteStream(id,'niv-'+couche); }
const mgmtNivRond=x=>Math.round(x*10)/10;
const mgmtNivBorne=x=>clamp(x,MGMT_NIV_MIN,MGMT_NIV_MAX);

/** Une partie porte-t-elle des niveaux propres ? */
function mgmtNiveaux(m){ return !!m&&m.niveaux===1; }

/** L'âge de pic d'un combattant : déduit de son identifiant. @returns {number} */
function mgmtNivPic(id){
  return MGMT_NIV_PIC_MIN+Math.floor(mgmtNivFlux(id,'pic')()*MGMT_NIV_PIC_SPREAD);
}

/** Le niveau d'un combattant d'âge donné qui a un potentiel et un pic : monte jusqu'au pic (de plus en plus
 *  haut, du plancher vers le potentiel), puis décline. Pur. */
function mgmtNivALage(id,age,pot,pic){
  if(age<pic){
    const k=1.5+mgmtNivFlux(id,'pente')()*2;
    return mgmtNivRond(mgmtNivBorne(pot-(pic-age)*k));
  }
  return mgmtNivRond(mgmtNivBorne(pot-Math.max(0,age-pic-MGMT_NIV_DECLIN_DELAI)*MGMT_NIV_DECLIN));
}

/** Le tirage d'un combattant à sa création : pic, potentiel, niveau actuel. Pur, déduit de l'identifiant.
 *  @returns {{niv:number,pot:number,pic:number}} */
function mgmtNiveauTire(id,age){
  const pic=mgmtNivPic(id);
  const f=mgmtNivFlux(id,'pot');
  const moy=(f()+f()+f())/3;
  const pot=Math.round(MGMT_NIV_POT_MIN+moy*(MGMT_NIV_POT_MAX-MGMT_NIV_POT_MIN));
  return {niv:mgmtNivALage(id,age,pot,pic),pot,pic};
}

/** Le niveau qui fait le bilan : le niveau, plus le biais d'origine (organisation plus faible ou plus forte).
 *  @returns {number} borné 40-80 */
function mgmtNiveauPourBilan(id,niv){
  const biais=(mgmtNivFlux(id,'biais')()-MGMT_NIV_BIAIS_BAS)*MGMT_NIV_BIAIS_ETENDUE;
  return clamp(Math.round(niv+biais),MGMT_NIV_MIN,MGMT_NIV_MAX);
}

/** Le niveau d'une ligne d'avant le lot (migration) : celui que lui donnait son palmarès ; son potentiel et son pic
 *  se déduisent de l'identifiant et de l'âge. @returns {{niv:number,pot:number,pic:number}} */
function mgmtNiveauDepuisBilan(f){
  const pic=mgmtNivPic(f.id);
  const niv=mgmtLevelForRecord(f.W,f.L);
  const ecart=f.age<pic?Math.round((pic-f.age)*(1.5+mgmtNivFlux(f.id,'pente')()*2)):0;
  return {niv,pot:clamp(niv+ecart,niv,MGMT_NIV_MAX),pic};
}

/** Pose niv, pot et pic sur une ligne qui n'en a pas (migration, réparation). @returns {boolean} vrai si posé. */
function mgmtNiveauPose(f){
  if(!f||Number.isFinite(f.niv)&&Number.isFinite(f.pot)&&Number.isFinite(f.pic)) return false;
  Object.assign(f,mgmtNiveauDepuisBilan(f));
  return true;
}

/** Complète toutes les lignes d'une partie à niveaux. @returns {number} lignes complétées. */
function mgmtNiveauxComplete(m){
  if(!mgmtNiveaux(m)||!Array.isArray(m.roster)) return 0;
  let n=0;
  for(const f of m.roster){ if(f&&typeof f==='object'&&mgmtNiveauPose(f)) n++; }
  return n;
}

/** Le niveau pour le profil de combat : le niveau de la ligne s'il en a un, sinon l'ancienne loi (le bilan). */
function mgmtNiveauCombat(f){
  return Number.isFinite(f.niv)?mgmtNivBorne(f.niv):mgmtLevelForRecord(f.W,f.L);
}

/** Après un combat joué sous Split : le niveau avance. Avant le pic, il monte vers le potentiel (le camp accélère ou
 *  freine) ; une défaite coûte un point ; après le pic, rien ne se gagne en combattant (le déclin est celui des années).
 *  @returns {number} la variation (en points). */
function mgmtNiveauApresCombat(m,f,issue){
  if(!mgmtNiveaux(m)||!f||!Number.isFinite(f.niv)||!Number.isFinite(f.pot)||!Number.isFinite(f.pic)) return 0;
  let g=0;
  if(f.age<=f.pic){
    const camp=typeof mgmtCamp==='function'?mgmtCamp(m,f,m.cycle).qualite:0;
    g=clamp((f.pot-f.niv)*MGMT_NIV_PART_COMBAT,0,MGMT_NIV_COMBAT_MAX)*(1+MGMT_NIV_CAMP*clamp(camp,-1,1)+(typeof mgmtCampSpecBonus==='function'?mgmtCampSpecBonus(m,f):0));
  }
  if(issue==='loss') g-=MGMT_NIV_DEFAITE;
  const avant=f.niv;
  f.niv=mgmtNivRond(mgmtNivBorne(f.niv+g));
  return mgmtNivRond(f.niv-avant);
}

/** À un anniversaire : le niveau monte vers le potentiel avant le pic, décline après. Appelé quand l'âge de la
 *  ligne vient de passer à `age`. */
function mgmtNiveauAnniversaire(m,f){
  if(!mgmtNiveaux(m)||!f||!Number.isFinite(f.niv)||!Number.isFinite(f.pot)||!Number.isFinite(f.pic)) return;
  if(f.age<=f.pic){
    const camp=typeof mgmtCamp==='function'?mgmtCamp(m,f,m.cycle).qualite:0;
    f.niv=mgmtNivRond(mgmtNivBorne(f.niv+clamp((f.pot-f.niv)*MGMT_NIV_PART_AN,0,MGMT_NIV_AN_MAX)*(1+MGMT_NIV_CAMP*clamp(camp,-1,1)+(typeof mgmtCampSpecBonus==='function'?mgmtCampSpecBonus(m,f):0))));
  }else if(f.age>f.pic+MGMT_NIV_DECLIN_DELAI){
    f.niv=mgmtNivRond(mgmtNivBorne(f.niv-MGMT_NIV_DECLIN));
  }
}

/** La rouille : baisse passagère de forme après une très longue attente, en points de dynamique ; effacée dès que
 *  le combattant combat (lastCycle avance). Le lot 9 y ajoute ses paliers (il le dit, la presse le relaie, il revient
 *  rouillé, il refuse). @returns {number} 0 à MGMT_NIV_ROUILLE_MAX */
function mgmtRouille(m,f,cycle){
  /* Une trace d'avant le lot (sans niveau) se rejoue à l'identique : aucune rouille. */
  if(!mgmtNiveaux(m)||!f||!Number.isFinite(f.niv)||!Number.isSafeInteger(f.lastCycle)) return 0;
  const c=Number.isSafeInteger(cycle)?cycle:m.cycle;
  /* Lot 9 : sous contrat, les paliers d'attente règlent la rouille — au troisième palier, puis un demi-point par soirée. */
  if(Number.isSafeInteger(f.rg)||f.ct){
    const depuis=Number.isSafeInteger(f.lastCycle)&&f.lastCycle>=0?f.lastCycle:(f.ct?f.ct.since:f.rg), a=c-depuis;
    const s2=mgmtCtSeuils(m)[2];
    return a>=s2?Math.min(MGMT_NIV_ROUILLE_MAX,2.5+(a-s2)*MGMT_NIV_ROUILLE_PAR_CYCLE):0;
  }
  const attente=c-f.lastCycle-MGMT_NIV_ROUILLE_DELAI;
  return attente>0?Math.min(MGMT_NIV_ROUILLE_MAX,attente*MGMT_NIV_ROUILLE_PAR_CYCLE):0;
}
/* ==== [FIN ANCRE] ==== */
