"use strict";
/* ==== [ANCRE: MGMT_BRIEF_DEMO_LOT8_PRISE_EN_MAIN] — Brief démo du 09/10/2026, lot 8 : la première demi-heure.
   T1 l'arrivée (un écran entre « Créer la partie » et la carte), T2 les six moments de Leïla (déclenchés par l'état du jeu, jamais par une minuterie,
   une seule fois chacun, hors des parties), T3 la prochaine chose à faire (la première ligne de « Ce qui empêche la soirée », sans second système),
   T4 le réglage « Accompagnement de Leïla » (Options, onglet Partie). Leïla vouvoie (décision d'Anthony du 09/10/2026). Tous les textes sont des
   propositions de Claude : relu:false, à réécrire par Anthony. La planche de l'arrivée et de la ligne (T5) reste à valider. ==== */

const MGMT_PRISE_TEXTES={
  arrivee:{
    titre:{texte:'Vous êtes le matchmaker de {org}',relu:false},
    leila:{texte:'Je suis Leïla. Je vous aiderai pour les premiers combats.',relu:false},
    bouton:{texte:'Commencer',relu:false},
  },
  moments:{
    carte_vide:{texte:'Bienvenue. Choisissez un combattant, puis son adversaire.',relu:false},
    premier_combat:{texte:'Un premier combat. Il en faut cinq sur la carte principale.',relu:false},
    carte_complete:{texte:'La carte principale est complète. Je prépare les préliminaires.',relu:false},
    prelims:{texte:'Voici mes préliminaires. Validez la carte, ou changez un combat.',relu:false},
    soiree_prete:{texte:'Tout est prêt. Ouvrez le calendrier pour jouer la soirée.',relu:false},
    premier_lendemain:{texte:'Première soirée terminée. Regardez comment le public a réagi.',relu:false},
  },
  prete:{texte:'La soirée est prête.',relu:false},
};
const MGMT_PRISE_CLE='cage-legacy-accompagnement';

/** Les six moments, dans l'ordre, chacun avec la condition de l'état du jeu qui le déclenche. Pur. */
const MGMT_PRISE_MOMENTS=[
  ['carte_vide',(m,ecran)=>mgmtSoireesJoueur(m)===0&&(m.card.main||[]).length===0&&ecran==='mgmt_carte'],
  ['premier_combat',(m)=>mgmtSoireesJoueur(m)===0&&(m.card.main||[]).length===1],
  ['carte_complete',(m)=>mgmtSoireesJoueur(m)===0&&(m.card.main||[]).length>=(m.card.sizeMain||MGMT_MAIN_SIZE)&&!m.pile.some(a=>a.kind==='leila_bulk'&&a.status==='open')&&(m.card.prelims||[]).length===0],
  ['prelims',(m)=>mgmtSoireesJoueur(m)===0&&m.pile.some(a=>a.kind==='leila_bulk'&&a.status==='open')],
  ['soiree_prete',(m)=>mgmtSoireesJoueur(m)===0&&typeof mgmtAgendaPret==='function'&&mgmtAgendaPret(m)],
  ['premier_lendemain',(m,ecran)=>mgmtSoireesJoueur(m)===1&&ecran==='mgmt_lendemain'],
];
let MGMT_PRISE={courant:null,vus:null};

function mgmtPriseVus(){
  if(MGMT_PRISE.vus) return MGMT_PRISE.vus;
  let l=[]; try{ const brut=stockageLire(MGMT_PRISE_CLE); const p=brut?JSON.parse(brut):[]; if(Array.isArray(p)) l=p.filter(x=>typeof x==='string'); }catch(e){}
  MGMT_PRISE.vus=new Set(l); return MGMT_PRISE.vus;
}
function mgmtPriseMarquer(id){
  const v=mgmtPriseVus(); v.add(id);
  try{ stockageEcrire(MGMT_PRISE_CLE,JSON.stringify([...v])); }catch(e){}
}
/** L'accompagnement est-il actif ? (Options, onglet Partie ; hors des parties.) */
function mgmtPriseActive(){ return !(typeof MGMT_REGLAGES!=='undefined'&&MGMT_REGLAGES.aide&&MGMT_REGLAGES.aide.accompagnement===false); }

