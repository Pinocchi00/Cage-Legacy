"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
function result(win,code){return JSON.parse(win.eval(`JSON.stringify((()=>{${code}})())`));}
test('Monde lot 38 T1 — faits mesurés par profil et propos déterministes',()=>{
 const w=newGameWindow();
 const r=result(w,`setSeed(20261008);CL.mgmtEnter(1);const m=G.mgmt;return {manque:mgmtManque(m),a:mgmtEspoirsProposer(m),b:mgmtEspoirsProposer(m)};`);
 assert.ok(r.manque&&r.manque.titre&&r.manque.lignes.length<=3&&r.manque.leila);
 assert.deepEqual(r.a,r.b);assert.ok(r.a.length<=6);assert.equal(new Set(r.a.map(x=>x.id)).size,r.a.length);
 for(const x of r.a){assert.ok(x.angle&&x.etiquette&&x.fiche.bilan&&x.fiche.chiffres.length===2&&x.fiche.phrase);}
});
test('Monde lot 38 T1 — proposition fixée, suivi et plafond de trois',()=>{
 const w=newGameWindow();
 const r=result(w,`setSeed(9);CL.mgmtEnter(1);const m=G.mgmt,rows=mgmtEspoirsFixer(m),ids=m.espoirsPropose.slice();const a=ids.slice(0,3).map(id=>mgmtEspoirGarder(m,id));return {ids,again:mgmtEspoirsFixer(m).map(x=>x.id),a,n:mgmtEspoirs(m).length,s:mgmtEstEspoir(m,ids[0]),bad:mgmtEspoirGarder(m,'inconnu')};`);
 assert.ok(r.ids.length<=6);assert.deepEqual(r.again,r.ids);assert.equal(r.a.filter(Boolean).length,3);assert.equal(r.n,3);assert.ok(r.s);assert.equal(r.bad,false);
});
test('Monde lot 38 T1 — profils identifiés, trois faits au plus et libellés par id',()=>{
 const w=newGameWindow();
 const r=result(w,`setSeed(20261008);CL.mgmtEnter(1);const m=G.mgmt;return MGMT_ORGANISATIONS.map(o=>{m.org=o.id;const x=mgmtManque(m);return {id:x&&x.id,titre:x&&x.titre,n:x&&x.lignes.length,leila:x&&x.leila};});`);
 assert.equal(r.length,8);for(const x of r){assert.ok(x.id&&x.titre&&x.leila);assert.ok(x.n<=3);}
});
test('Monde lot 38 T1 — les lignes mesurées ne contiennent pas de valeurs manquantes',()=>{
 const w=newGameWindow();const rows=result(w,`setSeed(20261008);CL.mgmtEnter(1);return mgmtManque(G.mgmt).lignes;`);
 assert.ok(rows.every(x=>![x.libelle,x.valeur,x.sous||''].some(v=>/undefined|NaN|\[object/i.test(String(v)))));
});
test('Monde lot 38 T1 — des candidats distincts et sans champion de Split',()=>{
 const w=newGameWindow();const r=result(w,`setSeed(20261008);CL.mgmtEnter(1);const m=G.mgmt,x=mgmtEspoirsProposer(m);return {x,champs:[...mgmtChampionIds(m)]};`);
 assert.equal(new Set(r.x.map(x=>x.id)).size,r.x.length);assert.ok(r.x.every(x=>!r.champs.includes(x.id)));
});
test('Monde lot 38 T1 — garder un quatrième espoir est refusé et rendre ne désuit pas',()=>{
 const w=newGameWindow();const r=result(w,`setSeed(27);CL.mgmtEnter(1);const m=G.mgmt,ids=mgmtEspoirsFixer(m).map(x=>x.id);ids.slice(0,3).forEach(id=>mgmtEspoirGarder(m,id));const fourth=ids[3],kept=mgmtEspoirGarder(m,fourth);const id=ids[0];mgmtEspoirRendre(m,id);return {kept,followed:mgmtSuivis(m).includes(id),n:mgmtEspoirs(m).length};`);
 assert.equal(r.kept,false);assert.equal(r.followed,true);assert.equal(r.n,2);
});
test('Monde lot 38 T1 — les clés facultatives ne sont pas ajoutées aux sauvegardes anciennes',()=>{
 const w=newGameWindow();const r=result(w,`setSeed(20261008);CL.mgmtEnter(1);const m=G.mgmt;delete m.espoirs;delete m.espoirsPropose;const before=JSON.stringify(m);mgmtMigrate(m);return {before,after:JSON.stringify(m),has:Object.hasOwn(m,'espoirs')||Object.hasOwn(m,'espoirsPropose')};`);
 assert.equal(r.after,r.before);assert.equal(r.has,false);
});
test('Monde lot 38 T1 — la source espoir est inscrite au registre',()=>{
 const w=newGameWindow();const r=result(w,`return MGMT_ACTU_SOURCES.some(x=>x.type==='espoir');`);assert.equal(r,true);
});
test('Monde lot 38 T1 — validation et réparation des clés espoirs facultatives',()=>{
 const w=newGameWindow();const r=result(w,`setSeed(20261008);CL.mgmtEnter(1);const m=G.mgmt;const valid=validateMgmt(m);m.espoirsPropose=['ok','ok'];const invalid=validateMgmt(m);mgmtRepair(m);return {valid,invalid,removed:Object.hasOwn(m,'espoirsPropose')};`);
 assert.equal(r.valid,true);assert.equal(r.invalid,false);assert.equal(r.removed,false);
});
test('Monde lot 38 T1 — remplacer un espoir ajoute un nom nouveau',()=>{
 const w=newGameWindow();const r=result(w,`setSeed(101);CL.mgmtEnter(1);const m=G.mgmt;mgmtEspoirsFixer(m);const ids=m.espoirsPropose.slice(),n=mgmtEspoirRemplacer(m,ids[0]);return {n,ids,now:m.espoirsPropose};`);
 assert.ok(r.n);assert.ok(!r.ids.includes(r.n.id));assert.ok(r.now.includes(r.n.id));assert.ok(r.now.length<=12);
});
test('Arrivée — le vrai champion conserve son nom et son rang, et le top15 est comparé à une autre organisation',()=>{
 const w=newGameWindow();
 try{
  const r=result(w,`setSeed(20261008);CL.mgmtEnter(1);const m=G.mgmt,base=m.roster.filter(f=>f.div==='H-heavy');
    const modele=base[0],autre=base[1]||base[0];m.roster=Array.from({length:17},(_,i)=>({...modele,id:'preuve'+i,name:i===16?autre.name:modele.name}));
    m.hist=[];m.facts=[{k:'title_initial',div:'H-heavy',a:m.roster[16].id,c:m.cycle}];MGMT_MANQUE_MEMO.delete(m);
    const original=mgmtDivisionRanking;mgmtDivisionRanking=(partie,div,scope,cycle)=>partie===m&&div==='H-heavy'?m.roster.slice():original(partie,div,scope,cycle);
    const avant=JSON.stringify(m),seed=SEED,manque=mgmtManque(m);return {lignes:manque.lignes,nom:m.roster[16].name,pur:avant===JSON.stringify(m)&&seed===SEED};`);
  assert.equal(r.lignes[0].libelle,'Le champion, '+r.nom);assert.equal(r.lignes[0].valeur,'17e MONDIAL');
  assert.equal(r.lignes[1].valeur,'15 DU TOP 15');assert.notEqual(r.lignes[2].libelle,'Chez Split');assert.equal(r.lignes[2].valeur,'0 DU TOP 15');assert.equal(r.pur,true);
 }finally{w.close();}
});

test('Espoirs — un bilan22-14 sans relevé conserve son bilan et deux mesures utiles, pas de faux compteur de combats',()=>{
 const w=newGameWindow();
 try{
  const r=result(w,`setSeed(9);CL.mgmtEnter(1);const m=G.mgmt,f=mgmtEspoirsCandidats(m).find(f=>m.roster.some(x=>x.id===f.id));
    f.W=22;f.L=14;f.D=0;m.hist=[];for(const o of Object.values(m.orgs||{}))o.hist=[];mgmtStatsInvalider(m);
    const avant=JSON.stringify(m),seed=SEED,x=mgmtEspoirsFabrique(m,[f.id])[0];return {x,pur:avant===JSON.stringify(m)&&seed===SEED};`);
  // Décision d’Anthony du28/10 : les deux cases portent des statistiques
  // intéressantes, le bilan reste près du nom ; pas de combats/victoires/défaites.
  assert.equal(r.x.fiche.bilan,'22-14');assert.equal(r.x.fiche.chiffres.length,2);
  assert.ok(r.x.fiche.chiffres.every(x=>!['Combats','Victoires','Défaites'].includes(x.libelle)&&!/^0(?:\D|$)/.test(x.valeur)));
  assert.match(r.x.fiche.phrase,/36 combats/);assert.equal(r.pur,true);
 }finally{w.close();}
});

test('Espoirs — finitions et premiers rounds viennent des vrais résultats, pas du bilan global',()=>{
 const w=newGameWindow();
 try{
  const r=result(w,`const f={id:'a',name:'A',div:'H-light',age:24,W:22,L:14,D:0};
    const t=(c,winner,family,round)=>({c,a:{id:'a'},b:{id:'b'},winner,family,round});
    const m={roster:[f],hist:[t(1,'A','ko',1),t(2,'A','dec',3),t(3,'B','sub',2)],facts:[]};
    const avant=JSON.stringify(m),seed=SEED,ids=_idCounter,chiffres=mgmtEspoirChiffres(m,f,'reponse',null);
    return {chiffres,pur:avant===JSON.stringify(m)&&seed===SEED&&ids===_idCounter};`);
  assert.deepEqual(r.chiffres.map(x=>[x.libelle,x.valeur]),[['Finitions connues','1 SUR 2'],['Au 1er round','1']]);
  assert.ok(r.chiffres.every(x=>x.aide.includes('3 combats connus')));assert.equal(r.pur,true);
 }finally{w.close();}
});

test('Espoirs — les issues du catalogue extérieur incluent les défaites et ne deviennent pas des finitions gagnées',()=>{
 const w=newGameWindow();
 try{
  const r=result(w,`const f={id:'a',name:'A',div:'H-light',age:24,W:22,L:14,D:0,trace:{fights:36,pro:{fin:{ko:10,sub:6,dec:20}}}},m={roster:[f],hist:[],facts:[]};
    return mgmtEspoirChiffres(m,f,'libre',null);`);
  assert.deepEqual(r.map(x=>[x.libelle,x.valeur]),[['Combats finis par KO','10 SUR 36'],['Par soumission','6 SUR 36']]);
  assert.ok(r.every(x=>x.aide.includes('victoires et défaites')));
 }finally{w.close();}
});

test('Espoirs — résumés distincts et série actuelle relue dans tous les historiques, sans confondre le nom et le dernier résultat',()=>{
 const w=newGameWindow();
 try{
  const r=result(w,`const f={id:'a',first:'Max',last:'W',age:24,W:22,L:14,D:0};
    const t=(c,winner)=>({c,a:{id:'a'},b:{id:'b'},winner,family:'dec',round:3});
    const m={hist:[t(1,'A'),t(2,'A'),t(3,'B')],orgs:{ailleurs:{hist:[t(4,'A')]}}};
    const avant=JSON.stringify(m),seed=SEED,externe=mgmtEspoirSerieCourante(m,f);delete m.orgs.ailleurs;
    const local=mgmtEspoirSerieCourante(m,f),s={sigParMin:3.42,serieMax:9};
    const phrases=['reponse','monte','jeune','oublie','revenant','libre'].map(angle=>mgmtEspoirResume(m,f,angle,s,f,36));
    m.orgs.ailleurs={hist:[t(4,'A')]};return {externe,local,phrases,pur:avant===JSON.stringify(m)&&seed===SEED};`);
  assert.deepEqual(r.externe,{issue:'win',n:1});assert.deepEqual(r.local,{issue:'loss',n:1});
  assert.equal(r.phrases[1],'1 défaite.');assert.equal(new Set(r.phrases).size,6);assert.ok(!r.phrases.some(p=>/9 victoires/.test(p)));assert.equal(r.pur,true);
 }finally{w.close();}
});

test('Monde lot 38 T1 — les fonctions rendent des données et non du HTML',()=>{
 const w=newGameWindow();const r=result(w,`setSeed(20261008);CL.mgmtEnter(1);const m=G.mgmt;const x=mgmtEspoirsProposer(m)[0];return {manque:mgmtManque(m),x};`);
 assert.equal(typeof r.x.id,'string');assert.ok(!JSON.stringify(r).includes('<img'));
});
