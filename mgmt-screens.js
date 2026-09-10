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
const MGMT_KIND_LABELS={leila_propose:'Leïla propose un combat',leila_react:'Leïla réagit'};
const MGMT_DECISION_LABELS={accepted:'booké',refused:'refusé',ignored:'ignorée',noted:'notée'};
const MGMT_ACTION_LABELS={accept:'Accepter le combat',refuse:'Refuser',close:'Fermer'};
const MGMT_FACT_LABELS={booked:'Combat booké',refused:'Proposition refusée',ignored:'Affaire ignorée',reaction_seen:'Réaction de Leïla notée'};
const MGMT_LEVEL_LABELS={1:'Nom',2:'Dossier',3:'Attaché'};

function mgmtLineCard(f){
  if(!f) return '';
  const rec=esc(f.W)+'-'+esc(f.L)+'-'+esc(f.D);
  let h=`<div class="opp-top"><span class="opp-nm">${esc(f.name)}</span>`
    +`<span class="opp-rec">${rec}</span></div>`
    +`<div class="opp-mid">${esc(f.age)} ans · ${esc(f.divName)} · ${esc(f.org)}</div>`
    +`<div class="dlts"><span class="dlt">${esc(MGMT_LEVEL_LABELS[f.level]||'Nom')}</span></div>`;
  if(f.level>=2&&f.raison){
    const r=MGMT_RAISONS.find(x=>x.id===f.raison);
    if(r) h+=`<div class="story">Raison de se battre — <b>${esc(r.label)}</b></div>`
      +`<div class="story muted">« ${esc(r.text)} »</div>`;
  }
  return h;
}

function mgmtFactLine(m,f){
  const a=mgmtFighterById(m,f.a), b=mgmtFighterById(m,f.b);
  const lbl=MGMT_FACT_LABELS[f.k]||'Fait';
  const vs=(a&&b)?` — ${esc(a.name)} contre ${esc(b.name)}`:'';
  return `<div class="log-row"><span class="log-r">C${esc(f.c)}</span><span>${esc(lbl)}${vs}</span></div>`;
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
  const closed=m.pile.filter(a=>a.status!=='open');
  const sel=m.open?m.pile.find(a=>a.id===m.open):null;
  const selOpen=sel&&sel.status==='open'?sel:null;

  let pileHtml=open.map(a=>{
    const on=m.open===a.id?' style="border-color:var(--gold)"':'';
    return `<div class="opp mgmt-aff"${on} onclick="CL.mgmtOpen('${a.id}')">`
      +`<span class="opp-nm">${esc(a.title||'')}</span>`
      +`<div class="opp-mid">${esc(mgmtAffairSubject(m,a))}</div></div>`;
  }).join('');
  pileHtml+=closed.map(a=>{
    return `<div class="opp mgmt-aff" style="opacity:.45;cursor:default">`
      +`<span class="opp-nm">${esc(a.title||'')}</span>`
      +`<div class="opp-mid">${esc(mgmtAffairSubject(m,a))} — ${esc(MGMT_DECISION_LABELS[a.decision]||'traitée')}</div></div>`;
  }).join('');
  if(mgmtOpenCount(m)===0){
    pileHtml+=`<button class="btn gold mt" onclick="CL.mgmtNewCycle()">Ouvrir un nouveau cycle</button>`;
  }

  let talkHtml;
  if(!selOpen){
    talkHtml=`<p class="lede">Sélectionne une affaire dans la pile.</p>`;
  }else{
    const ex=MGMT_EXCHANGES[selOpen.exchange];
    const spk=MGMT_SPEAKERS[selOpen.speaker]||{name:'?',role:''};
    const lines=(ex?ex.lines:[]).map(t=>`<div class="mgmt-say">${esc(t)}</div>`).join('');
    /* Réponses : la réplique écrite quand elle existe (choses que le joueur
       dirait, textes d'auteur), le libellé d'interface neutre en repli quand
       l'emplacement est encore vide — jamais de réplique générique. */
    let btns=(ex?ex.replies:[])
      .filter(r=>MGMT_ACTION_LABELS[r.action])
      .map(r=>{
        const label=r.text||MGMT_ACTION_LABELS[r.action];
        return `<button class="btn mt" onclick="CL.mgmtReply('${selOpen.id}','${r.id}')">${esc(label)}</button>`;
      })
      .join('');
    if(selOpen.kind==='leila_propose'){
      btns+=`<button class="btn ghost mt" onclick="CL.mgmtIgnore('${selOpen.id}')">Ignorer l'affaire</button>`;
    }
    talkHtml=`<div class="eyebrow gold">${esc(spk.name)} — ${esc(spk.role)}</div>`
      +`<div class="mgmt-kind mono small muted">${esc(MGMT_KIND_LABELS[selOpen.kind]||selOpen.kind)}</div>`
      +lines+btns;
  }

  let fileHtml;
  if(!sel){
    fileHtml=`<p class="lede small">Roster de Split : ${esc(m.roster.length)} noms.`
      +` Dossiers : ${esc(m.roster.filter(o=>o.level>=2).length)}.`
      +` Attachés : ${esc(m.roster.filter(o=>o.level>=3).length)}.</p>`;
  }else{
    const fa=mgmtFighterById(m,sel.a), fb=mgmtFighterById(m,sel.b);
    fileHtml=`<div class="opp" style="cursor:default">${mgmtLineCard(fa)}</div>`
      +`<div class="opp" style="cursor:default">${mgmtLineCard(fb)}</div>`;
  }
  const facts=m.facts.slice().reverse()
    .map(f=>mgmtFactLine(m,f)).join('')||'<p class="lede small">Rien de mémorisé pour l’instant.</p>';

  return `<div class="scr mgmt-wrap"><div class="mgmt-head bar">`
    +`<div><div class="eyebrow gold">Split — Management</div>`
    +`<h2 class="disp">Le bureau</h2></div>`
    +`<button class="btn ghost" style="width:auto;padding:10px 16px" onclick="CL.mgmtLeave()">← Retour au titre</button></div>`
    +`<div class="mono small muted">Cycle ${esc(m.cycle)} — ${esc(mgmtOpenCount(m))} affaire(s) ouverte(s)</div>`
    +`<div class="mgmt-cols">`
    +`<div class="mgmt-col"><div class="eyebrow">Pile d'affaires</div>${pileHtml}</div>`
    +`<div class="mgmt-col"><div class="eyebrow">Échange</div>${talkHtml}</div>`
    +`<div class="mgmt-col"><div class="eyebrow">Dossier</div>${fileHtml}`
    +`<div class="eyebrow mt">Mémoire</div><div class="fight-log">${facts}</div></div>`
    +`</div></div>`;
}

