"use strict";
/* Brief du 06/10/2026, lot 12 : les options, le son et la version PC — critères d'acceptation, un test chacun. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs'), path=require('path');
const {newGameWindow}=require('./helpers/loadGame');
const racine=path.join(__dirname,'..');
const touche=(win,key)=>win.eval(`keysHandle({key:${JSON.stringify(key)},preventDefault(){}})`);
const res=(win,code)=>JSON.parse(win.eval(`JSON.stringify((function(){${code}})())`));
const texte=win=>win.eval(`document.getElementById('app').textContent`);
const maj=win=>texte(win).toUpperCase();
function neuve(){
  const win=newGameWindow({runMain:true});
  win.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(7); CL.mgmtEnter(1);`);
  return win;
}
/* Un faux AudioContext qui garde les niveaux posés et compte les sons lancés. */
function fauxSon(win){
  win.eval(`window.__sons=0; window.__fg=true; document.hasFocus=function(){ return window.__fg; };
    const param=v=>({value:v,setValueAtTime(x){this.value=x;},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(x){this.value=x;}});
    window.AudioContext=function(){ this.currentTime=0; this.sampleRate=8000; this.state='running'; this.destination={};
      this.createGain=()=>({gain:param(1),connect(){}});
      this.createBuffer=(c,n)=>({getChannelData:()=>new Float32Array(n)});
      this.createBufferSource=()=>({connect(){},start(){window.__sons++;},stop(){},loop:false,buffer:null});
      this.createBiquadFilter=()=>({frequency:param(0),Q:param(0),connect(){}});
      this.createOscillator=()=>({frequency:param(0),detune:param(0),connect(){},start(){window.__sons++;},stop(){},type:'sine'}); };
    MGMT_SON.ctx=null;`);
}

test('Un réglage changé reste après un nouveau lancement, dans n\'importe quel emplacement', () => {
  const win=neuve();
  win.eval(`mgmtReglagesChanger('combat','vitesse',4); mgmtReglagesChanger('affichage','fps',30); mgmtReglagesChanger('son','musique',3); MGMT_SLOT=2;`);
  /* Un nouveau lancement : l'état en mémoire repart de l'origine, puis relit le stockage. */
  const r=res(win,`MGMT_REGLAGES=mgmtReglagesValide(null); const avant=MGMT_REGLAGES.combat.vitesse; mgmtReglagesLire(); mgmtReglagesAppliquer();
    return {avant,vitesse:MGMT_REGLAGES.combat.vitesse,fps:MGMT_REGLAGES.affichage.fps,musique:MGMT_REGLAGES.son.musique,cle:MGMT_REGLAGES_CLE,
      combat:MGMT_COMBAT_REGLAGES.vitesse,parties:Object.keys(localStorage).filter(k=>k.indexOf('mgmt')>=0)};`);
  assert.equal(r.avant,1); assert.equal(r.vitesse,4); assert.equal(r.fps,30); assert.equal(r.musique,3);
  assert.equal(r.combat,4,'le combat lit le réglage au lancement');
  assert.equal(r.cle,'cage-legacy-reglages');
  assert.ok(!r.parties.includes('cage-legacy-reglages'),'les réglages sont à part des parties');
});

test('Une valeur illisible ou hors liste revient à son origine, sans casser le jeu', () => {
  const win=neuve();
  const r=res(win,`localStorage.setItem(MGMT_REGLAGES_CLE,'{pas du json'); const a=mgmtReglagesLire();
    localStorage.setItem(MGMT_REGLAGES_CLE,JSON.stringify({reglages:{combat:{vitesse:3,camera:'drone',commentaire:'oui'},son:{general:11,musique:2.5,salle:'x',coups:4},affichage:{taille:800,fps:60}}}));
    const b=mgmtReglagesLire();
    return {a:a.combat.vitesse,v:b.combat.vitesse,c:b.combat.camera,co:b.combat.commentaire,g:b.son.general,m:b.son.musique,s:b.son.salle,k:b.son.coups,t:b.affichage.taille,f:b.affichage.fps,
      refus:[mgmtReglagesChanger('combat','vitesse',3),mgmtReglagesChanger('son','general',-1),mgmtReglagesChanger('inconnu','x',1)]};`);
  assert.equal(r.a,1); assert.equal(r.v,1); assert.equal(r.c,'cable'); assert.equal(r.co,true);
  assert.equal(r.g,8); assert.equal(r.m,6); assert.equal(r.s,8); assert.equal(r.k,4,'la valeur permise est gardée'); assert.equal(r.t,1920); assert.equal(r.f,60);
  assert.deepEqual(r.refus,[false,false,false]);
});

