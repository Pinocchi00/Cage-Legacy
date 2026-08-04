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
if(document.getElementById('app')){
  G={screen:'title',theme:'dark',draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:''}};
  setTheme('dark');
  try{
    const params=new URLSearchParams(location.search);
    const code=params.get('legend');
    if(code){
      const legend=decodeLegendCode(code);
      if(legend){ G.importedFriendLegend=legend; G.screen='vs_friend'; }
      else{
        // ==== [ANCRE: FEEDBACK_LIEN_AMI] — avant : un lien corrompu ou
        // tronqué (partage SMS/WhatsApp notamment) échouait EN SILENCE — le
        // joueur atterrissait sur le titre sans le moindre message, laissant
        // penser que "le lien ne marche pas" sans aucune piste. Un message
        // clair est maintenant affiché sur l'écran d'accueil.
        G.screen='title';
        G.lastMsg="Le lien reçu est corrompu ou incomplet (souvent tronqué par l'appli de messagerie utilisée pour le partager). Demande à ton ami de te renvoyer le bouton \u00abExporter\u00bb depuis son Panthéon, ou de te l'envoyer par un autre moyen (copier-coller direct plutôt qu'un lien cliquable).";
      }
      // Nettoie l'URL pour éviter de ré-importer en boucle à chaque rechargement/partage accidentel
      history.replaceState(null,'',location.pathname);
    }
  }catch(e){
    G.screen='title';
    G.lastMsg="Le lien reçu est invalide ou ton navigateur ne le supporte pas.";
  }
  render();
}
