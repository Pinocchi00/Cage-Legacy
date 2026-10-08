"use strict";
/* ==== [ANCRE: CORR0810_ANCIENS_COMBATS] — Demande d'Anthony du 08/10/2026 : « dans la fiche des combattants, les infos de chaque combat, force, faiblesses, remplir chaque case de ses anciens
   combats, et s'améliorer à chaque combat ». Trois choses, toutes DÉRIVÉES (rien n'est stocké, aucun tirage de la partie) :
   1. mgmtAnciensCombats : les combats d'avant la partie, un par case du bilan (autant que de victoires, défaites et nuls du bilan, moins ceux que la partie a joués), avec adversaire, méthode,
      round, âge, et ce qu'ils disent de lui (une force après une victoire, une faille après une défaite) ;
   2. mgmtCombatLecon : la même lecture pour un combat joué sous les yeux du joueur, tirée des statistiques réelles du combat ;
   3. mgmtExperience : chaque combat joué chez l'organisation le fait progresser (plus vite jeune), appliquée au clone de combat par mgmtFightReady.
   Les phrases sont des PROPOSITIONS de Claude (relu:false) : elles se relisent avec les autres textes (tools/exporter-textes.js). ==== */

const MGMT_ANCIENS_TEXTES={relu:false,
  koV:[{t:'Un enchaînement main arrière, main avant, qui a éteint le combat.'},{t:'Un crochet à la volée, sur une ouverture.'},{t:'Un contre pris au bon moment, l’adversaire n’a rien vu.'},{t:'Une série à la tête contre le grillage.'},{t:'Un coup de pied circulaire parti de nulle part.'}],
  koD:[{t:'Un coup reçu en reculant, sans protection sur le côté.'},{t:'Un contre reçu en entrant en distance.'},{t:'Un enchaînement venu sans qu’on le voie.'},{t:'Les mains baissées en fin de round.'},{t:'Un début de combat subi, impossible de s’en remettre.'}],
  subV:[{t:'Un étranglement pris dans un scramble.'},{t:'Un contrôle au sol suivi d’une clé de bras.'},{t:'Un dos pris à la relance, puis l’étranglement.'},{t:'L’autre a ouvert le jeu, la jambe est restée attrapée.'},{t:'Une soumission venue d’une garde qu’on croyait neutre.'}],
  subD:[{t:'Un étranglement subi en défendant son dos.'},{t:'Un contrôle subi au sol, sans solution.'},{t:'Une clé de cheville venue sans prévenir.'},{t:'La tête relevée trop tôt, le cou offert.'},{t:'Une amenée ratée, puis le sol subi.'}],
  decV:[{t:'Plus de volume, round après round.'},{t:'Un contrôle régulier, sans prise de risque.'},{t:'Une guerre, partout dans la cage, gagnée de peu.'},{t:'Le jab a fait la différence.'},{t:'Une fin de combat mieux gérée.'}],
  decD:[{t:'Un volume dépassé, surtout en fin de combat.'},{t:'Trop de temps passé contre le grillage.'},{t:'Un combat serré, perdu de peu.'},{t:'Trop d’attente, les juges ont suivi l’autre.'},{t:'Un adversaire plus frais dans les derniers rounds.'}],
  nul:[{t:'Un combat équilibré, sans vainqueur net.'},{t:'Chacun a pris deux rounds, les juges n’ont pas tranché.'},{t:'Deux styles qui se sont annulés.'}]};

/** Un adversaire d'un ancien combat : nom tiré des listes réelles d'un pays, sous un hachage stable. SEED sauvegardé puis restauré. */
function mgmtAncienAdversaire(f,k){
  const saved=SEED;
  try{
    const r=mgmtIdentiteStream(String(f.id),'ancien-adv|'+k);
    const pays=COUNTRY_KEYS[Math.floor(r()*COUNTRY_KEYS.length)];
    setSeed(duelFnv1a32('ancien-nom|'+String(f.id)+'|'+k));
    const d=typeof divById==='function'?divById(f.div):null;
    const nm=makeName(d&&d.gender==='F'?'F':'H',pays);
    return {first:nm.first,last:nm.last,pays};
  }finally{ setSeed(saved); }
}

/** Les combats d'avant la partie : un par case du bilan non jouée ici, du plus récent au plus ancien. Dérivé, jamais stocké.
 *  @returns {Array<{n:number,adv:string,issue:'v'|'d'|'n',famille:string,methode:string,round:number,rounds:number,age:number,tag:string,phrase:string}>} */
