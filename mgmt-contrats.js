"use strict";
/* ==== [ANCRE: MGMT_BRIEF_LOT9_CONTRATS] — Brief du 06/10/2026, lot 9 : les contrats et le recrutement. Signer un
   combattant coûte (une prime à la signature, débitée de la caisse), le laisser sans combat aussi (il s'impatiente,
   puis rouille, puis refuse). Un engagement par combattant : ligne.ct={n,f,b,since} — combats signés, faits, bourse par
   combat (en k$), cycle de signature. La bourse payée le soir du combat est celle du contrat (mgmtPurse). À zéro
   combat restant, sans renouvellement, le combattant devient « sans contrat » (ligne.libre) : il ne se book plus et
   figure au marché. Le marché se nourrit des sans-contrat de la partie, des débutants du monde et d'une fin de
   contrat à tour de rôle chez les autres organisations ; un combattant sous contrat ailleurs n'est pas recrutable.
   L'attente a quatre paliers, dans l'ordre : il le dit, la presse le relaie, il revient rouillé et demande un peu
   plus au renouvellement, puis il refuse tous les combats ; un combat joué ramène au début. Aucun texte de personnage
   ici : les paliers sont des étiquettes fonctionnelles (la parole et la presse sont d'auteur, lot 10). Tout ceci ne
   vaut que pour une partie à l'agenda actif (lot 7) ; l'ancien rythme garde ses bourses calculées. ==== */

const MGMT_CT_MIN=1;
const MGMT_CT_MAX=8;
const MGMT_CT_PRIME_PART=0.1;
const MGMT_CT_ATTENTE=[3,5,7,10];
/* Corrections du 08/10, lot 8 (D1) : le dernier palier a toujours une sortie. Au bout de MGMT_CT_DEPART_SOIREES soirées de plus sans combat, le combattant
   demande son départ et s'en va, libre (aucune indemnité : il n'a rien joué). Tant qu'il est là, le matchmaker choisit : le laisser, le libérer en lui
   payant le reste de son contrat, ou le tenter avec un nom moins connu que lui — il accepte un adversaire dont la renommée ne dépasse pas
   MGMT_CT_REFUS_NOM_RATIO de la sienne. */
const MGMT_CT_DEPART_SOIREES=3;
const MGMT_CT_REFUS_NOM_RATIO=0.8;
const MGMT_CT_RENOUV_MAJORATION=1.1;
const MGMT_CT_BOURSE_ECHELLE=1.7;
const MGMT_CT_REFUS_MARGE=25;
/* Corrections du 08/10, lot 9 (D3) : un combattant « trop grand » pour l'organisation (renommée au-dessus de la popularité + MGMT_CT_REFUS_MARGE) ne refuse plus
   quel que soit le prix : tout dépend de ce qui l'intéresse. L'argent (50 %) accepte contre une bourse majorée de MGMT_CT_GRAND_PRIME par point d'écart ; le titre (30 %)
   accepte au prix normal s'il détient la ceinture ou est dans les deux premiers de sa catégorie ; l'ambition (20 %) vise plus haut et refuse, tant que l'organisation
   ne grandit pas. L'intérêt est dérivé de son identifiant, jamais stocké. */
const MGMT_CT_GRAND_PRIME=0.04;
const MGMT_CT_INTERETS=[['argent',0.5],['titre',0.8],['ambition',1]];
/* Lot 9 : la bourse suit la renommée en courbe, pas en droite — le débutant coûte presque rien, la vedette beaucoup. */
const MGMT_CT_BOURSE_COURBE_BASE=0.5;
const MGMT_CT_BOURSE_COURBE_PENTE=2.4;
/* Plus l'organisation est connue, plus ses combattants valent cher sur le marché : la bourse demandée est multipliée par BASE + PENTE × popularité / 100. */
const MGMT_CT_BOURSE_POP_BASE=0.6;
const MGMT_CT_BOURSE_POP_PENTE=0.8;
const MGMT_CT_LIBRE_PERIODE=6;
const MGMT_CT_DEBUTANT_AGE=23;
const MGMT_CT_DEBUTANT_COMBATS=3;
const MGMT_CT_PALIERS=['','Attend un combat','Attend depuis longtemps','Revient rouillé','Refuse tout combat'];

