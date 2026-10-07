"use strict";
/* ==== [ANCRE: MGMT_BRIEF_LOT4_CADRE] — Brief du 06/10/2026, lot 4 : le socle de
   l'interface (planches « Règles 1 » et « Règles 2 » du canvas, ui-cadre.css).
   Ce fichier porte :
   - le cadre fixe de 1920 × 1080, mis à l'échelle de la fenêtre sans jamais se
     réorganiser (mfAjuste), le texte non sélectionnable, le clic droit neutralisé ;
   - la barre des sections et la rangée de touches, communes à tous les écrans ;
   - les pièces (panneau, cartouche, ligne, puce, onglet, bouton, touche, marque,
     voix) comme fonctions qui rendent du HTML, tout texte injecté passant par esc() ;
   - le gabarit des noms (un nom rétrécit quand il est long, rien ne déborde) ;
   - l'accueil, la confirmation « Retour au menu principal ».
   TRANSITION : un écran ancien reste en service, dans son habillage actuel, jusqu'à la
   livraison de son remplaçant ; il est posé dans le cadre (mfAncien). Dans la barre,
   une section dont le lot n'est pas livré ouvre l'écran ancien qui lui correspond, ou
   reste grisée s'il n'y en a pas. Aucun texte de personnage n'est écrit ici. ==== */

const MF_LARGEUR=1920, MF_HAUTEUR=1080;
/** Rapport de largeur entre le titre de repli (Saira Condensed 800) et Saira Extra
 *  Condensed 800, que les tables d'avance des maquettes décrivent. À ramener à 1 le jour
 *  où le vrai fichier de la police est dans fonts/ (voir ui-cadre.css). */
const MF_ADV_ECHELLE=1;

/** Met le cadre à l'échelle de la fenêtre : un seul rapport, jamais de réorganisation. */
function mfAjuste(){
  if(typeof window==='undefined'||!window.innerWidth||!document.documentElement) return;
  const s=Math.min(window.innerWidth/MF_LARGEUR,window.innerHeight/MF_HAUTEUR);
  document.documentElement.style.setProperty('--mf-s',String(Math.round(s*10000)/10000));
}
if(typeof window!=='undefined'&&window.addEventListener){
  window.addEventListener('resize',mfAjuste);
  mfAjuste();
}
if(typeof document!=='undefined'&&document.addEventListener){
  /* Le clic droit n'ouvre pas le menu du navigateur sur un écran du cadre. */
  document.addEventListener('contextmenu',e=>{ if(document.querySelector('.mf-ecran')) e.preventDefault(); });
}

const MF_LOGO_SVG='<svg width="88" height="88" viewBox="0 0 400 400" fill="none" role="img" aria-label="L’octogone rouge gravé" style="flex:none">'
  +'<path d="M292.0 238.1L238.1 292.0L161.9 292.0L108.0 238.1L108.0 161.9L161.9 108.0L238.1 108.0L292.0 161.9Z" stroke="#E23A2B" stroke-width="15.0" stroke-linejoin="miter"></path>'
  +'<path d="M331.0 254.3L254.3 331.0L145.7 331.0L69.0 254.3L69.0 145.7L145.7 69.0L254.3 69.0L331.0 145.7Z" stroke="#E23A2B" stroke-width="21.0" stroke-linejoin="miter"></path>'
  +'<path d="M371.0 270.8L270.8 371.0L129.2 371.0L29.0 270.8L29.0 129.2L129.2 29.0L270.8 29.0L371.0 129.2Z" stroke="#E23A2B" stroke-width="12.0" stroke-linejoin="miter"></path></svg>';

function mfLogoHtml(){
  return `<div class="mf-logo">${MF_LOGO_SVG}<div class="mf-logo-mots"><b>CAGE</b><i>LEGACY</i></div></div>`;
}

/* ---- Les sections de la barre --------------------------------------------- */

/** Les onze sections, dans l'ordre de la barre. `ecran` : l'écran ancien qui la porte tant que
 *  son remplaçant n'est pas livré ; null : la section reste grisée. */
const MF_SECTIONS=[
  {id:'carte',libelle:'Carte',ecran:'mgmt_carte'},
  {id:'preliminaires',libelle:'Préliminaires',ecran:'mgmt_prelims'},
  {id:'effectif',libelle:'Effectif',ecran:'mgmt_effectif'},
  {id:'classements',libelle:'Classements',ecran:'mgmt_classements'},
  {id:'ceintures',libelle:'Ceintures',ecran:'mgmt_ceintures'},
  {id:'contrats',libelle:'Contrats',ecran:'mgmt_contrats'},
  {id:'camps',libelle:'Camps',ecran:'mgmt_camps'},
  {id:'presse',libelle:'Presse',ecran:'mgmt_presse'},
  {id:'calendrier',libelle:'Calendrier',ecran:'mgmt_calendrier'},
  {id:'resultats',libelle:'Résultats',ecran:'mgmt_resultats'},
  {id:'finances',libelle:'Finances',ecran:'mgmt_finances'},
];
/** L'écran ouvert → la section qu'il éclaire dans la barre. */
const MF_ECRAN_SECTION={mgmt_carte:'carte',mgmt_bureau:'preliminaires',mgmt_effectif:'effectif',mgmt_classements:'classements',
  mgmt_recrutement:'contrats',mgmt_organisation:'finances',mgmt_lendemain:'resultats',mgmt_calendrier:'calendrier',mgmt_prelims:'preliminaires',mgmt_finances:'finances',mgmt_contrats:'contrats',mgmt_ceintures:'ceintures',mgmt_camps:'camps',mgmt_presse:'presse',mgmt_resultats:'resultats'};

