"use strict";
/* ==== [ANCRE: TESTS_MONDE_LOT9_T2A] — Monde lot 9 T2a (docs/lots/MONDE-LOT-9-T2a.md) : la création et la sauvegarde des sept organisations vivantes.
   Passé court (N soirées) pour rester rapide ; la mesure des six ans complets est consignée dans la fiche. ==== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

const N = 6;
const GRAINE = 20261015;
function creer(avecMonde) {
  const win = newGameWindow({ runMain: true });
  win.eval(`setSeed(${GRAINE}); mgmtPasseGenerer('split',{soirees:${N}});`);
  if (avecMonde) win.eval(`mgmtMondeVivantGenerer(G.mgmt,{soirees:${N}});`);
  return win;
}
const A = creer(true);
const B = creer(true);

test('Monde lot 9 T2a — même graine, deux créations identiques, sept organisations comprises', () => {
  const a = A.eval('mgmtSerialiser(G.mgmt)'), b = B.eval('mgmtSerialiser(G.mgmt)');
  assert.equal(a, b);
  const m = JSON.parse(a);
  assert.equal(m.mondeVivant, true);
  assert.equal(m.v, 21);
  assert.deepEqual(Object.keys(m.orgs), JSON.parse(A.eval("JSON.stringify(MGMT_ORGANISATIONS.map(o=>o.id).filter(id=>id!=='split'))")), 'sept organisations, dans l\'ordre de MGMT_ORGANISATIONS');
  assert.equal(Object.keys(m.orgs).length, 7);
  for (const id of Object.keys(m.orgs)) {
    const o = m.orgs[id];
    assert.equal(o.orgs, undefined, 'pas d\'orgs imbriqué');
    assert.ok(o.roster.length > 100, id + ' a un effectif');
    assert.ok(o.passe.archive && o.passe.nHist > 0, id + ' a joué ses soirées');
    assert.ok(o.graine && o.graine !== m.graine, id + ' porte sa graine dérivée');
  }
  assert.equal(new Set(Object.values(m.orgs).map(o => o.graine)).size, 7, 'sept graines distinctes');
});

test('Monde lot 9 T2a — une partie en version 18 se charge, se valide (mondeVivant=false) et joue une soirée', () => {
  const win = creer(false);
  const r = win.eval(`(function(){
    const brut=JSON.parse(mgmtSerialiser(G.mgmt)); brut.v=18; delete brut.mondeVivant; delete brut.orgs;
    const m=mgmtParseAndValidate(JSON.stringify(brut));
    if(!m) return {charge:false};
    mgmtRepair(m); G.mgmt=m;
    const avant=m.eventsPlayed;
    const s=mgmtPredecesseurSoiree(m,0,mgmtPredecesseurReglages('split'));
    return {charge:true,v:m.v,mondeVivant:m.mondeVivant,orgs:m.orgs===undefined,valide:validateMgmt(m),jouee:s.jouee,plus:m.eventsPlayed-avant};
  })()`);
  assert.deepEqual(JSON.parse(JSON.stringify(r)), { charge: true, v: 21, mondeVivant: false, orgs: true, valide: true, jouee: true, plus: 1 }); /* lot 9 T2d : la migration continue jusqu’à 21 */
});

test('Monde lot 9 T2a — sauvegarde puis rechargement conservent m.orgs à l\'identique', () => {
  const r = A.eval(`(function(){
    const avant=mgmtSerialiser(G.mgmt);
    const m=mgmtParseAndValidate(avant);
    if(!m) return {ok:false};
    return {ok:true,identique:mgmtSerialiser(m)===avant,orgs:JSON.stringify(m.orgs)===JSON.stringify(G.mgmt.orgs),tete:JSON.stringify(Object.assign({},m,{orgs:0}))===JSON.stringify(Object.assign({},G.mgmt,{orgs:0}))};
  })()`);
  assert.deepEqual(JSON.parse(JSON.stringify(r)), { ok: true, identique: true, orgs: true, tete: true });
  /* via le stockage : saveMgmt puis loadMgmt */
  const s = A.eval(`(function(){ const avant=JSON.stringify(G.mgmt.orgs); const ok=saveMgmt(); const m0=G.mgmt; G.mgmt=null; const l=loadMgmt(); return {ok,l,orgs:JSON.stringify(G.mgmt.orgs)===avant}; })()`);
  assert.deepEqual(JSON.parse(JSON.stringify(s)), { ok: true, l: true, orgs: true });
});

