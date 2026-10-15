"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const touche=(win,key)=>win.eval(`keysHandle({key:${JSON.stringify(key)},preventDefault(){}})`);

const win=newGameWindow({runMain:true});
win.eval(`setSeed(9); window.BASE=mgmtDefault(); mgmtNewRoster(BASE); mgmtExteriorEnsure(BASE);`);

function ev(code){ return JSON.parse(win.eval(`JSON.stringify((()=>{${code}})())`)); }

test('Monde lot 4 T1 — une pile contient quatre à six combattants libres avec des familles distinctes',()=>{
  const r=ev(`setSeed(20261015);
    const m=JSON.parse(JSON.stringify(BASE)); m.hist=[]; m.facts=[]; m.cycle=20; m.card.main=[]; m.card.prelims=[];
    const pile=mgmtDossiersCombattants(m);
    return {n:pile.length,ids:pile.map(d=>d.combattant.id),fams:pile.map(d=>d.raison.famille),
      ok:pile.every(d=>mgmtSelectable(m,d.combattant,null)&&!mgmtEngaged(m,d.combattant))};`);
  assert.ok(r.n>=4&&r.n<=6,'taille');
  assert.equal(new Set(r.ids).size,r.n,'ids distincts');
  assert.equal(new Set(r.fams).size,r.n,'familles distinctes');
  assert.equal(r.ok,true,'disponibles et non engagés');
});

test('Monde lot 4 T1 — moins de quatre candidats admissibles sont tous retournés',()=>{
  for(const n of [1,2,3]){
    const r=ev(`setSeed(20261016);
      const m=mgmtDefault(); m.roster=[]; m.hist=[]; m.facts=[]; m.cycle=20; m.card.main=[]; m.card.prelims=[];
      const mk=(id,div,org,ret)=>({id:id,name:id,first:id,last:'X',W:1,L:0,D:0,age:24,div:div,divName:'X',org:org,level:1,raison:null,interactions:0,retired:ret});
      const div='H-light';
      for(let i=0;i<${n};i++) m.roster.push(mk('c'+i,div,m.org,false));
      m.roster.push(mk('part',div,m.org,false));
      m.roster.push(mk('adv',div,'Autre',false));
      for(let i=0;i<3;i++) m.roster.push(mk('r'+i,div,m.org,'medical'));
      const pile=mgmtDossiersCombattants(m,'part');
      return {len:pile.length, ids:pile.map(d=>d.combattant.id).slice().sort()};`);
    const attendus=Array.from({length:n},(_,i)=>'c'+i).sort();
    assert.equal(r.len,n,'taille pour '+n);
    assert.deepEqual(r.ids,attendus,'ids admissibles pour '+n);
  }
});

test('Monde lot 4 T1 — la raison de chaque dossier correspond à une preuve de la paire',()=>{
  const r=ev(`setSeed(20261017);
    const m=JSON.parse(JSON.stringify(BASE)); m.hist=[]; m.facts=[]; m.cycle=20; m.card.main=[]; m.card.prelims=[];
    const pile=mgmtDossiersCombattants(m);
    return pile.map(d=>({
      match: mgmtRaisonsPourPaire(m,d.combattant,d.adversaire).some(x=>JSON.stringify(x)===JSON.stringify(d.raison)),
      bookable: mgmtSelectable(m,d.adversaire,d.combattant.id),
      sameDiv: d.adversaire.div===d.combattant.div,
      engaged: mgmtEngaged(m,d.adversaire)
    }));`);
  for(const x of r){
    assert.equal(x.match,true);
    assert.equal(x.bookable,true);
    assert.equal(x.sameDiv,true);
    assert.equal(x.engaged,false);
  }
});

test('Monde lot 4 T1 — redemander une pile ne répète pas les combattants déjà montrés',()=>{
  const r=ev(`setSeed(20261018);
    const m=JSON.parse(JSON.stringify(BASE)); m.hist=[]; m.facts=[]; m.cycle=20; m.card.main=[]; m.card.prelims=[];
    const p1=mgmtDossiersCombattants(m);
    const seen=p1.map(d=>d.combattant.id);
    const p2=mgmtDossiersCombattants(m,null,seen);
    return {repeat: p2.some(d=>seen.includes(d.combattant.id)), n1:p1.length,n2:p2.length};`);
  assert.equal(r.repeat,false);
});

