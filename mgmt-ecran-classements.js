"use strict";
/* ==== [ANCRE: MGMT_LOT4_T6_CLASSEMENTS_ECRAN] — Lot 4 T6 : l'écran des
   classements (docs/LOT-4-LA-PEAU-DU-JEU.md §3 T6 ; maquette 07, écran
   neuf, PARTIEL). Il ne montre que ce que le code sait déjà :
   - les onglets par catégorie (mgmtDivisionLabel), hommes puis femmes
     dans l'ordre d'engine.js — le libellé féminin se dérive à la lecture
     (décision d'Anthony du 28/09, mgmt-ecran-carte.js) ;
   - une portée MONDIAL ou SPLIT (lot 2B T1 bis : les deux portées de la
     même loi de classement) ;
   - la liste : rang, combattant, bilan, organisation de chaque classé,
     tendance (= / +n / -n / nouveau) — dérivée à la lecture en comparant
     le rang courant au classement du cycle précédent par
     mgmtDivisionRanking au cycle explicite (ancre MGMT_LOT2_CLASSEMENT,
     T6-1 : recalculé, jamais stocké) ; ni note, ni barème, ni jauge
     (addendum 2 §6) ;
   - « Ce qui a bougé ce cycle-ci » : entrées dans le top 15, sorties et
     mouvements des quinze premiers — constats factuels comparés au cycle
     précédent, sans voix ni opinion (§1) ; sans cycle antérieur
     (m.cycle = 0), le bloc n'existe pas et la colonne de tendance porte « - » ;
   - un combattant extérieur s'ouvre en fiche (CL.mgmtFiche), comme un
     combattant de Split.
    Lot 5 T1 : le bloc Champion de la maquette 07 lit les ceintures de chaque
    organisation (faits Split, trace extérieure), avec bilan et défenses.
    Ce qui n'existe pas n'apparaît pas (§4 bis) : ni « ce que la presse
    réclame », ni objectif de patron. Les
   blocs de la maquette écrits au-dessus d'un système absent se ferment ; aucun
   texte de maquette ne s'affiche (§1). esc() sur tout nom affiché,
   escJsAttr sur tout identifiant injecté dans un onclick.
   Aucun Math.random(). ==== */

const MGMT_CLASSEMENTS_LABELS={
  title:'Classements',
  worldTab:'Mondial',
  splitTab:'Split',
  worldLabel:'Mondial — toutes organisations',
  splitLabel:"Split — l'organisation",
  head:['Rang','Combattant','Bilan','Organisation','Tendance'],
  trendNew:'nouveau',
  top15:'Le top 15',
  autres:'Les autres combattants classés',
  vide:'Aucun combattant classé.',
  moves:'Ce qui a bougé ce cycle-ci',
  movesAucun:'Rien à signaler depuis le cycle précédent.',
  entreTop:'entre dans le top 15',
  entreClassement:'entre au classement',
  auRang:'au rang',
  sortTop:'sort du top 15',
  monte:'monte',
  recule:'recule',
  une:'une place',
  places:'places',
  organisation:'Ton organisation',
  combattant:'combattant',
  combattants:'combattants',
  dans:'classés dans le top 15 mondial de leur catégorie',
  categorie:'catégorie',
  categories:'catégories',
  sur:'sur',
};

/* ==== [ANCRE: P1_T6B_MEILLEURS_LIBELLES] — Monde lot 31 T6b ==== */
const MGMT_MEILLEURS_LABELS={
  tabs:{meilleurs:'LES MEILLEURS',records:'LES RECORDS'},gender:{H:'HOMMES',F:'FEMMES'},
  categories:[['finitions','LE PLUS DE FINITIONS',''],['volume','LE PLUS GROS VOLUME','/ MIN'],['precis','LE PLUS PRÉCIS','%'],['defense','LA MEILLEURE DÉFENSE','%'],['lutteur','LE LUTTEUR','/ 15 MIN'],['mur','LE MUR','%'],['cou','LE CHASSEUR DE COU','/ 15 MIN'],['serie','LA PLUS LONGUE SÉRIE','V']],
  insufficient:'3 combats documentés minimum', precise:'5 pour la précision', empty:'Pas encore de combat documenté.',
  recordLabels:{sigAtt:'Coups significatifs tentés en un combat',koRapide:'Le KO le plus rapide',amenees:'Amenées réussies en un combat',knockdowns:'Knockdowns dans un même combat',controle3:'Contrôle au sol en trois rounds',corps:'Coups au corps en un combat',finitions:'Finitions chez Split',defensesTitre:'Défenses de titre de suite',victoiresSuite:'Victoires de suite',combats:'Combats chez Split',plusJeuneChampion:'Le plus jeune champion'},
  beaten:{sigAtt:'{nom}, {valeur} coups significatifs tentés à Split Fight Night {soiree}.{avant}',koRapide:'{nom}, {valeur} secondes à Split Fight Night {soiree}.{avant}',amenees:'{nom}, {valeur} amenées réussies à Split Fight Night {soiree}.{avant}',knockdowns:'{nom}, {valeur} knockdowns à Split Fight Night {soiree}.{avant}',controle3:'{nom}, {valeur} de contrôle au sol à Split Fight Night {soiree}.{avant}',corps:'{nom}, {valeur} coups au corps à Split Fight Night {soiree}.{avant}'}
};

