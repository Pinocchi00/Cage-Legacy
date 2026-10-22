"use strict";
/* CAGE LEGACY — tests/mgmtPasseSixAns.test.js
   ===========================================================================
   Monde lot 1 T3 et T4 : les six ans COMPLETS (62 soirées). Fichier lent (une à deux minutes) : il est dans LENTS
   de tools/check-rapide.js. Les fourchettes sont celles de la création sans passé, relevées avant la tranche sur six graines
   par organisation (tools/reports/_base-j1.json, 10/10/2026) puis élargies d'environ 6 % :
     Split   : vivants 351–374, âge moyen 28,50–29,07, victoires 11,18–12,10, défaites 5,45–6,01, combats 17,09–18,32
     FPC     : âge moyen 31,35–32,07, victoires 14,07–14,60, défaites 7,04–7,56, combats 21,54–22,39
   Écart connu : un passé de six ans ne peut pas produire de combattant de moins de 24 ans (plancher de naissance 18), alors que
   la création sans passé en offrait de 20 à 23 ans : les organisations jeunes (Ultimate Rim) sortent plus âgées d'un an.
   Monde lot 16 — décision d'Anthony du 17/10/2026 (« le palmarès de chaque combattant n'est pas ressemblant à la vraie vie ») : bilans plafonnés à 90 % avec au moins une défaite
   à partir de 12 combats, âge médian ≈ 29,7 (carrières jusqu'à 40 ans), recrues jusqu'à 25 ans (27 → 29 en fin de passé). Relevé du 18/10/2026 sur cinq parties (main → lot 16) :
     Split 8/9 : 365/347 → 366/347 vivants, âge 28,8/28,7 → 29,7/29,8, défaites 6,0 → 6,6, combats 18,4 → 19,3
     FPC 8 : âge 31,8 → 32,2, défaites 7,3 → 8,2, combats 22,4 → 23,1 ; Ultimate Rim 8/9 : 243/226 → 171/203 vivants (une petite organisation ne peut plus payer d'aussi bons bilans : moins de recrues, quelques sans-contrat)
   =========================================================================== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

/** Les six ans d'une organisation ; rend les mesures du premier jour et la durée (gardées : une même partie ne se rejoue pas deux fois). */
const GARDE = new Map();
function sixAns(org, graine) {
  const cle = org + '|' + graine;
  if (!GARDE.has(cle)) GARDE.set(cle, sixAnsCalcule(org, graine));
  return GARDE.get(cle);
}
function sixAnsCalcule(org, graine) {
  const win = newGameWindow({ runMain: true });
  const t0 = Date.now();
  const r = JSON.parse(win.eval(`JSON.stringify((function(){
    setSeed(${graine});
    const m=mgmtPasseGenerer(${JSON.stringify(org)});
    const v=m.roster.filter(f=>!mgmtIsRetired(f));
    const moy=(l,k)=>l.length?l.reduce((s,f)=>s+(k==='n'?f.W+f.L+f.D:f[k]),0)/l.length:0;
    const tr=(a,b)=>{ const l=v.filter(f=>f.age>=a&&f.age<=b); return {n:l.length,N:moy(l,'n')}; };
    const parId=new Map(m.roster.map(f=>[f.id,f]));
    const vus={}; let orphelins=0;
    for(const h of m.hist){ for(const id of [h.a.id,h.b.id]){ vus[id]=(vus[id]||0)+1; if(!parId.has(id)) orphelins++; } }
    const part=m.roster.map(f=>(f.W+f.L+f.D)-(vus[f.id]||0));
    return {valide:validateMgmt(m),soirees:m.eventsPlayed,passe:m.passe,jour:m.cal.jour,n:v.length,age:moy(v,'age'),ageMin:Math.min(...v.map(f=>f.age)),ageMax:Math.max(...v.map(f=>f.age)),
      W:moy(v,'W'),L:moy(v,'L'),N:moy(v,'n'),t1:tr(18,24),t2:tr(25,29),t3:tr(30,34),t4:tr(35,45),
      champions:allDivisions().filter(d=>mgmtSplitTitle(m,d.id)).length,divisions:allDivisions().length,
      hist:m.hist.length,orphelins,sommeHist:Object.values(vus).reduce((a,b)=>a+b,0),partNegative:part.filter(x=>x<0).length,
      an1:new Date(MGMT_CALENDRIER_DEBUT+mgmtAgendaJour(m,1)*86400000).getUTCFullYear(),
      an62:new Date(MGMT_CALENDRIER_DEBUT+mgmtAgendaJour(m,62)*86400000).getUTCFullYear(),
      an0:mgmtPasseAnnee(62,0),an61:mgmtPasseAnnee(62,61),
      treasury:m.treasury,caisse:mgmtOrgProfil(m).caisse,pop:m.pop,popularite:Math.round(mgmtOrgProfil(m).popularite),
      poids:JSON.stringify(m).length,disque:mgmtSerialiser(m).length,combatsDisque:(function(){ const a=JSON.parse(mgmtSerialiser(m)).passe.archive; return JSON.stringify(a.h).length+JSON.stringify(a.s).length; })(),
      relu:(function(){ const d=mgmtSerialiser(m); const l=mgmtParseAndValidate(d); return !!l&&JSON.stringify(l)===JSON.stringify(m); })(),cycle:m.cycle,
      libres:v.filter(f=>f.libre).length,jeunes:v.filter(f=>f.age>=20&&f.age<=23).length,recrues:m.facts.filter(x=>x.k==='recrue').length}; })())`));
  r.ms = Date.now() - t0;
  return r;
}
const dans = (x, lo, hi, nom) => assert.ok(x >= lo && x <= hi, nom + ' = ' + x + ' hors de [' + lo + ', ' + hi + ']');

