"use strict";
/* Assemble chaque planche en une page autonome : commun.css + corps + commun.js + script de la planche.
   node construire.js  →  ../MondeChargement.html, ../MondeArrivee.html, ../MondeResultats.html */
const fs=require('fs'), path=require('path');
const ICI=__dirname, OUT=path.join(ICI,'..');
const lire=f=>fs.existsSync(path.join(ICI,f))?fs.readFileSync(path.join(ICI,f),'utf8'):'';
const OCT=t=>`<svg width="${t}" height="${t}" viewBox="0 0 400 400" fill="none" role="img" aria-label="L’octogone rouge gravé" style="flex:none"><path d="M292.0 238.1L238.1 292.0L161.9 292.0L108.0 238.1L108.0 161.9L161.9 108.0L238.1 108.0L292.0 161.9Z" stroke="#E23A2B" stroke-width="15.0"/><path d="M331.0 254.3L254.3 331.0L145.7 331.0L69.0 254.3L69.0 145.7L145.7 69.0L254.3 69.0L331.0 145.7Z" stroke="#E23A2B" stroke-width="21.0"/><path d="M371.0 270.8L270.8 371.0L129.2 371.0L29.0 270.8L29.0 129.2L129.2 29.0L270.8 29.0L371.0 129.2Z" stroke="#E23A2B" stroke-width="12.0"/></svg>`;
const LOGO=t=>`<div class="logo">${OCT(t)}<div class="logo-mots"><b>CAGE</b><i>LEGACY</i></div></div>`;
const SECTIONS=['ACCUEIL','CARTE','PRÉLIMINAIRES','EFFECTIF','CLASSEMENTS','CEINTURES','CONTRATS','CAMPS','PRESSE','CALENDRIER','RÉSULTATS','FINANCES'];
const BARRE=on=>`<nav class="barre" aria-label="Sections"><div class="barre-logo">${LOGO(88)}</div>`
  +SECTIONS.map(s=>`<button type="button" class="sec${s===on?' on':''}"${s===on?' aria-current="page"':''}><span>${s}</span></button>`).join('')
  +`<div class="sec-bas"><button type="button" class="sec"><span>OPTIONS</span></button><button type="button" class="sec"><span>MENU PRINCIPAL</span></button></div></nav>`;
for(const nom of ['MondeChargement','MondeArrivee','MondeResultats']){
  let corps=lire(nom+'.body.html'); if(!corps) continue;
  const tete=/<!-- titre: (.*?) \| etats: (.*?) -->/.exec(corps);
  corps=corps.replace(/<!--.*?-->\n?/,'').replace('{{LOGO64}}',LOGO(64)).replace(/\{\{BARRE:(.*?)\}\}/,(_,s)=>BARRE(s));
  const html=`<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${tete[1]}</title>
<style>
${lire('commun.css')}
</style>
</head>
<body data-etats="${tete[2]}">
${corps}
<script>
${lire('commun.js')}
</script>
${lire(nom+'.js')?`<script>\n${lire(nom+'.js')}\n</script>\n`:''}</body>
</html>
`;
  fs.writeFileSync(path.join(OUT,nom+'.html'),html);
  console.log(nom+'.html', html.length);
}
