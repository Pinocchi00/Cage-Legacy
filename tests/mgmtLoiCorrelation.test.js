"use strict";
/* CAGE LEGACY — tests/mgmtLoiCorrelation.test.js
   ============================================================================
   DÉCOUPAGE MGMT-BUREAU (dette CLAUDE.md §10) — test de non-dérive, seul
   ajout de la tranche.

   Les constantes MGMT_EXT_RATIO_* (mgmt-data.js, ancre
   MGMT_LOT2B_EXTERIEUR_DONNEES) reprennent la loi de correlatedRecord
   (ui-01-roster-matchmaking.js) : ratio de victoires cible
   = 0.45 + t*(0.88−0.45) avec t = clamp((lv−20)/77, 0, 1), puis un bruit
   uniforme ±0,07 ajouté au tirage (une fois par appel). Le monde extérieur
   dérivé (mgmt-monde.js, mgmtExteriorCareer) joue chaque combat
   professionnel coup par coup sous la MÊME loi, évaluée à ces constantes :
   p = clamp(MGMT_EXT_RATIO_BASE + t×MGMT_EXT_RATIO_SPAN, FLOOR, CAP) avec
   t = clamp((lv−MGMT_EXT_LVL_SRC_FLOOR)/MGMT_EXT_LVL_SRC_SPAN, 0, 1).
   Rien ne les tient ensemble mécaniquement — modifier correlatedRecord
   ferait diverger le monde dérivé en silence. Ce test échoue si les deux
   lois divergent.

   Méthode : à un niveau donné, correlatedRecord est appelé 4 000 fois avec
   un grand nombre de combats par appel (200). Le bruit (±0,07, uniforme,
   un tirage par appel) se moyenne à zéro — écart-type de la moyenne
   0.07/√3/√4000 ≈ 0,00064 — et l'arrondi de W (≤ 0,5/200 par appel,
   centré) ajoute ≤ 0,00007 en moyenne. La tolérance est fixée à ±0,003,
   soit ≈ 4,3 σ de l'effet bruit+arrondi seul : serrée, et robuste au
   tirage seedé (déterministe, la fenêtre jsdom re-seedée à chaque appel).
   Les clampes FLOOR/CAP de correlatedRecord sont inertes sur la bande
   parcourue (0,45 + t×0,43 ± 0,07 reste dans [0,38 ; 0,95]) : les quatre
   niveaux (25, 60, 90, 97) couvrent la montée complète de la loi, et tout
   écart d'au moins 0,01 sur MGMT_EXT_RATIO_BASE ou
   MGMT_EXT_RATIO_SPAN — ou d'une unité sur MGMT_EXT_LVL_SRC_FLOOR /
   MGMT_EXT_LVL_SRC_SPAN — fait déborder la bande sur au moins un niveau.
   ============================================================================ */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

test('MGMT loi bilan↔niveau — correlatedRecord suit MGMT_EXT_RATIO_* : le ratio de victoires moyen reste dans la bande du monde extérieur', () => {
  const win = newGameWindow();
  const r = win.eval(`(function(){
    const TOL=0.003, TOTAL=200, CALLS=4000;
    const niveaux=[];
    for(const lv of [25,60,90,97]){
      setSeed(10000+lv);
      let somme=0;
      for(let i=0;i<CALLS;i++){
        const rec=correlatedRecord(lv,TOTAL);
        somme+=rec.W/TOTAL;
      }
      const t=clamp((lv-MGMT_EXT_LVL_SRC_FLOOR)/MGMT_EXT_LVL_SRC_SPAN,0,1);
      const p=clamp(MGMT_EXT_RATIO_BASE+t*MGMT_EXT_RATIO_SPAN,MGMT_EXT_RATIO_FLOOR,MGMT_EXT_RATIO_CAP);
      const moyen=somme/CALLS;
      niveaux.push({lv:lv,t:t,p:p,moyen:moyen,ecart:Math.abs(moyen-p),ok:Math.abs(moyen-p)<=TOL});
    }
    return niveaux;
  })()`);
  assert.equal(r.length, 4, 'quatre niveaux testés : 25, 60, 90, 97');
  for(const n of r){
    assert.ok(n.ok,
      `niveau ${n.lv} : ratio moyen ${(n.moyen).toFixed(5)} attendu ${(n.p).toFixed(5)} (écart ${(n.ecart).toFixed(5)} ≤ 0,003)`);
  }
  assert.ok(r[3].moyen>r[0].moyen, 'la loi monte avec le niveau (97 au-dessus de 25)');
});
