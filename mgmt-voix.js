"use strict";
/* ==== [ANCRE: MGMT_LOT5_T2T3_VOIX] — Lot 5 T2 + T3 : la voix branchée.
   Chaque combattant a UNE voix (parmi les quarante-huit du document des
   voix, mgmt-voix-data.js), déduite de son identifiant sur un flux séparé
   'voix' : même partie, même monde, rien ne se stocke (document §8). Selon
   la situation (annonce, victoire, défaite, inactivité, réseaux…), le
   mécanisme choisit UNE réplique de SA voix, remplit ses emplacements
   depuis l'état du jeu et accorde au féminin. Aucune réplique n'est écrite
   ici : ce sont celles du document, relu:false jusqu'à la relecture
   d'Anthony. Une réplique dont un emplacement manque n'est jamais montrée.
   Parties neuves seulement. ==== */

const MGMT_VOIX_COMMUNE='la-voix-commune';
/** La voix commune : un combattant sur quatre (document §8). */
const MGMT_VOIX_COMMUNE_PART=0.25;
/** Le Signeur : un combattant sur deux cents. */
const MGMT_VOIX_SIGNEUR_PART=1/200;
/** Nationalités de l'Interprété (document §3.7). */
const MGMT_VOIX_INTERPRETE_PAYS=['BR','JP','RU','MX','TH','KR','GE'];
/** Mois par cycle (5 semaines, 52 semaines pour 12 mois). */
const MGMT_VOIX_MOIS_PAR_CYCLE=MGMT_EVENT_WEEKS*12/MGMT_EXT_YEAR_WEEKS;

/** Pourquoi une voix est écartée d'un combattant (document §8) ; son poids
 *  revient alors à la Commune. Les voix qui ne se tirent pas au départ
 *  (le Hanté, le Converti tardif) ne sont jamais attribuées ici. */
function mgmtVoixPermise(id,f,genre,combats,pays){
  switch(id){
    case 'la-mere': return genre==='F'&&f.age>=24;
    case 'le-vieux-de-la-vieille': return f.age>=33;
    case 'le-timide': return f.age<24&&combats<10;
    case 'la-pionniere': return genre==='F';
    case 'le-hante': case 'le-converti-tardif': return false;
    case 'linterprete': return MGMT_VOIX_INTERPRETE_PAYS.includes(pays);
    default: return true;
  }
}

/** La voix d'un combattant : id d'une entrée de MGMT_VOIX. Déduite, jamais stockée. */
function mgmtVoixId(f){
  const r=mgmtIdentiteStream(f.id,'voix');
  const genre=(divById(f.div)||{}).gender;
  const pays=typeof mgmtIdentitePays==='function'?mgmtIdentitePays(f):null;
  const combats=(f.W||0)+(f.L||0)+(f.D||0);
  const u=r();
  if(u<MGMT_VOIX_COMMUNE_PART) return MGMT_VOIX_COMMUNE;
  const autres=MGMT_VOIX.filter(v=>v.id!==MGMT_VOIX_COMMUNE);
  /* Les quarante-sept autres se partagent le reste, à poids égaux, le
     Signeur à 1/200 ; une contrainte qui écarte une voix rend son poids à la Commune. */
  const reste=1-MGMT_VOIX_COMMUNE_PART;
  const part=(reste-MGMT_VOIX_SIGNEUR_PART)/(autres.length-1);
  let t=u-MGMT_VOIX_COMMUNE_PART;
  for(const v of autres){
    const poids=v.id==='le-signeur'?MGMT_VOIX_SIGNEUR_PART:part;
    if(t<poids) return mgmtVoixPermise(v.id,f,genre,combats,pays)?v.id:MGMT_VOIX_COMMUNE;
    t-=poids;
  }
  return MGMT_VOIX_COMMUNE;
}

/* ---- Les voix qui changent (document §4 et §8) ------------------------ */

/** Le Timide a cessé de l'être après tant de combats (document §4 : dix). */
const MGMT_VOIX_TIMIDE_COMBATS=10;
/** Le Repenti rechute après tant de défaites de suite. */
const MGMT_VOIX_REPENTI_DEFAITES=3;
/** Un KO « très lourd » : subi dès le premier round. */
const MGMT_VOIX_KO_LOURD_ROUND=1;
/** La part des combattants qu'un KO très lourd hante (flux 'voix-change'). Mesuré le 03/10 : à 25 %, 14 % du vestiaire était Hanté au bout de cinq ans (la voix est censée peser 2 %) ; à 5 %, ~3 %. */
const MGMT_VOIX_HANTE_PART=0.05;

