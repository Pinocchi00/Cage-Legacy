"use strict";
/* CAGE LEGACY — mgmt-carte.js
   ============================================================================
   MODE MANAGEMENT — la carte : la sous-carte de Leïla (proposition en bloc,
   échange, écrasement et son coût, mémoire des écrasements), la composition
   de la carte principale par le joueur (T2) et le classement par catégorie
   (dérivé, jamais stocké). Issu de mgmt-bureau.js, découpage de la dette
   CLAUDE.md §10 (ancres MGMT_LOT2_CARTE, MGMT_LOT2_COMPOSITION,
   MGMT_LOT2_CLASSEMENT) ; mgmt-bureau.js garde la pile et les décisions.
   Aucun accès DOM : le rendu vit dans mgmt-screens.js.

   Constante évaluée au chargement : MGMT_SLOPPY_GAP, littérale — aucune
   dépendance de chargement. Les fonctions dépendent au runtime de
   engine.js, mgmt-data.js, mgmt-bureau.js et mgmt-corps.js (mgmtAvailable).
   RNG : exclusivement la RNG à graine (pick/RI), jamais de tirage non seedé.
   ============================================================================ */

/* ==== [ANCRE: MGMT_LOT2_CARTE] — Lot 2 la sous-carte : carte en construction,
   proposition en bloc, échange, écrasement et son coût (addendum §12),
   mémoire des écrasements. Logique pure, aucun DOM. Même RNG seedée, mêmes
   conventions que le lot 1 (identifiants au compteur, tirages seedés).
   Le lot 1 (propositions simples, refus, ignore) est inchangé ci-dessous.
   Lot 2 T1 la carte principale (docs/LOT-2-CARTE-PRINCIPALE.md §T1) : la
   carte devient {sizeMain, sizePrelims, main, prelims} — la proposition en
   bloc de Leïla reste sa carte préliminaire (4 combats, décision du
   19/09 : le bloc ne couvre jamais la carte principale, dont la composition
   revient au joueur à la T2) ; chaque combat porte slot, valider place les
   combats dans leur emplacement sans jamais rien perdre.
   Lot 2 T3 Leïla et les préliminaires (docs/LOT-2-CARTE-PRINCIPALE.md §T3 ;
   LOT-3B §2, décision d'Anthony du 15/09/2026) : la proposition en bloc
   n'arrive qu'une fois la carte principale complète (cinq combats posés par
   le joueur, T2) et part après les autres affaires, jamais en tête —
   mgmtOfferBulk pousse, mgmtBookMain déclenche à la cinquième place ;
   mgmtPickBulkPair élargit ses candidats aux combattants disponibles hors
   carte principale (même catégorie, rangs proches, repos, priorité aux plus
   inactifs, pas de revanche immédiate). C1 : accepter une demande de Leïla
   booke vraiment (mgmtDecide → mgmtBookMain). ==== */

/* Écart de bilan qui fait un mauvais appariement, avec le cross-division :
   visible dans la proposition (catégorie et bilan lisibles), sans effet
   joué au lot 2 — ce qu'il avertit viendra plus tard. */
const MGMT_SLOPPY_GAP=8;

/** Combats posés sur la carte, carte principale d'abord (ordre de la
 *  soirée). Pur. @returns {Array} */
function mgmtCardFights(m){
  if(!m||!m.card) return [];
  return (Array.isArray(m.card.main)?m.card.main:[]).concat(Array.isArray(m.card.prelims)?m.card.prelims:[]);
}

/** Carte complète ? Les deux emplacements : la carte principale ET les
 *  préliminaires (docs/LOT-2-CARTE-PRINCIPALE.md §T1). */
function mgmtCardFull(m){
  return !!(m&&m.card&&Array.isArray(m.card.main)&&Array.isArray(m.card.prelims)
    &&Number.isSafeInteger(m.card.sizeMain)&&Number.isSafeInteger(m.card.sizePrelims)
    &&m.card.main.length>=m.card.sizeMain&&m.card.prelims.length>=m.card.sizePrelims);
}

/** Historique des écrasements : total et série en cours (cycles consécutifs).
 *  Trois écrasements de suite ne sont pas trois écrasements espacés (§5). */
