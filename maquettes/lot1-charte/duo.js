"use strict";
/* ==== [ANCRE: MAQUETTE_DUO] — Le mode Duo : deux joueurs, un PC (brief du 18/10, docs/lots/DUO-T0 à T4).
   Trois parties validées séparément :
     A. l'entrée (menu Duo, noms, deux organisations sur la scène validée de Nouvelle partie) et le tableau de bord à deux ;
     B. la préparation de la super carte : enchères ouvertes à tour de rôle sur les libres, puis le draft « je place, tu réponds » ;
     C. la super carte (scènes validées de la Soirée : affiche, temps forts, résultat) et son bilan (score, argent, saison).
   Décisions d'Anthony du 18/10 : super carte tous les 3 mois (91 jours), 6 combats, 3 placements chacun ; enchères ouvertes
   à tour de rôle, ouverture à 3 × la bourse demandée, palier de 10 % de l'ouverture ; caisse stable hors super carte ;
   200 000 € au vainqueur, 50 000 € au perdant, 125 000 € chacun sur égalité ; pas de titre en jeu en version 1 ;
   le perdant de la dernière super carte commence (J2 à la première).
   Données : Split (cadre.js, Résultats, Finances), les sept autres organisations (Classements : clMonde), le marché
   (Recrutement : RC), la soirée (soiree.js : sdHero, sdFort, sdResultat). Rien n'est écrit : aucune clé, aucune sauvegarde.
   Préfixe du- (classes), du / DU_ (fonctions, constantes). Chargé après suivis.js, avant barre.js.
   Adresses : ?ecran=duo&duvue=noms|qg|encheres|draft|soiree|bilan, plus ?ecran=menu&mnvue=nouvelle&mnduo=1&duetape=a|b ;
   &duphase=debut|carte, &dunum=1..4, &dulot=0..2, &dumise=0..n, &ducas=gagne|personne|caisse, &dupicks=0..12, &duresume=1,
   &durefus=1, &duc=0..5, &dusoiree=direct|fort|resultat, &dures=a|b|egal, &duj1=…&duj2=…, &duorg1=…&duorg2=…   ==== */

const DU_PERIODE=91, DU_COMBATS=6, DU_CARTES=4, DU_LOTS=3, DU_CONTRAT=3, DU_PALIER=.10, DU_NOM_MAX=16;
const DU_GAIN={vainqueur:200000,perdant:50000,nul:125000};
const DU_DEBUT=new Date(2027,0,4);
/* Caisse de départ des sept autres organisations : hypothèses, à relire. Garden of Blood et MMA Korner reprennent les
   parties inventées de l'écran Parties (MN_AUTRES) ; Split lit les Finances validées. */
const DU_CAISSE={'Garden of Blood':1384500,'MMA Korner':212400,'Ultimate Rim':318000,'Fighting Pacific Championship':1120000,'Knuckle Gate':236000,'Pure Impact':2450000,'Undisputed Cage':905000};
/* Les super cartes d'avant (démonstration de la saison) : inventées, à relire. */
const DU_PASSE=[{g:'b',s:[2,4]},{g:'a',s:[4,2]},{g:'nul',s:[3,3]}];
/* Depuis le tableau de bord, Retour ramène aux parties du Duo (le jeu : Échap → menu). */
const duHistParties=()=>[{mn:JSON.stringify({vue:'parties',slot:1,org:'split',duo:true,choix:false,ecrase:false})}];
const DU_ROLES=['Combat principal','Co-principal','Combat 3','Combat 4','Combat 5','Combat 6'];
const duRelire='<span class="relire">à relire</span>';
const duPluriel=cat=>courte(cat).toLowerCase()+'s';

S.du={vue:'qg',etape:'a',phase:'debut',n:1,noms:{a:'Anthony',b:'François'},org:{a:'split',b:'mma-korner'},
  enc:null,picks:[],cat:null,so:{i:0,etat:'direct',revoir:false},conf:null,res:null,creer:false,avance:null,anim:true,demo:false,payes:{a:0,b:0},recrues:[]};

/* ---- Qui est qui ---- */
const duAutre=c=>c==='a'?'b':'a';
const duOrgO=c=>mnOrg(S.du.org[c]);
const duOrgN=c=>duOrgO(c).nom;
const duCol=c=>ogTeinte(duOrgN(c))[0];
const duJ=c=>S.du.noms[c]||(c==='a'?'Joueur 1':'Joueur 2');
const duCote=nom=>duOrgN('a')===nom?'a':duOrgN('b')===nom?'b':null;
/** La marque d'un joueur : un octogone à la couleur de son organisation, son nom, son organisation. Jamais la couleur seule. */
const duQui=(c,cl='')=>`<span class="du-qui ${cl}" style="--j:${duCol(c)}"><i class="octr"></i><b>${esc(duJ(c))}</b><span>${esc(duOrgN(c))}</span></span>`;
/** « de François », « d’Anthony » : l'élision devant une voyelle. */
const duDe=n=>/^[aeiouyhàâäéèêëîïôöûüœ]/i.test(n)?`d’${esc(n)}`:`de ${esc(n)}`;
const duNomJ=c=>`<b class="du-nj" style="--j:${duCol(c)}">${esc(duJ(c))}</b>`;
const duEur=v=>`${nb(v)} €`;
const duCourt=d=>`${d.getDate()===1?'1er':d.getDate()} ${MN_MOIS[d.getMonth()]} ${d.getFullYear()}`;
const duJM=d=>`${d.getDate()===1?'1er':d.getDate()} ${MN_MOIS[d.getMonth()]}`;
const duDateCarte=n=>new Date(2027,0,4+DU_PERIODE*n);
const duJours=(a,b)=>Math.round((b-a)/864e5);
/** Une date du jeu écrite « 18 avril » ou « 2 février » : en 2027 (la maquette se joue de janvier 2027 à janvier 2028). */
function duDateTxt(t){const m=/^(\d+)\s+([a-zéû]+)/i.exec(String(t||''));if(!m)return null;const i=MOIS.indexOf(m[2].toLowerCase());return i<0?null:new Date(2027,i,+m[1]);}

/* ---- Les deux effectifs : Split (Effectif validé) ou une organisation du monde (Classements) ---- */
const DU_ROS={};
function duRoster(nom){
  if(DU_ROS[nom])return DU_ROS[nom];
  let l;
  if(nom==='Split')l=COMBATTANTS.filter(c=>!c.ext);
  else{l=[];for(const s of ['H','F'])for(const [cat] of CATS[s])l.push(...clMonde(cat).filter(c=>c.ext&&c.org===nom));
    /* Le rang dans son organisation : le champion d'abord, puis l'ordre du mondial. */
    for(const s of ['H','F'])for(const [cat] of CATS[s]){let k=0;l.filter(c=>c.cat===cat).sort((x,y)=>x.mondial-y.mondial).forEach(c=>{c._duRang=c.champOrg?'C':++k;});}}
  return DU_ROS[nom]=l;
}
const duRang=c=>c.ext?(c._duRang||'–'):c.rang;
const duRangN=c=>{const r=duRang(c);return r==='C'?0:typeof r==='number'?r:99;};
const duRangHtml=c=>duRang(c)==='C'?AF_C:`<span class="af-rgb octr">${esc(duRang(c))}</span>`;
const duRosterDe=c=>duRoster(duOrgN(c));
const duCoteDe=f=>duRosterDe('a').includes(f)?'a':duRosterDe('b').includes(f)?'b':null;

/* ==== Ce qui s'est passé entre deux super cartes : les soirées des adjoints (une info par ligne) ==== */
const DU_EV={};
/** Les lignes d'une période, pour un côté. Split, 1re période : la soirée 63 validée (Résultats), puis la 64 (inventée). */
function duEvenements(c,n){
  const cle=duOrgN(c)+'|'+n;if(DU_EV[cle])return DU_EV[cle];
  const nom=duOrgN(c),d0=duDateCarte(n-1),l=[];
  if(nom==='Split'&&n===1){
    sdF('m0');
    l.push({d:new Date(2027,1,16),t:'soiree',txt:'Split Fight Night 63 · Lille',sor:63});
    ['m0','m1','m2','m3'].forEach(k=>{const f=sdF(k);l.push({d:new Date(2027,1,16),t:'res',W:f.W,L:f.L,cat:f.cat,meth:sdMeth(f.d),quand:f.d.meth==='Décision'?`${f.d.n} rounds`:`${rsOrd(f.d.rd)} round`});
      if(f.titre&&sdAv(f.W).rang!=='C')l.push({d:new Date(2027,1,16),t:'champ',f:f.W,cat:f.cat});});
    l.push({d:new Date(2027,1,16),t:'bles',f:parId('nana'),txt:'coupure à l’arcade',retour:new Date(2027,2,19)});
    l.push({d:new Date(2027,1,16),t:'bles',f:parId('bello'),txt:'KO, suspendu',retour:new Date(2027,3,18)});
    duSoireeInventee(c,l,new Date(2027,3,3),'Split Fight Night 64 · Bordeaux',2,true);
  }else{
    const ville={Split:'Lyon','Garden of Blood':'New York','MMA Korner':'Rotterdam','Ultimate Rim':'Melbourne','Fighting Pacific Championship':'Tokyo','Knuckle Gate':'Manchester','Pure Impact':'Dubaï','Undisputed Cage':'São Paulo'}[nom];
    const num=(nom==='Split'?62:30+(nom.length%9))+(n-1)*2;
    duSoireeInventee(c,l,new Date(d0.getTime()+32*864e5),`${nom==='Split'?'Split Fight Night':nom} ${num+1} · ${ville}`,3,false);
    duSoireeInventee(c,l,new Date(d0.getTime()+74*864e5),`${nom==='Split'?'Split Fight Night':nom} ${num+2} · ${ville}`,3,false);
  }
  return DU_EV[cle]=l;
}
/** Une soirée d'adjoint inventée : des combats internes, tirés dans l'effectif à la graine (à relire). */
function duSoireeInventee(c,l,d,titre,nbc,eviter63){
  const r=graine('duev'+titre),ros=duRosterDe(c).filter(f=>!(eviter63&&sdEngage63(f.id))&&!(f.statut==='blesse')&&duRangN(f)<20),pris=new Set();
  l.push({d,t:'soiree',txt:titre,invente:true});
  const cats=[...new Set(ros.map(f=>f.cat))].sort(()=>r()-.5);
  let k=0;
  for(const cat of cats){if(k>=nbc)break;
    const g=ros.filter(f=>f.cat===cat&&!pris.has(f.id)).sort((x,y)=>duRangN(x)-duRangN(y));if(g.length<2)continue;
    const i=Math.floor(r()*Math.max(1,g.length-1)),A=g[i],B=g[i+1];if(!A||!B||duRang(A)==='C'||duRang(B)==='C')continue;
    pris.add(A.id);pris.add(B.id);
    const wa=r()<.55,W=wa?A:B,L=wa?B:A,m=r(),meth=m<.3?'KO':m<.5?'Soumission':'Décision';
    l.push({d,t:'res',W,L,cat,meth:meth==='Décision'?(r()<.7?'Décision unanime':'Décision partagée'):meth,quand:meth==='Décision'?'3 rounds':`${rsOrd(1+Math.floor(r()*3))} round`,invente:true});
    if(meth==='KO'&&k===0)l.push({d,t:'bles',f:L,txt:'KO, suspendu',retour:new Date(d.getTime()+60*864e5),invente:true});
    if(duRangN(W)>2&&k===1)l.push({d,t:'rang',f:W,cat,rang:duRangN(W)-1,invente:true});
    k++;
  }
}
const sdEngage63=id=>S.af&&[...S.af.m,...S.af.p].some(f=>f.a===id||f.b===id);
/** Les soirées des adjoints sont jouées : bilans, séries, blessures (en mémoire seulement, rien n'est écrit). */
const DU_JOUE=new Set();
function duAppliquer(n){
  for(const c of ['a','b']){const cle=duOrgN(c)+'|'+n;if(DU_JOUE.has(cle))continue;DU_JOUE.add(cle);
    const l=duEvenements(c,n);
    if(duOrgN(c)==='Split'&&n===1){sdF('m0');rsJouer63();S.date=new Date(duDateCarte(n));}
    l.filter(e=>e.invente||!(duOrgN(c)==='Split'&&n===1)).forEach(e=>{
      if(e.t==='res'){e.W.v++;e.L.d++;e.W.serie=(e.W.serie+'v').slice(-5);e.L.serie=(e.L.serie+'d').slice(-5);e.W.dernier=e.L.dernier=e.d;}
      if(e.t==='bles'){e.f._duBles={txt:e.txt,retour:e.retour};}
    });
  }
}
/** Une ligne de « ce qui s'est passé » : une info par ligne, les noms cliquables. */
function duLigneEv(e){
  const rl=e.invente?duRelire:'';
  if(e.t==='soiree')return `<div class="du-ev soi"><span class="du-evd">${duJM(e.d)}</span><span class="du-evs">${esc(e.txt)}</span>${rl}</div>`;
  if(e.t==='res')return `<div class="du-ev"><span class="du-evd"></span><span class="du-evt">${lien(e.W)} <span class="sous">bat</span> ${lien(e.L)}</span><span class="du-evm">${esc(rsCatC(e.cat))} · ${esc(e.meth)}, ${esc(e.quand)}</span></div>`;
  if(e.t==='champ')return `<div class="du-ev"><span class="du-evd"></span><span class="du-evt">${CL_C}${lien(e.f)}</span><span class="du-evm">champion${/ F$/.test(e.cat)?'ne':''} des ${esc(duPluriel(e.cat))}</span></div>`;
  if(e.t==='bles')return `<div class="du-ev"><span class="du-evd"></span><span class="du-evt neg">${ico('medical',18)}${lien(e.f)}</span><span class="du-evm">${esc(e.txt)}, ${e.txt.includes('suspendu')?'apte':'retour'} le ${duJM(e.retour)}</span></div>`;
  if(e.t==='rang')return `<div class="du-ev"><span class="du-evd"></span><span class="du-evt"><span class="cl-up">▲</span>${lien(e.f)}</span><span class="du-evm">n° ${e.rang} des ${esc(duPluriel(e.cat))}</span></div>`;
  return '';
}

