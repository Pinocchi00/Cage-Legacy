"use strict";
/* CAGE LEGACY — tests/mgmtBureau.test.js
   ============================================================================
   LOT 1 MODE MANAGEMENT — couvre le bureau : entrée et génération (roster
   40-60, pile 8-15), règle du bureau (niveaux, passage en dossier),
   les deux types d'affaires Leïla (proposition, réaction au refus),
   mémoire des faits, cycles, persistance dédiée, échappement HTML et
   déterminisme seedé. Ajouté avec le lot lui-même.
   ============================================================================ */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { newGameWindow } = require('./helpers/loadGame');

const LEILA_PROPOSE="Écoute chef, je sais que je m'occupe que des combats en début de carte mais là tu dois me croire, je pense que j'ai un combat parfait pour l'organisation, ça va être un combat incroyable, il va te plaire, s'il te plaît laisse-moi le placer dans les plus gros combats.";
const LEILA_REFUSED="Pas de soucis, j'accepte parce que c'est vous mais retenez bien le nom des deux combattants parce qu'à mon avis ils vont monter au classement.";

function enterMgmt(win,seed){
  win.eval(`setSeed(${seed}); CL.mgmtEnter();`);
}

test('MGMT entrée — roster de 40 à 60 noms, pile de 8 à 15 affaires, cycle 1', () => {
  const win = newGameWindow();
  enterMgmt(win,11);
  const n = win.eval(`G.mgmt.roster.length`);
  assert.ok(n>=40&&n<=60, `roster attendu entre 40 et 60, vu ${n}`);
  const p = win.eval(`G.mgmt.pile.length`);
  assert.ok(p>=8&&p<=15, `pile attendue entre 8 et 15, vue ${p}`);
  assert.equal(win.eval(`G.mgmt.cycle`), 1);
  assert.equal(win.eval(`G.mgmt.org`), 'Split');
  assert.ok(win.eval(`G.mgmt.pile.every(a=>a.kind==='leila_propose'&&a.status==='open')`),
    'en Lot 1 toutes les affaires sont des propositions de Leïla, ouvertes');
});

test('MGMT niveau 1 — une ligne nom/bilan/âge/catégorie/organisation, rien d\u2019autre', () => {
  const win = newGameWindow();
  enterMgmt(win,12);
  const keys = win.eval(`JSON.stringify(Object.keys(G.mgmt.roster[0]).sort())`);
  assert.equal(keys, JSON.stringify(['D','L','W','age','div','divName','first','id','interactions','last','level','name','org','raison'].sort()));
  assert.equal(win.eval(`G.mgmt.roster.every(o=>o.level===1&&o.raison===null)`), true);
});

test('MGMT déterminisme — même graine, même roster et même pile', () => {
  const a = newGameWindow(), b = newGameWindow();
  enterMgmt(a,7); enterMgmt(b,7);
  const sa = a.eval(`JSON.stringify([G.mgmt.roster.map(o=>o.name),G.mgmt.pile.map(x=>[x.a,x.b])])`);
  const sb = b.eval(`JSON.stringify([G.mgmt.roster.map(o=>o.name),G.mgmt.pile.map(x=>[x.a,x.b])])`);
  assert.equal(sa, sb);
});

test('MGMT voix — les répliques de référence de Leïla figurent verbatim dans l\u2019échange', () => {
  const win = newGameWindow();
  enterMgmt(win,13);
  assert.equal(win.eval(`MGMT_EXCHANGES.leila_propose.lines[0]`), LEILA_PROPOSE);
  assert.equal(win.eval(`MGMT_EXCHANGES.leila_refused.lines[0]`), LEILA_REFUSED);
  win.eval(`CL.mgmtOpen(G.mgmt.pile[0].id)`);
  const html = win.document.getElementById('app').innerHTML;
  assert.ok(html.includes('Leïla Malika'), 'le nom de la voix doit s\u2019afficher');
});

const LEILA_ACCEPT="Allez j'accepte, j'apprécie ta conviction et le match-up, je te fais confiance sur ce coup, j'espère un beau combat ahah.";
const LEILA_REFUSE="Non désolé vraiment, sur cette carte j'ai déjà mes combats en tête, j'ai pas de place en plus ni de combats à déclasser mais une prochaine fois peut être.";