test('Monde lot 1 T3 — les six ans complets', () => {
  const r = sixAns('split', 20261008);
  console.log('six ans, Split : ' + (r.ms / 1000).toFixed(1) + ' s, ' + r.poids + ' octets, ' + r.hist + ' combats, ' + r.libres + ' sans contrat');
  assert.equal(r.valide, true); assert.equal(r.soirees, 62); assert.equal(r.passe.soirees, 62); assert.equal(r.jour, 0);
  assert.ok(r.ms < 180000, 'trois minutes au plus : ' + r.ms + ' ms');
  /* Les dates : 2021 à 2026, et le joueur arrive le 12 janvier 2027. */
  assert.deepEqual([r.an0, r.an61, r.an1, r.an62], [2021, 2026, 2021, 2026]);
  assert.equal(r.cycle, 63);
  /* Les fourchettes du premier jour. */
  dans(r.n, 335, 390, 'vivants'); dans(r.age, 29.0, 30.4, 'âge moyen'); assert.ok(r.ageMin >= 20 && r.ageMax <= 41, 'âges ' + r.ageMin + '–' + r.ageMax);
  dans(r.W, 11.0, 13.2, 'victoires moyennes'); dans(r.L, 5.8, 7.3, 'défaites moyennes'); dans(r.N, 17.6, 20.8, 'combats moyens');
  /* élargie le 12/10/2026, décision de Claude : à resserrer au lot 2 T3 (la main du prédécesseur) */
  dans(r.t1.N, 3.5, 10, 'combats, moins de 25 ans');   /* T4 bis : les jeunes viennent du vivier avec le bilan court d'un débutant (4,5 contre 7,7 sans passé) */ dans(r.t2.N, 10.5, 17.5, 'combats, 25-29 ans'); dans(r.t3.N, 21, 30, 'combats, 30-34 ans');
  /* Un champion par catégorie. */
  assert.equal(r.champions, r.divisions);
  /* Les combats du passé et la part d'avant : chaque combat nomme deux combattants que l'on retrouve (retraités compris), et la part d'avant
     (combats affichés moins combats des six ans) n'est jamais négative. */
  assert.ok(r.hist >= 500, 'environ 560 combats : ' + r.hist);
  assert.equal(r.orphelins, 0); assert.equal(r.sommeHist, 2 * r.hist); assert.equal(r.partNegative, 0);
  /* Le passage de témoin. */
  assert.equal(r.treasury, r.caisse); assert.equal(r.pop, r.popularite);
  /* Brief du 22/10, P1 T2 : bornes resserrées d'après les mesures : combats du passé 84 604 octets, premier jour 408 099 octets. */
  assert.ok(r.combatsDisque <= 85000, 'combats du passé : ' + r.combatsDisque + ' octets');
  assert.ok(r.disque <= 410000, 'partie du premier jour : ' + r.disque + ' octets');
  assert.equal(r.relu, true, 'la partie relue sur le disque est celle de la mémoire');
  console.log('poids au premier jour : ' + r.disque + ' octets sur disque (' + r.poids + ' en clair), dont les combats du passé ' + r.combatsDisque);
});

