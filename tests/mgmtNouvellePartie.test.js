"use strict";
/* ==== [ANCRE: TESTS_MGMT_NOUVELLE_PARTIE] — Monde lot 2 T5 : l'écran « Nouvelle partie »
   montre la ville, l'année et la réputation de chaque organisation, aux valeurs exactes de la
   planche maquettes/monde/MondeNouvellePartie.dc.html (validée par Anthony le 10/10/2026,
   corrigée le même jour). ==== */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {newGameWindow}=require('./helpers/loadGame');
const css=fs.readFileSync(path.join(__dirname,'..','ui-cadre.css'),'utf8').split('\r\n').join('\n');
function result(win,code){ return JSON.parse(win.eval(`JSON.stringify((function(){${code}})())`)); }

const NEUVE=`setSeed(5); CL.mgmtNouvelle(3);`;

/* La feuille de style, lue en valeurs : padding vertical du corps, corps de la ligne ville, gap du corps,
   hauteur de la réputation, hauteur d'une ligne d'atout, hauteur du bandeau, contour (2 + 5). */
function valeursCss(){
  const m=(r)=>{ const x=css.match(r); if(!x||!x[1]) throw new Error('valeur absente de ui-cadre.css : '+r); return +x[1]; };
  return {
    padCorps:m(/\.mf-org-corps\{[^}]*padding:(\d+)px 16px/),
    gapCorps:m(/\.mf-org-corps\{[^}]*gap:(\d+)px/),
    fsVille:m(/\.mf-org-ville\{[^}]*font-size:(\d+)px/),
    hRep:m(/\.mf-org-reputation\{[^}]*height:(\d+)px/),
    hLigne:m(/\.mf-org-ligne\{[^}]*height:(\d+)px/),
    hTete:m(/\.mf-org-tete\{[^}]*height:(\d+)px/),
    carte:m(/\.mf-org\{height:(\d+)px\}/),
    contour:m(/\.mf-panneau\{[^}]*padding:(\d+)px/)+m(/\.mf-panneau>\.mf-p2\{[^}]*padding:(\d+)px/),
  };
}

/* L'identité est lue dans la fenêtre (mgmtOrgIdentite, Monde lot 2 T1) pour comparer la carte à la donnée. */
function identite(win,id){ return JSON.parse(win.eval(`JSON.stringify(mgmtOrgIdentite(${JSON.stringify(id)}))`)); }

test('Nouvelle partie — chaque carte montre la ville, l’année et la réputation de son organisation', () => {
  const win=newGameWindow({runMain:true});
  const r=result(win,`${NEUVE}
    return [...document.querySelectorAll('.mf-org')].map(c=>({
      id:c.dataset.org,
      ville:c.querySelector('.mf-org-ville')?c.querySelector('.mf-org-ville').textContent.trim():null,
      rep:c.querySelector('.mf-org-reputation')?c.querySelector('.mf-org-reputation').textContent.trim():null}));`);
  const attendu=[['split','LYON · DEPUIS 2004'],['garden-of-blood','NEW YORK · DEPUIS 1999'],['mma-korner','ROTTERDAM · DEPUIS 2011'],
    ['ultimate-rim','MELBOURNE · DEPUIS 2020'],['fighting-pacific-championship','TOKYO · DEPUIS 1997'],
    ['organisation-6','MANCHESTER · DEPUIS 2012'],['organisation-7','DUBAÏ · DEPUIS 2018'],['organisation-8','SÃO PAULO · DEPUIS 2005']];
  assert.equal(r.length,8);
  let v=0;                             /* 16 vérifications : 8 villes, 8 réputations */
  attendu.forEach(([id,ville],i)=>{
    assert.equal(r[i].id,id,'l’ordre des 8 organisations');
    assert.equal(r[i].ville,ville,'ville et année de '+id); v++;
    assert.equal(r[i].rep,identite(win,id).reputation,'réputation de '+id); v++;
  });
  assert.equal(v,16);
});

test('Nouvelle partie — le nom s’écrit en 44 px, en 30 px au-delà de 18 caractères, et tient dans la carte', () => {
  const win=newGameWindow({runMain:true});
  const r=result(win,`${NEUVE}
    return [...document.querySelectorAll('.mf-org')].map(c=>{
      const nom=c.querySelector('.mf-org-nom'), fs=+nom.getAttribute('style').match(/font-size:(\\d+)px/)[1];
      return {nom:nom.textContent,fs,av:mfAvance(mfNet(nom.textContent))*fs}; });`);
  assert.deepEqual(r.map(x=>x.nom.length>18?30:44),r.map(x=>x.fs),'30 px au-delà de 18 caractères, 44 px jusqu’à 18');
  assert.deepEqual(r.map(x=>Math.round(x.av)),[73,240,188,196,301,191,179,240]);
  assert.ok(r.every(x=>x.av<=306),'394 de large utile − 10 de gap − ~78 pour « Choisee » : le nom tient dans la carte');
});

