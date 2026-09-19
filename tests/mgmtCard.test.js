"use strict";
/* CAGE LEGACY — tests/mgmtCard.test.js
   ============================================================================
   LOT 2 LA SOUS-CARTE — carte en construction, proposition en bloc, trois
   réponses (valider, échanger, écraser), coût de l'écrasement (addendum
   §12 : qualité dégradée, avertissements éteints, jamais annoncés),
   mémoire des écrasements. Six emplacements vides et marqués, aucun texte
   rédigé, aucune réplique existante réutilisée.
   LOT 2 T1 LA CARTE PRINCIPALE (docs/LOT-2-CARTE-PRINCIPALE.md §T1) —
   réécrits en citant le contrat : la carte devient {sizeMain:5,
   sizePrelims:4, main:[], prelims:[]} ; la proposition en bloc de Leïla
   reste sa carte préliminaire (4 combats, jamais la carte principale —
   sa composition revient au joueur à la T2) ; chaque combat porte
   slot:'main'|'prelim' ; valider place les combats dans leur emplacement ;
   la carte n'est complète qu'à 5 + 4 ; la soirée joue les 9 combats,
   carte principale d'abord. Ajoutés à cette occasion : la migration
   4 → 5 (séquentielle 2 → 3 → 4 → 5), le classement dérivé
   mgmtDivisionRank et le dernier combat (lastCycle).
   ============================================================================ */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { newGameWindow } = require('./helpers/loadGame');

/* Entrée avec proposition en bloc ouverte (carte vide : toujours proposée,
   pot suffisant en pratique — cycles bornés, déterministe). */
function enterMgmtBulk(win,seed){
  win.eval(`setSeed(${seed}); CL.mgmtEnter(); for(let c=0;c<30&&!G.mgmt.pile.some(a=>a.status==='open'&&a.kind==='leila_bulk');c++) mgmtNewPile(G.mgmt); render();`);
}
function mgmtBulkId(win){
  return win.eval(`G.mgmt.pile.find(a=>a.status==='open'&&a.kind==='leila_bulk').id`);
}

/* État management neuf avec roster généré par le vrai mgmtNewRoster, sans
   passer par l'écran : pour les tests qui ne regardent que la logique. */
function freshState(win,seed){
  win.eval(`(function(){ setSeed(${seed}); const m=mgmtDefault(); mgmtNewRoster(m); G={theme:'dark',mgmt:m}; })()`);
}

/* ==== [ANCRE: MGMT_LOT2_TESTS] — Lot 2 la sous-carte. Réécrit au lot 2 T1
   en citant docs/LOT-2-CARTE-PRINCIPALE.md §T1 : la carte de 4 places
   (décision du 15/09) devient la carte 5 + 4 du 19/09 — la proposition en
   bloc est la carte préliminaire, la carte principale attend le geste du
   joueur (T2). ==== */
test('MGMT carte T1 — 5 + 4 places, une seule proposition en bloc par cycle, carte vide', () => {
  const win = newGameWindow();
  enterMgmtBulk(win,101);
  assert.equal(win.eval(`G.mgmt.card.sizeMain`), 5, 'cinq places en carte principale, décision du 19/09 (§T1)');
  assert.equal(win.eval(`G.mgmt.card.sizePrelims`), 4, 'quatre places en préliminaires');
  assert.equal(win.eval(`G.mgmt.card.main.length`), 0, 'carte principale vide au départ (T2 : le joueur compose)');
  assert.equal(win.eval(`G.mgmt.card.prelims.length`), 0, 'préliminaires vides au départ');
  assert.equal(win.eval(`G.mgmt.pile.filter(a=>a.kind==='leila_bulk').length`), 1, 'une seule affaire en bloc');
  const n = win.eval(`G.mgmt.pile.find(a=>a.kind==='leila_bulk').fights.length`);
  assert.equal(n, 4, 'le bloc propose les quatre préliminaires, jamais la carte principale (§T1)');
});

test('MGMT bloc lisible — chaque combat : combattants, catégorie, bilan', () => {
  const win = newGameWindow();
  enterMgmtBulk(win,102);
  win.eval(`CL.mgmtOpen(G.mgmt.pile.find(a=>a.kind==='leila_bulk').id)`);
  const html = win.document.getElementById('app').innerHTML;
  const fights = JSON.parse(win.eval(`JSON.stringify(G.mgmt.pile.find(a=>a.kind==='leila_bulk').fights.map(f=>{
    const fa=mgmtFighterById(G.mgmt,f.a), fb=mgmtFighterById(G.mgmt,f.b);
    return [fa.name,fb.name,fa.divName,fa.W+'-'+fa.L+'-'+fa.D];
  }))`));
  assert.equal(fights.length, 4);
  for(const [na,nb,div,rec] of fights){
    assert.ok(html.includes(na)&&html.includes(nb), `combattants lisibles : ${na} / ${nb}`);
    assert.ok(html.includes(div), `catégorie lisible : ${div}`);
    assert.ok(html.includes(rec), `bilan lisible : ${rec}`);
  }
});

const LEILA_BULK_LINE="Voilà j'ai enfin préparé la carte préliminaire, il y a de quoi faire un beau spectacle enfin j'espère, hâte de voir la carte principale !";
const LEILA_BULK_WARN="Patron, il y a un combat, je ne sais pas, je ne le sens pas du tout, ça m'a tracassé tout hier soir, je pense qu'il faudrait le changer, j'espère que ça ne te dérange pas.";
const LEILA_SWAP_LINE="J'ai vu que vous m'avez échangé un combat, je comprends mais ses deux combattants doivent combattre aussi, j'espère que je pourrais les replacer vite..";
const LEILA_CRUSH_LINE="Je sais que j'ai pas forcément mon mot à dire, mais j'aimerais bien que vous me prévenez en avance la fois d'après que je ne passe pas ma semaine à l'organiser";
const LEILA_R_VALIDATE="Parfait, c'est du très bon travail Leïla, la carte à l'air incroyable on garde tout !";
const LEILA_R_SWAP="Leïla la carte est vraiment bien, je l'apprécie mais je préfère ajouter ce combat à la place.";
const LEILA_R_CRUSH="Leïla tu m'avais déjà habitué à un meilleur travail, cette carte n'est pas à la hauteur de mes attentes.";

