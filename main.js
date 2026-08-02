"use strict";
/* CAGE LEGACY — js/main.js
   Point d'entrée : démarre le jeu une fois tous les autres fichiers chargés. */
/* ==== [ANCRE: VALIDATION] — adaptée au schéma RÉEL de SKILLS. Chaque
   compétence est {id,name,rar,fx,desc,tags,fam,key}. rar ∈ C/R/E/L/M
   (barème du plan §18.6). N'empêche jamais le jeu de démarrer : les erreurs
   sont seulement journalisées en console pour diagnostic. */
const RAR_TOTAL={C:5,R:10,E:15,L:20,M:30};
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
    const attendu=RAR_TOTAL[s.rar];
    if(attendu!=null && total!==attendu) errs.push(`${s.id} : total ${total}, barème ${s.rar}=${attendu}`);
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
      // Nettoie l'URL pour éviter de ré-importer en boucle à chaque rechargement/partage accidentel
      history.replaceState(null,'',location.pathname);
    }
  }catch(e){ /* lien invalide ou navigateur trop ancien — le joueur atterrit simplement sur le titre */ }
  render();
}