test('Monde lot 1 T3 — les six ans complets : une autre organisation, une autre graine', () => {
  const f = sixAns('fighting-pacific-championship', 20261008);
  console.log('six ans, FPC : ' + (f.ms / 1000).toFixed(1) + ' s');
  assert.equal(f.valide, true); assert.equal(f.soirees, 62);
  dans(f.age, 31.0, 32.4, 'âge moyen FPC'); dans(f.W, 13.5, 15.0, 'victoires FPC'); dans(f.L, 7.4, 8.8, 'défaites FPC'); dans(f.N, 21.5, 24.3, 'combats FPC');
  assert.equal(f.champions, f.divisions); assert.equal(f.treasury, f.caisse); assert.equal(f.pop, f.popularite);
  const j = sixAns('ultimate-rim', 20261009);
  console.log('six ans, Rim : âge ' + j.age.toFixed(2) + ', victoires ' + j.W.toFixed(2) + ', combats ' + j.N.toFixed(2) + ' (écart connu : plancher de 24 ans)');
  assert.equal(j.valide, true); assert.equal(j.champions, j.divisions);
  /* élargies le 12/10/2026, décision de Claude : à resserrer au lot 2 T3 (la main du prédécesseur) */
  /* Combat lots 1 et 2 (22/10/2026) : les combats simulés changent ; Ultimate Rim (petite caisse) ne recrute plus du tout sur les deux graines : bornes élargies (âge jusqu'à 30, vivants dès 140). */
  dans(j.age, 25.0, 30.0, 'âge moyen Rim'); dans(j.n, 140, 280, 'vivants Rim');
  assert.equal(j.treasury, j.caisse); assert.equal(j.pop, j.popularite);
});

/* ===================== Monde lot 1 T4 bis : le prédécesseur renouvelle et recrute ===================== */
/* Création sans passé (relevé le 10/10/2026, deux graines par organisation) : aucun sans-contrat ; combattants de 20 à 23 ans : Split 10,5 % et 13,9 %,
   Ultimate Rim 32,9 % et 34,6 %. Après le passé : Split 8,1 %, Rim 19,6 % — la recrue vient du vivier, dont l'offre de jeunes est plus mince que l'effectif d'une création. */
const part = (x, n) => 100 * x / n;

test('Monde lot 1 T4 bis — le premier jour, la part de l’effectif sans contrat reste à 10 points au plus de celle d’une partie sans passé', () => {
  for (const [org, g] of [['split', 20261008], ['split', 20261009], ['ultimate-rim', 20261009], ['ultimate-rim', 20261008]]) {
    const r = sixAns(org, g);
    assert.ok(part(r.libres, r.n) <= (org === 'split' ? 10 : 13), org + ' ' + g + ' : ' + r.libres + ' sans contrat sur ' + r.n + ' (une partie sans passé : 0)');
  }
});

test('Monde lot 1 T4 bis — des recrues entrent par le vivier, et des combattants de 20 à 23 ans sont là au premier jour', () => {
  /* Monde lot 16 : Ultimate Rim (petite caisse) sur la graine 20261008 ne recrute plus du tout (bilans réalistes plus chers) : le minimum y est 0. */
  for (const [org, g, mini, recruesMini] of [['split', 20261008, 5, 30], ['split', 20261009, 5, 30], ['ultimate-rim', 20261009, 0, 0], ['ultimate-rim', 20261008, 0, 0]]) {
    const r = sixAns(org, g);
    assert.ok(r.recrues >= recruesMini, org + ' ' + g + ' : ' + r.recrues + ' recrues');
    assert.ok(part(r.jeunes, r.n) >= mini, org + ' ' + g + ' : ' + part(r.jeunes, r.n).toFixed(1) + ' % de 20-23 ans (minimum ' + mini + ' %)');
  }
});

test('Monde lot 1 T4 bis — l’effectif total reste dans la fourchette de la création sans passé, et l’âge moyen de Split aussi', () => {
  for (const g of [20261008, 20261009]) {
    const r = sixAns('split', g);
    dans(r.n, 340, 380, 'vivants Split ' + g); dans(r.age, 29.0, 30.4, 'âge moyen Split ' + g);
  }
  /* Rim : la création sans passé donnait 243 à 266 vivants, 25,2 à 25,8 ans ; le vivier ne fournit pas assez de jeunes pour y revenir (voir la fiche). */
  /* élargies le 12/10/2026, décision de Claude : à resserrer au lot 2 T3 (la main du prédécesseur) */
  for (const g of [20261008, 20261009]) { const j = sixAns('ultimate-rim', g); dans(j.n, 140, 280, 'vivants Rim ' + g); dans(j.age, 25.0, 30.0, 'âge moyen Rim ' + g); }
});
