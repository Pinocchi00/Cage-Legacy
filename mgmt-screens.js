"use strict";
/* CAGE LEGACY — mgmt-screens.js
   ============================================================================
   LOT 1 MODE MANAGEMENT — écran du bureau et actions du joueur. Rendu HTML
   uniquement (aucune règle de simulation : tout vit dans mgmt-bureau.js).

   N'étend jamais ui-08-controller-arena.js par édition directe (même motif
   que ui-10-duel.js) : SCREENS et CL sont étendus ici via Object.assign.
   Chargé après ui-10-duel.js, juste avant main.js (voir index.html).

   Interface PC (addendum §24-25) : mise en page 1440px, trois colonnes, tout
   à la souris. Le gabarit 560px ne s'applique pas à cet écran : l'entrée
   (CL.mgmtEnter) pose la classe `mgmt` sur #app, le départ (CL.mgmtLeave)
   la retire.

   Dialogues : aucune réplique rédigée ici. Les lignes de Leïla viennent de
   MGMT_EXCHANGES (textes d'auteur, verbatim) ; ses réponses-joueur sont
   vides, donc seules des actions d'interface neutres sont affichées
   (accepter / refuser / ignorer / fermer), jamais des répliques.

   esc() sur toute donnée affichée, sans exception.
   ============================================================================ */

/* ==== [ANCRE: MGMT_LOT1_ECRAN] — Lot 1 mode management : écran du bureau,
   trois colonnes, voix Leïla, actions neutres. ==== */
const MGMT_ACTION_LABELS={accept:'Accepter le combat',refuse:'Refuser',close:'Fermer',
  validate:'Tout valider',swap:'Échanger le combat',crush:'Écraser la carte',
  __ignore:"Ignorer l'affaire"};

function mgmtLineCard(f){
  if(!f) return '';
  const rec=esc(f.W)+'-'+esc(f.L)+'-'+esc(f.D);
  /* Hiérarchie : le nom domine, bilan visible à droite, métadonnées
     discrètes sur une seule ligne — jamais Split, porté par le contexte.
     La raison de se battre appartient à la future fiche combattant (lot 1e-4)
     : suivie en interne (f.raison, f.level), jamais affichée ici. */
  return `<div class="opp-top"><span class="mgmt-fname">${esc(f.name)}</span>`
    +`<span class="opp-rec">${rec}</span></div>`
    +`<div class="mgmt-meta">${esc(f.age)} ans · ${esc(f.divName)}</div>`
    +`<div class="mgmt-lvl">${esc(MGMT_LEVEL_LABELS[f.level]||'Nom')}</div>`;
}

/** Déplace la sélection dans la pile ouverte (lot 1e-7, flèches). */
function mgmtKeyMove(dir){
  if(!G||!G.mgmt) return;
  const id=mgmtMoveSelection(G.mgmt,dir);
  if(id) CL.mgmtOpen(id);
}

/** Marque un combat de la proposition en bloc, au clavier (lot 2, ←/→) :
 *  un seul déroulé à la fois, comme à la souris. Sans focus, ← vise le
 *  dernier, → le premier. */
function mgmtKeyMark(dir){
  if(!G||!G.mgmt) return;
  const m=G.mgmt;
  const sel=m.pile.find(a=>a.id===m.open&&a.status==='open'&&a.kind==='leila_bulk');
  if(!sel||!Array.isArray(sel.fights)||sel.fights.length===0) return;
  const cur=Number.isSafeInteger(sel.marked)?sel.marked:(dir<0?0:-1);
  sel.marked=(cur+dir+sel.fights.length)%sel.fights.length;
  render();
}

/** Réponses réellement affichées pour une affaire (lots 1e-7, 2c-R4, 3a) : les
 *  répliques de l'échange, plus Ignorer sur les propositions simples — et sur
 *  la proposition en bloc seulement quand la carte est complète (lot 3a §5 :
 *  tant qu'elle ne l'est pas, ignorer serait une nouvelle proposition
 *  gratuite). Source unique pour la souris et le clavier : ce qui se voit
 *  se joue.
 *  Lot 2 T3, C1 (docs/LOT-2-CARTE-PRINCIPALE.md §T3) : accepter booke dans
 *  la carte principale — la réponse n'existe que quand un emplacement est
 *  libre et que la paire se pose (mgmtAcceptable) ; une réponse impossible
 *  n'est pas affichée en grisé, elle n'est simplement pas là (charte R4). */
function mgmtVisibleReplies(m,sel){
  const ex=sel&&MGMT_EXCHANGES[sel.exchange];
  let reps=(ex?ex.replies:[]).filter(r=>MGMT_ACTION_LABELS[r.action]).slice();
  if(sel&&sel.kind==='leila_propose'&&!mgmtAcceptable(m,sel)) reps=reps.filter(r=>r.action!=='accept');
  if(sel&&sel.kind==='leila_propose') reps.push({id:'__ignore',action:'__ignore'});
  else if(sel&&sel.kind==='leila_bulk'&&m&&mgmtCardFull(m)) reps.push({id:'__ignore',action:'__ignore'});
  return reps;
}

/** Joue la réponse visible numéro idx de l'échange courant (lot 1e-7, 1-3). */
function mgmtKeyReply(idx){
  if(!G||!G.mgmt) return;
  const m=G.mgmt;
  const sel=m.pile.find(a=>a.id===m.open&&a.status==='open');
  if(!sel) return;
  const reps=mgmtVisibleReplies(m,sel);
  if(idx<0||idx>=reps.length) return;
  if(reps[idx].action==='__ignore') CL.mgmtIgnore(sel.id);
  else CL.mgmtReply(sel.id,reps[idx].id);
}

