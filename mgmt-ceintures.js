"use strict";
/* ==== [ANCRE: MGMT_LOT5_T1_CEINTURES] — Lot 5 T1, contrat du 23/09 §T1.
   Décisions d'Anthony du 02/10/2026 : premier classé champion initial de
   Split, zéro défense ; titre explicitement choisi ; premier combat de
   carte principale = combat principal. Extérieur : résultats existants,
   premier classé actif pour une ceinture vacante ; départ = vacance.
   Split relit ses faits et sa trace append-only. Extérieur relit les
   combats dérivés du flux de carrière inchangé. Aucun cache persistant,
   aucun tirage de la RNG du jeu, aucune voix. ==== */

/** Attribution initiale, une fois par catégorie. C'est un fait daté, pas
 *  une copie du classement vivant : un changement de rang ne fait jamais
 *  changer la ceinture. Une catégorie vide commence avec un titre vacant. */
function mgmtInitTitles(m){
  if(!m||!Array.isArray(m.roster)||!Array.isArray(m.facts)) return;
  for(const div of allDivisions()){
    if(m.facts.some(x=>x&&x.k==='title_initial'&&x.div===div.id)) continue;
    const first=mgmtDivisionRanking(m,div.id,'organization')[0];
    mgmtAddFact(m,{c:m.cycle,k:'title_initial',div:div.id,a:first?first.id:null});
  }
}

/** Ceinture Split, dérivée des attributions et des combats de titre.
 *  Un nul conserve la ceinture, sans défense gagnée. La retraite ou le
 *  départ du détenteur la rendent vacante, sans effacer son règne passé. */
function mgmtSplitTitle(m,div){
  let id=null,defenses=0,since=null;
  if(!m||!divById(div)) return {org:mgmtOrgNom(m),div,id,defenses,since};
  for(const fact of m.facts||[]){
    if(!fact||fact.div!==div) continue;
    if(fact.k==='title_initial'){
      id=fact.a; defenses=0; since=id?fact.c:null;
    }else if(fact.k==='title_fight'){
      const t=m.hist&&m.hist[fact.fight];
      if(!t) continue;
      const winner=t.winner==='A'?t.a.id:(t.winner==='B'?t.b.id:null);
      if(!winner) continue;
      if(winner===id) defenses++;
      else { id=winner; defenses=0; since=fact.c; }
    }
  }
  const f=id?mgmtFighterById(m,id):null;
  if(!f||f.div!==div||mgmtIsRetired(f)){ id=null; defenses=0; since=null; }
  return {org:mgmtOrgNom(m),div,id,defenses,since};
}

/* ==== [ANCRE: MGMT_LOT5_T1_MEMOIRE_TITRES] — Reprise T1 : lire l'issue
   au moment du fait, pas la ceinture d'aujourd'hui. Une seule traversée
   des faits ; les noms viennent de la trace auto-portante, même après un
   départ. title_initial sert à la lecture, sans devenir une ligne de
   Mémoire du joueur. Aucune donnée écrite, aucune RNG consommée. ==== */
function mgmtTitleMemoryRows(m){
  const champions=new Map(),rows=new Map();
  for(const fact of m.facts||[]){
    if(!fact) continue;
    if(fact.k==='title_initial'){
      champions.set(fact.div,fact.a);
    }else if(fact.k==='retired'){
      const id=typeof fact.a==='string'?fact.a:fact.a?.id;
      for(const [div,champion] of champions){ if(champion===id) champions.set(div,null); }
    }else if(fact.k==='title_fight'){
      const trace=m.hist&&m.hist[fact.fight];
      if(!trace||!trace.a||!trace.b) continue;
      const id=champions.get(fact.div);
      const champion=trace.a.id===id?trace.a:(trace.b.id===id?trace.b:null);
      const winner=trace.winner==='A'?trace.a:(trace.winner==='B'?trace.b:null);
      const key=champion
        ?(!winner||winner.id===champion.id?'title_retained':'title_lost')
        :(winner?'title_awarded':'title_vacant');
      const first=champion||winner||trace.a;
      const second=first===trace.a?trace.b:trace.a;
      rows.set(fact,{label:MGMT_FACT_LABELS[key],a:first.name,b:second.name});
      champions.set(fact.div,winner?winner.id:champion?champion.id:null);
    }
  }
  return rows;
}
/* ==== [FIN ANCRE] ==== */

