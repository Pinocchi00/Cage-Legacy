"use strict";
/* Maquette lot 1 — les Options (T1, T5). L'écran « Options » de la barre. Préfixe op- (classes), op / OP_ (fonctions, constantes).
   Le vrai écran du jeu mis à la charte (retour du 21/11 : « tout simple ») : des onglets, un panneau, une ligne par réglage avec son nom, sa phrase et son choix.
   Mêmes réglages, valeurs d'origine et phrases que le jeu (mgmt-options.js, mgmt-reglages.js). L'onglet Aide regroupe les explications retirées des écrans (T5) :
   chaque article vient d'une règle validée (REGLES-MAQUETTES.md) ou d'une constante du jeu. Les touches ne sont écrites que dans leur onglet (T1).
   Les réglages sont gardés mais ne pilotent pas encore les autres écrans de la maquette.
   Adresse : ?ecran=options&opong=combat|affichage|son|soiree|touches|partie|aide&oparticle=<id>&opetat=effacer|sanspartie. */

const OP_CLE='maquette-options-1';
const OP_ORIGINE={
  combat:{vitesse:1,camera:'cable',commentaire:true,coins:true,noms:true,secousses:true},
  affichage:{plein:false,taille:1920,fps:60,mouvement:true,salleAmbiance:true},
  son:{general:8,musique:6,salle:8,coups:7,silence:true},
  aide:{accompagnement:true},
  soiree:{vue:'defaut',sansDiscours:false}
};
const OP_ONGLETS=[['combat','Combat'],['affichage','Affichage'],['son','Son'],['soiree','Soirée'],['touches','Touches'],['partie','Partie'],['aide','Aide']];
const OP_TITRES={combat:'Le combat',affichage:'L’affichage',son:'Le son',soiree:'La soirée',touches:'Les touches',partie:'La partie',aide:'L’aide'};
const OP_OUI=[[true,'Oui'],[false,'Non']],OP_AFF=[[true,'Affiché'],[false,'Masqué']],OP_AFFS=[[true,'Affichées'],[false,'Masquées']];
const OP_LIGNES={
  combat:[
    {k:'vitesse',l:'Vitesse au départ',a:'La vitesse du combat quand il commence. Tu peux la changer pendant le combat.',c:[[1,'x1'],[2,'x2'],[4,'x4']]},
    {k:'camera',l:'Caméra au départ',a:'La caméra sur câble suit l’action. Les plans fixes ne bougent pas.',c:[['cable','Câble'],['plafond','Plafond'],['large','Large']]},
    {k:'commentaire',l:'Commentaire',a:'Les phrases du commentateur, en bas à gauche de l’image.',c:OP_AFF},
    {k:'coins',l:'Paroles des coins',a:'Ce que crient les deux coins pendant le combat.',c:OP_AFFS},
    {k:'noms',l:'Nom des coups',a:'L’étiquette qui nomme chaque coup, à côté du pion.',c:OP_AFF},
    {k:'secousses',l:'Secousses',a:'L’image tremble sur les gros coups. À couper si ça te gêne.',c:OP_OUI}],
  affichage:[
    {k:'plein',l:'Plein écran',a:'Le jeu occupe tout l’écran, ou tient dans une fenêtre.',c:OP_OUI},
    {k:'taille',l:'Taille de l’image',a:'Les écrans sont dessinés en 1920 × 1080 et s’adaptent aux autres tailles.',c:[[1280,'1280 × 720'],[1920,'1920 × 1080'],[2560,'2560 × 1440']]},
    {k:'fps',l:'Images par seconde',a:'Moins d’images soulage les petites machines.',c:[[30,'30'],[60,'60']]},
    {k:'mouvement',l:'Mouvement de l’interface',a:'Les écrans arrivent en douceur, les chiffres défilent. À couper si ça te gêne.',c:OP_OUI},
    {k:'salleAmbiance',l:'Ambiance de salle',a:'La salle réagit aux combats, entre deux combats. Masquée, elle continue de vivre ; les primes ne changent pas.',c:[[true,'Affichée'],[false,'Masquée']]}],
  son:[
    {k:'general',l:'Volume général',a:'Tout le son du jeu.',n:1},
    {k:'musique',l:'Musique',a:'La musique des menus et de la soirée.',n:1},
    {k:'salle',l:'La salle',a:'Le public pendant les combats. Plus la salle est pleine, plus il s’entend.',n:1},
    {k:'coups',l:'Les coups',a:'Les impacts dans la cage.',n:1},
    {k:'silence',l:'Son coupé hors du jeu',a:'Le jeu se tait quand tu passes sur une autre fenêtre.',c:OP_OUI}],
  soiree:[
    {k:'vue',l:'Vue des combats',a:'Par défaut, chaque combat garde sa vue. Sinon, une même vue pour toute la soirée.',c:[['defaut','Par défaut'],['complet','Complet'],['forts','Temps forts'],['resultat','Résultat']]},
    {k:'sansDiscours',l:'Discours après combat',a:'Les vainqueurs prennent la parole après les combats qui comptent.',c:[[false,'Affichés'],[true,'Masqués']]}],
  partie:[
    {k:'sauver',l:'Sauvegarder',a:'La partie s’enregistre aussi toute seule après chaque soirée.',b:'Sauvegarder maintenant'},
    {k:'arrivee',l:'Revoir mon arrivée',a:'L’écran de ton arrivée : l’organisation, ce que tu hérites, la première soirée.',b:'Ouvrir'},
    {k:'changer',l:'Changer de partie',a:'Ouvre les trois emplacements. La partie en cours est sauvegardée avant.',b:'Ouvrir les emplacements'},
    {k:'exporter',l:'Exporter la partie',a:'Un fichier de cette partie, à garder ou à envoyer. Il se relit avec « Importer ».',b:'Exporter'},
    {k:'importer',l:'Importer une partie',a:'Relit un fichier exporté dans cet emplacement. Un fichier abîmé ou d’une version inconnue est refusé, rien n’est écrasé.',b:'Choisir un fichier'},
    {k:'effacer',l:'Effacer cette partie',a:'L’emplacement redevient vide. Une confirmation est demandée.',b:'Effacer'},
    {k:'accompagnement',g:'aide',l:'Accompagnement de Leïla',a:'Leïla te guide pour les premiers combats, une phrase à la fois. Ce réglage vaut pour toutes les parties.',c:OP_OUI}]
};
/* La liste des touches du jeu (mgmt-options.js) : le seul endroit où elles s'affichent (T1). */
const OP_TOUCHES=[
  ['Partout',[['Échap','Revenir en arrière'],['A|E','Changer de section'],['↑|↓|←|→','Choisir'],['Tab','Changer d’onglet, de catégorie ou de soirée'],['Entrée','Faire l’action écrite en jaune']]],
  ['Dans les listes',[['G','Passer des hommes aux femmes'],['C','Changer la catégorie d’un combat'],['F','Ouvrir la fiche'],['M','Faire monter un préliminaire sur la carte principale']]],
  ['Pendant la soirée',[['Entrée','Regarder le combat'],['P','Passer le combat'],['F','Ouvrir l’avant-combat']]],
  ['Pendant le combat',[['Espace','Mettre en pause'],['V','Changer la vitesse'],['C','Changer de caméra'],['P','Passer le combat'],['R','Revoir le combat, après la décision']]]
];