/** Libellé du compteur, accordé (lot 1e-3) : la pile du lot 1 est petite,
 *  le compteur reste vrai à zéro comme à un. */
function mgmtOpenLabel(n){
  if(n<=0) return 'Aucune affaire ouverte';
  if(n===1) return '1 affaire ouverte';
  return `${n} affaires ouvertes`;
}

/** Un combat de proposition en bloc, lisible seul : combattants, catégorie,
 *  bilan (addendum 2 §5 niveau 1). Le combat marqué déroule les statistiques
 *  complètes des deux hommes (niveau 2) : un seul déroulé à la fois, jamais
 *  deux — marquer ailleurs referme. Pas de chiffres au-delà du bilan, pas de
 *  note, pas de barème (addendum 2 §6). */
function mgmtBulkFightHtml(m,aff,f,idx){
  const fa=mgmtFighterById(m,f.a), fb=mgmtFighterById(m,f.b);
  const vs=(fa&&fb)?`${fa.name} contre ${fb.name}`:'Combat';
  const rec=x=>`${x.W}-${x.L}-${x.D}`;
  const div=(fa&&fb)?(fa.divName===fb.divName?fa.divName:`${fa.divName} / ${fb.divName}`):'';
  const sub=(fa&&fb)?`${div} · ${rec(fa)} contre ${rec(fb)}`:'';
  const open=idx===aff.marked;
  const cls='opp mgmt-fight'+(open?' marked':'');
  let h=`<div class="${cls}" onclick="CL.mgmtMark('${aff.id}',${idx})">`
    +`<span class="opp-nm">${esc(vs)}</span>`
    +`<div class="opp-mid">${esc(sub)}</div>`;
  if(open&&fa&&fb){
    h+=`<div class="mgmt-duel"><div class="opp" style="cursor:default">${mgmtLineCard(fa)}</div>`
      +`<div class="opp" style="cursor:default">${mgmtLineCard(fb)}</div></div>`;
  }
  return h+`</div>`;
}

/** Bloc d'échange d'une proposition en bloc : la voix de Leïla, les N
 *  combats marquables, sa remarque éventuelle — au niveau des combats, sans
 *  désigner lequel (addendum 2) — puis les trois réponses. */
function mgmtBulkTalkHtml(m,aff,ex,spk,btns,lines){
  const fights=(aff.fights||[]).map((f,i)=>mgmtBulkFightHtml(m,aff,f,i)).join('');
  const ex2=MGMT_EXCHANGES.leila_bulk;
  const warn=(aff.fights||[]).some(f=>f.warned)&&ex2&&typeof ex2.warning==='string'
    ?`<div class="mgmt-say">${esc(ex2.warning)}</div>`:'';
  return `<div class="mgmt-spk">${esc(spk.name)}</div>`
    +`<div class="mgmt-role">${esc(spk.role)}</div>`
    +lines+fights+warn+`<div class="mgmt-reps">${btns}</div>`;
}

/** État de la carte en une ligne compacte (lot 2c) : pas une affaire à
 *  traiter, l'état du travail — sur la ligne du cycle. Lot 2 T2 (régression
 *  réparée) : la structure de la carte est {sizeMain,sizePrelims,main,
 *  prelims} depuis la T1 (docs/LOT-2-CARTE-PRINCIPALE.md §T1) — la ligne
 *  montre l'état des deux parties, carte principale et préliminaires.
 *  Libellé nu : l'appelant pose le tiret. */
function mgmtCardLabel(m){
  if(!m||!m.card||!Array.isArray(m.card.main)||!Array.isArray(m.card.prelims)) return '';
  const sM=(Number.isSafeInteger(m.card.sizeMain)&&m.card.sizeMain>0)?m.card.sizeMain:m.card.main.length;
  const sP=(Number.isSafeInteger(m.card.sizePrelims)&&m.card.sizePrelims>0)?m.card.sizePrelims:m.card.prelims.length;
  return `Carte principale ${m.card.main.length}/${sM} · préliminaires ${m.card.prelims.length}/${sP}`;
}
/** Ligne de sujet d'une proposition en bloc : les catégories couvertes. */
function mgmtBulkSubject(m,a){
  if(!a||!Array.isArray(a.fights)) return 'Carte';
  const divs=[];
  for(const f of a.fights){
    const fa=mgmtFighterById(m,f.a), fb=mgmtFighterById(m,f.b);
    if(!fa||!fb) continue;
    const d=fa.divName===fb.divName?fa.divName:`${fa.divName} / ${fb.divName}`;
    if(!divs.includes(d)) divs.push(d);
  }
  return divs.length>0?divs.join(' · '):'Carte';
}

/** Seconde ligne d'une affaire : la catégorie et les bilans du combat.
 *  Avec le titre (qui parle et de quoi), une affaire tient en deux lignes. */
function mgmtAffairSubject(m,a){
  const fa=mgmtFighterById(m,a.a), fb=mgmtFighterById(m,a.b);
  if(!fa||!fb) return 'Affaire';
  const rec=f=>`${f.W}-${f.L}-${f.D}`;
  const div=fa.divName===fb.divName?fa.divName:`${fa.divName} / ${fb.divName}`;
  return `${div} · ${rec(fa)} contre ${rec(fb)}`;
}

