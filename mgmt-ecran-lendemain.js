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
  coMain:'Co-principal',
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
/* ==== [ANCRE: MONDE_LOT20_RANGS_LENDEMAIN] — Monde lot 20 (retour d'Anthony du 18/10/2026) : « le nouveau classement par rapport à l'ancien sur les
   résultats finaux de toute la soirée ». Le rang chez l'organisation d'avant la soirée est celui du cycle précédent (la comparaison de la colonne
   Évolution des Classements) ; celui d'après est le rang courant. Lecture pure. ==== */
/** Le rang chez l'organisation d'un combattant avant et après la soirée : {avant,apres} (null = hors classement). @returns {?{avant:?number,apres:?number}} */
function mgmtLendemainRangs(m,id){
  const f=mgmtFighterById(m,id);
  if(!f||!f.div) return null;
  const apres=mgmtDivisionRank(m,f,'organization');
  const ancien=Number.isSafeInteger(m.cycle)&&m.cycle>0?mgmtDivisionRanking(m,f.div,'organization',m.cycle-1):[];
  const k=ancien.findIndex(x=>x.id===id);
  return {avant:k>=0?k+1:null,apres:Number.isSafeInteger(apres)&&apres>0?apres:null};
}
/** « Gomes 12ᵉ → 9ᵉ » : le mouvement d'un combattant au classement de l'organisation. @returns {string} */
function mgmtLendemainRangTexte(m,id,nom){
  const r=mgmtLendemainRangs(m,id);
  if(!r) return '';
  const lib=x=>x===null?'hors classement':mgmtRankLabel(x,mgmtFighterById(m,id).div);
  if(r.avant===r.apres) return `${nom} ${lib(r.apres)} (inchangé)`;
  return `${nom} ${lib(r.avant)} → ${lib(r.apres)}`;
}
/* ==== [FIN ANCRE] ==== */

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
      +(()=>{const g=[mgmtLendemainRangTexte(m,f.a,t?t.a.last||t.a.name:'?'),mgmtLendemainRangTexte(m,f.b,t?t.b.last||t.b.name:'?')].filter(Boolean);return g.length?`<div class="mgmt-ld-rangs">${g.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`:'';})()
      +(t?`<button class="mgmt-ld-link" onclick="CL.mgmtLendemainRevoir(${i})">${esc(MGMT_LD_LABELS.revoir)}</button>`:'')
      +`</div>`;
  }
  return html;
}

/* ==== [ANCRE: MONDE54_T1_MOMENTS] — Monde lot 54 T1 ==== */
/** Trois combats racontés par leur nature, le premier restant l'histoire la
 *  plus lourde de P8 T1. Les liens réutilisent strictement le Revoir existant. */
function mgmtLendemainMomentsHtml(m){
  const hist=Array.isArray(m.hist)?m.hist:[], stories=typeof mgmtHistoiresSoiree==='function'?mgmtHistoiresSoiree(m,m.eventsPlayed):[];
  const used=new Set(), picks=[];
  const add=(label,find)=>{const s=stories.find(x=>!used.has(x.c)&&find(x,hist[x.c]));if(s){used.add(s.c);picks.push({label,s});}};
  add('LA SURPRISE',s=>s.type==='surprise');
  add('LA FINITION',(_s,t)=>t&&(['ko','sub','stop'].includes(t.family)||/ko|soumission|arrêt/i.test(mgmtLendemainMethode(t))));
  add('LA GUERRE',(_s,t)=>t&&Number(t.rounds)>=5&&Number.isFinite(Number(t.rounds)));
  return picks.map(({label,s})=>{const t=hist[s.c];if(!t)return '';const a=t.winner==='B'?t.b:t.a,b=t.winner==='B'?t.a:t.b;
    const title=t.winner==='A'||t.winner==='B'?`${a.name||a.last} bat ${b.name||b.last}`:`${t.a.name||t.a.last} contre ${t.b.name||t.b.last}`;
    return `<article class="ld3-moment"><div class="ld3-label">${esc(label)}</div><div class="ld3-names">${esc(title)}</div><div class="ld3-detail">${esc(mgmtLendemainMethode(t))}</div><button class="mgmt-ld-link" onclick="CL.mgmtLendemainRevoir(${s.c})">Revoir</button></article>`;
  }).join('');
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: MONDE54_T1_MOUVEMENTS_ORGANISATION] — Monde lot 54 T1 ==== */
/** Mouvements de classement des participants, y compris ceux qui restent dans
 *  le top 15 : la comparaison utilise le rang organisationnel avant/après. */
