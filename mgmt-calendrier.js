"use strict";
/* ==== [ANCRE: MGMT_BRIEF_LOT7_CALENDRIER] — Brief du 06/10/2026, lot 7 : l'écran Calendrier (planche
   « Management — Calendrier »). Les soirées passées et posées, chacune avec sa date, son combat principal et
   l'état de sa carte ; le joueur y POSE une soirée (P : date et taille), la retire, laisse passer le temps (L)
   ou lance la soirée prête (Entrée). La logique est dans mgmt-agenda.js ; les dates se DÉRIVENT du jour
   (jamais stockées en toutes lettres). Avant l'agenda (partie d'avant), les soirées gardent l'ancien rythme.
   Le lieu n'existe pas encore (lot 8) : « À choisir ». ==== */

const MGMT_CALENDRIER_DEBUT=Date.UTC(2027,0,12);
const MGMT_MOIS=['JANVIER','FÉVRIER','MARS','AVRIL','MAI','JUIN','JUILLET','AOÛT','SEPTEMBRE','OCTOBRE','NOVEMBRE','DÉCEMBRE'];
let MGMT_CALENDRIER={n:0,pose:null};

/** La date d'un jour (depuis le début) : un jour et un mois. Pur, dérivé. */
function mgmtJourDate(jour){
  const d=new Date(MGMT_CALENDRIER_DEBUT+jour*86400000);
  return {jour:d.getUTCDate(),mois:MGMT_MOIS[d.getUTCMonth()],ts:d.getTime()};
}
/** Le nom et la date d'une soirée jouée (corrections du 08/10, 4.5) : « Split Fight Night 3, 30 janvier ». Remplace le mot technique « Cycle ». Pur. */
function mgmtSoireeNomDate(m,n){
  const nom=mgmtOrgNom(m)+' Fight Night '+n;
  const j=typeof mgmtAgendaJour==='function'?mgmtAgendaJour(m,n):null;
  if(j===null||j===undefined) return nom;
  const d=mgmtJourDate(j);
  return nom+', '+d.jour+' '+d.mois;
}
/** La date de la soirée n selon l'ancien rythme (une toutes les cinq semaines). Pur, dérivé. */
function mgmtSoireeDate(n){ return mgmtJourDate((n-1)*MGMT_EVENT_WEEKS*7); }

/** Aujourd'hui, en jours : l'agenda s'il existe, sinon le jour de la soirée en cours. */
function mgmtCalAujourdhui(m){
  return mgmtAgendaActif(m)?m.cal.jour:((m.eventsPlayed||0))*MGMT_EVENT_WEEKS*7;
}

/** Le combat principal d'une soirée jouée, tel que la trace l'a gardé : « X a battu Y », ou null. */
function mgmtCalendrierResume(m,n){
  const t=(m.hist||[]).filter(h=>h.c===n-1&&h.slot==='main').pop();
  if(!t) return null;
  if(t.winner==='D') return `${t.a.name} et ${t.b.name} se quittent sur un nul`;
  const g=t.winner==='A'?t.a:t.b, p=t.winner==='A'?t.b:t.a;
  return `${g.name} a battu ${p.name}`;
}

/** La carte de la soirée en cours : combien de combats posés, combien en manque. */
function mgmtSoireeCarte(m){
  const c=m.card||{}, main=(c.main||[]).length, prel=(c.prelims||[]).length;
  const sm=Number.isSafeInteger(c.sizeMain)?c.sizeMain:MGMT_MAIN_SIZE, sp=Number.isSafeInteger(c.sizePrelims)?c.sizePrelims:MGMT_PRELIM_SIZE;
  return {main,sm,prel,sp,manque:Math.max(0,sm-main)+Math.max(0,sp-prel)};
}

/** Une soirée : sa date (ou null si rien n'est posé), sa taille, son état. Pur. */
function mgmtCalendrierSoiree(m,n){
  const cur=(m.eventsPlayed||0)+1, jour=mgmtAgendaJour(m,n), t=mgmtAgendaTaille(m,n);
  const actif=mgmtAgendaActif(m);
  return {n,jour,taille:t,passee:n<cur,encours:n===cur&&(!actif||jour!==null),posee:jour!==null};
}
/** Le lieu d'une soirée : le nom de sa salle, ou « LIEU À CHOISIR » avant l'agenda. */
function mgmtCalendrierLieu(m,n){
  const c=m.cal, i=n-((m.eventsPlayed||0)+1);
  let id=null;
  if(c&&c.actif){ const f=(c.faites||[]).find(x=>x.n===n); id=f?f.salle:(i>=0&&c.prochaines[i]?c.prochaines[i].salle:null); }
  const s=id?mgmtSalleParId(m,id):null;
  return s?s.nom.toUpperCase():'LIEU À CHOISIR';
}
function mgmtCalendrierTailleTexte(t){ return t==='grosse'?'GROSSE · 13 COMBATS':(t==='petite'?'PETITE · 9 COMBATS':''); }