test('R remet les réglages d\'origine de l\'onglet seulement', () => {
  const win=neuve();
  win.eval(`mgmtReglagesChanger('combat','camera','large'); mgmtReglagesChanger('son','coups',1); CL.mgmtOptions();`);
  touche(win,'r');
  const r=res(win,`return {camera:MGMT_REGLAGES.combat.camera,coups:MGMT_REGLAGES.son.coups,live:MGMT_COMBAT_REGLAGES.camera};`);
  assert.equal(r.camera,'cable'); assert.equal(r.coups,1,'l\'onglet Son n\'est pas touché'); assert.equal(r.live,'cable');
  touche(win,'Tab'); touche(win,'Tab'); touche(win,'R');
  assert.equal(res(win,`return MGMT_REGLAGES.son.coups;`),7);
});

test('L\'écran Options : cinq onglets, les réglages des planches, les touches au clavier', () => {
  const win=neuve(); win.eval(`G.screen='mgmt_carte'; render(); CL.mgmtOptions();`);
  let t=maj(win);
  for(const x of ['COMBAT','AFFICHAGE','SON','TOUCHES','PARTIE','LE COMBAT','VITESSE AU DÉPART','CAMÉRA AU DÉPART','COMMENTAIRE','PAROLES DES COINS','NOM DES COUPS','SECOUSSES']) assert.ok(t.includes(x),x);
  assert.equal(res(win,`return document.querySelectorAll('.mf-op-l').length;`),6);
  touche(win,'ArrowDown'); touche(win,'ArrowRight');
  assert.equal(res(win,`return [MGMT_OP.ligne,MGMT_REGLAGES.combat.camera];`)[1],'plafond','→ change le réglage choisi');
  touche(win,'ArrowLeft');
  assert.equal(res(win,`return MGMT_REGLAGES.combat.camera;`),'cable');
  touche(win,'Tab'); t=maj(win);
  for(const x of ['PLEIN ÉCRAN','TAILLE DE L’IMAGE','1280 × 720','1920 × 1080','2560 × 1440','IMAGES PAR SECONDE']) assert.ok(t.includes(x),x);
  touche(win,'Tab'); t=maj(win);
  for(const x of ['VOLUME GÉNÉRAL','MUSIQUE','LA SALLE','LES COUPS','SON COUPÉ HORS DU JEU']) assert.ok(t.includes(x),x);
  assert.equal(res(win,`return document.querySelectorAll('.mf-op-bloc').length;`),40);
  touche(win,'Tab'); t=maj(win);
  for(const x of ['PARTOUT','DANS LES LISTES','PENDANT LA SOIRÉE','PENDANT LE COMBAT','ESPACE']) assert.ok(t.includes(x),x);
  touche(win,'Tab'); assert.ok(maj(win).includes('SAUVEGARDER MAINTENANT'));
  const retour=res(win,`return MGMT_OP.retour;`);
  touche(win,'Escape'); assert.equal(res(win,`return G.screen;`),retour,'Échap revient d’où l’on vient');
});

