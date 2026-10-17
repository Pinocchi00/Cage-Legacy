"use strict";
/* ==== [ANCRE: MGMT_BRIEF_LOT7C_PRELIMINAIRES] — Brief du 06/10/2026, lot 7 : l'écran Préliminaires
   (planche « Management — Préliminaires »). Monde lot 14 T2 (décision d'Anthony du 17/10/2026) :
   dès qu'une soirée est posée, Leïla compose les préliminaires et les pose elle-même — chaque
   emplacement est donc « posé » (déjà sur la carte) ou « à trouver » (un trou que Leïla n'a pu
   remplir). Au centre le face-à-face du préliminaire choisi, avec les mêmes lignes de comparaison
   que la carte principale ; la cause enregistrée s'y lit. Le joueur peut changer un combat (C :
   Leïla le remplace par une paire fraîche) ou le faire refaire (R : écrasement) ; les fiches et
   la présentation restent. Plus de « Valider la carte » ni de proposition à valider.
   Aucune règle ne change, aucun format de sauvegarde non plus. ==== */

let MGMT_PRELIMS={i:0};

/** Les emplacements des préliminaires, dans l'ordre : posés, puis à trouver. Pur. */
function mgmtPrelimsEmplacements(m){
  const c=m.card||{}, taille=Number.isSafeInteger(c.sizePrelims)&&c.sizePrelims>0?c.sizePrelims:MGMT_PRELIM_SIZE;
  const poses=Array.isArray(c.prelims)?c.prelims:[];
  const out=[];
  for(let i=0;i<taille;i++){
    out.push(i<poses.length?{etat:'valide',fight:poses[i]}:{etat:'atrouver',fight:null});
  }
  return {slots:out,bloc:null};
}

function mgmtPrelimsLigne(m,s,i,choisi){
  const f=s.fight, fa=f&&mgmtFighterById(m,f.a), fb=f&&mgmtFighterById(m,f.b);
  const early=i<(m.card.sizeEarly||0), nom=early?`EARLY PRELIM ${i+1}`:`PRÉLIM ${i+1}`;
  const etat=s.etat==='valide'?MF_SVG_CONFIRME:'';
  const corps=f&&fa&&fb
    ?`<div class="mf-car-slot-t"><span>${esc(nom)}</span><em>${esc(mgmtCarteCourt(fa.div))}</em></div>`
      +`<div class="mf-car-slot-n"><b>${esc(mfNet(fa.last||fa.name))}</b>${mfMarqueNom(m,fa&&fa.id)}<span>contre</span><b>${esc(mfNet(fb.last||fb.name))}</b>${mfMarqueNom(m,fb&&fb.id)}</div>`
    :`<div class="mf-car-slot-t"><span>${esc(nom)}</span></div><div class="mf-car-slot-v">À trouver</div>`;
  return `<button type="button" class="mf-car-slot mf-pre-slot ${s.etat}${choisi?' choisi':''}" onclick="CL.mgmtPrelimsVa(${i})"><div class="mf-car-num">${i+1}</div><div class="mf-car-slot-c">${corps}</div>`
    +`<div class="mf-car-slot-s">${etat}</div></button>`;
}

/** Une phrase de Leïla qui tourne : la première au premier cycle, puis la suivante à chaque soirée — jamais deux soirées de suite la même. Dérivé du cycle, rien ne se stocke. */
function mgmtLeilaTour(m,liste){ return liste[((m&&m.cycle||0)%liste.length+liste.length)%liste.length]; }

