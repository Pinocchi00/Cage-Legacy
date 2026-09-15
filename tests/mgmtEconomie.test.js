"use strict";
/* CAGE LEGACY — tests/mgmtEconomie.test.js
   ============================================================================
   LOT 3B T1 — L'ARGENT DE L'ORGANISATION (docs/LOT-3B-CONTRAT.md §3 T1,
   décisions QO-5 et QO-7 §1) : un seul solde (le découvert est T sous zéro),
   recette nette R = billetterie + droits du diffuseur − cachets, plafond de
   découvert aux trois paliers, cachets dérivés de la ligne (jamais stockés,
   règle du bureau CDC §3), audience en écrans entiers (décidée surtout
   avant la soirée) et sa référence D4, droits du diffuseur au prorata des
   combats joués sur la carte contractuelle (addendum §16), migration
   v3 → v4 sans perte et anti-rechargement de la finance. Aucune réplique,
   aucun affichage dans cette tranche : la trésorerie s'affichera à la T6
   (CDC §7) et la réplique E1 du patron — texte d'auteur écrit (LOT-3B §E1)
   — sera branchée à une tranche ultérieure.
   ============================================================================ */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

/* Soirées réelles : roster généré, proposition en bloc de Leïla validée,
   carte complète (4 combats — prélims tant que la T2 n'a pas posé la
   structure {main,prelims}), mgmtRunEvent. tBefore force la trésorerie
   avant la première soirée (test du découvert). */
function runEvenings(win,seed,n,tBefore){
  const force=tBefore===undefined?'':`if(e===0) m.treasury=${tBefore};`;
  return JSON.parse(win.eval(`(function(){
    setSeed(${seed});
    const m=mgmtDefault(); mgmtNewRoster(m);
    for(let e=0;e<${n};e++){
      let bulk=null;
      for(let c=0;c<30&&!bulk;c++){ mgmtNewPile(m); bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open'); }
      if(!bulk||!mgmtDecide(m,bulk.id,'validate')) return 'null';
      ${force}
      if(!mgmtRunEvent(m)) return 'null';
    }
    return JSON.stringify(m);
  })()`));
}

/* Une seule soirée, avec l'attrait et les cachets mesurés sur la carte
   d'avant le calcul — pour vérifier que la finance stockée est bien celle
   de la carte d'avant la soirée. */
function oneEveningMeasured(win,seed,tBefore){
  const force=tBefore===undefined?'':`m.treasury=${tBefore};`;
  return JSON.parse(win.eval(`(function(){
    setSeed(${seed});
    const m=mgmtDefault(); mgmtNewRoster(m);
    let bulk=null;
    for(let c=0;c<30&&!bulk;c++){ mgmtNewPile(m); bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open'); }
    if(!bulk||!mgmtDecide(m,bulk.id,'validate')) return 'null';
    ${force}
    const slotted=m.card.fights.map(f=>({a:f.a,b:f.b,slot:'prelim'}));
    const attraction=mgmtCardAttraction(m,slotted);
    const purses=mgmtPurses(m,slotted);
    const ev=mgmtRunEvent(m);
    if(!ev) return 'null';
    return JSON.stringify({attraction,purses,finance:ev.finance,e1:ev.e1,
      treasury:m.treasury,recettes:m.recettes,audiences:m.audiences,eventsPlayed:m.eventsPlayed});
  })()`));
}

