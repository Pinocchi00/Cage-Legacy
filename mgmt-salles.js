"use strict";
/* ==== [ANCRE: MGMT_BRIEF_LOT8_SALLES] — Brief du 06/10/2026, lot 8 : la salle, le public et l'argent. Le frein à la
   cadence de soirées : une soirée se joue dans une SALLE (une ville, un nom, une capacité, créées à chaque partie),
   la POPULARITÉ de l'organisation fixe le plafond de remplissage, la qualité de la carte dit quelle part est remplie,
   la taille de la soirée pèse (une grosse remplit plus), la RECETTE de billetterie en découle, et la SATISFACTION du
   public après la soirée (combats réclamés joués, combats finis avant la limite ou nuls, noms à l'affiche) fait bouger
   la popularité — donc le remplissage de la suivante. Tout ceci ne vaut que pour une partie à l'agenda actif (m.cal) ;
   l'ancien rythme garde ses constantes. Aucune jauge de popularité à l'écran : elle se lit dans les salles qu'on remplit.
   Données de partie : m.salles [{id,ville,nom,capacite}], m.pop (0 à 100), m.comptes (les dernières soirées). Villes et
   genres de salles : listes de travail relu:false, aucun nom de personnage. ==== */

const MGMT_SALLES_NOMBRE=6;
const MGMT_SALLES_CAPACITES=[800,1500,2500,4000,6000,9000];
const MGMT_SALLES_TYPES=['Dôme','Arena','Palais des sports','Halle','Colisée','Forum','Complexe','Stade couvert'];
const MGMT_SALLES_VILLES=['Lyon','Lille','Nantes','Bordeaux','Marseille','Strasbourg','Rennes','Toulouse','Nice','Montpellier','Dijon','Grenoble',
  'Liège','Genève','Lausanne','Turin','Valence','Porto','Rotterdam','Cologne'];
const MGMT_POP_MIN=5;
const MGMT_POP_MAX=100;
const MGMT_POP_DEPART=40;
const MGMT_REMPLI_PLAFOND_BASE=600;
const MGMT_REMPLI_PLAFOND_POP=8400;
const MGMT_REMPLI_PART_MIN=0.15;
const MGMT_REMPLI_TAILLE={petite:0.75,grosse:1};
const MGMT_PRIX_BILLET=0.065;
const MGMT_LOCATION_PAR_PLACE=0.004;
const MGMT_SATISFAIT_SEUIL=55;
const MGMT_COMPTES_MAX=8;
/* Corrections du 08/10, lot 9 : la tête d'affiche pèse sur la qualité de la carte — chaque point d'attrait du meilleur combat principal au-dessus de l'attrait moyen
   ajoute MGMT_TETE_AFFICHE_POIDS point de qualité (une carte moyenne ne change pas). */
const MGMT_TETE_AFFICHE_POIDS=0.5;

/** Les salles d'une partie : dérivées de l'organisation et de l'ordre, jamais tirées au hasard (aucun hasard hors graine).
 *  Les capacités suivent le profil de l'organisation (taille de ses salles). Pur. */
function mgmtSallesCreer(m){
  const profil=typeof mgmtOrgProfil==='function'?mgmtOrgProfil(m):null, k=profil&&Number.isFinite(profil.salles)?profil.salles:1;
  const graine=String(m&&m.org||'')+'|salles';
  const villes=new Set(), out=[];
  for(let i=0;i<MGMT_SALLES_NOMBRE;i++){
    let v=duelFnv1a32(graine+'|ville|'+i)%MGMT_SALLES_VILLES.length;
    while(villes.has(v)) v=(v+1)%MGMT_SALLES_VILLES.length;
    villes.add(v);
    const t=duelFnv1a32(graine+'|type|'+i)%MGMT_SALLES_TYPES.length;
    out.push({id:'salle-'+(i+1),ville:MGMT_SALLES_VILLES[v],nom:MGMT_SALLES_TYPES[t]+' de '+MGMT_SALLES_VILLES[v],
      capacite:Math.max(200,Math.round(MGMT_SALLES_CAPACITES[i]*k/50)*50)});
  }
  return out;
}

