"use strict";
/* Lot 5 (document des voix §4 et §8) : les voix qui changent. Le changement se
   déduit de l'historique, une fois par carrière, jamais d'un tirage de partie ;
   rien ne se stocke. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
function result(win,code){ return JSON.parse(win.eval(`JSON.stringify((function(){${code}})())`)); }
const NEUVE=`setSeed(9); const m=mgmtDefault(); mgmtNewRoster(m); mgmtExteriorEnsure(m); mgmtNewPile(m); G={theme:'dark',mgmt:m,screen:'mgmt_bureau'};
  m.facts=[]; m.hist=[]; m.cycle=10;
  const libres=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o)); const [X,Y]=libres;
  const voixDe=(f,v)=>{ const orig=mgmtVoixId; mgmtVoixId=g=>g.id===f.id?v:orig(g); };
  const perd=(c,p,g,family,round)=>m.hist.push({c,slot:'main',rounds:3,a:{id:g.id,W:g.W,L:g.L,D:0},b:{id:p.id,W:p.W,L:p.L,D:0},winner:'A',family,round});
  const vers=f=>{ const c=mgmtVoixChangement(m,f); return c?c.vers:null; };`;

test('Voix qui changent — le Timide devient la Commune au dixième combat, pas avant', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    voixDe(X,'le-timide'); X.W=6; X.L=3; X.D=0; const neuf=vers(X);
    X.W=7; const dix=vers(X); const actuelle=mgmtVoixActuelle(m,X);
    return {neuf,dix,actuelle,base:mgmtVoixId(X)};`);
  assert.equal(r.neuf,null); assert.equal(r.dix,'la-voix-commune'); assert.equal(r.actuelle,'la-voix-commune'); assert.equal(r.base,'le-timide','la voix du départ ne bouge pas');
});

test('Voix qui changent — le Metteur en scène, après un KO subi au premier round, devient Cœur ouvert ou Métronome', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    voixDe(X,'le-metteur-en-scene');
    const sans=vers(X);
    perd(8,X,Y,'ko',2); const tard=vers(X);
    m.hist=[]; perd(8,X,Y,'dec',3); const decision=vers(X);
    m.hist=[]; perd(8,X,Y,'ko',1); const lourd=vers(X);
    perd(9,X,Y,'ko',1); const deux=vers(X);
    return {sans,tard,decision,lourd,deux};`);
  assert.equal(r.sans,null); assert.equal(r.tard,null,'un KO au deuxième round ne suffit pas'); assert.equal(r.decision,null);
  assert.ok(['le-coeur-ouvert','le-metronome'].includes(r.lourd)); assert.equal(r.deux,r.lourd,'une seule fois par carrière : un second KO ne change rien');
});

test('Voix qui changent — un KO très lourd hante une minorité : même combattant, même réponse, quoi qu’il arrive à la partie', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const hante=m.roster.find(o=>mgmtIdentiteStream(o.id,'voix-change')()<MGMT_VOIX_HANTE_PART&&mgmtVoixId(o)!=='le-metteur-en-scene');
    const epargne=m.roster.find(o=>o!==hante&&mgmtIdentiteStream(o.id,'voix-change')()>=MGMT_VOIX_HANTE_PART&&mgmtVoixId(o)!=='le-metteur-en-scene');
    const adv=m.roster.find(o=>o!==hante&&o!==epargne);
    perd(8,hante,adv,'ko',1); perd(8,epargne,adv,'ko',1);
    const seed=SEED; const cles=Object.keys(hante).sort().join();
    return {a:vers(hante),b:vers(hante),epargne:vers(epargne),rng:seed===SEED,champs:cles===Object.keys(hante).sort().join()&&!Object.keys(hante).some(k=>/voix/i.test(k)),
      sans:(()=>{ m.hist=[]; return vers(hante); })()};`);
  assert.equal(r.a,'le-hante'); assert.equal(r.b,'le-hante'); assert.equal(r.epargne,null); assert.ok(r.rng); assert.ok(r.champs,'rien n’est stocké'); assert.equal(r.sans,null,'sans le KO, pas de changement');
});

test('Voix qui changent — le Repenti qui rechute (trois défaites de suite) devient Aigri', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    voixDe(X,'le-repenti');
    perd(7,X,Y,'dec',3); perd(8,X,Y,'dec',3); const deux=vers(X);
    perd(9,X,Y,'dec',3); const trois=vers(X);
    m.hist.push({c:9,slot:'main',rounds:3,a:{id:X.id,W:X.W,L:X.L,D:0},b:{id:Y.id,W:Y.W,L:Y.L,D:0},winner:'A',family:'dec',round:3}); const victoire=vers(X);
    return {deux,trois,victoire};`);
  assert.equal(r.deux,null); assert.equal(r.trois,'laigri'); assert.equal(r.victoire,null,'une victoire interrompt la rechute');
});

test('Voix qui changent — la réplique vient de la nouvelle voix, la fiche le dit, une partie d’avant H4 ne change jamais', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    voixDe(X,'le-timide'); X.W=7; X.L=3; X.D=0;
    perd(9,X,Y,'dec',3);
    const rep=mgmtReplique(m,X,'defaite','décision');
    const permises=mgmtVoixRepliquesDe('la-voix-commune','defaite','décision').concat(mgmtVoixRepliquesDe('la-voix-commune','defaite')).map(x=>x.texte);
    const fiche=mgmtFicheParole(m,X);
    m.effectifs=0; const ancien=mgmtVoixChangement(m,X);
    return {rep,fiche,ancien,commune:!!rep};`);
  assert.ok(r.commune); assert.ok(r.fiche.includes('Il ne parle plus comme avant.')); assert.equal(r.ancien,null);
});
