"use strict";
/* Lot 5 H6 (contrat §3.2 à §3.4) : l'attention du joueur — rôle en un mot,
   cercle et suivis, connaissance progressive, conteur, Continuer. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
function result(win,code){ return JSON.parse(win.eval(`JSON.stringify((function(){${code}})())`)); }
const NEUVE=`setSeed(9); const m=mgmtDefault(); mgmtNewRoster(m); mgmtExteriorEnsure(m); mgmtNewPile(m); G={theme:'dark',mgmt:m};`;

test('H6 — le cercle tient 5, les suivis 15, un membre du cercle n’est plus un simple suivi', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const ids=m.roster.map(o=>o.id);
    const poses=ids.slice(0,6).map(id=>mgmtCercleToggle(m,id));
    const s=ids.slice(10,27).map(id=>mgmtSuiviToggle(m,id));
    const refus=mgmtSuiviToggle(m,ids[0]);
    const lien=[mgmtLien(m,ids[0]),mgmtLien(m,ids[10]),mgmtLien(m,ids[40])];
    mgmtSuiviToggle(m,ids[10]); const retire=mgmtLien(m,ids[10]);
    mgmtSuiviToggle(m,ids[30]); mgmtCercleToggle(m,ids[4]); mgmtCercleToggle(m,ids[30]);
    return {poses,s,refus,lien,retire,suivi30:mgmtSuivis(m).includes(ids[30]),cercle:mgmtCercle(m).length,valide:validateMgmt(m)};
  `);
  assert.deepEqual(r.poses,[true,true,true,true,true,false],'le sixième du cercle est refusé');
  assert.equal(r.s.filter(Boolean).length,15,'quinze suivis au plus'); assert.equal(r.s[15],false);
  assert.equal(r.refus,false,'un membre du cercle ne devient pas suivi');
  assert.deepEqual(r.lien,['cercle','suivi',null]); assert.equal(r.retire,null,'le suivi se retire');
  assert.equal(r.suivi30,false,'entrer au cercle retire le suivi'); assert.equal(r.valide,true);
});

test('H6 — le cercle et les suivis se gardent et la porte de sauvegarde refuse les valeurs fausses', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    mgmtCercleToggle(m,m.roster[0].id); mgmtSuiviToggle(m,m.roster[1].id);
    const copie=JSON.parse(JSON.stringify(m)); const ok=validateMgmt(copie);
    const dbl=JSON.parse(JSON.stringify(m)); dbl.suivis=[m.roster[1].id,m.roster[1].id];
    const trop=JSON.parse(JSON.stringify(m)); trop.cercle=m.roster.slice(0,6).map(o=>o.id);
    const faux=JSON.parse(JSON.stringify(m)); faux.suivis=['<img>'];
    const mele=JSON.parse(JSON.stringify(m)); mele.suivis=[m.roster[0].id];
    const ancien=JSON.parse(JSON.stringify(m)); delete ancien.cercle; delete ancien.suivis;
    return {ok,dbl:validateMgmt(dbl),trop:validateMgmt(trop),faux:validateMgmt(faux),mele:validateMgmt(mele),ancien:validateMgmt(ancien),
      defaut:[mgmtDefault().cercle.length,mgmtDefault().suivis.length]};
  `);
  assert.equal(r.ok,true); assert.equal(r.dbl,false); assert.equal(r.trop,false);
  assert.equal(r.faux,false); assert.equal(r.mele,false);
  assert.equal(r.ancien,true,'une ancienne sauvegarde sans cercle reste valide'); assert.deepEqual(r.defaut,[0,0]);
});

test('H6 — le rôle en un mot : critères du catalogue, rien d’inventé, nul quand aucun ne s’applique', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const f=m.roster[0]; const mk=o=>Object.assign({},f,o);
    const lib=x=>{ const r=mgmtRole(m,x); return r?r.libelle:null; };
    const espoir=lib(mk({age:22,W:3,L:1,D:0})), invaincu=lib(mk({age:27,W:8,L:0,D:0,div:f.div})), veteran=lib(mk({age:37,W:12,L:9,D:0}));
    const ids=new Set(MGMT_ROLES.map(x=>x.libelle));
    const tous=m.roster.map(o=>lib(o)).filter(Boolean);
    return {espoir,invaincu,veteran,connus:tous.every(x=>ids.has(x)),nb:tous.length,total:m.roster.length};
  `);
  assert.equal(r.espoir,'Espoir'); assert.equal(r.invaincu,'Invaincu'); assert.equal(r.veteran,'Vétéran');
  assert.ok(r.connus,'tout rôle vient de MGMT_ROLES'); assert.ok(r.nb>0&&r.nb<=r.total);
});

test('H6 — le champion et la série de défaites se lisent dans le rôle', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const champ=mgmtSplitTitle(m,m.roster[0].div); const f=mgmtFighterById(m,champ.id);
    const rChamp=f?mgmtRole(m,f):null;
    const x=m.roster.find(o=>o.id!==(champ.id)&&o.age>=25&&o.W+o.L>=8);
    m.hist=[]; for(let i=0;i<3;i++) m.hist.push({a:{id:x.id},b:{id:'mg9999'},winner:'B',c:i});
    return {champion:rChamp&&rChamp.libelle,perdition:mgmtRole(m,x).libelle,res:mgmtResultats(m,x)};
  `);
  assert.equal(r.champion,'Champion'); assert.equal(r.perdition,'En perdition'); assert.deepEqual(r.res,['loss','loss','loss']);
});

test('H6 — connaissance progressive : rien, puis « Comment il combat », puis « Sa faille » ; jamais un pourcentage', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const f=m.roster[0]; const o=m.roster[1];
    const sans=mgmtConnaissance(m,f), pageSans=mgmtFicheConnaissance(m,f);
    m.hist=[{a:{id:f.id},b:{id:o.id},winner:'A',c:1}];
    const un=mgmtConnaissance(m,f), pageUn=mgmtFicheConnaissance(m,f);
    m.hist.push({a:{id:f.id},b:{id:o.id},winner:'B',c:2});
    const deux=mgmtConnaissance(m,f), pageDeux=mgmtFicheConnaissance(m,f);
    return {sans,un,deux,pageSans,pageUn,pageDeux,faille:mgmtSaFaille(f),style:mgmtCommentIlCombat(f).style};
  `);
  assert.deepEqual([r.sans.combat,r.sans.faille],[false,false]); assert.match(r.pageSans,/On ne sait pas encore[\s\S]*On ne sait pas encore/);
  assert.deepEqual([r.un.combat,r.un.faille],[true,false]); assert.ok(r.pageUn.includes(r.style));
  assert.match(r.pageUn,/Sa faille<\/h3><p>On ne sait pas encore/);
  assert.deepEqual([r.deux.combat,r.deux.faille],[true,true]); assert.ok(r.pageDeux.includes(r.faille)&&r.faille.length>0);
  assert.equal(/%|\/100/.test(r.pageDeux),false,'ni pourcentage ni note');
});

test('H6 — le conteur : le cercle d’abord, jamais deux infos sur le même combattant, dans le budget', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    m.cycle=10;
    const [a,b,c,d,e,f]=m.roster.slice(0,6);
    mgmtCercleToggle(m,e.id); mgmtSuiviToggle(m,d.id);
    const pose=(x,id)=>m.facts.push({c:10,k:'moment_vie',a:x.id,m:id});
    pose(a,'divorce'); pose(b,'mariage'); pose(c,'adopte-chien'); pose(d,'deces-parent'); pose(e,'video-virale'); pose(f,'enfant-malade');
    m.facts.push({c:10,k:'moment_vie',a:a.id,m:'mariage'});
    const cand=mgmtConteurCandidats(m,10), sel=mgmtConteur(m);
    return {ordre:cand.slice(0,2).map(x=>x.id===e.id?'cercle':(x.id===d.id?'suivi':'autre')),
      uniques:new Set(cand.map(x=>x.id)).size===cand.length,prive:cand.some(x=>x.id===f.id),
      n:sel.length,budget:mgmtConteurBudget(m),max:MGMT_CONTEUR_MAX};
  `);
  assert.deepEqual(r.ordre,['cercle','suivi'],'ton cercle, puis tes suivis'); assert.ok(r.uniques,'un seul moment par combattant');
  assert.equal(r.prive,false,'un moment sans relais ne se raconte pas');
  assert.ok(r.n>=1&&r.n<=r.budget-1&&r.budget<=r.max,'dans le budget, une place gardée aux nouvelles du monde');
});

test('H6 — le conteur relâche après une semaine lourde', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    m.cycle=10; const calme=mgmtConteurBudget(m);
    for(const x of m.roster.slice(0,3)) m.facts.push({c:9,k:'moment_vie',a:x.id,m:'deces-parent'});
    const lourd=mgmtConteurBudget(m);
    return {calme,lourd,min:MGMT_CONTEUR_MIN,max:MGMT_CONTEUR_MAX};
  `);
  assert.equal(r.calme,r.max); assert.equal(r.lourd,r.min,'après une semaine lourde : trois informations');
});

test('H6 — la semaine affiche les moments avec leur relais ; une ancienne partie reste identique', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    m.cycle=10; m.pile=[]; const f=m.roster[2];
    m.facts.push({c:10,k:'moment_vie',a:f.id,m:'mariage'});
    G.screen='mgmt_bureau'; const page=scr_mgmt_bureau();
    const ancien=mgmtDefaultAvantH4(); mgmtNewRoster(ancien); mgmtNewPile(ancien); ancien.facts.push({c:ancien.cycle,k:'moment_vie',a:ancien.roster[0].id,m:'mariage'});
    return {vie:page.includes('data-type="vie"'),libelle:page.includes(mgmtVieMomentById('mariage').libelle),
      relais:page.includes('Réseaux'),ancien:mgmtConteur(ancien).length};
  `);
  assert.ok(r.vie&&r.libelle&&r.relais); assert.equal(r.ancien,0,'effectifs 0 : pas de conteur de moments');
});

test('H6 — Continuer dit pourquoi il s’arrête et mène à ce qu’il y a à décider', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    m.cycle=3; m.pile=[]; m.card.main=[]; m.card.prelims=[];
    m.facts=m.facts.filter(x=>x.k!=='demande'); /* H7 : une demande en attente arrêterait déjà Continuer */
    const carte=mgmtContinuerRaison(m);
    m.pile=[{id:'k1',kind:'leila_propose',exchange:'leila_propose',speaker:'leila',a:m.roster[0].id,b:m.roster[1].id,status:'open',decision:null,title:'t'}];
    const affaire=mgmtContinuerRaison(m);
    G.screen='mgmt_bureau'; const page=scr_mgmt_bureau();
    CL.mgmtContinuer(); const ouvert=m.open;
    return {carte,affaire,bouton:/data-raison="affaire"[^>]*>Répondre à Leïla</.test(page),ouvert};
  `);
  assert.deepEqual(r.carte,{libelle:'Carte incomplète',raison:'carte'});
  assert.deepEqual(r.affaire,{libelle:'Répondre à Leïla',raison:'affaire'});
  assert.ok(r.bouton,'le bouton porte le libellé'); assert.equal(r.ouvert,'k1','Continuer ouvre l’affaire à traiter');
});

test('H6 — la fiche montre le rôle, le cercle, les suivis ; les boutons agissent et tout est échappé', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const f=m.roster.find(o=>mgmtRole(m,o))||m.roster[0]; f.name='<b>'+f.name; f.first='<b>';
    MGMT_FICHE={id:f.id,retour:'mgmt_bureau',cursor:0}; G.screen='mgmt_fiche';
    const avant=scr_mgmt_fiche();
    CL.mgmtCercle(f.id); const apres=scr_mgmt_fiche();
    return {role:(mgmtRole(m,f)||{}).libelle||null,avantRole:avant.includes('mgmt-fiche-role'),bouton:avant.includes('Ton cercle · 0/5'),
      apres:apres.includes('Ton cercle · 1/5')&&!apres.includes('Tes suivis'),brut:avant.includes('<b>'+f.last),cercle:mgmtCercle(m).length};
  `);
  assert.ok(r.bouton); assert.ok(r.apres); assert.equal(r.cercle,1); assert.equal(r.brut,false,'rien n’est injecté sans esc()');
  if(r.role) assert.ok(r.avantRole,'le rôle s’affiche à côté du nom');
});
