"use strict";
/* Brief du 06/10/2026, lot 1 : les trois emplacements. L'emplacement 1 garde la
   clé historique ; changer d'emplacement vide la partie en mémoire et l'état
   d'interface ; le registre vit hors de la partie. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
function result(win,code){ return JSON.parse(win.eval(`JSON.stringify((function(){${code}})())`)); }
const touche=(win,key)=>win.eval(`keysHandle({key:${JSON.stringify(key)},preventDefault(){}})`);

test('Emplacements — une partie d’avant le lot se retrouve dans l’emplacement 1, au même cycle et à la même caisse', () => {
  const win=newGameWindow({runMain:true});
  const r=result(win,`
    setSeed(5); const m=mgmtDefault(); mgmtNewRoster(m); mgmtNewPile(m); m.cycle=7; m.treasury=123; m.eventsPlayed=6;
    localStorage.setItem('cage-legacy-mgmt',JSON.stringify(m));
    const avant=localStorage.getItem('cage-legacy-mgmt');
    const peek=mgmtSlotPeek(1); const intact=localStorage.getItem('cage-legacy-mgmt')===avant&&localStorage.getItem(MGMT_REGISTRE_KEY)===null;
    CL.mgmtEnter();
    return {cle:mgmtSlotKey(1),secours:mgmtSlotBackupKey(1),peek:[peek.cycle,peek.treasury],intact,slot:MGMT_SLOT,cycle:G.mgmt.cycle,caisse:G.mgmt.treasury,
      v:MGMT_SAVE_VERSION,vides:[mgmtSlotPeek(2),mgmtSlotPeek(3)],dernier:mgmtSlotDernier()};`);
  assert.equal(r.cle,'cage-legacy-mgmt'); assert.equal(r.secours,'cage-legacy-mgmt_backup');
  assert.deepEqual(r.peek,[7,123]); assert.ok(r.intact,'lire un emplacement n’écrit rien');
  assert.equal(r.slot,1); assert.equal(r.cycle,7); assert.equal(r.caisse,123); assert.equal(r.v,14,'le lot 1 ne change pas le format : la version est celle du lot 2 (14)');
  assert.deepEqual(r.vides,[null,null]); assert.equal(r.dernier,1);
});

test('Emplacements — jouer dans le 2 ne change rien au 1 ; aller-retour : chaque partie intacte ; l’état d’interface ne passe pas', () => {
  const win=newGameWindow({runMain:true});
  const r=result(win,`
    setSeed(5); CL.mgmtEnter(1); G.mgmt.treasury=111; saveMgmt();
    const un=localStorage.getItem(mgmtSlotKey(1));
    MGMT_CART.pick=G.mgmt.roster[0].id; MGMT_FICHE.id=G.mgmt.roster[0].id; MGMT_VESTIAIRE.page=3; MGMT_PROPOSITION={c:G.mgmt.cycle,lignes:[{name:'x',texte:'y'}]};
    const idUn=G.mgmt.roster[0].name;
    setSeed(99); CL.mgmtEnter(2);
    const raz={pick:MGMT_CART.pick,fiche:MGMT_FICHE.id,page:MGMT_VESTIAIRE.page,prop:MGMT_PROPOSITION.lignes.length};
    G.mgmt.treasury=222; const valide=validateMgmt(G.mgmt); saveMgmt(); saveMgmt();
    const unApres=localStorage.getItem(mgmtSlotKey(1));
    const deux=localStorage.getItem(mgmtSlotKey(2));
    CL.mgmtEnter(1); const retour1=[G.mgmt.treasury,G.mgmt.roster[0].name===idUn,MGMT_SLOT];
    CL.mgmtEnter(2); const retour2=[G.mgmt.treasury,valide,MGMT_SLOT];
    return {memeUn:un===unApres,raz,retour1,retour2,cles:[mgmtSlotKey(2),mgmtSlotBackupKey(2),mgmtSlotKey(3)],secours2:!!localStorage.getItem(mgmtSlotBackupKey(2)),
      deuxIntact:deux===localStorage.getItem(mgmtSlotKey(2)),dernier:mgmtRegistre().dernier,trois:mgmtSlotPeek(3)};`);
  assert.ok(r.memeUn,'l’emplacement 1 n’a pas bougé pendant qu’on jouait dans le 2');
  assert.deepEqual(r.raz,{pick:null,fiche:null,page:0,prop:0},'les états d’interface repartent de zéro');
  assert.deepEqual(r.retour1,[111,true,1]); assert.deepEqual(r.retour2,[222,true,2]);
  assert.deepEqual(r.cles,['cage-legacy-mgmt-2','cage-legacy-mgmt-2_backup','cage-legacy-mgmt-3']); assert.ok(r.secours2,'le 2 a son propre secours');
  assert.equal(r.dernier,2); assert.equal(r.trois,null);
});

test('Emplacements — une sauvegarde abîmée laisse le secours du MÊME emplacement prendre le relais', () => {
  const win=newGameWindow({runMain:true});
  const r=result(win,`
    setSeed(5); CL.mgmtEnter(1); G.mgmt.treasury=10; saveMgmt();
    CL.mgmtEnter(2); G.mgmt.treasury=77; saveMgmt(); saveMgmt();
    localStorage.setItem(mgmtSlotKey(2),'corrompu');
    CL.mgmtEnter(1); const peek=mgmtSlotPeek(2).treasury;
    CL.mgmtEnter(2);
    return {peek,caisse:G.mgmt.treasury,repare:!!mgmtParseAndValidate(localStorage.getItem(mgmtSlotKey(2)))};`);
  assert.equal(r.peek,77); assert.equal(r.caisse,77,'le secours du 2, pas la partie du 1'); assert.ok(r.repare);
});

test('Emplacements — le registre : dernière partie jouée et dates ; absent ou illisible, rien ne plante et la date ne s’affiche pas', () => {
  const win=newGameWindow({runMain:true});
  const r=result(win,`
    setSeed(5); CL.mgmtEnter(2); saveMgmt();
    const reg=mgmtRegistre(); const date=Number.isSafeInteger(reg.dates[2]);
    const champs=Object.keys(G.mgmt).filter(k=>/slot|registre|date/i.test(k));
    CL.mgmtParties(); const avec=document.getElementById('app').textContent.includes('Jouée pour la dernière fois');
    localStorage.setItem(MGMT_REGISTRE_KEY,'{pas du json'); render();
    const html=document.getElementById('app').textContent;
    const sain=mgmtRegistre();
    localStorage.setItem(MGMT_REGISTRE_KEY,JSON.stringify({dernier:9,dates:{2:'hier',1:-4}}));
    return {dernier:reg.dernier,date,champs,avec,sans:!html.includes('Jouée pour la dernière fois'),occupe:html.includes('Soirées jouées'),sain,borne:mgmtRegistre(),
      jours:[mgmtPartieDate(new Date(2026,9,6,10).getTime(),new Date(2026,9,6,22).getTime()),mgmtPartieDate(new Date(2026,9,5,23).getTime(),new Date(2026,9,6,1).getTime()),mgmtPartieDate(new Date(2026,8,24,12).getTime(),new Date(2026,9,6,12).getTime()),mgmtPartieDate(undefined,1)]};`);
  assert.equal(r.dernier,2); assert.ok(r.date); assert.deepEqual(r.champs,[],'rien du registre n’entre dans la partie');
  assert.ok(r.avec); assert.ok(r.sans,'registre illisible : pas de date'); assert.ok(r.occupe,'mais l’emplacement s’affiche');
  assert.deepEqual(r.sain,{dernier:null,dates:{}}); assert.deepEqual(r.borne,{dernier:null,dates:{}});
  assert.deepEqual(r.jours,['Aujourd’hui','Hier','Il y a 12 jours','']);
});

test('Emplacements — l’accueil : Management ouvre « Choisis une partie », Reprendre reprend la dernière partie jouée', () => {
  const win=newGameWindow({runMain:true});
  const vide=win.scr_title();
  assert.ok(vide.includes('onclick="CL.mgmtParties()"')); assert.ok(!vide.includes('title-resume'));
  const r=result(win,`
    setSeed(5); CL.mgmtEnter(1); G.mgmt.treasury=10; saveMgmt();
    CL.mgmtEnter(3); G.mgmt.treasury=30; saveMgmt(); CL.mgmtLeave();
    const titre=scr_title(); const etat=titleMgmtState().treasury;
    document.querySelector('.title-resume').click();
    const repris=[G.screen,MGMT_SLOT,G.mgmt.treasury];
    CL.mgmtLeave(); document.querySelector('.title-management').click();
    return {reprendre:titre.includes('CL.mgmtEnter(mgmtSlotDernier()||1)'),etat,repris,ecran:G.screen,curseur:MGMT_PARTIES.curseur,
      texte:document.getElementById('app').textContent};`);
  assert.ok(r.reprendre); assert.equal(r.etat,30); assert.deepEqual(r.repris,['mgmt_bureau',3,30]);
  assert.equal(r.ecran,'mgmt_parties'); assert.equal(r.curseur,3,'le curseur part de la dernière partie jouée');
  assert.ok(r.texte.includes('Choisis une partie')&&r.texte.includes('3 emplacements'));
});

test('Emplacements — l’écran : un occupé montre l’organisation, la prochaine soirée, les soirées jouées, la caisse ; un vide ne propose que la nouvelle partie', () => {
  const win=newGameWindow({runMain:true});
  const r=result(win,`
    setSeed(5); CL.mgmtEnter(1); G.mgmt.treasury=64; G.mgmt.eventsPlayed=14; saveMgmt(); CL.mgmtLeave(); CL.mgmtParties();
    const cartes=[...document.querySelectorAll('.mf-partie')].map(c=>c.textContent);
    const boutons=()=>[...document.querySelectorAll('.mf-touches button')].map(b=>b.textContent.trim());
    const b1=boutons();
    CL.mgmtPartieCurseur(1); const b2=boutons(); const go2=document.querySelector('.mf-partie.choisi .mf-bouton-t').textContent;
    const jaunes=document.querySelectorAll('.mf-parties .mf-bouton.jaune').length;
    return {cartes,b1,b2,go2,jaunes};`);
  assert.equal(r.cartes.length,3);
  for(const mot of ['Emplacement 1','Split','La prochaine soirée','15','Soirées jouées','14','En caisse','64\u202f000\u00a0€','Reprendre']) assert.ok(r.cartes[0].includes(mot),mot);
  for(const c of [r.cartes[1],r.cartes[2]]){ assert.ok(c.includes('Vide')&&c.includes('Ici, tu peux lancer')&&c.includes('Une nouvelle')&&c.includes('partie')); assert.ok(!c.includes('Reprendre')&&!c.includes('En caisse')); }
  assert.ok(r.b1.some(t=>t.includes('Effacer la partie'))&&r.b1.some(t=>t.includes('Reprendre')));
  assert.ok(!r.b2.some(t=>t.includes('Effacer'))&&!r.b2.some(t=>t.includes('Reprendre')),'un emplacement vide : ni reprise ni effacement');
  assert.equal(r.go2,'Nouvelle partie'); assert.equal(r.jaunes,1,'une seule action principale');
});

test('Emplacements — au clavier seul : flèches, Entrée lance ou reprend, Échap revient à l’accueil', () => {
  const win=newGameWindow({runMain:true});
  win.eval(`setSeed(5); CL.mgmtParties();`);
  assert.equal(win.eval('MGMT_PARTIES.curseur'),1);
  touche(win,'ArrowLeft'); assert.equal(win.eval('MGMT_PARTIES.curseur'),1,'butée à gauche');
  touche(win,'ArrowRight'); touche(win,'ArrowRight'); touche(win,'ArrowRight'); assert.equal(win.eval('MGMT_PARTIES.curseur'),3,'butée à droite');
  touche(win,'ArrowLeft'); touche(win,'Enter');
  /* Brief du 06/10, lot 5 : un emplacement vide ouvre d'abord le choix de l'organisation ; Entrée y crée la partie (Split d'abord). */
  assert.equal(win.eval('G.screen'),'mgmt_nouvelle'); touche(win,'Enter');
  assert.deepEqual(result(win,`return [G.screen,MGMT_SLOT,!!mgmtSlotPeek(2),mgmtSlotPeek(1),G.mgmt.org];`),['mgmt_bureau',2,true,null,'Split'],'un emplacement vide lance une partie, dans le sien');
  win.eval(`CL.mgmtLeave(); CL.mgmtParties();`);
  assert.equal(win.eval('MGMT_PARTIES.curseur'),2);
  touche(win,'Escape'); assert.equal(win.eval('G.screen'),'title');
  assert.ok(!win.document.getElementById('app').classList.contains('mgmt'));
});

