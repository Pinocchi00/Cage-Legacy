"use strict";
/* Maquette lot 1 — Prolonger ou libérer un combattant de Split (R23 à R25, Q12b, Q23b, charte S6).
   Une seule pièce de négociation : celle du Recrutement (recrutement.js), ouverte par-dessus l'écran courant.
   Chaque combattant de Split sous contrat a son dossier dans RC, de type « prol », jamais montré au marché.
   Entrées : le message de l'agent de Van Belle, « Proposer › » (Effectif, Carte), « Prolonger › » des Finances (fiche, Contrat),
   Prolonger et Libérer dans la fiche. Libérer est irréversible : confirmation en chiffres (qui, ce qui reste dû, quand).
   Après un accord ou un départ, la fiche, l'Effectif, la Carte, les Finances et le message changent tout de suite.
   Chargé après finsaison.js, avant barre.js. Préfixe pl. Seule la clé maquette-prolongation-1 est écrite (et les dossiers du Recrutement). */

const PL_CLE='maquette-prolongation-1';
S.pl={liberer:null,refus:null,demo:false,selAvant:null,ficheSous:null};
const PL={prolonges:{},liberes:{},versements:[]};
const plE=v=>`${nb(v)} €`;
const plIl=c=>/ F$/.test(c.cat)?'elle':'il';
const plIL=c=>/ F$/.test(c.cat)?'Elle':'Il';
const plE2=c=>/ F$/.test(c.cat)?'e':'';
const plJour=d=>`${d.getDate()} ${MOIS_C[d.getMonth()]} ${d.getFullYear()}`;

/* ---- Le contrat en cours : moitié fixe, moitié à la victoire (règle des Finances), ou les chiffres signés ---- */
function plActuel(c){
  const t=euros(c.contrat[1]);
  return {reste:c.contrat[0],fixe:c.fixe!=null?c.fixe:t/2,vic:c.vicB!=null?c.vicB:t/2};
}
/** Chez Split : les combats de ses soirées depuis son arrivée, les mêmes que la fiche (Combats, Contrat). */
function plChezSplit(c){
  const h=historique(c).filter(f=>/^Split/.test(f.soiree)&&f.date.getFullYear()>=+c.depuis);
  return {n:h.length,v:h.filter(f=>f.res==='v').length,primes:perfDe(c,[]).length};
}
const plAffiche=id=>typeof afEngages==='function'&&afEngages().has(id);
function plAdversaire(id){
  const k=typeof afEngages==='function'&&afEngages().get(id);if(!k)return null;
  const f=afFight(k),o=f&&(f.a===id?f.b:f.a);return o?parId(o):null;
}

/* ---- Ce qu'il demande pour rester ----
   Repères réels (AMELIORATIONS-DONNEES.md, section « Prolonger ou libérer ») : une bourse fixe et autant à la victoire ;
   la hausse suit les victoires (Khabib : +3 000 $ par victoire sur 21 000 $, soit environ +14 %) ; une prime de signature
   de 10 % du contrat (règle du jeu, MGMT_CT_PRIME_PART). Les pourcentages de hausse sont une hypothèse. */
