"use strict";
/* ==== [ANCRE: MGMT_BRIEF_LOT6_FICHE] — Brief du 06/10/2026, lot 6 : la Fiche dans le cadre. Une bannière
   au nom du combattant, ses chiffres à gauche, cinq onglets à droite (Aperçu, Style, Combats, Contrat,
   On en dit). Le contenu des onglets réutilise les blocs existants de la fiche (aucun système parallèle) ;
   « Contrat » reste grisé jusqu'au lot 9. Clavier : Tab onglet suivant, ← → autre combattant de la
   catégorie, ↑ ↓ Entrée dans les combats, Entrée sinon prépare son combat, Échap retour. ==== */

const MGMT_FICHE_ONGLETS=[
  {id:'apercu',libelle:'Aperçu'},{id:'style',libelle:'Style'},{id:'combats',libelle:'Combats'},
  {id:'contrat',libelle:'Contrat',contrat:true},{id:'ondit',libelle:'On en dit'},
];

/** « Contrat » n'existe qu'avec l'agenda du joueur (lots 7 et 9) ; avant, il reste grisé. */
function mgmtFicheOngletGrise(o){ return !!o.contrat&&!(G&&G.mgmt&&typeof mgmtContratsActif==='function'&&mgmtContratsActif(G.mgmt)); }

function mgmtFicheOngletCourant(){
  const ids=MGMT_FICHE_ONGLETS.filter(o=>!mgmtFicheOngletGrise(o)).map(o=>o.id);
  if(!ids.includes(MGMT_FICHE.onglet)) MGMT_FICHE.onglet='apercu';
  return MGMT_FICHE.onglet;
}

/** Ses voisins dans la catégorie, dans l'ordre de l'écran Effectif : pour ← →. */
function mgmtFicheVoisins(m,f){
  const l=mgmtEffectifLignes(m,f.div).map(x=>x.f.id);
  return {ids:l,i:l.indexOf(f.id)};
}

function mgmtFicheBanniereHtml(f){
  const nom=mfNet(f.last||f.name), prenom=mfNet(f.first||'');
  return `<div class="mf-eff-banniere mf-fiche-banniere"><div class="mf-eff-b2"><div class="mf-eff-b3"><div class="mf-eff-banniere-nom">`
    +`<span style="font-size:34px">${esc(prenom)}</span><span style="font-size:${mfCorps(nom,380,92,46)}px">${esc(nom)}</span></div></div></div></div>`;
}

/** L'onglet Contrat : les combats du contrat un par un (fait, le prochain, à venir), la bourse fixée à la signature, ce qui se passe ensuite. */
function mgmtFicheContratHtml(m,f){
  if(f.libre) return `<h3>Son contrat</h3><p>Sans contrat : il ne se book plus. Il figure au recrutement.</p>`;
  if(!f.ct) return `<h3>Son contrat</h3><p>Pas de contrat suivi pour ce combattant.</p>`;
  const c=f.ct, lignes=[];
  for(let i=1;i<=c.n;i++){ const etat=i<=c.f?'Fait':(i===c.f+1?'Le prochain':'À venir'); lignes.push(`<div class="mf-ligne${i===c.f+1?' choisie':''}"><span class="mf-ligne-t">Combat ${i}</span><span class="mf-ligne-v">${esc(etat)}</span></div>`); }
  const p=mgmtContratPalier(m,f);
  return `<h3>Son contrat</h3>${lignes.join('')}`
    +`<h3>La bourse</h3><p>${esc(mgmtEuros(c.b))} par combat, fixés à la signature.</p>`
    +`<h3>Ensuite</h3><p>${esc(mgmtContratRestants(f))} combat${mgmtContratRestants(f)>1?'s':''} restant${mgmtContratRestants(f)>1?'s':''} ; sans nouveau contrat, il rejoint les sans-contrat. Le renouvellement se propose dans Contrats.</p>`
    +(p>=1?`<p>${esc(MGMT_CT_PALIERS[p])}.</p>`:'');
}