/** La section que l'écran courant éclaire ; une fiche éclaire celle d'où on l'a ouverte. */
function mfSectionCourante(screen){
  if(screen==='mgmt_fiche'&&typeof MGMT_FICHE!=='undefined') return MF_ECRAN_SECTION[MGMT_FICHE.retour]||'effectif';
  return MF_ECRAN_SECTION[screen]||null;
}

/** Les sections qui attendent une action du joueur (l'octogone jaune). */
function mfAttentes(m){
  const out=new Set();
  if(!m) return out;
  if(m.card&&Number.isSafeInteger(m.card.sizeMain)&&Array.isArray(m.card.main)&&m.card.main.length<m.card.sizeMain) out.add('carte');
  if(typeof mgmtOpenCount==='function'&&mgmtOpenCount(m)>0) out.add('preliminaires');
  return out;
}

/** La barre. mode 'jeu' : les onze sections ; 'demarrage' : le logo seul, avant d'être dans une partie.
 *  `grise` : toute la barre est grisée (le soir). */
function mfBarreHtml({mode='jeu',courant=null,grise=false,m=null}={}){
  const attend=mfAttentes(m);
  let items='';
  if(mode==='jeu'){
    for(const s of MF_SECTIONS){
      const actif=!grise&&!!s.ecran;
      const cur=s.id===courant;
      const marque=actif&&attend.has(s.id)&&!cur?'<i class="mf-oct" aria-hidden="true"></i>':'';
      items+=actif
        ?`<button type="button" class="mf-barre-item${cur?' cur':''}" data-section="${esc(s.id)}"${cur?' aria-current="page"':''} onclick="CL.go('${esc(s.ecran)}')"><span>${esc(s.libelle)}</span>${marque}</button>`
        :`<button type="button" class="mf-barre-item grise${cur?' cur':''}" data-section="${esc(s.id)}" disabled aria-disabled="true"><span>${esc(s.libelle)}</span></button>`;
    }
  }
  const bas=`<div class="mf-barre-bas">`
    +(mode==='jeu'&&!grise
      ?`<button type="button" class="mf-barre-item${courant==='options'?' cur':''}" data-section="options"${courant==='options'?' aria-current="page"':''} onclick="CL.mgmtOptions()"><span>Options</span></button>`
      :`<button type="button" class="mf-barre-item grise" data-section="options" disabled aria-disabled="true"><span>Options</span></button>`)
    +(mode==='jeu'&&grise
      ?`<button type="button" class="mf-barre-item grise" data-section="menu" disabled aria-disabled="true"><span>Menu principal</span></button>`
      :`<button type="button" class="mf-barre-item" data-section="menu" onclick="${mode==='jeu'?'CL.mgmtMenuPrincipal()':'CL.mgmtLeave()'}"><span>Menu principal</span></button>`)
    +`</div>`;
  return `<nav class="mf-barre" aria-label="Sections"><div class="mf-barre-logo">${mfLogoHtml()}</div>${items}${bas}</nav>`;
}

/* ---- Les pièces ----------------------------------------------------------- */

