"use strict";
/* ==== [ANCRE: MGMT_BRIEF_LOT12_OPTIONS] — Brief du 06/10/2026, lot 12 : l'écran Options et ses cinq onglets (planches « Options — Le combat »,
   « L'affichage », « Le son », « Les touches », « La partie »). Un onglet par groupe de réglages (mgmt-reglages.js), la liste des touches, et
   trois actions sur la partie : sauvegarder maintenant, changer de partie, effacer cette partie (la confirmation est celle de l'écran des
   emplacements). Souris d'abord, clavier en accélérateur : ↑ ↓ choisissent un réglage, ← → le changent, Tab change d'onglet, R remet les réglages
   d'origine de l'onglet, Échap revient d'où l'on vient. Depuis le menu principal l'écran s'ouvre sans partie (l'onglet Partie est alors muet).
   Les textes de réglage sont ceux des planches. ==== */

let MGMT_OP={onglet:'combat',ligne:0,retour:'title',message:''};
const MGMT_OP_ONGLETS=[{id:'combat',lib:'COMBAT'},{id:'affichage',lib:'AFFICHAGE'},{id:'son',lib:'SON'},{id:'touches',lib:'TOUCHES'},{id:'partie',lib:'PARTIE'}];
const MGMT_OP_TITRES={combat:'LE COMBAT',affichage:'L’AFFICHAGE',son:'LE SON',touches:'LES TOUCHES',partie:'LA PARTIE'};
/** Les réglages de chaque onglet, dans l'ordre de la planche. `choix` : [valeur, libellé] ; `niveau` : de 0 à 10. */
const MGMT_OP_LIGNES={
  combat:[
    {cle:'vitesse',lib:'VITESSE AU DÉPART',aide:'La vitesse du combat quand il commence. Tu peux la changer pendant le combat.',choix:[[1,'x1'],[2,'x2'],[4,'x4']]},
    {cle:'camera',lib:'CAMÉRA AU DÉPART',aide:'La caméra sur câble suit l’action. Les plans fixes ne bougent pas.',choix:[['cable','CÂBLE'],['plafond','PLAFOND'],['large','LARGE']]},
    {cle:'commentaire',lib:'COMMENTAIRE',aide:'Les phrases du commentateur, en bas à gauche de l’image.',choix:[[true,'AFFICHÉ'],[false,'MASQUÉ']]},
    {cle:'coins',lib:'PAROLES DES COINS',aide:'Ce que crient les deux coins pendant le combat.',choix:[[true,'AFFICHÉES'],[false,'MASQUÉES']]},
    {cle:'noms',lib:'NOM DES COUPS',aide:'L’étiquette qui nomme chaque coup, à côté du pion.',choix:[[true,'AFFICHÉ'],[false,'MASQUÉ']]},
    {cle:'secousses',lib:'SECOUSSES',aide:'L’image tremble sur les gros coups. À couper si ça te gêne.',choix:[[true,'OUI'],[false,'NON']]},
  ],
  affichage:[
    {cle:'plein',lib:'PLEIN ÉCRAN',aide:'Le jeu occupe tout l’écran, ou tient dans une fenêtre.',choix:[[true,'OUI'],[false,'NON']]},
    {cle:'taille',lib:'TAILLE DE L’IMAGE',aide:'Les écrans sont dessinés en 1920 × 1080 et s’adaptent aux autres tailles.',choix:[[1280,'1280 × 720'],[1920,'1920 × 1080'],[2560,'2560 × 1440']]},
    {cle:'fps',lib:'IMAGES PAR SECONDE',aide:'Moins d’images soulage les petites machines.',choix:[[30,'30'],[60,'60']]},
  ],
  son:[
    {cle:'general',lib:'VOLUME GÉNÉRAL',aide:'Tout le son du jeu.',niveau:true},
    {cle:'musique',lib:'MUSIQUE',aide:'La musique des menus et de la soirée.',niveau:true},
    {cle:'salle',lib:'LA SALLE',aide:'Le public pendant les combats. Plus la salle est pleine, plus il s’entend.',niveau:true},
    {cle:'coups',lib:'LES COUPS',aide:'Les impacts dans la cage.',niveau:true},
    {cle:'silence',lib:'SON COUPÉ HORS DU JEU',aide:'Le jeu se tait quand tu passes sur une autre fenêtre.',choix:[[true,'OUI'],[false,'NON']]},
  ],
  partie:[
    {cle:'sauver',lib:'SAUVEGARDER',aide:'La partie s’enregistre aussi toute seule après chaque soirée.',action:'SAUVEGARDER MAINTENANT',touche:'Entrée'},
    {cle:'changer',lib:'CHANGER DE PARTIE',aide:'Ouvre les trois emplacements. La partie en cours est sauvegardée avant.',action:'OUVRIR LES EMPLACEMENTS'},
    {cle:'effacer',lib:'EFFACER CETTE PARTIE',aide:'L’emplacement redevient vide. Une confirmation est demandée.',action:'EFFACER'},
  ],
};
/** La liste des touches, par situation, comme sur la planche. */
const MGMT_OP_TOUCHES=[
  {titre:'PARTOUT',liste:[['Échap','Revenir en arrière'],['A  E','Changer de section'],['↑ ↓ ← →','Choisir'],['Tab','Changer d’onglet, de catégorie ou de soirée'],['Entrée','Faire l’action écrite en jaune']]},
  {titre:'DANS LES LISTES',liste:[['G','Passer des hommes aux femmes'],['C','Changer la catégorie d’un combat'],['F','Ouvrir la fiche'],['M','Faire monter un préliminaire sur la carte principale']]},
  {titre:'PENDANT LA SOIRÉE',liste:[['Entrée','Regarder le combat'],['P','Passer le combat'],['F','Ouvrir l’avant-combat']]},
  {titre:'PENDANT LE COMBAT',liste:[['Espace','Mettre en pause'],['V','Changer la vitesse'],['C','Changer de caméra'],['P','Passer le combat'],['R','Revoir le combat, après la décision'],['Échap','Retour'],['Tab','Onglet'],['A  E','Section']]},
];

