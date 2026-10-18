"use strict";
/* ==== [ANCRE: MONDE_LOT19_T14_TEST] — Monde lot 19 T14 (docs/lots/MONDE-LOT-19-T14.md, spéc. docs/lots/DUO-T4.md §4) :
   l'écran du bilan de la super carte. Un monde coûte 40 à 90 s : un seul monde pour le test. Les helpers AVANCER et DRAFT
   sont repris de tests/mgmtDuo.test.js (leur foyer) ; les intitulés suivent la fiche, « Duo T4 — <point> ». ==== */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');

/* Un monde comme tests/mgmtDuo.test.js : passé court (six soirées), monde vivant, partie Duo J1=Anthony J2=François. */
function creer(){
  const win=newGameWindow({runMain:true});
  win.eval("setSeed(20261018); mgmtPasseGenerer('split',{soirees:6}); mgmtMondeVivantGenerer(G.mgmt,{soirees:6}); mgmtDuoCreer(G.mgmt,'mma-korner',{a:'Anthony',b:'François'});");
  return win;
}
/* Avance jusqu'au draft : les enchères s'ouvrent d'abord, personne ne mise, tout le monde passe. */
const AVANCER=`mgmtDuoAvancer(G.mgmt);while(G.mgmt.duo.etape==='encheres'){mgmtDuoPasser(G.mgmt);}`;
/* Joue un draft complet : le joueur dont c'est le tour place son premier combattant plaçable, l'autre répond dans la même catégorie. */
const DRAFT=`const m=G.mgmt;
  for(let i=0;i<6;i++){
    const t=m.duo.draft.tour,p=mgmtDuoPlacables(m,t)[0];
    if(!p||!mgmtDuoPlacer(m,p.id)) return 'placement '+i;
    const r=mgmtDuoDisponibles(m,m.duo.draft.tour).find(f=>f.div===p.div);
    if(!r||!mgmtDuoRepondre(m,r.id)) return 'réponse '+i;
  }
  return m.duo.etape;`;

test('Duo T4 — bilan : le vainqueur, les six combats, le retour au QG (étape attente et date suivante)',()=>{
  const win=creer();
  win.eval(AVANCER);
  assert.equal(win.eval(`(function(){${DRAFT}})()`),'pret','le draft va jusqu\'à la super carte');
  win.eval(`mgmtDuoJouer(G.mgmt); for(let i=0;i<6;i++) mgmtDuoSoireeSuivante(G.mgmt);`);
  assert.equal(win.eval('G.mgmt.duo.etape'),'bilan','la sixième soirée mène au bilan');
  const carte=JSON.parse(win.eval(`JSON.stringify(G.mgmt.duo.cartes[G.mgmt.duo.cartes.length-1])`));
  const periode=win.eval('MGMT_DUO_PERIODE');

  win.eval(`CL.go('mgmt_duo_bilan')`);
  assert.equal(win.eval('G.screen'),'mgmt_duo_bilan','l\'écran du bilan s\'ouvre');

  /* le bandeau : le vainqueur nommé, ou Égalité */
  const txt=win.document.body.textContent;
  if(carte.gagnant==='nul') assert.match(txt,/Égalité/);
  else assert.ok(txt.includes(win.eval('G.mgmt.duo.noms.'+carte.gagnant)),'le vainqueur est nommé : '+txt);

  /* six lignes, une par combat, chacune avec son bouton Revoir */
  assert.equal(win.eval(`document.querySelectorAll('[data-duo-combat]').length`),6,'six lignes de combat');
  assert.equal(win.eval(`document.querySelectorAll('.mf-duo-bi-aller').length`),6,'un Revoir par combat');

  /* le score du bandeau : les combats gagnés par chaque côté dans cette carte */
  const vA=carte.combats.filter(c=>c.winner==='A').length, vB=carte.combats.filter(c=>c.winner==='B').length;
  assert.match(win.eval(`document.querySelector('.mf-duo-bi-sc').textContent`),new RegExp(vA+'\\s*–\\s*'+vB),'le score de la carte');

  /* l'argent de la super carte pour chaque joueur */
  assert.match(txt,/L'argent de la super carte/);
  assert.match(txt,new RegExp('\\+\\s*'+carte.gains.a),'le gain de J1');
  assert.match(txt,new RegExp('\\+\\s*'+carte.gains.b),'le gain de J2');

  /* un nom injecté reste du texte */
  win.eval(`G.mgmt.duo.noms.a="<b>O'Neil</b>"; render();`);
  assert.doesNotMatch(win.document.body.innerHTML,/<b>O'Neil<\/b>/,"un nom injecté n'est pas du HTML");
  assert.match(win.document.body.innerHTML,/&lt;b&gt;/,'le nom est échappé');

  /* le retour au QG : Entrée referme le bilan (étape attente, plus de soirée, date suivante) */
  win.eval(`keysHandle({key:'Enter',preventDefault(){}})`);
  assert.equal(win.eval('G.mgmt.duo.etape'),'attente','le bilan refermé : étape attente');
  assert.equal(win.eval('G.mgmt.duo.soiree'),null,'plus de soirée en cours');
  assert.equal(win.eval('G.mgmt.duo.prochaine'),carte.jour+periode,'la super carte suivante est à la bonne date');
  assert.equal(win.eval('G.screen'),'mgmt_duo','le QG est l\'écran courant');
});
