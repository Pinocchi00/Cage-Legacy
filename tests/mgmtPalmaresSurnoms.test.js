"use strict";
/* Demande d'Anthony (08/10/2026) : le palmarès amateur sur la fiche de chaque combattant, et les surnoms affichés dans le jeu. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const res=(w,code)=>JSON.parse(w.eval(`JSON.stringify((function(){ ${code} })())`));
const neuve=()=>{ const w=newGameWindow({runMain:true}); w.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(7); CL.mgmtEnter(1);`); return w; };

test('Palmarès amateur — dérivé de l’identifiant, identique à chaque lecture, jamais stocké ; bilan, finitions, débuts et titres', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt; const f=m.roster[3]; const a=mgmtPalmaresAmateur(m,f), b=mgmtPalmaresAmateur(m,f);
    const tous=m.roster.map(x=>mgmtPalmaresAmateur(m,x)); const sans=tous.filter(p=>!p||!(p.W>=0&&p.L>=0&&p.debuts>=16&&p.debuts<=21)).length;
    const titres=tous.filter(p=>p.titres.length>0).length;
    return {egal:JSON.stringify(a)===JSON.stringify(b),stocke:'amateur' in f||'palmares' in f,sans,titres,n:tous.length,fin:a.fin.ko+a.fin.sub+a.fin.dec===a.W+a.L||a.fin.ko+a.fin.sub+a.fin.dec<=a.W+a.L};`);
  assert.equal(r.egal,true); assert.equal(r.stocke,false); assert.equal(r.sans,0); assert.ok(r.titres>0&&r.titres<r.n,'quelques titres amateurs, pas tous'); assert.ok(r.fin);
});

test('Palmarès amateur — un combattant du monde extérieur garde le même bilan amateur que sa trace, une fois recruté', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt; const ext=m.exterieur[5]; const t=mgmtExteriorTrace(ext,m.cycle); const p=mgmtPalmaresAmateur(m,{id:ext.id,age:t.age});
    return {W:p.W===t.amateur.W,L:p.L===t.amateur.L};`);
  assert.deepEqual(r,{W:true,L:true});
});

test('Palmarès amateur — la fiche (onglet Combats) l’affiche pour un combattant de l’effectif', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt; const f=m.roster[2]; CL.mgmtFiche(f.id); CL.mgmtFicheOnglet('combats'); const t=document.getElementById('app').textContent; const p=mgmtPalmaresAmateur(m,f);
    return {titre:/SON PALMARÈS AMATEUR/.test(t),bilan:t.includes(p.W+'-'+p.L),debuts:t.includes('DÉBUTS À '+p.debuts+' ANS')};`);
  assert.deepEqual(r,{titre:true,bilan:true,debuts:true});
});

test('Surnoms — la bannière de la fiche, le classement affichent le surnom du combattant', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt; const f=m.roster.find(x=>mgmtSurnomDe(m,x.id)); const s=mgmtSurnomDe(m,f.id);
    CL.mgmtFiche(f.id); const fiche=document.querySelector('.mf-fb-nom')?document.querySelector('.mf-fb-nom').textContent.toUpperCase().includes(s.toUpperCase()):false;
    const div=m.roster[0].div; MGMT_CLASSEMENTS={div,scope:'split'}; MGMT_SU_CL.div=div; CL.go('mgmt_classements'); const txt=document.getElementById('app').textContent.toUpperCase();
    const vus=mgmtClassementLignes(m,div,MGMT_SU_CL.portee).slice(0,3+MGMT_SU_LIGNES_CLASSEMENT).map(x=>mgmtSurnomDe(m,x.id)).filter(Boolean);
    return {s:!!s,fiche,vus:vus.length,tous:vus.every(v=>txt.includes(v.toUpperCase())),manque:vus.filter(v=>!txt.includes(v.toUpperCase())),lignes:MGMT_SU_LIGNES_CLASSEMENT,stable:mgmtSurnomDe(m,f.id)===s,inconnu:mgmtSurnomDe(m,'zzz')};`);
  assert.equal(r.s,true); assert.equal(r.fiche,true,JSON.stringify(r)); assert.ok(r.vus>0,'des surnoms parmi les dix premiers : '+JSON.stringify(r)); assert.equal(r.tous,true,JSON.stringify(r)); assert.equal(r.stable,true); assert.equal(r.inconnu,'');
});