/** Le moment à dire maintenant, ou null : le moment en cours tant que son état tient, puis le suivant non vu. Une fois dit, il ne revient plus. */
function mgmtPriseMoment(m,ecran){
  if(!m||!mgmtPriseActive()||typeof mgmtAgendaActif!=='function'||!mgmtAgendaActif(m)) return null;
  const vus=mgmtPriseVus(), cond=Object.fromEntries(MGMT_PRISE_MOMENTS);
  if(MGMT_PRISE.courant&&cond[MGMT_PRISE.courant](m,ecran)) return MGMT_PRISE.courant;
  if(MGMT_PRISE.courant){ mgmtPriseMarquer(MGMT_PRISE.courant); MGMT_PRISE.courant=null; }
  for(const [id,f] of MGMT_PRISE_MOMENTS){
    if(vus.has(id)) continue;
    if(f(m,ecran)){ MGMT_PRISE.courant=id; return id; }
    /* Un moment dépassé sans avoir été dit (état déjà plus avancé) est considéré comme vu : l'ordre reste celui de la partie. */
  }
  return null;
}

/** La prochaine chose à faire : la première ligne de « Ce qui empêche la soirée », avec son lien ; quand rien ne bloque, la soirée est prête. @returns {{texte:string,onclick:string}|null} */
function mgmtProchaineChose(m){
  if(!m||typeof mgmtAgendaActif!=='function'||!mgmtAgendaActif(m)) return null;
  if(typeof mgmtDemoTerminee==='function'&&mgmtDemoTerminee(m)) return null;
  const b=mgmtAgendaBlocages(m)[0];
  if(b) return {texte:b.texte,onclick:b.onclick};
  return {texte:MGMT_PRISE_TEXTES.prete.texte,onclick:"CL.go('mgmt_calendrier')"};
}

/** Le bloc du bas à droite de tous les écrans de la partie : la parole de Leïla (si un moment est à dire) et la prochaine chose à faire. */
function mfPriseHtml(m,ecran,grise){
  if(!m||!G||G.mgmt!==m) return '';
  if(ecran==='mgmt_carte'&&typeof MGMT_CART!=='undefined'&&MGMT_CART.mode==='dossiers') return '';
  /* Monde lot 10 T3 : Résultats porte déjà la prochaine chose à faire dans son bloc jaune (même source) ; la ligne du bas ne la répète pas. */
  /* ==== [ANCRE: ACCUEIL_SANS_PROCHAINE_ETAPE] — Monde lot 12 T2 ==== */
  const p=(grise||ecran==='mgmt_resultats'||ecran==='mgmt_accueil')?null:mgmtProchaineChose(m), id=mgmtPriseMoment(m,ecran);
  const leila=id?`<div class="mf-prise-leila"><b>Leïla</b><span>${esc(MGMT_PRISE_TEXTES.moments[id].texte)}</span></div>`:'';
  const suite=p?`<button type="button" class="mf-prise-suite" onclick="${p.onclick}"><span class="mf-prise-lib">Prochaine étape</span><b>${esc(p.texte)}</b></button>`:'';
  /* Une seule ligne à la fois dans le bas de l'écran : la parole de Leïla quand un moment est à dire, sinon la prochaine étape. */
  return (leila||suite)?`<div class="mf-prise">${leila||suite}</div>`:'';
}

/* ==== [ANCRE: MONDE_LOT_10_T2_ARRIVEE] — Monde lot 10 T2 ==== */
/** L'année civile d'une soirée du calendrier (jour négatif du passé compris). Pur. */
function mgmtArriveeAnneeSoiree(m,n){
  if(!Number.isSafeInteger(n)||n<=0) return null;
  const j=typeof mgmtSoireeJour==='function'?mgmtSoireeJour(m,n):null;
  if(j===null||j===undefined) return null;
  return new Date(mgmtJourDate(j).ts).getUTCFullYear();
}

