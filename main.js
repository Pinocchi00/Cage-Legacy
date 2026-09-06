"use strict";
/* CAGE LEGACY — js/main.js
   Point d'entrée : démarre le jeu une fois tous les autres fichiers chargés. */
/* ==== [ANCRE: VALIDATION] — adaptée au schéma RÉEL de SKILLS. Chaque
   compétence est {id,name,rar,fx,desc,tags,fam,key}. rar ∈ C/R/E/L/M
   (barème du plan §18.6). N'empêche jamais le jeu de démarrer : les erreurs
   sont seulement journalisées en console pour diagnostic. */
const RAR_BAND={C:[6,10],R:[12,18],E:[18,26],L:[26,36],M:[40,56]};
function validateSkills(){
  const errs=[], seen=new Set();
  for(const s of SKILLS){
    if(seen.has(s.id)) errs.push(`${s.id} : id dupliqué`);
    seen.add(s.id);
    let total=0;
    for(const k in s.fx){
      if(!ATTR_KEYS.includes(k)) errs.push(`${s.id} : attribut inconnu "${k}"`);
      if(k===CHIN && s.fam!=='gen') errs.push(`${s.id} : chin interdit hors famille génétique`);
      total+=s.fx[k];
    }
    const band=RAR_BAND[s.rar];
    if(band && (total<band[0] || total>band[1])) errs.push(`${s.id} : total ${total}, fourchette ${s.rar}=${band[0]}-${band[1]}`);
    if(!s.desc || s.desc.length<40) errs.push(`${s.id} : descriptif absent ou trop court`);
    if(!s.tags || !s.tags.length) errs.push(`${s.id} : mots-clés manquants`);
  }
  if(errs.length){ console.warn('COMPÉTENCES — '+errs.length+' point(s) à corriger :'); errs.forEach(e=>console.warn(' •',e)); }
  else console.log('Compétences OK ('+SKILLS.length+')');
  return errs;
}
validateSkills();
/* ==== [FIN ANCRE] ==== */
// Remise à zéro complète pour tous les comptes (transition Carrière pure, purge Gauntlet & Faith)
const RESET_KEY = 'cage-legacy-reset-zero-v1';
try {
  if (typeof localStorage !== 'undefined' && !localStorage.getItem(RESET_KEY)) {
    localStorage.clear();
    localStorage.setItem(RESET_KEY, '1');
  }
} catch(e) {}

if(document.getElementById('app')){
  G={screen:'title',theme:'dark',draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:''}};
  setTheme('dark');
  /* ==== [ANCRE: DUEL_LIEN_PARTAGE] — LOT DUEL-03 : ?legend=CODE (nom de
     paramètre conservé — des liens sont peut-être déjà partagés) décode
     désormais via le codec du Duel entre amis (duel-codec.js, chargé avant
     ce fichier) et route directement vers l'écran de sélection du duel
     (duel_home, ui-10-duel.js) avec la légende de l'ami pré-remplie —
     jamais vers l'ancien écran vs_friend, retiré. ==== */
  try{
    const params=new URLSearchParams(location.search);
    const code=params.get('legend');
    if(code){
      const check=decodeDuelCode(code);
      if(check.ok){
        CL.duelEnter();
        G._duelFriendFiche=check.fighter;
        G._duelFriendCode=code.trim();
        G._duelMsg="Légende de ton ami importée depuis le lien.";
      } else {
        // ==== [ANCRE: FEEDBACK_LIEN_AMI] — avant : un lien corrompu ou
        // tronqué (partage SMS/WhatsApp notamment) échouait EN SILENCE — le
        // joueur atterrissait sur le titre sans le moindre message, laissant
        // penser que "le lien ne marche pas" sans aucune piste. Un message
        // clair est maintenant affiché sur l'écran d'accueil. Un code d'une
        // version précédente du codec (ancien CLD1, ou ancien export "Vs
        // Ami" — fonctionnalité retirée) reçoit son propre message, jamais
        // confondu avec "invalide".
        G.screen='title';
        G.bootMsg=check.reason==='version_precedente'
          ? "Ce lien vient d'une version précédente du jeu — demande à ton ami de t'en renvoyer un nouveau depuis son Panthéon (bouton \u00abExporter\u00bb)."
          : "Le lien reçu est corrompu ou incomplet (souvent tronqué par l'appli de messagerie utilisée pour le partager). Demande à ton ami de te renvoyer le bouton \u00abExporter\u00bb depuis son Panthéon, ou de te l'envoyer par un autre moyen (copier-coller direct plutôt qu'un lien cliquable).";
      }
      // Nettoie l'URL pour éviter de ré-importer en boucle à chaque rechargement/partage accidentel
      history.replaceState(null,'',location.pathname);
    }
  }catch(e){
    G.screen='title';
    G.bootMsg="Le lien reçu est invalide ou ton navigateur ne le supporte pas.";
  }
  render();
}