/* ---- L'aide (T5) : une rubrique par famille. Tout vient des règles validées ou des constantes du jeu ; rédaction à relire. ---- */
const OP_FAMILLES=[['soiree','La soirée'],['combattants','Combattants'],['argent','L’argent'],['orga','Organisation'],['reperes','Les repères']];
const OP_ARTICLES=[
  {id:'carte',f:'soiree',t:'La carte',x:'Une soirée compte une carte principale et des préliminaires. Les préliminaires se composent seuls et restent modifiables à la main.',
   c:[['Carte principale','4','combats'],['Préliminaires','6','combats'],['Combats féminins','2','au moins, en préliminaires']]},
  {id:'rounds',f:'soiree',t:'Les rounds',x:'Un combat pour le titre, une défense de titre et un combat principal se jouent en 5 rounds. Les autres se jouent en 3 rounds.',
   c:[['Grand combat','5','rounds'],['Les autres','3','rounds'],['Un round','5','minutes']]},
  {id:'juges',f:'soiree',t:'Les juges',x:'Sans finition, trois juges décident. Chacun note chaque round sur 10 : le gagnant du round reçoit 10 points, le perdant 9 ou moins.',
   c:[['Juges','3','par combat'],['Un round','10','points au gagnant'],['Cinq rounds','50','points au plus']],
   l:[['Unanime','les trois juges donnent le même vainqueur'],['Partagée','deux juges pour lui, un pour l’autre'],['Majoritaire','deux juges pour lui, le troisième à égalité']]},
  {id:'fins',f:'soiree',t:'Les fins de combat',x:'Un combat finit avant la limite ou va à la décision des juges.',
   l:[['KO','il perd connaissance sur un coup'],['TKO','l’arbitre ou le médecin arrête le combat'],['Soumission','il abandonne sur une clé ou un étranglement'],['Décision','les juges tranchent à la fin du dernier round']]},
  {id:'termes',f:'soiree',t:'Les termes du combat',x:'Les chiffres d’un combat, dans les Résultats et à la fin de chaque combat.',
   l:[['Frappes significatives','les coups à distance, et les coups puissants au corps-à-corps et au sol'],['Temps de contrôle','le temps passé à dominer l’autre au sol ou contre la cage'],['Amenées au sol','réussies sur tentées'],['Tentatives de soumission','les clés et étranglements essayés'],['Knockdowns','les fois où un coup envoie l’autre au sol']]},
  {id:'regarder',f:'soiree',t:'Regarder un combat',x:'Chaque combat se regarde de trois façons. Le choix est gardé, combat par combat.',
   l:[['Complet','le combat en entier'],['Temps forts','2 à 6 moments, selon sa durée'],['Résultat','le verdict seulement']]},
  {id:'discours',f:'soiree',t:'Le discours',x:'Le vainqueur prend la parole dans trois cas, même après une décision partagée.',
   l:[['Combat principal','toujours'],['Co-principal','toujours'],['Une surprise','10 rangs d’écart, ou vainqueur donné à moins de 25 %']]},

  {id:'contrat',f:'combattants',t:'Les contrats',x:'Un contrat se signe pour un nombre de combats. La bourse se partage entre une part fixe et une prime de victoire.',
   c:[['Durée','1 à 8','combats'],['Part fixe','50 %','de la bourse'],['Prime de victoire','50 %','de la bourse']]},
  {id:'nego',f:'combattants',t:'La négociation',x:'L’agent répond à chaque offre. Son caractère fixe le nombre d’échanges et la taille de ses pas. Il prévient avant sa dernière offre.',
   c:[['Offres','2 à 4','selon l’agent'],['Après une rupture','2','mois sans discuter']]},
  {id:'demandes',f:'combattants',t:'Leurs demandes',x:'Un combattant peut demander 1 à 3 choses en plus de l’argent. Tu t’y engages ou non.',
   l:[['Il y tient','non négociable, sauf à payer très cher'],['Ça compte','l’agent peut y renoncer'],['Un souhait','l’agent y renonce plus facilement']]},
  {id:'recruteur',f:'combattants',t:'Le recruteur',x:'Marco part de Lyon, toutes catégories. Le prix : le billet selon la distance, 280 € par jour et un interprète s’il ne parle pas la langue.',
   c:[['3 jours','2','profils'],['7 jours','4','profils'],['14 jours','6','profils']]},
  {id:'blessures',f:'combattants',t:'Blessures et disponibilité',x:'Un combattant indisponible affiche toujours sa raison : blessé jusqu’à une date, déjà à l’affiche, ou il refuse et dit pourquoi.'},
  {id:'camps',f:'combattants',t:'Les camps',x:'Les salles sont rangées par taille. Leur classement est revu chaque mois.',
   c:[['Grande écurie','25','combattants ou plus'],['Salle','8 à 24','combattants'],['Club','moins de 8','combattants']]},

  {id:'recettes',f:'argent',t:'Recettes et dépenses',x:'Il n’y a pas de budget imposé : l’argent disponible dépend des soirées et des bourses.',
   l:[['Recettes','billetterie, diffuseur, partenaires, bar, boutique et VIP'],['Dépenses','bourses, primes de victoire, primes de performance, salle et production']]},
  {id:'decouvert',f:'argent',t:'Le découvert',x:'Il sert à payer un remplaçant de dernière minute. Il vaut la recette nette des deux dernières soirées, en moyenne, et n’est jamais négatif.'},
  {id:'primes',f:'argent',t:'Les primes',x:'Tu fixes chaque montant pour toute l’organisation, dans les Finances. Il vaut dès la prochaine soirée et ne change jamais une soirée jouée.',
   c:[['Primes','3','types'],['Au moins','1 000 €','par prime'],['Au plus','100 000 €','par prime']]},

  {id:'huit',f:'orga',t:'Les huit organisations',x:'Le rang additionne les places sur quatre mesures : spectateurs, record, top 5 mondial et top 30 mondial. Le public départage. Il est revu chaque mois.'},
  {id:'croissance',f:'orga',t:'La croissance',x:'Split grandit sur plusieurs pistes. Chaque marche a ses conditions et ce qu’elle apporte.',
   c:[['Pistes','6','à suivre'],['Marches','4','par piste']]},
  {id:'objectifs',f:'orga',t:'Les objectifs',x:'Ton patron fixe les objectifs de la saison et les juge à la fin. Manqués, ils valent un avertissement. Manqués encore la saison suivante, ils valent le renvoi.',
   c:[['Bilan de mi-saison','1er juil.','chaque année'],['Fin de saison','31 déc.','objectifs jugés']]},
  {id:'calendrier',f:'orga',t:'Le calendrier',x:'Une soirée se pose ou se retire au moins 10 semaines avant. La retirer coûte une part de la location : rien au-delà de 180 jours, 20 % de 91 à 180, 50 % de 70 à 90.',
   c:[['Délai','10','semaines au moins'],['Entre deux soirées','3','semaines au moins']]},
  {id:'ceintures',f:'orga',t:'Les ceintures',x:'Refuser de défendre fait perdre la ceinture. Un intérim reste rare : il arrive quand le champion ne peut pas combattre pendant des mois, puis l’intérimaire réunifie ou est promu.'},

  {id:'couleurs',f:'reperes',t:'Les couleurs',x:'Une couleur a toujours le même sens, et elle vient toujours avec un mot, une lettre ou une icône.',r:'couleurs'},
  {id:'marques',f:'reperes',t:'Les marques',x:'Les petits repères qui reviennent sur tous les écrans.',r:'marques'},
  {id:'medailles',f:'reperes',t:'Les médailles',x:'Une médaille par prime de performance, partout où une prime apparaît.',r:'medailles'}
];
const opArticle=id=>OP_ARTICLES.find(a=>a.id===id)||OP_ARTICLES[0];