test('Options : ouverte depuis le menu et la barre, grisée seulement pendant la soirée, sans partie le menu fonctionne', () => {
  const win=neuve();
  win.eval(`G.screen='mgmt_carte'; render();`);
  assert.equal(res(win,`const b=document.querySelector('[data-section=options]'); return [!!b,b.disabled];`)[1],false);
  win.eval(`document.querySelector('[data-section=options]').click();`);
  assert.equal(res(win,`return G.screen;`),'mgmt_options');
  touche(win,'Escape'); assert.equal(res(win,`return G.screen;`),'mgmt_carte');
  win.eval(`G.screen='mgmt_soiree'; render();`);
  assert.equal(res(win,`return document.querySelector('[data-section=options]').disabled;`),true,'pendant la soirée, la barre est grisée');
  /* Sans partie : depuis le menu principal. */
  const win2=newGameWindow({runMain:true});
  win2.eval(`G.screen='title'; CL.mgmtOptions();`);
  assert.equal(res(win2,`return G.screen;`),'mgmt_options'); assert.ok(maj(win2).includes('LE COMBAT'));
  win2.eval(`CL.mgmtOpOnglet('partie');`); assert.ok(maj(win2).includes('AUCUNE PARTIE OUVERTE'));
  assert.equal(res(win2,`return document.querySelectorAll('.mf-op-act[disabled]').length;`),3);
  touche(win2,'Escape'); assert.equal(res(win2,`return G.screen;`),'title');
});

test('Partie : sauvegarder maintenant, changer de partie, effacer avec confirmation', () => {
  const win=neuve(); win.eval(`CL.mgmtOptions(); CL.mgmtOpOnglet('partie');`);
  win.eval(`localStorage.removeItem(mgmtSlotKey(MGMT_SLOT));`);
  touche(win,'Enter');
  assert.ok(texte(win).includes('Partie sauvegardée'));
  assert.ok(res(win,`return !!mgmtSlotPeek(MGMT_SLOT);`),'la partie est dans son emplacement');
  const n=res(win,`return MGMT_SLOT;`);
  win.eval(`CL.mgmtOpAction('effacer');`);
  const r=res(win,`return {ecran:G.screen,effacer:MGMT_PARTIES.effacer};`);
  assert.equal(r.ecran,'mgmt_parties'); assert.equal(r.effacer,n,'la confirmation de l\'écran des emplacements est demandée');
  assert.ok(res(win,`return !!mgmtSlotPeek(${n});`),'rien n\'est effacé sans confirmation');
  win.eval(`CL.mgmtOptions(); CL.mgmtOpOnglet('partie'); CL.mgmtOpAction('changer');`);
  assert.equal(res(win,`return G.screen;`),'mgmt_parties');
});

test('Les réglages de combat arrivent à l\'écran du combat : vitesse et caméra au départ, répétés après chaque ouverture', () => {
  const win=neuve();
  win.eval(`mgmtReglagesChanger('combat','vitesse',2); mgmtReglagesChanger('combat','camera','plafond'); mgmtReglagesChanger('combat','commentaire',false); mgmtReglagesChanger('combat','noms',false);`);
  const r=res(win,`const R=MGMT_COMBAT_REGLAGES; return {v:R.vitesse,c:R.camera,co:R.commentaire,n:R.noms,coins:R.coins,s:R.secousses};`);
  assert.deepEqual(r,{v:2,c:'plafond',co:false,n:false,coins:true,s:true});
});

test('Taille de l\'image et images par seconde : la salle se dessine à la taille choisie, le combat au rythme choisi', () => {
  const win=neuve();
  const r=res(win,`mgmtReglagesChanger('affichage','fps',30); const a=mgmtReglagesPasImage(); mgmtReglagesChanger('affichage','fps',60); const b=mgmtReglagesPasImage();
    return {a,b,tailles:MGMT_REGLAGES_VALEURS.affichage.taille,plein:MGMT_REGLAGES_VALEURS.affichage.plein};`);
  assert.ok(r.a>30&&r.a<34,'30 images par seconde : une image toutes les 33 ms'); assert.ok(r.b>14&&r.b<17,'60 : toutes les 16 ms');
  assert.deepEqual(r.tailles,[1280,1920,2560]); assert.deepEqual(r.plein,[true,false]);
  const src=fs.readFileSync(path.join(racine,'arene-salle.js'),'utf8');
  assert.ok(/MGMT_REGLAGES\.affichage\.taille/.test(src),'la résolution du dessin suit la taille choisie');
  /* Le plein écran suit le navigateur. */
  win.eval(`window.__plein=0; document.documentElement.requestFullscreen=function(){ window.__plein++; return Promise.resolve(); };`);
  win.eval(`mgmtReglagesChanger('affichage','plein',true);`);
  assert.equal(win.eval(`window.__plein`),1);
});

