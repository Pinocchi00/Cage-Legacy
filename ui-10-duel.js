"use strict";
/* CAGE LEGACY — ui-10-duel.js
   ============================================================================
   LOT DUEL-01 — "Duel entre amis" (Carrière Complète), LOT DUEL-03 — duel
   sur légendes du Panthéon, tactique par manche. Le LOT DUEL-02 (entrée
   déplacée vers scr_intro) est ANNULÉ : l'entrée du duel vit désormais dans
   scr_hof() (ui-06-career-screens.js), au-dessus de la grille de légendes —
   scr_intro() n'a plus AUCUNE référence au duel.

   Le duel se joue entre DEUX LÉGENDES DU PANTHÉON. Le combattant de carrière
   en cours (G.f) n'est JAMAIS sélectionnable, ni côté joueur ni côté ami :
   toute la sélection passe par loadHOF() (state-hof.js), jamais par G.f.
   Les deux légendes passent par reconstructLegend()+neutralizeWeightGap()
   (ui-01-roster-matchmaking.js, duel-codec.js) avant toute simulation —
   jamais un second système de reconstruction parallèle à celui déjà utilisé
   par Fantasy Fight/All-Stars.

   Toute la logique déterministe (codec, PRNG, moteur de série) vit dans
   duel-codec.js — ce fichier ne fait que l'interface avec G/CL/DOM et REJOUE
   le combat dans les écrans d'arène (scr_arena) et de résultat (scr_result)
   déjà existants, sans jamais en écrire un nouveau. Chaque manche est
   entièrement précalculée par simulateDuelSeries() dès le lancement de la
   série (déterminisme complet, LOT DUEL-01 — seedManche(i)=hash(seedBase+
   "#"+i), patch de window.rnd restauré dans un finally, canonicalisation par
   tri lexicographique des codes) : deux joueurs qui entrent la même paire de
   codes voient EXACTEMENT le même vainqueur, la même méthode et le même
   round à chaque manche, quel que soit celui qui a collé le code de l'autre.
   Un écran de lancement (scr_duelLaunch, duel_launch) gate la RÉVÉLATION de
   chaque manche déjà calculée : le joueur repasse par cet écran avant
   chacune des manches (y compris la première), jamais deux animations
   d'arène enchaînées automatiquement.

   N'étend jamais ui-08-controller-arena.js par édition directe : SCREENS et
   CL y sont de simples objets exposés globalement (SCREENS en portée de
   fichier, window.CL), donc étendus ici via Object.assign — chargé après
   ui-08/ui-09, juste avant main.js (voir index.html, ANCRE DUEL_CODEC).

   Exhibition PURE : aucune méthode ci-dessous n'appelle jamais save(), ni
   saveHOF() (le Panthéon n'est jamais modifié par un duel). G.duelActive
   (posé pendant qu'une manche tourne dans G.f/G.fight, comme G.fantasyActive)
   fait aussi barrage à tout save() déclenché par le code partagé de
   l'arène/du résultat (state-save.js).
   ============================================================================ */

/* ==== [ANCRE: DUEL_CODEC] — LOT DUEL-01, révisé LOT DUEL-03 (Panthéon) ==== */

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

/** Message d'erreur lisible pour un decodeDuelCode() en échec — jamais un
 * échec silencieux (ANCRE FEEDBACK_LIEN_AMI). Un code d'une version
 * précédente du codec (ancien CLD1 ou ancien export "Vs Ami") reçoit un
 * message dédié, jamais confondu avec un code réellement corrompu.
 * @param {{ok:false,reason:string}} check @returns {string} */
function duelDecodeErrorMessage(check){
  return check.reason==='version_precedente'
    ? "Code d’une version précédente, redemande-le à ton ami."
    : `Code invalide ou corrompu (${check.reason}).`;
}

