"use strict";
/* ==== [ANCRE: MGMT_BRIEF_LOT11_SOIREE_CADRE] — Brief du 06/10/2026, lot 11 : les écrans de la soirée (planches « Soirée 1 »
   à « Soirée 5 »). La soirée en cinq moments : l'OUVERTURE (la carte entière, « Commencer la soirée »), l'ENTRE-DEUX
   combats (le combat qui vient, le résultat du précédent, la suite), l'ATTENTE du combat principal (le même écran), l'AVANT-COMBAT
   (F : pour chacun ce que le joueur a vu et ce qu'il ne sait pas, puis « comment ça peut se passer », jamais qui gagne) et la
   FIN (le résultat du principal, l'état de la soirée, les sections rouvertes). La barre des sections est grisée du début à la fin
   de la soirée ; elle se rouvre sur l'écran de fin. Les combats se jouent dans l'ordre de passage, le principal en dernier.
   Entre deux combats : regarder (Entrée), passer (P), ouvrir l'avant-combat (F), voir un autre combat de la carte (← →).
   Un combat passé avec P compte comme vu : son résultat est connu, la connaissance se lit sur m.hist.
   Avec l'agenda seulement : une partie d'avant garde l'ancien écran de soirée (SCREENS.mgmt_soiree d'origine). ==== */

/** Trace de navigation de la soirée (jamais écrite dans la partie) : `commence` porte le cycle de la soirée dont le joueur a pris la main. */
let MGMT_SOIREE_UI={focus:null,commence:null,resultat:null,resultatTimer:null};
const mgmtSoCommence=()=>!!(G&&G.mgmt&&G.mgmt.lastEvent&&MGMT_SOIREE_UI.commence===G.mgmt.lastEvent.cycle);
const mgmtSoAgenda=()=>!!(G&&G.mgmt&&G.mgmt.lastEvent&&mgmtAgendaActif(G.mgmt));

/** Les mots de l'écran. relu:false */
const MGMT_SOIREE_ECRAN={
  relu:false,
  leila:{pret:'Mes {n} préliminaires sont prêts.',attend:'{nom} passe en {rang} : {mois} mois d’attente.'},
  fin:{joue:'JOUÉ',rouvertes:'Les sections sont rouvertes',terminee:'TERMINÉE',lieu:'LE LIEU',maintenant:'ET MAINTENANT',resultats:['LES','RÉSULTATS'],etat:'OÙ EN EST LA SOIRÉE',
    prelims:'Préliminaires',main:'Carte principale',principal:'Combat principal',pas:'PAS DE SOIRÉE POSÉE',aChoisir:'À choisir',aposer:'À POSER'},
};
const MGMT_SO_CHECK='<svg width="22" height="22" viewBox="0 0 26 26" fill="none" aria-hidden="true" style="flex:none"><path d="M4 14l6 6L22 6" stroke="#E9E6E1" stroke-width="4"></path></svg>';

function soLast(side){ return mfNet(side.last||side.name); }
function soFirst(side){ return mfNet(side.first||''); }
function soCat(div){ return mfNet(mgmtDivisionLabel(div)); }
function soMarques(forme){ return forme.length?forme.map(mfMarque).join(''):'<span class="mf-so-nd">—</span>'; }
function soRounds(n){ return n+' ROUNDS'; }

/** L'en-tête de la soirée : la plaque (les pastilles des combats passés, k / n), la date et le lieu, la soirée. */
function mgmtSoEntete(m,prog,index){
  const n=prog.length;
  const date=mgmtSoireeDateTexte(m), salle=mgmtSoireeSalle(m,0).nom;
  const num=(m.eventsPlayed||1);
  return `<header class="mf-entete mf-so-entete"><div class="mf-entete-g"><div class="mf-plaque"><span>SOIRÉE</span></div><b class="mf-so-cpt">${esc(Math.min(index,n))} / ${esc(n)}</b></div>`
    +`<div class="mf-so-dr"><span class="mf-entete-d">Ce soir</span>`
    +(date?`<div class="mf-so-chip"><b>${esc(date)}</b><span>${esc(mfNet(salle))}</span></div>`:'')
    +`<div class="mf-so-chip org"><b>${esc(mfNet(mgmtOrgNom(m)))} FIGHT NIGHT</b><b class="r">${esc(num)}</b></div></div></header>`;
}

