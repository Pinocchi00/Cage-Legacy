"use strict";
/* CAGE LEGACY — tests/mgmtBureau.test.js
   ============================================================================
   LOT 1 MODE MANAGEMENT — couvre le bureau : entrée et génération (roster
   40-60, pile 8-15), règle du bureau (niveaux, passage en dossier),
   les deux types d'affaires Leïla (proposition, réaction au refus),
   mémoire des faits, cycles, persistance dédiée, échappement HTML et
   déterminisme seedé. Ajouté avec le lot lui-même.
   LOT 2 T3 LEÏLA ET LES PRÉLIMINAIRES (docs/LOT-2-CARTE-PRINCIPALE.md
   §T3 ; LOT-3B §2, décision d'Anthony du 15/09/2026) — réécrits en
   citant le contrat : la proposition en bloc n'arrive qu'une fois la
   carte principale complète (déclenchée par le booking de la cinquième
   place, mgmtBookMain, et par le refill du §5) et part après les autres
   affaires ; C1 : accepter une demande de Leïla booke dans la carte
   principale, carte pleine, la réponse n'est plus proposée.
   LOT 2 T5 LE CALENDRIER ATTEND LE JOUEUR (§T5 ; §4 bis, décisions 4 et
   6 du 20/09/2026) — réécrits en citant la décision : carte principale
   incomplète et composable, le calendrier attend ('compose') ; seul le
   pot épuisé fait avancer le cycle ('stuck', lot 1g).
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

/* Entrée avec pile non vide garantie (cycles bornés, déterministe) pour les
   tests qui jouent des décisions. */
function enterMgmtFull(win,seed){
  win.eval(`setSeed(${seed}); CL.mgmtEnter(); for(let c=0;c<30&&G.mgmt.pile.length===0;c++) mgmtNewPile(G.mgmt); render();`);
}

/* Entrée avec au moins une proposition simple ouverte (les tests lot 1
   ciblent les singles ; la proposition en bloc n'arrive qu'une fois la
   carte principale complète, §T3). */
function enterMgmtSingles(win,seed){
  win.eval(`setSeed(${seed}); CL.mgmtEnter(); for(let c=0;c<30&&!G.mgmt.pile.some(a=>a.status==='open'&&a.kind==='leila_propose');c++) mgmtNewPile(G.mgmt); render();`);
}
function mgmtFirstSingle(win){
  return win.eval(`G.mgmt.pile.find(a=>a.status==='open'&&a.kind==='leila_propose').id`);
}

/* « Continuer » jusqu'à la réouverture du bureau : soirée, puis lendemain
   s'il y a des touchés (lot 3a §7 : séquence imposée et courte). Les tests
   clickent les deux écrans quand ils existent ; sans touché, la soirée
   enchaîne directement sur le cycle suivant. */
function mgmtFinishEvent(win){
  win.eval(`CL.mgmtSoireeNext()`);
  if(win.eval(`G.screen`)==='mgmt_lendemain') win.eval(`CL.mgmtLendemainNext()`);
}

/* §T1 (docs/LOT-2-CARTE-PRINCIPALE.md) : la carte principale est composée
   par le joueur — geste T2. Les tests de flux la posent en fixture : cinq
   combats, dix combattants distincts et disponibles du roster. */
function poseMainCard(win){
  win.eval(`(function(){
    const m=G.mgmt;
    const dispo=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o));
    if(dispo.length<10) throw new Error('fixture : roster trop court');
    m.card.main=[];
    for(let i=0;i<5;i++) m.card.main.push({a:dispo[2*i].id,b:dispo[2*i+1].id,cycle:m.cycle,slot:'main'});
  })()`);
}

/* §T3 : la proposition en bloc de Leïla n'arrive qu'une fois la carte
   principale complète — la pile est vidée, la carte posée en fixture, puis
   Leïla propose en fin de pile (refill du §5). Pile non vide garantie :
   la proposition en bloc est ouverte. */
function enterMgmtWithBulk(win,seed){
  win.eval(`setSeed(${seed}); CL.mgmtEnter();`);
  win.eval(`(function(){ let g=0; while(mgmtOpenCount(G.mgmt)>0&&g<40){ g++; const a=G.mgmt.pile.find(x=>x.status==='open'); CL.mgmtReply(a.id,a.exchange==='leila_propose'?'refuse':MGMT_EXCHANGES[a.exchange].replies[0].id); } })()`);
  poseMainCard(win);
  win.eval(`CL.mgmtNextCycle(); render();`);
  /* Garde de fixture : la proposition en bloc est bien là (§T3). */
  win.eval(`(function(){ const b=G.mgmt.pile.find(a=>a.status==='open'&&a.kind==='leila_bulk'); if(!b) throw new Error('fixture : pas de proposition en bloc'); })()`);
}
function mgmtBulkId(win){
  return win.eval(`G.mgmt.pile.find(a=>a.status==='open'&&a.kind==='leila_bulk').id`);
}

test('MGMT entrée — roster de 40 à 60 noms, singles 0-2 sans bloc tant que la carte principale attend, cycle 1', () => {
  const win = newGameWindow();
  enterMgmt(win,11);
  const n = win.eval(`G.mgmt.roster.length`);
  assert.ok(n>=40&&n<=60, `roster attendu entre 40 et 60, vu ${n}`);
  const st = JSON.parse(win.eval(`JSON.stringify({
    singles:G.mgmt.pile.filter(a=>a.kind==='leila_propose').length,
    bulk:G.mgmt.pile.filter(a=>a.kind==='leila_bulk').length,
    open:G.mgmt.pile.filter(a=>a.status==='open').length,
    total:G.mgmt.pile.length})`));
  assert.ok(st.singles>=0&&st.singles<=2, `singles entre 0 et 2, vus ${st.singles}`);
  assert.equal(st.bulk, 0, '§T3 : la proposition en bloc n\u2019arrive qu\u2019une fois la carte principale complète — carte vide, rien');
  assert.equal(st.open, st.total, 'pile fraîche entièrement ouverte');
  assert.equal(win.eval(`G.mgmt.cycle`), 1);
  assert.equal(win.eval(`G.mgmt.org`), 'Split');
  /* §T1 : carte {main,prelims} vide au départ — aucun combat posé. */
  assert.equal(win.eval(`G.mgmt.card.main.length+G.mgmt.card.prelims.length`), 0, 'carte vide au départ');
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
  enterMgmtFull(win,13);
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
  enterMgmtSingles(win,15);
  const id = mgmtFirstSingle(win);
  win.eval(`CL.mgmtOpen('${id}')`);
  const html = win.document.getElementById('app').innerHTML;
  assert.ok(html.includes(LEILA_ACCEPT), 'la réplique accepter s\u2019affiche telle quelle');
  assert.ok(html.includes(LEILA_REFUSE), 'la réplique refuser s\u2019affiche telle quelle');
  assert.ok(!html.includes('Accepter le combat'), 'plus de libellé neutre là où une réplique existe');
  assert.ok(html.includes("Ignorer l'affaire"), 'ignorer est la troisième réponse, même niveau');
  const nRep = (html.match(/class="mgmt-rep"/g)||[]).length;
  assert.equal(nRep, 3, 'proposition : deux répliques + ignorer, même traitement');
  win.eval(`CL.mgmtReply('${id}','refuse')`);
  win.eval(`CL.mgmtOpen(G.mgmt.pile[G.mgmt.pile.length-1].id)`);
  const html2 = win.document.getElementById('app').innerHTML;
  assert.ok(html2.includes(LEILA_REFUSED), 'la réaction de Leïla s\u2019affiche');
  assert.ok(html2.includes('Fermer'), 'l\u2019emplacement vide garde un bouton d\u2019interface neutre');
});

test('MGMT accepter — les deux combattants passent en dossier avec une raison des cinq', () => {
  const win = newGameWindow();
  enterMgmtSingles(win,16);
  const o = JSON.parse(win.eval(`JSON.stringify((()=>{ const a=G.mgmt.pile.find(x=>x.status==='open'&&x.kind==='leila_propose'); return {id:a.id,a:a.a,b:a.b,cycle:G.mgmt.cycle}; })())`));
  const ok = win.eval(`CL.mgmtReply('${o.id}','accept'), true`);
  assert.equal(ok, true);
  const st = win.eval(`JSON.stringify({a:G.mgmt.roster.find(x=>x.id==='${o.a}'),b:G.mgmt.roster.find(x=>x.id==='${o.b}'),facts:G.mgmt.facts})`);
  const s = JSON.parse(st);
  for(const f of [s.a,s.b]){
    assert.equal(f.level, 2, 'proposition acceptée = dossier');
    assert.ok(MGMT_IDS.includes(f.raison), 'raison parmi les cinq');
    assert.equal(f.interactions, 1, 'le booking compte comme interaction');
  }
  assert.equal(s.facts.length, 1);
  assert.equal(s.facts[0].k, 'booked');
  const after = win.eval(`(function(){ const x=G.mgmt.pile.find(a=>a.id==='${o.id}'); return x?x.status:'cycle-suivant'; })()`);
  assert.ok(after==='closed'||win.eval(`G.mgmt.cycle`)===o.cycle+1, 'affaire clôturée ou cycle auto-ouvert');
});

const MGMT_IDS = ['necessite','passion','hasard','addiction','reconversion'];

test('MGMT refuser — affaire de réaction créée, texte verbatim, fait mémorisé', () => {
  const win = newGameWindow();
  enterMgmtSingles(win,17);
  const id = mgmtFirstSingle(win);
  win.eval(`CL.mgmtReply('${id}','refuse')`);
  const aff = JSON.parse(win.eval(`JSON.stringify(G.mgmt.pile.find(a=>a.id==='${id}'))`));
  assert.equal(aff.status, 'closed');
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
  enterMgmtFull(win,18);
  /* Lot 3a §5 : la tête de pile peut être la proposition en bloc, qui ne
     s'ignore plus tant que la carte est incomplète — viser une single. */
  win.eval(`for(let c=0;c<30&&!G.mgmt.pile.some(a=>a.status==='open'&&a.kind==='leila_propose');c++) mgmtNewPile(G.mgmt); render();`);
  const o = JSON.parse(win.eval(`JSON.stringify((()=>{ const a=G.mgmt.pile.find(x=>x.status==='open'&&x.kind==='leila_propose'); return {id:a.id,a:a.a,b:a.b}; })())`));
  win.eval(`CL.mgmtIgnore('${o.id}')`);
  assert.ok(!win.eval(`G.mgmt.pile.some(a=>a.after==='${o.id}')`), 'ignorer ne crée aucune affaire');
  const last = JSON.parse(win.eval(`JSON.stringify(G.mgmt.facts[G.mgmt.facts.length-1])`));
  assert.equal(last.k, 'ignored', 'fait mémorisé');
  assert.equal(last.a, o.a, 'fait rattaché aux bons combattants');
});

