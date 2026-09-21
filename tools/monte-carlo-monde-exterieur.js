"use strict";
/* CAGE LEGACY — tools/monte-carlo-monde-exterieur.js
   ============================================================================
   Lot 2B T1 — le monde extérieur dérivé, mesuré
   (docs/LOT-2B-LE-VIVIER-SE-RENOUVELLE.md §3 : ce que « réaliste » veut dire,
   et comment on le mesure). Charge le VRAI jeu dans un DOM virtuel (jsdom),
   dans l'ordre EXACT des <script src> de index.html (lu directement à chaque
   exécution), et met le monde dérivé face au moteur réel :

     1. deux pools de combattants, la même passerelle vers le combat :
        - « roster »  — les lignes de Split générées par mgmtNewRoster
          (correlatedRecord) : LA référence, la mesure existante ;
        - « extérieur » — les lignes du vivier dérivé (ancre
          MGMT_LOT2B_EXTERIEUR) lues par mgmtExteriorTrace : bilan et âge
          dérivés, jamais stockés.
        Les deux passent par le même pont que le jeu (mgmtCombatProfile →
        simulateFight) : aucun traitement de faveur, aucun traitement
        dégradé.
     2. CIBLE 1 — le bilan prédit le résultat : des combattants du pool,
        appariés par catégorie, combattent par simulateFight ; la
        corrélation entre l'écart de bilan (ratio de victoires) et le
        résultat observé est mesurée sur les DEUX pools et mise côte à
        côte. Le monde dérivé doit se comporter comme le roster.
     3. CIBLE 2 — les fins de combats collent : la répartition KO /
        soumission / décision des traces dérivées est comparée à celle que
        le moteur produit réellement (mêmes combats de référence ;
        l'arrêt médical, stoppage par coupure, compte dans le KO —
        mgmtMethodFamily le sépare pour l'affichage, la réalité du sport
        non ; les nuls, rarissimes, sont comptés à part).

   Aucun Math.random() : la RNG du jeu (rnd(), seedée par setSeed) est la
   seule source de tirage DANS le jeu chargé ; les paires et les graines de
   combat sont dérivées de l'index du combat. Chaque combat i démarre sous
   setSeed(base + 1000000 + i) (roster) ou setSeed(base + 2000000 + i)
   (extérieur) — un run est intégralement reproductible pour un même
   --seed/--n, en --serial comme en parallèle.

   Parallélisme (même découpage que tools/monte-carlo-economie.js) : les
   combats sont indépendants — chaque enfant mesure un paquet contigu
   d'indices et régénère les mêmes pools (graines de lots publiées) ; les
   compteurs s'additionnent : les chiffres sont EXACTEMENT ceux d'une
   exécution --serial.

   Usage :
     node tools/monte-carlo-monde-exterieur.js [--seed=S] [--n=N]
        [--out=CHEMIN] [--quiet] [--jobs=N] [--serial]
   ============================================================================ */
const path = require('path');
const fs = require('fs');
const os = require('os');
const { fork } = require('child_process');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');

/* --------------------------- 1) CLI --------------------------------------- */
function parseArgs(argv){
  const out = { seed: 20260921, n: 4000, out: 'tools/reports/LOT-2B-T1-MONDE-EXTERIEUR.md', quiet: false,
    jobs: Math.max(1, Math.min(12, os.cpus().length)), worker: false, from: 0, to: 0 };
  for(const arg of argv){
    if(arg === '--quiet'){ out.quiet = true; continue; }
    if(arg === '--serial'){ out.jobs = 1; continue; }
    const m = /^--([a-zA-Z]+)=(.+)$/.exec(arg);
    if(!m) continue;
    const key=m[1], val=m[2];
    if(key === 'seed') out.seed = parseInt(val, 10) || out.seed;
    else if(key === 'n') out.n = Math.max(1, parseInt(val, 10) || out.n);
    else if(key === 'out') out.out = val;
    else if(key === 'jobs') out.jobs = Math.max(1, Math.min(12, parseInt(val, 10) || out.jobs));
    else if(key === 'from'){ out.worker = true; out.from = parseInt(val, 10) || 0; }
    else if(key === 'to'){ out.worker = true; out.to = parseInt(val, 10) || 0; }
  }
  out.out = path.isAbsolute(out.out) ? out.out : path.join(ROOT, out.out);
  if(!out.worker){ out.from = 0; out.to = out.n; }
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
  if(!files.length) throw new Error('Aucun <script src> trouvé dans index.html — impossible de déterminer l\'ordre de chargement réel.');
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
  const document = window.document;
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
    const scriptEl = document.createElement('script');
    scriptEl.textContent = code;
    document.body.appendChild(scriptEl);
  }
  const bridge = document.createElement('script');
  bridge.textContent = "Object.defineProperty(window,'G',{configurable:true,get:function(){return G;},set:function(v){G=v;}});";
  document.body.appendChild(bridge);
  return window;
}

