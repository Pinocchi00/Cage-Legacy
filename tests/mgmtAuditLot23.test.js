"use strict";
/* ==== [ANCRE: TESTS_AUDIT_LOT23] — Monde lot 23 : corrections de l'audit du 16/10/2026 (docs/AUDIT-16-10-FICHE.md), une ligne = un test. ==== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

test('Monde lot 23 — A1/A2 : Leïla tutoie le matchmaker et ne l’appelle plus « Patron »', () => {
  const w = newGameWindow({ runMain: true });
  const textes = JSON.parse(w.eval(`JSON.stringify((function(){
    const t=[];
    for(const ex of Object.values(MGMT_EXCHANGES)){
      for(const l of (ex.lines||[])) if(typeof l==='string') t.push(l);
      for(const l of (ex.variantes||[])) t.push(l);
      for(const l of (ex.avertissements||[])) t.push(l);
      if(ex.warning) t.push(ex.warning);
      for(const r of (ex.replies||[])) if(r.text) t.push(r.text);
    }
    return t;})())`));
  assert.ok(textes.length >= 10, 'les répliques de Leïla sont lues');
  const fautes = textes.filter(s => /\bvous\b|\bvotre\b|\bvos\b|\bPatron\b|Pouvez|Prévenez|Retenez|Dites-moi|Faites/.test(s));
  assert.deepEqual(fautes, []);
});

test('Monde lot 23 — C11 : « 1 défaite », jamais « 1 défaites »', () => {
  const w = newGameWindow({ runMain: true });
  const r = JSON.parse(w.eval(`JSON.stringify([{W:9,L:1,D:0},{W:1,L:2,D:2},{W:0,L:0,D:1}].map(v=>mgmtPresentationPhrase({hist:[]},{famille:'bilan',valeur:v,sources:[]}).texte))`));
  assert.deepEqual(r, ['Bilan : 9 victoires, 1 défaite, 0 nul.', 'Bilan : 1 victoire, 2 défaites, 2 nuls.', 'Bilan : 0 victoire, 0 défaite, 1 nul.']);
});

test('Monde lot 23 — C9 : un combattant disponible se lit « Disponible », « Sans contrat » reste pour le contrat', () => {
  const w = newGameWindow({ runMain: true });
  const r = JSON.parse(w.eval(`JSON.stringify((function(){
    setSeed(20261008); const m=mgmtDefault('split'); mgmtNewRoster(m); G={theme:'dark',mgmt:m};
    const f=m.roster.find(x=>!x.libre&&mgmtAvailable(m,x)&&!mgmtEngaged(m,x));
    const libre=Object.assign({},f,{libre:true});
    return {dispo:mgmtEffectifSituation(m,f).texte, sans:mgmtEffectifSituation(m,libre).texte};})())`));
  assert.deepEqual(r, { dispo: 'Disponible', sans: 'Sans contrat' });
});

test('Monde lot 23 — D10 : une combattante est « blessée » et « suspendue », au féminin', () => {
  const w = newGameWindow({ runMain: true });
  const r = JSON.parse(w.eval(`JSON.stringify((function(){
    setSeed(20261008); const m=mgmtDefault('split'); mgmtNewRoster(m); G={theme:'dark',mgmt:m};
    const fem=m.roster.find(x=>mgmtFeminin(x)), hom=m.roster.find(x=>!mgmtFeminin(x));
    m.cycle=0;
    m.lastEvent={fights:[],touched:[{id:fem.id,injury:'Entorse',days:60},{id:hom.id,injury:'Fracture',days:90},{id:fem.id,days:30}]};
    return mgmtLendemainConstatsHtml(m).replace(/<[^>]+>/g,'|');})())`));
  assert.match(r, /, blessée\|/);
  assert.match(r, /suspendue 60 jours/);
  assert.match(r, /suspendue 30 jours/);
  assert.match(r, /, blessé\|/);
  assert.match(r, /suspendu 90 jours/);
});

test('Monde lot 23 — E3/E170 : plus d’étiquette doublée, et la blague des croissants épargne un Français sorti par une finition', () => {
  const w = newGameWindow({ runMain: true });
  const r = JSON.parse(w.eval(`JSON.stringify((function(){
    setSeed(20261008); const m=mgmtDefault('split'); G={theme:'dark',mgmt:m};
    const fr={name:'Louis Martin',ck:'FR'}, autre={name:'Hans Meyer',ck:'DE'};
    const perd=mgmtMediasContexte(m,'fr',{a:autre,b:fr,family:'ko',round:1,rounds:3,n:5,cat:'x'});
    const gagne=mgmtMediasContexte(m,'fr',{a:fr,b:autre,family:'ko',round:1,rounds:3,n:5,cat:'x'});
    const decision=mgmtMediasContexte(m,'fr',{a:autre,b:fr,family:'dec',round:3,rounds:3,n:5,cat:'x'});
    const prefixes=MGMT_MEDIAS_LIGNES?MGMT_MEDIAS_LIGNES.filter(l=>l.media==='sources-proches'&&/^Info :/.test(l.texte)).length:-1;
    return {perd,gagneNom:gagne&&gagne.a,decisionNom:decision&&decision.a,prefixes};})())`));
  assert.equal(r.perd, null);
  assert.equal(r.gagneNom, 'Louis Martin');
  assert.equal(r.decisionNom, 'Louis Martin');
  assert.equal(r.prefixes, 0);
});

test('Monde lot 23 — A3 : la numérotation de soirée des Finances et des parties suit celle du reste du jeu', () => {
  const { jouerSoirees } = { jouerSoirees: require('./helpers/jouerSoirees.js') };
  const w = newGameWindow({ runMain: true });
  w.eval("setSeed(20261008); mgmtPasseGenerer('split',{soirees:6});");
  jouerSoirees(w, 2);
  const r = JSON.parse(w.eval(`JSON.stringify((function(){
    const m=G.mgmt, ev=m.eventsPlayed;
    const finances=mgmtFinancesCartes(m)[0].l[0];
    return {ev,finances,joues:mgmtSoireesJoueur(m)};})())`));
  assert.ok(r.finances.endsWith('Fight Night ' + r.ev), 'les finances disent « Après … Fight Night ' + r.ev + ' » : ' + r.finances);
  assert.ok(r.joues < r.ev, 'les soirées du joueur ne comptent pas celles d’avant son arrivée');
});