/* ---- État ---- */
function opValeurs(){
  const v=JSON.parse(JSON.stringify(OP_ORIGINE));let d=null;
  try{d=JSON.parse(localStorage.getItem(OP_CLE));}catch(e){d=null;}
  if(d&&d.vals)Object.keys(OP_LIGNES).forEach(o=>OP_LIGNES[o].forEach(l=>{const g=l.g||o;
    if(l.b||!d.vals[g]||!(l.k in d.vals[g]))return;const x=d.vals[g][l.k];
    if(l.n?Number.isInteger(x)&&x>=0&&x<=10:l.c.some(c=>c[0]===x))v[g][l.k]=x;}));
  return {v,d:d||{}};
}
const opLu=opValeurs();
S.op={ong:OP_ONGLETS.some(x=>x[0]===opLu.d.ong)?opLu.d.ong:'combat',fam:OP_FAMILLES.some(x=>x[0]===opLu.d.fam)?opLu.d.fam:'soiree',art:OP_ARTICLES.some(a=>a.id===opLu.d.art)?opLu.d.art:'carte',
  conf:false,anim:true,vals:opLu.v,efface:false,sauve:null,sansPartie:false,demo:false};
function opGarder(){if(S.op.demo)return;try{const {ong,fam,art,vals}=S.op;localStorage.setItem(OP_CLE,JSON.stringify({ong,fam,art,vals}));}catch(e){}}
const opEtat=()=>JSON.stringify({ong:S.op.ong,fam:S.op.fam,art:S.op.art,conf:S.op.conf});
const opPartie=()=>!S.op.sansPartie&&!S.op.efface;
function opLignes(){const l=OP_LIGNES[S.op.ong]||[];return S.op.ong==='partie'&&!opPartie()?l.filter(x=>x.k==='accompagnement'):l;}

