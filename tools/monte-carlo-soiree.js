"use strict";
/* CAGE LEGACY — tools/monte-carlo-soiree.js
   ============================================================================
   Lot 3A §8 — calibrage Monte Carlo du corps et de la soirée (audit du
   17/09 : X2, B2 — le script et son rapport demandés par le §8 du lot 3a
   n'avaient jamais été livrés). Charge le VRAI jeu dans un DOM virtuel
   (jsdom), dans l'ordre EXACT des <script src> d'index.html — lu
   directement depuis le fichier à chaque exécution (même principe que
   tools/monte-carlo-economie.js, qui ne dépend pas de tests/).

   Mesure, ne décide rien : aucune constante de calibrage n'est modifiée —
   les cibles du §8 sont comparées aux valeurs mesurées, chaque écart est
   signalé, jamais corrigé ici.

   Combattants : générés exactement comme le roster de Split (le vrai
   mgmtNewRoster, appelé sur des graines publiées), regroupés par catégorie,
   avec leur traumatisme dérivé du §3.1 (sur l'id d'origine du roster). Les
   bandes mesurées sont donc celles que le jeu produit réellement :

   - « léger » (traumatisme < 30) : corps de la catégorie dont le
     traumatisme dérivé est sous 30 ;
   - « usé » (traumatisme ≥ 60) : corps de la catégorie dont le traumatisme
     dérivé est au-dessus de MGMT_BODY_THRESHOLD — le roster initial en
     contient 10 à 15 % (cible 6), ces sous-pools sont minces par
     construction ;
   - « sain » : corps à traumatisme 0 — corps sain, base des taux de
     défaite par KO (cible 5).

   Quatre scénarios par catégorie, chacun avec un nombre fixe de combats
   (voir --n) :
   - « sain »        : deux corps à 0, même niveau (même bilan) — taux de
                       défaite par KO du corps A, base du ratio (cible 5) ;
   - « léger »       : deux corps < 30, traumatisme dérivé — fin de
                       carrière du corps A, PAR CORPS (cible 2) ;
   - « usé »         : deux corps ≥ 60, traumatisme dérivé — fin de
                       carrière (cible 4) ; suspension ≥ 90 j ou fin de
                       carrière (cible 3) — PAR CORPS ;
   - « usé-vs-sain » : corps usé ≥ 60 (traumatisme dérivé) contre corps
                       sain de même niveau (même bilan) — taux de défaite
                       par KO du corps usé, comparé au taux sain (cible 5).

   La suspension ≥ 90 j se lit sur `t.days` renvoyé par `mgmtApplyFight`
   (90 j : fracture ; 180 j : commotion, déchirure) ou sur la fin de
   carrière. Un corps mesuré démarre sous 100 : toute fin de carrière est
   atteinte PENDANT le combat, jamais héritée d'un état déjà à 100.

   Aucun Math.random() : la RNG du jeu (rnd(), seedée par setSeed) est la
   seule source de tirage. Chaque combat i de la catégorie d'index di part
   de setSeed(base + 1000009*di + i) ; les pools démarrent sous
   setSeed(base + 100000 + lot*97) — un run est intégralement
   reproductible pour un même --seed/--n.

   Parallélisme (lot 2, outillage) : les douze catégories sont indépendantes
   — chacune tire ses combats sous ses propres graines. Le parent répartit
   les catégories sur des processus enfants (un par cœur, au plus 12) et
   n'agrège que des compteurs entiers : les chiffres sont EXACTEMENT ceux
   d'une exécution sur un seul cœur. L'identité au moteur nu (cible 1) et la
   mesure du roster initial (cible 6) sont globales : elles sont calculées
   par le premier enfant seulement, sur les mêmes graines.

   Usage :
     node tools/monte-carlo-soiree.js [--seed=S] [--n=N] [--out=CHEMIN] [--quiet]
                                      [--jobs=N] [--serial]
   ============================================================================ */
const path = require('path');
const fs = require('fs');
const os = require('os');
const { fork } = require('child_process');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');

