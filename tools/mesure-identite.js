"use strict";
/* Lot 5 H3 : 3 000 neufs par pays disponible (décision Anthony H3),
   distribution effective pays + villes-écoles + décalages. Vrais profils,
   puis 3 000 identités dans des cohortes de 150 par catégorie. Aucun DOM.
   Usage : node tools/mesure-identite.js [--output=tools/reports/lot-5-h3-mesure.json] */
const fs=require('node:fs');
const path=require('node:path');
const {newGameWindow}=require('../tests/helpers/loadGame');
const w=newGameWindow();
try{
  const report=JSON.parse(w.eval(`JSON.stringify((function(){
    const n=3000,pays=[],seed=SEED;
    for(const ck of COUNTRY_KEYS){
      const villes=MGMT_VILLES[ck],poidsVille=v=>MGMT_VILLES_ECOLES.includes(v)?2:1;
      const totalVille=villes.reduce((a,v)=>a+poidsVille(v),0);
      const attendu=Object.fromEntries(STYLE_KEYS.map(k=>[k,0]));
      // Calcul indépendant de mgmtIdentiteStylePoids : détecte aussi une
      // normalisation erronée de la logique, pas seulement les tirages.
      for(const ville of villes){
        const dec=MGMT_STYLE_VILLE[ville]?.styles||{};
        const poids=STYLE_KEYS.map(k=>MGMT_STYLE_PAYS[ck][k]+(dec[k]||0));
        const somme=poids.reduce((a,b)=>a+b,0);
        STYLE_KEYS.forEach((k,i)=>attendu[k]+=100*poids[i]/somme*poidsVille(ville)/totalVille);
      }
      const comptes=Object.fromEntries(STYLE_KEYS.map(k=>[k,0])),villesObservees={};
      for(let i=1;i<=n;i++){
        const id='mesure-'+ck+'-'+i,nm=mgmtExteriorName(mgmtExteriorSeedFor(id),divById('H-light'),ck);
        const f={id,ck,generation:1,div:'H-light',age:26,W:8,L:3,D:0,...nm};
        const profil=mgmtCombatProfile(f);
        comptes[profil.style]++;
        const ville=mgmtIdentiteVille(f);villesObservees[ville]=(villesObservees[ville]||0)+1;
      }
      const styles=STYLE_KEYS.map(k=>({style:k,table:MGMT_STYLE_PAYS[ck][k],
        attendu:attendu[k],observe:100*comptes[k]/n,ecart:100*comptes[k]/n-attendu[k],nombre:comptes[k]}));
      pays.push({ck,n,styles,villes:villesObservees,maxEcart:Math.max(...styles.map(s=>Math.abs(s.ecart)))});
    }
    let doublons=0,ordinaux=0,identites=0;
    const exemples=[];
    for(let cohorte=0;cohorte<20;cohorte++){
      const m=mgmtDefault();
      for(let i=1;i<=150;i++){
        const f=mgmtExteriorCreate(m,1,'H-light');
        (i%2?m.roster:m.exterieur).push(f);
      }
      // Des ids distincts entre cohortes : pas vingt copies du même monde.
      for(const f of m.roster.concat(m.exterieur)) f.id='mg'+(Number(f.id.slice(2))+cohorte*150);
      const pris=new Set();
      for(const f of m.roster.concat(m.exterieur)){
        const id=mgmtIdentite(m,f);if(pris.has(id.surnom)) doublons++;pris.add(id.surnom);
        if(id.surnom.includes(' · ')) ordinaux++;
        identites++;if(exemples.length<8) exemples.push({id:f.id,ck:f.ck,...id});
      }
    }
    return {parPays:n,totalProfils:n*COUNTRY_KEYS.length,pays,
      maxEcart:Math.max(...pays.map(p=>p.maxEcart)),identites,tailleCategorie:150,
      doublons,ordinaux,exemples,rngIntacte:seed===SEED,
      aRelire:[...Object.values(MGMT_SURNOMS).flatMap(b=>Object.values(b).flat()),
        ...MGMT_SURNOMS_PROVENANCE,...Object.values(MGMT_METIERS).flat(),
        ...MGMT_MILIEUX,...MGMT_RITUELS,...MGMT_TRAJECTOIRES]
        .filter(t=>!t.relu).map(t=>t.texte||t.libelle),
      paysEnAttenteH2:Object.keys(MGMT_STYLE_PAYS).filter(ck=>!COUNTRY_KEYS.includes(ck))};
  })())`));
  const output=process.argv.find(a=>a.startsWith('--output='));
  if(output){
    const file=path.resolve(__dirname,'..',output.slice(9));
    if(!fs.existsSync(path.dirname(file))) throw new Error('Dossier de rapport absent');
    fs.writeFileSync(file,JSON.stringify(report,null,2)+'\n');
  }
  console.log(JSON.stringify({totalProfils:report.totalProfils,pays:report.pays.length,
    maxEcart:report.maxEcart,identites:report.identites,doublons:report.doublons,
    ordinaux:report.ordinaux,rngIntacte:report.rngIntacte,paysEnAttenteH2:report.paysEnAttenteH2},null,2));
  if(report.maxEcart>3||report.doublons||!report.rngIntacte) process.exitCode=1;
}finally{ w.close(); }
