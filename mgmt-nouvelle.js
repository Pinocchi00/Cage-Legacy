"use strict";
/* ==== [ANCRE: MGMT_BRIEF_LOT5_NOUVELLE_PARTIE] — Brief du 06/10/2026, lot 5 : l'écran
   « Nouvelle partie » (planche « Management — Nouvelle partie » du canvas). Dans un emplacement
   vide, le joueur choisit son organisation parmi huit, chacune avec deux points forts et deux
   points faibles ; Entrée crée la partie. Le jeu annonce qu'il crée tout le reste — les
   combattants, les camps, les salles, la presse, l'assistante. « Créer ton organisation » est
   visible et annoncé à venir : il n'ouvre rien. Les noms des organisations 6 à 8 sont des
   emplacements d'auteur (mgmt-organisations-data.js). ==== */

let MGMT_NOUVELLE={slot:1,i:0};
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
  const atouts=mgmtOrgAtouts(o.profil);
  const lignes=(titre,liste,svg)=>`<div class="mf-org-bloc"><div class="mf-org-titre">${titre}</div>`
    +liste.map(t=>`<div class="mf-org-ligne">${svg}<div>${esc(t)}</div></div>`).join('')+`</div>`;
  const tete=`<div class="mf-org-tete"><div class="mf-org-nom" style="font-size:${mfCorps(o.nom,choisie?290:380,56,28)}px">${esc(o.nom)}</div>${choisie?'<div class="mf-org-choisie">Choisie</div>':''}</div>`;
  const corps=`<div class="mf-org-corps">${lignes('Les plus',atouts.plus,MF_PLUS_SVG)}${lignes('Les contreparties',atouts.moins,MF_MOINS_SVG)}</div>`;
  return mfPanneau(tete+corps,choisie?'choisi':'cote','mf-org'+(choisie?' choisie':'')+(o.auteur?' auteur':''),
    `role="button" tabindex="0" aria-pressed="${choisie}" aria-label="${esc(o.nom)}" data-org="${esc(o.id)}" onclick="CL.mgmtNouvelleChoisir(${i})"`);
}

function scr_mgmt_nouvelle(){
  const F=MGMT_NOUVELLE;
  if(!Number.isSafeInteger(F.i)||F.i<0||F.i>=MGMT_ORGANISATIONS.length) F.i=0;
  const cartes=MGMT_ORGANISATIONS.map((o,i)=>mgmtNouvelleOrgHtml(o,i,i===F.i)).join('');
  const avenir=`<div class="mf-org-avenir" aria-disabled="true"><span>${esc(MGMT_CREER_ORG_LIBELLE)}</span><span class="mf-puce">${esc(MGMT_CREER_ORG_AVENIR)}</span></div>`;
  const contenu=`<div class="mf-nouvelle"><div class="mf-org-grille">${cartes}</div>${mgmtNouvelleApercuHtml(MGMT_ORGANISATIONS[F.i])}`
    +`<div class="mf-nouvelle-pied"><div class="mf-nouvelle-texte">Le jeu crée tout le reste pour cette partie : les combattants, les camps, les salles, la presse, ton assistante.</div>${avenir}`
    +mfBouton('Créer la partie',{touche:'Entrée',jaune:true,onclick:'CL.mgmtNouvelleCreer()'})+`</div></div>`;
  return mfEcran(contenu,{barre:'logo',plaque:'Management',libelle:'Nouvelle partie · choisis ton organisation',
    droite:'Emplacement '+F.slot+' · '+MGMT_ORGANISATIONS.length+' organisations',
    touches:[{ks:['Échap'],t:'Retour aux emplacements',onclick:'CL.mgmtNouvelleRetour()'},{ks:['↑','↓','←','→'],t:'Choisir'},
      {ks:['Entrée'],t:'Créer la partie',jaune:true,onclick:'CL.mgmtNouvelleCreer()'}]});
}
SCREENS.mgmt_nouvelle=scr_mgmt_nouvelle;

Object.assign(CL,{
  /** Ouvre l'écran de choix pour l'emplacement vide `slot`. */
  mgmtNouvelle(slot){
    if(!G) G={theme:'dark'};
    MGMT_NOUVELLE={slot:mgmtSlotValide(slot)?slot:1,i:0};
    CL.go('mgmt_nouvelle');
  },
  mgmtNouvelleChoisir(i){ if(Number.isSafeInteger(i)&&i>=0&&i<MGMT_ORGANISATIONS.length){ MGMT_NOUVELLE.i=i; render(); } },
  /** Une grille de quatre colonnes sur deux rangées : ← → d'un cran, ↑ ↓ d'une rangée. */
  mgmtNouvelleDeplacer(dx,dy){
    const n=MGMT_ORGANISATIONS.length, col=4;
    let i=MGMT_NOUVELLE.i;
    if(dx) i=(i+dx+n)%n;
    if(dy){ const j=i+dy*col; i=(j>=0&&j<n)?j:(j<0?i:i%col); }
    MGMT_NOUVELLE.i=i; render();
  },
  mgmtNouvelleRetour(){ CL.go('mgmt_parties'); },
  /** Crée la partie de l'organisation choisie dans l'emplacement. */
  mgmtNouvelleCreer(){
    const o=MGMT_ORGANISATIONS[MGMT_NOUVELLE.i];
    if(o) CL.mgmtEnter(MGMT_NOUVELLE.slot,o.id);
  },
});
keysRegister('mgmt_nouvelle',{
  ArrowLeft(){ CL.mgmtNouvelleDeplacer(-1,0); },
  ArrowRight(){ CL.mgmtNouvelleDeplacer(1,0); },
  ArrowUp(){ CL.mgmtNouvelleDeplacer(0,-1); },
  ArrowDown(){ CL.mgmtNouvelleDeplacer(0,1); },
  Enter(){ CL.mgmtNouvelleCreer(); },
  Escape(){ CL.mgmtNouvelleRetour(); },
});
/* ==== [FIN ANCRE] ==== */
