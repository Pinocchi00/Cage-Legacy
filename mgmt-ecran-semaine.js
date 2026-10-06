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
       const org=mgmtRankLabel(mgmtDivisionRank(m,f,'organization'),f.div);
       const world=mgmtRankLabel(mgmtDivisionRank(m,f,'world'),f.div);
      const adj=divById(f.div)?.gender==='F'?'mondiale':'mondial';
      return `${mgmtOrgNom(m)} ${org||'non classé'} · ${world?world+' '+adj:'monde non classé'}`;
    };
    slots+=`<div class="mgmt-week-fight"><div class="mgmt-week-slot">Combat ${i+1}</div>`
      +`<div class="mgmt-week-names">${esc(a.name)} <span>contre</span> ${esc(b.name)}</div>`
      +`<div class="mgmt-week-meta">${esc(mgmtDivisionLabel(a.div))} · ${esc(rank(a))} contre ${esc(rank(b))}</div></div>`;
  }
  return `<section class="mgmt-week-card"><h3>Carte principale</h3>`
    +`<p>${esc(booked)} combat${booked===1?'':'s'} booké${booked===1?'':'s'} sur ${esc(size)} · ${esc(size-booked)} place${size-booked===1?'':'s'} libre${size-booked===1?'':'s'}</p>`
    +slots+`</section>`;
}

/* Les seules nouvelles du monde sont celles qui peuvent orienter un choix :
   adversaire extérieur proche au classement (fiche consultable), effectif
   disponible limité, invaincu extérieur dans une catégorie de Split, ou
   combattant de Split sans combat récent. Pas de voix ni de recrutement fictif. */
