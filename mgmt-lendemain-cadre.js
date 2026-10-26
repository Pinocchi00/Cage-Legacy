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
  determination:{texte:'La salle n’a pas été conquise. Tu sais quoi changer pour la prochaine.',relu:false},
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

/* ==== [ANCRE: FID79_TITRES_CADRES] — Fidélité lendemain, lot 79 ==== */
function mgmtLendemainTitreHtml(titre){
  return `<div class="ld79-heading"><h2>${esc(titre)}</h2><i class="ld79-trait" aria-hidden="true"></i></div>`;
}
function mgmtLendemainEnteteHtml(m){
  const jour=typeof mgmtSoireeJour==='function'?mgmtSoireeJour(m,m.eventsPlayed):null;
  const date=Number.isSafeInteger(jour)&&typeof mgmtJourDate==='function'?mgmtJourDate(jour):null;
  const dateTexte=date?`${['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'][new Date(date.ts).getUTCDay()]} ${date.jour} ${date.mois.toLocaleLowerCase('fr')}`:'';
  return `<div class="ld74-entete"><span>${esc(dateTexte)}</span><strong>${esc(mgmtOrgNom(m))} FIGHT NIGHT <b>${esc(m.eventsPlayed+1)}</b></strong></div>`;
}
/* ==== [FIN ANCRE] ==== */

function scr_mgmt_lendemain_cadre(){
  const m=G&&G.mgmt, e=m&&m.lastEvent;
  if(!m||!e||!Array.isArray(e.fights)||e.fights.length===0) return scr_mgmt_bureau();
  const c=mgmtLendemainCases(m);
  const nom=mgmtOrgNom(m);
  const enteteDroite=mgmtLendemainEnteteHtml(m);
  const moments=typeof mgmtLendemainMomentsCompletsHtml==='function'?mgmtLendemainMomentsCompletsHtml(m):'';
  const publicHtml=c&&c.public?`<div class="ld66-number"><b>Le public</b><strong>${esc(c.public.score)} / 100</strong></div>`:'';
  const chiffres=c?mfPanneau(`${mgmtLendemainTitreHtml('LES CHIFFRES')}<div class="ld79-scroll"><div class="ld66-number"><b>La salle</b><strong>${esc(c.salle.v)} / ${esc(e.finance.capacite||'—')}</strong></div><div class="ld66-number"><b>L’argent</b><strong>${esc(c.argent.v)}</strong></div><div class="ld66-number"><b>La popularité</b><strong>${esc(c.pop.v)}</strong></div>${publicHtml}<button class="ld79-suite-link" onclick="CL.mgmtLendemainSuite()">${mfTouche('↓')}<span>La presse, les mouvements, tous les résultats</span></button><details class="ld79-finance"><summary>Les détails</summary>${c.salle.l.concat(c.argent.l,c.pop.l).filter(x=>x.trim()).map(x=>`<p>${esc(x)}</p>`).join('')}</details></div>`,'normal','ld66-numbers ld79-panel'):'';
  const change=mgmtLendemainConstatsHtml(m)||'<p>Rien à signaler.</p>';
  const presse=typeof mgmtLendemainPresseHtml==='function'?mgmtLendemainPresseHtml(m):'';
  const chapeau=typeof mgmtLendemainDiscoursHtml==='function'?mgmtLendemainDiscoursHtml(m):'';
  return mfEcran(`<main class="mf-contenu ld66-screen ld79-screen" aria-label="Le lendemain de ${esc(nom)} ${esc(m.eventsPlayed)}"><section class="ld66-moments">${moments}</section><div class="ld66-lower">${mfPanneau(`${mgmtLendemainTitreHtml('CE QUE ÇA CHANGE POUR TOI')}<div class="ld79-scroll">${change}</div>`,'normal','ld66-change ld79-panel')}${mfPanneau(`<h2>CAGE HEBDO · LA UNE</h2><div class="ld79-scroll">${presse}${chapeau}</div>`,'normal','ld66-press ld79-panel')}${chiffres}</div></main>`,{barre:'jeu',courant:'resultats',prise:false,m,plaque:'Le lendemain',libelle:`${nom} Fight Night ${m.eventsPlayed}`,droiteHtml:enteteDroite,
    touches:[{ks:['R'],t:'Revoir un moment',onclick:'CL.mgmtLendemainRevoirSelectionne()'},{ks:['↓'],t:'La suite',onclick:'CL.mgmtLendemainSuite()'},{ks:['Tab'],t:'Bloc suivant',onclick:'CL.mgmtLendemainSuite()'},{ks:['Entrée'],t:`Préparer ${nom} Fight Night ${m.eventsPlayed+1}`,jaune:true,onclick:'CL.mgmtLendemainNext()'}]});
}
SCREENS.mgmt_lendemain=scr_mgmt_lendemain_cadre;

