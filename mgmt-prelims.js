"use strict";
/* ==== [ANCRE: MGMT_BRIEF_LOT7C_PRELIMINAIRES] — Brief du 06/10/2026, lot 7 : l'écran Préliminaires
   (planche « Management — Préliminaires »). À gauche « La carte de Leïla » : chaque préliminaire est
   « validé » (déjà posé sur la carte), « à valider » (dans la proposition que Leïla a préparée) ou
   « à trouver » (rien encore). Au centre le face-à-face du préliminaire choisi, avec les mêmes lignes de
   comparaison que la carte principale. À droite l'état de la carte principale et sa voix. Les réponses
   sont celles qui existent : valider la carte, changer le combat choisi (échange), la refaire (écrasement).
   Aucune règle ne change, aucun format de sauvegarde non plus. ==== */

let MGMT_PRELIMS={i:0};

/** Les emplacements des préliminaires, dans l'ordre : validés, puis à valider, puis à trouver. Pur. */
function mgmtPrelimsEmplacements(m){
  const c=m.card||{}, taille=Number.isSafeInteger(c.sizePrelims)&&c.sizePrelims>0?c.sizePrelims:MGMT_PRELIM_SIZE;
  const poses=Array.isArray(c.prelims)?c.prelims:[];
  const bloc=(m.pile||[]).find(a=>a.kind==='leila_bulk'&&a.status==='open');
  const attente=bloc&&Array.isArray(bloc.fights)?bloc.fights:[];
  const out=[];
  for(let i=0;i<taille;i++){
    if(i<poses.length) out.push({etat:'valide',fight:poses[i]});
    else if(i-poses.length<attente.length) out.push({etat:'avalider',fight:attente[i-poses.length],idxBloc:i-poses.length});
    else out.push({etat:'atrouver',fight:null});
  }
  return {slots:out,bloc:bloc||null};
}

function mgmtPrelimsLigne(m,s,i,choisi){
  const f=s.fight, fa=f&&mgmtFighterById(m,f.a), fb=f&&mgmtFighterById(m,f.b);
  const nom=`PRÉLIM ${i+1}`;
  const etat=s.etat==='valide'?MF_SVG_CONFIRME:(s.etat==='avalider'?'<div class="mf-eff-q" aria-hidden="true">?</div>':'');
  const corps=f&&fa&&fb
    ?`<div class="mf-car-slot-t"><span>${esc(nom)}</span><em>${esc(mgmtCarteCourt(fa.div))}</em></div>`
      +`<div class="mf-car-slot-n"><b>${esc(mfNet(fa.last||fa.name))}</b><span>contre</span><b>${esc(mfNet(fb.last||fb.name))}</b></div>`
    :`<div class="mf-car-slot-t"><span>${esc(nom)}</span></div><div class="mf-car-slot-v">À trouver</div>`;
  return `<button type="button" class="mf-car-slot mf-pre-slot ${s.etat}${choisi?' choisi':''}" onclick="CL.mgmtPrelimsVa(${i})"><div class="mf-car-num">${i+1}</div><div class="mf-car-slot-c">${corps}</div>`
    +`<div class="mf-car-slot-s">${etat}</div></button>`;
}

