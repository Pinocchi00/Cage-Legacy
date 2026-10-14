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
    - Lot 3 T4, décision 1 du 21/09 : l'arène unique sert la carrière et le
      duel ; la cible 2 interdit tout déplacement au-delà de 6 m/s.
   ============================================================================ */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { newGameWindow } = require('./helpers/loadGame');

/* ==== [ANCRE: TEST_COMBAT_COHERENCE_1310_ROUNDS] — Cohérence du combat, 13/10/2026. ==== */
test('COHÉRENCE — la cloche ouvre le round suivant même si son premier échange tarde', () => {
  const win=newGameWindow();
  const r=JSON.parse(win.eval(`JSON.stringify((function(){
    const res={winner:'A',method:'Décision unanime',roundStats:[{r:1},{r:2},{r:3}],log:[
      {r:1,phase:'sol',top:'A',pos:'mount',text:'[00:10] Contrôle au sol.'},
      {r:2,phase:'debout',text:'[04:30] Échange.'},
      {r:3,phase:'debout',text:'[04:30] Échange.'}]};
    return [1,7].map(echelle=>{
      const s=areneConstruire(res,{a:'A',b:'B'},{echelle});
      const e=areneMoment(s,307/echelle);
      return {r:e.r,phase:e.phase,horloge:e.horloge};
    });
  })())`));
  for(const e of r){ assert.equal(e.r,2); assert.equal(e.phase,'debout'); assert.ok(Math.abs(e.horloge-293)<0.01); }
  win.close();
});

test('COHÉRENCE — la pause ramène chacun dans son coin et la reprise en repart sans saut visible', () => {
  const win=newGameWindow();
  const r=JSON.parse(win.eval(`JSON.stringify((function(){
    const s=areneConstruire({winner:'A',method:'Décision unanime',roundStats:[{r:1},{r:2}],log:[
      {r:1,phase:'debout',text:'[04:59] Échange.'},{r:2,phase:'debout',text:'[04:30] Échange.'}
    ]},{a:'A',b:'B'},{echelle:7,pause:3.4});
    const p=s.montage.find(x=>x.genre==='pause'&&x.rNext===2);
    const avant={...areneInstant(s,p.d0)}, fin={...areneInstant(s,p.d1-0.001)}, reprise={...areneInstant(s,p.d1)};
    return {avant,fin,reprise,coinA:areneCoinA(),coinB:areneCoinB()};
  })())`));
  assert.ok(Math.hypot(r.fin.ax-r.coinA.x,r.fin.ay-r.coinA.y)<0.01,'A rejoint son coin');
  assert.ok(Math.hypot(r.fin.bx-r.coinB.x,r.fin.by-r.coinB.y)<0.01,'B rejoint son coin');
  assert.ok(Math.hypot(r.fin.ax-r.reprise.ax,r.fin.ay-r.reprise.ay)<0.02,'aucun saut à la reprise');
  assert.ok(Math.hypot(r.avant.ax-r.fin.ax,r.avant.ay-r.fin.ay)>0.5,'retour au coin réellement parcouru');
  assert.equal(r.reprise.r,2); assert.equal(r.reprise.phase,'debout');
  assert.ok(Math.abs(r.reprise.horloge-300)<0.01);
  win.close();
});
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: TEST_COMBAT_COHERENCE_1310_GESTES] — Cohérence du combat, 13/10/2026. ==== */
test('COHÉRENCE — les examens successifs gardent une pause par round et une reprise sans téléportation', () => {
  const win=newGameWindow();
  const out=JSON.parse(win.eval(`JSON.stringify((function(){
    const s=areneConstruire({winner:'A',method:'Décision unanime',roundStats:[{r:1},{r:2},{r:3}],log:[
      {r:1,phase:'sol',top:'A',text:'[00:10] Contrôle.'}, {r:1,phase:'exam',text:'[00:00] Examen.'},
      {r:2,phase:'sol',top:'B',text:'[00:10] Contrôle.'}, {r:2,phase:'exam',text:'[00:00] Examen.'},
      {r:3,phase:'debout',text:'[04:30] Échange.'}
    ]},{a:'A',b:'B'},{echelle:7});
    return s.montage.filter(m=>m.genre==='pause').map(p=>{
      const a={...areneInstant(s,p.d1-0.001)}, b={...areneInstant(s,p.d1)};
      return {r:p.rNext,reprise:b.r,ecart:Math.max(Math.hypot(a.ax-b.ax,a.ay-b.ay),Math.hypot(a.bx-b.bx,a.by-b.by))};
    });
  })())`));
  assert.deepEqual(out.map(x=>x.r),[2,3]);
  for(const e of out){ assert.equal(e.r,e.reprise); assert.ok(e.ecart<0.02); }
  win.close();
});

