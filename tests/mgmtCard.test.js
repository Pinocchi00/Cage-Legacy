"use strict";
/* CAGE LEGACY — tests/mgmtCard.test.js
   ===========================================================================
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
   LOT 2 T3 LEÏLA ET LES PRÉLIMINAIRES (docs/LOT-2-CARTE-PRINCIPALE.md §T3 ;
   LOT-3B §2, décision d'Anthony du 15/09/2026) — réécrits en citant le
   contrat : la proposition en bloc n'arrive qu'une fois la carte principale
   complète (5 combats posés par le joueur) et part après les autres
   affaires, jamais en tête ; les paires des prélims se choisissent hors
   carte principale (même catégorie, rangs proches, repos, priorité aux
   plus inactifs, pas de revanche immédiate) ; le coût de l'écrasement
   reste en place ; C1 : accepter une demande de Leïla booke dans la carte
   principale, carte pleine, l'action n'est pas proposée.
   ========================================================================== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { newGameWindow } = require('./helpers/loadGame');

/* §T1 : la carte principale est composée par le joueur — geste T2. Les
   tests la posent en fixture : cinq combats, dix combattants distincts et
   disponibles du roster (les affaires ouvertes de la pile gardent leurs
   combattants : le bloc qui suivra les évite, jamais le contraire). */
function poseMainCard5(win){
  win.eval(`(function(){
    const m=G.mgmt;
    const dispo=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o));
    if(dispo.length<10) throw new Error('fixture : roster trop court');
    m.card.main=[];
    for(let i=0;i<5;i++) m.card.main.push({a:dispo[2*i].id,b:dispo[2*i+1].id,cycle:m.cycle,slot:'main'});
  })()`);
}

/* Entrée avec proposition en bloc ouverte : la pile de départ ne compte
   que des propositions simples (§T3 : Leïla ne propose rien avant la
   carte principale complète) — la pile est vidée, la carte principale est
   posée en fixture, puis Leïla propose en fin de pile (refill du §5).
   Cycles bornés, déterministe. */
