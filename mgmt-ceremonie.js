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
  const h=m.hist.map((t,i)=>({t,i})).filter(x=>x.t&&x.t.a&&x.t.a.id&&x.t.b&&x.t.b.id&&Number.isFinite(x.t.c)&&x.t.c>=from&&x.t.c<now);
  const titres=new Set((m.facts||[]).filter(f=>f&&f.k==='title_fight').map(f=>f.fight));
  const byId=new Map();
  const nom=s=>s&&(s.name||s.nom)||'Combattant';
  const entrant=(id,s)=>{if(!id)return null;if(!byId.has(id))byId.set(id,{id,nom:nom(s),combats:0,victoires:0,defaites:0,finitions:0,score:0,proAvant:Infinity});return byId.get(id);};
   for(const {t} of h.slice().sort((a,b)=>a.t.c-b.t.c||a.i-b.i)){for(const s of [t.a,t.b]){const x=entrant(s.id,s);x.combats++;const avant=Number(s.W||0)+Number(s.L||0)+Number(s.D||0);if(Number.isFinite(avant)&&x.proAvant===Infinity)x.proAvant=avant;}if(t.winner==='A'||t.winner==='B'){const side=t.winner==='A'?t.a:t.b, x=entrant(side.id,side);x.victoires++;if(['ko','sub','stop'].includes(t.family))x.finitions++;}}
  const out=[];
  for(const p of MGMT_CEREMONIE_PRIX){let cand=null;
    if(p.id==='combattant'){
      for(const {t,i} of h)if(t.winner==='A'||t.winner==='B'){const s=t.winner==='A'?t.a:t.b,x=entrant(s.id,s);x.score+=(titres.has(i)?3:(t.slot==='main'||t.slot==='co-main'?2:1))+(['ko','sub','stop'].includes(t.family)?1:0);if(t.winner==='A')entrant(t.b.id,t.b).defaites++;else entrant(t.a.id,t.a).defaites++;}
       cand=[...byId.values()].filter(x=>x.combats>=3&&x.score>=3).sort((a,b)=>b.score-a.score||a.defaites-b.defaites||(String(a.id)<String(b.id)?-1:String(a.id)>String(b.id)?1:0))[0];
    } else if(p.id==='ko'||p.id==='soumission'){
        cand=h.filter(({t})=>t.winner==='A'||t.winner==='B').filter(({t})=>p.id==='ko'?t.family==='ko':t.family==='sub').map(({t,i})=>{const side=t.winner==='A'?t.a:t.b;const publicOdds=Number(t.publicOddsWinner??t.pronosticPublic?.[t.winner]??t.pronostic?.[t.winner]);return {t,i,side,score:(titres.has(i)?3:0)+(Number.isFinite(publicOdds)&&publicOdds<35?2:0)+(t.round===1?2:0)+(t.slot==='main'||t.slot==='co-main'?1:0)};}).sort((a,b)=>b.score-a.score||a.t.c-b.t.c||(String(a.side.id)<String(b.side.id)?-1:String(a.side.id)>String(b.side.id)?1:0))[0];
    } else if(p.id==='combat'){
         cand=h.filter(({t})=>t.winner==='A'||t.winner==='B').map(({t,i})=>({t,i,score:typeof globalThis.mgmtHistoirePoidsCombat==='function'?globalThis.mgmtHistoirePoidsCombat(m,t):((Number(t.knockdownsA)||0)+(Number(t.knockdownsB)||0)+(t.retournement?2:0)+(t.finDernieresSecondes?2:0)+(titres.has(i)?2:0)+(t.surprise?2:0))})).sort((a,b)=>b.score-a.score||b.t.c-a.t.c||(String(a.t.a.id)<String(b.t.a.id)?-1:String(a.t.a.id)>String(b.t.a.id)?1:String(a.t.b.id)<String(b.t.b.id)?-1:String(a.t.b.id)>String(b.t.b.id)?1:0))[0];
    } else if(p.id==='revelation'){
        cand=[...byId.values()].filter(x=>x.proAvant<=5&&x.victoires>=2&&x.finitions>0).sort((a,b)=>b.victoires-a.victoires||b.finitions-a.finitions||(String(a.id)<String(b.id)?-1:String(a.id)>String(b.id)?1:0))[0];
     } else if(p.id==='retour'){
        /* ==== [ANCRE: P11_T1_RETOUR_HISTORIQUE] — Monde lot 55 T1 ==== */
          /* Un retour exige une interruption réelle entre deux combats, sans
             seuil arbitraire en jours : les simulations de saisons courtes ne
             dépassent pas les anciens seuils de 182/90/30 jours. */
          cand=h.filter(({t})=>t.winner==='A'||t.winner==='B').map(({t,i})=>{const side=t.winner==='A'?t.a:t.b,previous=m.hist.filter(x=>x&&x.c<t.c&&x.c>=0&&(x.a&&x.a.id===side.id||x.b&&x.b.id===side.id)).reduce((v,x)=>Math.max(v,x.c),-Infinity),weight=typeof globalThis.mgmtHistoirePoidsCombat==='function'?globalThis.mgmtHistoirePoidsCombat(m,t):((Number(t.knockdownsA)||0)+(Number(t.knockdownsB)||0)+(t.retournement?2:0)+(t.finDernieresSecondes?2:0)+(titres.has(i)?2:0)+(t.surprise?2:0)),affiche=t.slot==='main'?3:t.slot==='co-main'?2:1;return {t,i,side,gap:Number.isFinite(previous)?t.c-previous:0,weight,affiche};}).filter(x=>x.gap>0).sort((a,b)=>b.weight-a.weight||b.affiche-a.affiche||b.t.c-a.t.c||(String(a.side.id)<String(b.side.id)?-1:String(a.side.id)>String(b.side.id)?1:0))[0];
    }
        if(cand&&(p.id!=='combat'||cand.score>0)){const id=p.id==='combat'?null:p.id==='ko'||p.id==='soumission'||p.id==='retour'?cand.side.id:cand.id;const fighter=byId.get(id);const bout=cand.t||null;const laureats=p.id==='combat'?[bout.a.id,bout.b.id].filter(Boolean):id?[id]:[];const value=p.id==='combattant'?cand.combats:p.id==='revelation'?cand.victoires:p.id==='combat'?cand.score:p.id==='retour'?cand.gap:bout.round||1;const values={nom:fighter?fighter.nom:'',a:bout?nom(bout.a):'',b:bout?nom(bout.b):'',n:value};const edition=Math.floor(now/365)+1;const index=(String(id||cand.i||'').length+value+edition-1)%3;const phrase=p.phrases[index].replace(/\{(nom|a|b|n)\}/g,(_,k)=>values[k]);out.push({id:p.id,titre:p.titre,laureat:id,laureats,nom:fighter?fighter.nom:bout?`${nom(bout.a)} – ${nom(bout.b)}`:'',phrase:`${phrase} Édition ${edition}.`,relu:false,stat:value});
    }
  }
  return out;
}
function mgmtCeremonieInscrire(m,prix,annee){
  if(!m||!Array.isArray(m.roster)||!Array.isArray(prix)||!Number.isSafeInteger(annee))return;
  for(const p of prix){if(!p)continue;const laureats=Array.isArray(p.laureats)&&p.laureats.length?p.laureats:(p.laureat?[p.laureat]:[]);for(const id of laureats){const f=m.roster.find(x=>x&&x.id===id);if(!f)continue;if(!Array.isArray(f.prixAnnee))f.prixAnnee=[];if(!f.prixAnnee.some(x=>x&&x.prix===p.id&&x.annee===annee))f.prixAnnee.push({prix:p.id,annee,relu:false});}}
}

