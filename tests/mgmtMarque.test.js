"use strict";
/* Monde lot 8 T1 (docs/lots/MONDE-LOT-8-T1.md) : la marque — un octogone jaune
   à côté du nom d'un combattant, dans chaque liste, quand lui est arrivé
   quelque chose depuis la dernière fois que sa fiche a été ouverte. Ouvrir la
   fiche l'éteint partout, même après un rechargement. m.visites (table de
   paires [nFaits,nCombats] vus), migration 15 → 16 (renumérotée à la fusion du lot 8, 12/10/2026), dessin unique mfMarqueNom. */
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
/* Tout « vu », puis la table tolère roster/facts/hist — usage de la fiche. */
const css=fs.readFileSync(path.join(__dirname,'..','ui-cadre.css'),'utf8').split('\r\n').join('\n');

test('Marque — mgmtMarque allume pour un moment relayé, une blessure, une demande et un combat du carton principal', () => {
  const win=neuve(7);
  win.eval(`const m=G.mgmt; mgmtVisitesInit(m);`);
  const ids=res(win,`return G.mgmt.roster.slice(0,3).map(o=>o.id);`);
  const [A,B,C]=ids;
  let r=res(win,`const m=G.mgmt; return [mgmtMarque(m,'${A}'),mgmtMarque(m,'${B}'),mgmtMarque(m,'${C}')];`);
  assert.deepEqual(r,[false,false,false],'rien n\u2019est arrivé depuis l\u2019initialisation');
  win.eval(`mgmtAddFact(G.mgmt,{c:G.mgmt.cycle,k:'injury',a:'${A}'});`);
  r=res(win,`const m=G.mgmt; return [mgmtMarque(m,'${A}'),mgmtMarque(m,'${B}'),mgmtMarque(m,'${C}')];`);
  assert.deepEqual(r,[true,false,false],'la blessure allume A seul');
  win.eval(`const m=G.mgmt; const moment=MGMT_MOMENTS.find(x=>x.relais.length>0&&mgmtVieTexte(x)); mgmtAddFact(m,{c:m.cycle,k:'moment_vie',a:'${B}',m:moment.id});`);
  r=res(win,`const m=G.mgmt; return [mgmtMarque(m,'${A}'),mgmtMarque(m,'${B}'),mgmtMarque(m,'${C}')];`);
  assert.deepEqual(r,[true,true,false],'le moment relayé allume B');
  win.eval(`mgmtAddFact(G.mgmt,{c:G.mgmt.cycle,k:'demande',a:'${C}',want:'revanche'});`);
  r=res(win,`const m=G.mgmt; return [mgmtMarque(m,'${A}'),mgmtMarque(m,'${B}'),mgmtMarque(m,'${C}')];`);
  assert.deepEqual(r,[true,true,true],'la demande allume C');
});

test('Marque — un acte du joueur, un moment sans relais et un combat de préliminaire n\u2019allument pas', () => {
  const win=neuve(7);
  const ids=res(win,`return G.mgmt.roster.slice(0,3).map(o=>o.id);`);
  const [D,E,F]=ids;
  win.eval(`const m=G.mgmt; mgmtVisitesInit(m);`);
  win.eval(`const m=G.mgmt; mgmtAddFact(m,{c:m.cycle,k:'contrat',a:'${D}'});
           mgmtAddFact(m,{c:m.cycle,k:'promesse',a:'${D}',want:'revanche'});
           mgmtAddFact(m,{c:m.cycle,k:'refus',a:'${D}',want:'revanche'});`);
  const muet=res(win,`return MGMT_MOMENTS.find(x=>mgmtVieTexte(x)&&!x.relais.length)||null;`);
  assert.ok(muet,'un moment sans relais existe bien dans les données');
  win.eval(`const m=G.mgmt; mgmtAddFact(m,{c:m.cycle,k:'moment_vie',a:'${E}',m:${JSON.stringify(muet.id)}});`);
  let r=res(win,`const m=G.mgmt; return [mgmtMarque(m,'${D}'),mgmtMarque(m,'${E}')];`);
  assert.deepEqual(r,[false,false],'les actes du joueur et un moment privé restent muets');
  /* Un combat de préliminaire : une trace copiée, rebaptisée slot 'prelim'. */
  win.eval(`const m=G.mgmt; const t={slot:'prelim',c:m.cycle,a:{id:'${F}'},b:{id:'zz'},winner:'a'}; m.hist.push(t);`);
  r=res(win,`const m=G.mgmt; return mgmtMarque(m,'${F}');`);
  assert.equal(r,false,'un combat de préliminaire n\u2019allume pas');
});

