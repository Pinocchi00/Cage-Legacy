"use strict";
/* ==== [ANCRE: MGMT_BRIEF_LOT10_ECRANS] — Brief du 06/10/2026, lot 10 : les cinq écrans du suivi du monde, portés des
   planches du canvas (« Classements — Hommes, poids léger », « Ceintures — Le mur », « La ceinture — Ouverte depuis le
   mur », « Camps — Le défilé », « Presse — La une », « Résultats — La une »). Chacun lit mgmt-suivi.js et ne stocke rien :
   l'état de l'écran vit en mémoire. Les classements nouveaux ne remplacent l'ancien écran que dans une partie à
   l'agenda (comme les contrats) ; les quatre autres sont neufs. Tout texte injecté passe par esc(). Les titres et
   phrases de presse sont des modèles relu:false (mgmt-suivi.js). ==== */

let MGMT_SU_CL={sexe:'H',div:'',curseur:0,portee:'organization'};
let MGMT_SU_CE={sexe:'H',div:'',i:0,ouverte:false};
let MGMT_SU_CA={i:0};
let MGMT_SU_PR={filtre:'',i:0};
let MGMT_SU_RE={s:0,i:0};

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
/** Un nom en deux lignes : le prénom petit, le nom grand, qui rétrécit pour tenir `largeur`. */
function mgmtSuNom(n,largeurPx,pPrenom,pNom,mini){
  const nom=mgmtSuMaj(n.last||n.name), prenom=mgmtSuMaj(n.first||'');
  return `<span style="font-size:${pPrenom}px">${esc(prenom)}</span><span style="font-size:${mfCorps(nom,largeurPx,pNom,mini||36)}px">${esc(nom)}</span>`;
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
function mgmtSuCarteClassement(m,x,selectionne,k){
  const n=mgmtNomParId(m,x.id), rec=`${x.W}-${x.L}-${x.D}`;
  const choisi=selectionne?' sel':'';
  if(x.champion){
    return `<button type="button" class="mf-su-champ${choisi}" onclick="CL.mgmtSuClChoisir(${k})" ondblclick="CL.mgmtFiche('${esc(x.id)}')" aria-label="Champion ${esc(n.name)}">`
      +mfPanneau(`<div class="mf-su-champ-in"><div class="mf-su-champ-c" aria-hidden="true">C</div>`
        +`<div class="mf-su-champ-nom">${mgmtSuNom(n,330,44,104,52)}</div>`
        +`<div class="mf-su-champ-box"><b>${esc(rec)}</b><span>${esc(x.serie)}</span></div></div>`,selectionne?'choisi':'normal')+`</button>`;
  }
  return `<button type="button" class="mf-su-rang${choisi}" onclick="CL.mgmtSuClChoisir(${k})" ondblclick="CL.mgmtFiche('${esc(x.id)}')" aria-label="${esc(x.rang)} ${esc(n.name)}">`
    +mfPanneau(`<div class="mf-su-rang-in"><div class="mf-su-rang-evo">${mgmtSuEvolution(x,selectionne)}</div><div class="mf-su-rang-n">${esc(x.rang)}</div>`
      +`<div class="mf-su-rang-nom">${mgmtSuNom(n,230,36,76,36)}</div>`
      +`<div class="mf-su-rang-box"><b>${esc(rec)}</b><span>${esc(x.serie)}</span></div></div>`,selectionne?'choisi':'normal')+`</button>`;
}
function mgmtSuLigneClassement(m,x,selectionne,k){
  const n=mgmtNomParId(m,x.id), d=x.dernier;
  const dernier=d?`${mgmtSuMarque(d.issue)}<span>${esc(d.famille)}${d.adv?', contre '+esc(d.adv):''}</span>`:'<span>—</span>';
  return `<button type="button" class="mf-su-ligne${selectionne?' sel':''}" onclick="CL.mgmtSuClChoisir(${k})" ondblclick="CL.mgmtFiche('${esc(x.id)}')">`
    +`<div class="mf-su-l-rang">${esc(x.rang)}</div><div class="mf-su-l-evo">${mgmtSuEvolution(x,selectionne)}</div>`
    +`<div class="mf-su-l-nom"><b>${esc(mgmtSuMaj(n.last||n.name))}</b><span>${esc(n.first)}</span></div>`
    +`<div class="mf-su-l-rec">${esc(x.W)}-${esc(x.L)}-${esc(x.D)}</div><div class="mf-su-l-serie">${esc(x.serie)}</div><div class="mf-su-l-dernier">${dernier}</div></button>`;
}

function scr_mgmt_classements_cadre(){
  const m=G.mgmt, F=MGMT_SU_CL, div=mgmtSuDiv(F); F.div=div;
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
  return mfEcran(contenu,{barre:'jeu',courant:'classements',m,plaque:'Classements',libelle:F.portee==='world'?'Mondial · '+String(d.name).replace(/^Poids /,'').toUpperCase():String(d.name).toUpperCase(),
    droite:`${mgmtOrgNom(m)} Fight Night ${(m.eventsPlayed||0)+1}`,
    touches:[{ks:['Échap'],t:'Retour',onclick:"CL.go('mgmt_bureau')"},{ks:['↑','↓'],t:'Choisir'},{ks:['G'],t:'Hommes ou femmes',onclick:'CL.mgmtSuClSexe()'},
      {ks:['Tab'],t:'Catégorie',onclick:'CL.mgmtSuClCategorie(1)'},{ks:['M'],t:F.portee==='world'?'Classement de l’organisation':'Classement mondial',onclick:'CL.mgmtSuClPortee()'},
      {ks:['A','E'],t:'Section'},{ks:['Entrée'],t:'Ouvrir sa fiche',jaune:true,onclick:'CL.mgmtSuClOuvrir()'}]});
}

/* ---- Ceintures : le mur, puis une ceinture ----------------------------------------------------------- */

function mgmtSuCeintureCarte(m,d,k,selectionne){
  const belt=mgmtSplitTitle(m,d.id), n=belt.id?mgmtNomParId(m,belt.id):null;
  const pr=mgmtPretendant(m,d.id), npr=pr?mgmtSuCourt(m,pr.id):'—';
  const duree=belt.id&&belt.since!==null?mgmtDureeTexte(m,mgmtSoireeSince(m,belt),m.eventsPlayed||0):null;
  const corps=belt.id
    ?`<div class="mf-su-ce-nom"><span>${esc(n.first)}</span><b style="font-size:${mfCorps(n.last||n.name,330,64,34)}px">${esc(mgmtSuMaj(n.last||n.name))}</b></div>`
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
    touches:[{ks:['Échap'],t:'Retour',onclick:"CL.go('mgmt_bureau')"},{ks:['←','→'],t:'Choisir'},{ks:['G'],t:'Hommes ou femmes',onclick:'CL.mgmtSuCeSexe()'},
      {ks:['A','E'],t:'Section'},{ks:['Entrée'],t:'Ouvrir la ceinture',jaune:true,onclick:'CL.mgmtSuCeOuvre()'}]});
}

