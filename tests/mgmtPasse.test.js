"use strict";
/* CAGE LEGACY — tests/mgmtPasse.test.js
   ===========================================================================
   Monde lot 1 T3 et T4 (docs/lots/MONDE-LOT-1-T3.md) : la génération des six ans
   (mgmt-passe.js, ancre MONDE_LOT1_T3_PASSE) et le passage de témoin. Durée réduite
   (PASSE_N soirées) ; les six ans complets sont dans mgmtPasseSixAns.test.js.
   =========================================================================== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { newGameWindow } = require('./helpers/loadGame');
const jouerSoirees = require('./helpers/jouerSoirees');

const PASSE_N = 3;
const GRAINE = 20261008;

/** Une partie au passé généré d'un coup (durée réduite), dans sa fenêtre. */
function partiePassee(graine, org, n) {
  const win = newGameWindow({ runMain: true });
  win.eval(`setSeed(${graine}); mgmtPasseGenerer(${JSON.stringify(org || 'split')},{soirees:${n || PASSE_N}});`);
  return win;
}
/** Une même partie, créée deux fois à la même graine, et une troisième à une autre : partagées par les tests. */
const A = partiePassee(GRAINE);
const B = partiePassee(GRAINE);
const C = partiePassee(GRAINE + 1);
const json = win => win.eval('JSON.stringify(G.mgmt)');
/* Renumérotation de version à la fusion du lot 8 (12/10/2026) : la partie neuve porte maintenant `visites:{}` (monde lot 8 T1) ; l'empreinte est calculée sans ce champ, les empreintes d'avant restent donc valables. */
const sansVisites = j => { const o = JSON.parse(j); delete o.visites; return JSON.stringify(o); };

/* ===================== Test 1 : la création sans passé n'a pas bougé (point A) ===================== */
test('Monde lot 1 T3 — une partie créée sans le passé est identique à celle d\'avant la tranche (empreinte)', () => {
  /* Monde lot 9 T3 (DÉCISION du 15/10/2026, le stade) : chaque compte de soirée garde sa salle et son taux de remplissage ; empreintes des parties jouées recalculées, celles de création inchangées. */
  /* Empreintes relevées AVANT la tranche (commit 6417e12), la version de sauvegarde mise à 0 : seul le numéro de version a bougé.
     Décision du lot 2 T2 : le tirage des pays et des noms (mgmtOrgPaysPoids, mgmtPaysTire, MGMT_NOMS_AJOUTS) change les empreintes
     de création ; recalculées le 12/10/2026. La vraie propriété reste : même graine → même résultat (test 2), et sans option
     de passé, aucun effet de passé (mgmtNewRoster(m,{}) = mgmtNewRoster(m), ci-dessous). */
  /* Décision du lot 8 T4a/T4b (14/10/2026) : les événements de coût petit écrivent de nouveaux faits (top15, challenger, caps de règne, nom de la blessure…) à la création et pendant les soirées : les empreintes de l'état complet sont recalculées ; la propriété gardée est inchangée (déterminisme, aucun état annexe). */
  const AVANT = {
    'split|20261008': '31abaa7c00b38434', 'split|20261009': '82a96070f0d2b745',
    'ultimate-rim|20261008': 'b70e328738b18c86', 'ultimate-rim|20261009': 'edeb7ea7b9ca440b',
    'fighting-pacific-championship|20261008': 'f134107bbe74c713', 'fighting-pacific-championship|20261009': '0f29d777f2ba79d7',
    jouee3: '3dc06fc62c206aa8',
  };
  const win = newGameWindow({ runMain: true });
  const sha = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 16);
  for (const cle of Object.keys(AVANT)) {
    if (cle === 'jouee3') continue;
    const [org, graine] = cle.split('|');
    const j = win.eval(`(function(){ setSeed(${graine}); const m=mgmtDefault(${JSON.stringify(org)}); m.graine=mgmtGraineNeuve(); mgmtNewRoster(m); mgmtNewPile(m); G={theme:'dark',mgmt:m}; mgmtAgendaInit(m); m.v=0; return JSON.stringify(m);})()`);
    assert.equal(sha(sansVisites(j)), AVANT[cle], 'création sans passé inchangée : ' + cle);
  }
  win.eval(`setSeed(777); (function(){const m=mgmtDefault('split'); m.graine=mgmtGraineNeuve(); mgmtNewRoster(m); mgmtNewPile(m); G={theme:'dark',mgmt:m}; mgmtAgendaInit(m);})()`);
  jouerSoirees(win, 3);
  assert.equal(sha(sansVisites(win.eval('(function(){const m=G.mgmt; m.v=0; return JSON.stringify(m);})()'))), AVANT.jouee3, 'trois soirées de l\'aide de test : inchangées');
  /* Une option vide ou absente ne change rien non plus. */
  const sans = win.eval(`(function(){ setSeed(5); const m=mgmtDefault('split'); mgmtNewRoster(m); return JSON.stringify(m.roster);})()`);
  const vide = win.eval(`(function(){ setSeed(5); const m=mgmtDefault('split'); mgmtNewRoster(m,{}); return JSON.stringify(m.roster);})()`);
  assert.equal(sans, vide, 'mgmtNewRoster(m,{}) = mgmtNewRoster(m)');
});