function mgmtAnciensCombats(m,f){
  if(!f) return [];
  const hist=m&&Array.isArray(m.hist)&&typeof mgmtFightHistory==='function'?mgmtFightHistory(m,f):[];
  let w=0,l=0,d=0;
  for(const t of hist){ const cote=t.a.id===f.id?'A':'B'; if(t.winner==='D') d++; else if(t.winner===cote) w++; else l++; }
  const W=Math.max(0,(f.W||0)-w), L=Math.max(0,(f.L||0)-l), D=Math.max(0,(f.D||0)-d), n=W+L+D;
  if(!n) return [];
  const r=mgmtIdentiteStream(String(f.id),'anciens-combats');
  const issues=[]; for(let i=0;i<W;i++) issues.push('v'); for(let i=0;i<L;i++) issues.push('d'); for(let i=0;i<D;i++) issues.push('n');
  for(let i=issues.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); const x=issues[i]; issues[i]=issues[j]; issues[j]=x; }
  const p=typeof mgmtCombatProfile==='function'?mgmtCombatProfile(f):null;
  const grap=p&&STYLES[p.style]?STYLES[p.style].grap:0.4;
  const T=MGMT_ANCIENS_TEXTES, out=[];
  for(let k=0;k<n;k++){
    const issue=issues[k], u=r(), a=r(), b=r(), c=r();
    let famille, cle, tag='';
    if(issue==='n'){ famille='draw'; cle='nul'; }
    else if(issue==='v'){
      const ko=0.3+0.15*(1-grap), sub=0.08+0.22*grap;
      famille=u<ko?'ko':(u<ko+sub?'sub':'dec'); cle=famille==='ko'?'koV':(famille==='sub'?'subV':'decV'); tag='FORCE';
    }else{
      /* Une défaite tombe plus souvent là où sa façon est la plus faible : un frappeur se fait prendre au sol, un lutteur se fait toucher. */
      const ko=0.25+0.15*grap, sub=0.06+0.2*(1-grap);
      famille=u<ko?'ko':(u<ko+sub?'sub':'dec'); cle=famille==='ko'?'koD':(famille==='sub'?'subD':'decD'); tag='FAILLE';
    }
    const rounds=3, round=famille==='dec'||famille==='draw'?0:1+Math.floor(a*rounds);
    const methode=famille==='ko'?'KO':(famille==='sub'?'Soumission':(famille==='draw'?'Nul':(b<0.6?'Décision unanime':(b<0.9?'Décision partagée':'Décision majoritaire'))));
    const adv=mgmtAncienAdversaire(f,k), liste=T[cle];
    out.push({n:k+1,adv:adv.first+' '+adv.last,issue,famille,methode,round,rounds,age:Math.max(17,Math.floor((f.age||25)-k*0.45)),tag,phrase:liste[Math.floor(c*liste.length)].t});
  }
  return out;
}

/** Ce qu'un combat joué sous les yeux du joueur dit de lui, lu sur les statistiques réelles du combat : une force, une faille ou rien. @returns {{tag:string,phrase:string}} */
function mgmtCombatLecon(m,f,t){
  const r=typeof mgmtObsResume==='function'?mgmtObsResume(t):null;
  if(!r) return {tag:'',phrase:''};
  const cote=t.a.id===f.id?'A':'B', moi=r[cote], lui=r[cote==='A'?'B':'A'];
  const gagne=t.winner===cote, nul=t.winner==='D';
  const cand=[];
  if(moi.sigAtt>=lui.sigAtt*1.3) cand.push(['FORCE','L’initiative debout, tout le combat.']);
  if(moi.tdAtt>=2&&moi.td>=1) cand.push(['FORCE','Le combat porté au sol.']);
  if(moi.groundCtrlSec>=45) cand.push(['FORCE','Un contrôle long au sol.']);
  if(moi.subAtt>=3) cand.push(['FORCE','Une soumission cherchée avec insistance.']);
  if(lui.td>=2) cand.push(['FAILLE','Plusieurs amenées subies.']);
  if(lui.sigAtt>=moi.sigAtt*1.3) cand.push(['FAILLE','Un échange debout subi.']);
  if(moi.wobbled>=2) cand.push(['FAILLE','Des coups reçus qui ont secoué, à plusieurs reprises.']);
  if(lui.subAtt>=3) cand.push(['FAILLE','Des soumissions subies, à plusieurs reprises.']);
  if(!cand.length) return {tag:gagne?'FORCE':(nul?'':'FAILLE'),phrase:gagne?'Un combat maîtrisé de bout en bout.':(nul?'':'Un combat perdu.')};
  const voulu=gagne?'FORCE':'FAILLE';
  const x=cand.find(c=>c[0]===voulu)||cand[0];
  return {tag:x[0],phrase:x[1]};
}

