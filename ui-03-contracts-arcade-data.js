"use strict";
/* CAGE LEGACY — js/ui-03-contracts-arcade-data.js
   ============================================================================
   Fichier 3/8 issu du découpage de l'ancien ui.js monolithique (~400 Ko).
   Offres de contrat/passage pro, citations médiatiques, et toutes les données du mode Arcade (archétypes, Boss Run, Bracket 64, Ladder 100).

   IMPORTANT : ce découpage préserve l'ORDRE EXACT du code d'origine — aucune
   fonction n'a été déplacée ou réordonnée, seules des frontières de fichier
   ont été insérées à des points sûrs (toujours juste avant une déclaration de
   premier niveau, jamais au milieu d'une fonction ou d'un objet). Tous ces
   fichiers partagent la même portée globale que l'ancien ui.js (variables et
   fonctions visibles d'un fichier à l'autre, comme avant), il faut donc les
   charger dans l'ordre indiqué dans index.html : 01, 02, 03... jusqu'à 08.
   ============================================================================ */

const CONTRACT_PHRASES=[
 o=>`${o} vous veut.`,
 o=>`Vous avez tapé dans l\u2019œil de ${o}.`,
 o=>`${o} a suivi votre parcours de près.`,
 o=>`Un recruteur de ${o} s\u2019est déplacé pour vous voir combattre.`,
 o=>`${o} vous propose un contrat, séduit par vos performances.`,
];
/* ==== [FIN ANCRE] ==== */
function evaluateProOffer(f, res, oppRank){
  if(f.org!==0) return null;
  // ==== [ANCRE: CORRECTIF_PLAFOND_AGE_COOLDOWN] — bug remonté ("forcé de
  // quitter l'amateur à 28 ans au lieu de 26") : le verrou proOfferCooldown
  // (posé pour espacer les offres VOLONTAIRES précoces refusées, cf.
  // declinePro) bloquait aussi le couperet OBLIGATOIRE de 26 ans ci-dessous,
  // qui n'a rien de facultatif. Un refus d'offre vers 24-25 ans pouvait ainsi
  // laisser le cooldown actif pendant que l'âge continuait d'avancer,
  // repoussant silencieusement le passage pro obligatoire jusqu'à ce que le
  // cooldown retombe à 0. Le plafond d'âge est désormais vérifié AVANT toute
  // dépendance au cooldown, qui ne s'applique plus qu'aux offres facultatives
  // (totalFights/hypeScore) plus bas dans la fonction.
  if(f.age>=26){
    // ==== [ANCRE: CORRECTIF_FORCED_TIER_PALMARES] — bug remonté : le couperet
    // obligatoire de 26 ans retombait TOUJOURS sur baseTier=1 (palier le plus
    // bas, ex. PVM), même pour un combattant classé/en série de victoires à
    // qui une organisation bien plus prestigieuse (ex. U-Krenne) venait
    // d'être proposée juste avant. Réutilise désormais le même calcul
    // rang/hype que la branche volontaire ci-dessous, pour que le passage pro
    // forcé reflète le palmarès réel au lieu de l'ignorer.
    const hypeScoreForced=(f.ko*3.5)+(f.sub*2.5)+f.W-(f.L*0.5);
    const rkForced=divRank(f);
    let baseTier=1;
    if(rkForced<=10 || hypeScoreForced>=40) baseTier=2;
    if(rkForced<=3 || hypeScoreForced>=60) baseTier=3;
    const orgFlavor1=ORG_FLAVORS[baseTier]?pick(ORG_FLAVORS[baseTier]):ORGS[baseTier];
    const phrase1=pick(CONTRACT_PHRASES)(orgFlavor1);
    return { forced:true, msg:`La limite d\u2019âge du circuit amateur (26 ans) est atteinte (vous avez ${f.age} ans). Vous êtes forcé de passer professionnel aujourd\u2019hui ou de ranger les gants.`, orgFlavor1, phrase1, baseTier };
  }
  if((f.proOfferCooldown||0)>0) return null;
  const totalFights=f.W+f.L+f.D;
  if(totalFights<5) return null;
  const finishes=f.ko+f.sub;
  const hypeScore=(f.ko*3.5)+(f.sub*2.5)+f.W-(f.L*0.5);
  const upset=oppRank<=10 && res.method!=='Décision';
  let threshold=35; if(f.age<=20) threshold=55; if(f.age>=23) threshold=25;
  if(hypeScore>=threshold || upset || (rnd()<0.05 && hypeScore>15)){
    // Seuil abaissé (8→4 finitions) et ajout d'une série de victoires comme
    // second déclencheur — item demandé : rendre le fast-track atteignable
    // sans exiger une razzia quasi-parfaite en KO/soumission.
    let msg=''; const fastTrack=upset||finishes>=4||(f.streak||0)>=3;
    if(upset) msg='Ton finish retentissant sur un membre du Top 10 national a fait le tour des réseaux. Les promoteurs frappent à la porte.';
    else if(finishes>=4) msg=`Avec ton style spectaculaire (${finishes} finitions) et ta réputation de tueur, le public pro te réclame${f.L>0?` malgré t${f.L>1?'es':'a'} ${f.L} défaite${f.L>1?'s':''}`:' — un palmarès sans la moindre défaite'}.`;
    else if((f.streak||0)>=3) msg=`${f.streak} victoires d\u2019affilée sans lever le pied : les recruteurs pro ont remarqué la série.`;
    else if(f.age<=20) msg=`Tu n\u2019as que ${f.age} ans, mais ta maturité dans la cage affole les recruteurs régionaux. Tu es un prospect majeur.`;
    else msg='Tes résultats réguliers et ton classement sur le circuit IMMAF t\u2019ouvrent enfin les portes du monde professionnel.';
    // L'organisation proposée dépend désormais du classement/hype plutôt que
    // d'être fixée à un tier arbitraire (item #9) — un meilleur palmarès amateur
    // ouvre l'accès à des organisations plus prestigieuses dès le départ.
    let baseTier=1; const rk=divRank(f);
    if(rk<=10 || hypeScore>=40) baseTier=2;
    if(rk<=3 || hypeScore>=60) baseTier=3;
    const orgFlavor1=ORG_FLAVORS[baseTier]?pick(ORG_FLAVORS[baseTier]):ORGS[baseTier];
    const phrase1=pick(CONTRACT_PHRASES)(orgFlavor1);
    const fastTier=Math.min(4, baseTier+1);
    let orgFlavor3=null, phrase3=null;
    if(fastTrack){ orgFlavor3=ORG_FLAVORS[fastTier]?pick(ORG_FLAVORS[fastTier]):ORGS[fastTier]; phrase3=pick(CONTRACT_PHRASES)(orgFlavor3); }
    return { forced:false, msg, fastTrack, orgFlavor1, phrase1, orgFlavor3, phrase3, baseTier, fastTier };
  }
  return null;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: NARRATIF_CONTEXTUEL] — citations médias générées par tags de
   combat. Corrigé par rapport au brouillon : l'UPSET utilise les rangs
   PRE-combat (myRankBefore/oppRankBefore, déjà calculés plus haut dans
   resolveFight) plutôt qu'un divRank() recalculé après coup — sinon la
   victoire elle-même fausse le classement avant que la condition ne soit
   vérifiée (même piège déjà rencontré et corrigé pour le leapfrog). ==== */
const NARRATIVES=[
  { tags:['WIN','RIVAL'], src:'Interview Octogone', txt:f=>`"Il a beaucoup parlé avant le combat. Aujourd'hui, on a vu qui était le vrai combattant. La page est tournée."` },
  { tags:['LOSS','RIVAL'], src:'Conférence de presse', txt:f=>`"C'est dur à avaler. Je le déteste toujours autant, mais ce soir il a été meilleur. Je vais retourner à la salle et on se recroisera."` },
  { tags:['WIN','RIVAL','KO'], src:'Commentateur', txt:f=>`"C'est la fin parfaite pour cette rivalité ! ${esc(f.name)} vient d'éteindre les lumières et de clore le débat de la manière la plus brutale qui soit !"` },
  // ==== [ANCRE: CORRECTIF_REPETITION_CITATIONS] — bug remonté : certaines
  // combinaisons de tags (surtout WAR) n'avaient qu'UNE SEULE citation
  // possible alors que la condition de déclenchement (>120 frappes
  // significatives cumulées, ou 2+ chutes) est assez fréquente — d'où le
  // "combat de l'année" / "sa cote de popularité monte quand même" qui
  // revenaient sans arrêt. Chaque combo fréquent a maintenant plusieurs
  // variantes tirées au sort (pick() plus bas gère déjà l'aléatoire une fois
  // le pool élargi).
  { tags:['WIN','WAR'], src:'Tweet du Président', txt:f=>`"${esc(f.name)} et son adversaire viennent de nous offrir le combat de l'année. Les deux partent à l'hôpital, mais quel spectacle. Félicitations au vainqueur."` },
  { tags:['WIN','WAR'], src:'Commentateur', txt:f=>`"QUELLE GUERRE ! ${esc(f.name)} a dû aller chercher tout ce qu'il avait au fond de lui pour sortir vainqueur de cet échange !"` },
  { tags:['WIN','WAR'], src:'Média Spécialisé', txt:f=>`"Deux warriors, un seul debout à la fin. ${esc(f.name)} sort de ce chaos avec la victoire et le respect de toute une génération de fans."` },
  { tags:['WIN','WAR'], src:'Tweet d\u2019un fan', txt:f=>`"Je n'ai pas respiré pendant 5 rounds. ${esc(f.name)} a gagné le combat le plus dur de sa carrière ce soir."` },
  { tags:['LOSS','WAR'], src:'Média Spécialisé', txt:f=>`"Même dans la défaite, la cote de popularité de ${esc(f.name)} va exploser. Une guerre absolue dans la cage ce soir."` },
  { tags:['LOSS','WAR'], src:'Le Coin (Coach)', txt:f=>`"Tu es tombé ce soir, mais tu es tombé en te battant jusqu'au bout. Personne dans cette salle ne doute de ton cœur."` },
  { tags:['LOSS','WAR'], src:'Commentateur', txt:f=>`"${esc(f.name)} repart avec une défaite au tableau, mais avec cette performance, il vient peut-être de gagner plus de fans que dans n'importe laquelle de ses victoires."` },
  { tags:['WIN','WAR'], src:'Journaliste', txt:f=>`"On en reparlera dans dix ans. ${esc(f.name)} vient de signer l'un des combats les plus violents et les plus disputés de l'année."` },
  { tags:['WIN','SNOOZEFEST'], src:'Foule', txt:f=>`*Huées descendant des gradins pendant l'annonce de la décision.*` },
  { tags:['WIN','SNOOZEFEST'], src:'Tweet d\u2019un fan', txt:f=>`"Victoire tactique ou juste combat soporifique ? ${esc(f.name)} a fait le job, mais personne ne paiera un PPV pour revoir ça."` },
  { tags:['LOSS','SNOOZEFEST'], src:'Le Coin (Coach)', txt:f=>`"Tu l'as laissé voler les rounds. Tu n'as rien fait, il n'a rien fait, mais les juges lui ont donné. On ne peut s'en prendre qu'à nous-mêmes."` },
  { tags:['WIN','FLAWLESS','SUB'], src:'Expert Jiu-Jitsu', txt:f=>`"Une masterclass au sol. Il a emballé son adversaire sans prendre un seul coup. De l'art martial pur."` },
  { tags:['WIN','FLAWLESS','KO'], src:'Commentateur', txt:f=>`"C'était un meurtre télévisé. Zéro dégât encaissé, une précision chirurgicale. ${esc(f.name)} est intouchable ce soir."` },
  { tags:['WIN','PROSPECT','KO','ESTABLISHED'], src:'Média Spécialisé', txt:f=>`"Le hype train est officiellement inarrêtable. À seulement ${f.age} ans, il nettoie la division avec une violence inouïe."` },
  { tags:['WIN','VETERAN'], src:'Interview Octogone', txt:f=>`"Ne m'enterrez pas trop vite. Les jeunes courent vite, mais je connais le chemin. J'ai encore de belles années devant moi."` },
  { tags:['LOSS','VETERAN'], src:'Tweet Analyste', txt:f=>`"Le combat de trop ? Il faut savoir raccrocher les gants. ${esc(f.name)} a semblé subir le poids des années ce soir."` },
  // ==== [ANCRE: CORRECTIF_REPETITION_VETERAN] — bug remonté : le combo
  // LOSS+VETERAN n'avait qu'UNE SEULE citation possible, revenant donc à
  // chaque défaite de vétéran — même schéma que le correctif WAR ci-dessus,
  // pool élargi à 6 variantes au total.
  { tags:['LOSS','VETERAN'], src:'Commentateur', txt:f=>`"Les jambes ne répondent plus comme avant. ${esc(f.name)} a essayé, mais le temps finit toujours par gagner."` },
  { tags:['LOSS','VETERAN'], src:'Média Spécialisé', txt:f=>`"Une défaite qui pose question sur la suite de la carrière de ${esc(f.name)}. Le corps envoie des signaux qu'on ne peut plus ignorer."` },
  { tags:['LOSS','VETERAN'], src:'Le Coin (Coach)', txt:f=>`"On savait que ce serait dur ce soir. Rien n'est décidé, on va s'asseoir et en reparler à tête reposée."` },
  { tags:['LOSS','VETERAN'], src:'Interview Octogone', txt:f=>`"Je n'ai pas de regrets, j'ai tout donné. Le corps a ses limites, mais l'esprit, lui, n'a pas bougé."` },
  { tags:['LOSS','VETERAN'], src:'Tweet d\u2019un fan', txt:f=>`"Dur à voir ce soir. ${esc(f.name)} reste une légende pour moi, peu importe le résultat."` },
  { tags:['WIN','UPSET'], src:'Commentateur', txt:f=>`"INCROYABLE ! Personne ne lui donnait la moindre chance ! ${esc(f.name)} vient de choquer le monde entier !"` },
  // ==== [ANCRE: CORRECTIF_REPETITION_CITATIONS] (suite) — la majorité des
  // combats (victoire/défaite "normale", sans KO spectaculaire, sans guerre,
  // sans rivalité) ne portait AUCUN tag spécifique et retombait donc
  // systématiquement sur les deux mêmes lignes de repli tout en bas de ce
  // fichier ("C'était le plan prévu" / "On gagne et on apprend") — le cas le
  // plus fréquent de tous était aussi le plus répétitif. Ajout d'un pool de
  // citations génériques WIN/LOSS pour couvrir ce cas courant avec variété.
  { tags:['WIN'], src:'Interview Octogone', txt:f=>`"On a exécuté le plan à la perfection. Rien de plus à dire, on retourne au travail dès lundi."` },
  { tags:['WIN'], src:'Commentateur', txt:f=>`"${esc(f.name)} fait le travail, proprement, sans éclat inutile. C'est comme ça qu'on construit une carrière longue."` },
  { tags:['WIN'], src:'Tweet d\u2019un fan', txt:f=>`"Pas le combat le plus fou de l'année, mais une victoire est une victoire. ${esc(f.name)} avance."` },
  { tags:['WIN'], src:'Le Coin (Coach)', txt:f=>`"Solide. Pas parfait, mais solide. On corrige deux ou trois détails à l'entraînement et on repart."` },
  { tags:['LOSS'], src:'Conférence de presse', txt:f=>`"On gagne et on apprend. Je reviendrai plus fort, c'est une promesse."` },
  { tags:['LOSS'], src:'Tweet Analyste', txt:f=>`"Défaite logique ce soir pour ${esc(f.name)}. Rien de déshonorant, juste un adversaire meilleur sur l'instant T."` },
  { tags:['LOSS'], src:'Le Coin (Coach)', txt:f=>`"On analyse les images demain, on corrige, et on revient plus dangereux. Une défaite n'a jamais tué une carrière."` },
];
function generateNarrativeQuote(f,p){
  const tags=[]; const st=p.res.stats;
  const totalSig=(st.A.sig||0)+(st.B.sig||0);
  const oppSig=p.win?st.B.sig:st.A.sig;
  tags.push(p.win?'WIN':'LOSS');
  if(p.method.startsWith('KO')) tags.push('KO');
  if(p.method.startsWith('Soum')) tags.push('SUB');
  if(isDecisionLike(p.method)) tags.push('DEC');
  if(totalSig>120 || st.A.kd+st.B.kd>=2) tags.push('WAR');
  if(f.stage==='pro' && (f.W+f.L)>=4) tags.push('ESTABLISHED');
  if(isDecisionLike(p.method) && totalSig<30 && (st.A.ctrl<2 && st.B.ctrl<2)) tags.push('SNOOZEFEST');
  if(p.win && oppSig<=5) tags.push('FLAWLESS');
  if(p.opp && f.rivalId===p.opp.id) tags.push('RIVAL');
  if(f.age<=22) tags.push('PROSPECT');
  if(f.age>=34) tags.push('VETERAN');
  if(p.win && p.myRank-p.oppRank>5) tags.push('UPSET');
  // ==== [ANCRE: CORRECTIF_REPETITION_CITATIONS] (suite) — les citations
  // génériques WIN/LOSS (un seul tag requis) matchent techniquement N'IMPORTE
  // quel combat gagné/perdu, y compris ceux qui ont déjà des tags précis
  // (WAR, RIVAL, UPSET...). Sans distinction, elles diluaient le pool des
  // citations spécifiques déjà rares. On priorise donc les citations à tags
  // multiples (plus précises) et on ne retombe sur le pool générique que si
  // aucune citation spécifique ne correspond au combat.
  const specificQuotes=NARRATIVES.filter(n=>n.tags.length>1 && n.tags.every(t=>tags.includes(t)));
  if(specificQuotes.length>0) return pick(specificQuotes);
  const genericQuotes=NARRATIVES.filter(n=>n.tags.length===1 && n.tags.every(t=>tags.includes(t)));
  if(genericQuotes.length>0) return pick(genericQuotes);
  if(p.win) return { src:'Déclaration', txt:f=>`"C'était le plan prévu. On retourne à l'entraînement dès lundi."` };
  return { src:'Déclaration', txt:f=>`"On gagne et on apprend. Je reviendrai plus fort."` };
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: ARCADE_GAUNTLET] — mode Draft Rapide, autonome, permadeath.
   Corrigé par rapport au brouillon : generateFighter() n'existe pas (utilise
   makeFighter() réel) ; les attrs fictifs à 5 clés (grappling, power seuls)
   sont remplacés par de vrais combattants à 30 attributs (avec des valeurs
   volontairement skewées pour le flavor) ; org:'gf' cassait ORGS[f.org]
   (index numérique attendu) ; alert() remplacé par de vrais écrans stylés.
   Ce mode ne touche JAMAIS resolveFight()/le circuit amateur/les saisons/les
   promotions — un flux de combat entièrement séparé, pour ne rien risquer
   sur le mode Carrière déjà testé. ==== */
