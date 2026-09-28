"use strict";
/* ==== [ANCRE: MGMT_LOT4_T2_SEMAINE] — Lot 4 T2 : la carte principale
   ouvre la semaine ; le monde et la mémoire sont des lectures dérivées.
   La pile et les paroles existantes restent les seules décisions parlées.
   Aucun texte de la maquette 02 n'est du contenu du jeu. ==== */

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
      +`<div class="mgmt-week-meta">${esc(a.divName)} · ${esc(rank(a))} contre ${esc(rank(b))}</div></div>`;
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
      add('effectif',div.id,`${div.name} : ${available.length} combattant${available.length===1?'':'s'} de Split disponible${available.length===1?'':'s'} pour la carte principale.`,null);
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
        add('voisin',div.id,`${trace.name}, ${mgmtRankLabel(ranks.indexOf(neighbor)+1)} mondial en ${div.name}, au voisinage de ${own.name} (${mgmtRankLabel(i+1)}).`,line.id);
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
      add('invaincu',div.id,`${div.name} : ${split.length} combattants chez Split ; ${trace.name}, ${trace.pro.W}-${trace.pro.L} hors de Split.`,line.id);
    }
  }
  for(const f of m.roster){
    if(news.length>=5||(types.get('inactivite')||0)>=2) break;
    if(divisions.has(f.div)||mgmtIsRetired(f)||mgmtEngaged(m,f)
      ||!Number.isSafeInteger(f.lastCycle)||m.cycle-f.lastCycle<3) continue;
    add('inactivite',f.div,`${f.name} : dernier combat sous Split il y a ${m.cycle-f.lastCycle} cycles.`,f.id);
  }
  return news.map(n=>`<div class="mgmt-week-news" data-type="${n.type}" data-division="${esc(n.div)}">${esc(n.text)}`
    +(n.id?` <button onclick="CL.mgmtFiche('${esc(n.id)}')">Voir la fiche</button>`:'')+`</div>`).join('');
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
  return `<div class="scr mgmt-wrap mgmt-week"><div class="mgmt-head bar">`
    +`<div><div class="eyebrow gold">Split — Management</div><h2 class="disp">La semaine</h2></div>`
    +`<button class="btn ghost" style="width:auto;padding:10px 16px" onclick="CL.mgmtLeave()">← Retour au titre</button></div>`
    +`<div class="mono mgmt-cycle">Cycle ${esc(m.cycle)} — ${esc(mgmtOpenLabel(open.length))}`
    +` — ${esc(mgmtCardLabel(m))}</div>`
    +`<div class="mgmt-cols mgmt-week-cols">`
    +`<section class="mgmt-week-pane">${mgmtSemaineCarte(m)}</section>`
    +`<section class="mgmt-week-pane"><h3>Affaires · ${open.length}</h3>${pileHtml}`
    +`<div class="mgmt-week-talk"><h3>Échange</h3>${talkHtml}</div></section>`
    +`<aside class="mgmt-week-pane"><h3>Le monde autour de Split</h3>${mgmtSemaineMonde(m)}`
    +(fileHtml?`<div class="mgmt-week-dossier"><h3>Dossier</h3>${fileHtml}</div>`:'')
    +`<div class="mgmt-week-memo"><h3>Mémoire · ${m.facts.length} faits</h3>${mgmtSemaineMemoire(m)}</div></aside>`
    +`</div></div>`;
}
/* ==== [FIN ANCRE] ==== */
