"use strict";
/* ==== [ANCRE: P4_T23B_ARRIVEE] — Monde lot 38 T2 ==== */
const MGMT_ESP_ARRIVEE_TEXTES={
  plaque:'Ton arrivée',suite:'SUITE : TES ESPOIRS',intro:'Six noms. Garde ceux que tu veux voir grandir. Je te donnerai de leurs nouvelles, toutes les semaines.',
  gardes:'Gardés',garde:'GARDÉ',recruter:'À RECRUTER',entrer:'ENTRER DANS {org}, UNE FOIS LES TROIS GARDÉS',
  origine:'À RECRUTER · {pays}',objectif:'Le premier objectif vient de ce qui manque à {org}.',
  manque:'Ce qui manque à {org}'
}; /* Textes de Claude, relu:false. */
/* ==== [ANCRE: P9_T2_POSTE_AFFICHAGE] — Monde lot 43 T2 ==== */
function mgmtPosteObjectifTexte(o){
  const labels={manque:'Répondre à ce qui manque','lourd-top15':'Un poids lourd dans le top 15 mondial','rang-orgs':'Finir dans les quatre premières organisations','champion-top5':'Un champion dans le top 5 mondial',caisse:'Une caisse positive',popularite:'Faire grandir la réputation',salle:'Remplir la salle','titre-demande':'Répondre à la demande du diffuseur'};
  return labels[o.t]||'Objectif de la saison';
}
function mgmtPosteValeurTexte(m,o){const v=mgmtPosteValeur(m,o);return o.t==='rang-orgs'?`${v}e sur 8`:o.t==='caisse'?mgmtEuros(v):o.t==='manque'?(v?'tenu':'à faire'):`${v}`;}
/* ==== [ANCRE: P9_T2_CONTRAT_DATE] — Monde lot 43 T2 ==== */
function mgmtPosteDateTexte(jour){return typeof mgmtJourDateTexte==='function'?mgmtJourDateTexte(jour):String(jour);}
let MGMT_ESP_ARRIVEE={etape:1,retour:'mgmt_accueil',i:0};
function mgmtEspArriveeOuvrir(etape=1,retour){
  if(!G||!G.mgmt)return;
  MGMT_ESP_ARRIVEE={etape:G.mgmt.poste?(etape===3?3:etape===2?2:1):(etape===2?2:1),retour:retour||'mgmt_accueil',i:0};
  if(!Array.isArray(G.mgmt.espoirsPropose)){mgmtEspoirsFixer(G.mgmt);saveMgmt();}
  CL.go('mgmt_espoirs_arrivee');
}
/* ==== [ANCRE: FIDELITE_ARRIVEE_20261028] — Reprise visuelle des planches UniArriveeContrat et UniArriveeEspoirs ==== */
function mgmtEspArriveeContratHtml(m,man,org){
  const p=m.poste,patron=mgmtPostePatron(m),quote=mgmtPosteNiveau(p.conf),rdv=mgmtJourDate(p.debut+182);
  const fin=mgmtJourDate(p.fin),annee=new Date(mgmtJourDate(p.debut).ts).getUTCFullYear();
  const rows=p.obj.map((o,i)=>`<div class="po-objectif"><b>${i+1}</b><div>${esc(mgmtPosteObjectifTexte(o,m))}<small>Aujourd'hui : ${esc(mgmtPosteValeurTexte(m,o))}</small></div></div>`).join('');
  const contrat=mfPanneau(`<div class="po-panel-head"><h2 class="po-title">TON CONTRAT<i class="po-trait" aria-hidden="true"></i></h2><div class="po-seal"><span>1</span></div></div><div class="po-caption">${esc(patron)}, PATRON DE ${esc(org)}</div><p class="po-quote">${esc(quote.banque[0].texte)}</p><div class="po-meta"><span>Durée<b>1 AN</b></span><span>Jusqu’au<b>${esc(fin.jour+' '+fin.mois+' '+new Date(fin.ts).getUTCFullYear())}</b></span><span>Salaire<b>${esc(mgmtEuros(p.salaire/1000))} PAR MOIS</b></span><span>Rendez-vous<b>MI-SAISON, EN ${esc(rdv.mois)}</b></span><span>Ta réputation<b>TOUT À FAIRE</b></span></div><p class="po-issues">À la fin de l’année, trois issues : <b>prolongé et augmenté</b>, prolongé sous condition, ou remercié.</p>`,'normal','po-card');
  const attentes=mfPanneau(`<div class="po-panel-head"><h2 class="po-title">CE QU’IL ATTEND<i class="po-trait" aria-hidden="true"></i></h2><div class="po-caption">SAISON ${esc(annee)}</div></div><div class="po-objectifs">${rows}</div><p class="po-note"><i class="po-note-pastille" aria-hidden="true"></i>${esc(MGMT_ESP_ARRIVEE_TEXTES.objectif.replace('{org}',org))}</p>`,'normal','po-card');
  const next=MGMT_ESP_ARRIVEE.etape===1?2:3;
  const manque=mfPanneau(`<div class="po-manque"><div class="po-caption">${esc(MGMT_ESP_ARRIVEE_TEXTES.manque.replace('{org}',org).toUpperCase())}</div><div class="ma-title">${esc(man?man.titre:'')}</div><div class="ma-lines">${(man?man.lignes:[]).map(x=>`<div class="ma-line"><span>${esc(x.libelle)}</span><b>${esc(x.valeur)}</b></div>`).join('')}</div><div class="ma-leila"><div class="ma-leila-nom">LEÏLA</div><div>${esc(man&&man.leila?'« '+man.leila+' »':'')}</div></div>${man&&man.objectif?`<div class="ma-objective-detail">${esc(man.objectif.texte)}</div>`:''}</div><div class="po-action">${mfBouton(next===2?'SUITE : CE QUI MANQUE':MGMT_ESP_ARRIVEE_TEXTES.suite,{touche:'Entrée',jaune:true,onclick:`CL.mgmtEspArriveeEtape(${next})`})}</div>`,'normal','po-card');
  return `<div class="po-panels">${contrat}${attentes}${manque}</div>`;
}
function mgmtEspArriveePropositions(m){
  const ordre=['reponse','monte','libre','jeune','oublie','revenant'];
  return mgmtEspoirsProposer(m).slice().sort((a,b)=>ordre.indexOf(a.angle)-ordre.indexOf(b.angle));
}
function mgmtEspArriveeSelection(m){
  const rows=mgmtEspArriveePropositions(m);
  return rows[Math.max(0,Math.min(rows.length-1,MGMT_ESP_ARRIVEE.i||0))];
}
function mgmtEspArriveeCartesHtml(m,rows=mgmtEspArriveePropositions(m)){
  const L=MGMT_ESP_ARRIVEE_TEXTES,kept=mgmtEspoirs(m);
  const selected=Math.max(0,Math.min(rows.length-1,MGMT_ESP_ARRIVEE.i||0));
  return `<div class="ma-intro"><b>LEÏLA</b><span>« ${esc(L.intro)} »</span></div><div class="ma-cards">`+rows.map((x,i)=>{
    const fighter=mgmtFighterById(m,x.id)||mgmtExteriorCombattant(m,x.id),isKept=kept.includes(x.id),outside=x.origine!=='effectif';
    const country=fighter&&fighter.ck?fighter.ck:'',nom=String(fighter&&fighter.name||x.id).trim(),noms=nom.split(/\s+/),structure=fighter&&fighter.first&&fighter.last&&nom===fighter.first+' '+fighter.last;
    const first=structure?fighter.first:noms.length>1?noms.shift():'',last=structure?fighter.last:noms.join(' ')||nom;
    const status=isKept?L.garde:(outside&&country?L.origine.replace('{pays}',country):L.recruter);
    const trait=x.fiche.trait,info=trait&&typeof mgmtTraitInfo==='function'?mgmtTraitInfo(trait.toLowerCase()):null;
    return `<article class="ma-card" data-selected="${i===selected}" data-kept="${isKept}" onclick="CL.mgmtEspArriveeToggle('${escJsAttr(x.id)}')"><div class="ma-top"><button class="ma-angle" onclick="event.stopPropagation();CL.mgmtEspArriveeFiche('${escJsAttr(x.id)}')">${esc(x.angle==='libre'&&outside?status:x.etiquette)}</button>${isKept?`<button class="ma-status" onclick="event.stopPropagation();CL.mgmtEspArriveeToggle('${escJsAttr(x.id)}')"><svg width="22" height="22" viewBox="0 0 20 20" aria-hidden="true"><path d="m4 10 4 4 8-9" fill="none" stroke="currentColor" stroke-width="3"></path></svg>${esc(L.garde)}</button>`:i===selected?`<button class="ma-status" onclick="event.stopPropagation();CL.mgmtEspArriveeToggle('${escJsAttr(x.id)}')">${mfTouche('Entrée',true)} GARDER</button>`:''}</div><div class="ma-identity"><button class="ma-name" onclick="event.stopPropagation();CL.mgmtEspArriveeFiche('${escJsAttr(x.id)}')">${first?`<span class="ma-first">${esc(first)}</span>`:''}<span class="ma-last" style="--ma-name-size:${mfCorps(last.toUpperCase(),310,58,22)}px">${esc(last)}</span></button><div class="ma-record">${esc(x.fiche.bilan)}</div></div><div class="ma-meta">${esc(x.fiche.description+(outside&&!isKept&&x.angle!=='libre'?' · '+status:''))}</div><div class="ma-stats">${x.fiche.chiffres.map(s=>`<span>${esc(s.libelle)}<b>${esc(s.valeur)}</b></span>`).join('')}</div>${trait?`<div class="ma-trait"><i aria-hidden="true">•</i>${esc(info?info.nom:trait)}</div>`:''}<div class="ma-phrase">${esc(x.fiche.phrase)}</div></article>`;
  }).join('')+'</div>';
}
function mgmtEspArriveeFlowHtml(m,step,rows){
  const labels=m.poste?['TON CONTRAT','CE QUI MANQUE','TES TROIS ESPOIRS']:['CE QUI MANQUE','TES TROIS ESPOIRS'];
  const steps=labels.map((t,i)=>`<button type="button" class="ma-step" ${step===i+1?'aria-current="step" ':''}data-done="${step>i+1}" onclick="CL.mgmtEspArriveeEtape(${i+1})"><b>${step>i+1?'<svg width="22" height="22" viewBox="0 0 20 20" aria-hidden="true"><path d="m4 10 4 4 8-9" fill="none" stroke="currentColor" stroke-width="3"></path></svg>':i+1}</b> ${esc(t)}</button>`).join(' · ');
  const cards=step===(m.poste?3:2),n=cards?mgmtEspoirs(m).length:0,required=cards?Math.min(3,(rows||mgmtEspoirsProposer(m)).length):0;
  const date=m.poste&&!cards?new Date(mgmtJourDate(m.poste.debut).ts).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}):'';
  return `<div class="ma-toolbar"><div class="po-flow">${steps}</div>${cards?`<div class="ma-counter">${esc(MGMT_ESP_ARRIVEE_TEXTES.gardes)} <b>${n} / ${required}</b></div>`:date?`<div class="ma-day">${esc(date)}, ton premier jour</div>`:''}</div>`;
}
/* ==== [FIN ANCRE] ==== */
const MGMT_ESP_FID_STYLE=`<style>
.ma-fid.ma-scene{position:absolute;left:300px;top:128px;width:1564px;height:856px;display:flex;flex-direction:column;gap:16px;font:500 24px/1 var(--mf-texte);color:#E9E6E1;overflow:visible}
.ma-fid .ma-heading{display:none}
.ma-fid .ma-toolbar{height:64px;flex:none;display:flex;justify-content:space-between;align-items:center;gap:16px}
.ma-fid .po-flow{display:flex;align-items:center;gap:8px;margin:0;font:500 22px/1 var(--mf-texte);flex:none}
.ma-fid .ma-step{height:56px;box-sizing:border-box;padding:0 18px;display:flex;align-items:center;gap:12px;background:transparent;border:2px solid rgba(233,230,225,.38);color:#E9E6E1;font:800 28px/1 var(--mf-titre);clip-path:polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px);cursor:pointer}
.ma-fid .ma-step b{width:30px;height:30px;flex:none;display:flex;align-items:center;justify-content:center;background:#252121;font:800 22px/1 var(--mf-titre);clip-path:polygon(29.3% 0,70.7% 0,100% 29.3%,100% 70.7%,70.7% 100%,29.3% 100%,0 70.7%,0 29.3%)}
.ma-fid .ma-step[aria-current="step"]{background:#F0B220;color:#0D0B0B;border-color:#F0B220}
.ma-fid .ma-step[aria-current="step"] b{background:#0D0B0B;color:#F0B220}
.ma-fid .ma-step[data-done="true"]{background:#252121;border-color:#252121}
.ma-fid .ma-step[data-done="true"] b{background:#E9E6E1;color:#0D0B0B}
.ma-fid .ma-day{font:500 24px/1 var(--mf-texte);color:rgba(233,230,225,.74);text-align:right}
.ma-fid .ma-counter{position:static;display:flex;align-items:center;gap:14px;font:500 24px/1 var(--mf-texte);color:#E9E6E1}
.ma-fid .ma-counter b{font:800 48px/.8 var(--mf-titre)}
.ma-fid .po-panels{display:flex;gap:16px;flex:1;min-height:0}
.ma-fid .po-card{position:static;display:flex;flex:1;width:auto;height:auto;padding:2px;min-width:0;min-height:0;box-sizing:border-box}
.ma-fid .po-card+.po-card{position:static;left:auto;right:auto;width:auto;flex:1.15}
.ma-fid .po-card+.po-card+.po-card{flex:1.1}
.ma-fid .po-card>.mf-p2{display:flex;flex:1;min-width:0;min-height:0;padding:5px}
.ma-fid .po-card>.mf-p2>.mf-p3{display:flex;flex-direction:column;flex:1;min-width:0;min-height:0;padding:15px;gap:16px;overflow-y:auto;overflow-x:visible}
.ma-fid .po-panel-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex:none}
.ma-fid .po-title{margin:0;display:flex;flex-direction:column;gap:12px;font:800 44px/.75 var(--mf-titre);color:#E9E6E1}
.ma-fid .po-trait{display:block;width:56px;height:8px;flex:none;background:#E23A2B;clip-path:polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%)}
.ma-fid .po-seal{display:flex;align-items:center;justify-content:center;width:56px;height:56px;flex:none;background:#F0B220;clip-path:polygon(29.3% 0,70.7% 0,100% 29.3%,100% 70.7%,70.7% 100%,29.3% 100%,0 70.7%,0 29.3%)}
.ma-fid .po-seal span{width:50px;height:50px;display:flex;align-items:center;justify-content:center;background:#0D0B0B;color:#F0B220;font:800 30px/1 var(--mf-titre);clip-path:polygon(29.3% 0,70.7% 0,100% 29.3%,100% 70.7%,70.7% 100%,29.3% 100%,0 70.7%,0 29.3%)}
.ma-fid .po-caption{font:600 22px/1.1 var(--mf-texte);letter-spacing:.04em;color:rgba(233,230,225,.74);overflow-wrap:anywhere;text-transform:uppercase}
.ma-fid .po-quote{margin:0;font:italic 500 26px/1.2 var(--mf-texte);flex:none;overflow-wrap:anywhere}
.ma-fid .po-meta{display:flex;flex-direction:column;flex:none}
.ma-fid .po-meta span{display:flex;justify-content:space-between;align-items:baseline;gap:16px;padding:12px 0;border-bottom:2px solid rgba(233,230,225,.16);font:500 24px/1.1 var(--mf-texte);color:rgba(233,230,225,.74)}
.ma-fid .po-meta b{font:800 32px/1 var(--mf-titre);color:#E9E6E1;text-align:right;overflow-wrap:anywhere;min-width:0}
.ma-fid .po-issues{margin:0;margin-top:auto;padding-top:16px;font:500 24px/1.2 var(--mf-texte)}
.ma-fid .po-objectifs{display:flex;flex-direction:column;flex:none}
.ma-fid .po-objectif{display:flex;gap:16px;align-items:flex-start;padding:14px 0;border-bottom:2px solid rgba(233,230,225,.16);font:500 26px/1.1 var(--mf-texte)}
.ma-fid .po-objectif>b{width:44px;height:44px;flex:none;display:flex;align-items:center;justify-content:center;background:#E9E6E1;color:#0D0B0B;font:800 26px/1 var(--mf-titre);clip-path:polygon(29.3% 0,70.7% 0,100% 29.3%,100% 70.7%,70.7% 100%,29.3% 100%,0 70.7%,0 29.3%)}
.ma-fid .po-objectif:first-child>b{background:#F0B220}
.ma-fid .po-objectif>div{flex:1;min-width:0;overflow-wrap:anywhere}
.ma-fid .po-objectif small{display:block;margin-top:8px;font:500 22px/1.1 var(--mf-texte);color:rgba(233,230,225,.74)}
.ma-fid .po-note{margin:0;margin-top:auto;padding-top:16px;display:flex;align-items:center;gap:12px;font:500 24px/1.15 var(--mf-texte)}
.ma-fid .po-note-pastille{display:block;flex:none;width:18px;height:18px;background:#F0B220;clip-path:polygon(29.3% 0,70.7% 0,100% 29.3%,100% 70.7%,70.7% 100%,29.3% 100%,0 70.7%,0 29.3%)}
.ma-fid .po-manque{display:flex;flex-direction:column;gap:18px}
.ma-fid .po-manque .ma-title{margin:0;font:800 72px/.85 var(--mf-titre);color:#E23A2B;text-transform:uppercase;overflow-wrap:anywhere}
.ma-fid .po-manque .ma-lines{margin:0}
.ma-fid .po-manque .ma-line{display:flex;gap:16px;align-items:baseline;justify-content:space-between;padding:12px 0;border-bottom:2px solid rgba(233,230,225,.16);font:500 24px/1.1 var(--mf-texte);color:rgba(233,230,225,.74)}
.ma-fid .po-manque .ma-line b{font:800 32px/1 var(--mf-titre);text-align:right;color:#E9E6E1;min-width:0;overflow-wrap:anywhere}
.ma-fid .po-manque .ma-leila{display:flex;flex-direction:column;gap:10px;margin:0;font:italic 500 26px/1.2 var(--mf-texte)}
.ma-fid .po-manque .ma-leila-nom{font:600 22px/1 var(--mf-texte);letter-spacing:.04em;color:rgba(233,230,225,.74)}
.ma-fid .po-manque .ma-leila>div:last-child{font-style:italic}
.ma-fid .po-manque .ma-objective-detail{margin:0;font:500 24px/1.15 var(--mf-texte)}
.ma-fid .po-action{display:flex;justify-content:flex-end;margin-top:auto;padding-top:16px;flex:none}
.ma-fid .po-action .mf-bouton{position:static;max-width:100%;height:auto;min-height:60px;padding:12px 22px}
.ma-fid .po-action .mf-bouton-t{font-size:32px;white-space:normal}
.ma-fid .ma-intro{position:static;display:flex;align-items:center;gap:18px;min-height:70px;box-sizing:border-box;margin:0;padding:12px 22px;border-left:6px solid #F0B220;background:#1B1818;font:italic 500 26px/1.1 var(--mf-texte);flex:none}
.ma-fid .ma-intro b{font:800 30px/1 var(--mf-titre);color:#F0B220;flex:none}
.ma-fid .ma-intro>span{font-style:italic}
.ma-fid .ma-cards{position:static;display:grid;flex:1;min-height:0;width:auto;grid-template-columns:repeat(3,minmax(0,1fr));grid-template-rows:repeat(2,minmax(0,1fr));gap:16px}
.ma-fid .ma-card{position:relative;display:flex;flex-direction:column;gap:10px;height:auto;min-width:0;min-height:0;padding:16px 20px;box-sizing:border-box;background:#121010;border:2px solid rgba(233,230,225,.16);clip-path:polygon(18px 0,100% 0,100% calc(100% - 18px),calc(100% - 18px) 100%,0 100%,0 18px);overflow-y:auto;overflow-x:visible;cursor:pointer}
.ma-fid .ma-card[data-selected="true"]{border:4px solid #E9E6E1}
.ma-fid .ma-card[data-kept="true"]{border:4px solid #F0B220;background:rgba(240,178,32,.07)}
.ma-fid .ma-card button{position:static;box-sizing:border-box;margin:0;padding:0;border:0;background:transparent;color:inherit;cursor:pointer;text-align:left}
.ma-fid .ma-top{display:flex;align-items:center;justify-content:space-between;gap:12px;flex:none;min-height:36px}
.ma-fid .ma-card .ma-angle{position:static;font:600 22px/1 var(--mf-texte)!important;color:rgba(233,230,225,.74)!important;letter-spacing:.04em;min-width:0}
.ma-fid .ma-card[data-kept="true"] .ma-angle{color:#F0B220!important}
.ma-fid .ma-card .ma-status{position:static;display:flex;align-items:center;gap:8px;flex:none;margin:0!important;background:transparent!important;color:#F0B220!important;font:800 26px/1 var(--mf-titre)!important;padding:0!important}
.ma-fid .ma-card .ma-status .mf-k{font:500 24px/1 var(--mf-texte)}
.ma-fid .ma-card[data-kept="true"] .ma-status{height:36px;padding:0 12px!important;background:#F0B220!important;color:#0D0B0B!important;clip-path:polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)}
.ma-fid .ma-identity{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex:none;min-width:0}
.ma-fid .ma-card .ma-name{position:static;display:flex;flex-direction:column;gap:6px;width:auto;height:auto;min-width:0;flex:1;font:800 58px/.75 var(--mf-titre)!important;white-space:normal;overflow:visible}
.ma-fid .ma-first{display:block;font:800 28px/.8 var(--mf-titre);overflow-wrap:anywhere}
.ma-fid .ma-last{display:block;font:800 var(--ma-name-size,58px)/.75 var(--mf-titre);overflow-wrap:anywhere}
.ma-fid .ma-record{position:static;flex:none;font:800 52px/.75 var(--mf-titre)}
.ma-fid .ma-meta{position:static;font:500 22px/1.1 var(--mf-texte);color:rgba(233,230,225,.74);flex:none}
.ma-fid .ma-stats{position:static;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;width:auto;flex:none}
.ma-fid .ma-stats span,.ma-fid .ma-stats span+span{display:flex;flex-direction:column;justify-content:center;gap:6px;width:auto;min-width:0;height:52px;min-height:52px;box-sizing:border-box;padding:0 12px;background:#252121;clip-path:polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px);font:500 22px/1 var(--mf-texte);color:rgba(233,230,225,.74)}
.ma-fid .ma-stats b{font:800 28px/.8 var(--mf-titre);color:#E9E6E1}
.ma-fid .ma-trait{position:static;display:flex;align-items:center;gap:10px;flex:none;font:800 28px/1 var(--mf-titre)}
.ma-fid .ma-trait i{display:flex;align-items:center;justify-content:center;width:32px;height:32px;flex:none;background:#E9E6E1;color:#0D0B0B;clip-path:polygon(29.3% 0,70.7% 0,100% 29.3%,100% 70.7%,70.7% 100%,29.3% 100%,0 70.7%,0 29.3%);font:800 26px/1 var(--mf-titre);font-style:normal}
.ma-fid .ma-phrase{position:static;font:500 24px/1.1 var(--mf-texte);flex:none;margin-top:auto}
.ma-fid .ma-enter{display:none}
</style>`;

