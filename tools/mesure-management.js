"use strict";
/* CAGE LEGACY — tools/mesure-management.js
   Brief des corrections du 08/10/2026, lot 7.1 : la mesure d'ensemble du mode management sur la longue durée. Joue N soirées (40 par défaut) avec un joueur
   automatique « raisonnable » — il prolonge les contrats à l'avance, booke d'abord les combats réclamés puis les meilleures têtes d'affiche, met le titre en jeu
   quand il le peut une fois sur deux, valide la proposition de Leïla — pour chacune des huit organisations, et écrit un rapport.
   Monde lot 1 T2 : ce joueur n'est plus recopié ici, c'est la fonction du jeu mgmtPredecesseurSoiree (mgmt-predecesseur.js) ; l'outil prépare la partie et mesure.
   Ce joueur ne recrute pas et ignore les affaires : les chiffres sont des ordres de grandeur, pas des valeurs exactes.
   Usage : node tools/mesure-management.js [soirées] [--orgs id1,id2] [--out chemin.md] [--json]
   Il lit les vraies fonctions du jeu, ne modifie aucun fichier du dépôt, et écrit par défaut tools/reports/MESURE-MANAGEMENT.md.
   Colonnes : caisse (€), popularité, satisfaction du public (0 à 100), paliers d'attente (1 : attend, 2 : longtemps, 3 : rouillé, 4 : refuse tout combat),
   refus de prolongation (trop-grand, caisse, trop-bas), combats de titre par carte et changements de champion, âge moyen, moins de 25 ans, 36 ans et plus,
   et, depuis le lot 13, les retraites cumulées, le renouvellement du top 5 (membres du top 5 de départ qui en sont sortis, en moyenne par catégorie d'au moins dix combattants : dans une plus petite, le top 5 est tout le monde) et les jeunes
   de 24 ans et moins signables sur le marché. */
const fs = require('fs');
const path = require('path');
const { newGameWindow } = require('../tests/helpers/loadGame');
const args = process.argv.slice(2).filter((a, i, l) => !a.startsWith('--') && l[i - 1] !== '--out' && l[i - 1] !== '--orgs');
const opt = n => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : null; };
const SOIREES = args[0] ? Number(args[0]) : (process.argv.includes('--six-ans') ? 62 : 40);
/* --ans : les points à un, deux et quatre ans (12, 24 et 48 soirées mensuelles), pour la relève et la hiérarchie (lot 13). */
const ANS = process.argv.includes('--ans');
/* --six-ans (Monde lot 1 T1) : la mesure qui décide de la suite du lot — 62 soirées (MGMT_EVENT_WEEKS=5, 312 semaines),
   sauf nombre explicite en premier argument — chronomètre les trois étapes du brief : les combats (mgmtAgendaJouer),
   le reste de la soirée et l'ouverture de la semaine suivante (mgmtNewPile compris), et le booking (prolongations,
   combats réclamés, têtes d'affiche, titre, Leïla — les listes de booking et les recalculs de classement). */
const SIX_ANNEES = 62;
const POINTS = ANS ? [12, 24, 48].filter(p => p <= SOIREES) : [10, 20, 40].filter(p => p <= SOIREES).concat(SOIREES > 40 ? [SOIREES] : []);
const out = opt('--out') || path.join(__dirname, 'reports', 'MESURE-MANAGEMENT.md');
const json = process.argv.includes('--json');
const win = newGameWindow({ runMain: true });
const orgIds = opt('--orgs') ? opt('--orgs').split(',') : JSON.parse(win.eval('JSON.stringify(MGMT_ORGANISATIONS.map(o=>o.id))'));

