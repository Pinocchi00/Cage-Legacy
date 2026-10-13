"use strict";
/* ==== [ANCRE: MGMT_PRESENTATION_FAITS] — Monde lot 3 T1 ==== */
/** Contexte explicite : {m, h?}. h est l'index exclu de l'historique
 * (porte mgmtObsAvant). Par défaut, état courant avant le prochain combat.
 * Les sources sont des adresses publiques, jamais des copies de profils.
 * Rareté : occurrences / population de la catégorie ; les valeurs détaillées
 * restent distinctes du groupe qui sert à compter. Aucun quota d'ouverture (T2).
 */
const MGMT_FAITS_FAMILLES=['age','rang','mouvement','serie','methode','attente',
  'camp','role','bilan','ville','metier','moment','victoire_champion',
  'meme_age','revanche','contraste_style','meme_camp','rangs_voisins','adversaire_commun','titre'];
function mgmtFaitsTranche(age){
  return age<=22?'22-':age<=26?'23-26':age<=30?'27-30':age<=34?'31-34':'35+';
}
function mgmtFaitsCle(f){ return f.famille+'|'+JSON.stringify(f.groupe); }
function mgmtFaitsTrier(listes){
  const n=listes.length,compte=new Map();
  for(const liste of listes){
    for(const cle of new Set(liste.map(mgmtFaitsCle))) compte.set(cle,(compte.get(cle)||0)+1);
  }
  return listes.map(liste=>liste.map(f=>({...f,frequence:compte.get(mgmtFaitsCle(f)),population:n,
    rarete:compte.get(mgmtFaitsCle(f))/n})).sort((a,b)=>a.rarete-b.rarete
      ||MGMT_FAITS_FAMILLES.indexOf(a.famille)-MGMT_FAITS_FAMILLES.indexOf(b.famille)
      ||(a.id<b.id?-1:a.id>b.id?1:0)));
}
function mgmtFaitsBase(contexte,id){
  const m=contexte&&contexte.m;
  if(!m||!Array.isArray(m.roster)) return null;
  const f=m.roster.find(x=>x.id===id);
  if(!f||mgmtIsRetired(f)) return null;
  const h=Number.isSafeInteger(contexte.h)?Math.max(0,Math.min(contexte.h,(m.hist||[]).length)):(m.hist||[]).length;
  // Si la soirée est déjà calculée, la première trace exclue porte le bilan
  // public d'avant combat. Projection explicite : pas de spread d'un profil.
  const roster=m.roster.map(x=>{
    if(h===(m.hist||[]).length) return x;
    const t=(m.hist||[]).slice(h).find(t=>t.a.id===x.id||t.b.id===x.id);
    if(!t) return x;
    const side=t.a.id===x.id?t.a:t.b;
    return {id:x.id,name:x.name,first:x.first,last:x.last,ck:x.ck,div:x.div,
      age:side.age,W:side.W,L:side.L,D:side.D,ct:x.ct,
      lastCycle:side.lastCycle,retired:false};
  });
  const population=roster.filter(x=>x.div===f.div&&!mgmtIsRetired(x));
  const vue={...m,roster,hist:(m.hist||[]).slice(0,h),facts:(m.facts||[]).filter(x=>x.c<=m.cycle
    &&(x.k!=='title_fight'||x.fight<h))};
  const rang=mgmtDivisionRankingCalcule(vue,f.div,'organization');
  const precedent=mgmtDivisionRankingCalcule(vue,f.div,'organization',m.cycle-1);
  return {m:vue,population,h,rang,precedent};
}
function mgmtFaitsIndividuels(base,f){
  const {m,h,rang,precedent}=base,out=[];
  const fiche=champs=>({type:'fiche',id:f.id,champs});
  const trace=i=>({type:'hist',index:i});
  const add=(famille,groupe,valeur,sources)=>out.push({id:f.id+'|'+famille+'|'+JSON.stringify(valeur),
    famille,groupe,valeur,sujets:[f.id],sources});
  add('age',mgmtFaitsTranche(f.age),{age:f.age},[fiche(['age'])]);
  const pos=rang.findIndex(x=>x.id===f.id)+1,ancien=precedent.findIndex(x=>x.id===f.id)+1;
  const classement={type:'classement',div:f.div,scope:'organization',cycle:m.cycle};
  if(pos>0&&pos<=3) add('rang','top3',{rang:pos},[classement]);
  if(pos&&ancien&&Math.abs(ancien-pos)>=3) add('mouvement',ancien>pos?'hausse':'baisse',
    {places:ancien-pos},[classement,{...classement,cycle:m.cycle-1}]);
  const combats=mgmtObsAvant(m,f.id,h),suite=[];
  let issue=null;
  const victoires=[];
  let serieFinie=false;
  for(const i of combats){
    const t=m.hist[i],cote=t.a.id===f.id?'A':'B',resultat=t.winner===cote?'W':t.winner==='D'?'D':'L';
    if(issue===null) issue=resultat;
    if(resultat!==issue) serieFinie=true;
    if(!serieFinie) suite.push(i);
    if(resultat==='W') victoires.push(i);
  }
  if(suite.length>=3&&issue!=='D') add('serie',issue,{issue,n:suite.length},suite.map(trace));
  if(f.W>=4){
    const methodes=new Map();
    for(const i of victoires){ const k=m.hist[i].family; methodes.set(k,(methodes.get(k)||0)+1); }
    // Les victoires antérieures sans méthode connue ne deviennent pas des
    // victoires de cette méthode : le dénominateur est le bilan public entier.
    for(const [k,n] of methodes) if(n/f.W>=0.6)
      add('methode',k,{methode:k,victoires:n,total:f.W},[...victoires.map(trace),fiche(['W'])]);
  }
  const attente=mgmtContratAttente(m,f);
  if(attente>=6) add('attente','6+',{mois:attente},[fiche(['lastCycle','ct'])]);
  const camp=mgmtCamp(m,f,m.cycle,m);
  add('camp',[camp.ck,camp.ville,camp.k],{nom:camp.nom,ville:camp.ville},[fiche(['camp'])]);
  const titre=mgmtSplitTitle(m,f.div);
  if(titre.id===f.id) add('role','champion',{defenses:titre.defenses},
    m.facts.flatMap((x,i)=>x.div===f.div&&['title_initial','title_fight'].includes(x.k)?[{type:'facts',index:i}]:[]));
  add('bilan',[f.W,f.L,f.D||0],{W:f.W,L:f.L,D:f.D||0},[fiche(['W','L','D'])]);
  add('ville',mgmtIdentiteVille(f,m),{ville:mgmtIdentiteVille(f,m)},[fiche(['ville'])]);
  // La porte métier accepte le même sel explicite que les autres identités.
  const metier=mgmtIdentiteMetier(f,m);
  add('metier',metier,{metier},[fiche(['metier'])]);
  for(const x of mgmtVieRelayes(m,f)){
    if(x.c>m.cycle) continue;
    const index=m.facts.findIndex(y=>y.k==='moment_vie'&&y.a===f.id&&y.c===x.c&&y.m===x.moment.id);
    if(index>=0) add('moment',x.moment.id,{moment:x.moment.id,cycle:x.c},[{type:'facts',index}]);
  }
  for(const [fact,row] of mgmtTitleMemoryRows(m)){
    if(row.winnerId===f.id&&row.championId&&row.championId!==f.id)
      add('victoire_champion','champion',{adversaire:row.championId,cycle:fact.c},
        [{type:'facts',index:m.facts.indexOf(fact)},trace(fact.fight)]);
  }
  // Les index de facts restent ceux de la partie source, malgré le filtre temporel.
  return out;
}
function mgmtFaitsSourcesOriginales(contexte,base,liste){
  return liste.map(f=>({...f,sources:f.sources.map(s=>s.type==='facts'
    ?{...s,index:contexte.m.facts.indexOf(base.m.facts[s.index])}:s)}));
}
function mgmtFaitsCombattant(contexte,id){
  const base=mgmtFaitsBase(contexte,id);
  if(!base) return [];
  const listes=base.population.map(f=>mgmtFaitsSourcesOriginales(contexte,base,mgmtFaitsIndividuels(base,f)));
  return mgmtFaitsTrier(listes)[base.population.findIndex(f=>f.id===id)];
}
/* ==== [ANCRE: MGMT_PRESENTATION_FAITS_PAIRE] — Monde lot 3 T1 ==== */
function mgmtFaitsPaire(base,a,b){
  const {m,h,rang}=base,out=[],sujets=[a.id,b.id].sort();
  const fiche=(f,champs)=>({type:'fiche',id:f.id,champs});
  const add=(famille,groupe,valeur,sources)=>out.push({id:sujets.join('|')+'|'+famille+'|'+JSON.stringify(groupe),
    famille,groupe,valeur,sujets,sources});
  const age=mgmtFaitsTranche(a.age);
  if(age===mgmtFaitsTranche(b.age)) add('meme_age',age,{tranche:age},[fiche(a,['age']),fiche(b,['age'])]);
  const ca=mgmtObsAvant(m,a.id,h),cb=mgmtObsAvant(m,b.id,h),face=ca.filter(i=>cb.includes(i));
  if(face.length) add('revanche',face.length>=2?'trilogie':'revanche',{combats:face.length},face.map(index=>({type:'hist',index})));
  const styles=[mgmtIdentiteStyle(a,m),mgmtIdentiteStyle(b,m)];
  if(styles[0]!==styles[1]) add('contraste_style',styles.slice().sort(),{styles},[fiche(a,['style']),fiche(b,['style'])]);
  const camps=[a,b].map(f=>mgmtCamp(m,f,m.cycle,m));
  if(camps[0].ck===camps[1].ck&&camps[0].ville===camps[1].ville&&camps[0].k===camps[1].k)
    add('meme_camp',[camps[0].ck,camps[0].ville,camps[0].k],{nom:camps[0].nom},[fiche(a,['camp']),fiche(b,['camp'])]);
  const positions=[a,b].map(f=>rang.findIndex(x=>x.id===f.id)+1);
  if(positions.every(x=>x>0)&&Math.abs(positions[0]-positions[1])===1)
    add('rangs_voisins','voisins',{rangs:positions},[{type:'classement',div:a.div,scope:'organization',cycle:m.cycle}]);
  const adversaire=(i,id)=>m.hist[i].a.id===id?m.hist[i].b.id:m.hist[i].a.id;
  for(const id of new Set(ca.map(i=>adversaire(i,a.id)))){
    const ia=ca.filter(i=>adversaire(i,a.id)===id),ib=cb.filter(i=>adversaire(i,b.id)===id);
    if(ib.length) add('adversaire_commun',id,{adversaire:id},ia.concat(ib).map(index=>({type:'hist',index})));
  }
  const titre=mgmtSplitTitle(m,a.div);
  if(sujets.includes(titre.id)) add('titre','champion',{champion:titre.id},
    m.facts.flatMap((x,i)=>x.div===a.div&&['title_initial','title_fight'].includes(x.k)?[{type:'facts',index:i}]:[]));
  return out;
}
/** Faits propres à la paire ; T2 peut compléter avec les listes individuelles. */
function mgmtFaitsCombat(contexte,aid,bid){
  const base=mgmtFaitsBase(contexte,aid);
  if(!base||aid===bid||!base.population.some(f=>f.id===bid)) return [];
  const listes=[]; let cible=-1;
  for(let i=0;i<base.population.length;i++) for(let j=i+1;j<base.population.length;j++){
    const a=base.population[i],b=base.population[j];
    if([a.id,b.id].includes(aid)&&[a.id,b.id].includes(bid)) cible=listes.length;
    listes.push(mgmtFaitsSourcesOriginales(contexte,base,mgmtFaitsPaire(base,a,b)));
  }
  return mgmtFaitsTrier(listes)[cible]||[];
}
