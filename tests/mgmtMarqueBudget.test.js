"use strict";
/* Monde lot 8 T6 (docs/lots/MONDE-LOT-8-T6.md) : le budget de la marque —
   au plus mgmtMarqueBudget(m) marques allumées en même temps, celui du
   conteur ; le cercle et les suivis passent d'abord, une place est réservée
   à un combattant hors des deux (décision du 10/10/2026, question 3) ; à
   date égale une blessure, une demande ou un moment de vie passe avant un
   simple combat (décision, question 4) ; une marque qui attend n'est pas
   dessinée, son événement reste lisible sur la fiche. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const jouer=require('./helpers/jouerSoirees');
const res=(win,code)=>JSON.parse(win.eval(`JSON.stringify((function(){${code}})())`));

function neuve(seed){
  const win=newGameWindow({runMain:true});
  /* décision d'Anthony du 15/10/2026 : humanité retirée pour l'instant, ce test vérifie le mécanisme interrupteur levé */
  win.eval(`MGMT_HUMANITE_ACTIVE=true; mgmtRetraitProb=function(){return 0;}; setSeed(${seed||7}); CL.mgmtEnter(1);`);
  return win;
}

test('Budget — sur quarante soirées sans ouvrir une fiche, les marques allumées ne dépassent jamais le budget du conteur', () => {
  const win=neuve(7);
  win.eval(`const m=G.mgmt; mgmtVisitesInit(m);`);
  for(let i=1;i<=40;i++){
    const j=jouer(win,1,{titre:true});
    assert.ok(j>=1,'la soirée '+i+' a été jouée');
    const r=res(win,`const m=G.mgmt, b=mgmtConteurBudget(m), al=mgmtMarquesAllumees(m);
      return {b,n:al.length,unic:new Set(al).size===al.length};`);
    assert.ok(r.b>=3&&r.b<=5,'le budget du conteur reste entre 3 et 5 (soirée '+i+')');
    assert.ok(r.n<=r.b,'les marques allumées tiennent dans le budget (soirée '+i+')');
    assert.ok(r.n>=1,'quelqu\'un est allumé (soirée '+i+')');
    assert.ok(r.unic,'aucun doublon (soirée '+i+')');
  }
  const fin=res(win,`const m=G.mgmt;
    return {marq:m.roster.filter(o=>mgmtMarque(m,o.id)).length,lit:mgmtMarquesAllumees(m).length};`);
  assert.ok(fin.marq>=300,'le budget mord vraiment : '+fin.marq+' marqués après 40 soirées');
  assert.ok(fin.lit<=5,'au plus cinq allumés après la 40e soirée');
});

test('Budget — le budget des marques est celui du conteur', () => {
  const win=neuve(7);
  let r=res(win,`const m=G.mgmt; return [mgmtMarqueBudget(m),mgmtConteurBudget(m),MGMT_CONTEUR_MAX];`);
  assert.deepEqual(r,[5,5,5],'une partie neuve : le budget des marques vaut le MAX du conteur');
  win.eval(`const m=G.mgmt; mgmtVisitesInit(m);`);
  jouer(win,5);
  r=res(win,`const m=G.mgmt; return [mgmtMarqueBudget(m),mgmtConteurBudget(m)];`);
  assert.equal(r[0],r[1],'après 5 soirées aussi, le budget des marques est celui du conteur');
});

