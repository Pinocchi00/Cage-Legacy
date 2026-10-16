"use strict";
/* ==== [ANCRE: TESTS_MGMT_NOUVELLE_CHARGEMENT] — Monde lot 2 T7 (décision d'Anthony du 12/10/2026) :
   l'écran de création des six ans se lit, avance en douceur, et attend le bouton du joueur. ==== */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {newGameWindow}=require('./helpers/loadGame');
const css=fs.readFileSync(path.join(__dirname,'..','ui-cadre.css'),'utf8').split('\r\n').join('\n');

function lancer(soirees){
  const win=newGameWindow({runMain:true});
  win.eval(`setSeed(11); CL.mgmtNouvelle(2); MGMT_NOUVELLE.soirees=${soirees}; MGMT_NOUVELLE.i=0; CL.mgmtNouvelleLancer();`);
  return win;
}
async function attendrePret(win){
  const debut=Date.now();
  while(Date.now()-debut<170000){
    await new Promise(r=>setTimeout(r,100));
    if(win.eval('!!(MGMT_NOUVELLE.gen&&MGMT_NOUVELLE.gen.pret)')) return;
  }
  throw new Error('la création n’a pas fini');
}

test('Chargement — la partie attend le bouton : G.mgmt reste null, Entrée ouvre la partie', async () => {
  const win=lancer(2);
  /* Entrée ne relance rien pendant la génération */
  win.eval(`keysHandle({key:'Enter',code:'Enter',preventDefault(){}})`);
  assert.equal(win.eval('!!MGMT_NOUVELLE.gen'),true);
  await attendrePret(win);
  assert.equal(win.eval('G.mgmt'),null,'rien ne s’ouvre tout seul');
  assert.equal(win.eval('G.screen'),'mgmt_nouvelle');
  const html=win.document.getElementById('app').innerHTML;
  /* Monde lot 12 T1, écart 3 : libellé de fin porté de la planche. */
  assert.ok(html.includes('Six ans sont écrits'));
  assert.ok(/Entrer dans /.test(html)&&html.includes('mf-bouton jaune'),'le bouton jaune est là');
  win.eval(`keysHandle({key:'Enter',code:'Enter',preventDefault(){}})`);
  assert.notEqual(win.eval('G.screen'),'mgmt_nouvelle');
  assert.ok(win.eval('!!G.mgmt'),'la partie est ouverte');
  assert.equal(win.eval('MGMT_GEN_TIMERS.lecture===null&&MGMT_GEN_TIMERS.barre===null'),true);
});

test('Chargement — Échap pendant la génération abandonne proprement', () => {
  const win=lancer(2);
  win.eval(`keysHandle({key:'Escape',code:'Escape',preventDefault(){}})`);
  assert.equal(win.eval('MGMT_NOUVELLE.gen'),null);
  assert.equal(win.eval('G.mgmt'),null);
  assert.equal(win.eval('G.screen'),'mgmt_nouvelle');
  assert.equal(win.eval('MGMT_GEN_TIMERS.lecture===null&&MGMT_GEN_TIMERS.barre===null'),true);
});

test('Chargement — les cinq lectures s’affichent une à une, → et ← les parcourent, aucun minuteur après la sortie', async () => {
  const win=lancer(2);
  const titre=()=>win.document.querySelector('.mf-lecture-titre').textContent;
  const vus=[titre()];
  assert.equal(win.eval('MGMT_NOUVELLE_LECTURES.length'),5);
  assert.equal(win.document.querySelectorAll('.mf-lecture-pastille').length,5);
  for(let i=0;i<4;i++){ win.eval(`keysHandle({key:'ArrowRight',code:'ArrowRight',preventDefault(){}})`); vus.push(titre()); }
  assert.equal(new Set(vus).size,5,'cinq cartons différents');
  win.eval(`keysHandle({key:'ArrowLeft',code:'ArrowLeft',preventDefault(){}})`);
  assert.equal(titre(),vus[3]);
  win.document.querySelectorAll('.mf-lecture-pastille')[1].click();
  assert.equal(titre(),vus[1],'une pastille est cliquable');
  assert.notEqual(win.eval('MGMT_GEN_TIMERS.lecture'),null,'un seul minuteur vivant');
  await attendrePret(win);
  win.eval('CL.mgmtNouvelleRetour()');
  assert.equal(win.eval('MGMT_NOUVELLE.gen'),null);
  assert.equal(win.eval('MGMT_GEN_TIMERS.lecture===null&&MGMT_GEN_TIMERS.barre===null'),true);
});