function plDemande(c){
  const a=plActuel(c),rec=c.serie.slice(-3),nv=[...rec].filter(x=>x==='v').length;
  const hausse=c.rang==='C'?.25:Math.max(0,Math.min(.25,(nv-1)*.1));
  const bourse=rc1000(a.fixe*(1+hausse)),combats=c.age>=33?2:c.age<=24?5:4;
  return {bourse,combats,vic:bourse,sig:rc1000(combats*bourse*.1),dmd:null};
}
/* Deux dossiers écrits à la main (À RELIRE). L'agent de Van Belle est celui du message et de la presse. */
const PL_MAIN={
  vanbelle:{agent:['Luc Verhaegen','Dur en affaires',3,.25],
    dem:{bourse:9000,combats:4,vic:9000,sig:4000,dmd:[{id:'activite',t:'Au moins 3 combats par an',p:'moyen'},{id:'sponsors',t:'Garder ses propres sponsors',p:'leger'}]},
    ailleurs:'MMA Korner et Pure Impact',
    ouverture:'Jens se plaît chez Split, mais MMA Korner et Pure Impact l’ont appelé. Pour rester : 9 000 € par combat sur 4 combats, autant à la victoire, et 4 000 € à la signature. Il a aussi 2 demandes.'},
  kessler:{agent:['Dieter Lang','Arrangeant',4,.45],
    dem:{bourse:9000,combats:3,vic:9000,sig:3000,dmd:[{id:'sortie',t:'Pouvoir partir s’il reste 6 mois sans combat',p:'moyen'}]},
    ailleurs:'',
    ouverture:'Anton est chez Split depuis 2020. Après 2 défaites, il ne veut pas jouer son avenir sur un seul combat. Il demande 3 combats, au même prix : 9 000 € par combat, autant à la victoire, et 3 000 € à la signature.'},
};
function plEntree(c){
  const m=PL_MAIN[c.id],r=graine(c.id+'agentpl'),dem=m?{...m.dem,dmd:m.dem.dmd.map(z=>({...z}))}:plDemande(c);
  const x={id:c.id,type:'prol',profil:'',tag:'Split',dem,agent:m?m.agent:rcAgent(r),vu:null,connu:true,etat:null,main:m||null};
  if(!dem.dmd)dem.dmd=rcDemandes(c,x).filter(z=>z.id!=='titre'||c.rang==='C'||c.mondial<=10);
  x.patience=x.agent[2];return x;
}
COMBATTANTS.forEach(c=>{if(euros(c.contrat[1])&&!rcDe(c.id))RC.push(plEntree(c));});
const plDe=id=>{const x=rcDe(id);return x&&x.type==='prol'?x:null;};
const plActif=()=>!!(S.rc&&S.rc.nego&&plDe(S.rc.nego));

/* ---- Sauvegarde : jamais depuis une adresse de démonstration ---- */
function plSauver(){if(S.pl.demo)return;try{localStorage.setItem(PL_CLE,JSON.stringify(PL));}catch(e){}}
function plCharger(){try{const o=JSON.parse(localStorage.getItem(PL_CLE)||'{}');
  Object.entries(o.prolonges||{}).forEach(([id,v])=>{const x=plDe(id);if(x){x.etat='prolonge';plSigner(x,v.o,new Date(v.d),false);}});
  Object.entries(o.liberes||{}).forEach(([id,d])=>{if(plDe(id))plLiberer(id,new Date(d),false);});
  PL.versements=(o.versements||[]).map(v=>({...v,d:new Date(v.d)}));}catch(e){}}
/** Ce qui est sorti de la caisse hors soirées : primes de signature et restes dus (lu par finances.js). */
const plVersements=()=>PL.versements;
const plNbProlonges=()=>Object.keys(PL.prolonges).length;
const plDernierProlonge=()=>Object.keys(PL.prolonges).pop()||null;
/* Accueil : « À surveiller » ne garde la fin de contrat de Van Belle que tant qu'elle est vraie. */
const plAccueilBase=accueilHtml;
accueilHtml=function(){
  const h=plAccueilBase(),c=parId('vanbelle');
  return c&&c.contrat[0]!==1?h.replace(/<div class="ligne"><span style="color:var\(--jaune\)">(?:(?!<div class="ligne">)[^])*?data-fiche="vanbelle"(?:(?!<div class="ligne">)[^])*?dernier combat du contrat<\/span><span class="lecture">›<\/span><\/div>/,''):h;
};

