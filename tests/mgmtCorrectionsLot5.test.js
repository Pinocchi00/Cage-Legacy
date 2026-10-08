"use strict";
/* Brief des corrections du 08/10/2026, lot 5 : textes, noms et accords. Aucun homonyme exact et peu de noms partagés (5.1), les noms slaves au féminin (5.2),
   l'interface accordée aux combattantes (5.3), les deux verbes au futur (5.5), les contractions de villes (5.6), les accents gardés en capitales (5.8),
   une seule monnaie (5.9). */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {newGameWindow}=require('./helpers/loadGame');
const jouer=require('./helpers/jouerSoirees');
const css=fs.readFileSync(path.join(__dirname,'..','ui-cadre.css'),'utf8');
const racine=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');

test('5.1 — Sur 20 effectifs : aucun homonyme exact, jamais deux fois le même nom dans une catégorie hors fratrie, moins de 5 % de noms partagés', () => {
  const win=newGameWindow();
  const r=JSON.parse(win.eval(`JSON.stringify((function(){ const out=[]; for(let s=1;s<=20;s++){ setSeed(s*31); const m=mgmtDefault(); mgmtNewRoster(m); G={mgmt:m};
    const n=m.roster.length; const exact=n-new Set(m.roster.map(f=>f.first+'|'+f.last)).size;
    const byLast=new Map(); for(const f of m.roster){ if(!byLast.has(f.last)) byLast.set(f.last,[]); byLast.get(f.last).push(f); }
    let partagesHorsFratrie=0, memeCategorieHorsFratrie=0;
    for(const arr of byLast.values()){ if(arr.length<2) continue;
      const hors=arr.filter(f=>mgmtFratrie(m,f).length===0); partagesHorsFratrie+=hors.length;
      const cat=new Map(); for(const f of hors) cat.set(f.div,(cat.get(f.div)||0)+1); for(const c of cat.values()) if(c>1) memeCategorieHorsFratrie+=c; }
    out.push({n,exact,partagesHorsFratrie,memeCategorieHorsFratrie}); } return out; })())`));
  for(const x of r){
    assert.equal(x.exact,0,'aucun homonyme exact');
    assert.equal(x.memeCategorieHorsFratrie,0,'jamais deux fois le même nom dans une catégorie, hors fratrie voulue');
    assert.ok(x.partagesHorsFratrie/x.n<0.05,`noms partagés hors fratries : ${x.partagesHorsFratrie} sur ${x.n}`);
  }
});

test('5.2 — Les noms russes, daghestanais, kazakhs, kirghizes et polonais ont leur forme féminine ; les autres sont invariables', () => {
  const win=newGameWindow();
  const bad=JSON.parse(win.eval(`JSON.stringify((function(){ const bad=[]; for(const ck of ['RU','DAG','KZ','KG']) for(const l of COUNTRIES[ck].last){ const f=feminiserNom(l,ck); if(/(ov|ev|in)$/.test(l)?f!==l+'a':f!==l) bad.push([ck,l,f]); }
    for(const l of COUNTRIES.PL.last){ const f=feminiserNom(l,'PL'); if(/(ski|cki)$/.test(l)?f!==l.slice(0,-1)+'a':f!==l) bad.push(['PL',l,f]); }
    for(const ck of ['FR','JP','GE','US']) for(const l of COUNTRIES[ck].last) if(feminiserNom(l,ck)!==l) bad.push([ck,l]);
    return bad; })())`));
  assert.deepEqual(bad,[]);
  assert.equal(win.eval(`feminiserNom('Ivanov','RU')`),'Ivanova');
  assert.equal(win.eval(`feminiserNom('Komarov','RU')`),'Komarova');
  assert.equal(win.eval(`feminiserNom('Magomedkhanov','DAG')`),'Magomedkhanova');
  assert.ok(win.eval(`(function(){ setSeed(3); for(let i=0;i<40;i++){ const n=makeName('F','RU').last; if(/(ov|ev|in)$/.test(n)) return false; } return true; })()`),'une combattante russe ne porte plus la forme masculine');
  assert.ok(win.eval(`(function(){ setSeed(3); for(let i=0;i<40;i++){ const n=makeName('H','RU').last; if(/(ova|eva|ina)$/.test(n)) return false; } return true; })()`),'un combattant la garde');
});