test('Chargement — aucun texte sous 22 px dans l’écran de création', () => {
  const regles=[...css.matchAll(/(\.mf-(?:genese|lecture)[^{]*)\{([^}]*)\}/g)];
  assert.ok(regles.length>10);
  for(const [,sel,corps] of regles){
    const f=corps.match(/font-size:(\d+)px/);
    if(f) assert.ok(+f[1]>=22,sel+' : '+f[1]+' px');
  }
  const win=lancer(2);
  const html=win.document.getElementById('app').innerHTML;
  for(const m of html.matchAll(/font-size:(\d+)px/g)) assert.ok(+m[1]>=22,'style en ligne '+m[1]);
  assert.ok(!css.split(/\r?\n/).filter(l=>/mf-genese|mf-lecture/.test(l)).some(l=>/animation|keyframes/.test(l)),'aucune animation en feuille de style');
  assert.ok(fs.readFileSync(path.join(__dirname,'..','mgmt-nouvelle.js'),'utf8').includes('prefers-reduced-motion'),'la lueur est coupée sous prefers-reduced-motion');
  win.eval('CL.mgmtNouvelleAbandonner()');
});

test('Chargement — la largeur de la barre est monotone et finit à 100 %', () => {
  const win=newGameWindow({runMain:true});
  const r=JSON.parse(win.eval(`JSON.stringify((function(){
    let aff=0, cible=0, prev=0, ok=true, pas=0;
    for(let k=0;k<=62;k++){ cible=100*k/62; for(let i=0;i<5;i++){ aff=mgmtNouvelleBarreSuivante(aff,cible); if(aff<prev) ok=false; prev=aff; pas++; } }
    cible=100; for(let i=0;i<200&&aff<100;i++){ aff=mgmtNouvelleBarreSuivante(aff,cible); if(aff<prev) ok=false; prev=aff; }
    return {ok,aff};})())`));
  assert.equal(r.ok,true);
  assert.equal(r.aff,100);
});

test('Chargement — états, compteurs, frise et dernier changement de ceinture', () => {
  const win=newGameWindow({runMain:true});
  const resultat=JSON.parse(win.eval(`JSON.stringify((()=>{
    const g={n:2,k:0,annee:mgmtPasseAnnee(2,0),org:'Test',m:{facts:[{k:'title_initial',div:'H-fly',a:'f1'},{k:'title_fight',div:'H-fly',fight:0,c:1},{k:'title_fight',div:'H-fly',fight:1,c:2},{k:'injury'},{k:'injury'}],hist:[{winner:'B',a:{id:'f1'},b:{id:'f2'}},{winner:'A',a:{id:'f2'},b:{id:'f1'}}]},vus:0,detenteurs:{},champions:0,blessures:0,dernier:null};
    mgmtFighterById=(m,id)=>({nom:id});
    g.m.hist[0].winner='B';g.m.hist[0].a={id:'f1'};g.m.hist[0].b={id:'f2'};
    g.m.hist[1].winner='A';g.m.hist[1].a={id:'f2'};g.m.hist[1].b={id:'f1'};
    const debut=mgmtNouvelleGenHtml(g);mgmtNouvelleLireFaits(g);
    return {chargement:debut.includes('chargement'),champions:g.champions,blessures:g.blessures,vus:g.vus,dernier:g.dernier.nom,compteurs:mgmtNouvelleCompteurs(g).map(x=>x.v),annees:[0,1].map(i=>mgmtPasseAnnee(2,i))};
  })())`));
  assert.equal(resultat.chargement,true);
  assert.equal(resultat.champions,1);
  assert.equal(resultat.blessures,2);
  assert.equal(resultat.vus,5);
  assert.equal(resultat.dernier,'f2');
  assert.equal(resultat.compteurs[0],0);
  assert.deepEqual(resultat.annees,[...resultat.annees].sort());
  const labels=JSON.parse(win.eval(`JSON.stringify(Array.from({length:6},(_,i)=>mgmtPasseAnnee(62,i)))`));
  assert.equal(labels.length,6);
});