test('Monde lot 9 T2a — une sous-partie illisible fait refuser la partie, jamais planter', () => {
  const r = A.eval(`(function(){
    const brut=JSON.parse(mgmtSerialiser(G.mgmt)); const id=Object.keys(brut.orgs)[0];
    const a=JSON.parse(JSON.stringify(brut)); a.orgs[id].v=19;
    const b=JSON.parse(JSON.stringify(brut)); delete b.orgs[id];
    const c=JSON.parse(JSON.stringify(brut)); c.mondeVivant='oui';
    return [mgmtParseAndValidate(JSON.stringify(a)),mgmtParseAndValidate(JSON.stringify(b)),mgmtParseAndValidate(JSON.stringify(c))].map(x=>x===null);
  })()`);
  assert.deepEqual(JSON.parse(JSON.stringify(r)), [true, true, true]);
});

test('Monde lot 9 T2a — la partie du joueur est identique avec et sans les sept organisations', () => {
  const sans = creer(false);
  const f = w => w.eval(`(function(){ const m=G.mgmt; return JSON.stringify(Object.assign({},m,{orgs:0,mondeVivant:0}))+'|'+SEED+'|'+(G.mgmt===m); })()`);
  assert.equal(f(A), f(sans), 'même partie du joueur, même état de la RNG après');
  assert.equal(A.eval('G.mgmt.mondeVivant'), true);
  assert.equal(sans.eval('G.mgmt.mondeVivant'), undefined);
});

test('Monde lot 9 T2a — la création réelle de l\'écran fait aussi vivre les sept organisations', async () => {
  const win = newGameWindow({ runMain: true });
  win.eval(`setSeed(${GRAINE}); CL.mgmtNouvelle(2); MGMT_NOUVELLE.soirees=2; MGMT_NOUVELLE.monde=true; MGMT_NOUVELLE.i=0; CL.mgmtNouvelleLancer();`);
  const debut = Date.now();
  while (Date.now() - debut < 170000) {
    await new Promise(r => setTimeout(r, 100));
    if (win.eval('!!(MGMT_NOUVELLE.gen&&MGMT_NOUVELLE.gen.pret)')) break;
  }
  assert.equal(win.eval('MGMT_NOUVELLE.gen.pret'), true);
  assert.equal(win.eval('G.mgmt'), null);
  assert.equal(win.eval('MGMT_NOUVELLE.gen.m.mondeVivant'), true);
  assert.equal(win.eval('Object.keys(MGMT_NOUVELLE.gen.m.orgs).length'), 7);
  win.eval('mgmtNouvelleGenNettoyer()');
});

function installerEcheances(win, jours) {
  win.eval(`(function(){ const m=G.mgmt, jours=${JSON.stringify(jours)}; mgmtMondeVivantIds(m).forEach((id,i)=>{ const s=m.orgs[id], e=s.cal.prochaines[0]; e.jour=jours[i]; s.cal.prochaines=[e]; }); })()`);
}

test('Monde lot 9 T2b — une semaine fait jouer chaque organisation dont la soirée est due, et aucune autre', () => {
  const win=creer(true), ids=JSON.parse(win.eval('JSON.stringify(mgmtMondeVivantIds(G.mgmt))'));
  installerEcheances(win,[0,0,0,0,0,0,Number.MAX_SAFE_INTEGER]);
  const t=Date.now();
  const joue=win.eval(`(function(){ const m=G.mgmt, avant=Object.fromEntries(Object.entries(m.orgs).map(([id,s])=>[id,s.eventsPlayed])); mgmtMondeVivantSemaine(m); return Object.fromEntries(Object.entries(m.orgs).map(([id,s])=>[id,s.eventsPlayed-avant[id]])); })()`);
  console.log(`Monde lot 9 T2b — semaine: ${Date.now()-t} ms`);
  assert.deepEqual(JSON.parse(JSON.stringify(joue)),Object.fromEntries(ids.map((id,i)=>[id,i<6?1:0])));
});

