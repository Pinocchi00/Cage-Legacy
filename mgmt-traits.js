"use strict";
/* ==== [ANCRE: P2_T1_TRAITS] — Monde lot 32 T1 ==== */
/* Proposition de Claude, relu:false : seuils fonctionnels du catalogue. */
const MGMT_TRAITS_SEUILS=Object.freeze({
  combats5:5, combats10:10, combats20:20, documentsTitres:3, kd3:3, kd2:2,
  derniers6:6, koRecents:2, koSansDefaite:4, moyenneEncaissee:4, moyenneEncaisseeConserve:3.5,
  moyenneDonnee:5, moyenneDonneeConserve:4.5, victoires45:.45, victoiresPrincipale35:.35,
  victoiresPrincipale45:.45, victoiresPrincipale70:.70, principale4:4, revanches2:2,
  controleSoumission120:120, soumissions3:3, amenees3:3, ameneesConserve:2.5,
  reussite45:.45, defense80:.80, defenseConserve:.75, controle240:240, controleConserve:200,
  victoires4:4, finition70:.70, finitionConserve:.60, decision70:.70, decisionConserve:.60,
  finitionsR13:3, victoiresKO4:4, victoiresSub3:3, partVictoiresSub40:.40,
  partVictoiresSubConserve:.30, guerres2:2, rouille12:12, age36:36, age34:34, combatsBriscard:20,
  ageJeune24:24, ageJeuneConserve:26, victoiresJeune3:3, victoiresInvaincu6:6,
  combatsDebutant3:3, combatsDebutantConserve:6, defensesTitre3:3, defensesTitreConserve:2,
  defaitesEnControle3:3, defaitesEnControleConserve:2, serieNoire3:3, serieLancee4:4,
  comebackDefaites2:2
});
const MGMT_TRAITS=Object.freeze([
  {id:'menton-granit',famille:'menton',nom:'Menton de granit',public:true,temporaire:false,effet:{chin:7,durability:3},condition:c=>c.k.kdRecus>=3&&c.k.dKO===0&&c.k.n>=5,conserve:c=>c.k.dKO6===0},
  {id:'menton-fele',famille:'menton',nom:'Menton fêlé',public:false,temporaire:false,effet:{chin:-7},condition:c=>c.k.dKO6>=2,conserve:c=>c.k.koSansDefaite<4},
  {id:'encaisseur',famille:'menton',nom:'Encaisseur',public:true,temporaire:false,effet:{durability:4,heart:3},condition:c=>c.k.sigEncaisseParMin>=3.5&&c.k.n>=4&&c.k.tauxVictoires>=.45,conserve:c=>c.k.sigEncaisseParMin>=3},
  {id:'fragile-apres-ko',famille:'menton',nom:'Fragile après un KO',public:false,temporaire:true,effet:{chin:-4,confidence:-5},condition:c=>c.k.dernierKOsubi&&c.k.kdRecus>=2&&c.k.dernier.index>=Math.max(0,c.k.n-2),conserve:()=>false},
  {id:'diesel',famille:'cardio',nom:'Diesel',public:true,temporaire:false,effet:{cardio:7},condition:c=>c.k.victoiresRound3>=3,conserve:c=>c.k.victoiresRound3>=2},
  {id:'s-eteint',famille:'cardio',nom:"S'éteint au troisième",public:false,temporaire:false,effet:{cardio:-7},condition:c=>c.k.defaitesRound3>=3,conserve:c=>c.k.defaitesRound3>=2},
  {id:'rythme-infernal',famille:'cardio',nom:'Rythme infernal',public:true,temporaire:false,effet:{cardio:3,aggression:4},condition:c=>c.k.sigParMin>=4.2&&c.k.n>=4,conserve:c=>c.k.sigParMin>=3.8},
  {id:'sous-pression',famille:'mental',nom:'Perd ses moyens sous la pression',public:false,temporaire:false,effet:{composure:-8},condition:c=>c.k.principal.n>=3&&c.k.principal.taux<=.34,conserve:c=>c.k.principal.n>=4&&c.k.principal.taux<=.45},
  {id:'revanchard',famille:'mental',nom:'Revanchard',public:false,temporaire:false,effet:{heart:4},condition:c=>c.k.revancheVictoires>=2,conserve:c=>c.k.revancheVictoires>=1},
  {id:'hesite-apres-ko',famille:'mental',nom:'Hésite après un KO',public:false,temporaire:true,effet:{confidence:-6,aggression:-4},condition:c=>c.k.dernierKOsubi,conserve:()=>false},
  {id:'grands-soirs',famille:'mental',nom:'Se lève pour les grands soirs',public:false,temporaire:false,effet:{composure:4},condition:c=>c.k.principal.n>=3&&c.k.principal.taux>=.67,conserve:c=>c.k.principal.taux>=.60},
  {id:'serie-noire',famille:'mental',nom:'En plein doute',public:true,temporaire:true,effet:{confidence:-5},condition:c=>c.k.serieDefaites>=3,conserve:()=>false},
  {id:'sur-sa-lancee',famille:'mental',nom:'Sur sa lancée',public:true,temporaire:true,effet:{confidence:5},condition:c=>c.k.serieVictoires>=4,conserve:()=>false},
  {id:'ne-se-releve-pas',famille:'sol',nom:'Ne se relève pas',public:false,temporaire:false,effet:{tdd:-6,guardWork:-6},condition:c=>c.k.defaitesControle>=2,conserve:c=>c.k.defaitesControle>=1},
  {id:'chasseur-de-cou',famille:'sol',nom:'Chasseur de cou',public:true,temporaire:false,effet:{submission:7},condition:c=>c.k.vSub>=2,conserve:c=>c.k.vSub>=1},
  {id:'tombeur',famille:'sol',nom:'Tombeur',public:true,temporaire:false,effet:{takedown:6},condition:c=>c.k.ameneesPar15>=2.5&&c.k.reussiteAmenee>=.40&&c.k.n>=3,conserve:c=>c.k.ameneesPar15>=2},
  {id:'mur',famille:'sol',nom:'Mur anti-lutte',public:true,temporaire:false,effet:{tdd:7},condition:c=>c.k.defenseAmenee>=.80&&c.k.ameneesAdverses>=10,conserve:c=>c.k.defenseAmenee>=.75},
  {id:'etouffeur',famille:'sol',nom:'Étouffeur',public:true,temporaire:false,effet:{topControl:7},condition:c=>c.k.controlePar15>=180&&c.k.n>=3,conserve:c=>c.k.controlePar15>=150},
  {id:'finisseur',famille:'finition',nom:'Finisseur',public:true,temporaire:false,effet:{killer:6},condition:c=>c.k.victoires>=3&&c.k.tauxFinition>=.67,conserve:c=>c.k.tauxFinition>=.50},
  {id:'juge-dependant',famille:'finition',nom:'Juge-dépendant',public:true,temporaire:false,effet:{killer:-5,discipline:3},condition:c=>c.k.n>=4&&c.k.tauxDecision>=.75,conserve:c=>c.k.tauxDecision>=.60},
  {id:'foudroyant',famille:'finition',nom:'Foudroyant',public:true,temporaire:false,effet:{explosiveness:5,killer:3},condition:c=>c.k.finitionsR1>=2,conserve:c=>c.k.finitionsR1>=1},
  {id:'poings-de-marbre',famille:'finition',nom:'Poings de marbre',public:true,temporaire:false,effet:{power:5},condition:c=>c.k.vKO>=3,conserve:c=>c.k.vKO>=2},
  {id:'specialiste-soumission',famille:'finition',nom:'Spécialiste de la soumission',public:true,temporaire:false,effet:{submission:6},condition:c=>c.k.vSub>=2&&c.k.partVictoiresSub>=.40,conserve:c=>c.k.partVictoiresSub>=.30},
  {id:'guerrier',famille:'finition',nom:'Guerrier',public:false,temporaire:false,effet:{heart:4,aggression:3},condition:c=>c.k.guerres>=1,conserve:c=>c.k.guerres>=1},
  {id:'rouille',famille:'moment',nom:'Rouillé',public:true,temporaire:true,effet:null,condition:c=>c.k.n>=1&&c.k.cyclesDepuisDernier>=39,conserve:()=>false},
  {id:'vieux-briscard',famille:'moment',nom:'Vieux briscard',public:true,temporaire:false,effet:{fightIQ:4,explosiveness:-4},condition:c=>c.k.age>=36&&c.k.n>=20,conserve:c=>c.k.age>=34},
  {id:'jeune-loup',famille:'moment',nom:'Jeune loup',public:true,temporaire:false,effet:{explosiveness:4,composure:-3},condition:c=>c.k.age<=24&&c.k.victoires>=3&&c.k.dKO===0,conserve:c=>c.k.age<=26},
  {id:'roi',famille:'moment',nom:'Roi de la catégorie',public:true,temporaire:false,effet:{confidence:4,composure:3},condition:c=>c.k.titres>=3,conserve:c=>c.k.titres>=2},
  {id:'invaincu',famille:'moment',nom:'Invaincu',public:true,temporaire:false,effet:{confidence:4},condition:c=>c.k.victoires>=5&&c.k.defaites===0&&c.k.nuls===0,conserve:c=>c.k.defaites===0},
  {id:'debutant',famille:'moment',nom:'Débutant',public:true,temporaire:false,effet:null,condition:c=>c.k.bilanCombats<3,conserve:c=>c.k.bilanCombats<6},
  {id:'routinier',famille:'moment',nom:'Routinier',public:true,temporaire:false,effet:null,condition:c=>c.k.bilanCombats>=10,conserve:()=>false},
  {id:'comeback',famille:'mental',nom:'Revenu de loin',public:true,temporaire:true,effet:{heart:3},condition:c=>c.k.serieAvantDerniereDefaites>=2&&c.k.serieVictoires===1,conserve:()=>false}
]);
function mgmtTraitInfo(id){const x=MGMT_TRAITS.find(t=>t.id===id);return x?Object.freeze({...x}):null;}
/* ==== [ANCRE: P2_T2_APPLIQUER_TRAITS] — Monde lot 32 T2 ==== */
function mgmtTraitEffetAppliquer(effet,c){
  if(!effet||!c||!c.attrs)return c;
  for(const [k,delta] of Object.entries(effet))c.attrs[k]=clamp(Math.round((Number(c.attrs[k])||0)+delta),1,100);
  if(typeof overall==='function')c.overall=overall(c);
  return c;
}
function mgmtTraitsAppliquer(partie,f,cycle,c){
  if(!partie||!f||!c||!c.attrs)return c;
  const ids=mgmtTraitsDe(partie,f.id,cycle);
  for(const id of ids){
    const trait=MGMT_TRAITS.find(t=>t.id===id);
    if(!trait||!trait.effet)continue;
    mgmtTraitEffetAppliquer(trait.effet,c);
  }
  return c;
}
/* ==== [ANCRE: P2_T1_TRAITS_DERIVES] — Monde lot 32 T1 ==== */
/** Les combats documentés d'un combattant, du plus ancien au plus récent, chacun avec son cycle `c` (mgmtStatsCombats rend le plus récent d'abord et garde l'entrée de m.hist dans `t`). */
function mgmtTraitsCombats(m,id,cycle){
  return mgmtStatsCombats(m,id).slice().reverse().map(x=>Object.assign({},x,{c:x.t&&Number.isSafeInteger(x.t.c)?x.t.c:0})).filter(x=>!Number.isSafeInteger(cycle)||x.c<cycle);
}
const MGMT_TRAITS_MEMO=new WeakMap();
function mgmtTraitsContexte(m,id,cycle){
  const all=mgmtTraitsCombats(m,id,cycle);
  const docs=all.filter(x=>x.pour&&x.contre), n=docs.length, bilan={W:0,L:0,D:0}, wins=[], losses=[];
  let kdRecus=0,kdDonnes=0,vKO=0,vSub=0,vStop=0,dKO=0,dSub=0,dStop=0,vDec=0,dDec=0,
    sigDonne=0,sigPris=0,secondes=0,td=0,tdAtt=0,tdSubis=0,tdAttSubis=0,ctrl=0,
    finitionsR1=0,principalN=0,principalV=0,revanches=0,titres=0,guerres=0,
    defaitesControle=0,defaitesRound3=0,victoiresRound3=0,serieVictoires=0,serieDefaites=0,
    serieAvantDerniereDefaites=0,koSansDefaite=0,dernierKOsubi=false;
  const derniers=docs.slice(-6), idsAvant=new Set();
  for(let i=0;i<n;i++){
    const x=docs[i], win=x.resultat, fam=String(x.famille||'').toLowerCase(), victoire=win==='V', defaite=win==='D';
    if(victoire){bilan.W++;wins.push(fam);}else if(defaite){bilan.L++;losses.push(fam);}else bilan.D++;
    kdRecus+=Number(x.contre.kd)||0;kdDonnes+=Number(x.pour.kd)||0;
    sigDonne+=Number(x.pour.sig)||0;sigPris+=Number(x.contre.sig)||0;secondes+=Number(x.d)||0;
    td+=Number(x.pour.td)||0;tdAtt+=Number(x.pour.tdAtt)||0;tdSubis+=Number(x.contre.td)||0;tdAttSubis+=Number(x.contre.tdAtt)||0;ctrl+=Number(x.pour.ctrlSec)||0;
    if(x.slot==='main'){principalN++;if(victoire)principalV++;}
    if(victoire&&fam==='ko')vKO++;if(victoire&&fam==='sub')vSub++;if(victoire&&fam==='stop')vStop++;
    if(defaite&&fam==='ko'){dKO++;koSansDefaite=0;}else if(defaite)koSansDefaite++;
    if(defaite&&fam==='sub')dSub++;if(defaite&&fam==='stop')dStop++;
    if(victoire&&fam==='dec')vDec++;if(defaite&&fam==='dec')dDec++;
    if(victoire&&fam!=='dec'&&x.round===1)finitionsR1++;
    if((fam==='sub'||fam==='stop')&&defaite&&(Number(x.contre.ctrlSec)||0)>=120)defaitesControle++;
    if(defaite&&(Number(x.round)||0)>=3||(defaite&&fam==='dec'&&(Number(x.rounds)||0)>=5))defaitesRound3++;
    if(victoire&&((fam!=='dec'&&(Number(x.round)||0)>=3)||(fam==='dec'&&(Number(x.rounds)||0)>=3)))victoiresRound3++;
    if(x.adversaire&&x.adversaire.id&&idsAvant.has(x.adversaire.id)&&victoire)revanches++;
    if(x.adversaire&&x.adversaire.id&&defaite)idsAvant.add(x.adversaire.id);
    if((Number(x.pour.kd)||0)>0&&(Number(x.contre.kd)||0)>0)guerres++;
    if(victoire){serieVictoires++;serieDefaites=0;}else if(defaite){serieDefaites++;serieVictoires=0;}else{serieDefaites=0;serieVictoires=0;}
    if(i===n-2)serieAvantDerniereDefaites=serieDefaites;
    dernierKOsubi=defaite&&fam==='ko';
  }
  const f=(m.roster||[]).find(x=>x&&x.id===id)||Object.values(m.orgs||{}).flatMap(o=>o&&o.roster||[]).find(x=>x&&x.id===id)||null;
  const bilanCombats=f&&Number.isFinite(f.W)?Math.max(0,f.W+(f.L||0)+(f.D||0)):n;
  const pct=(a,b)=>b?a/b:0, totalVic=bilan.W;
  const fin= vKO+vSub+vStop;
  const k={n,bilanCombats,W:bilan.W,L:bilan.L,D:bilan.D,victoires:bilan.W,defaites:bilan.L,nuls:bilan.D,
    kdRecus,kdDonnes,dKO,dSub,dStop,vKO,vSub,vStop,vDec,dDec,dKO6:derniers.filter(x=>x.resultat==='D'&&String(x.famille).toLowerCase()==='ko').length,
    koSansDefaite,dernierKOsubi,dernier:{index:Math.max(0,n-1)},sigDonne,sigPris,secondes,
    sigParMin:pct(sigDonne,secondes/60),sigEncaisseParMin:pct(sigPris,secondes/60),ameneesPar15:pct(td,secondes/900),
    reussiteAmenee:pct(td,tdAtt),defenseAmenee:tdAttSubis?pct(tdAttSubis-tdSubis,tdAttSubis):0,ameneesAdverses:tdAttSubis,
    controlePar15:pct(ctrl,secondes/900),tauxVictoires:pct(bilan.W,n),tauxFinition:pct(fin,totalVic),
    tauxDecision:pct(vDec+dDec,n),partVictoiresSub:pct(vSub,totalVic),finitionsR1,principal:{n:principalN,taux:pct(principalV,principalN)},
    revancheVictoires:revanches,titres,guerres,defaitesControle,defaitesRound3,victoiresRound3,serieVictoires,serieDefaites,serieAvantDerniereDefaites,
    age:f&&Number.isFinite(f.age)?f.age:0,cyclesDepuisDernier:all.length?Math.max(0,(Number.isSafeInteger(cycle)?cycle:m.cycle||0)-all[all.length-1].c):999};
  return {n,dernier:derniers,bilan,victoires:{ko:vKO,sub:vSub,stop:vStop,dec:vDec},defaites:{ko:dKO,sub:dSub,stop:dStop,dec:dDec},kdRecus,kdDonnes,serieVictoires,serieDefaites,principale:k.principal,revanches,titres,secondes,sig:{donnes:sigDonne,encaisses:sigPris},k,combats:docs};
}
function mgmtTraitsEtat(m,id,cycle){
  if(!m||typeof m!=='object')return [];
  const orgs=m.mondeVivant===true&&m.orgs&&typeof m.orgs==='object'?Object.values(m.orgs):[];
  const signature=[Array.isArray(m.hist)?m.hist.length:0,...orgs.map(o=>Array.isArray(o&&o.hist)?o.hist.length:0)].join(',');
  let cache=MGMT_TRAITS_MEMO.get(m);if(!cache||cache.signature!==signature){cache={signature,ids:new Map()};MGMT_TRAITS_MEMO.set(m,cache);}
  const key=`${id}|${Number.isSafeInteger(cycle)?cycle:'*'}`;if(cache.ids.has(key))return cache.ids.get(key).slice();
  const combats=mgmtTraitsCombats(m,id,cycle);
  let actifs=[];
  for(let i=1;i<=combats.length;i++){
    const contexte=mgmtTraitsContexte(m,id,combats[i-1].c+1), c={...contexte,k:contexte.k};
    actifs=actifs.filter(idTrait=>{const t=MGMT_TRAITS.find(y=>y.id===idTrait);return t&&t.temporaire?!!t.condition(c):!!(t&&t.conserve(c));});
    for(const t of MGMT_TRAITS){if(!actifs.includes(t.id)&&t.id!=='debutant'&&t.id!=='routinier'&&t.condition(c))actifs.push(t.id);}
  }
  const contexte=mgmtTraitsContexte(m,id,cycle), c={...contexte,k:contexte.k};
  actifs=actifs.filter(idTrait=>{const t=MGMT_TRAITS.find(y=>y.id===idTrait);return t&&t.temporaire?!!t.condition(c):!!(t&&t.conserve(c));});
  for(const t of MGMT_TRAITS){if(t.id!=='debutant'&&t.id!=='routinier'&&!actifs.includes(t.id)&&t.condition(c))actifs.push(t.id);}
  if(!actifs.length){const fallback=MGMT_TRAITS.find(t=>t.id==='debutant');if(fallback.condition(c))actifs.push('debutant');else if(contexte.k.bilanCombats>=10)actifs.push('routinier');else actifs.push('debutant');}
  /* Au plus deux états passagers dans les quatre places : les traits qui durent ne sont pas chassés par la rouille ou le doute. */
  { let nt=0; actifs=actifs.filter(idTrait=>{const x=MGMT_TRAITS.find(y=>y.id===idTrait);if(x&&x.temporaire){nt++;return nt<=2;}return true;}); }
  const counts=new Map();const ordered=actifs.slice().sort((a,b)=>{const ta=MGMT_TRAITS.find(t=>t.id===a),tb=MGMT_TRAITS.find(t=>t.id===b);return Number(tb.temporaire)-Number(ta.temporaire)||((counts.get(ta.famille)||0)-(counts.get(tb.famille)||0))||MGMT_TRAITS.indexOf(ta)-MGMT_TRAITS.indexOf(tb);});
  const selected=[];for(const idTrait of ordered){const t=MGMT_TRAITS.find(x=>x.id===idTrait);if(selected.length<4){selected.push(idTrait);counts.set(t.famille,(counts.get(t.famille)||0)+1);}}
  const result=selected.sort((a,b)=>MGMT_TRAITS.indexOf(MGMT_TRAITS.find(t=>t.id===a))-MGMT_TRAITS.indexOf(MGMT_TRAITS.find(t=>t.id===b)));
  cache.ids.set(key,result);return result.slice();
}
function mgmtTraitsDe(m,id,cycle){return mgmtTraitsEtat(m,id,cycle);}
function mgmtTraitsVisibles(m,id,cycle){return mgmtTraitsDe(m,id,cycle).filter(idTrait=>{const t=MGMT_TRAITS.find(x=>x.id===idTrait);return t&&t.public;});}
