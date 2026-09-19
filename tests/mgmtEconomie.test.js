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
   séquentielle sans perte et anti-rechargement de la finance. Aucune
   réplique, aucun affichage dans cette tranche : la trésorerie s'affichera
   à la T6 (CDC §7) et la réplique E1 du patron — texte d'auteur écrit
   (LOT-3B §E1) — sera branchée à une tranche ultérieure.
   LOT 2 T1 (docs/LOT-2-CARTE-PRINCIPALE.md) : carte 5 + 4 — les tests de
   soirées réelles posent la carte principale en fixture (composition =
   T2) et la migration est réécrite en citant §T1.
   ============================================================================ */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

/* Soirées réelles : roster généré, proposition en bloc de Leïla validée
   (les quatre préliminaires — §T1 : le bloc de Leïla est la carte
   préliminaire), carte principale posée en fixture (§T1 : sa composition
   est le geste du joueur, T2), carte complète (5 + 4 = 9 combats),
   mgmtRunEvent. tBefore force la trésorerie avant la première soirée
   (test du découvert). */
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
      /* §T1 : la carte principale est posée en fixture (composition = T2),
         sur des combattants disponibles (une suspension d'une soirée à
         l'autre est réelle). */
      m.card.main=[];
      const dispo=m.roster.filter(o=>mgmtAvailable(m,o));
      if(dispo.length<10) return 'null';
      for(let i=0;i<5;i++) m.card.main.push({a:dispo[2*i].id,b:dispo[2*i+1].id,cycle:m.cycle,slot:'main'});
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
    /* §T1 : la carte principale est posée en fixture (composition = T2). */
    m.card.main=[];
    const dispo=m.roster.filter(o=>mgmtAvailable(m,o));
    if(dispo.length<10) return 'null';
    for(let i=0;i<5;i++) m.card.main.push({a:dispo[2*i].id,b:dispo[2*i+1].id,cycle:m.cycle,slot:'main'});
    const slotted=mgmtCardFights(m).map(f=>({a:f.a,b:f.b,slot:f.slot}));
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
    const uneSoiree=(seed,t)=>{
      setSeed(seed);
      const m=mgmtDefault(); mgmtNewRoster(m);
      let bulk=null;
      for(let c=0;c<30&&!bulk;c++){ mgmtNewPile(m); bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open'); }
      if(!bulk||!mgmtDecide(m,bulk.id,'validate')) return null;
      /* §T1 : la carte principale est posée en fixture (composition = T2),
         sur des combattants disponibles. */
      m.card.main=[];
      const dispo=m.roster.filter(o=>mgmtAvailable(m,o));
      if(dispo.length<10) return null;
      for(let i=0;i<5;i++) m.card.main.push({a:dispo[2*i].id,b:dispo[2*i+1].id,cycle:m.cycle,slot:'main'});
      m.treasury=t;
      return mgmtRunEvent(m);
    };
    for(let i=0;i<40;i++){
      /* Même graine pour les deux états : même roster, même carte, mêmes
         combats — seule la trésorerie d'avant soirée diffère. */
      const a=uneSoiree(700+i,-70);
      const b=uneSoiree(700+i,500);
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

test('MGMT économie T1 — migration 3 → 4 → 5 sans perte (carte en prélims), une v1 reste refusée', () => {
  const win = newGameWindow();
  /* §T1 (docs/LOT-2-CARTE-PRINCIPALE.md) : la carte plate {size,fights} de
     la v3/v4 devient {sizeMain,sizePrelims,main,prelims} — les combats
     d'une carte en cours deviennent des préliminaires. */
  const v3 = {org:'Split',v:3,cycle:2,seq:5,
    roster:[{id:'mg1',name:'A Boxeur',first:'A',last:'Boxeur',W:5,L:2,D:0,age:25,div:'H-light',divName:'Poids léger',org:'Split',level:1,raison:null,interactions:0}],
    pile:[],facts:[{c:1,k:'booked',a:'mg1',b:'mg1'}],open:null,shortfall:false,
    card:{size:4,fights:[{a:'mg1',b:'mg1',cycle:2}]},leila:{crushes:[1]},lastEvent:null};
  const mig = JSON.parse(win.eval(`JSON.stringify(mgmtMigrate(JSON.parse(JSON.stringify(${JSON.stringify(v3)}))))`));
  assert.equal(mig.v, win.eval(`MGMT_SAVE_VERSION`), 'tampon de la version courante (v5)');
  assert.equal(mig.treasury, win.eval(`MGMT_TREASURY_START`), 'trésorerie au premier jour');
  assert.deepEqual(mig.recettes, []);
  assert.deepEqual(mig.audiences, []);
  assert.equal(mig.eventsPlayed, 0);
  assert.equal(mig.roster.length, 1, 'roster intact');
  assert.equal(mig.card.sizeMain, 5, 'cinq places en carte principale (§T1)');
  assert.equal(mig.card.sizePrelims, 4, 'quatre places en préliminaires');
  assert.equal(mig.card.main.length, 0, 'carte principale vide : aucun combat ajouté d\u2019office');
  assert.equal(mig.card.prelims.length, 1, 'aucun combat perdu : le combat en carte devient un préliminaire');
  assert.equal(mig.card.prelims[0].slot, 'prelim', 'le combat migré porte slot:\u2019prelim\u2019');
  assert.equal(mig.card.prelims[0].cycle, 2, 'le cycle posé est conservé');
  assert.equal(mig.leila.crushes.length, 1, 'mémoire intacte');
  assert.equal(mig.facts.length, 1, 'faits intacts');
  assert.equal(win.eval(`validateMgmt(${JSON.stringify(mig)})`), true, 'la v3 migrée passe la porte v5');
  /* La même v3 se charge depuis le stockage dédié. */
  win.localStorage.setItem('cage-legacy-mgmt', JSON.stringify(v3));
  win.eval(`G={theme:'dark'}; loadMgmt();`);
  assert.equal(win.eval(`G.mgmt&&G.mgmt.v`), win.eval(`MGMT_SAVE_VERSION`), 'une v3 se charge en v5');
  assert.equal(win.eval(`G.mgmt.treasury`), win.eval(`MGMT_TREASURY_START`), 'champs d\u2019argent par défaut au chargement');
  /* Une v2 migre séquentiellement 2 → 3 → 4 → 5. */
  const v2 = {org:'Split',v:2,cycle:1,seq:2,roster:[],pile:[],facts:[],open:null,shortfall:false,
    card:{size:4,fights:[]},leila:{crushes:[]},lastEvent:null};
  const mig2 = JSON.parse(win.eval(`JSON.stringify(mgmtMigrate(JSON.parse(JSON.stringify(${JSON.stringify(v2)}))))`));
  assert.equal(mig2.v, win.eval(`MGMT_SAVE_VERSION`), 'migration séquentielle 2 → 3 → 4 → 5');
  assert.equal(mig2.treasury, win.eval(`MGMT_TREASURY_START`));
  assert.equal(win.eval(`validateMgmt(${JSON.stringify(mig2)})`), true, 'la v2 migrée passe la porte v5');
  /* Une v1 reste refusée, comme avant. */
  const v1 = {org:'Split',cycle:3,seq:9,roster:[],pile:[],facts:[],open:null,shortfall:false};
  assert.equal(win.eval(`mgmtMigrate(JSON.parse(JSON.stringify(${JSON.stringify(v1)})))`), null, 'v1 sans version : refusée');
  /* Une v5 incomplète ne passe pas la porte. */
  assert.equal(win.eval(`(function(){ const m=mgmtDefault(); delete m.treasury; return validateMgmt(m); })()`), false,
    'v5 sans trésorerie rejetée');
  assert.equal(win.eval(`(function(){ const m=mgmtDefault(); m.recettes=[1,2,3]; return validateMgmt(m); })()`), false,
    'plus de deux recettes rejetées (on garde les deux dernières)');
  assert.equal(win.eval(`(function(){ const m=mgmtDefault(); m.audiences=[-1]; return validateMgmt(m); })()`), false,
    'audience négative rejetée');
  assert.equal(win.eval(`(function(){ const m=mgmtDefault(); m.eventsPlayed='x'; return validateMgmt(m); })()`), false,
    'compte de soirées non entier rejeté');
  assert.equal(win.eval(`(function(){ const m=mgmtDefault(); m.card={sizeMain:5,sizePrelims:4,main:[{a:'p',b:'q',cycle:1}],prelims:[]}; return validateMgmt(m); })()`), false,
    'un combat de carte sans slot est rejeté (§T1)');
  assert.equal(win.eval(`(function(){ const m=mgmtDefault(); m.card={sizeMain:5,sizePrelims:4,main:[{a:'p',b:'q',cycle:1,slot:'prelim'}],prelims:[]}; return validateMgmt(m); })()`), false,
    'un combat de carte à l\u2019emplacement incohérent est rejeté (§T1)');
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
    /* §T1 : la carte principale est posée en fixture (composition = T2),
       sur des combattants disponibles. */
    m.card.main=[];
    const dispo=m.roster.filter(o=>mgmtAvailable(m,o));
    if(dispo.length<10) throw new Error('roster trop court');
    for(let i=0;i<5;i++) m.card.main.push({a:dispo[2*i].id,b:dispo[2*i+1].id,cycle:m.cycle,slot:'main'});
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
  /* §T1 : une carte complète du lot 2 — 5 combats principaux à leur poids,
     4 préliminaires au leur, d'attrait moyen. */
  const expected = win.eval(`Math.round(MGMT_AUD_PER_DRAW*MGMT_DRAW_AVG*(MGMT_MAIN_SIZE*MGMT_ATTR_MAIN_W+MGMT_PRELIM_SIZE*MGMT_ATTR_PRELIM_W)*(MGMT_AUD_BASE+(1-MGMT_AUD_BASE)*MGMT_SPECTACLE_REF))`);
  assert.equal(win.eval(`mgmtAudienceRef(null)`), expected,
    'avant toute soirée : l\u2019audience d\u2019une carte complète (5 + 4) d\u2019attrait moyen');
  win.eval(`(function(){ const m=mgmtDefault(); m.audiences=[10000,12000]; window.__ref=mgmtAudienceRef(m); })()`);
  assert.equal(win.eval(`window.__ref`), 11000, 'ensuite : la moyenne des soirées précédentes, en écrans entiers');
});

test('MGMT économie T1 — audience décidée surtout avant la soirée, droits au prorata des combats', () => {
  const win = newGameWindow();
  /* §T1 : la carte contractuelle est celle du lot 2 — 9 combats (5 + 4). */
  const s = JSON.parse(win.eval(`JSON.stringify({
    pleine:mgmtEventRecette(8,1,100,9),
    sansFinition:mgmtEventRecette(8,0,100,9),
    trois:mgmtEventRecette(8,1,100,3),
    huit:mgmtEventRecette(8,1,100,8)
  })`));
  const audBase = Math.round(Number(win.eval(`MGMT_AUD_PER_DRAW`))*8*Number(win.eval(`MGMT_AUD_BASE`)));
  assert.ok(audBase>0, 'une soirée sans finition garde une audience non nulle');
  assert.equal(s.sansFinition.audience, audBase, 'sans finition : seule la base d\u2019audience compte');
  assert.ok(s.sansFinition.audience<s.pleine.audience, 'le spectacle observé ajoute au-dessus de la base');
  assert.equal(s.pleine.audience, Math.round(Number(win.eval(`MGMT_AUD_PER_DRAW`))*8),
    'audience en écrans entiers (plus en milliers arrondis)');
  assert.equal(s.pleine.tv, Math.round(Number(win.eval(`MGMT_TV_PER_AUD`))*s.pleine.audience/Number(win.eval(`MGMT_TV_ECRANS`))),
    'neuf combats joués sur neuf : les droits complets du diffuseur');
  assert.equal(s.trois.tv, Math.round(s.pleine.tv/3), 'trois combats joués : un tiers des droits');
  assert.equal(s.huit.tv, Math.round(s.pleine.tv*8/9), 'huit combats joués : huit neuvièmes des droits');
  for(const x of [s.pleine,s.sansFinition,s.trois,s.huit]){
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
    /* Un combattant du DERNIER combat de la carte devient indisponible
       (dernier prélim : les préliminaires clôturent la soirée, §T1). */
    const last=m.card.prelims[m.card.prelims.length-1];
    const f=mgmtFighterById(m,last.b);
    f.susp=m.cycle;
    const before=JSON.stringify({
      W:f.W,L:f.L,D:f.D,trauma:f.trauma,susp:f.susp,
      treasury:m.treasury,recettes:m.recettes,audiences:m.audiences,eventsPlayed:m.eventsPlayed,
      cardLen:m.card.main.length+m.card.prelims.length,lastEvent:m.lastEvent});
    const played=mgmtRunEvent(m);
    const after=JSON.stringify({
      W:f.W,L:f.L,D:f.D,trauma:f.trauma,susp:f.susp,
      treasury:m.treasury,recettes:m.recettes,audiences:m.audiences,eventsPlayed:m.eventsPlayed,
      cardLen:m.card.main.length+m.card.prelims.length,lastEvent:m.lastEvent});
    return JSON.stringify({played:played===null,before:JSON.parse(before),after:JSON.parse(after)});
  })()`));
  assert.ok(s, 'une carte complète a été posée');
  assert.equal(s.played, true, 'mgmtRunEvent renvoie null : on ne joue pas');
  assert.deepEqual(s.after, s.before,
    'aucun bilan, aucun traumatisme, aucune trésorerie, aucun historique n\u2019a changé — et la carte reste posée');
});
