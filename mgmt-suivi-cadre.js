"use strict";
/* ==== [ANCRE: MGMT_BRIEF_LOT10_ECRANS] — Brief du 06/10/2026, lot 10 : les cinq écrans du suivi du monde, portés des
   planches du canvas (« Classements — Hommes, poids léger », « Ceintures — Le mur », « La ceinture — Ouverte depuis le
   mur », « Camps — Le défilé », « Presse — La une », « Résultats — La une »). Chacun lit mgmt-suivi.js et ne stocke rien :
   l'état de l'écran vit en mémoire. Les classements nouveaux ne remplacent l'ancien écran que dans une partie à
   l'agenda (comme les contrats) ; les quatre autres sont neufs. Tout texte injecté passe par esc(). Les titres et
   phrases de presse sont des modèles relu:false (mgmt-suivi.js). ==== */

let MGMT_SU_CL={sexe:'H',div:'',curseur:0,portee:'organization',vue:'liste'};
let MGMT_SU_CE={sexe:'H',div:'',i:0,ouverte:false};
let MGMT_SU_CA={i:0};
let MGMT_SU_PR={filtre:'',i:0};
let MGMT_SU_RE={s:0,i:0,fen:0};

const MGMT_SU_FILTRES=[['','Tout'],['defi','Défis'],['presse','Presse'],['public','Public'],['combattant','Combattants']];
const MGMT_SU_LIGNES_CLASSEMENT=6;
const MF_SVG_GAGNE=c=>`<svg width="22" height="22" viewBox="0 0 26 26" aria-hidden="true" style="flex:none"><path d="M4 17L13 6l9 11z" fill="${c}"></path></svg>`;
const MF_SVG_PERDU='<svg width="22" height="22" viewBox="0 0 26 26" aria-hidden="true" style="flex:none"><path d="M4 9l9 11 9-11z" fill="#E23A2B"></path></svg>';

/** Une majuscule d'affiche qui garde les accents (« MONTAGNÉ », « DÉFIE ») ; mfNet sert aux mesures. */
function mgmtSuMaj(s){ return String(s==null?'':s).toLocaleUpperCase('fr').trim(); }

/* ---- Les pièces communes -------------------------------------------------------------------------- */

/** La catégorie d'un écran à deux niveaux (hommes / femmes, puis une catégorie) : celle de l'état si elle convient. */
function mgmtSuDiv(F){
  const duSexe=allDivisions().filter(d=>d.gender===F.sexe);
  if(F.div&&duSexe.some(d=>d.id===F.div)) return F.div;
  const pref=F.sexe==='F'?'F-straw':'H-light';
  return (duSexe.find(d=>d.id===pref)||duSexe[0]||allDivisions()[0]).id;
}
function mgmtSuSexeHtml(F,fnSexe){
  return `<div class="mf-eff-sexe"><button type="button" class="${F.sexe==='H'?'on':''}" onclick="${fnSexe}('H')">HOMMES</button><button type="button" class="${F.sexe==='F'?'on':''}" onclick="${fnSexe}('F')">FEMMES</button></div>`;
}
function mgmtSuPucesHtml(F,div,fnDiv){
  return `<div class="mf-eff-puces">`+allDivisions().filter(d=>d.gender===F.sexe).map(d=>`<button type="button" class="${d.id===div?'on':''}" aria-pressed="${d.id===div}" onclick="${fnDiv}('${esc(d.id)}')">${esc(mgmtEffectifPuce(d))}</button>`).join('')+`</div>`;
}
/** Un nom en deux lignes : le prénom petit, le nom grand, qui rétrécit pour tenir `largeur`.
 *  `marque` (monde lot 8 T1) : la chaîne HTML de mfMarqueNom, à la fin du prénom. */
function mgmtSuNom(n,largeurPx,pPrenom,pNom,mini,sur,marque=''){
  const nom=mgmtSuMaj(n.last||n.name), prenom=mgmtSuMaj(n.first||'');
  return `<span style="font-size:${pPrenom}px">${esc(prenom)}${sur?` <em style="font-style:normal;font-size:.8em;opacity:.86">« ${esc(mgmtSuMaj(sur))} »</em>`:''}${marque||''}</span><span style="font-size:${mfCorps(nom,largeurPx,pNom,mini||36)}px">${esc(nom)}</span>`;
}
/** Le nom court (« DAMAGAEV ») d'un combattant, en majuscules nettes. */
function mgmtSuCourt(m,id){ return mgmtSuMaj(mgmtNomParId(m,id).last); }
/** Une marque V / D / N pour l'issue d'un dernier combat. */
function mgmtSuMarque(issue){ return mfMarque(issue==='win'?'v':(issue==='loss'?'d':'n')); }

/* ---- Classements ------------------------------------------------------------------------------------ */

function mgmtSuEvolution(x,clair){
  if(x.delta===null||x.delta===0) return `<span class="mf-su-egal">=</span>`;
  if(x.delta==='nouveau') return `<span class="mf-su-nouv">nouveau</span>`;
  const gagne=x.delta>0, n=Math.abs(x.delta);
  return `<span class="mf-su-evo${gagne?'':' perdu'}">${gagne?MF_SVG_GAGNE(clair?'#0D0B0B':'#E9E6E1'):MF_SVG_PERDU}<b>${esc(n)}</b></span>`;
}
/* Demande d'Anthony du 08/10/2026 : sur les trois grandes cartes (champion, 1er, 2e) comme sur la planche, le prénom et le nom seuls — le surnom chevauchait le palmarès ; il reste dans le tableau et sur la fiche. */
function mgmtSuCarteClassement(m,x,selectionne,k){
  const n=mgmtNomParId(m,x.id), rec=`${x.W}-${x.L}-${x.D}`;
  const choisi=selectionne?' sel':'';
  if(x.champion){
    return `<button type="button" class="mf-su-champ${choisi}" onclick="CL.mgmtFiche('${esc(x.id)}')" aria-label="Champion ${esc(n.name)}">`
      +mfPanneau(`<div class="mf-su-champ-in"><div class="mf-su-champ-c" aria-hidden="true">C</div>`
        +`<div class="mf-su-champ-nom">${mgmtSuNom(n,330,44,104,52,'',mfMarqueNom(m,x.id))}</div>`
        +`<div class="mf-su-champ-box"><b>${esc(rec)}</b><span>${esc(x.serie)}</span></div></div>`,selectionne?'choisi':'normal')+`</button>`;
  }
  return `<button type="button" class="mf-su-rang${choisi}" onclick="CL.mgmtFiche('${esc(x.id)}')" aria-label="${esc(x.rang)} ${esc(n.name)}">`
    +mfPanneau(`<div class="mf-su-rang-in"><div class="mf-su-rang-evo">${mgmtSuEvolution(x,selectionne)}</div><div class="mf-su-rang-n">${esc(x.rang)}</div>`
      +`<div class="mf-su-rang-nom">${mgmtSuNom(n,230,36,76,36,'',mfMarqueNom(m,x.id))}</div>`
      +`<div class="mf-su-rang-box"><b>${esc(rec)}</b><span>${esc(x.serie)}</span></div></div>`,selectionne?'choisi':'normal')+`</button>`;
}
function mgmtSuLigneClassement(m,x,selectionne,k){
  const n=mgmtNomParId(m,x.id), d=x.dernier;
  const dernier=d?`${mgmtSuMarque(d.issue)}<span>${esc(d.famille)}${d.adv?', contre '+esc(d.adv):''}</span>`:'<span>—</span>';
  return `<button type="button" class="mf-su-ligne${selectionne?' sel':''}" onclick="CL.mgmtFiche('${esc(x.id)}')">`
    +`<div class="mf-su-l-rang">${esc(x.rang)}</div><div class="mf-su-l-evo">${mgmtSuEvolution(x,selectionne)}</div>`
    +`<div class="mf-su-l-nom"><b>${esc(mgmtSuMaj(n.last||n.name))}</b><span>${esc(n.first)}${(()=>{ const s=mgmtSurnomDe(m,x.id); return s?` · « ${esc(mgmtSuMaj(s))} »`:''; })()}</span>${mfMarqueNom(m,x.id)}</div>`
    +`<div class="mf-su-l-rec">${esc(x.W)}-${esc(x.L)}-${esc(x.D)}</div><div class="mf-su-l-serie">${esc(x.serie)}</div><div class="mf-su-l-dernier">${dernier}</div></button>`;
}

function scr_mgmt_classements_cadre(){
  const m=G.mgmt, F=MGMT_SU_CL, div=mgmtSuDiv(F); F.div=div;
  if(!['liste','meilleurs','records'].includes(F.vue)) F.vue='liste';
  if(F.vue==='meilleurs') return scr_mgmt_meilleurs_cadre();
  if(F.vue==='records') return scr_mgmt_records_cadre();
  const lignes=mgmtClassementLignes(m,div,F.portee);
  if(F.curseur>=lignes.length) F.curseur=Math.max(0,lignes.length-1);
  if(F.curseur<0) F.curseur=0;
  /* Les trois premières places sont des cartes (le champion, puis les rangs 1 et 2) ; le reste est un tableau. */
  const tete=Math.min(3,lignes.length);
  const cartes=lignes.slice(0,tete).map((x,k)=>mgmtSuCarteClassement(m,x,k===F.curseur,k)).join('');
  const reste=lignes.slice(tete);
  const debut=Math.min(Math.max(0,F.curseur-tete-MGMT_SU_LIGNES_CLASSEMENT+1),Math.max(0,reste.length-MGMT_SU_LIGNES_CLASSEMENT));
  const fenetre=reste.slice(debut,debut+MGMT_SU_LIGNES_CLASSEMENT);
  const rangees=fenetre.map((x,k)=>mgmtSuLigneClassement(m,x,tete+debut+k===F.curseur,tete+debut+k)).join('');
  const entete=['Rang','Évolution','Combattant','Palmarès','Série en cours','Dernier combat'].map(t=>`<div>${esc(t)}</div>`).join('');
  const asc=reste.length>MGMT_SU_LIGNES_CLASSEMENT
    ?`<div class="mf-su-asc"><div style="height:${Math.round(100*MGMT_SU_LIGNES_CLASSEMENT/reste.length)}%;margin-top:${Math.round(100*debut/reste.length)}%"></div></div>`:'';
  const premier=reste.length?reste[debut].rang:0, dernierRang=reste.length?fenetre[fenetre.length-1].rang:0;
  const pied=`<div class="mf-su-pied"><span>${reste.length?`RANGS ${premier} À ${dernierRang} SUR ${lignes.filter(x=>!x.champion).length}`:'AUCUN AUTRE CLASSÉ'}</span>`
    +`<span class="mf-su-legende">${MF_SVG_GAGNE('#E9E6E1')}${MF_SVG_PERDU}<span>PLACES GAGNÉES OU PERDUES DEPUIS LA DERNIÈRE SOIRÉE</span></span></div>`;
  const table=mfPanneau(`<div class="mf-su-table"><div class="mf-su-entete">${entete}</div>${rangees||'<div class="mf-eff-aucun">Personne d’autre dans cette catégorie.</div>'}${asc}${pied}</div>`,'normal','mf-su-tablep');
  const contenu=`<main class="mf-contenu mf-su"><div class="mf-eff-barre">${mgmtSuSexeHtml(F,'CL.mgmtSuClSexe')}<div class="mf-eff-trait"></div>${mgmtSuPucesHtml(F,div,'CL.mgmtSuClDiv')}</div>`
    +`<div class="mf-su-cartes">${cartes||'<div class="mf-eff-aucun">Aucun combattant classé.</div>'}</div>${table}</main>`;
  const d=divById(div);
  const onglets=[['liste',F.portee==='world'?'MONDIAL':'SPLIT'],['meilleurs','LES MEILLEURS'],['records','LES RECORDS']].map(([vue,t])=>({t,on:F.vue===vue,onclick:`CL.mgmtSuClVue('${vue}')`}));
  return mfEcran(contenu,{barre:'jeu',courant:'classements',m,plaque:'Classements',onglets,libelle:F.portee==='world'?'Mondial · '+String(d.name).replace(/^Poids /,'').toUpperCase():String(d.name).toUpperCase(),
    droite:`${mgmtOrgNom(m)} Fight Night ${(m.eventsPlayed||0)+1}`,
    touches:[{ks:['Échap'],t:'Retour',onclick:"CL.go('mgmt_carte')"},{ks:['↑','↓'],t:'Choisir'},{ks:['G'],t:'Hommes ou femmes',onclick:'CL.mgmtSuClSexe()'},
      {ks:['Tab'],t:'Catégorie / onglet',onclick:'CL.mgmtSuClCategorie(1)'},{ks:['M'],t:F.portee==='world'?'Classement de l’organisation':'Classement mondial',onclick:'CL.mgmtSuClPortee()'},{ks:['V'],t:'Changer de vue',onclick:'CL.mgmtSuClVueSuivante()'},
      {ks:['A','E'],t:'Section'},{ks:['Entrée'],t:'Ouvrir sa fiche',jaune:true,onclick:'CL.mgmtSuClOuvrir()'}]});
}

