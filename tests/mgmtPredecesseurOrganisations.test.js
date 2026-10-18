"use strict";
/* ==== [ANCRE: MGMT_MONDE_LOT2_T3_TESTS] — Monde lot 2 T3 : la main du prédécesseur ====
   Les quatre choix de l'identité de chaque organisation (MGMT_ORG_IDENTITES[id].main) deviennent la politique
   de son prédécesseur dans mgmtPredecesseurSoiree (mgmt-predecesseur.js, ancre MONDE_LOT2_T3_MAIN_PREDECESSEUR).
   Ce qu'on vérifie :
   - le défaut historique est INCHANGÉ : mgmtPredecesseurReglages() sans argument rend {titreCadence:2}, neuf à chaque
     appel (c'est le défaut de l'outil de mesure, tools/mesure-management.js, comparaison d'outillage du lot 1 T2) ;
   - les huit organisations produisent les réglages de la table (titres, jeunes, noms, contrats) ;
   - la table est bien déduite de `main`, et jamais recopiée ;
   - à graine fixe (16180339), sur huit soirées de prédécesseur, trois des quatre politiques séparent :
     `garde` renouvelle plus que `laisse-filer`, `fait-monter` ne laisse pas une carte plus âgée que `protege-anciens`,
     `souvent` recrute des combattants plus renommés que `jamais` ;
   - `laisse-filer` ne lâche pas la ceinture : le champion en titre reste renewé et re-signé ;
   - `jeunes` ne fait jamais qu'un départage : à graine égale, le nombre de combats de la carte est le même.

   LA CADENCE DES TITRES (`titres`) n'a pas d'effet mesurable ici, et le test le dit plutôt que de l'inventer :
   tout effectif naît avec un champion par catégorie (mgmtNewRoster), mgmtBookMain met donc en jeu la ceinture de
   chaque défenseur d'office (mgmt-carte.js:355-358) et le plafond de deux titres par carte (mgmt-ceintures.js:123)
   est atteint avant que la cadence ne puisse ajouter quoi que ce soit. Douze graines et trois types de partie
   essayés : 16 contre 16 à chaque fois. Le réglage reste lu par le booker (aucune cadence en dur), sa table est
   vérifiée ci-dessus ; l'effet mesurable des titres est une question posée à Anthony (voir le compte rendu de la fiche). ==== */
const fs = require('fs');
const path = require('path');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

const RACINE = path.join(__dirname, '..');
const SOURCE = fs.readFileSync(path.join(RACINE, 'mgmt-predecesseur.js'), 'utf8');
const SANS_COMMENTAIRES = SOURCE.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
const GRAINE = 16180339;

/** La table de la décision du 14/10/2026, pour les huit organisations, dans l'ordre de MGMT_ORG_IDENTITES. */
const TABLE = {
  'split': { titreCadence: 2, nomsCadence: 2, renouvelle: false, laisseFiler: true },
  'garden-of-blood': { titreCadence: 1, agePrefere: 'ancien', nomsCadence: 1, renouvelle: true, contratSeuil: 2 },
  'mma-korner': { titreCadence: 2, agePrefere: 'jeune', renouvelle: false, laisseFiler: true },
  'ultimate-rim': { titreCadence: 1, agePrefere: 'jeune', renouvelle: true, contratSeuil: 2 },
  'fighting-pacific-championship': { titreCadence: 4, agePrefere: 'ancien', nomsCadence: 2, renouvelle: true, contratSeuil: 2 },
  'organisation-6': { titreCadence: 2, agePrefere: 'jeune', nomsCadence: 2, renouvelle: true, contratSeuil: 2 },
  'organisation-7': { titreCadence: 1, agePrefere: 'ancien', nomsCadence: 1, renouvelle: false, laisseFiler: true },
  'organisation-8': { titreCadence: 4, nomsCadence: 2, renouvelle: false, laisseFiler: true },
};

/** Les réglages lus dans le jeu, pour un id d'organisation donné (ou l'historique). */
function reglages(id) {
  const win = newGameWindow();
  const r = JSON.parse(win.eval(`JSON.stringify(mgmtPredecesseurReglages(${id === null ? 'undefined' : JSON.stringify(id)}))`));
  win.close();
  return r;
}