function mgmtLendemainMouvementsHtml(m){
  const e=m&&m.lastEvent;
  if(!e||!Array.isArray(e.fights)) return '';
  const ids=[];
  for(const fight of e.fights) for(const id of [fight&&fight.a,fight&&fight.b])
    if(typeof id==='string'&&!ids.includes(id)) ids.push(id);
  const lignes=[];
  for(const id of ids){
    const fighter=mgmtFighterById(m,id);
    if(!fighter||!fighter.div) continue;
    const rangs=mgmtLendemainRangs(m,id);
    if(!rangs||rangs.avant===rangs.apres) continue;
    const nom=fighter.name||fighter.last||'Combattant';
    const rang=x=>x===null?'HORS CLASSEMENT':mgmtRankLabel(x,fighter.div);
    lignes.push(`<div class="ld3-move"><b>${esc(nom)}</b><span>${esc(mgmtDivisionLabel(fighter.div))}</span><strong>${esc(rang(rangs.avant))} → ${esc(rang(rangs.apres))}</strong></div>`);
  }
  return lignes.join('');
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: MONDE54_T1_MOMENTS_COMPLETES] — Monde lot 54 T1 ==== */
/** Complète les trois catégories sans dupliquer de combat lorsque la soirée
 *  n'en contient pas un de chaque type. */
function mgmtLendemainMomentsCompletsHtml(m){
  const html=mgmtLendemainMomentsHtml(m);
  if((html.match(/class="ld3-moment"/g)||[]).length>=3) return html;
  const stories=typeof mgmtHistoiresSoiree==='function'?mgmtHistoiresSoiree(m,m.eventsPlayed):[];
  const hist=Array.isArray(m.hist)?m.hist:[], seen=new Set();
  for(const match of html.matchAll(/CL\.mgmtLendemainRevoir\((\d+)\)/g)) seen.add(Number(match[1]));
  const picks=[];
  for(const s of stories){
    if(seen.has(s.c)||!hist[s.c]) continue;
    seen.add(s.c); picks.push(s);
    if(seen.size>=3) break;
  }
  const rest=picks.map(s=>{const t=hist[s.c],a=t.winner==='B'?t.b:t.a,b=t.winner==='B'?t.a:t.b;
    const title=t.winner==='A'||t.winner==='B'?`${a.name||a.last} bat ${b.name||b.last}`:`${t.a.name||t.a.last} contre ${t.b.name||t.b.last}`;
    const label=s.type==='surprise'?'LA SURPRISE':(['ko','sub','stop'].includes(t.family)||/ko|soumission|arrêt/i.test(mgmtLendemainMethode(t))?'LA FINITION':Number.isFinite(Number(t.rounds))&&Number(t.rounds)>=5?'LA GUERRE':'LE COMBAT');
    return `<article class="ld3-moment"><div class="ld3-label">${label}</div><div class="ld3-names">${esc(title)}</div><div class="ld3-detail">${esc(mgmtLendemainMethode(t))}</div><button class="mgmt-ld-link" onclick="CL.mgmtLendemainRevoir(${s.c})">Revoir</button></article>`;
  }).join('');
  return html+rest;
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: MONDE54_T1_SUITE_LENDEMAIN] — Monde lot 54 T1 ==== */
/** Suite de la page du lendemain : presse ordonnée, mouvements et carte
 * complète. Exposée séparément afin de ne pas masquer l'écran historique. */
