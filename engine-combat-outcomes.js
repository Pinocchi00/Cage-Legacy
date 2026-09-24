"use strict";

/* ==== [ANCRE: P1_FORME_MORAL_COUT_COMBAT] — Lot P1/2026, chantier
   d'équilibrage (harnais tools/monte-carlo.js) : diagnostic sur 200
   carrières avant ce correctif — forme >=95 dans 71.9% des combats
   (moral : 32.4%), gain moyen théorique de moral à la victoire RI(6,12)
   quasi entièrement absorbé par le clamp dès que le moral dépassait 90
   (delta réel observé +2.3 au lieu de +9.0 théorique). Le gain de moral à
   la victoire est réduit (RI(6,12) -> RI(2,7)) : une victoire reste
   toujours un gain net, jamais un coût, mais n'entretient plus à elle
   seule un plafond permanent — voir aussi P1_FORME_MORAL_COUT_FORME
   juste en dessous (le coût de forme, lui, touche aussi les victoires :
   "le corps encaisse" même en gagnant). ==== */
function applyResult(F,opp,res,side){ const isDraw=res.winner==='D'; const win=!isDraw&&res.winner===side; const m=res.method;
  if(isDraw){ F.D=(F.D||0)+1; F.morale=clamp(F.morale+RI(-2,2),0,100); }
  else if(win){ F.W++; F.streak=Math.max(1,F.streak+1); if(isKOMethod(m))F.ko++; else if(m.startsWith('Soum'))F.sub++; else F.dec++; F.morale=clamp(F.morale+RI(2,7),0,100); }
  else { F.L++; F.streak=Math.min(-1,F.streak-1); if(isKOMethod(m))F.koLoss++; F.morale=clamp(F.morale-RI(8,16),0,100); }
  /* ==== [ANCRE: V2-38] — "bilan maison" par organisation, en plus du
     palmarès pro global (F.W/F.L, qui ne se remet jamais à zéro après le
     seul passage amateur→pro, turnPro()) : un nouvel objectif de
     progression demandé par le document, jamais un remplacement du
     palmarès existant. Réservé au joueur en carrière pro (F===G.f, jamais
     les PNJ simulés par advanceRoster()/rankPool() ni les combats Faith/
     Gauntlet, hors périmètre de cet item). ==== */
  if(typeof G!=='undefined' && G && F===G.f && F.stage==='pro' && F.org>0){
    if(!F.orgRecords) F.orgRecords={};
    const rec=F.orgRecords[F.org]||(F.orgRecords[F.org]={W:0,L:0,D:0});
    if(isDraw) rec.D=(rec.D||0)+1; else if(win) rec.W++; else rec.L++;
  }
  /* ==== [ANCRE: P1_FORME_MORAL_COUT_FORME] — même lot que P1_FORME_MORAL_
     COUT_COMBAT ci-dessus. Avant ce correctif, la forme montait à la
     victoire (+RI(3,8)) exactement comme un attribut entraîné — aucun
     combat, gagné ou perdu, ne coûtait jamais rien au corps, seul le
     clamp(0,100) finissait par arrêter la hausse. "Le corps encaisse"
     (item demandé) : une victoire coûte désormais un peu de forme (encaisser
     des coups reste un combat, même gagné), une défaite en coûte
     nettement plus, un match nul un peu — jamais un gain net pour la
     forme à l'issue d'un combat, seul un entraînement/repos peut la
     faire remonter (cf. regressToBaseline(), engine-progression.js). ==== */
  F.form=clamp(F.form-(win?RI(1,4):isDraw?RI(1,3):RI(5,12)),0,100);
  // ==== [ANCRE: META04_06] — planchers de moral. Le jeu n'a pas de système de
  // popularité distinct : ces deux compétences sont adaptées sur `morale`,
  // le champ existant le plus proche (au lieu d'un f.pop qui n'existe pas). ====
  if(F.skills&&F.skills.includes('meta06')){ if(F.morale<75) F.morale=75; }
  else if(F.skills&&F.skills.includes('meta04')){ if(F.morale<45) F.morale=45; }
  // ==== [FIN ANCRE] ====
  // OPTIMISATION MÉMOIRE — seul le profil du joueur conserve l'historique narratif
  // détaillé (vérifié : aucun affichage ne lit jamais l'historique d'un PNJ, seuls
  // last5()/scr_history()/l'succès a4 lisent G.f.history spécifiquement).
  if(G.f && F.id===G.f.id){
    /* ==== [ANCRE: HUB_COMBAT_HISTORY_FIELDS] — Lot P3/2026 : le sous-menu
       Combat du hub (ui-06 scr_hub) affiche le surnom et le rang de
       l'adversaire au moment du combat, absents jusqu'ici. oppNick est pris
       directement sur l'objet opp (jamais recherché via oppId dans le
       roster ensuite : le roster est régénéré et l'objet d'origine
       disparaît). oppRank réutilise divRank(), la fonction de classement
       déjà en place — ui-05 (resolveFight, ANCRE HISTORIQUE_ENRICHI)
       écrase cette valeur juste après avec le rang capturé AVANT le combat
       (oppRankBefore), plus correct pour l'affichage joueur ; ce calcul ici
       ne sert donc de valeur par défaut que pour un futur appel de
       applyResult() sur G.f qui ne passerait pas par ce chemin d'écran.
       Mise à jour Lot P6/2026 (horloge continue) : la simulation dispose
       désormais d'un horodatage réel de finition (res.finishTimeStr, cf.
       ANCRE HORLOGE_CONTINUE_FINISH_TIME dans simulateFight) — `time` est
       donc bien ajouté ici (null pour une décision, faute de finition à
       horodater — jamais fabriqué ; comme pour toute entrée d'historique
       antérieure à ce lot, où le champ est simplement absent, hubCombatHtml
       en ui-06-career-screens.js sait déjà omettre les deux cas proprement). ==== */
    F.history.push({res:isDraw?'draw':(win?'win':'loss'),method:m,round:res.round||null,time:res.finishTimeStr||null,oppId:opp&&opp.id,
      oppName:opp&&opp.name,oppFlag:opp&&opp.flag,oppNick:opp&&opp.nick,oppWasChamp:!!(opp&&opp.champion),oppRecord:opp?`${opp.W}-${opp.L}`:null,oppElo:opp&&opp.orgElo,
      oppRank:opp?divRank(opp):null});
    if(F.history.length>60)F.history=F.history.slice(-60);
  }
  return win;
}
/* ------------------ FINISHERS SIGNATURE — noms de finish débloqués par compétence ---------------- */
const FINISH_MOVES={
 sub:[
  {id:'bjj29',name:'étranglement Anaconda',zone:'tête'},{id:'bjj30',name:'Peruvian Necktie',zone:'tête'},
  {id:'bjj35',name:'clé de cheville éclair',zone:'jambes'},{id:'bjj36',name:'Twister',zone:'jambes'},
  {id:'bjj39',name:'étranglement invisible',zone:'tête'},{id:'bjj40',name:'toile de soumissions sans fin',zone:'tête'},
  {id:'sambo29',name:'clé arrachée à la force brute',zone:'jambes'},{id:'sambo35',name:'clé de jambe fatale',zone:'jambes'},
  {id:'sambo38',name:'broyage articulaire',zone:'jambes'},{id:'sambo40',name:'double clé du Dernier Empereur',zone:'jambes'},
 ],
 ko:[
  {id:'karate28',name:'direct du samouraï',zone:'tête'},{id:'karate20',name:'coup de pied en crochet à l\u2019angle mort',zone:'tête'},
  {id:'boxer28',name:'crochet qui termine tout',zone:'tête'},{id:'boxer33',name:'uppercut surgi de nulle part',zone:'tête'},
  {id:'boxer36',name:'frappe qu\u2019on ne voit jamais partir',zone:'tête'},{id:'boxer40',name:'coup de l\u2019Interrupteur',zone:'tête'},
  {id:'kb28',name:'high kick mortel',zone:'tête'},{id:'kb40',name:'tibia du Cro Cop',zone:'tête'},
  {id:'mt30',name:'coude du chirurgien',zone:'tête'},{id:'mt35',name:'genou assassin',zone:'corps'},{id:'mt40',name:'tibia de l\u2019Héritier de Buakaw',zone:'jambes'},
  {id:'wrestler40',name:'takedown destructeur',zone:'corps'},{id:'sambo37',name:'enclume du Tsar',zone:'corps'},
  {id:'mma30',name:'Ground and Pound de l\u2019enfer',zone:'tête'},{id:'mma37',name:'instinct de destruction',zone:'tête'},
 ]
};
// ==== [ANCRE: FINITIONS_GENERIQUES_REFONTE] — remplace l'ancien pool de
// finitions génériques (qui mélangeait noms de coups et phrases descriptives,
// ex. "crochet au foie qui coupe les jambes") par des noms de coups PROPRES
// uniquement — chacun avec sa propre variante "signature" dédiée (voir
// MOVE_SIGNATURE_FLAVOR ci-dessous), au lieu d'un message générique unique.
const GENERIC_SUB=[
  {name:'Kimura',zone:'corps'},{name:'Americana',zone:'corps'},{name:'Armbar',zone:'corps'},
  {name:'Triangle',zone:'tête'},{name:'Rear Naked Choke',zone:'tête'},{name:'Guillotine',zone:'tête'},
  {name:'Anaconda',zone:'tête'},{name:'Twister',zone:'corps'},{name:'Heel Hook',zone:'jambes'},
  {name:'Clé de cheville',zone:'jambes'}
];
const GENERIC_KO=[
  {name:'Crochet',zone:'tête'},{name:'Uppercut',zone:'tête'},{name:'Overhand',zone:'tête'},
  {name:'Jab chanceux',zone:'tête'},{name:'Direct puissant',zone:'tête'},{name:'Marteau au sol',zone:'tête'},
  {name:'Coup de genou sauté',zone:'tête'},{name:'Coup de coude retourné',zone:'tête'},
  {name:'Coup de pied au corps',zone:'corps'},{name:'Coup de genou au corps',zone:'corps'},{name:'Crochet au foie',zone:'corps'},
  {name:'Low kick',zone:'jambes'},{name:'Calf kick',zone:'jambes'},
  {name:'High kick',zone:'tête'},{name:'Coup de pied retourné',zone:'tête'},{name:'Superman punch',zone:'tête'}
];
// Une variante narrative dédiée par coup, utilisée à la fois pour le
// déblocage du mouvement signature et pour ses répétitions ultérieures.
const MOVE_SIGNATURE_FLAVOR={
  'Crochet':'Le crochet est devenu sa signature — un mensonge qui arrive toujours de là où on l\u2019attend.',
  'Uppercut':'L\u2019uppercut est devenu sa signature — droit sous le menton, à chaque fois.',
  'Overhand':'L\u2019overhand est devenu sa signature — une bombe qui passe par-dessus la garde.',
  'Jab chanceux':'Le jab chanceux est devenu sa signature — un coup de rien qui finit tout.',
  'Direct puissant':'Le direct puissant est devenu sa signature — la ligne la plus courte vers le KO.',
  'Marteau au sol':'Le marteau au sol est devenu sa signature — implacable une fois l\u2019adversaire à terre.',
  'Coup de genou sauté':'Le genou sauté est devenu sa signature — personne ne voit le décollage venir.',
  'Coup de coude retourné':'Le coude retourné est devenu sa signature — un geste qu\u2019on ne voit qu\u2019une fois.',
  'Coup de pied au corps':'Le coup de pied au corps est devenu sa signature — il vide les poumons un round à l\u2019avance.',
  'Coup de genou au corps':'Le genou au corps est devenu sa signature — plié en deux, à chaque clinch.',
  'Crochet au foie':'Le crochet au foie est devenu sa signature — personne ne s\u2019en relève à temps.',
  'Low kick':'Le low kick est devenu sa signature — il ne casse pas l\u2019adversaire, il l\u2019use.',
  'Calf kick':'Le calf kick est devenu sa signature — la jambe d\u2019appui cède avant le mental.',
  'High kick':'Le high kick est devenu sa signature — une explosion qui vient de nulle part.',
  'Coup de pied retourné':'Le coup de pied retourné est devenu sa signature — le dos tourné, l\u2019instant d\u2019avant.',
  'Superman punch':'Le superman punch est devenu sa signature — il s\u2019envole avant de frapper.',
  'Kimura':'Le kimura est devenu sa signature — l\u2019épaule cède avant la fierté.',
  'Americana':'L\u2019americana est devenue sa signature — le bras plaqué au sol, sans échappatoire.',
  'Armbar':'L\u2019armbar est devenu sa signature — le coude tendu jusqu\u2019au point de rupture.',
  'Triangle':'Le triangle est devenu sa signature — les jambes se referment, l\u2019air disparaît.',
  'Rear Naked Choke':'Le rear naked choke est devenu sa signature — accroché dans le dos, inévitable.',
  'Guillotine':'La guillotine est devenue sa signature — la tête coincée dès le premier contact.',
  'Anaconda':'L\u2019anaconda est devenu sa signature — un étau qui se resserre sans prévenir.',
  'Twister':'Le twister est devenu sa signature — la colonne tordue jusqu\u2019à l\u2019abandon.',
  'Heel Hook':'Le heel hook est devenu sa signature — le genou cède avant que ça fasse mal.',
  'Clé de cheville':'La clé de cheville est devenue sa signature — la cheville plie, l\u2019adversaire tape.'
};
function pickFinishMove(winner,type,zone,fightStats,round){ // type: 'sub' ou 'ko' — priorité aux compétences signature possédées, puis à la zone la plus endommagée
  // Mouvement signature (#6) : si le combattant a déjà déverrouillé une prise
  // signature (5 finitions identiques auparavant), 40% de chance de la rejouer
  // directement plutôt que de repartir sur le tirage normal.
  /* ==== [ANCRE: CORRECTIF_ZONE_AFFICHEE] — bug remonté : « Soumission (clé de
     jambe fatale) — CORPS ». La zone AFFICHÉE venait de res.zone (zone la plus
     endommagée du perdant), jamais du geste réellement joué. Trois chemins la
     désynchronisaient : (1) le rejeu de signature ci-dessous ne renvoyait
     aucune zone, (2) le repli `candidates=owned` quand aucun geste possédé ne
     matche la zone, (3) le repli `pick(generic)` quand aucun générique ne
     matche. On renvoie désormais la zone PROPRE du geste choisi ; l'appelant
     s'en sert pour l'affichage. La zone de dégâts reste inchangée côté
     mécanique (SIGNATURE_BOOST_BY_ZONE lit toujours `zone`). ==== */
  const zoneOfGeneric=n=>{ const g=(type==='sub'?GENERIC_SUB:GENERIC_KO).find(m=>m.name===n); return g?g.zone:null; };
  const zoneOfOwned=n=>{ const o=FINISH_MOVES[type].find(m=>m.name===n); return o?o.zone:null; };
  if(winner.signatureMove && winner.signatureMove.type===type && rnd()<0.40){
    const _n=winner.signatureMove.name;
    return {name:_n, moveZone:zoneOfOwned(_n)||zoneOfGeneric(_n)||winner.signatureMove.zone||null, flavor:MOVE_SIGNATURE_FLAVOR[_n]||'Le geste devenu sa signature — le public le voit venir, mais personne ne peut l\u2019arrêter.'};
  }
  const owned=(winner.skills||[]).filter(id=>FINISH_MOVES[type].some(m=>m.id===id));
  let baseMove;
  // ==== [ANCRE: CORRECTIF_ZONE_MOUVEMENT_ACQUIS] — bug trouvé : un geste
  // possédé (compétence débloquée) était choisi sans jamais vérifier sa zone
  // propre contre la zone réellement la plus endommagée (finishZone) — un
  // Heel Hook (jambes) pouvait ainsi être narré sur un KO déclenché par des
  // dégâts à la tête. On restreint désormais la sélection aux gestes possédés
  // dont la zone correspond, quand au moins un correspond ; sinon on retombe
  // sur l'ensemble des gestes possédés (mieux vaut un geste possédé mal zoné
  // qu'un geste totalement générique).
  if(owned.length && rnd()<0.6){
    let candidates=owned;
    if(zone){ const zoneMatches=owned.filter(id=>FINISH_MOVES[type].find(m=>m.id===id).zone===zone); if(zoneMatches.length) candidates=zoneMatches; }
    const chosenId=pick(candidates); baseMove=FINISH_MOVES[type].find(m=>m.id===chosenId).name;
  }
  else{ const generic=type==='sub'?GENERIC_SUB:GENERIC_KO; const zoned=zone?generic.filter(m=>m.zone===zone):[]; baseMove=(zoned.length?pick(zoned):pick(generic)).name; }
  // Comptage des finitions identiques — au 5e succès avec le même geste, il
  // devient signature : compétence unique + boost de stat + 40% de retour
  // automatique désormais géré ci-dessus.
  if(!winner.finishMoveCounts) winner.finishMoveCounts={};
  const key=type+':'+baseMove;
  winner.finishMoveCounts[key]=(winner.finishMoveCounts[key]||0)+1;
  let flavor=null;
  if(!winner.signatureMove && winner.finishMoveCounts[key]>=5){
    /* ==== [ANCRE: PRISE_SIGNATURE_NOMMEE] — ajout #1 (24 ajouts, 12/08/2026) :
       customSuffix (null tant que le joueur n'a pas validé un complément
       libre) et locked (figé une fois validé, cf. CL.setSignatureSuffix
       ci-dessous dans ui-08). Le nom de base (baseMove) n'est JAMAIS
       remplacé — customSuffix s'affiche uniquement en complément. ==== */
    winner.signatureMove={name:baseMove,type,zone,customSuffix:null,locked:false};
    /* ==== [FIN ANCRE] ==== */
    // ==== [ANCRE: CORRECTIF_BOOST_SIGNATURE_DIFFERENCIE] — bug trouvé : TOUS
    // les mouvements signature donnaient exactement le même boost (submission+
    // killer pour toute soumission, power+killer pour tout KO), peu importe le
    // geste réel. Le boost dépend désormais de la ZONE ciblée par le geste
    // (tête/corps/jambes), cohérent avec ce que le geste représente : une
    // soumission à la tête (étranglement) récompense le cardio/contrôle, une
    // soumission au corps (clé de bras) récompense la force, une soumission
    // aux jambes récompense l'explosivité ; un KO à la tête récompense la
    // puissance pure, au corps l'endurance à encaisser en pression, aux jambes
    // l'explosivité des coups de pied. Table définie une seule fois au niveau
    // module (SIGNATURE_BOOST_BY_ZONE plus bas) — réutilisée telle quelle par
    // signatureMoveCard() côté affichage, pour ne jamais désynchroniser le
    // texte montré au joueur du boost réellement appliqué.
    const boostKeys=(SIGNATURE_BOOST_BY_ZONE[type]&&SIGNATURE_BOOST_BY_ZONE[type][zone])||(type==='sub'?['submission','killer']:['power','killer']);
    boostKeys.forEach(k=>{ winner.attrs[k]=clamp((winner.attrs[k]||50)+SIGNATURE_BOOST_PTS,1,100); });
    winner.overall=overall(winner);
    const skillId='sig_'+baseMove.replace(/[^a-z0-9]/gi,'').toLowerCase().slice(0,20);
    if(!(winner.skills||[]).includes(skillId)){
      grantSkill(winner,{id:skillId,name:baseMove+' (Signature)',rar:'M',fx:{},desc:`${winner.name} a répété ce geste jusqu\u2019à le rendre inévitable : ${baseMove}, désormais sa marque de fabrique.`,tags:['Signature']});
    }
    flavor=`MOUVEMENT SIGNATURE DÉBLOQUÉ : ${MOVE_SIGNATURE_FLAVOR[baseMove]||baseMove+' devient sa marque de fabrique.'}`;
  }
  // ==== [ANCRE: CORRECTIF_FLAVOR_SIGNATURE_MANQUANT] — bug trouvé : le texte
  // signature ne s'affichait QUE dans deux cas précis : le tout premier
  // déblocage (une fois dans toute la carrière), et le chemin de "rejeu
  // délibéré" (40% de chance, tiré au tout début de la fonction). Si le geste
  // signature était retrouvé par le tirage normal (les 60% restants — d'où le
  // "2/3 du temps" remonté), aucun texte n'était attaché, alors que c'était
  // pourtant bien le même geste. On rattache maintenant systématiquement le
  // flavor signature dès que baseMove correspond au geste signature déjà
  // déverrouillé, quel que soit le chemin qui l'a sélectionné.
  if(!flavor && winner.signatureMove && winner.signatureMove.type===type && winner.signatureMove.name===baseMove){
    flavor=MOVE_SIGNATURE_FLAVOR[baseMove]||'Le geste devenu sa signature — le public le voit venir, mais personne ne peut l\u2019arrêter.';
  }
  if(fightStats && !flavor){
    const isLate=(round||1)>=3;
    const isBloodbath=(fightStats.A.dmgHead+fightStats.B.dmgHead)>40;
    const isBoring=(fightStats.A.sig+fightStats.B.sig)<30 && !isBloodbath;
    if(isBloodbath && type==='ko') flavor='La commission médicale doit intervenir en urgence.';
    else if(isBoring && isLate) flavor='Sorti de nulle part — le public somnolent se réveille enfin.';
  }
  return {name:baseMove, moveZone:zoneOfOwned(baseMove)||zoneOfGeneric(baseMove)||null, flavor};
}
function winProbEstimate(A,B){ const a=eff(A),b=eff(B);
  const oa=A.overall+a.killer*0.05+reachEdge(A,B), ob=B.overall+b.killer*0.05;
  let p=sigmoid((oa-ob)/12); p=clamp(p*100+RI(-8,8),3,97)/100; return p; // bruit volontaire
}
