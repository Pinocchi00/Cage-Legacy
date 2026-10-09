"use strict";
/* ==== [ANCRE: MGMT_LOT3A_SOIREE] — Lot 3a le corps et la soirée ;
   Lot 3 T4 : lecture ou simulation des combats depuis leurs traces.
   écran de soirée (quatre lignes — deux noms, vainqueur, famille, round ;
   ni res.detail, ni statistiques, ni note, ni étiquette — addendum 2 §6) lu
   dans m.lastEvent calculé en une fois (recharger ne rejoue rien), puis le
   lendemain (une carte par combattant touché, du plus grave au moins grave,
   avec l'emplacement vide de Clara — aucune réplique générique pour
   combler, personne touché : pas de lendemain). Le traumatisme ne paraît
   dans aucun DOM. Souris et clavier (ui-11-keys.js, jamais exclusif). ==== */
/* ==== [ANCRE: MGMT_LOT3_T4_SOIREE] — Trois parcours de soirée, trace de
   navigation non persistée ; le résultat appartient exclusivement au moteur. ==== */
/* Lot 1 du brief démo (09/10/2026) : le combat où le joueur s'est arrêté est gardé dans la partie (m.lastEvent.vu), pour qu'une soirée interrompue se rouvre là où elle a été laissée. */
function mgmtSoireeNeuve(i){
  let v=Number.isSafeInteger(i)&&i>0?i:0;
  return {get index(){ return v; },set index(n){
    v=n;
    const e=typeof G!=='undefined'&&G&&G.mgmt&&G.mgmt.lastEvent;
    if(e&&Number.isSafeInteger(n)&&n>=0&&e.vu!==n){ e.vu=n; if(typeof saveMgmt==='function') saveMgmt(); }
  }};
}
let MGMT_SOIREE=mgmtSoireeNeuve(0);
/** Une soirée est en cours quand elle a été simulée et que la semaine n'a pas encore avancé. Pur. */
function mgmtSoireeEnCours(m){
  return !!(m&&m.cal&&m.cal.actif===true&&m.lastEvent&&Array.isArray(m.lastEvent.fights)&&m.lastEvent.fights.length>0&&m.lastEvent.cycle===m.cycle);
}
/** Reprend une soirée interrompue : le combat gardé, jamais au-delà du dernier. */
function mgmtSoireeReprendre(m){
  const n=m.lastEvent.fights.length, vu=Number.isSafeInteger(m.lastEvent.vu)?m.lastEvent.vu:0;
  MGMT_SOIREE=mgmtSoireeNeuve(Math.max(0,Math.min(n,vu)));
}
function mgmtSoireeTrace(m,i){
  const e=m&&m.lastEvent, f=e&&e.fights[i];
  if(!f||!Array.isArray(m.hist)) return null;
  /* L'historique est append-only et conserve l'ordre de la soirée, y compris
     lorsqu'une paire se retrouve plusieurs cycles plus tard. */
  const memes=m.hist.filter(t=>t.c===e.cycle), traces=memes.slice(Math.max(0,memes.length-e.fights.length));
  return traces[i]&&traces[i].a.id===f.a&&traces[i].b.id===f.b?traces[i]:null;
}
function mgmtSoireeResume(m,i){
  const t=mgmtSoireeTrace(m,i);
  if(!t) return '';
  const res=mgmtReplayFight(t);
  if(!res||!areneVerdictFidele(t,res)) return '';
  return areneMomentsCles(res)
    .map(l=>`<div class="mgmt-meta">${esc(areneTextePublic(l.text))}</div>`).join('');
}
function scr_mgmt_soiree(){
  const m=G&&G.mgmt;
  if(!m||!m.lastEvent||!Array.isArray(m.lastEvent.fights)||m.lastEvent.fights.length===0){
    return scr_mgmt_bureau();
  }
   const rows=m.lastEvent.fights.map((x,i)=>{
    const fa=mgmtFighterById(m,x.a), fb=mgmtFighterById(m,x.b);
    const na=fa?fa.name:'?', nb=fb?fb.name:'?';
    const w=x.winner==='D'?'Nul':(x.winner==='A'?na:nb);
    const fam=MGMT_FAMILY_LABELS[x.family]||x.family;
     const vu=i<MGMT_SOIREE.index;
     return `<div class="opp mgmt-fight" style="cursor:default">`
       +`<span class="opp-nm">${esc(na)} contre ${esc(nb)}</span>`
       +(vu?`<div class="mgmt-meta">${esc(w)} · ${esc(fam)} · Round ${esc(x.round)}</div>${mgmtSoireeResume(m,i)}`:'')
       +`</div>`;
   }).join('');
   const total=m.lastEvent.fights.length, index=MGMT_SOIREE.index;
   const actions=index<total
     ?`<button class="mgmt-next" onclick="CL.mgmtSoireeVoir()">Voir ce combat</button>`
       +`<button class="mgmt-next" onclick="CL.mgmtSoireeSimuler()">Simuler ce combat</button>`
       +`<button class="mgmt-next" onclick="CL.mgmtSoireeToutSimuler()">Tout simuler</button>`
     :`<button class="mgmt-next" onclick="CL.mgmtSoireeNext()">Continuer</button>`;
  return `<div class="scr mgmt-wrap"><div class="mgmt-head bar">`
    +`<div><div class="eyebrow gold">${esc(mgmtOrgNom(m))} — Management</div>`
    +`<h2 class="disp">La soirée</h2></div></div>`
    +`<div class="mgmt-cols" style="grid-template-columns:minmax(0,1fr)">`
    +`<div class="mgmt-col">${rows}`
     +actions+`</div>`
     +`</div></div>`;
}
/* ==== [FIN ANCRE] ==== */
