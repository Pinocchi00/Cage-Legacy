"use strict";
/* Maquette lot 1 — la Presse (R28, Q28a, Q28b, Q13, Q10c). L'écran « Presse » de la barre. Préfixe pr- (classes), pr / PR_ (fonctions, constantes).
   Chargé après ceintures.js. Première passe (18/11) : de nouveaux exemples visuels avant toute refonte (Q28a), en trois onglets.
     - À la une : l'article du moment sur le tunnel, ce que la presse dit de tes combattants (salué, critiqué, cité),
       les trois médias présentés (Q10c) et le pronostic des lecteurs pour le 16 février ;
     - Les défis : qui réclame qui, d'où vient la phrase, et si le combat est possible sur ta carte ; puis les envies du public,
       seulement pour une très grosse affiche (Q28b) ;
     - Le fil : tout ce qui s'est écrit depuis la Fight Night 62, du plus récent au plus ancien (Q13 : le fil vient ici).
   Retiré du jeu actuel (R28) : « X attend depuis 15 mois », les envies du public pour n'importe quel combat, « 158 nouvelles cette semaine ».
   Ajouté : la précision d'un vrai média (« coude au sol, à 0:50 du 1er round », « 50-45, 49-46, 48-47 »).
   Données : l'Effectif et les Classements (combattants, rangs), les Résultats (Fight Night 62), la Carte (S.af), les Classements (staff :
   Garcia-Roy, Ferhat), l'Organisation (soirées des autres), le Calendrier (Fight Night 64 le 3 avril). Tous les articles sont inventés : À RELIRE. */

/* ---- Réglages de l'écran : gardés au retour ---- */
const PR_CLE='maquette-presse-1';
const PR_VUES=['une','defis','fil'],PR_SUJETS=['tout','split','soiree','combattants','ailleurs'],PR_MEDS=['tous','ch','tn','lf'];
S.pr=Object.assign({vue:'une',sujet:'tout',media:'tous',art:null,anim:true},(()=>{try{const v=JSON.parse(localStorage.getItem(PR_CLE))||{},o={};
  if(PR_VUES.includes(v.vue))o.vue=v.vue;if(PR_SUJETS.includes(v.sujet))o.sujet=v.sujet;if(PR_MEDS.includes(v.media))o.media=v.media;return o;}catch(e){return {};}})());
function prGarder(){try{const {vue,sujet,media}=S.pr;localStorage.setItem(PR_CLE,JSON.stringify({vue,sujet,media}));}catch(e){}}
const prEtat=()=>JSON.stringify({vue:S.pr.vue,sujet:S.pr.sujet,media:S.pr.media,art:S.pr.art});

