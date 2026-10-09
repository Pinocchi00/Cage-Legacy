"use strict";
/* Outil temporaire : insère les répliques de tools/_voix-neuves.js à la fin de chaque voix du document des voix. */
const fs=require('fs');
const N=require('./_voix-neuves.js');
const chemin=__dirname+'/../docs/LES-VOIX-DES-COMBATTANTS-v2.md';
let doc=fs.readFileSync(chemin,'utf8');
const crlf=doc.includes('\r\n'); doc=doc.replace(/\r\n/g,'\n');
const lignes=doc.split('\n');
let total=0;
/* de la dernière voix à la première, pour que les numéros de ligne restent valables */
for(const i of Object.keys(N).map(Number).sort((a,b)=>b-a)){
  const titre='## 3.'+(i+1)+' ';
  const debut=lignes.findIndex(l=>l.startsWith(titre));
  if(debut<0) throw new Error('voix absente '+i);
  let fin=debut+1;
  while(fin<lignes.length&&lignes[fin]!=='---'&&!lignes[fin].startsWith('## ')&&!lignes[fin].startsWith('# ')) fin++;
  /* recule sur les lignes vides avant le séparateur */
  let pos=fin; while(pos>debut&&lignes[pos-1]==='') pos--;
  const bloc=[];
  for(const [sit,texte] of N[i]){
    const t=texte.replace(/^\(([^)]*)\)/,'*($1)*');
    bloc.push('', '> **'+sit+'** — '+t);
    total++;
  }
  lignes.splice(pos,0,...bloc);
}
doc=lignes.join('\n');
fs.writeFileSync(chemin,crlf?doc.replace(/\n/g,'\r\n'):doc);
console.log('insérées',total);
