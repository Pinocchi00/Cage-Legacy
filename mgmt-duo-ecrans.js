"use strict";
/* ==== [ANCRE: MONDE_LOT_19_T7_ECRANS] — Monde lot 19 T7 ==== */
let MGMT_DUO_NOUVELLE={slot:0,etape:'noms',noms:{a:'',b:''},a:null,i:0};
let MGMT_DUO_QG={};

/* ==== [ANCRE: MONDE_LOT_19_T7_NOUVELLE_TEMPORAIRE] — Monde lot 19 T7 ==== */
SCREENS.mgmt_duo_nouvelle=()=>mfEcran('<div class="mf-centre">Bientôt</div>',{barre:'logo',plaque:'Duo'});
Object.assign(CL,{
  mgmtDuoNouvelle(slot){
    MGMT_DUO_NOUVELLE={slot,etape:'noms',noms:{a:'',b:''},a:null,i:0};
    CL.go('mgmt_duo_nouvelle');
  },
});