/* ---- Les réglages : une ligne, son nom, sa phrase, son choix (comme le jeu) ---- */
function opCtl(l){
  if(l.b)return l.k==='sauver'?`<button class="bouton jaune cj oct op-act" data-opa="${l.k}">${esc(l.b)}</button>`:`<button class="bb oct op-act" data-opa="${l.k}"><span class="oct">${esc(l.b)}</span></button>`;
  const g=l.g||S.op.ong,v=S.op.vals[g][l.k];
  if(l.n)return `<div class="op-niv"><div class="op-blocs" role="group" aria-label="${esc(l.l)}, ${v} sur 10">${Array.from({length:10},(_,i)=>`<button class="op-bloc octr ${i<v?'on':''}" data-opn="${g}|${l.k}|${i+1}" aria-label="${esc(l.l)} ${i+1} sur 10"></button>`).join('')}</div><b class="T op-nv">${v}</b></div>`;
  return `<div class="op-seg" role="group" aria-label="${esc(l.l)}">${l.c.map(([x,t],i)=>`<button class="op-ch oct ${x===v?'on':''}" aria-pressed="${x===v}" data-opv="${g}|${l.k}|${i}"><span class="oct">${esc(t)}</span></button>`).join('')}</div>`;
}
const opListe=()=>opLignes().map((x,i)=>`<div class="op-l oct ${S.op.anim?'apparait':''}" style="animation-delay:${i*30}ms"><div class="op-t"><b>${esc(x.l)}</b><span>${esc(x.a)}</span></div>${opCtl(x)}</div>`).join('');
function opPied(){
  if(S.op.ong!=='partie')return `<button class="bb oct op-raz" data-opraz><span class="oct">Réglages d’origine</span></button>`;
  if(!opPartie())return `<span class="op-pt">Aucune partie ouverte.</span>`;
  return `<span class="op-pt"><b>Emplacement 1</b> · Split · Fight Night ${S.rs.apres?64:63}${S.op.sauve?` · sauvegardée à ${S.op.sauve}`:''}</span>`;
}

