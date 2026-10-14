"use strict";
/* ==== [ANCRE: MONDE_LOT5_T2_TESTS_SIX_ANS] — Monde lot 5 T2 ==== */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const RESULTATS=new Map();
function matrice(){
  if(RESULTATS.size) return RESULTATS;
  const w=newGameWindow({runMain:true});
  try{
    const orgs=JSON.parse(w.eval('JSON.stringify(MGMT_ORGANISATIONS.map(o=>o.id))'));
    assert.equal(orgs.length,8);
    for(let graine=20261008;graine<=20261009;graine++){
      for(const org of orgs){
        const r=JSON.parse(w.eval(`JSON.stringify((function(){
          setSeed(${graine}); const m=mgmtPasseGenerer(${JSON.stringify(org)});
          const brut=mgmtSerialiser(m), charge=mgmtParseAndValidate(brut);
          const reponses=m.facts.filter(x=>x.k==='promesse'||x.k==='refus');
          const liens=reponses.every(x=>Number.isSafeInteger(x.d)&&x.d>=0&&x.d<m.passe.nFacts&&
            m.facts[x.d].k==='demande'&&m.facts[x.d].a===x.a&&
            (x.k==='refus'||(m.facts[x.d].want===x.want&&(m.facts[x.d].target||null)===(x.target||null)&&x.due===x.c+3)));
          const ouvertes=m.roster.flatMap(f=>mgmtPromesses(m,f).filter(p=>p.etat==='en cours').map(p=>({f,p})));
          const heritage=!!charge&&ouvertes.every(({f,p})=>{
            const x=m.facts[p.i], y=charge.facts[p.i], d=charge.facts[y.d];
            const apres=mgmtPromesses(charge,f).find(q=>q.i===p.i);
            return p.due>=63&&d&&d.k==='demande'&&d.a===x.a&&d.want===x.want&&(d.target||null)===(x.target||null)&&
              JSON.stringify(x)===JSON.stringify(y)&&JSON.stringify(p)===JSON.stringify(apres);
          });
          return {ev:m.eventsPlayed,passe:m.passe.soirees,joueur:mgmtSoireesJoueur(m),cycle:m.cycle,jour:m.cal.jour,
            valide:validateMgmt(m),chargeValide:!!charge&&validateMgmt(charge),liens,heritage,
            archive:!!JSON.parse(brut).passe.archive,identique:!!charge&&JSON.stringify(m.facts)===JSON.stringify(charge.facts),
            ouvertes:ouvertes.length,reponses:reponses.length};
        })())`));
        RESULTATS.set(`${graine}/${org}`,r);
      }
    }
  }finally{w.close();}
  return RESULTATS;
}
test("Monde lot 5 T2 — chaque promesse ouverte du premier jour renvoie à une demande de l'archive",()=>{
  const resultats=matrice(); assert.equal(resultats.size,16);
  let ouvertes=0;
  for(const [contexte,r] of resultats){
    assert.deepEqual([r.ev,r.passe,r.joueur,r.cycle,r.jour],[62,62,0,63,0],contexte);
    for(const k of ['valide','chargeValide','liens','heritage','archive','identique']) assert.equal(r[k],true,contexte+' : '+k);
    ouvertes+=r.ouvertes;
  }
  assert.ok(ouvertes>0,'au moins une promesse réellement ouverte sur les 16 créations');
  console.log(`Monde lot 5 T2 : ${resultats.size}/16 créations valides, ${ouvertes} promesses ouvertes, aucun lien orphelin.`);
});
