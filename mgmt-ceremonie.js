"use strict";
/* ==== [ANCRE: P11_T1_CEREMONIE] — Monde lot 55 T1 ==== */
/* Prix annuels calculés exclusivement depuis les combats conservés dans m.hist. */
const MGMT_CEREMONIE_PRIX=Object.freeze([
  {id:'combattant',titre:'COMBATTANT DE L’ANNÉE',min:3,phrases:['La saison de {nom} se lit dans {n} combats : la presse le couronne combattant de l’année.','Avec {n} combats disputés, {nom} s’impose comme combattant de l’année.','La régularité de {nom}, mesurée sur {n} combats, lui vaut le trophée de combattant de l’année.']},
  {id:'ko',titre:'KO DE L’ANNÉE',phrases:['{nom} signe le KO de l’année après {n} round(s).','La presse retient le KO de {nom}, conclu au {n}e round.','Le KO de l’année revient à {nom} : {n} round(s) ont suffi.']},
  {id:'soumission',titre:'SOUMISSION DE L’ANNÉE',phrases:['{nom} place la soumission marquante de l’année au {n}e round.','La presse distingue la soumission de {nom}, achevée en {n} round(s).','Au terme de {n} round(s), {nom} signe la soumission de l’année.']},
  {id:'combat',titre:'COMBAT DE L’ANNÉE',phrases:['Le combat de {a} et {b} a pesé {n} points d’histoire.','Avec {n} points d’histoire, {a} contre {b} est le combat de l’année.','La presse choisit {a}–{b} comme combat de l’année : {n} points d’histoire ont marqué la saison.']},
  {id:'revelation',titre:'RÉVÉLATION DE L’ANNÉE',phrases:['{nom} signe {n} victoires dans son année de révélation.','{n} victoires font de {nom} la révélation de l’année.','La révélation {nom} a remporté {n} combats cette année.']},
  {id:'retour',titre:'RETOUR DE L’ANNÉE',phrases:['Après {n} jours loin de la compétition, le retour de {nom} se conclut par une victoire.','{nom} a gagné après {n} jours sans combattre : la presse salue son retour.','Le retour gagnant de {nom}, après {n} jours d’absence, est distingué.']}
]);
function mgmtCeremonieCalculer(m){
  if(!m||!Array.isArray(m.hist))return [];
  const now=typeof mgmtCalAujourdhui==='function'?mgmtCalAujourdhui(m):0, from=now-365;
  const h=m.hist.map((t,i)=>({t,i})).filter(x=>x.t&&x.t.a&&x.t.b&&Number.isFinite(x.t.c)&&x.t.c>=from&&x.t.c<now);
  const titres=new Set((m.facts||[]).filter(f=>f&&f.k==='title_fight').map(f=>f.fight));
  const byId=new Map();
  const nom=s=>s&&(s.name||s.nom)||'Combattant';
  const entrant=(id,s)=>{if(!id)return null;if(!byId.has(id))byId.set(id,{id,nom:nom(s),combats:0,victoires:0,defaites:0,finitions:0,score:0,proAvant:Infinity});return byId.get(id);};
  for(const {t} of h){for(const s of [t.a,t.b]){const x=entrant(s.id,s);x.combats++;const avant=Number(s.W||0)+Number(s.L||0)+Number(s.D||0);if(Number.isFinite(avant))x.proAvant=Math.min(x.proAvant,avant);}if(t.winner==='A'||t.winner==='B'){const side=t.winner==='A'?t.a:t.b, x=entrant(side.id,side);x.victoires++;if(['ko','sub','stop'].includes(t.family))x.finitions++;}}
  const out=[];
  for(const p of MGMT_CEREMONIE_PRIX){let cand=null;
    if(p.id==='combattant'){
      for(const {t,i} of h)if(t.winner==='A'||t.winner==='B'){const s=t.winner==='A'?t.a:t.b,x=entrant(s.id,s);x.score+=(titres.has(i)?3:(t.slot==='main'||t.slot==='co-main'?2:1))+(['ko','sub','stop'].includes(t.family)?1:0);if(t.winner==='A')entrant(t.b.id,t.b).defaites++;else entrant(t.a.id,t.a).defaites++;}
      cand=[...byId.values()].filter(x=>x.combats>=3&&x.score>=3).sort((a,b)=>b.score-a.score||a.defaites-b.defaites||String(a.id).localeCompare(String(b.id)))[0];
    } else if(p.id==='ko'||p.id==='soumission'){
       cand=h.filter(({t})=>t.winner==='A'||t.winner==='B').filter(({t})=>p.id==='ko'?t.family==='ko':t.family==='sub').map(({t,i})=>{const side=t.winner==='A'?t.a:t.b;const publicOdds=Number(t.publicOddsWinner??t.pronosticPublic?.[t.winner]??t.pronostic?.[t.winner]);return {t,i,side,score:(titres.has(i)?3:0)+(Number.isFinite(publicOdds)&&publicOdds<35?2:0)+(t.round===1?2:0)+(t.slot==='main'||t.slot==='co-main'?1:0)};}).sort((a,b)=>b.score-a.score||a.t.c-b.t.c||a.i-b.i)[0];
    } else if(p.id==='combat'){
        cand=h.filter(({t})=>t.winner==='A'||t.winner==='B').map(({t,i})=>({t,i,score:typeof globalThis.mgmtHistoirePoidsCombat==='function'?globalThis.mgmtHistoirePoidsCombat(m,t):((Number(t.knockdownsA)||0)+(Number(t.knockdownsB)||0)+(t.retournement?2:0)+(t.finDernieresSecondes?2:0)+(titres.has(i)?2:0)+(t.surprise?2:0))})).sort((a,b)=>b.score-a.score||b.t.c-a.t.c||b.i-a.i)[0];
    } else if(p.id==='revelation'){
       cand=[...byId.values()].filter(x=>x.proAvant<=5&&x.victoires>=2&&x.finitions>0).sort((a,b)=>b.victoires-a.victoires||b.finitions-a.finitions||String(a.id).localeCompare(String(b.id)))[0];
     } else if(p.id==='retour'){
        /* ==== [ANCRE: P11_T1_RETOUR_HISTORIQUE] — Monde lot 55 T1 ==== */
        cand=h.filter(({t})=>t.winner==='A'||t.winner==='B').map(({t,i})=>{const side=t.winner==='A'?t.a:t.b,previous=m.hist.filter(x=>x&&x.c<t.c&&x.c>=0&&(x.a&&x.a.id===side.id||x.b&&x.b.id===side.id)).reduce((v,x)=>Math.max(v,x.c),-Infinity);return {t,i,side,gap:Number.isFinite(previous)?t.c-previous:0};}).filter(x=>x.gap>=182).sort((a,b)=>b.gap-a.gap||b.t.c-a.t.c||b.i-a.i)[0];
    }
     if(cand&&(p.id!=='combat'||cand.score>0)){const id=p.id==='combat'?null:p.id==='ko'||p.id==='soumission'||p.id==='retour'?cand.side.id:cand.id;const fighter=byId.get(id);const bout=cand.t||null;const value=p.id==='combattant'?cand.combats:p.id==='revelation'?cand.victoires:p.id==='combat'?cand.score:p.id==='retour'?cand.gap:bout.round||1;const values={nom:fighter?fighter.nom:'',a:bout?nom(bout.a):'',b:bout?nom(bout.b):'',n:value};const index=(String(id||cand.i||'').length+value)%3;out.push({id:p.id,titre:p.titre,laureat:id,nom:fighter?fighter.nom:bout?`${nom(bout.a)} – ${nom(bout.b)}`:'',phrase:p.phrases[index].replace(/\{(nom|a|b|n)\}/g,(_,k)=>values[k]),relu:false,stat:value});
    }
  }
  return out;
}
function mgmtCeremonieInscrire(m,prix,annee){
  if(!m||!Array.isArray(m.roster)||!Array.isArray(prix)||!Number.isSafeInteger(annee))return;
  for(const p of prix){const f=p&&m.roster.find(x=>x&&x.id===p.laureat);if(!f)continue;if(!Array.isArray(f.prixAnnee))f.prixAnnee=[];if(!f.prixAnnee.some(x=>x&&x.prix===p.id&&x.annee===annee))f.prixAnnee.push({prix:p.id,annee,relu:false});}
}