function scr_duelHome(){
  const list=loadHOF();
  if(!list.length){
    return `<div class="scr center intro">
     <div class="eyebrow gold">Duel entre amis</div>
     <h2 class="disp">Panthéon vide</h2>
     <p class="lede">Retire un combattant pour débloquer le duel.</p>
     <button class="btn ghost mt" onclick="CL.go('hof')">Retour</button>
    </div>`;
  }
  const selfIdx=Math.max(0,Math.min(G._duelPlayerIdx||0,list.length-1));
  const self=list[selfIdx];
  const hasFriendFiche=!!G._duelFriendFiche;
  const friendIdx=(G._duelFriendIdx!=null)?Math.max(0,Math.min(G._duelFriendIdx,list.length-1)):null;
  const friendLocal=(!hasFriendFiche && friendIdx!=null)?list[friendIdx]:null;
  const myCode=encodeDuelCode(self)||'';
  const msg=G._duelMsg?`<div class="card mb" style="border-left:3px solid var(--gold);background:var(--panel2)"><span class="small">${esc(G._duelMsg)}</span></div>`:'';
  const err=G._duelError?`<div class="card mb" style="border-left:3px solid var(--loss);background:var(--panel2)"><span class="small" style="color:var(--loss)">${esc(G._duelError)}</span></div>`:'';
  return `<div class="scr">
   <div class="bar" style="border-bottom:1px solid var(--line);padding-bottom:8px;margin-bottom:14px">
     <span class="eyebrow mono">DUEL ENTRE AMIS</span>
     <span class="eyebrow x" onclick="CL.go('hof')">✕</span>
   </div>
   ${msg}${err}
   <p class="lede small">Un combat d’exhibition en trois manches entre deux légendes du Panthéon, purement pour l’honneur : aucun impact sur ta carrière, ton bilan ou tes finances.</p>
   <div class="card glass" style="padding:16px;margin-bottom:16px">
     <div class="eyebrow gold mb">Ta légende</div>
     <div class="hero-name" style="font-size:20px">${esc(self.name)}</div>
     <div class="muted small mb">${esc(self.style)} · OVR ${self.overall||'?'}</div>
     ${list.length>1?`<div class="g2"><button class="btn ghost" style="min-height:44px" onclick="CL.duelSetPlayer(-1)">◀</button><button class="btn ghost" style="min-height:44px" onclick="CL.duelSetPlayer(1)">▶</button></div>`:''}
   </div>
   <div class="card glass" style="padding:16px;margin-bottom:16px">
     <div class="eyebrow gold mb">Mon code (à partager)</div>
     <textarea readonly rows="3" onclick="this.select()" style="width:100%;background:var(--panel2);border:1px solid var(--line);color:var(--text);padding:10px;font-family:'JetBrains Mono',monospace;font-size:12px;resize:none">${esc(myCode)}</textarea>
     <div class="g2 mt">
       <button class="btn ghost" style="min-height:44px" onclick="CL.duelShareMyCode()">Partager</button>
       <button class="btn ghost" style="min-height:44px" onclick="CL.duelCopyMyCode()">Copier</button>
     </div>
   </div>
   <div class="card glass" style="padding:16px">
     <div class="eyebrow gold mb">Légende de l’ami</div>
     ${hasFriendFiche?`
       <div class="hero-name" style="font-size:20px;color:var(--sage)">${esc(G._duelFriendFiche.name)}</div>
       <div class="muted small mb">${esc(G._duelFriendFiche.style)} · OVR ${G._duelFriendFiche.overall||'?'}</div>
       <button class="btn ghost mt" style="min-height:44px" onclick="CL.duelClearFriendCode()">Retirer l’import</button>
     `:`
       ${friendLocal?`
         <div class="hero-name" style="font-size:20px;color:var(--sage)">${esc(friendLocal.name)}</div>
         <div class="muted small mb">${esc(friendLocal.style)} · OVR ${friendLocal.overall||'?'}</div>
         <div class="g2"><button class="btn ghost" style="min-height:44px" onclick="CL.duelSetFriend(-1)">◀</button><button class="btn ghost" style="min-height:44px" onclick="CL.duelSetFriend(1)">▶</button></div>
       `:`<p class="muted small">Il te faut une deuxième légende au Panthéon, ou un code ami collé ci-dessous.</p>`}
       <textarea id="duel_friend_code" rows="3" placeholder="Ou colle ici le code reçu de ton ami"
         autocapitalize="off" autocorrect="off" spellcheck="false" autocomplete="off"
         style="width:100%;background:var(--panel2);border:1px solid var(--line);color:var(--text);padding:10px;font-family:'JetBrains Mono',monospace;font-size:12px;resize:none;margin-top:10px"></textarea>
       <button class="btn ghost mt" style="min-height:44px" onclick="CL.duelImportFriendCode()">Importer le code</button>
     `}
   </div>
   <button class="btn primary mt" style="font-size:18px;padding:16px;min-height:44px" ${G._duelBusy?'disabled':''} onclick="CL.duelStartSeries()">COMBATTRE</button>
  </div>`;
}

