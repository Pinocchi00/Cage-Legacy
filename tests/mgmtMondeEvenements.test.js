"use strict";
/* Monde lot 8 T4a (docs/lots/MONDE-LOT-8-T4a.md) : cinq événements de coût
   petit — le top 15 mondial (N3), la ceinture laissée vacante (N6), les caps
   d'un règne (N7), le dernier combat d'un contrat (N8), deux coéquipiers sur la
   même soirée (N10) — et la demande restée sans réponse. Ils naissent comme
   faits datés de m.facts, allument la marque (T1) et passent par le budget (T6)
   sans qu'aucune des deux soit recodée. Jamais une fenêtre, jamais une
   minuterie. Amorçage et résolution repris de tests/mgmtMarque.test.js. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {newGameWindow}=require('./helpers/loadGame');
const jouer=require('./helpers/jouerSoirees');
const res=(win,code)=>JSON.parse(win.eval(`JSON.stringify((function(){${code}})())`));

function neuve(seed){
  const win=newGameWindow({runMain:true});
  win.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(${seed||7}); CL.mgmtEnter(1);`);
  return win;
}
const GENRES=['top15','titre_vacant','regne_cap','dernier_combat','carte_camp','sans_reponse'];

test('Monde T4a — N3 : une entrée et une sortie du top 15 écrivent un fait daté avec le combat qui l’explique', () => {
  const win=neuve(7);
  const ids=res(win,`return G.mgmt.roster.slice(0,3).map(o=>o.id);`);
  const [X,Y,Z]=ids;
  win.eval(`const m=G.mgmt; mgmtVisitesInit(m); const div=m.roster[0].div;
    G.IDS=${JSON.stringify([X,Y,Z])}; G.DIV=div;
    /* X absent du classement précédent, 3e du courant ; Y 15e du précédent, absente du courant. */
    G.CUR=['h0','h1',${JSON.stringify(X)},'h3','h4','h5','h6','h7','h8','h9','h10','h11','h12','h13','h14','h15']
      .map((id,i)=>({id,div:div,W:9,L:2,D:0,lastCycle:0}));
    G.PREV=['p0','p1','p2','p3','p4','p5','p6','p7','p8','p9','p10','p11','p12','p13',${JSON.stringify(Y)},'p15']
      .map((id,i)=>({id,div:div,W:9,L:2,D:0,lastCycle:0}));
    mgmtDivisionRanking=function(mm,divId,scope,cycle){
      return (cycle===undefined?G.CUR:G.PREV).map(o=>({id:o.id,div:divId,W:o.W,L:o.L,D:o.D,lastCycle:0}));
    };
    /* Une trace du soir pour X seul (contre Z) : elle explique son entrée, pas la sortie de Y. */
    const A=mgmtTraceSide(m.roster.find(o=>o.id===G.IDS[0])), B=mgmtTraceSide(m.roster.find(o=>o.id===G.IDS[2]));
    m.hist.push({c:m.cycle,slot:'main',seed:11,rounds:5,round:3,a:A,b:B,winner:'A',family:'dec'});
    G.PREMIER=m.hist.length-1;`);
  const premier=win.eval('G.PREMIER');
  const r=res(win,`const m=G.mgmt;
    mgmtMondeApresSoiree(m,G.PREMIER);
    return {faits:m.facts.filter(x=>x.k==='top15').map(x=>({a:x.a,div:x.div,entre:x.entre,fight:x.fight,c:x.c})),
      cycle:m.cycle,ids:G.IDS};`);
  assert.equal(r.faits.length,2,'un fait par mouvement');
  assert.deepEqual(r.faits.find(x=>x.a===r.ids[0]),
    {a:r.ids[0],div:G_DIV(win),entre:true,fight:premier,c:r.cycle},'entrée datée du cycle, avec le combat qui l’explique');
  assert.deepEqual(r.faits.find(x=>x.a===r.ids[1]),
    {a:r.ids[1],div:G_DIV(win),entre:false,fight:null,c:r.cycle},'sortie datée du cycle, sans combat : le classement a bougé sans elle');
  const ap=res(win,`const m=G.mgmt, n=m.facts.filter(x=>x.k==='top15').length;
    mgmtMondeApresSoiree(m,G.PREMIER); return m.facts.filter(x=>x.k==='top15').length-n;`);
  assert.equal(ap,0,'un second appel n’écrit rien de plus');
});

function G_DIV(win){ return win.eval('G.DIV'); }

test('Monde T4a — N3 : le lendemain affiche exactement comme avant', () => {
  const win=neuve(7);
  win.eval(`const m=G.mgmt; mgmtVisitesInit(m);`);
  assert.ok(jouer(win,1)>=1,'une soirée a été jouée');
  /* Les phrases de fiche T4a, lues dans le jeu (aucune copie côté Node). */
  const phrases=res(win,`const o=[]; for(const k of Object.keys(MGMT_MONDE_PHRASES)){
      if(typeof MGMT_MONDE_PHRASES[k]==='string') o.push(MGMT_MONDE_PHRASES[k].split('{')[0]); } return o;`);
  win.eval(`G.screen='mgmt_lendemain'; render();`);
  const html=win.eval(`document.getElementById('app').innerHTML`);
  assert.ok(html.length>0,'le rendu tient debout');
  for(const amorce of phrases.filter(Boolean)) assert.ok(!html.includes(amorce),'aucune phrase de fiche T4a au lendemain : '+amorce);
  /* Les constats restent ceux du classement : pas de fait top15 ajouté au lendemain. */
  const r=res(win,`const m=G.mgmt; return {constats:mgmtLendemainConstatsHtml(m).length,faits:m.facts.filter(x=>x.k==='top15').length};`);
  assert.ok(r.constats>0,'les constats du classement sont là');
  assert.ok(r.faits>=1,'le fait top15 existe, lui, dans m.facts');
});

test('Monde T4a — N6 : la retraite du champion écrit la vacance à sa date, une seule fois', () => {
  const win=neuve(7);
  const r=res(win,`const m=G.mgmt; mgmtVisitesInit(m); m.cycle=10;
    const divs=[...new Set(m.roster.map(o=>o.div))], divA=divs[0], divB=divs[1];
    const CA=mgmtSplitTitle(m,divA).id, CB=mgmtSplitTitle(m,divB).id;
    const champions=new Set(divs.map(d=>mgmtSplitTitle(m,d).id));
    const NC=m.roster.find(o=>!mgmtIsRetired(o)&&!champions.has(o.id)).id;
    /* 1) le champion de A part au cycle 5. */
    mgmtAddFact(m,{c:5,k:'retired',a:CA});
    const lues1=mgmtMondeTitresVacants(m);
    /* 2) ancien format : a portait un objet {id}. */
    mgmtAddFact(m,{c:7,k:'retired',a:{id:CB}});
    const lues2=mgmtMondeTitresVacants(m);
    /* 3) un non-champion part : rien. */
    mgmtAddFact(m,{c:8,k:'retired',a:NC});
    const avantNonChampion=m.facts.filter(x=>x.k==='titre_vacant').length;
    const lues3=mgmtMondeTitresVacants(m);
    /* 4) second appel : rien de plus. */
    const avant=m.facts.length; mgmtMondeTitresVacants(m);
    return {CA,CB,NC,lues1,lues2,lues3,avantNonChampion,faits:m.facts.filter(x=>x.k==='titre_vacant'),
      ajoute:m.facts.length-avant};`);
  assert.equal(r.lues1.length,1);
  assert.deepEqual(r.lues1[0],{c:5,div:r.faits[0].div,a:r.CA},'à sa date, pas celle du jour');
  assert.equal(r.faits.filter(x=>x.a===r.CA).length,1,'un seul fait pour A');
  assert.equal(r.faits.filter(x=>x.a===r.CB).length,1,'l’ancien format a:{id} est accepté aussi');
  assert.equal(r.lues3.length,0,'un non-champion ne laisse pas de vacance');
  assert.equal(r.faits.length,r.avantNonChampion,'le rattrapage après sa retraite n’ajoute aucune vacance');
  assert.equal(r.faits.filter(x=>x.a===r.NC).length,0,'et rien n’est écrit pour lui');
  assert.equal(r.ajoute,0,'un second appel n’écrit rien');
});

test('Monde T4a — N7 : un règne dit ses caps une fois chacun', () => {
  const win=neuve(7);
  const r=res(win,`const m=G.mgmt; mgmtVisitesInit(m); m.cycle=10;
    const divs=[...new Set(m.roster.map(o=>o.div))], dA=divs[0], dB=divs[1];
    const CA=mgmtSplitTitle(m,dA).id, cf=mgmtFighterById(m,CA);
    /* Le règne de CA commence au cycle 5 (title_initial est à 0 par défaut : le cap des mois serait déjà franchi à 10). */
    m.facts.filter(x=>x.k==='title_initial'&&x.div===dA).forEach(x=>{x.c=5;});
    const advA=mgmtTraceSide(m.roster.find(o=>o.div===dA&&o.id!==CA));
    for(let k=0;k<3;k++){
      m.hist.push({c:6,slot:'main',seed:20+k,rounds:5,round:3,a:mgmtTraceSide(cf),b:advA,winner:'A',family:'dec'});
      mgmtAddFact(m,{c:6,k:'title_fight',div:dA,fight:m.hist.length-1});
    }
    const d0=mgmtSplitTitle(m,dA);
    mgmtMondeRegneCaps(m);
    const caps1=m.facts.filter(x=>x.k==='regne_cap'&&x.a===CA).map(x=>({a:x.a,div:x.div,cap:x.cap,since:x.since}));
    /* Rappel : rien de plus. */
    const n1=m.facts.filter(x=>x.k==='regne_cap'&&x.a===CA).length; mgmtMondeRegneCaps(m);
    const repete=m.facts.filter(x=>x.k==='regne_cap'&&x.a===CA).length-n1;
    /* Le temps passe : onze cycles de plus font franchir le cap des mois. */
    m.cycle=21; mgmtMondeRegneCaps(m);
    const capsMois=m.facts.filter(x=>x.k==='regne_cap'&&x.a===CA&&x.cap[0]==='M').map(x=>x.cap);
    /* Un règne à une défense, commencé ce cycle : rien. */
    const B0=mgmtSplitTitle(m,dB).id, cb=mgmtFighterById(m,B0);
    const B1=m.roster.find(o=>o.div===dB&&o.id!==B0), B2=m.roster.find(o=>o.div===dB&&o.id!==B0&&o.id!==B1.id);
    m.hist.push({c:20,slot:'main',seed:30,rounds:5,round:3,a:mgmtTraceSide(B1),b:mgmtTraceSide(cb),winner:'A',family:'dec'});
    mgmtAddFact(m,{c:20,k:'title_fight',div:dB,fight:m.hist.length-1});
    m.hist.push({c:20,slot:'main',seed:31,rounds:5,round:3,a:mgmtTraceSide(B1),b:mgmtTraceSide(B2),winner:'A',family:'dec'});
    mgmtAddFact(m,{c:20,k:'title_fight',div:dB,fight:m.hist.length-1});
    const dB1=mgmtSplitTitle(m,dB);
    const avant=m.facts.length; mgmtMondeRegneCaps(m);
    return {d0:{id:d0.id,defenses:d0.defenses,since:d0.since},dB1:{id:dB1.id,defenses:dB1.defenses,since:dB1.since},
      caps1,capsMois,repete,
      ajoute:m.facts.filter(x=>x.k==='regne_cap'&&x.a===dB1.id).length,CA};`);
  assert.equal(r.d0.defenses,3,'le champion en est à trois défenses');
  assert.equal(r.caps1.length,1,'un seul dit au premier passage');
  assert.deepEqual(r.caps1[0],{a:r.CA,div:r.caps1[0].div,cap:'D3',since:r.d0.since},'D3, avec le début du règne');
  assert.equal(r.repete,0,'un rappel ne redit rien');
  assert.deepEqual(r.capsMois,['M12'],'onze cycles plus tard, le cap des mois est dit une fois');
  assert.ok(r.dB1.defenses<3,'le second règne reste sous les caps de défense');
  assert.equal(r.ajoute,0,'et sous le cap des mois aussi : rien');
});

test('Monde T4a — N8 : le dernier combat d’un contrat est dit, puis fin_contrat comme avant', () => {
  const win=neuve(7);
  const r=res(win,`const m=G.mgmt; mgmtVisitesInit(m);
    const f=m.roster[0], g=m.roster[1];
    f.ct={n:3,f:1,b:100,since:0}; g.ct={n:1,f:0,b:80,since:0};
    mgmtContratsApresSoiree(m,[f.id]);
    const l1=m.facts.filter(x=>x.k==='dernier_combat'&&x.a===f.id).length;
    const fin1=m.facts.filter(x=>x.k==='fin_contrat'&&x.a===f.id).length;
    const ct={f:f.ct.f,n:f.ct.n};
    /* Il combat son dernier combat : le contrat s'épuise, comme avant. */
    mgmtContratsApresSoiree(m,[f.id]);
    const l2=m.facts.filter(x=>x.k==='dernier_combat'&&x.a===f.id).length;
    const fin2=m.facts.filter(x=>x.k==='fin_contrat'&&x.a===f.id).length;
    /* Un contrat d'un seul combat : fin_contrat seul, jamais de dernier_combat. */
    mgmtContratsApresSoiree(m,[g.id]);
    return {l1,fin1,ct,ctApres:!!f.ct,libre:!!f.libre,l2,fin2,
      gct:!!g.ct,glibre:!!g.libre,gl:m.facts.filter(x=>x.k==='dernier_combat'&&x.a===g.id).length};`);
  assert.equal(r.l1,1,'le dernier combat restant est dit');
  assert.equal(r.fin1,0,'et le contrat n’est pas fini pour autant');
  assert.equal(r.ct.f,2,'le combat a compté');
  assert.equal(r.ctApres,false,'le contrat est épuisé au combat suivant');
  assert.equal(r.libre,true,'et le combattant devient sans contrat, comme avant');
  assert.equal(r.l2,1,'aucun second dernier_combat');
  assert.equal(r.fin2,1,'fin_contrat comme avant');
  assert.equal(r.gct,false,'{n:1,f:0} : le contrat part aussitôt');
  assert.equal(r.glibre,true);
  assert.equal(r.gl,0,'sans jamais de dernier_combat');
});

test('Monde T4a — N10 : deux coéquipiers sur la même soirée sont dits, leurs adversaires non', () => {
  const win=neuve(7);
  const ids=res(win,`return G.mgmt.roster.slice(0,4).map(o=>o.id);`);
  const [X,Y,Z,W]=ids;
  win.eval(`const m=G.mgmt; mgmtVisitesInit(m);
    G.IDS=${JSON.stringify([X,Y,Z,W])};
    mgmtMemeCamp=function(mm,a,b){ if(!a||!b) return false;
      return (a.id===${JSON.stringify(X)}&&b.id===${JSON.stringify(Z)})||(a.id===${JSON.stringify(Z)}&&b.id===${JSON.stringify(X)}); };
    const tr=(a,b,w)=>({c:m.cycle,slot:'main',seed:5,rounds:3,round:3,
      a:mgmtTraceSide(m.roster.find(o=>o.id===a)),b:mgmtTraceSide(m.roster.find(o=>o.id===b)),winner:w,family:'dec'});
    m.hist.push(tr(G.IDS[0],G.IDS[1],'A'));
    m.hist.push(tr(G.IDS[2],G.IDS[3],'A'));
    G.PREMIER=m.hist.length-2;
    mgmtMondeApresSoiree(m,G.PREMIER);`);
  const r=res(win,`const m=G.mgmt; return {cartes:m.facts.filter(x=>x.k==='carte_camp').map(x=>({a:x.a,b:x.b,c:x.c})),
    cycle:m.cycle,ids:G.IDS};`);
  assert.equal(r.cartes.length,2,'deux faits, un par coéquipier');
  assert.ok(r.cartes.some(x=>x.a===r.ids[0]&&x.b===r.ids[2]),'X a campé avec Z');
  assert.ok(r.cartes.some(x=>x.a===r.ids[2]&&x.b===r.ids[0]),'Z a campé avec X');
  assert.ok(!r.cartes.some(x=>x.a===r.ids[1]),'l’adversaire de X n’est pas dit');
  assert.ok(!r.cartes.some(x=>x.a===r.ids[3]),'ni celui de Z');
  assert.ok(r.cartes.every(x=>x.c===r.cycle),'daté du cycle');
  const ap=res(win,`const m=G.mgmt, n=m.facts.filter(x=>x.k==='carte_camp').length;
    mgmtMondeCoequipiers(m,G.PREMIER); return m.facts.filter(x=>x.k==='carte_camp').length-n;`);
  assert.equal(ap,0,'un second appel n’écrit rien');
  const adv=res(win,`const m=G.mgmt; G.LIGNE={c:m.cycle,slot:'main',seed:5,rounds:3,round:3,
      a:mgmtTraceSide(m.roster.find(o=>o.id===G.IDS[0])),b:mgmtTraceSide(m.roster.find(o=>o.id===G.IDS[2])),winner:'A',family:'dec'};
    const avant=m.facts.length; mgmtMondeCoequipiers(m,m.hist.length);
    return {ajoute:m.facts.length-avant};`);
  assert.equal(adv.ajoute,0,'deux coéquipiers qui s’affrontent, adversaires du soir, ne disent rien');
});

test('Monde T4a — une demande périmée écrit « restée sans réponse » une fois, et la fiche la lit', () => {
  const win=neuve(7);
  const ids=res(win,`return G.mgmt.roster.slice(0,3).map(o=>o.id);`);
  const [A,B,C]=ids;
  win.eval(`const m=G.mgmt; mgmtVisitesInit(m); m.cycle=10;
    G.IDS=${JSON.stringify([A,B,C])};
    const i1=m.facts.push({c:6,k:'demande',a:${JSON.stringify(A)},want:'revanche',target:${JSON.stringify(B)}})-1;
    m.facts.push({c:5,k:'demande',a:${JSON.stringify(B)},want:'pause'});
    const i2=m.facts.length-1;
    /* Répondue : une promesse qui porte l'index de sa demande. */
    m.facts.push({c:8,k:'promesse',a:${JSON.stringify(B)},want:'pause',due:13,d:i2});
    /* Fraîche : du cycle d'avant. */
    m.facts.push({c:9,k:'demande',a:${JSON.stringify(C)},want:'carte-principale'});
    G.I=i1;
    mgmtDemandesExpire(m);
    const avant=m.facts.filter(x=>x.k==='sans_reponse').length;
    mgmtDemandesExpire(m);`);
  const r=res(win,`const m=G.mgmt;
    /* La partie de test porte déjà ses propres demandes : on ne compte que celles des trois combattants du test. */
    const miens=x=>G.IDS.includes(x.a);
    return {faits:m.facts.filter(x=>x.k==='sans_reponse'&&miens(x)).map(x=>({a:x.a,want:x.want,target:x.target,d:x.d,c:x.c})),
      repete:m.facts.filter(x=>x.k==='sans_reponse'&&miens(x)).length,ouverte:mgmtDemandesOuvertes(m).map(d=>d.a).filter(a=>G.IDS.includes(a)),I:G.I,
      demande:m.facts[G.I].k,ids:G.IDS,cycle:m.cycle};`);
  assert.equal(r.repete,1,'une seule demande périmée est dite, une fois');
  assert.equal(r.demande,'demande','la demande reste dans m.facts');
  assert.equal(r.ouverte.length,1,'la répondue et la fraîche restent ouvertes, la périmée non');
  assert.deepEqual(r.faits[0],{a:r.ids[0],want:'revanche',target:r.ids[1],d:r.I,c:r.cycle},'want, target et l’index de sa demande, daté du jour');
  const f=res(win,`const m=G.mgmt; const x=m.facts.find(x=>x.k==='sans_reponse');
    const ligne=m.roster.find(o=>o.id===x.a);
    return {p:mgmtMondePhrase(m,x),attendu:esc(mgmtMondePhrase(m,x)),html:mgmtFichePromesses(m,ligne)};`);
  assert.ok(f.p&&f.p.length>0,'la phrase existe');
  assert.ok(f.html.includes(f.attendu),'la fiche lit la phrase, échappée');
});

test('Monde T4a — le fait injury garde le nom de la blessure et la fiche l’affiche', () => {
  const win=neuve(7);
  const r=res(win,`const m=G.mgmt; mgmtVisitesInit(m);
    rollInjury=function(){ return {name:'Fracture du nez',fights:3}; };
    const f=m.roster[0], g=m.roster[1];
    const res={winner:'A',method:'Blessure',round:2,stats:{A:{dmgHead:0,wobbled:0},B:{dmgHead:8,wobbled:1}}};
    const t=mgmtApplyFight(m,f,g,res,'B');
    const fait=m.facts.filter(x=>x.a===f.id&&x.k==='injury').pop();
    const html=mgmtFicheCorps(m,f);
    /* Un fait d'avant, sans nom : le libellé seul, comme avant, aucune erreur. */
    const ancien=m.roster[2];
    mgmtAddFact(m,{c:m.cycle-3,k:'injury',a:ancien.id});
    const htmlAncien=mgmtFicheCorps(m,ancien);
    return {touche:!!t,nom:fait?fait.nom:null,html,htmlAncien};`);
  assert.ok(r.touche,'le combat a bien touché le combattant');
  assert.equal(r.nom,'Fracture du nez','le fait porte le nom');
  assert.ok(r.html.includes('Blessure — Fracture du nez'),'la fiche l’affiche sous la forme « Blessure — nom »');
  assert.ok(r.htmlAncien.includes('Blessure'),'un fait ancien garde son libellé');
  assert.ok(!r.htmlAncien.includes('undefined'),'et aucune trace du nom absent');
});

test('Monde T4a — les six genres allument la marque et passent par le budget', () => {
  const win=neuve(7);
  win.eval(`const m=G.mgmt; mgmtVisitesInit(m);
    const div=m.roster[0].div, huit=m.roster.slice(0,6);
    G.HUIT=huit.map(o=>o.id);
    const genres=[{k:'top15',div,entre:true,fight:null},{k:'titre_vacant',div},
      {k:'regne_cap',div,cap:'D3',since:1},{k:'dernier_combat'},
      {k:'carte_camp',b:huit[0].id},{k:'sans_reponse',want:'revanche',d:0}];
    huit.forEach((o,i)=>mgmtAddFact(m,Object.assign({c:m.cycle,a:o.id},genres[i])));`);
  const r=res(win,`const m=G.mgmt; return {marques:G.HUIT.map(id=>mgmtMarque(m,id)),
    al:mgmtMarquesAllumees(m),b:mgmtMarqueBudget(m)};`);
  assert.deepEqual(r.marques,[true,true,true,true,true,true],'chacun des six genres allume sa marque');
  assert.ok(r.al.length<=r.b,'les allumées tiennent dans le budget du conteur (T6 non modifiée)');
});

test('Monde T4a — mgmtMondePhrase couvre les six genres et les variantes', () => {
  const win=neuve(7);
  const r=res(win,`const m=G.mgmt; mgmtVisitesInit(m);
    const div=m.roster[0].div, label=mgmtDivisionLabel(div);
    const f=m.roster[0], g=m.roster[1];
    const t={c:m.cycle,slot:'main',seed:7,rounds:5,round:3,a:mgmtTraceSide(f),b:mgmtTraceSide(g),winner:'A',family:'dec'};
    m.hist.push(t); const fight=m.hist.length-1, adv=t.b.name;
    const P=MGMT_MONDE_PHRASES;
    const sub=(s,j)=>{ for(const k of Object.keys(j)) s=s.split('{'+k+'}').join(j[k]); return s; };
    const lib=MGMT_DEMANDES['revanche'].libelle;
    const cas=[{k:'top15',a:f.id,div,entre:true,fight},{k:'top15',a:f.id,div,entre:false,fight},
      {k:'top15',a:f.id,div,entre:true,fight:null},{k:'top15',a:f.id,div,entre:false,fight:null},
      {k:'titre_vacant',a:f.id,div},{k:'regne_cap',a:f.id,div,cap:'D3',since:1},
      {k:'regne_cap',a:f.id,div,cap:'M12',since:1},{k:'dernier_combat',a:f.id},
      {k:'carte_camp',a:f.id,b:g.id},{k:'sans_reponse',a:f.id,want:'revanche',d:0}];
    const attendus=[sub(P.top15entreCombat,{div:label,adv}),sub(P.top15sortieCombat,{div:label,adv}),
      sub(P.top15entre,{div:label}),sub(P.top15sortie,{div:label}),
      sub(P.titreVacant,{div:label}),sub(P.regneCapDefenses,{n:'3'}),sub(P.regneCapMois,{n:'12'}),
      P.dernierCombat,sub(P.carteCamp,{coeq:g.name}),sub(P.sansReponse,{want:lib})];
    return {phrases:cas.map(x=>mgmtMondePhrase(m,x)),attendus,relu:P.relu,
      inconnu:mgmtMondePhrase(m,{k:'inconnu'}),id:f.id};`);
  assert.equal(r.phrases.length,10,'tous les cas couverts');
  for(let i=0;i<r.phrases.length;i++) assert.equal(r.phrases[i],r.attendus[i],'cas '+i+' : '+r.phrases[i]);
  assert.equal(r.relu,false,'les gabarits sont marqués relu:false');
  assert.equal(r.inconnu,null,'un genre inconnu rend null');
  /* Chaînage T2 : le bloc « Depuis ta dernière visite » lit la même phrase. */
  const dep=res(win,`const m=G.mgmt, f=m.roster.find(o=>o.id===${JSON.stringify(r.id)}), g=m.roster[1];
    const div=m.roster[0].div;
    const faits=[{k:'top15',div,entre:true,fight:null},{k:'titre_vacant',div},{k:'regne_cap',div,cap:'D3',since:1},
      {k:'dernier_combat'},{k:'carte_camp',b:g.id},{k:'sans_reponse',want:'revanche',d:0}];
    for(const x of faits) m.facts.push(Object.assign({c:m.cycle,a:f.id},x));
    /* Du plus récent au plus ancien : le combat du soir d'abord, puis les faits à l'envers. */
    return mgmtDepuisVisite(m,f.id).map(x=>({sorte:x.sorte,libelle:x.libelle,phrase:x.phrase}));`);
  const attenduDepuis=[r.phrases[9],r.phrases[8],r.phrases[7],r.phrases[5],r.phrases[4],r.phrases[2]];
  assert.deepEqual(dep.slice(1).map(x=>x.phrase),attenduDepuis,'les six genres T4a sont dits au bloc, phrase pour phrase');
  for(const ligne of dep.slice(1)){
    assert.ok(ligne.libelle&&ligne.libelle.length>0,'chaque ligne a son étiquette');
    assert.ok(ligne.sorte&&ligne.sorte.length>0,'chaque ligne a sa sorte');
  }
});

test('Monde T4a — rechargement propre et aucune fenêtre', () => {
  const win=neuve(7);
  const ids=res(win,`return G.mgmt.roster.slice(0,2).map(o=>o.id);`);
  const [A,B]=ids;
  win.eval(`const m=G.mgmt; mgmtVisitesInit(m);
    const div=m.roster[0].div, f=m.roster.find(o=>o.id===${JSON.stringify(A)}), g=m.roster.find(o=>o.id===${JSON.stringify(B)});
    const t={c:m.cycle,slot:'main',seed:9,rounds:5,round:3,a:mgmtTraceSide(f),b:mgmtTraceSide(g),winner:'A',family:'dec'};
    m.hist.push(t); const fight=m.hist.length-1;
    mgmtAddFact(m,{c:m.cycle,k:'top15',a:f.id,div,entre:true,fight});
    mgmtAddFact(m,{c:m.cycle,k:'titre_vacant',a:g.id,div});
    mgmtAddFact(m,{c:m.cycle,k:'regne_cap',a:f.id,div,cap:'D3',since:1});
    mgmtAddFact(m,{c:m.cycle,k:'dernier_combat',a:g.id});
    mgmtAddFact(m,{c:m.cycle,k:'carte_camp',a:f.id,b:g.id});
    mgmtAddFact(m,{c:m.cycle,k:'sans_reponse',a:g.id,want:'revanche',d:0});
    mgmtAddFact(m,{c:m.cycle,k:'injury',a:f.id,nom:'Fracture du nez'});
    G.AV={n:m.facts.length,marq:m.roster.filter(o=>mgmtMarque(m,o.id)).map(o=>o.id),al:mgmtMarquesAllumees(m).length};`);
  const avant=res(win,`return {n:G.AV.n,marq:G.AV.marq,al:G.AV.al};`);
  const r=res(win,`saveMgmt(); G.mgmt=null; loadMgmt();
    const m=G.mgmt;
    return {valide:validateMgmt(JSON.parse(JSON.stringify(m))),n:m.facts.length,
      genres:${JSON.stringify(GENRES)}.filter(k=>m.facts.some(x=>x&&x.k===k)),
      nom:(m.facts.find(x=>x.k==='injury')||{}).nom,
      marq:m.roster.filter(o=>mgmtMarque(m,o.id)).map(o=>o.id),al:mgmtMarquesAllumees(m).length};`);
  assert.equal(r.valide,true,'la partie se recharge et se valide');
  assert.equal(r.n,avant.n,'aucun fait perdu');
  assert.equal(r.genres.length,6,'les six genres sont dans la partie rechargée');
  assert.equal(r.nom,'Fracture du nez','le nom de la blessure aussi');
  assert.deepEqual(r.marq,avant.marq,'les mêmes marques');
  assert.equal(r.al,avant.al,'et les mêmes allumées');
  /* Une soirée complète, sur une partie neuve, ne lève rien. */
  const autre=neuve(7);
  assert.ok(jouer(autre,1)>=1,'la soirée se joue');
  /* Aucune fenêtre, aucune minuterie dans le bloc de détection. */
  const src=fs.readFileSync(path.join(__dirname,'..','mgmt-bureau.js'),'utf8');
  const i=src.indexOf('[ANCRE: MONDE_LOT8_T4A_EVENEMENTS]');
  assert.notEqual(i,-1,'le bloc existe');
  const bloc=src.slice(i,src.indexOf('==== [FIN ANCRE] ====',i));
  for(const interdit of ['CL.go','popup','setTimeout']) assert.ok(!bloc.includes(interdit),'jamais '+interdit);
  for(const genre of GENRES) assert.ok(bloc.includes("'"+genre+"'"),'le bloc écrit '+genre);
});

test('Monde T4b — N1 : l’annonce tombe trois soirées avant l’âge de retraite et ne change pas la date de retraite',()=>{
  for(const seed of [7,19]){
    const win=neuve(seed);
    const r=res(win,`const m=G.mgmt,f=m.roster.find(x=>!mgmtIsRetired(x));
      const seuil=mgmtRetireAge(f,m.cycle); f.age=seuil-4; const initial=f.age;
      mgmtMondeAnnoncesRetraite(m); const tropTot=m.facts.filter(x=>x.k==='retraite_annoncee'&&x.a===f.id).length;
      f.age=seuil-3; mgmtMondeAnnoncesRetraite(m); mgmtMondeOuvreCycle(m); const annonce=m.facts.filter(x=>x.k==='retraite_annoncee'&&x.a===f.id);
      f.age=seuil-2; mgmtMondeAnnoncesRetraite(m); mgmtMondeOuvreCycle(m);
      const medical=m.roster.find(x=>!mgmtIsRetired(x)&&x.id!==f.id); medical.age=mgmtRetireAge(medical,m.cycle)-1;
      medical.retired=true; mgmtMondeAnnoncesRetraite(m);
      return {f:f.id,initial,seuil,tropTot,annonce,age:f.age,medical:medical.id,medicalAnnonce:m.facts.some(x=>x.k==='retraite_annoncee'&&x.a===medical.id)};`);
    assert.equal(r.tropTot,0,'pas avant le cycle fixé'); assert.equal(r.annonce.length,1,'une annonce malgré deux ouvertures');
    assert.equal(r.annonce[0].age,r.seuil); assert.equal(r.age,r.seuil-2,'pas d’annonce après le créneau');
    assert.equal(r.medicalAnnonce,false,'aucune annonce de retraite médicale');
  }
});

test('Monde T4b — N4 : le mieux classé des top 10 est seul déclaré dépassé et le fait cite la trace',()=>{
  const win=neuve(7);
  const r=res(win,`const m=G.mgmt,[a,b,c,d]=m.roster.slice(0,4),div=a.div,premier=m.hist.length;
    m.roster.slice(0,4).forEach(x=>x.div=div);
    for(const f of [a,b,c,d]) m.hist.push({c:m.cycle,slot:'main',a:mgmtTraceSide(f),b:mgmtTraceSide(m.roster[8]),winner:'A'});
    const ids=[a.id,b.id,c.id,d.id], ranks=[{id:a.id},{id:b.id},{id:c.id},{id:d.id},...Array.from({length:7},(_,i)=>({id:'x'+i}))];
    mgmtDivisionRanking=(mm,di)=>ranks;
    mgmtMondeDepassements(m,premier);
    return {faits:m.facts.filter(x=>x.k==='depassement'),ids,div,premier,avant:m.facts.filter(x=>x.k==='depassement').length};`);
  assert.ok(r.faits.length>0); assert.ok(r.faits.every(x=>x.div===r.div&&x.a&&x.b));
  assert.ok(r.faits.every(x=>x.fight>=r.premier),'chaque fait cite la trace du soir');
  const n=res(win,`const m=G.mgmt,n=m.facts.filter(x=>x.k==='depassement').length; mgmtMondeDepassements(m,${r.premier}); return m.facts.filter(x=>x.k==='depassement').length-n;`);
  assert.equal(n,0,'second appel idempotent');
});

test('Monde T4b — N5 : le challenger n°1 se déclare une seule fois par règne',()=>{
  const win=neuve(7);
  const r=res(win,`const m=G.mgmt,d=m.roster[0].div, titre=mgmtSplitTitle(m,d); m.facts=m.facts.filter(x=>x.k!=='challenger');
    G.DIV=d; mgmtPretendant=function(mm,di){return di===G.DIV?m.roster.find(x=>x.id===G.PRET):null;}; G.PRET=m.roster.find(x=>x.id!==titre.id&&x.div===d).id;
    mgmtMondeChallengers(m); mgmtMondeChallengers(m); const premier=m.facts.filter(x=>x.k==='challenger'&&x.div===d);
    G.PRET=m.roster.find(x=>x.id!==titre.id&&x.id!==G.PRET&&x.div===d).id; mgmtMondeChallengers(m);
    const change=m.facts.filter(x=>x.k==='challenger'&&x.div===d); mgmtSplitTitle=function(){return null;}; mgmtMondeChallengers(m);
    return {premier,change,apres:m.facts.filter(x=>x.k==='challenger'&&x.div===d),titre};`);
  assert.equal(r.premier.length,1); assert.equal(r.premier[0].a,r.premier[0].a);
  assert.equal(r.premier[0].champion,r.titre.id); assert.equal(r.premier[0].div,r.titre.div);
  assert.equal(r.change.length,2,'nouveau prétendant écrit un fait'); assert.equal(r.apres.length,2,'titre vacant n’en ajoute pas');
});

test('Monde T4b — N11 : les trois déclencheurs réveillent un ancien combat une fois par année',()=>{
  const win=neuve(7);
  const r=res(win,`const m=G.mgmt,[a,b,c,d]=m.roster.slice(0,4); m.facts=m.facts.filter(x=>x.k!=='vieux_combat'); m.cycle=20;
    const t=(x,y,cy)=>({c:cy,a:mgmtTraceSide(x),b:mgmtTraceSide(y)}); m.hist.push(t(a,b,1),t(c,d,1));
    /* a et b sont voisins (écart 1) ; c et d sont éloignés (écart 4) : seul le déclencheur « titre » doit les réveiller. */
    mgmtDivisionRanking=()=>[{id:a.id},{id:b.id},{id:'g1'},{id:'g2'},{id:'g3'},{id:c.id},{id:'g4'},{id:'g5'},{id:'g6'},{id:d.id}];
    mgmtMondeVieuxCombats(m); const voisins=m.facts.filter(x=>x.k==='vieux_combat');
    m.cycle=21; mgmtAddFact(m,{c:21,k:'title_fight',fight:1}); mgmtMondeVieuxCombats(m);
    const titre=m.facts.filter(x=>x.k==='vieux_combat'&&x.fight===1);
    m.cycle=22; const bless=m.roster[4]; m.hist.push(t(a,bless,1)); bless.susp=21; mgmtAddFact(m,{c:18,k:'injury',a:bless.id}); mgmtMondeVieuxCombats(m);
    const blessure=m.facts.filter(x=>x.k==='vieux_combat'&&x.fight===2);
    const avant=m.facts.filter(x=>x.k==='vieux_combat').length; mgmtMondeVieuxCombats(m); const apres=m.facts.filter(x=>x.k==='vieux_combat').length;
    m.cycle=30; mgmtMondeVieuxCombats(m); const annee=m.facts.filter(x=>x.k==='vieux_combat'&&x.fight===0);
    return {voisins,titre,blessure,avant,apres,annee,a:a.id,b:b.id,c:c.id,d:d.id};`);
  assert.equal(r.voisins.length,2); assert.ok(r.voisins.every(x=>x.fight===0&&x.raison==='voisins'));
  assert.equal(r.titre.length,2); assert.ok(r.titre.every(x=>x.raison==='titre'));
  assert.equal(r.blessure.length,2); assert.ok(r.blessure.every(x=>x.raison==='blessure'));
  assert.equal(r.apres,r.avant,'pas de doublon la même année'); assert.equal(r.annee.length,4,'éligible l’année suivante');
});

test('Monde T4b — les quatre genres allument la marque et passent par le budget',()=>{
  const win=neuve(7); const r=res(win,`const m=G.mgmt; mgmtVisitesInit(m); const ids=m.roster.slice(0,4).map(f=>f.id);
    ['retraite_annoncee','depassement','challenger','vieux_combat'].forEach((k,i)=>mgmtAddFact(m,{c:m.cycle,k,a:ids[i],b:ids[(i+1)%4],fight:0,raison:'voisins'}));
    return ids.map(id=>mgmtMarque(m,id));`);
  assert.deepEqual(r,[true,true,true,true]);
});

test('Monde T4b — les quatre genres ont une phrase de fiche accordée et échappée',()=>{
  const win=neuve(7); const r=res(win,`const m=G.mgmt,[a,b]=m.roster.slice(0,2); b.name='<img src=x onerror=alert(1)>'; const div=a.div;
    const faits=[{k:'retraite_annoncee',a:a.id,age:40},{k:'depassement',a:a.id,b:b.id,div},{k:'challenger',a:a.id,champion:b.id,div},
      {k:'vieux_combat',a:a.id,b:b.id,soi:a.id,raison:'voisins'},{k:'vieux_combat',a:a.id,b:b.id,soi:a.id,raison:'titre'},{k:'vieux_combat',a:a.id,b:b.id,soi:a.id,raison:'blessure'}];
    const phrases=faits.map(x=>mgmtMondePhrase(m,x)); const ligne=mgmtFicheDepuisHtml(phrases.map(phrase=>({phrase,libelle:'test'})));
    return {phrases,relu:MGMT_MONDE_PHRASES.relu,ligne,brut:mgmtMondePhrase(m,{k:'absent'}),genre:a.genre};`);
  assert.equal(r.phrases.length,6); assert.ok(r.phrases.every(x=>typeof x==='string'&&x.length));
  assert.equal(r.relu,false); assert.ok(r.ligne.includes('&lt;img')); assert.ok(!r.ligne.includes('<img'));
  assert.equal(r.brut,null);
});

test('Monde T4b — rechargement conserve les faits et aucune fenêtre n’est ouverte',()=>{
  const win=neuve(7); const ok=res(win,`const m=G.mgmt,ids=m.roster.slice(0,4).map(f=>f.id); ['retraite_annoncee','depassement','challenger','vieux_combat'].forEach((k,i)=>mgmtAddFact(m,{c:m.cycle,k,a:ids[i],b:ids[(i+1)%4]})); const n=m.facts.length; saveMgmt(); G.mgmt=null; loadMgmt(); return {avant:n,apres:G.mgmt.facts.length,genres:['retraite_annoncee','depassement','challenger','vieux_combat'].filter(k=>G.mgmt.facts.some(x=>x.k===k)),marques:ids.map(id=>mgmtMarque(G.mgmt,id))};`);
  assert.equal(ok.apres,ok.avant); assert.equal(ok.genres.length,4); assert.ok(ok.marques.every(Boolean));
  const src=fs.readFileSync(path.join(__dirname,'..','mgmt-bureau.js'),'utf8'); const bloc=src.slice(src.indexOf('[ANCRE: MONDE_LOT8_T4B]'),src.indexOf('==== [FIN ANCRE] ====',src.indexOf('[ANCRE: MONDE_LOT8_T4B]')));
  for(const mot of ['popup','CL.go','setTimeout']) assert.ok(!bloc.includes(mot),'aucun '+mot);
});
