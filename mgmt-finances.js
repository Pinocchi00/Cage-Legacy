"use strict";
/* ==== [ANCRE: MGMT_BRIEF_LOT8_FINANCES] — Brief du 06/10/2026, lot 8 : l'écran Finances (planche « Management —
   Finances »). Six cartes : en caisse, dernière soirée, prochaine soirée (bourses déjà engagées sur la carte en cours
   de composition), découvert autorisé, bourses versées soirée par soirée, fins de contrat. ← → choisissent, Entrée
   montre le détail. Les montants se lisent en euros (mgmtEuros : 1 k$ de la simulation = 1 000 €). Les fins de contrat
   n'existent pas avant le lot 9 : « — ». Aucune règle ni donnée nouvelle : tout se lit dans la partie. ==== */

let MGMT_FINANCES={i:0,detail:false};
const MGMT_FINANCES_CARTES=['En caisse','Dernière soirée','Prochaine soirée','Découvert autorisé','Bourses versées','Fins de contrat'];

/** Les bourses déjà engagées sur la carte en cours de composition, en k$ : les cachets des combats posés. Pur. */
function mgmtFinancesEngagees(m){
  const poses=mgmtCardFights(m).map(f=>({a:f.a,b:f.b,slot:f.slot==='main'?'main':'prelim'}));
  return {k:mgmtPurses(m,poses),n:poses.length,sur:(m.card.sizeMain||MGMT_MAIN_SIZE)+(m.card.sizePrelims||MGMT_PRELIM_SIZE)};
}

/** Les six cartes : titre, grand chiffre, deux lignes, et le détail. Pur sur la partie. */
function mgmtFinancesCartes(m){
  const f=m.lastEvent&&m.lastEvent.finance, org=mgmtOrgNom(m), joues=m.eventsPlayed||0;
  const eng=mgmtFinancesEngagees(m), cap=mgmtOverdraftCap(m), debut=m.treasury<0?-m.treasury:0;
  const recettes=f?f.ticketing+f.tv:0, depenses=f?f.purses+f.bonuses+(f.location||0):0;
  const comptes=Array.isArray(m.comptes)?m.comptes.slice(-5):[];
  const bourses=comptes.map(c=>c.purses+c.bonuses);
  const lieu=mgmtAgendaActif(m)&&m.cal.prochaines[0]?mgmtSalleParId(m,m.cal.prochaines[0].salle):null;
  return [
    {t:'En caisse',v:mgmtEuros(m.treasury),l:[joues>0?`Après ${org} Fight Night ${joues}`:'Avant la première soirée',m.treasury<0?'La caisse est à découvert':' '],
      d:[['En caisse',mgmtEuros(m.treasury)]].concat(comptes.slice().reverse().map(c=>[`Soirée ${c.n}`,(c.recette>=0?'+ ':'− ')+mgmtEuros(Math.abs(c.recette))]))},
    {t:'Dernière soirée',v:f?(f.recette>=0?'+ ':'− ')+mgmtEuros(Math.abs(f.recette)):'—',l:f?[`Recettes : ${mgmtEuros(recettes)}`,`Dépenses : ${mgmtEuros(depenses)}`]:['Aucune soirée jouée',' '],
      d:f?[['Billetterie',mgmtEuros(f.ticketing)],['Droits du diffuseur',mgmtEuros(f.tv)],['Cachets',mgmtEuros(-f.purses)],['Bonus de victoire',mgmtEuros(-f.bonuses)]]
        .concat(Number.isFinite(f.location)?[['Location de la salle',mgmtEuros(-f.location)]]:[])
        .concat(Number.isFinite(f.spectateurs)?[['Salle',`${f.salle} · ${f.spectateurs} spectateurs sur ${f.capacite}`],['Le public',f.satisfaction>=MGMT_SATISFAIT_SEUIL?'Satisfait':'Déçu']]:[]):[['Rien encore','—']]},
    {t:'Prochaine soirée',v:mgmtEuros(eng.k),l:['Bourses déjà engagées',`${eng.n} combat${eng.n>1?'s':''} composé${eng.n>1?'s':''} sur ${eng.sur}`],
      d:[['Bourses engagées',mgmtEuros(eng.k)],['Combats composés',`${eng.n} sur ${eng.sur}`]].concat(lieu?[['Salle',`${lieu.nom} · ${lieu.capacite} places`],['Location',mgmtEuros(mgmtLocation(lieu))]]:[])},
    {t:'Découvert autorisé',v:mgmtEuros(cap),l:['Pour un remplaçant de dernière minute',debut>0?`Utilisé : ${mgmtEuros(debut)}`:'Rien d’utilisé pour l’instant'],
      d:[['Découvert autorisé',mgmtEuros(cap)],['Utilisé',mgmtEuros(debut)],['Règle','La dernière recette, lissée sur deux soirées, jamais négative']]},
    {t:'Bourses versées',bars:bourses,numeros:comptes.map(c=>c.n),l:['En milliers d’euros, par soirée'],
      d:comptes.length?comptes.slice().reverse().map(c=>[`Soirée ${c.n}`,mgmtEuros(c.purses+c.bonuses)]):[['Aucune soirée jouée','—']]},
    {t:'Fins de contrat',v:'—',l:['Aucun contrat suivi pour l’instant',' '],d:[['Contrats','Pas encore suivis']],jaune:false},
  ];
}

