"use strict";
/* ==== [ANCRE: MGMT_LOT3_T5_HISTORIQUE] — Lot 3 T5 : fiche consultable,
   combats passés et rejeu à partir de leurs traces auto-portantes. ==== */
let MGMT_FICHE={id:null,retour:'mgmt_carte',cursor:0};
function mgmtBureauFicheCard(m,f){
  if(!f) return '';
  return `<div class="opp" style="cursor:default">${mgmtLineCard(f)}`
    +`<button class="mgmt-next" style="width:auto;padding:6px 12px;margin:8px 0 0;font-size:13px" onclick="CL.mgmtFicheParIndex(${m.roster.indexOf(f)})">Voir la fiche</button></div>`;
}
function mgmtHistoriqueHtml(m,f){
  const history=mgmtFightHistory(m,f).slice().reverse();
  if(!history.length) return `<div class="mgmt-meta">Aucun combat enregistré.</div>`;
  return history.map((t,k)=>{
    const i=m.hist.indexOf(t), side=t.a.id===f.id?'A':'B';
    const adversaire=side==='A'?t.b:t.a;
    const issue=t.winner==='D'?'Nul':(t.winner===side?'Victoire':'Défaite');
    /* La trace ne garde que la famille ; le moteur reconstitue le libellé
       exact. En cas de divergence après évolution du moteur, l'issue stockée
       prévaut et aucun résultat rejoué contradictoire n'est affiché. */
    const replay=mgmtReplayFight(t);
    const methode=(replay&&areneVerdictFidele(t,replay))?replay.method:(MGMT_FAMILY_LABELS[t.family]||t.family);
    return `<div class="opp" style="cursor:default${k===MGMT_FICHE.cursor?';border-color:var(--gold-d)':''}">`
      +`<div class="opp-nm">${esc(issue)} · ${esc(adversaire.name)}</div>`
      +`<div class="mgmt-meta">${esc(methode)} · Round ${esc(t.round)} · Cycle ${esc(t.c)}</div>`
      +`<button class="mgmt-next" style="width:auto;padding:6px 12px;margin:8px 0 0;font-size:13px" onclick="CL.mgmtHistoriqueRevoir(${i})">Revoir le combat</button>`
      +`</div>`;
  }).join('');
}
function scr_mgmt_fiche(){
  const m=G&&G.mgmt, f=m&&mgmtFighterById(m,MGMT_FICHE.id);
  if(!f) return scr_mgmt_bureau();
  return `<div class="scr mgmt-wrap"><div class="mgmt-head bar">`
    +`<div><div class="eyebrow gold">Split — Management</div><h2 class="disp">${esc(f.name)}</h2></div>`
    +`<button class="btn ghost" style="width:auto;padding:10px 16px" onclick="CL.mgmtFicheRetour()">← Retour</button></div>`
    +`<div class="mgmt-cols" style="grid-template-columns:minmax(0,1fr) minmax(0,2fr)">`
    +`<div class="mgmt-col">${mgmtCartFicheHtml(m,f,false)}</div>`
    +`<div class="mgmt-col"><div class="eyebrow">Combats</div>${mgmtHistoriqueHtml(m,f)}</div>`
    +`</div></div>`;
}
/* ==== [FIN ANCRE] ==== */