test('COHÉRENCE — arbitrage et adaptation ne produisent aucun coup ni impact', () => {
  const win=newGameWindow();
  const r=JSON.parse(win.eval(`JSON.stringify((function(){
    const out=[];
    for(const kind of ['timeout','pointDeduction','adaptation','injury','takedownDefense']){
      const s=areneConstruire({winner:'A',method:'Décision unanime',log:[
        {r:1,phase:'debout',by:'op',kind,text:'[04:50] Événement sans frappe.'}
      ]},{a:'A',b:'B'});
      out.push({kind,action:areneMoment(s,10.1).action});
    }
    return out;
  })())`));
  for(const e of r) assert.equal(e.action,null,e.kind);
  win.close();
});

test('COHÉRENCE — une disqualification ou un arrêt médical ne simule pas un KO', () => {
  const win=newGameWindow();
  const r=JSON.parse(win.eval(`JSON.stringify((function(){
    return ['Disqualification','Arrêt médical','Blessure'].map(method=>{
      const s=areneConstruire({winner:'B',method,round:1,log:[
        {r:1,phase:'debout',by:'op',finish:true,method,text:'[03:00] Arrêt.'}
      ]},{a:'A',b:'B'});
      const e=areneMoment(s,120.1);
      return {method,a:e.postureA,b:e.postureB,action:e.action};
    });
  })())`));
  for(const e of r){ assert.equal(e.a,'debout',e.method); assert.equal(e.b,'debout'); assert.equal(e.action,null); }
  win.close();
});
/* ==== [FIN ANCRE] ==== */

/* Un combat réel du moteur, deux noms, une session d'arène. */
/* ==== [ANCRE: TEST_COMBAT_COHERENCE_1310_HORLOGE] — 13/10/2026. ==== */
test('COHÉRENCE — annonces à 1:00, 0:10 et 0:00, aux deux échelles de lecture', () => {
  const win=newGameWindow();
  const out=JSON.parse(win.eval(`JSON.stringify([1,7].map(echelle=>{
    const s=areneConstruire({winner:'A',method:'Décision unanime',roundStats:[{r:1},{r:2}],log:[]},{a:'A',b:'B'},{echelle});
    areneCoupsConstruire(s);
    return [1,2].map(r=>({
      minute:s.voix.some(v=>v.a===MGMT_COMMENTAIRE.minute[0].t&&Math.abs(v.t-(r*300-60)/echelle)<1e-9),
      dix:s.voix.some(v=>v.a===MGMT_COMMENTAIRE.dix[0].t&&Math.abs(v.t-(r*300-10)/echelle)<1e-9),
      cloche:s.voix.some(v=>v.a===MGMT_COMMENTAIRE.finRound[0].t&&Math.abs(v.t-r*300/echelle)<1e-9),
      coin:s.coins.some(c=>MGMT_COINS.dix.includes(c.a)&&Math.abs(c.t-(r*300-10)/echelle)<1e-9)
    }));
  }))`));
  for(const e of out.flat()) assert.deepEqual(e,{minute:true,dix:true,cloche:true,coin:true});
  win.close();
});