test('Nouvelle partie — les lignes d’atout suivent le profil, sans intertitre, et la carte la plus chargée tient dans 322 px', () => {
  const win=newGameWindow({runMain:true});
  const r=result(win,`${NEUVE}
    return {
      lignes:[...document.querySelectorAll('.mf-org')].map(c=>[...c.querySelectorAll('.mf-org-ligne')].map(l=>l.textContent.trim())),
      titres:document.querySelectorAll('.mf-org-titre,.mf-org-bloc').length,
      repMax:MGMT_ORGANISATIONS.map(o=>mgmtOrgIdentite(o.id).reputation.length)};`);
  const v=valeursCss();
  const attendu=result(win,`return MGMT_ORGANISATIONS.map(o=>{ const a=mgmtOrgAtouts(o.profil); return a.plus.concat(a.moins); });`);
  assert.equal(r.titres,0,'aucun intertitre « Les plus » / « Les contreparties »');
  assert.deepEqual(r.lignes,attendu,'les plus puis les contreparties du profil, en une colonne');
  assert.deepEqual(r.lignes.map(x=>x.length),[2,3,3,3,3,4,3,3]);
  assert.ok(r.repMax.every(n=>n<=90),`chaque réputation ≤ 90 caractères (les huit : ${Math.min(...r.repMax)} à ${Math.max(...r.repMax)}), sinon overflow:hidden la coupe en silence`);
  const contenue=v.padCorps+v.fsVille+v.gapCorps+v.hRep+v.gapCorps+4*v.hLigne+v.padCorps;
  assert.ok(contenue<=v.carte-v.contour*2-v.hTete,`corps ${contenue} ≤ carte ${v.carte} − contour ${v.contour*2} − bandeau ${v.hTete}`);
});

test('Nouvelle partie — les valeurs de la planche sont dans la feuille de style', () => {
  assert.ok(css.includes('grid-template-columns:repeat(4,440px)'),'.mf-org-grille : quatre colonnes de 440 px');
  assert.ok(css.includes('grid-template-rows:repeat(2,322px)'),'.mf-org-grille : deux rangées de 322 px');
  assert.ok(css.includes('.mf-org-tete{height:60px'),'le bandeau de carte fait 60 px');
  assert.ok(css.includes('.mf-org-ligne{height:34px'),'une ligne d’atout fait 34 px');
  assert.ok(/\.mf-org-reputation\{[^}]*font-size:22px/.test(css)&&/\.mf-org-reputation\{[^}]*height:48px/.test(css),'la réputation : 22 px, 48 px de haut');
  assert.ok(/\.mf-org-ville\{[^}]*font-size:22px/.test(css)&&/\.mf-org-ville\{[^}]*letter-spacing:\.04em/.test(css),'la ligne ville : 22 px, 0,04 em');
  assert.ok(css.includes('.mf-nouvelle-pied{height:60px'),'le pied fait 60 px');
});

/* Test 5 : le texte du bas et le regroupement à droite, la structure inchangée du jeu. */
const PHRASE_PIED='Le jeu crée tout le reste pour cette partie : six ans d’histoire, les combattants, les camps, les salles, la presse.';

test('Nouvelle partie — le texte du bas, l’aperçu, « Créer ton organisation » et le bouton jaune sont ceux de la planche', () => {
  const win=newGameWindow({runMain:true});
  win.eval(NEUVE);
  const r=result(win,`return {t:document.getElementById('app').textContent,
      boutons:document.querySelectorAll('.mf-bouton.jaune').length,
      apercu:document.querySelectorAll('.mf-org-apercu').length,tuiles:document.querySelectorAll('.mf-org-tuile').length,
      droite:!!document.querySelector('.mf-nouvelle-droite .mf-org-avenir'),
      avenirDisabled:document.querySelector('.mf-org-avenir').getAttribute('aria-disabled'),
      texteAvenir:document.querySelector('.mf-org-avenir').textContent};`);
  assert.ok(r.t.includes(PHRASE_PIED));
  assert.equal(r.boutons,1,'un seul bouton jaune');
  assert.equal(r.apercu,1); assert.equal(r.tuiles,6,'l’aperçu garde ses six tuiles');
  assert.ok(r.droite,'« Créer ton organisation » et le bouton sont regroupés à droite');
  assert.equal(r.avenirDisabled,'true');
  assert.ok(r.texteAvenir.includes('Créer ton organisation')&&r.texteAvenir.includes('À venir'));
});

/* Test 6 : le texte échappé, jamais injecté (esc sur toute donnée de fiche). */
test('Nouvelle partie — une réputation hostile s’affiche échappée, jamais injectée', () => {
  const win=newGameWindow({runMain:true});
  win.eval(`${NEUVE}
    MGMT_ORG_IDENTITES.split.reputation='<img src=x onerror=alert(1)>'; MGMT_NOUVELLE.i=0; render();`);
  assert.equal(win.eval(`document.querySelectorAll('#app img').length`),0,'aucun élément injecté');
  assert.ok(win.eval(`document.querySelector('.mf-org[data-org="split"] .mf-org-reputation').textContent`).includes('<img src=x'));
});