/* ---- Les touches ---- */
function opTouches(){
  const k=t=>t.split('|').map(x=>`<span class="op-k oct"><span class="oct">${esc(x)}</span></span>`).join('');
  const bloc=([t,l])=>`<div class="op-tb"><div class="etiq">${esc(t)}</div>${l.map(([a,b])=>`<div class="op-tl"><span class="op-tk">${k(a)}</span><span>${esc(b)}</span></div>`).join('')}</div>`;
  return pan(titre('Les touches')+`<div class="op-tg"><div>${bloc(OP_TOUCHES[0])}${bloc(OP_TOUCHES[1])}</div><div>${bloc(OP_TOUCHES[2])}${bloc(OP_TOUCHES[3])}</div></div>`,'flex:1;min-height:0','op-pan');
}

/* ---- L'aide ---- */
function opRepere(r){
  if(r==='couleurs')return `<div class="op-rl"><span class="tag-j oct cj fin op-rp">À toi d’agir</span><span>Le jaune : ce qui attend une action, et l’or du champion</span></div>
    <div class="op-rl"><span class="op-rp"><span class="marque octr v">V</span><b style="color:var(--vert)">▲</b></span><span>Le vert : victoire, montée, objectif tenu</span></div>
    <div class="op-rl"><span class="op-rp"><span class="marque octr d">D</span><b style="color:var(--neg)">▼</b></span><span>Le rouge : défaite, blessure, descente, perte d’argent</span></div>
    <div class="op-rl"><span class="op-rp op-gr">12-4</span><span>Le blanc et le gris : les faits neutres, bilans, âges, dates</span></div>`;
  if(r==='marques')return `<div class="op-rl"><span class="op-rp"><i class="op-oj octr"></i></span><span>Un octogone jaune : quelque chose à faire ou à lire</span></div>
    <div class="op-rl"><span class="op-rp"><span class="marque octr v">V</span><span class="marque octr v">V</span><span class="marque octr d">D</span></span><span>Les derniers combats, le plus récent à gauche</span></div>
    <div class="op-rl"><span class="op-rp"><span class="marque octr fi-c8">C</span></span><span>Le champion de sa catégorie</span></div>
    <div class="op-rl"><span class="op-rp"><span class="op-med">${ico('medical',24)}</span></span><span>Blessé ou suspendu : la date de retour est à côté</span></div>`;
  return PERF_TYPES.map(([k,t])=>`<div class="op-rl"><span class="op-rp">${medaille(k,38)}</span><span><b>${esc(t)}</b>${k==='fin'?' : une victoire avant la limite':k==='perf'?' : la meilleure prestation':' : le meilleur combat'}</span></div>`).join('');
}
function opAideArticle(){
  const a=opArticle(S.op.art),l=[...(a.c||[]).map(([e,v,s])=>[e,`${v} ${s}`]),...(a.l||[])];
  return `<div class="op-doc" data-cle="${a.id}">${titre(esc(a.t),'<span class="relire">à relire</span>')}<p class="op-x">${esc(a.x)}</p>
    ${l.length?`<div class="op-dl">${l.map(([t,d])=>`<div><b>${esc(t)}</b><span>${esc(d)}</span></div>`).join('')}</div>`:''}${a.r?`<div class="op-rs">${opRepere(a.r)}</div>`:''}</div>`;
}
function opAide(){
  const F=S.op,liste=OP_ARTICLES.filter(a=>a.f===F.fam);
  return `<div class="op-ga">${pan(titre(esc(OP_FAMILLES.find(x=>x[0]===F.fam)[1]))+`<div class="op-ars">${liste.map(a=>`<button class="op-ar oct ${a.id===F.art?'sel':''}" data-opart="${a.id}"><span class="oct">${esc(a.t)}</span></button>`).join('')}</div>`,'height:100%')}
    ${pan(opAideArticle(),'height:100%')}</div>`;
}

