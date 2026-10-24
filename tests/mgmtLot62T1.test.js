"use strict";
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {newGameWindow}=require('./helpers/loadGame');
const jouer=require('./helpers/jouerSoirees');
const fixtureHistorique=fs.readFileSync(path.join(__dirname,'fixtures','mgmt-sauvegarde-14.json'),'utf8');

test('Monde lot 62 T1 — trois années réelles déclenchent les cérémonies et clôtures une seule fois',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval("window.__lot62={ceremonies:0,classements:0,prix:[]};const calc=mgmtCeremonieCalculer,clot=mgmtGuerreFinAnnee;mgmtCeremonieCalculer=function(m){window.__lot62.ceremonies++;const prix=calc(m);window.__lot62.prix.push(...prix.map(p=>p.id));return prix};mgmtGuerreFinAnnee=function(m,a){window.__lot62.classements++;return clot(m,a)};");
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
    assert.ok(result.annees>=3,`année de dernière clôture obtenue: ${result.annees}`);
    assert.equal(result.compteurs.ceremonies,3,'le calcul des prix est exécuté exactement une fois par année');
    assert.equal(result.compteurs.classements,3,'le classement est clôturé exactement une fois par année');
    assert.ok(result.compteurs.prix.includes('revelation'),'la révélation est décernée sur le parcours réel');
    assert.ok(result.compteurs.prix.includes('retour'),'le retour est décerné sur le parcours réel');
    assert.ok(result.prix.length>0,'les prix sont consignés sur les fiches');
    assert.equal(result.avant,result.apres,'la vérification passive après sauvegarde/rechargement ne modifie pas les clôtures traitées');
    assert.equal(result.valid,true);
    assert.ok(result.hist>initial);
    const accueil=fs.readFileSync(path.join(__dirname,'..','mgmt-accueil.js'),'utf8');
    assert.ok(accueil.indexOf('ceremonieVisible?')<accueil.indexOf('bilanVisible?'),'la cérémonie est avant le bilan');
  }finally{w.close();}
});

test('Monde lot 62 T1 — le carnet vide présente honnêtement ses rubriques',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const empty=w.eval("(()=>{const m=mgmtPasseGenerer('split',{soirees:3});m.hist=[];m.facts=[];m.roster.forEach(f=>delete f.prixAnnee);G.mgmt=m;return {prix:mgmtCarnetLire(m).prix.length,ecran:scr_mgmt_carnet()}})()");
    assert.equal(empty.prix,0);
    assert.equal((empty.ecran.match(/Rien encore\./g)||[]).length,7,'chaque rubrique vide du carnet annonce explicitement son absence de contenu');
  }
  finally{w.close();}
});

test('Monde lot 62 T1 — une sauvegarde historique v14 chargée joue une soirée sans erreur',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`window.__lot62Historique=${JSON.stringify(fixtureHistorique)};`);
    const charge=w.eval('mgmtParseAndValidate(window.__lot62Historique)');
    assert.ok(charge,'la fixture historique est acceptée par la porte de chargement');
    w.eval('G.mgmt=mgmtMigrate(JSON.parse(window.__lot62Historique));');
    assert.equal(w.eval('validateMgmt(G.mgmt)'),true,'la sauvegarde migrée est valide');
    const jouees=jouer(w,1);
    assert.ok(jouees>=1,'une soirée est jouée depuis la sauvegarde historique migrée');
  }finally{w.close();}
});

test('Monde lot 62 T1 — cinquante soirées réelles ne répètent pas une phrase de prix au même combattant',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval("window.__lot62Phrases=[];window.__lot62Editions=new Set();const calcul=mgmtCeremonieCalculer;mgmtCeremonieCalculer=function(m){const prix=calcul(m);const edition=prix.length&&prix[0].phrase.match(/Édition (\\d+)\\.$/);if(edition&&!window.__lot62Editions.has(edition[1])){window.__lot62Editions.add(edition[1]);for(const p of prix)for(const id of p.laureats||[p.laureat])if(id)window.__lot62Phrases.push({id,prix:p.id,phrase:p.phrase});}return prix};setSeed(20261024);const m=mgmtPasseGenerer('split',{soirees:3});mgmtMondeVivantGenerer(m,{soirees:3});");
    let jouees=0;
    while(jouees<50){const n=jouer(w,Math.min(50-jouees,5));if(!n)break;jouees+=n;}
    assert.equal(jouees,50,'cinquante soirées sont jouées par le parcours réel');
    const phrases=w.eval('window.__lot62Phrases');
    assert.ok(phrases.some(x=>x.prix==='revelation'),'la révélation est décernée pendant le parcours de cinquante soirées');
    const parCombattant=new Map();
    for(const entree of phrases){const liste=parCombattant.get(entree.id)||[];liste.push(entree.phrase);parCombattant.set(entree.id,liste);}
    for(const [id,liste] of parCombattant)assert.equal(new Set(liste).size,liste.length,`aucune phrase ne se répète pour ${id}`);
  }finally{w.close();}
});