/* ---- Ouvrir : la négociation, ou un refus qui dit pourquoi et quoi faire ---- */
function plRefusProl(c,x){
  if(x.etat==='refus'&&x.retour&&x.retour>S.date)return 'rompu';
  return null;
}
function plOuvrir(id){
  const c=parId(id),x=plDe(id);if(!c||!x)return;
  if(x.etat==='prolonge'){toast(`${esc(c.prenom)} ${esc(c.nom)} a déjà prolongé : ${x.signe.combats} combats, ${plE(x.signe.bourse)} par combat.`);return;}
  const ref=plRefusProl(c,x);if(ref){S.pl.refus={id,cas:ref};rendre();return;}
  if(!plActif())S.pl.selAvant=S.rc.sel;
  S.pl.ficheSous=S.fiche;
  if(x.nego&&x.nego.fini==='refus'){x.nego=null;x.patience=x.agent[2];} /* rupture passée (2 mois) : une nouvelle négociation */
  if(!x.nego){const a=plActuel(c),d=x.dem;
    /* La première offre part du contrat en cours (la signature comme au Recrutement : 60 % de sa demande). */
    x.nego={dem:{...d,dmd:[...d.dmd]},dem0:{...d},demPrev:null,offre:{bourse:a.fixe,combats:d.combats,vic:a.vic,sig:rc1000(d.sig*.6),eng:[]},ech:0,fini:null,score:null,prev:null,
      log:[{qui:'lui',t:rcPhrase(x,'ouverture')}]};
    x.etat='cours';}
  S.rc.sel=id;S.rc.nego=id;S.rc.confirmer=false;S.rc.anim=true;rendre();
}
function plFermer(){S.rc.nego=null;S.rc.confirmer=false;S.rc.sel=S.pl.selAvant;rendre();}

/* ---- Libérer : refus (blessé, à l'affiche), sinon confirmation en chiffres ---- */
function plLibererDemande(id){
  const c=parId(id);if(!c)return;
  S.pl.ficheSous=plActif()?S.pl.ficheSous:S.fiche;
  if(plAffiche(id))S.pl.refus={id,cas:'affiche'};
  else if(c.statut==='blesse')S.pl.refus={id,cas:'blesse'};
  else S.pl.liberer=id;
  rendre();
}
function plRefusHtml(){
  const {id,cas}=S.pl.refus,c=parId(id),x=plDe(id),IL=plIL(c),adv=plAdversaire(id),la=/ F$/.test(c.cat)?'la':'le';
  const t={affiche:[`Libérer ${esc(c.nom)}`,`Impossible : ${esc(c.nom)} est à l’affiche le 16 février${adv?` contre ${lien(adv)}`:''}.`,
      `Retire-${la} de la carte d’abord.`,`<button class="bb oct" data-plgo="carte"><span class="oct">Carte ›</span></button>`],
    blesse:[`Libérer ${esc(c.nom)}`,`Impossible : ${esc(c.nom)} est blessé${plE2(c)}, retour ${c.retour?afRetour(c.retour):'à fixer'}.`,
      `${IL} se soigne sous contrat. Attends son retour.`,`<button class="bb oct" data-plgo="infirmerie"><span class="oct">Infirmerie ›</span></button>`],
    rompu:[`Prolonger ${esc(c.nom)}`,`Impossible : pas de nouvelle offre avant le ${x.retour?plJour(x.retour):''}.`,
      `La négociation a été rompue le ${x.rompu?plJour(x.rompu):''}. ${plAffiche(id)?`${IL} finit son contrat le 16 février.`:c.contrat[0]>0?`${IL} finit son contrat : ${c.contrat[0]} combat${c.contrat[0]>1?'s':''}.`:''}`,'']}[cas];
  return `<div class="rc-voile pl-voile" data-plvoile>${pan(titre(t[0],`${esc(c.prenom)} ${esc(c.nom)}`)+`
    <div class="pl-refus">${t[1]}</div><div class="pl-quoi">${t[2]}</div>
    <div class="rc-pied">${t[3]}<button class="bb oct on" data-plrevenir data-pldefaut style="margin-left:${t[3]?'0':'auto'}"><span class="oct">Revenir</span></button></div>`,'width:760px','rc-conf pl-conf')}</div>`;
}
function plLibererHtml(){
  const c=parId(S.pl.liberer),a=plActuel(c),du=a.reste*a.fixe,h=plChezSplit(c),caisse=fiCaisse().c;
  const l=(t,v,s='')=>`<div class="rc-cl"><span>${t}</span><b>${v}${s?`<span class="pl-cls">${s}</span>`:''}</b></div>`;
  return `<div class="rc-voile pl-voile" data-plvoile>${pan(titre(`Libérer ${esc(c.nom)}`,`${esc(c.prenom)} ${esc(c.nom)}`)+`
    ${l('Qui',`${esc(courte(c.cat))} · ${c.rang==='C'?(/ F$/.test(c.cat)?'championne':'champion'):`n° ${c.rang}`} chez Split`,`depuis ${esc(c.depuis)} · ${h.n} combats, ${h.v} victoires`)}
    ${l('Combats restants',a.reste?`${a.reste}, annulé${a.reste>1?'s':''}`:'0')}
    ${l('Reste dû',plE(du),a.reste?`bourse fixe ${a.reste>1?`des ${a.reste} combats`:'du combat restant'}`:'')}
    ${l('Quand',`aujourd’hui, ${plJour(S.date)}`)}
    ${l('Caisse',`${plE(caisse)} → ${plE(caisse-du)}`)}
    <div class="pl-quoi">${plIL(c)} quitte l’effectif aujourd’hui et peut signer ailleurs. Irréversible.</div>
    <div class="rc-pied"><button class="bouton jaune cj" style="--c:14px;height:56px;font-size:30px" data-plok>Libérer</button>
      <button class="bb oct on" data-plrevenir data-pldefaut><span class="oct">Revenir</span></button></div>`,'width:760px','rc-conf pl-conf')}</div>`;
}