function mgmtCalendrierCarteLaterale(m,n,passee){
  const s=mgmtCalendrierSoiree(m,n), nom=mgmtOrgNom(m)+' Fight Night';
  if(s.jour===null) return `<div class="mf-cal-lat vide"><div class="mf-cal-lat-d">PAS DE SOIRÉE POSÉE</div><div class="mf-cal-texte">P pour poser une soirée.</div></div>`;
  const d=mgmtJourDate(s.jour), jours=s.jour-mgmtCalAujourdhui(m);
  const resume=passee?mgmtCalendrierResume(m,n):null;
  const corps=passee
    ?`<div class="mf-cal-lib">Le combat principal</div><div class="mf-cal-texte">${esc(resume||'Pas de trace de ce combat.')}</div>`
    :`<div class="mf-cal-lib">Le lieu</div><div class="mf-cal-texte">${mgmtCalendrierLieu(m,n)==='LIEU À CHOISIR'?'<span class="mf-cal-pastille"></span>À choisir':esc(mgmtCalendrierLieu(m,n))}</div>`;
  return `<div class="mf-cal-lat"><div><div class="mf-cal-lat-d">${esc(d.jour)} ${esc(d.mois)}</div><div class="mf-cal-lat-n">${esc(nom)}</div></div>`
    +`<div class="mf-cal-lat-num">${n}<span>${passee?'PASSÉE':'DANS<br>'+jours+' JOURS'}</span></div>${corps}`
    +`<button type="button" class="mf-cal-fleche" aria-label="${passee?'Soirée précédente':'Soirée suivante'}" onclick="CL.mgmtCalendrierVa(${passee?-1:1})">${passee?'←':'→'}</button></div>`;
}

const MGMT_CAL_RAISONS={passee:'Cette date est passée.',occupee:'Une soirée est déjà posée ce jour-là.',
  'grosse-du-mois':'Une grosse soirée par mois au plus.','carte-composee':'La carte compte déjà plus de préliminaires que cette taille n’en offre : joue la soirée d’abord.'};

/** Le panneau central de pose : la date, la taille, ce qui l'empêche. */
function mgmtCalendrierPoseHtml(m){
  const P=MGMT_CALENDRIER.pose, d=mgmtJourDate(P.jour);
  const r=mgmtAgendaVerifier(m,P.jour,P.taille,P.salle);
  const salle=mgmtSalleParId(m,P.salle), plafond=mgmtPopPlafond(m.pop);
  const lieu=salle?`${esc(salle.nom)} · ${esc(salle.capacite)} places${salle.capacite>plafond*1.25?' · plus grande que ce que le public remplit':''}`:'';
  const taille=t=>`<button type="button" class="mf-onglet${P.taille===t?' ouvert':''}" onclick="CL.mgmtCalendrierPoseTaille('${t}')">${t==='grosse'?'GROSSE · 13':'PETITE · 9'}</button>`;
  return `<div class="mf-cal-centre"><div class="mf-cal-rouge"><div><div class="mf-cal-quand">POSER UNE SOIRÉE</div><div class="mf-cal-nom">${esc(d.jour)} ${esc(d.mois)}</div></div>`
    +`<div class="mf-cal-gros">${P.jour-m.cal.jour}<span>JOURS</span></div></div>`
    +`<div class="mf-cal-corps"><div class="mf-cal-lib">Taille</div><div class="mf-fiche-onglets">${taille('petite')}${taille('grosse')}</div>`
    +`<div class="mf-cal-lib">Salle</div><div class="mf-cal-texte">${lieu}</div>`
    +`<div class="mf-cal-texte">${r.ok?'La date est libre.':esc(MGMT_CAL_RAISONS[r.raison]||'Impossible.')}</div>`
    +`<div class="mf-cal-pied"><span class="mf-cal-manque">← → un jour · ↑ ↓ une semaine · T la taille · V la salle</span>`
    +mfBouton('Poser la soirée',{touche:'Entrée',jaune:true,onclick:'CL.mgmtCalendrierPoseValider()'})+`</div></div></div>`;
}

