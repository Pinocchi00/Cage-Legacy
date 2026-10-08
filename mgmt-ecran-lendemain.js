"use strict";
/* ==== [ANCRE: MGMT_LOT4_T4_LENDEMAIN] — Lot 4 T4 (docs/LOT-4-LA-PEAU-DU-JEU.md
   §3 T4 ; maquette 06, PARTIELLE) : l'écran du lendemain prend la forme de la
   maquette (grille 560 px / 1fr, titres condensés, jetons --mgmt-*). Il ne
   montre que ce que le code sait déjà :

   - L'EN-TÊTE : « Le lendemain de Split N » (N = m.eventsPlayed — l'écran
     s'ouvre après la soirée jouée) et le bouton « Préparer Split N+1 »
     (CL.mgmtLendemainNext, mgmt-screens.js, inchangé). Le calendrier du mode
     ne dérive pas d'aucune date : pas de jour en en-tête (maquette 06,
     eyebrow « Dimanche 12 octobre » absent, §1).

   - LES RÉSULTATS, racontés par les faits du moteur. « X bat Y » — l'issue
     stockée de la trace (ancre ARENE_T2_GARDE_REJEU : la vérité historique
     prime, un rejeu divergent ne s'affiche jamais). La méthode détaillée se
     rejoue depuis la trace (lot 3 T1 : mgmtReplayFight, ARENE_T2_GARDE_REJEU
     pour le garde-fou) : la méthode du moteur (res.method), le round —
     absent sur une décision (judgesVerdict), même repli à 3 que
     mgmtRunEvent —, le geste de finition du moteur (res.moveName,
     pickFinishMove — vidé par le moteur pour un arrêt médical, une
     disqualification et une blessure : rien n'est inventé) et « secoué n
     fois » d'après les knockdowns encaissés de la cible
     (res.stats[cible].wobbled — la même lecture que mgmtApplyFight,
     mgmt-corps.js). Sans trace lisible : la famille stockée seule
     (MGMT_FAMILY_LABELS, le classificateur unique). Le rang du combat sur
     la carte porte son libellé (le premier main event, le co-main, la
     première prélim) — mgmtRunEvent joue la carte principale d'abord
     (lot 2 T1). Revoir rejoue le combat (CL.mgmtLendemainRevoir : le même
     motif que CL.mgmtSoireeVoir, lot 3 T4, retour au lendemain) ;
     « Voir toute la soirée » rouvre l'écran de la soirée (lot 3 T4),
     préliminaires comprises.

   - CE QUE ÇA A CHANGÉ : constats factuels dérivés, sans voix ni opinion
     (§1) — entrées et sorties du top 15 MONDIAL, une seule loi de
     classement : mgmtDivisionRanking comparé au cycle précédent (le même
     recalcul au cycle explicite que l'écran des classements, T6-1 — le
     retraité du cycle reste au classement d'hier), limité aux catégories
     qui ont reçu un combat ce soir ; puis les combattants touchés, dans
     l'ordre stocké du plus grave au moins grave (retraites médicales,
     blessures nommées, suspensions en jours).

   - Ce qui attend un système absent n'apparaît pas (§1, §4 bis) : ni « On
     en parle » (presse, lot 5), ni « Les suites qu'on réclame » (la presse
     et l'attente, lot 5), ni les phrases de la maquette (« son agent parle
     de retraite », « la presse se demande ») — une retraite, une blessure
     et une suspension se disent en faits, jamais par une voix. Aucun
     texte de la maquette n'est du contenu du jeu.

   esc() sur tout nom affiché. Aucun Math.random(). Aucun système de jeu
   nouveau : l'écran lit m.lastEvent et le classement, ne remplace rien. ==== */
const MGMT_LD_LABELS={
  results:'Les résultats',
  changes:'Ce que ça a changé',
  mainEvent:'Combat principal',
  coMain:'Co-main',
  prelims:'Préliminaires',
  nul:'Match nul',
  battre:'bat',
  contre:'contre',
  revoir:'Revoir',
  touteLaSoiree:'Voir toute la soirée, préliminaires comprises',
  prepare:'Préparer Split',
  inTop:'entre dans le top 15',
  outTop:'sort du top 15',
  world:'au classement mondial',
  worldHors:'hors du classement mondial',
  blessureLabel:'Blessure : ',
};