test('Budget — huit combattants marqués, cinq allumés ; les trois autres attendent et leur événement reste lisible', () => {
  const win=neuve(7);
  const r=res(win,`const m=G.mgmt; mgmtVisitesInit(m);
    const div=m.roster[0].div, huit=m.roster.filter(o=>o.div===div).slice(0,8);
    for(const o of huit){ m.facts.push({c:m.cycle,k:'injury',a:o.id}); }
    return {huit:huit.map(o=>o.id),al:mgmtMarquesAllumees(m)};`);
  assert.equal(r.al.length,5,'cinq allumés (budget d\'une partie neuve)');
  assert.ok(r.al.every(id=>r.huit.includes(id)),'les allumés sont bien parmi les huit poussés');
  const autres=r.huit.filter(id=>!r.al.includes(id));
  assert.equal(autres.length,3,'trois attendent');
  const lisible=res(win,`const m=G.mgmt, ids=${JSON.stringify(autres)};
    return ids.map(id=>[mgmtMarque(m,id),mgmtEvenementsDepuis(m,id).length]);`);
  for(const [marque,n] of lisible){
    assert.equal(marque,true,'l\'éteint reste marqué (mgmtMarque ne change pas)');
    assert.equal(n,1,'et son événement reste lisible sur la fiche');
  }
});

test('Budget — un combat ancien déjà lu n\'est plus un événement en attente : il ne maintient rien d\'allumé', () => {
  const win=neuve(7);
  win.eval(`const m=G.mgmt; mgmtVisitesInit(m); mgmtMarqueBudget=function(){return 1;};
    const S=m.roster[0].id, V=m.roster[1].id, U=m.roster[2].id;
    m.hist.push({c:10,slot:'main',a:{id:S},b:{id:V},winner:'b'});
    /* S et V lisent le combat (fiche ouverte) : sa place de passe est franchie
       pour chacun — visites = [longueur courante des faits, des combats]. */
    mgmtVuEnregistre(m,S); mgmtVuEnregistre(m,V);
    /* Puis un fait plus ancien (c:5) arrive à U, inconnu. */
    m.facts.push({c:5,k:'injury',a:U});
    G.IDS2={S,V,U};`);
  const {S,V,U}=JSON.parse(win.eval('JSON.stringify(G.IDS2)'));
  assert.deepEqual(res(win,`return mgmtMarquesAllumees(G.mgmt);`),[U],
    'le combat lu (c:10) n\'écrase pas le fait (c:5) : U seul est allumé');
  const r=res(win,`const m=G.mgmt; return [mgmtMarque(m,'${S}'),mgmtMarque(m,'${V}'),mgmtEvenementsDepuis(m,'${S}').length];`);
  assert.equal(r[2],0,'S n\'a plus rien en attente (la passe suit la porte de mgmtEvenementsDepuis)');
  assert.equal(r[0],false,'S n\'est plus marqué (mgmtMarque brut)');
  assert.equal(r[1],false,'V non plus : les deux ont lu le combat');
});

test('Budget — le cercle passe avant le suivi, le suivi avant l\'inconnu, même quand l\'inconnu est plus récent', () => {
  const win=neuve(7);
  win.eval(`const m=G.mgmt; mgmtVisitesInit(m); mgmtMarqueBudget=function(){return 1;};
    const U=m.roster[0].id, S=m.roster[1].id, K=m.roster[2].id;
    mgmtSuiviToggle(m,S); mgmtCercleToggle(m,K);
    m.facts.push({c:m.cycle,k:'injury',a:U});
    m.facts.push({c:m.cycle-3,k:'injury',a:S});
    m.facts.push({c:m.cycle-6,k:'injury',a:K});
    G.U=U; G.S=S; G.K=K;`);
  const [U,S,K]=res(win,`return [G.U,G.S,G.K];`);
  assert.deepEqual(res(win,`return mgmtMarquesAllumees(G.mgmt);`),[K],'le cercle passe, l\'inconnu plus récent attend');
  /* « Sans K » : ses événements sont lus (fiche ouverte) — K n'est plus candidat.
     Les index des faits ne bougent pas : jamais un filtre de m.facts ici. */
  win.eval(`mgmtVuEnregistre(G.mgmt,G.K);`);
  assert.deepEqual(res(win,`return mgmtMarquesAllumees(G.mgmt);`),[S],'sans K, le suivi passe');
  win.eval(`mgmtVuEnregistre(G.mgmt,G.S);`);
  assert.deepEqual(res(win,`return mgmtMarquesAllumees(G.mgmt);`),[U],'sans K ni S, l\'inconnu passe');
});

