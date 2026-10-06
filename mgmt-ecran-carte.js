"use strict";
/* ==== [ANCRE: MGMT_LOT2_ECRAN_CARTE] — Lot 2 T2 : l'écran de composition de
   la carte principale (docs/LOT-2-CARTE-PRINCIPALE.md §T2, geste LOT-3B §2).
   Lot 4 T3 (docs/LOT-4-LA-PEAU-DU-JEU.md §3 T3) : la mise en page prend la
   forme de la maquette 04 (maquettes/04-booker-un-combat.html) — le
   face-à-face des deux fiches avec l'octogone entre elles au premier choix
   posé, la carte principale et la liste des adversaires en dessous,
   séparées par un filet. AUCUNE règle de composition ne change :
   mgmt-carte.js n'est pas touché, mêmes gardes (mgmtSelectable,
   mgmtBookMain), mêmes données factuelles (charte R1), ni note, ni barème,
   ni jauge (addendum 2 §6). Aucun texte de maquette en jeu (§1) : seuls les
   noms, bilans, catégories, rangs et libellés d'interface du jeu.
   Deux vitesses (addendum 2 §5) : niveau 1 immédiat (le face-à-face, la
   carte et la liste), niveau 2 dans la fiche du combattant.
   Réserve 2 (lot 2 §4 bis) : une ligne non choisissable (suspendue, déjà en
   carte) ne s'allume ni au survol ni au curseur clavier comme une ligne
   choisissable — classes mgmt-off / mgmt-offcur, règles CSS posées sous
   [ANCRE: MGMT_LOT4_T3_BOOKER] dans index.html. Réserve 3 : à 1920, la
   place en plus va à la carte autant qu'à la liste (pistes 1fr et 1fr).
   Souris d'abord, clavier en accélérateur (ui-11-keys.js : l'enregistrement
   mgmt_carte vit dans mgmt-screens.js, inchangé) ; esc() sur tout nom
   affiché. L'état de composition (curseur, premier choix) est une trace de
   rendu, comme _lastRenderedScreen (ui-08) : jamais persistée. ==== */
const MGMT_CART_LABELS={open:'Carte principale',leave:'← Retour au bureau',
  place:'Place libre',remove:'Retirer',
  hint:'Choisissez un combattant, puis son adversaire.',
  complete:'Carte principale complète.',
  empty:'Aucun adversaire disponible dans la catégorie.',
  card:'Carte principale',list:'Combattants',dossier:'Dossier',prelims:'Préliminaires'};
let MGMT_CART={cursor:0,pick:null};

function mgmtCartReset(){ MGMT_CART={cursor:0,pick:null}; }

/* ==== [ANCRE: MGMT_DIVISION_FEMININ] — décision d'Anthony du 28/09/2026 :
   dans le management, une catégorie féminine s'affiche « Poids mouche
   féminin », « Poids paille féminin », etc. — les divisions F d'engine.js
   portent le même nom que les H. Une seule fonction de libellé, dérivée de
   la division À LA LECTURE : rien n'est stocké, les sauvegardes ne changent
   pas, le libellé d'engine.js reste inchangé et la carrière ne l'utilise
   pas. mgmt-ecran-semaine.js (autre session) n'a rien à convertir
   aujourd'hui — il n'affiche aucune catégorie en direct, il passe par
   mgmtLineCard/mgmtAffairSubject/mgmtBulkSubject (mgmt-screens.js, déjà
   convertis) ; s'il en affiche une un jour, il appelle mgmtDivisionLabel
   avec l'identifiant ou l'objet division. ==== */
function mgmtDivisionLabel(div){
  const d=(typeof div==='string')?divById(div):div;
  if(!d||!d.name) return '';
  return d.gender==='F' ? d.name+' féminin' : d.name;
}
/* ==== [FIN ANCRE] ==== */

/** Rang accordé à la catégorie : 1ᵉʳ mondial / 1ʳᵉ mondiale / 2ᵉ. */
function mgmtRankLabel(rank,div){
  if(rank===1) return div&&divById(typeof div==='string'?div:div.div||div.id)?.gender==='F'?'1ʳᵉ':'1ᵉʳ';
  return Number.isSafeInteger(rank)&&rank>1?`${rank}ᵉ`:'';
}

