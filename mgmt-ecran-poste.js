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
 /* ==== [ANCRE: MONDE_LOT58_T1_CHOC_ANNUEL_REPRISE] — Monde lot 58 T1 ====
    Une réponse précédente ne doit pas bloquer les propositions des années
    suivantes : la porte annuelle est tenue par mgmtChocProposition. ==== */
 if(m.mondeVivant&&(!m.choc||!mgmtChocValide(m.choc)||m.choc.annee!==mgmtChocAnnee(m)))mgmtChocProposition(m);
 const p=m.poste, phrases=mgmtPosteNiveau(p.conf), hash=String(m.graine||'').split('').reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7), citation=phrases.banque[hash%3].texte;
 const date=mgmtPosteDateTexte(p.fin)+' '+new Date(MGMT_CALENDRIER_DEBUT+p.fin*86400000).getUTCFullYear();
  const fil=[...(p.hist||[]).map(h=>({c:h.s,note:h.note})),...(m.hist||[]).slice(-3)].slice(-3);
   const offres=(m.offres||[]).filter(o=>!o.refuse);
   const offresHtml=offres.length?offres.map(o=>`<div class="po2-offre"><p>${esc((mgmtOrgParId(o.orgId)||{}).nom||o.orgId)} · ${esc(o.poste)} · ${esc(mgmtEuros(o.salaire/1000))} / MOIS</p><p>« ${esc(o.texte)} »</p>${o.raisons.map(r=>`<p>${esc(r)}</p>`).join('')}<button type="button" class="po2-action" onclick="mgmtOffreRefuser(G.mgmt,${(m.offres||[]).indexOf(o)});saveMgmt();CL.render()">REFUSER</button></div>`).join(''):'<p>Personne ne t’a encore approché.</p>';
    const attente=m.offres&&m.offres.some(o=>!o.refuse)?'<button type="button" class="po2-action" onclick="mgmtOffresAttendre(G.mgmt);saveMgmt();CL.render()">ATTENDRE</button>':'';
     const choc=m.choc&&mgmtChocValide(m.choc),orgChoc=choc&&mgmtOrgParId(m.choc.orgId);
      const chocHtml=choc&&['recu','programme','termine','refuse'].includes(m.choc.etat)?`<h3>LE CHOC DES ORGANISATIONS</h3><p>${esc(orgChoc.nom)} · ${esc(m.choc.div)} · ${esc(mgmtPosteDateTexte(m.choc.jour))}</p><button type="button" class="po2-action" onclick="CL.go('mgmt_choc')">OUVRIR LE CHOC</button>`:'';
     const partenaires=(MGMT_ORGANISATIONS||[]).filter(o=>o.id!==mgmtPredecesseurOrgId(m)&&m.orgs&&m.orgs[o.id]);
     const proposer=(!choc||m.choc.annee!==mgmtChocAnnee(m))&&partenaires.length?`<h3>PROPOSER UN CHOC</h3>${partenaires.map(o=>`<button type="button" class="po2-action" onclick="mgmtChocProposer(G.mgmt,'${escJsAttr(o.id)}');saveMgmt();CL.render()">${esc(o.nom)}</button>`).join('')}`:'';
     return `<section class="po2-grid"><article class="po2-card"><h2>TON POSTE</h2><p>CONTRAT · 1 AN</p><p>Fin du contrat · ${esc(date)}</p><strong>${esc(mgmtEuros(p.salaire/1000))} / MOIS</strong><p>Ta réputation</p>${chocHtml}${proposer}<h3>LES OFFRES</h3>${offresHtml}${attente}<h3>CE QU’EN PENSE LE PATRON</h3><p>${esc(mgmtPostePatron(m))}</p><strong>${esc(phrases.niveau.toUpperCase())}</strong><p>« ${esc(citation)} »</p></article><article class="po2-card"><h2>DERNIÈRES SOIRÉES</h2>${fil.map(h=>`<p>SOIRÉE ${esc(h.c||h.s||'')} · ${esc(h.lieu||h.note||'La soirée est passée.')}</p>`).join('')}<h3>PROCHAIN RENDEZ-VOUS</h3><p>${p.mi?'Rendez-vous de mi-saison passé':'MI-SAISON · '+esc(mgmtPosteDateTexte(p.debut+MGMT_POSTE.mi))}</p><h3>TES OBJECTIFS · LA SAISON</h3>${p.obj.map(o=>`<p>${esc(mgmtPosteTexteObjectif(o))} — ${esc(o.e==='tenu'?'TENU':o.e==='fait'?'FAIT':'EN COURS')} · ${esc(mgmtPosteValeurTexte(m,o))}</p>`).join('')}</article></section>`;
}
mgmtPosteOngletAjouter('poste','TON POSTE',mgmtPosteRendu);
function scr_mgmt_poste(){const m=G&&G.mgmt;if(!m||!m.poste||!MGMT_POSTE_ONGLETS.length)return '';const actif=MGMT_POSTE_ONGLETS[Math.max(0,Math.min(mgmtPosteOngletActif,MGMT_POSTE_ONGLETS.length-1))];const tabs=MGMT_POSTE_ONGLETS.map((o,n)=>`<button type="button" class="po2-tab" aria-selected="${o.id===actif.id}" onclick="mgmtPosteOngletActif=${n};CL.render()">${esc(o.titre)}</button>`).join('');return mfEcran(`<main class="mf-contenu po2-scene"><nav class="po2-tabs" aria-label="Rubriques du bureau">${tabs}</nav>${actif.rendu(m)}</main>`,{barre:'jeu',courant:'accueil',m,plaque:'TON POSTE',droite:mgmtOrgNom(m),touches:[{ks:['Échap'],t:'Accueil',onclick:"CL.go('mgmt_accueil')"},{ks:['Tab','Maj+Tab'],t:'Onglet'}]});}
/* ==== [ANCRE: MONDE_LOT58_T1_ECRAN_CHOC] — Monde lot 58 T1 ==== */
function scr_mgmt_choc(){
 const m=G&&G.mgmt,c=m&&m.choc;if(!m||!mgmtChocValide(c))return '';
 const org=mgmtOrgParId(c.orgId),a=mgmtFighterById(m,c.a),b=mgmtFighterById(m,c.b),date=mgmtPosteDateTexte(c.jour);
 const decision=c.etat==='recu'?`<div class="ch3-actions"><button class="ch3-button" onclick="mgmtChocRepondre(G.mgmt,true);saveMgmt();CL.render()">ACCEPTER</button><button class="ch3-button" onclick="mgmtChocRepondre(G.mgmt,false);saveMgmt();CL.render()">REFUSER</button></div>`:c.etat==='programme'?'<p class="ch3-status">SOIRÉE PROGRAMMÉE</p>':`<p class="ch3-status">${esc(c.etat.toUpperCase())}</p>`;
 const html=`<main class="ch3-screen"><header class="ch3-head"><h1>LE CHOC DES ORGANISATIONS</h1><strong>${c.etat==='recu'?'PROPOSITION REÇUE':esc(c.etat.toUpperCase())}</strong><span>RÉPONSE AVANT LE ${esc(date)}</span></header><section class="ch3-fight"><div class="ch3-side"><b>${esc(a&&a.name||'Champion de Split')}</b><span>Split · ${esc(c.div)}</span></div><div class="ch3-category">CHAMPION<br>CONTRE<br>CHAMPION</div><div class="ch3-side ch3-opponent"><b>${esc(b&&b.name||'Champion invité')}</b><span>${esc(org&&org.nom||c.orgId)} · ${esc(c.div)}</span></div></section><section class="ch3-terms"><h2>${esc(org&&org.nom||c.orgId)}</h2><p>Une soirée commune, champion contre champion.</p><p>Date · ${esc(date)}</p>${decision}<button class="ch3-back" onclick="CL.go('mgmt_poste')">RETOUR AU POSTE</button></section></main>`;
 return mfEcran(html,{barre:'jeu',courant:'accueil',m,plaque:'LE CHOC DES ORGANISATIONS',droite:mgmtOrgNom(m),touches:[{ks:['Échap'],t:'Ton poste',onclick:"CL.go('mgmt_poste')"}]});
}
 function scr_mgmt_poste_bilan(){const m=G&&G.mgmt;if(!m||!m.poste)return '';const b=mgmtPosteBilan(m),titre=b.issue==='prolonge-augmente'?'PROLONGÉ':b.issue==='prolonge-condition'?'SOUS CONDITION':'REMERCIÉ',texte=mgmtPosteNiveau(m.poste.conf).mi;const action=b.issue==='renvoi'?'<button type="button" class="po2-action" onclick="mgmtOffresCreer(G.mgmt);CL.go(\'mgmt_poste\')">CONTINUER</button>':`<button type="button" class="po2-action" onclick="mgmtOffresCreer(G.mgmt);mgmtPosteRenouveler(G.mgmt,'${escJsAttr(b.issue)}');CL.go('mgmt_poste')">RESTER</button>`;return mfEcran(`<main class="po2-bilan"><h1>${titre}</h1><p class="po2-citation">« ${esc(texte)} »</p><p>DURÉE · ${b.duree===365?'1 AN':esc(String(Math.round(b.duree/365))+' ANS')}</p><p>SALAIRE · ${esc(mgmtEuros(b.salaire/1000))} / MOIS</p><p>La saison : ${b.objTenus} objectifs sur ${b.objTotal}</p>${action}</main>`,{barre:'jeu',courant:'accueil',m,plaque:'BILAN DU PATRON',droite:mgmtOrgNom(m),touches:[{ks:['Entrée'],t:b.issue==='renvoi'?'Continuer':'Rester'}]});}
/* ==== [FIN ANCRE] ==== */
