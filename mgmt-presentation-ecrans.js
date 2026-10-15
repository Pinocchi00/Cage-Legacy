"use strict";
/* ==== [ANCRE: MGMT_PRESENTATION_ENTREES] — Monde lot 3 T5 ==== */
const MGMT_PRESENTATION_UI={pile:[]};
let mgmtPresentationPartie=null;
function mgmtPresentationCadre(){
  if(mgmtPresentationPartie!==G.mgmt){ MGMT_PRESENTATION_UI.pile=[]; mgmtPresentationPartie=G.mgmt; }
  return MGMT_PRESENTATION_UI.pile.at(-1)||null;
}
function mgmtPresentationDonnees(m,v){
  if(!v) return null;
  if(v.mode==='soiree') return mgmtPresentationCombatSoiree(m,v.i)?.presentation||null;
  return v.mode==='combattant'?mgmtPresentationCombattant({m,h:v.h},v.ids[0]):mgmtPresentationCombat({m,h:v.h},...v.ids);
}
function mgmtPresentationRoute(v){ return v.mode==='soiree'?'mgmt_soiree_avant':'mgmt_presentation_'+v.mode; }
/** Ouvre sans mutation métier ; false si présentation indisponible.
 * @param {'combattant'|'combat'|'soiree'} mode @param {string[]} ids
 * @param {{h?:number,i?:number,liste?:Array<{ids:string[],h?:number,i?:number}>,retour?:string}} [opts]
 * @returns {boolean} */
