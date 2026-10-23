"use strict";
/* ==== [ANCRE: P9_T2_POSTE_CALCUL] — Monde lot 43 T1 ==== */
/** Niveau de confiance en mots : conf 4 est le meilleur (« Il est ravi », indice 0 des données), conf 0 le pire (« Il n’y croit plus », indice 4). */
function mgmtPosteNiveau(conf){
  const l=MGMT_POSTE.seuils.phrases, i=4-(Number.isSafeInteger(conf)?Math.max(0,Math.min(4,conf)):2);
  return l[i]||l[2];
}
function mgmtPostePatron(m){
  const o=typeof mgmtOrgParNom==='function'?mgmtOrgParNom(mgmtOrgNom(m)):null;
  if(o&&typeof o.patron==='string'&&o.patron.trim()) return o.patron.trim();
  /* Le patron de Split existe déjà dans les textes du jeu (mgmt-retraits.js : « Jean-Michel Delatour (le patron) »). */
  return mgmtOrgNom(m)==='Split'?'Jean-Michel Delatour':'le patron';
}
function mgmtPosteValide(p){
  if(!p||typeof p!=='object'||Array.isArray(p)||!Number.isSafeInteger(p.debut)||!Number.isSafeInteger(p.fin)||p.fin<=p.debut||!Number.isSafeInteger(p.salaire)||p.salaire<0||!Number.isSafeInteger(p.saison)||p.saison<1||!Array.isArray(p.obj)||p.obj.length<3||p.obj.length>5||!Number.isInteger(p.conf)||p.conf<0||p.conf>4||typeof p.mi!=='boolean'||!Array.isArray(p.hist)||p.hist.length>12)return false;
  if(!p.obj.every(o=>o&&typeof o==='object'&&MGMT_POSTE.types.includes(o.t)&&Number.isFinite(o.cible)&&['cours','tenu','manque','fait'].includes(o.e)&&Number.isFinite(o.v)))return false;
  return p.hist.every(h=>h&&Number.isSafeInteger(h.s)&&h.s>=0&&Number.isInteger(h.conf)&&h.conf>=0&&h.conf<=4&&typeof h.note==='string'&&/^[a-z-]{1,24}$/.test(h.note));
}
function mgmtPosteRang(m){
  const rows=typeof mgmtOrgClassement==='function'?mgmtOrgClassement(m):null;
  const id=typeof mgmtPredecesseurOrgId==='function'?mgmtPredecesseurOrgId(m):null;
  const row=rows&&rows.find(x=>x.id===id); return row?row.rang:4;
}
function mgmtPosteInit(m){
  if(!m||m.poste) return m&&m.poste||null;
  const manque=mgmtManque(m), objs=[];
  if(manque&&manque.objectif&&manque.objectif.cible) objs.push({t:'manque',cible:1,e:'cours',v:0});
  const rang=mgmtPosteRang(m), pop=mgmtOrgProfil(m).popularite;
  const candidats=[
    {t:'lourd-top15',cible:15},{t:'rang-orgs',cible:Math.max(1,rang-1)},
    {t:'champion-top5',cible:5},{t:'caisse',cible:0},
    {t:'popularite',cible:MGMT_POSTE.seuils.popularite.find(x=>x>pop)||Math.min(100,pop+10)}
  ];
  for(const o of candidats){
    if(objs.length>=4) break;
    const acquis=o.t==='rang-orgs'&&rang<=o.cible||o.t==='popularite'&&pop>=o.cible;
    if(!acquis) objs.push({t:o.t,cible:o.cible,e:'cours',v:0});
  }
  if(objs.length<3) objs.push({t:'salle',cible:0,e:'cours',v:0});
  m.poste={debut:typeof mgmtCalAujourdhui==='function'?mgmtCalAujourdhui(m):0,fin:(typeof mgmtCalAujourdhui==='function'?mgmtCalAujourdhui(m):0)+MGMT_POSTE.duree,salaire:MGMT_POSTE.salaire,saison:1,obj:objs,conf:2,mi:false,hist:[]};
  return m.poste;
}
function mgmtPosteValeur(m,o){
  if(o.t==='manque') return o.e==='tenu'?1:0;
  if(o.t==='lourd-top15') return (m.roster||[]).filter(f=>f&&f.div==='H-heavy'&&(mgmtDivisionRanking(m,f.div,'world')||[]).findIndex(r=>r.id===f.id)<15).length;
  if(o.t==='champion-top5') return (m.roster||[]).some(f=>f&&mgmtChampionIds(m).has(f.id)&&(mgmtDivisionRanking(m,f.div,'world')||[]).findIndex(r=>r.id===f.id)<5)?1:0;
  if(o.t==='rang-orgs') return mgmtPosteRang(m);
  if(o.t==='caisse') return m.treasury;
  if(o.t==='popularite') return Number.isFinite(m.pop)?m.pop:mgmtOrgProfil(m).popularite;
  if(o.t==='salle') return m.audiences&&m.audiences.length?m.audiences[m.audiences.length-1]:0;
  return 0;
}
function mgmtPosteSoiree(m){
  const p=m&&m.poste; if(!p)return null;
  let positif=0,negatif=0;
  p.obj.forEach(o=>{const v=mgmtPosteValeur(m,o);o.v=v;
    const atteint=o.t==='rang-orgs'?v<=o.cible:o.t==='caisse'?v>=o.cible:o.t==='popularite'?v>=o.cible:o.t==='manque'?v>0:v>0;
    if(atteint){if(o.e!=='tenu'&&o.e!=='fait')positif++;o.e='tenu';}else if(o.e!=='fait')o.e='cours';
  });
  if(m.treasury<0)negatif++;else if(m.treasury>0)positif++;
  const aud=m.audiences&&m.audiences[m.audiences.length-1]||0;
  if(aud>=MGMT_MAIN_SIZE)positif++;else if(aud>0&&aud<=MGMT_MAIN_SIZE/2)negatif++;
  const rang=mgmtPosteRang(m), prev=Number.isSafeInteger(p.rg)?p.rg:rang;   /* le rang précédent vit dans la sauvegarde : une partie rechargée se comporte comme une session continue */
  if(rang<prev)positif++;else if(rang>prev)negatif++;
  p.rg=rang;
  const avant=p.conf; p.conf=Math.max(0,Math.min(4,avant+(positif>negatif?1:negatif>positif?-1:0)));
  const jour=typeof mgmtCalAujourdhui==='function'?mgmtCalAujourdhui(m):m.eventsPlayed*35;
  if(!p.mi&&jour-p.debut>=MGMT_POSTE.mi)p.mi=true;
  p.hist.push({s:m.eventsPlayed,conf:p.conf,note:positif>negatif?'progres':negatif>positif?'recul':'stable'});
  if(p.hist.length>12)p.hist.shift(); return p;
}
function mgmtPosteBilan(m){
  const p=m&&m.poste;if(!p)return null;
  const objTenus=p.obj.filter(o=>o.e==='tenu'||o.e==='fait').length,objTotal=p.obj.length,ratio=objTotal?objTenus/objTotal:0;
  const aug=p.conf>=MGMT_POSTE.seuils.augmente.conf&&ratio>=MGMT_POSTE.seuils.augmente.tenus;
  const condition=p.conf>=MGMT_POSTE.seuils.condition.conf&&ratio>=MGMT_POSTE.seuils.condition.tenus;
  return {issue:aug?'prolonge-augmente':condition?'prolonge-condition':'renvoi',salaire:aug?Math.round(p.salaire*1.25):p.salaire,duree:MGMT_POSTE.duree,objTenus,objTotal};
}
/* ==== [ANCRE: P9_T2_POSTE_RENOUVELER] — Monde lot 43 T2 ==== */
function mgmtPosteRenouveler(m,issue){
  if(!m||!m.poste||!['prolonge-augmente','prolonge-condition'].includes(issue)) return null;
  const ancien=m.poste, bilan=mgmtPosteBilan(m);
  const salaire=issue==='prolonge-augmente'?bilan.salaire:ancien.salaire;
  const debut=ancien.fin;
  delete m.poste;
  mgmtPosteInit(m);
  m.poste.debut=debut;
  m.poste.fin=debut+MGMT_POSTE.duree;
  m.poste.saison=ancien.saison+1;
  m.poste.salaire=salaire;
  return m.poste;
}