test('MGMT attaché — trois bookings du même combattant, niveau 3', () => {
  const win = newGameWindow();
  enterMgmt(win,19);
  /* C1 (§T3) : accepter booke dans la carte principale — le même
     combattant ne peut pas être engagé deux fois ; un retrait libère
     l'emplacement sans rien effacer (addendum 1 §5), le rebooking compte
     une nouvelle interaction. */
  for(let i=0;i<3;i++){
    win.eval(`
      (function(){
        const m=G.mgmt;
        const d=m.roster.filter(o=>o.div===m.roster[0].div&&mgmtAvailable(m,o)).slice(0,2);
        if(d.length<2) throw new Error('fixture : pas assez de combattants de la catégorie');
        m.pile.push({id:'t'+${i},kind:'leila_propose',exchange:'leila_propose',speaker:'leila',a:d[0].id,b:d[1].id,status:'open',decision:null});
        mgmtDecide(m,'t'+${i},'accept');
        mgmtRemoveMain(m,0);
      })()`);
  }
  const lv = win.eval(`G.mgmt.roster[0].level`);
  assert.equal(lv, 3, 'trois interactions = attaché');
});

test('MGMT nouveau cycle — carte principale complète : Leïla repropose en fin de pile, le cycle ne se ferme pas', () => {
  const win = newGameWindow();
  enterMgmt(win,20);
  win.eval(`G.mgmt.pile.forEach(a=>{a.status='closed';a.decision='ignored';});`);
  poseMainCard(win);
  win.eval(`CL.mgmtNextCycle();`);
  /* Lot 3a §5 + §T3 : la carte principale est complète, les préliminaires
     manquent — Leïla repropose, en fin de pile (après les autres
     affaires), et le cycle ne se ferme pas. */
  assert.equal(win.eval(`G.mgmt.cycle`), 1, 'préliminaires manquants : le cycle ne se ferme pas');
  assert.equal(win.eval(`G.mgmt.pile[G.mgmt.pile.length-1].kind`), 'leila_bulk', 'nouvelle proposition de Leïla en fin de pile (§T3)');
  assert.equal(win.eval(`G.mgmt.pile[G.mgmt.pile.length-1].status`), 'open', 'proposition ouverte');
  assert.equal(win.eval(`G.mgmt.open`), win.eval(`G.mgmt.pile[G.mgmt.pile.length-1].id`), 'sélectionnée d\u2019office');
});

test('MGMT nouveau cycle — carte principale incomplète : le calendrier attend le joueur, le cycle ne se ferme pas', () => {
  const win = newGameWindow();
  enterMgmt(win,20);
  win.eval(`G.mgmt.pile.forEach(a=>{a.status='closed';a.decision='ignored';});`);
  const c0 = win.eval(`G.mgmt.cycle`);
  const card0 = win.eval(`JSON.stringify(G.mgmt.card)`);
  win.eval(`CL.mgmtNextCycle();`);
  /* §4 bis, décision 4 d'Anthony du 20/09/2026 (docs/LOT-2-CARTE-
     PRINCIPALE.md) : carte principale incomplète, le joueur a la main —
     le calendrier attend, le cycle ne se ferme pas, la carte en cours est
     conservée. Le lot 1g (aucun blocage) ne joue que sur un pot épuisé. */
  assert.equal(win.eval(`G.mgmt.cycle`), c0, 'carte principale incomplète : le cycle ne bouge pas');
  assert.equal(win.eval(`JSON.stringify(G.mgmt.card)`), card0, 'la carte en cours est conservée intacte');
  assert.equal(win.eval(`G.mgmt.pile.filter(a=>a.kind==='leila_bulk').length`), 0, 'aucune proposition en bloc avant la carte principale complète');
  assert.equal(win.eval(`G.mgmt.shortfall`), false, 'ce n\u2019est pas le pot qui manque : aucun shortfall signalé');
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
    for(let c=0;c<20&&G.mgmt.pile.length===0;c++) mgmtNewPile(G.mgmt);
    const aff=G.mgmt.pile[0];
    const tgt=mgmtFighterById(G.mgmt,aff.a);
    tgt.name='<img src=x onerror=alert(1)>';
    tgt.first='<img src=x onerror=alert(1)>';
    tgt.last='X';
    CL.mgmtOpen(aff.id);
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
  enterMgmtSingles(win,23);
  const titles = JSON.parse(win.eval(`JSON.stringify(G.mgmt.pile.map(a=>a.title))`));
  assert.equal(titles.length, win.eval(`G.mgmt.pile.length`));
  for(const t of titles){
    assert.ok(typeof t==='string'&&t.includes('Leïla'), 'le titre dit qui parle');
    assert.ok(t.length>12, 'le titre dit de quoi il s\u2019agit, pas un libellé vide');
  }
  assert.equal(new Set(titles).size, titles.length, 'pas un libellé de type répété à l\u2019identique');
  win.eval(`CL.mgmtReply(G.mgmt.pile.find(a=>a.status==='open'&&a.kind==='leila_propose').id,'refuse')`);
  const rt = win.eval(`G.mgmt.pile[G.mgmt.pile.length-1].title`);
  assert.ok(typeof rt==='string'&&rt.includes('Leïla'), 'l\u2019affaire de réaction est titrée elle aussi');
});

test('MGMT ouverture — la première affaire de la pile est sélectionnée d\u2019office', () => {
  const win = newGameWindow();
  enterMgmt(win,24);
  win.eval(`for(let c=0;c<20&&G.mgmt.pile.length===0;c++) mgmtNewPile(G.mgmt);`);
  assert.equal(win.eval(`G.mgmt.open`), win.eval(`G.mgmt.pile[0].id`));
  win.eval(`G.mgmt.pile.forEach(a=>{a.status='closed';a.decision='ignored';}); CL.mgmtNextCycle();
    for(let c=0;c<20&&G.mgmt.pile.length===0;c++) mgmtNewPile(G.mgmt); render();`);
  if(win.eval(`G.mgmt.pile.length`)>0){
    assert.equal(win.eval(`G.mgmt.open`), win.eval(`G.mgmt.pile[0].id`), 'pareil à chaque nouveau cycle non vide');
  }
});

test('MGMT réparation — une sauvegarde sans titres se recharge, titres recalculés', () => {
  const win = newGameWindow();
  enterMgmt(win,25);
  win.eval(`for(let c=0;c<20&&G.mgmt.pile.length===0;c++) mgmtNewPile(G.mgmt);`);
  win.eval(`G.mgmt.pile.forEach(a=>{delete a.title;}); G.mgmt.open=null; saveMgmt(); G.mgmt=null;`);
  assert.equal(win.eval(`loadMgmt()`), true);
  assert.equal(win.eval(`G.mgmt.pile.every(a=>typeof a.title==='string'&&a.title.includes('Leïla'))`), true);
  assert.equal(win.eval(`G.mgmt.open`), win.eval(`G.mgmt.pile.find(a=>a.status==='open').id`));
});
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: MGMT_LOT1CBIS_HIERARCHIE] — Lot 1c bis : fond et hiérarchie
   visuelle — combat seul d'emblée, sujet au select, dossier hiérarchisé. ==== */
test('MGMT hiérarchie — une affaire non sélectionnée n\u2019affiche que A contre B', () => {
  const win = newGameWindow();
  enterMgmt(win,26);
  /* §T3 : la proposition en bloc part après la carte principale — la
     cinquième place posée (gesture T2) fait arriver Leïla pendant que les
     singles sont encore ouverts : la pile montre les uns et l'autre. */
  win.eval(`(function(){
    for(let k=0;k<5;k++){
      const m=G.mgmt, rows=mgmtCartRows(m);
      let booked=false;
      for(const f of rows){
        if(!mgmtSelectable(m,f,null)) continue;
        const b=rows.find(x=>x.id!==f.id&&x.div===f.div&&mgmtSelectable(m,x,f.id));
        if(b){ mgmtBookMain(m,f.id,b.id); booked=true; break; }
      }
      if(!booked) break;
    }
  })()`);
  win.eval(`render();`);
  const names = win.eval(`JSON.stringify(G.mgmt.pile.filter(a=>a.kind!=='leila_bulk').map(a=>{
    const fa=G.mgmt.roster.find(o=>o.id===a.a), fb=G.mgmt.roster.find(o=>o.id===a.b);
    return fa.name+' contre '+fb.name;
  }))`);
  const expected = JSON.parse(names);
  const html = win.document.getElementById('app').innerHTML;
  for(const vs of expected){
    assert.ok(html.includes(vs), `l\u2019affaire affiche son combat : ${vs}`);
  }
  assert.ok(html.includes('Carte — 4 combats'), 'la proposition en bloc a sa ligne');
  assert.ok(!html.includes('Leïla propose'), 'qui parle n\u2019est pas rappelé dans la pile');
  assert.ok(!html.includes('Leïla réagit'), 'qui parle n\u2019est pas rappelé dans la pile');
  const det = JSON.parse(win.eval(`JSON.stringify((()=>{
    const m=G.mgmt;
    const bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open');
    m.open=bulk?bulk.id:m.open; render();
    return {bulkSub:bulk?mgmtBulkSubject(m,bulk):null,
      singleSubs:m.pile.filter(a=>a.kind==='leila_propose'&&a.status==='open'&&a.id!==m.open).map(a=>mgmtAffairSubject(m,a))};
  })())`));
  const html2 = win.document.getElementById('app').innerHTML;
  if(det.bulkSub) assert.ok(html2.includes(det.bulkSub), 'sujet visible sur l\u2019affaire sélectionnée');
  for(const s of det.singleSubs){
    assert.ok(!html2.includes(s), `sujet masqué hors sélection : ${s}`);
  }
});