/* --------------------- 3) mesure (un processus) ---------------------------- */
const C_READ=30;      /* cycle où les traces extérieures sont lues */
const EXT_CYCLES=30;  /* cycles d'entrants dérivés par lot */
const POOL_MIN=60;    /* combattants par catégorie et par pool */
const BATCH_MAX=60;

/** Mesure les combats d'indices [from,to) — les pools, eux, sont identiques
 *  dans tout processus (graines de lots publiées) : les compteurs des
 *  processus s'additionnent sans rien recalculer.
 *  @returns {string} JSON des compteurs. */
function measure(cfg){
  const win = newGameWindow();
  const agg = win.eval(`(function(){
    const BASE=${cfg.seed}, FROM=${cfg.from}, TO=${cfg.to}, POOL_MIN=${POOL_MIN}, BATCH_MAX=${BATCH_MAX},
          C_READ=${C_READ}, EXT_CYCLES=${EXT_CYCLES};
    const DIVS=allDivisions();

    /* ---- 1) Pools par catégorie, la même passerelle que le jeu ---- */
    const roster={pools:{},n:0}, ext={pools:{},n:0};
    function push(pool,line){ (pool.pools[line.div]=pool.pools[line.div]||[]).push(line); pool.n++; }
    let batch=0;
    while((Object.keys(roster.pools).filter(d=>roster.pools[d].length>=POOL_MIN).length<DIVS.length
        || Object.keys(ext.pools).filter(d=>ext.pools[d].length>=POOL_MIN).length<DIVS.length)
        && batch<BATCH_MAX){
      setSeed(BASE+100000+batch*97);
      const m=mgmtDefault(); mgmtNewRoster(m);
      for(const o of m.roster) push(roster,o);
      /* Le monde extérieur du même lot : un état neuf, son roster (le
         compteur d'identifiants avance comme dans le vrai flux), sa cohorte
         initiale, puis EXT_CYCLES cycles d'entrants dérivés. */
      setSeed(BASE+300000+batch*97);
      const m2=mgmtDefault(); mgmtNewRoster(m2);
      mgmtExteriorEnsure(m2);
      for(let c=1;c<=EXT_CYCLES;c++){ m2.cycle=c; mgmtExteriorArrive(m2); }
      for(const l of m2.exterieur){
        if(l.born>C_READ) continue;
        const t=mgmtExteriorTrace(l,C_READ);
        if(!t) continue;
        /* seed et ck voyagent avec la ligne : la répartition des fins se
           relit sur l'identité d'origine (seed, div, ck, born), jamais sur
           un état stocké. */
        push(ext,{id:l.id,seed:l.seed,ck:l.ck,div:l.div,divName:divById(l.div).name,
          name:t.name,first:t.first,last:t.last,W:t.pro.W,L:t.pro.L,D:0,age:t.age});
      }
      batch++;
    }

    /* ---- 2) Un combat : le chemin exact d'une soirée (mgmtRunEvent) ---- */
    function ratio(f){ const t=(Number.isSafeInteger(f.W)?f.W:0)+(Number.isSafeInteger(f.L)?f.L:0); return t>0?f.W/t:0.5; }
    const BUCKETS=[[0,0.05],[0.05,0.1],[0.1,0.2],[0.2,0.35],[0.35,2]];
    function newAcc(){ return {n:0,draws:0,sx:0,sy:0,sxy:0,sxx:0,syy:0,skipped:0,
      fam:{ko:0,sub:0,dec:0,stop:0,draw:0},
      buckets:BUCKETS.map(()=>({n:0,favWin:0,favNot:0}))}; }
    function accFight(acc,A,B,offset,i){
      const pool=acc._pool;
      if(!pool||pool.length<2){ acc.skipped++; return; }
      setSeed(BASE+offset+i);
      let i1=Math.floor(rnd()*pool.length), i2=Math.floor(rnd()*(pool.length-1));
      if(i2>=i1) i2++;
      const FA=pool[i1], FB=pool[i2];
      const res=simulateFight(mgmtCombatProfile(FA),mgmtCombatProfile(FB),3);
      const fam=mgmtMethodFamily(res.method,res.winner);
      acc.n++; acc.fam[fam]++;
      const x=ratio(FA)-ratio(FB);
      const y=res.winner==='A'?1:(res.winner==='B'?0:0.5);
      if(res.winner==='D') acc.draws++;
      acc.sx+=x; acc.sy+=y; acc.sxy+=x*y; acc.sxx+=x*x; acc.syy+=y*y;
      const favIsA=x>0, edge=Math.abs(x);
      for(let b=0;b<BUCKETS.length;b++){
        if(edge>=BUCKETS[b][0]&&edge<BUCKETS[b][1]){
          acc.buckets[b].n++;
          if(res.winner==='D'){ /* le nul ne départage personne */ }
          else if((res.winner==='A')===favIsA) acc.buckets[b].favWin++;
          else acc.buckets[b].favNot++;
          break;
        }
      }
    }

    /* ---- 3) Les combats du paquet [FROM,TO) : mêmes indices, mêmes
            graines, quel que soit le découpage ---- */
    const accRoster=newAcc(), accExt=newAcc();
    accRoster._pool=null; accExt._pool=null;
    for(let i=FROM;i<TO;i++){
      const di=i%DIVS.length, dId=DIVS[di].id;
      accRoster._pool=roster.pools[dId]||null;
      accExt._pool=ext.pools[dId]||null;
      accFight(accRoster,null,null,1000000,i);
      accFight(accExt,null,null,2000000,i);
    }
    delete accRoster._pool; delete accExt._pool;

    /* ---- 4) La répartition des fins du monde dérivé, lue sur les
            traces du pool (pro, et amateur à titre d'information).
            Les pools sont IDENTIQUES dans tout processus : cette lecture
            ne compte qu'une fois — le processus couvrant l'indice 0. En
            --serial, from=0 : le compte est le même, bit à bit. ---- */
    const finPro={ko:0,sub:0,dec:0}, finAma={ko:0,sub:0,dec:0};
    let extLus=0, ages=0;
    if(FROM===0){
      for(const d of Object.keys(ext.pools)){
        for(const l of ext.pools[d]){
          const t=mgmtExteriorTrace({id:l.id,seed:l.seed,div:l.div,ck:l.ck,born:l.born},C_READ);
          if(!t) continue;
          extLus++; ages+=t.age;
          finPro.ko+=t.pro.fin.ko; finPro.sub+=t.pro.fin.sub; finPro.dec+=t.pro.fin.dec;
          finAma.ko+=t.amateur.fin.ko; finAma.sub+=t.amateur.fin.sub; finAma.dec+=t.amateur.fin.dec;
        }
      }
    }

    return JSON.stringify({accRoster:accRoster,accExt:accExt,finPro:finPro,finAma:finAma,
      extLus:extLus,ageMoyen:extLus>0?ages/extLus:0,
      pools:{roster:roster.n,ext:ext.n,lots:batch,
        parCat:{roster:Object.keys(roster.pools).map(d=>roster.pools[d].length),
                ext:Object.keys(ext.pools).map(d=>ext.pools[d].length)}}});
  })()`);
  return agg;
}

