"use strict";
/* Demande d'Anthony (08/10/2026) : « dans la fiche des combattants les infos de chaque combat, force, faiblesses, remplir chaque case de ses anciens combats, et s'améliorer à chaque combat ». */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const jouer=require('./helpers/jouerSoirees');
const res=(w,code)=>JSON.parse(w.eval(`JSON.stringify((function(){ ${code} })())`));
const neuve=()=>{ const w=newGameWindow({runMain:true}); w.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(7); CL.mgmtEnter(1);`); return w; };

test('Anciens combats — une case par combat du bilan, résultats conformes au bilan, dérivés sans rien stocker ni toucher à la graine', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt; const f=m.roster.find(x=>x.W+x.L+x.D>=8); const avant=SEED;
    const a=mgmtAnciensCombats(m,f), b=mgmtAnciensCombats(m,f);
    const c={v:a.filter(x=>x.issue==='v').length,d:a.filter(x=>x.issue==='d').length,n:a.filter(x=>x.issue==='n').length};
    return {egal:JSON.stringify(a)===JSON.stringify(b),n:a.length,total:f.W+f.L+f.D,bilan:c.v===f.W&&c.d===f.L&&c.n===(f.D||0),graine:SEED===avant,stocke:Object.keys(f).some(k=>/ancien/i.test(k)),
      complet:a.every(x=>x.adv&&x.methode&&x.phrase&&(x.issue==='n'||x.tag)),tags:a.every(x=>x.issue==='v'?x.tag==='FORCE':(x.issue==='d'?x.tag==='FAILLE':x.tag===''))};`);
  assert.equal(r.egal,true); assert.equal(r.n,r.total,'une case par combat du bilan'); assert.equal(r.bilan,true,'autant de victoires, défaites et nuls que le bilan');
  assert.equal(r.graine,true); assert.equal(r.stocke,false); assert.equal(r.complet,true,'chaque case est remplie'); assert.equal(r.tags,true,'une force après une victoire, une faille après une défaite');
});

test('Fiche, onglet Combats — tous les combats sont listés, chacun avec sa force ou sa faille, plus de « pas vus »', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt; const f=m.roster.find(x=>x.W+x.L+x.D>=8); CL.mgmtFiche(f.id); CL.mgmtFicheOnglet('combats');
    const t=document.getElementById('app').textContent, lignes=document.querySelectorAll('.mf-fi-co:not(.autres)').length, tags=document.querySelectorAll('.mf-fi-co .mf-fi-tag').length;
    return {total:f.W+f.L+f.D,lignes,tags,nul:f.D||0,pasVus:/pas vus/.test(t),entete:t.includes((f.W+f.L+f.D)+' COMBATS')};`);
  assert.equal(r.lignes,r.total); assert.ok(r.tags>=r.total-r.nul,'chaque combat décidé porte sa marque'); assert.equal(r.pasVus,false); assert.equal(r.entete,true);
});

test('Onglet Style — les cases force et faille se remplissent de ses anciens combats quand rien n’a été vu', () => {
  const win=neuve();
  const r=res(win,`const m=G.mgmt; const f=m.roster.find(x=>x.W>=6&&x.L>=3); CL.mgmtFiche(f.id); CL.mgmtFicheOnglet('style');
    const t=document.getElementById('app').textContent; return {force:/FORCE/.test(t),faille:/FAILLE/.test(t),bilan:/D’après son bilan/.test(t)};`);
  assert.deepEqual(r,{force:true,faille:true,bilan:true});
});

test('S’améliorer à chaque combat — l’expérience vient des combats joués chez l’organisation, plus vite jeune, jamais après 35 ans, et un combat passé se rejoue à l’identique', () => {
  const win=neuve();
  jouer(win,3,{titre:true});
  const r=res(win,`const m=G.mgmt; const cb=m.hist.length;
    const jeune={id:'xp-jeune',age:22,W:0,L:0,D:0}, vieux={id:'xp-vieux',age:38};
    const f=m.roster.find(x=>m.hist.some(t=>t.a.id===x.id||t.b.id===x.id)&&x.age<=30);
    const xp=mgmtExperience(m,f,m.cycle+1), avant=mgmtExperience(m,f,0);
    const A=mgmtFightReady(f,m.cycle+1), B=mgmtFightReady(f,0);
    const somme=c=>Object.values(c.attrs).reduce((s,v)=>s+v,0);
    const t0=m.hist[0], cp=mgmtFightReady(f,t0.c), cp2=mgmtFightReady(f,t0.c);
    return {n:xp.n,points:xp.points,avant:avant.n,mieux:somme(A)>=somme(B),rejeu:JSON.stringify(cp)===JSON.stringify(cp2),agees:mgmtXpAge(36),jeunes:mgmtXpAge(22),plafond:xp.points<=MGMT_XP_PLAFOND};`);
  assert.ok(r.n>=1,'il a joué'); assert.ok(r.points>0); assert.equal(r.avant,0,'rien avant son premier combat'); assert.equal(r.mieux,true,'ses attributs montent');
  assert.equal(r.rejeu,true,'un combat passé se rejoue à l’identique'); assert.equal(r.agees,0); assert.equal(r.jeunes,1); assert.equal(r.plafond,true);
});