test('MGMT dossier — nom dominant, métadonnées discrètes, raison jamais affichée', () => {
  const win = newGameWindow();
  enterMgmt(win,27);
  const card1 = win.eval(`mgmtLineCard(G.mgmt.roster[0])`);
  assert.ok(card1.includes('mgmt-fname'), 'le nom domine');
  assert.ok(card1.includes(' ans · '), 'âge et catégorie sur une seule ligne');
  assert.ok(!card1.includes('Split'), 'Split n\u2019est pas répété dans chaque fiche');
  assert.ok(!card1.includes('Raison de se battre'), 'un simple Nom n\u2019affiche pas de raison');
  win.eval(`mgmtPromote(G.mgmt,G.mgmt.roster[0])`);
  const card2 = win.eval(`mgmtLineCard(G.mgmt.roster[0])`);
  assert.ok(!card2.includes('Raison de se battre'), 'le Dossier non plus : la raison appartient à la future fiche');
  assert.ok(win.eval(`MGMT_RAISONS.some(r=>r.id===G.mgmt.roster[0].raison)`), 'mais elle reste suivie en interne');
  assert.ok(win.eval(`G.mgmt.roster[0].level`)===2, 'et le niveau progresse normalement');
  assert.ok(card2.includes('mgmt-lvl'), 'le repère de niveau est discret');
  assert.ok(!card2.includes('class="dlt"'), 'le repère de niveau n\u2019est pas un bouton');
});
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: MGMT_LOT1D_VARIETE] — Lot 1d : variété de la pile, corrélation
   âge/bilan, compteur d'affaires. ==== */
test('MGMT variété — prénoms uniques par pile, run max 2, singles 0-2 + bloc', () => {
  const win = newGameWindow();
  const bad = win.eval(`
    (function(){
      let bad=0;
      for(let s=1;s<=200;s++){
        setSeed(s);
        const m=mgmtDefault(); mgmtNewRoster(m); mgmtNewPile(m);
        /* §T3 : le bloc attend la carte principale complète — posée en
           fixture, la proposition de Leïla est tirée par le refill,
           après les singles du cycle. */
        const dispo=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o));
        if(dispo.length>=10){
          for(let i=0;i<5;i++) m.card.main.push({a:dispo[2*i].id,b:dispo[2*i+1].id,cycle:m.cycle,slot:'main'});
          mgmtRefillBulk(m);
        }
        const singles=m.pile.filter(a=>a.kind==='leila_propose');
        const bulks=m.pile.filter(a=>a.kind==='leila_bulk');
        if(singles.length<0||singles.length>2) bad++;
        if(bulks.length>1) bad++;
        if(m.shortfall) bad++;
        const seen=new Set(), pairs=new Set();
        const take=(idA,idB)=>{
          const fa=mgmtFighterById(m,idA), fb=mgmtFighterById(m,idB);
          if(seen.has(fa.first)||seen.has(fb.first)) bad++;
          seen.add(fa.first); seen.add(fb.first);
          const k=[idA,idB].sort().join('|');
          if(pairs.has(k)) bad++;
          pairs.add(k);
        };
        let run=0, last=null;
        for(const a of singles){
          take(a.a,a.b);
          const d=mgmtAffairDiv(m,a);
          run=(d===last)?run+1:1; last=d;
          if(run>2) bad++;
        }
        for(const b of bulks){
          if(!Array.isArray(b.fights)||b.fights.length!==4) bad++;
          let brun=0, blast=null;
          for(const f of b.fights){
            take(f.a,f.b);
            const fa=mgmtFighterById(m,f.a), fb=mgmtFighterById(m,f.b);
            const d=fa.div===fb.div?fa.div:fa.div;
            brun=(d===blast)?brun+1:1; blast=d;
            if(brun>2) bad++;
          }
        }
      }
      return bad;
    })()`);
  assert.equal(bad, 0, '200 piles : prénoms uniques y compris bloc, runs ≤ 2, aucun shortfall');
});

test('MGMT pot de prénoms — le shortfall se signale au lieu de contourner', () => {
  const win = newGameWindow();
  /* Roster volontairement famine : une seule paire possible. Dès que le
     tirage demande 2 affaires, la seconde est impossible — shortfall=true,
     pile restée dans les règles, pas de contournement. */
  const st = win.eval(`
    (function(){
      /* Graines espacées : le premier tirage après setSeed(s) suit une
         progression arithmétique modulo 1 — des graines consécutives
         donneraient toutes le même n. En jeu, le tirage suit la génération
         du roster (des centaines d'appels) et ne clusterise pas. */
      let fired=0, clean=0, total=0;
      for(let s=1;s<=50;s++){
        setSeed(s*7919+13);
        const m=mgmtDefault();
        m.roster=[
          {id:'a',name:'A Boxeur',first:'A',last:'Boxeur',W:5,L:2,D:0,age:25,div:'H-light',divName:'Poids léger',org:'Split',level:1,raison:null,interactions:0},
          {id:'b',name:'B Lutteur',first:'B',last:'Lutteur',W:4,L:3,D:0,age:27,div:'H-light',divName:'Poids léger',org:'Split',level:1,raison:null,interactions:0},
        ];
        mgmtNewPile(m);
        total++;
        if(m.shortfall){
          fired++;
          if(m.pile.length<=1) clean++;
          const seen=new Set(); let ok=true;
          for(const x of m.pile){
            const fa=mgmtFighterById(m,x.a), fb=mgmtFighterById(m,x.b);
            if(seen.has(fa.first)||seen.has(fb.first)) ok=false;
          }
          if(ok) clean++;
        }
      }
      return JSON.stringify({fired,clean,total});
    })()`);
  const s = JSON.parse(st);
  assert.ok(s.fired>0, 'le tripwire se déclenche quand le pot est épuisé');
  assert.equal(s.clean, s.fired*2, 'piles shortfall : taille bornée et règles intactes');
});

test('MGMT âge/bilan — bandes débutant/vétéran disjointes, garde 1d intacte', () => {
  const win = newGameWindow();
  const st = win.eval(`
    (function(){
      let bad=0, maxRookie=-1e9, minVet=1e9;
      for(let s=1;s<=200;s++){
        setSeed(s);
        const m=mgmtDefault(); mgmtNewRoster(m);
        for(const o of m.roster){
          const fights=o.W+o.L;
          if(o.age<=26){ if(fights<4||fights>12) bad++; if(fights>maxRookie) maxRookie=fights; }
          else if(o.age>=29){ if(fights<15||fights>30) bad++; if(fights<minVet) minVet=fights; }
          else { if(fights<8||fights>22) bad++; }
          if(fights<(o.age-18)||fights>((o.age-18)*4)) bad++;
        }
      }
      return JSON.stringify({bad,maxRookie,minVet});
    })()`);
  const s = JSON.parse(st);
  assert.equal(s.bad, 0, '200 rosters : bandes tenues et garde 1d intacte');
  assert.ok(s.maxRookie<s.minVet, `écart débutant/vétéran : max rookie ${s.maxRookie} < min vétéran ${s.minVet}`);
});

test('MGMT compteur — les lignes affichées sont exactement les affaires ouvertes', () => {
  const win = newGameWindow();
  enterMgmt(win,28);
  win.eval(`for(let c=0;c<20&&mgmtOpenCount(G.mgmt)===0;c++) mgmtNewPile(G.mgmt);`);
  const rowsFresh = (win.document.getElementById('app').innerHTML.match(/mgmt-aff/g)||[]).length;
  win.eval(`render()`);
  const rowsFresh2 = (win.document.getElementById('app').innerHTML.match(/mgmt-aff/g)||[]).length;
  assert.equal(rowsFresh2, win.eval(`mgmtOpenCount(G.mgmt)`), 'une ligne par affaire ouverte, pile petite ou vide');
  const n = win.eval(`mgmtOpenCount(G.mgmt)`);
  if(n>=1) win.eval(`CL.mgmtReply(G.mgmt.pile.find(a=>a.status==='open').id,'accept')`);
  if(win.eval(`mgmtOpenCount(G.mgmt)`)>=1) win.eval(`CL.mgmtReply(G.mgmt.pile.find(a=>a.status==='open').id,'refuse')`);
  const html = win.document.getElementById('app').innerHTML;
  const rows = (html.match(/mgmt-aff/g)||[]).length;
  assert.equal(rows, win.eval(`mgmtOpenCount(G.mgmt)`), 'après décisions : le compteur et l\u2019affichage coïncident');
});

test('MGMT compteur accordé — zéro, un et plusieurs', () => {
  const win = newGameWindow();
  assert.equal(win.eval(`mgmtOpenLabel(0)`), 'Aucune affaire ouverte');
  assert.equal(win.eval(`mgmtOpenLabel(1)`), '1 affaire ouverte');
  assert.equal(win.eval(`mgmtOpenLabel(3)`), '3 affaires ouvertes');
  enterMgmt(win,29);
  win.eval(`G.mgmt.pile=[]; G.mgmt.open=null; render();`);
  const html = win.document.getElementById('app').innerHTML;
  assert.ok(html.includes('Aucune affaire ouverte'), 'pile vide : compteur accordé');
  assert.ok(html.includes('La pile est vide.'), 'pile vide : colonne d\u2019échange explicite');
  /* §4 bis, décision 4 du 20/09/2026 + charte S6 (docs/CHARTE-INTERFACE-
     MANAGEMENT.md) : carte principale incomplète et composable, le
     déclencheur ne ferait rien — il n'est pas proposé ; l'état de la carte
     se lit sur la ligne du cycle (charte S4, mgmtCardLabel). */
  assert.ok(!html.includes('Cycle suivant'), 'carte principale incomplète : pas de déclencheur qui ne ferait rien');
  assert.ok(html.includes('Carte principale 0/5'), 'l\u2019état de la carte reste lisible sur la ligne du cycle');
  assert.ok(!html.includes('btn gold'), 'plus aucun aplat or criard');
});

test('MGMT paroles — les réponses sont des paroles, pas des boutons', () => {
  const win = newGameWindow();
  enterMgmtFull(win,30);
  win.eval(`CL.mgmtOpen(G.mgmt.pile.find(a=>a.status==='open').id)`);
  const html = win.document.getElementById('app').innerHTML;
  assert.ok(html.includes('class="mgmt-rep"'), 'réponses en classe paroles');
  assert.ok(html.includes('mgmt-reps'), 'bloc de réponses espacé');
  assert.ok(!html.includes('class="btn mt" onclick="CL.mgmtReply'), 'aucune réponse en bouton');
});

test('MGMT confinement — le traitement bureau vit et meurt avec le bureau', () => {
  const win = newGameWindow();
  enterMgmt(win,31);
  assert.equal(win.eval(`document.getElementById('app').classList.contains('mgmt')`), true);
  assert.equal(win.eval(`document.body.classList.contains('mgmt')`), true);
  win.eval(`CL.mgmtLeave()`);
  assert.equal(win.eval(`document.getElementById('app').classList.contains('mgmt')`), false);
  assert.equal(win.eval(`document.body.classList.contains('mgmt')`), false);
  assert.equal(win.eval(`G.screen`), 'title');
});

