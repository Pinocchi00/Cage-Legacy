"use strict";
/* CAGE LEGACY — tests/mgmtClassementsMemoire.test.js
   ===========================================================================
   Monde lot 1 T1 (docs/lots/MONDE-LOT-1-T1.md) : le classement en mémoire.
   L'or : « exactement le même classement que le calcul actuel » — le mémo
   (ancre MONDE_LOT1_T1, mgmt-carte.js) sert la même chose que la voie pure
   mgmtDivisionRankingCalcule ; mgmtRangsInvalider vide le mémo à chaque
   mutation d'une entrée du classement ; le mémo ne se sauvegarde pas ;
   et la partie jouée avec le mémo est identique à la partie jouée sans.
   Le test 6 joue vingt soirées par graine — c'est la preuve, il reste lent.
   =========================================================================== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');
const jouerSoirees = require('./helpers/jouerSoirees');

/** Une partie neuve : graine posée, mgmtDefault déployée, agenda initialisé,
 *  G branché ; mémo actif sauf {memoInactif}. */
function partieNeuve(win, graine, memoInactif){
  return win.eval(`(function(){
    setSeed(${graine});
    const m=mgmtDefault();
    mgmtNewRoster(m); mgmtExteriorEnsure(m); mgmtNewPile(m);
    G={theme:'dark',mgmt:m}; mgmtAgendaInit(m);
    mgmtRangsMemoActif(${!memoInactif});
    return {cycle:m.cycle,roster:m.roster.length};
  })()`);
}

/* ===================== Test 1 ===================== */
test('Monde lot 1 T1 — cent appels dans un même état, un seul calcul pur par catégorie et portée', () => {
  const win = newGameWindow();
  partieNeuve(win, 20261008);
  win.eval(`(function(){
    const m=G.mgmt;
    const d=allDivisions().find(x=>m.roster.some(o=>o.div===x.id&&!mgmtIsRetired(o)));
    window.__fid=m.roster.find(o=>o.div===d.id&&!mgmtIsRetired(o)).id;
    const pur=mgmtDivisionRankingCalcule; let n=0;
    mgmtDivisionRankingCalcule=function(mm,dd,s,c){ n++; return pur(mm,dd,s,c); };
    window.__calculeN=()=>n;
  })()`);
  /* Cent lectures mondiales, puis cent d'organisation : une seule voie pure par portée. */
  const premier = win.eval(`(function(){
    const m=G.mgmt; const f=mgmtFighterById(m,window.__fid); const rangs=[];
    for(let i=0;i<100;i++) rangs.push(mgmtDivisionRank(m,f,'world'));
    for(let i=0;i<100;i++) rangs.push(mgmtDivisionRank(m,f));
    return JSON.stringify({rangs,n:window.__calculeN()});
  })()`);
  const s = JSON.parse(premier);
  assert.ok(s.n<=2, `au plus un calcul pur par portée demandée (${s.n})`);
  assert.equal(new Set(s.rangs.slice(0,100)).size,1,'les 100 rangs mondiaux sont le même');
  assert.equal(new Set(s.rangs.slice(100)).size,1,'les 100 rangs d\u2019organisation sont le même');
  /* Zéro ensuite : le mémo sert toujours les lectures, aucun recalcul. */
  const ensuite = win.eval(`(function(){
    const m=G.mgmt; const f=mgmtFighterById(m,window.__fid); const rangs=[];
    for(let i=0;i<100;i++) rangs.push(mgmtDivisionRank(m,f,'world'));
    for(let i=0;i<100;i++) rangs.push(mgmtDivisionRank(m,f));
    return JSON.stringify({rangs,n:window.__calculeN()});
  })()`);
  const t = JSON.parse(ensuite);
  assert.equal(t.n, s.n, 'aucun calcul pur ensuite : le mémo sert les lectures');
  assert.deepEqual(t.rangs, s.rangs, 'les 200 rangs suivants sont identiques aux premiers');
});

/* ===================== Test 2 ===================== */
/* La comparaison d'une soirée : deepEqual mémo↔calcul pur sur toutes les
   catégories, les trois lectures (organization, world, et le cycle
   explicite m.cycle-1), et le rang de chaque ligne du vivant contre le
   findIndex du calcul pur. Rend les divergences comptées. */