test('MGMT réponses-joueur — deux répliques d\u2019auteur verbatim, une vide marquée', () => {
  const win = newGameWindow();
  enterMgmt(win,14);
  assert.equal(win.eval(`MGMT_EXCHANGES.leila_propose.replies.find(r=>r.id==='accept').text`), LEILA_ACCEPT);
  assert.equal(win.eval(`MGMT_EXCHANGES.leila_propose.replies.find(r=>r.id==='refuse').text`), LEILA_REFUSE);
  const close = win.eval(`JSON.stringify(MGMT_EXCHANGES.leila_refused.replies[0])`);
  const parsed = JSON.parse(close);
  assert.equal(parsed.text, null, 'la réaction à la réaction de Leïla reste à écrire');
  assert.ok(typeof parsed.empty==='string'&&parsed.empty.includes('RÉPLIQUE MANQUANTE'),
    'l\u2019emplacement restant est marqué');
});

test('MGMT échanges — répliques écrites affichées, bouton neutre en repli sur le vide', () => {
  const win = newGameWindow();
  enterMgmt(win,15);
  win.eval(`CL.mgmtOpen(G.mgmt.pile[0].id)`);
  const html = win.document.getElementById('app').innerHTML;
  assert.ok(html.includes(LEILA_ACCEPT), 'la réplique accepter s\u2019affiche telle quelle');
  assert.ok(html.includes(LEILA_REFUSE), 'la réplique refuser s\u2019affiche telle quelle');
  assert.ok(!html.includes('Accepter le combat'), 'plus de libellé neutre là où une réplique existe');
  assert.ok(html.includes("Ignorer l'affaire"), 'ignorer reste un bouton d\u2019interface neutre');
  win.eval(`CL.mgmtReply(G.mgmt.pile[0].id,'refuse')`);
  win.eval(`CL.mgmtOpen(G.mgmt.pile[G.mgmt.pile.length-1].id)`);
  const html2 = win.document.getElementById('app').innerHTML;
  assert.ok(html2.includes(LEILA_REFUSED), 'la réaction de Leïla s\u2019affiche');
  assert.ok(html2.includes('Fermer'), 'l\u2019emplacement vide garde un bouton d\u2019interface neutre');
});

test('MGMT accepter — les deux combattants passent en dossier avec une raison des cinq', () => {
  const win = newGameWindow();
  enterMgmt(win,16);
  const ok = win.eval(`CL.mgmtReply(G.mgmt.pile[0].id,'accept'), true`);
  assert.equal(ok, true);
  const st = win.eval(`JSON.stringify({a:G.mgmt.roster.find(o=>o.id===G.mgmt.pile[0].a),b:G.mgmt.roster.find(o=>o.id===G.mgmt.pile[0].b),facts:G.mgmt.facts})`);
  const s = JSON.parse(st);
  for(const f of [s.a,s.b]){
    assert.equal(f.level, 2, 'proposition acceptée = dossier');
    assert.ok(MGMT_IDS.includes(f.raison), 'raison parmi les cinq');
    assert.equal(f.interactions, 1, 'le booking compte comme interaction');
  }
  assert.equal(win.eval(`G.mgmt.pile[0].status`), 'closed');
  assert.equal(s.facts.length, 1);
  assert.equal(s.facts[0].k, 'booked');
});

const MGMT_IDS = ['necessite','passion','hasard','addiction','reconversion'];

test('MGMT refuser — affaire de réaction créée, texte verbatim, fait mémorisé', () => {
  const win = newGameWindow();
  enterMgmt(win,17);
  win.eval(`CL.mgmtReply(G.mgmt.pile[0].id,'refuse')`);
  assert.equal(win.eval(`G.mgmt.pile[0].status`), 'closed');
  assert.equal(win.eval(`G.mgmt.pile.length`), win.eval(`G.mgmt.pile.filter(a=>a.status==='open').length+1`));
  const react = win.eval(`JSON.stringify(G.mgmt.pile[G.mgmt.pile.length-1])`);
  const r = JSON.parse(react);
  assert.equal(r.kind, 'leila_react');
  assert.equal(r.exchange, 'leila_refused');
  assert.equal(win.eval(`MGMT_EXCHANGES.leila_refused.lines[0]`), LEILA_REFUSED);
  win.eval(`CL.mgmtReply('${r.id}','close')`);
  assert.equal(win.eval(`G.mgmt.pile.find(a=>a.id==='${r.id}').status`), 'closed');
});

