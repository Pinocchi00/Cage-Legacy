"use strict";
/* ==== [ANCRE: MGMT_BRIEF_LOT11_COMBAT] — Brief du 06/10/2026, lot 11 : l'écran du combat animé (planches « Le combat
   animé », « Règles 3 », les quatre plans fixes et les trois planches de la salle). Le joueur regarde : un combat du moteur,
   rejoué depuis sa trace, sur une cage animée, sans jauge ni barre de moments clés. Ce fichier est l'écran : l'état de
   lecture (pause, vitesse x1 x2 x4, caméra, passer, revoir), la boucle d'image et la barre du bas. Le dessin est dans
   arene-salle.js, les échanges, le commentaire et les coins dans arene-coups.js, la mise en scène du temps et des pions
   dans arene-etat.js (échelle de temps : un round de 300 s tient en ~43 s d'affichage).
   Ce que regarder ne change JAMAIS : le résultat, la trace, la RNG de la partie. Un combat se rejoue avec le même
   seed ; ni la caméra, ni la vitesse, ni passer, ni revoir n'écrivent dans m. La seule suite d'un combat vu est
   `finRetour` (l'écran de soirée avance d'un combat).
   Touches : Espace pause, V vitesse, C caméra, P passer, R revoir après la décision, Entrée revenir à la soirée.
   Les réglages (vitesse et caméra de départ, commentaire, coins, nom des coups, secousses) sont posés ici avec leurs
   valeurs d'origine ; l'écran Options du lot 12 les change et les garde. ==== */

/** Combien de secondes de combat tiennent dans une seconde d'affichage à x1 (300 s → ~43 s, comme la planche). */
const MGMT_COMBAT_ECHELLE=7;
/** Secondes d'affichage entre deux rounds (la carte « ROUND n » et les coins). */
const MGMT_COMBAT_PAUSE=3.4;
/** Secondes tenues sur l'image finale avant l'annonce : une décision (les juges notent), un arrêt. */
const MGMT_COMBAT_QUEUE_DECISION=3.6;
const MGMT_COMBAT_QUEUE_FINITION=2.0;
const MGMT_COMBAT_VITESSES=[1,2,4];
/** Les réglages du combat, avec leurs valeurs d'origine. Le lot 12 les expose et les garde ; ici ils ne servent qu'à l'image. */
const MGMT_COMBAT_REGLAGES_ORIGINE={commentaire:true,coins:true,noms:true,secousses:true,vitesse:1,camera:'cable'};
let MGMT_COMBAT_REGLAGES=Object.assign({},MGMT_COMBAT_REGLAGES_ORIGINE);

let MGMT_COMBAT={session:null,vue:null,trace:null,refuse:false,d:0,vitesse:1,pause:false,plan:'cable',mode:'fight',fin:0,queue:0,decT:0,real:0,last:0,raf:0,
  carte:null,room:null,org:'',num:'',salle:null,retour:'mgmt_soiree',finRetour:null,salleDit:'',decision:null,decalRefait:false};

/** « SWAT » → « S » : l'initiale d'un pion. */
function mgmtCombatInitiale(nom){
  const s=String(nom||'?').normalize('NFD').replace(/[̀-ͯ]/g,'').trim();
  return (s.charAt(0)||'?').toUpperCase();
}
function mgmtCombatBilan(side){ return side.W+'-'+side.L+'-'+(side.D||0); }

/** La salle d'un combat déjà joué (revoir) : la part remplie de sa soirée et sa place dans la soirée. Dérivé de m, sans état.
 *  @returns {{taux:number|null,prog:number,nom:string}} */
