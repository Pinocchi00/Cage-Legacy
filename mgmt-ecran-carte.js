"use strict";
/* ==== [ANCRE: MGMT_LOT2_ECRAN_CARTE] — Lot 2 T2 : l'écran de composition de
   la carte principale (docs/LOT-2-CARTE-PRINCIPALE.md §T2, geste LOT-3B §2).
   Trois colonnes (charte §L1), habillage du management actuel — les
   maquettes arrivent au lot 4, seule la structure est neuve.
   Deux vitesses (addendum 2 §5) : niveau 1 immédiat (la carte et la liste),
   niveau 2 dans le dossier de la ligne visée — un seul déroulé à la fois.
   Aucune note, aucun barème, aucune jauge (addendum 2 §6) : la liste ne
   montre que la catégorie de poids, le rang dérivé (mgmtDivisionRank, T1)
   et le bilan — données factuelles (charte R1), jamais une recommandation.
   Souris d'abord, clavier en accélérateur (ui-11-keys.js) ; esc() sur tout
   nom affiché. L'état de composition (curseur, premier choix) est une
   trace de rendu, comme _lastRenderedScreen (ui-08) : jamais persistée. ==== */
const MGMT_CART_LABELS={open:'Carte principale',leave:'← Retour au bureau',
  place:'Place libre',remove:'Retirer',
  hint:'Choisissez un combattant, puis son adversaire.',
  complete:'Carte principale complète.',
  empty:'Aucun adversaire disponible dans la catégorie.',
  card:'Carte principale',list:'Combattants',dossier:'Dossier',prelims:'Préliminaires'};
let MGMT_CART={cursor:0,pick:null};

function mgmtCartReset(){ MGMT_CART={cursor:0,pick:null}; }

/** Libellé d'un rang : « 1ʳᵉ », « 2ᵉ »… Vide sans rang. */
function mgmtRankLabel(rank){
  if(rank===1) return '1ʳᵉ';
  return Number.isSafeInteger(rank)&&rank>1?`${rank}ᵉ`:'';
}

/** Une ligne de la liste des combattants (§T2) : nom, bilan, catégorie de
 *  poids, rang dérivé — toujours visibles, à 13px et 4,5:1 minimum (charte
 *  L2 : le rang du suspendu doit rester lisible, aucune atténuation).
 *  Sélectionnable : cliquable (premier choix, adversaire, annulation au
 *  re-clic) ; suspendu et engagé : non cliquables, dits en toutes lettres —
 *  c'est le mot qui porte le refus, jamais une grisaille. Curseur : bord
 *  atténué, le même accent or que la sélection — aucune règle CSS neuve. */
function mgmtCartRowHtml(m,f,i,state){
  const rank=mgmtDivisionRank(m,f);
  const rk=mgmtRankLabel(rank);
  const susp=!mgmtAvailable(m,f);
  const engaged=mgmtEngaged(m,f);
  const status=susp?'suspendu':(engaged?'en carte':'');
  const sel=mgmtSelectable(m,f,state.pick);
  const isPick=state.pick===f.id;
  const isCur=i===state.cursor;
  const parts=[];
  if(isCur&&!isPick) parts.push('border-color:var(--gold-d)');
  if(!sel) parts.push('cursor:default');
  const style=parts.length>0?` style="${parts.join(';')}"`:'';
  const open=sel?` onclick="CL.mgmtPick('${f.id}')"`:'';
  const meta=`${f.divName} · ${rk}${status?' · '+status:''}`;
  return `<div class="opp mgmt-aff${isPick?' sel':''}"${style}${open}>`
    +`<div class="opp-top"><span class="opp-nm">${esc(f.name)}</span><span class="opp-rec">${esc(f.W)}-${esc(f.L)}-${esc(f.D)}</span></div>`
    +`<div style="font-size:13px;color:var(--muted);margin-top:2px">${esc(meta)}</div>`
    +`</div>`;
}

/** Un emplacement de la carte principale : le combat posé, ou la place
 *  libre (pointillés, maquette 02 : « PLACE LIBRE »). Le combat posé peut
 *  être retiré. */
