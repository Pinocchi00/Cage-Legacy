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
const MGMT_ACCUEIL_MAX_ATTEND=3;

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
  return MGMT_ACCUEIL_JOURS[dt.getUTCDay()]+' '+d.jour+' '+d.mois+' '+dt.getUTCFullYear();
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
    org, ville:ident?ident.ville:'', annee:ident?ident.annee:null, date:mgmtAccueilDate(m),
    semaine:Number.isSafeInteger(m.cycle)?m.cycle:1,
    soiree:{nom:org+' Fight Night '+((m.eventsPlayed||0)+1),dans:rest===null?'—':(rest===0?'CE SOIR':'DANS '+rest+' J')},
    lieu:{nom:salle?salle.nom:(infos.lieu||'—'),sous:[salle&&salle.ville?salle.ville:'',infos.date].filter(Boolean).join(', ')},
    carte:{valeur:carte.main+' / '+carte.sm,sous:carte.sm-carte.main>0?(carte.sm-carte.main===1?'Une place à finir':(carte.sm-carte.main)+' places à finir'):'Carte complète'},
  };
  /* Que s'est-il passé ? Les marques allumées du lot 8, une phrase chacune. */
  const passe=[];
  for(const id of mgmtMarquesAllumees(m)){
    if(passe.length>=MGMT_ACCUEIL_MAX_PASSE) break;
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
  if(b) prochaine={titre:b.label,detail:b.texte,bouton:b.label,onclick:b.onclick};
  else if(mgmtAgendaActif(m)&&!mgmtDemoTerminee(m)) prochaine={titre:'La soirée est prête',detail:MGMT_PRISE_TEXTES.prete.texte,bouton:'Ouvrir le calendrier',onclick:"CL.go('mgmt_calendrier')"};
  else{ const s=mgmtContinuerRaison(m); prochaine={titre:s.libelle,detail:'',bouton:s.libelle,onclick:'CL.mgmtContinuer()'}; }
  const ouvertes=[];
  for(const d of mgmtDemandesOuvertes(m)){
    const def=MGMT_DEMANDES[d.want], n=mgmtAccueilN(m,d.a), cible=d.target?mgmtAccueilN(m,d.target):null;
    if(!def||!n) continue;
    ouvertes.push({kind:'demande',i:d.i,id:d.a,parts:[n,mgmtAccueilT(' demande : '+def.libelle.toLowerCase())].concat(cible?[mgmtAccueilT(' — '),cible]:[])});
  }
  for(const a of m.pile.filter(x=>x.status==='open')){
    if(a.kind==='leila_bulk'){ ouvertes.push({kind:'affaire',id:a.id,bulk:true,parts:[mgmtAccueilT('Carte proposée — '+(Array.isArray(a.fights)?a.fights.length:0)+' combats')],sous:mgmtBulkSubject(m,a)}); continue; }
    const A=mgmtAccueilN(m,a.a), B=mgmtAccueilN(m,a.b);
    ouvertes.push({kind:'affaire',id:a.id,bulk:false,parts:(A&&B)?[A,mgmtAccueilT(' contre '),B]:[mgmtAccueilT('Affaire')],sous:(A&&B)?mgmtAffairSubject(m,a):''});
  }
  /* Et ailleurs ? Le classement mondial d'une catégorie qui tourne avec les semaines, puis la presse. */
  const ailleurs=[];
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
  const h=c.heritage;
  const tuiles=c.premiere&&h&&(h.predecesseur||h.adjointe)
    ?(h.predecesseur?mgmtAccueilTuile('Ton prédécesseur',h.predecesseur.nom,''):'')+(h.adjointe?mgmtAccueilTuile('Ton adjointe',h.adjointe.nom,''):'')
      +mgmtAccueilTuile('Ta première soirée',c.ou.soiree.dans,c.ou.soiree.nom)
    :mgmtAccueilTuile('Prochaine soirée',c.ou.soiree.dans,c.ou.soiree.nom)+mgmtAccueilTuile('Le lieu',c.ou.lieu.nom,c.ou.lieu.sous)+mgmtAccueilTuile('La carte',c.ou.carte.valeur,c.ou.carte.sous);
  return `<div class="mf-ac-band"><div class="mf-ac-id"><div class="mf-ac-org" style="font-size:${mfCorps(c.ou.org,520,120,60)}px">${esc(mfNet(c.ou.org))}</div>`
    +`<div class="mf-ac-idt"><div class="mf-ac-l">${esc((c.ou.ville?c.ou.ville+' · ':'')+(c.ou.annee?'DEPUIS '+c.ou.annee:'')).toUpperCase()}</div><div class="mf-ac-d">${esc(c.ou.date)}</div></div></div>`
    +`<div class="mf-ac-tuiles">${tuiles}</div></div>`;
}
/** Une affaire dépliée : qui parle, ce qu'il dit, les réponses (clic ou 1 à 3). */
function mgmtAccueilEchange(m,a){
  const ex=MGMT_EXCHANGES[a.exchange], spk=MGMT_SPEAKERS[a.speaker]||{name:'?',role:''};
  const lines=(ex?ex.lines:[]).filter(t=>typeof t==='string').map(t=>`<div class="mf-ac-dit">${esc(t)}</div>`).join('');
  const combats=a.kind==='leila_bulk'&&Array.isArray(a.fights)?a.fights.map((f,i)=>{
    const fa=mgmtFighterById(m,f.a), fb=mgmtFighterById(m,f.b); if(!fa||!fb) return '';
    return `<div class="mf-ac-fc${a.marked===i?' sel':''}"><span>${mgmtAccueilParts(m,[{id:fa.id,nom:fa.name},{t:' contre '},{id:fb.id,nom:fb.name}])}</span>`
      +`<button type="button" class="mf-ac-lien" onclick="CL.mgmtMark('${esc(a.id)}',${i})">${a.marked===i?'Reposer':'Échanger'}</button></div>`;
  }).join(''):'';
  const reps=mgmtVisibleReplies(m,a).map((r,i)=>{
    const lib=r.text||MGMT_ACTION_LABELS[r.action];
    const go=r.action==='__ignore'?`CL.mgmtIgnore('${esc(a.id)}')`:`CL.mgmtReply('${esc(a.id)}','${esc(r.id)}')`;
    return mfBouton(lib,{touche:String(i+1),jaune:i===0,onclick:go});
  }).join('');
  return `<div class="mf-ac-ech"><div class="mf-ac-l">${esc((spk.name+(spk.role?' · '+spk.role:'')).toUpperCase())}</div>${lines}${combats}<div class="mf-ac-reps">${reps}</div></div>`;
}
function mgmtAccueilAttend(m,c,extra=''){
  const p=c.attend.prochaine;
  const retrait=typeof mgmtRetraitHtml==='function'?mgmtRetraitHtml(m):'';
  const boite=`<div class="mf-ac-jaune"><div class="mf-ac-jl">LA PROCHAINE CHOSE À FAIRE</div><div class="mf-ac-jt">${esc(mfNet(p.titre))}</div>`
    +`<div class="mf-ac-jp"><div class="mf-ac-jd">${esc(p.detail)}</div><button type="button" class="mf-ac-jb" onclick="${p.onclick}">${mfTouche('Entrée')}<span>${esc(mfNet(p.bouton))}</span></button></div></div>`;
  const sel=m.open?m.pile.find(a=>a.id===m.open&&a.status==='open'):null;
  let rows='', nb=0;
  const liste=c.attend.ouvertes;
  for(const r of liste){
    const ouverte=r.kind==='affaire'&&sel&&sel.id===r.id;
    /* Une affaire dépliée prend la place : les autres affaires attendent, les demandes restent (au plus une). */
    if(!ouverte&&sel&&r.kind==='affaire') continue;
    if(!ouverte&&nb>=(sel?2:MGMT_ACCUEIL_MAX_ATTEND)) continue;
    nb++;
    const texte=`<div class="mf-ac-rt"><div class="mf-ac-rp">${mgmtAccueilParts(m,r.parts)}</div>${r.sous?`<div class="mf-ac-rs">${esc(r.sous)}</div>`:''}</div>`;
    const actions=r.kind==='demande'
      ?`<div class="mf-ac-ra">${mfBouton('Promettre',{jaune:false,onclick:`CL.mgmtDemande(${esc(r.i)},'promettre')`})}${mfBouton('Refuser',{onclick:`CL.mgmtDemande(${esc(r.i)},'refuser')`})}</div>`
      :`<button type="button" class="mf-ac-act" onclick="CL.mgmtOpen('${esc(r.id)}')">${ouverte?'Ouverte':'Répondre ›'}</button>`;
    rows+=`<div class="mf-ac-ligne${ouverte?' sel':''}">${texte}${actions}</div>`+(ouverte?mgmtAccueilEchange(m,sel):'');
  }
  const plus=liste.length>nb?`<div class="mf-ac-rs">+ ${liste.length-nb} de plus : elles passeront dès que celles-ci seront réglées.</div>`:'';
  return mfPanneau(mgmtAccueilTitre('CE QUI T’ATTEND')+boite
    +(retrait?`<div class="mf-ac-retrait">${retrait}</div>`:'')
    +(liste.length?`<div class="mf-ac-lib">DEMANDES ET AFFAIRES OUVERTES</div>`:'')+rows+plus+extra,'normal','mf-ac-p mf-ac-c5 mf-ac-haut');
}
function mgmtAccueilPasse(m,c){
  const rows=c.passe.map((r,i)=>`<div class="mf-ac-ev${i===MGMT_ACCUEIL.cur?' sel':''}"><i class="mf-oct mf-ac-oct"></i>`
    +`<div class="mf-ac-evt"><div class="mf-ac-evp">${mgmtAccueilParts(m,r.parts)}</div><div class="mf-ac-rs">${esc(r.detail)}</div></div>`
    +(r.menu?`<span class="mf-ac-menu">${esc(r.menu.toUpperCase())}</span>`:'')+`</div>`).join('');
  const vide=`<div class="mf-ac-rs">Rien de neuf depuis ta dernière visite.</div>`;
  const touches=c.passe.length?`<div class="mf-ac-aide">${mfTouche('↑')}${mfTouche('↓')}<span>Choisir · </span>${mfTouche('Entrée')}<span>Ouvrir la fiche</span></div>`:'';
  return mfPanneau(mgmtAccueilTitre('CE QUI S’EST PASSÉ','Cette semaine')+(rows||vide)+touches,'normal','mf-ac-p mf-ac-c5');
}
function mgmtAccueilAilleurs(m,c){
  const rows=c.ailleurs.map(r=>`<div class="mf-ac-al"><div class="mf-ac-ap">${mgmtAccueilParts(m,r.parts)}</div>${r.detail?`<div class="mf-ac-rs">${esc(r.detail)}</div>`:''}</div>`).join('');
  return mfPanneau(mgmtAccueilTitre('ET AILLEURS')+(rows||`<div class="mf-ac-rs">Rien à signaler hors de ${esc(c.ou.org)}.</div>`),'normal','mf-ac-p mf-ac-c3');
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
  const m=G.mgmt, c=mgmtAccueilContenu(m);
  if(MGMT_ACCUEIL.cur>=c.passe.length) MGMT_ACCUEIL.cur=c.passe.length-1;
  const corps=c.premiere&&c.heritage
    ?`<div class="mf-ac-cols">${mgmtAccueilHeritage(m,c)}</div>`
    :`<div class="mf-ac-cols">${mgmtAccueilPasse(m,c)}<div class="mf-ac-colonne mf-ac-c5">${mgmtAccueilAttend(m,c)}${mgmtAccueilAilleurs(m,c)}</div></div>`;
  const contenu=`<main class="mf-contenu mf-ac">${mgmtAccueilBandeau(c,m)}${corps}</main>`;
  const droite=`${c.ou.org} Fight Night ${(m.eventsPlayed||0)+1}`;
  return mfEcran(contenu,{barre:'jeu',courant:'accueil',grise:false,m,plaque:'Accueil',libelle:'Semaine '+c.ou.semaine,droite,
    touches:[{ks:['A','E'],t:'Section'},{ks:['↑','↓'],t:'Choisir'},{ks:['Tab'],t:'Bloc suivant'},{ks:['Entrée'],t:'Ouvrir',jaune:true}]});
}
SCREENS.mgmt_accueil=scr_mgmt_accueil;

Object.assign(CL,{
  /* ==== [ANCRE: MGMT_PRESENTATION_ACCUEIL_GESTE] — Monde lot 3 T5 ==== */
  mgmtAccueilNom(id){if(!CL.mgmtPresentationOuvrir('combattant',[id])) CL.mgmtFiche(id);},
  /** Le curseur des événements de la semaine. */
  mgmtAccueilDeplacer(dir){
    if(!G||!G.mgmt) return;
    const n=mgmtAccueilContenu(G.mgmt).passe.length;
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
  '1'(){ mgmtKeyReply(0); },
  '2'(){ mgmtKeyReply(1); },
  '3'(){ mgmtKeyReply(2); },
  Escape(){ CL.mgmtMenuPrincipal(); },
});
/* ==== [FIN ANCRE] ==== */
