"use strict";
/* CAGE LEGACY — ui-10-duel.js
   ============================================================================
   LOT DUEL-01 — "Duel entre amis" (Carrière Complète) : écrans (deux
   panneaux MON CODE / CODE DE L'AMI, bandeau de série, récap de manche,
   résultat de série) et branchement CL. Toute la logique déterministe
   (codec, PRNG, moteur de série) vit dans duel-codec.js — ce fichier ne
   fait que l'interface avec G/CL/DOM et REJOUE le combat dans les écrans
   d'arène (scr_arena) et de résultat (scr_result) déjà existants, sans
   jamais en écrire un nouveau.

   N'étend jamais ui-08-controller-arena.js par édition directe : SCREENS et
   CL y sont de simples objets exposés globalement (SCREENS en portée de
   fichier, window.CL), donc étendus ici via Object.assign — chargé après
   ui-08/ui-09, juste avant main.js (voir index.html, ANCRE DUEL_CODEC).

   Exhibition PURE : aucune méthode ci-dessous n'appelle jamais save().
   G.duelActive (posé pendant qu'une manche tourne dans G.f/G.fight, comme
   G.fantasyActive/G.vsFriendActive) fait aussi barrage à tout save()
   déclenché par le code partagé de l'arène/du résultat (state-save.js).
   ============================================================================ */

/* ==== [ANCRE: DUEL_CODEC] — LOT DUEL-01 ==== */

/** Score cumulé (manches/self vs manches/friend) jusqu'à et y compris
 * l'index donné. @param {object} series @param {number} uptoIdx @returns {{self:number,friend:number}} */
function duelCumulativeScore(series,uptoIdx){
  let self=0,friend=0;
  for(let i=0;i<=uptoIdx;i++){
    const w=series.manches[i].winner;
    if(w==='self') self++; else if(w==='friend') friend++;
  }
  return {self,friend};
}

/** Repli navigateur pour la copie (textarea hors-écran + select() +
 * execCommand('copy')) — dernier maillon de la chaîne de partage/copie,
 * jamais utilisé seul. @param {string} text @returns {boolean} */
function duelExecCommandCopy(text){
  try{
    const ta=document.createElement('textarea');
    ta.value=text; ta.setAttribute('readonly','');
    ta.style.position='fixed'; ta.style.top='-9999px'; ta.style.left='-9999px';
    document.body.appendChild(ta); ta.focus(); ta.select();
    const ok=document.execCommand('copy');
    document.body.removeChild(ta);
    return !!ok;
  }catch(e){ return false; }
}
/** Chaîne de repli complète pour "Copier" : clipboard API puis
 * execCommand('copy'), avec confirmation visible à chaque niveau — jamais
 * de message de succès non mérité (cf. CORRECTIF_COPIE_PROMISE, ui-08, même
 * piège avec la Promise de clipboard.writeText). @param {string} code */
function duelCopyFallbackChain(code){
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(code).then(()=>{ G._duelMsg='Code copié !'; render(); })
      .catch(()=>{ G._duelMsg=duelExecCommandCopy(code)?'Code copié !':"Copie automatique impossible — sélectionne le code et copie-le manuellement."; render(); });
    return;
  }
  G._duelMsg=duelExecCommandCopy(code)?'Code copié !':"Copie automatique impossible — sélectionne le code et copie-le manuellement.";
  render();
}

function scr_duelHome(){
  if(!G.f) return `<div class="scr center intro"><p class="lede">Il te faut un combattant actif pour lancer un Duel entre amis.</p><button class="btn ghost mt" onclick="CL.go('hub')">Retour</button></div>`;
  const myCode=encodeDuelCode(G.f)||'';
  const msg=G._duelMsg?`<div class="card mb" style="border-left:3px solid var(--gold);background:var(--panel2)"><span class="small">${esc(G._duelMsg)}</span></div>`:'';
  const err=G._duelError?`<div class="card mb" style="border-left:3px solid var(--loss);background:var(--panel2)"><span class="small" style="color:var(--loss)">${esc(G._duelError)}</span></div>`:'';
  return `<div class="scr">
   <div class="bar" style="border-bottom:1px solid var(--line);padding-bottom:8px;margin-bottom:14px">
     <span class="eyebrow mono">DUEL ENTRE AMIS</span>
     <span class="eyebrow x" onclick="CL.go('hub')">✕</span>
   </div>
   ${msg}${err}
   <p class="lede small">Un combat d’exhibition en trois manches, purement pour l’honneur : aucun impact sur ta carrière, ton bilan ou tes finances.</p>
   <div class="card glass" style="padding:16px;margin-bottom:20px">
     <div class="eyebrow gold mb">Mon code</div>
     <textarea readonly rows="3" onclick="this.select()" style="width:100%;background:var(--panel2);border:1px solid var(--line);color:var(--text);padding:10px;font-family:'JetBrains Mono',monospace;font-size:12px;resize:none">${esc(myCode)}</textarea>
     <div class="g2 mt">
       <button class="btn ghost" style="min-height:44px" onclick="CL.duelShareMyCode()">Partager</button>
       <button class="btn ghost" style="min-height:44px" onclick="CL.duelCopyMyCode()">Copier</button>
     </div>
   </div>
   <div class="card glass" style="padding:16px">
     <div class="eyebrow gold mb">Code de l’ami</div>
     <textarea id="duel_friend_code" rows="3" placeholder="Colle ici le code reçu de ton ami"
       autocapitalize="off" autocorrect="off" spellcheck="false" autocomplete="off"
       style="width:100%;background:var(--panel2);border:1px solid var(--line);color:var(--text);padding:10px;font-family:'JetBrains Mono',monospace;font-size:12px;resize:none"></textarea>
     <button class="btn primary mt" style="font-size:18px;padding:16px;min-height:44px" ${G._duelBusy?'disabled':''} onclick="CL.duelStartSeries()">COMBATTRE</button>
   </div>
  </div>`;
}

