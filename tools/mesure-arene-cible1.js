"use strict";
/* CAGE LEGACY — tools/mesure-arene-cible1.js
   ============================================================================
   LOT 3 T2 — LA CIBLE 1, MESURÉE (docs/LOT-3-L-ARENE.md §2, §3 T2) :
   « L'image ne ment jamais sur ce que dit le moteur. »

   Charge le VRAI jeu dans un DOM virtuel (jsdom), dans l'ordre EXACT des
   <script src> d'index.html (lu directement depuis le fichier à chaque
   exécution), joue un grand nombre de combats RÉELS du moteur
   (makeFighter × 2, simulateFight — le moteur décide de tout), construit
   la session de l'arène neuve (areneConstruire), puis :

     1. échantillonne l'état de l'arène (areneMoment) à intervalles
        réguliers de temps de combat (--pas, 0,9 s), sur tout le combat ;
     2. à chaque échantillon, lit la phase du DÉROULÉ au même instant sur
        les moments bruts (arenePhaseDeroule — oracle, jamais les segments
        de l'arène) et compare la géométrie des pions à cette phase ;
     3. sonde chaque moment du déroulé juste avant et juste après sa borne
        (fenêtre de réarrangement comprise) — c'est le lien direct au
        déroulé, moment par moment.

   LES DÉFINITIONS (en mètres sur le tapis, échelle réelle RS=4.3) — la
   mesure n'est honnête que si elles sont dites :

   - « au sol » : les deux pions en posture au sol (dessus/dessous) ET
     distance des centres ≤ ARENE_SOL_D_MAX (0,80 m — deux corps au contact,
     l'écartement du dessus par position va de 0,12 à 0,34 m) ;
   - « au clinch » : les deux pions debout ET distance des centres ≤ 0,75 m
     (corps en contact ; le clinch tenu vaut ARENE_CLINCH_D = 0,60 m) — et
     si le déroulé porte pos='cage', au moins un pion à ≤ 0,50 m du
     grillage (l'arrangement pose le plaqué à 0,42 m) ;
   - « à distance » (debout) : les deux pions debout (un pion « au tapis »
     est admis UNIQUEMENT dans la fenêtre ARENE_TAPIS_S = 4 s qui suit un
     moment « X envoie Y au tapis » du déroulé) ET distance des centres
     ≥ ARENE_DEBOUT_MIN (0,85 m — hors de portée de corps à corps ;
     l'arène tient la paire à ≥ 1,4 m, marge contre l'oscillation) ;
   - fenêtre de réarrangement : après un changement de phase ou de
     disposition, les pions rejoignent leur géométrie en ARENE_MORPH_S =
     0,6 s (lu du jeu, jamais recopié). Ces 0,6 s sont exclues de la
     mesure — un homme qui tombe met un temps à tomber ; au-delà, tout
     écart est un défaut ;
   - 'exam' (examen médical entre les rounds) et 'fini' : le déroulé ne
     fait aucune affirmation de phase de combat — exclus.

   Aucun Math.random() : la RNG du jeu (setSeed/rnd) est la seule source ;
   le combat i part de setSeed(seed + i) — un run est intégralement
   reproductible. La cible est 100 % : un seul écart est un défaut de la
   tranche.

   Usage :
     node tools/mesure-arene-cible1.js [--n=2000] [--seed=20260921]
        [--pas=0.9] [--out=tools/reports/LOT-3-T2-CIBLE-1-ARENE.md] [--quiet]
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');

/* --------------------------- 1) CLI --------------------------------------- */
function parseArgs(argv){
  const out={n:2000,seed:20260921,pas:0.9,
    out:'tools/reports/LOT-3-T2-CIBLE-1-ARENE.md',quiet:false};
  for(const arg of argv){
    if(arg==='--quiet'){ out.quiet=true; continue; }
    const m=/^--([a-zA-Z]+)=(.+)$/.exec(arg);
    if(!m) continue;
    if(m[1]==='n') out.n=Math.max(1,parseInt(m[2],10)||out.n);
    else if(m[1]==='seed') out.seed=parseInt(m[2],10)||out.seed;
    else if(m[1]==='pas') out.pas=Math.max(0.1,parseFloat(m[2])||out.pas);
    else if(m[1]==='out') out.out=m[2];
  }
  out.out=path.isAbsolute(out.out)?out.out:path.join(ROOT,out.out);
  return out;
}

