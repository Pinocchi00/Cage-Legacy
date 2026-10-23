"use strict";
/* ==== [ANCRE: P4_T23B_ARRIVEE] — Monde lot 38 T2 ==== */
const MGMT_ARRIVEE_TEXTES={
  plaque:'Ton arrivée',suite:'SUITE : TES ESPOIRS',intro:'Six noms. Garde ceux que tu veux voir grandir. Je te donnerai de leurs nouvelles, toutes les semaines.',
  gardes:'Gardés',garde:'GARDÉ',recruter:'À RECRUTER',entrer:'ENTRER DANS {org}, UNE FOIS LES TROIS GARDÉS',
  origine:'À RECRUTER · {pays}',objectif:'Le premier objectif vient de ce qui manque à {org}.'
}; /* Textes de Claude, relu:false. */
let MGMT_ARRIVEE={etape:1,retour:'mgmt_accueil'};
function mgmtArriveeOuvrir(etape=1,retour){
  if(!G||!G.mgmt)return;
  MGMT_ARRIVEE={etape:etape===2?2:1,retour:retour||'mgmt_accueil'};
  if(!Array.isArray(G.mgmt.espoirsPropose))mgmtEspoirsFixer(G.mgmt);
  CL.go('mgmt_arrivee');
}
function mgmtArriveeHtml(){
  const m=G&&G.mgmt;if(!m)return scr_mgmt_bureau();
  const L=MGMT_ARRIVEE_TEXTES,man=mgmtManque(m),org=mgmtOrgNom(m),step=MGMT_ARRIVEE.etape;
  let body='';
  if(step===1){
    body=mfPanneau(`<div class="ma-title">${esc(man?man.titre:'')}</div><div class="ma-lines">${(man?man.lignes:[]).map(x=>`<div class="ma-line"><span>${esc(x.libelle)}</span><b>${esc(x.valeur)}</b></div>`).join('')}</div>`,'choisi','ma-panel')
      +mfPanneau(`<div class="ma-objective">${esc(L.objectif.replace('{org}',org))}</div>${man&&man.objectif?`<div class="ma-objective-detail">${esc(man.objectif.texte)}</div>`:''}<div class="ma-leila">${esc(man?man.leila:'')}</div>`,'normal','ma-side')
      +mfBouton(L.suite,{touche:'Entrée',jaune:true,onclick:'CL.mgmtArriveeEtape(2)'});
  }else{
    const rows=mgmtEspoirsProposer(m),kept=mgmtEspoirs(m),required=Math.min(3,rows.length),ready=kept.length>=required;
    body=`<div class="ma-counter">${esc(L.gardes)} ${kept.length} / ${required}</div><div class="ma-intro">${esc(L.intro)}</div><div class="ma-cards">`+rows.map(x=>{
      const fighter=mgmtFighterById(m,x.id)||mgmtExteriorCombattant(m,x.id),isKept=kept.includes(x.id),outside=x.origine!=='effectif';
      const country=fighter&&fighter.ck?fighter.ck:'';
      const status=isKept?L.garde:(outside?L.origine.replace('{pays}',country):L.recruter);
      return `<article class="ma-card"><button class="ma-angle" onclick="CL.mgmtArriveeFiche('${escJsAttr(x.id)}')">${esc(x.etiquette)}</button><button class="ma-name" onclick="CL.mgmtArriveeFiche('${escJsAttr(x.id)}')">${esc(fighter&&fighter.name||x.id)}</button><div class="ma-record">${esc(x.fiche.bilan)}</div><div class="ma-meta">${esc(x.fiche.description)}</div><div class="ma-stats">${x.fiche.chiffres.map(s=>`<span>${esc(s.libelle)}<b>${esc(s.valeur)}</b></span>`).join('')}</div>${x.fiche.trait?`<div class="ma-trait">${esc(x.fiche.trait)}</div>`:''}<div class="ma-phrase">${esc(x.fiche.phrase)}</div><button class="ma-status" onclick="CL.mgmtArriveeToggle('${escJsAttr(x.id)}')">${esc(status)}</button></article>`;
    }).join('')+`</div><button class="ma-enter" ${ready?'':'disabled'} onclick="CL.mgmtArriveeEntrer()">${esc(L.entrer.replace('{org}',org))}</button>`;
  }
  const style='<style>.ma-scene{position:absolute;left:300px;top:112px;width:1564px;height:850px;color:#E9E6E1;font-family:Saira,"Arial Narrow",sans-serif}.ma-heading{font-size:26px;color:#F0B220;margin:0 0 20px}.ma-title{font-size:58px;color:#F0B220;text-transform:uppercase}.ma-lines{margin-top:28px}.ma-line{display:flex;justify-content:space-between;padding:18px;border-bottom:1px solid #625b59;font-size:24px}.ma-line b{font-family:"Saira Extra Condensed",sans-serif;font-size:34px}.ma-panel{position:absolute;left:0;top:20px;width:760px}.ma-side{position:absolute;left:810px;top:20px;width:650px}.ma-objective{font-size:30px}.ma-objective-detail,.ma-leila{font-size:24px;margin-top:24px}.ma-scene>.mf-bouton{position:absolute;left:1170px;top:700px}.ma-counter{font-size:26px;color:#F0B220}.ma-intro{font-size:24px;margin:12px 0}.ma-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.ma-card{height:590px;box-sizing:border-box;padding:16px;background:rgba(240,178,32,.07);border:3px solid #F0B220;display:flex;flex-direction:column;gap:10px;overflow:hidden}.ma-card button{font:inherit;color:inherit;background:transparent;border:0;cursor:pointer;text-align:left}.ma-angle{font-size:22px!important;color:#F0B220!important}.ma-name{font-family:"Saira Extra Condensed",sans-serif!important;font-size:42px!important;font-weight:800!important;text-transform:uppercase}.ma-record{font:800 40px "Saira Extra Condensed",sans-serif}.ma-meta{font-size:22px}.ma-stats{display:flex;gap:10px}.ma-stats span{flex:1;background:#252121;padding:8px;font-size:22px}.ma-stats b{display:block;font:800 26px "Saira Extra Condensed",sans-serif}.ma-trait{font:800 24px "Saira Extra Condensed",sans-serif;text-transform:uppercase}.ma-phrase{font-size:22px}.ma-status{margin-top:auto!important;font-size:23px!important;color:#F0B220!important}.ma-enter{position:absolute;right:0;bottom:12px;font:800 24px "Saira Extra Condensed",sans-serif;padding:16px;background:#F0B220;color:#0D0B0B;border:0}.ma-enter:disabled{opacity:.45}</style>';
  const content=`${style}<main class="mf-contenu ma-scene"><div class="ma-heading">${esc(step===1?'CE QUI MANQUE À '+org:'LEÏLA TE CONFIE TROIS ESPOIRS')}</div>${body}</main>`;
  return mfEcran(content,{barre:'jeu',courant:'accueil',grise:true,m,plaque:L.plaque,libelle:step===1?'CE QUI MANQUE':'TES TROIS ESPOIRS',droite:org,touches:step===1?[{ks:['Entrée'],t:'Suite : tes espoirs',jaune:true,onclick:'CL.mgmtArriveeEtape(2)'}]:[{ks:['F'],t:'Fiche'},{ks:['Tab'],t:'Entrer dans l’organisation',jaune:true,onclick:'CL.mgmtArriveeEntrer()'},{ks:['Échap'],t:'Ce qui manque'}]});
}
Object.assign(SCREENS,{mgmt_arrivee:mgmtArriveeHtml});
Object.assign(CL,{
  mgmtArriveeEtape(n){MGMT_ARRIVEE.etape=n===2?2:1;render();},
  mgmtArriveeToggle(id){const m=G&&G.mgmt;if(!m)return;if(mgmtEspoirs(m).includes(id))mgmtEspoirRendre(m,id);else mgmtEspoirGarder(m,id);saveMgmt();render();},
  mgmtArriveeFiche(id){MGMT_ARRIVEE.retour='mgmt_arrivee';CL.mgmtFiche(id);},
  mgmtArriveeEntrer(){if(!G||!G.mgmt)return;const n=Math.min(3,mgmtEspoirsProposer(G.mgmt).length);if(mgmtEspoirs(G.mgmt).length<n)return;CL.go('mgmt_accueil');}
});
keysRegister('mgmt_arrivee',{
  Enter(){if(MGMT_ARRIVEE.etape===1)CL.mgmtArriveeEtape(2);else{const id=mgmtEspoirsProposer(G.mgmt)[0];if(id)CL.mgmtArriveeToggle(id);}},
  Escape(){if(MGMT_ARRIVEE.etape===2)CL.mgmtArriveeEtape(1);else CL.go(MGMT_ARRIVEE.retour||'mgmt_accueil');},
  Tab(){if(MGMT_ARRIVEE.etape===2)CL.mgmtArriveeEntrer();},
  f(){const id=mgmtEspoirsProposer(G.mgmt)[0];if(id)CL.mgmtArriveeFiche(id);},F(){const id=mgmtEspoirsProposer(G.mgmt)[0];if(id)CL.mgmtArriveeFiche(id);}
});
