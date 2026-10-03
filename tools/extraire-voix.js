"use strict";
/* CAGE LEGACY — tools/extraire-voix.js
   Lot 5 T2 + T3 : génère mgmt-voix-data.js depuis docs/LES-VOIX-DES-COMBATTANTS-v2.md.
   Les répliques entrent TELLES QUELLES (le document porte les textes ; ni Claude
   ni un outil ne réécrit une phrase) ; chacune reste marquée relu:false tant
   qu'Anthony ne l'a pas relue. Usage : node tools/extraire-voix.js */
const fs=require('node:fs');
const path=require('node:path');
const SRC=path.join(__dirname,'..','docs','LES-VOIX-DES-COMBATTANTS-v2.md');
const OUT=path.join(__dirname,'..','mgmt-voix-data.js');

const sansAccent=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'');
const slug=s=>sansAccent(s).toLowerCase().replace(/œ/g,'oe').replace(/[’']/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
/* Les didascalies en italique, « *(par son interprète)* », restent : on ôte les astérisques, jamais le mot. */
const nettoie=t=>t.replace(/\*\(([^)]*)\)\*/g,'($1)').replace(/\s+/g,' ').trim();

const lignes=fs.readFileSync(SRC,'utf8').split(/\r?\n/);
const voix=[];
let courante=null, bloc=null;
const fermeBloc=()=>{
  if(courante&&bloc){
    const texte=bloc.join(' ');
    const m=/^\*\*(.+?)\*\*\s*—\s*([\s\S]*)$/.exec(texte);
    if(m){
      const etiquette=m[1].trim(), repl=nettoie(m[2]);
      if(repl) courante.repliques.push({situation:slug(etiquette.split(',')[0]),etiquette,texte:repl,relu:false});
    }
  }
  bloc=null;
};
for(const brut of lignes){
  const h=/^## 3\.(\d+) (.+)$/.exec(brut);
  if(h){
    fermeBloc();
    const nom=h[2].replace(/ — .*$/,'').trim();
    courante={n:Number(h[1]),id:slug(nom),nom:nom.charAt(0)+nom.slice(1).toLowerCase(),repliques:[]};
    voix.push(courante);
    continue;
  }
  if(/^# 4\./.test(brut)){ fermeBloc(); courante=null; continue; }
  if(!courante) continue;
  if(/^> /.test(brut)||/^>$/.test(brut)){
    const t=brut.replace(/^>\s?/,'');
    if(bloc===null) bloc=[];
    if(t.trim()) bloc.push(t.trim());
  }else if(bloc!==null){ fermeBloc(); }
}
fermeBloc();
if(voix.length!==48) throw new Error('48 voix attendues, '+voix.length+' trouvées');
for(const v of voix){ if(!v.repliques.length) throw new Error('voix sans réplique : '+v.id); }

const entete=`"use strict";
/* ==== [ANCRE: MGMT_LOT5_T2T3_VOIX_DONNEES] — Lot 5 T2 + T3 : les quarante-huit
   voix des combattants (docs/LES-VOIX-DES-COMBATTANTS-v2.md §3), GÉNÉRÉ par
   tools/extraire-voix.js — ne pas éditer à la main : on corrige le document,
   puis on relance l'outil. Les répliques sont celles du document, telles
   quelles, chacune relu:false jusqu'à la relecture d'Anthony (règle
   absolue : les voix sont écrites par Anthony). Emplacements : {adv} {cat}
   {rang} {rang_adv} {mois} {round} {jours} {classe} {pays} {metier}
   {surnom} ; accords [masculin|féminin] du locuteur. ==== */
const MGMT_VOIX=`;
const corps=JSON.stringify(voix.map(v=>({id:v.id,nom:v.nom,repliques:v.repliques})),null,1);
fs.writeFileSync(OUT,entete+corps+';\n/* ==== [FIN ANCRE] ==== */\n');
const total=voix.reduce((n,v)=>n+v.repliques.length,0);
console.log(JSON.stringify({voix:voix.length,repliques:total,ids:voix.map(v=>v.id)}));