function mgmtFicheCorpsOnglet(m,f,line,id){
  const identite=mgmtIdentite(m,f);
  if(id==='contrat') return mgmtFicheContratHtml(m,f);
  if(id==='style') return mgmtFicheConnaissance(m,f)+`<h3>Où il combat</h3>${mgmtFicheOctogone(m,f)}`;
  if(id==='combats') return `<h3>Ses derniers combats</h3>${mgmtHistoriqueHtml(m,f)}${mgmtFicheParcours(line.trace)}`;
  if(id==='ondit') return mgmtFicheVie(m,f)+mgmtFichePromesses(m,f)+mgmtFicheRivaux(m,f)+mgmtFicheParole(m,f)+mgmtFicheLien(m,f);
  return mgmtFicheHistoire(identite)+mgmtFicheCorps(m,f)+mgmtFicheCamp(m,f);
}

function scr_mgmt_fiche_cadre(){
  const m=G&&G.mgmt, line=m&&mgmtFicheLigne(m,MGMT_FICHE.id);
  if(!line) return scr_mgmt_bureau();
  const {f}=line, onglet=mgmtFicheOngletCourant();
  const identite=mgmtIdentite(m,f), phys=mgmtCombatProfile(f).phys||{}, role=mgmtRole(m,f);
  const mondial=divById(f.div)&&divById(f.div).gender==='F'?'mondiale':'mondial', rangMonde=mgmtFicheSituation(m,f,'world');
  const texteMonde=/^\d/.test(rangMonde)?`${rangMonde} ${mondial}`:`${mondial} : ${rangMonde}`;
  const rangs=line.trace?texteMonde:`Chez ${mgmtOrgNom(m)} : ${mgmtFicheSituation(m,f,'organization')} · ${texteMonde}`;
  const prochain=mgmtEffectifProchain(m,f), forme=mgmtEffectifForme(m,f), v=mgmtFicheVoisins(m,f);
  const ligne=(k,val)=>`<div class="mf-eff-fiche-l"><span>${esc(k)}</span><b>${esc(val)}</b></div>`;
  const taille=Number.isFinite(phys.height)?(phys.height/100).toFixed(2).replace('.',',')+' m':'?';
  const allonge=Number.isFinite(phys.reach)?(phys.reach/100).toFixed(2).replace('.',',')+' m':'?';
  const stats=`<div class="mf-eff-fiche-t"><div><div class="mf-eff-fiche-s">Palmarès</div><div class="mf-eff-fiche-rec">${esc(f.W)}-${esc(f.L)}-${esc(f.D||0)}</div></div>`
    +`<div class="mf-eff-forme">${forme.map(mfMarque).join('')}</div></div>`
    +`<div class="mf-eff-fiche-ls">${ligne('Catégorie',mgmtDivisionLabel(f.div))}${ligne('Âge',f.age+' ans')}${ligne('Garde',phys.stance==='southpaw'?'GAUCHER':'ORTHODOXE')}${ligne('Taille',taille)}${ligne('Allonge',allonge)}`
    +(role?ligne('Rôle',role.libelle):'')+ligne('Prochain combat',prochain?(prochain.adv?'Contre '+prochain.adv:'Sur la carte'):'—')+`</div>`
    +`<div class="mf-eff-fiche-pied">${mfBouton('Préparer son combat',{touche:'Entrée',jaune:true,onclick:"CL.mgmtFicheCarte()"})}</div>`;
  const onglets=MGMT_FICHE_ONGLETS.map(o=>mgmtFicheOngletGrise(o)
    ?`<span class="mf-onglet mf-fiche-grise" aria-disabled="true">${esc(o.libelle.toUpperCase())}</span>`
    :`<button type="button" class="mf-onglet${o.id===onglet?' ouvert':''}" aria-pressed="${o.id===onglet}" onclick="CL.mgmtFicheOnglet('${o.id}')">${esc(o.libelle.toUpperCase())}</button>`).join('');
  const contenu=`<main class="mf-contenu mf-fiche-cadre"><div class="mf-eff-aside mf-fiche-gauche"><h2 class="mf-sr">${esc(f.name)}</h2>${mgmtFicheBanniereHtml(f)}${mfPanneau(stats,'normal','mf-eff-fiche')}</div>`
    +`<div class="mf-fiche-droite"><div class="mf-fiche-onglets">${onglets}<button type="button" class="mf-onglet mgmt-fiche-retour mf-fiche-retour" onclick="CL.mgmtFicheRetour()">← RETOUR</button></div><div class="mf-fiche-corps mf-ancien"><p class="mgmt-fiche-origine">de ${esc(identite.ville)} · ${esc((COUNTRIES[mgmtIdentitePays(f)]||{}).name||'')} · « ${esc(identite.surnom)} »<br>${esc(rangs)}</p>${mgmtFicheCorpsOnglet(m,f,line,onglet)}</div></div></main>`;
  return mfEcran(contenu,{barre:'jeu',courant:mfSectionCourante('mgmt_fiche')||'effectif',m,plaque:'Effectif',libelle:'Combattant',compteur:`${Math.max(1,v.i+1)} / ${v.ids.length}`,
    droite:`${mgmtOrgNom(m)} Fight Night ${(m.eventsPlayed||0)+1}`,
    touches:[{ks:['Échap'],t:'Retour',onclick:'CL.mgmtFicheRetour()'},{ks:['←','→'],t:'Autre combattant'},{ks:['Tab'],t:'Onglet',onclick:'CL.mgmtFicheOnglet(1)'},
      {ks:['A','E'],t:'Section'},{ks:['Entrée'],t:onglet==='combats'?'Revoir le combat':'Préparer son combat',jaune:true,onclick:'CL.mgmtFicheEntree()'}]});
}
SCREENS.mgmt_fiche=scr_mgmt_fiche_cadre;

