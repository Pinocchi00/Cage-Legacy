"use strict";
/* CAGE LEGACY — js/ui.js
   Logique de jeu (roster, adversaires, entraînement, combat, succès),
   écrans (SCREENS), rendu, arène 2D canvas, et l'objet CL exposé en global.
   Dépend de : data-skills.js, data-content.js, engine.js, state.js. */
/* ==== [ANCRE: TACTIQUES] — plan de combat pré-fight (audit §11). Les clés des
   modificateurs (str/ko/def/gi/td/tdd/sub/gnp/ctrl) correspondent aux canaux
   RÉELS produits par eff() : striking, power, footwork+fightIQ, takedown,
   tdd, submission, ground, topControl — vérifiés contre engine.js. ==== */
const TACTICS = {
  boxer: [
    { id: 'bx1', lbl: 'Volume Constant', desc: 'Sature l\u2019adversaire de jabs et de touches. Moins de puissance, plus de points.', m: { str: 1.3, ko: 0.7, gi: 0.2 } },
    { id: 'bx2', lbl: 'Chasse au KO', desc: 'Plante les appuis et cherche le coup fatal. Dangereux mais on s\u2019expose.', m: { ko: 1.4, def: 0.7, str: 0.8, gi: 0.2 } },
    { id: 'bx3', lbl: 'Out-boxing', desc: 'Recule, gère la distance et punit sur esquive. Combat lent et sûr.', m: { def: 1.4, str: 0.8, gi: 0.2 } }
  ],
  bjj: [
    { id: 'bj1', lbl: 'Takedown sans check', desc: 'Plonge dans les jambes à la moindre occasion. Sacrifice de la boxe.', m: { gi: 3.0, td: 1.3, str: 0.3 } },
    { id: 'bj2', lbl: 'Chasseur de cou', desc: 'Prend tous les risques au sol pour arracher une soumission rapide.', m: { sub: 1.5, ctrl: 0.6 } },
    { id: 'bj3', lbl: 'Tireur de garde', desc: 'Accepte d\u2019être mis sur le dos (baisse d\u2019anti-lutte) pour travailler par en-dessous.', m: { gi: 0.2, tdd: 0.2, sub: 1.4 } }
  ],
  wrestler: [
    { id: 'wr1', lbl: 'Chain Wrestling', desc: 'Enchaîne les tentatives d\u2019amenées jusqu\u2019à l\u2019épuisement de l\u2019adversaire.', m: { gi: 2.5, td: 1.3, str: 0.5 } },
    { id: 'wr2', lbl: 'Ground & Pound', desc: 'Privilégie les frappes lourdes au sol, quitte à perdre le contrôle positionnel.', m: { gnp: 1.5, ctrl: 0.7, sub: 0.5 } },
    { id: 'wr3', lbl: 'Sprawl & Brawl', desc: 'Refuse catégoriquement le sol, sprawle fort et boxe lourdement.', m: { gi: 0.1, tdd: 1.5, ko: 1.2 } }
  ],
  kickboxer: [
    { id: 'kb1', lbl: 'Pression Hollandaise', desc: 'Avance non-stop avec des combinaisons poings-pieds. Défense ouverte.', m: { str: 1.4, def: 0.7, gi: 0.1 } },
    { id: 'kb2', lbl: 'Sniper Extérieur', desc: 'Garde la distance maximale et punit les entrées avec des kicks lourds.', m: { def: 1.3, ko: 1.2, str: 0.7, gi: 0.1 } },
    { id: 'kb3', lbl: 'Sprawl & Kick', desc: 'Focus total sur la défense de lutte pour garder le combat debout à tout prix.', m: { tdd: 1.4, ko: 1.2, str: 0.9, gi: 0.1 } }
  ],
  muayThai: [
    { id: 'mt1', lbl: 'Clinch Destructeur', desc: 'Ferme la distance pour imposer le corps-à-corps et les genoux.', m: { str: 1.3, td: 0.5, tdd: 1.2 } },
    { id: 'mt2', lbl: 'Coupeur de Têtes', desc: 'Cherche la destruction physique sur chaque coup, au détriment du volume.', m: { ko: 1.5, def: 0.6, gi: 0.1 } },
    { id: 'mt3', lbl: 'Le Mur Thaï', desc: 'Immobile, encaisse sur la garde et défend les lutteurs.', m: { def: 1.4, str: 0.8, tdd: 1.3, gi: 0.1 } }
  ],
  karate: [
    { id: 'ka1', lbl: 'Blitzkrieg', desc: 'Explosions soudaines en ligne droite. Frappe très fort mais se fatigue.', m: { ko: 1.4, str: 0.7, def: 0.8, gi: 0.1 } },
    { id: 'ka2', lbl: 'Fantôme (In/Out)', desc: 'Touche et s\u2019échappe instantanément. Très difficile à toucher ou à lutter.', m: { def: 1.6, str: 0.6, gi: 0.1 } },
    { id: 'ka3', lbl: 'Contre Parfait', desc: 'Attend que l\u2019adversaire s\u2019engage pour placer le coup d\u2019arrêt.', m: { ko: 1.5, str: 0.5, gi: 0.1 } }
  ],
  sambo: [
    { id: 'sb1', lbl: 'Casting Punch', desc: 'Overhands brutaux pour masquer les entrées en lutte ou éteindre la lumière.', m: { ko: 1.4, td: 0.6, gi: 0.5 } },
    { id: 'sb2', lbl: 'Suplex City', desc: 'Projections de grande amplitude, risquées mais garantissent le dessus.', m: { td: 1.5, gnp: 1.2, ctrl: 0.6 } },
    { id: 'sb3', lbl: 'Voleur de Jambes', desc: 'Plonge dans la garde adverse pour arracher une cheville.', m: { sub: 1.6, ctrl: 0.4, tdd: 0.4 } }
  ],
  mma: [
    { id: 'mm1', lbl: 'Anti-Lutte', desc: 'Défend toutes les amenées et utilise la boxe avec puissance.', m: { gi: 0.2, tdd: 1.5, str: 1.2 } },
    { id: 'mm2', lbl: 'Lutte Offensive', desc: 'Force le combat au sol de manière méthodique pour dominer le chrono.', m: { gi: 2.0, td: 1.2, ctrl: 1.2, str: 0.7 } },
    { id: 'mm3', lbl: 'Opportuniste', desc: 'Adapte sa tactique, joue sur la défensive et saisit les ouvertures.', m: { def: 1.2, ko: 1.2, sub: 1.2, str: 0.8 } }
  ]
};
/* ==== [FIN ANCRE] ==== */
/* --------------------------- roster / classement -------------------------- */
function orgLevel(org){ return [38,46,54,61,67,73,73][org]||40; }
function makeOrgRoster(f, oldRoster=null){ const base=orgLevel(f.org); const pool=[];
  const isAmateur=(f.org===0);
  const needed=isAmateur?100:12;
  // Array.isArray est nécessaire : oldRoster peut valoir le sentinel 'PRO_TRANSITION'
  // (une chaîne, qui a un .length mais pas de .filter) — sans cette garde, ça plante.
  if(!isAmateur && oldRoster && Array.isArray(oldRoster) && oldRoster.length>0){
    const survivors=oldRoster.filter(o=>o.id!==f.id && !o.champion).slice(0,4);
    survivors.forEach(o=>{ o.attrs.fightIQ=clamp(o.attrs.fightIQ+RI(1,3),1,100); o.overall=overall(o); pool.push(o); });
  }
  if(!isAmateur && oldRoster==='PRO_TRANSITION' && f.amateurRivals){
    f.amateurRivals.forEach(r=>{ r.org=1; r.overall=clamp(r.overall+RI(5,12),35,95); r.isAmateurRival=true; pool.push(r); });
  }
  const toGenerate=needed-pool.length;
  for(let i=0;i<toGenerate;i++){ const lv=clamp(base+RI(-10,14),20,97);
    const age=isAmateur?RI(17,24):RI(22,35);
    const o=makeFighter({gender:f.gender,div:f.div,level:lv,potential:lv+RI(2,12),age});
    o.W=isAmateur?RI(0,15):RI(6,24); o.L=isAmateur?RI(0,6):RI(1,8);
    o.ko=RI(0,o.W); o.streak=RI(-2,6); pool.push(o); }
  const ranked=rankPool(pool);
  if(f.org>=4){ ranked[0].champion=f.org>=5?'monde':'europe'; ranked[0].defenses=RI(0,4); }
  return ranked;
}
function divRank(f){ return rankPool(G.roster.filter(o=>!o.champion).concat([f])).findIndex(o=>o===f)+1; }
function advanceRoster(){
  const allFighters=G.roster.concat(G.f.champion?[]:[G.f]);
  const oldRanks={}; rankPool(allFighters).forEach((o,i)=>oldRanks[o.id]=i);
  const r=G.roster.filter(o=>!o.champion);
  for(let n=0;n<3;n++){ const a=pick(r),b=pick(r); if(a===b)continue; const res=simulateFight(a,b,3); applyResult(a,b,res,'A'); applyResult(b,a,res,'B'); }
  G.roster=rankPool(G.roster);
  rankPool(G.roster.concat([G.f])).forEach((o,i)=>{ const oldRk=oldRanks[o.id]; o.lastRankDelta=oldRk!==undefined?(oldRk-i):0; });
}

/* --------------------------- 3 adversaires + % ---------------------------- */
function tacticalRead(f,o){ const a=eff(f),b=eff(o);
  let prefix=''; const fights=o.W+o.L+o.D;
  if(fights<=5 && o.W>o.L) prefix='Jeune loup imprévisible. ';
  else if(o.streak<=-2 && o.age>=32) prefix='Vétéran sur le déclin. ';
  else if(o.streak>=3) prefix='Sur une grosse série de victoires. ';
  let base='Combat équilibré — l\u2019intelligence fera la différence.';
  if(b.striking>b.ground+12 && b.striking>a.striking) base='Redoutable debout — amène-le au sol.';
  else if(b.takedown>a.tdd+10) base='Gros lutteur — garde la cage dans le dos, sprawle.';
  else if(b.submission>a.guard+12) base='Dangereux au sol — reste debout, méfie-toi du cou.';
  else if(a.overall>o.overall+8) base='Sur le papier, tu domines. Ne te relâche pas.';
  else if(o.overall>f.overall+8) base='Plus fort que toi. Il te faudra un plan.';
  return prefix+base;
}
function genOpponents(f){
  const pool=G.roster.filter(o=>o.id!==f.id);
  let chosen=[];
  const isDefense=!!f.champion;
  const isTitle=(!isDefense && f.org>=4 && ((f.orgWins||0)>=3 || divRank(f)<=2));
  if(isDefense){ chosen.push(pool[0],pool[1],pool[2]); }
  else if(isTitle){ chosen.push(pool.find(o=>o.champion)||pool[0]); }
  else {
    const myRank=pool.findIndex(o=>p4pScore(o)<p4pScore(f));
    const rk=myRank===-1?pool.length:myRank;
    if(f.streak<=-2){
      // SCÉNARIO A : Le Rebond (Prospect vs Vétéran)
      const prospect=pool.find(o=>(o.W+o.L)<=5 && o.W>o.L && p4pScore(o)<p4pScore(f)) || pool[Math.min(pool.length-1, rk+2)];
      const veteran=pool.find(o=>o.age>=32 && o.streak<0) || pool[Math.min(pool.length-1, rk+3)];
      const mid=pool[rk]||pool[0];
      chosen.push(prospect, veteran, mid);
    } else if(f.streak>=2){
      // SCÉNARIO B : L'Anti-chambre (Gatekeeper)
      const gatekeeper=pool.find(o=>o.attrs.durability>75 || o.attrs.tdd>75) || pool[Math.max(0, rk-2)];
      const higher=pool[Math.max(0, rk-3)];
      const trap=pool[Math.min(pool.length-1, rk+1)];
      chosen.push(gatekeeper, higher, trap);
    } else {
      // SCÉNARIO C : Statu Quo
      chosen.push(pool[Math.max(0, rk-2)], pool[rk]||pool[0], pool[Math.min(pool.length-1, rk+2)]);
    }
    if(f.rivalId){ const rival=pool.find(o=>o.id===f.rivalId && !o.champion);
      if(rival && !chosen.includes(rival)) chosen[1]=rival; }
  }
  let uniqueOpps=[...new Set(chosen)].filter(Boolean);
  while(uniqueOpps.length<3 && uniqueOpps.length<pool.length){ const rand=pick(pool);
    if(!uniqueOpps.includes(rand) && !rand.champion) uniqueOpps.push(rand); }
  uniqueOpps=uniqueOpps.slice(0,3);
  return uniqueOpps.map(o=>{ let read=tacticalRead(f,o);
    if(f.rivalId===o.id) read='RIVALITÉ. '+read;
    return {o, read}; });
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
  G.fight={kind,opp,rounds,malus:null};
  if(rnd()<0.15){ generateRandomEvent(); G.screen='event'; save(); render(); }
  else { proceedToFight(); }
}
function proceedToFight(){ G.screen='plan'; save(); render(); }
/* ==== [ANCRE: EVENEMENT] — blessures/coupe de poids, disruptif façon Destiny Eleven.
   H-heavy (poids lourd) et F-feather (poids plume) sont les catégories les PLUS
   HAUTES de leur genre (pas les plus petites) : la condition sert à empêcher
   toute tentative de "monter de catégorie" pour un combattant déjà au sommet,
   faute de catégorie supérieure où l'envoyer. ==== */