test('Monde lot 4 T1 — les combattants d’une autre organisation sont exclus',()=>{
  const r=ev(`setSeed(20261020);
    const m=JSON.parse(JSON.stringify(BASE)); m.hist=[]; m.facts=[]; m.cycle=20; m.card.main=[]; m.card.prelims=[];
    for(const f of [{id:'x1',name:'X',first:'X',last:'Y',W:1,L:0,D:0,age:24,div:m.roster[0].div,divName:'X',org:'Autre',level:1,raison:null,interactions:0}]) m.roster.push(f);
    const autres=['x1'];
    const pile=mgmtDossiersCombattants(m);
    return {leak: pile.some(d=>autres.includes(d.combattant.id)),
      advLeak: pile.some(d=>autres.includes(d.adversaire.id))};`);
  assert.equal(r.leak,false);
  assert.equal(r.advLeak,false);
});

test('Monde lot 4 T1 — la même graine et le même état donnent la même pile sans effet de bord',()=>{
  const seed=20261019;
  const w1=newGameWindow({runMain:true});
  const w2=newGameWindow({runMain:true});
  w1.eval(`setSeed(9); window.BASE=mgmtDefault(); mgmtNewRoster(BASE); mgmtExteriorEnsure(BASE);`);
  w2.eval(`setSeed(9); window.BASE=mgmtDefault(); mgmtNewRoster(BASE); mgmtExteriorEnsure(BASE);`);
  const a=JSON.parse(w1.eval(`JSON.stringify((()=>{setSeed(${seed});
    const m=JSON.parse(JSON.stringify(BASE)); m.hist=[]; m.facts=[]; m.cycle=20; m.card.main=[]; m.card.prelims=[];
    const beforeM=JSON.stringify(m); const beforeG=JSON.stringify(G); const beforeSeed=SEED;
    const pile=mgmtDossiersCombattants(m);
    return {res:JSON.stringify(pile),beforeM,afterM:JSON.stringify(m),beforeG,afterG:JSON.stringify(G),beforeSeed,afterSeed:SEED};})())`));
  const b=JSON.parse(w2.eval(`JSON.stringify((()=>{setSeed(${seed});
    const m=JSON.parse(JSON.stringify(BASE)); m.hist=[]; m.facts=[]; m.cycle=20; m.card.main=[]; m.card.prelims=[];
    const pile=mgmtDossiersCombattants(m);
    return {res:JSON.stringify(pile)};})())`));
  assert.equal(a.res,b.res);
  assert.equal(a.beforeM,a.afterM);
  assert.equal(a.beforeG,a.afterG);
  assert.equal(a.beforeSeed,a.afterSeed);
});

test('Monde lot 4 T2 — une pile contient quatre à six adversaires libres de la catégorie du combattant',()=>{
  const r=ev(`setSeed(20261015);
    const m=JSON.parse(JSON.stringify(BASE)); m.hist=[]; m.facts=[]; m.cycle=20; m.card.main=[]; m.card.prelims=[];
    const f=m.roster.find(x=>mgmtSelectable(m,x,null));
    const pile=mgmtDossiersAdversaires(m,f.id);
    return {n:pile.length,ids:pile.map(d=>d.adversaire.id),fams:pile.map(d=>d.raison.famille),
      combattant:pile.map(d=>d.combattant.id),
      ok:pile.every(d=>d.combattant.id===f.id&&mgmtSelectable(m,d.adversaire,f.id)&&!mgmtEngaged(m,d.adversaire)&&d.adversaire.org===f.org&&d.adversaire.div===f.div)};`);
  assert.ok(r.n>=4&&r.n<=6,'taille');
  assert.equal(new Set(r.ids).size,r.n,'ids distincts');
  assert.equal(new Set(r.fams).size,r.n,'familles distinctes');
  assert.equal(new Set(r.combattant).size,1,'un seul combattant choisi');
  assert.equal(r.ok,true,'adversaires libres et sélectionnables');
});

