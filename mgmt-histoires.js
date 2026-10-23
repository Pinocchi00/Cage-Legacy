"use strict";
/* ==== [ANCRE: P8_T1_HISTOIRES] — Monde lot 46 T1 ==== */
/* Le poids d'une histoire (brief du 22/10/2026, P8 T1).

   mgmtHistoiresSoiree(m, numeroSoiree) classe, du plus fort au plus faible, tout
   ce qui s'est passé à la soirée lue dans m : ampleur de la surprise (le bilan
   d'avant combat vient de la trace, la même règle que mgmt-medias.js), titre,
   record battu (mgmtRecords, P1 T6), série, trait gagné (mgmt-traits.js, P2),
   surnom gagné (m.facts k='surnom', P2 T5), discours, prime, combattant suivi
   (P3) ou espoir (P4), rivalité (mgmt-rivalites.js).

   La fonction est PURE : elle ne lit que l'état, ne l'écrit jamais, n'appelle
   aucun rnd(). Le lendemain (P8 T2) et les titres de presse liront ce
   classement ; aucun écran n'est créé ici.

   Les primes et les discours (P7) ne sont pas encore codés : un fait
   k='prime' ou k='discours' est reconnu s'il existe, et les deux poids
   valent 0 tant qu'aucun fait de ce type n'est écrit (sansFait). */

const MGMT_HISTOIRES_TYPES=Object.freeze(['surprise','titre','record','serie','trait','surnom','discours','prime','suivi','espoir','rivalite']);

/* Table des poids, lisible et documentée. Le classement final trie sur `poids`
   décroissant, puis sur l'ordre de MGMT_HISTOIRES_TYPES, puis sur le numéro de
   combat. Les plafonds évitent qu'une soirée à dix titres écrase une surprise
   majeure. `sansFait` vaut 0 : prime et discours ne pèsent rien sans fait. */
const MGMT_HISTOIRES_POIDS=Object.freeze({
  surprise:Object.freeze({base:40,parPointBilan:1.5,plafond:76}),
  titre:Object.freeze({base:32,parTitre:2,principal:4,plafond:44}),
  record:Object.freeze({base:24,parRatio:20,bonusMax:12,plafond:38}),
  serie:Object.freeze({base:12,parVictoire:1,seuil:3,plafond:22}),
  trait:Object.freeze({base:10,public:4,plafond:18}),
  surnom:Object.freeze({base:14,plafond:14}),
  discours:Object.freeze({base:9,principal:3,surprise:6,plafond:18,sansFait:0}),
  prime:Object.freeze({base:12,parTranche:2,tranche:100,plafond:20,sansFait:0}),
  suivi:Object.freeze({base:8,victoire:4,principal:4,plafond:16}),
  espoir:Object.freeze({base:10,victoire:4,principal:4,plafond:18}),
  rivalite:Object.freeze({base:16,trilogie:2,plafond:18}),
});

const MGMT_HISTOIRES_FINITIONS=Object.freeze(['ko','sub','stop']);

/** Le cycle de la soirée lue : celui de la dernière soirée jouée, sinon le plus
 *  récent de m.hist. Pur. @returns {number|null} */
function mgmtHistoireCycle(m){
  if(m&&m.lastEvent&&Number.isSafeInteger(m.lastEvent.cycle)) return m.lastEvent.cycle;
  let c=null;
  for(const t of (m&&Array.isArray(m.hist)?m.hist:[])){
    if(t&&Number.isSafeInteger(t.c)&&(c===null||t.c>c)) c=t.c;
  }
  return c;
}

/** Le bilan d'avant combat d'un coin de trace. Pur. @returns {number} */
function mgmtHistoireBilan(side){
  if(!side) return 0;
  const w=Number.isFinite(side.W)?side.W:0, l=Number.isFinite(side.L)?side.L:0;
  return w-l;
}

/** Le côté de `id` dans un combat de m.hist, ou null. Pur. */
function mgmtHistoireCote(t,id){
  if(!t||!t.a||!t.b) return null;
  if(t.a.id===id) return 'A';
  if(t.b.id===id) return 'B';
  return null;
}