/* --------------------- 4) répartition sur les cœurs ------------------------ */
/** Fusionne les paquets : des compteurs, rien d'autre — l'addition est
 *  exacte, l'ordre des paquets ne change rien.
 *  @returns {object} */
function mergeParts(parts){
  const out={accRoster:null,accExt:null,finPro:{ko:0,sub:0,dec:0},finAma:{ko:0,sub:0,dec:0},
    extLus:0,ageSomme:0,pools:null};
  const add=(a,b)=>{
    if(!a) return JSON.parse(JSON.stringify(b));
    const c=JSON.parse(JSON.stringify(a));
    for(const k of ['n','draws','sx','sy','sxy','sxx','syy','skipped']) c[k]+=b[k];
    for(const k of Object.keys(c.fam)) c.fam[k]+=b.fam[k];
    for(let i=0;i<c.buckets.length;i++){ c.buckets[i].n+=b.buckets[i].n; c.buckets[i].favWin+=b.buckets[i].favWin; c.buckets[i].favNot+=b.buckets[i].favNot; }
    return c;
  };
  for(const p of parts){
    out.accRoster=add(out.accRoster,p.accRoster);
    out.accExt=add(out.accExt,p.accExt);
    for(const k of Object.keys(out.finPro)) out.finPro[k]+=p.finPro[k];
    for(const k of Object.keys(out.finAma)) out.finAma[k]+=p.finAma[k];
    out.extLus+=p.extLus; out.ageSomme+=p.ageMoyen*p.extLus;
    if(!out.pools) out.pools=p.pools;
  }
  out.ageMoyen=out.extLus>0?out.ageSomme/out.extLus:0;
  return out;
}