test('Marque — après une soirée, exactement les combattants du carton principal et ceux qui ont un fait compté sont allumés', () => {
  const win=neuve(7);
  win.eval(`const m=G.mgmt; mgmtVisitesInit(m); G.L0=m.facts.length; G.H0=m.hist.length;`);
  const j=jouer(win,1);
  assert.ok(j>=1,'la soirée a été jouée');
  const r=res(win,`const m=G.mgmt, out={allumes:0,faux:0};
    const faitsK=new Set(MGMT_MARQUE_FAITS);
    for(const o of m.roster){
      const dansTrace=m.hist.slice(G.H0).some(t=>t&&t.slot==='main'&&((t.a&&t.a.id===o.id)||(t.b&&t.b.id===o.id)));
      const faitCompte=m.facts.slice(G.L0).some(x=>x&&x.a===o.id&&faitsK.has(x.k)&&(
        x.k!=='moment_vie'||(()=>{const mo=mgmtVieMomentById(x.m);return !!mo&&mo.relais.length>0&&!!mgmtVieTexte(mo);})()
      ));
      const attendu=dansTrace||faitCompte, vrai=mgmtMarque(m,o.id);
      if(vrai===attendu===true) out.allumes++;
      if(vrai!==attendu) out.faux++;
    }
    return {n:m.roster.length,allumes:out.allumes,faux:out.faux};`);
  assert.equal(r.faux,0,'chaque ligne raconte la même chose que le compteur du jeu');
  assert.ok(r.allumes>=2,'la soirée a allumé quelqu\u2019un');
});

