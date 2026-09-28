"use strict";
/* CAGE LEGACY — tests/mgmtCategoriesFeminines.test.js
   ============================================================================
   Décision d'Anthony du 28/09/2026 : dans le management, une catégorie
   féminine s'affiche « Poids mouche féminin », « Poids paille féminin »,
   etc. — les divisions F d'engine.js portent le même nom que les H.
   Une seule fonction de libellé (mgmtDivisionLabel, mgmt-ecran-carte.js),
   dérivée de la division À LA LECTURE : rien n'est stocké, les
   sauvegardes ne changent pas, engine.js garde ses libellés et la carrière
   ne change pas. mgmt-ecran-semaine.js n'est pas touché (autre session) :
   ses affichages de catégorie passent par mgmt-screens.js, déjà convertis.
   ============================================================================ */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

/* Roster contrôlé : quatre mouche féminines (F-fly), deux coq féminines
   (F-bantam), deux légers (H-light) pour prouver que le masculin ne
   bouge pas. Les divName STOCKÉS sont les libellés d'engine.js — c'est
   l'affichage qui dérive le féminin. */
function freshMgmt(win, seed){
  win.eval(`setSeed(${seed}); CL.mgmtEnter();`);
  win.eval(`(function(){
    const m=G.mgmt;
    const mk=(id,first,div,divName,W,L)=>({id:id,name:first+' Test',first:first,last:'Test',
      W:W,L:L,D:0,age:27,div:div,divName:divName,org:'Split',level:1,raison:null,interactions:0});
    m.roster=[
      mk('f1','Anna','F-fly','Poids mouche',5,2),
      mk('f2','Bruna','F-fly','Poids mouche',4,3),
      mk('f3','Carla','F-fly','Poids mouche',3,4),
      mk('f4','Duda','F-fly','Poids mouche',2,5),
      mk('f5','Erika','F-bantam','Poids coq',6,1),
      mk('f6','Fabi','F-bantam','Poids coq',5,2),
      mk('h1','Gil','H-light','Poids léger',7,0),
      mk('h2','Hugo','H-light','Poids léger',6,1)
    ];
  })()`);
}

test('mgmtDivisionLabel — une seule fonction, dérivée de la division, rien de stocké', () => {
  const win = newGameWindow();
  const r = JSON.parse(win.eval(`JSON.stringify({
    flyF:mgmtDivisionLabel('F-fly'), strawF:mgmtDivisionLabel('F-straw'),
    bantamF:mgmtDivisionLabel('F-bantam'), featherF:mgmtDivisionLabel('F-feather'),
    flyH:mgmtDivisionLabel('H-fly'), lightH:mgmtDivisionLabel('H-light'),
    objF:mgmtDivisionLabel(divById('F-fly')), inconnu:mgmtDivisionLabel('X-y'),
    vide:mgmtDivisionLabel(null),
    /* engine.js ne change pas : le libellé du jeu reste celui des deux genres. */
    moteurF:DIVISIONS.F.find(d=>d.id==='F-fly').name,
    moteurH:DIVISIONS.H.find(d=>d.id==='H-fly').name
  })`));
  assert.equal(r.flyF, 'Poids mouche féminin');
  assert.equal(r.strawF, 'Poids paille féminin');
  assert.equal(r.bantamF, 'Poids coq féminin');
  assert.equal(r.featherF, 'Poids plume féminin');
  assert.equal(r.flyH, 'Poids mouche', 'le masculin reste tel quel');
  assert.equal(r.lightH, 'Poids léger');
  assert.equal(r.objF, 'Poids mouche féminin', 'accepte l’objet division');
  assert.equal(r.inconnu, '');
  assert.equal(r.vide, '');
  assert.equal(r.moteurF, 'Poids mouche', 'engine.js garde son libellé');
  assert.equal(r.moteurH, 'Poids mouche');
});