/** Un panneau au contour du cadre. niveau : 'choisi' (100 %), 'normal' (50 %), 'cote' (30 %). */
function mfPanneau(inner,niveau='normal',classe='',attr=''){
  return `<div class="mf-panneau ${esc(niveau)}${classe?' '+esc(classe):''}"${attr?' '+attr:''}><div class="mf-p2"><div class="mf-p3">${inner}</div></div></div>`;
}
function mfCartouche(texte){ return `<span class="mf-cartouche">${esc(texte)}</span>`; }
/** Une ligne de liste ; `choisie` : blanc cassé, texte noir. */
function mfLigne(titre,valeur,{choisie=false}={}){
  return `<div class="mf-ligne${choisie?' choisie':''}"><span class="mf-ligne-t">${esc(titre)}</span>`+(valeur===undefined||valeur===null?'':`<span class="mf-ligne-v">${esc(valeur)}</span>`)+`</div>`;
}
function mfPuce(texte){ return `<span class="mf-puce">${esc(texte)}</span>`; }
function mfOnglet(texte,ouvert=false){ return `<span class="mf-onglet${ouvert?' ouvert':''}">${esc(texte)}</span>`; }
/** Une touche : Entrée (jaune) ou n'importe laquelle (blanc cassé). */
function mfTouche(k,jaune=false){ return `<span class="mf-k${jaune?' or':''}">${esc(k)}</span>`; }
/** Un bouton : un seul jaune par écran, l'action principale. */
function mfBouton(libelle,{touche='',jaune=false,onclick='',classe=''}={}){
  return `<button type="button" class="mf-bouton${jaune?' jaune':''}${classe?' '+esc(classe):''}"${onclick?` onclick="${onclick}"`:''}>`
    +(touche?mfTouche(touche):'')+`<span class="mf-bouton-t">${esc(libelle)}</span></button>`;
}
/** Une marque : 'v' victoire, 'd' défaite, 'n' nul. */
function mfMarque(code){
  const c=String(code||'').toLowerCase();
  if(c==='v') return '<span class="mf-marque v" role="img" aria-label="Victoire">V</span>';
  if(c==='n') return '<span class="mf-marque n" role="img" aria-label="Nul"><i>N</i></span>';
  return '<span class="mf-marque d" role="img" aria-label="Défaite"><i>D</i></span>';
}
/** La voix : une seule pièce pour tout ce qui parle (commentaire, coins, assistante). */
function mfVoix(qui,texte){
  return `<div style="display:flex;flex-direction:column;align-items:flex-start"><span class="mf-voix-qui">${esc(qui)}</span>`
    +mfPanneau(`<div class="mf-voix-texte">« ${esc(texte)} »</div>`,'normal','mf-voix-bulle')+`</div>`;
}

/** La rangée de touches du bas. groupes : [{ks:['←','→'],t:'Choisir',jaune:false,onclick:''}]. */
function mfTouchesHtml(groupes){
  const g=(groupes||[]).map(x=>{
    const touches=x.ks.map(k=>mfTouche(k,!!x.jaune)).join('');
    const corps=`${touches}<span>${esc(x.t)}</span>`;
    return `<div class="mf-touche-g">${x.onclick?`<button type="button" onclick="${x.onclick}">${corps}</button>`:corps}</div>`;
  }).join('');
  return `<div class="mf-touches">${g}</div>`;
}

/* ---- Le gabarit des noms --------------------------------------------------- */

/** Avance de chaque caractère de Saira Extra Condensed 800, en fraction du corps (tables des maquettes). */
const MF_ADV={"A":0.425,"B":0.409,"C":0.323,"D":0.416,"E":0.342,"F":0.317,"G":0.41,"H":0.435,"I":0.216,"J":0.258,"K":0.414,"L":0.312,"M":0.623,"N":0.439,"O":0.42,"P":0.404,"Q":0.42,"R":0.42,"S":0.369,"T":0.351,"U":0.425,"V":0.412,"W":0.662,"X":0.427,"Y":0.396,"Z":0.367,"0":0.398,"1":0.277,"2":0.383,"3":0.367,"4":0.393,"5":0.383,"6":0.391,"7":0.358,"8":0.404,"9":0.391,"-":0.266,"'":0.202," ":0.145,".":0.231};
/** Longueur d'un texte en corps de lettre (1 = un corps). */
function mfAvance(s){
  let t=0;
  for(const c of String(s)){ const w=MF_ADV[c]; t+=(w===undefined?0.45:w); }
  return t*MF_ADV_ECHELLE;
}
/** Un nom comme sur une affiche : majuscules, sans accent, apostrophe droite. */
function mfNet(s){
  return String(s==null?'':s).normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/’/g,"'").toUpperCase().trim();
}
/** Le plus grand corps (jusqu'à `max`, au moins `min`) qui tient `largeur` px : un nom long rétrécit, rien ne déborde. */
function mfCorps(texte,largeur,max,min=22){
  const a=Math.max(mfAvance(mfNet(texte)),0.3);
  return Math.max(min,Math.min(max,Math.floor(largeur/a)));
}

/** Les deux noms de l'affiche en colonnes verticales : portage des maquettes (« lane »). Chaque nom
 *  prend le plus grand corps qui tient dans la hauteur, le VS et la boîte du poids se placent dans
 *  la place qui reste. @returns {object} les positions et corps, en px. */
