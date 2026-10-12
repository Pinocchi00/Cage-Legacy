"use strict";
/* ==== [ANCRE: MGMT_BRIEF_LOT5_NOUVELLE_PARTIE] — Brief du 06/10/2026, lot 5 : l'écran
   « Nouvelle partie » (planche « Management — Nouvelle partie » du canvas). Dans un emplacement
   vide, le joueur choisit son organisation parmi huit, chacune avec deux points forts et deux
   points faibles ; Entrée crée la partie. Le jeu annonce qu'il crée tout le reste — les
   combattants, les camps, les salles, la presse, l'assistante. « Créer ton organisation » est
   visible et annoncé à venir : il n'ouvre rien. Les noms des organisations 6 à 8 sont des
   emplacements d'auteur (mgmt-organisations-data.js). ==== */

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
  const atouts=mgmtOrgAtouts(o.profil);
  const lignes=(titre,liste,svg)=>`<div class="mf-org-bloc"><div class="mf-org-titre">${titre}</div>`
    +liste.map(t=>`<div class="mf-org-ligne">${svg}<div>${esc(t)}</div></div>`).join('')+`</div>`;
  const verrou=typeof mgmtDemoActive==='function'&&mgmtDemoActive()&&o.id!==CL_DEMO_ORG;
  const tete=`<div class="mf-org-tete"><div class="mf-org-nom" style="font-size:${mfCorps(o.nom,choisie?290:380,56,28)}px">${esc(o.nom)}</div>${verrou?'<div class="mf-org-choisie">Verrouillée</div>':(choisie?'<div class="mf-org-choisie">Choisie</div>':'')}</div>`;
  const corps=`<div class="mf-org-corps">${lignes('Les plus',atouts.plus,MF_PLUS_SVG)}${lignes('Les contreparties',atouts.moins,MF_MOINS_SVG)}</div>`;
  return mfPanneau(tete+corps,choisie?'choisi':'cote','mf-org'+(choisie?' choisie':'')+(o.auteur?' auteur':''),
    `role="button" tabindex="0" aria-pressed="${choisie}" aria-label="${esc(o.nom)}" data-org="${esc(o.id)}" onclick="CL.mgmtNouvelleChoisir(${i})"`);
}

/* ==== [ANCRE: MONDE_LOT1_T3_ECRAN] — Monde lot 1 T3 : pendant la génération des six ans, la zone de contenu de l'écran Nouvelle partie montre le nom de l'organisation, l'année
   en cours de simulation et une barre pleine largeur — aucune fenêtre par-dessus, aucune touche active. ==== */
function mgmtNouvelleGenHtml(g){
  const pct=Math.max(0,Math.min(100,Math.round(100*g.k/Math.max(1,g.n))));
  const contenu=`<div class="mf-genese" role="status" aria-live="polite"><div class="mf-genese-nom">${esc(g.org)} · ${esc(g.annee)}</div>`
    +`<div class="mf-genese-barre" role="progressbar" aria-valuemin="0" aria-valuemax="${esc(g.n)}" aria-valuenow="${esc(g.k)}"><b style="width:${pct}%"></b></div>`
    +`<div class="mf-genese-texte">Création de la partie</div></div>`;
  return mfEcran(contenu,{barre:'logo',plaque:'Management',libelle:'Nouvelle partie',touches:[]});
}
/** Un pas : prépare le passé, puis joue une soirée par rafraîchissement ; au dernier, clôt et ouvre la partie. */
function mgmtNouvelleGenPas(){
  const g=MGMT_NOUVELLE.gen;
  if(!g) return;
  try{
    if(!g.m){ g.m=mgmtPassePreparer(g.orgId,{soirees:g.n}); }
    else{
      const r=mgmtPasseSoiree(g.m,g.k);
      g.k=r.k; g.annee=r.annee;
      if(r.termine){
        mgmtPasseCloturer(g.m);
        const m=g.m, slot=g.slot;
        MGMT_NOUVELLE.gen=null; G.mgmt=null;
        CL.mgmtEnter(slot,undefined,{partie:m});
        return;
      }
    }
  }catch(e){
    MGMT_NOUVELLE.gen=null; if(G) G.mgmt=null;
    render(); return;
  }
  render();
  mgmtNouvelleGenSuite();
}
/** Laisse le navigateur peindre la barre, puis fait le pas suivant. */
function mgmtNouvelleGenSuite(){
  const pas=()=>setTimeout(mgmtNouvelleGenPas,0);
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
    +`<div class="mf-nouvelle-pied"><div class="mf-nouvelle-texte">Le jeu crée tout le reste pour cette partie : les combattants, les camps, les salles, la presse, ton assistante.</div>${avenir}`
    +mfBouton('Créer la partie',{touche:'Entrée',jaune:true,onclick:'CL.mgmtNouvelleLancer()'})+`</div></div>`;
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
  mgmtNouvelleRetour(){ if(MGMT_NOUVELLE.gen) return; CL.go('mgmt_parties'); },
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
    MGMT_NOUVELLE.gen={slot:MGMT_NOUVELLE.slot,orgId:o.id,org:o.nom,n,k:0,annee:mgmtPasseAnnee(n,0),m:null};
    render();
    mgmtNouvelleGenSuite();
  },
});
keysRegister('mgmt_nouvelle',{
  ArrowLeft(){ CL.mgmtNouvelleDeplacer(-1,0); },
  ArrowRight(){ CL.mgmtNouvelleDeplacer(1,0); },
  ArrowUp(){ CL.mgmtNouvelleDeplacer(0,-1); },
  ArrowDown(){ CL.mgmtNouvelleDeplacer(0,1); },
  Enter(){ CL.mgmtNouvelleLancer(); },
  Escape(){ CL.mgmtNouvelleRetour(); },
});
/* ==== [FIN ANCRE] ==== */