test('MGMT sept textes — auteur verbatim, aucun marqueur restant', () => {
  const win = newGameWindow();
  enterMgmtBulk(win,103);
  const got = win.eval(`JSON.stringify({
    bulk:MGMT_EXCHANGES.leila_bulk.lines[0],
    warn:MGMT_EXCHANGES.leila_bulk.warning,
    swap:MGMT_EXCHANGES.leila_react_swap.lines[0],
    crush:MGMT_EXCHANGES.leila_react_crush.lines[0],
    replies:MGMT_EXCHANGES.leila_bulk.replies,
    closes:[MGMT_EXCHANGES.leila_react_swap.replies[0],MGMT_EXCHANGES.leila_react_crush.replies[0]]})`);
  const s = JSON.parse(got);
  assert.equal(s.bulk, LEILA_BULK_LINE, 'proposer en bloc verbatim');
  assert.equal(s.warn, LEILA_BULK_WARN, 'remarque verbatim');
  assert.equal(s.swap, LEILA_SWAP_LINE, 'réagir à un échange verbatim');
  assert.equal(s.crush, LEILA_CRUSH_LINE, 'réagir à un écrasement verbatim');
  assert.deepEqual(s.replies.map(r=>r.action), ['validate','swap','crush']);
  assert.equal(s.replies[0].text, LEILA_R_VALIDATE, 'valider verbatim');
  assert.equal(s.replies[1].text, LEILA_R_SWAP, 'échanger verbatim');
  assert.equal(s.replies[2].text, LEILA_R_CRUSH, 'écraser verbatim');
  const all = win.eval(`JSON.stringify(MGMT_EXCHANGES.leila_bulk)+JSON.stringify(MGMT_EXCHANGES.leila_react_swap)+JSON.stringify(MGMT_EXCHANGES.leila_react_crush)`);
  assert.ok(all.indexOf('MANQUANTE')<0, 'plus aucun emplacement vide côté bloc');
  for(const c of s.closes){
    assert.ok(!('text' in c)&&!('empty' in c), 'fermeture purement mécanique, pas un emplacement');
  }
  const known = win.eval(`MGMT_EXCHANGES.leila_propose.lines[0]+MGMT_EXCHANGES.leila_refused.lines[0]`);
  const fresh = win.eval(`JSON.stringify(MGMT_EXCHANGES.leila_bulk)+JSON.stringify(MGMT_EXCHANGES.leila_react_swap)+JSON.stringify(MGMT_EXCHANGES.leila_react_crush)`);
  assert.ok(fresh.indexOf(known.slice(0,20))<0, 'aucune réplique existante réutilisée');
});

test('MGMT valider — le bloc entre en préliminaires, la carte principale attend le joueur', () => {
  const win = newGameWindow();
  enterMgmtBulk(win,104);
  const id = mgmtBulkId(win);
  win.eval(`CL.mgmtReply('${id}','validate')`);
  assert.equal(win.eval(`G.mgmt.card.prelims.length`), 4, 'quatre combats en préliminaires (§T1 : le bloc est la carte préliminaire)');
  assert.equal(win.eval(`G.mgmt.card.main.length`), 0, 'la carte principale reste vide — le joueur la compose (T2)');
  assert.equal(win.eval(`G.mgmt.card.prelims.every(f=>f.slot==='prelim'&&Number.isSafeInteger(f.cycle))`), true, 'chaque combat porte son emplacement');
  assert.equal(win.eval(`G.mgmt.pile.find(a=>a.id==='${id}').status`), 'closed', 'proposition clôturée');
  assert.equal(win.eval(`G.mgmt.pile.find(a=>a.id==='${id}').decision`), 'validated');
  assert.equal(win.eval(`G.mgmt.facts[G.mgmt.facts.length-1].k`), 'booked', 'fait mémorisé');
  /* R1 : les huit bookings comptent comme interactions (dossiers + raisons). */
  const promo = win.eval(`JSON.stringify(G.mgmt.pile.find(a=>a.id==='${id}').fights.flatMap(f=>[f.a,f.b]).map(x=>{
    const o=mgmtFighterById(G.mgmt,x); return {level:o.level,interactions:o.interactions,raison:o.raison}; }))`);
  const ps = JSON.parse(promo);
  assert.equal(ps.length, 8);
  for(const f of ps){
    assert.ok(f.level>=2&&f.interactions===1&&f.raison!==null, 'booking validé = dossier');
  }
  /* §T1 : le compteur compact de la ligne du bureau (mgmt-screens.js) reste
     gelé pendant T1 — aucun écran touché ; la structure, elle, est posée. */
  const html = win.document.getElementById('app').innerHTML;
  assert.ok(!html.includes('Place vide'), 'plus aucun bloc de places');
});

test('MGMT échanger — un combat remplacé, pas un écrasement', () => {
  const win = newGameWindow();
  enterMgmtBulk(win,105);
  const id = mgmtBulkId(win);
  win.eval(`CL.mgmtMark('${id}',2)`);
  const before = JSON.parse(win.eval(`JSON.stringify(G.mgmt.pile.find(a=>a.id==='${id}').fights.map(f=>[f.a,f.b]))`));
  win.eval(`CL.mgmtReply('${id}','swap')`);
  const after = JSON.parse(win.eval(`JSON.stringify(G.mgmt.pile.find(a=>a.id==='${id}').fights.map(f=>[f.a,f.b]))`));
  assert.deepEqual([after[0],after[1],after[3]], [before[0],before[1],before[3]], 'seul le marqué change');
  assert.notDeepEqual(after[2], before[2], 'le marqué est remplacé');
  assert.equal(win.eval(`G.mgmt.leila.crushes.length`), 0, 'échanger n\u2019est pas écraser');
  assert.equal(win.eval(`G.mgmt.card.main.length+G.mgmt.card.prelims.length`), 0, 'la carte n\u2019a pas bougé');
  const r = JSON.parse(win.eval(`JSON.stringify(G.mgmt.pile[G.mgmt.pile.length-1])`));
  assert.equal(r.kind, 'leila_react_swap', 'Leïla réagit dans une affaire à part');
  /* R3 : la réaction vise la paire retirée, pas les remplaçants. */
  assert.deepEqual([r.a,r.b], before[2], 'réaction rattachée aux retirés');
});

