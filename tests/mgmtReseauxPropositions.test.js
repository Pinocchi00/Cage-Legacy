"use strict";
/* Lot 5 : les réseaux et les propositions. Les répliques sont celles du
   document des voix (relu:false) ; le code choisit, remplit, n'invente rien. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
function result(win,code){ return JSON.parse(win.eval(`JSON.stringify((function(){${code}})())`)); }
const NEUVE=`setSeed(9); const m=mgmtDefault(); mgmtNewRoster(m); mgmtExteriorEnsure(m); mgmtNewPile(m); G={theme:'dark',mgmt:m,screen:'mgmt_bureau'};
  m.facts=[]; m.hist=[]; m.cycle=10; m.pile.forEach(x=>{x.status='closed';x.decision='ignored';}); m.open=null; m.card.main=[]; m.card.prelims=[];
  const libres=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o)); const [X,Y]=libres;`;

test('Réseaux — ceux qui sont à l’affiche publient, de leur voix ; une ligne dont un emplacement manque ne sort jamais', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    m.card.main=[{a:X.id,b:Y.id,cycle:m.cycle,slot:'main'}];
    const vus=[]; for(let c=1;c<=40;c++){ m.cycle=c; m.card.main[0].cycle=c; mgmtParolesDeLaSemaine(m).filter(p=>p.reseaux).forEach(p=>vus.push(p)); }
    const un=mgmtParolesDeLaSemaine(m);
    return {n:vus.length,accolades:vus.some(p=>/[{}]/.test(p.texte)),noms:vus.every(p=>[X.id,Y.id].includes(p.id)),ligne:vus[0]&&mgmtParoleLigne(vus[0]),nom:vus[0]&&vus[0].name,max:un.length};`);
  assert.ok(r.n>=10,'les réseaux parlent régulièrement'); assert.ok(!r.accolades); assert.ok(r.noms,'seulement les combattants de l’affiche');
  assert.ok(r.ligne.includes('(réseaux)')&&!r.ligne.includes('«'),'une publication, pas une citation'); assert.ok(r.max<=2);
});

test('Réseaux — une carte vide ne fait parler personne ; une partie d’avant H4 non plus', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const vide=mgmtParolesDeLaSemaine(m).length;
    m.card.main=[{a:X.id,b:Y.id,cycle:m.cycle,slot:'main'}]; m.effectifs=0;
    return {vide,ancien:mgmtParolesDeLaSemaine(m).length};`);
  assert.equal(r.vide,0); assert.equal(r.ancien,0);
});

test('Proposition — l’adversaire se range selon son style ; un inconnu (moins de trois combats) est un inconnu', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const lutteur=m.roster.find(o=>STYLES[mgmtIdentiteStyle(o)].grap>=0.5&&o.W+o.L+o.D>=3);
    const frappeur=m.roster.find(o=>STYLES[mgmtIdentiteStyle(o)].grap<0.5&&o.W+o.L+o.D>=3);
    const neuf={id:'mg999',W:1,L:0,D:0};
    return {l:mgmtVarianteAdversaire(lutteur),f:mgmtVarianteAdversaire(frappeur),i:mgmtVarianteAdversaire(neuf)};`);
  assert.equal(r.l,'lutteur'); assert.equal(r.f,'frappeur'); assert.equal(r.i,'inconnu');
});

test('Proposition — booker un combat fait répondre les deux, de leur voix ; le rejeu dit la même chose, rien n’est stocké', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const seed=SEED; const cles=Object.keys(m).sort().join();
    m.card.main=[{a:X.id,b:Y.id,cycle:m.cycle,slot:'main'}];
    const a=mgmtReponsesProposition(m,X.id,Y.id), b=mgmtReponsesProposition(m,X.id,Y.id);
    m.effectifs=0; const ancien=mgmtReponsesProposition(m,X.id,Y.id).length;
    return {n:a.length,stable:JSON.stringify(a)===JSON.stringify(b),accolades:a.some(l=>/[{}]/.test(l.texte)),ids:a.map(l=>l.id),x:X.id,y:Y.id,rng:seed===SEED,cles:cles===Object.keys(m).sort().join(),ancien};`);
  assert.ok(r.n>=1&&r.n<=2); assert.ok(r.stable); assert.ok(!r.accolades); assert.ok(r.rng); assert.ok(r.cles); assert.equal(r.ancien,0);
  assert.ok(r.ids.every(i=>[r.x,r.y].includes(i)));
});

test('Proposition — au deuxième clic de la carte, la réponse s’affiche ; elle disparaît au cycle suivant', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    document.getElementById('app').classList.add('mgmt'); G.screen='mgmt_carte'; render();
    const dispo=m.roster.filter(o=>o.div===X.div&&mgmtAvailable(m,o)&&!mgmtEngaged(m,o));
    const [A,B]=dispo;
    CL.mgmtPick(A.id); CL.mgmtPick(B.id);
    const html=document.getElementById('app').innerHTML;
    const booke=m.card.main.length===1;
    const dit=html.includes('mgmt-proposition');
    m.cycle++; render(); const apres=document.getElementById('app').innerHTML.includes('mgmt-proposition');
    return {booke,dit,apres};`);
  assert.ok(r.booke); assert.ok(r.dit,'la réponse est lue sur l’écran de la carte'); assert.equal(r.apres,false,'elle ne dure pas');
});