Object.assign(CL,{
  /** Un onglet par son identifiant, ou +1/−1 pour le suivant (les onglets grisés sont sautés). */
  mgmtFicheOnglet(x){
    const ids=MGMT_FICHE_ONGLETS.filter(o=>!mgmtFicheOngletGrise(o)).map(o=>o.id);
    if(typeof x==='number'){ const i=ids.indexOf(mgmtFicheOngletCourant()); MGMT_FICHE.onglet=ids[(i+(x<0?-1:1)+ids.length)%ids.length]; MGMT_FICHE.cursor=0; }
    else if(ids.includes(x)){ MGMT_FICHE.onglet=x; MGMT_FICHE.cursor=0; }
    render();
  },
  /** ← → : le combattant d'avant ou d'après dans sa catégorie. */
  mgmtFicheAutre(delta){
    const m=G&&G.mgmt, f=m&&mgmtFighterById(m,MGMT_FICHE.id); if(!f) return;
    const v=mgmtFicheVoisins(m,f); if(v.i<0||!v.ids.length) return;
    MGMT_FICHE.id=v.ids[(v.i+(delta<0?-1:1)+v.ids.length)%v.ids.length]; MGMT_FICHE.cursor=0; render();
  },
  mgmtFicheCarte(){ CL.go('mgmt_carte'); },
  mgmtFicheEntree(){ if(mgmtFicheOngletCourant()==='combats') CL.mgmtFicheRevoirSelection(); else CL.mgmtFicheCarte(); },
});
keysRegister('mgmt_fiche',{
  Tab(){ CL.mgmtFicheOnglet(1); },
  ArrowLeft(){ CL.mgmtFicheAutre(-1); },
  ArrowRight(){ CL.mgmtFicheAutre(1); },
  ArrowDown(){ CL.mgmtFicheDeplacer(1); },
  ArrowUp(){ CL.mgmtFicheDeplacer(-1); },
  Enter(){ CL.mgmtFicheEntree(); },
  Escape(){ CL.mgmtFicheRetour(); },
});
/* ==== [FIN ANCRE] ==== */