test('MGMT écraser — carte intacte, coût horodaté, réaction', () => {
  const win = newGameWindow();
  enterMgmtBulk(win,106);
  const id = mgmtBulkId(win);
  const c0 = win.eval(`G.mgmt.cycle`);
  win.eval(`CL.mgmtReply('${id}','crush')`);
  assert.equal(win.eval(`G.mgmt.card.main.length+G.mgmt.card.prelims.length`), 0, 'carte intacte');
  assert.deepEqual(JSON.parse(win.eval(`JSON.stringify(G.mgmt.leila.crushes)`)), [c0], 'écrasement horodaté au cycle');
  assert.equal(win.eval(`G.mgmt.pile.find(a=>a.id==='${id}').decision`), 'crushed');
  const r = JSON.parse(win.eval(`JSON.stringify(G.mgmt.pile[G.mgmt.pile.length-1])`));
  assert.equal(r.kind, 'leila_react_crush', 'réaction à l\u2019écrasement');
  assert.equal(win.eval(`G.mgmt.facts[G.mgmt.facts.length-1].k`), 'crushed', 'fait mémorisé');
});

test('MGMT qualité — soigneuse sans écrasement, bâclée après', () => {
  const win = newGameWindow();
  const clean = win.eval(`
    (function(){
      let bad=0;
      for(let s=1;s<=200;s++){
        setSeed(s);
        const m=mgmtDefault(); mgmtNewRoster(m);
        m.leila={crushes:[]};
        const used=new Set(), seen=new Set();
        for(let i=0;i<4;i++){
          const p=mgmtPickBulkPair(m,used,seen,null,0,{total:0,streak:0});
          if(!p) break;
          used.add(p.a.first); used.add(p.b.first);
          if(p.sloppy) bad++;
        }
      }
      return bad;
    })()`);
  assert.equal(clean, 0, 'sans écrasement : aucun combat bâclé sur 200 tirages');
  const dirty = win.eval(`
    (function(){
      let sloppy=0;
      for(let s=1;s<=200;s++){
        setSeed(s+5000);
        const m=mgmtDefault(); mgmtNewRoster(m);
        m.leila={crushes:[3,4,5]};
        const used=new Set(), seen=new Set();
        for(let i=0;i<4;i++){
          const p=mgmtPickBulkPair(m,used,seen,null,0,{total:3,streak:3});
          if(!p) break;
          used.add(p.a.first); used.add(p.b.first);
          if(p.sloppy) sloppy++;
        }
      }
      return sloppy;
    })()`);
  assert.ok(dirty>0, 'après écrasements : des combats bâclés apparaissent');
});

test('MGMT avertissement — existe puis s\u2019éteint, jamais annoncé', () => {
  const win = newGameWindow();
  const r = win.eval(`
    (function(){
      let warnedYoung=0, warnedDead=0;
      for(let s=1;s<=200;s++){
        setSeed(s+7000);
        const m=mgmtDefault(); mgmtNewRoster(m);
        m.leila={crushes:[9]};
        const used=new Set(), seen=new Set();
        for(let i=0;i<4;i++){
          const p=mgmtPickBulkPair(m,used,seen,null,0,{total:1,streak:1});
          if(!p) break;
          used.add(p.a.first); used.add(p.b.first);
          if(p.sloppy&&p.warned) warnedYoung++;
        }
      }
      for(let s=1;s<=200;s++){
        setSeed(s+9000);
        const m=mgmtDefault(); mgmtNewRoster(m);
        m.leila={crushes:[6,7,8,9,10]};
        const used=new Set(), seen=new Set();
        for(let i=0;i<4;i++){
          const p=mgmtPickBulkPair(m,used,seen,null,0,{total:5,streak:5});
          if(!p) break;
          used.add(p.a.first); used.add(p.b.first);
          if(p.sloppy&&p.warned) warnedDead++;
        }
      }
      return JSON.stringify({warnedYoung,warnedDead});
    })()`);
  const s = JSON.parse(r);
  assert.ok(s.warnedYoung>0, 'un écrasement : elle prévient encore');
  assert.equal(s.warnedDead, 0, 'cinq écrasements : plus aucun avertissement, sans message');
  const w1 = win.eval(`[mgmtWarnProb(0),mgmtWarnProb(1),mgmtWarnProb(2),mgmtWarnProb(3)].map(x=>Math.round(x*100)).join(',')`);
  assert.equal(w1, '100,65,30,0', 'extinction progressive de l\u2019avertissement');
  const sp = win.eval(`[mgmtSloppyProb(0,0),mgmtSloppyProb(3,3)].map(x=>Math.round(x*100)).join(',')`);
  assert.equal(sp, '0,60', 'dégradation progressive de la qualité');
});

test('MGMT mémoire écrasements — vécus, suite contre espacés', () => {
  const win = newGameWindow();
  enterMgmtBulk(win,107);
  win.eval(`G.mgmt.leila={crushes:[4]}`);
  assert.deepEqual(JSON.parse(win.eval(`JSON.stringify(mgmtMemoryLines(G.mgmt).map(l=>l.text))`)),
    ['Leïla — tu as écrasé sa carte.']);
  win.eval(`G.mgmt.leila={crushes:[4,9,12]}`);
  assert.deepEqual(JSON.parse(win.eval(`JSON.stringify(mgmtMemoryLines(G.mgmt).map(l=>l.text))`)),
    ['Leïla — tu as écrasé 3 de ses cartes.']);
  win.eval(`G.mgmt.leila={crushes:[10,11,12]}`);
  assert.deepEqual(JSON.parse(win.eval(`JSON.stringify(mgmtMemoryLines(G.mgmt).map(l=>l.text))`)),
    ['Leïla — tu as écrasé 3 de ses cartes, dont 3 de suite.']);
});

