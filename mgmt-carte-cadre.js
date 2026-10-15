"use strict";
/* ==== [ANCRE: MGMT_BRIEF_LOT7B_CARTE_CADRE] — Brief du 06/10/2026, lot 7 : la Carte dans le cadre
   (planche « Management — Booking »). À gauche, les cinq combats de la carte principale — chacun
   « confirmé », « à confirmer » (le combat que le joueur prépare : son premier choix et l'adversaire
   visé) ou « à composer » ; au centre le face-à-face avec les mêmes lignes de comparaison pour les
   deux ; à droite les adversaires de la catégorie. AUCUNE règle de composition ne change : mêmes
   gardes (mgmtSelectable, mgmtBookMain), même geste (premier choix, puis Entrée sur l'adversaire).
   Un combat n'entre sur la carte que par ce geste : aucun combat n'est posé, donc joué, sans que
   le joueur l'ait confirmé. L'état « à confirmer » est une trace de rendu, jamais persistée.
   Contrat restant (lot 9) et enjeux (presse, public — lots 8 et 10) : « — » tant qu'ils n'existent pas. ==== */

const MGMT_CARTE_LIGNES=6;
const MGMT_CARTE_NOMS=['Combat principal','Co-principal','Combat 3','Combat 4','Combat 5'];
const MF_SVG_CONFIRME='<svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true" style="flex:none"><path d="M4 14l6 6L22 6" stroke="#E9E6E1" stroke-width="4"></path></svg>';

/** La catégorie affichée : celle du premier choix, sinon celle choisie avec C, sinon la première où quelqu'un est disponible. */
function mgmtCarteDiv(m){
  const pick=MGMT_CART.pick?mgmtFighterById(m,MGMT_CART.pick):null;
  if(pick) return pick.div;
  const rows=mgmtCartRows(m);
  if(MGMT_CART.div&&rows.some(f=>f.div===MGMT_CART.div)) return MGMT_CART.div;
  const f=rows.find(x=>mgmtSelectable(m,x,null))||rows[0];
  return f?f.div:(allDivisions()[0]||{}).id;
}

/** La liste de droite : la catégorie, sans le premier choix, dans l'ordre du classement. */
function mgmtCarteListe(m){
  const div=mgmtCarteDiv(m);
  return mgmtCartRows(m).filter(f=>f.div===div&&f.id!==MGMT_CART.pick);
}

/** Le libellé court d'une catégorie : « LÉGER », « MOUCHE F ». */
function mgmtCarteCourt(div){ return mfNet(mgmtDivisionLabel(div)).replace(/^POIDS /,'').replace(/ FÉMININ$/,' F'); }

/** Le style d'un combattant, au corps qui tient dans sa colonne ; la source (le bilan) se dit une fois, dans les enjeux, jamais sous le texte. */
function mgmtCarteStyleHtml(c){ return `<b style="font-size:${mfCorps(c.style,215,32,22)}px">${esc(c.style)}</b>`; }
function mgmtCarteLigneComp(a,b,c){ return `<div class="mf-car-comp"><div>${a}</div><span>${esc(c)}</span><div>${b}</div></div>`; }

function mgmtCarteFormeHtml(m,f){
  const l=f?mgmtEffectifForme(m,f):[];
  return l.length?`<div class="mf-eff-forme">${l.map(mfMarque).join('')}</div>`:'<b>—</b>';
}

/** Le contrat restant, tel que l'écran Contrats le donne (corrections du 08/10, 2.1) : le même nombre, jamais écrit en dur. */
function mgmtCarteContratTexte(f){
  if(!f) return '?';
  if(f.libre) return 'LIBRE';
  if(!f.ct) return '—';
  const n=mgmtContratRestants(f);
  return n+' COMBAT'+(n>1?'S':'');
}

/** Brief démo, lot 7 T1 : tant que le joueur n'a rien vu, la ligne Style dit la force, à défaut la faille, que son bilan laisse lire — avec la même mention que la fiche. */
/** Le public réclame-t-il ce combat ? Dérivé de mgmtPublicReclame, jamais stocké. */
function mgmtCarteReclame(m,a,b){
  if(!m||m.effectifs!==1||typeof mgmtPublicReclame!=='function') return false;
  const cle=m.cycle+':'+(m.hist||[]).length+':'+(m.card.main||[]).length+':'+(m.cal&&m.cal.jour);
  if(!MGMT_CARTE_RECL||MGMT_CARTE_RECL.m!==m||MGMT_CARTE_RECL.cle!==cle) MGMT_CARTE_RECL={m,cle,s:new Set(mgmtPublicReclame(m).map(r=>[r.a,r.b].sort().join('|')))};
  return MGMT_CARTE_RECL.s.has([a,b].sort().join('|'));
}
let MGMT_CARTE_RECL=null;
function mgmtCarteStyleBilan(m,f){
  if(!f||m.effectifs!==1||typeof mgmtAnciensBilan!=='function') return {t:''};
  const l=mgmtAnciensBilan(m,f), x=l.find(y=>y.s==='+')||l[0];
  return {t:x?x.t:''};
}

