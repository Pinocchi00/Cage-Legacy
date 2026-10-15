"use strict";
/* ==== [ANCRE: MONDE_LOT5_T4_TESTS] — Monde lot 5 T4 ==== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

// Porte partie() de mgmtCartePremierJour.test.js, même passé court.
function partie() {
  const win = newGameWindow({ runMain: true });
  win.eval("setSeed(20261008); mgmtPasseGenerer('split',{soirees:3});");
  win.eval('mgmtCartReset(); var sauvegardesT4=0; saveMgmt=()=>{sauvegardesT4++;}; render=()=>{};');
  return win;
}
function photo(w) { return w.eval('JSON.stringify(G.mgmt)'); }
function ligne(w) {
  const host=w.document.createElement('div');
  host.innerHTML=w.eval('mgmtCarteCombatLigne(G.mgmt,0,G.mgmt.card.main[0],{courant:-1})');
  return host;
}
function clic(w,host,selector) {
  const el=host.querySelector(selector); assert.ok(el,selector);
  w.eval(el.getAttribute('onclick'));
}
/* ==== [ANCRE: MONDE_LOT5_T4_REPRISE_FIXTURES] — Monde lot 5 T4 ==== */
function carteValide(w,index) {
  w.eval(`while(G.mgmt.card.main.length<5){
    const m=G.mgmt, rows=mgmtCartRows(m); let pose=false;
    for(const a of rows){
      for(const b of rows){ if(mgmtBookMain(m,a.id,b.id)){pose=true;break;} }
      if(pose) break;
    }
    if(!pose) throw new Error('Aucune paire valide');
  }
  G.mgmt.card.main.splice(${index},0,G.mgmt.card.main.shift());`);
  assert.equal(w.eval('validateMgmt(G.mgmt)'),true);
  assert.equal(w.eval('new Set(G.mgmt.card.main.flatMap(f=>[f.a,f.b])).size'),10);
  assert.equal(w.eval(`G.mgmt.card.main[${index}].herite`),true);
}
test('Monde lot 5 T4 — avertir avant de retirer un combat hérité', () => {
  for(const action of ['CL.mgmtUnbook(0)','CL.mgmtCarteModifie(0)']) {
    const w=partie();
    try {
      const avant=photo(w),seed=w.eval('SEED');
      const noms=JSON.parse(w.eval('JSON.stringify([G.mgmt.card.main[0].a,G.mgmt.card.main[0].b].map(id=>mgmtFighterById(G.mgmt,id).name))'));
      w.eval(action);
      const host=ligne(w);
      for(const n of noms) assert.ok(host.textContent.includes(n));
      assert.ok(host.textContent.includes('ils en gardent une contrariété.'));
      assert.equal(host.querySelectorAll('button').length,2);
      assert.equal(photo(w),avant); assert.equal(w.eval('SEED'),seed);
      assert.equal(w.eval('sauvegardesT4'),0);
      assert.equal(w.eval('MGMT_CARTE_ANNULATION.relu'),false);
    } finally { w.close(); }
  }
});
test('Monde lot 5 T4 — renoncer conserve exactement le combat hérité', () => {
  for(const clavier of [false,true]) {
    const w=partie();
    try {
      const avant=photo(w),seed=w.eval('SEED');
      w.eval('CL.mgmtUnbook(0)');
      if(clavier) w.eval('KEYS.maps.mgmt_carte.Escape()');
      else clic(w,ligne(w),'button[onclick="CL.mgmtCarteRenonce()"]');
      assert.equal(photo(w),avant); assert.equal(w.eval('SEED'),seed);
      assert.equal(w.eval('sauvegardesT4'),0);
      assert.equal(w.eval('MGMT_CART.annulation'),undefined);
      assert.ok(ligne(w).querySelector('.mf-car-provenance'));
    } finally { w.close(); }
  }
});
test('Monde lot 5 T4 — confirmer contrarie exactement les deux combattants', () => {
  const w=partie();
  try {
    /* ==== [ANCRE: MONDE_LOT5_T4_REPRISE_INVARIANTS] — Monde lot 5 T4 ==== */
    const avant=JSON.parse(photo(w));
    const identites=w.eval('({roster:G.mgmt.roster,cal:G.mgmt.cal,pile:G.mgmt.pile,promesses:G.mgmt.promesses})');
    const contrats=w.eval('G.mgmt.roster.map(f=>f.ct)');
    w.eval('var paireT4=JSON.parse(JSON.stringify(G.mgmt.card.main[0])); var chargesT4=G.mgmt.roster.map(f=>mgmtContrarieCharge(G.mgmt,f,4,6));');
    const seed=w.eval('SEED'),n=w.eval('G.mgmt.card.main.length');
    w.eval('CL.mgmtUnbook(0)');
    clic(w,ligne(w),'button[onclick="CL.mgmtCarteConfirmeAnnulation()"]');
    assert.equal(w.eval('G.mgmt.card.main.length'),n-1);
    assert.equal(w.eval(`JSON.stringify(G.mgmt.facts.filter(f=>f.why==='annulation-heritee'))`),
      w.eval(`JSON.stringify([paireT4.a,paireT4.b].map(a=>({c:4,k:'contrarie',a,p:10,why:'annulation-heritee'})))`));
    assert.equal(w.eval('G.mgmt.roster.every((f,i)=>mgmtContrarieCharge(G.mgmt,f,4,6)===chargesT4[i]+([paireT4.a,paireT4.b].includes(f.id)?10:0))'),true);
    assert.equal(w.eval('mgmtSoireesJoueur(G.mgmt)'),0);
    assert.equal(w.eval('sauvegardesT4'),1); assert.equal(w.eval('SEED'),seed);
    const attendu=structuredClone(avant),paire=attendu.card.main.shift();
    attendu.facts.push(...[paire.a,paire.b].map(a=>({c:4,k:'contrarie',a,p:10,why:'annulation-heritee'})));
    assert.deepEqual(JSON.parse(photo(w)),attendu,'seuls le retrait ciblé et les deux faits changent');
    for(const [cle,valeur] of Object.entries(identites)) assert.equal(w.G.mgmt[cle],valeur,cle);
    contrats.forEach((ct,i)=>assert.equal(w.G.mgmt.roster[i].ct,ct));
  } finally { w.close(); }
});
test('Monde lot 5 T4 — souris clavier et modification ne contournent pas la confirmation', () => {
  const w=partie();
  try {
    const avant=photo(w),seed=w.eval('SEED');
    const actions=['.mf-car-retire','.mf-car-num','.mf-car-slot-n','.mf-car-annule'];
    for(const selector of actions){
      clic(w,ligne(w),selector);
      assert.equal(photo(w),avant); assert.ok(ligne(w).querySelector('.mf-car-avertissement'));
      w.eval('CL.mgmtCarteRenonce()');
    }
    /* ==== [ANCRE: MONDE_LOT5_T4_REPRISE_CLAVIER] — Monde lot 5 T4 ==== */
    for(let i=0;i<5;i++) {
      const fixture=partie();
      try {
        carteValide(fixture,i);
        const p=photo(fixture),rng=fixture.eval('SEED');
        fixture.eval('G.screen="mgmt_carte"');
        fixture.document.dispatchEvent(new fixture.KeyboardEvent('keydown',{key:String(i+1),bubbles:true,cancelable:true}));
        assert.equal(photo(fixture),p); assert.equal(fixture.eval('MGMT_CART.annulation.i'),i);
        assert.equal(fixture.eval('sauvegardesT4'),0); assert.equal(fixture.eval('SEED'),rng);
      } finally { fixture.close(); }
    }
    const host=ligne(w); w.document.body.appendChild(host);
    const bouton=host.querySelector('.mf-car-annule'); bouton.focus();
    w.eval('G.screen="mgmt_carte"');
    const entree=new w.KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true});
    bouton.dispatchEvent(entree);
    assert.equal(entree.defaultPrevented,false,'activation native préservée');
    assert.equal(photo(w),avant); assert.equal(w.eval('MGMT_CART.annulation'),undefined);
    assert.equal(w.eval('sauvegardesT4'),0); assert.equal(w.eval('SEED'),seed);
    // jsdom ne synthétise pas le clic natif ; le navigateur le vérifie séparément.
    bouton.click();
    assert.equal(w.eval('MGMT_CART.annulation.i'),0); assert.equal(photo(w),avant);
    w.eval('CL.mgmtCarteRenonce()'); host.remove();
    w.eval(`var paireT4={...G.mgmt.card.main[0]}; MGMT_CART.pick=null; MGMT_CART.div=mgmtFighterById(G.mgmt,paireT4.a).div; MGMT_CART.cursor=mgmtCarteListe(G.mgmt).findIndex(f=>f.id===paireT4.a); KEYS.maps.mgmt_carte.X();`);
    assert.equal(w.eval('MGMT_CART.annulation.i'),0);
    w.eval('CL.mgmtCarteRenonce(); CL.mgmtCarteModifie(0); KEYS.maps.mgmt_carte.Enter();');
    assert.equal(w.eval('MGMT_CART.pick===paireT4.a&&mgmtCarteListe(G.mgmt)[MGMT_CART.cursor].id===paireT4.b'),true);
    assert.equal(w.eval('sauvegardesT4'),1); assert.equal(w.eval('SEED'),seed);
  } finally { w.close(); }
});
test('Monde lot 5 T4 — une confirmation périmée ou répétée ne retire aucun autre combat', () => {
  const w=partie();
  try {
    w.eval('CL.mgmtUnbook(0); CL.mgmtCarteConfirmeAnnulation();');
    const apres=photo(w),seed=w.eval('SEED');
    w.eval('CL.mgmtCarteConfirmeAnnulation()');
    assert.equal(photo(w),apres); assert.equal(w.eval('sauvegardesT4'),1);
    w.eval('CL.mgmtUnbook(0); G.mgmt.card.main.unshift({a:"remplacement",b:"autre"});');
    const perime=photo(w);
    w.eval('CL.mgmtCarteConfirmeAnnulation()');
    assert.equal(photo(w),perime); assert.equal(w.eval('sauvegardesT4'),1); assert.equal(w.eval('SEED'),seed);
  } finally { w.close(); }
});
test('Monde lot 5 T4 — un combat joueur reste retirable sans contrariété héritée', () => {
  const w=partie();
  try {
    w.eval('var paireT4={...G.mgmt.card.main[0]}; CL.mgmtUnbook(0); CL.mgmtCarteConfirmeAnnulation();');
    assert.ok(w.eval('mgmtBookMain(G.mgmt,paireT4.a,paireT4.b)'));
    const i=w.eval('G.mgmt.card.main.length-1'),n=i+1;
    assert.equal(w.eval(`G.mgmt.card.main[${i}].herite`),undefined);
    assert.equal(w.eval(`mgmtCarteCombatLigne(G.mgmt,${i},G.mgmt.card.main[${i}],{courant:-1}).includes('mf-car-annule')`),false);
    w.eval(`CL.mgmtUnbook(${i})`);
    assert.equal(w.eval('G.mgmt.card.main.length'),n-1);
    assert.equal(w.eval('MGMT_CART.annulation'),undefined);
    assert.equal(w.eval('G.mgmt.facts.filter(f=>f.why==="annulation-heritee").length'),2);
    assert.equal(w.eval('sauvegardesT4'),2);
  } finally { w.close(); }
});
test('Monde lot 5 T4 — la contrariété survit à la sauvegarde sans se recréer', () => {
  const w=partie();
  try {
    const ancienne=w.eval('mgmtSerialiser(G.mgmt)');
    w.eval('CL.mgmtUnbook(0); CL.mgmtCarteConfirmeAnnulation(); var serialT4=mgmtSerialiser(G.mgmt);');
    assert.equal(w.eval(`(function(){const a=mgmtParseAndValidate(serialT4),b=mgmtParseAndValidate(mgmtSerialiser(a));
      return validateMgmt(a)&&JSON.stringify(a.card)===JSON.stringify(G.mgmt.card)&&JSON.stringify(a.facts)===JSON.stringify(G.mgmt.facts)&&JSON.stringify(b.facts)===JSON.stringify(a.facts);})()`),true);
    w.eval(`var oldT4=JSON.parse(${JSON.stringify(ancienne)}); oldT4.v=17; var chargeT4=mgmtParseAndValidate(JSON.stringify(oldT4));`);
    assert.equal(w.eval('chargeT4.v'),21); /* décision du 15/10/2026 : fusion du lot 6, migration 18 → 19 */ /* fusion du lot 9 (15/10/2026) : 19 → 20, mondeVivant=false ; lot 9 T2d : 20 → 21, identifiants préfixés */
    /* Décision du lot 6 T3 : la migration marque raison:null sur les combats d'avant ; c'est le seul champ ajouté, il est écarté de la comparaison. */
    /* Comparaison du contenu, indépendante de l'ordre des clés (la chaîne de migrations 17 → 18 → 19 reconstruit certains objets). */
    assert.equal(w.eval(`(function(){const canon=o=>Array.isArray(o)?o.map(canon):(o&&typeof o==='object'?Object.keys(o).sort().reduce((r,k)=>{if(!(k==='raison'&&o[k]===null)&&!(k==='mondeVivant'&&o[k]===false)) r[k]=canon(o[k]);return r;},{}):o);return JSON.stringify(canon({...JSON.parse(mgmtSerialiser(chargeT4)),v:17}))===JSON.stringify(canon(oldT4));})()`),true);
    for(const [why,p] of [['inconnu',10],['annulation-heritee',9],['annulation-heritee',31],['annulation-heritee',10.5]]) {
      assert.equal(w.eval(`(function(){const m=JSON.parse(serialT4),f=m.facts.find(f=>f.why==='annulation-heritee'); f.why=${JSON.stringify(why)};f.p=${p};return validateMgmt(m);})()`),false);
    }
  } finally { w.close(); }
});
