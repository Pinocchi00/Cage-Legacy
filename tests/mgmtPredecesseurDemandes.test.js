"use strict";
/* ==== [ANCRE: MONDE_LOT5_T2_TESTS_DEMANDES] — Monde lot 5 T2 ==== */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
function partie(passe=false){
  const w=newGameWindow({runMain:true});
  w.eval(`setSeed(20261008); ${passe?"G.mgmt=mgmtPassePreparer('split',{soirees:3});":"const m=mgmtDefault('split'); mgmtNewRoster(m); mgmtExteriorEnsure(m); mgmtNewPile(m); G.mgmt=m; mgmtAgendaInit(m);"}`);
  return w;
}
function lire(w,code){return JSON.parse(w.eval(`JSON.stringify((function(){const m=G.mgmt; ${code}})())`));}
const FIXTURE=`m.cycle=10; m.facts=[];
  const fs=m.roster.filter(f=>f.div===m.roster[0].div).slice(0,7), autre=m.roster.find(f=>f.div!==fs[0].div);
  for(const f of [...fs,autre]){f.libre=false; f.retired=false; f.ct={n:3,f:0,b:1000};}
  fs[2].libre=true; fs[3].ct.f=3; fs[5].retired=true;
  const demandes=[{a:fs[0].id,want:'carte-principale'},{a:fs[1].id,want:'revanche',target:fs[6].id},
    {a:fs[2].id,want:'pause'},{a:fs[3].id,want:'carte-principale'},
    {a:fs[4].id,want:'revanche',target:fs[5].id},{a:fs[6].id,want:'revanche',target:autre.id}];
  m.facts=demandes.map(d=>Object.assign({c:10,k:'demande'},d));`;
const TROIS=`for(let k=0;k<3;k++) mgmtPasseSoiree(m,k);`;
const DERNIERE=`const f=m.roster.find(f=>!mgmtIsRetired(f)&&!f.libre&&mgmtContratRestants(f)>0);
  const i=m.facts.length; mgmtAddFact(m,{c:m.cycle,k:'demande',a:f.id,want:'carte-principale'});
  const reponse=mgmtRepondreDemande(m,i,'promettre'); const promesse=m.facts[m.facts.length-1];`;