test('Budget — à lien égal le plus récent passe, à date égale le mieux classé, puis l\'identifiant', () => {
  const win=neuve(7);
  /* Le plus récent, à lien égal. */
  let r=res(win,`const m=G.mgmt; mgmtVisitesInit(m); mgmtMarqueBudget=function(){return 1;};
    const A=m.roster[0].id, B=m.roster[1].id;
    m.facts.push({c:m.cycle,k:'injury',a:A});
    m.facts.push({c:m.cycle-1,k:'injury',a:B});
    return {A,B,al:mgmtMarquesAllumees(m)};`);
  assert.deepEqual(r.al,[r.A],'le fait du cycle courant passe devant celui de la veille');
  /* À date égale, en même division : le mieux classé de la portée organization. */
  r=res(win,`const m=G.mgmt; mgmtMarqueBudget=function(){return 1;};
    const div=m.roster[0].div, rk=mgmtDivisionRanking(m,div,'organization').map(o=>o.id);
    const X=rk[0], Y=rk[1];
    m.facts=m.facts.filter(x=>!(x&&x.k==='injury'));
    m.facts.push({c:m.cycle,k:'injury',a:X});
    m.facts.push({c:m.cycle,k:'injury',a:Y});
    return {div,X,Y,al:mgmtMarquesAllumees(m)};`);
  assert.deepEqual(r.al,[r.X],'à date égale, le mieux classé (rang 0 devant rang 1)');
  /* Le tri est total : les mêmes faits poussés à l'envers donnent le même résultat. */
  r=res(win,`const m=G.mgmt; const rk=mgmtDivisionRanking(m,${JSON.stringify(r.div)},'organization').map(o=>o.id);
    const X=rk[0], Y=rk[1];
    m.facts=m.facts.filter(x=>!(x&&x.k==='injury'));
    m.facts.push({c:m.cycle,k:'injury',a:Y});
    m.facts.push({c:m.cycle,k:'injury',a:X});
    return {X,Y,al:mgmtMarquesAllumees(m)};`);
  assert.deepEqual(r.al,[r.X],'poussés à l\'envers, le même résultat : le tri est total');
  /* À gravité égale par la décision de la question 4 : à date égale, une
     blessure passe avant un simple combat. */
  r=res(win,`const m=G.mgmt; mgmtMarqueBudget=function(){return 1;};
    const I=m.roster[0].id, adv=m.roster[1].id;
    m.facts=m.facts.filter(x=>!(x&&x.k==='injury'));
    m.hist.push({c:m.cycle,slot:'main',a:{id:I},b:{id:adv},winner:'b'});
    m.facts.push({c:m.cycle,k:'injury',a:I});
    return {I,al:mgmtMarquesAllumees(m)};`);
  assert.deepEqual(r.al,[r.I],'à date égale, la blessure passe avant le simple combat');
  /* L'identifiant : deux combattants premiers (rang 0) de deux catégories
     différentes — même lien, même date, même gravité, même rang : seul
     l'identifiant départage. */
  r=res(win,`const m=G.mgmt; mgmtMarqueBudget=function(){return 1;};
    const d1=m.roster[0].div, d2=m.roster.find(o=>o.div!==d1).div;
    const P=mgmtDivisionRanking(m,d1,'organization')[0].id;
    const Q=mgmtDivisionRanking(m,d2,'organization')[0].id;
    m.facts=m.facts.filter(x=>!(x&&x.k==='injury'));
    m.facts.push({c:m.cycle,k:'injury',a:P});
    m.facts.push({c:m.cycle,k:'injury',a:Q});
    return {P,Q,al:mgmtMarquesAllumees(m)};`);
  assert.deepEqual(r.al,[r.P<r.Q?r.P:r.Q],'à tout égal, l\'identifiant alphabétique départage');
});