/** Salles et popularité d'une partie à l'agenda : créées une fois, gardées. */
function mgmtSallesInit(m){
  if(!Array.isArray(m.salles)||!m.salles.length) m.salles=mgmtSallesCreer(m);
  if(!Number.isSafeInteger(m.pop)){
    const profil=typeof mgmtOrgProfil==='function'?mgmtOrgProfil(m):null;
    m.pop=Math.round(profil&&Number.isFinite(profil.popularite)?profil.popularite:MGMT_POP_DEPART);
  }
  m.pop=Math.max(MGMT_POP_MIN,Math.min(MGMT_POP_MAX,m.pop));
  if(!Array.isArray(m.comptes)) m.comptes=[];
}
function mgmtSalleParId(m,id){ return (m&&Array.isArray(m.salles)?m.salles:[]).find(s=>s.id===id)||null; }

/** Le plafond de remplissage que la popularité autorise, en spectateurs. Pur. */
function mgmtPopPlafond(pop){
  const p=Math.max(MGMT_POP_MIN,Math.min(MGMT_POP_MAX,Number.isFinite(pop)?pop:MGMT_POP_DEPART));
  return Math.round(MGMT_REMPLI_PLAFOND_BASE+p/100*MGMT_REMPLI_PLAFOND_POP);
}

/** La salle conseillée : la plus grande que la popularité sait presque remplir ; sinon la plus petite. Pur. */
function mgmtSalleDefaut(m){
  const s=(m.salles||[]).slice().sort((a,b)=>a.capacite-b.capacite);
  if(!s.length) return null;
  const plafond=mgmtPopPlafond(m.pop);
  let best=s[0]; for(const x of s){ if(x.capacite<=plafond*1.25) best=x; }
  return best;
}

/** La qualité d'une carte, de 0 à 1 : son attrait rapporté à celui d'une carte moyenne de même taille. Pur. */
function mgmtCarteQualite(m,slotted){
  const sm=slotted.filter(x=>x.slot==='main').length, sp=slotted.length-sm;
  const ref=MGMT_DRAW_AVG*(sm*MGMT_ATTR_MAIN_W+sp*MGMT_ATTR_PRELIM_W);
  if(ref<=0) return 0;
  const carte=mgmtCardAttraction(m,slotted)/ref/2;
  const mains=slotted.filter(x=>x.slot==='main').map(x=>{ const a=mgmtFighterById(m,x.a), b=mgmtFighterById(m,x.b); return a&&b?mgmtFightDraw(a,b):0; });
  const tete=mains.length?Math.max(...mains)-MGMT_DRAW_AVG:0;
  return Math.max(0,Math.min(1,carte+MGMT_TETE_AFFICHE_POIDS*tete));
}

/** Le remplissage : salle, popularité (plafond), qualité de la carte, taille de la soirée. Pur.
 *  @returns {{capacite:number,plafond:number,spectateurs:number,taux:number}} */
function mgmtRemplissage(salle,pop,taille,qualite){
  const cap=salle?salle.capacite:0, plafond=mgmtPopPlafond(pop);
  const base=Math.min(cap,plafond);
  const part=MGMT_REMPLI_PART_MIN+(1-MGMT_REMPLI_PART_MIN)*Math.max(0,Math.min(1,qualite));
  const spectateurs=Math.round(base*part*(MGMT_REMPLI_TAILLE[taille]||MGMT_REMPLI_TAILLE.petite));
  return {capacite:cap,plafond,spectateurs,taux:cap>0?spectateurs/cap:0};
}

/** La billetterie en k$ : les spectateurs au prix du billet (le même partout : une grande salle ne rapporte pas plus par spectateur). Pur. */
function mgmtBilletterie(spectateurs,salle){
  if(!salle) return 0;
  return Math.round(spectateurs*MGMT_PRIX_BILLET);
}

/** La location de la salle, en k$ : chaque place se paie, pleine ou vide — c'est le frein d'une salle trop grande. Pur. */
function mgmtLocation(salle){ return salle?Math.round(salle.capacite*MGMT_LOCATION_PAR_PLACE):0; }

