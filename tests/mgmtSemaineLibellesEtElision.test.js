"use strict";
/* CAGE LEGACY — tests/mgmtSemaineLibellesEtElision.test.js
   ============================================================================
   Décisions d'Anthony du 28/09/2026, écran de la semaine :
   1) les quatre sites de catégorie (carte principale posée, effectif,
      voisinage, invaincu) passent par mgmtDivisionLabel — une catégorie
      féminine s'affiche « Poids mouche féminin », « Poids plume féminin »,
      et rien n'est stocké (les sauvegardes ne changent pas) ;
   2) l'élision devant voyelle ou h : « au voisinage de Omar » s'écrit
      « au voisinage d'Omar », « de Bruna » reste « de Bruna ».
   ============================================================================ */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

function enterMgmt(win, seed){ win.eval(`setSeed(${seed}); mgmtEntrerAvantH4();`); }

test('Semaine — carte posée, effectif et invaincu portent le libellé féminin, masculin inchangé', () => {
  const win = newGameWindow();
  enterMgmt(win, 88);
  win.eval(`(function(){
    const m=G.mgmt;
    const mk=(id,first,div,divName,W,L)=>({id:id,name:first+' Test',first:first,last:'Test',
      W:W,L:L,D:0,age:27,div:div,divName:divName,org:'Split',level:1,raison:null,interactions:0});
    m.roster=[
      mk('f1','Anna','F-fly','Poids mouche',5,2),
      mk('f2','Bruna','F-fly','Poids mouche',4,3),
      mk('p1','Carla','F-feather','Poids plume',6,1),
      mk('p2','Duda','F-feather','Poids plume',3,4),
      mk('p3','Erika','F-feather','Poids plume',2,5),
      mk('h1','Gil','H-light','Poids léger',7,0),
      mk('h2','Hugo','H-light','Poids léger',6,1)
    ];
    m.card.main=[{a:'f1',b:'f2',cycle:m.cycle,slot:'main'},{a:'h1',b:'h2',cycle:m.cycle,slot:'main'}];
    /* p1 est déjà engagée en préliminaire : aucune ligne de Split de la
       catégorie plume n'est au voisinage, la ligne extérieure reste
       disponible pour la ligne « invaincu ». */
    m.card.prelims=[{a:'p1',b:'p2',cycle:m.cycle,slot:'prelim'}];
    /* Les graines 56 et 64 dérivent des bilans 7-0 et 3-0 (sondés) sur la
       catégorie plume : la ligne invaincu vient de la première. */
    m.exterieur=[{id:'ext-plume1',seed:56,div:'F-feather',ck:'BR',born:m.cycle},
                 {id:'ext-plume2',seed:64,div:'F-feather',ck:'BR',born:m.cycle}];
  })()`);
  /* Ligne stockée inchangée : le « féminin » n'est qu'un affichage dérivé. */
  const avant = win.eval(`JSON.stringify(G.mgmt.roster)`);
  const carte = win.eval(`mgmtSemaineCarte(G.mgmt)`);
  assert.ok(carte.includes('Poids mouche féminin'), 'la carte posée affiche la féminine au libellé dérivé (ligne 25)');
  assert.ok(carte.includes('Poids léger · ') && !carte.includes('Poids léger féminin'),
    'la carte masculine reste sans féminin');
  const monde = win.eval(`mgmtSemaineMonde(G.mgmt)`);
  assert.ok(monde.includes('Poids mouche féminin : 0 combattants de Split disponibles pour la carte principale.'),
    'la ligne effectif passe par mgmtDivisionLabel (ligne 52)');
  assert.ok(monde.includes('Poids plume féminin : 3 combattants chez Split ; ') && monde.includes('7-0 hors de Split.'),
    'la ligne invaincu passe par mgmtDivisionLabel (ligne 89)');
  assert.ok(monde.includes('Poids léger : 0 combattants de Split disponibles pour la carte principale.')
    && !monde.includes('Poids léger féminin'), 'les lignes masculines restent sans féminin');
  assert.equal(win.eval(`JSON.stringify(G.mgmt.roster)`), avant,
    'aucune ligne du roster n’a été écrite (le féminin n’est pas stocké)');
});

test('Semaine — le voisinage s’élide : d’Omar, mais de Bruna', () => {
  const win = newGameWindow();
  enterMgmt(win, 77);
  win.eval(`(function(){
    const m=G.mgmt;
    const mk=(id,first,last,div,divName,W,L)=>({id:id,name:first+' '+last,first:first,last:last,
      W:W,L:L,D:0,age:27,div:div,divName:divName,org:'Split',level:1,raison:null,interactions:0});
    m.roster=[
      mk('v1','Omar','Kamara','F-fly','Poids mouche',6,2),
      mk('v2','Bruna','Lima','F-fly','Poids mouche',5,3),
      mk('v3','Carla','Costa','F-fly','Poids mouche',2,5)
    ];
    m.card.main=[]; m.card.prelims=[];
    /* La graine 56 dérive un bilan extérieur 7-0 (sondé) : la ligne
       extérieure sort en tête du classement mondial, la Split au-dessus
       d’elle est donc bien celle qui partage son voisinage. */
    m.exterieur=[{id:'ext-fly',seed:56,div:'F-fly',ck:'FR',born:m.cycle}];
  })()`);
  /* Unité : la règle d'élision (voyelle ou h). */
  assert.equal(win.eval(`mgmtElisionDe('Omar')`), `d'Omar`);
  assert.equal(win.eval(`mgmtElisionDe('Bruno')`), `de Bruno`);
  assert.equal(win.eval(`mgmtElisionDe('Hakim')`), `d'Hakim`);
  assert.equal(win.eval(`mgmtElisionDe('Éric')`), `d'Éric`, 'une majuscule accentuée élidée');
  assert.equal(win.eval(`mgmtElisionDe('Yves')`), `d'Yves`);
  /* Rendu : la ligne voisinage de l'écran s'élide devant le prénom Omar,
     et le libellé de catégorie du voisinage passe aussi par
     mgmtDivisionLabel (ligne 71). Le nom s'échappe au rendu (esc) —
     le texte décodé passe par textContent. */
  win.eval(`G.screen='mgmt_bureau'; render();`);
  const row = () => [...win.document.querySelectorAll('.mgmt-week-news')]
    .find(r => r.dataset.type === 'voisin');
  assert.ok(row(), 'la ligne voisinage est rendue');
  assert.ok(row().textContent.includes("au voisinage d'Omar Kamara"), 'le voisinage Omar est élidé (ligne 71)');
  /* F2, accord du rang : pour une combattante, « mondiale ». */
  assert.ok(row().textContent.includes('mondiale en Poids mouche féminin'), 'le voisinage porte le libellé dérivé et accordé');
  assert.ok(!row().textContent.includes('voisinage de Omar'), 'plus aucun « de Omar » non élidé');
  /* La forme consonne reste « de ... » : Omar sort, Bruna devient la
     ligne de Split au voisinage. */
  win.eval(`(function(){
    const m=G.mgmt;
    m.roster=m.roster.filter(x=>x.last!=='Kamara');
    G.screen='mgmt_bureau';
    render();
  })()`);
  const monde2 = () => [...win.document.querySelectorAll('.mgmt-week-news')]
    .find(r => r.dataset.type === 'voisin');
  assert.ok(monde2(), 'la ligne voisinage est rendue encore');
  assert.ok(monde2().textContent.includes('au voisinage de Bruna Lima'), 'la forme consonne ne s’élide pas');
});