test('MGMT économie T1 — un seul solde au premier jour, historiques vides', () => {
  const win = newGameWindow();
  const s = JSON.parse(win.eval(`JSON.stringify((function(){ const m=mgmtDefault();
    return {v:m.v,treasury:m.treasury,recettes:m.recettes,audiences:m.audiences,eventsPlayed:m.eventsPlayed}; })())`));
  assert.equal(s.v, win.eval(`MGMT_SAVE_VERSION`), "l'état courant porte la version");
  assert.equal(s.treasury, win.eval(`MGMT_TREASURY_START`), 'trésorerie au premier jour');
  assert.ok(Number.isSafeInteger(s.treasury)&&s.treasury>0, 'la trésorerie est un entier k$ positif');
  assert.deepEqual(s.recettes, [], 'aucune recette avant la première soirée');
  assert.deepEqual(s.audiences, [], 'aucune audience avant la première soirée');
  assert.equal(s.eventsPlayed, 0, 'aucune soirée jouée');
  assert.equal(win.eval(`mgmtCanAfford({},10)`), false, "sans trésorerie dans l'état, rien n'est payable (garde)");
});

test('MGMT économie T1 — la soirée calcule revenus, cachets, audience et R en une fois', () => {
  const win = newGameWindow();
  const s = runEvenings(win,80,1);
  assert.ok(s, 'une soirée complète a été jouée');
  assert.equal(s.eventsPlayed, 1, 'le compte de soirées avance');
  assert.deepEqual(s.recettes, [s.lastEvent.finance.recette], 'la recette est gardée');
  assert.deepEqual(s.audiences, [s.lastEvent.finance.audience], "l'audience est gardée pour la référence D4");
  assert.equal(s.treasury, win.eval(`MGMT_TREASURY_START`)+s.lastEvent.finance.recette,
    'un seul solde : T ← T + R');
  const f = s.lastEvent.finance;
  for(const k of ['attraction','spectacle','audience','ticketing','tv','purses','recette']){
    assert.ok(k in f, `la finance stockée porte ${k}`);
  }
  assert.equal(f.recette, f.ticketing+f.tv-f.purses, 'R = revenus − cachets, peut être négative');
  assert.ok(f.audience>=0&&Number.isSafeInteger(f.audience), 'audience entière');
  assert.ok(f.spectacle>=0&&f.spectacle<=1, 'spectacle : part de finitions, 0..1');
  assert.ok(f.attraction>0, 'une carte complète a un attrait positif');
  assert.equal(typeof s.lastEvent.e1, 'boolean', 'le flag E1 du patron est un booléen');
});

test('MGMT économie T1 — l\u2019attrait et les cachets sont ceux de la carte d\u2019avant la soirée', () => {
  const win = newGameWindow();
  const s = oneEveningMeasured(win,81);
  assert.ok(s, 'une soirée réelle a été jouée');
  assert.equal(s.finance.attraction, Math.round(s.attraction*1000)/1000,
    "l'attrait stocké est l'attrait de la carte d'avant combat");
  assert.equal(s.finance.purses, s.purses, 'les cachets stockés sont ceux payés d\u2019avance');
});

test('MGMT économie T1 — plafond de découvert : trois paliers (QO-5)', () => {
  const win = newGameWindow();
  assert.equal(win.eval(`mgmtOverdraftCap(mgmtDefault())`), 0,
    '0 soirée : plancher fixe, aucun découvert possible');
  assert.equal(win.eval(`(function(){ const m=mgmtDefault(); m.recettes=[120]; m.eventsPlayed=1; return mgmtOverdraftCap(m); })()`), 120,
    '1 soirée : P = max(0, R₁)');
  assert.equal(win.eval(`(function(){ const m=mgmtDefault(); m.recettes=[120,90]; m.eventsPlayed=2; return mgmtOverdraftCap(m); })()`), 105,
    '2 soirées : moyenne arrondie des deux dernières (R₂=90, R₁=120)');
  assert.equal(win.eval(`(function(){ const m=mgmtDefault(); m.recettes=[120,-40]; m.eventsPlayed=2; return mgmtOverdraftCap(m); })()`), 40,
    'exemple QO-5 : R₁=−40, R₂=120 → P=40');
  assert.equal(win.eval(`(function(){ const m=mgmtDefault(); m.recettes=[120,-40]; m.eventsPlayed=5; return mgmtOverdraftCap(m); })()`), 40,
    'au-delà de deux soirées : seules les deux dernières recettes comptent');
});