/** Ce que le public réclame : les revanches et troisièmes combats que les rivalités et les demandes ouvertes appellent.
 *  (Les défis publics et la presse n'existent pas encore : lot 10.) Pur. @returns {Array<{a:string,b:string}>} */
function mgmtPublicReclame(m){
  const vus=new Set(), out=[];
  const ajoute=(a,b)=>{ if(!a||!b||a===b) return; const k=[a,b].sort().join('|'); if(vus.has(k)) return; vus.add(k); out.push({a,b}); };
  if(typeof mgmtRivalites==='function') for(const r of mgmtRivalites(m)) ajoute(r.a,r.b);
  if(typeof mgmtDemandesOuvertes==='function') for(const d of mgmtDemandesOuvertes(m)) if((d.want==='revanche'||d.want==='trilogie')&&d.target) ajoute(d.a,d.target);
  return out;
}

/** Corrections du 08/10, 10.1 : les combats réclamés dont les deux combattants sont disponibles. Pur. */
function mgmtReclamesBookables(m,reclames){
  return (reclames||[]).filter(r=>{ const a=mgmtFighterById(m,r.a), b=mgmtFighterById(m,r.b); return a&&b&&mgmtAvailable(m,a)&&mgmtAvailable(m,b); });
}

/** Corrections du 08/10, 10.2 : à quel point une décision est serrée, lu sur les cartes des juges. 1 : partagée ou majoritaire, ou écart moyen d'un point au plus ;
 *  0,7 : écart moyen de deux points au plus ; 0,4 : décision à sens unique. Hors décision : null (la méthode décide). Pur. @param {object} res résultat de simulateFight */
function mgmtDecisionSerree(res){
  if(!res||!res.judges||typeof res.method!=='string'||res.method.indexOf('Décision')!==0) return null;
  if(/partagée|majoritaire/.test(res.method)) return 1;
  const ecarts=Object.values(res.judges).map(j=>Math.abs(j[0]-j[1]));
  const moy=ecarts.reduce((x,y)=>x+y,0)/Math.max(1,ecarts.length);
  return moy<=1?1:moy<=2?0.7:0.4;
}

/** La satisfaction du public, de 0 à 100, sur trois critères — chacun de 0 à 1, chacun monte quand il est rempli :
 *  les combats réclamés qui ont eu lieu (neutre à 0,5 quand rien n'était réclamé), les combats finis avant la limite
 *  (un nul compte pour serré), les noms à l'affiche (le renom moyen des deux derniers combats). Pur. */
function mgmtSatisfaction(m,{reclames,fights,noms}){
  const n=Array.isArray(fights)?fights.length:0;
  const joues=new Set((fights||[]).map(f=>[f.a,f.b].sort().join('|')));
  const reclame=reclames.length?reclames.filter(r=>joues.has([r.a,r.b].sort().join('|'))).length/reclames.length:0.5;
  let serres=0;
  for(const f of fights||[]){
    if(f.family==='ko'||f.family==='sub'||f.family==='stop') serres+=(Number.isSafeInteger(f.round)&&Number.isSafeInteger(f.rounds)&&f.round<f.rounds)?1:0.6;
    else if(f.family==='draw') serres+=0.7;
    else serres+=(f.serre===1?1:f.serre===0.7?0.7:0.4);
  }
  serres=n?serres/n:0;
  const score=Math.round(100*(0.4*reclame+0.3*serres+0.3*Math.max(0,Math.min(1,noms))));
  return {score,reclame,serres,noms};
}

/** Les noms à l'affiche, de 0 à 1 : le renom moyen des quatre combattants des deux derniers combats de la carte principale
 *  (le principal et le co-principal), calculé AVANT la soirée. Pur. */
function mgmtAfficheNoms(m,booked){
  const mains=booked.filter(x=>x.slot==='main').slice(0,2);
  let s=0,k=0;
  for(const f of mains){ const fa=mgmtFighterById(m,f.a), fb=mgmtFighterById(m,f.b); if(fa){ s+=mgmtStar(fa); k++; } if(fb){ s+=mgmtStar(fb); k++; } }
  return k?Math.max(0,Math.min(1,(s/k)/0.7)):0;
}

