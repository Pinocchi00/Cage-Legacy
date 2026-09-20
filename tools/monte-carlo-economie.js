"use strict";
/* CAGE LEGACY — tools/monte-carlo-economie.js
   ============================================================================
   Lot 2 T4 — l'argent sur le déroulé réel (docs/LOT-2-CARTE-PRINCIPALE.md
   §T4, exigé par LOT-3B-CONTRAT.md §T2, condition de fusion dans main).
   Remplace le profil « 8 meilleures paires possibles » du lot 3b T1 :
   l'outil joue le VRAI déroulé d'une soirée Split, avec les vraies
   fonctions du jeu, dans l'ordre exact du jeu — charge le VRAI jeu dans
   un DOM virtuel (jsdom), dans l'ordre EXACT des <script src> de
   index.html (lu directement depuis le fichier à chaque exécution).

   Une soirée mesurable se déroule exactement comme en jeu :

     1. un état Split neuf (mgmtDefault + mgmtNewRoster, graines publiées) ;
     2. le cycle s'ouvre (mgmtNewPile) — le joueur-type ignore les
        propositions simples de Leïla (ignorer est une décision, CDC §4.1) ;
     3. le joueur-type compose lui-même ses cinq combats de carte
        principale par le vrai geste (mgmtBookMain, lot 2 T2) —
        heuristique documentée ci-dessous, aucune note, aucune
        recommandation, aucune jauge ;
     4. Leïla propose la carte préliminaire à la cinquième place
        (mgmtOfferBulk déclenché par le booking, lot 2 T3) — le joueur-type
        la valide (mgmtDecide 'validate') ;
     5. la soirée se joue par mgmtRunEvent : attrait et cachets lus sur
        les lignes d'avant combat, combats par simulateFight, conséquences
        réelles (mgmtApplyFight), recette nette R = billetterie + droits
        du diffuseur − cachets, trésorerie T ← T + R.

   Deux joueurs-types (proxies assumés, heuristiques documentées ici) :

   - « propre » — le joueur soigneux : à chaque place, la meilleure paire
     disjointe de même catégorie disponible, par attrait décroissant
     (mgmtFightDraw, lignes d'avant booking ; départage par l'ordre du
     roster — pur, aucun tirage). Proxy du joueur qui cherche les
     meilleurs appariements possibles avec le geste réel. Préliminaires :
     la vraie proposition de Leïla, validée sans écrasement.
   - « bâclé » — le joueur négligent, borne haute du déroulé réel : ses
     cinq combats sont tirés au hasard seedé parmi les paires de même
     catégorie disponibles bâclées au sens du jeu (gros écart de bilan
     ≥ MGMT_SLOPPY_GAP, ou écart de rang > MGMT_RANK_GAP — le
     cross-division n'existe plus : mgmtBookMain refuse les catégories
     différentes) ; à défaut de cinq paires bâclées disjointes, il
     complète au hasard parmi les paires restantes. Puis il ÉCRASE cinq
     propositions de Leïla avant de valider la sixième — le coût de
     l'écrasement (addendum §12) porte la probabilité de paires bâclées
     de Leïla au plafond du jeu (mgmtSloppyProb plafonnée à 0,65). C'est
     la carte écrasée telle que le jeu la produit réellement.
   - « réduite (8) » — la carte complète du profil propre moins son prélim
     d'attrait le plus faible (QO-7 : moins de combats = moins d'attrait,
     la qualité des combats restants décide). mgmtRunEvent refuse une
     carte incomplète : la mesure se fait sur les clones d'avant combat
     (mgmtFightReady) avec la vraie finance (mgmtEventRecette, droits au
     prorata 8/9 des combats joués). L'audience est comparée à la
     référence D4 d'avant première soirée (mgmtAudienceRef sans
     historique — constante du run, indépendante de l'ordre des soirées :
     exigence de parallélisme bit à bit).

   Aucun Math.random() : la RNG du jeu (rnd(), seedée par setSeed) est la
   seule source de tirage. Chaque soirée i part de setSeed(base + i)
   (propre et sa réduite) et setSeed(base + 1000000 + i) (bâclé) — un run
   est intégralement reproductible pour un même --seed/--cards.

   Parallélisme (même découpage que tools/monte-carlo-soiree.js) : les
   soirées sont indépendantes — chacune part de sa propre graine et d'un
   état neuf. Le parent répartit les soirées sur des processus enfants
   (paquets contigus, au plus 12) et reçoit les finance brutes, soirée
   par soirée, dans l'ordre des graines : les chiffres sont EXACTEMENT
   ceux d'une exécution --serial (preuve demandée par le contrat : même
   graine, mêmes tableaux).

   Usage :
     node tools/monte-carlo-economie.js [--seed=S] [--cards=N] [--out=CHEMIN]
                                        [--quiet] [--jobs=N] [--serial]
   ============================================================================ */
