"use strict";
/* CAGE LEGACY — tools/extraire-retraits.js
   Lot 5 T6 : génère mgmt-retraits-data.js depuis docs/LOT-3B-CARTE-INCOMPLETE.md.
   Les quatorze répliques du registre (§G) sont de la main d'Anthony : elles
   entrent TELLES QUELLES, sans une retouche (la ponctuation d'hésitation de D1
   est le sens même de la réplique). Seule substitution : le nom du combattant
   de l'exemple A1 devient l'emplacement {nom}, parce que le jeu a un autre
   combattant à chaque retrait. Usage : node tools/extraire-retraits.js */
const fs=require('node:fs');
const path=require('node:path');
const SRC=path.join(__dirname,'..','docs','LOT-3B-CARTE-INCOMPLETE.md');
const OUT=path.join(__dirname,'..','mgmt-retraits-data.js');
const SUBSTITUTIONS={A1:[['Taylor Saint-Morand','{nom}']]};

const lignes=fs.readFileSync(SRC,'utf8').split(/\r?\n/);
const out={};
let id=null, bloc=[];
const ferme=()=>{
  if(id&&bloc.length){
    let t=bloc.join(' ').replace(/\s+/g,' ').trim();
    for(const [a,b] of SUBSTITUTIONS[id]||[]) t=t.split(a).join(b);
    out[id]={texte:t,auteur:'Anthony'};
  }
  bloc=[];
};
for(const brut of lignes){
  const h=/^### ([A-E]\d) — /.exec(brut);
  if(h){ ferme(); id=h[1]; continue; }
  if(/^#{1,2} /.test(brut)||/^---/.test(brut)){ ferme(); id=null; continue; }
  if(id&&/^>\s?/.test(brut)) bloc.push(brut.replace(/^>\s?/,'').trim());
  else if(id&&bloc.length&&brut.trim()==='') { ferme(); id=null; }
}
ferme();
const attendus=['A1','A2','B1','B2','C1','C2','C3','C4','D1','D2','D3','D4','E1'];
for(const k of attendus) if(!out[k]||!out[k].texte) throw new Error('réplique manquante : '+k);

const entete=`"use strict";
/* ==== [ANCRE: MGMT_LOT5_T6_RETRAITS_DONNEES] — Lot 5 T6 : les répliques de la
   carte incomplète (docs/LOT-3B-CARTE-INCOMPLETE.md, registre §G), GÉNÉRÉ par
   tools/extraire-retraits.js — ne pas éditer à la main. Elles sont de la main
   d'Anthony et entrent telles quelles ; seul le nom de l'exemple A1 devient
   {nom}. Qui parle : A1 B1 D1 Leïla ; A2 le combattant qui se retire ; B2 le
   prélim qui monte ; C1 C3 le combattant qui accepte ; C2 C4 celui qui refuse
   ; D2 D3 E1 Jean-Michel Delatour (le patron) ; D4 Stephen Tarpit (le
   diffuseur). ==== */
const MGMT_RETRAITS_REPLIQUES=`;
fs.writeFileSync(OUT,entete+JSON.stringify(out,null,1)+';\n/* ==== [FIN ANCRE] ==== */\n');
console.log(JSON.stringify(Object.fromEntries(Object.entries(out).map(([k,v])=>[k,v.texte.slice(0,50)]))));