/* --------------------- 2) chargement du jeu -------------------------------- */
/** Lit index.html et retourne la liste des <script src="..."> dans l'ordre
 *  d'apparition — seule source de vérité sur l'ordre de chargement réel.
 *  @returns {string[]} */
function readScriptOrder(){
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const re = /<script src="([^"]+)"><\/script>/g;
  const files = [];
  let m;
  while((m = re.exec(html))){ files.push(m[1].split('?')[0]); }
  if(!files.length) throw new Error('Aucun <script src> trouvé dans index.html — impossible de déterminer l\u2019ordre de chargement réel.');
  return files;
}

/** Fenêtre jsdom neuve avec le vrai jeu chargé (stubs DOM/Canvas/
 *  localStorage repris de tests/helpers/loadGame.js, dont tools/ ne dépend
 *  pas). @returns {import('jsdom').DOMWindow} */
function newGameWindow(){
  const dom = new JSDOM('<!DOCTYPE html><html><body><div id="app"></div></body></html>', {
    url: 'https://cage-legacy.test/',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
  });
  const window = dom.window;
  window.scrollTo = () => {};
  window.confirm = () => true;
  window.alert = () => {};
  window.prompt = () => null;
  if(typeof window.TextEncoder === 'undefined'){
    const { TextEncoder, TextDecoder } = require('util');
    window.TextEncoder = TextEncoder;
    window.TextDecoder = TextDecoder;
  }
  function makeNoopCanvasHandle(){
    const handle = new Proxy(function(){}, {
      get(target, prop){
        if(prop === 'canvas') return undefined;
        if(prop === 'measureText') return () => ({ width: 0 });
        if(typeof prop === 'symbol' || prop === 'then') return undefined;
        if(!(prop in target)) target[prop] = handle;
        return target[prop];
      },
      set(target, prop, value){ target[prop] = value; return true; },
      apply(){ return handle; },
    });
    return handle;
  }
  window.HTMLCanvasElement.prototype.getContext = function(type){
    if(type !== '2d') return null;
    return makeNoopCanvasHandle();
  };
  for(const rel of readScriptOrder()){
    if(rel === 'main.js') continue;
    const code = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    const scriptEl = window.document.createElement('script');
    scriptEl.textContent = code;
    window.document.body.appendChild(scriptEl);
  }
  const bridge = window.document.createElement('script');
  bridge.textContent = "Object.defineProperty(window,'G',{configurable:true,get:function(){return G;},set:function(v){G=v;}});";
  window.document.body.appendChild(bridge);
  return window;
}