test('Budget — ouvrir une fiche allumée libère sa place : la marque qui attendait s\'allume', () => {
  const win=neuve(7);
  win.eval(`const m=G.mgmt; mgmtVisitesInit(m);
    const div=m.roster[0].div, cinq=m.roster.filter(o=>o.div===div).slice(0,5);
    for(const o of cinq){ m.facts.push({c:m.cycle,k:'injury',a:o.id}); }
    G.CING=cinq.map(o=>o.id);`);
  /* Le cas du budget à côté : quatre allumées énumérées par la même voie que
     les trois (jamais un budget sans borne : il court une autre passe). */
  const quatre=res(win,`mgmtMarqueBudget=function(){return 4;}; return mgmtMarquesAllumees(G.mgmt);`);
  const L=res(win,`mgmtMarqueBudget=function(){return 3;}; return mgmtMarquesAllumees(G.mgmt);`);
  assert.equal(L.length,3,'trois allumées au budget 3');
  assert.deepEqual(L,quatre.slice(0,3),'les allumées sont les trois premières de l\'ordre');
  win.eval(`CL.mgmtFiche(${JSON.stringify(L[0])});`);
  const r=res(win,`mgmtMarqueBudget=function(){return 3;}; return mgmtMarquesAllumees(G.mgmt);`);
  assert.equal(r.length,3,'encore trois allumées après la libération');
  assert.ok(!r.includes(L[0]),'la fiche ouverte n\'est plus allumée');
  assert.ok(r.includes(L[1])&&r.includes(L[2]),'les deux suivantes restent allumées');
  assert.ok(r.includes(quatre[3]),'la quatrième de l\'ordre d\'avant s\'allume');
});

test('Budget — mêmes marques après sauvegarde et rechargement, et le calcul ne modifie rien', () => {
  const win=neuve(7);
  win.eval(`const m=G.mgmt; mgmtVisitesInit(m);`);
  jouer(win,5);
  const avant=res(win,`const m=G.mgmt; G.BRUT=JSON.stringify(m); return mgmtMarquesAllumees(m);`);
  assert.ok(avant.length>=1,'quelqu\'un est allumé');
  assert.ok(avant.length<=5,'et toujours dans le budget');
  const ap=res(win,`const m=G.mgmt; const s=JSON.stringify(m);
    return {identique:s===G.BRUT,al:mgmtMarquesAllumees(m)};`);
  assert.ok(ap.identique,'le calcul ne modifie rien dans la partie');
  assert.deepEqual(ap.al,avant,'deux appels identiques, la même liste');
  win.eval(`saveMgmt(); G.mgmt=null; loadMgmt();`);
  const rep=res(win,`return mgmtMarquesAllumees(G.mgmt);`);
  assert.deepEqual(rep,avant,'les mêmes marques après sauvegarde et rechargement');
});

test('Budget — mfMarqueNom ne dessine que les marques allumées', () => {
  const win=neuve(7);
  win.eval(`const m=G.mgmt; mgmtVisitesInit(m);`);
  jouer(win,5);
  const r=res(win,`const m=G.mgmt, lit=mgmtMarquesAllumees(m); let ok=true;
    for(const o of m.roster){ if((mfMarqueNom(m,o.id)!=='')!==lit.includes(o.id)) ok=false; }
    return {ok,marq:m.roster.filter(o=>mgmtMarque(m,o.id)).length,lit};`);
  assert.ok(r.marq>=150,'le budget mord vraiment : '+r.marq+' marqués (mesuré 204, graine 7, 5 soirées)');
  assert.ok(r.lit.length>=3&&r.lit.length<=5,'entre 3 et 5 marques dessinées');
  assert.ok(r.ok,'mfMarqueNom est non vide exactement pour les ids de mgmtMarquesAllumees');
});

