"use strict";
/* ==== [ANCRE: MGMT_LOT4_T7_ORGANISATION] — Lot 4 T7 : l'écran de
   l'organisation (docs/LOT-4-LA-PEAU-DU-JEU.md §3 T7 ; maquette 08,
   PARTIELLE). Il ne montre que ce que le code sait déjà :
   - l'effectif de Split : nombre de combattants (hors retraités —
     médicaux comme d'âge, test générique mgmtIsRetired : ils ont quitté
     le vivier), nombre de catégories représentées, et par catégorie le
     nombre de disponibles (mgmtAvailable : ni retraités, ni suspendus)
     et le nombre de combattants de Split dans le TOP 15 MONDIAL — lues
     sur le classement mondial (portée 'world' de mgmtDivisionRanking,
     les 15 premiers, filtrés sur le roster). Le classement de Split ne
     dépasse jamais quinze combattants par catégorie : y lire « classés »
     dirait toujours le même nombre que l'effectif. Le constat factuel
     « effectif trop mince » apparaît quand une catégorie ne permet plus
     de composer un combat — moins de deux disponibles. Tout se dérive à
      la lecture, rien n'est stocké (règle du bureau, CDC §3). Les tuiles
      se rangent en deux groupes titrés, hommes et femmes (les divisions
      H et F d'engine.js) : une catégorie féminine porte son libellé
      « … féminin » (MGMT_DIVISION_FEMININ, mgmt-ecran-carte.js), jamais
      aucun nom inventé.
   - les finances : la trésorerie (m.treasury, entier k$) et les recettes
     nettes des dernières soirées (m.recettes), telles qu'elles existent —
     aucune recette, aucune ligne de soirées.
   - les finances : la trésorerie (m.treasury, entier k$) et les recettes
     nettes des dernières soirées (m.recettes), telles qu'elles existent —
     aucune recette, aucune ligne de soirées.
   Ce qui n'existe pas n'apparaît pas : aucun onglet Contrats ni
   Diffuseur, aucune parole de patron, aucun objectif de saison, aucun
   texte de maquette (§1). Ni note, ni barème, ni jauge (addendum 2 §6).
   esc() sur toute donnée affichée, sans exception. Écran enregistré dans
   SCREENS avec les cinq autres (mgmt-screens.js), clavier inclus — échap
   ramène à la semaine. ==== */
const MGMT_ORG_LABELS={
  back:'← Retour à la semaine',
  effectif:"L'effectif, par catégorie",
  finances:'Les finances',
  treasury:'Trésorerie',
  soirees:'Dernières soirées',
  thin:'effectif trop mince',
  aucun:'Aucun combattant — effectif trop mince',
  hommes:'Hommes',
  femmes:'Femmes',
};

/** L'effectif de Split par catégorie, dérivé à la lecture. Pur.
 *  @returns {Array<{div,name,total,dispo,top15}>} */
function mgmtOrgEffectifRows(m){
  if(!m||!Array.isArray(m.roster)) return [];
  return allDivisions().map(d=>{
    const dans=m.roster.filter(o=>o&&o.div===d.id&&!mgmtIsRetired(o));
    const dispo=dans.filter(o=>mgmtAvailable(m,o)).length;
    /* Combattants de Split dans le top 15 mondial (portée « world »),
       à la lecture : les 15 premiers du classement mondial de la
       catégorie, filtrés sur le roster. La loi unique, jamais un second
       classement. */
    const top15=mgmtDivisionRanking(m,d.id,'world').slice(0,15)
      .filter(r=>dans.some(o=>o.id===r.id)).length;
    return {div:d,total:dans.length,dispo:dispo,top15:top15};
  });
}

/** Un groupe de tuiles (les divisions H ou F d'engine.js), avec son titre. */
function mgmtOrgGroupHtml(m,g,rows){
  const tiles=rows.map(r=>{
    const thin=r.dispo<2;
    const sub=r.total===0
      ?MGMT_ORG_LABELS.aucun
      :r.total+(r.total===1?' combattant, ':' combattants, ')
        +r.top15+' dans le top 15 mondial, '
        +(r.dispo<2?MGMT_ORG_LABELS.thin:r.dispo+(r.dispo===1?' disponible':' disponibles'));
    return `<div class="mgmt-org-cat${thin?' thin':''}"><div class="mgmt-org-nm">${esc(mgmtDivisionLabel(r.div))}</div>`
      +`<div class="mgmt-org-sub">${esc(sub)}</div></div>`;
  }).join('');
  return `<div class="mgmt-org-group"><div class="mgmt-org-hd">${esc(g)}</div>`
    +`<div class="mgmt-org-eff">${tiles}</div></div>`;
}

function mgmtOrgMoneyHtml(m){
  const T=Number.isSafeInteger(m.treasury)?m.treasury:0;
  const recettes=Array.isArray(m.recettes)
    ?m.recettes.filter(r=>Number.isSafeInteger(r)).slice().reverse():[];
  const lignes=`<div class="mgmt-org-money">`
    +`<span class="mgmt-org-pill">${esc(MGMT_ORG_LABELS.treasury)}</span>`
    +`<span class="mgmt-org-val">${esc(T)} k$</span></div>`;
  const soirees=recettes.length>0
    ?`<div class="mgmt-org-money"><span class="mgmt-org-pill">${esc(MGMT_ORG_LABELS.soirees)}</span>`
      +`<span class="mgmt-org-line">${esc(recettes.map(v=>(v>0?'+'+v:String(v))+' k$').join(' · '))}</span></div>`
    :''; /* Aucune soirée jouée : la ligne n'apparaît pas. */
  return lignes+soirees;
}

function scr_mgmt_organisation(){
  if(!G||!G.mgmt) return scr_mgmt_bureau();
  const m=G.mgmt;
  const rows=mgmtOrgEffectifRows(m);
  const total=m.roster.filter(o=>o&&!mgmtIsRetired(o)).length;
  const legs=rows.filter(r=>r.total>0).length;
  /* Deux groupes de tuiles, dans l'ordre d'engine.js : hommes puis femmes. */
  const femmes=rows.filter(r=>r.div.gender==='F');
  const hommes=rows.filter(r=>r.div.gender!=='F');
  const groupes=mgmtOrgGroupHtml(m,MGMT_ORG_LABELS.hommes,hommes)
    +mgmtOrgGroupHtml(m,MGMT_ORG_LABELS.femmes,femmes);
   return `<div class="scr mgmt-wrap mgmt-org"><div class="mgmt-head bar">`
     +`<h2 class="disp">L'organisation</h2><span class="mgmt-week-event">Split ${esc(m.eventsPlayed+1)}</span></div>`
     +`<button class="mgmt-org-retour" onclick="CL.go('mgmt_bureau')">${esc(MGMT_ORG_LABELS.back)}</button>`
     +`<div class="mgmt-cols mgmt-org-cols">`
     +`<section class="mgmt-org-main">`
     +`<h3>${esc(MGMT_ORG_LABELS.effectif)}</h3>`
    +`<div class="mgmt-org-sum">${esc(total)}${esc(total===1?' combattant, ':' combattants, ')}`
      +`${esc(legs)}${esc(legs===1?' catégorie':' catégories')}</div>`
     +groupes+`</section>`
     +`<aside class="mgmt-org-aside"><h3>${esc(MGMT_ORG_LABELS.finances)}</h3>`
     +mgmtOrgMoneyHtml(m)+`</aside></div></div>`;
}
/* ==== [FIN ANCRE] ==== */
