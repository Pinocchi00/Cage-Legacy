"use strict";
/* Brief des corrections du 08/10/2026, lot 6 : le geste de finition suit la fréquence du MMA réel, ajustée au style, sans toucher au taux de finition.
   (Poids à valider par Anthony : tools/reports/LOT-6-GESTES-DE-FINITION.md.) */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {newGameWindow}=require('./helpers/loadGame');

function tirages(win,type,style,n){
  return JSON.parse(win.eval(`JSON.stringify((function(){ setSeed(11); const c={}; const w={style:${JSON.stringify(style)}};
    for(let i=0;i<${n};i++){ const m=pickFinishPondere(w,${JSON.stringify(type)},null); c[m.name]=(c[m.name]||0)+1; } return c; })())`));
}
const part=(c,k,n)=>(c[k]||0)/n;

test('6 — L’étranglement arrière arrive en tête des soumissions, l’anaconda reste rare', () => {
  const win=newGameWindow(); const n=6000, c=tirages(win,'sub','mma',n);
  const tete=Object.entries(c).sort((a,b)=>b[1]-a[1])[0][0];
  assert.equal(tete,'Rear Naked Choke');
  assert.ok(part(c,'Rear Naked Choke',n)>0.28&&part(c,'Rear Naked Choke',n)<0.40,'environ un tiers, comme dans l’UFC (32,7 %)');
  assert.ok(part(c,'Anaconda',n)<0.08,'l’anaconda est rare');
  assert.ok(part(c,'Guillotine',n)>0.10&&part(c,'Guillotine',n)<0.20);
});

test('6 — Les crochets et les directs font l’essentiel des KO ; les gestes sautés et retournés restent possibles, mais restent des événements', () => {
  const win=newGameWindow(); const n=8000, c=tirages(win,'ko','mma',n);
  assert.equal(Object.entries(c).sort((a,b)=>b[1]-a[1])[0][0],'Crochet');
  assert.ok(part(c,'Crochet',n)+part(c,'Direct puissant',n)>0.40,'les poings d’abord');
  for(const rare of ['Coup de pied retourné','Coup de genou sauté','Superman punch','Coup de coude retourné','Jab chanceux']){
    assert.ok(part(c,rare,n)<0.025,rare+' reste rare ('+(100*part(c,rare,n)).toFixed(2)+' %)');
    assert.ok((c[rare]||0)>0,rare+' reste possible');
  }
  assert.ok(part(c,'Marteau au sol',n)>0.08,'les frappes au sol comptent');
});

test('6 — Le style du vainqueur ajuste le geste : le muay-thaï genoute plus, le boxeur frappe des mains, le jiu-jitsu cherche la clé', () => {
  const win=newGameWindow(); const n=6000;
  const muay=tirages(win,'ko','muayThai',n), boxe=tirages(win,'ko','boxer',n);
  assert.ok(part(muay,'Coup de genou au corps',n)>2*part(boxe,'Coup de genou au corps',n),'le muay-thaï donne plus de genoux');
  assert.ok(part(boxe,'Crochet',n)>part(muay,'Crochet',n),'le boxeur finit plus au crochet');
  const bjj=tirages(win,'sub','bjj',n), mma=tirages(win,'sub','mma',n);
  assert.ok(part(bjj,'Armbar',n)>part(mma,'Armbar',n));
});

test('6 — Le choix du geste consomme un seul rnd() comme avant : le taux et la suite des tirages ne bougent pas', () => {
  const win=newGameWindow();
  const r=JSON.parse(win.eval(`JSON.stringify((function(){ setSeed(5); const a=rnd(); setSeed(5); pickFinishPondere({style:'mma'},'ko','tête'); const b=rnd(); setSeed(5); rnd(); const c=rnd(); return [a,b,c]; })())`));
  assert.equal(r[1],r[2],'un tirage consommé, pas deux');
});

test('6 — Le rapport de mesure existe, avec ses sources et la mention « à valider »', () => {
  const t=fs.readFileSync(path.join(__dirname,'..','tools','reports','LOT-6-GESTES-DE-FINITION.md'),'utf8');
  assert.match(t,/à valider par Anthony/);
  assert.match(t,/agentmma\.com/);
  assert.match(t,/600 finitions/);
});