/* ---- Ceintures : le mur, puis une ceinture ----------------------------------------------------------- */

function mgmtSuCeintureCarte(m,d,k,selectionne){
  const belt=mgmtSplitTitle(m,d.id), n=belt.id?mgmtNomParId(m,belt.id):null;
  const pr=mgmtPretendant(m,d.id), npr=pr?mgmtSuCourt(m,pr.id):'—';
  const duree=belt.id&&belt.since!==null?mgmtDureeTexte(m,mgmtSoireeSince(m,belt),m.eventsPlayed||0):null;
  const corps=belt.id
    ?`<div class="mf-su-ce-nom"><span>${esc(n.first)}${mfMarqueNom(m,belt.id)}</span><b style="font-size:${mfCorps(n.last||n.name,330,64,34)}px">${esc(mgmtSuMaj(n.last||n.name))}</b></div>`
      +`<div class="mf-su-ce-def"><div class="mf-su-ce-n"><b>${esc(belt.defenses)}</b><span>${belt.defenses>1?'DÉFENSES':'DÉFENSE'}</span></div>`
      +`<div class="mf-su-ce-depuis"><span>${duree?'DEPUIS':'SOIRÉE'}</span><b>${esc(duree||('N°'+mgmtSoireeSince(m,belt)))}</b></div></div>`
    :`<div class="mf-su-ce-nom"><span>Personne ne la porte</span><b style="font-size:50px">TITRE VACANT</b></div>`;
  return `<button type="button" class="mf-su-ce${selectionne?' sel':''}" onclick="CL.mgmtSuCeChoisir(${k})" ondblclick="CL.mgmtSuCeOuvre()" aria-label="${esc(mgmtEffectifPuce(d))}">`
    +mfPanneau(`<div class="mf-su-ce-in"><div class="mf-su-ce-titre">${esc(mgmtEffectifPuce(d))}</div><div class="mf-su-ce-corps">${corps}`
      +`<div class="mf-su-ce-pret"><span>Prétendant</span><b>${esc(npr)}</b></div></div></div>`,selectionne?'choisi':'normal')+`</button>`;
}
/** La soirée où le champion actuel a pris la ceinture (0 : au début de la partie). */
function mgmtSoireeSince(m,belt){
  const l=mgmtCeintureLignee(m,belt.div||''), r=l.actuel; return r?r.depuis:0;
}

function mgmtSuCeinturesMur(m){
  const F=MGMT_SU_CE, divs=allDivisions().filter(d=>d.gender===F.sexe);
  if(F.i>=divs.length) F.i=Math.max(0,divs.length-1);
  const cartes=divs.map((d,k)=>mgmtSuCeintureCarte(m,d,k,k===F.i)).join('');
  const contenu=`<main class="mf-contenu mf-su"><div class="mf-eff-barre">${mgmtSuSexeHtml(F,'CL.mgmtSuCeSexe')}<div class="mf-eff-trait"></div>`
    +`<div class="mf-su-compte">${divs.length} CEINTURES, UNE PAR CATÉGORIE</div></div><div class="mf-su-mur">${cartes}</div></main>`;
  return mfEcran(contenu,{barre:'jeu',courant:'ceintures',m,plaque:'Ceintures',libelle:'Le mur',droite:`${mgmtOrgNom(m)} Fight Night ${(m.eventsPlayed||0)+1}`,
    touches:[{ks:['Échap'],t:'Retour',onclick:"CL.go('mgmt_carte')"},{ks:['←','→'],t:'Choisir'},{ks:['G'],t:'Hommes ou femmes',onclick:'CL.mgmtSuCeSexe()'},
      {ks:['A','E'],t:'Section'},{ks:['Entrée'],t:'Ouvrir la ceinture',jaune:true,onclick:'CL.mgmtSuCeOuvre()'}]});
}

function mgmtSuReignLigne(m,r,k,total,actuelle){
  const n=mgmtNomParId(m,r.id);
  const an=n=>{ const j=mgmtSoireeJour(m,n); return Number.isFinite(j)?new Date(MGMT_CALENDRIER_DEBUT+j*86400000).getUTCFullYear():null; };
  const a1=an(r.depuis), a2=r.jusqua===null?null:an(r.jusqua), annees=a1===null?'':' · '+(a2===null||a2===a1?a1:a1+'-'+a2);   /* Monde lot 1 T6 : les règnes du passé se datent */
  const sous=(r.jusqua===null?(r.depuis===0?'Depuis le début':'Depuis la soirée '+r.depuis):(r.depuis===0?`Du début à la soirée ${r.jusqua}`:`Soirées ${r.depuis} à ${r.jusqua}`))+annees;
  const marque=actuelle?`<div class="mf-su-r-c" aria-label="Champion actuel">C</div>`:`<div class="mf-su-r-n">${esc(total-k)}</div>`;
  return `<div class="mf-su-reign${actuelle?' actuel':''}">${marque}<div class="mf-su-r-nom"><div><b>${esc(mgmtSuMaj(n.last||n.name))}</b><span>${esc(n.first)}</span>${mfMarqueNom(m,r.id)}</div><span class="mf-su-r-sous">${esc(sous)}</span></div>`
    +`<b class="mf-su-r-def">${esc(r.defenses)} ${r.defenses>1?'DÉFENSES':'DÉFENSE'}</b></div>`;
}

function mgmtSuCeintureDetail(m){
  const F=MGMT_SU_CE, div=mgmtSuDiv(F); F.div=div;
  const d=divById(div), lignee=mgmtCeintureLignee(m,div), belt=mgmtSplitTitle(m,div);
  const n=belt.id?mgmtNomParId(m,belt.id):null, f=belt.id?mgmtFighterById(m,belt.id):null;
  const fem=d.gender==='F', nomCat=String(d.name).replace(/^Poids /,'').toUpperCase();
  const rec=f?`${f.W}-${f.L}-${f.D||0}`:'', serie=f?mgmtSerieTexte(mgmtSerie(m,f)):'';
  const champ=belt.id
    ?`<div class="mf-su-det-c">C</div><div class="mf-su-det-nom">${mgmtSuNom(n,640,56,150,60,'',mfMarqueNom(m,belt.id))}</div>`
      +`<div class="mf-su-det-box"><b>${esc(rec)}</b><span>${esc(serie)}</span></div>`
      +`<div class="mf-su-det-btn">${mfBouton('Ouvrir sa fiche',{touche:'Entrée',jaune:true,onclick:'CL.mgmtSuCeFiche()'})}</div>`
    :`<div class="mf-su-det-nom"><span style="font-size:56px">LA CEINTURE</span><span style="font-size:130px">VACANTE</span></div>`;
  const gauche=mfPanneau(`<div class="mf-su-det-in"><div class="mf-su-det-tag">${fem?'CHAMPIONNE':'CHAMPION'} DES POIDS ${esc(nomCat)}</div>${champ}</div>`,'choisi','mf-su-det');
  const rs=lignee.reigns.slice().reverse();
  const lignes=rs.slice(0,5).map((r,k)=>mgmtSuReignLigne(m,r,k,rs.length,k===0&&lignee.actuel===r)).join('');
  const liste=mfPanneau(`<div class="mf-su-lignee"><div class="mf-su-lignee-t"><span class="mf-su-tag">LA LIGNÉE</span><span class="mf-su-dim">${rs.length} CHAMPION${rs.length>1?'S':''}</span></div>`
    +`<div class="mf-su-reigns">${lignes||'<div class="mf-eff-aucun">Aucun champion pour l’instant.</div>'}</div><div class="mf-su-dim2">${rs.length>5?`Les 5 derniers sur ${rs.length}.`:'Du champion actuel au tout premier.'}</div></div>`,'normal','mf-su-lig');
  const r=lignee.actuel, nS=m.eventsPlayed||0;
  const duree=r?mgmtDureeTexte(m,r.depuis,nS):null;
  const regne=r
    ?`<b>${esc(r.defenses)} ${r.defenses>1?'DÉFENSES':'DÉFENSE'}</b>${duree?`<b>EN ${esc(duree)}</b>`:''}<span>${r.depuis===0?'Champion depuis le début':'Champion depuis la soirée '+r.depuis}</span>`
    :`<b>TITRE VACANT</b><span>Personne ne porte cette ceinture.</span>`;
  const dd=r&&r.derniere?r.derniere:null;
  let derniere='<b>AUCUNE</b><span>Pas encore de défense.</span>';
  if(dd){
    const det=mgmtResultatDetail(m,dd.fight);
    derniere=`<b>${esc(mgmtSuCourt(m,r.id))}</b><b>BAT ${esc(mgmtSuCourt(m,dd.adv))}</b><span>${esc(det?det.methode:'')}, à la soirée ${esc(dd.n)}</span>`;  }
  const pr=mgmtPretendant(m,div);
  const pret=pr
    ?`<b>N°1</b><b>${esc(mgmtNomParId(m,pr.id).name.toUpperCase())}</b><span>${pr.surCarte?'Sur la carte, contre '+esc(mgmtNomParId(m,pr.surCarte.adv).last):'Pas encore sur la carte'}</span>`
    :'<b>PERSONNE</b><span>Aucun autre classé.</span>';
  const carte=(tag,html)=>mfPanneau(`<div class="mf-su-info"><span class="mf-su-tag">${esc(tag)}</span><div class="mf-su-info-c">${html}</div></div>`,'normal','mf-su-i');
  const bas=`<div class="mf-su-infos">${carte('SON RÈGNE',regne)}${carte('SA DERNIÈRE DÉFENSE',derniere)}${carte('LE PRÉTENDANT',pret)}</div>`;
  const contenu=`<main class="mf-contenu mf-su"><div class="mf-eff-barre">${mgmtSuSexeHtml(F,'CL.mgmtSuCeSexe')}<div class="mf-eff-trait"></div>${mgmtSuPucesHtml(F,div,'CL.mgmtSuCeDiv')}</div>`
    +`<div class="mf-su-haut">${gauche}${liste}</div>${bas}</main>`;
  return mfEcran(contenu,{barre:'jeu',courant:'ceintures',m,plaque:'Ceinture',libelle:String(d.name).toUpperCase(),droite:`${mgmtOrgNom(m)} Fight Night ${(m.eventsPlayed||0)+1}`,
    touches:[{ks:['Échap'],t:'Retour au mur',onclick:'CL.mgmtSuCeFerme()'},{ks:['G'],t:'Hommes ou femmes',onclick:'CL.mgmtSuCeSexe()'},{ks:['Tab'],t:'Catégorie',onclick:'CL.mgmtSuCeCategorie(1)'},
      {ks:['A','E'],t:'Section'},{ks:['Entrée'],t:'Ouvrir sa fiche',jaune:true,onclick:'CL.mgmtSuCeFiche()'}]});
}
function scr_mgmt_ceintures(){
  if(!G||!G.mgmt) return scr_mgmt_bureau();
  return MGMT_SU_CE.ouverte?mgmtSuCeintureDetail(G.mgmt):mgmtSuCeinturesMur(G.mgmt);
}
SCREENS.mgmt_ceintures=scr_mgmt_ceintures;