/** Le premier KO très lourd subi par un combattant, lu sur la trace ; null sinon. */
function mgmtVoixPremierKoLourd(m,f){
  const res=mgmtResultatsDetail(m,f);
  for(let i=res.length-1;i>=0;i--){
    if(res[i].issue==='loss'&&res[i].family==='ko'&&res[i].round<=MGMT_VOIX_KO_LOURD_ROUND) return res[i];
  }
  return null;
}

/** Le changement de voix d'un combattant, déduit de l'historique : UNE fois
 *  dans une carrière, jamais d'un tirage de partie (le flux 'voix-change'
 *  n'est semé que par l'identifiant). Le Timide après dix combats ; le
 *  Metteur en scène après un KO très lourd (Cœur ouvert ou Métronome) ; le
 *  Repenti qui rechute devient Aigri ; ceux qu'un KO très lourd hante
 *  deviennent le Hanté. @returns {{vers:string,raison:string}|null} */
function mgmtVoixChangement(m,f){
  if(!m||m.effectifs!==1||!(m.roster||[]).some(o=>o.id===f.id)) return null;
  const base=mgmtVoixId(f);
  const ko=mgmtVoixPremierKoLourd(m,f);
  const r=mgmtIdentiteStream(f.id,'voix-change');
  if(base==='le-metteur-en-scene'&&ko) return {vers:r()<0.5?'le-coeur-ouvert':'le-metronome',raison:'ko'};
  if(ko&&base!=='le-hante'&&r()<MGMT_VOIX_HANTE_PART) return {vers:'le-hante',raison:'ko'};
  if(base==='le-timide'&&(f.W||0)+(f.L||0)+(f.D||0)>=MGMT_VOIX_TIMIDE_COMBATS) return {vers:MGMT_VOIX_COMMUNE,raison:'combats'};
  if(base==='le-repenti'){
    const res=mgmtResultatsDetail(m,f);
    let k=0; for(const x of res){ if(x.issue==='loss') k++; else break; }
    if(k>=MGMT_VOIX_REPENTI_DEFAITES) return {vers:'laigri',raison:'rechute'};
  }
  return null;
}

/** La voix d'un combattant AUJOURD'HUI : la voix du départ, ou celle que
 *  l'histoire lui a donnée. Déduite, jamais stockée. */
function mgmtVoixActuelle(m,f){
  const c=mgmtVoixChangement(m,f);
  return c?c.vers:mgmtVoixId(f);
}

/** Accorde les [masculin|féminin] du locuteur. */
function mgmtVoixAccorde(texte,genre){
  return texte.replace(/\[([^|\]]+)\|([^\]]+)\]/g,(m,a,b)=>genre==='F'?b:a);
}

/** Remplit les emplacements ; null si l'un d'eux manque ou reste inconnu. */
function mgmtVoixRemplit(texte,ctx){
  let manque=false;
  const out=texte.replace(/\{([a-z_]+)\}/g,(m,k)=>{
    const v=ctx[k];
    if(v===undefined||v===null||v===''){ manque=true; return m; }
    return String(v);
  });
  return manque?null:out;
}

/** Le contexte d'une situation, lu sur l'état du jeu (la trace, la carte,
 *  le classement) : jamais un chiffre inventé. */
function mgmtVoixContexte(m,f,situation){
  const ctx={cat:mgmtDivisionLabel(f.div),org:mgmtOrgNom(m)};
  /* Les emplacements coûteux (identité, classements) se calculent à la demande :
     une réplique qui ne les cite pas ne les paie pas. */
  const paresseux=(cle,calcul)=>Object.defineProperty(ctx,cle,{enumerable:true,configurable:true,get(){
    const v=calcul(); Object.defineProperty(ctx,cle,{value:v,enumerable:true}); return v; }});
  const identite=()=>mgmtIdentite(m,f);
  paresseux('pays',()=>COUNTRIES[mgmtIdentitePays(f)].name);
  paresseux('metier',()=>identite().metier);
  paresseux('surnom',()=>identite().surnom);
  paresseux('rang',()=>{ const r=mgmtDivisionRank(m,f,'world'); return r===null?null:mgmtRankLabel(r,divById(f.div)); });
  let adv=null;
  if(situation==='annonce'||situation==='reseaux'||situation==='forfait'||situation==='proposition'){
    const cf=mgmtCardFights(m).find(x=>x.a===f.id||x.b===f.id);
    if(cf) adv=mgmtFighterById(m,cf.a===f.id?cf.b:cf.a);
  }else if(situation==='victoire'||situation==='defaite'){
    const t=mgmtResultatsDetail(m,f)[0];
    if(t){ adv=mgmtFighterById(m,t.adv); ctx.round=t.round; }
  }
  if(adv){
    ctx.adv=adv.name;
    paresseux('rang_adv',()=>{ const r2=mgmtDivisionRank(m,adv,'world'); return r2===null?null:mgmtRankLabel(r2,divById(adv.div)); });
  }
  if(situation==='inactivite'&&Number.isSafeInteger(f.lastCycle)){
    ctx.mois=Math.max(1,Math.round((m.cycle-f.lastCycle)*MGMT_VOIX_MOIS_PAR_CYCLE));
  }
  return ctx;
}

