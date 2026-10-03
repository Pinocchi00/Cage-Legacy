"use strict";
/* ==== [ANCRE: MGMT_LOT5_H8_VESTIAIRE] — Lot 5 H8 : le vestiaire, écran neuf
   (maquettes/11-vestiaire.html). Les 140 de Split, filtrables, lus par
   rôles, avec le surnom et un signe pour ceux qui ont quelque chose à dire
   (une demande en attente, un moment relayé cette semaine). Filtres :
   catégorie, rôle, disponible, ton cercle, tes suivis, quelque chose à dire.
   Aucune donnée n'est stockée : l'état des filtres vit à l'écran, le cercle
   et les suivis sont ceux de H6. Tout texte injecté passe par esc(). ==== */
let MGMT_VESTIAIRE={div:'',role:'',dispo:false,lien:'',signe:false,page:0};
const MGMT_VESTIAIRE_PAGE=14;

/** Ce qui mérite un coup d'œil : une demande en attente ou un moment
 *  relayé ce cycle ou le précédent. Dérivé, jamais stocké. */
function mgmtVestiaireSigne(m,f){
  if(typeof mgmtDemandesOuvertes==='function'&&mgmtDemandesOuvertes(m).some(d=>d.a===f.id)) return true;
  for(const x of m.facts||[]){
    if(!x||x.k!=='moment_vie'||x.a!==f.id||x.c<m.cycle-1) continue;
    const mo=mgmtVieMomentById(x.m);
    if(mo&&mo.relais.length) return true;
  }
  return false;
}

/** Les lignes du vestiaire après filtres, triées : ton cercle, tes suivis,
 *  puis ceux qui ont quelque chose à dire, puis par catégorie et par nom. */
function mgmtVestiaireLignes(m){
  const F=MGMT_VESTIAIRE, divs=allDivisions().map(d=>d.id);
  const out=[], classements={};
  for(const f of m.roster){
    if(mgmtIsRetired(f)) continue;
    if(F.div&&f.div!==F.div) continue;
    if(F.dispo&&!mgmtAvailable(m,f)) continue;
    const lien=mgmtLien(m,f.id);
    if(F.lien&&lien!==F.lien) continue;
    const signe=mgmtVestiaireSigne(m,f);
    if(F.signe&&!signe) continue;
    const role=mgmtRole(m,f,classements);
    if(F.role&&(!role||role.id!==F.role)) continue;
    out.push({f,lien,signe,role});
  }
  const poids=x=>(x.lien==='cercle'?2:(x.lien==='suivi'?1:0))*10+(x.signe?1:0);
  return out.sort((a,b)=>poids(b)-poids(a)||divs.indexOf(a.f.div)-divs.indexOf(b.f.div)||a.f.name.localeCompare(b.f.name,'fr'));
}

function mgmtVestiaireLigneHtml(m,x,surnoms,i){
  const f=x.f, sur=surnoms.get(f.id)||'';
  const lienTxt=x.lien==='cercle'?'Cercle':(x.lien==='suivi'?'Suivi':(mgmtAvailable(m,f)?'':'Indisponible'));
  return `<button type="button" class="mgmt-vest-row${i%2===0?' alt':''}${mgmtAvailable(m,f)?'':' off'}" onclick="CL.mgmtFiche('${esc(f.id)}')">`
    +`<span class="mgmt-vest-sign">${x.signe?'<i aria-label="Quelque chose à dire"></i>':''}</span>`
    +`<span class="mgmt-vest-name"><b>${esc(f.name)}</b>${sur?` <em>« ${esc(sur)} »</em>`:''}</span>`
    +`<span class="mgmt-vest-role">${x.role?esc(x.role.libelle):''}</span>`
    +`<span class="mgmt-vest-div">${esc(mgmtDivisionLabel(f.div))}</span>`
    +`<span class="mgmt-vest-rec">${esc(f.W)}-${esc(f.L)}${f.D?'-'+esc(f.D):''}</span>`
    +`<span class="mgmt-vest-lien${x.lien?' on':''}">${esc(lienTxt)}</span></button>`;
}

function mgmtVestiaireAside(m,titre,ids,max){
  const lignes=ids.map(id=>{
    const f=mgmtFighterById(m,id); if(!f) return '';
    const r=mgmtRole(m,f);
    return `<button type="button" class="mgmt-vest-mini" onclick="CL.mgmtFiche('${esc(f.id)}')">${esc(f.name)}${r?' — '+esc(r.libelle):''}, ${esc(mgmtDivisionLabel(f.div))}</button>`;
  }).join('');
  return `<div class="mgmt-vest-bloc"><h3>${esc(titre)} · ${esc(ids.length)}/${esc(max)}</h3>${lignes||'<p>Personne pour le moment.</p>'}</div>`;
}

