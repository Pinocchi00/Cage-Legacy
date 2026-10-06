"use strict";
/* ==== [ANCRE: MGMT_BRIEF_LOT1_ECRAN_PARTIES] — Brief du 06/10/2026, lot 1 :
   l'écran « Choisis une partie » (planche « Management — Choisir une partie »
   du canvas) et le changement d'emplacement. Trois emplacements : un occupé se
   reprend, un vide lance une nouvelle partie (une partie Split dans ce lot ;
   le choix de l'organisation arrive au lot 5). Entrée reprend ou lance, les
   flèches choisissent, Suppr efface après confirmation, Échap revient à
   l'accueil. Composants de la charte actuelle : le lot 4 portera l'habillage
   du canvas. La mécanique des clés vit dans mgmt-save.js. ==== */
let MGMT_PARTIES={curseur:1,effacer:0};

/** Remet à zéro les dix états d'interface du mode : ils vivent au niveau des
 *  modules et ne doivent jamais passer d'une partie à l'autre. */
function mgmtInterfaceRaz(){
  MGMT_CART={cursor:0,pick:null};
  MGMT_CLASSEMENTS={div:'H-fly',scope:'world'};
  MGMT_FICHE={id:null,retour:'mgmt_carte',cursor:0};
  MGMT_SOIREE={index:0};
  MGMT_VESTIAIRE={div:'',role:'',dispo:false,lien:'',signe:false,page:0};
  MGMT_FIL={actif:false,lignes:[],ms:0,jeton:MGMT_FIL.jeton+1};
  MGMT_POPUPS={file:[]};
  MGMT_RECRUTEMENT={div:'',page:0,curseur:0,message:''};
  MGMT_RETRAIT_UI={qui:'',texte:'',c:-1};
  MGMT_PROPOSITION={c:-1,lignes:[]};
}

/** Rend un emplacement actif. En changer vide la partie en mémoire et l'état
 *  d'interface : sans cela, la partie de l'un s'enregistrerait par-dessus
 *  celle de l'autre. @returns {boolean} vrai si l'emplacement a changé. */
function mgmtSlotOuvrir(n){
  if(!mgmtSlotValide(n)||n===MGMT_SLOT) return false;
  if(typeof G!=='undefined'&&G) G.mgmt=null;
  mgmtInterfaceRaz();
  MGMT_SLOT=n;
  return true;
}

/** « Jouée pour la dernière fois » : aujourd'hui, hier, il y a N jours ; vide sans date. */
function mgmtPartieDate(ms,maintenant){
  if(!Number.isSafeInteger(ms)||ms<=0) return '';
  const jour=t=>{ const d=new Date(t); return Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/86400000; };
  const n=Math.max(0,jour(maintenant)-jour(ms));
  return n===0?'Aujourd’hui':(n===1?'Hier':`Il y a ${n} jours`);
}

function mgmtPartieHtml(n,curseur,reg,maintenant){
  const m=mgmtSlotPeek(n), on=n===curseur;
  const tete=nom=>`<span class="mgmt-partie-tete"><span class="mgmt-partie-num">Emplacement ${esc(n)}</span><span class="mgmt-partie-org">${esc(nom)}</span></span>`;
  const go=texte=>on?`<span class="mgmt-partie-go">${esc(texte)}</span>`:'';
  const ouvre=`<button type="button" class="mgmt-partie${on?' on':''}" aria-pressed="${on}" onclick="CL.mgmtPartieChoisir(${n})">`;
  if(!m){
    return ouvre+tete('Vide')+`<span class="mgmt-partie-corps"><span><span class="mgmt-partie-sur">Ici, tu peux lancer</span>`
      +`<span class="mgmt-partie-grand" style="display:block">Une nouvelle partie</span></span>`
      +`<span class="mgmt-partie-note">Chaque partie crée un effectif neuf : les noms, les palmarès, les classements.</span>`
      +go('Nouvelle partie')+`</span></button>`;
  }
  const date=mgmtPartieDate(reg.dates[n],maintenant);
  const ligne=(k,v)=>`<span class="mgmt-partie-ligne"><span>${esc(k)}</span><strong>${esc(v)}</strong></span>`;
  return ouvre+tete(m.org)+`<span class="mgmt-partie-corps"><span><span class="mgmt-partie-sur">La prochaine soirée</span>`
    +`<span class="mgmt-partie-grand" style="display:block">${esc(m.org)} <b>${esc(m.eventsPlayed+1)}</b></span></span>`
    +ligne('Soirées jouées',m.eventsPlayed)
    +ligne('En caisse',(Number.isSafeInteger(m.treasury)?m.treasury:0)+' k$')
    +(date?ligne('Jouée pour la dernière fois',date):'')
    +go('Reprendre')+`</span></button>`;
}

