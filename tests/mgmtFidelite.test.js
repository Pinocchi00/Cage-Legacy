"use strict";
/* Reprise de fidélité aux planches du 07/10/2026 : l'en-tête de chaque écran (décompte, date et lieu, soirée), l'affiche de l'accueil avec sa date, les onglets
   de Contrats, et les écrans sans planche propre (affaires, lendemain, organisation, vestiaire) dessinés dans le langage des panneaux. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const jouer=require('./helpers/jouerSoirees');
const res=(win,code)=>JSON.parse(win.eval(`JSON.stringify((function(){${code}})())`));
const texte=win=>win.eval(`document.getElementById('app').textContent`);
function neuve(n){
  const win=newGameWindow({runMain:true});
  win.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(7); CL.mgmtEnter(1);`);
  jouer(win,n===undefined?2:n,{titre:true});
  win.eval(`const m=G.mgmt; if(!m.cal.prochaines.length) mgmtAgendaPoser(m,m.cal.jour+10,'petite');`);
  return win;
}

test('L\'en-tête des écrans du cadre : « Dans N jours », la date et le lieu, puis « Fight Night » et son numéro en rouge', () => {
  const win=neuve();
  for(const sc of ['mgmt_carte','mgmt_effectif','mgmt_classements','mgmt_finances','mgmt_camps','mgmt_presse','mgmt_resultats','mgmt_options']){
    win.eval(`CL.go('${sc}')`);
    const r=res(win,`const e=document.querySelector('.mf-entete-d.soiree'); if(!e) return null; return {dans:(e.querySelector('.mf-tete-dans')||{}).textContent||'',boites:[...e.querySelectorAll('.mf-tete-boite')].map(b=>b.textContent),n:(e.querySelector('.mf-tete-boite.soir b.n')||{}).textContent||''};`);
    assert.ok(r,sc+' : le bloc de droite');
    assert.match(r.dans,/^(Dans \d+ jours?|Aujourd’hui)$/,sc);
    assert.equal(r.boites.length,2,sc+' : la date et la soirée');
    assert.match(r.boites[0],/^\d{1,2} [A-ZÉÛ]+.+/,sc+' : le jour, le mois et le lieu');
    assert.match(r.boites[1],/FIGHT NIGHT\d+$/,sc);
    assert.equal(r.n,String(res(win,`return G.mgmt.eventsPlayed+1;`)),sc+' : le numéro de la soirée');
  }
});

test('Une partie d\'avant l\'agenda garde la boîte de la soirée seule, sans décompte inventé', () => {
  const win=newGameWindow({runMain:true});
  win.eval(`setSeed(7); CL.mgmtEnter(1); G.mgmt.cal.actif=false; CL.go('mgmt_effectif');`);
  const r=res(win,`const e=document.querySelector('.mf-entete-d.soiree'); return e?{dans:!!e.querySelector('.mf-tete-dans'),boites:e.querySelectorAll('.mf-tete-boite').length}:null;`);
  assert.ok(r); assert.equal(r.dans,false); assert.equal(r.boites,1);
});

test('L\'affiche de l\'accueil porte le jour et le lieu de la soirée (planche « Accueil »)', () => {
  const win=neuve();
  win.eval(`const m=G.mgmt; mgmtNewPile(m); if(!m.cal.prochaines.length) mgmtAgendaPoser(m,m.cal.jour+10,'petite');
    const divs=[...new Set(mgmtCartRows(m).map(f=>f.div))]; let e=0;
    while(m.card.main.length<m.card.sizeMain&&e++<60){ const div=divs[(m.card.main.length+e)%divs.length]; const rows=mgmtCartRows(m).filter(f=>f.div===div&&mgmtSelectable(m,f,null)); const a=rows[0], b=a&&rows.find(x=>x.id!==a.id&&mgmtSelectable(m,x,a.id)); if(a&&b) mgmtBookMain(m,a.id,b.id); }
    saveMgmt(); G.screen='title'; render();`);
  const r=res(win,`const d=document.querySelector('.mf-affiche .mf-date'); return d?d.textContent:null;`);
  assert.ok(r,'la boîte de la date'); assert.match(r,/^\d{1,2} [A-ZÉÛ]+/);
});

test('Contrats : « Sous contrat » et « Recrutement » sont des onglets de l\'en-tête, le clic change de mode', () => {
  const win=neuve();
  win.eval(`CL.go('mgmt_contrats')`);
  const lire=()=>res(win,`return [...document.querySelectorAll('.mf-entete-ongs .mf-onglet')].map(b=>[b.textContent,b.getAttribute('aria-pressed')]);`);
  assert.deepEqual(lire(),[['SOUS CONTRAT','true'],['RECRUTEMENT','false']]);
  win.eval(`document.querySelectorAll('.mf-entete-ongs .mf-onglet')[1].click()`);
  assert.deepEqual(lire(),[['SOUS CONTRAT','false'],['RECRUTEMENT','true']]);
  win.eval(`document.querySelectorAll('.mf-entete-ongs .mf-onglet')[1].click()`);
  assert.deepEqual(lire(),[['SOUS CONTRAT','false'],['RECRUTEMENT','true']],'recliquer l\'onglet ouvert ne le ferme pas');
});

test('Camps, Presse, Résultats : les libellés de l\'en-tête sont ceux des planches', () => {
  const win=neuve(3);
  win.eval(`CL.go('mgmt_camps')`); assert.match(res(win,`return document.querySelector('.mf-entete-lib').textContent;`),/^salles?$/i);
  win.eval(`CL.go('mgmt_presse')`); assert.match(res(win,`return document.querySelector('.mf-entete-lib').textContent;`),/nouvelles? cette semaine$/i);
  win.eval(`CL.go('mgmt_resultats')`); assert.match(res(win,`return document.querySelector('.mf-entete-lib').textContent;`),/Fight Night \d+ · \d{1,2} [A-ZÉÛ]+/i);
});

test('Les écrans sans planche propre sont dessinés en panneaux du cadre, avec leur plaque', () => {
  const win=neuve(3);
  const lire=sc=>{ win.eval(`CL.go('${sc}')`); return res(win,`return {plaque:document.querySelector('.mf-plaque').textContent,panneaux:document.querySelectorAll('.mf-ancien .mf-panneau.mf-sem-p').length,hors:!!document.querySelector('.mf-ancien .scr.mgmt-wrap')};`); };
  let r=lire('mgmt_bureau'); assert.equal(r.plaque,'Les affaires'); assert.equal(r.panneaux,3);
  /* Brief démo, lot 6 T3 : le lendemain est recomposé en panneaux du cadre (mgmt-lendemain-cadre.js), il n'est plus un écran ancien. */
  r=lire('mgmt_lendemain'); assert.equal(r.plaque,'Le lendemain'); assert.equal(r.panneaux,0);
  r=lire('mgmt_organisation'); assert.equal(r.plaque,'Organisation'); assert.equal(r.panneaux,2);
  r=lire('mgmt_vestiaire'); assert.equal(r.plaque,'Le vestiaire');
  /* Les jetons de l'ancien habillage (prune, jaune doré) sont ceux du cadre (la feuille ne se calcule pas sous jsdom : on lit sa source). */
  const css=require('fs').readFileSync(require('path').join(__dirname,'..','ui-cadre.css'),'utf8');
  assert.ok(/\.mf-ancien\{[^}]*--mgmt-yellow:#F0B220/.test(css));
});

