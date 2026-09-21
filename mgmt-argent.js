"use strict";
/* CAGE LEGACY — mgmt-argent.js
   ============================================================================
   MODE MANAGEMENT — l'argent de l'organisation : un seul solde (le
   découvert est la trésorerie sous zéro, jamais un compteur séparé),
   cachets dérivés de la ligne (jamais stockés, règle du bureau CDC §3),
   recette nette R = billetterie + droits du diffuseur − cachets, plafond
   de découvert, audience et sa référence pour D4. Issu de mgmt-bureau.js,
   découpage de la dette CLAUDE.md §10 (ancre MGMT_LOT3B_T1_ECONOMIE).
   Fonctions pures, aucun rnd(), aucune réplique, aucun affichage :
   la trésorerie s'affiche à la T6 via mgmt-screens.js.

   Le seul fichier mgmt-* dont une constante de premier niveau dépend
   d'un autre fichier : MGMT_CARD_CONTRACT = MGMT_MAIN_SIZE +
   MGMT_PRELIM_SIZE lit mgmt-data.js — ce fichier se charge donc après
   mgmt-data.js dans index.html. Les fonctions dépendent au runtime de
   mgmt-corps.js (mgmtLevelForRecord) et mgmt-bureau.js (mgmtFighterById).
   ============================================================================ */

/* ==== [ANCRE: MGMT_LOT3B_T1_ECONOMIE] — Lot 3b T1 l'argent de
   l'organisation (contrat LOT-3B §3 T1, décisions QO-5 et QO-7 §1) : un seul
   solde — le découvert est T sous zéro, jamais un compteur séparé — cachets
   dérivés de la ligne (jamais stockés, règle du bureau CDC §3), recette
   nette R = billetterie + droits du diffuseur − cachets, plafond de
   découvert, audience et sa référence pour D4. Fonctions pures, aucun
   rnd(), aucune réplique, aucun affichage dans cette tranche : la
   trésorerie s'affichera à la T6 (CDC §7) ; la réplique E1 du patron existe
   (texte d'auteur, LOT-3B §E1) et sera branchée à une tranche ultérieure —
   T1 ne stocke que la condition, dans m.lastEvent.e1. Lot 2 T1 : la carte
   {main,prelims} existe en jeu (docs/LOT-2-CARTE-PRINCIPALE.md §T1) —
   cachets et attrait lisent l'emplacement porté par chaque combat.
   Constantes calibrées par tools/monte-carlo-economie.js sur des cartes de
   4 + 4 combats (docs/lots/LOT-3B-T1-CALIBRAGE.md), revérifiées sur le VRAI
   déroulé à la T4 du lot 2 (docs/LOT-2-CARTE-PRINCIPALE.md §T4 —
   tools/reports/LOT-2-T4-CALIBRAGE-ECONOMIE.md). REPRISE DU 21/09 (§4 bis
   de ce contrat) : les cibles se jugent sur le JOUEUR D'ÉCRAN — le joueur
   ordinaire, qui ne dispose que de ce que l'écran de composition affiche
   (catégorie, rang, bilan) — jamais sur l'oracle (borne haute, ne sert à
   aucune cible). Pour porter le joueur d'écran dans la bande 70-80 % de
   soirées rentables, le cachet par point de nom passe de 4 à 3.35 (les
   mieux classés sont les mieux payés : c'est lui qui encaisse la hausse
   des cachets) ; les autres poids d'argent sont inchangés ; les références
   D4 (MGMT_DRAW_AVG, MGMT_SPECTACLE_REF) suivent la mesure du joueur
   d'écran. ==== */
/* Trésorerie au premier jour (k$). Ordre de grandeur de l'exemple QO-5
   (T=50 : un short notice à 60 est refusé avant la première soirée, P=0). */
const MGMT_TREASURY_START=50;
/* Nom d'une ligne (valeur de scène, 0..1) : activité (bilan total) pondérée
   par le bilan et le niveau dérivé du bilan — mgmtLevelForRecord clampe à
   MGMT_STAR_LVL_MIN..MGMT_STAR_LVL_MAX. Pur, jamais stocké. */
