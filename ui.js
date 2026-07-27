"use strict";
/* CAGE LEGACY — js/ui.js
   Logique de jeu (roster, adversaires, entraînement, combat, succès),
   écrans (SCREENS), rendu, arène 2D canvas, et l'objet CL exposé en global.
   Dépend de : data-skills.js, data-content.js, engine.js, state.js. */
/* --------------------------- roster / classement -------------------------- */
function orgLevel(org){ return [38,46,54,61,67,73][org]||40; }
function makeOrgRoster(f){ const base=orgLevel(f.org); const pool=[];
  for(let i=0;i<12;i++){ const lv=clamp(base+RI(-10,14),20,97);
    const o=makeFighter({gender:f.gender,div:f.div,level:lv,potential:lv+RI(2,12),age:RI(22,35)});
    o.W=RI(6,24); o.L=RI(1,8); o.ko=RI(0,o.W); o.streak=RI(-2,6); pool.push(o); }
  const ranked=rankPool(pool);
  if(f.org>=4){ ranked[0].champion=f.org>=5?'monde':'europe'; ranked[0].defenses=RI(0,4); }
  return ranked;
}
function divRank(f){ return rankPool(G.roster.filter(o=>!o.champion).concat([f])).findIndex(o=>o===f)+1; }
function advanceRoster(){ const r=G.roster.filter(o=>!o.champion);
  for(let n=0;n<3;n++){ const a=pick(r),b=pick(r); if(a===b)continue; const res=simulateFight(a,b,3); applyResult(a,b,res,'A'); applyResult(b,a,res,'B'); }
  G.roster=rankPool(G.roster); }

/* --------------------------- 3 adversaires + % ---------------------------- */
function tacticalRead(f,o){ const a=eff(f),b=eff(o);
  if(b.striking>b.ground+12 && b.striking>a.striking) return 'Redoutable debout — amène-le au sol.';
  if(b.takedown>a.tdd+10) return 'Gros lutteur — garde la cage dans le dos, sprawle.';
  if(b.submission>a.guard+12) return 'Dangereux au sol — reste debout, méfie-toi du cou.';
  if(a.overall> o.overall+8) return 'Sur le papier, tu domines. Ne te relâche pas.';
  if(o.overall> f.overall+8) return 'Plus fort que toi. Il te faudra un plan.';
  return 'Combat équilibré — l\u2019intelligence fera la différence.';
}
function genOpponents(f){ const base=orgLevel(f.org); const tiers=[-8,2,12]; // faible / similaire / coriace (non dit)
  return tiers.map(dl=>{ const lv=clamp(base+f.streak*0.4+dl+RI(-4,4),20,97);
    const o=makeFighter({gender:f.gender,div:f.div,level:lv,potential:lv+RI(2,12),age:RI(21,35)});
    o.W=RI(4,22); o.L=RI(0,9); o.ko=RI(0,o.W); o.sub=RI(0,Math.max(0,o.W-o.ko)); o.streak=RI(-2,7);
    const p=winProbEstimate(f,o);
    return {o, wp:Math.round(p*100), read:tacticalRead(f,o)}; });
}


function trainingOptions(f){ const gen=TRAIN.filter(x=>x.t.includes('all'));
  const spec=TRAIN.filter(x=>x.t.includes(f.style));
  const opts=[]; const s=spec.slice(); const g=gen.slice();
  // 2 liées au sport + 1 générale (mélangées)
  for(let i=0;i<2&&s.length;i++) opts.push(s.splice(Math.floor(rnd()*s.length),1)[0]);
  if(g.length) opts.push(g.splice(Math.floor(rnd()*g.length),1)[0]);
  while(opts.length<3 && g.length) opts.push(g.splice(Math.floor(rnd()*g.length),1)[0]);
  return opts.sort(()=>rnd()-0.5);
}

/* ------------------------------- flux ------------------------------------- */
function startFightSelect(){ G.opps=genOpponents(G.f); G.screen='select'; save(); render(); }
function chooseOpponent(i){ G.sel=G.opps[i]; G.train=trainingOptions(G.f); G.screen='camp'; save(); render(); }
function chooseTraining(i){ const opt=G.train[i]; const applied=applyDeltas(G.f,opt.d); G.campApplied={label:opt.label,deltas:applied};
  const kind=fightKind(); const opp=G.sel.o; const rounds=(kind==='title')?5:3;
  G.fight={kind,opp,rounds,wp:G.sel.wp}; resolveFight(); buildTimeline(); G.screen='arena'; save(); render(); }
function fightKind(){ const f=G.f; if(f.champion) return 'defense'; if(f.org>=4 && ((f.orgWins||0)>=3 || divRank(f)<=2)) return 'title'; return 'normal'; }

