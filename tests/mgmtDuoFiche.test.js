"use strict";
/* ==== [ANCRE: TESTS_DUO_T59_FICHE] — Monde lot 19 T59 : la fiche complète des combattants du draft et des enchères, et les touches des écrans Duo.
   Un monde coûte 40 à 90 s à créer : un seul pour tout le test de comportement. ==== */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');

const json=(w,code)=>JSON.parse(w.eval(`JSON.stringify((function(){${code}})())`));
const touche=(w,key)=>w.eval(`keysHandle({key:${JSON.stringify(key)},shiftKey:false,preventDefault(){}})`);

test('Duo T59 — mgmtDuoPartieDe trouve la partie qui contient le combattant',()=>{
  const win=newGameWindow({runMain:true});
  const r=win.eval(`(function(){const b={roster:[{id:'b'}]},m={duo:{},roster:[{id:'j1'}],orgs:{b}};return ['j1','b','absent'].map(id=>mgmtDuoPartieDe(m,id));})()`);
  assert.equal(r[0].roster[0].id,'j1');
  assert.equal(r[1].roster[0].id,'b');
  assert.equal(r[2],null);
});

test('Duo T59 — la présentation ne modifie pas la valeur de vu',()=>{
  const win=newGameWindow({runMain:true});
  assert.equal(win.eval(`(function(){const m={duo:{soiree:{},cartes:[]}};MGMT_DUO_PRESENTATION={partie:m,index:0};MGMT_DUO_UI.vu=false;CL.mgmtDuoPresentationRetour();return MGMT_DUO_UI.vu;})()`),false);
});

test('Duo T59 — les touches des écrans Duo sont enregistrées sous le nom que le jeu reconnaît',()=>{
  const win=newGameWindow({runMain:true});
  const r=json(win,`const res={};for(const [ecran,touches] of [['mgmt_duo_encheres',['f','F','m','M','p','P']],['mgmt_duo_draft',['f','F']],['mgmt_duo_soiree',['f','F','p','P']]]){
    const carte=KEYS.maps[ecran]||{};res[ecran]=touches.filter(t=>typeof carte[t]!=='function');}return res;`);
  assert.deepEqual(r,{mgmt_duo_encheres:[],mgmt_duo_draft:[],mgmt_duo_soiree:[]});
});

test('Duo T59 — la fiche d’un combattant de J1, de J2 et d’un libre : ouverture, barre grisée, retour exact, sauvegarde intacte, touches F',()=>{
  const win=newGameWindow({runMain:true});
  win.eval("setSeed(20261018); mgmtPasseGenerer('split',{soirees:6}); mgmtMondeVivantGenerer(G.mgmt,{soirees:6}); mgmtDuoCreer(G.mgmt,'mma-korner',{a:'Anthony',b:'François'}); mgmtDuoAvancer(G.mgmt); saveMgmt();");
  /* 1. les trois parties : J1, J2, et l'organisation d'un lot libre */
  const p=json(win,`const m=G.mgmt,L=m.duo.encheres.lots[0],sous=m.orgs[m.duo.b];
    return {etape:m.duo.etape,j1:mgmtDuoPartieDe(m,m.roster[0].id)===m,j2:mgmtDuoPartieDe(m,sous.roster[0].id)===sous,libre:mgmtDuoPartieDe(m,L.id)===m.orgs[L.orgId],libreAilleurs:L.orgId!==m.duo.b};`);
  assert.equal(p.etape,'encheres');
  assert.deepEqual([p.j1,p.j2,p.libre,p.libreAilleurs],[true,true,true,true]);

  /* 2. aux enchères : F → la fiche du lot (partie de son organisation) ; retour → les enchères, intactes */
  const e=json(win,`const m=G.mgmt,L=m.duo.encheres.lots[0];G.screen='mgmt_duo_encheres';render();
    return {id:L.id,disque:stockageLire(mgmtSlotKey(MGMT_SLOT)),etat:JSON.stringify(m.duo.encheres)};`);
  assert.equal(touche(win,'f'),true,'la touche F est reconnue aux enchères');
  const f=json(win,`return {screen:G.screen,fiche:MGMT_FICHE.id,autrePartie:G.mgmt!==MGMT_DUO_FICHE.partie,retour:MGMT_FICHE.retour,
    grisees:[...document.querySelectorAll('.mf-barre-item')].filter(b=>!/mgmtMenuPrincipal/.test(b.getAttribute('onclick')||'')).every(b=>b.disabled)};`);
  assert.equal(f.screen,'mgmt_fiche'); assert.equal(f.fiche,e.id); assert.equal(f.autrePartie,true);
  assert.equal(f.retour,'mgmt_duo_fiche_retour'); assert.equal(f.grisees,true,'la barre des sections est grisée pendant la fiche');
  win.eval('saveMgmt()');   /* la sauvegarde n'écrit jamais la partie d'une autre organisation */
  assert.equal(win.eval('stockageLire(mgmtSlotKey(MGMT_SLOT))'),e.disque,'la sauvegarde est inchangée pendant la fiche');
  win.eval('CL.mgmtFicheRetour()');
  const r=json(win,`return {screen:G.screen,g:!!G.mgmt.duo&&G.mgmt.duo.b==='mma-korner',etat:JSON.stringify(G.mgmt.duo.encheres)};`);
  assert.equal(r.screen,'mgmt_duo_encheres'); assert.ok(r.g,'G.mgmt est de nouveau la partie de J1'); assert.equal(r.etat,e.etat,'les enchères sont identiques après l’aller-retour');

  /* 3. une erreur pendant l'ouverture rend quand même G.mgmt à J1 */
  const x=json(win,`const m=G.mgmt,vrai=CL.mgmtFiche;let leve=false;CL.mgmtFiche=()=>{throw new Error('x');};
    try{CL.mgmtDuoFiche(m.duo.encheres.lots[0].id,'mgmt_duo_encheres');}catch(err){leve=true;}CL.mgmtFiche=vrai;return {leve,g:G.mgmt===m};`);
  assert.deepEqual(x,{leve:true,g:true});

  /* 4. au draft : F ouvre la fiche du combattant choisi ; la catégorie et la sélection sont conservées au retour */
  win.eval(`(function(){const m=G.mgmt;while(m.duo.etape==='encheres') mgmtDuoPasser(m);G.screen='mgmt_duo_draft';render();})()`);
  const avant=win.eval('JSON.stringify([MGMT_DUO_DRAFT_UI,G.mgmt.duo.draft])');
  assert.equal(touche(win,'F'),true,'la touche F est reconnue au draft');
  assert.equal(win.eval('G.screen'),'mgmt_fiche');
  win.eval('CL.mgmtFicheRetour()');
  assert.equal(win.eval('G.screen'),'mgmt_duo_draft');
  assert.equal(win.eval('JSON.stringify([MGMT_DUO_DRAFT_UI,G.mgmt.duo.draft])'),avant,'le draft est intact après la fiche');
  assert.equal(win.eval('G.mgmt.duo.etape'),'draft');
});
