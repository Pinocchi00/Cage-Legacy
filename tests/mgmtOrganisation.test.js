"use strict";
/* CAGE LEGACY — tests/mgmtOrganisation.test.js
   ===========================================================================
   LOT 4 T7 — l'écran de l'organisation (docs/LOT-4-LA-PEAU-DU-JEU.md §3 T7,
   maquette 08 partielle) :
   - l'écran rend, dans SCREENS comme les cinq autres, avec l'entrée
     « Organisation » dans la navigation ; échap ramène à la semaine ;
   - aucun texte de travail ni aucun texte de maquette (§1) : aucun onglet
     Contrats ni Diffuseur, ni patron, ni objectifs de saison ;
   - l'effectif par catégorie se dérive à la lecture — le nombre de
     combattants de Split dans le top 15 mondial (classement mondial,
     portée « world » de mgmtDivisionRanking, les 15 premiers, filtrés
     sur le roster — le classement de Split ne dépassant jamais quinze
     combattants, y lire « classés » ne dirait que l'effectif), le
     constat « effectif trop mince » quand une catégorie tombe sous deux
     disponibles (mgmtAvailable), et deux groupes titrés hommes/femmes
     (les divisions H et F d'engine.js) ;
   - la navigation distingue l'entrée courante (aria-current, contrastes
     ≥ 4,5:1 — charte L2).
   - les finances : la trésorerie (m.treasury) et les recettes des dernières
     soirées (m.recettes), telles qu'elles existent — aucune recette, aucune
     ligne de soirées, aucun chiffre inventé, ni note, ni barème, ni jauge.
   ========================================================================== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

/* Textes de travail (audit B1, lot 4 §4) : aucun emplacement d'auteur ni
   jargon interne du code n'apparaît sur l'écran (charte S7). */
const TRAVAIL_RE=/RÉPLIQUE MANQUANTE|EMPLACEMENT AUTEUR|mgmt-lvl|TODO/i;

/* État management neuf, roster généré par le vrai mgmtNewRoster, sans
   passer par mgmtEnter (le test pilote la navigation lui-même). */
function freshState(win,seed){
  win.eval(`(function(){ setSeed(${seed}); const m=mgmtDefaultAvantH4(); mgmtNewRoster(m); G={theme:'dark',mgmt:m}; })()`);
}

/** Les tuiles d'effectif rendues : {nm,sub,thin}. */
function mgmtOrgTiles(html){
  const re=/<div class="mgmt-org-cat[^"]*"><div class="mgmt-org-nm">([^<]*)<\/div><div class="mgmt-org-sub">([^<]*)<\/div><\/div>/g;
  const out=[]; let m;
  while((m=re.exec(html))) out.push({nm:m[1],sub:m[2],thin:m[0].indexOf(' thin')>=0});
  return out;
}

