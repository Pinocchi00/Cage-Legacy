"use strict";
/* Produit ui-duo.css à partir des feuilles des planches Duo (maquettes/duo/src/commun.css + duo.css) : mêmes règles, toutes portées sous `.duo-s`
   (le conteneur posé dans le cadre du jeu), pour que les écrans du Duo aient exactement le rendu des planches validées sans rien changer au reste du jeu.
   node tools/duo-css.js  →  ui-duo.css */
const fs=require('fs'), path=require('path');
const SRC=path.join(__dirname,'..','maquettes','duo','src');
let css=fs.readFileSync(path.join(SRC,'commun.css'),'utf8')+'\n'+fs.readFileSync(path.join(SRC,'duo.css'),'utf8');
css=css.replace(/\/\*[\s\S]*?\*\//g,'').replace(/@font-face\s*\{[^}]*\}/g,'');
const sortie=[];
const re=/([^{}]+)\{([^{}]*)\}/g;
let m;
while((m=re.exec(css))){
  const sel=m[1].trim(), corps=m[2].trim();
  if(!sel||/^(html|body)\b/.test(sel)||/^\.ecran\b/.test(sel)||/^\[data-etat\]/.test(sel)) continue;
  if(sel===':root') { sortie.push('.duo-s{'+corps+'}'); continue; }
  if(sel==='.stage'){ continue; }
  const sels=sel.split(',').map(s=>s.trim()).filter(Boolean).map(s=>{
    if(s.startsWith(':where(.stage)')) return ':where(.duo-s)'+s.slice(14);
    if(s.startsWith('.stage')) return '.duo-s'+s.slice(6);
    return '.duo-s '+s;
  });
  sortie.push(sels.join(',')+'{'+corps+'}');
}
const tete='/* ==== [ANCRE: DUO_PLANCHES_CSS] — généré par tools/duo-css.js depuis maquettes/duo/src (commun.css + duo.css), sous .duo-s. Ne pas modifier à la main : relancer l\'outil. ==== */\n'
 +'.duo-s{position:absolute;inset:0;overflow:hidden;color:var(--blanc);font-family:var(--texte);font-weight:500;line-height:1.2;--noir:#0D0B0B;--pan:#121010;--ligne:#252121;--blanc:#E9E6E1;--rouge:#B32A1E;--rouge-vif:#E23A2B;--jaune:#F0B220;--t2:rgba(233,230,225,.74);--sep:rgba(233,230,225,.16);--bord:rgba(233,230,225,.38);--titre:\'Saira Extra Condensed\',\'Arial Narrow\',sans-serif;--texte:\'Saira Condensed\',\'Arial Narrow\',sans-serif}\n';
fs.writeFileSync(path.join(__dirname,'..','ui-duo.css'),tete+sortie.join('\n')+'\n');
console.log('ui-duo.css',sortie.length,'règles');