/** Les raisons de Leïla pour la paire (planche « Pourquoi elle le propose ») : l'attente de l'un, la défaite de l'autre ; à défaut, ce qu'ils ont en commun. Dérivé. */
function mgmtPrelimsRaisons(m,fa,fb){
  const out=[];
  for(const f of [fa,fb]){
    if(!f) continue;
    const fem=(divById(f.div)||{}).gender==='F';   /* brief démo, lot 9 T3 : la raison s'accorde avec la combattante */
    const n=fem?mgmtCarteNote(m,f).replace(/^Battu par/,'Battue par'):mgmtCarteNote(m,f);
    if(/^(Attend depuis|Battue? par|A battu|Nul contre)/.test(n)) out.push(mfNet(f.last||f.name).replace(/^(.)(.*)$/,(x,a,b)=>a+b.toLowerCase())+' '+n.charAt(0).toLowerCase()+n.slice(1));
  }
  if(!out.length&&fa&&fb) out.push((divById(fa.div)||{}).gender==='F'?'Deux combattantes libres de la même catégorie':'Deux combattants libres de la même catégorie');
  return out.slice(0,2);
}
/** Les autres choix pour le préliminaire proposé : la catégorie, libres et hors de la proposition, dans l'ordre du classement. */
function mgmtPrelimsAlternatives(m,fight,bloc,cote){
  const fa=fight&&mgmtFighterById(m,cote==='a'?fight.b:fight.a); if(!fa||!bloc) return [];
  const pris=new Set(); (bloc.fights||[]).forEach(x=>{ pris.add(x.a); pris.add(x.b); });
  return mgmtCartRows(m).filter(f=>f.div===fa.div&&!pris.has(f.id)&&mgmtSelectable(m,f,fa.id));
}

function scr_mgmt_prelims(){
  if(!G||!G.mgmt) return scr_mgmt_bureau();
  const m=G.mgmt, P=MGMT_PRELIMS, {slots,bloc}=mgmtPrelimsEmplacements(m);
  if(!Number.isSafeInteger(P.i)||P.i<0||P.i>=slots.length) P.i=0;
  const s=slots[P.i], f=s.fight;
  const lignes=slots.map((x,i)=>mgmtPrelimsLigne(m,x,i,i===P.i)).join('');
  const legende=`<div class="mf-car-legende"><span>${MF_SVG_CONFIRME}Posé</span>${slots.some(x=>x.etat==='atrouver')?'<span><i class="mf-eff-q">?</i>À trouver</span>':''}</div>`;
  const gaucheHtml=(petit)=>mfPanneau(`<div class="mf-car-t">LA CARTE DE LEÏLA</div><div class="mf-car-slots mf-pre-slots">${lignes}</div>${legende}${petit||''}`,'normal','mf-car-g');

  const fa=f&&mgmtFighterById(m,f.a), fb=f&&mgmtFighterById(m,f.b);
  const duo=!!(fa&&fb), ca=mgmtCarteColonne(m,fa), cb=mgmtCarteColonne(m,fb);
  const comp=duo
    ?mgmtCarteLigneComp(esc(ca.rang),esc(cb.rang),'Classement')+mgmtCarteLigneComp(esc(ca.bilan),esc(cb.bilan),'Palmarès')
      +mgmtCarteLigneComp(esc(ca.allonge),esc(cb.allonge),'Allonge')+mgmtCarteLigneComp(esc(ca.style),esc(cb.style),'Style')
      +mgmtCarteLigneComp(ca.forme,cb.forme,'3 derniers combats')+mgmtCarteLigneComp(`<b>${esc(ca.contrat)}</b>`,`<b>${esc(cb.contrat)}</b>`,'Contrat restant')
    :`<div class="mf-car-aide">${esc(P.aide?P.aide:'Ce préliminaire n’est pas encore trouvé.')}</div>`;
  /* Monde lot 14 T2 : ce qui pose Leïla porte sa cause enregistrée (lot 6) ; la lecture dérivée n'y remplace pas la donnée. */
  const lignesRaison=duo&&f.raison?mgmtRaisonLignes(m,{...f.raison,origine:f.origine},[fa,fb]):null;
  const pourquoi=lignesRaison?`<div class="mf-car-enjeux mf-pre-pourquoi"><div class="mf-cal-lib">Leïla · pourquoi elle l’a posé</div><div><span>${lignesRaison.l1}</span><span>${lignesRaison.l2}</span></div></div>`:'';
  const etatPoser=slots.length-slots.filter(x=>x.etat==='valide').length;
  const boutons=`<div class="mf-car-boutons">`
    +(duo&&s.etat==='valide'?mfBouton('Changer',{touche:'C',onclick:'CL.mgmtPrelimsChanger()'})+mfBouton('Refaire',{touche:'R',onclick:'CL.mgmtPrelimsRefaire()'}):'')
    /* ==== [ANCRE: MGMT_PRESENTATION_PRELIMS_BOUTON] — Monde lot 3 T5 ==== */
    +(duo?mfBouton('Présentation',{onclick:'CL.mgmtPrelimsPresentation()'})+mfBouton('Fiches',{touche:'F',onclick:'CL.mgmtPrelimsFiche()'}):'')
    +(etatPoser?mfBouton('Trouver un remplaçant',{touche:'Entrée',jaune:true,onclick:'CL.mgmtPrelimsRemplacer()'}):'')+`</div>`;
  const banniere=mgmtCarteBanniere(fa,fb,fa?fa.div:(allDivisions()[0]||{}).id,duo?3:'','');
  const centre=`<div class="mf-car-c">${banniere}${mfPanneau(`<div class="mf-car-comp-l">${comp}</div>${pourquoi}${boutons}`,'normal','mf-car-cmp')}</div>`;

  const sM=Number.isSafeInteger(m.card.sizeMain)?m.card.sizeMain:MGMT_MAIN_SIZE, nM=m.card.main.length, manque=Math.max(0,sM-nM);
  const droite=mfPanneau(`<div class="mf-car-t" style="font-size:22px;letter-spacing:.04em;color:var(--mf-texte2)">CARTE PRINCIPALE</div>`
    +`<div class="mf-pre-compte">${nM} / ${sM}</div>`
    +(manque?`<div class="mf-pre-manque"><i class="mf-pastille-j"></i>Manque : ${manque} combat${manque>1?'s':''}</div>`:'')
    +mfBouton('Ouvrir la carte',{onclick:"CL.go('mgmt_carte')",classe:'mf-pre-ouvrir'}),'normal','mf-car-d');
  const contenu=`<main class="mf-contenu mf-carte">${gaucheHtml(droite?'':droite)}${centre}${droite}</main>`;
  return mfEcran(contenu,{barre:'jeu',courant:'preliminaires',m,plaque:'Préliminaires',libelle:`${slots.filter(x=>x.etat==='valide').length} / ${slots.length}`,tuiles:[slots.filter(x=>x.etat==='valide').length,slots.length],
    droite:`${mgmtOrgNom(m)} Fight Night ${(m.eventsPlayed||0)+1}`,
    touches:[{ks:['Échap'],t:'Retour',onclick:"CL.go('mgmt_carte')"},{ks:['↑','↓'],t:'Choisir'},{ks:['A','E'],t:'Section'},
      {ks:['C'],t:'Changer',onclick:'CL.mgmtPrelimsChanger()'},{ks:['R'],t:'Refaire',onclick:'CL.mgmtPrelimsRefaire()'},{ks:['F'],t:'Fiches',onclick:'CL.mgmtPrelimsFiche()'}]
      .concat(etatPoser?[{ks:['Entrée'],t:'Trouver un remplaçant',jaune:true,onclick:'CL.mgmtPrelimsRemplacer()'}]:[])});
}
SCREENS.mgmt_prelims=scr_mgmt_prelims;