/* ==== [ANCRE: REJOUABILITE_PERKS_MECANIQUES] — les 30 archétypes ont un
   texte de perk (f._perk) qui n'a jamais eu d'effet mécanique (vérifié :
   _perk n'est lu que par scr_draft pour l'affichage). Plutôt que d'annoter
   à la main chaque archétype avec des mods sur mesure — 30 entrées, aucun
   audit Monte Carlo derrière pour les calibrer, risque réel de casser
   l'équilibre déjà stabilisé — les mods sont DÉRIVÉS des attrs réels de
   chaque spec, sur les mêmes canaux que _styleProfileOverride (déjà lu par
   simulateFight, engine.js, et déjà utilisé par les specs Faith). Un
   Titan (power 90, submission absent) devient mécaniquement plus finisseur
   que sa moyenne de style ; L'Anaconda (submission 95) inversement. Bornes
   resserrées pour ne jamais dépasser ce qu'un skill ou une Classe produit
   déjà par ailleurs. ==== */
/* ==== [ANCRE: REJOUABILITE_PAYOUT_TABLES] — les barèmes de points de salle
   étaient dupliqués littéralement en 3 endroits (afterResult, cashOutGauntlet,
   cashOutPreview, cf. ui-08/ui-04) : source d'un bug déjà vécu une fois
   (facteur ×10 sur le Ladder, cf. ANCRE REJOUABILITE_LADDER_POINTS_UNIFIES).
   Centralisés ici comme SEULE source de vérité, consommés par ui-08 et
   ui-04. gauntletPayout(mode,progress) retourne le montant PLEIN TARIF pour
   une progression donnée (roundStep / rang / streak selon le mode) — c'est
   le montant d'un ENCAISSEMENT volontaire. gauntletEliminationRatio(mode)
   donne la décote appliquée à ce même montant en cas d'élimination (mort ou
   défaite) : l'encaissement volontaire doit TOUJOURS rapporter strictement
   plus qu'une élimination au même palier, pour que "sortir proprement" soit
   un vrai choix de prudence et non un simple raccourci sans coût. ==== */
const BRACKET64_POINTS={1:2,2:6,3:14,4:28,5:50,6:100,7:100};
const LADDER100_POINTS=rank=>Math.max(2,Math.round((101-rank)*0.8));
const BOSSRUN_POINTS={0:0,1:5,2:15,3:35,4:70,5:150};
const GAUNTLET_ELIMINATION_RATIO=0.5; // uniforme sur les 3 formats depuis la refonte
/* ==== [ANCRE: GAUNTLET_ASCENSION] — facteur de récompense indexé sur le
   palier d'Ascension de la run (G.arcade.asc, 0 par défaut). Passé en 3e
   argument OPTIONNEL de gauntletPayout() pour que les ~10 appels existants
   (ui-04 previews, ui-08 paiements) restent valides sans modification et
   deviennent automatiquement corrects : à défaut d'argument, le palier est
   lu sur la run en cours. ==== */
function gauntletAscPayoutMod(asc){ return 1+0.35*(asc||0); }
function gauntletRunAsc(){ return (typeof G!=='undefined'&&G&&G.arcade&&G.arcade.asc)||0; }
function gauntletPayout(mode,progress,asc){
  const lvl=(asc===undefined||asc===null)?gauntletRunAsc():asc;
  let base;
  if(mode==='boss_run') base=BOSSRUN_POINTS[progress]||0;
  else if(mode==='ladder_100') base=LADDER100_POINTS(progress);
  else base=BRACKET64_POINTS[progress]||2;
  return Math.round(base*gauntletAscPayoutMod(lvl));
}
/* ==== [ANCRE: GAUNTLET_MISE_EN_JEU] — 3e argument atRisk : quand le joueur a
   mis sa cagnotte en jeu pour ce combat (CL.toggleAtRisk, ui-08), la décote
   d'élimination ne vaut plus 0.5 mais 0 — perdre ne rapporte STRICTEMENT
   rien. C'est la contrepartie du doublement du multiplicateur de run en cas
   de victoire (cf. gauntletRunMult). Le paramètre est optionnel : les appels
   existants à 2 arguments conservent exactement l'ancien comportement. ==== */
function gauntletEliminationPayout(mode,progress,atRisk){
  if(atRisk) return 0;
  return Math.round(gauntletPayout(mode,progress)*GAUNTLET_ELIMINATION_RATIO);
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: GAUNTLET_RUN_MULT] — multiplicateur FINAL de la run, appliqué une
   seule fois au moment du paiement (encaissement, victoire ou élimination),
   JAMAIS dans gauntletPayout() lui-même : les tables de points restent la
   source de vérité unique voulue par l'ancre REJOUABILITE_PAYOUT_TABLES, et
   les aperçus d'écran (cashOutPreview/eliminationPreview, ui-04) restent
   cohérents au centime près avec ce qui est versé côté ui-08 tant que les
   deux passent par ici. Trois canaux cumulatifs :
   - riskMult : doublé à chaque combat gagné avec la cagnotte en jeu (plafond 8)
   - maxPactStreak : +10 % par pacte de finition consécutif atteint dans la run
   - contract : bonus du contrat de run si rempli (cf. GAUNTLET_CONTRACTS) ==== */
function gauntletRunMult(a){
  if(!a) return 1;
  let m=(a.riskMult||1);
  m*=1+0.1*(a.maxPactStreak||0);
  if(a.contract && a.contract.done) m*=a.contract.mult;
  return Math.round(m*100)/100;
}
function gauntletFinalPayout(a,base){ return Math.round((base||0)*gauntletRunMult(a)); }
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: REJOUABILITE_LADDER_CIBLES] — genWTUMMAOpponent() ne proposait
   QU'UNE cible imposée (leapfrog auto -10/-15, saut direct au #1 sous la
   barre des 15) : aucune décision de risque à chaque palier. Remplacé par
   genWTUMMATargets(), qui propose 2-3 cibles simultanées à des profondeurs
   de saut différentes (sûre / médiane / agressive), le #1 étant toujours
   proposé une fois sous la barre des 15 comme avant. genWTUMMAOpponent()
   reste présente (compat retryArcade()/tests) mais n'est plus appelée dans
   le flux normal du Ladder. ==== */
/* ==== [ANCRE: GAUNTLET_CIBLE_PERISSABLE] — les 3 cibles étaient regénérées à
   l'identique en profondeur à chaque camp : ne pas prendre la cible agressive
   ne coûtait rien, elle repassait au tour suivant. G.arcade.aggroCooldown
   (posé à 2 par pickLadderTarget quand le joueur choisit une cible SÛRE ou
   MÉDIANE, décrémenté sinon) supprime la 3e cible pendant 2 paliers : la
   fenêtre de tir agressive devient un vrai « maintenant ou jamais ». Le cas
   currentRank<=15 est inchangé — le #1 doit toujours rester proposable. ==== */
function genWTUMMATargets(){
  const currentRank=G.arcade.rank; const targets=[];
  const pushTarget=r=>{ if(r>=1 && !targets.some(t=>t.ladderRank===r)){ const o=G.arcade.ladder.find(x=>x.ladderRank===r); if(o) targets.push(o); } };
  if(currentRank<=15){ pushTarget(Math.max(2,currentRank-RI(3,6))); pushTarget(1); }
  else {
    pushTarget(Math.max(2,currentRank-RI(4,7)));   // sûre
    pushTarget(Math.max(2,currentRank-RI(10,15))); // médiane (ancien comportement)
    if(!(G.arcade.aggroCooldown>0)) pushTarget(Math.max(2,currentRank-RI(18,26))); // agressive — périssable
  }
  return targets.length?targets:[G.arcade.ladder.find(o=>o.ladderRank===Math.max(2,currentRank-10))||G.arcade.ladder[0]];
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: GAUNTLET_SANS_MORAL_FORME] — l'option de camp « Récupération
   active » n'existait QUE pour rendre de la forme (+18 form / +5 morale) :
   sans ces deux canaux elle devient une carte vide. Elle n'est pas supprimée
   mais reportée sur la seule mécanique d'usure qui subsiste dans une run — les
   séquelles d'attributs de GAUNTLET_BLESSURE_RUN. Rendre 12 points sur CHAQUE
   attribut déjà abaissé par une séquelle conserve exactement le rôle
   d'arbitrage de l'ancienne carte (renoncer à progresser pour réparer), sur une
   grandeur cette fois réellement lue par le moteur. La carte est masquée quand
   il n'y a rien à soigner : proposer un soin à un combattant intact serait un
   choix nul, pas un arbitrage. ==== */
function runInjuryHealOption(){
  const inj=(G.arcade&&G.arcade.runInjuries)||[];
  if(!inj.length) return null;
  const keys=[]; inj.forEach(i=>(i.attrs||[]).forEach(p=>{ if(!keys.includes(p[0])) keys.push(p[0]); }));
  if(!keys.length) return null;
  const labels=keys.map(attrLabel).join(', ');
  return {label:'Table de soins',
    hint:`Sauter le sparring dur pour faire traiter les séquelles de la run (${inj.length}). Rien à gagner ailleurs, tout sur la remise en état.`,
    d:keys.map(k=>[k,12]), _heal:true, _healLabels:labels};
}
function recoveryTrainOption(){ return runInjuryHealOption(); }
function deriveArcadeMods(f){
  const a=f.attrs, base=STYLE_PROFILE[f.style]||STYLE_PROFILE.mma;
  const strikeScore=(num(a.jab)+num(a.cross)+num(a.hook)+num(a.kick))/4;
  const subScore=num(a.submission), powerScore=num(a.power), clinchScore=num(a.clinchStr,40);
  const gnpScore=num(a.topControl,40);
  return {
    sigVol:clamp(base.sigVol*(0.75+strikeScore/100*0.4),0.6,1.6),
    koMod:clamp(base.koMod*(0.7+powerScore/100*0.55),0.55,2.1),
    subMod:clamp(base.subMod*(0.55+subScore/100*1.0),0.15,2.3),
    clinchDmg:clamp(base.clinchDmg*(0.75+clinchScore/100*0.4),0.5,1.6),
    gnpDmg:clamp(base.gnpDmg*(0.75+gnpScore/100*0.4),0.5,1.6),
  };
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: REJOUABILITE_NEMESIS_MULTI] — meta.wtNemesis était un slot
   UNIQUE écrasé à chaque victoire de Bracket 64, gated sur div===player.div,
   et jamais alimenté par le Boss Run ni le Ladder 100. Remplacé par
   meta.gauntletRivals (jusqu'à 3, alimenté par les 3 formats), avec
   migration transparente de l'ancien wtNemesis au premier accès — aucune
   perte de le némésis déjà en sauvegarde. Consommé par les 3 formats. ==== */
function getGauntletRivals(meta){
  if(!meta.gauntletRivals){ meta.gauntletRivals=meta.wtNemesis?[meta.wtNemesis]:[]; }
  return meta.gauntletRivals;
}
/* ==== [ANCRE: GAUNTLET_PRIME_VENGEANCE] — le snapshot ne mémorisait PAS à
   quel palier le némésis vous avait tué : impossible de calibrer une prime
   sur ce qu'elle vous a réellement coûté. killedAt (progression au moment de
   l'élimination) + killedMode sont ajoutés au snapshot. Champs purement
   additifs : un ancien snapshot sans killedAt retombe sur la prime plancher
   via le ||0 de gauntletBountyFor(). ==== */
/* ==== [ANCRE: GAUNTLET_NEMESIS_ACCUMULATION] — le snapshot ne gardait
   aucune trace du nombre de fois où un même rival vous a battu : il était
   juste écrasé par le nouveau snapshot à chaque défaite, killedAt/killedMode
   remis à zéro comme si c'était la première fois. killedCount est reporté
   depuis l'ancien snapshot (même name+div, trouvé AVANT le filter qui le
   retire du tableau) et incrémenté — 1 à la première défaite, 2+ à partir
   de la 2e, seuil lu par gauntletBountyFor() (prime doublée) et
   fighterFromRivalSnapshot() (buff de réapparition). Un ancien snapshot sans
   killedCount retombe sur 0 avant incrémentation, donc sur 1 : aucune
   régression sur les rivaux déjà en sauvegarde. ==== */
function recordGauntletRival(meta,f,sourceLabel,killedAt){
  const existing=getGauntletRivals(meta).find(r=>r.name===f.name && r.div===f.div);
  const snap={name:f.name,nick:f.nick,flag:f.flag,overall:f.overall,
    attrs:JSON.parse(JSON.stringify(f.attrs)),skills:[...(f.skills||[])],style:f.style,div:f.div,source:sourceLabel,
    killedAt:killedAt||0,killedMode:sourceLabel,killedCount:(existing&&existing.killedCount||0)+1};
  let rivals=getGauntletRivals(meta).filter(r=>!(r.name===snap.name && r.div===snap.div));
  rivals.unshift(snap);
  if(rivals.length>3) rivals.length=3;
  meta.gauntletRivals=rivals; delete meta.wtNemesis;
}
/* ==== [FIN ANCRE] ==== */
/* Prime versée quand on bat enfin le némésis : la moitié du plein tarif du
   palier où elle vous avait éliminé, plancher à 5 points. Elle est alors
   RETIRÉE de meta.gauntletRivals — la vengeance close le dossier, sinon la
   même némésis paierait indéfiniment. */
/* ==== [ANCRE: GAUNTLET_NEMESIS_ACCUMULATION] — prime doublée (tarif plein
   au lieu de la moitié) si le rival vous a déjà battu 2 fois ou plus : la
   revanche sur un némésis récurrente doit payer plus cher que sur un
   accident isolé. ==== */
function gauntletBountyFor(snap){
  if(!snap) return 0;
  const mode=snap.killedMode||'bracket64';
  const base=gauntletPayout(mode,snap.killedAt||0,0);
  const mult=(snap.killedCount||0)>=2?1.0:0.5;
  return Math.max(5,Math.round(base*mult));
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: GAUNTLET_CAPSTONE_NEMESIS] — meta.gauntletRivals plafonne à 3
   et le vaincu est jusqu'ici RETIRÉ définitivement (splice ci-dessous) : la
   prime encaissée efface toute trace du rival. meta.gauntletRivalsDefeated
   (JAMAIS purgé, contrairement à gauntletRivals) garde le même snapshot en
   parallèle — alimenté ICI, au moment où la vengeance est déjà actée, pas
   avant. Lu par genBossOpponent() pour le Boss Run capstone une fois 5
   entrées atteintes. ==== */
function getGauntletRivalsDefeated(meta){ return meta.gauntletRivalsDefeated||[]; }
/* ==== [FIN ANCRE] ==== */
function claimGauntletBounty(opp){
  if(!opp||!opp._isRival) return 0;
  const meta=loadMetaStats();
  const rivals=getGauntletRivals(meta);
  const idx=rivals.findIndex(r=>r.name===opp.name && r.div===opp.div);
  if(idx<0) return 0;
  const bounty=gauntletBountyFor(rivals[idx]);
  const defeated=getGauntletRivalsDefeated(meta);
  defeated.push(rivals[idx]);
  meta.gauntletRivalsDefeated=defeated;
  rivals.splice(idx,1);
  meta.gauntletRivals=rivals;
  meta.legendPoints=(meta.legendPoints||0)+bounty;
  saveMetaStats(meta);
  return bounty;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: GAUNTLET_CONTRAT_RUN] — objectif global tiré AU DRAFT, valable
   sur tout la run, payé en multiplicateur final (cf. gauntletRunMult). Les
   conditions ne lisent que des données DÉJÀ maintenues en arcade :
   G.f.history (alimenté par applyResult — res/method/round/oppWasChamp) et
   deux drapeaux de run posés dans afterResult. Le combattant arcade est
   recréé à neuf à chaque run par makeArcadeArchetype()->makeFighter(), donc
   son history est naturellement run-scoped : aucun champ de reset à prévoir.
   Les closures `check` ne posent aucun problème de sérialisation : une run
   Gauntlet n'est JAMAIS écrit en localStorage (save() sort immédiatement si
   G.arcade.active, cf. state.js ANCRE SAVE_GARDE_ARCADE). ==== */