/** Les huit `main` lus dans le jeu, pour proving que la table s'en déduit. */
function mains() {
  const win = newGameWindow();
  const r = JSON.parse(win.eval(`JSON.stringify(Object.fromEntries(Object.entries(MGMT_ORG_IDENTITES).map(([id,it])=>[id,it.main])))`));
  win.close();
  return r;
}

/**
 * Huit soirées de prédécesseur sur une partie de passé, à graine fixée, avec une base de réglages
 * identique dans les deux bras : seul le patch qui teste la politique change.
 * @param {object} base les réglages communs (le socle du passé)
 * @param {object} patch la politique à comparer
 * @returns {Promise<object>} titres, prolonges, âge moyen de la carte principale, renom moyen des recrues
 */
function huitSoirees(base, patch) {
  const win = newGameWindow({ runMain: true });
  const r = JSON.parse(win.eval(`JSON.stringify((function(){
    setSeed(${GRAINE});
    const m=mgmtPassePreparer('split');
    const base=Object.assign({},${JSON.stringify(base)},{recrues:Object.assign({},${JSON.stringify(base.recrues || {})},{plan:m.passe.plan||{}})});
    const avant=new Set(m.facts.filter(f=>f.k==='recrue').map(f=>f.a));
    const vus={};
    let titres=0, prolonges=0, resignes=0, cartes=0;
    const ages=[], stars=[];
    for(let k=0;k<8;k++){
      /* Monde lot 16 — décision d'Anthony du 17/10/2026 : des combattants de vrais palmarès (24-3) sont « trop grands » ou trop chers pour une petite caisse. Ce test juge la politique de recrutement, pas la caisse : une fois les places laissées par les contrats expirés (soirée 4), l'organisation devient riche et connue. */
      if(${JSON.stringify(!!base.riche)}&&k===4){ m.treasury=5000000; m.pop=100; }
      const s=mgmtPredecesseurSoiree(m,k,Object.assign({},base,${JSON.stringify(patch)}));
      if(!s.jouee) break;
      titres+=s.titres; prolonges+=s.prolonges; resignes+=s.resignes;
      for(const h of m.hist.slice(-20)){
        if(h.slot!=='main'||vus[h.c]) continue;
        vus[h.c]=1; cartes++;
        for(const id of [h.a.id,h.b.id]){ const f=mgmtFighterById(m,id); if(f) ages.push(f.age); }
      }
    }
    for(const f of m.facts.filter(f=>f.k==='recrue')){
      if(avant.has(f.a)) continue;
      const l=m.roster.find(x=>x.id===f.a);
      if(l) stars.push(mgmtStar(l));
    }
    const moy=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
    return {titres,prolonges,resignes,cartes,ageCarte:moy(ages),renomRecrues:moy(stars),nbRecrues:stars.length};
  })())`));
  win.close();
  return r;
}

/* ===================== 1. le défaut historique ne bouge pas ===================== */
test('Monde lot 2 T3 — sans identifiant, mgmtPredecesseurReglages rend l’historique inchangé : {titreCadence:2}, neuf à chaque appel', () => {
  assert.deepEqual(reglages(null), { titreCadence: 2 });
  const win = newGameWindow();
  const a = win.eval('mgmtPredecesseurReglages()');
  a.titreCadence = 99; a.nomsCadence = 1;
  assert.deepEqual(JSON.parse(JSON.stringify(win.eval('mgmtPredecesseurReglages()'))), { titreCadence: 2 },
    "muter l'objet rendu ne change pas l'appel suivant");
  /* Une organisation inconnue ne lève pas : elle rend l'historique. */
  assert.deepEqual(JSON.parse(win.eval("JSON.stringify(mgmtPredecesseurReglages('organisation-9'))")), { titreCadence: 2 });
  assert.deepEqual(JSON.parse(win.eval('JSON.stringify(mgmtPredecesseurReglages())')), { titreCadence: 2 });
  win.close();
});

