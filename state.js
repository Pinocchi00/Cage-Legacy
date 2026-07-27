"use strict";
/* CAGE LEGACY — js/state.js
   État global G, sauvegarde/chargement, Panthéon persistant, migration.
   Dépend de engine.js (epithets, appelé par enshrine). legacyTitle (dans ui.js,
   appelé par enshrine) n'est résolu qu'à l'exécution : ui.js doit être chargé
   avant toute partie jouée, jamais avant l'exécution de state.js lui-même. */
/* =========================================================================
   CAGE LEGACY — Couche jouable v3 (sur moteur v2 : engine2.js concaténé).
   Lisible mobile · thème sombre/clair · 3 adversaires + %estimé · camp = 3
   choix liés au sport avec deltas visibles et bornés · orgs · fiche /20 ·
   stats de combat · 5 derniers combats · surnom gagné · épithètes de fin.
   ========================================================================= */
let G=null;
const SAVE_KEY='cage-legacy-v3';
const esc=s=>(''+s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

/* ------------------------------ sauvegarde -------------------------------- */
function save(){ try{ localStorage.setItem(SAVE_KEY,JSON.stringify(G)); }catch(e){} }
function load(){ try{ const s=localStorage.getItem(SAVE_KEY); if(s){ G=migrate(JSON.parse(s)); return true; } }catch(e){ console.error('Sauvegarde illisible:',e); G=null; } return false; }
function hasSave(){ try{ return !!localStorage.getItem(SAVE_KEY); }catch(e){ return false; } }
function wipe(){ try{ localStorage.removeItem(SAVE_KEY); }catch(e){} }
/* ==== [ANCRE: PANTHEON] — hors wipe(), survit d'une carrière à l'autre ==== */
const HOF_KEY='cage-legacy-hof', SAVE_VERSION=2;
function loadHOF(){ try{ return JSON.parse(localStorage.getItem(HOF_KEY))||[]; }catch(e){ return []; } }
function saveHOF(l){ try{ localStorage.setItem(HOF_KEY,JSON.stringify(l)); }catch(e){} }
function hofScore(f){ return (f._world?300:0)+(f._euro?120:0)+f.defenses*30+f.W*3-f.L*4+f.ko*2+f.sub*2; }
function enshrine(f){ const [ico,rank]=legacyTitle(f); const list=loadHOF();
  list.push({name:f.name,nick:f.nick,flag:f.flag,style:f.styleLabel,div:f.divName,W:f.W,L:f.L,ko:f.ko,sub:f.sub,
    titles:f.titles,defenses:f.defenses,world:!!f._world,euro:!!f._euro,ico,rank,epithets:epithets(f),score:hofScore(f),age:f.age});
  list.sort((a,b)=>b.score-a.score); if(list.length>40)list.length=40; saveHOF(list); }
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: MIGRATION] — on empile les blocs, on n'en modifie jamais un livré ==== */
function migrate(g){ if(!g)return g; g.version=g.version||1;
  if(g.version<2){ g.version=2; }
  return g; }
/* ==== [FIN ANCRE] ==== */
function setTheme(t){ G.theme=t; try{ if(document.documentElement)document.documentElement.setAttribute('data-theme',t); }catch(e){} }
