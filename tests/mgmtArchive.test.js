"use strict";
/* CAGE LEGACY — tests/mgmtArchive.test.js
   ===========================================================================
   Monde lot 1 T5 (docs/lots/MONDE-LOT-1-T5.md) : l'archive légère du passé. En mémoire, m.hist garde les combats du passé allégés (p:true) ; sur le disque ils
   sont écrits en tableaux de nombres (mgmtSerialiser) et redéployés au chargement. Durée réduite (PASSE_N soirées) ; les poids des six ans complets sont dans
   mgmtPasseSixAns.test.js.
   =========================================================================== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

const PASSE_N = 4;
const GRAINE = 20261008;
function partiePassee(graine) {
  const win = newGameWindow({ runMain: true });
  win.eval(`setSeed(${graine}); mgmtPasseGenerer('split',{soirees:${PASSE_N}});`);
  return win;
}
const A = partiePassee(GRAINE);
const B = partiePassee(GRAINE);

test('Monde lot 1 T5 — même graine, même archive', () => {
  const a = A.eval('mgmtSerialiser(G.mgmt)'), b = B.eval('mgmtSerialiser(G.mgmt)');
  assert.equal(a, b);
  assert.ok(JSON.parse(a).passe.archive.h.length >= PASSE_N * 9 - 2, 'les combats du passé sont dans l\'archive');
});

test('Monde lot 1 T5 — chaque combat de l\'archive nomme deux combattants retrouvables, retraités compris', () => {
  const r = JSON.parse(A.eval(`JSON.stringify((function(){
    const m=G.mgmt, ids=new Set(m.roster.map(f=>f.id)); const a=JSON.parse(mgmtSerialiser(m)).passe.archive;
    const noms=a.h.map(r=>[a.s[r[2]],a.s[r[7]]]);
    return {n:a.h.length,orphelins:noms.filter(([x,y])=>!ids.has(x)||!ids.has(y)).length,memeCombattant:noms.filter(([x,y])=>x===y).length,
      retraitesCites:m.roster.filter(f=>mgmtIsRetired(f)).length,tousLegers:m.hist.slice(0,m.passe.nHist).every(t=>t.p===true)};})())`));
  assert.ok(r.n > 0); assert.equal(r.orphelins, 0); assert.equal(r.memeCombattant, 0); assert.equal(r.tousLegers, true);
});

test('Monde lot 1 T5 — pour chaque combattant, les victoires, défaites et nuls de l\'archive, ajoutés à sa part d\'avant, donnent son bilan affiché', () => {
  const r = JSON.parse(A.eval(`JSON.stringify((function(){
    const m=G.mgmt, c={}; const a=JSON.parse(mgmtSerialiser(m)).passe.archive;
    for(const h of a.h){ const A=a.s[h[2]], B=a.s[h[7]], w=h[12];
      c[A]=c[A]||[0,0,0]; c[B]=c[B]||[0,0,0];
      if(w===2){ c[A][2]++; c[B][2]++; } else if(w===0){ c[A][0]++; c[B][1]++; } else { c[B][0]++; c[A][1]++; } }
    let faux=0, negatives=0, verifies=0;
    for(const f of m.roster){
      const x=c[f.id]||[0,0,0], avant=[f.W-x[0],f.L-x[1],f.D-x[2]];
      if(avant.some(v=>v<0)) negatives++;
      if(avant[0]+x[0]!==f.W||avant[1]+x[1]!==f.L||avant[2]+x[2]!==f.D) faux++;
      verifies++;
    }
    return {faux,negatives,verifies,combattants:m.roster.length};})())`));
  assert.equal(r.faux, 0); assert.equal(r.negatives, 0); assert.equal(r.verifies, r.combattants);
});

test('Monde lot 1 T5 — sauvegarder puis recharger rend le même état en mémoire', () => {
  const r = JSON.parse(A.eval(`JSON.stringify((function(){
    const m=G.mgmt, avant=JSON.stringify(m); saveMgmt();
    const disque=stockageLire(mgmtSlotKey(MGMT_SLOT)); const lu=mgmtParseAndValidate(disque);
    const compact=JSON.parse(disque);
    G.mgmt=null; const ok=loadMgmt();
    return {memeSerialisation:disque===mgmtSerialiser(m),identique:!!lu&&JSON.stringify(lu)===avant,charge:ok,identiqueCharge:JSON.stringify(G.mgmt)===avant,
      histCompact:compact.hist.length,histMem:m.hist.length,nHist:m.passe.nHist,archive:!!compact.passe.archive,archiveEnMemoire:G.mgmt.passe.archive===undefined};})())`));
  assert.equal(r.identique, true, 'mgmtParseAndValidate rend la partie en mémoire à l\'identique');
  assert.equal(r.charge, true); assert.equal(r.identiqueCharge, true, 'loadMgmt aussi');
  assert.equal(r.archive, true, 'le disque porte l\'archive'); assert.equal(r.archiveEnMemoire, true, 'la mémoire n\'en garde pas');
  assert.equal(r.histCompact, r.histMem - r.nHist, 'les combats du passé ne sont plus dans m.hist du disque');
  /* Rejouer une soirée après le rechargement : la partie reste jouable et se resauvegarde. */
  const s = A.eval(`(function(){ const s=mgmtPredecesseurSoiree(G.mgmt,0); saveMgmt(); return [s.jouee,validateMgmt(G.mgmt),!!mgmtParseAndValidate(stockageLire(mgmtSlotKey(MGMT_SLOT)))]; })()`);
  assert.deepEqual(Array.from(s), [true, true, true]);
});

