"use strict";
/* ==== [ANCRE: MGMT_BRIEF_DEMO_LOT6_LENDEMAIN] — Brief démo du 09/10/2026, lot 6 : le retour après la soirée.
   Après chaque soirée, blessés ou non, le joueur lit en un écran ce que sa carte a donné : la salle, ce que le public en a pensé et pourquoi,
   ce que la soirée a rapporté ou coûté, ce que cela change pour la popularité. Tout est déjà calculé (m.lastEvent.finance) : aucune règle ne change.
   Peu de chiffres, en gros. Après une carte ratée, le ton est la détermination, jamais l'échec (15/09/2026). Les phrases sont des propositions de
   Claude : relu:false, à réécrire par Anthony. ==== */

const MGMT_LD_CRITERES={
  reclame:{
    ok:{texte:'Le public a eu les combats qu’il réclamait.',relu:false},
    non:{texte:'Les combats réclamés n’ont pas eu lieu.',relu:false},
    neutre:{texte:'Personne ne réclamait de combat ce soir.',relu:false}},
  serres:{
    ok:{texte:'Des combats serrés ou finis avant la limite.',relu:false},
    non:{texte:'Trop de décisions sans relief.',relu:false}},
  noms:{
    ok:{texte:'Des noms connus à l’affiche.',relu:false},
    non:{texte:'Peu de noms connus à l’affiche.',relu:false}},
  determination:{texte:'La salle n’a pas été conquise. Vous savez quoi changer pour la prochaine.',relu:false},
};
const MGMT_LD_SEUIL_CRITERE=0.6;

/** Les trois critères de la satisfaction, une phrase chacun, remplis ou manqués. Pur. @returns {Array<{ok:boolean,texte:string}>} */
function mgmtLendemainCriteres(fin){
  const c=fin&&fin.criteres;
  if(!c) return [];
  const C=MGMT_LD_CRITERES;
  return [
    c.reclames===0?{ok:true,texte:C.reclame.neutre.texte}:(c.reclame>=0.99?{ok:true,texte:C.reclame.ok.texte}:{ok:false,texte:C.reclame.non.texte}),
    c.serres>=MGMT_LD_SEUIL_CRITERE?{ok:true,texte:C.serres.ok.texte}:{ok:false,texte:C.serres.non.texte},
    c.noms>=MGMT_LD_SEUIL_CRITERE?{ok:true,texte:C.noms.ok.texte}:{ok:false,texte:C.noms.non.texte},
  ];
}

/** Les quatre cases de l'écran : la salle, l'argent, la popularité, le public. Pur sur la partie. */
function mgmtLendemainCases(m){
  const f=m.lastEvent&&m.lastEvent.finance;
  if(!f) return null;
  const rec=f.recette, recettes=f.ticketing+f.tv, depenses=f.purses+(f.bonuses||0)+(f.location||0);
  const pop=Number.isFinite(f.popAvant)&&Number.isFinite(f.popApres)?{avant:f.popAvant,apres:f.popApres}:null;
  return {
    salle:Number.isFinite(f.spectateurs)?{v:String(f.spectateurs).replace(/\B(?=(\d{3})+(?!\d))/g,' '),l:[`sur ${f.capacite} places`,f.salle||'']}:{v:'—',l:['',' ']},
    argent:{v:(rec>=0?'+ ':'− ')+mgmtEuros(Math.abs(rec)),l:[`Recettes : ${mgmtEuros(recettes)}`,`Dépenses : ${mgmtEuros(depenses)}`]},
    pop:pop?{v:`${pop.avant} → ${pop.apres}`,l:[pop.apres>pop.avant?`La popularité monte de ${pop.apres-pop.avant}`:(pop.apres<pop.avant?`La popularité baisse de ${pop.avant-pop.apres}`:'La popularité ne bouge pas'),' ']}:{v:'—',l:['',' ']},
    public:Number.isFinite(f.satisfaction)?{score:f.satisfaction,criteres:mgmtLendemainCriteres(f),decu:f.satisfaction<MGMT_SATISFAIT_SEUIL}:null,
  };
}

function mgmtLendemainCaseHtml(titre,v,lignes){
  return mfPanneau(`<div class="mf-fin-t">${esc(titre)}</div><div class="mf-fin-corps"><div class="mf-fin-v" style="font-size:${mfCorps(v,450,104,40)}px">${esc(v)}</div>`
    +`<div class="mf-fin-ls">${lignes.map(x=>`<div>${esc(x)}</div>`).join('')}</div></div>`,'normal','mf-fin-p');
}