/* ===================== Test 2 : la même graine, le même passé ===================== */
test('Monde lot 1 T3 — deux créations avec la même graine donnent le même passé', () => {
  assert.equal(json(A), json(B), 'même graine : même partie, octet pour octet');
  assert.notEqual(json(A), json(C), 'une autre graine donne un autre passé');
  const ids = win => win.eval('JSON.stringify(G.mgmt.hist.map(h=>[h.a.id,h.b.id,h.winner,h.c]))');
  assert.equal(ids(A), ids(B));
});

/* ===================== Test 3 : par pas ===================== */
test('Monde lot 1 T3 — le passé est joué par pas : k sur N, sans écran, sans écriture dans l\'emplacement', () => {
  const win = newGameWindow({ runMain: true });
  const r = JSON.parse(win.eval(`JSON.stringify((function(){
    setSeed(${GRAINE});
    const cle=mgmtSlotKey(MGMT_SLOT);
    const m=mgmtPassePreparer('split',{soirees:2});
    const out={enCours0:m.passe.enCours,g:G.mgmt===m,sansSoiree:m.eventsPlayed,pas:[],ecrit:[]};
    for(let k=0;k<2;k++){ const s=mgmtPasseSoiree(m,k); out.pas.push([s.k,s.n,s.termine,s.jouee,typeof s.annee]); out.ecrit.push(stockageLire(cle)); }
    out.enCours1=m.passe.enCours; out.valideEnCours=validateMgmt(m);
    mgmtPasseCloturer(m);
    out.enCours2=m.passe.enCours; out.valide=validateMgmt(m); out.ev=m.eventsPlayed; out.second=mgmtPasseCloturer(m)===m;
    return out; })())`));
  assert.equal(r.enCours0, true); assert.equal(r.g, true); assert.equal(r.sansSoiree, 0);
  assert.deepEqual(r.pas, [[1, 2, false, true, 'number'], [2, 2, true, true, 'number']]);
  assert.deepEqual(r.ecrit, [null, null], 'rien n\'est écrit dans l\'emplacement pendant la génération');
  assert.equal(r.enCours1, true); assert.equal(r.valideEnCours, true);
  assert.equal(r.enCours2, undefined); assert.equal(r.valide, true); assert.equal(r.ev, 2); assert.equal(r.second, true);
});