/* « secoué une fois, deux fois… » : la liste des durées lisibles ; au-delà,
   le nombre parle seul. */
const MGMT_LD_SECOUNE=['une fois','deux fois','trois fois','quatre fois','cinq fois','six fois'];

/** Le complément « secoué n fois » d'une ligne de méthode. Pur.
 *  @param {number} n le nombre de knockdowns encaissés.
 *  @returns {string} '' si n ne compte pas. */
function mgmtLendemainSecoue(n){
  if(!(Number.isSafeInteger(n)&&n>=1)) return '';
  return n<=MGMT_LD_SECOUNE.length?MGMT_LD_SECOUNE[n-1]:n+' fois';
}

/** La ligne de méthode détaillée d'un combat de la soirée : rejoué depuis sa
 *  trace (mgmtReplayFight, lot 3 T1) et montré seulement si l'issue rejouée
 *  est fidèle (ancre ARENE_T2_GARDE_REJEU) — la méthode du moteur
 *  (res.method), le round (absent sur une décision, judgesVerdict : même
 *  repli à 3 que mgmtRunEvent), le geste de finition du moteur
 *  (res.moveName — vidé par le moteur pour un arrêt médical, une
 *  disqualification et une blessure : rien n'est inventé) et « secoué n
 *  fois » d'après les knockdowns encaissés de la cible (res.stats[cible]
 *  .wobbled — la même lecture que mgmtApplyFight, mgmt-corps.js). Sans
 *  rejeu fidèle : la famille stockée seule, jamais un résultat
 *  contradictoire à l'écran. Pur : le rejeu ne déplace aucun tirage.
 *  @param {object|null} t la trace du combat (mgmtSoireeTrace, lot 3 T4).
 *  @returns {string} */
function mgmtLendemainMethode(t){
  if(!t) return '';
  const res=mgmtReplayFight(t);
  if(!res||!areneVerdictFidele(t,res)){
    return MGMT_FAMILY_LABELS[t.family]||'';
  }
  const fam=mgmtMethodFamily(res.method,res.winner);
  let line=res.method;
  line+=(fam==='dec'||fam==='draw')?' en '+t.round+' rounds':' au round '+t.round;
  if(typeof res.moveName==='string'&&res.moveName) line+=', '+res.moveName;
  const cible=res.winner==='A'?'B':(res.winner==='B'?'A':null);
  const st=(cible&&res.stats)?res.stats[cible]:null;
  const sec=st?mgmtLendemainSecoue(Math.max(0,Math.round(num(st.wobbled)))):'';
  if(sec) line+=', secoué '+sec;
  return line;
}

/** Les résultats de la soirée : les combats dans l'ordre de la carte
 *  (la carte principale d'abord, lot 2 T1 ; les traces d'historique
 *  conservent l'ordre, mgmtSoireeTrace). « X bat Y » — l'issue stockée de
 *  la trace, jamais un rejeu contradictoire (ancre ARENE_T2_GARDE_REJEU).
 *  @returns {string} */
function mgmtLendemainResultatsHtml(m){
  const e=m.lastEvent;
  let html='', mains=0, prelimVu=false;
  /* Corrections du 08/10, 3.1 : les combats sont dans l'ordre de passage — le DERNIER de la carte principale est le combat principal. */
  const nMain=e.fights.filter((x,k)=>{ const tk=mgmtSoireeTrace(m,k); return tk&&tk.slot==='main'; }).length;
  for(let i=0;i<e.fights.length;i++){
    const f=e.fights[i], t=mgmtSoireeTrace(m,i);
    const frA=mgmtFighterById(m,f.a), frB=mgmtFighterById(m,f.b);
    const na=t?t.a.name:(frA?frA.name:'?');
    const nb=t?t.b.name:(frB?frB.name:'?');
    const titre=f.winner==='A'
      ?`${esc(na)} ${esc(MGMT_LD_LABELS.battre)} ${esc(nb)}`
      :(f.winner==='B'
        ?`${esc(nb)} ${esc(MGMT_LD_LABELS.battre)} ${esc(na)}`
        :`${esc(MGMT_LD_LABELS.nul)} — ${esc(na)} ${esc(MGMT_LD_LABELS.contre)} ${esc(nb)}`);
    let slot='';
    if(t){
      if(t.slot==='main'){
        mains++;
        slot=mains===nMain?MGMT_LD_LABELS.mainEvent:(mains===nMain-1&&nMain>=2?MGMT_LD_LABELS.coMain:'');
      }else{
        slot=prelimVu?'':(prelimVu=true,MGMT_LD_LABELS.prelims);
      }
    }
    const meth=t?mgmtLendemainMethode(t):(MGMT_FAMILY_LABELS[f.family]||'');
    html+=`<div class="mgmt-ld-item">`
      +(slot?`<span class="mgmt-ld-slot${slot===MGMT_LD_LABELS.coMain?' gold':''}">${esc(slot)}</span>`:'')
      +`<div class="mgmt-ld-title">${titre}</div>`
      +(meth?`<div class="mgmt-ld-sub">${esc(meth)}</div>`:'')
      +(t?`<button class="mgmt-ld-link" onclick="CL.mgmtLendemainRevoir(${i})">${esc(MGMT_LD_LABELS.revoir)}</button>`:'')
      +`</div>`;
  }
  return html;
}

