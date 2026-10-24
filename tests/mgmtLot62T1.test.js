"use strict";
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {newGameWindow}=require('./helpers/loadGame');
const jouer=require('./helpers/jouerSoirees');

test('Monde lot 62 T1 — trois années réelles déclenchent les cérémonies et clôtures une seule fois',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval("window.__lot62={ceremonies:0,classements:0};const calc=mgmtCeremonieCalculer,clot=mgmtGuerreFinAnnee;mgmtCeremonieCalculer=function(m){window.__lot62.ceremonies++;return calc(m)};mgmtGuerreFinAnnee=function(m,a){window.__lot62.classements++;return clot(m,a)};");
    w.eval("setSeed(20261024);const m=mgmtPasseGenerer('split',{soirees:3});mgmtMondeVivantGenerer(m,{soirees:3});");
    const initial=w.eval('G.mgmt.hist.length');
    let jouees=0;
    while(jouees<180){
      const n=jouer(w,1);if(!n)break;jouees+=n;
      w.eval('saveMgmt();G.mgmt=null;loadMgmt();');
      const ceremonies=w.eval('window.__lot62.ceremonies');
      if(ceremonies>=3)break;
    }
     const result=w.eval(`(()=>{const m=G.mgmt;const prix=m.roster.flatMap(f=>(f.prixAnnee||[]).map(p=>p.annee));const avant=JSON.stringify(m.guerre);return {annees:m.guerre&&m.guerre.anneeTraitee||0,prix,valid:validateMgmt(m),hist:m.hist.length,jour:m.cal.jour,avant,apres:JSON.stringify(m.guerre),liens:scr_mgmt_accueil(),compteurs:window.__lot62}})()`);
    assert.ok(jouees>0&&jouees<180);
    assert.ok(result.annees>=3,`clôtures obtenues: ${result.annees}`);
    assert.equal(result.compteurs.ceremonies,3,'le calcul des prix est exécuté exactement une fois par année');
    assert.equal(result.compteurs.classements,3,'le classement est clôturé exactement une fois par année');
    assert.ok(result.prix.length>0,'les prix sont consignés sur les fiches');
    assert.equal(result.avant,result.apres,'la vérification passive après sauvegarde/rechargement ne modifie pas les clôtures traitées');
    assert.equal(result.valid,true);
    assert.ok(result.hist>initial);
    const accueil=fs.readFileSync(path.join(__dirname,'..','mgmt-accueil.js'),'utf8');
    assert.ok(accueil.indexOf('ceremonieVisible?')<accueil.indexOf('bilanVisible?'),'la cérémonie est avant le bilan');
  }finally{w.close();}
});

test('Monde lot 62 T1 — la cérémonie vide présente honnêtement ses rubriques',()=>{
  const w=newGameWindow({runMain:true});
  try{const empty=w.eval("(()=>{const m=mgmtPasseGenerer('split',{soirees:3});m.hist=[];m.facts=[];m.roster.forEach(f=>delete f.prixAnnee);G.mgmt=m;return mgmtCarnetLire(m).prix.length})()");assert.equal(empty,0);}
  finally{w.close();}
});
