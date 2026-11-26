"use strict";
/* Maquette lot 1 — La place des Suivis (Q13, validé le 25/11). Retour du 09/11 : ni dans Messages, ni dans Recrutement.
   Retenu le 25/11 : dans l'Effectif, un bouton « Suivis » à côté de l'Infirmerie, comme elle. Aucune nouvelle entrée de barre.
   L'Accueil en garde l'aperçu (une info par suivi) ; « Tout voir › » ouvre la liste.
   Une seule liste : S.rc.suivis, déjà utilisée par Recrutement et Rapports ; la fiche suit et ne suit plus (bouton « Suivre » existant).
   Chargé après finsaison.js (et prolongation.js), avant barre.js. Préfixe su. Seule la clé maquette-suivis-1 est écrite. */

const SU_CLE='maquette-suivis-1';
S.su={tri:{col:'change',sens:-1},demo:false};
const SU_MOIS=['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
const suJour=d=>`${d.getDate()} ${SU_MOIS[d.getMonth()]}`;

/* ---- Qui est suivi, depuis quand, et ce qui a changé depuis (À RELIRE) ----
   Les trois de l'Accueil, puis deux combattants d'ailleurs : le n° 1 mondial des légers (rival) et la fin de contrat vue par Marco. */
const SU_META={};
const SU_COURT={rizzo:'<span style="color:var(--neg)">Blessé, retour le 2 février</span>',musaev:'5 victoires sur 7 par soumission',rachidi:'<span style="color:var(--vert)">5 victoires de suite</span>'};
function suDefauts(){
  const j=d=>new Date(2027,0,d),l=[];
  l.push(['rizzo',j(4),{d:j(11),t:'Blessé au camp, retour le 2 févr.',ton:'neg'}]);
  l.push(['musaev',j(4),null]);
  l.push(['rachidi',j(4),{d:j(6),t:'Demande une chance au titre',ton:'neu'}]);
  const ch=clMonde('Poids léger').find(c=>c.ext&&c.champOrg);
  if(ch)l.push([ch.id,j(6),ch.prochain?{d:j(9),t:`Combat annoncé le ${ch.prochain.date}`,ton:'neu'}:null]);
  const fin=RC.find(x=>x.type==='fin'&&parId(x.id).cat==='Poids léger');
  if(fin)l.push([fin.id,j(4),{d:j(8),t:`Libre ${fin.fin}`,ton:'neu'}]);
  return l;
}
function suInit(){
  const q=new URLSearchParams(location.search);S.su.demo=[...q.keys()].some(k=>/^su(?!neuf)/.test(k));
  if(q.get('suneuf')){try{localStorage.removeItem(SU_CLE);}catch(e){}}
  let g=null;if(!S.su.demo){try{g=JSON.parse(localStorage.getItem(SU_CLE)||'null');}catch(e){}}
  const l=g?g.l.map(([id,d,ch])=>[id,new Date(d),ch&&{...ch,d:new Date(ch.d)}]):q.get('suvide')?[]:suDefauts();
  S.rc.suivis.splice(0,S.rc.suivis.length);
  l.filter(([id])=>parId(id)).forEach(([id,d,ch])=>{S.rc.suivis.push(id);SU_META[id]={depuis:d,change:ch};});
}
function suSauver(){if(S.su.demo)return;try{localStorage.setItem(SU_CLE,JSON.stringify({l:S.rc.suivis.map(id=>[id,SU_META[id].depuis,SU_META[id].change])}));}catch(e){}}
const suSuivi=id=>S.rc.suivis.includes(id);
/** Suivre ou ne plus suivre : depuis la fiche (et, comme avant, la fiche courte du Recrutement et les Rapports). */
function suBasculer(id){
  const c=parId(id),i=S.rc.suivis.indexOf(id);
  if(i>=0){S.rc.suivis.splice(i,1);delete SU_META[id];toast(`Tu ne suis plus ${esc(c.prenom)} ${esc(c.nom)}.`);}
  else{S.rc.suivis.push(id);SU_META[id]={depuis:new Date(S.date),change:null};toast(`Tu suis ${esc(c.prenom)} ${esc(c.nom)}.`);}
  suSauver();
}

/* ---- Une ligne : nom et surnom, organisation, palmarès, rang mondial, série, dernier combat, ce qui a changé ---- */
const SU_COLS={nom:['Combattant',300],org:['Organisation',190],bilan:['Palmarès',130],mondial:['Mondial',140],serie:['5 derniers combats',210],dernier:['Dernier combat',270],change:['Depuis le suivi',320]};
const suOrg=c=>c.ext?(c.libre?'Libre':c.org):'Split';
function suValeur(c,k){
  const m=SU_META[c.id]||{};
  switch(k){case 'nom':return c.nom;case 'org':return suOrg(c);case 'bilan':return c.v-c.d;case 'mondial':return c.nonClasse||!c.mondial?999:c.mondial;
    case 'serie':return [...c.serie].filter(x=>x==='v').length;case 'dernier':return clDernier(c).date.getTime();case 'change':return m.change?m.change.d.getTime():0;}
}
function suCellule(c,k){
  const m=SU_META[c.id]||{};
  switch(k){
    case 'nom':return `<div class="cl-2l"><span class="cl-l1 cl-ell" style="font-weight:700">${lien(c)}</span>${c.surnom?`<span class="sous cl-ell">« ${esc(c.surnom)} »</span>`:''}</div>`;
    case 'org':{const sp=!c.ext,ch=clChamp(c);return `<div class="cl-2l"><span class="cl-l1 cl-ell">${esc(suOrg(c))}${ch?CL_C:''}</span><span class="sous cl-ell">${esc(courte(c.cat))}${sp&&c.rang!=='C'?` · n° ${c.rang}`:''}</span></div>`;}
    case 'bilan':return `<span class="T" style="font-size:30px">${bilan(c)}</span>`;
    case 'mondial':return c.nonClasse||!c.mondial?'<span class="sous">non classé</span>':`n° ${c.mondial} ${clTend(c.tend||'=')}`;
    case 'serie':return serie5(c.serie);
    case 'dernier':return clDernierHtml(c);
    case 'change':{const ch=m.change,dep=m.depuis?`suivi depuis le ${suJour(m.depuis)}`:'';
      return ch?`<div class="cl-2l"><span class="cl-l1 cl-ell su-ch ${ch.ton}">${esc(ch.t)}</span><span class="sous cl-ell">${suJour(ch.d)} · ${dep}</span></div>`
        :`<div class="cl-2l"><span class="cl-l1 sous">Rien de nouveau</span><span class="sous cl-ell">${dep}</span></div>`;}
  }
}
function suListe(){
  const T=S.su.tri,l=S.rc.suivis.map(parId).filter(Boolean);
  return l.sort((a,b)=>{const x=suValeur(a,T.col),y=suValeur(b,T.col);return ((x>y?1:x<y?-1:0)||a.nom.localeCompare(b.nom))*T.sens;});
}
function suTableau(){
  const l=suListe(),T=S.su.tri,cols=Object.keys(SU_COLS),tot=cols.reduce((t,k)=>t+SU_COLS[k][1],0);
  if(!l.length)return `<div class="su-vide">Aucun suivi.</div>`;
  const th=k=>`<th data-sutri="${k}" class="${T.col===k?'trie':''}" style="width:${(SU_COLS[k][1]/tot*100).toFixed(2)}%">${SU_COLS[k][0]}${T.col===k?(T.sens>0?' ▴':' ▾'):''}</th>`;
  return `<div class="defile cl-defile"><table class="eff-t cl-t fixe su-t"><thead><tr>${cols.map(th).join('')}</tr></thead>
    <tbody>${l.map((c,i)=>`<tr class="apparait ${c.ext?'':'cl-nous'}" style="animation-delay:${Math.min(i,10)*25}ms">${cols.map(k=>`<td class="c-${k}">${suCellule(c,k)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
const suPied=()=>!S.rc.suivis.length?'':`<div class="cl-pied"><span><i class="cl-nous-m"></i>combattant de Split</span><span>${S.rc.suivis.length} suivi${S.rc.suivis.length>1?'s':''}</span></div>`;

/* ---- L'Effectif : un bouton « Suivis » à côté de l'Infirmerie ---- */
const suEffFiltresBase=effFiltres;
effFiltres=function(){
  const h=suEffFiltresBase(),on=S.eff.onglet==='suivis';
  const h2=on?h.replace(/bb oct petit on/g,'bb oct petit'):h;
  return h2.replace(/<\/div>$/,`<button class="bb oct petit ${on?'on':''}" data-susvoir="effectif"><span class="oct">Suivis <b>${S.rc.suivis.length}</b></span></button></div>`);
};
const suEffHtmlBase=effectifHtml;
effectifHtml=function(){
  if(S.eff.onglet!=='suivis')return suEffHtmlBase();
  return `<div class="eff su">${effFiltres()}<div class="eff-pan">${pan(suTableau()+suPied(),'height:100%')}</div></div>`;
};

/* ---- L'Accueil : une info par suivi, « Tout voir › » mène à la liste ---- */
const suAccueilBase=accueilHtml;
accueilHtml=function(){
  let h=suAccueilBase();
  if(S.pp&&S.pp.accueil)return h.replace('data-go="effectif">Tout voir ›</button>','data-susvoir="accueil">Tout voir ›</button>');
  const lignes=S.rc.suivis.slice(0,3).map(id=>{const c=parId(id),m=SU_META[id]||{},ch=m.change;
    const info=SU_COURT[id]||(ch?`<span class="su-ch ${ch.ton}">${esc(ch.t)}</span>`:'Rien de nouveau');
    return `<div class="ligne" data-fiche="${c.id}"><span style="font-size:23px;font-weight:700;white-space:nowrap">${lien(c)}</span><span style="margin-left:auto;font-size:21px;color:var(--texte2);text-align:right">${info}</span></div>`;}).join('')||'<div class="ligne su-acc-vide">Aucun suivi</div>';
  let n=0;
  h=h.replace(/<div class="ligne" data-fiche="(rizzo|musaev|rachidi)">[\s\S]*?<\/span><\/div>/g,()=>n++?'':lignes);
  return h.replace('data-go="effectif">Tout voir ›</button>','data-susvoir="accueil">Tout voir ›</button>');
};
function suVoir(){S.eff.onglet='suivis';aller('effectif');}

/* ---- La fiche : « Suivre » devient « Suivi » ; les fiches d'ailleurs gardent « Le suivre » ---- */
function suBoutons(){
  const id=S.fiche;if(!id)return;const on=suSuivi(id);
  document.querySelectorAll('#fiche [data-susuivre],#fiche button[title="Suivre ce combattant"]').forEach(b=>{b.dataset.susuivre=id;b.classList.toggle('on',on);b.title=on?'Ne plus suivre ce combattant':'Suivre ce combattant';
    const s=b.querySelector('.oct');if(s)s.textContent=on?'Suivi':'Suivre';});
  document.querySelectorAll('#fiche [data-clsuivre]').forEach(b=>{b.textContent=suSuivi(b.dataset.clsuivre)?'Suivi':'Le suivre';});
}
const suRendreFicheBase=rendreFiche;
rendreFiche=function(dir=0){suRendreFicheBase(dir);suBoutons();};
const suRendreBase=rendre;
rendre=function(){suRendreBase();suBoutons();};

/* ---- Clics ---- */
document.addEventListener('click',e=>{
  const t=e.target;let el;
  const stop=()=>{e.stopImmediatePropagation();e.preventDefault();};
  if((el=t.closest('[data-susuivre]'))){stop();suBasculer(el.dataset.susuivre);rendre();return;}
  if((el=t.closest('#fiche [data-clsuivre]'))){stop();suBasculer(el.dataset.clsuivre);rendre();if(S.fiche)suBoutons();return;}
  if((el=t.closest('[data-susvoir]'))){stop();if(el.dataset.susvoir==='effectif'){S.eff.onglet=S.eff.onglet==='suivis'?'combattants':'suivis';rendre();}else suVoir();return;}
  if((el=t.closest('[data-sutri]'))){stop();const k=el.dataset.sutri,T=S.su.tri;S.su.tri=T.col===k?{col:k,sens:-T.sens}:{col:k,sens:['bilan','serie','dernier','change'].includes(k)?-1:1};rendre();return;}
},true);
/* Recrutement et Rapports suivent déjà avec la même liste : on garde la date du suivi. */
document.addEventListener('click',e=>{const el=e.target.closest('[data-rcsuivre]');if(!el)return;const id=el.dataset.rcsuivre;
  if(suSuivi(id)&&!SU_META[id])SU_META[id]={depuis:new Date(S.date),change:null};if(!suSuivi(id))delete SU_META[id];suSauver();});

/* ---- Lancement : &suvoir=1 (ouvre la liste dans l'Effectif), &suvide=1 (aucun suivi), &suneuf=1 (efface la clé) ---- */
suInit();
window.addEventListener('DOMContentLoaded',()=>{
  const q=new URLSearchParams(location.search);
  if(q.get('suvoir'))setTimeout(suVoir,40);
});
