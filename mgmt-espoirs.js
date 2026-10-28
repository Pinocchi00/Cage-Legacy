"use strict";
/* ==== [ANCRE: P4_T3A_ESPOIRS] — Monde lot 38 T1 ==== */
const MGMT_ESPOIRS_LIBELLES={angles:{reponse:'CELUI QUI RÉPOND AU MANQUE',monte:'CELUI QUI MONTE',jeune:'LA PLUS JEUNE',oublie:'CELUI QU’ON NE REGARDE PAS',revenant:'LE REVENANT',libre:'À RECRUTER'},phrases:{debut:'Combats documentés : {n}.',victoire:'{n} victoire{plural} de suite.',defaite:'Sa dernière défaite remonte à {n} combat{plural}.',absence:'En attente de son prochain combat.'}}; /* Proposition de Claude, relu:false. */
function mgmtEspoirsCandidats(m){
  const all=[...(m.roster||[]),...(m.mondeVivant?Object.values(m.orgs||{}).flatMap(o=>o.roster||[]):[]),...(m.exterieur||[]).map(e=>mgmtExteriorCombattant(m,e.id)).filter(Boolean)];
  const champions=new Set(typeof mgmtChampionIds==='function'?mgmtChampionIds(m):[]), seen=new Set(); return all.filter(f=>f&&typeof f.id==='string'&&!seen.has(f.id)&&seen.add(f.id)&&!mgmtIsRetired(f)&&!champions.has(f.id)).sort((a,b)=>a.id.localeCompare(b.id));
}
/* ==== [ANCRE: ESPOIRS_RESUMES_FACTUELS_20261028] — Libellés factuels de lecture, relu:false ==== */
function mgmtEspoirSerieCourante(m,f){
  const vus=new Set(),hist=[];
  for(const monde of [m,...Object.values(m.orgs||{})])for(const t of monde&&monde.hist||[]){
    if(!t||!t.a||!t.b||(t.a.id!==f.id&&t.b.id!==f.id)||!['A','B','D'].includes(t.winner))continue;
    const cle=mgmtStatsPaire(t);if(vus.has(cle))continue;vus.add(cle);hist.push(t);
  }
  hist.sort((a,b)=>a.c-b.c);
  const serie=mgmtSerie({hist},f);if(serie)return serie;
  const n=f.trace&&f.trace.streak;
  return Number.isFinite(n)&&n!==0?{issue:n>0?'win':'loss',n:Math.abs(n)}:null;
}
function mgmtEspoirResume(m,f,angle,s,bilan,total){
  const serie=mgmtEspoirSerieCourante(m,f),w=Number(bilan.W)||0,l=Number(bilan.L)||0;
  if(angle==='monte'&&serie)return mgmtSerieTexte(serie)+'.';
  if(angle==='revenant'&&serie)return 'Son dernier combat s’est terminé par '+(serie.issue==='win'?'une victoire':serie.issue==='loss'?'une défaite':'un nul')+'.';
  if(angle==='jeune'&&Number.isFinite(f.age))return `${f.age} ans et ${w} victoire${w===1?'':'s'} au bilan.`;
  if(angle==='oublie')return s&&Number.isFinite(s.sigParMin)?s.sigParMin.toFixed(2).replace('.',',')+' coups significatifs par minute.':`${w} victoire${w===1?'':'s'} pour ${l} défaite${l===1?'':'s'}.`;
  if(angle==='libre')return `${w} victoire${w===1?'':'s'} en ${total} combat${total===1?'':'s'}.`;
  if(angle==='reponse')return `${total} combat${total===1?'':'s'} au bilan professionnel.`;
  if(angle==='revenant'&&Number.isFinite(f.age))return `${total} combat${total===1?'':'s'} à ${f.age} ans.`;
  return MGMT_ESPOIRS_LIBELLES.phrases.absence;
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
      record=`${Number(bilan.W)||0}-${Number(bilan.L)||0}${Number(bilan.D)?'-'+Number(bilan.D):''}`,
      chiffres=[];
    const lu=mgmtStatsTotal(m,f.id),total=Number.isFinite(lu)?lu:(Number(bilan.W)||0)+(Number(bilan.L)||0)+(Number(bilan.D)||0);
    if(s&&Number.isFinite(s.sigParMin))chiffres.push({libelle:'Coups / min',valeur:s.sigParMin.toFixed(2).replace('.',',')});
    if(s&&Number.isFinite(s.precision))chiffres.push({libelle:'Précision',valeur:Math.round(s.precision*100)+' %'});
    if(s&&s.vParMethode){const v=s.vParMethode,n=(v.ko||0)+(v.sub||0)+(v.stop||0),gagne=n+(v.dec||0);if(gagne>0)chiffres.push({libelle:'Finitions',valeur:`${n} SUR ${gagne}`});}
    for(const x of [{libelle:'Combats',valeur:String(total)},{libelle:'Victoires',valeur:String(Number(bilan.W)||0)}])if(chiffres.length<2)chiffres.push(x);
    const traitTexte=Array.isArray(trait)&&trait.length?String(trait[0]).toLocaleUpperCase('fr'):'';
    const phrase=mgmtEspoirResume(m,f,angles[i],s,bilan,total);
    const ville=typeof mgmtIdentiteVille==='function'?mgmtIdentiteVille(f):f.city||f.ville||'';
    out.push({id:f.id,angle:angles[i],etiquette:MGMT_ESPOIRS_LIBELLES.angles[angles[i]],origine:f.org===mgmtOrgNom(m)?'effectif':(f.org?'monde':'libre'),raison:MGMT_ESPOIRS_LIBELLES.phrases.debut.replace('{n}',doc?doc.docs:0),fiche:{bilan:record,description:`${mgmtDivisionLabel(f.div)} · ${f.age||'—'} ans${ville?' · '+ville:''}`,chiffres:chiffres.slice(0,2),trait:traitTexte==='DEBUTANT'?'':traitTexte,traitNeutre:traitTexte==='DEBUTANT',phrase}});
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