function mgmtCrushStats(m){
  const s=(m&&m.leila&&Array.isArray(m.leila.crushes))?m.leila.crushes.slice().sort((x,y)=>x-y):[];
  let streak=0;
  for(let i=s.length-1;i>=0;i--){
    if(i===s.length-1||s[i]===s[i+1]-1) streak++;
    else break;
  }
  return {total:s.length,streak:s.length>0?streak:0};
}

/** Probabilité qu'un combat proposé soit bâclé : croît avec les écrasements
 *  (total + série), plafonnée. Zéro sans écrasement : Leïla soigneuse. */
function mgmtSloppyProb(total,streak){
  return Math.min(0.12*total+0.08*streak,0.65);
}

/** Probabilité qu'elle prévienne sur un mauvais appariement : s'éteint
 *  progressivement avec les écrasements, jamais annoncée. */
function mgmtWarnProb(total){
  return Math.max(0,1-0.35*total);
}

/** Écart de bilan entre deux combattants (combats totaux). */
function mgmtRecGap(A,B){ return Math.abs((A.W+A.L)-(B.W+B.L)); }

/**
 * Tire une paire pour la sous-carte : mode 'clean' (même catégorie,
 * rangs proches) ou 'sloppy' (cross-division, gros écart de rang ou de
 * bilan). Le mode vient du coût des écrasements ; à défaut de candidates
 * dans le mode, l'autre, puis abandon (filet : shortfall). La nature
 * bâclée ou non est celle de la paire retenue, pas l'intention — un repli
 * malchanceux reste signalable.
 * Lot 3a §6.5 : suspendus et retraités médicaux exclus, en mode strict
 * comme assoupli. Le mode assoupli (lot 3a §5) relâche les contraintes de
 * variété (prénoms déjà vus, paires déjà proposées, séries de catégories)
 * et le repos — jamais la sécurité (genre, homonymes, disponibilités,
 * combattants en carte, paires déjà en carte).
 * Lot 2 T3 (docs/LOT-2-CARTE-PRINCIPALE.md §T3 ; LOT-3B §2, décision
 * d'Anthony du 15/09/2026 — extension de la fonction, jamais une
 * concurrente). Parmi les combattants disponibles HORS CARTE PRINCIPALE
 * (mgmtEngaged — la carte principale est composée par le joueur, T2) :
 * - même catégorie, rangs proches : écart de rang borné par
 *   MGMT_RANK_GAP, lu sur mgmtDivisionRank (T1) — au-delà, la paire est
 *   bâclée, comme le cross-division et le gros écart de bilan ;
 * - repos : pas de combattant ayant combattu à la soirée précédente
 *   (lastCycle >= cycle - 1), sauf en mode assoupli ;
 * - pas de revanche immédiate d'un combat de la soirée précédente
 *   (m.lastEvent) ;
 * - priorité aux combattants inactifs depuis le plus longtemps : la paire
 *   retenue est prise parmi celles qui cumulent la plus longue inactivité
 *   (jamais combattu sous Split = le plus inactif) ; à égalité, le tirage
 *   seedé garde la variété.
 * @returns {{a,b,sloppy,warned,div}|null} */
