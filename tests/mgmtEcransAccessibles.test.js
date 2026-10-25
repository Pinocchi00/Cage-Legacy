"use strict";
/* CAGE LEGACY — tests/mgmtEcransAccessibles.test.js
   ===========================================================================
   Contrôle d'accessibilité du mode management (demande d'Anthony du 25/10/2026 :
   « que tous les écrans soient bien accessibles sans rencontrer de bug ») :
   - chaque écran du mode s'ouvre par la navigation réelle (CL.go) sur une partie
     avancée (monde vivant, soirées jouées, lendemain, carnet) sans lever d'erreur ;
   - le rendu n'est jamais vide et ne contient ni « undefined », ni « NaN »,
     ni « [object », ni « Infinity », ni texte de travail ;
   - chaque écran offre une sortie (touche Échap ou bouton de retour/section) ;
   - la même chose avec des noms très longs (27 lettres) : le rendu tient sans erreur.
   La mise en page (chevauchements, textes coupés, tailles) se contrôle à la capture :
   voir le script p1/audit.sh (hors dépôt) et docs/lots/MONDE-LOT-70-T1.md.
   ========================================================================== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');
const jouer = require('./helpers/jouerSoirees');

const INTERDIT = /undefined|NaN|\[object|Infinity|EMPLACEMENT AUTEUR|RÉPLIQUE MANQUANTE|TODO/;
/* Écrans qui exigent un contexte précis (adversaire, duo, démo) : contrôlés ailleurs. */
const EXCLUS = /^mgmt_(duo|demo|parties|nouvelle|confirmation|presentation|combat|soiree_avant)/;

function ouvrir(longs) {
  const w = newGameWindow({ runMain: true });
  w.eval(`(function(){
    setSeed(20261025);
    const m = mgmtPasseGenerer('split', { soirees: 3 });
    ${longs ? `const L=[['Maximiliano','Papadopoulos-Karageorgiadis'],['Bartholomeus','Vandenberghe-Oosterhuis']]; let i=0;
      const ren=f=>{ if(!f||typeof f!=='object')return; const [a,b]=L[i++%L.length]; f.first=a; f.last=b; f.name=a+' '+b; };
      (m.roster||[]).forEach(ren); Object.values(m.orgs||{}).forEach(o=>(o.roster||[]).forEach(ren));` : ''}
    if (typeof mgmtMondeVivantGenerer === 'function') mgmtMondeVivantGenerer(m, { soirees: 3 });
    if (typeof mgmtPosteInit === 'function' && !m.poste) mgmtPosteInit(m);
    G = { theme: 'dark', mgmt: m, screen: 'mgmt_accueil' };
  })()`);
  jouer(w, 1);
  return w;
}

function controler(longs) {
  const w = ouvrir(longs);
  const noms = JSON.parse(w.eval(`JSON.stringify(Object.keys(SCREENS).filter(k=>k.startsWith('mgmt_')))`)).filter(k => !EXCLUS.test(k));
  assert.ok(noms.length >= 25, 'les écrans du mode sont enregistrés');
  const rapport = [];
  for (const nom of noms) {
    let r;
    try {
      r = JSON.parse(w.eval(`(function(){
        const m = G.mgmt; G.screen = ${JSON.stringify(nom)};
        const nom = ${JSON.stringify(nom)};
        if (nom === 'mgmt_fiche') { CL.mgmtFiche(m.roster[0].id); }
        else if (nom === 'mgmt_discours') {
          if (typeof MGMT_REGLAGES !== 'undefined' && MGMT_REGLAGES.soiree) MGMT_REGLAGES.soiree.sansDiscours = false;
          const ids = m.roster.slice(0, 2).map(f => f.id);
          mgmtDiscoursEcran(m, { a: ids[0], interpelle: ids[1], ton: 'fier', motif: 'principal', lignes: ['Je remercie mon camp.', 'Ce soir, j’ai tenu ma promesse.', 'Je veux le prochain.'] }, null);
        }
        else if (nom === 'mgmt_choc') {
          let p = null;
          for (const x of MGMT_ORGANISATIONS) { if (x.id === mgmtPredecesseurOrgId(m) || !m.orgs || !m.orgs[x.id]) continue; for (const f of m.roster) { const g = (m.orgs[x.id].roster || []).find(y => y.div === f.div); if (g) { p = { o: x, a: f, b: g }; break; } } if (p) break; }
          if (p) m.choc = { orgId: p.o.id, div: p.a.div, jour: 42, annee: mgmtChocAnnee(m), etat: 'recu', a: p.a.id, b: p.b.id };
          CL.go(nom);
        }
        else { CL.go(nom); }
        const app = document.getElementById('app');
        const html = app ? app.innerHTML : '';
        const texte = app ? app.textContent : '';
        const sortie = /Échap|Entrée|Accueil|Retour|Continuer|CL\\.go\\(|mgmtEnter|Menu principal/i.test(html);
        return JSON.stringify({ ecran: G.screen, longueur: html.length, interdit: (texte.match(${INTERDIT.toString()}) || [null])[0], sortie });
      })()`));
    } catch (e) {
      assert.fail(`l'écran ${nom} lève une erreur à l'ouverture : ${e && e.message}`);
    }
    assert.ok(r.longueur > 500, `l'écran ${nom} n'est pas vide (ouvert : ${r.ecran})`);
    assert.equal(r.interdit, null, `l'écran ${nom} contient « ${r.interdit} »`);
    assert.ok(r.sortie, `l'écran ${nom} offre une sortie (Échap / retour / section)`);
    rapport.push(`${nom}${r.ecran !== nom ? '→' + r.ecran : ''}`);
  }
  return rapport;
}

test('Management — chaque écran s’ouvre sans erreur, jamais vide, sans « undefined » ni « NaN », avec une sortie', () => {
  const rapport = controler(false);
  assert.ok(rapport.length >= 25);
});

test('Management — les mêmes écrans tiennent avec des noms très longs (27 lettres) sans erreur', () => {
  const rapport = controler(true);
  assert.ok(rapport.length >= 25);
});
