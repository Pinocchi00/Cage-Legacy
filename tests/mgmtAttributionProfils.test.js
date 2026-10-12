"use strict";
/* ==== [ANCRE: TEST_MGMT_ATTRIBUTION_PROFILS] — Monde lot 2 T4 : fige l'attribution des
   profils aux noms des huit organisations, telle que le tableau « Tes plus et contreparties »
   du brief « Un monde qui a vécu » (lot 2) la fixe, validée par Anthony le 09/10/2026.
   Porte : tests/mgmtOrganisations.test.js (newGameWindow, result). ==== */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
function result(win,code){ return JSON.parse(win.eval(`JSON.stringify((function(){${code}})())`)); }

/* Le tableau attendu, écrit en dur (apostrophes typographiques U+2019). */
const TABLEAU=[
  ['Split',['Une caisse saine'],['Encore peu connue']],
  ['Garden of Blood',['Très populaire','De grandes salles'],['Des bourses lourdes']],
  ['MMA Korner',['Des bourses modestes'],['Une caisse modeste','Un public à gagner']],
  ['Ultimate Rim',['De jeunes combattants'],['Encore peu connue','De petites salles']],
  ['Fighting Pacific Championship',['Une caisse confortable','Un public déjà acquis'],['Un effectif vieillissant']],
  ['Knuckle Gate',['Un public déjà acquis','Les meilleures combattantes'],['Une caisse modeste','Peu d’hommes classés']],
  ['Pure Impact',['Beaucoup d’argent','De grandes salles'],['Un public à gagner']],
  ['Undisputed Cage',['Une caisse saine','Un public déjà acquis'],['Des catégories dégarnies']],
];

test('Attribution — chaque organisation montre exactement les plus et les contreparties de sa ligne du tableau', () => {
  const win=newGameWindow();
  const rendu=result(win,`return MGMT_ORGANISATIONS.map(o=>{ const a=mgmtOrgAtouts(o.profil); return [o.nom,a.plus,a.moins]; });`);
  let lignes=0, ecarts=[];
  for(const [nom,att,contre] of TABLEAU){
    lignes++;
    const trouve=rendu.find(x=>x[0]===nom);
    if(!trouve) ecarts.push(nom+' : absent');
    else if(JSON.stringify(trouve[1])!==JSON.stringify(att)||JSON.stringify(trouve[2])!==JSON.stringify(contre))
      ecarts.push(nom+' : '+trouve[1].join(' ; ')+' / '+trouve[2].join(' ; '));
  }
  assert.equal(lignes,8,'8 lignes vérifiées'); assert.deepEqual(ecarts,[],'0 écart');
});

test('Attribution — les huit noms gardent leur identifiant, et une partie stocke le nom', () => {
  const win=newGameWindow();
  const r=result(win,`return {ids:MGMT_ORGANISATIONS.map(o=>o.id),noms:MGMT_ORGANISATIONS.map(o=>o.nom),
    defauts:MGMT_ORGANISATIONS.map(o=>[mgmtDefault(o.id).org,mgmtDefault(o.nom).org]),
    identites:Object.keys(MGMT_ORG_IDENTITES)};`);
  assert.deepEqual(r.ids,['split','garden-of-blood','mma-korner','ultimate-rim','fighting-pacific-championship','organisation-6','organisation-7','organisation-8']);
  assert.deepEqual(r.noms,['Split','Garden of Blood','MMA Korner','Ultimate Rim','Fighting Pacific Championship','Knuckle Gate','Pure Impact','Undisputed Cage']);
  for(let i=0;i<8;i++){ assert.equal(r.defauts[i][0],r.noms[i],'mgmtDefault('+r.ids[i]+') stocke le nom'); assert.equal(r.defauts[i][1],r.noms[i]); }
  assert.deepEqual(new Set(r.identites),new Set(r.ids),'MGMT_ORG_IDENTITES porte exactement ces huit ids');
});

test('Attribution — les catégories fortes et faibles de Knuckle Gate et d’Undisputed Cage sont celles du tableau', () => {
  const win=newGameWindow();
  const r=result(win,`const p=n=>MGMT_ORGANISATIONS.find(o=>o.nom===n).profil;
    const kn=p('Knuckle Gate'), uc=p('Undisputed Cage');
    return {knF:mgmtOrgLibelleCategories(kn.fortes,true),knB:mgmtOrgLibelleCategories(kn.faibles,false),
      ucF:mgmtOrgLibelleCategories(uc.fortes,true),ucB:mgmtOrgLibelleCategories(uc.faibles,false),
      vides:MGMT_ORGANISATIONS.filter(o=>o.nom!=='Knuckle Gate'&&o.nom!=='Undisputed Cage').every(o=>o.profil.fortes.length===0&&o.profil.faibles.length===0)};`);
  assert.equal(r.knF,'Les meilleures combattantes'); assert.equal(r.ucF,'Les meilleurs poids lourds');
  assert.equal(r.knB,'Peu d’hommes classés'); assert.equal(r.ucB,'Des catégories dégarnies');
  assert.ok(r.vides,'les six autres profils ont fortes et faibles vides');
});

test('Attribution — l’en-tête de mgmt-organisations-data.js ne déclare plus de trou de spécification', () => {
  const fs=require('node:fs');
  const texte=fs.readFileSync(require('node:path').join(__dirname,'..','mgmt-organisations-data.js'),'utf8');
  assert.ok(!texte.includes('trou de spécification'),'plus de « trou de spécification »');
  assert.ok(!texte.includes('n\'est écrite nulle part'),'plus de « n\'est écrite nulle part »');
  assert.ok(texte.includes('09/10/2026'),'la validation d’Anthony est citée');
});