test('Marque — la marque est dessinée dans chaque liste où le nom figure', () => {
  const win=neuve(7);
  /* T6 : le budget est testé dans mgmtMarqueBudget.test.js — ici on vérifie
     le dessin, toutes les places confondues. */
  win.eval('mgmtMarqueBudget=function(){return 100000;}');
  win.eval(`const m=G.mgmt; mgmtVisitesInit(m); for(const o of m.roster){ mgmtAddFact(m,{c:m.cycle,k:'injury',a:o.id}); }`);
  /* Chaque écran rendu, sous la forme {ecran, préparation, sélecteur des marques}. */
  const ecrans=[
    {nom:'Effectif',ec:'mgmt_effectif',prep:`CL.go('mgmt_effectif');`,sel:'.mf-eff-nom .mf-oct-nom',total:9},
    {nom:'Contrats',ec:'mgmt_contrats',prep:`CL.go('mgmt_contrats');`,sel:'.mf-ct-ligne .mf-eff-nom .mf-oct-nom',total:9},
    {nom:'Classements',ec:'mgmt_classements',prep:`MGMT_SU_CL={sexe:'H',div:'H-light',curseur:0,portee:'organization'}; CL.go('mgmt_classements');`,sel:null,parts:{'.mf-su-champ-nom .mf-oct-nom':1,'.mf-su-rang-nom .mf-oct-nom':2,'.mf-su-l-nom .mf-oct-nom':6}},
    {nom:'Ceintures (le mur)',ec:'mgmt_ceintures',prep:`CL.go('mgmt_ceintures');`,sel:'.mf-su-ce-nom .mf-oct-nom',total:8},
    {nom:'Ceintures (la ceinture ouverte)',ec:'mgmt_ceintures',prep:`MGMT_SU_CE.i=allDivisions().filter(d=>d.gender==='H').findIndex(d=>d.id==='H-light'); MGMT_SU_CE.ouverte=true; CL.go('mgmt_ceintures');`,sel:null,parts:{'.mf-su-det-nom .mf-oct-nom':1,'.mf-su-r-nom .mf-oct-nom':1}},
    {nom:'Camps',ec:'mgmt_camps',prep:`CL.go('mgmt_camps');`,sel:'.mf-su-ca-mn .mf-oct-nom',total:6},
    {nom:'Carte',ec:'mgmt_carte',prep:`CL.go('mgmt_carte');`,sel:'.mf-car-adv .mf-oct-nom',total:6}
  ];
  for(const e of ecrans){
    win.eval(e.prep);
    assert.equal(win.eval('G.screen'),e.ec,'écran '+e.nom);
    const n=win.eval(`document.querySelectorAll('.mf-oct-nom').length`);
    const nSel=e.sel?win.eval(`document.querySelectorAll(${JSON.stringify(e.sel)}).length`):null;
    if(e.sel){ assert.equal(nSel,e.total,'marques attendues dans "'+e.sel+'" ('+e.nom+')'); assert.equal(n,e.total,'toute marque de '+e.nom+' est une marque de nom'); }
    else{
      let somme=0;
      for(const [sel,a] of Object.entries(e.parts)){ const v=win.eval(`document.querySelectorAll(${JSON.stringify(sel)}).length`); assert.equal(v,a,'marques attendues dans "'+sel+'" ('+e.nom+')'); somme+=v; }
      assert.equal(n,somme,'toute marque de '+e.nom+' est une marque de nom');
    }
    assert.ok(win.eval(`[...document.querySelectorAll('.mf-oct-nom')].every(o=>!!o.getAttribute('aria-label'))`),'aria-label non vide ('+e.nom+')');
  }
  /* La carte composée : deux noms marqués par combat confirmé ; les préliminaires à valider. */
  win.eval(`(()=>{ const m=G.mgmt; for(let k=0;k<40&&m.card.main.length<m.card.sizeMain;k++){ const rows=mgmtCartRows(m).filter(f=>mgmtSelectable(m,f,null)); let ok=false;
    for(const a of rows){ const b=rows.find(x=>x.id!==a.id&&x.div===a.div&&mgmtSelectable(m,x,a.id)); if(b&&mgmtBookMain(m,a.id,b.id)){ ok=true; break; } } if(!ok) break; } })(); CL.go('mgmt_carte');`);
  const confirme=win.eval(`document.querySelectorAll('.mf-car-slot.confirme').length`);
  assert.ok(confirme>0,'la carte principale est confirmée');
  assert.equal(win.eval(`document.querySelectorAll('.mf-car-slot .mf-oct-nom').length`),2*confirme,'deux noms marqués par combat confirmé (carte)');
  win.eval(`CL.go('mgmt_prelims');`);
  const avalider=win.eval(`document.querySelectorAll('.mf-pre-slot.avalider').length`);
  assert.ok(avalider>0,'des préliminaires attendent la validation');
  assert.equal(win.eval(`document.querySelectorAll('.mf-pre-slot .mf-oct-nom').length`),2*avalider,'deux noms marqués par combat à valider (préliminaires)');
  /* Et quand tout devient « vu », plus une seule marque, sur aucun écran. */
  win.eval(`const m=G.mgmt; mgmtVisitesInit(m);`);
  for(const e of ecrans){
    win.eval(e.prep);
    assert.equal(win.eval(`document.querySelectorAll('.mf-oct-nom').length`),0,'plus de marque sur '+e.nom+' quand tout est vu');
  }
  win.eval(`CL.go('mgmt_prelims');`);
  assert.equal(win.eval(`document.querySelectorAll('.mf-oct-nom').length`),0,'plus de marque sur les Préliminaires quand tout est vu');
});

test('Marque — un seul combattant marqué n\u2019allume qu\u2019une marque dans la liste de l\u2019Effectif', () => {
  const win=neuve(7);
  win.eval(`const m=G.mgmt; mgmtVisitesInit(m); CL.go('mgmt_effectif'); const X=document.querySelector('.mf-eff-ligne').dataset.id; mgmtAddFact(m,{c:m.cycle,k:'injury',a:X}); CL.go('mgmt_effectif');`);
  assert.equal(win.eval(`document.querySelectorAll('.mf-oct-nom').length`),1);
  assert.ok(win.eval(`document.querySelector('.mf-oct-nom').closest('.mf-eff-ligne').dataset.id===document.querySelector('.mf-eff-ligne').dataset.id`),'la marque est dans la ligne du combattant');
});