function mgmtCartSlotHtml(m,i,f){
  if(!f){
    return `<div class="mgmt-next" style="border-style:dashed;margin:10px 0;cursor:default">${esc(MGMT_CART_LABELS.place)}</div>`;
  }
  const fa=mgmtFighterById(m,f.a), fb=mgmtFighterById(m,f.b);
  const rec=x=>`${x.W}-${x.L}-${x.D}`;
  const meta=(fa&&fb)?`${fa.divName} · ${rec(fa)} contre ${rec(fb)}`:'';
  return `<div class="opp mgmt-fight" style="cursor:default">`
    +`<span class="opp-nm">${esc(fa?fa.name:'?')} contre ${esc(fb?fb.name:'?')}</span>`
    +`<div style="font-size:13px;color:var(--muted);margin-top:2px">${esc(meta)}</div>`
    +`<button class="mgmt-next" style="display:inline-block;width:auto;padding:6px 12px;margin:8px 0 0;font-size:13px" onclick="CL.mgmtUnbook(${i})">${esc(MGMT_CART_LABELS.remove)}</button>`
    +`</div>`;
}

/** Le dossier d'une ligne (niveau 2, un seul déroulé) : nom, bilan,
 *  catégorie, rang, âge — données factuelles (charte R1). Sans le libellé
 *  de niveau (« Nom » — jargon interne, charte S7, relevé du 15/09). */
function mgmtCartFicheHtml(m,f,ouvrir=true){
  if(!f) return '';
  const rank=mgmtDivisionRank(m,f);
  const meta=`${f.divName} · ${mgmtRankLabel(rank)} · ${f.age} ans`;
  return `<div class="opp" style="cursor:default">`
    +`<div class="opp-top"><span class="mgmt-fname">${esc(f.name)}</span><span class="opp-rec">${esc(f.W)}-${esc(f.L)}-${esc(f.D)}</span></div>`
     +`<div style="font-size:13px;color:var(--muted);margin-top:4px">${esc(meta)}</div>`
     +(ouvrir?`<button class="mgmt-next" style="width:auto;padding:6px 12px;margin:8px 0 0;font-size:13px" onclick="CL.mgmtFicheParIndex(${m.roster.indexOf(f)})">Voir la fiche</button>`:'')
     +`</div>`;
}

/** Un combat de préliminaires, lisible seul : Leïla les propose (T3) —
 *  ici, lecture seule. */
function mgmtCartPrelimHtml(m,f){
  const fa=mgmtFighterById(m,f.a), fb=mgmtFighterById(m,f.b);
  const rec=x=>`${x.W}-${x.L}-${x.D}`;
  const meta=(fa&&fb)?`${fa.divName} · ${rec(fa)} contre ${rec(fb)}`:'';
  return `<div class="opp mgmt-fight" style="cursor:default">`
    +`<span class="opp-nm">${esc(fa?fa.name:'?')} contre ${esc(fb?fb.name:'?')}</span>`
    +`<div style="font-size:13px;color:var(--muted);margin-top:2px">${esc(meta)}</div>`
    +`</div>`;
}

/** L'écran de composition. Trois colonnes : la carte principale (cinq
 *  emplacements), la liste des combattants (groupée par catégorie, rangs
 *  dérivés), le dossier de la ligne visée et les préliminaires de Leïla en
 *  lecture seule. */
