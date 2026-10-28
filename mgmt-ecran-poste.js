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
      const offresHtml=offres.length?offres.map(o=>`<div class="po2-offre"><p>${esc((mgmtOrgParId(o.orgId)||{}).nom||o.orgId)} · ${esc(o.poste)} · ${esc(mgmtEuros(o.salaire/1000))} / MOIS</p><p>« ${esc(o.texte)} »</p>${o.raisons.map(r=>`<p class="po2-raison">${esc(r)}</p>`).join('')}<button type="button" class="po2-action" onclick="mgmtOffreAccepter(G.mgmt,${(m.offres||[]).indexOf(o)})">ACCEPTER</button><button type="button" class="po2-action" onclick="mgmtOffreRefuser(G.mgmt,${(m.offres||[]).indexOf(o)});saveMgmt();CL.render()">REFUSER</button></div>`).join(''):'<p>Personne ne t’a encore approché. Knuckle Gate a demandé ton nom à la conférence de presse.</p>';
    const attente=m.offres&&m.offres.some(o=>!o.refuse)?'<button type="button" class="po2-action" onclick="mgmtOffresAttendre(G.mgmt);saveMgmt();CL.render()">ATTENDRE</button>':'';
     const choc=m.choc&&mgmtChocValide(m.choc),orgChoc=choc&&mgmtOrgParId(m.choc.orgId);
       const chocHtml=choc&&['recu','programme','termine','refuse'].includes(m.choc.etat)?mfPanneau(`<div class="po2-choc"><h3>LE CHOC DES ORGANISATIONS</h3><p>${esc(orgChoc.nom)} · ${esc(m.choc.div)} · ${esc(mgmtPosteDateTexte(m.choc.jour))}</p><button type="button" class="po2-action" onclick="CL.go('mgmt_choc')">OUVRIR LE CHOC</button></div>`,'normal','po2-choc-panel'):'';
     const partenaires=(MGMT_ORGANISATIONS||[]).filter(o=>o.id!==mgmtPredecesseurOrgId(m)&&m.orgs&&m.orgs[o.id]);
     const proposer=(!choc||m.choc.annee!==mgmtChocAnnee(m))&&partenaires.length?`<h3>PROPOSER UN CHOC</h3>${partenaires.map(o=>`<button type="button" class="po2-action" onclick="mgmtChocProposer(G.mgmt,'${escJsAttr(o.id)}');saveMgmt();CL.render()">${esc(o.nom)}</button>`).join('')}`:'';
      const reputation=phrases.niveau==='Il est ravi'?'QUI MONTE':phrases.niveau==='Il n’y croit plus'?'QUI BAISSE':'STABLE';
       const objectifs=p.obj.map(o=>{const valeur=mgmtPosteValeur(m,o),etat=o.e==='tenu'||o.e==='fait',pourcent=etat?100:(Number.isFinite(valeur)&&Number.isFinite(o.cible)&&o.cible>0?Math.max(0,Math.min(100,Math.round(valeur/o.cible*100))):0);return `<div class="po2-objectif"><div class="po2-objectif-entete"><span>${esc(mgmtPosteTexteObjectif(o))}</span><strong>${esc(mgmtPosteValeurTexte(m,o))} · ${esc(o.e==='tenu'?'TENU':o.e==='fait'?'FAIT':'EN COURS')}</strong></div><div class="po2-jauge"><i style="width:${pourcent}%"></i></div></div>`;}).join('');
        const historique=fil.slice(-4).map(h=>{const positif=h.note==='progres',libelle={progres:'Progression de la confiance',recul:'Recul de la confiance',stable:'Confiance inchangée'}[h.note]||'Évolution de la confiance';return `<div class="po2-evenement"><span class="po2-pastille" aria-hidden="true"></span><span class="po2-evenement-date">${esc(h.c?'SOIRÉE '+h.c:'JANVIER')}</span><span class="po2-evenement-fleche ${positif?'po2-evenement-positif':'po2-evenement-negatif'}" aria-hidden="true">${positif?'▲':'▼'}</span><div><strong>${esc(libelle)}</strong>${h.lieu?`<small>${esc(h.lieu)}</small>`:''}</div></div>`;}).join('');
        const titre=(texte)=>`<div class="po2-titre"><h2>${texte}</h2><div class="po2-trait" aria-hidden="true"></div></div>`;
        const card=(classe,contenu)=>mfPanneau(`<div class="po2-card ${classe}">${contenu}</div>`,'normal',`po2-panel ${classe}`);
        return `<section class="po2-grid po2-grid-trois">${card('po2-contrat',`${titre('TON CONTRAT')}<div class="po2-contrat-ligne"><span>Durée</span><strong>1 AN</strong></div><div class="po2-contrat-ligne"><span>Fin du contrat</span><strong>${esc(date)}</strong></div><div class="po2-contrat-ligne"><span>Salaire</span><strong>${esc(mgmtEuros(p.salaire/1000))} / MOIS</strong></div><div class="po2-contrat-ligne"><span>Ta réputation</span><strong class="po2-jaune">${esc(reputation)}</strong></div><div class="po2-offres-bas"><h3>LES OFFRES</h3>${offresHtml}${attente}${chocHtml}${proposer}</div>`)}${card('po2-patron',`${titre('CE QU’EN PENSE LE PATRON')}<p class="po2-nom-patron">${esc(typeof mgmtPostePatron==='function'?mgmtPostePatron(m):mgmtOrgNom(m))}</p><strong class="po2-verdict">${esc(phrases.niveau.toUpperCase())}</strong><p class="po2-citation">« ${esc(citation)} »</p><div class="po2-historique">${historique}</div><div class="po2-prochain"><span>Prochain rendez-vous</span><strong>${p.mi?'MI-SAISON PASSÉE':'JUILLET · MI-SAISON'}</strong></div>`)}${card('po2-objectifs',`${titre('TES OBJECTIFS')}<h3>LA SAISON</h3>${objectifs}<h3>LA SOIRÉE 65</h3><div class="po2-soiree-cibles"><p><span class="po2-pastille" aria-hidden="true"></span>${esc(mgmtPosteTexteObjectif(p.obj[0]||{}))}</p><p><span class="po2-pastille" aria-hidden="true"></span>${esc(mgmtPosteTexteObjectif(p.obj[1]||{}))}</p></div>`)}</section>`;
}
mgmtPosteOngletAjouter('poste','TON POSTE',mgmtPosteRendu);
function scr_mgmt_poste(){const m=G&&G.mgmt;if(!m||!m.poste||!MGMT_POSTE_ONGLETS.length)return '';const actif=MGMT_POSTE_ONGLETS[Math.max(0,Math.min(mgmtPosteOngletActif,MGMT_POSTE_ONGLETS.length-1))];const tabs=MGMT_POSTE_ONGLETS.map((o,n)=>`<button type="button" class="po2-tab" aria-selected="${o.id===actif.id}" onclick="mgmtPosteOngletActif=${n};CL.render()">${esc(o.titre)}</button>`).join('');return mfEcran(`<main class="mf-contenu po2-scene">${typeof mgmtOrgOnglets==='function'?mgmtOrgOnglets(m,'mgmt_poste'):''}<nav class="po2-tabs" aria-label="Rubriques du bureau">${tabs}</nav>${actif.rendu(m)}</main>`,{barre:'jeu',courant:'organisation',m,plaque:'ORGANISATION',libelle:`${mgmtOrgNom(m).toUpperCase()} · ${m.orgs&&m.orgs[mgmtPredecesseurOrgId(m)]?'4e DES HUIT':'ORGANISATION'}`,droite:`Matchmaker de ${mgmtOrgNom(m)} depuis le 12 janvier 2027`,touches:[{ks:['Échap'],t:'Accueil',onclick:"CL.go('mgmt_accueil')"},{ks:['Tab','Maj+Tab'],t:'Onglet'}]});}
/* ==== [ANCRE: MONDE_LOT58_T1_ECRAN_CHOC] — Monde lot 58 T1 ==== */
function scr_mgmt_choc(){
 const m=G&&G.mgmt,c=m&&m.choc,adversaire=c&&m.orgs&&m.orgs[c.orgId];
 const pairesEcran=c&&Array.isArray(c.paires)&&c.paires.length?c.paires:[c&&{div:c.div,a:c.a,b:c.b}];
  const referencesValides=!!m&&!!c&&typeof c.a==='string'&&typeof c.b==='string'&&!!mgmtFighterById(m,c.a)&&!!(adversaire&&Array.isArray(adversaire.roster)&&adversaire.roster.some(f=>f&&f.id===c.b))&&pairesEcran.length>0&&pairesEcran.every(p=>{
     const local=p&&mgmtFighterById(m,p.a),invite=p&&adversaire&&Array.isArray(adversaire.roster)?adversaire.roster.find(f=>f&&f.id===p.b):null;
    return !!p&&typeof p.a==='string'&&typeof p.b==='string'&&!!local&&!!invite&&local.div===p.div&&invite.div===p.div;
  });
  if(!m||!mgmtChocValide(c)||!referencesValides){if(typeof CL!=='undefined'&&CL.go)CL.go('mgmt_accueil');return typeof scr_mgmt_accueil==='function'?scr_mgmt_accueil():'';}
     const org=mgmtOrgParId(c.orgId),a=mgmtFighterById(m,c.a),b=mgmtFighterById(m,c.b),date=mgmtPosteDateTexte(c.jour),agenda=m.cal&&Array.isArray(m.cal.prochaines)?m.cal.prochaines.find(x=>x.jour===c.jour):null,salle=agenda&&agenda.salle&&typeof mgmtSalleParId==='function'?mgmtSalleParId(m,agenda.salle):null,lieu=salle?[salle.nom,salle.capacite+' places'].join(' · '):'Lieu à confirmer';
      const chez=mgmtOrgNom(m),paires=Array.isArray(c.paires)&&c.paires.length?c.paires:[{div:c.div,a:c.a,b:c.b}],majorite=Math.floor(paires.length/2)+1,affiches=paires.slice(0,3).map(p=>{const local=mgmtFighterById(m,p.a),adverse=adversaire&&Array.isArray(adversaire.roster)&&adversaire.roster.find(f=>f&&f.id===p.b),bilan=f=>[f&&Number.isSafeInteger(f.W)?f.W:0,f&&Number.isSafeInteger(f.L)?f.L:0,f&&Number.isSafeInteger(f.D)?f.D:0].join('-');return `<div class="ch3-paire"><div class="ch3-side"><b style="font-size:${mfCorps(mfNet(local.name),310,46,22)}px">${esc(local.name)}</b><span>${esc(chez)} · ${esc(bilan(local))}</span></div><div class="ch3-category"><i class="ch3-medaille" aria-hidden="true"></i><span class="ch3-vs">C</span><strong>${esc(mgmtDivisionLabel(p.div))}</strong></div><div class="ch3-side ch3-opponent"><b style="font-size:${mfCorps(mfNet(adverse.name),310,46,22)}px">${esc(adverse.name)}</b><span>${esc(org&&org.nom||c.orgId)} · ${esc(bilan(adverse))}</span></div></div>`;}).join('');
   const contreDisponible=typeof mgmtChocContreProposer==='function',contreAction=contreDisponible?'mgmtChocContreProposer(G.mgmt);saveMgmt();CL.render()':'';
   const decision=c.etat==='recu'?`<div class="ch3-actions"><button class="ch3-button" onclick="mgmtChocRepondre(G.mgmt,true);saveMgmt();CL.render()"><span>ACCEPTER</span><kbd>ENTRÉE</kbd></button><div class="ch3-secondary-actions"><button class="ch3-button ch3-counter" ${contreDisponible?'':'disabled aria-disabled="true" title="Indisponible"'} onclick="${contreAction}"><span>CONTRE-PROPOSER</span><kbd>P</kbd></button><button class="ch3-button ch3-refuse" onclick="mgmtChocRepondre(G.mgmt,false);saveMgmt();CL.render()"><span>REFUSER</span><kbd>R</kbd></button></div></div>`:c.etat==='programme'?'<p class="ch3-status">SOIRÉE PROGRAMMÉE</p>':`<p class="ch3-status">${esc(c.etat.toUpperCase())}</p>`;
       const titreAdverse=(org&&org.nom||c.orgId).toUpperCase(),matchmaker=MGMT_MATCHMAKERS&&MGMT_MATCHMAKERS[c.orgId],nomMatchmaker=matchmaker&&matchmaker.nom||titreAdverse,phraseMatchmaker=matchmaker&&matchmaker.phrase||'';
     const condition=`SI ${chez.toUpperCase()} GAGNE ${majorite} SUR ${paires.length}`;
     const femmes=paires.every(p=>divById(p.div)?.gender==='F'),hommes=paires.every(p=>divById(p.div)?.gender==='H');
     const entete=femmes?'CHAMPIONNE CONTRE CHAMPIONNE':hommes?'CHAMPION CONTRE CHAMPION':'CHAMPIONS CONTRE CHAMPIONS';
     const rangs=mgmtGuerreClassement(m),propre=rangs.find(o=>o.id===mgmtPredecesseurOrgId(m)),autre=rangs.find(o=>o.id===c.orgId);
     const meta=o=>o?`${o.rang===1?'1er':o.rang+'e'} DES HUIT · ${o.ville}`:'';
     const html=`<main class="ch3-screen ch3-fid"><h2 class="ch3-title"><span class="ch3-split"><small class="ch3-org-meta">${esc(meta(propre))}</small><b style="font-size:${mfCorps(chez.toUpperCase(),630,120,22)}px">${esc(chez.toUpperCase())}</b></span><span class="ch3-vs"><i>VS</i></span><span class="ch3-adverse"><small class="ch3-org-meta">${esc(meta(autre))}</small><b style="font-size:${mfCorps(titreAdverse,630,120,22)}px">${esc(titreAdverse)}</b></span></h2><div class="ch3-layout">${mfPanneau(`<section class="ch3-fight" aria-labelledby="ch3-fight-heading"><div class="ch3-fight-top"><h2 id="ch3-fight-heading" class="ch3-fight-heading">${entete}</h2><span>Les ceintures ne changent pas de maison</span></div><div class="ch3-paires">${affiches}</div></section>`,'normal','ch3-fight-panel')}${mfPanneau(`<section class="ch3-terms"><h2 class="ch3-matchmaker">${esc(nomMatchmaker)}, ${esc(titreAdverse)}</h2><p class="ch3-quote">« ${esc(phraseMatchmaker)} »</p><div class="ch3-detail"><span>Date</span><b>${esc(c.etat==='programme'||c.etat==='termine'?date:'À CONVENIR')}</b></div><div class="ch3-detail"><span>Lieu</span><b>${esc(lieu)}</b></div><div class="ch3-detail"><span>La recette</span><b>MOITIÉ CHACUNE</b></div><p class="ch3-condition">${esc(condition)}</p>${decision}</section>`,'normal','ch3-terms-panel')}</div></main>`;
     return mfEcran(html,{barre:'jeu',courant:'organisation',m,plaque:'LE CHOC DES ORGANISATIONS',libelle:c.etat==='recu'?'PROPOSITION REÇUE':c.etat.toUpperCase(),droiteHtml:`<div class="ch3-date-entete"><span>${c.etat==='programme'?'Programmé le':'Proposition du'}</span><b>${esc(date)}</b></div>`,touches:[{ks:['Échap'],t:c.etat==='recu'?'Répondre plus tard · 14 jours':'Retour',onclick:"CL.go('mgmt_poste')"},{ks:['F'],t:'Fiche',onclick:`CL.mgmtFiche('${escJsAttr(c.a)}')`},...(c.etat==='recu'?[{ks:['P'],t:'Contre-proposer',onclick:contreAction},{ks:['R'],t:'Refuser',onclick:'mgmtChocRepondre(G.mgmt,false);saveMgmt();CL.render()'},{ks:['Entrée'],t:'Accepter',jaune:true,onclick:'mgmtChocRepondre(G.mgmt,true);saveMgmt();CL.render()'}]:[])]});
}
/* ==== [ANCRE: FID_BILAN_PLANCHE] — Fidélité UniBilanPatron, 27/10/2026 ==== */
function mgmtPosteBilanContinuer(){
  const m=G&&G.mgmt,b=m&&mgmtPosteBilan(m);if(!b)return false;
  mgmtOffresCreer(m);
  if(b.issue!=='renvoi')mgmtPosteRenouveler(m,b.issue);
  saveMgmt();CL.go('mgmt_poste');return true;
}
function mgmtPosteBilanRencontrer(){
  const m=G&&G.mgmt;if(!m||!m.poste)return false;
  if(!Array.isArray(m.offres))mgmtOffresCreer(m);
  saveMgmt();CL.go('mgmt_poste');return true;
}
function scr_mgmt_poste_bilan(){
  const m=G&&G.mgmt;if(!m||!m.poste)return '';
  const b=mgmtPosteBilan(m),renvoi=b.issue==='renvoi',titre=b.issue==='prolonge-augmente'?'PROLONGÉ':renvoi?'REMERCIÉ':'SOUS CONDITION';
  const nom=mgmtOrgNom(m),jour=mgmtCalAujourdhui(m),annee=new Date(MGMT_CALENDRIER_DEBUT+jour*86400000).getUTCFullYear();
  const duree=Math.round(b.duree/365),texte=mgmtPosteNiveau(m.poste.conf).mi,rang=mgmtPosteRang(m),saison=new Date(MGMT_CALENDRIER_DEBUT+m.poste.debut*86400000).getUTCFullYear();
  /* Le générateur remplace seulement la propriété offres : une projection superficielle n'engage ni contrat, ni choix, ni sauvegarde au simple affichage. */
  const offres=(Array.isArray(m.offres)?m.offres:mgmtOffresCreer({...m})).filter(o=>!o.refuse),offre=offres[0];
  const org=offre&&mgmtOrgParId(offre.orgId),rangOffre=org&&(mgmtOrgClassement(m)||[]).find(o=>o.id===org.id);
  const fact=(label,valeur)=>`<div class="po2-bilan-fait"><span>${esc(label)}</span><strong>${esc(valeur)}</strong></div>`;
  const offreHtml=offre?`<h2>${esc((org.nom+' t’approche').toUpperCase())}</h2><p class="po2-bilan-situation">${esc(rangOffre?rangOffre.rang+'e des huit':'')}</p><div class="po2-bilan-conditions">${fact('Poste',offre.poste.toUpperCase())}${fact('Salaire',mgmtEuros(offre.salaire/1000)+' / MOIS')}</div><p class="po2-bilan-proposition">${esc(offre.texte)}</p><details class="po2-bilan-raisons"><summary>LES QUATRE RAISONS</summary>${offre.raisons.map(r=>`<p>${esc(r)}</p>`).join('')}</details>`:'<h2>LES OFFRES</h2>';
  const action=renvoi?'CONTINUER':'RESTER À '+nom.toUpperCase();
  const touches=[{ks:['Entrée'],t:renvoi?'Continuer':'Rester à '+nom,jaune:true,onclick:'mgmtPosteBilanContinuer()'}];
  if(offre)touches.push({ks:['K'],t:'Voir les offres',onclick:'mgmtPosteBilanRencontrer()'});
  touches.push({ks:['Tab'],t:'Revoir la saison',onclick:"CL.go('mgmt_resultats')"});
  const html=`<main class="mf-contenu po2-bilan"><section class="po2-bilan-verdict"><div class="po2-bilan-tampon" style="font-size:${mfCorps(titre,330,72,44)}px">${esc(titre)}</div><div class="po2-bilan-entete"><p>${esc(mgmtPostePatron(m).toUpperCase()+', LE '+mgmtPosteDateTexte(jour).toUpperCase()+' '+annee)}</p><h1>${renvoi?'TU PARS':'TU RESTES'}</h1></div><div class="po2-bilan-parole"><span aria-hidden="true">«</span><p>${esc(texte)} »</p></div><div class="po2-bilan-chiffres">${fact('DURÉE',duree+' '+(duree===1?'AN':'ANS'))}${fact('SALAIRE',mgmtEuros(b.salaire/1000)+' / MOIS')}${fact('LA SAISON',b.objTenus+' OBJECTIFS SUR '+b.objTotal)}</div></section>${mfPanneau(`<div class="po2-bilan-porte"><span class="po2-bilan-legende">UNE AUTRE PORTE</span><div class="po2-bilan-offre">${offreHtml}</div><div class="po2-bilan-actions">${mfBouton(action,{touche:'Entrée',jaune:true,onclick:'mgmtPosteBilanContinuer()'})}${offre?mfBouton('VOIR LES OFFRES',{touche:'K',onclick:'mgmtPosteBilanRencontrer()'}):''}</div></div>`,'normal','po2-bilan-panel')}</main>`;
  return mfEcran(html,{barre:'jeu',courant:'organisation',m,plaque:'FIN DE SAISON',libelle:nom.toUpperCase()+' · '+saison,droiteHtml:`<div class="po2-bilan-rang"><b>${esc(rang+'e')}</b><span>DES HUIT ORGANISATIONS</span></div>`,touches});
}
/* ==== [FIN ANCRE] ==== */