/* ===================== Test 4 : les dates (point D) ===================== */
test('Monde lot 1 T3 — les dates : le passé avant 2027, le premier jour du joueur au 12 janvier 2027', () => {
  const r = JSON.parse(A.eval(`JSON.stringify((function(){
    const m=G.mgmt, an=j=>new Date(MGMT_CALENDRIER_DEBUT+j*86400000).getUTCFullYear();
    return {jour:m.cal.jour,vie:m.cal.vieJour,date:mgmtJourDate(m.cal.jour),faites:m.cal.faites.map(f=>f.jour),annees:m.cal.faites.map(f=>an(f.jour)),
      n:m.cal.faites.map(f=>f.n),prochaines:m.cal.prochaines.length,passe:m.passe,ev:m.eventsPlayed,
      jourN:[1,2,3].map(n=>mgmtAgendaJour(m,n)),joueur:mgmtSoireesJoueur(m)};})())`));
  assert.equal(r.jour, 0); assert.equal(r.vie, 0);
  assert.deepEqual([r.date.jour, r.date.mois], [12, 'JANVIER']);
  assert.deepEqual(r.faites, [-105, -70, -35]);
  assert.ok(r.annees.every(a => a === 2026), 'trois soirées de 35 jours avant le 12 janvier 2027 : toutes en 2026');
  assert.deepEqual(r.n, [1, 2, 3]);
  /* ==== [ANCRE: MONDE_LOT5_T1_TEST_AGENDA_PASSE] — Monde lot 5 T1 ==== */
  assert.equal(r.prochaines, 1);
  assert.equal(r.passe.soirees, PASSE_N); assert.equal(r.passe.origineJours, 35 * (PASSE_N + 1));
  assert.equal(r.ev, PASSE_N); assert.equal(r.joueur, 0, 'le joueur n\'a encore joué aucune soirée');
  assert.deepEqual(r.jourN, [-105, -70, -35]);
  /* Au-delà des 24 soirées gardées dans l'agenda, la date se retrouve par le décalage du passé (le rythme des 35 jours). */
  assert.equal(A.eval('(function(){const m=G.mgmt; m.cal.faites=[]; return [1,3].map(n=>mgmtAgendaJour(m,n)).join();})()'), '-105,-35');
  /* La clôture l'a déjà posée : l'appel de l'interface est un no-op. */
  const suiv = JSON.parse(A.eval(`JSON.stringify((function(){ const m=G.mgmt; return [mgmtAgendaSuivante(m),m.cal.prochaines[0].jour]; })())`));
  assert.deepEqual(suiv, [false, 35]);
});

/* ===================== Test 5 : le monde extérieur (point I) ===================== */
test('Monde lot 1 T3 — le monde extérieur a avancé d\'autant de cycles que de soirées', () => {
  const r = JSON.parse(A.eval(`JSON.stringify((function(){
    const m=G.mgmt;
    return {cycle:m.cycle,soirees:m.eventsPlayed,ext:m.exterieur.length,
      quotas:allDivisions().every(d=>mgmtWorldLivingCount(m,d.id)>=mgmtWorldQuota(m,d.id)),
      tropTard:m.exterieur.filter(e=>e.born>m.cycle).length,
      neuf:m.exterieur.filter(e=>e.born>0).length};})())`));
  assert.equal(r.cycle, r.soirees + 1, 'un cycle par soirée, plus l\'ouverture');
  assert.equal(r.quotas, true, 'chaque catégorie porte son quota de vivants');
  assert.equal(r.tropTard, 0);
});