/* ==== [ANCRE: MGMT_LOT1_CONTROLEUR] — actions du bureau : jamais d'édition
   directe de ui-08, extension via Object.assign (motif ui-10-duel.js). ==== */
Object.assign(SCREENS,{mgmt_bureau:scr_mgmt_bureau});

Object.assign(CL,{
  mgmtEnter(){
    if(!G) G={theme:'dark'};
    try{ const app=document.getElementById('app'); if(app&&app.classList) app.classList.add('mgmt'); }catch(e){}
    if(!G.mgmt){
      G.mgmt=mgmtDefault();
      if(!loadMgmt()){ mgmtNewRoster(G.mgmt); mgmtNewPile(G.mgmt); saveMgmt(); }
    }
    CL.go('mgmt_bureau');
  },
  mgmtLeave(){
    try{ const app=document.getElementById('app'); if(app&&app.classList) app.classList.remove('mgmt'); }catch(e){}
    CL.go('title');
  },
  mgmtOpen(id){
    if(!G||!G.mgmt) return;
    G.mgmt.open=id;
    render();
  },
  mgmtReply(affairId,replyId){
    if(!G||!G.mgmt) return;
    if(mgmtDecide(G.mgmt,affairId,replyId)) saveMgmt();
    render();
  },
  mgmtIgnore(affairId){
    if(!G||!G.mgmt) return;
    if(mgmtIgnore(G.mgmt,affairId)) saveMgmt();
    render();
  },
  mgmtNewCycle(){
    if(!G||!G.mgmt) return;
    mgmtNewPile(G.mgmt);
    saveMgmt();
    render();
  },
});
/* ==== [FIN ANCRE] ==== */