/* ---- L'écran ---- */
function opConfirme(){
  return `<div class="op-voile" data-opvoile><div class="op-dlg apparait" role="dialog" aria-modal="true" aria-labelledby="opTitre">${pan(`<div class="pt"><h2 id="opTitre">Effacer cette partie ?</h2></div>
    <div class="op-cf"><div><span class="etiq">Emplacement</span><b class="T">1</b></div><div><span class="etiq">Organisation</span><b class="T">Split</b></div><div><span class="etiq">Date</span><b class="T">${S.date.getDate()} ${MOIS[S.date.getMonth()]} ${S.date.getFullYear()}</b></div><div><span class="etiq">En caisse</span><b class="T">${nb(fiCaisse().c)} €</b></div></div>
    <p class="op-cn">L’emplacement redevient vide. Cette partie ne pourra plus être reprise.</p>
    <div class="op-cb2"><button class="bouton oct" data-oprevenir>Revenir</button><button class="bouton jaune cj oct" data-opok>Effacer la partie</button></div>`)}</div></div>`;
}
const opHaut=()=>`<div class="cl-haut">${OP_ONGLETS.map(([k,t])=>`<button class="onglet oct ${S.op.ong===k?'ouvert':''}" data-opong="${k}" aria-pressed="${S.op.ong===k}">${t}</button>`).join('')}
  ${S.op.ong==='aide'?`<div class="op-fams">${OP_FAMILLES.map(([k,t])=>`<button class="bb oct ${S.op.fam===k?'on':''}" data-opfam="${k}" aria-pressed="${S.op.fam===k}"><span class="oct">${esc(t)}</span></button>`).join('')}</div>`:''}</div>`;