/** Le résultat d'un combat passé : la colonne de gauche de l'entre-deux, et de la fin. */
function mgmtSoResultatHtml(m,p,titre){
  const d=mgmtResultatDetail(m,p.h);
  const qui=d
    ?(d.nul?`${esc(mfNet(d.gagnant.last||d.gagnant.name))}<br>NUL CONTRE ${esc(mfNet(d.perdant.last||d.perdant.name))}`:`${esc(mfNet(d.gagnant.last||d.gagnant.name))}<br>BAT ${esc(mfNet(d.perdant.last||d.perdant.name))}`)
    :esc(MGMT_FAMILY_LABELS[p.fait.family]||'');
  const meth=d?(d.nul?'Match nul':(d.family==='dec'||!d.family?d.methode:d.methode+', '+mgmtRoundTexte(d))):(MGMT_FAMILY_LABELS[p.fait.family]||'');
  return `<div class="mf-so-ph"><div class="mf-so-s">${esc(titre||'TERMINÉ')} · ${esc(soCat(p.div))}</div><div class="mf-so-h">${esc(p.etiquette)}</div></div>`
    +`<div class="mf-so-pc"><div class="mf-so-qui">${qui}</div><div class="mf-so-meth"><div class="mf-so-s">${d&&d.nul?'ISSUE':'VICTOIRE PAR'}</div><div class="mf-so-m">${esc(meth)}</div></div>`
    +`<div class="mf-so-fl"><span class="mf-k">←</span></div></div>`;
}
/** La colonne de droite : le combat d'après, ou la fin de la soirée. */
function mgmtSoApresHtml(prog,i){
  const n=prog[i+1];
  if(!n){
    const F=MGMT_SOIREE_ECRAN.fin;
    return `<div class="mf-so-ph"><div class="mf-so-s">APRÈS CE COMBAT</div><div class="mf-so-h">FIN DE SOIRÉE</div></div>`
      +`<div class="mf-so-pc"><div class="mf-so-qui">${F.resultats[0]}<br>${F.resultats[1]}</div><div class="mf-so-meth"><div class="mf-so-s">ENSUITE</div><div class="mf-so-m">Les ${esc(prog.length)} combats</div></div>`
      +`<div class="mf-so-fl"><span class="mf-k">→</span></div></div>`;
  }
  return `<div class="mf-so-ph"><div class="mf-so-s">APRÈS CE COMBAT</div><div class="mf-so-h">${esc(n.etiquette)}</div></div>`
    +`<div class="mf-so-pc"><div class="mf-so-qui">${esc(soLast(n.a))}<br>${esc(soLast(n.b))}</div><div class="mf-so-meth"><div class="mf-so-s">${esc(soCat(n.div))}</div><div class="mf-so-m">${esc(n.rounds)} rounds</div></div>`
    +`<div class="mf-so-fl"><span class="mf-k">→</span></div></div>`;
}
/** Le surnom d'un côté, après le prénom (« Prénom · « Surnom »), vide si le combattant n'en a pas. */
function mgmtSoSurnom(side){ const s=G&&G.mgmt&&side?mgmtSurnomDe(G.mgmt,side.id):''; return s?` · « ${esc(mfNet(s))} »`:''; }
/** Le rang d'avant la soirée chez l'organisation (« N°11 »), à côté du nom — Monde lot 20, retour d'Anthony du 18/10/2026. */
function mgmtSoRang(side){
  if(!G||!G.mgmt||!side||typeof mgmtLendemainRangs!=='function') return '';
  const r=mgmtLendemainRangs(G.mgmt,side.id), n=r&&(r.avant||r.apres);
  return n?` <i class="mf-so-rang">N°${esc(n)}</i>`:'';
}
/** La bannière d'un combat : les deux noms de part et d'autre de la diagonale, le VS, le poids et la distance. */
function mgmtSoBanniereHtml(av){
  const a=av.a, b=av.b;
  const fa=mfCorps(a.last,500,96,40), fb=mfCorps(b.last,500,96,40);
  return `<div class="mf-so-ban"><i class="mf-so-diag r"></i><i class="mf-so-diag c"></i>`
    +`<div class="mf-so-nom g"><b style="font-size:${fa}px">${esc(mfNet(a.last))}</b><span>${esc(mfNet(a.first))}${mgmtSoSurnom(a)}${mgmtSoRang(a)}</span></div>`
    +`<div class="mf-so-eti">${esc(av.etiquette)}</div>`
    +`<div class="mf-so-poids"><div>${esc(mfNet(av.divLabel))}</div><div>${esc(soRounds(av.rounds))}</div></div>`
    +`<div class="mf-so-nom d"><span>${esc(mfNet(b.first))}${mgmtSoSurnom(b)}${mgmtSoRang(b)}</span><b style="font-size:${fb}px">${esc(mfNet(b.last))}</b></div>`
    +`<div class="mf-so-vs">VS</div></div>`;
}
function soLigne(g,lib,d){ return `<div class="mf-so-r"><div class="mf-so-rg">${g}</div><div class="mf-so-rl">${esc(lib)}</div><div class="mf-so-rd">${d}</div></div>`; }
/** Le centre de l'entre-deux : la bannière, les lignes de comparaison (rang, bilan, allonge, style, forme), les enjeux, les actes. */
function mgmtSoCentreHtml(m,av,libre,joue,k){
  const a=av.a, b=av.b;
  const enjeux=av.enjeux.length?`<div class="mf-so-enj"><div class="mf-so-s">ENJEUX</div><div class="mf-so-chips">${av.enjeux.map(x=>`<span class="mf-puce">${esc(x)}</span>`).join('')}</div></div>`:'';
  /* Retours d'Anthony du 09/10/2026 : un combat déjà passé se revoit pendant la soirée. */
  const actes=joue
    ?`<div class="mf-so-actes">${mfBouton('Revoir le combat',{touche:'Entrée',jaune:true,onclick:`CL.mgmtSoRevoir(${k})`})}${mfBouton('Revenir au prochain combat',{touche:'Échap',onclick:'CL.mgmtSoAutre(0)'})}</div>`
     :libre
      ?`<div class="mf-so-actes"><div class="mf-so-s">TU LE REGARDES EN</div>${['complet','forts','resultat'].map((v,j)=>mfBouton(['COMPLET','TEMPS FORTS','RÉSULTAT'][j],{jaune:mgmtVueDuCombat(m,k)===v,onclick:`CL.mgmtVueCombatChoisir(${k},'${v}')`})).join('')}<div class="mf-so-s">${mgmtVueDuCombat(m,k)==='forts'?'Les moments clés, environ 45 secondes':mgmtVueDuCombat(m,k)==='resultat'?'Le résultat seul':'Le combat en entier'}</div></div><div class="mf-so-actes">${mfBouton('Regarder le combat',{touche:'Entrée',jaune:true,onclick:'CL.mgmtSoRegarder()'})}${mfBouton('Passer',{touche:'P',onclick:'CL.mgmtSoPasser()'})}${mfBouton('Avant-combat',{touche:'F',onclick:'CL.mgmtSoAvant()'})}</div>`
    :`<div class="mf-so-actes">${mfBouton('Revenir au prochain combat',{touche:'Entrée',jaune:true,onclick:'CL.mgmtSoAutre(0)'})}${mfBouton('Avant-combat',{touche:'F',onclick:'CL.mgmtSoAvant()'})}</div>`;
   return `<div class="so3-prochain">LE PROCHAIN · ${esc(av.etiquette)} · ${esc(av.divLabel)}</div>`+mgmtSoBanniereHtml(av)
    +`<div class="mf-so-cp"><div class="mf-so-rs">`
    +soLigne(`<span class="mf-so-v">${a.rang===null?'—':esc(a.rang)}</span>`,'Classement',`<span class="mf-so-v">${b.rang===null?'—':esc(b.rang)}</span>`)
    +soLigne(`<span class="mf-so-v">${esc(a.palmares)}</span>`,'Palmarès',`<span class="mf-so-v">${esc(b.palmares)}</span>`)
    +soLigne(`<span class="mf-so-v">${esc(a.allonge)}</span>`,'Allonge',`<span class="mf-so-v">${esc(b.allonge)}</span>`)
    +soLigne(`<span class="mf-so-v">${esc(a.profil)}</span>`,'Style',`<span class="mf-so-v">${esc(b.profil)}</span>`)
    +soLigne(`<span class="mf-so-fm">${soMarques(a.forme)}</span>`,'3 derniers combats',`<span class="mf-so-fm d">${soMarques(b.forme)}</span>`)
    +`</div>${enjeux}${actes}</div>`;
}
/** Les neuf pastilles du bas : fait, en cours, à venir. */
function mgmtSoBandeHtml(prog,index,focus){
  return `<div class="mf-so-bande">`+prog.map((p,k)=>{
    const fait=k<index, cur=k===focus;
    const vue=mgmtVueDuCombat(G.mgmt,k);
    return `<div class="mf-so-card${cur?' cur':''}${fait?' fait':''}"><button type="button" class="mf-so-tag${cur?' cur':''}${fait?' fait':''}" aria-label="${esc(p.etiquette)}${fait?', terminé':''}" onclick="CL.mgmtSoFocus(${k})">${fait?MGMT_SO_CHECK:''}<span>${esc(p.court)}</span></button>`
      +`<div class="mf-so-views" aria-label="Vue du combat ${k+1}">${mfBouton(vue==='complet'?'COMPLET':vue==='forts'?'TEMPS FORTS':'RÉSULTAT',{jaune:true,onclick:`CL.mgmtSoVueSuivante(${k})`})}</div></div>`;
  }).join('')+`</div>`;
}

