"use strict";
/* ==== [ANCRE: P1_T6B_CADRE_LEADERS] — Monde lot 31 T6b ==== */
const MGMT_MEILLEURS_LABELS={
  tabs:{liste:'SPLIT',monde:'MONDIAL',meilleurs:'LES MEILLEURS',records:'LES RECORDS'},
  categories:[['finitions','LE PLUS DE FINITIONS',''],['volume','LE PLUS GROS VOLUME','/ MIN'],['precis','LE PLUS PRÉCIS','%'],['defense','LA MEILLEURE DÉFENSE','%'],['lutteur','LE LUTTEUR','/ 15 MIN'],['mur','LE MUR','%'],['cou','LE CHASSEUR DE COU','/ 15 MIN'],['serie','LA PLUS LONGUE SÉRIE','V']],
  insufficient:'3 combats documentés minimum',precise:'5 pour la précision',empty:'Pas encore de combat documenté.',
  recordLabels:{sigAtt:'Coups significatifs tentés en un combat',koRapide:'Le KO le plus rapide',amenees:'Amenées réussies en un combat',knockdowns:'Knockdowns dans un même combat',controle3:'Contrôle au sol en trois rounds',corps:'Coups au corps en un combat',finitions:'Finitions chez Split',defensesTitre:'Défenses de titre de suite',victoiresSuite:'Victoires de suite',combats:'Combats chez Split',plusJeuneChampion:'Le plus jeune champion'},
  beaten:{sigAtt:'{nom}, {valeur} à Split Fight Night {soiree}.{avant}',koRapide:'{nom}, {valeur} à Split Fight Night {soiree}.{avant}',amenees:'{nom}, {valeur} à Split Fight Night {soiree}.{avant}',knockdowns:'{nom}, {valeur} à Split Fight Night {soiree}.{avant}',controle3:'{nom}, {valeur} à Split Fight Night {soiree}.{avant}',corps:'{nom}, {valeur} à Split Fight Night {soiree}.{avant}'}
};
function mgmtSuClOnglets(){
  const F=MGMT_SU_CL,L=MGMT_MEILLEURS_LABELS;
  const tabs=[['liste',F.portee==='world'?'MONDIAL':'SPLIT'],['meilleurs',L.tabs.meilleurs],['records',L.tabs.records]];
  return tabs.map(([v,t])=>({t,on:F.vue===v,onclick:`CL.mgmtSuClVue('${v}')`}));
}
function mgmtMeilleursRendu(m){
  const F=MGMT_SU_CL,L=MGMT_MEILLEURS_LABELS,div=mgmtSuDiv(F),data=mgmtMeilleurs(m,{divId:div,portee:F.portee==='world'?'monde':'split'});
  const cards=L.categories.map(([id,label,unit])=>{
    const r=data.find(x=>x.id===id),rank=r?r.rang:[],first=rank[0],value=v=>Number.isInteger(v)?String(v):String(Number(v.toFixed(2))).replace('.',',');
    const top=first?`<button class="mf-me-nom" onclick="CL.mgmtFiche('${escJsAttr(first.id)}')">${esc(first.nom.toLocaleUpperCase('fr'))}</button>`:`<div class="mf-me-vide">—<small>${esc(id==='precis'?L.precise:L.insufficient)}</small></div>`;
    const rows=rank.slice(1,3).map((x,i)=>`<div><button onclick="CL.mgmtFiche('${escJsAttr(x.id)}')">${i+2}. ${esc(x.nom.trim().split(/\s+/).pop())}</button><span>${esc(value(x.valeur))}</span></div>`).join('');
    return `<article class="mf-me-carte"><h3>${esc(label)}</h3><div class="mf-me-valeur">${first?esc(value(first.valeur)):''}${first&&unit?`<small>${esc(unit)}</small>`:''}</div>${top}<div class="mf-me-rangs">${rows}</div></article>`;
  }).join('');
  const r=mgmtRecords(m).battu, family=x=>(x||'').trim().split(/\s+/).pop();
  const phrase=r&&L.beaten[r.id]?L.beaten[r.id].replace('{nom}',family(r.combattant.nom)).replace('{valeur}',String(r.valeur)).replace('{soiree}',String(r.soiree)).replace('{avant}',r.avant?` L'ancien record tenait depuis ${r.avant.soiree} (${family(r.avant.combattant.nom)}, ${r.avant.valeur}).`:''):'';
  const aside=phrase?`<aside class="mf-me-battu"><b>RECORD BATTU</b><span>${esc(phrase)}</span></aside>`:'';
  return `<main class="mf-contenu mf-me"><div class="mf-me-grille">${cards}</div>${aside}</main>`;
}
function scr_mgmt_meilleurs_cadre(){
  const m=G.mgmt,F=MGMT_SU_CL,d=divById(mgmtSuDiv(F));
  return mfEcran(mgmtMeilleursRendu(m),{barre:'jeu',courant:'classements',m,plaque:'Classements',onglets:mgmtSuClOnglets(),libelle:`${F.sexe==='F'?'FEMMES':'HOMMES'} · ${String(d.name).toUpperCase()}`,droite:`${mgmtOrgNom(m)} Fight Night ${(m.eventsPlayed||0)+1}`,touches:[{ks:['Échap'],t:'Accueil',onclick:"CL.go('mgmt_accueil')"},{ks:['Tab'],t:'Onglet'},{ks:['G'],t:'Hommes / femmes',onclick:'CL.mgmtSuClSexe()'},{ks:['M'],t:'Portée',onclick:'CL.mgmtSuClPortee()'},{ks:['V'],t:'Changer de vue',onclick:'CL.mgmtSuClVueSuivante()'}]});
}
function mgmtRecordsRendu(m){
  const L=MGMT_MEILLEURS_LABELS,r=mgmtRecords(m),hist=(m.hist||[]).filter(x=>x&&x.date).map(x=>new Date(x.date).getFullYear()).filter(Number.isFinite),year=hist.length?Math.min(...hist):null;
  const groups=[['EN UN COMBAT',['sigAtt','koRapide','amenees','knockdowns','controle3','corps']],['EN CARRIÈRE',['finitions','defensesTitre','victoiresSuite','combats','plusJeuneChampion']]];
  const format=(id,v)=>id==='koRapide'?`0:${String(v).padStart(2,'0')}`:id==='controle3'?`${Math.floor(v/60)}:${String(v%60).padStart(2,'0')}`:String(v);
  let count=0;
  const html=groups.map(([title,ids])=>{const rows=ids.map(id=>{const rec=[...r.unCombat,...r.carriere].find(x=>x.id===id&&x.combattant);if(!rec)return '';count++;const beaten=r.battu&&r.battu.id===id?r.battu:null;
    const before=beaten&&beaten.avant?`<span class="mf-re-avant">avant : ${esc(beaten.avant.combattant.nom)}, ${esc(beaten.avant.valeur)}</span>`:'';
    return `<div class="mf-re-ligne"><strong>${esc(format(id,rec.valeur))}${id==='plusJeuneChampion'?' <small>ANS</small>':''}</strong><div><div>${esc(L.recordLabels[id])}${beaten?' <span class="mf-re-nouveau">NOUVEAU</span>':''}</div><small>${esc(rec.combattant.nom)} · Split Fight Night ${esc(rec.soiree)}${year?`, ${esc(year)}`:''} ${before}</small></div></div>`;
  }).join('');return rows?`<section class="mf-re-groupe"><h2>${title}</h2>${rows}</section>`:'';}).join('');
  return `<main class="mf-contenu mf-re"><div class="mf-re-intro">${year?`Tous les combats de Split depuis ${esc(year)}, toutes catégories`:''}</div>${html||`<p>${esc(L.empty)}</p>`}</main>`;
}
function scr_mgmt_records_cadre(){
  const m=G.mgmt,F=MGMT_SU_CL;
  return mfEcran(mgmtRecordsRendu(m),{barre:'jeu',courant:'classements',m,plaque:'Classements',onglets:mgmtSuClOnglets(),libelle:'LE LIVRE DES RECORDS',droite:`${mgmtOrgNom(m)} Fight Night ${(m.eventsPlayed||0)+1}`,touches:[{ks:['Échap'],t:'Accueil',onclick:"CL.go('mgmt_accueil')"},{ks:['Tab'],t:'Onglet'},{ks:['V'],t:'Changer de vue',onclick:'CL.mgmtSuClVueSuivante()'}]});
}