function mgmtOpLignes(){ return MGMT_OP_LIGNES[MGMT_OP.onglet]||[]; }
function mgmtOpPartieActive(){ return !!(G&&G.mgmt); }
function mgmtOpCtl(g,l,sel){
  if(l.action){
    const off=!mgmtOpPartieActive();
    return `<div class="mf-op-ctl"><button type="button" class="mf-op-act${sel?' sel':''}"${off?' disabled aria-disabled="true"':''} onclick="CL.mgmtOpAction('${l.cle}')">${l.touche&&sel?`<span class="mf-op-k">${esc(l.touche)}</span>`:''}<span>${esc(l.action)}</span></button></div>`;
  }
  const v=MGMT_REGLAGES[g]&&MGMT_REGLAGES[g][l.cle];
  if(l.niveau){
    const blocs=Array.from({length:10},(_,i)=>`<button type="button" class="mf-op-bloc${i<v?' on':''}" aria-label="${esc(l.lib)} ${i+1}" onclick="CL.mgmtOpNiveau('${g}','${l.cle}',${i+1})"></button>`).join('');
    return `<div class="mf-op-ctl"><div class="mf-op-blocs" role="slider" aria-valuemin="0" aria-valuemax="10" aria-valuenow="${esc(v)}" aria-label="${esc(l.lib)}">${blocs}</div><b class="mf-op-n">${esc(v)}</b></div>`;
  }
  return `<div class="mf-op-ctl">${l.choix.map(([val,lib],i)=>`<button type="button" class="mf-op-ch${val===v?' on':''}" aria-pressed="${val===v}" onclick="CL.mgmtOpChoisir('${g}','${l.cle}',${i})">${esc(lib)}</button>`).join('')}</div>`;
}
function mgmtOpLigneHtml(g,l,i){
  const sel=i===MGMT_OP.ligne;
  return `<div class="mf-op-l${sel?' sel':''}" onclick="CL.mgmtOpSelect(${i})"><div class="mf-op-t"><b>${esc(l.lib)}</b><span>${esc(l.aide)}</span></div>${mgmtOpCtl(g,l,sel)}</div>`;
}
function mgmtOpTouchesHtml(){
  const col=b=>`<div class="mf-op-tc"><div class="mf-so-s">${esc(b.titre)}</div>${b.liste.map(([k,t])=>`<div class="mf-op-tl"><span class="mf-op-tk">${k.split('  ').map(x=>`<span class="mf-k">${esc(x)}</span>`).join('')}</span><span>${esc(t)}</span></div>`).join('')}</div>`;
  return `<div class="mf-op-touches"><div>${col(MGMT_OP_TOUCHES[0])}${col(MGMT_OP_TOUCHES[1])}</div><div>${col(MGMT_OP_TOUCHES[2])}${col(MGMT_OP_TOUCHES[3])}</div></div>`;
}
/** Le pied de l'onglet Partie : l'emplacement, la soirée qui vient. */
function mgmtOpPiedHtml(){
  const m=G&&G.mgmt;
  if(!m) return `<div class="mf-op-pied"><span>Aucune partie ouverte : les actions sur la partie attendent.</span></div>`;
  const n=(m.eventsPlayed||0)+1;
  let dans='';
  if(typeof mgmtAgendaActif==='function'&&mgmtAgendaActif(m)&&typeof mgmtAgendaJour==='function'){
    const j=mgmtAgendaJour(m,n); if(j!==null&&Number.isFinite(m.cal.jour)) dans=' dans '+Math.max(0,j-m.cal.jour)+' jours';
  }
  return `<div class="mf-op-pied"><div class="mf-op-pg"><span class="mf-cartouche">${esc('EMPLACEMENT '+MGMT_SLOT)}</span><span>${esc(mgmtOrgNom(m))} · ${esc(mgmtOrgNom(m))} Fight Night ${esc(n)}${esc(dans)}</span></div>`
    +(MGMT_OP.message?`<span class="mf-puce" role="status">${esc(MGMT_OP.message)}</span>`:'')+`</div>`;
}
function scr_mgmt_options(){
  const m=G&&G.mgmt, o=MGMT_OP;
  if(!MGMT_OP_ONGLETS.some(x=>x.id===o.onglet)) o.onglet='combat';
  const ls=mgmtOpLignes();
  if(o.ligne>=ls.length) o.ligne=Math.max(0,ls.length-1);
  const onglets=MGMT_OP_ONGLETS.map(x=>`<button type="button" class="mf-onglet${x.id===o.onglet?' ouvert':''}" aria-pressed="${x.id===o.onglet}" onclick="CL.mgmtOpOnglet('${x.id}')">${x.lib}</button>`).join('');
  const bandeau=`<div class="mf-op-bande"><div class="mf-op-ongs">${onglets}</div><div class="mf-op-tab">${mfTouche('Tab')}<span>Onglet suivant</span></div></div>`;
  const nb=o.onglet==='touches'?'Clavier':(ls.length+(o.onglet==='partie'?' actions':' réglages'));
  const corps=o.onglet==='touches'?mgmtOpTouchesHtml():`<div class="mf-op-ls">${ls.map((l,i)=>mgmtOpLigneHtml(o.onglet,l,i)).join('')}</div>`;
  const panneau=mfPanneau(`<div class="mf-op-p"><div class="mf-so-ct"><div><div class="mf-so-ti">${esc(MGMT_OP_TITRES[o.onglet])}</div><i class="mf-so-bar"></i></div><span>${esc(nb)}</span></div>${corps}${o.onglet==='partie'?mgmtOpPiedHtml():''}</div>`,'choisi','mf-op-pan');
  const contenu=`<main class="mf-contenu mf-op">${bandeau}${panneau}</main>`;
  const touches=[{ks:['Échap'],t:'Retour',onclick:'CL.mgmtOpRetour()'}];
  if(o.onglet==='partie') touches.push({ks:['↑','↓'],t:'Choisir'},{ks:['Tab'],t:'Onglet',onclick:'CL.mgmtOpOnglet(1)'},{ks:['A','E'],t:'Section'},{ks:['Entrée'],t:'Sauvegarder maintenant',jaune:true,onclick:"CL.mgmtOpAction('sauver')"});
  else if(o.onglet==='touches') touches.push({ks:['Tab'],t:'Onglet',onclick:'CL.mgmtOpOnglet(1)'},{ks:['A','E'],t:'Section'});
  else touches.push({ks:['↑','↓'],t:'Choisir'},{ks:['←','→'],t:'Changer'},{ks:['Tab'],t:'Onglet',onclick:'CL.mgmtOpOnglet(1)'},{ks:['A','E'],t:'Section'},{ks:['R'],t:'Réglages d’origine',onclick:'CL.mgmtOpRaz()'});
  const droite=m?`${mgmtOrgNom(m)} Fight Night ${(m.eventsPlayed||0)+1}`:'';
  return mfEcran(contenu,{barre:m?'jeu':'logo',courant:'options',m,plaque:'Options',droite,touches});
}
SCREENS.mgmt_options=scr_mgmt_options;