/* ==== [ANCRE: P11_T3_CARNET_LECTURE] — Monde lot 55 T1 ==== */
function mgmtCarnetLire(m){
  if(!m)return {champions:[],espoirs:[],prix:[],defis:[],primes:[],soirees:[]};
  const roster=Array.isArray(m.roster)?m.roster:[], hist=Array.isArray(m.hist)?m.hist:[];
  const prix=roster.flatMap(f=>(Array.isArray(f.prixAnnee)?f.prixAnnee:[]).map(p=>({nom:f.name||f.nom||'Combattant',...p}))).filter(p=>p&&Number.isSafeInteger(p.annee));
  const champions=(Array.isArray(m.facts)?m.facts:[]).filter(f=>f&&f.k==='champion').map(f=>({fait:f}));
  const espoirs=(Array.isArray(m.espoirs)?m.espoirs:[]).map(id=>{const f=roster.find(x=>x&&x.id===id);if(!f)return null;const rang=typeof mgmtDivisionRanking==='function'?(mgmtDivisionRanking(m,f.div,'world')||[]).findIndex(x=>x.id===id)+1:0;return rang>0?{nom:f.name||f.nom||'Combattant',rang}:null;}).filter(Boolean);
  const primes=(Array.isArray(m.hist)?m.hist:[]).flatMap(t=>Array.isArray(t.primes)?t.primes:[]);
  return {champions,espoirs,prix,defis:Array.isArray(m.defis)?m.defis.filter(d=>d&&d.etat==='fait'):[],primes,soirees:hist.filter(t=>t&&t.c!==undefined)};
}

