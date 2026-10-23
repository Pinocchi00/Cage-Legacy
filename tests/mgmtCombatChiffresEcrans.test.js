"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const creer=()=>{const w=newGameWindow({runMain:true});w.eval("setSeed(20261008);mgmtPasseGenerer('split',{soirees:6});");return w;};

test('brief du 22/10, P1 T5 — vue chiffres affiche le face-à-face dans l’ordre et Tab alterne',()=>{
  const w=creer();
  const r=w.eval(`(()=>{const m=G.mgmt,a=m.roster[0],b=m.roster.find(f=>f.id!==a.id),v={mode:'combat',ids:[a.id,b.id],page:0,nom:0,vue:'histoire'};const h=mgmtPresentationHtml(m,v);const x=mgmtFaceAFace(m,a.id,b.id);v.vue='chiffres';const c=mgmtPresentationHtml(m,v);return {h,c,ids:x.lignes.map(q=>q.id),solo:mgmtPresentationHtml(m,{mode:'combattant',ids:[a.id],vue:'chiffres',page:0,nom:0}),labels:['Taille','Allonge','Coups significatifs donnés par minute','Précision','Encaissés par minute','Défense debout','Amenées par 15 minutes','Défense d’amenée','Contrôle par 15 minutes'],vals:x.lignes.map(q=>q.a),missing:x.lignes.filter(q=>(q.id==='taille'||q.id==='allonge')&&q.a==null&&q.b==null).length};})()`);
  let last=-1;for(const label of r.labels){if((label==='Taille'&&r.vals[0]==null)||(label==='Allonge'&&r.vals[1]==null))continue;const at=r.c.indexOf(label);assert.ok(at>last,label);last=at;}
  assert.equal((r.c.match(/class="mf-cc-ligne"/g)||[]).length,9-r.missing);assert.ok(r.c.includes('mf-cc-bar'));assert.ok(r.solo.includes('mf-pr-rangee'));
  assert.deepEqual(JSON.parse(JSON.stringify(r.ids)),['taille','allonge','sigParMin','precision','encaisseParMin','defense','ameneesPar15','defenseAmenee','controlePar15']);
  w.eval(`mgmtPresentationPartie=G.mgmt;MGMT_PRESENTATION_UI.pile=[{mode:'combat',vue:'histoire'}];render=()=>{};CL.mgmtPresentationVueAlterner()`);assert.equal(w.eval("MGMT_PRESENTATION_UI.pile[0].vue"),'chiffres');
});
test('brief du 22/10, P1 T5 — taille et allonge absentes si inconnues, visibles si connues',()=>{
  const w=creer();const r=w.eval(`(()=>{const m=G.mgmt,a=m.roster[0],b=m.roster.find(f=>f.id!==a.id),v={mode:'combat',ids:[a.id,b.id],page:0,nom:0,vue:'chiffres'},original=mgmtFaceAFace;const absent=mgmtPresentationHtml(m,v);mgmtFaceAFace=()=>({lignes:[{id:'taille',a:null,b:null},{id:'allonge',a:null,b:null},...original(m,a.id,b.id).lignes.slice(2)],a:{documentes:2},b:{documentes:2}});const sans=mgmtPresentationHtml(m,v);mgmtFaceAFace=()=>({lignes:[{id:'taille',a:188,b:175},{id:'allonge',a:190,b:185},...original(m,a.id,b.id).lignes.slice(2)],a:{documentes:2},b:{documentes:2}});const avec=mgmtPresentationHtml(m,v);mgmtFaceAFace=original;return {sans,avec};})()`);
  assert.doesNotMatch(r.sans,/mf-cc-label">(?:Taille|Allonge)</);assert.match(r.sans,/--mf-cc-lignes:7/);
  assert.match(r.avec,/mf-cc-label">Taille</);assert.match(r.avec,/1,88 m/);assert.match(r.avec,/mf-cc-label">Allonge</);assert.match(r.avec,/1,90 m/);assert.match(r.avec,/--mf-cc-lignes:9/);
});
test('brief du 22/10, P1 T5 — Résultats affiche les totaux et un bloc par round, rien sans relevé',()=>{
  const w=creer();const r=w.eval(`(()=>{const row=Array(28).fill(0);row[0]=3;row[1]=6;row[7]=2;row[8]=4;row[10]=1;row[11]=42;const t={a:{id:'a'},b:{id:'b'},s:{d:600,r:[row,row,row],e:[Array(12).fill(0),Array(12).fill(0)]}};const h=mgmtSuReChiffresHtml({},t);return {h,abs:mgmtSuReChiffresHtml({},{}),n:(h.match(/class="mf-cc-round"/g)||[]).length};})()`);
  assert.match(r.h,/LE COMBAT EN CHIFFRES/);assert.match(r.h,/ROUND PAR ROUND/);assert.equal(r.n,3);assert.equal(r.abs,'');assert.doesNotMatch(r.h,/LES TROIS JUGES/);
});
test('brief du 22/10, P1 T5 — les noms fabriqués sont échappés dans les deux écrans',()=>{
  const w=creer();const ok=w.eval(`(()=>{const m=G.mgmt,a=m.roster[0],b=m.roster.find(f=>f.id!==a.id);a.name='<img onerror=alert(1)>';a.first='';a.last=a.name;const v={mode:'combat',ids:[a.id,b.id],page:0,nom:0,vue:'chiffres'};const d={gagnant:{last:a.name,name:a.name,id:a.id},perdant:{last:b.last,name:b.name},nul:false,titre:false,cat:a.div,method:'ko'};return {p:mgmtPresentationHtml(m,v),r:mgmtSuReLigneHtml({d,k:0,main:true},1,false)};})()`);
  assert.doesNotMatch(ok.p+ok.r,/<img onerror=/i);assert.match(ok.p,/&lt;img onerror=/i);assert.match(ok.r,/&lt;img onerror=/i);
});
test('brief du 22/10, P1 T5 — rendu des chiffres sur six soirées sous 200 ms',()=>{
  const w=creer();const ms=w.eval(`(()=>{const t=performance.now();for(const x of G.mgmt.hist){if(x&&x.a&&x.b)mgmtFaceAFace(G.mgmt,x.a.id,x.b.id);if(x)mgmtReleveCombat(G.mgmt,x);}return performance.now()-t;})()`);
  assert.ok(ms<200,`rendu/calcul ${ms} ms`);
});