function mgmtLendemainSuiteHtml(m){
  const presse=mgmtLendemainPresseHtml(m);
  const resultats=mgmtLendemainResultatsHtml(m);
  const mouvements=mgmtLendemainMouvementsHtml(m)+mgmtLendemainConstatsHtml(m);
  return `<section class="ld3-suite"><h2 class="ld3-suite-title">LE LENDEMAIN · LA SUITE</h2>`
    +`<div class="ld3-suite-press"><h3 class="ld3-suite-heading">CAGE HEBDO</h3>${presse}</div>`
    +`<div class="ld3-suite-moves"><h3 class="ld3-suite-heading">LES MOUVEMENTS</h3>${mouvements||'<p class="ld3-suite-empty">Aucun mouvement notable.</p>'}</div>`
    +`<div class="ld3-suite-results"><h3 class="ld3-suite-heading">TOUS LES RÉSULTATS</h3>${resultats}</div></section>`;
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: MONDE54_T1_APRES_CATALOGUE] — Monde lot 54 T1 ==== */
/* Catalogue T3 : les entrées restent des formulations éditoriales à relire. */
const MGMT_LD_APRES_FAMILLES=[
  {famille:'interpellation',texte:'Les interpellations adressées à {nom} appellent une réponse après sa soirée.',relu:false},
  {famille:'réseaux',texte:'Sur les réseaux, les supporters de {nom} commentent encore son dernier combat.',relu:false},
  {famille:'suspension',texte:'Le retour de {nom} attend la fin de sa suspension médicale.',relu:false},
  {famille:'revanche',texte:'Le camp de {nom} réclame une revanche.',relu:false},
  {famille:'autre organisation',texte:'Une autre organisation suit désormais {nom}.',relu:false},
  {famille:'classement',texte:'Le classement de la division discute de la place de {nom} après le combat.',relu:false},
  {famille:'rivalité',texte:'Le résultat relance la rivalité entre {nom} et son adversaire.',relu:false},
  {famille:'espoir',texte:'Ton espoir {nom} entend poursuivre sur cette lancée.',relu:false},
];
/** Jusqu'à la prochaine soirée : au plus trois messages hebdomadaires, issus
 *  d'un flux d'identité stable et sans mutation de la sauvegarde. */
function mgmtLendemainApres(m,semaine){
  const cycleSoiree=m&&m.lastEvent&&m.lastEvent.cycle;
  if(!m||!Number.isSafeInteger(semaine)||!Number.isSafeInteger(cycleSoiree)||semaine<=cycleSoiree) return [];
  const soiree=(Array.isArray(m.hist)?m.hist:[]).filter(t=>t&&t.c===cycleSoiree&&t.a&&t.b);
  if(!soiree.length) return [];
  const combattants=[];
  for(const t of soiree) for(const f of [t.a,t.b]) if(f.id&&!combattants.some(x=>x.id===f.id)) combattants.push(f);
  if(!combattants.length) return [];
  const stream=mgmtIdentiteStream(combattants.map(f=>f.id).sort().join('|'),'lendemain-apres|'+semaine,m);
  const decal=Math.floor(stream()*combattants.length), n=Math.min(3,1+Math.floor(stream()*3)), result=[];
  const touches=Array.isArray(m.lastEvent.touched)?m.lastEvent.touched:[];
  for(let i=0;i<Math.min(n,combattants.length);i++){
    const f=combattants[(decal+i)%combattants.length], nom=f.name||f.last||'Combattant';
    const item=MGMT_LD_APRES_FAMILLES[(Math.floor(stream()*MGMT_LD_APRES_FAMILLES.length)+i)%MGMT_LD_APRES_FAMILLES.length];
    if(item.famille==='suspension'&&!touches.some(x=>x&&x.id===f.id&&Number.isSafeInteger(x.days)&&x.days>0)) continue;
    /* La semaine fait partie du fait temporel : elle distingue une reprise
       ultérieure du même sujet sans stocker d'historique dans la sauvegarde. */
    result.push({famille:item.famille,texte:`${item.texte.replaceAll('{nom}',nom)} (semaine ${semaine})`,relu:false});
  }
  return result;
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: MONDE54_T1_LENDEMAIN_RECOMPOSE] — Monde lot 54 T1 ==== */
/** Les primes attribuées pour cette soirée, dans l'ordre établi par P7 T3. */
function mgmtLendemainPrimesHtml(m){
  const facts=(Array.isArray(m.facts)?m.facts:[]).filter(f=>f&&f.k==='prime'&&f.c===m.lastEvent.cycle);
  const vus=new Set();
  return facts.filter(f=>{const key=f.fight+'|'+f.type;if(vus.has(key))return false;vus.add(key);return true;})
    .map(f=>{const t=m.hist&&m.hist[f.fight],fighter=mgmtFighterById(m,f.a),name=fighter?fighter.name:(t&&t.a&&t.a.id===f.a?t.a.name:t&&t.b&&t.b.name)||'Combattant';
      const label=f.type==='cs'?'COMBAT DE LA SOIRÉE':'PERFORMANCE DE LA SOIRÉE';
      return `<div class="ld3-prime"><b>${esc(label)}</b><span>${esc(name)}</span><span>${esc(mgmtEuros((f.m||0)/1000))}</span></div>`;}).join('');
}