test('Emplacements — aucun effacement sans confirmation ; effacer le 2 ne touche ni au 1 ni au 3', () => {
  const win=newGameWindow({runMain:true});
  const r=result(win,`
    setSeed(5); for(const n of [1,2,3]){ CL.mgmtEnter(n); G.mgmt.treasury=n*10; saveMgmt(); saveMgmt(); }
    CL.mgmtLeave(); CL.mgmtParties(); MGMT_PARTIES.curseur=2; render();
    const k=key=>keysHandle({key,preventDefault(){}});
    const un=localStorage.getItem(mgmtSlotKey(1)), trois=localStorage.getItem(mgmtSlotKey(3));
    k('Delete'); const demande=[MGMT_PARTIES.effacer,!!mgmtSlotPeek(2),document.getElementById('app').textContent.includes('EFFACER LA PARTIE ?')];
    k('ArrowRight'); const fige=MGMT_PARTIES.curseur;
    k('Escape'); const annule=[MGMT_PARTIES.effacer,!!mgmtSlotPeek(2),G.screen];
    k('Delete'); k('Enter');
    const apres={deux:mgmtSlotPeek(2),cle:localStorage.getItem(mgmtSlotKey(2)),secours:localStorage.getItem(mgmtSlotBackupKey(2)),
      un:localStorage.getItem(mgmtSlotKey(1))===un,trois:localStorage.getItem(mgmtSlotKey(3))===trois,date:mgmtRegistre().dates[2]===undefined,
      autresDates:!!mgmtRegistre().dates[1]&&!!mgmtRegistre().dates[3],ecran:G.screen,effacer:MGMT_PARTIES.effacer};
    k('Delete'); const vide=MGMT_PARTIES.effacer;
    return {demande,fige,annule,apres,vide};`);
  assert.deepEqual(r.demande,[2,true,true],'Suppr demande, n’efface pas'); assert.equal(r.fige,2);
  assert.deepEqual(r.annule,[0,true,'mgmt_parties'],'Échap garde la partie');
  assert.deepEqual(r.apres,{deux:null,cle:null,secours:null,un:true,trois:true,date:true,autresDates:true,ecran:'mgmt_parties',effacer:0});
  assert.equal(r.vide,0,'rien à effacer dans un emplacement vide');
});

test('Emplacements — effacer l’emplacement actif vide aussi la mémoire : rien ne se réenregistre par-dessus', () => {
  const win=newGameWindow({runMain:true});
  const r=result(win,`
    setSeed(5); CL.mgmtEnter(2); G.mgmt.treasury=42; saveMgmt(); CL.mgmtLeave();
    mgmtSlotEffacer(2); saveMgmt();
    return {mem:G.mgmt,disque:localStorage.getItem(mgmtSlotKey(2)),has:hasMgmt(),dernier:mgmtSlotDernier()};`);
  assert.deepEqual(r,{mem:null,disque:null,has:false,dernier:null});
});