test('COHÉRENCE — le chrono se fige à l’arrêt, les juges restent audibles après la cloche', () => {
  const win=newGameWindow();
  const out=JSON.parse(win.eval(`JSON.stringify((function(){
    const stop=areneConstruire({winner:'A',method:'KO',log:[{r:1,phase:'debout',by:'me',finish:true,text:'[03:00] Arrêt.'}]},{a:'A',b:'B'},{echelle:7});
    const horloge=areneMoment(stop,stop.dureeCombat).horloge;
    const s=areneConstruire({winner:'A',method:'Décision unanime',roundStats:[{r:1}],log:[]},{a:'A',b:'B'},{echelle:7});
    areneCoupsConstruire(s);
    MGMT_COMBAT.session=s; MGMT_COMBAT.d=s.dureeAffichage; MGMT_COMBAT.fin=2.2;
    MGMT_COMBAT.decision={decision:true}; MGMT_COMBAT.plan='cable';
    const cx=mgmtCombatCx();
    return {horloge,t:cx.t,fin:s.dureeCombat,voixT:cx.voixT,juges:MGMT_COMMENTAIRE.juges.some(v=>v.t===cx.voix.a)};
  })())`));
  assert.equal(out.horloge,180); assert.equal(out.t,out.fin);
  assert.ok(out.voixT>out.t); assert.equal(out.juges,true);
  win.close();
});

test('COHÉRENCE — un KO près de la cloche garde sa finition et seulement les annonces déjà franchies', () => {
  const win=newGameWindow();
  const out=JSON.parse(win.eval(`JSON.stringify(['00:04','00:30'].map(temps=>{
    const s=areneConstruire({winner:'A',method:'KO',log:[{r:1,phase:'debout',by:'me',finish:true,text:'['+temps+'] Arrêt.'}]},{a:'A',b:'B'},{echelle:7});
    areneCoupsConstruire(s);
    return {minute:s.voix.some(v=>v.a===MGMT_COMMENTAIRE.minute[0].t),cloche:s.voix.some(v=>v.a===MGMT_COMMENTAIRE.finRound[0].t),terminal:!!s.voix[s.voix.length-1].terminal};
  }))`));
  for(const e of out) assert.deepEqual(e,{minute:true,cloche:false,terminal:true});
  win.close();
});
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: TEST_COMBAT_COHERENCE_1310_ECHANGES] — 13/10/2026. ==== */
test('COHÉRENCE — zéro tentative reste zéro geste, zéro réussite reste zéro impact', () => {
  const win=newGameWindow();
  const out=JSON.parse(win.eval(`JSON.stringify((function(){
    const zero={distAtt:0,clinchAtt:0,groundAtt:0,distStrikes:0,clinchStrikes:0,groundStrikes:0,byType:{}};
    const faire=(A,B)=>{
      const s=areneConstruire({winner:'A',method:'Décision unanime',roundStats:[{r:1}],log:[],stats:{A,B}},{a:'A',b:'B'},{echelle:7});
      areneCoupsConstruire(s); return s.coups;
    };
    return {vide:faire(zero,zero),rates:faire({...zero,distAtt:30,byType:{jab:30}},zero)};
  })())`));
  assert.deepEqual(out.vide,[]);
  assert.ok(out.rates.length>0); assert.ok(out.rates.every(c=>c.by==='A'&&c.r!==1));
  win.close();
});

test('COHÉRENCE — un changement de nom ne réécrit pas les gestes du combat', () => {
  const win=newGameWindow();
  combatFrais(win,777001);
  const out=JSON.parse(win.eval(`JSON.stringify((function(){
    const a=areneConstruire(__res,{a:'A',b:'B'},{echelle:7}), b=areneConstruire(__res,{a:'C',b:'D'},{echelle:7});
    areneCoupsConstruire(a); areneCoupsConstruire(b); return [a.coups,b.coups];
  })())`));
  assert.deepEqual(out[0],out[1]);
  win.close();
});
/* ==== [FIN ANCRE] ==== */

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
  assert.ok(htmlRefus.includes('Ce combat ne peut pas être montré'),'le refus est dit au joueur, sans mention entre crochets (brief démo, lot 9 T2)');
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

/* ==== [ANCRE: TEST_ARENE_T4_UNIQUE] — Lot 3 T4, décision 1 du 21/09 :
   l'ancienne arène est retirée et les deux modes partagent l'écran. ==== */
