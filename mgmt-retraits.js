"use strict";
/* ==== [ANCRE: MGMT_LOT5_T6_RETRAITS] — Lot 5 T6 (lot 3B T3 à T5, QO-1 à QO-4 et
   QO-7) : la carte incomplète. Un combattant se retire d'une carte constituée ;
   le joueur sort du trou par TROIS voies que porte l'interface — remonter un
   combat des préliminaires (gratuit), engager en short notice (un combattant
   de Split ou d'une autre organisation, payable à découvert dans la limite du
   plafond), engager un combattant libre de contrat — et, au-delà du plafond,
   il ne reste que la soirée en carte réduite, avec pénalité. Tout est un FAIT
   (k:'retrait', 'offre', 'engage', 'reduite') : l'état d'une carte incomplète
   se lit dans la carte et dans ces faits, rien de dérivé n'est stocké.
   Les répliques sont celles du registre d'Anthony (mgmt-retraits-data.js,
   généré, aucune retouchée) ; les libellés de boutons reprennent les mots du
   document (« remonter », « short notice », « libre de contrat », « carte
   réduite »). Parties neuves seulement. ==== */

const MGMT_RETRAIT_BASE=0.015;
const MGMT_RETRAIT_CHARGE=0.03;
const MGMT_RETRAIT_BORD=0.08;
/** Prime d'un short notice sur le cachet d'un combat de la carte principale. */
const MGMT_SHORTNOTICE_PRIME=1.5;
/** Un combattant d'une autre organisation ou libre demande davantage. */
const MGMT_SHORTNOTICE_EXTERNE=1.4;
/** Chaque nouvelle offre au même combattant monte de cette part. */
const MGMT_SHORTNOTICE_OFFRE_PAS=0.4;
/** Un combattant du top 5 de sa catégorie refuse un préavis qui nuirait à sa carrière (C2). */
const MGMT_SHORTNOTICE_TOP=5;
/** Pénalité de la carte réduite : l'attrait de la carte, donc l'audience et la recette, baisse. */
const MGMT_REDUITE_PENALITE=0.85;
/** « Libre de contrat » : sa dernière organisation l'a quitté il y a 2 à 6 cycles ;
 *  « d'une autre organisation » : il y combat encore (0 à 1 cycle). */
const MGMT_LIBRE_MIN=2;
const MGMT_LIBRE_MAX=6;
const MGMT_AUTRE_MAX=1;
/** Ce que le joueur lit à l'écran (état d'interface, rien n'est stocké). */
let MGMT_RETRAIT_UI={qui:'',texte:'',c:-1};

/** Chance qu'un combattant booké se retire : faible, plus forte s'il est chargé
 *  (H5 : la charge de l'année). */
function mgmtRetraitProb(m,f){
  const ch=mgmtVieCharge(m,f,m.cycle,true);
  return MGMT_RETRAIT_BASE+(ch>MGMT_CHARGE_BORD?MGMT_RETRAIT_BORD:(ch>MGMT_CHARGE_SEUIL?MGMT_RETRAIT_CHARGE:0));
}

/** Avant la soirée (parties neuves) : un combattant booké peut se retirer —
 *  flux 'retrait' semé par (id, cycle), aucune RNG de partie. Son combat
 *  tombe de la carte, son adversaire reste libre, la carte est incomplète.
 *  Au plus un retrait par cycle. @returns {object|null} le fait posé. */
function mgmtRetraitsAvantSoiree(m){
  if(!m||m.effectifs!==1||!mgmtCardFull(m)) return null;
  if((m.facts||[]).some(x=>x&&x.k==='retrait'&&x.c===m.cycle)) return null;
  for(const slot of ['main','prelims']){
    for(const fight of m.card[slot]){
      for(const [id,adv] of [[fight.a,fight.b],[fight.b,fight.a]]){
        const f=mgmtFighterById(m,id);
        if(!f||mgmtIdentiteStream(id,'retrait|'+m.cycle)()>=mgmtRetraitProb(m,f)) continue;
        m.card[slot]=m.card[slot].filter(x=>x!==fight);
        f.susp=Math.max(Number.isSafeInteger(f.susp)?f.susp:0,m.cycle);
        const fait={c:m.cycle,k:'retrait',a:id,adv,slot:slot==='main'?'main':'prelim'};
        mgmtAddFact(m,fait);
        return fait;
      }
    }
  }
  return null;
}

