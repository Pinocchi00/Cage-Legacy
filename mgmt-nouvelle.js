"use strict";
/* ==== [ANCRE: MGMT_BRIEF_LOT5_NOUVELLE_PARTIE] — Monde lot 2 T5 : valeurs de
   maquettes/monde/MondeNouvellePartie.dc.html (planche validée par Anthony le 10/10/2026,
   corrigée le même jour). Brief du 06/10/2026, lot 5 : l'écran « Nouvelle partie » (planche
   « Management — Nouvelle partie » du canvas). Dans un emplacement vide, le joueur choisit
   son organisation parmi huit, chacune avec deux points forts et deux points faibles ; Entrée
   crée la partie. Le jeu annonce qu'il crée tout le reste — six ans d'histoire, les
   combattants, les camps, les salles, la presse. « Créer ton organisation » est visible et
   annoncé à venir : il n'ouvre rien. Chaque carte montre la ville, l'année (mgmtOrgIdentite,
   Monde lot 2 T1) et la réputation de son organisation. Les noms des organisations 6 à 8 sont
   des emplacements d'auteur (mgmt-organisations-data.js). ==== */

let MGMT_NOUVELLE={slot:1,i:0,gen:null};
/** Le libellé de l'entrée à venir : celui du brief (le libellé définitif est une question ouverte). */
const MGMT_CREER_ORG_LIBELLE='Créer ton organisation';
const MGMT_CREER_ORG_AVENIR='À venir';
const MF_PLUS_SVG='<svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true" style="flex:none"><path d="M13 4v18M4 13h18" stroke="#E9E6E1" stroke-width="4"></path></svg>';
const MF_MOINS_SVG='<svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true" style="flex:none"><path d="M4 13h18" stroke="#E23A2B" stroke-width="4"></path></svg>';

/** L'aperçu de l'organisation choisie, à la façon d'un écran de club : les chiffres que le jeu lit (corrections du 08/10, lot 12, D6). */
function mgmtNouvelleApercuHtml(o){
  const tuiles=mgmtOrgApercu(o).map(x=>`<div class="mf-org-tuile"><span>${esc(x.k)}</span><b>${esc(x.v)}</b></div>`).join('');
  return `<div class="mf-org-apercu" aria-label="Aperçu de ${esc(o.nom)}"><div class="mf-org-apercu-nom">${esc(o.nom)}</div>${tuiles}</div>`;
}

function mgmtNouvelleOrgHtml(o,i,choisie){
  const idn=mgmtOrgIdentite(o.id);
  const atouts=mgmtOrgAtouts(o.profil);
  /* Monde lot 2 T5 : plus puis contreparties dans une seule colonne, sans intertitre (planche corrigée). */
  const lignes=[...atouts.plus,...atouts.moins]
    .map((t,k)=>`<div class="mf-org-ligne">${k<atouts.plus.length?MF_PLUS_SVG:MF_MOINS_SVG}<div>${esc(t)}</div></div>`).join('');
  const verrou=typeof mgmtDemoActive==='function'&&mgmtDemoActive()&&o.id!==CL_DEMO_ORG;
  const identite=idn?`<div class="mf-org-ville">${esc(mfNet(idn.ville)+' · DEPUIS '+idn.annee)}</div><div class="mf-org-reputation">${esc(idn.reputation)}</div>`:'';
  const tete=`<div class="mf-org-tete"><div class="mf-org-nom" style="font-size:${o.nom.length>18?30:44}px">${esc(o.nom)}</div>${verrou?'<div class="mf-org-choisie">Verrouillée</div>':(choisie?'<div class="mf-org-choisie">Choisie</div>':'')}</div>`;
  const corps=`<div class="mf-org-corps">${identite}<div class="mf-org-lignes">${lignes}</div></div>`;
  return mfPanneau(tete+corps,choisie?'choisi':'cote','mf-org'+(choisie?' choisie':'')+(o.auteur?' auteur':''),
    `role="button" tabindex="0" aria-pressed="${choisie}" aria-label="${esc(o.nom)}" data-org="${esc(o.id)}" onclick="CL.mgmtNouvelleChoisir(${i})"`);
}