function scr_duelLaunch(){
  const series=G._duelSeries, idx=G._duelMancheIdx;
  if(!series || series.manches[idx]==null) return `<div class="scr center intro"><p class="lede">Duel introuvable.</p><button class="btn ghost mt" onclick="CL.duelEnter()">Retour</button></div>`;
  const m=series.manches[idx];
  const before=idx===0?{self:0,friend:0}:duelCumulativeScore(series,idx-1);
  const total=series.manches.length;
  const analysis=tacticalRead(m.selfFighter,m.friendFighter);
  return `<div class="scr center intro">
   <div class="eyebrow gold">Duel entre amis</div>
   <h2 class="disp">MANCHE ${m.index} / ${total} — ${before.self}-${before.friend}</h2>
   <div class="card glass mt" style="padding:16px;text-align:left">
     <div class="disp center" style="font-size:18px">${esc(m.selfFighter.name)} <span class="muted" style="font-size:13px">VS</span> ${esc(m.friendFighter.name)}</div>
     <div class="muted small mt" style="border-left:2px solid var(--gold);padding-left:10px">${analysis}</div>
   </div>
   <button class="btn primary mt" style="font-size:18px;padding:16px;min-height:44px" ${G._duelBusy?'disabled':''} onclick="CL.duelBeginManche()">COMMENCER LE COMBAT</button>
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
  duel_launch:scr_duelLaunch,
  duel_series_result:scr_duelSeriesResult
});

/* ==== [ANCRE: DUEL_CODEC] — LOT DUEL-01, révisé LOT DUEL-03 : méthodes CL.
   Ajoutées par extension de l'objet existant (jamais d'édition de ui-08) :
   CL et SCREENS y sont déjà entièrement construits au moment où ce fichier
   s'exécute. ==== */
Object.assign(CL,{
  /** Point d'entrée UNIQUE du Duel entre amis (bouton de scr_hof()) : G.f
   * n'est jamais lu ni écrit ici, toute la sélection vient de loadHOF(). */
  duelEnter(){
    const list=loadHOF();
    G._duelBusy=false; G._duelError=null; G._duelMsg=null; G._duelSeries=null; G._duelMancheIdx=0;
    G._duelMancheResolved=false;
    G._duelPlayerIdx=0; G._duelFriendIdx=list.length>1?1:null;
    G._duelFriendCode=''; G._duelFriendFiche=null;
    G.screen='duel_home'; render();
  },
  /** Fait défiler la sélection du joueur parmi les légendes du Panthéon,
   * jamais G.f. Saute l'index déjà pris par l'ami local (s'il n'y a pas de
   * code ami importé) — même logique que setFantasy() (ui-08). */
  duelSetPlayer(dir){
    const list=loadHOF(); if(list.length<2) return;
    const max=list.length-1;
    let n=(G._duelPlayerIdx||0)+dir; if(n<0)n=max; if(n>max)n=0;
    if(!G._duelFriendFiche && G._duelFriendIdx!=null && n===G._duelFriendIdx){ n+=dir; if(n<0)n=max; if(n>max)n=0; }
    G._duelPlayerIdx=n; render();
  },
  /** Fait défiler la sélection locale de l'ami parmi les légendes du
   * Panthéon (ignorée si un code ami est importé). */
  duelSetFriend(dir){
    const list=loadHOF(); if(list.length<2) return;
    const max=list.length-1;
    let n=(G._duelFriendIdx!=null?G._duelFriendIdx:0)+dir; if(n<0)n=max; if(n>max)n=0;
    if(n===(G._duelPlayerIdx||0)){ n+=dir; if(n<0)n=max; if(n>max)n=0; }
    G._duelFriendIdx=n; render();
  },
  duelShareMyCode(){
    const list=loadHOF(); const self=list[Math.max(0,Math.min(G._duelPlayerIdx||0,list.length-1))];
    const code=self&&encodeDuelCode(self);
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
    const list=loadHOF(); const self=list[Math.max(0,Math.min(G._duelPlayerIdx||0,list.length-1))];
    const code=self&&encodeDuelCode(self);
    if(!code){ G._duelMsg="Impossible de générer ton code."; render(); return; }
    duelCopyFallbackChain(code);
  },
  /** Importe/valide le code collé par le joueur pour représenter son ami.
   * Un ancien code (CLD1, ou ancien export "Vs Ami") reçoit le message
   * dédié duelDecodeErrorMessage() — jamais confondu avec "invalide". */
  duelImportFriendCode(){
    const el=/** @type {HTMLTextAreaElement|null} */ (document.getElementById('duel_friend_code'));
    const raw=(el&&el.value||'').trim();
    if(!raw){ G._duelError="Colle d’abord le code de ton ami."; render(); return; }
    const check=decodeDuelCode(raw);
    if(!check.ok){ G._duelError=duelDecodeErrorMessage(check); render(); return; }
    G._duelError=null; G._duelFriendFiche=check.fighter; G._duelFriendCode=raw;
    render();
  },
  duelClearFriendCode(){ G._duelFriendFiche=null; G._duelFriendCode=''; render(); },
  /** Lance la série : encode/valide les deux codes (jamais G.f), puis
   * délègue le calcul déterministe complet à simulateDuelSeries()
   * (duel-codec.js) avant d'afficher l'écran de lancement de la manche 1 —
   * jamais de manche jouée sans passer par cet écran. */
  duelStartSeries(){
    if(G._duelBusy) return;
    const list=loadHOF();
    if(!list.length) return;
    const selfEntry=list[Math.max(0,Math.min(G._duelPlayerIdx||0,list.length-1))];
    const myCode=selfEntry&&encodeDuelCode(selfEntry);
    if(!myCode){ G._duelError="Impossible de générer ton code — réessaie."; render(); return; }
    let friendCode=null;
    if(G._duelFriendFiche && G._duelFriendCode){
      friendCode=G._duelFriendCode;
    } else {
      const friendEntry=(G._duelFriendIdx!=null)?list[G._duelFriendIdx]:null;
      /* ==== [ANCRE: CORRECTIF_VSFRIEND_PANTHEON_UNIQUE] — même garde-fou que
         l'ancien Vs Ami (retiré) : un Panthéon à une seule légende et aucun
         code importé ne doit jamais planter, seulement afficher un message
         clair. ==== */
      if(!friendEntry){ G._duelError="Il faut une deuxième légende (ou un code ami) pour lancer un duel."; render(); return; }
      friendCode=encodeDuelCode(friendEntry);
      if(!friendCode){ G._duelError="Impossible de générer le code de l’ami — réessaie."; render(); return; }
    }
    G._duelBusy=true;
    const series=simulateDuelSeries(myCode,friendCode);
    if(!series.ok){ G._duelBusy=false; G._duelError=`Impossible de lancer le duel : ${series.reason}`; render(); return; }
    G._duelError=null; G._duelSeries=series;
    G._duelSavedF=G.f; G._duelSavedFight=G.fight;
    CL.duelShowLaunch(0);
  },
  /** Affiche l'écran de lancement (score + analyse tactique, AUCUN choix de
   * tactique) avant la manche `idx`, déjà entièrement précalculée. Réarme le
   * verrou anti-double-tap (ANCRE CORRECTIF_DOUBLE_VSFRIEND_PLAN — servait au
   * choix de tactique de l'ancien Vs Ami, sert maintenant au seul bouton
   * "COMMENCER LE COMBAT" de cet écran). */
  duelShowLaunch(idx){
    const series=G._duelSeries;
    if(!series || !series.manches[idx]){ CL.duelEnter(); return; }
    G._duelMancheIdx=idx; G._duelMancheResolved=false; G._duelBusy=false;
    G.screen='duel_launch'; render();
  },
  /* ==== [ANCRE: CORRECTIF_DOUBLE_VSFRIEND_PLAN] — verrou anti-double-tap :
     sans lui, un double-tap sur "COMMENCER LE COMBAT" jouerait deux manches
     pour un seul clic voulu. ==== */
  duelBeginManche(){
    if(G._duelMancheResolved) return;
    G._duelMancheResolved=true; G._duelBusy=true;
    const series=G._duelSeries, idx=G._duelMancheIdx;
    const m=series.manches[idx];
    G.f=m.selfFighter;
    G.fight={kind:'duel',opp:m.friendFighter,rounds:m.rounds};
    G.pending={
      res:m.res, win:m.winner==='self', method:m.res.method,
      finish:!isDecisionLike(m.res.method),
      opp:{name:m.friendFighter.name,flag:m.friendFighter.flag},
      isDuel:true, mancheIndex:m.index, totalManches:series.manches.length
    };
    G.duelActive=true;
     G.screen='arena'; render();
  },
  /** Branche duel de l'écran de résultat partagé (scr_result) : avant chaque
   * manche suivante (y compris la 2e et la 3e), on repasse par l'écran de
   * lancement (duelShowLaunch) — jamais d'enchaînement automatique vers
   * l'arène. Clôt la série et restaure G.f/G.fight (comme leaveSandbox())
   * une fois la dernière manche de la série déjà précalculée révélée. */
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
    CL.duelShowLaunch(idx+1);
  }
});
/* ==== [ANCRE: DUEL_CODEC] — patch non destructif de CL.afterResult() : la
   version d'origine (ui-08) ne connaît pas isDuel et route vers
   routeAfterCareerPending(), qui appliquerait des effets de carrière réels à
   un simple clone d'exhibition. On délègue systématiquement à l'original
   pour tout ce qui n'est pas un duel, sans jamais dupliquer son contenu
   (fantasy/carrière) ici. ==== */
const _duelOrigAfterResult=CL.afterResult;
CL.afterResult=function(){
  if(G.pending && G.pending.isDuel){ CL._duelAfterResult(); return; }
  return _duelOrigAfterResult.apply(this,arguments);
};
/* ==== [FIN ANCRE] ==== */