function mgmtCombatSalleDeTrace(m,t){
  const soirees=mgmtSoirees(m), s=soirees.find(x=>x.c===t.c);
  if(!s) return {taux:null,prog:1,nom:''};
  const h=m.hist.indexOf(t), k=s.idx.indexOf(h);
  const prog=s.idx.length>1&&k>=0?k/(s.idx.length-1):1;
  let taux=null, nom='';
  if(m.lastEvent&&m.lastEvent.cycle===t.c&&m.lastEvent.finance){
    const f=m.lastEvent.finance; if(Number.isFinite(f.taux)) taux=f.taux; if(typeof f.salle==='string') nom=f.salle;
  }else{
    const c=(m.comptes||[]).find(x=>x&&x.n===s.n);
    if(c&&c.capacite>0) taux=Math.max(0,Math.min(1,c.spectateurs/c.capacite));
  }
  return {taux,prog,nom};
}
/** La phrase sur la salle, dite au début du combat : vide, aux deux tiers, pleine, ou qui se remplit. Choisie sur le combat, pas au hasard. */
function mgmtCombatSalleTexte(salle,quel,graine){
  const L=MGMT_COMMENTAIRE.salle, taux=salle&&Number.isFinite(salle.taux)?salle.taux:null, prog=salle?salle.prog:1;
  const choisi=l=>l[Math.abs(graine)%l.length];
  let t;
  if(taux===null) t=choisi(L.monte);
  else if(prog<0.34) t=choisi(L.monte);
  else if(taux<0.4) t=choisi(L.vide);
  else if(taux<0.8) t=choisi(L.deuxtiers);
  else t=choisi(L.pleine);
  return t.replace('{QUEL}',quel||'ce combat');
}

/** Ouvre le combat d'une trace sur l'écran animé. Sans effet sur m. @param {object} o {trace,etiquette,salle,retour,finRetour,quel}.
 *  @returns {boolean} faux si le combat ne peut pas être montré. */
function mgmtCombatOuvrir(o){
  const m=G&&G.mgmt, t=o&&o.trace;
  if(!m||!t) return false;
  mgmtCombatNettoyer();
  const C=MGMT_COMBAT;
  C.session=null; C.refuse=false; C.trace=t; C.retour=o.retour||'mgmt_soiree'; C.finRetour=typeof o.finRetour==='function'?o.finRetour:null;
  const res=mgmtReplayFight(t);
  if(!res||!areneVerdictFidele(t,res)){ C.refuse=true; CL.go('mgmt_combat'); return false; }
  const S=areneConstruire(res,{a:t.a.name,b:t.b.name},{echelle:MGMT_COMBAT_ECHELLE,pause:MGMT_COMBAT_PAUSE});
  if(!S){ C.refuse=true; CL.go('mgmt_combat'); return false; }
  areneCoupsConstruire(S);
  const R=MGMT_COMBAT_REGLAGES, salle=o.salle||mgmtCombatSalleDeTrace(m,t);
  C.sonT=-1;
  C.session=S; C.d=0; C.pause=false; C.mode='fight'; C.fin=0; C.decT=0; C.real=0; C.last=0; C.decalRefait=false;
  C.vitesse=MGMT_COMBAT_VITESSES.includes(R.vitesse)?R.vitesse:1;
  C.plan=ARENE_SALLE_PLANS.includes(R.camera)?R.camera:'cable';
  C.queue=S.methode.indexOf('Décision')===0||S.methode.indexOf('Nul')===0?MGMT_COMBAT_QUEUE_DECISION:MGMT_COMBAT_QUEUE_FINITION;
  C.decision=areneSalleDecision(S);
  C.salle=salle;
  C.room=areneSalleRoom(Number.isFinite(salle.taux)?salle.taux:0.65,salle.prog);
  const soir=mgmtSoirees(m).find(x=>x.c===t.c);
  C.org=mfNet(mgmtOrgNom(m)); C.num=String(soir?soir.n:(m.eventsPlayed||1));
  const divLib=mfNet(mgmtDivisionLabel(t.a.div));
  const et=o.etiquette||(t.slot==='main'?'CARTE PRINCIPALE':'PRÉLIMINAIRE');
  C.carte={a:mfNet(S.noms.a.court),b:mfNet(S.noms.b.court),ra:mgmtCombatBilan(t.a),rb:mgmtCombatBilan(t.b),
    la:mgmtCombatInitiale(S.noms.a.court),lb:mgmtCombatInitiale(S.noms.b.court),plate:et+' · '+divLib,rounds:Number.isSafeInteger(t.rounds)?t.rounds:3};
  C.salleDit=mgmtCombatSalleTexte(salle,o.quel||(t.slot==='main'&&o.etiquette===MGMT_SOIREE_TEXTES.principal?'le combat principal':'ce combat'),S.res&&S.res.log?S.res.log.length:S.segs.length);
  CL.go('mgmt_combat');
  mgmtCombatDemarrer();
  return true;
}
/** Revoir un combat (résultats, lendemain, fiche) : l'écran animé avec l'agenda, l'arène d'avant sans. */
function mgmtRevoirCombat(t,retour,finRetour){
  const m=G&&G.mgmt;
  if(m&&typeof mgmtAgendaActif==='function'&&mgmtAgendaActif(m)) return mgmtCombatOuvrir({trace:t,retour:retour,finRetour:finRetour});
  const res=mgmtReplayFight(t); if(!res) return false;
  areneEcranCharger(res,{a:t.a.name,b:t.b.name},t);
  ARENE_ECRAN.retour=retour; ARENE_ECRAN.finRetour=finRetour||null;
  CL.go('arene_socle'); areneEcranDemarrer();
  return true;
}

