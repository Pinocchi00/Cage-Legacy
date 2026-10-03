"use strict";
/* CAGE LEGACY — mgmt-screens.js (contrôleur et clavier communs)
   ============================================================================
   LOT 1 MODE MANAGEMENT — composants partagés et actions du joueur. Rendu HTML
   uniquement (aucune règle de simulation : tout vit dans mgmt-bureau.js).

   N'étend jamais ui-08-controller-arena.js par édition directe (même motif
   que ui-10-duel.js) : SCREENS et CL sont étendus ici via Object.assign.
   Chargé après les six écrans, avant main.js (voir index.html).

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
    +`<div class="mgmt-meta">${esc(f.age)} ans · ${esc(mgmtDivisionLabel(f.div))}</div>`;
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
  const div=(fa&&fb)?(fa.div===fb.div?mgmtDivisionLabel(fa.div):`${mgmtDivisionLabel(fa.div)} / ${mgmtDivisionLabel(fb.div)}`):'';
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
    const d=fa.div===fb.div?mgmtDivisionLabel(fa.div):`${mgmtDivisionLabel(fa.div)} / ${mgmtDivisionLabel(fb.div)}`;
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
  const div=fa.div===fb.div?mgmtDivisionLabel(fa.div):`${mgmtDivisionLabel(fa.div)} / ${mgmtDivisionLabel(fb.div)}`;
  return `${div} · ${rec(fa)} contre ${rec(fb)}`;
}

/* ==== [ANCRE: MGMT_LOT4_T1_NAV] — Lot 4 T1 : navigation permanente sur les
   écrans existants, l'organisation ajoutée à la T7 (LOT-4 §3 T7), les
   classements à la T6 (LOT-4 §3 T6). La fiche et la carte restent des
   destinations ouvertes par d'autres écrans : aucune entrée morte. ==== */
function mgmtNavHtml(){
  /* La soirée et le lendemain forment la séquence imposée (addendum 1 §14) :
     la barre reste visible, seule la progression de la soirée est cliquable. */
  if(G&&(G.screen==='mgmt_soiree'||G.screen==='mgmt_lendemain')){
    return `<nav class="mgmt-nav" aria-label="Navigation management"><span>Semaine</span></nav>`;
  }
  /* L'entrée courante (aria-current) se distingue visiblement des autres :
     classe cur (or plein) contre fond atténué — contrastes ≥ 4,5:1 (charte
     L2, ancre MGMT_LOT4_T7_NAV_COURANT dans index.html). */
  const navB=(label,screen)=>`<button type="button" class="${G&&G.screen===screen?'cur':''}"`
    +`${G&&G.screen===screen?' aria-current="page"':''}`
    +` onclick="CL.go('${screen}')">${label}</button>`;
  return `<nav class="mgmt-nav" aria-label="Navigation management">`
    +navB('Semaine','mgmt_bureau')
    +navB('Vestiaire','mgmt_vestiaire')
    +navB('Classements','mgmt_classements')
    +navB('Organisation','mgmt_organisation')+`</nav>`;
}
function mgmtWithNav(screen){
  return function(){
    return screen().replace(/<div class="scr mgmt-wrap([^"]*)">/,
      (opening)=>opening+mgmtNavHtml());
  };
}

/* ==== [ANCRE: MGMT_LOT1_CONTROLEUR] — actions du bureau : jamais d'édition
   directe de ui-08, extension via Object.assign (motif ui-10-duel.js).
   Lot 4 T7 : l'organisation rejoint les cinq autres écrans, enregistrée
   comme eux (mgmtWithNav). Lot 4 T6 : les classements, de même. ==== */
Object.assign(SCREENS,{mgmt_bureau:mgmtWithNav(scr_mgmt_bureau),mgmt_soiree:mgmtWithNav(scr_mgmt_soiree),mgmt_lendemain:mgmtWithNav(scr_mgmt_lendemain),mgmt_carte:mgmtWithNav(scr_mgmt_carte),mgmt_fiche:mgmtWithNav(scr_mgmt_fiche),mgmt_vestiaire:mgmtWithNav(scr_mgmt_vestiaire),mgmt_organisation:mgmtWithNav(scr_mgmt_organisation),mgmt_classements:mgmtWithNav(scr_mgmt_classements)});

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
/* ==== [ANCRE: MGMT_LOT4_T7_CLAVIER] — Lot 4 T7 : l'écran de l'organisation
   au clavier — échap ramène à la semaine, comme à la souris. Aucune
   exclusive : le bouton de la navigation et celui de l'en-tête font le
   même chemin. ==== */
keysRegister('mgmt_organisation',{
  Escape(){ CL.go('mgmt_bureau'); },
});
/* ==== [ANCRE: MGMT_LOT4_T6_CLAVIER] — Lot 4 T6 : l'écran des classements
   au clavier — échap ramène à la semaine, comme à la souris. Aucune
   exclusive : le bouton de la navigation fait le même chemin. ==== */