function generateRandomEvent(){ const f=G.f;
  const isTopDivision=(f.div==='H-heavy' || f.div==='F-feather');
  let pool=['minor_injury','minor_injury','weight_cut'];
  if(!isTopDivision) pool.push('weight_cut');
  if(rnd()<0.25) pool.push('major_injury');
  // ==== [ANCRE: EVENEMENTS_ARGENT] — dilemmes financiers, réservés aux pros ====
  if(f.org>0){
    if(f.org>=5) pool.push('sponsor_clash','short_notice_money');
    if(f.org===4) pool.push('sell_out_fight');
  }
  // ==== [FIN ANCRE] ====
  const type=pick(pool);
  let title='', text='', btn='Continuer', actionId=type;
  if(type==='weight_cut'){
    f.botchedWeightCuts=(f.botchedWeightCuts||0)+1;
    if(f.botchedWeightCuts>=3 && !isTopDivision){
      const divs=DIVISIONS[f.gender]; const curIdx=divs.findIndex(d=>d.id===f.div); const nextDiv=divs[curIdx+1];
      if(nextDiv){
        f.div=nextDiv.id; f.divName=nextDiv.name; f.botchedWeightCuts=0; f.champion=null;
        title='Le corps dit stop';
        text=`Votre corps ne tolère plus la déshydratation. Pour la troisième fois, la coupe de poids est un désastre médical. La commission vous interdit de redescendre : vous êtes forcé de monter en <b>${f.divName}</b>.`;
        actionId='move_up';
      } else { f.botchedWeightCuts=0; title='Coupe de poids brutale';
        text='Les derniers kilos ont été un enfer absolu. Vous abordez ce combat sévèrement déshydraté, avec un déficit de cardio et de force.';
        G.fight.malus={cardio:-15,strength:-12,durability:-10}; }
    } else {
      title='Coupe de poids brutale';
      text='Les derniers kilos dans le sauna ont été un enfer absolu. Vous abordez ce combat sévèrement déshydraté, avec un déficit de cardio et de force.';
      G.fight.malus={cardio:-15,strength:-12,durability:-10};
    }
  } else if(type==='minor_injury'){
    title='Pépin physique';
    text='Mauvaise torsion du genou lors du dernier sparring. Rien qui n\u2019empêche de combattre, mais vous allez le sentir dans l\u2019octogone.';
    G.fight.malus={footSpeed:-15,explosiveness:-12};
  } else if(type==='major_injury'){
    title='Déchirure !';
    text='Sur un appui anodin à l\u2019entraînement, un claquement sourd. Le médecin est catégorique : combat annulé, et plusieurs mois de rééducation.';
    btn='Accepter le sort';
  } else if(type==='short_notice_money'){
    title='Sauver la carte (Short Notice)';
    text='Le main-event a été annulé. L\u2019organisation vous supplie de combattre avec seulement 4 jours de préparation contre une prime gigantesque (500 000 $ garantis). Votre forme physique sera catastrophique.';
    // 'form' est un champ direct du combattant (f.form), pas un attribut de f.attrs :
    // il ne peut pas passer par G.fight.malus (qui n'agit que sur f.attrs).
    G.fight.malus={cardio:-25};
    f.form=clamp(f.form-30,0,100);
    f.earnings=(f.earnings||0)+500;
  } else if(type==='sponsor_clash'){
    title='Guerre de Sponsors';
    text='Vous avez porté les couleurs d\u2019un sponsor concurrent lors de la pesée. L\u2019organisation vous met à l\u2019amende (perte de 150 000 $) mais votre aura auprès des fans rebelles explose.';
    f.earnings=Math.max(0,(f.earnings||0)-150);
    f.morale=clamp(f.morale+20,0,100);
  } else if(type==='sell_out_fight'){
    title='Combat Arrangé ?';
    text='Un bookmaker véreux vous offre 200 000 $ pour perdre le premier round volontairement avant de reprendre le combat. Accepter vous draine mentalement et ruine votre concentration.';
    f.earnings=(f.earnings||0)+200;
    G.fight.malus={composure:-20};
    f.morale=clamp(f.morale-15,0,100);
  }
  G.activeEvent={title,text,btn,actionId};
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: SAISON] — moteur de bilan annuel + 70 trophées (audit §12).
   Corrigé par rapport au brouillon de Gemini : la vraie structure de combat
   est res.stats.A/res.stats.B (pas st.Me/st.Op) — remappée ici une seule fois
   à l'enregistrement pour que les 70 conditions restent lisibles telles
   quelles. Le rythme de vieillissement RÉEL est RI(2,4) (aléatoire), pas un
   cycle fixe de 3 combats comme le supposait Gemini — la fin de saison est
   accrochée au vrai cycle existant, sans le remplacer. ==== */
function compileSeasonStats(f, fights){
  let s={ total:fights.length, W:0, L:0, koW:0, subW:0, decW:0, koL:0, subL:0, decL:0,
    sigMe:0, sigOp:0, tdMe:0, tdOp:0, ctrlMe:0, ctrlOp:0, kdMe:0, kdOp:0,
    biggestUpset:0, highestOppRank:999, titleWins:0, r1KOs:0, closeFights:0, wars:0, flawless:0 };
  fights.forEach(ft=>{
    if(ft.win){ s.W++;
      if(ft.method.startsWith('KO')){ s.koW++; if(ft.round===1)s.r1KOs++; }
      else if(ft.method.startsWith('Soum')) s.subW++;
      else s.decW++;
      if(ft.oppRank<s.highestOppRank) s.highestOppRank=ft.oppRank;
      if(ft.myRank-ft.oppRank>s.biggestUpset) s.biggestUpset=ft.myRank-ft.oppRank;
      if(ft.isTitle) s.titleWins++;
      if(ft.st.Op.sig===0 && ft.st.Op.td===0) s.flawless++;
    } else { s.L++;
      if(ft.method.startsWith('KO')) s.koL++;
      else if(ft.method.startsWith('Soum')) s.subL++;
      else s.decL++;
    }
    s.sigMe+=ft.st.Me.sig||0; s.sigOp+=ft.st.Op.sig||0;
    s.tdMe+=ft.st.Me.td||0; s.tdOp+=ft.st.Op.td||0;
    s.ctrlMe+=ft.st.Me.ctrl||0; s.ctrlOp+=ft.st.Op.ctrl||0;
    s.kdMe+=ft.st.Me.kd||0; s.kdOp+=ft.st.Op.kd||0;
    const totalSig=(ft.st.Me.sig||0)+(ft.st.Op.sig||0);
    if(totalSig>60 || ft.st.Me.kd+ft.st.Op.kd>=2) s.wars++;
    if(ft.method.startsWith('Déc') && Math.abs((ft.scoreA||0)-(ft.scoreB||0))<=5) s.closeFights++;
  });
  return s;
}
const SEASON_AWARDS=[
  // --- PRESTIGE (10) ---
  {id:'a1',lbl:'Combattant de l\u2019année',c:(s,f)=>s.W>=3&&s.L===0&&s.titleWins>0},
  {id:'a2',lbl:'Prospect de l\u2019année',c:(s,f)=>s.W>=3&&s.L===0&&f.age<=23&&!f.champion},
  {id:'a3',lbl:'Vétéran de l\u2019année',c:(s,f)=>s.W>=2&&f.age>=34},
  {id:'a4',lbl:'Comeback de l\u2019année',c:(s,f)=>s.W>=2&&(f.streak||0)===2&&f.history.length>5&&f.L>0},
  {id:'a5',lbl:'Combat de l\u2019année',c:(s,f)=>s.wars>=1},
  {id:'a6',lbl:'Performance de l\u2019année',c:(s,f)=>s.biggestUpset>=5&&s.koW+s.subW>0},
  {id:'a7',lbl:'KO de l\u2019année',c:(s,f)=>s.r1KOs>=1&&s.kdMe>=2},
  {id:'a8',lbl:'Soumission de l\u2019année',c:(s,f)=>s.subW>=1&&s.biggestUpset>=3},
  {id:'a9',lbl:'Le Chouchou du Public',c:(s,f)=>s.total>=3&&s.wars>=2},
  {id:'a10',lbl:'Saison Parfaite',c:(s,f)=>s.total>=3&&s.W===s.total&&s.koW+s.subW===s.total},
  // --- STRIKING & DÉGÂTS (20) ---
  {id:'a11',lbl:'La Mitrailleuse',c:(s,f)=>s.sigMe>=120},
  {id:'a12',lbl:'Le Sniper',c:(s,f)=>s.koW>=2&&s.sigMe<=40},
  {id:'a13',lbl:'Le Marteau',c:(s,f)=>s.kdMe>=3},
  {id:'a14',lbl:'Tête Brûlée',c:(s,f)=>s.sigMe>80&&s.sigOp>80},
  {id:'a15',lbl:'Bain de Sang',c:(s,f)=>s.sigMe+s.sigOp>=180},
  {id:'a16',lbl:'Menton d\u2019Acier',c:(s,f)=>s.sigOp>=100&&s.koL===0},
  {id:'a17',lbl:'Intouchable',c:(s,f)=>s.W>=2&&s.sigOp<=15},
  {id:'a18',lbl:'One-Punch Man',c:(s,f)=>s.r1KOs>=2},
  {id:'a19',lbl:'Puncheur de l\u2019année',c:(s,f)=>s.koW>=2},
  {id:'a20',lbl:'Guerre d\u2019Usure',c:(s,f)=>s.decW>=2&&s.sigMe>=90},
  {id:'a21',lbl:'Brawler',c:(s,f)=>s.sigMe>50&&s.sigOp>50&&s.koW>=1},
  {id:'a22',lbl:'L\u2019Exécuteur',c:(s,f)=>s.kdMe>=4},
  {id:'a23',lbl:'Mâchoire de Verre',c:(s,f)=>s.koL>=2},
  {id:'a24',lbl:'Chasseur de Foie',c:(s,f)=>s.koW>=1&&f.style==='kickboxer'},
  {id:'a25',lbl:'Coudes Rasoirs',c:(s,f)=>s.koW>=1&&f.style==='muayThai'},
  {id:'a26',lbl:'Le Chirurgien',c:(s,f)=>s.sigMe>=60&&s.sigOp<=20},
  {id:'a27',lbl:'Blitzkrieg',c:(s,f)=>s.r1KOs>=1&&f.style==='karate'},
  {id:'a28',lbl:'Casting Mortel',c:(s,f)=>s.koW>=1&&f.style==='sambo'},
  {id:'a29',lbl:'Dirty Boxer',c:(s,f)=>s.sigMe>=70&&s.ctrlMe>0},
  {id:'a30',lbl:'Main Lourde',c:(s,f)=>s.koW>=1&&f.attrs.power>=80},
  // --- GRAPPLING & CONTRÔLE (20) ---
  {id:'a31',lbl:'La Sangsue',c:(s,f)=>s.ctrlMe>=6},
  {id:'a32',lbl:'Machine à Takedowns',c:(s,f)=>s.tdMe>=8},
  {id:'a33',lbl:'Le Destructeur au Sol',c:(s,f)=>s.koW>=1&&s.ctrlMe>=2},
  {id:'a34',lbl:'L\u2019Étau',c:(s,f)=>s.subW>=2},
  {id:'a35',lbl:'Mur de Briques',c:(s,f)=>s.tdOp===0&&s.W>=2&&f.attrs.tdd>=80},
  {id:'a36',lbl:'Grappler de l\u2019année',c:(s,f)=>s.subW>=1&&s.tdMe>=4},
  {id:'a37',lbl:'Suplex City',c:(s,f)=>s.tdMe>=5&&f.style==='wrestler'},
  {id:'a38',lbl:'Artiste de la Fuite',c:(s,f)=>s.ctrlOp>=4&&s.subL===0&&s.W>=1},
  {id:'a39',lbl:'Anaconda',c:(s,f)=>s.subW>=1&&f.style==='bjj'},
  {id:'a40',lbl:'Tireur d\u2019Élite (Sol)',c:(s,f)=>s.subW>=1&&s.ctrlMe<=1},
  {id:'a41',lbl:'Le Compresseur',c:(s,f)=>s.ctrlMe>=8},
  {id:'a42',lbl:'Pression Daghestanaise',c:(s,f)=>s.tdMe>=4&&s.ctrlMe>=5},
  {id:'a43',lbl:'Le Voleur de Jambes',c:(s,f)=>s.subW>=1&&s.tdMe===0},
  {id:'a44',lbl:'Roi du Scramble',c:(s,f)=>s.tdMe>=3&&s.tdOp>=3},
  {id:'a45',lbl:'Anti-Lutte',c:(s,f)=>s.tdOp===0&&s.sigMe>=50},
  {id:'a46',lbl:'Sol Étouffant',c:(s,f)=>s.ctrlMe>=4&&s.sigOp<=10},
  {id:'a47',lbl:'Ceinture Noire',c:(s,f)=>s.subW>=2&&f.attrs.submission>=85},
  {id:'a48',lbl:'Ground & Pounder',c:(s,f)=>s.koW>=1&&s.ctrlMe>=3},
  {id:'a49',lbl:'Lutte Universitaire',c:(s,f)=>s.tdMe>=6&&s.subW===0},
  {id:'a50',lbl:'L\u2019Enclume',c:(s,f)=>s.ctrlOp>=6&&s.L===s.total},
  // --- NARRATIF & CONTEXTE (20) ---
  {id:'a51',lbl:'Upset de l\u2019année',c:(s,f)=>s.biggestUpset>=8},
  {id:'a52',lbl:'Le Gatekeeper',c:(s,f)=>s.W>=1&&s.L>=1&&s.highestOppRank<=5&&!f.champion},
  {id:'a53',lbl:'Le Marathonien',c:(s,f)=>s.decW===s.total&&s.total>=3},
  {id:'a54',lbl:'Hold-up',c:(s,f)=>s.decW>=1&&s.sigMe<s.sigOp&&s.ctrlMe<s.ctrlOp},
  {id:'a55',lbl:'Domination Totale',c:(s,f)=>s.flawless>=1},
  {id:'a56',lbl:'Le Bourreau des Favoris',c:(s,f)=>s.biggestUpset>=4&&s.koW>=1},
  {id:'a57',lbl:'Roi de la Décision',c:(s,f)=>s.decW>=2&&s.L===0},
  {id:'a58',lbl:'Tueur de Vétérans',c:(s,f)=>s.W>=2&&f.age<=25},
  {id:'a59',lbl:'Garde du Temple',c:(s,f)=>s.L>=2&&s.highestOppRank>=10&&s.highestOppRank<999},
  {id:'a60',lbl:'L\u2019Artisan',c:(s,f)=>s.W>=2&&s.sigMe<=60&&s.ctrlMe<=3},
  {id:'a61',lbl:'Hype Train',c:(s,f)=>s.W>=3&&f.streak>=5},
  {id:'a62',lbl:'Hype Déraillée',c:(s,f)=>s.L>=2&&f.streak<=-3},
  {id:'a63',lbl:'Vengeance',c:(s,f)=>s.W>=1&&s.closeFights>=1},
  {id:'a64',lbl:'Le Fantôme',c:(s,f)=>s.sigOp<=20&&s.L===0&&s.total>=2},
  {id:'a65',lbl:'L\u2019Acrobate',c:(s,f)=>s.koW>=1&&f.attrs.flexibility>=80},
  {id:'a66',lbl:'Le Survivant',c:(s,f)=>s.ctrlOp>=5&&s.sigOp>=50&&s.W>=1},
  {id:'a67',lbl:'Sang Froid',c:(s,f)=>s.closeFights>=2&&s.W>=2},
  {id:'a68',lbl:'L\u2019Opportuniste',c:(s,f)=>s.subW>=1&&s.ctrlMe===0},
  {id:'a69',lbl:'Constance',c:(s,f)=>s.total>=3&&s.L===0&&s.decW>=2},
  {id:'a70',lbl:'Année Noire',c:(s,f)=>s.L===s.total&&s.total>=2},
];
function evaluateSeason(f,fights){ const s=compileSeasonStats(f,fights);
  let won=[]; SEASON_AWARDS.forEach(a=>{ if(a.c(s,f)) won.push(a); });
  return {stats:s, trophies:won.slice(0,5)};
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: RECRUTEUR] — offre de contrat pro, favorise le spectacle sur le
   ratio V/D propre (audit "Dana White Privilege"). res.stats.wars n'existe pas
   (res.stats={A,B} seulement) — le caractère "guerre" du combat est recalculé
   ici en ligne à partir des vraies stats A/B, sur le même principe que le
   moteur de saison. ==== */