/* ==== [ANCRE: MGMT_LOT1E_CLAVIER_ACCUSE] — Lot 1e-7/8 : clavier générique +
   bindings bureau, accusé et focus suivante. ==== */
test('MGMT clavier — dispatcher générique : routage, gardes, consommation ciblée', () => {
  const win = newGameWindow();
  const r = win.eval(`
    (function(){
      const out={};
      let ran=null;
      keysRegister('ecran_test',{a(){ ran='a'; }, Escape(){ ran='esc'; }});
      G={theme:'dark',screen:'ecran_test'};
      out.unknown=keysHandle({key:'z',target:{tagName:'DIV'}});
      out.input=keysHandle({key:'a',target:{tagName:'INPUT'}});
      out.mod=keysHandle({key:'a',target:{tagName:'DIV'},ctrlKey:true});
      let prevented=false;
      out.hit=keysHandle({key:'a',target:{tagName:'DIV'},preventDefault(){ prevented=true; }});
      out.ran=ran; out.prevented=prevented;
      G.screen='ailleurs';
      out.elsewhere=keysHandle({key:'a',target:{tagName:'DIV'}});
      keysUnregister('ecran_test');
      out.unreg=keysHandle({key:'a',target:{tagName:'DIV'}});
      G=null;
      return JSON.stringify(out);
    })()`);
  const s = JSON.parse(r);
  assert.equal(s.unknown, false, 'touche non mappée : ignorée');
  assert.equal(s.input, false, 'saisie en cours : jamais interceptée');
  assert.equal(s.mod, false, 'modificateur : jamais intercepté');
  assert.equal(s.hit, true, 'touche mappée : jouée');
  assert.equal(s.ran, 'a', 'bonne action appelée');
  assert.equal(s.prevented, true, 'preventDefault seulement quand consommée');
  assert.equal(s.elsewhere, false, 'autre écran : carte inactive');
  assert.equal(s.unreg, false, 'désenregistrement effectif');
});

test('MGMT clavier bureau — flèches, Échap en vrai dispatch', () => {
  const win = newGameWindow();
  enterMgmtFull(win,32);
  const key = k => win.eval(`document.dispatchEvent(new KeyboardEvent('keydown',{key:'${k}',bubbles:true}))`);
  const first = win.eval(`G.mgmt.open`);
  const n = win.eval(`mgmtOpenCount(G.mgmt)`);
  key('ArrowDown');
  if(n>1){
    assert.notEqual(win.eval(`G.mgmt.open`), first, 'flèche bas : affaire suivante');
    key('ArrowUp');
    assert.equal(win.eval(`G.mgmt.open`), first, 'flèche haut : retour');
    for(let i=0;i<10;i++) key('ArrowDown');
    assert.equal(win.eval(`G.mgmt.open`), first, 'rebouclage exact en bout de pile');
  }else{
    assert.equal(win.eval(`G.mgmt.open`), first, 'pile d\u2019une affaire : les flèches ne cassent rien');
  }
  key('Escape');
  assert.equal(win.eval(`G.screen`), 'title', 'Échap : retour au titre');
  assert.equal(win.eval(`document.body.classList.contains('mgmt')`), false, 'Échap : confinement retiré');
});

test('MGMT clavier chiffres — joue la réponse visible du même rang', () => {
  const win = newGameWindow();
  enterMgmtSingles(win,33);
  /* C1 (§T3) : accepter n'est visible que si le combat se pose — le test
     garde une paire posable (même catégorie) pour figer les rangs. */
  win.eval(`(function(){
    const m=G.mgmt;
    m.pile=[]; m.open=null;
    const d=m.roster.filter(o=>o.div===m.roster[0].div&&mgmtAvailable(m,o)).slice(0,2);
    if(d.length<2) throw new Error('fixture : pas assez de combattants');
    m.pile.push({id:'k1',kind:'leila_propose',exchange:'leila_propose',speaker:'leila',a:d[0].id,b:d[1].id,status:'open',decision:null,title:'t'});
  })()`);
  win.eval(`CL.mgmtOpen('k1')`);
  win.eval(`document.dispatchEvent(new KeyboardEvent('keydown',{key:'2',bubbles:true}))`);
  assert.equal(win.eval(`G.mgmt.facts.length`), 1, 'chiffre 2 : la proposition est refusée');
  assert.equal(win.eval(`G.mgmt.facts[0].k`), 'refused');
  /* R4 : la troisième réponse visible est Ignorer — le clavier la joue. */
  win.eval(`(function(){
    const m=G.mgmt;
    const d=m.roster.filter(o=>o.div===m.roster[0].div&&mgmtAvailable(m,o)).slice(2,4);
    if(d.length<2) throw new Error('fixture : pas assez de combattants');
    m.pile.push({id:'k3',kind:'leila_propose',exchange:'leila_propose',speaker:'leila',a:d[0].id,b:d[1].id,status:'open',decision:null,title:'t'});
    CL.mgmtOpen('k3');
  })()`);
  win.eval(`document.dispatchEvent(new KeyboardEvent('keydown',{key:'3',bubbles:true}))`);
  assert.equal(win.eval(`G.mgmt.facts[G.mgmt.facts.length-1].k`), 'ignored', 'chiffre 3 : ignore comme le bouton');
  assert.equal(win.eval(`G.mgmt.pile.find(a=>a.id==='k3').status`), 'closed', 'affaire clôturée au clavier');
});

test('MGMT focus suivante — l\u2019affaire traitée passe la main, la pile vidée attend le joueur', () => {
  const win = newGameWindow();
  enterMgmtSingles(win,34);
  /* Deux affaires ouvertes garanties, paires posables (même catégorie) :
     le focus passe la main. */
  win.eval(`(function(){
    const m=G.mgmt;
    m.pile=[]; m.open=null;
    const byDiv={};
    for(const o of m.roster){ if(!mgmtAvailable(m,o)) continue; (byDiv[o.div]=byDiv[o.div]||[]).push(o); }
    const d=allDivisions().map(x=>byDiv[x.id]||[]).find(p=>p.length>=4);
    if(!d) throw new Error('fixture : pas assez de combattants');
    m.pile.push({id:'k1',kind:'leila_propose',exchange:'leila_propose',speaker:'leila',a:d[0].id,b:d[1].id,status:'open',decision:null,title:'t'});
    m.pile.push({id:'k2',kind:'leila_propose',exchange:'leila_propose',speaker:'leila',a:d[2].id,b:d[3].id,status:'open',decision:null,title:'t'});
  })()`);
  win.eval(`CL.mgmtOpen('k1')`);
  const c0 = win.eval(`G.mgmt.cycle`);
  win.eval(`CL.mgmtReply('k1','accept')`);
  assert.equal(win.eval(`G.mgmt.cycle`), c0, 'le cycle ne s\u2019ouvre pas tout seul');
  assert.notEqual(win.eval(`G.mgmt.open`), 'k1', 'le focus a quitté l\u2019affaire traitée');
  assert.equal(win.eval(`G.mgmt.pile.find(a=>a.id===G.mgmt.open).status`), 'open', 'le focus est sur une affaire ouverte');
  /* §T3 : la pile vidée n'ouvre aucun cycle — la carte principale est
     incomplète, Leïla n'a rien à proposer ; le déclencheur manuel fait
     avancer le cycle (lot 1g). */
  win.eval(`CL.mgmtReply('k2','accept')`);
  assert.equal(win.eval(`mgmtOpenCount(G.mgmt)`), 0, 'pile vidée');
  assert.equal(win.eval(`G.mgmt.cycle`), c0, 'aucun cycle auto-ouvert');
  assert.equal(win.eval(`G.mgmt.card.main.length`), 2, 'les deux accepts sont entrés en carte principale (C1)');
});

/* ==== [ANCRE: MGMT_LOT1F] — Lot 1f : version de sauvegarde, mémoire en
   phrases, valeurs du fond. ==== */
test('MGMT version — une sauvegarde d\u2019avant ne ressuscite jamais', () => {
  const win = newGameWindow();
  /* Forme v1 (lots 1 à 1e, sans champ v) : refusée, le bureau redémarre. */
  const old = {org:'Split',cycle:3,seq:99,roster:[],pile:[],facts:[],open:null,shortfall:false,ack:null};
  assert.equal(win.eval(`validateMgmt(${JSON.stringify(old)})`), false, 'v1 sans version rejetée');
  win.localStorage.setItem('cage-legacy-mgmt', JSON.stringify(old));
  win.eval(`G={theme:'dark'}; loadMgmt();`);
  assert.equal(win.eval(`G.mgmt==null`), true, 'aucune résurrection d\u2019ancien format');
  const fresh = win.eval(`(function(){ const m=mgmtDefault(); return m.v; })()`);
  assert.equal(win.eval(`MGMT_SAVE_VERSION`), fresh, 'les sauvegardes neuves portent la version');
  assert.equal(win.eval(`validateMgmt(JSON.parse(JSON.stringify(Object.assign(mgmtDefault(),{v:MGMT_SAVE_VERSION}))))`), true, 'v2 bien formée acceptée');
});

test('MGMT mémoire — seuls écrasements et revirements, en phrases', () => {
  const win = newGameWindow();
  enterMgmtFull(win,40);
  assert.deepEqual(win.eval(`JSON.stringify(mgmtMemoryLines(G.mgmt))`), '[]', 'sans fait significatif : section vide');
  win.eval(`G.mgmt.facts=[
    {c:1,k:'booked',a:'x',b:'y'},{c:1,k:'refused',a:'x',b:'y'},{c:1,k:'ignored',a:'x',b:'y'},
    {c:2,k:'booked',bulk:true,a:'x',b:'y'}]`);
  assert.deepEqual(win.eval(`JSON.stringify(mgmtMemoryLines(G.mgmt))`), '[]', 'le comportement normal ne se mémorise pas');
  const t = win.eval(`G.mgmt.roster[0].id`);
  win.eval(`
    (function(){
      const m=G.mgmt;
      m.leila={crushes:[2]};
      m.pile.push({id:'m1',kind:'leila_bulk',exchange:'leila_bulk',speaker:'leila',a:'${t}',b:m.roster[1].id,status:'open',decision:null,title:'t',fights:[{a:'${t}',b:m.roster[1].id,sloppy:false,warned:false}],marked:null});
      if(!mgmtSwapFight(m,'m1')) throw new Error('swap attendu');
      mgmtDecide(m,'m1','validate');
    })()`);
  const lines = JSON.parse(win.eval(`JSON.stringify(mgmtMemoryLines(G.mgmt).map(l=>l.text))`));
  assert.ok(lines.every(t=>t.indexOf('Leïla — ')===0), 'chaque phrase est du point de vue de Leïla');
  assert.ok(lines.some(t=>t==='Leïla — tu as écrasé sa carte.'), 'l\u2019écrasement se retient');
  assert.ok(lines.some(t=>t==='Leïla — tu as échangé un de ses combats.'), 'le revirement se retient');
  assert.ok(!lines.some(t=>t.includes('accepté')||t.includes('sa proposition')), 'valider ne se mémorise pas');
  win.eval(`CL.mgmtOpen(G.mgmt.pile.find(a=>a.status==='open').id); render();`);
  const html = win.document.getElementById('app').innerHTML;
  assert.ok(html.includes('tu as écrasé sa carte'), 'la colonne Mémoire affiche la phrase');
  assert.ok(!html.includes('log-row'), 'plus aucune ligne de journal');
});