/* ==== [ANCRE: MONDE_LOT10_ARRIVEE_INTERACTIONS] — Monde lot 10 reprise du 15/10/2026 ==== */
/** Nom public ouvrant la fiche, sans interpoler un identifiant dans du JavaScript. */
function mgmtArriveeNom(id,nom){
  return `<button type="button" class="nom ar-action" data-id="${esc(id)}" onclick="CL.mgmtFiche(this.dataset.id)">${esc(nom)}</button>`;
}
/** Déplace la sélection dans les liens visibles ; Tab passe au prochain bloc. */
function mgmtArriveeChoisir(delta,bloc){
  const racine=document.querySelector('.mf-arr'); if(!racine) return;
  const liens=[...racine.querySelectorAll('.ar-action')]; if(!liens.length) return;
  const actuel=racine.querySelector('.ar-action.focus')||racine.querySelector('.jaune-bloc');
  let i=liens.indexOf(actuel), suivant;
  const groupe=x=>x.closest('.bloc,.ar-c2,.jaune-bloc')||x;
  for(let n=1;n<=liens.length;n++){
    suivant=liens[(i+delta*n+liens.length*2)%liens.length];
    if(!bloc||groupe(suivant)!==groupe(actuel)) break;
  }
  for(const x of liens) x.classList.toggle('focus',x===suivant);
  suivant.focus({preventScroll:true});
}
/** Active le lien choisi ; au premier affichage, le bloc jaune ouvre la Carte. */
function mgmtArriveeOuvrir(){
  const choisi=document.querySelector('.mf-arr .ar-action.focus');
  if(choisi) choisi.click(); else CL.mgmtArriveeFin();
}
function scr_mgmt_arrivee(){
  const m=G&&G.mgmt; if(!m) return scr_mgmt_parties();
  if(mgmtSoireesJoueur(m)>0) return scr_mgmt_accueil();
  const org=mgmtOrgNom(m);
  const orgObj=mgmtOrgParNom(org);
  const ident=orgObj?mgmtOrgIdentite(orgObj.id):null;
  const ou=mgmtAccueilContenu(m).ou;
  const premiere=mgmtSoireesJoueur(m)===0&&!!m.passe;
  const etat=premiere?'premiere':'sans-passe';

  const soir=m.cal&&m.cal.prochaines&&m.cal.prochaines[0]?m.cal.prochaines[0]:null;
  const fnNumber=(m.eventsPlayed||0)+1;
  const daysText=ou&&ou.soiree?ou.soiree.dans:'';
  const datePhraseLower=(()=>{
    let d=ou&&ou.date||'';
    for(const mx of MGMT_MOIS) d=d.split(mx).join(mx.toLowerCase());
    return d;
  })();

  /* Nombre de champions couronnés pendant le passé (lecture incrémentale). */
  const detenteurs={};
  let championsCouronnes=0;
  const faitsPasses=(m.facts||[]).slice(0,Number.isSafeInteger(m.passe&&m.passe.nFacts)?m.passe.nFacts:0);
  for(const f of faitsPasses){
    if(!f) continue;
    if(f.k==='title_initial'){
      if(f.div) detenteurs[f.div]=f.a||null;
    }else if(f.k==='title_fight'){
      const t=m.hist&&Number.isSafeInteger(f.fight)?m.hist[f.fight]:null;
      const g=t?(t.winner==='A'?t.a:(t.winner==='B'?t.b:null)):null;
      const div=f.div|| (t&&t.a?t.a.div:null);
      if(g&&g.id&&(detenteurs[div]!==g.id)){ championsCouronnes++; if(div) detenteurs[div]=g.id; }
    }
  }
  const blesses=(m.roster||[]).filter(f=>f&&!mgmtIsRetired(f)&&Number.isSafeInteger(f.susp)&&f.susp>=m.cycle);
  const blessuresNb=faitsPasses.filter(f=>f&&f.k==='injury').length;
  const pluslongBlesse=blesses.reduce((a,f)=>(!a||(f.susp>a.susp)?f:a),null);
  const blessesLongNb=pluslongBlesse?Math.max(1,pluslongBlesse.susp-m.cycle+1):0;

  /* Identité. */
  const pred=ident&&ident.predecesseur?ident.predecesseur:null;
  const adj=ident&&ident.adjointe?ident.adjointe:null;

  /* Rivalité en cours. */
  const riv=(mgmtRivalites(m)||[])[0]||null;
  const nomRivA=riv?mgmtNomParId(m,riv.a).name:'';
  const nomRivB=riv?mgmtNomParId(m,riv.b).name:'';
  const texteRiv=riv?(riv.k==='trilogie'?'Une victoire chacun · le troisième combat':'Revanche due'):'';

  /* Les douze champions. */
  const divs=allDivisions();
  const championsHtml=divs.map(d=>{
    const t=mgmtSplitTitle(m,d.id)||{};
    const nom=t.id?(mgmtNomParId(m,t.id).name||t.id):'Vacant';
    const dep=t.since;
    const annee=premiere&&t.id&&Number.isSafeInteger(dep)?mgmtArriveeAnneeSoiree(m,dep):null;
    const vac=!t.id;
    return `<div class="ch-l"><div class="oct"></div><div class="div">${esc(mgmtDivisionLabel(d.id))}</div>`
      +`<div class="n">${vac?esc('Vacante'):mgmtArriveeNom(t.id,nom)}</div>`
      +(annee!==null?`<div class="d">depuis ${esc(annee)}</div>`:'')+`</div>`;
  }).join('');
  // plus long règne
  const candRoles=divs.map(d=>{
    const l=mgmtCeintureLignee(m,d.id);
    const t=mgmtSplitTitle(m,d.id)||{};
    if(!l||!l.actuel||!t.id) return null;
    const annee=mgmtArriveeAnneeSoiree(m,l.actuel.depuis);
    return {id:t.id,nom:mgmtNomParId(m,t.id).name,div:mgmtDivisionLabel(d.id),depuis:l.actuel.depuis,defenses:l.actuel.defenses,annee};
  }).filter(Boolean);
  candRoles.sort((a,b)=> (a.depuis-b.depuis) || (b.defenses-a.defenses));
  const plusLongReigne=candRoles[0]||null;

  /* Promesses. */
  const vus=new Set();
  const promesses=[];
  for(const x of m.facts||[]){
    if(!x||x.k!=='promesse'||vus.has(x.a)) continue;
    vus.add(x.a);
    const f=mgmtFighterById(m,x.a); if(!f||mgmtIsRetired(f)) continue;
    for(const p of mgmtPromesses(m,f)){
      if(p.etat!=='en cours'||!MGMT_DEMANDES[p.want]) continue;
      const echeance=p.due===m.cycle?'ta première soirée':(org+' Fight Night '+((m.eventsPlayed||0)+1+(p.due-m.cycle)));
      promesses.push({id:f.id,nom:f.name,demande:MGMT_DEMANDES[p.want].libelle.toLowerCase(),echeance});
    }
  }
  const promList=promesses.slice(0,3);

  /* Contrats qui finissent. */
  const finContrats=(m.roster||[]).filter(f=>f&&!mgmtIsRetired(f)&&f.ct&&mgmtContratRestants(f)===1);
  const namesFin=finContrats;

  const passeAn0=premiere?mgmtPasseAnnee(m.passe.soirees,0):null;
  const passeAn1=premiere?mgmtPasseAnnee(m.passe.soirees,m.passe.soirees-1):null;

  const nSigned=m.card&&Array.isArray(m.card.main)?m.card.main.filter(x=>x&&x.herite).length:0;

  /* Col1 chiffres HTML. */
  const chiffresHtml=`
    <div class="ar-chiffres">
      <div class="tuile"><div class="v">${esc(premiere?(m.passe.soirees):0)}</div><div class="lab">Soirées</div></div>
      <div class="tuile"><div class="v">${esc(m.passe&&Number.isSafeInteger(m.passe.nHist)?m.passe.nHist:0)}</div><div class="lab">Combats</div></div>
      <div class="tuile"><div class="v">${esc(championsCouronnes)}</div><div class="lab">Champions couronnés</div></div>
      <div class="tuile"><div class="v">${esc(blessuresNb)}</div><div class="lab">Blessures</div></div>
    </div>`;

  const headerPred=pred?`<div class="tuile"><div class="lab">Ton prédécesseur</div><div class="T">${esc((pred.prenom+' '+pred.nom).trim().toUpperCase())}</div><div class="s">${esc(pred.posteActuel||'')}</div></div>`:'';
  const headerAdj=adj?`<div class="tuile"><div class="lab">Ton adjointe</div><div class="T">${esc(String(adj.prenom||'').toUpperCase())}</div></div>`:'';
  const headerPremiere=`<div class="tuile"><div class="lab">Ta première soirée</div><div class="T">${esc(String(daysText))}</div><div class="s">${esc(ou&&ou.soiree&&ou.soiree.nom||'')}</div></div>`;

  const attend=mgmtAccueilContenu(m).attend.prochaine;
  const prochainTitre=attend?attend.titre:'Ouvrir la carte';
  const prochainDetail=attend?attend.detail:'';
  const prefixTexte= nSigned>0 ? ( (pred? ( (pred.prenom+' '+pred.nom).trim() ):'Le matchmaker') + ' a signé ' + nSigned + ' combat' + (nSigned>1?'s':'') + '. ' ) : '';

  /* Col 1 bloc. */
  const titreCol1=premiere?'SIX ANS AVANT TOI':'SPLIT AUJOURD’HUI';
  const anneesHtml=premiere?`<div class="lab">${esc(passeAn0)} → ${esc(passeAn1)}</div>`:'';
  const reputHtml=ident&&ident.reputation?`<div class="bloc"><div class="sous">Ce qu’on en dit</div><div class="l1">${esc(ident.reputation)}</div></div>`:'';
  const rivaleHtml=ident&&ident.rivale?`<div class="ligne"><div class="sous">Sa rivale</div><div class="l1">${esc((mgmtOrgParId(ident.rivale)||{}).nom||'')}</div></div>`:'';
  const blessesHtml = blesses.length>0? `<div class="bloc"><div class="sous">Les blessés</div>
      <div class="carte-l"><div class="col"><div class="l1">${esc(blesses.length+' combattant'+(blesses.length>1?'s':'')+' indisponible'+(blesses.length>1?'s':''))}</div>`+
      (premiere&&pluslongBlesse?`<div class="l2">Le plus long : ${mgmtArriveeNom(pluslongBlesse.id,pluslongBlesse.name||pluslongBlesse.last||'')}, ${esc(blessesLongNb+' soirée'+(blessesLongNb>1?'s':''))}</div>`:'')+
      `</div><button type="button" class="aller ar-action" onclick="CL.go('mgmt_effectif')">Effectif ›</button></div></div>` :'';

  const htmlCol1=`
    <div class="pan ar-c1"><div class="p2"><div class="p3">
      <div class="pan-tete"><div class="pan-titre"><div class="T">${esc(titreCol1)}</div><div class="trait"></div></div>${anneesHtml}</div>
      ${premiere?chiffresHtml:''}
      ${reputHtml}
      ${rivaleHtml}
      ${premiere && riv?`<div class="bloc"><div class="sous">Une rivalité en cours</div>
         <div class="carte-l"><div class="col"><div class="l1">${mgmtArriveeNom(riv.a,nomRivA)} et ${mgmtArriveeNom(riv.b,nomRivB)}</div><div class="l2">${esc(texteRiv)}</div></div></div></div>`:''}
      ${blessesHtml}
    </div></div></div>`;

  /* Col2 champions. */
  const plusLongHtml=plusLongReigne?`<div class="carte-l"><div class="col"><div class="l1">Le plus long règne : ${mgmtArriveeNom(plusLongReigne.id,plusLongReigne.nom)}</div><div class="l2">${esc(plusLongReigne.div)} · champion depuis ${esc(plusLongReigne.annee)} · ${esc(plusLongReigne.defenses)} défense${plusLongReigne.defenses>1?'s':''}</div></div><button type="button" class="aller ar-action" onclick="CL.go('mgmt_ceintures')">Ceintures ›</button></div>` : '';

  const htmlCol2=`
    <div class="pan ar-c2"><div class="p2"><div class="p3">
      <div class="pan-tete"><div class="pan-titre"><div class="T">SES DOUZE CHAMPIONS</div><div class="trait"></div></div><div class="lab">Aujourd’hui</div></div>
      ${championsHtml}
      ${plusLongHtml}
    </div></div></div>`;

  /* Col3. */
  const promBlock=premiere&&promList.length?`<div class="bloc"><div class="sous">Ses promesses · ${esc(promList.length)}</div>`+
     promList.map(p=>`<div class="carte-l"><div class="col"><div class="l1">${mgmtArriveeNom(p.id,p.nom)} : ${esc(p.demande)}</div><div class="l2">Au plus tard : ${esc(p.echeance)}</div></div><button type="button" class="aller ar-action" onclick="CL.mgmtCarte()">Décider ›</button></div>`).join('')+`</div>`:'';
  const contratsBlock=premiere&&namesFin.length?`<div class="bloc"><div class="sous">Ses contrats qui finissent · ${esc(namesFin.length)}</div>
     <div class="carte-l"><div class="col"><div class="l1">${namesFin.map(f=>mgmtArriveeNom(f.id,f.last||f.name)).join(', ')}</div><div class="l2">Un dernier combat à leur contrat</div></div><button type="button" class="aller ar-action" onclick="CL.go('mgmt_contrats')">Contrats ›</button></div></div>`:'';
  const pasBlock=`<div class="bloc ar-pas"><div class="sous">Tes premiers pas</div>
     <div class="carte-l" style="justify-content:flex-start"><div class="ar-num">1</div><div class="l1">Ouvre la Carte : cinq combats à composer.</div></div>
     <div class="carte-l" style="justify-content:flex-start"><div class="ar-num">2</div><div class="l1">Laisse Leïla proposer, ou choisis toi-même.</div></div>
     <div class="carte-l" style="justify-content:flex-start"><div class="ar-num">3</div><div class="l1">Quand la carte est complète, pose la soirée au Calendrier.</div></div>
    </div>`;

  const jauneDetail = premiere ? ( (prefixTexte?`<div style="font-size:24px;line-height:1.1">${esc(prefixTexte+ (prochainDetail?' '+prochainDetail:''))}</div>`:'') ) :
      `<div style="font-size:24px;line-height:1.1">${esc(prochainDetail||'Il manque 5 combats en carte principale.')}</div>`;

  const htmlCol3=`
    <div class="pan ar-c3"><div class="p2"><div class="p3">
      <div class="pan-tete"><div class="pan-titre"><div class="T">${premiere?'CE QU’IL T’A LAISSÉ':'PAR OÙ COMMENCER'}</div><div class="trait"></div></div></div>
      <div class="jaune-bloc ar-action focus" role="button" tabindex="0" onclick="CL.mgmtArriveeFin()">
        <div class="lab">La prochaine chose à faire</div>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:16px"><div class="T">${esc(prochainTitre)}</div><div class="k" style="font-size:24px">Entrée</div></div>
        ${jauneDetail}
      </div>
      ${premiere?promBlock:''}
      ${premiere?contratsBlock:''}
      ${premiere?'':pasBlock}
    </div></div></div>`;

  const headerLeftHtml=`<div class="ar-bande">
    <div class="ar-bande-g">
      <div class="T">${esc(org.toUpperCase())}</div>
      <div class="col">
        <div class="lab">${esc((ident&&ident.ville?ident.ville+' · ':'')+(ident&&ident.annee?'DEPUIS '+ident.annee:'').toUpperCase())}</div>
        <div class="ar-qui">Tu es le nouveau matchmaker de ${esc(org)}.</div>
        <div class="l1 t2">${esc(datePhraseLower)}, ton premier jour.</div>
      </div>
    </div>
    <div class="ar-tuiles">
      ${headerPred}${headerAdj}${headerPremiere}
    </div>
  </div>`;

  const contenu=`<main class="ar mf-arr">${headerLeftHtml}<div class="ar-cols">${htmlCol1}${htmlCol2}${htmlCol3}</div></main>`;
  return mfEcran(contenu,{barre:'logo',m,plaque:'Management',libelle:'Ton arrivée',droite: (org+' Fight Night'),touches:[{ks:['↑','↓'],t:'Choisir'},{ks:['Tab'],t:'Bloc suivant'},{ks:['Échap'],t:'Aller à l’accueil',onclick:"CL.go('mgmt_accueil')"},{ks:['Entrée'],t:'Ouvrir',jaune:true,onclick:"CL.mgmtArriveeOuvrir()"}]});
}
SCREENS.mgmt_arrivee=scr_mgmt_arrivee;

Object.assign(CL,{
  mgmtArriveeOuvrir,
  mgmtArriveeFin(){ if(!G.mgmt||mgmtSoireesJoueur(G.mgmt)>0) return CL.go('mgmt_accueil'); CL.mgmtCarte(); },
});
keysRegister('mgmt_arrivee',{ ArrowUp(){mgmtArriveeChoisir(-1,false);}, ArrowDown(){mgmtArriveeChoisir(1,false);}, Tab(e){mgmtArriveeChoisir(e&&e.shiftKey?-1:1,true);}, Enter(){mgmtArriveeOuvrir();}, Escape(){CL.go('mgmt_accueil');} });
/* ==== [FIN ANCRE] ==== */