function resolveFight(){ const {opp,rounds,kind}=G.fight;
  // ==== [ANCRE: META05] — boost temporaire "dernier tour de piste".
  // Le jeu ne connaît que l'âge en années entières (pas de calendrier précis),
  // donc "dernier combat avant la retraite" est approximé par : le combattant
  // est déjà dans sa dernière année avant le seuil de retraite forcée. ====
  let retAgeForLastFight=42; if(G.f.skills&&G.f.skills.includes('meta01')) retAgeForLastFight+=2;
  const isLikelyLastFight=G.f.skills&&G.f.skills.includes('meta05')&&G.f.age>=retAgeForLastFight-1;
  const OFFENSIVE_CHANNELS=['power','handSpeed','kick','explosiveness','killer'];
  const savedAttrs={};
  if(isLikelyLastFight){ OFFENSIVE_CHANNELS.forEach(k=>{ savedAttrs[k]=G.f.attrs[k]; G.f.attrs[k]=clamp(G.f.attrs[k]+6,1,100); }); }
  const res=simulateFight(G.f,opp,rounds); const win=applyResult(G.f,opp,res,'A'); applyResult(opp,G.f,res,'B');
  if(isLikelyLastFight){ OFFENSIVE_CHANNELS.forEach(k=>{ G.f.attrs[k]=savedAttrs[k]; }); G.f.overall=overall(G.f); }
  // ==== [FIN ANCRE] ====
  G.f.orgWins=win?((G.f.orgWins||0)+1):Math.max(0,(G.f.orgWins||0)-1);
  const finish=!res.method.startsWith('Déc'); let milestone='';
  // titre
  if(win && kind==='title'){ G.f.champion=(G.f.org>=5?'monde':'europe'); G.f.titles++; G.roster.forEach(o=>o.champion=null); milestone=(G.f.org>=5?'🏆 CEINTURE MONDIALE':'🥈 CEINTURE EUROPÉENNE'); }
  else if(win && kind==='defense'){ G.f.defenses++; milestone='Titre défendu ('+G.f.defenses+')'; }
  else if(!win && G.f.champion){ G.f.champion=null; milestone='Titre perdu'; }
  // compétence débloquée ?
  const skill=rollSkill(G.f);
  // vieillissement (1 an ~ 2-4 combats)
  G.f._fy=(G.f._fy||0)+1; if(G.f._fy>=RI(2,4)){ applyAging(G.f); G.f._fy=0; }
  let forced=false; let retAge=42; if(G.f.skills.includes('meta01')) retAge+=2;
  if(G.f.age>=retAge || (G.f.age>=38 && G.f.overall<48)){ G.f.retired=true; forced=true; }
  // promotion d'organisation (progression graduelle) — remet le roster à neuf
  if(canPromote(G.f)){ G.f.org++; G.f.orgWins=0; if(G.f.stage==='amateur' && G.f.org>=1){ turnPro(); } G.f.champion=null; G.roster=makeOrgRoster(G.f); milestone=milestone||('Promotion : '+ORGS[G.f.org]); }
  advanceRoster();
  const newAch=checkAch();
  G.pending={res,win,method:res.method,finish,milestone,skill,newAch,forced,
    opp:{name:opp.name,flag:opp.flag}, camp:G.campApplied};
}
function turnPro(){ const f=G.f; f.amaRec={W:f.W,L:f.L}; f.stage='pro';
  f.W=f.L=f.D=f.ko=f.sub=f.dec=f.koLoss=f.streak=0; f.history=[]; f.champion=null; f.titles=0; f.defenses=0; f._fy=0;
  f.nick=earnNickname(f); }
function earnNickname(f){ const a=f.attrs;
  const striker=['le Sniper','le Marteau','la Foudre','le Bourreau','Mains de Pierre','le Cogneur','la Guillotine debout'];
  const grappler=['l\u2019Anaconda','le Python','le Boa','l\u2019Étau','le Sorcier du sol','le Suffocateur'];
  const pressure=['le Bulldozer','le Rouleau','Cœur de Lion','la Machine','l\u2019Ouragan'];
  const tech=['le Chirurgien','le Professeur','le Métronome','l\u2019Horloger','l\u2019Architecte'];
  const amaKO=f.amaRec, koRate=(f.amaRec&&(f.W))?0:0;
  // choisi selon les points forts
  if(a.submission>=a.power && a.submission>=a.jab) return pick(grappler);
  if(a.power>=70 || a.killer>=70) return pick(striker);
  if(a.fightIQ>=70 || a.adaptability>=70) return pick(tech);
  if(a.heart>=70 || a.cardio>=70) return pick(pressure);
  return pick(striker.concat(tech));
}

/* ------------------------------ succès ------------------------------------ */
const ACH=[
 {id:'debut',ico:'🥊',h:'Baptême',d:'Gagner ton 1er combat',t:f=>f.W>=1||f.amaRec},
 {id:'pro',ico:'📇',h:'Passage pro',d:'Devenir professionnel',t:f=>f.stage==='pro'},
 {id:'ko1',ico:'💥',h:'Bonne nuit',d:'Gagner par KO',t:f=>f.ko>=1},
 {id:'sub1',ico:'🐍',h:'Le piège',d:'Gagner par soumission',t:f=>f.sub>=1},
 {id:'euro',ico:'🥈',h:'Roi d\u2019Europe',d:'Ceinture européenne',t:f=>f.titles>=1&&f._euro},
 {id:'world',ico:'🏆',h:'Champion du monde',d:'Ceinture mondiale',t:f=>f._world},
 {id:'streak8',ico:'🔥',h:'Intouchable',d:'8 victoires d\u2019affilée',t:f=>f.streak>=8},
 {id:'defend5',ico:'👑',h:'Dynastie',d:'5 défenses de titre',t:f=>f.defenses>=5},
 {id:'skill3',ico:'✨',h:'Arsenal secret',d:'Débloquer 3 compétences',t:f=>f.skills.length>=3},
 {id:'skill8',ico:'🧬',h:'Prodige technique',d:'Débloquer 8 compétences',t:f=>f.skills.length>=8},
 {id:'koking',ico:'☠️',h:'Machine à KO',d:'12 victoires par KO',t:f=>f.ko>=12},
 {id:'subking',ico:'🕸️',h:'Le finisseur du sol',d:'12 soumissions',t:f=>f.sub>=12},
 {id:'undef',ico:'💎',h:'L\u2019Invaincu',d:'Champion sans défaite pro',t:f=>f._world&&f.L===0},
 {id:'legend',ico:'🐐',h:'Légende vivante',d:'Mondial + 5 défenses',t:f=>f._world&&f.defenses>=5},
 {id:'vet',ico:'🎖️',h:'Vétéran',d:'30 combats pro',t:f=>f.stage==='pro'&&(f.W+f.L+f.D)>=30},
];
function checkAch(){ G.ach=G.ach||[]; if(G.f.champion==='monde')G.f._world=true; if(G.f.champion==='europe')G.f._euro=true;
  const got=[]; for(const a of ACH){ if(!G.ach.includes(a.id)&&a.t(G.f)){ G.ach.push(a.id); got.push(a); } } return got; }

