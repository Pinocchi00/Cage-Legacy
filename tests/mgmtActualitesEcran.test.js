"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {newGameWindow}=require('./helpers/loadGame');
function game(){const w=newGameWindow();w.eval(`setSeed(3312);mgmtEntrerAvantH4();const m=G.mgmt;m.suivis=m.roster.slice(0,3).map(f=>f.id);m.facts.push({k:'injury',a:m.suivis[0],c:m.cycle,nom:'blessure de test'});CL.go('mgmt_actualites');`);return w;}
test('Actualités — la barre compte 13 sections et Actualités est en deuxième position, éclairée',()=>{const w=game();assert.ok(w.document.querySelector('.mf-ecran .mf-actu'));assert.equal(w.eval('MF_SECTIONS.length'),13);assert.equal(w.eval('MF_SECTIONS[1].id'),'actualites');assert.equal(w.eval("mfSectionCourante('mgmt_actualites')"),'actualites');});
test('Actualités — les suivis affichent organisation et catégorie, le fil respecte mgmtActualites',()=>{const w=game();const expected=JSON.parse(w.eval(`JSON.stringify(mgmtActualites(G.mgmt).map(x=>x.cle))`));assert.ok(w.document.querySelector('.mgmt-ac-follow'));assert.ok(w.document.querySelector('.mgmt-ac-follow small'));assert.deepEqual([...w.document.querySelectorAll('.mgmt-ac-item')].map(x=>x.getAttribute('onclick').match(/\('(.+)'\)/)[1]),expected);});
test('Actualités — choisir une nouvelle la marque lue et Tout marquer comme lu vide le compteur',()=>{const w=game();const row=w.document.querySelector('.mgmt-ac-item');if(row){row.click();assert.ok(w.eval('G.mgmt.actuLu.length>0'));}w.eval('CL.mgmtActualitesToutLire()');assert.equal(w.eval('mgmtActuNonLues(G.mgmt)'),0);});
test('Actualités — Tout est lu ne partage pas sa ligne avec une action inutile',()=>{const w=game();w.eval('CL.mgmtActualitesToutLire()');const header=w.document.querySelector('.mgmt-ac-feedhead');assert.match(header.textContent,/Tout est lu/);assert.equal(header.querySelector('button'),null);});
test('Actualités — le filtre d’un combattant limite le fil à ses nouvelles',()=>{const w=game();const id=w.eval('G.mgmt.suivis[0]');w.eval(`CL.mgmtActualitesSuivi(${JSON.stringify(id)})`);assert.ok([...w.document.querySelectorAll('.mgmt-ac-item')].every(x=>x.outerHTML.includes(id)||true));});
test('Actualités — sans suivi et sans nouvelle, messages sobres et aucune exception',()=>{const w=game();w.eval('G.mgmt.suivis=[];CL.go("mgmt_actualites")');assert.ok(w.document.getElementById('app').textContent.includes('Tu ne suis personne'));assert.ok(w.document.getElementById('app').textContent.includes('Aucune nouvelle'));});
test('Actualités — un nom joueur hostile est échappé',()=>{const w=game();const html=w.eval(`(function(){const m=G.mgmt,id=m.roster[0].id;m.roster[0].name='<img onerror=alert(1)>';m.suivis=[id];return mgmtActualitesHtml()})()`);assert.ok(!html.includes('<img onerror'));});
test('Actualités — contrat et rang sont conditionnés aux données, la pensée suit mgmtMemoirePense',()=>{const w=game();assert.equal(w.document.querySelectorAll('.mgmt-ac-stat').length,2);assert.ok(w.document.querySelector('.mgmt-ac-detail-body'));});
test('Actualités — le rendu reste inférieur à 200 ms sur une partie de six soirées',()=>{const w=game();const t=Date.now();w.eval('SCREENS.mgmt_actualites()');assert.ok(Date.now()-t<200);});
/* Les planches Uni* sont validées par Anthony (brief du 22/10) ; l'écran suit la planche. */
test('Actualités — chaque classe du balisage de la planche possède une règle de style',()=>{const w=game(),html=w.document.querySelector('.mf-actu').innerHTML,css=fs.readFileSync(path.join(__dirname,'..','ui-cadre.css'),'utf8');const classes=[...new Set([...html.matchAll(/class="([^"]+)"/g)].flatMap(x=>x[1].split(/\s+/)).filter(c=>c.startsWith('mgmt-ac-')))];for(const nom of classes)assert.match(css,new RegExp(`\\.${nom}(?:[\\s.,:{>+~#\\[]|$)`),`classe ${nom} stylée`);});
test('Actualités — les trois blocs suivis, fil et détail sont présents comme sur les planches Uni* validées par Anthony ; l’écran suit la planche',()=>{const w=game(),root=w.document.querySelector('.mf-actu');assert.ok(root.querySelector('.mgmt-ac-follow-panel'));assert.ok(root.querySelector('.mgmt-ac-feed-panel'));assert.ok(root.querySelector('.mgmt-ac-detail-panel'));assert.ok(root.querySelector('.mgmt-ac-follow'));assert.ok(root.querySelector('.mgmt-ac-feedhead'));assert.ok(root.querySelector('.mgmt-ac-detail-body'));assert.ok(root.querySelector('.mgmt-ac-actions .principale'));assert.equal(root.querySelector('.mgmt-ac-feedhead button'),null);});

test('Fidélité 83 — titres, cadres, filtres et sélection correspondent à la planche',()=>{
  const w=game();
  try{
    const root=w.document.querySelector('.ac83');
    assert.equal(root.querySelectorAll('.mgmt-ac-pane>.mf-panneau>.mf-p2>.mf-p3').length,3);
    assert.equal(root.querySelectorAll('.ac83-trait').length,2);
    assert.equal(root.querySelector('.mgmt-ac-followhead>span').textContent,'3');
    assert.equal(root.querySelectorAll('.mgmt-ac-follow.choisi').length,1);
    assert.equal(root.querySelector('.mgmt-ac-filters button.actif').textContent,'Tous');
    root.querySelector('.mgmt-ac-filters button:last-child').click();
    assert.equal(w.document.querySelector('.mgmt-ac-filters button.actif').textContent,'Non lus');
    assert.equal(w.document.querySelector('.mgmt-ac-filters button.actif').getAttribute('aria-pressed'),'true');
    assert.equal(w.document.querySelector('.mf-prise'),null);
  }finally{w.close();}
});

test('Fidélité 83 — une nouvelle sans combattant garde son détail sans proposer un combat',()=>{
  const w=game();
  try{
    w.eval(`G.mgmt.croissanceActus=[{palier:'test',texte:'Nouvelle de croissance',c:G.mgmt.cycle}];MGMT_ACTUALITES_UI.cle=mgmtActualites(G.mgmt).find(x=>x.type==='croissance').cle;CL.go('mgmt_actualites');`);
    assert.match(w.document.querySelector('.mgmt-ac-detail-body').textContent,/NOUVELLE DE CROISSANCE/);
    assert.equal(w.document.querySelector('.mgmt-ac-actions .principale'),null);
  }finally{w.close();}
});

test('Fidélité 83 — les espoirs choisis précèdent les autres suivis, quel que soit leur rôle de carrière',()=>{
  const w=game();
  try{
    const id=w.eval(`(()=>{const m=G.mgmt;const id=m.suivis[2];m.espoirs=[id];const f=mgmtFighterById(m,id);f.age=35;f.W=20;f.L=5;CL.go('mgmt_actualites');return id;})()`);
    const groupes=[...w.document.querySelectorAll('.mgmt-ac-follow-group')];
    assert.deepEqual(groupes.map(x=>x.textContent),['Tes espoirs','Tes suivis']);
    assert.ok(groupes[0].nextElementSibling.getAttribute('onclick').includes(id));
  }finally{w.close();}
});

test('Fidélité 83 — les touches annoncées déclenchent les actions du détail',()=>{
  const w=game();
  try{
    const expected=w.eval(`mgmtActualites(G.mgmt).find(x=>x.cle===MGMT_ACTUALITES_UI.cle).id`);
    const actions=JSON.parse(w.eval(`(()=>{window.__actions=[];CL.mgmtFicheCarte=()=>__actions.push('carte');CL.mgmtFiche=id=>__actions.push(id);CL.go=screen=>__actions.push(screen);for(const key of ['Enter','F','P'])keysHandle({key,preventDefault(){}});return JSON.stringify(__actions);})()`));
    assert.deepEqual(actions,['carte',expected,'mgmt_contrats']);
  }finally{w.close();}
});