test('ARENE T4 — une seule arène et la carrière la charge depuis le moteur', () => {
  const win = newGameWindow();
  combatFrais(win,777401);
  const s = JSON.parse(win.eval(`(function(){
    G={theme:'dark',screen:'arena',f:{name:window.__noms.a},
      pending:{res:window.__res,opp:{name:window.__noms.b}}};
    render();
    return JSON.stringify({ok:!!ARENE_ECRAN.session,canvas:!!document.getElementById('arene-socle-cv'),
      old:typeof startArena});
  })()`));
  assert.equal(s.ok,true,'la session neuve se charge');
  assert.equal(s.canvas,true,'la carrière affiche le même canvas');
  assert.equal(s.old,'undefined','l\u2019ancienne boucle n\u2019existe plus');
});

/* ==== [ANCRE: TEST_ARENE_T4_VITESSE] — Lot 3 T4, cible 2 : toutes les images
   y compris les transitions, aucun pion ni arbitre au-dessus de 6 m/s. ==== */
test('ARENE T4 — cible 2 : aucune image au-dessus de 6 m/s', () => {
  const win=newGameWindow();
  const r=JSON.parse(win.eval(`(function(){
    let max=0,images=0;
    for(const seed of [777501,777502,777503]){
      setSeed(seed);
      const A=makeFighter({div:'H-welter',gender:'H'});
      const B=makeFighter({div:'H-welter',gender:'H'});
      const s=areneConstruire(simulateFight(A,B,3),{a:A.name,b:B.name});
      let prev=null;
      for(let t=0;t<s.dureeCombat;t+=1/30){
        const e=areneMoment(s,t);
        if(prev){
          for(const [x,y] of [[e.ax,e.ay],[e.bx,e.by],[e.refX,e.refY]]){
            const p=prev.shift();
            const v=Math.hypot(x-p[0],y-p[1])*30;
            if(v>max)max=v;
          }
        }
        prev=[[e.ax,e.ay],[e.bx,e.by],[e.refX,e.refY]];
        images++;
      }
    }
    return JSON.stringify({max,images});
  })()`));
  assert.ok(r.images>1000);
  assert.ok(r.max<=6,'vitesse maximale mesurée '+r.max+' m/s');
});

/* ==== [ANCRE: TEST_ARENE_T4_HALO] — Lot 3 T4, décision 1 du 21/09 :
   le halo de soumission vient du beat sub ou de la finition du moteur. ==== */
test('ARENE T4 — halo de soumission sur menace et finition', () => {
  const win=newGameWindow();
  const events=JSON.parse(win.eval(`(function(){
    const res={winner:'A',method:'Soumission',round:1,
      log:[{r:1,phase:'sol',top:'A',pos:'closedGuard',sub:true,
        text:'[04:00] Soumission serrée.'},
        {r:1,phase:'sol',top:'A',finish:true,text:'[03:30] Soumission.'}]};
    const s=areneConstruire(res,{a:'A',b:'B'});
    return JSON.stringify([areneMoment(s,60.2).action.type,
      areneMoment(s,90.2).action.type]);
  })()`));
  assert.deepEqual(events,['sub','sub']);
});

/* ==== [ANCRE: TEST_ARENE_T4_REPRISE_MOMENTS] — Lot 3 T4, reprise : le halo
   moteur n'est pas un résumé. Septante lignes sub n'en produisent pas
   septante moments ; fin toujours gardée, répétitions et marqueurs ôtés
   uniquement à l'affichage (log source inchangé). ==== */