test('Monde lot 9 T2b — la partie du joueur (empreinte) et SEED sont identiques avec et sans la semaine des sept', () => {
  const avec=creer(true), sans=creer(false); installerEcheances(avec,[0,0,0,0,0,0,0]);
  const empreinte=w=>w.eval(`(function(){ const m=G.mgmt; return JSON.stringify(Object.assign({},m,{orgs:0,mondeVivant:0}))+'|'+SEED; })()`);
  const avant=empreinte(avec); avec.eval('mgmtMondeVivantSemaine(G.mgmt)');
  assert.equal(empreinte(avec),avant); assert.equal(empreinte(avec),empreinte(sans));
});

test('Monde lot 9 T2b — deux parties à graine égale donnent les mêmes sept états après trois semaines', () => {
  const a=creer(true), b=creer(true);
  for(let i=0;i<3;i++){
    for(const w of [a,b]){
      w.eval(`G.mgmt.cal.jour+=7; G.mgmt.cycle++; (function(){ const s=G.mgmt.orgs[mgmtMondeVivantIds(G.mgmt)[0]]; if(!s.cal.prochaines.length) mgmtAgendaPoser(s,s.cal.jour+7,'petite'); const e=s.cal.prochaines[0]; if(e) e.jour=G.mgmt.cal.jour; })(); mgmtMondeVivantSemaine(G.mgmt)`);
    }
  }
  assert.equal(a.eval('mgmtSerialiser(G.mgmt)'),b.eval('mgmtSerialiser(G.mgmt)'));
});

test('Monde lot 9 T2b — une partie mondeVivant:false ne fait rien', () => {
  const win=creer(false), avant=win.eval('mgmtSerialiser(G.mgmt)'); win.eval('mgmtMondeVivantSemaine(G.mgmt)');
  assert.equal(win.eval('mgmtSerialiser(G.mgmt)'),avant);
});

test('Monde lot 9 T2c — les effectifs vivants alimentent le compte et le classement mondial', () => {
  const win=creer(true);
  const r=win.eval(`(function(){
    const m=G.mgmt, id=mgmtMondeVivantIds(m)[0], sous=m.orgs[id];
    const f=sous.roster.find(x=>!mgmtIsRetired(x));
    const avant=mgmtWorldLivingCount(m,f.div), ranking=mgmtDivisionRanking(m,f.div,'world');
    return {id:f.id,avant,compte:mgmtWorldLivingCount(m,f.div),classe:ranking.some(x=>x.id===f.id),org:mgmtExteriorEffectifs(m,f.div).find(x=>x.id===f.id).orgId};
  })()`);
  assert.equal(r.avant,r.compte);
  assert.equal(r.classe,true);
  assert.equal(r.org,win.eval('mgmtMondeVivantIds(G.mgmt)[0]'));
});

test('Monde lot 9 T2c — les titres extérieurs reprennent les champions des organisations vivantes', () => {
  const win=creer(true);
  const r=win.eval(`(function(){ const m=G.mgmt,id=mgmtMondeVivantIds(m)[0],s=m.orgs[id],f=s.roster.find(x=>!mgmtIsRetired(x));
    const t=mgmtSplitTitle(s,f.div); return {id,div:f.div,champ:t.id,titres:mgmtExteriorTitles(m,f.div).belts.find(b=>b.org.id===id).id}; })()`);
  assert.ok(r.champ); assert.equal(r.titres,r.champ);
});

test('Monde lot 9 T2c — une offre extérieure retrouve le combattant de l’organisation vivante', () => {
  const win=creer(true);
  const r=win.eval(`(function(){ const m=G.mgmt,id=mgmtMondeVivantIds(m)[0],f=m.orgs[id].roster.find(x=>!mgmtIsRetired(x));
    const cible=mgmtExteriorPourOffre(m,f.id); return {id:f.id,cible:cible&&cible.id,org:cible&&cible.orgId,record:cible&&[cible.W,cible.L,cible.D]}; })()`);
  assert.equal(r.cible,r.id); assert.equal(r.org,win.eval('mgmtMondeVivantIds(G.mgmt)[0]')); assert.ok(Array.isArray(r.record));
});

