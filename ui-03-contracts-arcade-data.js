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
  if(f.org!==0 || (f.proOfferCooldown||0)>0) return null;
  if(f.age>=26){
    const baseTier=1;
    const orgFlavor1=ORG_FLAVORS[baseTier]?pick(ORG_FLAVORS[baseTier]):ORGS[baseTier];
    const phrase1=pick(CONTRACT_PHRASES)(orgFlavor1);
    return { forced:true, msg:'La limite d\u2019âge du circuit amateur (26 ans) est atteinte. Vous êtes forcé de passer professionnel aujourd\u2019hui ou de ranger les gants.', orgFlavor1, phrase1, baseTier };
  }
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
    else if(finishes>=4) msg=`Avec ton style spectaculaire (${finishes} finitions) et ta réputation de tueur, le public pro te réclame malgré tes ${f.L} défaites.`;
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
  { tags:['WIN','WAR'], src:'Tweet d\u2019un fan', txt:f=>`"Je viens de vieillir de 10 ans devant mon écran. ${esc(f.name)} a gagné le combat le plus dur de sa carrière ce soir."` },
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
function makeArcadeArchetype(spec){
  const f=makeFighter({gender:'H',div:spec.div,style:spec.style,countryKey:spec.country,first:spec.first,age:spec.age,potential:96,level:70});
  for(const k in spec.attrs) f.attrs[k]=spec.attrs[k];
  f.overall=overall(f); f.stage='pro'; f.org=4; f.morale=100; f.form=100;
  f.nick=spec.nick; f._perk=spec.perk; f.styleLabel=spec.styleLabel;
  if(spec.flag) f.flag=spec.flag; // drapeau de flavor, découplé du pays réel utilisé pour le patronyme
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
    perk:'Ne laisse jamais personne entrer dans sa distance. Démonte à coups de tibia depuis l\u2019extérieur.'}
];
function injectExtendedArchetypes(){
  ARCADE_EXTENDED_ARCHETYPES.forEach(a=>{ if(!ARCADE_ARCHETYPES.some(x=>x.nick===a.nick)) ARCADE_ARCHETYPES.push(a); });
  ARCADE_UNLOCKABLE_ARCHETYPES.forEach(a=>{
    if(checkLegendUnlock(a.unlockId) && !ARCADE_ARCHETYPES.some(x=>x.nick===a.nick)) ARCADE_ARCHETYPES.push(a);
  });
}
function startBossRun(){
  G.arcade={active:true,streak:0,target:5,pool:buildArcadePool(),mode:'boss_run',condition:'ko_only'};
  G.screen='draft'; save(); render();
}
function genBossOpponent(streak){
  const div=G.f.div;
  const lv=clamp(G.f.overall+5+streak*3,70,99);
  const o=makeFighter({gender:G.f.gender,div,style:pick(STYLE_KEYS),level:lv,potential:99,age:RI(26,33)});
  o.stage='pro'; o.org=6; o.champion='monde'; o.W=RI(18,30); o.L=RI(0,2); o.ko=RI(10,o.W); o.sub=RI(0,o.W-o.ko);
  o.nick=pick(['Le Tyran','Le Cauchemar','L\u2019Intouchable','Le Destructeur']);
  return o;
}
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
function buildArcadePool(){
  const shuffled=ARCADE_ARCHETYPES.slice().sort(()=>0.5-rnd());
  return shuffled.slice(0,3).map(makeArcadeArchetype);
}
/* ==== [ANCRE: CORRECTIF_CODE_MORT] — genArcadeOpponent() a été retirée :
   définie mais jamais appelée nulle part dans la codebase (vérifié par
   comptage d'usage). L'adversaire arcade "classique" (hors Boss Run/Ladder/
   Bracket) est en réalité généré ailleurs — cette fonction était un reliquat
   d'une version antérieure du mode. ==== */
