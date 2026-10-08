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
let MGMT_SOIREE_UI={focus:null,commence:null};
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
  const n=prog.length, nPre=prog.filter(p=>p.slot==='prelim').length;
  const pips=prog.map((p,k)=>`<i class="mf-so-pip${k<index?' on':''}${k===nPre?' sep':''}"></i>`).join('');
  const date=mgmtSoireeDateTexte(m), salle=mgmtSoireeSalle(m,0).nom;
  const num=(m.eventsPlayed||1);
  return `<header class="mf-entete mf-so-entete"><div class="mf-entete-g"><div class="mf-plaque"><span>SOIRÉE</span><span class="mf-so-pips" aria-hidden="true">${pips}</span><b class="mf-so-cpt">${esc(Math.min(index,n))} / ${esc(n)}</b></div></div>`
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
/** La bannière d'un combat : les deux noms de part et d'autre de la diagonale, le VS, le poids et la distance. */
function mgmtSoBanniereHtml(av){
  const a=av.a, b=av.b;
  const fa=mfCorps(a.last,500,96,40), fb=mfCorps(b.last,500,96,40);
  return `<div class="mf-so-ban"><i class="mf-so-diag r"></i><i class="mf-so-diag c"></i>`
    +`<div class="mf-so-nom g"><b style="font-size:${fa}px">${esc(mfNet(a.last))}</b><span>${esc(mfNet(a.first))}${mgmtSoSurnom(a)}</span></div>`
    +`<div class="mf-so-eti">${esc(av.etiquette)}</div>`
    +`<div class="mf-so-poids"><div>${esc(mfNet(av.divLabel))}</div><div>${esc(soRounds(av.rounds))}</div></div>`
    +`<div class="mf-so-nom d"><span>${esc(mfNet(b.first))}${mgmtSoSurnom(b)}</span><b style="font-size:${fb}px">${esc(mfNet(b.last))}</b></div>`
    +`<div class="mf-so-vs">VS</div></div>`;
}
function soLigne(g,lib,d){ return `<div class="mf-so-r"><div class="mf-so-rg">${g}</div><div class="mf-so-rl">${esc(lib)}</div><div class="mf-so-rd">${d}</div></div>`; }
/** Le centre de l'entre-deux : la bannière, les lignes de comparaison (rang, bilan, allonge, style, forme), les enjeux, les actes. */
function mgmtSoCentreHtml(m,av,libre){
  const a=av.a, b=av.b;
  const enjeux=av.enjeux.length?`<div class="mf-so-enj"><div class="mf-so-s">ENJEUX</div><div class="mf-so-chips">${av.enjeux.map(x=>`<span class="mf-puce">${esc(x)}</span>`).join('')}</div></div>`:'';
  const actes=libre
    ?`<div class="mf-so-actes">${mfBouton('Regarder le combat',{touche:'Entrée',jaune:true,onclick:'CL.mgmtSoRegarder()'})}${mfBouton('Passer',{touche:'P',onclick:'CL.mgmtSoPasser()'})}${mfBouton('Avant-combat',{touche:'F',onclick:'CL.mgmtSoAvant()'})}</div>`
    :`<div class="mf-so-actes">${mfBouton('Revenir au prochain combat',{touche:'Entrée',jaune:true,onclick:'CL.mgmtSoAutre(0)'})}${mfBouton('Avant-combat',{touche:'F',onclick:'CL.mgmtSoAvant()'})}</div>`;
  return mgmtSoBanniereHtml(av)
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
    return `<button type="button" class="mf-so-tag${cur?' cur':''}${fait?' fait':''}" aria-label="${esc(p.etiquette)}${fait?', terminé':''}" onclick="CL.mgmtSoFocus(${k})">${fait?MGMT_SO_CHECK:''}<span>${esc(p.court)}</span></button>`;
  }).join('')+`</div>`;
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
  const pre=prog.filter(p=>p.slot==='prelim'), main=prog.filter(p=>p.slot==='main');
  const salle=mgmtSoireeSalle(m,0).nom, num=m.eventsPlayed||1;
  const haut=n=>Math.max(44,Math.min(88,Math.floor((560-(n-1)*8)/Math.max(1,n))));
  const ligne=(p,rang,on,h)=>`<div class="mf-so-lg${on?' on':''}" style="height:${h}px"><b class="mf-so-nb">${esc(rang)}</b><div class="mf-so-li"><div class="mf-so-lt"><span>${esc(p.etiquette)}</span><span class="mf-so-cat">${esc(soCat(p.div).replace(/^POIDS /,''))}</span></div>`
    +`<div class="mf-so-ln"><b>${esc(soLast(p.a))}</b><span>contre</span><b>${esc(soLast(p.b))}</b></div></div></div>`;
  const hp=haut(pre.length), hm=haut(main.length);
  const gauche=`<div class="mf-so-col"><div class="mf-so-ct"><div><div class="mf-so-ti">PRÉLIMINAIRES</div><i class="mf-so-bar"></i></div><span>La carte de Leïla</span></div>`
    +`<div class="mf-so-ls">${pre.map((p,k)=>ligne(p,k+1,k===0,hp)).join('')}</div>`
    +`<div class="mf-so-leila">${mfVoix('Leïla',mgmtSoLeila(m,prog))}</div></div>`;
  const droite=`<div class="mf-so-col"><div class="mf-so-ct"><div><div class="mf-so-ti">CARTE PRINCIPALE</div><i class="mf-so-bar"></i></div><span>Ta carte</span></div>`
    +`<div class="mf-so-ls">${main.map((p,k)=>ligne(p,main.length-k,false,hm)).join('')}</div>`
    +`<div class="mf-so-pied">${mfBouton('Commencer la soirée',{touche:'Entrée',jaune:true,onclick:'CL.mgmtSoCommencer()'})}</div></div>`;
  const corps=`<div class="mf-so-ban2"><div><div class="mf-so-s2">CE SOIR${salle?' · '+esc(mfNet(salle)):''}</div><div class="mf-so-org">${esc(mfNet(mgmtOrgNom(m)))} FIGHT NIGHT</div></div>`
    +`<div class="mf-so-n"><b>${esc(num)}</b><span>${esc(prog.length)} COMBATS</span></div></div>`
    +`<div class="mf-so-cr">${gauche}${droite}</div>`;
  return mfPanneau(corps,'choisi','mf-so-ouv');
}
/** L'entre-deux et l'attente du principal : un seul écran, celui du combat qui vient. */
function mgmtSoEntreHtml(m,prog,index,focus){
  const av=mgmtAvantCombat(m,focus);
  const prec=prog[focus-1];
  const gauche=prec?mgmtSoResultatHtml(m,prec,'TERMINÉ')
    :`<div class="mf-so-ph"><div class="mf-so-s">CE SOIR · ${esc(prog.length)} COMBATS</div><div class="mf-so-h">OUVERTURE</div></div>`
      +`<div class="mf-so-pc"><div class="mf-so-qui">${esc(mfNet(mgmtOrgNom(m)))}<br>FIGHT NIGHT ${esc(m.eventsPlayed||1)}</div><div class="mf-so-meth"><div class="mf-so-s">LE LIEU</div><div class="mf-so-m">${esc(mgmtSoireeSalle(m,0).nom)}</div></div><div class="mf-so-fl"></div></div>`;
  const haut=`<div class="mf-so-haut">${mfPanneau(gauche,'cote','mf-so-g')}`
    +mfPanneau(av?mgmtSoCentreHtml(m,av,focus===index):'','choisi','mf-so-c')
    +mfPanneau(mgmtSoApresHtml(prog,focus),'cote','mf-so-d')+`</div>`;
  return haut+mgmtSoBandeHtml(prog,index,focus);
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
  return `<div class="mf-so-av ${couleur}"><div class="mf-so-ah"><div><div class="mf-so-ti">${esc(soLast(c))}</div><i class="mf-so-bar"></i></div><span>${esc(c.vus)} combat${c.vus>1?'s':''} vu${c.vus>1?'s':''}</span></div>`
    +`<div class="mf-so-ag"><div class="mf-so-s">CE QUE TU AS VU</div><div class="mf-so-prof">${esc(c.profil)}</div></div>`
    +`<div class="mf-so-aj">${lignes}</div>`
    +`<div class="mf-so-ag"><div class="mf-so-s">CE QUE TU NE SAIS PAS</div>${inconnus||'<div class="mf-so-ro"><div class="mf-so-q">?</div><div>Rien d’autre à signaler.</div></div>'}</div>`
    +`<div class="mf-so-ag"><div class="mf-so-s">SON DERNIER COMBAT</div>${dernier}</div><div class="mf-so-pis">${pied}</div></div>`;
}
function scr_mgmt_soiree_avant(){
  if(!mgmtSoAgenda()) return scr_mgmt_bureau();
  const m=G.mgmt, prog=mgmtSoireeProgramme(m), i=Math.max(0,Math.min(prog.length-1,MGMT_SOIREE_UI.focus===null?MGMT_SOIREE.index:MGMT_SOIREE_UI.focus));
  const av=mgmtAvantCombat(m,i);
  if(!av) return mgmtSoireeFallback();
  const a=av.a, b=av.b;
  const banniere=`<div class="mf-so-ban3"><i class="mf-so-diag r"></i><i class="mf-so-diag c"></i>`
    +`<div class="mf-so-nom g big"><span>${esc(soFirst(a))}</span><b>${esc(soLast(a))}</b></div>`
    +`<div class="mf-so-eti g3">${esc(av.etiquette)}</div><div class="mf-so-poids p3"><div>${esc(mfNet(av.divLabel))}</div><div>${esc(soRounds(av.rounds))}</div></div>`
    +`<div class="mf-so-nom d big"><span>${esc(soFirst(b))}</span><b>${esc(soLast(b))}</b></div><div class="mf-so-vs v3">VS</div></div>`;
  const zones=av.zones.map(z=>`<div class="mf-so-zo"><div class="mf-so-zi${z.inconnu?' q':''}${z.avantage==='A'?' a':(z.avantage==='B'?' b':'')}">${z.inconnu?'?':''}</div><div class="mf-so-zt"><b>${esc(z.titre)}</b><span>${esc(z.texte)}</span></div></div>`).join('');
  const entete=av.entete.a?`<div class="mf-so-eh"><div class="mf-so-ehl"><div class="mf-so-ehr"><i class="mf-so-sq a"></i><span>${esc(av.entete.a)}</span></div><div class="mf-so-ehr"><i class="mf-so-sq b"></i><span>${esc(av.entete.b)}</span></div><div class="mf-so-src">${esc(av.entete.source)}</div></div></div>`
    :`<div class="mf-so-eh"><div class="mf-so-src">${esc(av.entete.source)}</div></div>`;
  const centre=`<div class="mf-so-cent"><div class="mf-so-ah"><div><div class="mf-so-ti">COMMENT ÇA PEUT SE PASSER</div><i class="mf-so-bar"></i></div></div>${entete}<div class="mf-so-zs">${zones}</div>`
    +`<div class="mf-so-pied2">${mfBouton('Regarder le combat',{touche:'Entrée',jaune:true,onclick:'CL.mgmtSoAvantRegarder()'})}${mfBouton('Retour',{touche:'Échap',onclick:'CL.mgmtSoAvantRetour()'})}</div></div>`;
  const contenu=mgmtSoEntete(m,prog,MGMT_SOIREE.index)
    +`<main class="mf-contenu mf-so mf-so-avant">${banniere}<div class="mf-so-tr">${mfPanneau(mgmtSoCoteHtml(a,'a'),'cote','mf-so-pa')}${mfPanneau(centre,'choisi','mf-so-pc3')}${mfPanneau(mgmtSoCoteHtml(b,'b'),'cote','mf-so-pa')}</div></main>`;
  return mfEcran(contenu,{barre:'jeu',grise:true,m,touches:[{ks:['Échap'],t:'Retour à la soirée',onclick:'CL.mgmtSoAvantRetour()'},{ks:['Entrée'],t:'Regarder le combat',jaune:true,onclick:'CL.mgmtSoAvantRegarder()'}]});
}
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
    +`<div class="mf-so-fcw"><div class="mf-so-fc"><div class="mf-so-fcl"><div class="mf-so-fb"><div class="mf-so-s">${F.lieu}</div><div class="mf-so-big">${esc(mfNet(salle||'—')).replace(' ','<br>')}</div></div>`
    +`<div class="mf-so-fb"><div class="mf-so-s">${F.maintenant}</div><div class="mf-so-big">${F.resultats[0]}<br>${F.resultats[1]}</div></div></div>`
    +`<div class="mf-so-fcr"><div class="mf-so-s">${F.etat}</div>${ligne(F.prelims,nPre+' / '+nPre)}${ligne(F.main,nMain+' / '+nMain)}${ligne(F.principal,F.joue)}</div></div>`
    +`<div class="mf-so-fp"><span class="mf-puce">${F.rouvertes}</span>${mfBouton('Voir les résultats',{touche:'Entrée',jaune:true,onclick:'CL.mgmtSoFin()'})}</div></div>`;
  const droite=sd
    ?`<div class="mf-so-ph"><div class="mf-so-s">${esc(sd.jour)} ${esc(sd.mois)}</div><div class="mf-so-h">${esc(mfNet(mgmtOrgNom(m)))} FIGHT NIGHT</div></div>`
      +`<div class="mf-so-pc"><div class="mf-so-sn"><b>${esc(num+1)}</b><span>DANS<br>${esc(dans)} JOURS</span></div><div class="mf-so-meth"><div class="mf-so-s">LE LIEU</div><div class="mf-so-lieu"><i></i><span>${esc(lieu==='LIEU À CHOISIR'?F.aChoisir:lieu)}</span></div></div><div class="mf-so-fl"><span class="mf-k">→</span></div></div>`
    :`<div class="mf-so-ph"><div class="mf-so-s">LA SUITE</div><div class="mf-so-h">${esc(mfNet(mgmtOrgNom(m)))} FIGHT NIGHT</div></div>`
      +`<div class="mf-so-pc"><div class="mf-so-sn"><b>${esc(num+1)}</b><span>${F.aposer}</span></div><div class="mf-so-meth"><div class="mf-so-s">LE LIEU</div><div class="mf-so-lieu"><i></i><span>${F.aChoisir}</span></div></div><div class="mf-so-fl"><span class="mf-k">→</span></div></div>`;
  return `<div class="mf-so-haut">${mfPanneau(gauche,'cote','mf-so-g')}${mfPanneau(centre,'choisi','mf-so-c')}${mfPanneau(droite,'cote','mf-so-d')}</div>`+mgmtSoBandeHtml(prog,prog.length,-1);
}
/** Le repli quand une trace manque (sauvegarde incomplète) : on rend la main au joueur sans rien montrer d'inventé. */
function mgmtSoireeFallback(){
  return mfEcran(`<main class="mf-contenu"><div class="mf-su-vide">${mfPanneau(`<div class="mf-eff-aucun">${esc('La soirée ne peut pas être montrée : le combat n’est pas dans l’historique.')}</div>${mfBouton('Continuer',{touche:'Entrée',jaune:true,onclick:'CL.mgmtSoFin()'})}`,'normal')}</div></main>`,
    {barre:'jeu',grise:true,m:G.mgmt,touches:[{ks:['Entrée'],t:'Continuer',jaune:true,onclick:'CL.mgmtSoFin()'}]});
}