/* ---- Appliquer un accord : le contrat signé remplace le combat restant ---- */
function plSigner(x,o,date,neuf=true){
  const c=parId(x.id);if(!c)return;
  x.avant=x.avant||plActuel(c);
  /* Les soirées jouées gardent l'ancien contrat (fiBourse, finances.js). */
  if(!c.contratAvant)c.contratAvant=[...c.contrat];c.contratDepuis=date;x.signe={...o,eng:[...(o.eng||[])]};x.etat='prolonge';
  Object.assign(c,{contrat:[o.combats,plE(o.bourse+o.vic)],fixe:o.bourse,vicB:o.vic,prolonge:date,sigB:o.sig,
    engagements:(o.eng||[]).map(id=>((x.dem.dmd||[]).concat(x.dem0&&x.dem0.dmd||[],x.main?x.main.dem.dmd:[]).find(z=>z.id===id)||{t:id}).t)});
  if(c.statut==='refus'){c.statut='dispo';delete c.raison;delete c.action;}
  PL.prolonges[x.id]={o:x.signe,d:date.toISOString()};
  if(neuf&&o.sig)PL.versements.push({d:new Date(date),m:o.sig,id:x.id,t:'signature'});
  plMessage(x);
}
/** Le message de l'agent passe en « décision prise » : plus de point jaune, la corbeille revient. */
function plMessage(x){
  const m=typeof msPar==='function'&&msPar(x.id);if(!m||!m.rep)return;
  const c=parId(x.id);
  if(x.etat==='prolonge')m.rep[0][1]=`Prolongé le ${plJour(c.prolonge)} : ${x.signe.combats} combats, ${plE(x.signe.bourse)} par combat, ${plE(x.signe.vic)} à la victoire.`;
  else if(x.etat==='refus')m.rep[0][1]=`Pas d’accord. Nouvelle offre possible le ${plJour(x.retour)}.`;
  else if(c.libereSplit)m.rep[0][1]=`Libéré le ${plJour(c.libre)}.`;
  else return;
  m.choisi=0;
  if(typeof msSync==='function')msSync();
}
function plConclure(x){
  const c=parId(x.id),o=x.nego.offre;
  plSigner(x,o,new Date(S.date));plSauver();
  S.rc.confirmer=false;plFermer();
  toast(`${esc(c.prenom)} ${esc(c.nom)} prolonge : ${o.combats} combats, ${plE(o.bourse)} par combat.`);
  if(S.fiche)rendreFiche();
}
/** Libérer : il quitte l'effectif, la caisse paie la bourse fixe de ce qui reste, il arrive au marché des libres. */
function plLiberer(id,date,neuf=true){
  const c=parId(id),x=plDe(id);if(!c||!x)return;
  const a=plActuel(c),du=a.reste*a.fixe,i=COMBATTANTS.indexOf(c);if(i<0)return;
  COMBATTANTS.splice(i,1);
  if(!c.contratAvant)c.contratAvant=[...c.contrat];c.contratDepuis=date;
  if(typeof c.rang==='number')COMBATTANTS.forEach(y=>{if(y.cat===c.cat&&typeof y.rang==='number'&&y.rang>c.rang)y.rang--;});
  Object.assign(c,{ext:true,org:'Split',libre:new Date(date),contrat:[0,'—'],statut:'dispo',rangSplit:c.rang,rang:'–',libereSplit:true});
  delete c.raison;delete c.action;
  const h0=historique(c)[0];if(h0)c.dc={meth:h0.meth[0],adv:parNom(h0.adv,c.cat)};
  EXT.push(c);
  Object.assign(x,{type:'libre',profil:'ex',tag:'ex-Split',raison:`Libéré par Split le ${plJour(date)}.`,nego:null,etat:null,nouveau:true,
    /* Libéré, il ne demande pas plus que ce qu'il touchait chez Split : 3 combats, même bourse, 10 % à la signature. */
    dem:{bourse:a.fixe,combats:3,vic:a.vic,sig:rc1000(3*a.fixe*.1),dmd:x.main?x.main.dem.dmd.map(z=>({...z})):null}});
  if(!x.dem.dmd)x.dem.dmd=rcDemandes(c,x);x.agent=x.main?x.main.agent:x.agent;x.patience=x.agent[2];
  PL.liberes[id]=date.toISOString();
  if(neuf&&du)PL.versements.push({d:new Date(date),m:du,id,t:'libere'});
  plMessage(x);
}

