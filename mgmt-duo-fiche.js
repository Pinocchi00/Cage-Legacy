"use strict";
/* ==== [ANCRE: DUO_T59_FICHE] — Monde lot 19 T59 ==== */
function mgmtDuoPartieDe(m,id){
  if(!mgmtDuoActif(m)||!id)return null;
  return [m,...Object.values(m.orgs||{})].find(p=>p&&Array.isArray(p.roster)&&p.roster.some(f=>f&&f.id===id))||null;
}
let MGMT_DUO_FICHE={partie:null,retour:null};
/** Vrai pendant qu'une fiche Duo est ouverte (G.mgmt est alors la partie du combattant) : la barre des sections reste grisée, la seule sortie est le retour. @returns {boolean} */
function mgmtDuoFicheActive(){
  return !!MGMT_DUO_FICHE.partie;
}
Object.assign(CL,{
  mgmtDuoFiche(id,retourEcran){
    const m=G&&G.mgmt,partie=mgmtDuoPartieDe(m,id);
    if(!m||!partie)return false;
    MGMT_DUO_FICHE={partie:m,retour:retourEcran||G.screen};
    try{G.mgmt=partie;CL.mgmtFiche(id);MGMT_FICHE.retour='mgmt_duo_fiche_retour';return true;}   /* le retour se règle APRÈS l'ouverture : mgmtFiche le recalcule à son appel */
    catch(e){G.mgmt=m;MGMT_DUO_FICHE={partie:null,retour:null};throw e;}
  },
  mgmtDuoFicheRetour(){
    const {partie,retour}=MGMT_DUO_FICHE;
    if(partie)G.mgmt=partie;
    MGMT_DUO_FICHE={partie:null,retour:null};
    CL.go(retour||'mgmt_duo');
  }
});
SCREENS.mgmt_duo_fiche_retour=()=>{CL.mgmtDuoFicheRetour();return '';};
