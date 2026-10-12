"use strict";
/* Monde lot 8 T2 (docs/lots/MONDE-LOT-8-T2.md) : « Depuis ta dernière visite ».
   En ouvrant la fiche d'un combattant marqué, le joueur lit tout de suite ce
   qui lui est arrivé, en tête de l'onglet « On en dit ». Le bloc se calcule
   AVANT d'enregistrer la visite ; avec du nouveau, la fiche s'ouvre sur « On
   en dit » (décision de la T2, question 1). mgmtFiche.depuis n'est pas
   sauvegardé : une fiche rouverte ne rejoue pas le bloc. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {newGameWindow}=require('./helpers/loadGame');
const jouer=require('./helpers/jouerSoirees');
const res=(win,code)=>JSON.parse(win.eval(`JSON.stringify((function(){${code}})())`));
const css=fs.readFileSync(path.join(__dirname,'..','ui-cadre.css'),'utf8').split('\r\n').join('\n');

function neuve(seed){
  const win=newGameWindow({runMain:true});
  win.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(${seed||7}); CL.mgmtEnter(1);`);
  return win;
}
function premiers(win,n){
  const ids=res(win,`return G.mgmt.roster.slice(0,${n}).map(o=>o.id);`);
  win.eval(`const m=G.mgmt; mgmtVisitesInit(m); G.IDS=${JSON.stringify(ids)};`);
  return ids;
}

test('Depuis — chaque sorte comptée donne une ligne avec la phrase de son système', () => {
  const win=neuve(7);
  const [X,Y]=premiers(win,2);
  /* blessure */
  win.eval(`mgmtAddFact(G.mgmt,{c:G.mgmt.cycle,k:'injury',a:'${X}'});`);
  let r=res(win,`const m=G.mgmt,l=mgmtDepuisVisite(m,'${X}'); return {n:l.length,x:l[0]};`);
  assert.equal(r.n,1,'la blessure seule');
  assert.equal(r.x.phrase,'Blessure'); assert.equal(r.x.sorte,'corps'); assert.equal(r.x.libelle,'Son corps');
  win.eval(`mgmtVuEnregistre(G.mgmt,'${X}');`);
  /* suspension */
  win.eval(`mgmtAddFact(G.mgmt,{c:G.mgmt.cycle,k:'susp',a:'${X}'});`);
  r=res(win,`const m=G.mgmt,l=mgmtDepuisVisite(m,'${X}'); return {n:l.length,x:l[0]};`);
  assert.equal(r.n,1); assert.equal(r.x.phrase,'Suspension médicale'); assert.equal(r.x.sorte,'corps');
  win.eval(`mgmtVuEnregistre(G.mgmt,'${X}');`);
  /* fin de carrière */
  win.eval(`mgmtAddFact(G.mgmt,{c:G.mgmt.cycle,k:'retired',a:'${X}'});`);
  r=res(win,`const m=G.mgmt,l=mgmtDepuisVisite(m,'${X}'); return {n:l.length,x:l[0]};`);
  assert.equal(r.n,1); assert.equal(r.x.phrase,'Fin de carrière médicale'); assert.equal(r.x.sorte,'corps');
  win.eval(`mgmtVuEnregistre(G.mgmt,'${X}');`);
  /* demande avec cible */
  win.eval(`mgmtAddFact(G.mgmt,{c:G.mgmt.cycle,k:'demande',a:'${X}',want:'revanche',target:'${Y}'});`);
  const yName=res(win,`return mgmtFighterById(G.mgmt,'${Y}').name;`);
  r=res(win,`const m=G.mgmt,l=mgmtDepuisVisite(m,'${X}'); return {n:l.length,x:l[0]};`);
  assert.equal(r.n,1); assert.equal(r.x.phrase,'Une revanche — '+yName);
  assert.equal(r.x.sorte,'demande'); assert.equal(r.x.libelle,'Une demande');
  assert.ok(r.x.detail.includes(' · Attend ta réponse'),'la demande encore ouverte annonce ce qu\'elle attend');
  win.eval(`mgmtVuEnregistre(G.mgmt,'${X}');`);
  /* attente */
  win.eval(`mgmtAddFact(G.mgmt,{c:G.mgmt.cycle,k:'attend',a:'${X}',p:1});`);
  const est=res(win,`const m=G.mgmt,f=mgmtFighterById(m,'${X}'),mois=Math.max(1,Math.round(mgmtContratAttente(m,f)*MGMT_VOIX_MOIS_PAR_CYCLE));
    return mgmtFilTitre(m,{k:'combattant',w:'attend',a:'${X}',n:mois});`);
  r=res(win,`const m=G.mgmt,l=mgmtDepuisVisite(m,'${X}'); return {n:l.length,x:l[0]};`);
  assert.equal(r.n,1); assert.equal(r.x.phrase,est); assert.equal(r.x.sorte,'attente'); assert.equal(r.x.libelle,'Une attente');
  win.eval(`mgmtVuEnregistre(G.mgmt,'${X}');`);
  /* moment de vie relayé */
  const moment=res(win,`const m=G.mgmt; return MGMT_MOMENTS.find(x=>x.relais.length>0&&mgmtVieTexte(x)).id;`);
  assert.ok(moment,'fixture : un moment relayé dont la phrase existe');
  win.eval(`mgmtAddFact(G.mgmt,{c:G.mgmt.cycle,k:'moment_vie',a:'${X}',m:${JSON.stringify(moment)}});`);
  const phraseVie=res(win,`return mgmtVieTexte(mgmtVieMomentById(${JSON.stringify(moment)}));`);
  r=res(win,`const m=G.mgmt,l=mgmtDepuisVisite(m,'${X}'); return {n:l.length,x:l[0],c:l[0].c};`);
  assert.equal(r.n,1); assert.equal(r.x.phrase,phraseVie); assert.equal(r.x.sorte,'vie'); assert.equal(r.x.libelle,'Sa vie');
  assert.equal(r.c,win.eval('G.mgmt.cycle'),'le cycle l\'accompagne pour le tri');
});

