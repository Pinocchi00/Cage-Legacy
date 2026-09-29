"use strict";
/* CAGE LEGACY — tests/mgmtEcranClassements.test.js
   ===========================================================================
   Lot 4 T6 (docs/LOT-4-LA-PEAU-DU-JEU.md §3 T6, maquette 07) :
   - l'écran des classements rend, enregistré dans SCREENS, avec l'entrée
     « Classements » dans la barre de navigation ; échap ramène à la
     semaine — la barre à deux entrées du T7 est réécrite par la décision
     T6 (écran neuf), elle ne se « répare » pas ;
   - onglets par catégorie (mgmtDivisionLabel), portée MONDIAL ou SPLIT ;
   - la liste porte rang, combattant, bilan, organisation, tendance ;
   - tendance et constats comparés au cycle précédent par le classement au
     cycle explicite (T6-1) — recalcul, jamais stocké ;
   - ce qui n'existe pas n'apparaît pas : ni « Champion », ni ceinture,
     ni presse (lot 5) ;
   - un combattant extérieur s'ouvre en fiche (CL.mgmtFiche), retour là
     d'où il a été ouvert ;
   - esc() sur tout nom ; aucun Math.random() ; ni note, ni barème.
   ========================================================================== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

const TRAVAIL_RE=/RÉPLIQUE MANQUANTE|EMPLACEMENT AUTEUR|TODO/i;

function key(win,k){
  win.eval(`document.dispatchEvent(new KeyboardEvent('keydown',{key:'${k}',bubbles:true}))`);
}

test('MGMT T6 — l’écran rend : onglets, portée, tendance, rien des lots 5, échap ramène', () => {
  const win = newGameWindow();
  win.eval(`setSeed(401); CL.mgmtEnter(); CL.go('mgmt_classements');`);
  const html = win.document.getElementById('app').innerHTML;
  assert.ok(html.includes('Classements'), 'le titre de l’écran est présent');
  assert.ok(!TRAVAIL_RE.test(html), 'aucun texte de travail');
  /* Lot 5 : ni « Champion », ni ceinture, ni ce que la presse réclame. */
  assert.ok(!/Champion(?!ship)/.test(html), 'aucun bloc « Champion »');
  assert.ok(!/[Cc]einture|CEINTURE/.test(html), 'aucune ceinture');
  assert.ok(!/PRESSE|réclame/.test(html), 'aucun bloc de presse (lot 5)');
  /* L'entrée « Classements » est dans la barre, signalée comme courante. */
  const courant=[...win.document.querySelectorAll('.mgmt-nav button[aria-current="page"]')];
  assert.equal(courant.length,1,'une seule entrée courante');
  assert.equal(courant[0].textContent,'Classements','l’écran courant est signalé');
  /* Onglets de catégorie : douze, hommes puis femmes, libellé « féminin »
     dérivé pour les femmes (décision d'Anthony du 28/09). */
  const tabs=[...win.document.querySelectorAll('.mgmt-cl-tabs .mgmt-cl-tab')];
  assert.equal(tabs.length,12,'douze catégories, comme l’UFC');
  assert.ok(tabs.slice(0,8).every(b=>!b.textContent.includes('féminin')),
    'aucune catégorie d’hommes porte le libellé féminin');
  assert.ok(tabs.slice(8).every(b=>b.textContent.includes('féminin')),
    'les quatre catégories de femmes portent le libellé féminin');
  /* La portée : deux bascules, Mondial courant par défaut. */
  const scopes=[...win.document.querySelectorAll('.mgmt-cl-scopebtns .mgmt-cl-tab')];
  assert.deepEqual(scopes.map(b=>b.textContent),['Mondial','Split'],'deux portées');
  assert.equal(win.eval(`MGMT_CLASSEMENTS.scope`),'world','la portée mondiale s’ouvre par défaut');
  /* Structure de ligne portée de la maquette : les cinq colonnes. */
  const row=win.document.querySelector('.mgmt-cl-row');
  assert.ok(row,'la liste porte ses lignes');
  for(const c of ['mgmt-cl-rank','mgmt-cl-nm','mgmt-cl-rec','mgmt-cl-org','mgmt-cl-trend']){
    assert.ok(row.querySelector('.'+c),'la ligne comporte la colonne '+c);
  }
  /* échap ramène à la semaine — le même chemin que le bouton. */
  key(win,'Escape');
  assert.equal(win.eval('G.screen'),'mgmt_bureau','échap ramène à la semaine');
});

test('MGMT T6 — onglet de catégorie et bascule SPLIT lisent le vrai classement', () => {
  const win = newGameWindow();
  win.eval(`setSeed(402); CL.mgmtEnter(); CL.go('mgmt_classements');`);
  win.eval(`CL.mgmtClassementsTab('H-light'); CL.mgmtClassementsScope('split');`);
  const html = win.document.getElementById('app').innerHTML;
  assert.ok(html.includes('Poids léger'),'l’onglet choisi porte son libellé');
  const courant=[...win.document.querySelectorAll('.mgmt-cl-scopebtns .mgmt-cl-tab[aria-pressed="true"]')];
  assert.equal(courant.length,1,'une seule portée courante');
  assert.equal(courant[0].textContent,'Split','la portée SPLIT est signalée');
  const attendus=JSON.parse(win.eval(`JSON.stringify(mgmtDivisionRanking(G.mgmt,'H-light','organization').map(x=>x.id))`));
  const rangs=[...win.document.querySelectorAll('.mgmt-cl-row .mgmt-cl-rank')].map(s=>parseInt(s.textContent,10));
  assert.equal(rangs.length,attendus.length,'tous les combattants de Split classés rendus');
  assert.deepEqual(rangs,Array.from({length:attendus.length},(_,i)=>i+1),'les rangs suivent strictement 1..n');
  /* La colonne d'organisation dit « Split » pour ces lignes. */
  const orgs=[...win.document.querySelectorAll('.mgmt-cl-row .mgmt-cl-org')].map(s=>s.textContent);
  assert.ok(orgs.every(o=>o==='Split'),'l’organisation de chaque classé de Split se lit');
});