function evaluateProOffer(f, res, oppRank){
  if(f.org!==0 || (f.proOfferCooldown||0)>0) return null;
  if(f.age>=26) return { forced:true, msg:'La limite d\u2019âge du circuit amateur (26 ans) est atteinte. Vous êtes forcé de passer professionnel aujourd\u2019hui ou de ranger les gants.' };
  const totalFights=f.W+f.L+f.D;
  if(totalFights<5) return null;
  const finishes=f.ko+f.sub;
  const hypeScore=(f.ko*3.5)+(f.sub*2.5)+f.W-(f.L*0.5);
  const upset=oppRank<=10 && res.method!=='Décision';
  let threshold=35; if(f.age<=20) threshold=55; if(f.age>=23) threshold=25;
  if(hypeScore>=threshold || upset || (rnd()<0.05 && hypeScore>15)){
    let msg='';
    if(upset) msg='Ton finish retentissant sur un membre du Top 10 national a fait le tour des réseaux. Les promoteurs frappent à la porte.';
    else if(finishes>=8) msg=`Avec ton style ultra-spectaculaire (${finishes} finitions) et ta réputation de tueur, le public pro te réclame malgré tes ${f.L} défaites.`;
    else if(f.age<=20) msg=`Tu n\u2019as que ${f.age} ans, mais ta maturité dans la cage affole les recruteurs régionaux. Tu es un prospect majeur.`;
    else msg='Tes résultats réguliers et ton classement sur le circuit IMMAF t\u2019ouvrent enfin les portes du monde professionnel.';
    return { forced:false, msg };
  }
  return null;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: NARRATIF_CONTEXTUEL] — citations médias générées par tags de
   combat. Corrigé par rapport au brouillon : l'UPSET utilise les rangs
   PRE-combat (myRankBefore/oppRankBefore, déjà calculés plus haut dans
   resolveFight) plutôt qu'un divRank() recalculé après coup — sinon la
   victoire elle-même fausse le classement avant que la condition ne soit
   vérifiée (même piège déjà rencontré et corrigé pour le leapfrog). ==== */
const NARRATIVES=[
  { tags:['WIN','RIVAL'], src:'Interview Octogone', txt:f=>`"Il a beaucoup parlé avant le combat. Aujourd'hui, on a vu qui était le vrai combattant. La page est tournée."` },
  { tags:['LOSS','RIVAL'], src:'Conférence de presse', txt:f=>`"C'est dur à avaler. Je le déteste toujours autant, mais ce soir il a été meilleur. Je vais retourner à la salle et on se recroisera."` },
  { tags:['WIN','RIVAL','KO'], src:'Commentateur', txt:f=>`"C'est la fin parfaite pour cette rivalité ! ${esc(f.name)} vient d'éteindre les lumières et de clore le débat de la manière la plus brutale qui soit !"` },
  { tags:['WIN','WAR'], src:'Tweet du Président', txt:f=>`"${esc(f.name)} et son adversaire viennent de nous offrir le combat de l'année. Les deux partent à l'hôpital, mais quel spectacle. Félicitations au vainqueur."` },
  { tags:['LOSS','WAR'], src:'Média Spécialisé', txt:f=>`"Même dans la défaite, la cote de popularité de ${esc(f.name)} va exploser. Une guerre absolue dans la cage ce soir."` },
  { tags:['WIN','SNOOZEFEST'], src:'Foule', txt:f=>`*Huées descendant des gradins pendant l'annonce de la décision.*` },
  { tags:['WIN','SNOOZEFEST'], src:'Tweet d\u2019un fan', txt:f=>`"Victoire tactique ou juste combat soporifique ? ${esc(f.name)} a fait le job, mais personne ne paiera un PPV pour revoir ça."` },
  { tags:['LOSS','SNOOZEFEST'], src:'Le Coin (Coach)', txt:f=>`"Tu l'as laissé voler les rounds. Tu n'as rien fait, il n'a rien fait, mais les juges lui ont donné. On ne peut s'en prendre qu'à nous-mêmes."` },
  { tags:['WIN','FLAWLESS','SUB'], src:'Expert Jiu-Jitsu', txt:f=>`"Une masterclass au sol. Il a emballé son adversaire sans prendre un seul coup. De l'art martial pur."` },
  { tags:['WIN','FLAWLESS','KO'], src:'Commentateur', txt:f=>`"C'était un meurtre télévisé. Zéro dégât encaissé, une précision chirurgicale. ${esc(f.name)} est intouchable ce soir."` },
  { tags:['WIN','PROSPECT','KO'], src:'Média Spécialisé', txt:f=>`"Le hype train est officiellement inarrêtable. À seulement ${f.age} ans, il nettoie la division avec une violence inouïe."` },
  { tags:['WIN','VETERAN'], src:'Interview Octogone', txt:f=>`"Ne m'enterrez pas trop vite. Les jeunes courent vite, mais je connais le chemin. J'ai encore de belles années devant moi."` },
  { tags:['LOSS','VETERAN'], src:'Tweet Analyste', txt:f=>`"Le combat de trop ? Il faut savoir raccrocher les gants. ${esc(f.name)} a semblé subir le poids des années ce soir."` },
  { tags:['WIN','UPSET'], src:'Commentateur', txt:f=>`"INCROYABLE ! Personne ne lui donnait la moindre chance ! ${esc(f.name)} vient de choquer le monde entier !"` },
];
function generateNarrativeQuote(f,p){
  const tags=[]; const st=p.res.stats;
  const totalSig=(st.A.sig||0)+(st.B.sig||0);
  const oppSig=p.win?st.B.sig:st.A.sig;
  tags.push(p.win?'WIN':'LOSS');
  if(p.method.startsWith('KO')) tags.push('KO');
  if(p.method.startsWith('Soum')) tags.push('SUB');
  if(p.method.startsWith('Déc')) tags.push('DEC');
  if(totalSig>90 || st.A.kd+st.B.kd>=2) tags.push('WAR');
  if(p.method.startsWith('Déc') && totalSig<30 && (st.A.ctrl<2 && st.B.ctrl<2)) tags.push('SNOOZEFEST');
  if(p.win && oppSig<=5) tags.push('FLAWLESS');
  if(p.opp && f.rivalId===p.opp.id) tags.push('RIVAL');
  if(f.age<=22) tags.push('PROSPECT');
  if(f.age>=34) tags.push('VETERAN');
  if(p.win && p.myRank-p.oppRank>5) tags.push('UPSET');
  const validQuotes=NARRATIVES.filter(n=>n.tags.every(t=>tags.includes(t)));
  if(validQuotes.length>0) return pick(validQuotes);
  if(p.win) return { src:'Déclaration', txt:f=>`"C'était le plan prévu. On retourne à l'entraînement dès lundi."` };
  return { src:'Déclaration', txt:f=>`"On gagne et on apprend. Je reviendrai plus fort."` };
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: ARCADE_GAUNTLET] — mode Draft Rapide, autonome, permadeath.
   Corrigé par rapport au brouillon : generateFighter() n'existe pas (utilise
   makeFighter() réel) ; les attrs fictifs à 5 clés (grappling, power seuls)
   sont remplacés par de vrais combattants à 30 attributs (avec des valeurs
   volontairement skewées pour le flavor) ; org:'gf' cassait ORGS[f.org]
   (index numérique attendu) ; alert() remplacé par de vrais écrans stylés.
   Ce mode ne touche JAMAIS resolveFight()/le circuit amateur/les saisons/les
   promotions — un flux de combat entièrement séparé, pour ne rien risquer
   sur le mode Carrière déjà testé. ==== */
function makeArcadeArchetype(spec){
  const f=makeFighter({gender:'H',div:spec.div,style:spec.style,countryKey:spec.country,first:spec.first,age:spec.age,potential:96,level:70});
  for(const k in spec.attrs) f.attrs[k]=spec.attrs[k];
  f.overall=overall(f); f.stage='pro'; f.org=4; f.morale=100; f.form=100;
  f.nick=spec.nick; f._perk=spec.perk; f.styleLabel=spec.styleLabel;
  if(spec.flag) f.flag=spec.flag; // drapeau de flavor, découplé du pays réel utilisé pour le patronyme
  return f;
}
/* 23 archétypes (audit "Draft Rapide"). Styles fictifs de Gemini (Sumo, Point
   Fighter, Capoeira, Kung Fu, Street, Showman...) n'existent pas dans le
   moteur : mappés sur le style RÉEL le plus proche pour le calcul, en gardant
   le styleLabel affiché tel quel. Pays hors des 14 réels (NL, JM, CO, AU, CN,
   CA) : countryKey substitué par un pays réel (patronyme), drapeau d'origine
   conservé pour l'affichage via le champ flag. */