/* ---- Camps : le défilé --------------------------------------------------------------------------------- */

const MGMT_SU_COULEURS_CAMP=['#B32A1E','#1F4E8C','#C9962A','#1C7A5A','#D2641C','#A3216B','#1B8C8F'];
function mgmtSuCoulCamp(g){ return MGMT_SU_COULEURS_CAMP[duelFnv1a32('couleur|'+g.cle)%MGMT_SU_COULEURS_CAMP.length]; }

function mgmtSuCampPetit(m,g,k,cote){
  const n=g.membres.length, coach=g.coach;
  const bas=g.champion?`<div class="mf-su-ca-champ"><div class="mf-eff-c">C</div><span>UN CHAMPION</span></div>`:'<div></div>';
  return `<button type="button" class="mf-su-ca-p" onclick="CL.mgmtSuCaChoisir(${k})" aria-label="${esc(g.nom)}">`
    +mfPanneau(`<div class="mf-su-ca-pin"><div class="mf-su-ca-ptete"><span>${esc(mgmtSuMaj(g.ville))}</span><b style="font-size:${mfCorps(g.nom,274,56,24)}px">${esc(mgmtSuMaj(g.nom))}</b></div>`
      +`<div class="mf-su-ca-pcorps"><div class="mf-su-ca-pn"><b>${esc(n)}</b><span>COMBATTANT${n>1?'S':''}</span></div>`
      +`<div class="mf-su-ca-pcoach"><span>LE COACH</span><div>${esc(coach)}</div></div><div class="mf-su-ca-pbas">${bas}<span class="mf-k">${cote<0?'←':'→'}</span></div></div></div>`,'cote')+`</button>`;
}
function mgmtSuCampGrand(m,g){
  const n=g.membres.length, couleur=mgmtSuCoulCamp(g), mots=String(g.coach).split(' ');
  const prenom=mots.shift()||'', nom=mots.join(' ');
  const lignes=g.membres.slice(0,6).map(f=>{
    return `<div class="mf-su-ca-m"><div class="mf-su-ca-mn"><b>${esc(mgmtSuMaj(f.last||f.name))}</b><span>${esc(f.first||'')}</span>${mfMarqueNom(m,f.id)}</div>`
      +`<span class="mf-su-ca-mc">${esc(mgmtEffectifPuce(divById(f.div)).charAt(0)+mgmtEffectifPuce(divById(f.div)).slice(1).toLowerCase())}</span><b>${esc(mgmtRangTexte(m,f))}</b></div>`;
  }).join('');
  const refus=g.refus?`<div class="mf-su-ca-refus">S’ils se battent, ils le prennent mal.</div>`:'<div></div>';
  const titreEffectif=n>6?`LES 6 PREMIERS SUR ${n}`:`SES ${n} COMBATTANT${n>1?'S':''} CHEZ TOI`;
  const autres=n>6?`<div class="mf-su-ca-m">+ ${n-6} autres : voir l’effectif</div>`:'';
  const corps=`<div class="mf-su-ca-g1"><div class="mf-su-ca-bloc"><span>LE COACH</span><b>${esc(mgmtSuMaj(prenom))}${nom?'<br>'+esc(mgmtSuMaj(nom)):''}</b></div>`
    +`<div class="mf-su-ca-bloc"><span>ON Y TRAVAILLE</span><b class="mf-su-ca-spec">${esc(mgmtSuMaj(g.specialite.libelle))}</b></div></div>`
    +`<div class="mf-su-ca-g2"><span class="mf-su-ca-l">${titreEffectif}</span><div class="mf-su-ca-ms">${lignes}${autres}</div></div>`;
  const bas=`<div class="mf-su-ca-bas">${refus}${mfBouton('Voir ses combattants',{touche:'Entrée',jaune:true,onclick:'CL.mgmtSuCaVoir()'})}</div>`;
  return `<div class="mf-su-ca-gr">`+mfPanneau(`<div class="mf-su-ca-gin"><div class="mf-su-ca-gtete" style="background:${couleur}"><div><span>${esc(mgmtSuMaj(g.ville))}</span><b style="font-size:${mfCorps(g.nom,560,116,44)}px">${esc(mgmtSuMaj(g.nom))}</b></div>`
    +`<div class="mf-su-ca-gn"><b>${esc(n)}</b><span>COMBATTANT${n>1?'S':''}</span></div></div><div class="mf-su-ca-gcorps">${corps}${bas}</div></div>`,'choisi')+`</div>`;
}
function scr_mgmt_camps(){
  if(!G||!G.mgmt) return scr_mgmt_bureau();
  const m=G.mgmt, liste=mgmtCampsListe(m);
  if(MGMT_SU_CA.i>=liste.length) MGMT_SU_CA.i=Math.max(0,liste.length-1);
  if(MGMT_SU_CA.i<0) MGMT_SU_CA.i=0;
  const i=MGMT_SU_CA.i;
  let corps;
  if(!liste.length) corps=`<div class="mf-eff-aucun">Aucun camp pour l’instant.</div>`;
  else{
    const n=liste.length, g=liste[i], ia=(i-1+n)%n, ib=(i+1)%n, av=n>=2?liste[ia]:null, ap=n>=3?liste[ib]:null;
    corps=`<div class="mf-su-ca-rang">${av?mgmtSuCampPetit(m,av,ia,-1):'<div class="mf-su-ca-p vide"></div>'}${mgmtSuCampGrand(m,g)}${ap?mgmtSuCampPetit(m,ap,ib,1):'<div class="mf-su-ca-p vide"></div>'}</div>`;
  }
  const debut=Math.min(Math.max(0,i-3),Math.max(0,liste.length-7));
  const puces=liste.slice(debut,debut+7).map((g,k)=>`<button type="button" class="${debut+k===i?'on':''}" onclick="CL.mgmtSuCaChoisir(${debut+k})">${esc(mgmtSuMaj(g.nom))}</button>`).join('');
  const contenu=`<main class="mf-contenu mf-su mf-su-camps">${corps}<div class="mf-su-ca-puces">${puces}</div></main>`;
  return mfEcran(contenu,{barre:'jeu',courant:'camps',m,plaque:'Camps',libelle:liste.length?`${liste.length} salle${liste.length>1?'s':''}`:'',droite:`${mgmtOrgNom(m)} Fight Night ${(m.eventsPlayed||0)+1}`,
    touches:[{ks:['Échap'],t:'Retour',onclick:"CL.go('mgmt_carte')"},{ks:['←','→'],t:'Autre salle'},{ks:['A','E'],t:'Section'},{ks:['Entrée'],t:'Voir ses combattants',jaune:true,onclick:'CL.mgmtSuCaVoir()'}]});
}
SCREENS.mgmt_camps=scr_mgmt_camps;

/* ---- La une : la pièce commune de Presse et de Résultats ------------------------------------------------ */

/** Le grand cadre de la une : le fond rouge en biais, la barre blanche, l'étiquette, le titre, le pied. */
function mgmtSuHero(tag,sousTag,titre,corps,pied){
  return mfPanneau(`<div class="mf-su-hero"><div class="mf-su-h-rouge"></div><div class="mf-su-h-blanc"></div>`
    +`<div class="mf-su-h-tag"><span class="mf-su-tag rouge">${esc(tag)}</span><span class="mf-su-dim">${esc(sousTag)}</span></div>`
    +`<div class="mf-su-h-titre">${titre}</div><div class="mf-su-h-corps">${corps}</div><div class="mf-su-h-pied">${pied}</div></div>`,'choisi','mf-su-herop');
}
function mgmtSuCoteGrand(tag,sousTag,titre,corps){
  return mfPanneau(`<div class="mf-su-cote"><div class="mf-su-cote-t"><span class="mf-su-tag rouge">${esc(tag)}</span><span class="mf-su-dim">${esc(sousTag)}</span></div><div class="mf-su-cote-titre">${titre}</div><div class="mf-su-cote-c">${corps}</div></div>`,'normal','mf-su-cotep');
}
function mgmtSuPetit(tag,sousTag,titre,corps,onclick){
  return `<button type="button" class="mf-su-pt" onclick="${onclick}">`+mfPanneau(`<div class="mf-su-pt-in"><div class="mf-su-pt-t"><span class="mf-su-tag rouge pt">${esc(tag)}</span><span class="mf-su-dim">${esc(sousTag)}</span></div><div class="mf-su-pt-titre">${titre}</div><div class="mf-su-pt-c">${corps}</div></div>`,'normal')+`</button>`;
}
function mgmtSu2Lignes(a,b,fs,largeur){
  const corps=mfCorps(a.length>b.length?a:b,largeur,fs,40);
  return `<span style="font-size:${corps}px">${esc(mgmtSuMaj(a))}</span><span style="font-size:${corps}px">${esc(mgmtSuMaj(b))}</span>`;
}
function mgmtSuUne(hero,cote,petits){
  return `<div class="mf-su-une"><div class="mf-su-une-h">${hero}${cote}</div><div class="mf-su-une-p">${petits.join('')}</div></div>`;
}