/** Lance un enfant par paquet contigu d'indices et rend les mesures
 *  fusionnées, dans l'ordre des indices. */
function measureParallel(cfg,done){
  const jobs=Math.min(cfg.jobs,cfg.n);
  const step=Math.ceil(cfg.n/jobs);
  const parts=[];
  let left=jobs, failed=false;
  for(let j=0;j<jobs;j++){
    const from=j*step, to=Math.min(cfg.n,from+step);
    if(from>=to){ left--; continue; }
    const child=fork(__filename,['--from='+from,'--to='+to,'--seed='+cfg.seed,'--quiet'],
      {stdio:['ignore','pipe','inherit','ipc']});
    let buf='';
    child.stdout.on('data',d=>{ buf+=d.toString(); });
    child.on('close',code=>{
      if(failed) return;
      if(code!==0){ failed=true; done(new Error('Un processus de mesure a échoué (code '+code+').')); return; }
      try{ parts[j]=JSON.parse(buf); }
      catch(e){ failed=true; done(new Error('Mesure illisible d\'un processus : '+e.message)); return; }
      if(--left===0) done(null,mergeParts(parts.filter(x=>x)));
    });
  }
}

/* ------------------------------ 5) rapport --------------------------------- */
const pct=(x,n)=>n>0?Math.round(1000*x/n)/10:0;
const r3=x=>Math.round(x*1000)/1000;
/** Corrélation de Pearson entre l'écart de bilan x et le résultat y. */
function pearson(a){
  if(a.n<2) return 0;
  const cov=a.n*a.sxy-a.sx*a.sy;
  const vx=a.n*a.sxx-a.sx*a.sx, vy=a.n*a.syy-a.sy*a.sy;
  if(vx<=0||vy<=0) return 0;
  return cov/Math.sqrt(vx*vy);
}
/** Répartition KO / soumission / décision, nuls exclus, arrêt médical
 *  compté dans le KO (stoppage par coupure). */
function finShares(fam){
  const ko=fam.ko+fam.stop, sub=fam.sub, dec=fam.dec;
  const t=ko+sub+dec;
  return t>0?{ko:ko/t,sub:sub/t,dec:dec/t,total:t}:{ko:0,sub:0,dec:0,total:0};
}
function sharesDerived(fin){
  const t=fin.ko+fin.sub+fin.dec;
  return t>0?{ko:fin.ko/t,sub:fin.sub/t,dec:fin.dec/t,total:t}:{ko:0,sub:0,dec:0,total:0};
}