function mgmtPickBulkPair(m,used,seen,lastDiv,run,stats,relaxed){
  const totals=stats||{total:0,streak:0};
  const wantSloppy=rnd()<mgmtSloppyProb(totals.total,totals.streak);
  const r=m.roster;
  /* Arbitrage lot 2 (revue) : les appariements restent toujours dans la même
     catégorie hommes/femmes — le dégradé joue sur la division et l'écart de
     bilan, jamais sur le genre. */
  const genderOf=o=>{ const d=divById(o.div); return d?d.gender:null; };
  /* Rangs (§T3) : mgmtDivisionRank (T1) appelé au plus une fois par
     combattant et par tirage — jamais par paire candidate. */
  const rankCache=new Map();
  const rankOf=f=>{ let v=rankCache.get(f.id); if(v===undefined){ v=mgmtDivisionRank(m,f); rankCache.set(f.id,v); } return v; };
  /* Repos (§T3) : a combattu à la soirée précédente. */
  const repos=f=>Number.isSafeInteger(f.lastCycle)&&f.lastCycle>=m.cycle-1;
  /* Inactivité (§T3) : cycles depuis le dernier combat ; jamais combattu
     sous Split = le plus inactif. */
  const inact=f=>m.cycle-(Number.isSafeInteger(f.lastCycle)?f.lastCycle:-1);
  /* Revanche immédiate (§T3) : les paires de la soirée précédente. */
  const rematch=new Set();
  if(m.lastEvent&&Array.isArray(m.lastEvent.fights)){
    for(const f of m.lastEvent.fights){
      if(f&&typeof f.a==='string'&&typeof f.b==='string') rematch.add([f.a,f.b].sort().join('|'));
    }
  }
  const collect=mode=>{
    const out=[];
    for(let i=0;i<r.length;i++){
      for(let j=i+1;j<r.length;j++){
      const A=r[i], B=r[j];
      if(A.first===B.first) continue;
      if(genderOf(A)!==genderOf(B)) continue;
      if(!mgmtAvailable(m,A)||!mgmtAvailable(m,B)) continue;
      /* §T3 : les prélims se construisent hors carte principale — un
         combattant déjà engagé (principale comme prélims) n'est jamais
         candidat. */
      if(mgmtEngaged(m,A)||mgmtEngaged(m,B)) continue;
      const key=[A.id,B.id].sort().join('|');
      if(seen.has(key)) continue;
      if(rematch.has(key)) continue;
      if(!relaxed){
        /* §T3 : repos sauf en mode assoupli. */
        if(repos(A)||repos(B)) continue;
        if(used.has(A.first)||used.has(B.first)) continue;
        const d0=A.div===B.div?A.div:A.div;
        if(d0===lastDiv&&run>=2) continue;
      }
        const d=A.div===B.div?A.div:A.div;
        const ra=rankOf(A), rb=rankOf(B);
        /* Rangs comparés dans la même catégorie seulement ; cross-division,
           la paire est bâclée sans comparaison de rang. */
        const rankGap=(A.div===B.div&&ra!==null&&rb!==null)?Math.abs(ra-rb):MGMT_RANK_GAP+1;
        const sloppy=(A.div!==B.div)||rankGap>MGMT_RANK_GAP||mgmtRecGap(A,B)>=MGMT_SLOPPY_GAP;
        if(mode==='clean'&&sloppy) continue;
        if(mode==='sloppy'&&!sloppy) continue;
        out.push({A,B,sloppy,div:d,inact:inact(A)+inact(B)});
      }
    }
    return out;
  };
  let cands=collect(wantSloppy?'sloppy':'clean');
  if(cands.length===0) cands=collect(wantSloppy?'clean':'sloppy');
  if(cands.length===0) return null;
  /* Priorité (§T3) : les combattants inactifs depuis le plus longtemps —
     la paire retenue est prise parmi celles qui cumulent la plus longue
     inactivité ; à égalité, le tirage seedé garde la variété. */
  let best=-1;
  for(const c of cands){ if(c.inact>best) best=c.inact; }
  const top=cands.filter(c=>c.inact===best);
  const c=pick(top);
  const warned=c.sloppy&&rnd()<mgmtWarnProb(totals.total);
  return {a:c.A,b:c.B,sloppy:c.sloppy,warned,div:c.div};
}

/**
 * Construit l'affaire de proposition en bloc : la carte préliminaire de
 * Leïla (docs/LOT-2-CARTE-PRINCIPALE.md §T1, décision du 19/09 — la
 * proposition en bloc ne couvre jamais la carte principale : sa composition
 * revient au joueur, T2). Lot 2 T3 (§T3 ; LOT-3B §2, décision du 15/09) :
 * elle n'arrive QU'UNE FOIS la carte principale complète — cinq combats
 * posés par le joueur. Elle propose les préliminaires manquants — au plus
 * MGMT_PRELIM_SIZE combats, chacun porté slot:'prelim' — ou null : carte
 * déjà complète, préliminaires complets, carte principale incomplète (le
 * joueur la compose — Leïla n'a rien à proposer), ou pot insuffisant pour
 * l'ensemble (filet : l'appelant signale shortfall — jamais une carte
 * incomplète).
 * Lot 3a §5 : relaxed=true assouplit la variété (prénoms, paires déjà
 * proposées, séries) et le repos pour le remplissage de fin de cycle —
 * jamais la carte (sanctuarisée) ni deux fois la même paire dans le bloc.
 * @returns {object|null} */