test('MGMT économie T1 — le plafond n\u2019est jamais négatif', () => {
  const win = newGameWindow();
  assert.equal(win.eval(`(function(){ const m=mgmtDefault(); m.recettes=[-40]; m.eventsPlayed=1; return mgmtOverdraftCap(m); })()`), 0,
    'une seule soirée perdante : aucun crédit');
  assert.equal(win.eval(`(function(){ const m=mgmtDefault(); m.recettes=[-40,-60]; m.eventsPlayed=2; return mgmtOverdraftCap(m); })()`), 0,
    'deux soirées perdantes : le plancher à zéro tient');
});

test('MGMT économie T1 — E1 seulement si une dette a été déduite', () => {
  const win = newGameWindow();
  const s = JSON.parse(win.eval(`(function(){
    const out={dette:[],riche:[]};
    for(let i=0;i<40;i++){
      /* Même graine pour les deux états : même roster, même carte, mêmes
         combats — seule la trésorerie d'avant soirée diffère. */
      setSeed(700+i);
      const a=(function(){
        const m=mgmtDefault(); mgmtNewRoster(m);
        let bulk=null;
        for(let c=0;c<30&&!bulk;c++){ mgmtNewPile(m); bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open'); }
        if(!bulk||!mgmtDecide(m,bulk.id,'validate')) return null;
        m.treasury=-70;
        return mgmtRunEvent(m);
      })();
      setSeed(700+i);
      const b=(function(){
        const m=mgmtDefault(); mgmtNewRoster(m);
        let bulk=null;
        for(let c=0;c<30&&!bulk;c++){ mgmtNewPile(m); bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open'); }
        if(!bulk||!mgmtDecide(m,bulk.id,'validate')) return null;
        m.treasury=500;
        return mgmtRunEvent(m);
      })();
      if(!a||!b) continue;
      out.dette.push({R:a.finance.recette,e1:a.e1});
      out.riche.push({R:b.finance.recette,e1:b.e1});
    }
    return JSON.stringify(out);
  })()`));
  assert.ok(s.dette.length>=20, 'assez de soirées pour trancher');
  for(const x of s.dette){
    assert.equal(x.e1, x.R>0, 'trésorerie négative : E1 si et seulement si R > 0');
  }
  for(let i=0;i<s.riche.length;i++){
    assert.equal(s.riche[i].R, s.dette[i].R, 'même graine, même recette');
    assert.equal(s.riche[i].e1, false, 'aucune dette déduite : pas d\u2019E1, même avec R > 0');
  }
});