/* ---- Presse --------------------------------------------------------------------------------------------- */

function mgmtSuPresseTitreHtml(m,x,fs,largeur){
  const a=mgmtSuCourt(m,x.a), b=x.b?mgmtSuCourt(m,x.b):'';
  if(x.k==='defi') return mgmtSu2Lignes(a,`DÉFIE ${b}`,fs,largeur);
  if(x.k==='public') return mgmtSu2Lignes('LE PUBLIC RÉCLAME','CE COMBAT',fs,largeur);
  if(x.k==='combattant'){ return x.w==='attend'?mgmtSu2Lignes(`${a} ATTEND`,`DEPUIS ${x.n} MOIS`,fs,largeur):mgmtSu2Lignes(a,'FAIT UNE DEMANDE',fs,largeur); }
  if(x.w==='garde') return mgmtSu2Lignes(`${a} GARDE`,'SA CEINTURE',fs,largeur);
  if(x.w==='prend') return mgmtSu2Lignes(a,'DEVIENT CHAMPION',fs,largeur);
  if(x.w==='vacant') return mgmtSu2Lignes(a,'PREND LE TITRE VACANT',fs,largeur);
  if(x.w==='resultat') return mgmtSu2Lignes(a,`BAT ${b}`,fs,largeur);
  return `<span style="font-size:${fs*0.77}px">« ${esc(mgmtSuMaj(x.t||''))} »</span>`;
}
function mgmtSuPresseSous(m,x){
  if(x.k==='defi'){ const w={revanche:'Réclame sa revanche.',trilogie:'Réclame le troisième combat.'}[x.w]||''; return w; }
  if(x.k==='public') return `${mgmtSuCourt(m,x.a)} contre ${mgmtSuCourt(m,x.b)}`;
  if(x.k==='combattant') return x.w==='attend'?'Veut un combat.':'Attend ta réponse.';
  if(x.w==='garde'||x.w==='prend'||x.w==='vacant'||x.w==='resultat'){ const d=Number.isSafeInteger(x.f)?mgmtResultatDetail(m,x.f):null; return d?`${d.methode}, contre ${mgmtSuCourt(m,x.b)}`:''; }
  /* Brief démo, lot 4 (D2) : la légende nomme les deux combattants du combat dont parle la citation, jamais un adversaire d'un autre. */
  const tr=Number.isSafeInteger(x.f)&&m.hist?m.hist[x.f]:null;
  if(tr&&tr.a&&tr.b) return `Sur ${mgmtSuCourt(m,tr.a.id)} face à ${mgmtSuCourt(m,tr.b.id)}.`;
  return x.b?`Sur ${mgmtSuCourt(m,x.a)} face à ${mgmtSuCourt(m,x.b)}.`:'';
}

/* ==== [ANCRE: MGMT_PRESENTATION_PRESSE_CIBLE] — Monde lot 3 T5 ==== */
function mgmtSuPresentationCible(m,x){
  if(!x) return null;
  const t=Number.isSafeInteger(x.f)&&x.f>=0?m.hist[x.f]:null,h=t?x.f:undefined,a=t?t.a.id:x.a,b=t?t.b.id:x.b;
  if(mgmtPresentationCombat({m,h},a,b)) return {mode:'combat',ids:[a,b],h};
  return mgmtPresentationCombattant({m,h},a)?{mode:'combattant',ids:[a],h}:null;
}
function mgmtSuHeroPresse(m,x,voisine){
  const age=mgmtFilAge(m,x), surCarte=(x.k==='defi'||x.k==='public')&&mgmtFilSurCarte(m,x);
  let pied='';
  if(x.k==='defi'||x.k==='public'){
    const prep=mgmtFilPreparable(m,x);
    pied=`<div class="mf-su-statut">${surCarte?'<span>Combat confirmé sur la carte</span>':`<i class="mf-eff-q">?</i><span>Combat à confirmer</span>`}</div>`
      +(prep&&!surCarte?mfBouton('Préparer ce combat',{touche:'Entrée',jaune:true,onclick:'CL.mgmtSuPrEntree()'}):'');
    if(!prep&&!surCarte) pied=`<div class="mf-su-statut"><span>Pas possible pour l’instant</span></div>`;
  }else if(Number.isSafeInteger(x.f)) pied=mfBouton('Voir le résultat',{touche:'Entrée',jaune:true,onclick:'CL.mgmtSuPrEntree()'});
  else pied=mfBouton('Sa fiche',{touche:'Entrée',jaune:true,onclick:'CL.mgmtSuPrEntree()'});
  /* ==== [ANCRE: MGMT_PRESENTATION_PRESSE_BOUTON] — Monde lot 3 T5 ==== */
  if(mgmtSuPresentationCible(m,x)) pied+=mfBouton('Présentation',{onclick:'CL.mgmtSuPresentation()'});
  const corps=x.k==='defi'&&x.t?`<div class="mf-su-quote"><div>« ${esc(x.t)} »</div><span>${esc(mgmtNomParId(m,x.a).name)}</span></div>`:`<div class="mf-su-quote"><span>${esc(mgmtSuPresseSous(m,x))}</span></div>`;
  return mgmtSuHero(MGMT_FIL_LIBELLES[x.k].toUpperCase(),age,mgmtSuPresseTitreHtml(m,x,104,520),corps,pied);
}
function mgmtSuCotePresse(m,l){
  if(!l) return mgmtSuCoteGrand('LA PRESSE','','<span style="font-size:60px">PAS ENCORE DE PRESSE</span>','<span class="mf-su-dim">Rien n’a encore été écrit sur ce combat.</span>');
  const media=l.x?(mgmtMediaDe(l.x)||{nom:''}).nom:'';
  const n=String(l.t).length, fs=n>70?40:(n>44?52:(n>26?64:80));
  return mgmtSuCoteGrand('LA PRESSE',mgmtFilAge(m,l),`<span style="font-size:${fs}px"><span class="mf-su-guil">«</span> ${esc(mgmtSuMaj(l.t))} <span class="mf-su-guil">»</span></span>`,
    `<b>${esc(media)}</b><span>${esc(mgmtSuPresseSous(m,l))}</span>`);
}
function mgmtSuPetitePresse(m,x,i){
  const sous=x.k==='defi'||x.k==='public'?mgmtSuPresseSous(m,x):mgmtSuPresseSous(m,x);
  return mgmtSuPetit(MGMT_FIL_LIBELLES[x.k].toUpperCase(),mgmtFilAge(m,x),mgmtSuPresseTitreHtml(m,x,48,440),`<span class="mf-su-dim">${esc(sous)}</span>`,`CL.mgmtSuPrChoisir(${i})`);
}

/** Ce que fait Entrée sur la nouvelle choisie : la même chose dit la légende et le bouton (brief démo, lot 4, D6). */
function mgmtSuPresseEntreeTexte(m,x){
  if(!x) return 'Sa fiche';
  if((x.k==='defi'||x.k==='public')&&mgmtFilPreparable(m,x)&&!mgmtFilSurCarte(m,x)) return 'Préparer ce combat';
  if(Number.isSafeInteger(x.f)) return 'Voir le résultat';
  return 'Sa fiche';
}
function scr_mgmt_presse(){
  if(!G||!G.mgmt) return scr_mgmt_bureau();
  const m=G.mgmt, F=MGMT_SU_PR;
  const liste=mgmtFilListe(m,F.filtre||null);
  if(F.i>=liste.length) F.i=Math.max(0,liste.length-1);
  if(F.i<0) F.i=0;
  const puces=`<div class="mf-eff-puces">`+MGMT_SU_FILTRES.map(([k,t])=>`<button type="button" class="${F.filtre===k?'on':''}" aria-pressed="${F.filtre===k}" onclick="CL.mgmtSuPrFiltre('${k}')">${esc(t.toUpperCase())}</button>`).join('')+`</div>`;
  let corps;
  if(!liste.length) corps=`<div class="mf-su-vide">${mfPanneau(`<div class="mf-eff-aucun">Rien à lire pour l’instant : les nouvelles arrivent avec les soirées.</div>`,'normal')}</div>`;
  else{
    const x=liste[F.i], vois=mgmtFilVoisine(m,x);
    const suite=liste.slice(F.i+1,F.i+4).map((y,k)=>mgmtSuPetitePresse(m,y,F.i+1+k));
    corps=mgmtSuUne(mgmtSuHeroPresse(m,x,vois),mgmtSuCotePresse(m,vois),suite);
  }
  const contenu=`<main class="mf-contenu mf-su"><div class="mf-eff-barre">${puces}</div>${corps}</main>`;
  return mfEcran(contenu,{barre:'jeu',courant:'presse',m,plaque:'Presse',libelle:liste.length?`${liste.length} nouvelle${liste.length>1?'s':''} cette semaine`:'',droite:`${mgmtOrgNom(m)} Fight Night ${(m.eventsPlayed||0)+1}`,
    touches:[{ks:['Échap'],t:'Retour',onclick:"CL.go('mgmt_carte')"},{ks:['←','→'],t:'Choisir'},{ks:['Tab'],t:'Filtre',onclick:'CL.mgmtSuPrFiltreSuivant()'},{ks:['A','E'],t:'Section'},
      {ks:['Entrée'],t:liste.length?mgmtSuPresseEntreeTexte(m,liste[F.i]):'Sa fiche',jaune:true,onclick:'CL.mgmtSuPrEntree()'}]});
}
SCREENS.mgmt_presse=scr_mgmt_presse;

/* ---- Résultats ------------------------------------------------------------------------------------------ */

/** Les combats d'une soirée dans l'ordre de l'écran : la carte principale d'abord, puis les préliminaires, chaque groupe dans l'ordre
 *  d'affichage du jeu. Un combat illisible reste dans la liste (d vaut null) : jamais de combat retiré, jamais de ligne muette.
 *  @param {object} m la partie  @param {{idx:number[]}} s une soirée de mgmtSoirees
 *  @returns {Array<{d:(object|null),k:number,i:number,main:boolean}>} k : rang dans la liste, i : index dans m.hist */