/* ---- La lecture --------------------------------------------------------------------------------------------- */

/** Fait avancer la lecture de `dt` secondes réelles. Pur côté jeu : ne touche qu'à l'état de lecture. */
function mgmtCombatAvancer(dt){
  const C=MGMT_COMBAT, S=C.session;
  if(!S||C.refuse) return;
  C.real+=dt;
  if(C.pause) return;
  if(C.mode==='fight'){
    if(C.d<S.dureeAffichage) C.d=Math.min(S.dureeAffichage,C.d+dt*C.vitesse);
    else{
      C.fin+=dt*C.vitesse;
      if(C.fin>=C.queue){ C.mode='dec'; C.decT=0; mgmtCombatBarreMaj(); }
    }
  }else if(C.mode==='dec') C.decT+=dt;
}
/** Où en est la pause entre deux rounds à l'instant d'affichage d : 0 à 1, ou -1 hors pause. */
function mgmtCombatPauseProg(S,d){
  for(const e of S.montage){ if(e.genre==='pause'&&d>=e.d0&&d<e.d1) return (d-e.d0)/(e.d1-e.d0); }
  return -1;
}
/** Tout ce que le dessin a besoin de savoir à l'instant courant. Aucune jauge, aucun indicateur de domination : seulement
 *  des positions, des échanges, des voix et le décor. */