Object.assign(CL,{
  /** Ouvre l'écran depuis le menu ou la barre ; Échap y revient. */
  mgmtOptions(){
    if(!G) G={theme:'dark'};
    if(G.screen!=='mgmt_options') MGMT_OP.retour=G.screen||'title';
    MGMT_OP.message='';
    CL.go('mgmt_options');
  },
  mgmtOpRetour(){ const r=MGMT_OP.retour; CL.go(r&&r!=='mgmt_options'&&SCREENS[r]?r:'title'); },
  mgmtOpOnglet(x){
    const ids=MGMT_OP_ONGLETS.map(o=>o.id), i=ids.indexOf(MGMT_OP.onglet);
    MGMT_OP.onglet=typeof x==='number'?ids[(i+(x<0?-1:1)+ids.length)%ids.length]:(ids.includes(x)?x:MGMT_OP.onglet);
    MGMT_OP.ligne=0; MGMT_OP.message=''; render();
  },
  mgmtOpSelect(i){ if(i!==MGMT_OP.ligne){ MGMT_OP.ligne=i; render(); } },
  mgmtOpLigne(d){ const n=mgmtOpLignes().length; if(!n) return; MGMT_OP.ligne=Math.max(0,Math.min(n-1,MGMT_OP.ligne+(d<0?-1:1))); MGMT_OP.message=''; render(); },
  /** ← → sur la ligne choisie. */
  mgmtOpChange(d){
    const l=mgmtOpLignes()[MGMT_OP.ligne]; if(!l||l.action) return;
    if(mgmtReglagesChanger(MGMT_OP.onglet,l.cle,mgmtReglagesPas(MGMT_OP.onglet,l.cle,d))) render();
  },
  mgmtOpChoisir(g,cle,i){
    const l=(MGMT_OP_LIGNES[g]||[]).find(x=>x.cle===cle); if(!l||!l.choix||!l.choix[i]) return;
    MGMT_OP.ligne=(MGMT_OP_LIGNES[g]||[]).indexOf(l);
    mgmtReglagesChanger(g,cle,l.choix[i][0]); render();
  },
  mgmtOpNiveau(g,cle,v){
    const l=(MGMT_OP_LIGNES[g]||[]).find(x=>x.cle===cle); if(!l) return;
    MGMT_OP.ligne=MGMT_OP_LIGNES[g].indexOf(l);
    /* Un clic sur le dernier bloc allumé l'éteint : on peut descendre à 0 à la souris. */
    mgmtReglagesChanger(g,cle,MGMT_REGLAGES[g][cle]===v?v-1:v); render();
  },
  /** R : les réglages d'origine de l'onglet. */
  mgmtOpRaz(){ if(MGMT_REGLAGES_ORIGINE[MGMT_OP.onglet]){ mgmtReglagesRaz(MGMT_OP.onglet); render(); } },
  mgmtOpAction(cle){
    const m=G&&G.mgmt; if(!m||MGMT_OP.onglet!=='partie') return;
    if(cle==='sauver'){ saveMgmt(); MGMT_OP.message='Partie sauvegardée.'; render(); }
    else if(cle==='changer'){ saveMgmt(); CL.mgmtParties(); }
    else if(cle==='effacer'){
      saveMgmt(); const n=MGMT_SLOT; CL.mgmtParties();
      if(typeof mgmtSlotPeek==='function'&&mgmtSlotPeek(n)){ MGMT_PARTIES.curseur=n; MGMT_PARTIES.effacer=n; render(); }
    }
  },
  mgmtOpEntree(){
    const l=mgmtOpLignes()[MGMT_OP.ligne];
    if(MGMT_OP.onglet==='partie'&&l) CL.mgmtOpAction(l.cle);
  },
});
keysRegister('mgmt_options',{
  ArrowUp(){ CL.mgmtOpLigne(-1); }, ArrowDown(){ CL.mgmtOpLigne(1); },
  ArrowLeft(){ CL.mgmtOpChange(-1); }, ArrowRight(){ CL.mgmtOpChange(1); },
  Tab(){ CL.mgmtOpOnglet(1); },
  r(){ CL.mgmtOpRaz(); }, R(){ CL.mgmtOpRaz(); },
  Enter(){ CL.mgmtOpEntree(); },
  Escape(){ CL.mgmtOpRetour(); },
});
/* ==== [FIN ANCRE] ==== */