/** Ce qu'on lit AVANT la soirée (les lignes d'avant combat) : qualité de la carte, combats réclamés, noms à l'affiche. Corrections du 08/10, 10.1 : un combat réclamé
 *  ne compte que si les deux combattants sont disponibles pour la soirée — on le lit avant, car la soirée elle-même suspend. */
function mgmtSallesAvant(m,booked){
  return {qualite:mgmtCarteQualite(m,booked),reclames:mgmtReclamesBookables(m,mgmtPublicReclame(m)),noms:mgmtAfficheNoms(m,booked)};
}

/** Applique les salles à la recette d'une soirée de l'agenda : billetterie sur le remplissage, satisfaction, popularité, comptes.
 *  Mute finance et m (pop, comptes). */
function mgmtSallesApplique(m,finance,fights,avant){
  mgmtSallesInit(m);
  const soir=m.cal.prochaines[0]||{taille:'petite'};
  const salle=mgmtSalleParId(m,soir.salle)||mgmtSalleDefaut(m);
  const r=mgmtRemplissage(salle,m.pop,soir.taille,avant.qualite);
  const sat=mgmtSatisfaction(m,{reclames:avant.reclames,fights,noms:avant.noms});
  finance.ticketing=mgmtBilletterie(r.spectateurs,salle);
  finance.location=mgmtLocation(salle);
  finance.recette=finance.ticketing+finance.tv-finance.purses-finance.bonuses-finance.location;
  Object.assign(finance,{salle:salle?salle.nom:'',capacite:r.capacite,spectateurs:r.spectateurs,taux:Math.round(r.taux*1000)/1000,
    taille:soir.taille,satisfaction:sat.score,popAvant:m.pop});
  m.pop=mgmtPopApres(m.pop,sat.score,r.taux);
  finance.popApres=m.pop;
  m.comptes.push({n:(m.eventsPlayed||0)+1,recette:finance.recette,ticketing:finance.ticketing,tv:finance.tv,purses:finance.purses,bonuses:finance.bonuses,location:finance.location,
    spectateurs:r.spectateurs,capacite:r.capacite,satisfaction:sat.score});
  while(m.comptes.length>MGMT_COMPTES_MAX) m.comptes.shift();
  return finance;
}

/** L'effet de la soirée sur la popularité : un public satisfait la fait monter, un public déçu ou une salle vide la fait baisser. */
function mgmtPopApres(pop,satisfaction,taux){
  const d=Math.round((satisfaction-MGMT_SATISFAIT_SEUIL)/6)-(taux<0.35?2:0);
  return Math.max(MGMT_POP_MIN,Math.min(MGMT_POP_MAX,pop+d));
}

/** Une somme en k$ lue en euros, comme sur les maquettes : « 50 000 € ». Pur. */
function mgmtEuros(k){
  const v=Math.round((Number.isFinite(k)?k:0)*1000), s=String(Math.abs(v)).replace(/\B(?=(\d{3})+(?!\d))/g,' ');
  return (v<0?'−':'')+s+' €';
}

/** Le champ m.salles / m.pop / m.comptes est-il bien formé ? */
function mgmtSallesValide(raw){
  if(raw.salles!==undefined){
    if(!Array.isArray(raw.salles)||raw.salles.length>12) return false;
    for(const s of raw.salles){ if(!s||typeof s.id!=='string'||typeof s.ville!=='string'||typeof s.nom!=='string'||!Number.isSafeInteger(s.capacite)||s.capacite<1) return false; }
  }
  if(raw.pop!==undefined&&(!Number.isSafeInteger(raw.pop)||raw.pop<MGMT_POP_MIN||raw.pop>MGMT_POP_MAX)) return false;
  if(raw.comptes!==undefined){
    if(!Array.isArray(raw.comptes)||raw.comptes.length>MGMT_COMPTES_MAX) return false;
    for(const c of raw.comptes){ if(!c||!Number.isSafeInteger(c.n)||!Number.isSafeInteger(c.recette)) return false; }
  }
  return true;
}
/* ==== [FIN ANCRE] ==== */