const ARCADE_ARCHETYPES=[
  { nick:'Le Bûcheron', flag:'🇺🇸', country:'US', style:'boxer', styleLabel:'Bagarreur', div:'H-heavy', age:34,
    attrs:{power:95,chin:90,durability:88,strength:85,cardio:32,tdd:30,submission:15,footSpeed:30,handSpeed:55},
    perk:'Frapper fort, dormir tôt. Un cardio de fumeur mais une droite nucléaire.' },
  { nick:'L\u2019Anaconda', flag:'🇧🇷', country:'BR', style:'bjj', styleLabel:'Maître du Sol', div:'H-light', age:26,
    attrs:{submission:95,guardWork:90,topControl:80,flexibility:88,power:28,handSpeed:35,footSpeed:45,chin:60},
    perk:'Si le combat va au sol, c\u2019est terminé. S\u2019il reste debout, vous êtes mort.' },
  { nick:'Le Cyborg', flag:'🇷🇺', country:'RU', style:'sambo', styleLabel:'Machine', div:'H-welter', age:21,
    attrs:{takedown:78,cardio:90,power:70,tdd:75,submission:65,chin:80,strength:75},
    perk:'Le prospect parfait. Équilibré, increvable, programmé pour détruire.' },
  { nick:'Le Kaiju', flag:'🇯🇵', country:'JP', style:'wrestler', styleLabel:'Colosse', div:'H-heavy', age:32,
    attrs:{power:98,chin:95,durability:95,strength:95,cardio:18,footSpeed:15,handSpeed:30,takedown:60},
    perk:'Une anomalie physique colossale. Lent, lourd, mais chaque pas fait trembler la cage.' },
  { nick:'Le Tacticien', flag:'🏴', country:'GB', style:'karate', styleLabel:'Manager', div:'H-welter', age:38,
    attrs:{jab:70,cross:65,footSpeed:75,fightIQ:90,composure:90,cardio:85,power:35,chin:70},
    perk:'Il gère l\u2019économie de ses frappes comme un budget. Il ne prend aucun risque inutile.' },
  { nick:'Le Poids du Corps', flag:'🇫🇷', country:'FR', style:'mma', styleLabel:'Gymnaste', div:'H-light', age:23,
    attrs:{cardio:99,flexibility:90,takedown:70,submission:65,jab:60,cross:60,power:45,chin:65},
    perk:'Zéro fonte, que de la traction et de la mobilité. Une force fonctionnelle et une endurance hallucinante.' },
  { nick:'La Brique', flag:'🇫🇷', country:'FR', style:'boxer', styleLabel:'Incassable', div:'H-heavy', age:28,
    attrs:{jab:75,cross:80,hook:80,chin:99,durability:95,power:78,cardio:55,tdd:25},
    perk:'Dur au mal, taillé dans la brique rouge du nord. Littéralement impossible à mettre KO.' },
  { nick:'Le Botaniste', flag:'🇳🇱', country:'GE', style:'kickboxer', styleLabel:'Méthodique', div:'H-welter', age:25,
    attrs:{kick:90,cross:70,composure:85,fightIQ:80,cardio:80,power:60,chin:75},
    perk:'La patience est une vertu. Il laisse ses adversaires s\u2019épuiser avant de les cueillir.' },
  { nick:'Le Fantôme', flag:'🇮🇪', country:'IE', style:'karate', styleLabel:'Insaisissable', div:'H-light', age:27,
    attrs:{footSpeed:98,jab:85,cross:75,cardio:85,power:50,chin:35,durability:30},
    perk:'Touche sans être touché. S\u2019il prend un seul coup net, les lumières s\u2019éteignent.' },
  { nick:'Le Zombie', flag:'🇰🇷', country:'KR', style:'mma', styleLabel:'Mort-Vivant', div:'H-welter', age:35,
    attrs:{chin:99,durability:95,heart:95,hook:55,takedown:60,submission:55,cardio:75,power:55},
    perk:'Avance constamment en encaissant tout. La pression psychologique finit par briser l\u2019adversaire.' },
  { nick:'L\u2019Assassin', flag:'🇹🇭', country:'TH', style:'muayThai', styleLabel:'Clinch', div:'H-light', age:24,
    attrs:{clinchStr:95,kick:85,power:88,killer:85,chin:60,cardio:70},
    perk:'Des coudes tranchants comme des lames. Cherche l\u2019ouverture pour une hémorragie rapide.' },
  { nick:'La Pieuvre', flag:'🇷🇺', country:'RU', style:'wrestler', styleLabel:'Lutteur', div:'H-welter', age:30,
    attrs:{takedown:98,submission:80,topControl:85,chin:80,cardio:75,power:35,jab:15},
    perk:'Dès que ses mains vous touchent, vous volez. Il étouffe ses adversaires pendant 15 minutes.' },
  { nick:'Le Professeur', flag:'🇨🇦', country:'CM', style:'mma', styleLabel:'Vétéran', div:'H-heavy', age:41,
    attrs:{fightIQ:98,adaptability:90,jab:70,cross:70,takedown:65,submission:65,chin:55,cardio:45},
    perk:'Il a tout vu, tout fait. Son QI de combat est infini, mais son corps commence à le lâcher.' },
  { nick:'Flash', flag:'🇯🇲', country:'GE', style:'karate', styleLabel:'Acrobate', div:'H-light', age:22,
    attrs:{kick:88,footSpeed:95,explosiveness:90,power:70,chin:45,cardio:90},
    perk:'Des coups de pied retournés sortis de nulle part. Spectaculaire mais terriblement imprévisible.' },
  { nick:'Le Boucher', flag:'🇲🇽', country:'MX', style:'boxer', styleLabel:'Guerre', div:'H-welter', age:31,
    attrs:{jab:78,cross:82,hook:82,power:80,chin:88,heart:90,cardio:85},
    perk:'Transforme chaque combat en un bain de sang dans une cabine téléphonique.' },
  { nick:'L\u2019Ours', flag:'🇷🇺', country:'RU', style:'sambo', styleLabel:'Force Pure', div:'H-heavy', age:29,
    attrs:{strength:98,power:92,takedown:85,submission:80,chin:88,cardio:35},
    perk:'Peut soulever des montagnes. Mais au bout de trois minutes, il hiberne.' },
  { nick:'Le Gamin', flag:'🇺🇸', country:'US', style:'wrestler', styleLabel:'Phénomène', div:'H-light', age:19,
    attrs:{takedown:82,cardio:99,heart:85,chin:75,power:45,submission:55},
    perk:'Sort à peine du lycée. Une énergie inépuisable et une arrogance qui rend fou.' },
  { nick:'L\u2019Aristocrate', flag:'🇬🇧', country:'GB', style:'boxer', styleLabel:'Noble Art', div:'H-welter', age:33,
    attrs:{jab:92,cross:80,footSpeed:70,tdd:65,composure:85,power:65,chin:75,cardio:70},
    perk:'Un jab d\u2019une précision chirurgicale. Refuse d\u2019aller au sol, trouve ça salissant.' },
  { nick:'Le Moine', flag:'🇨🇳', country:'CM', style:'karate', styleLabel:'Spirituel', div:'H-light', age:36,
    attrs:{composure:95,discipline:95,jab:75,kick:75,chin:82,cardio:80,power:60},
    perk:'Ne ressent pas la douleur. Un état zen qui perturbe l\u2019algorithme des juges.' },
  { nick:'Le Contrebandier', flag:'🇨🇴', country:'MX', style:'mma', styleLabel:'Sale', div:'H-welter', age:27,
    attrs:{clinchStr:70,killer:85,aggression:88,power:78,chin:80,takedown:55,submission:50,cardio:65},
    perk:'Doigts dans les yeux, accrochages à la cage. Il utilise tout ce que l\u2019arbitre ne voit pas.' },
  { nick:'Le Surfer', flag:'🇦🇺', country:'BR', style:'bjj', styleLabel:'Détendu', div:'H-light', age:24,
    attrs:{submission:85,guardWork:88,composure:90,flexibility:80,power:42,chin:70,cardio:80},
    perk:'Arrive dans la cage en tongs. Soumet ses adversaires avec un grand sourire.' },
  { nick:'Le Météore', flag:'🇳🇬', country:'NG', style:'kickboxer', styleLabel:'Explosif', div:'H-welter', age:26,
    attrs:{kick:92,cross:80,power:96,explosiveness:92,chin:65,cardio:38},
    perk:'Le round 1 est une exécution publique. Le round 2 est une agonie respiratoire.' },
  { nick:'La Machine à Sous', flag:'🇺🇸', country:'US', style:'mma', styleLabel:'Superstar', div:'H-welter', age:30,
    attrs:{jab:70,cross:70,takedown:55,submission:45,power:72,chin:72,cardio:72,confidence:90},
    perk:'Stats moyennes, mais il attire la lumière. Capable d\u2019un miracle quand les caméras tournent.' },
];
function buildArcadePool(){
  const shuffled=ARCADE_ARCHETYPES.slice().sort(()=>0.5-rnd());
  return shuffled.slice(0,3).map(makeArcadeArchetype);
}
function genArcadeOpponent(streak){
  const div=G.f.div; const lv=clamp(G.f.overall-20+streak*5,30,99);
  const o=makeFighter({gender:'H',div,style:pick(STYLE_KEYS),level:lv,potential:clamp(lv+8,50,99),age:RI(23,34)});
  o.stage='pro'; o.org=4; o.W=RI(3,20); o.L=RI(0,6); o.ko=RI(0,o.W);
  return o;
}
function resolveArcadeFight(){
  const opp=G.arcade.opponent;
  const res=simulateFight(G.f,opp,3);
  const win=applyResult(G.f,opp,res,'A'); applyResult(opp,G.f,res,'B');
  { const last=G.f.history[G.f.history.length-1];
    if(last){ last.oppName=opp.name; last.oppFlag=opp.flag; last.oppRank='NR'; last.season=G.arcade.streak+1; } }
  G.fight={kind:'arcade',opp,rounds:3,plan:null};
  G.pending={res,win,method:res.method,finish:!res.method.startsWith('Déc'),opp:{name:opp.name,flag:opp.flag}};
  buildTimeline(); G.screen='arena'; save(); render();
}
function scr_draft(){ const pool=G.arcade.pool;
  let h=`<div class="scr"><div class="bar" style="border-bottom:2px solid var(--line);margin-bottom:24px;padding-bottom:8px">
   <span class="eyebrow mono" style="color:var(--blood)">DRAFT ARCADE // GAUNTLET</span></div>
   <p class="lede" style="margin-bottom:32px;font-size:15px">Survivez à 5 combats d\u2019affilée. La défaite est éliminatoire. Sélectionnez votre profil tactique.</p>`;
  pool.forEach((p,i)=>{
    h+=`<div style="margin-bottom:32px;padding-bottom:24px;border-bottom:1px solid var(--line)">
      <div style="display:flex;justify-content:space-between;align-items:baseline">
        <h3 class="disp" style="margin:0;font-size:28px;text-transform:uppercase">${p.nick} ${p.flag}</h3>
        <span class="mono muted">${p.styleLabel}</span>
      </div>
      <div style="margin:8px 0 16px 0;font-family:'Fraunces';font-style:italic;color:var(--muted);font-size:14.5px">« ${p._perk||''} »</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:20px 0" class="mono">
        <div style="background:var(--panel2);padding:8px 0;text-align:center"><span class="muted" style="font-size:10px;display:block">STRK</span><b style="font-size:18px">${Math.round((p.attrs.jab+p.attrs.cross+p.attrs.hook)/3)}</b></div>
        <div style="background:var(--panel2);padding:8px 0;text-align:center"><span class="muted" style="font-size:10px;display:block">GRAP</span><b style="font-size:18px">${Math.round((p.attrs.takedown+p.attrs.submission+p.attrs.topControl)/3)}</b></div>
        <div style="background:var(--panel2);padding:8px 0;text-align:center;border-bottom:2px solid var(--blood)"><span class="muted" style="font-size:10px;display:block">PUIS</span><b style="font-size:18px">${p.attrs.power}</b></div>
        <div style="background:var(--panel2);padding:8px 0;text-align:center"><span class="muted" style="font-size:10px;display:block">CARDIO</span><b style="font-size:18px">${p.attrs.cardio}</b></div>
      </div>
      <button class="btn" style="border-color:var(--text)" onclick="CL.selectDraft(${i})">SÉLECTIONNER CE PROFIL</button>
    </div>`;
  });
  h+=`<button class="btn ghost mt" style="border:none;color:var(--muted)" onclick="CL.go('title')">← Annuler</button></div>`;
  return h;
}
function scr_gameover(){ const a=G.arcade, f=G.f; const isVictory=a.streak>=a.target;
  return `<div class="scr" style="display:flex;flex-direction:column;justify-content:center;min-height:80vh">
   <div style="background:${isVictory?'var(--text)':'var(--blood)'};color:${isVictory?'var(--bg)':'#fff'};padding:24px;text-align:center;margin:0 -16px 32px -16px;border-top:4px solid var(--line);border-bottom:4px solid var(--line)">
     <h2 class="disp" style="margin:0;font-size:48px">${isVictory?'CHAMPION ARCADE':'R.I.P.'}</h2>
     <div class="mono" style="margin-top:8px;letter-spacing:.1em">${isVictory?'SURVIVANT DU GAUNTLET':'FIN DE LA RUN'}</div>
   </div>
   <div style="border-left:4px solid ${isVictory?'var(--text)':'var(--blood)'};padding-left:16px;margin-bottom:40px">
     <h3 class="disp" style="font-size:32px;margin:0 0 8px 0">${esc(f.nick||f.name)} ${f.flag}</h3>
     <p class="mono muted" style="font-size:14px;margin:0">PROFIL : ${(f.styleLabel||'').toUpperCase()}</p>
     <p class="mono" style="font-size:14px;margin:16px 0 0 0">SCORE : <b style="font-size:24px;color:${isVictory?'var(--text)':'var(--blood)'}">${a.streak}/${a.target}</b> VICTOIRES</p>
   </div>
   <div style="font-family:'Fraunces';font-style:italic;font-size:18px;color:var(--muted);margin-bottom:48px">
     ${isVictory?`« Contre toute attente, il a marché sur l\u2019algorithme. 5 cadavres laissés dans la cage. Le contrat est rempli. »`:`« Le combat de trop. L\u2019ascension s\u2019arrête net sur la toile de l\u2019octogone. Les lumières s\u2019éteignent. »`}
   </div>
   <button class="btn" style="padding:20px;font-size:18px;border-color:var(--text)" onclick="CL.retryArcade()">NOUVEAU RUN</button>
   <button class="btn ghost mt" onclick="CL.go('title')">${isVictory?'RETOURNER DANS L\u2019OMBRE':'ACCEPTER LA DÉFAITE'}</button>
   </div>`; }