/** Ce que ses anciens combats disent de lui, en lignes de bilan : de quoi remplir les cases FORCE et FAILLE de l'onglet Style quand peu de combats ont été vus. */
function mgmtAnciensBilan(m,f){
  const l=mgmtAnciensCombats(m,f), v=l.filter(x=>x.issue==='v'), d=l.filter(x=>x.issue==='d');
  const lignes=[];
  if(v.length>=3){
    const ko=v.filter(x=>x.famille==='ko').length, sub=v.filter(x=>x.famille==='sub').length, dec=v.length-ko-sub;
    if(ko>=sub&&ko>=dec&&ko>0) lignes.push({s:'+',t:'Finit par KO',p:`${ko} de ses ${v.length} victoires avant la limite, par KO.`});
    else if(sub>=dec&&sub>0) lignes.push({s:'+',t:'Finit au sol',p:`${sub} de ses ${v.length} victoires par soumission.`});
    else if(dec>0) lignes.push({s:'+',t:'Gagne aux points',p:`${dec} de ses ${v.length} victoires à la décision.`});
  }
  if(d.length>=2){
    const ko=d.filter(x=>x.famille==='ko').length, sub=d.filter(x=>x.famille==='sub').length, dec=d.length-ko-sub;
    if(ko>=sub&&ko>=dec&&ko>0) lignes.push({s:'−',t:'Se fait toucher',p:`${ko} de ses ${d.length} défaites par KO.`});
    else if(sub>=dec&&sub>0) lignes.push({s:'−',t:'Se fait prendre au sol',p:`${sub} de ses ${d.length} défaites par soumission.`});
    else if(dec>0) lignes.push({s:'−',t:'Perd les combats serrés',p:`${dec} de ses ${d.length} défaites à la décision.`});
  }
  return lignes;
}

/* ---- S'améliorer à chaque combat ------------------------------------------------------------------------------ */

/** Points d'attribut gagnés par combat joué chez l'organisation, avant le facteur d'âge ; une victoire en rapporte un quart de plus. */
const MGMT_XP_PAR_COMBAT=0.5, MGMT_XP_VICTOIRE=0.25, MGMT_XP_PLAFOND=12;
/** Le facteur d'âge de l'expérience : plein jusqu'à 24 ans, nul après 35. */
function mgmtXpAge(age){ return age<=24?1:(age<=28?0.7:(age<=32?0.35:(age<=35?0.15:0))); }
/** L'expérience gagnée chez l'organisation AVANT un cycle : combats joués, victoires, points. Dérivée de m.hist, jamais stockée : rejouer un combat passé retrouve le même combattant. */
function mgmtExperience(m,f,cycle){
  const out={n:0,w:0,points:0};
  if(!m||!f||!Array.isArray(m.hist)) return out;
  const fin=Number.isFinite(cycle)?cycle:Infinity;
  for(const t of m.hist){
    if(!t||!t.a||!t.b||!(t.c<fin)) continue;
    const cote=t.a.id===f.id?'A':(t.b.id===f.id?'B':'');
    if(!cote) continue;
    out.n++; if(t.winner===cote) out.w++;
  }
  out.points=Math.min(MGMT_XP_PLAFOND,(out.n*MGMT_XP_PAR_COMBAT+out.w*MGMT_XP_VICTOIRE)*mgmtXpAge(f.age||30));
  return out;
}
/** Applique l'expérience au clone de combat : 70 % sur ce que son style travaille le plus, 15 % sur l'intelligence de combat, 15 % sur le cardio. */
function mgmtApplyExperience(c,f,xp){
  if(!c||!c.attrs||!xp||!(xp.points>=1)) return;
  const b=(STYLES[c.style]||{}).b||{};
  const cles=Object.keys(b).filter(k=>typeof c.attrs[k]==='number').sort((x,y)=>b[y]-b[x]||(x<y?-1:1)).slice(0,4);
  const part=(k,pts)=>{ if(typeof c.attrs[k]==='number'&&pts>0) c.attrs[k]=clamp(Math.round(c.attrs[k]+pts),1,100); };
  cles.forEach(k=>part(k,xp.points*0.7/Math.max(1,cles.length)));
  part('fightIQ',xp.points*0.15); part('cardio',xp.points*0.15);
  c.overall=overall(c);
}
/* ==== [FIN ANCRE] ==== */