/* ==== Argent : la caisse ne bouge qu'avec la super carte (gains) et les enchères (prix payé) ==== */
/* La caisse de Split au 4 janvier, figée : les soirées des adjoints ne la font plus bouger (décision du 18/10). */
let DU_SPLIT0=null;
function duCaisseBase(c){const nom=duOrgN(c);if(nom==='Split'){if(DU_SPLIT0===null)DU_SPLIT0=fiCaisse().c;return DU_SPLIT0;}return DU_CAISSE[nom]||300000;}
const duGain=(g,c)=>g==='nul'?DU_GAIN.nul:g===c?DU_GAIN.vainqueur:DU_GAIN.perdant;
function duPasses(){return DU_PASSE.slice(0,S.du.n-1);}
function duCaisse(c){let v=duCaisseBase(c);duPasses().forEach(p=>{v+=duGain(p.g,c);});v-=S.du.payes[c]||0;if(S.du.vue==='bilan')v+=duGain(duResultat().g,c);return v;}
/** Le score de la saison : super cartes gagnées par chacun (une égalité ne compte pour personne). */
function duSaison(avecCourante){
  const l=duPasses().map(p=>p.g);if(avecCourante)l.push(duResultat().g);
  return {a:l.filter(x=>x==='a').length,b:l.filter(x=>x==='b').length,l};
}

/* ==== B1. Les enchères : les meilleurs libres du marché du Recrutement (RC), un par catégorie ==== */
function duLots(){
  const vu=new Set(),out=[];
  RC.filter(x=>x.type==='libre').map(x=>({x,c:parId(x.id)})).filter(o=>o.c&&o.c.org!==duOrgN('b')).sort((p,q)=>p.c.mondial-q.c.mondial)
    .forEach(o=>{if(out.length>=DU_LOTS||vu.has(o.c.cat))return;vu.add(o.c.cat);
      const b=o.x.dem.bourse,ouv=DU_CONTRAT*b;out.push({id:o.c.id,b,ouverture:ouv,pas:Math.max(1000,Math.ceil(ouv*DU_PALIER/1000)*1000)});});
  return out;
}
/** Le joueur qui commence : le perdant de la dernière super carte ; J2 à la première et après une égalité. */
function duPremier(){const p=duPasses();const g=p.length?p[p.length-1].g:'nul';return g==='a'?'b':g==='b'?'a':'b';}
function duEncNeuve(){return {i:0,lots:duLots().map(l=>Object.assign(l,{prix:0,meneur:null,tour:duPremier(),passes:0,fini:false,gagnant:null,mises:[],refus:false}))};}
const duLot=()=>S.du.enc&&S.du.enc.lots[S.du.enc.i];
const duProchainPrix=L=>L.meneur===null?L.ouverture:L.prix+L.pas;
/** Miser : refusé si la caisse ne suit pas (la ligne dit pourquoi, rien ne change). */
function duMiser(){
  const L=duLot();if(!L||L.fini)return;const p=duProchainPrix(L);
  if(duCaisse(L.tour)<p){L.refus=true;rendre();return;}
  L.refus=false;L.prix=p;L.meneur=L.tour;L.passes=0;L.mises.push({c:L.tour,p});L.tour=duAutre(L.tour);rendre();
  duFlash('.du-prix .T');
}
/** Abandonner (quelqu'un mène : il signe) ou passer (personne n'a misé : au second passage, le combattant reste libre). */
function duAbandonner(){
  const L=duLot();if(!L||L.fini)return;L.refus=false;
  if(L.meneur!==null){L.fini=true;L.gagnant=L.meneur;L.abandon=L.tour;S.du.payes[L.gagnant]+=L.prix;S.du.recrues.push({c:L.gagnant,id:L.id,prix:L.prix,b:L.b});}
  else{L.passes++;L.mises.push({c:L.tour,p:0});if(L.passes>=2)L.fini=true;else L.tour=duAutre(L.tour);}
  rendre();
}

/* ==== B2. Le draft « je place, tu réponds » : tout se lit sur la liste des choix (Retour défait le dernier) ==== */
function duDraft(picks=S.du.picks){
  let tour=duPremier(),att='place';const combats=[];
  for(const p of picks){
    if(att==='place'){combats.push({place:tour,a:null,b:null,cat:parId(p).cat});combats[combats.length-1][tour]=p;tour=duAutre(tour);att='reponse';}
    else{combats[combats.length-1][tour]=p;att='place';}
  }
  const fini=combats.length===DU_COMBATS&&att==='place';
  return {combats,tour,att:fini?null:att,fini};
}
/** Pourquoi un combattant ne peut pas être choisi : toujours une raison écrite (Carte validée). */
function duIndispo(f,c,D=duDraft()){
  const k=D.combats.findIndex(x=>x.a===f.id||x.b===f.id);
  if(k>=0)return {txt:`Sur la carte · ${DU_ROLES[DU_COMBATS-1-k].toLowerCase()}`,ph:`est déjà sur la carte (${DU_ROLES[DU_COMBATS-1-k].toLowerCase()})`};
  const jour=duDateCarte(S.du.n);
  if(f._duBles&&f._duBles.retour>jour){const su=f._duBles.txt.includes('suspendu');return {txt:`${su?'Suspendu · apte':'Blessé · retour'} le ${duJM(f._duBles.retour)}`,ph:`est ${su?'suspendu':'blessé'} jusqu’au ${duJM(f._duBles.retour)}`,neg:1};}
  if(!f.ext&&f.statut==='refus')return {txt:'Refuse : attend une prolongation',ph:'refuse de combattre : il attend une prolongation',neg:0};
  if(!f.ext&&f.statut==='suspendu'){const r=duDateTxt(f.retour);if(!r||r>jour)return {txt:`Suspendu · apte le ${f.retour}`,ph:`est suspendu jusqu’au ${f.retour}`,neg:1};}
  if(!f.ext&&f.statut==='blesse'){const r=duDateTxt(f.retour);if(!r||r>jour){const su=/suspendu/i.test(f._rsMed||'');return {txt:`${su?'Suspendu · apte':'Blessé · retour'} le ${f.retour}`,ph:`est ${su?'suspendu':'blessé'} jusqu’au ${f.retour}`,neg:1};}}
  return null;
}
const duDispos=(c,D=duDraft())=>duRosterDe(c).filter(f=>!duIndispo(f,c,D));
/** En placement, une catégorie sans personne de libre en face est refusée (DUO-T1 : mgmtDuoPlacables). */
function duRefusPlace(f,c,D=duDraft()){const i=duIndispo(f,c,D);if(i)return i;
  if(!duDispos(duAutre(c),D).some(x=>x.cat===f.cat))return {txt:`Personne en face chez ${duOrgN(duAutre(c))}`,ph:`n’a personne en face : ${duOrgN(duAutre(c))} n’a plus de ${duPluriel(f.cat)} disponible`};return null;}
function duChoisir(id){
  const D=duDraft(),c=D.tour,f=parId(id);if(!f||D.fini)return;
  const refus=D.att==='place'?duRefusPlace(f,c,D):(duIndispo(f,c,D)||(f.cat!==D.combats[D.combats.length-1].cat?{txt:'Autre catégorie',ph:`ne combat pas en ${afCatMin(D.combats[D.combats.length-1].cat)}`}:null));
  if(refus){toast(`Impossible : ${esc(f.prenom)} ${esc(f.nom)} ${esc(refus.ph)}.`);return;}
  duPas(()=>{S.du.picks.push(id);const N=duDraft();if(N.att==='reponse')S.du.cat=f.cat;
    /* Au placement suivant, une catégorie où il n'y a plus personne à placer laisse la place à la première qui en a. */
    else if(N.att==='place'&&!duRosterDe(N.tour).some(x=>x.cat===S.du.cat&&!duRefusPlace(x,N.tour,N)))S.du.cat=null;});
}
/** Démonstration : la suite des choix la plus simple (le mieux classé, une catégorie nouvelle ; en réponse, le plus proche au mondial). */
function duAuto(n){
  S.du.picks=[];
  for(let i=0;i<n;i++){const D=duDraft();if(D.fini)break;const c=D.tour;
    if(D.att==='place'){const pris=new Set(D.combats.map(x=>x.cat));
      const l=duRosterDe(c).filter(f=>!duRefusPlace(f,c,D)).sort((x,y)=>(pris.has(x.cat)-pris.has(y.cat))||duRangN(x)-duRangN(y)||x.mondial-y.mondial);
      if(!l.length)break;S.du.picks.push(l[(i*3)%Math.min(4,l.length)].id);}
    else{const cat=D.combats[D.combats.length-1].cat,cible=parId(D.combats[D.combats.length-1][duAutre(c)]);
      const l=duDispos(c,D).filter(f=>f.cat===cat).sort((x,y)=>Math.abs(x.mondial-cible.mondial)-Math.abs(y.mondial-cible.mondial));if(!l.length)break;S.du.picks.push(l[0].id);}
  }
}