test('Monde lot 4 T2 — moins de quatre adversaires admissibles sont tous retournés',()=>{
  for(const n of [1,2,3]){
    const r=ev(`setSeed(20261016);
      const m=mgmtDefault(); m.roster=[]; m.hist=[]; m.facts=[]; m.cycle=20; m.card.main=[]; m.card.prelims=[];
      const mk=(id,div,org,ret)=>({id:id,name:id,first:id,last:'X',W:1,L:0,D:0,age:24,div:div,divName:'X',org:org,level:1,raison:null,interactions:0,retired:ret});
      const div='H-light';
      m.roster.push(mk('part',div,m.org,false));
      for(let i=0;i<${n};i++) m.roster.push(mk('c'+i,div,m.org,false));
      m.roster.push(mk('r0',div,m.org,'medical'));
      m.roster.push(mk('adv',div,'Autre',false));
      const pile=mgmtDossiersAdversaires(m,'part');
      return {len:pile.length, ids:pile.map(d=>d.adversaire.id).slice().sort()};`);
    const attendus=Array.from({length:n},(_,i)=>'c'+i).sort();
    assert.equal(r.len,n,'taille pour '+n);
    assert.deepEqual(r.ids,attendus,'ids admissibles pour '+n);
  }
});

test('Monde lot 4 T2 — chaque raison correspond à une preuve de la paire choisie',()=>{
  const r=ev(`setSeed(20261017);
    const m=JSON.parse(JSON.stringify(BASE)); m.hist=[]; m.facts=[]; m.cycle=20; m.card.main=[]; m.card.prelims=[];
    const f=m.roster.find(x=>mgmtSelectable(m,x,null));
    const pile=mgmtDossiersAdversaires(m,f.id);
    return pile.map(d=>({
      match: mgmtRaisonsPourPaire(m,d.combattant,d.adversaire).some(x=>JSON.stringify(x)===JSON.stringify(d.raison)),
      bookable: mgmtSelectable(m,d.adversaire,f.id),
      sameDiv: d.adversaire.div===d.combattant.div,
      engaged: mgmtEngaged(m,d.adversaire)
    }));`);
  for(const x of r){
    assert.equal(x.match,true);
    assert.equal(x.bookable,true);
    assert.equal(x.sameDiv,true);
    assert.equal(x.engaged,false);
  }
});

test('Monde lot 4 T2 — une pile ne répète aucune famille de raison',()=>{
  const r=ev(`setSeed(20261022);
    const m=JSON.parse(JSON.stringify(BASE)); m.hist=[]; m.facts=[]; m.cycle=20; m.card.main=[]; m.card.prelims=[];
    const f=m.roster.find(x=>mgmtSelectable(m,x,null));
    const pile=mgmtDossiersAdversaires(m,f.id);
    return pile.map(d=>d.raison.famille);`);
  assert.equal(new Set(r).size,r.length);
});

test('Monde lot 4 T2 — redemander une pile ne répète pas les adversaires déjà montrés',()=>{
  const r=ev(`setSeed(20261018);
    const m=JSON.parse(JSON.stringify(BASE)); m.hist=[]; m.facts=[]; m.cycle=20; m.card.main=[]; m.card.prelims=[];
    const f=m.roster.find(x=>mgmtSelectable(m,x,null));
    const p1=mgmtDossiersAdversaires(m,f.id);
    const seen=p1.map(d=>d.adversaire.id);
    const p2=mgmtDossiersAdversaires(m,f.id,seen);
    return {repeat: p2.some(d=>seen.includes(d.adversaire.id)), n1:p1.length,n2:p2.length};`);
  assert.equal(r.repeat,false);
});

test('Monde lot 4 T2 — combattant absent ou invalide ne produit aucun adversaire',()=>{
  const r=ev(`setSeed(20261021);
    const m=JSON.parse(JSON.stringify(BASE)); m.hist=[]; m.facts=[]; m.cycle=20; m.card.main=[]; m.card.prelims=[];
    const f=m.roster.find(x=>mgmtSelectable(m,x,null));
    const unknown=mgmtDossiersAdversaires(m,'aucun-id').length;
    // indisponible (suspension jusqu'au cycle courant)
    f.susp=m.cycle+5;
    const indispo=mgmtDossiersAdversaires(m,f.id).length;
    f.susp=0;
    // engagé sur la carte
    const advers=m.roster.find(x=>x.id!==f.id&&x.div===f.div&&mgmtSelectable(m,x,f.id));
    if(advers) mgmtBookMain(m,f.id,advers.id);
    const engaged=mgmtDossiersAdversaires(m,f.id).length;
    return {unknown:unknown, indispo:indispo, engaged:engaged};`);
  assert.equal(r.unknown,0,'ID inconnu');
  assert.equal(r.indispo,0,'combattant indisponible');
  assert.equal(r.engaged,0,'combattant engagé');
});