function mgmtCarteColonne(m,f){
  if(!f) return {rang:'?',contrat:'?',bilan:'?',allonge:'?',style:'?',forme:'<b>?</b>'};
  const phys=mgmtCombatProfile(f).phys||{};
  return {rang:mgmtRangTexte(m,f),contrat:mgmtCarteContratTexte(f),bilan:`${f.W}-${f.L}-${f.D||0}`,
    allonge:Number.isFinite(phys.reach)?(phys.reach/100).toFixed(2).replace('.',',')+' m':'?',
    style:mfNet(mgmtEffectifFacon(m,f)||mgmtCarteStyleBilan(m,f).t||'?'),styleBilan:!mgmtEffectifFacon(m,f)&&!!mgmtCarteStyleBilan(m,f).t,forme:mgmtCarteFormeHtml(m,f)};
}

/** La bannière du face-à-face (planche « Booking ») : le premier combattant sur le noir, le second sur le rouge, la séparation en diagonale. Les noms rétrécissent
 *  dans la place que la diagonale leur laisse (300 px en haut à gauche, 320 px en bas à droite) : ils ne touchent ni le VS, ni le cartouche, ni l'autre nom ; un prénom trop long se coupe. */
function mgmtCarteBanniere(a,b,div,rounds,retour){
  const nom=f=>f?{p:mfNet(f.first||''),n:mfNet(f.last||f.name)}:{p:'',n:'?'};
  const A=nom(a), B=nom(b);
  const tag=`<div>${esc(mfNet(mgmtDivisionLabel(div)))}</div>`+(rounds?`<div>${esc(rounds)} ROUNDS</div>`:'');
  const clic=retour?` onclick="${retour}" role="button" title="Changer de combattant" style="cursor:pointer"`:'';
  return `<div class="mf-car-ban"><i class="mf-car-diag r"></i><i class="mf-car-diag c"></i>`
    +`<div class="mf-car-ban-nom"${clic}><b style="font-size:${mfCorps(A.n,300,96,22)}px">${esc(A.n)}</b><span>${esc(A.p)}</span></div>`
    +`<div class="mf-car-ban-tag">${tag}</div>`
    +`<div class="mf-car-ban-nom d"><span>${esc(B.p)}</span><b style="font-size:${mfCorps(B.n,320,96,22)}px">${esc(B.n)}</b></div>`
    +`<div class="mf-car-vs">VS</div></div>`;
}

function mgmtCarteCombatLigne(m,i,fight,etatMain){
  const nom=MGMT_CARTE_NOMS[i]||('Combat '+(i+1));
  const cur=etatMain.courant===i;
  if(fight){
    const fa=mgmtFighterById(m,fight.a), fb=mgmtFighterById(m,fight.b);
    const titre=fight.title===true;
    /* Lot 11 (D5) : un champion ne combat que pour sa ceinture — elle est en jeu d'office, le joueur ne la retire pas. */
    const champ=typeof mgmtChampionIds==='function'?mgmtChampionIds(m):new Set(), force=titre&&(champ.has(fight.a)||champ.has(fight.b));
    return `<div class="mf-car-slot confirme${cur?' choisi':''}"><div class="mf-car-num" onclick="CL.mgmtCarteModifie(${i})">${i+1}</div><div class="mf-car-slot-c">`
      +`<div class="mf-car-slot-t"><span>${esc(nom.toUpperCase())}</span><em>${esc(mgmtCarteCourt(fa?fa.div:''))}</em>${force?`<button type="button" class="mf-car-titre on" aria-pressed="true" disabled title="Le champion ne combat que pour sa ceinture">TITRE EN JEU</button>`      :((titre||mgmtCanTitle(m,fight))?`<button type="button" class="mf-car-titre${titre?' on':''}" aria-pressed="${titre}" onclick="CL.mgmtTitle(${i},${!titre})">${titre?'TITRE EN JEU':'SANS TITRE'}</button>`:'')}</div>`
      +`<div class="mf-car-slot-n" title="Modifier ce combat" onclick="CL.mgmtCarteModifie(${i})"><b>${esc(mfNet(fa?(fa.last||fa.name):'?'))}</b>${mfMarqueNom(m,fa&&fa.id)}<span>contre</span><b>${esc(mfNet(fb?(fb.last||fb.name):'?'))}</b>${mfMarqueNom(m,fb&&fb.id)}</div></div>`
      +`<div class="mf-car-slot-s">${MF_SVG_CONFIRME}<button type="button" class="mf-car-retire" aria-label="Retirer ce combat" onclick="CL.mgmtUnbook(${i})">×</button></div></div>`;
  }
  const pre=etatMain.pre===i;
  const pa=pre?mgmtFighterById(m,MGMT_CART.pick):null, pb=pre?etatMain.vise:null;
  if(pre&&pa){
    return `<div class="mf-car-slot apreparer choisi"><div class="mf-car-num">${i+1}</div><div class="mf-car-slot-c">`
      +`<div class="mf-car-slot-t"><span>${esc(nom.toUpperCase())}</span><em>${esc(mgmtCarteCourt(pa.div))}</em></div>`
      +`<div class="mf-car-slot-n"><b>${esc(mfNet(pa.last||pa.name))}</b>${mfMarqueNom(m,pa&&pa.id)}<span>contre</span><b>${esc(pb?mfNet(pb.last||pb.name):'?')}</b>${mfMarqueNom(m,pb&&pb.id)}</div></div>`
      +`<div class="mf-car-slot-s"><div class="mf-eff-q" aria-hidden="true">?</div></div></div>`;
  }
  return `<div class="mf-car-slot vide${cur?' choisi':''}"><div class="mf-car-num">${i+1}</div><div class="mf-car-slot-c">`
    +`<div class="mf-car-slot-t"><span>${esc(nom.toUpperCase())}</span></div><div class="mf-car-slot-v">À composer</div></div></div>`;
}