function scr_mgmt_bureau(){
  if(!G||!G.mgmt){
    return `<div class="scr center intro"><div class="eyebrow gold">Split — Management</div>`
      +`<h2 class="disp">Le bureau</h2>`
      +`<p class="lede">Le bureau n'est pas ouvert.</p>`
      +`<button class="btn primary mt" onclick="CL.mgmtEnter()">Ouvrir le bureau</button></div>`;
  }
  const m=G.mgmt;
  const open=m.pile.filter(a=>a.status==='open');
  const sel=m.open?m.pile.find(a=>a.id===m.open):null;
  const selOpen=sel&&sel.status==='open'?sel:null;

  /* La pile n'affiche que les affaires ouvertes : le compteur d'en-tête et
     les lignes affichées coïncident par construction. Les affaires traitées
     survivent dans les dossiers et la Mémoire, pas dans la pile. */
  let pileHtml=open.map(a=>{
    /* Lot 2 : la proposition en bloc a sa ligne (« Carte — N combats »),
       jamais le nom de Leïla répété. Les autres affaires gardent A contre B. */
    if(a.kind==='leila_bulk'){
      const n=Array.isArray(a.fights)?a.fights.length:0;
      const cls=m.open===a.id?'opp mgmt-aff sel':'opp mgmt-aff';
      const sub=m.open===a.id?`<div class="opp-mid">${esc(mgmtBulkSubject(m,a))}</div>`:'';
      return `<div class="${cls}" onclick="CL.mgmtOpen('${a.id}')">`
        +`<span class="opp-nm">Carte — ${esc(n)} combats</span>${sub}</div>`;
    }
    const fa=mgmtFighterById(m,a.a), fb=mgmtFighterById(m,a.b);
    const vs=(fa&&fb)?`${fa.name} contre ${fb.name}`:'Affaire';
    const cls=m.open===a.id?'opp mgmt-aff sel':'opp mgmt-aff';
    const sub=m.open===a.id?`<div class="opp-mid">${esc(mgmtAffairSubject(m,a))}</div>`:'';
    return `<div class="${cls}" onclick="CL.mgmtOpen('${a.id}')">`
      +`<span class="opp-nm">${esc(vs)}</span>${sub}</div>`;
  }).join('');
  /* Lot 1g-1 : le cycle suivant ne se demande pas — mais une pile née vide
     (pas de proposition ce cycle) ne se videra jamais toute seule : le
     déclencheur manuel discret reste pour ce cas, sans aplat ni ombre.
     Lot 2 T5 (§4 bis, décision 4 du 20/09) : carte principale incomplète
     et encore composable, le déclencheur ne ferait rien — il n'est pas
     proposé (charte S6 : chaque action a un retour visible) ; l'état de la
     carte se lit d'un regard sur la ligne du cycle (charte S4, R1). Le pot
     épuisé ('stuck', lot 1g) et la carte complète ('event') le gardent. */
  if(mgmtOpenCount(m)===0&&!mgmtMainPosable(m)){
    pileHtml+=`<button class="mgmt-next" onclick="CL.mgmtNextCycle()">Cycle suivant</button>`;
  }

  let talkHtml;
  if(!selOpen){
    talkHtml=`<p class="lede">La pile est vide.</p>`;
  }else{
    const ex=MGMT_EXCHANGES[selOpen.exchange];
    const spk=MGMT_SPEAKERS[selOpen.speaker]||{name:'?',role:''};
    /* Les emplacements vides ({empty}) ne s'affichent jamais : ni texte
       générique, ni marqueur visible — les boutons neutres portent l'action
       en attendant les répliques de l'auteur. */
    const lines=(ex?ex.lines:[]).filter(t=>typeof t==='string').map(t=>`<div class="mgmt-say">${esc(t)}</div>`).join('');
    /* Réponses en paroles (lots 1e-6, 1f-2/3, 2c-R4), pas en boutons : la
       réplique écrite quand elle existe, le libellé neutre en repli sur le
       vide — jamais de réplique générique. Ignorer est la troisième réponse
       des propositions : même niveau, même traitement, sans capitales ni
       cadre. Souris et clavier partagent mgmtVisibleReplies. */
    let btns=mgmtVisibleReplies(m,selOpen)
      .map(r=>{
        const label=r.text||MGMT_ACTION_LABELS[r.action];
        const go=r.action==='__ignore'
          ?`CL.mgmtIgnore('${selOpen.id}')`
          :`CL.mgmtReply('${selOpen.id}','${r.id}')`;
        return `<button class="mgmt-rep" onclick="${go}">${esc(label)}</button>`;
      })
      .join('');
    /* Lot 2 : la proposition en bloc affiche ses combats marquables avant
       les trois réponses. Les autres échanges gardent voix + réponses. */
    talkHtml=(selOpen.kind==='leila_bulk')
      ?mgmtBulkTalkHtml(m,selOpen,ex,spk,btns,lines)
      :`<div class="mgmt-spk">${esc(spk.name)}</div>`
      +`<div class="mgmt-role">${esc(spk.role)}</div>`
      +lines+`<div class="mgmt-reps">${btns}</div>`;
  }

  /* Lot 2 R2 : le dossier suit le combat courant de la proposition (le
     marqué, premier par défaut), pas les champs a/b figés à la création. */
  let fileHtml;
  if(sel&&sel.kind==='leila_bulk'&&Array.isArray(sel.fights)){
    const fi=(Number.isSafeInteger(sel.marked)&&sel.marked>=0&&sel.marked<sel.fights.length)?sel.marked:0;
    const fa=mgmtFighterById(m,sel.fights[fi].a), fb=mgmtFighterById(m,sel.fights[fi].b);
     fileHtml=mgmtBureauFicheCard(m,fa)+mgmtBureauFicheCard(m,fb);
  }else if(sel){
    const fa=mgmtFighterById(m,sel.a), fb=mgmtFighterById(m,sel.b);
     fileHtml=mgmtBureauFicheCard(m,fa)+mgmtBureauFicheCard(m,fb);
  }else{
    fileHtml='';
  }
  /* Mémoire en phrases (lot 1f-6) : ce qui a été retenu et par qui. S'il
     n'y a rien de significatif, la colonne reste vide — c'est acceptable. */
  const memHtml=mgmtMemoryLines(m)
    .map(l=>`<div class="story">${esc(l.text)}</div>`).join('');

  return `<div class="scr mgmt-wrap"><div class="mgmt-head bar">`
    +`<div><div class="eyebrow gold">Split — Management</div>`
    +`<h2 class="disp">Le bureau</h2></div>`
    +`<div style="display:flex;gap:8px;flex-wrap:wrap">`
    +`<button class="btn ghost" style="width:auto;padding:10px 16px" onclick="CL.mgmtCarte()">${esc(MGMT_CART_LABELS.open)}</button>`
    +`<button class="btn ghost" style="width:auto;padding:10px 16px" onclick="CL.mgmtLeave()">← Retour au titre</button></div></div>`
    +`<div class="mono small muted">Cycle ${esc(m.cycle)} — ${esc(mgmtOpenLabel(mgmtOpenCount(m)))}${mgmtCardLabel(m)?' — '+esc(mgmtCardLabel(m)):''}</div>`
    +`<div class="mgmt-cols">`
    +`<div class="mgmt-col"><div class="eyebrow">Pile d'affaires</div>${pileHtml}</div>`
    +`<div class="mgmt-col"><div class="eyebrow">Échange</div>${talkHtml}</div>`
    +`<div class="mgmt-col"><div class="eyebrow">Dossier</div>${fileHtml}`
    +`<div class="eyebrow mt">Mémoire</div>${memHtml}</div>`
    +`</div></div>`;
}

