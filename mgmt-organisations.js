"use strict";
/* ==== [ANCRE: MGMT_BRIEF_LOT5_ORGANISATIONS] — Brief du 06/10/2026, lot 5 : le monde à
   huit organisations. L'organisation jouée devient une DONNÉE de la partie (m.org, un des
   huit noms) : toute lecture de « Split » passe par mgmtOrgNom. Le PROFIL de l'organisation
   (mgmt-organisations-data.js) règle la création du monde : caisse de départ, taille et âge de
   l'effectif, catégories fortes et faibles ; popularité, salles, bourses et entente des camps
   attendent les lots qui s'en servent. Les sept autres organisations restent un monde dérivé :
   quatre d'entre elles forment l'échelle des combattants extérieurs (mgmtExtOrgs), la place de
   l'organisation jouée y étant prise par Split quand ce n'est pas Split. ==== */

function mgmtOrgParNom(nom){ return MGMT_ORGANISATIONS.find(o=>o.nom===nom)||null; }
function mgmtOrgParId(id){ return MGMT_ORGANISATIONS.find(o=>o.id===id)||null; }
/** Un nom d'organisation est-il l'un des huit ? */
function mgmtOrgValide(nom){ return typeof nom==='string'&&!!mgmtOrgParNom(nom); }

/** L'organisation jouée : celle de la partie (m, sinon la partie en cours), à défaut Split. */
function mgmtOrgNom(m){
  const partie=m||((typeof G!=='undefined'&&G)?G.mgmt:null);
  return partie&&mgmtOrgValide(partie.org)?partie.org:MGMT_ORG;
}

/** Le profil de l'organisation jouée. */
function mgmtOrgProfil(m){
  const o=mgmtOrgParNom(mgmtOrgNom(m));
  return (o||MGMT_ORGANISATIONS[0]).profil;
}

/** L'échelle des organisations des combattants extérieurs, par prestige croissant : celle du code, où
 *  l’organisation jouée cède sa place à Split quand ce n’est pas Split. Quatre noms (ancien monde) ou sept (echelleExt 7). */
function mgmtExtOrgs(m){
  const partie=m||((typeof G!=='undefined'&&G)?G.mgmt:null);
  const nom=mgmtOrgNom(partie);
  const source=partie&&partie.echelleExt===7?MGMT_EXT_ORGS_HUIT:MGMT_EXT_ORGS;
  return source.map(o=>o===nom?MGMT_ORG:o);
}

/** Le poids d'une catégorie dans l'effectif de l'organisation : fortes ×1,5, faibles ×0,5. */
function mgmtOrgPoidsCategorie(profil,divId){
  if(profil.fortes.includes(divId)) return 1.5;
  if(profil.faibles.includes(divId)) return 0.5;
  return 1;
}

/** Le décalage de niveau d'un combattant selon que sa catégorie est forte (+3) ou faible (−3) chez l'organisation. */
function mgmtOrgDecalageNiveau(profil,divId){
  if(profil.fortes.includes(divId)) return 3;
  if(profil.faibles.includes(divId)) return -3;
  return 0;
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: MGMT_MONDE_LOT9_T3B_RENOM] — Monde lot 9 T3b ==== */
/** Renom d'un combattant : victoires et bonus de prestige des titres gagnés dans sa partie. */
function mgmtRenom(sous,f){
  if(!f) return 0;
  const titres=(sous&&Array.isArray(sous.facts)?sous.facts:[]).reduce((n,fait)=>{
    if(!fait||fait.k!=='title_fight'||!Number.isSafeInteger(fait.fight)) return n;
    const trace=sous.hist&&sous.hist[fait.fight];
    return trace&&trace.winner==='A'&&trace.a&&trace.a.id===f.id||trace&&trace.winner==='B'&&trace.b&&trace.b.id===f.id?n+1:n;
  },0);
  return (Number.isSafeInteger(f.W)?f.W:0)+2*titres;
}

