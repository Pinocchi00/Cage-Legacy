"use strict";
/* ==== [ANCRE: MGMT_LOT5_H10_SCENARIOS_2] — Lot 5 H10, deuxième groupe de
   scénarios (contrat §5). Même mécanique que le premier groupe : un
   DÉCLENCHEUR dérivé de l'état du jeu (jamais stocké), une demande imposée
   par l'histoire (H7 : promettre ou refuser), des faits qui restent.
   - n° 5  le train de la hype : une longue série de victoires à Split ; il
     demande à se tester (« un classé »), le protéger, c'est refuser ;
   - n° 4  la dernière danse : un vétéran de carrière qui vient de perdre quatre
     fois de suite demande la carte principale, y aller ou le protéger ;
   - n° 10 le deuil : un proche, ou son coach, est mort ; il veut combattre
     pour lui (la carte principale), le reporter, c'est refuser ;
   - n° 29 la descente aux enfers : au-delà de 300 de charge et deux défaites
     de suite, il demande une PAUSE (une promesse qui se tient en ne le
     bookant pas ; la rompre pèse comme toute promesse rompue).
   Aucun texte d'auteur : étiquettes fonctionnelles et noms des combattants.
   Parties neuves seulement. ==== */

/** Le train de la hype : la série de victoires de Split atteint EXACTEMENT ce nombre
 *  (au moment où elle l'atteint, pas à chaque combat gagné ensuite). Mesuré le
 *  03/10 (52 cycles, graine 20261003) : 12 est atteint ~0,27 fois par cycle ; 8, 0,56 —
 *  trop, car chaque scénario impose une demande avant les demandes naturelles. */
const MGMT_HYPE_SERIE=12;
/** La dernière danse : un vétéran de cet âge, avec au moins ce nombre de victoires
 *  en carrière, vient de perdre EXACTEMENT ce nombre de combats de suite (~0,23 par cycle). */
const MGMT_DANSE_AGE=36;
const MGMT_DANSE_VICTOIRES=15;
const MGMT_DANSE_DEFAITES=4;
/** Le deuil : la moitié des éprouvés veulent combattre pour le défunt (flux 'deuil'). */
const MGMT_DEUIL_PART=0.5;
/** La descente aux enfers : charge au-delà de ce seuil et deux défaites de suite. */
const MGMT_DESCENTE_CHARGE=300;
/** Les moments de vie qui font un deuil (catalogue §6). */
const MGMT_DEUIL_MOMENTS=['deces-parent','deces-frere-soeur','coach-meurt'];
/** Le blues du champion : un champion qui vient de gagner sa ceinture ne veut
 *  plus de cage pour l'instant. Une fois sur deux (flux 'blues'). */
const MGMT_BLUES_PART=0.5;
/** La fratrie : parmi les combattants de Split qui portent le même nom de
 *  famille dans le même pays (une vingtaine de paires par vestiaire,
 *  mesuré le 03/10), cette part-là sont de la même famille — de l'ordre de
 *  deux à sept paires (cinq graines mesurées : 3 à 13 à 15 %, d'où 10 %). Le choix est semé par la paire, jamais par la partie. */
const MGMT_FRATRIE_PART=0.1;
/** Les frères et sœurs ne se combattent jamais : les booker l'un contre l'autre pèse. */
const MGMT_CONTRARIE_FRATRIE=30;
/** Les étiquettes de la fiche. */
const MGMT_SCENARIOS_LIBELLES={
  hype:'Le train de la hype',
  'derniere-danse':'La dernière danse',
  deuil:'Un deuil',
  descente:'La descente',
  blues:'Le blues du champion',
};

/** Les scénarios vivants de ce cycle : [{k,a,want,target?}]. Dérivé de l'état,
 *  rien n'est stocké. L'ordre est celui de la liste, déterministe. */