/** Une partie : le joueur automatique, soirée après soirée. @returns {object} les mesures aux points demandés. */
function partie(orgId, seed) {
  return JSON.parse(win.eval(`JSON.stringify((function(){
    mgmtRetraitProb=function(){return 0;}; setSeed(${seed});
    const m=mgmtDefault(${JSON.stringify(orgId)}); mgmtNewRoster(m); mgmtExteriorEnsure(m); mgmtNewPile(m); G={theme:'dark',mgmt:m}; mgmtAgendaInit(m);
    const POINTS=${JSON.stringify(POINTS)}, res={}, refus={'trop-grand':0,caisse:0,'trop-bas':0,offre:0}; let titres=0, cartes=0, changes=0, joues=0, decouvert=0;
    const vivants=()=>m.roster.filter(f=>!mgmtIsRetired(f));
    const divsIds=[...new Set(m.roster.map(f=>f.div))].sort();
    /* Monde lot 1 T1 : le chrono des trois étapes accumulé DANS le win.eval — un Date.now() Node-side chronomètrerait le pont jsdom. */
    const chrono = { bookingMs: 0, combatsMs: 0 }; let totalMs = 0;
    const top5=()=>{ const o={}; for(const d of divsIds) o[d]=mgmtDivisionRanking(m,d,'organization').slice(0,5).map(f=>f.id); return o; };
    const top5Depart=top5();
    const mesure=n=>{ const v=vivants(), pal=[0,0,0,0,0], ages=v.map(f=>f.age);
      for(const f of v){ if(f.libre) continue; pal[mgmtContratPalier(m,f)]++; }
      const sc=m.comptes&&m.comptes.length?m.comptes[m.comptes.length-1]:null;
      res[n]={caisse:Math.round(m.treasury*1000),pop:m.pop,satisfaction:sc?sc.satisfaction:null,effectif:v.length,sansContrat:v.filter(f=>f.libre).length,
        paliers:{p1:pal[1],p2:pal[2],p3:pal[3],p4:pal[4]},refus:Object.assign({},refus),titresParCarte:cartes?Math.round(100*titres/cartes)/100:0,changementsDeChampion:changes,
        ageMoyen:Math.round(10*ages.reduce((a,b)=>a+b,0)/Math.max(1,ages.length))/10,moins25:ages.filter(a=>a<25).length,plus36:ages.filter(a=>a>=36).length,decouvert,
        retraites:m.roster.filter(f=>mgmtIsRetired(f)).length,
        top5Renouvele:(()=>{ const t=top5(); let s=0; const grandes=divsIds.filter(d=>m.roster.filter(f=>f.div===d).length>=10); for(const d of grandes) s+=top5Depart[d].filter(id=>!t[d].includes(id)).length; return Math.round(100*s/Math.max(1,grandes.length))/100; })(),
        marcheJeunes:divsIds.reduce((s,d)=>s+mgmtRecrutables(m,d).filter(x=>x.age<=24).length,0)}; };
    /* Monde lot 1 T2 : le joueur est la fonction du jeu mgmtPredecesseurSoiree (mgmt-predecesseur.js) ; l'outil ne garde que la préparation et la mesure. */
    for(let k=0;k<${SOIREES};k++){ const t0 = Date.now();
      const s=mgmtPredecesseurSoiree(m,k,undefined,chrono);
      for(const r of ['trop-grand','caisse','trop-bas','offre']) refus[r]+=s.refus[r];
      if(!s.jouee) break;
      joues++; cartes++; titres+=s.evenement.fights.filter(f=>f.title).length;
      changes+=s.champions.avant.filter((x,i)=>x!==s.champions.apres[i]).length;
      if(s.decouvert) decouvert++;
      if(POINTS.includes(joues)) mesure(joues);
      totalMs += Date.now() - t0;
    }
    const suiteMs = totalMs - chrono.bookingMs - chrono.combatsMs;
    res.chrono={soirees:joues,totalMs:Math.round(totalMs),combatsMs:Math.round(chrono.combatsMs),bookingMs:Math.round(chrono.bookingMs),suiteMs:Math.round(suiteMs)};
    return res; })())`));
}

const lignes = {};
for (const id of orgIds) {
  const t0 = Date.now();
  lignes[id] = partie(id, Number(opt('--graine')||20261008));   /* --graine : une autre partie, pour juger l'économie sur plusieurs tirages (retours du 09/10) */
  console.error(`${id} : ${((Date.now() - t0) / 1000).toFixed(0)} s`);
}
/* Monde lot 1 T1 : la clé chrono — sœur des points de mesure — porte la mesure des six ans : réelle si les 62 soirées
   ont été jouées, sinon une projection linéaire du total mesuré. Le chronométrage a lieu dans le win.eval, les
   chiffres ne dépendent pas du pont jsdom. */
