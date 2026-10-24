"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const jouerSoirees=require('./helpers/jouerSoirees');

test('Monde lot 53 T1 — voie réelle : une passe générée ouvre une soirée jouable',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const n=w.eval(`(()=>{setSeed(5301);const m=mgmtPasseGenerer('split',{soirees:3});G.mgmt=m;mgmtRetraitProb=()=>0;CL.mgmtEnter(1);return m;})()`);
    assert.ok(n);
    jouerSoirees(w,1);
    const r=w.eval(`(()=>{const p=mgmtSoireeProgramme(G.mgmt);G.screen='mgmt_soiree';render();return {n:p.length,screen:G.screen,html:document.getElementById('app').innerHTML};})()`);
    assert.ok(r.n>0);
    assert.equal(r.screen,'mgmt_soiree');
    assert.match(r.html,/La soirée|PRÉLIM|COMBAT/);
  }finally{w.close();}
});

test('Monde lot 53 T1 — le choix de vue reste indépendant pour chaque combat',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(5302);const m=mgmtPasseGenerer('split',{soirees:3});G.mgmt=m;mgmtRetraitProb=()=>0;CL.mgmtEnter(1);`);
    jouerSoirees(w,1);
    const r=w.eval(`(()=>{mgmtVueCombatChoisir(0,'resultat');mgmtVueCombatChoisir(1,'forts');return [mgmtVueDuCombat(G.mgmt,0),mgmtVueDuCombat(G.mgmt,1)];})()`);
    assert.deepEqual(Array.from(r),['resultat','forts']);
  }finally{w.close();}
});

test('Monde lot 53 T1 — la vue résultat affiche sa carte passable puis fait avancer la soirée',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(5305);const m=mgmtPasseGenerer('split',{soirees:3});G.mgmt=m;mgmtRetraitProb=()=>0;CL.mgmtEnter(1);`);
    jouerSoirees(w,1);
    const r=w.eval(`(()=>{G.screen='mgmt_soiree';const i=MGMT_SOIREE.index;mgmtVueCombatChoisir(i,'resultat');CL.mgmtSoRegarder();return {avant:i,apres:MGMT_SOIREE.index,screen:G.screen};})()`);
    assert.equal(r.apres,r.avant);
    assert.equal(r.screen,'mgmt_soiree');
    assert.match(w.eval(`document.getElementById('app').innerHTML`),/so3-resultat/);
    w.eval(`CL.mgmtSoResultatContinuer()`);
    assert.equal(w.eval(`MGMT_SOIREE.index`),r.avant+1);
  }finally{w.close();}
});

test('Monde lot 53 T1 — le cumul estimé inclut chaque combat et ses transitions',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(5303);const m=mgmtPasseGenerer('split',{soirees:3});G.mgmt=m;mgmtRetraitProb=()=>0;CL.mgmtEnter(1);`);
    jouerSoirees(w,1);
    const n=w.eval(`mgmtSoireeDureeEstimee(G.mgmt)`);
    assert.ok(Number.isFinite(n)&&n>0);
  }finally{w.close();}
});

test('Monde lot 53 T1 — les durées forfaitaires suivent les vues et ajoutent la transition',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const n=w.eval(`(()=>{const m={vues:{0:'forts',1:'resultat'}};mgmtSoireeProgramme=()=>[{i:0},{i:1}];return mgmtSoireeDureeEstimee(m);})()`);
    assert.equal(n,70);
  }finally{w.close();}
});

test('Monde lot 53 T1 — la durée forfaitaire d’une soirée complète additionne neuf transitions',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const total=w.eval(`(()=>{const m={vues:{}};mgmtSoireeProgramme=()=>Array.from({length:9},(_,i)=>({i}));for(let i=0;i<9;i++)m.vues[i]='resultat';return mgmtSoireeDureeEstimee(m);})()`);
    assert.equal(total,135);
  }finally{w.close();}
});

test('Monde lot 53 T1 — la fin annonce les primes présentes dans les relevés et échappe les noms',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const html=w.eval(`(()=>{const m={lastEvent:{cycle:7},hist:[{c:7,pr:'cs',a:{id:'a',name:'<img src=x>'},b:{id:'b',name:'B'}},{c:7,pr:'pf',winner:'A',a:{id:'a',name:'<img src=x>'},b:{id:'c',name:'C'}}]};return mgmtSoPrimesFinHtml(m);})()`);
    assert.equal((html.match(/class="so3-prime"/g)||[]).length,2);
    assert.match(html,/COMBAT DE LA SOIRÉE/);
    assert.match(html,/PERFORMANCE DE LA SOIRÉE/);
    assert.doesNotMatch(html,/<img/);
    assert.match(html,/&lt;img/i);
    const css=require('fs').readFileSync('ui-cadre.css','utf8');
    assert.match(css,/\.so3-primes\s*\{/);
    assert.match(css,/\.so3-prime\s*\{/);
    assert.match(css,/\.so3-fin\s*\{/);
  }finally{w.close();}
});

test('Monde lot 53 T1 — le panneau de combat rend les trois vues réglables',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(5304);const m=mgmtPasseGenerer('split',{soirees:3});G.mgmt=m;mgmtRetraitProb=()=>0;CL.mgmtEnter(1);`);
    jouerSoirees(w,1);
    const r=w.eval(`(()=>{const p=mgmtSoireeProgramme(G.mgmt);const html=mgmtSoEntreHtml(G.mgmt,p,0,0);return {html,selected:MGMT_SOIREE_UI.focus};})()`);
    for(const label of ['COMPLET','TEMPS FORTS','RÉSULTAT']) assert.ok(r.html.includes(label),label);
    assert.match(r.html,/LE PROCHAIN|CE SOIR/);
    assert.match(r.html,/class="so3-prochain"/);
    assert.equal(r.selected,null);
  }finally{w.close();}
});

