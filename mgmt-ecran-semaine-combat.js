"use strict";
/* ==== [ANCRE: P6_T2_ECRAN_SEMAINE] — Monde lot 41 T2 ==== */
const MGMT_SE_JOURS=['lundi','mardi','mercredi','jeudi','vendredi','samedi'];
const MGMT_SE_TITRES=['Arrivée à {ville}','Journée des médias','Conférence de presse','Face-à-face','La pesée','La soirée'];
let MGMT_SE_JOUR=0;
function mgmtSeEvenement(m,jour){return m.semaine.ev.find(e=>e.j===jour)||null;}
function mgmtSeTitre(m,i){const e=mgmtSeEvenement(m,MGMT_SE_JOURS[i]);if(e){const f=MGMT_SEMAINE_FAMILLES.find(x=>x.id===e.f);return f?f.id.replace(/_/g,' ').toLocaleUpperCase('fr'):'';}return MGMT_SE_TITRES[i].replace('{ville}',esc(m.ville||'la ville'));}
function mgmtSeCarte(m){return (m.card.main||[]).concat(m.card.prelims||[]).map(f=>{const a=mgmtFighterById(m,f.a),b=mgmtFighterById(m,f.b),diminue=id=>m.semaine.ev.some(e=>e.f==='blessure_camp'&&e.p&&e.a===id),nom=(x,id)=>`${esc(x&&x.name||'À déterminer')}${diminue(id)?'<strong class="se-diminue"> — diminué : sa forme baisse pour ce combat</strong>':''}`;return `<div class="se-combat">${nom(a,f.a)} <span>—</span> ${nom(b,f.b)}</div>`;}).join('');}
/* ==== [ANCRE: MONDE_51_T1_CHOIX_APPLIQUER] — Monde lot 51 T1 ==== */
function mgmtSeChoisir(i,r){
  const m=G&&G.mgmt,e=m&&m.semaine&&m.semaine.ev[i];
  if(!e||!e.p||e.r||!['A','B'].includes(r)||!MGMT_SEMAINE_CHOIX[e.f])return false;
  const f=mgmtFighterById(m,e.a),adv=mgmtFighterById(m,e.b);if(!f||!adv)return false;
  if(r==='B'&&(m.effectifs!==1||!mgmtCardFull(m)||(m.facts||[]).some(x=>x&&x.k==='retrait'&&x.c===m.cycle)))return false;
  if(e.f==='poids'&&r==='A'){const amende=Math.ceil(mgmtPurse(f,'main')*.2);m.treasury-=amende;mgmtAddFact(m,{c:m.cycle,k:'semaine_poids',a:f.id,b:adv.id,montant:amende});e.amende=amende;}
  if(e.f==='blessure_camp'&&r==='A')f.diminue=m.cycle;
  if(e.f==='visa'&&r==='A'){
    let slot=null,fight=null;
    for(const s of ['main','prelims']){fight=m.card[s].find(x=>x.a===f.id||x.b===f.id);if(fight){slot=s;break;}}
    if(!fight)return false;
    const cible=fight.a===f.id?fight.b:fight.a;m.card[slot]=m.card[slot].filter(x=>x!==fight);
    mgmtAddFact(m,{c:m.cycle,k:'demande',a:f.id,want:'revanche',target:cible});
  }
  e.r=r;saveMgmt();render();return true;
}
function scr_mgmt_semaine(){
  const m=G&&G.mgmt;
  if(!m||!m.semaine||!mgmtSemaineValide(m.semaine))return scr_mgmt_accueil();
  const index=Math.max(0,Math.min(5,MGMT_SE_JOUR)),jour=MGMT_SE_JOURS[index],e=mgmtSeEvenement(m,jour),f=e&&MGMT_SEMAINE_FAMILLES.find(x=>x.id===e.f);
  const titre=e?(e.f==='poids'?'LA PESÉE':f.id.replace(/_/g,' ').toLocaleUpperCase('fr')):MGMT_SE_TITRES[index].replace('{ville}',esc(m.ville||'la ville'));
  const texte=e?mgmtSemaineTexte(m,e):titre;
  const vus=new Set(),brefs=m.semaine.ev.filter(x=>x.j!==jour).filter(x=>{const cle=x.f+'|'+(x.a||'');if(vus.has(cle))return false;vus.add(cle);return true;}).slice(0,3);
  const evHtml=brefs.length?brefs.map(x=>`<div class="se-bref">${mgmtSemaineTexte(m,x)}</div>`).join(''):'<div class="se-bref">Rien d’autre cette semaine.</div>';
  const peutRetirer=m.effectifs===1&&mgmtCardFull(m)&&!(m.facts||[]).some(x=>x&&x.k==='retrait'&&x.c===m.cycle);
  const choix=e&&e.p?(e.r?`<div class="se-choix"><p>Choix : ${esc(e.r)}</p></div>`:(()=>{const d=MGMT_SEMAINE_CHOIX[e.f];return d?`<div class="se-choix"><button class="se-option" onclick="CL.mgmtSemaineChoix('A')"><b>A</b><strong>${esc(d.A.titre)}</strong><span>${esc(d.A.texte)}</span></button><button class="se-option" ${peutRetirer?'':'disabled'} onclick="CL.mgmtSemaineChoix('B')"><b>B</b><strong>${esc(d.B.titre)}</strong><span>${esc(d.B.texte)}</span></button></div>`:'';})()):'';
  const frise=MGMT_SE_JOURS.map((d,i)=>`<button class="se-jour${i===index?' se-actif':''}" onclick="CL.mgmtSemaineJour(${i})"><b>${d.toLocaleUpperCase('fr')}</b><span>${i===0?esc('Arrivée à '+(m.ville||'la ville')):esc(['','Journée des médias','Conférence de presse','Face-à-face','La pesée','La soirée'][i])}</span>${mgmtSeEvenement(m,d)?`<small>${esc(mgmtSeTitre(m,i))}</small>`:''}</button>`).join('');
  const heure=e&&e.f==='poids'?'11 H 40 · ':'';
  const html=`<main class="mf-contenu se-ecran"><nav class="se-frise" aria-label="La semaine">${frise}</nav><div class="se-colonnes"><section class="se-principal">${mfPanneau(`<div class="se-surtitre">${jour.toLocaleUpperCase('fr')} · ${heure}${titre}</div><h1 class="se-titre">${titre}</h1><div class="se-texte">${texte}</div>${choix}`,'normal','se-panneau')}<section class="se-principal">${mfPanneau(`<h2>La semaine en bref</h2>${evHtml}`,'normal','se-panneau')}</section></section><aside class="se-cote">${mfPanneau(`<h2>La carte de samedi</h2>${mgmtSeCarte(m)}`,'normal','se-panneau')}</aside></div></main>`;
   const org=mgmtOrgNom(m);
   return mfEcran(html,{barre:'jeu',courant:'accueil',m,plaque:'La semaine du combat',droite:`${org} Fight Night ${(m.eventsPlayed||0)+1}`,touches:[{ks:['←','→'],t:'Jour de la semaine'},{ks:['A'],t:'Le combat a lieu'},{ks:['B'],t:'Annuler le combat'},{ks:['Échap'],t:'Accueil'}]});
}
SCREENS.mgmt_semaine=scr_mgmt_semaine;
Object.assign(CL,{mgmtSemaineJour(i){MGMT_SE_JOUR=(i+6)%6;render();},mgmtSemaineDeplacer(d){MGMT_SE_JOUR=(MGMT_SE_JOUR+d+6)%6;render();},mgmtSemaineChoix(r){const m=G&&G.mgmt,e=m&&m.semaine&&m.semaine.ev.findIndex(x=>x.j===MGMT_SE_JOURS[MGMT_SE_JOUR]);if(e>=0)mgmtSeChoisir(e,r);}});
keysRegister('mgmt_semaine',{ArrowLeft(){CL.mgmtSemaineDeplacer(-1);},ArrowRight(){CL.mgmtSemaineDeplacer(1);},a(){CL.mgmtSemaineChoix('A');},A(){CL.mgmtSemaineChoix('A');},'1'(){CL.mgmtSemaineChoix('A');},b(){CL.mgmtSemaineChoix('B');},B(){CL.mgmtSemaineChoix('B');},'2'(){CL.mgmtSemaineChoix('B');},Escape(){CL.go('mgmt_accueil');}});
