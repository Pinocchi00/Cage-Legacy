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
  const lignes=rows.map(x=>{
    const variation=x.mouvement>0?'+'+x.mouvement:x.mouvement<0?String(x.mouvement):'=';
    const classe=x.mouvement>0?'gu3-hausse':x.mouvement<0?'gu3-baisse':'gu3-stable';
    const fleche=x.mouvement?`<svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><path d="${x.mouvement>0?'M11 3l8 12H3z':'M11 19L3 7h16z'}" fill="currentColor"></path></svg>`:'';
    const nom=mfNet(x.nom), largeur=x.id===rival?230:330;
    return `<div class="gu3-ligne${x.estSplit?' gu3-split':''}" role="row"><b role="cell">${esc(x.rang)}</b><div role="cell"><div class="gu82-identite"><strong style="font-size:${mfCorps(nom,largeur,34,24)}px">${esc(nom)}</strong>${x.id===rival?'<i>TA RIVALE</i>':''}</div><small>${esc(x.ville)} · depuis ${esc(x.annee)}</small></div><span role="cell">${esc(x.niveaux.popularite)}</span><span role="cell">${esc(x.niveaux.stade.toLocaleString('fr-FR'))}</span><span role="cell" style="font-size:${mfCorps((puissanceTop15[x.id]||0)+' du top 15',110,32,22)}px">${esc(puissanceTop15[x.id]||0)} du top 15</span><span role="cell">${esc(x.niveaux.puissance)}</span><b class="gu3-evolution ${classe}" role="cell" aria-label="Évolution ${esc(x.mouvement)}">${fleche}<span>${esc(variation)}</span></b></div>`;
  }).join('');
  const raisons=rival?mgmtRivaleRaisons(m,rival).slice(0,3).map(r=>`<li><i class="gu82-oct" aria-hidden="true"></i><div>${esc(r.raison)}<small>Soirée ${esc(r.soiree)}</small></div></li>`).join(''):'';
   const orgRivale=rival?mgmtOrgParId(rival):null;
   const maker=rival&&MGMT_MATCHMAKERS&&MGMT_MATCHMAKERS[rival];
    const orgDevant=split&&split.duelSplit.devant?mgmtOrgParId(split.duelSplit.devant):null;
    const orgDerriere=split&&split.duelSplit.derriere?mgmtOrgParId(split.duelSplit.derriere):null;
    const devant=orgDevant&&orgDevant.nom||'Personne';
    const derriere=orgDerriere&&orgDerriere.nom||'Personne';
   /* Proposition de texte joueur, encore à relire ; le fait affiché est le mouvement de rang calculé. */
   const mouvement=split&&split.mouvement||0;
      const phraseMouvement={texte:mouvement>0?`Rang : +${mouvement} place${mouvement===1?'':'s'}.`:mouvement<0?`Rang : −${Math.abs(mouvement)} place${mouvement===-1?'':'s'}.`:'Rang inchangé.',relu:false};
  /* ==== [ANCRE: FID82_CLASSEMENT_PLANCHE] — Fidélité guerre, lot 82 ==== */
  const titreRivale=orgRivale?mfNet(orgRivale.nom):'AUCUNE POUR L’INSTANT';
  const voisins=`<li><i class="gu82-oct" aria-hidden="true"></i><div>Juste devant : ${esc(devant)}</div></li><li><i class="gu82-oct" aria-hidden="true"></i><div>Juste derrière : ${esc(derriere)}</div></li>`;
  const sansRivale=`<li><i class="gu82-oct" aria-hidden="true"></i><div>Aucune rivale ne s’est encore imposée.</div></li>${voisins}`;
  const tableau=`<div class="gu82-titre"><div><h1>LE CLASSEMENT DES HUIT</h1><i class="gu82-trait" aria-hidden="true"></i></div>${m.eventsPlayed?`<span>APRÈS LA SOIRÉE ${esc(m.eventsPlayed)}</span>`:''}</div><div class="gu3-table" role="table" aria-label="Le classement des huit"><div class="gu3-entete" role="row"><span role="columnheader" aria-label="RANG"></span><span role="columnheader" aria-label="ORGANISATION"></span><span role="columnheader" aria-label="POPULARITÉ (POP.)">POPULARITÉ</span><span role="columnheader">SALLE</span><span role="columnheader">NOTORIÉTÉ</span><span role="columnheader">PUISSANCE</span><span role="columnheader" aria-label="ÉVOLUTION"></span></div><div class="gu82-lignes" role="rowgroup">${lignes}</div></div>`;
  const rivale=`<aside class="gu3-rivale"><h2>TA RIVALE DU MOMENT</h2><h3 style="font-size:${orgRivale?mfCorps(titreRivale,490,76,32):56}px">${esc(titreRivale)}</h3><p>Née de ce qui s’est passé depuis janvier :</p><ul>${orgRivale?raisons:sansRivale}</ul>${maker?`<div class="gu82-maker"><strong>${esc(maker.nom.toUpperCase())}, SON MATCHMAKER</strong><p>« ${esc(maker.phrase)} »</p></div>`:''}<div class="gu82-note"><p>Une rivale peut changer : celle qui te prend le plus le devient.</p>${orgRivale?`<details><summary>${esc(phraseMouvement.texte)}</summary><ul>${voisins}</ul></details>`:`<p class="gu3-mouvement">${esc(phraseMouvement.texte)}</p>`}</div></aside>`;
  const html=`<main class="mf-contenu gu3 gu82"><div class="gu82-onglets">${mgmtOrgOnglets(m,'mgmt_guerre')}<p>Fin d’année : le rang décide du diffuseur, du budget et des agents libres</p></div><div class="gu82-colonnes">${mfPanneau(tableau,'normal','gu82-tableau')}${mfPanneau(rivale,'normal','gu82-rivalite')}</div></main>`;
  const date=mfSoireeInfos(m);
  const entete=`<div class="gu82-entete">${date.dans?`<span>${esc(date.dans)}</span>`:''}${date.date?`<div class="gu82-date"><b>${esc(date.date)}</b>${date.lieu?`<span>${esc(date.lieu)}</span>`:''}</div>`:''}<div class="gu82-soiree"><b>${mfNomSoireeHtml(mgmtOrgNom(m)+' Fight Night',56,'')}</b><b>${esc((m.eventsPlayed||0)+1)}</b></div></div>`;
  const ecran=mfEcran(html,{barre:'jeu',courant:'organisation',m,prise:false,plaque:'Organisation',libelle:`${mgmtOrgNom(m)} · ${split?split.rang:'—'}e DES HUIT`,droiteHtml:entete,touches:[{ks:['Échap'],t:'Accueil',onclick:"CL.go('mgmt_accueil')"},{ks:['Tab'],t:'Onglet'},{ks:['↑','↓'],t:'Choisir'},{ks:['Entrée'],t:'Ouvrir',jaune:true}]});
  // Entrée locale à cet écran : les treize sections communes restent inchangées.
  return ecran.replace('<div class="mf-barre-bas">','<button type="button" class="mf-barre-item cur" data-section="organisation" aria-current="page" onclick="CL.go(\'mgmt_guerre\')"><span>Organisation</span></button><div class="mf-barre-bas">');
  /* ==== [FIN ANCRE] ==== */
}
SCREENS.mgmt_guerre=scr_mgmt_guerre;
keysRegister('mgmt_guerre',{Escape(){CL.go('mgmt_accueil');}});
/* ==== [FIN ANCRE] ==== */