function report(A,cfg){
  const L=[];
  L.push('# Mesure Monte Carlo — le monde extérieur dérivé (lot 2B T1)');
  L.push('');
  L.push('Outil : `tools/monte-carlo-monde-exterieur.js` — jeu réel (jsdom), moteur réel `simulateFight`,');
  L.push('passerelle réelle du jeu (`mgmtCombatProfile`), traces dérivées réelles (`mgmtExteriorTrace`).');
  L.push('Aucune constante modifiée : mesure seule.');
  L.push('');
  L.push('- Graine de base : `'+cfg.seed+'`');
  L.push('- Combats mesurés par pool : '+cfg.n+' (paires de même catégorie, chaque combat sous sa propre graine)');
  L.push('- Pool « roster » : '+A.pools.roster+' lignes de `mgmtNewRoster` en '+A.pools.lots+' lots — LA référence (bilans générés par `correlatedRecord`)');
  L.push('- Pool « extérieur » : '+A.pools.ext+' lignes du vivier dérivé (cohorte initiale + '+EXT_CYCLES+' cycles d\'entrants), traces lues au cycle '+C_READ+' — âge moyen '+r3(A.ageMoyen)+' ans');
  L.push('- Combattants par catégorie (min sur les 12) : roster '+Math.min.apply(null,A.pools.parCat.roster)+', extérieur '+Math.min.apply(null,A.pools.parCat.ext));
  L.push('');
  L.push('Les deux pools passent par le MÊME pont vers le moteur (`mgmtCombatProfile` : le bilan dérivé');
  L.push('devient un niveau, le niveau devient un profil de combat) — le monde extérieur n\'a aucun');
  L.push('traitement de faveur et aucun traitement dégradé.');
  L.push('');
  L.push('## Cible 1 — le bilan prédit le résultat (§3.1)');
  L.push('');
  L.push('Pour chaque combat, x = écart des ratios de victoires des bilans (ce que l\'écran montre),');
  L.push('y = résultat observé (1 victoire de A, 0,5 nul, 0 défaite). La corrélation de Pearson r mesure');
  L.push('à quel point le bilan annonce le combat. Verdict : le monde dérivé est réaliste si son r est');
  L.push('du MÊME ORDRE que celui du roster — dans la bande [0,7 × r_roster ; 1,3 × r_roster], même signe.');
  L.push('');
  const rR=pearson(A.accRoster), rE=pearson(A.accExt);
  L.push('| Pool | n | r (bilan ↔ résultat) | nuls | Paires sautées |');
  L.push('|---|---|---|---|---|');
  L.push('| roster (correlatedRecord, référence) | '+A.accRoster.n+' | '+r3(rR)+' | '+A.accRoster.draws+' | '+A.accRoster.skipped+' |');
  L.push('| extérieur (monde dérivé) | '+A.accExt.n+' | '+r3(rE)+' | '+A.accExt.draws+' | '+A.accExt.skipped+' |');
  L.push('');
  L.push('Taux de victoire du favori du bilan (celui au meilleur ratio), par écart de bilan :');
  L.push('');
  L.push('| Écart de bilan | n roster | favori roster | n extérieur | favori extérieur |');
  L.push('|---|---|---|---|---|');
  const bornesB=['0 – 0,05','0,05 – 0,10','0,10 – 0,20','0,20 – 0,35','0,35 et plus'];
  for(let b=0;b<A.accRoster.buckets.length;b++){
    const br=A.accRoster.buckets[b], be=A.accExt.buckets[b];
    const tr=br.favWin+br.favNot, te=be.favWin+be.favNot;
    L.push('| '+bornesB[b]+' | '+br.n+' | '+(tr>0?pct(br.favWin,tr)+' %':'—')+' | '+be.n+' | '+(te>0?pct(be.favWin,te)+' %':'—')+' |');
  }
  L.push('');
  L.push('## Cible 2 — les fins de combats collent (§3.2)');
  L.push('');
  L.push('Référence moteur : la distribution réelle des combats du pool roster (mêmes combats que la');
  L.push('cible 1). Côté monde dérivé : la somme des fins des traces pro. L\'arrêt médical (stoppage par');
  L.push('coupure) compte dans le KO ; les nuls, rarissimes, sont comptés à part et exclus des parts.');
  L.push('Verdict : chaque part du monde dérivé à ±0,04 de la part mesurée du moteur.');
  L.push('');
  const eR=finShares(A.accRoster.fam), dP=sharesDerived(A.finPro), dT=sharesDerived({
    ko:A.finPro.ko+A.finAma.ko, sub:A.finPro.sub+A.finAma.sub, dec:A.finPro.dec+A.finAma.dec});
  L.push('| Famille | Moteur (n='+eR.total+') | Monde dérivé pro (n='+dP.total+') | Δ | Monde dérivé tout (n='+dT.total+') |');
  L.push('|---|---|---|---|---|');
  for(const k of ['ko','sub','dec']){
    const lbl={ko:'KO (et arrêt médical)',sub:'Soumission',dec:'Décision'}[k];
    L.push('| '+lbl+' | '+pct(eR[k],1)+' % | '+pct(dP[k],1)+' % | '+r3(dP[k]-eR[k])+' | '+pct(dT[k],1)+' % |');
  }
  L.push('| Nuls (hors part, information) | '+A.accRoster.fam.draw+' | 0 (la trace n\'en dérive pas) | — | 0 |');
  L.push('');
  const amaT=A.finAma.ko+A.finAma.sub+A.finAma.dec;
  L.push('Fins amateur du monde dérivé (information — la phase amateur est close avant l\'entrée dans');
  L.push('le monde, ses combats ne passent pas par le moteur) : KO '+pct(amaT>0?A.finAma.ko/amaT:0,1)+' %, soumission '+pct(amaT>0?A.finAma.sub/amaT:0,1)+' %, décision '+pct(amaT>0?A.finAma.dec/amaT:0,1)+' % (n='+amaT+').');
  L.push('');
  L.push('## Verdicts');
  L.push('');
  L.push('| Cible (§3) | Critère | Mesuré | Verdict |');
  L.push('|---|---|---|---|');
  const ok1=rE!==0&&((rR>=0&&rE>=0)||(rR<0&&rE<0))&&Math.abs(rE)>=0.7*Math.abs(rR)&&Math.abs(rE)<=1.3*Math.abs(rR);
  L.push('| 1. Le bilan prédit le résultat | r extérieur dans [0,7 × ; 1,3 ×] r roster, même signe | r_roster '+r3(rR)+', r_ext '+r3(rE)+' | '+(ok1?'ATTEINTE':'MANQUÉE')+' |');
  let ok2=true; const deltas={};
  for(const k of ['ko','sub','dec']){ deltas[k]=r3(dP[k]-eR[k]); if(Math.abs(dP[k]-eR[k])>0.04) ok2=false; }
  L.push('| 2. Les fins de combats collent | chaque part à ±0,04 du moteur | Δ KO '+deltas.ko+', Δ soumission '+deltas.sub+', Δ décision '+deltas.dec+' | '+(ok2?'ATTEINTE':'MANQUÉE')+' |');
  L.push('');
  L.push('Aucune cible interprétée à la main : les critères sont posés avant la mesure, la mesure');
  L.push('décide. Un écart mesuré est un défaut de la tranche : la dérivation se corrige, jamais la');
  L.push('cible (décision d\'auteur, LOT-2B §3).');
  L.push('');
  L.push('Reproductibilité : un même `--seed`/`--n` redonne exactement ces valeurs, en --serial comme');
  L.push('en parallèle (les pools repartent des graines de lots '+cfg.seed+'+100000+lot*97 et');
  L.push(''+cfg.seed+'+300000+lot*97 ; chaque combat i démarre sous '+cfg.seed+'+1000000+i (roster) ou');
  L.push(''+cfg.seed+'+2000000+i (extérieur)).');
  L.push('');
  return L.join('\n');
}

/* ------------------------------ 6) main ------------------------------------ */
(function main(){
  const cfg = parseArgs(process.argv.slice(2));
  /* Enfant : mesure son paquet contigu d'indices et rend ses compteurs en
     JSON brut — jamais de rapport, jamais un second fork (un enfant ne
     redistribue pas le travail). */
  if(cfg.worker){ process.stdout.write(measure(cfg)); return; }
  if(cfg.jobs<=1||cfg.n<200){
    const A=mergeParts([JSON.parse(measure(cfg))]);
    const md=report(A,cfg);
    if(!cfg.quiet) console.log(md);
    fs.writeFileSync(cfg.out,md);
    if(!cfg.quiet) console.log('\nRapport écrit : '+cfg.out);
    return;
  }
  measureParallel(cfg,(err,A)=>{
    if(err){ console.error(err.message); process.exitCode=1; return; }
    const md=report(A,cfg);
    if(!cfg.quiet) console.log(md);
    fs.writeFileSync(cfg.out,md);
    if(!cfg.quiet) console.log('\nRapport écrit : '+cfg.out);
  });
})();