function mgmtSuReignLigne(m,r,k,total,actuelle){
  const n=mgmtNomParId(m,r.id);
  const sous=r.jusqua===null?(r.depuis===0?'Depuis le début':'Depuis la soirée '+r.depuis):(r.depuis===0?`Du début à la soirée ${r.jusqua}`:`Soirées ${r.depuis} à ${r.jusqua}`);
  const marque=actuelle?`<div class="mf-su-r-c" aria-label="Champion actuel">C</div>`:`<div class="mf-su-r-n">${esc(total-k)}</div>`;
  return `<div class="mf-su-reign${actuelle?' actuel':''}">${marque}<div class="mf-su-r-nom"><div><b>${esc(mgmtSuMaj(n.last||n.name))}</b><span>${esc(n.first)}</span></div><span class="mf-su-r-sous">${esc(sous)}</span></div>`
    +`<b class="mf-su-r-def">${esc(r.defenses)} ${r.defenses>1?'DÉFENSES':'DÉFENSE'}</b></div>`;
}

function mgmtSuCeintureDetail(m){
  const F=MGMT_SU_CE, div=mgmtSuDiv(F); F.div=div;
  const d=divById(div), lignee=mgmtCeintureLignee(m,div), belt=mgmtSplitTitle(m,div);
  const n=belt.id?mgmtNomParId(m,belt.id):null, f=belt.id?mgmtFighterById(m,belt.id):null;
  const fem=d.gender==='F', nomCat=String(d.name).replace(/^Poids /,'').toUpperCase();
  const rec=f?`${f.W}-${f.L}-${f.D||0}`:'', serie=f?mgmtSerieTexte(mgmtSerie(m,f)):'';
  const champ=belt.id
    ?`<div class="mf-su-det-c">C</div><div class="mf-su-det-nom">${mgmtSuNom(n,640,56,150,60)}</div>`
      +`<div class="mf-su-det-box"><b>${esc(rec)}</b><span>${esc(serie)}</span></div>`
      +`<div class="mf-su-det-btn">${mfBouton('Ouvrir sa fiche',{touche:'Entrée',jaune:true,onclick:'CL.mgmtSuCeFiche()'})}</div>`
    :`<div class="mf-su-det-nom"><span style="font-size:56px">LA CEINTURE</span><span style="font-size:130px">VACANTE</span></div>`;
  const gauche=mfPanneau(`<div class="mf-su-det-in"><div class="mf-su-det-tag">${fem?'CHAMPIONNE':'CHAMPION'} DES POIDS ${esc(nomCat)}</div>${champ}</div>`,'choisi','mf-su-det');
  const rs=lignee.reigns.slice().reverse();
  const lignes=rs.slice(0,5).map((r,k)=>mgmtSuReignLigne(m,r,k,rs.length,k===0&&lignee.actuel===r)).join('');
  const liste=mfPanneau(`<div class="mf-su-lignee"><div class="mf-su-lignee-t"><span class="mf-su-tag">LA LIGNÉE</span><span class="mf-su-dim">${rs.length} CHAMPION${rs.length>1?'S':''}</span></div>`
    +`<div class="mf-su-reigns">${lignes||'<div class="mf-eff-aucun">Aucun champion pour l’instant.</div>'}</div><div class="mf-su-dim2">Du champion actuel au tout premier.</div></div>`,'normal','mf-su-lig');
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
    return `<div class="mf-su-ca-m"><div class="mf-su-ca-mn"><b>${esc(mgmtSuMaj(f.last||f.name))}</b><span>${esc(f.first||'')}</span></div>`
      +`<span class="mf-su-ca-mc">${esc(mgmtEffectifPuce(divById(f.div)).charAt(0)+mgmtEffectifPuce(divById(f.div)).slice(1).toLowerCase())}</span><b>${esc(mgmtRangTexte(m,f))}</b></div>`;
  }).join('');
  const refus=g.refus?`<div class="mf-su-ca-refus">Les opposer les contrarie</div>`:'<div></div>';
  const corps=`<div class="mf-su-ca-g1"><div class="mf-su-ca-bloc"><span>LE COACH</span><b>${esc(mgmtSuMaj(prenom))}${nom?'<br>'+esc(mgmtSuMaj(nom)):''}</b></div>`
    +`<div class="mf-su-ca-bloc"><span>ON Y TRAVAILLE</span><b class="mf-su-ca-spec">${esc(mgmtSuMaj(g.specialite.libelle))}</b></div></div>`
    +`<div class="mf-su-ca-g2"><span class="mf-su-ca-l">SES ${n} COMBATTANT${n>1?'S':''} CHEZ TOI</span><div class="mf-su-ca-ms">${lignes}</div></div>`;
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
    touches:[{ks:['Échap'],t:'Retour',onclick:"CL.go('mgmt_bureau')"},{ks:['←','→'],t:'Autre salle'},{ks:['A','E'],t:'Section'},{ks:['Entrée'],t:'Voir ses combattants',jaune:true,onclick:'CL.mgmtSuCaVoir()'}]});
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
  if(x.k==='defi'){ const w={revanche:'Il réclame sa revanche.',trilogie:'Il réclame le troisième combat.'}[x.w]||''; return w; }
  if(x.k==='public') return `${mgmtSuCourt(m,x.a)} contre ${mgmtSuCourt(m,x.b)}`;
  if(x.k==='combattant') return x.w==='attend'?'Il veut un combat.':'Il attend ta réponse.';
  if(x.w==='garde'||x.w==='prend'||x.w==='vacant'||x.w==='resultat'){ const d=Number.isSafeInteger(x.f)?mgmtResultatDetail(m,x.f):null; return d?`${d.methode}, contre ${mgmtSuCourt(m,x.b)}`:''; }
  return x.b?`Sur ${mgmtSuCourt(m,x.a)} face à ${mgmtSuCourt(m,x.b)}.`:'';
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
    touches:[{ks:['Échap'],t:'Retour',onclick:"CL.go('mgmt_bureau')"},{ks:['←','→'],t:'Choisir'},{ks:['Tab'],t:'Filtre',onclick:'CL.mgmtSuPrFiltreSuivant()'},{ks:['A','E'],t:'Section'},
      {ks:['Entrée'],t:'Préparer ce combat',jaune:true,onclick:'CL.mgmtSuPrEntree()'}]});
}
SCREENS.mgmt_presse=scr_mgmt_presse;

