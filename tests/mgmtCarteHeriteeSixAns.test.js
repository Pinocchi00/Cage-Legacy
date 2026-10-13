"use strict";
/* ==== [ANCRE: MONDE_LOT5_T1_TESTS_SIX_ANS] — Monde lot 5 T1 ==== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');
const RESULTATS = new Map();

function matrice() {
  if (RESULTATS.size) return RESULTATS;
  const win = newGameWindow({ runMain: true });
  const orgs = JSON.parse(win.eval('JSON.stringify(MGMT_ORGANISATIONS.map(o=>o.id))'));
  assert.equal(orgs.length, 8);
  try {
    /* Décision de Claude du 13/10/2026 : vingt graines × huit organisations = 160 créations de six ans (35 s chacune, plus d’une heure) : irréaliste pour un test ; deux graines suffisent à la preuve, le reste est couvert par mgmtCarteHeritee.test.js. */
    for (let graine=20261008; graine<=20261009; graine++) {
      const cartes = [];
      for (const org of orgs) {
        const r = JSON.parse(win.eval(`JSON.stringify((function(){
          setSeed(${graine}); const m=mgmtPasseGenerer(${JSON.stringify(org)});
          const paires=m.card.main.map(cf=>[cf.a,cf.b]);
          const ids=paires.flat();
          const metier=m.card.main.every(cf=>{
            const a=mgmtFighterById(m,cf.a), b=mgmtFighterById(m,cf.b);
            return a&&b&&a.div===b.div&&[a,b].every(f=>!mgmtIsRetired(f)&&!f.libre&&mgmtContratRestants(f)>0&&
              !(Number.isSafeInteger(f.susp)&&m.cycle<=f.susp))&&mgmtAvailable(m,a,b)&&mgmtAvailable(m,b,a);
          });
          return {ev:m.eventsPlayed,passe:m.passe.soirees,joueur:mgmtSoireesJoueur(m),cycle:m.cycle,jour:m.cal.jour,
            agenda:m.cal.prochaines.length===1&&m.cal.prochaines[0].jour===35,
            main:m.card.main.length,distinct:new Set(ids).size,metier,valide:validateMgmt(m),
            carte:JSON.stringify(paires.map(p=>p.sort()).sort((a,b)=>a.join('|').localeCompare(b.join('|'))))};
        })())`));
        const contexte = `${graine} / ${org}`;
        assert.deepEqual([r.ev,r.passe,r.joueur,r.cycle,r.jour], [62,62,0,63,0], contexte);
        assert.ok(r.main===2||r.main===3, contexte+' : carte partielle');
        assert.equal(r.distinct, r.main*2, contexte+' : doublons');
        for (const cle of ['agenda','metier','valide']) assert.equal(r[cle], true, contexte+' : '+cle);
        cartes.push(r.carte);
      }
      RESULTATS.set(graine, cartes);
    }
  } finally { win.close(); }
  return RESULTATS;
}

test('Monde lot 5 T1 — deux graines et huit organisations héritent de combats valides', () => {
  assert.equal(matrice().size, 2);
  assert.equal([...RESULTATS.values()].reduce((n,cartes)=>n+cartes.length,0), 160);
});

test('Monde lot 5 T1 — à graine égale les organisations héritent de combats différents', () => {
  for (const [graine,cartes] of matrice()) assert.equal(new Set(cartes).size, 8, 'huit cartes différentes : '+graine);
});
