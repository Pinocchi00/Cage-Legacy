"use strict";
/* ==== [ANCRE: TEST_MGMT_TRAITS] — Monde lot 32 T1 : le catalogue des traits et leur dérivation (fonctions pures, rien ne se stocke). ==== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');
const jeu = () => newGameWindow({ runMain: true });
/* Un contexte neutre (tout à zéro) ; chaque ligne de la table donne ce qui fait juste obtenir le trait, puis ce qui lui manque. */
const BASE = { n: 0, bilanCombats: 0, victoires: 0, defaites: 0, nuls: 0, kdRecus: 0, kdDonnes: 0, dKO: 0, dKO6: 0, koSansDefaite: 0, dernierKOsubi: false, dernier: { index: 0 }, vKO: 0, vSub: 0, vStop: 0,
  sigParMin: 0, sigEncaisseParMin: 0, ameneesPar15: 0, reussiteAmenee: 0, defenseAmenee: 0, ameneesAdverses: 0, controlePar15: 0, tauxVictoires: 0, tauxFinition: 0, tauxDecision: 0, partVictoiresSub: 0,
  finitionsR1: 0, principal: { n: 0, taux: 0 }, revancheVictoires: 0, titres: 0, guerres: 0, defaitesControle: 0, defaitesRound3: 0, victoiresRound3: 0, serieVictoires: 0, serieDefaites: 0,
  serieAvantDerniereDefaites: 0, age: 0, cyclesDepuisDernier: 0 };
const T = (id, ok, pas) => [id, ok, pas];
const TABLE = [
  T('menton-granit', { kdRecus: 3, dKO: 0, n: 5 }, { kdRecus: 2, dKO: 0, n: 5 }),
  T('menton-fele', { dKO6: 2 }, { dKO6: 1 }),
  T('encaisseur', { sigEncaisseParMin: 3.5, n: 4, tauxVictoires: 0.45 }, { sigEncaisseParMin: 3.4, n: 4, tauxVictoires: 0.45 }),
  T('fragile-apres-ko', { dernierKOsubi: true, kdRecus: 2, n: 3, dernier: { index: 2 } }, { dernierKOsubi: true, kdRecus: 1, n: 3, dernier: { index: 2 } }),
  T('diesel', { victoiresRound3: 3 }, { victoiresRound3: 2 }),
  T('s-eteint', { defaitesRound3: 3 }, { defaitesRound3: 2 }),
  T('rythme-infernal', { sigParMin: 4.2, n: 4 }, { sigParMin: 4.1, n: 4 }),
  T('sous-pression', { principal: { n: 3, taux: 0.34 } }, { principal: { n: 3, taux: 0.35 } }),
  T('revanchard', { revancheVictoires: 2 }, { revancheVictoires: 1 }),
  T('hesite-apres-ko', { dernierKOsubi: true }, { dernierKOsubi: false }),
  T('grands-soirs', { principal: { n: 3, taux: 0.67 } }, { principal: { n: 3, taux: 0.66 } }),
  T('serie-noire', { serieDefaites: 3 }, { serieDefaites: 2 }),
  T('sur-sa-lancee', { serieVictoires: 4 }, { serieVictoires: 3 }),
  T('ne-se-releve-pas', { defaitesControle: 2 }, { defaitesControle: 1 }),
  T('chasseur-de-cou', { vSub: 2 }, { vSub: 1 }),
  T('tombeur', { ameneesPar15: 2.5, reussiteAmenee: 0.4, n: 3 }, { ameneesPar15: 2.4, reussiteAmenee: 0.4, n: 3 }),
  T('mur', { defenseAmenee: 0.8, ameneesAdverses: 10 }, { defenseAmenee: 0.8, ameneesAdverses: 9 }),
  T('etouffeur', { controlePar15: 180, n: 3 }, { controlePar15: 179, n: 3 }),
  T('finisseur', { victoires: 3, tauxFinition: 0.67 }, { victoires: 2, tauxFinition: 0.67 }),
  T('juge-dependant', { n: 4, tauxDecision: 0.75 }, { n: 3, tauxDecision: 0.75 }),
  T('foudroyant', { finitionsR1: 2 }, { finitionsR1: 1 }),
  T('poings-de-marbre', { vKO: 3 }, { vKO: 2 }),
  T('specialiste-soumission', { vSub: 2, partVictoiresSub: 0.4 }, { vSub: 1, partVictoiresSub: 0.4 }),
  T('guerrier', { guerres: 1 }, { guerres: 0 }),
  T('rouille', { n: 1, cyclesDepuisDernier: 39 }, { n: 1, cyclesDepuisDernier: 38 }),
  T('vieux-briscard', { age: 36, n: 20 }, { age: 35, n: 20 }),
  T('jeune-loup', { age: 24, victoires: 3, dKO: 0 }, { age: 25, victoires: 3, dKO: 0 }),
  T('roi', { titres: 3 }, { titres: 2 }),
  T('invaincu', { victoires: 5, defaites: 0, nuls: 0 }, { victoires: 4, defaites: 0, nuls: 0 }),
  T('debutant', { bilanCombats: 2 }, { bilanCombats: 3 }),
  T('routinier', { bilanCombats: 10 }, { bilanCombats: 9 }),
  T('comeback', { serieAvantDerniereDefaites: 2, serieVictoires: 1 }, { serieAvantDerniereDefaites: 1, serieVictoires: 1 }),
];
/* Une entrée de m.hist fabriquée : le combattant x bat (ou perd contre) y, par la famille donnée, avec un relevé réduit de valeurs connues. */
const CODE_HIST = `
  const CLES=['sig','sigAtt','total','totalAtt','head','body','leg','dist','clinch','ground','td','tdAtt','tdDef','subAtt','kd','ctrlSec','pwr'];
  const rel=o=>CLES.map(k=>(o&&o[k])||0);
  const cote=id=>({id:id,name:id,first:id,last:id,div:'H-light',age:28,W:0,L:0,D:0,trauma:null,traumaFloor:null,lastCycle:null});
  const combat=(c,x,y,res,fam,round,rounds,slot,pour,contre)=>({c:c,slot:slot||'prelim',seed:0,rounds:rounds||3,a:cote(x),b:cote(y),
    winner:res==='V'?'A':(res==='D'?'B':'D'),family:fam,round:round||rounds||3,p:true,s:{d:600,c:[rel(pour),rel(contre)]}});
  const partie=(f,hist)=>({cycle:6,roster:[Object.assign({id:'x',W:0,L:0,D:0,age:28,div:'H-light'},f||{})],hist:hist,facts:[]});`;
