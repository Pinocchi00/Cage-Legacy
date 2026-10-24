"use strict";
/* ==== [ANCRE: POSTE_ECRAN_REGISTRE] — Monde lot 48 T1 ==== */
const MGMT_POSTE_ONGLETS=[];
let mgmtPosteOngletActif=0;
let mgmtPosteBilanLu=false;
function mgmtPosteOngletAjouter(id,titre,rendu){
  if(!/^[a-z0-9_-]+$/.test(id)||typeof titre!=='string'||typeof rendu!=='function') throw new TypeError('Onglet de poste invalide');
  const precedent=MGMT_POSTE_ONGLETS.findIndex(o=>o.id===id);
  if(precedent>=0) MGMT_POSTE_ONGLETS.splice(precedent,1);
  MGMT_POSTE_ONGLETS.push({id,titre,rendu});
}
function mgmtPosteTexteObjectif(o){return mgmtPosteObjectifTexte(o);}
function mgmtPosteRendu(m){
 const p=m.poste, phrases=mgmtPosteNiveau(p.conf), hash=String(m.graine||'').split('').reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7), citation=phrases.banque[hash%3].texte;
 const date=mgmtPosteDateTexte(p.fin)+' '+new Date(MGMT_CALENDRIER_DEBUT+p.fin*86400000).getUTCFullYear();
  const fil=[...(p.hist||[]).map(h=>({c:h.s,note:h.note})),...(m.hist||[]).slice(-3)].slice(-3);
   const offres=(m.offres||[]).filter(o=>!o.refuse);
   const offresHtml=offres.length?offres.map(o=>`<div class="po2-offre"><p>${esc((mgmtOrgParId(o.orgId)||{}).nom||o.orgId)} · ${esc(o.poste)} · ${esc(mgmtEuros(o.salaire/1000))} / MOIS</p><p>« ${esc(o.texte)} »</p>${o.raisons.map(r=>`<p>${esc(r)}</p>`).join('')}<button type="button" class="po2-action" onclick="mgmtOffreRefuser(G.mgmt,${(m.offres||[]).indexOf(o)});saveMgmt();CL.render()">REFUSER</button></div>`).join(''):'<p>Personne ne t’a encore approché.</p>';
    const attente=m.offres&&m.offres.some(o=>!o.refuse)?'<button type="button" class="po2-action" onclick="mgmtOffresAttendre(G.mgmt);saveMgmt();CL.render()">ATTENDRE</button>':'';
    return `<section class="po2-grid"><article class="po2-card"><h2>TON POSTE</h2><p>CONTRAT · 1 AN</p><p>Fin du contrat · ${esc(date)}</p><strong>${esc(mgmtEuros(p.salaire/1000))} / MOIS</strong><p>Ta réputation</p><h3>LES OFFRES</h3>${offresHtml}${attente}<h3>CE QU’EN PENSE LE PATRON</h3><p>${esc(mgmtPostePatron(m))}</p><strong>${esc(phrases.niveau.toUpperCase())}</strong><p>« ${esc(citation)} »</p></article><article class="po2-card"><h2>DERNIÈRES SOIRÉES</h2>${fil.map(h=>`<p>SOIRÉE ${esc(h.c||h.s||'')} · ${esc(h.lieu||h.note||'La soirée est passée.')}</p>`).join('')}<h3>PROCHAIN RENDEZ-VOUS</h3><p>${p.mi?'Rendez-vous de mi-saison passé':'MI-SAISON · '+esc(mgmtPosteDateTexte(p.debut+MGMT_POSTE.mi))}</p><h3>TES OBJECTIFS · LA SAISON</h3>${p.obj.map(o=>`<p>${esc(mgmtPosteTexteObjectif(o))} — ${esc(o.e==='tenu'?'TENU':o.e==='fait'?'FAIT':'EN COURS')} · ${esc(mgmtPosteValeurTexte(m,o))}</p>`).join('')}</article></section>`;
}
mgmtPosteOngletAjouter('poste','TON POSTE',mgmtPosteRendu);
function scr_mgmt_poste(){const m=G&&G.mgmt;if(!m||!m.poste||!MGMT_POSTE_ONGLETS.length)return '';const actif=MGMT_POSTE_ONGLETS[Math.max(0,Math.min(mgmtPosteOngletActif,MGMT_POSTE_ONGLETS.length-1))];const tabs=MGMT_POSTE_ONGLETS.map((o,n)=>`<button type="button" class="po2-tab" aria-selected="${o.id===actif.id}" onclick="mgmtPosteOngletActif=${n};CL.render()">${esc(o.titre)}</button>`).join('');return mfEcran(`<main class="mf-contenu po2-scene"><nav class="po2-tabs" aria-label="Rubriques du bureau">${tabs}</nav>${actif.rendu(m)}</main>`,{barre:'jeu',courant:'accueil',m,plaque:'TON POSTE',droite:mgmtOrgNom(m),touches:[{ks:['Échap'],t:'Accueil',onclick:"CL.go('mgmt_accueil')"},{ks:['Tab','Maj+Tab'],t:'Onglet'}]});}
function scr_mgmt_poste_bilan(){const m=G&&G.mgmt;if(!m||!m.poste)return '';const b=mgmtPosteBilan(m),titre=b.issue==='prolonge-augmente'?'PROLONGÉ':b.issue==='prolonge-condition'?'SOUS CONDITION':'REMERCIÉ',texte=mgmtPosteNiveau(m.poste.conf).mi;const action=b.issue==='renvoi'?'<button type="button" class="po2-action" onclick="mgmtOffresCreer(G.mgmt);CL.go(\'mgmt_poste\')">CONTINUER</button>':`<button type="button" class="po2-action" onclick="mgmtPosteRenouveler(G.mgmt,'${escJsAttr(b.issue)}');CL.go('mgmt_poste')">RESTER</button>`;return mfEcran(`<main class="po2-bilan"><h1>${titre}</h1><p class="po2-citation">« ${esc(texte)} »</p><p>DURÉE · ${b.duree===365?'1 AN':esc(String(Math.round(b.duree/365))+' ANS')}</p><p>SALAIRE · ${esc(mgmtEuros(b.salaire/1000))} / MOIS</p><p>La saison : ${b.objTenus} objectifs sur ${b.objTotal}</p>${action}</main>`,{barre:'jeu',courant:'accueil',m,plaque:'BILAN DU PATRON',droite:mgmtOrgNom(m),touches:[{ks:['Entrée'],t:b.issue==='renvoi'?'Continuer':'Rester'}]});}
/* ==== [FIN ANCRE] ==== */