test('Chargement — états debut, chargement, fin et erreur', () => {
  const win=newGameWindow({runMain:true});
  const debut=win.eval(`(()=>{const g={n:2,k:0,annee:mgmtPasseAnnee(2,0),org:'Test',m:null,aff:0,detenteurs:{},vus:0,champions:0,blessures:0};return mgmtNouvelleGenHtml(g)})()`);
  assert.match(debut,/mf-genese debut/);
  assert.doesNotMatch(debut,/Entrer dans/);
  /* Monde lot 12 T1, écart 2 : phrase de la planche. */
  assert.match(debut,/Six années se jouent avant ton arrivée/);
  assert.deepEqual([...debut.matchAll(/<b>(\d+)<\/b><span>([^<]+)/g)].map(x=>[x[2],+x[1]]),[['soirées jouées',0],['combats',0],['champions couronnés',0],['blessures',0]]);
  const charge=win.eval(`(()=>{const g={n:2,k:1,annee:mgmtPasseAnnee(2,1),org:'Test',m:{hist:[{}],facts:[]},aff:50,vus:0,detenteurs:{},champions:0,blessures:0};return mgmtNouvelleGenHtml(g)})()`);
  assert.match(charge,/mf-genese chargement/);
  assert.doesNotMatch(charge,/Entrer dans/);
  assert.deepEqual([...charge.matchAll(/<b>(\d+)<\/b><span>([^<]+)/g)].map(x=>[x[2],+x[1]]),[['soirées jouées',1],['combats',1],['champions couronnés',0],['blessures',0]]);
  const fin=win.eval(`(()=>{const g={n:2,k:2,annee:mgmtPasseAnnee(2,1),org:'Test',m:{hist:[],facts:[]},aff:100,pret:true,vus:0,detenteurs:{},champions:0,blessures:0};return mgmtNouvelleGenHtml(g)})()`);
  assert.match(fin,/mf-genese fin/);
  assert.match(fin,/width:100\.00%/);
  assert.match(fin,/Entrer dans Test/);
  assert.deepEqual([...fin.matchAll(/<b>(\d+)<\/b><span>([^<]+)/g)].map(x=>[x[2],+x[1]]),[['soirées jouées',2],['combats',0],['champions couronnés',0],['blessures',0]]);
  const erreur=win.eval(`(()=>{const g={n:2,k:1,annee:mgmtPasseAnnee(2,1),org:'Test',m:{hist:[],facts:[]},aff:35,erreur:true,vus:0,detenteurs:{},champions:0,blessures:0};return mgmtNouvelleGenHtml(g)})()`);
  assert.match(erreur,/mf-genese erreur/);
  assert.match(erreur,/Recommencer/);
  assert.match(erreur,/Choisir une autre organisation/);
  assert.doesNotMatch(erreur,/Entrer dans/);
  assert.match(erreur,/width:35.00%/); /* Planche : barre figée où l erreur est survenue, pas ramenée à zéro. */
  win.eval(`CL.mgmtNouvelle(3); MGMT_NOUVELLE.gen={slot:3,orgId:'test',org:'Test',n:2,k:1,annee:2031,erreur:true,erreurAnnee:2031,erreurMessage:'incident contrôlé',aff:35,m:null,vus:0,detenteurs:{},champions:0,blessures:0};`);
  const detail=win.eval('mgmtNouvelleGenHtml(MGMT_NOUVELLE.gen)');
  /* Monde lot 12 T1 : état erreur de la planche, sans détail technique affiché. */
  assert.match(detail,/2031/); assert.match(detail,/emplacement 3/); assert.match(detail,/Rien n’a été enregistré/);
  assert.match(detail,/Entrée/);
  win.eval(`keysHandle({key:'Enter',code:'Enter',preventDefault(){}})`);
  assert.equal(win.eval('MGMT_NOUVELLE.gen.erreur'),undefined);
  win.eval('CL.mgmtNouvelleAbandonner()'); /* la génération relancée ne doit pas survivre au test */
});

