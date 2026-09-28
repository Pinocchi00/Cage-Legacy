"use strict";
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
    +`<div class="mono mgmt-cycle">Cycle ${esc(m.cycle)} — ${esc(mgmtOpenLabel(mgmtOpenCount(m)))}${mgmtCardLabel(m)?' — '+esc(mgmtCardLabel(m)):''}</div>`
    +`<div class="mgmt-cols">`
    +`<div class="mgmt-col"><div class="eyebrow">Pile d'affaires</div>${pileHtml}</div>`
    +`<div class="mgmt-col"><div class="eyebrow">Échange</div>${talkHtml}</div>`
    +`<div class="mgmt-col"><div class="eyebrow">Dossier</div>${fileHtml}`
    +`<div class="eyebrow mt">Mémoire</div>${memHtml}</div>`
    +`</div></div>`;
}