/* ==== C. La super carte : chaque combat est joué d'avance (comme mgmtDuoJouer), puis regardé dans les scènes de la Soirée ==== */
const DU_DET={KO:['crochet du gauche','coup de genou','direct du droit','arrêt de l’arbitre sur coups'],Soumission:['étranglement arrière','guillotine','clé de bras','triangle']};
let DU_RES=null;
const DU_MED0={},DU_RET={};
/** Les six combats joués : au format des Résultats (RS_63), pour réutiliser sdHero, sdFort et sdResultat sans les toucher. */
function duJouer(){
  if(DU_RES&&DU_RES.cle===S.du.picks.join(',')+S.du.res+S.du.n)return DU_RES;
  sdF('m0');
  const D=duDraft(),combats=D.combats.length===DU_COMBATS?D.combats:duDraft((duAuto(12),S.du.picks)).combats;
  const out=combats.map((x,i)=>{const A=parId(x.a),B=parId(x.b),R=i===DU_COMBATS-1?5:3,r=graine('du'+S.du.n+A.id+B.id);
    const pA=1/(1+Math.exp((A.mondial-B.mondial)/14));return {A,B,R,r,pA,g:r()<pA?'a':'b'};});
  /* Démonstration d'un score : &dures=a|b|egal retourne les combats les plus serrés, rien d'autre. */
  const veut=S.du.res,cnt=()=>out.filter(o=>o.g==='a').length;
  const ordre=[...out].sort((p,q)=>Math.abs(p.pA-.5)-Math.abs(q.pA-.5));
  if(veut==='egal')for(const o of ordre){if(cnt()===3)break;if(cnt()>3&&o.g==='a')o.g='b';else if(cnt()<3&&o.g==='b')o.g='a';}
  if(veut==='a')for(const o of ordre){if(cnt()>=4)break;if(o.g==='b')o.g='a';}
  if(veut==='b')for(const o of ordre){if(cnt()<=2)break;if(o.g==='a')o.g='b';}
  const F=out.map((o,i)=>duCombat(o,i));
  return DU_RES={cle:S.du.picks.join(',')+S.du.res+S.du.n,F};
}
/** Un combat au format des Résultats : méthode, rounds, cartes des juges, frappes par round, rangs d'après. */
function duCombat(o,i){
  const {A,B,R,r,g}=o,l=g==='a'?'b':'a',m=r(),meth=m<.28?'KO':m<.46?'Soumission':'Décision',dec=meth==='Décision';
  const rd=dec?R:1+Math.floor(r()*R),tps=dec?'5:00':`${Math.floor(r()*4)+(rd===1?1:0)}:${String(Math.floor(r()*60)).padStart(2,'0')}`;
  const nj=dec?R:rd-1,unan=r()<.72,j=[0,1,2].map(q=>{const s=[];const besoin=Math.floor(nj/2)+1;
    for(let x=0;x<nj;x++)s.push(r()<.62?g:l);
    if(dec){const gw=q===2&&!unan?l:g;let w=s.filter(y=>y===gw).length;for(let x=0;x<nj&&w<besoin;x++)if(s[x]!==gw){s[x]=gw;w++;}
      const ot=gw===g?l:g;let w2=s.filter(y=>y===ot).length;for(let x=nj-1;x>=0&&w2>=besoin;x--)if(s[x]===ot){s[x]=gw;w2--;}}
    return s.join('');});
  const np=dec?R:rd,co=[0,1].map(s=>Array.from({length:np},()=>5+Math.floor(r()*14)+((s===0)===(g==='a')?3:0)));
  const sol=[Math.floor(r()*3),Math.floor(r()*3)];
  const ra=duRang(A),rb=duRang(B),monte=x=>typeof x==='number'&&x>1?x-1:x,descend=x=>typeof x==='number'?x+1:x;
  const d={g,meth,det:dec?(unan?'unanime':'partagée'):DU_DET[meth][Math.floor(r()*4)],rd,tps,n:R,j,co,sol,
    nr:{a:g==='a'?monte(ra):descend(ra),b:g==='b'?monte(rb):descend(rb)},nm:{a:Math.max(1,A.mondial+(g==='a'?-1-Math.floor(r()*3):1+Math.floor(r()*3))),b:Math.max(1,B.mondial+(g==='b'?-1-Math.floor(r()*3):1+Math.floor(r()*3)))}};
  const k='du'+i,W=g==='a'?A:B,L=g==='a'?B:A;
  const f={k,i,A,B,d,W,L,ws:g,ls:l,cat:A.cat,titre:false,rounds:R,role:DU_ROLES[DU_COMBATS-1-i]};
  SD_F[k]=f;delete f._mo;delete f._rs;
  for(const c of [A,B])SD_AV[c.id]={rang:duRang(c),mondial:c.mondial,v:c.v,d:c.d,serie:c.serie};
  /* Les suspensions de la super carte passent par la table de la Soirée, sans jamais effacer celles de la soirée 63. */
  for(const c of [A,B])if(!(c.id in DU_MED0))DU_MED0[c.id]=SD_MED[c.id]||null;
  for(const c of [A,B]){if(DU_MED0[c.id])SD_MED[c.id]=DU_MED0[c.id];else delete SD_MED[c.id];delete DU_RET[c.id];}
  if(meth==='KO'){const ret=new Date(duDateCarte(S.du.n).getTime()+60*864e5);SD_MED[L.id]=['KO, suspendu 60 jours',`${ret.getDate()} ${MOIS[ret.getMonth()]}`];DU_RET[L.id]=ret;}
  return f;
}
/** Le nom court d'un combattant sur une carte : l'initiale du prénom si un autre combattant de la carte porte le même nom. */
function duNomCarte(c,liste){return liste.some(x=>x&&x!==c&&x.nom===c.nom)?`${c.prenom.charAt(0)}. ${c.nom}`:c.nom;}
const duTous=F=>F.flatMap(f=>[f.A,f.B]);
const duSdN=(c,L)=>`<span class="nom" data-fiche="${c.id}">${esc(duNomCarte(c,L))}</span>`;
/* La Soirée validée garde son discours pour Split ; la super carte n'en a pas (DUO-T4 : avant, regarder, résultat). */
/* Le tapis de l'arène porte le nom de la soirée : ici la super carte. */
SD_TAPIS=()=>S.ecran==='duo'?['SUPER CARTE',String(S.du.n)]:null;
const duDiscoursBase=sdDiscours;
sdDiscours=function(k){return /^du/.test(k)?null:duDiscoursBase(k);};
/** Le score de la soirée jusqu'au combat i compris (seulement s'il est montré) : J1 – J2. */
function duScore(jusque){const F=duJouer().F.slice(0,jusque);return {a:F.filter(f=>f.d.g==='a').length,b:F.filter(f=>f.d.g==='b').length};}
function duResultat(){const s=duScore(DU_COMBATS);return {s,g:s.a>s.b?'a':s.b>s.a?'b':'nul'};}
const duVu=()=>S.du.so.etat==='resultat'?S.du.so.i+1:S.du.so.i;

/* ==== Le cadre : sans barre, l'en-tête du jeu (Retour, Avant, plaque, date, super carte, bouton jaune) ==== */
function duEntete(plaque,bouton){
  const d=S.date,n=S.du.n;
  $('#entete').innerHTML=`<button class="retour" id="bRetour" title="Retour" ${S.hist.length||S.fiche?'':'disabled'}>${ico('retour',28)}</button>
    <button class="retour" id="bAvant" title="Avancer" ${S.futur.length?'':'disabled'}>${ico('avant',28)}</button>
    <div class="plaque">${esc(plaque)}</div><span style="margin-left:auto"></span>
    <div class="boite"><span class="T">${d.getDate()===1?'1er':d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()}</span></div>
    <div class="boite"><span class="T">Super carte <span style="color:var(--rouge-vif)">${n}</span><span class="du-sur">/${DU_CARTES}</span></span></div>
    ${bouton?`<button class="bouton jaune cj cont-carre" id="bContinuer" style="height:64px;font-size:40px">${esc(bouton)} ${ico('avant',30,3)}</button>`:''}`;
}
/** Le bandeau du tour : à qui c'est, en grand, à sa couleur et avec son nom (jamais la couleur seule). */
const duTour=(c,txt,droite='')=>`<div class="du-tour du-a" style="--j:${duCol(c)}"><span class="du-tour-e">${ogEmb(duOrgN(c),58)}</span>
  <div class="du-tour-t"><span class="T">${txt}</span><span class="du-tour-o">${esc(duOrgN(c))}</span></div><div class="du-tour-d">${droite}</div></div>`;

/* ==== A. Les noms (avant la scène des organisations) ==== */
function duNomsHtml(){
  const ch=c=>`<label class="du-champ"><span class="etiq">${c==='a'?'Joueur 1':'Joueur 2'}</span><span class="du-in oct"><input class="oct" id="duNom${c}" maxlength="${DU_NOM_MAX}" autocomplete="off" spellcheck="false" value="${esc(S.du.noms[c])}" placeholder="${c==='a'?'Joueur 1':'Joueur 2'}"></span></label>`;
  return `${mnTunHtml('Split','doux')}<div class="mn-voil-g"></div><div class="du-noms du-a">${pan(`<div class="pt"><h2>Qui joue ?</h2><span class="ment">Deux joueurs · un PC</span></div>
    <div class="du-ch2">${ch('a')}${ch('b')}</div>
    <p class="du-noms-p">Chacun son organisation, ses soirées jouées par son adjoint. Tous les 3 mois, une super carte de 6 combats l’un contre l’autre.${duRelire}</p>
    <div class="du-noms-err" id="duErr" role="alert"></div>
    <div class="du-noms-b"><button class="bouton jaune cj oct" data-du="noms-ok">Continuer ${ico('avant',30,3)}</button></div>`)}</div>`;
}
function duNomsValider(){
  const v=c=>{const e=$('#duNom'+c);return (e?e.value:'').replace(/\s+/g,' ').trim().slice(0,DU_NOM_MAX);};
  const a=v('a')||'Joueur 1',b=v('b')||'Joueur 2';
  if(a.toLocaleLowerCase('fr')===b.toLocaleLowerCase('fr')){const e=$('#duErr');if(e)e.textContent='Deux noms différents, pour savoir à qui c’est le tour.';$('#duNomb').focus();return;}
  duPas(()=>{S.du.noms={a,b};S.du.etape='a';S.ecran='menu';Object.assign(S.mn,{vue:'nouvelle',org:S.du.org.a,conf:null,anim:true,duo:true});S.du.creer=true;});
}

