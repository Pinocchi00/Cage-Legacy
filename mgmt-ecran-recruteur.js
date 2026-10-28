"use strict";
/* ==== [ANCRE: P5_T2_RECRUTEUR_ECRANS] — Monde lot 42 T2 ==== */
const MGMT_RC_UI={dest:1,cat:0,style:0,sem:3,profil:0};
function mgmtRcOnglets(actif){
 const m=G&&G.mgmt,r=m&&m.recruteur&&m.recruteur.retours&&m.recruteur.retours[0];
 const note=actif==='mgmt_recruteur_mission'&&m?'Une mission à la fois · caisse : '+mgmtEuros(m.treasury):actif==='mgmt_recruteur_retours'&&r&&Number.isSafeInteger(r.jour)?'Retour du '+mgmtJourDateTexte(r.jour):'';
 return `<nav class="rc-tabs">${[['LES LIBRES','mgmt_recrutement'],['ENVOYER LE RECRUTEUR','mgmt_recruteur_mission'],['SES RETOURS','mgmt_recruteur_retours']].map(([t,s])=>`<button class="rc-tab${actif===s?' rc-on':''}" onclick="CL.go('${s}')">${t}</button>`).join('')}${note?`<span class="rc-tab-note">${esc(note)}</span>`:''}</nav>`;
}
function mgmtRcCadre(html,actif,touches){const m=G&&G.mgmt;return mfEcran(`<main class="mf-contenu rc-page">${mgmtRcOnglets(actif)}${html}</main>`,{barre:'jeu',courant:'contrats',m,plaque:'Contrats',libelle:'Recrutement',droite:mgmtOrgNom(m)+' Fight Night '+((m.eventsPlayed||0)+1),touches});}
function mgmtRcTitre(titre){return `<div class="rc-heading"><h2 class="rc-title">${esc(titre)}</h2><i class="rc-redline" aria-hidden="true"></i></div>`;}
function mgmtRcDots(){return '<div class="rc-dots" aria-hidden="true"><i></i><i></i><i></i></div>';}
function mgmtRcMission(){
 const m=G&&G.mgmt,e=m&&m.recruteur,dests=MGMT_RECRUTEUR.destinations,d=dests[MGMT_RC_UI.dest%dests.length],mission=e&&e.mission;
 if(!d)return mgmtRcCadre(mfPanneau('Aucune mission disponible.','normal','rc-panel'),'mgmt_recruteur_mission',[]);
  const cats=d.categories,styles=['lutteur','frappeur','grappler','complet'],styleLabels={lutteur:'Lutteur',frappeur:'Frappeur',grappler:'Grappler',complet:'Complet'},sem=MGMT_RC_UI.sem,cost=mgmtCroissanceCoutRecruteur(m,d.cout),can=m&&Number(m.treasury)>=cost/1000;
  const rows=dests.map((x,i)=>`<button class="rc-dest${i===MGMT_RC_UI.dest?' rc-selected':''}" onclick="CL.rcDestination(${i})"><div class="rc-dest-head"><b>${esc(x.nom.toUpperCase())}</b><div class="rc-dots" aria-hidden="true"><i></i><i></i><i></i></div></div><span>${esc(x.scene)}</span><small>${esc(x.categories.map(mgmtDivisionLabel).join(', '))} · ${mgmtEuros(mgmtCroissanceCoutRecruteur(m,x.cout)/1000)}</small><small>Pépite : 1 sur ${esc(x.pepites)}</small></button>`).join('');
  const retour=new Date(mgmtJourDate((m&&m.cal&&m.cal.jour||0)+sem*7).ts).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',timeZone:'UTC'}).toUpperCase();
  const act=mission?`<div class="rc-away">Karim est parti, retour le ${esc(mgmtJourDateTexte(mission.retourLe))}.</div>`:can?mfBouton('Envoyer Karim au '+d.nom,{touche:'Entrée',jaune:true,onclick:'CL.rcEnvoyer()',classe:'rc-send'}):`<div class="rc-poor" aria-disabled="true">Caisse insuffisante · ${mgmtEuros(cost/1000)}</div>`;
  const categorie=cats.map((x,i)=>`<button class="rc-option${i===MGMT_RC_UI.cat?' rc-selected':''}" onclick="CL.rcCategorie(${i})">${esc(mgmtDivisionLabel(x))}</button>`).join('');
  const style=styles.map((x,i)=>`<button class="rc-option${i===MGMT_RC_UI.style?' rc-selected':''}" onclick="CL.rcStyle(${i})">${esc(styleLabels[x])}</button>`).join('');
  const duree=[2,3,4].map(x=>`<button class="rc-option${x===sem?' rc-selected':''}" onclick="CL.rcSem(${x})">${x} SEMAINES</button>`).join('');
  const champs=[['LA CATÉGORIE',categorie],['LE STYLE CHERCHÉ',style],['LA DURÉE',duree]].map(([titre,options])=>`<div class="rc-field"><div class="rc-label">${titre}</div><div class="rc-options">${options}</div></div>`).join('');
  return mgmtRcCadre(`<section class="rc-layout"><div class="rc-left">${mfPanneau(`${mgmtRcTitre('OÙ L’ENVOYER')}<div class="rc-destinations">${rows}</div><div class="rc-odds">${mgmtRcDots()}Les chances d’y trouver une pépite, d’après ses voyages passés</div>`,'normal','rc-panel rc-places')}</div><div class="rc-right">${mfPanneau(`${mgmtRcTitre('LA MISSION')}<div class="rc-intro"><div class="rc-karim">KARIM OUALI, TON RECRUTEUR</div><div class="rc-detail">${esc(d.envoi.texte)}</div></div>${champs}<div class="rc-summary"><div><span>Coût</span><b>${mgmtEuros(cost/1000)}</b></div><div><span>Retour</span><b>${retour}</b></div><div><span>Profils</span><b>TROIS À CINQ</b></div></div>${act}`,'normal','rc-panel rc-mission')}</div></section>`,'mgmt_recruteur_mission',[{ks:['Échap'],t:'Accueil',onclick:"CL.go('mgmt_accueil')"},{ks:['←','→','↑','↓'],t:'Destination'},{ks:['Tab'],t:'Changer d’onglet'},{ks:['Entrée'],t:'Envoyer Karim'}]);
}
/* ==== [ANCRE: FIDELITE_RETOURS_20261028] — Profil et demande séparés, données du recruteur uniquement ==== */
function mgmtRcProfilRendu(m,r,p,idx){
 const indisponible=!mgmtRecruteurProfilDisponible(m,p.id),suivi=mgmtSuivis(m).includes(p.id),signe=(m.roster||[]).some(f=>f.id===p.id);
 const cout=p.contrat&&p.contrat.primeSignature,manque=Number.isFinite(cout)&&Number(m.treasury)<cout/1000;
 const valeur=n=>Number.isFinite(n)?String(n):'—',euros=n=>Number.isFinite(n)?mgmtEuros(n/1000):'—';
 const complet=String(p.name),separe=p.first&&p.last&&complet===p.first+' '+p.last,nom=separe?p.last:complet;
 const d=mgmtRecruteurDestination(r.dest),badge=p.pepita?`<div class="rc-pepite"><div><b>PÉPITE</b><span>1 SUR ${esc(d.pepites)}</span></div></div>`:'';
 const stat=p.chiffres||{},mesures=[['Finitions',Number.isFinite(stat.finitions)?stat.finitions+' SUR '+p.W:'—'],['Combats filmés',valeur(stat.documentes)],['Amenées',valeur(stat.amenes)],['Significatifs',valeur(stat.significatifs)]];
 const trait=typeof mgmtTraitInfo==='function'?mgmtTraitInfo(p.trait):null;
 const faible=['menton-fele','fragile-apres-ko','s-eteint','sous-pression','hesite-apres-ko','serie-noire','ne-se-releve-pas','rouille'].includes(p.trait);
 const profil=`<div class="rc-profile-head"><i class="rc-tunnel" aria-hidden="true"></i><div class="rc-kicker">PROFIL ${idx+1} SUR ${r.profils.length} · ${esc(p.organisation||'')}</div>${separe?`<div class="rc-profile-first">${esc(p.first)}</div>`:''}<h2 style="font-size:${mfCorps(nom.toUpperCase(),p.pepita?540:730,136,22)}px">${esc(nom)}</h2>${badge}<div class="rc-record"><strong>${esc(p.W)}-${esc(p.L)}-${esc(p.D||0)}</strong><span>${esc(mgmtDivisionLabel(p.cat))} · ${esc(p.age)} ans</span></div></div><div class="rc-stats">${mesures.map(([label,n])=>`<div>${esc(label)}<b>${esc(n)}</b></div>`).join('')}</div><div class="rc-trait"><i class="rc-trait-mark${faible?' rc-negative':''}" aria-hidden="true">${faible?'−':'+'}</i><strong>${esc(trait?trait.nom:p.trait||'Trait non identifié')}</strong><span>Trait révélé par Karim</span></div><blockquote class="rc-quote">« ${esc(p.phrase)} »</blockquote><div class="rc-documentes">Chiffres sur ${esc(valeur(stat.documentes))} combats filmés</div>`;
 const demande=mfPanneau(`${mgmtRcTitre('CE QU’IL DEMANDE')}<div class="rc-summary"><div><span>Combats</span><b>${esc(valeur(p.contrat&&p.contrat.combats))}</b></div><div><span>Par combat</span><b>${esc(euros(p.contrat&&p.contrat.primeCombat))}</b></div><div><span>Prime de signature</span><b>${esc(euros(cout))}</b></div></div>${p.observeAussi?`<div class="rc-watch"><div>ON LE REGARDE AUSSI</div>${esc(p.observeAussi)}</div>`:''}<div class="rc-actions">${indisponible?`<span class="rc-state">${signe?'Signé':'Proposé dans Contrats'}</span>`:mfBouton('Le signer',{touche:'Entrée',jaune:true,onclick:`CL.rcSigner('${escJsAttr(p.id)}')`})}${manque&&!indisponible?`<span class="rc-state">Caisse insuffisante : il manque ${esc(mgmtEuros(cout/1000-Number(m.treasury)))}</span>`:''}${suivi?'<span class="rc-state">Suivi</span>':mfBouton('Le suivre',{touche:'S',onclick:`CL.rcSuivre('${escJsAttr(p.id)}')`})}${r.lus<r.profils.length?mfBouton('Profil suivant',{touche:'→',onclick:'CL.rcReveal()'}):''}</div>`,'normal','rc-panel rc-contract');
 return {profil,demande};
}
/* ==== [FIN ANCRE] ==== */
function mgmtRcRetours(){
 const m=G&&G.mgmt,e=m&&m.recruteur,r=e&&e.retours&&e.retours[0];
 if(!r)return mgmtRcCadre(mfPanneau('<h2 class="rc-title">CE QUE KARIM RAPPORTE</h2><p class="rc-empty">Aucun retour pour le moment. Karim n’a aucune mission en cours.</p>','normal','rc-panel rc-empty-panel'),'mgmt_recruteur_retours',[{ks:['Échap'],t:'Accueil',onclick:"CL.go('mgmt_accueil')"}]);
 const idx=Math.max(0,Math.min(MGMT_RC_UI.profil,Math.max(0,r.profils.length-1))),p=r.profils[idx],open=!!p&&idx<r.lus;
 const profiles=r.profils.map((x,i)=>i<r.lus?`<button class="rc-profile${i===idx?' rc-selected':''}" onclick="CL.rcProfil(${i})"><b>${esc(x.W)}</b><div class="rc-profile-text"><span style="font-size:${mfCorps(x.name.toUpperCase(),205,32,22)}px">${esc(x.name)}</span><small>${esc(x.W)}-${esc(x.L)} · ${esc(mgmtDivisionLabel(x.cat))} · ${esc(x.age)} ans</small></div></button>`:`<div class="rc-profile rc-closed"><b><i>?</i></b><div class="rc-profile-text"><span>PROFIL ${i+1}</span><small>Encore fermé</small></div></div>`).join('');
 const details=open?mgmtRcProfilRendu(m,r,p,idx):{profil:`<div class="rc-closed-detail">PROFIL ${idx+1} · Encore fermé<br><button class="rc-reveal" onclick="CL.rcReveal()">Ouvrir le profil suivant →</button></div>`,demande:''};
 const body=r.bredouille?`<div class="rc-empty">Karim est rentré bredouille. « ${esc(r.bredouille)} »</div>`:`<div class="rc-report"><aside class="rc-list"><h2 class="rc-title">CE QUE KARIM RAPPORTE</h2>${profiles}<p>${r.profils.length} profils · ${r.lus} dévoilé${r.lus===1?'':'s'}</p><div class="rc-summary">${r.profils.length} profils de ${esc(mgmtRecruteurDestination(r.dest)?.nom||r.dest)}</div></aside><article class="rc-open">${details.profil}</article>${details.demande}</div>`;
 return mgmtRcCadre(body,'mgmt_recruteur_retours',[{ks:['Échap'],t:'Accueil',onclick:"CL.go('mgmt_accueil')"},{ks:['↑','↓'],t:'Profil'},{ks:['Espace','→'],t:'Ouvrir le profil suivant',onclick:'CL.rcReveal()'},{ks:['Entrée'],t:'Le signer',onclick:'CL.rcSignerActif()'},{ks:['S'],t:'Le suivre',onclick:'CL.rcSuivreActif()'}]);
}
Object.assign(SCREENS,{mgmt_recruteur_mission:mgmtRcMission,mgmt_recruteur_retours:mgmtRcRetours});
Object.assign(CL,{
 rcDestination(i){MGMT_RC_UI.dest=(i+MGMT_RECRUTEUR.destinations.length)%MGMT_RECRUTEUR.destinations.length;MGMT_RC_UI.cat=0;render();},
 rcCategorie(i){MGMT_RC_UI.cat=i;render();},rcStyle(i){MGMT_RC_UI.style=i;render();},rcSem(i){MGMT_RC_UI.sem=i;render();},
 rcEnvoyer(){const d=MGMT_RECRUTEUR.destinations[MGMT_RC_UI.dest],cat=d.categories[MGMT_RC_UI.cat%d.categories.length],ok=mgmtRecruteurEnvoyer(G.mgmt,{dest:d.id,cat,style:['lutteur','frappeur','grappler','complet'][MGMT_RC_UI.style],sem:MGMT_RC_UI.sem});if(ok)render();},
 rcProfil(i){const r=G?.mgmt?.recruteur?.retours?.[0];if(!r)return;MGMT_RC_UI.profil=Math.max(0,Math.min(r.profils.length-1,Number.isSafeInteger(i)?i:0));render();},
 rcReveal(){const r=G?.mgmt?.recruteur?.retours?.[0];if(r&&r.lus<r.profils.length){r.lus++;MGMT_RC_UI.profil=r.lus-1;render();}},
 rcSigner(id){if(mgmtRecruteurSigner(G.mgmt,id))render();},rcSuivre(id){mgmtRecruteurSuivre(G.mgmt,id);render();},
 rcSignerActif(){const r=G?.mgmt?.recruteur?.retours?.[0],p=r?.profils?.[MGMT_RC_UI.profil];if(p&&MGMT_RC_UI.profil<r.lus)this.rcSigner(p.id);},
 rcSuivreActif(){const r=G?.mgmt?.recruteur?.retours?.[0],p=r?.profils?.[MGMT_RC_UI.profil];if(p&&MGMT_RC_UI.profil<r.lus)this.rcSuivre(p.id);}
});
keysRegister('mgmt_recruteur_mission',{Escape(){CL.go('mgmt_accueil');},ArrowLeft(){CL.rcDestination(MGMT_RC_UI.dest-1);},ArrowUp(){CL.rcDestination(MGMT_RC_UI.dest-1);},ArrowRight(){CL.rcDestination(MGMT_RC_UI.dest+1);},ArrowDown(){CL.rcDestination(MGMT_RC_UI.dest+1);},Enter(){CL.rcEnvoyer();},Tab(e){CL.go(e&&e.shiftKey?'mgmt_recrutement':'mgmt_recruteur_retours');}});
keysRegister('mgmt_recruteur_retours',{Escape(){CL.go('mgmt_accueil');},ArrowUp(){CL.rcProfil(MGMT_RC_UI.profil-1);},ArrowDown(){CL.rcProfil(MGMT_RC_UI.profil+1);},ArrowRight(){CL.rcReveal();},' '(){CL.rcReveal();},Enter(){CL.rcSignerActif();},s(){CL.rcSuivreActif();},S(){CL.rcSuivreActif();},Tab(e){CL.go(e&&e.shiftKey?'mgmt_recruteur_mission':'mgmt_recrutement');}});
keysRegister('mgmt_recrutement',{Tab(e){CL.go(e&&e.shiftKey?'mgmt_recruteur_retours':'mgmt_recruteur_mission');}});