const MGMT_STAR_FIGHTS=8;
const MGMT_STAR_W_RATIO=0.35;
const MGMT_STAR_W_LVL=0.65;
const MGMT_STAR_LVL_MIN=40;
const MGMT_STAR_LVL_MAX=80;
/* Cachet (k$) d'un combattant : plancher + nom, pondéré par l'emplacement —
   un combat de main card coûte plus qu'un prélim (poids nommés, §3 T1).
   MGMT_PURSE_PER_STAR recalibré à la reprise T4 du 21/09 (4 → 3.35) :
   le joueur d'écran book les mieux classés, donc les mieux payés — la
   prime au nom subsiste, sa pente est moins raide (tools/reports/
   LOT-2-T4-CALIBRAGE-ECONOMIE.md). */
const MGMT_PURSE_BASE=1;
const MGMT_PURSE_PER_STAR=3.35;
const MGMT_PURSE_PRELIM_W=1;
const MGMT_PURSE_MAIN_W=2.5;
/* Attrait : poids d'emplacement d'un combat dans la carte — un combat de
   main card rapporte plus qu'un prélim — mordu par l'écart de nom entre les
   deux lignes (un combat déséquilibré ne se vend pas). */
const MGMT_ATTR_PRELIM_W=1;
const MGMT_ATTR_MAIN_W=2.5;
const MGMT_ATTR_GAP=0.6;
/* Billetterie (k$) par point d'attrait de la carte. */
const MGMT_TICKET_PER_DRAW=7;
/* Audience, en écrans entiers : attrait × mix de spectacle. L'audience est
   décidée surtout avant la soirée — MGMT_AUD_BASE est acquise d'avance, la
   part de finitions observée ne pèse que sur le reste. Une soirée sans
   finition garde donc une audience non nulle. */
const MGMT_AUD_BASE=0.7;
const MGMT_AUD_PER_DRAW=1000;
/* Droits du diffuseur (k$) pour MGMT_TV_ECRANS écrans, payés au prorata du
   nombre de combats joués par rapport à la carte contractuelle (addendum
   §16 : c'est le contrat du diffuseur). Carte contractuelle = la carte
   complète du lot 2 (décision du 19/09 : 9 combats — 5 en carte principale,
   4 en préliminaires). */
const MGMT_TV_PER_AUD=6;
const MGMT_TV_ECRANS=1000;
const MGMT_CARD_CONTRACT=MGMT_MAIN_SIZE+MGMT_PRELIM_SIZE;
/* Références D4 (QO-7) : attrait d'un combat moyen et spectacle (part de
   finitions) d'une carte complète d'attrait moyen, mesurés par Monte Carlo
   sur le VRAI déroulé, sur la carte du joueur d'écran (graine 20260919,
   4000 carrières — reprise T4 du 21/09, tools/reports/
   LOT-2-T4-CALIBRAGE-ECONOMIE.md ; l'ancien déroulé synthétique 4 + 4
   mesurait 0.616 et 0.638, docs/lots/LOT-3B-T1-CALIBRAGE.md ; la T4 livrée
   mesurait 0.59 et 0.67 sur l'oracle). mgmtAudienceRef sans historique
   redonne ainsi l'audience moyenne mesurée de la carte du joueur d'écran. */
const MGMT_DRAW_AVG=0.48;
const MGMT_SPECTACLE_REF=0.71;

/** Nom d'une ligne (0..1) : valeur de scène dérivée du bilan — activité,
 *  ratio de victoires, niveau dérivé du bilan. Pur et déterministe, jamais
 *  stocké sur la ligne (règle du bureau, CDC §3).
 *  @returns {number} 0 à 1. */