test('MGMT ignorer — clôt sans réaction, fait mémorisé, ne revient jamais', () => {
  const win = newGameWindow();
  enterMgmt(win,18);
  const before = win.eval(`G.mgmt.pile.length`);
  win.eval(`CL.mgmtIgnore(G.mgmt.pile[0].id)`);
  assert.equal(win.eval(`G.mgmt.pile.length`), before, 'ignorer ne crée aucune affaire');
  assert.equal(win.eval(`G.mgmt.pile[0].decision`), 'ignored');
  assert.equal(win.eval(`G.mgmt.facts[G.mgmt.facts.length-1].k`), 'ignored');
});

test('MGMT attaché — trois bookings du même combattant, niveau 3', () => {
  const win = newGameWindow();
  enterMgmt(win,19);
  const target = win.eval(`G.mgmt.roster[0].id`);
  for(let i=0;i<3;i++){
    win.eval(`
      (function(){
        const m=G.mgmt;
        m.pile.push({id:'t'+${i},kind:'leila_propose',exchange:'leila_propose',speaker:'leila',a:'${target}',b:m.roster[1].id,status:'open',decision:null});
        mgmtDecide(m,'t'+${i},'accept');
      })()`);
  }
  const lv = win.eval(`G.mgmt.roster.find(o=>o.id==='${target}').level`);
  assert.equal(lv, 3, 'trois interactions = attaché');
});

test('MGMT nouveau cycle — compteur +1, pile fraîche de 8 à 15', () => {
  const win = newGameWindow();
  enterMgmt(win,20);
  win.eval(`G.mgmt.pile.forEach(a=>{a.status='closed';a.decision='ignored';}); CL.mgmtNewCycle();`);
  assert.equal(win.eval(`G.mgmt.cycle`), 2);
  const p = win.eval(`G.mgmt.pile.length`);
  assert.ok(p>=8&&p<=15, `nouvelle pile entre 8 et 15, vue ${p}`);
  assert.ok(win.eval(`G.mgmt.pile.every(a=>a.status==='open')`), 'pile fraîche entièrement ouverte');
});

test('MGMT persistance — roundtrip et repli sur secours', () => {
  const win = newGameWindow();
  enterMgmt(win,21);
  win.eval(`saveMgmt(); G.mgmt.cycle=99; saveMgmt();`);
  const backup = win.localStorage.getItem('cage-legacy-mgmt_backup');
  assert.ok(backup, 'la 2e écriture crée un secours avec l’ancienne version');
  win.eval(`G.mgmt=null; loadMgmt();`);
  assert.equal(win.eval(`G.mgmt.cycle`), 99, 'rechargement depuis la principale');
  win.localStorage.setItem('cage-legacy-mgmt', 'JSON cassé');
  win.eval(`G.mgmt=null; loadMgmt();`);
  assert.notEqual(win.eval(`G.mgmt`), null, 'repli sur secours si principale illisible');
  assert.equal(win.eval(`validateMgmt({})`), false, 'structure impossible rejetée');
});

test('MGMT esc() — un nom hostile s’affiche échappé, jamais injecté', () => {
  const win = newGameWindow();
  enterMgmt(win,22);
  win.eval(`
    G.mgmt.roster[0].name='<img src=x onerror=alert(1)>';
    G.mgmt.roster[0].first='<img src=x onerror=alert(1)>';
    G.mgmt.roster[0].last='X';
    CL.mgmtOpen(G.mgmt.pile.find(a=>a.a===G.mgmt.roster[0].id||a.b===G.mgmt.roster[0].id).id);
  `);
  const html = win.document.getElementById('app').innerHTML;
  assert.ok(!html.includes('<img src=x'), 'le HTML brut ne doit jamais contenir le nom injecté');
  assert.ok(html.includes('&lt;img'), 'le nom doit apparaître échappé');
});