test('MGMT clavier bloc — marquer puis échanger sans souris', () => {
  const win = newGameWindow();
  enterMgmtBulk(win,108);
  const id = mgmtBulkId(win);
  win.eval(`CL.mgmtOpen('${id}')`);
  const key = k => win.eval(`document.dispatchEvent(new KeyboardEvent('keydown',{key:'${k}',bubbles:true}))`);
  assert.equal(win.eval(`G.mgmt.pile.find(a=>a.id==='${id}').marked`), null, 'replié d\u2019emblée (niveau 1)');
  key('ArrowRight'); key('ArrowRight');
  assert.equal(win.eval(`G.mgmt.pile.find(a=>a.id==='${id}').marked`), 1, 'flèches : combat marqué');
  key('ArrowLeft');
  assert.equal(win.eval(`G.mgmt.pile.find(a=>a.id==='${id}').marked`), 0, 'retour');
  const before = win.eval(`G.mgmt.pile.find(a=>a.id==='${id}').fights[0].a`);
  key('2');
  assert.notEqual(win.eval(`G.mgmt.pile.find(a=>a.id==='${id}').fights[0].a`), before, 'chiffre 2 : le marqué est échangé');
  key('Escape');
  assert.equal(win.eval(`G.screen`), 'title', 'Échap intact');
});

test('MGMT déroulé — un seul combat ouvert à la fois', () => {
  const win = newGameWindow();
  enterMgmtBulk(win,113);
  const id = mgmtBulkId(win);
  win.eval(`CL.mgmtOpen('${id}')`);
  const duel = () => (win.document.getElementById('app').innerHTML.match(/mgmt-duel/g)||[]).length;
  assert.equal(duel(), 0, 'à l\u2019ouverture : aucun déroulé');
  win.eval(`CL.mgmtMark('${id}',1)`);
  assert.equal(duel(), 1, 'un déroulé après marquage');
  win.eval(`CL.mgmtMark('${id}',3)`);
  assert.equal(duel(), 1, 'marquer ailleurs referme le précédent');
  win.eval(`CL.mgmtMark('${id}',3)`);
  assert.equal(duel(), 0, 'recliquer replie (retour niveau 1)');
  win.eval(`CL.mgmtMark('${id}',1)`);
  const det = JSON.parse(win.eval(`JSON.stringify((()=>{
    const a=G.mgmt.pile.find(x=>x.id==='${id}');
    const fa=mgmtFighterById(G.mgmt,a.fights[1].a), fb=mgmtFighterById(G.mgmt,a.fights[1].b);
    return [fa.name,fb.name,fa.W+'-'+fa.L+'-'+fa.D,fa.divName];
  })())`));
  const html = win.document.getElementById('app').innerHTML;
  for(const s of det){
    assert.ok(html.includes(s), `déroulé complet : ${s} affiché`);
  }
});

/* §T1 : la carte n'est complète qu'à 5 + 4 — la carte principale est posée
   ici en fixture (sa composition arrive à la T2), la validation du bloc
   complète les préliminaires. Carte complète : plus de proposition en bloc. */
test('MGMT carte complète — plus de proposition en bloc', () => {
  const win = newGameWindow();
  enterMgmtBulk(win,109);
  const id = mgmtBulkId(win);
  win.eval(`(function(){
    const m=G.mgmt;
    /* Fixture : cinq combats principaux (dix combattants distincts) —
       la composition par le joueur est le geste de la T2. */
    if(m.roster.length<10) throw new Error('fixture : roster trop court');
    m.card.main=[];
    for(let i=0;i<5;i++){
      m.card.main.push({a:m.roster[2*i].id,b:m.roster[2*i+1].id,cycle:m.cycle,slot:'main'});
    }
  })()`);
  win.eval(`CL.mgmtReply('${id}','validate')`);
  assert.equal(win.eval(`G.mgmt.card.main.length`), 5, 'cinq combats principaux posés en fixture');
  assert.equal(win.eval(`G.mgmt.card.prelims.length`), 4, 'quatre préliminaires validés');
  assert.equal(win.eval(`mgmtCardFull(G.mgmt)`), true, 'carte complète à 5 + 4 (§T1)');
  win.eval(`CL.mgmtNextCycle()`);
  assert.equal(win.eval(`G.mgmt.pile.filter(a=>a.kind==='leila_bulk').length`), 0, 'carte complète : pas de nouvelle proposition');
});

test('MGMT déterminisme — même graine, même bloc', () => {
  const a = newGameWindow(), b = newGameWindow();
  for(const [w,s] of [[a,110],[b,110]]){
    w.eval(`setSeed(${s}); CL.mgmtEnter(); for(let c=0;c<30&&!G.mgmt.pile.some(x=>x.status==='open'&&x.kind==='leila_bulk');c++) mgmtNewPile(G.mgmt); render();`);
  }
  const sa = a.eval(`JSON.stringify(G.mgmt.pile.find(x=>x.kind==='leila_bulk').fights)`);
  const sb = b.eval(`JSON.stringify(G.mgmt.pile.find(x=>x.kind==='leila_bulk').fights)`);
  assert.equal(sa, sb);
});

test('MGMT aucun homonyme dans un combat — Rosa contre Rosa interdit', () => {
  const win = newGameWindow();
  const bad = win.eval(`(function(){
    let bad=0;
    for(let s=1;s<=300;s++){
      setSeed(s+4000);
      const m=mgmtDefault(); mgmtNewRoster(m); mgmtNewPile(m);
      for(const a of m.pile){
        const fights=a.kind==='leila_bulk'?a.fights:[a];
        for(const f of fights){
          const fa=mgmtFighterById(m,f.a), fb=mgmtFighterById(m,f.b);
          if(fa&&fb&&fa.first===fb.first) bad++;
        }
      }
    }
    return bad;
  })()`);
  assert.equal(bad, 0, '300 piles : jamais deux fois le même prénom dans un combat');
});

