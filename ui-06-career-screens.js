"use strict";
/* CAGE LEGACY — js/ui-06-career-screens.js
   ============================================================================
   Fichier 6/8 issu du découpage de l'ancien ui.js monolithique (~400 Ko).
   Écrans principaux de la carrière : titre, création de personnage, vestiaire, sélection d'adversaire, plan de combat, fiche de résultat, classement.

   IMPORTANT : ce découpage préserve l'ORDRE EXACT du code d'origine — aucune
   fonction n'a été déplacée ou réordonnée, seules des frontières de fichier
   ont été insérées à des points sûrs (toujours juste avant une déclaration de
   premier niveau, jamais au milieu d'une fonction ou d'un objet). Tous ces
   fichiers partagent la même portée globale que l'ancien ui.js (variables et
   fonctions visibles d'un fichier à l'autre, comme avant), il faut donc les
   charger dans l'ordre indiqué dans index.html : 01, 02, 03... jusqu'à 08.
   ============================================================================ */

/* ==== [ANCRE: PROCHAIN_OBJECTIF] — rendu du fil conducteur calculé dans
   state.js. Affiché au menu du Gauntlet uniquement : la refonte de l'accueil
   n'a pas convenu et celui-ci est revenu à sa forme d'origine, où cet encart
   n'a plus sa place. ==== */
function nextObjectiveBlock(){
  const o=nextObjective(); if(!o) return '';
  return `<div class="card glass mb" style="border-left:3px solid var(--gold);background:linear-gradient(135deg,color-mix(in srgb, var(--gold) 12%, var(--panel2)) 0%,var(--panel2) 70%);padding:14px">
    <div class="eyebrow mb" style="color:var(--gold)">🎯 ${o.eyebrow}</div>
    <b style="font-size:15px">${o.titre}</b>
    <div class="muted small mt">${o.detail}</div>
    <button class="btn ghost mt" style="border-color:var(--gold);color:var(--gold);padding:8px 12px;width:auto;font-size:13px" onclick="${o.cta.onclick}">${o.cta.label}</button>
  </div>`;
}
/* ==== [ANCRE: TITRE_SANS_NOTIFICATIONS] — accueil d'origine restauré tel
   quel (la refonte par durée/hiérarchie n'a pas convenu). Seul correctif
   conservé : les notifications de partie sont consommées ici SANS être
   affichées — elles concernent l'écran d'où vient l'action, pas l'accueil —
   et seule l'erreur de lien de légende partagé, posée au démarrage par
   main.js dans G.bootMsg, reste visible. ==== */
function scr_title(){
  return `<div class="scr" style="display:flex;flex-direction:column;justify-content:center;min-height:80vh">
   <div style="text-align:center;margin-bottom:48px">
     <h1 class="disp" style="font-size:64px;line-height:.9;margin:0;letter-spacing:-.05em;color:var(--text)">CAGE<br>LEGACY</h1>
     <div class="mono muted" style="margin-top:16px;font-size:14px;letter-spacing:.2em;border-top:2px solid var(--line);border-bottom:2px solid var(--line);padding:8px 0">SIMULATEUR DE MANAGEMENT & ARCHIVES</div>
   </div>
   ${(()=>{ G.lastMsg=null;
      if(!G.bootMsg) return '';
      const m=G.bootMsg; G.bootMsg=null;
      return `<div class="card glass" style="border-left:3px solid var(--loss);background:var(--panel2);padding:12px 14px;margin-bottom:16px"><span class="small">${esc(m)}</span></div>`;
    })()}
   <button class="btn primary" style="font-size:20px;padding:24px" onclick="CL.startFaith()">1. MMA FAITH
     <span class="mono" style="display:block;font-size:12px;margin-top:8px;opacity:.8">Carrière longue — Gestion de vie (Destiny-like)</span></button>
   ${hasSave('faith')?`<button class="btn gold" style="font-size:16px;padding:14px;margin-top:8px" onclick="CL.cont()">REPRENDRE LA PARTIE MMA FAITH EN COURS</button>`:''}
   <button class="btn" style="font-size:20px;padding:24px;margin-top:16px;border-color:var(--text)" onclick="CL.go('intro')">2. CARRIÈRE COMPLÈTE
     <span class="mono muted" style="display:block;font-size:12px;margin-top:8px">Gérez l’argent, les camps et l’héritage</span></button>
   <button class="btn" style="font-size:20px;padding:24px;margin-top:16px;border-color:var(--sage);color:var(--sage)" onclick="CL.go('gauntlet_menu')">3. GAUNTLET
     <span class="mono muted" style="display:block;font-size:12px;margin-top:8px">Tournois et défis d’ascension arcade</span></button>
   <div class="hr" style="margin:24px 0"></div>
   <button class="btn ghost" style="font-size:16px;padding:16px;border:1px dashed var(--gold);background:var(--panel2);color:var(--gold)" onclick="CL.go('legends')">BOUTIQUE : SALLE DES LÉGENDES
     <span class="mono muted" style="display:block;font-size:11px;margin-top:6px">Dépensez vos points de salle pour débloquer du contenu</span></button>
   <button class="btn ghost" style="font-size:16px;padding:16px;margin-top:8px" onclick="CL.go('ach')">VOIR LES SUCCÈS
     <span class="mono muted" style="display:block;font-size:11px;margin-top:6px">Suivez votre progression sur tous les succès à débloquer</span></button>
   </div>`;
}
/* ==== [ANCRE: SOUS_MENU_GAUNTLET] — regroupe les 3 formats du Gauntlet
   (Bracket 64, Classement des 100, Boss Run), auparavant tous au même niveau
   que les modes principaux sur l'écran titre. ==== */
/* ==== [ANCRE: REJOUABILITE_RECORD_GAUNTLET] — meta.gauntletBest (state.js),
   affiché sous chaque bouton de format pour donner un objectif de retour au
   menu, avant même de lancer une run. ==== */
/* ==== [ANCRE: GAUNTLET_ASCENSION] — le record affiché est celui du palier
   SÉLECTIONNÉ (G._pendingAsc, borné au palier débloqué pour ce format), pas
   un record global qui mélangerait des difficultés incomparables. ==== */
function gauntletSelectedAsc(mode){
  const meta=loadMetaStats();
  return clamp(parseInt(G._pendingAsc,10)||0,0,gauntletAscLevel(meta,mode));
}
function gauntletMenuBestTag(mode){
  const meta=loadMetaStats();
  const asc=gauntletSelectedAsc(mode);
  const best=gauntletBestGet(meta,mode,asc);
  if(best===undefined) return `<span class="mono" style="display:block;font-size:10px;margin-top:4px;opacity:.6">Ascension ${asc} — aucun record</span>`;
  const label=mode==='boss_run'?`Record : ${best}/5`:mode==='ladder_100'?`Record : rang #${best}`:(best>=7?'Record : Tournoi remporté':`Record : palier ${best}`);
  return `<span class="mono" style="display:block;font-size:10px;margin-top:4px;opacity:.8">Ascension ${asc} · ${label}</span>`;
}
/* ==== [ANCRE: GAUNTLET_ASCENSION] — sélecteur de palier. Rendu uniquement si
   au moins un palier est débloqué sur ce format : un joueur qui n'a jamais
   gagné le format ne voit aucune option supplémentaire, l'écran reste
   identique à avant pour lui. ==== */
function gauntletAscPicker(mode){
  const meta=loadMetaStats();
  const max=gauntletAscLevel(meta,mode);
  if(max<=0) return '';
  const cur=gauntletSelectedAsc(mode);
  let btns='';
  for(let i=0;i<=max;i++){
    btns+=`<span onclick="CL.setGauntletAsc('${mode}',${i})" style="display:inline-block;cursor:pointer;border:1px solid ${i===cur?'var(--gold)':'var(--line)'};color:${i===cur?'var(--gold)':'var(--muted)'};padding:3px 10px;margin:0 4px 4px 0;border-radius:2px;font-size:11px" class="mono">A${i}</span>`;
  }
  return `<div class="mono small" style="margin-top:6px;text-align:left">${btns}<span class="muted" style="font-size:10px;display:block;margin-top:2px">Ascension : adversaires +${3*cur} niveau(x), gains ×${gauntletAscPayoutMod(cur)}</span>
   <span onclick="CL.viewAscensionTower('${mode}')" style="display:inline-block;cursor:pointer;margin-top:4px;color:var(--gold);text-decoration:underline dotted;font-size:10px">🗼 Voir la Tour d\u2019Ascension</span></div>`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: TOUR_ASCENSION_VISUELLE] — ajout #6 (24 ajouts, 12/08/2026) :
   écran de progression dédié, 5 paliers empilés visuellement du bas (palier
   0, base) vers le haut (palier 5, sommet). Réutilise gauntletAscLevel/
   gauntletBestGet/gauntletAscPayoutMod déjà existants — aucune nouvelle
   donnée de progression, uniquement une nouvelle façon de la montrer.
   ⚠️ Scope assumé : la spec demande une "silhouette joueur statique
   réutilisée du canvas de l'arène" — la fonction de rendu du combattant
   dans ARENA (drawArena, ui-08) est étroitement couplée à l'état d'un combat
   EN COURS (positions, hit-stop, caméra...), l'extraire proprement pour un
   usage statique hors combat dépasse une passe sûre. Remplacé par une
   silhouette SVG autonome, simple et thématiquement cohérente, plutôt que
   de risquer de casser le rendu de combat en tirant dessus depuis un écran
   qui n'a rien à voir. ==== */
/** Une carte de palier de la Tour. Extraite de scr_ascension_tower pour
 * garder les deux fonctions courtes et lisibles.
 * @param {number} i palier @param {object} ctx {mode,unlocked,meta}
 * @returns {string} HTML de la carte */
function ascensionTierCard(i,ctx){
  const {mode,unlocked,meta}=ctx;
  const isUnlocked=i<=unlocked, isCurrent=(i===unlocked);
  const best=gauntletBestGet(meta,mode,i);
  const bestLabel=best===undefined?'Aucun record'
    :(mode==='boss_run'?`Meilleur : ${best} boss sur 5`
    :mode==='ladder_100'?`Meilleur : rang #${best}`
    :(best>=7?'Tournoi remporté':`Meilleur : ${['','32es','16es','8es','quarts','demies','finale'][best]||('palier '+best)}`));
  /* Descriptions en clair : "+15 niveau(x) · Gains ×2.75 · un mutateur
     aléatoire" supposait de connaître le mot « mutateur » et de deviner ce
     que multiplient les gains. Une ligne par effet, en français simple. */
  const effets=i===0
    ? `<div class="muted small mt">Difficulté normale, gains normaux. C\u2019est le palier de départ.</div>`
    : `<div class="muted small mt">Adversaires plus forts : +${3*i} niveaux.</div>
       <div class="muted small">Points gagnés multipliés par ${gauntletAscPayoutMod(i)}.</div>
       <div class="muted small">Une règle spéciale, tirée au hasard au début de chaque run.</div>`;
  const etat=isCurrent?'<span class="mono small" style="color:var(--sage)">★ PALIER ACTUEL</span>'
    :!isUnlocked?'<span class="mono small muted">🔒 Verrouillé</span>'
    :'<span class="mono small muted">✓ Franchi</span>';
  const pied=isUnlocked
    ? `<div class="mono small mt" style="color:var(--gold)">${bestLabel}</div>`
    : `<div class="mono small mt">Pour l\u2019ouvrir : ${gauntletAscUnlockGoal(mode)} au palier ${i-1}.</div>`;
  return `<div class="glass" style="position:relative;background:${isUnlocked?'var(--panel2)':'var(--panel)'};border:1px solid ${isCurrent?'var(--gold)':'var(--line)'};border-left:4px solid ${isUnlocked?'var(--gold)':'var(--line)'};padding:12px;margin-bottom:6px;opacity:${isUnlocked?1:0.5}">
     <div style="display:flex;justify-content:space-between;align-items:center">
       <b style="font-size:15px;color:${isUnlocked?'var(--gold)':'var(--muted)'}">${i===0?'Palier 0 — Base':`Ascension ${i}`}</b>
       ${etat}
     </div>${effets}${pied}
   </div>`;
}
/* ==== [ANCRE: TOUR_ASCENSION_LISIBLE] — items demandés : (1) la silhouette
   en bâton en tête d'écran est retirée ; (2) les paliers étaient listés du
   plus haut au plus bas, donc l'écran s'ouvrait sur cinq cartes
   VERROUILLÉES et le seul palier jouable — celui du joueur — se retrouvait
   tout en bas, hors écran. Ordre inversé : on lit la tour du bas vers le
   haut, comme on la gravit, le palier actuel est visible d'emblée ; (3) les
   descriptions passent du jargon ("un mutateur aléatoire par run") à une
   ligne par effet en français simple, et chaque palier verrouillé affiche
   la performance exacte qui l'ouvre (cf. state.js, seuils mesurés). ==== */