/** Une ligne de la liste des adversaires (maquette 04 : l'aside « Autres
 *  adversaires ») : nom, bilan, catégorie de poids, rang dérivé — toujours
 *  visibles, à 13px et 4,5:1 minimum (charte L2 : le rang du suspendu doit
 *  rester lisible, aucune atténuation). Sélectionnable : cliquable (premier
 *  choix, adversaire, annulation au re-clic), classe mgmt-can.
 *  Non choisissable : classe mgmt-off, muette au clic — réserve 2 du lot 2 :
 *  ni le survol ni le curseur clavier ne l'allument comme une ligne
 *  choisissable (mgmt-offcur : filet pointillé, jamais l'accent or).
 *  Le mot porte le refus (« suspendu », « en carte »), jamais une grisaille. */
function mgmtCartRowHtml(m,f,i,state){
  const rank=mgmtDivisionRank(m,f);
  const rk=mgmtRankLabel(rank,f.div);
  const susp=!mgmtAvailable(m,f);
  const engaged=mgmtEngaged(m,f);
  const status=susp?'suspendu':(engaged?'en carte':'');
  const sel=mgmtSelectable(m,f,state.pick);
  const isPick=state.pick===f.id;
  const isCur=i===state.cursor;
  const cls=['opp','mgmt-aff','mgmt-book-row'];
  if(isPick) cls.push('sel');
  if(!sel) cls.push('mgmt-off'); else cls.push('mgmt-can');
  if(isCur&&!isPick) cls.push(sel?'mgmt-cur':'mgmt-offcur');
  const style=sel?'':' style="cursor:default"';
  const open=sel?` onclick="CL.mgmtPick('${f.id}')"`:'';
  const meta=`${mgmtDivisionLabel(f.div)} · ${rk}${status?' · '+status:''}`;
  return `<div class="${cls.join(' ')}"${style}${open}>`
    +`<div class="opp-top"><span class="opp-nm">${esc(f.name)}</span><span class="opp-rec">${esc(f.W)}-${esc(f.L)}-${esc(f.D)}</span></div>`
    +`<div class="mgmt-book-sub">${esc(meta)}</div>`
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
  const meta=(fa&&fb)?`${mgmtDivisionLabel(fa.div)} · ${rec(fa)} contre ${rec(fb)}`:'';
  /* Lot 5 T1 : geste validé dans maquettes/04b-combat-de-titre.html le
     02/10/2026. R4 : pas d'option grisée pour une paire sans titre possible.
     S6 : libellé de rounds et case mis à jour dès le choix. */
  const rounds=mgmtBoutRounds(m,f);
  const title=f.title===true||mgmtCanTitle(m,f)
    ?`<label class="mgmt-title-choice" for="mgmt-title-${i}">`
      +`<input id="mgmt-title-${i}" type="checkbox"${f.title===true?' checked':''}`
      +` onchange="CL.mgmtTitle(${i},this.checked)">Pour le titre · 5 rounds</label>`:'';
  return `<div class="opp mgmt-fight" style="cursor:default">`
    +`<span class="opp-nm">${esc(fa?fa.name:'?')} contre ${esc(fb?fb.name:'?')}</span>`
    +`<div style="font-size:13px;color:var(--muted);margin-top:2px">${esc(meta)} · ${i===0?'Combat principal · ':''}${esc(rounds)} rounds</div>`
    +title
    +`<button class="mgmt-next" style="display:inline-block;width:auto;padding:6px 12px;margin:8px 0 0;font-size:13px" onclick="CL.mgmtUnbook(${i})">${esc(MGMT_CART_LABELS.remove)}</button>`
    +`</div>`;
}

/** Le dossier d'un combattant, lecture seule (utilisé par la fiche,
 *  mgmt-ecran-fiche.js) : nom, bilan, catégorie, rang, âge — données
 *  factuelles (charte R1). Sans le libellé de niveau (« Nom » — jargon
 *  interne, charte S7, relevé du 15/09). */
function mgmtCartFicheHtml(m,f,ouvrir=true){
  if(!f) return '';
  const rank=mgmtDivisionRank(m,f);
  const meta=`${mgmtDivisionLabel(f.div)} · ${mgmtRankLabel(rank,f.div)} · ${f.age} ans`;
  return `<div class="opp" style="cursor:default">`
    +`<div class="opp-top"><span class="mgmt-fname">${esc(f.name)}</span><span class="opp-rec">${esc(f.W)}-${esc(f.L)}-${esc(f.D)}</span></div>`
     +`<div style="font-size:13px;color:var(--muted);margin-top:4px">${esc(meta)}</div>`
     +(ouvrir?`<button class="mgmt-next" style="width:auto;padding:6px 12px;margin:8px 0 0;font-size:13px" onclick="CL.mgmtFicheParIndex(${m.roster.indexOf(f)})">Voir la fiche</button>`:'')
     +`</div>`;
}

