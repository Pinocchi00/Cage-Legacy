"use strict";
/* CAGE LEGACY — tests/nomsAccentsEtPrenoms.test.js
   ============================================================================
   Décisions d'Anthony du 28/09/2026 :
   1) les noms qui avaient perdu leur accent le retrouvent (Araújo,
      Guimarães, Magalhães ; Rodríguez, Sánchez, Gómez, Velásquez, Chávez,
      Márquez, Saldívar, Castañeda) — même nombre d'entrées, même ordre,
      aucun tirage ne bouge ;
   2) les prénoms coréens et géorgiens, rangés parmi les noms de famille,
      sortent de « last » et deviennent la liste « first » du pays, pour les
      hommes seulement ; makeName lit c.first quand elle existe, sinon
      FIRST_M/FIRST_F — exactement un tirage de prénom et un de nom de
      famille, comme avant (même avancée du SEED) ;
   3) une partie déjà commencée : le nom est stocké sur le combattant
      (roster Split, carrière, Panthéon) — rien ne change pour ce qui est
      écrit ; le monde extérieur du management DÉRIVE son nom à la lecture :
      une ligne Corée/Géorgie peut donc porter un autre nom au prochain
      affichage, les autres pays rendent la même suite qu'avant.
   ============================================================================ */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

const KR = ['Min-jun','Seo-jun','Ji-ho','Hyun-woo','Joon-ho','Tae-yang','Sang-min','Woo-jin','Min-ho','Gun-woo','Jae-hyun','Seung-woo','Do-yoon','Sung-min','Young-ho','Jin-woo'];
const GE = ['Guram','Amiran','Ilia','Roman','Merab','Giga','Lasha','Shota','Revaz','Zurab'];

test('Accents — Araújo, Guimarães, Magalhães rendus, listes brésilienne et mexicaine intactes', () => {
  const win = newGameWindow();
  const r = JSON.parse(win.eval(`JSON.stringify({
    br:COUNTRIES.BR.last, mx:COUNTRIES.MX.last,
    brN:COUNTRIES.BR.last.length, mxN:COUNTRIES.MX.last.length
  })`));
  /* Brésil : 30 entrées, mêmes positions que la mise noms1, seuls les trois
     noms listés changent de graphie. */
  assert.equal(r.brN, 38, 'Brésil : 30 d\'origine + 8 ajoutés (H2 bis, 03/10)');
  assert.deepEqual(r.br.slice(0,30), ['Silva','Souza','Oliveira','Costa','Almeida','Pereira','Lima','Rocha','Carvalho',
    'Gomes','Martins','Araújo','Ribeiro','Melo','Cardoso','Dias','Barbosa','Nascimento','Dos Santos',
    'Guimarães','Barboza','Teixeira','Magalhães','Nogueira','Faria','Castilho','Moreira','Fontes','Ramos','Peixoto']);
  /* Mexique : 25 entrées, huit graphies rendues (les sept décidées et
     Saldívar, trouvé par la vérification). */
  assert.equal(r.mxN, 25, 'Mexique : 25 entrées (H2 bis, 03/10 : 10 noms de combattants sortis, 10 noms courants entrés)');
  assert.deepEqual(r.mx.slice(0,15), ['Hernández','García','Martínez','López','Ramírez','Torres','Flores','Pérez',
    'Rodríguez','Sánchez','Cruz','Gómez','Morales','Reyes','Moreno']);
  for(const sorti of ['Cejudo','Canelo','Grasso','Aldana','Barrera']){
    assert.ok(!r.mx.includes(sorti), 'Mexique : ' + sorti + ' retiré');
  }
  /* Les graphies retirées ne survivent nulle part. */
  const all = JSON.stringify(r);
  for(const legacy of ['Araujo','Guimaraes','Magalhaes','Rodriguez','Sanchez','Gomez','Velasquez',
    'Chavez','Marquez','Saldivar','Castaneda']){
    assert.ok(!all.includes(legacy), 'graphie non accentée restante : ' + legacy);
  }
});

