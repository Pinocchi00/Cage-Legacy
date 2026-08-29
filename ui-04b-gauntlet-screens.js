"use strict";
/* CAGE LEGACY — js/ui-04b-gauntlet-screens.js
   ============================================================================
   Écrans du mode Arcade Gauntlet (draft, plan tactique, reveal de boss, hub
   d'arène, améliorations de camp, coaching entre rounds, game over ×3
   formats). Moitié Gauntlet de l'ancien ui-04-faith-arcade-screens.js
   (Fichier 4/8 du découpage de l'ancien ui.js monolithique).

   ==== [CORRECTIF FICHIER_SCINDE_FAITH_GAUNTLET] — second découpage,
   ultérieur au split en 8 fichiers (même logique que ui-09-arena.js,
   index.html) : voir l'en-tête de ui-04a-faith-screens.js pour le détail
   de la coupure. Ce fichier reprend tel quel le contenu Gauntlet d'origine
   (lignes 2325-fin de l'ancien fichier), sans toucher une ligne de code. ====

   IMPORTANT : aucune fonction n'a été déplacée ou réordonnée à l'intérieur
   de la moitié Gauntlet — seule une frontière de fichier a été insérée à la
   jonction Faith/Gauntlet. Ce fichier partage la même portée globale que le
   reste de l'ancien ui.js (variables et fonctions visibles d'un fichier à
   l'autre) ; il faut donc le charger APRÈS ui-04a-faith-screens.js et dans
   l'ordre indiqué dans index.html : 01, 02, 03, 04a, 04b, 05... jusqu'à 08.
   ============================================================================ */

/* ==== [ANCRE: REJOUABILITE_PERK_BADGE] — traduit f._styleProfileOverride
   (dérivé mécaniquement par deriveArcadeMods(), ui-03) en un badge lisible
   au draft. Sans ça, l'effet mécanique du perk resterait invisible pour le
   joueur — donc sans impact réel sur sa décision de sélection. ==== */
/* ==== [ANCRE: ITEM_BADGE_EQUILIBRE] — item demandé : « faire en sorte que
   chaque archétype à un descriptif » — VÉRIFIÉ AVANT CORRECTION : sur les 23
   archétypes de base (et les 7 étendus/débloquables), plusieurs ne
   franchissaient aucun des 5 seuils (koMod/subMod/sigVol/gnpDmg) et
   arcadePerkBadge() retournait ''. Repli honnête plutôt qu'abaisser les
   seuils existants (ce qui aurait dilué leur sens pour les autres) : un 6e
   badge neutre ÉQUILIBRÉ, affiché seulement quand aucun des 5 traits marqués
   ne s'applique. ==== */
function arcadePerkBadge(p){
  const m=p._styleProfileOverride; if(!m) return '';
  const tags=[];
  if(m.koMod>=1.35) tags.push({t:'FINISSEUR KO',c:'var(--gold)'});
  else if(m.koMod<=0.85) tags.push({t:'PEU DE PUISSANCE',c:'var(--muted)'});
  if(m.subMod>=1.3) tags.push({t:'FINISSEUR SOUMISSION',c:'var(--sage)'});
  if(m.sigVol>=1.25) tags.push({t:'GROS VOLUME',c:'var(--gold)'});
  if(m.gnpDmg>=1.2) tags.push({t:'SOL DANGEREUX',c:'var(--sage)'});
  if(!tags.length) tags.push({t:'ÉQUILIBRÉ',c:'var(--muted)'});
  /* ==== [ANCRE: CORRECTIF_BADGES_EMPILEMENT] — bug remonté : sur un
     archétype à 2 badges (ex. Le Surfer : PEU DE PUISSANCE + FINISSEUR
     SOUMISSION), l'absence de marge verticale entre les <span> faisait
     visuellement se toucher/chevaucher les badges quand ils passaient à la
     ligne (aucun flex-wrap avec gap, juste des spans inline avec
     margin-right seul). Ajout de margin-bottom sur chaque badge : suffisant
     pour créer un espacement propre au retour à la ligne, sans toucher au
     conteneur ni au CSS global. ==== */
  return `<div class="mono small mt" style="position:relative;z-index:2">${tags.map(x=>`<span style="display:inline-block;border:1px solid ${x.c};color:${x.c};padding:2px 8px;margin:0 6px 6px 0;border-radius:2px">${x.t}</span>`).join('')}</div>`;
}
/* ==== [FIN ANCRE] ==== */
function scr_draft(){ const pool=G.arcade.pool;
  if(!pool) return `<div class="scr center intro"><p class="lede">Aucun profil disponible.</p><button class="btn ghost mt" onclick="CL.go('title')">Retour</button></div>`;
  const isBoss=G.arcade.mode==='boss_run'; const isLadder=G.arcade.mode==='ladder_100';
  let h=`<div class="scr"><div class="bar" style="border-bottom:2px solid var(--line);margin-bottom:24px;padding-bottom:8px">
   <span class="eyebrow mono" style="color:var(--blood)">${isBoss?'BOSS RUN // 5 CHAMPIONS':isLadder?'WTUMMA // CLASSEMENT MONDIAL DES 100':'WTUMMA // WORLD TOURNAMENT'}</span></div>
   <p class="lede" style="margin-bottom:32px;font-size:15px">${isBoss?'Affrontez 5 champions d\u2019affilée. Finitions uniquement. La défaite est éliminatoire.':isLadder?'Vous commencez au rang #100. Défiez les combattants mieux classés pour voler leur place jusqu\u2019au sommet. La défaite est éliminatoire.':'Bracket à 64 combattants. Un OVR élevé vous donne une meilleure Seed, un OVR faible vous garantit l\u2019enfer.'}</p>
   <div class="mono small muted" style="margin:-20px 0 24px">Graine de la run : <b>${G.arcade.seed}</b>${(G.arcade.asc||0)>0?` · <span class="gold">Ascension ${G.arcade.asc}</span>`:''}</div>
   ${(()=>{ /* ==== [ANCRE: LISIBILITE_CONTRAT_PASSIF] — item demandé : contractBlock()
        rendait le contrat en entier ici, puis CL.selectDraft() (ui-08) navigue
        directement vers arcadehub où gauntletStatusBlock() le réaffiche déjà en
        entier (label, hint, ×mult), SANS qu'aucun combat n'ait eu lieu entre les
        deux écrans — le joueur lisait la même carte deux fois d'affilée. Ne
        garder ici qu'un repère d'une ligne, pour savoir qu'un contrat existe
        sans lire son détail deux fois. */
     const c=G.arcade.contract; if(!c) return '';
     return `<div class="mono small muted" style="margin:-16px 0 20px">${SVG.pact} Contrat de la run posé — détail au vestiaire une fois le profil choisi.</div>`;
   })()}
   <div style="height:16px"></div>`;
  pool.forEach((p,i)=>{
    /* ==== [ANCRE: ITEM_VITRINE_STAT_DYNAMIQUE] — item demandé : la case PUIS
       était en surbrillance dorée EN PERMANENCE, quel que soit l'archétype —
       Le Fantôme (power 50, la plus faible de son propre profil) affichait
       donc sa stat la moins pertinente comme point fort. La surbrillance
       suit maintenant la vraie meilleure valeur parmi les 4 cases affichées
       (gold, même convention que le reste de l'écran) et la plus faible
       ressort en rouge (var(--loss), même code couleur que les malus
       ailleurs dans le Gauntlet) — sur ces 4 agrégats seulement, pas sur les
       20 attributs bruts, pour rester lisible dans une grille à 4 cases. */
    const _stk=Math.round((p.attrs.jab+p.attrs.cross+p.attrs.hook)/3);
    const _grp=Math.round((p.attrs.takedown+p.attrs.submission+p.attrs.topControl)/3);
    const _pui=p.attrs.power, _crd=p.attrs.cardio;
    const _max=Math.max(_stk,_grp,_pui,_crd), _min=Math.min(_stk,_grp,_pui,_crd);
    /* ==== [CORRECTIF ITEM_VITRINE_STAT_DYNAMIQUE_bis] — à égalité, la
       comparaison sur les valeurs brutes mettait plusieurs cases en or (ou
       les 4, sur un profil parfaitement plat où _max===_min) — contraire à
       l'intention "la case ressort" (une seule mise en avant). Une seule
       case dorée, une seule rouge (le premier agrégat qui atteint le max/min,
       ordre STRK/GRAP/PUIS/CARDIO), et aucune des deux si le profil est plat. */
    const _agg=[['stk',_stk],['grp',_grp],['pui',_pui],['crd',_crd]];
    const _goldKey=_max!==_min?_agg.find(v=>v[1]===_max)[0]:null;
    const _lossKey=_max!==_min?_agg.find(v=>v[1]===_min)[0]:null;
    /* ==== [ANCRE: APERCU_STATS_DRAFT] — item demandé : la grille 4-cases
       affichait des moyennes brutes /100 (ex. 82), incohérentes avec le
       reste de l'UI qui affiche toujours /20 (d20()) — corrigé, sans
       toucher à _max/_min (comparaisons sur les valeurs brutes, d20 étant
       monotone le résultat du max/min est identique converti ou non).
       Ajout d'un aperçu dépliable des 20 attributs complets (Technique/
       Mental/Physique en /20), même rendu que scr_profile (ATTR/gauge/d20),
       pour choisir un profil sans se fier uniquement aux 4 agrégats. ==== */
    const previewOpen=G._draftPreview===i;
    const previewBlock=previewOpen?['tech','ment','phys'].map(key=>`<div class="card" style="padding:10px 0;text-align:left">
        <div class="grp-h"><span class="disp" style="font-size:14px">${key==='tech'?'Technique':key==='ment'?'Mental':'Physique'}</span></div>
        ${ATTR[key].map(a=>`<div class="attr" style="font-size:12px"><span class="attr-l">${a[1]}</span>${gauge(p.attrs[a[0]])}<span class="attr-v">${d20(p.attrs[a[0]])}</span></div>`).join('')}
      </div>`).join(''):'';
    /* ==== [FIN ANCRE] ==== */
    h+=`<div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--line);padding:16px;margin-bottom:20px">
      <div class="meta-strip"><div><span>Style</span><b>${p.styleLabel}</b></div></div>
      <div class="hero-name">${p.nick} ${p.flag}</div>
      <div class="narr" style="margin:10px 0 0;position:relative;z-index:2"><blockquote style="font-size:14px">« ${p._perk||''} »</blockquote></div>
      ${arcadePerkBadge(p)}
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:16px 0;position:relative;z-index:2" class="mono">
        <div style="background:var(--panel2);border:1px solid ${_goldKey==='stk'?'var(--gold-d)':_lossKey==='stk'?'var(--blood-d)':'var(--line)'};padding:8px 0;text-align:center"><span class="stat-lbl">STRK</span><b style="font-size:18px;${_goldKey==='stk'?'color:var(--gold)':_lossKey==='stk'?'color:var(--loss)':''}">${d20(_stk)}/20</b></div>
        <div style="background:var(--panel2);border:1px solid ${_goldKey==='grp'?'var(--gold-d)':_lossKey==='grp'?'var(--blood-d)':'var(--line)'};padding:8px 0;text-align:center"><span class="stat-lbl">GRAP</span><b style="font-size:18px;${_goldKey==='grp'?'color:var(--gold)':_lossKey==='grp'?'color:var(--loss)':''}">${d20(_grp)}/20</b></div>
        <div style="background:var(--panel2);border:1px solid ${_goldKey==='pui'?'var(--gold-d)':_lossKey==='pui'?'var(--blood-d)':'var(--line)'};padding:8px 0;text-align:center"><span class="stat-lbl">PUIS</span><b style="font-size:18px;${_goldKey==='pui'?'color:var(--gold)':_lossKey==='pui'?'color:var(--loss)':''}">${d20(_pui)}/20</b></div>
        <div style="background:var(--panel2);border:1px solid ${_goldKey==='crd'?'var(--gold-d)':_lossKey==='crd'?'var(--blood-d)':'var(--line)'};padding:8px 0;text-align:center"><span class="stat-lbl">CARDIO</span><b style="font-size:18px;${_goldKey==='crd'?'color:var(--gold)':_lossKey==='crd'?'color:var(--loss)':''}">${d20(_crd)}/20</b></div>
      </div>
      <button class="btn ghost" style="position:relative;z-index:2;padding:8px" onclick="CL.toggleDraftPreview(${i})">${previewOpen?'▴ Masquer les statistiques complètes':'▾ Voir les statistiques complètes'}</button>
      ${previewBlock}
      <button class="btn" style="border-color:var(--text);position:relative;z-index:2" onclick="CL.selectDraft(${i})">SÉLECTIONNER CE PROFIL</button>
    </div>`;
  });
  h+=`<button class="btn ghost mt" style="border:none;color:var(--muted)" onclick="CL.go('title')">← Annuler</button></div>`;
  return h;
}
/* ==== [ANCRE: REJOUABILITE_NEARMISS_BLOCK] — scorecard des 3 juges affichée
   uniquement quand l'élimination s'est faite aux points (a.lastScorecard posé
   dans afterResult, cf. ui-08) : distingue un near-miss (cartes serrées) d'une
   déroute nette (cartes larges), là où l'écran ne disait jusqu'ici que
   "R.I.P." sans donner aucun chiffre.
   ==== [CORRECTIF NEARMISS_VICTOIRE] — a.lastScorecard est posé sur TOUTE fin
   aux points, victoire comprise : les 3 appelants (scr_gameover) ne doivent
   invoquer cette fonction que sur une vraie élimination (!isVictory &&
   !cashedOut), jamais sur un champion arcade gagné à la décision. ==== */