function scr_arcadehub(){ const f=G.f, a=G.arcade;
  return `<div class="scr center intro"><div class="eyebrow" style="color:var(--blood)">GAUNTLET // RUN EN COURS</div>
   <h2 class="disp big" style="font-size:36px">${a.streak} / ${a.target}</h2>
   <p class="lede">${f.nick} ${f.flag} — ${recordStr(f)} sur ce run</p>
   <div class="card" style="text-align:left"><div class="eyebrow mb">Prochain adversaire</div>
     <div class="disp" style="font-size:22px">${esc(a.opponent.name)} ${a.opponent.flag}</div>
     <div class="muted small mt">${a.opponent.styleLabel} · ${a.opponent.age} ans · Overall ${a.opponent.overall}</div></div>
   <button class="btn primary mt" style="font-size:20px;padding:18px" onclick="CL.fightArcade()">COMBATTRE</button>
   <button class="btn ghost" onclick="CL.go('title')">Abandonner le run</button></div>`; }
/* ==== [FIN ANCRE] ==== */
function fightKind(){ const f=G.f; if(f.champion) return 'defense'; if(f.org>=4 && ((f.orgWins||0)>=3 || divRank(f)<=2)) return 'title'; return 'normal'; }

function resolveFight(){ const {opp,rounds,kind}=G.fight;
  // ==== [ANCRE: RANGS_AVANT] — capturés avant simulateFight/applyResult, car la
  // victoire elle-même modifie le classement : le leapfrog doit juger la
  // situation AVANT le combat ("j'étais outsider, j'ai battu un top 3"),
  // pas après (sinon la condition échoue la plupart du temps — vérifié). ====
  const myRankBefore=divRank(G.f), oppRankBefore=divRank(opp);
  // ==== [FIN ANCRE] ====
  // ==== [ANCRE: META05] — boost temporaire "dernier tour de piste".
  // Le jeu ne connaît que l'âge en années entières (pas de calendrier précis),
  // donc "dernier combat avant la retraite" est approximé par : le combattant
  // est déjà dans sa dernière année avant le seuil de retraite forcée. ====
  let retAgeForLastFight=42; if(G.f.skills&&G.f.skills.includes('meta01')) retAgeForLastFight+=2;
  const isLikelyLastFight=G.f.skills&&G.f.skills.includes('meta05')&&G.f.age>=retAgeForLastFight-1;
  const OFFENSIVE_CHANNELS=['power','handSpeed','kick','explosiveness','killer'];
  const savedAttrs={};
  if(isLikelyLastFight){ OFFENSIVE_CHANNELS.forEach(k=>{ savedAttrs[k]=G.f.attrs[k]; G.f.attrs[k]=clamp(G.f.attrs[k]+6,1,100); }); }
  // ==== [ANCRE: MALUS_EVENEMENT] — coupe de poids ratée / blessure mineure,
  // fusionné avec le mécanisme meta05 existant (même savedAttrs, restauration commune). ====
  if(G.fight.malus){ for(const k in G.fight.malus){
    if(savedAttrs[k]===undefined) savedAttrs[k]=G.f.attrs[k];
    G.f.attrs[k]=clamp(G.f.attrs[k]+G.fight.malus[k],1,100); } }
  // ==== [FIN ANCRE] ====
  const res=simulateFight(G.f,opp,rounds,G.fight.plan); const win=applyResult(G.f,opp,res,'A'); applyResult(opp,G.f,res,'B');
  // ==== [ANCRE: HISTORIQUE_ENRICHI] — la dernière entrée poussée par applyResult()
  // (partagée avec les combats PNJ en coulisses, donc jamais modifiée elle-même)
  // est enrichie ici, seulement pour le joueur, avec les infos d'affichage que
  // scr_history() a besoin (adversaire, rang au moment du combat, année). ====
  { const last=G.f.history[G.f.history.length-1];
    if(last){ last.oppName=opp.name; last.oppFlag=opp.flag; last.oppRank=oppRankBefore; last.season=(G.season&&G.season.year)||1; } }
  // ==== [FIN ANCRE] ====
  for(const k in savedAttrs){ G.f.attrs[k]=savedAttrs[k]; }
  if(Object.keys(savedAttrs).length) G.f.overall=overall(G.f);
  // ==== [FIN ANCRE] ====
  // ==== [ANCRE: CACHET] — bourse en milliers, selon l'organisation (audit économie) ====
  const basePurse=[0,2,8,25,80,150,400][G.f.org]||0;
  let purse=basePurse;
  if(win) purse+=basePurse;
  if(win && !res.method.startsWith('Déc')) purse+=50;
  if(G.f.champion) purse*=2.5;
  if(G.f.org===6) purse*=3.0; // Global Fortune paie énormément
  G.f.earnings=(G.f.earnings||0)+purse;
  // ==== [FIN ANCRE] ====
  // ==== [ANCRE: RIVALITE] — une défaite, ou une décision très serrée, crée une animosité ====
  const scoreDiff=Math.abs((res.scoreA||0)-(res.scoreB||0));
  if(!win || (res.method.startsWith('Déc') && scoreDiff<=8)){ G.f.rivalId=opp.id; }
  // ==== [FIN ANCRE] ====
  // ==== [ANCRE: LEAPFROG_CUT] — traçage de la facilité des combats + bond de classement,
  // et sanction si le joueur enchaîne trop d'adversaires trop faciles. ====
  let forced=false;
  const myRankNow=myRankBefore, oppRankNow=oppRankBefore;
  if(win){
    if(oppRankNow>myRankNow+4 && !opp.champion){ G.f.easyFights=(G.f.easyFights||0)+1; } else { G.f.easyFights=0; }
    if(oppRankNow<=3 && myRankNow>5){ G.f.rankBoost=(G.f.rankBoost||0)+60; }
  } else { G.f.easyFights=0; }
  let milestone='';
  if((G.f.easyFights||0)>=3){
    if(G.f.org>0){ G.f.org--; G.f.easyFights=0; G.f.champion=null; milestone='Rétrogradé d\u2019organisation : refus des défis.'; G.roster=makeOrgRoster(G.f); }
    else { G.f.retired=true; forced=true; milestone='Contrat coupé par l\u2019organisation.'; }
  }
  // ==== [FIN ANCRE] ====
  G.f.orgWins=win?((G.f.orgWins||0)+1):Math.max(0,(G.f.orgWins||0)-1);
  const finish=!res.method.startsWith('Déc');
  // titre
  if(win && kind==='title'){ G.f.champion=(G.f.org>=5?'monde':'europe'); G.f.titles++; G.roster.forEach(o=>o.champion=null); milestone=(G.f.org>=5?'🏆 CEINTURE MONDIALE':'🥈 CEINTURE EUROPÉENNE'); }
  else if(win && kind==='defense'){ G.f.defenses++; milestone='Titre défendu ('+G.f.defenses+')'; }
  else if(!win && G.f.champion){ G.f.champion=null; milestone='Titre perdu'; }
  // compétence débloquée ?
  const skill=rollSkill(G.f);
  // ==== [ANCRE: SAISON_TRACKING] — enregistrement du combat pour le bilan annuel ====
  if(!G.season) G.season={year:1,fights:[]};
  G.season.fights.push({ win, method:res.method, round:res.round, scoreA:res.scoreA, scoreB:res.scoreB,
    st:{Me:res.stats.A, Op:res.stats.B}, myRank:myRankBefore, oppRank:oppRankBefore,
    isTitle:(kind==='title'||kind==='defense') });
  // ==== [FIN ANCRE] ====
  // vieillissement (1 an ~ 2-4 combats) — rythme RÉEL inchangé (RI(2,4), pas un cycle fixe)
  let endOfSeason=false;
  G.f._fy=(G.f._fy||0)+1; if(G.f._fy>=RI(2,4)){ applyAging(G.f); G.f._fy=0; endOfSeason=true;
    // ==== [ANCRE: SANTE_GFL] — Global Fortune : suivi médical premium, régénère
    // le menton/résistance. Exception NARRATIVE délibérée à la règle "le menton
    // ne monte jamais" (habituellement réservée à la génétique) — approuvée
    // explicitement comme le privilège propre à cette ligue. ====
    if(G.f.org===6){ G.f.attrs.chin=clamp(G.f.attrs.chin+1,1,100); G.f.attrs.durability=clamp(G.f.attrs.durability+2,1,100); G.f.overall=overall(G.f); }
    // ==== [FIN ANCRE] ====
  }
  let retAge=42; if(G.f.skills.includes('meta01')) retAge+=2;
  if(!forced && (G.f.age>=retAge || (G.f.age>=38 && G.f.overall<48))){ G.f.retired=true; forced=true; }
  // ==== [ANCRE: CIRCUIT_AMATEUR] — remplace la promotion automatique org 0->1
  // par une offre de contrat pro (spectacle > ratio propre). Au-delà (org>=1),
  // la logique de promotion existante (canPromote) est inchangée, sauf à org 4
  // (Ligue européenne) où elle bascule vers le dilemme Apex/Global Fortune.
  // Au-delà (org 5 ou 6), canPromote n'est plus jamais appelée : ligue terminale.
  let proOffer=null, topTierOffer=false;
  if(G.f.org===0){
    if((G.f.proOfferCooldown||0)>0) G.f.proOfferCooldown--;
    const warThisFight=(res.stats.A.sig+res.stats.B.sig>60) || (res.stats.A.kd+res.stats.B.kd>=2);
    if(oppRankBefore<=15 && (!win || res.method.startsWith('Déc') || warThisFight)){
      G.f.amateurRivals=G.f.amateurRivals||[];
      if(!G.f.amateurRivals.find(r=>r.id===opp.id)) G.f.amateurRivals.push(opp);
    }
    if(win || G.f.age>=26){ proOffer=evaluateProOffer(G.f,res,oppRankBefore); }
  } else if(G.f.org<5){
    if(canPromote(G.f)){
      if(G.f.org===4){ topTierOffer=true; }
      else { G.f.org++; G.f.orgWins=0; G.f.champion=null; G.f.rivalId=null; G.roster=makeOrgRoster(G.f,G.roster); milestone=milestone||('Promotion : '+ORGS[G.f.org]); }
    }
  }
  // ==== [FIN ANCRE] ====
  // ==== [ANCRE: NARRATIF_APPEL] — généré avec les vraies données du combat,
  // avant que advanceRoster() ne remélange le classement. ====
  const narrative=generateNarrativeQuote(G.f,{win,method:res.method,res,opp,myRank:myRankBefore,oppRank:oppRankBefore});
  // ==== [FIN ANCRE] ====
  advanceRoster();
  const newAch=checkAch();
  G.pending={res,win,method:res.method,finish,milestone,skill,newAch,forced,planLabel:G.fight.planLabel,endOfSeason,proOffer,topTierOffer,narrative,
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

/* ==== [ANCRE: ECRAN_TITRE] — sas d'entrée séparant Carrière et Arcade.
   Adapté aux vrais gestionnaires existants : CL.go('intro') pour la carrière
   (reprendre/créer/panthéon), CL.startArcade() pour le Gauntlet — pas
   d'initCareer()/initArcade() qui n'existent pas. ==== */
function scr_title(){
  return `<div class="scr" style="display:flex;flex-direction:column;justify-content:center;min-height:80vh">
   <div style="text-align:center;margin-bottom:48px">
     <h1 class="disp" style="font-size:64px;line-height:.9;margin:0;letter-spacing:-.05em;color:var(--text)">CAGE<br>LEGACY</h1>
     <div class="mono muted" style="margin-top:16px;font-size:14px;letter-spacing:.2em;border-top:2px solid var(--line);border-bottom:2px solid var(--line);padding:8px 0">SIMULATEUR DE MANAGEMENT & ARCHIVES</div>
   </div>
   <button class="btn" style="font-size:20px;padding:24px;border-color:var(--text)" onclick="CL.go('intro')">CARRIÈRE COMPLÈTE
     <span class="mono muted" style="display:block;font-size:12px;margin-top:8px">Gérez l\u2019argent, les camps et l\u2019héritage</span></button>
   <button class="btn primary" style="font-size:20px;padding:24px;margin-top:16px" onclick="CL.startArcade()">GAUNTLET
     <span class="mono" style="display:block;font-size:12px;margin-top:8px;opacity:.8">Survivez à 5 combats avec un profil imposé</span></button>
   </div>`;
}
/* ==== [FIN ANCRE] ==== */
function scr_intro(){ const c=hasSave();
  return `<div class="scr center intro"><div class="theme-btn" onclick="CL.theme()">${G.theme==='light'?'🌙':'☀️'}</div>
   <div class="eyebrow">Simulateur de carrière MMA</div>
   <h1 class="disp big">CAGE<br>LEGACY</h1>
   <p class="lede">De l\u2019inconnu au panthéon. Chaque combat écrit ta légende.</p>
   ${c?`<button class="btn gold" onclick="CL.cont()">Reprendre</button>`:''}
   <button class="btn primary" onclick="CL.go('create')">${c?'Nouvelle carrière':'Commencer'}</button>
   <button class="btn ghost" onclick="CL.go('hof')">🏛️ Panthéon</button>
   <button class="btn ghost" onclick="CL.go('title')">← Retour au menu</button></div>`; }

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
  return `<div class="scr">
   <div class="bar" style="border-bottom:1px solid var(--line);padding-bottom:8px;margin-bottom:16px">
     <span class="eyebrow mono" onclick="CL.theme()" style="cursor:pointer">ID:${(''+f.id).padStart(4,'0')} // ${ORGS[f.org].toUpperCase()} // ${f.divName.toUpperCase()} ${G.theme==='light'?'🌙':'☀️'}</span>
     <span class="eyebrow mono">${f.earnings?f.earnings.toFixed(0)+'K $':'0 $'}</span>
   </div>
   <div style="margin-bottom:24px">
     <div class="fh" style="align-items:flex-end">
       <div class="nm" style="font-size:clamp(32px,9vw,48px);letter-spacing:-0.02em">${esc(f.name)}</div>
       <div class="fl" style="font-size:24px;padding-bottom:6px">${f.flag}</div>
     </div>
     ${f.nick?`<div class="nick" style="font-family:'Fraunces';font-size:18px;color:var(--muted)">« ${f.nick} »</div>`:''}
     <div class="sub" style="display:flex;justify-content:space-between;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:8px 0;margin-top:8px">
       <span class="mono">${f.styleLabel.toUpperCase()} / ${f.age} ANS</span>
       <span class="mono">${champ?`<b class="gold">${champ==='monde'?'CHAMP. MONDE':'CHAMP. EUROPE'}</b>`:`RANG: #${divRank(f)}`}</span>
     </div>
   </div>
   <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:24px">
     <div class="rec" style="font-size:32px;margin:0">${recordStr(f)}</div>
     <div class="muted mono small" style="text-align:right">${f.ko} KO / ${f.sub} SUB<br>${f.amaRec?`AMATEUR: ${f.amaRec.W}-${f.amaRec.L}`:'DÉBUTANT'}</div>
   </div>
   <div style="margin-bottom:24px">
     <div class="eyebrow" style="margin-bottom:8px">Derniers combats</div>
     ${last5(f)}
   </div>
   <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:32px">
     <div><span class="mono small muted" style="display:block;margin-bottom:4px">MORAL</span>${gauge(f.morale)}</div>
     <div><span class="mono small muted" style="display:block;margin-bottom:4px">FORME</span>${gauge(f.form)}</div>
   </div>
   <button class="btn primary" style="font-size:20px;padding:18px" onclick="CL.fightSelect()">Trouver un combat</button>
   <div class="g2"><button class="btn" onclick="CL.go('profile')">Profil</button><button class="btn" onclick="CL.go('rankings')">Classements</button></div>
   <div class="g2"><button class="btn ghost" onclick="CL.go('ach')">Palmarès & Trophées</button><button class="btn ghost" onclick="CL.go('history')">Archives</button></div>
   <button class="btn ghost" style="color:var(--loss)" onclick="CL.go('retire')">Retraite</button>
   </div>`; }

function scr_select(){ const f=G.f;
  let h=`<div class="scr">
   <div class="bar" style="border-bottom:2px solid var(--line);margin-bottom:24px;padding-bottom:8px">
     <span class="eyebrow mono">BUREAU DU MATCHMAKER // ${ORGS[f.org].toUpperCase()}</span>
   </div>
   <p class="lede" style="margin-bottom:32px;font-size:15px">Analysez les profils et signez le contrat. L\u2019ordre des propositions dicte le niveau de risque et la récompense au classement.</p>`;
  G.opps.forEach((e,i)=>{ const o=e.o;
    const isRival=(f.rivalId===o.id); const isAmaRival=(!isRival && o.isAmateurRival);
    const rnk=divRank(o); const rTag=rnk===1?'CHALLENGER #1':(rnk<=5?'TOP 5':`RANG #${rnk}`);
    // Trio de scouting calculé à partir des vrais attributs (pas de "grappling" scalaire dans le moteur)
    const striking=Math.round((o.attrs.jab+o.attrs.cross+o.attrs.hook+o.attrs.kick)/4);
    const grappling=Math.round((o.attrs.takedown+o.attrs.submission+o.attrs.topControl)/3);
    const danger=o.attrs.power;
    h+=`<div style="margin-bottom:32px;padding-bottom:24px;border-bottom:1px solid var(--line)">
      <div style="display:flex;justify-content:space-between;align-items:baseline">
        <h3 class="disp" style="margin:0;font-size:26px;${isRival?'color:var(--blood)':''}">${esc(o.name)} ${o.flag}</h3>
        <div class="mono small">
          ${isRival?'<span style="background:var(--blood);color:#fff;padding:2px 6px;margin-right:8px">RIVAL</span>':''}
          ${isAmaRival?'<span style="border:1px solid var(--sage);color:var(--sage);padding:2px 6px;margin-right:8px">RIVAL AMATEUR</span>':''}
          <span class="muted">${rTag}</span>
        </div>
      </div>
      <div class="sub mono" style="margin:6px 0 16px 0;color:var(--muted);font-size:14px">${o.age} ANS / RECORD: ${recordStr(o)} / ${o.styleLabel.toUpperCase()}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin:20px 0;font-size:14px" class="mono">
        <div style="border-left:3px solid var(--sage);padding-left:8px"><span class="muted" style="font-size:11px;display:block">STRIKING</span><b style="font-size:18px">${striking}</b></div>
        <div style="border-left:3px solid var(--muted);padding-left:8px"><span class="muted" style="font-size:11px;display:block">GRAPPLING</span><b style="font-size:18px">${grappling}</b></div>
        <div style="border-left:3px solid var(--blood);padding-left:8px"><span class="muted" style="font-size:11px;display:block">DANGER (KO)</span><b style="font-size:18px;color:var(--text)">${danger}</b></div>
      </div>
      <p class="event-text" style="font-size:13.5px;opacity:.9;margin:8px 0 16px">${e.read}</p>
      <button class="btn ${isRival?'primary':''}" style="margin-top:4px;font-size:15px;letter-spacing:.05em" onclick="CL.opp(${i})">${isRival?'RÉGLER LE CONTENTIEUX':'SIGNER LE CONTRAT'}</button>
    </div>`;
  });
  h+=`<button class="btn ghost mt" style="border:none" onclick="CL.go('hub')">← Retour au vestiaire</button></div>`;
  return h;
}

