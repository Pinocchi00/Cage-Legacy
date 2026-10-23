"use strict";
/* ==== [ANCRE: P7_T1_SALLE_AMBIANCE] — Monde lot 44 T1 ==== */
/* Brief du 22/10/2026, P7 T1 : la salle évolue ENTRE deux combats, jamais
   pendant. Fonction pure : aucun rnd(), même entrée → même sortie. L'ordre
   de la carte compte. m.soirees garde le dernier état (petite clé, absente
   d'une partie neuve tant qu'aucun combat n'a été terminé). */

/** La salle de la soirée en cours : celle de la prochaine soirée posée, sinon
 *  la salle conseillée, sinon null (partie sans agenda). Pur. */
function mgmtSalleCourante(m){
  if(!m||typeof m!=='object') return null;
  const prochaine=m.cal&&Array.isArray(m.cal.prochaines)?m.cal.prochaines[0]:null;
  if(prochaine&&typeof prochaine.salle==='string'&&typeof mgmtSalleParId==='function'){
    const s=mgmtSalleParId(m,prochaine.salle); if(s) return s;
  }
  return typeof mgmtSalleDefaut==='function'?mgmtSalleDefaut(m):null;
}

/** Le palier d'ambiance en mots. Pur. */
function mgmtSallePalierNom(p){
  const i=Math.max(0,Math.min(MGMT_SALLE.paliers.length-1,Number.isSafeInteger(p)?p:0));
  return MGMT_SALLE.paliers[i];
}

/** Le relevé d'un combat, ou null : le total des coups significatifs et des
 *  knockdowns des deux coins. Pur. */
function mgmtSalleReleve(t){
  if(!t||!t.s||typeof mgmtReleveCoin!=='function') return null;
  const a=mgmtReleveCoin(t.s,'A'), b=mgmtReleveCoin(t.s,'B');
  if(!a||!b) return null;
  return {sig:(a.sig||0)+(b.sig||0),kd:(a.kd||0)+(b.kd||0)};
}

/** La probabilité publique de victoire de A, comme le pronostic de la
 *  présentation (0 à 100). Pur. */
function mgmtSalleProbA(t){
  const a=t&&t.a, b=t&&t.b;
  if(!a||!b) return 50;
  const taux=f=>{ const w=Number.isFinite(f.W)?f.W:0, l=Number.isFinite(f.L)?f.L:0, d=Number.isFinite(f.D)?f.D:0; return w+l+d? (w+0.5*d)/(w+l+d):0.5; };
  return 50+30*(taux(a)-taux(b));
}

/** Le pronostic public donnait-il perdant le vainqueur (moins de 25 %) ? Pur. */
function mgmtSalleSurprise(t){
  if(!t||(t.winner!=='A'&&t.winner!=='B')) return false;
  const p=mgmtSalleProbA(t);
  return t.winner==='A'?p<25:100-p<25;
}

/** Le type d'un combat terminé, du plus fort au plus faible :
 *  eclair, surprise, guerre, tardive, molle, neutre. Pur. */
function mgmtSalleTypeCombat(t){
  if(!t||typeof t!=='object') return 'neutre';
  const family=t.family, round=Number.isSafeInteger(t.round)?t.round:0;
  const fin=family==='ko'||family==='sub'||family==='stop';
  const releve=mgmtSalleReleve(t);
  const kd=releve?releve.kd:0, sig=releve?releve.sig:0;
  const rounds=Number.isSafeInteger(t.rounds)&&t.rounds>0?t.rounds:round||3;
  const serre=Number.isFinite(t.serre)?t.serre:null;
  const scores={
    eclair:fin&&round===1,
    surprise:mgmtSalleSurprise(t),
    guerre:!fin&&(kd>=2||(rounds===5&&(serre===1||sig>=rounds*20))),
    tardive:fin&&round>1,
    molle:family==='dec'&&kd===0&&sig<rounds*20&&(serre===null||serre===0.4)
  };
  let best='neutre', bestScore=0;
  for(const k of ['eclair','surprise','guerre','tardive','molle']){
    if(!scores[k]) continue;
    const v=MGMT_PRIMES.criteres[k]||0;
    if(v>bestScore||(best==='neutre'&&v===0)){ best=k; bestScore=v; }
  }
  return best;
}

