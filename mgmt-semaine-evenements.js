"use strict";
/* ==== [ANCRE: P6_T1_SEMAINE_TIRAGE] — Monde lot 41 T1 ==== */
function mgmtSemaineHash(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function mgmtSemaineStream(m,n,id){return mulberry32(mgmtSemaineHash('semaine|'+(m.graine||'')+'|'+n+'|'+id));}
function mgmtSemaineValide(s){
  if(!s||typeof s!=='object'||Array.isArray(s)||!Number.isSafeInteger(s.n)||s.n<1||!Array.isArray(s.ev)||s.ev.length>6)return false;
   return s.ev.every(e=>{const f=MGMT_SEMAINE_FAMILLES.find(x=>x.id===e?.f);return !!f&&['lundi','mardi','mercredi','jeudi','vendredi','samedi'].includes(e.j)&&(e.a===null||typeof e.a==='string'&&e.a.length<=80)&&(e.b===null||typeof e.b==='string'&&e.b.length<=80)&&Number.isSafeInteger(e.v)&&e.v>=0&&e.v<f.textes.length&&typeof e.p==='boolean'&&(!('r'in e)||e.r==='A'||e.r==='B')&&(!e.p||f.ton==='probleme');});
}
/* ==== [ANCRE: P6_T2_SEMAINE_FACTEURS] — Monde lot 41 T1 ==== */
function mgmtSemaineFacteurs(m,id){
  const f=mgmtFighterById(m,id)||{}, combats=Array.isArray(m.hist)?m.hist.filter(x=>x.a===id||x.b===id).slice(-3).length:0;
  const age=Number(f.age)||28, traits=typeof mgmtTraitsEtat==='function'?mgmtTraitsEtat(m,id,m.eventsPlayed||0).length:0;
  const rival=(m.rivalites||[]).some(r=>r.a===id||r.b===id)?1:0;
  const camp=typeof mgmtCamp==='function'?1:0, salle=Number(m.card&&m.card.taille)||Number(m.salleTaille)||0;
  return {charge:1+Math.min(.8,combats*.2),age:1+Math.min(.5,Math.max(0,age-30)*.02),traits:1+Math.min(.5,traits*.08),camp:1+camp*.05,rivalite:1+rival*.2,salle:1+Math.min(.5,salle/20000)};
}
function mgmtSemaineTirer(m){
  if(!m||m.semaine||!m.card)return m&&m.semaine||null;
  const fights=(m.card.main||[]).concat(m.card.prelims||[]), ids=[...new Set(fights.flatMap(x=>[x.a,x.b]).filter(x=>typeof x==='string'))];
  const n=Math.max(1,(m.eventsPlayed||0)+1), sorted=ids.slice().sort(), ev=[];
  if(!sorted.length)return null;
  /* Dosage fixe pseudo-aléatoire à longue période : environ 1/3 de chaque niveau. */
  const dose=mgmtSemaineHash((m.graine||'')+'|soir|'+n)%3, count=dose===0?0:dose===1?1:2+mgmtSemaineHash('deux|'+(m.graine||'')+'|'+n)%2;
  const jours=['lundi','mardi','mercredi','jeudi','vendredi','samedi'];
  for(let i=0;i<count&&i<6&&i<sorted.length;i++){
    const a=sorted[(mgmtSemaineHash('acteur|'+n+'|'+(m.graine||''))+i)%sorted.length];
    const adv=fights.find(x=>x.a===a||x.b===a), b=adv?(adv.a===a?adv.b:adv.a):null;
    const r=mgmtSemaineStream(m,n,a+'|'+i), facteurs=mgmtSemaineFacteurs(m,a);
    const candidates=MGMT_SEMAINE_FAMILLES.map(f=>({f,score:f.base*Object.keys(f.poids).reduce((v,k)=>v*(facteurs[k]||1),1)}));
    /* Une permutation de classement pondérée conserve une famille distincte sur
       le cycle complet ; l'index de variante change avant le retour (22 soirées). */
    const ordre=candidates.slice().sort((x,y)=>y.score-x.score||x.f.id.localeCompare(y.f.id));
    const depart=mgmtSemaineHash('choix|'+(m.graine||'')+'|'+a)%ordre.length;
    const famille=ordre[(depart+n-1)%ordre.length].f;
    const v=(n-1)%famille.textes.length;
    const prior=ev.some(x=>x.p);ev.push({f:famille.id,j:famille.jour||jours[i],a,b:typeof b==='string'?b:null,v,p:famille.ton==='probleme'&&!prior&&r()<.12});
  }
  m.semaine={n,ev};return m.semaine;
}
function mgmtSemaineTexte(m,ev){const f=MGMT_SEMAINE_FAMILLES.find(x=>x.id===ev.f);if(!f)return '';const a=mgmtFighterById(m,ev.a),b=mgmtFighterById(m,ev.b), substitutions={nom:a?.name||'Le combattant',adversaire:b?.name||'son adversaire',ville:m.ville||'la ville',salle:m.salle||'la salle'};return f.textes[ev.v].replace(/\{(nom|adversaire|ville|salle)\}/g,(_,k)=>esc(substitutions[k]));}