/* ==== [ANCRE: MGMT_MONDE_LOT9_T3_NIVEAUX] — Monde lot 9 T3 ==== */
/** Niveaux dérivés de l'état courant ; aucune donnée n'est persistée. */
function mgmtOrgNiveaux(m,orgId){
  if(!m||!MGMT_ORGANISATIONS.some(o=>o.id===orgId)) return null;
  let partie=null;
  /* Superviseur, 15/10/2026 : m.org porte le NOM de l'organisation ; son identifiant vient de mgmtPredecesseurOrgId. */
  if(mgmtPredecesseurOrgId(m)===orgId) partie=m;
  else if(m.mondeVivant===true&&m.orgs&&m.orgs[orgId]) partie=m.orgs[orgId];
  if(!partie) return null;
  const roster=(partie.roster||[]).filter(f=>f&&!mgmtIsRetired(f));
  const pop=Number.isFinite(partie.pop)?partie.pop:(typeof mgmtOrgProfil==='function'&&partie===m?mgmtOrgProfil(m).popularite:0);
  const comptes=(partie.comptes||[]).slice(-12), salles=partie.salles||[];
  const remplies=new Set(comptes.filter(c=>Number.isFinite(c.taux)&&c.taux>=0.8).map(c=>c.salleId||c.salle));
  let salle=salles.filter(s=>remplies.has(s.id)||remplies.has(s.nom)).sort((a,b)=>b.capacite-a.capacite)[0];
  if(!salle) salle=salles.slice().sort((a,b)=>a.capacite-b.capacite)[0]||null;
  const renom=roster.map(f=>({f,renom:mgmtRenom(partie,f)})).sort((a,b)=>b.renom-a.renom||((b.f.W||0)+(b.f.L||0)+(b.f.D||0))-((a.f.W||0)+(a.f.L||0)+(a.f.D||0))||(String(a.f.id)<String(b.f.id)?-1:String(a.f.id)>String(b.f.id)?1:0)).slice(0,5);
  let puissance=0;
  /* Le classement mondial se lit dans la partie du joueur (il réunit toutes les organisations) ; le rang est la position dans la liste
     (les lignes ne portent pas de champ rang). Superviseur, 15/10/2026. */
  const chezMoi=new Set(roster.map(f=>f.id));
  for(const div of allDivisions()){
    (mgmtDivisionRanking(m,div.id,'world')||[]).slice(0,10).forEach((r,i)=>{
      const rang=i+1;
      if(partie===m?chezMoi.has(r.id):(()=>{ const f=mgmtExteriorCombattant(m,r.id); return !!f&&f.orgId===orgId; })()) puissance+=11-rang;
    });
  }
  return {popularite:pop,stade:salle?salle.capacite:0,notoriete:renom.reduce((s,x)=>s+x.renom,0),notoriete5:renom.map(x=>({id:x.f.id,nom:x.f.name,W:x.f.W,titres:(x.renom-(Number.isSafeInteger(x.f.W)?x.f.W:0))/2})),puissance};
}
/** Rangs décroissants, égalités départagées par l'ordre canonique des organisations. */
function mgmtOrgNiveauxRangs(m){
  const values=MGMT_ORGANISATIONS.map(o=>({id:o.id,n:mgmtOrgNiveaux(m,o.id)}));
  const out={};
  for(const k of ['popularite','stade','notoriete','puissance']){
    const rows=values.filter(x=>x.n).sort((a,b)=>b.n[k]-a.n[k]||MGMT_ORGANISATIONS.findIndex(o=>o.id===a.id)-MGMT_ORGANISATIONS.findIndex(o=>o.id===b.id));
    rows.forEach((x,i)=>{if(!out[x.id]) out[x.id]={};out[x.id][k]=i+1;});
    values.filter(x=>!x.n).forEach(x=>{if(!out[x.id])out[x.id]={};out[x.id][k]=null;});
  }
  return out;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: MGMT_MONDE_LOT9_T4_CLASSEMENT] — Monde lot 9 T4 ==== */