function nearMissBlock(a){
  if(!a.lastScorecard) return '';
  const s=a.lastScorecard;
  const rows=[s.judges.j1,s.judges.j2,s.judges.j3].map(([ja,jb])=>`<span class="mono small">${ja}-${jb}</span>`).join(' · ');
  const margin=Math.abs(s.scoreA-s.scoreB);
  const tightness=margin<=3?'Cartes très serrées — un round différent et la run continuait.':margin<=8?'Un écart net mais pas écrasant sur les cartes.':'Décision sans appel des 3 juges.';
  return `<div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--line);border-left:3px solid var(--gold);padding:12px;text-align:left;margin-bottom:24px">
     <div class="eyebrow mb" style="font-size:11px">Cartes des juges (${s.method})</div>
     <div>${rows}</div>
     <div class="muted small mt">${tightness}</div>
   </div>`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: REJOUABILITE_SEED_REJOUABLE] — la graine n'était affichée
   qu'au draft (scr_draft), jamais reprise au game over : impossible de
   comparer une run raté à la même graine sans la retenir manuellement.
   CL.retrySameSeed() (ui-08) capture a.seed avant reset et le repose en
   G._pendingSeed. ==== */
function seedReplayBlock(a){
  if(a.seed===undefined||a.seed===null) return '';
  return `<div class="mono small muted" style="text-align:center;margin:-8px 0 16px">Graine : <b>${a.seed}</b> · <span style="color:var(--gold);text-decoration:underline;cursor:pointer" onclick="CL.retrySameSeed()">rejouer cette graine</span></div>`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: REJOUABILITE_RECORD_GAUNTLET] — meta.gauntletBest (state.js)
   affiché au game over : sémantique par format (cf. recordGauntletBest). ==== */
/* ==== [ANCRE: GAUNTLET_ASCENSION] — le record est désormais indexé par palier
   d'Ascension (gauntletBestGet) : comparer un palier 0 à un palier 3 n'aurait
   aucun sens. Le palier de la run en cours est affiché à côté. ==== */
function gauntletBestLine(mode){
  const meta=loadMetaStats();
  const asc=(G.arcade&&G.arcade.asc)||0;
  const best=gauntletBestGet(meta,mode,asc);
  if(best===undefined) return '';
  const label=mode==='boss_run'?`${best}/5 KO enchaînés`:mode==='ladder_100'?`Rang #${best} atteint`:(best>=7?'Tournoi remporté':`Palier ${best} atteint`);
  const isNew=G.arcade&&G.arcade.isNewRecord;
  /* ==== [ANCRE: GAUNTLET_RECORDS_ARCHETYPE] — ligne dédiée, séparée du
     record global ci-dessus : les deux compteurs sont indépendants (cf.
     state.js), donc battre l'un ne dit rien sur l'autre — un joueur peut
     battre son record perso sur cet archétype précis sans toucher au
     record global (déjà tenu par un archétype plus fort), et vice-versa. ==== */
  const archNew=G.arcade&&G.arcade.isNewArchetypeRecord;
  const archLine=archNew?`<div class="mono small" style="text-align:center;margin-bottom:12px;color:var(--frost)">✦ Nouveau record pour « ${esc(G.f&&G.f.nick||'')} »</div>`:'';
  /* ==== [FIN ANCRE] ==== */
  return (isNew
    ? `<div class="mono small" style="text-align:center;margin-bottom:12px;color:var(--frost)">✦ NOUVEAU RECORD (Ascension ${asc}) : ${label}</div>`
    : `<div class="mono small gold" style="text-align:center;margin-bottom:12px">🏆 Record personnel (Ascension ${asc}) : ${label}</div>`)+archLine;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: CORRECTIF_CODE_MORT] — contractBlock() retirée : son unique
   appelant restant (scr_draft) a été remplacé par un repère d'une ligne
   (LISIBILITE_CONTRAT_PASSIF ci-dessus) pour ne plus doubler ce que
   gauntletStatusBlock affiche déjà sur l'écran suivant immédiat (arcadehub,
   atteint sans aucun combat entre les deux). L'ancre GAUNTLET_CONTRAT_RUN
   d'origine visait « draft, hub ET camp » : les appels hub/camp avaient déjà
   disparu au profit de gauntletStatusBlock lors de GAUNTLET_STATUT_CONSOLIDE
   sans que ce commentaire ait été mis à jour ; seul l'appel draft restait,
   désormais retiré à son tour. ==== */
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: GAUNTLET_BANQUE_TOUS_FORMATS] — la cagnotte + ce qu'une
   élimination laisserait, ligne identique aux 3 formats (le Boss Run avait
   déjà la sienne en dur dans son hub, les 2 autres n'en avaient aucune). ==== */
/* ==== [ANCRE: CORRECTIF_CODE_MORT] — gauntletBankLine() retirée : sa logique
   vit désormais dans gauntletStatusBlock() (voir ANCRE GAUNTLET_STATUT_
   CONSOLIDE), plus aucun appelant. ==== */
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: GAUNTLET_MISE_EN_JEU] — la bascule n'a de sens que si la
   cagnotte est non nulle : sinon il n'y a rien à perdre et l'affichage
   mentirait sur l'enjeu. Le montant réellement mis en jeu est affiché en
   toutes lettres, pas seulement le multiplicateur. ==== */
function atRiskToggleBlock(a){
  const banked=a.banked||0;
  if(banked<=0) return '';
  const next=Math.min(8,(a.riskMult||1)*2);
  const on=!!a.atRisk;
  return `<div class="toggle-card" style="flex:1;min-width:0" onclick="CL.toggleAtRisk()">
     <div class="mono small" style="display:inline-block;padding:7px 12px;border-radius:20px;border:1px solid ${on?'var(--blood)':'var(--line)'};color:${on?'var(--blood)':'var(--muted)'};font-weight:bold">${on?'✓ ':'☐ '}Mise en jeu</div>
     ${on?`<div class="muted small mt">Une victoire porte le multiplicateur de la run à <b class="gold">×${next}</b>. Une élimination sur ce combat ne rapporte <b style="color:var(--loss)">absolument rien</b> — les ${banked} pts de cagnotte partent avec.</div>`:''}
   </div>`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: COACHING_OBLIGATOIRE] — item demandé : le coaching entre les
   rounds n'est plus un choix (toggle togglable via CL.toggleCoaching()) mais
   une pièce systématique du Gauntlet, sur les 3 formats — resolveArcadeFight()
   (ui-03) ne passe plus que par startCoachingFight(). */
/* ==== [ANCRE: CORRECTIF_BADGE_COACHING_PERMANENT] — bug remonté : le badge
   "✓ Coaching" avait bien été rendu non cliquable au moment où le coaching
   est devenu permanent (ANCRE ci-dessus), mais continuait de prendre une
   place entière dans la rangée de pastilles des 3 hubs Gauntlet — pour une
   mécanique qui ne se désactive plus jamais, ce n'est plus une information
   utile à afficher à chaque écran, juste de l'espace perdu. Fonction et ses
   3 appels retirés (aucun autre appelant, cf. grep). ==== */
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: GAUNTLET_BLESSURE_RUN] — les séquelles doivent être lisibles au
   hub, sinon la baisse d'attributs est vécue comme un bug de simulation. ==== */
/* ==== [ANCRE: CORRECTIF_CODE_MORT] — runInjuryBlock() retirée : sa logique
   vit désormais dans gauntletStatusBlock(), plus aucun appelant. ==== */
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: GAUNTLET_RUN_MULT] — le multiplicateur cumulé doit être visible
   AVANT la décision suivante, pas seulement au game over. ==== */
/* ==== [ANCRE: CORRECTIF_CODE_MORT] — runMultBlock() retirée : sa logique
   vit désormais dans gauntletStatusBlock(), plus aucun appelant. ==== */
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: GAUNTLET_STATUT_CONSOLIDE] — regroupe l'état PASSIF de la run
   (contrat, cagnotte, séquelles, multiplicateur) dans une seule carte au lieu
   de 4 empilées : sur les 3 hubs, contractBlock + gauntletBankLine +
   runInjuryBlock + runMultBlock rendaient jusqu'à 6 boîtes .glass quasi
   identiques avant même les 2 vraies décisions du tour (pacte, mise en jeu),
   noyant l'information sous la répétition du même habillage visuel. Même
   pattern qu'un bloc déjà éprouvé de ce fichier (runDebriefBlock, écran de
   fin de run) : une carte, un eyebrow, des lignes mono empilées. ==== */
/** Rappel permanent de qui on joue : archétype, tempérament, discipline.
 * @param {object} f le combattant @returns {string} HTML (vide si inconnu) */