test('Monde lot 4 T2 — la même graine et le même état donnent la même pile sans effet de bord',()=>{
  const seed=20261019;
  const w1=newGameWindow({runMain:true});
  const w2=newGameWindow({runMain:true});
  w1.eval(`setSeed(9); window.BASE=mgmtDefault(); mgmtNewRoster(BASE); mgmtExteriorEnsure(BASE);`);
  w2.eval(`setSeed(9); window.BASE=mgmtDefault(); mgmtNewRoster(BASE); mgmtExteriorEnsure(BASE);`);
  const a=JSON.parse(w1.eval(`JSON.stringify((()=>{setSeed(${seed});
    const m=JSON.parse(JSON.stringify(BASE)); m.hist=[]; m.facts=[]; m.cycle=20; m.card.main=[]; m.card.prelims=[];
    const f=mgmtCartRows(m).find(x=>mgmtSelectable(m,x,null));
    const beforeM=JSON.stringify(m); const beforeG=JSON.stringify(G); const beforeSeed=SEED;
    const pile=mgmtDossiersAdversaires(m,f.id);
    return {res:JSON.stringify(pile),beforeM,afterM:JSON.stringify(m),beforeG,afterG:JSON.stringify(G),beforeSeed,afterSeed:SEED};})())`));
  const b=JSON.parse(w2.eval(`JSON.stringify((()=>{setSeed(${seed});
    const m=JSON.parse(JSON.stringify(BASE)); m.hist=[]; m.facts=[]; m.cycle=20; m.card.main=[]; m.card.prelims=[];
    const f=mgmtCartRows(m).find(x=>mgmtSelectable(m,x,null));
    const pile=mgmtDossiersAdversaires(m,f.id);
    return {res:JSON.stringify(pile)};})())`));
  assert.equal(a.res,b.res);
  assert.equal(a.beforeM,a.afterM);
  assert.equal(a.beforeG,a.afterG);
  assert.equal(a.beforeSeed,a.afterSeed);
});

test('Monde lot 4 T4 — Entrée choisit le combattant du dossier courant puis affiche ses adversaires',()=>{
  const win=newGameWindow({runMain:true});
  win.eval(`setSeed(7); CL.mgmtEnter(1); CL.go('mgmt_carte'); CL.mgmtDossiers();`);
  const cid=win.eval('MGMT_CART.dossiers[MGMT_CART.index].combattant.id');
  assert.equal(win.eval('MGMT_CART.etape'),1);
  touche(win,'Enter');
  assert.equal(win.eval('MGMT_CART.etape'),2);
  assert.equal(win.eval('MGMT_CART.dossierCombattant'),cid);
  assert.ok(win.eval('MGMT_CART.dossiers.length')>0);
  assert.equal(win.eval('G.mgmt.card.main.length'),0);
});

test('Monde lot 4 T4 — les flèches font défiler les dossiers sans changer la carte',()=>{
  const win=newGameWindow({runMain:true});
  win.eval(`setSeed(7); CL.mgmtEnter(1); CL.go('mgmt_carte'); CL.mgmtDossiers(); CL.mgmtCarteEntree();`);
  const ids=win.eval('MGMT_CART.dossiers.length');
  const mainBefore=win.eval('JSON.stringify(G.mgmt.card.main)');
  const idx0=win.eval('MGMT_CART.index');
  touche(win,'ArrowRight');
  const idx1=win.eval('MGMT_CART.index');
  assert.notEqual(idx1,idx0);
  touche(win,'ArrowLeft');
  assert.equal(win.eval('MGMT_CART.index'),idx0);
  assert.equal(win.eval('JSON.stringify(G.mgmt.card.main)'),mainBefore);
});

test('Monde lot 4 T4 — Échap revient à la liste ou à l’étape précédente',()=>{
  const win=newGameWindow({runMain:true});
  win.eval(`setSeed(7); CL.mgmtEnter(1); CL.go('mgmt_carte'); CL.mgmtDossiers();`);
  touche(win,'Escape');
  assert.equal(win.eval('MGMT_CART.mode'),'liste');
  assert.equal(win.eval('G.mgmt.card.main.length'),0);
  // step2 -> step1
  win.eval(`CL.mgmtDossiers(); CL.mgmtCarteEntree();`);
  const cid=win.eval('MGMT_CART.dossierCombattant');
  touche(win,'Escape');
  assert.equal(win.eval('MGMT_CART.etape'),1);
  assert.equal(win.eval('MGMT_CART.dossierCombattant'),cid);
  assert.equal(win.eval('G.mgmt.card.main.length'),0);
});