/* ---- Résultats ------------------------------------------------------------------------------------------ */

function mgmtSuResultatsListe(m,s){
  return mgmtSoireeAffichage(m,s).map((i,k)=>{ const d=mgmtResultatDetail(m,i); return d?{d,k,i}:null; }).filter(Boolean);
}
function mgmtSuQui(m,d,fs,largeur){
  const g=mgmtSuMaj(d.gagnant.last||d.gagnant.name), p=mgmtSuMaj(d.perdant.last||d.perdant.name);
  return d.nul?mgmtSu2Lignes(g,`NUL CONTRE ${p}`,fs,largeur):mgmtSu2Lignes(g,`BAT ${p}`,fs,largeur);
}
function mgmtSuRoundLigne(d){ return d.nul?`Match nul ${mgmtRoundTexte(d)}`:`${d.methode}, ${mgmtRoundTexte(d)}`; }

function scr_mgmt_resultats(){
  if(!G||!G.mgmt) return scr_mgmt_bureau();
  const m=G.mgmt, F=MGMT_SU_RE, soirees=mgmtSoirees(m).slice().reverse();
  if(F.s>=soirees.length) F.s=Math.max(0,soirees.length-1);
  if(F.s<0) F.s=0;
  const debutP=Math.min(Math.max(0,F.s-4),Math.max(0,soirees.length-5));
  const puces=`<div class="mf-eff-puces">`+soirees.slice(debutP,debutP+5).map((s,k)=>`<button type="button" class="${debutP+k===F.s?'on':''}" aria-pressed="${debutP+k===F.s}" onclick="CL.mgmtSuReSoiree(${debutP+k})">SOIRÉE ${esc(s.n)}</button>`).join('')+`</div>`;
  let corps;
  if(!soirees.length) corps=`<div class="mf-su-vide">${mfPanneau(`<div class="mf-eff-aucun">Aucune soirée jouée : les résultats viendront avec la première.</div>`,'normal')}</div>`;
  else{
    const s=soirees[F.s], liste=mgmtSuResultatsListe(m,s);
    if(F.i>=liste.length) F.i=Math.max(0,liste.length-1);
    if(F.i<0) F.i=0;
    const h=liste[F.i], co=liste[F.i+1], suite=liste.slice(F.i+2,F.i+5);
    const etiq=x=>mgmtResultatEtiquette(m,m.hist[x.i],x.k,x.d.titre).toUpperCase();
    const cat=x=>String(divById(x.d.cat)?divById(x.d.cat).name:'').replace(/^Poids /,'').toUpperCase();
    const issue=h.d.titre?mgmtTitreIssue(m,h.i):null;
    const ligneTitre=issue?`<div class="mf-su-h-ti"><div class="mf-eff-c">C</div><span>${issue==='garde'?'Il garde sa ceinture.':(issue==='vacant'?'Il prend le titre vacant.':'Il prend la ceinture.')}</span></div>`:'';
    const hero=mgmtSuHero(etiq(h),cat(h)+(h.d.titre?' · POUR LA CEINTURE':''),mgmtSuQui(m,h.d,104,520),`<div class="mf-su-quote"><div>${esc(mgmtSuRoundLigne(h.d))}</div>${ligneTitre}</div>`,
      mfBouton('Revoir ce combat',{touche:'Entrée',jaune:true,onclick:'CL.mgmtSuReRevoir()'}));
    const cote=co?mgmtSuCoteGrand(etiq(co),cat(co),mgmtSuQui(m,co.d,80,440),
      `<div class="mf-su-ko"><b style="font-size:${mfCorps(co.d.nul?'NUL':(MGMT_FAMILY_LABELS[co.d.family]||co.d.methode),360,130,60)}px">${esc(mgmtSuMaj(co.d.nul?'NUL':(MGMT_FAMILY_LABELS[co.d.family]||co.d.methode)))}</b><div><span>${esc(mgmtRoundTexte(co.d))}</span>${co.d.geste?`<em>${esc(co.d.geste)}</em>`:''}</div></div>`)
      :mgmtSuCoteGrand('PRÉLIMINAIRES','','<span style="font-size:60px">FIN DE SOIRÉE</span>','');
    const petits=suite.map(x=>mgmtSuPetit(etiq(x),cat(x),mgmtSuQui(m,x.d,48,440),`<b class="mf-su-meth">${esc(x.d.nul?'Match nul':(x.d.family==='dec'?'Décision':(MGMT_FAMILY_LABELS[x.d.family]||'')+', '+mgmtRoundTexte(x.d)))}</b>`,`CL.mgmtSuReChoisir(${F.i+2+suite.indexOf(x)})`));
    corps=mgmtSuUne(hero,cote,petits);
  }
  const contenu=`<main class="mf-contenu mf-su"><div class="mf-eff-barre">${puces}</div>${corps}</main>`;
  return mfEcran(contenu,{barre:'jeu',courant:'resultats',m,plaque:'Résultats',libelle:soirees.length?`${mgmtOrgNom(m)} Fight Night ${soirees[F.s].n}${Number.isFinite(soirees[F.s].jour)?' · '+mgmtJourDate(soirees[F.s].jour).jour+' '+mgmtJourDate(soirees[F.s].jour).mois:''}`:'',droite:`${mgmtOrgNom(m)} Fight Night ${(m.eventsPlayed||0)+1}`,
    touches:[{ks:['Échap'],t:'Retour',onclick:"CL.go('mgmt_bureau')"},{ks:['←','→'],t:'Choisir'},{ks:['Tab'],t:'Soirée',onclick:'CL.mgmtSuReSoiree(MGMT_SU_RE.s+1)'},{ks:['A','E'],t:'Section'},
      {ks:['Entrée'],t:'Revoir ce combat',jaune:true,onclick:'CL.mgmtSuReRevoir()'}]});
}
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
  mgmtSuClPortee(){ MGMT_SU_CL.portee=MGMT_SU_CL.portee==='world'?'organization':'world'; MGMT_SU_CL.curseur=0; render(); },
  mgmtSuClOuvrir(){
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
    if(mgmtFicheLigne(m,x.a)) CL.mgmtFiche(x.a);
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
  mgmtSuReDeplacer(d){
    const soirees=mgmtSoirees(G.mgmt).slice().reverse(), s=soirees[MGMT_SU_RE.s]; if(!s) return;
    const n=mgmtSuResultatsListe(G.mgmt,s).length; CL.mgmtSuReChoisir(Math.min(Math.max(0,MGMT_SU_RE.i+d),Math.max(0,n-1)));
  },
  /** Ouvre le résultat d'un combat (index dans m.hist) sur son écran. */
  mgmtSuResultatDe(i){
    const m=G.mgmt, soirees=mgmtSoirees(m).slice().reverse();
    const s=soirees.findIndex(x=>x.idx.includes(i)); if(s<0) return;
    MGMT_SU_RE.s=s; MGMT_SU_RE.i=Math.max(0,mgmtSuResultatsListe(m,soirees[s]).findIndex(x=>x.i===i)); CL.go('mgmt_resultats');
  },
  /** Revoir le combat choisi : rejoué depuis sa trace, retour sur l'écran des résultats. */
  mgmtSuReRevoir(){
    const m=G.mgmt, s=mgmtSoirees(m).slice().reverse()[MGMT_SU_RE.s]; if(!s) return;
    const x=mgmtSuResultatsListe(m,s)[MGMT_SU_RE.i]; if(!x) return;
    const t=m.hist[x.i];
    mgmtRevoirCombat(t,'mgmt_resultats',null);
  },
});