function mgmtNewBulkAffair(m,used,seen,relaxed){
  if(mgmtCardFull(m)) return null;
  if(!m||!m.card||!Array.isArray(m.card.main)||!Array.isArray(m.card.prelims)) return null;
  /* §T3 : la carte principale est complète — la proposition des
     préliminaires attend la composition du joueur. */
  if(!Number.isSafeInteger(m.card.sizeMain)||m.card.main.length<m.card.sizeMain) return null;
  const n=(Number.isSafeInteger(m.card.sizePrelims)?m.card.sizePrelims:MGMT_PRELIM_SIZE)-m.card.prelims.length;
  if(n<=0) return null;
  const stats=mgmtCrushStats(m);
  const fights=[];
  let lastDiv=null, run=0;
  /* §T3 : la proposition est un tout — Leïla propose les préliminaires
     MANQUANTS, jamais une carte partielle ; si un combat de la carte est
     introuvable, l'appelant signale le shortfall et on ne remplit rien
     (lot 3a §5). */
  for(let i=0;i<n;i++){
    const p=mgmtPickBulkPair(m,used,seen,lastDiv,run,stats,relaxed);
    if(!p) return null;
    used.add(p.a.first); used.add(p.b.first);
    seen.add([p.a.id,p.b.id].sort().join('|'));
    run=(p.div===lastDiv)?run+1:1; lastDiv=p.div;
    fights.push({a:p.a.id,b:p.b.id,slot:'prelim',sloppy:p.sloppy,warned:p.warned});
  }
  const aff={
    id:mgmtNextId(m),kind:'leila_bulk',exchange:'leila_bulk',
    speaker:'leila',a:fights[0].a,b:fights[0].b,fights,marked:null,
    status:'open',decision:null,
  };
  aff.title=`Leïla propose — carte de ${fights.length} combats`;
  return aff;
}

/**
 * Échange le combat marqué d'une proposition en bloc contre une paire
 * fraîche. Pas un écrasement : aucun coût, aucune trace dans l'historique
 * des écrasements. Leïla réagit dans une affaire à part (motif lot 1).
 * @returns {boolean} */
function mgmtSwapFight(m,affairId){
  if(!m||!Array.isArray(m.pile)) return false;
  const aff=m.pile.find(a=>a.id===affairId);
  if(!aff||aff.status!=='open'||aff.kind!=='leila_bulk'||!Array.isArray(aff.fights)) return false;
  const idx=Number.isSafeInteger(aff.marked)?aff.marked:0;
  if(idx<0||idx>=aff.fights.length) return false;
  const used=new Set(), seen=new Set();
  for(const a of m.pile){
    if(a.kind!=='leila_propose'||a.status!=='open') continue;
    const fa=mgmtFighterById(m,a.a), fb=mgmtFighterById(m,a.b);
    if(fa) used.add(fa.first);
    if(fb) used.add(fb.first);
    seen.add([a.a,a.b].sort().join('|'));
  }
  aff.fights.forEach((f,i)=>{ if(i!==idx){ const fa=mgmtFighterById(m,f.a), fb=mgmtFighterById(m,f.b); if(fa) used.add(fa.first); if(fb) used.add(fb.first); seen.add([f.a,f.b].sort().join('|')); } });
  const old=aff.fights[idx];
  seen.add([old.a,old.b].sort().join('|'));
  const stats=mgmtCrushStats(m);
  const p=mgmtPickBulkPair(m,used,seen,null,0,stats);
  if(!p) return false;
  aff.fights[idx]={a:p.a.id,b:p.b.id,slot:'prelim',sloppy:p.sloppy,warned:p.warned};
  /* R3 : la réaction concerne les combattants retirés (old), ceux que le
     texte dit devoir replacer — jamais les remplaçants. Le fait garde les
     deux paires explicitement. */
  mgmtAddFact(m,{c:m.cycle,k:'swapped',a:old.a,b:old.b,na:p.a.id,nb:p.b.id});
  const react={
    id:mgmtNextId(m),kind:'leila_react_swap',exchange:'leila_react_swap',
    speaker:'leila',a:old.a,b:old.b,
    status:'open',decision:null,after:aff.id,
  };
  react.title=mgmtAffairTitle(m,react);
  m.pile.push(react);
  return true;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: MGMT_LOT2_COMPOSITION] — Lot 2 T2 le joueur compose sa carte
   principale (docs/LOT-2-CARTE-PRINCIPALE.md §T2, geste LOT-3B §2) : logique
   pure de composition — aucun DOM (le rendu vit dans mgmt-screens.js).
   Le combat posé entre dans le premier emplacement libre de la carte
   principale (slot:'main') ; il peut être retiré. Non sélectionnables :
   suspendus, tout combattant déjà engagé sur la carte (principale comme
   préliminaires) ; retraités médicaux déjà hors de la liste (mgmtAvailable).
   Les adversaires restent dans la catégorie du premier choix — le geste de
   référence est maquettes/04-booker-un-combat.html (adversaires de la
   catégorie). Tout booking compte comme interaction (addendum 1 §5 : le
   booker compte) ; un retrait n'efface rien. ==== */

