"use strict";
/* CAGE LEGACY — tools/monte-carlo-economie.js
   ============================================================================
   Lot 3b T1 — calibrage Monte Carlo de l'économie de l'organisation
   (contrat docs/LOT-3B-CONTRAT.md §3 T1 : « Constantes nommées, calibrées
   par Monte Carlo sur des cartes de 4 + 4 combats (outil dans tools/,
   graines publiées) »). Charge le VRAI jeu dans un DOM virtuel (jsdom),
   dans l'ordre EXACT des <script src> d'index.html — lu directement depuis
   le fichier à chaque exécution (même principe que tools/monte-carlo.js,
   qui ne dépend pas de tests/).

   Mesure, ne décide rien : toute la finance (attrait, cachets, spectacle,
   audience, recette) vient des fonctions du jeu (mgmtStar, mgmtPurse,
   mgmtFightDraw, mgmtCardAttraction, mgmtPurses, mgmtSpectacle,
   mgmtEventRecette). L'outil ne fait que composer des cartes de 4 + 4
   combats et les jouer avec le moteur réel (simulateFight), comme
   mgmtRunEvent le fera à la T2 :

   - profil « propre » : les huit meilleures paires éligibles (même
     catégorie, même genre, prénoms distincts) par attrait décroissant —
     les quatre meilleures en main card, les suivantes en prélims. Proxy de
     la main card choisie par le joueur (les meilleurs noms) et des prélims
     soigneux de Leïla (lot 2, sans écrasement).
   - profil « bâclé » : huit paires bâclées au sens du jeu (inter-catégories
     ou gros écart de bilan — MGMT_SLOPPY_GAP et mgmtRecGap), tirées au
     hasard seedé, quatre en main card, quatre en prélims. Proxy de la
     carte écrasée (coût de l'écrasement, addendum §12).
   - profil « réduite » : la carte propre moins son prélim d'attrait le plus
     faible (QO-7 : moins de combats = moins d'attrait, la qualité des
     combats restants décide). Mesure la part de soirées dont l'audience
     reste au-dessus de la référence D4 — la moyenne des audiences des
     soirées précédentes, ou la référence avant toute soirée.

   Aucun Math.random() : la RNG du jeu (rnd(), seedée par setSeed) est la
   seule source de tirage. Chaque soirées i utilise setSeed(base + i)
   (propre, et sa réduite) et setSeed(base + 1000000 + i) (bâclée) — un run
   est intégralement reproductible pour un même --seed/--cards.

   Usage :
     node tools/monte-carlo-economie.js [--seed=S] [--cards=N] [--quiet]
   ============================================================================ */
const path = require('path');
const fs = require('fs');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');

/* --------------------------- 1) CLI --------------------------------------- */
function parseArgs(argv){
  const out = { seed: 20260915, cards: 4000, quiet: false };
  for(const arg of argv){
    if(arg === '--quiet'){ out.quiet = true; continue; }
    const m = /^--([a-zA-Z]+)=(.+)$/.exec(arg);
    if(!m) continue;
    const key = m[1], val = m[2];
    if(key === 'seed') out.seed = parseInt(val, 10) || out.seed;
    else if(key === 'cards') out.cards = Math.max(1, parseInt(val, 10) || out.cards);
  }
  return out;
}

/* --------------------- 2) chargement du jeu -------------------------------- */
/** Lit index.html et retourne la liste des <script src="..."> dans l'ordre
 * d'apparition — seule source de vérité sur l'ordre de chargement réel.
 * @returns {string[]} */
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