test('Depuis — un combat du carton principal donne « Victoire · adversaire » et sa seconde ligne', () => {
  const win=neuve(7);
  premiers(win,1);
  const j=jouer(win,1);
  assert.ok(j>=1,'la soirée a été jouée');
  let r=res(win,`const m=G.mgmt, i=m.hist.findIndex(t=>t&&t.slot==='main'&&t.winner!=='D');
    const t=m.hist[i]; if(!t) return null;
    const w=t.winner==='A'?t.a:t.b, p=t.winner==='A'?t.b:t.a;
    const l=mgmtDepuisVisite(m,w.id);
    return {i,w:w.name,p:p.name,t:l.find(x=>x.phrase==='Victoire · '+p.name)||null,
      ligne:mgmtSuRoundLigne(mgmtResultatDetail(m,i)),date:mgmtSoireeNomDate(m,t.c),n:l.length};`);
  assert.ok(r,'fixture : une soirée avec un carton principal decidé');
  assert.ok(r.t,'le combat principal du gagnant est dedans');
  assert.equal(r.t.phrase,'Victoire · '+r.p);
  assert.ok(r.t.detail.includes(r.date),r.t.detail+' contient '+r.date);
  assert.ok(r.t.detail.includes(r.ligne),r.t.detail+' contient '+r.ligne);
  assert.equal(r.t.sorte,'resultat');
  assert.equal(r.t.libelle,'Un résultat');
  /* le même combat de titre : sorte « titre » dès que title_fight existe */
  const win2=neuve(7);
  premiers(win2,1);
  const j2=jouer(win2,1,{titre:true});
  assert.ok(j2>=1);
  r=res(win2,`const m=G.mgmt, tf=(m.facts||[]).find(x=>x&&x.k==='title_fight');
    if(!tf) return {aucuntitre:true};
    const t=m.hist[tf.fight]; const w=t.winner==='A'?t.a:t.b, p=t.winner==='A'?t.b:t.a;
    return {aucuntitre:false,i:tf.fight,l:mgmtDepuisVisite(m,w.id).find(x=>x.sorte!=='corps'&&x.phrase==='Victoire · '+p.name)||null};`);
  assert.ok(r&&!r.aucuntitre,'fixture : le titre était en jeu');
  assert.ok(r.l,'la ligne du combat de titre');
  assert.equal(r.l.sorte,'titre'); assert.equal(r.l.libelle,'Un titre');
});

test('Depuis — l’ordre : le plus récent d’abord, un combat avant un fait du même cycle', () => {
  const win=neuve(7);
  const [X]=premiers(win,1);
  win.eval(`const m=G.mgmt;
    mgmtAddFact(m,{c:2,k:'injury',a:'${X}'});
    mgmtAddFact(m,{c:5,k:'injury',a:'${X}'});
    m.hist.push({slot:'main',c:5,a:{id:'${X}'},b:{id:'zz'},winner:'A'});
  `);
  const r=res(win,`const m=G.mgmt,l=mgmtDepuisVisite(m,'${X}'); return {n:l.length,c:l.map(x=>x.c),s:l.map(x=>x.sorte)};`);
  assert.equal(r.n,3);
  assert.deepEqual(r.c,[5,5,2]);
  assert.deepEqual(r.s,['resultat','corps','corps']);
});