function scr_mgmt_carte(){
  if(!G||!G.mgmt) return scr_mgmt_bureau();
  const m=G.mgmt;
  const all=mgmtCartRows(m);
  /* Un premier choix qui n'est plus sélectionnable (mutation entre deux
     rendus) est effacé : la trace ne ment jamais. */
  if(MGMT_CART.pick){
    const pf=mgmtFighterById(m,MGMT_CART.pick);
    if(!pf||!mgmtSelectable(m,pf,null)) MGMT_CART.pick=null;
  }
  const pickF=MGMT_CART.pick?mgmtFighterById(m,MGMT_CART.pick):null;
  const shown=pickF?all.filter(f=>f.div===pickF.div):all;
  const cur=clamp(MGMT_CART.cursor,0,Math.max(0,shown.length-1));
  MGMT_CART.cursor=cur;
  const state={cursor:cur,pick:MGMT_CART.pick};
  const full=Number.isSafeInteger(m.card.sizeMain)&&Array.isArray(m.card.main)&&m.card.main.length>=m.card.sizeMain;

  /* Colonne 1 — la carte principale : les cinq emplacements, posés d'abord. */
  const sizeMain=(Number.isSafeInteger(m.card.sizeMain)&&m.card.sizeMain>0)?m.card.sizeMain:MGMT_MAIN_SIZE;
  let cardHtml='';
  for(let i=0;i<sizeMain;i++){
    cardHtml+=mgmtCartSlotHtml(m,i,Array.isArray(m.card.main)?m.card.main[i]:null);
  }

  /* Colonne 2 — la liste : groupée par catégorie (rangs dérivés au sein de
     chacune), filtrée sur la catégorie du premier choix quand il est posé. */
  let listHtml='';
  if(shown.length===0){
    listHtml=`<div style="font-size:13px;color:var(--muted)">${esc(MGMT_CART_LABELS.empty)}</div>`;
  }else{
    let lastDiv=null;
    shown.forEach((f,i)=>{
      if(f.div!==lastDiv){ listHtml+=`<div class="eyebrow mt">${esc(f.divName)}</div>`; lastDiv=f.div; }
      listHtml+=mgmtCartRowHtml(m,f,i,state);
    });
  }
  const listHead=esc(pickF?`Adversaires — ${pickF.divName}`:MGMT_CART_LABELS.list);
  const hint=(pickF&&shown.every(f=>f.id!==pickF.id&&!mgmtSelectable(m,f,MGMT_CART.pick)))
    ?esc(MGMT_CART_LABELS.empty)
    :(full?esc(MGMT_CART_LABELS.complete):(pickF?'':esc(MGMT_CART_LABELS.hint)));
  const hintHtml=hint?`<div style="font-size:13px;color:var(--muted);margin:4px 0 8px">${hint}</div>`:'';

  /* Colonne 3 — le dossier (le choisi, sinon la ligne visée) et les
     préliminaires de Leïla en lecture seule. */
  const showF=pickF||shown[cur]||null;
  const sizePrelim=(Number.isSafeInteger(m.card.sizePrelims)&&m.card.sizePrelims>0)?m.card.sizePrelims:MGMT_PRELIM_SIZE;
  const prelims=Array.isArray(m.card.prelims)?m.card.prelims:[];
  const prelimHtml=prelims.map(f=>mgmtCartPrelimHtml(m,f)).join('');

  return `<div class="scr mgmt-wrap"><div class="mgmt-head bar">`
    +`<div><div class="eyebrow gold">Split — Management</div>`
    +`<h2 class="disp">La carte</h2></div>`
    +`<button class="btn ghost" style="width:auto;padding:10px 16px" onclick="CL.mgmtCarteLeave()">${esc(MGMT_CART_LABELS.leave)}</button></div>`
    +`<div class="mono mgmt-cycle">Cycle ${esc(m.cycle)} — ${esc(mgmtCardLabel(m))}</div>`
    +`<div class="mgmt-cols">`
    +`<div class="mgmt-col"><div class="eyebrow">${esc(MGMT_CART_LABELS.card)}</div>${cardHtml}</div>`
    +`<div class="mgmt-col"><div class="eyebrow">${listHead}</div>${hintHtml}${listHtml}</div>`
    +`<div class="mgmt-col"><div class="eyebrow">${esc(MGMT_CART_LABELS.dossier)}</div>${mgmtCartFicheHtml(m,showF)}`
    +`<div class="eyebrow mt">${esc(MGMT_CART_LABELS.prelims)}</div>`
    +`<div style="font-size:13px;color:var(--muted);margin:4px 0 8px">${esc(prelims.length+'/'+sizePrelim)}</div>${prelimHtml}</div>`
    +`</div></div>`;
}
/* ==== [FIN ANCRE] ==== */