/** L'adversaire d'un côté. Pur. */
function mgmtHistoireAutre(t,id){
  if(!t||!t.a||!t.b) return null;
  if(t.a.id===id) return t.b;
  if(t.b.id===id) return t.a;
  return null;
}

/** La série de victoires d'un combattant qui se termine à l'entrée `index` de
 *  m.hist (les combats des autres ne la rompent pas). Pur. @returns {number} */
function mgmtHistoireSerie(m,index,id){
  const hist=Array.isArray(m&&m.hist)?m.hist:[];
  let n=0;
  for(let i=index;i>=0;i--){
    const t=hist[i], cote=mgmtHistoireCote(t,id);
    if(!cote) continue;
    if(t.winner===cote) n++; else break;
  }
  return n;
}

/** Le nombre de titres de la soirée (pour répartir leur poids). Pur. */
function mgmtHistoireTitres(m){
  const set=new Set();
  for(const f of (m&&Array.isArray(m.facts)?m.facts:[])){
    if(f&&f.k==='title_fight'&&Number.isSafeInteger(f.fight)) set.add(f.fight);
  }
  return set;
}

/** Le rang mondial d'un combattant, s'il est encore dans le roster. Pur.
 *  @returns {number|null} */
function mgmtHistoireRang(m,id){
  if(!m||!Array.isArray(m.roster)||typeof mgmtDivisionRank!=='function') return null;
  const f=m.roster.find(x=>x&&x.id===id);
  if(!f) return null;
  try{ return mgmtDivisionRank(m,f,'world'); }catch(_){ return null; }
}

/** Le premier combat de la soirée où ce combattant apparaît. Pur.
 *  @returns {number} l'index dans m.hist, ou -1. */
function mgmtHistoireCombatDe(m,cycle,id){
  const hist=Array.isArray(m&&m.hist)?m.hist:[];
  let dernier=-1;
  for(let i=0;i<hist.length;i++){
    const t=hist[i];
    if(!t||t.c!==cycle||!mgmtHistoireCote(t,id)) continue;
    if(dernier<0) dernier=i;
    if(t.winner===mgmtHistoireCote(t,id)) return i;
  }
  return dernier;
}

/** Le poids d'une prime, 0 sans fait (P7 pas encore codé). Pur. */
function mgmtHistoirePoidsPrime(fait){
  const P=MGMT_HISTOIRES_POIDS.prime;
  if(!fait||typeof fait!=='object') return 0;
  const montant=Number.isFinite(fait.montant)?Math.max(0,fait.montant):0;
  return Math.min(P.plafond,P.base+Math.floor(montant/P.tranche)*P.parTranche);
}

/** Le poids d'un discours, 0 sans fait (P7 pas encore codé). Pur. */
function mgmtHistoirePoidsDiscours(fait){
  const P=MGMT_HISTOIRES_POIDS.discours;
  if(!fait||typeof fait!=='object') return 0;
  return Math.min(P.plafond,P.base+(fait.principal===true?P.principal:0)+(fait.surprise===true?P.surprise:0));
}

/** Le classement des histoires de la soirée. PURE : ne modifie jamais `m` et
 *  n'appelle aucun rnd(). Chaque entrée : {type, poids, a, b, c, raison}.
 *  `numeroSoiree` nomme la soirée dans `raison.soiree` (il ne filtre rien :
 *  les combats de la soirée se reconnaissent à leur cycle).
 *  @returns {Array<{type:string,poids:number,a:string,b:string|null,c:number,raison:object}>} */
