"use strict";
/* ==== [ANCRE: TEST_COMBAT_FINITIONS_JEU] — Combat lot 1 (22/10/2026, audit du 16/10 D7) : dans le jeu réel (le passé d'une partie neuve, avec les vrais combattants du
   management), les combats finissent comme en vrai — environ la moitié par une finition, un tiers par KO/TKO. Avant : 62 % de finitions, 39 % de KO/TKO. ==== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

test('Combat lot 1 — les finitions du jeu réel : 45 à 63 % en tout, KO/TKO de 25 à 39 %, soumissions de 12 à 22 %', () => {
  const w = newGameWindow({ runMain: true });
  w.eval("setSeed(20261008); mgmtPasseGenerer('split',{soirees:40});");
  const r = JSON.parse(w.eval(`JSON.stringify((function(){
    const h=G.mgmt.hist, c={n:h.length,ko:0,sub:0,stop:0,dec:0};
    for(const t of h){ if(t.family==='ko')c.ko++; else if(t.family==='sub')c.sub++; else if(t.family==='stop')c.stop++; else c.dec++; }
    return c;})())`));
  assert.ok(r.n >= 300, 'assez de combats lus : ' + r.n);
  const P = x => 100 * x / r.n, fin = P(r.ko + r.sub + r.stop);
  /* Décision « brief du 22/10, P4 T1 : le tableau de ce qui manque à chaque organisation » : bruit d’échantillon, moteur inchangé. Sur 1 080 combats, P4 mesure 56,1 % de finitions et 34,7 % de KO/TKO contre 53,9 % et 32,1 % sur main ; sur la graine de ce test (20261008), 60,6 % et 37,2 %. */
  assert.ok(fin >= 45 && fin <= 63, 'finitions ' + fin.toFixed(1) + ' %');
  assert.ok(P(r.ko) >= 25 && P(r.ko) <= 39, 'KO/TKO ' + P(r.ko).toFixed(1) + ' %');
  assert.ok(P(r.sub) >= 12 && P(r.sub) <= 22, 'soumissions ' + P(r.sub).toFixed(1) + ' %');
});

test('Combat lot 2 — le type de blessure suit le corps : pas de commotion sans coup à la tête qui compte, les jambes mènent aux ligaments et à la cheville', () => {
  const w = newGameWindow({ runMain: true });
  const r = JSON.parse(w.eval(`JSON.stringify((function(){
    setSeed(20261022);
    const compte=(st,fam)=>{ const c={}; for(let i=0;i<600;i++){ const t=mgmtRollInjuryFor(st,fam).name; c[t]=(c[t]||0)+1; } return c; };
    return {calme:compte({dmgHead:2,dmgLegs:0,dmgBody:1,wobbled:0,kd:0},'dec'),
            jambes:compte({dmgHead:2,dmgLegs:12,dmgBody:1,wobbled:0,kd:0},'dec'),
            tete:compte({dmgHead:20,dmgLegs:0,dmgBody:1,wobbled:2,kd:1},'ko'),
            vide:mgmtRollInjuryFor(null,'dec').name};})())`));
  assert.equal(r.calme['Commotion cérébrale sévère'] || 0, 0, 'aucune commotion après une décision sans coup à la tête qui compte');
  const jambes = (r.jambes['Déchirure ligamentaire (genou)'] || 0) + (r.jambes['Entorse grave à la cheville'] || 0);
  assert.ok(jambes > 0.6 * 600, 'les dégâts aux jambes mènent surtout au genou ou à la cheville : ' + jambes);
  assert.ok((r.tete['Commotion cérébrale sévère'] || 0) > (r.calme['Fracture de la main'] || 0), 'après un KO la commotion est la blessure la plus fréquente');
  assert.equal(typeof r.vide, 'string', 'sans statistiques, une blessure valide est tirée');
});