/* ==== A. Le tableau de bord à deux ==== */
function duColonne(c){
  const o=duOrgO(c),og=ogClasse().find(x=>x.nom===o.nom),sai=duSaison(false);
  const n=S.du.n,d0=duDateCarte(n-1),phase=S.du.phase;
  const av=S.du.avance,lim=av?av.jour:phase==='debut'?d0:duDateCarte(n);
  const ev=phase==='debut'&&!av?[]:duEvenements(c,n).filter(e=>e.d<=lim);
  const depuis=n===1?'4 janv. 2027':duCourt(d0);
  const liste=ev.length?ev.map(duLigneEv).join(''):`<div class="du-vide">${av?'Les adjoints préparent leurs soirées.':`Rien depuis le ${depuis}.`}</div>`;
  const f=(l,v,s='')=>`<div class="du-st"><span class="etiq">${l}</span><b class="T">${v}</b>${s?`<small>${s}</small>`:''}</div>`;
  return `<div class="du-col du-a ${c}" style="--j:${duCol(c)}">${pan(`<div class="du-band"><i class="du-bi" style="filter:${ogTeinte(o.nom)[1]||'none'} brightness(.55)"></i>
      <div class="du-bh"><span class="etiq">${c==='a'?'Joueur 1':'Joueur 2'}</span><b class="du-bj">${esc(duJ(c))}</b></div>
      <div class="du-bn">${ogEmb(o.nom,76)}<span class="T" style="font-size:${mfCorps(o.nom,560,96,44)}px">${esc(o.nom)}</span></div></div>
    <div class="du-sts">${f('Place',`${og?og.rang:'–'}/8`)}${f('En caisse',duEur(duCaisse(c)))}${f('Effectif',nb(o.eff),'combattants')}${f('Saison',`${sai[c]}`,sai[c]>1?'super cartes gagnées':'super carte gagnée')}</div>
    <div class="du-evh"><span class="etiq">Depuis le ${esc(depuis)}</span>${ev.length?`<span class="du-evn">${ev.filter(e=>e.t==='soiree').length} soirée${ev.filter(e=>e.t==='soiree').length>1?'s':''}</span>`:''}</div>
    <div class="defile du-evl" id="duEv${c}">${liste}</div>`,'height:100%')}</div>`;
}
function duOctoSaison(k,courante){
  const p=DU_PASSE[k],n=k+1,d=duDateCarte(n),jouee=n<S.du.n||(n===S.du.n&&courante);
  const g=jouee?(n<S.du.n?p.g:duResultat().g):null,s=jouee?(n<S.du.n?p.s:[duResultat().s.a,duResultat().s.b]):null;
  const st=g&&g!=='nul'?`style="--j:${duCol(g)}"`:'';
  return `<div class="du-oc ${jouee?'joue':''} ${n===S.du.n&&!jouee?'proch':''} ${g?'g-'+g:''}" ${st}><span class="du-oc-o octr"><span class="octr"><b class="T">${n}</b></span></span>
    <span class="du-oc-d">${duJM(d)}</span><span class="du-oc-r">${jouee?(g==='nul'?`Égalité · ${s[0]}–${s[1]}`:`<b>${esc(duJ(g))}</b> · ${s[0]}–${s[1]}`):n===S.du.n?'Prochaine':'À venir'}</span></div>`;
}
function duCentre(){
  const n=S.du.n,d=duDateCarte(n),sai=duSaison(false),j=duJours(S.date,d),av=S.du.avance;
  const quand=av?'Les adjoints jouent les soirées':S.du.phase==='carte'?'C’est aujourd’hui':`Dans ${j} jours`;
  const prem=duPremier();
  return `<div class="du-ctr du-a">${pan(`<div class="pt"><h2>Saison 1</h2><span class="ment">2027</span></div>
    <div class="du-sc"><div class="du-sc-j a" style="--j:${duCol('a')}">${esc(duJ('a'))}</div><div class="du-sc-n T"><span style="--j:${duCol('a')}">${sai.a}</span><i>–</i><span style="--j:${duCol('b')}">${sai.b}</span></div><div class="du-sc-j b" style="--j:${duCol('b')}">${esc(duJ('b'))}</div></div>
    <div class="du-ocs">${[0,1,2,3].map(k=>duOctoSaison(k,false)).join('')}</div>
    <div class="du-ctr-a"><span class="etiq">Super carte · 6 combats</span><div><span>Vainqueur</span><b>${duEur(DU_GAIN.vainqueur)}</b></div><div><span>Perdant</span><b>${duEur(DU_GAIN.perdant)}</b></div><div><span>Égalité</span><b>${duEur(DU_GAIN.nul)} chacun</b></div></div>
    <div class="du-pr"><span class="etiq">Super carte ${n}</span><b class="T">${duCourt(d)}</b><span class="du-pr-q ${av?'':S.du.phase==='carte'?'auj':''}">${quand}</span>
      ${av?`<div class="du-av"><i id="duAvB" style="width:${(av.p*100).toFixed(1)}%"></i></div><span class="du-av-d" id="duAvD">${duCourt(av.jour)}</span>`:''}
      ${S.du.phase==='carte'&&!av?`<div class="du-pr-t" style="--j:${duCol(prem)}">${duNomJ(prem)} ouvre les enchères${n===1?'':` · ${duPasses().length&&duPasses()[duPasses().length-1].g!=='nul'?'perdant de la dernière':'après une égalité'}`}</div>`:''}</div>`,'height:100%')}</div>`;
}
function duQGHtml(){return `<div class="du-qg">${duColonne('a')}${duCentre()}${duColonne('b')}</div>`;}
/** Avancer jusqu'à la super carte : le jour défile, les soirées des adjoints arrivent de chaque côté ; un clic passe. */
function duAvancer(){
  if(S.du.avance)return;
  const d0=new Date(S.date),d1=duDateCarte(S.du.n),T=duCalme()?0:3600,t0=performance.now();
  S.hist.push({du:duEtat()});S.futur=[];
  S.du.avance={jour:new Date(d0),p:0};rendre();
  const fin=()=>{cancelAnimationFrame(duAvancer.raf);S.du.avance=null;duAppliquer(S.du.n);S.du.phase='carte';S.date=new Date(d1);S.du.anim=true;rendre();};
  duAvancer.fin=fin;
  if(!T){fin();return;}
  let nb0={a:-1,b:-1};
  const f=t=>{if(!S.du.avance)return;const k=Math.min(1,(t-t0)/T),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
    const j=new Date(d0.getTime()+Math.round((d1-d0)/864e5*e)*864e5);S.du.avance.jour=j;S.du.avance.p=k;S.date=j;
    const b=$('#duAvB');if(b)b.style.width=(k*100).toFixed(1)+'%';const dd=$('#duAvD');if(dd)dd.textContent=duCourt(j);
    const h=$('#entete .boite .T');if(h)h.textContent=`${j.getDate()===1?'1er':j.getDate()} ${MOIS[j.getMonth()]} ${j.getFullYear()}`;
    for(const c of ['a','b']){const l=duEvenements(c,S.du.n).filter(x=>x.d<=j);if(l.length!==nb0[c]){nb0[c]=l.length;const el=$('#duEv'+c);
      if(el){el.innerHTML=l.length?l.map(duLigneEv).join(''):'<div class="du-vide">Les adjoints préparent leurs soirées.</div>';el.scrollTop=el.scrollHeight;
        const last=el.lastElementChild;if(last&&l.length)last.animate([{opacity:0,transform:'translateX(-14px)'},{opacity:1,transform:'none'}],{duration:300,easing:'ease-out'});}}}
    if(k<1)duAvancer.raf=requestAnimationFrame(f);else setTimeout(fin,350);};
  duAvancer.raf=requestAnimationFrame(f);
}
const duCalme=()=>matchMedia('(prefers-reduced-motion:reduce)').matches&&!(S.mn&&S.mn.mouv)&&!document.body.classList.contains('mv-force');

/* ==== B1. L'écran des enchères ==== */
function duJoueurEnc(c,L){
  const mene=L.meneur===c&&!L.fini,tour=L.tour===c&&!L.fini;
  const recr=S.du.recrues.filter(r=>r.c===c);
  const dern=[...L.mises].reverse().find(m=>m.c===c);
  const etat=L.fini?(L.gagnant===c?`<span class="du-pe v">Signe pour ${duEur(L.prix)}</span>`:L.gagnant?`<span class="du-pe">Abandonne à ${duEur(L.prix)}</span>`:'<span class="du-pe">Passe</span>')
    :mene?`<span class="du-pe v">Mène à ${duEur(L.prix)}</span>`:dern&&dern.p===0?'<span class="du-pe">A passé</span>':tour?'<span class="du-pe j">Son tour</span>':dern?`<span class="du-pe">A misé ${duEur(dern.p)}</span>`:'<span class="du-pe">N’a pas misé</span>';
  return `<div class="du-je du-a ${c} ${tour?'tour':''}" style="--j:${duCol(c)}">${pan(`<div class="du-je-h">${ogEmb(duOrgN(c),54)}<div><b class="du-je-n">${esc(duJ(c))}</b><span>${esc(duOrgN(c))}</span></div></div>
    <div class="du-je-c"><span class="etiq">En caisse</span><b class="T">${duEur(duCaisse(c))}</b></div>
    <div class="du-je-e">${etat}</div>
    <div class="du-je-r"><span class="etiq">Recrues des enchères</span>${recr.length?recr.map(r=>{const f=parId(r.id);return `<div class="du-je-rl">${lien(f)}<span>${duEur(r.prix)}</span></div>`;}).join(''):'<span class="sous">Aucune</span>'}</div>`,'height:100%')}</div>`;
}
function duEncheresHtml(){
  const E=S.du.enc,L=duLot();
  if(!L){/* Les enchères sont finies : ce que chacun a signé (on y revient par Retour depuis la carte). */
    const l=E&&E.lots.length?E.lots.map(x=>{const f=parId(x.id);return `<div class="du-fin-l">${lien(f)}<span class="sous">${esc(rsCatC(f.cat))}</span>${x.gagnant?`${duQui(x.gagnant)}<b class="T">${duEur(x.prix)}</b>`:'<span class="sous">reste libre</span>'}</div>`;}).join(''):'<div class="du-vide">Aucun libre à mettre aux enchères.</div>';
    return `<div class="du-enc"><div class="du-tour du-a fini"><div class="du-tour-t"><span class="T">Enchères terminées</span><span class="du-tour-o">Super carte ${S.du.n}</span></div></div>
      <div class="du-fin du-a">${pan(titre('Signés aux enchères')+l)}</div></div>`;}
  const f=parId(L.id),p=duProchainPrix(L),c=L.tour,manque=p-duCaisse(c);
  const lots=E.lots.map((x,i)=>{const g=x.fini?(x.gagnant?`<i class="octr" style="background:${duCol(x.gagnant)}"></i>${esc(duJ(x.gagnant))}`:'reste libre'):i===E.i?'en cours':'à venir';
    return `<span class="du-lt oct ${i===E.i?'on':''}"><b>${i+1}</b>${esc(parId(x.id).nom)}<small>${g}</small></span>`;}).join('');
  const droite=`<div class="du-lots"><span class="etiq">Combattant ${E.i+1}/${E.lots.length}</span>${lots}</div>`;
  const tour=L.fini?duTour(L.gagnant||c,L.gagnant?`${esc(duJ(L.gagnant))} signe ${esc(f.nom)}`:`${esc(f.nom)} reste libre`,droite)
    :duTour(c,L.meneur===null?`À ${esc(duJ(c))} de miser`:`À ${esc(duJ(c))} de surenchérir`,droite);
  const fiche=`<div class="du-lf">${pan(`<div class="du-lf-ban"><i class="du-lf-img"></i>
      <div class="du-lf-l1">${esc(f.prenom)}${f.surnom?` « ${esc(f.surnom)} »`:''}</div>
      <div class="T du-lf-n" style="${afNomStyle(f.nom,afTaille(f.nom,150,760))}">${lien(f).replace(`${esc(f.prenom)} `,'')}</div>
      <div class="du-lf-l3"><span class="T">${bilan(f)}</span>${serie(f.serie)}</div></div>
    <div class="du-lf-g"><div><span class="etiq">Catégorie</span><b>${esc(rsCatC(f.cat))}</b></div><div><span class="etiq">Mondial</span><b>n° ${f.mondial}</b></div>
      <div><span class="etiq">Âge</span><b>${f.age} ans</b></div><div><span class="etiq">Situation</span><b>Libre · ex-${esc(f.org)}</b></div><div><span class="etiq">Demande</span><b>${duEur(L.b)} par combat</b></div></div>`)}</div>`;
  const mv=L.mises.slice(-4),cache=L.mises.length-mv.length;
  const hist=L.mises.length?`<div class="du-mi">${cache?`<span class="du-mi-n">${cache} mises avant ·</span>`:''}${mv.map(m=>`<span class="du-mi-p" style="--j:${duCol(m.c)}"><i class="octr"></i>${esc(duJ(m.c))} · ${m.p?duEur(m.p):'passe'}</span>`).join('<span class="du-mi-f">›</span>')}</div>`:'<div class="du-mi"><span class="sous">Aucune mise</span></div>';
  const prix=`<div class="du-prix"><span class="etiq">${L.meneur===null?'Ouverture':'Prix'}</span><b class="T">${duEur(L.meneur===null?L.ouverture:L.prix)}</b>
    <span class="du-prix-m">${L.meneur===null?`3 × la bourse · palier ${duEur(L.pas)}`:`${duNomJ(L.meneur)} mène · palier ${duEur(L.pas)}`}</span></div>`;
  const cp=L.meneur===null?L.ouverture:p,apres=duCaisse(c)-cp;
  const cout=`<div class="du-cout"><div><span class="etiq">Contrat</span><b>${DU_CONTRAT} combats</b></div><div><span class="etiq">Bourse ensuite</span><b>${duEur(L.b)} par combat</b></div>
    ${L.fini?'':`<div><span class="etiq">Caisse ${duDe(duJ(c))} s’il signe à ${duEur(cp)}</span><b class="${apres<0?'neg':''}">${duEur(apres)}</b></div>`}</div>`;
  let act='';
  if(!L.fini){
    const miser=L.refus||manque>0?`<div class="du-refus" role="alert">${ico('alerte',22)}<span>Pas assez en caisse pour ${duEur(p)} : ${esc(duOrgN(c))} a ${duEur(duCaisse(c))}, il manque ${duEur(Math.max(0,manque))}.</span></div>`
      :`<button class="bouton jaune cj oct du-miser" data-du="miser">${L.meneur===null?'Miser':'Surenchérir'} · ${duEur(p)}</button>`;
    act=`<div class="du-act">${miser}<button class="bb oct du-aband" data-du="abandon"><span class="oct">${L.meneur===null?'Passer':'Abandonner'}</span></button></div>`;
  }
  return `<div class="du-enc">${tour}<div class="du-enc-g">${duJoueurEnc('a',L)}<div class="du-enc-c du-a">${fiche}<div class="du-enc-p">${prix}${hist}</div>${cout}${act}</div>${duJoueurEnc('b',L)}</div></div>${L.fini?duAdjuge(L):''}`;
}
/** L'issue d'un combattant : confirmation en chiffres (charte S6) ; personne ne mise : il reste libre. */
function duAdjuge(L){
  const f=parId(L.id),der=S.du.enc.i>=S.du.enc.lots.length-1,suite=der?'Composer la carte':'Combattant suivant';
  const c=(l,v)=>`<div><span class="etiq">${l}</span><b class="T">${v}</b></div>`;
  let corps;
  if(L.gagnant){const g=L.gagnant,av=duCaisse(g)+L.prix;
    corps=`<div class="pt"><h2>${esc(duJ(g))} signe ${esc(f.prenom)} ${esc(f.nom)}</h2></div>
      <div class="du-adj-q">${duQui(g)}<span class="sous">${duNomJ(L.abandon)} abandonne à ${duEur(L.prix)}</span></div>
      <div class="du-adj-c">${c('Prix payé',duEur(L.prix))}${c('Contrat',`${DU_CONTRAT} combats`)}${c('Bourse',`${duEur(L.b)}`)}${c(`Caisse ${esc(duOrgN(g))}`,`${duEur(av)} → ${duEur(duCaisse(g))}`)}</div>
      <p class="du-adj-p">Disponible pour la super carte ${S.du.n}, chez ${esc(duOrgN(g))}.${duRelire}</p>`;}
  else corps=`<div class="pt"><h2>Personne ne mise</h2></div><p class="du-adj-p">${esc(f.prenom)} ${esc(f.nom)} reste libre, sur le marché du Recrutement.</p>`;
  return `<div class="du-voile"><div class="du-adj apparait" role="dialog" aria-modal="true">${pan(corps+`<div class="du-adj-b"><button class="bouton jaune cj oct" data-du="lot-suivant" id="duSuite">${suite} ${ico('avant',28,3)}</button></div>`)}</div></div>`;
}

