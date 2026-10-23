"use strict";
/* ==== [ANCRE: P10_T1_RIVALITE_ORGS] — Monde lot 45 T1 ==== */
/** Calcule la rivale du moment à partir des événements de m.guerre.ev.
 *  m.guerre = {ev:[{c,o,t,x,p}], rival:idOrg|null, depuis:soirée}
 *  Types d'événements : 'pris'|'agent'|'meme-soir'|'parti'|'voisin'|'pique'
 *  Pondération décroissante sur les dernières soirées, seuil minimal,
 *  hystérésis pour éviter le changement à chaque soirée. */

/** Seuil minimal de points pour qu'une rivale existe. */
const MGMT_RIVALE_SEUIL=15;
/** Nombre de soirées sur lesquelles la pondération s'applique. */
const MGMT_RIVALE_FENETRE=8;
/** Facteur d'hystérésis : la rivale change seulement si l'écart > ce ratio. */
const MGMT_RIVALE_HYSTERESIS=1.3;
/** Poids de base par type d'événement. */
const MGMT_RIVALE_POIDS={
  pris:10,        /* combattant pris au joueur */
  agent:5,        /* agent libre disputé */
  'meme-soir':6,  /* soirée même week-end */
  parti:8,        /* combattant parti chez elle */
  voisin:4,       /* voisinage au classement */
  pique:3,        /* pique dans la presse */
};

/** Calcule les points de rivalité par organisation sur la fenêtre récente. */
function mgmtRivaleScores(m){
  if(!m||!m.guerre||!Array.isArray(m.guerre.ev)) return {};
  const splitId=mgmtPredecesseurOrgId(m);
  if(!splitId) return {};
  const scores={};
  const cycleActuel=Number.isSafeInteger(m.cycle)?m.cycle:0;
  for(const ev of m.guerre.ev){
    if(!ev||!ev.o||ev.o===splitId) continue;
    if(!MGMT_ORGANISATIONS.some(o=>o.id===ev.o)) continue;
    const age=cycleActuel-(Number.isSafeInteger(ev.c)?ev.c:cycleActuel);
    if(age<0||age>=MGMT_RIVALE_FENETRE) continue;
    /* Pondération décroissante : 1.0 pour cycle actuel, 0.125 pour cycle -7 */
    const poids=1-age/MGMT_RIVALE_FENETRE;
    const base=MGMT_RIVALE_POIDS[ev.t]||0;
    const valeur=Number.isFinite(ev.p)&&ev.p>0?ev.p:base;
    const pts=valeur*poids;
    scores[ev.o]=(scores[ev.o]||0)+pts;
  }
  return scores;
}

/** Rend l'organisation rivale du moment, ou null si aucune n'atteint le seuil.
 *  Hystérésis : la rivale actuelle ne change que si une autre dépasse son score * 1.3. */
function mgmtRivaleDuMoment(m){
  if(!m||!m.guerre) return null;
  const scores=mgmtRivaleScores(m);
  let meilleure=null, maxScore=0;
  for(const [orgId,score] of Object.entries(scores)){
    if(score>maxScore){ maxScore=score; meilleure=orgId; }
  }
  if(maxScore<MGMT_RIVALE_SEUIL) return null;
  const rivaleActuelle=m.guerre.rival;
  if(rivaleActuelle&&scores[rivaleActuelle]){
    /* Hystérésis : la rivale actuelle garde son titre sauf écart net */
    if(scores[rivaleActuelle]*MGMT_RIVALE_HYSTERESIS>=maxScore) return rivaleActuelle;
  }
  return meilleure;
}

/** Rend les trois raisons les plus lourdes pour une organisation donnée.
 *  @returns {Array<{raison:string,soiree:number,type:string}>} */
function mgmtRivaleRaisons(m,idOrg){
  if(!m||!m.guerre||!Array.isArray(m.guerre.ev)||!idOrg) return [];
  const evs=m.guerre.ev.filter(ev=>ev&&ev.o===idOrg);
  if(!evs.length) return [];
  /* Grouper par type, garder le plus récent et le plus lourd de chaque */
  const parType={};
  for(const ev of evs){
    if(!ev.t||!MGMT_RIVALE_POIDS[ev.t]) continue;
    const base=MGMT_RIVALE_POIDS[ev.t];
    const age=(Number.isSafeInteger(m.cycle)?m.cycle:0)-(Number.isSafeInteger(ev.c)?ev.c:0);
    const poids=1-Math.min(age,MGMT_RIVALE_FENETRE-1)/MGMT_RIVALE_FENETRE;
    const score=base*poids;
    if(!parType[ev.t]||score>parType[ev.t].score){
      parType[ev.t]={ev,score,base};
    }
  }
  /* Trier par score décroissant, prendre top 3 */
  const raisons=Object.values(parType)
    .sort((a,b)=>b.score-a.score)
    .slice(0,3)
    .map(x=>{
      const ev=x.ev;
      const template=MGMT_RIVALITE_RAISONS_PHRASES[ev.t]?.[0]||'';
      const combattant=ev.x?mgmtExteriorCombattant(m,ev.x)?.name||'un combattant':'un agent libre';
      const nomSecurise=typeof esc==='function'?esc(combattant):String(combattant);
      let raison=template
        .replace('{combattant}',nomSecurise)
        .replace('{ville}',ev.x?nomSecurise:'une ville')
        .replace('{matchmaker}',MGMT_MATCHMAKERS[ev.o]?.nom||'son matchmaker');
      return {raison,soiree:ev.c,type:ev.t};
    });
  return raisons;
}

/** Met à jour la rivale du moment et génère une actualité si elle change. */
function mgmtRivaleMettreAJour(m){
  if(!m||!m.guerre) return;
  const nouvelle=mgmtRivaleDuMoment(m);
  const ancienne=m.guerre.rival;
  if(nouvelle!==ancienne){
    m.guerre.rival=nouvelle;
    m.guerre.depuis=Number.isSafeInteger(m.cycle)?m.cycle:0;
    if(nouvelle){
      /* Génère une actualité : "{Organisation} devient ta rivale du moment" */
      const org=MGMT_ORGANISATIONS.find(o=>o.id===nouvelle);
      if(org && typeof mgmtActuSourceAjouter==='function'){
        /* L'actualité sera générée via le registre de sources existant */
        mgmtAddFact(m,{c:m.cycle,k:'rivale_nouvelle',a:nouvelle});
      }
    }
  }
}

/** Vérifie si une organisation est la rivale du moment. */
function mgmtEstRivaleDuMoment(m,idOrg){
  return mgmtRivaleDuMoment(m)===idOrg;
}

/** Récupère l'identifiant de l'organisation du joueur. */
function mgmtPredecesseurOrgId(m){
  if(!m) return null;
  return MGMT_ORGANISATIONS.find(o=>o.nom===m.org)?.id||'split';
}
/* ==== [FIN ANCRE] ==== */