const MGMT_CL_TOP=15;

/** État de l'écran (trace de rendu, jamais persistée) : catégorie et
 *  portée courantes. ==== */
let MGMT_CLASSEMENTS={div:'H-fly',scope:'world',vue:'liste',selection:0};

/* ==== [ANCRE: P1_T6B_VUES] — Monde lot 31 T6b ==== */
function mgmtClassementsVueBtnsHtml(){
  const L=MGMT_MEILLEURS_LABELS;
  return Object.entries(L.tabs).map(([vue,label])=>`<button type="button" class="mgmt-cl-tab${MGMT_CLASSEMENTS.vue===vue?' cur':''}" onclick="CL.mgmtClassementsVue('${vue}')">${esc(label)}</button>`).join('');
}
function mgmtMeilleursHtml(m){
  const L=MGMT_MEILLEURS_LABELS, cats=L.categories, d=divById(MGMT_CLASSEMENTS.div), gender=d&&d.gender==='F'?'F':'H';
  const cards=mgmtMeilleurs(m,{divId:MGMT_CLASSEMENTS.div,portee:MGMT_CLASSEMENTS.scope==='split'?'split':'monde'});
  const html=cats.map(([id,label,unit],i)=>{
    const row=cards.find(x=>x.id===id), first=row&&row.rang[0], fmt=v=>Number.isInteger(v)?String(v):String(Number(v.toFixed(2))).replace('.',',');
    const ranks=row?row.rang:[], top=first?`<button class="mgmt-me-name" onclick="CL.mgmtFiche('${escJsAttr(first.id)}')">${esc(first.nom.toUpperCase())}</button>`:`<div class="mgmt-me-empty">—<small>${esc(id==='precis'?L.precise:L.insufficient)}</small></div>`;
    return `<article class="mgmt-me-card${MGMT_CLASSEMENTS.selection===i?' selected':''}"><h3>${esc(label)}</h3><div class="mgmt-me-value">${first?esc(fmt(first.valeur)):''}${first&&unit?` <small>${esc(unit)}</small>`:''}</div>${top}<div class="mgmt-me-ranks">${ranks.slice(1,3).map((r,n)=>`<div><button onclick="CL.mgmtFiche('${escJsAttr(r.id)}')">${n+2}. ${esc((r.nom.split(/\\s+/).pop()||r.nom))}</button><span>${esc(fmt(r.valeur))}</span></div>`).join('')}</div></article>`;
  }).join('');
  const battu=mgmtRecords(m).battu;
   const family=x=>(x||'').trim().split(/\s+/).pop();
   const unit={sigAtt:'coups significatifs tentés',koRapide:'secondes',amenees:'amenées réussies',knockdowns:'knockdowns',controle3:'de contrôle au sol',corps:'coups au corps'};
   const ancien=battu&&battu.avant?` L'ancien record était de ${battu.avant.valeur} (${family(battu.avant.combattant.nom)}).`:'';
   const phrase=battu&&L.beaten[battu.id]?L.beaten[battu.id].replace('{nom}',family(battu.combattant.nom)).replace('{valeur}',battu.valeur+' '+unit[battu.id]).replace('{soiree}',battu.soiree).replace('{avant}',ancien):'';
   const rec=phrase?`<aside class="mgmt-me-battu"><b>RECORD BATTU</b><span>${esc(phrase)}</span></aside>`:'';
  return `<div class="mgmt-me"><div class="mgmt-me-gender">${esc(L.gender[gender])}</div><div class="mgmt-me-grid">${html}</div>${rec}</div>`;
}
function mgmtRecordsHtml(m){
  const L=MGMT_MEILLEURS_LABELS,r=mgmtRecords(m),years=(m.hist||[]).filter(x=>x&&x.date).map(x=>new Date(x.date).getFullYear()).filter(Number.isFinite),year=years.length?Math.min(...years):'';
  const orders=[['unCombat',['sigAtt','koRapide','amenees','knockdowns','controle3','corps']],['carriere',['finitions','defensesTitre','victoiresSuite','combats','plusJeuneChampion']]];
  const format=(id,v)=>id==='koRapide'?`0:${String(v).padStart(2,'0')}`:id==='controle3'?`${Math.floor(v/60)}:${String(v%60).padStart(2,'0')}`:String(v);
  let count=0;
  const groups=orders.map(([group,ids])=>{const rows=ids.map(id=>{const rec=r[group].find(x=>x.id===id&&x.combattant);if(!rec)return '';count++;const battu=r.battu&&r.battu.id===id?`<span class="mgmt-re-new">NOUVEAU</span><small>avant : ${esc(r.battu.avant.combattant.nom)}, ${esc(r.battu.avant.valeur)}</small>`:'';return `<div class="mgmt-re-row"><strong>${esc(format(id,rec.valeur))}${id==='plusJeuneChampion'?' <small>ANS</small>':''}</strong><div><div>${esc(L.recordLabels[id])} ${battu}</div><small>${esc(rec.combattant.nom)} · Split Fight Night ${esc(rec.soiree)}${year?`, ${esc(year)}`:''}</small></div></div>`;}).join('');return rows?`<section class="mgmt-re-group"><h3>${group==='unCombat'?'EN UN COMBAT':'EN CARRIÈRE'}</h3>${rows}</section>`:'';}).join('');
  return `<div class="mgmt-re">${year?`<p>Tous les combats de Split depuis ${esc(year)}, toutes catégories</p>`:''}${groups||`<p>${esc(L.empty)}</p>`}</div>`;
}