/** Le retrait de ce cycle tant que la carte reste incomplète, sinon null. */
function mgmtRetraitActif(m){
  if(!m||m.effectifs!==1||mgmtCardFull(m)) return null;
  const x=[...(m.facts||[])].reverse().find(y=>y&&y.k==='retrait'&&y.c===m.cycle);
  return x||null;
}

/** Une soirée en carte réduite est ouverte quand le joueur l'a décidé ce cycle. */
function mgmtReduiteOuverte(m){
  return !!(m&&Array.isArray(m.facts)&&m.facts.some(x=>x&&x.k==='reduite'&&x.c===m.cycle)&&mgmtCardFights(m).length>0);
}

/** Les combattants que le joueur peut engager pour l'adversaire resté seul :
 *  deux de Split (les plus proches en rang), un d'une autre organisation, un libre
 *  de contrat. Coût : prime de préavis sur le cachet de la carte principale. */
function mgmtRetraitCandidats(m,retrait){
  const reste=mgmtFighterById(m,retrait.adv);
  if(!reste) return [];
  const rang=x=>mgmtDivisionRank(m,x,'world')||999;
  const cibleRang=rang(reste);
  const cout=(f,src)=>Math.ceil(mgmtPurse(f,'main')*MGMT_SHORTNOTICE_PRIME*(src==='split'?1:MGMT_SHORTNOTICE_EXTERNE));
  const proches=(liste)=>liste.sort((a,b)=>Math.abs(rang(a)-cibleRang)-Math.abs(rang(b)-cibleRang));
  const out=[];
  const split=m.roster.filter(o=>o.div===reste.div&&o.id!==reste.id&&o.id!==retrait.a&&!mgmtIsRetired(o)&&mgmtAvailable(m,o)&&!mgmtEngaged(m,o));
  for(const f of proches(split).slice(0,2)) out.push({id:f.id,src:'split',name:f.name,cout:cout(f,'split')});
  const externes=mgmtRecrutables(m,reste.div).map(x=>{
    const ligne=m.exterieur.find(e=>e.id===x.id); const t=ligne?mgmtExteriorTrace(ligne,m.cycle):null;
    const o=t&&t.orgs.length?t.orgs[t.orgs.length-1]:null;
    const ecart=o&&Number.isSafeInteger(o.to)?m.cycle-o.to:null;
    return {x,ecart};
  }).filter(e=>e.ecart!==null&&e.ecart>=0);
  const trie=l=>l.sort((a,b)=>Math.abs(a.x.rang-cibleRang)-Math.abs(b.x.rang-cibleRang));
  const autre=trie(externes.filter(e=>e.ecart<=MGMT_AUTRE_MAX))[0];
  const libre=trie(externes.filter(e=>e.ecart>=MGMT_LIBRE_MIN&&e.ecart<=MGMT_LIBRE_MAX))[0];
  for(const [e,src] of [[autre,'autre'],[libre,'libre']]){
    if(e) out.push({id:e.x.id,src,name:e.x.name,cout:cout({W:e.x.W,L:e.x.L,D:0},src)});
  }
  return out;
}

/** Ce que la carte incomplète offre au joueur, tel que l'interface le porte. */
function mgmtRetraitOptions(m){
  const r=mgmtRetraitActif(m);
  if(!r) return null;
  const trouMain=m.card.main.length<m.card.sizeMain;
  const remonter=trouMain&&r.slot==='main'&&m.card.prelims.length>0;
  const candidats=trouMain?mgmtRetraitCandidats(m,r):[];
  const payables=candidats.filter(c=>mgmtCanAfford(m,c.cout));
  const premiere=!(m.facts||[]).some(x=>x&&x.k==='retrait_sortie');
  /* Corrections du 08/10, 1.2 : un forfait en préliminaires se règle lui aussi, par un remplaçant que Leïla propose. */
  const trouPrelim=!trouMain&&m.card.prelims.length<(m.card.sizePrelims||MGMT_PRELIM_SIZE);
  return {retrait:r,trouMain,trouPrelim,remonter,candidats,payables,
    reduite:trouMain&&!remonter&&payables.length===0,
    premiereFois:premiere};
}