function gauntletIdentityRow(f){
  if(!f) return '';
  const arch=f.nick||f.first||f.name||'Ton combattant';
  const temper=f.styleLabel?` — ${f.styleLabel}`:'';
  const disc=f.style?` · ${styleLabel(f.style)}`:'';
  return `<div class="mono small" style="color:var(--gold)"><b>🥊 Tu joues ${esc(arch)}</b><span class="muted">${esc(temper+disc)}</span></div>`;
}
function gauntletStatusBlock(a){
  const rows=[];
  /* ==== [ANCRE: IDENTITE_TOUJOURS_VISIBLE] — item demandé : "préciser quel
     archétype on a choisi et quel style, le but est que tout soit toujours à
     disposition à chaque écran pour ne jamais être perdu". Les hubs de run
     affichent l'ADVERSAIRE en grand et ne rappelaient nulle part qui, soi,
     on joue : en reprenant une run entamée, il fallait ouvrir la fiche
     complète pour retrouver son propre archétype et sa discipline — dont
     dépendent pourtant les tactiques proposées. Placé en tête du bloc, avant
     le mutateur : c'est le socle (qui je suis) avant les contraintes. ==== */
  const identityRow=gauntletIdentityRow(G.f);
  if(identityRow) rows.push(identityRow);
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: GAUNTLET_MUTATEURS_ALEATOIRES] — ajout #4 (24 ajouts,
     12/08/2026) : mutateur de la run affiché EN PREMIER, avant même le
     contrat — c'est la contrainte la plus structurante de toute la run
     (posée une fois au lancement, jamais renégociable), le joueur doit la
     voir avant toute autre info d'état. ==== */
  /* ==== [ANCRE: CORRECTIF_ETAT_RUN_ESPACE] — bug remonté (10d) : ce bloc
     restait trop chargé même après l'espacement des lignes (ANCRE
     CORRECTIF_ETAT_RUN_COMPACT plus bas) — la description complète du
     mutateur n'est affichée NULLE PART ailleurs dans le jeu (seul point où
     le joueur peut apprendre ce qu'il fait), donc pas question de la
     supprimer. Repliée par défaut derrière un tap ("▼ Détail"), même
     mécanisme que l'aperçu de la boutique (G._shopPreview/toggleShopPreview,
     ui-07/ui-08) : la ligne compacte reste toujours visible, la phrase
     complète ne prend de la place que si le joueur la demande. ==== */
  if(a.mutator){
    const open=G._runStatusPreview==='mutator';
    rows.push(`<div class="mono small" style="color:var(--blood)" onclick="CL.toggleRunStatusPreview('mutator')"><b>☣ Mutateur : ${a.mutator.label}</b> <span class="muted" style="text-decoration:underline dotted;cursor:pointer">${open?'▲ Fermer':'▼ Détail'}</span>${open?`<div class="muted" style="margin-top:2px">${a.mutator.desc}</div>`:''}</div>`);
  }
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: IDENTITE_DE_CAMP] — ajout #22 (24 ajouts, 12/08/2026). ==== */
  /* ==== [ANCRE: CORRECTIF_CAMP_VERBEUX] — bug remonté : cette ligne
     répétait la phrase de flaveur (c.desc) déjà lue en entier une fois pour
     toutes à la sélection (scr_camp_identity_pick) et forçait un retour à
     la ligne (<br>) avant le passif — sur un choix DÉFINITIF pour toute la
     run (cf. ANCRE ci-dessus), affiché sur les 3 hubs à chaque render, ce
     texte redondant gonflait un bloc déjà chargé (GAUNTLET_STATUT_CONSOLIDE)
     pour rien. Ne garde que le nom (identification rapide) et le passif
     (seule info encore utile en cours de run), sur une seule ligne. ==== */
  if(a.campIdentity) rows.push(`<div class="mono small sage"><b>🏕 ${a.campIdentity.name}</b>${a.campIdentity.passive?` <span class="gold">— ⚡ ${a.campIdentity.passive.label}</span>`:''}</div>`);
  /* ==== [FIN ANCRE] ==== */
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: CORRECTIF_CONTRAT_INDICATEUR] — bug remonté : ☐ est un
     symbole de case À COCHER, alors que le contrat de run est évalué
     automatiquement (evalGauntletContract) — le ✓/○ reste un simple point
     d'état, jamais cliquable lui-même (cf. ANCRE CORRECTIF_ETAT_RUN_ESPACE
     juste au-dessus : seul le lien "▼ Détail" l'est, distinct visuellement
     pour ne pas réintroduire la même confusion). ==== */
  if(a.contract){
    /* ==== [CORRECTIF GAUNTLETSTATUSBLOCK_LIVE_MORT] — le paramètre `live`
       valait `true` aux 4 appels (ci-dessous) : la branche `:!!c.done` était
       inatteignable. evalGauntletContract(a) est désormais l'unique source. */
    const c=a.contract, ok=evalGauntletContract(a), open=G._runStatusPreview==='contract';
    rows.push(`<div class="mono small" style="color:${ok?'var(--sage)':'var(--gold)'}"><b>${SVG.pact} ${ok?'✓':'○'} ${c.label}</b> <span class="muted">(×${c.mult}) </span><span class="muted" style="text-decoration:underline dotted;cursor:pointer" onclick="CL.toggleRunStatusPreview('contract')">${open?'▲ Fermer':'▼ Détail'}</span>${open?`<div class="muted" style="margin-top:2px">${c.hint}</div>`:''}</div>`);
  }
  /* ==== [FIN ANCRE] ==== */
  const banked=a.banked||0;
  if(banked>0){
    const elim=eliminationPreview(a);
    /* ==== [ANCRE: CAGNOTTE_LISIBLE] — item demandé : la somme récupérée en
       cas de défaite s'affichait "+4 pts" en rouge, alors que c'est un gain
       (rouge = perte partout ailleurs dans le jeu) et que le "+" laissait
       croire à un bonus qui s'ajoute à la cagnotte. Même or que la cagnotte,
       sans signe : c'est simplement ce que rapporte le prochain combat s'il
       est perdu. ==== */
    rows.push(`<div class="mono small"><span class="muted">Cagnotte : </span><b class="gold">${banked} pts</b><span class="muted"> · si le prochain combat est perdu : </span><b class="gold">${elim} pts</b></div>`);
  }
  /* ==== [ANCRE: CORRECTIF_LASTBOUNTY_SILENCIEUX] — bug trouvé : la prime de
     vengeance (afterResult, ui-08) crédite bien a.lastBounty au moment où un
     némésis historique tombe, mais rien n'affichait le MONTANT — seul le
     COMPTE total apparaît sur l'écran de fin de run (runDebriefBlock, "N
     némésis vaincue(s)"), sans jamais dire combien ça a rapporté. lastBounty
     est réévalué à chaque combat (0 s'il ne s'applique pas), donc l'afficher
     ici, sur le premier écran affiché après la victoire, suffit à annoncer
     le gain au bon moment sans avoir besoin de le faire suivre plus loin. ==== */
  if((a.lastBounty||0)>0) rows.push(`<div class="mono small" style="color:var(--blood)"><b>⚔ Prime de vengeance encaissée</b> <span class="gold">+${a.lastBounty} pts</span></div>`);
  /* ==== [ANCRE: CORRECTIF_LASTINJURY_SILENCIEUX] — bug trouvé : une séquelle
     de run (runAttrition, ui-08) est stockée à la fois dans runInjuries
     (déjà affiché ci-dessous) ET dans lastInjury, mais rien ne distinguait
     la séquelle qui vient de tomber des précédentes : le joueur ne pouvait
     pas savoir SI le combat qu'il vient de jouer en est la cause sans
     comparer mentalement la liste à ce qu'il avait avant. lastInjury pointe
     vers le MÊME objet que l'entrée fraîchement ajoutée à runInjuries (===) :
     comparer les références suffit, sans dupliquer l'affichage. ==== */
  /* ==== [ANCRE: CORRECTIF_ECHELLE_SEQUELLE] — bug remonté (A14) : les
     séquelles sont définies en échelle /100 (GAUNTLET_RUN_INJURIES, ui-03) et
     s'affichaient BRUTES ("Menton -12") juste à côté des passifs de camp,
     eux correctement convertis en /20 par campFxLabel (ui-03). Réutilise
     désormais campFxLabel pour la même échelle d'affichage partout. ==== */
  (a.runInjuries||[]).forEach(i=>rows.push(`<div class="mono small" style="color:var(--loss)">${i===a.lastInjury?'<b class="gold">NOUVEAU — </b>':''}<b>${i.name}</b> <span class="muted">${i.attrs.map(x=>campFxLabel({[x[0]]:x[1]})).join(' · ')}</span></div>`));
  /* ==== [ANCRE: CORRECTIF_MALEDICTION_VISIBLE] — bug remonté (B18) : les
     malus de Camp Maudit (generateCursedOption, ui-03) sont un système
     d'usure PARALLÈLE aux séquelles de combat, avec des règles opposées
     (permanent, non soignable) sans jamais rien afficher — le joueur ne
     pouvait pas distinguer une baisse d'attribut réversible d'une baisse
     définitive. Affiché ici séparément, marqué IRRÉVERSIBLE sans bouton de
     soin, à la même échelle /20 que le reste (campFxLabel). ==== */
  (a.curses||[]).forEach(c=>rows.push(`<div class="mono small" style="color:var(--blood)"><b>${c.name}</b> <span class="muted">${c.attrs.map(x=>campFxLabel({[x[0]]:x[1]})).join(' · ')} — irréversible</span></div>`));
  /* ==== [FIN ANCRE] ==== */
  const m=gauntletRunMult(a);
  if(m>1){
    const parts=[];
    if((a.riskMult||1)>1) parts.push(`mise ×${a.riskMult}`);
    if((a.maxPactStreak||0)>0) parts.push(`pactes +${Math.round((a.maxPactStreak||0)*10)} %`);
    if(a.contract&&a.contract.done) parts.push(`contrat ×${a.contract.mult}`);
    rows.push(`<div class="mono small gold">Multiplicateur de la run : <b>×${m}</b>${parts.length?` <span class="muted">(${parts.join(' · ')})</span>`:''}</div>`);
  }
  if(!rows.length) return '';
  /* ==== [ANCRE: CORRECTIF_ETAT_RUN_COMPACT] — bug remonté : jusqu'à 6
     lignes (mutateur, camp, contrat, cagnotte, séquelles, multiplicateur)
     s'empilaient avec rows.join('') pur, sans le moindre espacement — un
     bloc déjà chargé rendu encore plus difficile à lire. Chaque ligne
     existante est enveloppée ici (aucun des appels rows.push() ci-dessus
     n'a besoin de changer) avec une petite marge haute, sauf la première. ==== */
  return `<div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--line);padding:12px;text-align:left;margin-top:12px">
     <div class="eyebrow mb" style="font-size:11px">État de la run</div>
     ${rows.map((r,i)=>`<div${i>0?' style="margin-top:6px"':''}>${r}</div>`).join('')}
   </div>`;
  /* ==== [FIN ANCRE] ==== */
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: GAUNTLET_BRACKET_VISIBLE] — rend le tableau réellement simulé
   par advanceWTUMMABracket() (ui-03). Affiche le tour courant, le match du
   joueur mis en évidence, et signale si un némésis est encore en lice
   ailleurs dans le tableau — le vrai moteur d'anticipation du format. ==== */
function scr_bracket_view(){
  const a=G.arcade;
  if(!a||!a.tournament) return `<div class="scr"><p class="lede">Aucun tableau en cours.</p><button class="btn ghost mt" onclick="CL.go('arcadehub')">Retour</button></div>`;
  const t=a.tournament;
  const rivalAlive=t.matches.some(m=>(m.a&&m.a._isRival)||(m.b&&m.b._isRival));
  const row=(m,i)=>{
    const mine=(m.a&&m.a.id===G.f.id)||(m.b&&m.b.id===G.f.id);
    /* ==== [ANCRE: CORRECTIF_SURNOM_TABLEAU] — bug remonté : le joueur figurait
       dans le tableau sous le patronyme généré par makeFighter() (ex. « Bruno
       Hughes »), alors que TOUS les autres écrans du Gauntlet l'identifient par
       son surnom d'archétype (f.nick — cf. les 3 hubs, scr_draft,
       scr_arcade_plan). Le nom généré n'a aucune existence pour le joueur : il
       n'a choisi qu'un archétype. Les PNJ gardent leur patronyme, c'est leur
       seule identité. ==== */
    const label=x=>((x.id===G.f.id && x.nick)?x.nick:x.name);
    const side=x=>`${esc(label(x))} ${x.flag||''} <span class="muted small">#${x.seed||'?'} · OVR ${x.overall}</span>${x._isRival?' <span class="mono small" style="color:var(--blood)">⚠</span>':''}`;
    return `<div style="background:var(--panel2);border:1px solid var(--line);border-left:3px solid ${mine?'var(--gold)':'var(--line)'};padding:13px;margin:10px 0">
      <div class="mono small muted">Match ${i+1}</div>
      <div class="small">${side(m.a)}</div>
      <div class="mono small muted">vs</div>
      <div class="small">${side(m.b)}</div>
    </div>`;
  };
  return `<div class="scr"><div class="bar"><span class="eyebrow">WTUMMA // TABLEAU — ${t.stepName.toUpperCase()}</span></div>
   <p class="lede small">Votre classement : #${t.playerSeed}. ${rivalAlive?'<b style="color:var(--blood)">Un némésis est encore en lice dans ce tableau.</b>':'Aucun némésis dans les survivants.'}</p>
   ${t.matches.map(row).join('')}
   <button class="btn ghost mt" onclick="CL.go('arcadehub')">← Retour au vestiaire</button>
  </div>`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: GAUNTLET_FIN_DE_RUN] — bilan de sortie : décomposition du gain
   (base × multiplicateur), état du contrat, primes de vengeance encaissées,
   séquelles, palier d'Ascension débloqué et succès Gauntlet obtenus. Toutes
   ces valeurs sont FIGÉES par finaliseGauntletRun() (ui-08) au moment du
   paiement — l'écran ne recalcule rien, il ne peut donc pas diverger du
   montant réellement crédité. ==== */