function scr_mgmt_soiree_cadre(){
  const m=G.mgmt, prog=mgmtSoireeProgramme(m), n=prog.length, index=MGMT_SOIREE.index;
  if(!n||prog.some(p=>!p.trace)) return mgmtSoireeFallback();
  const moment=(index<=0&&!mgmtSoCommence())?'ouverture':mgmtSoireeMoment(m,Math.max(1,index));
  const focus=MGMT_SOIREE_UI.focus===null?Math.min(index,n-1):Math.max(index,Math.min(n-1,MGMT_SOIREE_UI.focus));
  let corps, touches, grise=true, courant=null;
  if(moment==='ouverture'){
    corps=mgmtSoOuvertureHtml(m,prog);
    touches=[{ks:['Entrée'],t:'Commencer la soirée',jaune:true,onclick:'CL.mgmtSoCommencer()'}];
  }else if(moment==='fin'){
    corps=mgmtSoFinHtml(m,prog); grise=false; courant='resultats';
    touches=[{ks:['←'],t:'Dernier combat',onclick:'CL.mgmtSoRevoirDernier()'},{ks:['A','E'],t:'Section'},{ks:['Entrée'],t:'Voir les résultats',jaune:true,onclick:'CL.mgmtSoFin()'}];
  }else{
    corps=mgmtSoEntreHtml(m,prog,index,focus);
    touches=[{ks:['←','→'],t:'Autre combat'},{ks:['F'],t:'L’avant-combat',onclick:'CL.mgmtSoAvant()'},{ks:['P'],t:'Passer le combat',onclick:'CL.mgmtSoPasser()'},
      {ks:['Entrée'],t:focus===index?'Regarder le combat':'Revenir au prochain combat',jaune:true,onclick:focus===index?'CL.mgmtSoRegarder()':'CL.mgmtSoAutre(0)'}];
  }
  return mfEcran(mgmtSoEntete(m,prog,index)+`<main class="mf-contenu mf-so">${corps}</main>`,{barre:'jeu',courant,grise,m,touches});
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
    const sortir=function(){ MGMT_SOIREE.index++; MGMT_SOIREE_UI.focus=null; };
    mgmtCombatOuvrir({trace:p.trace,etiquette:p.etiquette,quel:p.etiquette===MGMT_SOIREE_TEXTES.principal?'le combat principal':'ce combat',
      salle:mgmtSoireeSalle(m,p.i),retour:'mgmt_soiree',finRetour:sortir});
  },
  /** Passer un combat : le résultat est connu, la soirée avance (la connaissance se lit sur m.hist). */
  mgmtSoPasser(){
    if(!mgmtSoAgenda()) return;
    const n=G.mgmt.lastEvent.fights.length;
    if(MGMT_SOIREE.index>=n) return;
    MGMT_SOIREE.index++; MGMT_SOIREE_UI.focus=null; render();
  },
  mgmtSoAvant(){ if(!mgmtSoAgenda()) return; if(MGMT_SOIREE_UI.focus===null) MGMT_SOIREE_UI.focus=Math.min(MGMT_SOIREE.index,G.mgmt.lastEvent.fights.length-1); CL.go('mgmt_soiree_avant'); },
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
    MGMT_SOIREE_UI.focus=Math.max(i,Math.min(n-1,cur+(d<0?-1:1)));
    if(MGMT_SOIREE_UI.focus===i) MGMT_SOIREE_UI.focus=null;
    render();
  },
  mgmtSoFocus(k){
    if(!mgmtSoAgenda()) return;
    const n=G.mgmt.lastEvent.fights.length;
    if(MGMT_SOIREE.index>=n||k<MGMT_SOIREE.index) return;
    MGMT_SOIREE_UI.focus=k===MGMT_SOIREE.index?null:k; render();
  },
  /** Le dernier combat de la soirée, revu depuis l'écran de fin. */
  mgmtSoRevoirDernier(){
    if(!mgmtSoAgenda()) return;
    const m=G.mgmt, prog=mgmtSoireeProgramme(m), p=prog[prog.length-1];
    if(!p||!p.trace) return;
    mgmtCombatOuvrir({trace:p.trace,etiquette:p.etiquette,quel:'le combat principal',salle:mgmtSoireeSalle(m,p.i),retour:'mgmt_soiree',finRetour:null});
  },
  /** La fin de la soirée : le lendemain s'il y a des touchés, sinon la liste des résultats. */
  mgmtSoFin(){
    if(!G||!G.mgmt||!G.mgmt.lastEvent) return;
    if(MGMT_SOIREE.index<G.mgmt.lastEvent.fights.length) return;
    const m=G.mgmt, touched=Array.isArray(m.lastEvent.touched)?m.lastEvent.touched:[];
    MGMT_SOIREE_UI.commence=null; MGMT_SOIREE_UI.focus=null;
    if(touched.length>0){ CL.go('mgmt_lendemain'); return; }
    mgmtAgendaActiver(m);
    mgmtNewPile(m);
    saveMgmt();
    MGMT_SU_RE.s=0; MGMT_SU_RE.i=0;
    CL.go('mgmt_resultats');
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
/** Les touches de la soirée : Entrée regarde, P passe, F ouvre l'avant-combat, ← → changent de combat. Sans agenda : celles d'origine. */
function mgmtSoTouche(nom){
  return function(){
    if(!mgmtSoAgenda()){ const f=MGMT_SO_ANCIENNES_TOUCHES[nom]; if(f) f(); return; }
    const m=G.mgmt, n=m.lastEvent.fights.length, i=MGMT_SOIREE.index;
    const ouverture=i<=0&&!mgmtSoCommence();
    if(nom==='Enter'){
      if(ouverture) CL.mgmtSoCommencer();
      else if(i>=n) CL.mgmtSoFin();
      else if(MGMT_SOIREE_UI.focus!==null) CL.mgmtSoAutre(0);
      else CL.mgmtSoRegarder();
    }else if(nom==='p'&&!ouverture&&i<n) CL.mgmtSoPasser();
    else if(nom==='f'&&!ouverture&&i<n) CL.mgmtSoAvant();
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
  ArrowLeft:mgmtSoTouche('ArrowLeft'), ArrowRight:mgmtSoTouche('ArrowRight'),
});
keysRegister('mgmt_soiree_avant',{
  Enter(){ CL.mgmtSoAvantRegarder(); },
  Escape(){ CL.mgmtSoAvantRetour(); },
});
/* ==== [FIN ANCRE] ==== */