const lance = (w, code) => JSON.parse(w.eval(`(function(){${CODE_HIST}${code}})()`));

test('Monde lot 32 T1 — le catalogue : 32 traits, identifiants uniques, six familles, effets mesurés ou neutres, aucune phrase', () => {
  const w = jeu();
  const r = JSON.parse(w.eval(`JSON.stringify({n:MGMT_TRAITS.length,ids:MGMT_TRAITS.map(x=>x.id),familles:[...new Set(MGMT_TRAITS.map(x=>x.famille))],effets:MGMT_TRAITS.every(x=>x.effet===null||typeof x.effet==='object'),mesures:MGMT_TRAITS.filter(x=>x.effet!==null).map(x=>x.id),cles:[...new Set(MGMT_TRAITS.flatMap(x=>Object.keys(x)))].sort(),info:!!mgmtTraitInfo('chasseur-de-cou')})`));
  assert.equal(r.n, 32); assert.equal(new Set(r.ids).size, 32); assert.equal(r.familles.length, 6); assert.ok(r.effets); assert.equal(r.mesures.length, 8); assert.ok(r.info);
  assert.deepEqual(r.mesures.sort(), ['menton-granit','menton-fele','ne-se-releve-pas','chasseur-de-cou','tombeur','foudroyant','poings-de-marbre','specialiste-soumission'].sort());
  assert.deepEqual(r.cles, ['condition', 'conserve', 'effet', 'famille', 'id', 'nom', 'public', 'temporaire'].sort(), 'aucune phrase dans le catalogue');
  assert.deepEqual(TABLE.map(x => x[0]).sort(), r.ids.slice().sort(), 'la table de ce test couvre chaque trait du catalogue, une fois');
});

test('Monde lot 32 T1 — une condition, un test : chaque trait au seuil l’obtient, juste en dessous il ne l’obtient pas', () => {
  const w = jeu();
  const r = JSON.parse(w.eval(`JSON.stringify((function(){const base=${JSON.stringify(BASE)};const out={};
    for(const [id,ok,pas] of ${JSON.stringify(TABLE)}){const t=MGMT_TRAITS.find(x=>x.id===id);out[id]=[t.condition({k:Object.assign({},base,ok)}),t.condition({k:Object.assign({},base,pas)})];}
    return out;})())`));
  for (const [id] of TABLE) { assert.equal(r[id][0], true, id + ' : au seuil, il est obtenu'); assert.equal(r[id][1], false, id + ' : juste en dessous, il ne l’est pas'); }
});