/** Les combats de Split d'un combattant, du plus récent au plus ancien, avec
 *  l'adversaire et le round : [{adv,round,issue,family,c}]. */
function mgmtResultatsDetail(m,f){
  const out=[];
  for(let i=(m.hist||[]).length-1;i>=0;i--){
    const t=m.hist[i];
    if(!t||!t.a||!t.b) continue;
    const cote=t.a.id===f.id?'A':(t.b.id===f.id?'B':null);
    if(!cote) continue;
    out.push({adv:(cote==='A'?t.b:t.a).id,round:t.round,family:t.family,c:t.c,
      issue:t.winner==='D'?'draw':(t.winner===cote?'win':'loss')});
  }
  return out;
}

/** Les répliques d'une voix pour une situation, du plus précis (« Défaite, KO »)
 *  au plus général (« Défaite »). */
function mgmtVoixRepliquesDe(voixId,situation,variante){
  const v=MGMT_VOIX.find(x=>x.id===voixId);
  if(!v) return [];
  const exacte=variante?v.repliques.filter(r=>r.situation===situation&&r.etiquette.toLowerCase().includes(variante)):[];
  if(exacte.length) return exacte;
  return v.repliques.filter(r=>r.situation===situation&&!r.etiquette.includes(','));
}

/** UNE réplique de SA voix pour une situation, remplie et accordée, ou null.
 *  Le choix est déterministe sur (id, situation, cycle) — flux 'parole' :
 *  rejouer la semaine redit la même phrase. @returns {string|null} */
function mgmtReplique(m,f,situation,variante){
  const genre=(divById(f.div)||{}).gender;
  const ctx=mgmtVoixContexte(m,f,situation);
  const essayer=voixId=>{
    const liste=mgmtVoixRepliquesDe(voixId,situation,variante);
    if(!liste.length) return null;
    const r=mgmtIdentiteStream(f.id,'parole|'+situation+'|'+m.cycle);
    const debut=Math.floor(r()*liste.length);
    for(let k=0;k<liste.length;k++){
      const rep=liste[(debut+k)%liste.length];
      const plein=mgmtVoixRemplit(mgmtVoixAccorde(rep.texte,genre),ctx);
      if(plein!==null) return plein;
    }
    return null;
  };
  return essayer(mgmtVoixActuelle(m,f))||essayer(MGMT_VOIX_COMMUNE);
}

/** Ce qu'on dit de lui en ce moment : sa dernière parole, selon ce qu'il vit —
 *  le combat qu'il vient de jouer, celui qu'on lui annonce, ou l'attente.
 *  @returns {{situation:string,texte:string}|null} */
function mgmtParoleRecente(m,f){
  if(!m||m.effectifs!==1) return null;
  const dernier=mgmtResultatsDetail(m,f)[0];
  let situation=null, variante=null;
  if(dernier&&dernier.c>=m.cycle-1&&dernier.issue!=='draw'){
    situation=dernier.issue==='win'?'victoire':'defaite';
    if(situation==='defaite') variante=dernier.family==='ko'?'ko':(dernier.family==='dec'?'décision':null);
  }else if(mgmtEngaged(m,f)) situation='annonce';
  else if(Number.isSafeInteger(f.lastCycle)&&m.cycle-f.lastCycle>=3) situation='inactivite';
  if(!situation) return null;
  const texte=mgmtReplique(m,f,situation,variante);
  return texte?{situation,texte}:null;
}

/** Une parole telle qu'on l'affiche : entre guillemets, sauf les réseaux, dont
 *  les lignes décrivent parfois une publication plutôt qu'une citation. */
function mgmtParoleLigne(p){
  return p.reseaux?p.name+' (réseaux) : '+p.texte:p.name+' : « '+p.texte+' »';
}

/** « Ce qu'on dit de lui » (fiche) : sa parole et rien d'autre. */
function mgmtFicheParole(m,f){
  if(!(m.roster||[]).some(o=>o.id===f.id)) return '';
  const p=mgmtParoleRecente(m,f);
  const change=typeof mgmtVoixChangement==='function'&&mgmtVoixChangement(m,f);
  return `<h3>Ce qu'on dit de lui</h3>`+(p?`<p class="mgmt-fiche-parole">« ${esc(p.texte)} »</p>`:'<p>On ne sait pas encore.</p>')
    +(change?'<p class="mgmt-fiche-vie-relais">Il ne parle plus comme avant.</p>':'');
}