function mgmtSuResultatsListe(m,s){
  const tous=mgmtSoireeAffichage(m,s).map(i=>({d:mgmtResultatDetail(m,i),i,main:m.hist[i].slot==='main'}));
  return tous.filter(x=>x.main).concat(tous.filter(x=>!x.main)).map((x,k)=>({d:x.d,k,i:x.i,main:x.main}));
}
function mgmtSuRoundLigne(d){ return d.nul?`Match nul ${mgmtRoundTexte(d)}`:`${d.methode}, ${mgmtRoundTexte(d)}`; }

/* ==== [ANCRE: MONDE_LOT2_T8_RESULTATS] — Monde lot 2 T8 (décision du 12/10/2026, retour d'Anthony) : à gauche la liste des soirées (date + combat
   principal), à droite tous les combats de la soirée choisie en tableau ; le rouge n'est plus la couleur d'un résultat ; une ligne d'aide dit ce
   que fait Entrée. ====*/
/** Le combat principal d'une soirée en une ligne : « Gosselin bat Dzhabrailova ». Vide si le combat est illisible. */
function mgmtSuPrincipalLigne(m,s){
  const x=mgmtSuResultatsListe(m,s)[0]; if(!x||!x.d) return '';
  const g=x.d.gagnant.last||x.d.gagnant.name, p=x.d.perdant.last||x.d.perdant.name;
  return x.d.nul?`${g} et ${p} : match nul`:`${g} bat ${p}`;
}
/* ==== [FIN ANCRE] ====*/

/* ==== [ANCRE: MONDE_LOT10_T3_RESULTATS] — Monde lot 10 T3 (planche validée le 14/10/2026 : maquettes/monde/refonte/MondeResultats.html, contrat
   LISEZ-MOI §3) : trois colonnes — les soirées (tes soirées, puis celles d'avant ton arrivée, sept lignes fixes), les combats de la soirée
   (carte principale, carte préliminaire), le combat choisi et ce qu'il change — et la prochaine chose à faire en bas à droite. Rien n'est
   écrit dans la partie ; chaque chiffre vient d'une trace, d'un fait ou d'un classement. Les textes fixes sont relu:false. ==== */
const MGMT_SU_RE_TEXTES={
  passe:{texte:'Combat d’avant ton arrivée : on lit le résultat, il ne se revoit pas.',relu:false},
  illisible:{texte:'Un combat de cette soirée n\'a pas pu être relu.',relu:false},
  videTitre:{texte:'Aucune soirée jouée',relu:false},
  videPhrase:{texte:'Les résultats de {soiree} arriveront ici, le soir même.',relu:false},
  videDetail:{texte:'Chaque combat dira qui a gagné, comment, et ce que ça change au classement, aux ceintures et aux contrats.',relu:false},
  premiere:{texte:'Ta première soirée',relu:false}
};
const MGMT_SU_RE_LIGNES=7;

/** « 1re », « 8e » : le rang en ordinal. @param {number} n @returns {string} */
function mgmtSuOrd(n){ return n===1?'1re':n+'e'; }
/** « 1er round », « 3e round ». @param {number} r @returns {string} */
function mgmtSuRoundOrd(r){ return r===1?'1er round':r+'e round'; }
/** Une date longue « 16 février 2027 » (mois en minuscules), précédée du jour de la semaine si `semaine`. Vide pour un jour inconnu.
 *  @param {number} jour jours depuis le début de la partie @param {boolean} [semaine] @returns {string} */
function mgmtSuDateLongue(jour,semaine){
  if(!Number.isFinite(jour)) return '';
  const d=mgmtJourDate(jour), dt=new Date(d.ts);
  return (semaine?MGMT_ACCUEIL_JOURS[dt.getUTCDay()]+' ':'')+d.jour+' '+d.mois.toLocaleLowerCase('fr')+' '+dt.getUTCFullYear();
}
/** Un nombre groupé par milliers avec une espace simple : « 2 265 ». @param {number} n @returns {string} */
function mgmtSuMilliers(n){ return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,' '); }
/** La méthode d'un combat en une ligne de tableau : « KO au 3e round », « Décision après 5 rounds », « Match nul après 3 rounds ».
 *  @param {object} d un détail de mgmtResultatDetail @returns {string} */
function mgmtSuMethodeFamille(d){
  if(d.nul) return 'Match nul après '+d.rounds+' rounds';
  if(d.family==='dec') return 'Décision après '+d.rounds+' rounds';
  return (MGMT_FAMILY_LABELS[d.family]||d.methode||'Fin du combat')+' au '+mgmtSuRoundOrd(d.round);
}
/** La méthode fine du détail : « Décision unanime après 5 rounds » (d.methode seulement s'il vient d'un rejeu fidèle), sinon celle du tableau.
 *  @param {object} d @returns {string} */
function mgmtSuMethodeFine(d){
  if(!d.nul&&d.family==='dec') return (d.methode||MGMT_FAMILY_LABELS.dec)+' après '+d.rounds+' rounds';
  return mgmtSuMethodeFamille(d);
}
/** Le titre de la place d'un combat dans la soirée. @param {boolean} main carte principale @param {number} rang rang dans son groupe (0 : premier)
 *  @returns {string} « Combat principal », « Co-principal », « Carte principale · 3e combat », « Préliminaire 2 » */
function mgmtSuPlaceDetail(main,rang){
  if(!main) return 'Préliminaire '+(rang+1);
  return rang===0?'Combat principal':(rang===1?'Co-principal':'Carte principale · '+(rang+1)+'e combat');
}
/** Un bilan « 23-8-1 » (victoires, défaites, nuls si > 0) lu sur la trace d'un combattant. @param {object} side @returns {string} */
function mgmtSuBilan(side){ return (side.W||0)+'-'+(side.L||0)+(side.D>0?'-'+side.D:''); }
/** L'identifiant d'un fait (chaîne ou objet {id}). */
function mgmtSuFaitId(a){ return typeof a==='string'?a:(a&&a.id)||null; }
/** Le détenteur de la ceinture d'une catégorie avant (inclus=false) ou après (inclus=true) le cycle c, relu sur les faits comme la lignée.
 *  @returns {string|null} l'identifiant, null si vacante */
function mgmtSuDetenteurAu(m,div,c,inclus){
  let id=null;
  for(const fact of m.facts||[]){
    if(!fact) continue;
    const hors=inclus?fact.c>c:fact.c>=c;
    if(fact.k==='title_initial'&&fact.div===div) id=fact.a||null;
    else if(fact.k==='retired'&&!hors){ if(mgmtSuFaitId(fact.a)===id) id=null; }
    else if(fact.k==='title_fight'&&fact.div===div&&!hors){
      const t=m.hist&&m.hist[fact.fight]; if(!t||!t.a||!t.b) continue;
      const w=t.winner==='A'?t.a.id:(t.winner==='B'?t.b.id:null); if(w) id=w;
    }
  }
  return id;
}
/** Le rang d'une défense : la k-ième défense victorieuse du règne au combat i (même lecture des faits que mgmtCeintureLignee). @returns {number} 0 si introuvable */
function mgmtSuDefenseRang(m,div,i){
  let id=null,k=0;
  for(const fact of m.facts||[]){
    if(!fact) continue;
    if(fact.k==='title_initial'&&fact.div===div){ id=fact.a||null; k=0; }
    else if(fact.k==='retired'){ if(mgmtSuFaitId(fact.a)===id){ id=null; k=0; } }
    else if(fact.k==='title_fight'&&fact.div===div){
      const t=m.hist&&m.hist[fact.fight]; if(!t||!t.a||!t.b) continue;
      const w=t.winner==='A'?t.a.id:(t.winner==='B'?t.b.id:null); if(!w) continue;
      if(id===w) k++; else { id=w; k=0; }
      if(fact.fight===i) return k;
    }
  }
  return 0;
}
/** Le rang d'un combattant dans le classement de l'organisation à un cycle, numéroté comme l'écran Classements : le détenteur est écarté, les
 *  autres sont 1, 2, 3… @param {number|undefined} cycle undefined : le classement d'aujourd'hui @param {string|null} tenant le détenteur à ce moment
 *  @returns {('C'|number|null)} 'C' : le champion ; null : absent du classement */
function mgmtSuRangAu(m,div,id,cycle,tenant){
  if(tenant&&tenant===id) return 'C';
  let n=0;
  for(const r of mgmtDivisionRanking(m,div,'organization',cycle)){
    if(r.id===tenant) continue;
    n++; if(r.id===id) return n;
  }
  return null;
}
/** Ce qu'un combat change, en lignes {t: icône, texte} : la ceinture, le classement avant/après, le corps, le contrat. Chaque ligne se lit sur
 *  la trace, un fait ou un classement ; aucune cause (charte H5). @param {object} x une entrée de mgmtSuResultatsListe (d non nul)
 *  @param {boolean} derniere la soirée est la dernière jouée @returns {Array<{t:string,texte:string}>} */