function scr_camp(){ const f=G.f;
  const deltaHtml=d=>d.map(([k,v])=>{ const lbl=k==='morale'?'Moral':k==='form'?'Forme':attrLabel(k);
     return `<span class="dlt ${v>=0?'up':'dn'}">${v>0?'+':''}${v} ${lbl}</span>`; }).join('');
  return `<div class="scr"><div class="bar"><span class="eyebrow">Camp d\u2019entraînement</span><span class="eyebrow x" onclick="CL.go('select')">✕</span></div>
   <p class="lede small">Un seul axe avant ce combat. Chaque choix <b>monte et baisse</b> des attributs (bornés par ton potentiel).</p>
   ${G.train.map((t,i)=>`<div class="opp" onclick="CL.train(${i})"><div class="opp-top"><span class="opp-nm">${t.label}</span></div>
      <div class="opp-mid">${t.hint}</div><div class="dlts">${deltaHtml(t.d)}</div></div>`).join('')}
   </div>`; }

/* ==== [ANCRE: PLAN_COMBAT] — vestiaire, choix tactique juste avant le combat ==== */
function scr_plan(){ const f=G.f, opp=G.fight.opp; const plans=TACTICS[f.style]||[];
  return `<div class="scr"><div class="bar"><span class="eyebrow">Vestiaire · Plan de combat</span></div>
   <div class="card raise" style="border-color:var(--gold-d)">
     <div class="disp">VS ${esc(opp.name)}</div>
     <div class="muted small">${tacticalRead(f,opp)}</div>
   </div>
   <p class="lede small mt">Quelle est ta consigne tactique pour ce combat ? Cela modifiera radicalement ton comportement dans la cage.</p>
   ${plans.map((p,i)=>`<div class="opp" onclick="CL.choosePlan(${i})">
     <div class="opp-top"><span class="opp-nm gold">${p.lbl}</span></div>
     <div class="opp-read" style="margin-top:4px;opacity:1">${p.desc}</div></div>`).join('')}
   </div>`; }
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: NARRATION] — log texte à partir de res.log/res.stats, déjà calculés ==== */
function fightLog(res){ if(!res.log||!res.log.length)return '<span class="muted small">Décision aux cartes.</span>';
  const rows=res.log.map(L=>`<div class="log-row ${L.finish?'gold':''}"><span class="log-r">R${L.r}</span><span style="flex:1">${L.text||(L.phase==='sol'?'échanges au sol':'échanges debout')}</span></div>`);
  if(res.method.startsWith('Déc')) rows.push(`<div class="log-row gold"><span class="log-r">R${res.round||3}</span><span style="flex:1">${res.method}${res.detail?' — '+res.detail:''}</span></div>`);
  return `<div class="fight-log" style="max-height:220px;overflow-y:auto;padding-right:5px">${rows.join('')}</div>`; }
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
   ${p.planLabel?`<div class="tag gold" style="margin-top:4px;border-color:var(--gold-d)">Tactique : ${p.planLabel}</div>`:''}
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
   ${p.narrative?`<div class="card" style="border-left:3px solid var(--gold);background:var(--panel2)"><div class="eyebrow mb">${p.narrative.src}</div><div style="font-style:italic;color:var(--text);font-size:14.5px">${p.narrative.txt(f)}</div></div>`:''}
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
  let h=`<div class="scr">
   <div class="bar" style="border-bottom:2px solid var(--line);margin-bottom:24px;padding-bottom:8px">
     <span class="eyebrow mono" style="letter-spacing:.1em">BASE DE DONNÉES // ${ORGS[f.org].toUpperCase()} // ${f.divName.toUpperCase()}</span>
   </div>
   <div style="display:flex;border-bottom:1px solid var(--text);padding-bottom:4px;margin-bottom:8px;font-size:11px;color:var(--muted)" class="mono">
     <div style="width:32px">RANG</div><div style="flex:1">IDENTITÉ</div><div style="width:70px;text-align:right">RECORD</div><div style="width:70px;text-align:right">STATUT</div>
   </div>`;
  dr.slice(0,13).forEach((o,i)=>{ const isPlayer=(o===f); const rank=i+1;
    let arrow='–'; let arrowColor='var(--muted)';
    if(o.lastRankDelta>0){arrow='▲';arrowColor='var(--win)';} if(o.lastRankDelta<0){arrow='▼';arrowColor='var(--loss)';}
    const statusStr=o.champion?'CHAMPION':(rank<=5?'TOP 5':arrow);
    const rowBg=isPlayer?'background:var(--text);color:var(--bg)':'';
    h+=`<div style="display:flex;align-items:center;padding:10px 0;border-bottom:1px dotted var(--line);font-size:15px;${rowBg}">
      <div class="mono" style="width:32px;font-size:15px;${o.champion&&!isPlayer?'color:var(--gold)':''}">${o.champion?'C':rank}</div>
      <div style="flex:1;display:flex;flex-direction:column">
        <span class="disp" style="font-size:17px;line-height:1.1">${esc(o.name)} ${o.flag}${isPlayer?' <span class="mono" style="font-size:11px">(TOI)</span>':''}</span>
        <span class="mono" style="font-size:10.5px;opacity:.7">${(o.styleLabel||'').toUpperCase()}</span>
      </div>
      <div class="mono" style="width:70px;text-align:right;font-size:14px">${o.W}-${o.L}</div>
      <div class="mono" style="width:70px;text-align:right;font-size:10.5px;opacity:.7;${!o.champion?('color:'+arrowColor):''}">${statusStr}</div>
    </div>`;
  });
  h+=`<button class="btn ghost mt" style="border:none" onclick="CL.go('hub')">← Revenir au hub</button></div>`;
  return h;
}

function scr_event(){ const ev=G.activeEvent;
  return `<div class="scr center intro"><div class="eyebrow blood">Événement imprévu</div>
   <h2 class="disp">${ev.title}</h2><p class="lede">${ev.text}</p>
   <button class="btn primary" onclick="CL.handleEvent()">${ev.btn}</button></div>`; }

/* ==== [ANCRE: ECRAN_SAISON] — 'eval' renommé en 'seasonEval' : mot réservé en
   mode strict, une déclaration const eval=... provoque une SyntaxError. ==== */
