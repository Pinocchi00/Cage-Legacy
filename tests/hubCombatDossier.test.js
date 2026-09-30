"use strict";
/* CAGE LEGACY — tests/hubCombatDossier.test.js
   Couvre le Lot P3/2026 : sous-menu Combat du hub (hubCombatHtml(), ui-06),
   les 5 derniers combats de f.history affichés du plus récent au plus
   ancien, avec repli propre sur les sauvegardes anciennes dépourvues de
   oppNick/oppRank/time (ajoutés par ce même lot à applyResult(),
   engine-combat.js). */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');
const {clickThrough}=require('./helpers/playthrough');

function fullEntry(over){
  return Object.assign({
    res:'win', method:'KO/TKO', round:2, time:'1:45',
    oppId:1, oppName:'Vera Kane', oppFlag:'🇧🇷', oppNick:'O Machado',
    oppWasChamp:false, oppRecord:'10-2', oppElo:1500, oppRank:6,
  }, over);
}

test('hubCombatHtml() — 5 combats complets : les 5 lignes s’affichent, du plus récent au plus ancien, avec surnom et rang', () => {
  const win = newGameWindow();
  const history = [1,2,3,4,5].map(n => fullEntry({ oppName: `Adversaire${n}`, oppRank: n }));
  const f = { history };
  const html = win.hubCombatHtml(f);
  assert.ok(!/undefined/.test(html), 'aucun "undefined" dans le HTML produit');
  assert.ok(html.includes('Adversaire5') && html.includes('Adversaire1'), 'les 5 combats sont bien présents');
  assert.ok(html.indexOf('Adversaire5') < html.indexOf('Adversaire1'), 'le plus récent (poussé en dernier dans history) apparaît en premier');
  assert.ok(html.includes('Victoire'), 'résultat affiché (mis en majuscules par CSS text-transform:uppercase, pas dans la source)');
  assert.ok(html.includes('« O Machado »'), 'surnom entre guillemets français');
  assert.ok(html.includes('RANG #5'), 'rang de l’adversaire le plus récent affiché dans un tag');
  assert.ok(html.includes('KO/TKO · R2 · 1:45'), 'méthode condensée avec round et temps');
});

test('hubCombatHtml() — T8b / maquette 10 : deux lignes, la dernière sans filet', () => {
  const win = newGameWindow();
  const history = [fullEntry({ oppName: 'Premier' }), fullEntry({ oppName: 'Second' })];
  const f = { history };
  const html = win.hubCombatHtml(f);
  assert.ok(!/undefined/.test(html));
  assert.ok(html.includes('Premier') && html.includes('Second'));
  const doc=new win.DOMParser().parseFromString(html,'text/html');
  assert.equal(doc.querySelectorAll('.career-history-row').length,2);
  assert.ok(doc.querySelector('.career-history-row:last-child').classList.contains('career-history-last'));
});

// Décision T8b, contrat §1/§4 bis : un bloc sans données disparaît.
test('hubCombatHtml() — T8b : historique vide, aucun bloc ni texte de remplissage', () => {
  const win = newGameWindow();
  const html = win.hubCombatHtml({ history: [] });
  assert.equal(html,'');
});

