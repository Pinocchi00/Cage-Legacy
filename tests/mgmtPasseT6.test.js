"use strict";
/* CAGE LEGACY — tests/mgmtPasseT6.test.js
   ===========================================================================
   Monde lot 1 T6 (docs/lots/MONDE-LOT-1-T6.md) : ce que le passé allume, sur les six ans complets (62 soirées, une génération de 25 s pour tout le fichier : il est
   dans LENTS de tools/check-rapide.js). Résultats parcourt les soirées passées, Ceintures montre les règnes, la fiche renvoie à de vrais adversaires, quatre des cinq
   rôles à mémoire s'allument (le cinquième, Remplaçant de luxe, n'a pas de matière au premier jour : le prédécesseur n'engage personne à court préavis).
   =========================================================================== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

const win = newGameWindow({ runMain: true });
win.eval(`setSeed(20261008); mgmtPasseGenerer('split');`);
const ev = code => JSON.parse(win.eval(`JSON.stringify((function(){ ${code} })())`));

test('Monde lot 1 T6 — chaque catégorie a un champion et sa ceinture a au moins un règne passé, daté', () => {
  const r = ev(`const m=G.mgmt; const out=[];
    for(const d of allDivisions()){
      const l=mgmtCeintureLignee(m,d.id), belt=mgmtSplitTitle(m,d.id);
      MGMT_SU_CE.ouverte=true; MGMT_SU_CE.div=d.id; G.screen='mgmt_ceintures';
      const html=scr_mgmt_ceintures();
      out.push({div:d.id,champion:!!belt.id,regnes:l.reigns.length,passes:l.reigns.filter(x=>x.jusqua!==null).length,
        defenses:l.reigns.reduce((a,x)=>a+x.defenses,0),annees:/ · 20(2[1-6])/.test(html)});
    }
    MGMT_SU_CE.ouverte=false; return out;`);
  assert.equal(r.length, 12);
  for (const x of r) {
    assert.equal(x.champion, true, x.div + ' a un champion');
    assert.ok(x.regnes >= 2 && x.passes >= 1, x.div + ' : ' + x.regnes + ' règnes, ' + x.passes + ' passés');
    assert.equal(x.annees, true, x.div + ' : les règnes se datent (2021-2026)');
  }
  console.log('règnes par ceinture : ' + r.map(x => x.div + ' ' + x.regnes + '/' + x.defenses + ' déf.').join(', '));
});

test('Monde lot 1 T6 — Résultats rend les 62 soirées sans erreur, datées, sans bouton « revoir »', () => {
  const r = ev(`const m=G.mgmt; G.screen='mgmt_resultats'; const out={n:mgmtSoirees(m).length,erreurs:0,sansDate:0,revoir:0,puces:0,annees:[]};
    for(let s=0;s<out.n;s++){
      MGMT_SU_RE.s=s; MGMT_SU_RE.i=0;
      try{
        const html=scr_mgmt_resultats(); const n=out.n-s;
        if(!html.includes('Fight Night '+n)) out.erreurs++;
        const an=/\\d{1,2} (?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre) (20\\d\\d)/.exec(html); if(!an) out.sansDate++; else out.annees.push(+an[1]);
        if(/Revoir le combat/.test(html)) out.revoir++;
        out.puces=Math.max(out.puces,(html.match(/class="(on)?"[^>]*aria-pressed/g)||[]).length);
        const liste=mgmtSuResultatsListe(m,mgmtSoirees(m).slice().reverse()[s]);
        for(let i=0;i<liste.length;i++){ MGMT_SU_RE.i=i; scr_mgmt_resultats(); }
      }catch(e){ out.erreurs++; out.message=String(e); }
    }
    out.min=Math.min(...out.annees); out.max=Math.max(...out.annees); delete out.annees; return out;`);
  assert.equal(r.n, 62); assert.equal(r.erreurs, 0, r.message); assert.equal(r.sansDate, 0); assert.equal(r.revoir, 0);
  assert.equal(r.min, 2021); assert.equal(r.max, 2026);
  assert.ok(r.puces <= 5, 'cinq pastilles de soirée au plus : ' + r.puces);
});

test('Monde lot 1 T6 — chaque combat du passé nomme deux combattants retrouvables ; la fiche de chacun les liste et s\'ouvre sur l\'adversaire', () => {
  const r = ev(`const m=G.mgmt; const out={combats:0,introuvables:0,lignes:0,manque:0,ouvre:0,essais:0,erreurs:0};
    const vus=new Map();
    for(const [i,t] of m.hist.entries()){
      if(t.p!==true) continue; out.combats++;
      for(const id of [t.a.id,t.b.id]){ if(!mgmtFicheLigne(m,id)) out.introuvables++; if(!vus.has(id)) vus.set(id,0); vus.set(id,vus.get(id)+1); }
    }
    for(const [id,n] of vus){
      const f=mgmtFighterById(m,id); MGMT_FICHE={id,retour:'mgmt_carte',cursor:0};
      try{ const html=mgmtFicheCombatsHtml(m,f,mgmtFicheLigne(m,id)); out.lignes+=(html.match(/mgmtHistoriqueRevoir/g)||[]).length; if((html.match(/mgmtHistoriqueRevoir/g)||[]).length<n) out.manque++; }catch(e){ out.erreurs++; }
    }
    /* Le premier combat du passé d'un combattant : sa ligne ouvre la fiche de l'adversaire (retraité compris). */
    for(const [i,t] of m.hist.entries()){
      if(t.p!==true||out.essais>=40) continue; out.essais++;
      const f=mgmtFighterById(m,t.a.id); MGMT_FICHE={id:f.id,retour:'mgmt_carte',cursor:0}; G.screen='mgmt_fiche'; CL.mgmtHistoriqueRevoir(i);
      if(MGMT_FICHE.id===t.b.id&&G.screen==='mgmt_fiche') out.ouvre++;
    }
    out.retraitesCites=m.roster.filter(f=>mgmtIsRetired(f)&&vus.has(f.id)).length;
    return out;`);
  assert.ok(r.combats >= 500); assert.equal(r.introuvables, 0); assert.equal(r.erreurs, 0); assert.equal(r.manque, 0);
  assert.equal(r.ouvre, r.essais, 'la ligne d\'un combat du passé ouvre la fiche de l\'adversaire');
});

test('Monde lot 1 T6 — les rôles à mémoire s\'allument au premier jour : ancien champion, gatekeeper, bête noire, revenant', () => {
  const r = ev(`const m=G.mgmt, roles={};
    for(const f of m.roster){ const x=mgmtRole(m,f); const k=x?x.id:'-'; roles[k]=(roles[k]||0)+1; }
    /* Remplaçant de luxe : la matière manque au premier jour ; elle existe dès que deux faits 'engage' existent. */
    const f=m.roster.find(x=>{ const r=mgmtRole(m,x); return r&&['veteran','espoir','journeyman'].includes(r.id); });
    const avant=mgmtRole(m,f).id; m.facts.push({c:m.cycle,k:'engage',a:f.id,src:'libre'},{c:m.cycle,k:'engage',a:f.id,src:'libre'});
    const apres=mgmtRole(m,f).id; m.facts.length-=2;
    return {roles,avant,apres,retour:mgmtRole(m,f).id};`);
  for (const id of ['champion', 'ancien-champion', 'gatekeeper', 'bete-noire', 'revenant']) assert.ok(r.roles[id] >= 1, id + ' : ' + r.roles[id]);
  assert.equal(r.roles['remplacant-de-luxe'], undefined, 'rien n\'est fabriqué : aucun short notice dans le passé');
  assert.notEqual(r.avant, 'remplacant-de-luxe'); assert.equal(r.apres, 'remplacant-de-luxe'); assert.equal(r.retour, r.avant);
  console.log('rôles au premier jour : ' + JSON.stringify(r.roles));
});

test('Monde lot 1 T6 — les rivalités se lisent sur de vrais combats : la fenêtre ne rend pas le passé muet, n\'en allume pas cinquante', () => {
  const r = ev(`const m=G.mgmt; const aff=mgmtAffrontements(m); let rencontres=0, duPasse=0;
    for(const l of aff.values()){ rencontres+=l.length; duPasse+=l.filter(x=>m.hist[x.i].p===true).length; }
    const riv=mgmtRivalites(m);
    return {rencontres,duPasse,hist:m.hist.length,rivalites:riv.length,genres:riv.reduce((a,x)=>{ a[x.k]=(a[x.k]||0)+1; return a; },{}),
      toutes:mgmtRivalites(Object.assign({},m,{cycle:m.cycle})).length};`);
  assert.equal(r.rencontres, r.hist, 'chaque combat, du passé compris, est une rencontre');
  assert.equal(r.duPasse, r.hist);
  assert.ok(r.rivalites >= 1 && r.rivalites <= 12, 'rivalités actives au premier jour : ' + r.rivalites);
  console.log('rivalités actives au premier jour : ' + r.rivalites + ' ' + JSON.stringify(r.genres));
});