/* ==== [ANCRE: P11_T1_ECRAN_CEREMONIE] — Monde lot 55 T1 ==== */
function mgmtCeremonieEchapper(v){return typeof esc==='function'?esc(String(v??'')):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function scr_mgmt_ceremonie(){
  const m=G&&G.mgmt;if(!m)return '';
   const prix=mgmtCeremonieCalculer(m),jour=typeof mgmtCalAujourdhui==='function'?mgmtCalAujourdhui(m):0;
   const annee=typeof mgmtJourDate==='function'?new Date(mgmtJourDate(jour).ts).getUTCFullYear():2027;
   mgmtCeremonieInscrire(m,prix,annee);
   const cards=MGMT_CEREMONIE_PRIX.map(p=>{const v=prix.find(x=>x.id===p.id);return `<article class="ce3-prix"><h2>${mgmtCeremonieEchapper(p.titre)}</h2><strong>${mgmtCeremonieEchapper(v?v.nom:'Pas de '+p.titre.toLocaleLowerCase('fr')+' cette année')}</strong><p>${mgmtCeremonieEchapper(v?v.phrase:'Aucun candidat ne répond aux critères cette année.')}</p></article>`;}).join('');
  const classement=typeof mgmtOrgClassement==='function'?mgmtOrgClassement(m):[];
  const rangs=Array.isArray(classement)?classement.slice(0,8).map((o,i)=>`<li class="ce3-rang"><b>${i+1}e</b><span>${mgmtCeremonieEchapper(o.nom||o.name||o.id||'Organisation')}</span></li>`).join(''):'<li class="ce3-rang">Classement indisponible.</li>';
   const lien=`<button type="button" onclick="mgmtPosteBilanLu=true;CL.go('mgmt_poste_bilan')">Le bilan du patron</button>`;
  const body=`<main class="ce3-ecran"><h1>LES TROPHÉES DE FIN D’ANNÉE</h1><p>CHOISIS PAR LA PRESSE</p><section class="ce3-grille">${cards}</section><section class="ce3-classement"><h2>CLASSEMENT FINAL DES HUIT</h2><ol>${rangs}</ol></section>${lien}</main>`;
  return mfEcran(body,{barre:'jeu',courant:'accueil',m,plaque:'LES TROPHÉES',droite:mgmtOrgNom(m),touches:[{ks:['Échap'],t:'Accueil'}]});
}
if(typeof SCREENS!=='undefined')SCREENS.mgmt_ceremonie=scr_mgmt_ceremonie;

/* ==== [ANCRE: P11_T3_ECRAN_CARNET] — Monde lot 55 T1 ==== */
function scr_mgmt_carnet(){
  const m=G&&G.mgmt;if(!m)return '';const c=mgmtCarnetLire(m);
  const liste=(xs,fn)=>xs.length?xs.map(fn).join(''):'<p>Rien encore.</p>';
  const body=`<main class="ce3-ecran"><h1>TON CARNET</h1><section class="ce3-carnet"><article><h2>CHAMPIONS COURONNÉS SOUS TOI</h2>${liste(c.champions,x=>`<p>${mgmtCeremonieEchapper(x.fait.nom||x.fait.fighter||'Champion')}</p>`)}</article><article><h2>ESPOIRS DEVENUS CLASSÉS</h2>${liste(c.espoirs,x=>`<p>${mgmtCeremonieEchapper(x.nom)} · ${x.rang}e mondial</p>`)}</article><article><h2>TES CÉRÉMONIES</h2>${liste(c.prix,x=>`<p>${x.annee} · ${mgmtCeremonieEchapper(x.nom)} · ${mgmtCeremonieEchapper(x.prix)}</p>`)}</article><article><h2>TES SOIRÉES</h2>${liste(c.soirees,x=>`<p>Soirée ${mgmtCeremonieEchapper(x.c)}</p>`)}</article><article><h2>TES DÉFIS</h2>${liste(c.defis,x=>`<p>${mgmtCeremonieEchapper(x.titre||x.id)}</p>`)}</article><article><h2>TES PRIMES</h2>${liste(c.primes,x=>`<p>${mgmtCeremonieEchapper(x.titre||x.nom||'Prime')}</p>`)}</article></section><button type="button" onclick="CL.go('mgmt_accueil')">Accueil</button></main>`;
  return mfEcran(body,{barre:'jeu',courant:'accueil',m,plaque:'TON CARNET',droite:mgmtOrgNom(m),touches:[{ks:['Échap'],t:'Accueil'}]});
}
if(typeof SCREENS!=='undefined')SCREENS.mgmt_carnet=scr_mgmt_carnet;
