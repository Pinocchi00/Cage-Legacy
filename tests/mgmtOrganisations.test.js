"use strict";
/* Brief du 06/10/2026, lot 5 : le monde à huit organisations. Une nouvelle partie commence par le choix d'une
   organisation ; le profil règle la création du monde ; l'organisation choisie s'affiche partout où Split
   s'affichait ; « Créer ton organisation » n'ouvre rien ; une partie d'avant garde Split. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
function result(win,code){ return JSON.parse(win.eval(`JSON.stringify((function(){${code}})())`)); }
const touche=(win,key)=>win.eval(`keysHandle({key:${JSON.stringify(key)},preventDefault(){}})`);

test('Organisations — huit, chacune avec deux plus et deux moins ; les trois derniers noms sont ceux d’Anthony', () => {
  const win=newGameWindow();
  const r=result(win,`return {n:MGMT_ORGANISATIONS.length,ids:new Set(MGMT_ORGANISATIONS.map(o=>o.id)).size,noms:new Set(MGMT_ORGANISATIONS.map(o=>o.nom)).size,
    plus:MGMT_ORGANISATIONS.every(o=>o.plus.length===2&&o.moins.length===2),auteur:MGMT_ORGANISATIONS.filter(o=>o.auteur).map(o=>o.nom),
    connus:MGMT_ORGANISATIONS.filter(o=>!o.auteur).map(o=>o.nom),ext:MGMT_EXT_ORGS,premier:MGMT_ORGANISATIONS[0].nom,
    profils:MGMT_ORGANISATIONS.every(o=>['caisse','effectif','age','popularite','salles','bourses','fortes','faibles','entente'].every(k=>k in o.profil))};`);
  assert.equal(r.n,8); assert.equal(r.ids,8); assert.equal(r.noms,8); assert.ok(r.plus); assert.ok(r.profils);
  assert.deepEqual(r.auteur,[],'plus aucun emplacement d’auteur : les trois derniers noms sont ceux d’Anthony');
  assert.deepEqual(r.connus,['Split',...r.ext,'Knuckle Gate','Pure Impact','Undisputed Cage'],'Split, les quatre noms du code, puis les trois d’Anthony dans l’ordre'); assert.equal(r.premier,'Split');
});

test('Organisations — « Choisis une partie » : Entrée sur un emplacement vide ouvre le choix, jamais la partie', () => {
  const win=newGameWindow({runMain:true});
  win.eval(`setSeed(5); CL.mgmtParties();`);
  touche(win,'Enter');
  assert.equal(win.eval('G.screen'),'mgmt_nouvelle'); assert.equal(win.eval('MGMT_NOUVELLE.slot'),1);
  assert.equal(win.eval('mgmtSlotPeek(1)'),null,'rien n’est créé tant qu’on ne l’a pas décidé');
  touche(win,'Escape'); assert.equal(win.eval('G.screen'),'mgmt_parties','Échap revient aux emplacements');
  win.eval(`setSeed(5); CL.mgmtEnter(1); saveMgmt(); CL.mgmtLeave(); CL.mgmtParties();`);
  touche(win,'Enter'); assert.equal(win.eval('G.screen'),'mgmt_bureau','un emplacement occupé se reprend');
});

test('Organisations — l’écran : huit organisations, la choisie marquée, « Créer ton organisation » visible et sans effet', () => {
  const win=newGameWindow({runMain:true});
  const r=result(win,`setSeed(5); CL.mgmtNouvelle(3);
    const t=document.getElementById('app').textContent;
    const cartes=[...document.querySelectorAll('.mf-org')].map(c=>({nom:c.querySelector('.mf-org-nom').textContent,choisie:c.classList.contains('choisie'),texte:c.textContent}));
    const avenir=document.querySelector('.mf-org-avenir');
    const avant=G.screen; avenir.click(); const apres=G.screen;
    return {cartes,t,avenir:avenir.textContent,avenirDisabled:avenir.getAttribute('aria-disabled'),avant,apres,bouton:document.querySelectorAll('.mf-bouton.jaune').length,slot:MGMT_NOUVELLE.slot};`);
  assert.equal(r.cartes.length,8); assert.equal(r.cartes.filter(c=>c.choisie).length,1); assert.equal(r.cartes[0].nom,'Split'); assert.ok(r.cartes[0].choisie);
  assert.ok(r.cartes[0].texte.includes('Une caisse saine')&&r.cartes[0].texte.includes('Peu connue hors de sa région'));
  assert.ok(r.t.includes('Le jeu crée tout le reste pour cette partie : les combattants, les camps, les salles, la presse, ton assistante.'));
  assert.ok(r.t.includes('Emplacement 3 · 8 organisations')&&r.t.includes('Nouvelle partie · choisis ton organisation'));
  assert.ok(r.avenir.includes('Créer ton organisation')&&r.avenir.includes('À venir')); assert.equal(r.avenirDisabled,'true');
  assert.equal(r.apres,r.avant,'« Créer ton organisation » n’ouvre rien'); assert.equal(r.bouton,1,'un seul bouton jaune');
});

test('Organisations — au clavier : la grille se parcourt, Entrée crée la partie de l’organisation choisie dans l’emplacement', () => {
  const win=newGameWindow({runMain:true});
  win.eval(`setSeed(7); CL.mgmtNouvelle(2);`);
  touche(win,'ArrowRight'); assert.equal(win.eval('MGMT_NOUVELLE.i'),1);
  touche(win,'ArrowDown'); assert.equal(win.eval('MGMT_NOUVELLE.i'),5,'une rangée de quatre plus bas');
  touche(win,'ArrowUp'); assert.equal(win.eval('MGMT_NOUVELLE.i'),1);
  touche(win,'ArrowLeft'); touche(win,'ArrowLeft'); assert.equal(win.eval('MGMT_NOUVELLE.i'),7,'on fait le tour');
  win.eval(`MGMT_NOUVELLE.i=1;`); touche(win,'Enter');
  const r=result(win,`return {ecran:G.screen,slot:MGMT_SLOT,org:G.mgmt.org,disque:mgmtSlotPeek(2).org,un:mgmtSlotPeek(1),caisse:G.mgmt.treasury,
    lignes:G.mgmt.roster.every(o=>o.org==='Garden of Blood'),valide:validateMgmt(JSON.parse(JSON.stringify(G.mgmt)))};`);
  assert.equal(r.ecran,'mgmt_bureau'); assert.equal(r.slot,2); assert.equal(r.org,'Garden of Blood'); assert.equal(r.disque,'Garden of Blood');
  assert.equal(r.un,null,'les autres emplacements ne bougent pas'); assert.ok(r.lignes); assert.ok(r.valide); assert.equal(r.caisse,45,'la caisse de départ du profil');
});

test('Organisations — deux parties de la même organisation : deux effectifs différents ; même graine, même effectif', () => {
  const win=newGameWindow();
  const r=result(win,`const cree=(seed,org)=>{ setSeed(seed); const m=mgmtDefault(org); mgmtNewRoster(m); return m.roster.map(o=>o.name+'|'+o.W+'-'+o.L+'|'+o.age+'|'+o.niv).join(';'); };
    return {a:cree(11,'garden-of-blood'),b:cree(12,'garden-of-blood'),c:cree(11,'garden-of-blood'),d:cree(11,'organisation-6')};`);
  assert.notEqual(r.a,r.b,'deux graines, deux effectifs'); assert.equal(r.a,r.c,'deux créations de même graine donnent le même effectif');
  assert.notEqual(r.a,r.d,'une autre organisation, un autre monde');
});

test('Organisations — le monde correspond au profil : la caisse, la taille, l’âge, les catégories fortes et faibles', () => {
  const win=newGameWindow();
  const r=result(win,`const moy=a=>a.reduce((x,y)=>x+y,0)/a.length;
    const stat=org=>{ const tailles=[],ages=[],fem=[],lourds=[],niveauF=[],niveauH=[]; let caisse=0;
      for(let s=1;s<=30;s++){ setSeed(s*13); const m=mgmtDefault(org); caisse=m.treasury; mgmtNewRoster(m);
        tailles.push(m.roster.length); ages.push(moy(m.roster.map(o=>o.age)));
        fem.push(m.roster.filter(o=>divById(o.div).gender==='F').length/m.roster.length); lourds.push(m.roster.filter(o=>o.div==='H-heavy'||o.div==='H-lheavy').length/m.roster.length);
        niveauF.push(moy(m.roster.filter(o=>divById(o.div).gender==='F').map(o=>o.niv))); niveauH.push(moy(m.roster.filter(o=>divById(o.div).gender==='H').map(o=>o.niv))); }
      return {caisse,taille:moy(tailles),age:moy(ages),fem:moy(fem),lourds:moy(lourds),nF:moy(niveauF),nH:moy(niveauH)}; };
    return {split:stat('split'),riche:stat('organisation-7'),fragile:stat('mma-korner'),jeune:stat('ultimate-rim'),vieux:stat('fighting-pacific-championship'),
      femmes:stat('organisation-6'),lourds:stat('organisation-8')};`);
  assert.ok(r.riche.caisse>r.split.caisse&&r.split.caisse>r.fragile.caisse,'une caisse fragile démarre avec moins qu’une organisation riche');
  assert.ok(r.fragile.taille<r.split.taille*0.9&&r.jeune.taille<r.split.taille*0.85,'un effectif mince'); assert.ok(r.split.taille>=130&&r.split.taille<=150);
  assert.ok(r.jeune.age<r.split.age-2&&r.vieux.age>r.split.age+2,'jeunes combattants, effectif vieillissant');
  assert.ok(r.femmes.fem>r.split.fem+0.15,'les meilleures combattantes : plus de femmes'); assert.ok(r.femmes.nF>r.femmes.nH,'et mieux classées que les hommes');
  assert.ok(r.lourds.lourds>r.split.lourds+0.05,'les meilleurs poids lourds : plus de lourds');
});

test('Organisations — une partie commencée ailleurs que chez Split n’affiche jamais « Split » comme organisation du joueur', () => {
  const win=newGameWindow({runMain:true});
  const r=result(win,`setSeed(8); CL.mgmtEnter(1,'garden-of-blood'); const m=G.mgmt;
    const lib=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o)&&o.div===m.roster[0].div);
    m.card.main=[{a:lib[0].id,b:lib[1].id,cycle:m.cycle,slot:'main'}]; saveMgmt();
    const textes={};
    for(const e of ['mgmt_bureau','mgmt_carte','mgmt_vestiaire','mgmt_recrutement','mgmt_classements','mgmt_organisation']){ G.screen=e; render(); textes[e]=document.getElementById('app').textContent; }
    CL.mgmtLeave(); textes.accueil=document.getElementById('app').textContent;
    CL.mgmtParties(); textes.parties=document.getElementById('app').textContent;
    const trace=mgmtExteriorTrace(m.exterieur[0],m.cycle);
    return {textes,org:m.org,ext:mgmtExtOrgs(m),tout:Object.entries(textes).map(([k,v])=>[k,(v.match(/Split/g)||[]).length])};`);
  assert.equal(r.org,'Garden of Blood'); assert.deepEqual(r.ext,['Split','MMA Korner','Ultimate Rim','Fighting Pacific Championship'],'Split prend la place sur l’échelle des autres');
  for(const [k,n] of r.tout){
    const t=r.textes[k];
    assert.ok(!/Split — Management|Split \d|de Split|chez Split|Le monde autour de Split|rejoint Split|Effectif Split|Activité Split/.test(t),`${k} : jamais Split comme organisation du joueur`);
  }
  assert.ok(r.textes.parties.includes('Garden of Blood Fight Night'),'« Choisis une partie » nomme l’organisation choisie');
  assert.ok(r.textes.accueil.includes('GARDEN OF BLOOD FIGHT')||r.textes.accueil.includes('GARDEN OF BLOOD'),'l’affiche nomme l’organisation choisie');
});

test('Organisations — les paroles et la presse disent l’organisation jouée ; une partie d’avant garde Split et son monde', () => {
  const win=newGameWindow();
  const r=result(win,`setSeed(9); const m=mgmtDefault('mma-korner'); mgmtNewRoster(m); mgmtExteriorEnsure(m); mgmtNewPile(m); G={theme:'dark',mgmt:m,screen:'mgmt_bureau'}; m.cycle=10;
    const [X,Y]=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o));
    m.card.main=[{a:X.id,b:Y.id,cycle:10,slot:'main'}];
    const vus=[]; for(let c=1;c<=40;c++){ m.cycle=c; m.card.main[0].cycle=c; mgmtMediasAffiche(m).forEach(x=>vus.push(x.texte)); }
    const voix=[]; for(let c=1;c<=60;c++){ m.cycle=c; const t=mgmtReplique(m,X,'victoire'); if(t) voix.push(t); const u=mgmtReplique(m,X,'annonce'); if(u) voix.push(u); }
    const ancien=JSON.parse(JSON.stringify(mgmtDefaultAvantH4())); ancien.v=13; delete ancien.niveaux;
    return {presse:vus.join(' '),voix:voix.join(' '),ancienOrg:mgmtMigrate(ancien).org,valide:validateMgmt(mgmtMigrate(ancien)),slash:/\\{org\\}/.test(vus.join(' ')+voix.join(' '))};`);
  assert.ok(!/\bSplit\b/.test(r.presse)&&!/\bSplit\b/.test(r.voix),'aucune ligne de presse ni parole ne dit Split'); assert.ok(!r.slash,'aucun emplacement {org} ne reste');
  assert.ok(r.presse.includes('MMA Korner'),'la presse nomme l’organisation jouée');
  assert.equal(r.ancienOrg,'Split'); assert.ok(r.valide);
});

test('Organisations — la validation : un nom d’organisation inconnu est refusé, les huit sont acceptés', () => {
  const win=newGameWindow();
  const r=result(win,`setSeed(3); const ok=[], ko=[];
    for(const o of MGMT_ORGANISATIONS){ const m=mgmtDefault(o.id); mgmtNewRoster(m); mgmtExteriorEnsure(m); mgmtNewPile(m); ok.push(validateMgmt(JSON.parse(JSON.stringify(m)))); }
    const m=mgmtDefault('split'); mgmtNewRoster(m); mgmtExteriorEnsure(m); mgmtNewPile(m);
    const c=JSON.parse(JSON.stringify(m)); c.org='Inconnue'; ko.push(validateMgmt(c));
    const d=JSON.parse(JSON.stringify(m)); d.roster[0].org='Inconnue'; ko.push(validateMgmt(d));
    return {ok,ko,defaut:mgmtDefault('nimporte').org};`);
  assert.deepEqual(r.ok,[true,true,true,true,true,true,true,true]); assert.deepEqual(r.ko,[false,false]); assert.equal(r.defaut,'Split');
});