function scr_mgmt_lendemain_cadre(){
  const m=G&&G.mgmt, e=m&&m.lastEvent;
  if(!m||!e||!Array.isArray(e.fights)||e.fights.length===0) return scr_mgmt_bureau();
  const c=mgmtLendemainCases(m);
  const nom=mgmtOrgNom(m);
  const pub=c&&c.public
    ?mfPanneau(`<div class="mf-fin-t">LE PUBLIC · ${esc(c.public.score)} SUR 100</div><div class="mf-ld-crit">`
      +c.public.criteres.map(x=>`<div class="mf-ld-c${x.ok?' ok':''}"><i></i><span>${esc(x.texte)}</span></div>`).join('')
      +(c.public.decu?`<div class="mf-ld-det">${esc(MGMT_LD_CRITERES.determination.texte)}</div>`:'')
      +`</div>`,'normal','mf-fin-p mf-ld-pub')
    :mfPanneau(`<div class="mf-fin-t">LE PUBLIC</div><div class="mf-ld-crit"><div class="mf-ld-c"><span>Rien à dire de cette soirée.</span></div></div>`,'normal','mf-fin-p mf-ld-pub');
  const MED=typeof mgmtMediasLendemainHtml==='function'?mgmtMediasLendemainHtml(m):'', PAT=typeof mgmtLendemainPatronHtml==='function'?mgmtLendemainPatronHtml(m):'';
  const change=mfPanneau(`<div class="mf-fin-t" aria-label="${esc(MGMT_LD_LABELS.changes)}">CE QUI CHANGE</div><div class="mf-ld-change mf-ancien">${MED}${mgmtLendemainConstatsHtml(m)||'<div class="mf-eff-aucun">Rien à signaler.</div>'}${PAT}</div>`,'normal','mf-fin-p mf-ld-ch');
  const resultats=mfPanneau(`<div class="mf-fin-t" aria-label="${esc(MGMT_LD_LABELS.results)}">LES RÉSULTATS</div><div class="mf-ld-res mf-ancien mgmt-ld-results">${mgmtLendemainResultatsHtml(m)}<button type="button" class="mgmt-ld-link mgmt-ld-tout" onclick="CL.go('mgmt_soiree')">${esc(MGMT_LD_LABELS.touteLaSoiree)}</button></div>`,'normal','mf-fin-p mf-ld-rp');
  const grille=c
    ?`<div class="mf-fin-grille mf-ld-grille">${mgmtLendemainCaseHtml('LA SALLE',c.salle.v,c.salle.l)}${mgmtLendemainCaseHtml('L’ARGENT',c.argent.v,c.argent.l)}${mgmtLendemainCaseHtml('LA POPULARITÉ',c.pop.v,c.pop.l)}${pub}${change}${resultats}</div>`
    :`<div class="mf-fin-grille mf-ld-grille">${pub}${change}${resultats}</div>`;
  return mfEcran(`<main class="mf-contenu mf-finances" aria-label="Le lendemain de ${esc(nom)} ${esc(m.eventsPlayed)}">${grille}</main>`,{barre:'jeu',courant:'resultats',grise:true,m,plaque:'Le lendemain',libelle:'',droite:`${nom} Fight Night ${m.eventsPlayed}`,
    touches:[{ks:['R'],t:'Voir les résultats',onclick:'CL.mgmtLendemainResultats()'},{ks:['Entrée'],t:`Préparer ${nom} ${m.eventsPlayed+1}`,jaune:true,onclick:'CL.mgmtLendemainNext()'}]});
}
SCREENS.mgmt_lendemain=scr_mgmt_lendemain_cadre;

Object.assign(CL,{
  /** Referme la soirée et ouvre la liste des résultats. */
  mgmtLendemainResultats(){
    if(!G||!G.mgmt) return;
    const m=G.mgmt;
    mgmtAgendaActiver(m);
    mgmtAgendaSuivante(m);
    mgmtNewPile(m);
    saveMgmt();
    MGMT_SU_RE.s=0; MGMT_SU_RE.i=0;
    CL.go('mgmt_resultats');
  },
});
keysRegister('mgmt_lendemain',{
  '1'(){ CL.mgmtLendemainNext(); },
  Enter(){ CL.mgmtLendemainNext(); },
  Escape(){ CL.mgmtLendemainNext(); },
  r(){ CL.mgmtLendemainResultats(); },
  R(){ CL.mgmtLendemainResultats(); },
});
/* ==== [FIN ANCRE] ==== */
