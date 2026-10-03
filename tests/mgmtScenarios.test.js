"use strict";
/* Lot 5 H10, deuxième groupe (contrat §5 n° 5, 4, 10, 29). Même règle que le
   premier : tout se déduit de l'état, rien ne se stocke ; l'histoire impose la
   demande, le joueur répond par Promettre ou Refuser (H7). */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
function result(win,code){ return JSON.parse(win.eval(`JSON.stringify((function(){${code}})())`)); }
const NEUVE=`setSeed(9); const m=mgmtDefault(); mgmtNewRoster(m); mgmtExteriorEnsure(m); mgmtNewPile(m); G={theme:'dark',mgmt:m,screen:'mgmt_bureau'};
  m.facts=[]; m.hist=[]; m.cycle=10; m.roster.forEach(o=>{ o.age=27; });
  const libres=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o)); const [X,Y]=libres;
  const gagne=(c,g,p)=>m.hist.push({c,slot:'main',rounds:3,a:{id:g.id,W:g.W,L:g.L,D:0},b:{id:p.id,W:p.W,L:p.L,D:0},winner:'A',family:'dec',round:3});
  const perd=(c,p,g)=>gagne(c,g,p);
  /* n victoires (ou défaites) de suite de X, la dernière au cycle 9. */
  const serieDe=(x,y,n)=>{ for(let i=0;i<n;i++) gagne(i===n-1?9:8,x,y); };
  const perdDe=(x,y,n)=>{ serieDe(y,x,n); };
  const ks=()=>mgmtScenarios(m).filter(s=>s.a===X.id).map(s=>s.k);`;

test('H10 bis — le train de la hype : douze victoires de suite à Split : il demande à se tester contre un classé', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    X.W=20; X.L=3; serieDe(X,Y,12);
    const s=mgmtScenarios(m).find(x=>x.a===X.id&&x.k==='hype');
    const tete=mgmtDivisionRanking(m,X.div,'organization').slice(0,5).map(o=>o.id);
    const avant=JSON.stringify(m.facts); mgmtScenarios(m);
    m.hist=[]; serieDe(X,Y,11); const onze=ks().includes('hype');
    m.hist=[]; serieDe(X,Y,13); const treize=ks().includes('hype');
    return {s,tete,x:X.id,immuable:avant===JSON.stringify(m.facts),onze,treize};
  `);
  assert.ok(r.s,'le scénario existe'); assert.equal(r.s.want,'un-classe');
  assert.ok(r.tete.includes(r.s.target)&&r.s.target!==r.x,'la cible est un classé de la tête, pas lui-même');
  assert.ok(r.immuable,'rien n’est stocké'); assert.equal(r.onze,false,'onze ne suffisent pas'); assert.equal(r.treize,false,'au-delà, le train est déjà parti : une fois, pas à chaque combat');
});

test('H10 bis — la dernière danse : un vétéran de carrière, quatre défaites de suite, demande la carte principale', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    X.age=37; X.W=20; perdDe(X,Y,4);
    const vieux=ks();
    X.age=30; const jeune=ks();
    X.age=37; X.W=5; const novice=ks();
    X.W=20; m.hist=[]; perdDe(X,Y,3); const trois=ks();
    m.hist=[]; gagne(9,X,Y); const victoire=ks();
    return {vieux,jeune,novice,trois,victoire};
  `);
  assert.deepEqual(r.vieux,['derniere-danse']); assert.deepEqual(r.jeune,[]); assert.deepEqual(r.novice,[],'peu de victoires : pas un vétéran de carrière'); assert.deepEqual(r.trois,[]); assert.deepEqual(r.victoire,[]);
});