/** Faits sur la soirée qui ont modifié le suivi ou l'espoir du joueur. */
function mgmtLendemainAttentionHtml(m){
  const stories=typeof mgmtHistoiresSoiree==='function'?mgmtHistoiresSoiree(m,m.eventsPlayed):[];
  return stories.filter(s=>s.type==='suivi'||s.type==='espoir').map(s=>{
    const f=mgmtFighterById(m,s.a),nom=f?f.name:s.a||'Combattant';
    const statut=s.type==='espoir'?'Ton espoir':'Ton suivi';
    const issue=s.raison&&s.raison.victoire?'gagne':'a combattu';
    return `<div class="ld3-attention"><b>${esc(nom)}</b><span>${esc(statut)} · ${esc(issue)}</span></div>`;
  }).join('');
}

/** Bloc discursif facultatif : la PR P7 T4 peut arriver après cette branche. */
function mgmtLendemainDiscoursHtml(m){
  if(typeof mgmtDiscoursLire!=='function'||!Array.isArray(m.discours)) return '';
  const rows=m.discours.filter(d=>d&&d.c===m.lastEvent.cycle);
  return rows.map(d=>`<div class="ld3-speech">${esc(typeof d.texte==='string'?d.texte:'')}</div>`).join('');
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: MONDE54_T1_CHIFFRES_PRESSE] — Monde lot 54 T1 ==== */
/** Les articles existants, ordonnés par le poids P8 T1 de leur combat. */
function mgmtLendemainPresseHtml(m){
  if(typeof mgmtMediasLendemain!=='function') return '';
  const histoires=typeof mgmtHistoiresSoiree==='function'?mgmtHistoiresSoiree(m,m.eventsPlayed):[];
  const rows=mgmtMediasLendemain(m)||[];
  const score=row=>{
    const combat=Number.isSafeInteger(row.f)?m.hist[row.f]:null;
    const id=row.id;
    const story=histoires.find(x=>x.c===row.f)||histoires.find(x=>x.a===id||x.b===id);
    return story?story.poids:combat?0:0;
  };
  return rows.slice().sort((a,b)=>score(b)-score(a)).map((row,i)=>
    `<div class="ld3-press"><b>${i===0?'À LA UNE':'DANS LA PRESSE'}</b><span>${esc(row.texte||row.titre||'')}</span></div>`).join('');
}