const GAUNTLET_CONTRACTS=[
  {id:'ct_nodec',label:'Aucune victoire aux points',mult:1.5,
   hint:'Toutes vos victoires de la run doivent être des finitions — KO/TKO ou soumission.',
   check:(f)=>{ const wins=f.history.filter(h=>h.res==='win'); return wins.length>0 && wins.every(h=>!isDecisionLike(h.method)); }},
  {id:'ct_r1',label:'Trois éclairs',mult:1.6,
   hint:'Terminer trois combats de la run dès le 1er round.',
   check:(f)=>f.history.filter(h=>h.res==='win'&&h.round===1&&!isDecisionLike(h.method)).length>=3},
  {id:'ct_champs',label:'Bourreau de champions',mult:1.45,
   hint:'Battre deux adversaires qui portaient déjà une ceinture.',
   check:(f)=>f.history.filter(h=>h.res==='win'&&h.oppWasChamp).length>=2},
  {id:'ct_sub',label:'Le fil de soie',mult:1.5,
   hint:'Gagner deux combats par soumission dans la run.',
   check:(f)=>f.history.filter(h=>h.res==='win'&&h.method&&h.method.startsWith('Soum')).length>=2},
  {id:'ct_nopact',label:'Sans filet',mult:1.3,
   hint:'Terminer la run sans jamais prendre le pacte de finition.',
   check:(f,a)=>!a.pactTakenEver},
  {id:'ct_intact',label:'Corps intact',mult:1.4,
   /* ==== [ANCRE: GAUNTLET_SANS_MORAL_FORME] — ct_intact reposait sur la forme
      (`!a.formBroken`, seuil 60). La forme n'existant plus dans le Gauntlet, le
      contrat est reporté sur la mécanique d'usure qui subsiste : terminer la run
      sans jamais encaisser de séquelle (a.runInjuries, GAUNTLET_BLESSURE_RUN).
      L'id est CONSERVÉ pour ne pas casser meta.gauntletBest ni les succès qui le
      citeraient. Le multiplicateur reste à 1.4 : la difficulté est comparable —
      passer une run entier sans séquelle est du même ordre que ne jamais tomber
      sous 60. ==== */
   hint:'Terminer la run sans jamais encaisser la moindre séquelle.',
   check:(f,a)=>!((a.runInjuries||[]).length) && !a.injuredEver}
];
/* ==== [ANCRE: ULTIMATUM_MEDECIN] — ajout #24 (24 ajouts, 12/08/2026) : "trop
   endommagé" faute de forme/moral en Gauntlet (cf. GAUNTLET_SANS_MORAL_FORME)
   est ici défini par le cumul de séquelles ACTIVES (runInjuries.length>=2,
   même seuil que ct_intact.check juste au-dessus, pour rester cohérent avec
   ce que le jeu considère déjà comme "une run qui a souffert"). Ne se
   déclenche plus une fois refusé — G.arcade.doctorRefused n'est jamais remis
   à false (le bonus ×1.5 doit tenir pour TOUTE la run après un refus, pas
   seulement jusqu'au prochain déclenchement). ==== */
function ringDoctorUltimatumActive(a){
  return (a.runInjuries||[]).length>=2 && !a.doctorRefused;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: GAUNTLET_MUTATEURS_ALEATOIRES] — ajout #4 (24 ajouts,
   12/08/2026) : ct_nopact devient injouable quand le mutateur tiré pour
   CETTE run est 'mut_pacte_force' (remplace l'ancienne condition
   asc>=3, désormais sans rapport avec le pacte forcé). ==== */
function drawGauntletContract(asc,mutatorId){
  const pool=mutatorId==='mut_pacte_force'?GAUNTLET_CONTRACTS.filter(c=>c.id!=='ct_nopact'):GAUNTLET_CONTRACTS;
  const c=pick(pool);
  return {id:c.id,label:c.label,hint:c.hint,mult:c.mult,done:false};
}
/* ==== [FIN ANCRE] ==== */
function evalGauntletContract(a){
  if(!a||!a.contract) return false;
  const spec=GAUNTLET_CONTRACTS.find(x=>x.id===a.contract.id);
  if(!spec||!G.f||!G.f.history){ a.contract.done=false; return false; }
  let ok=false;
  try{ ok=!!spec.check(G.f,a); }catch(e){ ok=false; }
  a.contract.done=ok;
  return ok;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: GAUNTLET_BLESSURE_RUN] — EXCEPTION EXPLICITEMENT ASSUMÉE à la
   règle « un attribut ne baisse QUE par vieillissement, Classe ou mécanique
   de menton ». Elle est ici confinée au Gauntlet, pour trois raisons
   vérifiées dans le code : (1) le combattant arcade est un archétype jetable
   recréé à chaque run par makeArcadeArchetype(), jamais un combattant de
   carrière ; (2) une run n'est jamais persisté (save() sort si
   G.arcade.active), donc la baisse ne peut PAS fuiter dans une sauvegarde de
   carrière ; (3) l'arcade ne passe jamais par la retraite, donc ni le
   Panthéon ni hofScore() ne peuvent hériter d'attributs rabaissés.
   rollInjury()/f.injury (engine.js) N'EST PAS réutilisée : sa sémantique est
   en « cycles de convalescence », notion qui n'existe pas dans une run. ==== */
/* ==== [ANCRE: INFIRMERIE_FORTUNE] — ajout #20 (24 ajouts, 12/08/2026) :
   migration de runInjuries vers un suivi PAR ZONE anatomique (tête/corps/
   jambes) — chaque séquelle porte désormais un champ `zone`, condition
   nécessaire pour que l'Infirmerie de fortune (soin ciblé, payant, ci-
   dessous dans ui-04/ui-08) puisse soigner UNE zone sans toucher aux autres.
   Structure de a.runInjuries elle-même INCHANGÉE (toujours un tableau plat)
   — c'est le champ `zone` sur chaque entrée qui porte la migration, pas une
   réorganisation en objet {tete:[],corps:[],jambes:[]} : ça évite de casser
   les 3 lectures existantes de a.runInjuries (gauntletStatusBlock ui-04,
   runDebriefBlock ui-04, ct_intact ui-03) qui itèrent déjà le tableau tel
   quel. Cheville foulée ajoutée pour équilibrer les 3 zones (2 têtes,
   3 corps, 2 jambes désormais). ==== */
const GAUNTLET_RUN_INJURIES=[
  {name:'Arcade ouverte',zone:'tete',attrs:[['composure',-8],['fightIQ',-5]]},
  {name:'Côtes fêlées',zone:'corps',attrs:[['cardio',-10],['durability',-6]]},
  {name:'Main abîmée',zone:'corps',attrs:[['power',-9],['handSpeed',-5]]},
  {name:'Genou tordu',zone:'jambes',attrs:[['footSpeed',-10],['takedown',-6]]},
  {name:'Mâchoire fragilisée',zone:'tete',attrs:[['chin',-12]]},
  {name:'Épaule déboîtée',zone:'corps',attrs:[['clinchStr',-10],['takedown',-5]]},
  {name:'Cheville foulée',zone:'jambes',attrs:[['footSpeed',-7],['explosiveness',-6]]}
];
const GAUNTLET_ZONE_LABEL={tete:'Tête',corps:'Corps',jambes:'Jambes'};
function rollGauntletRunInjury(f){
  const inj=pick(GAUNTLET_RUN_INJURIES);
  const applied=[];
  inj.attrs.forEach(pair=>{
    const k=pair[0], v=pair[1];
    if(typeof f.attrs[k]==='number'){ f.attrs[k]=clamp(f.attrs[k]+v,1,100); applied.push([k,v]); }
  });
  f.overall=overall(f);
  return {name:inj.name,zone:inj.zone,attrs:applied};
}
/* Coût fixe par blessure soignée dans la zone visée (pas un coût unique par
   zone) : soigner une zone qui cumule 2 séquelles coûte logiquement plus
   cher que n'en soigner qu'une seule. */
const GAUNTLET_INFIRMARY_COST_PER_INJURY=40;
function gauntletInfirmaryCost(a,zone){ return GAUNTLET_INFIRMARY_COST_PER_INJURY*((a.runInjuries||[]).filter(i=>i.zone===zone).length); }
function healGauntletZone(meta,a,zone){
  const targets=(a.runInjuries||[]).filter(i=>i.zone===zone);
  if(!targets.length) return {success:false,msg:'Aucune séquelle à soigner sur cette zone.'};
  const cost=gauntletInfirmaryCost(a,zone);
  if((meta.legendPoints||0)<cost) return {success:false,msg:'Points de Légende insuffisants.'};
  meta.legendPoints-=cost;
  targets.forEach(inj=>inj.attrs.forEach(pair=>{
    const k=pair[0], v=pair[1];
    if(typeof G.f.attrs[k]==='number') G.f.attrs[k]=clamp(G.f.attrs[k]-v,1,100);
  }));
  G.f.overall=overall(G.f);
  a.runInjuries=(a.runInjuries||[]).filter(i=>i.zone!==zone);
  return {success:true,msg:`${GAUNTLET_ZONE_LABEL[zone]} soignée pour ${cost} points de Légende.`};
}
/* ==== [FIN ANCRE] ==== */
/* Probabilité indexée sur les dégâts RÉELLEMENT encaissés pendant le combat :
   res.stats.B.sig (frappes significatives subies par le joueur, qui est
   toujours le côté A en arcade — cf. resolveArcadeFight) et res.stats.B.kd
   (knockdowns subis). Mêmes champs que ceux déjà lus par les objectifs de
   combat en carrière (`check:(st)=>st.B.sig<15`). */
function rollGauntletInjuryChance(res){
  if(!res||!res.stats||!res.stats.B) return 0;
  const sig=res.stats.B.sig||0, kd=res.stats.B.kd||0;
  return clamp(0.04+Math.max(0,sig-25)*0.006+kd*0.12,0,0.55);
}
/* ==== [FIN ANCRE] ==== */
function pickGauntletRival(div){
  const meta=loadMetaStats(); const rivals=getGauntletRivals(meta).filter(r=>r.div===div);
  return rivals.length?pick(rivals):null;
}
/* ==== [ANCRE: GAUNTLET_NEMESIS_ACCUMULATION] — killedCount>=2 (rival qui
   vous a déjà battu au moins deux fois) applique un petit bonus mécanique
   permanent à sa réapparition, sur le même canal que les spécialisations
   MMA Faith (ui-08, ANCRE FAITH_SPECS) : _styleProfileOverride, lu par
   simulateFight (engine.js). koMod/subMod choisis plutôt qu'une hausse
   d'attrs brute pour rester visible en combat sans fausser l'affichage
   des stats du profil adverse. boss._killedCount est reporté pour que
   rivalBadge() (ui-04) puisse l'afficher. ==== */
function fighterFromRivalSnapshot(snap,levelHint,nick){
  const boss=makeFighter({gender:'H',div:snap.div,style:snap.style,level:levelHint||90});
  boss.attrs=JSON.parse(JSON.stringify(snap.attrs));
  boss.skills=[...snap.skills]; boss.overall=snap.overall;
  boss.name=snap.name; boss.flag=snap.flag; boss.nick=nick||snap.nick||'REVANCHE';
  boss.stage='pro'; boss.org=6; boss._isRival=true; boss._rivalSource=snap.source;
  boss._killedCount=snap.killedCount||0;
  if(boss._killedCount>=2){
    boss._styleProfileOverride=Object.assign({},STYLE_PROFILE[boss.style]||STYLE_PROFILE.mma);
    boss._styleProfileOverride.koMod+=0.12; boss._styleProfileOverride.subMod+=0.12;
  }
  return boss;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [FIN ANCRE] ==== */
function makeArcadeArchetype(spec){
  const f=makeFighter({gender:'H',div:spec.div,style:spec.style,countryKey:spec.country,first:spec.first,age:spec.age,potential:96,level:70});
  for(const k in spec.attrs) f.attrs[k]=spec.attrs[k];
  f.overall=overall(f); f.stage='pro'; f.org=4; f.morale=100; f.form=100;
  f.nick=spec.nick; f._perk=spec.perk; f.styleLabel=spec.styleLabel;
  if(spec.flag) f.flag=spec.flag; // drapeau de flavor, découplé du pays réel utilisé pour le patronyme
  f._styleProfileOverride=deriveArcadeMods(f);
  return f;
}
/* 23 archétypes (audit "Draft Rapide"). Styles fictifs de Gemini (Sumo, Point
   Fighter, Capoeira, Kung Fu, Street, Showman...) n'existent pas dans le
   moteur : mappés sur le style RÉEL le plus proche pour le calcul, en gardant
   le styleLabel affiché tel quel. Pays hors des 14 réels (NL, JM, CO, AU, CN,
   CA) : countryKey substitué par un pays réel (patronyme), drapeau d'origine
   conservé pour l'affichage via le champ flag. */
/* ==== [ANCRE: LOT11_GAUNTLET_ETENDU] — archétypes légendes + mode Boss Run.
   Format vérifié identique à ARCADE_ARCHETYPES (nick,flag,country,style,
   styleLabel,div,age,attrs,perk). ==== */
const ARCADE_EXTENDED_ARCHETYPES=[
  {nick:'Le Chirurgien',flag:'🇯🇵',country:'JP',style:'bjj',styleLabel:'Leglocker',div:'H-light',age:28,
    attrs:{submission:98,flexibility:90,tdd:20,jab:10,cross:10,power:15,cardio:75,chin:40},
    perk:'Ne regarde jamais plus haut que le genou. S\u2019il attrape une cheville, vous êtes estropié.'},
  {nick:'Le Colosse de Chair',flag:'🇺🇸',country:'US',style:'wrestler',styleLabel:'Insubmersible',div:'H-heavy',age:36,
    attrs:{durability:99,chin:99,heart:99,power:85,footSpeed:10,handSpeed:20,cardio:90,takedown:50},
    perk:'Encaisse des frappes de tractopelle en souriant. Lent mais avance toujours.'},
  {nick:'L\u2019Hélicoptère',flag:'🇰🇷',country:'KR',style:'kickboxer',styleLabel:'Spinning Kicker',div:'H-feather',age:22,
    attrs:{kick:98,explosiveness:95,footSpeed:90,tdd:15,jab:20,chin:30,cardio:60,power:80},
    perk:'Des coups de pied retournés constants. Soit il vous éteint, soit il s\u2019épuise en un round.'}
];
const ARCADE_UNLOCKABLE_ARCHETYPES=[
  {unlockId:'arch_titan',nick:'Le Titan Antique',flag:'🇬🇷',country:'GR',style:'wrestler',styleLabel:'Titan',div:'H-heavy',age:39,
    attrs:{strength:99,durability:95,power:90,takedown:85,topControl:90,cardio:40,footSpeed:10},
    perk:'Une force herculéenne. Brise la volonté de tout ce qu\u2019il attrape.'},
  {unlockId:'arch_ninja',nick:'Le Shinobi',flag:'🇯🇵',country:'JP',style:'bjj',styleLabel:'Furtif',div:'H-light',age:26,
    attrs:{submission:98,footSpeed:95,handSpeed:90,adaptability:90,power:30,chin:40},
    perk:'Disparaît du champ de vision pour réapparaître accroché à un cou.'},
  {unlockId:'arch_brawler',nick:'Le Roi de la Rue',flag:'🇮🇪',country:'IE',style:'boxer',styleLabel:'Bare Knuckle',div:'H-welter',age:31,
    attrs:{hook:95,clinchStr:95,durability:90,heart:99,killer:90,tdd:60,cardio:75},
    perk:'Refuse d\u2019aller au sol. Transforme la cage en bagarre de pub.'},
  {unlockId:'arch_sniper',nick:'Le Sniper',flag:'🇹🇭',country:'TH',style:'muayThai',styleLabel:'Longue Distance',div:'H-feather',age:27,
    attrs:{kick:98,footSpeed:92,fightIQ:85,composure:80,power:70,tdd:70,cardio:70,chin:35},
    perk:'Ne laisse jamais personne entrer dans sa distance. Démonte à coups de tibia depuis l\u2019extérieur.'},
  /* ==== [ANCRE: LOTERIE_LEGENDES] — ajout #11 (24 ajouts, 12/08/2026) :
     archétype ultra-exclusif, UNIQUEMENT accessible via le 1% de la Caisse
     Mystère (drawGauntletLottery, state.js) — jamais acheté directement,
     jamais dans LEGEND_UNLOCKABLES. Même mécanisme d'injection que les 4
     archétypes ci-dessus (checkLegendUnlock générique dans
     injectExtendedArchetypes ci-dessous). ==== */
  {unlockId:'arch_lottery_phoenix',nick:'Le Phénix Cendré',flag:'🏴',country:'BR',style:'mma',styleLabel:'Renaissance',div:'H-middle',age:33,
    attrs:{heart:99,recovery:95,composure:92,chin:80,power:75,cardio:85,adaptability:88,killer:80},
    perk:'Ne meurt jamais deux fois de la même façon. Chaque round encaissé le rend plus dangereux au suivant.'}
  /* ==== [FIN ANCRE] ==== */
];
function injectExtendedArchetypes(){
  ARCADE_EXTENDED_ARCHETYPES.forEach(a=>{ if(!ARCADE_ARCHETYPES.some(x=>x.nick===a.nick)) ARCADE_ARCHETYPES.push(a); });
  ARCADE_UNLOCKABLE_ARCHETYPES.forEach(a=>{
    if(checkLegendUnlock(a.unlockId) && !ARCADE_ARCHETYPES.some(x=>x.nick===a.nick)) ARCADE_ARCHETYPES.push(a);
  });
}
/* ==== [ANCRE: CORRECTIF_BOSSRUN_ARCHETYPES] — startArcade()/startLadder100()
   appellent injectExtendedArchetypes() (débloque les 3 archétypes légendes +
   les 4 archétypes achetés en Salle des Légendes), startBossRun() ne le
   faisait pas : le format le plus punitif du Gauntlet tirait dans un pool
   plus pauvre que les deux autres, sans raison. ==== */
/* ==== [ANCRE: CORRECTIF_SEED_BOSSRUN] — bug trouvé : CL.startBossRun() (ui-08)
   faisait `startBossRun(); G.arcade.seed=seed;` alors que cette fonction
   appelle render() AVANT le retour — l'écran de draft affichait donc
   « Graine de la run : undefined » sur le seul format qui ne recevait pas sa
   graine à temps. La graine (et le palier d'Ascension) sont désormais passés
   en argument et présents dans le littéral G.arcade, comme dans
   CL.startArcade()/CL.startLadder100(). Arguments optionnels : un appel
   startBossRun() sans argument reste valide (compat tests). ==== */
/* ==== [ANCRE: GAUNTLET_CAPSTONE_NEMESIS] — capstone (4e argument, optionnel)
   active le pool spécial de genBossOpponent() ci-dessous, débloqué depuis
   scr_gauntlet_menu (ui-06) une fois meta.gauntletRivalsDefeated à 5
   entrées ou plus. N'affecte que la génération des adversaires : réutilise
   sinon exactement le même run (target 5, condition ko_only, Ascension). ==== */
function startBossRun(seed,asc,capstone){
  injectExtendedArchetypes();
  /* ==== [ANCRE: GAUNTLET_MUTATEURS_ALEATOIRES] — ajout #4 (24 ajouts,
     12/08/2026) : tiré ICI, avant drawGauntletContract (qui doit connaître
     mutId pour exclure ct_nopact), et avant selectDraft (qui n'a besoin que
     de G.f pour le consommable, jamais du mutateur). Pas de dépendance à
     G.f : peut donc être tiré dès la création de la run pour les 3 modes. ==== */
  const mutator=rollGauntletMutator(asc,'boss_run');
  G.arcade={active:true,streak:0,target:5,pool:buildArcadePool(),mode:'boss_run',condition:'ko_only',banked:0,
    seed,asc:asc||0,riskMult:1,maxPactStreak:0,contract:drawGauntletContract(asc,mutator&&mutator.id),capstone:!!capstone,mutator};
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: MARCHE_NOIR_CONSOMMABLES] — ajout #8 (24 ajouts, 12/08/2026) :
     applique le consommable en attente dès la création de la run — G.f
     n'est pas encore le combattant sélectionné à ce stade (choisi ensuite
     via selectDraft), donc un éventuel effet 'buff' ne peut pas encore
     s'appliquer ici pour le Boss Run : appliqué à la place juste après le
     choix d'archétype, dans CL.selectDraft (ui-08), qui appelle cette même
     fonction pour les 3 modes. ==== */
  G.screen='draft'; save(); render();
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: REJOUABILITE_DIFFICULTE_BOSSRUN] — même principe que pour le
   Bracket : passe de confort, pas un rééquilibrage audité. L'ancien
   overall+5+streak*3 (plancher 70) mettait la barre au-dessus du joueur dès
   le combat 1 et grimpait vite ; overall+streak*2 (plancher 60) laisse un
   vrai combat à niveau égal en ouverture. ==== */