/* Corrections du 08/10, lot 11 (D5) : un combat de titre est un événement. Une carte en porte au plus MGMT_TITRES_PAR_CARTE (en général un, parfois zéro ou deux) ;
   un champion ne combat que pour sa ceinture — le booker, c'est la mettre en jeu, et il n'est jamais un préliminaire ; un combat de titre pèse sur l'attrait de la carte
   (MGMT_ATTR_TITRE, mgmt-argent.js), donc sur le remplissage. */
const MGMT_TITRES_PAR_CARTE=2;

/** Les champions de Split en titre (un par catégorie au plus), en ensemble d'identifiants. Pur. */
function mgmtChampionIds(m){
  const s=new Set();
  if(!m||!Array.isArray(m.roster)) return s;
  /* Mémo : les listes demandent la sélection de chaque ligne. Les ceintures ne changent qu'avec les faits ; le cycle clôt la clé par sécurité. */
  const cle=(m.facts?m.facts.length:0)+'|'+m.cycle+'|'+m.roster.length;
  if(MGMT_CHAMPIONS_MEMO.m===m&&MGMT_CHAMPIONS_MEMO.cle===cle) return MGMT_CHAMPIONS_MEMO.set;
  for(const d of new Set(m.roster.map(f=>f.div))){ const b=mgmtSplitTitle(m,d); if(b&&b.id) s.add(b.id); }
  MGMT_CHAMPIONS_MEMO.m=m; MGMT_CHAMPIONS_MEMO.cle=cle; MGMT_CHAMPIONS_MEMO.set=s;
  return s;
}
const MGMT_CHAMPIONS_MEMO={m:null,cle:'',set:null};

/** Un champion peut-il encore être booké (premier choix) ? Seulement si une ceinture peut encore être mise en jeu sur la carte. Pur. */
function mgmtChampionBookable(m,f){
  if(!mgmtChampionIds(m).has(f.id)) return true;
  const titres=mgmtCardFights(m).filter(x=>x.title===true);
  if(titres.length>=MGMT_TITRES_PAR_CARTE) return false;
  return !titres.some(x=>mgmtFighterById(m,x.a)?.div===f.div);
}

/** Le champion peut-il combattre dans cette paire ? Sans champion, toujours ; avec un champion, seulement si la ceinture peut être mise en jeu. Pur. */
function mgmtChampionPeutCombattre(m,aid,bid){
  const ch=mgmtChampionIds(m);
  if(!ch.has(aid)&&!ch.has(bid)) return true;
  return mgmtCanTitle(m,{a:aid,b:bid});
}

/** Une paire peut jouer un titre vacant ou celui du champion présent.
 *  Une seule ceinture de cette catégorie peut être engagée sur la carte, et deux au plus par carte. */
function mgmtCanTitle(m,fight){
  if(!m||!fight) return false;
  const a=mgmtFighterById(m,fight.a),b=mgmtFighterById(m,fight.b);
  if(!a||!b||a.id===b.id||a.div!==b.div||!mgmtAvailable(m,a,b)||!mgmtAvailable(m,b,a)) return false;
  const belt=mgmtSplitTitle(m,a.div);
  if(belt.id&&belt.id!==a.id&&belt.id!==b.id) return false;
  if(mgmtCardFights(m).filter(x=>x!==fight&&x.title===true).length>=MGMT_TITRES_PAR_CARTE) return false;
  return !mgmtCardFights(m).some(x=>x!==fight&&x.title===true
    &&mgmtFighterById(m,x.a)?.div===a.div);
}

/** Choix réversible du joueur sur le combat posé, jamais implicite. */
function mgmtSetTitle(m,idx,title){
  if(typeof title!=='boolean'||!m||!m.card||!Array.isArray(m.card.main)
    ||!Number.isSafeInteger(idx)||idx<0||idx>=m.card.main.length) return false;
  const fight=m.card.main[idx];
  if(title&&!mgmtCanTitle(m,fight)) return false;
  if(!title){ const ch=mgmtChampionIds(m); if(ch.has(fight.a)||ch.has(fight.b)) return false; }
  fight.title=title;
  return true;
}