/** Les noms de famille portés par plusieurs combattants de la liste (corrections du 08/10, 2.6) : on y ajoute l'initiale du prénom. */
function mgmtCarteHomonymes(liste){
  const n=new Map();
  for(const f of liste){ const k=mfNet(f.last||f.name); n.set(k,(n.get(k)||0)+1); }
  return new Set([...n].filter(([,c])=>c>1).map(([k])=>k));
}
/** Ce que le booking sait d'un combattant en une ligne (planche « Booking » : « Attend depuis 7 mois », « Battu par Swat », « Sur la carte »). Dérivé. */
function mgmtCarteNote(m,f,contre){
  if(!f) return '';
  /* Brief démo, lot 7 T3 : avec un premier choix posé, le public qui réclame ce combat se lit avant toute confirmation. */
  if(contre&&mgmtCarteReclame(m,contre,f.id)&&mgmtAvailable(m,f)&&!mgmtEngaged(m,f)) return 'Le public réclame ce combat';
  if(!mgmtAvailable(m,f)) return 'Indisponible';
  if(mgmtEngaged(m,f)) return 'Sur la carte';
  const n=typeof mgmtContratAttente==='function'?mgmtContratAttente(m,f):0;
  if(n>=2) return 'Attend depuis '+Math.max(1,Math.round(n*MGMT_EVENT_WEEKS/4.345))+' mois';
  const h=typeof mgmtFightHistory==='function'?mgmtFightHistory(m,f):[], t=h[h.length-1];
  if(t){ const cote=t.a.id===f.id?'A':'B', adv=cote==='A'?t.b:t.a, nom=mfNet((adv.name||'').split(' ').slice(-1)[0]);
    if(t.winner==='D') return 'Nul contre '+nom;
    return (t.winner===cote?'A battu ':'Battu par ')+nom; }
  return '';
}
function mgmtCarteAdvLigne(m,f,i,choisi,homo){
  const sel=mgmtSelectable(m,f,MGMT_CART.pick);
  const raison=mgmtCarteNote(m,f,MGMT_CART.pick);
  const rg=mgmtRangAffichable(m,f);
  return `<button type="button" class="mf-car-adv${choisi?' choisi':''}${sel?'':' off'}" onclick="CL.mgmtCarteVise('${escJsAttr(f.id)}')">`
    +`<span class="mf-car-adv-r">${esc(rg||'—')}</span><span class="mf-car-adv-c"><span class="mf-car-adv-nb"><b style="font-size:${mfCorps(f.last||f.name,200,34,24)}px">${esc(homo&&homo.has(mfNet(f.last||f.name))&&f.first?mfNet(f.first).charAt(0)+'. ':'')}${esc(mfNet(f.last||f.name))}${mfMarqueNom(m,f.id)}</b>`
    +`<i>${esc(f.W)}-${esc(f.L)}-${esc(f.D||0)}</i></span><span class="mf-car-adv-s">${esc(raison||' ')}</span></span></button>`;
}