function mgmtSuChangements(m,x,derniere){
  const t=m.hist[x.i], d=x.d, out=[], div=d.cat, c=t.c;
  const gid=d.gagnant.id, pid=d.perdant.id, G=d.gagnant.last||d.gagnant.name, P=d.perdant.last||d.perdant.name;
  const avant=mgmtSuDetenteurAu(m,div,c,false), apres=mgmtSuDetenteurAu(m,div,c,true);
  const cycleApres=(Number.isSafeInteger(m.cycle)&&c+1>=m.cycle)?undefined:c+1;
  const issue=(d.titre&&!d.nul)?mgmtTitreIssue(m,x.i):null;
  if(issue==='garde'){
    const k=mgmtSuDefenseRang(m,div,x.i);
    out.push({t:'ceint',texte:`${G} garde sa ceinture`+(k>0?` : ${mgmtSuOrd(k)} défense`:'')});
  }else if(issue==='prend'){
    const r=mgmtSuRangAu(m,div,gid,c,avant);
    out.push({t:'ceint',texte:typeof r==='number'?`${G}, ${mgmtSuOrd(r)}, prend la ceinture`:`${G} prend la ceinture`});
    if(avant===pid){
      const r2=mgmtSuRangAu(m,div,pid,cycleApres,apres);
      out.push({t:'recule',texte:typeof r2==='number'?`${P} perd sa ceinture et passe à la ${mgmtSuOrd(r2)} place`:`${P} perd sa ceinture`});
    }
  }else if(issue==='vacant') out.push({t:'ceint',texte:`${G} prend la ceinture vacante`});
  for(const [id,nom] of [[gid,G],[pid,P]]){
    const r0=mgmtSuRangAu(m,div,id,c,avant), r1=mgmtSuRangAu(m,div,id,cycleApres,apres);
    if(typeof r0!=='number'||typeof r1!=='number') continue;
    if(r0===r1) out.push({t:'reste',texte:`${nom} garde la ${mgmtSuOrd(r0)} place`});
    else if(r1<r0) out.push({t:'monte',texte:`${nom} monte de la ${mgmtSuOrd(r0)} à la ${mgmtSuOrd(r1)} place`});
    else out.push({t:'recule',texte:`${nom} recule de la ${mgmtSuOrd(r0)} à la ${mgmtSuOrd(r1)} place`});
  }
  const faits=(m.facts||[]).filter(f=>f&&f.c===c);
  for(const [id,nom] of [[gid,G],[pid,P]]){
    for(const f of faits){
      if(mgmtSuFaitId(f.a)!==id) continue;
      if(f.k==='injury') out.push({t:'corps',texte:`Blessure pour ${nom}`});
      else if(f.k==='susp') out.push({t:'corps',texte:`Suspension médicale pour ${nom}`});
      else if(f.k==='fin_contrat') out.push({t:'contrat',texte:`${nom} arrive au bout de son contrat`});
    }
  }
  if(derniere){
    for(const [id,nom] of [[gid,G],[pid,P]]){
      const f=mgmtFighterById(m,id);
      if(f&&!mgmtIsRetired(f)&&mgmtContratRestants(f)===1) out.push({t:'contrat',texte:`${nom} : un dernier combat à son contrat`});
    }
  }
  return out;
}
/** Le nom du prédécesseur de l'organisation (« Kader Malika »), ou '' s'il n'est pas connu. */
function mgmtSuPredecesseurNom(m){
  const o=mgmtOrgParNom(mgmtOrgNom(m)), ident=o?mgmtOrgIdentite(o.id):null, p=ident&&ident.predecesseur;
  return p?((p.prenom||'')+' '+(p.nom||'')).trim():'';
}
/** Le nombre de lignes de soirée de la liste : sept, six quand la ligne « Ta première soirée » est là. @returns {number} */
function mgmtSuReNbLignes(m){ return mgmtSoireesJoueur(m)===0?MGMT_SU_RE_LIGNES-1:MGMT_SU_RE_LIGNES; }
/** Les soirées dans l'ordre de la liste (la plus récente d'abord) et le numéro de la dernière soirée du passé. */
function mgmtSuReSoirees(m){ return mgmtSoirees(m).slice().reverse(); }
/** La fenêtre de la liste : elle ne bouge que si la sélection en sort (ou à la molette) ; bornée à la liste. @returns {number} la première ligne affichée */
function mgmtSuReFenetre(m,total){
  const F=MGMT_SU_RE, n=mgmtSuReNbLignes(m), max=Math.max(0,total-n);
  let fen=Number.isSafeInteger(F.fen)?F.fen:0;
  if(F.vu!==F.s){
    if(F.s<fen) fen=F.s; else if(F.s>=fen+n) fen=F.s-n+1;
    F.vu=F.s;
  }
  F.fen=Math.min(Math.max(0,fen),max);
  return F.fen;
}
/** La prochaine chose à faire, lue à la même source que l'Accueil ; null si l'Accueil ne sait pas la dire. */
function mgmtSuReProchaineChose(m){
  try{ const p=mgmtAccueilContenu(m).attend.prochaine; return p&&p.titre&&p.onclick?p:null; }catch(e){ return null; }
}
/** La colonne des soirées : tes soirées, puis celles d'avant ton arrivée, dans une fenêtre fixe. */
function mgmtSuReListeHtml(m,soirees,fen,passeN){
  const F=MGMT_SU_RE, org=mgmtOrgNom(m), n=mgmtSuReNbLignes(m);
  const tes=soirees.filter(s=>s.n>passeN).length, avant=soirees.length-tes;
  const sous=t=>`<div class="mf-re-sous">${esc(t)}</div>`;
  const ligne=(s,k)=>`<button type="button" class="mf-re-so${k===F.s?' sel':''}" aria-pressed="${k===F.s}" onclick="CL.mgmtSuReSoiree(${k})"><div class="mf-re-so-h"><div class="mf-re-T">Fight Night ${esc(s.n)}</div><span>${esc(mgmtSuDateLongue(s.jour))}</span></div><div class="mf-re-l2">${esc(mgmtSuPrincipalLigne(m,s))}</div></button>`;
  let h='';
  if(fen>0) h+=`<div class="mf-re-plus"><div class="mf-re-l2">${esc(fen+(fen>1?' soirées plus récentes':' soirée plus récente'))}</div><div class="mf-re-aller">↑</div></div>`;
  let groupe=null;
  if(mgmtSoireesJoueur(m)===0){
    const p=m.cal&&m.cal.prochaines&&m.cal.prochaines[0]?Math.max(0,m.cal.prochaines[0].jour-(m.cal.jour||0)):null;
    h+=sous('Tes soirées · 0')+`<div class="mf-re-avenir"><div class="mf-re-l1">${esc(MGMT_SU_RE_TEXTES.premiere.texte)}</div><div class="mf-re-l2">${esc(org+' Fight Night '+((m.eventsPlayed||0)+1)+(p===null?'':' · '+(p===0?'ce soir':'dans '+p+' jour'+(p>1?'s':''))))}</div></div>`;
  }
  for(let k=fen;k<Math.min(soirees.length,fen+n);k++){
    const g=soirees[k].n>passeN?'tes':'avant';
    if(g!==groupe){ groupe=g; h+=sous(g==='tes'?'Tes soirées · '+tes:'Avant ton arrivée · '+avant); }
    h+=ligne(soirees[k],k);
  }
  const reste=soirees.length-(fen+n);
  if(reste>0) h+=`<div class="mf-re-plus bas"><div class="mf-re-l2">${esc(reste+(reste>1?' soirées plus anciennes':' soirée plus ancienne'))}</div><div class="mf-re-aller">↓</div></div>`;
  return h;
}
/** Une ligne du tableau : le numéro dans son groupe, « A bat B », la pastille ceinture, la méthode et la catégorie. */
function mgmtSuReLigneHtml(x,rang,sel){
  const d=x.d;
  const corps=!d
    ?`<div class="mf-re-col"><div class="mf-re-l1">${esc(MGMT_SU_RE_TEXTES.illisible.texte)}</div></div>`
    :`<div class="mf-re-col"><div class="mf-re-l1">`+(d.nul
      ?`<span>${esc(d.gagnant.last||d.gagnant.name)}</span><span class="b"> et </span><span>${esc(d.perdant.last||d.perdant.name)}</span><span class="b"> : match nul</span>`
      :`<span class="g">${esc(d.gagnant.last||d.gagnant.name)}</span><span class="b"> bat </span><span>${esc(d.perdant.last||d.perdant.name)}</span>`)
      +`</div><div class="mf-re-l2">${d.titre?'<span class="mf-re-ceinture"><span class="mf-re-oct"></span>Ceinture</span><span>·</span>':''}<span>${esc(mgmtSuMethodeFamille(d)+' · '+mgmtDivisionLabel(d.cat))}</span></div></div>`;
  return `<button type="button" class="mf-re-cb${sel?' sel':''}" aria-pressed="${sel}" onclick="CL.mgmtSuReChoisir(${x.k})"><div class="mf-re-n">${rang}</div>${corps}</button>`;
}
/** Le détail du combat choisi : place, noms, méthode, bilans, ce que ça change, boutons. */
function mgmtSuReDetailHtml(m,x,rang,revoyable,derniere){
  const t=m.hist[x.i], d=x.d, place=mgmtSuPlaceDetail(x.main,rang);
  if(!d) return `<div class="mf-re-lab">${esc(place)}</div><div class="mf-re-vide-t">${esc(MGMT_SU_RE_TEXTES.illisible.texte)}</div>`;
  const ch=mgmtSuChangements(m,x,derniere).map(c=>`<div class="mf-re-chg"><i class="${c.t}"></i><span>${esc(c.texte)}</span></div>`).join('');
  const fiche=mgmtFicheLigne(m,d.gagnant.id);
  const actions=(revoyable?mfBouton('Revoir le combat',{touche:'R',classe:'mf-re-act',onclick:'CL.mgmtSuReRevoir()'})
      :`<div class="mf-re-l2 note">${esc(MGMT_SU_RE_TEXTES.passe.texte)}</div>`)
    +(fiche?mfBouton('Fiche de '+(d.gagnant.last||d.gagnant.name),{touche:'F',classe:'mf-re-act',onclick:'CL.mgmtSuReFiche()'}):'');
  return `<div class="mf-re-lab">${esc(place)}</div><div class="mf-re-T mf-re-det-g">${esc(d.gagnant.name)}</div>`
    +`<div class="mf-re-det-p">${esc(d.nul?'et '+d.perdant.name+' : match nul':'bat '+d.perdant.name)}</div>`
    +`<div class="mf-re-l2 fort">${esc(mgmtSuMethodeFine(d)+(d.geste?' · '+d.geste:''))}</div>`
    +`<div class="mf-re-l2">${esc(mgmtDivisionLabel(d.cat)+' · en '+d.rounds+' rounds')}</div>`
    +`<div class="mf-re-l2">${esc('Bilans avant le combat : '+mgmtSuBilan(d.gagnant)+' et '+mgmtSuBilan(d.perdant))}</div>`
    +(ch?`<div class="mf-re-sous haut">Ce que ça change</div>${ch}`:'')
    +`<div class="mf-re-actions">${actions}</div>`;
}
/** Le bloc jaune du bas à droite : la prochaine chose à faire (même source que l'Accueil), cliquable, sur Entrée. */
function mgmtSuReJauneHtml(p){
  if(!p) return '';
  return `<button type="button" class="mf-re-jaune" onclick="${p.onclick}"><div class="mf-re-lab">La prochaine chose à faire</div><div class="mf-re-jh"><div class="mf-re-T">${esc(p.titre)}</div>${mfTouche('Entrée')}</div>${p.detail?`<div class="mf-re-jd">${esc(p.detail)}</div>`:''}</button>`;
}
function scr_mgmt_resultats(){
  if(!G||!G.mgmt) return scr_mgmt_bureau();
  const m=G.mgmt, F=MGMT_SU_RE, soirees=mgmtSuReSoirees(m), org=mgmtOrgNom(m);
  const passeN=m.passe&&Number.isSafeInteger(m.passe.soirees)?m.passe.soirees:0;
  if(F.s>=soirees.length) F.s=Math.max(0,soirees.length-1);
  if(F.s<0) F.s=0;
  const pan=(cls,inner)=>mfPanneau(inner,'normal',cls);
  const tete=(t,droite)=>`<div class="mf-re-tete"><div class="mf-re-tt"><div class="mf-re-T">${esc(t)}</div><div class="mf-re-trait"></div></div>${droite?`<div class="mf-re-lab">${esc(droite)}</div>`:''}</div>`;
  const prochaine=mgmtSuReProchaineChose(m), jaune=mgmtSuReJauneHtml(prochaine);
  const fen=mgmtSuReFenetre(m,soirees.length);
  const gauche=`<div class="mf-re-g">${pan('',tete('Les soirées')+`<div class="mf-re-liste" onwheel="CL.mgmtSuReMolette(event)">${mgmtSuReListeHtml(m,soirees,fen,passeN)}</div>`)}</div>`;
  let corps, libelle='Aucune soirée jouée', revoyable=false, fiche=false;
  if(!soirees.length){
    corps=`<div class="mf-re-plein">${pan('',tete(MGMT_SU_RE_TEXTES.videTitre.texte)+`<div class="mf-re-vide-t">${esc(MGMT_SU_RE_TEXTES.videPhrase.texte.replace('{soiree}',org+' Fight Night '+((m.eventsPlayed||0)+1)))}</div><div class="mf-re-l2 fort">${esc(MGMT_SU_RE_TEXTES.videDetail.texte)}</div>`)}${jaune}</div>`;
  }else{
    const s=soirees[F.s], lst=mgmtSuResultatsListe(m,s);
    if(F.i>=lst.length) F.i=Math.max(0,lst.length-1);
    if(F.i<0) F.i=0;
    const joueur=s.n>passeN, derniere=s.n===m.eventsPlayed;
    const fait=(m.cal&&Array.isArray(m.cal.faites))?m.cal.faites.find(f=>f&&f.n===s.n):null;
    const salle=fait&&typeof mgmtSalleParId==='function'?mgmtSalleParId(m,fait.salle):null;
    const spect=(joueur&&derniere&&m.lastEvent&&m.lastEvent.finance&&Number.isFinite(m.lastEvent.finance.spectateurs))?mgmtSuMilliers(m.lastEvent.finance.spectateurs)+' spectateurs':'';
    const dateLongue=mgmtSuDateLongue(s.jour,true);
    const ligneTete=[dateLongue,salle&&salle.nom,spect].filter(Boolean).join(' · ');
    const pred=mgmtSuPredecesseurNom(m);
    const puce=joueur?'Ta soirée':(pred?'Soirée de '+pred:'Avant ton arrivée');
    const nMain=lst.filter(x=>x.main).length, nPrel=lst.length-nMain;
    const gr=(t,n,haut)=>`<div class="mf-re-gr${haut?" haut":""}"><div class="mf-re-sous">${esc(t)}</div><div class="mf-re-sous">${esc(n+(n>1?' combats':' combat'))}</div></div>`;
    let tab='', rangs=[];
    if(nMain) tab+=gr('Carte principale',nMain);
    lst.forEach(x=>{
      const rang=x.main?lst.filter(y=>y.main&&y.k<=x.k).length:lst.filter(y=>!y.main&&y.k<=x.k).length;
      rangs[x.k]=rang;
      if(!x.main&&rang===1) tab+=`<div class="mf-re-gr haut">${gr('Carte préliminaire',nPrel).replace(/^<div class="mf-re-gr">|<\/div>$/g,'')}</div>`;
      tab+=mgmtSuReLigneHtml(x,rang,x.k===F.i);
    });
    const cur=lst[F.i];
    revoyable=!!cur&&!!cur.d&&mgmtCombatRevoyable(m.hist[cur.i]);
    fiche=!!cur&&!!cur.d&&!!mgmtFicheLigne(m,cur.d.gagnant.id);
    const det=cur?mgmtSuReDetailHtml(m,cur,rangs[cur.k]-1,revoyable,derniere):'';
    corps=`<div class="mf-re-m"><div class="mf-re-sdt"><div class="mf-re-sdt-h"><div class="mf-re-T">${esc(org+' Fight Night '+s.n)}</div><div class="mf-re-puce${joueur?' a-toi':''}">${esc(puce)}</div></div>${ligneTete?`<div class="mf-re-l1 t2">${esc(ligneTete)}</div>`:''}</div>${pan('mf-re-tab',tab)}</div>`
      +`<div class="mf-re-d">${pan('mf-re-det',det)}${jaune}</div>`;
    libelle=org+' Fight Night '+s.n+(dateLongue?' · '+dateLongue:'');
  }
  const contenu=`<main class="mf-contenu mf-re">${gauche}${corps}</main>`;
  return mfEcran(contenu,{barre:'jeu',courant:'resultats',m,plaque:'Résultats',libelle,droite:`${org} Fight Night ${(m.eventsPlayed||0)+1}`,
    touches:[{ks:['Échap'],t:'Retour',onclick:"CL.go('mgmt_carte')"},
      ...(soirees.length?[{ks:['←','→'],t:'Soirée'},{ks:['↑','↓'],t:'Combat'}]:[]),
      ...(revoyable?[{ks:['R'],t:'Revoir',onclick:'CL.mgmtSuReRevoir()'}]:[]),
      ...(fiche?[{ks:['F'],t:'Fiche',onclick:'CL.mgmtSuReFiche()'}]:[]),
      {ks:['A','E'],t:'Section'},
      ...(prochaine?[{ks:['Entrée'],t:prochaine.titre,jaune:true,onclick:'CL.mgmtSuReProchaine()'}]:[])]});
}
/* ==== [FIN ANCRE] ====*/
SCREENS.mgmt_resultats=scr_mgmt_resultats;