/** Les constats factuels de la soirée (§1) : entrées et sorties du top 15
 *  mondial — la seule loi de classement (mgmtDivisionRanking, ancre
 *  MGMT_LOT2_CLASSEMENT, recalcul au cycle explicite T6-1), limitée aux
 *  catégories qui ont reçu un combat — puis les touchés, dans l'ordre
 *  stocké du plus grave au moins grave, aux libellés existants
 *  (MGMT_FACT_LABELS, le même classificateur du lot 3a). Pur.
 *  @returns {string} */
function mgmtLendemainConstatsHtml(m){
  const e=m.lastEvent, out=[];
  if(Number.isSafeInteger(m.cycle)&&m.cycle>0){
    const divs=[];
    for(const f of e.fights){
      for(const id of [f.a,f.b]){
        const fr=mgmtFighterById(m,id);
        if(fr&&fr.div&&!divs.includes(fr.div)) divs.push(fr.div);
      }
    }
    for(const divId of divs){
      const cur=mgmtDivisionRanking(m,divId,'world');
      const prev=mgmtDivisionRanking(m,divId,'world',m.cycle-1);
      cur.forEach((row,i)=>{
        if(i>=MGMT_CL_TOP) return;
        if(prev.some(x=>x.id===row.id)) return;
        const gl=mgmtFicheLigne(m,row.id), nom=gl?gl.f.name:'Combattant';
        out.push({gold:true,
          titre:`${esc(nom)} ${esc(MGMT_LD_LABELS.inTop)}`,
          detail:`${esc(mgmtDivisionLabel(divId))} · ${esc(mgmtRankLabel(i+1,divId))} `
            +`${esc(MGMT_LD_LABELS.world)}.`});
      });
      prev.slice(0,MGMT_CL_TOP).forEach(row=>{
        const j=cur.findIndex(x=>x.id===row.id);
        if(j>=0&&j<MGMT_CL_TOP) return;
        const gl=mgmtFicheLigne(m,row.id), nom=gl?gl.f.name:'Combattant';
        out.push({gold:false,
          titre:`${esc(nom)} ${esc(MGMT_LD_LABELS.outTop)}`,
          detail:j>=0
            ?`${esc(mgmtDivisionLabel(divId))} · ${esc(mgmtRankLabel(j+1,divId))} `
              +`${esc(MGMT_LD_LABELS.world)}.`
            :`${esc(mgmtDivisionLabel(divId))} · ${esc(MGMT_LD_LABELS.worldHors)}.`});
      });
    }
  }
  const touched=Array.isArray(e.touched)?e.touched:[];
  for(const tu of touched){
    const fr=mgmtFighterById(m,tu.id);
    const nm=fr?fr.name:'Combattant', age=fr?`${fr.age} ans`:null;
    const qui=`${esc(nm)}${age?`, ${esc(age)}`:''}`;
    let titre, detail='';
    if(tu.retired){
      titre=`${qui}, ${esc(MGMT_FACT_LABELS.retired.toLowerCase())}`;
      if(tu.injury) detail=`${esc(MGMT_LD_LABELS.blessureLabel)}${esc(tu.injury)}.`;
    }else if(tu.injury){
      titre=`${qui}, blessé`;
      detail=tu.days>0
        ?`${esc(tu.injury)} — suspendu ${esc(tu.days)} jours.`
        :`${esc(tu.injury)}.`;
    }else if(Number.isSafeInteger(tu.days)&&tu.days>0){
      titre=`${qui}, suspendu ${esc(tu.days)} jours`;
    }else{ continue; }
    out.push({gold:false,titre,detail});
  }
  return out.map(c=>`<div class="mgmt-ld-item">`
    +`<div class="mgmt-ld-title${c.gold?' gold':''}">${c.titre}</div>`
    +(c.detail?`<p class="mgmt-ld-detail">${c.detail}</p>`:'')
    +`</div>`).join('');
}

