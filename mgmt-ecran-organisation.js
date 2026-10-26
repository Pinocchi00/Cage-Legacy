"use strict";
/* ==== [ANCRE: MGMT_LOT4_T7_ORGANISATION] — Lot 4 T7 : l'écran de
   l'organisation (docs/LOT-4-LA-PEAU-DU-JEU.md §3 T7 ; maquette 08,
   PARTIELLE). Il ne montre que ce que le code sait déjà :
   - l'effectif de Split : nombre de combattants (hors retraités —
     médicaux comme d'âge, test générique mgmtIsRetired : ils ont quitté
     le vivier), nombre de catégories représentées, et par catégorie le
     nombre de disponibles (mgmtAvailable : ni retraités, ni suspendus)
     et le nombre de combattants de Split dans le TOP 15 MONDIAL — lues
     sur le classement mondial (portée 'world' de mgmtDivisionRanking,
     les 15 premiers, filtrés sur le roster). Le classement de Split ne
     dépasse jamais quinze combattants par catégorie : y lire « classés »
     dirait toujours le même nombre que l'effectif. Le constat factuel
     « effectif trop mince » apparaît quand une catégorie ne permet plus
     de composer un combat — moins de deux disponibles. Tout se dérive à
      la lecture, rien n'est stocké (règle du bureau, CDC §3). Les tuiles
      se rangent en deux groupes titrés, hommes et femmes (les divisions
      H et F d'engine.js) : une catégorie féminine porte son libellé
      « … féminin » (MGMT_DIVISION_FEMININ, mgmt-ecran-carte.js), jamais
      aucun nom inventé.
   - les finances : la trésorerie (m.treasury, entier k$) et les recettes
     nettes des dernières soirées (m.recettes), telles qu'elles existent —
     aucune recette, aucune ligne de soirées.
   - les finances : la trésorerie (m.treasury, entier k$) et les recettes
     nettes des dernières soirées (m.recettes), telles qu'elles existent —
     aucune recette, aucune ligne de soirées.
   Ce qui n'existe pas n'apparaît pas : aucun onglet Contrats ni
   Diffuseur, aucune parole de patron, aucun objectif de saison, aucun
   texte de maquette (§1). Ni note, ni barème, ni jauge (addendum 2 §6).
   esc() sur toute donnée affichée, sans exception. Écran enregistré dans
   SCREENS avec les cinq autres (mgmt-screens.js), clavier inclus — échap
   ramène à la semaine. ==== */
const MGMT_ORG_LABELS={
  back:'← Retour à l’accueil',
  effectif:"L'effectif, par catégorie",
  finances:'Les finances',
  treasury:'Trésorerie',
  soirees:'Dernières soirées',
  thin:'effectif trop mince',
  aucun:'Aucun combattant — effectif trop mince',
  hommes:'Hommes',
  femmes:'Femmes',
};

/** L'effectif de Split par catégorie, dérivé à la lecture. Pur.
 *  @returns {Array<{div,name,total,dispo,top15}>} */
function mgmtOrgEffectifRows(m){
  if(!m||!Array.isArray(m.roster)) return [];
  return allDivisions().map(d=>{
    const dans=m.roster.filter(o=>o&&o.div===d.id&&!mgmtIsRetired(o));
    const dispo=dans.filter(o=>mgmtAvailable(m,o)).length;
    /* Combattants de Split dans le top 15 mondial (portée « world »),
       à la lecture : les 15 premiers du classement mondial de la
       catégorie, filtrés sur le roster. La loi unique, jamais un second
       classement. */
    const top15=mgmtDivisionRanking(m,d.id,'world').slice(0,15)
      .filter(r=>dans.some(o=>o.id===r.id)).length;
    return {div:d,total:dans.length,dispo:dispo,top15:top15};
  });
}

/** Un groupe de tuiles (les divisions H ou F d'engine.js), avec son titre. */
function mgmtOrgGroupHtml(m,g,rows){
  const tiles=rows.map(r=>{
    const thin=r.dispo<2;
    const sub=r.total===0
      ?MGMT_ORG_LABELS.aucun
      :r.total+(r.total===1?' combattant, ':' combattants, ')
        +r.top15+' dans le top 15 mondial, '
        +(r.dispo<2?MGMT_ORG_LABELS.thin:r.dispo+(r.dispo===1?' disponible':' disponibles'));
    return `<div class="mgmt-org-cat${thin?' thin':''}"><div class="mgmt-org-nm">${esc(mgmtDivisionLabel(r.div))}</div>`
      +`<div class="mgmt-org-sub">${esc(sub)}</div></div>`;
  }).join('');
  return `<div class="mgmt-org-group"><div class="mgmt-org-hd">${esc(g)}</div>`
    +`<div class="mgmt-org-eff">${tiles}</div></div>`;
}

