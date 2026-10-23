"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const jouer=require('./helpers/jouerSoirees');

/* ==== [ANCRE: TESTS_MONDE_LOT52_T1] — Monde lot 52 T1 : la compression de la sauvegarde (brief du 22/10, acceptée par Anthony) ==== */
test('Monde lot 52 T1 — aller-retour exact sur 200 chaînes variées, sortie sûre pour localStorage',()=>{
  const w=newGameWindow({runMain:true});
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{
    let s=987654321; const rnd=()=>{ s=(Math.imul(s,1664525)+1013904223)>>>0; return s/4294967296; };
    const lots=[''];
    for(let i=0;i<198;i++){
      const k=i%6, n=1+Math.floor(rnd()*(k===5?30000:600));
      let t='';
      if(k===0) for(let j=0;j<n;j++) t+=String.fromCharCode(32+Math.floor(rnd()*95));
      else if(k===1) for(let j=0;j<n;j++) t+='{"a":'+Math.floor(rnd()*50)+',"b":"x"},';
      else if(k===2) for(let j=0;j<n;j++) t+=String.fromCharCode(Math.floor(rnd()*0xD7FF));
      else if(k===3) t='é€😀日本語—'.repeat(1+(n%40));
      else if(k===4) t='a'.repeat(n);
      else for(let j=0;j<n;j++) t+=(rnd()<0.5?'alpha':'beta')+j%7;
      lots.push(t);
    }
    lots.push('x'.repeat(2000000)); lots.push('\u0001\u0002\u0000 mélange');
    let faux=0, nonSure=0;
    for(const t of lots){
      const z=mgmtCompresser(t);
      if(mgmtDecompresser(z)!==t) faux++;
      try{ encodeURIComponent(z); }catch(e){ nonSure++; }
    }
    return {n:lots.length,faux,nonSure};
  })())`));
  assert.ok(r.n>=200);assert.equal(r.faux,0);assert.equal(r.nonSure,0);
});

test('Monde lot 52 T1 — une entrée corrompue rend null, jamais une exception',()=>{
  const w=newGameWindow({runMain:true});
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{
    const z=mgmtCompresser(JSON.stringify({a:[1,2,3],b:'bonjour bonjour bonjour'}).repeat(20));
    const cas=[z.slice(0,z.length>>1), z.slice(0,5), '\u0001', '', 'pas compressé', z.slice(0,40)+'\uD800'+z.slice(41), z.slice(0,40)+'\u0000'+z.slice(41), null, 42, undefined];
    return cas.map(c=>{ try{ const d=mgmtDecompresser(c); return d===null||typeof d==='string'; }catch(e){ return false; } }).concat([mgmtDecompresser(cas[0])===null,mgmtDecompresser(cas[2])===''||mgmtDecompresser(cas[2])===null,mgmtDecompresser('')===null,mgmtDecompresser(cas[4])===null]);
  })())`));
  assert.ok(r.every(Boolean));
});

test('Monde lot 52 T1 — une sauvegarde ancienne non compressée se charge toujours',()=>{
  const w=newGameWindow({runMain:true});
  const ok=w.eval(`(()=>{setSeed(20261008);const m=mgmtPasseGenerer('split',{soirees:3});G={theme:'dark',mgmt:m};
    const brut=mgmtSerialiser(m); stockageEcrire(mgmtSlotKey(MGMT_SLOT),brut); stockageEcrire(mgmtSlotBackupKey(MGMT_SLOT),'');
    G.mgmt=null; const charge=loadMgmt(); return charge&&mgmtSerialiser(G.mgmt)===mgmtSerialiser(mgmtRepair(mgmtParseAndValidate(brut)));})()`);
  assert.equal(ok,true);
});

test('Monde lot 52 T1 — une sauvegarde compressée se recharge à l\'identique ; la principale corrompue retombe sur le secours',()=>{
  const w=newGameWindow({runMain:true});
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{setSeed(20261008);const m=mgmtPasseGenerer('split',{soirees:3});mgmtMondeVivantGenerer(m,{soirees:3});G={theme:'dark',mgmt:m};
    saveMgmt(); saveMgmt();
    const cle=mgmtSlotKey(MGMT_SLOT), stocke=stockageLire(cle);
    const avant=mgmtSerialiser(G.mgmt);
    G.mgmt=null; const a=loadMgmt(), identique=mgmtSerialiser(G.mgmt)===avant;
    const compresse=stocke.charAt(0)==='\u0001', ratio=stocke.length/avant.length, octets=mgmtDecompresser(stocke)===avant;
    stockageEcrire(cle,stocke.slice(0,stocke.length>>1));
    G.mgmt=null; const b=loadMgmt(), viaSecours=mgmtSerialiser(G.mgmt)===avant;
    stockageEcrire(cle,stocke.slice(0,stocke.length>>1)); stockageEcrire(mgmtSlotBackupKey(MGMT_SLOT),'abîmé');
    G.mgmt=null; const c=loadMgmt();
    return {a,identique,compresse,octets,ratio,b,viaSecours,c};
  })())`));
  assert.equal(r.a,true);assert.equal(r.identique,true);assert.equal(r.compresse,true);assert.equal(r.octets,true);assert.ok(r.ratio<=0.6,'ratio '+r.ratio);
  assert.equal(r.b,true);assert.equal(r.viaSecours,true);assert.equal(r.c,false);
});

test('Monde lot 52 T1 — vitesse : une sauvegarde après une action et un chargement tiennent sous 400 ms / 800 ms (partie de six soirées)',()=>{
  /* La partie neuve complète (62 + 62 soirées) est mesurée dans mgmtReleveReduit.test.js, qui la génère déjà : une seule génération par série. */
  const w=newGameWindow({runMain:true});
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{setSeed(20261008);const m=mgmtPasseGenerer('split',{soirees:6});mgmtMondeVivantGenerer(m,{soirees:6});G={theme:'dark',mgmt:m};
    saveMgmt();
    const mesure=f=>{ const t=performance.now(); f(); return performance.now()-t; };
    m.treasury+=1;   /* l'action du joueur : le corps change, les gros blocs de passé non */
    const save=mesure(()=>saveMgmt()), load=mesure(()=>loadMgmt());
    return {save,load};
  })())`));
  assert.ok(r.save<400,'sauvegarde '+r.save);assert.ok(r.load<800,'chargement '+r.load);
});

test('Monde lot 52 T1 — six soirées jouées se sauvegardent et se rechargent sans perte',()=>{
  const w=newGameWindow({runMain:true});
  w.eval(`setSeed(20261008); CL.mgmtEnter(1);`);
  const n=jouer(w,6);
  assert.ok(n>=1);
  const ok=w.eval(`(()=>{ saveMgmt(); const avant=mgmtSerialiser(G.mgmt); const cycle=G.mgmt.cycle; G.mgmt=null; return loadMgmt()&&G.mgmt.cycle===cycle&&mgmtSerialiser(G.mgmt)===avant; })()`);
  assert.equal(ok,true);
});