function scr_mgmt_carte_liste(){
  if(!G||!G.mgmt) return scr_mgmt_bureau();
  const m=G.mgmt;
  if(MGMT_CART.pick){ const pf=mgmtFighterById(m,MGMT_CART.pick); if(!pf||!mgmtSelectable(m,pf,null)) MGMT_CART.pick=null; }
  const pickF=MGMT_CART.pick?mgmtFighterById(m,MGMT_CART.pick):null;
  const liste=mgmtCarteListe(m);
  const cur=Math.max(0,Math.min(MGMT_CART.cursor||0,Math.max(0,liste.length-1))); MGMT_CART.cursor=cur;
  const vise=liste[cur]||null;
  const main=Array.isArray(m.card.main)?m.card.main:[];
  const taille=(Number.isSafeInteger(m.card.sizeMain)&&m.card.sizeMain>0)?m.card.sizeMain:MGMT_MAIN_SIZE;
  const plein=main.length>=taille;
  const etat={courant:plein?-1:main.length,pre:(pickF&&!plein)?main.length:-1,vise:(pickF&&vise&&vise.id!==pickF.id)?vise:null};
  const slots=[]; for(let i=0;i<taille;i++) slots.push(mgmtCarteCombatLigne(m,i,main[i]||null,etat));
  const legende=`<div class="mf-car-legende"><span>${MF_SVG_CONFIRME}Confirmé</span><span><i class="mf-eff-q">?</i>À confirmer</span><span>À composer</span></div>`;
  const gauche=mfPanneau(`<div class="mf-car-t">LA CARTE</div><div class="mf-car-slots">${slots.join('')}</div>${legende}`,'normal','mf-car-g');

  /* Le centre : le combat visé, ou le combattant que le curseur désigne. */
  const A=pickF||vise, B=pickF?etat.vise:null;
  const ca=mgmtCarteColonne(m,A), cb=mgmtCarteColonne(m,B);
  const duo=!!(A&&B);
  const rounds=duo?(main.length===0?5:3):'';
  const peutTitre=duo&&typeof mgmtCanTitle==='function'&&mgmtCanTitle(m,{a:A.id,b:B.id});
  const enjeux=[]; if(duo&&(ca.styleBilan||cb.styleBilan)) enjeux.push('D’après son bilan : le style'); if(peutTitre) enjeux.push('Titre possible'); if(rounds) enjeux.push(rounds+' rounds');
  /* Corrections du 08/10, 2.3 et 2.4 : ce que le booking sait de la paire, dit avant la confirmation. */
  if(duo){
    const reclame=typeof mgmtPublicReclame==='function'?mgmtPublicReclame(m).find(r=>(r.a===A.id&&r.b===B.id)||(r.a===B.id&&r.b===A.id)):null;
    if(reclame) enjeux.push('Combat réclamé'+(reclame.raison&&MGMT_RECLAME_LIBELLES[reclame.raison]?' : '+MGMT_RECLAME_LIBELLES[reclame.raison].toLowerCase():''));
    if(typeof mgmtMemeCamp==='function'&&m.effectifs===1&&mgmtMemeCamp(m,A,B)) enjeux.push('Même camp : les opposer les contrarie');
    if(typeof mgmtFratrie==='function'&&m.effectifs===1&&mgmtFratrie(m,A).includes(B.id)) enjeux.push('Frère et sœur : les opposer les contrarie');
  }
  const comp=duo
    ?mgmtCarteLigneComp(esc(ca.rang),esc(cb.rang),'Classement')+mgmtCarteLigneComp(esc(ca.bilan),esc(cb.bilan),'Palmarès')
      +mgmtCarteLigneComp(esc(ca.allonge),esc(cb.allonge),'Allonge')+mgmtCarteLigneComp(mgmtCarteStyleHtml(ca),mgmtCarteStyleHtml(cb),'Style')
      +mgmtCarteLigneComp(ca.forme,cb.forme,'3 derniers combats')+mgmtCarteLigneComp(`<b>${esc(ca.contrat)}</b>`,`<b>${esc(cb.contrat)}</b>`,'Contrat restant')
    :`<div class="mf-car-aide">${esc(plein?'La carte principale est complète.':(A?'Choisis son adversaire dans la liste.':'Aucun combattant disponible dans cette catégorie.'))}</div>`;
  const faits=duo&&enjeux.length?`<div class="mf-car-enjeux"><div class="mf-cal-lib">Enjeux</div><div>${enjeux.map(e=>`<span>${esc(e)}</span>`).join('')}</div></div>`:'';
  const prop=typeof mgmtPropositionHtml==='function'?mgmtPropositionHtml(m):'';
  const peutConf=pickF&&etat.vise&&mgmtSelectable(m,etat.vise,pickF.id)&&!plein;
  const boutons=`<div class="mf-car-boutons">`
    +(peutConf?mfBouton('Confirmer le combat',{touche:'Entrée',jaune:true,onclick:`CL.mgmtPick('${esc(etat.vise.id)}')`})
      :(!pickF&&vise&&mgmtSelectable(m,vise,null)&&!plein?mfBouton('Choisir ce combattant',{touche:'Entrée',jaune:true,onclick:`CL.mgmtPick('${esc(vise.id)}')`}):''))
    +(pickF?mfBouton('Retour',{touche:'Échap',onclick:'CL.mgmtCarteLeave()'}):'')
    +(pickF&&mgmtAgendaActif(m)?mfBouton('Proposer',{touche:'D',onclick:'CL.mgmtCarteProposer()'}):'')
    +(A?mfBouton('Sa fiche',{touche:'F',onclick:`CL.mgmtCarteFiche()`}):'')+`</div>`;
  const centre=`<div class="mf-car-c">${mgmtCarteBanniere(A,B,A?A.div:mgmtCarteDiv(m),rounds,pickF?'CL.mgmtCarteLeave()':'')}`
    +mfPanneau(`<div class="mf-car-comp-l">${comp}</div>${prop?`<div class="mf-car-prop mf-ancien">${prop}</div>`:''}${faits}${boutons}`,'normal','mf-car-cmp')+`</div>`;

  /* La droite : les adversaires, six lignes qui suivent le curseur. */
  const debut=Math.min(Math.max(0,cur-MGMT_CARTE_LIGNES+1),Math.max(0,liste.length-MGMT_CARTE_LIGNES));
  const homo=mgmtCarteHomonymes(liste);
  const lignes=liste.slice(debut,debut+MGMT_CARTE_LIGNES).map((f,k)=>mgmtCarteAdvLigne(m,f,debut+k,debut+k===cur,homo)).join('');
  const libres=liste.filter(f=>mgmtSelectable(m,f,MGMT_CART.pick)).length;
  const droite=mfPanneau(`<div class="mf-car-t">${pickF?'ADVERSAIRES':'COMBATTANTS'}</div>`
    +`<div class="mf-car-tri"><span>${libres} libres sur ${liste.length}</span><span>Tri : classement</span></div>`
    +`<div class="mf-car-advs">${lignes||'<div class="mf-eff-aucun">Personne dans cette catégorie.</div>'}</div>`
    +mfBouton('Catégorie : '+mfNet(mgmtDivisionLabel(mgmtCarteDiv(m))),{touche:'C',onclick:'CL.mgmtCarteCategorie(1)',classe:'mf-car-cat'}),'normal','mf-car-d');
  const contenu=`<main class="mf-contenu mf-carte">${gauche}${centre}${droite}</main>`;
  return mfEcran(contenu,{barre:'jeu',courant:'carte',m,plaque:'Carte',libelle:`${main.length} / ${taille}`,tuiles:[main.length,taille],droite:`${mgmtOrgNom(m)} Fight Night ${(m.eventsPlayed||0)+1}`,
    touches:[{ks:['Échap'],t:'Retour',onclick:'CL.mgmtCarteLeave()'},{ks:['↑','↓'],t:'Choisir'},{ks:['A','E'],t:'Section'},{ks:['C'],t:'Catégorie',onclick:'CL.mgmtCarteCategorie(1)'},
      {ks:['F'],t:'Fiche',onclick:'CL.mgmtCarteFiche()'},{ks:['Entrée'],t:pickF?'Confirmer':'Choisir',jaune:true,onclick:'CL.mgmtCarteEntree()'}]});
}
function scr_mgmt_carte_cadre(){
  if(!G||!G.mgmt) return scr_mgmt_bureau();
  const m=G.mgmt;
  if(MGMT_CART.mode!=='dossiers') return scr_mgmt_carte_liste();
  return mgmtCarteDossiersEcran(m);
}
SCREENS.mgmt_carte=scr_mgmt_carte_cadre;

