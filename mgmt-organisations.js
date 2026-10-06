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