function mgmtContratsActif(m){ return typeof mgmtAgendaActif==='function'&&mgmtAgendaActif(m); }

/** La bourse par combat qu'un combattant demande (k$) : son renom, rapporté à la moyenne des places ; un peu plus
 *  après une longue attente au renouvellement. Pur. */
function mgmtBourseSouhaitee(m,f,renouvellement){
  const s=mgmtStar(f);
  const courbe=MGMT_CT_BOURSE_COURBE_BASE+MGMT_CT_BOURSE_COURBE_PENTE*s*s;
  const g=mgmtContratGrandeur(m,f);
  const base=Math.max(1,Math.round((MGMT_PURSE_BASE+MGMT_PURSE_PER_STAR*s)*MGMT_CT_BOURSE_ECHELLE*courbe*g.prime*(MGMT_CT_BOURSE_POP_BASE+MGMT_CT_BOURSE_POP_PENTE*(Number.isFinite(m.pop)?m.pop:40)/100)*(typeof mgmtOrgProfil==='function'&&Number.isFinite(mgmtOrgProfil(m).bourses)?mgmtOrgProfil(m).bourses:1)));
  const plus=renouvellement&&f.ct&&mgmtContratPalier(m,f)>=3;
  return plus?Math.round(base*MGMT_CT_RENOUV_MAJORATION):base;
}

/** Ce qui l'intéresse : 'argent', 'titre' ou 'ambition', dérivé de son identifiant. Pur. */
function mgmtContratInteret(f){
  const u=mgmtIdentiteStream(f.id,'interet')();
  return MGMT_CT_INTERETS.find(x=>u<x[1])[0];
}

/** Le combattant est-il trop grand pour l'organisation, et que veut-il ? Pur.
 *  @returns {{ecart:number,interet:string,refus:boolean,prime:number}} prime : multiplicateur de la bourse (1 si l'argent ne le retient pas). */
function mgmtContratGrandeur(m,f){
  const ecart=mgmtStar(f)*100-((Number.isFinite(m.pop)?m.pop:40)+MGMT_CT_REFUS_MARGE);
  if(!(ecart>0)) return {ecart:0,interet:'',refus:false,prime:1};
  const interet=mgmtContratInteret(f);
  if(interet==='argent') return {ecart,interet,refus:false,prime:1+MGMT_CT_GRAND_PRIME*ecart};
  if(interet==='titre'){
    const ceinture=typeof mgmtSplitTitle==='function'?mgmtSplitTitle(m,f.div):null;
    const rang=typeof mgmtDivisionRank==='function'?mgmtDivisionRank(m,f):99;
    return {ecart,interet,refus:!((ceinture&&ceinture.id===f.id)||(rang>0&&rang<=2)),prime:1};
  }
  return {ecart,interet,refus:true,prime:1};
}
function mgmtContratPrime(n,b){ return Math.max(1,Math.round(n*b*MGMT_CT_PRIME_PART)); }

/** Donne un contrat à chaque combattant de l'effectif qui n'en a pas : une partie qui passe à l'agenda. Déterministe. */
function mgmtContratsInit(m){
  for(const f of m.roster||[]){
    if(f.ct||f.libre||f.retired) continue;
    const u=mgmtIdentiteStream(f.id,'contrat-n')();
    f.ct={n:MGMT_CT_MIN+1+Math.floor(u*4),f:0,b:mgmtBourseSouhaitee(m,f,false),since:m.cycle};
  }
}

/** Soirées depuis son dernier combat (ou depuis sa signature). Pur. */
function mgmtContratAttente(m,f){
  const depuis=Number.isSafeInteger(f.lastCycle)&&f.lastCycle>=0?f.lastCycle:(f.ct?f.ct.since:m.cycle);
  return Math.max(0,m.cycle-depuis);
}
/** Le palier d'attente : 0 à 4. Pur. */
function mgmtContratPalier(m,f){
  if(!f||!f.ct) return 0;
  const a=mgmtContratAttente(m,f); let p=0;
  MGMT_CT_ATTENTE.forEach((s,i)=>{ if(a>=s) p=i+1; });
  return p;
}
function mgmtContratRestants(f){ return f&&f.ct?Math.max(0,f.ct.n-f.ct.f):0; }