/* ============================== ÉCRANS ==================================== */
function last5(f){ const h=f.history.slice(-5); if(!h.length)return '<span class="muted small">Pas encore de combat</span>';
  return '<div class="l5">'+h.map(x=>{ const ko=x.method&&x.method.startsWith('KO'),sub=x.method&&x.method.startsWith('Soum');
    return `<span class="p ${x.res==='win'?'w':'l'}" title="${x.method||''}">${x.res==='win'?'V':'D'}<i>${ko?'KO':sub?'SUB':'DÉC'}</i></span>`; }).join('')+'</div>'; }
function recordStr(f){ return `${f.W}<span class="muted">-</span><span class="loss">${f.L}</span>${f.D?('<span class="muted">-</span>'+f.D):''}`; }
function orgTag(f){ return `<span class="tag">${ORGS[f.org]}</span>`; }
function gauge(v){ return `<span class="gauge"><span style="width:${clamp(v,0,100)}%"></span></span>`; }

function scr_intro(){ const c=hasSave();
  return `<div class="scr center intro"><div class="theme-btn" onclick="CL.theme()">${G.theme==='light'?'🌙':'☀️'}</div>
   <div class="eyebrow">Simulateur de carrière MMA</div>
   <h1 class="disp big">CAGE<br>LEGACY</h1>
   <p class="lede">De l\u2019inconnu au panthéon. Chaque combat écrit ta légende.</p>
   ${c?`<button class="btn gold" onclick="CL.cont()">Reprendre</button>`:''}
   <button class="btn primary" onclick="CL.go('create')">${c?'Nouvelle carrière':'Commencer'}</button>
   <button class="btn ghost" onclick="CL.go('hof')">🏛️ Panthéon</button></div>`; }

function scr_create(){ const d=G.draft, divs=DIVISIONS[d.gender];
  const pills=(arr,key,fn)=>arr.map(x=>`<span class="pill ${d[key]===fn(x).v?'on':''}" onclick="CL.draft('${key}','${fn(x).v}')">${fn(x).t}</span>`).join('');
  return `<div class="scr"><div class="eyebrow">Création</div><h2 class="disp">Ton combattant</h2>
   <div class="fld"><label>Genre</label><div class="pills">${pills(['H','F'],'gender',g=>({v:g,t:g==='H'?'Homme':'Femme'}))}</div></div>
   <div class="fld"><label>Prénom</label><input id="fn" value="${esc(d.first||'')}" placeholder="Prénom" oninput="CL.draftIn('first',this.value)"></div>
   <div class="fld"><label>Pays</label><div class="pills">${COUNTRY_KEYS.map(c=>`<span class="pill ${d.country===c?'on':''}" onclick="CL.draft('country','${c}')">${COUNTRIES[c].flag} ${COUNTRIES[c].name}</span>`).join('')}</div></div>
   <div class="fld"><label>Division</label><div class="pills">${divs.map(x=>`<span class="pill ${d.div===x.id?'on':''}" onclick="CL.draft('div','${x.id}')">${x.name}</span>`).join('')}</div></div>
   <div class="fld"><label>Discipline de base <span class="muted">(toutes équilibrées)</span></label><div class="pills">${STYLE_KEYS.map(s=>`<span class="pill ${d.style===s?'on':''}" onclick="CL.draft('style','${s}')">${styleLabel(s)}</span>`).join('')}</div></div>
   <div class="note small">Ton <b>origine</b>, ta <b>motivation</b> et ton <b>surnom</b> (au passage pro) se révéleront en jeu.</div>
   <button class="btn primary" onclick="CL.create()">Débuter la carrière</button>
   <button class="btn ghost" onclick="CL.go('intro')">Retour</button></div>`; }

