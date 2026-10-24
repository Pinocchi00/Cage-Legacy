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
  const contenu=`<main class="mf-contenu di3-scene"><div class="di3-entete"><div class="di3-cartouche">${esc(motif)}</div><div class="di3-contexte">${esc(ton)} · ${esc(d.motif==='principal'?'combat principal':'après le combat')}</div></div><div class="di3-identite">${prenoms?`<div class="di3-prenoms">${esc(prenoms)}</div>`:''}<h1 class="di3-nom">${esc(surnom)}</h1></div><blockquote class="di3-lignes">${d.lignes.map(x=>`<p>${esc(x)}</p>`).join('')}</blockquote>${d.interpelle?`<div class="di3-interpelle">S’ADRESSE À · ${esc(cible&&cible.name||d.interpelle)}</div>`:''}<button type="button" class="di3-suite" onclick="CL.mgmtDiscoursContinuer()">Continuer</button></main>`;
  return mfEcran(contenu,{barre:'jeu',courant:'accueil',grise:true,m,plaque:'Après le combat',droite:mgmtOrgNom(m),touches:[{ks:['Échap','Entrée'],t:'Continuer',jaune:true,onclick:'CL.mgmtDiscoursContinuer()'}]});
}
SCREENS.mgmt_discours=scr_mgmt_discours;
Object.assign(CL,{mgmtDiscoursContinuer(){const f=MGMT_DISCOURS_UI.retour;MGMT_DISCOURS_UI={item:null,retour:null};if(typeof f==='function')f();else CL.go('mgmt_soiree');}});
/* ==== [FIN ANCRE] ==== */