test('Monde lot 9 T2c — titres, offres et actualités sans monde vivant restent identiques', () => {
  const win=creer(false), vivant=creer(true), orgs=vivant.eval('JSON.stringify(G.mgmt.orgs)');
  const r=win.eval(`(function(){ const m=G.mgmt,div=allDivisions()[0].id,id=(m.exterieur||[])[0]?.id;
    const snap=()=>JSON.stringify({titles:mgmtExteriorTitles(m,div),offer:id?mgmtExteriorPourOffre(m,id):null,news:mgmtSemaineMonde(m)});
    const before=snap(); m.orgs=${JSON.stringify(orgs)}; const after=snap(); return {before,after,mode:m.mondeVivant}; })()`);
  assert.equal(r.after,r.before);
  assert.notEqual(r.mode,true,'la partie reste sans monde vivant');
});

test('Monde lot 9 T2c — le recrutement et l’accueil lisent les organisations vivantes', () => {
  const win=creer(true);
  const r=JSON.parse(win.eval(`(function(){ const m=G.mgmt,org=mgmtMondeVivantIds(m)[0],s=m.orgs[org],f=s.roster.find(x=>!mgmtIsRetired(x));
    f.libre=true; delete f.ct;
    const recru=mgmtRecrutables(m,f.div).find(x=>x.id===f.id);
    const nom=mgmtAccueilNom(m,f.id);
    const vivants=new Set(mgmtExteriorEffectifs(m,f.div).map(x=>x.id).concat(...allDivisions().map(d=>mgmtExteriorEffectifs(m,d.id).map(x=>x.id))));
    const ailleurs=mgmtAccueilContenu(m).ailleurs.filter(x=>/classement mondial/.test(x.parts.map(p=>p.t||'').join('')));
    const ligne=mgmtRecruter(m,f.id,true);
    return JSON.stringify({recru:!!recru,org:recru&&recru.derniere,orgNom:MGMT_ORGANISATIONS.find(o=>o.id===org).nom,nom:nom===f.name,
      accueilVivant:ailleurs.every(x=>x.parts.some(p=>p.id&&vivants.has(p.id))),nAccueil:ailleurs.length,
      entre:!!ligne&&m.roster.some(x=>x.id===f.id),parti:!s.roster.some(x=>x.id===f.id),recrue:m.facts.some(x=>x.k==='recrue'&&x.a===f.id),valide:validateMgmt(m)}); })()`));
  assert.equal(r.recru,true,'le sans-contrat d’une organisation vivante est recrutable'); assert.equal(r.org,r.orgNom);
  assert.equal(r.nom,true);
  assert.ok(r.accueilVivant,'l’accueil ne cite que des combattants des organisations vivantes');
  assert.equal(r.entre,true); assert.equal(r.parti,true,'il quitte son organisation'); assert.equal(r.recrue,true); assert.equal(r.valide,true);
});

test('Monde lot 9 T2c — les actualités lisent les résultats des soirées des organisations vivantes', () => {
  const win=creer(true);
  const found=win.eval(`(function(){ const m=G.mgmt,id=mgmtMondeVivantIds(m)[0],s=m.orgs[id],f=s.roster.find(x=>!mgmtIsRetired(x));
    s.hist=[{c:m.cycle,winner:'A',a:{id:'world-a',name:'Vainqueur vivant',div:f.div},b:{id:'world-b',name:'Perdant vivant',div:f.div}}];
    return mgmtSemaineMonde(m); })()`);
  assert.match(found,/Vainqueur vivant/); assert.match(found,/monde-vivant/);
});