/** Le compte global de Split dans le top 15 mondial : la même dérivation
 *  que l'écran de l'organisation (mgmtOrgEffectifRows), jamais une seconde
 *  dérivation de la loi de classement. @returns {{n:number,divs:number}} */
function mgmtClassementsOrgCount(m){
  const rows=mgmtOrgEffectifRows(m);
  return {n:rows.reduce((s,r)=>s+r.top15,0),divs:rows.filter(r=>r.top15>0).length};
}

/** La phrase du bloc « Ton organisation » : le compte factuel dérivé, sans
 *  ambiguïté de lecture (ce n'est pas un seul top 15 : chaque combattant
 *  compte dans le top 15 SA catégorie ; les ranks se lisent sur N catégories
 *  représentées) et sans objectif ni patron (lot 5, §1). @returns {string} */
function mgmtClassementsOrgLine(org){
  return `${org.n} ${org.n===1?MGMT_CLASSEMENTS_LABELS.combattant
    :MGMT_CLASSEMENTS_LABELS.combattants} de ${mgmtOrgNom()} `
    +MGMT_CLASSEMENTS_LABELS.dans
    +`, ${MGMT_CLASSEMENTS_LABELS.sur} ${org.divs} `
    +`${org.divs===1?MGMT_CLASSEMENTS_LABELS.categorie
    :MGMT_CLASSEMENTS_LABELS.categories}.`;
}

/** Tendance d'un rang entre le classement courant et celui du cycle
 *  précédent (recalcul, jamais stocké). prev null : pas de comparaison
 *  possible (m.cycle = 0). SENS : l'INDEX plus petit = mieux classé —
 *  hier derrière (i>curI), aujourd'hui devant : il a gagné des places
 *  (« +n », le NUMÉRO de rang descend) ; hier devant, aujourd'hui
 *  derrière : il a perdu des places (« -n »). Pur.
 *  @returns {object|null} */
function mgmtClassementsTendance(cur,curI,prev){
  if(!prev) return null;
  const i=prev.findIndex(x=>x.id===cur.id);
  if(i<0) return {t:'nouveau'};
  if(i>curI) return {t:'up',n:i-curI};
  if(i<curI) return {t:'down',n:curI-i};
  return {t:'eq'};
}