test('Monde lot 4 T4 — confirmer un adversaire passe par mgmtBookMain et pose le combat choisi',()=>{
  const win=newGameWindow({runMain:true});
  win.eval(`setSeed(7); CL.mgmtEnter(1); CL.go('mgmt_carte'); CL.mgmtDossiers();
   window.__book=[]; const __orig=mgmtBookMain; mgmtBookMain=(m,a,b)=>{window.__book.push([a,b]); return __orig(m,a,b);};`);
  win.eval('CL.mgmtCarteEntree();');
  const cid=win.eval('MGMT_CART.dossierCombattant');
  const aid=win.eval('MGMT_CART.dossiers[MGMT_CART.index].adversaire.id');
  touche(win,'Enter');
  const books=JSON.parse(win.eval('JSON.stringify(window.__book)'));
  assert.equal(books.length,1);
  assert.equal(books[0][0],cid);
  assert.equal(books[0][1],aid);
  assert.equal(win.eval('G.mgmt.card.main.length'),1);
  assert.equal(win.eval('G.mgmt.card.main[0].a'),cid);
  assert.equal(win.eval('G.mgmt.card.main[0].b'),aid);
});

test('Monde lot 4 T4 — F ouvre la fiche du dossier courant',()=>{
  const win=newGameWindow({runMain:true});
  win.eval(`setSeed(7); CL.mgmtEnter(1); CL.go('mgmt_carte'); CL.mgmtDossiers();`);
  const cid=win.eval('MGMT_CART.dossiers[MGMT_CART.index].combattant.id');
  win.eval('CL.mgmtCarteFiche();');
  assert.equal(win.eval('MGMT_FICHE.id'),cid);
  win.eval('CL.mgmtFicheRetour();');
  win.eval('MGMT_CART.mode="dossiers"; render();');
  win.eval('CL.mgmtCarteEntree();');
  const aid=win.eval('MGMT_CART.dossiers[MGMT_CART.index].adversaire.id');
  win.eval('CL.mgmtCarteFiche();');
  assert.equal(win.eval('MGMT_FICHE.id'),aid);
});

test('Monde lot 4 T4 — D’autres dossiers ne répète aucun candidat déjà montré',()=>{
  const win=newGameWindow({runMain:true});
  win.eval(`setSeed(7); CL.mgmtEnter(1); CL.go('mgmt_carte'); CL.mgmtDossiers();`);
  const seen=JSON.parse(win.eval('JSON.stringify(MGMT_CART.dossiers.map(d=>d.combattant.id))'));
  win.eval('CL.mgmtCarteProposer();');
  const nids=JSON.parse(win.eval('JSON.stringify(MGMT_CART.dossiers.map(d=>d.combattant.id))'));
  assert.equal(nids.some(x=>seen.includes(x)),false);
});

test('Monde lot 4 T4 — L bascule entre dossiers et liste complète sans perdre le choix',()=>{
  const win=newGameWindow({runMain:true});
  win.eval(`setSeed(7); CL.mgmtEnter(1); CL.go('mgmt_carte'); CL.mgmtDossiers(); CL.mgmtCarteEntree();`);
  const cid=win.eval('MGMT_CART.dossierCombattant');
  const mainBefore=win.eval('G.mgmt.card.main.length');
  win.eval('CL.mgmtDossierListe();');
  assert.equal(win.eval('MGMT_CART.mode'),'liste');
  assert.equal(win.eval('MGMT_CART.listeDepuisDossiers'),true);
  assert.equal(win.eval('MGMT_CART.dossierCombattant'),cid);
  win.eval('CL.mgmtDossierRetour();');
  assert.equal(win.eval('MGMT_CART.mode'),'dossiers');
  assert.equal(win.eval('G.mgmt.card.main.length'),mainBefore);
});

