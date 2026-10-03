"use strict";
/* Lot 5 H5 (contrat §7, catalogue §6.2) : les moments de vie. Aucun texte
   n'est écrit : les libellés sont ceux de MGMT_MOMENTS. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
function result(win,code){ return JSON.parse(win.eval(`JSON.stringify((function(){${code}})())`)); }
const NOUVELLE=`setSeed(9); const m=mgmtDefault(); mgmtNewRoster(m); mgmtExteriorEnsure(m); G={theme:'dark',mgmt:m};`;

test('H5 — le tirage est déterministe, sans RNG de partie, et ne dépend que de (id, cycle)', () => {
  const win=newGameWindow();
  const r=result(win,`${NOUVELLE}
    const f=m.roster[0]; const seed=SEED;
    const a=[],b=[]; for(let c=0;c<300;c++){ a.push((mgmtVieMomentAt(f,c)||{}).id||null); }
    for(let c=0;c<300;c++){ b.push((mgmtVieMomentAt({id:f.id,div:f.div},c)||{}).id||null); }
    return {memes:JSON.stringify(a)===JSON.stringify(b),seed:seed===SEED,vecus:a.filter(Boolean).length};
  `);
  assert.ok(r.memes,'même combattant, mêmes cycles, mêmes moments'); assert.ok(r.seed,'SEED intacte');
  assert.ok(r.vecus>0);
});

test('H5 — fréquence : 1 à 2 moments par combattant et par an', () => {
  const win=newGameWindow();
  const r=result(win,`${NOUVELLE}
    let moments=0,combattants=0; const cycles=104;
    for(const f of m.roster.slice(0,60)){ combattants++; for(let c=0;c<cycles;c++) if(mgmtVieMomentAt(f,c)) moments++; }
    return {parAn:moments/combattants/(cycles/(MGMT_EXT_YEAR_WEEKS/MGMT_EVENT_WEEKS))};
  `);
  assert.ok(r.parAn>1&&r.parAn<2,`${r.parAn.toFixed(2)} moments par an`);
});

test('H5 — éligibilité : jamais un moment contextuel, la grossesse selon la catégorie', () => {
  const win=newGameWindow();
  const r=result(win,`${NOUVELLE}
    const h=m.roster.find(o=>divById(o.div).gender==='H'), f=m.roster.find(o=>divById(o.div).gender==='F');
    const ids=x=>mgmtVieEligibles(x).map(y=>y.id);
    const vus=new Set(); for(const o of m.roster) for(let c=0;c<200;c++){ const mo=mgmtVieMomentAt(o,c); if(mo) vus.add(mo.id); }
    return {ctx:[...vus].filter(id=>MGMT_VIE_CONTEXTUELS.has(id)),hPreg:ids(h).includes('grossesse-annoncee'),
      fPreg:ids(f).includes('grossesse-annoncee'),fCompagne:ids(f).includes('grossesse-compagne'),hCompagne:ids(h).includes('grossesse-compagne'),
      inconnus:[...MGMT_VIE_ABSENCE_IDS()].length};
    function MGMT_VIE_ABSENCE_IDS(){ return Object.keys(MGMT_VIE_ABSENCE).filter(id=>!MGMT_MOMENTS.some(x=>x.id===id)); }
  `);
  assert.deepEqual(r.ctx,[],'aucun moment contextuel tiré au hasard');
  assert.equal(r.hPreg,false); assert.equal(r.fPreg,true);
  assert.equal(r.fCompagne,false); assert.equal(r.hCompagne,true);
  assert.equal(r.inconnus,0,'toute absence pointe vers un moment du catalogue');
});

test('H5 — Split : le moment devient un fait gardé, la sauvegarde l’accepte, rien ne disparaît', () => {
  const win=newGameWindow();
  const r=result(win,`${NOUVELLE}
    const seed=SEED; let n=0;
    for(let i=0;i<30;i++){ m.cycle++; n+=mgmtVieOuvreCycle(m); }
    const faits=m.facts.filter(x=>x.k==='moment_vie');
    const copie=JSON.parse(JSON.stringify(m)); mgmtExteriorEnsure(copie);
    return {n,faits:faits.length,tous:faits.every(x=>mgmtVieMomentById(x.m)&&m.roster.some(o=>o.id===x.a)&&Number.isSafeInteger(x.c)),
      cles:[...new Set(faits.map(x=>Object.keys(x).sort().join(',')))],valide:validateMgmt(copie),rng:seed===SEED,
      relu:copie.facts.filter(x=>x.k==='moment_vie').length};
  `);
  assert.equal(r.faits,r.n,'un fait par moment vécu'); assert.ok(r.n>50,'trente cycles sur un grand vestiaire : des moments');
  assert.ok(r.tous); assert.deepEqual(r.cles,['a,c,k,m']);
  assert.ok(r.valide,'validateMgmt accepte les faits'); assert.ok(r.rng); assert.equal(r.relu,r.faits);
});

test('H5 — la charge est dérivée : somme des poids de l’année, jamais stockée, tronquée à la fenêtre', () => {
  const win=newGameWindow();
  const r=result(win,`${NOUVELLE}
    const f=m.roster[0]; m.cycle=40;
    const poids=id=>mgmtVieMomentById(id).poids;
    const ajoute=(c,id)=>m.facts.push({c,k:'moment_vie',a:f.id,m:id});
    ajoute(40,'deces-parent'); ajoute(39,'divorce'); ajoute(5,'deces-frere-soeur');
    const avant=JSON.stringify(m);
    const charge=mgmtVieCharge(m,f,40);
    return {charge,attendu:poids('deces-parent')+poids('divorce'),immuable:avant===JSON.stringify(m),
      cles:Object.keys(f).filter(k=>/charge|vie/i.test(k))};
  `);
  assert.equal(r.charge,r.attendu,'le moment d’il y a 35 cycles sort de l’année');
  assert.ok(r.immuable); assert.deepEqual(r.cles,[],'aucun champ de charge sur la ligne');
});

test('H5 — seuils 150 et 300 : risque de blessure, forme en baisse, moments heureux exclus du risque', () => {
  const win=newGameWindow();
  const r=result(win,`${NOUVELLE}
    const f=m.roster[0]; m.cycle=30;
    const ajoute=(id,n)=>{ for(let i=0;i<n;i++) m.facts.push({c:30-i,k:'moment_vie',a:f.id,m:id}); };
    const a={risque:mgmtVieRisqueBlessure(m,f,30),forme:mgmtVieFormeBaisse(m,f,30)};
    ajoute('mariage',4);
    const heureux={charge:mgmtVieCharge(m,f,30),risque:mgmtVieRisqueBlessure(m,f,30),forme:mgmtVieFormeBaisse(m,f,30)};
    m.facts=[]; ajoute('divorce',3);
    const charge={charge:mgmtVieCharge(m,f,30),risque:mgmtVieRisqueBlessure(m,f,30),forme:mgmtVieFormeBaisse(m,f,30)};
    ajoute('deces-parent',2);
    const bord={charge:mgmtVieCharge(m,f,30),risque:mgmtVieRisqueBlessure(m,f,30),forme:mgmtVieFormeBaisse(m,f,30)};
    return {a,heureux,charge,bord,seuil:MGMT_CHARGE_SEUIL,limite:MGMT_CHARGE_BORD};
  `);
  assert.deepEqual(r.a,{risque:0,forme:0},'sans moment : rien ne change');
  assert.ok(r.heureux.charge>r.seuil,'les moments heureux pèsent dans une vie');
  assert.deepEqual([r.heureux.risque,r.heureux.forme],[0,0],'… mais n’augmentent pas le risque de blessure');
  assert.ok(r.charge.charge>r.seuil&&r.charge.charge<=r.limite);
  assert.ok(r.charge.risque>0&&r.charge.forme<0,'chargé : risque en hausse, forme en baisse');
  assert.ok(r.bord.charge>r.limite);
  assert.ok(r.bord.risque>r.charge.risque&&r.bord.forme<r.charge.forme,'au bord : encore plus');
});

test('H5 — absence : le moment rend indisponible, jamais un combattant déjà booké', () => {
  const win=newGameWindow();
  const r=result(win,`${NOUVELLE}
    m.cycle=12;
    const [a,b]=m.roster.filter(o=>o.div===m.roster[0].div).slice(0,2);
    m.card.main=[{a:a.id,b:b.id,cycle:12,slot:'main'}];
    const vrai=mgmtVieMomentAt; let n=0;
    /* forcer le moment « naissance » (1 cycle) pour a (booké) et pour c (libre) */
    const c=m.roster.find(o=>o.id!==a.id&&o.id!==b.id);
    globalThis.mgmtVieMomentAt=function(f,cy){ return (f.id===a.id||f.id===c.id)?mgmtVieMomentById('naissance-enfant'):null; };
    mgmtVieOuvreCycle(m);
    globalThis.mgmtVieMomentAt=vrai;
    return {bookeDispo:mgmtAvailable(m,a),libreDispo:mgmtAvailable(m,c),susp:c.susp,cycle:m.cycle};
  `);
  assert.equal(r.bookeDispo,true,'le combattant déjà booké reste disponible'); assert.equal(r.libreDispo,false);
  assert.equal(r.susp,r.cycle,'un cycle d’absence : jusqu’au cycle courant');
});

test('H5 — monde extérieur : les moments se dérivent, aucune ligne ne porte rien de plus', () => {
  const win=newGameWindow();
  const r=result(win,`${NOUVELLE}
    m.cycle=30; const ligne=m.exterieur[0]; const f={id:ligne.id,div:ligne.div};
    const clesAvant=Object.keys(ligne).sort().join(',');
    const un=mgmtVieDe(m,f).map(x=>x.c+':'+x.moment.id), deux=mgmtVieDe(m,f).map(x=>x.c+':'+x.moment.id);
    return {memes:JSON.stringify(un)===JSON.stringify(deux),cles:Object.keys(ligne).sort().join(','),clesAvant,
      facts:m.facts.filter(x=>x.k==='moment_vie').length,ordre:mgmtVieDe(m,f).every((x,i,t)=>i===0||t[i-1].c>=x.c)};
  `);
  assert.ok(r.memes); assert.equal(r.cles,r.clesAvant,'la ligne extérieure reste identité seule');
  assert.equal(r.facts,0,'aucun fait stocké pour l’extérieur'); assert.ok(r.ordre,'du plus récent au plus ancien');
});

test('H5 — « Sa vie » : moments relayés seulement, libellés du catalogue échappés, « On ne sait pas encore » sinon', () => {
  const win=newGameWindow();
  const r=result(win,`${NOUVELLE}
    const f=m.roster[0]; m.cycle=12; MGMT_FICHE={id:f.id,retour:'mgmt_bureau',cursor:0};
    const vide=mgmtFicheVie(m,f);
    m.facts.push({c:11,k:'moment_vie',a:f.id,m:'enfant-malade'});     /* relais vide : privé */
    const prive=mgmtFicheVie(m,f);
    m.facts.push({c:10,k:'moment_vie',a:f.id,m:'mariage'});           /* relayé : Réseaux · Micro Tendu */
    m.facts.push({c:12,k:'moment_vie',a:f.id,m:'deces-grand-parent'});/* relayé : lui-même */
    const lu=mgmtFicheVie(m,f);
    G.screen='mgmt_fiche'; const page=scr_mgmt_fiche();
    return {vide,prive,lu,page:page.includes('Sa vie'),chiffres:/charge|jauge/i.test(lu),
      ordre:lu.indexOf(mgmtVieMomentById('deces-grand-parent').libelle)<lu.indexOf(mgmtVieMomentById('mariage').libelle),
      libelleBrut:mgmtVieMomentById('mariage').libelle};
  `);
  assert.match(r.vide,/On ne sait pas encore/); assert.match(r.prive,/On ne sait pas encore/,'un moment privé n’apparaît pas');
  assert.ok(r.lu.includes(r.libelleBrut),'libellé tel quel'); assert.ok(r.ordre,'du plus récent au plus ancien');
  assert.ok(r.page,'le bloc est dans la fiche'); assert.equal(r.chiffres,false,'ni charge ni jauge à l’écran');
});

test('H5 — à charge faible, le combat est strictement identique (forme et blessure)', () => {
  const win=newGameWindow();
  const r=result(win,`${NOUVELLE}
    const f=m.roster[0]; m.cycle=20;
    const sans=JSON.stringify(mgmtFightReady(f,20));
    m.facts.push({c:20,k:'moment_vie',a:f.id,m:'adopte-chien'});
    const petit=JSON.stringify(mgmtFightReady(f,20));
    for(let i=0;i<4;i++) m.facts.push({c:20-i,k:'moment_vie',a:f.id,m:'divorce'});
    const charge=mgmtFightReady(f,20), apres=mgmtFightReady(f,60);
    return {meme:sans===petit,dyn:charge.dynamic,sansDyn:JSON.parse(sans).dynamic,oublie:JSON.stringify(apres)===sans};
  `);
  assert.ok(r.meme,'un moment léger ne change rien');
  assert.ok(r.dyn<r.sansDyn,'chargé : la forme baisse');
  assert.ok(r.oublie,'l’année suivante, la charge est sortie de la fenêtre');
});