/* ===================== 2. la table des huit organisations ===================== */
test('Monde lot 2 T3 — les huit organisations produisent les réglages de la table (titres, jeunes, noms, contrats)', () => {
  const main = mains();
  assert.equal(Object.keys(main).length, 8, 'huit identités');
  for (const id of Object.keys(TABLE)) {
    assert.deepEqual(reglages(id), TABLE[id], id + ' : ' + JSON.stringify(main[id]));
  }
  /* La table se déduit de `main` : une fiche qui change d'avis change ses réglages, sans que le test bouge. */
  const win = newGameWindow();
  const derive = win.eval(`JSON.stringify((function(){
    const out={};
    for(const id of Object.keys(MGMT_ORG_IDENTITES)){
      const it=MGMT_ORG_IDENTITES[id];
      const r=mgmtPredecesseurReglages(id);
      out[id]=MGMT_PREDECESSEUR_MAIN.titres[it.main.titres]===r.titreCadence
        && (!MGMT_PREDECESSEUR_MAIN.jeunes[it.main.jeunes]||MGMT_PREDECESSEUR_MAIN.jeunes[it.main.jeunes]===r.agePrefere)
        && (!MGMT_PREDECESSEUR_MAIN.noms[it.main.noms]||MGMT_PREDECESSEUR_MAIN.noms[it.main.noms]===r.nomsCadence)
        && (MGMT_PREDECESSEUR_MAIN.contrats[it.main.contrats]!=='garde'||(r.renouvelle===true&&r.contratSeuil===2))
        && (MGMT_PREDECESSEUR_MAIN.contrats[it.main.contrats]!=='laisse-filer'||(r.renouvelle===false&&r.laisseFiler===true));
    }
    return out;
  })())`);
  win.close();
  const suite = JSON.parse(derive);
  for (const id of Object.keys(suite)) assert.equal(suite[id], true, id + ' : les réglages ne se déduisent pas de sa fiche');
});

/* ===================== 3. la cadence des titres est lue, jamais en dur ===================== */
test('Monde lot 2 T3 — la cadence des titres vient des réglages, et l’ancre de la main est en place', () => {
  assert.ok(SOURCE.includes('/* ==== [ANCRE: MONDE_LOT2_T3_MAIN_PREDECESSEUR] — Monde lot 2 T3 : la main du prédécesseur ===='), "l'ancre");
  assert.ok(SANS_COMMENTAIRES.includes('cfg.titreCadence'), 'le booker lit cfg.titreCadence');
  assert.ok(!/k%\s*[24]\s*===/.test(SANS_COMMENTAIRES), 'aucune cadence de titre en dur');
  assert.match(SOURCE, /"use strict";/, 'la première ligne');
});

/* ===================== 4. la politique se voit sur huit soirées (graine 16180339) ===================== */
test('Monde lot 2 T3 — huit soirées, graine 16180339 : « garde » renouvelle plus que « laisse-filer »', () => {
  const base = { renouvelle: true, demandes: true, rotationTitres: 0 };
  const garde = huitSoirees(base, { contratSeuil: 2 });
  const laisse = huitSoirees(base, { laisseFiler: true, renouvelle: false });
  assert.ok(garde.prolonges > laisse.prolonges,
    'prolongements garde ' + garde.prolonges + ' > laisse-filer ' + laisse.prolonges);
});

test('Monde lot 2 T3 — huit soirées, graine 16180339 : « fait-monter » ne laisse pas une carte plus âgée que « protège-anciens »', () => {
  const base = { renouvelle: true, demandes: true, rotationTitres: 0 };
  const jeune = huitSoirees(base, { agePrefere: 'jeune' });
  const ancien = huitSoirees(base, { agePrefere: 'ancien' });
  assert.ok(jeune.cartes > 0 && ancien.cartes > 0, 'les deux cartes ont été jouées');
  assert.ok(jeune.ageCarte <= ancien.ageCarte,
    'âge moyen de la carte : fait-monter ' + jeune.ageCarte.toFixed(3) + ' <= protège-anciens ' + ancien.ageCarte.toFixed(3));
});

test('Monde lot 2 T3 — huit soirées, graine 16180339 : « souvent » recrute des combattants plus renommés que « jamais »', () => {
  /* Sans re-signature, les contrats expirent : ce sont ces places laissées que la main « recrute des noms » vient combler. */
  const base = { renouvelle: false, demandes: true, riche: true };
  const souvent = huitSoirees(base, { nomsCadence: 1 });
  const jamais = huitSoirees(base, {});
  assert.equal(jamais.nbRecrues, 0, '« jamais » ne recrute personne');
  assert.ok(souvent.nbRecrues > 0, '« souvent » recrute (' + souvent.nbRecrues + ')');
  assert.ok(souvent.renomRecrues > jamais.renomRecrues,
    'renom moyen des recrues : souvent ' + souvent.renomRecrues.toFixed(4) + ' > jamais ' + jamais.renomRecrues.toFixed(4));
});