/* ==== [ANCRE: TESTS_MONDE_LOT9_T2D] — Monde lot 9 T2d ==== */
test('Monde lot 9 T2d — aucun identifiant vivant n’est porté par un autre combattant après création et semaine',()=>{
  const win=creer(true);
  const collision=()=>win.eval(`(function(){const all=[...G.mgmt.roster,...Object.values(G.mgmt.orgs).flatMap(s=>s.roster)];return all.length-new Set(all.map(f=>f.id)).size})()`);
  assert.equal(collision(),0); win.eval('mgmtMondeVivantSemaine(G.mgmt)'); assert.equal(collision(),0);
});
test('Monde lot 9 T2d — le classement mondial compte tous les combattants classables des huit organisations',()=>{
  const win=creer(true),r=win.eval(`(function(){const m=G.mgmt;return allDivisions().map(d=>{const rows=mgmtDivisionRanking(m,d.id,'world'),orgs=mgmtMondeVivantIds(m).filter(id=>m.orgs[id].roster.some(f=>f.div===d.id&&!mgmtIsRetired(f))),ids=new Set(rows.map(f=>f.id)),exterieur=new Set((m.exterieur||[]).map(f=>f.id));return {div:d.id,expected:[m,...Object.values(m.orgs)].reduce((n,s)=>n+s.roster.filter(f=>!mgmtIsRetired(f)&&f.div===d.id).length,0),actual:rows.length,orgsPresent:orgs.every(id=>m.orgs[id].roster.some(f=>f.div===d.id&&!mgmtIsRetired(f)&&ids.has(f.id))),exterieurPresent:rows.some(f=>exterieur.has(f.id))}})})()`);
  for(const d of r){assert.equal(d.actual,d.expected,d.div);assert.ok(d.orgsPresent,d.div+' : organisations vivantes représentées');assert.equal(d.exterieurPresent,false,d.div+' : aucun ancien vivier');}
  const puissance=win.eval(`MGMT_ORGANISATIONS.filter(o=>mgmtOrgNiveaux(G.mgmt,o.id)?.puissance>0).length`);
  assert.ok(puissance>=5,'au moins cinq organisations ont une puissance positive après création');
});
test('Monde lot 9 T2d — une organisation conserve ses comptes et son stade après une semaine',()=>{
  const win=creer(true); win.eval(`(function(){const s=G.mgmt.orgs[mgmtMondeVivantIds(G.mgmt)[0]],salle=s.salles.slice().sort((a,b)=>b.capacite-a.capacite)[0];s.comptes.push({salle:salle.nom,salleId:salle.id,taux:.8})})()`); win.eval('mgmtMondeVivantSemaine(G.mgmt)');
  const r=win.eval(`(function(){const id=mgmtMondeVivantIds(G.mgmt)[0],s=G.mgmt.orgs[id],n=mgmtOrgNiveaux(G.mgmt,id),eligible=s.comptes.filter(c=>Number.isFinite(c.taux)&&c.taux>=.8).map(c=>c.salleId||c.salle),salle=s.salles.filter(x=>eligible.includes(x.id)||eligible.includes(x.nom)).sort((a,b)=>b.capacite-a.capacite)[0]||s.salles.slice().sort((a,b)=>a.capacite-b.capacite)[0];return {comptes:s.comptes,stade:n.stade,attendu:salle&&salle.capacite}})()`);
  assert.ok(r.comptes.length>0); assert.deepEqual(Object.keys(r.comptes[0]).sort(),['salle','salleId','taux']); assert.equal(r.stade,r.attendu);
});
test('Monde lot 9 T2d — les migrations v20 préfixent le monde vivant et laissent inchangée une partie sans monde',()=>{
  const win=creer(true),r=win.eval(`(function(){const vivant=JSON.parse(mgmtSerialiser(G.mgmt));vivant.v=20;for(const [id,s] of Object.entries(vivant.orgs)){const p='o'+MGMT_ORGANISATIONS.findIndex(o=>o.id===id)+'mg';s.idPrefixe=undefined;Object.keys(s).forEach(k=>{});const t=JSON.stringify(s).replace(/\\bo\\d+mg(\\d+)\\b/g,'mg$1');Object.assign(s,JSON.parse(t));}const mig=mgmtMigrate(vivant);const propre=JSON.parse(mgmtSerialiser(mgmtDefault('split')));propre.v=20;propre.mondeVivant=false;const avant=JSON.stringify(propre);const sans=mgmtMigrate(propre);return {v:mig.v,valid:validateMgmt(mig)&&mgmtMondeVivantValide(mig),unique:(()=>{const a=[...mig.roster,...Object.values(mig.orgs).flatMap(x=>x.roster)];return a.length===new Set(a.map(x=>x.id)).size})(),sans:JSON.stringify(sans)===avant.replace('"v":20','"v":21')}})()`);
  assert.equal(r.v,21); assert.equal(r.valid,true); assert.equal(r.unique,true); assert.equal(r.sans,true);
});