test('Chargement — le dernier fait apparaît dans sa zone et les compteurs reflètent deux soirées', async () => {
  const win=lancer(2);
  await attendrePret(win);
  const debut=Date.now();
  while(Date.now()-debut<5000&&win.document.querySelector('.mf-genese-barre b').style.width!=='100%') await new Promise(r=>setTimeout(r,30));
  const g=win.eval('MGMT_NOUVELLE.gen');
  assert.equal(g.k,2);
  assert.equal(win.document.querySelector('.mf-genese-barre b').style.width,'100%');
  const compteurs=[...win.document.querySelectorAll('.mf-genese-cpt')].map(n=>[n.querySelector('span').textContent,n.querySelector('b').textContent]);
  assert.deepEqual(compteurs.map(x=>x[0]),['soirées jouées','combats','champions couronnés','blessures']);
  assert.equal(+compteurs[0][1],2);
  assert.equal(+compteurs[1][1],win.eval('MGMT_NOUVELLE.gen.m.hist.length'));
  assert.equal(+compteurs[2][1],g.champions);
  assert.equal(+compteurs[3][1],g.blessures);
  win.eval('CL.mgmtNouvelleAbandonner()');
});

test('Chargement — le dernier fait affiche un changement réel de ceinture', () => {
  const win=newGameWindow({runMain:true});
  win.eval(`(()=>{const g={n:2,k:2,annee:mgmtPasseAnnee(2,1),org:'Test',m:{hist:[{winner:'B',a:{id:'ancien'},b:{id:'nouveau'}}],facts:[{k:'title_initial',div:'H-fly',a:'ancien'},{k:'title_fight',div:'H-fly',fight:0,c:2}]},aff:100,pret:true,vus:0,detenteurs:{},champions:0,blessures:0,dernier:null};mgmtFighterById=(m,id)=>({nom:id});mgmtNouvelleLireFaits(g);CL.mgmtNouvelle(1);MGMT_NOUVELLE.gen=g;render();mgmtNouvelleProgression(g);})();`);
  const fait=win.document.querySelector('.mf-genese-dernier-fait');
  assert.ok(fait); assert.match(fait.textContent,/nouveau/); assert.match(fait.textContent,new RegExp(win.eval("mgmtDivisionLabel('H-fly')"))); assert.match(fait.textContent,/soirée 2/);
});

test('Chargement — une progression conserve les nœuds de l’écran', () => {
  const win=lancer(2),racine=win.document.querySelector('.mf-genese'),barre=win.document.querySelector('.mf-genese-barre');
  win.eval('mgmtNouvelleGenPas()');
  assert.equal(win.document.querySelector('.mf-genese'),racine);
  assert.equal(win.document.querySelector('.mf-genese-barre'),barre);
  win.eval('CL.mgmtNouvelleAbandonner()');
});