/** Le premier combat principal et chaque combat de titre ont cinq rounds. */
function mgmtBoutRounds(m,fight){
  return fight.title===true||(m&&m.card&&m.card.main&&m.card.main[0]===fight)?5:3;
}

/** Chronologie extérieure des ceintures d'une catégorie. Les combats sont
 *  ceux de mgmtExteriorCareer, avec le même résultat, la même date et la
 *  même organisation. La défaite du champion libère son titre ; le meilleur
 *  classé actif restant le reçoit (le perdant ne le reprend pas ce cycle).
 *  Aucun adversaire fictif ni résultat supplémentaire n'est fabriqué.
 *  Entrées, transferts et retraites sont ceux de la carrière existante.
 *  @returns {{belts:Array,history:Array}} vues éphémères uniquement. */
function mgmtExteriorTitles(m,div,cycle){
  const c=Number.isSafeInteger(cycle)?cycle:(m&&Number.isSafeInteger(m.cycle)?m.cycle:0);
  const belts=mgmtExtOrgs(m).map((org,i)=>({org,orgIdx:i,div,id:null,defenses:0,since:null}));
  const history=[];
  if(!m||!divById(div)) return {belts,history};
  const rosterIds=new Set((m.roster||[]).map(f=>f.id));
  const lines=(m.exterieur||[]).filter(f=>f.div===div&&f.born<=c&&!rosterIds.has(f.id));
  const events=[];
  for(const line of lines){
    const car=mgmtExteriorCareer(line.seed,line.born,c);
    const before=mgmtExteriorCareer(line.seed,line.born,line.born-1);
    events.push({c:line.born,type:'entry',id:line.id,line,before});
    for(const bout of car.bouts){
      if(bout.c>=line.born) events.push({...bout,type:'fight',id:line.id});
    }
    if(car.retireCycle<=c) events.push({c:car.retireCycle,type:'retire',id:line.id});
  }
  events.sort((a,b)=>a.c-b.c||a.id.localeCompare(b.id)||
    ['entry','fight','retire'].indexOf(a.type)-['entry','fight','retire'].indexOf(b.type));
  const active=new Map();
  const clear=(belt,date,reason)=>{
    history.push({c:date,orgIdx:belt.orgIdx,div,type:reason,id:belt.id});
    belt.id=null; belt.defenses=0; belt.since=null;
  };
  let p=0;
  while(p<events.length){
    const date=events[p].c,excluded=new Set();
    while(p<events.length&&events[p].c===date){
      const e=events[p++];
      if(e.type==='entry'){
        const last=e.before.orgs.at(-1)?.to;
        if(e.before.retireCycle>date) active.set(e.id,{id:e.id,org:e.before.orgIdx,
          W:e.before.W,L:e.before.L,lastCycle:Number.isSafeInteger(last)?last:-1});
        continue;
      }
      const f=active.get(e.id);
      if(!f) continue;
      const belt=belts[f.org];
      if(e.type==='retire'){
        if(belt.id===f.id) clear(belt,date,'retired');
        active.delete(f.id);
        continue;
      }
      if(belt.id===f.id){
        if(e.win){
          belt.defenses++;
          history.push({c:date,orgIdx:belt.orgIdx,div,type:'defense',id:f.id});
        }else{
          excluded.add(belt.orgIdx+'|'+f.id);
          clear(belt,date,'loss');
        }
      }
      f.W=e.W; f.L=e.L; f.lastCycle=date;
      if(e.nextOrg!==e.org){
        if(belt.id===f.id) clear(belt,date,'transfer');
        f.org=e.nextOrg;
        // Même récence que mgmtDivisionRanking : nouveau séjour sans combat.
        f.lastCycle=-1;
      }
    }
    for(const belt of belts){
      if(belt.id) continue;
      const first=[...active.values()].filter(f=>f.org===belt.orgIdx
        &&!excluded.has(belt.orgIdx+'|'+f.id)).sort(mgmtRankingCompare)[0];
      if(first){
        belt.id=first.id; belt.since=date; belt.defenses=0;
        history.push({c:date,orgIdx:belt.orgIdx,div,type:'award',id:first.id});
      }
    }
  }
  return {belts,history};
}
/* ==== [FIN ANCRE] ==== */