test('MGMT mémoire — un refus simple ne se retient plus', () => {
  const win = newGameWindow();
  enterMgmtSingles(win,41);
  win.eval(`CL.mgmtReply(G.mgmt.pile.find(a=>a.status==='open'&&a.kind==='leila_propose').id,'refuse')`);
  assert.deepEqual(win.eval(`JSON.stringify(mgmtMemoryLines(G.mgmt))`), '[]', 'refuser n\u2019est pas notable');
});

test('MGMT fond — valeurs prescrites sur les bonnes règles', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const rule = sel => {
    const i = src.indexOf(sel);
    assert.ok(i>=0, `règle ${sel} présente`);
    return src.slice(i, src.indexOf('}', i));
  };
  const app = rule('#app.mgmt{');
  assert.ok(app.includes('#423521')&&app.includes('#120E08'), '#app.mgmt : zénithal prescrit');
  const col = rule('.mgmt-col{');
  assert.ok(col.includes('#3A2D1B'), '.mgmt-col : panneau prescrit');
  assert.ok(col.includes('#75603E'), '.mgmt-col : bordures prescrites');
  assert.ok(col.includes('0 8px 24px rgba(0,0,0,.6)'), '.mgmt-col : relief prescrit');
  assert.ok(src.includes('body.mgmt{background:#120E08}'), 'body.mgmt : confinement au ton du bas');
  for(const old of ['#0A0704','#332818','#6B5636','#3A2E1C']){
    assert.ok(!src.includes(old), `aucune trace de l\u2019ancienne valeur ${old}`);
  }
});

/* ==== [ANCRE: MGMT_LOT1G] — Lot 1g : auto-cycle, bouton discret, mémoire
   Leïla. Réécrit au lot 3a (§5, décisions du 10/09/2026) : « pile vide » ne
   vaut plus « cycle suivant ». Carte complète : la soirée s'ouvre d'abord.
   Réécrit au lot 2 T3 (docs/LOT-2-CARTE-PRINCIPALE.md §T3 ; LOT-3B §2,
   décision du 15/09/2026) : la carte principale est composée d'abord (C1 :
   les singles acceptés y entrent, le reste posé en fixture), puis Leïla
   propose les préliminaires en fin de pile ; carte principale incomplète,
   elle n'a rien à proposer et le déclencheur manuel avance le cycle
   (aucun blocage définitif). ==== */
test('MGMT auto-cycle — pile vidée avec carte complète : la soirée s\u2019ouvre d\u2019abord, le cycle avance après', () => {
  const win = newGameWindow();
  enterMgmtFull(win,35);
  const c0 = win.eval(`G.mgmt.cycle`);
  assert.equal(c0, 1, 'le premier cycle est 1');
  /* §T3 : la carte principale est composée d'abord — les singles acceptés
     y entrent (C1), le reste posé en fixture (composition = T2). */
  win.eval(`(function(){ let g=0; while(mgmtOpenCount(G.mgmt)>0&&g<40){ g++; const a=G.mgmt.pile.find(x=>x.status==='open'); CL.mgmtReply(a.id,a.exchange==='leila_propose'?'refuse':MGMT_EXCHANGES[a.exchange].replies[0].id); } })()`);
  win.eval(`(function(){
    const m=G.mgmt;
    const dispo=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o));
    if(dispo.length<10) throw new Error('fixture : roster trop court');
    m.card.main=[];
    for(let i=0;i<5;i++) m.card.main.push({a:dispo[2*i].id,b:dispo[2*i+1].id,cycle:m.cycle,slot:'main'});
  })()`);
  /* §T3 : la carte principale complète fait arriver la proposition des
     préliminaires (refill du §5) — validée, la carte passe à 5+4. */
  win.eval(`CL.mgmtNextCycle()`);
  const id = win.eval(`G.mgmt.pile.find(a=>a.status==='open'&&a.kind==='leila_bulk').id`);
  win.eval(`CL.mgmtReply('${id}','validate')`);
  /* Lot 3a §5 : pile vide et carte complète, la soirée s'ouvre — pas le
     cycle suivant. Le cycle vaut encore 1 à ce moment. */
  assert.equal(win.eval(`G.screen`), 'mgmt_soiree', 'la soirée s\u2019ouvre d\u2019abord');
  assert.equal(win.eval(`G.mgmt.cycle`), c0, 'le cycle vaut encore 1 au moment de la soirée');
  assert.ok(win.eval(`G.mgmt.lastEvent`), 'la soirée est calculée en une fois (anti-rechargement)');
  assert.equal(win.eval(`G.mgmt.lastEvent.cycle`), c0, 'la soirée est rattachée au cycle joué');
  assert.equal(win.eval(`G.mgmt.card.main.length+G.mgmt.card.prelims.length`), 0, 'la carte est vidée après la soirée');
  /* « Continuer » soirée puis, s'il y a des touchés, lendemain. */
  mgmtFinishEvent(win);
  assert.equal(win.eval(`G.mgmt.cycle`), c0+1, 'après la soirée puis le lendemain, le cycle vaut 2');
  assert.equal(win.eval(`G.screen`), 'mgmt_bureau', 'le bureau rouvre');
  assert.ok(win.eval(`G.mgmt.pile.every(a=>a.status==='open')`), 'nouvelle pile fraîche');
});

test('MGMT bouton discret — carte principale incomplète : le déclencheur n\u2019est pas proposé, le calendrier attend', () => {
  const win = newGameWindow();
  enterMgmt(win,36);
  win.eval(`G.mgmt.pile=[]; G.mgmt.open=null; render();`);
  let html = win.document.getElementById('app').innerHTML;
  /* §4 bis, décision 4 d'Anthony du 20/09/2026 + charte S6 : carte
     principale incomplète et composable, « Cycle suivant » ne ferait
     rien — il n'est pas proposé ; l'état de la carte se lit d'un regard
     (charte S4). */
  assert.ok(!html.includes('Cycle suivant'), 'carte principale incomplète : pas de d\u00e9clencheur qui ne ferait rien');
  assert.ok(html.includes('Carte principale 0/5'), 'l\u2019état de la carte se lit sur la ligne du cycle (S4)');
  assert.ok(!html.includes('btn gold'), 'plus aucun aplat or criard');
  assert.equal(win.eval(`G.mgmt.card.main.length+G.mgmt.card.prelims.length`), 0, 'carte incomplète (0/9)');
  const c0 = win.eval(`G.mgmt.cycle`);
  const card0 = win.eval(`JSON.stringify(G.mgmt.card)`);
  win.eval(`CL.mgmtNextCycle()`);
  /* Le calendrier attend le joueur : le cycle ne bouge pas, la carte en
     cours est conservée (le déclencheur n'est d'ailleurs plus affiché
     dans cet état). */
  assert.equal(win.eval(`G.mgmt.cycle`), c0, 'le cycle ne bouge pas tant que la carte principale n\u2019est pas composée');
  assert.equal(win.eval(`JSON.stringify(G.mgmt.card)`), card0, 'la carte en cours est conservée intacte');
  assert.equal(win.eval(`G.mgmt.pile.filter(a=>a.kind==='leila_bulk').length`), 0, 'aucune proposition en bloc avant la carte principale complète');
  /* Carte principale complète (fixture — composition = T2) : le
     déclencheur redevient proposé, il a de nouveau un effet. */
  poseMainCard(win);
  win.eval(`render();`);
  html = win.document.getElementById('app').innerHTML;
  assert.ok(html.includes('Cycle suivant'), 'carte principale complète : le déclencheur est proposé à nouveau');
});

test('MGMT cycle suivant — carte complète : le déclencheur manuel ouvre la soirée et fait avancer le cycle', () => {
  const win = newGameWindow();
  enterMgmtWithBulk(win,45);
  const id = mgmtBulkId(win);
  /* §T3 : la carte principale est complète (fixture = composition T2) ; le
     bloc validé complète les préliminaires. Une place est d'abord libérée
     (retrait, geste réel) : la validation ne déclenche pas la soirée et
     le déclencheur manuel reste le seul chemin d'ouverture. */
  win.eval(`mgmtRemoveMain(G.mgmt,4)`);
  win.eval(`CL.mgmtReply('${id}','validate')`);
  assert.equal(win.eval(`G.mgmt.card.prelims.length`), 4, 'quatre préliminaires');
  assert.equal(win.eval(`G.screen`), 'mgmt_bureau', 'carte incomplète : pas de soirée d\u2019office');
  /* La cinquième place se re-pose à l'écran (geste T2) — la carte devient
     complète, la pile est vidée. La pose passe par mgmtBookMain direct
     (hors contrôleur) : le rendu suit, comme après le vrai geste. */
  win.eval(`(function(){
    const m=G.mgmt, rows=mgmtCartRows(m);
    const a=rows.find(f=>mgmtSelectable(m,f,null));
    const b=rows.find(f=>f.id!==a.id&&f.div===a.div&&mgmtSelectable(m,f,a.id));
    if(!a||!b||!mgmtBookMain(m,a.id,b.id)) throw new Error('fixture : pose impossible');
    render();
  })()`);
  assert.equal(win.eval(`mgmtCardFull(G.mgmt)`), true, 'carte complète à 5 + 4');
  assert.equal(win.eval(`mgmtOpenCount(G.mgmt)`), 0, 'pile vidée');
  assert.ok(win.document.getElementById('app').innerHTML.includes('Cycle suivant'), 'déclencheur visible');
  const c0 = win.eval(`G.mgmt.cycle`);
  win.eval(`CL.mgmtNextCycle()`);
  /* Carte complète : le déclencheur manuel ouvre la soirée, puis le cycle
     avance. */
  assert.equal(win.eval(`G.screen`), 'mgmt_soiree', 'carte complète : la soirée se joue');
  assert.equal(win.eval(`G.mgmt.cycle`), c0, 'le cycle n\u2019avance qu\u2019après la soirée');
  mgmtFinishEvent(win);
  assert.equal(win.eval(`G.mgmt.cycle`), c0+1, '« Cycle suivant » fait bien avancer le cycle');
});

