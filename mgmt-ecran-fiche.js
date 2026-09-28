"use strict";
/* ==== [ANCRE: MGMT_LOT3_T5_HISTORIQUE] — Lot 3 T5 : fiche consultable,
   combats passés et rejeu à partir de leurs traces auto-portantes. ==== */
let MGMT_FICHE={id:null,retour:'mgmt_carte',cursor:0};
/* ==== [ANCRE: MGMT_LOT4_T5_FICHE] — Lot 4 T5 : lecture dérivée, rejeux
   gardés seulement en mémoire par identité de trace ; jamais en sauvegarde. ==== */
const MGMT_FICHE_REJEUX=new WeakMap();
function mgmtFicheRejeu(t){
  if(!MGMT_FICHE_REJEUX.has(t)) MGMT_FICHE_REJEUX.set(t,{replay:mgmtReplayFight(t)});
  return MGMT_FICHE_REJEUX.get(t).replay;
}
function mgmtFicheLigne(m,id){
  const f=mgmtFighterById(m,id);
  if(f) return {f,trace:null};
  const line=Array.isArray(m.exterieur)&&m.exterieur.find(o=>o.id===id);
  if(!line) return null;
  const trace=mgmtExteriorTrace(line,m.cycle);
  if(!trace) return null;
  return {f:{id:line.id,div:line.div,divName:divById(line.div).name,
    name:trace.name,first:trace.first,last:trace.last,age:trace.age,
    W:trace.pro.W,L:trace.pro.L,D:0},trace};
}
function mgmtFicheSituation(m,f,scope){
  const rank=mgmtDivisionRank(m,f,scope);
  if(rank===null) return 'Hors classement';
  return rank===16?'Aux portes du top 15':mgmtRankLabel(rank);
}
function mgmtFicheZones(m,f){
  /* La carte décrit sa forme récente : dix combats au plus, sans limiter
     l'historique ni les liens Revoir. */
  const hist=mgmtFightHistory(m,f).slice(-10), bins=new Map();
  for(const t of hist){
    const side=t.a.id===f.id?'A':'B';
    const entries=mgmtFicheZonesCombat(t,side);
    for(const cell of entries){
      const key=`${cell.col}:${cell.row}`, total=bins.get(key)||{col:cell.col,row:cell.row,presence:0,coince:0};
      total.presence+=cell.presence; total.coince+=cell.coince;
      bins.set(key,total);
    }
  }
  return bins;
}
function mgmtFicheZonesCombat(t,side){
  const replay=mgmtFicheRejeu(t), cached=MGMT_FICHE_REJEUX.get(t);
  if(cached[side]) return cached[side];
  const bins=new Map();
  if(replay&&areneVerdictFidele(t,replay)){
    const session=areneConstruire(replay,{a:t.a.name,b:t.b.name});
    // L'arène fournit les coordonnées : on ne recalcule aucune trajectoire.
    for(let sec=5;sec<=session.dureeCombat;sec+=5){
      const e=areneMoment(session,sec), own=side==='A'?{x:e.ax,y:e.ay}:{x:e.bx,y:e.by};
      const opp=side==='A'?{x:e.bx,y:e.by}:{x:e.ax,y:e.ay};
      const col=Math.max(0,Math.min(6,Math.floor((own.x+ARENE_RV)/(2*ARENE_RV)*7)));
      const row=Math.max(0,Math.min(6,Math.floor((own.y+ARENE_RV)/(2*ARENE_RV)*7)));
      const key=`${col}:${row}`, cell=bins.get(key)||{col,row,presence:0,coince:0};
      cell.presence++;
      if((e.phase==='clinch'&&e.posClinch==='cage'||e.phase==='debout')
        &&areneBordDist(own)<0.75&&areneBordDist(own)<areneBordDist(opp)) cell.coince++;
      bins.set(key,cell);
    }
  }
  cached[side]=Array.from(bins.values());
  return cached[side];
}
function mgmtFicheOctogone(m,f){
  const bins=mgmtFicheZones(m,f);
  if(!bins.size) return '<div class="mgmt-fiche-empty">Aucune trajectoire enregistrée.</div>';
  /* Neuf secteurs dans l'octogone ; les deux premiers, puis le troisième
     uniquement s'il porte au moins 12 % de la présence totale. Les zones
     rouges exigent 25 % du temps dans le secteur ET trois moments de 5 s. */
  const sectors=new Map();
  for(const v of bins.values()){
    const col=Math.floor(v.col*3/7),row=Math.floor(v.row*3/7),key=`${col}:${row}`;
    const s=sectors.get(key)||{col,row,presence:0,coince:0};
    s.presence+=v.presence; s.coince+=v.coince; sectors.set(key,s);
  }
  const total=Array.from(sectors.values()).reduce((sum,s)=>sum+s.presence,0);
  const top=Array.from(sectors.values()).sort((a,b)=>b.presence-a.presence||a.row-b.row||a.col-b.col)
    .filter((s,i)=>i<2||i===2&&s.presence/total>=0.12).slice(0,3);
  const max=top[0].presence;
  const marks=top.map(v=>{
    const x=43+v.col*57,y=43+v.row*57;
    return `<circle cx="${x}" cy="${y}" r="${(27+9*v.presence/max).toFixed(1)}" fill="var(--mgmt-yellow)" opacity="${(0.34+0.26*v.presence/max).toFixed(2)}"/>`
      +(v.coince>=3&&v.coince/v.presence>=0.25?`<circle cx="${x}" cy="${y}" r="20" fill="var(--mgmt-red)" opacity="0.85"/>`:'');
  }).join('');
  return `<div class="mgmt-fiche-map"><svg viewBox="0 0 200 200" role="img" aria-label="Zones de combat : jaune, présence ; rouge, enfermé contre le grillage">`
    +`<defs><clipPath id="mgmt-fiche-oct"><polygon points="62,8 138,8 192,62 192,138 138,192 62,192 8,138 8,62"/></clipPath></defs>`
    +`<polygon points="62,8 138,8 192,62 192,138 138,192 62,192 8,138 8,62" fill="var(--mgmt-plum-deep)" stroke="var(--mgmt-edge)" stroke-width="2"/>`
    +`<g clip-path="url(#mgmt-fiche-oct)">${marks}</g></svg><span>Jaune : zones de combat.<br>Rouge : contre le grillage.</span></div>`;
}
function mgmtFicheParcours(trace){
  if(!trace) return '';
  const duration=o=>{
    if(o.from===null||o.to===null) return '';
    const weeks=(o.to-o.from+1)*MGMT_EVENT_WEEKS;
    const span=weeks<MGMT_EXT_YEAR_WEEKS
      ?`${Math.max(1,Math.round(weeks*12/MGMT_EXT_YEAR_WEEKS))} mois`
      :`${(weeks/MGMT_EXT_YEAR_WEEKS).toFixed(1).replace('.',',')} ans`;
    const when=o.to<0?'Avant l’ouverture':o.from<0?'Avant et depuis l’ouverture':'Depuis l’ouverture';
    return ` · ${when}, environ ${span}`;
  };
  const orgs=trace.orgs.map(o=>`<div class="mgmt-fiche-org"><strong>${o.name?esc(o.name):''}</strong>`
    +`${o.fights?` · ${esc(o.fights)} ${o.fights===1?'combat':'combats'}`:''}`
    +`${duration(o)}</div>`).join('');
  return `<aside class="mgmt-fiche-side"><h3>Sa trajectoire</h3><div class="mgmt-fiche-org">Amateur · ${esc(trace.amateur.W)}-${esc(trace.amateur.L)}</div>`
    +orgs+`<div class="mgmt-fiche-org">Professionnel · ${esc(trace.pro.W)}-${esc(trace.pro.L)}</div></aside>`;
}
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
    const replay=mgmtFicheRejeu(t);
    const methode=(replay&&areneVerdictFidele(t,replay))?replay.method:(MGMT_FAMILY_LABELS[t.family]||t.family);
    return `<div class="mgmt-fiche-fight${k===MGMT_FICHE.cursor?' selected':''}">`
      +`<div><strong>${esc(issue)} · ${esc(adversaire.name)}</strong>`
      +`<div class="mgmt-fiche-detail">${esc(methode)} · Round ${esc(t.round)} · Cycle ${esc(t.c)}</div></div>`
      +`<button class="mgmt-next" onclick="CL.mgmtHistoriqueRevoir(${i})">Revoir</button>`
      +`</div>`;
  }).join('');
}
function scr_mgmt_fiche(){
  const m=G&&G.mgmt, line=m&&mgmtFicheLigne(m,MGMT_FICHE.id);
  if(!line) return scr_mgmt_bureau();
  const {f,trace}=line;
  const profile=mgmtCombatProfile(f).phys, org=trace?(trace.orgs[trace.orgs.length-1].name||''):'Split';
  const div=divById(f.div), record=`${f.W}-${f.L}${f.D?'-'+f.D:''}`;
  const ranks=trace?`Mondial : ${mgmtFicheSituation(m,f,'world')}`
    :`Chez Split : ${mgmtFicheSituation(m,f,'organization')} · Mondial : ${mgmtFicheSituation(m,f,'world')}`;
  const attrs=[['Bilan',record],['Taille',`${(profile.height/100).toFixed(2).replace('.',',')} m`],
    ['Allonge',`${(profile.reach/100).toFixed(2).replace('.',',')} m`]];
  return `<div class="scr mgmt-wrap mgmt-fiche"><div class="mgmt-head">`
    +`<button class="mgmt-fiche-retour" onclick="CL.mgmtFicheRetour()">← Retour</button>`
    +`<div class="mgmt-fiche-hero"><div><h2 class="disp">${esc(f.name)}</h2>`
    +`<p>${esc(div.name)}${org?' · '+esc(org):''} · ${esc(f.age)} ans · garde ${profile.stance==='southpaw'?'gaucher':'orthodoxe'}<br>${esc(ranks)}</p></div>`
    +`<div class="mgmt-fiche-attrs">${attrs.map(([label,value])=>`<div><strong>${esc(value)}</strong><span>${label}</span></div>`).join('')}</div></div></div>`
    +`<div class="mgmt-cols mgmt-fiche-cols"><section class="mgmt-fiche-side"><h3>Où il combat</h3>${mgmtFicheOctogone(m,f)}</section>`
    +`<section class="mgmt-fiche-history"><h3>Ses derniers combats</h3>${mgmtHistoriqueHtml(m,f)}</section>`
    +`${mgmtFicheParcours(trace)}</div></div>`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [FIN ANCRE] ==== */