/* ==== [ANCRE: GAUNTLET_ASCENSION] — les 3 courbes de difficulté du Gauntlet
   tiennent chacune sur UNE ligne (ici, buildWTUMMABracket et
   buildWTUMMALadder). ascensionCurveMod() y est injecté sans rien changer
   d'autre : +3 niveaux d'adversaire et +2 de plafond par palier, réversible
   en un chiffre. Ce n'est PAS un rééquilibrage audité (aucun Monte Carlo
   derrière) — c'est un facteur de difficulté opt-in, choisi par le joueur au
   menu, pas une modification de la difficulté par défaut : au palier 0 les
   formules sont strictement identiques à avant. ==== */
function ascensionCurveMod(asc){ return {lv:3*(asc||0),cap:2*(asc||0)}; }
/* ==== [ANCRE: GAUNTLET_MUTATEURS_ALEATOIRES] — ajout #4 (24 ajouts, 12/08/2026) :
   REMPLACE le système A1/A2/A3 fixe et cumulatif (chaque palier ajoutait une
   règle en plus des précédentes) par UN SEUL mutateur tiré au hasard parmi 8
   au lancement d'une run avec Ascension>=1 (aucun mutateur si asc===0,
   comportement de base inchangé). L'ancien code A1/A2/A3 est retiré de ses 5
   points d'application (generateArcadeUpgrades, afterResult, togglePact,
   pactToggleBlock, drawGauntletContract — ui-03/ui-08/ui-04) et remplacé par
   une lecture de G.arcade.mutator.id à chacun de ces mêmes points, cf.
   ancres GAUNTLET_MUTATEURS_ALEATOIRES locales dans chaque fichier.
   ⚠️ Scope assumé sur 'mut_sans_repit' : la spec suggère une fatigue round
   par round ("sans round de répit"), ce qui impliquerait de toucher la
   boucle interne de simulateFight() (engine.js) — hors scope sûr en une
   passe pour un moteur de combat déjà audité au Monte Carlo. Approximé à la
   place par un cardio réduit AVANT le combat (même canal exact qui pilote la
   fatigue round par round dans le moteur, cf. ligne ~715 engine.js), donc
   l'effet perçu (fatigue plus rapide) est réel, seule la MÉCANIQUE exacte
   (round par round vs pré-combat) diffère de la lettre de la spec. ==== */
const GAUNTLET_ASCENSION_MUTATORS=[
  {id:'mut_violent',label:'Adversaires plus violents',desc:'Tous les adversaires de la run frappent plus fort (+3 Puissance/20).'},
  {id:'mut_sans_filet',label:'Sans filet',desc:'Les consommables « Filet de sécurité » et « Mise à l\u2019abri automatique » sont désactivés pour cette run.'},
  {id:'mut_pacte_force',label:'Pacte forcé',desc:'Chaque combat ne compte que par finition (KO/TKO ou soumission), sans exception, pour toute la run (Bracket 64 / Ladder 100 uniquement).'},
  {id:'mut_camp_reduit',label:'Choix réduits au camp',desc:'Le camp d\u2019entraînement ne propose plus que 2 options au lieu de 3.'},
  {id:'mut_depart_affaibli',label:'Départ affaibli',desc:'Le combattant démarre la run avec -2 Puissance et -2 Cardio (/20).'},
  {id:'mut_mise_a_nu',label:'Mise à nu',desc:'L\u2019identité et les stats de CHAQUE adversaire de la run restent cachées jusqu\u2019au dernier moment, comme un Boss Run permanent.'},
  {id:'mut_juges_severes',label:'Juges sévères',desc:'Une victoire aux points trop serrée ne suffit plus : la run s\u2019arrête comme sur une défaite.'},
  {id:'mut_sans_repit',label:'Sans round de répit',desc:'Cardio réduit pour toute la run (-3/20) : la fatigue s\u2019installe plus vite à chaque combat.'}
];
function rollGauntletMutator(asc,mode){
  if((asc||0)<1) return null;
  /* ==== [ANCRE: GAUNTLET_MUTATEURS_ALEATOIRES] — le Boss Run a déjà sa
     propre clause KO-only permanente et un camp allégé sans écran de
     3 options (generateBossRunUpgrade, distinct de generateArcadeUpgrades) :
     3 des 8 mutateurs y seraient inertes ou redondants (pacte forcé/juges
     sévères déjà subsumés par la règle KO-only, camp réduit sans effet sur
     un camp qui n'a jamais 3 options). Exclus du tirage pour ce mode
     uniquement, pour que les 5 restants restent tous significatifs. ==== */
  const pool=mode==='boss_run'?GAUNTLET_ASCENSION_MUTATORS.filter(m=>!['mut_pacte_force','mut_camp_reduit','mut_juges_severes'].includes(m.id)):GAUNTLET_ASCENSION_MUTATORS;
  /* ==== [FIN ANCRE] ==== */
  return pick(pool);
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: COACHING_ENTRE_ROUNDS] — ajout #21 (24 ajouts, 12/08/2026) :
   ⚠️ SCOPE ASSUMÉ ET EXPLICITE : la spec demande de "mettre en pause
   simulateFight() après chaque round" — impossible tel quel : la boucle de
   rounds vit ENTIÈREMENT à l'intérieur de simulateFight() (engine.js), avec
   un état local (momentum, chinVulnA/B, fatigue cumulée round par round)
   qui n'existe qu'à l'intérieur de cet unique appel synchrone. L'extraire
   proprement pour permettre une vraie pause/reprise dépasse une passe sûre
   sur un moteur de combat déjà audité (Monte Carlo). Implémentation
   alternative RÉELLE et FONCTIONNELLE : simulateFight() est appelée 3 FOIS
   avec rounds=1 (un vrai appel par round), le score et les stats de chaque
   mini-round sont cumulés manuellement, et une fatigue APPROXIMÉE (cardio
   réduit proportionnellement aux dégâts encaissés ce round-là, restaurée à
   aucun moment — elle doit durer tout le combat) fait le lien entre deux
   appels. Le joueur choisit réellement une nouvelle tactique entre chaque
   round (CL.pickCoachingTactic, ui-08), avec un effet réel sur le round
   suivant — l'objectif de la spec (décision tactique round par round) est
   donc atteint, seule la MÉCANIQUE interne (3 appels vs 1 pause-reprise)
   diffère de la lettre du texte source. Carrière INCHANGÉE : ce chemin
   n'est emprunté que depuis resolveArcadeFight() (Gauntlet uniquement),
   jamais depuis resolveFight() (carrière, ui-05). ==== */
