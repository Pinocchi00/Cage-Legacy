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
  MGMT_VESTIAIRE={div:'',role:'',dispo:false,lien:'',signe:false,page:0}; MGMT_EFFECTIF={sexe:'H',div:'',curseur:0};
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

/** Un emplacement : un panneau du cadre (choisi à 100 %, les autres de côté à 30 %). */
function mgmtPartieHtml(n,curseur,reg,maintenant){
  const m=mgmtSlotPeek(n), on=n===curseur;
  const tete=nom=>`<div class="mf-partie-tete"><div class="mf-partie-num">Emplacement ${esc(n)}</div><div class="mf-partie-org">${esc(nom)}</div></div>`;
  const pied=texte=>on?`<div class="mf-partie-pied">${mfBouton(texte,{touche:'Entrée',jaune:true,onclick:'CL.mgmtPartieOuvrir()'})}</div>`:'';
  const attr=`role="button" tabindex="0" aria-pressed="${on}" aria-label="Emplacement ${esc(n)}" onclick="CL.mgmtPartieChoisir(${n})"`;
  let corps;
  if(!m){
    corps=tete('Vide')+`<div class="mf-partie-corps"><div><div class="mf-partie-sur">Ici, tu peux lancer</div><div class="mf-partie-vide">Une nouvelle<br>partie</div></div>`
      +`<div class="mf-partie-note">Chaque partie crée un effectif neuf :<br>les noms, les palmarès, les classements.</div>`+pied('Nouvelle partie')+`</div>`;
  }else{
    const date=mgmtPartieDate(reg.dates[n],maintenant);
    corps=tete(m.org)+`<div class="mf-partie-corps"><div style="display:flex;flex-direction:column;gap:12px"><div class="mf-partie-sur">La prochaine soirée</div>`
      +`<div class="mf-partie-soiree"><span>${esc(m.org)} Fight Night</span><b>${esc(m.eventsPlayed+1)}</b></div></div>`
      +`<div class="mf-partie-lignes">`+mfLigne('Soirées jouées',m.eventsPlayed)
      +mfLigne('En caisse',mgmtEuros(Number.isSafeInteger(m.treasury)?m.treasury:0))
      +(date?mfLigne('Jouée pour la dernière fois',date):'')+`</div>`+pied('Reprendre')+`</div>`;
  }
  return mfPanneau(corps,on?'choisi':'cote','mf-partie'+(on?' choisi':''),attr);
}

function scr_mgmt_parties(){
  const F=MGMT_PARTIES, reg=mgmtRegistre(), maintenant=Date.now();
  if(!mgmtSlotValide(F.curseur)) F.curseur=1;
  const occupe=!!mgmtSlotPeek(F.curseur);
  if(F.effacer&&!mgmtSlotPeek(F.effacer)) F.effacer=0;
  let cartes='';
  for(let n=1;n<=MGMT_SLOTS;n++) cartes+=mgmtPartieHtml(n,F.curseur,reg,maintenant);
  let dialogue='', touches;
  if(F.effacer){
    /* La phrase de confirmation n'est pas décidée (brief, « À trancher », lot 1) : le titre et les faits. */
    const m=mgmtSlotPeek(F.effacer);
    dialogue=`<div class="mf-voile"></div><div class="mf-dialogue mgmt-parties-confirme" role="dialog" aria-label="Effacer la partie">`
      +mfPanneau(`<div><div class="mf-dialogue-titre">EFFACER LA PARTIE ?</div><div class="mf-dialogue-trait"></div></div>`
        +`<div class="mf-dialogue-texte">Emplacement ${esc(F.effacer)} · ${esc(m.org)} · ${esc(m.eventsPlayed)} soirée${m.eventsPlayed>1?'s':''} jouée${m.eventsPlayed>1?'s':''}</div>`
        +`<div class="mf-dialogue-boutons">${mfBouton('Garder',{touche:'Échap',onclick:'CL.mgmtPartieEffacerAnnuler()'})}${mfBouton('Effacer la partie',{touche:'Entrée',jaune:true,onclick:'CL.mgmtPartieEffacerConfirmer()'})}</div>`,'choisi')+`</div>`;
    touches=[{ks:['Échap'],t:'Garder la partie',onclick:'CL.mgmtPartieEffacerAnnuler()'},{ks:['Entrée'],t:'Effacer la partie',jaune:true,onclick:'CL.mgmtPartieEffacerConfirmer()'}];
  }else{
    touches=[{ks:['Échap'],t:'Retour à l’accueil',onclick:'CL.mgmtLeave()'},{ks:['←','→'],t:'Choisir'}]
      .concat(occupe?[{ks:['Suppr'],t:'Effacer la partie',onclick:'CL.mgmtPartieEffacer()'}]:[])
      .concat([{ks:['Entrée'],t:occupe?'Reprendre':'Nouvelle partie',jaune:true,onclick:'CL.mgmtPartieOuvrir()'}]);
  }
  return mfEcran(`<div class="mf-parties mgmt-parties">${cartes}</div>${dialogue}`,
    {barre:'demarrage',plaque:'Management',libelle:'Choisis une partie',droite:MGMT_SLOTS+' emplacements',touches});
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
  /** Un emplacement occupé se reprend ; un emplacement vide ouvre le choix de l'organisation (brief du 06/10, lot 5). */
  mgmtPartieOuvrir(){
    if(MGMT_PARTIES.effacer) return;
    if(mgmtSlotPeek(MGMT_PARTIES.curseur)) CL.mgmtEnter(MGMT_PARTIES.curseur);
    else CL.mgmtNouvelle(MGMT_PARTIES.curseur);
  },
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
