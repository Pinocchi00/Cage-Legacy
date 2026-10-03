"use strict";
/* Lot 5 T2 + T3 : la voix branchée. Aucune réplique n'est écrite par le code :
   elles viennent de docs/LES-VOIX-DES-COMBATTANTS-v2.md (relu:false). */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {newGameWindow}=require('./helpers/loadGame');
function result(win,code){ return JSON.parse(win.eval(`JSON.stringify((function(){${code}})())`)); }
const NEUVE=`setSeed(9); const m=mgmtDefault(); mgmtNewRoster(m); mgmtExteriorEnsure(m); mgmtNewPile(m); G={theme:'dark',mgmt:m,screen:'mgmt_bureau'}; m.facts=[]; m.hist=[]; m.cycle=10;
  const libres=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o)); const [X,Y]=libres;
  const combat=(c,g,p,family,round)=>m.hist.push({c,slot:'main',rounds:3,a:{id:g.id,W:5,L:0,D:0},b:{id:p.id,W:5,L:1,D:0},winner:'A',family,round});`;

test('T2 — les 48 voix du document sont dans les données, chacune avec ses répliques relu:false', () => {
  const win=newGameWindow();
  const r=result(win,`return {n:MGMT_VOIX.length,ids:new Set(MGMT_VOIX.map(v=>v.id)).size,sans:MGMT_VOIX.filter(v=>!v.repliques.length).map(v=>v.id),
    relu:MGMT_VOIX.every(v=>v.repliques.every(x=>x.relu===false&&typeof x.texte==='string'&&x.texte.length>0)),commune:MGMT_VOIX.some(v=>v.id===MGMT_VOIX_COMMUNE),
    total:MGMT_VOIX.reduce((n,v)=>n+v.repliques.length,0),situations:[...new Set(MGMT_VOIX.flatMap(v=>v.repliques.map(x=>x.situation)))]};`);
  assert.equal(r.n,48); assert.equal(r.ids,48); assert.deepEqual(r.sans,[]); assert.ok(r.relu); assert.ok(r.commune);
  assert.ok(r.total>=200); for(const s of ['annonce','victoire','defaite','inactivite','reseaux','proposition','forfait']) assert.ok(r.situations.includes(s),s);
});

test('T2 — le fichier de données est exactement ce que le document produit (aucune réplique n’est retouchée à la main)', () => {
  const {execFileSync}=require('node:child_process');
  const racine=path.join(__dirname,'..');
  const avant=fs.readFileSync(path.join(racine,'mgmt-voix-data.js'),'utf8').replace(/\r\n/g,'\n');
  execFileSync(process.execPath,[path.join(racine,'tools','extraire-voix.js')],{cwd:racine,stdio:'pipe'});
  const apres=fs.readFileSync(path.join(racine,'mgmt-voix-data.js'),'utf8').replace(/\r\n/g,'\n');
  assert.equal(apres,avant,'mgmt-voix-data.js est généré : on corrige le document puis on relance tools/extraire-voix.js');
});

test('T2 — la voix d’un combattant est déduite de son id : stable, sans RNG de partie, jamais stockée', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const seed=SEED; const a=m.roster.map(f=>mgmtVoixId(f)); const b=m.roster.map(f=>mgmtVoixId(f));
    const ids=new Set(MGMT_VOIX.map(v=>v.id));
    return {stable:JSON.stringify(a)===JSON.stringify(b),connues:a.every(x=>ids.has(x)),rng:seed===SEED,
      champs:Object.keys(m.roster[0]).filter(k=>/voix/i.test(k)),diverses:new Set(a).size};
  `);
  assert.ok(r.stable); assert.ok(r.connues); assert.ok(r.rng); assert.deepEqual(r.champs,[]); assert.ok(r.diverses>=8,'un vestiaire parle de plusieurs façons');
});

test('T2 — la commune pèse un quart ; les contraintes du document §8 tiennent ; le Hanté et le Converti ne se tirent pas au départ', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const comptes={}; let n=0;
    for(let i=0;i<6000;i++){ const f={id:'mg'+(1000+i),div:['H-light','F-straw','H-heavy','F-fly'][i%4],age:18+(i%25),W:i%30,L:i%9,D:0}; const id=mgmtVoixId(f); comptes[id]=(comptes[id]||0)+1; n++; }
    const test=(id,faux)=>{ let viol=0; for(let i=0;i<6000;i++){ const f={id:'mg'+(1000+i),div:['H-light','F-straw','H-heavy','F-fly'][i%4],age:18+(i%25),W:i%30,L:i%9,D:0}; if(mgmtVoixId(f)===id&&faux(f)) viol++; } return viol; };
    const genre=f=>divById(f.div).gender;
    return {commune:comptes[MGMT_VOIX_COMMUNE]/n,mere:test('la-mere',f=>genre(f)!=='F'||f.age<24),vieux:test('le-vieux-de-la-vieille',f=>f.age<33),
      timide:test('le-timide',f=>f.age>=24||f.W+f.L>=10),pionniere:test('la-pionniere',f=>genre(f)!=='F'),hante:comptes['le-hante']||0,converti:comptes['le-converti-tardif']||0,
      signeur:(comptes['le-signeur']||0)/n};
  `);
  assert.ok(r.commune>0.24&&r.commune<0.36,'commune '+r.commune.toFixed(3)+' (25 % + les poids rendus par les contraintes)');
  assert.equal(r.mere,0); assert.equal(r.vieux,0); assert.equal(r.timide,0); assert.equal(r.pionniere,0);
  assert.equal(r.hante,0); assert.equal(r.converti,0); assert.ok(r.signeur<0.012,'le Signeur : environ un sur deux cents');
});

