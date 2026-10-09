"use strict";
/* Lot 3 du brief démo (09/10/2026) : la version PC — l'emballage ne charge que ce que charge index.html, « Quitter », la fenêtre, le service worker. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs'), path=require('path'), os=require('os');
const {newGameWindow}=require('./helpers/loadGame');
const {listerFichiers,copier}=require('../pc/construire');
const racine=path.join(__dirname,'..');
const res=(w,code)=>JSON.parse(w.eval(`JSON.stringify((function(){ ${code} })())`));

test('T1 — pc/ ne charge aucun fichier hors de la liste de index.html', () => {
  const liste=listerFichiers();
  const html=fs.readFileSync(path.join(racine,'index.html'),'utf8');
  const scripts=[...html.matchAll(/<script[^>]*\ssrc="([^"?]+)/g)].map(m=>m[1]).filter(u=>!/^(https?:)?\/\//.test(u));
  assert.ok(scripts.length>100);
  for(const s of scripts) assert.ok(liste.includes(s),'le script '+s+' est livré');
  for(const f of liste){
    assert.ok(fs.existsSync(path.join(racine,f)),f+' existe');
    assert.ok(!/^(tests|tools|docs|pc|node_modules|\.git|maquettes|prototypes)\//.test(f),f+' n’est pas du jeu');
  }
  assert.ok(!liste.includes('sw.js'),'le service worker n’est pas livré à la version PC');
  const main=fs.readFileSync(path.join(racine,'pc','main.js'),'utf8');
  assert.ok(!/loadURL\(|https?:\/\//.test(main.replace(/\/\*[\s\S]*?\*\//g,'')),'la fenêtre ne charge que des fichiers locaux');
  assert.equal((main.match(/loadFile\(/g)||[]).length,1);
});

test('T5 — la construction copie le jeu, fixe CL_DEMO à true dans la copie de la démo seulement, et ne touche pas au jeu', () => {
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'cl-pc-'));
  const n=copier(path.join(tmp,'complet'));
  const nd=copier(path.join(tmp,'demo'),{demo:true});
  assert.equal(n,nd);
  assert.match(fs.readFileSync(path.join(tmp,'complet','demo-config.js'),'utf8'),/let CL_DEMO=false;/);
  assert.match(fs.readFileSync(path.join(tmp,'demo','demo-config.js'),'utf8'),/let CL_DEMO=true;/);
  assert.match(fs.readFileSync(path.join(racine,'demo-config.js'),'utf8'),/let CL_DEMO=false;/);
  assert.ok(fs.existsSync(path.join(tmp,'demo','index.html')));
});

test('T2 — dans la version PC, « Quitter » est actif sur l’accueil et sauvegarde avant de fermer', () => {
  const w=newGameWindow({runMain:true});
  const r=res(w,`const avant=mfMenu().find(x=>x.id==='quitter').grise===true; let ferme=0;
    window.cageStockagePC={lire:()=>null,ecrire:()=>{},supprimer:()=>{},quitter:()=>{ ferme++; },fenetre:()=>{}};
    const q=mfMenu().find(x=>x.id==='quitter'); CL.mfQuitter(); delete window.cageStockagePC;
    return {avant,actif:!q.grise,action:q.action,ferme};`);
  assert.deepEqual(r,{avant:true,actif:true,action:'CL.mfQuitter()',ferme:1});
});

test('T3 — plein écran et taille de la fenêtre s’appliquent par le moteur de la version PC', () => {
  const w=newGameWindow({runMain:true});
  const r=res(w,`const appels=[]; window.cageStockagePC={lire:()=>null,ecrire:()=>{},supprimer:()=>{},quitter:()=>{},fenetre:x=>{ appels.push(x); }};
    mgmtReglagesChanger('affichage','taille',2560); mgmtReglagesAppliquer('affichage'); delete window.cageStockagePC; return appels[appels.length-1];`);
  assert.equal(r.taille,2560); assert.equal(typeof r.plein,'boolean');
});

test('T3 — le service worker n’est pas enregistré dans la version PC', () => {
  const w=newGameWindow({runMain:false});
  const r=res(w,`const pasPC=!stockageMoteurPC(); window.cageStockagePC={lire:()=>null,ecrire:()=>{},supprimer:()=>{}}; const pc=!!stockageMoteurPC(); delete window.cageStockagePC; return {pasPC,pc};`);
  assert.deepEqual(r,{pasPC:true,pc:true});
  const src=fs.readFileSync(path.join(racine,'main.js'),'utf8');
  assert.match(src,/!stockageMoteurPC\(\)\)\{\s*\n?\s*window\.addEventListener\('load'/);
});