/* ---- La couche par-dessus l'écran courant ----
   La ligne du haut : son prochain combat (ou le dernier du contrat), son historique chez Split, ce que l'agent sait des autres offres.
   Le contrat en cours est sous chaque levier (« aujourd’hui »), face à la demande. */
function plHaut(x){
  const c=parId(x.id),a=plActuel(c),h=plChezSplit(c),m=x.main,adv=plAdversaire(c.id);
  const f=(t,v)=>`<span class="pl-f"><span class="etiq">${t}</span><span class="pl-fv">${v}</span></span>`;
  const ail=m?m.ailleurs:'';
  return `<div class="pl-haut">
    ${f(a.reste===1?'Dernier combat du contrat':'Prochain combat',adv?`16 févr. contre ${lien(adv)}`:'Pas encore prévu')}
    ${f(`Chez Split depuis ${esc(c.depuis)}`,`${h.n} combats · ${h.v} victoires · ${h.primes} prime${h.primes>1?'s':''} de performance`)}
    ${f('Ailleurs',ail?`Contacté par ${esc(ail)}`:'Aucune offre connue')}</div>`;
}
function plCouche(calme=false){
  let el=$('#plCouche');const nego=plActif(),voile=S.pl.liberer||S.pl.refus;
  $('#zone').classList.toggle('pl-ouvert',nego);
  /* Un nom cliqué dans la négociation ouvre sa fiche par-dessus ; Retour ramène à la négociation. */
  $('#zone').classList.toggle('pl-fiche',!!(nego&&S.fiche&&S.fiche!==S.pl.ficheSous));
  if(!nego&&!voile){if(el)el.remove();return;}
  if(!el){el=document.createElement('div');el.id='plCouche';el.className='pl-couche';$('#zone').appendChild(el);}
  el.classList.toggle('pl-seul',!nego);el.classList.toggle('pl-calme',calme);el.classList.toggle('pl-voile-on',!!voile);
  const lg=el.querySelector('.rc-log'),ly=lg?lg.scrollTop:0;
  el.innerHTML=(nego?`<div class="rc pl">${plHaut(plDe(S.rc.nego))}${rcNegoHtml()}</div>`:'')+(S.pl.liberer?plLibererHtml():S.pl.refus?plRefusHtml():'');
  const l2=el.querySelector('.rc-log');if(l2)l2.scrollTop=ly;
  const d=el.querySelector('[data-pldefaut]');if(d)d.focus({preventScroll:true});
  if(nego){rcAnimer();if(!S.pl.demo)rcSauver();}
}
/* Pendant une négociation, un clic (levier, offre, réponse) ne redessine qu'elle : l'écran derrière et l'apparition ne se rejouent pas (retour du 25/11 : « ça clignote »). */
const plRendreBase=rendre;
let plVu=null;
rendre=function(){
  const cle=plActif()?[S.ecran,S.fiche,S.rc.nego,S.pl.liberer,S.pl.refus&&S.pl.refus.id].join('|'):null;
  if(cle&&cle===plVu&&$('#plCouche')){plCouche(true);return;}
  plRendreBase();plVu=cle;plCouche();
};
/* Retour ferme d'abord la confirmation, puis la négociation (qui reste ouverte), avant le reste. */
const plRetourBase=retour;
retour=function(){
  if(S.pl.liberer||S.pl.refus){S.pl.liberer=null;S.pl.refus=null;rendre();return;}
  if(plActif()&&S.fiche&&S.fiche!==S.pl.ficheSous){plRetourBase();return;}
  if(plActif()&&S.rc.attente)return;
  if(plActif()&&!S.rc.attente){if(S.rc.confirmer){S.rc.confirmer=false;rendre();return;}plFermer();return;}
  plRetourBase();
};
const plEnteteBase=rendreEntete;
rendreEntete=function(p){plEnteteBase(p);if(plActif()||S.pl.liberer||S.pl.refus){const b=$('#bRetour');if(b)b.disabled=false;}};
/* Changer d'écran referme la couche (la négociation reste ouverte dans son dossier). */
const plAllerBase=aller;
aller=function(ec){if(plActif()){S.rc.nego=null;S.rc.confirmer=false;S.rc.sel=S.pl.selAvant;}S.pl.liberer=null;S.pl.refus=null;plAllerBase(ec);};