function mfAfficheMise(nom1,nom2){
  const n1=mfNet(nom1), n2=mfNet(nom2);
  const a1=Math.max(mfAvance(n1),0.3), a2=Math.max(mfAvance(n2),0.3), aL=Math.max(a1,a2), aS=Math.min(a1,a2);
  const r1=x=>Math.round(x*10)/10;
  const H=1044, G=20, VS=0.781, BOX=0.653, CX=1234, TOP=18, BOT=1062;
  const fsE=Math.min(300,H/aL), need=(VS+BOX)*fsE+2*G;
  const room1=H-a1*fsE>=need, room2=H-a2*fsE>=need;
  let mode, fs;
  if(room1||room2){ mode=(room1&&room2)?'P':(room1?'E1':'E2'); fs=fsE; }
  else{
    const fsS=Math.min(300,(H-G)/(aL+BOX),(H-G)/(aS+VS)), fsT=Math.min(221,H/aL);
    if(fsT>fsS){ mode='T'; fs=fsT; } else { mode='S'; fs=fsS; }
  }
  fs=Math.floor(fs);
  const th=0.69*fs;
  let xA, xB, vsFs=fs, vsLeft, vsTop, boxLeft, boxTop, boxW=th, boxFs=0.28*fs, boxH=BOX*fs;
  if(mode==='T'){
    const c=Math.min(110,434-2*th-32,th);
    xA=CX-(2*th+c+32)/2; const xC=xA+th+16; xB=xC+c+16;
    vsFs=c/0.69; boxW=c; boxFs=(c-20)/1.83; boxH=2*0.69*boxFs+0.3*boxFs+28;
    const grp=VS*vsFs+16+boxH; vsLeft=xC; vsTop=540-grp/2; boxLeft=xC; boxTop=vsTop+VS*vsFs+16;
  }else{
    xA=CX-(2*th+G)/2; xB=xA+th+G; const lenVS=VS*fs; let gap;
    if(mode==='E1'){ gap=(H-a1*fs-lenVS-boxH)/2; vsLeft=xA; vsTop=TOP+a1*fs+gap; boxLeft=xA; boxTop=BOT-boxH; }
    else if(mode==='E2'){ gap=(H-a2*fs-lenVS-boxH)/2; boxLeft=xB; boxTop=TOP; vsLeft=xB; vsTop=TOP+boxH+gap; }
    else if(mode==='P'||a1>=a2){ boxLeft=xA; boxTop=BOT-boxH; vsLeft=xB; vsTop=TOP; }
    else{ vsLeft=xA; vsTop=BOT-lenVS; boxLeft=xB; boxTop=TOP; }
  }
  return {mode,n1,n2,fs,xA:r1(xA),xB:r1(xB),vsFs:r1(vsFs),vsLeft:r1(vsLeft),vsTop:r1(vsTop),vsStroke:Math.max(2,Math.round(vsFs/75)),
    boxLeft:r1(boxLeft),boxTop:r1(boxTop),boxW:r1(boxW),boxH:r1(boxH),boxFs:r1(boxFs),boxGap:r1(0.3*boxFs)};
}

/* ---- L'écran : cadre, écrans anciens -------------------------------------- */

/** Le mouvement sobre : tout arrive vite et en biais, tout se pose droit, rien ne bouge au repos.
 *  L'entrée ne se joue qu'à l'arrivée sur un écran, jamais quand le même écran se redessine
 *  (une flèche, un clic) ; ui-cadre.css la réserve à prefers-reduced-motion:no-preference. */
let MF_VU=null;
function mfEntreeClasse(){
  const ecran=(typeof G!=='undefined'&&G)?G.screen:null;
  const nouveau=ecran!==MF_VU; MF_VU=ecran;
  return nouveau?' mf-entree':'';
}

/* ==== [ANCRE: MGMT_FIDELITE_ENTETE] — Reprise de fidélité du 07/10/2026 : l'en-tête des planches. À gauche, la plaque, puis (selon l'écran) les pastilles de
   progression, un grand nombre (44 px) et son libellé (22 px) ; à droite, « Dans N jours », la boîte de la date et du lieu (40 px et 24 px) et la boîte
   « SPLIT FIGHT NIGHT » suivie du numéro en rouge (56 px). Sans agenda (partie d'avant), seule la boîte de la soirée reste. ==== */
