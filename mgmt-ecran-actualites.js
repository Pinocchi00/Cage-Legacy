"use strict";
/* ==== [ANCRE: P3_T2B_ECRAN_ACTUALITES] — Monde lot 33 T2b ==== */
const MGMT_ACTUALITES_LABELS={
  title:'Actualités',subtitle:'Tes suivis et tes espoirs',followed:'Tes suivis',hopes:'Tes espoirs',
  all:'Tous',unread:'Non lus',feed:'Le fil',markAll:'Tout marquer comme lu',latest:'À la dernière soirée',before:'Avant',
  noNews:'Aucune nouvelle de tes suivis pour l’instant.',noFollow:'Tu ne suis personne. Suis un combattant depuis sa fiche pour recevoir ses nouvelles ici.',
  emptyDetail:'Choisis une nouvelle pour en lire le détail.',profile:'Sa fiche',unfollow:'Ne plus suivre',readAll:'Tout est lu',
};
let MGMT_ACTUALITES_UI={filtre:'tous',id:null,cle:null};
function mgmtActualitesFighter(m,id){return mgmtFighterById(m,id)||mgmtExteriorCombattant(m,id)||null;}
function mgmtActualitesOrg(m,f){return f.org&&m.orgs&&m.orgs[f.org]?m.orgs[f.org].name:(f.org==='split'||!f.org?mgmtOrgNom(m):f.org);}
function mgmtActualitesHtml(){
  const m=G&&G.mgmt;if(!m)return scr_mgmt_bureau();
  const L=MGMT_ACTUALITES_LABELS,all=mgmtActualites(m),ids=mgmtSuivis(m);
  const suivis=ids.map(id=>({id,f:mgmtActualitesFighter(m,id)})).filter(x=>x.f);
  const news=all.filter(x=>(MGMT_ACTUALITES_UI.filtre!=='nonlus'||!x.lu)&&(!MGMT_ACTUALITES_UI.id||x.id===MGMT_ACTUALITES_UI.id));
  if(!news.some(x=>x.cle===MGMT_ACTUALITES_UI.cle))MGMT_ACTUALITES_UI.cle=(news.find(x=>!x.lu)||news[0]||{}).cle||null;
  const selected=news.find(x=>x.cle===MGMT_ACTUALITES_UI.cle)||null;
  const followHtml=suivis.length?suivis.map(({id,f})=>{
    const unseen=all.filter(x=>x.id===id&&!x.lu).length,div=divById(f.div);
    const role=mgmtRole(m,f);return `<button class="mgmt-ac-follow" onclick="CL.mgmtActualitesSuivi('${escJsAttr(id)}')"><span class="mgmt-ac-dot">${unseen?'◆':''}</span><span><b>${esc(f.name.toUpperCase())}</b><small>${esc(mgmtActualitesOrg(m,f))} · ${esc(mgmtDivisionLabel(div))}</small></span>${unseen?`<i>${unseen}</i>`:''}${role&&role.id==='espoir'?'<em>ESPOIR</em>':''}</button>`;
  }).join(''):`<p class="mgmt-ac-empty">${esc(L.noFollow)}</p>`;
  const grouped=(label,rows)=>rows.length?`<h3 class="mgmt-ac-group">${esc(label)}</h3>`+rows.map(x=>`<button class="mgmt-ac-item${x.lu?' lu':' nonlu'}${x.cle===MGMT_ACTUALITES_UI.cle?' choisi':''}" onclick="CL.mgmtActualitesChoisir('${escJsAttr(x.cle)}')"><span class="mgmt-ac-type">${esc(MGMT_ACTU_LIBELLES[x.type]||x.type)}</span><span class="mgmt-ac-copy"><b>${esc(x.titre)}</b><small>${esc(x.texte)}</small></span>${!x.lu?'<i class="mgmt-ac-unread"></i>':''}</button>`).join(''):'';
  const latest=Number.isSafeInteger(m.cycle)?m.cycle+1:m.cycle;
  const detail=selected?(()=>{const f=mgmtActualitesFighter(m,selected.id);if(!f)return '';const org=mgmtActualitesOrg(m,f),rank=mgmtDivisionRanking(m,f.div,'organization').findIndex(x=>x.id===f.id)+1,world=mgmtDivisionRank(m,f,'world');
    const restants=mgmtContratRestants(f);return `<h2>${esc(selected.titre.toUpperCase())}</h2><p>${esc(selected.texte)}</p>${f.ct?`<div class="mgmt-ac-stat"><span>Contrat restant</span><b>${esc(restants)} COMBATS</b></div>`:''}${rank>0&&world?`<div class="mgmt-ac-stat"><span>Son rang</span><b>N°${rank} · ${world}e MONDIAL</b></div>`:''}<button onclick="CL.mgmtFiche('${escJsAttr(f.id)}')">${esc(L.profile)}</button><button onclick="CL.mgmtActualitesRetirer('${escJsAttr(f.id)}')">${esc(L.unfollow)}</button>`;})():`<p>${esc(L.emptyDetail)}</p>`;
  return `<div class="scr mgmt-wrap mgmt-ac"><header class="mgmt-ac-head"><div><h1>${esc(L.title)}</h1><p>${esc(L.subtitle)}</p></div></header><div class="mgmt-ac-cols"><aside class="mgmt-ac-pane"><h2>${esc(L.followed)} · ${suivis.length}</h2><div class="mgmt-ac-filters"><button onclick="CL.mgmtActualitesFiltre('tous')">${esc(L.all)}</button><button onclick="CL.mgmtActualitesFiltre('nonlus')">${esc(L.unread)}</button></div>${followHtml}</aside><main class="mgmt-ac-pane"><div class="mgmt-ac-feedhead"><h2>${esc(L.feed)}</h2><span>${mgmtActuNonLues(m)?`${mgmtActuNonLues(m)} NON LUES`:esc(L.readAll)}</span><button onclick="CL.mgmtActualitesToutLire()">${esc(L.markAll)}</button></div>${news.length?grouped(L.latest,news.filter(x=>x.c>=latest))+grouped(L.before,news.filter(x=>x.c<latest)):`<p class="mgmt-ac-empty">${esc(L.noNews)}</p>`}</main><aside class="mgmt-ac-pane mgmt-ac-detail">${detail}</aside></div></div>`;
}
Object.assign(SCREENS,{mgmt_actualites:mgmtActualitesHtml});
Object.assign(CL,{
  mgmtActualitesFiltre(v){MGMT_ACTUALITES_UI.filtre=v==='nonlus'?'nonlus':'tous';MGMT_ACTUALITES_UI.cle=null;render();},
  mgmtActualitesSuivi(id){MGMT_ACTUALITES_UI.id=MGMT_ACTUALITES_UI.id===id?null:id;MGMT_ACTUALITES_UI.cle=null;render();},
  mgmtActualitesChoisir(cle){const row=mgmtActualites(G.mgmt).find(x=>x.cle===cle);if(!row)return;MGMT_ACTUALITES_UI.cle=cle;mgmtActuLire(G.mgmt,cle);saveMgmt();render();},
  mgmtActualitesToutLire(){mgmtActuToutLire(G.mgmt);saveMgmt();render();},
  mgmtActualitesRetirer(id){mgmtSuiviToggle(G.mgmt,id);MGMT_ACTUALITES_UI.id=null;MGMT_ACTUALITES_UI.cle=null;saveMgmt();render();}
});
keysRegister('mgmt_actualites',{
  Tab(){const cols=['.mgmt-ac-follow','.mgmt-ac-item','.mgmt-ac-detail button'];MGMT_ACTUALITES_UI.col=((MGMT_ACTUALITES_UI.col||0)+1)%3;const el=document.querySelector(cols[MGMT_ACTUALITES_UI.col]);if(el)el.focus();},
  ArrowUp(){mgmtActualitesMove(-1);},ArrowDown(){mgmtActualitesMove(1);},
  Enter(){const el=document.activeElement;if(el&&el.classList.contains('mgmt-ac-follow')){const id=(el.getAttribute('onclick')||'').match(/\('([^']+)'\)/);if(id)CL.mgmtFiche(id[1]);}else if(el&&el.classList.contains('mgmt-ac-item'))el.click();},
  s(){mgmtActualitesUnfollowActive();},S(){mgmtActualitesUnfollowActive();},Escape(){CL.go('mgmt_accueil');}
});
function mgmtActualitesMove(delta){const els=[...document.querySelectorAll('.mgmt-ac-follow,.mgmt-ac-item')];if(!els.length)return;const i=els.indexOf(document.activeElement);els[Math.max(0,Math.min(els.length-1,i<0?0:i+delta))].focus();}
function mgmtActualitesUnfollowActive(){const el=document.activeElement;if(el&&el.classList.contains('mgmt-ac-follow')){const id=(el.getAttribute('onclick')||'').match(/\('([^']+)'\)/);if(id)CL.mgmtActualitesRetirer(id[1]);}}