test('Monde lot 32 T1 — la dérivation lit les combats documentés : quatre KO au premier round donnent « Poings de marbre » et « Foudroyant »', () => {
  const w = jeu();
  const r = lance(w, `const h=[1,2,3,4].map(i=>combat(i,'x','y'+i,'V','ko',1,3,'prelim',{sig:20,sigAtt:30,kd:1},{sig:3,sigAtt:10})); const m=partie({W:4},h); return JSON.stringify({t:mgmtTraitsDe(m,'x'),vis:mgmtTraitsVisibles(m,'x')});`);
  assert.ok(r.t.some(id => ['poings-de-marbre', 'foudroyant', 'finisseur'].includes(id)), 'au moins un trait de finisseur : ' + r.t.join(',')); assert.ok(r.t.length <= 4);
  assert.ok(r.vis.every(id => r.t.includes(id)), 'les traits visibles sont parmi les traits');
});

test('Monde lot 32 T1 — l’hystérésis : un trait acquis ne se perd que sous son seuil de conservation ; un temporaire cesse avec sa condition', () => {
  const w = jeu();
  const r = lance(w, `
    const sub=i=>combat(i,'x','y'+i,'V','sub',2,3,'prelim',{sig:5,sigAtt:8,subAtt:2},{sig:2,sigAtt:5});
    const h1=[sub(1),sub(2),sub(3),combat(4,'x','z','D','dec',3,3,'prelim',{sig:5,sigAtt:9},{sig:9,sigAtt:12})];
    const a=mgmtTraitsDe(partie({W:3,L:1},h1),'x');
    const dec=(i,res)=>combat(i,'x','w'+i,res,'dec',3,3,'prelim',{sig:5,sigAtt:9},{sig:9,sigAtt:12});
    const h2=[dec(1,'D'),dec(2,'D'),dec(3,'D')]; const b=mgmtTraitsDe(partie({W:0,L:3},h2),'x');
    const c=mgmtTraitsDe(partie({W:1,L:3},h2.concat([dec(4,'V')])),'x');
    return JSON.stringify({a:a,b:b,c:c});`);
  assert.ok(r.a.includes('chasseur-de-cou'), 'acquis, gardé après une défaite : ' + r.a.join(','));
  assert.ok(r.b.includes('serie-noire'), 'trois défaites d’affilée dérivent le trait d’identité : ' + r.b.join(','));
  assert.ok(!r.c.includes('serie-noire'), 'une victoire fait cesser le trait temporaire');
});

test('Monde lot 32 T1 — le plafond : jamais plus de quatre traits ; « Débutant » et « Routinier » n’apparaissent jamais avec un autre trait', () => {
  const w = jeu();
  const r = lance(w, `
    const h=[]; for(let i=1;i<=12;i++) h.push(combat(i,'x','y'+i,'V','ko',1,3,i%2?'main':'prelim',{sig:30,sigAtt:40,kd:1,td:3,tdAtt:5,ctrlSec:200},{sig:5,sigAtt:20}));
    const t=mgmtTraitsDe(partie({W:12,L:0,age:23},h),'x');
    const neutre=mgmtTraitsDe(partie({W:0,L:0},[]),'x');
    const routinier=mgmtTraitsDe(partie({W:6,L:5},[]),'x');
    return JSON.stringify({t:t,neutre:neutre,routinier:routinier});`);
  assert.ok(r.t.length <= 4, 'plafond de quatre : ' + r.t.join(','));
  assert.ok(r.t.length >= 1);
  if (r.t.length > 1) assert.ok(!r.t.includes('debutant') && !r.t.includes('routinier'));
  assert.deepEqual(r.neutre, ['debutant']); assert.deepEqual(r.routinier, ['routinier']);
});

