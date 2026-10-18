"use strict";
/* ==== [ANCRE: DUO_T59_FICHE] — Monde lot 19 T59 ==== */
function mgmtDuoPartieDe(m,id){
  if(!mgmtDuoActif(m)||!id)return null;
  return [m,...Object.values(m.orgs||{})].find(p=>p&&Array.isArray(p.roster)&&p.roster.some(f=>f&&f.id===id))||null;
}
let MGMT_DUO_FICHE={partie:null,retour:null};
Object.assign(CL,{
  mgmtDuoFiche(id,retourEcran){
    const m=G&&G.mgmt,partie=mgmtDuoPartieDe(m,id);
    if(!m||!partie)return false;
    MGMT_DUO_FICHE={partie:m,retour:retourEcran||G.screen};
    try{G.mgmt=partie;MGMT_FICHE.retour='mgmt_duo_fiche_retour';CL.mgmtFiche(id);return true;}
    catch(e){G.mgmt=m;throw e;}
  },
  mgmtDuoFicheRetour(){
    const {partie,retour}=MGMT_DUO_FICHE;
    try{G.mgmt=partie||G.mgmt;}finally{G.mgmt=partie||G.mgmt;MGMT_DUO_FICHE={partie:null,retour:null};}
    CL.go(retour||'mgmt_duo');
  }
});
SCREENS.mgmt_duo_fiche_retour=()=>{CL.mgmtDuoFicheRetour();return '';};