/** Sortie 1 : un combat des préliminaires monte en carte principale — gratuit ;
 *  Leïla se débrouille pour les préliminaires. @returns {boolean} */
function mgmtRetraitRemonter(m){
  const o=mgmtRetraitOptions(m);
  if(!o||!o.remonter) return false;
  const fight=m.card.prelims[0];
  m.card.prelims=m.card.prelims.slice(1);
  m.card.main.push({a:fight.a,b:fight.b,cycle:m.cycle,slot:'main'});
  mgmtAddFact(m,{c:m.cycle,k:'retrait_sortie',s:'remonter'});
  mgmtOfferBulk(m,false);
  return true;
}

/** Sorties 2 et 3 : engager un combattant en short notice. Le combattant d'une
 *  autre organisation ou libre rejoint Split pour l'occasion (T5). Réponses
 *  d'Anthony : C1 (Split, accepte), C3 (cachet suffisant), C2 (le préavis
 *  nuirait à sa carrière), C4 (cachet insuffisant — une offre plus haute
 *  est possible). @returns {{ok:boolean,reponse:string,cout?:number}} */
function mgmtRetraitEngager(m,candId){
  const o=mgmtRetraitOptions(m);
  if(!o||!o.trouMain) return {ok:false,reponse:'aucun'};
  const c=o.candidats.find(x=>x.id===candId);
  if(!c) return {ok:false,reponse:'aucun'};
  const rangDiv=c.src==='split'?mgmtDivisionRank(m,mgmtFighterById(m,c.id),'organization'):(mgmtRecrutables(m,mgmtFighterById(m,o.retrait.adv).div).find(x=>x.id===c.id)||{}).rang;
  if(rangDiv&&rangDiv<=MGMT_SHORTNOTICE_TOP) return {ok:false,reponse:'C2'};
  const essais=(m.facts||[]).filter(x=>x&&x.k==='offre'&&x.a===c.id&&x.c===m.cycle).length;
  const offre=1+MGMT_SHORTNOTICE_OFFRE_PAS*essais;
  const demande=c.src==='split'?1:1+0.8*mgmtIdentiteStream(c.id,'short|'+m.cycle)();
  const cout=Math.ceil(c.cout*offre);
  if(!mgmtCanAfford(m,cout)) return {ok:false,reponse:'plafond',cout};
  if(offre<demande){
    mgmtAddFact(m,{c:m.cycle,k:'offre',a:c.id});
    return {ok:false,reponse:'C4',cout};
  }
  const reste=o.retrait.adv;
  if(c.src!=='split'&&!mgmtRecruter(m,c.id)) return {ok:false,reponse:'aucun'};
  if(!mgmtBookMain(m,reste,c.id)) return {ok:false,reponse:'aucun'};
  m.treasury-=cout;
  mgmtAddFact(m,{c:m.cycle,k:'engage',a:c.id,src:c.src});
  mgmtAddFact(m,{c:m.cycle,k:'retrait_sortie',s:c.src==='split'?'split':'externe'});
  return {ok:true,reponse:c.src==='split'?'C1':'C3',cout};
}

/** Sortie finale, au-delà du plafond : la soirée se joue en carte réduite.
 *  @returns {boolean} */
function mgmtRetraitReduite(m){
  const o=mgmtRetraitOptions(m);
  if(!o||!o.reduite||mgmtCardFights(m).length===0) return false;
  mgmtAddFact(m,{c:m.cycle,k:'reduite'});
  mgmtAddFact(m,{c:m.cycle,k:'retrait_sortie',s:'reduite'});
  return true;
}

/** Les mots du lendemain d'une carte réduite ou d'une dette : le patron d'abord
 *  (première carte réduite D2, ensuite D3 ; E1 si un découvert a été déduit),
 *  le diffuseur si l'audience a vraiment baissé (D4). @returns {Array<{qui:string,texte:string}>} */