/* ===================== Tests 6 et 7 : le passage de témoin (T4) ===================== */
test('Monde lot 1 T4 — la caisse, la popularité et les salles du premier jour sont celles du profil', () => {
  const r = JSON.parse(A.eval(`JSON.stringify((function(){
    const m=G.mgmt, p=mgmtOrgProfil(m);
    setSeed(1); const n=mgmtDefault('split'); n.graine=m.graine; mgmtNewRoster(n); mgmtNewPile(n); const g=G.mgmt; G.mgmt=n; mgmtAgendaInit(n); G.mgmt=g;
    return {t:m.treasury,tp:p.caisse,pop:m.pop,pp:Math.round(p.popularite),salles:JSON.stringify(m.salles)===JSON.stringify(mgmtSallesCreer(m)),
      memeSalles:JSON.stringify(m.salles)===JSON.stringify(n.salles),nt:n.treasury,npop:n.pop,
      comptes:m.comptes.length,recettes:m.recettes.length,audiences:m.audiences.length,lastEvent:m.lastEvent};})())`));
  assert.equal(r.t, r.tp); assert.equal(r.t, r.nt, 'la caisse d\'une partie sans passé');
  assert.equal(r.pop, r.pp); assert.equal(r.pop, r.npop);
  assert.equal(r.salles, true); assert.equal(r.memeSalles, true);
  assert.deepEqual([r.comptes, r.recettes, r.audiences, r.lastEvent], [0, 0, 0, null]);
  /* Une organisation à la caisse et à la popularité différentes. */
  const rim = partiePassee(GRAINE, 'ultimate-rim', 2);
  const q = JSON.parse(rim.eval('JSON.stringify({t:G.mgmt.treasury,p:mgmtOrgProfil(G.mgmt).caisse,pop:G.mgmt.pop,pp:Math.round(mgmtOrgProfil(G.mgmt).popularite)})'));
  assert.equal(q.t, q.p); assert.equal(q.pop, q.pp);
});

test('Monde lot 1 T4 — les contrats, blessures, attentes, ceintures et historique sont conservés', () => {
  const win = newGameWindow({ runMain: true });
  const r = JSON.parse(win.eval(`JSON.stringify((function(){
    setSeed(${GRAINE});
    const m=mgmtPassePreparer('split',{soirees:2});
    for(let k=0;k<2;k++) mgmtPasseSoiree(m,k);
    /* ==== [ANCRE: MONDE_LOT5_T1_TEST_PROMOTION_HERITEE] — Monde lot 5 T1 ==== */
    /* Fiche §3.21 et §11 : mgmtBookMain conserve ses promotions ; seul le corps médical/contractuel reste identique. */
    const promotions=m.roster.map(f=>({id:f.id,level:f.level,raison:f.raison,interactions:f.interactions}));
    const corps=()=>JSON.stringify(m.roster.map(f=>[f.id,f.ct||null,!!f.libre,f.trauma||0,f.traumaFloor||0,f.susp||0,f.retired||null,f.lastCycle||0]));
    /* ==== [ANCRE: MONDE_LOT5_T6_FAITS_CONSERVES] — Monde lot 5 T6 ==== */
    /* décision du 13/10/2026 : le lot 5 ajoute des faits d'héritage à la clôture.
       T2 recale aussi d : même demande, nouvel index après filtrage. */
    const indices=new Map(), faits=[];
    m.facts.forEach((x,i)=>{if(!MGMT_PASSE_FAITS_PERDUS.includes(x.k)){indices.set(i,faits.length);faits.push(x);}});
    const faitsAttendus=faits.map(x=>{
      const demande=Number.isSafeInteger(x.d)&&m.facts[x.d];
      return ['promesse','refus'].includes(x.k)&&demande&&demande.k==='demande'?Object.assign({},x,{d:indices.get(x.d)}):x;
    });
    const avant={corps:corps(),histResume:JSON.stringify(m.hist.map(t=>[t.c,t.slot,t.a.id,t.b.id,t.winner,t.family,t.round,t.rounds,t.a.W,t.a.L,t.b.W,t.b.L])),factsGardes:JSON.stringify(faitsAttendus),titres:JSON.stringify(allDivisions().map(d=>(mgmtSplitTitle(m,d.id)||{}).id||null)),pile:JSON.stringify(m.pile),cycle:m.cycle,fil:m.fil?m.fil.length:0};
    const ageAvant=m.roster.map(f=>f.age).join();
    mgmtPasseCloturer(m);
    /* Monde lot 1 T5 (fiche MONDE-LOT-1-T5 §3) : à la clôture les combats s'allègent (mêmes combattants, même issue) et les faits perdus (contrats, départs, attentes) sont écartés ; tout le reste est conservé. */
    const resume=h=>JSON.stringify(h.map(t=>[t.c,t.slot,t.a.id,t.b.id,t.winner,t.family,t.round,t.rounds,t.a.W,t.a.L,t.b.W,t.b.L]));
    const engages=new Set(m.card.main.flatMap(cf=>[cf.a,cf.b]));
    const promotion=promotions.every(p=>{const f=mgmtFighterById(m,p.id);
      if(!engages.has(p.id)) return f.level===p.level&&f.raison===p.raison&&f.interactions===p.interactions;
      const interactions=(Number.isSafeInteger(p.interactions)?p.interactions:0)+1;
      return f.interactions===interactions&&f.level===(interactions>=3?3:Math.max(2,p.level))&&
        (p.level<2?MGMT_RAISONS.some(r=>r.id===f.raison):f.raison===p.raison);});
    return {corps:corps()===avant.corps,hist:resume(m.hist)===avant.histResume,facts:JSON.stringify(m.facts)===avant.factsGardes,
      promotion,
      titres:JSON.stringify(allDivisions().map(d=>(mgmtSplitTitle(m,d.id)||{}).id||null))===avant.titres,pile:JSON.stringify(m.pile)===avant.pile,
      cycle:m.cycle===avant.cycle,fil:(m.fil?m.fil.length:0)===avant.fil,nbHist:m.hist.length,nbFacts:m.facts.length,
      sous:m.roster.filter(f=>f.ct).length,n:m.roster.length,vieilli:m.roster.map(f=>f.age).join()!==ageAvant}; })())`));
  for (const k of ['corps', 'hist', 'facts', 'titres', 'pile', 'cycle', 'fil', 'promotion']) assert.equal(r[k], true, 'conservé : ' + k);
  assert.ok(r.nbHist > 0 && r.nbFacts > 0, 'l\'histoire existe');
  assert.ok(r.sous > 0, 'des contrats sont en cours');
});