test('MGMT dossier suit le marqué — R2, pas les champs figés', () => {
  const win = newGameWindow();
  enterMgmtBulk(win,122);
  const id = mgmtBulkId(win);
  const names = i => win.eval(`JSON.stringify((()=>{ const a=G.mgmt.pile.find(x=>x.id==='${id}');
    return [a.fights[${i}].a,a.fights[${i}].b].map(x=>mgmtFighterById(G.mgmt,x).name); })())`);
  win.eval(`CL.mgmtOpen('${id}'); CL.mgmtMark('${id}',2);`);
  let html = win.document.getElementById('app').innerHTML;
  const pair2 = JSON.parse(names(2));
  assert.ok(html.includes(pair2[0])&&html.includes(pair2[1]), 'dossier sur le marqué');
  win.eval(`CL.mgmtReply('${id}','swap')`);
  const pair2b = JSON.parse(names(2));
  assert.notDeepEqual(pair2b, pair2, 'remplacement effectif');
  html = win.document.getElementById('app').innerHTML;
  const dossier = html.split('>Dossier</div>')[1].split('Mémoire')[0];
  assert.ok(dossier.includes(pair2b[0])&&dossier.includes(pair2b[1]), 'dossier suit le remplacement');
  assert.ok(!dossier.includes(pair2[0]), 'plus aucune trace du retiré au dossier');
});

test('MGMT avertissement affiché — avec les combats, sans désigner, puis silence', () => {
  const win = newGameWindow();
  enterMgmtBulk(win,112);
  const id = mgmtBulkId(win);
  /* Force un combat signalé : la remarque paraît une fois, sans nommer. */
  win.eval(`G.mgmt.pile.find(a=>a.id==='${id}').fights[1].warned=true; render();`);
  let html = win.document.getElementById('app').innerHTML;
  assert.ok(html.includes('je ne le sens pas du tout'), 'la remarque s\u2019affiche avec les combats');
  assert.equal((html.match(/je ne le sens pas du tout/g)||[]).length, 1, 'une seule fois : le combat gênant reste à deviner');
  /* Aucun signalé : rien. */
  win.eval(`G.mgmt.pile.find(a=>a.id==='${id}').fights.forEach(f=>{f.warned=false;}); render();`);
  html = win.document.getElementById('app').innerHTML;
  assert.ok(!html.includes('je ne le sens pas du tout'), 'sans signalement, pas de remarque');
});

test('MGMT extinction bout-en-bout — trois écrasements puis silence définitif', () => {
  const win = newGameWindow();
  const n = win.eval(`(function(){
    let warned=0, piles=0;
    for(let s=1;s<=200;s++){
      setSeed(s+3000);
      const m=mgmtDefault(); mgmtNewRoster(m);
      m.leila={crushes:[11,12,13]};
      mgmtNewPile(m);
      const bulk=m.pile.find(a=>a.kind==='leila_bulk');
      if(!bulk) continue;
      piles++;
      for(const f of bulk.fights){ if(f.warned) warned++; }
    }
    return piles+':'+warned;
  })()`);
  const [piles, warned] = n.split(':').map(Number);
  assert.ok(piles>150, `piles générées : ${piles}`);
  assert.equal(warned, 0, 'trois écrasements : plus aucun combat signalé sur 200 piles');
});

test('MGMT échange non vide — toute affaire sélectionnable affiche une réplique', () => {
  const win = newGameWindow();
  enterMgmtBulk(win,120);
  const ids = JSON.parse(win.eval(`JSON.stringify((()=>{
    const m=G.mgmt;
    const mk=(id,kind,ex)=>({id,kind,exchange:ex,speaker:'leila',a:m.roster[0].id,b:m.roster[1].id,status:'open',decision:null,title:'t'});
    m.pile.push(mk('k-propose','leila_propose','leila_propose'));
    m.pile.push(mk('k-refused','leila_refused','leila_refused'));
    const bulk=m.pile.find(a=>a.kind==='leila_bulk');
    m.pile.push(mk('k-swap','leila_react_swap','leila_react_swap'));
    m.pile.push(mk('k-crush','leila_react_crush','leila_react_crush'));
    render();
    return m.pile.filter(a=>a.status==='open').map(a=>a.id);
  })())`));
  assert.ok(ids.length>=5, 'les cinq sortes sont sélectionnables');
  for(const id of ids){
    win.eval(`CL.mgmtOpen('${id}')`);
    const html = win.document.getElementById('app').innerHTML;
    const n = (html.match(/mgmt-say/g)||[]).length;
    assert.ok(n>=1, `échange non vide pour ${id}`);
  }
});

test('MGMT carte sanctuarisée — aucun appariement booké n\u2019est reproposé', () => {
  const win = newGameWindow();
  const bad = win.eval(`(function(){
    let bad=0;
    for(let s=1;s<=50;s++){
      setSeed(s);
      const m=mgmtDefault(); mgmtNewRoster(m); mgmtNewPile(m);
      const bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open');
      if(!bulk) continue;
      mgmtDecide(m,bulk.id,'validate');
      for(let c=0;c<5;c++){
        mgmtNewPile(m);
        const keys=new Set(mgmtCardFights(m).map(f=>[f.a,f.b].sort().join('|')));
        for(const a of m.pile){
          if(a.kind==='leila_bulk'){ for(const f of a.fights){ if(keys.has([f.a,f.b].sort().join('|'))) bad++; } }
          else if(a.status==='open'){ if(keys.has([a.a,a.b].sort().join('|'))) bad++; }
        }
      }
    }
    return bad;
  })()`);
  assert.equal(bad, 0, 'ni singles ni blocs ne reprennent une paire bookée');
});

/* §T1 : le bloc validé entre en préliminaires — l'échange évite aussi les
   paires déjà bookées de la carte en cours. */