/* ==== [ANCRE: MGMT_LOT3A_SOIREE] — Lot 3a le corps et la soirée ;
   Lot 3 T4 : lecture ou simulation des combats depuis leurs traces.
   écran de soirée (quatre lignes — deux noms, vainqueur, famille, round ;
   ni res.detail, ni statistiques, ni note, ni étiquette — addendum 2 §6) lu
   dans m.lastEvent calculé en une fois (recharger ne rejoue rien), puis le
   lendemain (une carte par combattant touché, du plus grave au moins grave,
   avec l'emplacement vide de Clara — aucune réplique générique pour
   combler, personne touché : pas de lendemain). Le traumatisme ne paraît
   dans aucun DOM. Souris et clavier (ui-11-keys.js, jamais exclusif). ==== */
/* ==== [ANCRE: MGMT_LOT3_T4_SOIREE] — Trois parcours de soirée, trace de
   navigation non persistée ; le résultat appartient exclusivement au moteur. ==== */
let MGMT_SOIREE={index:0};
function mgmtSoireeTrace(m,i){
  const e=m&&m.lastEvent, f=e&&e.fights[i];
  if(!f||!Array.isArray(m.hist)) return null;
  /* L'historique est append-only et conserve l'ordre de la soirée, y compris
     lorsqu'une paire se retrouve plusieurs cycles plus tard. */
  const traces=m.hist.filter(t=>t.c===e.cycle);
  return traces[i]&&traces[i].a.id===f.a&&traces[i].b.id===f.b?traces[i]:null;
}
function mgmtSoireeResume(m,i){
  const t=mgmtSoireeTrace(m,i);
  if(!t) return '';
  const res=mgmtReplayFight(t);
  if(!res||!areneVerdictFidele(t,res)) return '';
  return areneBeats(res).filter(l=>l.finish||areneBeatTapis(l)||l.sub)
    .map(l=>`<div class="mgmt-meta">${esc(l.text||'')}</div>`).join('');
}
function scr_mgmt_soiree(){
  const m=G&&G.mgmt;
  if(!m||!m.lastEvent||!Array.isArray(m.lastEvent.fights)||m.lastEvent.fights.length===0){
    return scr_mgmt_bureau();
  }
   const rows=m.lastEvent.fights.map((x,i)=>{
    const fa=mgmtFighterById(m,x.a), fb=mgmtFighterById(m,x.b);
    const na=fa?fa.name:'?', nb=fb?fb.name:'?';
    const w=x.winner==='D'?'Nul':(x.winner==='A'?na:nb);
    const fam=MGMT_FAMILY_LABELS[x.family]||x.family;
     const vu=i<MGMT_SOIREE.index;
     return `<div class="opp mgmt-fight" style="cursor:default">`
       +`<span class="opp-nm">${esc(na)} contre ${esc(nb)}</span>`
       +(vu?`<div class="mgmt-meta">${esc(w)} · ${esc(fam)} · Round ${esc(x.round)}</div>${mgmtSoireeResume(m,i)}`:'')
       +`</div>`;
   }).join('');
   const total=m.lastEvent.fights.length, index=MGMT_SOIREE.index;
   const actions=index<total
     ?`<button class="mgmt-next" onclick="CL.mgmtSoireeVoir()">Voir ce combat</button>`
       +`<button class="mgmt-next" onclick="CL.mgmtSoireeSimuler()">Simuler ce combat</button>`
       +`<button class="mgmt-next" onclick="CL.mgmtSoireeToutSimuler()">Tout simuler</button>`
     :`<button class="mgmt-next" onclick="CL.mgmtSoireeNext()">Continuer</button>`;
  return `<div class="scr mgmt-wrap"><div class="mgmt-head bar">`
    +`<div><div class="eyebrow gold">Split — Management</div>`
    +`<h2 class="disp">La soirée</h2></div></div>`
    +`<div class="mgmt-cols" style="grid-template-columns:minmax(0,1fr)">`
    +`<div class="mgmt-col">${rows}`
     +actions+`</div>`
     +`</div></div>`;
}
/* ==== [FIN ANCRE] ==== */

