"use strict";
/* Retours d'Anthony du 09/10/2026, d'après les planches : on peut revenir en arrière dans le choix des deux combattants (carte principale,
   préliminaires) et revoir pendant la soirée un combat déjà passé ; la séparation des deux combattants est une diagonale, et les noms
   longs ne se touchent pas. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const {newGameWindow}=require('./helpers/loadGame');
const jouer=require('./helpers/jouerSoirees');
const res=(w,code)=>JSON.parse(w.eval(`JSON.stringify((function(){ ${code} })())`));
const touche=(win,key)=>win.eval(`keysHandle({key:${JSON.stringify(key)},preventDefault(){}})`);
const neuve=()=>{ const w=newGameWindow({runMain:true}); w.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(7); CL.mgmtEnter(1); CL.mgmtArriveeFin();`); return w; };
const remplir=`const m=G.mgmt, divs=[...new Set(mgmtCartRows(m).map(f=>f.div))]; let e=0;
  while(m.card.main.length<m.card.sizeMain&&e++<80){ const div=divs[(m.card.main.length+e)%divs.length]; const rows=mgmtCartRows(m).filter(f=>f.div===div&&mgmtSelectable(m,f,null)); const a=rows[0], b=a&&rows.find(x=>x.id!==a.id&&mgmtSelectable(m,x,a.id)); if(a&&b) mgmtBookMain(m,a.id,b.id); }`;

test('Carte — un combat confirmé se reprend : le premier combattant revient en choix, le curseur sur son adversaire, Échap remonte au premier choix', () => {
  const w=neuve();
  const r=res(w,`${remplir} const f=m.card.main[2], avant=m.card.main.length; CL.go('mgmt_carte'); CL.mgmtCarteModifie(2);
    const apres={n:m.card.main.length,pick:MGMT_CART.pick===f.a,curseurSurB:mgmtCarteListe(m)[MGMT_CART.cursor].id===f.b};
    CL.mgmtCarteLeave(); return {avant,apres,pickApresEchap:MGMT_CART.pick};`);
  assert.equal(r.avant,5); assert.deepEqual(r.apres,{n:4,pick:true,curseurSurB:true}); assert.equal(r.pickApresEchap,null);
});

test('Carte — « Retour » est un bouton du face-à-face, et le premier nom se clique pour changer de combattant', () => {
  const w=neuve();
  const r=res(w,`const m=G.mgmt; CL.go('mgmt_carte'); const rows=mgmtCarteListe(m); CL.mgmtPick(rows[0].id); const html=document.getElementById('app').innerHTML;
    const avant=MGMT_CART.pick; document.querySelector('.mf-car-ban-nom').click(); return {avant:!!avant,apres:MGMT_CART.pick,bouton:html.includes('mgmtCarteLeave()')};`);
  assert.equal(r.avant,true); assert.equal(r.apres,null); assert.equal(r.bouton,true);
});

test('Booking — la bannière sépare les deux combattants en diagonale (pas une ligne droite) et tient les noms longs loin du VS', () => {
  const w=neuve();
  const css=fs.readFileSync(path.join(__dirname,'..','ui-cadre.css'),'utf8');
  assert.match(css,/\.mf-car-diag\.r\{[^}]*clip-path:polygon\(475px 0,100% 0,100% 100%,225px 100%\)/,'la diagonale rouge de la planche');
  assert.match(css,/\.mf-car-diag\.c\{[^}]*polygon\(459px 0,475px 0,225px 100%,209px 100%\)/,'le filet blanc suit la diagonale');
  const r=res(w,`const a={first:'Jean-Baptiste-Alexandre',last:'Vandermeulenbrouck',name:'x'}, b={first:'Maximilien-Constantin',last:'Saint-Morand-Delacroix',name:'y'};
    const h=mgmtCarteBanniere(a,b,mgmtCarteDiv(G.mgmt),5,'');
    const tailles=[...h.matchAll(/font-size:(\\d+)px/g)].map(x=>+x[1]);
    return {diag:h.includes('mf-car-diag r')&&h.includes('mf-car-diag c'),tailles,rounds:h.includes('5 ROUNDS'),vs:h.includes('mf-car-vs')};`);
  assert.ok(r.diag&&r.rounds&&r.vs);
  assert.ok(r.tailles.every(t=>t>=22&&t<96),'les noms longs rétrécissent, jamais sous 22 px : '+r.tailles);
});

test('Préliminaires — on remplace au choix le premier ou le second combattant du préliminaire proposé', () => {
  const w=neuve();
  const r=res(w,`${remplir} CL.go('mgmt_prelims'); const {slots,bloc}=mgmtPrelimsEmplacements(m); if(!bloc) return {saute:true};
    const s=slots.find(x=>x.etat==='avalider'), f=s.fight, idx=s.idxBloc;
    const altA=mgmtPrelimsAlternatives(m,f,bloc,'a'), altB=mgmtPrelimsAlternatives(m,f,bloc,'b');
    const A0=f.a, B0=f.b; const ok=altA.length&&mgmtBulkRemplacer(m,bloc.id,idx,altA[0].id,'a');
    const apresA={a:bloc.fights[idx].a!==A0,b:bloc.fights[idx].b===B0,memeCat:mgmtFighterById(m,bloc.fights[idx].a).div===mgmtFighterById(m,B0).div};
    CL.mgmtPrelimsCote('a'); const cote=MGMT_PRELIMS.cote; CL.mgmtPrelimsCote('b');
    return {ok:!!ok,apresA,cote,coteApres:MGMT_PRELIMS.cote,alts:[altA.length>0,altB.length>0]};`);
  assert.ok(!r.saute,'la carte complète fait proposer les préliminaires');
  assert.equal(r.ok,true); assert.deepEqual(r.apresA,{a:true,b:true,memeCat:true}); assert.equal(r.cote,'a'); assert.equal(r.coteApres,'b');
});

test('Soirée — un combat déjà passé se revoit : ← y mène, Entrée le rouvre, la soirée ne recule pas', () => {
  const w=newGameWindow({runMain:true});
  w.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(7); CL.mgmtEnter(1);`);
  jouer(w,4,{titre:true});
  w.eval(`MGMT_SOIREE.index=0; MGMT_SOIREE_UI.focus=null; MGMT_SOIREE_UI.commence=null; CL.go('mgmt_soiree');`);
  touche(w,'Enter');
  for(let i=0;i<3;i++) touche(w,'p');
  assert.equal(w.eval(`MGMT_SOIREE.index`),3);
  touche(w,'ArrowLeft'); touche(w,'ArrowLeft');
  const r=res(w,`const t=document.getElementById('app').textContent.toUpperCase(); return {focus:MGMT_SOIREE_UI.focus,revoir:t.includes('REVOIR LE COMBAT'),passer:t.includes('PASSER')&&document.querySelectorAll('.mf-so-actes button').length};`);
  assert.equal(r.focus,1); assert.equal(r.revoir,true);
  touche(w,'Enter');
  assert.equal(w.eval(`G.screen`),'mgmt_combat','le combat passé est rouvert');
  assert.equal(w.eval(`MGMT_SOIREE.index`),3,'la soirée n’a pas bougé');
  assert.equal(w.eval(`MGMT_COMBAT.finRetour`),null,'sa fin ne fait pas avancer la soirée');
  w.eval(`CL.go('mgmt_soiree')`);
  touche(w,'Escape');
  assert.equal(w.eval(`MGMT_SOIREE_UI.focus`),null,'Échap revient au prochain combat');
});

test('Soirée — la soirée finie, une pastille rouvre le combat qu’elle porte', () => {
  const w=newGameWindow({runMain:true});
  w.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(7); CL.mgmtEnter(1);`);
  jouer(w,4,{titre:true});
  w.eval(`MGMT_SOIREE.index=0; MGMT_SOIREE_UI.focus=null; MGMT_SOIREE_UI.commence=null; CL.go('mgmt_soiree');`);
  touche(w,'Enter'); for(let i=0;i<9;i++) touche(w,'p');
  assert.equal(w.eval(`MGMT_SOIREE.index`),9);
  w.eval(`CL.mgmtSoFocus(2)`);
  assert.equal(w.eval(`G.screen`),'mgmt_combat');
  assert.equal(w.eval(`MGMT_SOIREE.index`),9);
});