/* ------------------------------ 3) mesure ---------------------------------- */
function mesure(cfg){
  const win = newGameWindow();
  /* La fenêtre toute entière boucle : un seul eval, retour en JSON. */
  const debut=Date.now();
  const out=win.eval(`(function(){
    const N=${cfg.n}, PAS=${cfg.pas}, BASE=${cfg.seed};
    const PARS=ARENE_MORPH_S, TAP=ARENE_TAPIS_S, SOLMAX=ARENE_SOL_D_MAX,
      DMIN=ARENE_DEBOUT_MIN, CLINCH=0.75, CAGE=0.5;
    const r={n:N,pas:PAS,total:0,skips:{exam:0,fini:0,morph:0},
      phases:{debout:0,clinch:0,sol:0},ecarts:0,ecartsPhase:0,
      echant:[],tapisKO:0,
      beats:{n:0,ecarts:0,avant:0,apres:0,ecartTxt:[]},
      moments:0,finit:0,horsCage:0,ecartsMax:0};
    for(let i=0;i<N;i++){
      setSeed(BASE+i);
      const A=makeFighter({div:'H-welter',gender:'H'});
      const B=makeFighter({div:'H-light',gender:'H'});
      const res=simulateFight(A,B,3);
      const session=areneConstruire(res,{a:A.name,b:B.name});
      if(!session) continue;
      const beats=areneBeats(res);
      r.beats.n+=beats.length;
      if(beats.length&&beats[beats.length-1].finish) r.finit++;
      const tapis=[];
      for(const b of beats){ const c=areneBeatTapis(b); if(c) tapis.push({t0:b.t,t1:b.t+TAP,cible:c}); }
      const fenetreTapis=(t,side)=>{
        for(const w of tapis){ if(t>=w.t0&&t<w.t1&&w.cible===side) return true; }
        return false;
      };
      let ecartsIci=0;
      /* a) échantillonnage régulier en temps de combat. */
      for(let t=0;t<session.dureeCombat;t+=PAS){
        const e=areneMoment(session,t);
        if(areneBordDist({x:e.ax,y:e.ay})<-0.01||areneBordDist({x:e.bx,y:e.by})<-0.01) r.horsCage++;
        const att=arenePhaseDeroule(beats,e.t);
        if(att.phase==='exam'){ r.skips.exam++; continue; }
        if(att.phase==='fini'){ r.skips.fini++; continue; }
        if(e.instable){ r.skips.morph++; continue; }
        r.total++;
        if(att.phase!==e.phase){
          r.ecarts++; r.ecartsPhase++; ecartsIci++;
          if(r.echant.length<8) r.echant.push('phase déroulé='+att.phase+' arène='+e.phase+' @t='+e.t.toFixed(1)+' (combat '+(BASE+i)+')');
          continue;
        }
        const tapisA=fenetreTapis(e.t,'A'), tapisB=fenetreTapis(e.t,'B');
        const deboutA=e.postureA==='debout'||(tapisA&&e.postureA==='tapis');
        const deboutB=e.postureB==='debout'||(tapisB&&e.postureB==='tapis');
        if(att.phase==='sol'){
          r.phases.sol++;
          const solA=(e.postureA==='sol-dessus'||e.postureA==='sol-dessous');
          const solB=(e.postureB==='sol-dessus'||e.postureB==='sol-dessous');
          if(!solA||!solB||e.d>SOLMAX){
            r.ecarts++; ecartsIci++;
            if(r.echant.length<8) r.echant.push('sol : postures '+e.postureA+'/'+e.postureB+' d='+e.d.toFixed(2)+' @t='+e.t.toFixed(1)+' (combat '+(BASE+i)+')');
          }
        }else if(att.phase==='clinch'){
          r.phases.clinch++;
          if(e.postureA!=='debout'||e.postureB!=='debout'||e.d>CLINCH){
            r.ecarts++; ecartsIci++;
            if(r.echant.length<8) r.echant.push('clinch : postures '+e.postureA+'/'+e.postureB+' d='+e.d.toFixed(2)+' @t='+e.t.toFixed(1)+' (combat '+(BASE+i)+')');
          }else if(att.posClinch==='cage'){
            const bMin=Math.min(areneBordDist({x:e.ax,y:e.ay}),areneBordDist({x:e.bx,y:e.by}));
            if(bMin>CAGE){
              r.ecarts++; ecartsIci++;
              if(r.echant.length<8) r.echant.push('clinch de cage : bord min='+bMin.toFixed(2)+' @t='+e.t.toFixed(1)+' (combat '+(BASE+i)+')');
            }
          }
        }else{
          r.phases.debout++;
          if(!deboutA||!deboutB||e.d<DMIN){
            r.ecarts++; ecartsIci++;
            if(r.echant.length<8) r.echant.push('debout : postures '+e.postureA+'/'+e.postureB+' d='+e.d.toFixed(2)+' @t='+e.t.toFixed(1)+' (combat '+(BASE+i)+')');
          }
        }
      }
      /* Un pion « au tapis » n'existe QUE dans la fenêtre d'un moment du
         déroulé qui le déclare — jamais ailleurs (contrôle inverse ; hors
         combat fini, où le vaincu reste au tapis par construction). */
      for(let t=0;t<session.dureeCombat;t+=PAS){
        const e=areneMoment(session,t);
        const att2=arenePhaseDeroule(beats,e.t);
        if(att2.phase==='exam'||att2.phase==='fini') continue;
        if(e.postureA==='tapis'&&!fenetreTapis(e.t,'A')){
          r.tapisKO++;
          if(r.echant.length<8) r.echant.push('tapis hors moment @t='+e.t.toFixed(1)+' (combat '+(BASE+i)+')');
        }
        if(e.postureB==='tapis'&&!fenetreTapis(e.t,'B')){
          r.tapisKO++;
          if(r.echant.length<8) r.echant.push('tapis hors moment @t='+e.t.toFixed(1)+' (combat '+(BASE+i)+')');
        }
      }
      if(ecartsIci>r.ecartsMax) r.ecartsMax=ecartsIci;
      /* Sondes sur chaque moment du déroulé : juste avant la borne (la
         phase d'AVANT transition y est attendue) et juste après la
         fenêtre de réarrangement (la phase d'APRÈS y est attendue). */
      for(const b of beats){
        const avantT=b.t-0.05;
        if(avantT>=0){
          const e=areneMoment(session,avantT);
          const att=arenePhaseDeroule(beats,e.t);
          r.beats.avant++;
          if(att.phase!=='exam'&&att.phase!=='fini'&&!e.instable&&att.phase!==e.phase){
            r.beats.ecarts++;
            if(r.beats.ecartTxt.length<8) r.beats.ecartTxt.push('avant moment @t='+e.t.toFixed(1)+' déroulé='+att.phase+' image='+e.phase);
          }
        }
        const apresT=b.t+PARS+0.05;
        if(apresT<session.dureeCombat){
          const e=areneMoment(session,apresT);
          const att=arenePhaseDeroule(beats,e.t);
          r.beats.apres++;
          if(att.phase!=='exam'&&att.phase!=='fini'&&!e.instable&&att.phase!==e.phase){
            r.beats.ecarts++;
            if(r.beats.ecartTxt.length<8) r.beats.ecartTxt.push('après moment @t='+e.t.toFixed(1)+' déroulé='+att.phase+' image='+e.phase);
          }
        }
      }
      r.moments+=beats.length;
    }
    r.ms=Date.now()-${debut};
    r.cst={solMax:SOLMAX,deboutMin:DMIN,morph:PARS,tapis:TAP};
    return JSON.stringify(r);
  })()`);
  return JSON.parse(out);
}