const COMPARE_SOIREE = `(function(){
  const m=G.mgmt; let divergences=0, checked=0;
  const ids=a=>a.map(o=>o.id).join(',');
  const voir=(div,scope,cycle)=>{
    const memo=mgmtDivisionRanking(m,div,scope,cycle);
    const pur=mgmtDivisionRankingCalcule(m,div,scope,cycle);
    checked++;
    if(ids(memo)!==ids(pur)) divergences++;
    return pur;
  };
  const vivant=(div,scope)=>{
    const pur=voir(div,scope,undefined);
    for(const o of pur){
      const ligne=(m.exterieur||[]).find(e=>e.id===o.id);
      const f=ligne||m.roster.find(x=>x.id===o.id);
      if(!f){ divergences++; continue; }
      if(mgmtDivisionRank(m,f,scope)!==pur.indexOf(o)+1) divergences++;
    }
  };
  for(const d of allDivisions()){
    vivant(d.id,'organization'); vivant(d.id,'world');
    voir(d.id,'organization',m.cycle-1); voir(d.id,'world',m.cycle-1);
  }
  return JSON.stringify({divergences,checked});
})()`;

test('Monde lot 1 T1 — le classement en mémoire est exactement celui du calcul : graines 20261008, 20261009, 20261010, quarante soirées, comparé à chaque soirée', () => {
  let divergences=0;
  for(const graine of [20261008,20261009,20261010]){
    const win=newGameWindow();
    partieNeuve(win,graine);
    for(let k=0;k<40;k++){
      jouerSoirees(win,1,{});
      divergences+=JSON.parse(win.eval(COMPARE_SOIREE)).divergences;
    }
  }
  assert.equal(divergences,0,'0 divergence : le mémo sert le calcul pur, roster comme extérieur, vivant comme passé');
});

/* ===================== Test 3 ===================== */
test('Monde lot 1 T1 — une mutation hors résultat invalide le mémo : recrue signée, retraite, avancée de cycle', () => {
  const win=newGameWindow();
  partieNeuve(win,20261008);
  /* 1. Une recrue signée : le rang servi est celui du calcul pur, jamais l'entrée périmée. */
  const r1=JSON.parse(win.eval(`(function(){
    const m=G.mgmt;
    const div0=allDivisions().find(x=>m.roster.some(o=>o.div===x.id&&!mgmtIsRetired(o))).id;
    for(const d of allDivisions()){ mgmtDivisionRanking(m,d.id,'organization'); mgmtDivisionRanking(m,d.id,'world'); }
    const marche=mgmtRecrutables(m,div0);
    const ligne=mgmtRecruter(m,marche[0].id,true);
    if(!ligne) return JSON.stringify({ok:false});
    const f=mgmtFighterById(m,ligne.id);
    const pur=mgmtDivisionRankingCalcule(m,div0,'organization');
    const ids=a=>a.map(o=>o.id).join(',');
    return JSON.stringify({ok:true,servie:mgmtDivisionRank(m,f,'organization'),
      auPur:pur.findIndex(o=>o.id===ligne.id)+1,
      memoExiste:pur.some(o=>o.id===ligne.id),
      servieExiste:mgmtDivisionRanking(m,div0,'organization').some(o=>o.id===ligne.id),
      memo:ids(mgmtDivisionRanking(m,div0,'organization')),pur:ids(pur)});
  })()`));
  assert.ok(r1.ok,`une recrue a été signée par le marché (mgmtRecruter interne)`);
  assert.equal(r1.servie,r1.auPur,'le rang servi de la recrue est celui du calcul pur, jamais l\u2019entrée périmée');
  assert.ok(r1.servie>0,'la recrue est classée');
  assert.equal(r1.memo,r1.pur,'le classement servi est exactement le calcul pur après signature');
  /* 2. Une retraite d'âge par le chemin réel (mgmtRetireRoster) : la ligne sort du servie. */
  const r2=JSON.parse(win.eval(`(function(){
    const m=G.mgmt;
    const div1=allDivisions().find(x=>m.roster.some(o=>o.div===x.id&&!mgmtIsRetired(o))).id;
    mgmtDivisionRanking(m,div1,'organization');
    const tete=mgmtDivisionRankingCalcule(m,div1,'organization')[0];
    const f=mgmtFighterById(m,tete.id); f.age=99;
    mgmtRetireRoster(m);
    const ids=a=>a.map(o=>o.id).join(',');
    const noms=a=>a.map(o=>o.id);
    return JSON.stringify({id:tete.id,servie:mgmtDivisionRank(m,f,'organization'),
      dansServie:noms(mgmtDivisionRanking(m,div1,'organization')).includes(tete.id),
      dansPur:noms(mgmtDivisionRankingCalcule(m,div1,'organization')).includes(tete.id)});
  })()`));
  assert.equal(r2.servie,null,'la retraitée d\u2019âge sert null, comme une retraitée médicale');
  assert.ok(!r2.dansServie&&r2.dansPur===false,
    `la tête retraitée n'est ni dans le servie ni dans le calcul pur (sortie au même endroit)`);
  /* 3. L'avancée de cycle (mgmtNewPile mute plusieurs fois) : le rang servi est celui du calcul pur. */
  const r3=JSON.parse(win.eval(`(function(){
    const m=G.mgmt;
    const actif=m.roster.find(o=>o.div===allDivisions()[0].id&&!mgmtIsRetired(o));
    mgmtNewPile(m);
    const pur=mgmtDivisionRankingCalcule(m,actif.div,'world');
    const ids=a=>a.map(o=>o.id).join(',');
    return JSON.stringify({servie:mgmtDivisionRank(m,actif,'world'),auPur:pur.findIndex(o=>o.id===actif.id)+1,
      memo:ids(mgmtDivisionRanking(m,actif.div,'world')),pur:ids(pur)});
  })()`));
  assert.equal(r3.servie,r3.auPur,'après l\u2019avancée de cycle, le rang servi est celui du calcul pur');
  assert.equal(r3.memo,r3.pur,'le classement mondial servi est exactement le calcul pur après le cycle');
});