/** Ce qu'on sait de la prochaine soirée : dans combien de jours, quel jour, quel lieu. Pur, dérivé de l'agenda. */
function mfSoireeInfos(m){
  const vide={dans:'',date:'',lieu:''};
  try{
    if(!m||typeof mgmtAgendaActif!=='function'||!mgmtAgendaActif(m)||!m.cal||!m.cal.prochaines||!m.cal.prochaines[0]) return vide;
    const soir=m.cal.prochaines[0], jd=mgmtJourDate(soir.jour), reste=Math.max(0,soir.jour-(m.cal.jour||0));
    const salle=(typeof mgmtSalleParId==='function'&&mgmtSalleParId(m,soir.salle))||(typeof mgmtSalleDefaut==='function'?mgmtSalleDefaut(m):null);
    /* Un nom de salle long (« Palais des sports de Marseille ») ne tient pas dans la boîte de la planche (« Dôme de Lyon ») : la ville le remplace. */
    const lieu=salle?String(salle.nom.length<=16||!salle.ville?salle.nom:salle.ville).toUpperCase():'';
    return {dans:reste===0?'Aujourd’hui':'Dans '+reste+' jour'+(reste>1?'s':''),date:jd.jour+' '+jd.mois,lieu};
  }catch(e){ return vide; }
}
/** Le bloc de droite de l'en-tête pour une partie : le décompte, la date, la soirée. */
function mfEnteteSoiree(m){
  const i=mfSoireeInfos(m);
  const n=(m.eventsPlayed||0)+1;
  return `<div class="mf-entete-d soiree">`
    +(i.dans?`<div class="mf-tete-dans">${esc(i.dans)}</div>`:'')
    +(i.date?`<div class="mf-tete-boite"><b>${esc(i.date)}</b>${i.lieu?`<span>${esc(i.lieu)}</span>`:''}</div>`:'')
    +`<div class="mf-tete-boite soir"><b>${esc(String(mgmtOrgNom(m)).toUpperCase())} FIGHT NIGHT</b><b class="n">${esc(n)}</b></div></div>`;
}
/** Le libellé de l'en-tête : un nombre en grand suivi de son texte, ou un simple texte. */
function mfEnteteLibelle(lib){
  const t=String(lib||''); if(!t) return '';
  const mm=/^(\d+(?: \/ \d+)?)(?:\s+(.*))?$/.exec(t);
  if(mm) return `<div class="mf-entete-n">${esc(mm[1])}</div>${mm[2]?`<div class="mf-entete-lib">${esc(mm[2])}</div>`:''}`;
  return `<div class="mf-entete-lib">${esc(t)}</div>`;
}
/** Les onglets de l'en-tête (Contrats : sous contrat / recrutement) : [{t,on,onclick}]. */
function mfEnteteOnglets(o){
  if(!Array.isArray(o)||!o.length) return '';
  return `<div class="mf-entete-ongs">${o.map(x=>`<button type="button" class="mf-onglet${x.on?' ouvert':''}" aria-pressed="${!!x.on}"${x.onclick?` onclick="${x.onclick}"`:''}>${esc(String(x.t).toUpperCase())}</button>`).join('')}</div>`;
}
/** Les pastilles de progression de la carte : pleines pour les combats posés, creuses pour ceux qui manquent. */
function mfEntetePastilles(t){
  if(!t||!(t[1]>0)) return '';
  return `<div class="mf-tuiles" aria-hidden="true">${Array.from({length:t[1]},(_,i)=>`<i class="${i<t[0]?'p':''}"></i>`).join('')}</div>`;
}
/* ==== [FIN ANCRE] ==== */

/** Un écran du cadre : le fond cendré, l'en-tête, la barre, le contenu, les touches.
 *  opts : {barre:'jeu'|'demarrage'|'aucune', courant, grise, m, plaque, libelle, droite, touches, fond:'cendre'|'teinte', couleur, contenuBrut} */
function mfEcran(contenu,opts={}){
  const o=Object.assign({barre:'jeu',courant:null,grise:false,m:null,plaque:'',libelle:'',droite:'',touches:null,couleur:''},opts);
  const entete=o.plaque
    ?`<header class="mf-entete"><div class="mf-entete-g"><div class="mf-plaque">${esc(o.plaque)}</div>${mfEntetePastilles(o.tuiles)}${mfEnteteOnglets(o.onglets)}${mfEnteteLibelle(o.libelle)}${o.compteur?`<div class="mf-entete-n">${esc(o.compteur)}</div>`:''}</div>`
      +(o.droite?(o.m&&/fight night/i.test(o.droite)?mfEnteteSoiree(o.m):`<div class="mf-entete-d">${esc(o.droite)}</div>`):'')+`</header>`
    :'';
  const barre=o.barre==='aucune'?'':(o.barre==='logo'
    ?`<div class="mf-logo-seul">${mfLogoHtml()}</div>`
    :mfBarreHtml({mode:o.barre,courant:o.courant,grise:o.grise,m:o.m}));
  return `<div class="mf-ecran${mfEntreeClasse()}"><div class="mf-stage"><div class="mf-fond"></div>`
    +(o.couleur?`<div class="mf-teinte" style="--mf-couleur:${esc(o.couleur)}"></div>`:'')
    +entete+contenu+barre+(o.touches?mfTouchesHtml(o.touches):'')+`</div></div>`;
}

