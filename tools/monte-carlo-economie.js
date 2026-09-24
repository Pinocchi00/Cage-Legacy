"use strict";
/* CAGE LEGACY — tools/monte-carlo-economie.js
   ============================================================================
   Lot 2 T4 — l'argent sur le déroulé réel, REPRIS le 21/09/2026
   (docs/LOT-2-CARTE-PRINCIPALE.md §T4 et §4 bis « Relecture de la T4 » ;
   cibles : docs/LOT-3B-CONTRAT.md §3 T1 — décisions d'auteur, jamais revues).
   Charge le VRAI jeu dans un DOM virtuel (jsdom), dans l'ordre EXACT des
   <script src> de index.html (lu directement depuis le fichier à chaque
   exécution), et joue le VRAI déroulé d'une soirée Split :

     1. un état Split neuf (mgmtDefault + mgmtNewRoster, graines publiées) ;
     2. le cycle s'ouvre (mgmtNewPile) — le joueur-type ignore les
        propositions simples de Leïla (ignorer est une décision, CDC §4.1) ;
     3. le joueur-type compose lui-même ses cinq combats de carte
        principale par le vrai geste (mgmtBookMain, lot 2 T2) ;
     4. Leïla propose la carte préliminaire à la cinquième place
        (mgmtOfferBulk déclenché par le booking, lot 2 T3) — le joueur-type
        la valide (mgmtDecide 'validate') ;
     5. la soirée se joue par mgmtRunEvent : attrait et cachets lus sur
        les lignes d'avant combat, combats par simulateFight, conséquences
        réelles (mgmtApplyFight), recette nette R = billetterie + droits
        du diffuseur − cachets, trésorerie T ← T + R.

   TROIS joueurs-types et un oracle (proxies assumés, heuristiques
   documentées ici). LES CIBLES SE JUGENT SUR LE JOUEUR D'ÉCRAN SEUL :

   - « joueur d'écran » — le joueur ordinaire, celui que l'outil calibre :
     il ne voit et n'utilise QUE ce que l'écran de composition affiche
     (§T2 : la catégorie f.div, le rang mgmtDivisionRank, le bilan —
     aucune note, aucune jauge). Sa règle : à chaque place libre, prendre
     le combattant disponible le mieux classé de sa catégorie (le plus
     petit rang dans la sienne ; à égalité, le premier dans l'ordre de la
     liste — mgmtCartRows : catégorie canonique puis rang), puis
     l'apparier au disponible de la même catégorie dont le rang est le
     plus proche du sien. Si mgmtBookMain refuse la paire, il essaie le
     candidat suivant, puis, à défaut, le combattant suivant — jamais
     l'abandon sur un refus. Il ne lit JAMAIS mgmtFightDraw, mgmtStar,
     mgmtPurse, mgmtCardAttraction ni mgmtEventRecette pour choisir : ces
     fonctions ne servent qu'à mesurer, après coup.
   - « oracle » — BORNE HAUTE, NE SERT À AUCUNE CIBLE. C'est l'heuristique
     de la T4 livrée (933ce41) : la meilleure paire disjointe de même
     catégorie disponible par attrait décroissant (mgmtFightDraw). Il
     maximise directement la grandeur que l'écran ne montre pas : il sert
     UNIQUEMENT à montrer l'écart entre un joueur ordinaire et un joueur
     parfait. Aucune cible n'est jugée sur lui.
   - « bâclé » — le joueur négligent, borne basse du déroulé réel : ses
     cinq combats sont tirés au hasard seedé parmi les paires de même
     catégorie disponibles bâclées au sens du jeu (gros écart de bilan
     ≥ MGMT_SLOPPY_GAP, ou écart de rang > MGMT_RANK_GAP — le
     cross-division n'existe plus : mgmtBookMain refuse les catégories
     différentes) ; à défaut de cinq paires bâclées disjointes, il
     complète au hasard. Puis il ÉCRASE cinq propositions de Leïla avant
     de valider la sixième — le coût de l'écrasement (addendum §12)
     s'accumule d'une soirée à l'autre (mgmtSloppyProb, plafond 0,65).
     C'est la carte écrasée telle que le jeu la produit réellement.
   - « réduite (8) » — la carte complète du JOUEUR D'ÉCRAN moins son prélim
     d'attrait le plus faible (QO-7 : moins de combats = moins d'attrait,
     la qualité des combats restants décide). mgmtRunEvent refuse une
     carte incomplète : la mesure se fait sur les clones d'avant combat
     (mgmtFightReady) avec la vraie finance (mgmtEventRecette, droits au
     prorata 8/9 des combats joués). L'audience est comparée à la
     référence D4 d'avant première soirée (mgmtAudienceRef sans
     historique — constante du run, indépendante de l'ordre des soirées :
     exigence de parallélisme bit à bit).

   Aucun Math.random() : la RNG du jeu (rnd(), seedée par setSeed) est la
   seule source de tirage. Chaque soirée r part de setSeed(base + r)
   (oracle), setSeed(base + 1000000 + r) (joueur d'écran et sa réduite) et
   setSeed(base + 2000000 + r) (bâclé) — un run est intégralement
   reproductible pour un même --seed/--n/--soirees.

   --soirees=K (défaut 1) : K soirées ENCHAÎNÉES sur la même organisation
   (mgmtNewPile entre chaque, la carte se vide à chaque mgmtRunEvent) —
   la carrière d'une organisation, pour voir si l'économie s'améliore
   quand elle vieillit et que les combattants gagnent en notoriété. À K=1,
   chaque soirée repart d'un état neuf : les chiffres sont ceux d'une
   organisation au premier jour. Le rapport publie les deux lectures.

   Parallélisme (même découpage que tools/monte-carlo-soiree.js) : les
   carrières sont indépendantes — chacune part de sa propre graine et d'un
   état neuf. Le parent répartit les carrières sur des processus enfants
   (paquets contigus, au plus 12) et reçoit les finance brutes, soirée par
   soirée, dans l'ordre des graines : les chiffres sont EXACTEMENT ceux
   d'une exécution --serial (preuve : même graine, mêmes tableaux).

   L'outil ne persiste jamais : mgmtRunEvent appelle saveMgmt(), qui sort
   d'elle-même quand G est nul — aucun localStorage écrit, rien à lire.

   Usage :
     node tools/monte-carlo-economie.js [--seed=S] [--n=N | --cards=N]
        [--soirees=K] [--out=CHEMIN] [--quiet] [--jobs=N] [--serial]
   ============================================================================ */
const path = require('path');
const fs = require('fs');
const os = require('os');
const { fork } = require('child_process');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');