keysRegister('mgmt_classements',{
  Escape(){ CL.go('mgmt_bureau'); },
});
keysRegister('mgmt_vestiaire',{
  Escape(){ CL.go('mgmt_bureau'); },
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
    if(!G||!G.mgmt||!mgmtFicheLigne(G.mgmt,id)) return;
    /* Lot 4 T6 : la fiche revient d'où elle a été ouverte — la semaine, la
       carte ou les classements ; ailleurs, la semaine reste la maison. */
    const retour=(G.screen==='mgmt_bureau'||G.screen==='mgmt_carte'
      ||G.screen==='mgmt_classements'||G.screen==='mgmt_vestiaire')?G.screen:'mgmt_bureau';
    MGMT_FICHE={id,retour,cursor:0};
    CL.go('mgmt_fiche');
  },
  mgmtFicheRetour(){ CL.go(MGMT_FICHE.retour); },
  mgmtFicheDeplacer(dir){
    const m=G&&G.mgmt, line=m&&mgmtFicheLigne(m,MGMT_FICHE.id), f=line&&line.f;
    if(!f) return;
    const n=mgmtFightHistory(m,f).length;
    if(n<1) return;
    MGMT_FICHE.cursor=(MGMT_FICHE.cursor+dir+n)%n;
    render();
  },
  mgmtFicheRevoirSelection(){
    const m=G&&G.mgmt, line=m&&mgmtFicheLigne(m,MGMT_FICHE.id), f=line&&line.f;
    if(!f) return;
    const history=mgmtFightHistory(m,f).slice().reverse();
    const t=history[MGMT_FICHE.cursor];
    if(t) CL.mgmtHistoriqueRevoir(m.hist.indexOf(t));
  },
  mgmtHistoriqueRevoir(i){
    const m=G&&G.mgmt, line=m&&mgmtFicheLigne(m,MGMT_FICHE.id), f=line&&line.f;
    if(!f||!Number.isSafeInteger(i)||i<0||i>=m.hist.length) return;
    const t=m.hist[i];
    if(!mgmtFightHistory(m,f).includes(t)) return;
    const res=mgmtFicheRejeu(t);
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
  /* Lot 5 T1 : case native, même geste à la souris et au clavier (S5).
     Le focus revient sur la case après le retour visible immédiat (S6). */
  mgmtTitle(i,title){
    if(!G||!G.mgmt) return;
    if(mgmtSetTitle(G.mgmt,i,title)) saveMgmt();
    render();
    document.getElementById('mgmt-title-'+i)?.focus();
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
  /* Lot 5 H6 : Continuer ne s'arrête que sur ce que le joueur doit décider —
     une affaire (la première ouverte), la carte principale, sinon le cycle. */
  mgmtContinuer(){
    if(!G||!G.mgmt) return;
    const m=G.mgmt, r=mgmtContinuerRaison(m);
    if(r.raison==='affaire'){
      const a=m.pile.find(x=>x.status==='open');
      if(a){ CL.mgmtOpen(a.id); return; }
    }else if(r.raison==='demande'){
      const d=mgmtDemandesOuvertes(m)[0];
      if(d){ CL.mgmtFiche(d.a); return; }
    }else if(r.raison==='carte'){ CL.mgmtCarte(); return; }
    CL.mgmtNextCycle();
  },
  /* Lot 5 H6 : ton cercle (5) et tes suivis (15), choix du joueur, gardés. */
  mgmtCercle(id){
    if(!G||!G.mgmt) return;
    if(mgmtCercleToggle(G.mgmt,id)){ saveMgmt(); render(); }
  },
  mgmtSuivre(id){
    if(!G||!G.mgmt) return;
    if(mgmtSuiviToggle(G.mgmt,id)){ saveMgmt(); render(); }
  },
  /* Lot 5 H7 : répondre à une demande — promettre ou refuser, un fait chaque fois. */
  mgmtDemande(i,reponse){
    if(!G||!G.mgmt) return;
    if(mgmtRepondreDemande(G.mgmt,Number(i),reponse)){ saveMgmt(); render(); }
  },
  /* Lot 5 H8 : les filtres du vestiaire vivent à l'écran, rien ne se garde. */
  mgmtVestiaireFiltre(cle,valeur){
    const F=MGMT_VESTIAIRE;
    if(cle==='div'||cle==='role') F[cle]=valeur;
    else if(cle==='lien') F.lien=F.lien===valeur?'':valeur;
    else if(cle==='dispo'||cle==='signe') F[cle]=!F[cle];
    F.page=0; render();
  },
  mgmtVestiairePage(delta){ MGMT_VESTIAIRE.page=Math.max(0,MGMT_VESTIAIRE.page+(Number(delta)||0)); render(); },
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
