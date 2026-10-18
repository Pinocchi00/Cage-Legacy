"use strict";
/* Relève une vraie partie Duo (Split × Garden of Blood) avec les fonctions du jeu, pour les planches du mode Duo.
   Les correctifs DUO-T0 et les fonctions DUO-T1/T2 n'existent pas encore dans le code : ce script les applique tels que les fiches les décrivent.
   node maquettes/duo/src/extraire.js [soirées du passé, 62 par défaut]  →  maquettes/duo/src/donnees.json */
const fs=require('fs'), path=require('path');
const { newGameWindow } = require('../../../tests/helpers/loadGame');
const N=Number(process.argv[2]||62), GRAINE=20261018, J2='garden-of-blood';
const win=newGameWindow({runMain:true});
const t0=Date.now();
win.eval(`setSeed(${GRAINE}); mgmtPasseGenerer('split',{soirees:${N}}); mgmtMondeVivantGenerer(G.mgmt,{soirees:${N}});`);
console.error('création',Math.round((Date.now()-t0)/1000),'s');
const out=win.eval(`(function(){
  /* DUO-T0, défaut 1 et 2 */
  mgmtMondeVivantSemaine=function(m){ if(!m||m.mondeVivant!==true||!m.orgs) return m; const g0=G.mgmt, s0=SEED;
    try{ for(const orgId of mgmtMondeVivantIds(m)){ const sous=m.orgs[orgId], p=sous&&sous.cal&&sous.cal.prochaines[0];
      const jour=p&&Number.isFinite(p.jour)?p.jour:sous.cal.jour+MGMT_EVENT_WEEKS*7; if(jour>m.cal.jour) continue;
      setSeed(((mgmtIdentiteStream(orgId,'semaine|'+m.cycle,m)()*4294967296)>>>0)||1); G.mgmt=sous;
      mgmtPredecesseurSoiree(sous,sous.eventsPlayed||0,mgmtPredecesseurReglages(orgId)); mgmtMondeVivantAlleger(sous); } }
    finally{ G.mgmt=g0; SEED=s0; } return m; };
  const save0=saveMgmt; saveMgmt=function(){ if(G.mgmt&&G.mgmt.idPrefixe!==undefined) return true; return save0(); };
  const m=G.mgmt, sous=m.orgs['${J2}'];
  const avec=(p,fn)=>{const g=G.mgmt; G.mgmt=p; try{return fn(p);}finally{G.mgmt=g;}};
  const cote=c=>c==='a'?m:sous;
  const ident=id=>{const i=mgmtOrgIdentite(id),o=mgmtOrgParId(id),a=mgmtOrgAtouts(o.profil);return {id,nom:o.nom,ville:i.ville,annee:i.annee,reputation:i.reputation,plus:a.plus,moins:a.moins};};
  const D0={graine:${GRAINE},soireesPasse:${N},orgs:MGMT_ORGANISATIONS.map(o=>ident(o.id)),j1:'split',j2:'${J2}',noms:{a:'Anthony',b:'François'}};
  let reperes={ca:m.cycle,cb:sous.cycle}, prochaine=m.cal.jour+91, premier='b';
  const cartes=[];
  for(let k=1;k<=4;k++){ const D={};
  D.debut={jour:m.cal.jour,date:mgmtJourDateTexte(m.cal.jour),prochaine:mgmtJourDateTexte(prochaine),fnA:m.eventsPlayed,fnB:sous.eventsPlayed};
  /* Avancer jusqu'à la super carte (DUO-T1 §6) */
  const rangOrg=id=>{ const c=mgmtOrgClassement(m)||[]; const x=c.find(o=>o&&o.id===id); return x?x.rang:null; };
  const champ=p=>avec(p,q=>allDivisions().filter(d=>(mgmtSplitTitle(q,d.id)||{}).id).length);
  D.avant={caisse:{a:mgmtEuros(m.treasury),b:mgmtEuros(sous.treasury)},rang:{a:rangOrg('split'),b:rangOrg('${J2}')},champions:{a:champ(m),b:champ(sous)},fnA:m.eventsPlayed,fnB:sous.eventsPlayed,jour:m.cal.jour};
  const pas=[];
  for(let i=0;i<20;i++){ const p=m.cal.prochaines[0], jp=p?p.jour:m.cal.jour+MGMT_EVENT_WEEKS*7; if(jp>prochaine) break;
    mgmtPredecesseurSoiree(m,m.eventsPlayed,mgmtPredecesseurReglages('split'));
    pas.push({jour:m.cal.jour,date:mgmtJourDateTexte(m.cal.jour),fnA:m.eventsPlayed,fnB:sous.eventsPlayed}); }
  m.cal.jour=Math.max(m.cal.jour,prochaine); mgmtAdvanceRosterAges(m);
  D.pas=pas; D.superDate=mgmtJourDateTexte(m.cal.jour); D.superProchaine=mgmtJourDateTexte(m.cal.jour+91);
  const famille=t=>mgmtSuMethodeFamille({nul:t.winner==='D',family:t.family,round:t.round,rounds:t.rounds});
  const resume=c=>avec(cote(c),p=>{ const rep=c==='a'?reperes.ca:reperes.cb;
    const cs=p.hist.filter(t=>t&&t.slot==='main'&&t.c>rep&&!t.duo).slice().reverse();
    return {soirees:new Set(cs.map(t=>t.c)).size,combats:cs.slice(0,12).map(t=>({a:t.a.name,b:t.b.name,div:mgmtDivisionLabel(t.a.div),winner:t.winner,methode:famille(t)})),
      champions:allDivisions().filter(d=>(mgmtSplitTitle(p,d.id)||{}).id).length,
      caisse:mgmtEuros(p.treasury),eventsPlayed:p.eventsPlayed,org:p.org}; });
  D.resume={a:resume('a'),b:resume('b')};
  D.rang={a:rangOrg('split'),b:rangOrg('${J2}')}; D.nOrgs=(mgmtOrgClassement(m)||[]).filter(Boolean).length;
  const effectif=(c,div)=>avec(cote(c),p=>p.roster.filter(f=>f.div===div&&!mgmtIsRetired(f)).map(f=>{
      const r=mgmtDivisionRank(p,f,'organization'); const forme=mgmtResultatsDetail(p,f).slice(0,3).reverse().map(x=>x.issue==='win'?'v':(x.issue==='loss'?'d':'n'));
      const etat=f.libre?'libre':(Number.isSafeInteger(f.susp)&&f.susp>=p.cycle?'blesse':(mgmtContratIndispo(p,f,null)?'refuse':'dispo'));
      return {id:f.id,name:f.name,rang:r,W:f.W,L:f.L,D:f.D,age:Math.floor(f.age),etat,restants:mgmtContratRestants(f),forme,div:f.div}; })
    .sort((x,y)=>(x.rang||999)-(y.rang||999)||(x.id<y.id?-1:1)));
  D.divisions=allDivisions().map(d=>({id:d.id,label:mgmtDivisionLabel(d.id)}));
  D.effectif={a:{},b:{}};
  for(const d of allDivisions()){ D.effectif.a[d.id]=effectif('a',d.id); D.effectif.b[d.id]=effectif('b',d.id); }
  /* Enchères (DUO-T2) */
  const lots=[];
  for(const d of allDivisions()){ const r=mgmtRecrutables(m,d.id); const x=r.find(o=>{const f=mgmtExteriorCombattant(m,o.id); return f&&f.orgId!=='${J2}';});
    if(x){ const f=mgmtExteriorCombattant(m,x.id); const b=mgmtBourseSouhaitee(m,mgmtExteriorPourOffre(m,x.id),false), ouv=mgmtContratPrime(3,b);
      lots.push({id:x.id,name:x.name,div:mgmtDivisionLabel(d.id),divId:d.id,rang:x.rang,W:f.W,L:f.L,D:f.D||0,age:Math.floor(f.age),org:(mgmtOrgParId(f.orgId)||{}).nom,star:mgmtStar(f),b,ouverture:ouv,pas:Math.max(1,Math.ceil(ouv*0.1))}); } }
  lots.sort((x,y)=>x.rang-y.rang||y.star-x.star||(x.id<y.id?-1:1));
  D.lots=lots.slice(0,3).map(l=>Object.assign(l,{ouvertureTxt:mgmtEuros(l.ouverture),pasTxt:mgmtEuros(l.pas),
    deux:mgmtEuros(l.ouverture+l.pas),trois:mgmtEuros(l.ouverture+2*l.pas)}));
  D.caisses={a:mgmtEuros(m.treasury),b:mgmtEuros(sous.treasury),aK:m.treasury,bK:sous.treasury,capA:mgmtOverdraftCap(m),capB:avec(sous,p=>mgmtOverdraftCap(p))};
  /* Draft : J2 place d'abord (première carte), chacun place son mieux classé disponible dans une catégorie qui a un adversaire */
  const pris=new Set(), combats=[]; let tour=premier;
  const dispo=c=>avec(cote(c),p=>p.roster.filter(f=>!mgmtIsRetired(f)&&mgmtAvailable(p,f,null)&&!pris.has(f.id)));
  const rang=(c,f)=>avec(cote(c),p=>mgmtDivisionRank(p,f,'organization')||999);
  const ordreDiv=['leger','mi-moyen','plume','moyen','coq','lourd'];
  const divIds=allDivisions().map(d=>d.id);
  for(let k=0;k<6;k++){ const autre=tour==='a'?'b':'a';
    const da=dispo(tour), db=dispo(autre);
    const cands=da.filter(f=>db.some(g=>g.div===f.div)&&!combats.some(c=>c.divId===f.div)).sort((x,y)=>rang(tour,x)-rang(tour,y));
    const f=cands[0]; const g=db.filter(x=>x.div===f.div).sort((x,y)=>rang(autre,x)-rang(autre,y))[0];
    pris.add(f.id); pris.add(g.id);
    const fa=tour==='a'?f:g, fb=tour==='a'?g:f;
    combats.push({place:tour,divId:f.div,div:mgmtDivisionLabel(f.div),a:{id:fa.id,name:fa.name,rec:fa.W+'-'+fa.L+'-'+fa.D,age:Math.floor(fa.age),rang:rang('a',fa)},b:{id:fb.id,name:fb.name,rec:fb.W+'-'+fb.L+'-'+fb.D,age:Math.floor(fb.age),rang:rang('b',fb)}});
    tour=autre; }
  D.draft=combats;
  /* Compteurs « en face » à mi-draft (après 3 combats, Anthony place) */
  pris.clear(); combats.slice(0,3).forEach(c=>{pris.add(c.a.id);pris.add(c.b.id);});
  D.enFaceB=allDivisions().map(d=>({div:mgmtDivisionLabel(d.id),n:dispo('b').filter(f=>f.div===d.id).length}));
  D.placablesA=dispo('a').filter(f=>dispo('b').some(g=>g.div===f.div)).sort((x,y)=>x.div===y.div?rang('a',x)-rang('a',y):divIds.indexOf(x.div)-divIds.indexOf(y.div))
     .map(f=>({name:f.name,div:f.div,rang:rang('a',f),rec:f.W+'-'+f.L+'-'+f.D,age:Math.floor(f.age)}));
  /* La super carte jouée (DUO-T1 §combat) */
  const res=[]; let sa=0, sb=0;
  combats.forEach((c,i)=>{ const fa=mgmtFighterById(m,c.a.id), fb=mgmtFighterById(sous,c.b.id), rounds=i===5?5:3;
    const tA=mgmtTraceSide(fa), tB=mgmtTraceSide(fb), seed=SEED;
    const ra=avec(m,p=>mgmtFightReady(fa,p.cycle)), rb=avec(sous,p=>mgmtFightReady(fb,p.cycle));
    const r=simulateFight(ra,rb,rounds); const fam=mgmtMethodFamily(r.method,r.winner), round=Number.isSafeInteger(r.round)?r.round:rounds;
    avec(m,p=>mgmtApplyFight(p,fa,fb,r,'A')); avec(sous,p=>mgmtApplyFight(p,fb,fa,r,'B'));
    if(r.winner==='A') sa++; else if(r.winner==='B') sb++;
    const fine=(!(r.winner==='D')&&fam==='dec')?(r.method+' après '+rounds+' rounds'):mgmtSuMethodeFamille({nul:r.winner==='D',family:fam,round,rounds});
    res.push({i,winner:r.winner,methode:fine,round,rounds,sa,sb}); });
  D.resultats=res; D.score={a:sa,b:sb};
  cartes.push(D); reperes={ca:m.cycle,cb:sous.cycle}; prochaine+=91; premier=sa>sb?'b':(sb>sa?'a':'b'); }
  const T=D0; T.cartes=cartes;
  return JSON.stringify(T);
})()`);
fs.writeFileSync(path.join(__dirname,'donnees.json'),JSON.stringify(JSON.parse(out),null,1));
console.error('fini',Math.round((Date.now()-t0)/1000),'s');