/* ==== [ANCRE: P7_T1_PRIMES_FIN] — Monde lot 53 T1 ==== */
/** Affiche les trois attributions de la soirée à partir des seuls relevés. */
function mgmtSoPrimesFinHtml(m){
  const hist=Array.isArray(m&&m.hist)?m.hist:[], prog=typeof mgmtSoireeProgramme==='function'?mgmtSoireeProgramme(m):[];
  const lignes=[], annonces=prog.map(p=>({p,t:hist[p.h]})).filter(x=>x.t&&(x.t.pr==='cs'||x.t.pr==='pf'));
  for(const {p,t} of annonces){
    const nom=id=>{const s=t.a&&t.a.id===id?t.a:t.b&&t.b.id===id?t.b:null;return s?mfNet(s.name||s.last||'?'):'?';};
    let award;
    if(t.pr==='cs') award=`<b>${esc(nom(t.a&&t.a.id))} · ${esc(nom(t.b&&t.b.id))}</b>`;
    else{
      const fact=(Array.isArray(m.facts)?m.facts:[]).find(f=>f&&f.k==='prime'&&f.type==='pf'&&f.fight===p.h);
      const id=fact&&fact.a|| (t.winner==='B'?t.b&&t.b.id:t.a&&t.a.id);
      award=`<b>${esc(nom(id))}</b>`;
    }
    lignes.push(`<div class="so3-prime"><span>${t.pr==='cs'?'COMBAT DE LA SOIRÉE':'PERFORMANCE DE LA SOIRÉE'}</span>${award}</div>`);
  }
  /* Anciennes fixtures sans programme complet : les données d'historique restent une porte de repli. */
  if(!prog.length){
    const cycle=m&&m.lastEvent&&m.lastEvent.cycle;
    for(const t of hist){
      if(!t||t.c!==cycle||(t.pr!=='cs'&&t.pr!=='pf')) continue;
      const nom=id=>{const s=t.a&&t.a.id===id?t.a:t.b&&t.b.id===id?t.b:null;return s?mfNet(s.name||s.last||'?'):'?';};
      const id=t.winner==='B'?t.b&&t.b.id:t.a&&t.a.id;
      lignes.push(`<div class="so3-prime"><span>${t.pr==='cs'?'COMBAT DE LA SOIRÉE':'PERFORMANCE DE LA SOIRÉE'}</span><b>${t.pr==='cs'?`${esc(nom(t.a&&t.a.id))} · ${esc(nom(t.b&&t.b.id))}`:esc(nom(id))}</b></div>`);
    }
  }
  if(!lignes.length) return '';
  const finance=m&&m.lastEvent&&m.lastEvent.finance||{};
  const milliers=Number.isFinite(finance.primes)?finance.primes:0;
  return `<section class="so3-primes" aria-label="Primes annoncées"><h2>LES PRIMES DE LA SOIRÉE</h2>${lignes.join('')}<div class="so3-total"><span>ARGENT VERSÉ</span><b>${esc(mgmtEuros(milliers))}</b></div></section>`;
}

/** Ce que dit Leïla à l'ouverture : combien de préliminaires, et qui attend. */
function mgmtSoLeila(m,prog){
  const L=MGMT_SOIREE_ECRAN.leila, pre=prog.filter(p=>p.slot==='prelim');
  let t=L.pret.replace('{n}',pre.length);
  for(let k=0;k<pre.length;k++){
    const tr=pre[k].trace;
    const c=[tr.a,tr.b].map(s=>({last:s.last||s.name,attente:Number.isSafeInteger(s.lastCycle)&&s.lastCycle>=0?Math.max(0,Math.round((tr.c-s.lastCycle)*MGMT_VOIX_MOIS_PAR_CYCLE)):0})).filter(x=>x.attente>=3).sort((x,y)=>y.attente-x.attente)[0];
    if(c){ t+=' '+L.attend.replace('{nom}',c.last).replace('{rang}',k===0?'premier':(k+1)+'e').replace('{mois}',c.attente); break; }
  }
  return t;
}

/* ---- Les cinq écrans -------------------------------------------------------------------------------------- */