function mgmtHistoiresSoiree(m,numeroSoiree){
  if(!m||typeof m!=='object') return [];
  const hist=Array.isArray(m.hist)?m.hist:[];
  const cycle=mgmtHistoireCycle(m);
  if(cycle===null) return [];
  const soiree=[];
  for(let i=0;i<hist.length;i++){
    const t=hist[i];
    if(t&&t.c===cycle&&t.a&&t.b) soiree.push({t,i});
  }
  if(!soiree.length) return [];
  const out=[], titres=mgmtHistoireTitres(m), nbTitres=soiree.filter(x=>titres.has(x.i)).length;
  const suivis=new Set(Array.isArray(m.suivis)?m.suivis:[]);
  const espoirs=new Set(Array.isArray(m.espoirs)?m.espoirs:[]);
  const raisonBase=()=>Number.isSafeInteger(numeroSoiree)?{soiree:numeroSoiree}:{};
  const pousser=(type,poids,a,b,c,raison)=>out.push({type,poids:Math.round(poids*1000)/1000,a,b,c,raison:Object.assign(raisonBase(),raison||{})});

  /* 1. La surprise : le perdant avait un meilleur bilan d'avant combat (la
     règle de mgmt-medias.js, l'estimation du jeu faute de cote publique). */
  for(const {t,i} of soiree){
    if(t.winner!=='A'&&t.winner!=='B') continue;
    const gagnant=t.winner==='A'?t.a:t.b, perdant=t.winner==='A'?t.b:t.a;
    const ecart=mgmtHistoireBilan(perdant)-mgmtHistoireBilan(gagnant);
    if(ecart<=0) continue;
    const P=MGMT_HISTOIRES_POIDS.surprise;
    pousser('surprise',Math.min(P.plafond,P.base+ecart*P.parPointBilan),gagnant.id,perdant.id,i,{
      ecart,bilanGagnant:[gagnant.W||0,gagnant.L||0,gagnant.D||0],bilanPerdant:[perdant.W||0,perdant.L||0,perdant.D||0],
      rangAdversaire:mgmtHistoireRang(m,perdant.id)});
  }

  /* 2. Les titres : un fait title_fight pointe vers son combat. */
  for(const {t,i} of soiree){
    if(!titres.has(i)) continue;
    const P=MGMT_HISTOIRES_POIDS.titre, principal=t.slot==='main';
    const gagnant=t.winner==='A'?t.a:t.winner==='B'?t.b:null, perdant=t.winner==='A'?t.b:t.winner==='B'?t.a:null;
    pousser('titre',P.base+P.parTitre*Math.max(0,nbTitres-1)+(principal?P.principal:0),
      gagnant?gagnant.id:null,perdant?perdant.id:null,i,{principal,titres:nbTitres,div:(gagnant&&gagnant.div)||null});
  }

  /* 3. Le record battu (P1 T6) : mgmtRecords ne signale que le dernier cycle. */
  if(typeof mgmtRecords==='function'){
    let records=null;
    try{ records=mgmtRecords(m); }catch(_){ records=null; }
    const battu=records&&records.battu;
    if(battu&&battu.c===cycle&&battu.combattant&&typeof battu.combattant.id==='string'){
      const id=battu.combattant.id, i=mgmtHistoireCombatDe(m,cycle,id);
      if(i>=0){
        const P=MGMT_HISTOIRES_POIDS.record;
        const bonus=Math.min(P.bonusMax,Math.abs(battu.ratio||0)*P.parRatio);
        pousser('record',Math.min(P.plafond,P.base+bonus),id,(battu.adversaire&&battu.adversaire.id)||null,i,{
          record:battu.id,valeur:battu.valeur,avant:battu.avant?battu.avant.valeur:null,ratio:battu.ratio});
      }
    }
  }

  /* 4. La série (au moins MGMT_HISTOIRES_POIDS.serie.seuil victoires de suite). */
  for(const {t,i} of soiree){
    if(t.winner!=='A'&&t.winner!=='B') continue;
    const gagnant=t.winner==='A'?t.a:t.b, serie=mgmtHistoireSerie(m,i,gagnant.id), P=MGMT_HISTOIRES_POIDS.serie;
    if(serie<P.seuil) continue;
    pousser('serie',Math.min(P.plafond,P.base+serie*P.parVictoire),gagnant.id,mgmtHistoireAutre(t,gagnant.id).id,i,{serie});
  }

  /* 5. Le trait gagné (P2) : ce que mgmtTraitsDe rend en plus après la soirée. */
  if(typeof mgmtTraitsDe==='function'){
    const vus=new Set();
    for(const {t,i} of soiree){
      for(const side of [t.a,t.b]){
        if(!side||vus.has(side.id)) continue;
        const avant=mgmtTraitsDe(m,side.id,cycle), apres=mgmtTraitsDe(m,side.id,cycle+1);
        const gagnes=apres.filter(x=>!avant.includes(x));
        if(!gagnes.length) continue;
        vus.add(side.id);
        const P=MGMT_HISTOIRES_POIDS.trait;
        const publics=gagnes.filter(id=>{ const info=typeof mgmtTraitInfo==='function'?mgmtTraitInfo(id):null; return info&&info.public; });
        pousser('trait',Math.min(P.plafond,P.base+(publics.length?P.public:0)),side.id,mgmtHistoireAutre(t,side.id).id,i,{traits:gagnes});
      }
    }
  }

  /* 6. Le surnom gagné (P2 T5) : un fait k='surnom', jamais une supposition. */
  for(const f of (Array.isArray(m.facts)?m.facts:[])){
    if(!f||f.k!=='surnom'||f.c!==cycle||typeof f.a!=='string') continue;
    const i=mgmtHistoireCombatDe(m,cycle,f.a);
    pousser('surnom',MGMT_HISTOIRES_POIDS.surnom.base,f.a,null,i>=0?i:-1,{nom:f.nom||'',type:f.t||null});
  }

  /* 7. Les discours et les primes (P7) : seulement si le fait existe. */
  for(const f of (Array.isArray(m.facts)?m.facts:[])){
    if(!f||f.c!==cycle) continue;
    if(f.k==='discours'){
      const poids=mgmtHistoirePoidsDiscours(f);
      const i=Number.isSafeInteger(f.fight)&&hist[f.fight]?f.fight:(typeof f.a==='string'?mgmtHistoireCombatDe(m,cycle,f.a):-1);
      pousser('discours',poids,typeof f.a==='string'?f.a:null,null,i,{principal:f.principal===true,surprise:f.surprise===true});
    }else if(f.k==='prime'){
      const poids=mgmtHistoirePoidsPrime(f);
      const i=Number.isSafeInteger(f.fight)&&hist[f.fight]?f.fight:(typeof f.a==='string'?mgmtHistoireCombatDe(m,cycle,f.a):-1);
      pousser('prime',poids,typeof f.a==='string'?f.a:null,null,i,{montant:Number.isFinite(f.montant)?f.montant:0,prime:f.nom||f.id||null});
    }
  }

  /* 8. Les combattants suivis (P3) et les espoirs (P4). Un espoir est suivi :
     il ne compte qu'une fois, sous son type le plus fort. */
  for(const {t,i} of soiree){
    for(const side of [t.a,t.b]){
      if(!side||typeof side.id!=='string') continue;
      const cote=mgmtHistoireCote(t,side.id), victoire=cote===t.winner, principal=t.slot==='main';
      if(espoirs.has(side.id)){
        const P=MGMT_HISTOIRES_POIDS.espoir;
        pousser('espoir',Math.min(P.plafond,P.base+(victoire?P.victoire:0)+(principal?P.principal:0)),
          side.id,mgmtHistoireAutre(t,side.id).id,i,{victoire,principal});
      }else if(suivis.has(side.id)){
        const P=MGMT_HISTOIRES_POIDS.suivi;
        pousser('suivi',Math.min(P.plafond,P.base+(victoire?P.victoire:0)+(principal?P.principal:0)),
          side.id,mgmtHistoireAutre(t,side.id).id,i,{victoire,principal});
      }
    }
  }

  /* 9. La rivalité née ou nourrie ce soir (mgmt-rivalites.js). */
  if(typeof mgmtRivalites==='function'){
    let rivalites=[];
    try{ rivalites=mgmtRivalites(m)||[]; }catch(_){ rivalites=[]; }
    for(const r of rivalites){
      if(!r||r.c!==cycle) continue;
      const i=mgmtHistoireCombatDe(m,cycle,r.a);
      const P=MGMT_HISTOIRES_POIDS.rivalite;
      pousser('rivalite',Math.min(P.plafond,P.base+(r.k==='trilogie'?P.trilogie:0)),r.a,r.b,i,{genre:r.k});
    }
  }

  out.sort((x,y)=>y.poids-x.poids
    ||MGMT_HISTOIRES_TYPES.indexOf(x.type)-MGMT_HISTOIRES_TYPES.indexOf(y.type)
    ||x.c-y.c
    ||String(x.a).localeCompare(String(y.a)));
  return out;
}