test('Marque — ouvrir la fiche éteint la marque partout, et elle reste éteinte après un rechargement', () => {
  const win=neuve(7);
  win.eval(`const m=G.mgmt; mgmtVisitesInit(m); CL.go('mgmt_effectif'); const X=document.querySelector('.mf-eff-ligne').dataset.id; mgmtAddFact(m,{c:m.cycle,k:'injury',a:X}); G.MARQUE_X=X; CL.go('mgmt_effectif');`);
  assert.ok(res(win,`return mgmtMarque(G.mgmt,G.MARQUE_X);`),'X est marqué avant l\u2019ouverture');
  assert.ok(win.eval(`document.querySelectorAll('.mf-oct-nom').length`)>0,'marques dessinées');
  win.eval(`CL.mgmtFiche(G.MARQUE_X);`);
  assert.equal(win.eval('MGMT_FICHE.id'),win.eval('G.MARQUE_X'),'la fiche de X est ouverte');
  assert.equal(res(win,`return mgmtMarque(G.mgmt,G.MARQUE_X);`),false,'la marque de X est éteinte');
  win.eval(`CL.go('mgmt_effectif');`);
  assert.equal(win.eval(`document.querySelectorAll('.mf-oct-nom').length`),0);
  win.eval(`(() => { saveMgmt(); G.mgmt=null; loadMgmt(); })();`);
  assert.equal(res(win,`return mgmtMarque(G.mgmt,G.MARQUE_X);`),false,'et elle reste éteinte après un rechargement');
  win.eval(`mgmtAddFact(G.mgmt,{c:G.mgmt.cycle,k:'susp',a:G.MARQUE_X});`);
  assert.ok(res(win,`return mgmtMarque(G.mgmt,G.MARQUE_X);`),'un nouveau fait la rallume');
});

test('Marque — \u2190 \u2192 de la fiche éteint aussi la marque du combattant atteint', () => {
  const win=neuve(7);
  win.eval(`const m=G.mgmt; mgmtVisitesInit(m); CL.go('mgmt_effectif');
           const l=document.querySelectorAll('.mf-eff-ligne'); const X=l[0].dataset.id, Y=l[1].dataset.id;
           mgmtAddFact(m,{c:m.cycle,k:'injury',a:X}); mgmtAddFact(m,{c:m.cycle,k:'injury',a:Y}); G.MX=X; G.MY=Y;
           CL.mgmtFiche(X);`);
  assert.equal(win.eval('MGMT_FICHE.id'),win.eval('G.MX'));
  win.eval(`CL.mgmtFicheAutre(1);`);
  assert.equal(win.eval('MGMT_FICHE.id'),win.eval('G.MY'),'la fiche est passée au voisin');
  assert.equal(res(win,`return mgmtMarque(G.mgmt,G.MY);`),false,'la marque du voisin s\u2019est éteinte');
});

test('Marque — une partie en version 14 se charge, se valide, ne s\u2019allume pas, et joue une soirée', () => {
  const win=neuve(7);
  const j=jouer(win,4);
  assert.ok(j>=4,'quatre soirées jouées');
  win.eval(`G.brut=JSON.parse(JSON.stringify(G.mgmt)); G.brut.v=14; delete G.brut.visites;`);
  const r=res(win,`const mig=mgmtMigrate(G.brut); if(!mig) return null;
    G.mgmt=mig;
    return {v:mig.v,valide:validateMgmt(JSON.parse(JSON.stringify(mig))),allumes:mig.roster.filter(o=>mgmtMarque(mig,o.id)).length,n:mig.roster.length};`);
  assert.ok(r,'la migration n\u2019a pas refusé la partie');
  /* ==== [ANCRE: MONDE_LOT5_T3_VERSION_MARQUE_14] — Monde lot 5 T3 ==== */
  assert.equal(r.v,18,'chaîne 14 → 15 (lot 1) → 16 (lot 8) → 17 (lot 5 T3) → 18 (lot 5 T4)'); /* décision du 13/10/2026, lot 5 T4 */ assert.equal(r.n,364); assert.ok(r.valide,'la partie migrée se valide');
  assert.equal(r.allumes,0,'la migration part pleine : personne n\u2019est marqué');
  const charge=res(win,`G.mgmt=null; return !!mgmtParseAndValidate(JSON.stringify(G.brut));`);
  assert.ok(charge,'une v14 persistée se charge sans perte');
  win.eval(`G.mgmt=mgmtMigrate(G.brut);`);
  const j2=jouer(win,1);
  assert.ok(j2>=1,'la soirée a été jouée sur l\u2019état migré');
  const r2=res(win,`const m=G.mgmt; return {allumes:m.roster.filter(o=>mgmtMarque(m,o.id)).length};`);
  assert.ok(r2.allumes>=2,'la soirée a allumé quelqu\u2019un ; la v16 vit');
});

