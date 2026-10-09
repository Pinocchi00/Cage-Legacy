"use strict";
/* Lot 9 du brief démo (09/10/2026) : les textes, l'outillage et les corrections mécaniques. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs'), path=require('path'), os=require('os');
const {execFileSync}=require('child_process');
const {newGameWindow}=require('./helpers/loadGame');
const racine=path.join(__dirname,'..');
const res=(w,code)=>JSON.parse(w.eval(`JSON.stringify((function(){ ${code} })())`));
const neuve=()=>{ const w=newGameWindow({runMain:true}); w.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(7); CL.mgmtEnter(1);`); return w; };
const fichiersJeu=()=>fs.readdirSync(racine).filter(f=>/\.js$/.test(f)&&!/^(eslint\.config|sw)\.js$/.test(f));

test('T1 — l’export des textes à relire liste tous les fichiers du jeu qui portent la marque relu:false', () => {
  const tmp=path.join(os.tmpdir(),'textes-a-relire-demo.md');
  execFileSync(process.execPath,[path.join(racine,'tools','exporter-textes.js'),'--out',tmp],{stdio:'ignore',timeout:180000});
  const md=fs.readFileSync(tmp,'utf8');
  const marques=fichiersJeu().filter(f=>/relu\s*:\s*false/.test(fs.readFileSync(path.join(racine,f),'utf8')));
  assert.ok(marques.length>=19);
  for(const f of marques) assert.ok(md.includes('`'+f+'`'),'le fichier '+f+' est dans l’export');
  assert.match(md,/Les textes à relire — \d+ textes/);
});

test('T2 — aucune chaîne « [EMPLACEMENT AUTEUR » ne peut atteindre l’écran : seuls les commentaires en portent', () => {
  const fautifs=[];
  for(const f of fichiersJeu()){
    fs.readFileSync(path.join(racine,f),'utf8').split(/\r?\n/).forEach((l,i)=>{
      if(/^\s*(\/\*|\*|\/\/)/.test(l)) return;
      if(/['"`]\[EMPLACEMENT AUTEUR/.test(l)) fautifs.push(f+':'+(i+1));
    });
  }
  assert.deepEqual(fautifs,[]);
});

test('T3 — la raison de Leïla pour un préliminaire féminin est au féminin', () => {
  const w=neuve();
  const r=res(w,`const m=G.mgmt, fem=m.roster.filter(f=>(divById(f.div)||{}).gender==='F'), hom=m.roster.filter(f=>(divById(f.div)||{}).gender==='M');
    return {f:mgmtPrelimsRaisons(m,fem[0],fem[1]),h:mgmtPrelimsRaisons(m,hom[0],hom[1])};`);
  const toutes=r.f.join(' '); assert.ok(!/combattants/.test(toutes)); assert.ok(!/ battu /i.test(' '+toutes+' ')||/Battue|battue/.test(toutes)||!/battu par/i.test(toutes));
});

test('T4 — le lendemain écrit « Co-principal », comme le reste du jeu', () => {
  const w=neuve();
  const r=res(w,`return MGMT_LD_LABELS.coMain;`);
  assert.equal(r,'Co-principal');
});