test('MGMT swap avec carte en prélims — le remplaçant évite aussi les paires bookées', () => {
  const win = newGameWindow();
  const ok = win.eval(`(function(){
    setSeed(121);
    const m=mgmtDefault(); mgmtNewRoster(m); mgmtNewPile(m);
    const bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open');
    if(!bulk) return 'no-bulk';
    m.card.prelims=bulk.fights.slice(0,2).map(f=>({a:f.a,b:f.b,cycle:1,slot:'prelim'}));
    const old0=[bulk.fights[0].a,bulk.fights[0].b].sort().join('|');
    if(!mgmtSwapFight(m,bulk.id)) return 'no-swap';
    const now0=[bulk.fights[0].a,bulk.fights[0].b].sort().join('|');
    if(now0===old0) return 'same';
    const keys=new Set(mgmtCardFights(m).map(f=>[f.a,f.b].sort().join('|')));
    if(keys.has(now0)) return 'dup';
    return 'ok';
  })()`);
  assert.equal(ok, 'ok', 'échange sans reprendre une paire bookée (ni sur place)');
});

test('MGMT titres — tiennent dans la colonne sans ellipse', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const i = src.indexOf('.mgmt-aff .opp-nm');
  assert.ok(i>=0, 'règle des titres de pile présente');
  const rule = src.slice(i, src.indexOf('}', i));
  assert.ok(rule.includes('white-space:normal'), 'titres enroulés, pas tronqués');
  assert.ok(!rule.includes('ellipsis'), 'aucune ellipse sur les titres');
});

test('MGMT arbitrage genre — aucun appariement mixte hommes/femmes', () => {
  const win = newGameWindow();
  const bad = win.eval(`(function(){
    let bad=0;
    for(let s=1;s<=200;s++){
      setSeed(s);
      const m=mgmtDefault(); mgmtNewRoster(m);
      m.leila={crushes:[2,3,4]};
      mgmtNewPile(m);
      const gap=o=>{ const d=divById(o.div); return d?d.gender:null; };
      for(const a of m.pile){
        const fights=a.kind==='leila_bulk'?a.fights:[a];
        for(const f of fights){
          const fa=mgmtFighterById(m,f.a), fb=mgmtFighterById(m,f.b);
          if(fa&&fb&&gap(fa)!==gap(fb)) bad++;
        }
      }
    }
    return bad;
  })()`);
  assert.equal(bad, 0, '200 piles : dégradés et replis restent dans leur genre');
});

test('MGMT validation — bloc bien formé accepté, malformé rejeté', () => {
  const win = newGameWindow();
  enterMgmtBulk(win,111);
  const good = win.eval(`G.mgmt.pile.find(a=>a.kind==='leila_bulk')`);
  assert.ok(good, 'bloc présent');
  assert.equal(win.eval(`mgmtValidAffair(G.mgmt.pile.find(a=>a.kind==='leila_bulk'))`), true, 'bloc bien formé accepté');
  assert.equal(win.eval(`mgmtValidAffair({id:'x',kind:'leila_bulk',exchange:'leila_bulk',speaker:'leila',a:'p',b:'q',status:'open',marked:0})`), false, 'bloc sans combats rejeté');
  assert.equal(win.eval(`mgmtValidAffair({id:'x',kind:'leila_bulk',exchange:'leila_bulk',speaker:'leila',a:'p',b:'q',status:'open',marked:0,fights:[{a:'p',b:'q',sloppy:'oui',warned:false}]})`), false, 'drapeau non booléen rejeté');
  assert.equal(win.eval(`mgmtValidAffair({id:'x',kind:'leila_bulk',exchange:'leila_bulk',speaker:'leila',a:'p',b:'q',status:'open',marked:0,fights:[{a:'p',b:'q',slot:'coin',sloppy:false,warned:false}]})`), false, 'emplacement inconnu rejeté');
  assert.equal(win.eval(`validateMgmt(Object.assign(mgmtDefault(),{v:MGMT_SAVE_VERSION,card:{sizeMain:5,sizePrelims:4,main:[{a:'p',b:'q',cycle:2,slot:'main'}],prelims:[{a:'p',b:'q',cycle:2,slot:'prelim'}]},leila:{crushes:[2,3]}}))`), true, 'carte et historique bien formés acceptés');
  assert.equal(win.eval(`validateMgmt(Object.assign(mgmtDefault(),{v:MGMT_SAVE_VERSION,card:{sizeMain:5,sizePrelims:4,main:[{a:'p',b:'q',cycle:1,slot:'prelim'}],prelims:[]}}))`), false, 'emplacement incohérent avec sa liste rejeté');
  assert.equal(win.eval(`validateMgmt(Object.assign(mgmtDefault(),{v:MGMT_SAVE_VERSION,leila:{crushes:[-1]}}))`), false, 'horodatage négatif rejeté');
});
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: MGMT_LOT2_T1_TESTS] — Lot 2 T1 la carte principale
   (docs/LOT-2-CARTE-PRINCIPALE.md §T1) : structure {sizeMain,sizePrelims,
   main,prelims} avec slot par combat, migration séquentielle 2 → 3 → 4 → 5
   sans perte (une v1 reste refusée), classement par catégorie dérivé
   (mgmtDivisionRank, jamais stocké), carte complète à 5 + 4 pas avant,
   soirée qui joue les 9 combats carte principale d'abord, dernier combat
   (lastCycle) écrit où le lot 3a écrit le traumatisme. ==== */
const MGMT_V4_BASE={org:'Split',v:4,cycle:2,seq:5,
  roster:[{id:'mg1',name:'A Boxeur',first:'A',last:'Boxeur',W:5,L:2,D:0,age:25,div:'H-light',divName:'Poids léger',org:'Split',level:1,raison:null,interactions:0}],
  pile:[],facts:[{c:1,k:'booked',a:'mg1',b:'mg1'}],open:null,shortfall:false,
  card:{size:4,fights:[{a:'mg1',b:'mg1',cycle:2},{a:'mg1',b:'mg1',cycle:1}]},leila:{crushes:[1]},lastEvent:null,
  treasury:120,recettes:[60],audiences:[3000],eventsPlayed:1};