function scr_season(){ const f=G.f; const sData=G.season||{year:1,fights:[]};
  const seasonEval=evaluateSeason(f,sData.fights); const s=seasonEval.stats;
  return `<div class="scr center intro"><div class="eyebrow gold">Bilan Saisonnier</div>
   <h2 class="disp big">Année ${sData.year}</h2>
   <div class="card gold-b" style="margin:20px 0">
     <div class="disp" style="font-size:22px">Bilan : ${s.W} V - ${s.L} D</div>
     <div class="muted small mt">${s.koW} KO | ${s.subW} SUB | ${s.decW} DÉC</div>
     <div class="hr"></div>
     <div class="g2" style="font-family:'JetBrains Mono';font-size:12px;color:var(--muted)">
       <div>Frappes : ${s.sigMe}</div><div>Takedowns : ${s.tdMe}</div></div>
   </div>
   <h3 class="disp" style="font-size:18px;color:var(--gold);margin-bottom:10px">Trophées de la Saison</h3>
   ${seasonEval.trophies.length>0?
     `<div class="pills" style="justify-content:center">${seasonEval.trophies.map(t=>`<span class="pill on" style="margin-bottom:8px">🏆 ${t.lbl}</span>`).join('')}</div>`
     : `<p class="muted small">Saison de transition. Aucun trophée majeur remporté cette année.</p>`}
   <button class="btn primary mt" onclick="CL.nextSeason()">Passer à l\u2019année suivante</button></div>`; }
/* ==== [FIN ANCRE] ==== */

function scr_contract(){ const f=G.f; const offer=G.pending.proOffer;
  return `<div class="scr center intro"><div class="eyebrow gold">Offre de Contrat Professionnel</div>
   <h2 class="disp big" style="font-size:32px">Le Grand Bain</h2>
   <div class="card gold-b" style="margin:20px 0;text-align:left">
     <p class="lede" style="color:var(--text)">"${offer.msg}"</p>
     <div class="hr"></div>
     <div class="muted small">Si tu acceptes, ton palmarès sera réinitialisé à 0-0 pour ta carrière Pro. Ton record amateur (${f.W}-${f.L}) restera gravé dans ta fiche.</div>
   </div>
   <button class="btn primary mt" onclick="CL.acceptPro()">Signer le contrat</button>
   ${!offer.forced?`<button class="btn ghost mt" onclick="CL.declinePro()">Faire une saison de plus</button>`:''}
   </div>`; }

/* ==== [ANCRE: SOMMET] — dilemme Apex Legacy (gloire) vs Global Fortune (argent+santé) ==== */
function scr_toptier(){
  return `<div class="scr center intro"><div class="eyebrow gold">Le Sommet du Monde</div>
   <h2 class="disp big" style="font-size:30px">L\u2019Heure du Choix</h2>
   <p class="lede">Vous avez conquis l\u2019Europe. Les deux plus grandes organisations mondiales vous offrent un contrat d\u2019exclusivité. Votre décision est définitive.</p>
   <div class="card" style="border-color:var(--blood);text-align:left">
     <h3 class="disp" style="margin:0;color:var(--blood)">APEX LEGACY (Gloire)</h3>
     <p class="muted small mt">L\u2019organisation la plus prestigieuse et brutale au monde. Le niveau d\u2019opposition y est effrayant (+4 OVR pour tous les adversaires). Les salaires sont standards, mais c\u2019est ici que s\u2019écrit l\u2019Histoire.</p>
     <button class="btn primary" onclick="CL.signTopTier(5)">Signer chez Apex</button>
   </div>
   <div class="card" style="border-color:var(--sage);text-align:left;margin-top:15px">
     <h3 class="disp" style="margin:0;color:var(--sage)">GLOBAL FORTUNE (Argent & Santé)</h3>
     <p class="muted small mt">La ligue des millionnaires. Les salaires sont multipliés par 3. Le niveau y est élite mais régulé, et le suivi médical de pointe restaure virtuellement votre intégrité physique (Menton) au fil des mois.</p>
     <button class="btn" style="background:var(--sage);color:#fff;border:none" onclick="CL.signTopTier(6)">Signer chez Global Fortune</button>
   </div></div>`; }
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: ECRAN_HISTORIQUE] — corrigé par rapport au brouillon : l'ordre
   de stockage réel est chronologique croissant (push, pas unshift) car
   last5() en dépend déjà (slice(-5) = les plus récents) ; on inverse
   seulement à L'AFFICHAGE ici, sans toucher au stockage. res vaut 'win'/
   'loss' dans le vrai moteur (pas 'W'/'L'/'D') ; converti ici pour l'affichage
   sans changer le format stocké. Les entrées d'avant cette fonctionnalité
   n'ont pas oppName/oppRank/season : repli explicite sur '—'. ==== */
function scr_history(){ const f=G.f; const history=(f.history||[]).slice().reverse();
  const totalFights=f.W+f.L+(f.D||0);
  const winRate=totalFights>0?Math.round((f.W/totalFights)*100):0;
  const earningsStr=(f.earnings||0).toFixed(0);
  let h=`<div class="scr">
   <div class="bar" style="border-bottom:2px solid var(--line);margin-bottom:24px;padding-bottom:8px">
     <span class="eyebrow mono">DOSSIER ATHLÈTE // ARCHIVES PERSONNELLES</span>
   </div>
   <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:32px">
     <div style="border:1px solid var(--line);padding:16px"><div class="mono muted" style="font-size:11px;margin-bottom:8px">GAINS EN CARRIÈRE</div><div class="disp" style="font-size:32px">${earningsStr}K $</div></div>
     <div style="border:1px solid var(--line);padding:16px"><div class="mono muted" style="font-size:11px;margin-bottom:8px">EFFICACITÉ (WIN RATE)</div><div class="disp" style="font-size:32px">${winRate}%</div></div>
   </div>
   <h3 class="disp" style="font-size:24px;margin-bottom:16px">REGISTRE DES AFFRONTEMENTS</h3>`;
  if(history.length===0){
    h+=`<div class="mono muted" style="padding:24px 0;border-top:1px dotted var(--line)">Aucune donnée archivée.</div>`;
  } else {
    h+=`<div style="display:flex;border-bottom:1px solid var(--text);padding-bottom:4px;margin-bottom:12px;font-size:11px;color:var(--muted)" class="mono">
      <div style="width:36px">RES</div><div style="flex:1">ADVERSAIRE</div><div style="width:50px;text-align:center">SAIS.</div><div style="width:90px;text-align:right">MÉTHODE</div></div>`;
    history.forEach(fight=>{
      const resLetter=fight.res==='win'?'W':(fight.res==='loss'?'L':'D');
      const resColor=resLetter==='W'?'var(--win)':(resLetter==='L'?'var(--loss)':'var(--muted)');
      const resText=resLetter==='W'?'VICTOIRE':(resLetter==='L'?'DÉFAITE':'NUL');
      const oppName=fight.oppName||'Adversaire inconnu';
      const oppRank=fight.oppRank?(fight.oppRank==='NR'?'NR':'#'+fight.oppRank):'—';
      const season=fight.season||'—';
      const method=(fight.method||'DÉC').split(' ')[0];
      h+=`<div style="display:flex;align-items:center;padding:12px 0;border-bottom:1px solid var(--panel2);font-size:15px">
        <div class="mono" style="width:36px;font-weight:bold;color:${resColor};font-size:16px">${resLetter}</div>
        <div style="flex:1;display:flex;flex-direction:column">
          <span class="disp" style="font-size:17px;line-height:1.1">${esc(oppName)} ${fight.oppFlag||''} <span style="font-size:11px;opacity:.5">(${oppRank})</span></span>
          <span class="mono" style="font-size:10.5px;opacity:.7;color:${resColor}">${resText}</span>
        </div>
        <div class="mono" style="width:50px;text-align:center;font-size:12px;opacity:.7">S${season}</div>
        <div class="mono" style="width:90px;text-align:right;font-size:12px">${method}${fight.round?' (R'+fight.round+')':''}</div>
      </div>`;
    });
  }
  h+=`<button class="btn ghost mt" style="border:none" onclick="CL.go('hub')">← Retourner au bureau</button></div>`;
  return h;
}
/* ==== [FIN ANCRE] ==== */
function scr_ach(){ G.ach=G.ach||[];
  return `<div class="scr">
   <div class="bar" style="border-bottom:2px solid var(--line);margin-bottom:24px;padding-bottom:8px">
     <span class="eyebrow mono" style="letter-spacing:.1em">DOSSIER // PALMARÈS ${G.ach.length}/${ACH.length}</span>
   </div>
   ${ACH.map(a=>{const got=G.ach.includes(a.id);return `<div class="ach ${got?'':'lk'}"><span class="ico">${a.ico}</span><span><b class="${got?'gold':''}">${a.h}</b><div class="muted small">${a.d}</div></span></div>`;}).join('')}
   <button class="btn ghost mt" style="border:none" onclick="CL.go('hub')">← Revenir au hub</button></div>`; }

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

const SCREENS={title:scr_title,intro:scr_intro,create:scr_create,hub:scr_hub,select:scr_select,camp:scr_camp,arena:scr_arena,
  result:scr_result,profile:scr_profile,rankings:scr_rankings,ach:scr_ach,retire:scr_retire,legacy:scr_legacy,hof:scr_hof,event:scr_event,plan:scr_plan,season:scr_season,contract:scr_contract,toptier:scr_toptier,
  draft:scr_draft,arcadehub:scr_arcadehub,gameover:scr_gameover,history:scr_history};

/* ============================== RENDER + CL =============================== */
function render(){ const app=document.getElementById('app'); if(!app)return;
  const fn=SCREENS[G&&G.screen]||scr_intro; app.innerHTML=fn(); if(G&&G.screen==='arena') startArena(); window.scrollTo&&window.scrollTo(0,0); }
const CL={
  theme(){ setTheme(G.theme==='light'?'dark':'light'); save(); render(); },
  go(s){ if(!G)G={theme:'dark'}; G.screen=s; render(); },
  cont(){ if(load()){ setTheme(G.theme||'dark'); G.screen='hub'; render(); } },
  draft(k,v){ G.draft[k]=v; if(k==='gender')G.draft.div=DIVISIONS[v][Math.min(3,DIVISIONS[v].length-1)].id; render(); },
  draftIn(k,v){ G.draft[k]=v; },
  create(){ const d=G.draft; const f=makeFighter({gender:d.gender,div:d.div,style:d.style,countryKey:d.country,first:(d.first||'').trim()||undefined,age:RI(15,16),potential:RI(70,94)});
    f.stage='amateur'; f.org=0; f._fy=0;
    // ==== [ANCRE: META02] — legs du mentor, consommé une seule fois ====
    try{ if(localStorage.getItem('cage-legacy-mentor-bonus')==='true'){
      for(const k in f.attrs) f.attrs[k]=clamp(f.attrs[k]+2,1,100);
      f.overall=overall(f); localStorage.removeItem('cage-legacy-mentor-bonus'); } }catch(e){}
    // ==== [FIN ANCRE] ====
    G.f=f; G.roster=makeOrgRoster(f); G.ach=[]; G.season={year:1,fights:[]}; checkAch(); G.screen='hub'; save(); render(); },
  fightSelect(){ startFightSelect(); },
  opp(i){ chooseOpponent(i); },
  train(i){ chooseTraining(i); },
  skipArena(){ CL.toResult(); },
  handleEvent(){ const ev=G.activeEvent;
    if(ev.actionId==='major_injury'){ const f=G.f;
      f._fy=(f._fy||0)+1; if(f._fy>=RI(2,4)){ applyAging(f); f._fy=0; }
      f.form=clamp(f.form-20,0,100); advanceRoster(); G.screen='hub'; save(); render();
    } else { proceedToFight(); }
  },
  choosePlan(idx){ const planObj=(TACTICS[G.f.style]||[])[idx]; if(!planObj)return;
    G.fight.plan=planObj.m; G.fight.planLabel=planObj.lbl;
    resolveFight(); buildTimeline(); G.screen='arena'; save(); render(); },
  toResult(){ stopArena(); G.screen='result'; save(); render(); },
  afterResult(){
    if(G.arcade && G.arcade.active){
      const win=G.pending&&G.pending.win;
      if(!win){ G.arcade.active=false; G.screen='gameover'; save(); render(); return; }
      G.arcade.streak++;
      if(G.arcade.streak>=G.arcade.target){ G.arcade.active=false; G.screen='gameover'; save(); render(); return; }
      G.f.form=Math.min(100,G.f.form+20);
      G.arcade.opponent=genArcadeOpponent(G.arcade.streak);
      G.screen='arcadehub'; save(); render(); return;
    }
    const p=G.pending; G.screen=(p&&p.proOffer)?'contract':(p&&p.topTierOffer)?'toptier':(p&&p.endOfSeason)?'season':'hub'; save(); render(); },
  startArcade(){ G.arcade={active:true,streak:0,target:5,pool:buildArcadePool()}; G.screen='draft'; save(); render(); },
  selectDraft(i){ G.f=G.arcade.pool[i]; G.arcade.opponent=genArcadeOpponent(0); G.screen='arcadehub'; save(); render(); },
  retryArcade(){ CL.startArcade(); },
  fightArcade(){ resolveArcadeFight(); },
  signTopTier(orgId){ G.f.org=orgId; G.f.orgWins=0; G.f.champion=null; G.f.rivalId=null; if(G.pending)G.pending.topTierOffer=false;
    G.roster=makeOrgRoster(G.f,G.roster);
    if(orgId===5){ G.roster.forEach(o=>{ o.overall=clamp(o.overall+4,30,99); o.attrs.fightIQ=clamp(o.attrs.fightIQ+5,1,100); }); }
    G.screen='hub'; save(); render(); },
  acceptPro(){ turnPro(); G.f.org=1; G.roster=makeOrgRoster(G.f,'PRO_TRANSITION'); if(G.pending)G.pending.proOffer=null; G.screen='hub'; save(); render(); },
  declinePro(){ G.f.proOfferCooldown=3; if(G.pending)G.pending.proOffer=null; G.screen='hub'; save(); render(); },
  nextSeason(){ G.season.year++; G.season.fights=[]; if(G.pending) G.pending.endOfSeason=false; G.screen='hub'; save(); render(); },
  toLegacy(){ if(G.f.skills&&G.f.skills.includes('meta02')){ try{ localStorage.setItem('cage-legacy-mentor-bonus','true'); }catch(e){} }
    G.f.retired=true; enshrine(G.f); G.screen='legacy'; save(); render(); },
  newCareer(){ wipe(); const t=G.theme; G={theme:t,draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:''}}; setTheme(t); CL.go('create'); },
  exportSave(){ try{ const blob=JSON.stringify(G); const ta=document.createElement('textarea'); ta.value=blob; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select();
      try{ document.execCommand('copy'); alert('Sauvegarde copiée — colle-la dans un fichier texte pour la garder.'); }catch(e){ prompt('Copie ce texte :',blob); }
      document.body.removeChild(ta); }catch(e){ alert('Export impossible.'); } },
  importSave(){ const s=prompt('Colle ta sauvegarde ici :'); if(!s)return; try{ G=migrate(JSON.parse(s)); validateState(); setTheme(G.theme||'dark'); G.screen='hub'; save(); render(); }catch(e){ alert('Sauvegarde invalide ou corrompue.'); } },
};
window.CL=CL;
/* ============================ ARÈNE 2D & HYBRIDE ========================== */
/* Rejoue le combat round par round à partir de res.log (maintenant granulaire :
   plusieurs sous-événements textuels par round, momentum, dégâts par zone),
   en cohérence stricte avec le résultat du moteur (même vainqueur, méthode,
   round). Silhouettes dans la DA archive : oxblood = joueur, sage = adversaire.
   res.rounds n'existe pas (le champ réel est res.round, singulier) — corrigé
   ici par rapport au brouillon reçu. */