function scr_mgmt_parties(){
  const F=MGMT_PARTIES, reg=mgmtRegistre(), maintenant=Date.now();
  if(!mgmtSlotValide(F.curseur)) F.curseur=1;
  const occupe=!!mgmtSlotPeek(F.curseur);
  if(F.effacer&&!mgmtSlotPeek(F.effacer)) F.effacer=0;
  let corps;
  if(F.effacer){
    /* La phrase de confirmation n'est pas décidée (brief, « À trancher », lot 1) : le titre seul. */
    const m=mgmtSlotPeek(F.effacer);
    corps=`<div class="mgmt-parties-confirme" role="dialog" aria-label="Effacer la partie">`
      +`<h3>Effacer la partie ?</h3><p class="mgmt-partie-note">Emplacement ${esc(F.effacer)} · ${esc(m.org)} · ${esc(m.eventsPlayed)} soirée${m.eventsPlayed>1?'s':''} jouée${m.eventsPlayed>1?'s':''}</p>`
      +`<div><button type="button" onclick="CL.mgmtPartieEffacerAnnuler()">Échap · Garder</button>`
      +`<button type="button" class="or" onclick="CL.mgmtPartieEffacerConfirmer()">Entrée · Effacer la partie</button></div></div>`;
  }else{
    let cartes='';
    for(let n=1;n<=MGMT_SLOTS;n++) cartes+=mgmtPartieHtml(n,F.curseur,reg,maintenant);
    corps=`<div class="mgmt-parties-grille">${cartes}</div>`
      +`<div class="mgmt-parties-touches">`
      +`<button type="button" onclick="CL.mgmtLeave()"><kbd>Échap</kbd> Retour à l’accueil</button>`
      +`<span><kbd>←</kbd> <kbd>→</kbd> Choisir</span>`
      +(occupe?`<button type="button" onclick="CL.mgmtPartieEffacer()"><kbd>Suppr</kbd> Effacer la partie</button>`:'')
      +`<button type="button" class="or" onclick="CL.mgmtPartieOuvrir()"><kbd>Entrée</kbd> ${occupe?'Reprendre':'Nouvelle partie'}</button></div>`;
  }
  return `<div class="scr mgmt-wrap mgmt-parties"><div class="mgmt-head bar"><h2 class="disp">Management</h2>`
    +`<span class="mgmt-week-event">Choisis une partie · ${esc(MGMT_SLOTS)} emplacements</span></div>${corps}</div>`;
}
SCREENS.mgmt_parties=scr_mgmt_parties;

Object.assign(CL,{
  /** Ouvre « Choisis une partie », le curseur sur la dernière partie jouée. */
  mgmtParties(){
    if(!G) G={theme:'dark'};
    try{
      const app=document.getElementById('app'); if(app&&app.classList) app.classList.add('mgmt');
      if(document.body&&document.body.classList) document.body.classList.add('mgmt');
    }catch(e){}
    MGMT_PARTIES={curseur:mgmtSlotDernier()||1,effacer:0};
    CL.go('mgmt_parties');
  },
  mgmtPartieCurseur(delta){
    if(MGMT_PARTIES.effacer) return;
    MGMT_PARTIES.curseur=Math.min(MGMT_SLOTS,Math.max(1,MGMT_PARTIES.curseur+delta));
    render();
  },
  /** Un clic sur un emplacement le choisit ; un clic sur le choisi l'ouvre. */
  mgmtPartieChoisir(n){
    if(MGMT_PARTIES.effacer||!mgmtSlotValide(n)) return;
    if(MGMT_PARTIES.curseur===n){ CL.mgmtPartieOuvrir(); return; }
    MGMT_PARTIES.curseur=n; render();
  },
  mgmtPartieOuvrir(){ if(!MGMT_PARTIES.effacer) CL.mgmtEnter(MGMT_PARTIES.curseur); },
  mgmtPartieEffacer(){
    if(MGMT_PARTIES.effacer||!mgmtSlotPeek(MGMT_PARTIES.curseur)) return;
    MGMT_PARTIES.effacer=MGMT_PARTIES.curseur; render();
  },
  mgmtPartieEffacerAnnuler(){ MGMT_PARTIES.effacer=0; render(); },
  mgmtPartieEffacerConfirmer(){
    if(!MGMT_PARTIES.effacer) return;
    mgmtSlotEffacer(MGMT_PARTIES.effacer);
    MGMT_PARTIES.effacer=0; render();
  },
});
keysRegister('mgmt_parties',{
  ArrowLeft(){ CL.mgmtPartieCurseur(-1); },
  ArrowRight(){ CL.mgmtPartieCurseur(1); },
  Enter(){ if(MGMT_PARTIES.effacer) CL.mgmtPartieEffacerConfirmer(); else CL.mgmtPartieOuvrir(); },
  Delete(){ CL.mgmtPartieEffacer(); },
  Escape(){ if(MGMT_PARTIES.effacer) CL.mgmtPartieEffacerAnnuler(); else CL.mgmtLeave(); },
});
/* ==== [FIN ANCRE] ==== */