function mgmtCombatCx(){
  const C=MGMT_COMBAT, S=C.session, e=areneInstant(S,C.d), R=MGMT_COMBAT_REGLAGES;
  const pp=mgmtCombatPauseProg(S,C.d), pause=pp>=0||e.phase==='coins';
  let t=pause?(e.r-1)*S.roundLen:e.t;
  const termine=C.d>=S.dureeAffichage-1e-6;
  if(termine) t=S.dureeCombat;
  const eas=x=>salEase(x);
  const titre=pause?{n:e.r,alpha:Math.min(eas(pp/0.12),1-eas((pp-0.8)/0.2))}
    :((e.r===1&&C.d<2.3)?{n:1,alpha:Math.min(eas(C.d/0.3),1-eas((C.d-1.8)/0.5))}:null);
  const decisionTail=termine&&C.decision&&C.decision.decision;
  let fade=C.d<0.5?1-eas(C.d/0.5):0;
  if(decisionTail) fade=Math.max(fade,eas((C.fin-(C.queue-0.9))/0.9));
  const noms={a:S.noms.a.court,b:S.noms.b.court};
  return {t:t,real:C.real,etat:e,session:S,plan:C.plan,planLibelle:areneSallePlanLibelle(C.plan,noms),planCourt:areneSallePlanLibelle(C.plan,noms,true),room:C.room,carte:C.carte,org:C.org,num:C.num,
    regl:R,pause:pause,mode:C.mode,decT:C.decT,dec:C.decision,voix:areneVoixA(S,t),salleDit:C.salleDit,
    coins:(pause||C.mode==='dec')?[]:areneCoinsA(S,t),titre:titre,fade:fade,
    combattez:(e.r===1&&C.d>2.2&&C.d<3.3)?Math.min(eas((C.d-2.2)/0.15),1-eas((C.d-3.0)/0.3)):0,
    juges:decisionTail?(C.fin-1.1)/0.25:0,
    chrono:(C.d>2.2&&C.d<3)||(e.horloge<10&&!pause&&!e.fini)};
}
/** Le son du combat (lot 12) : le public suit le remplissage de la salle, un impact à chaque coup qui touche. Présentation seule. */
function mgmtCombatSon(cx){
  const C=MGMT_COMBAT, S=C.session;
  if(typeof mgmtSonSalle!=='function'||!S) return;
  mgmtSonSalle(C.pause||C.mode==='dec'?0.1:cx.room.part*cx.room.noise);
  if(C.pause||C.mode!=='fight'||cx.pause){ C.sonT=cx.t; return; }
  if(!(C.sonT>=0)||cx.t<C.sonT) C.sonT=cx.t;
  for(const e of S.coups){ if(e.t>C.sonT&&e.t<=cx.t&&e.r===1) mgmtSonCoup(e.big?1:e.p); }
  C.sonT=cx.t;
}
function mgmtCombatBoucle(now){
  const C=MGMT_COMBAT; C.raf=0;
  if(!G||G.screen!=='mgmt_combat'||!C.session) return;
  const cv=document.getElementById('mc-cv');
  if(!cv) return;
  if(!C.vue||C.vue.cv!==cv){
    if(C.vue) C.vue.detruire();
    C.vue=areneSalleCreer(cv); C.decalRefait=false;
    /* Sans toile mise en page (le harnais de test, un navigateur sans canvas) il n'y a rien à animer : après quelques images la boucle
       s'arrête et la lecture se mène à la main. */
    if(!C.vue){
      C.essais=(C.essais||0)+1;
      if(C.essais<90&&typeof requestAnimationFrame!=='undefined') C.raf=requestAnimationFrame(mgmtCombatBoucle);
      return;
    }
  }
  C.essais=0;
  /* Images par seconde (réglage du lot 12) : le combat n'est redessiné que si le temps est venu. */
  if(C.last&&typeof mgmtReglagesPasImage==='function'&&now-C.last<mgmtReglagesPasImage()){
    if(typeof requestAnimationFrame!=='undefined') C.raf=requestAnimationFrame(mgmtCombatBoucle);
    return;
  }
  const dt=C.last?Math.min(0.05,Math.max(0,(now-C.last)/1000)):0; C.last=now;
  mgmtCombatAvancer(dt);
  if(C.vue){
    /* La police arrive après le premier dessin : l'affiche posée au sol est refaite une fois. */
    if(!C.decalRefait&&C.real>1.2){ C.decalRefait=true; C.vue.decalCle=''; }
    const cx=mgmtCombatCx();
    C.vue.dessiner(cx);
    mgmtCombatSon(cx);
  }
  if(typeof requestAnimationFrame!=='undefined') C.raf=requestAnimationFrame(mgmtCombatBoucle);
}
function mgmtCombatDemarrer(){
  const C=MGMT_COMBAT;
  if(C.raf&&typeof cancelAnimationFrame!=='undefined') cancelAnimationFrame(C.raf);
  C.raf=0; C.last=0;
  if(typeof requestAnimationFrame!=='undefined') C.raf=requestAnimationFrame(mgmtCombatBoucle);
}
/** Quitte l'écran : la boucle s'arrête, l'écouteur de la vue est débranché, rien ne survit. */
function mgmtCombatNettoyer(){
  const C=MGMT_COMBAT;
  if(C.raf&&typeof cancelAnimationFrame!=='undefined') cancelAnimationFrame(C.raf);
  C.raf=0;
  if(C.vue){ C.vue.detruire(); C.vue=null; }
}

