"use strict";
/* ==== [ANCRE: P4_T3A_ESPOIRS] — Monde lot 38 T1 ==== */
const MGMT_ESPOIRS_LIBELLES={angles:{reponse:'CELUI QUI RÉPOND AU MANQUE',monte:'CELUI QUI MONTE',jeune:'LA PLUS JEUNE',oublie:'CELUI QU’ON NE REGARDE PAS',revenant:'LE REVENANT',libre:'À RECRUTER'},phrases:{debut:'Combats documentés : {n}.',victoire:'{n} victoire{plural} de suite.',defaite:'Sa dernière défaite remonte à {n} combat{plural}.',absence:'En attente de son prochain combat.'}}; /* Proposition de Claude, relu:false. */
function mgmtEspoirsCandidats(m){
  const all=[...(m.roster||[]),...(m.mondeVivant?Object.values(m.orgs||{}).flatMap(o=>o.roster||[]):[]),...(m.exterieur||[]).map(e=>mgmtExteriorCombattant(m,e.id)).filter(Boolean)];
  // Décision d’Anthony du 28/10/2026 : les espoirs proposés ont 26 ans maximum.
  const champions=new Set(typeof mgmtChampionIds==='function'?mgmtChampionIds(m):[]), seen=new Set(); return all.filter(f=>f&&typeof f.id==='string'&&!seen.has(f.id)&&seen.add(f.id)&&Number.isFinite(f.age)&&f.age<=26&&!mgmtIsRetired(f)&&!champions.has(f.id)).sort((a,b)=>a.id.localeCompare(b.id));
}
/* ==== [ANCRE: ESPOIRS_RESUMES_FACTUELS_20261028] — Libellés factuels de lecture, relu:false ==== */
function mgmtEspoirHistoriques(m,f){
  const vus=new Set(),hist=[];
  for(const monde of [m,...Object.values(m.orgs||{})])for(const t of monde&&monde.hist||[]){
    if(!t||!t.a||!t.b||(t.a.id!==f.id&&t.b.id!==f.id)||!['A','B','D'].includes(t.winner))continue;
    const cle=mgmtStatsPaire(t);if(vus.has(cle))continue;vus.add(cle);hist.push(t);
  }
  hist.sort((a,b)=>a.c-b.c);
  return hist;
}
function mgmtEspoirSerieCourante(m,f,hist=mgmtEspoirHistoriques(m,f)){
  const serie=mgmtSerie({hist},f);if(serie)return serie;
  const n=f.trace&&f.trace.streak;
  return Number.isFinite(n)&&n!==0?{issue:n>0?'win':'loss',n:Math.abs(n)}:null;
}
function mgmtEspoirResume(m,f,angle,s,bilan,total,hist){
  const serie=mgmtEspoirSerieCourante(m,f,hist),w=Number(bilan.W)||0,l=Number(bilan.L)||0;
  if(angle==='monte'&&serie)return mgmtSerieTexte(serie)+'.';
  if(angle==='revenant'&&serie)return 'Son dernier combat s’est terminé par '+(serie.issue==='win'?'une victoire':serie.issue==='loss'?'une défaite':'un nul')+'.';
  if(angle==='jeune'&&Number.isFinite(f.age))return `${f.age} ans et ${w} victoire${w===1?'':'s'} au bilan.`;
  if(angle==='oublie')return s&&Number.isFinite(s.sigParMin)?s.sigParMin.toFixed(2).replace('.',',')+' coups significatifs par minute.':`${w} victoire${w===1?'':'s'} pour ${l} défaite${l===1?'':'s'}.`;
  if(angle==='libre')return `${w} victoire${w===1?'':'s'} en ${total} combat${total===1?'':'s'}.`;
  if(angle==='reponse')return `${total} combat${total===1?'':'s'} au bilan professionnel.`;
  if(angle==='revenant'&&Number.isFinite(f.age))return `${total} combat${total===1?'':'s'} à ${f.age} ans.`;
  return MGMT_ESPOIRS_LIBELLES.phrases.absence;
}
function mgmtEspoirChiffres(m,f,angle,s,hist=mgmtEspoirHistoriques(m,f)){
  const mesures=new Map(),ajouter=(id,libelle,valeur,positif,aide)=>mesures.set(id,{libelle,valeur,positif,aide});
  const aide=hist.length+' combat'+(hist.length===1?' connu':'s connus');
  const victoires=hist.filter(t=>t.winner===(t.a.id===f.id?'A':'B'));
  if(victoires.length){
    const fins=victoires.filter(t=>['ko','sub','stop'].includes(t.family));
    ajouter('finitions',Number.isFinite(f.W)&&victoires.length<f.W?'Finitions connues':'Finitions',fins.length+' SUR '+victoires.length,fins.length>0,aide+' : victoires avant la limite parmi les victoires connues.');
    const premier=fins.filter(t=>t.round===1).length;
    ajouter('r1','Au 1er round',String(premier),premier>0,aide+' : victoires avant la limite au premier round.');
  }
  if(s){
    const taux=(id,libelle,cle,unite)=>{if(Number.isFinite(s[cle]))ajouter(id,libelle,unite==='%'?Math.round(s[cle]*100)+' %':s[cle].toFixed(2).replace('.',','),s[cle]>0,s.docs+' combats documentés.');};
    taux('volume','Coups / min','sigParMin');taux('precision','Précision','precision','%');
    taux('amenees','Amenées / 15 min','ameneesPar15');taux('sub','Soumissions / 15 min','soumissionsPar15');
    taux('defense','Défense debout','defense','%');
  }
  const ordre={reponse:['finitions','r1','amenees','volume','precision','sub','defense'],monte:['amenees','precision','volume','finitions','r1','defense','sub'],jeune:['sub','amenees','finitions','r1','precision','volume','defense'],oublie:['volume','precision','finitions','r1','amenees','sub','defense'],revenant:['defense','r1','finitions','volume','precision','amenees','sub'],libre:['finitions','amenees','r1','volume','precision','sub','defense']}[angle]||[];
  const chiffres=ordre.map(id=>mesures.get(id)).filter(x=>x&&x.positif).slice(0,2);
  const ajouterSiPlace=x=>{if(chiffres.length<2&&!chiffres.some(y=>y.libelle===x.libelle))chiffres.push(x);};
  // Le catalogue extérieur connaît les issues de TOUS les combats : ces
  // nombres ne sont pas des victoires par KO ou soumission.
  const trace=f.trace,fin=trace&&trace.pro&&trace.pro.fin;
  if(fin&&Number.isFinite(trace.fights)&&trace.fights>0){
    const tout='Tous ses combats, victoires et défaites confondues.';
    if(Number.isFinite(fin.ko))ajouterSiPlace({libelle:'Combats finis par KO',valeur:fin.ko+' SUR '+trace.fights,aide:tout});
    if(Number.isFinite(fin.sub))ajouterSiPlace({libelle:'Par soumission',valeur:fin.sub+' SUR '+trace.fights,aide:tout});
  }
  for(const id of ordre){const x=mesures.get(id);if(x)ajouterSiPlace(x);}
  if(chiffres.length<2){
    let phys=null;const compteur=typeof _idCounter==='number'?_idCounter:null;
    try{phys=mgmtCombatProfile(f).phys;}catch(_){phys=null;}finally{if(compteur!==null)_idCounter=compteur;}
    if(phys&&Number.isFinite(phys.reach))ajouterSiPlace({libelle:'Allonge',valeur:Math.round(phys.reach)+' CM'});
    const rang=mgmtDivisionRank(m,f,'world');
    if(Number.isSafeInteger(rang)&&rang>0)ajouterSiPlace({libelle:'Rang mondial',valeur:rang+'e'});
    if(phys&&Number.isFinite(phys.height))ajouterSiPlace({libelle:'Taille',valeur:Math.round(phys.height)+' CM'});
  }
  ajouterSiPlace({libelle:'Statistiques',valeur:'Non observées'});
  ajouterSiPlace({libelle:'Rang mondial',valeur:'Non classé'});
  return chiffres.map(({libelle,valeur,aide:detail})=>({libelle,valeur,...(detail?{aide:detail}:{})}));
}
/* ==== [FIN ANCRE] ==== */
function mgmtEspoirsFabrique(m,ids){
  const fs=mgmtEspoirsCandidats(m), used=new Set(), angles=Object.keys(MGMT_ESPOIRS_LIBELLES.angles), out=[];
  const manque=mgmtOrgProfil(m).manque||{}, categorie=(manque.categories||[])[0];
  const profils=[f=>!categorie||f.div===categorie,f=>f.org===mgmtOrgNom(m),f=>f.org===mgmtOrgNom(m)&&Number(f.age)<25&&!!mgmtStatsDocumentes(m,f.id),f=>true,f=>f.org===mgmtOrgNom(m),f=>f.org!==mgmtOrgNom(m)];
  for(let i=0;i<angles.length;i++){
    let f=ids&&ids[i]?fs.find(x=>x.id===ids[i]):null;
    if(!f) f=fs.filter(x=>!used.has(x.id)&&profils[i](x)).sort((a,b)=>{
       const sa=mgmtStatsCarriere(m,a.id),sb=mgmtStatsCarriere(m,b.id);
       const score=x=>{const s=mgmtStatsCarriere(m,x.id);if(i===2)return -(x.age||99);if(i===3)return s?(s.sigParMin||0)*100+(s.precision||0)*100:0;if(i===4)return Math.max((m.cycle||0)-(x.lastFightCycle||0),s?0:0);if(i===1)return s?s.serieMax:0;return s?s.victoires:0;};
       const aCat=used.has(a.id)?1:0,bCat=used.has(b.id)?1:0;
       return aCat-bCat||score(b)-score(a)||a.id.localeCompare(b.id);
    })[0];
    if(!f) f=fs.filter(x=>!used.has(x.id)).sort((a,b)=>{
      const sa=mgmtStatsCarriere(m,a.id),sb=mgmtStatsCarriere(m,b.id);
      const score=x=>i===2?-(x.age||99):i===1?(x.lastFightCycle||0):i===4?(m.cycle||0)-(x.lastFightCycle||0):i===3?(mgmtStatsCarriere(m,x.id)?.sigParMin||0):mgmtStatsCarriere(m,x.id)?.victoires||0;
      return score(b)-score(a)||a.id.localeCompare(b.id);
    })[0];
   if(!f||used.has(f.id))continue; used.add(f.id);
   const s=mgmtStatsCarriere(m,f.id), trait=mgmtTraitsDe(m,f.id), doc=mgmtStatsDocumentes(m,f.id),
      exterior=mgmtExteriorCombattant(m,f.id), bilan=[f,exterior].find(x=>x&&Number.isFinite(x.W)&&Number.isFinite(x.L))||{},
      record=`${Number(bilan.W)||0}-${Number(bilan.L)||0}${Number(bilan.D)?'-'+Number(bilan.D):''}`;
    const lu=mgmtStatsTotal(m,f.id),total=Number.isFinite(lu)?lu:(Number(bilan.W)||0)+(Number(bilan.L)||0)+(Number(bilan.D)||0);
    const hist=mgmtEspoirHistoriques(m,f),chiffres=mgmtEspoirChiffres(m,f,angles[i],s,hist);
    const traitTexte=Array.isArray(trait)&&trait.length?String(trait[0]).toLocaleUpperCase('fr'):'';
    const phrase=mgmtEspoirResume(m,f,angles[i],s,bilan,total,hist);
    const ville=typeof mgmtIdentiteVille==='function'?mgmtIdentiteVille(f):f.city||f.ville||'';
    out.push({id:f.id,angle:angles[i],etiquette:MGMT_ESPOIRS_LIBELLES.angles[angles[i]],origine:f.org===mgmtOrgNom(m)?'effectif':(f.org?'monde':'libre'),raison:MGMT_ESPOIRS_LIBELLES.phrases.debut.replace('{n}',doc?doc.docs:0),fiche:{bilan:record,description:`${mgmtDivisionLabel(f.div)} · ${f.age||'—'} ans${ville?' · '+ville:''}`,chiffres:chiffres.slice(0,2),trait:traitTexte==='DEBUTANT'?'':traitTexte,traitNeutre:traitTexte==='DEBUTANT',phrase}});
 }
 return out;
}
function mgmtEspoirsProposer(m){return mgmtEspoirsFabrique(m,Array.isArray(m.espoirsPropose)?m.espoirsPropose:null);}
function mgmtEspoirsFixer(m){if(!Array.isArray(m.espoirsPropose))m.espoirsPropose=mgmtEspoirsFabrique(m).map(x=>x.id);return mgmtEspoirsProposer(m);}
function mgmtEstEspoir(m,id){return Array.isArray(m&&m.espoirs)&&m.espoirs.includes(id)&&mgmtSuivis(m).includes(id);}
function mgmtEspoirs(m){return (Array.isArray(m&&m.espoirs)?m.espoirs:[]).filter(id=>mgmtSuivis(m).includes(id));}
function mgmtEspoirGarder(m,id){
  if(!m||!Array.isArray(m.espoirsPropose))return false;
  const eligibles=new Set(mgmtEspoirsCandidats(m).map(f=>f.id));
  if(!eligibles.has(id)||(!m.espoirsPropose.includes(id)&&!mgmtEspoirsProposer(m).some(x=>x.id===id)))return false;
  if(!Array.isArray(m.espoirs))m.espoirs=[];if(m.espoirs.includes(id))return true;if(m.espoirs.length>=3)return false;
  if(!mgmtSuivis(m).includes(id)&&!mgmtSuivre(m,id))return false;
  // Une ancienne proposition trop âgée est remplacée à l’affichage : son
  // remplaçant doit aussi pouvoir être gardé et enregistré normalement.
  m.espoirsPropose=m.espoirsPropose.filter(x=>eligibles.has(x));
  if(!m.espoirsPropose.includes(id))m.espoirsPropose.push(id);
  m.espoirs.push(id);return true;
}
function mgmtEspoirRendre(m,id){if(!m||!Array.isArray(m.espoirs))return false;const n=m.espoirs.length;m.espoirs=m.espoirs.filter(x=>x!==id);return n!==m.espoirs.length;}
function mgmtEspoirRemplacer(m,idRendu){
  if(!m||!Array.isArray(m.espoirsPropose))return null;
  mgmtEspoirRendre(m,idRendu);
  const gardes=Array.isArray(m.espoirs)?m.espoirs:[];
  const candidats=mgmtEspoirsCandidats(m).filter(x=>!gardes.includes(x.id)&&!m.espoirsPropose.includes(x.id)).sort((a,b)=>{
    const sa=mgmtStatsCarriere(m,a.id),sb=mgmtStatsCarriere(m,b.id);
    return (sb?sb.victoires:0)-(sa?sa.victoires:0)||a.id.localeCompare(b.id);
  });
  if(!candidats.length)return null;
  const nouveaute=mgmtEspoirsFabrique(m,[candidats[0].id])[0];
  if(!nouveaute)return null;
  m.espoirsPropose.push(nouveaute.id);
  while(m.espoirsPropose.length>12){const i=m.espoirsPropose.findIndex(id=>!m.espoirs.includes(id));if(i<0)break;m.espoirsPropose.splice(i,1);}
  return nouveaute;
}
mgmtActuSourceAjouter({type:'espoir',lire(m,ids,depuis){const keep=mgmtEspoirs(m),out=[];for(const t of m.hist||[])if(t&&Number.isSafeInteger(t.c)&&t.c>=depuis&&t.a&&t.b)for(const id of keep)if(t.a.id===id||t.b.id===id)out.push({type:'espoir',c:t.c,id,donnees:t});return out;}});
