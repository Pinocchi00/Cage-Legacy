"use strict";
/* ==== [ANCRE: P7_T4_ECRAN_DISCOURS] — Monde lot 59 T1 ==== */
let MGMT_DISCOURS_UI={item:null,retour:null};
function mgmtDiscoursEcran(m,discours,continuer){
  if(!m||!discours||!Array.isArray(discours.lignes)) return false;
  MGMT_DISCOURS_UI={item:discours,retour:continuer};
  if(typeof MGMT_REGLAGES!=='undefined'&&MGMT_REGLAGES.soiree&&MGMT_REGLAGES.soiree.sansDiscours) return false;
  CL.go('mgmt_discours');
  return true;
}
function scr_mgmt_discours(){
  const m=G&&G.mgmt,d=MGMT_DISCOURS_UI.item;
  if(!m||!d) return '';
  const f=mgmtDiscoursNom(m,d.a)||{name:d.a||'Vainqueur'},nom=f.name||f.id||d.a||'';
  const cible=d.interpelle?mgmtDiscoursNom(m,d.interpelle):null;
  const ton={fier:'FIER',emu:'ÉMU',provocateur:'PROVOCATEUR',humble:'HUMBLE'}[d.ton]||'APRÈS LE COMBAT';
  const motif={principal:'COMBAT PRINCIPAL', 'co-principal':'CO-PRINCIPAL', surprise:'LA SURPRISE DE LA SOIRÉE','combat-fou':'UN COMBAT FOU'}[d.motif]||'APRÈS LE COMBAT';
  const morceaux=nom.trim().split(/\s+/),surnom=morceaux.pop()||nom,prenoms=morceaux.join(' ');
  const tailleNom=surnom.length<=9?230:surnom.length<=14?170:surnom.length<=20?120:84;
  const phrase=d.lignes.join(' '),adversaire=cible&&cible.name||'son adversaire';
  const contenu=`<main class="di3-scene"><section class="di3-principal"><div class="di3-entete"><div class="di3-cartouche">${esc(motif)}</div><div class="di3-contexte">14 % au pronostic du public · ${esc(d.motif==='principal'?'combat principal':'après le combat')}</div></div><div class="di3-identite">${prenoms?`<div class="di3-prenoms">${esc(prenoms)}</div>`:''}<h1 class="di3-nom" style="--di3-nom-size:${tailleNom}px;overflow-wrap:anywhere;white-space:normal">${esc(surnom)}</h1></div><div class="di3-resultat"><strong>BAT ${esc(adversaire)}</strong><span>le n°1 · décision unanime</span></div><blockquote class="di3-lignes"><span class="di3-guillemet" aria-hidden="true">«</span><p>${esc(phrase)}</p></blockquote><div class="di3-micro">Au micro, dans la cage, devant le public</div></section><aside class="di3-cote"><section class="di3-panneau"><h2>IL RÉCLAME</h2><strong>${esc(adversaire)}</strong><p class="di3-interpelle">S’ADRESSE À · ${esc(adversaire)}</p></section><section class="di3-panneau"><h2>DANS LA SALLE</h2><div class="di3-reaction"><b>LA SALLE</b><span>debout, l’ambiance au maximum</span></div><div class="di3-reaction"><b>${esc(adversaire)}</b><span>sort sans un mot</span></div><div class="di3-reaction"><b>TON ESPOIR</b><span>savoure sa victoire</span></div></section></aside><button type="button" class="di3-suite" onclick="CL.mgmtDiscoursContinuer()">Continuer</button></main>`;
  return mfEcran(contenu,{barre:'aucune',grise:true,m,touches:[{ks:['Entrée'],t:'Continuer la soirée',jaune:true,onclick:'CL.mgmtDiscoursContinuer()'},{ks:['R'],t:'Revoir la fin du combat',onclick:'CL.mgmtDiscoursContinuer()'},{ks:['F'],t:`Fiche de ${nom}`,onclick:`CL.mgmtFiche('${esc(f.id||d.a)}')`}]});
}
SCREENS.mgmt_discours=scr_mgmt_discours;
Object.assign(CL,{mgmtDiscoursContinuer(){const f=MGMT_DISCOURS_UI.retour;MGMT_DISCOURS_UI={item:null,retour:null};if(typeof f==='function')f();else CL.go('mgmt_soiree');}});
/* ==== [FIN ANCRE] ==== */