/* ---- Les gestes ------------------------------------------------------------------------------------------ */

const MGMT_SU_ANCIEN_CLASSEMENTS=SCREENS.mgmt_classements;
SCREENS.mgmt_classements=function(){
  return (G&&G.mgmt&&mgmtAgendaActif(G.mgmt))?scr_mgmt_classements_cadre():MGMT_SU_ANCIEN_CLASSEMENTS();
};
const mgmtSuAgenda=()=>!!(G&&G.mgmt&&mgmtAgendaActif(G.mgmt));

Object.assign(CL,{
  /* Classements */
  mgmtSuClChoisir(k){
    const n=mgmtClassementLignes(G.mgmt,mgmtSuDiv(MGMT_SU_CL),MGMT_SU_CL.portee).length;
    MGMT_SU_CL.curseur=Math.max(0,Math.min(n-1,k)); render();
  },
  mgmtSuClSexe(s){ const F=MGMT_SU_CL; F.sexe=s==='H'||s==='F'?s:(F.sexe==='H'?'F':'H'); F.div=''; F.curseur=0; render(); },
  mgmtSuClDiv(id){ if(divById(id)){ MGMT_SU_CL.sexe=divById(id).gender; MGMT_SU_CL.div=id; MGMT_SU_CL.curseur=0; render(); } },
  mgmtSuClCategorie(delta){
    const liste=allDivisions().filter(d=>d.gender===MGMT_SU_CL.sexe).map(d=>d.id), i=liste.indexOf(mgmtSuDiv(MGMT_SU_CL));
    CL.mgmtSuClDiv(liste[(i+(delta||1)+liste.length)%liste.length]);
  },
  mgmtSuClPortee(p){ MGMT_SU_CL.portee=p==='world'||p==='organization'?p:(MGMT_SU_CL.portee==='world'?'organization':'world'); MGMT_SU_CL.curseur=0; render(); },
  mgmtSuClListePortee(p){ if(p!=='world'&&p!=='organization')return; MGMT_SU_CL.vue='liste'; MGMT_SU_CL.portee=p; MGMT_SU_CL.curseur=0; render(); },
  mgmtSuClVue(v){ if(['liste','meilleurs','records'].includes(v)){ MGMT_SU_CL.vue=v; MGMT_SU_CL.curseur=0; render(); } },
  mgmtSuClVueSuivante(){ const a=['liste','meilleurs','records'],i=a.indexOf(MGMT_SU_CL.vue); CL.mgmtSuClVue(a[(i+1)%a.length]); },
  mgmtSuClOuvrir(){
    if(MGMT_SU_CL.vue==='meilleurs'){
      const r=mgmtMeilleurs(G.mgmt,{divId:mgmtSuDiv(MGMT_SU_CL),portee:MGMT_SU_CL.portee==='world'?'monde':'split'});
      const rank=(r.find(x=>x.id==='finitions')||{}).rang||[]; if(rank[0]) CL.mgmtFiche(rank[0].id); return;
    }
    if(MGMT_SU_CL.vue==='records'){
      const r=mgmtRecords(G.mgmt),first=[...r.unCombat,...r.carriere].find(x=>x&&x.combattant); if(first) CL.mgmtFiche(first.combattant.id); return;
    }
    const l=mgmtClassementLignes(G.mgmt,mgmtSuDiv(MGMT_SU_CL),MGMT_SU_CL.portee)[MGMT_SU_CL.curseur];
    if(l) CL.mgmtFiche(l.id);
  },
  /* Ceintures */
  mgmtSuCeChoisir(k){ MGMT_SU_CE.i=k; render(); },
  mgmtSuCeSexe(s){ const F=MGMT_SU_CE; F.sexe=s==='H'||s==='F'?s:(F.sexe==='H'?'F':'H'); F.div=''; F.i=0; render(); },
  mgmtSuCeDiv(id){ if(divById(id)){ MGMT_SU_CE.sexe=divById(id).gender; MGMT_SU_CE.div=id; MGMT_SU_CE.i=allDivisions().filter(d=>d.gender===divById(id).gender).findIndex(d=>d.id===id); render(); } },
  mgmtSuCeCategorie(delta){
    const liste=allDivisions().filter(d=>d.gender===MGMT_SU_CE.sexe).map(d=>d.id), i=liste.indexOf(mgmtSuDiv(MGMT_SU_CE));
    CL.mgmtSuCeDiv(liste[(i+(delta||1)+liste.length)%liste.length]);
  },
  mgmtSuCeOuvre(){
    const F=MGMT_SU_CE, divs=allDivisions().filter(d=>d.gender===F.sexe), d=divs[F.i];
    if(d){ F.div=d.id; F.ouverte=true; render(); }
  },
  mgmtSuCeFerme(){ MGMT_SU_CE.ouverte=false; render(); },
  mgmtSuCeFiche(){ const b=mgmtSplitTitle(G.mgmt,mgmtSuDiv(MGMT_SU_CE)); if(b.id) CL.mgmtFiche(b.id); },
  mgmtSuCeDeplacer(dx,dy){
    const F=MGMT_SU_CE, n=allDivisions().filter(d=>d.gender===F.sexe).length, col=4;
    let i=F.i+dx+dy*col; if(dx&&(i<0||i>=n)) i=(F.i+dx+n)%n; if(i<0||i>=n) return;
    F.i=i; render();
  },
  /* Camps */
  mgmtSuCaChoisir(k){ MGMT_SU_CA.i=k; render(); },
  mgmtSuCaDeplacer(d){ const n=mgmtCampsListe(G.mgmt).length; if(n) CL.mgmtSuCaChoisir(((MGMT_SU_CA.i+d)%n+n)%n); },
  mgmtSuCaVoir(){ const g=mgmtCampsListe(G.mgmt)[MGMT_SU_CA.i]; if(g&&g.membres[0]) CL.mgmtFiche(g.membres[0].id); },
  /* Presse */
  mgmtSuPrFiltre(k){ MGMT_SU_PR.filtre=k; MGMT_SU_PR.i=0; render(); },
  mgmtSuPrFiltreSuivant(){ const k=MGMT_SU_FILTRES.findIndex(f=>f[0]===MGMT_SU_PR.filtre); CL.mgmtSuPrFiltre(MGMT_SU_FILTRES[(k+1)%MGMT_SU_FILTRES.length][0]); },
  mgmtSuPrChoisir(i){ MGMT_SU_PR.i=Math.max(0,i); render(); },
  mgmtSuPrDeplacer(d){ const n=mgmtFilListe(G.mgmt,MGMT_SU_PR.filtre||null).length; if(n) CL.mgmtSuPrChoisir(Math.max(0,Math.min(n-1,MGMT_SU_PR.i+d))); },
  /** Entrée sur une nouvelle : un défi ouvre la carte sur le combat qu'il réclame ; un fait joué ouvre son résultat ; sinon la fiche. */
  mgmtSuPrEntree(){
    const m=G.mgmt, x=mgmtFilListe(m,MGMT_SU_PR.filtre||null)[MGMT_SU_PR.i]; if(!x) return;
    if((x.k==='defi'||x.k==='public')&&mgmtFilPreparable(m,x)&&!mgmtFilSurCarte(m,x)) return CL.mgmtSuPreparer(x.a,x.b);
    if(Number.isSafeInteger(x.f)) return CL.mgmtSuResultatDe(x.f);
    if(mgmtFicheLigne(m,x.a)){ CL.mgmtFiche(x.a); if(x.k==='combattant'&&x.w==='demande') MGMT_FICHE.onglet='ondit'; render(); }
  },
  /* ==== [ANCRE: MGMT_PRESENTATION_PRESSE_GESTE] — Monde lot 3 T5 ==== */
  mgmtSuPresentation(){
    const m=G.mgmt,c=mgmtSuPresentationCible(m,mgmtFilListe(m,MGMT_SU_PR.filtre||null)[MGMT_SU_PR.i]);
    return c?CL.mgmtPresentationOuvrir(c.mode,c.ids,{h:c.h}):false;
  },
  /** Ouvre la carte avec le premier combattant choisi et son adversaire visé : « Confirmer le combat » n'a plus qu'à être pressé. */
  mgmtSuPreparer(a,b){
    const m=G.mgmt, fa=mgmtFighterById(m,a), fb=mgmtFighterById(m,b);
    if(!fa||!fb||fa.div!==fb.div) return false;
    MGMT_CART={cursor:0,pick:null,div:fa.div};
    if(!mgmtSelectable(m,fa,null)) return false;
    MGMT_CART.pick=a;
    const i=mgmtCarteListe(m).findIndex(f=>f.id===b); if(i<0){ MGMT_CART.pick=null; return false; }
    MGMT_CART.cursor=i; CL.go('mgmt_carte'); return true;
  },
  /* Résultats */
  mgmtSuReSoiree(k){ const n=mgmtSoirees(G.mgmt).length; if(!n) return; MGMT_SU_RE.s=((k%n)+n)%n; MGMT_SU_RE.i=0; render(); },
  mgmtSuReChoisir(i){ MGMT_SU_RE.i=Math.max(0,i); render(); },
  /** ← → : la soirée précédente (plus ancienne) ou suivante, sans boucler ; la fenêtre ne bouge que si la sélection en sort. */
  mgmtSuReSoireeDe(d){
    const n=mgmtSoirees(G.mgmt).length; if(!n) return;
    const k=Math.min(Math.max(0,MGMT_SU_RE.s+d),n-1); if(k===MGMT_SU_RE.s) return;
    MGMT_SU_RE.s=k; MGMT_SU_RE.i=0; render();
  },
  /** La molette sur la liste des soirées : elle fait défiler la fenêtre d'une ligne, sans changer la sélection. @param {WheelEvent} e */
  mgmtSuReMolette(e){
    const m=G&&G.mgmt; if(!m||!e||!e.deltaY) return;
    if(e.preventDefault) e.preventDefault();
    const F=MGMT_SU_RE, max=Math.max(0,mgmtSoirees(m).length-mgmtSuReNbLignes(m));
    const fen=Math.min(Math.max(0,(Number.isSafeInteger(F.fen)?F.fen:0)+(e.deltaY>0?1:-1)),max);
    if(fen===F.fen) return;
    F.fen=fen; render();
  },
  /** Le combat choisi de la soirée choisie : {s, x} ou null. */
  mgmtSuReCourant(){
    const m=G.mgmt, s=mgmtSuReSoirees(m)[MGMT_SU_RE.s]; if(!s) return null;
    const x=mgmtSuResultatsListe(m,s)[MGMT_SU_RE.i]; return x?{s,x}:null;
  },
  /** Entrée : la prochaine chose à faire, celle que l'Accueil propose (le bloc jaune). */
  mgmtSuReProchaine(){
    const m=G&&G.mgmt; if(!m) return;
    const p=mgmtSuReProchaineChose(m); if(!p) return;
    const b=typeof document!=='undefined'?document.querySelector('.mf-re-jaune'):null;
    if(b) b.click(); else (new Function('CL',p.onclick))(CL);
  },
  /** F : la fiche du vainqueur du combat choisi, si on la trouve. */
  mgmtSuReFiche(){
    const m=G.mgmt, c=CL.mgmtSuReCourant(); if(!c||!c.x.d) return;
    const id=c.x.d.gagnant.id;
    if(mgmtFicheLigne(m,id)){ CL.mgmtFiche(id); render(); }
  },
  mgmtSuReDeplacer(d){
    const s=mgmtSuReSoirees(G.mgmt)[MGMT_SU_RE.s]; if(!s) return;
    const n=mgmtSuResultatsListe(G.mgmt,s).length; CL.mgmtSuReChoisir(Math.min(Math.max(0,MGMT_SU_RE.i+d),Math.max(0,n-1)));
  },
  /** Ouvre le résultat d'un combat (index dans m.hist) sur son écran. */
  mgmtSuResultatDe(i){
    const m=G.mgmt, soirees=mgmtSuReSoirees(m);
    const s=soirees.findIndex(x=>x.idx.includes(i)); if(s<0) return;
    MGMT_SU_RE.s=s; MGMT_SU_RE.vu=null; MGMT_SU_RE.i=Math.max(0,mgmtSuResultatsListe(m,soirees[s]).findIndex(x=>x.i===i)); CL.go('mgmt_resultats');
  },
  /** Revoir le combat choisi : rejoué depuis sa trace, retour sur l'écran des résultats. Rien si le combat est d'avant l'arrivée. */
  mgmtSuReRevoir(){
    const m=G.mgmt, c=CL.mgmtSuReCourant(); if(!c||!c.x.d) return;
    const t=m.hist[c.x.i];
    if(!mgmtCombatRevoyable(t)) return;
    mgmtRevoirCombat(t,'mgmt_resultats',null);
  },
});