/* ---- Clics ---- */
document.addEventListener('click',e=>{
  const t=e.target;let el;
  const stop=()=>{e.stopImmediatePropagation();e.preventDefault();};
  if((el=t.closest('[data-plprol]'))){stop();plOuvrir(el.dataset.plprol);return;}
  if((el=t.closest('[data-plliberer]'))){stop();plLibererDemande(el.dataset.plliberer);return;}
  if(!t.closest('#plCouche'))return;
  if(t.closest('[data-plrevenir]')||t.matches('[data-plvoile]')){stop();S.pl.liberer=null;S.pl.refus=null;rendre();return;}
  if((el=t.closest('[data-plgo]'))){stop();const g=el.dataset.plgo,id=S.pl.refus&&S.pl.refus.id;S.pl.refus=null;
    if(S.fiche)fermerFiche(false);
    if(g==='infirmerie'){S.eff.onglet='infirmerie';aller('effectif');}
    else{const k=id&&afEngages().get(id);if(k)Object.assign(S.af,{sel:k,tab:k[0]==='p'?'p':'m',vue:'liste'});aller('carte');}
    return;}
  if(t.closest('[data-plok]')){stop();const c=parId(S.pl.liberer),a=plActuel(c),du=a.reste*a.fixe;S.pl.liberer=null;
    plLiberer(c.id,new Date(S.date));plSauver();rendre();if(S.fiche===c.id)rendreFiche();
    toast(`${esc(c.prenom)} ${esc(c.nom)} quitte Split. ${plE(du)} versés aujourd’hui.`);return;}
},true);