function mgmtStar(f){
  if(!f) return 0;
  const W=Number.isSafeInteger(f.W)?f.W:0, L=Number.isSafeInteger(f.L)?f.L:0, D=Number.isSafeInteger(f.D)?f.D:0;
  const t=W+L+D;
  const ratio=t>0?(W+0.5*D)/t:0.5;
  const lvl=mgmtLevelForRecord(W,L);
  const fame=1-Math.exp(-t/MGMT_STAR_FIGHTS);
  return clamp(fame*(MGMT_STAR_W_RATIO*ratio+MGMT_STAR_W_LVL*((lvl-MGMT_STAR_LVL_MIN)/(MGMT_STAR_LVL_MAX-MGMT_STAR_LVL_MIN))),0,1);
}

/** Cachet (k$) d'un combattant pour un emplacement ('main'|'prelim') :
 *  plancher + nom, pondéré par l'emplacement. Pur, jamais stocké sur la
 *  ligne — il est payé avant la soirée et n'existe que dans le calcul de
 *  l'événement (anti-rechargement).
 *  @returns {number} entier k$ > 0. */
function mgmtPurse(f,slot){
  const star=mgmtStar(f);
  const w=slot==='main'?MGMT_PURSE_MAIN_W:MGMT_PURSE_PRELIM_W;
  return Math.round((MGMT_PURSE_BASE+MGMT_PURSE_PER_STAR*star)*w);
}

/** Attrait d'un combat (0..1) : la valeur de scène des deux lignes, mordue
 *  par l'écart entre elles — un combat déséquilibré ne se vend pas. Pur.
 *  @returns {number} 0 à 1. */
function mgmtFightDraw(fa,fb){
  const sa=mgmtStar(fa), sb=mgmtStar(fb);
  return clamp((sa+sb)/2*(1-MGMT_ATTR_GAP*Math.abs(sa-sb)),0,1);
}

/** Attrait total d'une carte slottée, avant la soirée : Σ poids
 *  d'emplacement × attrait du combat. slotted = [{a,b,slot}] — des
 *  identifiants du roster ; une ligne introuvable ne compte pas. Pur.
 *  @returns {number} ≥ 0. */
function mgmtCardAttraction(m,slotted){
  if(!Array.isArray(slotted)) return 0;
  let s=0;
  for(const f of slotted){
    if(!f||typeof f.a!=='string'||typeof f.b!=='string') continue;
    const fa=mgmtFighterById(m,f.a), fb=mgmtFighterById(m,f.b);
    if(!fa||!fb) continue;
    s+=(f.slot==='main'?MGMT_ATTR_MAIN_W:MGMT_ATTR_PRELIM_W)*mgmtFightDraw(fa,fb);
  }
  return s;
}

/** Total des cachets (k$) d'une carte slottée, payés avant la soirée.
 *  Pur. @returns {number} entier ≥ 0. */
function mgmtPurses(m,slotted){
  if(!Array.isArray(slotted)) return 0;
  let p=0;
  for(const f of slotted){
    if(!f||typeof f.a!=='string'||typeof f.b!=='string') continue;
    const fa=mgmtFighterById(m,f.a), fb=mgmtFighterById(m,f.b);
    if(!fa||!fb) continue;
    p+=mgmtPurse(fa,f.slot)+mgmtPurse(fb,f.slot);
  }
  return p;
}

/** Spectacle observé d'une soirée : part de finitions (KO et soumission —
 *  l'arrêt médical est une intervention, pas un spectacle). Pur.
 *  @returns {number} 0 à 1. */
function mgmtSpectacle(fights){
  if(!Array.isArray(fights)||fights.length===0) return 0;
  let fin=0;
  for(const f of fights){ if(f&&(f.family==='ko'||f.family==='sub')) fin++; }
  return fin/fights.length;
}

/** Recette d'une soirée, en une seule fois (QO-5) : billetterie (attrait de
 *  la carte avant la soirée) + droits du diffuseur (audience en écrans =
 *  attrait × mix de spectacle, décidée surtout avant la soirée ; droits au
 *  prorata des combats joués sur la carte contractuelle de 8 — addendum
 *  §16) − cachets. Pure : attraction et cachets sont calculés sur les
 *  lignes d'avant combat par l'appelant, spectacle et nombre de combats sur
 *  les combats joués. Tout est entier (k$, écrans) ; R peut être négative.
 *  @returns {{attraction,spectacle,audience,ticketing,tv,purses,recette}} */