function resolveArcadeFight(){
  const opp=G.arcade.opponent;
  const res=simulateFight(G.f,opp,3);
  const win=applyResult(G.f,opp,res,'A'); applyResult(opp,G.f,res,'B');
  { const last=G.f.history[G.f.history.length-1];
    if(last){ last.oppName=opp.name; last.oppFlag=opp.flag; last.oppRank='NR'; last.season=(G.arcade.mode==='boss_run')?(G.arcade.streak+1):(G.arcade.tournament?G.arcade.tournament.roundStep:1); } }
  G.fight={kind:'arcade',opp,rounds:3,plan:null};
  G.pending={res,win,method:res.method,finish:!isDecisionLike(res.method),opp:{name:opp.name,flag:opp.flag}};
  buildTimeline(); G.screen='arena'; save(); render();
}
/* ==== [ANCRE: WTUMMA_BRACKET64] — refonte du Gauntlet en tournoi à
   élimination directe à 64 combattants. N'affecte QUE le mode normal
   (G.arcade.mode!=='boss_run') — le Boss Run reste sur son propre système
   streak-based, séparé et intact. ==== */
function buildWTUMMABracket(player){
  const pSeed=clamp(64-Math.floor((player.overall-40)/2),1,64);
  const pool=[]; const meta=loadMetaStats();
  for(let i=1;i<=64;i++){
    if(i===pSeed){ player.seed=i; pool.push(player); }
    else if(i===1 && meta.wtNemesis && meta.wtNemesis.div===player.div){
      const boss=makeFighter({gender:player.gender,div:player.div,style:meta.wtNemesis.style,level:90});
      boss.attrs=JSON.parse(JSON.stringify(meta.wtNemesis.attrs));
      boss.skills=[...meta.wtNemesis.skills]; boss.overall=meta.wtNemesis.overall;
      boss.name=meta.wtNemesis.name; boss.flag=meta.wtNemesis.flag; boss.nick="LE CHAMPION EN TITRE";
      boss.stage='pro'; boss.org=6; boss.seed=1; pool.push(boss);
    } else {
      const lv=clamp(95-Math.floor(i/1.5)+RI(-3,3),30,99);
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
function generateArcadeUpgrades(){
  const baseOpts=trainingOptions(G.f).slice(0,3);
  // Bonus x4 : le format court (Bracket 64 / Ladder 100) rend les bonus
  // habituels de carrière (sur 100) quasi invisibles sur un parcours de
  // seulement 6-8 combats — l'affichage réel se fait ensuite sur /20 via d20().
  G.arcade.trainOpts=baseOpts.map(opt=>({...opt,d:opt.d.map(delta=>[delta[0],delta[1]*4])}));
  G.arcade.skillOpts=[];
  const rStep=G.arcade.tournament?G.arcade.tournament.roundStep:1; // sécurité : absent en mode Ladder 100
  let validPool=poolEligible(G.f,false,false);
  if(rStep>=4) validPool=validPool.filter(s=>s.rar!=='C');
  if(rStep===6) validPool=validPool.filter(s=>s.rar==='L'||s.rar==='M');
  for(let i=0;i<3;i++){
    if(validPool.length===0) break;
    let rarity=tirerRarete();
    if(rStep>=4 && rarity==='C') rarity='R';
    if(rStep===6) rarity=rnd()<0.7?'L':'M';
    const sk=getFallbackSkill(validPool,rarity);
    if(sk){ G.arcade.skillOpts.push(sk); validPool=validPool.filter(s=>s.id!==sk.id); }
  }
  G.arcade.upgradesChosen={train:false,skill:false};
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: WTUMMA_LADDER100] — Lot 1, classement mondial à 100 PNJ avec
   saut de rang (Leapfrog). Mode séparé et parallèle au Bracket 64 et au Boss
   Run — ne modifie ni ne remplace aucun des deux. ==== */
function buildWTUMMALadder(division){
  const ladder=[];
  for(let i=1;i<=100;i++){
    const lv=clamp(100-Math.floor(i*0.66)+RI(-2,3),30,99);
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

/* ==== [ANCRE: FAITH_DRAFT_HUB] — Lot 1 du mode MMA Faith (carrière longue
   façon Destiny Eleven). Mode entièrement séparé et parallèle à la carrière
   classique — ne modifie aucun écran existant. ==== */
