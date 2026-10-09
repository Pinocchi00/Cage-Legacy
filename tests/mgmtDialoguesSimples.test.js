"use strict";
/* Brief démo du 09/10/2026, décision d'Anthony : « refaire tous les dialogues, phrases, en les rendant très simples, très compréhensibles » ;
   Leïla vouvoie et parle en phrases plus courtes. Le test garde la forme : des phrases courtes, et Leïla ne tutoie jamais. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');

const mots=t=>String(t).split(/\s+/).filter(Boolean).length;
const phrases=t=>String(t).split(/[.!?…]+(?:\s+|$)/).map(s=>s.trim()).filter(Boolean);
const maxPhrase=liste=>Math.max(...liste.flatMap(phrases).map(mots));
const tutoie=t=>/(^|[^a-zA-ZÀ-ÿ])(tu|ton|ta|tes|toi|te|t')([^a-zA-ZÀ-ÿ]|$)/i.test(t.replace(/’/g,"'"));

function textes(){
  const win=newGameWindow();
  return JSON.parse(win.eval(`JSON.stringify((function(){
    const leila=[]; for(const k of Object.keys(MGMT_EXCHANGES)){ const e=MGMT_EXCHANGES[k]; (e.lines||[]).forEach(l=>leila.push(l)); if(e.warning) leila.push(e.warning); }
    const voix=[]; MGMT_VOIX.forEach(v=>v.repliques.forEach(x=>voix.push(x.texte)));
    const medias=MGMT_MEDIAS_LIGNES.map(l=>l.texte);
    const anciens=[]; for(const k of Object.keys(MGMT_ANCIENS_TEXTES)) if(Array.isArray(MGMT_ANCIENS_TEXTES[k])) MGMT_ANCIENS_TEXTES[k].forEach(x=>anciens.push(x.t));
    const raisons=MGMT_RAISONS.map(x=>x.text);
    const prise=[MGMT_PRISE_TEXTES.arrivee.leila.texte,...Object.values(MGMT_PRISE_TEXTES.moments).map(x=>x.texte)];
    return {leila,voix,medias,anciens,raisons,prise};
  })())`));
}

test('Leïla vouvoie et parle court : jamais « tu », chaque phrase tient en 12 mots', () => {
  const t=textes();
  assert.ok(t.leila.length>=6);
  for(const l of [...t.leila,...t.prise]){
    assert.ok(!tutoie(l),'Leïla vouvoie : '+l);
    for(const p of phrases(l)) assert.ok(mots(p)<=12,'phrase courte ('+mots(p)+' mots) : '+p);
  }
});

test('Les phrases du jeu sont courtes : médias, anciens combats, raisons de se battre, voix des combattants', () => {
  const t=textes();
  assert.ok(maxPhrase(t.medias)<=14,'médias : '+maxPhrase(t.medias));
  assert.ok(maxPhrase(t.anciens)<=10,'anciens combats : '+maxPhrase(t.anciens));
  assert.ok(maxPhrase(t.raisons)<=12,'raisons : '+maxPhrase(t.raisons));
  assert.ok(maxPhrase(t.voix)<=18,'voix : '+maxPhrase(t.voix));
  assert.ok(Math.max(...t.voix.map(mots))<=40,'une réplique de voix tient en 40 mots');
});