test('Options : la ligne choisie, les choix et le bouton « Réglages d\'origine » suivent la planche', () => {
  const win=neuve();
  win.eval(`CL.mgmtOptions()`);
  const r=res(win,`return {bas:!!document.querySelector('.mf-op-bas .mf-bouton'),touche:(document.querySelector('.mf-op-bas .mf-k')||{}).textContent,lignes:document.querySelectorAll('.mf-op-l').length};`);
  const css=require('fs').readFileSync(require('path').join(__dirname,'..','ui-cadre.css'),'utf8');
  assert.ok(/\.mf-op-l\{[^}]*height:88px/.test(css),'les lignes de 88 px de la planche');
  assert.equal(r.bas,true); assert.equal(r.touche,'R'); assert.equal(r.lignes,6);
  assert.ok(texte(win).toUpperCase().includes('RÉGLAGES D’ORIGINE'));
});

test('L\'accueil a pour fond le tunnel d\'octogones rouges des planches « Accueil corrigé », avec ou sans affiche, et l\'image est livrée', () => {
  const fs=require('fs'), path=require('path');
  const win=newGameWindow({runMain:true});
  assert.ok(win.scr_title().includes('class="mf-fond octogones"'),'sans soirée');
  assert.ok(!win.scr_title().includes('mf-accueil-logo'));
  assert.ok(fs.statSync(path.join(__dirname,'..','images','accueil-octogones.jpg')).size>100000,'l\'image du fond');
  assert.ok(/mf-fond\.octogones\{[^}]*accueil-octogones\.jpg/.test(fs.readFileSync(path.join(__dirname,'..','ui-cadre.css'),'utf8')));
  assert.ok(/accueil-octogones\.jpg/.test(fs.readFileSync(path.join(__dirname,'..','sw.js'),'utf8')),'gardée pour le hors ligne');
});
