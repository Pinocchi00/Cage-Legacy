"use strict";
/* Brief du 06/10/2026, lot 7 : l'écran Carte est refait sur la planche « Booking » (mgmt-carte-cadre.js). Les tests qui lisent
   le DOM de l'ANCIEN écran de composition (groupes de catégories, case « pour le titre », textes d'état) tournent sur la
   fonction ancienne scr_mgmt_carte, qui reste dans le code avec son clavier d'origine. Le comportement de composition est
   re-testé sur le nouvel écran dans tests/mgmtCarteCadre.test.js. */
const base=require('./loadGame');
function newGameWindow(opts){
  const win=base.newGameWindow(opts);
  win.eval(`SCREENS.mgmt_carte=scr_mgmt_carte;
    keysRegister('mgmt_carte',{ArrowUp(){mgmtKeyCartMove(-1);},ArrowDown(){mgmtKeyCartMove(1);},Enter(){mgmtKeyCartAct();},
      '1'(){CL.mgmtUnbook(0);},'2'(){CL.mgmtUnbook(1);},'3'(){CL.mgmtUnbook(2);},'4'(){CL.mgmtUnbook(3);},'5'(){CL.mgmtUnbook(4);},Escape(){CL.mgmtCarteLeave();}});`);
  return win;
}
module.exports=Object.assign({},base,{newGameWindow});
