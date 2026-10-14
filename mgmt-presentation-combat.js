"use strict";
/* ==== [ANCRE: MGMT_PRESENTATION_COMBAT] — Monde lot 3 T3 ==== */
/** Canonicalise la population avant les portes T1, sans copier de profil. */
function mgmtPresentationPaire(contexte,aid,bid){
  const m=contexte&&contexte.m;
  if(!m||!Array.isArray(m.roster)||aid===bid) return null;
  const ids=[aid,bid].sort(),c={m:{...m,roster:m.roster.slice().sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0)},h:contexte.h};
  const base=mgmtFaitsBase(c,ids[0]);
  if(!base||!base.population.some(f=>f.id===ids[1])) return null;
  return {c,base,ids,sujets:ids.map(id=>base.population.find(f=>f.id===id))};
}
/** Trois règles publiques distinctes ; aucune observation rejouée. */
function mgmtPronosticsCombat(contexte,aid,bid){
  const paire=mgmtPresentationPaire(contexte,aid,bid);
  if(!paire) return [];
  const {base,ids,sujets}=paire,{m,h}=base;
  const bilans=sujets.map(f=>({id:f.id,W:f.W,L:f.L,D:f.D||0}));
  const taux=bilans.map(f=>f.W+f.L+f.D?(f.W+0.5*f.D)/(f.W+f.L+f.D):0.5);
  const pA=Math.round(50+30*(taux[0]-taux[1]));
  const rangs=sujets.map(f=>{const i=base.rang.findIndex(x=>x.id===f.id);return i<0?base.population.length+1:i+1;});
  const series=ids.map(id=>mgmtObsAvant(m,id,h).slice(0,3).map(index=>{
    const t=m.hist[index],cote=t.a.id===id?'A':'B';
    return {index,resultat:t.winner==='D'?'D':t.winner===cote?'W':'L'};
  }));
  const scores=series.map(xs=>xs.reduce((s,x)=>s+(x.resultat==='W'?1:x.resultat==='L'?-1:0),0));
  const classement={type:'classement',div:sujets[0].div,scope:'organization',cycle:m.cycle,h,mode:'vivant'};
  const choix=[pA<50?1:0,rangs[1]<rangs[0]?1:0,scores[1]>scores[0]?1:0];
  const preuves=[bilans.map((valeurs,i)=>({critere:'bilan',valeurs,
    sources:[mgmtFaitsSourceFiche(base,sujets[i],['W','L','D'])]})),
  ids.map((id,i)=>({critere:'rang',valeurs:{id,rang:rangs[i]},sources:[{...classement}]})),
  ids.map((id,i)=>({critere:'serie',valeurs:{id,resultats:series[i],score:scores[i]},
    sources:series[i].map(x=>({type:'hist',index:x.index}))}))];
  return ['cage-hebdo','tableau-noir','le-forum'].map((voix,i)=>{
    const modele=MGMT_PRESENTATION_COMBAT_TEXTES[voix],vainqueur=ids[choix[i]],pourcentage=i===0?Math.max(pA,100-pA):null;
    return {voix,nom:mgmtMediaDe(voix).nom,vainqueur,pourcentage,
      texte:mgmtPresentationTexte(modele,{vainqueur:sujets[choix[i]].name,pourcentage}),modele:modele.id,preuves:preuves[i]};
  });
}
/** Présentation brute, sourcée, à la frontière explicite T1. */
function mgmtPresentationCombat(contexte,aid,bid){
  const paire=mgmtPresentationPaire(contexte,aid,bid);
  if(!paire) return null;
  const {c,base,ids,sujets}=paire,{h}=base,m=contexte.m;
  const tous=mgmtFaitsCombat(c,...ids),retenus=[];
  for(const fait of tous){
    if(!retenus.some(f=>f.famille===fait.famille)) retenus.push(fait);
    if(retenus.length===3) break;
  }
  const faits=retenus.map(fait=>{
    const modele=MGMT_PRESENTATION_COMBAT_TEXTES[fait.famille],valeurs={...fait.valeur};
    for(const k of ['styles','rangs']) if(Array.isArray(valeurs[k])) valeurs[k]=valeurs[k].slice().sort((a,b)=>a<b?-1:a>b?1:0).join(' et ');
    for(const k of ['adversaire','champion']) if(k in valeurs){
      const id=valeurs[k],f=base.population.find(f=>f.id===id)||m.roster.find(f=>f.id===id);
      const s=fait.sources.find(s=>s.type==='hist'&&!s.projection),t=s&&m.hist[s.index];
      valeurs[k]=f?f.name:t?(t.a.id===id?t.a.name:t.b.name):'';
    }
    return {fait,texte:mgmtPresentationTexte(modele,valeurs),modele:modele.id};
  });
  const listes=ids.map(id=>mgmtFaitsCombattant(c,id));
  const cotes=ids.map((id,i)=>{
    const liste=listes[i],choisis=[liste.find(f=>f.famille==='bilan')];
    for(const f of liste){
      if(choisis.length===3) break;
      if(!choisis.some(x=>x.famille===f.famille)) choisis.push(f);
    }
    return {id,faits:choisis.map(f=>mgmtPresentationPhrase(m,f))};
  });
  const indices=[...new Set(tous.filter(f=>['revanche','adversaire_commun'].includes(f.famille))
    .flatMap(f=>f.sources.filter(s=>s.type==='hist'&&!s.projection&&s.index<h).map(s=>s.index)))].sort((a,b)=>b-a).slice(0,3);
  const histoires=ids.map((id,i)=>mgmtPresentationHistoire(m,id,h,listes[i]));
  const histoire=indices.map(index=>{
    const t=m.hist[index];
    const recits=ids.filter(id=>t.a.id===id||t.b.id===id).map(id=>{
      let recit=histoires[ids.indexOf(id)].find(x=>x.index===index);
      if(!recit){
        const cote=t.a.id===id?'A':'B',adv=cote==='A'?t.b:t.a,issue=t.winner==='D'?'D':t.winner===cote?'W':'L';
        recit={texte:mgmtPresentationTexte(MGMT_PRESENTATION_COMBATTANT_TEXTES[issue],{
          adversaire:adv.name,methode:MGMT_FAMILY_LABELS[t.family]||t.family||'',round:Number.isSafeInteger(t.round)?mgmtRoundOrdinal(t.round):''})};
      }
      return {id,texte:recit.texte};
    });
    return {index,ids:[t.a.id,t.b.id],recits,sources:[{type:'hist',index}]};
  });
  return {ids,div:sujets[0].div,h,faits,cotes,histoire,pronostics:mgmtPronosticsCombat(c,...ids)};
}
/** L'adaptateur ne divulgue ni la trace ni l'issue calculée. */
function mgmtPresentationCombatSoiree(m,i){
  if(!Number.isSafeInteger(i)||i<0) return null;
  const p=mgmtSoireeProgramme(m)[i];
  if(!p||p.h<0) return null;
  const presentation=mgmtPresentationCombat({m,h:p.h},p.a.id,p.b.id);
  return presentation?{i,etiquette:p.etiquette,rounds:p.rounds,titre:p.titre,presentation}:null;
}