/* ==== [ANCRE: P11_T3_CARNET_LECTURE] — Monde lot 55 T1 ==== */
function mgmtCarnetLire(m){
  if(!m)return {champions:[],espoirs:[],prix:[],records:[],defis:[],primes:[],soirees:[]};
  const roster=Array.isArray(m.roster)?m.roster:[], hist=Array.isArray(m.hist)?m.hist:[];
  const prix=roster.flatMap(f=>(Array.isArray(f.prixAnnee)?f.prixAnnee:[]).map(p=>({nom:f.name||f.nom||'Combattant',...p}))).filter(p=>p&&Number.isSafeInteger(p.annee));
  const champions=(Array.isArray(m.facts)?m.facts:[]).filter(f=>f&&f.k==='title_fight').map(f=>{
    const t=hist[f.fight];
    if(!t||!['A','B'].includes(t.winner))return null;
    const laureat=t.winner==='A'?t.a:t.b;
    return {fait:f,nom:laureat.name||laureat.nom||'Champion',div:f.div,jour:t.c};
  }).filter(Boolean);
  const espoirs=(Array.isArray(m.espoirs)?m.espoirs:[]).map(id=>{const f=roster.find(x=>x&&x.id===id);if(!f)return null;const rang=typeof mgmtDivisionRanking==='function'?(mgmtDivisionRanking(m,f.div,'world')||[]).findIndex(x=>x.id===id)+1:0;return rang>0?{nom:f.name||f.nom||'Combattant',rang}:null;}).filter(Boolean);
    const primes=(Array.isArray(m.hist)?m.hist:[]).flatMap(t=>Array.isArray(t.primes)?t.primes:[]);
    /* Les primes effectivement jouées sont consignées comme faits, avec leur index de relevé. */
    for(const f of Array.isArray(m.facts)?m.facts:[]){
      if(!f||f.k!=='prime')continue;
      const combat=Number.isSafeInteger(f.fight)?hist[f.fight]:null;
      primes.push({nom:f.nom||f.id||'Prime',montant:Number.isFinite(f.montant)?f.montant:null,jour:f.c??(combat&&combat.c),combattant:f.a||null});
    }
   const records=typeof mgmtRecords==='function'?mgmtRecords(m):null;
   return {champions,espoirs,prix,records:records&&Array.isArray(records.unCombat)?records.unCombat:[],defis:Array.isArray(m.defis)?m.defis.filter(d=>d&&d.etat==='fait'):[],primes,soirees:hist.filter(t=>t&&t.c!==undefined)};
}