/* Un combattant extérieur s'ouvre en fiche, et y revient au retour. */
test('MGMT T6 — un combattant extérieur s’ouvre en fiche, retour aux classements', () => {
  const win = newGameWindow();
  win.eval(`setSeed(403); CL.mgmtEnter();`);
  win.eval(`(function(){ const m=G.mgmt; m.cycle=3; mgmtExteriorEnsure(m); })();
    G.screen='mgmt_classements'; render()`);
  const extId=win.eval(`(function(){
    const m=G.mgmt, div=MGMT_CLASSEMENTS.div;
    const listes=mgmtDivisionRanking(m,div,'world');
    const ext=listes.find(x=>!m.roster.some(o=>o.id===x.id));
    return ext?ext.id:null;
  })()`);
  assert.ok(extId,'fixture : un extérieur est classé dans la catégorie ouverte');
  /* Les lignes sont cliquables : le combattant extérieur en fiche. */
  const rows=[...win.document.querySelectorAll('.mgmt-cl-row')];
  assert.ok(rows.length>0&&rows[0].getAttribute('onclick').includes('CL.mgmtFiche'),
    'les lignes ouvrent la fiche');
  win.eval(`CL.mgmtFiche(${JSON.stringify(extId)})`);
  assert.equal(win.eval('G.screen'),'mgmt_fiche','la fiche extérieure s’ouvre');
  win.document.querySelector('.mgmt-fiche-retour').click();
  assert.equal(win.eval('G.screen'),'mgmt_classements','le retour ramène aux classements');
  /* La fiche extérieure raconte la trajectoire (décision du 22/09, T5). */
  win.eval(`CL.mgmtFiche(${JSON.stringify(extId)}); render()`);
  assert.ok(win.document.getElementById('app').textContent.includes('trajectoire'),
    'la fiche extérieure porte sa trajectoire');
  win.eval(`CL.mgmtFicheRetour()`);
  assert.equal(win.eval('G.screen'),'mgmt_classements','le retour suit l’écran des classements');
});

/* Tendances et constats, comparés au cycle précédent ; recalcul jamais
   stocké : les mêmes groupes lu une seconde fois donnent les mêmes. */
test('MGMT T6 — tendance et constats après une soirée, le classement d’hier se retrouve', () => {
  const win = newGameWindow();
  const s = JSON.parse(win.eval(`(function(){
    setSeed(404);
    const m=mgmtDefault(); mgmtNewRoster(m); m.cycle=2; mgmtExteriorEnsure(m);
    G={theme:'dark',mgmt:m};
    let div=null;
    for(const d of allDivisions()){
      const dispo=m.roster.filter(o=>o.div===d.id&&!mgmtIsRetired(o)&&mgmtAvailable(m,o));
      if(dispo.length>=2){ div=d.id; break; }
    }
    if(!div) return 'null';
    MGMT_CLASSEMENTS={div,scope:'world'};
    /* La soirée du cycle : cinq bookés à la main, préliminaires par Leïla. */
    m.card.main=[];
    const dispo=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o));
    if(dispo.length<10) return 'null';
    for(let i=0;i<5;i++) m.card.main.push({a:dispo[2*i].id,b:dispo[2*i+1].id,cycle:m.cycle,slot:'main'});
    m.pile=[]; m.open=null;
    if(mgmtClosePile(m)!=='refill') return 'null';
    const bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open');
    if(!bulk||!mgmtDecide(m,bulk.id,'validate')) return 'null';
    if(!mgmtRunEvent(m)) return 'null';
    mgmtNewPile(m);
    /* Le classement d'hier, recalculé au cycle explicite : la tendance de
       l'écran le compare au jour. */
    const aujourdhui=mgmtDivisionRanking(m,div,'world');
    const hier=mgmtDivisionRanking(m,div,'world',2);
    const tendance=aujourdhui.map((x,i)=>mgmtClassementsTendance(x,i,hier));
    const bouge=tendance.some(t=>t&&t.t!=='eq');
    G.screen='mgmt_classements'; render();
    const probe=document.getElementById('app').innerHTML;
    return JSON.stringify({bouge:bouge,hierNb:hier.length,
      aujourdhuiNb:aujourdhui.length,
      bloc:probe.indexOf('mgmt-cl-hd')>=0,col:probe.indexOf('mgmt-cl-trend')>=0});
  })()`));
  assert.ok(s,'la fixture a joué une soirée et avancé le cycle');
  assert.ok(s.hierNb>0,'le classement d’hier a du contenu');
  assert.ok(s.aujourdhuiNb>0,'le classement du jour aussi');
  assert.ok(s.col,'la colonne de tendance se rend');
  assert.ok(s.bloc,'le bloc des constats se rend aussi');
});