function mgmtEspArriveeHtml(){
  const m=G&&G.mgmt;if(!m)return scr_mgmt_bureau();
  const L=MGMT_ESP_ARRIVEE_TEXTES,man=mgmtManque(m),org=mgmtOrgNom(m),step=MGMT_ESP_ARRIVEE.etape;
  const propositions=step===(m.poste?3:2)?mgmtEspArriveePropositions(m):null;
  let body='';
  if(step<=2&&m.poste){
    body=mgmtEspArriveeContratHtml(m,man,org);
}else if(step===1&&!m.poste){
    body=mfPanneau(`<div class="ma-title">${esc(man?man.titre:'')}</div><div class="ma-lines">${(man?man.lignes:[]).map(x=>`<div class="ma-line"><span>${esc(x.libelle)}</span><b>${esc(x.valeur)}</b></div>`).join('')}</div><div class="ma-leila"><div class="ma-leila-nom">LEÏLA</div><div>${esc(man&&man.leila?'« '+man.leila+' »':'')}</div></div>`,'choisi','ma-panel')
      +mfPanneau(`<div class="ma-objective">${esc(L.objectif.replace('{org}',org))}</div>${man&&man.objectif?`<div class="ma-objective-detail">${esc(man.objectif.texte)}</div>`:''}`,'normal','ma-side')
      +mfBouton(L.suite,{touche:'Entrée',jaune:true,onclick:`CL.mgmtEspArriveeEtape(${m.poste?3:2})`});
  }else{
    body=mgmtEspArriveeCartesHtml(m,propositions);
  }
  const style='<style>.ma-scene{position:absolute;left:300px;top:112px;width:1564px;height:850px;color:#E9E6E1;font-family:Saira,"Arial Narrow",sans-serif}.ma-heading{font-size:26px;color:#F0B220;margin:0 0 20px}.ma-title{font-size:58px;color:#F0B220;text-transform:uppercase}.ma-lines{margin-top:28px}.ma-line{display:flex;justify-content:space-between;padding:18px;border-bottom:1px solid #625b59;font-size:24px}.ma-line b{font-family:"Saira Extra Condensed",sans-serif;font-size:34px}.ma-panel{position:absolute;left:0;top:20px;width:760px}.ma-side{position:absolute;left:810px;top:20px;width:650px}.ma-objective{font-size:30px}.ma-objective-detail,.ma-leila{font-size:24px;margin-top:24px}.ma-scene>.mf-bouton{position:absolute;left:1170px;top:700px}.ma-counter{font-size:26px;color:#F0B220}.ma-intro{font-size:24px;margin:12px 0}.ma-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.ma-card{height:590px;box-sizing:border-box;padding:16px;background:rgba(240,178,32,.07);border:3px solid #F0B220;display:flex;flex-direction:column;gap:10px;overflow:hidden}.ma-card button{font:inherit;color:inherit;background:transparent;border:0;cursor:pointer;text-align:left}.ma-angle{font-size:22px!important;color:#F0B220!important}.ma-name{font-family:"Saira Extra Condensed",sans-serif!important;font-size:42px!important;font-weight:800!important;text-transform:uppercase}.ma-record{font:800 40px "Saira Extra Condensed",sans-serif}.ma-meta{font-size:22px}.ma-stats{display:flex;gap:10px}.ma-stats span{flex:1;background:#252121;padding:8px;font-size:22px}.ma-stats b{display:block;font:800 26px "Saira Extra Condensed",sans-serif}.ma-trait{font:800 24px "Saira Extra Condensed",sans-serif;text-transform:uppercase}.ma-phrase{font-size:22px}.ma-status{margin-top:auto!important;font-size:23px!important;color:#F0B220!important}.ma-enter{position:absolute;right:0;bottom:12px;font:800 24px "Saira Extra Condensed",sans-serif;padding:16px;background:#F0B220;color:#0D0B0B;border:0}.ma-enter:disabled{opacity:.45}</style>';
  const mesure=step===(m.poste?2:1)?'<style>.ma-scene{top:128px;height:856px}.ma-panel{top:0;height:856px}.ma-side{top:0;height:856px}.ma-panel>.mf-p2>.mf-p3,.ma-side>.mf-p2>.mf-p3{padding:15px;gap:16px}.ma-title{font:800 72px/.85 "Saira Extra Condensed",sans-serif;color:#E23A2B}.ma-lines{margin-top:18px}.ma-line{padding:14px 0;border-bottom:2px solid rgba(233,230,225,.16)}.ma-line b{font:800 32px/1 "Saira Extra Condensed",sans-serif}.ma-leila{display:flex;flex-direction:column;gap:10px;margin:0;font:italic 500 26px/1.2 Saira,sans-serif}.ma-leila-nom{font:600 22px/1 Saira,sans-serif;font-style:normal;letter-spacing:.04em;color:rgba(233,230,225,.74)}</style>':step===(m.poste?3:2)?'<style>.ma-scene{top:128px;height:856px}.ma-heading{display:none}.ma-counter{position:absolute;right:0;top:0;font:500 24px/48px Saira,sans-serif;color:#E9E6E1}.ma-counter::first-line{font-weight:500}.ma-intro{position:absolute;left:28px;top:74px;margin:0;font:500 26px/34px Saira,sans-serif;color:#E9E6E1}.ma-cards{position:absolute;left:0;top:166px;width:1564px;grid-template-columns:repeat(3,511px);grid-template-rows:repeat(2,337px);column-gap:16px;row-gap:16px}.ma-card{height:337px;padding:15px;gap:0;position:relative;display:block}.ma-card .ma-angle{position:absolute;left:24px;top:21px;font:600 22px/26px Saira,sans-serif!important}.ma-card .ma-name{position:absolute;left:24px;top:61px;width:360px;height:66px;font:800 58px/1 "Saira Extra Condensed",sans-serif!important;white-space:nowrap;overflow:hidden}.ma-record{position:absolute;right:22px;top:68px;font:800 52px/1 "Saira Extra Condensed",sans-serif}.ma-meta{position:absolute;left:24px;top:132px;font:500 22px/28px Saira,sans-serif;color:rgba(233,230,225,.74)}.ma-stats{position:absolute;left:24px;top:165px;width:460px;gap:0}.ma-stats span{background:none;padding:0;width:247px;flex:none;font:500 22px/25px Saira,sans-serif;color:rgba(233,230,225,.74)}.ma-stats span+span{width:213px}.ma-stats b{font:800 28px/32px "Saira Extra Condensed",sans-serif;color:#E9E6E1}.ma-trait{position:absolute;left:24px;top:226px;font:800 28px/32px "Saira Extra Condensed",sans-serif}.ma-phrase{position:absolute;left:24px;top:275px;font:500 24px/30px Saira,sans-serif}.ma-status{position:absolute;right:18px;top:13px;margin:0!important;background:#F0B220!important;color:#0D0B0B!important;padding:8px 12px!important;font:800 26px/32px "Saira Extra Condensed",sans-serif!important}.ma-enter{display:none}.ma-card .ma-name-l{font-size:46px!important}.ma-card .ma-name-tl{font-size:38px!important}.ma-card .ma-name{left:42px}.ma-card .ma-status{right:14px}</style>':'';
  const flow=m.poste?'1 TON CONTRAT · 2 CE QUI MANQUE · 3 TES TROIS ESPOIRS':'1 CE QUI MANQUE · 2 TES TROIS ESPOIRS';
   const poStyle='<style>.po-flow{font-size:22px;color:#E9E6E1;margin:0 0 20px}.po-card{position:absolute;top:20px;height:730px;box-sizing:border-box;color:#E9E6E1}.po-card{left:0;width:55%}.po-card+.po-card{left:auto;right:0;width:43%}.po-title{font:800 44px "Saira Extra Condensed",sans-serif;color:#E23A2B}.po-meta{display:flex;flex-direction:column}.po-meta span{display:flex;justify-content:space-between;padding:12px 0;border-bottom:2px solid rgba(233,230,225,.16);font-size:24px}.po-meta b{font:800 32px "Saira Extra Condensed",sans-serif}.po-quote,.po-note{font-size:24px;font-style:italic}.po-issues{font-size:24px;margin-top:32px}.po-objectif{display:flex;gap:16px;padding:14px 0;border-bottom:2px solid rgba(233,230,225,.16);font-size:26px}.po-objectif b{font-size:26px;color:#F0B220}.po-objectif small{display:block;font-size:22px;color:rgba(233,230,225,.74)}.po-note{margin-top:30px}</style>';
  const moderne=!!m.poste||step===2,cartes=step===(m.poste?3:2);
  const identite=mgmtOrgIdentite((mgmtOrgParNom(org)||{}).id);
  const libelle=cartes?'LEÏLA TE CONFIE TROIS ESPOIRS':m.poste?[org,identite&&identite.ville,identite&&identite.annee?'DEPUIS '+identite.annee:''].filter(Boolean).join(' · '):'CE QUI MANQUE';
  const head=moderne?mgmtEspArriveeFlowHtml(m,step,propositions):`<div class="ma-heading">${esc(L.manque.replace('{org}',org))}</div><div class="po-flow">${esc(flow)}</div>`;
  const content=`${style}${mesure}${poStyle}${moderne?MGMT_ESP_FID_STYLE:''}<main class="mf-contenu ma-scene${moderne?' ma-fid':''}">${head}${body}</main>`;
  return mfEcran(content,{barre:'jeu',courant:'accueil',grise:true,m,plaque:L.plaque,libelle,droite:`${org} Fight Night ${(m.eventsPlayed||0)+1}`,touches:cartes?[{ks:['↑','↓','←','→'],t:'Choisir'},{ks:['F'],t:'Sa fiche',onclick:'CL.mgmtEspArriveeFicheSelection()'},{ks:['Entrée'],t:'Garder ou rendre',jaune:true,onclick:'CL.mgmtEspArriveeGarderSelection()'},{ks:['Tab'],t:L.entrer.replace('{org}',org),onclick:'CL.mgmtEspArriveeEntrer()'}]:[{ks:['←','→'],t:'Étape'},{ks:['Échap'],t:'Revoir l’étape d’avant',onclick:`CL.mgmtEspArriveeEtape(${Math.max(1,step-1)})`},{ks:['Entrée'],t:'Suite',jaune:true,onclick:`CL.mgmtEspArriveeEtape(${step+1})`}]});
}
Object.assign(SCREENS,{mgmt_espoirs_arrivee:mgmtEspArriveeHtml});
  Object.assign(CL,{
   mgmtEspArriveeChoisir(delta){const m=G&&G.mgmt;if(!m||MGMT_ESP_ARRIVEE.etape!==(m.poste?3:2))return;const rows=mgmtEspArriveePropositions(m);MGMT_ESP_ARRIVEE.i=Math.max(0,Math.min(rows.length-1,(MGMT_ESP_ARRIVEE.i||0)+delta));render();},
   mgmtEspArriveeGarderSelection(){const m=G&&G.mgmt;if(!m)return;const x=mgmtEspArriveeSelection(m);if(x)CL.mgmtEspArriveeToggle(x.id);},
   mgmtEspArriveeFicheSelection(){const m=G&&G.mgmt;if(!m)return;const x=mgmtEspArriveeSelection(m);if(x)CL.mgmtEspArriveeFiche(x.id);},
    mgmtEspArriveeEtape(n){MGMT_ESP_ARRIVEE.etape=G&&G.mgmt&&G.mgmt.poste?Math.max(1,Math.min(3,n)):n===2?2:1;render();},
   mgmtEspArriveeToggle(id){const m=G&&G.mgmt;if(!m)return;const i=mgmtEspArriveePropositions(m).findIndex(x=>x.id===id);if(i>=0)MGMT_ESP_ARRIVEE.i=i;if(mgmtEspoirs(m).includes(id))mgmtEspoirRendre(m,id);else mgmtEspoirGarder(m,id);saveMgmt();render();},
   mgmtEspArriveeFiche(id){MGMT_ESP_ARRIVEE.retour='mgmt_espoirs_arrivee';CL.mgmtFiche(id);},
   mgmtEspArriveeEntrer(){if(!G||!G.mgmt)return;const n=Math.min(3,mgmtEspoirsProposer(G.mgmt).length);if(mgmtEspoirs(G.mgmt).length<n)return;CL.go('mgmt_carte');}
 });
