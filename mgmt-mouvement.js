"use strict";
/* ==== [ANCRE: MGMT_LOT5_H9_MOUVEMENT] — Lot 5 H9, contrat §3.5 : le temps qui
   passe à l'écran. Quand le joueur clique sur Continuer et qu'une semaine
   s'ouvre, les moments de la semaine DÉFILENT pendant deux à quatre
   secondes (l'écran de traitement de Football Manager) ; un clic ou une
   touche le passe. Puis un moment de ton cercle ou de tes suivis s'ouvre en
   carte qui glisse, avec le portrait du combattant et, si besoin, un
   bouton d'action. Les transitions sont désactivées si le système demande
   moins d'animations (prefers-reduced-motion, dans le CSS d'index.html).
   Rien de tout cela n'est stocké : l'état du fil et des cartes vit à
   l'écran. Aucun texte n'est écrit ici : les lignes sont « nom : libellé »
   du catalogue. ==== */
let MGMT_FIL={actif:false,lignes:[],ms:0,jeton:0};
let MGMT_POPUPS={file:[]};
const MGMT_FIL_BASE_MS=1200;
const MGMT_FIL_PAR_LIGNE_MS=450;
const MGMT_FIL_MIN_MS=2000;
const MGMT_FIL_MAX_MS=4000;
const MGMT_FIL_MAX_LIGNES=8;
const MGMT_POPUPS_MAX=2;

/** Durée du fil : deux à quatre secondes, selon le nombre de lignes. Pur. */
function mgmtFilDuree(n){
  return clamp(MGMT_FIL_BASE_MS+MGMT_FIL_PAR_LIGNE_MS*n,MGMT_FIL_MIN_MS,MGMT_FIL_MAX_MS);
}

/** Les lignes qui défilent : les demandes en attente, puis les moments
 *  relayés de la semaine, ton cercle d'abord. @returns {string[]} */
function mgmtFilLignes(m){
  const out=[];
  if(typeof mgmtDemandesOuvertes==='function'){
    for(const d of mgmtDemandesOuvertes(m)){
      const f=mgmtFighterById(m,d.a);
      if(f&&MGMT_DEMANDES[d.want]) out.push(f.name+' demande : '+MGMT_DEMANDES[d.want].libelle.toLowerCase());
    }
  }
  if(typeof mgmtRecruesLignes==='function') for(const r of mgmtRecruesLignes(m)) out.push(r.text);
  if(typeof mgmtRivalitesLignes==='function') for(const r of mgmtRivalitesLignes(m)) out.push(r.text);
  if(typeof mgmtParolesDeLaSemaine==='function') for(const p of mgmtParolesDeLaSemaine(m)) out.push(p.name+' : « '+p.texte+' »');
  for(const c of mgmtConteurCandidats(m,m.cycle)) out.push(c.name+' : '+c.moment.libelle);
  return out.slice(0,MGMT_FIL_MAX_LIGNES);
}

/** Les cartes de la semaine : les moments du cercle et des suivis, deux au
 *  plus. @returns {Array} */
function mgmtPopupsDeLaSemaine(m){
  return mgmtConteurCandidats(m,m.cycle).filter(c=>c.lien).slice(0,MGMT_POPUPS_MAX);
}

