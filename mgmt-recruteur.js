"use strict";
/* ==== [ANCRE: P5_T1_RECRUTEUR_CALCUL] — Monde lot 42 T1 ==== */
function mgmtRecruteurFlux(m,n,dest,couche){ return mgmtIdentiteStream('rc'+n+'-'+dest,couche,m); }
function mgmtRecruteurDestination(id){ return MGMT_RECRUTEUR.destinations.find(d=>d.id===id)||null; }
function mgmtRecruteurValide(x){
  if(!x||typeof x!=='object'||Array.isArray(x)||!Number.isSafeInteger(x.seq)||x.seq<0||!Array.isArray(x.retours)||x.retours.length>3)return false;
  if(x.mission!==null){const q=x.mission;if(!q||!mgmtRecruteurDestination(q.dest)||!Number.isSafeInteger(q.retourLe)||!Number.isSafeInteger(q.partiLe)||!Number.isSafeInteger(q.cout)||q.cout<0||!Number.isSafeInteger(q.sem)||![2,3,4].includes(q.sem)||typeof q.cat!=='string'||typeof q.style!=='string')return false;}
  for(const r of x.retours){if(!r||!Number.isSafeInteger(r.n)||r.n<1||!mgmtRecruteurDestination(r.dest)||!Array.isArray(r.profils)||r.profils.length>5||!Number.isSafeInteger(r.lus)||r.lus<0||r.lus>r.profils.length)return false;for(const p of r.profils){if(!p||typeof p.id!=='string'||!p.id||p.id.length>80||typeof p.name!=='string'||p.name.length>80||!Number.isInteger(p.age)||p.age<19||p.age>31||!['lutteur','frappeur','grappler','complet'].includes(p.style)||typeof p.cat!=='string'||!Number.isInteger(p.W)||p.W<0||!Number.isInteger(p.L)||p.L<0||typeof p.phrase!=='string'||p.phrase.length>200)return false;}}
  return true;
}
function mgmtRecruteurJour(m){ return Number.isInteger(m?.cal?.jour)?m.cal.jour:0; }
function mgmtRecruteurEtat(m){
  if(!m.recruteur) m.recruteur={mission:null,retours:[],seq:0};
  return m.recruteur;
}
function mgmtRecruteurEnvoyer(m,choix){
  if(!m||!choix) return false;
  const d=mgmtRecruteurDestination(choix.dest);
  if(!d)return false;
  const etat=mgmtRecruteurEtat(m);
  if(etat.mission||!d.categories.includes(choix.cat)||!['lutteur','frappeur','grappler','complet'].includes(choix.style)||![2,3,4].includes(choix.sem)) return false;
  const cout=d.cout;
  if(!Number.isFinite(m.treasury)||m.treasury<cout) return false;
  m.treasury-=cout;
  const partiLe=mgmtRecruteurJour(m),sem=choix.sem;
  etat.mission={dest:d.id,cat:choix.cat,style:choix.style,sem,partiLe,retourLe:partiLe+sem*7,cout};
  etat.seq=(etat.seq||0)+1;
  return true;
}
function mgmtRecruteurStyle(mission,d,r){
  const poids=d.styles,total=Object.values(poids).reduce((a,b)=>a+b,0);
  let x=r()*100;
  for(const k of ['lutteur','frappeur','grappler','complet']){ x-=100*poids[k]/total; if(x<0)return k; }
  return 'complet';
}
function mgmtRecruteurRetour(m){
  const e=m?.recruteur;if(!e?.mission||mgmtRecruteurJour(m)<e.mission.retourLe)return null;
  const mission=e.mission,d=mgmtRecruteurDestination(mission.dest),n=e.seq||1;
  const r=mgmtRecruteurFlux(m,n,d.id,'retour');
  const profils=[];
  if(r()<d.bredouille){
    e.retours.unshift({n,dest:d.id,profils:[],lus:0,bredouille:MGMT_RECRUTEUR.retour.bredouille[Math.floor(r()*3)]});
  }else{
    const nombre=3+Math.floor(r()*3),pool=Array.isArray(MGMT_NOMS_AJOUTS[d.ck]?.first)?MGMT_NOMS_AJOUTS[d.ck].first:COUNTRIES[d.ck].first;
    const noms=Array.isArray(pool)&&pool.length?pool:COUNTRIES.FR.first;
    const traits=typeof MGMT_TRAITS==='object'?MGMT_TRAITS:[];
    for(let i=0;i<nombre;i++){
      const k=i+1,id='rc'+n+'-'+k,style=mgmtRecruteurStyle(mission,d,r),pepite=i===0&&r()<1/d.pepites;
      const nom=mgmtIdentitePick(id,'recruteur-nom-'+d.ck,noms,m);
      const profilRng=mgmtRecruteurFlux(m,n,d.id,'profil-'+k),age=19+Math.floor(profilRng()*13),vic=pepite?8+Math.floor(profilRng()*7):2+Math.floor(profilRng()*8),def=pepite?0:Math.floor(profilRng()*4);
      const trait=Array.isArray(traits)&&traits.length?traits[Math.floor(profilRng()*traits.length)]:null;
      const formule=MGMT_RECRUTEUR.retour.style[style];
      const base=typeof COUNTRIES[d.ck]!=='undefined'?d.ck:'FR';
      profils.push({id,name:nom,first:nom.split(' ')[0],last:nom.split(' ').slice(1).join(' '),ck:base,age,cat:mission.cat,style,W:vic,L:def,D:0,organisation:d.circuits[Math.floor(r()*3)],pepita:pepite,
        chiffres:{documentes:Math.max(3,Math.min(vic+def,Math.floor(profilRng()*8)+3)),significatifs:Math.floor(profilRng()*40)+10,amenes:Math.floor(profilRng()*8),finitions:pepite?vic:Math.floor(profilRng()*Math.max(1,vic))},
        trait:trait?(trait.id||trait):null,phrase:(pepite?MGMT_RECRUTEUR.retour.pepite:formule)[Math.floor(profilRng()*3)],contrat:{combats:3+Math.floor(profilRng()*3),primeCombat:1000+Math.floor(profilRng()*4000),primeSignature:1000+Math.floor(profilRng()*9000)}});
    }
    e.retours.unshift({n,dest:d.id,profils,lus:0});
  }
  e.mission=null;e.retours=e.retours.slice(0,3);
  return e.retours[0];
}
function mgmtRecruteurSigner(m,idProfil){
  const e=m?.recruteur,profil=e?.retours?.flatMap(x=>x.profils||[]).find(p=>p.id===idProfil);
  if(!profil||m.roster?.some(f=>f.id===profil.id)||typeof mgmtContratSigner!=='function')return null;
  /* La porte mgmtRecruter signe une ligne du marché et exige une trace. Les profils de mission sont une offre déjà observée : les insérer temporairement dans la même porte, puis retirer la ligne d'offre. */
  if(!Array.isArray(m.exterieur)||typeof mgmtExteriorTrace!=='function')return null;
  const div=typeof divById==='function'?divById(profil.cat):null;
  if(!div)return null;
  const ligne={id:profil.id,name:profil.name,first:profil.first,last:profil.last,ck:profil.ck,div:div.id,generation:0,W:profil.W,L:profil.L,D:profil.D||0,age:profil.age,level:1,libre:true,career:[{age:profil.age,W:profil.W,L:profil.L,D:profil.D||0}]};
  m.exterieur.push(ligne);
  const signé=mgmtRecruter(m,profil.id,true);
  m.exterieur=m.exterieur.filter(x=>x.id!==profil.id);
  if(!signé)return null;
  signé.cat=profil.cat;signé.style=profil.style;signé.ck=profil.ck;signé.recruteurId=profil.id;
  return signé;
}
function mgmtRecruteurSuivre(m,idProfil){
  const profil=m?.recruteur?.retours?.flatMap(x=>x.profils||[]).find(p=>p.id===idProfil);
  if(!profil||typeof mgmtSuivre!=='function')return false;
  return mgmtSuivre(m,idProfil);
}