/** Classement global dérivé des quatre rangs de niveaux ; aucun état persistant. */
function mgmtOrgClassement(m){
  if(!m||m.mondeVivant!==true) return null;
  const rangs=mgmtOrgNiveauxRangs(m);
  const lignes=MGMT_ORGANISATIONS.map((o,index)=>{
    const niveaux=mgmtOrgNiveaux(m,o.id), r=rangs[o.id];
    if(!niveaux||!r) return null;
    const total=['popularite','stade','notoriete','puissance'].reduce((s,k)=>s+r[k],0);
    return {id:o.id,total,niveaux,rangs:r,index};
  }).filter(Boolean);
  lignes.sort((a,b)=>a.total-b.total||a.rangs.puissance-b.rangs.puissance||a.index-b.index);
  return lignes.map((x,i)=>({id:x.id,rang:i+1,total:x.total,niveaux:x.niveaux,rangs:x.rangs}));
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: MGMT_CORR0810_LOT12_ATOUTS] — Corrections du 08/10/2026, lot 12 (D6) : chaque ligne de l'écran Nouvelle partie correspond à un effet que le joueur constate.
   Les lignes ne sont plus écrites à la main : elles se DÉDUISENT du profil, réglage par réglage, et seuls les réglages que le jeu lit existent
   (MGMT_ORG_REGLAGES_LUS — un test échoue si un profil porte un réglage hors de cette liste, ou si une ligne n'a pas de règle). Plus de promesse sans effet.
   Les libellés sont des propositions (relu:false). ==== */
const MGMT_ORG_REGLAGES_LUS=['caisse','effectif','age','popularite','salles','bourses','fortes','faibles'];

/** Les règles : [réglage, côté, test sur le profil, libellé]. L'ordre fait la priorité d'affichage. */
const MGMT_ORG_ATOUTS_REGLES=[
  ['caisse','plus',p=>p.caisse>=100,'Beaucoup d’argent'],
  ['popularite','plus',p=>p.popularite>=75,'Très populaire'],
  ['salles','plus',p=>p.salles>=1.15,'De grandes salles'],
  ['caisse','plus',p=>p.caisse>=55&&p.caisse<100,'Une caisse confortable'],
  ['caisse','plus',p=>p.caisse>=45&&p.caisse<55,'Une caisse saine'],
  ['popularite','plus',p=>p.popularite>=55&&p.popularite<75,'Un public déjà acquis'],
  ['bourses','plus',p=>p.bourses<=0.85,'Des bourses modestes'],
  ['age','plus',p=>p.age<=-2,'De jeunes combattants'],
  ['fortes','plus',p=>p.fortes.length>0,p=>mgmtOrgLibelleCategories(p.fortes,true)],
  ['effectif','plus',p=>p.effectif>=1.15,'Un effectif fourni'],
  ['caisse','moins',p=>p.caisse<=35,'Une caisse modeste'],
  ['popularite','moins',p=>p.popularite<=25,'Un public à gagner'],
  ['popularite','moins',p=>p.popularite>25&&p.popularite<=45,'Encore peu connue'],
  ['salles','moins',p=>p.salles<=0.85,'De petites salles'],
  ['bourses','moins',p=>p.bourses>=1.2,'Des bourses lourdes'],
  ['age','moins',p=>p.age>=2,'Un effectif vieillissant'],
  ['effectif','moins',p=>p.effectif<=0.85,'Un effectif mince'],
  ['faibles','moins',p=>p.faibles.length>0,p=>mgmtOrgLibelleCategories(p.faibles,false)],
];

/** Une famille de catégories dit son nom : les combattantes, les poids lourds, sinon la liste. Pur. */
function mgmtOrgLibelleCategories(ids,fort){
  const d=ids.map(id=>divById(id)).filter(Boolean);
  const toutesF=d.length>0&&d.every(x=>x.gender==='F'), toutesH=d.length>0&&d.every(x=>x.gender==='H');
  const lourds=d.length>0&&d.every(x=>/heavy/.test(x.id));
  if(fort) return toutesF?'Les meilleures combattantes':(lourds?'Les meilleurs poids lourds':'Des catégories fortes : '+d.map(x=>x.name.toLowerCase()).join(', '));
  return toutesH?'Peu d’hommes classés':(toutesF?'Peu de combattantes classées':'Des catégories dégarnies');
}

/** Les atouts et les contreparties d'un profil, au plus deux de chaque côté, déduits des réglages. Pur.
 *  @returns {{plus:string[],moins:string[],regles:Array<{reglage:string,cote:string,texte:string}>}} */
function mgmtOrgAtouts(profil){
  const regles=[];
  for(const [reglage,cote,test,texte] of MGMT_ORG_ATOUTS_REGLES){
    if(test(profil)) regles.push({reglage,cote,texte:typeof texte==='function'?texte(profil):texte});
  }
  const prend=cote=>regles.filter(r=>r.cote===cote).slice(0,2);
  const p=prend('plus'), m=prend('moins');
  return {plus:p.map(r=>r.texte),moins:m.map(r=>r.texte),regles:p.concat(m)};
}

/** L'aperçu d'une organisation avant la partie, en chiffres que le jeu lit : caisse, effectif, âge, popularité, plus grande salle, bourses. Pur.
 *  @returns {Array<{k:string,v:string}>} */
function mgmtOrgApercu(o){
  const p=o.profil;
  const salle=Math.max(200,Math.round(MGMT_SALLES_CAPACITES[MGMT_SALLES_CAPACITES.length-1]*p.salles/50)*50);
  /* Brief démo, lot 4 (D4) : le chiffre vient de ce que la partie crée — environ 30 combattants par catégorie, pesés comme mgmtNewRoster. */
  const eff=Math.round(allDivisions().reduce((t,d)=>t+Math.max(4,Math.round(MGMT_EFFECTIF_PAR_CATEGORIE*mgmtOrgPoidsCategorie(p,d.id)*p.effectif)),0)/10)*10;
  const age=Math.round(10*(27.9+p.age))/10;
  const bourse=p.bourses<=0.85?'modestes':(p.bourses>=1.2?'lourdes':'normales');
  return [
    {k:'Caisse de départ',v:mgmtEuros(p.caisse)},{k:'Effectif',v:'environ '+eff+' combattants'},{k:'Âge moyen',v:'environ '+String(age).replace('.',',')+' ans'},
    {k:'Popularité',v:p.popularite>=75?'très haute':(p.popularite>=55?'haute':(p.popularite>=35?'moyenne':'basse'))},
    {k:'Plus grande salle',v:salle+' places'},{k:'Bourses demandées',v:bourse},
  ];
}

/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: MGMT_MONDE_LOT2_IDENTITES_FONCTIONS] — Monde lot 2 T1 : la fiche d'identité
   (MGMT_ORG_IDENTITES, mgmt-organisations-identites-data.js) devient accessible au jeu.
   Les valeurs null sont résolues ici, jamais écrites dans les données : villesSalles →
   MGMT_SALLES_VILLES (mgmt-salles.js), paysPoids → MGMT_PAYS_POIDS.split (mgmt-humanite-data.js).
   Ces deux données se chargent APRÈS ce fichier — la fonction les lit à l'exécution,
   jamais au chargement. ==== */