function opHtml(){
  const o=S.op.ong,c=o==='touches'?opTouches():o==='aide'?opAide()
    :pan(titre(OP_TITRES[o])+`<div class="op-ls" id="opLs">${opListe()}</div><div class="op-pied" id="opPied">${opPied()}</div>`,'flex:1;min-height:0','op-pan');
  return `<div class="rc op">${opHaut()}${c}${S.op.conf?opConfirme():''}</div>`;
}
/** Un réglage change : la liste suit, sans redessiner l'écran. */
function opMaj(){const l=$('#opLs'),p=$('#opPied');if(l)l.innerHTML=opListe();if(p)p.innerHTML=opPied();}

/* ---- Branchement dans le cadre (ce fichier est chargé en dernier) ---- */
const opRendreBase=rendre;
rendre=function(){
  if(S.ecran!=='options'){opRendreBase();return;}
  document.body.classList.remove('sd-mode','pp-mode');
  rendreBarre();rendreEntete('Options');
  const al=$('#alerte');al.className='alerte-l';
  if(S.op.sansPartie){al.innerHTML='';$('#barre').querySelectorAll('.item').forEach(e=>{if(!['options','menu'].includes(e.dataset.go))e.remove();});
    document.querySelectorAll('#entete .boite,#bContinuer').forEach(e=>e.remove());$('#corps').style.top='108px';}
  else{msAlerte();$('#corps').style.top='152px';}
  $('#corps').innerHTML=opHtml();S.op.anim=false;opGarder();
  $('#zone').classList.toggle('fiche-ouverte',!!S.fiche);
};
const opAllerBase=aller;
aller=function(ec){
  if(ec!=='options'){opAllerBase(ec);return;}
  if(S.ecran==='soiree'){cancelAnimationFrame(SD_ANIM.raf);document.body.classList.remove('sd-mode');if(S.rs.apres)S.date=new Date(2027,1,17);} /* comme la sortie de la soirée (soiree.js) */
  S.rs.det=null;S.rc.nego=null; /* comme la sortie des Résultats et du Recrutement */
  if(S.fiche)fermerFiche(false);
  if(S.ecran!==ec){S.hist.push(S.ecran);S.futur=[];S.op.anim=true;}
  S.ecran=ec;rendre();
};
function opPas(maj){S.hist.push({op:opEtat()});S.futur=[];maj();rendre();}
const opRestaurer=j=>Object.assign(S.op,JSON.parse(j),{anim:true});
const opRetourBase=retour;
retour=function(){
  while(S.ecran!=='options'&&S.hist.length&&S.hist[S.hist.length-1]&&S.hist[S.hist.length-1].op)S.hist.pop();
  const h=S.hist[S.hist.length-1];
  if(S.ecran==='options'&&!S.fiche&&h&&h.op){S.hist.pop();S.futur.push({op:opEtat()});opRestaurer(h.op);rendre();return;}
  opRetourBase();
};
function opAvancer(){
  const f=S.futur[S.futur.length-1];
  if(S.ecran==='options'&&!S.fiche&&f&&f.op){S.futur.pop();S.hist.push({op:opEtat()});opRestaurer(f.op);rendre();return true;}
  return false;
}
function opAction(k){
  if(k==='sauver'){const d=new Date();S.op.sauve=`${d.getHours()} h ${String(d.getMinutes()).padStart(2,'0')}`;opMaj();toast('Partie sauvegardée.');return;}
  if(k==='arrivee'){opGarder();location.href='index.html?ecran=arrivee&ppetape=split&ppouv=0';return;}
  if(k==='changer'){mnOuvrirParties();return;}
  if(k==='exporter'){toast('Fichier prêt : cage-legacy-partie-1.json (simulé dans la maquette).');return;}
  if(k==='importer'){toast('Le choix du fichier reste celui du jeu (simulé dans la maquette).');return;}
  if(k==='effacer')opPas(()=>{S.op.conf=true;});
}