/** Un écran ancien, dans son habillage actuel, posé dans le cadre sous la barre des sections. */
function mfAncien(html,screen){
  const m=typeof G!=='undefined'&&G?G.mgmt:null;
  const soir=screen==='mgmt_soiree'||screen==='mgmt_lendemain';
  const courant=mfSectionCourante(screen);
  /* ==== [ANCRE: MGMT_FIDELITE_ANCIEN_ENTETE] — Reprise de fidélité du 07/10/2026 : la plaque dit ce qu'est l'écran (« Les affaires », « Le lendemain »…) et non la
     section de la barre qui l'éclaire ; la droite de l'en-tête est celle des planches (décompte, date, soirée). ==== */
  const PLAQUES={mgmt_bureau:'Les affaires',mgmt_organisation:'Organisation',mgmt_lendemain:'Le lendemain',mgmt_vestiaire:'Le vestiaire',mgmt_recrutement:'Recrutement',mgmt_soiree:'Soirée'};
  const lib=PLAQUES[screen]||(courant?(MF_SECTIONS.find(s=>s.id===courant)||{}).libelle:'');
  const droite=m?`${mgmtOrgNom(m)} Fight Night ${Number.isSafeInteger(m.eventsPlayed)?m.eventsPlayed+1:''}`.trim():'';
  /* ==== [FIN ANCRE] ====*/
  return mfEcran(`<main class="mf-contenu"><div class="mf-ancien">${html}</div></main>`,
    {barre:'jeu',courant,grise:soir,m,plaque:lib||'Management',droite});
}

/* ---- La confirmation « Retour au menu principal » -------------------------- */

let MF_CONFIRMATION={retour:'mgmt_bureau'};
function scr_mgmt_confirmation(){
  const dialogue=`<div class="mf-dialogue" role="dialog" aria-label="Retour au menu principal">`
    +mfPanneau(`<div><div class="mf-dialogue-titre">RETOUR AU MENU PRINCIPAL ?</div><div class="mf-dialogue-trait"></div></div>`
      +`<div class="mf-dialogue-texte">Tu quittes le management.<br>Ta partie est sauvegardée, tu la retrouveras au même endroit.</div>`
      +`<div class="mf-dialogue-boutons">${mfBouton('Rester',{touche:'Échap',onclick:'CL.mgmtMenuPrincipalAnnuler()'})}${mfBouton('Revenir au menu',{touche:'Entrée',jaune:true,onclick:'CL.mgmtMenuPrincipalConfirmer()'})}</div>`,'choisi')
    +`</div>`;
  return `<div class="mf-ecran${mfEntreeClasse()}"><div class="mf-stage"><div class="mf-fond"></div><div class="mf-voile"></div>${dialogue}</div></div>`;
}
/* Lot 11 : A et E passent à la section d'avant ou d'après quand la barre est ouverte (la rangée de touches l'annonce depuis le lot 4). Une
   touche déjà prise par l'écran garde son sens ; la barre grisée (le soir) n'a aucune section ouverte, rien ne se passe. */
function mfSectionVoisine(delta){
  if(typeof document==='undefined') return false;
  const barre=document.querySelector('.mf-barre'); if(!barre) return false;
  const items=[...barre.querySelectorAll('.mf-barre-item[data-section]')].filter(b=>!b.disabled&&b.dataset.section!=='menu'&&b.dataset.section!=='options');
  if(!items.length) return false;
  let i=items.findIndex(b=>b.classList.contains('cur'));
  if(i<0) i=delta>0?-1:0;
  items[(i+delta+items.length)%items.length].click();
  return true;
}
if(typeof document!=='undefined'&&document.addEventListener){
  document.addEventListener('keydown',e=>{
    if(e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey) return;
    const t=e.target; if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable)) return;
    if(e.key==='a'||e.key==='A'){ if(mfSectionVoisine(-1)) e.preventDefault(); }
    else if(e.key==='e'||e.key==='E'){ if(mfSectionVoisine(1)) e.preventDefault(); }
  });
}
SCREENS.mgmt_confirmation=scr_mgmt_confirmation;
SCREENS.title=scr_title;
Object.assign(CL,{
  /** Ouvre la confirmation depuis l'écran courant. */
  mgmtMenuPrincipal(){ MF_CONFIRMATION={retour:(G&&G.screen&&G.screen!=='mgmt_confirmation')?G.screen:'mgmt_bureau'}; CL.go('mgmt_confirmation'); },
  mgmtMenuPrincipalAnnuler(){ CL.go(MF_CONFIRMATION.retour||'mgmt_bureau'); },
  mgmtMenuPrincipalConfirmer(){ if(typeof saveMgmt==='function') saveMgmt(); CL.mgmtLeave(); },
});
keysRegister('mgmt_confirmation',{
  Escape(){ CL.mgmtMenuPrincipalAnnuler(); },
  Enter(){ CL.mgmtMenuPrincipalConfirmer(); },
});

/* ---- L'accueil ------------------------------------------------------------- */

let MF_ACCUEIL={i:0};
/** Les entrées de l'accueil. `fn` : l'action au clavier ; `action` : la même au clic. */
const MF_MENU=[
  {id:'management',t:'Management',sous:'Matchmaker',action:'CL.mgmtParties()',fn:()=>CL.mgmtParties(),classe:'title-management'},
  {id:'carriere',t:'Carrière',action:"CL.go('intro')",fn:()=>CL.go('intro')},
  {id:'duel',t:'Duel entre amis',action:'CL.duelEnter()',fn:()=>CL.duelEnter()},
  {id:'pantheon',t:'Panthéon',action:"CL.go('hof')",fn:()=>CL.go('hof')},
  {id:'succes',t:'Succès',bas:true,action:"CL.go('ach')",fn:()=>CL.go('ach')},
  {id:'options',t:'Options',bas:true,action:'CL.mgmtOptions()',fn:()=>CL.mgmtOptions()},
  {id:'quitter',t:'Quitter',bas:true,grise:true},
];