/** Rend le mode dossier courant de l’écran Carte à partir de l’état éphémère MGMT_CART.
 * N’écrit aucune donnée dans la partie et ne réserve aucun combattant.
 * @param {Object} m Partie en mémoire.
 * @returns {string} Fragment HTML de l’étape dossier courante.
 */
function mgmtCarteDossierHtml(m){
  const pile=Array.isArray(MGMT_CART.dossiers)?MGMT_CART.dossiers:[];
  const i=Math.max(0,Math.min(MGMT_CART.index||0,Math.max(0,pile.length-1)));
  MGMT_CART.index=pile.length?i:0;
  const d=pile.length?pile[i]:null;
  const etape=MGMT_CART.etape===2?2:1;
  const combattant=etape===2?(mgmtFighterById(m,MGMT_CART.dossierCombattant)||d&&d.combattant): (d&&d.combattant);
  const adversaire=etape===2&&(d&&d.adversaire);
  const titre=combattant?esc(combattant.name||combattant.last||combattant.first):'';
  /* IDs pour navigation */
  const prevBtn=`<button type="button" aria-label="Précédent" onclick="CL.mgmtDossierSwipe(-1)">‹</button>`;
  const nextBtn=`<button type="button" aria-label="Suivant" onclick="CL.mgmtDossierSwipe(1)">›</button>`;
  if(!d){
    return `<main class="mf-contenu mf-carte"><div class="mf-eff-aucun">Personne dans cette catégorie.</div>
      <div class="mf-car-boutons"><button type="button" onclick="CL.mgmtDossierListe()">Liste complète</button></div></main>`;
  }
  /* raison */
  const raisonTxt= d.raison && (d.raison.titre||d.raison.libelle||d.raison.texte||d.raison.raison);
  const raisonFam= d.raison && d.raison.famille? esc(d.raison.famille):'';
  const resume = etape===2 ? `<div class="mf-dossier-resume">${esc('Ce que serait ce combat')}</div>` : '';
  const nomComb = combattant? esc(combattant.last||combattant.name||''):'';
  const nomAdv = adversaire? esc(adversaire.last||adversaire.name||''):'';
  const ident = etape===1? esc(d.combattant.id||'') : esc(d.adversaire.id||'');
  const cadre = etape===1
   ? `<div class="mf-dossier"><div class="mf-dossier-raison">${esc(raisonTxt||'')}</div><div class="mf-dossier-nom">${nomComb}</div><div class="mf-dossier-id" data-id="${ident}">${ident}</div></div>`
   : `<div class="mf-dossier"><div class="mf-dossier-raison">${esc(raisonTxt||'')}</div><div class="mf-dossier-nom">${nomComb} <span>vs</span> ${nomAdv}</div><div class="mf-dossier-id" data-id="${ident}">${ident}</div>${resume}</div>`;
  return `<main class="mf-contenu mf-carte mf-dossiers">
    <div class="mf-dossier-etapes">Étape ${etape}</div>
    <div class="mf-dossier-nav">${prevBtn}${cadre}${nextBtn}</div>
    <div class="mf-car-boutons">
      ${etape===1?`<button type="button" onclick="CL.mgmtCarteEntree()">Choisir</button>`:`<button type="button" onclick="CL.mgmtCarteEntree()">Confirmer</button>`}
      <button type="button" onclick="CL.mgmtCarteEsc()">Retour</button>
      <button type="button" onclick="CL.mgmtCarteFiche()">Fiche</button>
      <button type="button" onclick="CL.mgmtCarteProposer()">D'autres dossiers</button>
      <button type="button" onclick="CL.mgmtDossierListe()">Liste complète</button>
      ${etape===2?`<button type="button" onclick="CL.mgmtDossierPresentation()">Présentation</button>`:''}
    </div></main>`;
}

