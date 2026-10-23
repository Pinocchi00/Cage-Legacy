"use strict";
/* ==== [ANCRE: P1_T5A_COMBAT_CHIFFRES] — Monde lot 36 T1 ==== */
function mgmtFaceAFace(m,idA,idB){
  const combattant=id=>(m.roster||[]).find(f=>f&&f.id===id)||(m.mondeVivant===true?Object.values(m.orgs||{}).flatMap(o=>o&&o.roster||[]).find(f=>f&&f.id===id):null)||mgmtExteriorCombattant(m,id);
  const fiche=id=>{
    const f=combattant(id); if(!f)return null;
    const ex=mgmtExteriorCombattant(m,id), phys=(mgmtCombatProfile(f).phys)||{}, div=f.div;
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
/* ==== [ANCRE: P1_T5A_RELEVE_COMBAT] — Monde lot 36 T1 ==== */
function mgmtReleveCombat(m,entree){
  const s=entree&&entree.s;
  if(!s||!Array.isArray(s.r)||!Array.isArray(s.e)||!mgmtReleveValide(s))return null;
  const coin=(side)=>{
    const i=side==='A'?0:1, base=i*14, rounds=s.r;
    const sum=k=>rounds.reduce((n,row)=>n+row[base+k],0);
    const sigTouches=sum(0),sigTentes=sum(1),amenees=sum(7),amTentees=sum(8),controle=sum(11),kd=sum(10),sub=sum(12);
    return {sigTouches,sigTentes,precision:sigTentes?sigTouches/sigTentes:null,tete:sum(4),corps:sum(5),jambes:sum(6),amenees,amTentees,controle,kd,sub};
  };
  const parRound=s.r.map((row,i)=>({r:i+1,a:{sigTouches:row[0],amenees:row[7],controle:row[11],kd:row[10]>0},b:{sigTouches:row[14],amenees:row[21],controle:row[25],kd:row[24]>0}}));
  const a=coin('A'),b=coin('B');
  return {rounds:s.r.length,a,b,parRound,total:{a,b},juges:null,tournant:null};
}
