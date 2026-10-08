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
 *  l'organisation jouée cède sa place à Split quand ce n'est pas Split. Quatre noms, toujours. */
function mgmtExtOrgs(m){
  const nom=mgmtOrgNom(m);
  return MGMT_EXT_ORGS.map(o=>o===nom?MGMT_ORG:o);
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
  const eff=Math.max(40,Math.round(150*p.effectif));
  const age=Math.round(10*(27.9+p.age))/10;
  const bourse=p.bourses<=0.85?'modestes':(p.bourses>=1.2?'lourdes':'normales');
  return [
    {k:'Caisse de départ',v:mgmtEuros(p.caisse)},{k:'Effectif',v:'environ '+eff+' combattants'},{k:'Âge moyen',v:'environ '+String(age).replace('.',',')+' ans'},
    {k:'Popularité',v:p.popularite>=75?'très haute':(p.popularite>=55?'haute':(p.popularite>=35?'moyenne':'basse'))},
    {k:'Plus grande salle',v:salle+' places'},{k:'Bourses demandées',v:bourse},
  ];
}

/* ==== [FIN ANCRE] ==== */
