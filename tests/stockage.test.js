"use strict";
/* Lot 2 du brief démo (09/10/2026) : des sauvegardes qui survivent à un plantage — la porte unique, l'échec qui se voit, l'export et l'import. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs'), path=require('path');
const {newGameWindow}=require('./helpers/loadGame');
const racine=path.join(__dirname,'..');
const res=(w,code)=>JSON.parse(w.eval(`JSON.stringify((function(){ ${code} })())`));
const neuve=()=>{ const w=newGameWindow({runMain:true}); w.eval(`setSeed(7); CL.mgmtEnter(1);`); return w; };

test('T1 — plus aucun appel à localStorage hors de stockage.js', () => {
  const fautifs=[];
  const fichiers=[...fs.readdirSync(racine).filter(f=>/\.js$/.test(f)),...fs.readdirSync(path.join(racine,'state')).map(f=>'state/'+f)];
  for(const f of fichiers){
    if(/^(stockage|eslint\.config|sw)\.js$/.test(f)) continue;
    fs.readFileSync(path.join(racine,f),'utf8').split(/\r?\n/).forEach((l,i)=>{
      if(/^\s*(\/\*|\*|\/\/)/.test(l)) return;
      if(/localStorage\s*\./.test(l)||/typeof localStorage/.test(l)) fautifs.push(f+':'+(i+1));
    });
  }
  assert.deepEqual(fautifs,[]);
});

test('T2 — avec un stockage qui refuse d’écrire, saveMgmt signale l’échec, l’état en mémoire reste intact, et « Réessayer » rétablit', () => {
  const w=neuve();
  const r=res(w,`const m=G.mgmt, cycle=m.cycle, n=m.roster.length; const vrai=localStorage.setItem.bind(localStorage);
    Storage.prototype.setItem=function(){ throw new Error('quota'); };
    const ok=saveMgmt(); const alerte=!!document.getElementById('stockage-alerte'); const texte=alerte?document.getElementById('stockage-alerte').textContent:'';
    Storage.prototype.setItem=function(k,v){ return vrai(k,v); };
    stockageReessayer(); const apres=!!document.getElementById('stockage-alerte');
    return {ok,alerte,texte,intact:G.mgmt===m&&m.cycle===cycle&&m.roster.length===n,apres,echec:STOCKAGE_ECHEC};`);
  assert.equal(r.ok,false); assert.equal(r.alerte,true); assert.ok(r.texte.includes('Réessayer')); assert.equal(r.intact,true); assert.equal(r.apres,false); assert.equal(r.echec,false);
});

test('T3 — la version PC se branche derrière la même porte : un moteur de fichiers prend la lecture, l’écriture et la suppression', () => {
  const w=neuve();
  const r=res(w,`const f={}; window.cageStockagePC={lire:k=>f[k]===undefined?null:f[k],ecrire:(k,v)=>{ f[k]=v; },supprimer:k=>{ delete f[k]; }};
    stockageEcrire('a','1'); const lu=stockageLire('a'); stockageSupprimer('a'); const apres=stockageLire('a'); saveMgmt();
    const sauvee=Object.keys(f).some(k=>k.indexOf('cage-legacy-mgmt')===0); delete window.cageStockagePC;
    return {lu,apres,sauvee};`);
  assert.equal(r.lu,'1'); assert.equal(r.apres,null); assert.equal(r.sauvee,true);
});

test('T4 — exporter une partie, effacer l’emplacement, importer : la partie est identique octet pour octet', () => {
  const w=neuve();
  const r=res(w,`const m=G.mgmt; saveMgmt(); const cle=mgmtSlotKey(MGMT_SLOT); const avant=stockageLire(cle), texte=mgmtPartieExportee(m);
    stockageSupprimer(cle); stockageSupprimer(mgmtSlotBackupKey(MGMT_SLOT)); const vide=stockageLire(cle)===null;
    const rep=mgmtPartieImporter(texte,MGMT_SLOT); const apres=stockageLire(cle);
    return {vide,ok:rep.ok,identique:apres===avant};`);
  assert.deepEqual(r,{vide:true,ok:true,identique:true});
});

test('T4 — importer un fichier abîmé ou d’une version inconnue : refus propre, rien n’est écrasé', () => {
  const w=neuve();
  const r=res(w,`const m=G.mgmt; saveMgmt(); const cle=mgmtSlotKey(MGMT_SLOT), avant=stockageLire(cle);
    const a=mgmtPartieImporter('pas du json',MGMT_SLOT), b=mgmtPartieImporter(JSON.stringify({v:999,org:'x'}),MGMT_SLOT), c=mgmtPartieImporter('',MGMT_SLOT);
    return {a:a.ok,b:b.ok,c:c.ok,intact:stockageLire(cle)===avant};`);
  assert.deepEqual(r,{a:false,b:false,c:false,intact:true});
});

test('T4 — l’onglet Partie des options offre l’export et l’import', () => {
  const w=neuve();
  const r=res(w,`return MGMT_OP_LIGNES.partie.map(l=>l.cle);`);
  assert.ok(r.includes('exporter')); assert.ok(r.includes('importer'));
});