function scr_mgmt_prelims(){
  if(!G||!G.mgmt) return scr_mgmt_bureau();
  const m=G.mgmt, P=MGMT_PRELIMS, {slots,bloc}=mgmtPrelimsEmplacements(m);
  if(!Number.isSafeInteger(P.i)||P.i<0||P.i>=slots.length) P.i=0;
  const s=slots[P.i], f=s.fight;
  const lignes=slots.map((x,i)=>mgmtPrelimsLigne(m,x,i,i===P.i)).join('');
  const legende=`<div class="mf-car-legende"><span>${MF_SVG_CONFIRME}Validé</span><span><i class="mf-eff-q">?</i>À valider</span><span>À trouver</span></div>`;
  const gauche=mfPanneau(`<div class="mf-car-t">LA CARTE DE LEÏLA</div><div class="mf-car-slots mf-pre-slots">${lignes}</div>${legende}`,'normal','mf-car-g');

  const fa=f&&mgmtFighterById(m,f.a), fb=f&&mgmtFighterById(m,f.b);
  const duo=!!(fa&&fb), ca=mgmtCarteColonne(m,fa), cb=mgmtCarteColonne(m,fb);
  const comp=duo
    ?mgmtCarteLigneComp(esc(ca.rang),esc(cb.rang),'Classement')+mgmtCarteLigneComp(esc(ca.bilan),esc(cb.bilan),'Palmarès')
      +mgmtCarteLigneComp(esc(ca.allonge),esc(cb.allonge),'Allonge')+mgmtCarteLigneComp(esc(ca.style),esc(cb.style),'Style')
      +mgmtCarteLigneComp(ca.forme,cb.forme,'3 derniers combats')+mgmtCarteLigneComp('<b>—</b>','<b>—</b>','Contrat restant')
    :`<div class="mf-car-aide">${esc(m.card.main.length<(m.card.sizeMain||MGMT_MAIN_SIZE)?'Leïla prépare les préliminaires quand la carte principale est complète.':'Ce préliminaire n’est pas encore trouvé.')}</div>`;
  const boutons=`<div class="mf-car-boutons">`
    +(bloc?mfBouton('Valider la carte',{touche:'Entrée',jaune:true,onclick:'CL.mgmtPrelimsValider()'}):'')
    +(bloc&&s.etat==='avalider'?mfBouton('Changer',{touche:'C',onclick:'CL.mgmtPrelimsChanger()'}):'')
    +(bloc?mfBouton('Refaire',{touche:'R',onclick:'CL.mgmtPrelimsRefaire()'}):'')+`</div>`;
  const banniere=mgmtCarteBanniere(fa,fb,fa?fa.div:(allDivisions()[0]||{}).id);
  const centre=`<div class="mf-car-c">${banniere}${mfPanneau(`<div class="mf-car-comp-l">${comp}</div>${boutons}`,'normal','mf-car-cmp')}</div>`;

  const sM=Number.isSafeInteger(m.card.sizeMain)?m.card.sizeMain:MGMT_MAIN_SIZE, nM=m.card.main.length, manque=Math.max(0,sM-nM);
  const ex=MGMT_EXCHANGES.leila_bulk, parole=bloc&&ex&&ex.lines&&ex.lines[0]?mfVoix('Leïla',ex.lines[0]):'';
  const alerte=bloc&&(bloc.fights||[]).some(x=>x.warned)&&ex&&typeof ex.warning==='string'?mfVoix('Leïla',ex.warning):'';
  const droite=mfPanneau(`<div class="mf-car-t" style="font-size:22px;letter-spacing:.04em;color:var(--mf-texte2)">CARTE PRINCIPALE</div>`
    +`<div class="mf-pre-compte">${nM} / ${sM}</div>`
    +(manque?`<div class="mf-pre-manque"><i class="mf-pastille-j"></i>Manque : ${manque} combat${manque>1?'s':''}</div>`:'')
    +mfBouton('Ouvrir la carte',{onclick:"CL.go('mgmt_carte')",classe:'mf-pre-ouvrir'})
    +`<div class="mf-pre-voix">${parole}${alerte}</div>`
    +mfBouton('Ses autres affaires',{onclick:"CL.go('mgmt_bureau')",classe:'mf-car-cat'}),'normal','mf-car-d');
  const contenu=`<main class="mf-contenu mf-carte">${gauche}${centre}${droite}</main>`;
  return mfEcran(contenu,{barre:'jeu',courant:'preliminaires',m,plaque:'Préliminaires',libelle:`${slots.filter(x=>x.etat==='valide').length} / ${slots.length}`,
    droite:`${mgmtOrgNom(m)} Fight Night ${(m.eventsPlayed||0)+1}`,
    touches:[{ks:['Échap'],t:'Retour',onclick:"CL.go('mgmt_bureau')"},{ks:['↑','↓'],t:'Choisir'},{ks:['A','E'],t:'Section'},
      {ks:['C'],t:'Changer',onclick:'CL.mgmtPrelimsChanger()'},{ks:['R'],t:'Refaire',onclick:'CL.mgmtPrelimsRefaire()'},
      {ks:['Entrée'],t:'Valider la carte',jaune:true,onclick:'CL.mgmtPrelimsValider()'}]});
}
SCREENS.mgmt_prelims=scr_mgmt_prelims;

function mgmtPrelimsReponse(action){
  const m=G.mgmt, {bloc}=mgmtPrelimsEmplacements(m); if(!bloc) return null;
  const ex=MGMT_EXCHANGES[bloc.exchange], rep=ex&&(ex.replies||[]).find(r=>r.action===action);
  return rep?{id:bloc.id,rep:rep.id}:null;
}
Object.assign(CL,{
  mgmtPrelimsVa(i){ if(Number.isSafeInteger(i)&&i>=0){ MGMT_PRELIMS.i=i; render(); } },
  mgmtPrelimsBouge(d){ const n=mgmtPrelimsEmplacements(G.mgmt).slots.length; MGMT_PRELIMS.i=((MGMT_PRELIMS.i||0)+d+n)%n; render(); },
  mgmtPrelimsValider(){ const r=mgmtPrelimsReponse('validate'); if(r) CL.mgmtReply(r.id,r.rep); },
  /** Marque le combat choisi (s'il est « à valider ») puis l'échange. */
  mgmtPrelimsChanger(){
    const {slots,bloc}=mgmtPrelimsEmplacements(G.mgmt), s=slots[MGMT_PRELIMS.i||0];
    if(!bloc||!s||s.etat!=='avalider') return;
    bloc.marked=s.idxBloc; const r=mgmtPrelimsReponse('swap'); if(r) CL.mgmtReply(r.id,r.rep);
  },
  mgmtPrelimsRefaire(){ const r=mgmtPrelimsReponse('crush'); if(r) CL.mgmtReply(r.id,r.rep); },
});
keysRegister('mgmt_prelims',{
  ArrowUp(){ CL.mgmtPrelimsBouge(-1); },
  ArrowDown(){ CL.mgmtPrelimsBouge(1); },
  Enter(){ CL.mgmtPrelimsValider(); },
  c(){ CL.mgmtPrelimsChanger(); },
  C(){ CL.mgmtPrelimsChanger(); },
  r(){ CL.mgmtPrelimsRefaire(); },
  R(){ CL.mgmtPrelimsRefaire(); },
  Escape(){ CL.go('mgmt_bureau'); },
});
/* ==== [FIN ANCRE] ==== */