/* ---- Lancement ----
   ?pl=<id> ouvre la négociation (ploffres=<n> offres faites, plbas=1 : toujours la même offre, jusqu'à la rupture, placcord=1 : ses chiffres repris jusqu'à l'accord, plconf=1 : la confirmation,
   plfait=1 : le contrat signé), plrompu=<id> (négociation rompue, puis Prolonger refusé), plliberer=<id> (confirmation),
   plrefus=<id> (Libérer refusé : à l'affiche ou blessé), pllibere=<id> (déjà libéré), plneuf=1 efface la clé. Une adresse pl… n'écrit rien. */
window.addEventListener('DOMContentLoaded',()=>{
  const q=new URLSearchParams(location.search);
  if(q.get('plneuf')){try{localStorage.removeItem(PL_CLE);}catch(e){}}
  S.pl.demo=[...q.keys()].some(k=>/^pl(?!neuf)/.test(k));
  if(!S.pl.demo){plCharger();
    /* Une rupture gardée par le Recrutement (rcCharger) : le message de l'agent reste en « décision prise ». */
    RC.forEach(x=>{if(x.type==='prol'&&x.etat==='prolonge'&&!PL.prolonges[x.id]){x.etat=null;x.nego=null;}});
    RC.forEach(x=>{if(x.type==='prol'&&x.etat==='refus'&&x.retour&&x.retour>S.date){x.rompu=x.rompu||new Date(x.retour.getTime()-864e5*60);plMessage(x);}});}
  if(q.get('plfiche'))S.onglet='Contrat';
  setTimeout(()=>{
    const id=q.get('pl');
    if(q.get('pllibere')){const c=parId(q.get('pllibere'));plLiberer(c.id,new Date(S.date));rendre();}
    if(q.get('plrompu')){const x=plDe(q.get('plrompu'));Object.assign(x,{etat:'refus',rompu:new Date(S.date),retour:new Date(S.date.getTime()+864e5*60)});plMessage(x);plOuvrir(x.id);}
    if(id){plOuvrir(id);const x=plDe(id),N=x&&x.nego;
      for(let i=0;N&&i<(+q.get('ploffres')||0);i++){if(N.fini)break;if(!q.get('plbas')){N.offre.bourse+=1000;N.offre.vic+=1000;N.offre.sig+=1000;}rcProposer(true);}
      if(N&&q.get('placcord')){for(let i=0;i<4&&!N.fini;i++){Object.assign(N.offre,{bourse:N.dem.bourse,vic:N.dem.vic,sig:N.dem.sig,combats:N.dem.combats,eng:N.dem.dmd.map(z=>z.id)});rcProposer(true);}}
      if(N&&N.fini==='accord'&&q.get('plconf')){S.rc.confirmer=true;rendre();}
      if(N&&N.fini==='accord'&&q.get('plfait'))plConclure(x);}
    if(q.get('plliberer'))plLibererDemande(q.get('plliberer'));
    if(q.get('plrefus'))plLibererDemande(q.get('plrefus'));
    if(q.get('fiche')){if(!S.fiche)ouvrirFiche(q.get('fiche'));else if(q.get('plfiche'))rendreFiche();}
  },60);
});
