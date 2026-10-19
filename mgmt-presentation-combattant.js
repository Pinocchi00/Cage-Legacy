"use strict";
/* ==== [ANCRE: MGMT_PRESENTATION_COMBATTANT] — Monde lot 3 T2 ==== */
/** Substitution en texte brut ; aucune lecture de profil ni de l'état global. */
function mgmtPresentationTexte(modele,valeurs){
  return modele.texte.replace(/\{([^}]+)\}/g,(_,cle)=>String(valeurs[cle]??''))
    .replace(/\s+/g,' ').replace(/\s+([.,;])/g,'$1').replace(/[,;]\s*\./g,'.').trim();
}
function mgmtPresentationPhrase(m,fait){
  const modele=MGMT_PRESENTATION_COMBATTANT_TEXTES[fait.famille],valeurs={...fait.valeur};
  if(fait.famille==='bilan'){
    /* Audit 16/10 C11 : « 1 défaite », jamais « 1 défaites ». */
    const accord=(n,un,plu)=>Math.abs(Number(n))>=2?plu:un;
    valeurs.Wmot=accord(valeurs.W,'victoire','victoires'); valeurs.Lmot=accord(valeurs.L,'défaite','défaites'); valeurs.Dmot=accord(valeurs.D,'nul','nuls');
  }
  if(Object.hasOwn(valeurs,'issue')) valeurs.issue=valeurs.issue==='W'?'victoires':'défaites';
  if(Object.hasOwn(valeurs,'methode')) valeurs.methode=MGMT_FAMILY_LABELS[valeurs.methode]||valeurs.methode;
  if(Object.hasOwn(valeurs,'moment')) valeurs.moment=mgmtVieMomentById(valeurs.moment).libelle;
  if(Object.hasOwn(valeurs,'adversaire')){
    const source=fait.sources.find(s=>s.type==='hist'&&!s.projection),t=m.hist[source.index];
    valeurs.adversaire=(t.a.id===valeurs.adversaire?t.a:t.b).name;
  }
  return {fait,texte:mgmtPresentationTexte(modele,valeurs),modele:modele.id};
}
function mgmtPresentationHistoire(m,id,h,faits){
  const prioritaires=faits.filter(f=>f.famille==='victoire_champion').flatMap(f=>f.sources
    .filter(s=>s.type==='hist'&&!s.projection&&s.index<h).map(s=>s.index));
  return [...new Set([...prioritaires,...mgmtObsAvant(m,id,h)])].slice(0,3).map(index=>{
    const t=m.hist[index],cote=t.a.id===id?'A':'B',adv=cote==='A'?t.b:t.a;
    const issue=t.winner==='D'?'D':t.winner===cote?'W':'L';
    const valeurs={adversaire:adv.name,methode:MGMT_FAMILY_LABELS[t.family]||t.family||'',
      round:Number.isSafeInteger(t.round)?mgmtRoundOrdinal(t.round):''};
    return {index,adversaire:adv.id,texte:mgmtPresentationTexte(MGMT_PRESENTATION_COMBATTANT_TEXTES[issue],valeurs),
      sources:[{type:'hist',index}]};
  });
}
/** Présentations de la population active projetée, triées par id. */
function mgmtPresentationsCategorie(contexte,divId){
  const m=contexte&&contexte.m;
  if(!m||!Array.isArray(m.roster)) return [];
  const premier=m.roster.find(f=>f.div===divId);
  if(!premier) return [];
  // Une personne retraitée aujourd'hui peut appartenir à la projection passée.
  const base=mgmtFaitsBase(contexte,premier.id)||m.roster.filter(f=>f.div===divId)
    .map(f=>mgmtFaitsBase(contexte,f.id)).find(Boolean);
  if(!base) return [];
  const ids=base.population.map(f=>f.id).sort(),listes=new Map(ids.map(id=>[id,mgmtFaitsCombattant(contexte,id)]));
  const affectations=new Map(),occupants=new Map();
  const chercher=(id,visites)=>{
    for(const fait of listes.get(id)){
      const famille=fait.famille;
      if(visites.has(famille)) continue;
      visites.add(famille);
      const places=occupants.get(famille)||[];
      if(places.length<6){
        occupants.set(famille,[...places,id].sort());affectations.set(id,famille);return true;
      }
      for(const autre of places.slice().sort()){
        if(chercher(autre,visites)){
          occupants.set(famille,places.filter(x=>x!==autre).concat(id).sort());
          affectations.set(id,famille);return true;
        }
      }
    }
    return false;
  };
  for(const id of ids) chercher(id,new Set());
  return ids.map(id=>{
    const liste=listes.get(id),ouverture=affectations.get(id)||null,retenus=[];
    if(ouverture){
      retenus.push(liste.find(f=>f.famille===ouverture));
      const bilan=liste.find(f=>f.famille==='bilan');
      if(bilan&&ouverture!=='bilan') retenus.push(bilan);
      for(const fait of liste){
        if(retenus.length===3) break;
        if(!retenus.some(f=>f.famille===fait.famille)) retenus.push(fait);
      }
    }
    return {id,div:divId,h:base.h,ouverture,faits:retenus.map(f=>mgmtPresentationPhrase(m,f)),
      histoire:mgmtPresentationHistoire(m,id,base.h,liste)};
  });
}
/** L'appel individuel reprend exactement l'attribution collective. */
function mgmtPresentationCombattant(contexte,id){
  const base=mgmtFaitsBase(contexte,id);
  if(!base) return null;
  const f=base.population.find(f=>f.id===id);
  return mgmtPresentationsCategorie(contexte,f.div).find(p=>p.id===id)||null;
}