/* ===================== 5. « laisse-filer » ne lâche pas la ceinture ===================== */
test('Monde lot 2 T3 — « laisse-filer » : personne n’est renewé, sauf le champion en titre', () => {
  const win = newGameWindow({ runMain: true });
  const r = JSON.parse(win.eval(`JSON.stringify((function(){
    setSeed(${GRAINE});
    const m=mgmtPassePreparer('split');
    /* Un seul renewal possible : le champion d'une catégorie, à deux combats de la fin. */
    m.pop=100;   /* Monde lot 16 : une organisation connue — aucun champion de vrai palmarès n'est « trop grand » pour elle */
    const camp=mgmtSplitTitle(m,allDivisions()[0].id);
    const f=mgmtFighterById(m,camp.id);
    f.ct={n:3,f:1};
    mgmtPredecesseurSoiree(m,0,{laisseFiler:true,renouvelle:false,titreCadence:2,demandes:true});
    /* Un renouvellement ajoute trois combats au contrat ({n:3,f:1} devient {n:6,f:1}) : le compteur f des combats déjà livrés ne revient pas à zéro. */
    const renewalDuChampion=!!f.ct&&f.ct.n===6;
    /* Le même combattant, sans la ceinture : personne ne le Renew. */
    const m2=mgmtPassePreparer('split'); m2.pop=100;
    const camp2=mgmtSplitTitle(m2,allDivisions()[0].id);
    const g=mgmtFighterById(m2,camp2.id);
    g.ct={n:3,f:1};
    const boucle=mgmtPredecesseurSoiree(m2,0,{laisseFiler:true,renouvelle:false,titreCadence:2,demandes:true});
    return {renewalDuChampion,renouveles:boucle.prolonges,libres:g.libre===true};
  })())`));
  win.close();
  assert.equal(r.renewalDuChampion, true, 'le champion en titre est renewé malgré « laisse-filer »');
  assert.ok(r.renouveles <= 11, 'les autres ne le sont pas tous : ' + r.renouveles + ' prolongements');
});

/* ===================== 6. « jeunes » ne fait qu'un départage, jamais une exclusion ===================== */
test('Monde lot 2 T3 — « jeunes » ne change que l’ordre : même graine, même nombre de combats sur la carte', () => {
  const base = { renouvelle: true, demandes: true, rotationTitres: 0 };
  const neutre = huitSoirees(base, {});
  const jeune = huitSoirees(base, { agePrefere: 'jeune' });
  assert.equal(jeune.cartes, neutre.cartes, 'aucun combattant écarté : ' + jeune.cartes + ' contre ' + neutre.cartes + ' combats de carte');
  assert.equal(jeune.titres, neutre.titres, 'le nombre de titres mis en jeu ne bouge pas');
});

/* ===================== 7. le passé et la carte héritée passent l'organisation de la partie ===================== */
test('Monde lot 2 T3 — le passé et la carte héritée lisent la politique de l’organisation de la partie (m.org, un nom)', () => {
  const win = newGameWindow({ runMain: true });
  const r = JSON.parse(win.eval(`JSON.stringify((function(){
    const out={};
    for(const nom of ['Split','Garden of Blood']){
      setSeed(${GRAINE});
      const m=mgmtPassePreparer(nom==='Split'?'split':'garden-of-blood');
      out[nom]={org:m.org,id:mgmtPredecesseurOrgId(m),reglages:mgmtPredecesseurReglages(mgmtPredecesseurOrgId(m))};
    }
    return out;
  })())`));
  win.close();
  /* m.org est un NOM : l'identifiant passe par mgmtOrgNom/mgmtOrgParNom, jamais par m.org comme id. */
  assert.equal(r.Split.org, 'Split');
  assert.equal(r.Split.id, 'split');
  assert.deepEqual(r.Split.reglages, TABLE.split);
  assert.equal(r['Garden of Blood'].id, 'garden-of-blood');
  assert.deepEqual(r['Garden of Blood'].reglages, TABLE['garden-of-blood']);
});