/** Les données de l'affiche : le combat principal de la prochaine soirée, lu sur la carte. */
function mfAfficheDonnees(m){
  const cf=m&&m.card&&Array.isArray(m.card.main)?m.card.main.find(x=>x&&x.a&&x.b):null;
  if(!cf) return null;
  const a=mgmtFighterById(m,cf.a), b=mgmtFighterById(m,cf.b);
  if(!a||!b) return null;
  const fiche=f=>{
    const rang=mgmtDivisionRank(m,f,'organization');
    const champion=typeof mgmtSplitTitle==='function'&&mgmtSplitTitle(m,f.div).id===f.id;
    const forme=mgmtResultatsDetail(m,f).slice(0,3).reverse().map(x=>x.issue==='win'?'v':(x.issue==='loss'?'d':'n'));
    return {prenom:mfNet(f.first||String(f.name).split(' ')[0]),nom:mfNet(f.last||f.name),rec:`${f.W||0}-${f.L||0}-${f.D||0}`,
      ligneA:`${champion?'C':(rang===null?'—':'N°'+rang)} · ${mgmtDivisionLabel(f.div)}`,ligneB:`${f.age} ans`,forme};
  };
  const autres=m.card.main.filter(x=>x&&x.a&&x.b&&x!==cf).slice(0,2).map(x=>{
    const p=mgmtFighterById(m,x.a), q=mgmtFighterById(m,x.b);
    return p&&q?`${p.last||p.name} — ${q.last||q.name}`:'';
  }).filter(Boolean);
  const couleurs=['#B32A1E','#1F4E8C','#C9962A','#1C7A5A','#D2641C','#A3216B','#BFBAB2','#1B8C8F'];
  const h=typeof mgmtHashId==='function'?mgmtHashId(cf.a+'|'+cf.b):0;
  const info=mfSoireeInfos(m), date=info.date, lieu=info.lieu;
  return {a:fiche(a),b:fiche(b),cat:mgmtDivisionLabel(a.div),n:(m.eventsPlayed||0)+1,org:m.org,autres,date,lieu,couleur:couleurs[Math.abs(h)%couleurs.length]};
}

function mfFicheAccueilHtml(f,cote,recFs){
  return `<div class="mf-fiche ${cote}"><div class="mf-fiche-haut"><div class="mf-fiche-nom"><div>${esc(f.prenom)}</div><div>${esc(f.nom)}</div></div>`
    +`<div class="mf-fiche-rec" style="font-size:${recFs}px">${esc(f.rec)}</div></div>`
    +`<div class="mf-fiche-lignes"><div>${esc(f.ligneA)}</div><div>${esc(f.ligneB)}</div></div>`
    +`<div class="mf-fiche-forme">${f.forme.map(mfMarque).join('')}</div></div>`;
}

/** L'affiche de la prochaine soirée en plein écran, ou le logo à droite quand aucune n'est prévue. */
function mfAfficheHtml(m){
  const d=mfAfficheDonnees(m);
  /* Reprise de fidélité du 07/10/2026 : la planche « Accueil — Aucune soirée prévue » n'a que le titre et le menu sur le fond cendré ; la planche « Logo » dit que
     l'accueil garde le titre écrit (le logo seul est pour l'icône du jeu). Plus d'octogone à droite. */
  if(!d) return '';
  const L=mfAfficheMise(d.a.nom,d.b.nom);
  const recFs=Math.floor(Math.min(180,302/Math.max(mfAvance(d.a.rec),mfAvance(d.b.rec),0.5)));
  const lignes=d.cat.toUpperCase().split(' ');
  return `<div class="mf-affiche" data-mise="${esc(L.mode)}">`
    +`<div class="mf-nom" style="left:${L.xA}px;top:18px;font-size:${L.fs}px">${esc(L.n1)}</div>`
    +`<div class="mf-vs" style="left:${L.vsLeft}px;top:${L.vsTop}px;font-size:${L.vsFs}px">VS</div>`
    +`<div class="mf-vs trait" aria-hidden="true" style="left:${L.vsLeft}px;top:${L.vsTop}px;font-size:${L.vsFs}px;-webkit-text-stroke-width:${L.vsStroke}px">VS</div>`
    +`<div class="mf-poids" style="left:${L.boxLeft}px;top:${L.boxTop}px;width:${L.boxW}px;height:${L.boxH}px;font-size:${L.boxFs}px;gap:${L.boxGap}px">${lignes.map(x=>`<div>${esc(x)}</div>`).join('')}</div>`
    +`<div class="mf-nom bas" style="left:${L.xB}px;bottom:18px;font-size:${L.fs}px">${esc(L.n2)}</div>`
    +`<div class="mf-soiree"><div>${esc(d.org.toUpperCase())} FIGHT</div><div><span>NIGHT</span><b>${esc(d.n)}</b></div></div>`
    +mfFicheAccueilHtml(d.a,'g',recFs)+mfFicheAccueilHtml(d.b,'d',recFs)
    +(d.autres.length?`<div class="mf-aussi"><div class="mf-aussi-t">AUSSI À L’AFFICHE</div>${d.autres.map(x=>`<div class="mf-aussi-l">${esc(x)}</div>`).join('')}</div>`:'')
    +(d.date?`<div class="mf-date${d.lieu.length>14?' long':''}"><b>${esc(d.date)}</b><span>${esc(d.lieu)}</span></div>`:'')
    +`</div>`;
}

