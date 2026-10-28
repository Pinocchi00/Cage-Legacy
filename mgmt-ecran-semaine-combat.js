"use strict";
/* ==== [ANCRE: P6_T2_ECRAN_SEMAINE] — Monde lot 41 T2 ==== */
const MGMT_SE_JOURS=['lundi','mardi','mercredi','jeudi','vendredi','samedi'];
const MGMT_SE_TITRES=['Arrivée à {ville}','Journée des médias','Conférence de presse','Face-à-face','La pesée','La soirée'];
let MGMT_SE_JOUR=0;
function mgmtSeEvenement(m,jour){return m.semaine.ev.find(e=>e.j===jour)||null;}
function mgmtSeTitre(m,i){const e=mgmtSeEvenement(m,MGMT_SE_JOURS[i]);if(e){const f=MGMT_SEMAINE_FAMILLES.find(x=>x.id===e.f);return f?f.id.replace(/_/g,' ').toLocaleUpperCase('fr'):'';}return MGMT_SE_TITRES[i].replace('{ville}',esc(m.ville||'la ville'));}
/* ==== [ANCRE: SEMAINE_CONTEXTE_20261028] — Anthony : informations utiles et conséquences lisibles ==== */
function mgmtSeContexteHtml(m,e){
  const main=m.card?.main||[],prelims=m.card?.prelims||[],combats=main.concat(prelims),c=e?combats.find(c=>c.a===e.a||c.b===e.a):main[0];
  const a=mgmtFighterById(m,e?.a||c?.a),b=mgmtFighterById(m,e?.b||c?.b);
  if(!a||!b)return '';
  const etiquette=c?(main.includes(c)?main.indexOf(c)===0?'Combat principal':'Carte principale':'Carte préliminaire'):'Combat concerné';
  return `<div class="se-duel"><div><b>${esc(etiquette)}</b><span>${esc([a.div?mgmtDivisionLabel(a.div):'',c?.rounds?c.rounds+' rounds':''].filter(Boolean).join(' · '))}</span></div><strong>${esc(a.name)} <i>—</i> ${esc(b.name)}</strong></div>`;
}
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
  const titre=e?(e.f==='poids'?'LA PESÉE':f.id.replace(/_/g,' ').toLocaleUpperCase('fr')):MGMT_SE_TITRES[index].replace('{ville}',m.ville||'la ville');
  const texte=e?mgmtSemaineTexte(m,e):titre;
  const vus=new Set(),brefs=m.semaine.ev.filter(x=>x!==e).filter(x=>{const cle=x.f+'|'+(x.a||'');if(vus.has(cle))return false;vus.add(cle);return true;});
  const ton=x=>MGMT_SEMAINE_FAMILLES.find(f=>f.id===x.f)?.ton||'neutre';
  const evHtml=brefs.length?brefs.map(x=>`<div class="se-bref" data-ton="${esc(ton(x))}"><i aria-hidden="true"></i><div><small>${esc(x.j.toLocaleUpperCase('fr'))}${x.p?x.r?' · DÉCISION PRISE':' · À DÉCIDER':''}</small>${mgmtSemaineTexte(m,x)}</div></div>`).join(''):'<div class="se-bref">Rien d’autre cette semaine.</div>';
  const peutRetirer=m.effectifs===1&&mgmtCardFull(m)&&!(m.facts||[]).some(x=>x&&x.k==='retrait'&&x.c===m.cycle);
  const fautif=e&&e.f==='poids'&&mgmtFighterById(m,e.a);
  const penalite=fautif?`<span><i class="se-puce" aria-hidden="true"></i>Pénalité : ${esc(mgmtEuros(Math.ceil(mgmtPurse(fautif,'main')*.2)))} (20 % de sa bourse).</span>`:'';
  const decision=e&&MGMT_SEMAINE_CHOIX[e.f];
  const choix=e&&e.p?(e.r?`<div class="se-decision-prise"><b>DÉCISION PRISE · ${esc(decision?.[e.r]?.titre||e.r)}</b>${decision?.[e.r]?`<span>${esc(decision[e.r].texte)}</span>`:''}${e.amende?`<span>Pénalité appliquée : ${esc(mgmtEuros(e.amende))}</span>`:''}</div>`:(()=>{const d=decision;return d?`<div class="se-choix"><button class="se-option" onclick="CL.mgmtSemaineChoix('A')"><div class="se-option-tete"><strong>${esc(d.A.titre)}</strong><b>A</b></div><span><i class="se-puce" aria-hidden="true"></i>${esc(d.A.texte)}</span>${penalite}</button><button class="se-option" ${peutRetirer?'':'disabled'} onclick="CL.mgmtSemaineChoix('B')"><div class="se-option-tete"><strong>${esc(d.B.titre)}</strong><b>B</b></div><span><i class="se-puce" aria-hidden="true"></i>${esc(d.B.texte)}</span>${!peutRetirer?'<span class="se-indisponible">Le retrait n’est pas disponible pour cette carte.</span>':''}</button></div>`:'';})()):'';
  const frise=MGMT_SE_JOURS.map((d,i)=>`<button class="se-jour${i===index?' se-actif':''}${i>index?' se-futur':''}" onclick="CL.mgmtSemaineJour(${i})"><i class="se-octo" aria-hidden="true">${i<index?'<svg width="22" height="22" viewBox="0 0 22 22"><path d="m3 11 5 5L19 5" fill="none" stroke="currentColor" stroke-width="4"/></svg>':''}</i><b>${d.toLocaleUpperCase('fr')}</b><span>${i===0?esc('Arrivée à '+(m.ville||'la ville')):esc(['','Journée des médias','Conférence de presse','Face-à-face','La pesée','La soirée'][i])}</span>${mgmtSeEvenement(m,d)?`<small>${esc(mgmtSeTitre(m,i))}</small>`:''}</button>`).join('');
  const heure=e&&e.f==='poids'?'11 H 40 · ':'';
  const acteur=e&&mgmtFighterById(m,e.a),titrePrincipal=e&&e.f==='poids'&&acteur?mfNet(acteur.last||acteur.name)+' MANQUE LE POIDS':titre;
  const html=`<main class="mf-contenu se-ecran"><nav class="se-frise" aria-label="La semaine">${frise}</nav><div class="se-colonnes"><section class="se-principal" data-ton="${esc(e?ton(e):'neutre')}">${mfPanneau(`<div class="se-surtitre">${jour.toLocaleUpperCase('fr')} · ${heure}${esc(titre)}</div><h1 class="se-titre" style="font-size:${mfCorps(titrePrincipal,910,76,22)}px">${esc(titrePrincipal)}</h1><div class="se-texte">${texte}</div>${mgmtSeContexteHtml(m,e)}${choix}`,'normal','se-panneau')}</section><aside class="se-cote">${mfPanneau(`<div class="se-bref-tete"><h2>La semaine en bref</h2><i class="se-trait" aria-hidden="true"></i></div><div class="se-brefs">${evHtml}</div>${mfBouton('La carte de samedi',{touche:'C',onclick:"CL.go('mgmt_carte')"})}`,'normal','se-panneau')}</aside></div></main>`;
   const org=mgmtOrgNom(m);
   return mfEcran(html,{barre:'jeu',courant:'accueil',m,plaque:'La semaine du combat',droite:`${org} Fight Night ${(m.eventsPlayed||0)+1}`,touches:[{ks:['←','→'],t:'Jour de la semaine'},...(e?.p&&!e.r&&decision?[{ks:['A'],t:decision.A.titre,jaune:true,onclick:"CL.mgmtSemaineChoix('A')"},...(peutRetirer?[{ks:['B'],t:decision.B.titre,onclick:"CL.mgmtSemaineChoix('B')"}]:[])]:[]),...(acteur?[{ks:['F'],t:'Fiche du combattant',onclick:'CL.mgmtSemaineFiche()'}]:[]),{ks:['Échap'],t:'Accueil'}]});
}
SCREENS.mgmt_semaine=scr_mgmt_semaine;
Object.assign(CL,{mgmtSemaineJour(i){MGMT_SE_JOUR=(i+6)%6;render();},mgmtSemaineDeplacer(d){MGMT_SE_JOUR=(MGMT_SE_JOUR+d+6)%6;render();},mgmtSemaineChoix(r){const m=G&&G.mgmt,e=m&&m.semaine&&m.semaine.ev.findIndex(x=>x.j===MGMT_SE_JOURS[MGMT_SE_JOUR]);if(e>=0)mgmtSeChoisir(e,r);},mgmtSemaineFiche(){const m=G&&G.mgmt,e=m&&m.semaine&&mgmtSeEvenement(m,MGMT_SE_JOURS[MGMT_SE_JOUR]);if(e&&mgmtFighterById(m,e.a))CL.mgmtFiche(e.a);}});
keysRegister('mgmt_semaine',{ArrowLeft(){CL.mgmtSemaineDeplacer(-1);},ArrowRight(){CL.mgmtSemaineDeplacer(1);},a(){CL.mgmtSemaineChoix('A');},A(){CL.mgmtSemaineChoix('A');},'1'(){CL.mgmtSemaineChoix('A');},b(){CL.mgmtSemaineChoix('B');},B(){CL.mgmtSemaineChoix('B');},'2'(){CL.mgmtSemaineChoix('B');},c(){CL.go('mgmt_carte');},C(){CL.go('mgmt_carte');},f(){CL.mgmtSemaineFiche();},F(){CL.mgmtSemaineFiche();},Escape(){CL.go('mgmt_accueil');}});