/** La phrase du type et du palier, jamais la même que la précédente. Pure. */
function mgmtSallePhrase(type,palier,precedente,h){
  const parPalier=MGMT_SALLE.phrases[type]||MGMT_SALLE.phrases.neutre;
  const liste=parPalier[Math.max(0,Math.min(4,Number.isSafeInteger(palier)?palier:0))]||parPalier[0];
  if(!liste||!liste.length) return '';
  const graine=String(h||0)+'|'+String(precedente||'')+'|'+type+'|'+String(palier);
  let i=typeof duelFnv1a32==='function'?duelFnv1a32(graine)%liste.length:(graine.length%liste.length);
  if(liste[i]===precedente) i=(i+1)%liste.length;
  return liste[i];
}

/** L'état de départ : la dernière soirée connue, sinon le tiers de la salle. Pur. */
function mgmtSalleEtatInitial(m){
  const salle=mgmtSalleCourante(m);
  const capacite=salle&&Number.isFinite(salle.capacite)?salle.capacite:MGMT_SALLE.capaciteDefaut;
  const dernier=Array.isArray(m&&m.comptes)&&m.comptes.length?m.comptes[m.comptes.length-1]:null;
  const taux=dernier&&Number.isFinite(dernier.taux)?Math.max(0,Math.min(1,dernier.taux)):MGMT_SALLE.affluenceDepart;
  const affluence=Math.max(0,Math.min(capacite,Math.round(capacite*taux)));
  return {c:Number.isSafeInteger(m&&m.cycle)?m.cycle:0,palier:1,affluence,phrase:'',n:0,h:-1};
}

/** L'état de salle après un combat terminé — une seule mise à jour par combat.
 *  @param {object} m partie (lue seulement : salle, cycle)
 *  @param {object} etat état précédent {palier,affluence,phrase,…}
 *  @param {object} combatTermine entrée de m.hist + h (l'index du combat)
 *  @returns {{c:number,palier:number,affluence:number,phrase:string,n:number,h:number}} */
function mgmtSalleAmbiance(m,etat,combatTermine){
  const base=etat&&typeof etat==='object'&&!Array.isArray(etat)?etat:mgmtSalleEtatInitial(m);
  const h=combatTermine&&Number.isSafeInteger(combatTermine.h)?combatTermine.h:(Number.isSafeInteger(base.h)?base.h+1:-1);
  if(h>=0&&Number.isSafeInteger(base.h)&&base.h>=h) return base;
  const type=mgmtSalleTypeCombat(combatTermine);
  let palier=Number.isSafeInteger(base.palier)?base.palier:1;
  const delta=MGMT_SALLE.effets[type]||0;
  palier=Math.max(0,Math.min(4,palier+delta));
  if(delta===0&&palier!==MGMT_SALLE.naturel) palier+=palier<MGMT_SALLE.naturel?1:-1;
  const salle=mgmtSalleCourante(m);
  const capacite=salle&&Number.isFinite(salle.capacite)?salle.capacite:MGMT_SALLE.capaciteDefaut;
  const part=MGMT_SALLE.affluence[type]||0;
  let affluence=Number.isSafeInteger(base.affluence)?base.affluence:Math.round(capacite*MGMT_SALLE.affluenceDepart);
  affluence=Math.max(0,Math.min(capacite,affluence+Math.round(capacite*part)));
  const phrase=mgmtSallePhrase(type,palier,typeof base.phrase==='string'?base.phrase:'',h);
  return {c:Number.isSafeInteger(m&&m.cycle)?m.cycle:(Number.isSafeInteger(base.c)?base.c:0),
    palier,affluence,phrase,n:(Number.isSafeInteger(base.n)?base.n:0)+1,h};
}

/** L'état de salle est-il bien formé ? */
function mgmtSalleEtatValide(e){
  if(!e||typeof e!=='object'||Array.isArray(e)) return false;
  if(Object.keys(e).sort().join(',')!=='affluence,c,h,n,palier,phrase') return false;
  if(!Number.isSafeInteger(e.c)||e.c<0) return false;
  if(!Number.isSafeInteger(e.palier)||e.palier<0||e.palier>4) return false;
  if(!Number.isSafeInteger(e.affluence)||e.affluence<0) return false;
  if(typeof e.phrase!=='string'||e.phrase.length>240) return false;
  if(!Number.isSafeInteger(e.n)||e.n<0) return false;
  if(!Number.isSafeInteger(e.h)||e.h<-1) return false;
  return true;
}

/** L'option « Ambiance de salle » : le calcul continue, seul l'affichage est
 *  masqué (elle ne change jamais les primes). */
function mgmtSalleAmbianceActive(){
  return !(typeof MGMT_REGLAGES!=='undefined'&&MGMT_REGLAGES&&MGMT_REGLAGES.affichage&&MGMT_REGLAGES.affichage.salleAmbiance===false);
}