/* --------------------------- 1) CLI --------------------------------------- */
function parseArgs(argv){
  const out = { seed: 20260919, cards: 4000, soirees: 1, out: 'tools/reports/LOT-2-T4-CALIBRAGE-ECONOMIE.md', quiet: false,
    jobs: Math.max(1, Math.min(12, os.cpus().length)), worker: false, from: 0, to: 0 };
  for(const arg of argv){
    if(arg === '--quiet'){ out.quiet = true; continue; }
    if(arg === '--serial'){ out.jobs = 1; continue; }
    const m = /^--([a-zA-Z]+)=(.+)$/.exec(arg);
    if(!m) continue;
    const key=m[1], val=m[2];
    if(key === 'seed') out.seed = parseInt(val, 10) || out.seed;
    else if(key === 'cards') out.cards = Math.max(1, parseInt(val, 10) || out.cards);
    else if(key === 'n') out.cards = Math.max(1, parseInt(val, 10) || out.cards);
    else if(key === 'soirees') out.soirees = Math.max(1, parseInt(val, 10) || out.soirees);
    else if(key === 'out') out.out = val;
    else if(key === 'jobs') out.jobs = Math.max(1, Math.min(12, parseInt(val, 10) || out.jobs));
    /* Mode enfant (interne) : le paquet contigu de carrières à mesurer. */
    else if(key === 'from'){ out.worker = true; out.from = parseInt(val, 10) || 0; }
    else if(key === 'to'){ out.worker = true; out.to = parseInt(val, 10) || 0; }
  }
  /* Le chemin de sortie est relatif à la racine du dépôt, sauf s'il est
     déjà absolu (path.join renvoie l'absolu tel quel). */
  out.out = path.isAbsolute(out.out) ? out.out : path.join(ROOT, out.out);
  /* Hors mode enfant (aucun --from/--to) : tout l'intervalle des carrières. */
  if(!out.worker){ out.from = 0; out.to = out.cards; }
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
/** Mesure les carrières [from, to) du déroulé réel dans une fenêtre neuve.
 *  Les graines ne dépendent que de la carrière : le découpage ne change
 *  aucun chiffre. @returns {string} JSON des finance brutes. */
function measure(cfg){
  const win = newGameWindow();
  /* Toute la boucle vit côté fenêtre (accès direct aux fonctions du jeu,
     aucun aller-retour d'évaluation par soirée) ; les agrégats reviennent
     en JSON. */
  const agg = win.eval(`(function(){
    const BASE=${cfg.seed}, FROM=${cfg.from}, TO=${cfg.to}, K=${cfg.soirees};
    const out={oracle:[],ecran:[],reduite:[],batcle:[],echecs:{oracle:0,ecran:0,batcle:0},
      nonComposees:{oracle:0,ecran:0,batcle:0},sloppyPre:0,preN:0,ref:0,cst:{},dispo:[],susps:[]};
    for(let j=0;j<K;j++){ out.oracle.push([]); out.ecran.push([]); out.reduite.push([]); out.batcle.push([]);
      out.dispo.push([]); out.susps.push([]); }

    /* ---- L'oracle (BORNE HAUTE — ne sert à AUCUNE cible) : à chaque
       place, la meilleure paire disjointe de même catégorie disponible,
       par attrait décroissant (mgmtFightDraw sur les lignes d'avant
       booking ; à égalité, l'ordre du roster départage). Pur : aucun
       tirage dans l'heuristique. Le vrai geste : mgmtBookMain. ==== */
    function composeMainOracle(m){
      for(let k=0;k<MGMT_MAIN_SIZE;k++){
        let best=null;
        const r=m.roster;
        for(let i=0;i<r.length;i++){
          const A=r[i];
          if(!mgmtAvailable(m,A)||mgmtEngaged(m,A)) continue;
          for(let j=i+1;j<r.length;j++){
            const B=r[j];
            if(B.div!==A.div||A.first===B.first) continue;
            if(!mgmtAvailable(m,B)||mgmtEngaged(m,B)) continue;
            const d=mgmtFightDraw(A,B);
            if(!best||d>best.d) best={a:A.id,b:B.id,d:d};
          }
        }
        if(!best||!mgmtBookMain(m,best.a,best.b)) return false;
      }
      return true;
    }

    /* ---- Le joueur d'écran (§T2 — la seule heuristique qui sert les
       cibles) : il ne voit et n'utilise QUE ce que l'écran de composition
       affiche — la catégorie (f.div), le rang dans la catégorie
       (mgmtDivisionRank) et le bilan. La règle : à chaque place libre,
       prendre le combattant disponible le mieux classé de sa catégorie
       (le plus petit rang dans la sienne ; à égalité, le premier dans
       l'ordre de la liste — mgmtCartRows : catégorie canonique puis
       rang), puis l'apparier au disponible de la même catégorie dont le
       rang est le plus proche du sien. Si mgmtBookMain refuse la paire,
       essayer le candidat suivant, puis, à défaut, le combattant suivant
       — jamais d'abandon sur un refus. La sélection passe par
       mgmtSelectable, le filtre de la liste de composition ; la règle
       n'appelle jamais mgmtFightDraw, mgmtStar, mgmtPurse,
       mgmtCardAttraction ni mgmtEventRecette pour choisir. ==== */
    function composeMainEcran(m){
      for(let k=0;k<MGMT_MAIN_SIZE;k++){
        /* La liste telle que l'écran l'affiche (catégorie canonique puis
           rang), réduite aux lignes que la liste laisse choisir. */
        const liste=mgmtCartRows(m).filter(o=>mgmtSelectable(m,o,null));
        if(liste.length===0) return false;
        const pos=new Map();
        liste.forEach((o,i)=>pos.set(o.id,i));
        const rang=new Map();
        for(const o of liste) rang.set(o.id,mgmtDivisionRank(m,o));
        /* Choix possibles, du mieux classé au moins bien classé : le plus
           petit rang d'abord, à égalité l'ordre de la liste. */
        const choix=liste.slice().sort((x,y)=>{
          const rx=rang.get(x.id), ry=rang.get(y.id);
          return rx-ry||pos.get(x.id)-pos.get(y.id);
        });
        let pose=false;
        for(let ci=0;ci<choix.length&&!pose;ci++){
          const F=choix[ci], rf=rang.get(F.id);
          /* Adversaires de sa catégorie, du rang le plus proche au plus
             éloigné ; à égalité, l'ordre de la liste. */
          const opps=liste.filter(o=>o.id!==F.id&&o.div===F.div)
            .sort((x,y)=>{
              const dx=Math.abs(rang.get(x.id)-rf), dy=Math.abs(rang.get(y.id)-rf);
              return dx-dy||pos.get(x.id)-pos.get(y.id);
            });
          for(const B of opps){
            if(mgmtBookMain(m,F.id,B.id)){ pose=true; break; }
          }
          /* Aucun adversaire ne passe : combattant suivant. */
        }
        /* Aucune paire ne se pose : pot épuisé (compté, publié). */
        if(!pose) return false;
      }
      return true;
    }

    /* ---- Le joueur bâclé (§T4, borne basse du déroulé réel) : ses cinq
       combats sont tirés au hasard seedé parmi les paires de même
       catégorie disponibles bâclées au sens du jeu (gros écart de bilan
       ≥ MGMT_SLOPPY_GAP ou écart de rang > MGMT_RANK_GAP) ; à défaut, au
       hasard parmi les paires de même catégorie restantes. ==== */
    function composeMainBatcle(m){
      const r=m.roster;
      const rankCache=new Map();
      const rankOf=f=>{ let v=rankCache.get(f.id); if(v===undefined){ v=mgmtDivisionRank(m,f); rankCache.set(f.id,v); } return v; };
      const slob=[], any=[];
      for(let i=0;i<r.length;i++){
        for(let j=i+1;j<r.length;j++){
          const A=r[i], B=r[j];
          if(A.div!==B.div||A.first===B.first) continue;
          if(!mgmtAvailable(m,A)||!mgmtAvailable(m,B)) continue;
          const ra=rankOf(A), rb=rankOf(B);
          const gap=(ra!==null&&rb!==null)?Math.abs(ra-rb):MGMT_RANK_GAP+1;
          if(mgmtRecGap(A,B)>=MGMT_SLOPPY_GAP||gap>MGMT_RANK_GAP) slob.push([A,B]);
          any.push([A,B]);
        }
      }
      const taken=new Set();
      for(let k=0;k<MGMT_MAIN_SIZE;k++){
        let pot=slob.filter(p=>!taken.has(p[0].id)&&!taken.has(p[1].id));
        if(pot.length===0) pot=any.filter(p=>!taken.has(p[0].id)&&!taken.has(p[1].id));
        if(pot.length===0) return false;
        const p=pot[Math.floor(rnd()*pot.length)];
        taken.add(p[0].id); taken.add(p[1].id);
        if(!mgmtBookMain(m,p[0].id,p[1].id)) return false;
      }
      return true;
    }

    /* ---- Le coût de l'écrasement, en vrai : le joueur bâclé écrase cinq
       propositions de Leïla (mgmtDecide 'crush' — la réaction est ignorée,
       la pile se referme, mgmtClosePile repropose) avant de valider la
       sixième. Les écrasements s'accumulent d'une soirée à l'autre dans
       une carrière (streak) — la borne basse du déroulé réel. Renvoie la
       proposition validée, ou null (pot épuisé). ==== */
    function prelimsBatcle(m){
      for(let c=0;c<5;c++){
        const bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open');
        if(!bulk||!mgmtDecide(m,bulk.id,'crush')) return null;
        const react=m.pile.find(a=>a.kind==='leila_react_crush'&&a.status==='open');
        if(react) mgmtIgnore(m,react.id);
        if(mgmtClosePile(m)!=='refill') return null;
      }
      return m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open');
    }

    /* ---- Une soirée réelle : la carte préliminaire validée, la soirée
       par mgmtRunEvent. Avec mesureReduite, la réduite (QO-7) — la carte
       complète moins son prélim d'attrait le plus faible — se mesure sur
       les clones d'avant combat (mgmtRunEvent refuse une carte
       incomplète, et les combats mutent les lignes). ==== */
    function soireeReelle(m,echec,mesureReduite){
      const bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open');
      if(!bulk||!Array.isArray(bulk.fights)){ out.echecs[echec]++; return null; }
      for(const f of bulk.fights){ if(f.sloppy) out.sloppyPre++; out.preN++; }
      if(!mgmtDecide(m,bulk.id,'validate')){ out.echecs[echec]++; return null; }
      const slotted=mgmtCardFights(m).map(f=>({a:f.a,b:f.b,slot:f.slot==='main'?'main':'prelim'}));
      if(slotted.length!==MGMT_MAIN_SIZE+MGMT_PRELIM_SIZE){ out.echecs[echec]++; return null; }
      let red=null;
      if(mesureReduite){
        const attraction=mgmtCardAttraction(m,slotted);
        const purses=mgmtPurses(m,slotted);
        const pre=slotted.filter(f=>f.slot!=='main')
          .map(f=>({f:f,d:mgmtFightDraw(mgmtFighterById(m,f.a),mgmtFighterById(m,f.b))}))
          .sort((x,y)=>x.d-y.d)[0].f;
        const s8=slotted.filter(x=>x!==pre);
        const clones=s8.map(f=>({a:mgmtFightReady(mgmtFighterById(m,f.a)),b:mgmtFightReady(mgmtFighterById(m,f.b))}));
        const a8=mgmtCardAttraction(m,s8), p8=mgmtPurses(m,s8);
        red={attraction8:a8,purses8:p8,slotted8:s8,slotted8n:s8.length,clones};
      }
      const ev=mgmtRunEvent(m);
      if(!ev){ out.echecs[echec]++; return null; }
      if(!red) return {full:ev.finance};
      const fam=[];
      for(const c of red.clones){
        const res=simulateFight(c.a,c.b,3);
        fam.push({winner:res.winner,family:mgmtMethodFamily(res.method,res.winner)});
      }
      /* Lot 2B T4 : la réduite porte elle aussi ses bonus de victoire —
         les vainqueurs des huit combats rejoués, à leur emplacement. */
      const fights8=red.slotted8.map((f,i)=>({a:f.a,b:f.b,winner:fam[i].winner}));
      const b8=mgmtWinBonuses(m,red.slotted8,fights8);
      const f8=mgmtEventRecette(red.attraction8,mgmtSpectacle(fam),red.purses8,red.slotted8n,b8);
      return {full:ev.finance,red:{attraction:f8.attraction,spectacle:f8.spectacle,audience:f8.audience,
        ticketing:f8.ticketing,tv:f8.tv,purses:f8.purses,bonuses:f8.bonuses,recette:f8.recette}};
    }

    for(let i=FROM;i<TO;i++){
      /* Oracle : une carrière par graine, K soirées enchaînées. BORNE
         HAUTE — ne sert à aucune cible. */
      setSeed(BASE+i);
      let m=mgmtDefault(); mgmtNewRoster(m);
      for(let e=0;e<K;e++){
        mgmtNewPile(m);
        for(const a of m.pile.slice()){ if(a.status==='open'&&a.kind==='leila_propose') mgmtIgnore(m,a.id); }
        if(!composeMainOracle(m)){ out.nonComposees.oracle++; break; }
        const r=soireeReelle(m,'oracle',false);
        if(!r){ out.echecs.oracle++; break; }
        out.oracle[e].push(r.full);
      }
      /* Joueur d'écran, et sa réduite : graine propre à la carrière. */
      setSeed(BASE+1000000+i);
      m=mgmtDefault(); mgmtNewRoster(m);
      for(let e=0;e<K;e++){
        /* L'état du vivier, mesuré avant composition : ce que la liste de
           composition laisse choisir, et les suspensions en cours. */
        out.dispo[e].push(m.roster.filter(o=>mgmtSelectable(m,o,null)).length);
        out.susps[e].push(m.roster.filter(o=>Number.isSafeInteger(o.susp)&&m.cycle<=o.susp).length);
        mgmtNewPile(m);
        for(const a of m.pile.slice()){ if(a.status==='open'&&a.kind==='leila_propose') mgmtIgnore(m,a.id); }
        if(!composeMainEcran(m)){ out.nonComposees.ecran++; break; }
        const r=soireeReelle(m,'ecran',true);
        if(!r){ out.echecs.ecran++; break; }
        out.ecran[e].push(r.full);
        out.reduite[e].push(r.red);
      }
      /* Bâclé : graine propre à la carrière, carte bâclée + écrasements. */
      setSeed(BASE+2000000+i);
      m=mgmtDefault(); mgmtNewRoster(m);
      for(let e=0;e<K;e++){
        mgmtNewPile(m);
        for(const a of m.pile.slice()){ if(a.status==='open'&&a.kind==='leila_propose') mgmtIgnore(m,a.id); }
        if(!composeMainBatcle(m)){ out.nonComposees.batcle++; break; }
        if(!prelimsBatcle(m)){ out.nonComposees.batcle++; break; }
        const r=soireeReelle(m,'batcle',false);
        if(!r){ out.echecs.batcle++; break; }
        out.batcle[e].push(r.full);
      }
    }
    out.ref=mgmtAudienceRef(null);
    out.cst={TREASURY_START:MGMT_TREASURY_START,STAR_FIGHTS:MGMT_STAR_FIGHTS,STAR_W_RATIO:MGMT_STAR_W_RATIO,
      STAR_W_LVL:MGMT_STAR_W_LVL,PURSE_BASE:MGMT_PURSE_BASE,PURSE_PER_STAR:MGMT_PURSE_PER_STAR,
      PURSE_PRELIM_W:MGMT_PURSE_PRELIM_W,PURSE_MAIN_W:MGMT_PURSE_MAIN_W,WIN_BONUS_SHARE:MGMT_WIN_BONUS_SHARE,
      ATTR_PRELIM_W:MGMT_ATTR_PRELIM_W,ATTR_MAIN_W:MGMT_ATTR_MAIN_W,ATTR_GAP:MGMT_ATTR_GAP,
      TICKET_PER_DRAW:MGMT_TICKET_PER_DRAW,AUD_BASE:MGMT_AUD_BASE,AUD_PER_DRAW:MGMT_AUD_PER_DRAW,
      TV_PER_AUD:MGMT_TV_PER_AUD,TV_ECRANS:MGMT_TV_ECRANS,CARD_CONTRACT:MGMT_CARD_CONTRACT,
      DRAW_AVG:MGMT_DRAW_AVG,SPECTACLE_REF:MGMT_SPECTACLE_REF,SLOPPY_GAP:MGMT_SLOPPY_GAP,
      RANK_GAP:MGMT_RANK_GAP,MAIN_SIZE:MGMT_MAIN_SIZE,PRELIM_SIZE:MGMT_PRELIM_SIZE};
    return JSON.stringify(out);
  })()`);
  return agg;
}

/* --------------------- 4) répartition sur les cœurs ------------------------ */
/** Fusionne les paquets contigus dans l'ordre des graines : les finance
 *  brutes sont concaténées soirée par soirée, rien ne se recalcule.
 *  @returns {object} */
function mergeParts(parts){
  const K=parts.reduce((n,p)=>Math.max(n,p.oracle.length),0);
  const out={oracle:[],ecran:[],reduite:[],batcle:[],echecs:{oracle:0,ecran:0,batcle:0},
    nonComposees:{oracle:0,ecran:0,batcle:0},sloppyPre:0,preN:0,ref:0,cst:{},dispo:[],susps:[]};
  for(let j=0;j<K;j++){ out.oracle.push([]); out.ecran.push([]); out.reduite.push([]); out.batcle.push([]);
    out.dispo.push([]); out.susps.push([]); }
  for(const p of parts){
    for(let j=0;j<p.oracle.length;j++){
      out.oracle[j]=out.oracle[j].concat(p.oracle[j]);
      out.ecran[j]=out.ecran[j].concat(p.ecran[j]);
      out.reduite[j]=out.reduite[j].concat(p.reduite[j]);
      out.batcle[j]=out.batcle[j].concat(p.batcle[j]);
      out.dispo[j]=out.dispo[j].concat(p.dispo[j]);
      out.susps[j]=out.susps[j].concat(p.susps[j]);
    }
    out.echecs.oracle+=p.echecs.oracle;
    out.echecs.ecran+=p.echecs.ecran;
    out.echecs.batcle+=p.echecs.batcle;
    out.nonComposees.oracle+=p.nonComposees.oracle;
    out.nonComposees.ecran+=p.nonComposees.ecran;
    out.nonComposees.batcle+=p.nonComposees.batcle;
    out.sloppyPre+=p.sloppyPre;
    out.preN+=p.preN;
    if(p.ref) out.ref=p.ref;
    if(p.cst&&Object.keys(p.cst).length) out.cst=p.cst;
  }
  return out;
}

/** Lance un enfant par paquet contigu de carrières et rend les mesures
 *  fusionnées, dans l'ordre des graines. */
function measureParallel(cfg,done){
  const jobs=Math.min(cfg.jobs,cfg.cards);
  const step=Math.ceil(cfg.cards/jobs);
  const parts=[];
  let left=jobs, failed=false;
  for(let j=0;j<jobs;j++){
    const from=j*step, to=Math.min(cfg.cards,from+step);
    if(from>=to){ left--; continue; }
    const child=fork(__filename,['--from='+from,'--to='+to,'--seed='+cfg.seed,
      '--soirees='+cfg.soirees,'--quiet'],
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
function report(A,cfg){
  const stats=v=>{
    const a=v.slice().sort((x,y)=>x-y);
    const q=p=>a[Math.min(a.length-1,Math.max(0,Math.round(p*(a.length-1))))];
    const mean=a.reduce((x,y)=>x+y,0)/a.length;
    const sd=Math.sqrt(a.reduce((x,y)=>x+(y-mean)*(y-mean),0)/a.length);
    return {n:a.length,mean,sd,p5:q(0.05),p50:q(0.5),p95:q(0.95)};
  };
  const r1=x=>Math.round(x*10)/10, r2=x=>Math.round(x*100)/100, r3=x=>Math.round(x*1000)/1000;
  const pct=(x,n)=>n>0?Math.round(1000*x/n)/10:0;

  function row(name,S,extra){
    const rec=stats(S.map(x=>x.recette));
    const rev=stats(S.map(x=>x.ticketing+x.tv));
    const pur=stats(S.map(x=>x.purses));
    const bon=stats(S.map(x=>x.bonuses||0));
    const aud=stats(S.map(x=>x.audience));
    const atr=stats(S.map(x=>x.attraction));
    const spe=stats(S.map(x=>x.spectacle));
    const rent=Math.round(1000*S.filter(x=>x.recette>0).length/S.length)/10;
    return {name,n:rec.n,rent,rec_mean:r1(rec.mean),rec_sd:r1(rec.sd),rec_p5:rec.p5,rec_med:rec.p50,rec_p95:rec.p95,
      rev:r1(rev.mean),pur:r1(pur.mean),bon:r1(bon.mean),atr:r2(atr.mean),spe:r3(spe.mean),aud:r1(aud.mean),aud_sd:r1(aud.sd),...extra};
  }

  const kept=A.reduite[0].filter(x=>x.audience>=A.ref).length;
  const audRefShare=pct(kept,A.reduite[0].length);
  const sloppyShare=pct(A.sloppyPre,A.preN);
  const rows=[
    row('oracle (borne haute — ne sert à aucune cible)',A.oracle[0]),
    row('joueur d\u2019écran (sert les cibles)',A.ecran[0]),
    row('réduite (8, prélim faible retiré du joueur d\u2019écran)',A.reduite[0],{aud_ref:audRefShare}),
    row('bâclée (5+4 écrasée, déroulé réel)',A.batcle[0],{sloppy:sloppyShare}),
  ];

  /* Cibles — décisions d'auteur, jamais revues ici, jugées sur le joueur
     d'écran SEUL. Lot 2B T4 (docs/LOT-2B-LE-VIVIER-SE-RENOUVELLE.md §T4) :
     la soirée 1 sert la bande 70-80 % (la lecture « durée de vie » attend
     le recrutement, T2 — sans lui le roster ne peut que fondre et la
     dégradation des soirées suivantes est la fonte mesurée, publiée dans
     la table des soirées enchaînées). AVANT : la mesure 2B d'avant ce
     recalibrage — le bonus de victoire en place (partage show/win),
     revenus de la T4 du lot 2 non remontés (essai --n=200 --soirees=20 :
     R moyen −49,4 k$, 0 % de rentables). Le seuil de la cible 3 est la
     lecture de l'outil : « part mesurable » = au moins 10 %. */
  const AVANT={ecranRent:0,ecranR:-49.4,ecranMed:-49,batcleRent:0,reduiteOracle:38};
  const verdicts=[
    {lib:'1. Le joueur d\u2019écran (carte complète moyenne) est rentable dans 70 à 80 % des soirées',
     cible:'70 à 80 %',
     avant:AVANT.ecranRent+' % (joueur d\u2019écran, bonus de victoire sans remontée des revenus)',
     mesure:rows[1].rent+' % (joueur d\u2019écran, soirée 1)',
     ok:rows[1].rent>=70&&rows[1].rent<=80},
    {lib:"2. Le joueur bâclé perd de l'argent plus souvent qu'il n'en gagne",
     cible:'moins de 50 % de rentables',
     avant:AVANT.batcleRent+' % de rentables (bonus sans remontée des revenus)',
     mesure:rows[3].rent+' % (bâclé, soirée 1)',
     ok:rows[3].rent<50},
    {lib:"3. La carte réduite (du joueur d'écran) garde son audience de référence dans une part mesurable des cas",
     cible:'part mesurable (lecture de l\'outil : ≥ 10 %)',
     avant:AVANT.reduiteOracle+' % (réduite du joueur d\u2019écran, bonus sans remontée des revenus)',
     mesure:audRefShare+' % (réduite, réf '+A.ref+' écrans)',
     ok:audRefShare>=10},
  ];
  /* Gradient de lecture (contrainte de forme) : oracle > joueur d'écran >
     bâclé, sur R moyen comme sur le pourcentage de rentables. */
  const gradientOK=rows[0].rec_mean>rows[1].rec_mean&&rows[1].rec_mean>rows[3].rec_mean
    &&rows[0].rent>rows[1].rent&&rows[1].rent>rows[3].rent;

  const L=[];
  L.push('# Calibrage Monte Carlo — l\u2019argent sur le déroulé réel (lot 2B T4, le salaire à la victoire)');
  L.push('');
  L.push('Outil : `tools/monte-carlo-economie.js` — jeu réel (jsdom), VRAI déroulé : le joueur-type');
  L.push('compose sa carte principale par le geste du jeu (`mgmtBookMain`), Leïla propose les');
  L.push('préliminaires (`mgmtNewBulkAffair`), la soirée se joue par `mgmtRunEvent` — attrait et');
  L.push('cachets lus sur les lignes d\u2019avant combat, conséquences réelles (`mgmtApplyFight`).');
  L.push('Lot 2B T4 (docs/LOT-2B-LE-VIVIER-SE-RENOUVELLE.md §T4, décision 1 du 21/09) : le cachet');
  L.push('reste le salaire de combat et le VAINQUEUR touche un bonus — calculé après les combats,');
  L.push('déduit de la recette. Le modèle d\u2019argent change, donc le calibrage de la T4 du lot 2');
  L.push('(caduc depuis la T1 ter de toute façon) est refait ici. Les cibles se jugent sur la');
  L.push('soirée 1 du joueur d\u2019écran ; la lecture « durée de vie » attend le recrutement (T2) —');
  L.push('sans lui, le roster ne peut que fondre et la table des soirées enchaînées mesure cette');
  L.push('fonte, pas un défaut de calibrage.');
  L.push('');
  L.push('- Graine de base : `'+cfg.seed+'`');
  L.push('- Carrières demandées par profil : '+cfg.cards+' (paquets contigus, au plus 12 processus)');
  L.push('- Soirées enchaînées par carrière : '+cfg.soirees+' (--soirees — à 1 : chaque soirée repart d\u2019une organisation neuve)');
  L.push('- Premières soirées jouées (la table des résultats) : oracle '+rows[0].n+', joueur d\u2019écran '
    +rows[1].n+', réduite '+rows[2].n+', bâclée '+rows[3].n);
  L.push('- Carrières interrompues par une soirée non composable (pot épuisé, la carrière s\u2019arrête) : '
    +'oracle '+A.nonComposees.oracle+', joueur d\u2019écran '+A.nonComposees.ecran+', bâclée '+A.nonComposees.batcle);
  L.push('- Référence D4 d\u2019avant première soirée (mgmtAudienceRef sans historique, carte 5 + 4) : '+A.ref+' écrans');
  L.push('');
  L.push('## Heuristiques des joueurs-types (documentées, aucun tirage caché)');
  L.push('');
  L.push('**Seul le joueur d\u2019écran sert les cibles.** L\u2019oracle est une borne haute qui ne sert à');
  L.push('aucune cible : il montre uniquement l\u2019écart entre un joueur ordinaire et un joueur');
  L.push('parfait. Le joueur bâclé est la borne basse du déroulé réel (le coût de l\u2019écrasement).');
  L.push('');
  L.push('| Profil | Carte principale | Préliminaires |');
  L.push('|---|---|---|');
  L.push('| **joueur d\u2019écran** (sert les cibles) | il ne voit et n\u2019utilise que ce que l\u2019écran affiche — catégorie (f.div), rang dans la catégorie (mgmtDivisionRank) et bilan ; à chaque place libre, le combattant disponible le mieux classé de sa catégorie (plus petit rang dans la sienne, à égalité le premier dans l\u2019ordre de la liste mgmtCartRows), apparié au disponible de la même catégorie au rang le plus proche ; refus de `mgmtBookMain` : essai du candidat suivant, puis du combattant suivant — jamais d\u2019abandon ; la règle n\u2019appelle jamais mgmtFightDraw, mgmtStar, mgmtPurse, mgmtCardAttraction ni mgmtEventRecette | la vraie proposition de Leïla (`mgmtNewBulkAffair`), validée sans écrasement |');
  L.push('| oracle (borne haute — aucune cible) | la meilleure paire disjointe de même catégorie disponible, par attrait décroissant (`mgmtFightDraw`) — il maximise la grandeur que l\u2019écran ne montre pas | idem joueur d\u2019écran |');
  L.push('| bâclé | cinq paires tirées au hasard seedé parmi les paires de même catégorie bâclées au sens du jeu (écart de bilan ≥ '+A.cst.SLOPPY_GAP+' combats, ou écart de rang > '+A.cst.RANK_GAP+') ; complétées au hasard à défaut | cinq propositions de Leïla ÉCRASÉES, la sixième validée (coût de l\u2019écrasement, addendum §12) |');
  L.push('| réduite | — | la carte du joueur d\u2019écran moins son prélim d\u2019attrait le plus faible (QO-7) — **hors déroulé réel**, voir plus bas |');
  L.push('');
  L.push('## Résultats (graine de base '+cfg.seed+', '+cfg.soirees+' soirée'+(cfg.soirees>1?'s':'')+' par organisation)');
  L.push('');
  L.push('Valeurs en k$ (milliers), audience en écrans entiers. R = recette nette (revenus − cachets');
  L.push('− bonus de victoire).');
  L.push('Les cibles se jugent sur la ligne du joueur d\u2019écran, jamais sur l\u2019oracle.'
    +(cfg.soirees>1?' Cette table est la soirée 1 — la table des soirées enchaînées, plus bas, porte la suite.':''));
  L.push('');
  L.push('| Profil | n | R moyen | R écart | R p5 | R méd | R p95 | % rentables | Revenus | Cachets | Bonus | Attrait | Spectacle | Audience | Aud écart | Aud ≥ réf |');
  L.push('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|');
  for(const r of rows){
    L.push(['| '+r.name+' | '+r.n+' | '+r.rec_mean+' | '+r.rec_sd+' | '+r.rec_p5+' | '+r.rec_med+' | '+r.rec_p95
      +' | '+r.rent+' | '+r.rev+' | '+r.pur+' | '+r.bon+' | '+r.atr+' | '+r.spe+' | '+r.aud+' | '+r.aud_sd+' | '
      +(r.aud_ref!==undefined?r.aud_ref+' %':'—')+' |'].join(''));
  }
  L.push('');
  L.push('Gradient de lecture (contrainte de forme) : oracle ('+rows[0].rec_mean+' k$) > joueur d\u2019écran ('
    +rows[1].rec_mean+' k$) > bâclé ('+rows[3].rec_mean+' k$) — '
    +(gradientOK?'l\u2019ordre tient sur R moyen et sur les % rentables.':'**ORDRE INVERSÉ** : réglage mauvais même si les cibles sont atteintes.'));
  L.push('');
  L.push('Part de combats de préliminaires bâclés dans les propositions validées : '+sloppyShare+' %');
  L.push('(joueur d\u2019écran et oracle : attendue quasi nulle — Leïla est soigneuse sans écrasement ;');
  L.push('bâclée : au plafond du jeu, 0,65).');
  L.push('');
  L.push('## Cibles du lot 3b T1 — mesurées avant et après');
  L.push('');
  L.push('| Cible (lot 3b T1) | Avant | Après (joueur d\u2019écran) | Verdict |');
  L.push('|---|---|---|---|');
  for(const x of verdicts){
    L.push('| '+x.lib+' | '+x.avant+' | '+x.mesure+' | '+(x.ok?'ATTEINTE':'MANQUÉE')+' |');
  }
  L.push('');
  L.push('## Ce que le bonus de victoire change, et ce que le recalibrage corrige');
  L.push('');
  L.push('Le bonus de victoire (lot 2B T4) alourdit une soirée d\u2019environ la moitié de sa masse');
  L.push('de cachets : le vainqueur de chacun des neuf combats touche son cachet une seconde');
  L.push('fois (partage show/win du sport réel, `MGMT_WIN_BONUS_SHARE=1`). Avant remontée des');
  L.push('revenus, le joueur d\u2019écran mesurait R moyen '+AVANT.ecranR+' k$ (médiane '+AVANT.ecranMed+')');
  L.push('pour '+AVANT.ecranRent+' % de rentables — la soirée perdait ~50 k$ en moyenne. C\u2019est ce que le');
  L.push('recalibrage corrige : les deux leviers de revenu (billetterie et droits du diffuseur)');
  L.push('suivent le coût, dans leurs proportions d\u2019avant. L\u2019écart oracle − joueur d\u2019écran');
  L.push('('+r1(rows[0].rec_mean-rows[1].rec_mean)+' k$ de R moyen) reste le prix du joueur parfait : un joueur qui choisit');
  L.push('exactement ce que le jeu vend. Le bonus frappe aussi le joueur d\u2019écran plus fort que');
  L.push('le bâclé — ses vainqueurs sont les mieux payés — et c\u2019est voulu : booker les bons');
  L.push('numéros coûte leur salaire.');
  L.push('');
  L.push('## Ce qui reste hors déroulé réel (le profil réduite)');
  L.push('');
  L.push('La réduite (QO-7 : la carte moins son prélim d\u2019attrait le plus faible) n\u2019est PAS');
  L.push('jouée par `mgmtRunEvent` : le jeu refuse une carte incomplète (la carte contractuelle');
  L.push('est de 9 combats, 5 + 4). Elle se mesure sur les clones d\u2019avant combat (`mgmtFightReady`),');
  L.push('avec la vraie finance (`mgmtEventRecette`, droits au prorata 8/9 des combats joués,');
  L.push('bonus de victoire des huit combats rejoués compris) —');
  L.push('l\u2019attrait et les cachets sont ceux de la carte du joueur d\u2019écran avant la soirée,');
  L.push('le spectacle et les vainqueurs viennent des huit combats rejoués sous une graine du');
  L.push('même run. Elle est un proxy assumé, mesuré comme tel : c\u2019est la lecture de la cible 3,');
  L.push('pas une soirée que le jeu peut produire.');
  L.push('');
  const manques=verdicts.filter(x=>!x.ok);
  if(manques.length===0){
    L.push('Aucune cible manquée.');
  }else{
    L.push('## Cibles manquées — signalées');
    L.push('');
    for(const x of manques){ L.push('- **'+x.mesure+' mesuré contre « '+x.cible+' »** ('+x.lib+').'); }
  }
  L.push('');
  if(cfg.soirees>1){
    L.push('## Soirées enchaînées — l\u2019organisation qui vieillit (--soirees='+cfg.soirees+')');
    L.push('');
    L.push('K soirées enchaînées sur la MÊME organisation (mgmtNewPile entre chaque ; le bilan et');
    L.push('la notoriété des combattants évoluent, le corps s\u2019use, Leïla respecte le repos).');
    L.push('Chaque ligne est l\u2019index de la soirée dans la carrière de l\u2019organisation.');
    L.push('« Disponibles » : les lignes que la liste de composition laisse choisir au moment');
    L.push('de composer (mesuré sur la carrière du joueur d\u2019écran) ; « suspensions » : les');
    L.push('combattants sous suspension médicale à ce moment.');
    L.push('');
    L.push('| Soirée | Profil | n | R moyen | R méd | R p5 | R p95 | % rentables | Audience | Disponibles | Suspensions |');
    L.push('|---|---|---|---|---|---|---|---|---|---|---|');
    const pnames=[['oracle',A.oracle],['joueur d\u2019écran',A.ecran],['réduite',A.reduite],['bâclée',A.batcle]];
    for(const [nm,arr] of pnames){
      for(let e=0;e<cfg.soirees;e++){
        const r=row(nm+' — soirée '+(e+1),arr[e]);
        const d=nm==='joueur d\u2019écran'?r1(A.dispo[e].reduce((x,y)=>x+y,0)/A.dispo[e].length):'—';
        const s=nm==='joueur d\u2019écran'?r1(A.susps[e].reduce((x,y)=>x+y,0)/A.susps[e].length):'—';
        L.push(['| '+(e+1)+' | '+nm+' | '+r.n+' | '+r.rec_mean+' | '+r.rec_med+' | '+r.rec_p5+' | '+r.rec_p95
          +' | '+r.rent+' | '+r.aud+' | '+d+' | '+s+' |'].join(''));
      }
    }
    L.push('');
    const e0=stats(A.ecran[0].map(x=>x.recette)), eK=stats(A.ecran[cfg.soirees-1].map(x=>x.recette));
    if(eK.mean>e0.mean&&eK.p50>e0.p50){
      L.push('**Information de design :** le joueur d\u2019écran est perdant à la première soirée');
      L.push('(R moyen '+r1(e0.mean)+' k$) et rentable à la '+(cfg.soirees===6?'sixième':'dernière'));
      L.push('(R moyen '+r1(eK.mean)+' k$, médiane '+r1(eK.p50)+' k$) : l\u2019économie s\u2019améliore quand');
      L.push('l\u2019organisation vieillit et que ses combattants gagnent en notoriété — le nom des');
      L.push('noms monte, la billetterie et les droits suivent. L\u2019argent n\u2019est pas une sentence');
      L.push('du premier jour, c\u2019est une pente à remonter.');
    }else{
      const a0=stats(A.ecran[0].map(x=>x.audience)), aK=stats(A.ecran[cfg.soirees-1].map(x=>x.audience));
      L.push('**Information de design : l\u2019hypothèse inverse est mesurée.** Le joueur d\u2019écran est');
      L.push('rentable à la première soirée (R moyen '+r1(e0.mean)+' k$, '+pct(A.ecran[0].filter(x=>x.recette>0).length,A.ecran[0].length)
        +' % de rentables) et');
      L.push('il SE DÉGRADE d\u2019une soirée à l\u2019autre : R moyen '+r1(eK.mean)+' k$ à la '
        +(cfg.soirees===6?'sixième':'dernière'));
      L.push('('+(pct(A.ecran[cfg.soirees-1].filter(x=>x.recette>0).length,A.ecran[cfg.soirees-1].length))+' % de rentables),');
      L.push('audience '+r1(a0.mean)+' → '+r1(aK.mean)+' écrans, vivier '+r1(A.dispo[0].reduce((x,y)=>x+y,0)/A.dispo[0].length)
        +' → '+r1(A.dispo[cfg.soirees-1].reduce((x,y)=>x+y,0)/A.dispo[cfg.soirees-1].length)+' disponibles,');
      L.push('suspensions en cours '+r1(A.susps[0].reduce((x,y)=>x+y,0)/A.susps[0].length)+' → '
        +r1(A.susps[cfg.soirees-1].reduce((x,y)=>x+y,0)/A.susps[cfg.soirees-1].length)+', et des soirées qui ne se');
      L.push('composent plus ('+A.ecran[0].length+' → '+A.ecran[cfg.soirees-1].length+' carrières complètes).');
      L.push('L\u2019hypothèse « l\u2019organisation vieillissante s\u2019enrichit quand ses noms montent » n\u2019est');
      L.push('PAS vérifiée à K='+cfg.soirees+' : la notoriété monte, mais le corps s\u2019use et les');
      L.push('suspensions retirent les meilleurs noms de la rotation, plus vite que les noms ne');
      L.push('montent. C\u2019est une information de design, pas un détail — la jeunesse de');
      L.push('l\u2019organisation est son âge d\u2019or, et le déclin des cartes suit l\u2019usure du vivier.');
    }
    L.push('');
  }
  L.push('## Constantes recalibrées (ancre MGMT_LOT3B_T1_ECONOMIE, mgmt-argent.js)');
  L.push('');
  L.push('Les cibles sont des décisions d\u2019auteur — jamais touchées. Ce sont les poids d\u2019argent');
  L.push('qui ont bougé, pour porter le joueur d\u2019écran (le seul qui sert les cibles) dans la');
  L.push('bande 70-80 % malgré le bonus de victoire. Effets mesurés : comparaison des essais');
  L.push('--n=200 --soirees=20 (avant recalibrage : ' + AVANT.ecranR + ' k$ / ' + AVANT.ecranRent + ' % ; après : '
    + rows[1].rec_mean + ' k$ / ' + rows[1].rent + ' %, soirée 1).');
  L.push('');
  L.push('| Constante | Ancienne | Nouvelle | Effet mesuré |');
  L.push('|---|---|---|---|');
  /* Les anciennes valeurs sont celles de l'état d'avant cette tranche
     (T4 du lot 2 recalibrée + lot 2B T1 ter/T3 : le bonus de victoire
     n'existait pas). ckeys : d'abord les leviers possibles, puis les
     définitions et les mesures — chaque ligne dit CHANGÉE ou INCHANGÉE,
     jamais rien de plus. */
  const ANCIENNES={TREASURY_START:50,STAR_FIGHTS:8,STAR_W_RATIO:0.35,STAR_W_LVL:0.65,
    PURSE_BASE:1,PURSE_PER_STAR:3.35,PURSE_PRELIM_W:1,PURSE_MAIN_W:2.5,WIN_BONUS_SHARE:'— (nouveau)',
    ATTR_PRELIM_W:1,ATTR_MAIN_W:2.5,ATTR_GAP:0.6,TICKET_PER_DRAW:7,AUD_BASE:0.7,AUD_PER_DRAW:1000,
    TV_PER_AUD:6,TV_ECRANS:1000,CARD_CONTRACT:9,DRAW_AVG:0.48,SPECTACLE_REF:0.71};
  const EFFETS={
    WIN_BONUS_SHARE:'NOUVEAU (lot 2B T4) — part du cachet reversée au vainqueur : 1, la pratique show/win du sport réel ; le vainqueur des neuf combats touche son cachet une seconde fois, le nul ne bonus personne',
    TICKET_PER_DRAW:'billetterie (k$) par point d\u2019attrait — LE levier de revenu de ce recalibrage : le bonus de victoire alourdit le coût d\u2019une soirée de ~50 k$, la billetterie suit (7 → '+A.cst.TICKET_PER_DRAW+') ; R moyen '+AVANT.ecranR+' → '+rows[1].rec_mean+' k$, rentables '+AVANT.ecranRent+' % → '+rows[1].rent+' % (soirée 1)',
    TV_PER_AUD:'droits du diffuseur (k$) pour 1000 écrans — second levier de revenu, monté dans ses proportions avec la billetterie (6 → '+A.cst.TV_PER_AUD+')',
    PURSE_PER_STAR:'INCHANGÉ — cachet par point de nom (calibrage T4 du lot 2 : le joueur d\u2019écran book les mieux classés, la prime au nom subsiste)',
    PURSE_BASE:'INCHANGÉ — cachet plancher',
    PURSE_PRELIM_W:'INCHANGÉ — poids du cachet en prélim',
    PURSE_MAIN_W:'INCHANGÉ — poids du cachet en carte principale',
    ATTR_PRELIM_W:'INCHANGÉ — poids d\u2019attrait d\u2019un prélim',
    ATTR_MAIN_W:'INCHANGÉ — poids d\u2019attrait d\u2019un combat de carte principale',
    ATTR_GAP:'INCHANGÉ — morsure de l\u2019écart de nom sur l\u2019attrait (baisser aurait aidé le bâclé plus que le joueur d\u2019écran : ordre du gradient menacé)',
    AUD_BASE:'INCHANGÉ — part d\u2019audience acquise avant la soirée',
    AUD_PER_DRAW:'INCHANGÉ — écrans par point d\u2019attrait × mix de spectacle',
    DRAW_AVG:'MESURE reposée sur le joueur d\u2019écran — attrait moyen mesuré d\u2019un combat : '
      +r3(rows[1].atr/(A.cst.MAIN_SIZE*A.cst.ATTR_MAIN_W+A.cst.PRELIM_SIZE*A.cst.ATTR_PRELIM_W))
      +' ; mgmtAudienceRef sans historique ('+A.ref+' écrans) reste l\u2019audience moyenne du joueur d\u2019écran (QO-7)',
    SPECTACLE_REF:'MESURE reposée sur le joueur d\u2019écran — part de finitions mesurée : '+rows[1].spe,
    TREASURY_START:'INCHANGÉ — décision QO-5',
    TV_ECRANS:'INCHANGÉ — définition, pas un réglage',
    CARD_CONTRACT:'INCHANGÉ — la carte complète du lot 2 (5 + 4), définition'};
  const ckeys=['WIN_BONUS_SHARE','TICKET_PER_DRAW','TV_PER_AUD','PURSE_PER_STAR','PURSE_BASE','PURSE_PRELIM_W',
    'PURSE_MAIN_W','ATTR_PRELIM_W','ATTR_MAIN_W','ATTR_GAP','AUD_BASE','AUD_PER_DRAW',
    'DRAW_AVG','SPECTACLE_REF','TREASURY_START','TV_ECRANS','CARD_CONTRACT'];
  for(const k of ckeys){
    const anc=ANCIENNES[k], nouv=A.cst[k];
    L.push('| `MGMT_'+k+'` | '+anc+' | '+nouv+' | '+(EFFETS[k]||'')+' |');
  }
  L.push('');
  L.push('Reproductibilité : un même `--seed`/`--n`/`--soirees` redonne exactement ces valeurs. Chaque');
  L.push('carrière r démarre sous `setSeed(base + r)` (oracle), `setSeed(base + 1000000 + r)` (joueur');
  L.push('d\u2019écran et sa réduite) et `setSeed(base + 2000000 + r)` (bâclé).');
  L.push('Parallélisme : les paquets contigus de carrières sont indépendants (graine propre à chaque');
  L.push('carrière) — `--jobs` donne les mêmes chiffres que `--serial`, bit à bit.');
  L.push('');

  fs.writeFileSync(cfg.out,L.join('\n'));
  if(cfg.quiet){
    console.log('Rapport écrit : '+cfg.out);
    for(const x of verdicts){ console.log((x.ok?'ATTEINTE':'MANQUÉE')+' — '+x.lib+' : '+x.mesure); }
    console.log('gradient oracle > écran > bâclé : '+(gradientOK?'TENU':'INVERSÉ'));
  }else{
    console.log(L.join('\n'));
    console.log('\nRapport écrit : '+cfg.out);
  }
}

/* ------------------------------ 6) main ------------------------------------ */
(function main(){
  const cfg = parseArgs(process.argv.slice(2));
  /* Enfant : mesure son paquet contigu de carrières et rend ses finance. */
  if(cfg.worker){ process.stdout.write(measure(cfg)); return; }
  if(cfg.jobs<=1){ report(JSON.parse(measure(cfg)),cfg); return; }
  measureParallel(cfg,(err,A)=>{
    if(err){ console.error(err.message); process.exitCode=1; return; }
    report(A,cfg);
  });
})();
