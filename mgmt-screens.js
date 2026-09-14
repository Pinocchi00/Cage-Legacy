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
 *  se joue. */
function mgmtVisibleReplies(m,sel){
  const ex=sel&&MGMT_EXCHANGES[sel.exchange];
  const reps=(ex?ex.replies:[]).filter(r=>MGMT_ACTION_LABELS[r.action]).slice();
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
 *  traiter, l'état du travail — sur la ligne du cycle. */
function mgmtCardLabel(m){
  if(!m||!m.card||!Array.isArray(m.card.fights)) return '';
  const size=(Number.isSafeInteger(m.card.size)&&m.card.size>0)?m.card.size:m.card.fights.length;
  return ` — Carte ${m.card.fights.length}/${size}`;
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
     déclencheur manuel discret reste pour ce cas, sans aplat ni ombre. */
  if(mgmtOpenCount(m)===0){
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
    fileHtml=`<div class="opp" style="cursor:default">${mgmtLineCard(fa)}</div>`
      +`<div class="opp" style="cursor:default">${mgmtLineCard(fb)}</div>`;
  }else if(sel){
    const fa=mgmtFighterById(m,sel.a), fb=mgmtFighterById(m,sel.b);
    fileHtml=`<div class="opp" style="cursor:default">${mgmtLineCard(fa)}</div>`
      +`<div class="opp" style="cursor:default">${mgmtLineCard(fb)}</div>`;
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
    +`<button class="btn ghost" style="width:auto;padding:10px 16px" onclick="CL.mgmtLeave()">← Retour au titre</button></div>`
    +`<div class="mono small muted">Cycle ${esc(m.cycle)} — ${esc(mgmtOpenLabel(mgmtOpenCount(m)))}${esc(mgmtCardLabel(m))}</div>`
    +`<div class="mgmt-cols">`
    +`<div class="mgmt-col"><div class="eyebrow">Pile d'affaires</div>${pileHtml}</div>`
    +`<div class="mgmt-col"><div class="eyebrow">Échange</div>${talkHtml}</div>`
    +`<div class="mgmt-col"><div class="eyebrow">Dossier</div>${fileHtml}`
    +`<div class="eyebrow mt">Mémoire</div>${memHtml}</div>`
    +`</div></div>`;
}

/* ==== [ANCRE: MGMT_LOT3A_SOIREE] — Lot 3a le corps et la soirée : un seul
   écran de soirée (quatre lignes — deux noms, vainqueur, famille, round ;
   ni res.detail, ni statistiques, ni note, ni étiquette — addendum 2 §6) lu
   dans m.lastEvent calculé en une fois (recharger ne rejoue rien), puis le
   lendemain (une carte par combattant touché, du plus grave au moins grave,
   avec l'emplacement vide de Clara — aucune réplique générique pour
   combler, personne touché : pas de lendemain). Le traumatisme ne paraît
   dans aucun DOM. Souris et clavier (ui-11-keys.js, jamais exclusif). ==== */
function scr_mgmt_soiree(){
  const m=G&&G.mgmt;
  if(!m||!m.lastEvent||!Array.isArray(m.lastEvent.fights)||m.lastEvent.fights.length===0){
    return scr_mgmt_bureau();
  }
  const rows=m.lastEvent.fights.map(x=>{
    const fa=mgmtFighterById(m,x.a), fb=mgmtFighterById(m,x.b);
    const na=fa?fa.name:'?', nb=fb?fb.name:'?';
    const w=x.winner==='D'?'Nul':(x.winner==='A'?na:nb);
    const fam=MGMT_FAMILY_LABELS[x.family]||x.family;
    return `<div class="opp mgmt-fight" style="cursor:default">`
      +`<span class="opp-nm">${esc(na)} contre ${esc(nb)}</span>`
      +`<div class="mgmt-meta">${esc(w)} · ${esc(fam)} · Round ${esc(x.round)}</div></div>`;
  }).join('');
  return `<div class="scr mgmt-wrap"><div class="mgmt-head bar">`
    +`<div><div class="eyebrow gold">Split — Management</div>`
    +`<h2 class="disp">La soirée</h2></div></div>`
    +`<div class="mgmt-cols" style="grid-template-columns:minmax(0,1fr)">`
    +`<div class="mgmt-col">${rows}`
    +`<button class="mgmt-next" onclick="CL.mgmtSoireeNext()">Continuer</button></div>`
    +`</div></div>`;
}

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

/* ==== [ANCRE: MGMT_LOT1_CONTROLEUR] — actions du bureau : jamais d'édition
   directe de ui-08, extension via Object.assign (motif ui-10-duel.js). ==== */
Object.assign(SCREENS,{mgmt_bureau:scr_mgmt_bureau,mgmt_soiree:scr_mgmt_soiree,mgmt_lendemain:scr_mgmt_lendemain});

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
  '1'(){ CL.mgmtSoireeNext(); },
  Enter(){ CL.mgmtSoireeNext(); },
  Escape(){ CL.mgmtSoireeNext(); },
});
keysRegister('mgmt_lendemain',{
  '1'(){ CL.mgmtLendemainNext(); },
  Enter(){ CL.mgmtLendemainNext(); },
  Escape(){ CL.mgmtLendemainNext(); },
});
/* ==== [FIN ANCRE] ==== */
/* ==== [FIN ANCRE] ==== */

Object.assign(CL,{
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
       carte incomplète, Leïla propose à nouveau au lieu de fermer le cycle.
       Le jeu ne choisit jamais un combat à la place du joueur. */
    if(mgmtDecide(G.mgmt,affairId,replyId)){
      const r=mgmtClosePile(G.mgmt);
      if(r==='event'){
        if(mgmtRunEvent(G.mgmt)){ CL.go('mgmt_soiree'); return; }
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
        if(mgmtRunEvent(G.mgmt)){ CL.go('mgmt_soiree'); return; }
      }else{
        saveMgmt();
      }
    }
    render();
  },
  /* Déclencheur manuel discret (lot 1g-1) : uniquement pour une pile née
     vide, qui ne se videra jamais toute seule. Texte et liseré, sans
     aplat ni ombre. Lot 3a §5 : si la pile est vide pour de bon (cycle non
     fermé, carte incomplète), il propose d'abord à nouveau — seul un pot
     vraiment épuisé avance le cycle à la main. */
  mgmtNextCycle(){
    if(!G||!G.mgmt) return;
    const r=mgmtClosePile(G.mgmt);
    if(r==='event'){
      if(mgmtRunEvent(G.mgmt)){ CL.go('mgmt_soiree'); return; }
    }else if(r==='refill'){
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
    const m=G.mgmt;
    const touched=m.lastEvent&&Array.isArray(m.lastEvent.touched)?m.lastEvent.touched:[];
    if(touched.length>0){ CL.go('mgmt_lendemain'); return; }
    mgmtNewPile(m);
    saveMgmt();
    CL.go('mgmt_bureau');
  },
  mgmtLendemainNext(){
    if(!G||!G.mgmt) return;
    mgmtNewPile(G.mgmt);
    saveMgmt();
    CL.go('mgmt_bureau');
  },
});
/* ==== [FIN ANCRE] ==== */