/** Une carte du lendemain : le nom, le fait (libellé neutre), et la place de
 *  la parole de Clara — emplacement vide, convention du lot 1. */
function mgmtTouchedCard(m,t){
  const f=mgmtFighterById(m,t.id);
  const nm=f?f.name:'?';
  let fact;
  if(t.retired) fact=MGMT_FACT_LABELS.retired;
  else if(t.injury&&t.days>0) fact=t.injury+' — '+t.days+' jours';
  else if(t.injury) fact=t.injury;
  else fact=MGMT_FACT_LABELS.susp+' — '+t.days+' jours';
  const empty=t.retired
    ?'[RÉPLIQUE MANQUANTE — Clara : annonce une fin de carrière]'
    :(t.injury
      ?'[RÉPLIQUE MANQUANTE — Clara : annonce une blessure]'
      :'[RÉPLIQUE MANQUANTE — Clara : annonce une suspension]');
  return `<div class="opp" style="cursor:default"><span class="opp-nm">${esc(nm)}</span>`
    +`<div class="mgmt-meta">${esc(fact)}</div>`
    +`<div class="mgmt-say">${esc(empty)}</div></div>`;
}

function scr_mgmt_lendemain(){
  const m=G&&G.mgmt;
  const touched=m&&m.lastEvent&&Array.isArray(m.lastEvent.touched)?m.lastEvent.touched:[];
  if(!m||touched.length===0){
    return scr_mgmt_bureau();
  }
  const cards=touched.map(t=>mgmtTouchedCard(m,t)).join('');
  return `<div class="scr mgmt-wrap"><div class="mgmt-head bar">`
    +`<div><div class="eyebrow gold">Split — Management</div>`
    +`<h2 class="disp">Le lendemain</h2></div></div>`
    +`<div class="mgmt-cols" style="grid-template-columns:minmax(0,1fr)">`
    +`<div class="mgmt-col">${cards}`
    +`<button class="mgmt-next" onclick="CL.mgmtLendemainNext()">Continuer</button></div>`
    +`</div></div>`;
}
/* ==== [FIN ANCRE] ==== */

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

/* ==== [ANCRE: MGMT_LOT3_T5_HISTORIQUE] — Lot 3 T5 : fiche consultable,
   combats passés et rejeu à partir de leurs traces auto-portantes. ==== */
let MGMT_FICHE={id:null,retour:'mgmt_carte',cursor:0};
function mgmtBureauFicheCard(m,f){
  if(!f) return '';
  return `<div class="opp" style="cursor:default">${mgmtLineCard(f)}`
    +`<button class="mgmt-next" style="width:auto;padding:6px 12px;margin:8px 0 0;font-size:13px" onclick="CL.mgmtFicheParIndex(${m.roster.indexOf(f)})">Voir la fiche</button></div>`;
}
function mgmtHistoriqueHtml(m,f){
  const history=mgmtFightHistory(m,f).slice().reverse();
  if(!history.length) return `<div class="mgmt-meta">Aucun combat enregistré.</div>`;
  return history.map((t,k)=>{
    const i=m.hist.indexOf(t), side=t.a.id===f.id?'A':'B';
    const adversaire=side==='A'?t.b:t.a;
    const issue=t.winner==='D'?'Nul':(t.winner===side?'Victoire':'Défaite');
    /* La trace ne garde que la famille ; le moteur reconstitue le libellé
       exact. En cas de divergence après évolution du moteur, l'issue stockée
       prévaut et aucun résultat rejoué contradictoire n'est affiché. */
    const replay=mgmtReplayFight(t);
    const methode=(replay&&areneVerdictFidele(t,replay))?replay.method:(MGMT_FAMILY_LABELS[t.family]||t.family);
    return `<div class="opp" style="cursor:default${k===MGMT_FICHE.cursor?';border-color:var(--gold-d)':''}">`
      +`<div class="opp-nm">${esc(issue)} · ${esc(adversaire.name)}</div>`
      +`<div class="mgmt-meta">${esc(methode)} · Round ${esc(t.round)} · Cycle ${esc(t.c)}</div>`
      +`<button class="mgmt-next" style="width:auto;padding:6px 12px;margin:8px 0 0;font-size:13px" onclick="CL.mgmtHistoriqueRevoir(${i})">Revoir le combat</button>`
      +`</div>`;
  }).join('');
}
function scr_mgmt_fiche(){
  const m=G&&G.mgmt, f=m&&mgmtFighterById(m,MGMT_FICHE.id);
  if(!f) return scr_mgmt_bureau();
  return `<div class="scr mgmt-wrap"><div class="mgmt-head bar">`
    +`<div><div class="eyebrow gold">Split — Management</div><h2 class="disp">${esc(f.name)}</h2></div>`
    +`<button class="btn ghost" style="width:auto;padding:10px 16px" onclick="CL.mgmtFicheRetour()">← Retour</button></div>`
    +`<div class="mgmt-cols" style="grid-template-columns:minmax(0,1fr) minmax(0,2fr)">`
    +`<div class="mgmt-col">${mgmtCartFicheHtml(m,f,false)}</div>`
    +`<div class="mgmt-col"><div class="eyebrow">Combats</div>${mgmtHistoriqueHtml(m,f)}</div>`
    +`</div></div>`;
}
/* ==== [FIN ANCRE] ==== */

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
    +`<div class="mono small muted">Cycle ${esc(m.cycle)} — ${esc(mgmtCardLabel(m))}</div>`
    +`<div class="mgmt-cols">`
    +`<div class="mgmt-col"><div class="eyebrow">${esc(MGMT_CART_LABELS.card)}</div>${cardHtml}</div>`
    +`<div class="mgmt-col"><div class="eyebrow">${listHead}</div>${hintHtml}${listHtml}</div>`
    +`<div class="mgmt-col"><div class="eyebrow">${esc(MGMT_CART_LABELS.dossier)}</div>${mgmtCartFicheHtml(m,showF)}`
    +`<div class="eyebrow mt">${esc(MGMT_CART_LABELS.prelims)}</div>`
    +`<div style="font-size:13px;color:var(--muted);margin:4px 0 8px">${esc(prelims.length+'/'+sizePrelim)}</div>${prelimHtml}</div>`
    +`</div></div>`;
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: MGMT_LOT1_CONTROLEUR] — actions du bureau : jamais d'édition
   directe de ui-08, extension via Object.assign (motif ui-10-duel.js). ==== */