function mgmtEventRecette(attraction,spectacle,purses,nFights){
  const a=Math.max(0,num(attraction)), s=clamp(num(spectacle),0,1), p=Math.max(0,Math.round(num(purses)));
  /* L'audience est décidée surtout avant la soirée : la base est acquise,
     le spectacle observé (part de finitions) ne porte que le reste. */
  const mix=MGMT_AUD_BASE+(1-MGMT_AUD_BASE)*s;
  const audience=Math.round(MGMT_AUD_PER_DRAW*a*mix);
  const ticketing=Math.round(MGMT_TICKET_PER_DRAW*a);
  /* Droits au prorata des combats joués sur la carte contractuelle. */
  const n=(typeof nFights==='number'&&Number.isFinite(nFights))?Math.max(0,nFights):MGMT_CARD_CONTRACT;
  const tv=Math.round(MGMT_TV_PER_AUD*audience*n/(MGMT_TV_ECRANS*MGMT_CARD_CONTRACT));
  return {attraction:Math.round(a*1000)/1000,spectacle:Math.round(s*1000)/1000,
    audience,ticketing,tv,purses:p,recette:ticketing+tv-p};
}

/** Plafond de découvert P (QO-5) : 0 avant la première soirée, la dernière
 *  recette ensuite, puis la moyenne arrondie des deux dernières — lissée,
 *  jamais négative : une soirée perdante n'ouvre aucun crédit. Pure.
 *  @returns {number} entier ≥ 0. */
function mgmtOverdraftCap(m){
  if(!m||!Number.isSafeInteger(m.eventsPlayed)||m.eventsPlayed<1) return 0;
  if(!Array.isArray(m.recettes)||m.recettes.length<1) return 0;
  const last=Number.isSafeInteger(m.recettes[m.recettes.length-1])?m.recettes[m.recettes.length-1]:0;
  if(m.eventsPlayed<2||m.recettes.length<2) return Math.max(0,last);
  const prev=Number.isSafeInteger(m.recettes[m.recettes.length-2])?m.recettes[m.recettes.length-2]:0;
  return Math.max(0,Math.round((last+prev)/2));
}

/** Court préavis payable ? QO-5 : si et seulement si T − coût ≥ −P. Un seul
 *  solde. Pure. @returns {boolean} */
function mgmtCanAfford(m,cost){
  if(!m||!Number.isSafeInteger(m.treasury)) return false;
  const c=(typeof cost==='number'&&Number.isFinite(cost))?Math.max(0,Math.round(cost)):0;
  return m.treasury-c>=-mgmtOverdraftCap(m);
}

/** Audience de référence pour D4 (QO-7) : la moyenne d'audience (en écrans)
 *  des soirées précédentes — ou, avant toute soirée, l'audience qu'aurait
 *  eue une carte complète d'attrait moyen (5 combats de carte principale +
 *  4 préliminaires, spectacle de référence — lot 2 T1). Pure.
 *  @returns {number} entier ≥ 0. */
function mgmtAudienceRef(m){
  if(m&&Array.isArray(m.audiences)){
    let s=0,n=0;
    for(const a of m.audiences){ if(Number.isSafeInteger(a)&&a>=0){ s+=a; n++; } }
    if(n>0) return Math.round(s/n);
  }
  const refAttraction=MGMT_DRAW_AVG*(MGMT_MAIN_SIZE*MGMT_ATTR_MAIN_W+MGMT_PRELIM_SIZE*MGMT_ATTR_PRELIM_W);
  const refMix=MGMT_AUD_BASE+(1-MGMT_AUD_BASE)*MGMT_SPECTACLE_REF;
  return Math.round(MGMT_AUD_PER_DRAW*refAttraction*refMix);
}
/* ==== [FIN ANCRE] ==== */