function mgmtSemaineMonde(m){
  const news=[], used=new Set(), divisions=new Set(), types=new Map();
  /* Lot 5 H6 : le conteur. Les moments de la semaine passent d'abord (ton
     cercle, tes suivis, puis le vestiaire), dans le budget de trois à cinq
     informations ; les nouvelles du monde remplissent le reste. */
  const budget=mgmtConteurBudget(m);
  /* Lot 5 H7 : une demande en attente est une décision — elle passe avant les moments. */
  if(typeof mgmtDemandesOuvertes==='function'){
    for(const d of mgmtDemandesOuvertes(m).slice(0,2)){
      const f=mgmtFighterById(m,d.a), cible=d.target?mgmtFighterById(m,d.target):null;
      news.push({type:'demande',div:f.div,text:f.name+' demande : '+MGMT_DEMANDES[d.want].libelle.toLowerCase()+(cible?' — '+cible.name:''),id:f.id,source:'Demande'});
      used.add(f.id);
    }
  }
  /* Lot 5 T5 : une recrue de la semaine se raconte (une seule). */
  if(typeof mgmtRecruesLignes==='function'&&news.length<budget-1){
    const r=mgmtRecruesLignes(m)[0];
    if(r){ news.push({type:'recrue',div:r.div,text:r.text,id:r.id,source:'Recrutement'}); used.add(r.id); }
  }
  /* Lot 5 H10 : une rivalité ou une trilogie née du dernier combat se raconte (une seule). */
  if(typeof mgmtRivalitesLignes==='function'&&news.length<budget-1){
    const r=mgmtRivalitesLignes(m)[0];
    if(r){ const f=mgmtFighterById(m,r.id); news.push({type:'rivalite',div:f.div,text:r.text,id:r.id,source:'Rivalité'}); used.add(r.id); }
  }
  /* Lot 5 T2 + T3 : « Ce qui se dit » — la réplique de SA voix, celle du document (une seule, dans le budget). */
  if(typeof mgmtParolesDeLaSemaine==='function'&&news.length<budget-1){
    const p=mgmtParolesDeLaSemaine(m)[0];
    if(p){ news.push({type:'parole',div:p.div,text:mgmtParoleLigne(p),id:p.id,source:'Ce qui se dit'}); used.add(p.id); }
  }
  /* Lot 5 T3 : la presse (document des voix §6) — une ligne de média, dans le budget. */
  if(typeof mgmtMediasLignes==='function'&&news.length<budget-1){
    const p=mgmtMediasLignes(m)[0];
    if(p){ news.push({type:'presse',div:p.div,text:p.texte,id:p.id,source:p.nom}); used.add(p.id); }
  }
  for(const c of mgmtConteur(m)){
    if(news.length>=budget) break; /* le budget de la semaine tient, demandes comprises */
    news.push({type:'vie',div:c.div,text:c.name+' : '+c.moment.libelle,id:c.id,source:c.moment.relais[0]});
    used.add(c.id);
  }
  const add=(type,div,text,id)=>{
    if(news.length>=budget||divisions.has(div)||(types.get(type)||0)>=2) return false;
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
      add('effectif',div.id,`${mgmtDivisionLabel(div)} : ${available.length} combattant${available.length===1?'':'s'} de ${mgmtOrgNom(m)} disponible${available.length===1?'':'s'} pour la carte principale.`,null);
    }
  }
  /* Un voisin dans le classement mondial a un lien vérifiable avec Split.
     Le vivier extérieur est dérivé, la fiche existe mais aucun contrat ni
     bouton de signature n'est inventé. */
  for(const div of divs){
    if(news.length>=budget||(types.get('voisin')||0)>=2) break;
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
         add('voisin',div.id,`${trace.name}, ${mgmtRankLabel(ranks.indexOf(neighbor)+1,div)} mondial${div.gender==='F'?'e':''} en ${mgmtDivisionLabel(div)}, au voisinage ${mgmtElisionDe(own.name)} (${mgmtRankLabel(i+1,div)}).`,line.id);
        break;
      }
    }
  }
  for(const div of divs){
    if(news.length>=budget||(types.get('invaincu')||0)>=2) break;
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
      add('invaincu',div.id,`${mgmtDivisionLabel(div)} : ${split.length} combattants chez ${mgmtOrgNom(m)} ; ${trace.name}, ${trace.pro.W}-${trace.pro.L} hors de ${mgmtOrgNom(m)}.`,line.id);
    }
  }
  for(const f of m.roster){
    if(news.length>=budget||(types.get('inactivite')||0)>=2) break;
    if(divisions.has(f.div)||mgmtIsRetired(f)||mgmtEngaged(m,f)
      ||!Number.isSafeInteger(f.lastCycle)||m.cycle-f.lastCycle<3) continue;
    add('inactivite',f.div,`${f.name} : dernier combat sous ${mgmtOrgNom(m)} il y a ${m.cycle-f.lastCycle} cycles.`,f.id);
  }
  const sources={effectif:'Effectif '+mgmtOrgNom(m),voisin:'Classement mondial',invaincu:'Monde extérieur',inactivite:'Activité '+mgmtOrgNom(m),vie:'Vie',demande:'Demande',rivalite:'Rivalité',parole:'Ce qui se dit',recrue:'Recrutement'};
  return news.map(n=>`<article class="mgmt-week-news" data-type="${n.type}" data-division="${esc(n.div)}">`
    +`<span class="mgmt-week-source">${esc(n.source||sources[n.type])}</span><p>${esc(n.text)}</p>`
    +(n.id?`<button onclick="CL.mgmtFiche('${esc(n.id)}')">Voir la fiche</button>`:'')+`</article>`).join('');
}

/* Quatre rangs du classement mondial autour des combattants de Split.
   Quand un combat est posé, ses deux hommes passent en priorité ; sinon le
   groupe Split le plus dense dans la catégorie choisie guide la fenêtre. */
