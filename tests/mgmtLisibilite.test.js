"use strict";
/* Monde lot 2 T8 (docs/lots/MONDE-LOT-2-T8.md) — lisibilité de l'en-tête, des Résultats, du Calendrier et des Ceintures.
   Décisions du 12/10/2026, retour d'Anthony. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {newGameWindow}=require('./helpers/loadGame');
const jouer=require('./helpers/jouerSoirees');
const touche=(win,key)=>win.eval(`keysHandle({key:${JSON.stringify(key)},preventDefault(){}})`);
const texte=win=>win.eval(`document.getElementById('app').textContent`);
const css=()=>fs.readFileSync(path.join(__dirname,'..','ui-cadre.css'),'utf8');
function neuve(seed){ const win=newGameWindow({runMain:true}); win.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(${seed||7}); CL.mgmtEnter(1);`); return win; }

test('Lisibilité — le gabarit du nom de la soirée : 18 et 26 caractères, deux lignes, jamais tronqué (huit organisations)', () => {
  const win=neuve(7);
  const liste=JSON.parse(win.eval(`JSON.stringify(MGMT_ORGANISATIONS.map(o=>(o.nom||o.name)+' Fight Night'))`));
  assert.ok(liste.length>=8,'huit organisations au moins');
  for(const nom of liste){
    const g=JSON.parse(win.eval(`JSON.stringify(mfNomSoireeGabarit(${JSON.stringify(nom)},56))`));
    assert.equal(g.lignes.join(' '),nom.toUpperCase().trim(),'rien n\'est tronqué : '+nom);
    assert.equal(g.px,nom.length<=18?56:30,nom);
    assert.equal(g.lignes.length,nom.length>26?2:1,nom);
    for(const l of g.lignes) assert.ok(l.length*0.5*g.px<=900,'une ligne tient dans le cadre : '+l);
  }
  const garden=JSON.parse(win.eval(`JSON.stringify(mfNomSoireeGabarit('Garden of Blood Fight Night',56))`));
  assert.equal(garden.lignes.length,2); assert.equal(garden.px,30);
  assert.equal(win.eval(`mfNomSoireeGabarit('Split Fight Night',84).px`),84,'dix-sept caractères : taille de base');
  assert.equal(win.eval(`mfNomSoireeGabarit('Ultimate Rim Fight Night',84).px`),30,'au-delà de 18 caractères : 30 px');
  assert.equal(win.eval(`mfNomSoireeGabarit('Split',84).px`),84,'un nom court garde sa taille de base');
});

test('Lisibilité — l\'en-tête met 24 px d\'espace entre ses éléments et passe par le gabarit', () => {
  const c=css();
  assert.match(c,/\.mf-entete\{[^}]*gap:24px/);
  assert.match(c,/\.mf-entete-d\.soiree\{[^}]*gap:24px/);
  assert.match(c,/\.mf-entete-g\{[^}]*gap:24px/);
  const win=neuve(7); win.eval(`CL.go('mgmt_carte')`);
  assert.ok(win.eval(`document.querySelector('.mf-tete-nom .mf-nom-soiree')!==null`),'le nom de la soirée passe par le gabarit');
});

test('Résultats — une date et un combat principal par soirée ; une ligne par combat ; aucun rouge sur un résultat', () => {
  const win=neuve(7); jouer(win,3,{titre:true});
  win.eval(`MGMT_SU_RE={s:0,i:0}; CL.go('mgmt_resultats');`);
  /* Monde lot 10 T3 : planche Résultats validée par Anthony le 14/10/2026 (MONDE-LOT-10-DECISIONS) — les soirées s'appellent « Fight Night N », la date est longue avec l'année. */
  assert.equal(win.eval(`document.querySelectorAll('.mf-re-so').length`),3);
  for(let k=0;k<3;k++){
    const t=win.eval(`document.querySelectorAll('.mf-re-so')[${k}].textContent`);
    assert.match(t,/Fight Night \d+\d{1,2} [a-zéû]+ 20\d\d/,'la date : '+t);
    assert.match(t,/ bat | et .* : match nul/,'le combat principal en une ligne : '+t);
  }
  const n=win.eval(`mgmtSoirees(G.mgmt).slice().reverse()[0].idx.length`);
  assert.equal(win.eval(`document.querySelectorAll('.mf-re-cb').length`),n,'une ligne par combat de la soirée');
  const html=win.eval(`document.querySelector('.mf-re-tab').innerHTML`);
  assert.ok(!/color:\s*(#B32A1E|#E23A2B|red)/i.test(html),'aucun style inline rouge sur un résultat');
  assert.ok(!/mf-su-ko|mf-su-h-titre/.test(html),'plus de DÉCISION géant');
  /* Monde lot 10 T3 : planche Résultats validée par Anthony le 14/10/2026 (MONDE-LOT-10-DECISIONS) — la planche dessine la pastille de ceinture et le trait des titres en rouge vif ; le rouge ne colore ni le vainqueur ni le perdant. */
  const bloc=css().slice(css().indexOf('Monde lot 10 T3 : Résultats'));
  assert.ok(!/\.mf-re-cb \.(g|b)\{[^}]*rouge/.test(bloc),'le rouge ne colore aucun résultat');
  assert.match(texte(win),/Revoir le combat/);
});

test('Résultats — un combat du passé : « il ne se revoit pas », et ni Entrée ni R ne lancent de rediffusion', () => {
  const win=neuve(7); jouer(win,2);
  /* Monde lot 10 T3 : planche Résultats validée par Anthony le 14/10/2026 (MONDE-LOT-10-DECISIONS) — la phrase de la planche remplace « pas de rediffusion ». */
  win.eval(`G.mgmt.hist.forEach(t=>{ if(t.c===G.mgmt.hist[0].c) t.p=true; }); MGMT_SU_RE={s:1,i:0}; CL.go('mgmt_resultats');`);
  assert.match(texte(win),/ne se revoit pas/);
  assert.ok(!/Revoir le combat/.test(texte(win)));
  touche(win,'Enter'); touche(win,'r');
  assert.notEqual(win.eval('G.screen'),'mgmt_combat','aucune rediffusion');
});

test('Ceintures — la carte sélectionnée : contour blanc de 3 px, fond sombre ; les autres sans contour', () => {
  const c=css();
  assert.match(c,/\.mf-su-ce\.sel\{[^}]*outline:3px solid #FFFFFF/i);
  assert.ok(!/\.mf-su-ce\.sel[^{]*\{[^}]*background:\s*var\(--mf-blanc\)/.test(c),'plus de fond clair sur la sélection');
  const win=neuve(7); win.eval(`MGMT_SU_CE={sexe:'H',div:'',i:0,ouverte:false}; CL.go('mgmt_ceintures');`);
  assert.equal(win.eval(`document.querySelectorAll('.mf-su-ce.sel').length`),1,'une seule carte sélectionnée');
});

test('Lisibilité — aucun texte sous 22 px sur Résultats, Calendrier, Ceintures', () => {
  const sous=[...css().matchAll(/font-size:(\d+(?:\.\d+)?)px/g)].map(x=>+x[1]).filter(t=>t<22);
  assert.deepEqual(sous,[]);
  const win=neuve(7); jouer(win,2);
  for(const e of ['mgmt_resultats','mgmt_calendrier','mgmt_ceintures']){
    win.eval(`CL.go('${e}')`);
    const px=JSON.parse(win.eval(`JSON.stringify([...document.querySelectorAll('#app [style]')].map(x=>x.style.fontSize).filter(Boolean).map(parseFloat))`));
    assert.deepEqual(px.filter(t=>t<22),[],e);
  }
});