/** Les chiffres effectivement enregistrés à la clôture, sans estimation. */
function mgmtLendemainChiffresHtml(m){
  const e=m&&m.lastEvent, f=e&&e.finance||{}, rows=[];
  const ajouter=(label,value)=>{if(typeof value==='string'||Number.isFinite(value)) rows.push(`<div class="ld3-figure"><b>${esc(label)}</b><span>${esc(typeof value==='number'?value.toLocaleString('fr-FR'):value)}</span></div>`);};
  ajouter('SALLE',f.spectateurs);
  ajouter('RECETTES',Number.isFinite(f.recette)?mgmtEuros(f.recette/1000):null);
  ajouter('CAISSE',Number.isFinite(m.treasury)?mgmtEuros(m.treasury):null);
  ajouter('POPULARITÉ',Number.isFinite(m.popularity)?m.popularity:null);
  const poste=m.poste;
  if(poste&&Array.isArray(poste.objectifs)){
    for(const objectif of poste.objectifs){
      if(!objectif||typeof objectif.nom!=='string') continue;
      rows.push(`<div class="ld3-figure"><b>${esc(objectif.nom)}</b><span>${objectif.ok===true?'ATTEINT':'EN COURS'}</span></div>`);
    }
  }
  return rows.length?`<section class="ld3-figures"><h3>LES CHIFFRES</h3>${rows.join('')}</section>`:'';
}
/* ==== [FIN ANCRE] ==== */

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
      /* Monde lot 8 T4a : la même comparaison qu'avant, lue dans
         mgmtTop15Mouvements (mgmt-bureau.js) — le fait et le lendemain
         restent d'accord. HTML de sortie inchangé. */
      const mv=mgmtTop15Mouvements(m,divId);
      mv.entrees.forEach(({id,rang})=>{
        const gl=mgmtFicheLigne(m,id), nom=gl?gl.f.name:'Combattant';
        out.push({gold:true,
          titre:`${esc(nom)} ${esc(MGMT_LD_LABELS.inTop)}`,
          detail:`${esc(mgmtDivisionLabel(divId))} · ${esc(mgmtRankLabel(rang,divId))} `
            +`${esc(MGMT_LD_LABELS.world)}.`});
      });
      mv.sorties.forEach(({id,rang})=>{
        const gl=mgmtFicheLigne(m,id), nom=gl?gl.f.name:'Combattant';
        out.push({gold:false,
          titre:`${esc(nom)} ${esc(MGMT_LD_LABELS.outTop)}`,
          detail:rang!==null
            ?`${esc(mgmtDivisionLabel(divId))} · ${esc(mgmtRankLabel(rang,divId))} `
              +`${esc(MGMT_LD_LABELS.world)}.`
            :`${esc(mgmtDivisionLabel(divId))} · ${esc(MGMT_LD_LABELS.worldHors)}.`});
      });
    }
  }
  const touched=Array.isArray(e.touched)?e.touched:[];
  for(const tu of touched){
    const fr=mgmtFighterById(m,tu.id);
    const nm=fr?fr.name:'Combattant', age=fr?`${fr.age} ans`:null, fem=mgmtFeminin(fr)?'e':'';   /* audit 16/10 D10 : « blessée » */
    const qui=`${esc(nm)}${age?`, ${esc(age)}`:''}`;
    let titre, detail='';
    if(tu.retired){
      titre=`${qui}, ${esc(MGMT_FACT_LABELS.retired.toLowerCase())}`;
      if(tu.injury) detail=`${esc(MGMT_LD_LABELS.blessureLabel)}${esc(tu.injury)}.`;
    }else if(tu.injury){
      titre=`${qui}, blessé${fem}`;
      detail=tu.days>0
        ?`${esc(tu.injury)} — suspendu${fem} ${esc(tu.days)} jours.`
        :`${esc(tu.injury)}.`;
    }else if(Number.isSafeInteger(tu.days)&&tu.days>0){
      titre=`${qui}, suspendu${fem} ${esc(tu.days)} jours`;
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
       +mgmtLendemainMomentsCompletsHtml(m)
      +mgmtLendemainPrimesHtml(m)
      +mgmtLendemainDiscoursHtml(m)
      +mgmtLendemainAttentionHtml(m)
      +mgmtLendemainPresseHtml(m)
      +mgmtLendemainChiffresHtml(m)
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
