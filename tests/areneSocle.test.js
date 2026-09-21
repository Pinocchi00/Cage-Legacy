"use strict";
/* CAGE LEGACY — tests/areneSocle.test.js
   ============================================================================
   LOT 3 T2 — LE SOCLE DE L'ARÈNE NEUVE (docs/LOT-3-L-ARENE.md §3 T2 ; vision
   § L'affichage du combat). Couvre :

   - la séparation état/dessin (tâche 1) : l'état de l'arène se calcule
     SANS canvas et SANS accès au DOM — G nul compris ;
   - la cible 1 en échantillon (tâche 4 ; la mesure complète vit dans
     tools/mesure-arene-cible1.js) : sur plusieurs combats réels du moteur,
     à tout instant hors fenêtres de transition, la géométrie des pions dit
     la même chose que la phase du déroulé — un moment au sol n'affiche
     jamais deux pions debout, un clinch jamais deux pions à distance ;
   - le garde-fou du rejeu (tâche 3, relecture de la T1) : une trace
     trafiquée dont l'issue diverge est refusée, rien n'est montré, et
     l'emplacement auteur du refus s'affiche ;
   - la coexistence avec l'ancienne arène (interdit T2) : aucun nom global
     repris, l'ancienne vit toujours.
   ============================================================================ */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

/* Un combat réel du moteur, deux noms, une session d'arène. */
function combatFrais(win,seed){
  return win.eval(`(function(){
    setSeed(${seed});
    const A=makeFighter({div:'H-welter',gender:'H'});
    const B=makeFighter({div:'H-light',gender:'H'});
    const res=simulateFight(A,B,3);
    window.__res=res;
    window.__noms={a:A.name,b:B.name};
    return JSON.stringify({winner:res.winner,method:res.method,
      beats:res.log.length,fin:!!res.log.some(L=>L.finish)});
  })()`);
}

/* ---- Tâche 1 : l'état, sans canvas, sans G -------------------------------- */
test('ARENE socle — l\u2019état se calcule sans canvas et sans jamais lire G', () => {
  const win = newGameWindow();
  const resume = combatFrais(win,777001);
  assert.ok(JSON.parse(resume).beats>0,'le moteur a produit un déroulé');
  const s = JSON.parse(win.eval(`(function(){
    /* G nul : la moindre lecture de G dans l'arène lève ici. */
    G=null;
    const session=areneConstruire(window.__res,window.__noms);
    if(!session) return 'null';
    let n=0, phases={}, horsCage=0;
    for(let t=0;t<session.dureeCombat;t+=0.5){
      const e=areneMoment(session,t);
      n++;
      phases[e.phase]=(phases[e.phase]||0)+1;
      const b1=areneBordDist({x:e.ax,y:e.ay}), b2=areneBordDist({x:e.bx,y:e.by});
      if(b1<-0.01||b2<-0.01) horsCage++;
    }
    const e2=areneInstant(session,session.dureeAffichage/2);
    return JSON.stringify({n,phases,horsCage,duree:session.dureeCombat,
      affichage:session.dureeAffichage,vainqueur:session.vainqueur,
      instant:areneInstant(session,0).phase});
  })()`));
  assert.notEqual(s,'null','la session se construit');
  assert.ok(s.n>0,'des états ont été calculés');
  assert.ok(s.horsCage===0,'aucun pion hors de la cage');
  assert.ok(s.duree>0,'le combat a une durée de combat');
  assert.ok(s.affichage>=s.duree,'l\u2019affichage couvre tout le combat (pauses comprises)');
});

/* ---- Tâche 4 : la cible 1, vérifiée ici sur un échantillon ----------------- */
/* La mesure complète (outils + rapport) vit dans tools/mesure-arene-cible1.js ;
   ce test en garde la morsure dans la suite : la géométrie des pions ne
   contredit jamais la phase du déroulé, hors fenêtres de transition. */