function startCoachingFight(){
  const blankStats=()=>({sig:0,td:0,tdAtt:0,ctrl:0,sub:0,kd:0,dmgHead:0,dmgBody:0,dmgLegs:0});
  /* ==== [ANCRE: COACHING_ENTRE_ROUNDS] — les effets de malus/mutateur qui,
     hors coaching, sont appliqués puis restaurés autour d'un SEUL appel
     simulateFight (resolveArcadeFight ci-dessus), sont ici appliqués UNE
     FOIS avant le round 1 et restaurés UNE FOIS à la toute fin du combat
     (dans runCoachingRound, branche finalisation) — sinon ils seraient
     perdus dès le round 2 (3 appels simulateFight distincts, chacun partant
     de G.f.attrs tel quel à cet instant). ==== */
  const opp=G.arcade.opponent;
  let bossMalusSaved=null;
  if(G.arcade.mode==='boss_run' && G.arcade.bossMalus){
    const bm=G.arcade.bossMalus;
    bossMalusSaved={key:bm.key,before:G.f.attrs[bm.key]};
    G.f.attrs[bm.key]=clamp(G.f.attrs[bm.key]+bm.amount,1,100);
  }
  const mutId=G.arcade.mutator&&G.arcade.mutator.id;
  let mutOppSaved=null, mutSelfSaved=null;
  if(mutId==='mut_violent'){ mutOppSaved={before:opp.attrs.power}; opp.attrs.power=clamp(opp.attrs.power+15,1,100); }
  if(mutId==='mut_sans_repit'){ mutSelfSaved={before:G.f.attrs.cardio}; G.f.attrs.cardio=clamp(G.f.attrs.cardio-15,1,100); }
  /* ==== [ANCRE: PASSIF_IDENTITE_DE_CAMP] — passif 'oppPermanent' (Mercenaire,
     Universitaire) : même pattern que bossMalus/mutateurs ci-dessus, mais
     générique sur plusieurs clés à la fois (fx peut avoir 1 ou 2 stats). ==== */
  let campPassiveOppSaved=null;
  const campPassive=G.arcade.campIdentity&&G.arcade.campIdentity.passive;
  if(campPassive&&campPassive.type==='oppPermanent'){
    campPassiveOppSaved={};
    Object.entries(campPassive.fx).forEach(([k,v])=>{ campPassiveOppSaved[k]=opp.attrs[k]; opp.attrs[k]=clamp(opp.attrs[k]+v,1,100); });
  }
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: CORRECTIF_JUGES_CUMUL_COACHING] — bug remonté : seul le total
     combiné (scoreA/scoreB, somme des 3 juges) était cumulé round par round.
     Le détail PAR JUGE (judges.j1/j2/j3) n'était jamais accumulé — à la
     finalisation, `judges:res.judges` ne reprenait que le DERNIER round
     simulé (rounds=1 par appel), donc un score final du style "10-9" au lieu
     du vrai cumul "30-27" sur 3 rounds. Invisible jusqu'ici car rien
     n'affichait le détail par juge pendant le coaching — mais ça faussait
     déjà l'écran de résultat final (scr_result, ui-06) pour tout combat
     Gauntlet coaché allant aux points. ==== */
  G.arcade.coaching={round:1,scoreA:0,scoreB:0,judges:{j1:[0,0],j2:[0,0],j3:[0,0]},roundStats:[],stats:{A:blankStats(),B:blankStats()},_restore:{bossMalusSaved,mutOppSaved,mutSelfSaved,campPassiveOppSaved}};
  /* ==== [FIN ANCRE] ==== */
  runCoachingRound(G.arcade.plan||null);
}
function runCoachingRound(plan){
  const c=G.arcade.coaching, opp=G.arcade.opponent;
  /* ==== [ANCRE: PASSIF_IDENTITE_DE_CAMP] — passifs 'roundBoost' (Spartiate,
     Meute, Spectacle) et 'finishImmunity' (Familial, Ascétique) : contrairement
     à 'oppPermanent' (appliqué une fois pour tout le combat dans
     startCoachingFight), ceux-ci ne concernent QUE le round c.round en cours
     — appliqués juste avant cet appel simulateFight, le roundBoost est
     restauré immédiatement après (pas à la fin du combat), et
     finishImmunity ne vit que le temps de cet appel via le paramètre opts
     (ANCRE IMMUNITE_FINITION_CAMP, engine.js). ==== */
  const campPassive=G.arcade.campIdentity&&G.arcade.campIdentity.passive;
  let roundBoostSaved=null, immuneA=false;
  if(campPassive&&campPassive.round===c.round){
    if(campPassive.type==='roundBoost'){
      roundBoostSaved={};
      Object.entries(campPassive.fx).forEach(([k,v])=>{ roundBoostSaved[k]=G.f.attrs[k]; G.f.attrs[k]=clamp(G.f.attrs[k]+v,1,100); });
    } else if(campPassive.type==='finishImmunity'){ immuneA=true; }
  }
  const res=simulateFight(G.f,opp,1,plan,null,{immuneA});
  if(roundBoostSaved){ Object.entries(roundBoostSaved).forEach(([k,v])=>{ G.f.attrs[k]=v; }); }
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: CORRECTIF_ROUNDSTATS_COACHING] — bug remonté : le détail
     juge-par-juge-par-round (res.roundStats, engine.js) n'était jamais
     conservé entre les 3 appels simulateFight(1 round) du coaching — la
     fiche de résultat (scr_result, ui-06) affichait donc l'en-tête du
     tableau détaillé sans aucune ligne pour un combat Gauntlet allant aux
     points. Chaque appel simulant un seul round, res.roundStats[0].r vaut
     toujours 1 (numérotation locale à l'appel) : on le réécrit avec le
     vrai numéro de round (c.round) avant de l'archiver. ==== */
  if(res.roundStats&&res.roundStats.length) c.roundStats.push(Object.assign({},res.roundStats[0],{r:c.round}));
  /* ==== [FIN ANCRE] ==== */
  const finished=res.method && (res.method.startsWith('KO')||res.method==='Soumission');
  const mergeStats=(dst,src)=>{ Object.keys(dst).forEach(k=>dst[k]=(dst[k]||0)+(src[k]||0)); };
  if(finished || c.round>=3){
    /* ==== [ANCRE: COACHING_ENTRE_ROUNDS] — restauration symétrique de
       startCoachingFight(), au tout dernier moment avant finalisation. ==== */
    const rst=c._restore||{};
    if(rst.bossMalusSaved) G.f.attrs[rst.bossMalusSaved.key]=rst.bossMalusSaved.before;
    if(rst.mutOppSaved) opp.attrs.power=rst.mutOppSaved.before;
    if(rst.mutSelfSaved) G.f.attrs.cardio=rst.mutSelfSaved.before;
    if(rst.campPassiveOppSaved) Object.entries(rst.campPassiveOppSaved).forEach(([k,v])=>{ opp.attrs[k]=v; });
    /* ==== [FIN ANCRE] ==== */
    /* ==== [ANCRE: SECOND_SOUFFLE] — ajout #24 (24 ajouts, 12/08/2026) :
       restauration du boost temporaire (voir plus bas, offre proposée sur
       scr_coaching_round) — "jusqu'à la fin du combat en cours", donc
       retiré ici, exactement au moment où ce combat se termine réellement. ==== */
    if(c.secondSouffleSaved){ Object.entries(c.secondSouffleSaved).forEach(([k,v])=>{ G.f.attrs[k]=v; }); c.secondSouffleSaved=null; }
    /* ==== [FIN ANCRE] ==== */
    let finalRes=res;
    if(!finished){
      // pas de finition au round 3 (ou avant) : décision cumulée sur les 3 rounds
      const totScoreA=c.scoreA+res.scoreA, totScoreB=c.scoreB+res.scoreB;
      mergeStats(c.stats.A,res.stats.A); mergeStats(c.stats.B,res.stats.B);
      const winner=totScoreA===totScoreB?'D':(totScoreA>totScoreB?'A':'B');
      /* ==== [ANCRE: CORRECTIF_JUGES_CUMUL_COACHING] — cumul RÉEL par juge
         (rounds précédents + round de cette finalisation), au lieu de ne
         reprendre que res.judges (le dernier round seul). Chaque juge reste
         sur 10 par round jugé, jusqu'à 30 en fin de combat 3 rounds — même
         convention que pour un combat non coaché (engine.js). ==== */
      const finalJudges={};
      ['j1','j2','j3'].forEach(j=>{ finalJudges[j]=[c.judges[j][0]+res.judges[j][0], c.judges[j][1]+res.judges[j][1]]; });
      finalRes={winner,method:winner==='D'?'Égalité':'Décision',round:3,scoreA:totScoreA,scoreB:totScoreB,judges:finalJudges,roundStats:c.roundStats,stats:c.stats,log:res.log};
      /* ==== [FIN ANCRE] ==== */
    } else {
      // finition anticipée : fusionne quand même les stats des rounds
      // précédents (sinon Le Fantôme, ajout #5, ne verrait que le dernier round)
      mergeStats(res.stats.A,c.stats.A); mergeStats(res.stats.B,c.stats.B);
      /* ==== [ANCRE: CORRECTIF_ROUND_FINITION_COACHING] — bug remonté (trouvé
         en implémentant le rendu round par round, ANCRE
         CORRECTIF_RENDU_ROUND_PAR_ROUND) : res.round vient du compteur LOCAL
         du moteur pour cet appel simulateFight(1 round) — toujours 1, quel
         que soit le vrai round de coaching (c.round) où la finition a eu
         lieu. Un KO au round 2 ou 3 s'affichait donc "Round 1" sur la fiche
         de résultat (scr_result, ui-06 : p.res.round). Réécrit avec le vrai
         round de coaching avant de transmettre finalRes (même objet que res
         ici, cf. `let finalRes=res;` plus haut). ==== */
      res.round=c.round;
      /* ==== [FIN ANCRE] ==== */
    }
    G.arcade.coaching=null;
    finalizeArcadeCombatResult(finalRes,plan);
    return;
  }
  // round non conclusif : cumule le score/les stats, applique la fatigue
  // approximée (cf. ANCRE ci-dessus), garde le round pour l'écran de coaching
  c.scoreA+=res.scoreA; c.scoreB+=res.scoreB;
  /* ==== [ANCRE: CORRECTIF_JUGES_CUMUL_COACHING] — même cumul par juge que
     dans la branche finalisation ci-dessus, pour que c.judges soit toujours
     à jour (sur 10 par round vu, jusqu'à 30 cumulé) au moment où
     scr_coaching_round affiche la tendance entre les rounds. ==== */
  ['j1','j2','j3'].forEach(j=>{ c.judges[j][0]+=res.judges[j][0]; c.judges[j][1]+=res.judges[j][1]; });
  /* ==== [ANCRE: ESTIMATION_JUGES_COACHING] — item demandé : le coin ne voit
     jamais les vraies cartes en direct dans un vrai combat, seulement une
     impression. c.judges (exact) reste la source de vérité utilisée pour
     déterminer le vainqueur en fin de combat (jamais modifié ici) ; on
     dérive juste UNE ESTIMATION affichée à l'écran de coaching, avec un
     bruit de 0 à 2 points par juge, dans un sens ou l'autre. Le total du
     round reste cohérent (rien n'est ajouté ni retiré, juste réparti
     différemment) — cf. le commentaire SECOND_SOUFFLE plus bas, qui
     nommait déjà ce concept ("selon l'estimation des juges") sans jamais
     l'avoir vraiment implémenté. Recalculée à chaque round (pas figée une
     fois pour toutes) : une nouvelle lecture à chaque pause, comme un vrai
     coin qui réévalue le combat round après round. ==== */
  /* ==== [ANCRE: CORRECTIF_JUGES_ESTIMATION_PLAFOND] — bug remonté : le
     bruit était borné sur le TOTAL cumulé (0 à ta+tb, jusqu'à 30 sur 3
     rounds) au lieu du plafond RÉEL "10 points par juge et par round jugé"
     — un vrai 10-9 après le round 1 (total 19) pouvait ressortir comme
     11-8 ou 7-12 à l'écran, des cartes qu'aucun juge ne peut donner. Le
     plafond par côté est désormais c.round*10 (c.round n'est incrémenté
     qu'après ce calcul, donc il vaut encore le nombre de rounds déjà
     jugés) — la somme reste inchangée (même principe que l'original), mais
     chaque côté reste dans les bornes crédibles. ==== */
  c.judgesEstimate={};
  const roundsJudgedCap=c.round*10;
  ['j1','j2','j3'].forEach(j=>{
    const [ta,tb]=c.judges[j], total=ta+tb, noise=Math.floor(rnd()*3), dir=rnd()<0.5?1:-1;
    const estA=clamp(ta+dir*noise,Math.max(0,total-roundsJudgedCap),Math.min(roundsJudgedCap,total));
    c.judgesEstimate[j]=[estA,total-estA];
  });
  /* ==== [FIN ANCRE] ==== */
  mergeStats(c.stats.A,res.stats.A); mergeStats(c.stats.B,res.stats.B);
  G.f.attrs.cardio=clamp(G.f.attrs.cardio-Math.round((res.stats.A.dmgHead+res.stats.A.dmgBody+res.stats.A.dmgLegs)*0.4),1,100);
  opp.attrs.cardio=clamp(opp.attrs.cardio-Math.round((res.stats.B.dmgHead+res.stats.B.dmgBody+res.stats.B.dmgLegs)*0.4),1,100);
  c.lastRoundRes=res; c.round++;
  /* ==== [ANCRE: SECOND_SOUFFLE] — ajout #24 (24 ajouts, 12/08/2026) :
     "peut se déclencher en perdant les 2 premiers rounds selon l'estimation
     des juges" — jusqu'ici implémenté avec le score EXACT (c.scoreA/scoreB),
     pas une estimation. Corrigé : utilise désormais c.judgesEstimate (bruité,
     calculé juste au-dessus), donc le joueur peut être trompé par une
     estimation trop optimiste (pas d'offre alors qu'il est réellement mené)
     ou trop pessimiste (offre alors qu'il mène en réalité) — comme un vrai
     coin qui n'a jamais les cartes exactes sous les yeux. Le Second Souffle
     reste, par construction, un événement du Coaching — jamais déclenché
     hors coaching, puisque aucune autre voie du jeu n'expose une estimation
     des juges à mi-combat. Offre calculée UNE FOIS en entrant dans le round
     3 (jamais recalculée à chaque render de scr_coaching_round), rare
     (20%), uniquement si l'estimation donne le joueur mené aux cartes après
     2 rounds. ==== */
  if(c.round===3 && !c.secondSouffleOffered){
    c.secondSouffleOffered=true;
    const estA=['j1','j2','j3'].reduce((s,j)=>s+c.judgesEstimate[j][0],0);
    const estB=['j1','j2','j3'].reduce((s,j)=>s+c.judgesEstimate[j][1],0);
    c.secondSouffleAvailable=(estA<estB) && rnd()<0.20;
  }
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: CORRECTIF_RENDU_ROUND_PAR_ROUND] — bug remonté : ce round
     venait d'être simulé (res, plus haut) mais son déroulé n'était jamais
     montré — le jeu sautait directement à l'écran de texte du coaching
     (Fin du round, tendance des juges), sans jamais faire jouer le Canvas
     de combat pour ce round précis. Seul le TOUT DERNIER round du combat
     finissait par y passer, une fois, tout à la fin (finalizeArcadeCombatResult).
     Reconstruit ici le même G.fight/G.pending qu'un combat classique
     (buildTimeline en lit la forme, engine.js/ui-08) à partir de CE round
     seul, pour le faire rejouer sur le ring avant d'atterrir sur l'écran de
     coaching. G._arenaNext (CL.toResult, ui-08) route la sortie de l'arène
     vers 'coaching_round' au lieu du résultat final — cette redirection ne
     dure qu'une sortie d'arène, remise à null aussitôt consommée. win/finish
     figés à false : ce round seul ne décide jamais le combat (jamais de
     confetti/chute de victoire prématurée, cf. ARENA.meWin, ui-08). ==== */
  G.fight={kind:'arcade',opp,rounds:3,plan,planLabel:G.arcade.planLabel||null};
  G.pending={res,win:false,method:res.method,finish:false,opp:{name:opp.name,flag:opp.flag},planLabel:G.arcade.planLabel||null,newAch:[]};
  G._arenaNext='coaching_round';
  buildTimeline(true); G.screen='arena'; save(); render();
  /* ==== [FIN ANCRE] ==== */
}
/* ==== [FIN ANCRE] ==== */
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: SECOND_SOUFFLE] — ajout #24 (24 ajouts, 12/08/2026) : +8 au
   total sur l'échelle /20 (soit +40 en interne, ×5) auto-distribué sur 4
   statistiques transversales (utile quel que soit le style/l'archétype),
   +10 chacune. Restauré à la fin du combat (runCoachingRound, branche
   finalisation) — ne dure jamais au-delà. ==== */
function acceptGauntletSecondSouffle(){
  const c=G.arcade&&G.arcade.coaching; if(!c||!c.secondSouffleAvailable||c.secondSouffleUsed) return;
  const keys=['composure','cardio','power','chin'];
  const saved={};
  keys.forEach(k=>{ saved[k]=G.f.attrs[k]; G.f.attrs[k]=clamp((G.f.attrs[k]||50)+10,1,100); });
  c.secondSouffleSaved=saved; c.secondSouffleUsed=true;
}
/* ==== [FIN ANCRE] ==== */
function genBossOpponent(streak){
  const div=G.f.div;
  const am=ascensionCurveMod(G.arcade&&G.arcade.asc);
  const lv=clamp(G.f.overall+streak*2+am.lv,60,93+am.cap);
  /* ==== [ANCRE: GAUNTLET_CAPSTONE_NEMESIS] — Boss Run capstone
     (G.arcade.capstone, débloqué à 5 entrées dans meta.gauntletRivalsDefeated,
     cf. scr_gauntlet_menu/ui-06) : au lieu du pool normal (rival aléatoire
     dès streak>=2, sinon boss anonyme), les 5 combats sont TOUJOURS les 5
     pires ennemis historiques du joueur, triés par overall décroissant —
     regénérés via fighterFromRivalSnapshot() comme une revanche normale,
     recalés sur la même courbe de niveau lv que le reste du Boss Run.
     Fallback sur la génération normale si le tableau est plus court que
     prévu (garde-fou, ne devrait jamais arriver vu la condition de
     déblocage). ==== */
  if(G.arcade&&G.arcade.capstone){
    const meta=loadMetaStats();
    const worst=getGauntletRivalsDefeated(meta).slice().sort((a,b)=>(b.overall||0)-(a.overall||0)).slice(0,5);
    const pick5=worst[streak];
    if(pick5){ const o=fighterFromRivalSnapshot(pick5,lv,'CAPSTONE — '+(pick5.nick||'')); o.champion='monde'; o.W=RI(18,30); o.L=RI(0,2); o.ko=RI(10,o.W); o.sub=RI(0,o.W-o.ko); return o; }
  }
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: REJOUABILITE_NEMESIS_BOSSRUN] — à partir du 3e combat,
     chance croissante de retomber sur un rival réellement enregistré
     (cf. recordGauntletRival) plutôt qu'un boss anonyme généré. Niveau du
     rival RECALÉ sur la courbe de difficulté ci-dessus (via fighterFromRival
     Snapshot(rival, lv, ...)) pour rester cohérent avec la baisse de
     difficulté générale — pas l'attrs brute du rival qui pourrait très bien
     dépasser 93 si le combattant qui l'a créé était très fort. ==== */
  if(streak>=2 && rnd()<0.25+streak*0.08){
    const rival=pickGauntletRival(div);
    if(rival){ const o=fighterFromRivalSnapshot(rival,lv,'REVANCHE — '+(rival.nick||'')); o.champion='monde'; o.W=RI(18,30); o.L=RI(0,2); o.ko=RI(10,o.W); o.sub=RI(0,o.W-o.ko); return o; }
  }
  /* ==== [FIN ANCRE] ==== */
  const o=makeFighter({gender:G.f.gender,div,style:pick(STYLE_KEYS),level:lv,potential:99,age:RI(26,33)});
  o.stage='pro'; o.org=6; o.champion='monde'; o.W=RI(18,30); o.L=RI(0,2); o.ko=RI(10,o.W); o.sub=RI(0,o.W-o.ko);
  o.nick=pick(['Le Tyran','Le Cauchemar','L\u2019Intouchable','Le Destructeur']);
  return o;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [FIN ANCRE] ==== */
/** @type {Array<{unlockId?:string,nick:string,flag:string,country:string,style:string,styleLabel:string,div:string,age:number,attrs:Record<string,number>,perk:string}>}
 * Type élargi volontairement (attrs en dictionnaire générique, pas une forme
 * exacte) : chaque archétype ne renseigne qu'un sous-ensemble différent des
 * 30 attributs (normal et sans risque en JS), ce que l'inférence stricte de
 * TypeScript refuserait sinon de laisser pousser dans le même tableau. */
const ARCADE_ARCHETYPES=[
  { nick:'Le Bûcheron', flag:'🇺🇸', country:'US', style:'boxer', styleLabel:'Bagarreur', div:'H-heavy', age:34,
    attrs:{power:95,chin:90,durability:88,strength:85,cardio:32,tdd:30,submission:15,footSpeed:30,handSpeed:55},
    perk:'Frapper fort, dormir tôt. Un cardio de fumeur mais une droite nucléaire.' },
  { nick:'L\u2019Anaconda', flag:'🇧🇷', country:'BR', style:'bjj', styleLabel:'Maître du Sol', div:'H-light', age:26,
    attrs:{submission:95,guardWork:90,topControl:80,flexibility:88,power:28,handSpeed:35,footSpeed:45,chin:60},
    perk:'Si le combat va au sol, c\u2019est terminé. S\u2019il reste debout, vous êtes mort.' },
  { nick:'Le Cyborg', flag:'🇷🇺', country:'RU', style:'sambo', styleLabel:'Machine', div:'H-welter', age:21,
    attrs:{takedown:78,cardio:90,power:70,tdd:75,submission:65,chin:80,strength:75},
    perk:'Le prospect parfait. Équilibré, increvable, programmé pour détruire.' },
  { nick:'Le Kaiju', flag:'🇯🇵', country:'JP', style:'wrestler', styleLabel:'Colosse', div:'H-heavy', age:32,
    attrs:{power:98,chin:95,durability:95,strength:95,cardio:18,footSpeed:15,handSpeed:30,takedown:60},
    perk:'Une anomalie physique colossale. Lent, lourd, mais chaque pas fait trembler la cage.' },
  { nick:'Le Tacticien', flag:'🏴', country:'GB', style:'karate', styleLabel:'Manager', div:'H-welter', age:38,
    attrs:{jab:70,cross:65,footSpeed:75,fightIQ:90,composure:90,cardio:85,power:35,chin:70},
    perk:'Il gère l\u2019économie de ses frappes comme un budget. Il ne prend aucun risque inutile.' },
  { nick:'Le Poids du Corps', flag:'🇫🇷', country:'FR', style:'mma', styleLabel:'Gymnaste', div:'H-light', age:23,
    attrs:{cardio:99,flexibility:90,takedown:70,submission:65,jab:60,cross:60,power:45,chin:65},
    perk:'Zéro fonte, que de la traction et de la mobilité. Une force fonctionnelle et une endurance hallucinante.' },
  { nick:'La Brique', flag:'🇫🇷', country:'FR', style:'boxer', styleLabel:'Incassable', div:'H-heavy', age:28,
    attrs:{jab:75,cross:80,hook:80,chin:99,durability:95,power:78,cardio:55,tdd:25},
    perk:'Dur au mal, taillé dans la brique rouge du nord. Littéralement impossible à mettre KO.' },
  { nick:'Le Botaniste', flag:'🇳🇱', country:'GE', style:'kickboxer', styleLabel:'Méthodique', div:'H-welter', age:25,
    attrs:{kick:90,cross:70,composure:85,fightIQ:80,cardio:80,power:60,chin:75},
    perk:'La patience est une vertu. Il laisse ses adversaires s\u2019épuiser avant de les cueillir.' },
  { nick:'Le Fantôme', flag:'🇮🇪', country:'IE', style:'karate', styleLabel:'Insaisissable', div:'H-light', age:27,
    attrs:{footSpeed:98,jab:85,cross:75,cardio:85,power:50,chin:35,durability:30},
    perk:'Touche sans être touché. S\u2019il prend un seul coup net, les lumières s\u2019éteignent.' },
  { nick:'Le Zombie', flag:'🇰🇷', country:'KR', style:'mma', styleLabel:'Mort-Vivant', div:'H-welter', age:35,
    attrs:{chin:99,durability:95,heart:95,hook:55,takedown:60,submission:55,cardio:75,power:55},
    perk:'Avance constamment en encaissant tout. La pression psychologique finit par briser l\u2019adversaire.' },
  { nick:'L\u2019Assassin', flag:'🇹🇭', country:'TH', style:'muayThai', styleLabel:'Clinch', div:'H-light', age:24,
    attrs:{clinchStr:95,kick:85,power:88,killer:85,chin:60,cardio:70},
    perk:'Des coudes tranchants comme des lames. Cherche l\u2019ouverture pour une hémorragie rapide.' },
  { nick:'La Pieuvre', flag:'🇷🇺', country:'RU', style:'wrestler', styleLabel:'Lutteur', div:'H-welter', age:30,
    attrs:{takedown:98,submission:80,topControl:85,chin:80,cardio:75,power:35,jab:15},
    perk:'Dès que ses mains vous touchent, vous volez. Il étouffe ses adversaires pendant 15 minutes.' },
  { nick:'Le Professeur', flag:'🇨🇦', country:'CM', style:'mma', styleLabel:'Vétéran', div:'H-heavy', age:41,
    attrs:{fightIQ:98,adaptability:90,jab:70,cross:70,takedown:65,submission:65,chin:55,cardio:45},
    perk:'Il a tout vu, tout fait. Son QI de combat est infini, mais son corps commence à le lâcher.' },
  { nick:'Flash', flag:'🇯🇲', country:'GE', style:'karate', styleLabel:'Acrobate', div:'H-light', age:22,
    attrs:{kick:88,footSpeed:95,explosiveness:90,power:70,chin:45,cardio:90},
    perk:'Des coups de pied retournés sortis de nulle part. Spectaculaire mais terriblement imprévisible.' },
  { nick:'Le Boucher', flag:'🇲🇽', country:'MX', style:'boxer', styleLabel:'Guerre', div:'H-welter', age:31,
    attrs:{jab:78,cross:82,hook:82,power:80,chin:88,heart:90,cardio:85},
    perk:'Transforme chaque combat en un bain de sang dans une cabine téléphonique.' },
  { nick:'L\u2019Ours', flag:'🇷🇺', country:'RU', style:'sambo', styleLabel:'Force Pure', div:'H-heavy', age:29,
    attrs:{strength:98,power:92,takedown:85,submission:80,chin:88,cardio:35},
    perk:'Peut soulever des montagnes. Mais au bout de trois minutes, il hiberne.' },
  { nick:'Le Gamin', flag:'🇺🇸', country:'US', style:'wrestler', styleLabel:'Phénomène', div:'H-light', age:19,
    attrs:{takedown:82,cardio:99,heart:85,chin:75,power:45,submission:55},
    perk:'Sort à peine du lycée. Une énergie inépuisable et une arrogance qui rend fou.' },
  { nick:'L\u2019Aristocrate', flag:'🇬🇧', country:'GB', style:'boxer', styleLabel:'Noble Art', div:'H-welter', age:33,
    attrs:{jab:92,cross:80,footSpeed:70,tdd:65,composure:85,power:65,chin:75,cardio:70},
    perk:'Un jab d\u2019une précision chirurgicale. Refuse d\u2019aller au sol, trouve ça salissant.' },
  { nick:'Le Moine', flag:'🇨🇳', country:'CM', style:'karate', styleLabel:'Spirituel', div:'H-light', age:36,
    attrs:{composure:95,discipline:95,jab:75,kick:75,chin:82,cardio:80,power:60},
    perk:'Ne ressent pas la douleur. Un état zen qui perturbe l\u2019algorithme des juges.' },
  { nick:'Le Contrebandier', flag:'🇨🇴', country:'MX', style:'mma', styleLabel:'Sale', div:'H-welter', age:27,
    attrs:{clinchStr:70,killer:85,aggression:88,power:78,chin:80,takedown:55,submission:50,cardio:65},
    perk:'Doigts dans les yeux, accrochages à la cage. Il utilise tout ce que l\u2019arbitre ne voit pas.' },
  { nick:'Le Surfer', flag:'🇦🇺', country:'BR', style:'bjj', styleLabel:'Détendu', div:'H-light', age:24,
    attrs:{submission:85,guardWork:88,composure:90,flexibility:80,power:42,chin:70,cardio:80},
    perk:'Arrive dans la cage en tongs. Soumet ses adversaires avec un grand sourire.' },
  { nick:'Le Météore', flag:'🇳🇬', country:'NG', style:'kickboxer', styleLabel:'Explosif', div:'H-welter', age:26,
    attrs:{kick:92,cross:80,power:96,explosiveness:92,chin:65,cardio:38},
    perk:'Le round 1 est une exécution publique. Le round 2 est une agonie respiratoire.' },
  { nick:'La Machine à Sous', flag:'🇺🇸', country:'US', style:'mma', styleLabel:'Superstar', div:'H-welter', age:30,
    attrs:{jab:70,cross:70,takedown:55,submission:45,power:72,chin:72,cardio:72,confidence:90},
    perk:'Stats moyennes, mais il attire la lumière. Capable d\u2019un miracle quand les caméras tournent.' },
];
/* ==== [ANCRE: ITEM_TACTIQUE_PAR_ARCHETYPE] — item demandé : « les tactiques
   utilisées sont toujours les mêmes que carrière complète » — VÉRIFIÉ AVANT
   CORRECTION : scr_arcade_plan (ui-04) tirait TACTICS[f.style] (ui-01, pool de
   carrière, 3 options par STYLE), commun à tous les archétypes partageant un
   style. Deux archétypes du même style avaient donc EXACTEMENT le même plan de
   combat proposé.
   Chaque archétype reçoit désormais UNE tactique qui lui est propre, ajoutée
   par scr_arcade_plan à la liste existante (pas un remplacement — les 3
   options de style restent disponibles, celle-ci s'ajoute). Le mécanisme
   réutilise exactement le canal déjà en place pour getExclusiveTactics()
   (engine.js) : mêmes clés de modificateur (str/ko/def/td/tdd/sub/gnp/ctrl),
   mêmes bornes de puissance que le reste du pool TACTICS (~1.2-2.3), aucun
   nouveau système. Chaque entrée est dérivée du profil réel de l'archétype
   (son couple de stats extrêmes) et de son .perk déjà existant, pas d'un
   thème générique plaqué dessus. Couvre les 23 archétypes de base ET les 7
   archétypes de LOT11_GAUNTLET_ETENDU (3 étendus + 4 débloquables, injectés
   dans ARCADE_ARCHETYPES par injectExtendedArchetypes() plus bas) — la table
   est indexée par nick, donc indépendante de l'ordre/moment d'injection. ==== */
const ARCADE_EXCLUSIVE_TACTICS={
  'Le Bûcheron':{id:'aex_bucheron',lbl:'La Hache Nucléaire',desc:'Une bûche, une droite, un adversaire au sol. Le plan tient en une phrase — le cardio de toute façon n\u2019en permettrait pas une deuxième.',m:{ko:2.1,str:1.1,def:0.3}},
  'L\u2019Anaconda':{id:'aex_anaconda',lbl:'L\u2019Étreinte Fatale',desc:'Chaque échange rapproché est une invitation à l\u2019étouffement. Le combat debout n\u2019est qu\u2019une formalité avant l\u2019inévitable.',m:{sub:2.0,td:1.3,str:0.3}},
  'Le Cyborg':{id:'aex_cyborg',lbl:'Protocole Standard',desc:'Aucune fioriture, aucune improvisation. Exécuter le plan de base à la perfection, combat après combat, sans jamais dévier.',m:{str:1.2,td:1.2,def:1.2,ko:0.8}},
  'Le Kaiju':{id:'aex_kaiju',lbl:'Le Poids Qui Écrase',desc:'Un seul takedown suffit. Une fois en dessous de cette masse, il n\u2019y a plus d\u2019échappatoire — seulement des os qui craquent.',m:{td:1.8,gnp:1.6,def:0.4}},
  'Le Tacticien':{id:'aex_tacticien',lbl:'Le Comptable Du Cage-Time',desc:'Chaque frappe est budgétée, chaque round évalué comme un bilan. Zéro gaspillage, zéro passion — juste des points qui s\u2019accumulent.',m:{str:1.3,def:1.4,ko:0.4}},
  'Le Poids du Corps':{id:'aex_poidscorps',lbl:'Le Marathon Sans Fin',desc:'Le rythme ne retombe jamais. Épuiser l\u2019adversaire par la seule durée du combat, round après round, jusqu\u2019à ce qu\u2019il n\u2019ait plus rien.',m:{td:1.4,ctrl:1.3,ko:0.5}},
  'La Brique':{id:'aex_brique',lbl:'Encaisse Et Réponds',desc:'Chaque coup reçu est une invitation à en rendre deux. Le menton ne cède jamais, alors pourquoi bouger la tête ?',m:{str:1.5,ko:1.2,def:0.4}},
  'Le Botaniste':{id:'aex_botaniste',lbl:'La Cueillette Tardive',desc:'Regarder l\u2019adversaire s\u2019épuiser tout seul avant de placer le coup qui compte, jamais avant le round 3.',m:{def:1.6,ko:1.4,str:0.6}},
  'Le Fantôme':{id:'aex_fantome',lbl:'Zéro Contact, Sinon Rien',desc:'La seule règle : ne jamais être touché. Un menton de verre ne pardonne aucune erreur, alors il n\u2019en fait aucune.',m:{def:2.3,str:0.8,ko:0.3}},
  'Le Zombie':{id:'aex_zombie',lbl:'La Marche Qui Ne S\u2019arrête Jamais',desc:'Avancer, encaisser, avancer encore. La pression psychologique de ne jamais reculer finit toujours par briser l\u2019adversaire en premier.',m:{str:1.2,ctrl:1.3,def:0.5}},
  'L\u2019Assassin':{id:'aex_assassin',lbl:'Les Coudes D\u2019abord',desc:'La clinch n\u2019est qu\u2019un prétexte pour ouvrir des coupures. Chaque échange rapproché saigne un peu plus l\u2019adversaire.',m:{str:1.7,ko:1.3,def:0.5}},
  'La Pieuvre':{id:'aex_pieuvre',lbl:'Un Contact, Une Sentence',desc:'Dès que ses mains touchent la peau, le combat est fini — il ne reste plus qu\u2019à choisir le bras ou le cou.',m:{td:2.0,sub:1.5,str:0.3}},
  'Le Professeur':{id:'aex_professeur',lbl:'Le Livre Est Déjà Écrit',desc:'Il a vu chaque scénario possible et a la réponse pour chacun — le seul problème, c\u2019est que le corps ne suit plus le plan aussi longtemps qu\u2019avant.',m:{def:1.5,ctrl:1.3,str:0.7}},
  'Flash':{id:'aex_flash',lbl:'L\u2019Éclair Ou Rien',desc:'Un coup de pied retourné sorti de nulle part peut finir le combat en une seconde — s\u2019il rate, il n\u2019y a pas de plan B.',m:{ko:1.9,str:1.2,def:0.4}},
  'Le Boucher':{id:'aex_boucher',lbl:'La Cabine Téléphonique',desc:'Aucun pas en arrière, aucun calcul. Juste échanger coup pour coup jusqu\u2019à ce que l\u2019un des deux ne se relève plus.',m:{str:1.8,ko:1.3,def:0.3}},
  'L\u2019Ours':{id:'aex_ours',lbl:'Trois Minutes De Fin Du Monde',desc:'Une fenêtre de force brute avant l\u2019hibernation. Tout doit se jouer avant que le carburant ne manque.',m:{td:1.8,ko:1.5,def:0.4}},
  'Le Gamin':{id:'aex_gamin',lbl:'L\u2019Énergie Qui Ne Tarit Jamais',desc:'Aucune notion de fatigue, aucun respect de la hiérarchie. Juste emmener au sol, encore et encore, jusqu\u2019à l\u2019épuisement de l\u2019autre.',m:{td:1.9,ctrl:1.2,str:0.5}},
  'L\u2019Aristocrate':{id:'aex_aristocrate',lbl:'Le Jab Chirurgical',desc:'Une seule arme, utilisée avec une précision totale. Refuse catégoriquement d\u2019aller au sol — ça salirait le costume.',m:{str:1.6,tdd:1.6,ko:0.5}},
  'Le Moine':{id:'aex_moine',lbl:'L\u2019Indifférence À La Douleur',desc:'Aucune douleur ne perturbe le rythme. Un état zen qui rend chaque échange mécanique, presque ennuyeux à subir.',m:{def:1.5,str:1.2,ko:0.6}},
  'Le Contrebandier':{id:'aex_contrebandier',lbl:'Tout Ce Que L\u2019arbitre Ne Voit Pas',desc:'Doigts dans les yeux, coudes dans la nuque, accrochages à la cage. La cage a des angles morts, il les connaît tous.',m:{str:1.4,ko:1.3,def:0.6}},
  'Le Surfer':{id:'aex_surfer',lbl:'Le Sourire Avant L\u2019étranglement',desc:'Aucune urgence, aucun stress. Attendre la bonne clé, sourire, et refermer la prise sans jamais forcer.',m:{sub:1.8,td:1.2,str:0.4}},
  'Le Météore':{id:'aex_meteore',lbl:'L\u2019Exécution Publique Du Round 1',desc:'Tout est joué dans les 5 premières minutes. Après ça, il ne reste plus qu\u2019un homme qui cherche son souffle.',m:{ko:2.0,str:1.3,def:0.3}},
  'La Machine à Sous':{id:'aex_machinesous',lbl:'Le Miracle Sous Les Projecteurs',desc:'Rien ne le distingue sur le papier — sauf sa capacité à sortir un geste impossible dès que les caméras s\u2019allument.',m:{ko:1.4,sub:1.3,str:1.1}},
  'Le Chirurgien':{id:'aex_chirurgien',lbl:'Rien Au-Dessus Du Genou',desc:'Ignore tout ce qui se passe à la tête. Une cheville qui dépasse suffit à finir n\u2019importe quel combat.',m:{sub:2.0,td:1.4,str:0.3}},
  'Le Colosse de Chair':{id:'aex_colosse',lbl:'Rien Ne Passe, Rien Ne Presse',desc:'Aucune urgence à esquiver ce qui ne fait pas mal. Avancer lentement jusqu\u2019à ce que l\u2019adversaire comprenne qu\u2019il a déjà perdu.',m:{def:1.6,str:1.1,ko:0.6}},
  'L\u2019Hélicoptère':{id:'aex_helicoptere',lbl:'La Tempête Ou Rien',desc:'Une rafale de coups de pied retournés qui doit finir le combat avant que le souffle ne manque — et il manquera vite.',m:{ko:1.9,str:1.3,def:0.4}},
  'Le Titan Antique':{id:'aex_titan',lbl:'Le Poids Des Âges',desc:'Une prise et le combat est déjà écrit. La seule question est combien de temps l\u2019adversaire survit en dessous.',m:{td:2.0,gnp:1.5,def:0.4}},
  'Le Shinobi':{id:'aex_shinobi',lbl:'Invisible Jusqu\u2019à L\u2019étranglement',desc:'Aucun angle d\u2019attaque prévisible. Il n\u2019est nulle part, puis il est accroché à un cou et c\u2019est déjà fini.',m:{sub:1.9,def:1.3,str:0.4}},
  'Le Roi de la Rue':{id:'aex_roirue',lbl:'La Bagarre De Pub',desc:'Refuse catégoriquement d\u2019aller au sol. Le combat se règle debout, au corps à corps, jusqu\u2019à ce qu\u2019un des deux tombe.',m:{str:1.6,tdd:1.5,ko:1.1}},
  'Le Sniper':{id:'aex_sniper',lbl:'Jamais À Portée',desc:'La distance est la seule arme qui compte. Démonter au tibia depuis l\u2019extérieur, sans jamais laisser l\u2019adversaire entrer.',m:{str:1.5,def:1.5,ko:0.6}},
};
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: REJOUABILITE_DRAFT_SHUFFLE] — .sort(()=>0.5-rnd()) est un
   shuffle biaisé connu (dépend de l'algo de tri du moteur JS, favorise
   certaines positions) : sur 27 archétypes ça revenait à retirer presque
   toujours le même sous-ensemble en tête de tableau. Fisher-Yates réel,
   toujours sur rnd() (seedé) pour rester reproductible. ==== */
