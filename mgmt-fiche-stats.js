"use strict";
/* ==== [ANCRE: MONDE_LOT31_T4_STATS] — Monde lot 31 T4 ==== */
function mgmtFicheStatsCategoriePluriel(divId){
  const d=divById(divId), label=d?String(mgmtDivisionLabel(d)).toUpperCase():'';
  const table={"POIDS PAILLE":"PAILLES","POIDS MOUCHE":"MOUCHES","POIDS COQ":"COQS","POIDS PLUME":"PLUMES","POIDS LÉGER":"LÉGERS","POIDS MI-MOYEN":"MI-MOYENS","POIDS MOYEN":"MOYENS","POIDS MI-LOURD":"MI-LOURDS","POIDS LOURD":"LOURDS"};
  return table[label]||label;
}
function mgmtFicheStatsFacon(vParMethode){
  const v=vParMethode||{}, n=Math.max(0,...['ko','sub','stop','dec'].map(k=>Number.isFinite(v[k])?v[k]:0));
  const items=[['ko','KO','KO'],['sub','soumission','soumissions'],['stop','arrêt médical','arrêts'],['dec','décision','décisions']]
    .filter(([k])=>(Number.isFinite(v[k])?v[k]:0)>0).map(([k,sing,plur])=>{const x=v[k];return `${x} ${k==='ko'?'KO':x===1?sing:plur}`;});
  if((v.sub||0)===0&&n>0) items.push('aucune soumission');
  return items.join(' · ');
}
function mgmtFicheStatsRepart(values){
  const vals=(values||[]).map(x=>Number.isFinite(x)&&x>0?x:0), sum=vals.reduce((a,b)=>a+b,0);
  if(!sum) return vals.map(()=>0);
  const exact=vals.map(x=>x*100/sum), out=exact.map(Math.floor), reste=100-out.reduce((a,b)=>a+b,0);
  exact.map((x,i)=>({i,r:x-Math.floor(x)})).sort((a,b)=>b.r-a.r||a.i-b.i).slice(0,reste).forEach(x=>out[x.i]++);
  return out;
}
function mgmtFicheStatsFormat(value,key){
  if(!Number.isFinite(value)) return '—';
  if(key==='precision'||key==='defense'||key==='defenseAmenee') return String(Math.round(value*100));
  if(key==='controlePar15') {const s=Math.round(value*900);return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;}
  if(key==='dureeMoyenne') {const s=Math.round(value);return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;}
  return value.toFixed(key==='sigParMin'||key==='sigEncaisseParMin'?2:1).replace('.',',');
}
function mgmtFicheStatsHtml(m,f){
  const stats=mgmtStatsCarriere(m,f.id), docs=mgmtStatsDocumentes(m,f.id);
  if(!stats||!docs||!docs.docs) return `<div class="mf-fi-ligne"><div class="mf-fi-p mf-fi-empty-stats">Pas encore de combat documenté. Ses chiffres apparaîtront après son prochain combat.</div></div>`;
  const cat=mgmtStatsCategorie(m,f.div), rows=[
    ['Coups significatifs donnés par minute','sigParMin',''],['Précision','precision','%'],['Encaissés par minute','sigEncaisseParMin',''],['Défense debout','defense','%'],
    ['Amenées par 15 minutes','ameneesPar15',''],['Défense d’amenée','defenseAmenee','%'],['Soumissions tentées par 15 min','soumissionsPar15',''],['Contrôle au sol par 15 minutes','controlePar15','']
  ];
  const rang=(key)=>{const r=cat.rangs.get(f.id)?.[key];return Number.isInteger(r)?`${r===1?'1er':`${r}e`}`:'—';};
  const statRow=([label,key,unit])=>`<div class="mf-fs-stat"><div class="mf-fs-top"><span>${esc(label)}</span><b>${esc(mgmtFicheStatsFormat(stats[key],key))}${unit&&Number.isFinite(stats[key])?`<i>${unit}</i>`:''}</b></div><div class="mf-fs-bottom"><div class="mf-fs-track"><i style="width:${Number.isFinite(stats[key])?Math.max(0,Math.min(100,stats[key]*100)):0}%"></i></div><span>moy. ${esc(mgmtFicheStatsFormat(cat.moyennes[key],key))}${unit&&Number.isFinite(cat.moyennes[key])?' '+unit:''}${key==='controlePar15'?'':` · ${esc(rang(key))}`}</span></div></div>`;
  const targets=mgmtFicheStatsRepart([stats.repartition.cibles.head,stats.repartition.cibles.body,stats.repartition.cibles.leg]);
  const positions=mgmtFicheStatsRepart([stats.repartition.positions.dist,stats.repartition.positions.clinch,stats.repartition.positions.ground]);
  const bar=(title,values,labels)=>`<div class="mf-fs-part"><div>${title}</div><div class="mf-fs-bar">${values.map((n,i)=>`<i style="flex:${n}">${n}%</i>`).join('')}</div><div class="mf-fs-labels">${labels.map(esc).join(' · ')}</div></div>`;
  const wins=Object.values(stats.vParMethode||{}).reduce((a,b)=>a+(Number.isFinite(b)?b:0),0), catPlural=mgmtFicheStatsCategoriePluriel(f.div);
  const rangLabel=cat.n?`RANG SUR ${cat.n} ${esc(catPlural)}`:`RANG SUR 0 ${esc(catPlural)}`;
  const panel=(title,subtitle,body)=>`<div class="mf-fs-frame"><div class="mf-fs-frame-inner"><section class="mf-fs-panel"><header><div class="mf-fs-head"><b>${title}</b><i></i></div>${subtitle?`<span>${subtitle}</span>`:''}</header>${body}</section></div></div>`;
  return `<div class="mf-fs-grid">${panel('DEBOUT',`${docs.docs} ${docs.docs===1?'COMBAT DOCUMENTÉ':'COMBATS DOCUMENTÉS'}`,rows.slice(0,4).map(statRow).join(''))}`
    +panel('AU SOL',rangLabel,rows.slice(4).map(statRow).join(''))
    +panel('SA FAÇON DE GAGNER','',`<div class="mf-fs-sub">${wins===1?'SA 1 VICTOIRE':`SES ${wins} VICTOIRES`}</div><p>${esc(mgmtFicheStatsFacon(stats.vParMethode))||'—'}</p>`
    +bar('OÙ IL TOUCHE (%)',targets,['Tête','Corps · Jambes'])+bar('D’OÙ IL TOUCHE (%)',positions,['Distance','Clinch · Sol'])
    +`<div class="mf-fs-duration">Durée moyenne d’un combat <b>${esc(mgmtFicheStatsFormat(stats.dureeMoyenne,'dureeMoyenne'))}</b></div>`)+`</div>`;
}
/* ==== [FIN ANCRE] ==== */