/** La fiche du face-à-face (maquette 04) : nom en énorme, coupé prénom /
 *  nom comme la maquette, ligne factuelle en dessous — bilan, catégorie,
 *  rang, âge. Côté gauche : l'or (couleur principale) ; côté droit :
 *  l'adversaire, nom à l'écarlate (direction artistique : le rouge est
 *  réservé au danger et à l'adversaire — grande taille, 3:1 suffisent,
 *  charte L2) et ligne factuelle à l'encre, jamais en rouge (4,5:1
 *  exigé à cette taille). side='b' inverse l'ordre des données, comme la
 *  maquette inverse sa ligne. */
function mgmtBookFighterHtml(m,f,side){
  if(!f) return '';
  const rank=mgmtDivisionRank(m,f);
  const bits=[`${f.W}-${f.L}-${f.D}`,mgmtDivisionLabel(f.div),mgmtRankLabel(rank,f.div),`${f.age} ans`].filter(Boolean);
  if(side==='b') bits.reverse();
  const nm=(typeof f.first==='string'&&typeof f.last==='string')
    ?esc(f.first)+'<br>'+esc(f.last):esc(f.name);
  return `<div class="mgmt-book-fighter mgmt-book-${side==='b'?'b':'a'}">`
    +`<div class="mgmt-book-nm">${nm}</div>`
    +`<div class="mgmt-book-meta">${esc(bits.join(' · '))}</div>`
    +`<button class="mgmt-next" style="width:auto;padding:6px 12px;margin:10px 0 0;font-size:13px" onclick="CL.mgmtFicheParIndex(${m.roster.indexOf(f)})">Voir la fiche</button>`
    +`</div>`;
}

/** L'octogone et le VS entre les deux fiches (maquette 04) : décor, aria-hidden. */
function mgmtBookVsHtml(){
  return `<div class="mgmt-book-vs" aria-hidden="true">`
    +`<svg viewBox="0 0 220 220" focusable="false">`
    +`<polygon points="68,8 152,8 212,68 212,152 152,212 68,212 8,152 8,68" class="mgmt-oct-1"/>`
    +`<polygon points="78,32 142,32 188,78 188,142 142,188 78,188 32,142 32,78" class="mgmt-oct-2"/>`
    +`</svg><div class="mgmt-book-vsglyph">VS</div></div>`;
}

/** Un combat de préliminaires, lisible seul : Leïla les propose (T3) —
 *  ici, lecture seule. */
function mgmtCartPrelimHtml(m,f){
  const fa=mgmtFighterById(m,f.a), fb=mgmtFighterById(m,f.b);
  const rec=x=>`${x.W}-${x.L}-${x.D}`;
  const meta=(fa&&fb)?`${mgmtDivisionLabel(fa.div)} · ${rec(fa)} contre ${rec(fb)}`:'';
  return `<div class="opp mgmt-fight" style="cursor:default">`
    +`<span class="opp-nm">${esc(fa?fa.name:'?')} contre ${esc(fb?fb.name:'?')}</span>`
    +`<div style="font-size:13px;color:var(--muted);margin-top:2px">${esc(meta)}</div>`
    +`</div>`;
}

