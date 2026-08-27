"use strict";
/* CAGE LEGACY — state/state-save.js
   Sauvegarde/chargement de la partie en cours (clé localStorage SAVE_KEY +
   backup SAVE_BACKUP_KEY). Dépend de validateSave() (state-validation.js,
   utilisé par parseAndValidate()/hasSave()) et de migrate() (state-migration.js,
   utilisé par load()) : function bodies résolus à l'exécution, donc l'ordre
   de chargement entre fichiers state/*.js n'a pas besoin d'être strict, mais
   ces deux-là doivent exister avant tout appel réel à save()/load(). */

/* ------------------------------ sauvegarde -------------------------------- */
/* ==== [ANCRE: SAVE_GARDE_ARCADE] — bug trouvé : arcade et carrière partageaient
   la MÊME clé de sauvegarde. Démarrer un Gauntlet écrasait la carrière dans
   localStorage ; "Reprendre" (toujours G.screen='hub') rechargeait alors le
   combattant du Gauntlet dans le hub de carrière. Une run Gauntlet ne doit
   jamais toucher au localStorage : il ne survit pas à une fermeture, exactement
   comme un roguelite classique — la vraie carrière reste intacte pendant ce temps. ==== */
/* ==== [ANCRE: SAVE_BACKUP_RECOVERY] — audit "sécurité des sauvegardes" : la clé
   SAVE_KEY était écrite en une seule copie, sans filet — une écriture interrompue
   (fermeture d'onglet pendant le JSON.stringify, quota localStorage dépassé au
   milieu de l'écriture) ou une corruption silencieuse du navigateur perdait la
   carrière entière, sans recours. SAVE_BACKUP_KEY conserve toujours la DERNIÈRE
   version connue-bonne : save() y recopie l'ancien contenu de SAVE_KEY avant
   d'écrire le nouveau (jamais l'inverse — le backup a toujours un combat de
   retard, jamais plus), et load() bascule dessus automatiquement si SAVE_KEY est
   illisible ou ne passe pas validateSave(). Aucune suppression : une ancienne
   sauvegarde invalide reste en place jusqu'à la prochaine écriture réussie,
   restaurable manuellement au besoin. ==== */
const SAVE_KEY='cage-legacy-v3';
const SAVE_BACKUP_KEY=SAVE_KEY+'_backup';
function parseAndValidate(raw){
  if(!raw) return null;
  try{ const parsed=JSON.parse(raw); return validateSave(parsed)?parsed:null; }catch(e){ return null; }
}
function save(){ if(G&&((G.arcade&&G.arcade.active)||G.fantasyActive||G.vsFriendActive||['draft','arcadehub','gameover','fantasy_setup','allstars','vs_friend'].includes(G.screen))) return;
  try{
    const previous=localStorage.getItem(SAVE_KEY);
    if(previous) localStorage.setItem(SAVE_BACKUP_KEY,previous);
    localStorage.setItem(SAVE_KEY,JSON.stringify(G));
  }catch(e){}
}
/* ==== [FIN ANCRE] ==== */
function load(){
  try{
    const primary=parseAndValidate(localStorage.getItem(SAVE_KEY));
    let parsed=primary, usedBackup=false;
    if(!parsed){
      parsed=parseAndValidate(localStorage.getItem(SAVE_BACKUP_KEY));
      if(parsed) usedBackup=true;
    }
    if(!parsed){ G=null; return false; }
    G=migrate(parsed);
    if(!validateState()){ console.error('Sauvegarde corrompue : état irrécupérable.'); G=null; return false; }
    if(usedBackup){ console.warn('Sauvegarde principale illisible ou invalide : restauration automatique depuis la copie de secours.'); save(); }
    return true;
  }catch(e){ console.error('Sauvegarde illisible:',e); G=null; }
  return false;
}
function hasSave(mode){
  try{
    let s=localStorage.getItem(SAVE_KEY);
    let p=s?JSON.parse(s):null;
    if(!validateSave(p)) p=null;
    if(!p){ const b=localStorage.getItem(SAVE_BACKUP_KEY); if(b){ const bp=JSON.parse(b); if(validateSave(bp)) p=bp; } }
    if(p){
      if(mode==='faith') return !!p.faith;
      if(mode==='career') return !p.faith;
      return true;
    }
  }catch(e){}
  return false;
}
function wipe(){ try{ localStorage.removeItem(SAVE_KEY); localStorage.removeItem(SAVE_BACKUP_KEY); }catch(e){} }