/** Un combattant qui ne peut plus se booker à cause de son contrat : sans contrat, ou au dernier palier d'attente. Au dernier palier, il accepte
 *  pourtant un adversaire moins connu que lui (`contre`, une ligne de l'effectif) : le matchmaker peut le tenter. Pur. */
function mgmtContratIndispo(m,f,contre){
  if(!mgmtContratsActif(m)||!f) return false;
  if(f.libre) return true;
  if(!f.ct||mgmtContratPalier(m,f)<4) return false;
  return !(contre&&contre.id!==f.id&&mgmtStar(contre)<=mgmtStar(f)*MGMT_CT_REFUS_NOM_RATIO);
}

/** Ce qu'il en coûte de libérer un combattant : le reste de son contrat, aux bourses prévues (k$). Pur. */
function mgmtContratIndemnite(f){ return f&&f.ct?mgmtContratRestants(f)*f.ct.b:0; }

/** Libère un combattant sous contrat : le reste de ce qu'on lui doit est payé, il devient sans contrat et rejoint le marché. Refusé s'il est sur la carte,
 *  sans contrat ou si la caisse ne suffit pas. @returns {{ok:boolean,raison?:string,indemnite?:number}} */
function mgmtContratLiberer(m,id){
  const f=mgmtFighterById(m,id);
  if(!mgmtContratsActif(m)) return {ok:false,raison:'inactif'};
  if(!f||!f.ct) return {ok:false,raison:'inconnu'};
  if(mgmtEngaged(m,f)) return {ok:false,raison:'carte'};
  const indemnite=mgmtContratIndemnite(f);
  if(!mgmtCanAfford(m,indemnite)) return {ok:false,raison:'caisse',indemnite};
  m.treasury-=indemnite; delete f.ct; f.libre=true;
  mgmtAddFact(m,{c:m.cycle,k:'libere',a:f.id});
  return {ok:true,indemnite};
}

/** Après une soirée : le combat joué compte, un contrat épuisé fait un sans-contrat. */
function mgmtContratsApresSoiree(m,ids){
  for(const id of ids){
    const f=mgmtFighterById(m,id); if(!f||!f.ct) continue;
    f.ct.f++;
    if(f.ct.f>=f.ct.n){ delete f.ct; f.libre=true; mgmtAddFact(m,{c:m.cycle,k:'fin_contrat',a:f.id}); }
  }
}

/** Les paliers d'attente franchis ce cycle deviennent des faits (la parole et la presse sont d'auteur, lot 10). Le combattant qui a dépassé le dernier
 *  palier de MGMT_CT_DEPART_SOIREES soirées s'en va (fait 'depart_attente'). */
function mgmtContratsOuvreCycle(m){
  if(!mgmtContratsActif(m)) return;
  for(const f of m.roster||[]){
    if(f.ct&&!mgmtIsRetired(f)&&mgmtContratAttente(m,f)>=MGMT_CT_ATTENTE[3]+MGMT_CT_DEPART_SOIREES&&!mgmtEngaged(m,f)){
      delete f.ct; f.libre=true; mgmtAddFact(m,{c:m.cycle,k:'depart_attente',a:f.id}); continue;
    }
    const p=mgmtContratPalier(m,f);
    if(p>=1&&p<=2&&!(m.facts||[]).some(x=>x&&x.k==='attend'&&x.a===f.id&&x.p===p&&x.c>=(Number.isSafeInteger(f.lastCycle)?f.lastCycle:-1))) mgmtAddFact(m,{c:m.cycle,k:'attend',a:f.id,p});
  }
}

/** Ce que le marché propose : débutants, un combattant en fin de contrat à tour de rôle, et les sans-contrat de la partie. */
function mgmtExtLibre(m,line,trace){
  if(!line||!trace) return false;
  const pro=trace.pro?trace.pro.W+trace.pro.L:0;
  if(Math.floor(trace.age)<=MGMT_CT_DEBUTANT_AGE&&pro<=MGMT_CT_DEBUTANT_COMBATS) return true;
  return (duelFnv1a32('libre|'+line.id)+m.cycle)%MGMT_CT_LIBRE_PERIODE===0;
}