keysRegister('mgmt_espoirs_arrivee',{
   Enter(){if(MGMT_ESP_ARRIVEE.etape<(G.mgmt.poste?3:2))CL.mgmtEspArriveeEtape(MGMT_ESP_ARRIVEE.etape+1);else CL.mgmtEspArriveeGarderSelection();},
   Escape(){if(MGMT_ESP_ARRIVEE.etape>1)CL.mgmtEspArriveeEtape(MGMT_ESP_ARRIVEE.etape-1);else CL.go(MGMT_ESP_ARRIVEE.retour||'mgmt_accueil');},
   Tab(){if(MGMT_ESP_ARRIVEE.etape===(G.mgmt.poste?3:2))CL.mgmtEspArriveeEntrer();},
   ArrowLeft(){if(MGMT_ESP_ARRIVEE.etape===(G.mgmt.poste?3:2))CL.mgmtEspArriveeChoisir(-1);else CL.mgmtEspArriveeEtape(MGMT_ESP_ARRIVEE.etape-1);},
   ArrowRight(){if(MGMT_ESP_ARRIVEE.etape===(G.mgmt.poste?3:2))CL.mgmtEspArriveeChoisir(1);else CL.mgmtEspArriveeEtape(MGMT_ESP_ARRIVEE.etape+1);},
   ArrowUp(){CL.mgmtEspArriveeChoisir(-3);},ArrowDown(){CL.mgmtEspArriveeChoisir(3);},
  f(){CL.mgmtEspArriveeFicheSelection();},F(){CL.mgmtEspArriveeFicheSelection();}
 });
