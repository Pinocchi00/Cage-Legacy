"use strict";
/* Monde lot 33 T1 — un seul geste : Suivre. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const jouer=require('./helpers/jouerSoirees');

function neuve(){ const win=newGameWindow({runMain:true}); win.eval('setSeed(33); CL.mgmtEnter(1);'); return win; }

test('Migration — cercle et suivis sont réunis, une soirée se joue et la liste survit à la sérialisation',()=>{
  const win=neuve();
  const ok=win.eval(`(()=>{const m=G.mgmt, ids=m.roster.slice(0,5).map(f=>f.id); m.cercle=ids.slice(0,3); m.suivis=ids.slice(3,5); const raw=JSON.parse(JSON.stringify(m)); const parsed=mgmtParseAndValidate(JSON.stringify(raw)); if(!parsed)return false; const fixed=mgmtRepair(parsed); const expected=ids; const good=JSON.stringify(fixed.suivis)===JSON.stringify(expected)&&fixed.cercle.length===0; G.mgmt=fixed; return good;})()`);
  assert.equal(ok,true); jouer(win,1); const round=win.eval(`const s=JSON.stringify(G.mgmt); const m=mgmtRepair(mgmtParseAndValidate(s)); JSON.stringify(m.suivis)`); assert.equal(round,win.eval('JSON.stringify(G.mgmt.suivis)'));
});

test('Suivi — ajoute en tête, retire, refuse au plafond et refuse un identifiant invalide ; le cercle est un alias',()=>{
  const win=neuve();
  const r=win.eval(`(()=>{const m={cercle:[],suivis:['a']}; const add=mgmtSuiviToggle(m,'b'), head=m.suivis[0], remove=mgmtSuiviToggle(m,'b'); const full={cercle:[],suivis:Array.from({length:60},(_,i)=>'x'+i)}; const cap=mgmtSuiviToggle(full,'overflow'); const bad=mgmtSuiviToggle(m,'<bad>'); const alias=mgmtCercleToggle(m,'c'); return {add,head,remove,cap,bad,alias,aliasHead:m.suivis[0]};})()`);
  assert.deepEqual(JSON.parse(JSON.stringify(r)),{add:true,head:'b',remove:true,cap:false,bad:false,alias:true,aliasHead:'c'});
});

test('Lien — mgmtLien ne rend jamais « cercle »',()=>{
  const win=neuve(); assert.equal(win.eval(`mgmtLien({cercle:['x'],suivis:[]},'x')`),null); assert.equal(win.eval(`mgmtLien({cercle:['x'],suivis:['x']},'x')`),'suivi');
});

test('Placement — un combattant suivi reste éligible au placement de Leïla et au picker de carte',()=>{
  const win=neuve();
  const res=win.eval(`(()=>{const m=G.mgmt, f=m.roster[0]; m.suivis=[f.id]; m.cercle=[]; const reserve=mgmtAgendaReserve(m,f); const picker=mgmtSelectable(m,f,null); return {reserve,picker};})()`);
  assert.deepEqual(JSON.parse(JSON.stringify(res)),{reserve:false,picker:true});
});

test('Écrans — la fiche a un seul bouton Suivre/SUIVI et le vestiaire un seul filtre Suivis',()=>{
  const win=neuve(); win.eval('CL.go("mgmt_vestiaire")');
  let text=win.eval('document.getElementById("app").textContent'); assert.ok(text.includes('Suivis')); assert.equal((text.match(/Ton cercle/g)||[]).length,0);
  const lien=win.eval('mgmtFicheLien(G.mgmt,G.mgmt.roster[0])');
  assert.equal((lien.match(/<button\b/g)||[]).length,1); assert.ok(lien.includes('Suivre')||lien.includes('SUIVI')); assert.equal(lien.includes('Ton cercle'),false);
});

test('Clavier — S bascule le suivi du combattant de la fiche ouverte',()=>{
  const win=neuve(); const id=win.eval('G.mgmt.roster[0].id'); win.eval(`CL.mgmtFiche(${JSON.stringify(id)})`);
  win.eval('keysHandle({key:"s",preventDefault(){}})'); assert.equal(win.eval(`G.mgmt.suivis.includes(${JSON.stringify(id)})`),true);
  win.eval('keysHandle({key:"s",preventDefault(){}})'); assert.equal(win.eval(`G.mgmt.suivis.includes(${JSON.stringify(id)})`),false);
});
