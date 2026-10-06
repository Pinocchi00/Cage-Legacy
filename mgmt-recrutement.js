"use strict";
/* ==== [ANCRE: MGMT_LOT5_T5_RECRUTEMENT] — Lot 5 T5 (reprend le lot 2B T2 et le
   reste de sa T4), maquettes/12-recrutement.html : le recrutement. Chercher
   dans le monde hors de Split, par catégorie et par rang mondial ; chaque
   recrutable montre sa TRACE — d'où il vient, ce qu'il a fait : nom, âge,
   bilan, organisations traversées. Aucune note, aucune recommandation,
   aucun pronostic, aucune jauge (vision, addendum 2 §6).
   Recruter : le combattant entre chez Split à l'âge et au bilan que sa trace
   lui donne, au niveau 1 comme n'importe quelle ligne. Il ne change PAS de
   rang mondial en changeant de maison (la ligne extérieure reste — QO-9 — et
   le classement dédoublonne par identifiant) : signer ne récompense pas le
   recrutement au lieu des résultats. Aucun plafond de vivier. Le recrutement
   est un fait gardé (k:'recrue'), sa suite se lit dans la trace de Split.
   Aucun texte d'auteur : noms des combattants, des organisations. ==== */
let MGMT_RECRUTEMENT={div:'',page:0,curseur:0,message:''};
const MGMT_RECRUTEMENT_PAGE=12;

/** La catégorie affichée : celle du joueur, sinon la première. */
function mgmtRecrutementDiv(){
  return MGMT_RECRUTEMENT.div&&divById(MGMT_RECRUTEMENT.div)?MGMT_RECRUTEMENT.div:allDivisions()[0].id;
}

/** Les recrutables d'une catégorie, du mieux classé au moins bien classé dans
 *  le monde : les lignes extérieures vivantes qui ne sont pas déjà chez Split.
 *  @returns {Array<{id,rang,name,age,W,L,orgs,derniere,serie}>} */
function mgmtRecrutables(m,divId){
  if(!m||!divById(divId)) return [];
  const ranking=mgmtDivisionRanking(m,divId,'world');
  const chezSplit=new Set((m.roster||[]).map(o=>o.id));
  const out=[];
  ranking.forEach((o,i)=>{
    if(chezSplit.has(o.id)) return;
    const line=(m.exterieur||[]).find(e=>e.id===o.id);
    if(!line) return;
    const trace=mgmtExteriorTrace(line,m.cycle);
    if(!trace) return;
    const orgs=trace.orgs.map(x=>x.name).filter(Boolean);
    out.push({id:o.id,rang:i+1,name:trace.name,age:Math.floor(trace.age),W:trace.pro.W,L:trace.pro.L,
      orgs,derniere:orgs.length?orgs[orgs.length-1]:''});
  });
  return out;
}

/** Recrute un combattant du monde extérieur : une ligne de Split à son âge et à
 *  son bilan, au niveau 1 ; le geste est un fait. @returns {object|null} la ligne. */
function mgmtRecruter(m,id){
  if(!m||!Array.isArray(m.roster)||!mgmtValidId(id)) return null;
  if(m.roster.some(o=>o.id===id)) return null;
  const line=(m.exterieur||[]).find(e=>e.id===id);
  if(!line||mgmtExteriorRetired(line,m.cycle)) return null;
  const trace=mgmtExteriorTrace(line,m.cycle);
  const div=divById(line.div);
  if(!trace||!div) return null;
  const ligne={
    id:line.id,name:trace.name,first:trace.first,last:trace.last,ck:line.ck,generation:line.generation===undefined?0:line.generation,
    W:trace.pro.W,L:trace.pro.L,D:0,age:Math.floor(trace.age),
    div:div.id,divName:div.name,org:mgmtOrgNom(m),
    level:1,raison:null,interactions:0,
  };
  /* Brief du 06/10, lot 2 : il arrive avec le niveau que sa carrière dérivée lui donne aujourd'hui ; son pic est le sien. */
  if(typeof mgmtNiveaux==='function'&&mgmtNiveaux(m)&&Number.isFinite(trace.niveau)){
    const pic=mgmtNivPic(line.id);
    ligne.niv=trace.niveau; ligne.pic=pic;
    ligne.pot=clamp(trace.niveau+Math.round(Math.max(0,pic-ligne.age)*1.8),trace.niveau,MGMT_NIV_MAX);
  }
  m.roster.push(ligne);
  mgmtAddFact(m,{c:m.cycle,k:'recrue',a:line.id});
  return ligne;
}

/** Les recrues de la semaine : [{id,name,org}], du plus récent au plus ancien. */
function mgmtRecruesRecentes(m){
  const out=[];
  for(const x of m.facts||[]){
    if(!x||x.k!=='recrue'||x.c<m.cycle-1) continue;
    const f=mgmtFighterById(m,x.a);
    const line=(m.exterieur||[]).find(e=>e.id===x.a);
    const trace=line?mgmtExteriorTrace(line,x.c):null;
    const orgs=trace?trace.orgs.map(o=>o.name).filter(Boolean):[];
    if(f) out.push({id:f.id,name:f.name,div:f.div,d:orgs.length?orgs[orgs.length-1]:'',c:x.c});
  }
  return out.reverse();
}

/** Les lignes que la semaine raconte : « X rejoint Split, venu de … ». */
function mgmtRecruesLignes(m){
  return mgmtRecruesRecentes(m).map(r=>({type:'recrue',id:r.id,div:r.div,
    text:r.d?`${r.name} rejoint ${mgmtOrgNom(m)}, venu de ${r.d}`:`${r.name} rejoint ${mgmtOrgNom(m)}`}));
}