test('MGMT T7 — l’écran rend, navigation, échap ramène à la semaine, aucun texte de travail', () => {
  const win = newGameWindow();
  win.eval(`setSeed(77); mgmtEntrerAvantH4(); CL.go('mgmt_organisation');`);
  const html = win.document.getElementById('app').innerHTML;
  assert.ok(html.includes("L'organisation"), 'l’écran de l’organisation est rendu');
  /* Ce qui n'existe pas n'apparaît pas : aucun texte de la maquette 08 hors
     l'effectif et les finances (§1, §3 T7). */
  assert.ok(!TRAVAIL_RE.test(html), 'aucun texte de travail');
  /* Brief du 06/10/2026, lot 4 : la barre des sections du cadre porte un « Contrats » ; ce que le test garde,
     c'est que l'écran de l'organisation lui-même (le contenu ancien) n'a ni onglet Contrats ni Diffuseur. */
  const ancien=win.document.querySelector('.mf-ancien').innerHTML;
  assert.ok(!ancien.includes('Contrats')&&!ancien.includes('Diffuseur'), 'aucun onglet Contrats ni Diffuseur');
  assert.ok(!html.includes('Delatour')&&!html.includes('PATRON')&&!html.includes('OBJECTIFS'), 'ni patron ni objectifs de saison');
  /* Navigation permanente : Semaine, Classements (T6 : l'écran existe,
     docs/LOT-4-LA-PEAU-DU-JEU.md §3 T6, réécrit sur la décision T6) et
     Organisation, aucune entrée morte. */
  assert.equal(win.document.querySelectorAll('.mgmt-nav').length, 1, 'la barre de navigation est présente');
  const navs = [...win.document.querySelectorAll('.mgmt-nav button')].map(b=>b.textContent);
  /* Lot 5 H8 : le vestiaire rejoint la navigation (maquette 11). */
  assert.deepEqual(navs, ['Semaine','Effectif','Recrutement','Classements','Organisation'], 'les entrées de navigation suivent les écrans livrés');
  /* L'entrée courante (aria-current) se distingue : ici l'Organisation. */
  const courant = win.document.querySelectorAll('.mgmt-nav button[aria-current="page"]');
  assert.equal(courant.length, 1, 'une seule entrée courante');
  assert.equal(courant[0].textContent, 'Organisation', 'l’écran courant est signalé');
  assert.ok(courant[0].classList.contains('cur'), 'l’entrée courante porte sa classe visuelle');
  /* L'effectif et les finances sont lisibles (charte R1, R3). */
  assert.ok(html.includes('Trésorerie'), 'la trésorerie est lisible');
  assert.ok(win.document.getElementById('app').textContent.includes(win.eval('mgmtEuros(G.mgmt.treasury)')), 'la valeur de la trésorerie est telle qu’elle existe');
  assert.ok(html.includes("L'effectif"), 'l’effectif par catégorie est présent');
  /* Au clavier : échap ramène à la semaine — la navigation y signale
     l'écran courant, cette fois la Semaine. */
  const key = k => win.eval(`document.dispatchEvent(new KeyboardEvent('keydown',{key:'${k}',bubbles:true}))`);
  key('Escape');
  assert.equal(win.eval('G.screen'), 'mgmt_carte', 'échap ramène à la carte (décision d’Anthony du 08/10/2026 : plus d’écran « Les affaires » à l’ouverture ; l’entrée et le retour ramènent à la carte)');
});