Object.assign(SCREENS,{mgmt_bureau:scr_mgmt_bureau,mgmt_soiree:scr_mgmt_soiree,mgmt_lendemain:scr_mgmt_lendemain,mgmt_carte:scr_mgmt_carte,mgmt_fiche:scr_mgmt_fiche});

/* ==== [ANCRE: MGMT_LOT1E_CLAVIER_BUREAU] — Lot 1e-7 : carte clavier du
   bureau. Flèches : parcourir la pile ouverte. Chiffres : jouer la réponse
   visible du même rang. Échap : retour au titre. Chaque action existe à la
   souris : le clavier n'est jamais exclusif. ==== */
keysRegister('mgmt_bureau',{
  ArrowUp(){ mgmtKeyMove(-1); },
  ArrowDown(){ mgmtKeyMove(1); },
  ArrowLeft(){ mgmtKeyMark(-1); },
  ArrowRight(){ mgmtKeyMark(1); },
  '1'(){ mgmtKeyReply(0); },
  '2'(){ mgmtKeyReply(1); },
  '3'(){ mgmtKeyReply(2); },
  Escape(){ CL.mgmtLeave(); },
});
/* ==== [ANCRE: MGMT_LOT3A_CLAVIER] — Lot 3a : la soirée et le lendemain ne
   demandent qu'à continuer — une touche suffit, comme la souris. ==== */
keysRegister('mgmt_soiree',{
  '1'(){ CL.mgmtSoireeVoir(); },
  '2'(){ CL.mgmtSoireeSimuler(); },
  '3'(){ CL.mgmtSoireeToutSimuler(); },
  Enter(){ if(MGMT_SOIREE.index>=G.mgmt.lastEvent.fights.length) CL.mgmtSoireeNext(); },
});
keysRegister('mgmt_lendemain',{
  '1'(){ CL.mgmtLendemainNext(); },
  Enter(){ CL.mgmtLendemainNext(); },
  Escape(){ CL.mgmtLendemainNext(); },
});
/* ==== [ANCRE: MGMT_LOT2_CLAVIER_CARTE] — Lot 2 T2 : la composition au
   clavier. Flèches : la ligne visée de la liste (le dossier la montre).
   Entrée : choisir / poser l'adversaire / annuler, comme au clic. Chiffres
   1 à 5 : retirer le combat posé à l'emplacement visé. Échap : retour au
   bureau. Chaque action existe à la souris : le clavier n'est jamais
   exclusif. ==== */
/** Déplace le curseur dans la liste affichée (filtrée si un premier choix
 *  est posé), avec rebouclage. */
function mgmtKeyCartMove(dir){
  if(!G||!G.mgmt) return;
  const m=G.mgmt;
  const all=mgmtCartRows(m);
  const pickF=MGMT_CART.pick?mgmtFighterById(m,MGMT_CART.pick):null;
  const shown=pickF?all.filter(f=>f.div===pickF.div):all;
  if(shown.length===0) return;
  MGMT_CART.cursor=(MGMT_CART.cursor+dir+shown.length)%shown.length;
  render();
}
/** Entrée : joue sur la ligne visée exactement comme un clic. */
function mgmtKeyCartAct(){
  if(!G||!G.mgmt) return;
  const m=G.mgmt;
  const all=mgmtCartRows(m);
  const pickF=MGMT_CART.pick?mgmtFighterById(m,MGMT_CART.pick):null;
  const shown=pickF?all.filter(f=>f.div===pickF.div):all;
  const f=shown[MGMT_CART.cursor];
  if(f) CL.mgmtPick(f.id);
}
keysRegister('mgmt_carte',{
  ArrowUp(){ mgmtKeyCartMove(-1); },
  ArrowDown(){ mgmtKeyCartMove(1); },
  Enter(){ mgmtKeyCartAct(); },
  '1'(){ CL.mgmtUnbook(0); },
  '2'(){ CL.mgmtUnbook(1); },
  '3'(){ CL.mgmtUnbook(2); },
  '4'(){ CL.mgmtUnbook(3); },
  '5'(){ CL.mgmtUnbook(4); },
  Escape(){ CL.mgmtCarteLeave(); },
});
keysRegister('mgmt_fiche',{
  ArrowDown(){ CL.mgmtFicheDeplacer(1); },
  ArrowUp(){ CL.mgmtFicheDeplacer(-1); },
  Enter(){ CL.mgmtFicheRevoirSelection(); },
  Escape(){ CL.mgmtFicheRetour(); },
});
/* ==== [FIN ANCRE] ==== */
/* ==== [FIN ANCRE] ==== */