test('MGMT T1 migration — v4 → v5 sans perte : les combats d\u2019une carte en cours deviennent des préliminaires', () => {
  const win = newGameWindow();
  const mig = JSON.parse(win.eval(`JSON.stringify(mgmtMigrate(JSON.parse(JSON.stringify(${JSON.stringify(MGMT_V4_BASE)}))))`));
  assert.equal(mig.v, 5, 'tampon v5');
  assert.equal(mig.card.sizeMain, 5, 'cinq places en carte principale');
  assert.equal(mig.card.sizePrelims, 4, 'quatre places en préliminaires');
  assert.equal(mig.card.main.length, 0, 'la carte principale démarre vide — aucun combat ajouté d\u2019office');
  assert.equal(mig.card.prelims.length, 2, 'aucun combat perdu : les deux combats deviennent des préliminaires');
  assert.equal(mig.card.prelims.every(f=>f.slot==='prelim'), true, 'chaque combat migré porte slot:\u2019prelim\u2019');
  assert.deepEqual(mig.card.prelims.map(f=>f.cycle), [2,1], 'les cycles posés sont conservés');
  assert.equal(mig.roster.length, 1, 'roster intact');
  assert.equal(mig.leila.crushes.length, 1, 'mémoire intacte');
  assert.equal(mig.facts.length, 1, 'faits intacts');
  assert.equal(mig.treasury, 120, 'argent d\u2019une v4 conservé');
  assert.equal(win.eval(`validateMgmt(${JSON.stringify(mig)})`), true, 'la v4 migrée passe la porte v5');
  /* La même v4 se charge depuis le stockage dédié. */
  win.localStorage.setItem('cage-legacy-mgmt', JSON.stringify(MGMT_V4_BASE));
  win.eval(`G={theme:'dark'}; loadMgmt();`);
  assert.equal(win.eval(`G.mgmt&&G.mgmt.v`), 5, 'une v4 se charge en v5');
  assert.equal(win.eval(`G.mgmt.card.prelims.length`), 2, 'les combats de la carte en cours sont des préliminaires');
});

test('MGMT T1 migration — v2 et v3 migrent en chaîne 2 → 3 → 4 → 5', () => {
  const win = newGameWindow();
  const v3 = {org:'Split',v:3,cycle:1,seq:2,
    roster:[{id:'mg1',name:'A Boxeur',first:'A',last:'Boxeur',W:5,L:2,D:0,age:25,div:'H-light',divName:'Poids léger',org:'Split',level:1,raison:null,interactions:0}],
    pile:[],facts:[],open:null,shortfall:false,
    card:{size:4,fights:[{a:'mg1',b:'mg1',cycle:1}]},leila:{crushes:[]},lastEvent:null};
  const mig3 = JSON.parse(win.eval(`JSON.stringify(mgmtMigrate(JSON.parse(JSON.stringify(${JSON.stringify(v3)}))))`));
  assert.equal(mig3.v, 5, 'migration séquentielle 3 → 4 → 5');
  assert.equal(mig3.treasury, win.eval(`MGMT_TREASURY_START`), 'champs d\u2019argent par défaut');
  assert.equal(mig3.card.prelims.length, 1, 'le combat de la carte en cours devient un préliminaire');
  assert.equal(mig3.card.main.length, 0, 'carte principale vide');
  assert.equal(win.eval(`validateMgmt(${JSON.stringify(mig3)})`), true, 'la v3 migrée passe la porte v5');
  const v2 = {org:'Split',v:2,cycle:1,seq:2,roster:[],pile:[],facts:[],open:null,shortfall:false,
    card:{size:4,fights:[{a:'mg1',b:'mg1',cycle:1}]},leila:{crushes:[]},lastEvent:null};
  const mig2 = JSON.parse(win.eval(`JSON.stringify(mgmtMigrate(JSON.parse(JSON.stringify(${JSON.stringify(v2)}))))`));
  assert.equal(mig2.v, 5, 'migration séquentielle 2 → 3 → 4 → 5');
  assert.equal(mig2.card.prelims.length, 1, 'aucun combat perdu dans la chaîne complète');
  assert.equal(mig2.treasury, win.eval(`MGMT_TREASURY_START`));
  assert.equal(win.eval(`validateMgmt(${JSON.stringify(mig2)})`), true, 'la v2 migrée passe la porte v5');
  /* Une v1 reste refusée, comme avant (ancre MGMT_LOT1F_VERSION). */
  const v1 = {org:'Split',cycle:3,seq:9,roster:[],pile:[],facts:[],open:null,shortfall:false,card:{size:4,fights:[{a:'mg1',b:'mg1'}]}};
  assert.equal(win.eval(`mgmtMigrate(JSON.parse(JSON.stringify(${JSON.stringify(v1)})))`), null, 'v1 sans version : refusée');
});