function enterMgmtBulk(win,seed){
  win.eval(`setSeed(${seed}); CL.mgmtEnter();`);
  win.eval(`(function(){ let g=0; while(mgmtOpenCount(G.mgmt)>0&&g<40){ g++; const a=G.mgmt.pile.find(x=>x.status==='open'); CL.mgmtReply(a.id,a.exchange==='leila_propose'?'refuse':MGMT_EXCHANGES[a.exchange].replies[0].id); } })()`);
  poseMainCard5(win);
  win.eval(`CL.mgmtNextCycle(); render();`);
}
function mgmtBulkId(win){
  return win.eval(`G.mgmt.pile.find(a=>a.status==='open'&&a.kind==='leila_bulk').id`);
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
test('MGMT T3 bloc — n\u2019arrive qu\u2019une fois la carte principale complète, après les autres affaires', () => {
  const win = newGameWindow();
  enterMgmtBulk(win,101);
  assert.equal(win.eval(`G.mgmt.card.sizeMain`), 5, 'cinq places en carte principale, décision du 19/09 (§T1)');
  assert.equal(win.eval(`G.mgmt.card.sizePrelims`), 4, 'quatre places en préliminaires');
  assert.equal(win.eval(`G.mgmt.card.main.length`), 5, 'la carte principale est complète : Leïla propose ensuite (§T3, fixture T2)');
  assert.equal(win.eval(`G.mgmt.card.prelims.length`), 0, 'préliminaires vides : ils attendent la proposition de Leïla');
  assert.equal(win.eval(`G.mgmt.pile.filter(a=>a.kind==='leila_bulk').length`), 1, 'une seule affaire en bloc');
  /* §T3 : la proposition part après les autres affaires, jamais en tête. */
  assert.equal(win.eval(`G.mgmt.pile[G.mgmt.pile.length-1].kind`), 'leila_bulk', 'le bloc ferme la pile : après la carte principale');
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

test('MGMT T3 valider — le bloc entre en préliminaires, jamais dans la carte principale', () => {
  const win = newGameWindow();
  enterMgmtBulk(win,104);
  const id = mgmtBulkId(win);
  /* Une place de carte principale est libérée avant le geste (retrait,
     geste réel T2) : la validation ne complète pas la carte et la
     vérification peut la lire, sans que la soirée ne s'ouvre d'elle-même
     (lot 3a §5). */
  win.eval(`mgmtRemoveMain(G.mgmt,4)`);
  assert.equal(win.eval(`G.mgmt.card.main.length`), 4, 'quatre places occupées, une libre');
  win.eval(`CL.mgmtReply('${id}','validate')`);
  assert.equal(win.eval(`G.mgmt.card.prelims.length`), 4, 'quatre combats en préliminaires (§T1 : le bloc est la carte préliminaire)');
  assert.equal(win.eval(`G.mgmt.card.main.length`), 4, 'la carte principale est inchangée — le bloc ne la compose jamais (§T1, §T3)');
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
  assert.equal(win.eval(`G.mgmt.card.main.length`), 5, 'la carte principale n\u2019a pas bougé');
  assert.equal(win.eval(`G.mgmt.card.prelims.length`), 0, 'les préliminaires n\u2019ont pas bougé');
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
  assert.equal(win.eval(`G.mgmt.card.main.length`), 5, 'la carte principale reste intacte');
  assert.equal(win.eval(`G.mgmt.card.prelims.length`), 0, 'les préliminaires restent vides : le coût de l\u2019écrasement applique, rien d\u2019office');
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
   en fixture (§T3 : sa composition est le geste du joueur, T2), la
   validation du bloc complète les préliminaires. Carte complète : la
   soirée s'ouvre (lot 3a §5), jamais une nouvelle proposition en bloc. */
test('MGMT T3 carte complète — plus de proposition en bloc, la soirée s\u2019ouvre', () => {
  const win = newGameWindow();
  enterMgmtBulk(win,109);
  const id = mgmtBulkId(win);
  win.eval(`CL.mgmtReply('${id}','validate')`);
  /* La carte complète déclenche la soirée d'elle-même (lot 3a §5) — la
     carte est vidée, Leïla n'a plus rien à proposer. */
  assert.equal(win.eval(`G.screen`), 'mgmt_soiree', 'carte complète : la soirée s\u2019ouvre, pas une nouvelle proposition');
  assert.equal(win.eval(`G.mgmt.lastEvent.fights.length`), 9, 'la soirée a joué les neuf combats');
  win.eval(`CL.mgmtNextCycle()`);
  assert.equal(win.eval(`G.mgmt.pile.filter(a=>a.kind==='leila_bulk').length`), 0, 'au cycle suivant, aucune proposition en bloc');
});

test('MGMT déterminisme — même graine, même bloc', () => {
  const a = newGameWindow(), b = newGameWindow();
  for(const [w,s] of [[a,110],[b,110]]){ enterMgmtBulk(w,s); }
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
      /* §T3 : le bloc attend la carte principale complète — posée en
         fixture pour faire entrer la proposition dans le contrôle. */
      const dispo=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o));
      if(dispo.length>=10){
        for(let i=0;i<5;i++) m.card.main.push({a:dispo[2*i].id,b:dispo[2*i+1].id,cycle:m.cycle,slot:'main'});
        m.pile=[]; m.open=null;
        mgmtClosePile(m);
      }
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
      /* §T3 : la proposition en bloc n'arrive qu'une fois la carte
         principale complète — posée en fixture (composition = T2),
         la proposition de Leïla arrive ensuite, en fin de pile. */
      const dispo=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o));
      if(dispo.length<10) continue;
      mgmtNewPile(m);
      for(let i=0;i<5;i++) m.card.main.push({a:dispo[2*i].id,b:dispo[2*i+1].id,cycle:m.cycle,slot:'main'});
      if(!mgmtRefillBulk(m)) continue;
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

/* §T3 : le bloc validé entre en préliminaires — l'échange évite aussi les
   paires déjà bookées de la carte en cours. La carte principale est posée
   en fixture d'abord (composition = T2), la proposition de Leïla arrive
   ensuite. */
test('MGMT swap avec carte en prélims — le remplaçant évite aussi les paires bookées', () => {
  const win = newGameWindow();
  const ok = win.eval(`(function(){
    setSeed(121);
    const m=mgmtDefault(); mgmtNewRoster(m);
    const dispo=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o));
    if(dispo.length<10) return 'roster-court';
    mgmtNewPile(m);
    for(let i=0;i<5;i++) m.card.main.push({a:dispo[2*i].id,b:dispo[2*i+1].id,cycle:m.cycle,slot:'main'});
    if(!mgmtRefillBulk(m)) return 'no-bulk';
    const bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open');
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
      /* §T3 : le bloc attend la carte principale complète — posée en
         fixture pour que les dégradés du bloc passent le contrôle. */
      const dispo=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o));
      if(dispo.length>=10){
        for(let i=0;i<5;i++) m.card.main.push({a:dispo[2*i].id,b:dispo[2*i+1].id,cycle:m.cycle,slot:'main'});
        m.pile=[]; m.open=null;
        mgmtClosePile(m);
      }
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

/* ==== [ANCRE: MGMT_LOT2_T3_TESTS] — Lot 2 T3 Leïla et les préliminaires
   (docs/LOT-2-CARTE-PRINCIPALE.md §T3 ; LOT-3B §2, décision d'Anthony du
   15/09/2026). Tests dirigés du contrat : la proposition en bloc n'arrive
   qu'une fois la carte principale complète (déclenchée par mgmtBookMain à
   la cinquième place et par le refill du §5) ; les paires des prélims se
   choisissent hors carte principale — même catégorie, rangs proches
   (MGMT_RANK_GAP sur mgmtDivisionRank), repos (pas de combattant de la
   soirée précédente, sauf assoupli), priorité aux plus inactifs, pas de
   revanche immédiate de la soirée précédente. C1 : accepter une demande
   de Leïla booke dans la carte principale ; carte pleine, la réponse
   n'existe plus (charte R4). ==== */

test('MGMT T3 déclencheur — la proposition arrive à la cinquième place posée, jamais avant', () => {
  const win = newGameWindow();
  enterMgmt(win,410);
  /* Quatre places posées (geste T2) : Leïla n'a encore rien à proposer. */
  win.eval(`(function(){
    for(let k=0;k<4;k++){
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
  assert.equal(win.eval(`G.mgmt.card.main.length`), 4, 'quatre places occupées');
  assert.equal(win.eval(`G.mgmt.pile.filter(a=>a.kind==='leila_bulk').length`), 0, 'carte incomplète : rien à proposer (§T3)');
  /* La cinquième place : la proposition de Leïla arrive, en fin de pile. */
  win.eval(`(function(){
    const m=G.mgmt, rows=mgmtCartRows(m);
    for(const f of rows){
      if(!mgmtSelectable(m,f,null)) continue;
      const b=rows.find(x=>x.id!==f.id&&x.div===f.div&&mgmtSelectable(m,x,f.id));
      if(b){ mgmtBookMain(m,f.id,b.id); break; }
    }
  })()`);
  assert.equal(win.eval(`G.mgmt.card.main.length`), 5, 'cinquième place posée');
  const bulk = JSON.parse(win.eval(`JSON.stringify((()=>{ const b=G.mgmt.pile.find(a=>a.kind==='leila_bulk'); return b?{status:b.status,fights:b.fights.length}:null; })())`));
  assert.ok(bulk, 'la proposition de Leïla arrive à la cinquième place posée (§T3)');
  assert.equal(bulk.status, 'open', 'proposition ouverte');
  assert.equal(bulk.fights, 4, 'quatre préliminaires proposés');
  assert.equal(win.eval(`G.mgmt.pile[G.mgmt.pile.length-1].kind`), 'leila_bulk', 'en fin de pile, après les autres affaires (§T3)');
});

test('MGMT T3 hors carte — aucun combattant de la carte principale ne se retrouve dans les préliminaires', () => {
  const win = newGameWindow();
  const bad = win.eval(`(function(){
    let bad=0;
    for(let s=1;s<=60;s++){
      setSeed(s+7000);
      const m=mgmtDefault(); mgmtNewRoster(m);
      /* §T3 : la carte principale d'abord (fixture), la proposition de
         Leïla ensuite — construite avec ce qui reste. */
      const dispo=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o));
      if(dispo.length<10) continue;
      mgmtNewPile(m);
      for(let i=0;i<5;i++) m.card.main.push({a:dispo[2*i].id,b:dispo[2*i+1].id,cycle:m.cycle,slot:'main'});
      if(!mgmtRefillBulk(m)) continue;
      const bulk=m.pile.find(a=>a.kind==='leila_bulk');
      const enCarte=new Set(mgmtCardFights(m).flatMap(f=>[f.a,f.b]));
      for(const f of bulk.fights){ if(enCarte.has(f.a)||enCarte.has(f.b)) bad++; }
    }
    return bad;
  })()`);
  assert.equal(bad, 0, '60 blocs : aucun combattant de la carte principale dans les préliminaires');
});

test('MGMT T3 rangs proches — au-delà de MGMT_RANK_GAP, la paire est bâclée', () => {
  const win = newGameWindow();
  const r = win.eval(`(function(){
    const mk=(id,first,W,L)=>({id:id,name:first+' Test',first:first,last:'Test',W:W,L:L,D:0,age:27,div:'H-light',divName:'Poids léger',org:'Split',level:1,raison:null,interactions:0});
    const cle=p=>p?[p.a.id,p.b.id].sort().join('|'):null;
    const m=mgmtDefault();
    /* Une catégorie à six rangs : #1 (20-0) … #6 (0-20). Les prénoms mis
       à part (used) laissent exactement la paire voulue au tirage. */
    m.roster=[mk('g1','Gaston',20,0),mk('g2','Gérard',18,1),mk('g3','Gilbert',16,2),mk('g4','Gustave',14,3),mk('g5','Gaspard',4,10),mk('g6','Gauthier',0,20)];
    const except=(...ids)=>new Set(m.roster.filter(o=>!ids.includes(o.id)).map(o=>o.first));
    /* #1 contre #2 : rangs voisins, paire soignée. */
    const voisins=mgmtPickBulkPair(m,except('g1','g2'),new Set(),null,0,{total:0,streak:0},false);
    /* #1 contre #6 : écart 5 > MGMT_RANK_GAP — la paire est bâclée. */
    const etales=mgmtPickBulkPair(m,except('g1','g6'),new Set(),null,0,{total:0,streak:0},false);
    return JSON.stringify({voisins:cle(voisins),voisinsSloppy:voisins&&voisins.sloppy,etales:cle(etales),etalesSloppy:etales&&etales.sloppy});
  })()`);
  const s = JSON.parse(r);
  assert.equal(s.voisins, 'g1|g2', 'rangs voisins : la paire se pose');
  assert.equal(s.voisinsSloppy, false, 'rangs proches : la paire n\u2019est pas bâclée');
  assert.equal(s.etales, 'g1|g6', 'rangs étalés : le repli propose bien la paire restante');
  assert.equal(s.etalesSloppy, true, 'au-delà de MGMT_RANK_GAP, la paire est bâclée (§T3)');
});

test('MGMT T3 repos — pas de combattant de la soirée précédente, sauf en mode assoupli', () => {
  const win = newGameWindow();
  const r = win.eval(`(function(){
    const mk=(id,first,extra)=>Object.assign({id:id,name:first+' Test',first:first,last:'Test',W:9,L:7,D:0,age:27,div:'H-light',divName:'Poids léger',org:'Split',level:1,raison:null,interactions:0},extra||{});
    const m=mgmtDefault();
    m.cycle=3;
    /* Quatre combattants, tous de la soirée précédente (cycle 2) —
       aucun reposé : en strict, la paire est impossible. */
    m.roster=[mk('f1','Gabin',{lastCycle:2}),mk('f2','Hugo',{lastCycle:2}),mk('f3','Ivan',{lastCycle:2}),mk('f4','Jules',{lastCycle:2})];
    const strict=mgmtPickBulkPair(m,new Set(),new Set(),null,0,{total:0,streak:0},false);
    const assoupli=mgmtPickBulkPair(m,new Set(),new Set(),null,0,{total:0,streak:0},true);
    return JSON.stringify({strict:!!strict,assoupli:assoupli?[assoupli.a.id,assoupli.b.id].sort().join('|'):null,fatigués:assoupli?[assoupli.a.lastCycle,assoupli.b.lastCycle]:null});
  })()`);
  const s = JSON.parse(r);
  assert.equal(s.strict, false, 'mode strict : tous fatigués, aucune paire (§T3 : repos)');
  assert.ok(s.assoupli, 'mode assoupli : les mêmes combattants redeviennent candidats (§T3)');
  assert.deepEqual(s.fatigués, [2,2], 'la paire assouplie porte bien des combattants de la soirée précédente');
});

test('MGMT T3 revanche — pas de reprise d\u2019un combat de la soirée précédente', () => {
  const win = newGameWindow();
  const r = win.eval(`(function(){
    const mk=(id,first)=>({id:id,name:first+' Test',first:first,last:'Test',W:9,L:7,D:0,age:27,div:'H-light',divName:'Poids léger',org:'Split',level:1,raison:null,interactions:0});
    const m=mgmtDefault();
    m.cycle=2;
    /* La soirée précédente : Alain contre Bruno (fixture m.lastEvent). */
    m.lastEvent={cycle:1,fights:[{a:'a',b:'b',winner:'A',family:'ko',round:2}],touched:[]};
    m.roster=[mk('a','Alain'),mk('b','Bruno'),mk('c','César'),mk('d','Dorian')];
    const picks=[];
    for(let i=0;i<2;i++){
      const p=mgmtPickBulkPair(m,new Set(),new Set(),null,0,{total:0,streak:0},i===1);
      picks.push(p?[p.a.id,p.b.id].sort().join('|'):null);
    }
    return JSON.stringify(picks);
  })()`);
  const s = JSON.parse(r);
  for(const [i,cle] of s.entries()){
    assert.ok(cle!=='a|b', `pas de revanche immédiate (${i===0?'strict':'assoupli'}) — §T3`);
  }
});

test('MGMT T3 priorité — les combattants inactifs depuis le plus longtemps sortent d\u2019abord', () => {
  const win = newGameWindow();
  const r = win.eval(`(function(){
    const mk=(id,first,lc)=>Object.assign({id:id,name:first+' Test',first:first,last:'Test',W:9,L:7,D:0,age:27,div:'H-light',divName:'Poids léger',org:'Split',level:1,raison:null,interactions:0},lc===undefined?{}:{lastCycle:lc});
    const m=mgmtDefault(); m.cycle=5;
    /* Deux jamais combattus (les plus en attente), deux inactifs depuis
       le cycle 1, deux depuis le cycle 3 : les paliers se lisent dans
       l'ordre des tirages. */
    m.roster=[mk('x1','Xavier'),mk('x2','Yannick'),mk('v1','Vincent',1),mk('v2','Victor',1),mk('w1','Walter',3),mk('w2','Wilfried',3)];
    const used=new Set(), seen=new Set();
    const picks=[];
    for(let i=0;i<3;i++){
      const p=mgmtPickBulkPair(m,used,seen,null,0,{total:0,streak:0},false);
      if(!p) break;
      picks.push([p.a.id,p.b.id].sort().join('|'));
      used.add(p.a.first); used.add(p.b.first);
      seen.add([p.a.id,p.b.id].sort().join('|'));
    }
    return JSON.stringify(picks);
  })()`);
  const s = JSON.parse(r);
  assert.deepEqual(s, ['x1|x2','v1|v2','w1|w2'], 'priorité à la plus longue inactivité, palier par palier (§T3)');
});

test('MGMT T3 C1 — accepter booke dans la carte principale, carte pleine, la réponse disparaît', () => {
  const win = newGameWindow();
  enterMgmt(win,44);
  /* La pile d’entrée est vidée d’abord : le test pose ses propres
     affaires (C1), paires posables (même catégorie). */
  win.eval(`(function(){ let g=0; while(mgmtOpenCount(G.mgmt)>0&&g<40){ g++; const a=G.mgmt.pile.find(x=>x.status==='open'); CL.mgmtReply(a.id,a.exchange==='leila_propose'?'refuse':MGMT_EXCHANGES[a.exchange].replies[0].id); } })()`);
  /* Une affaire posable (même catégorie) pour figer le geste réel. */
  win.eval(`(function(){
    const m=G.mgmt;
    m.pile=[]; m.open=null;
    const byDiv={};
    for(const o of m.roster){ if(!mgmtAvailable(m,o)) continue; (byDiv[o.div]=byDiv[o.div]||[]).push(o); }
    const d=allDivisions().map(x=>byDiv[x.id]||[]).find(p=>p.length>=4);
    if(!d) throw new Error('fixture : pas assez de combattants');
    m.pile.push({id:'c1',kind:'leila_propose',exchange:'leila_propose',speaker:'leila',a:d[0].id,b:d[1].id,status:'open',decision:null,title:'t'});
    window.__paire=[d[0].id,d[1].id];
  })()`);
  win.eval(`CL.mgmtOpen('c1')`);
  assert.equal(win.eval(`mgmtAcceptable(G.mgmt,G.mgmt.pile.find(a=>a.id==='c1'))`), true, 'paire posable, emplacement libre : accepter existe');
  win.eval(`CL.mgmtReply('c1','accept')`);
  const f = JSON.parse(win.eval(`JSON.stringify(G.mgmt.card.main[0])`));
  assert.deepEqual([f.a,f.b], JSON.parse(win.eval(`JSON.stringify(window.__paire)`)), 'accepter booke le combat proposé (C1)');
  assert.equal(f.slot, 'main', 'slot main');
  assert.equal(win.eval(`G.mgmt.pile.find(a=>a.id==='c1').decision`), 'accepted');
  /* Une nouvelle affaire (posable) arrive pendant que la carte se remplit. */
  win.eval(`(function(){
    const m=G.mgmt;
    const byDiv={};
    for(const o of m.roster){ if(!mgmtAvailable(m,o)||mgmtEngaged(m,o)) continue; (byDiv[o.div]=byDiv[o.div]||[]).push(o); }
    const d=allDivisions().map(x=>byDiv[x.id]||[]).find(p=>p.length>=2);
    if(!d) throw new Error('fixture : pas assez de combattants');
    m.pile.push({id:'c2',kind:'leila_propose',exchange:'leila_propose',speaker:'leila',a:d[0].id,b:d[1].id,status:'open',decision:null,title:'t'});
    window.__c2=[d[0].id,d[1].id];
  })()`);
  /* La carte se remplit au geste T2, sans toucher aux combattants de c2. */
  win.eval(`(function(){
    const m=G.mgmt, c2=G.mgmt.pile.find(a=>a.id==='c2');
    const dispo=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o)&&o.id!==c2.a&&o.id!==c2.b);
    if(dispo.length<8) throw new Error('fixture : pas assez de combattants');
    for(let i=0;i<4;i++) m.card.main.push({a:dispo[2*i].id,b:dispo[2*i+1].id,cycle:m.cycle,slot:'main'});
  })()`);
  assert.equal(win.eval(`G.mgmt.card.main.length`), 5, 'carte pleine');
  win.eval(`CL.mgmtOpen('c2')`);
  const reps = JSON.parse(win.eval(`JSON.stringify(mgmtVisibleReplies(G.mgmt,G.mgmt.pile.find(a=>a.id==='c2')).map(r=>r.action))`));
  assert.ok(!reps.includes('accept'), 'carte pleine : accepter n\u2019est pas proposée (charte R4)');
  assert.ok(reps.includes('refuse')&&reps.includes('__ignore'), 'refuser et ignorer restent');
  assert.equal(win.eval(`mgmtDecide(G.mgmt,'c2','accept')`), false, 'la garde double refuse aussi la décision directe');
  assert.equal(win.eval(`G.mgmt.pile.find(a=>a.id==='c2').status`), 'open', 'l\u2019affaire reste ouverte');
  assert.equal(win.eval(`G.mgmt.card.main.length`), 5, 'aucun combat posé par la décision refusée');
});

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

/* ==== [ANCRE: MGMT_LOT2_T2_TESTS] — Lot 2 T2 le joueur compose sa carte
   principale (docs/LOT-2-CARTE-PRINCIPALE.md §T2, geste LOT-3B §2) : le
   geste à la souris (choisir un combattant disponible, puis son adversaire —
   le combat entre dans le premier emplacement libre, slot:'main') et au
   clavier (flèches + entrée, chiffres 1 à 5, échap). Non sélectionnables :
   suspendus (visibles, avec leur rang), tout combattant déjà engagé sur la
   carte — carte principale comme préliminaires ; retraités médicaux
   absents de la liste. Le retrait d'un combat libère l'emplacement. La
   carte principale ne dépasse jamais 5 combats. Le compteur de carte
   (mgmtCardLabel) s'affiche à nouveau et reflète les deux parties —
   régression réparée : il lisait m.card.fights, disparu à la T1. esc() sur
   tout nom affiché. ==== */

function enterMgmt(win,seed){
  win.eval(`setSeed(${seed}); CL.mgmtEnter();`);
}

/* Roster contrôlé : six légers (quatre disponibles, un suspendu, un
   retraité médical), quatre plumes, deux légers de plus pour la capacité —
   la composition devient déterministe, sans dépendre du tirage du roster.
   Préfixe « x » : jamais de collision avec les identifiants « mg » +
   compteur du roster généré (ni avec ceux des préliminaires de Leïla). */
function ctlRoster(win){
  win.eval(`(function(){
    const m=G.mgmt;
    m.roster=[];
    const mk=(id,first,div,divName,W,L,extra)=>Object.assign({id:id,name:first+' Test',first:first,last:'Test',W:W,L:L,D:0,age:27,div:div,divName:divName,org:'Split',level:1,raison:null,interactions:0},extra||{});
    m.roster.push(mk('x1','Alain','H-light','Poids léger',10,2));
    m.roster.push(mk('x2','Bruno','H-light','Poids léger',8,4));
    m.roster.push(mk('x3','César','H-light','Poids léger',6,6));
    m.roster.push(mk('x4','Dorian','H-light','Poids léger',4,8));
    m.roster.push(mk('x5','Enzo','H-light','Poids léger',2,10,{susp:99}));
    m.roster.push(mk('x6','Farid','H-light','Poids léger',0,12,{retired:'medical'}));
    m.roster.push(mk('x7','Gabin','H-feather','Poids plume',9,1));
    m.roster.push(mk('x8','Hugo','H-feather','Poids plume',7,3));
    m.roster.push(mk('x9','Ivan','H-feather','Poids plume',5,5));
    m.roster.push(mk('x10','Jules','H-feather','Poids plume',3,7));
    m.roster.push(mk('x11','Karl','H-light','Poids léger',5,0));
    m.roster.push(mk('x12','Luc','H-light','Poids léger',3,2));
  })()`);
}

/* Une paire sélectionnable de la liste contrôlée : les deux premiers
   disponibles de la même catégorie. */
function ctlPair(win){
  return JSON.parse(win.eval(`JSON.stringify((()=>{
    const m=G.mgmt, rows=mgmtCartRows(m);
    const a=rows.find(f=>mgmtSelectable(m,f,null));
    const b=rows.find(f=>f.id!==a.id&&f.div===a.div&&mgmtSelectable(m,f,a.id));
    if(!a||!b) return ['no-a','no-b'];
    return [a.id,b.id];
  })())`));
}

test('MGMT T2 geste — choisir puis adversaire : premier emplacement libre, slot main, dossier compté', () => {
  const win = newGameWindow();
  enterMgmt(win,301);
  ctlRoster(win);
  const [a,b] = ctlPair(win);
  const rosterAvant = win.eval(`JSON.stringify(G.mgmt.roster)`);
  win.eval(`CL.mgmtCarte();`);
  assert.equal(win.eval(`G.screen`), 'mgmt_carte', 'l\u2019écran de composition s\u2019ouvre');
  /* Pur : la liste dérivée ne touche jamais une ligne. */
  win.eval(`mgmtCartRows(G.mgmt)`);
  assert.equal(win.eval(`JSON.stringify(G.mgmt.roster)`), rosterAvant, 'la liste dérivée n\u2019écrit jamais sur une ligne');
  win.eval(`CL.mgmtPick('${a}')`);
  assert.equal(win.eval(`MGMT_CART.pick`), a, 'le premier choix est posé');
  let html = win.document.getElementById('app').innerHTML;
  const divName = win.eval(`mgmtFighterById(G.mgmt,'${a}').divName`);
  assert.ok(html.includes(`Adversaires — ${divName}`), 'la liste se filtre sur la catégorie du choisi');
  assert.ok(!html.includes('Choisissez un combattant, puis son adversaire.'), 'l\u2019invite du geste cède la place aux adversaires');
  win.eval(`CL.mgmtPick('${b}')`);
  const f = JSON.parse(win.eval(`JSON.stringify(G.mgmt.card.main[0])`));
  assert.deepEqual([f.a,f.b], [a,b], 'le combat porte les deux choisis');
  assert.equal(f.slot, 'main', 'slot:\u2019main\u2019 — c\u2019est un combat de carte principale');
  assert.equal(f.cycle, win.eval(`G.mgmt.cycle`), 'posé au cycle courant');
  assert.equal(win.eval(`MGMT_CART.pick`), null, 'le choix est effacé après la pose');
  assert.equal(win.eval(`G.mgmt.card.main.length`), 1, 'premier emplacement libre : la carte était vide');
  const saved = JSON.parse(win.localStorage.getItem('cage-legacy-mgmt'));
  assert.equal(saved.card.main.length, 1, 'le combat posé persiste');
  /* R1 (addendum 1 §5) : le booker compte — un booking est une interaction. */
  for(const id of [a,b]){
    const o = JSON.parse(win.eval(`JSON.stringify(mgmtFighterById(G.mgmt,'${id}'))`));
    assert.ok(o.level>=2&&o.interactions===1&&o.raison!==null, 'booking = dossier : '+id);
  }
  /* Le deuxième combat se pose à la suite, jamais à la place. */
  const [c,d] = ctlPair(win);
  win.eval(`CL.mgmtPick('${c}'); CL.mgmtPick('${d}');`);
  assert.equal(win.eval(`G.mgmt.card.main.length`), 2, 'deuxième emplacement utilisé');
  assert.deepEqual(JSON.parse(win.eval(`JSON.stringify([G.mgmt.card.main[1].a,G.mgmt.card.main[1].b])`)), [c,d], 'append, jamais en tête');
});

test('MGMT T2 non sélectionnables — suspendu visible et muet, engagé muet, retraité médical absent', () => {
  const win = newGameWindow();
  enterMgmt(win,302);
  ctlRoster(win);
  const susp = win.eval(`mgmtFighterById(G.mgmt,'x5').name`);
  const ret = win.eval(`mgmtFighterById(G.mgmt,'x6').name`);
  win.eval(`CL.mgmtCarte(); render();`);
  let html = win.document.getElementById('app').innerHTML;
  assert.ok(html.includes(susp), 'le suspendu reste visible');
  assert.ok(html.includes('suspendu'), 'la suspension se dit en toutes lettres');
  assert.ok(!html.includes(ret), 'le retraité médical est absent de la liste (§T2)');
  /* Le suspendu garde son rang dans sa catégorie : classé malgré sa
     suspension (T1). */
  const rk = win.eval(`mgmtRankLabel(mgmtDivisionRank(G.mgmt,mgmtFighterById(G.mgmt,'x5')))`);
  assert.notEqual(rk, '', 'le suspendu garde un rang');
  /* Déjà engagé en carte principale (posé par le joueur, fixture) : muet. */
  win.eval(`mgmtBookMain(G.mgmt,'x1','x2')`);
  win.eval(`render()`);
  html = win.document.getElementById('app').innerHTML;
  assert.ok(html.includes('en carte'), 'l\u2019engagement se dit en toutes lettres');
  win.eval(`CL.mgmtPick('x1')`);
  assert.equal(win.eval(`MGMT_CART.pick`), null, 'un combattant déjà engagé ne peut pas être sélectionné');
  assert.equal(win.eval(`G.mgmt.card.main.length`), 1, 'aucun combat de plus posé');
  win.eval(`CL.mgmtPick('x5')`);
  assert.equal(win.eval(`MGMT_CART.pick`), null, 'un suspendu ne peut pas être sélectionné');
  assert.equal(win.eval(`G.mgmt.card.main.length`), 1);
  /* Les préliminaires engagent aussi : un combattant des prélims est muet. */
  win.eval(`G.mgmt.card.prelims.push({a:'x7',b:'x8',cycle:1,slot:'prelim'}); render();`);
  win.eval(`CL.mgmtPick('x7')`);
  assert.equal(win.eval(`MGMT_CART.pick`), null, 'engagé en préliminaires : muet aussi');
});

test('MGMT T2 retrait — l\u2019emplacement est libéré, les deux redeviennent sélectionnables, le suivant se pose à la suite', () => {
  const win = newGameWindow();
  enterMgmt(win,303);
  ctlRoster(win);
  win.eval(`CL.mgmtCarte()`);
  const [a,b] = ctlPair(win);
  win.eval(`CL.mgmtPick('${a}'); CL.mgmtPick('${b}');`);
  const [c,d] = ctlPair(win);
  win.eval(`CL.mgmtPick('${c}'); CL.mgmtPick('${d}');`);
  assert.equal(win.eval(`G.mgmt.card.main.length`), 2);
  let html = win.document.getElementById('app').innerHTML;
  assert.ok(html.includes(`CL.mgmtUnbook(0)`), 'le combat posé porte son bouton de retrait');
  win.eval(`CL.mgmtUnbook(0)`);
  assert.equal(win.eval(`G.mgmt.card.main.length`), 1, 'l\u2019emplacement est libéré');
  assert.deepEqual(JSON.parse(win.eval(`JSON.stringify([G.mgmt.card.main[0].a,G.mgmt.card.main[0].b])`)), [c,d], 'les combats restants se tassent');
  for(const id of [a,b]){
    assert.equal(win.eval(`mgmtSelectable(G.mgmt,mgmtFighterById(G.mgmt,'${id}'),null)`), true, `redevient sélectionnable : ${id}`);
  }
  html = win.document.getElementById('app').innerHTML;
  assert.ok(html.includes(`CL.mgmtPick('${a}')`)&&html.includes(`CL.mgmtPick('${b}')`), 'les deux lignes redeviennent cliquables');
  /* Le combat suivant entre dans le premier emplacement libre : à la suite. */
  const [e,f2] = ctlPair(win);
  win.eval(`CL.mgmtPick('${e}'); CL.mgmtPick('${f2}');`);
  assert.equal(win.eval(`G.mgmt.card.main.length`), 2, 'l\u2019emplacement libéré se remplit à son tour');
  assert.deepEqual(JSON.parse(win.eval(`JSON.stringify([G.mgmt.card.main[1].a,G.mgmt.card.main[1].b])`)), [e,f2], 'à la suite, jamais au milieu');
});

test('MGMT T2 capacité — la carte principale ne dépasse jamais 5 combats', () => {
  const win = newGameWindow();
  enterMgmt(win,304);
  ctlRoster(win);
  win.eval(`CL.mgmtCarte()`);
  const n = win.eval(`(function(){
    let booked=0;
    for(let k=0;k<8;k++){
      const m=G.mgmt, rows=mgmtCartRows(m);
      const a=rows.find(f=>mgmtSelectable(m,f,null));
      if(!a) break;
      const b=rows.find(f=>f.id!==a.id&&f.div===a.div&&mgmtSelectable(m,f,a.id));
      if(!b) break;
      if(!mgmtBookMain(m,a.id,b.id)) break;
    }
    return G.mgmt.card.main.length;
  })()`);
  assert.equal(n, 5, 'le roster contrôlé permet de remplir les cinq places');
  const guard = win.eval(`mgmtBookMain(G.mgmt,'x11','x12')`);
  assert.equal(guard, null, 'au-delà de cinq : la pose est refusée');
  assert.equal(win.eval(`G.mgmt.card.main.length`), 5, 'jamais plus de cinq combats');
  /* La liste ne pose plus rien non plus : elle ne sert qu\u2019à consulter. */
  win.eval(`CL.mgmtPick('x11')`);
  assert.equal(win.eval(`MGMT_CART.pick`), null, 'carte complète : aucun premier choix');
  let html = win.document.getElementById('app').innerHTML;
  assert.ok(html.includes('Carte principale complète.'), 'l\u2019état se dit en toutes lettres');
  /* Le clavier ne passe pas non plus : Entrée ne pose rien. */
  win.eval(`MGMT_CART.cursor=0`);
  win.eval(`mgmtKeyCartAct()`);
  assert.equal(win.eval(`G.mgmt.card.main.length`), 5);
});

test('MGMT T2 mgmtBookMain — les gardes : catégorie, disponibilité, engagement, identité', () => {
  const win = newGameWindow();
  freshState(win,311);
  const r = win.eval(`(function(){
    const m=G.mgmt;
    m.cycle=2;
    m.roster=[
      {id:'x1',name:'Alain Test',first:'Alain',last:'Test',W:10,L:2,D:0,age:27,div:'H-light',divName:'Poids léger',org:'Split',level:1,raison:null,interactions:0},
      {id:'x2',name:'Bruno Test',first:'Bruno',last:'Test',W:8,L:4,D:0,age:27,div:'H-light',divName:'Poids léger',org:'Split',level:1,raison:null,interactions:0},
      {id:'x3',name:'César Test',first:'César',last:'Test',W:6,L:6,D:0,age:27,div:'H-light',divName:'Poids léger',org:'Split',level:1,raison:null,interactions:0},
      {id:'x4',name:'Dorian Test',first:'Dorian',last:'Test',W:4,L:8,D:0,age:27,div:'H-light',divName:'Poids léger',org:'Split',level:1,raison:null,interactions:0},
      {id:'x5',name:'Enzo Test',first:'Enzo',last:'Test',W:2,L:10,D:0,age:27,div:'H-light',divName:'Poids léger',org:'Split',level:1,raison:null,interactions:0,susp:5},
      {id:'x6',name:'Farid Test',first:'Farid',last:'Test',W:0,L:12,D:0,age:27,div:'H-light',divName:'Poids léger',org:'Split',level:1,raison:null,interactions:0,retired:'medical'},
      {id:'x7',name:'Gabin Test',first:'Gabin',last:'Test',W:9,L:1,D:0,age:27,div:'H-feather',divName:'Poids plume',org:'Split',level:1,raison:null,interactions:0},
      {id:'x8',name:'Hugo Test',first:'Hugo',last:'Test',W:7,L:3,D:0,age:27,div:'H-feather',divName:'Poids plume',org:'Split',level:1,raison:null,interactions:0},
    ];
    const res={};
    res.cross=!!mgmtBookMain(m,'x1','x7');             /* catégories différentes */
    res.suspect=!!mgmtBookMain(m,'x2','x5');           /* suspendu */
    res.retraite=!!mgmtBookMain(m,'x2','x6');          /* retraité médical */
    res.inconnu=!!mgmtBookMain(m,'x2','inconnu');      /* ligne absente du roster */
    res.memeLigne=!!mgmtBookMain(m,'x2','x2');         /* un homme contre lui-même */
    res.premier=!!mgmtBookMain(m,'x1','x2');           /* la pose légitime */
    res.reengagéA=!!mgmtBookMain(m,'x1','x3');
    res.reengagéB=!!mgmtBookMain(m,'x4','x1');
    /* Les préliminaires engagent aussi. */
    m.card.prelims.push({a:'x3',b:'x4',cycle:1,slot:'prelim'});
    res.prelim=!!mgmtBookMain(m,'x2','x3');
    const fight=mgmtBookMain(m,'x2','x4');             /* légitime */
    res.pose=fight&&fight.slot==='main'&&fight.cycle===2&&fight.a==='x2'&&fight.b==='x4';
    res.deux=mgmtEngaged(m,mgmtFighterById(m,'x2'));
    return JSON.stringify(res);
  })()`);
  const s = JSON.parse(r);
  assert.equal(s.cross, false, 'jamais deux catégories dans un combat du joueur');
  assert.equal(s.suspect, false, 'suspendu refusé');
  assert.equal(s.retraite, false, 'retraité médical refusé');
  assert.equal(s.inconnu, false, 'identifiant hors roster refusé');
  assert.equal(s.memeLigne, false, 'même ligne refusée');
  assert.equal(s.premier, true, 'la pose légitime renvoie le combat');
  assert.equal(s.reengagéA, false, 'déjà engagé en carte principale : refusé');
  assert.equal(s.reengagéB, false, 'déjà engagé : refusé, quel que soit le côté');
  assert.equal(s.prelim, false, 'déjà engagé en préliminaires : refusé');
  assert.equal(s.deux, true, 'mgmtEngaged lit les deux emplacements');
});

test('MGMT T2/T3 compteur — la ligne du bureau montre les deux parties de la carte', () => {
  const win = newGameWindow();
  enterMgmt(win,308);
  let html = win.document.getElementById('app').innerHTML;
  assert.ok(html.includes('Carte principale 0/5 · préliminaires 0/4'), 'le compteur s\u2019affiche à nouveau, les deux parties');
  /* La carte principale se compose à l'écran (contrôlé), jusqu'à 5/5 —
     §T3 : la cinquième place posée fait arriver la proposition de Leïla. */
  win.eval(`CL.mgmtCarte()`);
  win.eval(`(function(){
    for(let k=0;k<6;k++){
      const m=G.mgmt, rows=mgmtCartRows(m);
      const a=rows.find(f=>mgmtSelectable(m,f,null));
      if(!a) break;
      const b=rows.find(f=>f.id!==a.id&&f.div===a.div&&mgmtSelectable(m,f,a.id));
      if(!b) break;
      if(!mgmtBookMain(m,a.id,b.id)) break;
    }
  })()`);
  win.eval(`CL.go('mgmt_bureau'); render();`);
  html = win.document.getElementById('app').innerHTML;
  assert.ok(html.includes('Carte principale 5/5 · préliminaires 0/4'), 'la carte principale complète se lit d\u2019un regard');
  /* §T3 : la proposition de Leïla est dans la pile — les préliminaires
     n'entrent dans la carte qu'à la validation, le compteur le dit. */
  assert.ok(html.includes('Carte — 4 combats'), 'la proposition de Leïla est arrivée après la carte principale');
  win.eval(`CL.mgmtCarte()`);
  html = win.document.getElementById('app').innerHTML;
  assert.ok(html.includes('Carte principale 5/5 · préliminaires 0/4'), 'même compteur sur l\u2019écran de composition');
});

test('MGMT T2 clavier — flèches et entrée composent, chiffre retire, échap revient', () => {
  const win = newGameWindow();
  enterMgmt(win,307);
  ctlRoster(win);
  win.eval(`CL.mgmtCarte()`);
  const key = k => win.eval(`document.dispatchEvent(new KeyboardEvent('keydown',{key:'${k}',bubbles:true}))`);
  const [a,b] = ctlPair(win);
  assert.equal(win.eval(`mgmtCartRows(G.mgmt)[0].id`), a, 'la liste rangée commence par sa première ligne');
  key('Enter');
  assert.equal(win.eval(`MGMT_CART.pick`), a, 'entrée : premier choix posé');
  key('ArrowDown');
  assert.equal(win.eval(`MGMT_CART.cursor`), 1, 'flèche : la ligne suivante');
  key('Enter');
  assert.equal(win.eval(`G.mgmt.card.main.length`), 1, 'entrée : le combat est posé');
  assert.deepEqual(JSON.parse(win.eval(`JSON.stringify([G.mgmt.card.main[0].a,G.mgmt.card.main[0].b,G.mgmt.card.main[0].slot])`)), [a,b,'main']);
  assert.equal(win.eval(`MGMT_CART.pick`), null, 'le choix est effacé après la pose');
  key('1');
  assert.equal(win.eval(`G.mgmt.card.main.length`), 0, 'chiffre 1 : le combat posé est retiré');
  key('ArrowUp');
  assert.equal(win.eval(`MGMT_CART.cursor`), win.eval(`mgmtCartRows(G.mgmt).length-1`), 'rebouclage : la dernière ligne par le haut');
  key('ArrowDown');
  assert.equal(win.eval(`MGMT_CART.cursor`), 0, 'rebouclage : retour en tête');
  key('Escape');
  assert.equal(win.eval(`G.screen`), 'mgmt_bureau', 'échap : retour au bureau');
  assert.equal(win.eval(`MGMT_CART.pick`), null, 'la trace de composition ne survit pas au retour');
});

test('MGMT T2 esc() — un nom hostile de l\u2019écran carte s\u2019affiche échappé partout, jamais injecté', () => {
  const win = newGameWindow();
  enterMgmt(win,309);
  ctlRoster(win);
  /* Le nom hostile porte sur la première ligne de la liste rangée (x7) :
     il traverse la liste, le dossier puis la carte posée. */
  win.eval(`(function(){
    const m=G.mgmt;
    const t=mgmtFighterById(m,'x7');
    t.name='<img src=x onerror=alert(1)>"b';
    t.first='<img src=x onerror=alert(1)>"b';
    t.last='X';
  })()`);
  win.eval(`CL.mgmtCarte(); render();`);
  let html = win.document.getElementById('app').innerHTML;
  assert.ok(!html.includes('<img src=x'), 'le HTML brut ne doit jamais contenir le nom injecté');
  assert.ok(html.includes('&lt;img'), 'le chevron est échappé dans la liste');
  assert.ok(win.document.getElementById('app').textContent.includes('"b'), 'le guillemet s\u2019affiche comme du texte, jamais un attribut');
  const [a,b] = ctlPair(win);
  assert.equal(a, 'x7', 'le nom hostile est la première ligne sélectionnable');
  win.eval(`CL.mgmtPick('${a}');`);
  html = win.document.getElementById('app').innerHTML;
  assert.ok(!html.includes('<img src=x'), 'le dossier ne fuit pas non plus');
  assert.ok(html.includes('&lt;img'), 'le nom hostile apparaît échappé au dossier');
  win.eval(`CL.mgmtPick('${b}');`);
  html = win.document.getElementById('app').innerHTML;
  assert.ok(!html.includes('<img src=x'), 'la carte posée ne fuit pas');
  assert.ok(html.includes('&lt;img'), 'le nom hostile apparaît échappé sur la carte');
});

/* Intégration : l\u2019écran rend le vrai roster généré (40 à 60 noms) sans
   erreur, avec ses rangs dérivés et ses lignes cliquables. */
test('MGMT T2 intégration — l\u2019écran carte rend le roster généré', () => {
  const win = newGameWindow();
  enterMgmt(win,312);
  win.eval(`CL.mgmtCarte(); render();`);
  const html = win.document.getElementById('app').innerHTML;
  const st = JSON.parse(win.eval(`JSON.stringify({
    roster:G.mgmt.roster.length,
    rows:mgmtCartRows(G.mgmt).length,
    slots:(document.getElementById('app').innerHTML.match(/Place libre/g)||[]).length,
    clickable:(document.getElementById('app').innerHTML.match(/CL\\.mgmtPick\\(/g)||[]).length})`));
  assert.ok(st.roster>=40&&st.roster<=60, 'roster réel 40 à 60');
  assert.equal(st.rows, st.roster - win.eval(`G.mgmt.roster.filter(o=>o.retired==='medical').length`), 'seuls les retraités médicaux sont absents');
  assert.equal(st.slots, 5, 'cinq emplacements de carte principale');
  assert.equal(st.clickable, st.rows, 'roster frais : tout le monde est sélectionnable (ni suspendu, ni engagé)');
});
/* ==== [FIN ANCRE] ==== */