function mgmtOrgMoneyHtml(m){
  const T=Number.isSafeInteger(m.treasury)?m.treasury:0;
  const recettes=Array.isArray(m.recettes)
    ?m.recettes.filter(r=>Number.isSafeInteger(r)).slice().reverse():[];
  const lignes=`<div class="mgmt-org-money">`
    +`<span class="mgmt-org-pill">${esc(MGMT_ORG_LABELS.treasury)}</span>`
    +`<span class="mgmt-org-val">${esc(mgmtEuros(T))}</span></div>`;
  const soirees=recettes.length>0
    ?`<div class="mgmt-org-money"><span class="mgmt-org-pill">${esc(MGMT_ORG_LABELS.soirees)}</span>`
      +`<span class="mgmt-org-line">${esc(recettes.map(v=>(v>0?'+':'')+mgmtEuros(v)).join(' · '))}</span></div>`
    :''; /* Aucune soirée jouée : la ligne n'apparaît pas. */
  return lignes+soirees;
}

/* ==== [ANCRE: MGMT_LOT56_T1_CROISSANCE] — Monde lot 56 T1 ==== */
/* ==== [ANCRE: MONDE67_T1_ONGLETS_ORG] — Monde lot 67 T1 ==== */
function mgmtOrgOnglets(m,courant){
  const onglets=[['mgmt_guerre','LE CLASSEMENT DES HUIT'],['mgmt_organisation','LA CROISSANCE'],['mgmt_poste','TON POSTE'],['mgmt_carnet','TON CARNET']];
  return `<nav class="mo67-tabs" aria-label="Organisation">${onglets.map(([id,titre])=>`<button type="button" class="mo67-tab" aria-current="${id===courant?'page':'false'}" onclick="CL.go('${id}')" onkeydown="if(event.key==='ArrowDown'||event.key==='ArrowUp'||event.key==='Tab'){event.preventDefault();const a=[...this.parentElement.querySelectorAll('button')],i=a.indexOf(this),d=event.key==='ArrowUp'||event.shiftKey?-1:1;a[(i+d+a.length)%a.length].focus()}else if(event.key==='Escape'){CL.go('mgmt_accueil')}">${esc(titre)}</button>`).join('')}</nav>`;
}
function mgmtPaliersHtml(m){
  const c=mgmtPaliersCalculer(m), avance=c.paliers.map(p=>`<span class="cr3-step cr3-done"><b>${esc(p.nom)}</b><small>${esc(p.texte)}</small></span>`).join('');
  const n=c.next;
  const niveaux=n?{salle:n.salle,diffuseur:n.diffuseur,recruteur:n.recruteur,agents:n.agents}:c.effets;
  const lignes=[
    ['LES SALLES',`Salle accessible jusqu’à ${esc(mgmtPopPlafond(c.popularite))} spectateurs · palier ${esc(niveaux.salle)}/3`],
    ['LE DIFFUSEUR',`Palier ${esc(niveaux.diffuseur)}/3 · progression liée au rang de fin d’année`],
    ['LE RECRUTEUR',`Palier ${esc(niveaux.recruteur)}/3 · remise additive jusqu’à 3 %`],
    ['LES AGENTS LIBRES',`Attrait de classement · palier ${esc(niveaux.agents)}/3`]
  ];
  const pistes=lignes.map(([titre,detail])=>`<div class="cr3-track"><b>${titre}</b><span>${detail}</span></div>`).join('');
  return `<section class="cr3-growth"><header class="cr3-title"><b>LA CROISSANCE</b><span>${esc(mgmtOrgNom(m).toUpperCase())} · ${esc(c.rang)}e DES HUIT</span></header>`
    +`<div class="cr3-bar"><span class="cr3-step cr3-done"><b>Popularité</b><small>${esc(c.popularite)} / 100</small></span>${avance}`
    +`${n?`<span class="cr3-step cr3-next"><b>${esc(n.nom)}</b><small>${esc(n.texte)} · Popularité ${esc(n.popularite)} et rang ${esc(n.rang)} ou mieux</small></span>`:'<span class="cr3-step cr3-next"><b>Le sommet atteint</b><small>Split est première des huit.</small></span>'}</div>`
    +`<div class="cr3-effects">${pistes}</div></section>`;
}

