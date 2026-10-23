"use strict";
/* ==== [ANCRE: MONDE34T1B_TESTS] — Monde lot 34 T1b ==== */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const {mesureManques,verdicts}=require('../tools/mesure-manques');

test('Un profil sans manque : même monde qu’avant (comparaison avec un profil ancien)',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval('MGMT_ORGANISATIONS.forEach(o=>{delete o.profil.manque;delete o.profil.force;});');
    const ancienMonde=w.eval(`JSON.stringify(MGMT_ORGANISATIONS.map(o=>{setSeed(20261008);const m=mgmtDefault(o.id);mgmtNewRoster(m);return m;}))`);
    // Référence mesurée avec mgmtNewRoster d'origin/main, profils anciens des huit organisations.
    assert.equal(crypto.createHash('sha256').update(ancienMonde).digest('hex'),'515d22c6a1059c577168488fa1559420d0bc4365ac6fda4f800b4fcd91c56581');
    const r=JSON.parse(w.eval(`JSON.stringify((()=>{
      const profil={...mgmtOrgProfil(mgmtDefault('split'))};delete profil.manque;delete profil.force;
      const ancien={...profil};
      setSeed(20261008);const a=mgmtDefault('split');mgmtNewRoster(a,{profil});
      setSeed(20261008);const b=mgmtDefault('split');mgmtNewRoster(b,{profil:ancien});
      const values=Array.from({length:100},(_,i)=>i/100);
      return {a,b,ages:values.every(u=>mgmtOrgAgeTire(u,profil)===clamp(22+Math.floor(17*Math.pow(u,1.25))+profil.age,20,40)),attrs:a.roster.slice(0,10).every(f=>JSON.stringify(mgmtCombatProfile(f,null))===JSON.stringify(mgmtCombatProfile(f,profil)))};
    })())`));
    assert.deepEqual(r.a,r.b);assert.ok(r.ages);assert.ok(r.attrs);
  }finally{w.close();}
});

let reference;
function mondeReference(){
  if(!reference) reference=mesureManques(20261008,{snapshot:true});
  return reference;
}

test('Pour chaque manque du tableau §1 : indicateur ≤ 0,70 × (0,80 pour finitionsPasse ; a-domicile exempté) et force jeunes-partout ≥ 1,2 ×',()=>{
  const rows=verdicts(mondeReference().organisations);
  for(const r of rows){
    if(r.manque==='a-domicile'){
      // Décision Anthony du 23/10 : aucun effet, indicateur exempté (Émirats absents du catalogue).
      assert.equal(r.valeur,0);assert.equal(r.mesurable,false);
    }else{
      assert.ok(r.ok,JSON.stringify(r));
      // Décision Anthony : seule finitionsPasse passe à 0,80 ; mesures précédentes 0,717 et 0,786.
      if(r.indicateur==='finitionsPasse') assert.ok(r.valeur<=0.8*r.autres,JSON.stringify(r));
    }
  }
  assert.equal(new Set(rows.map(r=>r.manque)).size,7);
});

/* ==== [ANCRE: MONDE34T1B_TEST_DOMICILE_NEUTRE] — Monde lot 34 T1b ==== */
test('a-domicile ne biaise ni les pays ni les recrues, même avec un pays domestique au catalogue',()=>{
  const w=newGameWindow();
  try{
    const r=JSON.parse(w.eval(`JSON.stringify((()=>{
      const m=mgmtDefault('organisation-7'),profil=mgmtOrgProfil(m),ancien={...profil};delete ancien.manque;
      mgmtOrgPaysDomicile=()=>COUNTRY_KEYS[0];
      setSeed(777);mgmtNewRoster(m,{profil});const a=JSON.stringify(m);
      const b=mgmtDefault('organisation-7');setSeed(777);mgmtNewRoster(b,{profil:ancien});
      const candidats=[{id:'mg1',age:28,ck:COUNTRY_KEYS[0]},{id:'mg2',age:24,ck:COUNTRY_KEYS[1]}];
      return {identique:a===JSON.stringify(b),recrue:mgmtOrgRecrueTirage(m,candidats,profil,30).id};
    })())`));
    assert.equal(r.identique,true);assert.equal(r.recrue,'mg1');
  }finally{w.close();}
});

test('Les effectifs restent dans leurs bornes ; chaque catégorie a un champion',()=>{
  const w=newGameWindow();
  try{
    const categories=JSON.parse(w.eval(`JSON.stringify(MGMT_ORGANISATIONS.flatMap(o=>{
      setSeed(20261008);const m=mgmtDefault(o.id);mgmtNewRoster(m);
      return allDivisions().map(d=>({org:o.id,div:d.id,n:m.roster.filter(f=>f.div===d.id).length,
        attendu:Math.max(4,Math.round(MGMT_EFFECTIF_PAR_CATEGORIE*mgmtOrgPoidsCategorie(o.profil,d.id)*o.profil.effectif)),
        champion:!!mgmtSplitTitle(m,d.id)?.id}));
    }))`));
    for(const d of categories){
      assert.ok(d.champion,JSON.stringify(d));assert.ok(Math.abs(d.n-d.attendu)<=2,JSON.stringify(d));
      if(d.org==='split') assert.ok(d.div==='H-heavy'?d.n>=10&&d.n<=20:d.n>=28&&d.n<=32,JSON.stringify(d));
    }
    const monde=JSON.parse(mondeReference().monde);
    for(const o of mondeReference().organisations) for(const d of o.categories) assert.ok(d.champion&&d.n>0,JSON.stringify(d));
    w.G={theme:'dark',mgmt:monde};
    assert.ok(w.eval("allDivisions().every(d=>mgmtDivisionRanking(G.mgmt,d.id,'world').length>0)"));
  }finally{w.close();}
});

test('Déterminisme : deux générations de même graine donnent le même JSON',()=>{
  assert.equal(mesureManques(20261008,{snapshot:true}).monde,mondeReference().monde);
});

test('Le fichier tools/reports/MANQUES-MESURES.md existe et liste les six manques',()=>{
  const texte=fs.readFileSync(path.join(__dirname,'../tools/reports/MANQUES-MESURES.md'),'utf8');
  for(const id of ['espoirs','experimentes','potentiel-champion','finisseurs','soumissions','a-domicile']) assert.ok(texte.includes('| '+id+' |'),id);
  for(const graine of [20261008,777,4242]) assert.ok(texte.includes('| '+graine+' |'));
  assert.ok(texte.includes('NON MESURABLE'));
});

/* ==== [ANCRE: MONDE34T1B_TRANSFERT_STABLE] — Monde lot 34 T1b ==== */
test('Les biais de création restent stables lors des transferts à âge et niveau identiques',()=>{
  const w=newGameWindow();
  try{
    const ok=w.eval(`(()=>{
      for(const id of ['fighting-pacific-championship','organisation-6']){
        setSeed(20261008);const m=mgmtDefault(id);mgmtNewRoster(m);
        const f=m.roster[0],a=JSON.stringify(mgmtCombatProfile(f));
        f.org='Split';if(JSON.stringify(mgmtCombatProfile(f))!==a)return false;
        G={theme:'dark',mgmt:m};
        if(!saveMgmt()||!mgmtParseAndValidate(stockageLire(mgmtSlotKey(MGMT_SLOT))))return false;
      }
      return true;
    })()`);
    assert.equal(ok,true);
  }finally{w.close();}
});