/* ---- L'écran -------------------------------------------------------------------------------------------------- */

function mgmtCombatBouton(touche,libelle,onclick){
  return `<button type="button" class="mf-cb-b"${onclick?` onclick="${onclick}"`:''}><span class="mf-cb-k">${esc(touche)}</span><span>${esc(libelle)}</span></button>`;
}
function mgmtCombatPuce(libelle,aria,onclick,actif,large){
  return `<button type="button" class="mf-cb-p${actif?' on':''}${large?' lg':''}" aria-label="${esc(aria)}" aria-pressed="${actif?'true':'false'}" onclick="${onclick}">${esc(libelle)}</button>`;
}
/** La barre du bas : en lecture (pause, vitesse, caméra, passer) ou après la décision (revoir, revenir à la soirée). */
function mgmtCombatBarreHtml(){
  const C=MGMT_COMBAT, S=C.session; if(!S) return '';
  const noms={a:S.noms.a.court,b:S.noms.b.court};
  if(C.mode==='dec'){
    return `<div class="mf-cb-g">${mgmtCombatBouton('R','Revoir le combat','CL.mgmtCbRevoir()')}</div>`
      +`<button type="button" class="mf-cb-b" onclick="CL.mgmtCbRetour()"><span class="mf-cb-k or">Entrée</span><span>Revenir à la soirée</span></button>`;
  }
  const vit=MGMT_COMBAT_VITESSES.map(v=>mgmtCombatPuce('x'+v,'Vitesse x'+v,`CL.mgmtCbVitesse(${v})`,C.vitesse===v,false)).join('');
  const cams=ARENE_SALLE_PLANS.map(id=>mgmtCombatPuce(areneSallePlanLibelle(id,noms,true),'Caméra : '+areneSallePlanLibelle(id,noms,true).toLowerCase(),`CL.mgmtCbCamera('${id}')`,C.plan===id,true)).join('');
  return `<div class="mf-cb-g">`
    +`<button type="button" class="mf-cb-b" onclick="CL.mgmtCbPause()"><span class="mf-cb-k">Espace</span><span id="mc-pause">${C.pause?'Reprendre':'Pause'}</span></button>`
    +`<div class="mf-cb-b"><span class="mf-cb-k">V</span><span>Vitesse</span><div class="mf-cb-ps">${vit}</div></div>`
    +`<div class="mf-cb-b"><span class="mf-cb-k">C</span><span>Caméra</span><div class="mf-cb-ps">${cams}</div></div></div>`
    +`<button type="button" class="mf-cb-b" onclick="CL.mgmtCbPasser()"><span class="mf-cb-k">P</span><span>Passer le combat</span></button>`;
}
function mgmtCombatBarreMaj(){
  const el=typeof document!=='undefined'?document.getElementById('mc-barre'):null;
  if(el) el.innerHTML=mgmtCombatBarreHtml();
}
function scr_mgmt_combat(){
  const C=MGMT_COMBAT;
  if(C.refuse||!C.session){
    /* Garde-fou du rejeu : l'issue rejouée ne correspond plus à l'issue enregistrée, rien n'est montré. Le texte est un texte d'auteur. */
    return mfEcran(`<main class="mf-contenu"><div class="mf-su-vide">${mfPanneau(`<div class="mf-eff-aucun">${esc('Ce combat ne peut pas être montré.')}</div>`,'normal')}</div></main>`,
      {barre:'aucune',touches:[{ks:['Entrée'],t:'Revenir',jaune:true,onclick:'CL.mgmtCbRetour()'}]});
  }
  return `<div class="mf-ecran mf-cb"><div class="mf-stage"><canvas id="mc-cv" class="mf-cb-cv" width="1920" height="1080" role="img" aria-label="Le combat : les pions des deux combattants dans la cage, la salle autour"></canvas>`
    +`<div id="mc-barre" class="mf-cb-barre">${mgmtCombatBarreHtml()}</div></div></div>`;
}
SCREENS.mgmt_combat=scr_mgmt_combat;

