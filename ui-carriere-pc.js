"use strict";
/* ==== [ANCRE: CORR0810_CARRIERE_PC] — Demande d'Anthony du 08/10/2026 : « place chaque écran dans la direction visuelle du jeu ». Les écrans de la Carrière, du Duel et des
   légendes avaient été écrits pour une colonne de 560 px ; en 1920 ils flottaient au milieu d'un écran vide. Cette enveloppe les pose dans la grammaire de la maquette 10 (le
   hub) : en-tête avec l'octogone du retour, titre, contexte du combattant, puis un corps large où le contenu s'agrandit (zoom) et se range en colonnes. Les écrans qui ont leur
   propre mise en page PC (accueil, hub, fiche adversaire, Panthéon, arène) ne sont pas enveloppés. Aucune règle de jeu ici : rendu seulement. ==== */

/** Les écrans qui portent déjà leur mise en page PC, ou qui n'en veulent pas : jamais enveloppés. */
const CAREER_PC_EXCLUS=['title','hub','opponent_card','hof','legend_detail','arena','arene_socle','fight_flash','mgmt_effectif'];
/** Le titre de l'en-tête de chaque écran enveloppé. */
const CAREER_PC_TITRES={
  intro:'Cage Legacy',create:'Création',pro_nickname:'Ton surnom',select:'Choisir un combat',camp:'Camp de préparation',plan:'Plan de combat',press_conf:'Conférence de presse',
  event:'Événement',result:'Résultat',profile:'Bilan technique',rankings:'Classements',ach:'Palmarès',ach_preview:'Succès',history:'Archives',beltLineage:'Ceintures',
  season:'Saison',retire:'Retraite',legacy:'Héritage',codex:'Codex',toptier:'Élite',contract_nego:'Contrat',free_agency:'Agents libres',champ_champ_offer:'Combat des champions',
  promo:'Promotion',class_choice:'Ton style',class_choice_31:'Ton style',mueChoice:'Ton style',fantasy_setup:'Combat de rêve',allstars:'Tournoi des légendes',
  allstars_setup:'Tournoi des légendes',duel_home:'Duel entre amis',duel_launch:'Duel entre amis',duel_series_result:'Résultat de la série',
};
/** L'écran vers lequel l'octogone ramène : le hub tant qu'une carrière est en cours, sinon le menu principal. */
function careerPcRetour(){ return (typeof G!=='undefined'&&G&&G.f&&!G.f.retired)?'hub':'title'; }

/** Enveloppe le contenu d'un écran de la Carrière dans la grammaire de la maquette 10. Pur : renvoie le contenu inchangé pour un écran exclu. */
function careerPcWrap(screen,html){
  if(!screen||CAREER_PC_EXCLUS.includes(screen)||String(screen).indexOf('mgmt_')===0||typeof html!=='string') return html;
  const f=(typeof G!=='undefined'&&G)?G.f:null;
  const retour=careerPcRetour();
  /* Le Duel est une exhibition entre légendes : le combattant de la carrière en cours n'y figure jamais, pas même dans l'en-tête. */
  const contexte=f&&f.name&&String(screen).indexOf('duel')!==0?`${esc(f.name)}${f.divName?' · '+esc(f.divName):''}`:'';
  const titre=CAREER_PC_TITRES[screen]||'Carrière';
  return `<div class="career-screen career-pcshell" data-screen="${esc(screen)}"><header class="career-header">`
    +`<div class="career-heading"><button class="career-home" onclick="CL.go('${retour}')" aria-label="${retour==='hub'?'Retour au vestiaire':'Retour au menu principal'}"><span aria-hidden="true"></span></button><span>${esc(titre)}</span></div>`
    +`<span class="career-context">${contexte}</span></header><div class="career-pc-body">${html}</div></div>`;
}
/* ==== [FIN ANCRE] ==== */