/** Le libellé d'une tendance, dans la colonne. @returns {string} */
function mgmtClassementsTrendHtml(tr){
  if(!tr) return `<span class="mgmt-cl-trend">-</span>`;
  if(tr.t==='eq') return `<span class="mgmt-cl-trend">=</span>`;
  if(tr.t==='nouveau') return `<span class="mgmt-cl-trend up">${esc(MGMT_CLASSEMENTS_LABELS.trendNew)}</span>`;
  if(tr.t==='up') return `<span class="mgmt-cl-trend up">+${esc(tr.n)}</span>`;
  return `<span class="mgmt-cl-trend down">-${esc(tr.n)}</span>`;
}

/** Une ligne de classement : rang, nom, bilan, organisation, tendance.
 *  Cliquable : la fiche du combattant, extérieur comme Split. */
function mgmtClassementsRowHtml(m,rank,row,tr){
  const f=mgmtFicheLigne(m,row.id);
  const nom=f?f.f.name:'Combattant';
  const d=(row.D===undefined)?0:row.D;
  const rec=`${row.W}-${row.L}${d>0?'-'+d:''}`;
  const split=!!(f&&!f.trace&&!f.orgId);
  const org=f?(f.orgId?(f.f.org||''):f.trace?(f.trace.orgs.length?(f.trace.orgs[f.trace.orgs.length-1].name||''):''):mgmtOrgNom(m)):'';
  return `<div class="mgmt-cl-row" onclick="CL.mgmtFiche('${escJsAttr(row.id)}')">`
    +`<span class="mgmt-cl-rank">${esc(rank)}</span>`
    +`<span class="mgmt-cl-nm">${esc(nom)}${(()=>{ const s=mgmtSurnomDe(m,row.id); return s?` <i class="mgmt-cl-sur">« ${esc(s)} »</i>`:''; })()}</span>`
    +`<span class="mgmt-cl-rec">${esc(rec)}</span>`
    +`<span class="mgmt-cl-org${split?' split':''}">${esc(org)}</span>`
    +mgmtClassementsTrendHtml(tr)+`</div>`;
}

/** Un constat de mouvement de cette soirée : la phrase factuelle (§1),
 *  une ligne, sans cause supposée ni voix. */
function mgmtClassementsMove(m,id,type,n){
  const f=mgmtFicheLigne(m,id);
  const nom=f?f.f.name:'Combattant';
  const L=MGMT_CLASSEMENTS_LABELS;
  /* Élision d'usage : « monte d'une place », jamais « de une » ni
     « de une place » ; au-delà, « de 2 places ». */
  const deplace=n===1?'d\u2019'+L.une:'de '+n+' '+L.places;
  if(type==='inTop') return `${nom} ${L.entreTop}.`;
  if(type==='inList') return `${nom} ${L.entreClassement} (${mgmtRankLabel(n)}).`;
  if(type==='out') return `${nom} ${L.sortTop}.`;
  if(type==='up') return `${nom} ${L.monte} ${deplace}.`;
  return `${nom} ${L.recule} ${deplace}.`;
}

/** Le bloc « Ce qui a bougé ce cycle-ci » : entrées puis sorties puis les
 *  mouvements des quinze premiers, tous les faits du classement courant
 *  contre celui du cycle précédent. prev null : rien du tout (§1 : un
 *  bloc sans contenu n'apparaît pas). @returns {string} */
function mgmtClassementsStepsHtml(m,cur,prev){
  if(!prev) return '';
  const moves=[];
  cur.forEach((row,i)=>{
    const p=prev.findIndex(x=>x.id===row.id);
    if(i<MGMT_CL_TOP){
      if(p<0) moves.push({id:row.id,type:'inTop'});
      else if(p>i) moves.push({id:row.id,type:'up',n:p-i});
      else if(p<i) moves.push({id:row.id,type:'down',n:i-p});
    }else if(p<0){
      moves.push({id:row.id,type:'inList',n:i+1});
    }
  });
  prev.forEach((row,p)=>{
    /* Rouge réservé au danger et aux défaites : une sortie du top 15 est
       un recul, la phrase factuelle la porte seule. */
    if(p<MGMT_CL_TOP&&!cur.some(x=>x.id===row.id)) moves.push({id:row.id,type:'out'});
  });
  if(moves.length===0) return `<div class="mgmt-cl-move">${esc(MGMT_CLASSEMENTS_LABELS.movesAucun)}</div>`;
  return moves.map(x=>`<div class="mgmt-cl-move">${esc(mgmtClassementsMove(m,x.id,x.type,x.n||0))}</div>`).join('');
}