function scr_ascension_tower(){
  const meta=loadMetaStats();
  const modeLabel={bracket64:'Bracket 64',ladder_100:'Ladder 100',boss_run:'Boss Run'};
  const modeAide={bracket64:'Un tournoi à 64 combattants : six victoires d\u2019affilée pour le remporter.',
    ladder_100:'Un classement de 100 combattants : tu pars 100e et tu défies plus fort que toi pour remonter.',
    boss_run:'Cinq adversaires d\u2019élite à enchaîner, sans reprendre son souffle.'};
  const mode=G._towerMode||'bracket64';
  const unlocked=gauntletAscLevel(meta,mode);
  const modeTabs=Object.keys(modeLabel).map(m=>`<span class="pill ${mode===m?'on':''}" onclick="CL.setTowerMode('${m}')">${modeLabel[m]}</span>`).join('');
  const ctx={mode,unlocked,meta};
  const tiers=[];
  for(let i=0;i<=GAUNTLET_ASC_MAX;i++) tiers.push(ascensionTierCard(i,ctx));
  return `<div class="scr"><div class="bar"><span class="eyebrow">🗼 Tour d\u2019Ascension — ${modeLabel[mode]}</span><span class="eyebrow x" onclick="CL.go('gauntlet_menu')">✕</span></div>
   <p class="lede small mt" style="text-align:center">Chaque palier franchi ouvre le suivant : les adversaires deviennent plus forts, mais rapportent plus.</p>
   <div class="pills mb" style="justify-content:center">${modeTabs}</div>
   <div class="card mb" style="background:var(--panel2);padding:10px 12px"><span class="muted small">${modeAide[mode]}</span></div>
   ${tiers.join('')}
   <button class="btn ghost mt" onclick="CL.go('gauntlet_menu')">← Retour au Gauntlet</button>
  </div>`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [FIN ANCRE] ==== */
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: GAUNTLET_CAPSTONE_NEMESIS] — n'apparaît qu'une fois 5 rivaux
   historiques battus (meta.gauntletRivalsDefeated, jamais purgé, alimenté
   par claimGauntletBounty() en ui-03). Condition indépendante de
   checkLegendUnlock('mode_boss') : les deux se cumulent naturellement
   puisqu'il faut déjà avoir débloqué et joué le Boss Run normal pour
   accumuler 5 rivaux vaincus dedans, mais rien ne l'impose techniquement. ==== */
function gauntletCapstoneEntry(){
  const meta=loadMetaStats();
  const n=(meta.gauntletRivalsDefeated||[]).length;
  if(n<5) return '';
  return `<button class="btn ghost" style="font-size:16px;padding:16px;margin-top:12px;border-color:var(--blood);color:var(--blood)" onclick="CL.startBossRunCapstone()">BOSS RUN — LES ANCIENS BOURREAUX
     <span class="mono muted" style="display:block;font-size:11px;margin-top:6px">Vos 5 pires némésis historiques, régénérées pour la revanche finale</span></button>`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: GAUNTLET_RECORDS_ARCHETYPE] — écran dédié, sur le modèle
   visuel du Panthéon carrière (scr_hof, eyebrow+bar+liste), mais SANS
   persistance de combattant individuel : uniquement les scores lus dans
   meta.gauntletBestByArchetype (state.js), cohérent avec le principe déjà
   documenté ailleurs que les combattants arcade sont jetables et non
   persistés. injectExtendedArchetypes() garantit que les archétypes
   légendes/achetés débloqués apparaissent dans la grille, pas seulement les
   23 de base. ==== */