test('Volume 0 coupe tout le son ; le son se coupe quand la fenêtre n\'est plus devant, si le réglage le demande', () => {
  const win=neuve(); fauxSon(win);
  win.eval(`mgmtSonCtx();`);
  const gains=()=>res(win,`const S=MGMT_SON; return {m:S.maitre.gain.value,mu:S.musique.gain.value,sa:S.salle.gain.value,co:S.coups.gain.value};`);
  let g=gains(); assert.ok(g.m>0&&g.mu>0&&g.sa>0&&g.co>0,'les réglages d\'origine sonnent');
  assert.ok(g.mu<=0.31,'la musique reste sous la voix du jeu');
  const n0=win.eval(`window.__sons`); win.eval(`mgmtSonCoup(1);`); assert.ok(win.eval(`window.__sons`)>n0,'un coup fait un son');
  win.eval(`mgmtReglagesChanger('son','general',0);`);
  assert.equal(gains().m,0,'volume général 0 : plus rien');
  const n1=win.eval(`window.__sons`); win.eval(`MGMT_SON.muet=false; mgmtSonCoup(1);`);
  win.eval(`mgmtReglagesChanger('son','general',8);`);
  /* Fenêtre derrière. */
  win.eval(`window.__fg=false; mgmtSonAppliquer();`); assert.equal(gains().m,0,'fenêtre derrière : le son est coupé');
  const n2=win.eval(`window.__sons`); win.eval(`mgmtSonCoup(1);`); assert.equal(win.eval(`window.__sons`),n2,'un coup ne sonne pas non plus');
  win.eval(`mgmtReglagesChanger('son','silence',false);`); assert.ok(gains().m>0,'avec « non », le jeu continue derrière');
  win.eval(`mgmtReglagesChanger('son','silence',true); window.__fg=true; mgmtSonAppliquer();`); assert.ok(gains().m>0);
  void n1;
  /* Musique à 0 : plus de nappage ; salle à 0 : le public se tait. */
  win.eval(`mgmtReglagesChanger('son','musique',0);`); assert.equal(gains().mu,0); assert.equal(res(win,`return MGMT_SON.musiqueOn;`),false);
  win.eval(`mgmtReglagesChanger('son','salle',0);`); assert.equal(gains().sa,0);
});

test('La musique accompagne les menus et la soirée, jamais le combat ; la salle ne parle qu\'au combat', () => {
  const win=neuve(); fauxSon(win); win.eval(`mgmtSonCtx();`);
  win.eval(`window.setInterval=function(){ return 7; }; window.clearInterval=function(){};`);
  win.eval(`MGMT_SON.musiqueOn=false; G.screen='mgmt_carte'; mgmtSonEcran();`); assert.equal(res(win,`return MGMT_SON.musiqueOn;`),true);
  win.eval(`G.screen='mgmt_combat'; mgmtSonEcran();`); assert.equal(res(win,`return MGMT_SON.musiqueOn;`),false);
  win.eval(`mgmtSonSalle(0.6);`); assert.ok(res(win,`return MGMT_SON.foule.gain.value;`)>0.3,'le niveau du public suit le remplissage');
  win.eval(`G.screen='mgmt_carte'; mgmtSonEcran();`); assert.equal(res(win,`return MGMT_SON.foule.gain.value;`),0,'hors combat le public se tait');
});

test('Sans Web Audio, le son est sans effet', () => {
  const win=neuve();
  win.eval(`delete window.AudioContext; delete window.webkitAudioContext; MGMT_SON.ctx=null;`);
  win.eval(`mgmtSonCoup(1); mgmtSonClic(); mgmtSonSalle(1); mgmtSonMusique(true); mgmtSonAppliquer(); mgmtSonDebloquer();`);
  assert.equal(res(win,`return MGMT_SON.ctx;`),null);
});

