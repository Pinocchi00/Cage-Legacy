"use strict";
/* CAGE LEGACY — tools/exporter-textes.js
   Brief des corrections du 08/10/2026, lot 7.3 : un export lisible des textes marqués relu:false, par famille, un texte par ligne avec sa situation, pour
   qu'Anthony relise et coche. L'outil ne modifie AUCUN texte : il lit les données du jeu et écrit docs/TEXTES-A-RELIRE.md.
   Usage : node tools/exporter-textes.js [--out chemin.md]
   Familles : humanité (mgmt-humanite-data.js), voix (mgmt-voix-data.js), médias (mgmt-medias-data.js), camps (mgmt-camps-data.js), combat (mgmt-combat-data.js). */
const fs = require('fs');
const path = require('path');
const { newGameWindow } = require('../tests/helpers/loadGame');
const racine = path.join(__dirname, '..');
const iOut = process.argv.indexOf('--out');
const out = iOut >= 0 ? process.argv[iOut + 1] : path.join(racine, 'docs', 'TEXTES-A-RELIRE.md');
/* Brief démo, lot 9 T1 : tout fichier du jeu qui porte la marque relu:false est lu — la liste des familles est complétée par les fichiers de code qui la portent. */
const DEJA = ['mgmt-humanite-data.js', 'mgmt-voix-data.js', 'mgmt-medias-data.js', 'mgmt-camps-data.js', 'mgmt-combat-data.js'];
const AUTRES = fs.readdirSync(racine).filter(f => /.js$/.test(f) && !DEJA.includes(f) && /relus*:s*false/.test(fs.readFileSync(path.join(racine, f), 'utf8'))).sort();
const FAMILLES = [
  ['Humanité (surnoms, métiers, milieux, moments de vie, rituels, rôles, trajectoires)', 'mgmt-humanite-data.js'],
  ['Voix des combattants', 'mgmt-voix-data.js'],
  ['Médias', 'mgmt-medias-data.js'],
  ['Camps et salles', 'mgmt-camps-data.js'],
  ['Combat (commentaire, coins)', 'mgmt-combat-data.js'],
  ...AUTRES.map(f => ['Écrans et mécanismes — ' + f, f]),
];
const win = newGameWindow({ runMain: false });
const lire = fichier => {
  const src = fs.readFileSync(path.join(racine, fichier), 'utf8');
  const noms = [...src.matchAll(/^const\s+([A-Z][A-Z0-9_]+)\s*=/gm)].map(m => m[1]);
  return JSON.parse(win.eval(`JSON.stringify((function(){
    const noms=${JSON.stringify(noms)}, sortie=[];
    const texteDe=o=>{ for(const k of ['texte','libelle','nom','surnom','titre','t']) if(typeof o[k]==='string'&&o[k]) return o[k]; return null; };
    const marche=(o,chemin,prof,herite)=>{
      if(!o||typeof o!=='object'||prof>8) return;
      const h=herite||(!Array.isArray(o)&&o.relu===false);
      if(!Array.isArray(o)&&(o.relu===false||(herite&&typeof o.t==='string'))){ const t=texteDe(o); if(t!==null) sortie.push({chemin,t,situation:o.situation||o.etiquette||''}); }
      if(Array.isArray(o)) o.forEach((x,i)=>marche(x,chemin+'['+i+']',prof+1,h));
      else for(const k of Object.keys(o)) marche(o[k],chemin+'.'+k,prof+1,h);
    };
    for(const n of noms){ let v; try{ v=eval(n); }catch(e){ continue; } marche(v,n,0,false); }
    return sortie; })())`));
};
let md = `# Les textes à relire (corrections du 08/10/2026, lot 7.3)\n\nExport généré par \`tools/exporter-textes.js\`. **Aucun texte n'est modifié par l'outil.** Chaque ligne est un texte marqué \`relu:false\` : coche-la quand tu l'as relue, réécris-la dans le fichier de données, puis passe sa marque à \`relu:true\`. Les voix des combattants viennent d'un document (\`docs/LES-VOIX-DES-COMBATTANTS-v2.md\`) : on y corrige d'abord le document, puis on relance \`tools/extraire-voix.js\`.\n\n`;
let total = 0;
for (const [titre, fichier] of FAMILLES) {
  const l = lire(fichier);
  total += l.length;
  md += `## ${titre} — ${l.length} textes\n\nFichier : \`${fichier}\`\n\n`;
  for (const x of l) md += `- [ ] \`${x.chemin}\`${x.situation ? ' (' + x.situation + ')' : ''} : ${x.t.replace(/\n/g, ' ')}\n`;
  md += '\n';
}
md = md.replace('# Les textes à relire (corrections', `# Les textes à relire — ${total} textes (corrections`);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, md);
console.log(`${total} textes écrits dans ${out}`);
for (const [titre, fichier] of FAMILLES) console.log(' -', fichier);