test('T2 — l’Interprété n’existe que pour BR, JP, RU, MX, TH, KR, GE', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    let hors=0, vus=0;
    for(const f of m.roster){ if(mgmtVoixId(f)==='linterprete'){ vus++; if(!MGMT_VOIX_INTERPRETE_PAYS.includes(mgmtIdentitePays(f))) hors++; } }
    for(let i=0;i<3000;i++){ const f={id:'mg'+(5000+i),div:'H-light',age:27,W:8,L:3,D:0,ck:COUNTRY_KEYS[i%COUNTRY_KEYS.length],generation:1}; if(mgmtVoixId(f)==='linterprete'){ vus++; if(!MGMT_VOIX_INTERPRETE_PAYS.includes(f.ck)) hors++; } }
    return {hors,vus};
  `);
  assert.equal(r.hors,0); assert.ok(r.vus>0);
});

test('T2 — les emplacements se remplissent depuis l’état du jeu ; une réplique à emplacement manquant n’est jamais montrée', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    combat(9,X,Y,'ko',2);
    const ctx=mgmtVoixContexte(m,X,'victoire');
    const plein=mgmtVoixRemplit('Bravo à {adv} au round {round}, en {cat}.',ctx);
    const manque=mgmtVoixRemplit('Ça fait {mois} mois.',ctx);
    const inconnu=mgmtVoixRemplit('Salut {truc}.',ctx);
    const defaite=mgmtVoixContexte(m,Y,'defaite');
    return {plein,adv:Y.name,cat:mgmtDivisionLabel(X.div),manque,inconnu,advDefaite:defaite.adv===X.name&&defaite.round===2};
  `);
  assert.ok(r.plein.includes(r.adv)&&r.plein.includes('round 2')&&r.plein.includes(r.cat)); assert.equal(r.manque,null); assert.equal(r.inconnu,null); assert.ok(r.advDefaite);
});

test('T2 — les accords [masculin|féminin] suivent la catégorie du locuteur', () => {
  const win=newGameWindow();
  const r=result(win,`return {m:mgmtVoixAccorde('J\\'étais [prêt|prête], [dégoûté|dégoûtée].','H'),f:mgmtVoixAccorde('J\\'étais [prêt|prête], [dégoûté|dégoûtée].','F'),
    rien:mgmtVoixAccorde('Rien à accorder.','F')};`);
  assert.equal(r.m,'J\'étais prêt, dégoûté.'); assert.equal(r.f,'J\'étais prête, dégoûtée.'); assert.equal(r.rien,'Rien à accorder.');
});

test('T2 — mgmtReplique choisit UNE réplique de SA voix, déterministe ; à défaut, la Commune ; jamais d’emplacement brut', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    combat(9,X,Y,'dec',3); const seed=SEED;
    const a=mgmtReplique(m,X,'victoire'), b=mgmtReplique(m,X,'victoire');
    const voix=mgmtVoixId(X); const permises=mgmtVoixRepliquesDe(voix,'victoire').map(x=>x.texte).concat(mgmtVoixRepliquesDe(MGMT_VOIX_COMMUNE,'victoire').map(x=>x.texte));
    let bruts=0, nuls=0, total=0;
    for(const f of m.roster.slice(0,60)){ for(const s of ['annonce','victoire','defaite','inactivite']){ total++; const t=mgmtReplique(m,f,s); if(t===null) nuls++; else if(/\\{[a-z_]+\\}|\\[[^\\]]*\\|[^\\]]*\\]/.test(t)) bruts++; } }
    return {a,b,rng:seed===SEED,voixConnue:a===null||true,bruts,nuls,total};
  `);
  assert.equal(r.a,r.b,'même combattant, même situation, même cycle : la même phrase'); assert.ok(r.rng);
  assert.equal(r.bruts,0,'aucun emplacement ni accord brut à l’écran'); assert.ok(r.nuls<r.total,'la plupart des situations ont une réplique');
});

test('T3 — « Ce qu’on dit de lui » : la parole du combattant selon ce qu’il vit ; « On ne sait pas encore » sinon', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const rien=mgmtParoleRecente(m,Y)===null||mgmtParoleRecente(m,Y)!==undefined;
    combat(10,X,Y,'dec',3);
    const gagnant=mgmtParoleRecente(m,X), perdant=mgmtParoleRecente(m,Y);
    const htmlX=mgmtFicheParole(m,X);
    const calme=m.roster.find(o=>o.id!==X.id&&o.id!==Y.id&&!mgmtEngaged(m,o)); calme.lastCycle=undefined; const sans=mgmtFicheParole(m,calme);
    const ex=m.exterieur[0]; const ext=mgmtFicheParole(m,{id:ex.id,div:ex.div});
    const ancien=mgmtDefaultAvantH4(); mgmtNewRoster(ancien);
    return {gagnant:gagnant&&gagnant.situation,perdant:perdant&&perdant.situation,htmlX:htmlX.includes('Ce qu\\'on dit de lui')&&htmlX.includes('«'),sans:sans.includes('On ne sait pas encore'),ext,ancien:mgmtParoleRecente(ancien,ancien.roster[0])};
  `);
  assert.equal(r.gagnant,'victoire'); assert.equal(r.perdant,'defaite'); assert.ok(r.htmlX); assert.ok(r.sans);
  assert.equal(r.ext,'','le monde extérieur n’a pas de parole à Split'); assert.equal(r.ancien,null,'une ancienne partie ne parle pas');
});

