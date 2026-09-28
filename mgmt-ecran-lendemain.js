"use strict";
/** Une carte du lendemain : le nom et le fait (libellé neutre).
 *  La parole de Clara attend le texte de l'auteur. */
function mgmtTouchedCard(m,t){
  const f=mgmtFighterById(m,t.id);
  const nm=f?f.name:'?';
  let fact;
  if(t.retired) fact=MGMT_FACT_LABELS.retired;
  else if(t.injury&&t.days>0) fact=t.injury+' — '+t.days+' jours';
  else if(t.injury) fact=t.injury;
  else fact=MGMT_FACT_LABELS.susp+' — '+t.days+' jours';
  return `<div class="opp" style="cursor:default"><span class="opp-nm">${esc(nm)}</span>`
    +`<div class="mgmt-meta">${esc(fact)}</div></div>`;
}

function scr_mgmt_lendemain(){
  const m=G&&G.mgmt;
  const touched=m&&m.lastEvent&&Array.isArray(m.lastEvent.touched)?m.lastEvent.touched:[];
  if(!m||touched.length===0){
    return scr_mgmt_bureau();
  }
  const cards=touched.map(t=>mgmtTouchedCard(m,t)).join('');
  return `<div class="scr mgmt-wrap"><div class="mgmt-head bar">`
    +`<div><div class="eyebrow gold">Split — Management</div>`
    +`<h2 class="disp">Le lendemain</h2></div></div>`
    +`<div class="mgmt-cols" style="grid-template-columns:minmax(0,1fr)">`
    +`<div class="mgmt-col">${cards}`
    +`<button class="mgmt-next" onclick="CL.mgmtLendemainNext()">Continuer</button></div>`
    +`</div></div>`;
}
/* ==== [FIN ANCRE] ==== */