function runDebriefBlock(a){
  const mult=a.runMultApplied||1;
  const base=a.basePayout||0;
  const parts=[];
  if((a.riskMult||1)>1) parts.push(`mise en jeu ×${a.riskMult}`);
  if((a.maxPactStreak||0)>0) parts.push(`${a.maxPactStreak} pacte(s) enchaîné(s) +${Math.round((a.maxPactStreak||0)*10)} %`);
  if(a.contract&&a.contract.done) parts.push(`contrat rempli ×${a.contract.mult}`);
  const displayMult=Math.round(mult*100)/100;
  const contractLine=a.contract
    ? `<div class="mono small" style="color:${a.contract.done?'var(--sage)':'var(--muted)'}">${a.contract.done?'✓':'✗'} Contrat : ${a.contract.label}</div>`
    : '';
  const bounty=(a.bounties||0)>0?`<div class="mono small" style="color:var(--blood)">⚔ ${a.bounties} némésis vaincue(s) — primes déjà versées</div>`:'';
  const inj=(a.runInjuries||[]).length?`<div class="mono small muted">${a.runInjuries.length} séquelle(s) encaissée(s) : ${a.runInjuries.map(i=>i.name).join(', ')}</div>`:'';
  const curses=(a.cursedTaken||0)>0?`<div class="mono small muted">${a.cursedTaken} pacte(s) de camp maudit accepté(s)</div>`:'';
  const multLine=(displayMult>1)
    ? `<div class="mono small gold"><b>${base} pts</b> × <b>${displayMult}</b> = <b>${a.earnedOnElimination||0} pts</b>${parts.length?` <span class="muted">(${parts.join(' · ')})</span>`:''}</div>`
    : '';
  const ach=(a.newAch||[]).length?`<div class="mono small gold mt">🏅 ${a.newAch.map(x=>x.h).join(' · ')}</div>`:'';
  if(!multLine && !contractLine && !bounty && !inj && !curses && !ach) return '';
  return `<div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--line);border-left:3px solid var(--gold);padding:12px;text-align:left;margin-bottom:20px">
     <div class="eyebrow mb" style="font-size:11px">Bilan de la run</div>
     ${multLine}${contractLine}${bounty}${inj}${curses}${ach}
   </div>`;
}
/* ==== [ANCRE: GAUNTLET_ASCENSION] — un palier s'ouvre sur une performance
   mesurée (cf. state.js) ou sur une victoire : le message suit a.ascJust
   Unlocked, posé au moment exact du déblocage. ==== */
/* ==== [ANCRE: TOUR_ASCENSION_CONDITIONS_MESUREES] — ce bloc ne s'affichait
   que sur une victoire totale (a.victory). Depuis que le palier suivant
   s'ouvre aussi sur une bonne performance (cf. state.js), la garde se fait
   sur a.ascJustUnlocked, posé par finaliseGauntletRun au moment exact où un
   palier est réellement ouvert — sinon le joueur débloquerait l'Ascension
   sans que rien ne le lui dise. L'ancienne condition sert de repli pour une
   run commencée avant ce changement. ==== */