test('hubCombatHtml() — entrée ancienne sans oppNick/oppRank/time : repli propre, aucun "undefined", pas de guillemets ni de tag vides', () => {
  const win = newGameWindow();
  const oldEntry = { res:'loss', method:'Soumission', round:1, oppId:2, oppName:'Ana Ruiz', oppFlag:'🇪🇸', oppWasChamp:false, oppRecord:'5-1', oppElo:1400 };
  const html = win.hubCombatHtml({ history: [oldEntry] });
  assert.ok(!/undefined/.test(html), 'aucun "undefined" imprimé pour les champs absents');
  assert.ok(!html.includes('« »'), 'pas de guillemets vides quand oppNick est absent');
  assert.ok(!html.includes('RANG #undefined') && !/RANG #\s*<\/span>/.test(html), 'pas de tag de rang vide/undefined quand oppRank est absent');
  assert.ok(html.includes('Ana Ruiz'), 'le nom de l’adversaire reste affiché');
  assert.ok(html.includes('Soumission · R1'), 'round affiché sans temps quand celui-ci est absent');
  assert.ok(!html.includes('Soumission · R1 · '), 'pas de séparateur orphelin quand le temps est absent');
});

test('hubCombatHtml() — décision unanime/partagée et égalité : pas de round ni de temps affichés', () => {
  const win = newGameWindow();
  const decisionUnanime = { res:'win', method:'Décision', oppId:1, oppName:'A', oppFlag:'🇫🇷' };
  const decisionPartagee = { res:'win', method:'Décision partagée', oppId:2, oppName:'B', oppFlag:'🇫🇷' };
  const egalite = { res:'draw', method:'Égalité', oppId:3, oppName:'C', oppFlag:'🇫🇷' };
  const html = win.hubCombatHtml({ history: [decisionUnanime, decisionPartagee, egalite] });
  // T8b / §1 : une méthode « Décision » ne prouve pas l'unanimité.
  assert.ok(html.includes('Décision'));
  assert.ok(!html.includes('Décision unanime'));
  assert.ok(html.includes('Décision partagée'));
  assert.ok(html.includes('Égalité'));
  assert.ok(!/Décision[^<]*· R/.test(html), 'aucune décision ne porte de round');
  assert.ok(!/undefined/.test(html));
});

/* ==== [ANCRE: TEST_HORLOGE_CONTINUE_HISTORY_TIME] — Lot P6/2026 : avant ce
   lot, aucune horloge continue n'existait dans simulateFight() et `time`
   n'était donc JAMAIS ajouté à f.history (seul un `res` sans finishTimeStr
   pouvait exister). Depuis l'horloge continue (roundLen/dt, cf.
   engine-combat.js ANCRE HORLOGE_CONTINUE), une finition porte un
   horodatage réel (res.finishTimeStr) qu'applyResult() propage désormais
   dans `time` — mais seulement pour une VRAIE finition : une décision
   (pas de res.finishTimeStr) doit toujours donner `time:null`, jamais un
   horodatage fabriqué de toutes pièces. Les deux sous-tests ci-dessous
   remplacent l'ancien test qui figeait "time n'existe nulle part". ==== */
test('applyResult() — pousse oppNick et oppRank sur f.history pour le joueur, sans fabriquer de temps pour une décision', () => {
  const win = newGameWindow({ runMain: true });
  win.setSeed(3);
  win.eval(`
    G = { theme:'dark', draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:'Test'} };
    CL.create();
  `);
  const opp = win.G.roster[0];
  opp.nick = 'Le Marteau';
  const res = { winner: 'A', method: 'Décision', scoreA: 30, scoreB: 27 };
  win.applyResult(win.G.f, opp, res, 'A');
  const last = win.G.f.history[win.G.f.history.length - 1];
  assert.equal(last.oppNick, 'Le Marteau');
  assert.equal(typeof last.oppRank, 'number');
  assert.equal(last.time, null, 'une décision (pas de res.finishTimeStr) ne doit jamais fabriquer un horodatage');
});

test('applyResult() — propage l’horodatage réel de la simulation (res.finishTimeStr) pour une finition', () => {
  const win = newGameWindow({ runMain: true });
  win.setSeed(3);
  win.eval(`
    G = { theme:'dark', draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:'Test'} };
    CL.create();
  `);
  const opp = win.G.roster[0];
  const res = { winner: 'A', method: 'KO/TKO', round: 2, scoreA: 20, scoreB: 18, finishTime: 145, finishTimeStr: '2:35' };
  win.applyResult(win.G.f, opp, res, 'A');
  const last = win.G.f.history[win.G.f.history.length - 1];
  assert.equal(last.time, '2:35', 'le temps de finition réel de la simulation doit être propagé tel quel');
});

test('hubDossierHtml() — six boutons vers les mêmes écrans qu’avant, en grille 2 colonnes', () => {
  const win = newGameWindow();
  const html = win.hubDossierHtml();
  ["profile","rankings","ach","history","beltLineage","hof"].forEach(target => {
    assert.ok(html.includes(`CL.go('${target}')`), `bouton vers l’écran '${target}' présent`);
  });
  assert.ok(!/undefined/.test(html));
  assert.ok(!html.includes('CL.duelEnter()'), 'LOT DUEL-02 : le Duel entre amis a quitté le sous-menu Dossier du hub');
});

/* ==== [ANCRE: LOT4_T8B_TESTS_HUB] — contrat T8 / §1 / §4 bis : absence
   des données manquantes, préparation réelle, navigation et échappement. ==== */
function careerWindow(){
  const win=newGameWindow({runMain:true});
  win.setSeed(11);
  win.CL.newCareer();win.CL.create();
  return win;
}

test('T8b — hub neuf : données réelles, aucun faux prochain combat ni bloc vide',()=>{
  const win=careerWindow(),f=win.G.f;
  win.CL.fightSelect(); // Des offres ne constituent pas un combat signé.
  win.CL.go('hub');
  const doc=win.document,html=doc.querySelector('#app').innerHTML;
  assert.ok(doc.querySelector('.career-name').textContent.includes(f.name));
  assert.ok(html.includes(f.divName));
  assert.ok(!html.includes('Ton prochain combat'));
  assert.ok(!html.includes('Le camp de cette semaine'));
  assert.ok(!html.includes('Ta carrière'));
  assert.ok(html.includes('Ton état'),'T8b reprise : moral et forme rendent ce bloc permanent');
  assert.ok(!html.includes('Ton agent'));
  assert.ok(!html.includes('Ce qu’on dit de toi'));
  assert.equal(doc.querySelectorAll('.gauge,.gauge2,.stat-big').length,0);
  const dossier=doc.querySelector('.career-dossier');
  assert.equal(dossier.querySelectorAll('button').length,6);
});

test('T8b reprise — carrière neuve : moral et forme sont lus en d20, en texte sans barre',()=>{
  const win=careerWindow(),f=win.G.f;
  const state=()=>win.document.querySelector('.career-aside .career-block p');
  assert.equal(state().textContent,win.eval('`Moral ${d20(G.f.morale)}/20 · Forme ${d20(G.f.form)}/20`'));
  f.morale=70;f.form=55;win.render();
  assert.equal(state().textContent,'Moral 14/20 · Forme 11/20');
  assert.equal(win.document.querySelectorAll('.gauge,.gauge2').length,0);
});

test('T8b — préparation existante : camp et étude lisibles ; blessure invalide la préparation',()=>{
  const win=careerWindow();
  win.CL.fightSelect();win.CL.opp(0);
  if(win.G.screen==='press_conf'){win.G.pressConf=null;win.CL.go('camp');}
  const f=win.G.f,opponent=win.G.sel.o;
  win.CL.go('hub');
  assert.ok(win.document.querySelector('.career-next').textContent.includes(opponent.name));
  assert.equal(win.document.querySelectorAll('.career-training button').length,win.G.train.length);
  win.document.querySelector('.career-next button').click();
  assert.equal(win.G.screen,'opponent_card');
  assert.equal(win.G.f,f,'la consultation ne remplace jamais le joueur');
  assert.ok(win.document.querySelector('h1').textContent.includes(opponent.name));
  win.document.querySelector('.career-header button').click();
  assert.equal(win.G.screen,'hub');
  assert.ok(win.document.querySelector('.career-camp'));
  // Une blessure invalide la préparation, y compris après sa guérison.
  f.injury={name:'Blessure',left:1};win.render();
  assert.equal(win.document.querySelector('.career-next'),null);
  f.injury=null;win.render();
  assert.equal(win.document.querySelector('.career-next'),null);
});

test('T8b — reprise sauvegardée du camp ; après le combat, les anciennes données ne font pas un prochain combat',()=>{
  const win=careerWindow();
  win.CL.fightSelect();win.CL.opp(0);
  if(win.G.screen==='press_conf'){win.G.pressConf=null;win.CL.go('camp');}
  win.save();win.CL.go('title');win.CL.cont();
  assert.equal(win.G.screen,'hub');
  assert.ok(win.document.querySelector('.career-camp'));
  win.document.querySelector('.career-primary').click();
  clickThrough(win,{maxSteps:400,stopWhen:w=>w.G.screen==='hub'});
  assert.equal(win.G.screen,'hub');
  assert.ok(win.G.f.history.length||win.G.f.injury,'le flux existant a joué ou blessé le combattant');
  assert.equal(win.document.querySelector('.career-next'),null);
  assert.equal(win.document.querySelector('.career-camp'),null);
});

test('T8b — consultation du hub et de la fiche : aucun tirage ni fait dérivé persisté',()=>{
  const win=careerWindow(),f=win.G.f,before=JSON.stringify(f);
  win.setSeed(87);const expected=win.rnd();win.setSeed(87);
  win.scr_hub();win.scr_hub();
  win.G._oppCardId=win.G.roster[0].id;win.scr_opponent_card();
  assert.equal(win.rnd(),expected);
  assert.equal(JSON.stringify(f),before);
  assert.ok(!Object.keys(win.G).some(k=>/careerHubPreparation/.test(k)));
});

test('T8b — les deux classements ouvrent la vraie fiche et reviennent au même onglet',()=>{
  const win=careerWindow(),f=win.G.f;
  for(const tab of ['div','p4p']){
    win.CL.setRankingsTab(tab);win.CL.go('rankings');
    const row=win.document.querySelector('[onclick^="CL.viewCareerOpponent"]');
    assert.ok(row,tab);
    row.click();
    assert.equal(win.G.screen,'opponent_card');
    const o=win.careerOpponentById(win.G._oppCardId);
    assert.equal(win.document.querySelector('h1').textContent,o.name);
    assert.equal(win.G.f,f);
    win.render(); // La destination survit à un second rendu de la fiche.
    win.document.querySelector('.career-header button').click();
    assert.equal(win.G.screen,'rankings');
    assert.equal(win.G._rankingsTab,tab);
  }
});

test('T8b — nom, surnom, blessure et historique hostiles restent du texte',()=>{
  const win=careerWindow(),f=win.G.f,attack='<img src=x onerror="window.pwned=true">';
  f.name=attack;f.nick=attack;f.injury={name:attack,left:1};
  f.history=[fullEntry({oppName:attack,oppNick:attack,method:attack,oppFlag:attack})];
  win.render();
  assert.equal(win.document.querySelectorAll('#app img').length,0);
  assert.ok(win.document.querySelector('.career-name').textContent.includes(attack));
  assert.ok(win.document.querySelector('.career-history').textContent.includes(attack));
  assert.ok(win.document.querySelector('.career-aside').textContent.includes(attack));
  const o=win.G.roster[0];o.name=attack;o.nick=attack;
  win.CL.viewCareerOpponent(o.id,'rankings');
  assert.equal(win.document.querySelectorAll('#app img').length,0);
  assert.equal(win.document.querySelector('h1').textContent,attack);
  assert.equal(win.pwned,undefined);
});
/* ==== [FIN ANCRE] ==== */
