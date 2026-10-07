"use strict";
/* ==== [ANCRE: MGMT_BRIEF_LOT6_FICHE] — Brief du 06/10/2026, lot 6 : la Fiche dans le cadre. Une bannière
   au nom du combattant, ses chiffres à gauche, cinq onglets à droite (Aperçu, Style, Combats, Contrat,
   On en dit). Le contenu des onglets réutilise les blocs existants de la fiche (aucun système parallèle) ;
   « Contrat » reste grisé jusqu'au lot 9. Clavier : Tab onglet suivant, ← → autre combattant de la
   catégorie, ↑ ↓ Entrée dans les combats, Entrée sinon prépare son combat, Échap retour. ==== */

const MGMT_FICHE_ONGLETS=[
  {id:'apercu',libelle:'Aperçu'},{id:'style',libelle:'Style'},{id:'combats',libelle:'Combats'},
  {id:'contrat',libelle:'Contrat',contrat:true},{id:'ondit',libelle:'On en dit'},
];

/** « Contrat » n'existe qu'avec l'agenda du joueur (lots 7 et 9) ; avant, il reste grisé. */
function mgmtFicheOngletGrise(o){ return !!o.contrat&&!(G&&G.mgmt&&typeof mgmtContratsActif==='function'&&mgmtContratsActif(G.mgmt)); }

function mgmtFicheOngletCourant(){
  const ids=MGMT_FICHE_ONGLETS.filter(o=>!mgmtFicheOngletGrise(o)).map(o=>o.id);
  if(!ids.includes(MGMT_FICHE.onglet)) MGMT_FICHE.onglet='apercu';
  return MGMT_FICHE.onglet;
}

/** Ses voisins dans la catégorie, dans l'ordre de l'écran Effectif : pour ← →. */
function mgmtFicheVoisins(m,f){
  const l=mgmtEffectifLignes(m,f.div).map(x=>x.f.id);
  return {ids:l,i:l.indexOf(f.id)};
}



/** L'onglet Contrat : les combats du contrat un par un (fait, le prochain, à venir), la bourse fixée à la signature, ce qui se passe ensuite. */
function mgmtFicheContratHtml(m,f){
  if(f.libre) return `<h3>Son contrat</h3><p>Sans contrat : il ne se book plus. Il figure au recrutement.</p>`;
  if(!f.ct) return `<h3>Son contrat</h3><p>Pas de contrat suivi pour ce combattant.</p>`;
  const c=f.ct, lignes=[];
  for(let i=1;i<=c.n;i++){ const etat=i<=c.f?'Fait':(i===c.f+1?'Le prochain':'À venir'); lignes.push(`<div class="mf-ligne${i===c.f+1?' choisie':''}"><span class="mf-ligne-t">Combat ${i}</span><span class="mf-ligne-v">${esc(etat)}</span></div>`); }
  const p=mgmtContratPalier(m,f);
  return `<h3>Son contrat</h3>${lignes.join('')}`
    +`<h3>La bourse</h3><p>${esc(mgmtEuros(c.b))} par combat, fixés à la signature.</p>`
    +`<h3>Ensuite</h3><p>${esc(mgmtContratRestants(f))} combat${mgmtContratRestants(f)>1?'s':''} restant${mgmtContratRestants(f)>1?'s':''} ; sans nouveau contrat, il rejoint les sans-contrat. Le renouvellement se propose dans Contrats.</p>`
    +(p>=1?`<p>${esc(MGMT_CT_PALIERS[p])}.</p>`:'');
}

function mgmtFicheCorpsOnglet(m,f,line,id){
  const identite=mgmtIdentite(m,f);
  if(id==='contrat') return mgmtFicheContratHtml(m,f);
  if(id==='style') return mgmtFicheConnaissance(m,f)+`<h3>Où il combat</h3>${mgmtFicheOctogone(m,f)}`;
  if(id==='combats') return `<h3>Ses derniers combats</h3>${mgmtHistoriqueHtml(m,f)}${mgmtFicheParcours(line.trace)}`;
  if(id==='ondit') return mgmtFicheVie(m,f)+mgmtFichePromesses(m,f)+mgmtFicheRivaux(m,f)+mgmtFicheParole(m,f)+mgmtFicheLien(m,f);
  return mgmtFicheHistoire(identite)+mgmtFicheCorps(m,f)+mgmtFicheCamp(m,f);
}