/** L'écran (maquette 06) : en-tête Split N et sa soirée suivante, les
 *  résultats à gauche, les constats à droite — la place des blocs du
 *  lot 5 (« On en parle », « Les suites qu'on réclame ») se referme. */
function scr_mgmt_lendemain(){
  const m=G&&G.mgmt, e=m&&m.lastEvent;
  if(!m||!e||!Array.isArray(e.fights)||e.fights.length===0){
    return scr_mgmt_bureau();
  }
  return `<div class="scr mgmt-wrap mgmt-ld"><div class="mgmt-head bar">`
    +`<h2 class="disp">Le lendemain de ${esc(mgmtOrgNom(m))} ${esc(m.eventsPlayed)}</h2>`
    +`<button class="mgmt-ld-next" onclick="CL.mgmtLendemainNext()">`
      +`${esc(MGMT_LD_LABELS.prepare.replace('Split',mgmtOrgNom(m)))} ${esc(m.eventsPlayed+1)}</button>`
    +`</div>`
    +`<div class="mgmt-ld-cols">`
    +`<section class="mgmt-ld-pane mgmt-ld-results">`+mfPanneau(`<div class="mf-sem-in">`
      +`<h3 class="mgmt-ld-hd">${esc(MGMT_LD_LABELS.results)}</h3>`
      +mgmtLendemainResultatsHtml(m)
      +`<button class="mgmt-ld-link mgmt-ld-tout" onclick="CL.go('mgmt_soiree')">${esc(MGMT_LD_LABELS.touteLaSoiree)}</button>`
      +`</div>`,'normal','mf-sem-p')+`</section>`
    +`<section class="mgmt-ld-pane">`+mfPanneau(`<div class="mf-sem-in">`
      +(typeof mgmtMediasLendemainHtml==='function'?mgmtMediasLendemainHtml(m):'')
      +`<h3 class="mgmt-ld-hd">${esc(MGMT_LD_LABELS.changes)}</h3>`
      +mgmtLendemainConstatsHtml(m)
      +(typeof mgmtLendemainPatronHtml==='function'?mgmtLendemainPatronHtml(m):'')
      +`</div>`,'normal','mf-sem-p')+`</section>`
    +`</div></div>`;
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: MGMT_LOT4_T4_LENDEMAIN_CL] — REVOIR rejoue le combat depuis sa
   trace (lot 3 T4 — mgmtSoireeTrace, mgmtReplayFight et le garde de rejeu
   ARENE_T2_GARDE_REJEU appliqués tel quel), retour au lendemain. Aucun
   geste nouveau : le même motif que CL.mgmtSoireeVoir, la séquence imposée
   garde ses contrôles (mgmtLendemainNext, mgmt-screens.js, inchangé).
   Souris d'abord ; échap, Entrée et « 1 » continuent au clavier
   (ancre MGMT_LOT3A_CLAVIER, mgmt-screens.js, inchangée). Aucun
   Math.random(). ==== */
Object.assign(CL,{
  mgmtLendemainRevoir(i){
    const m=G&&G.mgmt;
    if(!m||!m.lastEvent) return;
    if(!Number.isSafeInteger(i)||i<0||i>=m.lastEvent.fights.length) return;
    const t=mgmtSoireeTrace(m,i);
    if(!t) return;
    /* Lot 11 : avec l'agenda, le combat se revoit sur l'écran animé (mgmtRevoirCombat) ; sinon, l'arène d'avant. */
    mgmtRevoirCombat(t,'mgmt_lendemain',null);
  },
});
/* ==== [FIN ANCRE] ==== */
