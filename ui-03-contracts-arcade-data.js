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
  /* ==== [ANCRE: CORRECTIF_TAG_DEC] — bug remonté (A6) : le tag 'DEC' était
     poussé par generateNarrativeQuote (isDecisionLike(p.method)) sans qu'aucune
     entrée de NARRATIVES ne le combine à WIN/LOSS — un combat aux points ne
     pouvait donc jamais matcher le pool spécifique, seulement retomber sur le
     pool générique WIN/LOSS à tag unique. Ajouté ici (tags.length>1, avant le
     pool générique) pour que le filtre "citation la plus précise" de
     generateNarrativeQuote puisse réellement les choisir. ==== */
  { tags:['WIN','DEC'], src:'Commentateur', txt:f=>`"Score sans appel pour les trois juges. ${esc(f.name)} n'a rien laissé au hasard sur la durée du combat."` },
  { tags:['WIN','DEC'], src:'Le Coin (Coach)', txt:f=>`"Trois rounds, un plan tenu du début à la fin. Les juges n'ont eu aucun doute à trancher."` },
  { tags:['LOSS','DEC'], src:'Tweet Analyste', txt:f=>`"Décision logique ce soir. ${esc(f.name)} a perdu les échanges qui comptaient, pas le cœur au combat."` },
  { tags:['LOSS','DEC'], src:'Interview Octogone', txt:f=>`"Je pensais avoir fait le nécessaire. Les cartes ont dit l'inverse, il faudra l'accepter et corriger."` },
  /* ==== [FIN ANCRE] ==== */
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