/* ==== [ANCRE: MONDE_LOT5_T6_TEST_RECLAMATIONS] — Monde lot 5 T6 ==== */
test('Monde lot 5 T6 — répondre à une demande ne retire pas son combat du booking porté', () => {
  const win = newGameWindow({ runMain: true });
  try {
    const r = JSON.parse(win.eval(`JSON.stringify((function(){
      setSeed(${GRAINE}); const m=mgmtPassePreparer('split',{soirees:2});
      m.facts=[];
      const candidats=mgmtCartRows(m).filter(f=>!f.libre&&mgmtContratRestants(f)>1&&mgmtSelectable(m,f,null));
      const a=candidats.find(a=>candidats.some(b=>b.id!==a.id&&b.div===a.div&&mgmtSelectable(m,b,a.id)&&mgmtAvailable(m,a,b)));
      const b=candidats.find(b=>b.id!==a.id&&b.div===a.div&&mgmtSelectable(m,b,a.id)&&mgmtAvailable(m,a,b));
      mgmtAddFact(m,{c:m.cycle,k:'demande',a:a.id,want:'revanche',target:b.id});
      const reclame=mgmtPublicReclame(m).some(r=>r.a===a.id&&r.b===b.id);
      const s=mgmtPredecesseurSoiree(m,0,{demandes:true});
      return {reclame,jouee:s.jouee,reclames:s.reclames,
        reponse:m.facts.filter(x=>x.k==='promesse'&&x.d===0).length,
        combat:m.hist.some(h=>h.slot==='main'&&h.a.id===a.id&&h.b.id===b.id),
        ouverte:mgmtDemandesOuvertes(m).some(d=>d.i===0)};
    })())`));
    assert.equal(r.reclame, true); assert.equal(r.jouee, true);
    assert.equal(r.reclames, 1); assert.equal(r.reponse, 1);
    assert.equal(r.combat, true); assert.equal(r.ouverte, false);
  } finally { win.close(); }
});