/** Les paroles de la semaine (« Ce qui se dit ») : ton cercle et tes suivis
 *  d'abord, puis le vestiaire, deux au plus. @returns {Array<{id,name,div,texte}>} */
function mgmtParolesDeLaSemaine(m){
  if(!m||m.effectifs!==1) return [];
  /* Ceux qui viennent de combattre (le cycle précédent) : une trentaine au plus. */
  const ids=new Set();
  for(const t of m.hist||[]){
    if(t&&t.c>=m.cycle-1){ ids.add(t.a.id); ids.add(t.b.id); }
  }
  const candidats=[...ids].map(id=>mgmtFighterById(m,id)).filter(f=>f&&!mgmtIsRetired(f)).map(f=>({f,lien:mgmtLien(m,f.id)}));
  const rang=x=>x.lien==='cercle'?2:(x.lien==='suivi'?1:0);
  candidats.sort((a,b)=>rang(b)-rang(a)||(a.f.id<b.f.id?-1:1));
  const out=[];
  for(const {f} of candidats){
    if(out.length>=2) break;
    const p=mgmtParoleRecente(m,f);
    if(p&&(p.situation==='victoire'||p.situation==='defaite')) out.push({id:f.id,name:f.name,div:f.div,texte:p.texte});
  }
  /* Les réseaux (situation 'reseaux') : ceux qui se préparent à combattre
     publient ; la tête de la carte principale d'abord, ton cercle avant le reste. */
  if(out.length<2){
    const sur=[];
    for(const cf of mgmtCardFights(m)){
      for(const id of [cf.a,cf.b]){ const f=mgmtFighterById(m,id); if(f&&!sur.some(x=>x.f.id===f.id)) sur.push({f,lien:mgmtLien(m,f.id),slot:cf.slot==='main'?1:0}); }
    }
    const rang=x=>(x.lien==='cercle'?4:(x.lien==='suivi'?2:0))+x.slot;
    sur.sort((a,b)=>rang(b)-rang(a)||(a.f.id<b.f.id?-1:1));
    for(const {f} of sur){
      if(out.length>=2) break;
      if(out.some(x=>x.id===f.id)) continue;
      const texte=mgmtReplique(m,f,'reseaux');
      if(texte) out.push({id:f.id,name:f.name,div:f.div,texte,reseaux:true});
    }
  }
  return out;
}

/** Le style d'un adversaire pour la voix : « lutteur » (propension au sol de
 *  0,5 et plus), « frappeur », ou « inconnu » (moins de trois combats). */
function mgmtVarianteAdversaire(adv){
  if((adv.W||0)+(adv.L||0)+(adv.D||0)<3) return 'inconnu';
  const s=STYLES[mgmtIdentiteStyle(adv)];
  return s&&s.grap>=0.5?'lutteur':'frappeur';
}

/** Les réponses à une proposition : quand le joueur booke un combat, chacun des
 *  deux répond, de SA voix (situation 'proposition', variante selon
 *  l'adversaire). Une réplique dont un emplacement manque n'est pas montrée.
 *  @returns {Array<{id:string,name:string,texte:string}>} */
function mgmtReponsesProposition(m,aid,bid){
  if(!m||m.effectifs!==1) return [];
  const out=[];
  for(const [moi,lui] of [[aid,bid],[bid,aid]]){
    const f=mgmtFighterById(m,moi), adv=mgmtFighterById(m,lui);
    if(!f||!adv) continue;
    const texte=mgmtReplique(m,f,'proposition',mgmtVarianteAdversaire(adv));
    /* Deux voix communes disent la même phrase : on ne la lit qu'une fois. */
    if(texte&&!out.some(x=>x.texte===texte)) out.push({id:f.id,name:f.name,texte});
  }
  return out;
}

/** Les dernières réponses à une proposition, lues par l'écran de la carte
 *  (état d'interface seulement : jamais sauvegardé). */
let MGMT_PROPOSITION={c:-1,lignes:[]};
function mgmtPropositionHtml(m){
  if(!m||MGMT_PROPOSITION.c!==m.cycle||!MGMT_PROPOSITION.lignes.length) return '';
  return '<div class="mgmt-proposition" role="status">'
    +MGMT_PROPOSITION.lignes.map(l=>'<p class="mgmt-proposition-ligne"><span>'+esc(l.name)+'</span> « '+esc(l.texte)+' »</p>').join('')+'</div>';
}
/* ==== [FIN ANCRE] ==== */
