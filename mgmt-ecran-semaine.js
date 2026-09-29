"use strict";
/* ==== [ANCRE: MGMT_LOT4_T2_SEMAINE] — Lot 4 T2 : la carte principale
   ouvre la semaine ; le monde et la mémoire sont des lectures dérivées.
   La pile et les paroles existantes restent les seules décisions parlées.
   Aucun texte de la maquette 02 n'est du contenu du jeu. ==== */

/* ==== [ANCRE: MGMT_SEMAINE_LIBELLES_2809] — décisions d'Anthony du
   28/09/2026 : (1) les quatre sites de catégorie de cette écran (carte
   principale posée, effectif, voisinage, invaincu) passent par
   mgmtDivisionLabel (mgmt-ecran-carte.js) — une catégorie féminine
   s'affiche « Poids mouche féminin », et rien n'est stocké ; (2) l'élision
   devant voyelle ou h : « au voisinage de Omar » s'écrit « au voisinage
   d'Omar ». Le texte du monde reste échappé au rendu (esc sur n.text). ==== */
function mgmtElisionDe(nom){
  const base=String(nom||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  return /^[aeiouyh]/.test(base) ? 'd\''+nom : 'de '+nom;
}
/* ==== [FIN ANCRE] ==== */

function mgmtSemaineCarte(m){
  const card=m.card, size=card.sizeMain, booked=card.main.length;
  let slots='';
  for(let i=0;i<size;i++){
    const fight=card.main[i];
    if(!fight){
      slots+=`<button class="mgmt-week-free" onclick="CL.mgmtCarte()">Place libre — booker un combat</button>`;
      continue;
    }
    const a=mgmtFighterById(m,fight.a), b=mgmtFighterById(m,fight.b);
    if(!a||!b) continue;
    const rank=f=>{
      const org=mgmtRankLabel(mgmtDivisionRank(m,f,'organization'));
      const world=mgmtRankLabel(mgmtDivisionRank(m,f,'world'));
      return `Split ${org||'non classé'} · monde ${world||'non classé'}`;
    };
    slots+=`<div class="mgmt-week-fight"><div class="mgmt-week-slot">Combat ${i+1}</div>`
      +`<div class="mgmt-week-names">${esc(a.name)} <span>contre</span> ${esc(b.name)}</div>`
      +`<div class="mgmt-week-meta">${esc(mgmtDivisionLabel(a.div))} · ${esc(rank(a))} contre ${esc(rank(b))}</div></div>`;
  }
  return `<section class="mgmt-week-card"><h3>Carte principale</h3>`
    +`<p>${esc(booked)} combat${booked===1?'':'s'} booké${booked===1?'':'s'} sur ${esc(size)} · ${esc(size-booked)} place${size-booked===1?'':'s'} libre${size-booked===1?'':'s'}</p>`
    +slots+`<button class="mgmt-week-book" onclick="CL.mgmtCarte()">${booked<size?'Booker un combat':'Voir la carte principale'}</button></section>`;
}

/* Les seules nouvelles du monde sont celles qui peuvent orienter un choix :
   adversaire extérieur proche au classement (fiche consultable), effectif
   disponible limité, invaincu extérieur dans une catégorie de Split, ou
   combattant de Split sans combat récent. Pas de voix ni de recrutement fictif. */
function mgmtSemaineMonde(m){
  const news=[], used=new Set(), divisions=new Set(), types=new Map();
  const add=(type,div,text,id)=>{
    if(news.length>=5||divisions.has(div)||(types.get(type)||0)>=2) return false;
    news.push({type,div,text,id});
    divisions.add(div);
    types.set(type,(types.get(type)||0)+1);
    if(id) used.add(id);
    return true;
  };
  const divs=allDivisions().filter(d=>m.roster.some(f=>f.div===d.id&&!mgmtIsRetired(f)));
  for(const div of divs){
    if((types.get('effectif')||0)>=2) break;
    const split=m.roster.filter(f=>f.div===div.id&&!mgmtIsRetired(f));
    const available=split.filter(f=>mgmtAvailable(m,f)&&!mgmtEngaged(m,f));
    if(available.length<2){
      add('effectif',div.id,`${mgmtDivisionLabel(div)} : ${available.length} combattant${available.length===1?'':'s'} de Split disponible${available.length===1?'':'s'} pour la carte principale.`,null);
    }
  }
  /* Un voisin dans le classement mondial a un lien vérifiable avec Split.
     Le vivier extérieur est dérivé, la fiche existe mais aucun contrat ni
     bouton de signature n'est inventé. */
  for(const div of divs){
    if(news.length>=5||(types.get('voisin')||0)>=2) break;
    if(divisions.has(div.id)) continue;
    const ranks=mgmtDivisionRanking(m,div.id,'world');
    for(let i=0;i<ranks.length;i++){
      const row=ranks[i];
      if(!m.roster.some(f=>f.id===row.id&&!mgmtEngaged(m,f))) continue;
      const neighbor=[ranks[i-1],ranks[i+1]].find(x=>x&&m.exterieur.some(e=>e.id===x.id)&&!used.has(x.id));
      if(!neighbor) continue;
      const line=m.exterieur.find(e=>e.id===neighbor.id);
      const trace=mgmtExteriorTrace(line,m.cycle);
      const own=m.roster.find(f=>f.id===row.id);
      if(trace){
        add('voisin',div.id,`${trace.name}, ${mgmtRankLabel(ranks.indexOf(neighbor)+1)} mondial en ${mgmtDivisionLabel(div)}, au voisinage ${mgmtElisionDe(own.name)} (${mgmtRankLabel(i+1)}).`,line.id);
        break;
      }
    }
  }
  for(const div of divs){
    if(news.length>=5||(types.get('invaincu')||0)>=2) break;
    if(divisions.has(div.id)) continue;
    const split=m.roster.filter(f=>f.div===div.id&&!mgmtIsRetired(f));
    if(split.length>=4) continue;
    const line=m.exterieur.find(e=>{
      if(e.div!==div.id||used.has(e.id)||mgmtExteriorRetired(e,m.cycle)) return false;
      const car=mgmtExteriorCareer(e.seed,e.born,m.cycle);
      return car.W>=3&&car.L===0;
    });
    if(!line) continue;
    const trace=mgmtExteriorTrace(line,m.cycle);
    if(trace){
      add('invaincu',div.id,`${mgmtDivisionLabel(div)} : ${split.length} combattants chez Split ; ${trace.name}, ${trace.pro.W}-${trace.pro.L} hors de Split.`,line.id);
    }
  }
  for(const f of m.roster){
    if(news.length>=5||(types.get('inactivite')||0)>=2) break;
    if(divisions.has(f.div)||mgmtIsRetired(f)||mgmtEngaged(m,f)
      ||!Number.isSafeInteger(f.lastCycle)||m.cycle-f.lastCycle<3) continue;
    add('inactivite',f.div,`${f.name} : dernier combat sous Split il y a ${m.cycle-f.lastCycle} cycles.`,f.id);
  }
  const sources={effectif:'Effectif Split',voisin:'Classement mondial',invaincu:'Monde extérieur',inactivite:'Activité Split'};
  return news.map(n=>`<article class="mgmt-week-news" data-type="${n.type}" data-division="${esc(n.div)}">`
    +`<span class="mgmt-week-source">${sources[n.type]}</span><p>${esc(n.text)}</p>`
    +(n.id?`<button onclick="CL.mgmtFiche('${esc(n.id)}')">Voir la fiche</button>`:'')+`</article>`).join('');
}

/* Quatre rangs du classement mondial, autour d'un combat posé quand il y
   en a un. Sinon la catégorie la plus représentée chez Split. */
function mgmtSemaineClassement(m){
  const first=m.card.main[0], fighter=first&&mgmtFighterById(m,first.a);
  const counts=new Map();
  m.roster.filter(f=>!mgmtIsRetired(f)).forEach(f=>counts.set(f.div,(counts.get(f.div)||0)+1));
  const div=fighter?fighter.div:[...counts].sort((a,b)=>b[1]-a[1])[0]?.[0];
  if(!div) return '';
  const ranks=mgmtDivisionRanking(m,div,'world');
  const center=fighter?ranks.findIndex(r=>r.id===fighter.id):-1;
  const start=center<0?0:Math.max(0,Math.min(center-1,ranks.length-4));
  const rows=ranks.slice(start,start+4).map((r,i)=>{
    const own=m.roster.find(f=>f.id===r.id);
    const ext=!own&&m.exterieur.find(f=>f.id===r.id);
    const trace=ext&&mgmtExteriorTrace(ext,m.cycle);
    const name=own?own.name:trace?trace.name:r.name;
    const org=own?'Split':trace&&trace.orgs.length?trace.orgs[trace.orgs.length-1].name:'';
    return `<div class="mgmt-week-rank"><span>${esc(start+i+1)} &nbsp;${esc(name||'')}</span><span>${esc(org)}</span></div>`;
  }).join('');
  return `<section class="mgmt-week-ranking"><h3>${esc(mgmtDivisionLabel(div))}</h3>${rows}`
    +(SCREENS.mgmt_classements?`<button class="mgmt-week-link" onclick="CL.go('mgmt_classements')">Tous les classements</button>`:'')
    +`</section>`;
}

/* QO-9 : aucun fait n'est effacé. Chaque catégorie montre dix faits récents,
   puis range le reste dans un details natif (souris et clavier). Le tri reste
   du cycle le plus récent au plus ancien, sans score de relation ni voix. */
function mgmtSemaineMemoire(m){
  const groups=[
    {title:'Cartes et décisions',k:['booked','refused','ignored','reaction_seen','crushed','swapped']},
    {title:'Corps et carrières',k:['susp','injury','retired']}
  ];
  const name=id=>{
    const f=mgmtFighterById(m,id);
    if(f) return f.name;
    const line=m.exterieur.find(e=>e.id===id);
    return line?mgmtExteriorTrace(line,m.cycle).name:'Combattant';
  };
  const labels={booked:'Combat booké',refused:'Combat refusé',ignored:'Affaire ignorée',
    reaction_seen:'Réaction reçue',crushed:'Carte préliminaire écartée',swapped:'Combat échangé',
    susp:'Suspension',injury:'Blessure',retired:'Retraite'};
  return groups.map(group=>{
    const facts=m.facts.map((f,i)=>({f,i})).filter(x=>x.f&&group.k.includes(x.f.k))
      .sort((x,y)=>(y.f.c-x.f.c)||(y.i-x.i));
    if(!facts.length) return '';
    const factHtml=({f})=>`<div class="mgmt-week-fact">Cycle ${esc(f.c)} · ${esc(labels[f.k])}`
      +(f.a?` · ${esc(name(f.a))}`:'')+(f.b?` / ${esc(name(f.b))}`:'')
      +(f.na?` → ${esc(name(f.na))} / ${esc(name(f.nb))}`:'')+`</div>`;
    const recent=facts.slice(0,10).map(factHtml).join('');
    const older=facts.length>10
      ?`<details class="mgmt-week-older"><summary>Tous les ${facts.length} faits</summary>`
        +facts.slice(10).map(factHtml).join('')+`</details>`:'';
    return `<details class="mgmt-week-memory" open>`
      +`<summary>${esc(group.title)} · ${facts.length} fait${facts.length===1?'':'s'}</summary>`
      +recent+older+`</details>`;
  }).join('');
}

function scr_mgmt_bureau(){
  if(!G||!G.mgmt){
    return `<div class="scr center intro"><div class="eyebrow gold">Split — Management</div>`
      +`<h2 class="disp">La semaine</h2><p class="lede">Le bureau n'est pas ouvert.</p>`
      +`<button class="btn primary mt" onclick="CL.mgmtEnter()">Ouvrir le bureau</button></div>`;
  }
  const m=G.mgmt, open=m.pile.filter(a=>a.status==='open');
  const sel=m.open?m.pile.find(a=>a.id===m.open):null;
  const selOpen=sel&&sel.status==='open'?sel:null;
  let pileHtml=open.map(a=>{
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
  if(mgmtOpenCount(m)===0&&!mgmtMainPosable(m)){
    pileHtml+=`<button class="mgmt-next" onclick="CL.mgmtNextCycle()">Cycle suivant</button>`;
  }

  let talkHtml;
  if(!selOpen){
    talkHtml=mgmtMainPosable(m)
      ?`<p class="mgmt-week-instruction">La pile est vide. Il reste des places en carte principale : choisissez deux combattants de la même catégorie.</p>`
        +`<button class="mgmt-week-book" onclick="CL.mgmtCarte()">Composer la carte principale</button>`
      :`<p class="mgmt-week-instruction">La pile est vide.</p>`;
  }else{
    const ex=MGMT_EXCHANGES[selOpen.exchange];
    const spk=MGMT_SPEAKERS[selOpen.speaker]||{name:'?',role:''};
    const lines=(ex?ex.lines:[]).filter(t=>typeof t==='string').map(t=>`<div class="mgmt-say">${esc(t)}</div>`).join('');
    const btns=mgmtVisibleReplies(m,selOpen).map(r=>{
      const label=r.text||MGMT_ACTION_LABELS[r.action];
      const go=r.action==='__ignore'
        ?`CL.mgmtIgnore('${selOpen.id}')`:`CL.mgmtReply('${selOpen.id}','${r.id}')`;
      return `<button class="mgmt-rep" onclick="${go}">${esc(label)}</button>`;
    }).join('');
    talkHtml=selOpen.kind==='leila_bulk'
      ?mgmtBulkTalkHtml(m,selOpen,ex,spk,btns,lines)
      :`<div class="mgmt-spk">${esc(spk.name)}</div><div class="mgmt-role">${esc(spk.role)}</div>`
        +lines+`<div class="mgmt-reps">${btns}</div>`;
  }
  let fileHtml='';
  if(sel&&sel.kind==='leila_bulk'&&Array.isArray(sel.fights)&&sel.fights.length){
    const fi=(Number.isSafeInteger(sel.marked)&&sel.marked>=0&&sel.marked<sel.fights.length)?sel.marked:0;
    fileHtml=mgmtBureauFicheCard(m,mgmtFighterById(m,sel.fights[fi].a))
      +mgmtBureauFicheCard(m,mgmtFighterById(m,sel.fights[fi].b));
  }else if(sel){
    fileHtml=mgmtBureauFicheCard(m,mgmtFighterById(m,sel.a))
      +mgmtBureauFicheCard(m,mgmtFighterById(m,sel.b));
  }
  const roster=m.roster.filter(f=>!mgmtIsRetired(f)).length;
  return `<div class="scr mgmt-wrap mgmt-week"><div class="mgmt-head bar">`
    +`<div><h2 class="disp">La semaine</h2></div>`
    +`<span class="mgmt-week-event">Split ${esc(m.eventsPlayed+1)}</span></div>`
    +`<div class="mono mgmt-cycle">Cycle ${esc(m.cycle)} — ${esc(mgmtOpenLabel(open.length))}`
    +` — ${esc(mgmtCardLabel(m))}</div>`
    +`<div class="mgmt-cols mgmt-week-cols">`
    +`<section class="mgmt-week-pane mgmt-week-left">${mgmtSemaineCarte(m)}`
    +`<div class="mgmt-week-talk"><h3>${selOpen&&selOpen.speaker==='leila'?'Leïla':'Échange'}</h3>${talkHtml}</div>`
    +`<div class="mgmt-week-affairs"><h3>Affaires · ${open.length}</h3>${pileHtml}</div>`
    +(fileHtml?`<details class="mgmt-week-dossier"><summary>Dossier</summary>${fileHtml}</details>`:'')+`</section>`
    +`<section class="mgmt-week-pane"><h3>Le monde autour de Split</h3>${mgmtSemaineMonde(m)}`
    +`<details class="mgmt-week-memo"><summary>Mémoire · ${m.facts.length} faits</summary>${mgmtSemaineMemoire(m)}</details></section>`
    +`<aside class="mgmt-week-pane">${mgmtSemaineClassement(m)}`
    +`<section class="mgmt-week-organisation"><h3>L'organisation</h3>`
    +`<p>${esc(roster)} combattants · trésorerie ${esc(m.treasury)} k$</p>`
    +`<button class="mgmt-week-link" onclick="CL.go('mgmt_organisation')">Voir l'organisation</button></section></aside>`
    +`</div></div>`;
}
/* ==== [FIN ANCRE] ==== */