function mgmtFinancesCarteHtml(c,i,choisie){
  let corps;
  if(c.bars){
    const max=Math.max(1,...c.bars);
    corps=`<div class="mf-fin-barres">${c.bars.map((b,k)=>`<div class="mf-fin-barre"><div class="mf-fin-b-v">${esc(Math.round(b))} k</div><div class="mf-fin-b-h${k===c.bars.length-1?' last':''}" style="height:${Math.max(4,Math.round(150*b/max))}px"></div><div class="mf-fin-b-n">${esc(c.numeros[k])}</div></div>`).join('')}</div>`
      +`<div class="mf-fin-note">${esc(c.l[0])}</div>`;
  }else{
    corps=`<div class="mf-fin-v" style="font-size:${mfCorps(c.v,450,104,40)}px">${esc(c.v)}</div><div class="mf-fin-ls">${c.l.map(x=>`<div>${esc(x)}</div>`).join('')}</div>`;
  }
  return mfPanneau(`<div class="mf-fin-t">${esc(c.t.toUpperCase())}</div><div class="mf-fin-corps">${corps}</div>`,choisie?'choisi':'normal','mf-fin-p',
    `role="button" tabindex="0" aria-pressed="${choisie}" onclick="CL.mgmtFinancesVa(${i})"`);
}

function scr_mgmt_finances(){
  if(!G||!G.mgmt) return scr_mgmt_bureau();
  const m=G.mgmt, F=MGMT_FINANCES, cartes=mgmtFinancesCartes(m);
  if(!Number.isSafeInteger(F.i)||F.i<0||F.i>=cartes.length) F.i=0;
  let contenu;
  if(F.detail){
    const c=cartes[F.i];
    contenu=`<main class="mf-contenu mf-finances"><div class="mf-fin-detail">${mfPanneau(`<div class="mf-fin-t">${esc(c.t.toUpperCase())}</div><div class="mf-fin-lignes">${c.d.map(([a,b])=>mfLigne(a,b)).join('')}</div>`,'normal','mf-fin-p')}</div></main>`;
  }else{
    contenu=`<main class="mf-contenu mf-finances"><div class="mf-fin-grille">${cartes.map((c,i)=>mgmtFinancesCarteHtml(c,i,i===F.i)).join('')}</div></main>`;
  }
  return mfEcran(contenu,{barre:'jeu',courant:'finances',m,plaque:'Finances',libelle:'',droite:`${mgmtOrgNom(m)} Fight Night ${(m.eventsPlayed||0)+1}`,
    touches:F.detail?[{ks:['Échap'],t:'Fermer le détail',onclick:'CL.mgmtFinancesFerme()'},{ks:['A','E'],t:'Section'}]
      :[{ks:['Échap'],t:'Retour',onclick:"CL.go('mgmt_bureau')"},{ks:['←','→'],t:'Choisir'},{ks:['A','E'],t:'Section'},
        {ks:['Entrée'],t:'Voir le détail',jaune:true,onclick:'CL.mgmtFinancesDetail()'}]});
}
SCREENS.mgmt_finances=scr_mgmt_finances;

Object.assign(CL,{
  mgmtFinancesVa(i){ if(Number.isSafeInteger(i)&&i>=0&&i<MGMT_FINANCES_CARTES.length){ MGMT_FINANCES.i=i; render(); } },
  mgmtFinancesBouge(d){ const n=MGMT_FINANCES_CARTES.length; MGMT_FINANCES.i=((MGMT_FINANCES.i||0)+d+n)%n; render(); },
  mgmtFinancesDetail(){ MGMT_FINANCES.detail=true; render(); },
  mgmtFinancesFerme(){ MGMT_FINANCES.detail=false; render(); },
});
keysRegister('mgmt_finances',{
  ArrowLeft(){ if(!MGMT_FINANCES.detail) CL.mgmtFinancesBouge(-1); },
  ArrowRight(){ if(!MGMT_FINANCES.detail) CL.mgmtFinancesBouge(1); },
  ArrowUp(){ if(!MGMT_FINANCES.detail) CL.mgmtFinancesBouge(-3); },
  ArrowDown(){ if(!MGMT_FINANCES.detail) CL.mgmtFinancesBouge(3); },
  Enter(){ if(!MGMT_FINANCES.detail) CL.mgmtFinancesDetail(); },
  Escape(){ if(MGMT_FINANCES.detail) CL.mgmtFinancesFerme(); else CL.go('mgmt_bureau'); },
});
/* ==== [FIN ANCRE] ==== */