test('ARENE socle — cible 1 : un moment au sol n\u2019affiche jamais deux pions debout, un clinch jamais deux pions à distance', () => {
  const win = newGameWindow();
  const graines=[777101,777102,777103,777104];
  /* Les constantes de mise en scène sont lexicales (scripts classiques) :
     lues depuis la fenêtre, jamais recopiées en dur. */
  const PARS=win.eval('ARENE_MORPH_S');
  const TAP=win.eval('ARENE_TAPIS_S');
  const r = JSON.parse(win.eval(`(function(){
    const graines=${JSON.stringify(graines)};
    const ncmp={total:0,sol:0,clinch:0,debout:0,ecarts:0,ecartTxt:[],tapis:0};
    const PARS=${PARS}, TAP=${TAP};
    for(const g of graines){
      setSeed(g);
      const A=makeFighter({div:'H-welter',gender:'H'});
      const B=makeFighter({div:'H-light',gender:'H'});
      const res=simulateFight(A,B,3);
      const session=areneConstruire(res,{a:A.name,b:B.name});
      const beats=areneBeats(res);
      const tapis=[];
      for(const b of beats){ const c=areneBeatTapis(b); if(c) tapis.push({t0:b.t,t1:b.t+TAP,cible:c}); }
      for(let t=0;t<session.dureeCombat;t+=0.7){
        const e=areneMoment(session,t);
        const att=arenePhaseDeroule(beats,e.t);
        if(att.phase==='exam'||att.phase==='fini') continue;
        if(e.instable) continue;                       /* fenêtre de réarrangement */
        let auTapis=false;
        for(const w of tapis){ if(e.t>=w.t0&&e.t<w.t1){ auTapis=(w.cible==='A')?(e.postureA==='tapis'):(e.postureB==='tapis'); } }
        ncmp.total++;
        if(att.phase!==e.phase){ ncmp.ecarts++; ncmp.ecartTxt.push('phase '+att.phase+'/'+e.phase+' @t='+e.t.toFixed(1)); continue; }
        if(att.phase==='sol'){
          ncmp.sol++;
          const gA=(e.postureA==='sol-dessus'||e.postureA==='sol-dessous');
          const gB=(e.postureB==='sol-dessus'||e.postureB==='sol-dessous');
          if(!gA||!gB||e.d>0.8){ ncmp.ecarts++; ncmp.ecartTxt.push('sol @t='+e.t.toFixed(1)+' d='+e.d.toFixed(2)); }
        }else if(att.phase==='clinch'){
          ncmp.clinch++;
          if(e.postureA!=='debout'||e.postureB!=='debout'||e.d>0.75){ ncmp.ecarts++; ncmp.ecartTxt.push('clinch @t='+e.t.toFixed(1)+' d='+e.d.toFixed(2)); }
        }else{
          ncmp.debout++;
          const okA=e.postureA==='debout'||(auTapis&&e.postureA==='tapis');
          const okB=e.postureB==='debout'||(auTapis&&e.postureB==='tapis');
          if(!okA||!okB||e.d<0.85){ ncmp.ecarts++; ncmp.ecartTxt.push('debout @t='+e.t.toFixed(1)+' d='+e.d.toFixed(2)+' p='+e.postureA+'/'+e.postureB); }
        }
      }
    }
    return JSON.stringify(ncmp);
  })()`));
  assert.ok(r.total>200,'assez d\u2019échantillons pour que la vérification porte ('+r.total+')');
  assert.ok(r.sol>0&&r.clinch>0&&r.debout>0,'les trois phases du déroulé ont été rencontrées');
  assert.equal(r.ecarts,0,
    'aucun écart image/déroulé — reçus : '+r.ecartTxt.slice(0,5).join(' ; '));
});

/* ---- Tâche 3 : le garde-fou du rejeu --------------------------------------- */
test('ARENE socle — garde-fou du rejeu : trace trafiquée, issue divergente, rien n\u2019est montré', () => {
  const win = newGameWindow();
  const resume = combatFrais(win,777201);
  const base = JSON.parse(win.eval(`(function(){
    const res=window.__res;
    return JSON.stringify({winner:res.winner,family:mgmtMethodFamily(res.method,res.winner),
      round:Number.isSafeInteger(res.round)?res.round:3});
  })()`));
  /* Le rejeu fidèle passe. */
  const fidele = win.eval(`(function(){
    const trace={winner:${JSON.stringify(base.winner)},family:${JSON.stringify(base.family)},round:${base.round}};
    return areneVerdictFidele(trace,window.__res);
  })()`);
  assert.equal(fidele,true,'le rejeu fidèle passe la porte');
  /* Trois falsifications, chacune détectée : vainqueur, famille, round. */
  const inverser=w=>w==='A'?'B':(w==='B'?'A':'D');
  const autres={ko:'sub',sub:'ko',dec:'stop',stop:'dec',draw:'dec'};
  const cas=[
    ['vainqueur inversé',{winner:inverser(base.winner),family:base.family,round:base.round}],
    ['famille divergente',{winner:base.winner,family:autres[base.family]||'ko',round:base.round}],
    ['round divergent',{winner:base.winner,family:base.family,round:base.round===1?2:1}],
  ];
  for(const [lib,trace] of cas){
    const ok = win.eval(`areneVerdictFidele(${JSON.stringify(trace)},window.__res)`);
    assert.equal(ok,false,'refusé : '+lib);
  }
  /* À l'écran : le refus ne montre RIEN — pas d'arène, pas de combat — et
     l'emplacement auteur du texte de refus est posé, visible. */
  const refuse = win.eval(`(function(){
    const trace={winner:${JSON.stringify(inverser(base.winner))},family:${JSON.stringify(base.family)},round:${base.round}};
    const ok=areneEcranCharger(window.__res,window.__noms,trace);
    return JSON.stringify({ok:ok,refuse:ARENE_ECRAN.refuse});
  })()`);
  assert.equal(JSON.parse(refuse).refuse,true,'le chargeur pose le refus');
  const htmlRefus = win.scr_arene_socle();
  assert.ok(htmlRefus.includes('[EMPLACEMENT AUTEUR'),'l\u2019emplacement auteur du refus est affiché');
  assert.ok(!htmlRefus.includes('<canvas'),'aucune arène n\u2019est montrée sur un rejeu divergent');
  /* Le rejeu fidèle, lui, se montre. */
  win.eval(`(function(){
    const trace={winner:${JSON.stringify(base.winner)},family:${JSON.stringify(base.family)},round:${base.round}};
    areneEcranCharger(window.__res,window.__noms,trace);
  })()`);
  const htmlOk = win.scr_arene_socle();
  assert.ok(htmlOk.includes('<canvas'),'le rejeu fidèle se montre');
});