for (const id of orgIds) {
  const ch = lignes[id] && lignes[id].chrono;
  if (!ch) continue;
  ch.mesureSixAns = ch.soirees === SIX_ANNEES;
  ch.sixAnsMs = ch.mesureSixAns ? ch.totalMs : Math.round(ch.totalMs / Math.max(1, ch.soirees) * SIX_ANNEES);
}
if (json) { console.log(JSON.stringify(lignes, null, 1)); process.exit(0); }
const eur = n => (n < 0 ? '−' : '') + String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' €';
let md = `# Mesure d'ensemble du management (corrections du 08/10/2026, lot 7.1)\n\n${SOIREES} soirées par organisation, joueur automatique « raisonnable » (il prolonge à l'avance, booke les combats réclamés puis les têtes d'affiche, met le titre en jeu une soirée sur deux, valide Leïla ; il ne recrute pas et ignore les affaires). **Ordres de grandeur, pas valeurs exactes.** Outil : \`tools/mesure-management.js\`, une graine par organisation (20261008).\n\n`;
for (const p of POINTS) {
  md += `## À la soirée ${p}\n\n| Organisation | Caisse | Pop. | Satisf. | Effectif | Sans contrat | Paliers 1 / 2 / 3 / 4 | Refus : trop grand / caisse / trop bas | Titres par carte | Champions changés | Âge moyen | < 25 ans | ≥ 36 ans | Soirées à découvert | Retraites | Top 5 renouvelé | Jeunes sur le marché |\n|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|\n`;
  for (const id of orgIds) {
    const r = lignes[id][p];
    md += r ? `| ${id} | ${eur(r.caisse)} | ${r.pop} | ${r.satisfaction} | ${r.effectif} | ${r.sansContrat} | ${r.paliers.p1} / ${r.paliers.p2} / ${r.paliers.p3} / ${r.paliers.p4} | ${r.refus['trop-grand']} / ${r.refus.caisse} / ${r.refus['trop-bas']} | ${r.titresParCarte} | ${r.changementsDeChampion} | ${r.ageMoyen} | ${r.moins25} | ${r.plus36} | ${r.decouvert} | ${r.retraites} | ${r.top5Renouvele} | ${r.marcheJeunes} |\n` : `| ${id} | partie arrêtée avant la soirée ${p} | | | | | | | | | | | | | | | |\n`;
  }
  md += '\n';
}
/* Monde lot 1 T1 : la section chrono — où va le temps, en secondes et en parts. */
md += `## Chrono des six ans\n\nSix ans = 62 soirées (MGMT_EVENT_WEEKS=5, 312 semaines). Le chrono est pris dans la fenêtre du jeu, aux trois étapes du brief : **Combats** (les combats de la soirée), **Suite** (le reste de la soirée et l'ouverture de la semaine suivante comprise) et **Booking** (prolongations, combats réclamés, têtes d'affiche, titre, Leïla — les listes de booking et les recalculs de classement) sur ${SOIREES} soirées mesurées.\n\n`;
md += `| Organisation | Soirées mesurées | Total | Six ans | Mesure | Combats | Suite | Booking | Booking, part du total |\n|---|---|---|---|---|---|---|---|---|\n`;
for (const id of orgIds) {
  const ch = lignes[id] && lignes[id].chrono;
  if (!ch) { md += `| ${id} | partie arrêtée | | | | | | | |\n`; continue; }
  const s = v => v.toFixed(1) + ' s'; /* seconds, une décimale */
  const pr = v => Math.round(100 * v / Math.max(1, ch.totalMs)) + ' %';
  md += `| ${id} | ${ch.soirees} | ${s(ch.totalMs / 1000)} | ${s(ch.sixAnsMs / 1000)} | ${ch.mesureSixAns ? 'mesurée' : 'projetée'} | ${s(ch.combatsMs / 1000)} (${pr(ch.combatsMs)}) | ${s(ch.suiteMs / 1000)} (${pr(ch.suiteMs)}) | ${s(ch.bookingMs / 1000)} (${pr(ch.bookingMs)}) | ${pr(ch.bookingMs)} |\n`;
}
md += '\n';
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, md);
console.log(md);