test('MGMT sortie de carte incomplète — la reproposition validée complète la carte, le cycle avance normalement', () => {
  const win = newGameWindow();
  win.eval(`setSeed(46); CL.mgmtEnter();`);
  /* §T1 : la carte principale est posée en fixture (composition = T2) ; le
     bloc reproposé complète les préliminaires — 5 + 4, la soirée s'ouvre. */
  poseMainCard(win);
  win.eval(`G.mgmt.pile.forEach(a=>{a.status='closed';a.decision='ignored';}); G.mgmt.open=null; render();`);
  assert.equal(win.eval(`G.mgmt.card.main.length+G.mgmt.card.prelims.length`), 5, 'carte incomplète (5/9, sans prélims)');
  win.eval(`CL.mgmtNextCycle()`);
  assert.equal(win.eval(`G.mgmt.cycle`), 1, 'le cycle ne se ferme pas tant que la carte est incomplète');
  const id = win.eval(`G.mgmt.pile.find(a=>a.status==='open'&&a.kind==='leila_bulk').id`);
  win.eval(`CL.mgmtReply('${id}','validate')`);
  /* Le bloc validé était bien la sortie : les préliminaires sont passés de
     0/4 à 4/4, la carte est passée de 5/9 à 9/9 et la soirée s'est ouverte
     d'elle-même (la preuve en est lastEvent, calculé sur les neuf combats,
     puis la carte vidée — §T1, lot 3a §5). */
  assert.equal(win.eval(`G.screen`), 'mgmt_soiree', 'carte complétée : la soirée s\u2019ouvre d\u2019elle-même');
  assert.equal(win.eval(`G.mgmt.lastEvent.fights.length`), 9, 'la soirée a bien joué les neuf combats de la carte');
  assert.equal(win.eval(`G.mgmt.lastEvent.cycle`), 1, 'soirée rattachée au cycle en cours');
  /* Après complétion, le cycle avance normalement (soirée → lendemain). */
  mgmtFinishEvent(win);
  assert.equal(win.eval(`G.mgmt.cycle`), 2, 'après complétion, le cycle avance normalement');
  assert.equal(win.eval(`G.screen`), 'mgmt_bureau', 'le bureau rouvre');
});

/* Sorties du §5 complétant la carte autrement que par la reproposition de
   Leïla. Aucune n'existe encore dans le code : ni implémentation, ni
   simulation — chaque test reste marqué skip tant que le comportement
   n'est pas écrit, et chacun a son entrée dans docs/QUESTIONS-OUVERTES.md.
   Toute réplique éventuelle de ces écrans est [EMPLACEMENT AUTEUR]. */
test('MGMT sortie carte incomplète — remonter un combat des préliminaires', {skip:'comportement absent du code — voir docs/QUESTIONS-OUVERTES.md'}, () => {
  /* À écrire quand la fonctionnalité existera : depuis une carte incomplète,
     une proposition en bloc validée peut placer un combat en début de carte
     en remontant un combat déjà proposé des préliminaires — puis la carte
     complète, le cycle avance normalement (soirée → lendemain → cycle 2). */
});

test('MGMT sortie carte incomplète — short notice : combattant de Split ou d\u2019une autre organisation', {skip:'comportement absent du code — voir docs/QUESTIONS-OUVERTES.md'}, () => {
  /* À écrire quand la fonctionnalité existera : engager en short notice un
     combattant du roster de Split, puis un combattant d'une autre
     organisation, complète la carte ; après complétion, le cycle avance
     normalement. Aucun libellé d'interface : [EMPLACEMENT AUTEUR]. */
});

test('MGMT sortie carte incomplète — combattant libre de contrat', {skip:'comportement absent du code — voir docs/QUESTIONS-OUVERTES.md'}, () => {
  /* À écrire quand la fonctionnalité existera : engager un combattant libre
     de contrat complète la carte ; après complétion, le cycle avance
     normalement. Aucun libellé d'interface : [EMPLACEMENT AUTEUR]. */
});

test('MGMT absence de blocage — pot épuisé, le cycle avance toujours', () => {
  const win = newGameWindow();
  const r = win.eval(`
    (function(){
      setSeed(55);
      const m=mgmtDefault(); mgmtNewRoster(m);
      /* §4 bis, décision 4 d'Anthony du 20/09/2026 : le pot est épuisé
         quand plus rien n'est composable ni proposable — ici la carte
         principale complète (fixture, composition = T2) engage les dix
         combattants disponibles et personne ne reste pour les
         préliminaires, même assoupli (mgmtRefillBulk → shortfall). */
      const dispo=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o));
      if(dispo.length<10) return null;
      m.roster=dispo.slice(0,10);
      m.card.main=[];
      for(let i=0;i<5;i++) m.card.main.push({a:m.roster[2*i].id,b:m.roster[2*i+1].id,cycle:m.cycle,slot:'main'});
      m.pile=[]; m.open=null;
      if(!G) G={theme:'dark'};
      G.mgmt=m;
      const c0=m.cycle;
      CL.mgmtNextCycle();
      return JSON.stringify({c0,c1:m.cycle,card:m.card.main.length+':'+m.card.prelims.length});
    })()`);
  const s = JSON.parse(r);
  assert.equal(s.c0, 0, 'état initial : cycle 0');
  assert.equal(s.c1, s.c0+1, 'aucun état ne laisse le joueur incapable de faire avancer le cycle (lot 1g)');
  assert.equal(s.card, '5:0', 'pot épuisé : rien n\u2019est rempli d\u2019office (carte intacte)');
});

/* ==== [ANCRE: MGMT_LOT2_T5_TESTS] — Lot 2 T5 le calendrier attend le
   joueur (docs/LOT-2-CARTE-PRINCIPALE.md §T5 ; §4 bis « Questions de
   règle — tranchées par Anthony le 20/09/2026 », décisions 4 et 6) :
   mgmtClosePile sépare les deux anciens 'stuck' — 'compose' (carte
   principale incomplète et composable : le joueur a la main, le
   calendrier attend) et 'stuck' (pot de combattants épuisé : le cycle
   avance, lot 1g). Tests dirigés : les quatre issues de la fin de pile,
   puis le calendrier par le vrai geste CL.mgmtNextCycle sur les trois
   cas du contrat. ==== */

test('MGMT T5 fin de pile — les quatre issues de mgmtClosePile', () => {
  const win = newGameWindow();
  const r = win.eval(`
    (function(){
      const dispo=(m,n)=>m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o)).slice(0,n);
      const etat=()=>{ setSeed(70); const m=mgmtDefault(); mgmtNewRoster(m); return m; };
      /* Carte principale complète (fixture — composition = T2) : les dix
         premiers disponibles y sont posés, ils sortent du pot. */
      const poseMain=m=>{ const d=dispo(m,10);
        m.card.main=[];
        for(let i=0;i<5;i++) m.card.main.push({a:d[2*i].id,b:d[2*i+1].id,cycle:m.cycle,slot:'main'});
        return d; };
      const out={};
      /* 'compose' : carte principale incomplète et composable. */
      let m=etat(); m.pile=[]; m.open=null;
      out.compose=mgmtClosePile(m);
      /* 'event' : carte complète 5 + 4. */
      m=etat(); poseMain(m); m.card.prelims=[];
      const d=dispo(m,8);
      for(let i=0;i<4;i++) m.card.prelims.push({a:d[2*i].id,b:d[2*i+1].id,cycle:m.cycle,slot:'prelim'});
      m.pile=[]; m.open=null;
      out.event=mgmtClosePile(m);
      /* 'refill' : carte principale complète, préliminaires manquants,
         Leïla a encore quoi proposer — la proposition est poussée (§5). */
      m=etat(); poseMain(m); m.pile=[]; m.open=null;
      out.refill=mgmtClosePile(m);
      out.refillBulk=!!m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open');
      /* 'stuck' : la carte principale engage les dix disponibles,
         personne ne reste pour les préliminaires — pot épuisé. */
      m=etat(); const d10=poseMain(m); m.roster=d10; m.pile=[]; m.open=null;
      out.stuck=mgmtClosePile(m);
      /* 'none' : la pile est encore ouverte. */
      m=etat();
      m.pile=[{id:'k-x',kind:'leila_propose',exchange:'leila_propose',speaker:'leila',a:m.roster[0].id,b:m.roster[1].id,status:'open',decision:null}];
      out.none=mgmtClosePile(m);
      return JSON.stringify(out);
    })()`);
  const s = JSON.parse(r);
  assert.equal(s.compose, 'compose', 'carte principale incomplète et composable : le joueur a la main');
  assert.equal(s.event, 'event', 'carte complète : la soirée');
  assert.equal(s.refill, 'refill', 'préliminaires manquants, pot disponible : Leïla repropose');
  assert.equal(s.refillBulk, true, 'la reproposition du §5 est poussée en fin de pile');
  assert.equal(s.stuck, 'stuck', 'pot épuisé : personne ne reste, même assoupli');
  assert.equal(s.none, 'none', 'pile encore ouverte : rien à fermer');
});

test('MGMT T5 calendrier — carte principale incomplète et pile vide : le cycle ne bouge pas, la carte en cours est conservée intacte', () => {
  const win = newGameWindow();
  enterMgmt(win,71);
  win.eval(`(function(){
    const m=G.mgmt;
    const d=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o));
    m.card.main=[{a:d[0].id,b:d[1].id,cycle:m.cycle,slot:'main'}];
    m.pile.forEach(a=>{a.status='closed';a.decision='ignored';});
    m.open=null;
  })()`);
  const before = win.eval(`JSON.stringify({c:G.mgmt.cycle,card:G.mgmt.card,pile:G.mgmt.pile.map(a=>a.id)})`);
  win.eval(`CL.mgmtNextCycle();`);
  /* §4 bis, décision 4 du 20/09/2026 : le calendrier attend — le cycle,
     la carte en cours et la pile restent exactement ce qu'ils étaient. */
  assert.equal(win.eval(`JSON.stringify({c:G.mgmt.cycle,card:G.mgmt.card,pile:G.mgmt.pile.map(a=>a.id)})`), before,
    'le cycle ne bouge pas, la carte et la pile sont conservées intactes');
  assert.equal(win.eval(`G.screen`), 'mgmt_bureau', 'le bureau reste ouvert : le joueur compose');
});

