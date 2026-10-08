"use strict";
/* CAGE LEGACY — tools/rapport-reclames.js
   Corrections du 08/10/2026, lot 10 (D4) : sur N soirées simulées (20 par défaut), la liste des combats réclamés par le public avec la raison de chacun, et ce
   que le joueur automatique en a fait. Le joueur automatique est celui de tools/mesure-management.js : il book d'abord les combats réclamés bookables, puis les têtes d'affiche.
   Usage : node tools/rapport-reclames.js [soirées] [--org id] [--out chemin.md]. Il ne modifie aucun fichier du dépôt. */
const fs = require('fs');
const path = require('path');
const { newGameWindow } = require('../tests/helpers/loadGame');
const opt = n => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : null; };
const SOIREES = Number(process.argv.slice(2).find(a => /^\d+$/.test(a))) || 20;
const out = opt('--out') || path.join(__dirname, 'reports', 'RECLAMES.md');
const win = newGameWindow({ runMain: true });
const r = JSON.parse(win.eval(`JSON.stringify((function(){
  mgmtRetraitProb=function(){return 0;}; setSeed(20261008);
  const m=mgmtDefault(${JSON.stringify(opt('--org') || 'split')}); mgmtNewRoster(m); mgmtExteriorEnsure(m); mgmtNewPile(m); G={theme:'dark',mgmt:m}; mgmtAgendaInit(m);
  const lignes=[]; let ok=0;
  for(let k=0;k<${SOIREES};k++){
    m.pile.forEach(x=>{x.status='closed';x.decision='ignored';}); m.open=null;
    for(const f of m.roster){ if(mgmtIsRetired(f)||f.libre||!f.ct||mgmtContratRestants(f)>1) continue; mgmtContratRenouveler(m,f.id,3,mgmtBourseSouhaitee(m,f,true)); }
    if(!m.cal.prochaines.length) mgmtAgendaPoser(m,m.cal.jour+MGMT_EVENT_WEEKS*7,'petite');
    const recl=mgmtPublicReclame(m), bookables=mgmtReclamesBookables(m,recl);
    const ids=new Set(bookables.map(x=>x.a+'|'+x.b));
    for(const x of bookables){ if(m.card.main.length>=m.card.sizeMain) break; const a=mgmtFighterById(m,x.a), b=mgmtFighterById(m,x.b);
      if(a&&b&&a.div===b.div&&mgmtSelectable(m,a,null)&&mgmtSelectable(m,b,a.id)) mgmtBookMain(m,a.id,b.id); }
    const divs=[...new Set(mgmtCartRows(m).map(f=>f.div))]; let e=0;
    while(m.card.main.length<m.card.sizeMain&&e++<60){ const div=divs[(k+m.card.main.length+e)%divs.length]; const rows=mgmtCartRows(m).filter(f=>f.div===div&&mgmtSelectable(m,f,null)).sort((x,y)=>mgmtStar(y)-mgmtStar(x)); const a=rows[0], b=a&&rows.find(x=>x.id!==a.id&&mgmtSelectable(m,x,a.id)); if(a&&b) mgmtBookMain(m,a.id,b.id); }
    const joues=new Set(mgmtCardFights(m).map(f=>[f.a,f.b].sort().join('|')));
    lignes.push({n:k+1,recl:recl.map(x=>({texte:x.texte||'',raison:x.raison,bookable:ids.has(x.a+'|'+x.b),joue:joues.has([x.a,x.b].sort().join('|'))}))});
    const bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open'); if(!bulk) mgmtOfferBulk(m,true); const b2=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open'); if(b2) mgmtDecide(m,b2.id,'validate');
    if(!mgmtAgendaJouer(m)) break; mgmtNewPile(m); ok++;
  }
  return lignes; })())`));
const par = {};
for (const l of r) for (const x of l.recl) { const p = par[x.raison] || (par[x.raison] = { n: 0, bookables: 0, joues: 0 }); p.n++; if (x.bookable) p.bookables++; if (x.joue) p.joues++; }
let md = `# Les combats réclamés sur ${r.length} soirées (corrections du 08/10/2026, lot 10, D4)\n\nJoueur automatique « raisonnable » (voir \`tools/mesure-management.js\`), graine 20261008. Outil : \`tools/rapport-reclames.js\`.\n\n## Par raison\n\n| Raison | Réclamés | Bookables | Joués |\n|---|---|---|---|\n`;
for (const [k, v] of Object.entries(par)) md += `| ${k} | ${v.n} | ${v.bookables} | ${v.joues} |\n`;
md += `\n## Soirée par soirée\n\n`;
for (const l of r) { md += `**Soirée ${l.n}** — ${l.recl.length} réclamé${l.recl.length > 1 ? 's' : ''}\n\n`; for (const x of l.recl) md += `- ${x.texte || x.raison}${x.bookable ? '' : ' (impossible à booker)'}${x.joue ? ' — joué' : ''}\n`; md += '\n'; }
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, md);
console.log(md.split('\n## Soirée')[0]);