test('Monde lot 53 T1 — la frise des temps forts reflète le moment actif',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const html=w.eval(`(()=>{MGMT_COMBAT.vueCombat='forts';MGMT_COMBAT.tempsFortActif=1;MGMT_COMBAT.tempsForts=[{raison:'Ouverture'},{raison:'Finition <test>'}];return mgmtCombatFriseHtml();})()`);
    assert.match(html,/so3-frise/);
    assert.equal((html.match(/class="so3-moment/g)||[]).length,2);
    assert.match(html,/actif/);
    assert.match(html,/Finition &lt;test&gt;/);
    assert.match(html,/aria-current="step"/);
    assert.match(html,/Moment 1, passé : Ouverture/);
    assert.match(html,/Moment 2, en cours : Finition &lt;test&gt;/);
    const css=require('fs').readFileSync('ui-cadre.css','utf8');
    for(const c of ['so3-frise','so3-moment','so3-moment b','so3-moment span','so3-moment.actif','so3-moment.passe'])assert.match(css,new RegExp(`\\.${c.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}\\s*\\{`));
  }finally{w.close();}
});

test('Monde lot 53 T1 — le calcul temps forts reste borné et respecte l’ordre chronologique',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(5306);const m=mgmtPasseGenerer('split',{soirees:3});G.mgmt=m;mgmtRetraitProb=()=>0;CL.mgmtEnter(1);`);
    jouerSoirees(w,1);
    const result=w.eval(`(()=>{const p=mgmtSoireeProgramme(G.mgmt)[0], moments=mgmtTempsFortsChoisir(G.mgmt,p);return {moments,duree:mgmtTempsFortsDuree(G.mgmt,p)};})()`);
    assert.ok(result.moments.length>=4&&result.moments.length<=8);
    assert.deepEqual(Array.from(result.moments,x=>x.t),Array.from(result.moments,x=>x.t).slice().sort((a,b)=>a-b));
    assert.ok(result.duree>=30&&result.duree<=60,`durée observée: ${result.duree}s`);
  }finally{w.close();}
});

test('Monde lot 53 T1 — la touche V règle la vue du combat sélectionné',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(5307);const m=mgmtPasseGenerer('split',{soirees:3});G.mgmt=m;mgmtRetraitProb=()=>0;CL.mgmtEnter(1);`);
    jouerSoirees(w,1);
    const r=w.eval(`(()=>{G.screen='mgmt_soiree';MGMT_SOIREE_UI.focus=0;mgmtVueCombatChoisir(0,'complet');return {avant:mgmtVueDuCombat(G.mgmt,0),html:mgmtSoOuvertureHtml(G.mgmt,mgmtSoireeProgramme(G.mgmt))};})()`);
    assert.equal(r.avant,'complet');
    assert.match(r.html,/COMBAT|PRÉLIM/);
  }finally{w.close();}
});

test('Monde lot 53 T1 — les repères de temps forts conservent l’ordre et l’échappement dans la frise',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const html=w.eval(`(()=>{MGMT_COMBAT.vueCombat='forts';MGMT_COMBAT.tempsFortActif=0;MGMT_COMBAT.tempsForts=[{t:0,raison:'Ouverture <test>'},{t:30,raison:'Fin du combat'}];return mgmtCombatFriseHtml();})()`);
    assert.ok(html.indexOf('Ouverture &lt;test&gt;')<html.indexOf('Fin du combat'));
    assert.match(html,/class="so3-moment actif"[^>]*aria-current="step"/);
    assert.match(html,/class="so3-moment"[^>]*aria-label="Moment 2, à venir/);
    assert.doesNotMatch(html,/<test>/);
  }finally{w.close();}
});

test('Monde lot 53 T1 — Entrée passe le combat en temps forts au verdict et la frise fond brièvement',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const r=w.eval(`(()=>{MGMT_COMBAT.session={};MGMT_COMBAT.vueCombat='forts';MGMT_COMBAT.mode='fight';MGMT_COMBAT.refuse=false;CL.mgmtCbRetour();return MGMT_COMBAT.mode;})()`);
    assert.equal(r,'dec');
    const css=require('fs').readFileSync('ui-cadre.css','utf8');
    assert.match(css,/\.so3-moment\.actif\s*\{[^}]*animation:so3-fondu \.22s/);
    assert.match(css,/@keyframes so3-fondu\s*\{/);
  }finally{w.close();}
});

test('Monde lot 53 T1 — le rendu d’ouverture de soirée conserve les neuf combats et ses repères de navigation',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(5310);const m=mgmtPasseGenerer('split',{soirees:3});G.mgmt=m;mgmtRetraitProb=()=>0;CL.mgmtEnter(1);`);
    jouerSoirees(w,1);
    const result=w.eval(`(()=>{G.screen='mgmt_soiree';render();return document.getElementById('app').innerHTML;})()`);
    assert.equal((result.match(/class="mf-so-lg/g)||[]).length,9);
    assert.match(result,/SOIRÉE/);
    assert.match(result,/Commencer la soirée/);
    assert.equal((result.match(/class="so3-vue"/g)||[]).length,9);
    assert.match(result,/aria-label="Vue du combat 1 :/);
  }finally{w.close();}
});