/* ==== B2. L'écran du draft ==== */
function duCoteRow(f,s,attente){
  if(!f)return `<div class="af-cote ${s} du-cv">${AF_Q}<span class="du-cv-t">${attente?esc(attente):''}</span></div>`;
  return `<div class="af-cote ${s}"><div class="l1">${duRangHtml(f)}<span>${esc(f.prenom)}</span></div>
    <div class="nm" style="${afNomStyle(f.nom,afTaille(f.nom,44,290))}"><span class="nom" data-fiche="${f.id}">${esc(f.nom)}</span></div>
    <div class="l3"><span class="T">${bilan(f)}</span>${serie(f.serie)}</div></div>`;
}
function duRow(k,D){
  /* k : rang dans l'affichage (0 = combat principal) ; i : ordre de passage (0 = combat 6, le premier joué). */
  const i=DU_COMBATS-1-k,x=D.combats[i],A=x&&parId(x.a),B=x&&parId(x.b),R=i===DU_COMBATS-1?5:3;
  const encours=!D.fini&&(D.att==='reponse'?i===D.combats.length-1:i===D.combats.length);
  const att=c=>encours?(D.att==='place'?`à placer · ${duJ(D.tour)}`:`à répondre · ${duJ(D.tour)}`):'';
  let rai;
  if(!x)rai=encours?`<span class="du-rai-t" style="--j:${duCol(D.tour)}">${duNomJ(D.tour)} place</span>`:'<span class="vide">Place libre</span>';
  else rai=`<span class="du-rai-l"><span class="sous">Placé par</span> ${duNomJ(x.place)}</span>${A&&B?`<span class="du-rai-l"><span class="sous">Répond</span> ${duNomJ(duAutre(x.place))}</span>`:`<span class="du-rai-t" style="--j:${duCol(D.tour)}">${duNomJ(D.tour)} répond</span>`}`;
  return `<div class="af-t af-row pre du-row ${k===0?'du-m0':''} ${encours?'sel':''} ${x?'':'vide'}" style="--ja:${duCol('a')};--jb:${duCol('b')}">
    <div class="in oct"><div class="af-numc"><span class="T">${k+1}</span></div>
      <div class="af-sc"><i class="du-ja"></i><i class="du-jb"></i>${duCoteRow(A,'a',x?att('a'):'')}
        <div class="af-ctr"><div class="vsw octr"><div class="vsr octr"><div class="vs octr">VS</div></div></div><div class="chip oct">${x?`${esc(afCourt(x.cat))}<i></i>`:''}${R} rounds</div></div>
        ${duCoteRow(B,'b',x?att('b'):'')}</div>
      <div class="af-rai du-rai"><span class="du-rai-r">${esc(DU_ROLES[k])}</span>${rai}</div></div></div>`;
}
function duListe(D){
  const c=D.tour,rep=D.att==='reponse',catR=rep?D.combats[D.combats.length-1].cat:null;
  const tous=duRosterDe(c);
  const cats=['H','F'].flatMap(s=>CATS[s].map(x=>x[0]));
  if(!rep&&(!S.du.cat||!cats.includes(S.du.cat)))S.du.cat=cats.find(k=>tous.some(f=>f.cat===k&&!duRefusPlace(f,c,D)))||cats[0];
  const cat=rep?catR:S.du.cat;
  const nbOk=k=>tous.filter(f=>f.cat===k&&!(rep?duIndispo(f,c,D):duRefusPlace(f,c,D))).length;
  const onglets=rep?`<div class="du-lc-r"><span class="etiq">Réponse en</span><b class="T">${esc(rsCatC(catR))}</b><span class="sous">face à ${lien(parId(D.combats[D.combats.length-1][duAutre(c)]))}</span></div>`
    :`<div class="du-cats">${['H','F'].map(s=>`<div class="du-cats-l"><span class="etiq">${s==='H'?'Hommes':'Femmes'}</span>${CATS[s].map(([k,t])=>{const n=nbOk(k);return `<button class="du-cat oct ${k===cat?'ouvert':''} ${n?'':'zero'}" data-du="cat|${esc(k)}" aria-pressed="${k===cat}">${esc(t)}<small>${n}</small></button>`;}).join('')}</div>`).join('')}</div>`;
  const l=tous.filter(f=>f.cat===cat).sort((x,y)=>duRangN(x)-duRangN(y)||x.mondial-y.mondial);
  const ligne=f=>{const r=rep?duIndispo(f,c,D):duRefusPlace(f,c,D);
    return `<div class="af-r du-r ${r?'off':''}" data-du="choisir|${f.id}" role="button" tabindex="0" aria-disabled="${!!r}">
      <span class="af-rg">${duRang(f)==='C'?AF_C:esc(duRang(f))}</span>
      <div class="af-rm"><div class="af-r1"><span class="nom T" data-fiche="${f.id}">${esc(f.nom)}</span><span class="af-pal T">${bilan(f)}</span></div>
        <div class="af-r2"><span class="af-sn" ${r&&r.neg?'style="color:var(--neg)"':''}>${r?esc(r.txt):`${esc(f.prenom)}${f.surnom?` « ${esc(f.surnom)} »`:''}`}</span>${r?'':`<span class="af-mer">n° ${f.mondial} mondial</span>`}</div></div></div>`;};
  const ok=l.filter(f=>!(rep?duIndispo(f,c,D):duRefusPlace(f,c,D))),ko=l.filter(f=>!ok.includes(f));
  return pan(`<div class="du-lh" style="--j:${duCol(c)}">${duQui(c)}<span class="etiq">${rep?'Choisis l’adversaire':'Choisis qui placer'}</span></div>${onglets}
    <div class="af-list du-list"><div class="af-grp">Disponibles · ${ok.length}</div>${ok.map(ligne).join('')||'<div class="du-vide">Personne de disponible ici.</div>'}
      ${ko.length?`<div class="af-grp">Indisponibles · ${ko.length}</div>${ko.map(ligne).join('')}`:''}</div>`,'height:100%','du-lp');
}
function duDraftHtml(){
  const D=duDraft();
  const pl=c=>D.combats.filter(x=>x.place===c).length;
  const droite=`<div class="du-cpt">${['a','b'].map(c=>`<span style="--j:${duCol(c)}"><i class="octr"></i>${esc(duJ(c))} <b>${pl(c)}/3</b> placés</span>`).join('')}</div>`;
  const tour=D.fini?`<div class="du-tour du-a fini"><div class="du-tour-t"><span class="T">La carte est complète</span><span class="du-tour-o">6 combats · ${esc(duOrgN('a'))} contre ${esc(duOrgN('b'))}</span></div><div class="du-tour-d">${droite}</div></div>`
    :duTour(D.tour,D.att==='place'?`À ${esc(duJ(D.tour))} de placer`:`À ${esc(duJ(D.tour))} de répondre · ${esc(rsCatC(D.combats[D.combats.length-1].cat))}`,droite);
  const carte=`<div class="du-carte"><div class="af-sec"><span class="T">Super carte ${S.du.n}</span><span class="h">${duCourt(duDateCarte(S.du.n))}</span>
      <span class="d">Le combat 6 ouvre la soirée · <span class="du-leg"><i style="background:${duCol('a')}"></i>${esc(duJ('a'))}</span><span class="du-leg"><i style="background:${duCol('b')}"></i>${esc(duJ('b'))}</span></span></div>
    ${[0,1,2,3,4,5].map(k=>duRow(k,D)).join('')}
    <div class="du-ann">${S.du.picks.length?`<button class="bb oct" data-du="annuler"><span class="oct">${ico('retour',20,3)} Annuler le dernier choix</span></button><span class="sous">${S.du.picks.length} choix sur 12</span>`:'<span class="sous">Aucun choix encore.</span>'}</div></div>`;
  const droiteP=D.fini?pan(`<div class="pt"><h2>Ce qui se joue</h2></div><div class="du-enjeu">${duEnjeu()}</div>`,'height:100%','du-lp'):duListe(D);
  return `<div class="du-dr">${tour}<div class="du-dr-g">${carte}<div class="du-dr-d du-a">${droiteP}</div></div></div>${S.du.conf==='resume'?duResume(D):''}`;
}
function duEnjeu(){
  const c=(l,a,b)=>`<div class="du-ej"><span class="etiq">${l}</span><div><span>${a}</span><span>${b}</span></div></div>`;
  return `<div class="du-ej-l"><span class="etiq">Le plus de combats gagnés remporte la super carte</span></div>
    ${c('Vainqueur',duEur(DU_GAIN.vainqueur),'')}${c('Perdant',duEur(DU_GAIN.perdant),'')}${c('Égalité',`${duEur(DU_GAIN.nul)} chacun`,'')}
    <p class="sous du-ej-p">Pas de ceinture en jeu. Les bilans, blessures et classements changent dans chaque organisation.</p>`;
}
/** Valider ouvre un résumé de la carte avant de confirmer (Carte validée, charte S6). */
function duResume(D){
  const x0=D.combats[DU_COMBATS-1],A=parId(x0.a),B=parId(x0.b);
  const cote=(f,s)=>`<div class="af-rs-c ${s}"><div class="l1">${duRangHtml(f)}<span>${esc(f.prenom)}${f.surnom?` « ${esc(f.surnom)} »`:''}</span></div>
    <div class="T nm" style="${afNomStyle(f.nom,afTaille(f.nom,96,420))}">${esc(f.nom)}</div><div class="l3"><span class="T">${bilan(f)}</span>${serie(f.serie)}</div>${duQui(s)}</div>`;
  const tous=D.combats.flatMap(x=>[parId(x.a),parId(x.b)]);
  const ligne=k=>{const i=DU_COMBATS-1-k,x=D.combats[i],a=parId(x.a),b=parId(x.b);return `<div class="af-rs-l du-rs-l"><span class="n T">${k+1}</span>
    <span class="x">${duRangHtml(a)}<span class="T">${esc(duNomCarte(a,tous))}</span><i class="du-pt" style="background:${duCol('a')}"></i></span><span class="vs2">VS</span><span class="x d"><i class="du-pt" style="background:${duCol('b')}"></i><span class="T">${esc(duNomCarte(b,tous))}</span>${duRangHtml(b)}</span>
    <span class="r">${esc(afCourt(x.cat))} · 3 rounds</span></div>`;};
  return `<div class="af-voile du-voile2">${pan(`<div class="af-rs-ban du-rs-ban" style="--ja:${duCol('a')};--jb:${duCol('b')}"><i class="tun"></i>
      <div class="haut etiq">Super carte ${S.du.n} · ${duCourt(duDateCarte(S.du.n))} · ${esc(duOrgN('a'))} contre ${esc(duOrgN('b'))}</div>
      ${cote(A,'a')}<div class="mil"><div class="vsw octr"><div class="vsr octr"><div class="vs octr">VS</div></div></div><div class="chip oct">${esc(afCourt(A.cat))}<i></i>5 rounds</div></div>${cote(B,'b')}</div>
    <div class="af-rs-corps"><div class="col"><div class="etiq">Les 5 autres combats · le combat 6 ouvre la soirée</div>${[1,2,3,4,5].map(ligne).join('')}</div>
      <div class="col bil"><div class="etiq">Ce que rapporte la soirée</div>
        <div class="af-chif"><span class="etiq">Vainqueur</span><span class="T">${duEur(DU_GAIN.vainqueur)}</span><span class="etiq">Perdant</span><span class="T">${duEur(DU_GAIN.perdant)}</span>
          <span class="etiq">Égalité</span><span class="T">${duEur(DU_GAIN.nul)} chacun</span></div>
        <div class="etiq" style="margin-top:16px">Placements</div>
        ${['a','b'].map(c=>`<div class="af-li">${duQui(c)}<span class="sous">${D.combats.filter(x=>x.place===c).length} combats placés</span></div>`).join('')}</div></div>
    <div class="af-res-pied"><span class="sous">La carte ne se change plus après la confirmation.</span>
      <button class="af-b grand" data-du="revenir" id="duRevenir"><span class="oct">Revenir</span></button>
      <button class="bouton jaune cj" style="--c:14px;height:56px;font-size:30px" data-du="confirmer">Confirmer la carte</button></div>`,'','af-res')}</div>`;
}