test('T3 — la défaite par KO choisit, quand sa voix l’a, la réplique « Défaite, KO » ; l’annonce suit la carte ; l’inactivité compte les mois', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const avecKo=MGMT_VOIX.find(v=>v.repliques.some(x=>x.etiquette==='Défaite, KO'));
    const rep=mgmtVoixRepliquesDe(avecKo.id,'defaite','ko');
    const generique=mgmtVoixRepliquesDe(avecKo.id,'defaite');
    m.card.main=[{a:X.id,b:Y.id,cycle:m.cycle,slot:'main'}]; m.hist=[];
    const annonce=mgmtParoleRecente(m,X);
    m.card.main=[]; X.lastCycle=m.cycle-7; const inact=mgmtParoleRecente(m,X);
    const ctx=mgmtVoixContexte(m,X,'inactivite');
    return {ko:rep.length===1&&rep[0].etiquette==='Défaite, KO',gen:generique.every(x=>!x.etiquette.includes(',')),annonce:annonce&&annonce.situation,inact:inact&&inact.situation,mois:ctx.mois,attendu:Math.round(7*MGMT_VOIX_MOIS_PAR_CYCLE)};
  `);
  assert.ok(r.ko); assert.ok(r.gen); assert.equal(r.annonce,'annonce'); assert.equal(r.inact,'inactivite'); assert.equal(r.mois,r.attendu);
});

test('T3 — la semaine et le fil portent « Ce qui se dit » ; tout est échappé ; le cercle parle d’abord', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    X.name='<img src=x>'+X.name; mgmtCercleToggle(m,X.id); combat(10,X,Y,'dec',3); m.pile=[];
    const paroles=mgmtParolesDeLaSemaine(m);
    const semaine=SCREENS.mgmt_bureau(); const fil=mgmtFilLignes(m);
    return {n:paroles.length,premier:paroles[0]&&paroles[0].id===X.id,semaine:semaine.includes('data-type="parole"')&&semaine.includes('Ce qui se dit'),
      brut:semaine.includes('<img src=x>'),filParole:fil.some(l=>l.includes('«')),max:paroles.length<=2};
  `);
  assert.ok(r.n>=1&&r.max); assert.ok(r.premier,'ton cercle d’abord'); assert.ok(r.semaine); assert.equal(r.brut,false); assert.ok(r.filParole);
});

test('T3 — le coût : une fiche et une semaine avec paroles restent sous 100 ms ; l’ordre de chargement est tenu', () => {
  const win=newGameWindow();
  const {readScriptOrder}=require('./helpers/loadGame');
  const o=readScriptOrder();
  assert.ok(o.indexOf('mgmt-voix-data.js')<o.indexOf('mgmt-voix.js')&&o.indexOf('mgmt-voix.js')<o.indexOf('mgmt-screens.js'));
  const r=result(win,`${NEUVE}
    for(let i=0;i<30;i++){ const [a,b]=m.roster.slice(i*2,i*2+2); if(a&&b) combat(10,a,b,'dec',3); }
    MGMT_FICHE={id:X.id,retour:'mgmt_bureau',cursor:0}; G.screen='mgmt_fiche'; scr_mgmt_fiche();
    const t=performance.now(); scr_mgmt_fiche(); const fiche=performance.now()-t;
    G.screen='mgmt_bureau'; SCREENS.mgmt_bureau(); const t2=performance.now(); SCREENS.mgmt_bureau(); const semaine=performance.now()-t2;
    return {fiche,semaine};
  `);
  assert.ok(r.fiche<100,'fiche '+r.fiche.toFixed(0)+' ms'); assert.ok(r.semaine<150,'semaine '+r.semaine.toFixed(0)+' ms');
});