function scr_mgmt_calendrier(){
  if(!G||!G.mgmt) return scr_mgmt_bureau();
  const m=G.mgmt, cur=m.eventsPlayed+1, actif=mgmtAgendaActif(m);
  const F=MGMT_CALENDRIER;
  const max=actif?cur+m.cal.prochaines.length:cur+1;
  if(!Number.isSafeInteger(F.n)||F.n<1||F.n>max) F.n=cur;
  const n=F.n, s=mgmtCalendrierSoiree(m,n), nom=mgmtOrgNom(m)+' Fight Night';
  const joues=s.passee, encours=n===cur, c=mgmtSoireeCarte(m);
  const auj=mgmtCalAujourdhui(m), jours=s.jour===null?0:s.jour-auj;
  const d=s.jour===null?null:mgmtJourDate(s.jour);
  const pret=actif&&mgmtAgendaPret(m);
  const blocages=actif&&encours&&!joues&&s.jour!==null&&!pret?mgmtAgendaBlocages(m):[];
  let centre;
  if(F.pose&&actif) centre=mgmtCalendrierPoseHtml(m);
  else if(s.jour===null) centre=`<div class="mf-cal-centre"><div class="mf-cal-rouge"><div><div class="mf-cal-quand">AUCUNE SOIRÉE POSÉE</div><div class="mf-cal-nom">${esc(nom.toUpperCase())}</div></div></div>`
    +`<div class="mf-cal-corps"><div class="mf-cal-texte">Pose une soirée : une date et une taille. Le temps avance jusqu’à elle.</div>`
    +`<div class="mf-cal-pied"><span></span>${actif?mfBouton('Poser une soirée',{touche:'P',jaune:true,onclick:'CL.mgmtCalendrierPoseOuvrir()'}):''}</div></div></div>`;
  else{
    const etat=joues?`<div class="mf-cal-texte">${esc(mgmtCalendrierResume(m,n)||'Soirée jouée.')}</div>`
      :(encours?`<div class="mf-cal-etat"><div class="mf-cal-ligne"><span>Carte principale</span><b>${c.main} / ${c.sm}</b></div><div class="mf-cal-ligne"><span>Préliminaires</span><b>${c.prel} / ${c.sp}</b></div></div>`
        +(blocages.length?`<div class="mf-cal-lib">Ce qui empêche la soirée</div><div class="mf-cal-blocs">${blocages.map(b=>`<div class="mf-cal-bloc"><span><i class="mf-cal-pastille"></i>${esc(b.texte)}</span><button type="button" class="mf-onglet" onclick="${b.onclick}">${esc(b.label)}</button></div>`).join('')}</div>`:'')
        :`<div class="mf-cal-texte">Rien n’est encore posé pour cette soirée.</div>`);
    const boutons=(encours?mfBouton('Ouvrir la carte',{touche:actif&&pret?'':'Entrée',jaune:!pret,onclick:"CL.go('mgmt_carte')"}):'')
      +(encours&&actif&&pret?mfBouton('Jouer la soirée',{touche:'Entrée',jaune:true,onclick:'CL.mgmtCalendrierJouer()'}):'');
    centre=`<div class="mf-cal-centre"><div class="mf-cal-rouge"><div><div class="mf-cal-quand">${esc(d.jour)} ${esc(d.mois)} · ${esc(mgmtCalendrierLieu(m,n))}${s.taille?' · '+esc(mgmtCalendrierTailleTexte(s.taille)):''}</div><div class="mf-cal-nom">${esc(nom.toUpperCase())}</div></div>`
      +`<div class="mf-cal-gros">${n}<span>${joues?'JOUÉE':(jours<=0?'CE SOIR':'DANS '+jours+' JOURS')}</span></div></div>`
      +`<div class="mf-cal-corps"><div class="mf-cal-lib">${joues?'Le combat principal':'Où en est la soirée'}</div>${etat}`
      +`<div class="mf-cal-pied">${encours&&c.manque&&!blocages.length?`<span class="mf-cal-manque">Il manque ${c.manque} combat${c.manque>1?'s':''}</span>`:'<span></span>'}<div class="mf-car-boutons">${boutons}</div></div></div></div>`;
  }
  const debut=Math.max(1,n-3), onglets=[];
  for(let k=debut;k<debut+8&&k<=max;k++) onglets.push(`<button type="button" class="mf-cal-onglet${k===n?' ouvert':''}" onclick="CL.mgmtCalendrierVers(${k})">SOIRÉE ${k}</button>`);
  if(actif&&onglets.length<8) onglets.push(`<button type="button" class="mf-cal-onglet mf-cal-poser" onclick="CL.mgmtCalendrierPoseOuvrir()">+ POSER</button>`);
  const lateral=!F.pose?mgmtCalendrierCarteLaterale(m,n+1,false):'<div class="mf-cal-lat vide"></div>';
  const contenu=`<main class="mf-contenu mf-calendrier"><div class="mf-cal-trois">${n>1&&!F.pose?mgmtCalendrierCarteLaterale(m,n-1,true):'<div class="mf-cal-lat vide"></div>'}${centre}${lateral}</div><div class="mf-cal-onglets">${onglets.join('')}</div></main>`;
  const touches=F.pose
    ?[{ks:['Échap'],t:'Annuler',onclick:'CL.mgmtCalendrierPoseFermer()'},{ks:['←','→'],t:'Un jour'},{ks:['↑','↓'],t:'Une semaine'},{ks:['T'],t:'Taille',onclick:'CL.mgmtCalendrierPoseTaille()'},{ks:['V'],t:'Salle',onclick:'CL.mgmtCalendrierPoseSalle()'},
      {ks:['Entrée'],t:'Poser la soirée',jaune:true,onclick:'CL.mgmtCalendrierPoseValider()'}]
    :[{ks:['Échap'],t:'Retour',onclick:"CL.go('mgmt_bureau')"},{ks:['←','→'],t:'Autre soirée'},{ks:['A','E'],t:'Section'}]
      .concat(actif?[{ks:['P'],t:'Poser',onclick:'CL.mgmtCalendrierPoseOuvrir()'},{ks:['L'],t:'Laisser passer',onclick:'CL.mgmtCalendrierPasser()'}]:[])
      .concat([{ks:['Entrée'],t:pret?'Jouer la soirée':'Ouvrir la carte',jaune:true,onclick:'CL.mgmtCalendrierEntree()'}]);
  return mfEcran(contenu,{barre:'jeu',courant:'calendrier',m,plaque:'Calendrier',
    libelle:actif?`Aujourd’hui · ${mgmtJourDate(auj).jour} ${mgmtJourDate(auj).mois}`:(encours&&jours>0?`Dans ${jours} jours`:''),
    droite:`${nom} ${cur}`,touches});
}
SCREENS.mgmt_calendrier=scr_mgmt_calendrier;