/* ==== [ANCRE: REJOUABILITE_DRAFT_ANTIREPET] — meta.lastArcadeDraft (3 nicks
   de la run précédent, toutes formats confondus) exclu du tirage courant tant
   que le pool restant compte au moins 3 archétypes hors exclusion — sinon on
   retombe sur le pool complet plutôt que de planter (cas d'un joueur qui n'a
   débloqué aucun archétype bonus et n'a que le socle de base). ==== */
/* ==== [ANCRE: IDENTITE_DE_CAMP] — ajout #22 (24 ajouts, 12/08/2026) : choix
   UNIQUE et définitif pour toute la run, parmi 3 identités tirées au hasard
   sur 8 possibles — posé juste après le tirage d'archétype (selectDraft,
   ui-08), avant le premier combat. Effets exprimés en échelle brute
   (×5 depuis /20, même convention que consommables/mutateurs). ==== */
/* ==== [ANCRE: PASSIF_IDENTITE_DE_CAMP] — item demandé : chaque identité (sauf
   Camp du Silence, qui n'en a volontairement aucun) débloque un passif
   mécanique réel, appliqué/retiré autour des appels simulateFight() du
   coaching Gauntlet (runCoachingRound/startCoachingFight, ui-03) — jamais
   du texte de flaveur seul. Types :
   - 'roundBoost' : boost temporaire sur G.f.attrs, UN round précis seulement.
   - 'oppPermanent' : malus permanent sur opp.attrs, tout le combat.
   - 'finishImmunity' : immuneA passé à simulateFight (ANCRE
     IMMUNITE_FINITION_CAMP, engine.js), UN round précis seulement.
   `label` est affiché tel quel à l'écran de choix (scr_camp_identity_pick)
   et dans le statut de run (gauntletStatusBlock). ==== */
