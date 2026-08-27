"use strict";
/* CAGE LEGACY — state/state-shop.js
   Boutique Points de Légende (meta.legendPoints/meta.unlockedItems) :
   catalogue LEGEND_UNLOCKABLES, gain (awardLegendPoints, appelle hofScore()
   de state-hof.js), vérification (checkLegendUnlock) et achat
   (purchaseLegendUnlock). Dépendance circulaire avec state-hof.js signalée
   en Phase 1 (enshrine()/equipPantheonDecoration() y appellent en retour
   awardLegendPoints()/checkLegendUnlock()) : sans effet sur le
   fonctionnement, résolution des appels à l'exécution. */
/* ==== [ANCRE: LOT14_SALLE_LEGENDES] — RÈGLE ABSOLUE VÉRIFIÉE : les
   legendPoints servent UNIQUEMENT à débloquer des modes/outils/cosmétiques.
   AUCUN bonus d'attribut, de potentiel ou de vitesse n'est injecté dans
   makeFighter() ou applyDeltas() — vérifié : aucune des fonctions ci-dessous
   ne touche à f.attrs, f.potential ni aux fonctions de création/entraînement. ==== */
const LEGEND_UNLOCKABLES=[
  /* ==== [ANCRE: GAUNTLET_MENU_HIERARCHIE] — ajout #2 (24 ajouts, 12/08/2026) :
     flag gauntlet:true sur les entrées réellement liées au Gauntlet
     (cosmétiques d'octogone utilisés en Gauntlet + archétypes + Boss Run),
     lu par scr_legends (ui-07) pour le filtre "Boutique (filtrée Gauntlet)"
     ouvert depuis scr_gauntlet_menu. Les modes 100% carrière (Vs Ami,
     Fantasy, All-Stars) et les Scénarios restent gauntlet:false (absent =
     false), volontairement exclus du filtre pour ne pas le diluer. ==== */
  {id:'tool_codex',name:'Codex Inter-carrières',cat:'Outils',cost:40,desc:'Ajoute un panneau de statistiques cumulées (compétences par rareté, carrières et combats totaux) directement dans le Codex.'},
  {id:'cosmetic_pride',name:'Toile Héritage Blanche & Bleue',cat:'Cosmétiques',cost:75,desc:'Nouveau thème visuel pour l\u2019octogone.',gauntlet:true},
  {id:'cosmetic_gold',name:'Bâche Royale (Prestige)',cat:'Cosmétiques',cost:140,desc:'Thème visuel doré pour l\u2019octogone.',gauntlet:true},
  {id:'cosmetic_neon',name:'Néons Cyberpunk',cat:'Cosmétiques',cost:105,desc:'Thème visuel nocturne et futuriste pour l\u2019octogone.',gauntlet:true},
  {id:'cosmetic_underground',name:'Béton Clandestin',cat:'Cosmétiques',cost:50,desc:'L\u2019ambiance rugueuse et sombre des combats clandestins.',gauntlet:true},
  {id:'cosmetic_crimson',name:'Arène Écarlate',cat:'Cosmétiques',cost:125,desc:'Thème visuel rouge sang pour l\u2019octogone, pour les carrières les plus brutales.',gauntlet:true},
  {id:'arch_titan',name:'Archétype : Le Titan Antique',cat:'Archétypes Arcade',cost:90,desc:'Débloque un colosse inarrêtable spécialisé en lutte pour le mode Gauntlet.',gauntlet:true},
  {id:'arch_ninja',name:'Archétype : Le Shinobi',cat:'Archétypes Arcade',cost:90,desc:'Débloque un expert en furtivité et soumissions éclairs pour le mode Gauntlet.',gauntlet:true},
  {id:'arch_brawler',name:'Archétype : Le Roi de la Rue',cat:'Archétypes Arcade',cost:95,desc:'Débloque un spécialiste de la boxe sale et de la survie pour le mode Gauntlet.',gauntlet:true},
  {id:'arch_sniper',name:'Archétype : Le Sniper',cat:'Archétypes Arcade',cost:95,desc:'Débloque un spécialiste du combat à distance en Muay Thaï pour le mode Gauntlet.',gauntlet:true},
  {id:'mode_vs_friend',name:'Défi Multijoueur (Vs Ami)',cat:'Modes annexes',cost:165,desc:'Oppose une de tes légendes retraitées au combattant d\u2019un ami, généré à la volée.'},
  {id:'mode_fantasy',name:'Fantasy Fight (Sandbox)',cat:'Modes annexes',cost:190,desc:'Simule un combat entre deux légendes de ton Panthéon.'},
  {id:'mode_boss',name:'Arcade : Boss Run',cat:'Modes annexes',cost:250,desc:'5 champions d\u2019affilée, KO uniquement. Le format le plus punitif du Gauntlet.',gauntlet:true},
  {id:'mode_allstars',name:'Tournoi All-Stars (8 Légendes)',cat:'Modes annexes',cost:270,desc:'Tournoi à élimination directe entre tes 8 meilleures légendes pour désigner ton GOAT.'},
  // ==== [ANCRE: REFONTE_SCENARIOS] — 2 scénarios réservés (cf. SCENARIOS dans
  // engine.js, champ legendUnlock). Coûts calés entre les archétypes (80) et
  // le Boss Run (220) : plus exigeants qu'un simple cosmétique/archétype
  // (un scénario entier à réussir), mais plus accessibles qu'un mode annexe
  // complet.
  {id:'scenario_finisseur',name:'Scénario : Le Finisseur',cat:'Scénarios',cost:110,desc:'Débloque le défi "Le Finisseur" : titre mondial sans jamais gagner à la décision.'},
  {id:'scenario_regne',name:'Scénario : Le Règne Sans Faille',cat:'Scénarios',cost:135,desc:'Débloque le défi "Le Règne Sans Faille" : 5 défenses de titre continental sans jamais perdre la ceinture.'},
  /* ==== [ANCRE: ENNOBLISSEMENT_PANTHEON] — ajout #10 (24 ajouts, 12/08/2026) :
     décorations "flex" pour combattants retraités. Achat PERMANENT (compte),
     mais équipement UNIQUE (une décoration donnée n'est portée que par un
     seul combattant du Panthéon à la fois — cf. equipPantheonDecoration
     plus bas, qui la retire d'un éventuel porteur précédent). Maximum 3
     équipées simultanément par combattant. gauntlet:false : ce sont des
     décorations de Panthéon (carrière), pas du contenu Gauntlet. */
  {id:'deco_frame_gold',name:'Cadre Doré (Décoration)',cat:'Décorations du Panthéon',cost:60,desc:'Cadre doré autour de la fiche du combattant retraité.'},
  {id:'deco_frame_crimson',name:'Cadre Écarlate (Décoration)',cat:'Décorations du Panthéon',cost:60,desc:'Cadre rouge sang autour de la fiche du combattant retraité.'},
  {id:'deco_glow',name:'Effet de Lumière (Décoration)',cat:'Décorations du Panthéon',cost:100,desc:'Halo lumineux doré autour du nom du combattant.'},
  {id:'deco_typography',name:'Typographie Gravée (Décoration)',cat:'Décorations du Panthéon',cost:45,desc:'Nom du combattant affiché dans une typographie ornementale exclusive.'},
  {id:'deco_diamond',name:'Palmarès en Diamant (Décoration)',cat:'Décorations du Panthéon',cost:120,desc:'Le bilan (victoires-défaites) scintille en diamant sur la fiche.'},
  /* ==== [ANCRE: TOUT_EN_BOUTIQUE] — item demandé : les contenus qui
     n'existaient qu'à travers une mécanique de rotation ou de hasard —
     offre du jour, Caisse Mystère, récompense de série quotidienne —
     rejoignent le catalogue et s'achètent directement, comme le reste.
     Leurs identifiants sont conservés tels quels : un joueur qui les avait
     déjà obtenus par l'ancien chemin les garde acquis, sans migration.
     Prix calés en haut de leur catégorie, ces articles étant les plus
     prestigieux (ils étaient rares ou exclusifs). ==== */
  {id:'excl_banner_ash',name:'Bannière Cendrée',cat:'Cosmétiques',cost:180,desc:'Thème d\u2019octogone : variante sombre et cendrée de l\u2019Arène Écarlate.',gauntlet:true},
  {id:'cosmetic_renegade',name:'Toile Braise du Renégat',cat:'Cosmétiques',cost:200,desc:'Thème d\u2019octogone : braises orange sur toile calcinée.',gauntlet:true},
  {id:'arch_lottery_phoenix',name:'Archétype : Le Phénix Cendré',cat:'Archétypes Arcade',cost:215,desc:'Débloque un combattant qui renaît de ses cendres : plus il encaisse, plus il devient dangereux.',gauntlet:true},
  {id:'excl_mask_oni',name:'Masque du Oni (Décoration)',cat:'Décorations du Panthéon',cost:145,desc:'Décoration de fiche au masque de démon, sur fond sombre.'},
  {id:'excl_gloves_relic',name:'Gants-Relique (Décoration)',cat:'Décorations du Panthéon',cost:155,desc:'Décoration de fiche au style usé et ancien, comme des gants de légende.'}
  /* ==== [FIN ANCRE] ==== */
  /* ==== [FIN ANCRE] ==== */
];
// Gain divisé par 10 par rapport au score brut : hofScore() peut dépasser 500
// pour une belle carrière (titre mondial + défenses + palmarès), ce qui
// débloquait tout le contenu en une seule retraite. Vise plusieurs semaines
// de jeu réel pour tout débloquer, pas quelques jours.
function awardLegendPoints(f){ const meta=loadMetaStats(); const earned=Math.round((hofScore(f)||0)/10); meta.legendPoints=(meta.legendPoints||0)+Math.max(0,earned); saveMetaStats(meta); }
function checkLegendUnlock(itemId){ return (loadMetaStats().unlockedItems||[]).includes(itemId); }
function purchaseLegendUnlock(itemId){
  const meta=loadMetaStats(); const item=LEGEND_UNLOCKABLES.find(i=>i.id===itemId);
  if(!item||checkLegendUnlock(itemId)) return {success:false,msg:"Invalide ou déjà possédé."};
  if((meta.legendPoints||0)>=item.cost){
    meta.legendPoints-=item.cost; if(!meta.unlockedItems) meta.unlockedItems=[]; meta.unlockedItems.push(itemId);
    saveMetaStats(meta); return {success:true,msg:`${item.name} débloqué avec succès !`};
  }
  return {success:false,msg:"Points de Légende insuffisants."};
}
/* ==== [FIN ANCRE] ==== */