/** Retour de l'écran : la suite d'un combat vu (l'écran de soirée avance d'un combat), jamais un effet sur le combat. */
function mgmtCombatSortir(){
  const C=MGMT_COMBAT, fin=C.finRetour, retour=C.retour;
  mgmtCombatNettoyer();
  C.finRetour=null; C.session=null; C.refuse=false;
  if(fin) fin();
  CL.go(retour||'mgmt_soiree');
}
Object.assign(CL,{
  mgmtCbPause(){
    const C=MGMT_COMBAT; if(!C.session||C.mode!=='fight') return;
    C.pause=!C.pause;
    const el=document.getElementById('mc-pause'); if(el) el.textContent=C.pause?'Reprendre':'Pause';
  },
  mgmtCbVitesse(v){
    const C=MGMT_COMBAT; if(!C.session) return;
    const x=v===undefined?MGMT_COMBAT_VITESSES[(MGMT_COMBAT_VITESSES.indexOf(C.vitesse)+1)%MGMT_COMBAT_VITESSES.length]:v;
    if(!MGMT_COMBAT_VITESSES.includes(x)) return;
    C.vitesse=x; mgmtCombatBarreMaj();
  },
  mgmtCbCamera(id){
    const C=MGMT_COMBAT; if(!C.session) return;
    const x=id===undefined?ARENE_SALLE_PLANS[(ARENE_SALLE_PLANS.indexOf(C.plan)+1)%ARENE_SALLE_PLANS.length]:id;
    if(!ARENE_SALLE_PLANS.includes(x)) return;
    C.plan=x; mgmtCombatBarreMaj();
  },
  mgmtCbPasser(){
    const C=MGMT_COMBAT; if(!C.session||C.mode!=='fight') return;
    C.mode='dec'; C.decT=0; C.fin=C.queue; mgmtCombatBarreMaj();
  },
  mgmtCbRevoir(){
    const C=MGMT_COMBAT; if(!C.session||C.mode!=='dec') return;
    C.mode='fight'; C.d=0; C.fin=0; C.decT=0; C.pause=false; C.sonT=-1;
    if(C.vue){ C.vue.camS=null; C.vue.trail={A:[],B:[]}; C.vue.tPrec=-1; }
    mgmtCombatBarreMaj();
  },
  mgmtCbRetour(){
    const C=MGMT_COMBAT;
    if(C.refuse||!C.session||C.mode==='dec') mgmtCombatSortir();
  },
});
keysRegister('mgmt_combat',{
  ' '(){ CL.mgmtCbPause(); },
  v(){ CL.mgmtCbVitesse(); }, V(){ CL.mgmtCbVitesse(); },
  c(){ CL.mgmtCbCamera(); }, C(){ CL.mgmtCbCamera(); },
  p(){ CL.mgmtCbPasser(); }, P(){ CL.mgmtCbPasser(); },
  r(){ CL.mgmtCbRevoir(); }, R(){ CL.mgmtCbRevoir(); },
  Enter(){ CL.mgmtCbRetour(); },
  Escape(){ if(MGMT_COMBAT.mode==='dec'||MGMT_COMBAT.refuse) CL.mgmtCbRetour(); else CL.mgmtCbPasser(); },
});
/* ==== [FIN ANCRE] ==== */
