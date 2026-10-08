"use strict";
/* Reprise de fidélité du 07/10/2026 : le mouvement de la planche « Le mouvement de l'interface » — l'arrivée, le passage en bande, le choix, l'onglet,
   le défilé, la validation, la voix. Le harnais n'a pas d'API d'animation : on en pose une fausse qui note chaque geste (élément, images, durée, délai, courbe). */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const jouer=require('./helpers/jouerSoirees');
const attend=ms=>new Promise(r=>setTimeout(r,ms));
const touche=(win,key)=>win.eval(`keysHandle({key:${JSON.stringify(key)},preventDefault(){}})`);

function neuve(){
  const win=newGameWindow({runMain:true});
  win.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(7); CL.mgmtEnter(1);`);
  jouer(win,2,{titre:true});
  win.eval(`const m=G.mgmt; if(!m.cal.prochaines.length) mgmtAgendaPoser(m,m.cal.jour+10,'petite');`);
  return win;
}
/** Une fausse API d'animation : les gestes joués s'accumulent dans window.__gestes. */
function avecAnimation(win){
  win.eval(`window.__gestes=[]; Element.prototype.animate=function(frames,opts){ window.__gestes.push({el:this,frames:frames,ms:opts.duration,delay:opts.delay,easing:opts.easing}); return {}; };
    HTMLElement.prototype.getClientRects=function(){ return [{}]; };`);
  return win;
}
const gestes=win=>win.eval(`window.__gestes.map(g=>({cls:g.el.className&&g.el.className.baseVal===undefined?g.el.className:'',tag:g.el.tagName,ms:g.ms,delay:g.delay,easing:g.easing,f0:JSON.stringify(g.frames[0]),f1:JSON.stringify(g.frames[g.frames.length-1])}))`);

test('Sans API d\'animation (harnais, vieux navigateur), le mouvement ne fait rien et ne casse rien', () => {
  const win=neuve();
  assert.equal(win.eval(`mgmtAnimOk()`),false);
  win.eval(`CL.go('mgmt_effectif'); CL.go('mgmt_classements');`);
  assert.equal(win.eval(`document.querySelectorAll('.mf-balayage').length`),0);
  assert.equal(win.eval(`document.querySelector('.mf-stage').classList.contains('mf-masque')`),false);
});

test('L\'arrivée : la barre, l\'en-tête, les panneaux et les touches, aux durées et délais de la planche', async () => {
  const win=avecAnimation(neuve());
  win.eval(`CL.go('mgmt_effectif'); MGMT_ANIM.vu=null; render();`);   // premier dessin : l'arrivée seule, sans bande
  const g=gestes(win);
  assert.equal(win.eval(`document.querySelectorAll('.mf-balayage').length`),0,'pas de bande au premier dessin');
  const nav=g.filter(x=>x.tag==='BUTTON'&&/mf-barre-item/.test(x.cls));
  assert.ok(nav.length>=10); assert.equal(JSON.stringify(nav.slice(0,3).map(x=>[x.ms,x.delay])),"[[200,0],[200,16],[200,32]]");
  assert.match(nav[0].f0,/translateX\(-36px\)/);
  const tete=g.find(x=>/mf-entete/.test(x.cls)); assert.equal(JSON.stringify([tete.ms,tete.delay]),"[220,60]"); assert.match(tete.f0,/translateY\(-24px\)/);
  const pan=g.filter(x=>/mf-panneau/.test(x.cls)); assert.ok(pan.length>=2);
  assert.equal(JSON.stringify([pan[0].ms,pan[0].delay,pan[1].delay]),"[340,90,145]"); assert.match(pan[0].easing,/1\.5/,'le léger rebond');
  const touches=g.find(x=>/mf-touches/.test(x.cls)); assert.equal(JSON.stringify([touches.ms,touches.delay]),"[220,300]");
});

test('Le passage d\'un écran à l\'autre : une bande à 45° en 620 ms, l\'écran change à mi-course', async () => {
  const win=avecAnimation(neuve());
  win.eval(`CL.go('mgmt_effectif');`);
  win.eval(`window.__gestes.length=0; CL.go('mgmt_confirmation');`);
  assert.equal(win.eval(`document.querySelectorAll('.mf-balayage [data-m="wipe"]').length`),1,'la bande');
  assert.equal(win.eval(`document.querySelector('.mf-stage').classList.contains('mf-masque')`),true,'le contenu attend la mi-course');
  const bande=gestes(win).find(x=>x.tag==='DIV'&&/translateX\(-5200px\) skewX\(-45deg\)/.test(x.f0));
  assert.ok(bande); assert.equal(bande.ms,620); assert.equal(bande.easing,'linear'); assert.match(bande.f1,/translateX\(3100px\) skewX\(-45deg\)/);
  assert.match(win.eval(`document.querySelector('.mf-balayage').innerHTML`),/E9E6E1[\s\S]*B32A1E[\s\S]*0D0B0B[\s\S]*B32A1E[\s\S]*E9E6E1/,'blanc cassé, rouge, noir, rouge, blanc cassé');
  await attend(340);
  assert.equal(win.eval(`document.querySelector('.mf-stage').classList.contains('mf-masque')`),false,'à mi-course l\'écran apparaît');
  assert.ok(gestes(win).some(x=>/mf-entete|mf-dialogue/.test(x.cls)),'et ses pièces arrivent');
  await attend(400);
  assert.equal(win.eval(`document.querySelectorAll('.mf-balayage').length`),0,'la bande est retirée');
});

test('Choisir dans une liste : la ligne claire arrive en biais en 190 ms, et rien ne bouge si le choix ne change pas', () => {
  const win=avecAnimation(neuve());
  win.eval(`CL.go('mgmt_effectif'); MGMT_ANIM.vu=null; render();`);
  win.eval(`window.__gestes.length=0; render();`);
  assert.equal(gestes(win).filter(x=>/choisie/.test(x.cls)).length,0,'un dessin identique ne rejoue rien');
  touche(win,'ArrowDown');
  const g=gestes(win).filter(x=>/choisie/.test(x.cls));
  assert.equal(g.length,1); assert.equal(g[0].ms,190); assert.match(g[0].f0,/clipPath/); assert.match(g[0].f0,/translateX\(-10px\)/);
});

test('Changer d\'onglet : le contenu glisse de 60 px en 240 ms, l\'onglet se pose avec un léger rebond en 200 ms', () => {
  const win=avecAnimation(neuve());
  win.eval(`CL.mgmtOptions(); MGMT_ANIM.vu=null; render();`);
  win.eval(`window.__gestes.length=0; CL.mgmtOpOnglet('affichage');`);
  const g=gestes(win);
  const contenu=g.find(x=>/mf-op-ls/.test(x.cls)); assert.ok(contenu); assert.equal(contenu.ms,240); assert.match(contenu.f0,/translateX\(60px\)/);
  const onglet=g.find(x=>/mf-onglet/.test(x.cls)); assert.ok(onglet); assert.equal(onglet.ms,200); assert.match(onglet.easing,/1\.5/); assert.match(onglet.f0,/translateY\(8px\)/);
  win.eval(`window.__gestes.length=0; CL.mgmtOpOnglet('combat');`);
  assert.match(gestes(win).find(x=>/mf-op-ls/.test(x.cls)).f0,/translateX\(-60px\)/,'en sens inverse, il glisse de l\'autre côté');
});

test('Valider : le bouton jaune s\'enfonce, l\'éclat le traverse, puis l\'action part 240 ms plus tard', async () => {
  const win=avecAnimation(neuve());
  win.eval(`window.__clic=0; document.getElementById('app').innerHTML='<button type="button" class="mf-bouton jaune" onclick="window.__clic++"><span>OK</span></button>'; window.__gestes.length=0;`);
  win.eval(`document.querySelector('.mf-bouton.jaune').click()`);
  assert.equal(win.eval(`window.__clic`),0,'l\'action attend la fin du geste');
  const g=gestes(win);
  const bouton=g.find(x=>/mf-bouton/.test(x.cls)); assert.equal(bouton.ms,200); assert.match(bouton.f0,/scale\(1\)/); assert.match(JSON.stringify(g.map(x=>x.f1)),/scale\(1\)/);
  const eclat=g.find(x=>x.tag==='SPAN'); assert.equal(eclat.ms,260); assert.match(eclat.f1,/translateX\(560px\) skewX\(-45deg\)/);
  await attend(300);
  assert.equal(win.eval(`window.__clic`),1,'l\'action part une fois');
  assert.equal(win.eval(`document.querySelectorAll('.mf-bouton span[aria-hidden]').length`),0,'l\'éclat est retiré');
});

test('La voix : l\'onglet monte en 160 ms, la phrase se déroule de gauche à droite en 300 ms', () => {
  const win=avecAnimation(neuve());
  win.eval(`document.getElementById('app').innerHTML='<div class="mf-stage"><div class="mf-fond"></div>'+mfVoix('Leïla','Mes préliminaires sont prêts.')+'</div>'; window.__gestes.length=0; mgmtAnimApres();`);
  win.eval(`MGMT_ANIM.vu=G.screen; MGMT_ANIM.voix=''; window.__gestes.length=0; mgmtAnimVoix(document.querySelector('.mf-stage'),0);`);
  const g=gestes(win);
  const qui=g.find(x=>/mf-voix-qui/.test(x.cls)), bulle=g.find(x=>/mf-voix-bulle/.test(x.cls));
  assert.equal(qui.ms,160); assert.match(qui.f0,/translateY\(14px\)/);
  assert.equal(bulle.ms,300); assert.equal(bulle.delay,110); assert.match(bulle.f0,/inset\(0 100% 0 0\)/);
});

test('Le réglage « Mouvement de l\'interface » coupe tout : ni bande ni arrivée', () => {
  const win=avecAnimation(neuve());
  win.eval(`mgmtReglagesChanger('affichage','mouvement',false); CL.go('mgmt_effectif'); window.__gestes.length=0; CL.go('mgmt_classements');`);
  assert.equal(win.eval(`mgmtAnimOk()`),false);
  assert.equal(win.eval(`document.querySelectorAll('.mf-balayage').length`),0);
  assert.equal(win.eval(`window.__gestes.length`),0);
  assert.ok(win.eval(`MGMT_REGLAGES.affichage.mouvement===false&&MGMT_REGLAGES_ORIGINE.affichage.mouvement===true`),'oui d\'origine');
});

test('Le défilé du calendrier : les cartes glissent de 170 px, l\'une après l\'autre, dans le sens du déplacement', () => {
  const win=avecAnimation(neuve());
  win.eval(`CL.go('mgmt_calendrier'); MGMT_ANIM.vu=null; render();`);
  win.eval(`window.__gestes.length=0; CL.mgmtCalendrierVa(1);`);
  const g=gestes(win).filter(x=>x.ms===320);
  assert.ok(g.length>=1,'des cartes glissent'); assert.match(g[0].f0,/translateX\(170px\)/);
  win.eval(`window.__gestes.length=0; CL.mgmtCalendrierVa(-1);`);
  assert.match(gestes(win).filter(x=>x.ms===320)[0].f0,/translateX\(-170px\)/);
});

test('Entre deux sections de la barre : ni bande ni arrivée des pièces, un fondu bref (décision d’Anthony du 08/10/2026 : le grand mouvement ne sert qu’aux étapes importantes)', () => {
  const win=avecAnimation(neuve());
  win.eval(`CL.go('mgmt_effectif');`);
  win.eval(`window.__gestes.length=0; CL.go('mgmt_classements');`);
  assert.equal(win.eval(`document.querySelectorAll('.mf-balayage').length`),0,'pas de bande');
  assert.equal(win.eval(`document.querySelector('.mf-stage').classList.contains('mf-masque')`),false,'rien ne masque l’écran');
  assert.ok(!gestes(win).some(x=>/mf-entete|mf-panneau/.test(x.cls)),'les pièces ne rejouent pas leur arrivée');
  assert.ok(gestes(win).some(x=>x.ms===90),'un fondu de 90 ms');
});