/* ===================== Test 4 ===================== */
test('Monde lot 1 T1 — le mémo ne se sauvegarde pas : la partie sérialisée ne change pas quand on lit les classements', () => {
  const win=newGameWindow();
  partieNeuve(win,20261008);
  win.eval(`G.avant=JSON.stringify(G.mgmt);`);
  win.eval(`(function(){ const m=G.mgmt;
    for(let i=0;i<20;i++){
      for(const d of allDivisions()){
        mgmtDivisionRanking(m,d.id,'world'); mgmtDivisionRanking(m,d.id,'organization');
        mgmtDivisionRank(m,(m.exterieur||[])[0]||m.roster[0],'world');
      }
    }
  })()`);
  const s=JSON.parse(win.eval(`(function(){
    const m=G.mgmt;
    const cles=['memo','rank'].filter(k=>k in m);
    return JSON.stringify({apres:JSON.stringify(m),cles});
  })()`));
  assert.equal(s.cles.length,0,'aucune clé memo/rank sur m');
  assert.equal(s.apres,win.eval('G.avant'),'la partie sérialisée est inchangée après les lectures de classement');
});

/* ===================== Test 6 ===================== */
test('Monde lot 1 T1 — la partie jouée avec le mémo est identique à la partie jouée sans : deux graines, vingt soirées, état comparé après chaque soirée', () => {
  for(const graine of [20261008,20261009]){
    const avec=newGameWindow(), sans=newGameWindow();
    partieNeuve(avec,graine,false);
    partieNeuve(sans,graine,true);
    for(let k=0;k<20;k++){
      jouerSoirees(avec,1,{});
      jouerSoirees(sans,1,{});
      const a=avec.eval('JSON.stringify(G.mgmt)'), b=sans.eval('JSON.stringify(G.mgmt)');
      if(a!==b){
        let d=0; while(d<a.length&&a[d]===b[d]) d++;
        assert.fail(`graine ${graine}, soirée ${k+1} : un premier écart au caractère ${d} (« ${a.slice(Math.max(0,d-60),d+60)} » avec le mémo, « ${b.slice(Math.max(0,d-60),d+60)} » sans) — chercher la mutation qui n'invalide pas`);
      }
    }
  }
});