function ascensionUnlockBlock(a){
  const meta=loadMetaStats();
  const lvl=gauntletAscLevel(meta,a.mode);
  if(!a.ascJustUnlocked && !a.victory) return '';
  if(lvl<=(a.asc||0)) return '';
  return `<div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--gold);padding:12px;text-align:center;margin-bottom:20px">
     <div class="mono small gold" style="font-weight:bold">⬆ ASCENSION ${lvl} DÉBLOQUÉE</div>
     <div class="muted small mt">Adversaires plus forts, mais points gagnés multipliés par ${gauntletAscPayoutMod(lvl)}. Choisis ce palier au menu du Gauntlet.</div>
   </div>`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [FIN ANCRE] ==== */
function scr_gameover(){ const a=G.arcade, f=G.f;
  if(a.mode==='boss_run'){
    const isVictory=!!a.victory;
    const cashedOut=!!a.cashedOut;
    // ==== [ANCRE: CORRECTIF_BOSSRUN_RAISON_ELIMINATION] — utilise le flag
    // fiable a.victory (posé au moment exact de la victoire finale) plutôt que
    // de recalculer streak>=target, et distingue une vraie défaite d'une
    // victoire qui ne comptait pas car pas obtenue par KO/TKO (mode KO
    // uniquement) — les deux affichaient auparavant le même "R.I.P." muet.
    const noKo=a.eliminatedReason==='no_ko';
    const title=isVictory?'CHAMPION ARCADE':cashedOut?'RUN ENCAISSÉ':(noKo?'VICTOIRE INVALIDÉE':'R.I.P.');
    const subtitle=isVictory?'Survivant du Gauntlet':cashedOut?`Sorti au palier ${a.streak}/${a.target}, mise en sécurité`:(noKo?'Pas de KO/TKO — la série s\u2019arrête':'Fin de la run');
    const narrative=isVictory
      ?`« Contre toute attente, il a marché sur l\u2019algorithme. 5 cadavres laissés dans la cage. Le contrat est rempli. »`
      :cashedOut
        ?`« Pas de gloire, mais les points sont en banque. Certains soirs, la sagesse vaut mieux que le prochain KO. »`
        :noKo
          ?`« Le combat est gagné aux points, mais le Boss Run n\u2019accepte que les KO et TKO. Une victoire à la décision ou par soumission ne compte pas ici — la série s\u2019arrête malgré la main levée. »`
          :`« Le combat de trop. L\u2019ascension s\u2019arrête net sur la toile de l\u2019octogone. Les lumières s\u2019éteignent. »`;
    return `<div class="scr" style="display:flex;flex-direction:column;justify-content:center;min-height:80vh">
   <div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--line);padding:20px;margin-bottom:24px;text-align:center">
     <div class="hero-name" style="color:${isVictory?'var(--gold)':cashedOut?'var(--sage)':'var(--loss)'}">${title}<em style="color:var(--muted)">${subtitle}</em></div>
   </div>
   ${gauntletBestLine('boss_run')}
   ${(!isVictory&&!cashedOut)?nearMissBlock(a):''}
   ${ascensionUnlockBlock(a)}
   ${runDebriefBlock(a)}
   <div class="glass" style="position:relative;background:var(--panel2);border:1px solid var(--line);border-left:3px solid ${isVictory?'var(--gold)':'var(--loss)'};padding:16px;margin-bottom:24px">
     <div class="meta-strip"><div><span>Profil</span><b>${(f.styleLabel||'').toUpperCase()}</b></div></div>
     <div class="hero-name" style="font-size:clamp(24px,7vw,32px)">${esc(f.nick||f.name)} ${f.flag}</div>
     <div class="stat-band">
       <div><span class="stat-big hot">${a.streak}/${a.target}</span><span class="stat-lbl">Victoires (KO uniquement)</span></div>
       <div><span class="stat-big gold">+${a.earnedOnElimination||0}</span><span class="stat-lbl">Points de salle gagnés</span></div>
     </div>
   </div>
   <div class="narr"><blockquote>${narrative}</blockquote></div>
   ${seedReplayBlock(a)}
   ${devilBuybackBlock(a,isVictory,cashedOut)}
   <button class="btn mt" style="padding:20px;font-size:18px;border-color:var(--text)" onclick="CL.retryArcade()">NOUVELLE RUN</button>
   <button class="btn ghost mt" onclick="CL.go('title')">${isVictory?'RETOURNER DANS L\u2019OMBRE':'ACCEPTER LA DÉFAITE'}</button>
   </div>`;
  }
  if(a.mode==='ladder_100'){
    /* ==== [CORRECTIF LADDER_ISVICTORY_UNIFORME] — boss_run et bracket64
       lisent a.victory (posé par ui-08 au moment exact de la victoire) ;
       cette branche recalculait la même condition (a.rank===1, posée à
       ui-08:1653 exactement là où a.victory=true est écrit) sur les
       données brutes plutôt que de lire le flag fiable. Uniformisé. ==== */
    const isVictory=a.victory;
    const cashedOut=!!a.cashedOut;
    const isPact=a.eliminatedReason==='pact';
    /* ==== [CORRECTIF GAUNTLET_JUDGES_RAISON_ELIMINATION] — même classe de bug
       que CORRECTIF_BOSSRUN_RAISON_ELIMINATION pour 'no_ko' : judgesFail
       (ui-08, mutateur mut_juges_severes) posait déjà eliminatedReason='judges'
       sur une victoire aux points invalidée par des juges sévères, mais aucune
       branche de cet écran ne le lisait — l'issue s'affichait en "R.I.P."
       générique, comme une vraie défaite. ==== */
    const isJudges=a.eliminatedReason==='judges';
    // ==== [ANCRE: REJOUABILITE_LADDER_POINTS_UNIFIES] — l'ancien calcul
    // d'affichage (Math.max(10,round((101-rank)*8))) était DÉCONNECTÉ du
    // barème réellement versé côté ui-08 (Math.max(2,round((101-rank)*0.8)))
    // — facteur ×10 : l'écran promettait jusqu'à 10x plus que ce qui était
    // réellement crédité en Salle des Légendes. a.earnedOnElimination est
    // désormais la seule source de vérité, écrite au moment du paiement. ====
    const earned=a.earnedOnElimination||0;
    return `<div class="scr" style="display:flex;flex-direction:column;justify-content:center;min-height:80vh">
   <div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--line);padding:20px;margin-bottom:24px;text-align:center">
     <div class="hero-name" style="color:${isVictory?'var(--gold)':cashedOut?'var(--sage)':'var(--loss)'}">${isVictory?'CHAMPION WTUMMA':cashedOut?'RUN ENCAISSÉ':isPact?'PACTE ROMPU':isJudges?'DÉCISION CONTESTÉE':'R.I.P.'}<em style="color:var(--muted)">${isVictory?'Vous êtes le #1 mondial':cashedOut?`Sorti au rang #${a.rank}, mise en sécurité`:isPact?'Victoire aux points — le pacte de finition l\u2019a invalidée':isJudges?'Victoire aux points trop serrée — les juges sévères l\u2019ont invalidée':'Éliminé au rang #'+a.rank}</em></div>
   </div>
   ${gauntletBestLine('ladder_100')}
   ${(!isVictory&&!cashedOut)?nearMissBlock(a):''}
   ${ascensionUnlockBlock(a)}
   ${runDebriefBlock(a)}
   <div class="glass" style="position:relative;background:var(--panel2);border:1px solid var(--line);border-left:3px solid ${isVictory?'var(--gold)':'var(--loss)'};padding:16px;margin-bottom:24px">
     <div class="meta-strip"><div><span>Profil</span><b>${(f.styleLabel||'').toUpperCase()}</b></div></div>
     <div class="hero-name" style="font-size:clamp(24px,7vw,32px)">${esc(f.nick||f.name)} ${f.flag}</div>
     <div class="stat-band">
       <div><span class="stat-big hot">${a.fightsDone||0}</span><span class="stat-lbl">Victoires d\u2019ascension</span></div>
       <div><span class="stat-big gold">+${earned}</span><span class="stat-lbl">Points de salle gagnés</span></div>
     </div>
   </div>
   <div class="narr"><blockquote>${isVictory?`« 99 cadavres en contrebas. L\u2019ascension est terminée, le trône vous appartient. »`:cashedOut?`« Pas de trône, mais la chute est évitée et les points sont en poche. »`:isPact?`« Le pacte promettait tout ou rien. Ce sera rien : gagné aux points ne suffisait pas. »`:isJudges?`« Une décision qui ne convainc personne. Sous des juges aussi sévères, gagner aux points ne suffisait pas — il fallait finir le travail. »`:`« Une erreur et c\u2019est la chute libre. Le sommet restera hors de portée. »`}</blockquote></div>
   ${seedReplayBlock(a)}
   ${devilBuybackBlock(a,isVictory,cashedOut)}
   <button class="btn mt" style="padding:20px;font-size:18px;border-color:var(--text)" onclick="CL.retryArcade()">NOUVELLE RUN</button>
   <button class="btn ghost mt" onclick="CL.go('title')">RETOURNER AU MENU</button>
   </div>`;
  }
  const isVictory=a.victory;
  const cashedOut=!!a.cashedOut;
  const isPact=a.eliminatedReason==='pact';
  /* ==== [CORRECTIF GAUNTLET_JUDGES_RAISON_ELIMINATION] — même classe de bug
     que CORRECTIF_BOSSRUN_RAISON_ELIMINATION pour 'no_ko' : judgesFail
     (ui-08, mutateur mut_juges_severes) posait déjà eliminatedReason='judges'
     sur une victoire aux points invalidée par des juges sévères, mais aucune
     branche de cet écran ne le lisait — l'issue s'affichait en "ÉLIMINÉ"
     générique, comme une vraie défaite. ==== */
  const isJudges=a.eliminatedReason==='judges';
  const earned=a.earnedOnElimination||0;
  return `<div class="scr" style="display:flex;flex-direction:column;justify-content:center;min-height:80vh">
   <div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--line);padding:20px;margin-bottom:24px;text-align:center">
     <div class="hero-name" style="color:${isVictory?'var(--gold)':cashedOut?'var(--sage)':'var(--loss)'}">${isVictory?'CHAMPION WTUMMA':cashedOut?'RUN ENCAISSÉ':isPact?'PACTE ROMPU':isJudges?'DÉCISION CONTESTÉE':'ÉLIMINÉ'}<em style="color:var(--muted)">${cashedOut?'Sortie volontaire':isPact?'Victoire aux points — le pacte de finition l\u2019a invalidée':isJudges?'Victoire aux points trop serrée — les juges sévères l\u2019ont invalidée':a.tournament.stepName}</em></div>
   </div>
   ${gauntletBestLine('bracket64')}
   ${(!isVictory&&!cashedOut)?nearMissBlock(a):''}
   ${ascensionUnlockBlock(a)}
   ${runDebriefBlock(a)}
   <div class="glass" style="position:relative;background:var(--panel2);border:1px solid var(--line);border-left:3px solid ${isVictory?'var(--gold)':'var(--loss)'};padding:16px;margin-bottom:24px">
     <div class="meta-strip"><div><span>Profil</span><b>${(f.styleLabel||'').toUpperCase()}</b></div></div>
     <div class="hero-name" style="font-size:clamp(24px,7vw,32px)">${esc(f.nick||f.name)} ${f.flag}</div>
     <div class="stat-band"><div><span class="stat-big hot">+${earned}</span><span class="stat-lbl">WT Points gagnés</span></div></div>
   </div>
   <div class="narr"><blockquote>${isVictory?`« 63 combattants laissés sur le carreau. L\u2019octogone vous appartient, jusqu\u2019à ce qu\u2019un nouveau challenger se présente. »`:cashedOut?`« Se retirer au bon moment est aussi un art. »`:isPact?`« Le pacte promettait tout ou rien. Ce sera rien : gagné aux points ne suffisait pas. »`:isJudges?`« Une décision qui ne convainc personne. Sous des juges aussi sévères, gagner aux points ne suffisait pas — il fallait finir le travail. »`:`« Le bracket est impitoyable. Une seule erreur et c\u2019est le vol de retour. »`}</blockquote></div>
   ${seedReplayBlock(a)}
   ${devilBuybackBlock(a,isVictory,cashedOut)}
   <button class="btn mt" style="padding:20px;font-size:18px;border-color:var(--text)" onclick="CL.retryArcade()">NOUVELLE RUN</button>
   <button class="btn ghost mt" onclick="CL.go('title')">RETOURNER AU MENU</button>
   </div>`;
}
/* ==== [ANCRE: RACHAT_RETRAITE_DIABLE] — ajout #12 (24 ajouts, 12/08/2026) :
   bloc PARTAGÉ par les 3 branches ci-dessus, discret (un simple lien, pas un
   gros bouton — cf. spec "discret") et n'apparaît QUE sur une vraie
   élimination (jamais victoire, jamais sortie volontaire), et QUE si le
   joueur peut réellement payer le prix affiché. ==== */
function devilBuybackBlock(a,isVictory,cashedOut){
  if(isVictory||cashedOut) return '';
  const meta=loadMetaStats();
  const cost=gauntletDevilCost(a.mode,a);
  if((meta.legendPoints||0)<cost) return '';
  return `<div class="mono small" style="text-align:center;margin-top:10px">
   <span onclick="CL.buyDevilContinue()" style="cursor:pointer;color:var(--blood);text-decoration:underline dotted;opacity:0.75">Payer le Diable — ${cost} points de Légende pour continuer cette run</span>
  </div>`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: REJOUABILITE_HUB_BANQUE_PACTE] — bouton d'encaissement (les 3
   formats) + bascule du pacte de finition (Ladder 100 / Bracket 64
   uniquement, Boss Run a déjà sa clause KO-only permanente). Valeurs
   affichées calculées avec les MÊMES barèmes que cashOutGauntlet()/
   afterResult() côté ui-08, pour que le chiffre annoncé soit celui
   réellement versé. ==== */
/* ==== [ANCRE: REJOUABILITE_RIVAL_BADGE] — a.opponent._isRival (posé par
   fighterFromRivalSnapshot(), ui-03) n'était visible nulle part : les 3 hubs
   n'affichent que .name, jamais .nick. Sans ce badge le système de némésis
   serait mécaniquement actif mais totalement invisible pour le joueur. Le
   badge lui-même est inchangé — c'est la DONNÉE en amont (recordGauntletRival
   appelé sur la défaite, pas la victoire, cf. ui-08) qui a été corrigée : le
   badge affichait auparavant tes propres champions passés, jamais tes vrais
   bourreaux. ==== */
/* ==== [ANCRE: GAUNTLET_NEMESIS_ACCUMULATION] — killedCount>=2 ajoute une
   ligne dédiée sous le badge némésis habituel : le joueur doit voir POURQUOI
   cet adversaire est plus dangereux (buff _styleProfileOverride posé dans
   fighterFromRivalSnapshot, ui-03) avant d'entrer dans le plan de combat. ==== */
function rivalBadge(opp){
  if(!opp||!opp._isRival) return '';
  const srcLabel={boss_run:'Boss Run',ladder_100:'Ladder 100',bracket64:'Bracket 64'}[opp._rivalSource]||'une run précédente';
  const buffLine=(opp._killedCount||0)>=2?`<div class="mono small" style="color:var(--blood);margin-bottom:4px">☠ Vous a déjà battu ${opp._killedCount} fois — frappe plus dur, plus dangereux en soumission</div>`:'';
  return `<div class="mono small" style="color:var(--blood);font-weight:bold;margin-bottom:4px">⚠ NÉMÉSIS — vous a déjà éliminé (${srcLabel})</div>${buffLine}`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: REJOUABILITE_PAYOUT_TABLES] — gauntletPayout()/
   gauntletEliminationPayout() (ui-03) sont la SEULE source de vérité pour
   les 3 écrans (aperçu encaissement, aperçu élimination, paiement réel
   ui-08) — fini la duplication de tables qui avait déjà causé un bug de
   facteur ×10 sur le Ladder par le passé (cf. ANCRE ci-dessus). ==== */
/* ==== [ANCRE: GAUNTLET_RUN_MULT] — les aperçus passent par gauntletFinalPayout
   comme le paiement réel (finaliseGauntletRun, ui-08) : sans ça l'écran
   annoncerait le tarif de base et verserait le tarif multiplié, exactement le
   type d'écart qui avait produit le bug ×10 du Ladder. Le contrat est évalué
   en direct pour que son ×mult apparaisse dès qu'il est rempli. ==== */
/* ==== [ANCRE: CORRECTIF_CODE_MORT] — cashOutPreview() retirée : item demandé,
   « Encaisser et sortir » n'a plus aucun appelant sur les 3 hubs (bracket64,
   ladder_100, boss_run — cf. GAUNTLET_SORTIE_UNIQUE ci-dessus). L'option
   n'avait pas de bug — les chiffres étaient sains, l'encaissement rapportait
   toujours strictement plus qu'une élimination au même palier — mais elle
   n'était en pratique jamais choisie : sortir d'une run en cours va contre
   l'intérêt du joueur tant que la cagnotte suivante reste accessible via
   « Abandonner ». eliminationPreview() reste seule active : elle sert
   toujours à gauntletStatusBlock() pour annoncer ce que rapporterait une
   défaite sur le combat suivant. ==== */
function eliminationPreview(a){
  evalGauntletContract(a);
  if(a.mode==='boss_run') return gauntletFinalPayout(a,gauntletEliminationPayout('boss_run',a.streak,a.atRisk));
  if(a.mode==='ladder_100') return gauntletFinalPayout(a,gauntletEliminationPayout('ladder_100',a.rank,a.atRisk));
  return gauntletFinalPayout(a,gauntletEliminationPayout('bracket64',(a.tournament&&a.tournament.roundStep)||1,a.atRisk));
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: REJOUABILITE_PACTE_ESCALADE] — affiche le niveau de stack
   (G.arcade.pactStreak, ui-08) : le joueur voit ce qu'il a à perdre en
   laissant tomber le pacte, pas seulement ce qu'il gagnerait à le prendre. ==== */
/* ==== [ANCRE: GAUNTLET_MUTATEURS_ALEATOIRES] — ajout #4 (24 ajouts,
   12/08/2026) : le badge non cliquable n'apparaît plus dès Ascension 3,
   mais uniquement quand le mutateur tiré pour cette run est
   'mut_pacte_force'. ==== */
function pactToggleBlock(a){
  const streak=a.pactStreak||0;
  const streakLine=streak>0?`<br><b class="gold">🔥 Série : ${streak}${streak>=3?' — Légendaire garantie au prochain camp !':''}</b>`:'';
  if(a.mutator&&a.mutator.id==='mut_pacte_force'){
    return `<div style="flex:1;min-width:0">
     <div class="mono small" style="display:inline-block;padding:7px 12px;border-radius:20px;border:1px solid var(--blood);color:var(--blood);font-weight:bold">⚠ Pacte obligatoire</div>
     <div class="muted small mt">Mutateur « Pacte forcé » : chaque combat ne compte que par finition (KO/TKO ou soumission), sans exception. Une victoire aux points arrête la run comme une défaite.${streakLine}</div>
   </div>`;
  }
  const on=!!a.pactActive;
  return `<div class="toggle-card" style="flex:1;min-width:0" onclick="CL.togglePact()">
     <div class="mono small" style="display:inline-block;padding:7px 12px;border-radius:20px;border:1px solid ${on?'var(--gold)':'var(--line)'};color:${on?'var(--gold)':'var(--muted)'};font-weight:bold">${on?'✓ ':'☐ '}Pacte</div>
     ${on?`<div class="muted small mt">Ce combat ne compte que par finition (KO/TKO ou soumission) — une victoire aux points arrête la run comme une défaite. En échange : camp suivant plancher Rare garanti + une compétence Légendaire/Épique dans les choix.${streakLine}</div>`:''}
   </div>`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: REJOUABILITE_PLAN_ARCADE] — resolveArcadeFight() (ui-03)
   appelait simulateFight(G.f,opp,3) SANS le 4e paramètre plan : les TACTICS
   (ui-01, déjà utilisées en carrière ET en Vs Ami via scr_vs_friend_plan) et
   le canal plan de simulateFight (engine.js) existaient mais n'étaient
   jamais branchés en arcade — aucune décision par combat, contrairement à
   la carrière. Écran calqué sur scr_vs_friend_plan (déjà un précédent pour
   un vestiaire allégé hors carrière), routé depuis les 3 hubs avant
   CL.fightArcade(). ==== */
function scr_arcade_plan(){
  const f=G.f, opp=G.arcade.opponent;
  if(!opp) return `<div class="scr center intro"><p class="lede">Aucun adversaire pour l’instant.</p><button class="btn ghost mt" onclick="CL.go('arcadehub')">Retour</button></div>`;
  const plans=TACTICS[f.style]||[];
  /* ==== [ANCRE: BOSSRUN_MISE_EN_SCENE] — ajout #3 (24 ajouts, 12/08/2026) :
     en Boss Run, tant que le boss n'est pas révélé (scr_boss_reveal, après
     ce choix de tactique), le joueur choisit sa consigne À L'AVEUGLE — ni le
     nom de l'adversaire ni l'analyse tactique (qui exposerait ses stats
     réelles) ne doivent transparaître ici. ==== */
  const isBossBlind=(G.arcade.mode==='boss_run' && !G.arcade.revealed)||(G.arcade.mutator&&G.arcade.mutator.id==='mut_mise_a_nu');
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: ITEM_TACTIQUE_PAR_ARCHETYPE] — la tactique exclusive de
     l'archétype (ARCADE_EXCLUSIVE_TACTICS, ui-03) passe en tête de liste,
     avant les tactiques exclusives génériques (allonge/densité, engine.js) et
     les 3 options de style partagées — c'est la plus spécifique au
     combattant, elle doit être la première chose vue. ==== */
  const archTactic=ARCADE_EXCLUSIVE_TACTICS[f.nick];
  const combined=(archTactic?[archTactic]:[]).concat(getExclusiveTactics(f)).concat(plans);
  /* ==== [ANCRE: GAUNTLET_BRUIT_DU_MILIEU] — sur les combats à fort enjeu
     (cf. gauntletRumorActive, ui-03), l'analyse tactique VÉRIDIQUE
     (tacticalRead) est remplacée par une rumeur — parfois fausse, jamais
     signalée comme telle. Le joueur choisit sa tactique sur ce qu'il
     entend, pas sur les vrais chiffres. ==== */
  /* ==== [ANCRE: PREPARATION_CIBLEE] — ajout #23 (24 ajouts, 12/08/2026) :
     rumorActive ET percée (G.arcade.analysisPierced) -> analyse véridique
     malgré le fort enjeu. Le bouton de percée n'apparaît que si la rumeur
     est active, pas encore percée, et l'adversaire n'est pas déjà masqué
     par ailleurs (isBossBlind) — inutile de payer pour percer une rumeur
     qu'on ne peut de toute façon pas encore voir. ==== */
  const rumorActive=gauntletRumorActive(G.arcade) && !G.arcade.analysisPierced;
  const analysis=isBossBlind?'Adversaire non identifié — tu choisis ta consigne à l\u2019aveugle, sans scouting possible avant ce combat.':(rumorActive?gauntletRumorText(opp):tacticalRead(f,opp));
  const analysisLabel=isBossBlind?'Inconnu':(rumorActive?'Rumeur':(gauntletRumorActive(G.arcade)?'Analyse (percée)':'Analyse'));
  const pierceButton=(!isBossBlind && rumorActive)?`<div class="mono small mt"><span onclick="CL.pierceRumor()" style="cursor:pointer;color:var(--gold);text-decoration:underline dotted">🔍 L\u2019Analyse — percer la rumeur pour ce combat (-2 Intelligence tactique)</span></div>`:'';
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: CORRECTIF_ANALYSE_COLLEE] — bug remonté : .hero-name a un
     interlignage très serré (line-height:.92) sans marge basse, et cette
     carte n'avait aucun padding en haut (padding:0 ...) — rien ne sépare
     le nom des combattants de l'encadré d'analyse juste en dessous. Sur
     l'écran équivalent en carrière (scr_plan, ui-06), le même padding:0
     passe inaperçu car renderFightPoster (l'affiche de combat, absente
     ici en Gauntlet) apporte déjà 24px de marge basse. ==== */
  return `<div class="scr"><div class="bar"><span class="eyebrow">Gauntlet · Plan de combat</span></div>
   <div class="hero-name" style="text-align:center;font-size:20px">${esc(f.nick||f.name)} <span class="muted">vs</span> ${isBossBlind?'<span style="color:var(--muted)">???</span>':esc(opp.name)}</div>
   <div class="card mt" style="border-color:transparent;padding:14px 0 16px 0">
     <div class="muted small" style="border-left:2px solid var(--gold);padding-left:10px"><b>${analysisLabel} :</b> ${analysis}</div>
     ${pierceButton}
   </div>
   <p class="lede small mt">Quelle est ta consigne tactique pour ce combat ?</p>
   ${combined.map((p,i)=>`<div class="opp" onclick="CL.chooseArcadePlan(${i})">
     <div class="opp-top"><span class="opp-nm gold">${p.lbl}</span></div>
     <div class="opp-read" style="margin-top:4px;opacity:1">${p.desc}</div></div>`).join('')}
   <button class="btn ghost mt" onclick="CL.chooseArcadePlan(-1)">Aucune consigne particulière</button>
  </div>`;
}
/* ==== [ANCRE: BOSSRUN_MISE_EN_SCENE] — ajout #3 (24 ajouts, 12/08/2026) :
   écran de reveal intercalé entre le choix de tactique (à l'aveugle,
   scr_arcade_plan) et la résolution réelle du combat (resolveArcadeFight,
   ui-03). Le malus (G.arcade.bossMalus) est tiré UNE FOIS par
   CL.chooseArcadePlan (ui-08) avant d'arriver ici, pas à chaque render —
   sinon il changerait à chaque re-render de cet écran. Aucune tactique
   n'est modifiable ici (pas de bouton retour vers scr_arcade_plan),
   volontairement : la surprise est déjà consommée. Animation d'entrée via
   la classe CSS .boss-reveal-in (cf. index.html — à défaut, dégradation
   silencieuse en simple apparition si la classe n'existe pas dans le CSS). ==== */
function scr_boss_reveal(){
  const a=G.arcade, opp=a.opponent, m=a.bossMalus;
  if(!opp||!m) return `<div class="scr center intro"><p class="lede">Rien à révéler pour l’instant.</p><button class="btn ghost mt" onclick="CL.go('arcadehub')">Retour</button></div>`;
  return `<div class="scr center intro boss-reveal-in">
   <div class="eyebrow" style="color:var(--blood);letter-spacing:2px">LE VOILE TOMBE</div>
   <div class="hero-name" style="text-align:center;font-size:clamp(26px,8vw,34px);color:var(--blood)">${esc(opp.name)} ${opp.flag}</div>
   <div class="muted small mt" style="text-align:center">${opp.styleLabel} · ${opp.age} ans · OVR ${opp.overall}</div>
   ${rivalBadge(opp)}
   <div class="card glass mt" style="background:var(--panel2);border:1px solid var(--blood);padding:14px;text-align:center">
     <div class="eyebrow mb" style="color:var(--blood)">Le boss impose son terme</div>
     <div class="mono" style="color:var(--blood);font-weight:bold">${Math.sign(m.amount)>=0?'+':''}${Math.sign(m.amount)*Math.max(1,Math.round(Math.abs(m.amount)/5))} ${m.label} <span class="muted small">(ce combat uniquement)</span></div>
     <div class="muted small mt">Tiré au hasard à chaque reveal — jamais toujours la même stat visée.</div>
   </div>
   <button class="btn primary mt" style="font-size:20px;padding:18px;background:var(--blood);border-color:var(--blood)" onclick="CL.confirmBossReveal()">ENTRER DANS LA CAGE</button>
  </div>`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: GAUNTLET_SORTIE_UNIQUE] — item demandé : « personne n'accepte
   d'encaisser et partir ». Décision de design confirmée, pas un bug — les
   barèmes de GAUNTLET_FIN_DE_RUN étaient sains (sortir a toujours rapporté
   strictement plus qu'une élimination au même palier). L'option existait
   sur les 3 formats mais n'était jamais choisie : abandonner la run garde
   la cagnotte accessible plus tard sans y renoncer maintenant, elle
   dominait donc systématiquement l'encaissement. Un seul point de sortie
   reste : « Abandonner la run » (0 pt, déjà présent partout). ==== */
function scr_arcadehub(){ const f=G.f, a=G.arcade;
  if(a.mode==='boss_run'){
    /* ==== [ANCRE: REJOUABILITE_BANQUE_BOSSRUN] — a.banked (ui-08) affiché
       comme cagnotte visible, avec ce qui est en jeu si le KO suivant échoue
       (eliminationPreview) juste en-dessous : la tension risque/récompense
       doit être LISIBLE, pas seulement calculée en coulisses. ==== */
    return `<div class="scr center intro"><div class="eyebrow" style="color:var(--blood)">GAUNTLET // RUN EN COURS</div>
   <div class="hero-name" style="text-align:center">${a.streak} / ${a.target}<em style="color:var(--muted)">${f.nick} ${f.flag} — ${recordStr(f)} sur cette run</em></div>
   <div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--line);padding:12px;text-align:center;margin-top:12px;border-left:3px solid var(--gold)">
     <div class="mono small gold" style="font-weight:bold">⚠ SEULE UNE FINITION COMPTE — une victoire aux points arrête la série.</div>
   </div>
   <div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--line);padding:16px;text-align:left;margin-top:12px">
     <div class="eyebrow mb">Prochain adversaire</div>
     ${a.revealed?`${rivalBadge(a.opponent)}
     <div class="hero-name" style="font-size:clamp(22px,6vw,28px)">${esc(a.opponent.name)} ${a.opponent.flag}</div>
     <div class="muted small mt">${a.opponent.styleLabel} · ${a.opponent.age} ans</div>`:
     /* ==== [ANCRE: BOSSRUN_MISE_EN_SCENE] — ajout #3 (24 ajouts, 12/08/2026) :
        identité et stats du boss masquées jusqu'au reveal (scr_boss_reveal,
        déclenché juste avant le combat, après le choix de tactique à
        l'aveugle). ==== */
     `<div class="hero-name" style="font-size:clamp(22px,6vw,28px);color:var(--muted)">??? <span style="filter:blur(4px)">████████</span></div>
     <div class="muted small mt">Identité inconnue — révélée juste avant le combat.</div>`
     /* ==== [FIN ANCRE] ==== */}</div>
   ${gauntletStatusBlock(a)}
   <div style="display:flex;gap:10px;margin-top:12px">${atRiskToggleBlock(a)}</div>
   <button class="btn primary mt" style="font-size:20px;padding:18px" onclick="CL.fightArcade()">COMBATTRE</button>
   <button class="btn ghost" onclick="CL.go('title')">Abandonner la run (0 pt)</button></div>`;
  }
  if(a.mode==='ladder_100'){
    /* ==== [ANCRE: GAUNTLET_MUTATEURS_ALEATOIRES] — ajout #4 (24 ajouts,
       12/08/2026) : "Mise à nu" masque aussi les cibles du Ladder 100 — le
       gap de rang (signal de risque principal) reste visible, seule
       l'identité/le profil sont cachés. ==== */
    const mutBlind=G.arcade.mutator&&G.arcade.mutator.id==='mut_mise_a_nu';
    /* ==== [FIN ANCRE] ==== */
    const targets=a.targets||[];
    const targetCard=t=>{
      const gap=a.rank-t.ladderRank;
      const riskLabel=gap>=18?'AGRESSIF':gap>=10?'MÉDIAN':'SÛR';
      const riskColor=gap>=18?'var(--blood)':gap>=10?'var(--gold)':'var(--sage)';
      if(mutBlind){
        return `<div class="opp" style="border-left:3px solid ${riskColor};cursor:pointer" onclick="CL.pickLadderTarget(${t.ladderRank})">
        <div class="mono small" style="color:${riskColor};font-weight:bold">${riskLabel} · +${gap} rangs</div>
        <div class="opp-top"><span class="opp-nm gold">Rang #${t.ladderRank} — ??? <span style="filter:blur(3px)">████</span></span></div>
        <div class="muted small mt">Identité inconnue — Mise à nu.</div>
      </div>`;
      }
      return `<div class="opp" style="border-left:3px solid ${riskColor};cursor:pointer" onclick="CL.pickLadderTarget(${t.ladderRank})">
        <div class="mono small" style="color:${riskColor};font-weight:bold">${riskLabel} · +${gap} rangs</div>
        ${rivalBadge(t)}
        <div class="opp-top"><span class="opp-nm gold">Rang #${t.ladderRank} — ${esc(t.name)} ${t.flag}</span></div>
        <div class="muted small mt">${t.styleLabel} · OVR ${t.overall}</div>
      </div>`;
    };
    return `<div class="scr center intro"><div class="eyebrow" style="color:var(--sage)">WTUMMA // ASCENSION</div>
   <div class="hero-name" style="text-align:center">RANG #${a.rank}<em style="color:var(--muted)">${f.nick} ${f.flag} — Objectif #1</em></div>
   <p class="lede small mt">Choisissez votre cible — plus le saut de rang est grand, plus l\u2019adversaire est fort.</p>
   ${targets.map(targetCard).join('')}
   ${(a.aggroCooldown>0)?`<div class="mono small muted" style="text-align:center;margin-top:8px">Fenêtre de tir agressive fermée — encore ${a.aggroCooldown} palier(s).</div>`:''}
   ${gauntletStatusBlock(a)}
   <div style="display:flex;gap:10px;margin-top:12px">${pactToggleBlock(a)}${atRiskToggleBlock(a)}</div>
   <button class="btn ghost" onclick="CL.go('title')">Abandonner la run (0 pt)</button></div>`;
  }
  /* ==== [ANCRE: GAUNTLET_MUTATEURS_ALEATOIRES] — ajout #4 (24 ajouts,
     12/08/2026) : "Mise à nu" masque aussi le prochain adversaire du
     Bracket 64. ==== */
  const mutBlindBr=G.arcade.mutator&&G.arcade.mutator.id==='mut_mise_a_nu';
  /* ==== [FIN ANCRE] ==== */
  if(!a.tournament) return `<div class="scr center intro"><p class="lede">Aucun tableau en cours.</p><button class="btn ghost mt" onclick="CL.go('title')">Retour</button></div>`;
  return `<div class="scr center intro"><div class="eyebrow" style="color:var(--blood)">WTUMMA // ${a.tournament.stepName.toUpperCase()}</div>
   <div class="hero-name" style="text-align:center">CLASSÉ #${f.seed}<em style="color:var(--muted)">${f.nick} ${f.flag}</em></div>
   <div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--line);padding:16px;text-align:left;margin-top:20px">
     <div class="eyebrow mb">Prochain adversaire${mutBlindBr?'':` : classé #${a.opponent.seed}`}</div>
     ${mutBlindBr?`<div class="hero-name" style="font-size:clamp(22px,6vw,28px);color:var(--muted)">??? <span style="filter:blur(4px)">████████</span></div>
     <div class="muted small mt">Identité inconnue — Mise à nu.</div>`:`${rivalBadge(a.opponent)}
     <div class="hero-name" style="font-size:clamp(22px,6vw,28px)">${esc(a.opponent.name)} ${a.opponent.flag}</div>
     <div class="muted small mt">${gauntletRumorActive(a)?a.opponent.styleLabel:`${a.opponent.styleLabel} · OVR ${a.opponent.overall}`}</div>`}</div>
   ${gauntletStatusBlock(a)}
   <div style="display:flex;gap:10px;margin-top:12px">${pactToggleBlock(a)}${atRiskToggleBlock(a)}</div>
   <button class="btn primary mt" style="font-size:20px;padding:18px" onclick="CL.fightArcade()">COMBATTRE (${a.tournament.stepName.toUpperCase()})</button>
   <button class="btn ghost" onclick="CL.go('title')">Abandonner la run (0 pt)</button>
   <button class="btn ghost" style="margin-top:8px;opacity:0.75" onclick="CL.viewBracket()">Voir le tableau complet</button></div>`;
}
/* ==== [ANCRE: ECRAN_ARCADE_UPGRADES] — camp d'entraînement roguelite entre
   chaque tour du Bracket 64 : un entraînement + une compétence à choisir. ==== */
function scr_arcade_upgrades(){
  const a=G.arcade, f=G.f, g=groupAvg(f);
  if(!a.upgradesChosen||!a.skillOpts||!a.trainOpts) return `<div class="scr center intro"><p class="lede">Rien à choisir pour l’instant.</p><button class="btn ghost mt" onclick="CL.go('arcadehub')">Retour</button></div>`;
  const stepName=a.tournament?a.tournament.stepName:'Ascension';
  const grp=(key,title,avg)=>`<div class="card"><div class="grp-h"><span class="disp" style="font-size:17px">${title}</span><span class="gold mono">${d20(avg)}/20</span></div>
     ${ATTR[key].map(att=>`<div class="attr"><span class="attr-l">${att[1]}</span>${gauge(f.attrs[att[0]])}<span class="attr-v">${d20(f.attrs[att[0]])}</span></div>`).join('')}</div>`;
  let h=`<div class="scr"><div class="bar"><span class="eyebrow">WTUMMA // AMÉLIORATIONS</span></div>`;
  if(!a.upgradesChosen.skill){
    h+=`<p class="lede small">L\u2019étau se resserre. Sélectionnez une nouvelle compétence pour la suite du parcours.</p>
        <div class="eyebrow mt mb" style="color:var(--gold)">1. NOUVELLE COMPÉTENCE (${stepName})</div>`;
    a.skillOpts.forEach((s,i)=>{
      const color=RAR_COLORS[s.rar]||'var(--gold)';
      h+=`<div class="opp" style="border-left:3px solid ${color}" onclick="CL.pickArcadeSkill(${i})">
            <b style="color:${color}">${s.name}</b> <span class="muted small">(${s.rar})</span>
            <div class="muted small mt">${s.desc||s.blurb||''}</div>
            ${s.fx?`<div class="mono small mt" style="color:var(--win)">${formatSkillFx(s.fx,f)}</div>`:''}</div>`;
    });
    /* ==== [ANCRE: GAUNTLET_CAMP_MAUDIT] — 4e carte, visuellement séparée des 3
       options normales : une Légendaire/Mythique garantie payée par un malus
       permanent sur la run. C'est le seul choix du camp qui puisse EMPIRER le
       combattant, donc le seul qui demande un arbitrage réel. ==== */
    if(a.cursedOpt){
      const cs=a.cursedOpt;
      /* ==== [ANCRE: ITEM_LISIBILITE_GAINS_ATTRIBUTS] — même traitement que
         formatSkillFx (ui-07) : "avant → après" plutôt qu'un delta brut sans
         repère. La séquelle maudite ne connaît pas de plafond haut (elle ne
         fait que baisser), pas besoin de reproduire que la borne basse
         (clamp 1-100 via d20 à l'affichage). ==== */
      const deltasTxt=cs.d.map(x=>{ const k=x[0], v=x[1];
        const lbl=k==='morale'?'Moral':k==='form'?'Forme':attrLabel(k);
        const before=k==='morale'?f.morale:k==='form'?f.form:f.attrs[k];
        const after=Math.max(1,before+v);
        return `<span class="dlt dn">${lbl} ${d20(before)} → ${d20(after)}</span>`; }).join('');
      /* ==== [ANCRE: CORRECTIF_PACTE_CAMP_BONUS_MASQUE] — bug remonté : les 3
         cartes de compétence normales affichent formatSkillFx(s.fx,f) (les
         bonus), mais cette carte n'affichait que deltasTxt (le malus de la
         malédiction) — le bonus propre à la compétence garantie (cs.skill.fx)
         n'était jamais montré, donc la carte avait l'air d'un pur malus et
         personne ne la choisissait. ==== */
      h+=`<div class="eyebrow mt mb" style="color:var(--blood)">PACTE DU CAMP — OPTION MAUDITE</div>
          <div class="opp" style="border-left:3px solid var(--blood)" onclick="CL.pickCursedSkill()">
            <b style="color:${RAR_COLORS[cs.skill.rar]||'var(--gold)'}">${cs.skill.name}</b> <span class="muted small">(${cs.skill.rar}) — garantie</span>
            <div class="muted small mt">${cs.skill.desc||cs.skill.blurb||''}</div>
            ${cs.skill.fx?`<div class="mono small mt" style="color:var(--win)">${formatSkillFx(cs.skill.fx,f)}</div>`:''}
            <div class="mono small mt" style="color:var(--blood)"><b>${cs.curseLabel}</b> — séquelle permanente sur cette run</div>
            <div class="dlts">${deltasTxt}</div>
          </div>`;
      /* ==== [FIN ANCRE] ==== */
    }
    /* ==== [FIN ANCRE] ==== */
    if(!a.skillOpts.length && !a.cursedOpt) h+=`<div class="card glass mt"><span class="muted small">Aucune compétence disponible pour l\u2019instant.</span></div>
          <button class="btn ghost mt" onclick="CL.pickArcadeSkill(-1)">Continuer vers le camp</button>`;
  } else if(!a.upgradesChosen.train){
    h+=`<p class="lede small">Sélectionnez un ajustement physique.</p>
        <div class="eyebrow mt mb" style="color:var(--gold)">2. CONDITIONNEMENT & SPARRING</div>`;
    a.trainOpts.forEach((t,i)=>{
      /* ==== [ANCRE: ITEM_LISIBILITE_GAINS_ATTRIBUTS] — item demandé : "+2
         Cardio" n'indiquait jamais où en est réellement le combattant, ni si
         l'attribut est déjà à son plafond de potentiel. Même convention
         "avant → après" que formatSkillFx (ui-07) et le récapitulatif
         post-combat (ui-06). Un attribut déjà au plafond affiche sa valeur
         telle quelle avec la mention, plutôt qu'un gain qui ne
         s'appliquerait pas réellement une fois applyDeltas() exécuté. ==== */
      /* ==== [ANCRE: GAINS_QUI_MONTENT_REELLEMENT] — même règle que
         formatSkillFx (ui-07) : on ne liste que les attributs dont la note
         sur 20 change vraiment. Un malus, lui, reste toujours affiché même
         s'il ne fait pas bouger la note : masquer une perte tromperait le
         joueur, alors que masquer un gain nul ne fait que retirer du bruit. ==== */
      const deltas=t.d.map(([k,v])=>{ const lbl=k==='morale'?'Moral':k==='form'?'Forme':attrLabel(k);
        const before=k==='morale'?f.morale:k==='form'?f.form:f.attrs[k];
        if(v>0 && k!=='morale' && k!=='form'){
          let cap=(f.maxAttrs && f.maxAttrs[k]!=null) ? f.maxAttrs[k] : f.potential+4;
          if(f.agedCeilings && f.agedCeilings[k]!=null) cap=Math.min(cap, f.agedCeilings[k]);
          if(before>=cap) return '';
          const capped=Math.min(before+v,cap);
          if(d20(before)===d20(capped)) return '';
          return `<span class="dlt up">${lbl} ${d20(before)} → ${d20(capped)}</span>`;
        }
        const after=k==='morale'||k==='form'?clamp(before+v,0,100):Math.max(1,before+v);
        if(v>=0 && d20(before)===d20(after)) return '';
        return `<span class="dlt ${v>=0?'up':'dn'}">${lbl} ${d20(before)} → ${d20(after)}</span>`; }).filter(Boolean).join('')
        || `<span class="dlt">Progression légère</span>`;
      h+=`<div class="opp" onclick="CL.pickArcadeTrain(${i})"><div class="opp-top"><span class="opp-nm">${t.label}</span></div>
            <div class="opp-mid">${t.hint}</div><div class="dlts">${deltas}</div></div>`;
    });
  } else {
    /* ==== [CORRECTIF ARCADE_UPGRADES_IMPASSE] — upgradesChosen.skill ET
       .train déjà vrais tous les deux (sauvegarde rechargée pile entre la
       dernière écriture d'état et le CL.go('arcadehub') qui suit
       normalement) : aucune des deux branches ci-dessus ne rend quoi que ce
       soit, et l'écran restait sans bouton de sortie. Repli "Continuer",
       même geste que pickArcadeSkill(-1) plus haut. ==== */
    h+=`<p class="lede small">Rien de plus à choisir ici.</p>
        <button class="btn ghost mt" onclick="CL.go('arcadehub')">Continuer</button>`;
  }
  /* ==== [ANCRE: REJOUABILITE_CAMP_RECUPERATION] — la forme (attritionHeal(),
     ui-08) décroît réellement avec la profondeur de la run mais restait
     invisible sur cet écran, rendant l'option "Récupération active"
     (ui-03) illisible faute de référence. Jauge affichée juste avant les
     groupes d'attributs, même style que le reste de l'écran. ==== */
  /* ==== [ANCRE: GAUNTLET_SANS_MORAL_FORME] — le bloc jauge « Forme /
     Récupération de la run » est retiré : la valeur n'est plus lue par eff()
     en arcade et n'a donc plus rien à communiquer. L'état passif de la run
     (contrat, cagnotte, séquelles, multiplicateur) reste le seul bloc de
     contexte avant les attributs. ==== */
  h+=`<div class="hr" style="margin:24px 0"></div>
      ${gauntletStatusBlock(a)}
      ${gauntletInfirmaryBlock(a)}
      ${ringDoctorUltimatumBlock(a)}
      <div class="eyebrow mb mt">Attributs du combattant (temps réel)</div>
      ${grp('tech','Technique',g.tech)}${grp('ment','Mental',g.ment)}${grp('phys','Physique',g.phys)}
  </div>`;
  /* ==== [FIN ANCRE] ==== */
  return h;
}
/* ==== [ANCRE: IDENTITE_DE_CAMP] — ajout #22 (24 ajouts, 12/08/2026) : écran
   de choix, une seule fois par run, avant le premier combat — les deltas
   sont montrés directement en /20 (division par 5) pour rester cohérent
   avec l'échelle affichée partout ailleurs dans l'UI. ==== */
