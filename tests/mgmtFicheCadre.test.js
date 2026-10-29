"use strict";
/* Brief du 06/10/2026, lot 6 ; brief du 22/10, P1 T4 : le cinquième onglet Statistiques. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const touche=(win,key)=>win.eval(`keysHandle({key:${JSON.stringify(key)},preventDefault(){}})`);

test('Fiche — six onglets, Contrat grisé avant le calendrier du joueur, Tab fait le tour sans passer par Contrat', () => {
  const win=newGameWindow({runMain:true});
  win.eval(`setSeed(7); CL.mgmtEnter(1); delete G.mgmt.cal; CL.go('mgmt_effectif'); CL.mgmtEffectifOuvrir();`);
  assert.equal(win.eval('G.screen'),'mgmt_fiche');
  assert.equal(win.eval(`document.querySelectorAll('.mf-fiche-onglets .mf-onglet:not(.mf-fiche-retour)').length`),6);
  assert.equal(win.eval(`document.querySelectorAll('.mf-fiche-grise[aria-disabled="true"]').length`),1);
  const vus=[]; for(let i=0;i<6;i++){ vus.push(win.eval('MGMT_FICHE.onglet')); touche(win,'Tab'); }
  assert.deepEqual(vus,['apercu','style','stats','combats','ondit','apercu']);
  assert.ok(win.eval(`document.getElementById('app').textContent.includes('PRÉPARER SON COMBAT')||document.getElementById('app').textContent.includes('Préparer son combat')`));
});

test('Fiche — ← → change de combattant dans la catégorie, Échap revient', () => {
  const win=newGameWindow({runMain:true});
  win.eval(`setSeed(7); CL.mgmtEnter(1); CL.go('mgmt_effectif'); CL.mgmtEffectifOuvrir();`);
  const a=win.eval('MGMT_FICHE.id'); touche(win,'ArrowRight'); const b=win.eval('MGMT_FICHE.id');
  assert.notEqual(a,b); touche(win,'ArrowLeft'); assert.equal(win.eval('MGMT_FICHE.id'),a);
  touche(win,'Escape'); assert.notEqual(win.eval('G.screen'),'mgmt_fiche');
});

test('Aperçu — huit informations réelles et un panneau séparé pour la relation et ses souvenirs',()=>{
 const w=newGameWindow({runMain:true});
 try{
  w.eval(`setSeed(7);CL.mgmtEnter(1);CL.go('mgmt_effectif');CL.mgmtEffectifOuvrir();
    const m=G.mgmt,f=mgmtFighterById(m,MGMT_FICHE.id);mgmtMemoireAjouter(m,f.id,'prime');mgmtMemoireAjouter(m,f.id,'pied-leve');render();`);
  assert.deepEqual([...w.document.querySelectorAll('.mf-fi-case>span')].map(x=>x.textContent),['Âge','Taille','Allonge','Garde','Chez Split','Contrat','Mondial','Surnom']);
  assert.equal(w.document.querySelectorAll('.mf-fi-infos .mf-fi-case').length,8);
  assert.equal(w.document.querySelector('.mf-fi-infos .mf-fi-pensee'),null);
  assert.ok(w.document.querySelector('.mf-fi-relation .mf-fi-pensee>strong').textContent);
  /* Anthony,28/10 : le panneau et son état restent présents même sans souvenir. */
  const detail=w.document.querySelector('.mf-fi-pensee details');assert.equal(detail.open,false);detail.open=true;assert.ok(detail.querySelector('p').textContent);detail.open=false;
  assert.deepEqual([...w.document.querySelectorAll('.mf-fi-souvenir>span')].map(x=>x.textContent),['Prime accordée','Combat accepté au pied levé']);
  assert.ok(w.document.querySelector('.mf-fi-trait .mf-fi-trait-icone'));
  w.eval(`delete G.mgmt.memoire;render()`);assert.match(w.document.querySelector('.mf-fi-relation').textContent,/RELATION INCONNUE/);assert.match(w.document.querySelector('.mf-fi-relation').textContent,/Aucun souvenir enregistré/);
 }finally{w.close();}
});

test('Aperçu — sans coordonnées archivées, la cage affiche les forces du profil sans inventer de positions',()=>{
 const w=newGameWindow({runMain:true});try{
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{setSeed(7);CL.mgmtEnter(1);const m=G.mgmt,f=m.roster[0],avant=JSON.stringify(m),seed=SEED,html=mgmtFicheCageHtml(m,f,330);return {html,pur:avant===JSON.stringify(m)&&seed===SEED};})())`));
  const p=w.document.createElement('div');p.innerHTML=r.html;assert.match(p.textContent,/Positions de combats non archivées/);assert.match(p.textContent,/PROFIL · AU CENTRE/);
  assert.equal(p.querySelector('path[fill]').getAttribute('fill'),'url(#mf-fi-ha)','le bord inconnu reste distinct du profil central');
  assert.equal(p.querySelectorAll('path[fill="#B32A1E"]').length<=1,true,'les forces positives ne remplissent plus les deux octogones en rouge');
  const legende=w.eval(`mgmtFicheLegendeHtml(G.mgmt,G.mgmt.roster[0])`);assert.match(legende,/Zones non observées/);assert.doesNotMatch(legende,/subit/);
  assert.equal(p.querySelectorAll('circle').length,0);assert.equal(p.querySelectorAll('path[stroke]').length,2);assert.equal(p.querySelector('path[stroke-width="2"]').getAttribute('d'),w.eval('mgmtFicheOcto(125,125,70)'));assert.equal(r.pur,true);
 }finally{w.close();}
});
test('Aperçu — les positions observées gardent leurs marqueurs lisibles et leur légende',()=>{
 const w=newGameWindow();
 const r=w.eval(`(()=>{mgmtFightHistory=()=>[{a:{id:'a'},b:{id:'b'}}];mgmtFicheZones=()=>({rings:[20,10,20],bord:[20,0,0,0,0,0,0,0],pin:Array.from({length:8},(_,i)=>({count:i===0?10:0,x:0,y:0}))});mgmtFichePointCombat=()=>({x:0,y:0});const m={},f={id:'a'};return {html:mgmtFicheCageHtml(m,f,330),legende:mgmtFicheLegendeHtml(m,f)};})()`);
 const p=w.document.createElement('div');p.innerHTML=r.html;
 assert.equal(p.querySelectorAll('circle').length,1);
 assert.equal(p.querySelector('text').style.fontSize,'22px');
 assert.match(r.legende,/subit/);
 assert.doesNotMatch(r.legende,/Zones non observées/);
 assert.equal(p.querySelectorAll('path[stroke]').length,2);
});