test('Budget — une place revient à un combattant hors du cercle et des suivis quand il y en a un', () => {
  const win=neuve(7);
  win.eval(`const m=G.mgmt; mgmtVisitesInit(m); mgmtMarqueBudget=function(){return 3;};
    const div=m.roster[0].div, quatre=m.roster.filter(o=>o.div===div).slice(0,4);
    const K1=quatre[0].id, K2=quatre[1].id, K3=quatre[2].id, U=quatre[3].id;
    mgmtCercleToggle(m,K1); mgmtCercleToggle(m,K2); mgmtCercleToggle(m,K3);
    for(const id of [K1,K2,K3]){ m.facts.push({c:m.cycle,k:'injury',a:id}); }
    if(!mgmtMarquesAllumees(m).every(id=>id!==U)) throw new Error('U ne devrait pas être allumé sans son fait');
    m.facts.push({c:m.cycle,k:'injury',a:U});
    G.IDS={K1,K2,K3,U};`);
  const r=JSON.parse(win.eval('JSON.stringify(G.IDS)'));
  const al=res(win,`return mgmtMarquesAllumees(G.mgmt);`);
  assert.equal(al.length,3,'le budget n\'a pas grossi');
  assert.ok(al.includes(r.U),'une place revient à l\'autre quand il y en a un en attente');
  assert.equal(al.filter(id=>id!==r.U).length,2,'le cercle garde les autres places');
  assert.ok(al.filter(id=>id!==r.U).every(id=>id===r.K1||id===r.K2||id===r.K3),'les places restantes vont au cercle, dans l\'ordre prévu');
});

test('Budget — un combattant retiré n\'occupe pas de place', () => {
  const win=neuve(7);
  win.eval(`const m=G.mgmt; mgmtVisitesInit(m); mgmtMarqueBudget=function(){return 1;};
    const R=m.roster[0].id, V=m.roster[1].id;
    m.facts.push({c:m.cycle,k:'injury',a:R});
    const rf=m.roster.find(o=>o.id===R);
    rf.retired=true;
    m.facts.push({c:m.cycle,k:'injury',a:V});
    G.R=R; G.V=V;`);
  const [R,V]=res(win,`return [G.R,G.V];`);
  assert.deepEqual(res(win,`return mgmtMarquesAllumees(G.mgmt);`),[V],'le retiré ne prend pas de place, le vivant est allumé');
  /* Et il l'a d'autant moins que sa marque restera jamais dessinée. */
  assert.equal(res(win,`return mfMarqueNom(G.mgmt,G.R);`),'','aucune marque dessinée sur le retiré');
});

test('Budget — le calcul tient dans le temps d\'un rendu', () => {
  const win=neuve(7);
  win.eval(`const m=G.mgmt; mgmtVisitesInit(m);`);
  for(let i=0;i<40;i++){
    const j=jouer(win,1,{titre:true});
    assert.ok(j>=1,'la soirée '+(i+1)+' a été jouée');
  }
  const ms=res(win,`const m=G.mgmt; const t0=Date.now();
    const n=20;
    for(let i=0;i<n;i++){ mgmtMarquesAllumees(m); }
    return {moy:(Date.now()-t0)/n,n};`);
  assert.ok(ms.moy<40,'moyenne de '+ms.moy.toFixed(1)+' ms sur '+ms.n+' appels (40 ms au plus)');
});

test('Budget — le dessin passe par mgmtMarqueAllumee', () => {
  const fs=require('node:fs');
  const src=fs.readFileSync(__dirname+'/../mgmt-cadre.js','utf8');
  const i=src.indexOf('function mfMarqueNom(');
  assert.notEqual(i,-1,'mfMarqueNom existe');
  const corps=src.slice(i,src.indexOf('function mfVoix',i));
  assert.ok(corps.length>0,'le corps de mfMarqueNom est isolé');
  assert.ok(corps.includes('mgmtMarqueAllumee('),'mfMarqueNom dessine via mgmtMarqueAllumee');
  assert.ok(!corps.includes('mgmtMarque('),'et ne lit plus la marque brute');
});