test('MGMT T5 calendrier — pot épuisé : le cycle avance encore', () => {
  const win = newGameWindow();
  const r = win.eval(`
    (function(){
      setSeed(72);
      const m=mgmtDefault(); mgmtNewRoster(m);
      const d=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o)).slice(0,10);
      m.roster=d;
      for(let i=0;i<5;i++) m.card.main.push({a:d[2*i].id,b:d[2*i+1].id,cycle:m.cycle,slot:'main'});
      m.pile=[]; m.open=null;
      if(!G) G={theme:'dark'};
      G.mgmt=m;
      const c0=m.cycle;
      const r1=mgmtClosePile(m);
      CL.mgmtNextCycle();
      return JSON.stringify({c0,c1:m.cycle,r1});
    })()`);
  const s = JSON.parse(r);
  assert.equal(s.r1, 'stuck', 'carte principale complète, personne hors carte : le pot est épuisé');
  assert.equal(s.c1, s.c0+1, 'le pot épuisé fait encore avancer le cycle (lot 1g, aucun blocage)');
});

test('MGMT T5 calendrier — carte complète et pile vide : c\u2019est la soirée', () => {
  const win = newGameWindow();
  enterMgmt(win,73);
  win.eval(`(function(){
    const m=G.mgmt;
    const d=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o));
    m.card.main=[]; m.card.prelims=[];
    for(let i=0;i<5;i++) m.card.main.push({a:d[2*i].id,b:d[2*i+1].id,cycle:m.cycle,slot:'main'});
    for(let i=0;i<4;i++) m.card.prelims.push({a:d[10+2*i].id,b:d[11+2*i].id,cycle:m.cycle,slot:'prelim'});
    m.pile=[]; m.open=null;
  })()`);
  const c0 = win.eval(`G.mgmt.cycle`);
  win.eval(`CL.mgmtNextCycle()`);
  assert.equal(win.eval(`G.screen`), 'mgmt_soiree', 'pile vide et carte complète : la soirée s\u2019ouvre');
  assert.equal(win.eval(`G.mgmt.lastEvent.fights.length`), 9, 'les neuf combats de la carte sont joués');
  assert.equal(win.eval(`G.mgmt.cycle`), c0, 'le cycle n\u2019avance qu\u2019après la soirée');
});

/* Économie du short notice (règle du découvert, QO-5). Lot 3b T1
   (docs/LOT-3B-CONTRAT.md §3 T1) pose l'argent : trésorerie, recette nette,
   plafond — les deux premiers tests sont activés à cette occasion ; le
   troisième (au-delà du plafond : carte réduite) reste skip, la soirée en
   carte réduite est la T7. */
test('MGMT économie — short notice payable à découvert dans la limite du plafond', () => {
  const win = newGameWindow();
  /* QO-5 : le short notice est autorisé si et seulement si T − coût ≥ −P,
     avec P = 0 avant la première soirée, P = max(0, R₁) après une, puis
     P = max(0, arrondi((R₁ + R₂) / 2)). */
  assert.equal(win.eval(`(function(){ const m=mgmtDefault(); m.treasury=50; return mgmtCanAfford(m,60); })()`), false,
    'avant la 1ʳᵉ soirée (exemple QO-5) : T=50 refuse un coût de 60, P=0');
  assert.equal(win.eval(`(function(){ const m=mgmtDefault(); m.treasury=50; return mgmtCanAfford(m,50); })()`), true,
    'la limite exacte passe : T − coût = −0 ≥ −0');
  assert.equal(win.eval(`(function(){ const m=mgmtDefault(); m.treasury=30; m.recettes=[120]; m.eventsPlayed=1; return mgmtCanAfford(m,100); })()`), true,
    'exemple QO-5 : R₁=120, T=30 accepte un coût de 100 (−70 ≥ −120)');
  assert.equal(win.eval(`(function(){ const m=mgmtDefault(); m.treasury=30; m.recettes=[120]; m.eventsPlayed=1; return mgmtCanAfford(m,151); })()`), false,
    'au-delà du plafond : refusé');
  /* Palier 2, mesuré sur deux vraies soirées : le plafond est la moyenne
     arrondie des deux dernières recettes, pas un compteur séparé. */
  const r = win.eval(`
    (function(){
      setSeed(66);
      const m=mgmtDefault(); mgmtNewRoster(m);
      for(let e=0;e<2;e++){
        /* §T3 : la carte principale est posée d'abord en fixture
           (composition = T2), Leïla propose les prélims ensuite. */
        m.card.main=[];
        const dispo=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o));
        if(dispo.length<10) return null;
        for(let i=0;i<5;i++) m.card.main.push({a:dispo[2*i].id,b:dispo[2*i+1].id,cycle:m.cycle,slot:'main'});
        m.pile=[]; m.open=null;
        mgmtClosePile(m);
        const bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open');
        if(!bulk||!mgmtDecide(m,bulk.id,'validate')) return null;
        if(!mgmtRunEvent(m)) return null;
      }
      const P=mgmtOverdraftCap(m);
      const attendu=Math.max(0,Math.round((m.recettes[0]+m.recettes[1])/2));
      return JSON.stringify({P,attendu,R1:m.recettes[0],R2:m.recettes[1]});
    })()`);
  const s = JSON.parse(r);
  assert.equal(s.P, s.attendu, `plafond lissé sur les deux dernières recettes (R2=${s.R2}, R1=${s.R1})`);
});

test('MGMT économie — remboursement du découvert sur la recette suivante', () => {
  const win = newGameWindow();
  const r = win.eval(`
    (function(){
      setSeed(64);
      const m=mgmtDefault(); mgmtNewRoster(m);
      /* §T3 : la carte principale est posée d'abord en fixture
         (composition = T2), Leïla propose les prélims ensuite. */
      m.card.main=[];
      const dispo=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o));
      if(dispo.length<10) return null;
      for(let i=0;i<5;i++) m.card.main.push({a:dispo[2*i].id,b:dispo[2*i+1].id,cycle:m.cycle,slot:'main'});
      m.pile=[]; m.open=null;
      mgmtClosePile(m);
      const bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open');
      if(!bulk||!mgmtDecide(m,bulk.id,'validate')) return null;
      m.treasury=-70;
      const ev=mgmtRunEvent(m);
      if(!ev) return null;
      return JSON.stringify({R:ev.finance.recette,T:m.treasury,e1:ev.e1});
    })()`);
  const s = JSON.parse(r);
  assert.equal(s.T, -70+s.R, 'remboursement automatique : T ← T + R, avant tout bénéfice');
  assert.equal(s.e1, s.R>0, 'E1 si et seulement si une dette a effectivement été déduite');
  if(s.R<70) assert.ok(s.T<0, 'le reste de la dette est reporté (T reste négatif)');
});

test('MGMT économie — au-delà du plafond : plus de short notice, soirée en carte réduite avec pénalité', {skip:'comportement absent du code — voir docs/QUESTIONS-OUVERTES.md'}, () => {
  /* À écrire quand la fonctionnalité existera : au-delà du plafond, l'option
     short notice n'est plus proposée et la soirée en carte réduite devient
     disponible avec pénalité. Aucun libellé d'interface : [EMPLACEMENT AUTEUR]. */
});

/* Les deux tests du contrat LOT-3A-TESTS (docs/LOT-3A-TESTS-CONTRAT.md §5),
   règles du §5 du lot 3a qui existent dans le code : la proposition en bloc
   non ignorable, et l'absence de tout remplissage d'office. §T3 : la
   proposition en bloc attend la carte principale complète — posée en
   fixture (composition = T2), Leïla propose les prélims ensuite. */
test('MGMT bloc non ignorable — carte incomplète : seuls valider, échanger, écraser restent', () => {
  const win = newGameWindow();
  enterMgmtWithBulk(win,60);
  const id = mgmtBulkId(win);
  win.eval(`CL.mgmtOpen('${id}')`);
  /* Lot 3a §5 : tant que la carte est incomplète, ignorer le bloc est
     interdit — ce serait une nouvelle proposition gratuite, sans le coût
     de l'écrasement. */
  assert.equal(win.eval(`mgmtIgnore(G.mgmt,'${id}')`), false, 'ignorer le bloc est refusé tant que la carte est incomplète');
  assert.equal(win.eval(`G.mgmt.pile.find(a=>a.id==='${id}').status`), 'open', 'l\u2019affaire reste ouverte');
  const html = win.document.getElementById('app').innerHTML;
  assert.ok(!html.includes(`CL.mgmtIgnore('${id}')`), 'l\u2019interface ne propose pas Ignorer sur le bloc incomplet');
  /* Carte complète (posée en fixture — §T1 : la carte principale est posée
     d'office pour viser la garde elle-même ; le bloc validé complète les
     préliminaires) : la règle bascule, Ignorer redevient une réponse
     disponible. */
  win.eval(`(function(){
    const a=G.mgmt.pile.find(x=>x.id==='${id}');
    const m=G.mgmt;
    m.card.main=[];
    const dispo=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o));
    if(dispo.length<10) throw new Error('fixture : roster trop court');
    for(let i=0;i<5;i++) m.card.main.push({a:dispo[2*i].id,b:dispo[2*i+1].id,cycle:m.cycle,slot:'main'});
    m.card.prelims=a.fights.map(f=>({a:f.a,b:f.b,cycle:m.cycle,slot:'prelim'}));
  })()`);
  assert.equal(win.eval(`mgmtCardFull(G.mgmt)`), true, 'carte complète');
  assert.equal(win.eval(`mgmtIgnore(G.mgmt,'${id}')`), true, 'carte complète : ignorer redevient possible');
  assert.equal(win.eval(`G.mgmt.pile.find(a=>a.id==='${id}').decision`), 'ignored', 'clôturée comme les autres affaires');
});