/** Combattant déjà engagé sur la carte en cours : carte principale comme
 *  préliminaires (§T2). Pur. @returns {boolean} */
function mgmtEngaged(m,f){
  if(!m||!m.card||!f||!f.id) return false;
  const on=(list)=>Array.isArray(list)&&list.some(x=>x&&(x.a===f.id||x.b===f.id));
  return on(m.card.main)||on(m.card.prelims);
}

/**
 * Pose un combat du joueur en carte principale : premier emplacement libre
 * (append — les places se remplissent dans l'ordre), slot:'main', cycle
 * courant. Garde complète : les deux lignes existent et sont distinctes,
 * même catégorie (le geste de référence est maquettes/04-booker-un-combat.
 * html : adversaires de la catégorie), disponibles (mgmtAvailable : ni
 * suspendus, ni retraités médicaux), pas déjà engagés sur la carte,
 * capacité respectée. Un booking compte comme interaction (mgmtPromote,
 * addendum 1 §5). Aucun fait mémorisé : composer est le comportement
 * normal (lot 2c). Ne lance jamais la soirée : la carte complète ne fait
 * rien d'office (lot 3a §5).
 * @returns {object|null} le combat posé, ou null si refusé.
 */
function mgmtBookMain(m,aid,bid){
  if(!m||!m.card||!Array.isArray(m.card.main)) return null;
  if(!Number.isSafeInteger(m.card.sizeMain)) return null;
  if(m.card.main.length>=m.card.sizeMain) return null;
  if(!mgmtValidId(aid)||!mgmtValidId(bid)||aid===bid) return null;
  const fa=mgmtFighterById(m,aid), fb=mgmtFighterById(m,bid);
  if(!fa||!fb||fa===fb) return null;
  if(fa.div!==fb.div) return null;
  if(!mgmtAvailable(m,fa)||!mgmtAvailable(m,fb)) return null;
  if(mgmtEngaged(m,fa)||mgmtEngaged(m,fb)) return null;
  const fight={a:fa.id,b:fb.id,cycle:m.cycle,slot:'main'};
  m.card.main.push(fight);
  mgmtPromote(m,fa); mgmtPromote(m,fb);
  /* §T3 : une fois la cinquième place posée, Leïla propose aussitôt les
     préliminaires — en fin de pile, jamais avant la carte principale
     complète (mgmtOfferBulk garde tout elle-même : no-op tant que la carte
     principale est incomplète). */
  mgmtOfferBulk(m,false);
  return fight;
}

/** Retire un combat posé de la carte principale (index dans m.card.main) :
 *  l'emplacement est libéré, les deux combattants redeviennent
 *  sélectionnables. Pur côté lignes (aucune ligne écrite). @returns {boolean} */
