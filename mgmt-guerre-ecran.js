"use strict";
/* ==== [ANCRE: MONDE57_T1_ECRAN] — Monde lot 57 T1 ==== */
/** Affiche le classement des huit et la rivalité déjà calculée par le lot 45. */
/* ==== [ANCRE: MONDE57_T1_PUISSANCE_AFFICHEE] — Monde lot 57 T1 ==== */
/** Nombre de combattants de l'organisation dans les quinze premiers mondiaux. */
function mgmtGuerrePuissanceTop15(m){
  const compte={};
  if(!m||typeof allDivisions!=='function'||typeof mgmtDivisionRanking!=='function') return compte;
  const splitId=mgmtPredecesseurOrgId(m);
  for(const div of allDivisions()){
    const rangs=mgmtDivisionRanking(m,div.id,'world')||[];
    rangs.slice(0,15).forEach(r=>{
      const local=(m.roster||[]).find(f=>f&&f.id===r.id);
      const fighter=local||(typeof mgmtExteriorCombattant==='function'?mgmtExteriorCombattant(m,r.id):null);
      const orgId=local?splitId:(fighter&&fighter.orgId);
      if(orgId) compte[orgId]=(compte[orgId]||0)+1;
    });
  }
  return compte;
}
/* ==== [FIN ANCRE] ==== */
function scr_mgmt_guerre(){
  const m=G&&G.mgmt;
  if(!m) return scr_mgmt_bureau();
  const rows=mgmtGuerreClassement(m), split=rows.find(x=>x.estSplit), rival=mgmtRivaleDuMoment(m);
  const puissanceTop15=mgmtGuerrePuissanceTop15(m);
  const lignes=rows.map(x=>{const variation=x.mouvement>0?'▲ +'+x.mouvement:x.mouvement<0?'▼ '+x.mouvement:'＝';const classe=x.mouvement>0?'gu3-hausse':x.mouvement<0?'gu3-baisse':'gu3-stable';return `<div class="gu3-ligne${x.estSplit?' gu3-split':''}"><b>${esc(x.rang)}</b><div><strong>${esc(x.nom.toUpperCase())}${x.id===rival?'<i>TA RIVALE</i>':''}</strong><small>${esc(x.ville)} · DEPUIS ${esc(x.annee)}</small></div><span>${esc(x.niveaux.popularite)}</span><span>${esc(x.niveaux.stade.toLocaleString('fr-FR'))}</span><span>${esc(puissanceTop15[x.id]||0)} du top 15</span><span>${esc(x.niveaux.puissance)}</span><b class="gu3-evolution ${classe}" aria-label="Évolution ${esc(x.mouvement)}">${esc(variation)}</b></div>`;}).join('');
  const raisons=rival?mgmtRivaleRaisons(m,rival).slice(0,3).map(r=>`<li>${esc(r.raison)} · soirée ${esc(r.soiree)}</li>`).join(''):'<li>Aucune rivale ne s’est encore imposée.</li>';
   const orgRivale=rival?mgmtOrgParId(rival):null;
   const maker=rival&&MGMT_MATCHMAKERS&&MGMT_MATCHMAKERS[rival];
    const orgDevant=split&&split.duelSplit.devant?mgmtOrgParId(split.duelSplit.devant):null;
    const orgDerriere=split&&split.duelSplit.derriere?mgmtOrgParId(split.duelSplit.derriere):null;
    const devant=orgDevant&&orgDevant.nom||'Personne';
    const derriere=orgDerriere&&orgDerriere.nom||'Personne';
   /* Proposition de texte joueur, encore à relire ; le fait affiché est le mouvement de rang calculé. */
   const mouvement=split&&split.mouvement||0;
    const phraseMouvement={texte:mouvement>0?`Depuis la dernière soirée, Split a gagné ${mouvement} place${mouvement===1?'':'s'}.`:mouvement<0?`Depuis la dernière soirée, Split a perdu ${Math.abs(mouvement)} place${mouvement===-1?'':'s'}.`:'Depuis la dernière soirée, Split garde sa place.',relu:false};
     const html=`<main class="mf-contenu gu3">${typeof mgmtOrgOnglets==='function'?mgmtOrgOnglets(m,'mgmt_guerre'):''}<header><h1>LE CLASSEMENT DES HUIT</h1><p>SPLIT · ${split?split.rang:'—'}e DES HUIT</p></header><section class="gu3-table"><div class="gu3-entete"><span>RANG</span><span>ORGANISATION</span><span>POP.</span><span>SALLE</span><span>NOTORIÉTÉ</span><span>PUISSANCE</span><span>ÉVOLUTION</span></div>${lignes}</section><aside class="gu3-rivale"><h2>TA RIVALE DU MOMENT</h2><h3>${esc(orgRivale?orgRivale.nom.toUpperCase():'AUCUNE POUR L’INSTANT')}</h3><p>Née de ce qui s’est passé depuis janvier :</p><ul>${raisons}</ul>${maker?`<strong>${esc(maker.nom.toUpperCase())}, SON MATCHMAKER</strong><p>« ${esc(maker.phrase)} »</p>`:''}<small>Juste devant : ${esc(devant)} · juste derrière : ${esc(derriere)}</small><p class="gu3-mouvement">${esc(phraseMouvement.texte)}</p></aside></main>`;
  return mfEcran(html,{barre:'jeu',courant:'accueil',m,plaque:'Organisation',libelle:'LA GUERRE AU CLASSEMENT',droite:mgmtOrgNom(m),touches:[{ks:['Échap'],t:'Accueil',onclick:"CL.go('mgmt_accueil')"}]});
}
SCREENS.mgmt_guerre=scr_mgmt_guerre;
keysRegister('mgmt_guerre',{Escape(){CL.go('mgmt_accueil');}});
/* ==== [FIN ANCRE] ==== */