/** Les onglets de catégorie, hommes puis femmes (ordre d'engine.js). */
function mgmtClassementsTabsHtml(){
  const all=allDivisions();
  const femmes=all.filter(d=>d.gender==='F');
  const hommes=all.filter(d=>d.gender!=='F');
  const tab=d=>{
    const sel=MGMT_CLASSEMENTS.div===d.id;
    return `<button type="button" class="mgmt-cl-tab${sel?' cur':''}"`
      +`${sel?' aria-pressed="true"':''}`
      +` onclick="CL.mgmtClassementsTab('${escJsAttr(d.id)}')">${esc(mgmtDivisionLabel(d))}</button>`;
  };
  return hommes.map(tab).join('')+femmes.map(tab).join('');
}

/** Le basculement MONDIAL / SPLIT, deux vitesses devant (addendum 2 §5 :
 *  niveau 1 immédiat). */
function mgmtClassementsScopeBtnsHtml(){
  const L=MGMT_CLASSEMENTS_LABELS;
  const bt=(key,txt)=>{
    const sel=MGMT_CLASSEMENTS.scope===key;
    return `<button type="button" class="mgmt-cl-tab${sel?' cur':''}"`
      +`${sel?' aria-pressed="true"':''}`
      +` onclick="CL.mgmtClassementsScope('${key}')">${esc(txt)}</button>`;
  };
  return bt('world',L.worldTab)+bt('split',mgmtOrgNom());
}

/* ==== [ANCRE: MGMT_LOT5_T1_CHAMPIONS_ECRAN] — Lot 5 T1, maquette 07 et
   complément 04b validé le 02/10/2026. Mondial n'est pas une fédération :
   cinq ceintures distinctes, une par organisation ; Split : la sienne.
   Faits seulement (R1), aucun portrait, aucun pronostic ni voix (H1/H4).
   Les ceintures vacantes restent lisibles, sans inventer de détenteur. ==== */
function mgmtClassementsChampionsHtml(m,div,scope){
  const belts=[mgmtSplitTitle(m,div)];
  if(scope==='world') belts.push(...mgmtExteriorTitles(m,div).belts);
  const label=divById(div)?.gender==='F'?'Championne':'Champion';
  return `<div class="mgmt-cl-champions">`+belts.map(belt=>{
    const line=belt.id?mgmtFicheLigne(m,belt.id):null;
    const f=line&&line.f;
    const org=`<span class="mgmt-cl-champion-label">${esc(label)} · ${esc(belt.org)}</span>`;
    if(!f) return `<div class="mgmt-cl-champion">${org}<span class="mgmt-cl-champion-meta">Titre vacant</span></div>`;
    const record=`${f.W}-${f.L}${f.D>0?'-'+f.D:''}`;
    const defenses=`${belt.defenses} ${belt.defenses>1?'défenses':'défense'}`;
    return `<button type="button" class="mgmt-cl-champion" onclick="CL.mgmtFiche('${escJsAttr(f.id)}')">`
      +org+`<span class="mgmt-cl-champion-name">${esc(f.name)}</span>`
      +`<span class="mgmt-cl-champion-meta">${esc(record)} · ${esc(defenses)}</span></button>`;
  }).join('')+`</div>`;
}
/* ==== [FIN ANCRE] ==== */

/** L'écran (maquette 07) : onglets de catégorie et portée en tête, la
 *  liste du top 15 à gauche, les constats et le compte de Split à droite. */