let ARENA=null;
const BEAT_MS=750; // ralenti pour laisser le temps de lire le flux narratif
function buildTimeline(){
  const res=G.pending.res, you=G.f, opp=G.fight.opp, meWin=G.pending.win;
  const log=(res.log&&res.log.length)?res.log:[];
  const beats=log.map(L=>({phase:L.phase,by:L.by,round:L.r,finish:L.finish,method:L.method,
    text:L.text,momentum:L.momentum,snapA:L.snapA,snapB:L.snapB}));
  if(res.method.startsWith('Déc')) beats.push({phase:'bell',finish:true,method:res.method,round:res.round||3,text:'[00:00] Fin du combat. Décision des juges.'});
  let hMeEnd=60,hOpEnd=60;
  if(res.method.startsWith('Déc')){ const s=res.scoreA+res.scoreB||1; hMeEnd=clamp(20+70*res.scoreA/s,12,92); hOpEnd=clamp(20+70*res.scoreB/s,12,92); }
  else { if(meWin){hOpEnd=res.method.startsWith('KO')?4:22; hMeEnd=clamp(45+RI(0,25));} else {hMeEnd=res.method.startsWith('KO')?4:22; hOpEnd=clamp(45+RI(0,25));} }
  ARENA={beats,idx:-1,started:false,done:false,raf:0,to:0,t0:0,lastBeat:-1,
    hMe:100,hOp:100,stMe:100,stOp:100,hMeEnd,hOpEnd,
    flashMe:0,flashOp:0,shakeMe:0,shakeOp:0,lungeMe:0,lungeOp:0,fall:0,tap:0,method:res.method,meWin,
    currentMomentum:50,snapA:{h:0,b:0,l:0},snapB:{h:0,b:0,l:0},
    nmeName:you.first,nopName:opp.first,meFlag:you.flag,opFlag:opp.flag};
}
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
  if(b.phase==='bell'){ A.currentText=b.text; return; }
  const dmg = b.phase==='sol'? RI(4,9) : RI(6,13);
  if(b.by==='me'){ A.hOp=clamp(A.hOp-dmg,A.hOpEnd*0.6,100); A.flashOp=1; A.shakeOp=1; A.lungeMe=1; }
  else { A.hMe=clamp(A.hMe-dmg,A.hMeEnd*0.6,100); A.flashMe=1; A.shakeMe=1; A.lungeOp=1; }
  A.stMe=clamp(A.stMe-RI(2,5),12,100); A.stOp=clamp(A.stOp-RI(2,5),12,100);
  if(b.finish){ if(b.method&&b.method.startsWith('KO')){ if(A.meWin){A.hOp=2;A.fall=2;} else {A.hMe=2;A.fall=1;} }
    else if(b.method&&b.method.startsWith('Soum')){ A.tap=A.meWin?2:1; } }
  A.curPhase=b.phase; A.curTop=(b.phase==='sol')?(b.by==='me'?'me':'op'):null;
  A.currentText=b.text; A.currentMomentum=b.momentum;
  if(b.snapA) A.snapA=b.snapA; if(b.snapB) A.snapB=b.snapB;
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
  ctx.strokeStyle=col; ctx.lineWidth=6; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(-3,4); ctx.lineTo(-10,46); ctx.moveTo(4,4); ctx.lineTo(12,46); ctx.stroke();
  ctx.lineWidth=15; ctx.beginPath(); ctx.moveTo(0,-6); ctx.lineTo(0,26); ctx.stroke();
  ctx.fillStyle=col; ctx.beginPath(); ctx.arc(0,-20,9,0,7); ctx.fill();
  ctx.lineWidth=6;
  const reach=o.lunge;
  ctx.beginPath(); ctx.moveTo(0,2); ctx.lineTo(-face*8,-10); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(face*(10+reach*20), -8+reach*4); ctx.stroke();
  ctx.fillStyle=o.flash?'#fff':color; ctx.beginPath(); ctx.arc(face*(10+reach*20),-8+reach*4,4.5,0,7); ctx.fill();
  ctx.restore();
}
function drawArena(frac,freeze){ const A=ARENA, ctx=A.ctx; if(!ctx)return; const W=A.W,H=A.H;
  ctx.clearRect(0,0,W,H);
  const gY=H-24;
  const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#1c1710'); g.addColorStop(1,'#241d14');
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='#3a2f20'; ctx.lineWidth=1;
  for(let i=0;i<=8;i++){ const x=i*W/8; ctx.globalAlpha=.5; ctx.beginPath(); ctx.moveTo(x,gY); ctx.lineTo(x*0.6+W*0.2,H*0.34); ctx.stroke(); }
  ctx.globalAlpha=1; ctx.strokeStyle='#4a3c1f'; ctx.beginPath(); ctx.moveTo(0,gY); ctx.lineTo(W,gY); ctx.stroke();
  const grounded=A.curPhase==='sol';
  fighter(ctx, W*0.66, gY, -1, '#6E8478', {lunge:A.lungeOp*(1-frac),flash:A.flashOp>0,shake:A.shakeOp>0,fallen:A.fall===2,grounded,top:A.curTop==='op'});
  fighter(ctx, W*0.34, gY, 1, '#B23B36', {lunge:A.lungeMe*(1-frac),flash:A.flashMe>0,shake:A.shakeMe>0,fallen:A.fall===1,grounded,top:A.curTop==='me'});
  A.flashMe=Math.max(0,A.flashMe-0.5); A.flashOp=Math.max(0,A.flashOp-0.5);
  A.shakeMe=Math.max(0,A.shakeMe-0.5); A.shakeOp=Math.max(0,A.shakeOp-0.5);
  A.lungeMe*=0.86; A.lungeOp*=0.86;
  ctx.font="600 11px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillStyle='#9A8F7C';
  const rnd=A.beats[A.lastBeat]?A.beats[A.lastBeat].round:1;
  let label = grounded?'SOL':'DEBOUT';
  if(A.done){ label = A.method.startsWith('Déc')?'AUX POINTS': (A.method.startsWith('KO')?'KO / TKO':'SOUMISSION'); ctx.fillStyle='#C6A15B'; ctx.font="700 14px 'Oswald'"; }
  ctx.fillText(A.done?label:('ROUND '+rnd+' · '+label), W/2, 20);
  if(A.tap){ ctx.fillStyle='#C6A15B'; ctx.font="700 13px 'Oswald'"; ctx.fillText('TAP !', A.tap===1?W*0.34:W*0.66, gY-70); }
}
function stopArena(){ if(ARENA){ if(ARENA.raf&&typeof cancelAnimationFrame!=='undefined')cancelAnimationFrame(ARENA.raf); if(ARENA.to)clearTimeout(ARENA.to); } }
function scr_arena(){ const A=ARENA||{};
  return `<div class="fade"><div class="eyebrow center">${esc(A.nmeName||'')} ${A.meFlag||''} vs ${A.opFlag||''} ${esc(A.nopName||'')}</div>
   <div class="card raise" style="padding:10px;border-color:var(--gold-d)">
     <div style="height:5px;background:var(--sage);margin-bottom:12px;position:relative;overflow:hidden">
       <div id="ar-momentum" style="height:100%;width:50%;background:var(--blood);transition:width .4s ease"></div>
       <div style="position:absolute;left:50%;top:0;bottom:0;width:1px;background:var(--bg)"></div>
     </div>
     <div class="arena-hud">
       <div style="display:flex;flex-direction:column">
         <span class="ah-name blood">${esc(A.nmeName||'Toi')}</span>
         <div style="display:flex;gap:3px;margin-top:3px">
           <div id="dm-h" style="width:10px;height:10px;background:var(--sage)" title="Tête"></div>
           <div id="dm-b" style="width:10px;height:10px;background:var(--sage)" title="Corps"></div>
           <div id="dm-l" style="width:10px;height:10px;background:var(--sage)" title="Jambes"></div>
         </div>
       </div>
       <div style="display:flex;flex-direction:column;align-items:flex-end">
         <span class="ah-name sage">${esc(A.nopName||'Adv.')}</span>
         <div style="display:flex;gap:3px;margin-top:3px">
           <div id="do-h" style="width:10px;height:10px;background:var(--sage)" title="Tête"></div>
           <div id="do-b" style="width:10px;height:10px;background:var(--sage)" title="Corps"></div>
           <div id="do-l" style="width:10px;height:10px;background:var(--sage)" title="Jambes"></div>
         </div>
       </div>
     </div>
     <div class="arena-bars"><div class="ab"><div class="ab-fill me" id="ab-me"></div></div><div class="ab"><div class="ab-fill op" id="ab-op"></div></div></div>
     <canvas id="arena-cv" style="width:100%;height:220px;display:block;border-radius:4px;margin-top:8px"></canvas>
     <div class="arena-st"><div class="st-lbl">Cardio</div><div class="st-lbl" style="text-align:right">Cardio</div></div>
     <div class="arena-bars sm"><div class="ab"><div class="ab-fill st" id="st-me"></div></div><div class="ab"><div class="ab-fill st" id="st-op"></div></div></div>
     <div id="ar-log" class="mono muted small" style="margin-top:12px;height:44px;display:flex;flex-direction:column;justify-content:flex-end;border-left:3px solid var(--gold);padding-left:10px;line-height:1.2"></div>
   </div>
   <button class="btn ghost" onclick="CL.skipArena()">Passer l\u2019animation ▸</button></div>`; }
/* mise à jour des barres HTML + jauge de momentum + points de dégâts par zone + terminal texte, à chaque frame */
function paintBars(){ if(!ARENA)return; const set=(id,v)=>{const e=document.getElementById(id); if(e)e.style.width=clamp(v,0,100)+'%';};
  set('ab-me',ARENA.hMe); set('ab-op',ARENA.hOp); set('st-me',ARENA.stMe); set('st-op',ARENA.stOp);
  if(ARENA.currentMomentum!==undefined) set('ar-momentum',ARENA.currentMomentum);
  const zoneColor=v=>v>28?'var(--blood)':v>14?'var(--gold)':'var(--sage)';
  const setZone=(id,v)=>{ const e=document.getElementById(id); if(e)e.style.background=zoneColor(v); };
  if(ARENA.snapA){ setZone('dm-h',ARENA.snapA.h); setZone('dm-b',ARENA.snapA.b); setZone('dm-l',ARENA.snapA.l); }
  if(ARENA.snapB){ setZone('do-h',ARENA.snapB.h); setZone('do-b',ARENA.snapB.b); setZone('do-l',ARENA.snapB.l); }
  const logEl=document.getElementById('ar-log');
  if(logEl && ARENA.currentText && logEl.getAttribute('data-last')!==ARENA.currentText){
    logEl.innerHTML=`<div style="animation:fade .3s ease;color:var(--text)">${ARENA.currentText}</div>`;
    logEl.setAttribute('data-last',ARENA.currentText);
  }
}