/** La réponse d'un combattant à une offre. Pur : aucune écriture.
 *  @returns {{ok:boolean,raison?:string,demande:number,prime:number}} */
function mgmtContratReponse(m,f,n,b,renouvellement){
  const demande=mgmtBourseSouhaitee(m,f,renouvellement), prime=Number.isSafeInteger(n)&&b>0?mgmtContratPrime(n,b):0;
  if(!Number.isSafeInteger(n)||n<MGMT_CT_MIN||n>MGMT_CT_MAX||!Number.isFinite(b)||b<=0) return {ok:false,raison:'offre',demande,prime};
  if(mgmtContratGrandeur(m,f).refus) return {ok:false,raison:'trop-grand',demande,prime};
  if(!mgmtCanAfford(m,prime)) return {ok:false,raison:'caisse',demande,prime};
  if(b<demande) return {ok:false,raison:'trop-bas',demande,prime};
  return {ok:true,demande,prime};
}

/** Renouvelle le contrat d'un combattant de l'effectif : les combats s'ajoutent aux restants, la bourse change, la prime est débitée. */
function mgmtContratRenouveler(m,id,n,b){
  const f=mgmtFighterById(m,id); if(!f||!f.ct||!mgmtContratsActif(m)) return {ok:false,raison:'inconnu'};
  const r=mgmtContratReponse(m,f,n,b,true); if(!r.ok) return r;
  f.ct.n+=n; f.ct.b=b; m.treasury-=r.prime; mgmtAddFact(m,{c:m.cycle,k:'contrat',a:f.id});
  return r;
}
/** Signe un sans-contrat : un ancien de la partie ou un combattant du marché. Aucune signature n'est gratuite. */
function mgmtContratSigner(m,id,n,b){
  if(!mgmtContratsActif(m)) return {ok:false,raison:'inactif'};
  let f=mgmtFighterById(m,id);
  if(f){
    if(!f.libre) return {ok:false,raison:'sous-contrat'};
  }else{
    const line=(m.exterieur||[]).find(e=>e.id===id); if(!line) return {ok:false,raison:'inconnu'};
    const trace=mgmtExteriorTrace(line,m.cycle); if(!trace||!mgmtExtLibre(m,line,trace)) return {ok:false,raison:'sous-contrat'};
  }
  const cible=f||mgmtExteriorPourOffre(m,id); if(!cible) return {ok:false,raison:'inconnu'};
  const r=mgmtContratReponse(m,cible,n,b,false); if(!r.ok) return r;
  if(!f){ f=mgmtRecruter(m,id,true); if(!f) return {ok:false,raison:'inconnu'}; }
  delete f.libre; f.ct={n,f:0,b,since:m.cycle}; m.treasury-=r.prime;
  mgmtAddFact(m,{c:m.cycle,k:'contrat',a:f.id});
  return r;
}
/** Une ligne provisoire pour juger une offre à un combattant du marché (jamais ajoutée à l'effectif). */
function mgmtExteriorPourOffre(m,id){
  const line=(m.exterieur||[]).find(e=>e.id===id); if(!line) return null;
  const t=mgmtExteriorTrace(line,m.cycle); if(!t) return null;
  return {id:line.id,name:t.name,W:t.pro.W,L:t.pro.L,D:0,age:Math.floor(t.age),div:line.div};
}

/** Le champ ct / libre d'une ligne est-il bien formé ? */
function mgmtContratLigneValide(o){
  if(o.libre!==undefined&&o.libre!==true) return false;
  if(o.ct!==undefined){
    const c=o.ct;
    if(!c||typeof c!=='object'||!Number.isSafeInteger(c.n)||c.n<1||!Number.isSafeInteger(c.f)||c.f<0||!Number.isFinite(c.b)||c.b<=0||!Number.isSafeInteger(c.since)) return false;
    if(o.libre) return false;
  }
  return true;
}
/* ==== [FIN ANCRE] ==== */