/* ------------------------------ 4) rapport --------------------------------- */
(function main(){
  const cfg=parseArgs(process.argv.slice(2));
  if(!cfg.quiet) console.log('Cible 1 de l\u2019arène neuve — graine '+cfg.seed+', '+cfg.n+' combats, pas '+cfg.pas+' s...');
  const r=mesure(cfg);
  const cible100=r.ecarts===0&&r.beats.ecarts===0&&r.horsCage===0&&r.tapisKO===0;
  const L=[];
  L.push('# Lot 3 T2 — Cible 1 de l\u2019arène neuve : l\u2019image ne ment jamais sur le moteur');
  L.push('');
  L.push('*Mesure du '+new Date().toISOString().slice(0,10)+' — tools/mesure-arene-cible1.js.*');
  L.push('');
  L.push('**Commande :** `node tools/mesure-arene-cible1.js --n='+cfg.n+' --seed='+cfg.seed+' --pas='+cfg.pas+'`');
  L.push('');
  L.push('## Le protocole');
  L.push('');
  L.push('- '+cfg.n+' combats réels du moteur (deux profils du générateur existant, `simulateFight` tel quel), le combat i part de `setSeed('+cfg.seed+' + i)` — un run est intégralement reproductible.');
  L.push('- Échantillonnage régulier en temps de combat : pas de '+cfg.pas+' s, sur toute la durée de chaque combat — **'+r.total+' échantillons** mesurés ('+r.skips.exam+' exclus pour examen médical, '+r.skips.fini+' pour fin du combat, '+r.skips.morph+' pour fenêtre de réarrangement).');
  L.push('- Sondes sur **'+r.beats.n+' moments du déroulé** ('+r.beats.avant+' avant / '+r.beats.apres+' après) : chaque borne de moment est vérifiée des deux côtés.');
  L.push('- Durée de la mesure : '+(r.ms/1000).toFixed(1)+' s.');
  L.push('');
  L.push('## Les définitions (mètres sur le tapis, échelle réelle RS = 4,3 m)');
  L.push('');
  L.push('| Phase du déroulé | Ce que l\u2019image doit montrer | Seuil |');
  L.push('|---|---|---|');
  L.push('| sol | les deux pions en posture au sol, centres proches | d ≤ '+r.cst.solMax.toFixed(2)+' m |');
  L.push('| clinch | les deux pions debout, corps en contact | d ≤ 0,75 m |');
  L.push('| clinch porté `pos:cage` | au moins un pion contre le grillage | bord ≤ 0,50 m |');
  L.push('| debout | les deux pions debout (un « au tapis » admis dans la fenêtre de '+r.cst.tapis+' s d\u2019un moment du déroulé qui le déclare), à distance | d ≥ '+r.cst.deboutMin.toFixed(2)+' m |');
  L.push('');
  L.push('Deux lectures d\u2019honnêteté, toutes deux documentées et appliquées des deux côtés :');
  L.push('');
  L.push('- **La fenêtre de réarrangement (ARENE_MORPH_S = '+r.cst.morph+' s).** Après un changement de phase (amenée, séparation, relance) ou de disposition au sol, les pions rejoignent leur géométrie en '+r.cst.morph+' s de combat. Un homme qui tombe met un temps à tomber : cette fenêtre est exclue de la mesure ; au-delà, tout écart est un défaut.');
  L.push('- **Le tapis (ARENE_TAPIS_S = '+r.cst.tapis+' s).** Un pion allongé hors phase sol n\u2019est admis QUE dans les '+r.cst.tapis+' s qui suivent un moment du déroulé « X envoie Y au tapis » — et le contrôle inverse est fait : un pion au tapis hors fenêtre est un écart.');
  L.push('');
  L.push('## Le chiffre');
  L.push('');
  L.push('| Ce qui est mesuré | Valeur |');
  L.push('|---|---|');
  L.push('| Échantillons mesurés | '+r.total+' |');
  L.push('| — phase debout | '+r.phases.debout+' |');
  L.push('| — phase clinch | '+r.phases.clinch+' |');
  L.push('| — phase sol | '+r.phases.sol+' |');
  L.push('| **Écarts phase/géométrie (échantillonnage)** | **'+r.ecarts+'** |');
  L.push('| **Écarts aux bornes des '+r.beats.n+' moments** | **'+r.beats.ecarts+'** |');
  L.push('| Pions hors de la cage | '+r.horsCage+' |');
  L.push('| Pions au tapis hors moment déclaré | '+r.tapisKO+' |');
  L.push('| Combats joués / finitions | '+cfg.n+' / '+r.finit+' |');
  L.push('');
  if(r.echant.length){ L.push('Premiers écarts observés :'); L.push(''); r.echant.forEach(x=>L.push('- '+x)); L.push(''); }
  if(r.beats.ecartTxt.length){ L.push('Premiers écarts aux bornes :'); L.push(''); r.beats.ecartTxt.forEach(x=>L.push('- '+x)); L.push(''); }
  L.push(cible100
    ? '**CIBLE 1 ATTEINTE : 0 écart sur '+r.total+' échantillons et '+r.beats.n+' moments — l\u2019image dit toujours ce que le moteur dit.**'
    : '**CIBLE 1 MANQUÉE : '+r.ecarts+' écart(s) d\u2019échantillonnage et '+r.beats.ecarts+' aux bornes — un seul écart est un défaut de la tranche.**');
  L.push('');
  fs.writeFileSync(cfg.out,L.join('\n')+'\n');
  console.log('Échantillons '+r.total+' — écarts '+r.ecarts+' — bornes '+r.beats.n+' (écarts '+r.beats.ecarts+') — hors cage '+r.horsCage+' — tapis hors moment '+r.tapisKO);
  console.log('Rapport : '+cfg.out);
  process.exitCode=cible100?0:1;
})();