/* ===================== Test 8 : un champion par catégorie ===================== */
test('Monde lot 1 T4 — chaque catégorie a un champion au premier jour', () => {
  const r = JSON.parse(A.eval(`JSON.stringify(allDivisions().map(d=>{const c=mgmtSplitTitle(A_M(),d.id); return c&&c.id?1:0;}))`.replace('A_M()', 'G.mgmt')));
  assert.equal(r.length, 12);
  assert.ok(r.every(x => x === 1), 'les douze catégories ont un champion');
});

/* ===================== Test 9 : une sauvegarde d'avant ===================== */
test('Monde lot 1 T3 — une sauvegarde 14 se charge, se valide et joue une soirée', () => {
  const win = newGameWindow({ runMain: true });
  const r = JSON.parse(win.eval(`JSON.stringify((function(){
    setSeed(${GRAINE});
    const m=mgmtDefault('split'); m.graine=mgmtGraineNeuve(); mgmtNewRoster(m); mgmtNewPile(m); G={theme:'dark',mgmt:m}; mgmtAgendaInit(m);
    const brut=JSON.parse(JSON.stringify(m)); brut.v=14;
    const mig=mgmtParseAndValidate(JSON.stringify(brut));
    const ok={charge:!!mig,v:mig&&mig.v,sansPasse:mig&&mig.passe===undefined};
    G.mgmt=mgmtRepair(mig);
    const s=mgmtPredecesseurSoiree(G.mgmt,0);
    ok.jouee=s.jouee; ok.ev=G.mgmt.eventsPlayed; ok.valide=validateMgmt(G.mgmt); ok.joueur=mgmtSoireesJoueur(G.mgmt);
    const avecPasse=JSON.parse(JSON.stringify(G.mgmt)); avecPasse.passe={soirees:-3};
    ok.refuse=validateMgmt(avecPasse); return ok; })())`));
  assert.equal(r.charge, true); assert.equal(r.v, win.eval('MGMT_SAVE_VERSION')); assert.equal(r.sansPasse, true);
  assert.equal(r.jouee, true); assert.equal(r.ev, 1); assert.equal(r.valide, true); assert.equal(r.joueur, 1);
  assert.equal(r.refuse, false, 'un passé mal formé est refusé');
});

/* ===================== Test 10 : les premières fois du joueur ===================== */
test('Monde lot 1 T3 — les « premières fois » comptent les soirées du joueur, pas celles du passé', () => {
  const r = JSON.parse(A.eval(`JSON.stringify((function(){
    const m=G.mgmt; const avant=mgmtPriseMoment(m,'mgmt_carte');
    return {joueur:mgmtSoireesJoueur(m),joues:m.eventsPlayed,moment:avant,demo:typeof mgmtDemoTerminee==='function'?mgmtDemoTerminee(m):null};})())`));
  assert.equal(r.joueur, 0); assert.equal(r.joues, PASSE_N);
  assert.notEqual(r.moment, 'premier_lendemain');
  assert.notEqual(r.demo, true);
});