keysRegister('mgmt_classements',{
  ArrowUp(){ if(mgmtSuAgenda()) CL.mgmtSuClChoisir(MGMT_SU_CL.curseur-1); },
  ArrowDown(){ if(mgmtSuAgenda()) CL.mgmtSuClChoisir(MGMT_SU_CL.curseur+1); },
  g(){ if(mgmtSuAgenda()) CL.mgmtSuClSexe(); }, G(){ if(mgmtSuAgenda()) CL.mgmtSuClSexe(); },
  m(){ if(mgmtSuAgenda()) CL.mgmtSuClPortee(); }, M(){ if(mgmtSuAgenda()) CL.mgmtSuClPortee(); },
  Tab(){
    if(mgmtSuAgenda()){
      if(MGMT_SU_CL.vue==='liste')CL.mgmtSuClCategorie(1);
      else CL.mgmtSuClVueSuivante();
    }
  },
  Enter(){ if(mgmtSuAgenda()) CL.mgmtSuClOuvrir(); },
  v(){ if(mgmtSuAgenda()) CL.mgmtSuClVueSuivante(); }, V(){ if(mgmtSuAgenda()) CL.mgmtSuClVueSuivante(); },
  Escape(){ CL.go('mgmt_accueil'); },
});
keysRegister('mgmt_ceintures',{
  ArrowLeft(){ if(!MGMT_SU_CE.ouverte) CL.mgmtSuCeDeplacer(-1,0); },
  ArrowRight(){ if(!MGMT_SU_CE.ouverte) CL.mgmtSuCeDeplacer(1,0); },
  ArrowUp(){ if(!MGMT_SU_CE.ouverte) CL.mgmtSuCeDeplacer(0,-1); },
  ArrowDown(){ if(!MGMT_SU_CE.ouverte) CL.mgmtSuCeDeplacer(0,1); },
  g(){ CL.mgmtSuCeSexe(); }, G(){ CL.mgmtSuCeSexe(); },
  Tab(){ if(MGMT_SU_CE.ouverte) CL.mgmtSuCeCategorie(1); },
  Enter(){ if(MGMT_SU_CE.ouverte) CL.mgmtSuCeFiche(); else CL.mgmtSuCeOuvre(); },
  Escape(){ if(MGMT_SU_CE.ouverte) CL.mgmtSuCeFerme(); else CL.go('mgmt_accueil'); },
});
keysRegister('mgmt_camps',{
  ArrowLeft(){ CL.mgmtSuCaDeplacer(-1); },
  ArrowRight(){ CL.mgmtSuCaDeplacer(1); },
  Enter(){ CL.mgmtSuCaVoir(); },
  Escape(){ CL.go('mgmt_accueil'); },
});
keysRegister('mgmt_presse',{
  ArrowLeft(){ CL.mgmtSuPrDeplacer(-1); },
  ArrowRight(){ CL.mgmtSuPrDeplacer(1); },
  Tab(){ CL.mgmtSuPrFiltreSuivant(); },
  Enter(){ CL.mgmtSuPrEntree(); },
  Escape(){ CL.go('mgmt_accueil'); },
});
keysRegister('mgmt_resultats',{
  ArrowLeft(){ CL.mgmtSuReSoireeDe(1); },
  ArrowRight(){ CL.mgmtSuReSoireeDe(-1); },
  ArrowUp(){ CL.mgmtSuReDeplacer(-1); },
  ArrowDown(){ CL.mgmtSuReDeplacer(1); },
  r(){ CL.mgmtSuReRevoir(); }, R(){ CL.mgmtSuReRevoir(); },
  f(){ CL.mgmtSuReFiche(); }, F(){ CL.mgmtSuReFiche(); },
  Enter(){ CL.mgmtSuReProchaine(); },
  Escape(){ CL.go('mgmt_accueil'); },
});
/* ==== [FIN ANCRE] ==== */