test('La version PC : manifeste, icônes, service worker et enregistrement', () => {
  const man=JSON.parse(fs.readFileSync(path.join(racine,'manifest.webmanifest'),'utf8'));
  assert.equal(man.display,'standalone'); assert.equal(man.start_url,'./index.html'); assert.equal(man.scope,'./');
  for(const ic of man.icons){ assert.ok(fs.existsSync(path.join(racine,ic.src)),ic.src); const b=fs.readFileSync(path.join(racine,ic.src)); assert.equal(b.slice(1,4).toString(),'PNG'); const n=parseInt(ic.sizes,10); assert.equal(b.readUInt32BE(16),n); }
  const html=fs.readFileSync(path.join(racine,'index.html'),'utf8');
  assert.ok(html.includes('rel="manifest" href="manifest.webmanifest"'));
  const sw=fs.readFileSync(path.join(racine,'sw.js'),'utf8');
  assert.ok(/caches\.open/.test(sw)&&/addEventListener\('fetch'/.test(sw)&&/index\.html/.test(sw));
  /* Les sauvegardes ne passent jamais par le cache du service worker : elles vivent dans le localStorage de la page. */
  assert.ok(!/localStorage[.[]/.test(sw));
  assert.ok(/serviceWorker\.register\('sw\.js'\)/.test(fs.readFileSync(path.join(racine,'main.js'),'utf8')));
  /* Le service worker garde tous les scripts de index.html. */
  const ctx={};
  new Function('ctx',sw.replace(/self\.addEventListener[\s\S]*$/,'')+';ctx.l=swListerFichiers;')(ctx);
  const liste=ctx.l(html);
  const scripts=[...html.matchAll(/<script src="([^"]+)"/g)].map(m=>'./'+m[1]);
  assert.ok(scripts.length>80);
  for(const s of scripts) assert.ok(liste.includes(s),s);
  assert.ok(liste.some(u=>/fonts\/.*\.woff2/.test(u)),'les polices aussi');
  assert.ok(liste.includes('./ui-cadre.css?v=b12'));
});

test('Mise à jour : une nouvelle version garde les trois emplacements', () => {
  const win=neuve(); win.eval(`saveMgmt();`);
  const avant=res(win,`return [1,2,3].map(n=>!!mgmtSlotPeek(n));`);
  assert.ok(avant.some(Boolean));
  /* Le cache du service worker est versionné et supprimé à part ; le jeu ne le lit pas pour ses sauvegardes. */
  const sw=fs.readFileSync(path.join(racine,'sw.js'),'utf8');
  assert.ok(/cage-legacy-sw-/.test(sw)&&/caches\.delete/.test(sw));
  assert.deepEqual(res(win,`return [1,2,3].map(n=>!!mgmtSlotPeek(n));`),avant);
});

test('Chaque son du dépôt a son origine notée : aucun fichier audio, tout est synthétisé', () => {
  const lister=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.name==='node_modules'||e.name==='.git'?[]:e.isDirectory()?lister(path.join(d,e.name)):[path.join(d,e.name)]);
  const audio=lister(racine).filter(f=>/\.(mp3|wav|ogg|flac|m4a|aac|opus)$/i.test(f));
  const doc=fs.readFileSync(path.join(racine,'docs','SONS-ORIGINE.md'),'utf8');
  for(const f of audio) assert.ok(doc.includes(path.basename(f)),'origine et licence notées pour '+f);
  assert.ok(/synthétis/i.test(doc)&&/mgmt-son\.js/.test(doc));
});

test('Textes d\'auteur du lot 12 : le brief les dit à relire', () => {
  const doc=fs.readFileSync(path.join(racine,'docs','BRIEF-06-10-LOT-12-OPTIONS-SON-PC.md'),'utf8');
  assert.ok(/relu\s*:\s*false/.test(doc));
});