function mgmtSoOuvertureHtml(m,prog){
  /* ==== [ANCRE: FID86_CADRES_OUVERTURE] — Remplacée par FID_SOIREE_VUE_COMMUNE, fidélité du 27/10/2026 ==== */
  /* Décision d’Anthony : même carte unique dès l’ouverture, avec son action Commencer. */
  return mgmtSoEntreHtml(m,prog,0,0,true);
}
/* ==== [ANCRE: FID_SOIREE_VUE_COMMUNE] — Reprise visuelle du 27/10/2026, UniSoiree ==== */
function mgmtSoNomProchain(side){
  /* Le plancher du lot 77 reste calculé pour les noms longs ; le panneau fait désormais 500 px utiles. */
  const minimum=mfCorps(side.last||side.name||'',150,72,36);
  const corps=mfCorps(soLast(side),500,72,minimum);
  return `<div class="so3-prochain-personne"><span>${esc(mfNet(side.first||''))}</span><b style="font-size:${corps}px">${esc(soLast(side))}</b></div>`;
}
/** L'entre-deux et l'attente du principal : un seul écran, celui du combat qui vient. */
function mgmtSoEntreHtml(m,prog,index,focus,ouverture=false){
  /* ==== [ANCRE: MGMT_LOT65_T1_TABLEAU_SOIREE] — Monde lot 65 T1 : vue fidèle à UniSoiree. ==== */
  /* ==== [ANCRE: FID86_CADRES_ENTRE_COMBATS] — Fidélité soirée, lot 86 ==== */
  const cadre=mfPanneau('','normal','mf-so-cadre','aria-hidden="true"');
  /* ==== [FIN ANCRE] ==== */
  const salle=mgmtSoireeSalle(m,focus), taux=Math.round(salle.part*100), finance=m.lastEvent.finance||{};
  const places=Math.round((finance.capacite||salle.capacite)*salle.part);
  const ambiance=Math.max(1,Math.min(5,Math.round(taux/20)));
  const rows=prog.map((p,k)=>{
    const fait=k<index, courant=k===focus, vue=mgmtVueDuCombat(m,k);
    const detail=fait?mgmtResultatDetail(m,p.h):null;
    const gauche=detail&&detail.gagnant?`<span>${esc(mfNet(detail.gagnant.last||detail.gagnant.name))}</span> bat ${esc(mfNet(detail.perdant.last||detail.perdant.name))}`:`${esc(soLast(p.a))} <span class="so3-contre">contre</span> ${esc(soLast(p.b))}`;
    const boutons=fait?`<span class="so3-carte-methode">${esc(detail?detail.methode:'Terminé')}</span>`:
      `<div class="so3-carte-vues" aria-label="Vues du combat ${k+1}">${[['complet','COMPLET'],['forts','TEMPS FORTS'],['resultat','RÉSULTAT']].map(([v,l])=>`<button type="button" class="so3-vue${vue===v?' choisi':''}" aria-label="Vue du combat ${k+1} : ${l}" aria-pressed="${vue===v?'true':'false'}" title="Changer la vue avec V" onclick="mgmtVueCombatChoisir(${k},'${v}')">${l}</button>`).join('')}</div>`;
    return `<div class="${ouverture?'mf-so-lg ':''}so3-ligne${courant?' courant':''}${fait?' fait':''}"><b class="so3-rang">${k+1}</b><span class="so3-categorie">${esc(p.etiquette)}<small>${esc(soCat(p.div))}</small></span><strong class="so3-noms">${gauche}</strong>${boutons}</div>`;
  }).join('');
  const p=prog[focus], a=p&&p.a, b=p&&p.b, leila=mgmtSoLeila(m,prog), vue=p?mgmtVueDuCombat(m,p.i):'forts';
  const modes=p?`<div class="so3-modes">${[['complet','COMPLET'],['forts','TEMPS FORTS'],['resultat','RÉSULTAT']].map(([v,l])=>`<button type="button" class="so3-mode${vue===v?' choisi':''}" aria-pressed="${vue===v?'true':'false'}" onclick="mgmtVueCombatChoisir(${p.i},'${v}')">${l}</button>`).join('')}</div>`:'';
  const prochain=p?`<aside class="so3-prochain so3-prochain-panneau">${cadre}<h2>LE PROCHAIN · ${esc(p.etiquette)} · ${esc(soCat(p.div))}</h2><div class="so3-prochain-noms">${mgmtSoNomProchain(a)}<span class="so3-prochain-contre">CONTRE</span>${mgmtSoNomProchain(b)}</div><div class="so3-prochain-contexte">${mfVoix('Leïla',leila)}</div><div class="so3-prochain-vue"><span>TU LE REGARDES EN</span>${modes}</div><div class="so3-prochain-actions">${mfBouton(ouverture?'Commencer la soirée':'Regarder',{touche:'Entrée',jaune:true,onclick:ouverture?'CL.mgmtSoCommencer()':'CL.mgmtSoRegarder()'})}${mfBouton('Avant-combat',{touche:'F',onclick:'CL.mgmtSoAvant()'})}</div></aside>`:'';
  return `<div class="so3-tableau"><section class="so3-bandeau"><div class="so3-salle"><b>LA SALLE</b><strong>${esc(places)} <small>/ ${esc(finance.capacite||salle.capacite)}</small></strong></div><div class="so3-ambiance"><div class="so3-ambiance-titre"><b>L'AMBIANCE</b><span>▲ ÇA MONTE</span></div><strong class="so3-ambiance-pastilles" role="img" aria-label="Ambiance : ${esc(ambiance)} sur 5">${Array.from({length:10},(_,i)=>`<i class="${i<ambiance*2?'on':''}"></i>`).join('')}</strong></div><div class="so3-recette"><b>LA RECETTE</b><strong>${esc(mgmtEuros(Number(finance.recette)||0))}</strong></div></section><div class="so3-corps"><section class="so3-carte">${cadre}<header class="so3-carte-entete"><h2>LA CARTE<i class="so3-trait" aria-hidden="true"></i></h2><span>${ouverture?'PRÉLIMINAIRES · La carte de Leïla · CARTE PRINCIPALE':'COMMENT TU LES REGARDES'}</span></header><div class="so3-carte-lignes">${rows}</div></section>${prochain}</div></div>`;
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: MGMT_SOIREE_ENTETE_FIN] — Monde lot 65 T1 ==== */
function mgmtSoEnteteFin(m,prog){
  const n=prog.length;
  const date=mgmtSoireeDateTexte(m), salle=mgmtSoireeSalle(m,0).nom, num=m.eventsPlayed||1;
  return `<header class="mf-entete mf-so-entete"><div class="mf-entete-g"><div class="mf-plaque"><span>FIN DE SOIRÉE</span></div><b class="mf-so-cpt">${esc(n)} / ${esc(n)}</b></div><div class="mf-so-dr"><span class="mf-entete-d">Ce soir</span>${date?`<div class="mf-so-chip"><b>${esc(date)}</b><span>${esc(mfNet(salle))}</span></div>`:''}<div class="mf-so-chip org"><b>${esc(mfNet(mgmtOrgNom(m)))} FIGHT NIGHT</b><b class="r">${esc(num)}</b></div></div></header>`;
}
/* ==== [ANCRE: P7_T1_RESULTAT_SEUL] — Monde lot 53 T1 ==== */
function mgmtSoResultatSeulHtml(m,p){
  const d=mgmtResultatDetail(m,p.h), gagnant=d&&d.gagnant, perdant=d&&d.perdant;
  const resultat=d?(d.nul?'Match nul':`${mfNet(gagnant.last||gagnant.name)} bat ${mfNet(perdant.last||perdant.name)}`):'Résultat enregistré';
  const methode=d?d.methode:'Combat terminé', round=d?mgmtRoundTexte(d):'', temps=d&&d.temps?d.temps:'';
  return mfEcran(`<main class="mf-contenu"><section class="so3-resultat" role="status" aria-live="polite"><div class="so3-resultat-titre">RÉSULTAT</div><h1>${esc(resultat)}</h1><div class="so3-resultat-meta">${esc(methode)}${round?' · '+esc(round):''}${temps?' · '+esc(temps):''}</div>${mfBouton('Continuer',{touche:'Entrée',jaune:true,onclick:'CL.mgmtSoResultatContinuer()'})}</section></main>`,{barre:'jeu',grise:true,m,touches:[{ks:['Échap','Entrée'],t:'Continuer',jaune:true,onclick:'CL.mgmtSoResultatContinuer()'}]});
}
/** L'avant-combat : un côté (ce qu'on a vu, ce qu'on ne sait pas, son dernier combat, trois chiffres publics). */
function mgmtSoCoteHtml(c,couleur){
  const lignes=c.lignes.length
    ?c.lignes.map(x=>`<div class="mf-so-ro">${MGMT_SO_CHECK}<div>${esc(x)}</div></div>`).join('')
    :`<div class="mf-so-ro"><div class="mf-so-q">?</div><div>On ne sait pas encore.</div></div>`;
  const inconnus=c.inconnus.map(x=>`<div class="mf-so-ro"><div class="mf-so-q">?</div><div>${esc(x)}</div></div>`).join('');
  const dernier=c.dernier
    ?`<div class="mf-so-ro">${mfMarque(c.dernier.issue)}<div>${esc(c.dernier.texte)}</div></div>`
    :`<div class="mf-so-ro"><div class="mf-so-q">?</div><div>${esc(MGMT_AVANT_TEXTES.dernier.aucun)}</div></div>`;
  const pied=[['Classement',c.rang===null?'—':c.rang],['Palmarès',c.palmares],['Allonge',c.allonge]]
    .map(([k,v])=>`<div class="mf-so-pi"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('');
  return `<div class="mf-so-av ${couleur}"><div class="mf-so-ah"><div><div class="mf-so-ti">${esc(soLast(c))}</div><i class="mf-so-bar"></i></div>${c.vus?`<span>${esc(c.vus)} combat${c.vus>1?'s':''} vu${c.vus>1?'s':''}</span>`:''}</div>`
    +`<div class="mf-so-ag"><div class="mf-so-s">CE QUE TU AS VU</div><div class="mf-so-prof">${esc(c.profil)}</div></div>`
    +`<div class="mf-so-aj">${lignes}</div>`
    +(inconnus?`<div class="mf-so-ag"><div class="mf-so-s">CE QUE TU NE SAIS PAS</div>${inconnus}</div>`:'')
    +(c.dernier?`<div class="mf-so-ag"><div class="mf-so-s">SON DERNIER COMBAT</div>${dernier}</div>`:'')+`<div class="mf-so-pis">${pied}</div></div>`;
}
/* ==== [ANCRE: MGMT_PRESENTATION_SOIREE_RENDU] — Monde lot 3 T5 ==== */
function scr_mgmt_soiree_avant(){
  if(!mgmtSoAgenda()) return scr_mgmt_bureau();
  const m=G.mgmt, prog=mgmtSoireeProgramme(m), i=Math.max(0,Math.min(prog.length-1,MGMT_SOIREE_UI.focus===null?MGMT_SOIREE.index:MGMT_SOIREE_UI.focus));
  const v=mgmtPresentationCadre();
  if(!v||v.mode!=='soiree'||v.i!==i){
    if(!mgmtPresentationOuvrir('soiree',[],{i,retour:'mgmt_soiree'})) return mgmtSoireeFallback();
  }
  return scr_mgmt_presentation();
}
/* ==== [ANCRE: FID_SOIREE_PRIMES_BENEFICIAIRES] — Reprise visuelle du 27/10/2026 ==== */
/** Projection des primes déjà attribuées : une carte CS et une carte par bénéficiaire PF, même sur le même combat. */
function mgmtSoPrimesCartes(m,prog){
  const cartes=[];
  for(const p of prog){
    const t=m.hist[p.h];if(!t)continue;
    const ids=[p.a.id,p.b.id];
    const faits=(m.facts||[]).filter(f=>f&&f.k==='prime'&&f.fight===p.h&&ids.includes(f.a));
    const combat=faits.find(f=>f.type==='cs');
    if(combat||t.pr==='cs')cartes.push({p,t,type:'cs',id:p.a.id,montant:combat&&combat.m});
    const performances=new Map();
    for(const f of faits)if(f.type==='pf')performances.set(f.a,f);
    for(const [id,f] of performances)cartes.push({p,t,type:'pf',id,montant:f.m});
    if(!performances.size&&t.pr==='pf'){
      const detail=mgmtResultatDetail(m,p.h),id=(detail&&detail.gagnant&&detail.gagnant.id)||p.a.id;
      const fait=faits.find(f=>f.a===id);
      cartes.push({p,t,type:'pf',id,montant:fait&&fait.m});
    }
  }
  return cartes.sort((a,b)=>(a.type==='cs'?-1:1)-(b.type==='cs'?-1:1));
}
/* ==== [FIN ANCRE] ==== */
function mgmtSoFinHtml(m,prog){
  const F=MGMT_SOIREE_ECRAN.fin, dernier=prog[prog.length-1];
  const date=mgmtSoireeDateTexte(m), salle=mgmtSoireeSalle(m,0).nom, num=m.eventsPlayed||1;
  const nPre=prog.filter(p=>p.slot==='prelim').length, nMain=prog.filter(p=>p.slot==='main').length;
  const ligne=(t,v)=>`<div class="mf-so-bil"><span>${esc(t)}</span><div><b>${esc(v)}</b>${MGMT_SO_CHECK}</div></div>`;
  const suivant=mgmtCalendrierSoiree(m,num+1);
  const dans=suivant.jour!==null&&m.cal?Math.max(0,suivant.jour-m.cal.jour):null;
  const sd=suivant.jour!==null?mgmtJourDate(suivant.jour):null;
  const lieu=mgmtCalendrierLieu(m,num+1);
  const gauche=dernier?mgmtSoResultatHtml(m,dernier,'TERMINÉ'):'';
  const centre=`<div class="mf-so-ban2 fin"><div><div class="mf-so-s2">${esc(date)}${salle?' · '+esc(mfNet(salle)):''}</div><div class="mf-so-org">${esc(mfNet(mgmtOrgNom(m)))} FIGHT NIGHT</div></div><div class="mf-so-n"><b>${esc(num)}</b><span>${F.terminee}</span></div></div>`
    +mgmtSoPrimesFinHtml(m)
    +`<div class="mf-so-fcw"><div class="mf-so-fc"><div class="mf-so-fcl"><div class="mf-so-fb"><div class="mf-so-s">${F.lieu}</div><div class="mf-so-big">${esc(mfNet(salle||'—')).replace(' ','<br>')}</div></div>`
    +`<div class="mf-so-fb"><div class="mf-so-s">${F.maintenant}</div><div class="mf-so-big">${F.resultats[0]}<br>${F.resultats[1]}</div></div></div>`
    +`<div class="mf-so-fcr"><div class="mf-so-s">${F.etat}</div>${ligne(F.prelims,nPre+' / '+nPre)}${ligne(F.main,nMain+' / '+nMain)}${ligne(F.principal,F.joue)}</div></div>`
     +`<div class="mf-so-fp"><span class="mf-puce">${F.rouvertes}</span>${mfBouton('Voir le lendemain',{touche:'Entrée',jaune:true,onclick:'CL.mgmtSoFin()'})}</div></div>`;
  const droite=sd
    ?`<div class="mf-so-ph"><div class="mf-so-s">${esc(sd.jour)} ${esc(sd.mois)}</div><div class="mf-so-h">${esc(mfNet(mgmtOrgNom(m)))} FIGHT NIGHT</div></div>`
      +`<div class="mf-so-pc"><div class="mf-so-sn"><b>${esc(num+1)}</b><span>DANS<br>${esc(dans)} JOURS</span></div><div class="mf-so-meth"><div class="mf-so-s">LE LIEU</div><div class="mf-so-lieu"><i></i><span>${esc(lieu==='LIEU À CHOISIR'?F.aChoisir:lieu)}</span></div></div><div class="mf-so-fl"><span class="mf-k">→</span></div></div>`
    :`<div class="mf-so-ph"><div class="mf-so-s">LA SUITE</div><div class="mf-so-h">${esc(mfNet(mgmtOrgNom(m)))} FIGHT NIGHT</div></div>`
      +`<div class="mf-so-pc"><div class="mf-so-sn"><b>${esc(num+1)}</b><span>${F.aposer}</span></div><div class="mf-so-meth"><div class="mf-so-s">LE LIEU</div><div class="mf-so-lieu"><i></i><span>${F.aChoisir}</span></div></div><div class="mf-so-fl"><span class="mf-k">→</span></div></div>`;
  const rempli=Math.round(mgmtSoireeSalle(m,Math.max(0,prog.length-1)).part*100);
  const org=mgmtOrgNom(m), finLieu=mgmtSoireeSalle(m,0).nom;
  const primes=mgmtSoPrimesCartes(m,prog);
  const poids=primes.reduce((n,x)=>n+(x.type==='cs'?1.25:1),0);
  const cartes=primes.map(({p,type,id,montant})=>{
    const detail=mgmtResultatDetail(m,p.h);
    const beneficiaire=id===p.b.id?p.b:p.a;
    const noms=type==='cs'?`${p.a.last} · ${p.b.last}`:(beneficiaire.last||beneficiaire.name);
    const total=Number(m.lastEvent.finance&&m.lastEvent.finance.primes)||0;
    const prime=Number.isFinite(montant)?montant:Math.floor(total/4);
    const largeur=(1564-16*(primes.length-1))*(type==='cs'?1.25:1)/poids-60;
    const corps=Math.min(...noms.split(' · ').map(n=>mfCorps(mfNet(n),largeur,type==='cs'?104:92,36)));
    const affichageNoms=type==='cs'?noms.split(' · ').map(n=>`<span>${esc(mfNet(n))}</span>`).join(''):esc(mfNet(noms));
    return `<article class="so3-fin-prime${type==='cs'?' combat':' performance'}" style="--so-fin-nom:${corps}px"><div class="so3-fin-fond" aria-hidden="true"><div class="so3-fin-medaille"><i></i></div></div><div class="so3-fin-label">${type==='cs'?'COMBAT':'PERFORMANCE'} DE LA SOIRÉE</div><strong>${affichageNoms}</strong><b>${esc(mgmtEuros(prime))}${type==='cs'?' CHACUN':''}</b><span>${esc(detail?detail.methode:'Combat terminé')}${detail?' · '+esc(mgmtRoundTexte(detail)):''}</span></article>`;
  });
  const finance=m.lastEvent.finance||{};
  const places=Number.isFinite(finance.capacite)&&finance.capacite>0?Math.round(finance.capacite*mgmtSoireeSalle(m,Math.max(0,prog.length-1)).part):0;
  const ambiance=Math.max(0,Math.min(10,Math.round(rempli/10)));
  const recette=Number(finance.recette)||0;
  return `<section class="so3-fin-recomposee" aria-label="Fin de soirée"><div class="so3-fin-cartes${cartes.length===2?' deux-cartes':''}">${cartes.join('')}</div>`
    +`<section class="so3-fin-soiree">${mfPanneau('','normal','mf-so-cadre','aria-hidden="true"')}<h2>LA SOIRÉE<i class="so3-trait" aria-hidden="true"></i></h2>`
    +`<div class="so3-fin-salle"><span>LA SALLE</span><b>${esc(places.toLocaleString('fr-FR'))}</b><small>sur ${esc(Number(finance.capacite||0).toLocaleString('fr-FR'))} places${finance.record?' · record à '+esc(finance.record):''}</small></div>`
    +`<div class="so3-fin-ambiance"><span>L'AMBIANCE À LA FIN</span><b>${Array.from({length:10},(_,i)=>`<i class="${i<ambiance?'on':''}"></i>`).join('')}</b><small>${ambiance>=7?'Une grande soirée.':'La soirée est terminée.'}</small></div>`
    +`<div class="so3-fin-recette"><span>LA RECETTE</span><b>${recette<0?'−':'+'} ${esc(mgmtEuros(Math.abs(recette)))}</b><small>PRIMES PAYÉES</small></div></section>`
    +`<nav class="so3-fin-actions" aria-label="Actions de fin de soirée">${mfBouton('Tous les résultats',{touche:'R',onclick:'CL.go("mgmt_resultats")'})}${mfBouton('Le lendemain',{touche:'Entrée',jaune:true,onclick:'CL.mgmtSoFin()'})}</nav></section>`;
}
/** Le repli quand une trace manque (sauvegarde incomplète) : on rend la main au joueur sans rien montrer d'inventé. */
function mgmtSoireeFallback(){
  return mfEcran(`<main class="mf-contenu"><div class="mf-su-vide">${mfPanneau(`<div class="mf-eff-aucun">${esc('La soirée ne peut pas être montrée : le combat n’est pas dans l’historique.')}</div>${mfBouton('Continuer',{touche:'Entrée',jaune:true,onclick:'CL.mgmtSoireeSortir()'})}`,'normal')}</div></main>`,
    {barre:'jeu',grise:true,m:G.mgmt,touches:[{ks:['Entrée'],t:'Continuer',jaune:true,onclick:'CL.mgmtSoireeSortir()'}]});
}

function scr_mgmt_soiree_cadre(){
  const m=G.mgmt, prog=mgmtSoireeProgramme(m), n=prog.length, index=MGMT_SOIREE.index;
  if(!n||prog.some(p=>!p.trace)) return mgmtSoireeFallback();
  if(MGMT_SOIREE_UI.resultat!==null){ const p=prog[MGMT_SOIREE_UI.resultat]; return p?mgmtSoResultatSeulHtml(m,p):mgmtSoireeFallback(); }
  const moment=(index<=0&&!mgmtSoCommence())?'ouverture':mgmtSoireeMoment(m,Math.max(1,index));
  const focus=MGMT_SOIREE_UI.focus===null?Math.min(index,n-1):Math.max(0,Math.min(n-1,MGMT_SOIREE_UI.focus));
  let corps, touches, grise=true, courant=null;
  if(moment==='ouverture'){
    corps=mgmtSoOuvertureHtml(m,prog);
    touches=[{ks:['Entrée'],t:'Commencer la soirée',jaune:true,onclick:'CL.mgmtSoCommencer()'}];
  }else if(moment==='fin'){
    corps=mgmtSoFinHtml(m,prog); grise=false; courant='resultats';
     touches=[{ks:['R'],t:'Tous les résultats',onclick:'CL.go("mgmt_resultats")'},{ks:['Entrée'],t:'Le lendemain',jaune:true,onclick:'CL.mgmtSoFin()'}];
  }else{
    corps=mgmtSoEntreHtml(m,prog,index,focus);
    touches=[{ks:['←','→'],t:'Autre combat'},...(focus<index?[{ks:['Échap'],t:'Prochain combat',onclick:'CL.mgmtSoAutre(0)'}]:[{ks:['F'],t:'L’avant-combat',onclick:'CL.mgmtSoAvant()'},{ks:['P'],t:'Passer le combat',onclick:'CL.mgmtSoPasser()'}]),
      {ks:['Entrée'],t:focus===index?'Regarder le combat':(focus<index?'Revoir le combat':'Revenir au prochain combat'),jaune:true,onclick:focus===index?'CL.mgmtSoRegarder()':(focus<index?`CL.mgmtSoRevoir(${focus})`:'CL.mgmtSoAutre(0)')}];
  }
  /* ==== [ANCRE: MGMT_SOIREE_FIN_SANS_DOUBLE_ENTETE] — Monde lot 65 T1 ==== */
  const entete=moment==='fin'?mgmtSoEnteteFin(m,prog):mgmtSoEntete(m,prog,index);
  /* ==== [ANCRE: SOIREE_FIN_SANS_RAPPEL_GLOBAL] — Monde lot 65 T1 ==== */
  return mfEcran(entete+`<main class="mf-contenu mf-so">${corps}</main>`,{barre:'jeu',courant,grise,m,touches,prise:moment!=='fin'});
}
/* L'écran d'origine reste celui des parties d'avant l'agenda. */
const MGMT_SO_ANCIEN=SCREENS.mgmt_soiree;
SCREENS.mgmt_soiree=function(){ return mgmtSoAgenda()?scr_mgmt_soiree_cadre():MGMT_SO_ANCIEN(); };
SCREENS.mgmt_soiree_avant=scr_mgmt_soiree_avant;
MF_ECRAN_SECTION.mgmt_soiree_avant=null;

/* ---- Les gestes ----------------------------------------------------------------------------------------------- */

const MGMT_SO_VOIR_ANCIEN=CL.mgmtSoireeVoir;
Object.assign(CL,{
  mgmtSoCommencer(){ if(!mgmtSoAgenda()) return; MGMT_SOIREE_UI.commence=G.mgmt.lastEvent.cycle; MGMT_SOIREE_UI.focus=null; render(); },
  /** Regarder le prochain combat : l'écran animé ; au retour, la soirée avance d'un combat. */
  mgmtSoRegarder(){
    if(!mgmtSoAgenda()) return;
    const m=G.mgmt, p=mgmtSoireeProgramme(m)[MGMT_SOIREE.index];
    if(!p||!p.trace) return;
    const sortir=function(){
      const m=G.mgmt, combat=mgmtSoireeTrace(m,MGMT_SOIREE.index);
      const avancer=()=>{ MGMT_SOIREE.index++; MGMT_SOIREE_UI.focus=null; render(); };
      const d=m.discours&&m.discours.c===m.eventsPlayed&&Array.isArray(m.discours.d)
        ?m.discours.d.find(x=>combat&&x&&[x.a,x.adv].includes(combat.a.id)&&[x.a,x.adv].includes(combat.b.id)):null;
      if(d&&typeof mgmtDiscoursEcran==='function'&&mgmtDiscoursEcran(m,d,avancer)) return;
      avancer();
    };
    const vue=mgmtVueDuCombat(m,p.i);
    if(vue==='resultat'){ MGMT_SOIREE_UI.resultat=MGMT_SOIREE.index; MGMT_SOIREE_UI.resultatSuite=sortir; render(); MGMT_SOIREE_UI.resultatTimer=setTimeout(()=>CL.mgmtSoResultatContinuer(),5000); return; }
    mgmtCombatOuvrir({trace:p.trace,etiquette:p.etiquette,quel:p.etiquette===MGMT_SOIREE_TEXTES.principal?'le combat principal':'ce combat',
      salle:mgmtSoireeSalle(m,p.i),retour:'mgmt_soiree',finRetour:sortir,vue});
  },
  mgmtSoResultatContinuer(){
    if(MGMT_SOIREE_UI.resultat===null) return;
    if(MGMT_SOIREE_UI.resultatTimer) clearTimeout(MGMT_SOIREE_UI.resultatTimer);
    const suite=MGMT_SOIREE_UI.resultatSuite;
    MGMT_SOIREE_UI.resultatTimer=null; MGMT_SOIREE_UI.resultat=null; MGMT_SOIREE_UI.resultatSuite=null;
    if(typeof suite==='function'){ suite(); return; }
    MGMT_SOIREE.index++; MGMT_SOIREE_UI.focus=null; render();
  },
  /** Passer un combat : le résultat est connu, la soirée avance (la connaissance se lit sur m.hist). */
  mgmtSoPasser(){
    if(!mgmtSoAgenda()) return;
    const n=G.mgmt.lastEvent.fights.length;
    if(MGMT_SOIREE.index>=n) return;
    MGMT_SOIREE.index++; MGMT_SOIREE_UI.focus=null; render();
  },
  /* ==== [ANCRE: MGMT_PRESENTATION_SOIREE_GESTE] — Monde lot 3 T5 ==== */
  mgmtSoAvant(){ if(!mgmtSoAgenda()) return; const i=MGMT_SOIREE_UI.focus===null?Math.min(MGMT_SOIREE.index,G.mgmt.lastEvent.fights.length-1):MGMT_SOIREE_UI.focus; CL.mgmtPresentationOuvrir('soiree',[],{i,retour:'mgmt_soiree'}); },
  mgmtSoAvantRetour(){ CL.go('mgmt_soiree'); },
  mgmtSoAvantRegarder(){
    const f=MGMT_SOIREE_UI.focus;
    if(f!==null&&f!==MGMT_SOIREE.index){ CL.go('mgmt_soiree'); return; }
    CL.mgmtSoRegarder();
  },
  /** ← → : voir un autre combat de la carte (les combats déjà joués sont derrière, on ne s'y arrête pas). 0 : revenir au prochain. */
  mgmtSoAutre(d){
    if(!mgmtSoAgenda()) return;
    const n=G.mgmt.lastEvent.fights.length, i=MGMT_SOIREE.index;
    if(i>=n) return;
    if(d===0){ MGMT_SOIREE_UI.focus=null; render(); return; }
    const cur=MGMT_SOIREE_UI.focus===null?i:MGMT_SOIREE_UI.focus;
    MGMT_SOIREE_UI.focus=Math.max(0,Math.min(n-1,cur+(d<0?-1:1)));
    if(MGMT_SOIREE_UI.focus===i) MGMT_SOIREE_UI.focus=null;
    render();
  },
  mgmtSoFocus(k){
    if(!mgmtSoAgenda()) return;
    const n=G.mgmt.lastEvent.fights.length;
    if(MGMT_SOIREE.index>=n){ CL.mgmtSoRevoir(k); return; }   /* la soirée finie : une pastille rouvre le combat */
    if(!Number.isSafeInteger(k)||k<0||k>=n) return;
    MGMT_SOIREE_UI.focus=k===MGMT_SOIREE.index?null:k; render();
  },
  mgmtSoVueSuivante(k){
    if(!mgmtSoAgenda()) return;
    const ordre=['complet','forts','resultat'], actuelle=mgmtVueDuCombat(G.mgmt,k);
    mgmtVueCombatChoisir(k,ordre[(ordre.indexOf(actuelle)+1)%ordre.length]);
  },
  /** Revoir un combat déjà passé de la soirée : l'arène, sans rien changer au déroulé. */
  mgmtSoRevoir(k){
    if(!mgmtSoAgenda()) return;
    const m=G.mgmt, p=mgmtSoireeProgramme(m)[k];
    if(!p||!p.trace) return;
    mgmtCombatOuvrir({trace:p.trace,etiquette:p.etiquette,quel:p.slot==='main'&&k===mgmtSoireeProgramme(m).length-1?'le combat principal':'ce combat',salle:mgmtSoireeSalle(m,p.i),retour:'mgmt_soiree',finRetour:null});
  },
  /** Le dernier combat de la soirée, revu depuis l'écran de fin. */
  mgmtSoRevoirDernier(){
    if(!mgmtSoAgenda()) return;
    const m=G.mgmt, prog=mgmtSoireeProgramme(m), p=prog[prog.length-1];
    if(!p||!p.trace) return;
    mgmtCombatOuvrir({trace:p.trace,etiquette:p.etiquette,quel:'le combat principal',salle:mgmtSoireeSalle(m,p.i),retour:'mgmt_soiree',finRetour:null});
  },
  /** Lot 1 du brief démo : l'écran de repli referme toujours la soirée et rend la main, quel que soit le combat où l'on en était. */
  mgmtSoireeSortir(){
    if(!G||!G.mgmt||!G.mgmt.lastEvent) return;
    MGMT_SOIREE.index=G.mgmt.lastEvent.fights.length;
    CL.mgmtSoFin();
  },
  /** La fin de la soirée : le lendemain s'il y a des touchés, sinon la liste des résultats. */
  mgmtSoFin(){
    if(!G||!G.mgmt||!G.mgmt.lastEvent) return;
    if(MGMT_SOIREE.index<G.mgmt.lastEvent.fights.length) return;
    const m=G.mgmt, touched=Array.isArray(m.lastEvent.touched)?m.lastEvent.touched:[];
    MGMT_SOIREE_UI.commence=null; MGMT_SOIREE_UI.focus=null;
    /* ==== [ANCRE: P7_T2_EFFACER_VUES] — Monde lot 49 T1 ==== */
    delete m.vues;
    /* Brief démo, lot 6 T2 : le lendemain passe après chaque soirée, blessés ou non. */
    CL.go('mgmt_lendemain');
  },
  /** Le combat vu depuis l'écran de soirée : l'écran animé avec l'agenda, l'arène d'avant sans. */
  mgmtSoireeVoir(){
    if(mgmtSoAgenda()) return CL.mgmtSoRegarder();
    return MGMT_SO_VOIR_ANCIEN.call(CL);
  },
});
const MGMT_SO_ANCIENNES_TOUCHES={
  '1'(){ CL.mgmtSoireeVoir(); },
  '2'(){ CL.mgmtSoireeSimuler(); },
  '3'(){ CL.mgmtSoireeToutSimuler(); },
  Enter(){ if(MGMT_SOIREE.index>=G.mgmt.lastEvent.fights.length) CL.mgmtSoireeNext(); },
};
/** Les touches de la soirée : Entrée regarde, P passe, F ouvre l'avant-combat, V change la vue, ← → changent de combat. Sans agenda : celles d'origine. */
function mgmtSoTouche(nom){
  return function(){
    if(MGMT_SOIREE_UI.resultat!==null&&(nom==='Enter'||nom==='Escape')){ CL.mgmtSoResultatContinuer(); return; }
    if(!mgmtSoAgenda()){ const f=MGMT_SO_ANCIENNES_TOUCHES[nom]; if(f) f(); return; }
    const m=G.mgmt, n=m.lastEvent.fights.length, i=MGMT_SOIREE.index;
    const ouverture=i<=0&&!mgmtSoCommence();
    if(nom==='Enter'){
      if(ouverture) CL.mgmtSoCommencer();
      else if(i>=n) CL.mgmtSoFin();
      else if(MGMT_SOIREE_UI.focus!==null&&MGMT_SOIREE_UI.focus<i) CL.mgmtSoRevoir(MGMT_SOIREE_UI.focus);
      else if(MGMT_SOIREE_UI.focus!==null) CL.mgmtSoAutre(0);
      else CL.mgmtSoRegarder();
    }else if(nom==='Escape'){ if(MGMT_SOIREE_UI.focus!==null&&i<n) CL.mgmtSoAutre(0); }
    else if(nom==='p'&&!ouverture&&i<n&&(MGMT_SOIREE_UI.focus===null||MGMT_SOIREE_UI.focus>=i)) CL.mgmtSoPasser();
    else if(nom==='f'&&!ouverture&&i<n&&(MGMT_SOIREE_UI.focus===null||MGMT_SOIREE_UI.focus>=i)) CL.mgmtSoAvant();
    /* ==== [ANCRE: P7_T1_V_OUVERTURE] — Monde lot 53 T1 ==== */
    else if(nom==='v'&&i<n){ const k=MGMT_SOIREE_UI.focus===null?i:MGMT_SOIREE_UI.focus, ordre=['complet','forts','resultat'], vue=mgmtVueDuCombat(m,k); mgmtVueCombatChoisir(k,ordre[(ordre.indexOf(vue)+1)%ordre.length]); }
    else if(nom==='ArrowLeft'){ if(i>=n) CL.mgmtSoRevoirDernier(); else if(!ouverture) CL.mgmtSoAutre(-1); }
    else if(nom==='ArrowRight'&&!ouverture&&i<n) CL.mgmtSoAutre(1);
  };
}
keysRegister('mgmt_soiree',{
  '1'(){ if(!mgmtSoAgenda()) MGMT_SO_ANCIENNES_TOUCHES['1'](); },
  '2'(){ if(!mgmtSoAgenda()) MGMT_SO_ANCIENNES_TOUCHES['2'](); },
  '3'(){ if(!mgmtSoAgenda()) MGMT_SO_ANCIENNES_TOUCHES['3'](); },
  Enter:mgmtSoTouche('Enter'),
  p:mgmtSoTouche('p'), P:mgmtSoTouche('p'),
  f:mgmtSoTouche('f'), F:mgmtSoTouche('f'),
  v:mgmtSoTouche('v'), V:mgmtSoTouche('v'),
  ArrowLeft:mgmtSoTouche('ArrowLeft'), ArrowRight:mgmtSoTouche('ArrowRight'), Escape:mgmtSoTouche('Escape'),
});
keysRegister('mgmt_soiree_avant',{
  Enter(){ CL.mgmtSoAvantRegarder(); },
  Escape(){ CL.mgmtSoAvantRetour(); },
});
/* ==== [FIN ANCRE] ==== */