function mgmtSemaineClassement(m){
  const first=m.card.main[0], fighter=first&&mgmtFighterById(m,first.a);
  const counts=new Map();
  m.roster.filter(f=>!mgmtIsRetired(f)).forEach(f=>counts.set(f.div,(counts.get(f.div)||0)+1));
  const div=fighter?fighter.div:[...counts].sort((a,b)=>b[1]-a[1])[0]?.[0];
  if(!div) return '';
  const ranks=mgmtDivisionRanking(m,div,'world');
  const ownIds=new Set(m.roster.filter(f=>f.div===div&&!mgmtIsRetired(f)).map(f=>f.id));
  const bookedIds=new Set(first?[first.a,first.b]:[]);
  let start=0, best=-1;
  for(let s=0;s<=Math.max(0,ranks.length-4);s++){
    const window=ranks.slice(s,s+4);
    const booked=window.filter(r=>bookedIds.has(r.id)).length;
    const own=window.filter(r=>ownIds.has(r.id)).length;
    const lead=first&&window.some(r=>r.id===first.a)?1:0;
    const score=booked*100+lead*10+own;
    if(score>best){ best=score;start=s; }
  }
  const rows=ranks.slice(start,start+4).map((r,i)=>{
    const own=m.roster.find(f=>f.id===r.id);
    const ext=!own&&m.exterieur.find(f=>f.id===r.id);
    const trace=ext&&mgmtExteriorTrace(ext,m.cycle);
    const name=own?own.name:trace?trace.name:r.name;
    const org=own?mgmtOrgNom(m):trace&&trace.orgs.length?trace.orgs[trace.orgs.length-1].name:'';
    return `<div class="mgmt-week-rank${own?' split':''}"><span>${esc(start+i+1)} &nbsp;${esc(name||'')}</span><span>${esc(org)}</span></div>`;
  }).join('');
  return `<section class="mgmt-week-ranking"><h3>${esc(mgmtDivisionLabel(div))}</h3>${rows}`
    +(SCREENS.mgmt_classements?`<button class="mgmt-week-link" onclick="CL.go('mgmt_classements')">Tous les classements</button>`:'')
    +`</section>`;
}

const MGMT_WEEK_MEMORY_GROUPS=[
  {title:'Cartes et décisions',k:['booked','refused','ignored','reaction_seen','crushed','swapped','title_fight']},
  {title:'Corps et carrières',k:['susp','injury','retired']}
];

/* ==== [ANCRE: MGMT_LOT5_T1_SEMAINE_MEMOIRE] — Reprise T1 : compteur et
   rendu lisent les mêmes lignes. Les attributions initiales restent des
   faits stockés du monde, hors de la Mémoire du joueur. Les titres joués
   se racontent par leurs seuls libellés factuels et les deux noms. ==== */
function mgmtSemaineMemoireRows(m){
  const titles=mgmtTitleMemoryRows(m);
  const kinds=MGMT_WEEK_MEMORY_GROUPS.flatMap(g=>g.k);
  const labels={booked:'Combat booké',refused:'Combat refusé',ignored:'Affaire ignorée',
    reaction_seen:'Réaction reçue',crushed:'Carte préliminaire écartée',swapped:'Combat échangé',
    susp:'Suspension',injury:'Blessure',retired:'Retraite'};
  const name=id=>{
    if(!id) return null;
    const f=mgmtFighterById(m,id);
    if(f) return f.name;
    const line=(m.exterieur||[]).find(e=>e.id===id);
    return line?mgmtExteriorTrace(line,m.cycle).name:'Combattant';
  };
  return (m.facts||[]).map((f,i)=>({f,i})).filter(x=>x.f&&kinds.includes(x.f.k))
    .map(({f,i})=>{
      if(f.k==='title_fight'){
        const title=titles.get(f);
        return title?{f,i,...title}:null;
      }
      return {f,i,label:labels[f.k],a:name(f.a),b:name(f.b),na:name(f.na),nb:name(f.nb)};
    }).filter(Boolean);
}
/* ==== [FIN ANCRE] ==== */