test('5.3 — La fiche d’une combattante ne dit « il » ni « lui » nulle part, celle d’un combattant reste au masculin', () => {
  const win=newGameWindow({runMain:true});
  win.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(7); CL.mgmtEnter(1);`);
  jouer(win,2,{titre:true});
  const {f,h}=JSON.parse(win.eval(`JSON.stringify({f:G.mgmt.roster.find(f=>mgmtFeminin(f)).id,h:G.mgmt.roster.find(f=>!mgmtFeminin(f)).id})`));
  for(const o of ['apercu','style','combats','contrat','ondit']){
    win.eval(`CL.mgmtFiche(${JSON.stringify(f)}); CL.mgmtFicheOnglet('${o}')`);
    const t=win.eval(`document.getElementById('app').textContent`);
    assert.ok(!/(?<!s[’'])\b(Il|il|lui)\b/.test(t),o+' : aucun pronom masculin pour une combattante (« s’il est confirmé » parle du combat)');
    assert.ok(!/\{(Il|il|lui|delui)\}/.test(t),'aucun jeton d’accord oublié');
  }
  win.eval(`CL.mgmtFiche(${JSON.stringify(h)}); CL.mgmtFicheOnglet('ondit')`);
  assert.match(win.eval(`document.getElementById('app').textContent`),/Ce qu(’|')on dit de lui/);
  assert.equal(win.eval(`mgmtAccord(mgmtFighterById(G.mgmt,${JSON.stringify(f)}),'{Il} gagne, {il} le sait, {lui} aussi : ce qu’on dit {delui}')`),'Elle gagne, elle le sait, elle aussi : ce qu’on dit d’elle');
});

test('5.5 — Les deux verbes de la réplique de retour sont au futur', () => {
  const t=racine('mgmt-retraits-data.js');
  assert.ok(t.includes("Je reviendrai, je vais d'abord prendre soin de moi mais je remonterai dans la cage."));
  assert.ok(!t.includes('eviendrais'));
});

test('5.6 — « de » + « Le » donne « du », + « Les » « des », « d’ » devant une voyelle ; pareil pour « à » ; sur toutes les villes du catalogue', () => {
  const win=newGameWindow();
  assert.equal(win.eval(`mgmtCampNomPropre('Salle de lutte de {Ville}','Le Havre')`),'Salle de lutte du Havre');
  assert.equal(win.eval(`mgmtCampNomPropre('Club de {Ville}','Les Sables')`),'Club des Sables');
  assert.equal(win.eval(`mgmtCampNomPropre('Club de {Ville}','Angers')`),'Club d’Angers');
  assert.equal(win.eval(`mgmtCampNomPropre('Club à {Ville}','Le Mans')`),'Club au Mans');
  assert.equal(win.eval(`mgmtCampNomPropre('Club de {Ville}','Lyon')`),'Club de Lyon');
  const mauvais=JSON.parse(win.eval(`JSON.stringify((function(){ const bad=[]; for(const ck of Object.keys(MGMT_VILLES)) for(const v of MGMT_VILLES[ck]) for(const lang of Object.keys(MGMT_SALLES_MODELES)) for(const mo of MGMT_SALLES_MODELES[lang]){ const n=mgmtCampNomPropre(mo.texte,v); if(/ (de|à) (Le|Les) /.test(n)||/ de [AEIOUYÉÈÊ]/.test(n)&&lang==='fr') bad.push(n); } return bad; })())`));
  assert.deepEqual(mauvais,[]);
});

test('5.8 — Les capitales gardent leurs accents : FÉMININ, LÉGER, LEFÈVRE, GUIMARÃES', () => {
  const win=newGameWindow({runMain:true});
  assert.equal(win.eval(`mfNet('Poids léger féminin')`),'POIDS LÉGER FÉMININ');
  assert.equal(win.eval(`mfNet('Lefèvre')+' '+mfNet('Guimarães')`),'LEFÈVRE GUIMARÃES');
  assert.equal(win.eval(`mfNet('O’Connor')`),"O'CONNOR");
  assert.equal(win.eval(`mgmtCarteCourt('F-fly')`),'MOUCHE F');
});

test('5.9 — Une seule monnaie dans tout le mode : l’euro, jamais « k$ » à l’écran', () => {
  const win=newGameWindow({runMain:true});
  win.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(7); CL.mgmtEnter(1);`);
  for(const sc of ['mgmt_bureau','mgmt_organisation','mgmt_finances','mgmt_carte','mgmt_contrats']){
    win.eval(`CL.go(${JSON.stringify(sc)})`);
    const t=win.eval(`document.getElementById('app').textContent`);
    assert.ok(!/k\$/.test(t),sc+' ne doit pas écrire « k$ »');
  }
  win.eval(`CL.go('mgmt_bureau')`);
  assert.match(win.eval(`document.getElementById('app').textContent`),/trésorerie 50 000 €/);
});

test('5.10 — En 1920, le nom de l’organisation de l’en-tête de soirée n’est jamais coupé : la droite se réduit avant lui', () => {
  assert.match(css,/\.mf-so-chip\.org\{flex:none\}/);
  assert.match(css,/\.mf-so-chip:not\(\.org\)\{min-width:0/);
  assert.match(css,/\.mf-so-chip:not\(\.org\) span\{[^}]*text-overflow:ellipsis/);
});