/* ---- Clics ---- */
document.addEventListener('click',e=>{
  if(S.ecran!=='options')return;
  const t=e.target,F=S.op,stop=()=>e.stopImmediatePropagation();let el;
  if(t.closest('#bAvant')&&!S.fiche&&opAvancer()){stop();return;}
  if(t.closest('#bRetour')&&!S.fiche){const h=S.hist[S.hist.length-1];if(h&&h.op){stop();retour();return;}}
  if(S.fiche||!t.closest('#corps'))return;
  if(F.conf){
    if(t.closest('[data-opok]')){stop();F.conf=false;F.efface=true;S.hist.forEach(h=>{if(h&&h.op){const x=JSON.parse(h.op);x.conf=false;h.op=JSON.stringify(x);}});S.futur=[];rendre();toast('Partie effacée. L’emplacement 1 est libre.');return;}
    if(t.closest('[data-oprevenir]')||(t.closest('[data-opvoile]')&&!t.closest('.op-dlg'))){stop();opPas(()=>{F.conf=false;});return;}
    if(t.closest('[data-opvoile]'))stop();
    return;
  }
  if((el=t.closest('[data-opong]'))){stop();const v=el.dataset.opong;if(v!==F.ong)opPas(()=>{F.ong=v;F.anim=true;});return;}
  if((el=t.closest('[data-opv]'))){stop();const [g,k,i]=el.dataset.opv.split('|'),l=OP_LIGNES[F.ong].find(x=>x.k===k);F.vals[g][k]=l.c[+i][0];opGarder();opMaj();return;}
  /* Un clic sur le dernier bloc allumé baisse d'un cran : c'est ainsi qu'on arrive à 0. */
  if((el=t.closest('[data-opn]'))){stop();const [g,k,n]=el.dataset.opn.split('|');F.vals[g][k]=F.vals[g][k]===+n?+n-1:+n;opGarder();opMaj();return;}
  if((el=t.closest('[data-opa]'))){stop();opAction(el.dataset.opa);return;}
  if(t.closest('[data-opraz]')){stop();F.vals[F.ong]=JSON.parse(JSON.stringify(OP_ORIGINE[F.ong]));opGarder();opMaj();toast('Réglages d’origine remis.');return;}
  if((el=t.closest('[data-opart]'))){stop();const id=el.dataset.opart;if(id!==F.art)opPas(()=>{F.art=id;});return;}
  if((el=t.closest('[data-opfam]'))){stop();const v=el.dataset.opfam;if(v!==F.fam)opPas(()=>{F.fam=v;F.art=OP_ARTICLES.find(a=>a.f===v).id;});return;}
},true);
document.addEventListener('keydown',e=>{
  if(S.ecran==='options'&&!S.fiche&&e.key==='Escape'&&S.op.conf){e.stopImmediatePropagation();e.preventDefault();opPas(()=>{S.op.conf=false;});}
},true);

/* ---- Lancement ---- */
window.addEventListener('DOMContentLoaded',()=>{
  const q=new URLSearchParams(location.search);
  if(q.get('ecran')!=='options')return;
  const o=q.get('opong'),a=q.get('oparticle'),et=q.get('opetat');
  if(OP_ONGLETS.some(x=>x[0]===o))S.op.ong=o;
  if(OP_ARTICLES.some(x=>x.id===a)){S.op.art=a;S.op.fam=opArticle(a).f;S.op.ong='aide';}
  if(et){S.op.demo=true;S.op.vals=JSON.parse(JSON.stringify(OP_ORIGINE));}
  if(et==='effacer'){S.op.ong='partie';S.op.conf=true;}
  if(et==='sanspartie'){S.op.ong='partie';S.op.sansPartie=true;}
  S.ecran='options';S.hist=et==='sanspartie'?[]:['accueil'];S.op.anim=true;rendre();
});