function mgmtPrelimsReponse(action){
  const m=G.mgmt, {bloc}=mgmtPrelimsEmplacements(m); if(!bloc) return null;
  const ex=MGMT_EXCHANGES[bloc.exchange], rep=ex&&(ex.replies||[]).find(r=>r.action===action);
  return rep?{id:bloc.id,rep:rep.id}:null;
}
Object.assign(CL,{
  /* ==== [ANCRE: MGMT_PRESENTATION_PRELIMS_GESTE] — Monde lot 3 T5 ==== */
  mgmtPrelimsPresentation(){
    const {slots}=mgmtPrelimsEmplacements(G.mgmt),f=slots[MGMT_PRELIMS.i||0]?.fight;
    return f?CL.mgmtPresentationOuvrir('combat',[f.a,f.b],{liste:slots.filter(s=>s.fight).map(s=>({ids:[s.fight.a,s.fight.b]}))}):false;
  },
  mgmtPrelimsVa(i){ if(Number.isSafeInteger(i)&&i>=0){ MGMT_PRELIMS.i=i; render(); } },
  /** Quel combattant du préliminaire proposé on remplace : le premier ou le second. */
  mgmtPrelimsCote(c){ MGMT_PRELIMS.cote=c==='a'?'a':'b'; render(); },
  mgmtPrelimsBouge(d){ const n=mgmtPrelimsEmplacements(G.mgmt).slots.length; MGMT_PRELIMS.i=((MGMT_PRELIMS.i||0)+d+n)%n; render(); },
  mgmtPrelimsValider(){ const r=mgmtPrelimsReponse('validate'); if(r) CL.mgmtReply(r.id,r.rep); },
  /** Leïla remplace aussitôt le combat posé choisi par une paire fraîche. */
  mgmtPrelimsChanger(){
    const {slots}=mgmtPrelimsEmplacements(G.mgmt), s=slots[MGMT_PRELIMS.i||0];
    if(!s||s.etat!=='valide') return;
    if(mgmtPrelimChanger(G.mgmt,MGMT_PRELIMS.i||0)){ saveMgmt(); render(); }
  },
  mgmtPrelimsRefaire(){ if(mgmtPrelimRefaire(G.mgmt,MGMT_PRELIMS.i||0)){ saveMgmt(); render(); } },
  /* Planche « Préliminaires » : un clic sur un autre choix remplace le second combattant du préliminaire proposé. */
  mgmtPrelimsRemplace(id){
    const {slots,bloc}=mgmtPrelimsEmplacements(G.mgmt), s=slots[MGMT_PRELIMS.i||0];
    if(!bloc||!s||s.etat!=='avalider') return;
    if(mgmtBulkRemplacer(G.mgmt,bloc.id,s.idxBloc,id,MGMT_PRELIMS.cote)){ saveMgmt(); render(); }
  },
  /** Faire monter le préliminaire proposé sur la carte principale, s'il y reste une place. */
  mgmtPrelimsMonter(){
    const {slots,bloc}=mgmtPrelimsEmplacements(G.mgmt), s=slots[MGMT_PRELIMS.i||0];
    if(!bloc||!s||s.etat!=='avalider') return;
    if(mgmtBulkMonter(G.mgmt,bloc.id,s.idxBloc)){ saveMgmt(); MGMT_PRELIMS.i=0; render(); }
  },
  /** La fiche du premier combattant du préliminaire choisi (la touche répétée ouvre celle du second). */
  mgmtPrelimsFiche(){
    const {slots}=mgmtPrelimsEmplacements(G.mgmt), s=slots[MGMT_PRELIMS.i||0];
    if(!s||!s.fight) return;
    MGMT_PRELIMS.fiche=MGMT_PRELIMS.fiche==='a'?'b':'a';
    CL.mgmtFiche(MGMT_PRELIMS.fiche==='a'?s.fight.a:s.fight.b);
  },
  /** Un trou en préliminaires se règle ici, en une action : Leïla propose le remplaçant, qu'on valide ensuite. */
  mgmtPrelimsRemplacer(){
    const m=G.mgmt;
    if(!mgmtOfferBulk(m,true)){ MGMT_PRELIMS.aide=m.shortfall?'Aucun remplaçant disponible pour l’instant.':''; }
    else MGMT_PRELIMS.aide='';
    saveMgmt(); CL.go('mgmt_prelims');
  },
});
keysRegister('mgmt_prelims',{
  ArrowUp(){ CL.mgmtPrelimsBouge(-1); },
  ArrowDown(){ CL.mgmtPrelimsBouge(1); },
  Enter(){ if(mgmtCardPrelimsShort(G.mgmt)) CL.mgmtPrelimsRemplacer(); },
  c(){ CL.mgmtPrelimsChanger(); },
  C(){ CL.mgmtPrelimsChanger(); },
  r(){ CL.mgmtPrelimsRefaire(); },
  R(){ CL.mgmtPrelimsRefaire(); },
  f(){ CL.mgmtPrelimsFiche(); },
  F(){ CL.mgmtPrelimsFiche(); },
  m(){ CL.mgmtPrelimsMonter(); },
  M(){ CL.mgmtPrelimsMonter(); },
  Tab(){ CL.mgmtPrelimsCote(MGMT_PRELIMS.cote==='a'?'b':'a'); },
  Escape(){ CL.go('mgmt_accueil'); },
});
/* ==== [FIN ANCRE] ==== */