test('Bureau — dossier et sujet d’affaire portent le libellé féminin, masculin inchangé', () => {
  const win = newGameWindow();
  freshMgmt(win,101);
  /* La ligne stockée ne change jamais : le féminin n’est qu’un affichage. */
  const avant = win.eval(`JSON.stringify(G.mgmt.roster)`);
  win.eval(`(function(){
    const m=G.mgmt;
    m.pile=[{id:'k1',kind:'leila_propose',exchange:'leila_propose',speaker:'leila',
      a:'f1',b:'f2',status:'open',decision:null,title:'t'}];
    m.open='k1';
    render();
  })()`);
  const html = win.document.getElementById('app').innerHTML;
  assert.ok(html.includes('Poids mouche féminin'), 'le dossier affiche « Poids mouche féminin »');
  assert.ok(html.includes('Poids mouche féminin · 5-2-0 contre 4-3-0'), 'le sujet d’affaire aussi');
  assert.ok(!html.includes('Poids léger féminin'), 'aucun féminin sur une catégorie masculine');
  /* mgmtLineCard est le renderer partagé du bureau (dossier, prélims) :
     le masculin y reste tel quel, jamais de féminin. */
  const hCard = win.eval(`mgmtLineCard(mgmtFighterById(G.mgmt,'h1'))`);
  assert.ok(hCard.includes('Poids léger') && !hCard.includes('Poids léger féminin'),
    'le masculin s’affiche tel quel');
  const fCard = win.eval(`mgmtLineCard(mgmtFighterById(G.mgmt,'f1'))`);
  assert.ok(fCard.includes('Poids mouche féminin'), 'le féminin aussi dans la carte de ligne');
  assert.equal(win.eval(`JSON.stringify(G.mgmt.roster)`), avant,
    'aucune ligne du roster n’a été écrite (les sauvegardes ne changent pas)');
});

test('Composition de la carte — groupes, en-tête de liste et fiches au libellé féminin', () => {
  const win = newGameWindow();
  freshMgmt(win,102);
  win.eval(`CL.mgmtCarte(); render();`);
  let html = win.document.getElementById('app').innerHTML;
  assert.ok(html.includes('Poids mouche féminin'), 'le groupe de catégorie s’affiche au féminin');
  assert.ok(html.includes('Poids coq féminin'), 'le second groupe féminin aussi');
  assert.ok(html.includes('Poids léger') && !html.includes('Poids léger féminin'),
    'le masculin reste inchangé');
  /* Premier choix : la liste se filtre, l’en-tête porte le libellé dérivé. */
  win.eval(`CL.mgmtPick('f1'); render();`);
  html = win.document.getElementById('app').innerHTML;
  assert.ok(html.includes('Adversaires — Poids mouche féminin'), 'l’en-tête de liste dérive le féminin');
  /* La fiche du face-à-face porte bilan, catégorie, rang, âge. */
  win.eval(`CL.mgmtPick('f2'); render();`);
  assert.equal(win.eval(`G.mgmt.card.main.length`), 1, 'le combat se pose comme avant');
  html = win.document.getElementById('app').innerHTML;
  assert.ok(html.includes('Poids mouche féminin'), 'la carte posée porte le libellé féminin');
});

test('Fiche combattant — l’en-tête porte le libellé féminin, masculin inchangé', () => {
  const win = newGameWindow();
  freshMgmt(win,103);
  win.eval(`CL.mgmtFiche('f3'); render();`);
  assert.equal(win.eval(`G.screen`), 'mgmt_fiche');
  let html = win.document.getElementById('app').innerHTML;
  assert.ok(html.includes('Poids mouche féminin'), 'la fiche d’une combattante porte le féminin');
  win.eval(`CL.mgmtFiche('h1'); render();`);
  html = win.document.getElementById('app').innerHTML;
  assert.ok(html.includes('Poids léger') && !html.includes('Poids léger féminin'),
    'la fiche d’un combattant reste au masculin');
});

test('Carrière — aucun changement : le hub et la fiche gardent le libellé du moteur', () => {
  const win = newGameWindow();
  win.eval(`G={theme:'dark',draft:{gender:'F',style:'boxer',country:COUNTRY_KEYS[0],div:'F-fly',first:'Anna'}}; CL.create();`);
  assert.equal(win.eval(`G.f.divName`), 'Poids mouche', 'la donnée carrière reste celle d’engine.js');
  const hub = win.document.getElementById('app').innerHTML;
  assert.ok(hub.toUpperCase().includes('POIDS MOUCHE'), 'le hub affiche la catégorie du moteur');
  assert.ok(!hub.toUpperCase().includes('FÉMININ') && !hub.includes('féminin'),
    'la carrière n’affiche jamais le libellé féminin');
  win.eval(`G._profileReturn='hub'; CL.go('profile');`);
  const profile = win.document.getElementById('app').innerHTML;
  assert.ok(profile.includes('Poids mouche') && !profile.includes('Poids mouche féminin'),
    'la fiche carrière non plus');
});