test('MGMT aucun remplissage d\u2019office — rien n\u2019entre en carte sans une décision du joueur', () => {
  const win = newGameWindow();
  win.eval(`setSeed(61); CL.mgmtEnter();`);
  /* §T3 : la carte principale est posée d'abord en fixture (composition =
     T2), puis Leïla propose les prélims — écrasés sans validation. Les
     singles sont refusés : les accepter entrerait en carte, et c'est une
     décision du joueur (C1), jamais un remplissage d'office. La carte est
     revérifiée après CHAQUE action : un remplissage d'office (à la
     reproposition, à la fermeture de cycle) serait vu à l'instant même où
     il se produirait. */
  poseMainCard(win);
  /* §T3 : Leïla propose dès la carte principale complète (refill du §5,
     le même appel que le booking de la cinquième place) — la pile de
     départ est parfois née vide (aucun single ce cycle). */
  win.eval(`mgmtRefillBulk(G.mgmt)`);
  const drained = win.eval(`
    (function(){
      let g=0, crushed=0, refills=0;
      const nb=()=>G.mgmt.card.main.length+G.mgmt.card.prelims.length;
      while(mgmtOpenCount(G.mgmt)>0&&g<40){
        g++;
        const a=G.mgmt.pile.find(x=>x.status==='open');
        const act=a.kind==='leila_bulk'?'crush':(a.exchange==='leila_propose'?'refuse':MGMT_EXCHANGES[a.exchange].replies[0].id);
        if(act==='crush') crushed++;
        CL.mgmtReply(a.id,act);
        if(G.mgmt.card.prelims.length!==0) throw new Error('prélims remplis d\u2019office à l\u2019action '+g);
        if(G.mgmt.card.main.length!==5) throw new Error('carte principale modifiée d\u2019office à l\u2019action '+g);
        if(G.mgmt.pile.some(x=>x.kind==='leila_bulk'&&x.status==='open')) refills++;
      }
      return JSON.stringify({g,crushed,refills});
    })()`);
  const s = JSON.parse(drained);
  assert.ok(s.crushed>=1, 'au moins une proposition en bloc a été écrasée');
  assert.ok(s.refills>=1, 'Leïla a reproposé au moins un bloc après écrasement (§T3 : après la carte principale)');
  assert.equal(win.eval(`G.mgmt.card.main.length+G.mgmt.card.prelims.length`), 5, 'aucun combat n\u2019est entré en carte sans une action du joueur');
  /* Et avec une carte principale incomplète et composable ('compose') :
     le calendrier attend le joueur — rien n'est rempli d'office (§4 bis,
     décision 4 du 20/09/2026). */
  win.eval(`
    (function(){
      G.mgmt.roster=[
        {id:'a',name:'A Boxeur',first:'A',last:'Boxeur',W:5,L:2,D:0,age:25,div:'H-light',divName:'Poids léger',org:'Split',level:1,raison:null,interactions:0},
        {id:'b',name:'B Lutteur',first:'B',last:'Lutteur',W:4,L:3,D:0,age:27,div:'H-light',divName:'Poids léger',org:'Split',level:1,raison:null,interactions:0},
      ];
      G.mgmt.card.main=[]; G.mgmt.card.prelims=[];
      G.mgmt.pile.forEach(a=>{a.status='closed';a.decision='ignored';});
      G.mgmt.open=null;
      CL.mgmtNextCycle();
    })()`);
  assert.equal(win.eval(`G.mgmt.card.main.length+G.mgmt.card.prelims.length`), 0, 'rien n\u2019est rempli d\u2019office : le calendrier attend');
});

test('MGMT mémoire — formes singulier, pluriel et suites', () => {
  const win = newGameWindow();
  enterMgmt(win,37);
  const t = id => win.eval(`JSON.stringify(mgmtMemoryLines(G.mgmt).map(l=>l.text))`);
  win.eval(`G.mgmt.leila={crushes:[4]}; G.mgmt.facts=[];`);
  assert.deepEqual(JSON.parse(t()), ['Leïla — tu as écrasé sa carte.']);
  win.eval(`G.mgmt.leila={crushes:[4,9]};`);
  assert.deepEqual(JSON.parse(t()), ['Leïla — tu as écrasé 2 de ses cartes.']);
  win.eval(`G.mgmt.leila={crushes:[7,8,9]};`);
  assert.deepEqual(JSON.parse(t()), ['Leïla — tu as écrasé 3 de ses cartes, dont 3 de suite.']);
  win.eval(`G.mgmt.leila={crushes:[]}; G.mgmt.facts=[{c:1,k:'swapped',a:'x',b:'y'}];`);
  assert.deepEqual(JSON.parse(t()), ['Leïla — tu as échangé un de ses combats.']);
  win.eval(`G.mgmt.facts=[{c:1,k:'swapped',a:'x',b:'y'},{c:2,k:'swapped',a:'x',b:'y'}];`);
  assert.deepEqual(JSON.parse(t()), ['Leïla — tu as échangé 2 de ses combats.']);
});

/* ==== [ANCRE: MGMT_LOT2REVUE] — revue lot 1 : frontières carrière/bureau.
   La sauvegarde dédiée est la seule référence ; la carrière n'embarque plus
   le bureau, le chargement et l'import l'écartent, les identifiants ont un
   format strict. ==== */
test('MGMT L1-R1 — reprendre une carrière préserve le bureau récent', () => {
  const win = newGameWindow();
  win.eval(`setSeed(11); CL.mgmtEnter();`);
  win.eval(`CL.mgmtOpen(G.mgmt.pile.find(a=>a.status==='open'&&a.kind==='leila_propose').id)`);
  const id = win.eval(`G.mgmt.open`);
  win.eval(`CL.mgmtReply('${id}','accept')`);
  assert.equal(win.eval(`G.mgmt.pile.find(a=>a.id==='${id}').decision`), 'accepted');
  /* La sauvegarde carrière n'embarque plus le bureau. */
  win.eval(`G.f=makeFighter({}); G.season={year:1,fights:[]}; G.ach=[]; G.titleHistory=[]; G.screen='hub'; save();`);
  assert.equal(win.eval(`'mgmt' in JSON.parse(localStorage.getItem('cage-legacy-v3'))`), false, 'save() ne persiste plus G.mgmt');
  /* Une copie embarquée ancienne (sauvegardes d'avant) est écartée au chargement. */
  win.eval(`(function(){ const raw=JSON.parse(localStorage.getItem('cage-legacy-v3'));
    raw.mgmt=JSON.parse(JSON.stringify(G.mgmt));
    const stale=raw.mgmt.pile.find(a=>a.id==='${id}');
    stale.decision=null; stale.status='open';
    localStorage.setItem('cage-legacy-v3',JSON.stringify(raw)); })()`);
  win.eval(`CL.cont()`);
  assert.equal(win.eval(`G.mgmt`), undefined, 'aucune copie embarquée ne survit au chargement');
  win.eval(`CL.go('title'); CL.mgmtEnter();`);
  assert.equal(win.eval(`G.mgmt.pile.find(a=>a.id==='${id}').decision`), 'accepted', 'le bureau dédié gagne sur la copie embarquée');
  /* Traiter une autre affaire persiste sans écraser la décision. */
  win.eval(`G.mgmt.pile.push({id:'k-r1',kind:'leila_propose',exchange:'leila_propose',speaker:'leila',a:G.mgmt.roster[0].id,b:G.mgmt.roster[1].id,status:'open',decision:null,title:'t'}); CL.mgmtIgnore('k-r1');`);
  const after = JSON.parse(win.eval(`localStorage.getItem('cage-legacy-mgmt')`));
  assert.equal(after.pile.find(a=>a.id===`${id}`).decision, 'accepted', 'décision toujours persistée après reprise et action suivante');
});

test('MGMT L1-R2 — un identifiant importé reste une donnée', () => {
  const win = newGameWindow();
  /* Format strict : guillemets, chevrons et ponctuation rejetés. */
  for(const evil of ["x');window.__m=1;//",'a"b','a<b','c;d','e`f']){
    assert.equal(win.eval(`mgmtValidAffair({id:${JSON.stringify(evil)},kind:'leila_propose',exchange:'leila_propose',speaker:'leila',a:'p',b:'q',status:'open'})`), false, 'id piégé rejeté : '+evil);
  }
  for(const ok of ['mg12','t0','k-propose','a','mg1']){
    assert.equal(win.eval(`mgmtValidAffair({id:'${ok}',kind:'leila_propose',exchange:'leila_propose',speaker:'leila',a:'p',b:'q',status:'open'})`), true, 'id interne accepté : '+ok);
  }
  /* Bout en bout : import piégé, clic réel, aucun code exécuté. */
  win.eval(`setSeed(11); CL.mgmtEnter();`);
  win.eval(`G.f=makeFighter({}); G.season={year:1,fights:[]}; G.ach=[]; G.titleHistory=[]; G.screen='hub'; save();`);
  const data = win.eval(`JSON.stringify((()=>{ const raw=JSON.parse(localStorage.getItem('cage-legacy-v3'));
    raw.mgmt=JSON.parse(localStorage.getItem('cage-legacy-mgmt'));
    raw.mgmt.pile[0].id="x');window.__lot1ReviewMarker=1;//"; raw.mgmt.open=raw.mgmt.pile[0].id;
    return JSON.stringify(raw); })())`);
  win.prompt = () => data;
  win.eval(`CL.importSave()`);
  win.eval(`CL.go('title'); CL.mgmtEnter();`);
  const row = win.document.querySelector('.mgmt-aff');
  assert.ok(row, 'une affaire saine est affichée');
  row.click();
  assert.equal(win.eval(`typeof window.__lot1ReviewMarker`), 'undefined', 'le clic n\u2019a exécuté aucun code importé');
  assert.ok(!win.eval(`JSON.stringify(G.mgmt)`).includes('__lot1ReviewMarker'), 'la charge piégée n\u2019est jamais entrée dans l\u2019état');
});

test('MGMT L1-R3 — un champ mgmt importé invalide ne bloque pas le bureau sain', () => {
  const win = newGameWindow();
  win.eval(`setSeed(11); CL.mgmtEnter();`);
  const before = win.eval(`JSON.stringify(G.mgmt.pile.map(a=>a.id))`);
  win.eval(`G.f=makeFighter({}); G.season={year:1,fights:[]}; G.ach=[]; G.titleHistory=[]; G.screen='hub'; save();`);
  const data = win.eval(`JSON.stringify((()=>{ const raw=JSON.parse(localStorage.getItem('cage-legacy-v3'));
    raw.mgmt={}; return JSON.stringify(raw); })())`);
  win.prompt = () => data;
  win.eval(`CL.importSave()`);
  win.eval(`CL.go('title')`);
  assert.doesNotThrow(() => win.eval(`CL.mgmtEnter()`), 'ouverture sans exception');
  assert.equal(win.eval(`validateMgmt(G.mgmt)`), true, 'état rendu valide');
  assert.equal(win.eval(`JSON.stringify(G.mgmt.pile.map(a=>a.id))`), before, 'bureau sain conservé');
});
/* ==== [FIN ANCRE] ==== */
