"use strict";
/* ==== [ANCRE: P10_T1_ORGS_AGISSENT] — Monde lot 45 T1 ==== */
/** Fait agir les sept organisations rivales à la clôture de la semaine du joueur.
 *  Appelée une fois par cycle, après mgmtMondeVivantSemaine.
 *  Chaque organisation, selon sa manière ('acheteur' | 'formateur' | 'prudent'),
 *  vise un agent libre, approche un combattant en fin de contrat, pose sa soirée.
 *  Les actions sont enregistrées dans m.guerre.ev (voir mgmt-rivalite-orgs.js).
 *  Ne retire jamais un combattant sous contrat du roster du joueur.
 *  Tirages déterministes via mgmtIdentiteStream. */
function mgmtOrgsAgir(m){
  if(!m||m.mondeVivant!==true||!m.orgs) return;
  if(!m.guerre) m.guerre={ev:[],rival:null,depuis:0};
  if(!Array.isArray(m.guerre.ev)) m.guerre.ev=[];
  const splitId=mgmtPredecesseurOrgId(m);
  if(!splitId) return;
  /* Pour chaque organisation rivale */
  for(const orgId of mgmtMondeVivantIds(m)){
    if(orgId===splitId) continue;
    const sous=m.orgs[orgId];
    if(!sous||!sous.roster) continue;
    const matchmaker=MGMT_MATCHMAKERS[orgId];
    if(!matchmaker) continue;
    const maniere=matchmaker.maniere;
    const graine=mgmtIdentiteStream(orgId,'guerre|'+m.cycle,m);
    /* 1. Vise un agent libre (combattant sans contrat sur le marché) */
    if(mgmtOrgsAgir_ViserAgentLibre(m,orgId,sous,maniere,graine)){
      /* événement enregistré dans la fonction */
    }
    /* 2. Approche un combattant en fin de contrat (chez le joueur ou ailleurs) */
    if(mgmtOrgsAgir_ApprocherFinContrat(m,orgId,sous,maniere,graine)){
      /* événement enregistré dans la fonction */
    }
    /* 3. Pose sa soirée un week-end donné (collision possible) */
    mgmtOrgsAgir_PoserSoiree(m,orgId,sous,maniere,graine);
  }
  /* Fondre chaque événement ancien dans un compteur borné par organisation. */
  if(m.guerre.ev.length>40){
    if(!m.guerre.fondu||typeof m.guerre.fondu!=='object'||Array.isArray(m.guerre.fondu)) m.guerre.fondu={};
    const anciens=m.guerre.ev.splice(0,m.guerre.ev.length-40);
    for(const ev of anciens){
      if(!ev||!MGMT_MATCHMAKERS[ev.o]) continue;
      const compte=m.guerre.fondu[ev.o]||{n:0,p:0};
      compte.n=Math.min(Number.MAX_SAFE_INTEGER,compte.n+1);
      compte.p=Math.min(Number.MAX_SAFE_INTEGER,compte.p+(Number.isFinite(ev.p)?ev.p:0));
      m.guerre.fondu[ev.o]=compte;
    }
  }
}

/** Vise un agent libre : un combattant sans contrat disponible sur le marché.
 *  L'acheteur tente plus souvent, le prudent moins. */
function mgmtOrgsAgir_ViserAgentLibre(m,orgId,sous,maniere,graine){
  /* Récupère directement les lignes libres du monde : le classement mondial
     complet serait un recalcul coûteux pour une action qui ne signe personne. */
  const agentsLibres=[];
  for(const f of mgmtExteriorEffectifs(m)){
    if(!f||f.orgId===mgmtPredecesseurOrgId(m)||f.libre!==true||mgmtIsRetired(f)) continue;
    agentsLibres.push({f,div:f.div,rang:mgmtStar(f)||0});
  }
  if(!agentsLibres.length) return false;
  /* Probabilité selon la manière */
  const proba={acheteur:0.6,formateur:0.35,prudent:0.15}[maniere]||0.2;
  if(graine()>=proba) return false;
  /* Choisit un agent libre (profil prêt = plus attractif pour l'acheteur). */
  agentsLibres.sort((a,b)=>b.rang-a.rang);
  const idx=Math.floor(graine()*Math.min(3,agentsLibres.length));
  const cible=agentsLibres[idx];
  if(!cible) return false;
  /* Enregistre l'événement : l'organisation a visé cet agent libre */
  mgmtGuerreAjouterEv(m,{
    c:m.cycle,o:orgId,t:'agent',x:cible.f.id,p:maniere==='acheteur'?8:5
  });
  return true;
}