test('Depuis — ouvrir une fiche marquée l’ouvre sur « On en dit » avec une ligne par événement', () => {
  const win=neuve(7);
  const [X]=premiers(win,1);
  win.eval(`const m=G.mgmt; mgmtAddFact(m,{c:m.cycle,k:'injury',a:'${X}'}); mgmtAddFact(m,{c:m.cycle,k:'susp',a:'${X}'});`);
  win.eval(`CL.mgmtFiche('${X}');`);
  assert.equal(win.eval('G.screen'),'mgmt_fiche');
  assert.equal(win.eval('MGMT_FICHE.onglet'),'ondit');
  assert.equal(win.eval(`document.querySelectorAll('.mf-fi-oc.depuis').length`),2,'deux lignes');
  const te=win.eval(`[...document.querySelectorAll('.mf-fi-cth')].some(h=>h.textContent.includes('DEPUIS TA DERNIÈRE VISITE'))`);
  assert.ok(te,'l\'en-tête du bloc');
  assert.ok(win.eval(`[...document.querySelectorAll('.mf-fi-cth')].some(h=>h.textContent.includes('2 ÉVÉNEMENTS'))`),'le compteur d\'événements');
  assert.ok(win.eval(`[...document.querySelectorAll('.mf-fi-oc.depuis')].every(o=>!!o.closest('.mf-fi-scroll'))`),'toutes dans le panneau qui défile');
});

test('Depuis — le bloc est calculé avant la visite : une fiche marquée n’est jamais ouverte sur un bloc vide', () => {
  const win=neuve(7);
  const [X]=premiers(win,1);
  win.eval(`const m=G.mgmt; mgmtAddFact(m,{c:m.cycle,k:'injury',a:'${X}'}); mgmtAddFact(m,{c:m.cycle,k:'susp',a:'${X}'});`);
  assert.equal(res(win,`return mgmtMarque(G.mgmt,'${X}');`),true,'X est marqué avant l\'ouverture');
  const n=res(win,`const m=G.mgmt; return mgmtEvenementsDepuis(m,'${X}').length;`);
  win.eval(`CL.mgmtFiche('${X}');`);
  assert.ok(n>=1,'au moins un événement compté');
  assert.equal(win.eval('MGMT_FICHE.depuis.length'),n,'le bloc compte exactement ces événements');
  assert.equal(res(win,`return mgmtMarque(G.mgmt,'${X}');`),false,'la marque s\'est éteinte');
});

test('Depuis — rouvrir la même fiche la même semaine : le bloc a disparu', () => {
  const win=neuve(7);
  const [X]=premiers(win,1);
  win.eval(`const m=G.mgmt; mgmtAddFact(m,{c:m.cycle,k:'injury',a:'${X}'});
            CL.mgmtFiche('${X}');`);
  win.eval(`CL.mgmtFicheRetour(); CL.mgmtFiche('${X}');`);
  assert.equal(win.eval(`document.querySelectorAll('.mf-fi-oc.depuis').length`),0,'aucune ligne');
  assert.equal(win.eval(`[...document.querySelectorAll('.mf-fi-cth')].some(h=>h.textContent.includes('DEPUIS'))`),false,'aucun en-tête');
  assert.equal(win.eval('MGMT_FICHE.onglet'),'apercu','la fiche s\'ouvre sur Aperçu');
});

test('Depuis — changer d’onglet puis revenir pendant la même visite garde le bloc', () => {
  const win=neuve(7);
  const [X]=premiers(win,1);
  win.eval(`const m=G.mgmt; mgmtAddFact(m,{c:m.cycle,k:'injury',a:'${X}'}); mgmtAddFact(m,{c:m.cycle,k:'susp',a:'${X}'}); CL.mgmtFiche('${X}');`);
  win.eval(`CL.mgmtFicheOnglet('apercu');`);
  assert.equal(win.eval(`document.querySelectorAll('.mf-fi-oc.depuis').length`),0,'sur Aperçu le bloc n\'est pas montré');
  win.eval(`CL.mgmtFicheOnglet('ondit');`);
  assert.equal(win.eval(`document.querySelectorAll('.mf-fi-oc.depuis').length`),2,'le bloc revient entier');
});

test('Depuis — après un rechargement la fiche ne rejoue pas le bloc', () => {
  const win=neuve(7);
  const [X]=premiers(win,1);
  win.eval(`const m=G.mgmt; mgmtAddFact(m,{c:m.cycle,k:'injury',a:'${X}'}); mgmtAddFact(m,{c:m.cycle,k:'susp',a:'${X}'}); CL.mgmtFiche('${X}');`);
  assert.equal(win.eval(`document.querySelectorAll('.mf-fi-oc.depuis').length`),2);
  win.eval(`(() => { saveMgmt(); G.mgmt=null; loadMgmt(); })();`);
  win.eval(`CL.mgmtFiche('${X}');`);
  assert.equal(win.eval(`document.querySelectorAll('.mf-fi-oc.depuis').length`),0,'rien à lire : le bloc n\'est pas rejoué');
  assert.equal(win.eval('MGMT_FICHE.onglet'),'apercu');
});

