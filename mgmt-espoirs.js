"use strict";
/* ==== [ANCRE: P4_T3A_ESPOIRS] — Monde lot 38 T1 ==== */
const MGMT_ESPOIRS_LIBELLES={angles:{reponse:'CELUI QUI RÉPOND AU MANQUE',monte:'CELUI QUI MONTE',jeune:'LA PLUS JEUNE',oublie:'CELUI QU’ON NE REGARDE PAS',revenant:'LE REVENANT',libre:'À RECRUTER'},phrases:{debut:'Combats documentés : {n}.',victoire:'Série de {n} victoires.'}}; /* Proposition de Claude, relu:false. */
function mgmtEspoirsCandidats(m){
  const all=[...(m.roster||[]),...(m.mondeVivant?Object.values(m.orgs||{}).flatMap(o=>o.roster||[]):[]),...(m.exterieur||[]).map(e=>mgmtExteriorCombattant(m,e.id)).filter(Boolean)];
  const champions=new Set(typeof mgmtChampionIds==='function'?mgmtChampionIds(m):[]), seen=new Set(); return all.filter(f=>f&&typeof f.id==='string'&&!seen.has(f.id)&&seen.add(f.id)&&!mgmtIsRetired(f)&&!champions.has(f.id)).sort((a,b)=>a.id.localeCompare(b.id));
}
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
     record=doc&&doc.bilan?`${doc.bilan.W}-${doc.bilan.L}${doc.bilan.D?'-'+doc.bilan.D:''}`:`${f.W||0}-${f.L||0}`;
   out.push({id:f.id,angle:angles[i],etiquette:MGMT_ESPOIRS_LIBELLES.angles[angles[i]],origine:f.org===mgmtOrgNom(m)?'effectif':(f.org?'monde':'libre'),raison:MGMT_ESPOIRS_LIBELLES.phrases.debut.replace('{n}',doc?doc.docs:0),fiche:{bilan:record,description:`${f.div||''} · ${f.age||'—'} ans · ${f.city||f.ville||''}`,chiffres:[{libelle:'Coups par minute',valeur:s&&Number.isFinite(s.sigParMin)?s.sigParMin.toFixed(1):'—'},{libelle:'Précision',valeur:s&&Number.isFinite(s.precision)?Math.round(s.precision*100)+' %':'—'}],trait:Array.isArray(trait)&&trait.length?String(trait[0]).toLocaleUpperCase('fr'):'',phrase:MGMT_ESPOIRS_LIBELLES.phrases.victoire.replace('{n}',s?s.serieMax:0)}});
 }
 return out;
}
function mgmtEspoirsProposer(m){return mgmtEspoirsFabrique(m,Array.isArray(m.espoirsPropose)?m.espoirsPropose:null);}
function mgmtEspoirsFixer(m){if(!Array.isArray(m.espoirsPropose))m.espoirsPropose=mgmtEspoirsFabrique(m).map(x=>x.id);return mgmtEspoirsProposer(m);}
function mgmtEstEspoir(m,id){return Array.isArray(m&&m.espoirs)&&m.espoirs.includes(id)&&mgmtSuivis(m).includes(id);}
function mgmtEspoirs(m){return (Array.isArray(m&&m.espoirs)?m.espoirs:[]).filter(id=>mgmtSuivis(m).includes(id));}
function mgmtEspoirGarder(m,id){if(!m||!Array.isArray(m.espoirsPropose)||!m.espoirsPropose.includes(id))return false;if(!Array.isArray(m.espoirs))m.espoirs=[];if(m.espoirs.includes(id))return true;if(m.espoirs.length>=3)return false;if(!mgmtSuivis(m).includes(id)&&!mgmtSuivre(m,id))return false;m.espoirs.push(id);return true;}
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