function scr_mgmt_vestiaire(){
  if(!G||!G.mgmt) return scr_mgmt_bureau();
  const m=G.mgmt, F=MGMT_VESTIAIRE;
  const lignes=mgmtVestiaireLignes(m);
  const pages=Math.max(1,Math.ceil(lignes.length/MGMT_VESTIAIRE_PAGE));
  if(F.page>=pages) F.page=pages-1;
  if(F.page<0) F.page=0;
  const vue=lignes.slice(F.page*MGMT_VESTIAIRE_PAGE,(F.page+1)*MGMT_VESTIAIRE_PAGE);
  /* Les surnoms se calculent une fois par catégorie visible. */
  const surnoms=new Map();
  for(const d of new Set(vue.map(x=>x.f.div))){
    for(const [id,s] of mgmtIdentiteSurnomsDe(m,d)) surnoms.set(id,s);
  }
  const chip=(label,on,go)=>`<button type="button" class="mgmt-vest-chip${on?' on':''}" aria-pressed="${on}" onclick="${go}">${esc(label)}</button>`;
  const divChips=chip('Tous',!F.div,"CL.mgmtVestiaireFiltre('div','')")
    +allDivisions().map(d=>chip(mgmtDivisionLabel(d.id),F.div===d.id,`CL.mgmtVestiaireFiltre('div','${esc(d.id)}')`)).join('');
  const roles=`<select aria-label="Rôle" onchange="CL.mgmtVestiaireFiltre('role',this.value)"><option value="">Tous</option>`
    +MGMT_ROLES.map(r=>`<option value="${esc(r.id)}"${F.role===r.id?' selected':''}>${esc(r.libelle)}</option>`).join('')+`</select>`;
  const actifs=m.roster.filter(f=>!mgmtIsRetired(f)).length;
  const aDire=m.roster.filter(f=>!mgmtIsRetired(f)&&mgmtVestiaireSigne(m,f)).length;
  return `<div class="scr mgmt-wrap mgmt-vestiaire"><div class="mgmt-head bar"><h2 class="disp">Le vestiaire</h2>`
    +`<span class="mgmt-week-event">${esc(actifs)} combattants</span></div>`
    +`<div class="mgmt-vest-filtres"><div class="mgmt-vest-chips">${divChips}</div>`
    +`<div class="mgmt-vest-chips"><span>Rôle</span>${roles}`
    +chip('Disponibles',F.dispo,"CL.mgmtVestiaireFiltre('dispo','')")
    +chip('Ton cercle',F.lien==='cercle',"CL.mgmtVestiaireFiltre('lien','cercle')")
    +chip('Tes suivis',F.lien==='suivi',"CL.mgmtVestiaireFiltre('lien','suivi')")
    +chip('Quelque chose à dire',F.signe,"CL.mgmtVestiaireFiltre('signe','')")+`</div></div>`
    +`<div class="mgmt-cols mgmt-vest-cols"><section class="mgmt-vest-liste">`
    +`<div class="mgmt-vest-row head"><span></span><span>Combattant</span><span>Rôle</span><span>Catégorie</span><span>Bilan</span><span>Lien</span></div>`
    +(vue.length?vue.map((x,i)=>mgmtVestiaireLigneHtml(m,x,surnoms,i)).join(''):'<p class="mgmt-vest-vide">Personne ne correspond à ces filtres.</p>')
    +`<div class="mgmt-vest-pages"><button type="button" onclick="CL.mgmtVestiairePage(-1)"${F.page<=0?' disabled':''}>Précédent</button>`
    +`<span>Page ${esc(F.page+1)} / ${esc(pages)} · ${esc(lignes.length)}</span>`
    +`<button type="button" onclick="CL.mgmtVestiairePage(1)"${F.page>=pages-1?' disabled':''}>Suivant</button></div></section>`
    +`<aside class="mgmt-vest-aside">${mgmtVestiaireAside(m,'Ton cercle',mgmtCercle(m),MGMT_CERCLE_MAX)}`
    +mgmtVestiaireAside(m,'Tes suivis',mgmtSuivis(m),MGMT_SUIVIS_MAX)
    +`<div class="mgmt-vest-bloc"><h3>Quelque chose à dire · ${esc(aDire)}</h3><p>Un carré signale une demande en attente ou un moment relayé cette semaine. Un clic ouvre la fiche.</p></div></aside>`
    +`</div></div>`;
}
/* ==== [FIN ANCRE] ==== */