test('MGMT aucun Math.random() dans les fichiers du lot', () => {
  const root = path.join(__dirname, '..');
  for(const f of ['mgmt-data.js','mgmt-bureau.js','mgmt-screens.js']){
    const src = fs.readFileSync(path.join(root, f), 'utf8');
    assert.ok(!src.includes('Math.random'), `${f} ne doit jamais appeler Math.random()`);
  }
});

/* ==== [ANCRE: MGMT_LOT1B_CORRECTIONS] — Lot 1b : déduplication des combats,
   exclusion des noms réservés, titres d'affaires, sélection d'office. ==== */
test('MGMT pile — aucun combat en double, A contre B et B contre A confondus', () => {
  const win = newGameWindow();
  const bad = win.eval(`
    (function(){
      let bad=0;
      for(let s=1;s<=40;s++){
        setSeed(s);
        const m=mgmtDefault(); mgmtNewRoster(m); mgmtNewPile(m);
        const seen=new Set();
        for(const a of m.pile){
          if(a.kind!=='leila_propose') continue;
          const k=[a.a,a.b].sort().join('|');
          if(seen.has(k)) bad++;
          seen.add(k);
        }
      }
      return bad;
    })()`);
  assert.equal(bad, 0, 'un même combat ne doit jamais apparaître deux fois dans une pile');
});

test('MGMT noms — aucun prénom ni nom des six personnages et des cinq légendes', () => {
  const win = newGameWindow();
  const bad = win.eval(`
    (function(){
      let bad=0;
      for(let s=1;s<=60;s++){
        setSeed(s);
        const m=mgmtDefault(); mgmtNewRoster(m);
        for(const o of m.roster){
          if(MGMT_EXCLUDED_FIRST.includes(o.first)) bad++;
          if(MGMT_EXCLUDED_LAST.includes(o.last)) bad++;
        }
      }
      return bad;
    })()`);
  assert.equal(bad, 0, 'le générateur ne doit jamais produire un nom réservé');
});

test('MGMT titres — chaque affaire porte un titre qui dit qui parle et de quoi', () => {
  const win = newGameWindow();
  enterMgmt(win,23);
  const titles = JSON.parse(win.eval(`JSON.stringify(G.mgmt.pile.map(a=>a.title))`));
  assert.equal(titles.length, win.eval(`G.mgmt.pile.length`));
  for(const t of titles){
    assert.ok(typeof t==='string'&&t.includes('Leïla'), 'le titre dit qui parle');
    assert.ok(t.length>12, 'le titre dit de quoi il s\u2019agit, pas un libellé vide');
  }
  assert.ok(new Set(titles).size>1, 'pas un libellé de type répété à l\u2019identique');
  win.eval(`CL.mgmtReply(G.mgmt.pile[0].id,'refuse')`);
  const rt = win.eval(`G.mgmt.pile[G.mgmt.pile.length-1].title`);
  assert.ok(typeof rt==='string'&&rt.includes('Leïla'), 'l\u2019affaire de réaction est titrée elle aussi');
});

test('MGMT ouverture — la première affaire de la pile est sélectionnée d\u2019office', () => {
  const win = newGameWindow();
  enterMgmt(win,24);
  assert.equal(win.eval(`G.mgmt.open`), win.eval(`G.mgmt.pile[0].id`));
  win.eval(`G.mgmt.pile.forEach(a=>{a.status='closed';a.decision='ignored';}); CL.mgmtNewCycle();`);
  assert.equal(win.eval(`G.mgmt.open`), win.eval(`G.mgmt.pile[0].id`), 'pareil à chaque nouveau cycle');
});

test('MGMT réparation — une sauvegarde sans titres se recharge, titres recalculés', () => {
  const win = newGameWindow();
  enterMgmt(win,25);
  win.eval(`G.mgmt.pile.forEach(a=>{delete a.title;}); G.mgmt.open=null; saveMgmt(); G.mgmt=null;`);
  assert.equal(win.eval(`loadMgmt()`), true);
  assert.equal(win.eval(`G.mgmt.pile.every(a=>typeof a.title==='string'&&a.title.includes('Leïla'))`), true);
  assert.equal(win.eval(`G.mgmt.open`), win.eval(`G.mgmt.pile.find(a=>a.status==='open').id`));
});
/* ==== [FIN ANCRE] ==== */