/** L'identité d'une organisation, valeurs null résolues (villesSalles → MGMT_SALLES_VILLES,
 *  paysPoids → MGMT_PAYS_POIDS.split). Pur.
 *  @param {string} id — id d'organisation (celui de MGMT_ORGANISATIONS)
 *  @returns {object|null} l'identité résolue, null si id inconnu */
function mgmtOrgIdentite(id){
  const it=MGMT_ORG_IDENTITES[id];
  if(!it) return null;
  return Object.assign({},it,{
    villesSalles:it.villesSalles||MGMT_SALLES_VILLES,
    paysPoids:it.paysPoids||MGMT_PAYS_POIDS.split,
  });
}

/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: MGMT_MONDE_LOT2_PAYS_FONCTIONS] — Monde lot 2 T2 : le mélange de pays de
   l'organisation jouée. mgmtPaysTire (mgmt-humanite-data.js) accepte depuis cette tranche un
   mélange de poids lui-même : les combattants de chaque organisation sont tirés avec le
   paysPoids de son identité, plus avec Split en dur. ==== */

/** Le mélange de pays de l'organisation jouée : paysPoids de son identité (null résolu en
 *  MGMT_PAYS_POIDS.split par mgmtOrgIdentite). Pur.
 *  @param {object} [m] — la partie (à défaut la partie en cours, comme mgmtOrgNom)
 *  @returns {Object<string,number>} les poids par clé de pays, somme 100 */
function mgmtOrgPaysPoids(m){
  const o=mgmtOrgParNom(mgmtOrgNom(m));
  return (o&&mgmtOrgIdentite(o.id).paysPoids)||MGMT_PAYS_POIDS.split;
}

/* ==== [FIN ANCRE] ==== */