test('Depuis — sans nouveauté : pas de bloc, la fiche s’ouvre sur Aperçu', () => {
  const win=neuve(7);
  premiers(win,40);
  const Y=res(win,`const m=G.mgmt; return (m.roster.find(o=>!mgmtMarque(m,o.id))||{}).id;`);
  assert.ok(Y,'fixture : un combattant sans événement');
  win.eval(`CL.mgmtFiche(${JSON.stringify(Y)});`);
  assert.deepEqual(res(win,`return MGMT_FICHE.depuis.map(x=>x.sorte);`),[],'le bloc est vide');
  assert.equal(win.eval('MGMT_FICHE.onglet'),'apercu','Aperçu, comme aujourd\'hui');
  assert.equal(win.eval(`[...document.querySelectorAll('.mf-fi-cth')].some(h=>h.textContent.includes('DEPUIS'))`),false,'aucun en-tête DEPUIS');
});

test('Depuis — ← → affiche le bloc du combattant atteint, jamais celui d’avant', () => {
  const win=neuve(7);
  const [X]=premiers(win,2);
  const V=res(win,`const m=G.mgmt, f=mgmtFighterById(m,'${X}'), v=mgmtFicheVoisins(m,f); return v.ids[v.i+1];`);
  assert.ok(V,'fixture : un voisin');
  win.eval(`const m=G.mgmt; mgmtAddFact(m,{c:m.cycle,k:'injury',a:'${X}'}); mgmtAddFact(m,{c:m.cycle,k:'susp',a:'${X}'}); mgmtAddFact(m,{c:m.cycle,k:'injury',a:'${V}'});`);
  win.eval(`CL.mgmtFiche('${X}');`);
  assert.equal(win.eval(`document.querySelectorAll('.mf-fi-oc.depuis').length`),2,'le bloc de X');
  win.eval(`CL.mgmtFicheAutre(1);`);
  assert.equal(win.eval('MGMT_FICHE.id'),V,'la fiche est passée à V');
  assert.equal(win.eval(`document.querySelectorAll('.mf-fi-oc.depuis').length`),1,'le bloc de V, seul le sien');
  win.eval(`CL.mgmtFicheAutre(-1);`);
  assert.equal(win.eval(`document.querySelectorAll('.mf-fi-oc.depuis').length`),0,'retour à X, déjà vu : rien');
});

test('Depuis — rien ne déborde : 15 événements défilent dans le panneau', () => {
  const win=neuve(7);
  const [X]=premiers(win,1);
  win.eval(`const m=G.mgmt; for(let k=0;k<15;k++) mgmtAddFact(m,{c:m.cycle,k:'injury',a:'${X}'}); CL.mgmtFiche('${X}');`);
  assert.equal(win.eval(`document.querySelectorAll('.mf-fi-oc.depuis').length`),15,'15 lignes');
  assert.ok(win.eval(`[...document.querySelectorAll('.mf-fi-oc.depuis')].every(o=>!!o.closest('.mf-fi-scroll'))`),'toutes dans le panneau qui défile');
  const regle=css.match(/\.mf-fi-scroll\{[^}]*\}/g)[0];
  assert.ok(regle.includes('.mf-fi-scroll{overflow-y:auto'),'regle : overflow-y:auto');
  assert.ok(win.eval(`[...document.querySelectorAll('.mf-fi-oc.depuis')].every(o=>!o.querySelector('.mf-fi-ocq b'))`),'aucun b dans la colonne de gauche');
  const oc=css.match(/\.mf-fi-oc\{[^}]*\}/g)||[''];
  assert.ok(oc.every(r=>!r.includes('position:absolute')),'jamais position:absolute');
});

test('Depuis — tout texte injecté est échappé', () => {
  const win=neuve(7);
  const [X,Y]=premiers(win,2);
  win.eval(`const m=G.mgmt; mgmtFighterById(m,'${Y}').name='<i>x</i>';
            mgmtAddFact(m,{c:m.cycle,k:'demande',a:'${X}',want:'revanche',target:'${Y}'}); CL.mgmtFiche('${X}');`);
  assert.ok(win.eval(`document.querySelector('.mf-fi-oc.depuis').textContent.includes('Une revanche — <i>x</i>')`),'la phrase reste lisible');
  assert.ok(win.eval(`document.getElementById('app').innerHTML.includes('&lt;i&gt;x')`),'et le HTML est échappé');
  assert.equal(win.eval(`document.querySelectorAll('.mf-fi-oc.depuis i').length`),0,'aucun élément i créé');
});