test('Prénoms rangés — KR/GE mènent à une liste first du pays, hommes seulement', () => {
  const win = newGameWindow();
  /* Listes épinglées : prénoms dehors, ordre conservé. */
  assert.deepEqual(win.eval(`JSON.stringify(COUNTRIES.KR.first)`), JSON.stringify(KR));
  assert.deepEqual(win.eval(`JSON.stringify(COUNTRIES.GE.first)`), JSON.stringify(GE));
  assert.equal(win.eval(`COUNTRIES.KR.last.length`), 14, 'Corée : 14 noms de famille');
  assert.equal(win.eval(`COUNTRIES.GE.last.length`), 15, 'Géorgie : 15 noms de famille (H2 bis, 03/10)');
  const m = JSON.parse(win.eval(`JSON.stringify((function(){
    const KRF=${JSON.stringify(KR)}, GEF=${JSON.stringify(GE)};
    setSeed(4242); const krH=makeName('H','KR');
    setSeed(4243); const geH=makeName('H','GE');
    setSeed(4244); const krF=makeName('F','KR');
    setSeed(4245); const geF=makeName('F','GE');
    setSeed(4246); const frH=makeName('H','FR');
    return {krH:krH.name,krHf:krH.first,krHl:krH.last,
            geH:geH.name,geHf:geH.first,geHl:geH.last,
            krF:krF.name,krFf:krF.first,
            geF:geF.name,geFf:geF.first,
            frH:frH.name,frHf:frH.first,
            krInFirst:KRF.includes(krH.first), krLastOk:COUNTRIES.KR.last.includes(krH.last),
            geInFirst:GEF.includes(geH.first), geLastOk:COUNTRIES.GE.last.includes(geH.last),
            krFf:COUNTRIES.KR.firstF.includes(krF.first), krFnotKr:KRF.includes(krF.first),
            geFf:COUNTRIES.GE.firstF.includes(geF.first),
            frM:COUNTRIES.FR.first.includes(frH.first)};
  })())` ) );
  /* Les hommes KR/GE portent la liste du pays. */
  assert.ok(m.krInFirst && m.krLastOk, 'homme coréen : ' + m.krH);
  assert.ok(m.geInFirst && m.geLastOk, 'homme géorgien : ' + m.geH);
  /* Les femmes KR/GE tirent dans la firstF du pays (H2 bis, 03/10), jamais dans la liste des hommes. */
  assert.ok(m.krFf && !m.krFnotKr, 'femme coréenne : ' + m.krF);
  assert.ok(m.geFf, 'femme géorgienne : ' + m.geF);
  /* La France tire dans sa liste first (H2 bis, 03/10). */
  assert.ok(m.frM, 'homme français : ' + m.frH);
  /* Même nombre de tirages : makeName consomme EXACTEMENT deux appels rnd()
     (un prénom, un nom de famille), qu'il passe par c.first ou par
     FIRST_M/FIRST_F — un seul avec firstOverride. Sondé par compteur. */
  const ticks = JSON.parse(win.eval(`JSON.stringify((()=>{
    const orig=rnd; let n=0;
    rnd=function(){ n++; return orig(); };
    setSeed(901); n=0; makeName('H','KR'); const kr=n;
    setSeed(901); n=0; makeName('H','FR'); const fr=n;
    setSeed(901); n=0; makeName('F','GE'); const geF=n;
    setSeed(901); n=0; makeName('H','GE','Apollon'); const over=n;
    rnd=orig;
    return {kr,fr,geF,over};
  })())`));
  assert.equal(ticks.kr, 2, 'un homme KR : deux tirages (prénom pays + nom)');
  assert.equal(ticks.fr, ticks.kr, 'un homme FR consomme autant, par FIRST_M');
  assert.equal(ticks.geF, ticks.kr, 'une femme GE consomme autant, par FIRST_F');
  assert.equal(ticks.over, 1, 'firstOverride : un seul tirage (le nom de famille)');
});

test('Partie déjà commencée — monde extérieur dérivé : Corée/Géorgie passent par les listes first', () => {
  const win = newGameWindow();
  win.eval(`setSeed(77); CL.mgmtEnter();`);
  const r = JSON.parse(win.eval(`JSON.stringify((function(){
    const KRF=${JSON.stringify(KR)}, GEF=${JSON.stringify(GE)};
    const div=divById('H-light');
    const nom=mgmtExteriorName(123456,div,'KR');
    const nomGe=mgmtExteriorName(123456,div,'GE');
    return {kr:{name:nom.name,okIn:KRF.includes(nom.first),okLast:COUNTRIES.KR.last.includes(nom.last)},
            ge:{name:nomGe.name,okIn:GEF.includes(nomGe.first),okLast:COUNTRIES.GE.last.includes(nomGe.last)}};
  })())`));
  assert.ok(r.kr.okIn && r.kr.okLast, 'dérivation Corée : ' + r.kr.name);
  assert.ok(r.ge.okIn && r.ge.okLast, 'dérivation Géorgie : ' + r.ge.name);
});