function mgmtRemoveMain(m,idx){
  if(!m||!m.card||!Array.isArray(m.card.main)) return false;
  if(!Number.isSafeInteger(idx)||idx<0||idx>=m.card.main.length) return false;
  m.card.main.splice(idx,1);
  return true;
}

/** Sélectionnable dans la liste de composition (§T2) : disponible (ni
 *  suspendu, ni retraité médical), pas déjà engagé sur la carte ; avec un
 *  premier choix posé, dans la même catégorie que lui — sauf le choisi
 *  lui-même, re-cliquer doit pouvoir annuler. Pur. @returns {boolean} */
function mgmtSelectable(m,f,pick){
  if(!m||!f) return false;
  if(!mgmtAvailable(m,f)) return false;
  if(mgmtEngaged(m,f)) return false;
  if(pick){
    const a=mgmtFighterById(m,pick);
    if(!a) return false;
    if(f.id===a.id) return true;
    if(a.div!==f.div) return false;
  }
  return true;
}

/**
 * Les lignes de la liste de composition : le roster sans les retraités
 * médicaux (§T2 : absents), groupé par catégorie dans l'ordre canonique
 * (DIVISIONS), rangs dérivés (mgmtDivisionRank, T1) au sein de chaque
 * catégorie. Pur : ne trie que des copies, n'écrit jamais sur une ligne,
 * ne consomme pas rnd().
 * @returns {Array} */
function mgmtCartRows(m){
  if(!m||!Array.isArray(m.roster)) return [];
  const rows=m.roster.filter(o=>o&&o.retired!=='medical');
  const order=allDivisions().map(d=>d.id);
  const dx=o=>{ const i=order.indexOf(o.div); return i<0?order.length:i; };
  rows.sort((x,y)=>{
    const a=dx(x), b=dx(y);
    if(a!==b) return a-b;
    const rx=mgmtDivisionRank(m,x)||0, ry=mgmtDivisionRank(m,y)||0;
    if(rx!==ry) return rx-ry;
    return x.id<y.id?-1:1;
  });
  return rows;
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: MGMT_LOT2_CLASSEMENT] — Lot 2 T1 la carte principale
   (docs/LOT-2-CARTE-PRINCIPALE.md §T1) : classement par catégorie, dérivé
   de l'état courant, jamais stocké sur la ligne (règle du bureau, CDC §3).
   Ordre : victoires − défaites, puis victoires, puis dernier combat sous
   Split (le plus actif devant). Les suspendus gardent leur rang, les
   retraités médicaux sortent du classement.
   Lot 2B T1 bis : la même loi dessert deux portées — organisation (roster
   seul, portée historique par défaut) et monde (roster + extérieur). Le
   bilan et la récence extérieurs sont dérivés à la lecture, jamais écrits
   sur leur ligne. ==== */

/** L'unique loi de classement : écart W-L, victoires, récence. */
function mgmtRankingCompare(x,y){
  const xd=(Number.isSafeInteger(x.W)?x.W:0)-(Number.isSafeInteger(x.L)?x.L:0);
  const yd=(Number.isSafeInteger(y.W)?y.W:0)-(Number.isSafeInteger(y.L)?y.L:0);
  if(xd!==yd) return yd-xd;
  const xw=Number.isSafeInteger(x.W)?x.W:0, yw=Number.isSafeInteger(y.W)?y.W:0;
  if(xw!==yw) return yw-xw;
  const xc=Number.isSafeInteger(x.lastCycle)?x.lastCycle:-1;
  const yc=Number.isSafeInteger(y.lastCycle)?y.lastCycle:-1;
  if(xc!==yc) return yc-xc;
  /* Une égalité parfaite doit garder des rangs positionnels stables quand
     une ligne passe de l'extérieur au roster. L'id ne départage jamais deux
     bilans ou récences différents. */
  const xi=String(x.id), yi=String(y.id);
  return xi<yi?-1:(xi>yi?1:0);
}

/** Population classée d'une catégorie. La portée `organization` ne lit que
 *  Split ; `world` y ajoute des vues éphémères des lignes extérieures.
 *  @returns {Array} */