function scr_camp_identity_pick(){
  const opts=G.arcade.campIdentityOptions||[];
  return `<div class="scr center intro"><div class="eyebrow sage">Avant le premier combat</div>
   <h2 class="disp big">IDENTITÉ DE CAMP</h2>
   <p class="lede">Un choix définitif, pour toute la durée de cette run.</p>
   ${opts.map((c,i)=>{
     const fxTxt=Object.entries(c.fx).map(([k,v])=>{
       const cur=d20(G.f.attrs[k]); const proj=d20(clamp(G.f.attrs[k]+v,1,100));
       return `<span class="dlt ${v>0?'up':'dn'}">${attrLabel(k)} ${cur} → ${proj}</span>`;
     }).join('');
     /* ==== [ANCRE: PASSIF_IDENTITE_DE_CAMP] — item demandé : le passif doit
        être explicite au moment du choix, pas découvert en cours de run.
        Ligne distincte du delta de stats (fxTxt), absente pour Camp du
        Silence (passive:null, aucun passif). ==== */
     const passiveTxt=c.passive?`<div class="mono small mt gold">⚡ ${c.passive.label}</div>`:'';
     /* ==== [FIN ANCRE] ==== */
     return `<div class="opp" onclick="CL.pickCampIdentity(${i})">
       <div class="opp-top"><span class="opp-nm gold">${c.name}</span></div>
       <div class="opp-read" style="margin-top:4px;opacity:1">${c.desc}</div>
       <div class="dlts mt">${fxTxt}</div>
       ${passiveTxt}
     </div>`;
   }).join('')}
  </div>`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: INFIRMERIE_FORTUNE] — ajout #20 (24 ajouts, 12/08/2026) :
   affiché sur l'écran de camp Gauntlet (scr_arcade_upgrades ci-dessus)
   uniquement si au moins une zone porte une séquelle — rien à soigner, rien
   à afficher. ==== */