test('MGMT T7 — le constat « effectif trop mince » apparaît quand une catégorie tombe sous deux disponibles', () => {
  const win = newGameWindow();
  freshState(win,78);
  win.eval(`(function(){
    const m=G.mgmt;
    /* Fixture : « Poids léger » vidée au-delà du cycle — plus aucun
       disponible ; « Poids moyen » reste composable (deux disponibles).
       Les deux noms sont uniques dans DIVISIONS (« Poids plume » existe
       chez les hommes et les femmes, pas les deux visibles). */
    const vide=m.roster.filter(o=>o.div==='H-light');
    if(vide.length<1) throw new Error('fixture : graine sans « Poids léger », en choisir une autre');
    for(const o of vide) o.susp=m.cycle+5;
    const dispo=m.roster.filter(o=>o.div==='H-light'&&mgmtAvailable(m,o)).length;
    if(dispo!==0) throw new Error('fixture : la catégorie n‘est pas vide de disponibles');
    const autres=m.roster.filter(o=>o.div==='H-middle');
    if(autres.filter(o=>mgmtAvailable(m,o)).length<2) throw new Error('fixture : voisine pas assez garnie, prendre une autre graine');
  })()`);
  win.eval(`G.screen='mgmt_organisation'; render();`);
  const html = win.document.getElementById('app').innerHTML;
  const tiles=mgmtOrgTiles(html);
  assert.equal(tiles.length, 12, 'les douze catégories de l’UFC sont affichées');
  const legere=tiles.filter(t=>t.nm==='Poids léger');
  assert.equal(legere.length, 1, 'une seule tuile « Poids léger »');
  assert.ok(legere[0].thin&&legere[0].sub.includes('effectif trop mince'),
    'la catégorie vidée porte le constat « effectif trop mince »');
  const moyenne=tiles.filter(t=>t.nm==='Poids moyen');
  assert.equal(moyenne.length, 1, 'une seule tuile « Poids moyen »');
  assert.ok(!moyenne[0].thin&&!moyenne[0].sub.includes('effectif trop mince'),
    'une catégorie encore composable ne porte pas le constat');
  assert.ok(moyenne[0].sub.includes('disponibles'), 'la catégorie lisible dit ses disponibles');
  /* Le nombre « dans le top 15 mondial », dérivé à la lecture — vérifié
     contre la loi du classement, pas contre le rendu : les 15 premiers du
     classement mondial (portée « world »), filtrés sur le roster. */
  const attendus=JSON.parse(win.eval(`JSON.stringify((function(){
    const m=G.mgmt;
    const dedansH=new Set(m.roster.filter(o=>o&&o.div==='H-light'&&!mgmtIsRetired(o)).map(o=>o.id));
    const dedansM=new Set(m.roster.filter(o=>o&&o.div==='H-middle'&&!mgmtIsRetired(o)).map(o=>o.id));
    return {
      legere:mgmtDivisionRanking(G.mgmt,'H-light','world').slice(0,15)
        .filter(r=>dedansH.has(r.id)).length,
      moyenne:mgmtDivisionRanking(G.mgmt,'H-middle','world').slice(0,15)
        .filter(r=>dedansM.has(r.id)).length,
    };
  })())`));
  assert.ok(moyenne[0].sub.includes(`${attendus.moyenne} dans le top 15 mondial`),
    'le top 15 mondial se lit sur la tuile');
  assert.ok(legere[0].sub.includes(`${attendus.legere} dans le top 15 mondial`),
    'le top 15 mondial se lit aussi sur la catégorie mince (la suspension ne retire pas du classement)');
  /* Deux groupes titrés : hommes (8 catégories) puis femmes (4).
     Décision d'Anthony du 28/09/2026 : dans le management, une catégorie
     féminine s'affiche « … féminin » (MGMT_DIVISION_FEMININ). */
  assert.equal((html.match(/mgmt-org-hd/g)||[]).length, 2, 'deux titres de groupe');
  assert.ok(html.indexOf('Hommes')>=0&&html.indexOf('Femmes')>=0, 'les groupes hommes et femmes sont titrés');
  assert.ok(html.indexOf('Hommes')<html.indexOf('Femmes')
    &&html.indexOf('Femmes')<html.indexOf('Poids paille'),
    'les catégories de femmes suivent le groupe « Femmes »');
  assert.equal(tiles.indexOf(tiles.find(t=>t.nm==='Poids paille féminin')), 8,
    'les huit catégories d’hommes précèdent les quatre de femmes');
  assert.ok(tiles.slice(8).every(t=>['Poids paille féminin','Poids mouche féminin','Poids coq féminin','Poids plume féminin'].includes(t.nm)),
    'le groupe des femmes porte ses quatre catégories, au libellé féminin');
  assert.ok(tiles.slice(0,8).every(t=>!t.nm.includes('féminin')),
    'aucune catégorie d’hommes ne porte le libellé féminin');
});

test('MGMT T7 — les recettes des dernières soirées, telles qu’elles existent ; rien d’inventé', () => {
  const win = newGameWindow();
  freshState(win,79);
  win.eval(`(function(){ const m=G.mgmt; m.treasury=-12; m.recettes=[120,-40]; })()`);
  win.eval(`G.screen='mgmt_organisation'; render();`);
  const html = win.document.getElementById('app').innerHTML;
  assert.ok(win.document.getElementById('app').textContent.includes(win.eval('mgmtEuros(-12)')), 'la trésorerie sous zéro se lit telle quelle (un seul solde, QO-5)');
  assert.ok(html.includes('Dernières soirées'), 'la ligne des recettes apparaît');
  assert.ok(win.document.getElementById('app').textContent.includes(win.eval('mgmtEuros(-40)+" · +"+mgmtEuros(120)')), 'les deux recettes mémorisées, la plus récente d’abord, sans aucun chiffre inventé');
  /* Aucune soirée jouée : la ligne de soirées n'apparaît pas (ce qui
     n'existe pas n'apparaît pas). */
  const win2 = newGameWindow();
  freshState(win2,80);
  assert.equal(JSON.stringify(win2.eval('G.mgmt.recettes')), '[]', 'aucune recette avant la première soirée');
  win2.eval(`G.screen='mgmt_organisation'; render();`);
  const html2 = win2.document.getElementById('app').innerHTML;
  assert.ok(!html2.includes('Dernières soirées'), 'aucune ligne de soirées avant la première soirée');
});