function mgmtDivisionRanking(m,divId,scope){
  if(!m||!Array.isArray(m.roster)||!divById(divId)) return [];
  if(scope!=='organization'&&scope!=='world') return [];
  const cands=m.roster.filter(o=>o&&o.div===divId&&o.retired!=='medical');
  if(scope==='world'&&Array.isArray(m.exterieur)){
    const rosterIds=new Set(cands.map(o=>o.id));
    for(const line of m.exterieur){
      if(!line||line.div!==divId||rosterIds.has(line.id)) continue;
      const trace=mgmtExteriorTrace(line,m.cycle);
      if(!trace) continue;
      const last=trace.orgs.length>0?trace.orgs[trace.orgs.length-1].to:null;
      cands.push({id:line.id,div:line.div,W:trace.pro.W,L:trace.pro.L,
        lastCycle:Number.isSafeInteger(last)?last:-1});
    }
  }
  cands.sort(mgmtRankingCompare);
  return cands;
}

/** Rang d'une ligne dans sa catégorie (1..n). Pur : ne trie que des copies,
 *  n'écrit jamais sur la ligne, ne consomme pas rnd() (comparaison de
 *  champs entiers seulement). Retraité médical : hors classement (null).
 *  Portée omise : classement de l'organisation, comportement historique.
 *  Portée `world` : classement mondial, Split et extérieur ensemble.
 *  @returns {number|null} */
function mgmtDivisionRank(m,f,scope){
  if(!m||!f||!Array.isArray(m.roster)) return null;
  if(f.retired==='medical') return null;
  const resolved=scope===undefined?'organization':scope;
  const cands=mgmtDivisionRanking(m,f.div,resolved);
  const i=cands.findIndex(o=>o.id===f.id);
  return i>=0?i+1:null;
}
/* ==== [FIN ANCRE] ==== */

/**
 * Pousse la proposition en bloc de Leïla en fin de pile quand la carte
 * principale est complète et que les préliminaires manquent (lot 2 T3,
 * docs/LOT-2-CARTE-PRINCIPALE.md §T3 ; LOT-3B §2, décision du 15/09 :
 * le joueur compose d'abord la main card, Leïla propose ensuite).
 * Mêmes interdits que partout (indisponibles exclus), coût de l'écrasement
 * conservé (proposition plus bâclée). Si les contraintes de variété
 * coincent, on les assouplit (prénoms déjà vus, paires déjà proposées,
 * repos) — jamais un combat d'office : impossible même assoupli, on
 * signale (shortfall) et on ne remplit rien.
 * Carte principale incomplète : Leïla n'a rien à proposer (la proposition
 * des préliminaires attend la composition du joueur, §T3) — pas de
 * shortfall : ce n'est pas le pot qui manque. Le calendrier attend le
 * joueur (T5, décision 4 du 20/09 — mgmtClosePile rend 'compose') ; seul
 * un pot épuisé avance le cycle à la main (lot 1g).
 * selectWhenIdle : la proposition vole le focus d'office (pile vidée,
 * appel du §5) ; à faux, elle ne déloge pas une affaire déjà ouverte — le
 * booking de la cinquième place arrive parfois au milieu de la pile.
 * @returns {boolean} vrai si une proposition est arrivée en fin de pile. */
