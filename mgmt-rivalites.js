"use strict";
/* ==== [ANCRE: MGMT_LOT5_H10_RIVALITES] — Lot 5 H10, contrat §5 et §6 : la
   mémoire des affrontements. Le combattant se souvient de qui l'a battu et
   comment ; ce souvenir est l'historique des combats (m.hist) — AUCUNE
   mémoire parallèle : tout se lit, rien ne se stocke.
   Premier groupe de scénarios :
   - n° 1 la rivalité : une défaite humiliante (KO ou soumission au premier
     round, contre un adversaire au bilan moins bon — le favori écrasé) ; la
     revanche est due tant qu'elle n'a pas eu lieu ;
   - n° 2 la trilogie : une victoire partout entre deux combattants, le
     troisième combat est réclamé ;
   - n° 6 le tueur de hype : un combattant bat un invaincu.
   Le joueur décide par les demandes de H7 (promettre, refuser) : la défaite
   humiliante fait demander la revanche à coup sûr, la victoire partout fait
   demander le troisième combat. Aucun texte d'auteur : étiquettes
   fonctionnelles et noms des combattants. Parties neuves seulement. ==== */

/** Round d'une défaite humiliante : la finition tombe dès le premier. Mesuré le
 *  03/10 : 67 % des combats finissent dans les deux premiers rounds, 45 % au
 *  premier — d'où l'exigence en plus d'un bilan meilleur chez le perdant. */
const MGMT_HUMILIATION_ROUND=1;
/** Une rivalité ou une trilogie s'éteint si le dernier combat date de plus de N cycles. */
const MGMT_RIVALITE_CYCLES=12;
const MGMT_TUEUR_MIN_VICTOIRES=5;

/** Les affrontements de Split, par paire (ids triés) : chaque rencontre dit
 *  qui a gagné et comment. Lu sur la trace, rien n'est stocké.
 *  @returns {Map<string,Array>} */
function mgmtAffrontements(m){
  const out=new Map();
  (m.hist||[]).forEach((t,i)=>{
    if(!t||!t.a||!t.b) return;
    const cle=[t.a.id,t.b.id].sort().join('|');
    const gagnant=t.winner==='A'?t.a.id:(t.winner==='B'?t.b.id:null);
    const perdant=t.winner==='A'?t.b.id:(t.winner==='B'?t.a.id:null);
    if(!out.has(cle)) out.set(cle,[]);
    const [g,p]=t.winner==='A'?[t.a,t.b]:[t.b,t.a];
    const ratio=s=>(s.W||0)/Math.max(1,(s.W||0)+(s.L||0));
    out.get(cle).push({i,c:t.c,gagnant,perdant,family:t.family,round:t.round,rounds:t.rounds,slot:t.slot,
      favoriEcrase:t.winner!=='D'&&ratio(p)>ratio(g)});
  });
  return out;
}

/** Les rivalités et trilogies vivantes. Dérivé de m.hist. @returns {Array<{k:string,a:string,b:string,c:number}>}
 *  — rivalite : a = le perdant (qui demande la revanche), b = le gagnant ;
 *    trilogie : a = celui qui a perdu en dernier, b = l'autre. */
function mgmtRivalites(m){
  const out=[];
  for(const [cle,rencontres] of mgmtAffrontements(m)){
    const dernier=rencontres[rencontres.length-1];
    if(m.cycle-dernier.c>MGMT_RIVALITE_CYCLES) continue;
    const [x,y]=cle.split('|');
    const vivants=[x,y].every(id=>{ const f=mgmtFighterById(m,id); return f&&!mgmtIsRetired(f); });
    if(!vivants||!dernier.gagnant) continue;
    /* Corrections du 08/10, lot 10 (D4) : une humiliation qui se paie en revanche est celle d'un combat de la carte principale — plus celle d'un préliminaire entre inconnus. */
    const finale=(dernier.family==='ko'||dernier.family==='sub')&&dernier.round<=MGMT_HUMILIATION_ROUND&&dernier.favoriEcrase&&dernier.slot!=='prelim';
    if(rencontres.length===1&&finale){
      out.push({k:'rivalite',a:dernier.perdant,b:dernier.gagnant,c:dernier.c});
    }else if(rencontres.length===2&&rencontres[0].gagnant&&rencontres[0].gagnant!==dernier.gagnant){
      out.push({k:'trilogie',a:dernier.perdant,b:dernier.gagnant,c:dernier.c});
    }
  }
  return out;
}