function gauntletInfirmaryBlock(a){
  const zones=['tete','corps','jambes'].filter(z=>(a.runInjuries||[]).some(i=>i.zone===z));
  if(!zones.length) return '';
  const meta=loadMetaStats(); const pts=meta.legendPoints||0;
  return `<div class="glass mwash mt" style="position:relative;background:var(--panel2);border:1px solid var(--loss);padding:12px;text-align:left">
     <div class="eyebrow mb" style="color:var(--loss)">🩹 Infirmerie de fortune</div>
     <div class="muted small mb">Soigne UNE zone anatomique contre des points de Légende — les autres séquelles restent actives.</div>
     ${zones.map(z=>{
       const cost=gauntletInfirmaryCost(a,z);
       const canAfford=pts>=cost;
       const names=(a.runInjuries||[]).filter(i=>i.zone===z).map(i=>i.name).join(', ');
       return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--line)">
         <div><b class="small">${GAUNTLET_ZONE_LABEL[z]}</b><div class="muted small">${names}</div></div>
         <button class="btn ghost" style="padding:6px 10px;width:auto;font-size:11px;border-color:${canAfford?'var(--loss)':'var(--line)'};color:${canAfford?'var(--loss)':'var(--muted)'}" onclick="CL.healGauntletZone('${z}')" ${canAfford?'':'disabled'}>Soigner — ${cost} pts</button>
       </div>`;
     }).join('')}
   </div>`;
}
/* ==== [ANCRE: ULTIMATUM_MEDECIN] — ajout #24 (24 ajouts, 12/08/2026) :
   affiché sur le même écran de camp que l'Infirmerie de fortune, juste en
   dessous, quand ringDoctorUltimatumActive(a) (ui-03) est vraie — 2 issues
   franches, aucune ambiguïté sur ce que chacune implique. ==== */
function ringDoctorUltimatumBlock(a){
  if(!ringDoctorUltimatumActive(a)) return '';
  return `<div class="glass mwash mt" style="position:relative;background:var(--panel2);border:1px solid var(--blood);padding:14px;text-align:left">
     <div class="eyebrow mb" style="color:var(--blood)">🩺 Ultimatum du médecin de ring</div>
     <div class="muted small mb">Le combattant encaisse trop de séquelles pour continuer sereinement. Le médecin exige une décision.</div>
     <div style="display:flex;gap:10px;flex-wrap:wrap">
       <button class="btn ghost" style="border-color:var(--sage);color:var(--sage);flex:1;min-width:140px" onclick="CL.acceptRingDoctor()">Accepter — encaisser proprement maintenant</button>
       <button class="btn ghost" style="border-color:var(--blood);color:var(--blood);flex:1;min-width:140px" onclick="CL.refuseRingDoctor()">Refuser — continuer (×1.5 si victoire finale)</button>
     </div>
   </div>`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: COACHING_ENTRE_ROUNDS] — ajout #21 (24 ajouts, 12/08/2026) :
   écran de pause entre 2 rounds — dégâts encaissés/infligés ce round-là +
   tendance des juges (cumulée sur les rounds déjà joués), puis nouvelle
   consigne tactique pour le round suivant. Même construction de liste de
   tactiques que scr_arcade_plan (archétype exclusif + exclusive style +
   3 options de style) pour rester cohérent avec l'écran de pré-combat. ==== */
function scr_coaching_round(){
  const a=G.arcade, c=a.coaching, f=G.f;
  if(!c||!c.lastRoundRes) return `<div class="scr center intro"><p class="lede">Rien à ajuster pour l’instant.</p><button class="btn ghost mt" onclick="CL.go('arcadehub')">Retour</button></div>`;
  const r=c.lastRoundRes;
  const archTactic=ARCADE_EXCLUSIVE_TACTICS[f.nick];
  const combined=(archTactic?[archTactic]:[]).concat(getExclusiveTactics(f)).concat(TACTICS[f.style]||[]);
  /* ==== [ANCRE: REFONTE_ECRAN_COACHING] — item demandé : refonte visuelle de
     cet écran uniquement (pas la transition ni le rendu de combat). Le
     "total combiné" (c.scoreA/c.scoreB, somme des 3 juges, jusqu'à 90 sur 3
     rounds) est remplacé par le vrai détail PAR JUGE (c.judges, corrigé
     ci-dessus dans runCoachingRound) — chaque juge reste sur 10 par round
     vu, jusqu'à 30 en fin de combat, même convention que scr_result (ui-06).
     Réutilise .duel2/.num TEL QUEL (mêmes classes, mêmes couleurs a/b/dn)
     pour que la tendance mi-combat ressemble visuellement au scorecard final
     — même langage, deux moments différents. ==== */
  const roundJustEnded=c.round-1;
  /* ==== [ANCRE: ESTIMATION_JUGES_COACHING] — affichage de l'ESTIMATION
     (c.judgesEstimate, calculée dans runCoachingRound), jamais du vrai
     score (c.judges) — repli sur c.judges seulement si une sauvegarde
     antérieure à ce correctif n'a pas encore ce champ. ==== */

  /* ==== [ANCRE: COACH_DU_COIN] — item demandé : la fin de round ressemblait
     à une fin de COMBAT (grand "FIN DU ROUND", scorecard des juges façon
     décision finale), alors que c'est une pause : le combat reprend juste
     après. L'écran dit maintenant explicitement combien de rounds restent
     et à quoi sert cet arrêt, et l'estimation chiffrée des juges — du
     jargon de scorecard — est REMPLACÉE par ce que dit le coach, avec des
     mots : plus aucun chiffre de juge sur cet écran. ==== */
  const totalRounds=(G.fight&&G.fight.rounds)||3;
  const restants=Math.max(0,totalRounds-roundJustEnded);
  const verdict=coachScoreLine(a,c);
  const conseil=coachAdviceLine(a,c,r,f);
  /* ==== [FIN ANCRE] ==== */
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: SECOND_SOUFFLE] — ajout #24 (24 ajouts, 12/08/2026) : offre
     rare, affichée une seule fois (avant le round 3, si l'offre a été tirée
     favorable côté runCoachingRound) — disparaît dès qu'utilisée. ==== */
  const secondSouffleBlock=(c.secondSouffleAvailable && !c.secondSouffleUsed)?`<div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--gold);padding:14px;text-align:left;margin-bottom:12px">
     <div class="eyebrow mb" style="color:var(--gold)">✨ Second Souffle</div>
     <div class="muted small">Mené sur les cartes après 2 rounds — une dernière réserve, pour ce round uniquement (+2 Sang-froid, +2 Cardio, +2 Puissance, +2 Menton).</div>
     <button class="btn ghost mt" style="border-color:var(--gold);color:var(--gold);padding:6px 10px;width:auto" onclick="CL.acceptSecondSouffle()">Puiser dans les réserves</button>
   </div>`:'';
  /* ==== [FIN ANCRE] ==== */
  return `<div class="scr"><div class="bar"><span class="eyebrow">DANS TON COIN · ENTRE LES ROUNDS</span></div>
   <div class="card glass raise" style="text-align:center;background:linear-gradient(180deg,var(--panel2) 0%,var(--bg) 100%);border-color:var(--gold-d);padding:18px 16px;margin-bottom:16px;position:relative;overflow:hidden">
     <div style="position:absolute;top:-30px;right:-10px;font-size:120px;opacity:0.05;font-family:'Oswald';font-weight:700;color:var(--gold);pointer-events:none;z-index:0;line-height:1">${roundJustEnded}</div>
     <div class="eyebrow gold mb" style="position:relative;z-index:2;letter-spacing:0.3em">PAUSE — ROUND ${roundJustEnded} TERMINÉ</div>
     <div class="muted small" style="position:relative;z-index:2">Le combat n\u2019est pas fini : il reste ${restants} round${restants>1?'s':''}. Tu es dans ton coin, c\u2019est le moment de choisir la consigne du round suivant.</div>
     <div class="mono small mt" style="position:relative;z-index:2">Coups placés <b style="color:var(--sage)">${(r.stats.B.dmgHead+r.stats.B.dmgBody+r.stats.B.dmgLegs)}</b> · Coups encaissés <b style="color:var(--loss)">${(r.stats.A.dmgHead+r.stats.A.dmgBody+r.stats.A.dmgLegs)}</b></div>
   </div>
   <!-- ==== [CORRECTIF V2-31 point 2] — "un coach ne parle pas en
        paragraphe entre deux rounds, il lâche trois choses" : les deux
        répliques apparaissent l'une après l'autre (délai ~450ms), pas
        d'un bloc. Rien ne bloque l'interaction pendant l'animation (les
        boutons de consigne plus bas restent cliquables immédiatement) :
        un seul tap suffit toujours, jamais besoin d'en attendre un second
        pour que la mise en scène se termine (règle V2-31 point 3). ==== -->
   <div class="card mb" style="background:var(--panel2);border-left:3px solid var(--gold);padding:14px">
     <div class="small" style="color:var(--text);opacity:0;animation:fade .3s ease .05s forwards">${verdict}</div>
     <div class="small mt" style="color:var(--gold);opacity:0;animation:fade .3s ease .45s forwards">« ${conseil} »</div>
   </div>
   ${secondSouffleBlock}
   <div class="eyebrow gold mb" style="letter-spacing:0.2em">TA CONSIGNE POUR LE ROUND ${c.round}</div>
   <!-- ANCRE IDENTITE_TOUJOURS_VISIBLE : les consignes proposées dépendent de
        la discipline du combattant, autant la rappeler juste au-dessus. -->
   <div class="mb">${gauntletIdentityRow(f)}</div>
   ${combined.map((p,i)=>`<div class="opp" onclick="CL.pickCoachingTactic(${i})">
     <div class="opp-top"><span class="opp-nm gold" style="font-size:17px">${p.lbl}</span></div>
     <div class="opp-read" style="margin-top:4px;opacity:1">${p.desc}</div></div>`).join('')}
   <button class="btn ghost mt" onclick="CL.pickCoachingTactic(-1)">Garder la même consigne</button>
  </div>`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [FIN ANCRE] ==== */
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: TITLE_ELIGIBLE] — condition UNIQUE, partagée par genOpponents()
   et fightKind(). Avant : les deux vérifiaient des choses différentes
   (streak vs orgWins), ce qui permettait de battre le vrai champion sans que
   le combat soit jamais reconnu comme un combat de titre. ==== */