/* ==== C1. La soirée de la super carte : les scènes validées, le score qui monte ==== */
function duBandeScore(i,anim){
  const s=duScore(duVu());
  return `<div class="du-bs" style="--ja:${duCol('a')};--jb:${duCol('b')}"><span class="du-bs-j a">${ogEmb(duOrgN('a'),40)}<b>${esc(duJ('a'))}</b><span>${esc(duOrgN('a'))}</span></span>
    <span class="du-bs-s T"><span class="a ${anim==='a'?'monte':''}">${s.a}</span><i>–</i><span class="b ${anim==='b'?'monte':''}">${s.b}</span></span>
    <span class="du-bs-j b"><span>${esc(duOrgN('b'))}</span><b>${esc(duJ('b'))}</b>${ogEmb(duOrgN('b'),40)}</span></div>`;
}
function duSoireeLigne(f,i){
  const vu=duVu(),joue=i<vu,proch=i===S.du.so.i&&S.du.so.etat==='direct';
  const no=`<span class="sd-l-n octr">${DU_COMBATS-i}</span>`,role=`<span class="sd-l-r"><b>${esc(f.role)}</b><span>${esc(rsCatC(f.cat))} · ${f.rounds} rounds</span></span>`;
  const pt=c=>`<i class="du-pt" style="background:${duCol(c)}" title="${esc(duJ(c))}"></i>`;
  const L=duTous(duJouer().F);
  if(joue)return `<div class="sd-l joue du-sl">${no}${role}<span class="sd-l-f"><span class="marque octr v">V</span>${pt(f.ws)}${duSdN(f.W,L)}<span class="sous">bat</span>${duSdN(f.L,L)}</span>
    <span class="sd-l-m"><b>${esc(sdMeth(f.d))}</b><span>${esc(f.d.meth==='Décision'?`${f.d.n} rounds`:`${rsOrd(f.d.rd)} round · ${f.d.tps}`)}</span></span></div>`;
  return `<div class="sd-l du-sl ${proch?'on oct':''}">${no}${role}<span class="sd-l-f">${pt('a')}${duSdN(f.A,L)}<span class="sous">contre</span>${duSdN(f.B,L)}${pt('b')}</span><span class="sd-l-m"></span></div>`;
}
function duSoireeHtml(){
  const F=duJouer().F,so=S.du.so,f=F[so.i];S.sd.k=f.k;
  if(so.etat==='fort'){S.sd.revoir=so.revoir;S.sd.mo=Math.max(0,Math.min(S.sd.mo||0,sdMoments(f).length-1));return `<div class="du-sw">${sdFort()}</div>`;}
  if(so.etat==='resultat'){
    let h=sdResultat();const nomsOrg=[duOrgN(f.ws==='a'?'a':'b'),duOrgN(f.ls==='a'?'a':'b')];let k=0;
    h=h.replace(/Chez Split/g,()=>`Chez ${esc(nomsOrg[k++]||'')}`);
    return `<div class="du-sw du-res">${duBandeScore(so.i,f.ws)}${h}</div>`;
  }
  const carte=pan(titre(`Super carte ${S.du.n}`,`${esc(duOrgN('a'))} contre ${esc(duOrgN('b'))}`)+`<div class="sd-ls">${F.map((x,i)=>duSoireeLigne(x,i)).join('')}</div>`,'flex:1','sd-carte');
  const sc=duScore(duVu()),reste=DU_COMBATS-duVu();
  const score=pan(titre('Score')+`<div class="du-sp"><div class="du-sp-l" style="--j:${duCol('a')}"><b>${esc(duJ('a'))}</b><span class="T">${sc.a}</span></div><div class="du-sp-l" style="--j:${duCol('b')}"><b>${esc(duJ('b'))}</b><span class="T">${sc.b}</span></div></div>
    <div class="du-sp-r">${reste?`${reste} combat${reste>1?'s':''} à jouer`:'Tout est joué'}</div>
    <div class="du-sp-o">${F.map((x,i)=>`<i class="octr ${i<duVu()?'g-'+x.ws:''}" style="${i<duVu()?`background:${duCol(x.ws)}`:''}" title="${esc(x.role)}"></i>`).join('')}</div>
    <div class="du-sp-a"><span class="etiq">L’argent</span><span>${duEur(DU_GAIN.vainqueur)} au vainqueur · ${duEur(DU_GAIN.perdant)} au perdant · ${duEur(DU_GAIN.nul)} chacun sur égalité</span></div>`,'width:470px;flex:none','du-scp');
  return `<div class="pz sd sd-direct du-dir ${S.du.anim?'anim':''}">${duBandeScore(so.i)}${sdHero(f)}<div class="sd-cols">${carte}${score}</div></div>`;
}

/* ==== C2. Le bilan de la super carte ==== */
function duBilanHtml(){
  const F=duJouer().F,R=duResultat(),n=S.du.n,g=R.g,sai=duSaison(true),fin=n===DU_CARTES;
  const titreB=g==='nul'?'Égalité':`${esc(duJ(g))} remporte la super carte ${n}`;
  const ban=`<div class="du-bb ${g==='nul'?'nul':''}" style="--j:${g==='nul'?'var(--blanc)':duCol(g)}"><i class="du-bb-img" style="filter:${g==='nul'?'grayscale(1) brightness(.5)':`${ogTeinte(duOrgN(g))[1]||'none'} brightness(.62)`}"></i>
    <div class="du-bb-t">${g==='nul'?'':ogEmb(duOrgN(g),86)}<div><span class="etiq">Super carte ${n} · ${duCourt(duDateCarte(n))}</span><h2 class="T">${titreB}</h2></div></div>
    <div class="du-bb-s"><span style="--j:${duCol('a')}"><b>${esc(duJ('a'))}</b><span class="T">${R.s.a}</span></span><i class="T">–</i><span style="--j:${duCol('b')}"><span class="T">${R.s.b}</span><b>${esc(duJ('b'))}</b></span></div></div>`;
  const comb=pan(titre('Combats','dans l’ordre de la carte')+`<div class="du-bl">${[...F].reverse().map(f=>`<div class="du-blc">
      <span class="du-blc-r">${esc(f.role.replace('Combat principal','Principal'))}</span>
      <span class="du-blc-w"><span class="marque octr v">V</span><i class="du-pt" style="background:${duCol(f.ws)}"></i>${duSdN(f.W,duTous(F))}<span class="sous">bat</span>${duSdN(f.L,duTous(F))}</span>
      <span class="du-blc-m">${esc(sdMeth(f.d))} · ${esc(f.d.meth==='Décision'?`${f.d.n} rounds`:`${rsOrd(f.d.rd)} round`)}</span>
      <button class="du-lien" data-du="revoir|${f.i}">Revoir ›</button></div>`).join('')}</div>`,'flex:1.25','du-blp');
  const arg=c=>{const gain=duGain(g,c),paye=S.du.recrues.filter(r=>r.c===c).reduce((t,r)=>t+r.prix,0);
    return `<div class="du-ar" style="--j:${duCol(c)}">${duQui(c)}<div class="du-ar-g"><span class="etiq">Super carte</span><b class="T" style="color:var(--vert)">+ ${duEur(gain)}</b></div>
      ${paye?`<div class="du-ar-g"><span class="etiq">Enchères</span><b class="T" style="color:var(--neg)">− ${duEur(paye)}</b></div>`:''}
      <div class="du-ar-g"><span class="etiq">En caisse</span><b class="T">${duEur(duCaisse(c))}</b></div></div>`;};
  const argent=pan(titre('Argent')+arg('a')+arg('b'),'flex:.9','du-arp');
  const chg=c=>{const l=F.map(f=>{const s=c,x=s==='a'?f.A:f.B,ga=f.ws===s,ap=sdApres(f,s),av=sdAv(x),med=SD_MED[x.id];
      const dr=rsRangV(av.rang)-rsRangV(ap.rang);
      return `<div class="du-cg"><span class="marque octr ${ga?'v':'d'}">${ga?'V':'D'}</span>${lien(x)}<span class="du-cg-b T">${rec(ap.v,ap.d,x.n)}</span>
        <span class="du-cg-r">${ap.rang==='C'?`Champion`:dr?`<span class="rs-fl ${dr>0?'up':'down'}">${dr>0?'▲':'▼'}</span> n° ${esc(ap.rang)}`:`n° ${esc(ap.rang)}`} chez ${esc(duOrgN(c))}</span>${med?`<span class="du-cg-m">${ico('medical',16)}apte le ${esc(med[1])}</span>`:''}</div>`;}).join('');
    return `<div class="du-cgo" style="--j:${duCol(c)}"><div class="du-cgo-h">${duQui(c)}</div>${l}</div>`;};
  const change=pan(titre('Changements','bilans, classement, blessures')+`<div class="du-cgs">${chg('a')}${chg('b')}</div>`,'flex:1.35','du-cgp');
  const dern=sai.l.length===DU_CARTES,gs=sai.a>sai.b?'a':sai.b>sai.a?'b':'nul';
  const saison=`<div class="du-sa du-a">${pan(`<div class="du-sa-g"><span class="etiq">Saison 1</span>${dern?`<b class="T">${gs==='nul'?`Égalité · ${sai.a}–${sai.b}`:`${esc(duJ(gs))} remporte la saison · ${sai.a}–${sai.b}`}</b>`:`<b class="T">${esc(duJ('a'))} ${sai.a} – ${sai.b} ${esc(duJ('b'))}</b>`}</div>
    <div class="du-ocs l">${[0,1,2,3].map(k=>duOctoSaison(k,true)).join('')}</div>
    <div class="du-sa-p"><span class="etiq">${fin?'Saison 2 · super carte 1':'Prochaine super carte'}</span><b class="T">le ${duCourt(duDateCarte(n+1))}</b></div>`)}</div>`;
  return `<div class="du-bil ${S.du.anim?'anim':''}">${ban}<div class="du-bil-g">${comb}${argent}${change}</div>${saison}</div>`;
}