function scr_duelManche(){
  const series=G._duelSeries, idx=G._duelMancheIdx;
  if(!series || series.manches[idx]==null) return `<div class="scr center intro"><p class="lede">Duel introuvable.</p><button class="btn ghost mt" onclick="CL.duelEnter()">Retour</button></div>`;
  const m=series.manches[idx];
  const score=duelCumulativeScore(series,idx);
  const plannedTotal=series.decider?3:(score.self>=2||score.friend>=2?2:3);
  const winnerLabel=m.winner==='self'?esc(m.selfFighter.name):m.winner==='friend'?esc(m.friendFighter.name):'Aucun (nul)';
  const methodLabel=isDecisionLike(m.res.method)?m.res.method:`${m.res.method}${m.res.round?` · Round ${m.res.round}`:''}`;
  return `<div class="scr center intro">
   <div class="eyebrow gold">Duel entre amis</div>
   <h2 class="disp">MANCHE ${m.index} / ${plannedTotal} — ${score.self}-${score.friend}</h2>
   <div class="card glass mt" style="padding:16px">
     <div class="disp" style="font-size:20px">${winnerLabel}</div>
     <div class="mono small muted mt">${esc(methodLabel)}</div>
   </div>
   <button class="btn primary mt" style="font-size:18px;padding:16px;min-height:44px" ${G._duelBusy?'disabled':''} onclick="CL.duelNextManche()">MANCHE SUIVANTE</button>
  </div>`;
}

function scr_duelSeriesResult(){
  const series=G._duelSeries;
  if(!series) return `<div class="scr center intro"><p class="lede">Aucun duel en cours.</p><button class="btn ghost mt" onclick="CL.duelEnter()">Retour</button></div>`;
  const winnerName=series.seriesWinner==='self'?esc(series.self.name):esc(series.friend.name);
  const manchesSummary=series.manches.map(m=>{
    const w=m.winner==='self'?esc(series.self.name):m.winner==='friend'?esc(series.friend.name):'Nul';
    return `<div class="mono small" style="padding:4px 0;border-bottom:1px dotted var(--line)">Manche ${m.index} (${m.rounds} rounds) — ${w} · ${esc(m.res.method)}${m.res.round?` R${m.res.round}`:''}</div>`;
  }).join('');
  const closedEarly=series.manches.length===2;
  return `<div class="scr center intro">
   <div class="eyebrow gold">Duel entre amis — Série terminée</div>
   <h2 class="disp">${series.score.self} - ${series.score.friend}</h2>
   <p class="lede small">${winnerName} remporte la série.${series.tieBreak?' Départage sur le fil — voir le détail des manches ci-dessous.':''}</p>
   <div class="card glass mt" style="padding:16px;text-align:left">${manchesSummary}</div>
   <div class="mono small muted mt">${closedEarly?'Série close en deux manches.':'Série disputée jusqu’à la manche décisive (5 rounds).'}</div>
   <button class="btn primary mt" style="font-size:18px;padding:16px;min-height:44px" onclick="CL.duelEnter()">NOUVEAU DUEL</button>
   <button class="btn ghost mt" onclick="CL.go('hub')">Retour au vestiaire</button>
  </div>`;
}
/* ==== [FIN ANCRE] ==== */

Object.assign(SCREENS,{
  duel_home:scr_duelHome,
  duel_manche_result:scr_duelManche,
  duel_series_result:scr_duelSeriesResult
});