/** L'écran de composition (maquette 04). En tête : le face-à-face — le
 *  dossier de la ligne visée, et dès qu'un premier choix est posé les deux
 *  fiches et l'octogone « VS » (le pointé est l'adversaire que le geste
 *  pose). En dessous, séparés par le filet de la maquette : la carte
 *  principale (cinq emplacements) et les préliminaires de Leïla à gauche,
 *  la liste des adversaires à droite — filtrée sur la catégorie du premier
 *  choix. À 1920, la place en plus se partage entre les deux (réserve 3). */
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

  /* Le face-à-face. Duo seulement quand un adversaire réel est visé :
     l'octogone et le VS n'existent pas pour un combat qui n'existe pas
     (§1 : un bloc vide n'apparaît pas). */
  const oppF=(pickF&&shown[cur]&&shown[cur].id!==pickF.id)?shown[cur]:null;
  const showF=pickF||shown[cur]||null;
  const versaHtml=(pickF&&oppF)
    ?`<div class="mgmt-book-versa mgmt-book-duo">`
      +mgmtBookFighterHtml(m,pickF,'a')+mgmtBookVsHtml()+mgmtBookFighterHtml(m,oppF,'b')
      +`</div>`
    :`<div class="mgmt-book-versa mgmt-book-solo">`
      +`<div class="eyebrow">${esc(MGMT_CART_LABELS.dossier)}</div>`
      +mgmtBookFighterHtml(m,showF,'a')+`</div>`;

  /* Colonne gauche — la carte principale : les cinq emplacements, puis les
     préliminaires de Leïla en lecture seule. */
  const sizeMain=(Number.isSafeInteger(m.card.sizeMain)&&m.card.sizeMain>0)?m.card.sizeMain:MGMT_MAIN_SIZE;
  let cardHtml='';
  for(let i=0;i<sizeMain;i++){
    cardHtml+=mgmtCartSlotHtml(m,i,Array.isArray(m.card.main)?m.card.main[i]:null);
  }
  const sizePrelim=(Number.isSafeInteger(m.card.sizePrelims)&&m.card.sizePrelims>0)?m.card.sizePrelims:MGMT_PRELIM_SIZE;
  const prelims=Array.isArray(m.card.prelims)?m.card.prelims:[];
  const prelimHtml=prelims.map(f=>mgmtCartPrelimHtml(m,f)).join('');

  /* Colonne droite — la liste des adversaires (maquette 04 : « autres
     adversaires »), groupée par catégorie, filtrée sur la catégorie du
     premier choix quand il est posé. */
  let listHtml='';
  if(shown.length===0){
    listHtml=`<div class="mgmt-book-sub">${esc(MGMT_CART_LABELS.empty)}</div>`;
  }else{
    let lastDiv=null;
    shown.forEach((f,i)=>{
      if(f.div!==lastDiv){ listHtml+=`<div class="eyebrow mt">${esc(mgmtDivisionLabel(f.div))}</div>`; lastDiv=f.div; }
      listHtml+=mgmtCartRowHtml(m,f,i,state);
    });
  }
  const listHead=esc(pickF?`Autres adversaires — ${mgmtDivisionLabel(pickF.div)}`:MGMT_CART_LABELS.list);
  const hint=(pickF&&shown.every(f=>f.id!==pickF.id&&!mgmtSelectable(m,f,MGMT_CART.pick)))
    ?esc(MGMT_CART_LABELS.empty)
    :(full?esc(MGMT_CART_LABELS.complete):(pickF?'':esc(MGMT_CART_LABELS.hint)));
  const hintHtml=hint?`<div class="mgmt-book-sub" style="margin:4px 0 8px">${hint}</div>`:'';

  return `<div class="scr mgmt-wrap mgmt-book"><div class="mgmt-head bar">`
    +`<div><div class="eyebrow gold">${esc(mgmtOrgNom(m))} — Management</div>`
    +`<h2 class="disp">La carte</h2></div></div>`
    +`<div class="mono mgmt-cycle">Cycle ${esc(m.cycle)} — ${esc(mgmtCardLabel(m))}</div>`
    +`<div class="mgmt-book-actions"><button class="btn ghost mgmt-book-return" onclick="CL.mgmtCarteLeave()">${esc(MGMT_CART_LABELS.leave)}</button></div>`
    +(typeof mgmtPropositionHtml==='function'?mgmtPropositionHtml(m):'')
    +versaHtml
    +`<div class="mgmt-book-cols">`
    +`<section class="mgmt-book-pane mgmt-book-card"><div class="eyebrow">${esc(MGMT_CART_LABELS.card)}</div>${cardHtml}`
    +`<div class="eyebrow mt">${esc(MGMT_CART_LABELS.prelims)}</div>`
    +`<div class="mgmt-book-sub" style="margin:4px 0 8px">${esc(prelims.length+'/'+sizePrelim)}</div>${prelimHtml}`
    +(pickF&&oppF&&mgmtSelectable(m,oppF,pickF.id)&&!full
      ?`<button class="mgmt-book-confirm" onclick="CL.mgmtPick('${escJsAttr(oppF.id)}')">Booker</button>`:'')+`</section>`
    +`<aside class="mgmt-book-pane mgmt-book-list"><div class="eyebrow">${listHead}</div>${hintHtml}${listHtml}</aside>`
    +`</div></div>`;
}
/* ==== [FIN ANCRE] ==== */
