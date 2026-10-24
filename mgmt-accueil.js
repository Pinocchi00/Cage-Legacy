"use strict";
/* ==== [ANCRE: MONDE_LOT7_ACCUEIL] — Monde lot 7 (docs/BRIEF-09-10-UN-MONDE-QUI-A-VECU.md, « Lot 7 — La section Accueil »),
   décisions d'Anthony du 12/10/2026 : l'Accueil est la première section de la barre et l'écran d'arrivée ; il remplace
   « La semaine » dans la navigation ; plus de défilé à minuterie ni de carte qui glisse — leurs nouvelles passent ici ;
   une demande ou une affaire sans réponse s'y règle. Planches : maquettes/monde/MondeAccueil.dc.html et
   MondeAccueilArrivee.dc.html (sans l'affiche de la soirée en fond).
   T2 : mgmtAccueilContenu(m) est pure — elle LIT la partie (aucun tirage, aucune écriture, aucun DOM) et ne crée aucune
   donnée. T5 : la première arrivée se reconnaît à l'état (mgmtSoireesJoueur(m)===0), rien n'est ajouté à la sauvegarde.
   Aucune minuterie, aucune surimpression : tout est dans l'écran. Les textes fixes viennent des planches validées ;
   toute autre phrase vient des fonctions existantes (marques, agenda, demandes, presse). ==== */