test('MGMT économie T1 — migration 3 → 4 sans perte, une v1 reste refusée', () => {
  const win = newGameWindow();
  const v3 = {org:'Split',v:3,cycle:2,seq:5,
    roster:[{id:'mg1',name:'A Boxeur',first:'A',last:'Boxeur',W:5,L:2,D:0,age:25,div:'H-light',divName:'Poids léger',org:'Split',level:1,raison:null,interactions:0}],
    pile:[],facts:[{c:1,k:'booked',a:'mg1',b:'mg1'}],open:null,shortfall:false,
    card:{size:4,fights:[{a:'mg1',b:'mg1',cycle:2}]},leila:{crushes:[1]},lastEvent:null};
  const mig = JSON.parse(win.eval(`JSON.stringify(mgmtMigrate(JSON.parse(JSON.stringify(${JSON.stringify(v3)}))))`));
  assert.equal(mig.v, 4, 'tampon v4');
  assert.equal(mig.treasury, win.eval(`MGMT_TREASURY_START`), 'trésorerie au premier jour');
  assert.deepEqual(mig.recettes, []);
  assert.deepEqual(mig.audiences, []);
  assert.equal(mig.eventsPlayed, 0);
  assert.equal(mig.roster.length, 1, 'roster intact');
  assert.equal(mig.card.fights.length, 1, 'carte intacte');
  assert.equal(mig.leila.crushes.length, 1, 'mémoire intacte');
  assert.equal(mig.facts.length, 1, 'faits intacts');
  assert.equal(win.eval(`validateMgmt(${JSON.stringify(mig)})`), true, 'la v3 migrée passe la porte v4');
  /* La même v3 se charge depuis le stockage dédié. */
  win.localStorage.setItem('cage-legacy-mgmt', JSON.stringify(v3));
  win.eval(`G={theme:'dark'}; loadMgmt();`);
  assert.equal(win.eval(`G.mgmt&&G.mgmt.v`), 4, 'une v3 se charge');
  assert.equal(win.eval(`G.mgmt.treasury`), win.eval(`MGMT_TREASURY_START`), 'champs d\u2019argent par défaut au chargement');
  /* Une v2 migre séquentiellement 2 → 3 → 4. */
  const v2 = {org:'Split',v:2,cycle:1,seq:2,roster:[],pile:[],facts:[],open:null,shortfall:false,
    card:{size:4,fights:[]},leila:{crushes:[]},lastEvent:null};
  const mig2 = JSON.parse(win.eval(`JSON.stringify(mgmtMigrate(JSON.parse(JSON.stringify(${JSON.stringify(v2)}))))`));
  assert.equal(mig2.v, 4, 'migration séquentielle 2 → 3 → 4');
  assert.equal(mig2.treasury, win.eval(`MGMT_TREASURY_START`));
  assert.equal(win.eval(`validateMgmt(${JSON.stringify(mig2)})`), true, 'la v2 migrée passe la porte v4');
  /* Une v1 reste refusée, comme avant. */
  const v1 = {org:'Split',cycle:3,seq:9,roster:[],pile:[],facts:[],open:null,shortfall:false};
  assert.equal(win.eval(`mgmtMigrate(JSON.parse(JSON.stringify(${JSON.stringify(v1)})))`), null, 'v1 sans version : refusée');
  /* Une v4 incomplète ne passe pas la porte. */
  assert.equal(win.eval(`(function(){ const m=mgmtDefault(); delete m.treasury; return validateMgmt(m); })()`), false,
    'v4 sans trésorerie rejetée');
  assert.equal(win.eval(`(function(){ const m=mgmtDefault(); m.recettes=[1,2,3]; return validateMgmt(m); })()`), false,
    'plus de deux recettes rejetées (on garde les deux dernières)');
  assert.equal(win.eval(`(function(){ const m=mgmtDefault(); m.audiences=[-1]; return validateMgmt(m); })()`), false,
    'audience négative rejetée');
  assert.equal(win.eval(`(function(){ const m=mgmtDefault(); m.eventsPlayed='x'; return validateMgmt(m); })()`), false,
    'compte de soirées non entier rejeté');
});

test('MGMT économie T1 — mgmtValidEvent contrôle la finance et E1, tolère une soirée d\u2019avant la v4', () => {
  const win = newGameWindow();
  const base = win.eval(`(function(){ return {cycle:1,fights:[{a:'mg1',b:'mg2',winner:'A',family:'ko',round:2}],touched:[]}; })()`);
  const ok = Object.assign({},base,{finance:{attraction:6.5,spectacle:0.75,audience:10,ticketing:46,tv:50,purses:80,recette:16},e1:false});
  assert.equal(win.eval(`mgmtValidEvent(${JSON.stringify(ok)})`), true, 'finance bien formée acceptée');
  assert.equal(win.eval(`mgmtValidEvent(${JSON.stringify(base)})`), true,
    'une soirée d\u2019avant la v4 (sans finance) reste valide — migration sans perte');
  const bad = f => win.eval(`mgmtValidEvent(${JSON.stringify(Object.assign({},ok,f))})`);
  assert.equal(bad({e1:'oui'}), false, 'E1 non booléenne rejetée');
  assert.equal(bad({finance:Object.assign({},ok.finance,{spectacle:1.5})}), false, 'spectacle > 1 rejeté');
  assert.equal(bad({finance:Object.assign({},ok.finance,{audience:-1})}), false, 'audience négative rejetée');
  assert.equal(bad({finance:Object.assign({},ok.finance,{recette:'x'})}), false, 'recette non entière rejetée');
  assert.equal(bad({finance:Object.assign({},ok.finance,{attraction:'x'})}), false, 'attrait non numérique rejeté');
  assert.equal(bad({finance:'x'}), false, 'finance non objet rejetée');
});