function mgmtLendemainPatron(m){
  const ev=m&&m.lastEvent;
  if(!ev||m.effectifs!==1) return [];
  const R=MGMT_RETRAITS_REPLIQUES, out=[];
  const reduite=(m.facts||[]).some(x=>x&&x.k==='reduite'&&x.c===ev.cycle);
  if(reduite){
    const n=(m.facts||[]).filter(x=>x&&x.k==='reduite'&&x.c<=ev.cycle).length;
    out.push({qui:'Jean-Michel Delatour',texte:(n<=1?R.D2:R.D3).texte});
    const avant=(m.audiences||[]).slice(0,-1);
    const ref=avant.length?Math.round(avant.reduce((a,b)=>a+b,0)/avant.length):mgmtAudienceRef({card:m.card});
    if(ev.finance&&ev.finance.audience<ref*0.9) out.push({qui:'Stephen Tarpit',texte:R.D4.texte});
  }
  if(ev.e1) out.push({qui:'Jean-Michel Delatour',texte:R.E1.texte});
  return out;
}

function mgmtLendemainPatronHtml(m){
  const l=mgmtLendemainPatron(m);
  if(!l.length) return '';
  return `<div class="mgmt-ld-patron">`+l.map(x=>`<p class="mgmt-ld-parole"><span>${esc(x.qui)}</span> « ${esc(x.texte)} »</p>`).join('')+`</div>`;
}

/** Le bloc « carte incomplète » du bureau : Leïla annonce, le combattant répond
 *  (silence sur la cause), puis les sorties que porte l'interface. */
function mgmtRetraitHtml(m){
  const o=mgmtRetraitOptions(m);
  if(!o){
    /* Le trou est comblé : la réponse de celui qu'on vient d'engager (C1, C3) ou du prélim qui monte (B2) reste lue ce cycle. */
    if(MGMT_RETRAIT_UI.texte&&MGMT_RETRAIT_UI.c===m.cycle){
      return `<section class="mgmt-retrait" aria-label="Carte incomplète"><h3>Carte incomplète</h3><p class="mgmt-retrait-parole"><span>${esc(MGMT_RETRAIT_UI.qui)}</span> « ${esc(MGMT_RETRAIT_UI.texte)} »</p></section>`;
    }
    return '';
  }
  const R=MGMT_RETRAITS_REPLIQUES;
  const retire=mgmtFighterById(m,o.retrait.a);
  const nom=retire?retire.name:'';
  const ligne=(qui,texte)=>`<p class="mgmt-retrait-parole"><span>${esc(qui)}</span> « ${esc(texte)} »</p>`;
  let html=`<section class="mgmt-retrait" aria-label="Carte incomplète"><h3>Carte incomplète</h3>`
    +ligne('Leïla Malika',R.A1.texte.replace('{nom}',nom))+ligne(nom,R.A2.texte);
  if(MGMT_RETRAIT_UI.texte) html+=ligne(MGMT_RETRAIT_UI.qui,MGMT_RETRAIT_UI.texte);
  if(o.trouMain){
    if(o.remonter){
      if(o.premiereFois) html+=ligne('Leïla Malika',R.B1.texte);
      html+=`<button type="button" class="mgmt-retrait-sortie" onclick="CL.mgmtRetraitRemonter()">Remonter un combat des préliminaires</button>`;
    }
    for(const c of o.candidats){
      const lib={split:'Short notice',autre:'Short notice, une autre organisation',libre:'Libre de contrat'}[c.src];
      const ok=mgmtCanAfford(m,c.cout);
      html+=`<button type="button" class="mgmt-retrait-sortie" onclick="CL.mgmtRetraitEngager('${esc(c.id)}')"${ok?'':' disabled'}>${esc(lib)} : ${esc(c.name)} · ${esc(c.cout)} k$</button>`;
    }
    if(o.reduite){
      html+=ligne('Leïla Malika',R.D1.texte)
        +`<button type="button" class="mgmt-retrait-sortie" onclick="CL.mgmtRetraitReduite()">Jouer la soirée en carte réduite</button>`;
    }
  }
  if(o.trouPrelim) html+=`<button type="button" class="mgmt-retrait-sortie" onclick="CL.mgmtPrelimsRemplacer()">Trouver un remplaçant</button>`;
  return html+`</section>`;
}
/* ==== [FIN ANCRE] ==== */