/* ==== [ANCRE: MONDE54_T1_LENDEMAIN_SUITE_ECRAN] — Monde lot 54 T1 ==== */
/** Seconde vue du lendemain : presse, mouvements puis carte complète. */
function scr_mgmt_lendemain_suite(){
  const m=G&&G.mgmt, e=m&&m.lastEvent;
  if(!m||!e||!Array.isArray(e.fights)||e.fights.length===0) return scr_mgmt_bureau();
  const nom=mgmtOrgNom(m);
  return mfEcran(`<main class="mf-contenu ld66-suite ld79-screen"><div class="ld3-suite-screen">${mgmtLendemainSuiteHtml(m)}</div></main>`,{
    barre:'jeu',courant:'resultats',prise:false,m,plaque:'Le lendemain',libelle:'La suite',droiteHtml:mgmtLendemainEnteteHtml(m),
    touches:[{ks:['↑'],t:'Les trois moments',onclick:"CL.go('mgmt_lendemain')"},{ks:['Tab'],t:'Bloc suivant',onclick:"CL.mgmtLendemainBlocSuivant()"},{ks:['Entrée'],t:`Préparer ${nom} ${m.eventsPlayed+1}`,jaune:true,onclick:'CL.mgmtLendemainNext()'}]});
}
SCREENS.mgmt_lendemain_suite=scr_mgmt_lendemain_suite;
/* ==== [FIN ANCRE] ==== */

Object.assign(CL,{
  mgmtLendemainBlocSuivant(){
    const blocs=[...document.querySelectorAll('.ld79-screen .ld79-scroll')];
    if(!blocs.length) return;
    const i=blocs.findIndex(b=>b.contains(document.activeElement)||b===document.activeElement);
    const bloc=blocs[(i+1)%blocs.length];
    bloc.tabIndex=0; bloc.focus();
  },
  mgmtLendemainSuite(){ if(G&&G.mgmt) CL.go('mgmt_lendemain_suite'); },
  mgmtLendemainRevoirSelectionne(){
    const m=G&&G.mgmt;
    if(!m) return;
    const html=mgmtLendemainMomentsCompletsHtml(m), match=html.match(/CL\.mgmtLendemainRevoir\((\d+)\)/);
    if(match) CL.mgmtLendemainRevoir(Number(match[1]));
  },
  /** Referme la soirée et ouvre la liste des résultats. */
  mgmtLendemainResultats(){
    if(!G||!G.mgmt) return;
    const m=G.mgmt;
    mgmtAgendaActiver(m);
    mgmtAgendaSuivante(m);
    mgmtNewPile(m);
    saveMgmt();
    MGMT_SU_RE.s=0; MGMT_SU_RE.i=0; MGMT_SU_RE.vu=null;
    if(typeof mgmtDemoApresSoiree==='function'&&mgmtDemoApresSoiree()) return;
    CL.go('mgmt_resultats');
  },
});
keysRegister('mgmt_lendemain',{
  '1'(){ CL.mgmtLendemainNext(); },
  Enter(){ CL.mgmtLendemainNext(); },
  Escape(){},
  r(){ CL.mgmtLendemainRevoirSelectionne(); },
  R(){ CL.mgmtLendemainRevoirSelectionne(); },
  ArrowDown(){ CL.mgmtLendemainSuite(); },
  Tab(){ CL.mgmtLendemainSuite(); },
});
keysRegister('mgmt_lendemain_suite',{
  ArrowUp(){ CL.go('mgmt_lendemain'); },
  Tab(){ CL.mgmtLendemainBlocSuivant(); },
  Enter(){ CL.mgmtLendemainNext(); },
  Escape(){},
});
/* ==== [FIN ANCRE] ==== */