test('MGMT économie T1 — recharger après la soirée ne recompte pas la recette', () => {
  const win = newGameWindow();
  win.eval(`(function(){
    setSeed(80);
    const m=mgmtDefault(); mgmtNewRoster(m);
    let bulk=null;
    for(let c=0;c<30&&!bulk;c++){ mgmtNewPile(m); bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open'); }
    if(!bulk||!mgmtDecide(m,bulk.id,'validate')) throw new Error('pas de proposition en bloc');
    G={mgmt:m};
    if(!mgmtRunEvent(G.mgmt)) throw new Error('soirée non jouée');
  })()`);
  const snap = `JSON.stringify({T:G.mgmt.treasury,r:G.mgmt.recettes,a:G.mgmt.audiences,e:G.mgmt.eventsPlayed,f:G.mgmt.lastEvent.finance,e1:G.mgmt.lastEvent.e1})`;
  const before = JSON.parse(win.eval(snap));
  win.eval(`G.mgmt=null; loadMgmt();`);
  const after = JSON.parse(win.eval(snap));
  assert.deepEqual(after, before, 'recharger ne rejoue ni recette, ni audience, ni trésorerie');
  win.eval(`G.mgmt=null; loadMgmt();`);
  const again = JSON.parse(win.eval(snap));
  assert.deepEqual(again, before, 'deux chargements : rien ne bouge');
});

test('MGMT économie T1 — cachets dérivés de la ligne, main card plus chère, jamais stockés', () => {
  const win = newGameWindow();
  const s = JSON.parse(win.eval(`(function(){
    setSeed(90);
    const m=mgmtDefault(); mgmtNewRoster(m);
    const f=m.roster[0];
    return JSON.stringify({p1:mgmtPurse(f,'prelim'),p2:mgmtPurse(f,'prelim'),pm:mgmtPurse(f,'main'),star:mgmtStar(f)});
  })()`));
  assert.equal(s.p1, s.p2, 'le cachet est pur : même ligne, même cachet');
  assert.ok(s.pm>s.p1, 'un combat de main card rapporte et coûte plus qu\u2019un prélim (poids nommés)');
  assert.ok(s.star>=0&&s.star<=1, 'le nom reste dans 0..1');
  const st = runEvenings(win,91,1);
  assert.ok(st, 'une soirée réelle a été jouée');
  assert.ok(st.roster.every(o=>!('purse' in o)&&!('cachet' in o)),
    'aucun cachet stocké sur une ligne de niveau 1 (règle du bureau, CDC §3)');
});

test('MGMT économie T1 — référence D4 : moyenne des soirées, ou carte complète d\u2019attrait moyen', () => {
  const win = newGameWindow();
  const expected = win.eval(`Math.round(MGMT_AUD_PER_DRAW*MGMT_CARD_SIZE*MGMT_DRAW_AVG*(MGMT_ATTR_MAIN_W+MGMT_ATTR_PRELIM_W)*(MGMT_AUD_BASE+(1-MGMT_AUD_BASE)*MGMT_SPECTACLE_REF))`);
  assert.equal(win.eval(`mgmtAudienceRef(null)`), expected,
    'avant toute soirée : l\u2019audience d\u2019une carte complète (4+4) d\u2019attrait moyen');
  win.eval(`(function(){ const m=mgmtDefault(); m.audiences=[10000,12000]; window.__ref=mgmtAudienceRef(m); })()`);
  assert.equal(win.eval(`window.__ref`), 11000, 'ensuite : la moyenne des soirées précédentes, en écrans entiers');
});

