"use strict";
/* ==== [ANCRE: P6_T2_ECRAN_SEMAINE] — Monde lot 41 T2 ==== */
const MGMT_SE_JOURS=['lundi','mardi','mercredi','jeudi','vendredi','samedi'];
const MGMT_SE_TITRES=['Arrivée à {ville}','Journée des médias','Conférence de presse','Face-à-face','La pesée','La soirée'];
let MGMT_SE_JOUR=0;
function mgmtSeEvenement(m,jour){return m.semaine.ev.find(e=>e.j===jour)||null;}
function mgmtSeTitre(m,i){const e=mgmtSeEvenement(m,MGMT_SE_JOURS[i]);if(e){const f=MGMT_SEMAINE_FAMILLES.find(x=>x.id===e.f);return f?f.id.replace(/_/g,' ').toLocaleUpperCase('fr'):'';}return MGMT_SE_TITRES[i].replace('{ville}',esc(m.ville||'la ville'));}
function mgmtSeCarte(m){return (m.card.main||[]).concat(m.card.prelims||[]).map(f=>{const a=mgmtFighterById(m,f.a),b=mgmtFighterById(m,f.b);return `<div class="se-combat">${esc(a&&a.name||'À déterminer')} <span>—</span> ${esc(b&&b.name||'À déterminer')}</div>`;}).join('');}
function mgmtSeChoisir(i,r){const m=G&&G.mgmt,e=m&&m.semaine&&m.semaine.ev[i];if(!e||!e.p||e.r||!['A','B'].includes(r)||e.f!=='poids')return false;const f=mgmtFighterById(m,e.a),adv=mgmtFighterById(m,e.b);if(!f||!adv)return false;if(r==='B'&&(m.effectifs!==1||!mgmtCardFull(m)||(m.facts||[]).some(x=>x&&x.k==='retrait'&&x.c===m.cycle)))return false;const bourse=mgmtPurse(f,'main');if(r==='A'){const amende=Math.ceil(bourse*.2);m.treasury-=amende;mgmtAddFact(m,{c:m.cycle,k:'semaine_poids',a:f.id,b:adv.id,montant:amende});e.amende=amende;}e.r=r;saveMgmt();render();return true;}
function scr_mgmt_semaine(){
  const m=G&&G.mgmt;
  if(!m||!m.semaine||!mgmtSemaineValide(m.semaine))return scr_mgmt_accueil();
  const index=Math.max(0,Math.min(5,MGMT_SE_JOUR)),jour=MGMT_SE_JOURS[index],e=mgmtSeEvenement(m,jour),f=e&&MGMT_SEMAINE_FAMILLES.find(x=>x.id===e.f);
  const titre=e?(e.f==='poids'?'LA PESÉE':f.id.replace(/_/g,' ').toLocaleUpperCase('fr')):MGMT_SE_TITRES[index].replace('{ville}',esc(m.ville||'la ville'));
  const texte=e?mgmtSemaineTexte(m,e):titre;
  const vus=new Set(),brefs=m.semaine.ev.filter(x=>x.j!==jour).filter(x=>{const cle=x.f+'|'+(x.a||'');if(vus.has(cle))return false;vus.add(cle);return true;}).slice(0,3);
  const evHtml=brefs.length?brefs.map(x=>`<div class="se-bref">${mgmtSemaineTexte(m,x)}</div>`).join(''):'<div class="se-bref">Rien d’autre cette semaine.</div>';
  const peutRetirer=m.effectifs===1&&mgmtCardFull(m)&&!(m.facts||[]).some(x=>x&&x.k==='retrait'&&x.c===m.cycle);
  const choix=e&&e.p&&!e.r&&e.f==='poids'?`<div class="se-choix"><button class="se-option" onclick="CL.mgmtSemaineChoix('A')"><b>A</b><strong>LE COMBAT A LIEU</strong><span>Poids intermédiaire · 20 % de la bourse versés à l’adversaire ; la presse parle d’un combat déséquilibré.</span></button><button class="se-option" ${peutRetirer?'':'disabled'} onclick="CL.mgmtSemaineChoix('B')"><b>B</b><strong>ANNULER LE COMBAT</strong><span>L’adversaire est payé quand même · la carte perd ce combat.</span></button></div>`:'';
  const frise=MGMT_SE_JOURS.map((d,i)=>`<button class="se-jour${i===index?' se-actif':''}" onclick="CL.mgmtSemaineJour(${i})"><b>${d.toLocaleUpperCase('fr')}</b><span>${i===0?esc('Arrivée à '+(m.ville||'la ville')):esc(['','Journée des médias','Conférence de presse','Face-à-face','La pesée','La soirée'][i])}</span>${mgmtSeEvenement(m,d)?`<small>${esc(mgmtSeTitre(m,i))}</small>`:''}</button>`).join('');
  const heure=e&&e.f==='poids'?'11 H 40 · ':'';
  const html=`<main class="mf-contenu se-ecran"><nav class="se-frise" aria-label="La semaine">${frise}</nav><div class="se-colonnes"><section class="se-principal">${mfPanneau(`<div class="se-surtitre">${jour.toLocaleUpperCase('fr')} · ${heure}${titre}</div><h1 class="se-titre">${titre}</h1><div class="se-texte">${texte}</div>${choix}`,'normal','se-panneau')}<section class="se-principal">${mfPanneau(`<h2>La semaine en bref</h2>${evHtml}`,'normal','se-panneau')}</section></section><aside class="se-cote">${mfPanneau(`<h2>La carte de samedi</h2>${mgmtSeCarte(m)}`,'normal','se-panneau')}</aside></div></main>`;
  return mfEcran(html,'La semaine');
}
SCREENS.mgmt_semaine=scr_mgmt_semaine;
Object.assign(CL,{mgmtSemaineJour(i){MGMT_SE_JOUR=(i+6)%6;render();},mgmtSemaineDeplacer(d){MGMT_SE_JOUR=(MGMT_SE_JOUR+d+6)%6;render();},mgmtSemaineChoix(r){const m=G&&G.mgmt,e=m&&m.semaine&&m.semaine.ev.findIndex(x=>x.j===MGMT_SE_JOURS[MGMT_SE_JOUR]);if(e>=0)mgmtSeChoisir(e,r);}});
keysRegister('mgmt_semaine',{ArrowLeft(){CL.mgmtSemaineDeplacer(-1);},ArrowRight(){CL.mgmtSemaineDeplacer(1);},a(){CL.mgmtSemaineChoix('A');},A(){CL.mgmtSemaineChoix('A');},'1'(){CL.mgmtSemaineChoix('A');},b(){CL.mgmtSemaineChoix('B');},B(){CL.mgmtSemaineChoix('B');},'2'(){CL.mgmtSemaineChoix('B');},Escape(){CL.go('mgmt_accueil');}});