/* Corrections du 08/10, lot 10 (D4) : ce qui fait réclamer un combat, comme dans la vraie vie. Quatre sources, toutes dérivées de l'histoire ou du vestiaire (rien n'est
   stocké) : l'humiliation en carte principale et la trilogie (mgmtRivalites), le MICRO — le vainqueur d'un combat principal fini avant la limite appelle le champion de sa
   catégorie, ou le premier du classement — , et le CHAMBRAGE sur les réseaux entre deux têtes de classement qui ne se sont jamais rencontrées (une paire tous les deux cycles).
   Les anciens partenaires de salle ne sont pas repris : le booking les dit déjà contrariés d'être opposés (2.3), les réclamer se contredirait. */
const MGMT_RECLAME_MICRO_CYCLES=2;
const MGMT_RECLAME_TETE=5;
const MGMT_RECLAME_CHAMBRAGE_PERIODE=2;
const MGMT_RECLAME_LIBELLES={rivalite:'Revanche après une humiliation',trilogie:'Le troisième combat',micro:'Appel au micro après sa victoire',reseaux:'Se chambrent sur les réseaux'};

/** Les paires déjà rencontrées en carte (m.hist), en clés triées. */
function mgmtDejaRencontres(m){
  const s=new Set();
  for(const t of m.hist||[]) if(t&&t.a&&t.b) s.add([t.a.id,t.b.id].sort().join('|'));
  return s;
}

/** Les têtes de classement d'une catégorie, disponibles, dans l'ordre du classement. Pur. */
function mgmtReclameTetes(m,div,n){
  return mgmtDivisionRanking(m,div,'organization').filter(f=>mgmtAvailable(m,f)).slice(0,n);
}

/** Tout ce que le public réclame, avec la raison de chaque combat. Pur.
 *  @returns {Array<{a:string,b:string,raison:string,texte:string,c:number}>} */
function mgmtReclamesRaisons(m){
  const out=[], vus=new Set();
  const nom=id=>{ const f=mgmtFighterById(m,id); return f?f.name:''; };
  const ajoute=(a,b,raison,c)=>{
    if(!a||!b||a===b) return; const k=[a,b].sort().join('|'); if(vus.has(k)) return; vus.add(k);
    out.push({a,b,raison,texte:`${nom(a)} contre ${nom(b)} : ${MGMT_RECLAME_LIBELLES[raison]}`,c});
  };
  for(const r of mgmtRivalites(m)) ajoute(r.a,r.b,r.k,r.c);
  if(!m||m.effectifs!==1||!Array.isArray(m.roster)) return out;
  /* Le micro : le meilleur vainqueur des derniers combats principaux, fini avant la limite. */
  const recents=(m.hist||[]).filter(t=>t&&t.a&&t.b&&t.slot==='main'&&m.cycle-t.c<=MGMT_RECLAME_MICRO_CYCLES&&(t.family==='ko'||t.family==='sub')&&(t.winner==='A'||t.winner==='B'));
  let meilleur=null;
  for(const t of recents){
    const g=t.winner==='A'?t.a:t.b, p=t.winner==='A'?t.b:t.a;
    const f=mgmtFighterById(m,g.id); if(!f||mgmtIsRetired(f)) continue;
    const s=mgmtStar(f); if(!meilleur||s>meilleur.s) meilleur={f,s,perdant:p.id,c:t.c};
  }
  if(meilleur){
    const ceinture=mgmtSplitTitle(m,meilleur.f.div);
    const tetes=mgmtReclameTetes(m,meilleur.f.div,MGMT_RECLAME_TETE).filter(x=>x.id!==meilleur.f.id&&x.id!==meilleur.perdant);
    const cible=(ceinture&&ceinture.id&&ceinture.id!==meilleur.f.id&&ceinture.id!==meilleur.perdant&&mgmtFighterById(m,ceinture.id))||tetes[0];
    if(cible) ajoute(meilleur.f.id,cible.id,'micro',meilleur.c);
  }
  /* Chambrage : une paire à la fois, tirée du cycle (flux d'identité, jamais de hasard de partie). */
  const rencontres=mgmtDejaRencontres(m), divs=[...new Set(m.roster.map(f=>f.div))].sort();
  const paires=(periode,filtre,cle)=>{
    if(m.cycle%periode!==0) return null;
    const u=mgmtIdentiteStream(m.org+'|'+cle+'|'+m.cycle,'reclame')();
    const tous=[];
    for(const d of divs){
      const t=mgmtReclameTetes(m,d,MGMT_RECLAME_TETE);
      for(let i=0;i<t.length;i++) for(let j=i+1;j<t.length;j++) if(!rencontres.has([t[i].id,t[j].id].sort().join('|'))&&filtre(t[i],t[j])) tous.push([t[i],t[j]]);
    }
    return tous.length?tous[Math.floor(u*tous.length)]:null;
  };
  const cham=paires(MGMT_RECLAME_CHAMBRAGE_PERIODE,()=>true,'chambrage');
  if(cham) ajoute(cham[0].id,cham[1].id,'reseaux',m.cycle);
  return out;
}