function scr_mgmt_fiche_cadre(){
  const m=G&&G.mgmt, line=m&&mgmtFicheLigne(m,MGMT_FICHE.id);
  if(!line) return scr_mgmt_bureau();
  const {f}=line, onglet=mgmtFicheOngletCourant(), v=mgmtFicheVoisins(m,f);
  let champion=false; try{ const t=typeof mgmtSplitTitle==='function'?mgmtSplitTitle(m,f.div):null; champion=!!(t&&t.id===f.id); }catch(e){ champion=false; }
  /* Reprise de fidélité du 07/10/2026 : la fiche est celle des planches (voir mgmt-fiche-planche.js) ; son ancien corps, en texte, n'existe plus. */
  const onglets=MGMT_FICHE_ONGLETS.map(o=>mgmtFicheOngletGrise(o)
    ?`<span class="mf-onglet mf-fiche-grise" aria-disabled="true">${esc(o.libelle.toUpperCase())}</span>`
    :`<button type="button" class="mf-onglet${o.id===onglet?' ouvert':''}" aria-pressed="${o.id===onglet}" onclick="CL.mgmtFicheOnglet('${o.id}')">${esc(o.libelle.toUpperCase())}</button>`).join('');
  let corps;
  try{
    corps=onglet==='style'?mgmtFicheStyleHtml(m,f):onglet==='combats'?mgmtFicheCombatsHtml(m,f,line):onglet==='contrat'?mgmtFicheContratPlanche(m,f):onglet==='ondit'?mgmtFicheOnEnDitHtml(m,f):mgmtFicheApercuHtml(m,f,line);
  }catch(e){ corps=`<div class="mf-fi-ligne">${mfPanneau(`<div class="mf-fi-p"><div class="mf-fi-rp">Cette fiche ne se lit pas pour l’instant.</div></div>`,'normal','mf-fi-pan mf-fi-fill')}</div>`; }
  const contenu=`<main class="mf-contenu mf-fiche-cadre mf-fi"><h2 class="mf-sr">${esc(f.name)}</h2>${mgmtFicheBanniereHtml(m,f,champion)}`
    +`<div class="mf-fi-onglets"><div class="mf-fiche-onglets">${onglets}<button type="button" class="mf-onglet mgmt-fiche-retour mf-fiche-retour" onclick="CL.mgmtFicheRetour()">← RETOUR</button></div><div class="mf-fi-tab">${mfTouche('Tab')}<span>Onglet suivant</span></div></div>`
    +`<div class="mf-fi-corps">${corps}</div></main>`;
  return mfEcran(contenu,{barre:'jeu',courant:mfSectionCourante('mgmt_fiche')||'effectif',m,plaque:'Effectif',libelle:'Combattant',compteur:`${Math.max(1,v.i+1)} / ${v.ids.length}`,
    droite:`${mgmtOrgNom(m)} Fight Night ${(m.eventsPlayed||0)+1}`,
    touches:[{ks:['Échap'],t:'Retour',onclick:'CL.mgmtFicheRetour()'},{ks:['←','→'],t:'Autre combattant'},{ks:['Tab'],t:'Onglet',onclick:'CL.mgmtFicheOnglet(1)'},
      {ks:['A','E'],t:'Section'},{ks:['Entrée'],t:onglet==='combats'?'Revoir le combat':'Préparer son combat',jaune:true,onclick:'CL.mgmtFicheEntree()'}]});
}
SCREENS.mgmt_fiche=scr_mgmt_fiche_cadre;

Object.assign(CL,{
  /** Un onglet par son identifiant, ou +1/−1 pour le suivant (les onglets grisés sont sautés). */
  mgmtFicheOnglet(x){
    const ids=MGMT_FICHE_ONGLETS.filter(o=>!mgmtFicheOngletGrise(o)).map(o=>o.id);
    if(typeof x==='number'){ const i=ids.indexOf(mgmtFicheOngletCourant()); MGMT_FICHE.onglet=ids[(i+(x<0?-1:1)+ids.length)%ids.length]; MGMT_FICHE.cursor=0; }
    else if(ids.includes(x)){ MGMT_FICHE.onglet=x; MGMT_FICHE.cursor=0; }
    render();
  },
  /** ← → : le combattant d'avant ou d'après dans sa catégorie. */
  mgmtFicheAutre(delta){
    const m=G&&G.mgmt, f=m&&mgmtFighterById(m,MGMT_FICHE.id); if(!f) return;
    const v=mgmtFicheVoisins(m,f); if(v.i<0||!v.ids.length) return;
    MGMT_FICHE.id=v.ids[(v.i+(delta<0?-1:1)+v.ids.length)%v.ids.length]; MGMT_FICHE.cursor=0; render();
  },
  mgmtFicheCarte(){ CL.go('mgmt_carte'); },
  mgmtFicheEntree(){ if(mgmtFicheOngletCourant()==='combats') CL.mgmtFicheRevoirSelection(); else CL.mgmtFicheCarte(); },
});
keysRegister('mgmt_fiche',{
  Tab(){ CL.mgmtFicheOnglet(1); },
  ArrowLeft(){ CL.mgmtFicheAutre(-1); },
  ArrowRight(){ CL.mgmtFicheAutre(1); },
  ArrowDown(){ CL.mgmtFicheDeplacer(1); },
  ArrowUp(){ CL.mgmtFicheDeplacer(-1); },
  Enter(){ CL.mgmtFicheEntree(); },
  Escape(){ CL.mgmtFicheRetour(); },
});
/* ==== [FIN ANCRE] ==== */