keysRegister('mgmt_classements',{
  ArrowUp(){ if(mgmtSuAgenda()) CL.mgmtSuClChoisir(MGMT_SU_CL.curseur-1); },
  ArrowDown(){ if(mgmtSuAgenda()) CL.mgmtSuClChoisir(MGMT_SU_CL.curseur+1); },
  g(){ if(mgmtSuAgenda()) CL.mgmtSuClSexe(); }, G(){ if(mgmtSuAgenda()) CL.mgmtSuClSexe(); },
  m(){ if(mgmtSuAgenda()) CL.mgmtSuClPortee(); }, M(){ if(mgmtSuAgenda()) CL.mgmtSuClPortee(); },
  Tab(){ if(mgmtSuAgenda()) CL.mgmtSuClCategorie(1); },
  Enter(){ if(mgmtSuAgenda()) CL.mgmtSuClOuvrir(); },
  Escape(){ CL.go('mgmt_bureau'); },
});
keysRegister('mgmt_ceintures',{
  ArrowLeft(){ if(!MGMT_SU_CE.ouverte) CL.mgmtSuCeDeplacer(-1,0); },
  ArrowRight(){ if(!MGMT_SU_CE.ouverte) CL.mgmtSuCeDeplacer(1,0); },
  ArrowUp(){ if(!MGMT_SU_CE.ouverte) CL.mgmtSuCeDeplacer(0,-1); },
  ArrowDown(){ if(!MGMT_SU_CE.ouverte) CL.mgmtSuCeDeplacer(0,1); },
  g(){ CL.mgmtSuCeSexe(); }, G(){ CL.mgmtSuCeSexe(); },
  Tab(){ if(MGMT_SU_CE.ouverte) CL.mgmtSuCeCategorie(1); },
  Enter(){ if(MGMT_SU_CE.ouverte) CL.mgmtSuCeFiche(); else CL.mgmtSuCeOuvre(); },
  Escape(){ if(MGMT_SU_CE.ouverte) CL.mgmtSuCeFerme(); else CL.go('mgmt_bureau'); },
});
keysRegister('mgmt_camps',{
  ArrowLeft(){ CL.mgmtSuCaDeplacer(-1); },
  ArrowRight(){ CL.mgmtSuCaDeplacer(1); },
  Enter(){ CL.mgmtSuCaVoir(); },
  Escape(){ CL.go('mgmt_bureau'); },
});
keysRegister('mgmt_presse',{
  ArrowLeft(){ CL.mgmtSuPrDeplacer(-1); },
  ArrowRight(){ CL.mgmtSuPrDeplacer(1); },
  Tab(){ CL.mgmtSuPrFiltreSuivant(); },
  Enter(){ CL.mgmtSuPrEntree(); },
  Escape(){ CL.go('mgmt_bureau'); },
});
keysRegister('mgmt_resultats',{
  ArrowLeft(){ CL.mgmtSuReDeplacer(-1); },
  ArrowRight(){ CL.mgmtSuReDeplacer(1); },
  Tab(){ CL.mgmtSuReSoiree(MGMT_SU_RE.s+1); },
  Enter(){ CL.mgmtSuReRevoir(); },
  Escape(){ CL.go('mgmt_bureau'); },
});
/* ==== [FIN ANCRE] ==== */