/* QO-9 : aucun fait n'est effacé. Chaque catégorie montre dix faits récents,
   puis range le reste dans un details natif (souris et clavier). Le tri reste
   du cycle le plus récent au plus ancien, sans score de relation ni voix. */
function mgmtSemaineMemoire(m,rows=mgmtSemaineMemoireRows(m)){
  return MGMT_WEEK_MEMORY_GROUPS.map(group=>{
    const facts=rows.filter(x=>group.k.includes(x.f.k))
      .sort((x,y)=>(y.f.c-x.f.c)||(y.i-x.i));
    if(!facts.length) return '';
    const factHtml=({f,label,a,b,na,nb})=>`<div class="mgmt-week-fact">Cycle ${esc(f.c)} · ${esc(label)}`
      +(a?` · ${esc(a)}`:'')+(b?` / ${esc(b)}`:'')
      +(na?` → ${esc(na)} / ${esc(nb)}`:'')+`</div>`;
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
    return `<div class="scr center intro"><div class="eyebrow gold">${esc(mgmtOrgNom(G&&G.mgmt))} — Management</div>`
      +`<h2 class="disp">La semaine</h2><p class="lede">Le bureau n'est pas ouvert.</p>`
      +`<button class="btn primary mt" onclick="CL.mgmtEnter(MGMT_SLOT)">Ouvrir le bureau</button></div>`;
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
  /* Lot 5 H6 : Continuer fait avancer le temps et ne s'arrête que sur ce que
     le joueur doit décider ; son libellé dit sur quoi. */
  const suite=mgmtContinuerRaison(m);
  pileHtml+=`<button class="mgmt-next" data-raison="${esc(suite.raison)}" onclick="CL.mgmtContinuer()">${esc(suite.libelle)}</button>`;

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
  const memory=mgmtSemaineMemoireRows(m);
  return `<div class="scr mgmt-wrap mgmt-week"><div class="mgmt-head bar">`
    +`<div><h2 class="disp">La semaine</h2></div>`
    +`<span class="mgmt-week-event">${esc(mgmtOrgNom(m))} ${esc(m.eventsPlayed+1)}</span></div>`
    +`<div class="mono mgmt-cycle">Cycle ${esc(m.cycle)} — ${esc(mgmtOpenLabel(open.length))}`
    +` — ${esc(mgmtCardLabel(m))}</div>`
    +`<div class="mgmt-cols mgmt-week-cols">`
    +`<section class="mgmt-week-pane mgmt-week-left">${typeof mgmtRetraitHtml==='function'?mgmtRetraitHtml(m):''}${mgmtSemaineCarte(m)}`
    +`<div class="mgmt-week-talk">${selOpen&&selOpen.speaker==='leila'?'':'<h3>Échange</h3>'}${talkHtml}</div>`
    +`<div class="mgmt-week-affairs"><h3>Affaires · ${open.length}</h3>${pileHtml}</div>`
    +(fileHtml?`<details class="mgmt-week-dossier"><summary>Dossier</summary>${fileHtml}</details>`:'')+`</section>`
    +`<section class="mgmt-week-pane"><h3>Le monde autour de ${esc(mgmtOrgNom(m))}</h3>${mgmtSemaineMonde(m)}`
    +`<details class="mgmt-week-memo"><summary>Mémoire · ${esc(memory.length)} fait${memory.length===1?'':'s'}</summary>${mgmtSemaineMemoire(m,memory)}</details></section>`
    +`<aside class="mgmt-week-pane">${mgmtSemaineClassement(m)}`
    +`<section class="mgmt-week-organisation"><h3>L'organisation</h3>`
    +`<p>${esc(roster)} combattants · trésorerie ${esc(m.treasury)} k$</p>`
    +`<button class="mgmt-week-link" onclick="CL.go('mgmt_organisation')">Voir l'organisation</button></section></aside>`
    +`</div>${mgmtMouvementHtml(m)}</div>`;
}
/* ==== [FIN ANCRE] ==== */