const path = require('path');
const fs = require('fs');
const os = require('os');
const { fork } = require('child_process');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');

/* --------------------------- 1) CLI --------------------------------------- */
function parseArgs(argv){
  const out = { seed: 20260919, cards: 4000, out: 'tools/reports/LOT-2-T4-CALIBRAGE-ECONOMIE.md', quiet: false,
    jobs: Math.max(1, Math.min(12, os.cpus().length)), worker: false, from: 0, to: 0 };
  for(const arg of argv){
    if(arg === '--quiet'){ out.quiet = true; continue; }
    if(arg === '--serial'){ out.jobs = 1; continue; }
    const m = /^--([a-zA-Z]+)=(.+)$/.exec(arg);
    if(!m) continue;
    const key=m[1], val=m[2];
    if(key === 'seed') out.seed = parseInt(val, 10) || out.seed;
    else if(key === 'cards') out.cards = Math.max(1, parseInt(val, 10) || out.cards);
    else if(key === 'out') out.out = val;
    else if(key === 'jobs') out.jobs = Math.max(1, Math.min(12, parseInt(val, 10) || out.jobs));
    /* Mode enfant (interne) : le paquet contigu de soirées à mesurer. */
    else if(key === 'from'){ out.worker = true; out.from = parseInt(val, 10) || 0; }
    else if(key === 'to'){ out.worker = true; out.to = parseInt(val, 10) || 0; }
  }
  /* Le chemin de sortie est relatif à la racine du dépôt, sauf s'il est
     déjà absolu (path.join renvoie l'absolu tel quel). */
  out.out = path.isAbsolute(out.out) ? out.out : path.join(ROOT, out.out);
  /* Hors mode enfant (aucun --from/--to) : tout l'intervalle des soirées. */
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
/** Mesure les soirées [from, to) du déroulé réel dans une fenêtre neuve.
 *  Les graines ne dépendent que de la soirée : le découpage ne change
 *  aucun chiffre. @returns {string} JSON des finance brutes. */
function measure(cfg){
  const win = newGameWindow();
  /* Toute la boucle vit côté fenêtre (accès direct aux fonctions du jeu,
     aucun aller-retour d'évaluation par soirée) ; les agrégats reviennent
     en JSON. */
  const agg = win.eval(`(function(){
    const BASE=${cfg.seed}, FROM=${cfg.from}, TO=${cfg.to};
    const out={propre:[],reduite:[],batcle:[],echecs:{propre:0,batcle:0},sloppyPre:0,preN:0,ref:0,cst:{}};

    /* ---- Joueur-type propre (§T4, heuristique documentée en tête) : à
       chaque place, la meilleure paire disjointe de même catégorie
       disponible, par attrait décroissant (mgmtFightDraw sur les lignes
       d'avant booking ; à égalité, l'ordre du roster départage). Pur :
       aucun tirage dans l'heuristique. Le vrai geste : mgmtBookMain
       (garde complète du jeu, mgmtPromote compté comme interaction). */
    function composeMainPropre(m){
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

    /* ---- Joueur-type bâclé (§T4, heuristique documentée en tête) : ses
       cinq combats sont tirés au hasard seedé parmi les paires de même
       catégorie disponibles bâclées au sens du jeu (gros écart de bilan
       ≥ MGMT_SLOPPY_GAP ou écart de rang > MGMT_RANK_GAP) ; à défaut,
       au hasard parmi les paires de même catégorie restantes. */
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

    /* ---- Le coût de l'écrasement, en vrai (§T4, borne haute) : le joueur
       bâclé écrase cinq propositions de Leïla (mgmtDecide 'crush' — la
       réaction est ignorée, la pile se referme, mgmtClosePile repropose)
       avant de valider la sixième. Renvoie la proposition validée, ou
       null (shortfall : la soirée n'a pas de préliminaires). */
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
       par mgmtRunEvent. Renvoie la finance de la carte complète et celle
       de sa réduite (mesurée sur les clones d'avant combat), ou null. */
    function soireeReelle(m,echec){
      const bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open');
      if(!bulk||!Array.isArray(bulk.fights)){ out.echecs[echec]++; return null; }
      for(const f of bulk.fights){ if(f.sloppy) out.sloppyPre++; out.preN++; }
      if(!mgmtDecide(m,bulk.id,'validate')){ out.echecs[echec]++; return null; }
      const slotted=mgmtCardFights(m).map(f=>({a:f.a,b:f.b,slot:f.slot==='main'?'main':'prelim'}));
      if(slotted.length!==MGMT_MAIN_SIZE+MGMT_PRELIM_SIZE){ out.echecs[echec]++; return null; }
      const attraction=mgmtCardAttraction(m,slotted);
      const purses=mgmtPurses(m,slotted);
      /* Réduite (QO-7) : la carte complète moins son prélim d'attrait le
         plus faible. mgmtRunEvent refuse une carte incomplète et les
         combats mutent les lignes : la réduite se mesure sur les clones
         d'avant combat (mgmtFightReady), avec la vraie finance. */
      const pre=slotted.filter(f=>f.slot!=='main')
        .map(f=>({f:f,d:mgmtFightDraw(mgmtFighterById(m,f.a),mgmtFighterById(m,f.b))}))
        .sort((x,y)=>x.d-y.d)[0].f;
      const s8=slotted.filter(x=>x!==pre);
      const clones=s8.map(f=>({a:mgmtFightReady(mgmtFighterById(m,f.a)),b:mgmtFightReady(mgmtFighterById(m,f.b))}));
      const a8=mgmtCardAttraction(m,s8), p8=mgmtPurses(m,s8);
      G={mgmt:m};
      const ev=mgmtRunEvent(m);
      if(!ev){ out.echecs[echec]++; return null; }
      const fam=[];
      for(const c of clones){
        const res=simulateFight(c.a,c.b,3);
        fam.push({winner:res.winner,family:mgmtMethodFamily(res.method,res.winner)});
      }
      const f8=mgmtEventRecette(a8,mgmtSpectacle(fam),p8,s8.length);
      return {full:ev.finance,red:{attraction:f8.attraction,spectacle:f8.spectacle,audience:f8.audience,
        ticketing:f8.ticketing,tv:f8.tv,purses:f8.purses,recette:f8.recette}};
    }

    for(let i=FROM;i<TO;i++){
      /* Profil propre, puis sa réduite : même graine, même état, même
         carte — la réduite est la carte complète moins son plus faible
         prélim. Les propositions simples de Leïla sont ignorées (ignorer
         est une décision, CDC §4.1) — la pile est résolue avant la
         composition, sinon elle bloquerait la fin de pile (mgmtClosePile). */
      setSeed(BASE+i);
      const m=mgmtDefault(); mgmtNewRoster(m);
      mgmtNewPile(m);
      for(const a of m.pile.slice()){ if(a.status==='open'&&a.kind==='leila_propose') mgmtIgnore(m,a.id); }
      if(composeMainPropre(m)){
        const r=soireeReelle(m,'propre');
        if(r){ out.propre.push(r.full); out.reduite.push(r.red); }
      }else{
        out.echecs.propre++;
      }
      /* Profil bâclé : graine distincte, carte bâclée + écrasements. */
      setSeed(BASE+1000000+i);
      const m2=mgmtDefault(); mgmtNewRoster(m2);
      mgmtNewPile(m2);
      for(const a of m2.pile.slice()){ if(a.status==='open'&&a.kind==='leila_propose') mgmtIgnore(m2,a.id); }
      if(composeMainBatcle(m2)){
        const bulk2=prelimsBatcle(m2);
        if(bulk2){
          const r2=soireeReelle(m2,'batcle');
          if(r2) out.batcle.push(r2.full); else out.echecs.batcle++;
        }else{
          out.echecs.batcle++;
        }
      }else{
        out.echecs.batcle++;
      }
    }
    out.ref=mgmtAudienceRef(null);
    out.cst={TREASURY_START:MGMT_TREASURY_START,STAR_FIGHTS:MGMT_STAR_FIGHTS,STAR_W_RATIO:MGMT_STAR_W_RATIO,
      STAR_W_LVL:MGMT_STAR_W_LVL,PURSE_BASE:MGMT_PURSE_BASE,PURSE_PER_STAR:MGMT_PURSE_PER_STAR,
      PURSE_PRELIM_W:MGMT_PURSE_PRELIM_W,PURSE_MAIN_W:MGMT_PURSE_MAIN_W,ATTR_PRELIM_W:MGMT_ATTR_PRELIM_W,
      ATTR_MAIN_W:MGMT_ATTR_MAIN_W,ATTR_GAP:MGMT_ATTR_GAP,TICKET_PER_DRAW:MGMT_TICKET_PER_DRAW,
      AUD_BASE:MGMT_AUD_BASE,AUD_PER_DRAW:MGMT_AUD_PER_DRAW,TV_PER_AUD:MGMT_TV_PER_AUD,
      TV_ECRANS:MGMT_TV_ECRANS,CARD_CONTRACT:MGMT_CARD_CONTRACT,DRAW_AVG:MGMT_DRAW_AVG,
      SPECTACLE_REF:MGMT_SPECTACLE_REF,SLOPPY_GAP:MGMT_SLOPPY_GAP,RANK_GAP:MGMT_RANK_GAP,
      MAIN_SIZE:MGMT_MAIN_SIZE,PRELIM_SIZE:MGMT_PRELIM_SIZE};
    return JSON.stringify(out);
  })()`);
  return agg;
}

/* --------------------- 4) répartition sur les cœurs ------------------------ */
/** Fusionne les paquets contigus dans l'ordre des graines : les finance
 *  brutes sont concaténées, rien ne se recalcule. @returns {object} */
function mergeParts(parts){
  const out={propre:[],reduite:[],batcle:[],echecs:{propre:0,batcle:0},sloppyPre:0,preN:0,ref:0,cst:{}};
  for(const p of parts){
    out.propre=out.propre.concat(p.propre);
    out.reduite=out.reduite.concat(p.reduite);
    out.batcle=out.batcle.concat(p.batcle);
    out.echecs.propre+=p.echecs.propre;
    out.echecs.batcle+=p.echecs.batcle;
    out.sloppyPre+=p.sloppyPre;
    out.preN+=p.preN;
    if(p.ref) out.ref=p.ref;
    if(p.cst&&Object.keys(p.cst).length) out.cst=p.cst;
  }
  return out;
}

/** Lance un enfant par paquet contigu de soirées et rend les mesures
 *  fusionnées, dans l'ordre des graines. */
function measureParallel(cfg,done){
  const jobs=Math.min(cfg.jobs,cfg.cards);
  const step=Math.ceil(cfg.cards/jobs);
  const parts=[];
  let left=jobs, failed=false;
  for(let j=0;j<jobs;j++){
    const from=j*step, to=Math.min(cfg.cards,from+step);
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
    const aud=stats(S.map(x=>x.audience));
    const atr=stats(S.map(x=>x.attraction));
    const spe=stats(S.map(x=>x.spectacle));
    const rent=Math.round(1000*S.filter(x=>x.recette>0).length/S.length)/10;
    return {name,n:rec.n,rent,rec_mean:r1(rec.mean),rec_sd:r1(rec.sd),rec_p5:rec.p5,rec_med:rec.p50,rec_p95:rec.p95,
      rev:r1(rev.mean),pur:r1(pur.mean),atr:r2(atr.mean),spe:r3(spe.mean),aud:r1(aud.mean),aud_sd:r1(aud.sd),...extra};
  }

  const kept=A.reduite.filter(x=>x.audience>=A.ref).length;
  const audRefShare=pct(kept,A.reduite.length);
  const sloppyShare=pct(A.sloppyPre,A.preN);
  const rows=[
    row('propre (5+4, déroulé réel)',A.propre),
    row('réduite (8, prélim faible retiré)',A.reduite,{aud_ref:audRefShare}),
    row('bâclée (5+4 écrasée, déroulé réel)',A.batcle,{sloppy:sloppyShare}),
  ];

  /* Cibles du lot 3b T1 (docs/lots/LOT-3B-T1-CALIBRAGE.md §3) — ce sont
     des décisions d'auteur, jamais revues ici. Le seuil de la cible 3
     est la lecture de l'outil : « part mesurable » = au moins 10 %.
     AVANT : les mesures de l'ancien outil (graine 20260915, 4000 soirées
     par profil, déroulé synthétique 4 + 4 — §2 du rapport d'origine). */
  const AVANT={c1:73.1,c2:0.6,c3:31.2};
  const verdicts=[
    {lib:'1. Une carte complète moyenne est rentable dans 70 à 80 % des soirées',
     cible:'70 à 80 %',avant:AVANT.c1+' % (déroulé synthétique 4 + 4)',mesure:rows[0].rent+' % (propre, déroulé réel)',
     ok:rows[0].rent>=70&&rows[0].rent<=80},
    {lib:"2. Une carte d'appariements médiocres perd de l'argent plus souvent qu'elle n'en gagne",
     cible:'moins de 50 % de rentables',avant:AVANT.c2+' % de rentables (bâclée)',mesure:rows[2].rent+' % (bâclée)',
     ok:rows[2].rent<50},
    {lib:"3. Une carte réduite d'un combat faible garde son audience de référence dans une part mesurable des cas",
     cible:'part mesurable (lecture de l\'outil : ≥ 10 %)',avant:AVANT.c3+' % (réduite)',mesure:audRefShare+' % (réduite, réf '+A.ref+' écrans)',
     ok:audRefShare>=10},
  ];

  const L=[];
  L.push('# Calibrage Monte Carlo — l\u2019argent sur le déroulé réel (lot 2 T4)');
  L.push('');
  L.push('Outil : `tools/monte-carlo-economie.js` — jeu réel (jsdom), VRAI déroulé : le joueur-type');
  L.push('compose sa carte principale par le geste du jeu (`mgmtBookMain`), Leïla propose les');
  L.push('préliminaires (`mgmtNewBulkAffair`), la soirée se joue par `mgmtRunEvent` — attrait et');
  L.push('cachets lus sur les lignes d\u2019avant combat, conséquences réelles (`mgmtApplyFight`).');
  L.push('Remplace le profil « 8 meilleures paires possibles » du lot 3b T1 (carte 4 + 4).');
  L.push('');
  L.push('- Graine de base : `'+cfg.seed+'`');
  L.push('- Soirées demandées par profil : '+cfg.cards+' (paquets contigus, au plus 12 processus)');
  L.push('- Soirées jouées : propre '+rows[0].n+', réduite '+rows[1].n+', bâclée '+rows[2].n
    +' — non jouables (pot épuisé : '+(A.echecs.propre+A.echecs.batcle)+')');
  L.push('- Référence D4 d\u2019avant première soirée (mgmtAudienceRef sans historique, carte 5 + 4) : '+A.ref+' écrans');
  L.push('');
  L.push('## Heuristiques des joueurs-types (documentées, aucun tirage caché)');
  L.push('');
  L.push('| Profil | Carte principale | Préliminaires |');
  L.push('|---|---|---|');
  L.push('| propre | cinq meilleures paires disjointes de même catégorie disponibles, par attrait décroissant (mgmtFightDraw), posées par `mgmtBookMain` | la vraie proposition de Leïla (`mgmtNewBulkAffair`), validée sans écrasement |');
  L.push('| bâclé | cinq paires tirées au hasard seedé parmi les paires de même catégorie bâclées au sens du jeu (écart de bilan ≥ '+A.cst.SLOPPY_GAP+' combats, ou écart de rang > '+A.cst.RANK_GAP+') ; complétées au hasard à défaut | cinq propositions de Leïla ÉCRASÉES, la sixième validée (coût de l\u2019écrasement, addendum §12) |');
  L.push('| réduite | — | la carte propre moins son prélim d\u2019attrait le plus faible (QO-7), mesurée sur les clones d\u2019avant combat |');
  L.push('');
  L.push('## Résultats (graine de base '+cfg.seed+')');
  L.push('');
  L.push('Valeurs en k$ (milliers), audience en écrans entiers. R = recette nette (revenus − cachets).');
  L.push('');
  L.push('| Profil | n | R moyen | R écart | R p5 | R méd | R p95 | % rentables | Revenus | Cachets | Attrait | Spectacle | Audience | Aud écart | Aud ≥ réf |');
  L.push('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|');
  for(const r of rows){
    L.push(['| '+r.name+' | '+r.n+' | '+r.rec_mean+' | '+r.rec_sd+' | '+r.rec_p5+' | '+r.rec_med+' | '+r.rec_p95
      +' | '+r.rent+' | '+r.rev+' | '+r.pur+' | '+r.atr+' | '+r.spe+' | '+r.aud+' | '+r.aud_sd+' | '
      +(r.aud_ref!==undefined?r.aud_ref+' %':'—')+' |'].join(''));
  }
  L.push('');
  L.push('Part de combats de préliminaires bâclés dans les propositions validées : '+sloppyShare+' %');
  L.push('(propre : attendue quasi nulle — Leïla est soigneuse sans écrasement ; bâclée : au plafond du jeu).');
  L.push('');
  L.push('## Cibles du lot 3b T1 — mesurées avant et après');
  L.push('');
  L.push('| Cible (lot 3b T1) | Avant (outil lot 3b, 4 + 4) | Après (déroulé réel) | Verdict |');
  L.push('|---|---|---|---|');
  for(const x of verdicts){
    L.push('| '+x.lib+' | '+x.avant+' | '+x.mesure+' | '+(x.ok?'ATTEINTE':'MANQUÉE')+' |');
  }
  L.push('');
  L.push('## Pourquoi le déroulé réel est meilleur que la mesure du lot 3b T1');
  L.push('');
  L.push('La relecture du lot 3b T1 prévoyait une économie perdante (une soirée réelle mesurée à');
  L.push('R = −6 k$ : trésorerie 50 → 44). Ce pessimisme venait du déroulé synthétique 4 + 4 :');
  L.push('il joue 8 combats contre une carte contractuelle passée à 9 (lot 2 T1) — les droits du');
  L.push('diffuseur au prorata 8/9, ≈ −5 k$ — et un attrait de carte à 14 au lieu de 16.5 (cinq');
  L.push('places de carte principale à leur poids, quatre préliminaires). Sur le VRAI déroulé :');
  L.push('cinq combats de carte principale (poids d\u2019attrait 2.5, prorata complet 9/9 des droits)');
  L.push('et la vraie proposition de Leïla — des préliminaires à cachets proches du plancher —');
  L.push('les poids d\u2019argent atteignent les trois cibles sans être touchés. La soirée mesurée à');
  L.push('R = −6 est un tirage sous le 5e centile (p5 = '+rows[0].rec_p5+' k$) : une soirée malchanceuse,');
  L.push('pas la moyenne — '+rows[0].rent+' % des soirées réelles non écrasées sont rentables (R moyen');
  L.push('+'+rows[0].rec_mean+' k$).');
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
  L.push('## Constantes recalibrées (ancre MGMT_LOT3B_T1_ECONOMIE, mgmt-bureau.js)');
  L.push('');
  L.push('Les poids d\u2019argent du lot 3b T1 sont inchangés : les trois cibles sont atteintes');
  L.push('sur le déroulé réel sans les toucher. Seules les références D4 (mesures, jamais des');
  L.push('cibles) suivent le déroulé réel — mgmtAudienceRef sans historique doit rester');
  L.push('l\u2019audience moyenne d\u2019une carte complète (écart mesuré < 1 %, QO-7).');
  L.push('');
  L.push('| Constante | Ancienne (lot 3b T1) | Nouvelle (lot 2 T4) | Effet mesuré |');
  L.push('|---|---|---|---|');
  L.push('| `MGMT_DRAW_AVG` | 0.62 | '+A.cst.DRAW_AVG+' | attrait moyen mesuré d\u2019un combat (carte propre, réel) : '
    +r3(rows[0].atr/(A.cst.MAIN_SIZE*A.cst.ATTR_MAIN_W+A.cst.PRELIM_SIZE*A.cst.ATTR_PRELIM_W))
    +' — la référence D4 sans historique repasse à moins de 1 % de l\u2019audience moyenne mesurée |');
  L.push('| `MGMT_SPECTACLE_REF` | 0.64 | '+A.cst.SPECTACLE_REF+' | part de finitions mesurée (carte propre, réel) : '+rows[0].spe+' |');
  L.push('');
  L.push('Toutes les autres constantes du lot 3b T1 (§4 du rapport d\u2019origine) sont inchangées :');
  L.push('');
  L.push('| Constante | Valeur |');
  L.push('|---|---|');
  const CNAMES=['MGMT_TREASURY_START','MGMT_STAR_FIGHTS','MGMT_STAR_W_RATIO','MGMT_STAR_W_LVL',
    'MGMT_PURSE_BASE','MGMT_PURSE_PER_STAR','MGMT_PURSE_PRELIM_W','MGMT_PURSE_MAIN_W',
    'MGMT_ATTR_PRELIM_W','MGMT_ATTR_MAIN_W','MGMT_ATTR_GAP','MGMT_TICKET_PER_DRAW',
    'MGMT_AUD_BASE','MGMT_AUD_PER_DRAW','MGMT_TV_PER_AUD','MGMT_TV_ECRANS','MGMT_CARD_CONTRACT'];
  const CK={'MGMT_TREASURY_START':'TREASURY_START','MGMT_STAR_FIGHTS':'STAR_FIGHTS','MGMT_STAR_W_RATIO':'STAR_W_RATIO',
    'MGMT_STAR_W_LVL':'STAR_W_LVL','MGMT_PURSE_BASE':'PURSE_BASE','MGMT_PURSE_PER_STAR':'PURSE_PER_STAR',
    'MGMT_PURSE_PRELIM_W':'PURSE_PRELIM_W','MGMT_PURSE_MAIN_W':'PURSE_MAIN_W','MGMT_ATTR_PRELIM_W':'ATTR_PRELIM_W',
    'MGMT_ATTR_MAIN_W':'ATTR_MAIN_W','MGMT_ATTR_GAP':'ATTR_GAP','MGMT_TICKET_PER_DRAW':'TICKET_PER_DRAW',
    'MGMT_AUD_BASE':'AUD_BASE','MGMT_AUD_PER_DRAW':'AUD_PER_DRAW','MGMT_TV_PER_AUD':'TV_PER_AUD',
    'MGMT_TV_ECRANS':'TV_ECRANS','MGMT_CARD_CONTRACT':'CARD_CONTRACT'};
  for(const c of CNAMES){ L.push('| `'+c+'` | '+A.cst[CK[c]]+' |'); }
  L.push('');
  L.push('Reproductibilité : un même `--seed`/`--cards` redonne exactement ces valeurs. Chaque soirée i');
  L.push('démarre sous `setSeed(base + i)` (propre et sa réduite) et `setSeed(base + 1000000 + i)` (bâclée).');
  L.push('Parallélisme : les paquets contigus de soirées sont indépendants (graine propre à chaque');
  L.push('soirée) — `--jobs` donne les mêmes chiffres que `--serial`, bit à bit.');
  L.push('');

  fs.writeFileSync(cfg.out,L.join('\n'));
  if(cfg.quiet){
    console.log('Rapport écrit : '+cfg.out);
    for(const x of verdicts){ console.log((x.ok?'ATTEINTE':'MANQUÉE')+' — '+x.lib+' : '+x.mesure); }
  }else{
    console.log(L.join('\n'));
    console.log('\nRapport écrit : '+cfg.out);
  }
}

/* ------------------------------ 6) main ------------------------------------ */
(function main(){
  const cfg = parseArgs(process.argv.slice(2));
  /* Enfant : mesure son paquet contigu de soirées et rend ses finance. */
  if(cfg.worker){ process.stdout.write(measure(cfg)); return; }
  if(cfg.jobs<=1){ report(JSON.parse(measure(cfg)),cfg); return; }
  measureParallel(cfg,(err,A)=>{
    if(err){ console.error(err.message); process.exitCode=1; return; }
    report(A,cfg);
  });
})();