function mgmtOfferBulk(m,selectWhenIdle){
  if(!m||!Array.isArray(m.pile)) return false;
  if(!m.card||!Array.isArray(m.card.main)||!Array.isArray(m.card.prelims)) return false;
  /* §T3 : la carte principale est complète, les préliminaires manquent. */
  if(!Number.isSafeInteger(m.card.sizeMain)||m.card.main.length<m.card.sizeMain) return false;
  if(Number.isSafeInteger(m.card.sizePrelims)&&m.card.prelims.length>=m.card.sizePrelims) return false;
  /* Pas de doublon : une proposition déjà ouverte suffit. */
  if(m.pile.some(a=>a.kind==='leila_bulk'&&a.status==='open')) return false;
  const used=new Set(), seen=new Set();
  for(const a of m.pile){
    if(a.kind!=='leila_propose'&&a.kind!=='leila_bulk') continue;
    const list=a.kind==='leila_bulk'&&Array.isArray(a.fights)?a.fights:[a];
    for(const x of list){
      const fa=mgmtFighterById(m,x.a), fb=mgmtFighterById(m,x.b);
      if(fa) used.add(fa.first);
      if(fb) used.add(fb.first);
      seen.add([x.a,x.b].sort().join('|'));
    }
  }
  const cardPairs=new Set();
  for(const x of mgmtCardFights(m)){ seen.add([x.a,x.b].sort().join('|')); cardPairs.add([x.a,x.b].sort().join('|')); }
  const bulk=mgmtNewBulkAffair(m,used,seen,false)||mgmtNewBulkAffair(m,new Set(),cardPairs,true);
  if(!bulk){ m.shortfall=true; return false; }
  m.pile.push(bulk);
  /* Le focus suit la proposition d'office quand rien n'est ouvert — jamais
     au détriment d'une affaire que le joueur regarde. */
  if(selectWhenIdle||!m.pile.some(a=>a.id===m.open&&a.status==='open')) m.open=bulk.id;
  return true;
}

/** Fin de pile (§5) : la reproposition de Leïla quand le cycle ne se ferme
 *  pas — la proposition des préliminaires attend la carte principale
 *  complète (§T3). @returns {boolean} */
function mgmtRefillBulk(m){
  return mgmtOfferBulk(m,true);
}

/** Une place de carte principale est-elle encore composable ? (T5) : un
 *  emplacement libre et une paire posable — deux combattants disponibles
 *  (mgmtAvailable : ni suspendus, ni retraités médicaux), pas déjà engagés
 *  sur la carte (mgmtEngaged), de la même catégorie (mgmtBookMain refuse le
 *  croisement, §T2). C'est exactement ce que le geste du joueur peut encore
 *  poser. Pur. @returns {boolean} */
function mgmtMainPosable(m){
  if(!m||!m.card||!Array.isArray(m.card.main)||!Number.isSafeInteger(m.card.sizeMain)) return false;
  if(m.card.main.length>=m.card.sizeMain) return false;
  if(!Array.isArray(m.roster)) return false;
  const parDiv=new Map();
  for(const o of m.roster){
    if(!mgmtAvailable(m,o)||mgmtEngaged(m,o)) continue;
    const n=(parDiv.get(o.div)||0)+1;
    if(n>=2) return true;
    parDiv.set(o.div,n);
  }
  return false;
}

/** Fin de pile (§5) : plus aucune affaire ouverte. Lot 2 T5 (§4 bis,
 *  décision 4 d'Anthony du 20/09/2026 : le calendrier attend le joueur) —
 *  les quatre issues d'une pile vidée, chacune sa condition :
 *  - 'event'   : carte complète (principale ET préliminaires) — la soirée.
 *  - 'compose' : carte principale incomplète et encore composable — état
 *                normal, le joueur a la main, le calendrier attend (avant
 *                la T5, ce cas renvoyait 'stuck' et fermait le cycle).
 *  - 'refill'  : carte principale complète, préliminaires manquants — Leïla
 *                propose à nouveau (la proposition est poussée en fin de
 *                pile, effet conservé du §5).
 *  - 'stuck'   : le pot de combattants est épuisé — carte principale
 *                complète que même assoupli Leïla ne peut plus compléter,
 *                ou carte principale incomplète sans aucune paire encore
 *                composable : seul cas qui avance le cycle (lot 1g, aucun
 *                blocage). Pile encore ouverte : 'none'.
 *  @returns {string} 'none'|'event'|'compose'|'refill'|'stuck'. */
function mgmtClosePile(m){
  if(!m||mgmtOpenCount(m)>0) return 'none';
  if(mgmtCardFull(m)) return 'event';
  if(m.card&&Array.isArray(m.card.main)&&Number.isSafeInteger(m.card.sizeMain)
    &&m.card.main.length<m.card.sizeMain){
    return mgmtMainPosable(m)?'compose':'stuck';
  }
  return mgmtRefillBulk(m)?'refill':'stuck';
}