/* ==== [ANCRE: MONDE_LOT1_T3_ECRAN] — Monde lot 1 T3 : pendant la génération des six ans, la zone de contenu de l'écran Nouvelle partie montre le nom de l'organisation, l'année
   en cours de simulation et une barre pleine largeur. Monde lot 2 T7 (décision d'Anthony du 12/10/2026) : deux colonnes — ce qui se passe (frise, compteurs, barre fluide)
   et cinq cartons de lecture ; à la fin, la partie attend le bouton « Entrer dans {org} » : CL.mgmtEnter n'est plus appelé tout seul. ==== */
/** Les cinq cartons de lecture (propositions de Claude, non relues par Anthony). */
const MGMT_NOUVELLE_LECTURES=[
  {titre:'Tu es le matchmaker.',texte:'Tu ne diriges pas l’organisation : tu composes ses soirées. Tu choisis qui combat qui, et tu en réponds devant tout le monde.',relu:false},
  {titre:'Leïla t’aide.',texte:'Ton assistante te propose des combats et dit pourquoi. Tu acceptes, tu refuses, ou tu choisis toi-même dans la liste complète.',relu:false},
  {titre:'Rien n’est inventé.',texte:'Ces six années sont jouées par le même moteur que tes soirées. Les champions, les rivalités, les blessés : tout ce que tu vas lire a eu lieu.',relu:false},
  {titre:'Les marques te guident.',texte:'Un point à côté d’un nom dit qu’il lui est arrivé quelque chose depuis ta dernière visite. Ouvre sa fiche : la marque s’éteint.',relu:false},
  {titre:'Une soirée toutes les cinq semaines.',texte:'Une carte principale de cinq combats, quatre préliminaires. Quand la carte est complète, tu poses la soirée et tu la lances.',relu:false},
];
const MGMT_NOUVELLE_LECTURE_MS=7000;
/** Les minuteurs de l'écran de création : un seul intervalle (les cartons) et une seule image d'animation (la barre). */
const MGMT_GEN_TIMERS={lecture:null,barre:null};
/** Un pas de la barre fluide : rattrape 20 % de l'écart par image, jamais en arrière, jamais au-delà de la cible. */
function mgmtNouvelleBarreSuivante(aff,cible){
  const c=Math.max(0,Math.min(100,cible));
  if(aff>=c) return aff;
  const s=aff+(c-aff)*0.2;
  return (c-s<0.05)?c:s;
}
function mgmtNouvelleCible(g){
  if(g.pret) return 100;
  /* Monde lot 9 T2a : avec les sept autres organisations, la barre compte le passé du joueur puis leurs pas. */
  if(g.monde) return Math.max(0,Math.min(100,100*(g.k+(g.monde.fait/Math.max(1,g.monde.ids.length)))/Math.max(1,g.n+(g.monde.total/Math.max(1,g.monde.ids.length)))));
  return Math.max(0,Math.min(100,100*g.k/Math.max(1,g.n)));
}
/** Les compteurs lus dans la partie en cours de création, à coût nul : soirées, combats, retraites (champions : non lisible à coût nul, donc absent). */
function mgmtNouvelleCompteurs(g){
  const m=g.m;
  let retraites=0;
  if(m&&Array.isArray(m.facts)) for(const f of m.facts) if(f&&f.k==='retired') retraites++;
  return [
    {k:'soirées jouées',v:g.k},
    {k:'combats',v:m&&Array.isArray(m.hist)?m.hist.length:0},
    {k:'retraites',v:retraites},
  ];
}
function mgmtNouvelleGenHtml(g){
  if(!Number.isFinite(g.aff)) g.aff=0;
  const a0=+mgmtPasseAnnee(g.n,0), an=+g.annee;
  const frise=Number.isFinite(a0)?Array.from({length:6},(_,i)=>{
    const y=a0+i, cls=g.pret||y<an?'fait':(y===an?'cours':'');
    return `<div class="mf-genese-an ${cls}">${esc(y)}${cls==='fait'?' ✓':''}</div>`;
  }).join(''):'';
  const compteurs=mgmtNouvelleCompteurs(g).map(c=>`<div class="mf-genese-cpt"><b>${esc(c.v)}</b><span>${esc(c.k)}</span></div>`).join('');
  const lib=g.pret?'Prêt. Six ans d’histoire sont écrits.':`Année ${g.annee} — soirée ${Math.min(g.k,g.n)} sur ${g.n}`;
  const gauche=`<div class="mf-genese-gauche"><div class="mf-genese-nom">${esc(g.org)}</div>`
    +`<div class="mf-genese-texte">Six années à vivre avant ton arrivée</div><div class="mf-genese-frise">${frise}</div>`
    +`<div class="mf-genese-compteurs">${compteurs}</div>`
    +`<div class="mf-genese-barre" role="progressbar" aria-valuemin="0" aria-valuemax="${esc(g.n)}" aria-valuenow="${esc(g.k)}"><b style="width:${g.aff.toFixed(2)}%"><i class="mf-genese-lueur"></i></b></div>`
    +`<div class="mf-genese-texte">${esc(lib)}</div></div>`;
  const L=MGMT_NOUVELLE_LECTURES, i=((g.lec||0)%L.length+L.length)%L.length;
  const pastilles=L.map((_,j)=>`<button type="button" class="mf-lecture-pastille${j===i?' actif':''}" aria-label="Carton ${j+1} sur ${L.length}" onclick="CL.mgmtNouvelleLecture(${j})">${j+1}</button>`).join('');
  const droite=`<div class="mf-genese-droite"><div class="mf-lecture-entete">Pendant que ça charge, ce qu’il faut savoir</div>`
    +`<div class="mf-lecture-carton"><div class="mf-lecture-titre">${esc(L[i].titre)}</div><div class="mf-lecture-texte">${esc(L[i].texte)}</div></div>`
    +`<div class="mf-lecture-pastilles">${pastilles}</div>`
    +(g.pret?`<div class="mf-genese-entree">${mfBouton('Entrer dans '+g.org,{touche:'Entrée',jaune:true,onclick:'CL.mgmtNouvelleEntrer()'})}</div>`:'')
    +`</div>`;
  const contenu=`<div class="mf-genese" role="status" aria-live="polite">${gauche}${droite}</div>`;
  return mfEcran(contenu,{barre:'logo',plaque:'Management',libelle:'Nouvelle partie',
    touches:[{ks:['Échap'],t:'Abandonner la création',onclick:'CL.mgmtNouvelleAbandonner()'},{ks:['←','→'],t:'Lire'}]});
}
/** Le mouvement est écrit en script (mgmt-animations.js, décision du 07/10) : la lueur de la barre (coupée sous prefers-reduced-motion) et le fondu de 300 ms du carton. */
function mgmtNouvelleMouvement(fondu){
  try{
    if(typeof document==='undefined') return;
    if(typeof mgmtAnimOk==='function'&&!mgmtAnimOk()) return;
    if(typeof window!=='undefined'&&typeof window.matchMedia==='function'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const l=document.querySelector('.mf-genese-lueur');
    if(l&&!l.dataset.anime&&typeof l.animate==='function'){
      l.dataset.anime='1';
      l.animate([{transform:'translateX(-120px)'},{transform:'translateX(1000px)'}],{duration:1600,iterations:Infinity,easing:'linear'});
    }
    const c=document.querySelector('.mf-lecture-carton');
    if(fondu&&c&&typeof c.animate==='function') c.animate([{opacity:0},{opacity:1}],{duration:300,easing:'ease-out'});
  }catch(e){ /* le mouvement n'est jamais indispensable */ }
}
/** Arrête les minuteurs de l'écran de création. */
function mgmtNouvelleGenNettoyer(){
  if(MGMT_GEN_TIMERS.lecture!==null){ clearInterval(MGMT_GEN_TIMERS.lecture); MGMT_GEN_TIMERS.lecture=null; }
  if(MGMT_GEN_TIMERS.barre!==null){
    if(typeof cancelAnimationFrame==='function') cancelAnimationFrame(MGMT_GEN_TIMERS.barre);
    clearTimeout(MGMT_GEN_TIMERS.barre); MGMT_GEN_TIMERS.barre=null;
  }
}
/** Pose l'unique minuteur des cartons (relancé à chaque choix du joueur). */
function mgmtNouvelleLectureArmer(g){
  if(MGMT_GEN_TIMERS.lecture!==null){ clearInterval(MGMT_GEN_TIMERS.lecture); MGMT_GEN_TIMERS.lecture=null; }
  MGMT_GEN_TIMERS.lecture=setInterval(()=>{
    if(MGMT_NOUVELLE.gen!==g||!G||G.screen!=='mgmt_nouvelle'){ mgmtNouvelleGenNettoyer(); return; }
    g.lec=((g.lec||0)+1)%MGMT_NOUVELLE_LECTURES.length; render(); mgmtNouvelleMouvement(true);
  },MGMT_NOUVELLE_LECTURE_MS);
}
/** La barre : à chaque image, la largeur affichée rattrape la cible ; elle s'arrête, pleine, quand la partie est prête. */
function mgmtNouvelleBarreBoucle(g){
  const image=()=>{
    MGMT_GEN_TIMERS.barre=null;
    if(MGMT_NOUVELLE.gen!==g||!G||G.screen!=='mgmt_nouvelle') return;
    mgmtNouvelleMouvement(false);
    g.aff=mgmtNouvelleBarreSuivante(Number.isFinite(g.aff)?g.aff:0,mgmtNouvelleCible(g));
    const b=typeof document!=='undefined'?document.querySelector('.mf-genese-barre b'):null;
    if(b) b.style.width=g.aff.toFixed(2)+'%';
    if(g.pret&&g.aff>=100) return;
    MGMT_GEN_TIMERS.barre=(typeof requestAnimationFrame==='function')?requestAnimationFrame(image):setTimeout(image,16);
  };
  if(MGMT_GEN_TIMERS.barre!==null) return;
  MGMT_GEN_TIMERS.barre=(typeof requestAnimationFrame==='function')?requestAnimationFrame(image):setTimeout(image,16);
}
/** Un pas : prépare le passé, puis joue une soirée par rafraîchissement ; au dernier, clôt le passé et attend le bouton du joueur. */
function mgmtNouvelleGenPas(){
  const g=MGMT_NOUVELLE.gen;
  if(!g||g.pret) return;
  try{
    if(!g.m){ g.m=mgmtPassePreparer(g.orgId,{soirees:g.n}); }
    else if(g.monde){
      if(mgmtMondeVivantPas(g.monde).termine){ g.pret=true; G.mgmt=null; render(); mgmtNouvelleBarreBoucle(g); return; }
    }
    else{
      const r=mgmtPasseSoiree(g.m,g.k);
      g.k=r.k; g.annee=r.annee;
      if(r.termine){
        mgmtPasseCloturer(g.m);
        /* Monde lot 9 T2a : la création réelle (sans nombre de soirées imposé) fait aussi vivre les sept autres organisations, pas à pas. */
        if(g.avecMonde){ g.monde=mgmtMondeVivantPreparer(g.m,{soirees:g.n}); G.mgmt=null; render(); mgmtNouvelleGenSuite(g); return; }
        g.pret=true; G.mgmt=null;   /* la partie vit dans g.m jusqu au bouton */
        render();
        mgmtNouvelleBarreBoucle(g);
        return;
      }
    }
  }catch(e){
    mgmtNouvelleGenNettoyer();
    MGMT_NOUVELLE.gen=null; if(G) G.mgmt=null;
    render(); return;
  }
  render();
  mgmtNouvelleGenSuite(g);
}
/** Laisse le navigateur peindre la barre, puis fait le pas suivant (s'arrête si la création a été abandonnée). */
function mgmtNouvelleGenSuite(g){
  const pas=()=>setTimeout(()=>{ if(MGMT_NOUVELLE.gen===g) mgmtNouvelleGenPas(); },0);
  if(typeof requestAnimationFrame==='function') requestAnimationFrame(pas); else pas();
}
/* ==== [FIN ANCRE] ==== */

function scr_mgmt_nouvelle(){
  const F=MGMT_NOUVELLE;
  if(F.gen) return mgmtNouvelleGenHtml(F.gen);
  if(!Number.isSafeInteger(F.i)||F.i<0||F.i>=MGMT_ORGANISATIONS.length) F.i=0;
  const cartes=MGMT_ORGANISATIONS.map((o,i)=>mgmtNouvelleOrgHtml(o,i,i===F.i)).join('');
  const avenir=`<div class="mf-org-avenir" aria-disabled="true"><span>${esc(MGMT_CREER_ORG_LIBELLE)}</span><span class="mf-puce">${esc(MGMT_CREER_ORG_AVENIR)}</span></div>`;
  const contenu=`<div class="mf-nouvelle"><div class="mf-org-grille">${cartes}</div>${mgmtNouvelleApercuHtml(MGMT_ORGANISATIONS[F.i])}`
    +`<div class="mf-nouvelle-pied"><div class="mf-nouvelle-texte">Le jeu crée tout le reste pour cette partie : six ans d’histoire, les combattants, les camps, les salles, la presse.</div>`
    +`<div class="mf-nouvelle-droite">${avenir}`
    +mfBouton('Créer la partie',{touche:'Entrée',jaune:true,onclick:'CL.mgmtNouvelleLancer()'})+`</div></div></div>`;
  return mfEcran(contenu,{barre:'logo',plaque:'Management',libelle:'Nouvelle partie · choisis ton organisation',
    droite:'Emplacement '+F.slot+' · '+MGMT_ORGANISATIONS.length+' organisations',
    touches:[{ks:['Échap'],t:'Retour aux emplacements',onclick:'CL.mgmtNouvelleRetour()'},{ks:['↑','↓','←','→'],t:'Choisir'},
      {ks:['Entrée'],t:'Créer la partie',jaune:true,onclick:'CL.mgmtNouvelleLancer()'}]});
}
SCREENS.mgmt_nouvelle=scr_mgmt_nouvelle;

Object.assign(CL,{
  /** Ouvre l'écran de choix pour l'emplacement vide `slot`. */
  mgmtNouvelle(slot){
    if(!G) G={theme:'dark'};
    MGMT_NOUVELLE={gen:null,slot:mgmtSlotValide(slot)?slot:1,i:typeof mgmtDemoActive==='function'&&mgmtDemoActive()?Math.max(0,MGMT_ORGANISATIONS.findIndex(o=>o.id===CL_DEMO_ORG)):0};
    CL.go('mgmt_nouvelle');
  },
  mgmtNouvelleChoisir(i){ if(MGMT_NOUVELLE.gen) return; if(Number.isSafeInteger(i)&&i>=0&&i<MGMT_ORGANISATIONS.length){ MGMT_NOUVELLE.i=i; render(); } },
  /** Une grille de quatre colonnes sur deux rangées : ← → d'un cran, ↑ ↓ d'une rangée. */
  mgmtNouvelleDeplacer(dx,dy){
    if(MGMT_NOUVELLE.gen) return;
    const n=MGMT_ORGANISATIONS.length, col=4;
    let i=MGMT_NOUVELLE.i;
    if(dx) i=(i+dx+n)%n;
    if(dy){ const j=i+dy*col; i=(j>=0&&j<n)?j:(j<0?i:i%col); }
    MGMT_NOUVELLE.i=i; render();
  },
  mgmtNouvelleRetour(){ if(MGMT_NOUVELLE.gen){ if(MGMT_NOUVELLE.gen.pret) CL.mgmtNouvelleAbandonner(); return; } mgmtNouvelleGenNettoyer(); CL.go('mgmt_parties'); },
  /** Crée la partie de l'organisation choisie dans l'emplacement. */
  mgmtNouvelleCreer(){
    if(MGMT_NOUVELLE.gen) return;
    const o=MGMT_ORGANISATIONS[MGMT_NOUVELLE.i];
    if(typeof mgmtDemoActive==='function'&&mgmtDemoActive()&&o&&o.id!==CL_DEMO_ORG) return;   /* lot 10 T3 : une organisation verrouillée ne se crée pas */
    if(o) CL.mgmtEnter(MGMT_NOUVELLE.slot,o.id);
  },
  /** Monde lot 1 T3 : le geste du joueur (bouton, Entrée) — la partie naît avec ses six ans de passé, la barre avance pas à pas.
   *  mgmtNouvelleCreer (ci-dessus) reste la création immédiate, sans passé, pour les tests et les outils. */
  mgmtNouvelleLancer(){
    if(MGMT_NOUVELLE.gen) return;
    const o=MGMT_ORGANISATIONS[MGMT_NOUVELLE.i];
    if(!o) return;
    if(typeof mgmtDemoActive==='function'&&mgmtDemoActive()&&o.id!==CL_DEMO_ORG) return;
    if(MGMT_NOUVELLE.soirees===0){ CL.mgmtNouvelleCreer(); return; }   /* soirees:0 = une partie sans passé (tests, outils) */
    const n=Number.isSafeInteger(MGMT_NOUVELLE.soirees)&&MGMT_NOUVELLE.soirees>0?MGMT_NOUVELLE.soirees:MGMT_PASSE_SOIREES;
    MGMT_NOUVELLE.gen={slot:MGMT_NOUVELLE.slot,orgId:o.id,org:o.nom,n,k:0,annee:mgmtPasseAnnee(n,0),m:null,
      avecMonde:MGMT_NOUVELLE.monde===true||(MGMT_NOUVELLE.monde!==false&&MGMT_NOUVELLE.soirees===undefined)};   /* Monde lot 9 T2a : les sept organisations vivantes accompagnent la création réelle */
    render();
    mgmtNouvelleLectureArmer(MGMT_NOUVELLE.gen);
    mgmtNouvelleBarreBoucle(MGMT_NOUVELLE.gen);
    mgmtNouvelleGenSuite(MGMT_NOUVELLE.gen);
  },
  /** Monde lot 2 T7 : le carton `i` ; le minuteur des cartons repart de zéro. */
  mgmtNouvelleLecture(i){
    const g=MGMT_NOUVELLE.gen; if(!g||!Number.isSafeInteger(i)) return;
    const n=MGMT_NOUVELLE_LECTURES.length;
    g.lec=((i%n)+n)%n;
    mgmtNouvelleLectureArmer(g); render(); mgmtNouvelleMouvement(true);
  },
  mgmtNouvelleLectureDelta(d){ const g=MGMT_NOUVELLE.gen; if(g) CL.mgmtNouvelleLecture((g.lec||0)+d); },
  /** La partie est prête : le bouton (ou Entrée) l'ouvre. */
  mgmtNouvelleEntrer(){
    const g=MGMT_NOUVELLE.gen;
    if(!g||!g.pret||!g.m) return;
    const m=g.m, slot=g.slot;
    mgmtNouvelleGenNettoyer();
    MGMT_NOUVELLE.gen=null; G.mgmt=null;
    CL.mgmtEnter(slot,undefined,{partie:m});
  },
  /** Échap pendant la création (ou une fois prête) : abandon propre, retour au choix des organisations. */
  mgmtNouvelleAbandonner(){
    if(!MGMT_NOUVELLE.gen) return;
    mgmtNouvelleGenNettoyer();
    MGMT_NOUVELLE.gen=null; if(G) G.mgmt=null;
    render();
  },
});
keysRegister('mgmt_nouvelle',{
  ArrowLeft(){ if(MGMT_NOUVELLE.gen) CL.mgmtNouvelleLectureDelta(-1); else CL.mgmtNouvelleDeplacer(-1,0); },
  ArrowRight(){ if(MGMT_NOUVELLE.gen) CL.mgmtNouvelleLectureDelta(1); else CL.mgmtNouvelleDeplacer(1,0); },
  ArrowUp(){ CL.mgmtNouvelleDeplacer(0,-1); },
  ArrowDown(){ CL.mgmtNouvelleDeplacer(0,1); },
  Enter(){ if(MGMT_NOUVELLE.gen){ CL.mgmtNouvelleEntrer(); return; } CL.mgmtNouvelleLancer(); },
  Escape(){ if(MGMT_NOUVELLE.gen){ CL.mgmtNouvelleAbandonner(); return; } CL.mgmtNouvelleRetour(); },
});
/* ==== [FIN ANCRE] ==== */
