"use strict";
/* ==== [ANCRE: P3_T2B_ECRAN_ACTUALITES] — Monde lot 33 T2b ==== */
const MGMT_ACTUALITES_LABELS={
  title:'Actualités',subtitle:'Tes suivis et tes espoirs',followed:'Tes suivis',hopes:'Tes espoirs',
  all:'Tous',unread:'Non lus',feed:'Le fil',markAll:'Tout marquer comme lu',latest:'Aujourd’hui',before:'Cette semaine',
  noNews:'Aucune nouvelle de tes suivis pour l’instant.',noFollow:'Tu ne suis personne. Suis un combattant depuis sa fiche pour recevoir ses nouvelles ici.',
  emptyDetail:'Choisis une nouvelle pour en lire le détail.',profile:'Sa fiche',unfollow:'Ne plus suivre',readAll:'Tout est lu',
};
let MGMT_ACTUALITES_UI={filtre:'tous',id:null,cle:null};
function mgmtActualitesFighter(m,id){return mgmtFighterById(m,id)||mgmtExteriorCombattant(m,id)||null;}
function mgmtActualitesOrg(m,f){return f.org&&m.orgs&&m.orgs[f.org]?m.orgs[f.org].name:(f.org==='split'||!f.org?mgmtOrgNom(m):f.org);}
/* ==== [ANCRE: FID83_TITRES_PANNEAUX] — Fidélité Actualités, lot 83 ==== */
function mgmtActualitesTitreHtml(titre){
  return `<div class="ac83-heading"><h2>${esc(titre)}</h2><i class="ac83-trait" aria-hidden="true"></i></div>`;
}
function mgmtActualitesEnteteHtml(m){
  const date=mfSoireeInfos(m);
  return `<div class="ac83-entete">${date.dans?`<span class="ac83-delai">${esc(date.dans)}</span>`:''}${date.date?`<div class="ac83-date"><b>${esc(date.date)}</b>${date.lieu?`<span>${esc(date.lieu)}</span>`:''}</div>`:''}<div class="ac83-soiree"><b>${esc(mfNet(mgmtOrgNom(m)))} FIGHT NIGHT</b><b class="ac83-numero">${esc((m.eventsPlayed||0)+1)}</b></div></div>`;
}
/* ==== [FIN ANCRE] ==== */
function mgmtActualitesHtml(){
  const m=G&&G.mgmt;if(!m)return scr_mgmt_bureau();
  const L=MGMT_ACTUALITES_LABELS,all=mgmtActualites(m),ids=mgmtSuivis(m);
  const suivis=ids.map(id=>({id,f:mgmtActualitesFighter(m,id)})).filter(x=>x.f);
  const news=all.filter(x=>(MGMT_ACTUALITES_UI.filtre!=='nonlus'||!x.lu)&&(!MGMT_ACTUALITES_UI.id||x.id===MGMT_ACTUALITES_UI.id));
  if(!news.some(x=>x.cle===MGMT_ACTUALITES_UI.cle))MGMT_ACTUALITES_UI.cle=(news.find(x=>!x.lu)||news[0]||{}).cle||null;
  const selected=news.find(x=>x.cle===MGMT_ACTUALITES_UI.cle)||null;
  const acteur=selected?mgmtActualitesFighter(m,selected.id):null;
  const followHtml=suivis.length?(()=>{const espoirs=suivis.filter(({id})=>mgmtEstEspoir(m,id)),autres=suivis.filter(({id})=>!mgmtEstEspoir(m,id)),line=({id,f})=>{
     const unseen=all.filter(x=>x.id===id&&!x.lu).length,div=divById(f.div);
      const choisi=id===(MGMT_ACTUALITES_UI.id||(selected&&selected.id)),nom=mfNet(f.name);
      return `<button class="mgmt-ac-follow${choisi?' choisi':''}" aria-pressed="${choisi}" onclick="CL.mgmtActualitesSuivi('${escJsAttr(id)}')"><i class="ac83-dot${unseen?' nonlu':''}" aria-hidden="true"></i><span class="ac83-follow-copy"><b style="font-size:${mfCorps(nom,238,28,22)}px">${esc(nom)}</b><small>${esc(mgmtActualitesOrg(m,f))} · ${esc(mgmtDivisionLabel(div).replace(/^poids /i,'').toLocaleLowerCase('fr'))}</small></span>${mgmtEstReserve(m,id)?'<i class="mgmt-ac-reserved">Réservé</i>':''}${unseen?`<i class="mgmt-ac-unread-count">${esc(unseen)}</i>`:''}</button>`;
   };return `${espoirs.length?`<h3 class="mgmt-ac-follow-group">${esc(L.hopes)}</h3>${espoirs.map(line).join('')}`:''}${autres.length?`<h3 class="mgmt-ac-follow-group">${esc(L.followed)}</h3>${autres.map(line).join('')}`:''}`;})():`<p class="mgmt-ac-empty">${esc(L.noFollow)}</p>`;
  const grouped=(label,rows)=>rows.length?`<h3 class="mgmt-ac-group">${esc(label)}</h3>`+rows.map(x=>`<button data-type="${esc(x.type)}" class="mgmt-ac-item${x.lu?' lu':' nonlu'}${x.cle===MGMT_ACTUALITES_UI.cle?' choisi':''}" onclick="CL.mgmtActualitesChoisir('${escJsAttr(x.cle)}')"><span class="mgmt-ac-type">${esc(MGMT_ACTU_LIBELLES[x.type]||x.type)}</span><span class="mgmt-ac-copy"><b>${esc(x.titre)}</b><small>${esc(x.texte)}</small></span>${!x.lu?'<i class="mgmt-ac-unread" aria-hidden="true"></i>':''}</button>`).join(''):'';
  const latest=Number.isSafeInteger(m.cycle)?m.cycle+1:m.cycle;
   const detail=selected?(()=>{const f=acteur;
      const article=`<h2>${esc(selected.titre.toUpperCase())}</h2><p>${esc(selected.texte)}</p>`;
      if(!f) return `<div class="mgmt-ac-detail-body">${article}</div>`;
      const rank=mgmtDivisionRanking(m,f.div,'organization').findIndex(x=>x.id===f.id)+1,world=mgmtDivisionRank(m,f,'world');
      const restants=mgmtContratRestants(f),pense=mgmtMemoirePense(m,f.id);
      const penseClasse=pense&&['cache','part'].includes(pense.niveau)?'ac83-alerte':pense&&pense.niveau==='attend'?'ac83-attente':'';
      return `<div class="mgmt-ac-detail-body">${article}<div class="ac83-stats">${f.ct?`<div class="mgmt-ac-stat"><span>Contrat restant</span><b>${esc(restants)} COMBATS</b></div>`:''}<div class="mgmt-ac-stat"><span>Ce qu’il pense de toi</span><b class="${penseClasse}">${esc(pense&&pense.phrase||'—')}</b></div>${rank>0&&world?`<div class="mgmt-ac-stat"><span>Son rang</span><b>N°${esc(rank)} · ${esc(world)}e MONDIAL</b></div>`:''}</div></div><div class="mgmt-ac-actions"><button class="principale" onclick="CL.mgmtFicheCarte()"><kbd>Entrée</kbd><span>PRÉPARER SON COMBAT</span></button><div class="mgmt-ac-secondary"><button onclick="CL.mgmtFiche('${escJsAttr(f.id)}')"><kbd>F</kbd><span>SA FICHE</span></button><button onclick="CL.go('mgmt_contrats')"><kbd>P</kbd><span>PROLONGER</span></button></div></div>`;})():`<p class="mgmt-ac-empty">${esc(L.emptyDetail)}</p>`;
     const nonLues=mgmtActuNonLues(m),contenu=`<main class="mf-contenu mf-actu ac83" data-nonlues="${esc(nonLues)}"><div class="mgmt-ac-cols"><aside class="mgmt-ac-pane">${mfPanneau(`<div class="mgmt-ac-followhead">${mgmtActualitesTitreHtml(L.followed)}<span>${esc(suivis.length)}</span></div><div class="mgmt-ac-filters"><button class="${MGMT_ACTUALITES_UI.filtre==='tous'?'actif':''}" aria-pressed="${MGMT_ACTUALITES_UI.filtre==='tous'}" onclick="CL.mgmtActualitesFiltre('tous')">${esc(L.all)}</button><button class="${MGMT_ACTUALITES_UI.filtre==='nonlus'?'actif':''}" aria-pressed="${MGMT_ACTUALITES_UI.filtre==='nonlus'}" onclick="CL.mgmtActualitesFiltre('nonlus')">${esc(L.unread)}</button></div><div class="ac83-follow-scroll">${followHtml}</div>`,'normal','mgmt-ac-follow-panel')}</aside><section class="mgmt-ac-pane">${mfPanneau(`<div class="mgmt-ac-feedhead">${mgmtActualitesTitreHtml(L.feed)}<span>${nonLues?`${esc(nonLues)} NON LUES`:esc(L.readAll)}</span></div><div class="ac83-feed-scroll">${news.length?grouped(L.latest,news.filter(x=>x.c>=latest))+grouped(L.before,news.filter(x=>x.c<latest)):`<p class="mgmt-ac-empty">${esc(L.noNews)}</p>`}</div>`,'normal','mgmt-ac-feed-panel')}</section><aside class="mgmt-ac-pane mgmt-ac-detail">${mfPanneau(detail,'normal','mgmt-ac-detail-panel')}</aside></div></main>`;
   const touches=[{ks:['Échap'],t:'Accueil',onclick:"CL.go('mgmt_accueil')"},{ks:['Tab'],t:'Colonne'},{ks:['↑','↓'],t:'Choisir'},{ks:['S'],t:L.unfollow,onclick:'mgmtActualitesUnfollowActive()'}];
   if(acteur) touches.push({ks:['Entrée'],t:'Préparer son combat',jaune:true,onclick:'CL.mgmtFicheCarte()'});
   return mfEcran(contenu,{barre:'jeu',courant:'actualites',prise:false,m,plaque:'Actualités',libelle:'TES SUIVIS ET TES ESPOIRS',droiteHtml:mgmtActualitesEnteteHtml(m),touches});
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
  Enter(){const el=document.activeElement;if(el&&el.classList.contains('mgmt-ac-follow')){const id=(el.getAttribute('onclick')||'').match(/\('([^']+)'\)/);if(id)CL.mgmtFiche(id[1]);}else if(el&&el.classList.contains('mgmt-ac-item'))el.click();else{const bouton=el&&el.closest('.mgmt-ac-actions button')||document.querySelector('.mgmt-ac-actions .principale');if(bouton)bouton.click();}},
  f(){document.querySelector('.mgmt-ac-secondary button:first-child')?.click();},F(){document.querySelector('.mgmt-ac-secondary button:first-child')?.click();},
  p(){document.querySelector('.mgmt-ac-secondary button:last-child')?.click();},P(){document.querySelector('.mgmt-ac-secondary button:last-child')?.click();},
  s(){mgmtActualitesUnfollowActive();},S(){mgmtActualitesUnfollowActive();},Escape(){CL.go('mgmt_accueil');}
});
function mgmtActualitesMove(delta){const els=[...document.querySelectorAll('.mgmt-ac-follow,.mgmt-ac-item')];if(!els.length)return;const i=els.indexOf(document.activeElement);els[Math.max(0,Math.min(els.length-1,i<0?0:i+delta))].focus();}
function mgmtActualitesUnfollowActive(){const el=document.activeElement;if(el&&el.classList.contains('mgmt-ac-follow')){const id=(el.getAttribute('onclick')||'').match(/\('([^']+)'\)/);if(id)CL.mgmtActualitesRetirer(id[1]);}}