test('ARENE T4 reprise — épisode sub unique, cinq moments maximum et finition préservée', () => {
  const win=newGameWindow();
  const sortie=JSON.parse(win.eval(`(function(){
    const log=[];
    for(let i=0;i<70;i++) log.push({r:1,phase:'sol',sub:true,by:'me',
      text:'['+String(4-Math.floor(i/60)).padStart(2,'0')+':'+String(59-i%60).padStart(2,'0')+'] Soumission serrée.'});
    for(let i=0;i<8;i++) log.push({r:2,phase:'debout',by:'me',
      text:'[04:'+String(50-i).padStart(2,'0')+'] A envoie B au tapis.'});
    log.push({r:2,phase:'sol',sub:true,by:'op',text:'[04:00] [ARBITRAGE] Seconde menace.'});
    log.push({r:2,phase:'sol',finish:true,by:'me',text:'[03:30] [CRITIQUE] Soumission serrée.'});
    const avant=JSON.stringify(log), moments=areneMomentsCles({log});
    return JSON.stringify({n:moments.length,sub:moments.filter(b=>b.sub).length,
      fin:moments[moments.length-1].finish,
      textes:moments.map(b=>areneTextePublic(b.text)),intact:JSON.stringify(log)===avant,
      vide:areneMomentsCles({log:[{r:1,phase:'debout',text:'[04:00] Aucun événement.'}]}).length});
  })()`));
  assert.ok(sortie.n<=5,'au plus cinq moments');
  assert.ok(sortie.sub<=2,'deux épisodes de menace, pas soixante-dix tentatives');
  assert.equal(sortie.fin,true,'finition toujours gardée');
  assert.equal(sortie.vide,0,'décision sans événement : seulement le résultat');
  assert.equal(sortie.intact,true,'déroulé du moteur non muté');
  assert.equal(new Set(sortie.textes.map(x=>x.replace(/^\[\d{1,2}:\d{2}\]\s*/,''))).size,sortie.n,'aucune phrase répétée');
  assert.ok(sortie.textes.every(x=>!x.includes('[CRITIQUE]')&&!x.includes('[ARBITRAGE]')));
});

test('ARENE T4 reprise — ni bandeau ni fil ne montrent les marqueurs du moteur', () => {
  const win=newGameWindow();
  const result=JSON.parse(win.eval(`(function(){
    const text='[04:16] [CRITIQUE] A envoie B au tapis.';
    const res={winner:'A',method:'KO',round:1,log:[{r:1,phase:'debout',by:'me',finish:true,text}]};
    areneEcranCharger(res,{a:'A',b:'B'});
    document.getElementById('app').innerHTML=scr_arene_socle();
    areneEcranHud({r:1,horloge:256,phase:'debout',fini:false,texte:text,t:44});
    return JSON.stringify({source:res.log[0].text,
      bandeau:document.getElementById('ar2-texte').textContent,
      journal:document.getElementById('ar2-fil').textContent});
  })()`));
  assert.ok(result.source.includes('[CRITIQUE]'),'source intacte');
  assert.ok(!result.bandeau.includes('[CRITIQUE]')&&!result.journal.includes('[CRITIQUE]'));
  assert.ok(result.bandeau.includes('A envoie B au tapis'));
});

/* ==== [ANCRE: ARENE_LOT4_FIDELITE_TEST] — Maquette 05 : la présentation
   n'est plus inline dans l'écran, elle appartient aux règles du jeu réel
   dans index.html ; les mêmes invariants sont vérifiés dans les deux fichiers. ==== */
test('ARENE lot 4 — noms, badge octogonal et scène de la maquette 05', () => {
  const win=newGameWindow();
  const r=JSON.parse(win.eval(`(function(){
    const res={winner:'D',method:'Nul',round:1,log:[{r:1,phase:'debout',text:'[04:00] Échange.'}]};
    areneEcranCharger(res,{a:'Un <champion>',b:'Autre',styleA:'Contreur <long>'},null);
    const html=scr_arene_socle();
    document.body.style.background='rgb(1, 2, 3)';
    areneEcranAppPoser();
    const pendant=document.body.style.background;
    areneEcranNettoyer();
    return JSON.stringify({html,pendant,apres:document.body.style.background});
  })()`));
   const css=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
   assert.ok(r.html.includes('class="arene-name"')&&r.html.includes('class="arene-clock"'));
   assert.ok(css.includes('font:italic 800 clamp(28px,2vw,38px)')&&css.includes('clip-path:polygon(30% 0,70% 0'));
   assert.ok(r.html.includes('class="arene-fil"')&&css.includes('.arene-scr #arene-socle-cv{position:absolute;inset:0'));
  assert.ok(r.html.includes('Contreur &lt;long&gt;'));
  assert.ok(r.html.includes('Un &lt;champion&gt;'));
  assert.ok(!r.html.includes('<champion>'));
  assert.ok(!r.html.includes('Cage Legacy</div>')&&!r.html.includes('L’arène</h2>'));
   assert.ok(r.pendant.includes('#3A2F33')&&r.pendant.includes('#1A1517'),'fond de la maquette 05 pendant le combat');
  assert.equal(r.apres,'rgb(1, 2, 3)','fond précédent restauré après sortie');
});