/* ==== [ANCRE: TEST_MONDE_LOT12_T1_PLANCHE] — Monde lot 12 T1 ==== */
test('Monde lot 12 T1 — la dernière retraite est lue une fois et les noms sont échappés', () => {
  const win=newGameWindow({runMain:true});
  const r=JSON.parse(win.eval(`JSON.stringify((()=>{
    const g={orgId:'split',m:{facts:[{k:'retired',a:'f1',c:3}],hist:[]},vus:0,detenteurs:{},blessures:0};
    mgmtFighterById=()=>({name:'<img src=x>',div:'H-fly'});
    mgmtNouvelleLireFaits(g);mgmtNouvelleLireFaits(g);
    return {vus:g.vus,dernier:g.dernier,html:mgmtNouvelleFaitHtml(g),vide:mgmtNouvelleFaitHtml({})};
  })())`));
  assert.equal(r.vus,1);
  assert.equal(r.dernier.retraite,true);
  assert.equal(r.vide,'');
  assert.match(r.html,/&lt;img src=x&gt;/);
  assert.doesNotMatch(r.html,/<img/);
  assert.match(r.html,/Retraite/);
});

test('Monde lot 12 T1 — le chargement montre l’année, le prédécesseur, la barre en six années et le dernier fait', async () => {
  const win=lancer(2);
  try{
    /* Les deux pas sont réellement simulés ; aucun résultat de combat fabriqué. */
    win.eval('mgmtNouvelleGenSuite=()=>false; mgmtNouvelleGenPas(); mgmtNouvelleGenPas();');
    const g=win.eval('MGMT_NOUVELLE.gen'), ident=win.eval('mgmtOrgIdentite(MGMT_NOUVELLE.gen.orgId)');
    const rac=win.document.querySelector('.mf-genese'), barre=rac.querySelector('.mf-genese-barre');
    assert.match(win.document.body.textContent,/Nouvelle partie · six ans avant ton arrivée/);
    assert.match(win.document.body.textContent,/Emplacement 2/);
    assert.equal(rac.querySelector('.mf-genese-annee').textContent,String(g.annee));
    assert.equal(rac.querySelector('.mf-genese-soiree').textContent,ident.soirees+' 1');
    assert.equal(rac.querySelector('.mf-genese-predecesseur').textContent,`${ident.predecesseur.prenom} ${ident.predecesseur.nom} compose les cartes`);
    assert.match(rac.textContent,/Le dernier fait marquant/);
    assert.ok(rac.querySelector('.mf-genese-dernier-fait').textContent.includes(g.dernier.nom));
    win.eval('CL.mgmtNouvelleLecture(1)');
    assert.equal(win.document.querySelector('.mf-genese-barre'),barre,'lire ne reconstruit pas la barre');
    assert.equal(rac.querySelector('.mf-lecture-titre').textContent,ident.adjointe.prenom+' t’aide.');
    assert.match(rac.textContent,/Carton 2 sur 5/);
    /* Même calcul pur que pour la partie complète : six repères, à leur vrai indice. */
    const h=win.eval(`(()=>{const g={...MGMT_NOUVELLE.gen,n:62,reperes:null};return mgmtNouvelleGenHtml(g)})()`);
    const bloc=win.document.createElement('div');bloc.innerHTML=h;
    const ans=[...bloc.querySelectorAll('.mf-genese-an')];
    assert.equal(ans.length,6);
    assert.equal(bloc.querySelectorAll('.mf-genese-barre i').length,5);
    for(const el of ans){
      const idx=win.eval(`Array.from({length:62},(_,i)=>i).find(i=>mgmtPasseAnnee(62,i)===${+el.dataset.year})`);
      assert.ok(el.getAttribute('style').includes(String(100*idx/62)+'%'));
    }
    win.eval('mgmtNouvelleGenPas()');
    await attendrePret(win);
    const fin=win.document.querySelector('.mf-genese');
    assert.match(fin.textContent,/Six ans sont écrits/);
    assert.match(fin.textContent,/a composé les 2 cartes/);
    assert.ok(fin.querySelector('.mf-genese-dernier-fait').textContent.includes(win.eval('MGMT_NOUVELLE.gen.dernier.nom')));
    assert.equal(win.document.activeElement,fin.querySelector('.mf-genese-entree button'));
    assert.equal(fin.querySelector('.mf-genese-barre b').style.width,'100%');
  }finally{win.eval('CL.mgmtNouvelleAbandonner()');}
});
