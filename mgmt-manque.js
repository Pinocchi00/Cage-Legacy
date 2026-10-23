"use strict";
/* ==== [ANCRE: P4_T2A_MANQUE] — Monde lot 38 T1 ==== */
const MGMT_MANQUE_LIBELLES={
  'bons-poids-lourds':{titre:'De bons poids lourds',leila:'On en trouvera un. Mais pas dans cet effectif.',objectif:'Un poids lourd de {org} dans le top 15 mondial'},
  espoirs:{titre:'Des espoirs',leila:'Il faut arrêter d’attendre. Tu dois en faire monter trois.',objectif:'Trois espoirs de moins de 25 ans dans les 10 premiers de leur catégorie'},
  'potentiel-champion':{titre:'Un potentiel champion',leila:'Tu as des noms. Aucun ne menace encore les champions.',objectif:'Un combattant de {org} parmi les cinq premiers mondiaux'},
  experimentes:{titre:'Des combattants expérimentés',leila:'Tu manques de combattants qui savent déjà ce que coûte une défaite.',objectif:'Trois combattants de 32 ans ou plus dans le top 15'},
  finisseurs:{titre:'Des finisseurs',leila:'Tu vas trop souvent aux juges. Il te faut des fins nettes.',objectif:'Cinq victoires par finition dans la saison'},
  soumissions:{titre:'Des soumissions',leila:'Tu ne menaces pas assez au sol. Ça se voit dans les résultats.',objectif:'Trois victoires par soumission dans la saison'},
  'a-domicile':{titre:'Des combattants à domicile',leila:'Tu signes loin de chez toi. Le public le remarque.',objectif:null},
  'bons-mouches':{titre:'De bons poids mouche',leila:'La catégorie est vide de noms solides. Il faut la remplir.',objectif:'Un poids mouche de {org} dans le top 15 mondial'}
};
const MGMT_MANQUE_MEMO=new WeakMap();
function mgmtManque(m){
  const profil=mgmtOrgProfil(m), man=profil&&profil.manque, def=MGMT_MANQUE_LIBELLES[man&&man.id];
  if(!def)return null;
  const hist=Array.isArray(m.hist)?m.hist:[], memo=MGMT_MANQUE_MEMO.get(m);
  if(memo&&memo.len===hist.length&&memo.org===m.org&&memo.id===man.id)return memo.value;
  const titre=def.titre,objectif=def.objectif?{texte:def.objectif.replace('{org}',mgmtOrgNom(m)),cible:({ 'bons-poids-lourds':{categories:['H-heavy'],nombre:1,top:15},'bons-mouches':{categories:['H-fly'],nombre:1,top:15},espoirs:{ageMax:24,nombre:3,top:10},'potentiel-champion':{nombre:1,top:5},experimentes:{ageMin:32,nombre:3,top:15},finisseurs:{finition:true,nombre:5},soumissions:{methode:'sub',nombre:3}})[man.id]}:null;
  const roster=(m.roster||[]).filter(f=>f&&!mgmtIsRetired(f));
  let lignes=[];
  if(man.categories&&man.categories.length){
    const div=man.categories[0], ranked=mgmtDivisionRanking(m,div,'world')||[], own=ranked.filter(r=>roster.some(f=>f.id===r.id));
    const meilleur=own[0], championIds=new Set(typeof mgmtChampionIds==='function'?mgmtChampionIds(m):[]);
    const top=own.filter(r=>ranked.indexOf(r)<15).length;
    lignes=[{libelle:'Le meilleur de la catégorie',valeur:meilleur?(championIds.has(meilleur.id)?'le champion':(ranked.indexOf(meilleur)+1)+'e MONDIAL'):'AUCUN',sous:null},{libelle:'Dans le top 15 mondial',valeur:top?top+' DU TOP 15':'AUCUN',sous:null}];
    const orgs=MGMT_ORGANISATIONS.map(o=>({nom:o.nom,n:(o.nom===mgmtOrgNom(m)?roster:((m.orgs&&m.orgs[o.id]&&m.orgs[o.id].roster)||mgmtExteriorEffectifs(m,div))).filter(f=>f&&f.div===div&&ranked.findIndex(r=>r.id===f.id)<15).length})).sort((a,b)=>b.n-a.n||a.nom.localeCompare(b.nom));
    if(orgs.length)lignes.push({libelle:'Chez '+orgs[0].nom,valeur:orgs[0].n+' DU TOP 15',sous:null});
  } else if(man.id==='espoirs'||man.id==='experimentes') {
    const age=man.id==='espoirs'?24:32, pick=f=>man.id==='espoirs'?f.age<age:f.age>=age, count=roster.filter(pick).length;
    lignes=[{libelle:man.id==='espoirs'?'Moins de 25 ans':'32 ans et plus',valeur:roster.length?Math.round(count*100/roster.length)+' %':'0 %',sous:null},{libelle:'Chez les autres organisations',valeur:'—',sous:null}];
    if(roster.length)lignes.push({libelle:man.id==='espoirs'?'Le plus jeune':'Le plus ancien',valeur:(man.id==='espoirs'?Math.min(...roster.map(f=>f.age)):Math.max(...roster.map(f=>f.age)))+' ans',sous:null});
  } else if(man.id==='a-domicile') lignes=[{libelle:'Le pays du siège n’est pas encore représenté',valeur:'',sous:null}];
  else {
    const fighters=roster.map(f=>({f,s:mgmtStatsCarriere(m,f.id)})).filter(x=>x.s);
    if(fighters.length){const val=man.id==='soumissions'?fighters.reduce((n,x)=>n+x.s.vParMethode.sub,0):fighters.reduce((n,x)=>n+x.s.vParMethode.ko+x.s.vParMethode.sub+x.s.vParMethode.stop,0), total=fighters.reduce((n,x)=>n+x.s.victoires,0);
      lignes=[{libelle:'Victoires par '+(man.id==='soumissions'?'soumission':'finition'),valeur:total?Math.round(100*val/total)+' %':'0 %',sous:null},{libelle:'Chez les autres organisations',valeur:'—',sous:null},{libelle:'Combattant le plus prolifique',valeur:fighters.sort((a,b)=>b.s.victoires-a.s.victoires||a.f.id.localeCompare(b.f.id))[0].f.name,sous:null}];}
  }
  const value={id:man.id,titre,lignes,objectif,leila:def.leila}; MGMT_MANQUE_MEMO.set(m,{len:hist.length,org:m.org,id:man.id,value}); return value;
}