test('MGMT T1 classement — mgmtDivisionRank : dérivé, pur, retraité hors classement, suspendu classé', () => {
  const win = newGameWindow();
  const r = win.eval(`(function(){
    const m=mgmtDefault();
    const mk=(id,first,div,W,L,extra)=>Object.assign({id:id,name:first+' Test',first:first,last:'Test',W:W,L:L,D:0,age:27,div:div,divName:'Poids léger',org:'Split',level:1,raison:null,interactions:0},extra||{});
    m.roster=[
      mk('mg1','Alain','H-light',10,2),            /* +8, 10 victoires */
      mk('mg2','Bruno','H-light',10,4),            /* +6 */
      mk('mg3','César','H-light',12,4),            /* +8, plus de victoires qu'Alain */
      mk('mg4','Dorian','H-light',8,0,{lastCycle:3}),  /* +8, le plus actif */
      mk('mg5','Enzo','H-light',8,0),              /* +8, jamais combattu sous Split */
      mk('mg6','Farid','H-light',12,0,{susp:5}),   /* suspendu : classé */
      mk('mg7','Gabin','H-light',20,0,{retired:'medical'}), /* retraité : hors classement */
      mk('mg8','Hugo','H-feather',30,0),           /* autre catégorie : hors du classement léger */
    ];
    const avant=JSON.stringify(m.roster);
    const ranks=[0,1,2,3,4,5].map(i=>mgmtDivisionRank(m,m.roster[i]));
    const entreAppels=JSON.stringify([0,1,2,3,4,5].map(i=>mgmtDivisionRank(m,m.roster[i])));
    const apres=JSON.stringify(m.roster);
    return JSON.stringify({ranks,entreAppels,avant,apres,
      retire:mgmtDivisionRank(m,m.roster[6]),
      absent:mgmtDivisionRank(m,{id:'inconnu',div:'H-light',W:0,L:0}),
      plume:mgmtDivisionRank(m,m.roster[7])});
  })()`);
  const s = JSON.parse(r);
  /* Farid 12-0 (suspendu) en tête ; César (12-4) devant Alain (10-2) ;
     Dorian (8-0, dernier combat cycle 3) devant Enzo (8-0, jamais combattu) ;
     Bruno (10-4) ferme la marche. */
  assert.deepEqual(s.ranks, [3,6,2,4,5,1], 'ordre : bilan, puis victoires, puis dernier combat (le plus actif devant)');
  assert.equal(s.entreAppels, JSON.stringify(s.ranks), 'déterministe : identique d\u2019un appel à l\u2019autre');
  assert.equal(s.avant, s.apres, 'jamais écrit sur la ligne (pur)');
  assert.equal(s.retire, null, 'le retraité médical est hors classement');
  assert.equal(s.plume, 1, 'le classement se fait dans sa propre catégorie : la ligne plume est 1ʳᵉ des plumes, jamais dans le classement léger');
  assert.equal(s.absent, null, 'une ligne hors roster n\u2019a pas de rang');
  assert.equal(s.ranks[5], 1, 'le suspendu (12-0) est en tête : classé malgré sa suspension');
});

test('MGMT T1 carte — complète à 5 + 4, pas avant', () => {
  const win = newGameWindow();
  const st = win.eval(`(function(){
    const m=mgmtDefault();
    const res={};
    res.vide=mgmtCardFull(m);
    m.card.main=[{a:'mg1',b:'mg2',cycle:1,slot:'main'}];
    res.unMain=mgmtCardFull(m);
    m.card.main=[]; for(let i=0;i<4;i++) m.card.main.push({a:'mg'+i,b:'mg'+(i+1),cycle:1,slot:'main'});
    res.quatreMain=mgmtCardFull(m);
    m.card.main.push({a:'mg5',b:'mg6',cycle:1,slot:'main'});
    res.cinqMain=mgmtCardFull(m);
    m.card.prelims=[{a:'mg7',b:'mg8',cycle:1,slot:'prelim'},{a:'mg9',b:'mg10',cycle:1,slot:'prelim'},{a:'mg11',b:'mg12',cycle:1,slot:'prelim'}];
    res.cinqQuatreMoins=mgmtCardFull(m);
    m.card.prelims.push({a:'mg13',b:'mg14',cycle:1,slot:'prelim'});
    res.complete=mgmtCardFull(m);
    res.total=mgmtCardFights(m).length;
    return JSON.stringify(res);
  })()`);
  const s = JSON.parse(st);
  assert.equal(s.vide, false, 'carte vide : pas complète');
  assert.equal(s.unMain, false, 'un combat principal : pas complète');
  assert.equal(s.quatreMain, false, '4 combats principaux : pas complète (§T1 : 5 + 4, pas avant)');
  assert.equal(s.cinqMain, false, '5 principaux mais aucun prélim : pas complète');
  assert.equal(s.cinqQuatreMoins, false, '5 principaux mais 3 prélims : pas complète');
  assert.equal(s.complete, true, '5 + 4 : complète');
  assert.equal(s.total, 9, 'neuf combats posés');
});

test('MGMT T1 soirée — les 9 combats se jouent, carte principale d\u2019abord', () => {
  const win = newGameWindow();
  freshState(win,213);
  const r = win.eval(`(function(){
    const m=G.mgmt;
    const pris=m.roster.slice(0,18);
    if(pris.length<18) return 'null';
    m.card.main=[]; m.card.prelims=[];
    const ordreMain=[], ordrePrelim=[];
    for(let i=0;i<5;i++){
      const a=pris[2*i].id, b=pris[2*i+1].id;
      m.card.main.push({a:a,b:b,cycle:0,slot:'main'});
      ordreMain.push([a,b].join('|'));
    }
    for(let i=0;i<4;i++){
      const a=pris[10+2*i].id, b=pris[11+2*i].id;
      m.card.prelims.push({a:a,b:b,cycle:0,slot:'prelim'});
      ordrePrelim.push([a,b].join('|'));
    }
    const ev=mgmtRunEvent(m);
    if(!ev) return 'null';
    const joué=ev.fights.map(x=>[x.a,x.b].join('|'));
    return JSON.stringify({n:ev.fights.length,ordre:ordreMain.concat(ordrePrelim),joué,
      cardMain:m.card.main.length,cardPrelim:m.card.prelims.length,
      lastCycles:m.roster.filter(o=>pris.some(p=>p.id===o.id)).map(o=>o.lastCycle)});
  })()`);
  assert.notEqual(r,'null','une carte 5+4 complète se joue');
  const s = JSON.parse(r);
  assert.equal(s.n, 9, 'les 9 combats de la soirée sont joués');
  assert.deepEqual(s.joué, s.ordre, 'carte principale d\u2019abord, préliminaires ensuite (§T1)');
  assert.equal(s.cardMain, 0, 'la carte principale est vidée après la soirée');
  assert.equal(s.cardPrelim, 0, 'les préliminaires sont vidés après la soirée');
  assert.ok(s.lastCycles.every(c=>c===0), 'lastCycle est écrit sur chaque combattant ayant combattu (§T1)');
});
/* ==== [FIN ANCRE] ==== */