/** HTML du fil et de la carte courante, posé sur la semaine. */
function mgmtMouvementHtml(m){
  if(MGMT_FIL.actif){
    return `<div class="mgmt-fil" role="status" aria-live="polite" onclick="CL.mgmtFilPasser()">`
      +`<div class="mgmt-fil-liste">`
      +MGMT_FIL.lignes.map((t,i)=>`<p class="mgmt-fil-ligne" style="--i:${i}">${esc(t)}</p>`).join('')
      +`<p class="mgmt-fil-passe">Un clic ou une touche pour passer</p></div></div>`;
  }
  const c=MGMT_POPUPS.file[0];
  if(!c) return '';
  const f=mgmtFighterById(m,c.id);
  if(!f) return '';
  const sur=mgmtIdentiteSurnomsDe(m,f.div).get(f.id)||'';
  const role=mgmtRole(m,f);
  const libre=mgmtAvailable(m,f)&&!mgmtEngaged(m,f)&&mgmtMainPosable(m);
  const id=esc(f.id);
  return `<aside class="mgmt-popup" role="status" aria-live="polite">`
    +`<button type="button" class="mgmt-popup-ferme" aria-label="Fermer" onclick="CL.mgmtPopupFermer()">✕</button>`
    +`<div class="mgmt-popup-lien">${c.lien==='cercle'?'Ton cercle':'Tes suivis'}</div>`
    +`<h4>${esc(f.name)}${sur?` <em>« ${esc(sur)} »</em>`:''}</h4>`
    +`<p class="mgmt-popup-portrait">${role?esc(role.libelle)+' · ':''}${esc(mgmtDivisionLabel(f.div))} · ${esc(f.W)}-${esc(f.L)}${f.D?'-'+esc(f.D):''}</p>`
    +`<p class="mgmt-popup-moment">${esc(c.moment.libelle)} <span>${esc(c.moment.relais.join(' · '))}</span></p>`
    +`<div class="mgmt-popup-actions"><button type="button" onclick="CL.mgmtPopupFiche('${id}')">Voir la fiche</button>`
    +(libre?`<button type="button" onclick="CL.mgmtPopupCombat('${id}')">Lui trouver un combat</button>`:'')+`</div></aside>`;
}

/* ---- Les actions : le fil, puis les cartes ---------------------------- */
Object.assign(CL,{
  /** Ouvre le fil de la semaine qui commence. Rien à raconter : rien ne s'ouvre. */
  mgmtFilDemarrer(){
    if(!G||!G.mgmt) return;
    const lignes=mgmtFilLignes(G.mgmt);
    MGMT_POPUPS.file=[];
    MGMT_FIL={actif:false,lignes,ms:0,jeton:MGMT_FIL.jeton+1};
    if(!lignes.length){ MGMT_POPUPS.file=mgmtPopupsDeLaSemaine(G.mgmt); return; }
    MGMT_FIL.actif=true;
    MGMT_FIL.ms=mgmtFilDuree(lignes.length);
    const jeton=MGMT_FIL.jeton;
    if(typeof setTimeout==='function'){
      setTimeout(()=>{ if(MGMT_FIL.actif&&MGMT_FIL.jeton===jeton) CL.mgmtFilPasser(); },MGMT_FIL.ms);
    }
  },
  /** Passe le fil (clic, touche ou fin du délai) ; les cartes viennent ensuite. */
  mgmtFilPasser(){
    if(!MGMT_FIL.actif) return;
    MGMT_FIL.actif=false;
    MGMT_FIL.jeton++;
    if(G&&G.mgmt) MGMT_POPUPS.file=mgmtPopupsDeLaSemaine(G.mgmt);
    if(G&&G.screen==='mgmt_bureau') render();
  },
  mgmtPopupFermer(){
    MGMT_POPUPS.file.shift();
    if(G&&G.screen==='mgmt_bureau') render();
  },
  mgmtPopupFiche(id){ MGMT_POPUPS.file=[]; CL.mgmtFiche(id); },
  mgmtPopupCombat(id){ MGMT_POPUPS.file=[]; CL.mgmtCarte(); CL.mgmtPick(id); },
});

/* Un clic ou une touche passe le fil ; Échap ferme la carte. Un seul
   écouteur, en capture : une touche qui passe le fil ne déclenche rien d'autre. */
if(typeof document!=='undefined'&&document.addEventListener){
  document.addEventListener('keydown',e=>{
    if(['Shift','Control','Alt','Meta','Tab'].includes(e.key)) return;
    if(MGMT_FIL.actif){
      e.preventDefault(); e.stopImmediatePropagation();
      CL.mgmtFilPasser();
    }else if(e.key==='Escape'&&MGMT_POPUPS.file.length&&G&&G.screen==='mgmt_bureau'){
      e.preventDefault(); e.stopImmediatePropagation();
      CL.mgmtPopupFermer();
    }
  },true);
}
/* ==== [FIN ANCRE] ==== */