/* ==== [ANCRE: CORRECTIF_PASSIF_ECHELLE] — bug remonté : les labels de
   passif écrivaient le delta interne BRUT (échelle /100 de G.f.attrs, ex.
   "+10 Cardio"), affiché juste au-dessus/à côté de deltas correctement
   convertis en /20 (fxTxt de scr_camp_identity_pick, ui-04 : "Cardio 18 →
   20", ou deltaTags ailleurs) — même origine que le bug, deux échelles
   mélangées sur le même écran. Même formule de conversion que ces deltas
   déjà corrects (Math.sign×Math.max(1,Math.round(/5))) : jamais le nombre
   interne tel quel dans un texte destiné au joueur. ==== */
function campFxLabel(fx){
  return Object.entries(fx).map(([k,v])=>{
    const shown=Math.sign(v)*Math.max(1,Math.round(Math.abs(v)/5));
    return `${shown>0?'+':''}${shown} ${attrLabel(k)}`;
  }).join(', ');
}
/* ==== [FIN ANCRE] ==== */
const GAUNTLET_CAMP_IDENTITIES=[
  {id:'camp_spartiate',name:'Camp Spartiate',desc:'Endurance à outrance, jamais de repos.',fx:{cardio:15,recovery:-10},
   passive:(()=>{ const fx={cardio:10,power:10}; return {type:'roundBoost',round:3,fx,label:`Round 3 de chaque combat : ${campFxLabel(fx)} (ce round-là uniquement)`}; })()},
  {id:'camp_mercenaire',name:'Camp Mercenaire',desc:'On paie pour la puissance, pas pour la discipline.',fx:{power:15,composure:-10},
   passive:(()=>{ const fx={chin:-8}; return {type:'oppPermanent',fx,label:`Menton de l\u2019adversaire fragilisé pour tout le combat (${campFxLabel(fx)}, invisible pour lui)`}; })()},
  {id:'camp_universitaire',name:'Camp Universitaire',desc:'Chaque geste est étudié, disséqué, anticipé.',fx:{fightIQ:15,power:-10},
   passive:(()=>{ const fx={power:-6,footSpeed:-6}; return {type:'oppPermanent',fx,label:`Adversaire légèrement affaibli pour tout le combat (${campFxLabel(fx)})`}; })()},
  {id:'camp_familial',name:'Camp Familial',desc:'Un clan qui protège, jamais qui pousse à bout.',fx:{composure:15,cardio:-10},
   passive:{type:'finishImmunity',round:1,label:'Round 1 : impossible à finir (KO/TKO/Soumission)'}},
  {id:'camp_silence',name:'Camp du Silence',desc:'Aucun mot inutile. Encaisser sans broncher.',fx:{chin:15,footSpeed:-10},
   passive:null},
  {id:'camp_meute',name:'Camp de la Meute',desc:'Toujours à plusieurs sur le tapis, jamais seul.',fx:{takedown:15,handSpeed:-10},
   passive:(()=>{ const fx={takedown:10,topControl:10}; return {type:'roundBoost',round:2,fx,label:`Round 2 de chaque combat : ${campFxLabel(fx)} (ce round-là uniquement)`}; })()},
  {id:'camp_ascetique',name:'Camp Ascétique',desc:'Le corps comme une armure qu\u2019on forge, rien de plus.',fx:{durability:15,explosiveness:-10},
   passive:{type:'finishImmunity',round:3,label:'Round 3 : impossible à finir (KO/TKO/Soumission)'}},
  {id:'camp_spectacle',name:'Camp du Spectacle',desc:'On vient pour l\u2019étincelle, pas pour la tactique.',fx:{explosiveness:15,tdd:-10},
   passive:(()=>{ const fx={explosiveness:10,power:10}; return {type:'roundBoost',round:1,fx,label:`Round 1 de chaque combat : ${campFxLabel(fx)} (ce round-là uniquement)`}; })()}
];
/* ==== [FIN ANCRE] ==== */
function drawGauntletCampIdentityOptions(){
  const shuffled=GAUNTLET_CAMP_IDENTITIES.slice();
  for(let i=shuffled.length-1;i>0;i--){ const j=Math.floor(rnd()*(i+1)); [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]]; }
  return shuffled.slice(0,3);
}
/* Point de passage unique après selectDraft (ui-08) : force le choix
   d'identité une seule fois par run, avant tout accès au hub. */
function goArcadeHubOrIdentity(){
  if(!G.arcade.campIdentity && !G.arcade.campIdentityOptions){
    G.arcade.campIdentityOptions=drawGauntletCampIdentityOptions();
    G.screen='camp_identity_pick';
    return;
  }
  G.screen='arcadehub';
}
/* ==== [FIN ANCRE] ==== */
function buildArcadePool(){
  const meta=loadMetaStats();
  const excluded=meta.lastArcadeDraft||[];
  let candidates=ARCADE_ARCHETYPES.filter(a=>!excluded.includes(a.nick));
  if(candidates.length<3) candidates=ARCADE_ARCHETYPES.slice();
  const shuffled=candidates.slice();
  for(let i=shuffled.length-1;i>0;i--){ const j=Math.floor(rnd()*(i+1)); [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]]; }
  const picked=shuffled.slice(0,3);
  meta.lastArcadeDraft=picked.map(a=>a.nick); saveMetaStats(meta);
  return picked.map(makeArcadeArchetype);
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: CORRECTIF_CODE_MORT] — genArcadeOpponent() a été retirée :
   définie mais jamais appelée nulle part dans la codebase (vérifié par
   comptage d'usage). L'adversaire arcade "classique" (hors Boss Run/Ladder/
   Bracket) est en réalité généré ailleurs — cette fonction était un reliquat
   d'une version antérieure du mode. ==== */
/* ==== [ANCRE: REJOUABILITE_PLAN_ARCADE_RESOLVE] — G.arcade.plan (posé par
   CL.chooseArcadePlan(), ui-08, depuis scr_arcade_plan) était jusqu'ici
   ignoré : simulateFight() était toujours appelée sans 4e paramètre, quel
   que soit le choix fait à l'écran. G.fight.plan reflète maintenant le même
   choix, pour que l'affichage du combat (qui lit G.fight.planLabel comme en
   carrière) reste cohérent. ==== */
function resolveArcadeFight(){
  /* ==== [ANCRE: COACHING_OBLIGATOIRE] — item demandé : le coaching entre les
     rounds n'est plus un toggle optionnel (coachingToggleBlock ne fait plus
     que l'afficher comme actif, cf. ui-04) — startCoachingFight() est
     désormais le SEUL chemin de résolution d'un combat Gauntlet, sur les
     3 formats. L'ancien chemin direct (bossMalus/mutateurs appliqués puis
     simulateFight(3 rounds) d'un bloc) est retiré : il est désormais mort
     (plus jamais atteint) et sa logique équivalente vit déjà dans
     startCoachingFight()/runCoachingRound() (mêmes ANCREs BOSSRUN_MISE_EN_SCENE
     et GAUNTLET_MUTATEURS_ALEATOIRES, appliquées/restaurées round par round
     au lieu d'un seul bloc). ==== */
  startCoachingFight();
}
/* ==== [ANCRE: COACHING_ENTRE_ROUNDS] — ajout #21 (24 ajouts, 12/08/2026) :
   extrait de resolveArcadeFight() (avant : tout le bloc "après simulate"
   vivait directement dans resolveArcadeFight) pour être appelable aussi
   depuis le chemin coaching (runCoachingRound() plus bas), qui construit son
   propre `res` cumulé sur 3 appels round-par-round au lieu d'un seul appel
   3 rounds. AUCUN changement de comportement pour le chemin normal
   (non-coaching) — simple découpage, la logique est copiée à l'identique. ==== */
function finalizeArcadeCombatResult(res,plan){
  const opp=G.arcade.opponent;
  /* ==== [ANCRE: PREPARATION_CIBLEE] — ajout #23 (24 ajouts, 12/08/2026) :
     restauration du malus fightIQ payé pour percer la rumeur de CE combat
     (pierceGauntletRumor, plus haut) — jamais permanent, et réinitialisé
     pour que le combat suivant redémarre sur une rumeur normale (ou puisse
     être percée à nouveau, contre un nouveau coût). ==== */
  if(G.arcade._pierceMalusSaved){ G.f.attrs.fightIQ=G.arcade._pierceMalusSaved.before; G.arcade._pierceMalusSaved=null; }
  G.arcade.analysisPierced=false;
  /* ==== [FIN ANCRE] ==== */
  const win=applyResult(G.f,opp,res,'A'); applyResult(opp,G.f,res,'B');
  /* ==== [ANCRE: GAUNTLET_FANTOME] — ajout #5 (24 ajouts, 12/08/2026) : snapshot
     du combat qui vient de se dérouler, empilé dans l'ordre pour former le
     journal de la run en cours. res.stats.A = côté joueur en arcade (cf.
     ANCRE juste au-dessus, ligne 495) : dégâts SUBIS par zone + amenées/
     knockdowns RÉALISÉS par le joueur. Comparé position par position à
     meta.gauntletGhostLog (meilleure run connue) dans scr_result (ui-06). ==== */
  G.arcade.ghostFights=(G.arcade.ghostFights||[]).concat([{dmgHead:res.stats.A.dmgHead,dmgBody:res.stats.A.dmgBody,dmgLegs:res.stats.A.dmgLegs,td:res.stats.A.td,kd:res.stats.A.kd}]);
  /* ==== [FIN ANCRE] ==== */
  { const last=G.f.history[G.f.history.length-1];
    if(last){ last.oppName=opp.name; last.oppFlag=opp.flag; last.oppRank='NR'; last.season=(G.arcade.mode==='boss_run')?(G.arcade.streak+1):(G.arcade.tournament?G.arcade.tournament.roundStep:1); } }
  G.fight={kind:'arcade',opp,rounds:3,plan,planLabel:G.arcade.planLabel||null};
  /* ==== [ANCRE: REJOUABILITE_ACH_ARCADE] — checkAch() (ui-05) n'était appelé
     que par resolveFight() (carrière) : aucun succès n'était atteignable en
     Gauntlet, alors que checkAch() est générique (lit G.f.W/L/ko/sub/history,
     déjà tenus à jour en arcade via applyResult() ci-dessus). newAch rejoint
     G.pending sous la même clé que resolveFight() : scr_result (ui-06,
     PARTAGÉ entre carrière et arcade via G.screen='result') l'affiche déjà
     sans aucune modification d'écran nécessaire. ==== */
  const newAch=(typeof checkAch==='function')?checkAch():[];
  /* ==== [FIN ANCRE] ==== */
  G.pending={res,win,method:res.method,finish:!isDecisionLike(res.method),opp:{name:opp.name,flag:opp.flag},planLabel:G.fight.planLabel,newAch};
  G.arcade.plan=null; G.arcade.planLabel=null;
  buildTimeline(); G.screen='arena'; save(); render();
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: WTUMMA_BRACKET64] — refonte du Gauntlet en tournoi à
   élimination directe à 64 combattants. N'affecte QUE le mode normal
   (G.arcade.mode!=='boss_run') — le Boss Run reste sur son propre système
   streak-based, séparé et intact. ==== */
/* ==== [ANCRE: REJOUABILITE_DIFFICULTE_BRACKET] — passe d'ajustement de
   confort, PAS un rééquilibrage complet (aucun audit Monte Carlo derrière,
   contrairement au rebalancing de styles déjà fait sur le moteur) : seed de
   départ plus clémente pour un même OVR (diviseur 2 → 1.3) et plafond de
   niveau adverse abaissé (95/99 → 88/93). Réversible en un chiffre si ça se
   révèle trop généreux à l'usage. ==== */
function buildWTUMMABracket(player){
  const pSeed=clamp(64-Math.floor((player.overall-40)/1.3),1,64);
  const pool=[];
  const rival=pickGauntletRival(player.div);
  for(let i=1;i<=64;i++){
    if(i===pSeed){ player.seed=i; pool.push(player); }
    else if(i===1 && rival){
      const boss=fighterFromRivalSnapshot(rival,88,'LE CHAMPION EN TITRE'); boss.seed=1; pool.push(boss);
    } else {
      const _am=ascensionCurveMod(G.arcade&&G.arcade.asc);
      const lv=clamp(88-Math.floor(i/1.6)+RI(-3,3)+_am.lv,25,93+_am.cap);
      const o=makeFighter({gender:player.gender,div:player.div,style:pick(STYLE_KEYS),level:lv,potential:99,age:RI(20,35)});
      o.stage='pro'; o.org=6; o.seed=i; o.W=RI(15,35); o.L=RI(0,4);
      pool.push(o);
    }
  }
  // Si la Némésis a déjà été placée en pSeed par coïncidence (rare), on décale d'un cran pour éviter le doublon
  let matches=[]; for(let i=0;i<32;i++){ matches.push({a:pool[i],b:pool[63-i]}); }
  return {active:true,roundStep:1,stepName:'Top 64 (32èmes)',matches,playerSeed:pSeed};
}
function advanceWTUMMABracket(){
  const t=G.arcade.tournament; const survivors=[];
  t.matches.forEach(m=>{
    if(m.a.id===G.f.id||m.b.id===G.f.id){ survivors.push(G.f); }
    else { const res=simulateFight(m.a,m.b,3); applyResult(m.a,m.b,res,'A'); applyResult(m.b,m.a,res,'B'); survivors.push(res.winner==='A'?m.a:m.b); }
  });
  t.roundStep++;
  const steps={2:'Seizièmes de finale',3:'Huitièmes de finale',4:'Quarts de finale',5:'Demi-finale',6:'Finale',7:'Victoire'};
  t.stepName=steps[t.roundStep];
  if(t.roundStep>6) return true;
  const newMatches=[]; for(let i=0;i<survivors.length;i+=2){ newMatches.push({a:survivors[i],b:survivors[i+1]}); }
  t.matches=newMatches;
  const playerMatch=t.matches.find(m=>m.a.id===G.f.id||m.b.id===G.f.id);
  G.arcade.opponent=playerMatch.a.id===G.f.id?playerMatch.b:playerMatch.a;
  return false;
}
/* ==== [ANCRE: RACHAT_RETRAITE_DIABLE] — ajout #12 (24 ajouts, 12/08/2026) :
   remplace UNIQUEMENT l'adversaire du match courant du joueur (roundStep
   inchangé, arbre du tournoi intact pour tout le reste) — la profondeur
   déjà atteinte n'est jamais perdue, seul l'adversaire qui vient d'éliminer
   le joueur est effacé. Formule de niveau identique à celle de
   buildWTUMMABracket() (ci-dessus) pour rester cohérente avec la difficulté
   attendue à ce palier, avec le même modificateur d'Ascension. ==== */
function regenerateBracketOpponent(){
  const t=G.arcade.tournament; if(!t) return;
  const am=ascensionCurveMod(G.arcade&&G.arcade.asc);
  const lv=clamp(88-Math.floor((t.roundStep||1)*3)+RI(-3,3)+am.lv,25,93+am.cap);
  const o=makeFighter({gender:G.f.gender,div:G.f.div,style:pick(STYLE_KEYS),level:lv,potential:99,age:RI(20,35)});
  o.stage='pro'; o.org=6; o.seed=0; o.W=RI(15,35); o.L=RI(0,4);
  const m=t.matches.find(mm=>mm.a.id===G.f.id||mm.b.id===G.f.id);
  if(m){ if(m.a.id===G.f.id) m.b=o; else m.a=o; }
  G.arcade.opponent=o;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: REJOUABILITE_PACTE_RECOMPENSE] — pactBonus (posé quand le
   joueur a pris le pacte KO-only du combat précédent ET l'a rempli, cf.
   togglePact()/pactFail dans afterResult) relève le plancher de rareté du
   camp suivant d'un cran, sans dupliquer la logique déjà existante des
   paliers rStep>=4/rStep===6 — juste un cran de plus par-dessus. ==== */
/* ==== [ANCRE: REJOUABILITE_PACTE_ESCALADE] — pactBonus était un booléen
   (le pacte du combat précédent a été rempli, oui/non). Devient un NIVEAU
   entier (G.arcade.pactStreak, ui-08 : compte les pactes remplis D'AFFILÉE,
   remis à 0 au premier pacte manqué) : les comparaisons `if(pactBonus)`
   restent valides (un niveau 0 est falsy, ≥1 est truthy), donc aucune
   régression sur le comportement au niveau 1. Au-delà, un palier
   supplémentaire (niveau ≥3) garantit une Légendaire en 1ère position au
   lieu d'un simple tirage favorisé — la seule façon de matérialiser une
   VRAIE escalade sans toucher au tirage de base ni dupliquer tirerRarete(). ==== */
/* ==== [ANCRE: GAUNTLET_MUTATEURS_ALEATOIRES] — ajout #4 : A1 ("camp à 2
   options") et A2 ("retrait de la Table de soins") ne sont plus liés au
   palier d'Ascension lui-même, mais au mutateur tiré pour CETTE run
   (G.arcade.mutator.id) — 'mut_camp_reduit' remplace A1 seul ; A2 (retrait
   de la récupération active) n'a PAS d'équivalent dans le pool des 8
   mutateurs de la spec, donc retiré purement et simplement (aucun mutateur
   ne le remplace — la Table de soins reste désormais toujours disponible,
   quel que soit le palier). ==== */
function generateArcadeUpgrades(pactBonus){
  const mutId=G.arcade&&G.arcade.mutator&&G.arcade.mutator.id;
  const baseOpts=trainingOptions(G.f).slice(0,mutId==='mut_camp_reduit'?2:3);
  /* ==== [FIN ANCRE] ==== */
  // Bonus x4 : le format court (Bracket 64 / Ladder 100) rend les bonus
  // habituels de carrière (sur 100) quasi invisibles sur un parcours de
  // seulement 6-8 combats — l'affichage réel se fait ensuite sur /20 via d20().
  /* ==== [ANCRE: GAUNTLET_SANS_MORAL_FORME] — les options de camp viennent du
     pool TRAIN de carrière (data-content.js), où 'morale' et 'form' sont des
     contreparties courantes. On les retire à la source : sans le canal `dyn`
     d'eff(), un « -12 Moral » ne coûterait plus rien et polluerait l'écran d'un
     chiffre sans conséquence — c'était d'ailleurs le « -10 Moral » remonté,
     amplifié par le ×4 ci-dessous. Une option vidée de tous ses deltas est
     écartée du tirage plutôt que proposée à vide. ==== */
  const stripDyn=d=>d.filter(delta=>delta[0]!=='morale' && delta[0]!=='form');
  G.arcade.trainOpts=baseOpts.map(opt=>({...opt,d:stripDyn(opt.d).map(delta=>[delta[0],delta[1]*4])}))
                             .filter(opt=>opt.d.length>0);
  const _heal=recoveryTrainOption(); if(_heal) G.arcade.trainOpts.push(_heal);
  /* ==== [FIN ANCRE] ==== */
  G.arcade.skillOpts=[];
  const rStep=G.arcade.tournament?G.arcade.tournament.roundStep:1; // sécurité : absent en mode Ladder 100
  let validPool=poolEligible(G.f,false,false);
  if(rStep>=4 || pactBonus) validPool=validPool.filter(s=>s.rar!=='C');
  if(rStep===6) validPool=validPool.filter(s=>s.rar==='L'||s.rar==='M');
  for(let i=0;i<3;i++){
    if(validPool.length===0) break;
    let rarity=tirerRarete();
    if((rStep>=4 || pactBonus) && rarity==='C') rarity='R';
    if(rStep===6) rarity=rnd()<0.7?'L':'M';
    if(pactBonus && i===0 && rStep<6) rarity=rnd()<0.6?'L':'E';
    if(pactBonus>=3 && i===0) rarity='L';
    const sk=getFallbackSkill(validPool,rarity);
    if(sk){ G.arcade.skillOpts.push(sk); validPool=validPool.filter(s=>s.id!==sk.id); }
  }
  generateCursedOption();
  G.arcade.upgradesChosen={train:false,skill:false};
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: GAUNTLET_CAMP_MAUDIT] — 4e choix de camp, hors des 3 options
   normales : une compétence Légendaire/Mythique GARANTIE, payée par un malus
   d'attributs permanent sur la run. Les paliers de rareté existants
   (rStep>=4, rStep===6, pactBonus) ne sont pas touchés — c'est une option
   parallèle, jamais un remplacement. Réutilise le pool déjà filtré par
   generateArcadeUpgrades pour ne pas proposer deux fois la même compétence
   dans le même camp. Les deltas passent par applyDeltas() (engine.js), qui
   gère déjà les valeurs négatives comme pour les options de camp de carrière
   à contrepartie. Même exception assumée que GAUNTLET_BLESSURE_RUN : baisse
   d'attribut confinée à un combattant arcade jetable et non persisté. ==== */
function generateCursedOption(){
  G.arcade.cursedOpt=null;
  const base=poolEligible(G.f,false,false);
  const chosenIds=(G.arcade.skillOpts||[]).map(s=>s.id);
  let elite=base.filter(s=>(s.rar==='L'||s.rar==='M') && !chosenIds.includes(s.id));
  if(!elite.length) elite=base.filter(s=>s.rar==='E' && !chosenIds.includes(s.id));
  if(!elite.length) return;
  const sk=pick(elite);
  const curses=[
    /* ==== [ANCRE: GAUNTLET_SANS_MORAL_FORME] — le malus `['form',-12]` de
       Surentraînement n'aurait plus aucun effet mécanique : reporté sur le
       cardio et la récupération, deux attributs réellement lus par eff(). ==== */
    {label:'Surentraînement',d:[['cardio',-14],['recovery',-10]]},
    {label:'Sparring sanglant',d:[['chin',-12],['durability',-8]]},
    {label:'Obsession technique',d:[['footSpeed',-12],['explosiveness',-10]]},
    {label:'Coupe de poids sauvage',d:[['strength',-12],['recovery',-9]]}
  ];
  const c=pick(curses);
  G.arcade.cursedOpt={skill:sk,curseLabel:c.label,d:c.d};
}
/* ==== [FIN ANCRE] ==== */
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: REJOUABILITE_CAMP_BOSSRUN] — Boss Run n'avait AUCUN écran de
   camp entre les KO (contrairement à Bracket 64 / Ladder 100), alors que
   scr_arcade_upgrades()/pickArcadeSkill() (ui-04/ui-08) le permettent déjà
   pour peu qu'on leur fournisse skillOpts. Format allégé : 1 seule
   compétence (pas d'entraînement — le format est un sprint de 5 combats,
   pas d'écart d'attributs à combler), rareté indexée sur le streak déjà
   atteint. upgradesChosen.train est posé à true D'EMBLÉE pour que
   scr_arcade_upgrades saute directement à la section compétence. ==== */