/* ------------------------------ 3) main ------------------------------------ */
(function main(){
  const cfg = parseArgs(process.argv.slice(2));
  const win = newGameWindow();
  /* Toute la boucle vit côté fenêtre (accès direct aux fonctions du jeu,
     aucun aller-retour d'évaluation par soirée) ; les agrégats reviennent
     en JSON. */
  const agg = win.eval(`(function(){
    const cfg={seed:${cfg.seed},cards:${cfg.cards}};
    const out={propre:[],batcle:[],skipped:0};
    /* Mélange seedé (Fisher-Yates sur la RNG du jeu, jamais Math.random). */
    function shuffle(a){
      for(let i=a.length-1;i>0;i--){
        const j=Math.floor(rnd()*(i+1));
        const t=a[i]; a[i]=a[j]; a[j]=t;
      }
      return a;
    }
    /* Paires éligibles : même genre, prénoms distincts. sloppyOnly filtre
       sur la définition du jeu d'un appariement bâclé (inter-catégories ou
       gros écart de bilan). */
    function eligible(m,sloppyOnly){
      const out=[];
      const r=m.roster;
      const genderOf=o=>{ const d=divById(o.div); return d?d.gender:null; };
      for(let i=0;i<r.length;i++){
        for(let j=i+1;j<r.length;j++){
          const A=r[i], B=r[j];
          if(A.first===B.first) continue;
          if(genderOf(A)!==genderOf(B)) continue;
          const sloppy=(A.div!==B.div)||mgmtRecGap(A,B)>=MGMT_SLOPPY_GAP;
          if(sloppyOnly!==sloppy) continue;
          out.push({a:A.id,b:B.id,draw:mgmtFightDraw(A,B)});
        }
      }
      return out;
    }
    /* Carte de 8 : quatre mains, quatre prélims, combattants tous
       distincts. byDraw : les meilleures paires d'abord (profil propre) ;
       sinon l'ordre est tiré au hasard seedé (profil bâclé). */
    function buildCard(cands,byDraw){
      if(byDraw) cands.sort((x,y)=>y.draw-x.draw); else shuffle(cands);
      const used=new Set(), slotted=[];
      for(const c of cands){
        if(slotted.length>=8) break;
        if(used.has(c.a)||used.has(c.b)) continue;
        used.add(c.a); used.add(c.b);
        slotted.push({a:c.a,b:c.b,slot:slotted.length<4?'main':'prelim'});
      }
      return slotted.length>=8?slotted:null;
    }
    /* Soirée sur le moteur réel : cachets et attrait lus sur les lignes
       d'avant combat, spectacle sur les combats joués — l'ordre de
       mgmtRunEvent. */
    function runSoiree(m,slotted){
      const attraction=mgmtCardAttraction(m,slotted);
      const purses=mgmtPurses(m,slotted);
      const fights=[];
      for(const cf of slotted){
        const fa=mgmtFighterById(m,cf.a), fb=mgmtFighterById(m,cf.b);
        const res=simulateFight(mgmtFightReady(fa),mgmtFightReady(fb),3);
        fights.push({winner:res.winner,family:mgmtMethodFamily(res.method,res.winner)});
      }
      return mgmtEventRecette(attraction,mgmtSpectacle(fights),purses,fights.length);
    }
    let audSum=0, audN=0;
    for(let i=0;i<cfg.cards;i++){
      /* Profil propre, puis sa réduite : même graine, même roster, même
         combats tirés — la réduite est la carte moins son plus faible
         prélim. */
      setSeed(cfg.seed+i);
      const m=mgmtDefault(); mgmtNewRoster(m);
      const slotted=buildCard(eligible(m,false),true);
      if(!slotted){ out.skipped++; continue; }
      const fin=runSoiree(m,slotted);
      out.propre.push(fin);
      /* Référence D4 : moyenne des audiences des soirées précédentes, ou
         référence avant toute soirée (mgmtAudienceRef sans historique). */
      const ref=audN>0?Math.round(audSum/audN):mgmtAudienceRef(m);
      const pre=slotted.filter(f=>f.slot==='prelim')
        .map(f=>({f,d:mgmtFightDraw(mgmtFighterById(m,f.a),mgmtFighterById(m,f.b))}))
        .sort((x,y)=>x.d-y.d)[0].f;
      const reduced=slotted.filter(x=>x!==pre);
      out.reduite=out.reduite||[];
      out.reduite.push(Object.assign(runSoiree(m,reduced),{ref}));
      audSum+=fin.audience; audN++;
      /* Profil bâclé : graine distincte, paires bâclées au hasard seedé. */
      setSeed(cfg.seed+1000000+i);
      const m2=mgmtDefault(); mgmtNewRoster(m2);
      const slotted2=buildCard(eligible(m2,true),false);
      if(!slotted2){ out.skipped++; continue; }
      out.batcle.push(runSoiree(m2,slotted2));
    }
    return JSON.stringify(out);
  })()`);
  const A = JSON.parse(agg);
  if(!A.propre.length||!A.batcle.length){
    console.log('Aucune carte complète n\'a pu être composée — augmente --cards ou vérifie le roster.');
    process.exitCode = 1;
    return;
  }

  const stats=v=>{
    const a=v.slice().sort((x,y)=>x-y);
    const q=p=>a[Math.min(a.length-1,Math.max(0,Math.round(p*(a.length-1))))];
    const mean=a.reduce((x,y)=>x+y,0)/a.length;
    const sd=Math.sqrt(a.reduce((x,y)=>x+(y-mean)*(y-mean),0)/a.length);
    return {n:a.length,mean,sd,p5:q(0.05),p50:q(0.5),p95:q(0.95)};
  };
  const r1=x=>Math.round(x*10)/10, r2=x=>Math.round(x*100)/100, r3=x=>Math.round(x*1000)/1000;

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

  const kept=A.reduite.filter(x=>x.audience>=x.ref).length;
  const rows=[
    row('propre (4+4 soignée)',A.propre),
    row('réduite (7, prélim faible retiré)',A.reduite,{aud_ref:+r1(100*kept/A.reduite.length)}),
    row('bâclée (4+4 écrasée)',A.batcle),
  ];
  const head=['profil','n','R moyen','R écart','R p5','R méd','R p95','% rentables','revenus','cachets','attrait','spectacle','audience','aud écart','aud ≥ réf'];
  const lines=[];
  lines.push('Monte Carlo économie — lot 3b T1 (cartes 4 + 4, moteur réel)');
  lines.push(`graine de base ${cfg.seed} — soirées par profil ${cfg.cards} (cartes sautées : ${A.skipped})`);
  lines.push('');
  lines.push(head.join(' | '));
  for(const r of rows){
    lines.push([r.name,r.n,r.rec_mean,r.rec_sd,r.rec_p5,r.rec_med,r.rec_p95,r.rent,r.rev,r.pur,r.atr,r.spe,r.aud,r.aud_sd,
      r.aud_ref!==undefined?r.aud_ref:'—'].join(' | '));
  }
  if(!cfg.quiet){
    const wMain=Number(win.eval('MGMT_ATTR_MAIN_W')), wPre=Number(win.eval('MGMT_ATTR_PRELIM_W'));
    const drawMean=A.propre.reduce((s,x)=>s+x.attraction,0)/A.propre.length/(4*(wMain+wPre));
    lines.push('');
    lines.push(`attrait moyen d'un combat (carte propre) : ${r3(drawMean)}`);
    lines.push(`référence avant toute soirée (mgmtAudienceRef sans historique) : ${win.eval('mgmtAudienceRef(null)')}`);
  }
  console.log(lines.join('\n'));
})();
