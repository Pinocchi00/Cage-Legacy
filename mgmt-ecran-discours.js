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
/** La trace du discours, jamais le combattant interpellé à la place de l'adversaire. */
function mgmtDiscoursTrace(m,d){
  if(!m||!d||!d.a||!d.adv) return null;
  const cycle=m.lastEvent&&m.discours&&m.discours.c===m.eventsPlayed?m.lastEvent.cycle:null;
  if(cycle===null) return null;
  for(let i=(m.hist||[]).length-1;i>=0;i--){
    const t=m.hist[i];
    if(t&&t.c===cycle&&t.a&&t.b&&[t.a.id,t.b.id].includes(d.a)&&[t.a.id,t.b.id].includes(d.adv))return {t,i};
  }
  return null;
}
function scr_mgmt_discours(){
  const m=G&&G.mgmt,d=MGMT_DISCOURS_UI.item;
  if(!m||!d) return '';
  const f=mgmtDiscoursNom(m,d.a)||{name:d.a||'Vainqueur'},nom=f.name||f.id||d.a||'';
  const cible=d.interpelle?mgmtDiscoursNom(m,d.interpelle):null;
  const motif={principal:'COMBAT PRINCIPAL', 'co-principal':'CO-PRINCIPAL', surprise:'LA SURPRISE DE LA SOIRÉE','combat-fou':'UN COMBAT FOU'}[d.motif]||'APRÈS LE COMBAT';
  const morceaux=nom.trim().split(/\s+/),surnom=morceaux.pop()||nom,prenoms=morceaux.join(' ');
  const tailleNom=mfCorps(surnom.toUpperCase(),1180,230,22);
  const phrase=d.lignes.join(' '),combat=mgmtDiscoursTrace(m,d),detail=combat?mgmtResultatDetail(m,combat.i):null;
  const adversaire=combat?[combat.t.a,combat.t.b].find(x=>x.id===d.adv):mgmtDiscoursNom(m,d.adv),battu=adversaire&&adversaire.name||d.adv||'Adversaire non renseigné';
  const methode=detail?detail.methode+', '+mgmtRoundTexte(detail):'Résultat détaillé non enregistré';
  const contexte=combat?mgmtDivisionLabel(combat.t.a.div):'Après le combat';
  const echos=combat?(m.fil||[]).filter(x=>x&&x.c===combat.t.c&&x.f===combat.i&&x.a===d.a&&x.k==='presse'&&x.w==='media'&&typeof x.t==='string'&&x.t).slice(-2):[];
  const reactions=echos.length?echos.map(x=>{const media=mgmtMediaDe(x.x);return `<div class="di3-reaction"><b>${esc(media&&media.nom||'PRESSE')}</b><span>${esc(x.t)}</span></div>`;}).join(''):'<p>Aucune réaction enregistrée.</p>';
  const cibleNom=cible&&cible.name||d.interpelle||'';
  const cibleHtml=cibleNom?`<strong style="font-size:${mfCorps(cibleNom.toUpperCase(),382,50,22)}px">${esc(cibleNom)}</strong><p class="di3-interpelle">S’ADRESSE À · ${esc(cibleNom)}</p>`:'<p>Aucun combattant interpellé.</p>';
  const contenu=`<main class="di3-scene"><section class="di3-principal"><div class="di3-entete"><div class="di3-cartouche">${esc(motif)}</div><div class="di3-contexte">${esc(contexte)}</div></div><div class="di3-identite">${prenoms?`<div class="di3-prenoms">${esc(prenoms)}</div>`:''}<h1 class="di3-nom" style="--di3-nom-size:${tailleNom}px">${esc(surnom)}</h1></div><div class="di3-resultat"><strong style="font-size:${mfCorps('BAT '+battu.toUpperCase(),700,48,22)}px">BAT ${esc(battu)}</strong><span>${esc(methode)}</span></div></section><blockquote class="di3-lignes"><span class="di3-guillemet" aria-hidden="true">«</span><div class="di3-citation"><p>${esc(phrase)}</p><div class="di3-micro">Au micro, dans la cage, devant le public</div></div></blockquote><aside class="di3-cote">${mfPanneau(`<h2>IL RÉCLAME</h2>${cibleHtml}`,'normal','di3-panneau')}${mfPanneau(`<h2>DANS LA SALLE</h2>${reactions}`,'normal','di3-panneau')}</aside></main>`;
  return mfEcran(contenu,{barre:'aucune',grise:true,m,touches:[{ks:['Entrée'],t:'Continuer la soirée',jaune:true,onclick:'CL.mgmtDiscoursContinuer()'},...(combat&&mgmtCombatRevoyable(combat.t)?[{ks:['R'],t:'Revoir la fin du combat',onclick:'CL.mgmtDiscoursRevoir()'}]:[]),{ks:['F'],t:`Fiche de ${nom}`,onclick:'CL.mgmtDiscoursFiche()'}]});
}
SCREENS.mgmt_discours=scr_mgmt_discours;
Object.assign(CL,{mgmtDiscoursContinuer(){const f=MGMT_DISCOURS_UI.retour;MGMT_DISCOURS_UI={item:null,retour:null};if(typeof f==='function')f();else CL.go('mgmt_soiree');}});
Object.assign(CL,{
  mgmtDiscoursFiche(){const d=MGMT_DISCOURS_UI.item;if(d&&d.a)CL.mgmtFiche(d.a);},
  mgmtDiscoursRevoir(){
    const combat=mgmtDiscoursTrace(G&&G.mgmt,MGMT_DISCOURS_UI.item);
    if(!combat||!mgmtCombatRevoyable(combat.t))return;
    if(mgmtCombatOuvrir({trace:combat.t,retour:'mgmt_discours',vue:'forts'}))CL.mgmtCbMoment(MGMT_COMBAT.tempsForts.length-1);
  },
});
keysRegister('mgmt_discours',{Enter(){CL.mgmtDiscoursContinuer();},r(){CL.mgmtDiscoursRevoir();},R(){CL.mgmtDiscoursRevoir();},f(){CL.mgmtDiscoursFiche();},F(){CL.mgmtDiscoursFiche();}});
/* ==== [FIN ANCRE] ==== */