Object.assign(CL,{
  mgmtCalendrierVa(delta){
    const m=G.mgmt, cur=m.eventsPlayed+1, max=mgmtAgendaActif(m)?cur+m.cal.prochaines.length:cur+1;
    MGMT_CALENDRIER.n=Math.min(max,Math.max(1,(MGMT_CALENDRIER.n||cur)+(delta<0?-1:1))); render();
  },
  mgmtCalendrierVers(k){ const m=G.mgmt; if(Number.isSafeInteger(k)&&k>=1){ MGMT_CALENDRIER.n=Math.min(m.eventsPlayed+1+(mgmtAgendaActif(m)?m.cal.prochaines.length:1),k); MGMT_CALENDRIER.pose=null; render(); } },
  /** Entrée : la soirée prête se joue ; sinon la carte s'ouvre (pour la soirée en cours seulement). */
  mgmtCalendrierEntree(){
    const m=G.mgmt; if(MGMT_CALENDRIER.pose){ CL.mgmtCalendrierPoseValider(); return; }
    if(MGMT_CALENDRIER.n&&MGMT_CALENDRIER.n!==m.eventsPlayed+1) return;
    if(mgmtAgendaActif(m)&&mgmtAgendaPret(m)) CL.mgmtCalendrierJouer(); else CL.go('mgmt_carte');
  },
  mgmtCalendrierOuvrir(){ CL.mgmtCalendrierEntree(); },
  mgmtCalendrierJouer(){
    const m=G.mgmt; if(!mgmtAgendaPret(m)) return;
    /* Lot 5 T6 : un combattant booké peut se retirer à la veille — la carte est incomplète, le bureau le dit. */
    if(typeof mgmtRetraitsAvantSoiree==='function'&&mgmtRetraitsAvantSoiree(m)){ MGMT_RETRAIT_UI={qui:'',texte:'',c:-1}; saveMgmt(); CL.go('mgmt_bureau'); return; }
    if(mgmtAgendaJouer(m)){ MGMT_CALENDRIER.n=0; MGMT_SOIREE.index=0; saveMgmt(); CL.go('mgmt_soiree'); } else render();
  },
  mgmtCalendrierPasser(){ const m=G.mgmt; if(mgmtAgendaPasser(m)>0) saveMgmt(); render(); },
  mgmtCalendrierPoseOuvrir(){
    const m=G.mgmt; if(!mgmtAgendaActif(m)) return;
    const dernier=m.cal.prochaines.length?m.cal.prochaines[m.cal.prochaines.length-1].jour:m.cal.jour;
    MGMT_CALENDRIER.pose={jour:dernier+MGMT_EVENT_WEEKS*7,taille:'petite',salle:(mgmtSalleDefaut(m)||{}).id}; render();
  },
  mgmtCalendrierPoseFermer(){ MGMT_CALENDRIER.pose=null; render(); },
  mgmtCalendrierPoseBouge(delta){ const P=MGMT_CALENDRIER.pose; if(!P) return; P.jour=Math.max(G.mgmt.cal.jour+1,P.jour+delta); render(); },
  mgmtCalendrierPoseTaille(t){ const P=MGMT_CALENDRIER.pose; if(!P) return; P.taille=(t==='grosse'||t==='petite')?t:(P.taille==='petite'?'grosse':'petite'); render(); },
  /** V : la salle suivante, des petites aux grandes. */
  mgmtCalendrierPoseSalle(){
    const m=G.mgmt, P=MGMT_CALENDRIER.pose; if(!P||!m.salles||!m.salles.length) return;
    const i=m.salles.findIndex(s=>s.id===P.salle); P.salle=m.salles[(i+1)%m.salles.length].id; render();
  },
  mgmtCalendrierPoseValider(){
    const m=G.mgmt, P=MGMT_CALENDRIER.pose; if(!P) return;
    if(mgmtAgendaPoser(m,P.jour,P.taille,P.salle).ok){
      const i=m.cal.prochaines.findIndex(x=>x.jour===P.jour);
      MGMT_CALENDRIER.pose=null; MGMT_CALENDRIER.n=m.eventsPlayed+1+i; saveMgmt();
    }
    render();
  },
  mgmtCalendrierRetirer(){
    const m=G.mgmt, i=(MGMT_CALENDRIER.n||0)-(m.eventsPlayed+1);
    if(mgmtAgendaRetirer(m,i)){ MGMT_CALENDRIER.n=0; saveMgmt(); }
    render();
  },
});
keysRegister('mgmt_calendrier',{
  ArrowLeft(){ if(MGMT_CALENDRIER.pose) CL.mgmtCalendrierPoseBouge(-1); else CL.mgmtCalendrierVa(-1); },
  ArrowRight(){ if(MGMT_CALENDRIER.pose) CL.mgmtCalendrierPoseBouge(1); else CL.mgmtCalendrierVa(1); },
  ArrowUp(){ CL.mgmtCalendrierPoseBouge(7); },
  ArrowDown(){ CL.mgmtCalendrierPoseBouge(-7); },
  Enter(){ CL.mgmtCalendrierEntree(); },
  p(){ CL.mgmtCalendrierPoseOuvrir(); },
  P(){ CL.mgmtCalendrierPoseOuvrir(); },
  v(){ CL.mgmtCalendrierPoseSalle(); },
  V(){ CL.mgmtCalendrierPoseSalle(); },
  t(){ CL.mgmtCalendrierPoseTaille(); },
  T(){ CL.mgmtCalendrierPoseTaille(); },
  l(){ if(!MGMT_CALENDRIER.pose) CL.mgmtCalendrierPasser(); },
  L(){ if(!MGMT_CALENDRIER.pose) CL.mgmtCalendrierPasser(); },
  Delete(){ if(!MGMT_CALENDRIER.pose) CL.mgmtCalendrierRetirer(); },
  Escape(){ if(MGMT_CALENDRIER.pose) CL.mgmtCalendrierPoseFermer(); else CL.go('mgmt_bureau'); },
});
/* ==== [FIN ANCRE] ==== */
