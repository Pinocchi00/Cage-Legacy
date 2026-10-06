"use strict";
/* ==== [ANCRE: MGMT_BRIEF_LOT7A_CALENDRIER] — Brief du 06/10/2026, lot 7 (première tranche) : l'écran
   Calendrier (planche « Management — Calendrier »). Les soirées passées et à venir, chacune avec sa
   date, son combat principal et l'état de sa carte. La DATE est une valeur dérivée du numéro de la
   soirée (jamais stockée) : la première soirée tombe à MGMT_CALENDRIER_DEBUT, une soirée toutes les
   MGMT_EVENT_WEEKS semaines — le calendrier en dates choisies par le joueur est la tranche suivante.
   Le lieu n'existe pas encore (lot 8) : « À choisir ». Valeurs relu:false. ==== */

const MGMT_CALENDRIER_DEBUT=Date.UTC(2027,0,12);
const MGMT_MOIS=['JANVIER','FÉVRIER','MARS','AVRIL','MAI','JUIN','JUILLET','AOÛT','SEPTEMBRE','OCTOBRE','NOVEMBRE','DÉCEMBRE'];
let MGMT_CALENDRIER={n:0};

/** La date de la soirée n (1, 2, …) : un jour et un mois. Pur, dérivé. */
function mgmtSoireeDate(n){
  const d=new Date(MGMT_CALENDRIER_DEBUT+(n-1)*MGMT_EVENT_WEEKS*7*86400000);
  return {jour:d.getUTCDate(),mois:MGMT_MOIS[d.getUTCMonth()],ts:d.getTime()};
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

function mgmtCalendrierCarteLaterale(m,n,passee){
  const d=mgmtSoireeDate(n), nom=mgmtOrgNom(m)+' Fight Night';
  const resume=passee?mgmtCalendrierResume(m,n):null;
  const jours=Math.round((d.ts-mgmtSoireeDate(m.eventsPlayed+1).ts)/86400000);
  const corps=passee
    ?`<div class="mf-cal-lib">Le combat principal</div><div class="mf-cal-texte">${esc(resume||'Pas de trace de ce combat.')}</div>`
    :`<div class="mf-cal-lib">Le lieu</div><div class="mf-cal-texte"><span class="mf-cal-pastille"></span>À choisir</div>`;
  return `<div class="mf-cal-lat"><div><div class="mf-cal-lat-d">${esc(d.jour)} ${esc(d.mois)}</div><div class="mf-cal-lat-n">${esc(nom)}</div></div>`
    +`<div class="mf-cal-lat-num">${n}<span>${passee?'PASSÉE':'DANS<br>'+jours+' JOURS'}</span></div>${corps}`
    +`<button type="button" class="mf-cal-fleche" aria-label="${passee?'Soirée précédente':'Soirée suivante'}" onclick="CL.mgmtCalendrierVa(${passee?-1:1})">${passee?'←':'→'}</button></div>`;
}

function scr_mgmt_calendrier(){
  if(!G||!G.mgmt) return scr_mgmt_bureau();
  const m=G.mgmt, cur=m.eventsPlayed+1;
  const F=MGMT_CALENDRIER; if(!Number.isSafeInteger(F.n)||F.n<1||F.n>cur+12) F.n=cur;
  const n=F.n, d=mgmtSoireeDate(n), nom=mgmtOrgNom(m)+' Fight Night';
  const joues=n<cur, encours=n===cur, c=mgmtSoireeCarte(m);
  const jours=Math.round((d.ts-mgmtSoireeDate(cur).ts)/86400000);
  const etat=joues?`<div class="mf-cal-texte">${esc(mgmtCalendrierResume(m,n)||'Soirée jouée.')}</div>`
    :(encours?`<div class="mf-cal-etat"><div class="mf-cal-ligne"><span>Carte principale</span><b>${c.main} / ${c.sm}</b></div><div class="mf-cal-ligne"><span>Préliminaires</span><b>${c.prel} / ${c.sp}</b></div></div>`
      :`<div class="mf-cal-texte">Rien n'est encore posé pour cette soirée.</div>`);
  const centre=`<div class="mf-cal-centre"><div class="mf-cal-rouge"><div><div class="mf-cal-quand">${esc(d.jour)} ${esc(d.mois)} · LIEU À CHOISIR</div><div class="mf-cal-nom">${esc(nom.toUpperCase())}</div></div>`
    +`<div class="mf-cal-gros">${n}<span>${joues?'JOUÉE':(jours<=0?'CE SOIR':'DANS '+jours+' JOURS')}</span></div></div>`
    +`<div class="mf-cal-corps"><div class="mf-cal-lib">${joues?'Le combat principal':'Où en est la soirée'}</div>${etat}`
    +`<div class="mf-cal-pied">${encours&&c.manque?`<span class="mf-cal-manque">Il manque ${c.manque} combat${c.manque>1?'s':''}</span>`:'<span></span>'}`
    +(encours?mfBouton('Ouvrir la carte',{touche:'Entrée',jaune:true,onclick:'CL.mgmtCalendrierOuvrir()'}):'')+`</div></div></div>`;
  const debut=Math.max(1,n-3), onglets=[];
  for(let k=debut;k<debut+8;k++) onglets.push(`<button type="button" class="mf-cal-onglet${k===n?' ouvert':''}" onclick="CL.mgmtCalendrierVers(${k})">SOIRÉE ${k}</button>`);
  const contenu=`<main class="mf-contenu mf-calendrier"><div class="mf-cal-trois">${n>1?mgmtCalendrierCarteLaterale(m,n-1,true):'<div class="mf-cal-lat vide"></div>'}${centre}${mgmtCalendrierCarteLaterale(m,n+1,false)}</div><div class="mf-cal-onglets">${onglets.join('')}</div></main>`;
  return mfEcran(contenu,{barre:'jeu',courant:'calendrier',m,plaque:'Calendrier',libelle:encours&&jours>0?`Dans ${jours} jours`:'',
    droite:`${nom} ${cur}`,
    touches:[{ks:['Échap'],t:'Retour',onclick:"CL.go('mgmt_bureau')"},{ks:['←','→'],t:'Autre soirée'},{ks:['A','E'],t:'Section'},
      {ks:['Entrée'],t:'Ouvrir la carte',jaune:true,onclick:'CL.mgmtCalendrierOuvrir()'}]});
}
SCREENS.mgmt_calendrier=scr_mgmt_calendrier;

Object.assign(CL,{
  mgmtCalendrierVa(delta){ const cur=G.mgmt.eventsPlayed+1; MGMT_CALENDRIER.n=Math.min(cur+12,Math.max(1,(MGMT_CALENDRIER.n||cur)+(delta<0?-1:1))); render(); },
  mgmtCalendrierVers(k){ if(Number.isSafeInteger(k)&&k>=1){ MGMT_CALENDRIER.n=Math.min(G.mgmt.eventsPlayed+13,k); render(); } },
  /** Entrée n'ouvre la carte que pour la soirée en cours : les autres n'ont pas de carte à poser. */
  mgmtCalendrierOuvrir(){ if(!MGMT_CALENDRIER.n||MGMT_CALENDRIER.n===G.mgmt.eventsPlayed+1) CL.go('mgmt_carte'); },
});
keysRegister('mgmt_calendrier',{
  ArrowLeft(){ CL.mgmtCalendrierVa(-1); },
  ArrowRight(){ CL.mgmtCalendrierVa(1); },
  Enter(){ CL.mgmtCalendrierOuvrir(); },
  Escape(){ CL.go('mgmt_bureau'); },
});
/* ==== [FIN ANCRE] ==== */