/* ==== [ANCRE: DUEL_CODEC] — LOT DUEL-01 : méthodes CL. Ajoutées par
   extension de l'objet existant (jamais d'édition de ui-08) : CL et SCREENS
   y sont déjà entièrement construits au moment où ce fichier s'exécute. ==== */
Object.assign(CL,{
  duelEnter(){
    G._duelBusy=false; G._duelError=null; G._duelMsg=null; G._duelSeries=null; G._duelMancheIdx=0;
    G.screen='duel_home'; render();
  },
  duelShareMyCode(){
    const code=encodeDuelCode(G.f);
    if(!code){ G._duelMsg="Impossible de générer ton code."; render(); return; }
    const text=`Affronte-moi dans Cage Legacy ! Colle ce code dans l’écran Duel entre amis : ${code}`;
    if(navigator.share){
      navigator.share({text}).then(()=>{ G._duelMsg='Partagé !'; render(); })
        .catch(()=>{ duelCopyFallbackChain(code); });
      return;
    }
    duelCopyFallbackChain(code);
  },
  duelCopyMyCode(){
    const code=encodeDuelCode(G.f);
    if(!code){ G._duelMsg="Impossible de générer ton code."; render(); return; }
    duelCopyFallbackChain(code);
  },
  duelStartSeries(){
    if(G._duelBusy) return;
    const el=/** @type {HTMLTextAreaElement|null} */ (document.getElementById('duel_friend_code'));
    const raw=(el&&el.value||'').trim();
    if(!raw){ G._duelError="Colle d’abord le code de ton ami."; render(); return; }
    const myCode=encodeDuelCode(G.f);
    if(!myCode){ G._duelError="Impossible de générer ton propre code — réessaie."; render(); return; }
    const check=decodeDuelCode(raw);
    if(!check.ok){ G._duelError=`Code invalide ou corrompu (${check.reason}).`; render(); return; }
    G._duelBusy=true;
    const series=simulateDuelSeries(myCode,raw);
    if(!series.ok){ G._duelBusy=false; G._duelError=`Impossible de lancer le duel : ${series.reason}`; render(); return; }
    G._duelError=null; G._duelSeries=series;
    G._duelSavedF=G.f; G._duelSavedFight=G.fight;
    CL.duelPlayManche(0);
  },
  duelPlayManche(idx){
    const series=G._duelSeries;
    if(!series || !series.manches[idx]){ CL.duelEnter(); return; }
    const m=series.manches[idx];
    G._duelMancheIdx=idx;
    G.f=m.selfFighter;
    G.fight={kind:'duel',opp:m.friendFighter,rounds:m.rounds};
    G.pending={
      res:m.res, win:m.winner==='self', method:m.res.method,
      finish:!isDecisionLike(m.res.method),
      opp:{name:m.friendFighter.name,flag:m.friendFighter.flag},
      isDuel:true, mancheIndex:m.index, totalManches:series.manches.length
    };
    G.duelActive=true;
    buildTimeline(); G.screen='arena'; render();
  },
  duelNextManche(){
    if(G._duelBusy) return;
    G._duelBusy=true;
    CL.duelPlayManche((G._duelMancheIdx||0)+1);
  },
  /** Branche duel de l'écran de résultat partagé (scr_result) : avance à la
   * manche suivante, ou clôt la série et restaure G.f/G.fight (comme
   * leaveSandbox()) si la manche qu'on vient de regarder était la dernière
   * de la série déjà entièrement précalculée par simulateDuelSeries(). */
  _duelAfterResult(){
    if(G.pending){ if(G.pending._consumed) return; G.pending._consumed=true; }
    const series=G._duelSeries, idx=G._duelMancheIdx;
    const isLastManche=!series || idx>=series.manches.length-1;
    if(isLastManche){
      G.f=G._duelSavedF; G.fight=G._duelSavedFight;
      delete G._duelSavedF; delete G._duelSavedFight;
      G.duelActive=false;
      G.screen='duel_series_result'; render(); return;
    }
    G._duelBusy=false;
    G.screen='duel_manche_result'; render();
  }
});
/* ==== [ANCRE: DUEL_CODEC] — patch non destructif de CL.afterResult() : la
   version d'origine (ui-08) ne connaît pas isDuel et route vers
   routeAfterCareerPending(), qui appliquerait des effets de carrière réels à
   un simple clone d'exhibition. On délègue systématiquement à l'original
   pour tout ce qui n'est pas un duel, sans jamais dupliquer son contenu
   (fantasy/vs ami/carrière) ici. ==== */
const _duelOrigAfterResult=CL.afterResult;
CL.afterResult=function(){
  if(G.pending && G.pending.isDuel){ CL._duelAfterResult(); return; }
  return _duelOrigAfterResult.apply(this,arguments);
};
/* ==== [FIN ANCRE] ==== */