function mgmtCarteDossiersEcran(m){
  const html=mgmtCarteDossierHtml(m);
  const touches=[
    {ks:['←','→'],t:'Défiler',onclick:'CL.mgmtDossierSwipe(-1)'},
    {ks:['Entrée'],t:(MGMT_CART.etape===2?'Confirmer':'Choisir'),jaune:true,onclick:'CL.mgmtCarteEntree()'},
    {ks:['Échap'],t:'Retour',onclick:'CL.mgmtCarteEsc()'},
    {ks:['F'],t:'Fiche',onclick:'CL.mgmtCarteFiche()'},
    {ks:['D'],t:'D’autres dossiers',onclick:'CL.mgmtCarteProposer()'},
    {ks:['L'],t:'Liste',onclick:'CL.mgmtDossierListe()'}
  ];
  if(MGMT_CART.etape===2) touches.push({ks:['P'],t:'Présentation',onclick:'CL.mgmtDossierPresentation()'});
  const opts={barre:'jeu',courant:'carte',m,plaque:'Carte',touches};
  return mfEcran? (typeof mfEcran==='function'? mfEcran(html,opts): html) : html;
}

Object.assign(CL,{
  /** Un clic sur la liste : sans premier choix il choisit ; avec un premier choix il VISE (la confirmation se fait au bouton ou à Entrée). */
  mgmtCarteVise(id){
    const m=G.mgmt, f=mgmtFighterById(m,id); if(!f) return;
    if(!MGMT_CART.pick){ CL.mgmtPick(id); return; }
    const i=mgmtCarteListe(m).findIndex(x=>x.id===id); if(i>=0) MGMT_CART.cursor=i;
    render();
  },
  /** Un combat confirmé se reprend : il est retiré de la carte et le premier combattant revient en choix, le curseur sur son adversaire (Échap remonte d'un cran de plus, jusqu'au premier choix). */
  mgmtCarteModifie(i){
    const m=G.mgmt, f=m.card.main[i]; if(!f) return;
    const a=f.a, b=f.b;
    if(!mgmtRemoveMain(m,i)) return;
    saveMgmt(); mgmtCartReset(); MGMT_CART.pick=a;
    MGMT_CART.cursor=Math.max(0,mgmtCarteListe(m).findIndex(x=>x.id===b)); render();
  },
  mgmtCarteCategorie(delta){
    const m=G.mgmt; if(MGMT_CART.pick) return;
    const ids=[...new Set(mgmtCartRows(m).map(f=>f.div))]; if(!ids.length) return;
    const i=ids.indexOf(mgmtCarteDiv(m));
    MGMT_CART.div=ids[(i+(delta<0?-1:1)+ids.length)%ids.length]; MGMT_CART.cursor=0; render();
  },
  /** La préparation à la demande. En mode dossier, D demande une nouvelle pile selon l’étape. */
  mgmtCarteProposer(){
    const m=G.mgmt; if(!mgmtAgendaActif(m)) return;
    if(MGMT_CART.mode!=='dossiers'){
      if(!MGMT_CART.pick) return;
      const combattant=mgmtFighterById(m,MGMT_CART.pick); if(!combattant) return;
      const pile=mgmtDossiersAdversaires(m,MGMT_CART.pick); if(!pile||!pile.length) return;
      MGMT_CART.dossiers=pile.map(d=>({combattant:d.combattant,adversaire:d.adversaire,raison:d.raison}));
      return;
    }
    MGMT_CART.mode='dossiers';
    if(MGMT_CART.etape===1){
      const vus=Array.isArray(MGMT_CART.vusCombattants)?MGMT_CART.vusCombattants:[];
      const pile=mgmtDossiersCombattants(m,null,vus);
      if(!pile||!pile.length){ MGMT_CART.dossiers=[]; render(); return; }
      MGMT_CART.dossiers=pile.map(d=>({combattant:d.combattant,adversaire:d.adversaire,raison:d.raison}));
      MGMT_CART.vusCombattants=vus.concat(pile.map(d=>d.combattant.id));
      MGMT_CART.index=0; MGMT_CART.etape=1; MGMT_CART.dossierCombattant=null;
    } else {
      const cid=MGMT_CART.dossierCombattant; if(!cid){ MGMT_CART.etape=1; render(); return; }
      const vus=(MGMT_CART.vusAdversaires&&MGMT_CART.vusAdversaires[cid])||[];
      const pile=mgmtDossiersAdversaires(m,cid,vus);
      if(!pile||!pile.length){ MGMT_CART.dossiers=[]; render(); return; }
      MGMT_CART.dossiers=pile.map(d=>({combattant:d.combattant,adversaire:d.adversaire,raison:d.raison}));
      if(!MGMT_CART.vusAdversaires) MGMT_CART.vusAdversaires={};
      MGMT_CART.vusAdversaires[cid]=vus.concat(pile.map(d=>d.adversaire.id));
      MGMT_CART.index=0; MGMT_CART.etape=2;
    }
    render();
  },
  mgmtDossierIndex(delta){
    const m=G.mgmt; const pile=Array.isArray(MGMT_CART.dossiers)?MGMT_CART.dossiers:[];
    if(!pile.length) return;
    const n=pile.length; MGMT_CART.index=((MGMT_CART.index||0)+(delta<0?-1:1)+n)%n; render();
  },
  mgmtDossierSwipe(delta){ CL.mgmtDossierIndex(delta<0?-1:1); },
  mgmtDossierEsc(){
    const m=G.mgmt;
    if(MGMT_CART.mode!=='dossiers'){ CL.mgmtCarteLeave(); return; }
    if(MGMT_CART.etape===2){
      const cid=MGMT_CART.dossierCombattant;
      MGMT_CART.dossierCombattant=cid;
      MGMT_CART.etape=1;
      MGMT_CART.index=0;
      render(); return;
    }
    // step1 -> list mode, conserve context
    MGMT_CART.mode='liste'; MGMT_CART.listeDepuisDossiers=true; render();
  },
  mgmtDossierListe(){
    if(MGMT_CART.mode!=='dossiers') return;
    MGMT_CART.mode='liste'; MGMT_CART.listeDepuisDossiers=true; render();
  },
  mgmtDossierRetour(){
    if(!MGMT_CART.listeDepuisDossiers) return;
    MGMT_CART.mode='dossiers'; MGMT_CART.listeDepuisDossiers=false; render();
  },
  mgmtCarteEsc(){ return CL.mgmtDossierEsc(); },
  mgmtDossiers(){ return CL.mgmtCarteDossiersActiver(); },
  mgmtCarteDossiers(){ return CL.mgmtCarteDossiersActiver(); },
  mgmtDossierEchap(){ return CL.mgmtDossierEsc(); },
  mgmtDossierPresentation(){
    const m=G.mgmt;
    if(MGMT_CART.mode!=='dossiers') return;
    const pile=Array.isArray(MGMT_CART.dossiers)?MGMT_CART.dossiers:[];
    const d=pile[MGMT_CART.index||0]; if(!d) return;
    const a=d.combattant&&d.combattant.id; const b=MGMT_CART.etape===2&&(d.adversaire&&d.adversaire.id);
    if(!a||!b) return;
    if(typeof mgmtPresentationCombat==='function'){ mgmtPresentationCombat({m:m,h:m.cycle||0},a,b); }
    if(typeof CL.mgmtPresentationCombat==='function') CL.mgmtPresentationCombat(a,b);
  },
  mgmtCarteDossiersActiver(){
    // entre en mode dossier (étape combattant par défaut) sans booking
    const m=G.mgmt; if(!mgmtAgendaActif(m)) return false;
    MGMT_CART.mode='dossiers'; MGMT_CART.listeDepuisDossiers=false;
    MGMT_CART.etape=1; MGMT_CART.index=0; MGMT_CART.dossierCombattant=null;
    MGMT_CART.vusCombattants=[]; MGMT_CART.vusAdversaires={};
    CL.mgmtCarteProposer(); // remplira pile T1 en mode dossier
    if(MGMT_CART.mode!=='dossiers') MGMT_CART.mode='dossiers';
    render(); return true;
  },
  mgmtCarteFiche(){
    if(MGMT_CART.mode==='dossiers'){
      const m=G.mgmt; const pile=Array.isArray(MGMT_CART.dossiers)?MGMT_CART.dossiers:[];
      const d=pile[MGMT_CART.index||0];
      const id= d ? (MGMT_CART.etape===2 ? (d.adversaire&&d.adversaire.id) : (d.combattant&&d.combattant.id)) : null;
      const f=id?mgmtFighterById(m,id):null;
      if(f) CL.mgmtFicheParIndex(m.roster.indexOf(f));
      return;
    }
    const m=G.mgmt, f=(MGMT_CART.pick&&mgmtFighterById(m,MGMT_CART.pick))||mgmtCarteListe(m)[MGMT_CART.cursor||0];
    if(f) CL.mgmtFicheParIndex(m.roster.indexOf(f));
  },
  mgmtCarteEntree(){
    const m=G.mgmt;
    if(MGMT_CART.mode==='dossiers'){
      const pile=Array.isArray(MGMT_CART.dossiers)?MGMT_CART.dossiers:[];
      const d=pile[MGMT_CART.index||0];
      if(!d) return;
      if(MGMT_CART.etape===1){
        MGMT_CART.dossierCombattant=d.combattant&&d.combattant.id;
        // nouvelle pile adversaires
        const vus=(MGMT_CART.vusAdversaires&&MGMT_CART.vusAdversaires[MGMT_CART.dossierCombattant])||[];
        const pile2=mgmtDossiersAdversaires(m,MGMT_CART.dossierCombattant,vus);
        MGMT_CART.dossiers=(pile2||[]).map(x=>({combattant:x.combattant,adversaire:x.adversaire,raison:x.raison}));
        if(!MGMT_CART.vusAdversaires) MGMT_CART.vusAdversaires={};
        if(pile2&&pile2.length) MGMT_CART.vusAdversaires[MGMT_CART.dossierCombattant]=vus.concat(pile2.map(x=>x.adversaire.id));
        MGMT_CART.etape=2; MGMT_CART.index=0;
        render(); return;
      }
      // confirm adversaire via porte
      const cid=MGMT_CART.dossierCombattant;
      const aid=d.adversaire&&d.adversaire.id;
      if(!cid||!aid) return;
      MGMT_CART.pick=cid;
      CL.mgmtPick(aid);
      // fermer mode dossier
      MGMT_CART.mode='liste'; MGMT_CART.etape=1; MGMT_CART.index=0; MGMT_CART.dossierCombattant=null;
      MGMT_CART.dossiers=[]; MGMT_CART.vusCombattants=[]; MGMT_CART.vusAdversaires={}; MGMT_CART.listeDepuisDossiers=false;
      render(); return;
    }
    const l=mgmtCarteListe(m), f=l[MGMT_CART.cursor||0];
    /* Brief démo, lot 4 (D8) : Entrée sur un combattant déjà engagé ne reste pas muet, le curseur passe au premier libre. */
    if(f&&!MGMT_CART.pick&&!mgmtSelectable(m,f,null)){ const i=l.findIndex(x=>mgmtSelectable(m,x,null)); if(i>=0){ MGMT_CART.cursor=i; render(); return; } }
    if(f) CL.mgmtPick(f.id);
  },
});
keysRegister('mgmt_carte',{
  ArrowUp(){ if(MGMT_CART.mode==='dossiers') return; const n=mgmtCarteListe(G.mgmt).length; if(n){ MGMT_CART.cursor=((MGMT_CART.cursor||0)-1+n)%n; render(); } },
  ArrowDown(){ if(MGMT_CART.mode==='dossiers') return; const n=mgmtCarteListe(G.mgmt).length; if(n){ MGMT_CART.cursor=((MGMT_CART.cursor||0)+1)%n; render(); } },
  ArrowLeft(){ if(MGMT_CART.mode==='dossiers'){ CL.mgmtDossierIndex(-1); return; } },
  ArrowRight(){ if(MGMT_CART.mode==='dossiers'){ CL.mgmtDossierIndex(1); return; } },
  l(){ if(MGMT_CART.mode==='dossiers') CL.mgmtDossierListe(); else CL.mgmtDossierRetour(); },
  L(){ if(MGMT_CART.mode==='dossiers') CL.mgmtDossierListe(); else CL.mgmtDossierRetour(); },
  p(){ CL.mgmtDossierPresentation(); },
  P(){ CL.mgmtDossierPresentation(); },
  Enter(){ CL.mgmtCarteEntree(); },
  c(){ CL.mgmtCarteCategorie(1); },
  C(){ CL.mgmtCarteCategorie(1); },
  d(){ CL.mgmtCarteProposer(); },
  D(){ CL.mgmtCarteProposer(); },
  f(){ CL.mgmtCarteFiche(); },
  F(){ CL.mgmtCarteFiche(); },
  '1'(){ CL.mgmtUnbook(0); },
  '2'(){ CL.mgmtUnbook(1); },
  '3'(){ CL.mgmtUnbook(2); },
  '4'(){ CL.mgmtUnbook(3); },
  '5'(){ CL.mgmtUnbook(4); },
  Escape(){ if(MGMT_CART.mode==='dossiers') CL.mgmtDossierEsc(); else if(MGMT_CART.listeDepuisDossiers) CL.mgmtDossierRetour(); else CL.mgmtCarteLeave(); },
  Backspace(){ if(MGMT_CART.mode==='dossiers') CL.mgmtDossierEsc(); else if(MGMT_CART.listeDepuisDossiers) CL.mgmtDossierRetour(); else CL.mgmtCarteLeave(); },
});
/* ==== [FIN ANCRE] ==== */