/** Approche un combattant en fin de contrat.
 *  Ne touche JAMAIS un combattant sous contrat valide du joueur.
 *  Peut approcher un combattant libre (fin de contrat) du joueur ou d'une autre org. */
function mgmtOrgsAgir_ApprocherFinContrat(m,orgId,sous,maniere,graine){
  const cibles=[];
  /* 1. Combattants du joueur en fin de contrat (libre === true) */
  if(Array.isArray(m.roster)){
    for(const f of m.roster){
      if(f.libre===true&&!mgmtIsRetired(f)){
        cibles.push({f,org:'player',div:f.div,loyal:mgmtIdentiteStream(f.id,'loyaute',m)()});
      }
    }
  }
  /* 2. Combattants des autres organisations en fin de contrat */
  for(const otherId of mgmtMondeVivantIds(m)){
    if(otherId===orgId||otherId===mgmtPredecesseurOrgId(m)) continue;
    const autre=m.orgs[otherId];
    if(!autre||!Array.isArray(autre.roster)) continue;
    for(const f of autre.roster){
      if(f.libre===true&&!mgmtIsRetired(f)){
        cibles.push({f,org:otherId,div:f.div,loyal:mgmtIdentiteStream(f.id,'loyaute',m)()});
      }
    }
  }
  if(!cibles.length) return false;
  /* Probabilité selon la manière */
  const proba={acheteur:0.5,formateur:0.25,prudent:0.1}[maniere]||0.2;
  if(graine()>=proba) return false;
  /* L'acheteur vise les prêts (renom élevé), le formateur les jeunes (âge bas) */
  cibles.sort((a,b)=>{
    if(maniere==='acheteur') return (mgmtStar(b.f)||0)-(mgmtStar(a.f)||0);
    if(maniere==='formateur') return (a.f.age||30)-(b.f.age||30);
    return 0;
  });
  const idx=Math.floor(graine()*Math.min(3,cibles.length));
  const cible=cibles[idx];
  if(!cible) return false;
  /* Type d'événement : 'pris' si c'était un agent libre du joueur, 'parti' si c'était sous contrat ailleurs */
  const type=cible.org==='player'?'pris':'parti';
  const points={acheteur:10,formateur:6,prudent:4}[maniere]||5;
  mgmtGuerreAjouterEv(m,{
    c:m.cycle,o:orgId,t:type,x:cible.f.id,p:points
  });
  return true;
}

/** Pose une soirée : l'organisation programme un événement à une date.
 *  Peut créer une collision avec la soirée du joueur ('meme-soir'). */
function mgmtOrgsAgir_PoserSoiree(m,orgId,sous,maniere,graine){
  if(!m.cal||!Array.isArray(m.cal.prochaines)) return;
  const playerSoiree=m.cal.prochaines[0];
  if(!playerSoiree||!Number.isFinite(playerSoiree.jour)) return;
  /* L'organisation a-t-elle déjà une soirée proche ? */
  const cal=sous.cal;
  if(!cal||!Array.isArray(cal.prochaines)||!cal.prochaines.length) return;
  const orgSoiree=cal.prochaines[0];
  if(!orgSoiree||!Number.isFinite(orgSoiree.jour)) return;
  /* Vérifie collision : même jour (même week-end) */
  const diffJours=Math.abs(orgSoiree.jour-playerSoiree.jour);
  if(diffJours<=3){ /* même semaine = collision */
    mgmtGuerreAjouterEv(m,{
      c:m.cycle,o:orgId,t:'meme-soir',x:null,p:maniere==='acheteur'?7:5
    });
  }
}

/** Ajoute un événement de guerre, en gérant le plafond de 40. */
function mgmtGuerreAjouterEv(m,ev){
  if(!m.guerre) m.guerre={ev:[],rival:null,depuis:0};
  if(!Array.isArray(m.guerre.ev)) m.guerre.ev=[];
  m.guerre.ev.push(ev);
  /* Plafonnement géré dans mgmtOrgsAgir */
}

/** Récupère l'identifiant de l'organisation du joueur (Split ou autre). */
function mgmtPredecesseurOrgId(m){
  if(!m) return null;
  return MGMT_ORGANISATIONS.find(o=>o.nom===m.org)?.id||'split';
}
/* ==== [FIN ANCRE] ==== */