function mgmtPresentationOuvrir(mode,ids,opts={}){
  const m=G&&G.mgmt;
  if(!m||!['combattant','combat','soiree'].includes(mode)||!Array.isArray(ids)) return false;
  mgmtPresentationCadre();
  const v={mode,ids:ids.slice(),h:opts.h,i:opts.i,liste:[],index:0,page:0,nom:0,retour:opts.retour||G.screen};
  if(mode==='soiree'){
    const p=mgmtSoireeProgramme(m)[opts.i]; if(!p) return false;
    v.ids=[p.a.id,p.b.id];v.h=p.h;
    v.liste=mgmtSoireeProgramme(m).map((p,i)=>({ids:[p.a.id,p.b.id],h:p.h,i}));
  }
  const d=mgmtPresentationDonnees(m,v); if(!d) return false;
  v.h=d.h;
  if(mode==='combattant') v.liste=mgmtPresentationsCategorie({m,h:v.h},d.div).map(p=>({ids:[p.id],h:v.h}));
  else if(mode==='combat') v.liste=(opts.liste||[{ids:v.ids,h:v.h}]).filter(x=>x&&Array.isArray(x.ids)&&x.ids.length===2)
    .map(x=>({ids:x.ids.slice(),h:x.h===undefined?opts.h:x.h}));
  v.index=v.liste.findIndex(x=>x.ids.join('|')===v.ids.join('|')&&(mode!=='soiree'||x.i===v.i));
  if(v.index<0){ v.liste.unshift({ids:v.ids.slice(),h:v.h,i:v.i});v.index=0; }
  MGMT_PRESENTATION_UI.pile=[v];
  if(mode==='soiree') MGMT_SOIREE_UI.focus=v.i;
  CL.go(mgmtPresentationRoute(v));return true;
}
/** Déplace dans la liste figée, bornée sans boucle ; remet page/nom à zéro. @param {number} delta */
function mgmtPresentationAutre(delta){
  const v=mgmtPresentationCadre();if(!v) return;
  const pas=delta<0?-1:1;
  for(let k=v.index+pas;k>=0&&k<v.liste.length;k+=pas){
    const cible={...v,...v.liste[k],index:k,page:0,nom:0};
    const d=mgmtPresentationDonnees(G.mgmt,cible);if(!d) continue;
    Object.assign(v,cible,{h:d.h});if(v.mode==='soiree') MGMT_SOIREE_UI.focus=v.i;
    render();return;
  }
}
/** Choisit un nom historique, borné sans boucle. @param {number} delta */
function mgmtPresentationNom(delta){
  const v=mgmtPresentationCadre();if(!v) return;
  const noms=mgmtPresentationLignes(G.mgmt,v).noms;
  v.nom=Math.max(0,Math.min(noms.length-1,v.nom+delta));render();
}
/** Tourne les pages du même contenu, bornées sans boucle. @param {number} delta */
function mgmtPresentationPage(delta){
  const v=mgmtPresentationCadre();if(!v) return;
  v.page=Math.max(0,Math.min((v.pages||1)-1,v.page+delta));render();
}
/** Ouvre le nom choisi dans une présentation enfant ; fiche existante si T2 retourne null. */
function mgmtPresentationNomOuvrir(){
  const v=mgmtPresentationCadre();if(!v) return;
  const id=mgmtPresentationLignes(G.mgmt,v).noms[v.nom];if(!id) return;
  const parents=MGMT_PRESENTATION_UI.pile.slice();
  if(mgmtPresentationOuvrir('combattant',[id],{h:v.h,retour:mgmtPresentationRoute(v)})){
    MGMT_PRESENTATION_UI.pile=parents.concat(MGMT_PRESENTATION_UI.pile);
  }else CL.mgmtFiche(id);
}
/** Ouvre la fiche complète du sujet (premier côté pour une paire), retour au cadre conservé. */
function mgmtPresentationFiche(){ const v=mgmtPresentationCadre();if(v) CL.mgmtFiche(v.ids[0]); }
/** Regarde seulement le prochain combat réel en mode soirée ; sinon aucune action. */
function mgmtPresentationRegarder(){
  const v=mgmtPresentationCadre();if(!v||v.mode!=='soiree'||v.i!==MGMT_SOIREE.index||v.i>=mgmtSoireeProgramme(G.mgmt).length) return;
  MGMT_SOIREE_UI.focus=v.i;CL.mgmtSoAvantRegarder();
}
/** Dépile ; revient à la présentation parente ou à l'écran d'origine. */
function mgmtPresentationRetour(){
  const v=mgmtPresentationCadre();if(!v) return;
  MGMT_PRESENTATION_UI.pile.pop();const parent=mgmtPresentationCadre();CL.go(parent?mgmtPresentationRoute(parent):v.retour);
}
function mgmtPresentationLignes(m,v){
  const d=mgmtPresentationDonnees(m,v);if(!d) return {noms:[],panneaux:[]};
  const noms=[],nom=id=>{if(mgmtFicheLigne(m,id)&&!noms.includes(id)) noms.push(id);return id;};
  const phrase=x=>({texte:x.texte,sources:x.fait?.sources||x.sources||[]});
  let panneaux;
  if(v.mode==='combattant') panneaux=[
    {titre:'CE QUI LE DISTINGUE',lignes:d.faits.map(phrase)},
    {titre:'SES POINTS FORTS',lignes:d.histoire.map(phrase)},
    {titre:'SON HISTOIRE ICI',lignes:d.histoire.map(x=>({...phrase(x),ids:[nom(x.adversaire)]}))},
    {titre:'CE QU’ON EN DIT',lignes:[]},{titre:'LE MONDE',lignes:[]}];
  else panneaux=[
    {titre:'CE QUI LE REND UNIQUE',lignes:d.faits.map(phrase)},
    {titre:'CE QUE CHACUN IMPOSE',lignes:d.cotes.flatMap(c=>c.faits.map(x=>({...phrase(x),sujet:c.id})))},
    {titre:'LEUR HISTOIRE',lignes:d.histoire.flatMap(x=>x.recits.map(r=>({texte:r.texte,sujet:r.id,sources:x.sources,ids:x.ids.map(nom)})))},
    {titre:'LES PRONOSTICS',lignes:d.pronostics.map(x=>({texte:x.texte,media:x.nom,sources:x.preuves.flatMap(p=>p.sources)}))},
    {titre:'CE QU’ON EN DIT',lignes:[]},{titre:'CE QUE ÇA CHANGE',lignes:[]}];
  return {d,noms,panneaux};
}
function mgmtPresentationNomHtml(m,v,id){
  const nom=mgmtNomParId(m,id).name;
  const noms=v.noms||mgmtPresentationLignes(m,v).noms,k=noms.indexOf(id);
  if(k<0) return esc(nom);
  return `<button type="button" class="mf-pr-lien${v.nom===k?' choisi':''}" onclick="MGMT_PRESENTATION_UI.pile.at(-1).nom=${k};CL.mgmtPresentationNomOuvrir()">${esc(nom)}</button>`;
}
function mgmtPresentationLigneHtml(m,v,x){
  return `<div class="mf-pr-ligne" data-sources="${esc(JSON.stringify(x.sources))}">`
    +(x.media?`<div class="mf-pr-media">${esc(x.media)}</div>`:'')
    +(x.sujet?`<div class="mf-pr-sujet">${esc(mgmtNomParId(m,x.sujet).name)}</div>`:'')
    +`<div class="mf-pr-phrase">${esc(x.texte)}</div>`
    +(x.ids?`<div class="mf-pr-noms">${[...new Set(x.ids)].map(id=>mgmtPresentationNomHtml(m,v,id)).join(' · ')}</div>`:'')+`</div>`;
}
/* ==== [ANCRE: MGMT_PRESENTATION_PAGES] — Monde lot 3 T5 ==== */
/** Mesure de lignes hors viewport, retirées avant le rendu : aucun panneau posé sur l'écran. */
function mgmtPresentationHauteur(m,v,x,largeur){
  const el=document.createElement('div');el.style.cssText=`position:absolute;left:-100000px;top:0;width:${largeur}px;pointer-events:none`;
  el.innerHTML=mgmtPresentationLigneHtml(m,v,x);document.body.append(el);
  const h=el.getBoundingClientRect().height;el.remove();
  // Un DOM virtuel n'a pas de layout ; mesure conservatrice au même corps.
  return h||14+Math.ceil((x.texte.length+(x.media?.length||0)+(x.sujet?mgmtNomParId(m,x.sujet).name.length:0)+(x.ids||[]).reduce((s,id)=>s+mgmtNomParId(m,id).name.length,0))*13/(largeur-32))*27+((x.media||x.sujet||x.ids)?30:0);
}
function mgmtPresentationPaginer(m,v,lignes,hauteur,largeur){
  const morceaux=[];
  for(const x of lignes){
    if(mgmtPresentationHauteur(m,v,x,largeur)<=hauteur){morceaux.push(x);continue;}
    const mots=x.texte.split(' ');let debut=0;
    while(debut<mots.length){
      let fin=debut+1;
      while(fin<mots.length&&mgmtPresentationHauteur(m,v,{...x,texte:mots.slice(debut,fin+1).join(' ')},largeur)<=hauteur) fin++;
      morceaux.push({...x,texte:mots.slice(debut,fin).join(' ')});debut=fin;
    }
  }
  const pages=[[]];let utilise=0;
  for(const x of morceaux){
    const h=mgmtPresentationHauteur(m,v,x,largeur);
    if(pages.at(-1).length&&utilise+h+12>hauteur){pages.push([]);utilise=0;}
    pages.at(-1).push(x);utilise+=h+12;
  }
  return pages;
}
/** HTML échappé du cadre courant ; chaîne vide sans cadre valide.
 * @param {object} m @param {object} vue @returns {string} */