function mgmtScenarios(m){
  const out=[];
  if(!m||m.effectifs!==1||!Array.isArray(m.roster)) return out;
  for(const f of m.roster){
    if(!f||f.retired||mgmtIsRetired(f)) continue;
    const res=mgmtResultatsDetail(m,f);
    const recent=res[0]&&res[0].c>=m.cycle-1;
    /* Séries du moment : victoires, défaites de suite (le dernier combat d'abord). */
    const serie=issue=>{ let k=0; for(const x of res){ if(x.issue===issue) k++; else break; } return k; };
    /* n° 5 — le train de la hype */
    if(recent&&serie('win')===MGMT_HYPE_SERIE){
      const tete=mgmtDivisionRanking(m,f.div,'organization').slice(0,5).filter(o=>o.id!==f.id);
      if(tete.length){
        const cible=tete[Math.floor(mgmtIdentiteStream(f.id,'hype|'+m.cycle)()*tete.length)].id;
        out.push({k:'hype',a:f.id,want:'un-classe',target:cible});
      }
    }
    /* n° 4 — la dernière danse */
    if(recent&&f.age>=MGMT_DANSE_AGE&&(f.W||0)>=MGMT_DANSE_VICTOIRES&&serie('loss')===MGMT_DANSE_DEFAITES){
      out.push({k:'derniere-danse',a:f.id,want:'carte-principale',target:null});
    }
    /* n° 10 — le deuil */
    if((m.facts||[]).some(x=>x&&x.k==='moment_vie'&&x.a===f.id&&MGMT_DEUIL_MOMENTS.includes(x.m)&&x.c>=m.cycle-1)
      &&mgmtIdentiteStream(f.id,'deuil|'+m.cycle)()<MGMT_DEUIL_PART){
      out.push({k:'deuil',a:f.id,want:'carte-principale',target:null});
    }
    /* n° 29 — la descente aux enfers */
    if(recent&&serie('loss')>=2&&mgmtVieCharge(m,f,m.cycle,false)>MGMT_DESCENTE_CHARGE){
      out.push({k:'descente',a:f.id,want:'pause',target:null});
    }
  }
  /* n° 24 — le blues du champion : la ceinture date du dernier cycle. */
  for(const div of allDivisions()){
    const belt=mgmtSplitTitle(m,div.id);
    if(belt.id&&Number.isSafeInteger(belt.since)&&belt.since>=m.cycle-1&&belt.since>0
      &&mgmtIdentiteStream(belt.id,'blues|'+belt.since)()<MGMT_BLUES_PART){
      out.push({k:'blues',a:belt.id,want:'pause',target:null});
    }
  }
  return out;
}

/** Les frères et sœurs d'un combattant chez Split (n° 23) : même pays, même
 *  nom de famille, et la part de ces paires qui sont de la même famille.
 *  @returns {string[]} les identifiants. */
function mgmtFratrie(m,f){
  if(!m||m.effectifs!==1||!f||!f.last) return [];
  const pays=mgmtIdentitePays(f);
  return m.roster.filter(o=>o.id!==f.id&&!mgmtIsRetired(o)&&o.last===f.last&&mgmtIdentitePays(o)===pays
    &&mgmtIdentiteStream([f.id,o.id].sort().join('|'),'fratrie')()<MGMT_FRATRIE_PART).map(o=>o.id);
}

/** Les demandes que ces scénarios imposent (même forme que mgmtDemandesImposees).
 *  Une pause déjà promise dans les six derniers cycles ne se redemande pas. */
function mgmtScenariosImposes(m){
  return mgmtScenarios(m).filter(s=>!(s.want==='pause'&&(m.facts||[]).some(x=>x&&x.k==='promesse'&&x.a===s.a&&x.want==='pause'&&m.cycle-x.c<=6)))
    .map(s=>({a:s.a,want:s.want,target:s.target}));
}

/** Les scénarios d'un combattant, pour sa fiche : étiquettes sans chiffre. */
function mgmtScenariosDe(m,f){
  const fratrie=mgmtFratrie(m,f).map(id=>{ const o=mgmtFighterById(m,id); return 'Sa famille chez Split : '+(o?o.name:''); });
  return mgmtScenarios(m).filter(s=>s.a===f.id).map(s=>MGMT_SCENARIOS_LIBELLES[s.k]).concat(fratrie);
}
/* ==== [FIN ANCRE] ==== */
