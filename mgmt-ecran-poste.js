"use strict";
/* ==== [ANCRE: POSTE_ECRAN_REGISTRE] — Monde lot 48 T1 ==== */
const MGMT_POSTE_ONGLETS=[];
let mgmtPosteOngletActif=0;
function mgmtPosteOngletAjouter(id,titre,rendu){
  if(!/^[a-z0-9_-]+$/.test(id)||typeof titre!=='string'||typeof rendu!=='function') throw new TypeError('Onglet de poste invalide');
  const precedent=MGMT_POSTE_ONGLETS.findIndex(o=>o.id===id);
  if(precedent>=0) MGMT_POSTE_ONGLETS.splice(precedent,1);
  MGMT_POSTE_ONGLETS.push({id,titre,rendu});
}
function mgmtPosteTexteObjectif(o){return mgmtPosteObjectifTexte(o);}
function mgmtPosteRendu(m){
 const p=m.poste, phrases=MGMT_POSTE.seuils.phrases[p.conf], hash=String(m.graine||'').split('').reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7), citation=phrases.banque[hash%3].texte;
 const date=mgmtPosteDateTexte(p.fin);
 return `<section class="po2-grid"><article class="po2-card"><h2>TON POSTE</h2><p>CONTRAT · 1 AN</p><p>Fin du contrat · ${esc(date)}</p><strong>${esc(mgmtEuros(p.salaire/1000))} / MOIS</strong><p>Ta réputation</p><h3>LES OFFRES</h3><p>Personne ne t’a encore approché.</p><h3>CE QU’EN PENSE LE PATRON</h3><p>${esc(mgmtPostePatron(m))}</p><strong>${esc(phrases.niveau.toUpperCase())}</strong><p>« ${esc(citation)} »</p></article><article class="po2-card"><h2>DERNIÈRES SOIRÉES</h2>${(p.hist.slice(-3).concat((m.hist||[]).slice(-3))).slice(-3).map(h=>`<p>SOIRÉE ${esc(h.s||'')} · ${esc(h.note||'')}</p>`).join('')}<h3>PROCHAIN RENDEZ-VOUS</h3><p>${p.mi?'Rendez-vous de mi-saison passé':'MI-SAISON · '+esc(mgmtPosteDateTexte(p.debut+MGMT_POSTE.mi))}</p><h3>TES OBJECTIFS · LA SAISON</h3>${p.obj.map(o=>`<p>${esc(mgmtPosteTexteObjectif(o))} — ${esc(o.e==='tenu'?'TENU':o.e==='fait'?'FAIT':'EN COURS')} · ${esc(mgmtPosteValeurTexte(m,o))}</p>`).join('')}</article></section>`;
}
mgmtPosteOngletAjouter('poste','TON POSTE',mgmtPosteRendu);
function scr_mgmt_poste(){const m=G&&G.mgmt;if(!m||!m.poste)return '';const i=MGMT_POSTE_ONGLETS.findIndex(o=>o.id==='poste'), tabs=MGMT_POSTE_ONGLETS.map((o,n)=>`<button class="po2-tab" aria-selected="${n===i}" onclick="mgmtPosteOngletActif=${n};CL.render()">${esc(o.titre)}</button>`).join('');return mfEcran(`<nav class="po2-tabs">${tabs}</nav>${MGMT_POSTE_ONGLETS[Math.max(0,i)].rendu(m)}`,{barre:'jeu',courant:'accueil',m,plaque:'TON POSTE',droite:mgmtOrgNom(m),touches:[{ks:['Échap'],t:'Accueil',onclick:"CL.go('mgmt_accueil')"},{ks:['Tab','Maj+Tab'],t:'Onglet'}]});}
/* ==== [FIN ANCRE] ==== */