/* --------------------------- 1) CLI --------------------------------------- */
function parseArgs(argv){
  const out = { seed: 20260917, n: 20000, out: 'tools/reports/LOT-3A-CALIBRAGE-SOIREE.md', quiet: false,
    jobs: Math.max(1, Math.min(12, os.cpus().length)), divs: null, doGlobal: true, worker: false };
  for(const arg of argv){
    if(arg === '--quiet'){ out.quiet = true; continue; }
    if(arg === '--serial'){ out.jobs = 1; continue; }
    const m = /^--([a-zA-Z]+)=(.+)$/.exec(arg);
    if(!m) continue;
    const key=m[1], val=m[2];
    if(key === 'seed') out.seed = parseInt(val, 10) || out.seed;
    else if(key === 'n') out.n = Math.max(4, parseInt(val, 10) || out.n);
    else if(key === 'out') out.out = val;
    else if(key === 'jobs') out.jobs = Math.max(1, Math.min(12, parseInt(val, 10) || out.jobs));
    /* Mode enfant (interne) : la liste des index de catégories à mesurer, et
       si cet enfant porte les mesures globales (identité, roster). */
    else if(key === 'divs'){ out.worker = true; out.divs = val.split(',').map(x=>parseInt(x,10)).filter(x=>x>=0); }
    else if(key === 'global') out.doGlobal = val === '1';
  }
  /* Le chemin de sortie est relatif à la racine du dépôt, sauf s'il est
     déjà absolu (path.join renvoie l'absolu tel quel). */
  out.out = path.isAbsolute(out.out) ? out.out : path.join(ROOT, out.out);
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
/** Mesure les catégories demandées (cfg.divs, ou toutes) dans une fenêtre
 *  neuve. Les graines ne dépendent que de la catégorie et du combat : le
 *  découpage ne change aucun chiffre.
 *  @returns {string} JSON des compteurs. */
function measure(cfg){
  const win = newGameWindow();
  /* Toute la boucle vit côté fenêtre (accès direct aux fonctions du jeu,
     aucun aller-retour d'évaluation par combat) ; les agrégats reviennent
     en JSON. */
  const agg = win.eval(`(function(){
    const N=${cfg.n}, BASE=${cfg.seed};
    const DIVS=${cfg.divs?JSON.stringify(cfg.divs):'null'}, DO_GLOBAL=${cfg.doGlobal?'true':'false'};
    const POOL_MIN=60, BATCH_MAX=400;

    /* ---- 1) Pools par catégorie : rosters générés comme celui de Split ---- */
    const pools={}, divNames={};
    const rosterAll=[]; /* toutes les lignes générées, pour la mesure du roster initial */
    function poolsPretes(){
      let n=0;
      for(const d of allDivisions()){ if((pools[d.id]||[]).length>=POOL_MIN) n++; }
      return n;
    }
    for(let batch=0;batch<BATCH_MAX&&poolsPretes()<12;batch++){
      setSeed(BASE+100000+batch*97);
      const m=mgmtDefault(); mgmtNewRoster(m);
      for(const o of m.roster){
        /* Une seule source de vérité : le clone (id unique par lot) porte
           son propre traumatisme dérivé — le filtre des bandes et le combat
           lisent exactement la même dérivation. */
        const c=JSON.parse(JSON.stringify(o));
        c.id='p'+batch+'_'+o.id; /* id unique par lot : hachage de profil distinct */
        c._trauma=mgmtTrauma(c);
        rosterAll.push({div:c.div,trauma:c._trauma});
        (pools[c.div]=pools[c.div]||[]).push(c);
        if(!divNames[c.div]) divNames[c.div]=c.divName;
      }
    }
    /* Sous-pools par bande de corps (traumatisme dérivé du roster). */
    const leger={}, use={};
    for(const dId of Object.keys(pools)){
      leger[dId]=pools[dId].filter(o=>o._trauma<30);
      use[dId]=pools[dId].filter(o=>o._trauma>=60);
    }

    /* ---- 2) Tirage seedé d'une paire de la même catégorie ---- */
    function pickPair(pool){
      const i=Math.floor(rnd()*pool.length);
      let j=Math.floor(rnd()*(pool.length-1));
      if(j>=i) j++;
      return [pool[i],pool[j]];
    }

    /* ---- 3) Un combat : le chemin exact de mgmtRunEvent ---- */
    function combat(m,fA,fB){
      const res=simulateFight(mgmtFightReady(fA),mgmtFightReady(fB),3);
      const fam=mgmtMethodFamily(res.method,res.winner);
      const ta=mgmtApplyFight(m,fA,fB,res,'A');
      const tb=mgmtApplyFight(m,fB,fA,res,'B');
      return {winner:res.winner,fam,ta,tb};
    }

    /* ---- 4) Mesure 1 : corps à 0 = moteur nu, même graine (480 paires) ---- */
    let identN=0, identEcart=0;
    const dIds=Object.keys(pools);
    for(let k=0;DO_GLOBAL&&k<480;k++){
      const pool=pools[dIds[k%dIds.length]];
      if(pool.length<2) continue;
      setSeed(BASE+900000+k);
      const [ra,rb]=pickPair(pool);
      const A=JSON.parse(JSON.stringify(ra)), B=JSON.parse(JSON.stringify(rb));
      A.trauma=0; B.trauma=0;
      const profA=mgmtCombatProfile(A), profB=mgmtCombatProfile(B);
      setSeed(BASE+800000+k);
      const nu=simulateFight(JSON.parse(JSON.stringify(profA)),JSON.parse(JSON.stringify(profB)),3);
      setSeed(BASE+800000+k);
      const pret=simulateFight(mgmtFightReady(A),mgmtFightReady(B),3);
      identN++;
      if(JSON.stringify(nu)!==JSON.stringify(pret)) identEcart++;
    }

    /* ---- 5) Scénarios par catégorie : N combats par catégorie, quatre
       scénarios de N/4 — chaque combat part de sa propre graine. ---- */
    const divs=allDivisions();
    const acc={}, idx={};
    for(let di=0;di<divs.length;di++){
      if(DIVS&&DIVS.indexOf(di)<0) continue;
      const dId=divs[di].id;
      const a={n:0,fin30:0,susp90:0,fin60:0,koUse:0,koSain:0,nLeger:0,nUse:0};
      acc[dId]=a; idx[dId]=di;
      const m={cycle:0,facts:[],roster:pools[dId]||[]};
      const per=Math.floor(N/4);
      /* Scénario « sain » : deux corps à 0, même niveau. */
      if(pools[dId]&&pools[dId].length>=2){
        a.nSain=per;
        for(let i=0;i<per;i++){
          setSeed(BASE+1000009*di+i);
          const [ra,rb]=pickPair(pools[dId]);
          const A=JSON.parse(JSON.stringify(ra)), B=JSON.parse(JSON.stringify(rb));
          A.trauma=0; B.trauma=0; B.W=A.W; B.L=A.L; B.D=A.D;
          const out=combat(m,A,B);
          if(out.winner==='B'&&out.fam==='ko') a.koSain++;
        }
      }
      /* Scénario « léger » : deux corps < 30, traumatisme dérivé — le
         taux se lit PAR CORPS : la fin de carrière du corps A. */
      if(leger[dId]&&leger[dId].length>=2){
        a.nLeger=per;
        for(let i=0;i<per;i++){
          setSeed(BASE+2000009*di+i);
          const [ra,rb]=pickPair(leger[dId]);
          const A=JSON.parse(JSON.stringify(ra)), B=JSON.parse(JSON.stringify(rb));
          const out=combat(m,A,B);
          if(out.ta&&out.ta.retired) a.fin30++;
        }
      }
      /* Scénario « usé » : deux corps ≥ 60, traumatisme dérivé — le taux
         se lit PAR CORPS : la fin de carrière du corps A, et sa suspension
         ≥ 90 j (ou sa fin de carrière). */
      if(use[dId]&&use[dId].length>=2){
        a.nUse=per;
        for(let i=0;i<per;i++){
          setSeed(BASE+3000009*di+i);
          const [ra,rb]=pickPair(use[dId]);
          const A=JSON.parse(JSON.stringify(ra)), B=JSON.parse(JSON.stringify(rb));
          const out=combat(m,A,B);
          const ta=out.ta;
          if(ta&&ta.retired) a.fin60++;
          if(ta&&(ta.retired||(Number.isSafeInteger(ta.days)&&ta.days>=90))) a.susp90++;
        }
      }
      /* Scénario « usé-vs-sain » : corps usé ≥ 60 (traumatisme dérivé)
         contre corps sain à 0 de même niveau (même bilan). */
      if(use[dId]&&use[dId].length>=2&&pools[dId]&&pools[dId].length>=2){
        a.nUseSain=per;
        for(let i=0;i<per;i++){
          setSeed(BASE+4000009*di+i);
          const [ra,rb]=pickPair(use[dId]);
          const A=JSON.parse(JSON.stringify(ra)), B=JSON.parse(JSON.stringify(rb));
          B.trauma=0; B.W=A.W; B.L=A.L; B.D=A.D;
          const out=combat(m,A,B);
          if(out.winner==='B'&&out.fam==='ko') a.koUse++;
        }
      }
    }

    /* ---- 6) Roster initial au-dessus du seuil (MGMT_BODY_THRESHOLD) ---- */
    let rN=0, rGt=0, rGe=0;
    for(const x of rosterAll){
      rN++;
      if(x.trauma>MGMT_BODY_THRESHOLD) rGt++;
      if(x.trauma>=MGMT_BODY_THRESHOLD) rGe++;
    }

    return JSON.stringify({acc,divNames,idx,
      ident:{n:identN,ecart:identEcart},
      roster:{n:rN,gt:rGt,ge:rGe},
      seuil:MGMT_BODY_THRESHOLD,perScen:Math.floor(N/4)});
  })()`);
  return agg;
}

/* --------------------- 4) répartition sur les cœurs ------------------------ */
/** Fusionne les mesures des enfants dans l'ordre canonique des catégories :
 *  les compteurs sont des entiers par catégorie, rien ne se recalcule.
 *  @returns {object} */
function mergeParts(parts){
  const acc={}, divNames={}, idx={};
  let ident=null, roster=null, seuil=null, perScen=null;
  for(const p of parts){
    Object.assign(divNames,p.divNames);
    Object.assign(idx,p.idx);
    for(const dId of Object.keys(p.acc)) acc[dId]=p.acc[dId];
    if(p.ident&&p.ident.n>0) ident=p.ident;
    if(p.roster&&p.roster.n>0&&!roster) roster=p.roster;
    if(seuil===null) seuil=p.seuil;
    if(perScen===null) perScen=p.perScen;
  }
  const ordered={};
  for(const dId of Object.keys(acc).sort((x,y)=>idx[x]-idx[y])) ordered[dId]=acc[dId];
  return {acc:ordered,divNames,ident:ident||{n:0,ecart:0},roster:roster||{n:0,gt:0,ge:0},seuil,perScen};
}

/** Lance un enfant par paquet de catégories et rend les mesures fusionnées.
 *  Le premier paquet porte les mesures globales (identité, roster). */
function measureParallel(cfg,done){
  const nDiv=12;
  const jobs=Math.min(cfg.jobs,nDiv);
  const packs=[];
  for(let i=0;i<jobs;i++) packs.push([]);
  for(let di=0;di<nDiv;di++) packs[di%jobs].push(di);
  const parts=[];
  let left=packs.length, failed=false;
  packs.forEach((pack,i)=>{
    const args=['--divs='+pack.join(','),'--global='+(i===0?'1':'0'),
      '--seed='+cfg.seed,'--n='+cfg.n];
    const child=fork(__filename,args,{stdio:['ignore','pipe','inherit','ipc']});
    let buf='';
    child.stdout.on('data',d=>{ buf+=d.toString(); });
    child.on('close',code=>{
      if(failed) return;
      if(code!==0){ failed=true; done(new Error('Un processus de mesure a échoué (code '+code+').')); return; }
      try{ parts.push(JSON.parse(buf)); }
      catch(e){ failed=true; done(new Error('Mesure illisible d\'un processus : '+e.message)); return; }
      if(--left===0) done(null,mergeParts(parts));
    });
  });
}

/* ------------------------------ 5) rapport --------------------------------- */
function report(A,cfg){
  const pct=(x,n)=>n>0?Math.round(10000*x/n)/100:0;

  /* Agrégats par scénario, toutes catégories confondues. */
  const g={};
  for(const dId of Object.keys(A.acc)){
    const a=A.acc[dId];
    for(const c of ['nSain','nLeger','nUse','nUseSain']){
      if(!a[c]) continue;
      g[c]=g[c]||{x:0,n:0};
      g[c].n+=a[c];
    }
    for(const [c,acc2] of [['fin30','nLeger'],['susp90','nUse'],['fin60','nUse'],['koUse','nUseSain'],['koSain','nSain']]){
      g[c]=g[c]||{x:0,n:0};
      g[c].x+=a[c]; g[c].n+=a[acc2]||0;
    }
  }
  const rate=c=>g[c]?pct(g[c].x,g[c].n):null;
  const gFin30=rate('fin30'), gSusp90=rate('susp90'), gFin60=rate('fin60');
  const gKoUse=rate('koUse'), gKoSain=rate('koSain');
  const ratioGlobal=(g.koSain&&g.koSain.x>0)?Math.round(1000*(g.koUse.x/g.koSain.x))/1000:null;
  const rosterGt=pct(A.roster.gt,A.roster.n), rosterGe=pct(A.roster.ge,A.roster.n);

  /* Verdicts §8 (cibles décidées par l'auteur, jamais corrigées ici). */
  const verdicts=[
    {lib:'1. Deux corps à traumatisme 0 — identiques au moteur nu, même graine',
     cible:'identique au moteur nu, même graine',
     mesure:A.ident.ecart+' écart(s) sur '+A.ident.n+' paires',
     ok:A.ident.ecart===0},
    {lib:'2. Fin de carrière sur un combat, corps < 30',
     cible:'< 0,5 %',
     mesure:gFin30===null?'corps insuffisants':(gFin30+' %'),
     ok:gFin30!==null&&gFin30<0.5},
    {lib:'3. Suspension ≥ 90 j ou fin de carrière, corps ≥ 60',
     cible:'20 à 30 %',
     mesure:gSusp90===null?'corps insuffisants':(gSusp90+' %'),
     ok:gSusp90!==null&&gSusp90>=20&&gSusp90<=30},
    {lib:'4. Fin de carrière sur un combat, corps ≥ 60',
     cible:'8 à 12 %',
     mesure:gFin60===null?'corps insuffisants':(gFin60+' %'),
     ok:gFin60!==null&&gFin60>=8&&gFin60<=12},
    {lib:'5. Défaite par KO, corps ≥ 60 contre corps sain de même niveau',
     cible:'au moins 1,5 × le taux sain',
     mesure:(gKoSain===null||gKoUse===null)?'corps insuffisants':(ratioGlobal===null?'taux sain nul, ratio indéterminable':(ratioGlobal+' ×')),
     ok:gKoSain!==null&&gKoUse!==null&&ratioGlobal!==null&&ratioGlobal>=1.5},
    {lib:'6. Roster initial au-dessus du seuil',
     cible:'10 à 15 %',
     mesure:rosterGt+' % (> '+A.seuil+')',
     ok:rosterGt>=10&&rosterGt<=15},
  ];

  /* ------------------------------ rapport -------------------------------- */
  const totalCombats=['nSain','nLeger','nUse','nUseSain'].reduce((s,c)=>s+(g[c]?g[c].n:0),0);
  const L=[];
  L.push('# Calibrage Monte Carlo — le corps et la soirée (lot 3a §8)');
  L.push('');
  L.push('Outil : `tools/monte-carlo-soiree.js` — jeu réel (jsdom), moteur réel `simulateFight`,');
  L.push('conséquences réelles `mgmtApplyFight`. Aucune constante modifiée : mesure seule.');
  L.push('');
  L.push('- Graine de base : `'+cfg.seed+'`');
  L.push('- Combats par catégorie : '+cfg.n+' (12 catégories — '+totalCombats+' combats au total)');
  L.push('- Combats par scénario et par catégorie : '+A.perScen+' ('+(A.perScen*12)+' par scénario au total)');
  L.push('- Combattants générés comme le roster de Split : '+A.roster.n+' (traumatisme dérivé sur les ids d\'origine)');
  L.push('- Paires identité (cible 1) : '+A.ident.n+' paires, toutes catégories');
  L.push('');
  L.push('## Définitions mesurées');
  L.push('');
  L.push('| Scénario | Définition |');
  L.push('|---|---|');
  L.push('| sain | deux corps à traumatisme 0, même niveau (même bilan) — taux de défaite par KO du corps A |');
  L.push('| léger | deux corps de traumatisme dérivé < 30 — fin de carrière du corps A, par combat joué par ce corps |');
  L.push('| usé | deux corps de traumatisme dérivé ≥ 60 — fin de carrière du corps A (cible 4) ; suspension ≥ 90 j ou fin de carrière du corps A (cible 3) |');
  L.push('| usé-vs-sain | corps usé ≥ 60 (traumatisme dérivé) contre corps sain à 0 de même niveau — taux de défaite par KO du corps usé |');
  L.push('');
  L.push('Un corps mesuré démarre sous 100 : toute fin de carrière est atteinte pendant le combat,');
  L.push('jamais héritée d\'un état déjà à 100. La suspension ≥ 90 j se lit sur `t.days` renvoyé par');
  L.push('`mgmtApplyFight` : 90 j (fracture) ou 180 j (commotion, déchirure), ou la fin de carrière.');
  L.push('');
  L.push('## Résultats par catégorie');
  L.push('');
  L.push('| Catégorie | Id | Sain (n) | Fin carrière < 30 | Susp ≥ 90 j ou fin ≥ 60 | Fin carrière ≥ 60 | KO subi, corps usé | KO subi, corps sain | Ratio usé/sain |');
  L.push('|---|---|---|---|---|---|---|---|---|');
  for(const dId of Object.keys(A.acc)){
    const a=A.acc[dId];
    const per=A.perScen;
    const ratio=a.nSain?(a.koSain>0?Math.round(1000*(a.koUse/a.koSain))/1000:(a.koUse>0?'∞ (taux sain nul)':'—')):'—';
    L.push(['| '+(A.divNames[dId]||dId)+' | '+dId+' | '
      +(a.nSain?a.nSain:'—')+' | '
      +(a.nLeger?pct(a.fin30,a.nLeger)+' %':'—')+' | '
      +(a.nUse?pct(a.susp90,a.nUse)+' %':'—')+' | '
      +(a.nUse?pct(a.fin60,a.nUse)+' %':'—')+' | '
      +(a.nUseSain?pct(a.koUse,a.nUseSain)+' %':'—')+' | '
      +(a.nSain?pct(a.koSain,a.nSain)+' %':'—')+' | '
      +ratio+' |'].join(''));
  }
  L.push(['| **Toutes catégories** | | ',
    (g.nSain?g.nSain.n+' sain, ':'')+(g.nLeger?g.nLeger.n+' léger, ':'')+(g.nUse?g.nUse.n+' usé, ':'')
      +(g.nUseSain?g.nUseSain.n+' usé-vs-sain':'')+' | '
      +(gFin30===null?'—':('**'+gFin30+' %**'))+' | '
      +(gSusp90===null?'—':('**'+gSusp90+' %**'))+' | '
      +(gFin60===null?'—':('**'+gFin60+' %**'))+' | '
      +(gKoUse===null?'—':('**'+gKoUse+' %**'))+' | '
      +(gKoSain===null?'—':('**'+gKoSain+' %**'))+' | '
      +'**'+(ratioGlobal===null?'—':(ratioGlobal+'×'))+'** |'].join(''));
  L.push('');
  L.push('## Roster initial au-dessus du seuil (MGMT_BODY_THRESHOLD = '+A.seuil+')');
  L.push('');
  L.push('| Mesure | Valeur |');
  L.push('|---|---|');
  L.push('| combattants générés | '+A.roster.n+' |');
  L.push('| traumatisme > '+A.seuil+' | '+rosterGt+' % |');
  L.push('| traumatisme ≥ '+A.seuil+' | '+rosterGe+' % |');
  L.push('');
  L.push('## Cibles §8 — mesuré contre cible');
  L.push('');
  L.push('| Mesure §8 | Cible | Mesuré | Verdict |');
  L.push('|---|---|---|---|');
  for(const x of verdicts){
    L.push('| '+x.lib+' | '+x.cible+' | '+x.mesure+' | '+(x.ok?'ATTEINTE':'MANQUÉE')+' |');
  }
  L.push('');
  const manques=verdicts.filter(x=>!x.ok);
  if(manques.length===0){
    L.push('Aucune cible manquée.');
  }else{
    L.push('## Cibles manquées — signalées, aucune constante modifiée');
    L.push('');
    for(const x of manques){ L.push('- **'+x.mesure+' mesuré contre « '+x.cible+' »** ('+x.lib+').'); }
  }
  L.push('');
  L.push('Reproductibilité : un même `--seed`/`--n` redonne exactement ces valeurs. Les pools sont');
  L.push('générés sous `setSeed(base + 100000 + lot*97)` ; chaque combat i de la catégorie d\'index');
  L.push('di démarre sous `setSeed(base + (1..4)*1000009*di + i)` selon son scénario.');
  L.push('');

  fs.writeFileSync(cfg.out,L.join('\n'));
  if(cfg.quiet){
    console.log('Rapport écrit : '+cfg.out);
    for(const x of verdicts){ console.log((x.ok?'ATTEINTE':'MANQUÉE')+' — '+x.lib+' : '+x.mesure+' (cible '+x.cible+')'); }
  }else{
    console.log(L.join('\n'));
    console.log('\nRapport écrit : '+cfg.out);
  }
}

/* ------------------------------ 6) main ------------------------------------ */
(function main(){
  const cfg = parseArgs(process.argv.slice(2));
  /* Enfant : mesure son paquet de catégories et rend ses compteurs. */
  if(cfg.worker){ process.stdout.write(measure(cfg)); return; }
  if(cfg.jobs<=1){ report(JSON.parse(measure(cfg)),cfg); return; }
  measureParallel(cfg,(err,A)=>{
    if(err){ console.error(err.message); process.exitCode=1; return; }
    report(A,cfg);
  });
})();
