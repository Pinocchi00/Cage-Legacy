"use strict";
/* ==== [ANCRE: MONDE57_T1_ECRAN] — Monde lot 57 T1 ==== */
/** Affiche le classement des huit et la rivalité déjà calculée par le lot 45. */
function scr_mgmt_guerre(){
  const m=G&&G.mgmt;
  if(!m) return scr_mgmt_bureau();
  const rows=mgmtGuerreClassement(m), split=rows.find(x=>x.estSplit), rival=mgmtRivaleDuMoment(m);
  const lignes=rows.map(x=>`<div class="gu3-ligne${x.estSplit?' gu3-split':''}"><b>${esc(x.rang)}</b><div><strong>${esc(x.nom.toUpperCase())}${x.id===rival?'<i>TA RIVALE</i>':''}</strong><small>${esc(x.ville)} · DEPUIS ${esc(x.annee)}</small></div><span>${esc(x.niveaux.popularite)}</span><span>${esc(x.niveaux.stade.toLocaleString('fr-FR'))}</span><span>${esc(x.niveaux.notoriete)}</span><span>${esc(x.niveaux.puissance)}</span><b>${esc(x.mouvement>0?'+'+x.mouvement:x.mouvement<0?String(x.mouvement):'＝')}</b></div>`).join('');
  const raisons=rival?mgmtRivaleRaisons(m,rival).slice(0,3).map(r=>`<li>${r.raison} · soirée ${esc(r.soiree)}</li>`).join(''):'<li>Aucune rivale ne s’est encore imposée.</li>';
  const maker=rival&&MGMT_MATCHMAKERS[rival];
  const devant=split&&split.duelSplit.devant?mgmtOrgParId(split.duelSplit.devant).nom:'Personne';
  const derriere=split&&split.duelSplit.derriere?mgmtOrgParId(split.duelSplit.derriere).nom:'Personne';
  const html=`<main class="mf-contenu gu3"><header><h1>LE CLASSEMENT DES HUIT</h1><p>SPLIT · ${split?split.rang:'—'}e DES HUIT</p></header><section class="gu3-table"><div class="gu3-entete"><span>RANG</span><span>ORGANISATION</span><span>POP.</span><span>SALLE</span><span>NOTORIÉTÉ</span><span>PUISSANCE</span><span>ÉVOLUTION</span></div>${lignes}</section><aside class="gu3-rivale"><h2>TA RIVALE DU MOMENT</h2><h3>${esc(rival?mgmtOrgParId(rival).nom.toUpperCase():'AUCUNE POUR L’INSTANT')}</h3><p>Née de ce qui s’est passé depuis janvier :</p><ul>${raisons}</ul>${maker?`<strong>${esc(maker.nom.toUpperCase())}, SON MATCHMAKER</strong><p>« ${esc(maker.phrase)} »</p>`:''}<small>Juste devant : ${esc(devant)} · juste derrière : ${esc(derriere)}</small></aside></main>`;
  return mfEcran(html,{barre:'jeu',courant:'accueil',m,plaque:'Organisation',libelle:'LA GUERRE AU CLASSEMENT',droite:mgmtOrgNom(m),touches:[{ks:['Échap'],t:'Accueil',onclick:"CL.go('mgmt_accueil')"}]});
}
SCREENS.mgmt_guerre=scr_mgmt_guerre;
keysRegister('mgmt_guerre',{Escape(){CL.go('mgmt_accueil');}});
/* ==== [FIN ANCRE] ==== */