test('H10 bis — le deuil : un décès dans la famille ou un coach qui meurt ; il veut combattre pour lui', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const E=libres.find(o=>mgmtIdentiteStream(o.id,'deuil|10')()<MGMT_DEUIL_PART), N=libres.find(o=>mgmtIdentiteStream(o.id,'deuil|10')()>=MGMT_DEUIL_PART);
    const ksE=()=>mgmtScenarios(m).filter(s=>s.a===E.id).map(s=>s.k);
    m.facts.push({c:9,k:'moment_vie',a:E.id,m:'deces-parent'}); const parent=mgmtScenarios(m).find(s=>s.a===E.id);
    m.facts=[{c:9,k:'moment_vie',a:N.id,m:'deces-parent'}]; const sansVouloir=mgmtScenarios(m).filter(s=>s.a===N.id).length;
    m.facts=[{c:9,k:'moment_vie',a:E.id,m:'coach-meurt'}]; const coach=ksE();
    m.facts=[{c:4,k:'moment_vie',a:E.id,m:'deces-parent'}]; const ancien=ksE();
    m.facts=[{c:9,k:'moment_vie',a:E.id,m:'naissance-enfant'}]; const heureux=ksE();
    return {parent,sansVouloir,coach,ancien,heureux};
  `);
  assert.equal(r.parent.k,'deuil'); assert.equal(r.parent.want,'carte-principale'); assert.deepEqual(r.coach,['deuil']);
  assert.equal(r.sansVouloir,0,'la moitié seulement veut combattre'); assert.deepEqual(r.ancien,[],'le deuil passe'); assert.deepEqual(r.heureux,[]);
});

test('H10 bis — la descente aux enfers : deux défaites de suite et plus de 300 de charge demandent une pause', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    perdDe(X,Y,2);
    const sans=ks();
    m.facts.push({c:9,k:'contrarie',a:X.id,p:350,why:'titre'});
    const s=mgmtScenarios(m).find(x=>x.a===X.id&&x.k==='descente');
    m.hist=[]; gagne(8,X,Y); perd(9,X,Y); const unePerte=ks();
    return {sans,s,unePerte};
  `);
  assert.deepEqual(r.sans,[],'sans charge, une mauvaise série n’est pas une descente');
  assert.equal(r.s.want,'pause'); assert.deepEqual(r.unePerte,[]);
});

test('H10 bis — l’histoire impose la demande ; Promettre une pause se tient en ne le bookant pas, la rompre pèse', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    X.W=20; X.L=3; serieDe(X,Y,12);
    const fait=mgmtDemandesOuvreCycle(m);
    const ouverte=mgmtDemandesOuvertes(m).find(d=>d.a===X.id);
    /* une pause */
    m.facts=[{c:10,k:'demande',a:X.id,want:'pause'}];
    mgmtRepondreDemande(m,0,'promettre');
    const enCours=mgmtPromesses(m,X)[0].etat;
    m.cycle=14; const tenue=mgmtPromesses(m,X)[0].etat;
    m.cycle=12; gagne(12,X,Y); const rompue=mgmtPromesses(m,X)[0].etat;
    return {fait,ouverte:ouverte&&ouverte.want,enCours,tenue,rompue,libelle:MGMT_DEMANDES.pause.libelle};
  `);
  assert.equal(r.fait.want,'un-classe'); assert.equal(r.ouverte,'un-classe');
  assert.equal(r.enCours,'en cours'); assert.equal(r.tenue,'tenue','sans combat jusqu’à l’échéance, la pause est tenue');
  assert.equal(r.rompue,'rompue','un combat pendant la pause la rompt'); assert.equal(r.libelle,'Une pause');
});

test('H10 bis — la sauvegarde accepte une pause, la fiche nomme le scénario, une partie d’avant H4 n’en a aucun', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    X.W=20; X.L=3; serieDe(X,Y,12);
    const fiche=mgmtFicheRivaux(m,X);
    m.facts=[{c:10,k:'demande',a:X.id,want:'pause'}];
    mgmtRepondreDemande(m,0,'promettre');
    m.hist=[]; const base=validateMgmt(JSON.parse(JSON.stringify(m)));
    const copie=JSON.parse(JSON.stringify(m));
    const valide=base&&validateMgmt(copie);
    m.effectifs=0;
    return {fiche,ancien:mgmtScenarios(m).length,ancienFiche:mgmtFicheRivaux(m,X),facts:copie.facts.length,valide:!!valide};
  `);
  assert.ok(r.fiche.includes('Le train de la hype')); assert.equal(r.ancien,0); assert.equal(r.ancienFiche,'');
  assert.ok(r.valide,'une promesse de pause passe la validation de la sauvegarde');
});