/* ---- Dates ---- */
const PR_M=['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
const prJ=(j,m=0,a=2027)=>new Date(a,m,j);
const prJo=d=>d.getDate()===1?'1er':String(d.getDate());
const prDc=d=>`${prJo(d)} ${PR_M[d.getMonth()]}`;
const prJour=d=>{const n=Math.round((new Date(S.date.getFullYear(),S.date.getMonth(),S.date.getDate())-d)/864e5);
  return n===0?'Aujourd’hui':n===1?'Hier':`${JOURS[d.getDay()]} ${prJo(d)} ${MOIS[d.getMonth()]}${d.getFullYear()!==S.date.getFullYear()?' '+d.getFullYear():''}`;};
const prLong=d=>`${JOURS[d.getDay()].toLowerCase()} ${prJo(d)} ${MOIS[d.getMonth()]} ${d.getFullYear()}`;

/* ---- Pièces ---- */
const prN=id=>{const c=parId(id);return c?lien(c):'';};
const prX=(nom,cat)=>lien(parNom(nom,cat));
const prNomC=id=>{const c=parId(id);return c?esc(c.nom):'';};
const prRang=c=>c.rang==='C'?'champion':typeof c.rang==='number'?`n° ${c.rang}`:'non classé';
const prCat=c=>courte(c.cat).toLowerCase()+(/ F$/.test(c.cat)?' F':'');
const prNomL=c=>`<span class="nom" data-fiche="${c.id}">${esc(c.nom)}</span>`;
const prRelire='<span class="relire">à relire</span>';
const prLienJ=(t,a)=>`<button class="pr-lj" ${a}>${t} ›</button>`;
/* Lien secondaire (lire l'article d'où vient la phrase) : neutre, pour laisser le jaune à l'action. */
const prLienS=(t,a)=>`<button class="pr-ls" ${a}>${t} ›</button>`;
/** Typographie française d'un texte déjà prêt : espace insécable avant : ; ? ! % » et après «. */
const PR_MOISRE=/(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|janv\.|févr\.|avr\.|juil\.|sept\.|oct\.|nov\.|déc\.) (\d{4})/g;
const prTy=h=>String(h).replace(/« /g,'« ').replace(/ ([:;?!%»])/g,' $1').replace(/(\d) (?=[^\s<])/g,'$1 ').replace(/(\d(?:er|re|e)) /g,'$1 ').replace(PR_MOISRE,'$1 $2').replace(/Fight Night /g,'Fight Night ');
const prT=t=>prTy(esc(t));

/* ---- Les trois médias (noms à renommer, Q10c : propositions dans comparaison.html). Inventés, À RELIRE. ---- */
const PR_MEDIAS={
  ch:{nom:'Cage Hebdo',quoi:'L’hebdo du MMA français, en kiosque le samedi',n:18400,u:'lecteurs par numéro'},
  tn:{nom:'Tableau Noir',quoi:'Le site d’analyse : combats revus image par image',n:46000,u:'abonnés à ses vidéos'},
  lf:{nom:'Le Forum',quoi:'Le forum des fans : les sujets ouverts par les membres',n:12300,u:'membres'},
};
const PR_SUJ={tout:'Tout',split:'Split',soiree:'Soirée',combattants:'Combattants',ailleurs:'Ailleurs'};

/* ---- Les articles, du plus récent au plus ancien ----
   s : sujets (filtres) ; p() : paragraphes ; f() : les faits, un chiffre par case [étiquette, valeur, précision] ;
   act : boutons [libellé, attributs, jaune] ; cite : ce qu'on retient pour un combattant de Split [id, ton, phrase] ; une : l'article à la une. */
function prFins62(){
  const s=typeof rsSoiree==='function'&&rsSoiree(62);if(!s)return [];
  return s.combats.filter(f=>f.meth!=='Décision');
}
const prFin=f=>{const w=rsW(f),l=rsL(f);
  return f.meth==='KO'?`${lien(w)} a arrêté ${lien(l)} au ${rsOrd(f.rd)} round, à ${f.tps}`:`${lien(w)} a soumis ${lien(l)} par ${esc(f.det)} au ${rsOrd(f.rd)} round, à ${f.tps}`;};
const PR_ART=[
  {id:'a12ch',d:prJ(12),m:'ch',s:['soiree','split'],t:'« Lille mérite mieux qu’une carte à moitié vide »',par:'Inès Garcia-Roy',
   ch:'La chronique de l’ancienne championne des poids pailles.',
   p:()=>[`À 35 jours de Split Fight Night 63, deux combats sur quatre sont signés en carte principale : ${prN('nana')} contre ${prN('mezouar')} pour la ceinture des légers, ${prN('rachidi')} contre ${prN('meziane')} chez les pailles. ${prN('belkacem')}, 4e des légers, attend toujours un adversaire.`,
     `« Le Forum de Lille a 4 000 places. Avec une carte complète, il se remplit. Sans, il faudra compter sur Nana seul. »`],
   f:()=>[['Carte principale','2 / 4','combats signés le 12 janv.'],['Places vendues','2 626','sur 4 000'],['Avant la soirée','35 jours','']],
   act:[['Ouvrir la carte','data-prgo="carte"',1]]},
  {id:'a12lf',d:prJ(12),m:'lf',s:['soiree','combattants'],t:'Pronostics du 16 février : 61 % pour Mezouar',par:'Sujet ouvert par Gones69',
   ch:'Le sondage du Forum, ouvert le 9 janvier.',
   p:()=>[`Sur 3 140 votes, 61 % donnent ${prN('mezouar')} vainqueur le 16 février, 39 % ${prN('nana')}. Pour le co-principal, 74 % votent ${prN('rachidi')} contre ${prN('meziane')}.`,
     `Le message le plus repris du sujet, signé Ring_Side : « Il l’a déjà fait taper une fois. Nana a 37 ans. »`],
   f:()=>[['Votes','3 140','depuis le 9 janv.'],['Mezouar','61 %','39 % pour Nana'],['Rachidi','74 %','26 % pour Meziane']],
   cite:['mezouar','salue','« Il l’a déjà fait taper une fois. Nana a 37 ans. »']},
  {id:'a11tn',d:prJ(11),m:'tn',s:['soiree','combattants'],une:1,t:'Nana–Mezouar 2 : ce qui a changé depuis le 4 août 2025',par:'Analyse vidéo',
   ch:'Leur premier combat, puis les trois combats de Nana depuis.',
   p:()=>[`Le 4 août 2025, à Split Fight Night 53, ${prN('mezouar')} a soumis ${prN('nana')} par étranglement arrière au 2e round, à 3:40.`,
     `Depuis, Nana a gagné ses trois combats pour la ceinture : ${prN('belkacem')} aux points le 20 mars, ${prN('carvalho')} par KO au 3e round, à 2:14, le 19 juillet, ${prN('darras')} aux points le 8 décembre.`,
     `Le 16 février, la question reste celle de 2025 : Nana peut-il garder le combat debout pendant cinq rounds ?`],
   f:()=>[['Combat de 2025','Soumission','2e round, à 3:40'],['Nana depuis','3 victoires','la ceinture, puis 2 défenses'],['Le 16 février','5 rounds','ceinture des légers']],
   act:[['Ouvrir la carte','data-prgo="carte"',1]]},
  {id:'a10ch',d:prJ(10),m:'ch',s:['combattants','soiree'],t:'Belkacem : « Je veux un top 3 à Lille »',par:'Julien Morel',
   ch:'Le 4e des légers n’a pas d’adversaire pour le 16 février.',
   p:()=>[`${prN('belkacem')} (11-4), 4e des légers chez Split, n’a pas encore d’adversaire pour Split Fight Night 63. Il a répondu à Cage Hebdo dimanche.`,
     `« Je veux un top 3. Bello est 3e et il n’a rien de prévu. Qu’on le mette en face. »`,`Contacté, l’entourage de ${prN('bello')} n’a pas répondu.`],
   f:()=>[['Belkacem','n° 4','11-4 · n° 33 mondial'],['Bello','n° 3','11-2 · n° 29 mondial'],['Combat 3','Libre','en carte principale']],
   act:[['Voir le défi','data-prdefi="d1"']],cite:['belkacem','cite','« Je veux un top 3 à Lille. »']},
  {id:'a09ch',d:prJ(9),m:'ch',s:['split','soiree'],t:'« Split a un nouveau matchmaker. Il a 38 jours pour remplir le Forum. »',par:'La une du numéro',
   ch:'La une du samedi 9 janvier.',
   p:()=>[`Cage Hebdo consacre sa une à ton arrivée chez Split, le 4 janvier, et à la soirée du 16 février au Forum de Lille.`],
   f:()=>[['Lecteurs du numéro','18 400','']],act:[['Le message','data-prgo="messages"']]},
  {id:'a08tn',d:prJ(8),m:'tn',s:['combattants'],t:'Rachidi, 5 victoires de suite',par:'Vidéo de 9 minutes',
   ch:'La 12e mondiale des pailles a fini trois de ses cinq derniers combats avant la limite.',
   p:()=>[`${prN('rachidi')} (8-1, 25 ans) a gagné ses cinq derniers combats, dont trois avant la limite. Elle est 12e au classement mondial des poids pailles.`,
     `Dans notre vidéo, elle regarde déjà après le 16 février : « Après Meziane, je veux Kovač. » ${prN('gpoidspaillefC')} est la championne des poids pailles.`],
   f:()=>[['Série','5 victoires','dont 3 avant la limite'],['Mondial','n° 12','poids pailles'],['Le 16 février','Meziane','en co-principal']],
   act:[['Voir le défi','data-prdefi="d3"']],cite:['rachidi','salue','5 victoires de suite, dont 3 avant la limite']},
  {id:'a07ch',d:prJ(7),m:'ch',s:['combattants'],t:'Van Belle courtisé par MMA Korner et Pure Impact',par:'Julien Morel',
   ch:'Il ne lui reste qu’un combat à son contrat.',
   p:()=>[`Selon nos informations, MMA Korner et Pure Impact ont contacté l’agent de ${prN('vanbelle')} (9-2), 8e des légers chez Split. Il ne lui reste qu’un combat à son contrat.`,
     `Son agent, Luc Verhaegen, n’a pas voulu commenter.`],
   f:()=>[['Contrat','1 combat','restant'],['Classement','n° 8','poids légers'],['Le 16 février','Carvalho','en préliminaires']],
   act:[['Le message de son agent','data-prgo="messages"']]},
  {id:'a06ch',d:prJ(6),m:'ch',s:['combattants','soiree'],t:'Darras : « Je suis de Lille, je veux le Forum »',par:'Julien Morel',
   ch:'Battu par Nana le 8 décembre, il demande à combattre chez lui.',
   p:()=>[`${prN('darras')} (9-4) a perdu aux points contre ${prN('nana')} le 8 décembre, après cinq rounds. Né à Lille, il veut être sur la carte du 16 février.`,
     `« Je ne demande pas la ceinture. Je veux Labbé, ou n’importe qui du top 3, devant mon public. » ${prN('labbe')} est 2e des légers.`],
   f:()=>[['Darras','n° 5','9-4'],['Labbé','n° 2','12-3'],['Combat 4','Libre','en carte principale']],
   act:[['Voir le défi','data-prdefi="d2"']]},
  {id:'a05ch',d:prJ(5),m:'ch',s:['combattants'],t:'Garcia-Roy classe Rachidi n° 1 des espoirs français',par:'Inès Garcia-Roy',
   ch:'Son classement des espoirs, publié chaque début d’année.',
   p:()=>[`Dans son classement des espoirs français, <span class="nom" data-fiche="sgarciaroy">Inès Garcia-Roy</span> place ${prN('rachidi')} en tête.`,
     `« Elle a ce que j’avais : la patience. Donnez-lui sa chance avant l’été. »`],
   f:()=>[['Rachidi','n° 1','des espoirs français'],['Âge','25 ans',''],['Bilan','8-1','']]},
  {id:'a04ch',d:prJ(4),m:'ch',s:['split'],t:'Split nomme un nouveau matchmaker',par:'La rédaction',
   ch:'Il prend en main la Fight Night 63, le 16 février à Lille.',
   p:()=>[`Split a annoncé lundi l’arrivée de son nouveau matchmaker. Sa première soirée sera Split Fight Night 63, le 16 février au Forum de Lille, avec ${prN('nana')} contre ${prN('mezouar')} en combat principal.`],
   f:()=>[['Arrivée','4 janv.','lundi'],['Première soirée','16 févr.','Forum de Lille']],act:[['Ta carrière','data-prgo="carriere"']]},
  {id:'a03lf',d:prJ(3),m:'lf',s:['combattants'],t:'« Le Notaire porte bien son nom »',par:'Sujet ouvert par Gones69',
   ch:'Un sujet sur les combats de Thomas Labbé.',
   p:()=>[`Le sujet compte les décisions de ${prN('labbe')} : cinq sur ses six derniers combats.`,
     `« Quinze minutes de contrôle contre la cage. Il gagne, mais personne ne paie pour ça. »`,`La réponse la plus reprise : « Il est 2e. Le classement ne se gagne pas au spectacle. »`],
   f:()=>[['Décisions','5','sur ses 6 derniers combats'],['Classement','n° 2','poids légers'],['Réponses','214','dans le sujet']],
   cite:['labbe','critique','« Il gagne, mais personne ne paie pour ça. »']},
  {id:'a03tn',d:prJ(3),m:'tn',s:['ailleurs'],t:'Pure Impact à Dubaï : un coude au sol, à 0:50 du 1er round',par:'Analyse vidéo',
   ch:'4 100 spectateurs pour la première soirée de l’année.',
   p:()=>[`Le combat principal de Pure Impact, dimanche à Dubaï, a duré 50 secondes. ${prX('Yusuf Demir','Poids mi-moyen')} a amené ${prX('Lucas Brandão','Poids mi-moyen')} au sol au premier échange, puis l’a arrêté d’un coude, à 0:50 du 1er round.`,
     `4 100 spectateurs, loin du record de 7 200 du 21 novembre. En décembre, Pure Impact a signé trois combattants classés venus de Fighting Pacific.`],
   f:()=>[['Durée','0:50','1er round'],['Spectateurs','4 100','record : 7 200'],['Classés signés','3','en décembre']],
   act:[['Les huit organisations','data-prgo="organisation"']]},
  {id:'a02lf',d:prJ(2),m:'lf',s:['split','combattants'],t:'Le combat que vous voulez en 2027 : Nana–Mercier, loin devant',par:'Sondage du Forum',
   ch:'Champion contre champion : le léger contre le mi-moyen.',
   p:()=>[`Sur 4 210 votes, 38 % choisissent ${prN('nana')} contre ${prN('gpoidsmimoyenC')}, les deux champions de Split. ${prN('rachidi')} contre ${prN('gpoidspaillefC')} est 2e, avec 11 %.`,
     `Nana combat en poids léger (70 kg), Mercier en mi-moyen (77 kg).`],
   f:()=>[['Votes','4 210',''],['Nana–Mercier','38 %','1er'],['Rachidi–Kovač','11 %','2e']],act:[['Voir les défis','data-prvue="defis"']]},
  {id:'a02tn',d:prJ(2),m:'tn',s:['combattants'],t:'Musaev veut Rizzo, l’invaincu des mouches',par:'Vidéo de 6 minutes',
   ch:'Le 7e des mouches vise le 4e.',
   p:()=>[`${prN('musaev')} (7-1, 22 ans), cinq victoires par soumission, a demandé ${prN('rizzo')} dans notre vidéo : « Il est invaincu, il est 4e. Je veux sa place. »`],
   f:()=>[['Musaev','n° 7','7-1 · poids mouche'],['Rizzo','n° 4','6-0 · invaincu']],act:[['Voir le défi','data-prdefi="d4"']]},
  {id:'a29ch',d:prJ(29,11,2026),m:'ch',s:['split'],t:'Bilan 2026 : « Split a retrouvé des têtes d’affiche »',par:'Inès Garcia-Roy',
   ch:'L’année de Split, soirée par soirée.',
   p:()=>[`Sept soirées en 2026, de la 56 à la 62, et un record : 6 340 spectateurs au Dôme de Marseille le 14 novembre.`,
     `${prN('nana')} a gagné ses trois combats pour la ceinture des légers. Le Palais des sports de Lyon a été plein une fois, le 20 mars.`,
     `<span class="nom" data-fiche="sgarciaroy">Inès Garcia-Roy</span> : « Split a retrouvé des têtes d’affiche. »`],
   f:()=>[['Soirées','7','en 2026'],['Record','6 340','spectateurs, Marseille'],['Salle pleine','1 fois','Lyon, 20 mars']],act:[['Les soirées','data-prgo="resultats"']]},
  {id:'a28ch',d:prJ(28,11,2026),m:'ch',s:['combattants'],t:'Les derniers rounds lui appartiennent',par:'Julien Morel',
   ch:'Parfait Nana, 37 ans, champion des légers.',
   p:()=>[`À 37 ans, ${prN('nana')} gagne encore quand les autres faiblissent. Ses trois dernières victoires se sont jouées après le deuxième round.`],
   f:()=>[['Âge','37 ans',''],['Bilan','14-8',''],['Série','3 victoires','']],cite:['nana','salue','Les derniers rounds lui appartiennent']},
  {id:'a20tn',d:prJ(20,11,2026),m:'tn',s:['ailleurs'],t:'Garden of Blood : 16 900 spectateurs à New York',par:'La rédaction',
   ch:'Plus grosse affluence des 8 organisations en décembre.',
   p:()=>[`Garden of Blood a réuni 16 900 spectateurs à New York le 20 décembre, la plus grosse affluence du mois. Son record reste 19 400, le 12 septembre.`,
     `Combat principal : ${prX('Andre Whitfield','Poids moyen')} garde sa ceinture des poids moyens contre ${prX('Mateo Ruiz','Poids moyen')}, par décision unanime (49-46, 49-46, 48-47).`],
   f:()=>[['Spectateurs','16 900','New York'],['Record','19 400','12 sept. 2026']],act:[['Les huit organisations','data-prgo="organisation"']]},
  {id:'a18ch',d:prJ(18,11,2026),m:'ch',s:['soiree'],t:'C’est officiel : Nana–Mezouar 2 le 16 février à Lille',par:'La rédaction',
   ch:'Le combat principal de la Fight Night 63.',
   p:()=>[`Split a confirmé le combat principal de sa Fight Night 63 : ${prN('nana')} défend sa ceinture des légers contre ${prN('mezouar')}, le 16 février au Forum de Lille, en cinq rounds.`],
   f:()=>[['Date','16 févr.','Forum de Lille'],['Rounds','5','ceinture des légers']],act:[['Voir le défi','data-prdefi="d5"']]},
  {id:'a09dch',d:prJ(9,11,2026),m:'ch',s:['combattants'],t:'Mezouar : « Il a gardé sa ceinture. Je l’ai déjà battu. »',par:'Julien Morel',
   ch:'Le 1er des légers réclame Nana, au lendemain de la Fight Night 62.',
   p:()=>[`Au lendemain de la Fight Night 62, ${prN('mezouar')}, 1er des légers, a réclamé le combat pour la ceinture : « Il a gardé sa ceinture. Je l’ai déjà battu. À moi. »`,
     `Mezouar a soumis ${prN('nana')} le 4 août 2025, par étranglement arrière au 2e round.`],
   f:()=>[['Mezouar','n° 1','13-3'],['Leur combat','4 août 2025','Mezouar par soumission']],act:[['Voir le défi','data-prdefi="d5"']]},
  {id:'a09dlf',d:prJ(9,11,2026),m:'lf',s:['split'],t:'« Nana ne recule jamais » : la phrase de Ferhat tourne partout',par:'Sujet ouvert par Ring_Side',
   ch:'L’extrait de la Fight Night 62 le plus partagé.',
   p:()=>[`Au 4e round contre ${prN('darras')}, <span class="nom" data-fiche="sferhat">Yacine Ferhat</span> commente : « Nana ne recule jamais. » L’extrait posté sur le Forum a été vu 210 000 fois en 24 heures.`],
   f:()=>[['Vues','210 000','en 24 heures'],['Round','4e','contre Darras']]},
  {id:'a08dch',d:prJ(8,11,2026),m:'ch',s:['split'],t:'Fight Night 62 : Nana garde sa ceinture face à Darras',par:'Julien Morel',
   ch:'Décision unanime après cinq rounds, au Palais des sports de Lyon.',
   p:()=>{const fins=prFins62();return [`${prN('nana')} a battu ${prN('darras')} par décision unanime : 50-45, 49-46, 48-47. Les deux ont reçu la prime du combat de la soirée.`,
     fins.length>1?`Plus bas sur la carte, ${prFin(fins[0])}, et ${prFin(fins[1])}.`:'',`5 210 spectateurs pour 5 800 places.`].filter(Boolean);},
   f:()=>[['Les juges','50-45','49-46 · 48-47'],['Spectateurs','5 210','sur 5 800 places'],['Finitions',String(prFins62().length),'sur 10 combats']],
   act:[['Voir le résultat','data-prresu="62"',1]]},
  {id:'a08dtn',d:prJ(8,11,2026),m:'tn',s:['combattants'],t:'Darras, 3 rounds sur 15',par:'Analyse vidéo',
   ch:'Ce que disent les cartes des juges.',
   p:()=>[`Sur les trois cartes, ${prN('darras')} n’a gagné que trois rounds sur quinze : aucun pour le premier juge, un pour le deuxième, deux pour le troisième.`,
     `Il a perdu le premier round sur les trois cartes.`],
   f:()=>[['Rounds gagnés','3','sur 15'],['Décision','unanime','50-45 · 49-46 · 48-47']],cite:['darras','critique','3 rounds sur 15 sur les cartes des juges']},
];
const prArt=id=>PR_ART.find(a=>a.id===id);

/* ---- Les défis : qui réclame qui (phrase réelle de l'article), puis ce que permet ta carte ---- */
const PR_DEFIS=[
  {id:'d1',de:'belkacem',vers:'bello',art:'a10ch',dit:'« Je veux un top 3. Bello est 3e et il n’a rien de prévu. »'},
  {id:'d2',de:'darras',vers:'labbe',art:'a06ch',dit:'« Je veux Labbé, ou n’importe qui du top 3, devant mon public. »'},
  {id:'d3',de:'rachidi',vers:'gpoidspaillefC',art:'a08tn',dit:'« Après Meziane, je veux Kovač. »'},
  {id:'d4',de:'musaev',vers:'rizzo',art:'a02tn',dit:'« Il est invaincu, il est 4e. Je veux sa place. »'},
  {id:'d5',de:'mezouar',vers:'nana',art:'a09dch',dit:'« Il a gardé sa ceinture. Je l’ai déjà battu. À moi. »'},
];
const prDefi=id=>PR_DEFIS.find(x=>x.id===id);
/** Où est un combattant sur la carte du 16 février : [clé, combat] ou null. */
function prSurCarte(id){
  for(const [l,g] of [[S.af.m,'m'],[S.af.p,'p']])for(let i=0;i<l.length;i++)if(l[i].a===id||l[i].b===id)return [g+i,l[i]];
  return null;
}
/** Ce que ta carte permet : signé, impossible (blessé), déjà pris, ou possible avec la place. */
function prEtatDefi(x){
  const A=parId(x.de),B=parId(x.vers),pa=prSurCarte(x.de),pb=prSurCarte(x.vers);
  if(pa&&pb&&pa[0]===pb[0])return {k:'signe',t:pa[0]==='m0'?'Signé':'Sur la carte',s:`${afRole(pa[0])}, le 16 févr.`};
  const bl=[A,B].find(c=>c.statut==='blesse');
  if(bl)return {k:'blesse',t:`${esc(bl.nom)} blessé`,s:`retour le ${esc(bl.retour)} ; au plus tôt à la Fight Night 64, le 3 avr.`};
  const pris=[[A,pa],[B,pb]].find(([c,p])=>p&&afComplet(p[1]));
  if(pris)return {k:'pris',t:'Déjà à l’affiche',s:`${esc(pris[0].nom)} contre ${esc(parId(pris[1][1].a===pris[0].id?pris[1][1].b:pris[1][1].a).nom)}, le 16 févr.`};
  const k=pa?pa[0]:pb?pb[0]:['m0','m1','m2','m3'].find(q=>{const f=S.af.m[+q[1]];return !f.a&&!f.b;});
  if(!k)return {k:'pris',t:'Carte complète',s:'au plus tôt à la Fight Night 64, le 3 avr.'};
  return {k:'possible',t:'Possible le 16 févr.',s:pa||pb?`${afRole(k)} : l’adversaire manque`:`${afRole(k)} libre`,place:k};
}
/* Signé (vert, coche), possible (blanc, place vide), blessé (rouge, croix médicale), déjà à l'affiche (gris, la carte). */
P.prplace='<path d="M8.4 2.8h7.2l5.6 5.6v7.2l-5.6 5.6H8.4l-5.6-5.6V8.4z"/><path d="M12 8v8M8 12h8"/>';
const PR_ETAT={signe:['ok','var(--vert)'],possible:['prplace','var(--blanc)'],blesse:['medical','var(--neg)'],pris:['calendrier','var(--texte2)']};

/* ---- Filtres ---- */
const prListe=()=>PR_ART.filter(a=>(S.pr.sujet==='tout'||a.s.includes(S.pr.sujet))&&(S.pr.media==='tous'||a.m===S.pr.media));
const prSel=()=>{const l=prListe();return l.find(a=>a.id===S.pr.art)||l[0]||null;};

/* ---- Haut de l'écran ---- */
function prOnglets(){
  const o=(v,t)=>`<button class="onglet oct ${S.pr.vue===v?'ouvert':''}" data-prvue="${v}">${t}</button>`;
  return `<div class="cl-haut">${o('une','À la une')}${o('defis','Les défis')}${o('fil','Le fil')}</div>`;
}
function prFiltres(){
  const b=(attr,v,t,on)=>`<button class="bb oct petit ${on?'on':''}" ${attr}="${v}"><span class="oct">${t}</span></button>`;
  return `<div class="eff-filtres pr-filtres">${PR_SUJETS.map(k=>b('data-prsujet',k,PR_SUJ[k],S.pr.sujet===k)).join('')}
    <span class="pr-fmed">${b('data-prmedia','tous','Tous les médias',S.pr.media==='tous')}${['ch','tn','lf'].map(k=>b('data-prmedia',k,PR_MEDIAS[k].nom,S.pr.media===k)).join('')}</span></div>`;
}

/* ---- À la une ---- */
function prUne(){
  const a=PR_ART.find(x=>x.une),M=PR_MEDIAS[a.m];
  const fait=([e,v,s],i)=>`<div class="pr-uf" style="animation-delay:${180+i*90}ms"><span class="etiq">${e}</span><span class="T pr-ufv">${v}</span><span class="sous">${s}</span></div>`;
  return `<button class="pr-une oct" data-prart="${a.id}"><div class="pr-une2 oct"><div class="pr-une3 oct">
      <i class="fb-img or pr-une-img"></i><i class="pr-reflet"></i>
      <div class="pr-une-c">
        <div class="pr-une-h"><span class="pr-med oct"><span class="oct">${M.nom}</span></span><span class="pr-une-d">${prLong(a.d)}</span>${prRelire}<span class="pr-lj pr-une-lire">Lire l’article ›</span></div>
        <div class="T pr-une-t">${prT(a.t)}</div>
        <div class="pr-ufs">${a.f().map(fait).join('')}</div>
      </div></div></div></button>`;
}
const PR_TONS={salue:['Salué','var(--vert)'],critique:['Critiqué','var(--neg)'],cite:['Cité','var(--texte2)']};
function prCombattants(){
  const l=prCites();
  const ligne=(a,i)=>{const [id,ton,txt]=a.cite,c=parId(id),[tt,col]=PR_TONS[ton];
    return `<div class="pr-cb oct apparait" data-prart="${a.id}" style="animation-delay:${120+i*60}ms">
      <span class="pr-cb-n">${lien(c)}<span class="sous">${prRang(c)} · ${prCat(c)}</span></span>
      <span class="pr-ton" style="color:${col}">${tt}</span>
      <span class="pr-cb-t">${prT(txt)}</span>
      <span class="pr-cb-s">${PR_MEDIAS[a.m].nom}<span class="sous">${prDc(a.d)}</span></span></div>`;};
  return pan(titre('Combattants de Split dans la presse',`<span class="pr-relire-m">${prRelire}</span><button data-prsuj="combattants">Tout voir ›</button>`)+
    `<div class="pr-cbs">${l.map(ligne).join('')}</div>`,'','pr-p-cb');
}
/** Les articles déjà visibles sur À la une (l'article du moment, le pronostic, les phrases sur tes combattants) : pas répétés à côté. */
function prVusUne(){const s=new Set(['a12lf']);PR_ART.forEach(a=>{if(a.une)s.add(a.id);});prCites().forEach(a=>s.add(a.id));return s;}
function prCites(){const vus=new Set(),l=[];for(const a of PR_ART){if(!a.cite||vus.has(a.cite[0]))continue;vus.add(a.cite[0]);l.push(a);}return l.slice(0,6);}
function prMedias(){
  const vus=prVusUne();
  const bloc=(k,i)=>{const M=PR_MEDIAS[k],a=PR_ART.find(x=>x.m===k&&!vus.has(x.id));
    return `<button class="pr-md oct apparait" data-prmed="${k}" style="animation-delay:${160+i*90}ms">
      <span class="pr-md-h"><span class="T pr-md-n">${M.nom}</span><span class="pr-md-a"><span class="T" data-prn="${M.n}">${nb(M.n)}</span><span class="sous">${M.u}</span></span></span>
      <span class="sous pr-md-q">${prT(M.quoi)}</span>
      <span class="pr-md-l"><span class="sous">${prDc(a.d)}</span><span class="pr-md-t" data-prart="${a.id}">${prT(a.t)}</span></span></button>`;};
  return pan(titre('Médias',prRelire)+`<div class="pr-mds">${['ch','tn','lf'].map(bloc).join('')}</div>`,'','pr-p-md');
}
/** Le pronostic des lecteurs : qui gagne, pas la qualité du combat (H1). */
function prProno(){
  const l=[['nana','mezouar',39],['rachidi','meziane',74]];
  const ligne=([a,b,p],i)=>{const A=parId(a),B=parId(b),fa=p>=50;
    return `<div class="pr-pr apparait" style="animation-delay:${200+i*90}ms">
      <div class="pr-pr-n"><span class="${fa?'':'pr-pr-moins'}">${lien(A)}</span><span class="${fa?'pr-pr-moins':''}">${lien(B)}</span></div>
      <div class="pr-pr-b"><span class="T ${fa?'':'pr-pr-moins'}"><b data-prn="${p}">${p}</b> %</span>
        <span class="pr-pr-j"><i class="${fa?'':'moins'}" style="width:${p}%"></i><i class="${fa?'moins':''}" style="width:${100-p}%"></i></span>
        <span class="T ${fa?'pr-pr-moins':''}"><b data-prn="${100-p}">${100-p}</b> %</span></div></div>`;};
  return pan(titre('Pronostics',`16 févr. · ${prLienJ('Lire','data-prart="a12lf"')}`)+`${l.map(ligne).join('')}
    <div class="pr-pr-src sous">Le Forum · <span data-prn="3140">3 140</span> votes depuis le 9 janv. · qui gagne, en % des votes</div>`,'','pr-p-pr');
}
function prUneHtml(){
  return `<div class="pr-g">
    <div class="pr-col">${prUne()}${prCombattants()}</div>
    <div class="pr-col">${prMedias()}${prProno()}</div></div>`;
}

/* ---- Les défis ---- */
function prDefisHtml(){
  const qui=c=>`<span class="pr-df-n">${lien(c)}</span>`;
  const ligne=(x,i)=>{const A=parId(x.de),B=parId(x.vers),a=prArt(x.art),e=prEtatDefi(x),[ic,col]=PR_ETAT[e.k];
    return `<div class="pr-df apparait ${S.pr.defi===x.id?'cur':''}" style="animation-delay:${100+i*70}ms" data-prdefil="${x.id}">
      <div class="pr-df-q">${qui(A)}<span class="pr-df-v"><span class="etiq">défie</span>${qui(B)}</span>
        <span class="sous">${esc(courte(A.cat))}${/ F$/.test(A.cat)?' F':''} · ${prRang(A)} contre ${prRang(B)}</span></div>
      <div class="pr-df-c"><span class="pr-df-dit">${prT(x.dit)}</span>
        <span class="sous">${PR_MEDIAS[a.m].nom} · ${prDc(a.d)}${prLienS('L’article','data-prart="'+a.id+'"')}</span></div>
      <div class="pr-df-e"><span class="pr-df-et" style="color:${col}">${ico(ic,22,2.4)}${prTy(e.t)}</span><span class="sous">${prTy(e.s)}</span>
        ${e.k==='possible'?prLienJ('Placer sur la carte',`data-prplace="${x.id}"`):''}</div></div>`;};
  return `<div class="pr-g">
    ${pan(titre('Défis',`<span>depuis la Fight Night 62</span>${prRelire}`)+`<div class="pr-dfs">${PR_DEFIS.map(ligne).join('')}</div>`,'','pr-p-df')}
    <div class="pr-col">${prEnvie()}${prCarte()}</div></div>`;
}
/** Les envies du public : seulement une très grosse affiche (Q28b). Ici, la seule : champion contre champion. */
function prEnvie(){
  const A=parId('nana'),B=parId('gpoidsmimoyenC');
  const cote=(c,kg,s)=>`<div class="pr-ev-c ${s}"><span class="pr-ev-cat">${esc(courte(c.cat))} · ${kg} kg</span>
      <span class="pr-ev-l"><span class="pr-c oct"><span class="oct"><b class="oct">C</b></span></span><span class="T pr-ev-nom"><span class="nom" data-fiche="${c.id}">${esc(c.nom)}</span></span></span>
      <span class="sous">${esc(c.prenom)} · ${bilan(c)} · n° ${c.mondial} mondial</span></div>`;
  const f=(e,v)=>`<div class="pr-ev-f"><span class="etiq">${e}</span><span>${v}</span></div>`;
  return pan(titre('Demande du public',`${prRelire}${prLienJ('Sujet','data-prart="a02lf"')}`)+`<div class="pr-ev oct"><i class="fb-img or pr-ev-img"></i>
      ${cote(A,70,'g')}<span class="T pr-ev-vs">VS</span>${cote(B,77,'d')}</div>
    ${f('Sondage du Forum, 2 janv.',`<b class="T pr-ev-pc"><span data-prn="38">38</span>&nbsp;%</b> des 4 210 votes`)}
    ${f('2e du sondage',`${prNomL(parId('rachidi'))} – ${prNomL(parId('gpoidspaillefC'))}, 11&nbsp;%`)}
    ${f('Possible','après le 16 févr., si Nana garde sa ceinture')}`,'','pr-p-ev');
}
function prCarte(){
  const ligne=(f,i)=>{const k='m'+i,a=f.a&&parId(f.a),b=f.b&&parId(f.b),libre='<span class="pr-libre">Libre</span>';
    return `<div class="pr-ca"><span class="sous">${afRole(k)}</span><span class="pr-ca-n">${a?prNomL(a):libre}<span class="pr-vs">contre</span>${b?prNomL(b):libre}</span>
      ${a&&b&&a.rang==='C'?'<span class="pr-titre">Titre</span>':''}</div>`;};
  const n=S.af.m.filter(afComplet).length;
  return pan(titre('Carte du 16 février',`${n} / 4`)+`${S.af.m.map(ligne).join('')}
    <button class="bouton jaune cj pr-ouvrir" data-prgo="carte">Ouvrir la carte</button>`,'','pr-p-ca');
}

/* ---- Le fil ---- */
function prFilHtml(){
  const l=prListe(),a=prSel();
  let jour='',items='';
  l.forEach((x,i)=>{const j=prJour(x.d);if(j!==jour){jour=j;items+=`<div class="pr-jour etiq">${j}</div>`;}
    items+=`<button class="pr-it oct ${a&&a.id===x.id?'cur':''}" data-prsel="${x.id}" style="animation-delay:${Math.min(i,10)*40}ms"><span class="pr-it-i oct">
      <span class="pr-it-m">${PR_MEDIAS[x.m].nom}</span><span class="pr-it-t">${prT(x.t)}</span></span></button>`;});
  if(!l.length){
    const qui={tous:'La presse',ch:'Cage Hebdo',tn:'Tableau Noir',lf:'Le Forum'}[S.pr.media],sur={tout:'',split:' sur Split',soiree:' sur la soirée du 16 février',combattants:' sur les combattants de Split',ailleurs:' sur les autres organisations'}[S.pr.sujet];
    const b=(t,att)=>`<button class="bb oct" ${att}><span class="oct">${t}</span></button>`;
    return `${prFiltres()}<div class="pr-g pr-gf pr-gv">${pan(`<div class="pr-vide2 apparait"><span class="T">Aucun article</span>
      <span>${qui} n’a rien écrit${sur} depuis le 8 décembre.</span>
      <span class="pr-vide-b">${S.pr.media!=='tous'?b('Tous les médias','data-prmedia="tous"'):''}${S.pr.sujet!=='tout'?b('Tous les sujets','data-prsujet="tout"'):''}</span></div>`,'','pr-p-it')}</div>`;
  }
  return `${prFiltres()}<div class="pr-g pr-gf">
    ${pan(titre('Depuis le 8 décembre',`${l.length} article${l.length>1?'s':''}`)+`<div class="pr-its">${items}</div>`,'','pr-p-it')}
    ${prArticle(a)}</div>`;
}
function prArticle(a){
  const M=PR_MEDIAS[a.m];
  const cas=([e,v,s],i)=>`<div class="pr-fa oct apparait" style="animation-delay:${140+i*80}ms"><div class="oct"><span class="etiq">${e}</span><span class="T pr-fa-v">${v}</span>${s?`<span class="sous">${s}</span>`:''}</div></div>`;
  const bt=([t,att,j])=>j?`<button class="bouton jaune cj pr-b" ${att}>${t}</button>`:`<button class="bb oct" ${att}><span class="oct">${t}</span></button>`;
  const par=PR_PLUMES[a.par]?`<span><span class="nom" data-fiche="${PR_PLUMES[a.par]}">${esc(a.par)}</span>, ${PR_PLUMES_R[a.par]}</span>`:`<span>${esc(a.par)}</span>`;
  const aut=prAutres(a);
  return pan(`<div class="pr-ar apparait" data-prcle="${a.id}">
    <div class="pr-ar-h"><span class="T pr-ar-m">${M.nom}</span><span class="sous pr-ar-q">${prT(M.quoi)}</span><span class="pr-ar-d">${prLong(a.d)}</span></div>
    <div class="T pr-ar-t">${prT(a.t)}</div>
    <div class="pr-ar-ch">${prT(a.ch)}</div>
    <div class="pr-ar-par sous">${par}${prRelire}</div>
    <div class="pr-ar-c">${a.p().map(x=>`<p>${prTy(x)}</p>`).join('')}</div>
    <div class="pr-fas">${a.f().map(cas).join('')}</div>
    ${aut.length?`<div class="pr-aut"><span class="etiq">Autres médias sur le sujet</span>${aut.map(x=>`<button class="pr-aut-l" data-prsel="${x.id}">
      <span class="pr-aut-m">${PR_MEDIAS[x.m].nom}</span><span class="pr-aut-t">${prT(x.t)}</span><span class="sous">${prDc(x.d)}</span></button>`).join('')}</div>`:''}
    ${a.act?`<div class="pr-ar-b">${a.act.map(bt).join('')}</div>`:''}</div>`,'','pr-p-ar');
}
const PR_PLUMES={'Inès Garcia-Roy':'sgarciaroy'},PR_PLUMES_R={'Inès Garcia-Roy':'consultante'};
/** Ce que les deux autres médias ont écrit sur le même sujet, au plus près de la date : l'article le plus proche de chacun. */
function prAutres(a){
  const ids=new Set((a.p().join(' ').match(/data-fiche="([^"]+)"/g)||[]).map(x=>x.slice(12,-1)));
  return ['ch','tn','lf'].filter(m=>m!==a.m).map(m=>PR_ART.filter(x=>x.m===m&&x.s[0]===a.s[0]&&
      ((x.p().join(' ').match(/data-fiche="([^"]+)"/g)||[]).some(y=>ids.has(y.slice(12,-1)))||!ids.size))
    .sort((x,y)=>Math.abs(x.d-a.d)-Math.abs(y.d-a.d))[0]).filter(Boolean);
}

/* ---- L'écran ---- */
function prHtml(){
  prGarder();
  const v=S.pr.vue,c=v==='defis'?prDefisHtml():v==='fil'?prFilHtml():prUneHtml();
  return `<div class="cl pr pr-v-${v}">${prOnglets()}${c}</div>`;
}
/** Chiffres qui défilent, jauges qui se remplissent. */
function prCompter(){
  const fin=matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.pr [data-prn]').forEach(e=>{const v=+e.dataset.prn;if(fin){e.textContent=nb(v);return;}
    const t0=performance.now(),d=900;const f=t=>{const k=Math.min(1,(t-t0)/d),q=1-Math.pow(1-k,3);e.textContent=nb(v*q);if(k<1)requestAnimationFrame(f);};e.textContent='0';requestAnimationFrame(f);});
}
const prRendreBase=rendre;
rendre=function(){
  if(S.ecran!=='presse'){prRendreBase();return;}
  rendreBarre();rendreEntete('Presse');$('#alerte').classList.remove('af-al');
  if(S.rs.apres&&typeof rsAlerte==='function')rsAlerte();else msAlerte();
  $('#corps').style.top='152px';
  const it=$('.pr-its'),haut=it?it.scrollTop:0,vue=($('.pr')||{dataset:{}}).className;
  $('#corps').innerHTML=prHtml();
  const it2=$('.pr-its');if(it2&&!S.pr.anim&&vue&&vue.includes("pr-v-fil"))it2.scrollTop=haut;
  if(S.pr.anim)prCompter();else{document.querySelectorAll('.pr [data-prn]').forEach(e=>e.textContent=nb(+e.dataset.prn));document.querySelector('.pr')?.classList.add('pr-fixe');}
  /* L'article ouvert reste visible dans la liste (au retour d'un autre écran aussi), sans bouger une liste déjà bien placée. */
  /* Un article long garde ses boutons : « Les autres médias » se réduit d'abord, ligne par ligne. */
  const ar=$('.pr-ar');while(ar&&ar.scrollHeight>ar.clientHeight+1){const l=ar.querySelectorAll('.pr-aut-l');if(!l.length)break;if(l.length===1)ar.querySelector('.pr-aut').remove();else l[l.length-1].remove();}
  if(S.pr.vue==='fil'){const c=$('.pr-it.cur');if(c&&it2){const r=c.offsetTop-it2.offsetTop;if(r<it2.scrollTop||r+c.offsetHeight>it2.scrollTop+it2.clientHeight-40)it2.scrollTop=Math.max(0,r-120);}}
  S.pr.anim=false;
  $('#zone').classList.toggle('fiche-ouverte',!!S.fiche);
};
const prAllerBase=aller;
aller=function(ec){
  if(ec!=='presse'){prAllerBase(ec);return;}
  if(S.fiche)fermerFiche(false);
  if(S.ecran!==ec){S.hist.push(S.ecran);S.futur=[];S.pr.anim=true;}
  S.ecran=ec;rendre();
};
/* Retour et Avant à l'intérieur de l'écran : l'onglet, les filtres et l'article ouvert sont des pas du parcours. */
function prPas(maj){S.hist.push({pr:prEtat()});S.futur=[];maj();S.pr.anim=true;rendre();}
const prAppliquer=v=>{Object.assign(S.pr,JSON.parse(v),{anim:true});};
const prRetourBase=retour;
retour=function(){
  while(S.ecran!=='presse'&&S.hist.length&&S.hist[S.hist.length-1]&&S.hist[S.hist.length-1].pr)S.hist.pop();
  const h=S.hist[S.hist.length-1];
  if(S.ecran==='presse'&&!S.fiche&&h&&h.pr){S.hist.pop();S.futur.push({pr:prEtat()});prAppliquer(h.pr);rendre();return;}
  prRetourBase();
};
function prAvancer(){
  const f=S.futur[S.futur.length-1];
  if(S.ecran==='presse'&&!S.fiche&&f&&f.pr){S.futur.pop();S.hist.push({pr:prEtat()});prAppliquer(f.pr);rendre();return true;}
  return false;
}
const prOuvrirBase=ouvrirFiche;
ouvrirFiche=function(id,garderFutur=false){
  if(S.ecran!=='presse'){prOuvrirBase(id,garderFutur);return;}
  if(!garderFutur)S.futur=[];
  if(S.fiche&&S.fiche!==id)S.ficheHist.push(S.fiche);
  S.fiche=id;S.panCat=false;rendre();rendreFiche();setTimeout(()=>$('#fiche').classList.add('ouverte'),30);
};
/* Continuer : le jour avance ; le fil suit (« Aujourd'hui », « Hier »). */
const prContinuerBase=continuer;
continuer=function(){prContinuerBase();if(S.ecran==='presse')setTimeout(()=>{if(S.ecran==='presse'&&!S.fiche)rendre();},1500);};

/** Ouvre un article dans le fil, avec les filtres qui le montrent. */
function prOuvrirArt(id){
  const a=prArt(id);if(!a)return;
  prPas(()=>{S.pr.vue='fil';S.pr.art=id;if(!a.s.includes(S.pr.sujet))S.pr.sujet='tout';if(S.pr.media!=='tous'&&S.pr.media!==a.m)S.pr.media='tous';});
}
function prPlacer(id){
  const x=prDefi(id),e=prEtatDefi(x);if(e.k!=='possible')return;
  const f=S.af.m[+e.place[1]];
  if(f.a===x.de||f.b===x.de){if(f.a===x.de)f.b=x.vers;else f.a=x.vers;}else if(f.a===x.vers||f.b===x.vers){if(f.a===x.vers)f.b=x.de;else f.a=x.de;}else{f.a=x.de;f.b=x.vers;}
  rendre();
  const l=$(`.pr-df[data-prdefil="${id}"]`);if(l)l.animate([{background:'rgba(61,190,106,.22)'},{background:'transparent'}],{duration:900});
  toast(`${esc(parId(x.de).nom)} contre ${esc(parId(x.vers).nom)} : placé en ${afRole(e.place).toLowerCase()}, le 16 février.`);
}

/* ---- Clics ---- */
document.addEventListener('click',e=>{
  const t=e.target;let el;
  /* Depuis les Messages : l'article de Cage Hebdo du 9 janvier. */
  if((el=t.closest('[data-prouvre]'))){e.stopImmediatePropagation();const id=el.dataset.prouvre;
    const neuf=()=>{S.pr.vue='fil';S.pr.sujet='tout';S.pr.media='tous';S.pr.art=id;};
    if(S.ecran!=='presse'){if(S.fiche)fermerFiche(false);S.hist.push(S.ecran);S.futur=[];S.ecran='presse';neuf();S.pr.anim=true;rendre();}
    else prPas(neuf);return;}
  if(S.ecran!=='presse')return;
  if(t.closest('#bAvant')&&!S.fiche&&prAvancer()){e.stopImmediatePropagation();return;}
  if(t.closest('#bRetour')&&!S.fiche){const h=S.hist[S.hist.length-1];if(h&&h.pr){e.stopImmediatePropagation();retour();return;}}
  if(t.closest('#bContinuer')){e.stopImmediatePropagation();continuer();return;}
  if(S.fiche||t.closest('[data-fiche]')||!t.closest('#corps'))return;
  const F=S.pr,stop=()=>e.stopImmediatePropagation();
  if((el=t.closest('[data-prvue]'))){stop();const v=el.dataset.prvue;if(v!==F.vue)prPas(()=>{F.vue=v;});return;}
  if((el=t.closest('[data-prsujet]'))){stop();const v=el.dataset.prsujet;if(v!==F.sujet)prPas(()=>{F.sujet=v;F.art=null;});return;}
  if((el=t.closest('[data-prmedia]'))){stop();const v=el.dataset.prmedia;if(v!==F.media)prPas(()=>{F.media=v;F.art=null;});return;}
  if((el=t.closest('[data-prplace]'))){stop();prPlacer(el.dataset.prplace);return;}
  if((el=t.closest('[data-prdefi]'))){stop();const v=el.dataset.prdefi;prPas(()=>{F.vue='defis';F.defi=v;});return;}
  if((el=t.closest('[data-prart]'))){stop();prOuvrirArt(el.dataset.prart);return;}
  if((el=t.closest('[data-prsuj]'))){stop();prPas(()=>{F.vue='fil';F.sujet=el.dataset.prsuj;F.media='tous';F.art=null;});return;}
  if((el=t.closest('[data-prmed]'))){stop();prPas(()=>{F.vue='fil';F.media=el.dataset.prmed;F.sujet='tout';F.art=null;});return;}
  if((el=t.closest('[data-prsel]'))){stop();const v=el.dataset.prsel;if(v!==(prSel()||{}).id)prPas(()=>{F.art=v;});return;}
  if((el=t.closest('[data-prdefil]'))){stop();prOuvrirArt(prDefi(el.dataset.prdefil).art);return;}
  if((el=t.closest('[data-prresu]'))){stop();S.rs.sel=+el.dataset.prresu;S.rs.vue='resultats';S.rs.det=null;aller('resultats');return;}
  if((el=t.closest('[data-prgo]'))){stop();const v=el.dataset.prgo;if(v==='carriere'){S.og.onglet='carriere';aller('organisation');return;}aller(v);return;}
},true);

/* ---- Lancement : ?ecran=presse, options prvue=une|defis|fil, prsujet=tout|split|soiree|combattants|ailleurs, prmedia=tous|ch|tn|lf,
   prart=<id d'article> (ouvre le fil), prdefi=<d1…d5>, fiche=<id> ---- */
window.addEventListener('DOMContentLoaded',()=>{
  const q=new URLSearchParams(location.search);
  if(q.get('ecran')!=='presse')return;
  const v=q.get('prvue');if(PR_VUES.includes(v))S.pr.vue=v;
  const s=q.get('prsujet');if(PR_SUJETS.includes(s))S.pr.sujet=s;
  const m=q.get('prmedia');if(PR_MEDS.includes(m))S.pr.media=m;
  const a=q.get('prart');if(a&&prArt(a)){S.pr.art=a;S.pr.vue='fil';}
  const d=q.get('prdefi');if(d&&prDefi(d)){S.pr.defi=d;S.pr.vue='defis';}
  S.ecran='presse';S.hist=['accueil'];S.pr.anim=true;rendre();
  if(q.get('fiche'))setTimeout(()=>ouvrirFiche(q.get('fiche')),80);
});