test('Monde lot 5 T2 — promettre ou refuser réutilise la réponse du joueur',()=>{
  const w=partie(); try{
    const r=lire(w,`${FIXTURE} const compte=mgmtPredecesseurDemandes(m);
      return {compte,reponses:m.facts.slice(6),demandes,ouvertes:mgmtDemandesOuvertes(m)};`);
    assert.deepEqual(r.compte,{promises:2,refusees:4}); assert.equal(r.reponses.length,6);
    r.reponses.forEach((x,i)=>{assert.equal(x.d,i); assert.equal(x.a,r.demandes[i].a);
      assert.equal(x.k,i<2?'promesse':'refus'); if(i<2){assert.equal(x.due,13); assert.equal(x.want,r.demandes[i].want); assert.equal(x.target,r.demandes[i].target);}});
    assert.deepEqual(r.ouvertes,[]);
  }finally{w.close();}
});
test('Monde lot 5 T2 — la réponse est idempotente et ne consomme pas la RNG',()=>{
  const w=partie(); try{
    const r=lire(w,`${FIXTURE} const rng=SEED; mgmtPredecesseurDemandes(m); const premier=rng===SEED;
      const avant=JSON.stringify(m), compte=mgmtPredecesseurDemandes(m);
      const identique=avant===JSON.stringify(m)&&rng===SEED; G.mgmt={}; let leve=false;
      try{mgmtPredecesseurDemandes(m);}catch(e){leve=true;} G.mgmt=m;
      const garde=avant===JSON.stringify(m); m.facts.push({c:0,k:'demande',a:fs[0].id,want:'pause'},
        {c:10,k:'demande',a:fs[5].id,want:'pause'}); const n=m.facts.length;
      mgmtPredecesseurDemandes(m); return {premier,compte,identique,leve,garde,ignore:n===m.facts.length};`);
    assert.deepEqual(r.compte,{promises:0,refusees:0});
    for(const k of ['premier','identique','leve','garde','ignore']) assert.equal(r[k],true,k);
  }finally{w.close();}
});
test('Monde lot 5 T2 — seul le passé active les réponses',()=>{
  for(const opt of [false,true]){
    const w=partie(); try{
      const r=lire(w,`m.facts=[]; const f=m.roster.find(f=>!f.libre&&mgmtContratRestants(f)>0);
        m.facts.push({c:m.cycle,k:'demande',a:f.id,want:'pause'});
        mgmtPredecesseurSoiree(m,0,${opt?'{demandes:true}':'undefined'});
        return m.facts.filter(x=>(x.k==='promesse'||x.k==='refus')&&x.d===0).length;`);
      assert.equal(r,opt?1:0);
    }finally{w.close();}
  }
  const w=partie(true); try{
    assert.equal(lire(w,`for(let k=0;k<3;k++){const ds=mgmtDemandesOuvertes(m);
      mgmtPasseSoiree(m,k); if(!ds.every(d=>m.facts.filter(x=>(x.k==='promesse'||x.k==='refus')&&x.d===d.i).length===1)) return false;} return true;`),true);
  }finally{w.close();}
  const v=partie(); try{
    const r=lire(v,`m.facts=[]; const f=m.roster.find(f=>!mgmtIsRetired(f)); f.libre=true;
      m.facts.push({c:m.cycle,k:'demande',a:f.id,want:'pause'});
      const s=mgmtPredecesseurSoiree(m,0,{renouvelle:true,demandes:true});
      return {resigne:s.resignes>0,reponses:m.facts.filter(x=>x.k==='promesse'&&x.d===0).length};`);
    assert.equal(r.resigne,true); assert.equal(r.reponses,1);
  }finally{v.close();}
});
test('Monde lot 5 T2 — alléger recale les références des promesses et des refus',()=>{
  const w=partie(true); try{
    const r=lire(w,`${TROIS} const fs=m.roster.filter(f=>!mgmtIsRetired(f)).slice(0,2);
      mgmtAddFact(m,{c:m.cycle,k:'attend',a:fs[0].id}); const i=m.facts.length;
      mgmtAddFact(m,{c:m.cycle,k:'demande',a:fs[0].id,want:'revanche',target:fs[1].id});
      mgmtAddFact(m,{c:m.cycle,k:'contrat',a:fs[0].id}); mgmtRepondreDemande(m,i,'promettre');
      mgmtAddFact(m,{c:m.cycle,k:'depart_attente',a:fs[1].id}); const j=m.facts.length;
      mgmtAddFact(m,{c:m.cycle,k:'demande',a:fs[1].id,want:'pause'}); mgmtRepondreDemande(m,j,'refuser');
      mgmtAddFact(m,{c:m.cycle,k:'refus',a:fs[1].id,d:999999});
      const ordre=m.facts.filter(x=>!MGMT_PASSE_FAITS_PERDUS.includes(x.k)).map(x=>{const y={...x};delete y.d;return y;});
      /* ==== [ANCRE: MONDE_LOT5_T2_TEST_ALLEGEMENT_ATOMIQUE] — Monde lot 5 T2 ==== */
      const valideHist=m.hist; m.hist=[null]; const invalideAvant=JSON.stringify(m);
      const atomique=mgmtPasseAlleger(m)===false&&invalideAvant===JSON.stringify(m); m.hist=valideHist;
      mgmtPasseCloturer(m); const p=m.facts.find(x=>x.k==='promesse'&&x.a===fs[0].id&&x.c===m.cycle);
      const ref=m.facts.find(x=>x.k==='refus'&&x.a===fs[1].id&&x.d!==999999&&x.c===m.cycle);
      const avant=JSON.stringify(m); mgmtPasseCloturer(m);
      return {atomique,p,demande:m.facts[p.d],ref,demandeRef:m.facts[ref.d],n:m.passe.nFacts,total:m.facts.length,
        perdus:m.facts.some(x=>MGMT_PASSE_FAITS_PERDUS.includes(x.k)),invalide:m.facts.at(-1).d,
        ordre:JSON.stringify(ordre)===JSON.stringify(m.facts.map(x=>{const y={...x};delete y.d;return y;})),idem:avant===JSON.stringify(m)};`);
    assert.equal(r.demande.k,'demande'); for(const k of ['a','want','target']) assert.equal(r.p[k],r.demande[k]);
    assert.equal(r.demandeRef.k,'demande'); assert.equal(r.ref.a,r.demandeRef.a);
    assert.equal(r.n,r.total); assert.equal(r.perdus,false); assert.equal(r.invalide,999999); assert.equal(r.ordre,true); assert.equal(r.idem,true); assert.equal(r.atomique,true);
  }finally{w.close();}
});
test('Monde lot 5 T2 — les échéances survivent au passage de témoin et à la sauvegarde',()=>{
  const w=partie(true); try{
    const r=lire(w,`${TROIS} ${DERNIERE} const due=promesse.due; mgmtPasseCloturer(m);
      const etats=mgmtPromesses(m,f), brut=mgmtSerialiser(m), charge=mgmtParseAndValidate(brut);
      const p=m.facts.find(x=>x===promesse||x.k==='promesse'&&x.a===f.id&&x.c===promesse.c);
      return {reponse,due,c:promesse.c,apres:p.due,etat:etats.find(x=>x.c===promesse.c).etat,
        archive:!!JSON.parse(brut).passe.archive,lien:p.d<m.passe.nFacts,
        faits:JSON.stringify(m.facts)===JSON.stringify(charge.facts),etats:JSON.stringify(etats)===JSON.stringify(mgmtPromesses(charge,f)),valide:validateMgmt(charge)};`);
    assert.equal(r.due,r.c+3); assert.equal(r.apres,r.due); assert.equal(r.etat,'en cours');
    for(const k of ['reponse','archive','lien','faits','etats','valide']) assert.equal(r[k],true,k);
  }finally{w.close();}
  const v=partie(); try{
    assert.deepEqual(lire(v,`m.facts=m.facts.filter(x=>x.k!=='promesse'&&x.k!=='refus'); const charge=mgmtParseAndValidate(mgmtSerialiser(m));
      /* ==== [ANCRE: MONDE_LOT5_T3_VERSION_DEMANDES] — Monde lot 5 T3 ==== */
      return {v:charge.v,reponses:charge.facts.filter(x=>x.k==='promesse'||x.k==='refus').length,passe:!!charge.passe};`),{v:20,reponses:0,passe:false}); /* décision du 15/10/2026 : fusion du lot 6 (migration 18 → 19) ; avant : 18, lot 5 T4 */ /* fusion du lot 9 (15/10/2026) : 19 → 20, mondeVivant=false */
  }finally{v.close();}
});
test('Monde lot 5 T2 — une promesse héritée se tient ou se rompt selon les règles existantes',()=>{
  const w=partie(true); try{
    /* ==== [ANCRE: MONDE_LOT5_T2_TEST_SIGNATURE_ET_FAITS_COPIE] — Monde lot 5 T2 ==== */
    const r=lire(w,`${TROIS} m.card.main=[];
      const candidats=m.roster.filter(x=>!x.libre&&mgmtContratRestants(x)>0&&mgmtSelectable(m,x,null)&&!mgmtChampionIds(m).has(x.id));
      const f=candidats.find(a=>candidats.some(b=>b.id!==a.id&&mgmtSelectable(m,b,a.id)));
      const adversaire=candidats.find(b=>b.id!==f.id&&mgmtSelectable(m,b,f.id));
      const i=m.facts.length; mgmtAddFact(m,{c:m.cycle,k:'demande',a:f.id,want:'carte-principale'});
      mgmtRepondreDemande(m,i,'promettre'); const promesse=m.facts[m.facts.length-1];
      mgmtPasseCloturer(m); m.card.main=[];
      const histAvant=JSON.stringify(m.hist), soireesAvant=m.cal.faites.length;
      const signe=!!mgmtBookMain(m,f.id,adversaire.id);
      const surCarte=m.card.main.some(cf=>cf.slot==='main'&&(cf.a===f.id||cf.b===f.id));
      const sansCombat=histAvant===JSON.stringify(m.hist)&&soireesAvant===m.cal.faites.length&&m.hist.every(h=>h.c<promesse.c);
      const avant=JSON.stringify(m.facts);
      const etat=()=>mgmtPromesses(m,f).find(x=>x.c===promesse.c).etat;
      const signature=etat(); m.cycle=promesse.due; const limite=etat(); m.cycle++;
      const rompue=etat(), copie=JSON.parse(JSON.stringify(m));
      copie.hist.push({c:promesse.c+1,slot:'main',a:{id:f.id},b:{id:m.roster.find(x=>x.id!==f.id).id}});
      const faitsCopieAvant=JSON.stringify(copie.facts);
      const tenue=mgmtPromesses(copie,f).find(x=>x.c===promesse.c).etat;
      return {signe,surCarte,sansCombat,signature,limite,rompue,tenue,faits:avant===JSON.stringify(m.facts),faitsCopie:faitsCopieAvant===JSON.stringify(copie.facts)};`);
    assert.deepEqual(r,{signe:true,surCarte:true,sansCombat:true,signature:'en cours',limite:'en cours',rompue:'rompue',tenue:'tenue',faits:true,faitsCopie:true});
  }finally{w.close();}
});