/** Les rivalités d'un combattant, vues de son côté. */
function mgmtRivauxDe(m,f){
  return mgmtRivalites(m).filter(r=>r.a===f.id||r.b===f.id).map(r=>({k:r.k,autre:r.a===f.id?r.b:r.a,c:r.c,perdant:r.a===f.id}));
}

/** Le tueur de hype (scénario 6) : un combattant bat un invaincu qui comptait
 *  au moins MGMT_TUEUR_MIN_VICTOIRES victoires. Dérivé de la trace d'avant combat. */
function mgmtTueursDeHype(m,cycle){
  const out=[];
  for(const t of m.hist||[]){
    if(!t||t.c!==cycle||t.winner==='D') continue;
    const [g,p]=t.winner==='A'?[t.a,t.b]:[t.b,t.a];
    if(p.L===0&&p.W>=MGMT_TUEUR_MIN_VICTOIRES) out.push({gagnant:g.id,perdant:p.id,c:t.c});
  }
  return out;
}

/** Les lignes que la semaine raconte : la rivalité née du dernier combat, la
 *  trilogie à jouer, le tueur de hype. Étiquettes fonctionnelles, noms des
 *  combattants. @returns {Array<{type:string,text:string,id:string}>} */
function mgmtRivalitesLignes(m){
  const nom=id=>{ const f=mgmtFighterById(m,id); return f?f.name:''; };
  const out=[];
  for(const r of mgmtRivalites(m)){
    if(m.cycle-r.c>2) continue;
    out.push({type:'rivalite',id:r.a,text:r.k==='rivalite'
      ?`${nom(r.a)} et ${nom(r.b)} : revanche due`
      :`${nom(r.a)} et ${nom(r.b)} : le troisième combat`});
  }
  for(const t of mgmtTueursDeHype(m,m.cycle-1)){
    out.push({type:'rivalite',id:t.gagnant,text:`${nom(t.gagnant)} bat ${nom(t.perdant)}, invaincu jusque-là`});
  }
  return out;
}

/** Les demandes que l'histoire impose : la revanche après une défaite
 *  humiliante, le troisième combat après une victoire partout — à coup sûr,
 *  pour le combattant qui vient de perdre. @returns {Array<{a:string,want:string,target:string}>} */
function mgmtDemandesImposees(m){
  const out=[];
  for(const r of mgmtRivalites(m)){
    if(m.cycle-r.c>1) continue;
    out.push({a:r.a,want:r.k==='rivalite'?'revanche':'trilogie',target:r.b});
  }
  /* Lot 5 H10, deuxième groupe (mgmt-scenarios.js). */
  if(typeof mgmtScenariosImposes==='function') out.push(...mgmtScenariosImposes(m));
  return out;
}

/** « Ses rivaux » sur la fiche : l'adversaire et ce qui les lie, sans chiffre. */
function mgmtFicheRivaux(m,f){
  if(m.effectifs!==1) return '';
  const rivaux=mgmtRivauxDe(m,f);
  const scenarios=typeof mgmtScenariosDe==='function'?mgmtScenariosDe(m,f):[];
  if(!rivaux.length&&!scenarios.length) return '';
  const etiquette={rivalite:'Revanche due',trilogie:'Le troisième combat'};
  return `<h3>Ses rivaux</h3><ul class="mgmt-fiche-vie-liste">`
    +rivaux.map(r=>{ const o=mgmtFighterById(m,r.autre); return `<li>${esc(o?o.name:'')} <span class="mgmt-fiche-vie-relais">${esc(etiquette[r.k])}</span></li>`; }).join('')
    +scenarios.map(s=>`<li>${esc(s)}</li>`).join('')+`</ul>`;
}
/* ==== [FIN ANCRE] ==== */
