"use strict";
/* CAGE LEGACY — tests/mgmtSauvegarde14.test.js
   ===========================================================================
   Monde lot 1 T7 : les parties existantes. tests/fixtures/mgmt-sauvegarde-14.json est une VRAIE sauvegarde de version 14, fabriquée le 12/10/2026 par le code de main
   (commit c36784a, avant le lot) : Split, graine 20261012, trois soirées jouées, titres en jeu. Elle se charge, se valide, se joue, et les écrans de la T6 (Résultats,
   Ceintures, fiche, rôles) se rendent sans erreur sur cette partie sans passé. Son passé reste reconstitué à l'ancienne (mgmt-anciens.js).
   =========================================================================== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { newGameWindow } = require('./helpers/loadGame');
const jouerSoirees = require('./helpers/jouerSoirees');

const TEXTE = fs.readFileSync(path.join(__dirname, 'fixtures', 'mgmt-sauvegarde-14.json'), 'utf8');
const win = newGameWindow({ runMain: true });
win.__texte = TEXTE;
const ev = code => JSON.parse(win.eval(`JSON.stringify((function(){ ${code} })())`));

test('Monde lot 1 T7 — la sauvegarde 14 d\'avant le lot est bien une 14, sans passé', () => {
  const brut = JSON.parse(TEXTE);
  assert.equal(brut.v, 14); assert.equal(brut.passe, undefined); assert.equal(brut.eventsPlayed, 3);
});

test('Monde lot 1 T7 — une sauvegarde d\'avant ce lot se charge sans rien perdre, se valide, et est écrite telle quelle', () => {
  const r = ev(`const brut=JSON.parse(window.__texte); const m=mgmtParseAndValidate(window.__texte);
    const attendu=JSON.stringify(Object.assign({},brut,{v:MGMT_SAVE_VERSION}));
    return {charge:!!m,v:m&&m.v,identique:!!m&&(function(){const c=JSON.parse(JSON.stringify(m)); const vis=c.visites; delete c.visites; return JSON.stringify(c)===attendu&&mgmtVisitesValide(vis);})(), /* fusion du lot 8, 12/10/2026 : v16 ajoute la table des visites, seule différence admise */
     valide:!!m&&validateMgmt(m),sansPasse:!!m&&m.passe===undefined,
      ecriture:!!m&&mgmtSerialiser(m)===JSON.stringify(m),soireesJoueur:m?mgmtSoireesJoueur(m):null,hist:m?m.hist.length:0,tousLourds:m?m.hist.every(t=>t.p===undefined):false};`);
  assert.equal(r.charge, true); assert.equal(r.v, win.eval('MGMT_SAVE_VERSION')); assert.equal(r.identique, true, 'seule la version change');
  assert.equal(r.valide, true); assert.equal(r.sansPasse, true); assert.equal(r.ecriture, true, 'aucune archive : la partie s\'écrit comme avant');
  assert.equal(r.soireesJoueur, 3, 'sans passé, toutes les soirées sont celles du joueur'); assert.ok(r.hist >= 20); assert.equal(r.tousLourds, true, 'ses combats gardent leur trace complète (revoir reste possible)');
});

test('Monde lot 1 T7 — la partie se charge par l\'emplacement et joue une soirée', () => {
  const w = newGameWindow({ runMain: true });
  w.__texte = TEXTE;
  w.eval(`setSeed(5); stockageEcrire(mgmtSlotKey(1),window.__texte); CL.mgmtEnter(1);`);
  assert.equal(w.eval('G.screen'), /* décision du 12/10/2026 : l’Accueil est la première section (lot 7) */ 'mgmt_accueil', 'une partie reprise ne revoit pas l\'arrivée');
  assert.equal(w.eval('G.mgmt.eventsPlayed'), 3);
  const avant = w.eval('G.mgmt.hist.length');
  assert.equal(jouerSoirees(w, 1), 1);
  assert.equal(w.eval('G.mgmt.eventsPlayed'), 4); assert.ok(w.eval('G.mgmt.hist.length') > avant);
  assert.equal(w.eval('validateMgmt(G.mgmt)'), true);
  assert.equal(w.eval('mgmtSerialiser(G.mgmt)===JSON.stringify(G.mgmt)'), true);
  /* Les combats joués après le chargement se revoient. */
  assert.equal(w.eval('mgmtCombatRevoyable(G.mgmt.hist[G.mgmt.hist.length-1])'), true);
});

test('Monde lot 1 T7 — Résultats, Ceintures, fiche et rôles se rendent sans erreur sur cette partie', () => {
  const r = ev(`const m=mgmtParseAndValidate(window.__texte); G.mgmt=m; const out={erreurs:[]};
    const essaie=(nom,f)=>{ try{ f(); }catch(e){ out.erreurs.push(nom+' : '+e); } };
    G.screen='mgmt_resultats';
    essaie('resultats',()=>{ const n=mgmtSoirees(m).length; out.soirees=n; for(let s=0;s<n;s++){ MGMT_SU_RE.s=s; MGMT_SU_RE.i=0; const h=scr_mgmt_resultats(); if(!/Revoir le combat/.test(h)) out.erreurs.push('revoir absent soirée '+s); } });
    G.screen='mgmt_ceintures';
    essaie('ceintures',()=>{ MGMT_SU_CE.ouverte=false; scr_mgmt_ceintures(); for(const d of allDivisions()){ MGMT_SU_CE.ouverte=true; MGMT_SU_CE.div=d.id; scr_mgmt_ceintures(); } MGMT_SU_CE.ouverte=false; });
    essaie('fiches',()=>{ out.fiches=0; m.roster.forEach((f,i)=>{ if(i%6) return; MGMT_FICHE={id:f.id,retour:'mgmt_carte',cursor:0}; const l=mgmtFicheLigne(m,f.id); mgmtFicheCombatsHtml(m,f,l); out.fiches++; }); });
    essaie('fiche écran',()=>{ const f=m.roster[0]; MGMT_FICHE={id:f.id,retour:'mgmt_carte',cursor:0}; G.screen='mgmt_fiche'; scr_mgmt_fiche_cadre(); });
    const roles={}; essaie('roles',()=>{ for(const f of m.roster){ const x=mgmtRole(m,f); const k=x?x.id:'-'; roles[k]=(roles[k]||0)+1; } });
    out.roles=roles; out.vestiaire=(()=>{ try{ G.screen='mgmt_vestiaire'; return String(scr_mgmt_vestiaire()).length>100; }catch(e){ out.erreurs.push('vestiaire : '+e); return false; } })();
    return out;`);
  assert.deepEqual(r.erreurs, []); assert.equal(r.soirees, 3); assert.ok(r.fiches > 50); assert.equal(r.vestiaire, true);
});