test('Marque — une partie en version 15 (le passé) migre vers 16 : la table des visites naît pleine, rien d’autre ne bouge', () => {
  const win=neuve(7);
  jouer(win,2);
  win.eval(`G.brut=JSON.parse(JSON.stringify(G.mgmt)); G.brut.v=15; delete G.brut.visites; G.ref=JSON.parse(JSON.stringify(G.brut));`);
  const r=res(win,`const mig=mgmtMigrate(G.brut); if(!mig) return null;
    const sans=JSON.parse(JSON.stringify(mig)); delete sans.visites; sans.v=15;
    return {v:mig.v,valide:validateMgmt(JSON.parse(JSON.stringify(mig))),intact:JSON.stringify(sans)===JSON.stringify(G.ref),allumes:mig.roster.filter(o=>mgmtMarque(mig,o.id)).length};`);
  assert.ok(r,'la migration n’a pas refusé la partie');
  /* ==== [ANCRE: MONDE_LOT5_T3_VERSION_MARQUE_15] — Monde lot 5 T3 ==== */
  assert.equal(r.v,18); /* décision du 13/10/2026, lot 5 T4 */ assert.ok(r.valide); assert.ok(r.intact,'aucun autre champ ne bouge'); assert.equal(r.allumes,0);
});

test('Marque — validateMgmt refuse une table des visites mal formée, mgmtRepair la reconstruit', () => {
  const win=neuve(7);
  const r=res(win,`const m=G.mgmt, cas=[];
    for(const visites of [[],{mg1:[1]},{mg1:[-1,0]},{'a b':[0,0]},{mg1:[1.5,0]}]){
      const c=JSON.parse(JSON.stringify(m)); c.visites=visites; cas.push(validateMgmt(c));
    } return cas;`);
  assert.deepEqual(r,[false,false,false,false,false],'les cinq tables mal formées sont refusées');
  const r2=res(win,`const m=G.mgmt, c=JSON.parse(JSON.stringify(m)); c.visites={mg1:[1.5,0]};
    const rep=mgmtRepair(c);
    return {valide:mgmtVisitesValide(rep.visites),allumes:rep.roster.filter(o=>mgmtMarque(rep,o.id)).length,v:rep.v};`);
  assert.ok(r2.valide,'mgmtRepair reconstruit une table valide');
  assert.equal(r2.allumes,0,'et la réparation n\u2019allume personne');
});

test('Marque — le dessin de la marque tient dans sa cellule', () => {
  const regle=css.match(/\.mf-oct-nom\{[^}]*\}/g).filter(r=>r.includes('width:18px'));
  assert.equal(regle.length,1,'une seule règle pose les dimensions');
  const r=regle[0];
  for(const p of ['width:18px','height:18px','flex:none']) assert.ok(r.includes(p),p);
  assert.ok(!r.includes('position:absolute'),'jamais position:absolute');
  const fichiers=fs.readdirSync(path.join(__dirname,'..')).filter(f=>/^mgmt-.*\.js$/.test(f)&&f!=='mgmt-cadre.js'
    &&fs.readFileSync(path.join(__dirname,'..',f),'utf8').includes('mf-oct-nom'));
  assert.deepEqual(fichiers,[],'mf-oct-nom n\u2019apparaît que dans mgmt-cadre.js (un seul dessinateur)');
});

test('Marque — une partie neuve démarre sans aucune marque', () => {
  const win=neuve(7);
  const r=res(win,`const m=G.mgmt; return {n:m.roster.length,allumes:m.roster.filter(o=>mgmtMarque(m,o.id)).length};`);
  assert.equal(r.n,364); assert.equal(r.allumes,0,'une partie neuve démarre sans marque');
});