/* ==== Rendu ==== */
const DU_PLAQUES={noms:'Nouvelle partie à deux',qg:'Duo',encheres:'Enchères',draft:'Carte',soiree:'Soirée',bilan:'Soirée'};
function duBouton(){
  const v=S.du.vue;
  if(v==='qg'){if(S.du.avance)return 'Passer';return S.du.phase==='carte'?(S.du.enc&&S.du.enc.i>=S.du.enc.lots.length?'Composer la carte':'Ouvrir les enchères'):`Avancer jusqu’au ${duJM(duDateCarte(S.du.n))}`;}
  if(v==='encheres')return duLot()?null:'Composer la carte';
  if(v==='draft')return duDraft().fini&&!S.du.conf?'Valider la carte':null;
  if(v==='soiree'){const e=S.du.so.etat,der=S.du.so.i===DU_COMBATS-1;
    if(S.du.so.revoir)return 'Bilan';
    return e==='direct'?'Regarder':e==='fort'?'Résultat':der?'Bilan':'Combat suivant';}
  if(v==='bilan')return 'Tableau de bord';
  return null;
}
const duRendreBase=rendre;
rendre=function(){
  const b=document.body;
  if(S.ecran!=='duo'){b.classList.remove('du-mode','du-plein');if(typeof SD_ANIM!=='undefined'&&S.ecran!=='soiree')cancelAnimationFrame(SD_ANIM.raf);duRendreBase();if(S.ecran==='menu'&&S.du.creer)duApresMenu();return;}
  if(typeof SD_ANIM!=='undefined')cancelAnimationFrame(SD_ANIM.raf);
  const v=S.du.vue,plein=v==='soiree'&&['fort','resultat'].includes(S.du.so.etat);
  b.classList.remove('mn-mode','sd-mode','pp-mode');b.classList.add('du-mode');b.classList.toggle('du-plein',plein);if(v==='noms')b.classList.add('mn-mode');
  $('#barre').innerHTML='';$('#alerte').className='alerte-l';$('#alerte').innerHTML='';
  if(v==='noms'){rendreEntete('Nouvelle partie à deux');document.querySelectorAll('#entete .boite,#bContinuer').forEach(e=>e.remove());
    $('#entete').insertAdjacentHTML('afterbegin',`<div class="mn-logo">${LOGO}<div><b>CAGE</b><i>LEGACY</i></div></div>`);
    $('#entete').insertAdjacentHTML('beforeend',`<span class="mn-empl">Emplacement ${S.mn.slot}</span>`);}
  else duEntete(DU_PLAQUES[v],duBouton());
  const c=$('#corps');c.style.top=v==='noms'?'0':'108px';
  c.innerHTML=v==='noms'?duNomsHtml():v==='qg'?duQGHtml():v==='encheres'?duEncheresHtml():v==='draft'?duDraftHtml():v==='soiree'?duSoireeHtml():duBilanHtml();
  $('#zone').classList.toggle('fiche-ouverte',!!S.fiche);
  if(v==='noms'){mnTunLancer(16000);const i=$('#duNoma');if(i&&!S.fiche&&!duRendre.focus){i.focus({preventScroll:true});i.select();duRendre.focus=true;}}
  if(v==='soiree'&&S.du.so.etat==='fort'&&!S.fiche)sdJouerMoment();
  if(S.du.conf==='resume'){const r=$('#duRevenir');if(r)r.focus();}
  if(v==='encheres'&&duLot()&&duLot().fini){const r=$('#duSuite');if(r)r.focus();}
  duEntrees();S.du.anim=false;
};
const duRendre={focus:false};
/** L'entrée des blocs (discrète sur les écrans de gestion, T3) ; rien en mouvement réduit. */
function duEntrees(){
  if(!S.du.anim||duCalme())return;
  document.querySelectorAll('#corps .du-a').forEach((e,i)=>e.animate([{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'none'}],{duration:450,delay:Math.min(i,8)*50,easing:'cubic-bezier(.2,.8,.2,1)',fill:'backwards'}));
  document.querySelectorAll('#corps .du-ev,#corps .du-r,#corps .du-blc,#corps .du-cg').forEach((e,i)=>e.animate([{opacity:0,transform:'translateX(-12px)'},{opacity:1,transform:'none'}],{duration:280,delay:120+Math.min(i,16)*22,easing:'ease-out',fill:'backwards'}));
}
function duFlash(sel){if(duCalme())return;const e=$(sel);if(e)e.animate([{transform:'scale(1.12)',color:'var(--jaune)'},{transform:'none'}],{duration:420,easing:'cubic-bezier(.2,.8,.2,1)'});}
/** Sur la scène validée de Nouvelle partie : à qui c'est, l'organisation de J1 prise, le bouton nommé. */
function duApresMenu(){
  const F=S.mn;if(F.vue!=='nouvelle'&&F.vue!=='creation')return;
  if(F.vue==='creation'){const h=$('#entete .plaque');if(h)h.textContent='Nouvelle partie à deux';return;}
  const e=S.du.etape,c=e==='a'?'a':'b',pris=e==='b'?S.du.org.a:null;
  const h=$('#entete .plaque');if(h)h.textContent='Nouvelle partie à deux';
  document.querySelectorAll('#mnRail .mn-r[data-mn]').forEach(b=>{const id=b.dataset.mn.split('|')[1];
    if(id===pris){b.classList.add('du-pris');b.setAttribute('aria-disabled','true');const s=b.querySelector('small');if(s)s.innerHTML=`<span class="du-pris-j" style="--j:${duCol('a')}">${esc(duJ('a'))}</span>`;}});
  const sc=$('#mnScene');if(sc&&!$('#duChoix'))sc.insertAdjacentHTML('afterbegin',`<div class="du-choix" id="duChoix"></div>`);
  duMajChoix();
}
function duMajChoix(){
  const c=S.du.etape==='a'?'a':'b',o=mnOrg(S.mn.org),col=ogTeinte(o.nom)[0],x=$('#duChoix');
  if(x)x.innerHTML=`<span class="etiq">${c==='a'?'Joueur 1':'Joueur 2'}</span><b class="du-choix-n" style="--j:${col}">${esc(duJ(c))}</b><span class="du-choix-t">choisis ton organisation</span>`;
  const b=document.querySelector('#mnScene .mn-cree');if(b)b.innerHTML=`${c==='a'?`Choisir ${esc(o.nom)}`:'Créer la partie'} ${ico('avant',36,3)}`;
}
/* Les choix sur la scène de Nouvelle partie : branchés sur les actions du menu, sans les recopier. */
const duChoisirOrgBase=mnChoisirOrg;
mnChoisirOrg=function(id){
  if(S.du.creer&&S.du.etape==='b'&&id===S.du.org.a){
    const i0=MN_ORGS.findIndex(o=>o.id===S.mn.org),i1=MN_ORGS.findIndex(o=>o.id===id),n=MN_ORGS.length,d=(i1-i0+n)%n===1?1:-1;
    duChoisirOrgBase(MN_ORGS[(i1+d+n)%n].id);duMajChoix();return;}
  duChoisirOrgBase(id);if(S.du.creer)duMajChoix();
};
const duActionBase=mnAction;
mnAction=function(a,v){
  const F=S.mn;
  if(a==='creer'&&F.duo){duPas(()=>{S.ecran='duo';S.du.vue='noms';F.slot=+v;S.du.creer=false;S.du.noms={a:'',b:''};duRendre.focus=false;});return;}
  if(S.du.creer&&F.vue==='nouvelle'){
    if(a==='org'&&S.du.etape==='b'&&v===S.du.org.a){toast(`${esc(mnOrg(v).nom)} est à ${esc(duJ('a'))}.`);return;}
    if(a==='lancer'){
      if(S.du.etape==='a'){duPas(()=>{S.du.org.a=F.org;S.du.etape='b';const i=MN_ORGS.findIndex(o=>o.id===F.org);F.org=MN_ORGS[(i+1)%MN_ORGS.length].id;F.anim=true;});return;}
      duPas(()=>{S.du.org.b=F.org;F.org=S.du.org.a;F.vue='creation';F.anim=true;});return;
    }
  }
  return duActionBase(a,v);
};
/* La création à deux reprend la scène validée ; les soirées y portent le nom de l'organisation de J1 (Split n'est qu'un cas). */
const duGenMajBase=mnGenMaj;
mnGenMaj=function(p){duGenMajBase(p);if(!S.du.creer)return;const nom=mnOrg(S.mn.org).nom;if(nom==='Split')return;
  const e=$('#mnRs');if(e&&/^Split Fight Night/.test(e.textContent))e.textContent=e.textContent.replace('Split Fight Night',nom);};
const duCreerBase=mnCreer;
mnCreer=function(){
  if(!S.du.creer){duCreerBase();return;}
  /* La partie à deux commence le 4 janvier 2027 : rien n'est écrit, ni emplacement ni sauvegarde. */
  S.du.creer=false;Object.assign(S.du,{vue:'qg',phase:'debut',n:1,enc:null,picks:[],payes:{a:0,b:0},recrues:[],conf:null,anim:true});
  S.mn.vue='menu';S.date=new Date(DU_DEBUT);S.hist=duHistParties();S.futur=[];S.ecran='duo';rendre();
};

/* ==== Navigation : chaque pas est un pas de Retour et Avant ==== */
function duEtat(){
  return JSON.stringify({ecran:S.ecran,date:S.date.getTime(),mn:{vue:S.mn.vue,org:S.mn.org,slot:S.mn.slot,duo:S.mn.duo},
    du:{vue:S.du.vue,etape:S.du.etape,phase:S.du.phase,n:S.du.n,noms:S.du.noms,org:S.du.org,enc:S.du.enc,picks:S.du.picks,cat:S.du.cat,so:S.du.so,conf:S.du.conf,creer:S.du.creer,payes:S.du.payes,recrues:S.du.recrues}});
}
/** Les enchères engagent l'argent : Retour ne les défait pas (elles restent où elles en sont, comme dans le jeu). */
function duRestaurer(j){
  const o=JSON.parse(j),garde={enc:S.du.enc,payes:S.du.payes,recrues:S.du.recrues},memeCarte=o.du.n===S.du.n;
  S.ecran=o.ecran;S.date=new Date(o.date);Object.assign(S.mn,o.mn,{conf:null,anim:true});Object.assign(S.du,o.du,{anim:true,avance:null});
  if(garde.enc&&memeCarte)Object.assign(S.du,garde);
}
function duPas(maj){S.hist.push({du:duEtat()});S.futur=[];maj();S.du.anim=true;rendre();}
const duRetourBase=retour;
retour=function(){
  if(!S.fiche&&S.du.conf==='resume'){S.du.conf=null;rendre();return;}
  const h=S.hist[S.hist.length-1];
  if(!S.fiche&&h&&h.du){if(S.du.avance)duAvancer.fin();S.hist.pop();S.futur.push({du:duEtat()});duRestaurer(h.du);rendre();return;}
  duRetourBase();
};
const duAvantBase=avant;
avant=function(){
  const f=S.futur[S.futur.length-1];
  if(!S.fiche&&f&&f.du){S.futur.pop();S.hist.push({du:duEtat()});duRestaurer(f.du);rendre();return;}
  duAvantBase();
};
/* Le menu traite d'abord Retour et Avant : un pas du Duo passe par ici. */
const duMnRetourBase=mnRetour;
mnRetour=function(){const h=S.hist[S.hist.length-1];if(h&&h.du&&!S.fiche){retour();return true;}
  if(h&&h.mn&&!S.fiche&&duSortir())return true;return duMnRetourBase();};
/** Les soirées des adjoints ont été jouées en mémoire (soirée 63, bilans) : quitter le Duo repart d'une page neuve. */
function duSortir(){if(!DU_JOUE.size||S.ecran!=='duo')return false;location.href='index.html?ecran=menu&mnvue=parties&mnduo=1';return true;}
const duMnAvantBase=mnAvant;
mnAvant=function(){const f=S.futur[S.futur.length-1];if(f&&f.du&&!S.fiche){avant();return true;}return duMnAvantBase();};
/* La fiche s'ouvre par-dessus l'écran du Duo, qui reste derrière. */
const duOuvrirBase=ouvrirFiche;
ouvrirFiche=function(id,garderFutur=false){
  if(S.ecran!=='duo'){duOuvrirBase(id,garderFutur);return;}
  if(typeof SD_ANIM!=='undefined')cancelAnimationFrame(SD_ANIM.raf);
  if(!garderFutur)S.futur=[];
  if(S.fiche&&S.fiche!==id)S.ficheHist.push(S.fiche);
  S.fiche=id;S.panCat=false;rendre();rendreFiche();setTimeout(()=>$('#fiche').classList.add('ouverte'),30);
};
const duAllerBase=aller;
aller=function(ec){
  if(S.ecran==='duo'&&ec!=='duo'){if(S.du.avance)duAvancer.fin();if(duSortir())return;document.body.classList.remove('du-mode','du-plein');}
  duAllerBase(ec);
};