function scr_archetype_pantheon(){
  injectExtendedArchetypes();
  const meta=loadMetaStats();
  const modeLabel={bracket64:'Bracket 64',ladder_100:'Ladder 100',boss_run:'Boss Run'};
  const mode=G._archPantheonMode||'bracket64';
  const maxAsc=gauntletAscLevel(meta,mode);
  const asc=clamp(parseInt(G._archPantheonAsc,10)||0,0,maxAsc);
  const rows=ARCADE_ARCHETYPES.map(a=>{
    const val=gauntletBestByArchetypeGet(meta,mode,asc,a.nick);
    const label=val===undefined?'—':(mode==='boss_run'?`${val}/5`:mode==='ladder_100'?`#${val}`:(val>=7?'Tournoi remporté':`Palier ${val}`));
    return `<div class="mono small" style="display:flex;justify-content:space-between;padding:8px 10px;border-bottom:1px solid var(--line)">
      <span>${a.flag||''} ${esc(a.nick)}</span>
      <span style="color:${val===undefined?'var(--muted)':'var(--gold)'};font-weight:${val===undefined?'normal':'bold'}">${label}</span>
    </div>`;
  }).join('');
  const modeTabs=Object.keys(modeLabel).map(m=>`<span class="pill ${mode===m?'on':''}" onclick="CL.setArchPantheonMode('${m}')">${modeLabel[m]}</span>`).join('');
  let ascTabs='';
  if(maxAsc>0){
    let btns='';
    for(let i=0;i<=maxAsc;i++) btns+=`<span onclick="CL.setArchPantheonAsc(${i})" style="display:inline-block;cursor:pointer;border:1px solid ${i===asc?'var(--gold)':'var(--line)'};color:${i===asc?'var(--gold)':'var(--muted)'};padding:3px 10px;margin:0 4px 4px 0;border-radius:2px;font-size:11px" class="mono">A${i}</span>`;
    ascTabs=`<div style="margin:8px 0">${btns}</div>`;
  }
  return `<div class="scr"><div class="bar"><span class="eyebrow">Panthéon des archétypes — ${modeLabel[mode]}</span><span class="eyebrow x" onclick="CL.go('gauntlet_menu')">✕</span></div>
   <h2 class="disp">Meilleur run par archétype</h2>
   <p class="lede small">Chaque archétype garde son propre record — battre l\u2019un ne touche jamais celui d\u2019un autre. Uniquement des scores : les combattants arcade sont jetables et non persistés.</p>
   <div class="pills mb">${modeTabs}</div>
   ${ascTabs}
   <div class="glass" style="background:var(--panel2);border:1px solid var(--line);margin-top:8px">${rows}</div>
   <button class="btn ghost mt" onclick="CL.go('gauntlet_menu')">← Retour au Gauntlet</button>
  </div>`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: GAUNTLET_MENU_HIERARCHIE] — le bloc du défi du jour (retiré)
   (ajout #2, ancre GAUNTLET_DEFI_JOUR_V2 plus haut) remplace celle-ci —
   ancienne version retirée pour éviter une redéclaration de fonction (la
   dernière définition l'aurait de toute façon emporté silencieusement en
   JS, mais garder les deux aurait été trompeur à la lecture). ==== */
/* ==== [ANCRE: CORRECTIF_MENU_GAUNTLET_COMPACT] — bug remonté (10d élargi à
   cet écran) : 4 liens secondaires (Panthéon, Tour d'Ascension, Profil,
   Boutique) empilaient chacun un bouton pleine largeur, précédés d'un
   en-tête "c) BOUTIQUE" séparé rien que pour le dernier — Boutique n'a rien
   d'une nature différente des 3 autres (tous des raccourcis annexes, aucun
   n'est un format de jeu). Regroupés en grille 2×2 (.leg-grid, déjà
   utilisée pour le Panthéon carrière) sous un seul en-tête, sans le
   numérotage "a)/b)/c)" qui n'apportait rien à la lecture. ==== */
function scr_gauntlet_menu(){
  return `<div class="scr center intro">
   <div class="eyebrow sage">Mode Arcade</div>
   <h2 class="disp big">GAUNTLET</h2>
   <p class="lede">Sélectionnez le format de l\u2019épreuve.</p>
   ${nextObjectiveBlock()}
   <div class="eyebrow mb mt" style="color:var(--gold);border-bottom:1px solid var(--line);padding-bottom:6px">MODES DE JEU CLASSIQUES</div>
   <button class="btn primary" style="font-size:18px;padding:16px" onclick="CL.startArcade()">BRACKET 64 (CLASSIQUE)
     <span class="mono" style="display:block;font-size:11px;margin-top:6px">Tournoi à élimination directe</span>${gauntletMenuBestTag('bracket64')}</button>
   ${gauntletAscPicker('bracket64')}
   <button class="btn" style="font-size:18px;padding:16px;margin-top:12px;border-color:var(--sage);color:var(--sage)" onclick="CL.startLadder100()">CLASSEMENT MONDIAL DES 100
     <span class="mono muted" style="display:block;font-size:11px;margin-top:6px">Grimpez du rang #100 jusqu\u2019au sommet</span>${gauntletMenuBestTag('ladder_100')}</button>
   ${gauntletAscPicker('ladder_100')}
   ${checkLegendUnlock('mode_boss')?`<button class="btn ghost" style="font-size:16px;padding:16px;margin-top:12px;border-color:var(--gold);color:var(--gold)" onclick="CL.startBossRun()">BOSS RUN
     <span class="mono muted" style="display:block;font-size:11px;margin-top:6px">5 champions d\u2019affilée, finitions uniquement</span>${gauntletMenuBestTag('boss_run')}</button>
   ${gauntletAscPicker('boss_run')}`:''}
   ${gauntletCapstoneEntry()}
   <div class="eyebrow mb mt" style="color:var(--muted);border-bottom:1px solid var(--line);padding-bottom:6px">Autres accès</div>
   <div class="leg-grid">
     <button class="btn ghost" style="margin:0;border:1px dashed var(--line);padding:12px 8px;font-size:12px" onclick="CL.go('archetype_pantheon')">🏛️ Panthéon des archétypes</button>
     <button class="btn ghost" style="margin:0;border:1px dashed var(--gold);padding:12px 8px;font-size:12px" onclick="CL.viewAscensionTower('bracket64')">🗼 Tour d\u2019Ascension</button>
     <button class="btn ghost" style="margin:0;border:1px dashed var(--gold);color:var(--gold);padding:12px 8px;font-size:12px" onclick="CL.goShopGauntlet()">🛒 Boutique</button>
   </div>
   <div class="fld" style="margin-top:24px">
     <label class="muted small">Graine de la run (optionnel — laissez vide pour aléatoire, ressaisissez la même pour rejouer une run identique)</label>
     <input maxlength="24" placeholder="ex. 20260809" value="${esc(G._pendingSeed||'')}" oninput="CL.setGauntletSeed(this.value)">
   </div>
   <button class="btn ghost mt" onclick="CL.go('title')">Retour au menu</button>
  </div>`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [FIN ANCRE] ==== */
const GAUNTLET_RELIC_MODE_LABEL={bracket64:'Bracket 64',ladder_100:'Ladder 100',boss_run:'Boss Run'};
/* ==== [FIN ANCRE] ==== */
function scr_intro(){ const c=hasSave('career');
  return `<div class="scr center intro">
   <div class="eyebrow">Simulateur de gestion MMA</div>
   <h1 class="disp big">CAGE<br>LEGACY</h1>
   <p class="lede">Capital physique limité. Chaque camp d\u2019entraînement laisse des traces.</p>
   ${c?`<button class="btn gold" onclick="CL.cont()">Reprendre le dossier</button>`:''}
   <button class="btn primary" onclick="CL.go('create')">${c?'Nouveau prospect':'Jouer une future légende'}</button>
   <button class="btn ghost" onclick="CL.go('hof')">🏛️ Archives</button>
   <button class="btn ghost" onclick="CL.go('title')">← Retour au menu</button></div>`; }

function scr_create(){ const d=G.draft, divs=DIVISIONS[d.gender];
  const pills=(arr,key,fn)=>arr.map(x=>`<span class="pill ${d[key]===fn(x).v?'on':''}" onclick="CL.draft('${key}','${fn(x).v}')">${fn(x).t}</span>`).join('');
  return `<div class="scr"><div class="eyebrow">Création</div><h2 class="disp">Ton combattant</h2>
   <div class="fld"><label>Genre</label><div class="pills">${pills(['H','F'],'gender',g=>({v:g,t:g==='H'?'Homme':'Femme'}))}</div></div>
   <div class="fld"><label>Prénom</label><input id="fn" maxlength="18" value="${esc(d.first||'')}" placeholder="Prénom" oninput="CL.draftIn('first',this.value)"></div>
   <div class="fld"><label>Pays</label><div class="pills">${COUNTRY_KEYS.map(c=>`<span class="pill ${d.country===c?'on':''}" onclick="CL.draft('country','${c}')">${COUNTRIES[c].flag} ${COUNTRIES[c].name}</span>`).join('')}</div></div>
   <div class="fld"><label>Division</label><div class="pills">${divs.map(x=>`<span class="pill ${d.div===x.id?'on':''}" onclick="CL.draft('div','${x.id}')">${x.name}</span>`).join('')}</div></div>
   <div class="fld"><label>Discipline de base <span class="muted">(toutes équilibrées)</span></label><div class="pills">${STYLE_KEYS.map(s=>`<span class="pill ${d.style===s?'on':''}" onclick="CL.draft('style','${s}')">${styleLabel(s)}</span>`).join('')}</div></div>
   <div class="note small">Ton <b>origine</b>, ta <b>motivation</b> et ton <b>surnom</b> (au passage pro) se révéleront en jeu.</div>
   <div class="fld"><label>Mode <span class="muted">(optionnel)</span></label><div class="pills">
     <span class="pill ${d.ironMan?'on':''}" onclick="CL.draft('ironMan',${!d.ironMan})">Iron Man — une défaite ou blessure grave = fin définitive</span>
   </div></div>
   <div class="fld"><label>Défis prédéfinis <span class="muted">(Scénarios)</span></label>
     <button class="btn ghost" style="border:1px solid var(--line);margin:0;padding:12px" onclick="CL.go('scenarios')">Parcourir les scénarios</button>
   </div>
   <button class="btn primary" onclick="CL.create()">Débuter la carrière</button>
   <button class="btn ghost" onclick="CL.go('intro')">Retour</button></div>`; }

function scr_hub(){ const f=G.f; const champ=f.champion;
  // ==== [ANCRE: CORRECTIF_COULEUR_MESSAGE] — bug trouvé : un seul message
  // ("sponsor validé") était reconnu comme positif ; TOUS les autres
  // messages, y compris clairement positifs (ex. "Contrat renouvelé"),
  // s'affichaient donc en rouge par défaut. Classification élargie par
  // mots-clés, avec un ton neutre (doré) par défaut plutôt que négatif.
  const msgLower=(G.lastMsg||'').toLowerCase();
  const POSITIVE_HINTS=['sponsor validé','renouvelé','copié','remporté','accepté','testamentaire actif','débloqué avec succès','victoire','succès','signé'];
  const NEGATIVE_HINTS=['refus','annulé','insuffisant','invalide','corrompu','impossible','ratée','échec','mauvaise impression','interdit','critique'];
  const isGoodMsg=POSITIVE_HINTS.some(k=>msgLower.includes(k));
  const isBadMsg=!isGoodMsg && NEGATIVE_HINTS.some(k=>msgLower.includes(k));
  const msgColor=isGoodMsg?'var(--win)':isBadMsg?'var(--loss)':'var(--gold)';
  const msgHtml=G.lastMsg?`<div class="card mb" style="border-left:3px solid ${msgColor};background:var(--panel2)"><div class="small" style="color:${msgColor}">${esc(G.lastMsg)}</div></div>`:'';
  if(G.lastMsg) G.lastMsg=null;
  const injuryHtml=f.injury?`<div class="card gold-b glass" style="border-color:var(--loss);margin-bottom:16px">
     <span class="eyebrow mb" style="color:var(--loss)">⚠ RAPPORT MÉDICAL CRITIQUE</span>
     <div class="disp" style="font-size:18px">${esc(f.injury.name)}</div>
     <div class="mono small mt">Convalescence requise : ${f.injury.left} cycle(s)</div>
     <button class="btn mt" style="width:100%;border-color:var(--loss);color:var(--loss)" onclick="CL.recoverInjury()">Laisser le corps récupérer</button>
   </div>`:'';
  const declineHtml=(!f.injury && isDeclining(f))?`<div class="mono small" style="color:var(--loss);margin-top:6px;border-top:1px dashed var(--loss);padding-top:6px">⚠ Tu prends de l\u2019âge, le corps commence à souffrir.</div>`:'';
  const fightBtnHtml=(f.injury||f.retired)
    ?`<button class="btn ghost" style="font-size:20px;padding:18px;opacity:.5;cursor:not-allowed" disabled>${f.retired?'Carrière terminée':'Athlète inapte'}</button>`
    :`<button class="btn primary" style="font-size:20px;padding:18px" onclick="CL.fightSelect()">Évaluer les contrats (Matchmaking)</button>`;
  const rankTag=f.champChampBelt?`<span class="tag2 hot" style="border-color:var(--blood);color:var(--blood)">DOUBLE CHAMP. ${orgDisplayName(f).toUpperCase()}</span>`:(champ?`<span class="tag2 hot">CHAMP. ${orgDisplayName(f).toUpperCase()}</span>`:((f.W+f.L+(f.D||0))===0?`<span class="tag2">NON CLASSÉ</span>`:`<span class="tag2 hot">RANG #${divRank(f)}</span>`));
  const streakTag=f.streak>=3?`<span class="tag2" style="color:var(--win);border-color:var(--win)">Série de ${f.streak} victoires</span>`:(f.streak<=-2?`<span class="tag2" style="color:var(--loss);border-color:var(--blood-d)">${Math.abs(f.streak)} défaites d\u2019affilée</span>`:'');
  const amaTag=(f.stage==='pro'&&f.amaRec)?`<span class="tag2">Amateur : ${f.amaRec.W}-${f.amaRec.L}</span>`:'';
  const contractTag=(f.org>0 && f.contract)?`<span class="tag2" style="border-color:var(--gold);color:var(--gold)">Contrat : ${f.contract.fightsLeft} combat${f.contract.fightsLeft>1?'s':''}</span>`:'';
  return `<div class="scr">
   <div class="bar" style="border-bottom:1px solid var(--line);padding-bottom:8px;margin-bottom:14px">
     <span class="eyebrow mono">${orgDisplayName(f).toUpperCase()} // ${f.divName.toUpperCase()}</span>
     <span class="eyebrow mono gold">${formatArgent(f.earnings)}</span>
   </div>
   ${msgHtml}
   ${injuryHtml}
   <div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--line);padding:16px;margin-bottom:20px">
     <div class="hero-name">${esc(f.name)} ${f.flag}<em>${f.nick?`« ${f.nick} » — `:''}${f.styleLabel}, ${f.age} ans</em></div>
     <div class="tagrow">${rankTag}${streakTag}${contractTag}${amaTag}</div>
     ${declineHtml}
     <div class="stat-band">
       <div><span class="stat-big">${recordStr(f)}</span><span class="stat-lbl">Record actuel</span></div>
       <div style="text-align:right">${f.ko===f.sub?`<span class="stat-lbl" style="display:block;margin-bottom:2px">FINITIONS</span><span class="mono" style="font-size:20px"><span class="gold">${f.ko}</span> KO / <span class="gold">${f.sub}</span> SUB</span>`:f.ko>f.sub?`<span class="stat-big hot">${f.ko}</span><span class="stat-lbl">KO / ${f.sub} SUB</span>`:`<span class="stat-big hot">${f.sub}</span><span class="stat-lbl">SUB / ${f.ko} KO</span>`}</div>
     </div>
   </div>
   <div style="margin-bottom:20px">
     <div class="eyebrow" style="margin-bottom:8px">Derniers combats</div>
     ${last5(f)}
   </div>
   <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:28px">
     <div><span class="stat-lbl" style="margin-bottom:4px;display:flex;justify-content:space-between"><span>MORAL</span><b class="mono" style="color:var(--text);font-size:12px">${d20(f.morale)}</b></span><div class="gauge2" style="background:var(--line);height:4px"><span style="display:block;height:100%;width:${clamp(f.morale,0,100)}%;background:var(--win)"></span></div></div>
     <div><span class="stat-lbl" style="margin-bottom:4px;display:flex;justify-content:space-between"><span>FORME</span><b class="mono" style="color:var(--text);font-size:12px">${d20(f.form)}</b></span><div class="gauge2" style="background:var(--line);height:4px"><span style="display:block;height:100%;width:${clamp(f.form,0,100)}%;background:var(--sage)"></span></div></div>
   </div>
   ${fightBtnHtml}
   <div class="g2"><button class="btn" onclick="CL.go('profile')">Bilan technique complet</button><button class="btn" onclick="CL.go('rankings')">Classements</button></div>
   <div class="g2"><button class="btn ghost" onclick="CL.go('ach')">Palmarès</button><button class="btn ghost" onclick="CL.go('history')">Archives</button></div>
   <button class="btn ghost" onclick="CL.go('beltLineage')">🌍 Registre des ceintures</button>
   ${f.champChampBelt?`<div class="card mt" style="border-left:3px solid var(--blood);background:var(--panel2);padding:12px">
     <div class="eyebrow mb" style="color:var(--blood)">Double Champion</div>
     <div class="small">Vous détenez également la ceinture ${f.champChampBelt}.</div>
   </div>`:''}
   ${(G.divisionNews&&G.divisionNews.length)?`<div class="card mt" style="background:var(--panel2);padding:12px">
     <div class="eyebrow mb">Actualités de la division</div>
     ${G.divisionNews.slice(0,3).map(n=>`<div class="mono small muted" style="margin-top:4px">S${n.year} — ${n.text}</div>`).join('')}
   </div>`:''}
   <button class="btn ghost" style="color:var(--loss);margin-top:16px;border-top:1px dashed var(--line);padding-top:16px" onclick="CL.go('retire')">Déclarer la retraite (Définitif)</button>
   </div>`; }

function scr_select(){ const f=G.f;
  let h=`<div class="scr">
   <div class="bar" style="border-bottom:2px solid var(--line);margin-bottom:24px;padding-bottom:8px">
     <span class="eyebrow mono">BUREAU DU MATCHMAKER // ${orgDisplayName(f).toUpperCase()}</span>
   </div>
   <p class="lede" style="margin-bottom:32px;font-size:15px">Analysez les profils et signez le contrat. L\u2019ordre des propositions dicte le niveau de risque et la récompense au classement.</p>
   <div class="stagger">`;
  G.opps.forEach((e,i)=>{ const o=e.o;
    const isRival=(f.rivalId===o.id); const isAmaRival=(!isRival && o.isAmateurRival);
    const rnk=divRank(o); const fightsTot=o.W+o.L+(o.D||0);
    const rTag=o.champion?'CHAMPION':(fightsTot===0?'NON CLASSÉ':(rnk===1?'CHALLENGER #1':`RANG #${rnk}`));

    // ==== [ANCRE: MATCHMAKING_ROLES] — l'archétype (mêmes 3 adversaires que
    // genOpponents() proposait déjà) est désormais calculé UNE FOIS dans
    // genOpponents() (matchmakingRole(), ui-02) et figé sur l'entrée (e.mm),
    // plutôt que recalculé à chaque render() : garantit la cohérence entre
    // ce qui est affiché ici et ce que resolveFight() utilise réellement
    // (voir CREDIBILITE_PRODIGE, ui-05). Filet de sécurité conservé pour les
    // entrées qui n'en auraient pas (ex. sauvegarde ancienne rechargée).
    const mmData=e.mm||matchmakingRole(f,o,e);
    const mmRole=mmData.label, mmReward=mmData.reward, roleColor=mmData.color;


    // ==== [ANCRE: COMPARATIF_STATS_REUTILISABLE] — factorisé dans statComparisonHtml() ====
    h+=`<div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--line);padding:16px;margin-bottom:20px">
      <div style="border-left:3px solid ${roleColor};padding-left:12px;margin-bottom:16px">
         <div class="disp" style="font-size:18px;color:${roleColor};line-height:1">${mmRole.toUpperCase()}</div>
         <div class="mono small muted" style="margin-top:4px">${mmReward}</div>
      </div>
      <div class="meta-strip"><div><span>Record</span><b style="white-space:nowrap">${recordStr(o)}</b></div>${o.amaRec?`<div><span>Amateur</span><b style="white-space:nowrap">${o.amaRec.W}-${o.amaRec.L}</b></div>`:''}<div><span>Mensurations</span><b style="white-space:nowrap">${o.phys.height}cm / ${o.phys.reach}cm</b></div></div>
      <div class="hero-name" style="${isRival?'color:var(--blood)':''}">${esc(o.name)} ${o.flag}<em>${o.styleLabel}, ${o.age} ans</em></div>
      <div class="tagrow">
        ${e.context?`<span class="tag2 hot gold-fill">${e.context}</span>`:''}
        ${isRival?'<span class="tag2" style="color:var(--bg);background:var(--blood);border-color:var(--blood)">RIVALITÉ ACTIVE</span>':''}
        ${isAmaRival?'<span class="tag2" style="color:var(--sage);border-color:var(--sage)">RIVAL AMATEUR</span>':''}
        <span class="tag2 hot">${rTag}</span>
      </div>
      ${statComparisonHtml(f,o)}
      <p class="event-text mono" style="font-size:11.5px;opacity:.85;margin:14px 0 0;position:relative;z-index:2;border-left:2px solid var(--gold);padding-left:10px">ANALYSE : ${e.read}</p>
      <button class="btn ${isRival?'primary':''}" style="margin-top:14px;font-size:15px;letter-spacing:.05em;position:relative;z-index:2" onclick="CL.opp(${i})">${isRival?'RÉGLER SES COMPTES':'ACCEPTER LE COMBAT'}</button>
    </div>`;
  });
  h+=`</div><button class="btn ghost mt" style="border:none" onclick="CL.go('hub')">← Retour au vestiaire</button></div>`;
  return h;
}

/* ==== [ANCRE: PRESS_CONF_ECRAN] — écran dédié, plutôt qu'une carte noyée
   dans le vestiaire (le joueur passait complètement à côté). ==== */
function scr_press_conf(){
  const pc=G.pressConf;
  if(!pc) return `<div class="scr center intro"><p class="lede">Rien à signaler.</p><button class="btn ghost mt" onclick="CL.go('camp')">Continuer</button></div>`;
  return `<div class="scr center intro">
    <div class="eyebrow blood">Médiatisation</div>
    <h2 class="disp">${pc.title}</h2>
    <div class="glass card" style="background:var(--panel2);text-align:left;padding:16px;margin:20px 0;border-left:3px solid var(--blood)">
      <p class="lede" style="margin:0">${pc.text}</p>
    </div>
    <div class="tagrow" style="justify-content:center;margin-bottom:24px">
      ${(()=>{ const shown=Math.sign(pc.moraleEffect)*Math.max(1,Math.round(Math.abs(pc.moraleEffect)/5));
        return `<span class="tag2 hot" style="color:${shown>=0?'var(--win)':'var(--loss)'};border-color:${shown>=0?'var(--win)':'var(--loss)'}">${shown>=0?'+':''}${shown} Moral</span>`; })()}
    </div>
    <button class="btn primary" onclick="G.pressConf=null; CL.go('camp')">Continuer vers le camp d\u2019entraînement</button>
  </div>`;
}
/* ==== [FIN ANCRE] ==== */
function scr_camp(){ const f=G.f;
  const deltaHtml=d=>d.map(([k,v])=>{ const lbl=k==='morale'?'Moral':k==='form'?'Forme':attrLabel(k);
     const vague=(k==='morale'||k==='form')?(v>0?`+${lbl}`:`-${lbl}`):(v>0?`Potentiel : ${lbl} ↑`:`Potentiel : ${lbl} ↓`);
     return `<span class="dlt ${v>=0?'up':'dn'}">${vague}</span>`; }).join('');
  const curTier=G.selectedCampTier||'gratuit';
  const activeTier=CAMP_TIERS.find(t=>t.id===curTier)||CAMP_TIERS[0];
  let tierDesc='';
  if(activeTier.id==='gratuit') tierDesc='Aucun coût financier. <span style="color:var(--loss)">Risque de blessure de 5%</span> (-15% Forme, -10% Moral).';
  else if(activeTier.id==='premium') tierDesc='Coût : 15k$. <span style="color:var(--win)">Zéro risque de blessure. Bonus garanti : +5% Forme, +5% Moral.</span>';
  else if(activeTier.id==='sparring') tierDesc='Coût : 35k$. <span style="color:var(--win)">Zéro risque. Bonus : +5% Forme.</span> L\u2019adversaire subira un malus tactique (-3 Adapt., -2 QI).';
  const tierTags=CAMP_TIERS.map(t=>{
    const canAfford=(f.earnings||0)>=t.cost;
    const style=`cursor:${canAfford?'pointer':'not-allowed'};opacity:${canAfford?1:0.35}`;
    const click=canAfford?` onclick="CL.setCampTier('${t.id}')"`:'';
    return `<span class="tag2 ${curTier===t.id?'hot':''}" style="${style}"${click}>${t.name}${t.cost?` (${t.cost}k$)`:''}</span>`;
  }).join('');
  return `<div class="scr"><div class="bar"><span class="eyebrow">Camp d\u2019entraînement</span><span class="eyebrow x" onclick="CL.go('select')">✕</span></div>
   <p class="lede small">Un seul axe avant ce combat. Chaque choix <b>monte et baisse</b> des attributs (bornés par ton potentiel).</p>
   <div class="tagrow mb">${tierTags}</div>
   <div class="card glass mb" style="background:var(--panel2);padding:12px;border-left:3px solid var(--gold)"><div class="mono small">${tierDesc}</div></div>
   ${G.train.map((t,i)=>`<div class="opp" onclick="CL.train(${i})"><div class="opp-top"><span class="opp-nm">${t.label}</span></div>
      <div class="opp-mid">${t.hint}</div><div class="dlts">${deltaHtml(t.d)}</div></div>`).join('')}
   </div>`; }

/* ==== [ANCRE: PLAN_COMBAT] — vestiaire, choix tactique juste avant le combat ==== */
function scr_plan(){ const f=G.f, opp=G.fight.opp; const plans=TACTICS[f.style]||[];
  const cr=G.fight.cutResult||{tier:'normal',effPct:0,kg:0,walk:(divById(G.f.div)?divById(G.f.div).kg:70),limit:(divById(G.f.div)?divById(G.f.div).kg:70)};
  const step=G.fight.planStep||1;
  const wcHtml={
    sans_effort:`<div class="card mt" style="border-left:3px solid var(--sage);padding-left:14px"><div class="eyebrow mb" style="color:var(--sage)">Pesée sans effort</div>
      <div class="mono small" style="margin-top:6px">Poids actuel : <b>${cr.walk.toFixed(1)}kg</b> <span class="muted">(limite ${cr.limit}kg)</span></div>
      <div class="small muted" style="margin-top:8px">Un moine bouddhiste au régime.</div>
      <div class="small" style="color:var(--sage);font-weight:bold;margin-top:4px">Bonus ce soir : cardio et solidité.</div></div>`,
    facile:`<div class="card mt" style="border-left:3px solid var(--sage);padding-left:14px"><div class="eyebrow mb" style="color:var(--sage)">Cutting facile</div>
      <div class="mono small" style="margin-top:6px">Poids actuel : <b>${cr.walk.toFixed(1)}kg</b> <span class="muted">(limite ${cr.limit}kg)</span></div>
      <div class="mono small" style="margin-top:2px">À perdre : <b>${cr.kg}kg</b> <span class="muted">(${cr.effPct.toFixed(1)}%)</span></div>
      <div class="small muted" style="margin-top:8px">Deux jours de sauna et un sandwich en moins, rien de dramatique.</div>
      <div class="small muted" style="margin-top:4px">Aucun impact ce soir.</div></div>`,
    normal:`<div class="card mt" style="border-left:3px solid var(--gold);padding-left:14px"><div class="eyebrow gold mb">Cutting normal</div>
      <div class="mono small" style="margin-top:6px">Poids actuel : <b>${cr.walk.toFixed(1)}kg</b> <span class="muted">(limite ${cr.limit}kg)</span></div>
      <div class="mono small" style="margin-top:2px">À perdre : <b>${cr.kg}kg</b> <span class="muted">(${cr.effPct.toFixed(1)}%)</span></div>
      <div class="small muted" style="margin-top:8px">Le sauna, le sac poubelle, la routine du métier.</div>
      <div class="small muted" style="margin-top:4px">Dans la norme du métier, aucun impact.</div></div>`,
    complique:`<div class="card mt glass" style="border-left:3px solid var(--loss);background:var(--panel2);padding-left:14px"><div class="eyebrow mb" style="color:var(--loss)">Cutting compliqué</div>
      <div class="mono small" style="margin-top:6px;position:relative;z-index:2">Poids actuel : <b>${cr.walk.toFixed(1)}kg</b> <span class="muted">(limite ${cr.limit}kg)</span></div>
      <div class="mono small" style="margin-top:2px;position:relative;z-index:2">À perdre : <b>${cr.kg}kg</b> <span class="muted">(${cr.effPct.toFixed(1)}%)</span></div>
      <div class="small muted" style="margin-top:8px;position:relative;z-index:2">Tu vas cracher dans un gobelet pendant six heures et dormir dans un sac poubelle. Pitoyable, mais professionnel.</div>
      <div class="small" style="color:var(--loss);font-weight:bold;margin-top:4px;position:relative;z-index:2">Malus ce soir : cardio, force, solidité et menton (déshydratation).</div></div>`,
  }[cr.tier]||'';
  let h=`<div class="scr"><div class="bar"><span class="eyebrow">Vestiaire · Plan de combat</span></div>
   ${G.fight.isStarFight?`<div class="card mb" style="border-left:3px solid var(--gold);background:var(--panel2);padding:10px"><span class="mono small gold">★ COMBAT VEDETTE — ta popularité t\u2019offre 5 rounds sous les projecteurs ce soir.</span></div>`:''}
   ${renderFightPoster(f,opp,G.fight.kind)}`;
  if(step===1){
    h+=wcHtml;
    if(G.activeSponsor) h+=`<div class="card mt" style="border-left:3px solid var(--gold);padding-left:14px;background:var(--panel2)">
     <div class="eyebrow mb" style="color:var(--gold)">Objectif sponsor</div>
     <div class="mono small">${G.activeSponsor.text}</div></div>`;
    if(G.lastMsg){
      h+=`<div class="card mt glass" style="border-left:3px solid var(--text);padding-left:14px;background:var(--panel2)">
       <div class="eyebrow mb" style="color:var(--text)">Bilan du face-à-face</div>
       <div class="small">${esc(G.lastMsg)}</div></div>`;
      G.lastMsg=null;
    }
    h+=`<button class="btn primary mt" style="padding:16px;font-size:18px" onclick="G.fight.planStep=2; render();">SUIVANT</button>`;
  } else {
    h+=`<div class="card" style="border-color:transparent;padding:0 0 16px 0">
     <div class="muted small" style="border-left:2px solid var(--gold);padding-left:10px"><b>Analyse :</b> ${tacticalRead(f,opp)}</div>
   </div>
   <p class="lede small mt">Quelle est ta consigne tactique pour ce combat ? Cela modifiera radicalement ton comportement dans la cage.</p>
   ${getExclusiveTactics(f).concat(plans).map((p,i)=>`<div class="opp" onclick="CL.choosePlan(${i})">
     <div class="opp-top"><span class="opp-nm gold">${p.lbl}</span></div>
     <div class="opp-read" style="margin-top:4px;opacity:1">${p.desc}</div></div>`).join('')}`;
  }
  h+=`</div>`;
  return h;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: PLAN_VS_AMI] — choix tactique dédié au Défi Multijoueur,
   même logique que le vestiaire de carrière (scr_plan) mais simplifié (pas
   de coupe de poids, ces deux légendes sont déjà reconstruites telles
   quelles). ==== */
function scr_vs_friend_plan(){
  const A=G.vsFriendLegendA, B=G.vsFriendLegendB;
  if(!A||!B) return `<div class="scr center intro"><p class="lede">Série interrompue.</p><button class="btn ghost mt" onclick="CL.go('legends')">Retour</button></div>`;
  const plans=TACTICS[A.style]||[];
  const s=G.vsFriendScore;
  return `<div class="scr"><div class="bar"><span class="eyebrow">Défi Multijoueur · Plan de combat</span></div>
   <div class="hero-name" style="text-align:center;font-size:20px">${esc(A.name)} <span class="muted">${s.A} - ${s.B}</span> ${esc(B.name)}</div>
   <div class="card mt" style="border-color:transparent;padding:0 0 16px 0">
     <div class="muted small" style="border-left:2px solid var(--gold);padding-left:10px"><b>Analyse :</b> ${tacticalRead(A,B)}</div>
   </div>
   <p class="lede small mt">Quelle est ta consigne tactique pour cette manche ?</p>
   ${getExclusiveTactics(A).concat(plans).map((p,i)=>`<div class="opp" onclick="CL.chooseVsFriendPlan(${i})">
     <div class="opp-top"><span class="opp-nm gold">${p.lbl}</span></div>
     <div class="opp-read" style="margin-top:4px;opacity:1">${p.desc}</div></div>`).join('')}
  </div>`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: NARRATION] — log texte à partir de res.log/res.stats, déjà calculés ==== */
function fightLog(res){ if(!res.log||!res.log.length)return '<span class="muted small">Décision aux cartes.</span>';
  const rows=res.log.map(L=>`<div class="log-row ${L.finish?'gold':''}"><span class="log-r">R${L.r}</span><span style="flex:1">${L.text||(L.phase==='sol'?'échanges au sol':'échanges debout')}</span></div>`);
  if(isDecisionLike(res.method)) rows.push(`<div class="log-row gold"><span class="log-r">R${res.round||(res.roundStats&&res.roundStats.length)||3}</span><span style="flex:1">${res.method}${res.detail?' — '+res.detail:''}</span></div>`);
  return `<div class="fight-log" style="max-height:220px;overflow-y:auto;padding-right:5px">${rows.join('')}</div>`; }
/* ==== [FIN ANCRE] ==== */
function scr_hof(){
  const fullList=loadHOF();
  const filt=G.hofFilter||{};
  const list=(typeof filterHallOfFame==='function')?filterHallOfFame(filt):fullList;
  const styles=Object.values(STYLES).map(s=>s.label);
  const divisions=[...new Set(DIVISIONS.F.concat(DIVISIONS.H).map(d=>d.name))];
  const modes=[...new Set(fullList.map(f=>f.gameMode||'career'))];
  const modeLabels={career:'Carrière Complète',faith:'MMA Faith'};
  const showFilters=!!G.showHofFilters;
  return `<div class="scr"><div class="bar"><span class="eyebrow">Panthéon · ${list.length}/${fullList.length} légende(s)</span><span class="eyebrow x" onclick="CL.go('intro')">✕</span></div>
   <h2 class="disp">Tes anciens combattants</h2>
   <button class="btn ghost mb" style="border:1px solid var(--line);width:auto;padding:8px 16px" onclick="CL.toggleHofFilters()">Filtres ${showFilters?'−':'+'}</button>
   ${showFilters?`<div style="background:var(--panel2);padding:12px;border:1px solid var(--line);margin-bottom:16px">
   ${modes.length>1?`<div class="eyebrow mb">Mode</div><div class="tagrow mb"><span class="tag2 ${!filt.gameMode?'hot':''}" style="cursor:pointer" onclick="CL.filterHof('gameMode','')">Tous</span>${modes.map(m=>`<span class="tag2 ${filt.gameMode===m?'hot':''}" style="cursor:pointer" onclick="CL.filterHof('gameMode','${m}')">${modeLabels[m]||m}</span>`).join('')}</div>`:''}
   ${styles.length>1?`<div class="eyebrow mb mt">Styles</div><div class="tagrow mb"><span class="tag2 ${!filt.style?'hot':''}" style="cursor:pointer" onclick="CL.filterHof('style','')">Tous</span>${styles.map(s=>`<span class="tag2 ${filt.style===s?'hot':''}" style="cursor:pointer" onclick="CL.filterHof('style','${esc(s)}')">${esc(s)}</span>`).join('')}</div>`:''}
   ${divisions.length>1?`<div class="eyebrow mb mt">Divisions</div><div class="tagrow mb"><span class="tag2 ${!filt.divName?'hot':''}" style="cursor:pointer" onclick="CL.filterHof('divName','')">Toutes</span>${divisions.map(d=>`<span class="tag2 ${filt.divName===d?'hot':''}" style="cursor:pointer" onclick="CL.filterHof('divName','${esc(d)}')">${esc(d)}</span>`).join('')}</div>`:''}
   <div class="eyebrow mb mt">Défenses</div><div class="tagrow mb"><span class="tag2 ${!filt.minDefenses?'hot':''}" style="cursor:pointer" onclick="CL.filterHof('minDefenses',0)">Toutes</span><span class="tag2 ${filt.minDefenses>=2?'hot':''}" style="cursor:pointer" onclick="CL.filterHof('minDefenses',2)">2+ défenses</span></div>
   </div>`:''}
   ${G.exportedCode?`<div class="card glass mb" style="background:var(--panel2);padding:12px;border-left:3px solid var(--gold)">
     <div class="eyebrow mb" style="color:var(--gold)">Lien de ${esc(G.exportedName||'')} — envoie-le à ton ami</div>
     ${G.exportedLink?`<input readonly value="${esc(G.exportedLink)}" style="width:100%;background:var(--bg);color:var(--text);border:1px solid var(--line);padding:8px;font-family:'JetBrains Mono';font-size:11px" onclick="this.select()">
     <button class="btn primary mt" style="width:auto;padding:6px 14px" onclick="CL.copyExportedLink()">Copier le lien</button>`:''}
     <details class="mt"><summary class="muted small" style="cursor:pointer">Le lien ne marche pas ? Utiliser le code à la place</summary>
       <textarea readonly style="width:100%;min-height:70px;background:var(--bg);color:var(--text);border:1px solid var(--line);padding:8px;font-family:'JetBrains Mono';font-size:11px;resize:none;margin-top:8px" onclick="this.select()">${G.exportedCode}</textarea>
     </details>
     <button class="btn ghost mt" style="width:auto;padding:6px 12px" onclick="CL.clearExportedCode()">Fermer</button>
   </div>`:''}
   <div class="leg-grid">${(()=>{
     /* ==== [ANCRE: GOAT_PANTHEON] — item demandé : la liste est déjà triée
        par f.score (posé à l'intronisation, state.js) mais ce classement
        restait invisible — juste une position, jamais présenté comme un
        mérite. Recalculé sur 'list' (donc valable sous filtre actif), pas
        sur l'ordre de tri brut (les favoris passent en tête indépendamment
        du score). ==== */
     const topScore=list.length?Math.max(...list.map(x=>x.score||0)):0;
     return list.length?list.map((f,i)=>{
      const isGoat=topScore>0 && f.score===topScore;
      const decorations=f.decorations||[];
      const deco=legendDecoStyle(decorations);
      const tc=legendTierColor(f.rank);
      return `<div class="leg-tcard ${isGoat?'goat':''}" style="--tc:${tc};${deco.borderCss}" onclick="CL.viewLegend('${f.id}')">
      <div class="tier-corner"></div>
      ${deco.holoCss?`<div class="holo" style="${deco.holoCss}"></div>`:''}
      <div class="tier-lbl">${isGoat?'👑 ':''}${f.rank}</div>
      <div class="nm" style="${deco.nameCss}">${f.favorite?'★ ':''}${esc(f.name)}</div>
      <div class="muted small" style="position:relative;z-index:1">${f.style} · ${f.divName}</div>
      <div class="rec" style="${deco.recordCss}">${f.W}<span class="muted">-</span><span class="loss">${f.L}</span></div>
      ${deco.stickers.length?`<div class="stickers">${deco.stickers.map(s=>`<span>${s}</span>`).join('')}</div>`:''}
      <div style="display:flex;gap:6px;margin-top:9px;position:relative;z-index:1" onclick="event.stopPropagation()">
        <button class="btn ghost" style="padding:4px 7px;width:auto;font-size:11px;color:${f.favorite?'var(--gold)':'var(--muted)'}" onclick="CL.toggleHofFav('${f.id}')" title="Favori">${f.favorite?'★':'☆'}</button>
        <button class="btn ghost" style="padding:4px 7px;width:auto;font-size:11px" onclick="CL.exportLegend('${f.id}')" title="Exporter">🔗</button>
        <button class="btn ghost" style="padding:4px 7px;width:auto;font-size:11px;color:var(--loss)" onclick="CL.deleteHof('${f.id}')" title="Supprimer">🗑</button>
      </div></div>`;
    }).join(''):
      '<p class="lede">Aucune légende encore. Ta première carrière retraitée apparaîtra ici pour toujours.</p>';
   })()}</div>
   <div class="tagrow mb">
     <button class="btn ghost" style="border:1px solid var(--loss);color:var(--loss);width:auto;padding:8px 16px;margin-left:8px" onclick="CL.resetHof()">Tout purger (sauf favoris)</button>
     <button class="btn ghost" style="width:auto;padding:8px 12px" onclick="CL.go('codex')">Codex des compétences</button>
     <button class="btn ghost" style="width:auto;padding:8px 12px;border-color:var(--gold);color:var(--gold)" onclick="CL.go('legends')">Salle des Légendes</button>
   </div>
   <button class="btn ghost" onclick="CL.go('intro')">Retour</button></div>`; }
// ==== [ANCRE: ECRAN_DETAIL_LEGENDE] (rendu) — bug bloquant corrigé : le
// routeur (ui-08-controller-arena.js) référence scr_legend_detail comme
// gestionnaire de l'écran 'legend_detail' (déclenché par CL.viewLegend()),
// mais cette fonction n'existait nulle part dans le codebase -> ReferenceError
// au chargement du script (objet-routeur évalué immédiatement), donc page
// blanche totale avant même le premier rendu. Fiche complète reprenant les
// données déjà capturées par enshrine() (state.js) pour chaque légende.
function scr_legend_detail(){
  const list=loadHOF(); const f=list.find(x=>String(x.id)===String(G.viewingLegendId));
  if(!f) return `<div class="scr center"><p class="lede">Légende introuvable.</p><button class="btn ghost mt" onclick="CL.go('hof')">Retour au Panthéon</button></div>`;
  /* ==== [ANCRE: ALBUM_LEGEND_STYLE] — la fiche complète devient la version
     grand format de la même carte que dans la grille (scr_hof) : coin de
     palier identique (legendTierColor), décorations rendues par la MÊME
     fonction partagée (legendDecoStyle) plutôt que par une logique
     dupliquée et différente de celle de la liste. Ouvrir une légende, c'est
     visuellement "sortir sa carte du classeur", pas changer d'écran. ==== */
  const decorations=f.decorations||[];
  const deco=legendDecoStyle(decorations);
  const tc=legendTierColor(f.rank);
  /* ==== [ANCRE: CORRECTIF_COSMETIQUES_EXCLUSIFS_INVISIBLES] — voir ancre
     jumelle dans state.js : excl_mask_oni/excl_gloves_relic figurent
     désormais directement dans LEGEND_UNLOCKABLES (l'offre du jour a été
     retirée), donc ce panneau les voit sans traitement particulier. ==== */
  const ownedDecorations=LEGEND_UNLOCKABLES.filter(i=>i.cat==='Décorations du Panthéon'&&checkLegendUnlock(i.id));
  /* ==== [FIN ANCRE] ==== */
  const decorationPanel=ownedDecorations.length?`<div class="card mb"><div class="eyebrow mb">Décorations (${decorations.length}/3)</div>
     <div class="muted small mb" style="font-size:10.5px">Un déblocage de compte : la même décoration peut être portée par plusieurs combattants à la fois.</div>
     ${ownedDecorations.map(item=>{
       const equippedHere=decorations.includes(item.id);
       const canEquip=!equippedHere&&decorations.length<3;
       return `<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid var(--line)">
         <b class="small">${item.name}</b>
         ${equippedHere?`<button class="btn ghost" style="padding:5px 10px;width:auto;font-size:11px;border-color:var(--blood);color:var(--blood);flex:0 0 auto" onclick="CL.unequipDecoration('${f.id}','${item.id}')">Retirer</button>`
           :`<button class="btn ghost" style="padding:5px 10px;width:auto;font-size:11px;flex:0 0 auto" onclick="CL.equipDecoration('${f.id}','${item.id}')" ${canEquip?'':'disabled'}>Équiper</button>`}
       </div>`;
     }).join('')}
   </div>`:'';
  /* ==== [FIN ANCRE] ==== */
  return `<div class="scr"><div class="bar"><span class="eyebrow">${f.ico} ${f.rank}</span><span class="eyebrow x" onclick="CL.go('hof')">✕</span></div>
   ${G.lastMsg?(()=>{ const m=G.lastMsg; G.lastMsg=null; return `<div class="card mb glass" style="border-left:3px solid var(--gold);background:var(--panel2);padding:10px 14px"><span class="small">${esc(m)}</span></div>`; })():''}
   ${G._decoMsg?(()=>{ const m=G._decoMsg; G._decoMsg=null; return `<div class="card mb glass" style="border-left:3px solid var(--gold);background:var(--panel2);padding:10px 14px"><span class="small">${esc(m)}</span></div>`; })():''}
   <div class="leg-hero-card" style="${deco.borderCss}">
     <div class="tier-corner-lg"></div>
     ${deco.holoCss?`<div class="holo" style="${deco.holoCss}"></div>`:''}
     <div class="tier-lbl-lg">${f.ico} ${f.rank}</div>
     <div class="hero-name" style="position:relative;z-index:1;${deco.nameCss}">${f.favorite?'★ ':''}${esc(f.name)} ${f.flag}<em>${f.nick?`« ${f.nick} » — `:''}${f.style} · ${f.divName}${f.classLabel?` · ${f.classLabel}`:''}${f.class31Label?` · ${f.class31Label}`:''}</em></div>
     ${f.motivation?`<div class="story" style="position:relative;z-index:1"><b>Se battait pour.</b> ${esc(f.motivation)}.</div>`:''}
     <div class="epis mt" style="position:relative;z-index:1">${(f.epithets||[]).map(e=>`<span class="epi">${e}</span>`).join('')}</div>
     ${deco.stickers.length?`<div class="stickers-lg mt">${deco.stickers.map(s=>`<span>${s}</span>`).join('')}</div>`:''}
     <div class="stat-band" style="position:relative;z-index:1">
       <div><span class="stat-big" style="font-size:26px;${deco.recordCss}">${f.W}<span class="muted">-</span><span class="loss">${f.L}</span></span><span class="stat-lbl">Bilan pro · retraite ${f.age} ans</span></div>
       <div style="text-align:right"><span class="stat-big" style="font-size:26px">${f.ko+f.sub}<span class="muted small"> fin.</span></span><span class="stat-lbl">${f.ko} KO / ${f.sub} SUB</span></div>
     </div>
     ${f.amaRec?`<div class="mono small muted mt" style="position:relative;z-index:1">Amateur : ${f.amaRec.W}-${f.amaRec.L}</div>`:''}
   </div>
   ${(f.amaTitles&&f.amaTitles.length)?`<div class="tagrow mb">${f.amaTitles.map(id=>{const cfg=AMA_CHAMPIONSHIPS.find(c=>c.id===id); return cfg?`<span class="tag2 hot">${SVG.medal} ${cfg.label}</span>`:'';}).join('')}</div>`:''}
   ${f.champChampBelt?`<div class="card mb" style="background:var(--panel2);padding:12px;border-left:3px solid var(--gold)"><span class="mono small" style="color:var(--gold)">${SVG.crown} Double Champion — ${esc(f.champChampBelt)}</span></div>`:''}
   ${decorationPanel}
   ${f.beltHistory&&f.beltHistory.length?`<div class="card mb"><div class="eyebrow mb">👑 Ceintures remportées</div>${f.beltHistory.map(b=>`<div class="small muted" style="padding:4px 0">${esc(b.orgName)} <span class="mono" style="opacity:.7">(${esc(b.divName)}) — Année ${b.year} — ${b.defenses} défense(s)</span></div>`).join('')}</div>`:''}
   ${f.biggestRival?`<div class="card mb"><div class="eyebrow mb">⚔ Plus grand rival</div><div class="small" style="color:var(--blood)">${esc(f.biggestRival.name)} ${f.biggestRival.flag} — ${f.biggestRival.count} confrontations</div></div>`:''}
   ${f.notableWins&&f.notableWins.length?`<div class="card mb"><div class="eyebrow mb">🏅 Adversaires notables battus</div>${f.notableWins.map(h=>`<div class="small muted" style="padding:4px 0">${esc(h.oppName)} ${h.oppFlag||''} <span class="mono" style="opacity:.7">(${h.oppRecord||'?'}) — ${h.method}</span></div>`).join('')}</div>`:''}
   ${f.nicknameHistory&&f.nicknameHistory.length?`<div class="card mb"><div class="eyebrow mb">Historique des surnoms</div>${f.nicknameHistory.map(n=>`<div class="small muted" style="padding:4px 0">« ${esc(n)} »</div>`).join('')}</div>`:''}
   ${f.signatureMove?`<div class="card mb" style="border-left:3px solid var(--gold-d)"><div class="eyebrow gold mb">${SVG.star} Mouvement Signature</div><b style="color:var(--gold)">${esc(f.signatureMove.customSuffix?`${f.signatureMove.name} ${f.signatureMove.customSuffix}`:f.signatureMove.name)}</b></div>`:''}
   ${f.earnedAchievements&&f.earnedAchievements.length?`<div class="card mb"><div class="eyebrow mb">Succès obtenus (${f.earnedAchievements.length}/${ACH.length})</div>${f.earnedAchievements.map(id=>{const a=ACH.find(x=>x.id===id); return a?`<div class="ach"><span class="ico" style="display:flex;align-items:center;color:var(--gold)">${a.ico}</span><span><b class="gold">${a.h}</b><div class="muted small">${a.d}</div></span></div>`:'';}).join('')}</div>`:''}
   <button class="btn ghost mt" style="width:auto;padding:6px 12px;font-size:12px" onclick="CL.exportLegend('${f.id}')">Exporter (partager avec un ami)</button>
   <button class="btn ghost" onclick="CL.go('hof')">Retour au Panthéon</button></div>`;
}
// ==== [ANCRE: SYSTEME_CLASSES] (rendu) — bug bloquant corrigé : même
// symptôme que scr_legend_detail juste au-dessus. Le routeur référence
// scr_class_choice pour l'écran 'class_choice' (levé par classOffer en
// ui-05, résolu par CL.chooseClass() déjà présent dans ui-08), mais aucune
// fonction de ce nom n'existait -> ReferenceError au chargement -> page
// blanche. fx est en échelle brute /100 (25/15/-15 depuis le rééquilibrage
// Bug #8) : affiché divisé par 5 pour matcher la note /20 (+5/+3/-3), comme
// pour tout le reste de l'UI (voir d20()).
function scr_class_choice(){
  const f=G.f; const pool=CLASSES[f.style]||[];
  return `<div class="scr center intro">
   <div class="eyebrow gold">Choix de Classe</div>
   <h2 class="disp">Une spécialisation définitive</h2>
   <p class="lede">À 23 ans, chaque combattant choisit une identité qui le suivra pour le reste de sa carrière. Ce choix ne pourra jamais être changé.</p>
   ${pool.map((cls,idx)=>{
     const fits=(()=>{ try{ return cls.fit(f); }catch(e){ return false; } })();
     const deltaTags=Object.entries(cls.fx||{}).map(([k,v])=>{
       const shown=Math.sign(v)*Math.max(1,Math.round(Math.abs(v)/5));
       return `<span class="dlt ${v>=0?'up':'dn'}">${shown>0?'+':''}${shown} ${attrLabel(k)}</span>`;
     }).join('');
     return `<div class="glass card mt" style="text-align:left;background:var(--panel2);border:1px solid var(--line);padding:16px">
       <b style="font-size:17px;color:var(--gold)">${cls.lbl}</b>
       <div class="story mt" style="font-style:italic">« ${cls.desc} »</div>
       <div class="dlts mt">${deltaTags}</div>
       <div class="mono small mt" style="color:${fits?'var(--win)':'var(--muted)'}">${fits?'✓ Correspond à ton parcours jusqu\u2019ici':'Ne correspond pas particulièrement à ton style actuel — reste un choix valide.'}</div>
       <button class="btn primary mt" onclick="CL.chooseClass(${idx})">Choisir « ${cls.lbl} » — définitif</button>
     </div>`;
   }).join('')}
   <button class="btn ghost mt" onclick="G._profileReturn='class_choice';CL.go('profile')">Voir la fiche complète du combattant</button>
  </div>`;
}
// ==== [ANCRE: SYSTEME_CLASSES_31] (rendu) — même structure que
// scr_class_choice() ci-dessus, mais le pool vient de CLASSES_31[style][f.class]
// (dépend du choix fait à 23 ans, jamais du style seul). f.class est garanti
// non-null ici : class31Offer (ui-05) ne se lève que si classChosen est déjà
// vrai. Filet de sécurité quand même (pool vide) pour ne jamais planter sur
// une sauvegarde où class31Offer aurait été levé sans classChosen valide.
function scr_class_choice_31(){
  const f=G.f; const pool=(CLASSES_31[f.style]&&CLASSES_31[f.style][f.class])||[];
  const parentCls=(CLASSES[f.style]||[]).find(c=>c.id===f.class);
  if(!pool.length){
    return `<div class="scr center intro">
     <div class="eyebrow gold">Choix de Classe (31 ans)</div>
     <p class="lede">Aucune spécialisation complémentaire disponible pour ce profil.</p>
     <button class="btn ghost mt" onclick="CL.go('hub')">Retour au vestiaire</button>
    </div>`;
  }
  return `<div class="scr center intro">
   <div class="eyebrow gold">Choix de Classe — 31 ans</div>
   <h2 class="disp">Une seconde spécialisation, définitive elle aussi</h2>
   <p class="lede">À 31 ans, l\u2019identité choisie à 23 ans${parentCls?' (« '+parentCls.lbl+' »)':''} se prolonge et se précise. Ce choix ne pourra jamais être changé.</p>
   ${pool.map((cls,idx)=>{
     const fits=(()=>{ try{ return cls.fit(f); }catch(e){ return false; } })();
     const deltaTags=Object.entries(cls.fx||{}).map(([k,v])=>{
       const shown=Math.sign(v)*Math.max(1,Math.round(Math.abs(v)/5));
       return `<span class="dlt ${v>=0?'up':'dn'}">${shown>0?'+':''}${shown} ${attrLabel(k)}</span>`;
     }).join('');
     return `<div class="glass card mt" style="text-align:left;background:var(--panel2);border:1px solid var(--line);padding:16px">
       <b style="font-size:17px;color:var(--gold)">${cls.lbl}</b>
       <div class="story mt" style="font-style:italic">« ${cls.desc} »</div>
       <div class="dlts mt">${deltaTags}</div>
       <div class="mono small mt" style="color:${fits?'var(--win)':'var(--muted)'}">${fits?'✓ Correspond à ton parcours jusqu\u2019ici':'Ne correspond pas particulièrement à ton style actuel — reste un choix valide.'}</div>
       <button class="btn primary mt" onclick="CL.chooseClass31(${idx})">Choisir « ${cls.lbl} » — définitif</button>
     </div>`;
   }).join('')}
   <button class="btn ghost mt" onclick="G._profileReturn='class_choice_31';CL.go('profile')">Voir la fiche complète du combattant</button>
  </div>`;
}
function scr_result(){ const p=G.pending,f=G.f,st=p.res.stats;
  let judgesHtml='';
  if(isDecisionLike(p.method) && !p.res.judges && p.res.scoreA!==undefined){
    judgesHtml=`<div class="card gold-b" style="text-align:center"><div class="eyebrow mb">Pointage (total)</div><div class="disp" style="font-size:22px">${p.res.scoreA} – ${p.res.scoreB}</div></div>`;
  } else if(isDecisionLike(p.method) && p.res.judges){
    const J=p.res.judges;
    judgesHtml=`<div class="card gold-b" style="text-align:center">
      <div class="eyebrow mb">Score des juges (10-point must)</div>
      <div class="duel2" style="justify-content:center;gap:16px">
        <span class="num ${J.j1[0]>J.j1[1]?'a':(J.j1[0]===J.j1[1]?'b':'dn')}">${J.j1[0]}-${J.j1[1]}</span>
        <span class="num ${J.j2[0]>J.j2[1]?'a':(J.j2[0]===J.j2[1]?'b':'dn')}">${J.j2[0]}-${J.j2[1]}</span>
        <span class="num ${J.j3[0]>J.j3[1]?'a':(J.j3[0]===J.j3[1]?'b':'dn')}">${J.j3[0]}-${J.j3[1]}</span>
      </div>
      <div class="hr"></div>
      <div class="mono small muted" style="text-align:left;font-size:10px">
        <div style="display:flex;justify-content:space-between;color:var(--text);margin-bottom:4px"><span>RND</span><span>J1</span><span>J2</span><span>J3</span><span>SIG</span><span>TD</span><span>KD</span></div>
        ${(p.res.roundStats||[]).map(rs=>`<div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid var(--line)">
          <span style="color:var(--gold)">R${rs.r}</span><span>${rs.j1[0]}-${rs.j1[1]}</span><span>${rs.j2[0]}-${rs.j2[1]}</span><span>${rs.j3[0]}-${rs.j3[1]}</span><span>${rs.sigA}-${rs.sigB}</span><span>${rs.tdA}-${rs.tdB}</span><span>${rs.kdA}-${rs.kdB}</span>
        </div>`).join('')}
      </div></div>`;
  }
  let campHtml='';
  if(p.camp && p.camp.deltas.length){
    const rows=p.camp.deltas.map(d=>{
      if(Array.isArray(d)){ const scaled=Math.sign(d[1])*Math.max(1,Math.round(Math.abs(d[1])/5)); return `<span class="dlt ${d[1]>=0?'up':'dn'}">${scaled>0?'+':''}${scaled} ${d[0]}</span>`; }
      const b20=d20(d.before), a20=d20(d.after);
      if(b20===a20) return '';
      return `<span class="dlt ${a20>=b20?'up':'dn'}">${d.label} : ${b20} ➔ ${a20}</span>`;
    }).filter(Boolean);
    if(rows.length) campHtml=`<div class="card"><div class="eyebrow mb">Évolution (sur 20)</div><div class="dlts">${rows.join('')}</div></div>`;
  }
  return `<div class="scr">
   <div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--line);padding:16px;margin-bottom:20px;text-align:center">
     <div class="meta-strip" style="justify-content:center">${f.flag} ${esc(f.name)} vs ${p.opp.flag} ${esc(p.opp.name)}</div>
     <div class="hero-name" style="color:${p.isFantasy||p.isVsFriend?(p.res.winner==='D'?'var(--gold)':(p.win?'var(--blood)':'#4DA6FF')):(p.win?'var(--win)':(p.res.winner==='D'?'var(--gold)':'var(--loss)'))}">${(p.isFantasy||p.isVsFriend)?(p.res.winner==='D'?'ÉGALITÉ':`${esc(p.win?f.name:p.opp.name)} gagne par ${p.method}`):(p.win?'VICTOIRE':(p.res.winner==='D'?'ÉGALITÉ':'DÉFAITE'))}<em style="color:var(--muted)">${(p.isFantasy||p.isVsFriend)?'':p.method}${p.res.round?' · Round '+p.res.round:''}</em></div>
     <div class="tagrow" style="justify-content:center">
       ${(p.res.moveName && !isDecisionLike(p.method))?(()=>{
         const typeStr=p.method.startsWith('KO')?'KO/TKO':'Soumission';
         // ==== [ANCRE: DETECTION_ZONE_REDONDANTE] — élargie aux synonymes
         // anatomiques (ex. "plexus"/"menton" pour la zone "corps"/"tête") :
         // avant, seule une correspondance texte EXACTE du mot de zone
         // évitait le doublon d'affichage (ex. "Chassé frontal (teep) au
         // plexus — CORPS", redondant car "plexus" ET "corps" désignent la
         // même zone sans que le mot "corps" apparaisse littéralement).
         const ZONE_SYNONYMS={'tête':['tête','tete','menton','crâne','crane','visage','mâchoire','machoire','tempe'],
           'corps':['corps','plexus','foie','côtes','cotes','ventre','tronc','flanc'],
           'jambes':['jambe','tibia','genou','cuisse','mollet','cheville']};
         const synonyms=(p.res.zone && ZONE_SYNONYMS[p.res.zone])||[p.res.zone];
         const moveNameLower=p.res.moveName.toLowerCase();
         const zoneRedundant=p.res.zone && synonyms.some(s=>moveNameLower.includes(s));
         const zoneDetail=(p.res.zone && !zoneRedundant)?` — ${p.res.zone}`:'';
         return `<span class="tag2 hot">${typeStr} (${esc(p.res.moveName)})${zoneDetail}</span>`;
       })():''}
       ${p.planLabel?`<span class="tag2">Tactique : ${p.planLabel}</span>`:''}
     </div>
     ${p.res.moveFlavor?(()=>{ const isSig=p.res.moveFlavor.includes('MOUVEMENT SIGNATURE'); return `<div class="${isSig?'':'muted'} small mt" style="font-style:italic;${isSig?'color:var(--gold);font-weight:bold;font-style:normal':''}">${esc(p.res.moveFlavor)}</div>`; })():''}
     ${p.nickEvoHtml?`<div class="small mt" style="font-style:italic">${p.nickEvoHtml}</div>`:''}
   </div>
   ${judgesHtml}
   ${p.milestone?`<div class="card gold-b"><div class="disp" style="font-size:19px">${p.milestone}</div></div>`:''}
   ${p.skill?`<div class="card"><div class="skill-unlock">✨ Compétence débloquée : <b style="color:${RAR_COLORS[p.skill.rar]||'var(--gold)'}">${p.skill.name}</b><div class="muted small">${p.skill.desc||p.skill.blurb||''}</div>${p.skill.fx?`<div class="mono small mt">${Object.entries(p.skill.fx).map(([k,v])=>{const label=(ALL_ATTR.find(a=>a[0]===k)||[k,k])[1]; const after=d20(f.attrs[k]); const realBefore=p.skill._realBefore&&p.skill._realBefore[k]!==undefined?p.skill._realBefore[k]:(f.attrs[k]-v); const before=d20(realBefore);
   /* ==== [ANCRE: CORRECTIF_GAIN_MASQUE_ARRONDI] — bug remonté : d20()
      arrondit /100->/20 (Math.round(v/5)), donc un petit gain interne réel
      peut ne franchir aucun palier affiché et ressortir "17 -> 17", identique
      à un gain nul (clamp au plafond), sans que le joueur puisse distinguer
      les deux cas. On annote explicitement quand un gain a bien eu lieu mais
      ne se voit pas sur l'échelle affichée. ==== */
   const noVisibleGain=before===after && f.attrs[k]>realBefore;
   return `<div style="color:var(--win)">${before} → ${after} ${label}${noVisibleGain?' <span class="muted" style="font-size:10px">(gain interne minime)</span>':''}</div>`;}).join('')}</div>`:''}</div></div>`:''}
   <div class="card stats-card"><div class="eyebrow mb">Statistiques du combat</div>
     <div class="st-row"><span>${st.A.sig}</span><span class="st-l">Frappes sig.</span><span>${st.B.sig}</span></div>
     <div class="st-row"><span>${st.A.td}</span><span class="st-l">Amenées</span><span>${st.B.td}</span></div>
     <div class="st-row"><span>${formatCtrl(st.A.ctrl||0)}</span><span class="st-l">Temps de contrôle</span><span>${formatCtrl(st.B.ctrl||0)}</span></div>
     <div class="st-row"><span>${st.A.kd}</span><span class="st-l">Knockdowns</span><span>${st.B.kd}</span></div></div>
   ${p.purseDetail?`<div class="card"><div class="eyebrow mb">Bourse</div>
     <div class="mono small" style="display:flex;justify-content:space-between"><span class="muted">Bourse brute</span><span>${formatArgent(p.purseDetail.gross)}</span></div>
     <div class="mono small" style="display:flex;justify-content:space-between"><span class="muted">Frais de camp (manager, coach, salle)</span><span style="color:var(--loss)">-${formatArgent(p.purseDetail.fee)}</span></div>
     ${p.purseDetail.agentFee?`<div class="mono small" style="display:flex;justify-content:space-between"><span class="muted">Part de l\u2019agent (${Math.round((f.agentCut||0)*100)}%)</span><span style="color:var(--loss)">-${formatArgent(p.purseDetail.agentFee)}</span></div>`:''}
     <div class="mono small" style="display:flex;justify-content:space-between;margin-top:4px"><b>Net perçu</b><b class="gold">${formatArgent(p.purseDetail.net)}</b></div></div>`:''}
   <div class="card"><div class="eyebrow mb">Déroulé</div>${fightLog(p.res)}</div>
   ${campHtml}
   ${p.newAch&&p.newAch.length?`<div class="card">${p.newAch.map(a=>`<div class="ach"><span class="ico">${a.ico}</span><b class="gold">${a.h}</b> <span class="muted small">${a.d}</span></div>`).join('')}</div>`:''}
   ${p.narrative?`<div class="card glass narr" style="background:var(--panel2);padding:16px"><blockquote>« ${p.narrative.txt(f)} »</blockquote><cite>${p.narrative.src}</cite></div>`:''}
   ${ghostComparisonHtml()}
   <button class="btn primary" onclick="CL.${p.forced?'toLegacy':'afterResult'}()">${p.forced?'Voir mon palmarès':'Continuer'}</button></div>`; }
/* ==== [ANCRE: GAUNTLET_FANTOME] — ajout #5 (24 ajouts, 12/08/2026) : compare
   le combat qui vient de se jouer à la même position dans la MEILLEURE run
   connue du joueur sur ce même archétype/mode/palier (meta.gauntletGhostLog,
   state.js). N'affiche rien tant qu'aucun record n'existe encore (première
   run sur cette combinaison) — le message par défaut (narrative ci-dessus,
   ou rien) reste seul visible, comme demandé. Même habillage visuel
   (.card.glass.narr) que le bloc de citation d'ambiance juste au-dessus,
   pour rester dans le même bloc visuel de bas d'écran. ==== */
function ghostComparisonHtml(){
  if(!G.arcade || !G.arcade.active) return '';
  const meta=loadMetaStats();
  const ghostLog=gauntletGhostLogGet(meta,G.arcade.mode,G.arcade.asc||0,G.f.nick);
  if(!ghostLog || !ghostLog.length) return '';
  const pos=(G.arcade.ghostFights||[]).length;
  const ghost=ghostLog[pos-1];
  const cur=G.arcade.ghostFights&&G.arcade.ghostFights[pos-1];
  if(!ghost || !cur) return '';
  const curDmg=cur.dmgHead+cur.dmgBody+cur.dmgLegs, ghostDmg=ghost.dmgHead+ghost.dmgBody+ghost.dmgLegs;
  const lines=[];
  if(curDmg!==ghostDmg) lines.push(`${curDmg<ghostDmg?'Moins':'Plus'} de dégâts encaissés qu\u2019à ce stade de ta meilleure run (${curDmg} contre ${ghostDmg}).`);
  if(cur.td!==ghost.td) lines.push(`${cur.td>ghost.td?'Plus':'Moins'} d\u2019amenées au sol qu\u2019à ce stade de ta meilleure run (${cur.td} contre ${ghost.td}).`);
  if(cur.kd!==ghost.kd) lines.push(`${cur.kd>ghost.kd?'Plus':'Moins'} de knockdowns qu\u2019à ce stade de ta meilleure run (${cur.kd} contre ${ghost.kd}).`);
  if(!lines.length) lines.push('Exactement le même rythme qu\u2019à ce stade de ta meilleure run.');
  return `<div class="card glass narr" style="background:var(--panel2);padding:16px;border-left:3px solid var(--gold-d)">
    <div class="eyebrow gold mb">${SVG.star} Le Fantôme — combat ${pos}</div>
    ${lines.map(l=>`<div class="small muted" style="padding:2px 0">${l}</div>`).join('')}
  </div>`;
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: CARTE_MOUVEMENT_SIGNATURE] — met en avant le geste devenu
   signature (5 finitions identiques, cf. pickFinishMove dans engine.js) : ce
   bonus existait déjà mécaniquement (+6 sur 2 attributs) mais n'était visible
   nulle part dans l'interface — corrigé ici avec un encart dédié dans la
   fiche complète, affichant le geste ET les gains concrets qu'il a apportés. ==== */
/* ==== [ANCRE: BADGE_CHAMPION] — remplace l'ancien bonus chiffré de champion
   (retiré du score de classement, item demandé) par un badge purement
   informatif dans le bilan technique : ceinture(s), organisation, et statut
   actuel/ancien clairement précisé. ==== */
function championBadgeCard(f){
  const badges=[];
  if(f.champion){
    badges.push({label:`Champion ${orgDisplayName(f)} — ${f.divName}`,status:'Titre actuel',current:true});
  }
  if(f.champChampBelt){
    badges.push({label:`Champion ${orgDisplayName(f)} — ${f.champChampBelt}`,status:'Titre actuel (double couronne)',current:true});
  }
  if(!f.champion && !f.champChampBelt && (f.titles||0)>0){
    badges.push({label:`${f.titles} règne(s) de champion à son actif`,status:'Titre(s) ancien(s) — ceinture perdue ou abandonnée',current:false});
  }
  if(!badges.length) return '';
  return `<div class="card mt grain" style="position:relative;z-index:2;background:var(--panel2);border:1px solid ${badges.some(b=>b.current)?'var(--gold)':'var(--line)'};padding:14px;text-align:left">
    <div class="eyebrow mb" style="color:${badges.some(b=>b.current)?'var(--gold)':'var(--muted)'}">${SVG.crown} Statut de championnat</div>
    ${badges.map(b=>`<div class="mono small" style="margin-top:4px"><b style="color:${b.current?'var(--gold)':'var(--muted)'}">${b.status}</b> — ${esc(b.label)}</div>`).join('')}
  </div>`;
}
function signatureMoveCard(f){
  if(!f.signatureMove) return '';
  const sm=f.signatureMove;
  /* ==== [ANCRE: CORRECTIF_BOOST_SIGNATURE_AFFICHAGE] — bug trouvé : la fiche
     recalculait un boost générique (submission+killer / power+killer pour
     tout), ignorant la zone, alors que engine.js applique
     SIGNATURE_BOOST_BY_ZONE depuis ANCRE CORRECTIF_BOOST_SIGNATURE_
     DIFFERENCIE. Même table, même constante SIGNATURE_BOOST_PTS que
     l'engine : le texte affiché correspond désormais au boost réellement
     appliqué. ==== */
  const boostKeys=(SIGNATURE_BOOST_BY_ZONE[sm.type]&&SIGNATURE_BOOST_BY_ZONE[sm.type][sm.zone])||(sm.type==='sub'?['submission','killer']:['power','killer']);
  const boostTxt=boostKeys.map(k=>{ const lbl=(ALL_ATTR.find(a=>a[0]===k)||[k,k])[1]; return `+${Math.max(1,Math.round(SIGNATURE_BOOST_PTS/5))} ${lbl}`; }).join(', ');
  const typeLbl=sm.type==='sub'?'Soumission':'KO';
  /* ==== [ANCRE: PRISE_SIGNATURE_NOMMEE] — ajout #1 (24 ajouts, 12/08/2026) :
     tant que le joueur n'a pas validé (sm.locked===true), un champ libre
     permet de taper un complément qui s'ajoute au nom de base (jamais ne le
     remplace) — aperçu mis à jour lettre par lettre via CL.setSignatureSuffix
     (render(true) : préserve le scroll, cf. pattern CL.setGauntletSeed).
     Une fois validé (CL.lockSignatureSuffix), le champ disparaît et le nom
     complet est figé définitivement. ==== */
  const fullName=sm.customSuffix?`${sm.name} ${sm.customSuffix}`:sm.name;
  const namingHtml=sm.locked?'':`<div class="mt" style="text-align:left">
      <div class="muted small mb">Donne un nom complet à ta prise signature (le nom de base reste toujours affiché) :</div>
      <div class="mono" style="color:var(--gold);font-size:15px;margin-bottom:6px">Aperçu : ${esc(sm.name)}${sm._draftSuffix?' '+esc(sm._draftSuffix):''}</div>
      <input maxlength="24" placeholder="ex. de Marseille, du Valhalla" value="${esc(sm._draftSuffix||'')}" oninput="CL.setSignatureSuffix(this.value)">
      <button class="btn primary" style="margin-top:8px;padding:8px 14px;font-size:13px" onclick="CL.lockSignatureSuffix()" ${sm._draftSuffix&&sm._draftSuffix.trim()?'':'disabled'}>Valider (définitif)</button>
    </div>`;
  return `<div class="card mt" style="position:relative;z-index:2;background:var(--panel2);border:1px solid var(--gold-d);padding:14px;text-align:left">
    <div class="eyebrow gold mb">${SVG.star} Mouvement Signature</div>
    <b style="font-size:17px;color:var(--gold)">${esc(fullName)}</b> <span class="muted small">(${typeLbl})</span>
    <div class="muted small mt">40 % de chances de conclure par ce geste à chaque finition.</div>
    <div class="mono small mt" style="color:var(--win)">Effets acquis : ${boostTxt}</div>
    ${namingHtml}
  </div>`;
  /* ==== [FIN ANCRE] ==== */
}
/* ==== [ANCRE: CORRECTIF_RETOUR_FICHE_PROFIL] — bug trouvé : G._profileReturn
   était nullé dès le rendu de l'écran, pas au moment de la sortie. Tout
   render() déclenché pendant que la fiche est ouverte (ex. CL.theme())
   écrasait donc la cible et renvoyait au hub au lieu de class_choice/
   class_choice_31 — sortie latérale sur un choix bloquant non résolu. Le
   nullage est déplacé sur les deux points de sortie réels (✕ et Retour). ==== */
function scr_profile(){ const f=G.f; const g=groupAvg(f); const backScreen=G._profileReturn||(G.faith?'faith_hub':'hub');
  /* ==== [ANCRE: LISIBILITE_FICHE_TECHNIQUE] — item demandé : la jauge .gauge
     (flex:1, cf. index.html) n'avait quasi aucune largeur disponible dans le
     layout Mental/Physique côte à côte (2 colonnes de ~150px sur mobile,
     .attr-l prenant 120px fixes + .attr-v 26px fixes) — la barre était
     réduite à quelques pixels, fonctionnellement invisible. Mental et
     Physique passent en pleine largeur, empilés comme Technique (déjà en
     hero), ce qui résout le manque de place à la source plutôt que de
     compresser le contenu davantage. `flex:1` sur .card (hérité du layout en
     ligne d'origine) est retiré : sans conteneur flex-row, il ne servait qu'à
     forcer les deux cartes à la même hauteur artificielle. ==== */
  /* ==== [ANCRE: ATTRIBUTS_EXPLIQUES] — retour utilisateur : le dépliant
     global affichait les 30 définitions d'un coup et rallongeait beaucoup
     trop la fiche. On clique désormais sur UNE ligne pour lire sa
     définition, et elle seule ; recliquer la referme. La fiche garde
     exactement sa longueur d'origine tant qu'on ne demande rien. ==== */
  const aide=G._attrHelp;
  const grp=(key,title,avg,hero)=>`<div class="card" style="padding:${hero?'20':'14'}px 0"><div class="grp-h"><span class="disp" style="font-size:${hero?'22px':'15px'}">${title}</span><span class="gold mono" style="font-size:${hero?'16px':'13px'}">${d20(avg)}/20</span></div>
     ${ATTR[key].map(a=>`<div class="attr" style="${hero?'':'font-size:12px'};cursor:pointer" onclick="CL.toggleAttrHelp('${a[0]}')"><span class="attr-l">${a[1]}</span>${gauge(f.attrs[a[0]])}<span class="attr-v">${d20(f.attrs[a[0]])}</span></div>${aide===a[0]?`<div class="muted" style="font-size:11px;padding:2px 12px 8px;line-height:1.35">${attrHelp(a[0])}</div>`:''}`).join('')}</div>`;
  return `<div class="scr"><div class="bar"><span class="eyebrow">Fiche complète</span><span class="eyebrow x" onclick="G._profileReturn=null;CL.go('${backScreen}')">✕</span></div>
   <div class="muted small mb">Touche une ligne pour savoir ce qu\u2019elle mesure.</div>
   <div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--line);padding:16px;margin-bottom:20px">
     <div class="meta-strip"><div><span>Division</span><b>${f.divName}</b></div><div><span>Taille</span><b>${f.phys.height}cm</b></div><div><span>Allonge</span><b>${f.phys.reach}cm</b></div></div>
     <div class="hero-name">${esc(f.name)} ${f.flag}<em>${f.nick?`« ${f.nick} » — `:''}${f.styleLabel}, ${f.age} ans</em></div>
     <div class="story" style="position:relative;z-index:2;margin-top:10px"><b>Origine.</b> ${f.origin}.</div>
     <div class="story" style="position:relative;z-index:2"><b>Se bat pour.</b> ${f.motivation}.</div>
     ${(f.faithTraits && f.faithTraits.length)?`<div class="story" style="position:relative;z-index:2;color:var(--blood)"><b>Traits de caractère.</b> ${f.faithTraits.join(', ')}.</div>`:''}
     ${(f.amaTitles&&f.amaTitles.length)?`<div class="tagrow">${f.amaTitles.map(id=>{const cfg=AMA_CHAMPIONSHIPS.find(c=>c.id===id); return cfg?`<span class="tag2 hot">Champion ${cfg.label}</span>`:'';}).join('')}</div>`:''}
     ${championBadgeCard(f)}
     ${signatureMoveCard(f)}
     ${f.skills.length?(()=>{
       const rarOrder={C:0,R:1,E:2,L:3,M:4,X:5};
       const sorted=f.skills.filter(id=>SKILLS.some(s=>s.id===id)).slice().sort((a,b)=>{
         const sa=SKILLS.find(s=>s.id===a), sb=SKILLS.find(s=>s.id===b);
         return (rarOrder[sa.rar]??9)-(rarOrder[sb.rar]??9);
       });
       // hash déterministe simple : même tag = même couleur, sans mapping manuel sur 640 compétences
       const tagColor=t=>{ let h=0; for(let i=0;i<t.length;i++) h=(h*31+t.charCodeAt(i))>>>0;
         const palette=['var(--win)','var(--gold)','var(--loss)']; return palette[h%palette.length]; };
       return `<div class="story" style="position:relative;z-index:2;margin-top:10px"><b>Compétences.</b> <span class="muted small">(clique pour le détail)</span></div>`+
         sorted.map((id,i)=>{const sk=SKILLS.find(s=>s.id===id);
           const fxTxt=sk.fx?Object.entries(sk.fx).map(([k,v])=>{const label=(ALL_ATTR.find(a=>a[0]===k)||[k,k])[1]; return `+${Math.max(1,Math.round(v/5))} ${label}`;}).join(', '):'';
           return `<div style="margin:4px 0;position:relative;z-index:2">
             <div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px;cursor:pointer" onclick="const d=document.getElementById('skdet${i}'); d.style.display=d.style.display==='none'?'block':'none';">
               <span class="story" style="margin:0;color:${RAR_COLORS[sk.rar]||'var(--gold)'}">${sk.name}</span>
               ${(sk.tags||[]).map(t=>`<span class="tag" style="color:${tagColor(t)};border-color:${tagColor(t)}">${t}</span>`).join('')}
             </div>
             <div id="skdet${i}" class="muted small" style="display:none;margin:4px 0 0 0;padding-left:8px;border-left:2px solid var(--line)">${sk.desc||''}${fxTxt?`<div class="mono" style="color:var(--win);margin-top:2px">${fxTxt}</div>`:''}</div>
           </div>`;}).join('');
     })():''}
   ${f.skills.length?`<div class="rarity-guide" style="margin-top:12px"><span><i style="background:${RAR_COLORS.C}"></i> Commune</span><span><i style="background:${RAR_COLORS.R}"></i> Rare</span><span><i style="background:${RAR_COLORS.E}"></i> Épique</span><span><i style="background:${RAR_COLORS.L}"></i> Légendaire</span><span><i style="background:${RAR_COLORS.M}"></i> Mythique</span></div>`:''}
   </div>
   ${grp('tech','Technique',g.tech,true)}
   <div style="display:flex;flex-direction:column;gap:16px">${grp('ment','Mental',g.ment,true)}${grp('phys','Physique',g.phys,true)}</div>
   <button class="btn ghost" onclick="G._profileReturn=null;CL.go('${backScreen}')">Retour</button></div>`; }

function scr_rankings(){ const f=G.f; const dr=rankPool(G.roster.concat([f]));
  let h=`<div class="scr">
   <div class="bar" style="border-bottom:2px solid var(--line);margin-bottom:24px;padding-bottom:8px">
     <span class="eyebrow mono" style="letter-spacing:.1em">BASE DE DONNÉES // ${orgDisplayName(f).toUpperCase()} // ${f.divName.toUpperCase()}</span>
   </div>
   <div style="display:flex;border-bottom:1px solid var(--text);padding-bottom:4px;margin-bottom:8px;font-size:11px;color:var(--muted)" class="mono">
     <div style="width:32px">RANG</div><div style="flex:1">IDENTITÉ</div><div style="width:82px;text-align:right">RECORD</div><div style="width:70px;text-align:right">STATUT</div>
   </div>`;
  // ==== [ANCRE: CORRECTIF_NUMEROTATION_CLASSEMENT] — bug trouvé : le rang
  // affiché utilisait l'index brut dans le pool (qui inclut le champion à la
  // 1re place), donc le premier VRAI challenger affichait "#2" au lieu de
  // "#1" — la numérotation sautait le 1. Un compteur dédié aux non-champions
  // redémarre proprement à 1 (item demandé : C, puis 1, 2... jusqu'à 15).
  const hasChampInPool=dr.some(o=>o.champion);
  let contenderRank=0;
  dr.slice(0,hasChampInPool?16:15).forEach((o,i)=>{ const isPlayer=(o===f);
    if(!o.champion) contenderRank++;
    const rank=contenderRank;
    let arrow='–'; let arrowColor='var(--muted)';
    if(o.lastRankDelta>0){arrow='▲';arrowColor='var(--win)';} if(o.lastRankDelta<0){arrow='▼';arrowColor='var(--loss)';}
    const fightsTot=o.W+o.L+(o.D||0);
    const statusStr=o.champion?'CHAMPION':(fightsTot===0?'NR':arrow);
    const rowBg=isPlayer?'background:var(--text);color:var(--bg)':'';
    h+=`<div style="display:flex;align-items:center;padding:10px 0;border-bottom:1px dotted var(--line);font-size:15px;${rowBg}">
      <div class="mono" style="width:32px;font-size:15px;${o.champion&&!isPlayer?'color:var(--gold)':''}">${o.champion?'C':rank}</div>
      <div style="flex:1;display:flex;flex-direction:column">
        <span class="disp" style="font-size:17px;line-height:1.1">${esc(o.name)} ${o.flag}${isPlayer?' <span class="mono" style="font-size:11px">(TOI)</span>':''}</span>
        <span class="mono" style="font-size:10.5px;opacity:.7">${(o.styleLabel||'').toUpperCase()}</span>
      </div>
      <div class="mono" style="width:82px;text-align:right;font-size:14px;white-space:nowrap">${o.W}-${o.L}${o.D?'-'+o.D:''}</div>
      <div class="mono" style="width:70px;text-align:right;font-size:10.5px;opacity:.7;${!o.champion?('color:'+arrowColor):''}">${statusStr}</div>
    </div>`;
  });
  h+=`<button class="btn ghost mt" style="border:none" onclick="CL.go('${G.faith?'faith_hub':'hub'}')">← Revenir au hub</button></div>`;
  return h;
}

function scr_event(){ const ev=G.activeEvent;
  return `<div class="scr center" style="display:flex;flex-direction:column;justify-content:center;min-height:80vh"><div class="eyebrow blood">Événement imprévu</div>
   <div class="hero-name" style="text-align:center;font-size:clamp(26px,8vw,36px)">${ev.title}</div>
   <div class="glass card" style="position:relative;background:var(--panel2);text-align:left;padding:16px;margin:16px 0"><p class="lede" style="margin:0;text-align:left;max-width:100%">${ev.text}</p>${ev.effectsHtml||''}</div>
   <button class="btn primary" onclick="CL.handleEvent('${ev.actionId}')">${ev.btn}</button>
   ${ev.btn2?`<button class="btn ghost mt" onclick="CL.handleEvent('${ev.actionId2}')">${ev.btn2}</button>`:''}</div>`; }

/* ==== [ANCRE: ECRAN_SAISON] — 'eval' renommé en 'seasonEval' : mot réservé en
   mode strict, une déclaration const eval=... provoque une SyntaxError. ==== */
function scr_season(){ const f=G.f; const sData=G.season||{year:1,fights:[]};
  const seasonEval=evaluateSeason(f,sData.fights); const s=seasonEval.stats;
  return `<div class="scr center intro"><div class="eyebrow gold">Bilan Saisonnier</div>
   <div class="hero-name" style="text-align:center">Année ${sData.year}<em style="color:var(--muted)">${s.W} V — ${s.L} D</em></div>
   <div class="glass card gold-b" style="margin:20px 0;background:var(--panel2)">
     <div class="tagrow" style="justify-content:center">
       <span class="tag2">${s.koW} KO</span><span class="tag2">${s.subW} SUB</span><span class="tag2">${s.decW} DÉC</span>
     </div>
     <div class="hr"></div>
     <div class="stat-band" style="justify-content:space-around;text-align:center">
       <div><span class="stat-big" style="font-size:24px">${s.sigMe}</span><span class="stat-lbl">Frappes</span></div>
       <div><span class="stat-big" style="font-size:24px">${s.tdMe}</span><span class="stat-lbl">Takedowns</span></div>
     </div>
   </div>
   <h3 class="disp" style="font-size:18px;color:var(--gold);margin-bottom:10px">Trophées de la Saison</h3>
   ${seasonEval.trophies.length>0?
     `<div class="tagrow" style="justify-content:center">${seasonEval.trophies.map(t=>`<span class="tag2 hot" style="display:inline-flex;align-items:center;gap:4px">${t.ico||SVG.medal} ${t.lbl}</span>`).join('')}</div>`
     : `<p class="muted small">Saison de transition. Aucun trophée majeur remporté cette année.</p>`}
   <button class="btn primary mt" onclick="CL.nextSeason()">Passer à l\u2019année suivante</button></div>`; }
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: SOMMET] — dilemme Pacific Championship (gloire) vs Ultimate Rim (argent+santé) ==== */
