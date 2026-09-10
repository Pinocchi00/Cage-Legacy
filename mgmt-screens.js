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
  validate:'Tout valider',swap:'Échanger le combat',crush:'Écraser la carte'};

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

/** Joue la réponse visible numéro idx de l'échange courant (lot 1e-7, 1-3). */
function mgmtKeyReply(idx){
  if(!G||!G.mgmt) return;
  const m=G.mgmt;
  const sel=m.pile.find(a=>a.id===m.open&&a.status==='open');
  if(!sel) return;
  const ex=MGMT_EXCHANGES[sel.exchange];
  const reps=(ex?ex.replies:[]).filter(r=>MGMT_ACTION_LABELS[r.action]);
  if(idx<0||idx>=reps.length) return;
  CL.mgmtReply(sel.id,reps[idx].id);
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
    /* Réponses en paroles (lots 1e-6, 1f-2/3), pas en boutons : la réplique
       écrite quand elle existe, le libellé neutre en repli sur le vide —
       jamais de réplique générique. Ignorer est la troisième réponse : même
       niveau, même traitement, sans capitales ni cadre. */
    let btns=(ex?ex.replies:[])
      .filter(r=>MGMT_ACTION_LABELS[r.action])
      .map(r=>{
        const label=r.text||MGMT_ACTION_LABELS[r.action];
        return `<button class="mgmt-rep" onclick="CL.mgmtReply('${selOpen.id}','${r.id}')">${esc(label)}</button>`;
      })
      .join('');
    if(selOpen.kind==='leila_propose'){
      btns+=`<button class="mgmt-rep" onclick="CL.mgmtIgnore('${selOpen.id}')">Ignorer l'affaire</button>`;
    }
    /* Lot 2 : la proposition en bloc affiche ses combats marquables avant
       les trois réponses. Les autres échanges gardent voix + réponses. */
    talkHtml=(selOpen.kind==='leila_bulk')
      ?mgmtBulkTalkHtml(m,selOpen,ex,spk,btns,lines)
      :`<div class="mgmt-spk">${esc(spk.name)}</div>`
      +`<div class="mgmt-role">${esc(spk.role)}</div>`
      +lines+`<div class="mgmt-reps">${btns}</div>`;
  }

  /* Lot 1g-3 : la colonne ne montre que les deux combattants concernés par
     l'affaire sélectionnée, et rien d'autre. La ligne de statistiques
     internes est supprimée. */
  let fileHtml;
  if(sel){
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

/* ==== [ANCRE: MGMT_LOT1_CONTROLEUR] — actions du bureau : jamais d'édition
   directe de ui-08, extension via Object.assign (motif ui-10-duel.js). ==== */
Object.assign(SCREENS,{mgmt_bureau:scr_mgmt_bureau});

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
    if(!G.mgmt){
      G.mgmt=mgmtDefault();
      if(!loadMgmt()){ mgmtNewRoster(G.mgmt); mgmtNewPile(G.mgmt); saveMgmt(); }
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
    /* Lot 1g-1 : un bureau se remplit tout seul — la pile vidée par une
       décision rouvre aussitôt un cycle, sans demander la permission. */
    if(mgmtDecide(G.mgmt,affairId,replyId)){
      if(mgmtOpenCount(G.mgmt)===0) mgmtNewPile(G.mgmt);
      saveMgmt();
    }
    render();
  },
  mgmtIgnore(affairId){
    if(!G||!G.mgmt) return;
    if(mgmtIgnore(G.mgmt,affairId)){
      if(mgmtOpenCount(G.mgmt)===0) mgmtNewPile(G.mgmt);
      saveMgmt();
    }
    render();
  },
  /* Déclencheur manuel discret (lot 1g-1) : uniquement pour une pile née
     vide, qui ne se videra jamais toute seule. Texte et liseré, sans
     aplat ni ombre. */
  mgmtNextCycle(){
    if(!G||!G.mgmt) return;
    mgmtNewPile(G.mgmt);
    saveMgmt();
    render();
  },
});
/* ==== [FIN ANCRE] ==== */
