"use strict";
/* CAGE LEGACY — tests/mgmtCard.test.js
   ============================================================================
   LOT 2 LA SOUS-CARTE — carte en construction (4 places), proposition en
   bloc, trois réponses (valider, échanger, écraser), coût de l'écrasement
   (addendum §12 : qualité dégradée, avertissements éteints, jamais
   annoncés), mémoire des écrasements. Six emplacements vides et marqués,
   aucun texte rédigé, aucune réplique existante réutilisée.
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

/* ==== [ANCRE: MGMT_LOT2_TESTS] — Lot 2 la sous-carte. ==== */
test('MGMT carte — 4 places, une seule proposition en bloc par cycle, carte vide', () => {
  const win = newGameWindow();
  enterMgmtBulk(win,101);
  assert.equal(win.eval(`G.mgmt.card.size`), 4, 'quatre places, validé lot 2');
  assert.equal(win.eval(`G.mgmt.card.fights.length`), 0, 'carte vide au départ');
  assert.equal(win.eval(`G.mgmt.pile.filter(a=>a.kind==='leila_bulk').length`), 1, 'une seule affaire en bloc');
  const n = win.eval(`G.mgmt.pile.find(a=>a.kind==='leila_bulk').fights.length`);
  assert.equal(n, 4, 'le bloc propose tout l\u2019ensemble');
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

test('MGMT valider — toute la carte entre en construction', () => {
  const win = newGameWindow();
  enterMgmtBulk(win,104);
  const id = mgmtBulkId(win);
  win.eval(`CL.mgmtReply('${id}','validate')`);
  assert.equal(win.eval(`G.mgmt.card.fights.length`), 4, 'quatre combats en carte');
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
  const html = win.document.getElementById('app').innerHTML;
  assert.ok(html.includes('Carte 4/4'), 'carte visible sur la ligne du cycle, compacte');
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
  assert.equal(win.eval(`G.mgmt.card.fights.length`), 0, 'la carte n\u2019a pas bougé');
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
  assert.equal(win.eval(`G.mgmt.card.fights.length`), 0, 'carte intacte');
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

test('MGMT carte pleine — plus de proposition en bloc', () => {
  const win = newGameWindow();
  enterMgmtBulk(win,109);
  const id = mgmtBulkId(win);
  win.eval(`CL.mgmtReply('${id}','validate')`);
  assert.equal(win.eval(`G.mgmt.card.fights.length`), 4, 'carte pleine');
  win.eval(`CL.mgmtNextCycle()`);
  assert.equal(win.eval(`G.mgmt.pile.filter(a=>a.kind==='leila_bulk').length`), 0, 'carte pleine : pas de nouvelle proposition');
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
        const keys=new Set(m.card.fights.map(f=>[f.a,f.b].sort().join('|')));
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

test('MGMT swap sous carte pleine — le remplaçant évite aussi les paires bookées', () => {
  const win = newGameWindow();
  const ok = win.eval(`(function(){
    setSeed(121);
    const m=mgmtDefault(); mgmtNewRoster(m); mgmtNewPile(m);
    const bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open');
    if(!bulk) return 'no-bulk';
    m.card.fights=bulk.fights.slice(0,2).map(f=>({a:f.a,b:f.b,cycle:1}));
    const old0=[bulk.fights[0].a,bulk.fights[0].b].sort().join('|');
    if(!mgmtSwapFight(m,bulk.id)) return 'no-swap';
    const now0=[bulk.fights[0].a,bulk.fights[0].b].sort().join('|');
    if(now0===old0) return 'same';
    const keys=new Set(m.card.fights.map(f=>[f.a,f.b].sort().join('|')));
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
  assert.equal(win.eval(`validateMgmt(Object.assign(mgmtDefault(),{v:MGMT_SAVE_VERSION,card:{size:4,fights:[{a:'p',b:'q',cycle:2}]},leila:{crushes:[2,3]}}))`), true, 'carte et historique bien formés acceptés');
  assert.equal(win.eval(`validateMgmt(Object.assign(mgmtDefault(),{v:MGMT_SAVE_VERSION,card:{size:0,fights:[]}}))`), false, 'taille de carte impossible rejetée');
  assert.equal(win.eval(`validateMgmt(Object.assign(mgmtDefault(),{v:MGMT_SAVE_VERSION,leila:{crushes:[-1]}}))`), false, 'horodatage négatif rejeté');
});
/* ==== [FIN ANCRE] ==== */