function mfTitre(){
  /* Les notifications de partie sont consommées sans être affichées (elles concernent l'écran d'où
     vient l'action) ; seule l'erreur de lien de légende partagé, posée au démarrage, reste visible. */
  const m=titleMgmtState();
  G.lastMsg=null;
  const boot=G.bootMsg; G.bootMsg=null;
  if(!Number.isSafeInteger(MF_ACCUEIL.i)||MF_ACCUEIL.i<0||MF_ACCUEIL.i>=MF_MENU.length) MF_ACCUEIL.i=0;
  const bouton=(x,i)=>{
    const on=i===MF_ACCUEIL.i&&!x.grise;
    const cls=[x.premier?'premier':'',on?'on':'',x.grise?'grise':'',x.classe||''].filter(Boolean).join(' ');
    return x.grise
      ?`<button type="button" class="${cls}" disabled aria-disabled="true">${esc(x.t)}</button>`
      :`<button type="button" class="${cls}"${on?' aria-current="true"':''} onclick="${x.action}"><span>${esc(x.t)}</span>${x.sous?`<small>${esc(x.sous)}</small>`:''}</button>`;
  };
  const haut=MF_MENU.map((x,i)=>x.bas?'':bouton(Object.assign({premier:i===0},x),i)).join('');
  const bas=MF_MENU.map((x,i)=>x.bas?bouton(x,i):'').join('');
  const reprise=m?mfTouche('R',false):'';
  const gauche=`<div class="mf-accueil-gauche"><h1 class="mf-accueil-titre">CAGE<br>LEGACY</h1>`
    +`<nav class="mf-menu" aria-label="Modes de jeu">${haut}</nav><div class="mf-menu-sep"></div><nav class="mf-menu-bas" aria-label="Autres">${bas}</nav>`
    +(boot?`<p class="mf-accueil-message" role="alert">${esc(boot)}</p>`:'')+`</div>`;
  const touches=`<div class="mf-accueil-touches"><div class="mf-touche-g">${mfTouche('↑')}${mfTouche('↓')}<span>Choisir</span></div>`
    +`<div class="mf-touche-g">${mfTouche('Entrée',true)}<span>Valider</span></div>`
    +(m?`<div class="mf-touche-g"><button type="button" class="title-resume" onclick="CL.mgmtEnter(mgmtSlotDernier()||1)">${reprise}<span>Reprendre</span></button></div>`:'')+`</div>`;
  const d=mfAfficheDonnees(m);
  /* Reprise de fidélité du 07/10/2026 (planches « Accueil corrigé » et « Accueil, contours et grand octogone », celles que retient Anthony) : le fond de l'accueil est le
     tunnel d'octogones rouges, avec ou sans affiche ; la teinte de couleur par soirée de l'ancien fond cendré ne s'y superpose plus. */
  return `<div class="mf-ecran title-screen${mfEntreeClasse()}"><div class="mf-stage"><div class="mf-fond octogones"></div>`
    +mfAfficheHtml(m)+gauche+touches+`</div></div>`;
}

Object.assign(CL,{
  mfMenuDeplacer(delta){
    let i=MF_ACCUEIL.i;
    for(let k=0;k<MF_MENU.length;k++){
      i=(i+delta+MF_MENU.length)%MF_MENU.length;
      if(!MF_MENU[i].grise) break;
    }
    MF_ACCUEIL.i=i; render();
  },
  mfMenuValider(){ const x=MF_MENU[MF_ACCUEIL.i]; if(x&&x.fn&&!x.grise) x.fn(); },
});
keysRegister('title',{
  ArrowUp(){ CL.mfMenuDeplacer(-1); },
  ArrowDown(){ CL.mfMenuDeplacer(1); },
  Enter(){ CL.mfMenuValider(); },
  r(){ if(titleMgmtState()) CL.mgmtEnter(mgmtSlotDernier()||1); },
  R(){ if(titleMgmtState()) CL.mgmtEnter(mgmtSlotDernier()||1); },
});
/* ==== [FIN ANCRE] ==== */
