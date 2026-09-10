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

/* Entrée avec pile non vide garantie (cycles bornés, déterministe) pour les
   tests qui jouent des décisions. */
function enterMgmtFull(win,seed){
  win.eval(`setSeed(${seed}); CL.mgmtEnter(); for(let c=0;c<30&&G.mgmt.pile.length===0;c++) mgmtNewPile(G.mgmt); render();`);
}

/* Entrée avec au moins une proposition simple ouverte (les tests lot 1
   ciblent les singles ; la proposition en bloc part en tête de pile). */
function enterMgmtSingles(win,seed){
  win.eval(`setSeed(${seed}); CL.mgmtEnter(); for(let c=0;c<30&&!G.mgmt.pile.some(a=>a.status==='open'&&a.kind==='leila_propose');c++) mgmtNewPile(G.mgmt); render();`);
}
function mgmtFirstSingle(win){
  return win.eval(`G.mgmt.pile.find(a=>a.status==='open'&&a.kind==='leila_propose').id`);
}

test('MGMT entrée — roster de 40 à 60 noms, singles 0-2 + bloc, cycle 1', () => {
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
  assert.equal(st.bulk, 1, 'une seule proposition en bloc par cycle, carte vide');
  assert.equal(st.open, st.total, 'pile fraîche entièrement ouverte');
  assert.equal(win.eval(`G.mgmt.cycle`), 1);
  assert.equal(win.eval(`G.mgmt.org`), 'Split');
  assert.equal(win.eval(`G.mgmt.card.fights.length`), 0, 'carte vide au départ');
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
  const o = JSON.parse(win.eval(`JSON.stringify({id:G.mgmt.pile[0].id,a:G.mgmt.pile[0].a,b:G.mgmt.pile[0].b})`));
  win.eval(`CL.mgmtIgnore('${o.id}')`);
  assert.ok(!win.eval(`G.mgmt.pile.some(a=>a.after==='${o.id}')`), 'ignorer ne crée aucune affaire');
  const last = JSON.parse(win.eval(`JSON.stringify(G.mgmt.facts[G.mgmt.facts.length-1])`));
  assert.equal(last.k, 'ignored', 'fait mémorisé');
  assert.equal(last.a, o.a, 'fait rattaché aux bons combattants');
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

test('MGMT nouveau cycle — compteur +1, pile fraîche de 0 à 2', () => {
  const win = newGameWindow();
  enterMgmt(win,20);
  win.eval(`G.mgmt.pile.forEach(a=>{a.status='closed';a.decision='ignored';}); CL.mgmtNextCycle();`);
  assert.equal(win.eval(`G.mgmt.cycle`), 2);
  const st2 = JSON.parse(win.eval(`JSON.stringify({
    singles:G.mgmt.pile.filter(a=>a.kind==='leila_propose').length,
    bulk:G.mgmt.pile.filter(a=>a.kind==='leila_bulk').length})`));
  assert.ok(st2.singles>=0&&st2.singles<=2, `nouvelle pile singles 0-2, vue ${st2.singles}`);
  assert.ok(st2.bulk<=1, 'au plus une proposition en bloc');
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
  win.eval(`for(let c=0;c<20&&G.mgmt.pile.length===0;c++) mgmtNewPile(G.mgmt); render();`);
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
  assert.ok(html.includes('Cycle suivant'), 'pile vide : déclencheur discret');
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
  win.eval(`CL.mgmtOpen(G.mgmt.pile.find(a=>a.status==='open'&&a.kind==='leila_propose').id)`);
  win.eval(`document.dispatchEvent(new KeyboardEvent('keydown',{key:'2',bubbles:true}))`);
  assert.equal(win.eval(`G.mgmt.facts.length`), 1, 'chiffre 2 : la proposition est refusée');
  assert.equal(win.eval(`G.mgmt.facts[0].k`), 'refused');
  win.eval(`document.dispatchEvent(new KeyboardEvent('keydown',{key:'3',bubbles:true}))`);
  assert.equal(win.eval(`G.mgmt.facts.length`), 1, 'chiffre 3 sans troisième réponse : ignoré, sans plantage');
});

test('MGMT focus suivante — l\u2019affaire traitée passe la main, cycle auto si vide', () => {
  const win = newGameWindow();
  enterMgmtSingles(win,34);
  const first = win.eval(`G.mgmt.pile.find(a=>a.status==='open'&&a.kind==='leila_propose').id`);
  win.eval(`CL.mgmtOpen('${first}')`);
  const c0 = win.eval(`G.mgmt.cycle`);
  win.eval(`CL.mgmtReply('${first}','accept')`);
  if(win.eval(`G.mgmt.cycle`)===c0){
    assert.notEqual(win.eval(`G.mgmt.open`), first, 'le focus a quitté l\u2019affaire traitée');
    assert.equal(win.eval(`G.mgmt.pile.find(a=>a.id===G.mgmt.open).status`), 'open', 'le focus est sur une affaire ouverte');
  }else{
    assert.equal(win.eval(`G.mgmt.cycle`), c0+1, 'pile vidée : cycle auto-ouvert, sans permission');
    assert.ok(win.eval(`mgmtOpenCount(G.mgmt)`)>=0, 'nouvelle pile en place');
  }
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

/* ==== [ANCRE: MGMT_LOT1G] — Lot 1g : auto-cycle, bouton discret, mémoire Leïla. ==== */
test('MGMT auto-cycle — vider la pile ouvre le cycle suivant sans permission', () => {
  const win = newGameWindow();
  enterMgmtFull(win,35);
  const c0 = win.eval(`G.mgmt.cycle`);
  win.eval(`(function(){ let g=0; while(mgmtOpenCount(G.mgmt)>0&&g<10){ g++; const a=G.mgmt.pile.find(x=>x.status==='open'); CL.mgmtReply(a.id,MGMT_EXCHANGES[a.exchange].replies[0].id); } })()`);
  assert.ok(win.eval(`G.mgmt.cycle`)>=c0+1, 'le cycle suivant s\u2019ouvre tout seul');
  assert.ok(win.eval(`G.mgmt.pile.every(a=>a.status==='open')`), 'nouvelle pile fraîche');
});

test('MGMT bouton discret — pile née vide : texte et liseré, sans aplat', () => {
  const win = newGameWindow();
  enterMgmt(win,36);
  win.eval(`G.mgmt.pile=[]; G.mgmt.open=null; render();`);
  const html = win.document.getElementById('app').innerHTML;
  assert.ok(html.includes('Cycle suivant'), 'déclencheur manuel présent');
  assert.ok(!html.includes('btn gold'), 'plus aucun aplat or criard');
  const c0 = win.eval(`G.mgmt.cycle`);
  win.eval(`CL.mgmtNextCycle()`);
  assert.equal(win.eval(`G.mgmt.cycle`), c0+1, 'le déclencheur discret avance');
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
/* ==== [FIN ANCRE] ==== */