function generateBossRunUpgrade(streak){
  G.arcade.trainOpts=[];
  G.arcade.skillOpts=[];
  let validPool=poolEligible(G.f,false,false);
  if(streak>=3) validPool=validPool.filter(s=>s.rar!=='C');
  let rarity=tirerRarete();
  if(streak>=3 && rarity==='C') rarity='R';
  if(streak>=4) rarity=rnd()<0.6?'L':'E';
  const sk=getFallbackSkill(validPool,rarity);
  if(sk) G.arcade.skillOpts.push(sk);
  /* ==== [ANCRE: GAUNTLET_CAMP_MAUDIT] — le Boss Run a un camp allégé (1 seule
     compétence, pas d'entraînement) : l'option maudite y est le SEUL arbitrage
     réel du camp, donc à plus forte raison présente. ==== */
  generateCursedOption();
  G.arcade.upgradesChosen={train:true,skill:false};
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: WTUMMA_LADDER100] — Lot 1, classement mondial à 100 PNJ avec
   saut de rang (Leapfrog). Mode séparé et parallèle au Bracket 64 et au Boss
   Run — ne modifie ni ne remplace aucun des deux. ==== */
function buildWTUMMALadder(division){
  const ladder=[];
  /* ==== [ANCRE: REJOUABILITE_NEMESIS_LADDER] — le rang #1 (le boss final de
     l'ascension) devient, une fois sur deux si un némésis existe pour cette
     division, le combattant qui vous a réellement éliminé lors d'une run
     précédent — au lieu d'un boss anonyme piochant juste un nom générique
     dans un pool de 5. Niveau calé sur ce que rang #1 vaut déjà normalement
     dans la courbe existante (100-0.66+RI), courbe NON modifiée ici (seuls
     Bracket 64 et Boss Run ont été assouplis, pas le Ladder). ==== */
  const rival=(rnd()<0.5)?pickGauntletRival(division):null;
  const _amL=ascensionCurveMod(G.arcade&&G.arcade.asc);
  for(let i=1;i<=100;i++){
    const lv=clamp(100-Math.floor(i*0.66)+RI(-2,3)+_amL.lv,30,99);
    if(i===1 && rival){
      const o=fighterFromRivalSnapshot(rival,lv,'LE CHAMPION EN TITRE — '+(rival.nick||''));
      o.ladderRank=1; o.W=RI(18,30); o.L=RI(0,2); o.ko=RI(10,o.W);
      ladder.push(o); continue;
    }
    /* ==== [FIN ANCRE] ==== */
    const o=makeFighter({gender:'H',div:division,style:pick(STYLE_KEYS),level:lv,potential:99,age:RI(20,35)});
    o.stage='pro'; o.org=6; o.ladderRank=i;
    o.W=RI(10,40); o.L=RI(0,5); o.ko=RI(0,o.W);
    if(i<=5) o.nick=pick(['Le Tyran','Le Cauchemar','L\u2019Intouchable','Le Destructeur','L\u2019Empereur']);
    ladder.push(o);
  }
  return ladder;
}
function genWTUMMAOpponent(){
  const currentRank=G.arcade.rank; let targetRank;
  if(currentRank<=15){ targetRank=1; }
  else { targetRank=Math.max(2,currentRank-RI(10,15)); }
  return G.arcade.ladder.find(o=>o.ladderRank===targetRank)||G.arcade.ladder[0];
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: GAUNTLET_BRUIT_DU_MILIEU] — sur les combats à fort enjeu
   (Boss Run entier, 2 derniers tours du Bracket 64), la fiche technique
   exacte de l'adversaire est remplacée par une rumeur de vestiaire : 1-2
   lignes générées à partir du VRAI profil (via eff(), engine.js — mêmes
   scores dérivés que tacticalRead), mais fiable seulement 70% du temps —
   les 30% restants pointent vers une catégorie différente, délibérément
   trompeuse. Le taux de fiabilité n'est JAMAIS affiché ni indiqué au
   joueur : la carte se lit comme une rumeur, pas comme un scouting
   incertain avec un pourcentage.
   Fiabilité et catégorie dérivées par hachage STABLE de l'identité de
   l'adversaire (même pattern que pickStable, engine.js) plutôt que par
   rnd() : un appel à rnd() ici consommerait le flux du générateur seedé à
   chaque rendu de scr_arcade_plan, décalant tous les tirages du combat qui
   suit selon le nombre de fois où l'écran a été affiché — exactement le
   type de bug déjà corrigé ailleurs dans cette codebase (cf. ANCRE
   CORRECTIF_SEED_BOSSRUN). Cette approche garantit aussi que la rumeur ne
   change jamais entre deux rendus du même écran, sans avoir à la mettre en
   cache sur l'adversaire. ==== */
function gauntletRumorActive(a){
  if(!a) return false;
  if(a.mode==='boss_run') return true;
  if(a.mode==='bracket64') return !!(a.tournament && a.tournament.roundStep>=5); // Demi-finale + Finale
  return false; // jamais en Ladder 100 (progression continue, pas de "gros combat" isolé)
}
function gauntletRumorTrueCategory(opp){
  const e=eff(opp);
  const scores={frappeur:e.striking,lutteur:e.takedown,soumission:e.submission};
  const sorted=Object.keys(scores).sort((x,y)=>scores[y]-scores[x]);
  if(scores[sorted[0]]-scores[sorted[1]]<8) return 'équilibré'; // même seuil que edgeOpp/edgeMe dans tacticalRead
  return sorted[0];
}
function gauntletRumorReliable(opp){
  let h=0; const s=String(opp.id)+'rumorReliable';
  for(let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))>>>0;
  return (h%10)<7; // 70% fiable, 30% trompeuse
}
function gauntletRumorCategory(opp){
  const trueCat=gauntletRumorTrueCategory(opp);
  if(gauntletRumorReliable(opp)) return trueCat;
  const others=['frappeur','lutteur','soumission','équilibré'].filter(c=>c!==trueCat);
  return pickStable(others,String(opp.id)+'rumorFalse');
}
const GAUNTLET_RUMOR_TEMPLATES={
  frappeur:['On dit qu\u2019il vit et meurt par les mains — dangereux à distance, bien moins sur le dos.',
    'La rumeur du milieu : un cogneur pur, rien d\u2019autre à redouter chez lui.',
    'Les habitués de la salle le donnent létal debout, perdu au sol.'],
  lutteur:['Un lutteur, dit-on — il chercherait l\u2019amenée dès la cloche.',
    'La rumeur : il ne saurait faire qu\u2019une chose, plaquer et tenir contre la cage.',
    'On raconte qu\u2019il évite systématiquement l\u2019échange debout.'],
  soumission:['On murmure qu\u2019il termine tout au sol, sans exception.',
    'La rumeur du milieu : ne jamais le suivre volontairement au tapis.',
    'Il aurait fini l\u2019essentiel de sa carrière par soumission, à en croire le vestiaire.'],
  'équilibré':['Aucune vraie faiblesse, à en croire les habitués de la salle.',
    'La rumeur : un profil complet, sans angle d\u2019attaque évident.',
    'On ne lui connaît pas de point faible exploitable — méfiance de partout.']
};
function gauntletRumorText(opp){
  const cat=gauntletRumorCategory(opp);
  const line=pickStable(GAUNTLET_RUMOR_TEMPLATES[cat],String(opp.id)+'rumorLine');
  return `Bruit de vestiaire (${opp.styleLabel||'style inconnu'}) : ${line}`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: PREPARATION_CIBLEE] — ajout #23 (24 ajouts, 12/08/2026) :
   "L'Analyse" — perce le Bruit du Milieu pour CE combat uniquement, contre
   -2 (/20) sur une statistique mentale. fightIQ choisie comme stat visée :
   c'est littéralement la lecture tactique (tacticalRead, engine.js) que
   cette option débloque, cohérent thématiquement avec "payer en clarté
   d'esprit pour de la clarté d'information". Malus appliqué immédiatement
   (coût visible tout de suite) puis restauré à la fin du combat concerné
   (finalizeArcadeCombatResult, même fichier) — jamais permanent, comme
   spécifié ("pour un combat"). Répétable à chaque combat de la run si le
   joueur veut payer le coût à nouveau (rien dans la spec ne limite à un
   usage unique par run, contrairement à l'Identité de Camp). ==== */
function pierceGauntletRumor(a){
  if(!gauntletRumorActive(a) || a.analysisPierced) return {success:false,msg:'Rien à percer ici.'};
  a.analysisPierced=true;
  a._pierceMalusSaved={before:G.f.attrs.fightIQ};
  G.f.attrs.fightIQ=clamp(G.f.attrs.fightIQ-10,1,100);
  return {success:true,msg:'Analyse débloquée pour ce combat — Intelligence tactique -2/20.'};
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: FAITH_DRAFT_HUB] — Lot 1 du mode MMA Faith (carrière longue
   façon Destiny Eleven). Mode entièrement séparé et parallèle à la carrière
   classique — ne modifie aucun écran existant. ==== */