function scr_hub(){ const f=G.f; const champ=f.champion;
  return `<div class="scr"><div class="bar"><span class="eyebrow" onclick="CL.theme()" style="cursor:pointer">${ORGS[f.org]} · ${f.divName} ${G.theme==='light'?'🌙':'☀️'}</span>
     ${champ?`<span class="tag gold">${champ==='monde'?'CHAMPION DU MONDE':'CHAMPION D\u2019EUROPE'}</span>`:`<span class="tag">#${divRank(f)}</span>`}</div>
   <div class="card">
     <div class="fh"><div class="fh-l"><div class="nm">${esc(f.name)}</div>${f.nick?`<div class="nick">« ${f.nick} »</div>`:''}
        <div class="sub">${f.styleLabel} · ${f.age} ans · ${f.phys.height}cm</div></div><div class="fl">${f.flag}</div></div>
     <div class="rec">${recordStr(f)} <span class="muted small">· ${f.ko}KO ${f.sub}SUB</span>${f.amaRec?`<span class="muted small"> · Am. ${f.amaRec.W}-${f.amaRec.L}</span>`:''}</div>
     ${last5(f)}
     <div class="mf"><div><span class="mf-l">Moral</span>${gauge(f.morale)}</div><div><span class="mf-l">Forme</span>${gauge(f.form)}</div></div>
   </div>
   <button class="btn primary" onclick="CL.fightSelect()">Chercher un combat</button>
   <div class="g2"><button class="btn" onclick="CL.go('profile')">Fiche complète</button><button class="btn" onclick="CL.go('rankings')">Classement</button></div>
   <div class="g2"><button class="btn" onclick="CL.go('ach')">Succès</button><button class="btn ghost" onclick="CL.go('retire')">Retraite</button></div></div>`; }

function scr_select(){ const f=G.f;
  return `<div class="scr"><div class="bar"><span class="eyebrow">Choix de l\u2019adversaire</span><span class="eyebrow x" onclick="CL.go('hub')">✕</span></div>
   <p class="lede small">Trois profils. Le pourcentage est une <b>estimation</b> — jamais une certitude.</p>
   ${G.opps.map((e,i)=>{ const o=e.o; return `<div class="opp" onclick="CL.opp(${i})">
     <div class="opp-top"><span class="opp-nm">${o.flag} ${esc(o.name)}</span><span class="opp-rec">${o.W}-${o.L}</span></div>
     <div class="opp-mid">${styleLabel(o.style)} · ${o.age} ans${o.champion?' · <span class="gold">Champion</span>':''}</div>
     <div class="opp-wp"><span class="opp-wp-l">Réussite estimée</span>${gauge(e.wp)}<span class="opp-wp-v">≈${e.wp}%</span></div>
     <div class="opp-read">${e.read}</div></div>`; }).join('')}
   <button class="btn ghost" onclick="CL.go('hub')">Retour</button></div>`; }

function scr_camp(){ const f=G.f;
  const deltaHtml=d=>d.map(([k,v])=>{ const lbl=k==='morale'?'Moral':k==='form'?'Forme':attrLabel(k);
     return `<span class="dlt ${v>=0?'up':'dn'}">${v>0?'+':''}${v} ${lbl}</span>`; }).join('');
  return `<div class="scr"><div class="bar"><span class="eyebrow">Camp d\u2019entraînement</span><span class="eyebrow x" onclick="CL.go('select')">✕</span></div>
   <p class="lede small">Un seul axe avant ce combat. Chaque choix <b>monte et baisse</b> des attributs (bornés par ton potentiel).</p>
   ${G.train.map((t,i)=>`<div class="opp" onclick="CL.train(${i})"><div class="opp-top"><span class="opp-nm">${t.label}</span></div>
      <div class="opp-mid">${t.hint}</div><div class="dlts">${deltaHtml(t.d)}</div></div>`).join('')}
   </div>`; }

/* ==== [ANCRE: NARRATION] — log texte à partir de res.log/res.stats, déjà calculés ==== */
function fightLog(res){ if(!res.log||!res.log.length)return '<span class="muted small">Décision aux cartes.</span>';
  const rows=res.log.map(L=>{ const ph=L.phase==='sol'?(L.top==='A'?'contrôle au sol imposé':'défense au sol, dessous'):'échanges debout';
    return `<div class="log-row"><span class="log-r">R${L.r}</span><span>${ph}</span></div>`; });
  if(res.round) rows.push(`<div class="log-row gold"><span class="log-r">R${res.round}</span><span>${res.method}${res.detail?' — '+res.detail:''}</span></div>`);
  return '<div class="fight-log">'+rows.join('')+'</div>'; }
/* ==== [FIN ANCRE] ==== */
function scr_hof(){ const list=loadHOF();
  return `<div class="scr"><div class="bar"><span class="eyebrow">Panthéon · ${list.length} légende(s)</span><span class="eyebrow x" onclick="CL.go('intro')">✕</span></div>
   <h2 class="disp">Tes anciens combattants</h2>
   ${list.length?list.map((f,i)=>`<div class="card"><div class="fh"><div class="fh-l"><div class="nm" style="font-size:19px">${i+1}. ${esc(f.name)}</div>${f.nick?`<div class="nick">« ${f.nick} »</div>`:''}<div class="sub">${f.style} · ${f.div} · retraite ${f.age} ans</div></div><div class="fl">${f.flag}</div></div>
      <div class="rec">${f.W}<span class="muted">-</span><span class="loss">${f.L}</span> <span class="muted small">${f.rank}</span></div>
      <div class="epis">${f.epithets.map(e=>`<span class="epi">${e}</span>`).join('')}</div></div>`).join(''):
      '<p class="lede">Aucune légende encore. Ta première carrière retraitée apparaîtra ici pour toujours.</p>'}
   <button class="btn ghost" onclick="CL.go('intro')">Retour</button></div>`; }
function scr_result(){ const p=G.pending,f=G.f,st=p.res.stats;
  return `<div class="scr center"><div class="eyebrow">${p.opp.flag} vs ${esc(p.opp.name)}</div>
   <h1 class="disp big" style="color:${p.win?'var(--gold)':'var(--loss)'};margin:4px 0">${p.win?'VICTOIRE':'DÉFAITE'}</h1>
   <div class="tag ${p.win?'gold':'blood'}">${p.method}${p.res.round?' · R'+p.res.round:''}</div>
   ${p.milestone?`<div class="card gold-b"><div class="disp" style="font-size:19px">${p.milestone}</div></div>`:''}
   ${p.skill?`<div class="card"><div class="skill-unlock">✨ Compétence débloquée : <b>${p.skill.name}</b><div class="muted small">${p.skill.desc||p.skill.blurb||''}</div></div></div>`:''}
   <div class="card stats-card"><div class="eyebrow mb">Statistiques du combat</div>
     <div class="st-row"><span>${st.A.sig}</span><span class="st-l">Frappes sig.</span><span>${st.B.sig}</span></div>
     <div class="st-row"><span>${st.A.td}</span><span class="st-l">Amenées</span><span>${st.B.td}</span></div>
     <div class="st-row"><span>${st.A.ctrl}</span><span class="st-l">Contrôle (rds)</span><span>${st.B.ctrl}</span></div>
     <div class="st-row"><span>${st.A.kd}</span><span class="st-l">Knockdowns</span><span>${st.B.kd}</span></div></div>
   <div class="card"><div class="eyebrow mb">Déroulé</div>${fightLog(p.res)}</div>
   ${p.camp&&p.camp.deltas.length?`<div class="card"><div class="eyebrow mb">Effets du camp</div><div class="dlts">${p.camp.deltas.map(([l,v])=>`<span class="dlt ${v>=0?'up':'dn'}">${v>0?'+':''}${v} ${l}</span>`).join('')}</div></div>`:''}
   ${p.newAch&&p.newAch.length?`<div class="card">${p.newAch.map(a=>`<div class="ach"><span class="ico">${a.ico}</span><b class="gold">${a.h}</b> <span class="muted small">${a.d}</span></div>`).join('')}</div>`:''}
   <button class="btn primary" onclick="CL.${p.forced?'toLegacy':'afterResult'}()">${p.forced?'Voir mon palmarès':'Continuer'}</button></div>`; }

function scr_profile(){ const f=G.f; const g=groupAvg(f);
  const grp=(key,title,avg)=>`<div class="card"><div class="grp-h"><span class="disp" style="font-size:17px">${title}</span><span class="gold mono">${d20(avg)}/20</span></div>
     ${ATTR[key].map(a=>`<div class="attr"><span class="attr-l">${a[1]}</span>${gauge(f.attrs[a[0]]*5>100?100:f.attrs[a[0]])}<span class="attr-v">${d20(f.attrs[a[0]])}</span></div>`).join('')}</div>`;
  return `<div class="scr"><div class="bar"><span class="eyebrow">Fiche complète</span><span class="eyebrow x" onclick="CL.go('hub')">✕</span></div>
   <div class="card"><div class="fh"><div class="fh-l"><div class="nm">${esc(f.name)}</div>${f.nick?`<div class="nick">« ${f.nick} »</div>`:''}<div class="sub">${f.styleLabel} · ${f.divName} · ${f.age} ans · ${f.phys.height}cm/${f.phys.reach}cm</div></div><div class="fl">${f.flag}</div></div>
     <div class="story"><b>Origine.</b> ${f.origin}.</div><div class="story"><b>Se bat pour.</b> ${f.motivation}.</div>
     ${f.skills.length?`<div class="story"><b>Compétences.</b></div>${f.skills.map(id=>{const sk=SKILLS.find(s=>s.id===id); return `<div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:4px 0"><span class="story" style="margin:0">${sk.name}</span>${(sk.tags||[]).map(t=>`<span class="tag">${t}</span>`).join('')}</div>`;}).join('')}`:''}
   </div>
   ${grp('tech','Technique',g.tech)}${grp('ment','Mental',g.ment)}${grp('phys','Physique',g.phys)}
   <button class="btn ghost" onclick="CL.go('hub')">Retour</button></div>`; }

function scr_rankings(){ const f=G.f; const dr=rankPool(G.roster.concat([f]));
  return `<div class="scr"><div class="bar"><span class="eyebrow">${ORGS[f.org]} · ${f.divName}</span><span class="eyebrow x" onclick="CL.go('hub')">✕</span></div>
   <h2 class="disp">Classement</h2><div class="card">
   ${dr.slice(0,13).map((o,i)=>`<div class="rk ${o===f?'you':''} ${o.champion?'ch':''}">
      <span class="rk-p">${o.champion?'👑':(i+1)}</span><span class="rk-n">${o.flag} ${esc(o.name)}${o===f?' <span class="muted">(toi)</span>':''}</span><span class="rk-r">${o.W}-${o.L}</span></div>`).join('')}</div>
   <button class="btn ghost" onclick="CL.go('hub')">Retour</button></div>`; }

function scr_ach(){ G.ach=G.ach||[];
  return `<div class="scr"><div class="bar"><span class="eyebrow">${G.ach.length}/${ACH.length}</span><span class="eyebrow x" onclick="CL.go('hub')">✕</span></div>
   <h2 class="disp">Succès</h2><div class="card">${ACH.map(a=>{const got=G.ach.includes(a.id);return `<div class="ach ${got?'':'lk'}"><span class="ico">${a.ico}</span><span><b class="${got?'gold':''}">${a.h}</b><div class="muted small">${a.d}</div></span></div>`;}).join('')}</div>
   <button class="btn ghost" onclick="CL.go('hub')">Retour</button></div>`; }

function scr_retire(){ return `<div class="scr center"><div class="eyebrow">Fin de carrière</div><h2 class="disp">Raccrocher les gants ?</h2>
   <p class="lede">Décision définitive. Ton palmarès sera scellé.</p>
   <button class="btn primary" onclick="CL.toLegacy()">Prendre ma retraite</button><button class="btn ghost" onclick="CL.go('hub')">Continuer</button>
   <button class="btn ghost" onclick="CL.exportSave()">Copier ma sauvegarde</button></div>`; }

function legacyTitle(f){ const s=(f._world?300:0)+(f._euro?120:0)+f.defenses*30+f.W*3-f.L*4+f.ko*2+f.sub*2;
  if(s>=380)return['🐐','LÉGENDE ÉTERNELLE']; if(s>=250)return['🏆','GRAND CHAMPION'];
  if(s>=140)return['⭐','CHAMPION RESPECTÉ']; if(s>=60)return['🥊','COMBATTANT ACCOMPLI'];
  if(s>=10)return['🎖️','VÉTÉRAN DU CIRCUIT']; return['🔨','GUERRIER DE L\u2019OMBRE']; }
function scr_legacy(){ const f=G.f; const [ico,rank]=legacyTitle(f); const ep=epithets(f);
  return `<div class="scr center"><div class="eyebrow">Palmarès scellé</div>
   <div style="font-size:60px">${ico}</div><h1 class="disp" style="color:var(--gold);font-size:30px">${rank}</h1>
   <div class="muted mb">${esc(f.name)}${f.nick?' « '+f.nick+' »':''}</div>
   <div class="card"><div class="epis">${ep.map(e=>`<span class="epi">${e}</span>`).join('')}</div>
     <div class="hr"></div>
     <div class="lg"><div><span class="lg-v gold">${recordStr(f)}</span><span class="lg-l">Bilan pro</span></div>
       <div><span class="lg-v gold">${f.ko}/${f.sub}</span><span class="lg-l">KO/SUB</span></div>
       <div><span class="lg-v gold">${f.defenses}</span><span class="lg-l">Défenses</span></div>
       <div><span class="lg-v gold">${f.skills.length}</span><span class="lg-l">Compét.</span></div></div>
     <div class="muted small mt">${f.motivation}</div></div>
   <button class="btn primary" onclick="CL.newCareer()">Nouvelle carrière</button></div>`; }

const SCREENS={intro:scr_intro,create:scr_create,hub:scr_hub,select:scr_select,camp:scr_camp,arena:scr_arena,
  result:scr_result,profile:scr_profile,rankings:scr_rankings,ach:scr_ach,retire:scr_retire,legacy:scr_legacy,hof:scr_hof};

/* ============================== RENDER + CL =============================== */
function render(){ const app=document.getElementById('app'); if(!app)return;
  const fn=SCREENS[G&&G.screen]||scr_intro; app.innerHTML=fn(); if(G&&G.screen==='arena') startArena(); window.scrollTo&&window.scrollTo(0,0); }
const CL={
  theme(){ setTheme(G.theme==='light'?'dark':'light'); save(); render(); },
  go(s){ if(!G)G={theme:'dark'}; G.screen=s; render(); },
  cont(){ if(load()){ setTheme(G.theme||'dark'); G.screen='hub'; render(); } },
  draft(k,v){ G.draft[k]=v; if(k==='gender')G.draft.div=DIVISIONS[v][Math.min(3,DIVISIONS[v].length-1)].id; render(); },
  draftIn(k,v){ G.draft[k]=v; },
  create(){ const d=G.draft; const f=makeFighter({gender:d.gender,div:d.div,style:d.style,countryKey:d.country,first:(d.first||'').trim()||undefined,age:RI(16,19),potential:RI(70,94)});
    f.stage='amateur'; f.org=0; f._fy=0;
    // ==== [ANCRE: META02] — legs du mentor, consommé une seule fois ====
    try{ if(localStorage.getItem('cage-legacy-mentor-bonus')==='true'){
      for(const k in f.attrs) f.attrs[k]=clamp(f.attrs[k]+2,1,100);
      f.overall=overall(f); localStorage.removeItem('cage-legacy-mentor-bonus'); } }catch(e){}
    // ==== [FIN ANCRE] ====
    G.f=f; G.roster=makeOrgRoster(f); G.ach=[]; checkAch(); G.screen='hub'; save(); render(); },
  fightSelect(){ startFightSelect(); },
  opp(i){ chooseOpponent(i); },
  train(i){ chooseTraining(i); },
  skipArena(){ CL.toResult(); },
  toResult(){ stopArena(); G.screen='result'; save(); render(); },
  afterResult(){ G.screen='hub'; save(); render(); },
  toLegacy(){ if(G.f.skills&&G.f.skills.includes('meta02')){ try{ localStorage.setItem('cage-legacy-mentor-bonus','true'); }catch(e){} }
    G.f.retired=true; enshrine(G.f); G.screen='legacy'; save(); render(); },
  newCareer(){ wipe(); const t=G.theme; G={theme:t,draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:''}}; setTheme(t); CL.go('create'); },
  exportSave(){ try{ const blob=JSON.stringify(G); const ta=document.createElement('textarea'); ta.value=blob; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select();
      try{ document.execCommand('copy'); alert('Sauvegarde copiée — colle-la dans un fichier texte pour la garder.'); }catch(e){ prompt('Copie ce texte :',blob); }
      document.body.removeChild(ta); }catch(e){ alert('Export impossible.'); } },
  importSave(){ const s=prompt('Colle ta sauvegarde ici :'); if(!s)return; try{ G=migrate(JSON.parse(s)); setTheme(G.theme||'dark'); G.screen='hub'; save(); render(); }catch(e){ alert('Sauvegarde invalide ou corrompue.'); } },
};
window.CL=CL;
/* ============================ ARÈNE 2D ==================================== */
/* Rejoue le combat round par round à partir de res.log, en cohérence stricte
   avec le résultat du moteur (même vainqueur, méthode, round). Silhouettes
   dans la DA archive : oxblood = joueur (gauche), sage = adversaire (droite). */
let ARENA=null;
function buildTimeline(){
  const res=G.pending.res, you=G.f, opp=G.fight.opp, meWin=G.pending.win;
  const log=(res.log&&res.log.length)?res.log:[{r:1,phase:'debout'}];
  const beats=[];
  const em=eff(you), eo=eff(opp);
  const offMe=em.striking+em.power+em.handSpeed;
  const offOp=eo.striking+eo.power+eo.handSpeed;
  for(let ri=0;ri<log.length;ri++){ const L=log[ri], last=(ri===log.length-1);
    const phase=L.phase, topIsMe=L.top?(L.top==='A'):null;
    const n=phase==='sol'?4:5;
    for(let k=0;k<n;k++){ let by;
      if(phase==='sol') by=topIsMe?'me':'op';
      else by=(Math.random()<offMe/(offMe+offOp))?'me':'op';
      beats.push({phase,by,round:L.r,finish:false}); }
    if(last && (res.method.startsWith('KO')||res.method.startsWith('Soum')))
      beats.push({phase,by:meWin?'me':'op',round:L.r,finish:true,method:res.method});
  }
  if(res.method.startsWith('Déc')) beats.push({phase:'bell',finish:true,method:res.method,round:log[log.length-1].r});
  // santé finale cohérente
  let hMeEnd=60,hOpEnd=60;
  if(res.method.startsWith('Déc')){ const s=res.scoreA+res.scoreB||1; hMeEnd=clamp(20+70*res.scoreA/s,12,92); hOpEnd=clamp(20+70*res.scoreB/s,12,92); }
  else { if(meWin){hOpEnd=res.method.startsWith('KO')?4:22; hMeEnd=clamp(45+RI(0,25));} else {hMeEnd=res.method.startsWith('KO')?4:22; hOpEnd=clamp(45+RI(0,25));} }
  ARENA={beats,idx:-1,started:false,done:false,raf:0,to:0,t0:0,lastBeat:-1,
    hMe:100,hOp:100,stMe:100,stOp:100,hMeEnd,hOpEnd,
    flashMe:0,flashOp:0,shakeMe:0,shakeOp:0,lungeMe:0,lungeOp:0,fall:0,tap:0,method:res.method,meWin,
    nmeName:you.first,nopName:opp.first,meFlag:you.flag,opFlag:opp.flag};
}
const BEAT_MS=440;
function startArena(){ if(!ARENA||ARENA.started)return; ARENA.started=true;
  const cv=document.getElementById('arena-cv');
  if(!cv||!cv.getContext||typeof requestAnimationFrame==='undefined'){ ARENA.done=true; return; } // pas de canvas (test)
  const dpr=Math.min(window.devicePixelRatio||1,2); const W=cv.clientWidth||360, H=220;
  cv.width=W*dpr; cv.height=H*dpr; const ctx=cv.getContext('2d'); ctx.scale(dpr,dpr);
  ARENA.W=W; ARENA.H=H; ARENA.ctx=ctx; ARENA.t0=performance.now();
  const total=ARENA.beats.length*BEAT_MS;
  const loop=(now)=>{ const el=now-ARENA.t0; const bi=Math.min(ARENA.beats.length-1,Math.floor(el/BEAT_MS));
    if(bi!==ARENA.lastBeat){ ARENA.lastBeat=bi; applyBeat(ARENA.beats[bi]); }
    drawArena((el%BEAT_MS)/BEAT_MS); paintBars();
    if(el>=total){ ARENA.done=true; drawArena(1,true); ARENA.to=setTimeout(()=>CL.toResult(),1300); return; }
    ARENA.raf=requestAnimationFrame(loop); };
  paintBars(); ARENA.raf=requestAnimationFrame(loop);
}
function applyBeat(b){ const A=ARENA; if(!b)return;
  if(b.phase==='bell')return;
  const dmg = b.phase==='sol'? RI(4,9) : RI(6,13);
  if(b.by==='me'){ A.hOp=clamp(A.hOp-dmg,A.hOpEnd*0.6,100); A.flashOp=1; A.shakeOp=1; A.lungeMe=1; }
  else { A.hMe=clamp(A.hMe-dmg,A.hMeEnd*0.6,100); A.flashMe=1; A.shakeMe=1; A.lungeOp=1; }
  A.stMe=clamp(A.stMe-RI(2,5),12,100); A.stOp=clamp(A.stOp-RI(2,5),12,100);
  if(b.finish){ if(b.method.startsWith('KO')){ if(A.meWin){A.hOp=2;A.fall=2;} else {A.hMe=2;A.fall=1;} }
    else if(b.method.startsWith('Soum')){ A.tap=A.meWin?2:1; } }
  A.curPhase=b.phase; A.curTop=(b.phase==='sol')?(b.by==='me'?'me':'op'):null;
}
function fighter(ctx,x,groundY,face,color,o){ // o: {lunge,flash,shake,fallen,grounded,top,tap}
  ctx.save();
  const sh=o.shake?( (Math.random()-0.5)*4 ):0;
  x+=face*(o.lunge*14)+sh;
  const bob=Math.sin(performance.now()/240 + (face>0?0:1))*2;
  if(o.grounded && !o.top){ // au sol sur le dos
    ctx.translate(x,groundY-8); ctx.fillStyle=o.flash?'#fff':color; ctx.globalAlpha=.95;
    ctx.beginPath(); ctx.ellipse(0,0,34,11,0,0,7); ctx.fill(); // corps allongé
    ctx.beginPath(); ctx.arc(-face*30,-4,8,0,7); ctx.fill(); ctx.restore(); return;
  }
  let topLean=o.grounded&&o.top?18:0;
  ctx.translate(x, groundY-52+bob+ (o.fallen?46:0));
  if(o.fallen){ ctx.rotate(face*1.3); }
  else if(topLean){ ctx.rotate(-face*0.5); ctx.translate(0,34); }
  const col=o.flash?'#fff':color;
  // jambes
  ctx.strokeStyle=col; ctx.lineWidth=6; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(-3,4); ctx.lineTo(-10,46); ctx.moveTo(4,4); ctx.lineTo(12,46); ctx.stroke();
  // torse
  ctx.lineWidth=15; ctx.beginPath(); ctx.moveTo(0,-6); ctx.lineTo(0,26); ctx.stroke();
  // tête
  ctx.fillStyle=col; ctx.beginPath(); ctx.arc(0,-20,9,0,7); ctx.fill();
  // bras : garde haute, ou coup tendu si lunge
  ctx.lineWidth=6;
  const reach=o.lunge; 
  ctx.beginPath(); // bras arrière (garde)
  ctx.moveTo(0,2); ctx.lineTo(-face*8,-10); ctx.stroke();
  ctx.beginPath(); // bras avant (frappe)
  ctx.moveTo(0,0); ctx.lineTo(face*(10+reach*20), -8+reach*4); ctx.stroke();
  ctx.fillStyle=o.flash?'#fff':color; ctx.beginPath(); ctx.arc(face*(10+reach*20),-8+reach*4,4.5,0,7); ctx.fill(); // gant
  ctx.restore();
}
function drawArena(frac,freeze){ const A=ARENA, ctx=A.ctx; if(!ctx)return; const W=A.W,H=A.H;
  ctx.clearRect(0,0,W,H);
  // décor : sol de cage
  const gY=H-24;
  const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#1c1710'); g.addColorStop(1,'#241d14');
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='#3a2f20'; ctx.lineWidth=1;
  for(let i=0;i<=8;i++){ const x=i*W/8; ctx.globalAlpha=.5; ctx.beginPath(); ctx.moveTo(x,gY); ctx.lineTo(x*0.6+W*0.2,H*0.34); ctx.stroke(); }
  ctx.globalAlpha=1; ctx.strokeStyle='#4a3c1f'; ctx.beginPath(); ctx.moveTo(0,gY); ctx.lineTo(W,gY); ctx.stroke();
  const grounded=A.curPhase==='sol';
  // adversaire (droite, sage, face gauche)
  fighter(ctx, W*0.66, gY, -1, '#6E8478', {lunge:A.lungeOp*(1-frac),flash:A.flashOp>0,shake:A.shakeOp>0,fallen:A.fall===2,grounded,top:A.curTop==='op'});
  // joueur (gauche, oxblood, face droite)
  fighter(ctx, W*0.34, gY, 1, '#B23B36', {lunge:A.lungeMe*(1-frac),flash:A.flashMe>0,shake:A.shakeMe>0,fallen:A.fall===1,grounded,top:A.curTop==='me'});
  // décrément des effets
  A.flashMe=Math.max(0,A.flashMe-0.5); A.flashOp=Math.max(0,A.flashOp-0.5);
  A.shakeMe=Math.max(0,A.shakeMe-0.5); A.shakeOp=Math.max(0,A.shakeOp-0.5);
  A.lungeMe*=0.86; A.lungeOp*=0.86;
  // étiquette de phase / finition
  ctx.font="600 11px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillStyle='#9A8F7C';
  const rnd=A.beats[A.lastBeat]?A.beats[A.lastBeat].round:1;
  let label = grounded?'SOL':'DEBOUT';
  if(A.done){ label = A.method.startsWith('Déc')?'AUX POINTS': (A.method.startsWith('KO')?'KO / TKO':'SOUMISSION'); ctx.fillStyle='#C6A15B'; ctx.font="700 14px 'Oswald'"; }
  ctx.fillText(A.done?label:('ROUND '+rnd+' · '+label), W/2, 20);
  // tap (soumission)
  if(A.tap){ ctx.fillStyle='#C6A15B'; ctx.font="700 13px 'Oswald'"; ctx.fillText('TAP !', A.tap===1?W*0.34:W*0.66, gY-70); }
}
function stopArena(){ if(ARENA){ if(ARENA.raf&&typeof cancelAnimationFrame!=='undefined')cancelAnimationFrame(ARENA.raf); if(ARENA.to)clearTimeout(ARENA.to); } }
function scr_arena(){ const A=ARENA||{};
  return `<div class="fade"><div class="eyebrow center">${esc(A.nmeName||'')} ${A.meFlag||''} vs ${A.opFlag||''} ${esc(A.nopName||'')}</div>
   <div class="card raise" style="padding:10px">
     <div class="arena-hud"><span class="ah-name blood">${esc(A.nmeName||'Toi')}</span><span class="ah-name sage" style="text-align:right">${esc(A.nopName||'Adv.')}</span></div>
     <div class="arena-bars"><div class="ab"><div class="ab-fill me" id="ab-me"></div></div><div class="ab"><div class="ab-fill op" id="ab-op"></div></div></div>
     <canvas id="arena-cv" style="width:100%;height:220px;display:block;border-radius:4px;margin-top:8px"></canvas>
     <div class="arena-st"><div class="st-lbl">Cardio</div><div class="st-lbl" style="text-align:right">Cardio</div></div>
     <div class="arena-bars sm"><div class="ab"><div class="ab-fill st" id="st-me"></div></div><div class="ab"><div class="ab-fill st" id="st-op"></div></div></div>
   </div>
   <button class="btn ghost" onclick="CL.skipArena()">Passer l\u2019animation ▸</button></div>`; }
/* mise à jour des barres HTML à chaque frame */
function paintBars(){ if(!ARENA)return; const set=(id,v)=>{const e=document.getElementById(id); if(e)e.style.width=clamp(v,0,100)+'%';};
  set('ab-me',ARENA.hMe); set('ab-op',ARENA.hOp); set('st-me',ARENA.stMe); set('st-op',ARENA.stOp); }
