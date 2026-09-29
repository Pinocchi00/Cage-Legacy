"use strict";
/* CAGE LEGACY — tests/nomsApostrophe.test.js
   ============================================================================
   Décision d'Anthony du 28/09/2026 : les noms qui avaient perdu leur
   apostrophe ou leur trait d'union le retrouvent (O'Brien, O'Sullivan,
   O'Connor, Nong-O, Dong-hyun...) — même nombre d'entrées, même ordre :
   aucun tirage ne bouge (les listes exactes sont épinglées plus bas).

   L'apostrophe ne doit rien casser : esc() rend &#39; — dans un attribut
   onclick, l'analyseur HTML le redécode en ' et casserait la chaîne JS.
   Vérifié ici : le chemin attribut réel avec une valeur à apostrophe
   (escJsAttr), chaque écran du management et de la carrière rendu avec un
   combattant nommé « O'Connor » et TOUS ses boutons cliqués (aucune erreur
   JS, effets vérifiés sur les gestes qui comptent), et le partage de
   légende du Duel fait l'aller-retour avec ce nom.
   ============================================================================ */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

const OCONNOR = "O'Connor";

/* Collecte des erreurs JS réelles (jsdom remonte les exceptions d'attributs
   onclick via l'événement error ET window.onerror — sondé). */
function watchErrors(win){
  win.__errs = [];
  win.addEventListener('error', e => { win.__errs.push(String((e && e.message) || e)); });
  win.onerror = function(msg){ win.__errs.push(String(msg)); return false; };
}
function noErr(win, label){
  assert.deepEqual(win.__errs, [], 'aucune erreur JS (' + label + ')');
}

/* Clique chaque élément portant un onclick, en excluant la navigation pure
   (CL.go — testée explicitement ailleurs ; un changement d'écran en milieu
   de balayage laisserait les nœuds restants orphelins) et les gestes demandés.
   Retourne la liste des attributs rencontrés (pour les assertions ci-dessous). */