/* ===================== Test 11 : l'écran ===================== */
test('Monde lot 1 T3 — l\'écran montre la barre, avance pas à pas et ignore les touches', async () => {
  const win = newGameWindow({ runMain: true });
  win.eval(`setSeed(${GRAINE}); CL.mgmtNouvelle(2); MGMT_NOUVELLE.soirees=2; MGMT_NOUVELLE.i=0;`);
  const iAvant = win.eval('MGMT_NOUVELLE.i');
  win.eval('CL.mgmtNouvelleLancer()');
  const html0 = win.document.getElementById('app').innerHTML;
  assert.ok(html0.includes('mf-genese-barre'), 'la barre est là dès le lancement');
  assert.ok(html0.includes('Six années à vivre'));
  assert.ok(/SPLIT/i.test(html0) && /Année 20\d\d/.test(html0), 'le nom de l\'organisation et l\'année');
  assert.ok(!html0.includes('mf-voile') && !html0.includes('mf-dialogue'), 'aucune fenêtre par-dessus');
  win.eval('CL.mgmtNouvelleChoisir(3); CL.mgmtNouvelleDeplacer(1,0); CL.mgmtNouvelleRetour(); CL.mgmtNouvelleLancer();');
  assert.equal(win.eval('MGMT_NOUVELLE.i'), iAvant, 'les touches sont inactives pendant la génération');
  assert.equal(win.eval('G.screen'), 'mgmt_nouvelle');
  const vus = new Set();
  const debut = Date.now();
  while (Date.now() - debut < 170000) {
    await new Promise(r => setTimeout(r, 150));
    const h = win.document.getElementById('app').innerHTML;
    const m = /aria-valuenow="(\d+)"/.exec(h);
    if (m) vus.add(+m[1]);
    if (win.eval('!!(MGMT_NOUVELLE.gen&&MGMT_NOUVELLE.gen.pret)')) break;
  }
  assert.ok(vus.has(0) || vus.has(1), 'la barre a été vue en route : ' + [...vus]);
  /* Décision d'Anthony du 12/10/2026 : la partie attend le bouton « Entrer », elle ne s'ouvre plus toute seule. */
  assert.equal(win.eval('G.mgmt'), null, 'rien ne s\'ouvre tout seul');
  win.eval('CL.mgmtNouvelleEntrer()');
  assert.ok(win.eval('G.screen') !== 'mgmt_nouvelle', 'le joueur arrive sur l\'écran habituel : ' + win.eval('G.screen'));
  assert.equal(win.eval('G.mgmt.passe.soirees'), 2);
  assert.equal(win.eval('G.mgmt.passe.enCours'), undefined);
  assert.equal(win.eval('!!mgmtParseAndValidate(stockageLire(mgmtSlotKey(MGMT_SLOT)))'), true, 'la partie est enregistrée dans l\'emplacement');
  assert.equal(win.eval('G.mgmt.cal.prochaines.length'), 1, 'une soirée est posée au premier jour');
});

/* ===================== Test 12 : la vitesse ne change aucun résultat (point H) ===================== */
test('Monde lot 1 T3 — l\'optimisation du booking ne change aucun résultat', () => {
  /* Monde lot 9 T3 (DÉCISION du 15/10/2026, le stade) : chaque compte de soirée garde sa salle et son taux de remplissage ; empreintes des parties jouées recalculées, celles de création inchangées. */
  /* Empreintes de l'état complet (JSON de la partie, version à 0) après six soirées du prédécesseur, relevées AVANT l'optimisation
     (mgmtPickBulkPair, mgmtEligiblePairs et mgmtCartRows lisent une fois par combattant ce qu'ils lisaient une fois par paire). */
  /* Décision du lot 2 T2 : empreintes recalculées le 12/10/2026 (le tirage des pays et des noms décale le flux du RNG de création) ;
     la propriété gardée est inchangée : la version optimisée est déterministe et le calcul ne dépend d'aucun état annexe. */
  const AVANT = { 20261008: '9e5bc0b80e133ad2', 20261009: '828313974e842fe0' };
  const sha = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 16);
  for (const graine of Object.keys(AVANT)) {
    const win = newGameWindow({ runMain: true });
    const j = win.eval(`(function(){ setSeed(${graine}); const m=mgmtDefault('split'); m.graine=mgmtGraineNeuve(); mgmtNewRoster(m); mgmtExteriorEnsure(m); mgmtNewPile(m); G={theme:'dark',mgmt:m}; mgmtAgendaInit(m);
      for(let k=0;k<6;k++) mgmtPredecesseurSoiree(m,k); m.v=0; return JSON.stringify(m); })()`);
    assert.equal(sha(sansVisites(j)), AVANT[graine], 'six soirées, graine ' + graine + ' : état identique à celui d\'avant l\'optimisation');
  }
});