function mgmtPresentationHtml(m,vue){
  const contenu=mgmtPresentationLignes(m,vue),{d,panneaux}=contenu;if(!d) return '';
  vue.noms=contenu.noms;
  const solo=vue.mode==='combattant',base=mgmtFaitsBase({m,h:d.h},vue.ids[0]);
  const f=id=>base.population.find(x=>x.id===id),a=f(vue.ids[0]),b=solo?null:f(vue.ids[1]);
  const affiche=(f,cote)=>`<div class="mf-pr-nom ${cote}"><span style="font-size:${mfCorps(f.first||'',solo?1000:570,solo?64:40,22)}px">${esc(mfNet(f.first||''))}</span><b style="font-size:${mfCorps(f.last||f.name,solo?1000:570,solo?200:116,22)}px">${esc(mfNet(f.last||f.name))}</b></div>`;
  const rang=base.rang.findIndex(x=>x.id===a.id);
  const cartouche=solo?`<div class="mf-pr-cartouche"><div>PALMARÈS<b>${esc(a.W+'-'+a.L+'-'+(a.D||0))}</b></div><div>${esc('CHEZ '+mgmtOrgNom(m))}<b>${esc(rang<0?'—':'N°'+(rang+1))}</b></div><div>AU MONDE<b>—</b></div><div>CONTRAT<b>—</b></div></div>`:'';
  const programme=vue.mode==='soiree'?mgmtPresentationCombatSoiree(m,vue.i):null;
  const carte=vue.mode==='combat'?[...(m.card?.main||[]),...(m.card?.prelims||[])].find(x=>[x.a,x.b].sort().join('|')===vue.ids.slice().sort().join('|')):null;
  const tag=programme?[programme.etiquette,programme.rounds+' ROUNDS',programme.titre?'TITRE':''].filter(Boolean).join(' · '):carte?[carte.rounds?carte.rounds+' ROUNDS':'',carte.title?'TITRE':''].filter(Boolean).join(' · '):'';
  const ban=`<div class="mf-pr-banniere">${affiche(a,'a')}${b?affiche(b,'b')+`<div class="mf-pr-vs"><b>VS</b>${tag?`<span>${esc(tag)}</span>`:''}</div>`:cartouche}</div>`;
  const pages=panneaux.map((p,k)=>mgmtPresentationPaginer(m,vue,p.lignes,k<3?(solo?268:266):(solo?142:254),solo&&k===3?884:466));
  vue.pages=Math.max(...pages.map(p=>p.length));vue.page=Math.min(vue.page,vue.pages-1);
  const panneau=(p,k)=>`<section class="mf-pr-panneau"><h2>${esc(p.titre)}</h2><div class="mf-pr-lignes">${(pages[k][vue.page]||[]).map(x=>mgmtPresentationLigneHtml(m,vue,x)).join('')}</div></section>`;
  return `<main class="mf-pr ${solo?'solo':'duo'}">${ban}<div class="mf-pr-rangee">${panneaux.slice(0,3).map((p,k)=>panneau(p,k)).join('')}</div><div class="mf-pr-rangee bas">${panneaux.slice(3).map((p,k)=>panneau(p,k+3)).join('')}</div></main>`;
}
/** Écran complet du cadre courant ; retour d'origine si devenu invalide. @returns {string} */
function scr_mgmt_presentation(){
  const v=mgmtPresentationCadre();if(!v) return SCREENS.mgmt_accueil();
  const html=mgmtPresentationHtml(G.mgmt,v);
  if(!html){MGMT_PRESENTATION_UI.pile.pop();G.screen=v.retour;return SCREENS[v.retour]();}
  const soir=v.mode==='soiree',regarder=soir&&v.i===MGMT_SOIREE.index&&v.i<mgmtSoireeProgramme(G.mgmt).length;
  const touches=[{ks:['Échap'],t:'Retour',onclick:'CL.mgmtPresentationRetour()'},
    {ks:['←'],t:'',onclick:'CL.mgmtPresentationAutre(-1)'},{ks:['→'],t:v.mode==='combattant'?'Autre combattant':'Autre combat',onclick:'CL.mgmtPresentationAutre(1)'},
    {ks:['↑'],t:'',onclick:'CL.mgmtPresentationNom(-1)'},{ks:['↓'],t:'Choisir un nom',onclick:'CL.mgmtPresentationNom(1)'},
    {ks:['F'],t:'Fiche complète',onclick:'CL.mgmtPresentationFiche()'}];
  if(!soir||regarder) touches.push({ks:['Entrée'],t:soir?'Regarder le combat':'Ouvrir le nom choisi',jaune:true,onclick:soir?'CL.mgmtPresentationRegarder()':'CL.mgmtPresentationNomOuvrir()'});
  if(v.pages>1) touches.push({ks:['⇤'],t:'',onclick:'CL.mgmtPresentationPage(-1)'},{ks:['⇥'],t:(v.page+1)+' / '+v.pages,onclick:'CL.mgmtPresentationPage(1)'});
  return mfEcran(html,{barre:'jeu',m:G.mgmt,grise:soir,plaque:soir?'Soirée':v.mode==='combattant'?'Effectif':'Carte',libelle:'Présentation',compteur:(v.index+1)+' / '+v.liste.length,touches});
}
Object.assign(CL,{mgmtPresentationOuvrir,mgmtPresentationAutre,mgmtPresentationNom,mgmtPresentationPage,mgmtPresentationNomOuvrir,mgmtPresentationFiche,mgmtPresentationRegarder,mgmtPresentationRetour});
SCREENS.mgmt_presentation_combattant=scr_mgmt_presentation;
SCREENS.mgmt_presentation_combat=scr_mgmt_presentation;
const mgmtPresentationTouches={ArrowLeft(){mgmtPresentationAutre(-1);},ArrowRight(){mgmtPresentationAutre(1);},ArrowUp(){mgmtPresentationNom(-1);},ArrowDown(){mgmtPresentationNom(1);},
  Enter(){const v=mgmtPresentationCadre();if(v?.mode==='soiree') mgmtPresentationRegarder();else mgmtPresentationNomOuvrir();},
  f:mgmtPresentationFiche,F:mgmtPresentationFiche,Escape:mgmtPresentationRetour,Tab(e){mgmtPresentationPage(e?.shiftKey?-1:1);}};
for(const route of ['mgmt_presentation_combattant','mgmt_presentation_combat','mgmt_soiree_avant']) keysRegister(route,mgmtPresentationTouches);