function mgmtRecrutementLigneHtml(x,i,curseur){
  const id=esc(x.id);
  return `<div class="mgmt-recru-row${i%2===0?' alt':''}${i===curseur?' cur':''}">`
    +`<span class="mgmt-recru-rang">${esc(mgmtRankLabel(x.rang,divById(mgmtRecrutementDiv())))}</span>`
    +`<button type="button" class="mgmt-recru-nom" onclick="CL.mgmtFiche('${id}')">${esc(x.name)}</button>`
    +`<span class="mgmt-recru-age">${esc(x.age)}</span>`
    +`<span class="mgmt-recru-bilan">${esc(x.W)}-${esc(x.L)}</span>`
    +`<span class="mgmt-recru-orgs">${esc(x.orgs.join(', puis '))}</span>`
    +`<button type="button" class="mgmt-recru-go" onclick="CL.mgmtRecruter('${id}')">Recruter</button></div>`;
}

function scr_mgmt_recrutement(){
  if(!G||!G.mgmt) return scr_mgmt_bureau();
  const m=G.mgmt, F=MGMT_RECRUTEMENT, div=mgmtRecrutementDiv();
  const tous=mgmtRecrutables(m,div);
  const pages=Math.max(1,Math.ceil(tous.length/MGMT_RECRUTEMENT_PAGE));
  if(F.page>=pages) F.page=pages-1;
  if(F.page<0) F.page=0;
  const vue=tous.slice(F.page*MGMT_RECRUTEMENT_PAGE,(F.page+1)*MGMT_RECRUTEMENT_PAGE);
  if(F.curseur>=vue.length) F.curseur=Math.max(0,vue.length-1);
  const chips=allDivisions().map(d=>`<button type="button" class="mgmt-vest-chip${d.id===div?' on':''}" aria-pressed="${d.id===div}" onclick="CL.mgmtRecrutementFiltre('${esc(d.id)}')">${esc(mgmtDivisionLabel(d.id))}</button>`).join('');
  return `<div class="scr mgmt-wrap mgmt-recrutement"><div class="mgmt-head bar"><h2 class="disp">Le recrutement</h2>`
    +`<span class="mgmt-week-event">Hors de ${esc(mgmtOrgNom(m))} · ${esc(tous.length)} dans la catégorie</span></div>`
    +`<div class="mgmt-vest-chips">${chips}</div>`
    +(F.message?`<p class="mgmt-recru-msg" role="status">${esc(F.message)}</p>`:'')
    +`<div class="mgmt-cols mgmt-vest-cols"><section class="mgmt-vest-liste">`
    +`<div class="mgmt-recru-row head"><span>Rang mondial</span><span>Combattant</span><span>Âge</span><span>Bilan</span><span>D'où il vient</span><span></span></div>`
    +(vue.length?vue.map((x,i)=>mgmtRecrutementLigneHtml(x,i,F.curseur)).join(''):'<p class="mgmt-vest-vide">Personne à recruter dans cette catégorie.</p>')
    +`<div class="mgmt-vest-pages"><button type="button" onclick="CL.mgmtRecrutementPage(-1)"${F.page<=0?' disabled':''}>Précédent</button>`
    +`<span>Page ${esc(F.page+1)} / ${esc(pages)}</span>`
    +`<button type="button" onclick="CL.mgmtRecrutementPage(1)"${F.page>=pages-1?' disabled':''}>Suivant</button></div></section>`
    +`<aside class="mgmt-vest-aside"><div class="mgmt-vest-bloc"><h3>Sa trace</h3><p>Un clic sur un nom ouvre sa fiche : son bilan amateur, ses organisations, sa série. Aucune note, aucun pronostic.</p></div>`
    +`<div class="mgmt-vest-bloc"><h3>Ce que recruter change</h3><p>Il rejoint ${esc(mgmtOrgNom(m))} avec son bilan et son âge. Il ne change pas de rang mondial. Aucun plafond de vivier.</p></div></aside>`
    +`</div></div>`;
}

Object.assign(CL,{
  mgmtRecrutementFiltre(div){ MGMT_RECRUTEMENT.div=div; MGMT_RECRUTEMENT.page=0; MGMT_RECRUTEMENT.curseur=0; MGMT_RECRUTEMENT.message=''; render(); },
  mgmtRecrutementPage(delta){ MGMT_RECRUTEMENT.page=Math.max(0,MGMT_RECRUTEMENT.page+(Number(delta)||0)); MGMT_RECRUTEMENT.curseur=0; render(); },
  mgmtRecrutementCurseur(delta){
    const F=MGMT_RECRUTEMENT, n=Math.min(MGMT_RECRUTEMENT_PAGE,Math.max(0,mgmtRecrutables(G.mgmt,mgmtRecrutementDiv()).length-F.page*MGMT_RECRUTEMENT_PAGE));
    F.curseur=n?Math.min(n-1,Math.max(0,F.curseur+delta)):0; render();
  },
  mgmtRecruter(id){
    if(!G||!G.mgmt) return;
    const ligne=mgmtRecruter(G.mgmt,id);
    MGMT_RECRUTEMENT.message=ligne?`${ligne.name} rejoint ${mgmtOrgNom(G.mgmt)}.`:'';
    if(ligne) saveMgmt();
    render();
  },
});
/* ==== [FIN ANCRE] ==== */
