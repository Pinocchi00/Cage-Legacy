"use strict";
/* ==== [ANCRE: P1_T5A_COMBAT_CHIFFRES] — Monde lot 36 T1 ==== */
function mgmtFaceAFace(m,idA,idB){
  const combattant=id=>(m.roster||[]).find(f=>f&&f.id===id)||(m.mondeVivant===true?Object.values(m.orgs||{}).flatMap(o=>o&&o.roster||[]).find(f=>f&&f.id===id):null)||mgmtExteriorCombattant(m,id);
  const fiche=id=>{
    const f=combattant(id); if(!f)return null;
    const ex=mgmtExteriorCombattant(m,id), phys=f.phys||{}, div=f.div;
    const rangs=mgmtDivisionRanking(m,div,ex?'organization':'organization'), rang=(rangs||[]).findIndex(x=>x.id===id);
    return {id:f.id,nom:f.name||f.nom||'',surnom:f.nickname||f.surnom||null,bilan:{v:f.W||0,d:f.L||0,n:f.D||0},rang:rang<0?null:rang+1,age:Number.isFinite(f.age)?f.age:null,ville:f.city||f.ville||null,taille:Number.isFinite(phys.height)?phys.height:null,allonge:Number.isFinite(phys.reach)?phys.reach:null,garde:phys.stance||null,documentes:mgmtStatsDocumentes(m,id)?.docs||0};
  };
  const a=fiche(idA),b=fiche(idB); if(!a||!b)return {a,b,lignes:[]};
  const sa=mgmtStatsCarriere(m,idA),sb=mgmtStatsCarriere(m,idB), lignes=[];
  const ajouter=(id,x,y,sens='haut')=>{const meilleur=x==null||y==null||x===y?null:((sens==='bas'?x<y:x>y)?'a':'b');lignes.push({id,a:x,b:y,meilleur,ecart:x==null||y==null?0:Math.abs(x-y)/Math.max(x,y,1)});};
  ajouter('taille',a.taille,b.taille); ajouter('allonge',a.allonge,b.allonge);
  for(const [id,key,sens] of [['sigParMin','sigParMin'],['precision','precision'],['encaisseParMin','sigEncaisseParMin','bas'],['defense','defense'],['ameneesPar15','ameneesPar15'],['defenseAmenee','defenseAmenee'],['controlePar15','controlePar15']]) ajouter(id,sa?sa[key]:null,sb?sb[key]:null,sens);
  return {a,b,lignes};
}