function scr_mgmt_classements(){
  if(!G||!G.mgmt) return scr_mgmt_bureau();
  const m=G.mgmt, L=MGMT_CLASSEMENTS_LABELS;
  if(!divById(MGMT_CLASSEMENTS.div)) MGMT_CLASSEMENTS.div=allDivisions()[0].id;
  if(MGMT_CLASSEMENTS.scope!=='world'&&MGMT_CLASSEMENTS.scope!=='split'){
    MGMT_CLASSEMENTS.scope='world';
  }
  if(MGMT_CLASSEMENTS.vue==='meilleurs'||MGMT_CLASSEMENTS.vue==='records'){
    const records=MGMT_CLASSEMENTS.vue==='records';
    return `<div class="scr mgmt-wrap mgmt-cl"><div class="mgmt-head bar"><div><div class="eyebrow gold">${esc(mgmtOrgNom(m))} — Management</div><h2 class="disp">${esc(L.title)}</h2></div><div class="mgmt-cl-scopebtns">${mgmtClassementsVueBtnsHtml()}${!records?mgmtClassementsScopeBtnsHtml():''}</div></div>${!records?`<div class="mgmt-cl-tabs">${mgmtClassementsTabsHtml()}</div>`:''}${records?mgmtRecordsHtml(m):mgmtMeilleursHtml(m)}</div>`;
  }
  const scope=MGMT_CLASSEMENTS.scope;
  /* Les deux portées du classement (lot 2B T1 bis) : la bascule d'écran
     porte « mondial » ou « split », la loi attend « world » ou
     « organization » — la même loi, jamais un second classement. */
  const portee=scope==='world'?'world':'organization';
  const cur=mgmtDivisionRanking(m,MGMT_CLASSEMENTS.div,portee);
  const prev=(Number.isSafeInteger(m.cycle)&&m.cycle>0)
    ?mgmtDivisionRanking(m,MGMT_CLASSEMENTS.div,portee,m.cycle-1):null;
  const trs=cur.map((row,i)=>({row,tr:mgmtClassementsTendance(row,i,prev)}));
  const top=trs.slice(0,MGMT_CL_TOP);
  const autres=trs.slice(MGMT_CL_TOP);
  const label=`<div class="mgmt-cl-scope">${esc(scope==='world'?L.worldLabel:mgmtOrgNom()+' — l\'organisation')}</div>`;
  const headRow=`<div class="mgmt-cl-headrow">${L.head.map(h=>`<span>${esc(h)}</span>`).join('')}</div>`;
  const topHtml=top.map((x,i)=>mgmtClassementsRowHtml(m,i+1,x.row,x.tr)).join('');
  const autresHtml=autres.length>0
    ?`<details class="mgmt-cl-plus"><summary>${esc(L.autres)} · ${autres.length}</summary>`
      +autres.map((x,i)=>mgmtClassementsRowHtml(m,MGMT_CL_TOP+i+1,x.row,x.tr)).join('')+`</details>`
    :'';
  const org=mgmtClassementsOrgCount(m);
  return `<div class="scr mgmt-wrap mgmt-cl">`
    +`<div class="mgmt-head bar"><div><div class="eyebrow gold">${esc(mgmtOrgNom(m))} — Management</div>`
    +`<h2 class="disp">${esc(L.title)}</h2></div>`
     +`<div class="mgmt-cl-scopebtns">${mgmtClassementsVueBtnsHtml()}${mgmtClassementsScopeBtnsHtml()}</div></div>`
    +`<div class="mgmt-cl-tabs">${mgmtClassementsTabsHtml()}</div>`
    +`<div class="mgmt-cl-cols">`
    +`<section class="mgmt-cl-pane mgmt-cl-list">`
    +mgmtClassementsChampionsHtml(m,MGMT_CLASSEMENTS.div,scope)
    +`<div class="mgmt-cl-flag"><span class="mgmt-cl-stitle">${esc(L.top15)}</span>${label}</div>`
    +(cur.length===0
      ?`<div class="mgmt-cl-move">${esc(L.vide)}</div>`
      :headRow)
    +topHtml+autresHtml
    +`</section>`
    +`<aside class="mgmt-cl-pane mgmt-cl-side">`
    +`<h3 class="mgmt-cl-hd">${esc(L.moves)}</h3>`
    +mgmtClassementsStepsHtml(m,cur,prev)
    +`<h3 class="mgmt-cl-hd mt">${esc(L.organisation)}</h3>`
    +`<div class="mgmt-cl-move">${esc(mgmtClassementsOrgLine(org))}</div>`
    +`</aside></div></div>`;
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: MGMT_LOT4_T6_CLASSEMENTS_CL] — les deux gestes de l'onglet :
 *  choisir une catégorie, basculer mondial / Split. Souris d'abord ;
 *  échap (mgmt-screens.js) ramène à la semaine, le clavier n'est jamais
 *  exclusif. Aucun état persisté : une trace de rendu. ==== */
Object.assign(CL,{
  mgmtClassementsVue(vue){if(!['liste','meilleurs','records'].includes(vue))return;MGMT_CLASSEMENTS.vue=vue;render();},
  mgmtClassementsTab(divId){
    if(!G||!G.mgmt) return;
    if(!divById(divId)) return;
    MGMT_CLASSEMENTS.div=divId;
    render();
  },
  mgmtClassementsScope(scope){
    if(!G||!G.mgmt) return;
    if(scope!=='world'&&scope!=='split') return;
    MGMT_CLASSEMENTS.scope=scope;
    render();
  },
});