const MGMT_ACCUEIL={cur:-1};
const MGMT_ACCUEIL_JOURS=['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
/** La puce de menu d'un événement : le menu où il se retrouve. */
const MGMT_ACCUEIL_MENUS={vie:'Effectif',demande:'Presse',attente:'Contrats',corps:'Effectif',resultat:'Résultats',titre:'Ceintures'};
const MGMT_ACCUEIL_MAX_PASSE=5;
/* ==== [ANCRE: ACCUEIL_TEXTES_EXPORTABLES] — Monde lot 12 T2 ==== */
const MGMT_ACCUEIL_TEXTES={
  voirTout:{texte:'Voir tout ›',relu:false},
  finir:{texte:'Finir la carte',relu:false},
  dossiers:{texte:'Ouvrir les dossiers',relu:false},
  resumes:{
    leila_propose:{texte:'Leïla propose ',relu:false},
    leila_react:{texte:'Leïla revient sur ',relu:false},
    leila_react_swap:{texte:'Leïla propose un échange pour ',relu:false},
    leila_react_crush:{texte:'Leïla revient sur ',relu:false},
  },
};

/** Le nom d'un combattant (de l'organisation ou extérieur), ou '' s'il est inconnu. Pur. */
function mgmtAccueilNom(m,id){
  if(!id) return '';
  const f=mgmtFighterById(m,id);
  if(f) return f.name;
  /* Monde lot 9 T2c : monde vivant, le nom vient de l'effectif de son organisation. */
  if(m.mondeVivant===true){ const x=mgmtExteriorCombattant(m,id); return x?x.name:''; }
  const line=(m.exterieur||[]).find(e=>e&&e.id===id);
  if(line){ const t=mgmtExteriorTrace(line,m.cycle); return t?t.name:''; }
  return '';
}
/** Un morceau de phrase : {t} du texte, {id,nom} un nom qui ouvre une fiche. */
const mgmtAccueilT=t=>({t});
function mgmtAccueilN(m,id){ const nom=mgmtAccueilNom(m,id); return nom?{id,nom}:null; }

/** La date du jour en toutes lettres : « Lundi 12 janvier 2027 ». Pur. */
function mgmtAccueilDate(m){
  const j=mgmtCalAujourdhui(m), d=mgmtJourDate(j), dt=new Date(d.ts);
  /* ==== [ANCRE: ACCUEIL_DATE_PHRASE] — Monde lot 12 T2 ==== */
  return MGMT_ACCUEIL_JOURS[dt.getUTCDay()]+' '+d.jour+' '+d.mois.toLowerCase()+' '+dt.getUTCFullYear();
}

/** La phrase d'un combat de la trace : « A bat B » (les deux noms ouvrent leur fiche). Pur. */
function mgmtAccueilCombat(m,t){
  const A=mgmtAccueilN(m,t.a.id)||mgmtAccueilT(t.a.name), B=mgmtAccueilN(m,t.b.id)||mgmtAccueilT(t.b.name);
  if(t.winner==='D') return [A,mgmtAccueilT(' fait match nul avec '),B];
  return t.winner==='B'?[B,mgmtAccueilT(' bat '),A]:[A,mgmtAccueilT(' bat '),B];
}

/** Ce que l'Accueil dit de la partie, rendu en données. PURE : même partie, même résultat ; la partie n'est jamais modifiée.
 *  @returns {{premiere:boolean,ou:object,passe:Array,attend:object,ailleurs:Array,heritage:object|null}} */
function mgmtAccueilContenu(m){
  const org=mgmtOrgNom(m), o=mgmtOrgParNom(org), ident=o?mgmtOrgIdentite(o.id):null;
  const infos=mfSoireeInfos(m), carte=mgmtSoireeCarte(m);
  const premiere=mgmtSoireesJoueur(m)===0;
  /* Où suis-je ? */
  const rest=(m.cal&&m.cal.prochaines&&m.cal.prochaines[0])?Math.max(0,m.cal.prochaines[0].jour-(m.cal.jour||0)):null;
  const salle=(infos.lieu&&m.cal&&m.cal.prochaines[0]&&typeof mgmtSalleParId==='function')?mgmtSalleParId(m,m.cal.prochaines[0].salle):null;
  const ou={
    org, ville:ident?ident.ville:'', annee:ident?ident.annee:null, rang:typeof mgmtPosteRang==='function'?mgmtPosteRang(m):null,date:mgmtAccueilDate(m),
    semaine:Number.isSafeInteger(m.cycle)?m.cycle:1,
    soiree:{nom:org+' Fight Night '+((m.eventsPlayed||0)+1),dans:rest===null?'—':(rest===0?'CE SOIR':'DANS '+rest+' J')},
    /* ==== [ANCRE: ACCUEIL_LIEU_REPRISE] — Monde lot 12 T2 ==== */
    lieu:{nom:(salle?salle.nom:(infos.lieu||'—')).toUpperCase(),sous:[salle&&salle.ville?salle.ville:'',(infos.date||'').toLowerCase()].filter(Boolean).join(', ')},
     carte:{valeur:carte.main+' / '+carte.sm,sous:carte.sm-carte.main>0?(carte.sm-carte.main===1?'Une place à finir':(carte.sm-carte.main)+' places à finir'):'Carte complète'},
      /* L'audience projetée de la carte est la seule estimation déjà définie
         par le modèle financier ; on la borne à la capacité de la salle. */
      preventes:{vendus:null,capacite:salle&&Number.isFinite(salle.capacite)?salle.capacite:null},
  };
  /* Que s'est-il passé ? Les marques allumées du lot 8, une phrase chacune. */
  const passe=[];
  for(const id of mgmtMarquesAllumees(m)){
    const ev=mgmtDepuisVisite(m,id)[0]; if(!ev) continue;
    const nom=mgmtAccueilN(m,id); if(!nom) continue;
    let parts=[nom,mgmtAccueilT(' · '+ev.phrase)];
    if(ev.sorte==='resultat'||ev.sorte==='titre'){
      const c=mgmtEvenementsDepuis(m,id).filter(e=>e.type==='combat').sort((p,q)=>q.i-p.i)[0];
      if(c) parts=mgmtAccueilCombat(m,c.trace);
    }
    passe.push({id,parts,detail:ev.detail,menu:MGMT_ACCUEIL_MENUS[ev.sorte]||''});
  }
  /* Qu'est-ce qui m'attend ? La première ligne des blocages, puis les demandes et les affaires ouvertes. */
  let prochaine=null;
  const b=mgmtAgendaBlocages(m)[0];
  /* ==== [ANCRE: ACCUEIL_ACTION_UNIQUE] — Monde lot 12 T2 ==== */
  const libre=m.card.main.findIndex(x=>!x);
  if(b) prochaine=b.k==='main'
    ?{titre:MGMT_ACCUEIL_TEXTES.finir.texte,relu:false,detail:b.texte,bouton:MGMT_ACCUEIL_TEXTES.dossiers.texte,onclick:`CL.mgmtCarteDossiersOuvrir(${libre<0?m.card.main.length:libre})`}
    :{titre:b.texte,detail:'',bouton:b.label,onclick:b.onclick};
  else if(mgmtAgendaActif(m)&&!mgmtDemoTerminee(m)) prochaine={titre:'La soirée est prête',detail:MGMT_PRISE_TEXTES.prete.texte,bouton:'Ouvrir le calendrier',onclick:"CL.go('mgmt_calendrier')"};
  else{ const s=mgmtContinuerRaison(m); prochaine={titre:s.libelle,detail:'',bouton:'Ouvrir',relu:false,onclick:'CL.mgmtContinuer()'}; }
  const ouvertes=[];
  for(const d of mgmtDemandesOuvertes(m)){
    const def=MGMT_DEMANDES[d.want], n=mgmtAccueilN(m,d.a), cible=d.target?mgmtAccueilN(m,d.target):null;
    if(!def||!n) continue;
    const phrase=mgmtDemandeTexte(d.want);
    const sep=d.want==='un-classe'?': ':['revanche','trilogie'].includes(d.want)?' contre ':'';
    ouvertes.push({kind:'demande',i:d.i,id:d.a,parts:[n,mgmtAccueilT(' '+phrase)].concat(cible&&sep?[mgmtAccueilT(sep),cible]:[])});
  }
  /* ==== [ANCRE: ACCUEIL_RESUMES_REPRISE] — Monde lot 12 T2 ==== */
  const resumes=MGMT_ACCUEIL_TEXTES.resumes;
  for(const a of m.pile.filter(x=>x.status==='open'&&(x.kind==='leila_bulk'||resumes[x.kind]))){
    if(a.kind==='leila_bulk'){ ouvertes.push({kind:'affaire',id:a.id,bulk:true,relu:false,parts:[mgmtAccueilT('Carte proposée — '+(Array.isArray(a.fights)?a.fights.length:0)+' combats')],sous:mgmtBulkSubject(m,a)}); continue; }
    const A=mgmtAccueilN(m,a.a), B=mgmtAccueilN(m,a.b);
    ouvertes.push({kind:'affaire',id:a.id,bulk:false,relu:false,parts:(A&&B)?[mgmtAccueilT(resumes[a.kind].texte),A,mgmtAccueilT(' contre '),B]:[mgmtAccueilT('Affaire')],sous:(A&&B)?mgmtAffairSubject(m,a):''});
  }
  /* Et ailleurs ? Le classement mondial d'une catégorie qui tourne avec les semaines, puis la presse. */
  const ailleurs=[];
  for(const f of (m.croissanceActus||[]).slice(-5)) if(f&&typeof f.texte==='string') ailleurs.push({parts:[mgmtAccueilT(f.texte)],detail:'Palier de croissance · presse'});
  const divs=allDivisions();
  if(divs.length){
    const div=divs[(m.cycle||0)%divs.length];
    /* ==== [ANCRE: MONDE_LOT9_T2C_ACCUEIL] — Monde lot 9 T2c : monde vivant, le premier mondial d'une organisation vivante. ==== */
    if(m.mondeVivant===true){
      const x=(mgmtDivisionRanking(m,div.id,'world')||[]).map(r=>mgmtExteriorCombattant(m,r.id)).find(Boolean);
      if(x) ailleurs.push({parts:[{id:x.id,nom:x.name},mgmtAccueilT(' mène le classement mondial en '+mgmtDivisionLabel(div.id))],detail:(MGMT_ORGANISATIONS.find(o=>o.id===x.orgId)||{}).nom||''});
    }else{
    const tete=(mgmtDivisionRanking(m,div.id,'world')||[]).find(r=>(m.exterieur||[]).some(e=>e.id===r.id));
    const line=tete&&m.exterieur.find(e=>e.id===tete.id), trace=line&&mgmtExteriorTrace(line,m.cycle);
    if(trace) ailleurs.push({parts:[{id:line.id,nom:trace.name},mgmtAccueilT(' mène le classement mondial en '+mgmtDivisionLabel(div.id))],detail:trace.orgs.length?trace.orgs[trace.orgs.length-1].name:''});
    }
  }
  if(typeof mgmtMediasLignes==='function'){
    for(const p of mgmtMediasLignes(m)){
      if(ailleurs.length>=2) break;
      ailleurs.push({parts:[mgmtAccueilT(p.nom+' : '+p.texte)],detail:''});
    }
  }
  /* ==== [ANCRE: MONDE54_T1_APRES_ACCUEIL] — Monde lot 54 T1 ==== */
  if(typeof mgmtLendemainApres==='function'&&Number.isSafeInteger(m.eventsPlayed)&&m.eventsPlayed>0){
    const suite=mgmtLendemainApres(m,m.cycle);
    for(const ligne of suite) passe.push({parts:[mgmtAccueilT(ligne.texte)],detail:ligne.famille.toUpperCase(),menu:'APRÈS'});
  }
  /* La première fois : l'héritage de l'organisation. */
  let heritage=null;
  if(premiere){
    const riv=ident&&ident.rivale?mgmtOrgParId(ident.rivale):null;
    const maxC=(m.hist||[]).reduce((x,t)=>(t&&t.slot==='main'&&Number.isSafeInteger(t.c)&&t.c>x?t.c:x),-1);
    const derniere=(m.hist||[]).filter(t=>t&&t.slot==='main'&&t.c===maxC&&t.a&&t.b).slice(-3).map(t=>({parts:mgmtAccueilCombat(m,t),detail:''}));
    const champions=divs.map(d=>{ const t=mgmtSplitTitle(m,d.id); return {div:mgmtDivisionLabel(d.id),id:t.id,nom:t.id?mgmtAccueilNom(m,t.id):'',since:t.since,defenses:t.defenses}; });
    const promesses=[], vus=new Set();
    for(const x of m.facts||[]){
      if(!x||x.k!=='promesse'||vus.has(x.a)) continue;
      vus.add(x.a);
      const f=mgmtFighterById(m,x.a); if(!f||mgmtIsRetired(f)) continue;
      for(const p of mgmtPromesses(m,f)){
        if(p.etat!=='en cours'||!MGMT_DEMANDES[p.want]) continue;
        promesses.push({id:f.id,parts:[{id:f.id,nom:f.name},mgmtAccueilT(' : '+MGMT_DEMANDES[p.want].libelle.toLowerCase())],detail:'Promise · échéance : cycle '+p.due});
      }
    }
    heritage={
      reputation:ident?ident.reputation:'', blessure:ident?ident.blessure:'', rivale:riv?riv.nom:'',
      predecesseur:ident&&ident.predecesseur?{nom:(ident.predecesseur.prenom+' '+ident.predecesseur.nom).trim()}:null,
      adjointe:ident&&ident.adjointe?{nom:ident.adjointe.prenom}:null,
      derniere, derniereNom:maxC>=0?mgmtSoireeNomDate(m,maxC):'', champions, promesses:promesses.slice(0,3),
    };
  }
  return {premiere,ou,passe,attend:{prochaine,ouvertes},ailleurs,heritage};
}

/* ---- Le rendu ------------------------------------------------------------- */

function mgmtAccueilParts(m,parts){
  /* ==== [ANCRE: MGMT_PRESENTATION_ACCUEIL_NOMS] — Monde lot 3 T5 ==== */
  return parts.map(p=>p.id
    ?`<button type="button" class="mf-ac-nom" onclick="CL.mgmtAccueilNom('${esc(p.id)}')">${esc(p.nom)}</button>${mfMarqueNom(m,p.id)}`
    :esc(p.t)).join('');
}
function mgmtAccueilTitre(texte,droite=''){
  return `<div class="mf-ac-hd"><div><div class="mf-ac-h">${esc(texte)}</div><div class="mf-ac-trait"></div></div>${droite?`<div class="mf-ac-hs">${esc(droite)}</div>`:''}</div>`;
}
function mgmtAccueilTuile(lib,val,sous){
  return `<div class="mf-ac-tuile"><div class="mf-ac-tl">${esc(lib)}</div><div class="mf-ac-tv" style="font-size:${mfCorps(val,182,40)}px">${esc(mfNet(val))}</div><div class="mf-ac-ts">${esc(sous||'')}</div></div>`;
}
function mgmtAccueilBandeau(c,m){
  /* ==== [ANCRE: ACCUEIL_BANDEAU_SOIREE] — Monde lot 12 T2 ==== */
  const pres=c.ou.preventes;
  let vendus=pres.vendus;
  if(vendus===null&&pres.capacite!==null&&typeof mgmtCardAttraction==='function'&&typeof mgmtEventRecette==='function'){
    const combats=[...(m.card&&m.card.main||[]).map(f=>({...f,slot:'main'})),...(m.card&&m.card.prelims||[]).map(f=>({...f,slot:'prelim'}))];
    const attraction=mgmtCardAttraction(m,combats),audience=mgmtEventRecette(attraction,0,0,combats.length,0).audience;
    vendus=Math.min(pres.capacite,Math.max(0,audience));
  }
  const ventes=pres.capacite===null?'—':`${vendus===null?'—':mfNet(vendus)} sur ${mfNet(pres.capacite)} places`;
  const tuiles=mgmtAccueilTuile('Prochaine soirée',c.ou.soiree.dans,c.ou.soiree.nom)+mgmtAccueilTuile('Le lieu',c.ou.lieu.nom,c.ou.lieu.sous)+mgmtAccueilTuile('La carte',c.ou.carte.valeur,c.ou.carte.sous)+mgmtAccueilTuile('LES PRÉVENTES',ventes,'');
  return `<div class="mf-ac-band"><div class="mf-ac-id"><div class="mf-ac-org" style="font-size:${mfCorps(c.ou.org,520,120,60)}px">${esc(mfNet(c.ou.org))}</div>`
    +`<div class="mf-ac-idt"><div class="mf-ac-l">${esc((c.ou.ville?c.ou.ville+' · ':'')+(c.ou.annee?'DEPUIS '+c.ou.annee:'')+(Number.isSafeInteger(c.ou.rang)?' · '+c.ou.rang+'e DES HUIT':'')).toUpperCase()}</div><div class="mf-ac-d">${esc(c.ou.date)}</div></div></div>`
    +`<div class="mf-ac-tuiles">${tuiles}</div></div>`;
}
function mgmtAccueilAttend(m,c,extra=''){
  const p=c.attend.prochaine;
  const retrait=typeof mgmtRetraitHtml==='function'?mgmtRetraitHtml(m):'';
  /* ==== [ANCRE: ACCUEIL_JAUNE_REPRISE] — Monde lot 12 T2 ==== */
  const boite=`<div class="mf-ac-jaune"><div class="mf-ac-jl">LA PROCHAINE CHOSE À FAIRE</div><div class="mf-ac-jt">${esc(p.titre.charAt(0).toUpperCase()+p.titre.slice(1))}</div>`
    +`<div class="mf-ac-jp"><div class="mf-ac-jd">${esc(p.detail)}</div><button type="button" class="mf-ac-jb" onclick="${p.onclick}">${mfTouche('Entrée')}<span>${esc(mfNet(p.bouton))}</span></button></div></div>`;
  let rows='';
  const liste=c.attend.ouvertes;
  for(const r of liste.slice(0,4)){
    /* ==== [ANCRE: ACCUEIL_AFFAIRES_LIGNES] — Monde lot 12 T2 ==== */
    const texte=`<div class="mf-ac-rt"><div class="mf-ac-rp">${mgmtAccueilParts(m,r.parts)}</div>${r.sous?`<div class="mf-ac-rs">${esc(r.sous)}</div>`:''}</div>`;
    const actions=r.kind==='demande'
      ?`<button type="button" class="mf-ac-lien mf-ac-demande" onclick="CL.mgmtFiche('${esc(r.id)}');CL.mgmtFicheOnglet('ondit')">Répondre ›</button>`
      :`<button type="button" class="mf-ac-act" onclick="CL.mgmtOpen('${esc(r.id)}');CL.go('mgmt_bureau')">Décider ›</button>`;
    rows+=`<div class="mf-ac-ligne">${texte}${actions}</div>`;
  }
  /* ==== [ANCRE: ACCUEIL_VOIR_TOUT_REPRISE] — Monde lot 12 T2 ==== */
  for(const kind of ['demande','affaire']){
    if(liste.slice(4).some(r=>r.kind===kind)) rows+=`<button type="button" class="mf-ac-lien" data-famille="${kind}" onclick="CL.go('${kind==='demande'?'mgmt_effectif':'mgmt_bureau'}')">${esc(MGMT_ACCUEIL_TEXTES.voirTout.texte)}</button>`;
  }
  return mfPanneau(mgmtAccueilTitre('CE QUI T’ATTEND')+boite
    +(retrait?`<div class="mf-ac-retrait">${retrait}</div>`:'')
    +(liste.length?`<div class="mf-ac-lib">DEMANDES ET AFFAIRES OUVERTES</div>`:'')+rows+extra,'normal','mf-ac-p mf-ac-c5 mf-ac-haut');
}
function mgmtAccueilPasse(m,c){
  /* ==== [ANCRE: ACCUEIL_PASSE_R4] — Monde lot 12 T2 ==== */
  const actu=typeof mgmtActualites==='function'?mgmtActualites(m):[];
  const actus=[...actu.filter(x=>!x.lu).sort((a,b)=>b.c-a.c),...actu.filter(x=>x.lu).sort((a,b)=>b.c-a.c)];
  if(!c.passe.length&&!actus.length) return '';
  const actuRows=actus.slice(0,MGMT_ACCUEIL_MAX_PASSE),anciens=c.passe.slice(0,Math.max(0,MGMT_ACCUEIL_MAX_PASSE-actuRows.length));
  const rows=anciens.map((r,i)=>`<div class="mf-ac-ev${i===MGMT_ACCUEIL.cur?' sel':''}"><i class="mf-oct mf-ac-oct"></i>`
    +`<div class="mf-ac-evt"><div class="mf-ac-evp">${mgmtAccueilParts(m,r.parts)}</div><div class="mf-ac-rs">${esc(r.detail)}</div></div>`
    +(r.menu?`<span class="mf-ac-menu">${esc(r.menu.toUpperCase())}</span>`:'')+`</div>`).join('')+actuRows.map(x=>`<button type="button" class="mf-ac-ev" onclick="CL.mgmtAccueilActu('${escJsAttr(x.cle)}')"><i class="mf-oct mf-ac-oct"></i><div class="mf-ac-evt"><div class="mf-ac-evp"><b>${esc(x.nom)}</b> · ${esc(x.titre)}</div><div class="mf-ac-rs">${esc(x.texte)}</div></div><span class="mf-ac-menu">ACTUALITÉS</span></button>`).join('');
  const touches=c.passe.length?`<div class="mf-ac-aide">${mfTouche('↑')}${mfTouche('↓')}<span>Choisir · </span>${mfTouche('Entrée')}<span>Ouvrir la fiche</span></div>`:'';
  /* ==== [ANCRE: ACCUEIL_PASSE_SUITE_REPRISE] — Monde lot 12 T2 ==== */
  const suite=c.passe.length>MGMT_ACCUEIL_MAX_PASSE?`<button type="button" class="mf-ac-lien" data-famille="passe" onclick="CL.go('mgmt_effectif')">${esc(MGMT_ACCUEIL_TEXTES.voirTout.texte)}</button>`:'';
  return mfPanneau(mgmtAccueilTitre('CE QUI S’EST PASSÉ','Cette semaine')+(mgmtActuNonLues(m)?`<span class="mf-ac-rs">${mgmtActuNonLues(m)} non lues</span>`:'')+rows+suite+touches,'normal','mf-ac-p mf-ac-c5');
}
function mgmtAccueilAilleurs(m,c){
  /* ==== [ANCRE: ACCUEIL_AILLEURS_R4] — Monde lot 12 T2 ==== */
  if(!c.ailleurs.length) return '';
  const rows=c.ailleurs.map(r=>`<div class="mf-ac-al"><div class="mf-ac-ap">${mgmtAccueilParts(m,r.parts)}</div>${r.detail?`<div class="mf-ac-rs">${esc(r.detail)}</div>`:''}</div>`).join('');
  return mfPanneau(mgmtAccueilTitre('ET AILLEURS')+(rows||`<div class="mf-ac-rs">Rien à signaler hors de ${esc(c.ou.org)}.</div>`),'normal','mf-ac-p mf-ac-c3');
}
/* ==== [ANCRE: MONDE64_T1_ACCUEIL_SAISON] — Monde lot 64 T1 ==== */
function mgmtAccueilSaison(m,c){
  const poste=m.poste;
  const objectifs=poste&&Array.isArray(poste.obj)?poste.obj.slice(0,3).map(o=>{
    const valeur=mgmtPosteValeur(m,o),fait=o.e==='tenu'||o.e==='fait';
    const ratio=o.t==='rang-orgs'?Math.max(0,Math.min(1,(9-valeur)/Math.max(1,9-o.cible))):o.t==='caisse'? (valeur>=o.cible?1:0):o.t==='popularite'?Math.max(0,Math.min(1,valeur/Math.max(1,o.cible))):(fait?1:Math.max(0,Math.min(1,valeur/Math.max(1,o.cible))));
    const statut=o.t==='rang-orgs'?`${valeur}e → ${o.cible}e`:fait?'FAIT':'EN COURS';
    return `<div class="mf-ac-objectif"><div><span>${esc(mgmtPosteObjectifTexte(o))}</span><b>${esc(statut)}</b></div><div class="mf-ac-barre"><i style="width:${Math.round(ratio*100)}%"></i></div></div>`;
  }).join(''):'';
  const patron=poste?`<div class="mf-ac-patron"><div class="mf-ac-lib">LE PATRON : ${esc(mgmtPosteNiveau(poste.conf).niveau.toUpperCase())}</div><div class="mf-ac-rs">${esc(mgmtPosteNiveau(poste.conf).banque[0].texte)}</div></div>`:'';
  const retour=m.recruteur&&m.recruteur.retours&&m.recruteur.retours[0], mission=m.recruteur&&m.recruteur.mission;
  const dest=retour?mgmtRecruteurDestination(retour.dest):mission?mgmtRecruteurDestination(mission.dest):null;
  const jourRetour=retour?retour.jour:mission&&mission.retourLe;
  const restant=Number.isSafeInteger(jourRetour)?Math.max(0,jourRetour-mgmtRecruteurJour(m)):null;
   const statutRecruteur=dest?`${esc(dest.nom)}${restant!==null?` · retour <b>DANS ${restant} J</b>`:''}`:'Aucune mission';
   const recruteur=`<div class="mf-ac-recruteur"><div class="mf-ac-lib">TON RECRUTEUR</div><div>${statutRecruteur}</div></div>`;
  const ailleurs=mgmtAccueilAilleurs(m,c);
  return mfPanneau(mgmtAccueilTitre('TA SAISON')+objectifs+patron+recruteur+(ailleurs?`<div class="mf-ac-ailleurs-saison">${ailleurs}</div>`:''),'normal','mf-ac-p mf-ac-saison');
}
/** La première arrivée : l'héritage (organisation, dernière soirée, champions, promesses). */
function mgmtAccueilHeritage(m,c){
  const h=c.heritage;
  const bloc=(l,t)=>t?`<div class="mf-ac-bloc"><div class="mf-ac-l">${esc(l)}</div><div class="mf-ac-t">${esc(t)}</div></div>`:'';
  const org=mfPanneau(mgmtAccueilTitre('L’ORGANISATION')+bloc('CE QU’ON EN DIT',h.reputation)+bloc('SA BLESSURE',h.blessure)+bloc('SA RIVALE',h.rivale),'normal','mf-ac-p mf-ac-fixe');
  const der=mfPanneau(mgmtAccueilTitre('SA DERNIÈRE SOIRÉE',h.derniereNom)
    +(h.derniere.map(r=>`<div class="mf-ac-ev"><div class="mf-ac-evt"><div class="mf-ac-evp">${mgmtAccueilParts(m,r.parts)}</div></div></div>`).join('')||`<div class="mf-ac-rs">Aucune soirée n’a encore été jouée.</div>`),'normal','mf-ac-p mf-ac-souple');
  const champs=mfPanneau(mgmtAccueilTitre('SES CHAMPIONS',h.champions.filter(x=>x.id).length+' ceintures')
    +h.champions.map(x=>`<div class="mf-ac-ev"><div class="mf-ac-evt"><div class="mf-ac-evp">${x.id?mgmtAccueilParts(m,[{id:x.id,nom:x.nom}]):'Vacant'}</div><div class="mf-ac-rs">${esc(x.div)}${x.id&&x.since!==null&&x.since!==undefined?' · depuis la soirée '+esc(x.since)+(x.defenses?' · '+esc(x.defenses)+' défense'+(x.defenses>1?'s':''):''):''}</div></div></div>`).join(''),'normal','mf-ac-p mf-ac-c4');
  const prom=h.promesses.length?`<div class="mf-ac-lib">SES PROMESSES</div>`+h.promesses.map(r=>`<div class="mf-ac-ligne"><div class="mf-ac-rt"><div class="mf-ac-rp">${mgmtAccueilParts(m,r.parts)}</div><div class="mf-ac-rs">${esc(r.detail)}</div></div></div>`).join(''):'';
  return `<div class="mf-ac-colonne mf-ac-c4">${org}${der}</div>${champs}`+mgmtAccueilAttend(m,c,prom);
}

function scr_mgmt_accueil(){
  if(!G||!G.mgmt) return scr_mgmt_bureau();
  const m=G.mgmt;
  const annonces=typeof mgmtPaliersAnnoncer==='function'?mgmtPaliersAnnoncer(m):[];
  if(annonces.length&&typeof saveMgmt==='function') saveMgmt();
  const c=mgmtAccueilContenu(m);
  if(typeof mgmtRecruteurRetour==='function') mgmtRecruteurRetour(m);
  if(MGMT_ACCUEIL.cur>=Math.min(MGMT_ACCUEIL_MAX_PASSE,c.passe.length)) MGMT_ACCUEIL.cur=Math.min(MGMT_ACCUEIL_MAX_PASSE,c.passe.length)-1;
  /* ==== [ANCRE: ACCUEIL_TROIS_COLONNES] — Monde lot 12 T2 ==== */
  /* ==== [ANCRE: P4_T23B_ACCUEIL_ESPOIRS] — Monde lot 38 T2 ==== */
  const espoirs=mgmtEspoirs(m), espoirHtml=espoirs.length?mfPanneau(`<h2 class="mf-ac-titre">TES ESPOIRS</h2>`+espoirs.map(id=>{
    const f=mgmtFighterById(m,id)||mgmtExteriorCombattant(m,id);if(!f)return '';
    const rang=(mgmtDivisionRanking(m,f.div,'organization')||[]).findIndex(x=>x.id===id)+1;
    const etat=!mgmtAvailable(m,f)?'blessé au camp':(f.ct?'sous contrat':'libre');
    const combats=(m.hist||[]).filter(t=>t&&t.a&&t.b&&(t.a.id===id||t.b.id===id));
    const dernier=combats.length?`dernier combat · soirée ${combats[combats.length-1].c}`:'à booker';
    return `<button type="button" class="mf-ac-espoir" onclick="CL.mgmtFiche('${escJsAttr(id)}')"><b>${esc(f.name)}</b><span>N°${esc(rang||'—')} des ${esc(mgmtDivisionLabel(f.div).toLocaleLowerCase('fr'))} · ${esc(etat)}</span><span>${esc(dernier)}</span></button>`;
  }).join('')+`<button type="button" onclick="mgmtEspArriveeOuvrir(2,'mgmt_accueil')">Tes espoirs</button>`,'normal','mf-ac-p mf-ac-espoirs'):'';
  const retourRecruteur=m.recruteur&&m.recruteur.retours&&m.recruteur.retours[0];
  const karim=retourRecruteur?mfPanneau(`<p class="mf-ac-rs">Karim est rentré${retourRecruteur.bredouille?' bredouille':''} · <button type="button" onclick="CL.go('mgmt_recruteur_retours')">Voir ses retours</button></p>`,'normal','mf-ac-p'):'';
   const posteLien=m.poste?`<button type="button" class="po2-lien" onclick="CL.go('mgmt_poste')">Ton poste</button>`:'';
   const bilanVisible=m.poste&&mgmtCalAujourdhui(m)>=m.poste.fin&&!mgmtPosteBilanLu;
   const ceremonieVisible=Number.isSafeInteger(m.guerre&&m.guerre.anneeTraitee)&&m.guerre.anneeTraitee>0;
     const semaine=m.semaine&&Array.isArray(m.semaine.ev)&&m.semaine.ev.length?`<div class="mf-ac-semaine"><b>LA SEMAINE DU COMBAT</b><button type="button" onclick="CL.go('mgmt_semaine')">Ouvrir la semaine du combat</button></div>` : '';
    /* ==== [ANCRE: P10_T4_RANG_FINAL_ACCUEIL] — Monde lot 57 T1 ==== */
    const guerre=m.guerre&&Number.isInteger(m.guerre.rangFinal)?mfPanneau(`<h2 class="mf-ac-titre">LE CLASSEMENT DES HUIT</h2><p>À la fin de l’année, Split a terminé ${esc(m.guerre.rangFinal)}e sur huit.</p><button type="button" onclick="CL.go('mgmt_guerre')">Revoir le classement</button>`,'normal','mf-ac-p'):'';
    const bilanLien=`${ceremonieVisible?`<button type="button" class="po2-lien" onclick="CL.go('mgmt_ceremonie')">La cérémonie de l’année</button>`:''}${bilanVisible?`<button type="button" class="po2-lien" onclick="mgmtPosteBilanLu=true;CL.go('mgmt_poste_bilan')">Le bilan du patron</button>`:''}`;
  const espoirsDansAttente=espoirHtml;
   const corps=`${karim}<div class="mf-ac-cols">${mgmtAccueilPasse(m,c)}${mgmtAccueilAttend(m,c,semaine+espoirsDansAttente)}${mgmtAccueilSaison(m,c)}</div>${guerre}${posteLien}${bilanLien}`;
  const contenu=`<main class="mf-contenu mf-ac">${mgmtAccueilBandeau(c,m)}${corps}</main>`;
  const droite=`${c.ou.org} Fight Night ${(m.eventsPlayed||0)+1}`;
  return mfEcran(contenu,{barre:'jeu',courant:'accueil',grise:false,m,plaque:'Accueil',libelle:'Semaine '+c.ou.semaine,droite,
    touches:[{ks:['A','E'],t:'Section'},{ks:['↑','↓'],t:'Choisir'},{ks:['Tab'],t:'Bloc suivant'},{ks:['Entrée'],t:'Ouvrir',jaune:true}]});
}
SCREENS.mgmt_accueil=scr_mgmt_accueil;

Object.assign(CL,{
  mgmtAccueilActu(cle){const row=mgmtActualites(G.mgmt).find(x=>x.cle===cle);if(!row)return;MGMT_ACTUALITES_UI.cle=cle;MGMT_ACTUALITES_UI.id=null;mgmtActuLire(G.mgmt,cle);saveMgmt();CL.go('mgmt_actualites');},
  /* ==== [ANCRE: MGMT_PRESENTATION_ACCUEIL_GESTE] — Monde lot 3 T5 ==== */
  mgmtAccueilNom(id){if(!CL.mgmtPresentationOuvrir('combattant',[id])) CL.mgmtFiche(id);},
  /** Le curseur des événements de la semaine. */
  mgmtAccueilDeplacer(dir){
    if(!G||!G.mgmt) return;
    const n=Math.min(MGMT_ACCUEIL_MAX_PASSE,mgmtAccueilContenu(G.mgmt).passe.length);
    if(!n) return;
    MGMT_ACCUEIL.cur=(MGMT_ACCUEIL.cur+dir+n)%n;
    render();
  },
  /** Entrée : la fiche de l'événement choisi, sinon la prochaine chose à faire. */
  mgmtAccueilOuvrir(){
    if(!G||!G.mgmt) return;
    const r=mgmtAccueilContenu(G.mgmt).passe[MGMT_ACCUEIL.cur];
    /* ==== [ANCRE: MGMT_PRESENTATION_ACCUEIL_EVENEMENT] — Monde lot 3 T5 ==== */
    if(r){ CL.mgmtAccueilNom(r.id); return; }
    const b=typeof document!=='undefined'?document.querySelector('.mf-ac-jb'):null;
    if(b) b.click();
  },
  mgmtAccueil(){ CL.go('mgmt_accueil'); },
});
keysRegister('mgmt_accueil',{
  ArrowUp(){ CL.mgmtAccueilDeplacer(-1); },
  ArrowDown(){ CL.mgmtAccueilDeplacer(1); },
  Enter(){ CL.mgmtAccueilOuvrir(); },
  Escape(){ CL.mgmtMenuPrincipal(); },
});
/* ==== [FIN ANCRE] ==== */