test('MGMT économie T1 — audience décidée surtout avant la soirée, droits au prorata des combats', () => {
  const win = newGameWindow();
  const s = JSON.parse(win.eval(`JSON.stringify({
    pleine:mgmtEventRecette(8,1,100,8),
    sansFinition:mgmtEventRecette(8,0,100,8),
    quatre:mgmtEventRecette(8,1,100,4),
    sept:mgmtEventRecette(8,1,100,7)
  })`));
  const audBase = Math.round(Number(win.eval(`MGMT_AUD_PER_DRAW`))*8*Number(win.eval(`MGMT_AUD_BASE`)));
  assert.ok(audBase>0, 'une soirée sans finition garde une audience non nulle');
  assert.equal(s.sansFinition.audience, audBase, 'sans finition : seule la base d\u2019audience compte');
  assert.ok(s.sansFinition.audience<s.pleine.audience, 'le spectacle observé ajoute au-dessus de la base');
  assert.equal(s.pleine.audience, Math.round(Number(win.eval(`MGMT_AUD_PER_DRAW`))*8),
    'audience en écrans entiers (plus en milliers arrondis)');
  assert.equal(s.quatre.tv, Math.round(s.pleine.tv/2), 'quatre combats joués : la moitié des droits');
  assert.equal(s.sept.tv, Math.round(s.pleine.tv*7/8), 'sept combats joués : sept huitièmes des droits');
  for(const x of [s.pleine,s.sansFinition,s.quatre,s.sept]){
    assert.equal(x.recette, x.ticketing+x.tv-x.purses, 'R = revenus − cachets, peut être négative');
  }
});

test('MGMT économie T1 — dernier combat indisponible : la soirée est annulée sans rien changer', () => {
  const win = newGameWindow();
  const s = JSON.parse(win.eval(`(function(){
    setSeed(85);
    const m=mgmtDefault(); mgmtNewRoster(m);
    let bulk=null;
    for(let c=0;c<30&&!bulk;c++){ mgmtNewPile(m); bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open'); }
    if(!bulk||!mgmtDecide(m,bulk.id,'validate')) return 'null';
    /* Un combattant du DERNIER combat de la carte devient indisponible. */
    const last=m.card.fights[m.card.fights.length-1];
    const f=mgmtFighterById(m,last.b);
    f.susp=m.cycle;
    const before=JSON.stringify({
      W:f.W,L:f.L,D:f.D,trauma:f.trauma,susp:f.susp,
      treasury:m.treasury,recettes:m.recettes,audiences:m.audiences,eventsPlayed:m.eventsPlayed,
      cardLen:m.card.fights.length,lastEvent:m.lastEvent});
    const played=mgmtRunEvent(m);
    const after=JSON.stringify({
      W:f.W,L:f.L,D:f.D,trauma:f.trauma,susp:f.susp,
      treasury:m.treasury,recettes:m.recettes,audiences:m.audiences,eventsPlayed:m.eventsPlayed,
      cardLen:m.card.fights.length,lastEvent:m.lastEvent});
    return JSON.stringify({played:played===null,before:JSON.parse(before),after:JSON.parse(after)});
  })()`));
  assert.ok(s, 'une carte complète a été posée');
  assert.equal(s.played, true, 'mgmtRunEvent renvoie null : on ne joue pas');
  assert.deepEqual(s.after, s.before,
    'aucun bilan, aucun traumatisme, aucune trésorerie, aucun historique n\u2019a changé — et la carte reste posée');
});