/* ==== [ANCRE: MONDE_LOT81_T1_CROISSANCE] — Monde lot 81 T1 ==== */
function mgmtCroissanceHtml(m){
  const c=mgmtPaliersCalculer(m), n=c.next;
  const axes=[
    ['LES SALLES','La plus grande que l’organisation sait remplir', ['GYMNASE','PALAIS','DÔME','ARÉNA'],['1 500 places','4 000 places','9 000 places','16 000 places'],Math.min(3,c.effets.salle)],
    ['LE DIFFUSEUR','Suit le rang de fin d’année',['RÉGIONAL','NATIONAL','EUROPÉEN','MONDIAL'],['Lyon et sa région','Toute la France','Huit pays','Partout'],Math.min(3,c.effets.diffuseur)],
    ['LE RECRUTEUR','Suit le budget de l’organisation',['LA FRANCE','L’EUROPE','LE MONDE','LE MONDE'],['1 mission','1 mission','1 mission','2 missions'],Math.min(3,c.effets.recruteur)],
    ['LES AGENTS LIBRES','Ils choisissent les mieux classées',['LES OUBLIÉS','LES BONS','LES TRÈS BONS','LES MEILLEURS'],['Personne n’en veut','Top 50 mondial','Top 25 mondial','Top 10 mondial'],Math.min(3,c.effets.agents)]
  ];
  /* ==== [ANCRE: CROISSANCE_CONTOURS_UNI] — Monde lot 81 T1 ==== */
  const rails=axes.map(([titre,exp,noms,details,niveau])=>`<section class="cr3-axis"><div class="cr3-intro"><b>${titre}</b><span>${esc(exp)}</span></div><div class="cr3-stages"><i class="cr3-line"></i><i class="cr3-progress" style="width:${Math.max(0,niveau)*33.333}%"></i>${noms.map((nom,i)=>`<div class="cr3-stage ${i<niveau?'cr3-passed':i===niveau?'cr3-current':'cr3-future'}"><span class="cr3-marker">${i<niveau?'✓':i>niveau?'<span class="cr3-marker-inner"></span>':''}</span><b>${nom}</b><small>${esc(details[i])}</small></div>`).join('')}</div></section>`).join('');
  const nextName=n?esc(n.nom.toUpperCase()):'Le sommet atteint';
  const textePalier=n?n.texte.replace(/Split/g,mgmtOrgNom(m)):'L’organisation est au sommet des huit.';
  const nextText=n?`${esc(textePalier)}. Popularité ${esc(n.popularite)} et rang ${esc(n.rang)} ou mieux.`:esc(textePalier);
  return `<div class="cr3-layout">${mfPanneau(`<div class="cr3-axes">${rails}</div>`,'normal','cr3-panel')}${mfPanneau(`<b class="cr3-next-label">LA PROCHAINE MARCHE</b><strong class="cr3-next-name">${nextName}</strong><p class="cr3-next-text">${nextText}</p><div class="cr3-metrics"><div><span>Popularité</span><b>${esc(c.popularite)} / ${n?esc(n.popularite):esc(c.popularite)}</b></div><div><span>Rang des huit</span><b>${esc(c.rang)}e / ${n?esc(n.rang):esc(c.rang)}e</b></div><div><span>Salles pleines de suite</span><b>${esc(m.croissance&&m.croissance.sallesPleines||1)} / 3</b></div></div><p class="cr3-note">Une salle à moitié vide fait reculer d’une marche.</p><small class="cr3-condition">${n?`Popularité ${esc(n.popularite)} et rang ${esc(n.rang)} ou mieux`:'Le sommet atteint'}</small>`,'normal','cr3-next-panel')}</div>`;
}

function scr_mgmt_organisation(){
  if(!G||!G.mgmt) return scr_mgmt_bureau();
  const m=G.mgmt;
  const rows=mgmtOrgEffectifRows(m);
  const total=m.roster.filter(o=>o&&!mgmtIsRetired(o)).length;
  const legs=rows.filter(r=>r.total>0).length;
  /* Deux groupes de tuiles, dans l'ordre d'engine.js : hommes puis femmes. */
  const femmes=rows.filter(r=>r.div.gender==='F');
  const hommes=rows.filter(r=>r.div.gender!=='F');
  const groupes=mgmtOrgGroupHtml(m,MGMT_ORG_LABELS.hommes,hommes)
    +mgmtOrgGroupHtml(m,MGMT_ORG_LABELS.femmes,femmes);
  const croissance=mgmtPaliersCalculer(m);
  return mfEcran(`<main class="mf-contenu cr3-screen"><div class="cr3-navrow">${mgmtOrgOnglets(m,'mgmt_organisation')}<div class="cr3-popularity"><span>Popularité</span><b>${esc(croissance.popularite)}</b><i>▲ +3</i></div></div>${mgmtCroissanceHtml(m)}<div class="cr3-legacy" hidden aria-label="Données historiques">${mfPanneau(`<h3>${esc(MGMT_ORG_LABELS.effectif)}</h3>${esc(total)} · ${esc(legs)}${groupes}`,'normal','mf-sem-p')}<div class="mf-panneau normal mf-sem-p"><div class="mf-p2"><div class="mf-p3"><h3>${esc(MGMT_ORG_LABELS.finances)}</h3>${mgmtOrgMoneyHtml(m)}<a href="#" onclick="CL.go('mgmt_poste');return false">Ton poste</a>
    /* ==== [ANCRE: P4_T23B_ORG_LIEN_MANQUE] — Monde lot 38 T2 ==== */
    <button type="button" onclick="mgmtEspArriveeOuvrir(1,'mgmt_organisation')">Revoir ce qui manque</button></div></div></div></div></main>`,{barre:'jeu',courant:'accueil',m,plaque:'ORGANISATION',libelle:`${mgmtOrgNom(m).toUpperCase()} · ${esc(croissance.rang)}e DES HUIT`,droite:`${mgmtOrgNom(m)} Fight Night ${Number.isSafeInteger(m.eventsPlayed)?m.eventsPlayed+1:1}`,touches:[{ks:['Échap'],t:'Accueil'},{ks:['Tab'],t:'Onglet'}]});
}
/* ==== [FIN ANCRE] ==== */