test('H10 ter — le blues du champion : celui qui vient de gagner la ceinture demande une pause, une fois sur deux', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    m.cycle=10; mgmtInitTitles(m);
    const champ=(f,opp)=>{ m.hist.push({c:9,slot:'main',rounds:5,a:{id:f.id,W:f.W,L:f.L,D:0},b:{id:opp.id,W:opp.W,L:opp.L,D:0},winner:'A',family:'dec',round:5}); m.facts.push({c:9,k:'title_fight',div:f.div,fight:m.hist.length-1}); };
    const memeDiv=f=>m.roster.find(o=>o!==f&&o.div===f.div);
    const gate=(f)=>mgmtIdentiteStream(f.id,'blues|9')()<MGMT_BLUES_PART;
    const P=m.roster.find(o=>gate(o)&&memeDiv(o)), Q=m.roster.find(o=>!gate(o)&&memeDiv(o)&&o.div!==P.div);
    champ(P,memeDiv(P)); champ(Q,memeDiv(Q));
    const de=id=>mgmtScenarios(m).filter(s=>s.a===id).map(s=>s.k+':'+s.want);
    const p=de(P.id), q=de(Q.id);
    m.cycle=20; const tard=de(P.id);
    return {p,q,tard,libelle:mgmtScenariosDe(Object.assign({},m,{cycle:10}),P)};`);
  assert.deepEqual(r.p,['blues:pause']); assert.deepEqual(r.q,[],'l’autre champion veut défendre'); assert.deepEqual(r.tard,[],'le blues passe');
});

test('H10 ter — la fratrie : même nom, même pays, une part de ces paires est de la même famille ; les booker l’un contre l’autre pèse 30', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const A=m.roster[0]; const cle=(a,b)=>[a.id,b.id].sort().join('|');
    const B=m.roster.find(o=>o!==A&&mgmtIdentiteStream(cle(A,o),'fratrie')()<MGMT_FRATRIE_PART);
    const C=m.roster.find(o=>o!==A&&o!==B&&mgmtIdentiteStream(cle(A,o),'fratrie')()>=MGMT_FRATRIE_PART);
    B.last=A.last; B.ck=A.ck; C.last=A.last; C.ck=A.ck;
    const freres=mgmtFratrie(m,A);
    const autrePays=m.roster.find(o=>o!==A&&o!==B&&o!==C); autrePays.last=A.last; autrePays.ck=COUNTRY_KEYS.find(k=>k!==A.ck);
    const fiche=mgmtFicheRivaux(m,A);
    const jamais=[mgmtFratrie(m,{id:'zz',last:''}).length];
    const t={c:10,slot:'main',a:{id:A.id},b:{id:B.id},rounds:3};
    const n=mgmtContrariesApresSoiree(m,[t]);
    const contr=m.facts.filter(x=>x.k==='contrarie'&&x.why==='fratrie').map(x=>[x.a,x.p]);
    m.hist=[]; const sain=validateMgmt(JSON.parse(JSON.stringify(Object.assign({},m,{hist:[]}))));
    return {freres,b:B.id,c:C.id,fiche,n,contr,a:A.id,jamais,sain:!!sain};`);
  assert.deepEqual(r.freres,[r.b],'seule la paire tirée est de la famille'); assert.ok(r.fiche.includes('Sa famille chez Split'));
  assert.deepEqual(r.contr.sort(),[[r.a,30],[r.b,30]].sort(),'un contrarié de 30 pour chacun'); assert.ok(r.n>=2);
  assert.ok(r.sain,'le fait « contrarie » de la fratrie passe la validation');
});