test('Monde lot 4 T4 — les actions souris correspondent aux actions clavier',()=>{
  const win=newGameWindow({runMain:true});
  win.eval(`setSeed(7); CL.mgmtEnter(1); CL.go('mgmt_carte'); CL.mgmtDossiers();`);
  const idx0=win.eval('MGMT_CART.index');
  win.eval(`document.querySelector('.mf-dossier-nav button[aria-label="Suivant"]').click();`);
  assert.notEqual(win.eval('MGMT_CART.index'),idx0);
  win.eval(`document.querySelector('.mf-dossier-nav button[aria-label="Précédent"]').click();`);
  assert.equal(win.eval('MGMT_CART.index'),idx0);
  // contrôle F atteint la même action que la touche affichée
  assert.ok(win.eval(`document.body.innerHTML.includes('mgmtCarteFiche')`));
});

test('Monde lot 4 T4 — la présentation du combat porte sur la paire active',()=>{
  const win=newGameWindow({runMain:true});
  win.eval(`setSeed(7); CL.mgmtEnter(1); CL.go('mgmt_carte'); CL.mgmtDossiers(); CL.mgmtCarteEntree();
   window.__pres=[]; CL.mgmtPresentationCombat=(a,b)=>{window.__pres.push([a,b]);};`);
  const cid=win.eval('MGMT_CART.dossierCombattant');
  const aid=win.eval('MGMT_CART.dossiers[MGMT_CART.index].adversaire.id');
  win.eval('CL.mgmtDossierPresentation();');
  const pres=JSON.parse(win.eval('JSON.stringify(window.__pres)'));
  assert.equal(pres.length,1);
  assert.equal(pres[0][0],cid);
  assert.equal(pres[0][1],aid);
  assert.equal(win.eval('G.mgmt.card.main.length'),0);
});

test('Monde lot 4 T4 — les noms joueurs injectés dans le rendu sont échappés',()=>{
  const win=newGameWindow({runMain:true});
  win.eval(`setSeed(7); CL.mgmtEnter(1); CL.go('mgmt_carte'); CL.mgmtDossiers();
   const d=MGMT_CART.dossiers[0]; const f=mgmtFighterById(G.mgmt,d.combattant.id);
   f.name='<img src=x onerror=alert(1)>'; f.last='<img src=x onerror=alert(1)>'; f.first='<b>x</b>';
   render();`);
  assert.equal(win.eval(`document.querySelectorAll('#app img').length`),0);
  assert.ok(win.eval(`document.getElementById('app').innerHTML.includes('&lt;')`));
});

test('Monde lot 4 T4 — dossiers et liste laissent le même état après le même booking',()=>{
  const w1=newGameWindow({runMain:true});
  const w2=newGameWindow({runMain:true});
  w1.eval(`setSeed(7); CL.mgmtEnter(1); CL.go('mgmt_carte'); CL.mgmtDossiers(); CL.mgmtCarteEntree(); CL.mgmtCarteEntree();`);
  // liste route second
  w2.eval(`setSeed(7); CL.mgmtEnter(1); CL.go('mgmt_carte');`);
  // find first selectable fighter/adversaire like dossier not always same; instead trust dossier pair from w1
  const cid=w1.eval('G.mgmt.card.main[0].a');
  const aid=w1.eval('G.mgmt.card.main[0].b');
  w2.eval(`MGMT_CART.pick='${cid}'; MGMT_CART.cursor=0; render();`);
  w2.eval(`CL.mgmtPick('${aid}');`);
  assert.equal(JSON.stringify(JSON.parse(w1.eval('JSON.stringify(G.mgmt.card)'))),JSON.stringify(JSON.parse(w2.eval('JSON.stringify(G.mgmt.card)'))));
});

test('Monde lot 4 T4 — le mode dossiers ne change pas après rechargement du même état seedé',()=>{
  const w1=newGameWindow({runMain:true});
  const w2=newGameWindow({runMain:true});
  w1.eval(`setSeed(7); CL.mgmtEnter(1); CL.go('mgmt_carte'); CL.mgmtDossiers();`);
  w2.eval(`setSeed(7); CL.mgmtEnter(1); CL.go('mgmt_carte'); CL.mgmtDossiers();`);
  const a=JSON.parse(w1.eval('JSON.stringify(MGMT_CART.dossiers.map(d=>({c:d.combattant.id,a:d.adversaire&&d.adversaire.id,r:d.raison})))'));
  const b=JSON.parse(w2.eval('JSON.stringify(MGMT_CART.dossiers.map(d=>({c:d.combattant.id,a:d.adversaire&&d.adversaire.id,r:d.raison})))'));
  assert.deepEqual(a,b);
});