/* ==== [ANCRE: P11_T1_ECRAN_CEREMONIE] — Monde lot 55 T1 ==== */
function mgmtCeremonieEchapper(v){return typeof esc==='function'?esc(String(v??'')):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function scr_mgmt_ceremonie(){
  const m=G&&G.mgmt;if(!m)return '';
    const prix=mgmtCeremonieCalculer(m),jour=typeof mgmtCalAujourdhui==='function'?mgmtCalAujourdhui(m):0;
    const annee=typeof mgmtJourDate==='function'?new Date(mgmtJourDate(jour).ts).getUTCFullYear():2027;
    mgmtCeremonieInscrire(m,prix,annee);
     const ordreCartes=['combattant','ko','combat','soumission','revelation'];
    const cartesParId=new Map(MGMT_CEREMONIE_PRIX.map(p=>[p.id,p]));
    const cards=ordreCartes.map(id=>cartesParId.get(id)).filter(Boolean).map(p=>{const v=prix.find(x=>x.id===p.id),classe=p.id==='combattant'?'ce3-prix-combattant':'ce3-prix';return `<article class="${classe}"><h2>${mgmtCeremonieEchapper(p.titre)}</h2>${v?`<strong>${mgmtCeremonieEchapper(v.nom)}</strong><p>${mgmtCeremonieEchapper(v.phrase)}</p>`:`<p class="ce3-prix-vide">Aucun candidat cette année.</p>`}</article>`;}).join('');
  const classement=typeof mgmtOrgClassement==='function'?mgmtOrgClassement(m):[];
  const rangs=Array.isArray(classement)?classement.slice(0,8).map((o,i)=>`<li class="ce3-rang"><b>${i+1}e</b><span>${mgmtCeremonieEchapper(o.nom||o.name||o.id||'Organisation')}</span></li>`).join(''):'<li class="ce3-rang">Classement indisponible.</li>';
    const bilan=typeof mgmtOrgClassement==='function'?(mgmtOrgClassement(m)||[]).find(o=>o.estSplit):null;
    const rang=bilan&&Number.isFinite(Number(bilan.rang))?Number(bilan.rang):null;
    const nomsClassement=Array.isArray(classement)?classement.map(o=>mgmtCeremonieEchapper(o.nom||o.name||o.id||'Organisation')).join(', '):'';
      const ordinal=['','PREMIÈRE','DEUXIÈME','TROISIÈME','QUATRIÈME','CINQUIÈME','SIXIÈME','SEPTIÈME','HUITIÈME'][rang]||'—';
       const palier=typeof mgmtPaliersCalculer==='function'?mgmtPaliersCalculer(m):null,effets=palier&&palier.effets||{};
       const niveau=cle=>Math.max(0,Math.min(3,Number.isFinite(Number(effets[cle]))?Number(effets[cle]):0));
       const listeEffets=[
         `Diffuseur · ${niveau('diffuseur')} % de bonus aux droits`,
         `Recruteur · −${niveau('recruteur')} % sur le coût des missions`,
         `Agents libres · attrait de classement, palier ${niveau('agents')}/3`,
         `Salles · −${niveau('salle')} % sur les frais de salle`
       ].map(x=>`<li>${mgmtCeremonieEchapper(x)}</li>`).join('');
        const bilanHtml=`<section class="ce3-bilan" aria-label="Classement final : ${nomsClassement}"><div><strong>${rang===null?'—':mgmtCeremonieEchapper(String(rang))}<small>${rang===null?'':'e'}</small></strong><section><h2>SPLIT FINIT L’ANNÉE</h2><b>${ordinal} DES HUIT</b><p>Cinquième au premier jour</p></section></div><article><h2>CE QUE ÇA CHANGE EN ${annee+1}</h2><ul>${listeEffets}</ul></article></section>`;
       const body=`<main class="ce3-ecran"><header class="ce3-entete"><div class="ce3-entete-gauche"><h1>LES TROPHÉES ${annee}</h1><p>CHOISIS PAR LA PRESSE</p></div><strong><b>31 DÉCEMBRE</b><span>CAGE HEBDO</span></strong></header><section class="ce3-grille">${cards}</section>${bilanHtml}</main>`;
   return mfEcran(body,{barre:'jeu',courant:'accueil',m,plaque:'',droite:'',touches:[{ks:['↑','↓','←','→'],t:'Choisir'},{ks:['R'],t:'Revoir le combat'},{ks:['F'],t:'Sa fiche'},{ks:['Entrée'],t:'Le bilan du patron'},{ks:['Échap'],t:'Accueil'}]});
}
if(typeof SCREENS!=='undefined')SCREENS.mgmt_ceremonie=scr_mgmt_ceremonie;

/* ==== [ANCRE: P11_T3_ECRAN_CARNET] — Monde lot 55 T1 ==== */
function scr_mgmt_carnet(){
  const m=G&&G.mgmt;if(!m)return '';const c=mgmtCarnetLire(m);
  /* ==== [ANCRE: FID85_CARNET_PLANCHE] — Fidélité carnet, lot 85 ==== */
  const e=mgmtCeremonieEchapper;
  const corps=(xs,fn,absence=true)=>`<div class="ce3-carnet-liste">${xs.length?xs.map(fn).join(''):absence?'<p>Rien encore.</p>':''}</div>`;
  const titre=texte=>`<div class="ce3-carnet-titre"><h2>${e(texte)}</h2><i class="ce3-carnet-trait" aria-hidden="true"></i></div>`;
  const stats=[['soirées composées',Number.isSafeInteger(m.eventsPlayed)?m.eventsPlayed:new Set(c.soirees.map(t=>t.c)).size],['combats bookés',Array.isArray(m.hist)?m.hist.length:0],['salles pleines',Number(m.sallesPleines)||0],['champions couronnés',c.champions.length],['primes de la soirée',c.primes.length],['records de '+mgmtOrgNom(m),c.records.length]].map(([label,valeur])=>`<div class="ce3-carnet-stat"><strong>${e(valeur)}</strong><span>${e(label)}</span></div>`).join('');
  const faits=c.champions.slice(0,3).map(x=>{
    const nom=mfNet(x.nom), t=m.hist&&m.hist[x.fait.fight], adversaire=t&&(t.winner==='A'?t.b:t.a);
    const division=typeof mgmtDivisionLabel==='function'?mgmtDivisionLabel(x.div):x.div||'Catégorie';
    const date=typeof mgmtJourDateTexte==='function'?mgmtJourDateTexte(x.jour):'soirée '+x.jour;
    return `<p><b class="ce3-carnet-medaille">C</b><span class="ce3-carnet-identite"><strong style="font-size:${mfCorps(nom,310,34,24)}px">${e(nom)}</strong><small>${e(division)} · ${e(date)}</small></span>${adversaire?`<span class="ce3-carnet-contre">contre ${e(adversaire.name||adversaire.nom||'Combattant')}</span>`:''}</p>`;
  });
  const espoirs=c.espoirs.map(x=>`<p><i class="ce3-carnet-pastille" aria-hidden="true"></i><strong style="font-size:${mfCorps(x.nom,250,30,24)}px">${e(mfNet(x.nom))}</strong><span>${e(x.rang)}e mondial</span></p>`);
  const archives=`<details class="ce3-carnet-historique"><summary>CHAMPIONS COURONNÉS SOUS TOI · TES CÉRÉMONIES</summary><h2>CHAMPIONS COURONNÉS SOUS TOI</h2>${corps(c.champions,x=>`<p>${mgmtCeremonieEchapper(x.nom)} · ${e(x.div||'Catégorie')} · soirée ${e(x.jour)}</p>`)}<h2>ESPOIRS DEVENUS CLASSÉS</h2>${corps(c.espoirs,x=>`<p>${e(x.nom)} · ${e(x.rang)}e mondial</p>`)}<h2>TES CÉRÉMONIES</h2>${corps(c.prix,x=>`<p>${e(x.annee)} · ${e(x.nom)} · ${e(x.prix)}</p>`)}<h2>RECORDS DE TES SOIRÉES</h2>${corps(c.records,x=>`<p>${e(x.type||x.label||'Record')} · ${e(x.valeur??x.value??'')}</p>`)}<h2>TES SOIRÉES</h2>${corps(c.soirees,x=>`<p>Soirée ${e(x.c)}</p>`,false)}<h2>TES PRIMES</h2>${corps(c.primes,x=>`<p>${e(x.titre||x.nom||'Prime')}${Number.isFinite(x.montant)?` · ${e(x.montant)} €`:''}</p>`,false)}</details>`;
  const corpsFaits=`<div class="ce3-carnet-faits-contenu"><div class="ce3-carnet-champions">${corps(faits,x=>x)}</div><h2 class="ce3-carnet-espoirs-titre">TES ESPOIRS</h2><div class="ce3-carnet-espoirs">${corps(espoirs,x=>x)}</div>${archives}</div>`;
  // Le catalogue lit le format actuel {ok:{id:{s}}} sans attribuer de succès au passé hérité.
  const catalogue=typeof mgmtDefisListe==='function'&&!Array.isArray(m.defis)?mgmtDefisListe(m):c.defis.map(x=>({...x,ok:x.etat==='fait'}));
  const reussis=catalogue.filter(x=>x.ok).length;
  const cartes=catalogue.map(x=>{
    const classe=x.ok?'ce3-carnet-defi ce3-carnet-reussi':'ce3-carnet-defi';
    return `<div class="${classe}"><div class="ce3-carnet-defi-titre"><p>${e(x.titre||x.id)}</p>${x.ok?'<i class="ce3-carnet-coche" aria-label="Réussi"><svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="m4 10 4 4 8-9" fill="none" stroke="currentColor" stroke-width="3"></path></svg></i>':''}</div>${x.ok?'<b>RÉUSSI</b>':`<div class="ce3-carnet-progression" role="progressbar" aria-label="${e(x.titre||x.id)}" aria-valuemin="0" aria-valuemax="1" aria-valuenow="0"><span style="width:0%"></span></div>`}</div>`;
  }).join('');
  const defis=`<div class="ce3-carnet-defis">${cartes}</div>`;
  const defisContenu=`<header class="ce3-carnet-entete-panel">${titre('TES DÉFIS')}<div class="ce3-carnet-compteur"><span>${e(reussis)} SUR ${e(catalogue.length)}</span>${reussis?'':'<small>Rien encore.</small>'}</div></header>${defis}`;
  const depuis=m.poste&&Number.isSafeInteger(m.poste.debut)&&typeof mgmtJourDate==='function'?mgmtJourDate(m.poste.debut):null;
  // Tab suit l'ordre natif afin de pouvoir atteindre les archives après les onglets.
  const onglets=typeof mgmtOrgOnglets==='function'?mgmtOrgOnglets(m,'mgmt_carnet').replace("||event.key==='Tab'",''):'';
  const body=`<main class="ce3-ecran ce3-carnet-ecran ce3-carnet-fid85"><div class="ce3-carnet-onglets">${onglets}${depuis?`<p>Matchmaker depuis le ${e(depuis.jour)} ${e(depuis.mois.toLocaleLowerCase('fr'))} ${e(new Date(depuis.ts).getUTCFullYear())}</p>`:''}</div><section class="ce3-carnet-stats">${stats}</section><section class="ce3-carnet ce3-carnet-deux-panneaux">${mfPanneau(titre('CE QUE TU AS FAIT')+corpsFaits,'normal','ce3-carnet-panel ce3-carnet-faits')}${mfPanneau(defisContenu,'normal','ce3-carnet-panel ce3-carnet-defis-panel')}</section></main>`;
  const date=mfSoireeInfos(m);
  const entete=`<div class="ce3-carnet-entete">${date.dans?`<span>${e(date.dans)}</span>`:''}${date.date?`<div class="ce3-carnet-date"><b>${e(date.date)}</b>${date.lieu?`<span>${e(date.lieu)}</span>`:''}</div>`:''}<div class="ce3-carnet-soiree"><b>${mfNomSoireeHtml(mgmtOrgNom(m)+' Fight Night',56,'')}</b><b>${e((m.eventsPlayed||0)+1)}</b></div></div>`;
  const ecran=mfEcran(body,{barre:'jeu',courant:'organisation',m,prise:false,plaque:'Organisation',libelle:'TON CARNET',droiteHtml:entete,touches:[{ks:['Échap'],t:'Accueil',onclick:"CL.go('mgmt_accueil')"},{ks:['Tab'],t:'Onglet'},{ks:['↑','↓'],t:'Choisir'},{ks:['Entrée'],t:'Ouvrir',jaune:true}]});
  return ecran.replace('<div class="mf-barre-bas">','<button type="button" class="mf-barre-item cur" data-section="organisation" aria-current="page" onclick="CL.go(\'mgmt_carnet\')"><span>Organisation</span></button><div class="mf-barre-bas">');
  /* ==== [FIN ANCRE] ==== */
}
if(typeof SCREENS!=='undefined')SCREENS.mgmt_carnet=scr_mgmt_carnet;
