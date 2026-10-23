"use strict";
/* ==== [ANCRE: MONDE34T1B_MESURE] — Monde lot 34 T1b ==== */
const fs=require('node:fs');
const path=require('node:path');
const {newGameWindow}=require('../tests/helpers/loadGame');
const MOY=values=>values.reduce((a,b)=>a+b,0)/values.length;

function mesureManques(seed,opts){
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(${Number(seed)}); mgmtPasseGenerer('split',{soirees:6}); mgmtMondeVivantGenerer(G.mgmt,{soirees:6});`);
    const organisations=JSON.parse(w.eval(`JSON.stringify(MGMT_ORGANISATIONS.map(o=>{
      const m=o.id==='split'?G.mgmt:G.mgmt.orgs[o.id];
      const roster=m.roster.filter(f=>!mgmtIsRetired(f));
      const n=roster.length,pays=mgmtOrgPaysDomicile(m);
      const profils=roster.map(f=>mgmtCombatProfile(f));
      const hist=m.hist.filter(h=>h.winner==='A'||h.winner==='B');
      const tops=allDivisions().map(d=>Math.max(...roster.filter(f=>f.div===d.id).map(f=>f.niv)));
      return {seed:${Number(seed)},id:o.id,nom:o.nom,manque:o.profil.manque?.id,force:o.profil.force?.id,n,pays,
        jeunes:roster.filter(f=>f.age<25).length/n,anciens:roster.filter(f=>f.age>=32).length/n,
        niveau:tops.reduce((a,b)=>a+b,0)/tops.length,
        finisseurs:profils.reduce((a,p)=>a+(p.attrs.killer+p.attrs.power)/2,0)/n,
        soumissions:profils.reduce((a,p)=>a+p.attrs.submission,0)/n,
        domicile:pays?roster.filter(f=>f.ck===pays).length/n:0,
        finitionsPasse:hist.filter(h=>['ko','sub','stop'].includes(h.family)).length/hist.length,
        soumissionsPasse:hist.filter(h=>h.family==='sub').length/hist.length,
        categories:allDivisions().map(d=>({id:d.id,n:roster.filter(f=>f.div===d.id).length,champion:(mgmtSplitTitle(m,d.id)||{}).id||null}))};
    }))`));
    return opts&&opts.snapshot?{organisations,monde:w.eval('JSON.stringify(G.mgmt)')}:organisations;
  }finally{w.close();}
}

function verdicts(orgs){
  const defs={espoirs:['jeunes'],experimentes:['anciens'], 'potentiel-champion':['niveau'],finisseurs:['finisseurs','finitionsPasse'],soumissions:['soumissions','soumissionsPasse'],'a-domicile':['domicile']};
  const rows=[];
  for(const org of orgs){
    for(const indicateur of defs[org.manque]||[]){
      const valeur=org[indicateur],autres=MOY(orgs.filter(o=>o.id!==org.id).map(o=>o[indicateur]));
      /* ==== [ANCRE: MONDE34T1B_CIBLES_REPRISE] — Monde lot 34 T1b ==== */
      // Décision Anthony : a-domicile sans effet et exempté ; finitionsPasse bruité sur six soirées, cible 0,80.
      const mesurable=org.manque!=='a-domicile';
      const cible=indicateur==='finitionsPasse'?0.8:0.7;
      rows.push({seed:org.seed,manque:org.manque,indicateur,valeur,autres,rapport:autres?valeur/autres:null,mesurable,
        ok:mesurable&&(indicateur==='niveau'?valeur<=autres-3:valeur<=cible*autres)});
    }
    if(org.force==='jeunes-partout'){
      const autres=MOY(orgs.filter(o=>o.id!==org.id).map(o=>o.jeunes));
      rows.push({seed:org.seed,manque:'jeunes-partout',indicateur:'jeunes',valeur:org.jeunes,autres,rapport:org.jeunes/autres,mesurable:true,ok:org.jeunes>=1.2*autres});
    }
  }
  return rows;
}

function rapport(resultats){
  const rows=resultats.flatMap(r=>r.verdicts);
  return '# Mesures des manques — Monde lot 34 T1b\n\n'+
    'Passé : six soirées par organisation, puis monde vivant ; moyenne arithmétique des sept autres organisations. Les taux du passé portent sur les victoires réellement jouées (hist).\n\n'+
    'Décisions Anthony du 23/10/2026 : cible 0,80 × pour finitionsPasse (six soirées, indicateur bruité) ; 0,70 × pour les autres manques, écart de niveau −3 et force jeunes-partout ≥ 1,2 ×. a-domicile est sans aucun effet et son indicateur est exempté. Rim : âges initiaux 20–27 ans, réduction des cohortes historiques pour respecter le budget de sauvegarde.\n\n'+
    '| Graine | Manque / force | Indicateur | Organisation | Sept autres | Rapport | Verdict |\n| --- | --- | --- | ---: | ---: | ---: | --- |\n'+
    rows.map(r=>`| ${r.seed} | ${r.manque} | ${r.indicateur} | ${r.valeur.toFixed(4)} | ${r.autres.toFixed(4)} | ${r.rapport===null?'—':r.rapport.toFixed(3)} | ${!r.mesurable?'EXEMPTÉ / NON MESURABLE : sans effet':r.ok?'OK':'HORS CIBLE'} |`).join('\n')+
    '\n\nPure Impact : siège aux Émirats arabes unis, absents du catalogue de pays ; le taux domestique est déjà nul. Décision : aucun biais de pays ni de recrutement pour a-domicile dans cette tranche, aucun effet différentiel revendiqué.\n';
}

if(require.main===module){
  const arg=process.argv.slice(2).find(a=>!a.startsWith('--'));
  const graines=(arg||'20261008,777,4242').split(',').map(Number);
  if(graines.some(s=>!Number.isSafeInteger(s))) throw new Error('Graines entières requises');
  const resultats=graines.map(seed=>{const organisations=mesureManques(seed);return {seed,organisations,verdicts:verdicts(organisations)};});
  const texte=rapport(resultats);
  fs.writeFileSync(path.join(__dirname,'reports','MANQUES-MESURES.md'),texte);
  console.log(process.argv.includes('--json')?JSON.stringify(resultats):texte);
}
module.exports={mesureManques,verdicts,rapport};