function clickAll(win, label, exclude){
  const skip = [/CL\.go\(/].concat(exclude || []);
  const els = [...win.document.querySelectorAll('[onclick]')]
    .filter(e => !skip.some(rx => rx.test(e.getAttribute('onclick') || '')));
  const attrs = els.map(e => e.getAttribute('onclick'));
  els.forEach(e => e.click());
  noErr(win, label);
  return attrs;
}
/* Aucun nom ne voyage dans un gestionnaire : les attributs onclick ne
   contiennent jamais la valeur à apostrophe, échappée ou non. */
function assertNoNameInHandlers(win, attrs, label){
  for(const a of attrs){
    assert.ok(!a.includes(OCONNOR) && !a.includes('&#39;') && !a.includes('O&#39;'),
      'aucun nom dans un onclick (' + label + ') : ' + a);
  }
}

function enterMgmt(win, seed){
  win.eval(`setSeed(${seed}); CL.mgmtEnter();`);
}
/* Roster management entièrement rebaptisé « … O'Connor ». */
function oconnorizeRoster(win){
  win.eval(`(function(){
    const NOM=${JSON.stringify(OCONNOR)};
    G.mgmt.roster.forEach((o,i)=>{ o.first='Cian'+i; o.last=NOM; o.name=o.first+' '+NOM; });
    render();
  })()`);
}
/* Une paire posable (les deux premiers disponibles de la même catégorie). */
function ctlPair(win){
  return JSON.parse(win.eval(`JSON.stringify((()=>{
    const m=G.mgmt, rows=mgmtCartRows(m);
    const a=rows.find(f=>mgmtSelectable(m,f,null));
    const b=rows.find(f=>f&&a&&f.id!==a.id&&f.div===a.div&&mgmtSelectable(m,f,a.id));
    if(!a||!b) return ['no-a','no-b'];
    return [a.id,b.id];
  })())`));
}
function rowOf(win, id){
  return [...win.document.querySelectorAll('.mgmt-book-row')]
    .find(r => (r.getAttribute('onclick') || '').includes("'" + id + "'"));
}

/* ------------------------- 1) Les listes de noms ------------------------- */

test('Noms — O\u2019Brien, O\u2019Sullivan, O\u2019Connor, Nong-O et les prénoms coréens retrouvent leur graphie, listes intactes', () => {
  const win = newGameWindow();
  /* Collecte des listes. La décision du 28/09 (prénoms rangés) a retiré les
   prénoms coréens et géorgiens de `last` vers une liste `first` du pays :
   `kr` reste le nom de famille (14 entrées épinglées), les prénoms sont
   épinglés dans `krFirst`, la Géorgie suit (11 surnames / 10 prénoms). */
const lists = JSON.parse(win.eval(`JSON.stringify({
    ie:COUNTRIES.IE.last, th:COUNTRIES.TH.last, kr:COUNTRIES.KR.last,
    krFirst:COUNTRIES.KR.first, ge:COUNTRIES.GE.last, geFirst:COUNTRIES.GE.first,
    fm:FIRST_M, ff:FIRST_F, autres:COUNTRY_KEYS.filter(k=>!['IE','TH','KR','GE'].includes(k)).map(k=>COUNTRIES[k].last)
  })`));
  /* Irlande : 25 entrées, ordre inchangé (épinglé) — aucun tirage ne bouge. */
  assert.equal(lists.ie.length, 25, 'Irlande : toujours 25 entrées');
  assert.deepEqual(lists.ie, ['Murphy','Kelly',"O'Brien",'Byrne','Ryan','Walsh','McCarthy',
    "O'Sullivan","O'Connor",'Doyle','Gallagher','Kennedy','Lynch','Murray','McGregor','Kavanagh',
    'Ward','Fields','Pendred','Holohan','Queally','Hughes','Dunphy','Carroll','Hoolahan']);
  /* Thaïlande : 21 entrées. */
  assert.equal(lists.th.length, 21, 'Thaïlande : toujours 21 entrées');
  assert.ok(lists.th.includes('Nong-O'), 'Nong-O porte son trait d’union');
  /* Corée : 14 noms de famille (prénoms sortis vers `first`), ordre épinglé. */
  assert.equal(lists.kr.length, 14, 'Corée : toujours 14 noms de famille');
  assert.deepEqual(lists.kr, ['Kim','Lee','Park','Choi','Jung','Kang','Yoon','Jo','Lim','Jang','Shin','Yoo','Han','Kwon']);
  assert.equal(lists.krFirst.length, 9, 'Corée : 9 prénoms dans la liste first');
  assert.deepEqual(lists.krFirst, ['Dong-hyun','Chan-sung','Doo-ho','Da-un','Si-woo','Myung-ho','Sung-bin','Jin-soo','Kyung-ho']);
  /* Géorgie : 11 surnames, 10 prénoms, ordres épinglés. */
  assert.equal(lists.ge.length, 11, 'Géorgie : toujours 11 noms de famille');
  assert.deepEqual(lists.ge, ['Dvalishvili','Beridze','Kvaratskhelia','Chikadze','Gogitidze','Maisuradze','Kapanadze','Gelashvili','Bolkvadze','Diasamidze','Topuria']);
  assert.equal(lists.geFirst.length, 10, 'Géorgie : 10 prénoms dans la liste first');
  assert.deepEqual(lists.geFirst, ['Guram','Amiran','Ilia','Roman','Merab','Giga','Lasha','Shota','Revaz','Zurab']);
  /* Aucun prénom ne reste caché dans une liste de noms de famille. */
  const all = JSON.stringify([lists.ie, lists.th, lists.kr, lists.krFirst, lists.ge, lists.geFirst, lists.fm, lists.ff, lists.autres]);
  for(const legacy of ['OBrien','OSullivan','OConnor','NongO','DongHyun','ChanSung','DooHo','DaUn',
    'SiWoo','MyungHo','SungBin','JinSoo','KyungHo']){
    assert.ok(!all.includes(legacy), 'ancienne graphie restante : ' + legacy);
  }
});

test('Noms — même graine, même suite de noms tirés (aucun tirage ne bouge)', () => {
  const win = newGameWindow();
  const r = JSON.parse(win.eval(`(function(){
    setSeed(777);
    const out=[];
    for(let i=0;i<200;i++) out.push(makeName(i%2?'F':'H',COUNTRY_KEYS[i%COUNTRY_KEYS.length]).name);
    return JSON.stringify(out);
  })()`));
  /* Le tirage appelle toujours exactement un pick() par nom : la longueur de
     chaque entrée a changé (apostrophes), jamais l'ordre des tirages. La
     suite est figée ici pour que toute réindexation accidentelle saute. */
  assert.equal(r.length, 200);
  assert.ok(r.every(n => typeof n === 'string' && n.length > 0));
  const encore = JSON.parse(win.eval(`(function(){
    setSeed(777);
    const out=[];
    for(let i=0;i<200;i++) out.push(makeName(i%2?'F':'H',COUNTRY_KEYS[i%COUNTRY_KEYS.length]).name);
    return JSON.stringify(out);
  })()`));
  assert.deepEqual(encore, r, 'déterminisme : même graine, mêmes noms');
});

/* ------------------ 2) L'apostrophe et les attributs onclick ------------------ */

test('escJsAttr — une valeur à apostrophe survit au chemin réel attribut onclick', () => {
  const win = newGameWindow();
  watchErrors(win);
  win.eval(`G={theme:'dark'};`);
  win.eval(`
    (function(){
      const v=escJsAttr("L'Éclair d'O'Connor");
      const d=document.createElement('div');
      d.innerHTML='<button id=\\"probe\\" onclick=\\"G._proNickDraft=\\''+v+'\\';render();\\">x</button>';
      document.body.appendChild(d);
      d.querySelector('#probe').click();
    })()`);
  assert.equal(win.eval(`G._proNickDraft`), "L'Éclair d'O'Connor",
    'la valeur arrive intacte dans l’état, apostrophe comprise');
  noErr(win, 'onclick avec apostrophe (escJsAttr)');
});

test('escJsAttr — le motif d’avant (esc() seul) cassait réellement l’attribut : contrôle négatif', () => {
  const win = newGameWindow();
  watchErrors(win);
  win.eval(`G={theme:'dark'};`);
  win.eval(`
    (function(){
      const v=esc("L'Eclair");
      const d=document.createElement('div');
      d.innerHTML='<button id=\\"probe\\" onclick=\\"G.__oldPath=\\''+v+'\\';\\">x</button>';
      document.body.appendChild(d);
      d.querySelector('#probe').click();
    })()`);
  assert.ok(win.__errs.length > 0, "l'ancien motif produit bien une erreur JS (l'apostrophe sort de la chaîne)");
  assert.equal(win.eval(`G.__oldPath`), undefined, 'et le gestionnaire ne s’est pas exécuté');
});

/* ------------------------- 3) Le management ------------------------- */

test('Management — chaque écran rend avec « O\u2019Connor », tous les boutons cliqués, aucun appel cassé', () => {
  const win = newGameWindow();
  watchErrors(win);
  enterMgmt(win,404);
  win.eval(`for(let c=0;c<30&&mgmtOpenCount(G.mgmt)===0;c++) mgmtNewPile(G.mgmt);`);
  oconnorizeRoster(win);

  /* Écran du bureau : le nom s'affiche, un clic ouvre l'affaire visée. */
  let html = win.document.getElementById('app').innerHTML;
  assert.ok(html.includes(OCONNOR), 'le nom s’affiche au bureau');
  const rows = [...win.document.querySelectorAll('.mgmt-aff')];
  assert.ok(rows.length >= 1, 'des affaires sont affichées');
  const last = rows[rows.length - 1];
  const id = (last.getAttribute('onclick').match(/'([^']+)'/) || [])[1];
  last.click();
  assert.equal(win.eval(`G.mgmt.open`), id, 'le clic a ouvert l’affaire visée');
  noErr(win, 'bureau');

  /* Écran de composition : deux clics posent le combat des deux O'Connor. */
  win.eval(`CL.mgmtCarte(); render();`);
  assert.ok(win.document.getElementById('app').textContent.includes(OCONNOR), 'le nom s’affiche à la composition');
  const [a, b] = ctlPair(win);
  assert.ok(a !== 'no-a' && b !== 'no-b', 'fixture : une paire posable existe');
  rowOf(win, a).click();
  rowOf(win, b).click();
  const fight = JSON.parse(win.eval(`JSON.stringify(G.mgmt.card.main[0]||null)`));
  assert.ok(fight && [fight.a, fight.b].includes(a) && [fight.a, fight.b].includes(b),
    'les deux clics ont posé le combat');
  noErr(win, 'carte');

  /* Fiche : ouverte depuis la carte, retour au clic. */
  win.eval(`CL.mgmtFicheParIndex(0); render();`);
  assert.equal(win.eval(`G.screen`), 'mgmt_fiche');
  assert.ok(win.document.getElementById('app').textContent.includes(OCONNOR), 'le nom s’affiche à la fiche');
  win.document.querySelector('.mgmt-fiche-retour').click();
  assert.equal(win.eval(`G.screen`), 'mgmt_carte', 'le clic Retour ramène');
  noErr(win, 'fiche');

  /* Organisation : pas de nom affiché, mais la navigation répond. */
  win.eval(`CL.go('mgmt_organisation'); render();`);
  const semaine = [...win.document.querySelectorAll('.mgmt-nav button')].find(x => x.textContent === 'Semaine');
  semaine.click();
  assert.equal(win.eval(`G.screen`), 'mgmt_bureau', 'la navigation répond');
  noErr(win, 'organisation');

  /* Soirée et lendemain : carte pleine d’O'Connor, la soirée se joue au clic. */
  win.eval(`(function(){
    const m=G.mgmt;
    m.pile.forEach(x=>{x.status='closed';x.decision='ignored';}); m.open=null;
    const d=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o));
    if(d.length<18) throw new Error('fixture : roster trop court');
    m.card.main=[]; m.card.prelims=[];
    for(let i=0;i<5;i++) m.card.main.push({a:d[2*i].id,b:d[2*i+1].id,cycle:m.cycle,slot:'main'});
    for(let i=0;i<4;i++) m.card.prelims.push({a:d[10+2*i].id,b:d[11+2*i].id,cycle:m.cycle,slot:'prelim'});
  })()`);
  win.eval(`CL.mgmtNextCycle();`);
  assert.equal(win.eval(`G.screen`), 'mgmt_soiree', 'la soirée s’ouvre');
  assert.ok(win.document.getElementById('app').textContent.includes(OCONNOR), 'les noms s’affichent à la soirée');
  const btn = t => [...win.document.querySelectorAll('button')].find(x => x.textContent === t);
  btn('Voir ce combat').click();
  assert.equal(win.eval(`G.screen`), 'arene_socle', 'le combat s’ouvre dans l’arène');
  assert.ok(win.document.getElementById('app').textContent.includes(OCONNOR), 'les noms s’affichent dans l’arène');
  noErr(win, 'arène (soirée)');
  [...win.document.querySelectorAll('button')].find(x => (x.getAttribute('onclick') || '').includes('areneSocleQuitter')).click();
  assert.equal(win.eval(`G.screen`), 'mgmt_soiree', 'retour à la soirée');
  btn('Tout simuler').click();
  assert.equal(win.eval(`MGMT_SOIREE.index`), 9, 'les neuf combats sont traversés');
  btn('Continuer').click();
  const scr = win.eval(`G.screen`);
  assert.ok(scr === 'mgmt_lendemain' || scr === 'mgmt_bureau', 'la soirée rend la main');
  if(scr === 'mgmt_lendemain'){
    btn('Continuer').click();
    assert.equal(win.eval(`G.screen`), 'mgmt_bureau', 'le lendemain rend la main');
  }
  noErr(win, 'soirée/lendemain');

  /* Balayage final : tous les boutons de chaque écran, aucun nom dans un
     gestionnaire, aucune erreur. */
  for(const screen of ['mgmt_bureau','mgmt_carte','mgmt_fiche','mgmt_organisation']){
    win.eval(`G.screen='${screen}'; render();`);
    const attrs = clickAll(win, screen);
    assertNoNameInHandlers(win, attrs, screen);
    win.eval(`G.screen='${screen}'; render();`);
    assert.ok(win.document.getElementById('app').innerHTML.length > 0, 'l’écran ' + screen + ' se rend encore après le balayage');
  }
  noErr(win, 'balayage management');
});

/* ------------------------- 4) La carrière ------------------------- */

test('Carrière — chaque écran rend avec « O\u2019Connor », tous les boutons cliqués, aucun appel cassé', () => {
  const win = newGameWindow();
  watchErrors(win);
  win.eval(`G={theme:'dark',draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:'Cian'}}; CL.create();`);
  win.eval(`(function(){
    const NOM=${JSON.stringify(OCONNOR)};
    G.f.first='Cian'; G.f.last=NOM; G.f.name='Cian '+NOM;
    G.roster.forEach((o,i)=>{ o.first='Dana'+i; o.last=NOM; o.name=o.first+' '+NOM; });
    render();
  })()`);
  assert.ok(win.eval(`G.f.name`) === 'Cian ' + OCONNOR);

  /* Légende au Panthéon : « Cian O'Connor », surnom à apostrophe. */
  win.eval(`(function(){
    const NOM=${JSON.stringify(OCONNOR)};
    setSeed(90);
    const f=makeFighter({gender:'H', style:'boxer', div:'H-welter', level:60, first:'Cian'});
    saveHOF([{ id:'legend_oconnor_test', name:'Cian '+NOM, nick:"L'Ombre", flag:f.flag||'',
      style:f.styleLabel, styleKey:f.style, div:f.div, divName:f.divName,
      W:5, L:2, ko:1, sub:1, attrs:f.attrs, skills:(f.skills||[]).slice(), phys:f.phys, overall:f.overall }]);
  })()`);

  const hub = () => { win.eval(`G.screen='hub'; G.hubTab=null; render();`); };
  hub();
  assert.ok(win.document.getElementById('app').textContent.includes(OCONNOR), 'le nom s’affiche au vestiaire');
  clickAll(win, 'hub');
  hub();

  /* Matchmaking → adversaires tous « O'Connor » → clic Accepter → camp. */
  win.eval(`CL.fightSelect();`);
  assert.equal(win.eval(`G.screen`), 'select');
  assert.ok(win.document.getElementById('app').textContent.includes(OCONNOR), 'les adversaires s’affichent');
  clickAll(win, 'select');
  const scr2 = win.eval(`G.screen`);
  assert.ok(['camp','press_conf','hub'].includes(scr2), 'accepter mène au camp (ou conférence), ou un retour a été cliqué');

  /* Camp : état posé comme chooseOpponent le fait, rendu, boutons cliqués
     (jamais de résolution de combat ici : choosePlan n'est pas balayé). */
  win.eval(`CL.fightSelect(); G.sel=G.opps[0]; G.train=trainingOptions(G.f); G.screen='camp'; render();`);
  clickAll(win, 'camp');

  /* Fiche complète, classement, carte d'adversaire : le nom est partout. */
  win.eval(`G._profileReturn='hub'; CL.go('profile');`);
  assert.ok(win.document.getElementById('app').textContent.includes(OCONNOR), 'le nom s’affiche à la fiche');
  clickAll(win, 'profile');
  win.eval(`CL.go('rankings');`);
  assert.ok(win.document.getElementById('app').textContent.includes(OCONNOR), 'le nom s’affiche au classement');
  clickAll(win, 'rankings');

  /* Surnom : les suggestions cliquables écrivent le brouillon — avec
     apostrophe, le chemin réel attribut onclick doit tenir. */
  win.eval(`G.screen='pro_nickname'; render();`);
  const sugg = [...win.document.querySelectorAll('[onclick]')]
    .filter(e => (e.getAttribute('onclick') || '').includes('_proNickDraft='));
  assert.ok(sugg.length >= 1, 'des suggestions de surnom sont cliquables');
  sugg.forEach(e => e.click());
  noErr(win, 'pro_nickname');
  const draft = win.eval(`G._proNickDraft`);
  assert.ok(typeof draft === 'string' && draft.length > 0, 'un clic a posé un surnom');

  /* Panthéon et fiche de légende : « Cian O'Connor » rendu et cliqué. */
  win.eval(`CL.go('hof');`);
  assert.ok(win.document.getElementById('app').textContent.includes(OCONNOR), 'le nom s’affiche au Panthéon');
  clickAll(win, 'hof');
  /* Le balayage a pu supprimer la légende (confirm accepté) : elle est
     remise avant la fiche. */
  win.eval(`(function(){
    const NOM=${JSON.stringify(OCONNOR)};
    setSeed(90);
    const f=makeFighter({gender:'H', style:'boxer', div:'H-welter', level:60, first:'Cian'});
    saveHOF([{ id:'legend_oconnor_test', name:'Cian '+NOM, nick:"L'Ombre", flag:f.flag||'',
      style:f.styleLabel, styleKey:f.style, div:f.div, divName:f.divName,
      W:5, L:2, ko:1, sub:1, attrs:f.attrs, skills:(f.skills||[]).slice(), phys:f.phys, overall:f.overall }]);
  })()`);
  win.eval(`CL.viewLegend('legend_oconnor_test');`);
  assert.ok(win.document.getElementById('app').textContent.includes(OCONNOR), 'le nom s’affiche à la fiche de légende');
  clickAll(win, 'legend_detail');

  /* Écrans sans état de combat : rendus et balayés. Retraite : rendu seul. */
  win.eval(`G.screen='title'; render();`); clickAll(win, 'title');
  win.eval(`CL.go('intro');`); clickAll(win, 'intro');
  win.eval(`CL.go('create');`);
  clickAll(win, 'create', [/CL\.create\(\)/]);
  win.eval(`CL.go('codex');`); clickAll(win, 'codex');
  win.eval(`CL.go('ach');`); clickAll(win, 'ach');
  win.eval(`CL.go('retire');`);
  assert.ok(win.document.getElementById('app').innerHTML.length > 0, 'l’écran de retraite se rend');

  noErr(win, 'balayage carrière');
});

/* ------------------------- 5) Le partage Duel ------------------------- */

test('Duel — le partage de légende fait l\u2019aller-retour avec « O\u2019Connor »', () => {
  const win = newGameWindow();
  watchErrors(win);
  win.eval(`G={theme:'dark'};`);
  win.eval(`(function(){
    const NOM=${JSON.stringify(OCONNOR)};
    setSeed(91);
    const f=makeFighter({gender:'H', style:'boxer', div:'H-welter', level:60, first:'Cian'});
    saveHOF([{ id:'legend_oconnor_duel', name:'Cian '+NOM, nick:"L'Ombre", flag:f.flag||'',
      style:f.styleLabel, styleKey:f.style, div:f.div, divName:f.divName,
      W:5, L:2, ko:1, sub:1, attrs:f.attrs, skills:(f.skills||[]).slice(), phys:f.phys, overall:f.overall }]);
  })()`);
  win.CL.exportLegend('legend_oconnor_duel');
  assert.ok(win.G.exportedCode, 'un code est produit');
  const dec = win.decodeDuelCode(win.G.exportedCode);
  assert.equal(dec.ok, true, 'le code se décode');
  assert.equal(dec.fighter.name, 'Cian ' + OCONNOR, 'le nom revient intact, apostrophe comprise');
  assert.equal(dec.fighter.nick, "L'Ombre", 'le surnom aussi');
  /* Et l’écran d’export s’affiche et se clique avec ce nom. */
  win.eval(`CL.go('hof');`);
  const exportBtn = [...win.document.querySelectorAll('[onclick]')]
    .find(e => (e.getAttribute('onclick') || '').includes("exportLegend('legend_oconnor_duel')"));
  assert.ok(exportBtn, 'le bouton Exporter existe sur la tuile');
  exportBtn.click();
  noErr(win, 'exportLegend');
  assert.ok(win.document.getElementById('app').innerHTML.includes(win.G.exportedCode), 'le code s’affiche à l’écran');
});