/* ==== Le bouton jaune et les actions ==== */
function duSuivant(){
  const v=S.du.vue;
  if(v==='qg'){
    if(S.du.avance){duAvancer.fin();return;}
    if(S.du.phase!=='carte'){duAvancer();return;}
    duPas(()=>{if(!S.du.enc)S.du.enc=duEncNeuve();S.du.vue=S.du.enc.lots.length&&S.du.enc.i<S.du.enc.lots.length?'encheres':'draft';});return;
  }
  if(v==='encheres'){if(!duLot())duPas(()=>{S.du.vue='draft';});return;}
  if(v==='draft'){if(duDraft().fini){S.du.conf='resume';rendre();}return;}
  if(v==='soiree'){const so=S.du.so;
    if(so.revoir){duPas(()=>{S.du.vue='bilan';so.revoir=false;so.etat='direct';});return;}
    if(so.etat==='direct'){duPas(()=>{so.etat='fort';so.mo=0;S.sd.mo=0;});return;}
    if(so.etat==='fort'){duPas(()=>{so.etat='resultat';});return;}
    if(so.i<DU_COMBATS-1){duPas(()=>{so.i++;so.etat='direct';S.sd.mo=0;});return;}
    duPas(()=>{S.du.vue='bilan';});return;}
  if(v==='bilan'){duTerminer();return;}
}
/** Le bilan refermé : la super carte suivante, la caisse avec ses gains, les combattants avec leur nouveau bilan. */
function duTerminer(){
  const F=duJouer().F,R=duResultat();
  F.forEach(f=>{for(const s of ['a','b']){const x=s==='a'?f.A:f.B,ap=sdApres(f,s);x.v=ap.v;x.d=ap.d;x.serie=ap.serie;
    /* Rang mondial : il échange sa place avec celui qui l'occupait (comme rsJouer63). */
    if(ap.mondial!==x.mondial){const h=[...COMBATTANTS,...EXT].find(y=>y!==x&&y.cat===x.cat&&y.mondial===ap.mondial);if(h)h.mondial=x.mondial;x.mondial=ap.mondial;}
    /* Rang dans l'organisation : il échange aussi sa place. */
    const r0=duRang(x),r1=ap.rang;if(typeof r0==='number'&&typeof r1==='number'&&r0!==r1){const h=duRosterDe(s).find(y=>y!==x&&y.cat===x.cat&&duRang(y)===r1);if(h){if(h.ext)h._duRang=r0;else h.rang=r0;}if(x.ext)x._duRang=r1;else x.rang=r1;}
    if(DU_RET[x.id])x._duBles={txt:'KO, suspendu',retour:DU_RET[x.id]};}});
  if(S.du.n>=DU_CARTES){toast('La saison 2 commence le 3 janvier 2028 : hors de cette maquette.');return;}
  DU_PASSE[S.du.n-1]={g:R.g,s:[R.s.a,R.s.b]};
  S.hist=duHistParties();S.futur=[];
  Object.assign(S.du,{vue:'qg',phase:'debut',n:S.du.n+1,enc:null,picks:[],payes:{a:0,b:0},recrues:[],so:{i:0,etat:'direct',revoir:false},conf:null,anim:true});
  DU_RES=null;S.date=duDateCarte(S.du.n-1);rendre();
}
function duAction(a,v){
  if(a==='noms-ok')return duNomsValider();
  if(a==='miser')return duMiser();
  if(a==='abandon')return duAbandonner();
  if(a==='lot-suivant'){const E=S.du.enc;if(E.i>=E.lots.length-1){duPas(()=>{E.i=E.lots.length;S.du.vue='draft';});return;}E.i++;S.du.anim=true;rendre();return;}
  if(a==='cat'){S.du.cat=v;rendre();return;}
  if(a==='choisir')return duChoisir(v);
  if(a==='annuler')return retour();
  if(a==='revenir'){S.du.conf=null;rendre();return;}
  if(a==='confirmer'){S.du.conf=null;DU_RES=null;duJouer();
    /* La carte confirmée ne se défait plus : Retour ne revient pas dans le draft (DUO-T4). */
    S.hist=[];S.futur=[];Object.assign(S.du,{vue:'soiree',so:{i:0,etat:'direct',revoir:false},anim:true});S.date=duDateCarte(S.du.n);rendre();return;}
  if(a==='revoir'){const i=+v;duPas(()=>{S.du.vue='soiree';S.du.so={i,etat:'fort',revoir:true};S.sd.mo=0;});return;}
}

/* La scène ne défile jamais : un champ qui prend le focus (les prénoms) ne doit pas la décaler. */
/* Aucun conteneur à overflow caché (scène, zone, corps, panneaux) ne doit défiler : un focus ou un clic près d'un bord le décalerait. */
document.addEventListener('scroll',e=>{const t=e.target;if(!(t instanceof Element)||!(t.scrollLeft||t.scrollTop))return;
  const cs=getComputedStyle(t);if(cs.overflowX==='hidden'||cs.overflowX==='clip'){t.scrollLeft=0;}if(cs.overflowY==='hidden'||cs.overflowY==='clip'){t.scrollTop=0;}},true);
/* ---- Clics, touches ---- */
document.addEventListener('click',e=>{
  if(S.ecran!=='duo')return;
  const t=e.target,stop=()=>e.stopImmediatePropagation();let el;
  if(t.closest('#bContinuer')){stop();if(S.fiche)fermerFiche(false);duSuivant();return;}
  if(S.fiche||t.closest('[data-fiche]')||!t.closest('#corps'))return;
  if(S.du.vue==='qg'&&S.du.avance){stop();duAvancer.fin();return;}
  if(S.du.vue==='soiree'&&S.du.so.etat==='fort'){
    if((el=t.closest('[data-sdmo]'))){stop();const i=+el.dataset.sdmo;if(i!==S.sd.mo){S.sd.mo=i;rendre();}else sdJouerMoment();return;}
    if((el=t.closest('[data-sdnav]'))){stop();const n=sdMoments(sdF(S.sd.k)).length,i=S.sd.mo+(+el.dataset.sdnav);if(i>=0&&i<n){S.sd.mo=i;rendre();}return;}
  }
  if((el=t.closest('[data-du]'))){stop();const s=el.dataset.du,p=s.indexOf('|');duAction(p<0?s:s.slice(0,p),p<0?'':s.slice(p+1));return;}
  if(S.du.conf==='resume'&&t.closest('.du-voile2')&&!t.closest('.af-res')){stop();S.du.conf=null;rendre();}
},true);
document.addEventListener('keydown',e=>{
  if(S.ecran!=='duo'||S.fiche)return;
  if(S.du.vue==='noms'&&e.key==='Enter'){e.preventDefault();duNomsValider();return;}
  if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();if(S.du.conf==='resume'){S.du.conf=null;rendre();}else if(!mnRetour())retour();return;}
  if(e.target&&e.target.tagName==='INPUT')return;
  const r=e.target&&e.target.closest&&e.target.closest('.du-r');
  if(r&&(e.key==='Enter'||e.key===' ')){e.preventDefault();const s=r.dataset.du;duAction('choisir',s.slice(s.indexOf('|')+1));}
},true);

/* ---- Lancement : une adresse de démonstration montre un état, rien n'est écrit ---- */
window.addEventListener('DOMContentLoaded',()=>{
  const q=new URLSearchParams(location.search),ec=q.get('ecran');duCaisseBase('a');
  const nom=k=>{const v=(q.get(k)||'').trim().slice(0,DU_NOM_MAX);return v||null;};
  if(nom('duj1'))S.du.noms.a=nom('duj1');if(nom('duj2'))S.du.noms.b=nom('duj2');
  const o1=q.get('duorg1'),o2=q.get('duorg2');if(MN_ORGS.some(o=>o.id===o1))S.du.org.a=o1;if(MN_ORGS.some(o=>o.id===o2)&&o2!==S.du.org.a)S.du.org.b=o2;
  if(S.du.org.a===S.du.org.b)S.du.org.b=MN_ORGS.find(o=>o.id!==S.du.org.a).id;
  if(q.get('mvmouv')==='1')document.body.classList.add('mv-force');
  if(ec==='menu'&&q.get('mnduo')==='1'&&['a','b'].includes(q.get('duetape'))){
    S.du.creer=true;S.du.etape=q.get('duetape');S.mn.duo=true;
    if(S.du.etape==='b'){const i=MN_ORGS.findIndex(o=>o.id===S.du.org.a);S.mn.org=q.get('mnorg')&&q.get('mnorg')!==S.du.org.a&&MN_ORGS.some(o=>o.id===q.get('mnorg'))?q.get('mnorg'):MN_ORGS[(i+1)%8].id;}
    else S.mn.org=S.du.org.a;
    S.mn.vue='nouvelle';S.mn.slot=+(q.get('mnslot')||1);S.hist=[{mn:JSON.stringify({vue:'parties',slot:1,org:'split',duo:true,choix:false,ecrase:false})}];S.futur=[];rendre();return;
  }
  if(ec!=='duo')return;
  S.du.demo=true;
  const v=q.get('duvue')||'qg';
  const n=Math.max(1,Math.min(DU_CARTES,+(q.get('dunum')||1)));S.du.n=n;
  if(['a','b','egal'].includes(q.get('dures')))S.du.res=q.get('dures');
  /* Les soirées des périodes passées sont jouées (en mémoire). */
  for(let k=1;k<n;k++)duAppliquer(k);
  S.date=duDateCarte(n-1);
  S.hist=[{mn:JSON.stringify({vue:'parties',slot:1,org:'split',duo:true,choix:false,ecrase:false})}];S.futur=[];
  if(v==='noms'){S.du.vue='noms';S.ecran='duo';rendre();return;}
  const ph=q.get('duphase');
  if(v==='qg'&&ph!=='carte'){S.du.vue='qg';S.du.phase='debut';S.ecran='duo';rendre();return;}
  duAppliquer(n);S.date=duDateCarte(n);S.du.phase='carte';
  if(v==='qg'){S.du.vue='qg';S.ecran='duo';rendre();return;}
  /* Enchères : &dulot=0..2, &dumise=nombre de mises déjà faites, &ducas=gagne|personne|caisse. */
  S.du.enc=duEncNeuve();const E=S.du.enc,lot=Math.min(E.lots.length-1,+(q.get('dulot')||0));
  for(let i=0;i<lot;i++){const L=E.lots[i];S.du.enc.i=i;duMiserDemo(i%2?2:3);if(!L.fini)duAbandonnerDemo();}
  S.du.enc.i=lot;
  if(v==='encheres'){const cas=q.get('ducas'),m=+(q.get('dumise')||0);
    if(cas==='personne'){duAbandonnerDemo();duAbandonnerDemo();}
    else if(cas==='caisse')duMiserDemo(200);
    else{duMiserDemo(cas==='gagne'?Math.max(1,m):m);if(cas==='gagne')duAbandonnerDemo();}
    S.du.vue='encheres';S.ecran='duo';rendre();return;}
  E.lots.slice(lot).forEach((L,j)=>{S.du.enc.i=lot+j;duMiserDemo(j%2?1:2);duAbandonnerDemo();});S.du.enc.i=E.lots.length;
  /* Draft : &dupicks=0..12 choix faits, &duresume=1 ouvre le résumé, &durefus=1 montre un refus. */
  const np=v==='draft'?Math.max(0,Math.min(12,+(q.get('dupicks')||0))):12;duAuto(np);
  if(v==='draft'){S.du.vue='draft';S.ecran='duo';if(q.get('duresume')==='1'&&duDraft().fini)S.du.conf='resume';rendre();
    if(q.get('durefus')==='1'){const D=duDraft(),c=D.tour,f=duRosterDe(c).find(x=>D.att==='place'?duRefusPlace(x,c,D):duIndispo(x,c,D));if(f)duChoisir(f.id);}
    return;}
  duJouer();S.date=duDateCarte(n);
  if(v==='soiree'){const i=Math.max(0,Math.min(5,+(q.get('duc')||0))),et=['direct','fort','resultat'].includes(q.get('dusoiree'))?q.get('dusoiree'):'direct';
    S.du.so={i,etat:et,revoir:false};S.du.vue='soiree';S.ecran='duo';rendre();return;}
  if(v==='bilan'){S.du.vue='bilan';S.ecran='duo';rendre();return;}
  S.du.vue='qg';S.ecran='duo';rendre();
});
/** Démonstration : les mises de l'adresse, sans rendu entre deux. */
function duMiserDemo(k){for(let x=0;x<k;x++){const L=duLot();if(!L||L.fini)return;const p=duProchainPrix(L);if(duCaisse(L.tour)<p){L.refus=true;return;}L.prix=p;L.meneur=L.tour;L.passes=0;L.mises.push({c:L.tour,p});L.tour=duAutre(L.tour);}}
function duAbandonnerDemo(){const L=duLot();if(!L||L.fini)return;
  if(L.meneur!==null){L.fini=true;L.gagnant=L.meneur;L.abandon=L.tour;S.du.payes[L.gagnant]+=L.prix;S.du.recrues.push({c:L.gagnant,id:L.id,prix:L.prix,b:L.b});}
  else{L.passes++;L.mises.push({c:L.tour,p:0});if(L.passes>=2)L.fini=true;else L.tour=duAutre(L.tour);}}
/* ==== [FIN ANCRE] ==== */