Object.assign(CL,{
  mgmtFicheParIndex(i){
    const m=G&&G.mgmt;
    if(!m||!Number.isSafeInteger(i)||i<0||i>=m.roster.length) return;
    CL.mgmtFiche(m.roster[i].id);
  },
  mgmtFiche(id){
    if(!G||!G.mgmt||!mgmtFighterById(G.mgmt,id)) return;
    MGMT_FICHE={id,retour:G.screen==='mgmt_bureau'?'mgmt_bureau':'mgmt_carte',cursor:0};
    CL.go('mgmt_fiche');
  },
  mgmtFicheRetour(){ CL.go(MGMT_FICHE.retour); },
  mgmtFicheDeplacer(dir){
    const m=G&&G.mgmt, f=m&&mgmtFighterById(m,MGMT_FICHE.id);
    if(!f) return;
    const n=mgmtFightHistory(m,f).length;
    if(n<1) return;
    MGMT_FICHE.cursor=(MGMT_FICHE.cursor+dir+n)%n;
    render();
  },
  mgmtFicheRevoirSelection(){
    const m=G&&G.mgmt, f=m&&mgmtFighterById(m,MGMT_FICHE.id);
    if(!f) return;
    const history=mgmtFightHistory(m,f).slice().reverse();
    const t=history[MGMT_FICHE.cursor];
    if(t) CL.mgmtHistoriqueRevoir(m.hist.indexOf(t));
  },
  mgmtHistoriqueRevoir(i){
    const m=G&&G.mgmt, f=m&&mgmtFighterById(m,MGMT_FICHE.id);
    if(!f||!Number.isSafeInteger(i)||i<0||i>=m.hist.length) return;
    const t=m.hist[i];
    if(!mgmtFightHistory(m,f).includes(t)) return;
    const res=mgmtReplayFight(t);
    if(!res) return;
    areneEcranCharger(res,{a:t.a.name,b:t.b.name},t);
    ARENE_ECRAN.retour='mgmt_fiche'; ARENE_ECRAN.finRetour=null;
    CL.go('arene_socle');
    areneEcranDemarrer();
  },
  mgmtEnter(){
    if(!G) G={theme:'dark'};
    /* Confinement (lot 1e-1) : le traitement du bureau vit sur #app.mgmt ET
       body.mgmt, retirés ensemble au départ. Hors bureau, le fond d'origine
       est strictement intact. */
    try{
      const app=document.getElementById('app'); if(app&&app.classList) app.classList.add('mgmt');
      if(document.body&&document.body.classList) document.body.classList.add('mgmt');
    }catch(e){}
    /* Revue lot 1 (L1-R3) : la simple présence de G.mgmt ne court-circuite
       jamais la validation — un champ invalide (import, bidouille) est
       écarté, la sauvegarde dédiée (ou un bureau neuf) prend le relais. */
    if(G.mgmt&&!validateMgmt(G.mgmt)) G.mgmt=null;
    if(!G.mgmt){
      G.mgmt=mgmtDefault();
      if(!loadMgmt()){ mgmtNewRoster(G.mgmt); mgmtNewPile(G.mgmt); saveMgmt(); }
    }else{
      mgmtRepair(G.mgmt);
    }
    CL.go('mgmt_bureau');
  },
  mgmtLeave(){
    try{
      const app=document.getElementById('app'); if(app&&app.classList) app.classList.remove('mgmt');
      if(document.body&&document.body.classList) document.body.classList.remove('mgmt');
    }catch(e){}
    CL.go('title');
  },
  /* ==== [ANCRE: MGMT_LOT2_CARTE_CL] — Lot 2 T2 : la composition de la
     carte principale. Le geste : dans la liste, choisir un combattant
     disponible, puis son adversaire — mgmtBookMain pose le combat dans le
     premier emplacement libre (slot:'main') ; mgmtUnbook le retire.
     Un clic sur une ligne non sélectionnable ne fait rien ; carte
     principale complète, la liste ne sert plus qu'à consulter. ==== */
  mgmtCarte(){
    if(!G||!G.mgmt) return;
    mgmtCartReset();
    CL.go('mgmt_carte');
  },
  mgmtCarteLeave(){
    if(!G||!G.mgmt) return;
    mgmtCartReset();
    CL.go('mgmt_bureau');
  },
  mgmtPick(id){
    if(!G||!G.mgmt) return;
    const m=G.mgmt;
    const f=mgmtFighterById(m,id);
    if(!f) return;
    const all=mgmtCartRows(m);
    const pickF=MGMT_CART.pick?mgmtFighterById(m,MGMT_CART.pick):null;
    const shown=pickF?all.filter(x=>x.div===pickF.div):all;
    const idx=shown.findIndex(x=>x.id===id);
    const full=Number.isSafeInteger(m.card.sizeMain)&&Array.isArray(m.card.main)&&m.card.main.length>=m.card.sizeMain;
    /* Carte principale complète : la liste ne sert plus qu'à consulter. */
    if(full){
      if(idx>=0){ MGMT_CART.cursor=idx; }
      render();
      return;
    }
    /* Re-cliquer le choisi annule le premier choix. */
    if(MGMT_CART.pick===id){ MGMT_CART.pick=null; MGMT_CART.cursor=0; render(); return; }
    if(!mgmtSelectable(m,f,MGMT_CART.pick)) return;
    if(!MGMT_CART.pick){
      MGMT_CART.pick=id; MGMT_CART.cursor=0;
      render();
      return;
    }
    /* Deuxième choix : le combat entre dans le premier emplacement libre. */
    if(mgmtBookMain(m,MGMT_CART.pick,id)){
      MGMT_CART.pick=null; MGMT_CART.cursor=0;
      saveMgmt();
    }
    render();
  },
  mgmtUnbook(i){
    if(!G||!G.mgmt) return;
    if(mgmtRemoveMain(G.mgmt,i)) saveMgmt();
    render();
  },
  /* ==== [FIN ANCRE] ==== */
  mgmtOpen(id){
    if(!G||!G.mgmt) return;
    G.mgmt.open=id;
    render();
  },
  /* Marque un combat à échanger, à la souris (lot 2) : recliquer le marqué
     le replie (retour au niveau 1). */
  mgmtMark(affairId,idx){
    if(!G||!G.mgmt) return;
    const aff=G.mgmt.pile.find(a=>a.id===affairId);
    if(!aff||aff.status!=='open'||aff.kind!=='leila_bulk'||!Array.isArray(aff.fights)) return;
    if(!Number.isSafeInteger(idx)||idx<0||idx>=aff.fights.length) return;
    aff.marked=(aff.marked===idx)?null:idx;
    render();
  },
  mgmtReply(affairId,replyId){
    if(!G||!G.mgmt) return;
    /* Lot 2 : l'échange n'est pas une décision sur l'affaire mais un
       remplacement dans la proposition — routé vers le swap, pas decide. */
    const m=G.mgmt;
    const aff=m.pile.find(a=>a.id===affairId);
    const ex=aff&&MGMT_EXCHANGES[aff.exchange];
    const rep=ex&&(ex.replies||[]).find(r=>r.id===replyId);
    if(rep&&rep.action==='swap'){
      if(mgmtSwapFight(m,affairId)) saveMgmt();
      render();
      return;
    }
    /* Lot 1g-1 : un bureau se remplit tout seul — sauf fin de cycle (lot 3a
       §5) : pile vide et carte complète, c'est la soirée ; pile vide et
       carte incomplète, Leïla propose à nouveau ou le joueur compose (T5,
       'compose') au lieu de fermer le cycle. Le jeu ne choisit jamais un
       combat à la place du joueur — 'compose' et 'stuck' restent sur ce
       chemin, seul 'event' ouvre la soirée. */
    if(mgmtDecide(G.mgmt,affairId,replyId)){
      const r=mgmtClosePile(G.mgmt);
      if(r==='event'){
         if(mgmtRunEvent(G.mgmt)){ MGMT_SOIREE.index=0; CL.go('mgmt_soiree'); return; }
      }else{
        saveMgmt();
      }
    }
    render();
  },
  mgmtIgnore(affairId){
    if(!G||!G.mgmt) return;
    if(mgmtIgnore(G.mgmt,affairId)){
      const r=mgmtClosePile(G.mgmt);
      if(r==='event'){
         if(mgmtRunEvent(G.mgmt)){ MGMT_SOIREE.index=0; CL.go('mgmt_soiree'); return; }
      }else{
        saveMgmt();
      }
    }
    render();
  },
  /* Déclencheur manuel discret (lot 1g-1) : uniquement pour une pile née
     vide, qui ne se videra jamais toute seule. Texte et liseré, sans
     aplat ni ombre. Lot 2 T5 (§4 bis, décision 4 du 20/09) : 'compose'
     (carte principale incomplète et composable) ne ferme pas le cycle —
     le bureau reste ouvert, le joueur compose ; 'refill' et 'compose'
     font le même retour, seul 'stuck' (pot épuisé) avance le cycle à la
     main (lot 1g : aucun blocage). */
  mgmtNextCycle(){
    if(!G||!G.mgmt) return;
    const r=mgmtClosePile(G.mgmt);
    if(r==='event'){
       if(mgmtRunEvent(G.mgmt)){ MGMT_SOIREE.index=0; CL.go('mgmt_soiree'); return; }
    }else if(r==='refill'||r==='compose'){
      saveMgmt();
      render();
      return;
    }
    mgmtNewPile(G.mgmt);
    saveMgmt();
    render();
  },
  /* Lot 3a §5/§7 : après la soirée, le lendemain s'il y a des touchés, sinon
     le cycle suivant rouvre aussitôt le bureau. */
  mgmtSoireeNext(){
    if(!G||!G.mgmt) return;
    if(MGMT_SOIREE.index<G.mgmt.lastEvent.fights.length) return;
    const m=G.mgmt;
    const touched=m.lastEvent&&Array.isArray(m.lastEvent.touched)?m.lastEvent.touched:[];
    if(touched.length>0){ CL.go('mgmt_lendemain'); return; }
    mgmtNewPile(m);
    saveMgmt();
    CL.go('mgmt_bureau');
  },
  mgmtSoireeVoir(){
    if(!G||!G.mgmt||!G.mgmt.lastEvent) return;
    const t=mgmtSoireeTrace(G.mgmt,MGMT_SOIREE.index);
    if(!t) return;
    const res=mgmtReplayFight(t);
    if(!res) return;
    areneEcranCharger(res,{a:t.a.name,b:t.b.name},t);
    ARENE_ECRAN.retour='mgmt_soiree';
    ARENE_ECRAN.finRetour=function(){ MGMT_SOIREE.index++; };
    CL.go('arene_socle');
    areneEcranDemarrer();
  },
  mgmtSoireeSimuler(){
    if(!G||!G.mgmt||!G.mgmt.lastEvent) return;
    MGMT_SOIREE.index=Math.min(G.mgmt.lastEvent.fights.length,MGMT_SOIREE.index+1);
    render();
  },
  mgmtSoireeToutSimuler(){
    if(!G||!G.mgmt||!G.mgmt.lastEvent) return;
    MGMT_SOIREE.index=G.mgmt.lastEvent.fights.length;
    render();
  },
  mgmtLendemainNext(){
    if(!G||!G.mgmt) return;
    mgmtNewPile(G.mgmt);
    saveMgmt();
    CL.go('mgmt_bureau');
  },
});
/* ==== [FIN ANCRE] ==== */