/* ---- Tâche 1 : séparation état/dessin, et charte S5 ------------------------ */
test('ARENE socle — sans canvas le dessin ne plante pas, et toute action clavier a son bouton', () => {
  const win = newGameWindow();
  const resume = combatFrais(win,777301);
  const s = JSON.parse(win.eval(`(function(){
    areneEcranCharger(window.__res,window.__noms,null);
    /* Sans canvas (harnais) : areneVueCreer rend null, areneVueDessiner
       ne fait rien, la boucle ne part pas — et le HUD se met à jour quand
       même sur un état calculé. */
    const vueFantome=areneVueCreer(null);
    areneVueDessiner(vueFantome,ARENE_ECRAN.session,areneInstant(ARENE_ECRAN.session,1.2),0);
    const etat=areneInstant(ARENE_ECRAN.session,1.2);
    areneEcranHud(etat);
    const html=scr_arene_socle();
    /* Charte S5 : chaque action au clavier existe à la souris. */
    const boutons={pause:html.includes('areneSocleBascule'),
      v1:html.includes('areneSocleVitesse(1)'),v2:html.includes('areneSocleVitesse(2)'),
      suivant:html.includes('areneSocleSuivant'),autre:html.includes('areneSocle()')};
    /* Un coup de clavier route sans planter (Espace = pause) — le
       dispatcher clavier lit G.screen, l'écran est le courant. */
    G={theme:'dark',screen:'arene_socle'};
    const avant=ARENE_ECRAN.pause;
    keysHandle({key:' ',preventDefault:function(){}});
    return JSON.stringify({vueFantome:vueFantome===null,phase:etat.phase,
      clavier:ARENE_ECRAN.pause!==avant,boutons:boutons,
      phaseTxt:document.getElementById('ar2-phase')?document.getElementById('ar2-phase').textContent:null});
  })()`));
  assert.equal(s.vueFantome,true,'sans canvas, areneVueCreer rend null');
  assert.ok(s.clavier,'la touche Espace bascule la pause');
  assert.ok(s.boutons.pause&&s.boutons.v1&&s.boutons.v2&&s.boutons.suivant&&s.boutons.autre,
    'chaque action clavier a son bouton (charte S5)');
});

/* ---- Tâche 1 : aucune collision avec l'ancienne arène ---------------------- */
test('ARENE socle — les noms globaux de l\u2019arène neuve ne touchent pas à l\u2019ancienne', () => {
  const win = newGameWindow();
  /* L'ancienne arène vit encore : son moteur de rendu répond toujours. */
  const bridge = win.document.createElement('script');
  bridge.textContent = "Object.defineProperty(window,'ARENA',{configurable:true,get:function(){return ARENA;},set:function(v){ARENA=v;}});";
  win.document.body.appendChild(bridge);
  win.buildStaticPreviewArena('Moi','Adversaire','FR','US');
  assert.ok(win.ARENA,'l\u2019ancienne arène fonctionne toujours');
  assert.equal(typeof win.applyBeat,'function','l\u2019ancienne arène garde ses fonctions');
  /* L'arène neuve est là, sous son préfixe à elle. */
  for(const nom of ['areneConstruire','areneMoment','areneInstant','areneVerdictFidele',
    'areneVueCreer','areneVueDessiner','arenePhaseDeroule','scr_arene_socle']){
    assert.equal(typeof win[nom],'function','global nouveau présent : '+nom);
  }
  /* Un combat frais passe par l'écran sans toucher à l'ancienne. */
  combatFrais(win,777401);
  const s = JSON.parse(win.eval(`(function(){
    areneEcranCharger(window.__res,window.__noms,null);
    const session=ARENE_ECRAN.session;
    areneMoment(session,1.0);
    return JSON.stringify({ok:!!session,arenaBeats:ARENA&&ARENA.beats.length});
  })()`));
  assert.equal(s.ok,true,'la session neuve se charge');
  assert.equal(s.arenaBeats,0,'l\u2019ancienne arène est intacte et toujours en place');
});