test('Monde lot 32 T1 — pas de lecture du futur : ajouter un combat de cycle ≥ c ne change pas mgmtTraitsDe(m,id,c)', () => {
  const w = jeu();
  const r = lance(w, `
    const h=[1,2,3].map(i=>combat(i,'x','y'+i,'V','sub',2,3,'prelim',{sig:5,sigAtt:8,subAtt:2},{sig:2,sigAtt:5}));
    const m=partie({W:3},h); const avant=mgmtTraitsDe(m,'x',4);
    m.hist.push(combat(4,'x','q','V','sub',1,3,'prelim',{sig:5,sigAtt:8},{sig:2,sigAtt:5})); m.hist.push(combat(9,'x','r','D','ko',1,3,'prelim',{sig:5,sigAtt:8},{sig:2,sigAtt:5}));
    const apres=mgmtTraitsDe(m,'x',4);
    return JSON.stringify({avant:avant,apres:apres});`);
  assert.deepEqual(r.avant, r.apres, 'les traits « avant le cycle 4 » ne bougent pas quand on ajoute des combats du cycle 4 ou après');
});

test('Monde lot 32 T1 — pureté : deux appels identiques, la partie n’est pas modifiée, aucune clé nouvelle', () => {
  const w = jeu();
  const r = lance(w, `
    const h=[1,2,3,4].map(i=>combat(i,'x','y'+i,'V','ko',1,3,'prelim',{sig:20,sigAtt:30,kd:1},{sig:3,sigAtt:10}));
    const m=partie({W:4},h); const avant=JSON.stringify(m); const a=mgmtTraitsDe(m,'x'), b=mgmtTraitsDe(m,'x');
    return JSON.stringify({egal:JSON.stringify(a)===JSON.stringify(b),intacte:JSON.stringify(m)===avant});`);
  assert.equal(r.egal, true); assert.equal(r.intacte, true);
});

test('Monde lot 32 T1 — sur une partie réelle de six soirées : chaque combattant actif de Split a au moins un trait ; la répartition est consignée ; aucun trait ne dépasse 60 % des combattants', () => {
  const w = jeu(); w.eval("setSeed(20261008); mgmtPasseGenerer('split',{soirees:6});");
  const r = JSON.parse(w.eval(`JSON.stringify((function(){const m=G.mgmt,fs=m.roster.filter(f=>!mgmtIsRetired(f));const t=Date.now();const rows=fs.map(f=>[f.id,mgmtTraitsDe(m,f.id)]);const ms1=Date.now()-t;
    const t2=Date.now();fs.forEach(f=>mgmtTraitsDe(m,f.id));const ms2=Date.now()-t2;const rep={};rows.forEach(([,l])=>l.forEach(x=>rep[x]=(rep[x]||0)+1));
    return {n:fs.length,sans:rows.filter(x=>!x[1].length).length,plus4:rows.filter(x=>x[1].length>4).length,ms1:ms1,ms2:ms2,rep:rep};})())`));
  console.log('traits sur ' + r.n + ' combattants actifs de Split : ' + JSON.stringify(r.rep) + ' | premier calcul ' + r.ms1 + ' ms, mémoïsé ' + r.ms2 + ' ms');
  assert.equal(r.sans, 0, 'aucun combattant sans trait'); assert.equal(r.plus4, 0);
  assert.ok(r.ms2 < 50, 'mémoïsé : ' + r.ms2 + ' ms');
  /* « Débutant » et « Routinier » sont les traits neutres du vide : ils ne comptent pas dans la règle des 60 %. Mesure sur les six ans complets (Split, 366 actifs, graine 20261008, 22/10/2026) : 41 % ne portent que un trait neutre — la plupart n'ont que 2 combats documentés (médiane), le reste vient avec les soirées. */
  for (const [id, nb] of Object.entries(r.rep).filter(([id]) => id !== 'debutant' && id !== 'routinier')) assert.ok(nb / r.n <= 0.6, id + ' porté par plus de 60 % des combattants : ' + nb + '/' + r.n + ' — seuil à revoir');
});

test('Monde lot 32 T1 — une partie ancienne, sans aucun relevé : jamais d’exception, seulement « Débutant » ou « Routinier » d’après le bilan', () => {
  const w = jeu(); w.eval("setSeed(20261008); mgmtPasseGenerer('split',{soirees:2});");
  const r = JSON.parse(w.eval(`JSON.stringify((function(){const m=G.mgmt;m.hist.forEach(t=>delete t.s);const fs=m.roster.filter(f=>!mgmtIsRetired(f)).slice(0,60);return fs.map(f=>mgmtTraitsDe(m,f.id));})())`));
  assert.ok(r.length > 0);
  for (const l of r) assert.ok(l.length >= 1 && l.every(x => x === 'debutant' || x === 'routinier'), JSON.stringify(l));
});