test('Monde lot 1 T5 — une archive illisible ou hors de proportion n\'est pas chargée, jamais un plantage', () => {
  const r = JSON.parse(A.eval(`JSON.stringify((function(){
    const m=G.mgmt, j=JSON.parse(mgmtSerialiser(m)), out=[];
    const essai=f=>{ const c=JSON.parse(JSON.stringify(j)); f(c); try{ out.push(mgmtParseAndValidate(JSON.stringify(c))===null); }catch(e){ out.push('plante'); } };
    essai(c=>{ c.passe.archive.h.pop(); });
    essai(c=>{ c.passe.archive.h[0][2]=9999; });
    essai(c=>{ c.passe.archive.f[0][1]=9999; });
    essai(c=>{ c.passe.archive.s=null; });
    return out; })())`));
  assert.deepEqual(r, [true, true, true, true]);
});

test('Monde lot 1 T5 — un combat du passé ne se revoit pas : ni bouton mort, ni plantage', () => {
  const r = JSON.parse(A.eval(`JSON.stringify((function(){
    const m=G.mgmt, t=m.hist[0], f=mgmtFighterById(m,t.a.id);
    const out={replay:mgmtReplayFight(t),revoyable:mgmtCombatRevoyable(t),revoir:mgmtRevoirCombat(t,'mgmt_fiche',null)};
    MGMT_FICHE={id:f.id,retour:'mgmt_carte',cursor:0};
    out.fiche=mgmtFicheCombatsHtml(m,f,null);
    out.ficheBoutons=(out.fiche.match(/mgmtHistoriqueRevoir/g)||[]).length;
    G.screen='mgmt_fiche'; CL.mgmtHistoriqueRevoir(0); out.ecranApres=G.screen; out.ficheOuverte=MGMT_FICHE.id;
    return {replay:out.replay,revoyable:out.revoyable,revoir:out.revoir,ficheBoutons:out.ficheBoutons,ficheTexte:out.fiche.length>0,ecranApres:out.ecranApres}; })())`));
  assert.equal(r.replay, null); assert.equal(r.revoyable, false); assert.equal(r.revoir, false);
  /* Monde lot 1 T6 : la ligne d'un combat du passé ouvre la fiche de l'adversaire (mgmtHistoriqueRevoir), jamais le combat. */
  assert.ok(r.ficheBoutons > 0, 'chaque ligne mène quelque part'); assert.equal(r.ficheTexte, true);
  assert.equal(r.ecranApres, 'mgmt_fiche', 'ouvrir un combat du passé ouvre une fiche, pas un combat');
  /* Un combat joué sous le joueur se revoit toujours. */
  const joueur = A.eval(`(function(){ const m=G.mgmt; mgmtPredecesseurSoiree(m,0); const t=m.hist[m.hist.length-1]; return [t.p===undefined, mgmtCombatRevoyable(t), !!mgmtReplayFight(t)]; })()`);
  assert.deepEqual(Array.from(joueur), [true, true, true]);
});

test('Monde lot 1 T5 — les écrans qui lisent le passé continuent de fonctionner', () => {
  const r = JSON.parse(B.eval(`JSON.stringify((function(){
    const m=G.mgmt; const out={};
    G.screen='mgmt_resultats'; out.resultats=String(scr_mgmt_resultats()).length>100; out.sansRevoir=!/Revoir ce combat/.test(scr_mgmt_resultats());
    out.soirees=mgmtSoirees(m).length>=1;
    out.classements=allDivisions().every(d=>mgmtDivisionRanking(m,d.id,'organization').length>0);
    return out; })())`));
  assert.equal(r.resultats, true); assert.equal(r.sansRevoir, true); assert.equal(r.soirees, true);
  assert.equal(B.eval('allDivisions().every(d=>mgmtSplitTitle(G.mgmt,d.id))'), true, 'les ceintures se lisent sur les faits du passé'); assert.equal(r.classements, true);
});