/* ==== [ANCRE: TESTS_MONDE_LOT9_T2E] — Monde lot 9 T2e ==== */
test('Monde lot 9 T2e — le top 10 mondial mêle les organisations vivantes sans domination de Split',()=>{
  const win=creer(true),r=win.eval(`(function(){const m=G.mgmt;return allDivisions().map(d=>{const top=mgmtDivisionRanking(m,d.id,'world').slice(0,10);return {split:top.filter(f=>m.roster.some(x=>x.id===f.id)).length,orgs:new Set(top.map(f=>f.orgId||'split')).size}})})()`);
  for(const d of r){assert.ok(d.split<=6,`Split occupe ${d.split} places`);assert.ok(d.orgs>=3,`${d.orgs} organisations dans le top 10`);}
});

test('Monde lot 9 T2e — une victoire vivante et une victoire Split sont évaluées par la même loi',()=>{
  const win=creer(true),r=win.eval(`(function(){const m=G.mgmt,org=mgmtMondeVivantIds(m)[0],s=m.orgs[org],div=allDivisions()[0].id;
    const cible=x=>x.roster.find(f=>f.div===div&&!mgmtIsRetired(f));
    const vivant=cible(s),split=cible(m);
    /* ==== [ANCRE: MONDE34T1B_SCORE_COMPARABLE] — Monde lot 34 T1b ==== */
    /* brief du 22/10, P4 T1b : les manques de style changent la génération.
       Garden n'a plus les mêmes âges/bilans que Split : isoler la loi avec deux bilans 10–5 et le même historique vide. */
    function victoire(partie,f){
      const initial={W:f.W,L:f.L,hist:partie.hist};f.W=10;f.L=5;partie.hist=[];
      const rival=partie.roster.find(x=>x.div===f.div&&x.id!==f.id&&!mgmtIsRetired(x));
      const avant=mgmtDivisionRankingCalcule(m,div,'world').findIndex(x=>x.id===f.id);
      const scoresAvant=mgmtRangScores(partie,[f],partie.cycle).get(f.id);
      const combat={c:partie.cycle-1,winner:'B',a:{id:rival.id},b:{id:f.id}};partie.hist.push(combat);f.W++;
      const apres=mgmtDivisionRankingCalcule(m,div,'world').findIndex(x=>x.id===f.id);
      const scoresApres=mgmtRangScores(partie,[f],partie.cycle).get(f.id);
      f.W=initial.W;f.L=initial.L;partie.hist=initial.hist;
      return {avant,apres,variation:scoresApres-scoresAvant,gagnant:combat.winner==='B'&&combat.b.id===f.id};
    }
    return {vivant:victoire(s,vivant,'v'),split:victoire(m,split,'s')};})()`);
  assert.ok(r.vivant.gagnant&&r.split.gagnant,'le combattant testé est bien le vainqueur dans chaque partie');
  assert.ok(r.vivant.apres<=r.vivant.avant,'la victoire vivante ne fait pas reculer');
  assert.ok(r.split.apres<=r.split.avant,'la victoire Split ne fait pas reculer');
  /* Monde lot 16 : le plancher de carrière ajoute un terme flottant ; même loi à 1e-9 près (avant : égalité exacte). */
  assert.ok(Math.abs(r.vivant.variation-r.split.variation)<1e-9,'la victoire ajoute le même score sous-partie pour les deux organisations');
});

/* Monde lot 20 (décision d'Anthony du 18/10/2026 : « recharger ne perd rien ») — après une soirée du monde vivant, les sous-parties portent des comptes allégés
   ({salle,salleId,taux}) : la sauvegarde écrite doit se recharger telle quelle, sans retomber sur le secours. */
test('Monde lot 20 — la partie sauvegardée après une semaine du monde vivant se recharge (comptes allégés valides)',()=>{
  const win=creer(true);
  const r=JSON.parse(win.eval(`(function(){const m=G.mgmt;m.cal.jour+=MGMT_EVENT_WEEKS*7;m.cycle++;mgmtMondeVivantSemaine(m);saveMgmt();
    const lu=mgmtParseAndValidate(stockageLire(mgmtSlotKey(MGMT_SLOT)));
    const allege=Object.keys(m.orgs).some(k=>(m.orgs[k].comptes||[]).some(c=>c.n===undefined));
    return JSON.stringify({primaire:!!lu,allege,egal:!!lu&&mgmtSerialiser(lu)===mgmtSerialiser(m)});})()`));
  assert.ok(r.allege,'la semaine a bien laissé des comptes allégés');
  assert.equal(r.primaire,true,'la sauvegarde principale est valide');
  assert.equal(r.egal,true,'elle se recharge à l’identique');
});
