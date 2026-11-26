"use strict";
/* ==== [ANCRE: MAQUETTE_FIN_SAISON] — La fin de saison (Q34a, R33, R34, R35, T10). Préfixe fd- (classes), fd / FD_ (fonctions, constantes).
   Chargé juste avant barre.js. Refait après le retour du 23/11 : « trop d'informations et trop peu à la fois, des cases vides, pas soigné ».
   Une idée par scène, sur le tunnel du jeu, comme Nouvelle partie ; le verdict se dévoile comme la décision des juges de la Soirée.
     1. message du patron  2. LE VERDICT (Tu restes / Tu pars)  3. les offres  4. les prix  5. le classement  6. la suite  7. le choc, par message.
   Le seuil d'objectifs manqués reste ouvert : les cas montrés (3 sur 3, 1 sur 3, 0 sur 3) ne fixent aucune règle.
   Une offre ne change jamais l'organisation active : même acceptée, la maquette reste sur Split. Aucune sauvegarde du jeu n'est lue ni écrite.
   Adresse : ?ecran=finsaison&fdetape=mi|message|bilan|offres|prix|classement|suite|choc|negocier|saisons &fdcas=tenu|avert|renvoi &fdoffre=avec|sans
   &fddec=rester|offre0|offre1|sans &fdconf=rester|accepter|refuser|fin|choc|chocrefus &fdchoc=recu|accepte|refuse &fdnch=0..11 &fdnmode=champ|classe &fdprix=0..5
   &fdsaison=2027|2028 &fdong=bilan|prix|classement|choc &fdcombat=<clé> &fdmots=jeu|q34 &fdordre=verdict|prix &fdvide=1 &fdrev=0 (sans dévoilement). ==== */

const FD_CLE='maquette-finsaison-3';
const FD_ETAPES=['mi','message','bilan','offres','prix','classement','suite','choc','negocier','saisons'];
const FD_MOIS=['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
const fdD=(j,m,a)=>new Date(a,m,j);
const fdDate=(d,an=true)=>`${d.getDate()===1?'1er':d.getDate()} ${FD_MOIS[d.getMonth()]}${an?' '+d.getFullYear():''}`;
const fdJour=d=>d.getDate()===1?'1<span class="fd-nc">er</span>':d.getDate();
const fdLong=d=>`${JOURS[d.getDay()]} ${fdJour(d)} ${MOIS[d.getMonth()]} ${d.getFullYear()}`;
const fdOt=n=>`<span class="fd-nc">${n}/8</span>`;
const fdEuro=v=>`${nb(v)} €`;
const FD_RELIRE='<span class="relire">à relire</span>';
const FD_SALAIRE=3200;
const FD_PATRON='Gérard Vasseur';
Object.assign(P,{
  fdCoche:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',fdCroix:'<path d="M6 6l12 12M18 6L6 18"/>',
  fdCeinture:'<path stroke-linejoin="bevel" d="M3 18.5h18M4 18.5L3 7.5l5 4L12 5l4 6.5 5-4-1 11"/>',
  fdEclair:'<path d="M13.5 2.5L5 13.5h6l-1 8 8.5-11h-6z"/>',
  fdNoeud:'<circle cx="8" cy="8" r="4.5"/><path d="M11.4 11.4L20.5 20.5M16 16l3-3M13.4 13.4l2.4-2.4"/>',
  fdFlamme:'<path d="M12 2.5c1 4 6 6 6 12a6 6 0 01-12 0c0-3 2-4 2.5-7 1.5 1 2.5 2 3 3.5.8-2.5 1-5.5.5-8.5z"/>',
  fdEtoile:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  fdRetour:'<path d="M5 9h10a5 5 0 010 10H9"/><path d="M9 5L5 9l4 4"/>',
});

/* ---- Les classements de fin de saison (inventés, à relire). 2027 part du classement de l'Organisation ; Split 6e ou 2e reste ouvert. ---- */
const FD_CL={
  tenu:['Garden of Blood','Undisputed Cage','Pure Impact','Split','Fighting Pacific Championship','Knuckle Gate','Ultimate Rim','MMA Korner'],
  avert:['Garden of Blood','Undisputed Cage','Fighting Pacific Championship','Pure Impact','Knuckle Gate','Split','Ultimate Rim','MMA Korner'],
  renvoi:['Garden of Blood','Undisputed Cage','Fighting Pacific Championship','Pure Impact','Knuckle Gate','Ultimate Rim','Split','MMA Korner'],
};
const fdListe=l=>l.length<2?l.join(''):`${l.slice(0,-1).join(', ')} et ${l[l.length-1]}`;
const fdCourt=n=>{const o=OG_ORGS.find(x=>x.nom===n);return o&&o.court||n;};
const fdDepart=annee=>annee===2027?ogClasse().map(x=>x.nom):FD_CL.avert;
const fdClasse=(annee,issue)=>{const av=fdDepart(annee);return FD_CL[issue].map((nom,i)=>({nom,rang:i+1,avant:av.indexOf(nom)+1}));};
const fdPlace=issue=>FD_CL[issue].indexOf('Split')+1;
/* Le rang fixe le palier de la saison suivante (MGMT_PALIERS du jeu, en supposant la popularité suffisante). */
const fdPalier=p=>p<=4?2:p<=6?1:0;

/* ---- Les objectifs : ceux de Ta carrière en 2027. L'année d'après, le jeu vise une place de mieux que la place finale. ---- */
function fdObjectifs(annee,issue){
  const faure=parId('gpoidslourdC'),place=fdPlace(issue),av=fdDepart(annee),moi=av.indexOf('Split'),but=annee===2027?4:5;
  const passes=FD_CL[issue].filter((n,i)=>i>place-1&&av.indexOf(n)<moi).map(fdCourt);
  const devant=FD_CL[issue].slice(but-1,place-1).map(fdCourt);
  const mond=issue==='tenu'?5:issue==='avert'?9:11,dep=annee===2027?8:9;
  const salle=annee===2027
    ?{type:'salle',lab:'Remplir le Forum de Lille',v:RS_SOIREES.find(x=>x.n===63).public[0],but:4000,det:'Fight Night 63, le 16 févr.',relire:true}
    :{type:'salle',lab:'Remplir le Palais des sports de Lyon',v:5240,but:5800,det:'Fight Night 69, le 8 avr.'};
  return [
    {type:'rang',lab:`Finir dans le top ${but}`,v:place,but,avant:moi+1,liste:FD_CL[issue],det:place<=but?(passes.length?`Split passe ${fdListe(passes)}.`:`Split finit ${place}/8.`):`Devant Split : ${fdListe(devant)}.`},
    {type:'mondial',lab:'Un poids lourd dans le top 5 mondial',v:mond,but:5,avant:dep,det:`${lien(faure)} : n° ${dep} en janvier, n° ${mond} aujourd’hui.`},
    salle,
  ];
}
/* Ce que Gérard Vasseur attend la saison d'après : une place de mieux (règle du jeu). */
function fdProchains(){
  const F=S.fd,a=fdAnnee()+1,pl=fdPlace(F.cas),but=Math.max(1,pl-1),faure=parId('gpoidslourdC'),mond=F.cas==='tenu'?5:9,cible=F.cas==='tenu'?3:5;
  const dev=FD_CL[F.cas].slice(but-1,pl-1).map(fdCourt);
  return [
    {type:'rang',lab:`Finir dans le top ${but}`,v:pl,but,avant:pl,afaire:true,liste:FD_CL[F.cas],det:`À passer : ${fdListe(dev)}.`},
    {type:'mondial',lab:`Un poids lourd dans le top ${cible} mondial`,v:mond,but:cible,avant:mond,afaire:true,det:`Meilleur : ${lien(faure)}.`},
    {type:'salle',lab:'Remplir le Palais des sports de Lyon',v:0,but:5800,afaire:true,det:`Fight Night 69, le 8 avr. ${a}.`},
  ];
}
const fdTenu=o=>o.type==='salle'?o.v>=o.but:o.v<=o.but;
const FD_V={
  tenu:{mot:'Tu restes',tag:'',phrase:'1 saison de plus, +800 € par mois.',dit:'Je suis fier de ce que tu as construit.',fil:'brightness(1) saturate(1.05)'},
  avert:{mot:'Tu restes',tag:'1er avertissement',phrase:'1 saison pour redresser. Manqués en 2028 : renvoi.',dit:'Je commence à douter.',fil:'brightness(.5) saturate(.5)'},
  renvoi:{mot:'Tu pars',tag:'2e échec de suite',phrase:'2 saisons d’objectifs manqués. Contrat terminé ce soir.',dit:'Tu as perdu ma confiance.',fil:'grayscale(1) brightness(.36)'},
};
const FD_MOTS={jeu:{tenu:'Prolongé',avert:'Sous condition',renvoi:'Remercié'},q34:{tenu:'Prolongé',avert:'Avertissement',renvoi:'Renvoyé'}};
const FD_MI={tenu:'Je suis content de ce que je vois à mi-saison.',avert:'J’attends de voir comment tu termines la saison.',renvoi:'Je commence à douter de la direction prise.'};

/* ---- Les offres : la règle du jeu (mgmtOffresCreer) ----
   Sans renvoi, une organisation mieux classée ; après un renvoi, une moins bien classée. Salaire : 3 200 € × (1 + écart de places / 10), borné à ± 30 %. */
function fdOffre(nom,place,moi){
  const d=Math.min(.3,Math.max(-.3,(moi-place)/10)),o=ogClasse().find(x=>x.nom===nom);
  return {nom,place,salaire:Math.round(FD_SALAIRE*(1+d)),o,m:MN_ORGS.find(x=>x.nom===nom)};
}
function fdOffres(){
  const F=S.fd;
  if(F.tardive)return [fdOffre('MMA Korner',8,7)];
  if(!F.avec)return [];
  if(F.cas==='tenu')return [fdOffre('Undisputed Cage',2,4),fdOffre('Pure Impact',3,4)];
  return F.cas==='avert'?[fdOffre('Knuckle Gate',5,6)]:[fdOffre('MMA Korner',8,7)];
}
const fdRestantes=()=>fdOffres().map((o,i)=>Object.assign({i},o)).filter(o=>!S.fd.refus.includes(o.i));

/* ---- Les combats des prix. Ceux de la 63 sont lus dans les Résultats ; les autres sont inventés, à relire. ---- */
const FD_X={
  x27a:{a:'fdferrand',b:'gpoidscoq12',g:'a',meth:'KO',det:'crochet du gauche',rd:1,tps:'2:08',n:3,s:'Fight Night 66',d:fdD(18,8,2027),v:'Marseille'},
  x27c:{a:'mezouar',b:'labbe',g:'a',meth:'Décision',det:'unanime',rd:5,tps:'5:00',n:5,titre:true,s:'Fight Night 65',d:fdD(12,5,2027),v:'Nantes'},
  x27d:{a:'mezouar',b:'bello',g:'a',meth:'Soumission',det:'guillotine',rd:3,tps:'2:41',n:5,titre:true,s:'Fight Night 67',d:fdD(13,10,2027),v:'Lyon'},
  x27e:{a:'fdferrand',b:'gpoidscoq23',g:'a',meth:'Décision',det:'unanime',rd:3,tps:'5:00',n:3,s:'Fight Night 64',d:fdD(3,3,2027),v:'Bordeaux'},
  x27f:{a:'fdferrand',b:'gpoidscoq24',g:'a',meth:'Soumission',det:'étranglement arrière',rd:2,tps:'4:11',n:3,s:'Fight Night 67',d:fdD(13,10,2027),v:'Lyon'},
  x27b:{a:'rizzo',b:'gpoidsmouche9',g:'a',meth:'Décision',det:'unanime',rd:3,tps:'5:00',n:3,s:'Fight Night 65',d:fdD(12,5,2027),v:'Nantes'},
  x28f:{a:'rachidi',b:'gpoidspaillef4',g:'a',meth:'Décision',det:'unanime',rd:3,tps:'5:00',n:3,s:'Fight Night 68',d:fdD(19,1,2028),v:'Marseille'},
  x28a:{a:'rachidi',b:'gpoidspaillefC',g:'a',meth:'Décision',det:'unanime',rd:5,tps:'5:00',n:5,titre:true,s:'Fight Night 70',d:fdD(10,5,2028),v:'Grenoble',nr:{a:'C',b:1}},
  x28g:{a:'rachidi',b:'meziane',g:'a',meth:'Décision',det:'unanime',rd:5,tps:'5:00',n:5,titre:true,s:'Fight Night 72',d:fdD(18,10,2028),v:'Bordeaux'},
  x28b:{a:'diallo',b:'gpoidsmimoyen8',g:'a',meth:'KO',det:'direct du droit',rd:1,tps:'0:41',n:3,s:'Fight Night 68',d:fdD(19,1,2028),v:'Marseille'},
  x28c:{a:'musaev',b:'gpoidsmouche12',g:'a',meth:'Soumission',det:'clé de cheville',rd:2,tps:'3:26',n:3,s:'Fight Night 71',d:fdD(16,8,2028),v:'Nice'},
  x28d:{a:'bello',b:'labbe',g:'a',meth:'Décision',det:'partagée',rd:3,tps:'5:00',n:3,s:'Fight Night 72',d:fdD(18,10,2028),v:'Bordeaux'},
  x28e:{a:'kessler',b:'gpoidsleger17',g:'a',meth:'Décision',det:'unanime',rd:3,tps:'5:00',n:3,s:'Fight Night 69',d:fdD(8,3,2028),v:'Lyon'},
};
function fdCombat(k){
  if(Object.hasOwn(FD_X,k))return Object.assign({vrai:false},FD_X[k]);
  if(!Object.hasOwn(RS_63,k)||k[0]!=='m')return null;
  const f=RS_63[k],b=PE_BASE.m[+k.slice(1)];if(!b)return null;
  return {a:b.a,b:b.b,g:f.g,meth:f.meth,det:f.det,rd:f.rd,tps:f.tps,n:f.n,titre:!!f.titre,s:'Fight Night 63',d:fdD(16,1,2027),v:'Lille',vrai:true,co:f.co};
}
/** Le seul nom ajouté : un espoir signé en 2027, car la règle de la révélation demande 5 combats au plus avant l'année. */
function fdFerrand(){
  let e=EXT.find(x=>x.id==='fdferrand');if(e)return e;
  e=parNom('Noa Ferrand','Poids coq');
  Object.assign(e,{id:'fdferrand',v:2,d:0,n:0,age:21,serie:'vv',statut:'dispo',rang:11,mondial:64,tend:'+9',depuis:'2027',style:'Frappeur, finit debout',dernier:fdD(14,10,2026),org:'Split'});
  return e;
}
const FD_PRIX={
  2027:[
    {id:'combattant',ic:'fdCeinture',t:'Combattant de l’année',n:['mezouar'],or:true,c:'m0',relire:true,phrase:'Ceinture des poids légers le 16 février, puis 2 défenses.',k:[['Saison','3-0','invaincu'],['Titre','3','combats'],['Finitions','2/3',''],['Mondial','n° 11','après le titre']]},
    {id:'ko',ic:'fdEclair',t:'KO de l’année',n:['belkacem'],c:'m2',relire:true,phrase:'Coup de pied à la tête, carte principale de la FN 63.',k:[['Temps','1:47','2e round'],['Coup','Tête','coup de pied'],['Contre','@bello','n° 3 chez Split'],['Soirée','FN 63','Lille, 16 févr.']]},
    {id:'soumission',ic:'fdNoeud',t:'Soumission de l’année',n:['mezouar'],or:true,c:'m0',relire:true,phrase:'Étranglement arrière, la ceinture des poids légers à la clé.',k:[['Temps','3:12','4e round'],['Prise','Arrière','étranglement'],['Contre','@nana','champion sortant'],['Soirée','FN 63','Lille, 16 févr.']]},
    {id:'combat',ic:'fdFlamme',t:'Combat de l’année',n:['rachidi','meziane'],c:'m1',relire:true,phrase:'3 rounds serrés, 2 juges sur 3 pour Rachidi, prime aux deux.',k:[['Juges','2-1','partagée'],['Frappes','43-41','significatives'],['Prime','Aux deux','combat de la soirée'],['Soirée','FN 63','Lille, 16 févr.']]},
    {id:'revelation',ic:'fdEtoile',t:'Révélation de l’année',n:['fdferrand'],c:'x27a',relire:true,phrase:'Signé à 21 ans, invaincu sur l’année.',k:[['Saison','3-0','invaincu'],['Finitions','2/3',''],['Âge','21','ans'],['À la signature','2-0','son bilan']]},
    {id:'retour',ic:'fdRetour',t:'Retour de l’année',n:['rizzo'],c:'x27b',relire:true,phrase:'8 mois d’absence, puis victoire à l’unanimité.',k:[['Sans combat','252','jours'],['Résultat','Victoire','décision unanime'],['Contre','@gpoidsmouche9','n° 9 chez Split'],['Soirée','FN 65','Nantes, 12 juin']]},
  ],
  2028:[
    {id:'combattant',ic:'fdCeinture',t:'Combattant de l’année',n:['rachidi'],or:true,c:'x28a',relire:true,phrase:'Ceinture des poids paille le 10 juin, invaincue sur l’année.',k:[['Saison','3-0','invaincu'],['Ceinture','Prise','le 10 juin'],['Contre','@gpoidspaillefC','championne sortante'],['Soirée','FN 70','Grenoble']]},
    {id:'ko',ic:'fdEclair',t:'KO de l’année',n:['diallo'],c:'x28b',relire:true,phrase:'Direct du droit, 41 secondes après le gong.',k:[['Temps','0:41','1er round'],['Coup','Direct','du droit'],['Contre','@gpoidsmimoyen8','n° 8 chez Split'],['Soirée','FN 68','Marseille, 19 févr.']]},
    {id:'soumission',ic:'fdNoeud',t:'Soumission de l’année',n:['musaev'],c:'x28c',relire:true,phrase:'Clé de cheville, la spécialité du sambiste.',k:[['Temps','3:26','2e round'],['Prise','Cheville','clé'],['Contre','@gpoidsmouche12','n° 12 chez Split'],['Soirée','FN 71','Nice, 16 sept.']]},
    {id:'combat',ic:'fdFlamme',t:'Combat de l’année',n:['bello','labbe'],c:'x28d',relire:true,phrase:'3 rounds jusqu’à la dernière seconde, 2 juges pour Bello.',k:[['Juges','2-1','partagée'],['Rounds','3','jusqu’au bout'],['Prime','Aux deux','combat de la soirée'],['Soirée','FN 72','Bordeaux, 18 nov.']]},
    {id:'revelation',ic:'fdEtoile',t:'Révélation de l’année',n:[],phrase:'Aucun combattant éligible.',k:[]},
    {id:'retour',ic:'fdRetour',t:'Retour de l’année',n:['kessler'],c:'x28e',relire:true,phrase:'18 mois d’absence, puis victoire à Lyon.',k:[['Sans combat','553','jours'],['Résultat','Victoire','décision unanime'],['Contre','@gpoidsleger17','chez Split'],['Soirée','FN 69','Lyon, 8 avr.']]},
  ],
};
/* Les soirées de la saison, pour le message du 31 décembre (hors 63 : inventées, à relire). */
const FD_SOIREES={
  2027:[[63,'16 févr.','Lille',4012],[64,'3 avr.','Bordeaux',3420],[65,'12 juin','Nantes',3980],[66,'18 sept.','Marseille',5640],[67,'13 nov.','Lyon',5710]],
  2028:[[68,'19 févr.','Marseille',5120],[69,'8 avr.','Lyon',5240],[70,'10 juin','Grenoble',3760],[71,'16 sept.','Nice',3900],[72,'18 nov.','Bordeaux',3300]],
};

/* ---- L'état de l'écran ---- */
const fdNeuf=()=>({cas:'tenu',avec:true,etape:'message',msg:'bilan',dec:null,refus:[],sel:0,prixi:0,conf:null,combat:null,saison:null,ong:'bilan',choc:'recu',carte:null,brouillon:null,negSel:0,negMode:'champ',negPick:{},chocVu:false,attente:0,tardive:false,termine:false,vu:false,sansRev:false,mots:'jeu',ordre:'verdict',anim:true,pose:false,demo:false});
S.fd=fdNeuf();
const FD_GARDE=['cas','avec','etape','msg','dec','refus','sel','prixi','saison','ong','choc','carte','negSel','negMode','negPick','chocVu','attente','tardive','termine','vu'];
const fdNbOffres=(cas,avec,tardive)=>tardive?1:!avec?0:cas==='tenu'?2:1;
const fdDecValide=(d,cas,n)=>d==='rester'?cas!=='renvoi':d==='sans'?cas==='renvoi':typeof d==='string'&&/^offre[01]$/.test(d)&&+d.slice(5)<n;
/** Une carte de choc gardée : cinq combats, chacun avec deux combattants qui existent, jamais deux fois le même. */
function fdCarteOk(v){
  if(!Array.isArray(v)||v.length!==5)return false;
  const cats=[...CATS.H,...CATS.F].map(x=>x[0]),ids=[];
  for(const x of v){if(!x||typeof x!=='object'||!cats.includes(x.c)||typeof x.a!=='string'||typeof x.b!=='string')return false;clMonde(x.c);if(!parId(x.a)||!parId(x.b))return false;ids.push(x.a,x.b);}
  return new Set(ids).size===ids.length;
}
/** Une mémoire abîmée ne casse jamais l'écran : chaque champ est contrôlé, ce qui est invalide garde sa valeur neuve. */
function fdLire(g){
  if(!g||typeof g!=='object'||!Object.hasOwn(FD_CL,g.cas))return;
  const F=S.fd,ent=(v,n)=>Array.isArray(v)&&v.every(x=>Number.isInteger(x)&&x>=0&&x<n);
  F.cas=g.cas;
  ['avec','chocVu','tardive','termine','vu'].forEach(k=>{if(typeof g[k]==='boolean')F[k]=g[k];});
  if(FD_ETAPES.includes(g.etape))F.etape=g.etape;
  if(typeof g.msg==='string'&&g.msg.length<12)F.msg=g.msg;
  if(ent(g.refus,2))F.refus=[...new Set(g.refus)];
  if(Number.isInteger(g.sel)&&g.sel>=0&&g.sel<2)F.sel=g.sel;
  if(Number.isInteger(g.prixi)&&g.prixi>=0&&g.prixi<6)F.prixi=g.prixi;
  if(g.saison===2027||g.saison===2028)F.saison=g.saison;
  if(['bilan','prix','classement','choc'].includes(g.ong))F.ong=g.ong;
  if(['recu','accepte','refuse'].includes(g.choc))F.choc=g.choc;
  if(fdCarteOk(g.carte))F.carte=g.carte;
  if(Number.isInteger(g.negSel)&&g.negSel>=0&&g.negSel<12)F.negSel=g.negSel;
  if(g.negMode==='champ'||g.negMode==='classe')F.negMode=g.negMode;
  if(g.negPick&&typeof g.negPick==='object'&&!Array.isArray(g.negPick))Object.entries(g.negPick).forEach(([k,v])=>{if(typeof v==='string'&&v.length<40)F.negPick[k]=v;});
  if(Number.isInteger(g.attente)&&g.attente>=0&&g.attente<=520)F.attente=g.attente;
  if(fdDecValide(g.dec,F.cas,fdNbOffres(F.cas,F.avec,F.tardive)))F.dec=g.dec;
  if(['choc','negocier'].includes(F.etape)&&F.dec!=='rester')F.etape='message';
  if(F.etape==='negocier'&&F.choc!=='recu')F.etape='choc';
  if(F.etape==='offres'&&!fdNbOffres(F.cas,F.avec,F.tardive))F.etape='bilan';
  if(F.tardive&&F.cas!=='renvoi')F.tardive=false;
}
try{fdLire(JSON.parse(localStorage.getItem(FD_CLE)));}catch(e){}
function fdGarder(){if(S.fd.demo)return;try{const o={};FD_GARDE.forEach(k=>{o[k]=S.fd[k];});localStorage.setItem(FD_CLE,JSON.stringify(o));}catch(e){}}
const fdVue=()=>{const {etape,msg,sel,prixi,combat,saison,ong,negSel,negMode,negPick,brouillon}=S.fd;return JSON.stringify({etape,msg,sel,prixi,combat,saison,ong,negSel,negMode,negPick,brouillon});};
const fdCle=()=>{const F=S.fd;return [F.etape,F.saison,F.ong,F.msg].join('|');};
function fdPas(maj){const av=fdCle();S.hist.push({fd:fdVue()});S.futur=[];maj();S.fd.anim=fdCle()!==av;rendre();}
function fdRestaure(j){const av=fdCle();Object.assign(S.fd,JSON.parse(j));if(S.fd.etape==='negocier'&&S.fd.choc!=='recu')S.fd.etape='choc';S.fd.anim=fdCle()!==av;rendre();}
const fdAnnee=()=>S.fd.cas==='renvoi'?2028:2027;
const fdRenvoi=()=>S.fd.cas==='renvoi';
const fdSigne=()=>{const d=S.fd.dec;return d&&d.startsWith('offre')?fdOffres()[+d.slice(5)]||null:null;};
const fdSansPoste=()=>fdRenvoi()&&(S.fd.dec==='sans'||!S.fd.dec);
const fdMvt=()=>typeof mvOk==='function'&&mvOk();

/* ---- Pièces communes ---- */
const fdOui=(l,a)=>`<button class="bouton jaune cj oct fd-oui" ${a}>${l} ${ico('avant',30,3)}</button>`;
const fdNon=(l,a)=>`<button class="bb oct fd-non" ${a}><span class="oct">${l}</span></button>`;
const fdMarques=n=>`<span class="fd-av" role="img" aria-label="${n} avertissement${n>1?'s':''} sur 2">${[0,1].map(i=>`<i class="octr ${i<n?'on':''}"></i>`).join('')}</span>`;
const fdTun=(fil,cl='')=>`<i class="fd-tun ${cl}" style="--fil:${fil}"></i>`;
const fdTaille=(t,l,max,min=40)=>mfCorps(String(t).toUpperCase(),l,max,min);
const fdBadge=(e,afaire)=>e==='cours'?`<span class="fd-eb cours">${afaire?'À faire':'En cours'}</span>`:`<span class="fd-eb ${e}"><i class="octr">${ico(e==='ok'?'fdCoche':'fdCroix',22,3.4)}</i>${e==='ok'?'Tenu':'Manqué'}</span>`;

/* Le repère de chaque objectif dit lui-même ce qu'il montre : pas de légende à chercher. */
function fdVisRang(o,e){
  const cases=Array.from({length:8},(_,k)=>{const n=k+1,nom=o.liste&&o.liste[k],moi=n===o.v;
    return `<span class="fd-rg ${n<=o.but?'vise':''} ${moi?'moi':''}" style="--k:${k}">${nom?ogEmb(nom,38):''}<small>${n}</small></span>`;}).join('');
  return `<div class="fd-vis fd-e-${e}"><div class="fd-rr">${cases}</div><div class="fd-acc" style="--n:${o.but};--t:8"><span>top ${o.but}</span></div></div>`;
}
function fdVisMonde(o,e){
  const cases=Array.from({length:12},(_,k)=>{const n=k+1;return `<span class="fd-mo octr ${n<=o.but?'vise':''} ${n===o.v?'moi':''} ${n===o.avant&&n!==o.v?'dep':''}" style="--k:${k}">${n}</span>`;}).join('');
  return `<div class="fd-vis fd-e-${e}"><div class="fd-mr">${cases}</div><div class="fd-acc" style="--n:${o.but};--t:12"><span>top ${o.but}</span></div></div>`;
}
function fdVisSalle(o,e){
  const N=96,n=Math.round(Math.min(1,o.v/o.but)*N);
  return `<div class="fd-vis fd-e-${e}"><div class="fd-ti">${Array.from({length:N},(_,k)=>`<i class="${k<n?'on':''}" style="--k:${k}"></i>`).join('')}</div><div class="fd-tl"><span>${Math.min(100,Math.round(o.v/o.but*100))} % de la salle</span><span>${nb(o.but)} places</span></div></div>`;
}
function fdValeursObj(o,e){
  const val=o.type==='rang'?fdOt(o.v):o.type==='mondial'?`n° ${o.v}`:`<span data-fdn="${o.v}">${nb(o.v)}</span>`;
  const vise=o.type==='rang'?`${o.but}/8 ou mieux`:o.type==='mondial'?`n° ${o.but} ou mieux`:`${nb(o.but)} places`;
  const vis=o.type==='rang'?fdVisRang(o,e):o.type==='mondial'?fdVisMonde(o,e):fdVisSalle(o,e);
  return {vis,chiffre:`<div class="fd-cn"><b class="T">${val}</b><span class="fd-cf"><small>${'Objectif'}</small><b>${vise}</b></span></div>`};
}
function fdCarteObj(o,e,i){
  const v=fdValeursObj(o,e);
  return `<article class="fd-c fd-c-${e} oct" style="--i:${i}"><div class="fd-ci oct">
    <div class="fd-ch"><span class="fd-cl">${esc(o.lab)}${FD_RELIRE}</span>${fdBadge(e,o.afaire)}</div>
    ${v.chiffre}${v.vis}<p class="fd-cd">${o.det}</p></div></article>`;
}
function fdLigneObj(o,e,i){
  const v=fdValeursObj(o,e);
  return `<article class="fd-c fd-l fd-c-${e} oct" style="--i:${i}"><div class="fd-ci oct"><div class="fd-lt">${fdBadge(e)}<span class="fd-cl">${esc(o.lab)}${FD_RELIRE}</span><p class="fd-cd">${o.det}</p></div><div class="fd-lv">${v.vis}</div>${v.chiffre}</div></article>`;
}
const fdEtatDe=o=>fdTenu(o)?'ok':'ko';

/* ---- 1. Le verdict : les objectifs se retournent un à un, puis la décision tombe ---- */
function fdBarCases(issue,annee){
  const fin=fdDate(fdD(31,11,annee+1)),act=fdDate(fdD(31,11,annee)),c=(l,v,s,x='')=>`<div class="fd-bc"><span class="etiq">${l}</span><span class="fd-bv"><b class="T">${v}</b>${x}</span><small>${s}</small></div>`;
  if(issue==='tenu')return c('Contrat','1 saison',`jusqu’au ${fin}`)+c('Salaire',fdEuro(4000),'par mois · <span class="cl-up">▲ 800 €</span>')+c('Avertissements','Aucun','compteur à zéro',fdMarques(0));
  if(issue==='avert')return c('Contrat','1 saison',`jusqu’au ${fin}`)+c('Salaire',fdEuro(FD_SALAIRE),'par mois · inchangé')+c('Avertissements','1/2','au prochain : le renvoi',fdMarques(1));
  return c('Contrat','Terminé',`le ${act}`)+c('Combattants','Restent','chez Split')+c('Avertissements','2/2','le renvoi',fdMarques(2));
}
function fdActions(){
  const F=S.fd,res=fdRestantes(),n=res.length;
  if(F.dec)return `<div class="fd-fait">${ico('fdCoche',28,3)}<span>${fdDecLabel()}</span></div>`;
  const off=n?fdNon(n>1?`Voir les ${n} offres`:'Voir l’offre','data-fdgo="offres"'):'';
  if(F.cas==='renvoi')return n?fdOui(n>1?`Voir les ${n} offres`:'Voir l’offre','data-fdgo="offres"'):fdOui('Suite','data-fdsans');
  return `${off}${fdOui(F.cas==='tenu'?'Rester chez Split':'Accepter les conditions','data-fdconf="rester"')}`;
}
const fdDecLabel=()=>{const F=S.fd,s=fdSigne();return s?`Tu signes chez ${esc(fdCourt(s.nom))}`:F.dec==='rester'?'Tu restes chez Split':F.dec==='sans'?'Tu quittes Split, sans poste':'';};
function fdTeaseOffres(){
  const n=fdRestantes();if(!n.length||S.fd.dec)return '';
  return `<div class="fd-bc fd-boff"><span class="etiq">${n.length>1?`${n.length} offres reçues`:'1 offre reçue'}</span><span class="fd-bv"><b class="T" style="font-size:${n.length>1?30:40}px">${n.map(o=>esc(fdCourt(o.nom))).join(', ')}</b></span><small>${n.map(o=>`${o.place}/8`).join(', ')}</small></div>`;
}
function fdVerdictHtml(rev){
  const F=S.fd,a=fdAnnee(),i=F.cas,v=FD_V[i],os=fdObjectifs(a,i);
  return `<div class="fd-sc fd-${i} ${rev?'fd-rev':''}" data-fdscene>${fdTun(v.fil)}<i class="fd-voile-v"></i>
    <div class="fd-v">
      <div class="fd-vh">
        <div class="fd-att"><span class="T">Décision de ${FD_PATRON}</span><span class="fd-att-p"><i class="octr"></i><i class="octr"></i><i class="octr"></i></span></div>
        <div class="fd-vt">
          <span class="fd-eye">Saison ${a} · décision de ${FD_PATRON}</span>
          <div class="fd-mot"><h1 class="T fd-verdict">${v.mot}</h1><span class="fd-tampon"><b class="T">${FD_MOTS[F.mots][i]}</b>${v.tag?`<small>${v.tag}</small>`:''}</span></div>
          <p class="fd-phrase">${v.phrase}</p>
          <p class="fd-dit">« ${v.dit} »${FD_RELIRE}</p>
        </div>
      </div>
      <div class="fd-cs">${os.map((o,k)=>fdCarteObj(o,fdEtatDe(o),k)).join('')}</div>
      <div class="fd-bar">${fdBarCases(i,a)}${fdTeaseOffres()}<div class="fd-act">${fdActions()}</div></div>
    </div></div>`;
}

/* ---- 2. Les offres : la scène de Nouvelle partie, chaque chiffre face à Split ---- */
function fdOffresHtml(){
  if(!S.fd.dec&&!fdRestantes().length&&!fdRenvoi())return fdVerdictHtml(false);
  const F=S.fd,l=fdOffres().map((o,i)=>Object.assign({i},o)),res=l.filter(o=>!F.refus.includes(o.i)),cur=res.find(o=>o.i===F.sel)||res[0]||l[0],moi=fdPlace(F.cas),r=fdRenvoi(),base=F.cas==='tenu'?4000:FD_SALAIRE;
  const rail=l.map(o=>{const ref=F.refus.includes(o.i),on=!ref&&o.i===cur.i;
    return `<button class="mn-r fd-ro oct ${on?'on':''} ${ref?'ref':''}" data-fdoff="${o.i}" ${ref?'disabled':''} aria-pressed="${on}">${ogEmb(o.nom,64)}<span class="fd-rt"><span class="T" style="font-size:${mfCorps(fdCourt(o.nom),250,40,26)}px">${esc(fdCourt(o.nom))}</span><small>${ref?'Offre refusée':`${o.place}/8 · ${fdEuro(o.salaire)}`}</small></span></button>`;}).join('');
  const reste=`<div class="fd-reste oct">${ogEmb('Split',52)}<span class="fd-rt"><span class="etiq">${r?'Tu quittes':'Si tu restes'}</span><b class="T">Split</b><small>${r?`${moi}/8 · contrat terminé`:`${moi}/8 · ${fdEuro(base)}`}</small></span></div>`;
  const d=cur.salaire-base,dv=`<em class="${d>0?'cl-up':d<0?'cl-down':''}">${d>0?'▲':d<0?'▼':'='} ${fdEuro(Math.abs(d))}</em>`;
  const b8=Array.from({length:8},(_,k)=>`<i class="octr ${k+1===cur.place?'on':''} ${k+1===moi?'split':''}"></i>`).join('');
  const t=(lab,v,s,x='')=>`<div class="mn-t"><span class="etiq">${lab}</span><b class="T" style="font-size:${fdTaille(v.replace(/<[^>]+>/g,''),290,76)}px">${v}</b><small>${s}</small>${x}</div>`;
  const moiO=ogClasse().find(x=>x.nom==='Split'),m=cur.o.meilleurs&&cur.o.meilleurs[0];
  const hero=`<div class="mn-hh fd-hh ${F.pose?'fd-hanim':''}" style="--t:${ogTeinte(cur.nom)[0]}"><div class="mn-hl"><span class="mn-lieu">${esc(cur.m.lieu)}</span><h2 class="T mn-hn fd-verdict" style="font-size:${mfCorps(fdCourt(cur.nom),1290,176,80)}px">${esc(fdCourt(cur.nom))}</h2>
      <p class="mn-hp fd-prop">te propose le poste de matchmaker.</p><p class="fd-pt">${esc(cur.m.t)}</p>
      <div class="mn-chips">${cur.m.p.map(x=>`<span class="mn-ch"><b class="pl">+</b>${esc(x)}</span>`).join('')}${cur.m.m.map(x=>`<span class="mn-ch"><b class="mo">−</b>${esc(x)}</span>`).join('')}</div></div>
    <div class="mn-tg fd-tg4">${t('Place',cur.place+'/8','',`<div class="mn-b8" aria-hidden="true">${b8}</div><div class="fd-b8l"><span><i class="octr on"></i>${esc(fdCourt(cur.nom))}</span><span><i class="octr split"></i>Split, ${moi}/8</span></div>`)}
      ${t('Salaire',fdEuro(cur.salaire),r?'par mois':'par mois, face à Split',`<div class="fd-tx">${r?`avant : ${fdEuro(FD_SALAIRE)}`:`Split : ${fdEuro(base)}`} ${dv}</div>`)}
      ${t('Contrat','1 saison',`jusqu’au ${fdDate(fdD(31,11,fdAnnee()+1))}`,`<div class="fd-tx">Matchmaker</div>`)}
      ${t('Spectateurs',nb(cur.o.pub),'par soirée',`<div class="fd-tx">Split : ${nb(moiO.pub)}</div>`)}</div>
    <div class="fd-fa"><span class="etiq">Meilleur classé</span><b>${m?`${lien(m)}, n° ${m.mondial} mondial`:'—'}</b><span class="etiq">Salles</span><b>${esc(cur.o.salles)}</b></div></div>`;
  let bas;
  if(F.dec)bas=`<div class="fd-fait">${ico('fdCoche',28,3)}<span>${fdDecLabel()}</span></div>`;
  else if(res.length)bas=`${r?'':fdNon('Rester chez Split','data-fdconf="rester"')}${fdNon('Refuser','data-fdconf="refuser" data-fdi="'+cur.i+'"')}${fdOui(`Signer chez ${esc(fdCourt(cur.nom))}`,`data-fdconf="accepter" data-fdi="${cur.i}"`)}`;
  else bas=r?fdOui('Suite','data-fdsans'):fdOui(F.cas==='tenu'?'Rester chez Split':'Accepter les conditions','data-fdconf="rester"');
  return `<div class="fd-sc fd-off ${F.anim?'fd-entre':''}">${fdTun(`${ogTeinte(cur.nom)[1]||'none'} brightness(.9)`,'cote')}<i class="fd-voile-c"></i>
    <div class="mn-rail fd-rail"><div class="fd-rh"><span class="etiq">Reçue${l.length>1?'s':''} le ${fdDate(F.tardive?fdAttente():fdD(31,11,fdAnnee()))}</span></div>${rail}${reste}</div>
    <div class="mn-hero fd-hero">${hero}</div><div class="fd-cta">${bas}</div></div>`;
}

/* ---- 3. Les prix : six trophées, un seul à l'écran, le nom en grand ---- */
function fdNomsPrix(p){
  p.n.forEach(id=>{if(id==='fdferrand')fdFerrand();});
  if(p.n.length===2){const a=parId(p.n[0]),b=parId(p.n[1]);return {html:`<span class="nom" data-fiche="${a.id}">${esc(a.nom)}</span> <span class="fd-vs">contre</span> <span class="nom" data-fiche="${b.id}">${esc(b.nom)}</span>`,brut:`${a.nom} contre ${b.nom}`,haut:a.cat};}
  const c=parId(p.n[0]);return {html:`<span class="nom" data-fiche="${c.id}">${esc(c.nom)}</span>`,brut:c.nom,haut:`${c.prenom}${c.surnom?` « ${c.surnom} »`:''} · ${c.cat}`};
}
const fdValeur=v=>{if(v[0]!=='@')return {h:esc(v),b:v};const c=parId(v.slice(1));return {h:`<span class="nom" data-fiche="${c.id}">${esc(c.nom)}</span>`,b:c.nom};};
function fdPrixRail(a,cur){
  return FD_PRIX[a].map((p,i)=>{const on=i===cur,nom=p.n.length?p.n.map(id=>{if(id==='fdferrand')fdFerrand();return parId(id).nom;}).join(' – '):'Aucun candidat';
    return `<button class="mn-r fd-rp oct ${on?'on':''}" data-fdprix="${i}" aria-pressed="${on}"><span class="fd-med octr"><span class="octr">${ico(p.ic,26,2.2)}</span></span><span class="fd-rt"><small>${p.t}</small><span class="T" style="font-size:${mfCorps(nom.toUpperCase(),300,32,22)}px">${esc(nom)}</span></span></button>`;}).join('');
}
function fdPrixHero(a,p){
  if(!p.n.length)return `<div class="mn-hh fd-hh fd-hanim"><div class="mn-hl"><span class="mn-lieu">${p.t} ${a}</span><h2 class="T mn-hn" style="font-size:130px">Aucun candidat</h2><p class="mn-hp">${p.phrase}</p></div></div>`;
  const n=fdNomsPrix(p),t=p.k.map(([l,v,s])=>{const x=fdValeur(v);return `<div class="mn-t"><span class="etiq">${l}</span><b class="T" style="font-size:${fdTaille(x.b,290,76)}px">${x.h}</b><small>${s}</small></div>`;}).join('');
  return `<div class="mn-hh fd-hh ${S.fd.pose?'fd-hanim':''}" style="--t:var(--jaune)"><div class="mn-hl"><span class="mn-lieu">${p.t} ${a}${p.relire?FD_RELIRE:''}</span>
      <span class="fd-pn">${esc(n.haut)}</span><h2 class="T mn-hn" style="font-size:${mfCorps(n.brut.toUpperCase(),1290,170,70)}px">${n.html}</h2><p class="mn-hp">${p.phrase}</p></div>
    <div class="mn-tg fd-tg4 fd-tgp">${t}</div></div>`;
}
function fdPrixHtml(){
  const F=S.fd,a=fdAnnee(),l=FD_PRIX[a],i=Math.min(F.prixi,l.length-1),p=l[i],or=!!p.or;
  return `<div class="fd-sc fd-prix ${F.anim?'fd-entre':''}">${fdTun(or?'brightness(.82)':'brightness(.62) saturate(.85)',`cote ${or?'or':''}`)}<i class="fd-voile-c"></i>
    <div class="mn-rail fd-rail"><div class="fd-rh"><span class="etiq">Saison ${a}</span><small>choisis par la presse</small></div>${fdPrixRail(a,i)}</div>
    <div class="mn-hero fd-hero">${fdPrixHero(a,p)}</div>
    <div class="fd-cta">${p.n.length?`${fdNon(p.n.length>1?'Fiche de '+esc(parId(p.n[0]).nom):'Voir la fiche',`data-fiche="${p.n[0]}"`)}${fdNon('Voir le combat',`data-fdcombat="${p.c}"`)}`:''}</div></div>`;
}

/* ---- 4. Le classement : les huit glissent de leur place de janvier à leur place finale ---- */
function fdColonne(x,anim){
  const t=ogTeinte(x.nom),d=x.avant-x.rang,moi=x.nom==='Split';
  return `<div class="fd-col oct ${moi?'moi':''} ${anim?'bouge':''}" style="--d:${d};--i:${x.rang};--t:${t[0]}"><div class="fd-coli oct"><i class="fd-colt" style="filter:${t[1]||'none'} brightness(${moi?1:.72})"></i>
    <b class="T fd-colr">${x.rang}</b>${ogEmb(x.nom,84)}<span class="T fd-coln" style="font-size:${mfCorps(fdCourt(x.nom),176,34,20)}px">${esc(fdCourt(x.nom))}</span>
    <span class="fd-colm ${d>0?'cl-up':d<0?'cl-down':''}">${d>0?`▲ ${d}`:d<0?`▼ ${-d}`:'='}</span><small>${x.avant}/8 en janvier</small></div></div>`;
}
function fdEffets(annee,issue){
  const n=fdPalier(fdPlace(issue)),c=(l,v)=>`<div class="fd-bc"><span class="etiq">${l}</span><span class="fd-bv"><b class="T">${v}</b></span></div>`;
  return n?`${c('Diffuseur',`+${n} %`)}${c('Recruteur',`−${n} %`)}${c('Agents libres',`Palier ${n}/3`)}${c('Salles',`−${n} %`)}`:'<div class="fd-bc fd-bcl"><span class="etiq">Paliers</span><span class="fd-bv"><b class="T">Aucun à ce rang</b></span></div>';
}
function fdClassementHtml(){
  const F=S.fd,a=fdAnnee(),i=F.cas,l=fdClasse(a,i),s=l.find(x=>x.nom==='Split'),d=s.avant-s.rang;
  const dit=d>0?`${d} place${d>1?'s':''} gagnée${d>1?'s':''} en ${a}`:d<0?`${-d} place${d<-1?'s':''} perdue${d<-1?'s':''} en ${a}`:`la même place qu’en janvier`;
  return `<div class="fd-sc fd-clas ${F.anim?'fd-entre':''}">${fdTun(FD_V[i].fil)}<i class="fd-voile-v"></i>
    <div class="fd-cl-h"><span class="fd-eye">Classement final · 31 déc. ${a}${FD_RELIRE}</span><h2 class="T fd-cl-t">Split finit ${fdOt(s.rang)}</h2><p class="fd-phrase">${dit}</p></div>
    <div class="fd-cols">${l.map(x=>fdColonne(x,F.anim&&fdMvt())).join('')}</div>
    <div class="fd-bar fd-bar-e"><div class="fd-bc fd-bct"><span class="etiq">Conséquences</span><span class="fd-bv"><b class="T">En ${a+1}</b></span><small>pour Split${FD_RELIRE}</small></div>${fdEffets(a,i)}</div></div>`;
}

/* ---- 5. Après la décision : la saison suivante, l'arrivée ailleurs, ou sans poste ---- */
function fdSaisonSuivanteHtml(){
  const F=S.fd,a=fdAnnee()+1,os=fdProchains();
  return `<div class="fd-sc fd-${F.cas} fd-nv ${F.anim?'fd-entre':''}">${fdTun(F.cas==='tenu'?FD_V.tenu.fil:'brightness(.66) saturate(.75)')}<i class="fd-voile-v"></i>
    <div class="fd-v"><div class="fd-vh fd-vh2"><div class="fd-vt"><span class="fd-eye">${fdDate(fdD(1,0,a))} · objectifs de ${FD_PATRON}${FD_RELIRE}</span><h1 class="T fd-verdict">Saison ${a}</h1>
      <p class="fd-phrase">${F.cas==='tenu'?'Objectif : une place de mieux.':'3 objectifs, jugés le 31 décembre. Manqués : renvoi.'}</p></div></div>
    <div class="fd-cs">${os.map((o,k)=>fdCarteObj(o,'cours',k)).join('')}</div>
    <div class="fd-bar">${fdBarCases(F.cas,a-1)}<div class="fd-act"><div class="fd-fait fd-neutre"><span>Jugés le 31 déc. ${a}</span></div>${fdNon('Carrière','data-fdcarriere')}</div></div></div></div>`;
}
function fdSigneHtml(){
  const F=S.fd,o=fdSigne(),t=ogTeinte(o.nom),a=fdAnnee()+1,m=o.o.meilleurs&&o.o.meilleurs[0],k=(l,v,s)=>`<div class="mn-t"><span class="etiq">${l}</span><b class="T" style="font-size:${fdTaille(v.replace(/<[^>]+>/g,''),380,76)}px">${v}</b><small>${s}</small></div>`;
  const quand=F.tardive?fdD(1,1,a):fdD(1,0,a);
  return `<div class="fd-sc fd-off ${F.anim?'fd-entre':''}">${fdTun(`${t[1]||'none'} brightness(.95)`,'cote')}<i class="fd-voile-s"></i>
    <div class="mn-hero fd-hero fd-solo"><div class="mn-hh fd-hh" style="--t:${t[0]}"><div class="mn-hl"><span class="mn-lieu">Tu signes · arrivée le ${fdDate(quand)}</span>
      <h2 class="T mn-hn fd-verdict" style="font-size:${mfCorps(fdCourt(o.nom),1500,210,90)}px">${esc(fdCourt(o.nom))}</h2><p class="mn-hp">Tu gardes carnet et réputation. Tes combattants restent chez Split.${FD_RELIRE}</p></div>
      <div class="mn-tg fd-tg4">${k('Place',o.place+'/8','')}${k('Salaire',fdEuro(o.salaire),'par mois')}${k('Contrat','1 saison',`jusqu’au ${fdDate(fdD(31,11,a))}`)}${k('Spectateurs',nb(o.o.pub),'par soirée')}</div>
      <div class="fd-fa"><span class="etiq">Meilleur classé</span><b>${m?`${lien(m)}, n° ${m.mondial} mondial`:'—'}</b><span class="etiq">Équipe</span><b>Leïla, Marco, Dr Roux</b></div></div></div>
    <div class="fd-cta">${fdOui(`Entrer chez ${esc(fdCourt(o.nom))}`,'data-fdentrer')}</div></div>`;
}
const fdAttente=()=>{const d=fdD(1,0,2029);d.setDate(d.getDate()+S.fd.attente*7);return d;};
function fdSansPosteHtml(){
  const F=S.fd,d=fdAttente(),refuse=F.tardive&&F.refus.includes(0);
  const saison=([an,i])=>{const os=fdObjectifs(an,i),n=os.filter(fdTenu).length;return `<div class="fd-sa oct fd-${i}"><div class="fd-sai oct"><b class="T fd-saa">${an}</b><span class="fd-sat T">${FD_MOTS[F.mots][i]}</span><span class="fd-sam"><span><b class="T">${fdPlace(i)}/8</b><small>place</small></span><span><b class="T">${n}/${os.length}</b><small>objectifs</small></span><span><b class="T">5</b><small>soirées</small></span></span><div class="fd-sal">${os.map(o=>{const ok=fdTenu(o);return `<span class="${ok?'ok':'ko'}"><i class="octr">${ico(ok?'fdCoche':'fdCroix',17,3.4)}</i><em>${esc(o.lab)}</em><b>${o.type==="rang"?o.v+"/8":o.type==='mondial'?`n° ${o.v}`:nb(o.v)}</b></span>`;}).join('')}</div></div></div>`;};
  return `<div class="fd-sc fd-renvoi ${F.anim?'fd-entre':''}">${fdTun(FD_V.renvoi.fil)}<i class="fd-voile-v"></i>
    <div class="fd-v"><div class="fd-vh fd-vh2"><div class="fd-vt"><span class="fd-eye">Contrat terminé le 31 déc. 2028${FD_RELIRE}</span><h1 class="T fd-verdict">Sans poste</h1>
      <p class="fd-phrase">${refuse?'Offre de MMA Korner refusée.':F.attente?`Aucune offre au ${fdDate(d)}.`:'Aucune offre.'}</p></div></div>
    <div class="fd-sas">${[[2027,'avert'],[2028,'renvoi']].map(saison).join('')}</div>
    <div class="fd-bar"><div class="fd-bc"><span class="etiq">Sans poste</span><span class="fd-bv"><b class="T">${F.attente?`${F.attente*7} jours`:'Ce matin'}</b></span><small>depuis le 1er janv. 2029</small></div>
      <div class="fd-bc"><span class="etiq">Tu gardes</span><span class="fd-bv"><b class="T">Carnet</b></span><small>et ta réputation</small></div>
      <div class="fd-bc"><span class="etiq">Une offre</span><span class="fd-bv"><b class="T">Par message</b></span><small>Continuer s’y arrêtera${FD_RELIRE}</small></div>
      <div class="fd-act">${fdNon('Saisons','data-fdgo="saisons"')}${fdNon('Finir la carrière','data-fdconf="fin"')}</div></div></div></div>`;
}

/* ---- Ce qui arrive par message : la forme de l'écran Messages, sans y toucher ---- */
/* Règles tirées des vraies soirées entre organisations (sources : AMELIORATIONS-DONNEES.md) :
   Rizin 40 : 5 combats entre organisations, dont 1 entre champions en titre (Pitbull–Koike Erbst) ; PFL contre Bellator : 4 duels de champions prévus, 2 remplacés avant la soirée.
   Une soirée mêle donc champions et classés, et un champion indisponible est remplacé. Les disponibilités ci-dessous sont inventées, à relire. */
const FD_CHOC_DATE=fdD(18,2,2028);
const FD_PLACES=['Combat principal','Co-principal','Combat 3','Combat 4','Combat 5'];
const fdCatsTout=()=>[...CATS.H,...CATS.F].map(x=>x[0]);
const fdChampSplit=cat=>cat==='Poids léger'?parId('mezouar'):msChamp(cat);
const fdGob=cat=>clMonde(cat).filter(x=>x.ext&&x.org==='Garden of Blood');
const fdChampGob=cat=>{const l=fdGob(cat);return l.find(x=>x.champOrg===true)||l[0];};
const FD_DISPO={
  s:{'Poids mouche':['blesse','Blessé, retour le 2 avr.'],'Poids plume':['affiche','À l’affiche le 19 févr.'],'Poids moyen':['blesse','Blessé, retour le 28 mars'],'Poids mouche F':['affiche','À l’affiche le 19 févr.']},
  g:{'Poids léger':['blesse','Blessé, retour le 9 avr.'],'Poids mi-moyen':['affiche','Défend sa ceinture le 4 mars'],'Poids mouche F':['affiche','Défend sa ceinture le 11 mars']},
};
const fdCarteBase=()=>{
  const c=(cat)=>({c:cat,a:fdChampSplit(cat).id,b:fdChampGob(cat).id}),g=(cat,n)=>fdGob(cat).find(x=>x.mondial===n).id;
  return [c('Poids lourd'),c('Poids coq'),{c:'Poids léger',a:'labbe',b:g('Poids léger',10)},{c:'Poids mi-lourd',a:'gpoidsmilourd1',b:g('Poids mi-lourd',11)},{c:'Poids paille F',a:'rachidi',b:g('Poids paille F',22)}];
};
const fdCarte=()=>S.fd.carte||(S.fd.carte=fdCarteBase());
const fdBrouillon=()=>S.fd.brouillon||(S.fd.brouillon=fdCarte().map(x=>({...x})));
const fdBoutCle=x=>`${x.c}|${x.a}|${x.b}`;
const fdNChamp=l=>l.filter(x=>fdType(x)==='champ').length;
const fdContrePrete=()=>{const b=fdBrouillon(),c=fdCarte().map(fdBoutCle);return b.length===5&&fdNChamp(b)>0&&b.some(x=>!c.includes(fdBoutCle(x)));};
const fdType=x=>{const ca=x.a===fdChampSplit(x.c).id,cb=x.b===fdChampGob(x.c).id;return ca&&cb?'champ':ca||cb?'mixte':'classe';};
const FD_TYPES={champ:'Entre champions',mixte:'Champion contre classé',classe:'Entre classés'};
const fdResume=l=>{const n=fdNChamp(l),a=l.length-n;return `${n} entre champion${n>1?'s':''}${a?`, ${a} autre${a>1?'s':''}`:''}`;};
/** Si leur champion ne peut pas, leur meilleur classé disponible qui n'est pas déjà sur la carte. */
const fdAlt=(cat,b)=>{const c=fdChampGob(cat),pris=new Set(b.map(x=>x.b));return fdGob(cat).filter(x=>x!==c&&!pris.has(x.id)).sort((x,y)=>x.mondial-y.mondial)[0]||null;};
function fdBoutHtml(x,i){
  const A=parId(x.a),B=parId(x.b),t=fdType(x);
  return `<div class="fd-pa oct fd-t-${t}" style="--i:${i}"><span class="fd-pai oct"><span class="fd-pam">n° ${A.mondial}<small>mondial</small></span><span class="fd-pas">${lien(A)}<small>Split · ${bilan(A)}</small></span>
    <span class="fd-pac">${t==='champ'?rsCb(30):'<i class="fd-vsm octr">VS</i>'}<small>${esc(x.c)}</small></span><span class="fd-pas d">${lien(B)}<small>Garden of Blood · ${bilan(B)}</small></span><span class="fd-pam d">n° ${B.mondial}<small>mondial</small></span></span></div>`;
}
const fdChocEtat=()=>({recu:'Proposition reçue',accepte:`Programmé le ${fdDate(FD_CHOC_DATE)}`,refuse:'Refusé pour 2028'}[S.fd.choc]);
function fdChocVue(){
  const F=S.fd,l=fdCarte(),f=(a,b)=>`<div class="fd-chf"><span class="etiq">${a}</span><b class="T">${b}</b></div>`,te=n=>ogTeinte(n)[1]||'none';
  return `<div class="fd-chv"><div class="fd-chb oct"><span style="--f:${te('Split')}"><i></i><b class="T">Split</b></span><span class="d" style="--f:${te('Garden of Blood')}"><i></i><b class="T">Garden of Blood</b></span><em class="octr">VS</em></div>
    <div class="fd-pas3">${l.map(fdBoutHtml).join('')}</div>
    <div class="fd-chs">${f('Date',F.choc==='accepte'?fdDate(FD_CHOC_DATE):F.choc==='refuse'?'—':'À convenir')}${f('Recette','50/50')}${f('Victoire','3/5')}${f('Ceintures','Restent en place')}</div></div>`;
}
/* ---- Les classés : tes quatre meilleurs de la catégorie, hors champion ; en face, leur classé le plus proche au mondial, libre ce soir-là ---- */
const fdClassesSplit=cat=>{const ch=fdChampSplit(cat);return COMBATTANTS.filter(c=>!c.ext&&c.cat===cat&&c!==ch&&c.rang!=='C').sort((x,y)=>x.mondial-y.mondial).slice(0,4);};
const fdPick=cat=>{const l=fdClassesSplit(cat),b=fdBrouillon(),id=S.fd.negPick[cat];return l.find(c=>c.id===id)||l.find(c=>!b.some(x=>x.a===c.id))||l[0];};
const fdFace=(cat,c,b)=>{const ch=fdChampGob(cat),pris=new Set(b.map(x=>x.b));return fdGob(cat).filter(x=>x!==ch&&!pris.has(x.id)).sort((x,y)=>Math.abs(x.mondial-c.mondial)-Math.abs(y.mondial-c.mondial)||x.mondial-y.mondial)[0]||null;};
/* ---- Négocier : tu choisis un de tes champions ou un classé, on regarde qui peut venir en face ---- */
function fdNegCote(c,org,e,droite){
  return `<div class="fd-ndc ${droite?'d':''}"><span class="fd-ndo">${ogEmb(org,46)}<span>${esc(org==='Garden of Blood'?org:'Split')}</span></span>
    <span class="fd-ndp" style="font-size:${Math.max(18,Math.min(22,Math.floor(255/(`${c.prenom} « ${c.surnom||''} »`.length*.42))))}px">${esc(c.prenom)}${c.surnom?` « ${esc(c.surnom)} »`:''}</span>
    <span class="T fd-ndn" style="font-size:${mfCorps(c.nom.toUpperCase(),245,76,34)}px"><span class="nom" data-fiche="${c.id}">${esc(c.nom)}</span></span>
    <span class="fd-nds"><b class="T">${bilan(c)}</b><span>n° ${c.mondial} mondial</span></span>
    <span class="fd-nde ${e?'ko':'ok'}"><i class="octr">${ico(e?'fdCroix':'fdCoche',15,3.4)}</i>${e?esc(e[1]):'Disponible'}</span></div>`;
}
function fdNegResultatClasse(cat){
  const A=fdPick(cat),b=fdBrouillon(),plein=b.length>=5,deja=b.some(x=>x.a===A.id),B=deja?null:fdFace(cat,A,b);
  const bloc=(cl,tt,tx,act='')=>`<div class="fd-nres oct ${cl}"><div class="oct"><div class="fd-nrt2"><b class="T">${tt}</b><span>${tx}</span></div>${act}</div></div>`;
  if(deja)return bloc('neutre','Déjà sur la carte',`${esc(A.nom)} combat déjà ce soir-là.`);
  if(!B)return bloc('ko','Personne en face',`Garden of Blood : aucun classé libre.`);
  return bloc('ok','Combat possible',plein?'Carte complète : retire un combat à droite.':`Entre classés, sans ceinture. Plus proche au mondial : ${lien(B)}.`,plein?'':fdNon('Ajouter à la carte',`data-fdnadd="${B.id}" data-fda="${A.id}"`));
}
function fdNegResultat(cat){
  const A=fdChampSplit(cat),C=fdChampGob(cat),es=FD_DISPO.s[cat],eg=FD_DISPO.g[cat],b=fdBrouillon(),deja=b.some(x=>x.a===A.id),plein=b.length>=5;
  const bloc=(cl,tt,tx,act='')=>`<div class="fd-nres oct ${cl}"><div class="oct"><div class="fd-nrt2"><b class="T">${tt}</b><span>${tx}</span></div>${act}</div></div>`;
  const bouton=(id,l)=>plein?'':fdNon(l,`data-fdnadd="${id}"`);
  if(es)return bloc('ko','Champion indisponible',`${esc(A.nom)} : ${esc(es[1].toLowerCase().replace(/\.$/,''))}. La soirée a lieu le ${fdDate(FD_CHOC_DATE)}.`);
  if(deja)return bloc('neutre','Déjà sur la carte',`${esc(A.nom)} combat déjà ce soir-là.`);
  if(!eg)return bloc('ok','Combat possible',plein?'Carte complète : retire un combat à droite.':'Champion contre champion, ceintures en place.',bouton(C.id,'Ajouter à la carte'));
  const alt=fdAlt(cat,b);
  if(!alt)return bloc('ko','Leur champion est indisponible',`${esc(C.nom)} : ${esc(eg[1].toLowerCase().replace(/\.$/,''))}. Personne d’autre dans la catégorie.`);
  return bloc('mixte','Leur champion est indisponible',`Ils proposent ${lien(alt)}, n° ${alt.mondial} mondial. ${plein?'Retire d’abord un combat à droite.':'Sans ceinture.'}`,bouton(alt.id,'Prendre ce combat'));
}
function fdNegocierHtml(){
  const F=S.fd,cats=fdCatsTout(),sel=cats[Math.min(F.negSel,cats.length-1)],b=fdBrouillon(),cl=F.negMode==='classe';
  const A=cl?fdPick(sel):fdChampSplit(sel),C=cl?(b.some(x=>x.a===A.id)?parId(b.find(x=>x.a===A.id).b):fdFace(sel,A,b)):fdChampGob(sel);
  const ligne=(cat,i)=>{const c=cl?fdPick(cat):fdChampSplit(cat),e=cl?null:FD_DISPO.s[cat],pris=b.some(x=>x.a===c.id);
    return `<button class="fd-nr oct ${cat===sel?'sel':''} ${e?'off':''}" data-fdnch="${i}" aria-pressed="${cat===sel}"><span class="fd-nri oct">${cl?'':rsCb(26)}<span class="fd-nrn"><b>${esc(c.prenom)} ${esc(c.nom)}</b><small>${esc(cat)}${cl?` · n° ${c.mondial} mondial`:''}</small></span><span class="fd-nre ${e?'ko':pris?'pris':'ok'}">${e?esc(e[1].split(',')[0].replace('À l’affiche le 19 févr.','À l’affiche')):pris?'Sur la carte':'Disponible'}</span></span></button>`;};
  const place=(i)=>{const x=b[i];
    if(!x)return `<div class="fd-nl vide oct"><div class="oct"><span class="fd-nlp">${FD_PLACES[i]}</span><span class="fd-nlv">Place libre</span></div></div>`;
    const P=parId(x.a),Q=parId(x.b),t=fdType(x);
    return `<div class="fd-nl oct fd-t-${t}"><div class="oct"><span class="fd-nlp">${FD_PLACES[i]}</span><span class="fd-nln">${lien(P)} <small>contre</small> ${lien(Q)}</span><span class="fd-nlt">${esc(x.c)} · ${FD_TYPES[t]}</span><button class="bb oct petit fd-nlx" data-fdnret="${i}" aria-label="Retirer ce combat" title="Retirer ce combat"><span class="oct">${ico('fdCroix',18,3)}</span></button></div></div>`;};
  const pret=fdContrePrete(),raison=b.length<5?`Il manque ${5-b.length} combat${5-b.length>1?'s':''}.`:!fdNChamp(b)?'Au moins 1 combat entre champions.':pret?fdResume(b).replace(/^./,m=>m.toUpperCase())+'.':'Change au moins 1 combat.';
  const filtre=(v,l)=>`<button class="fd-nf oct ${F.negMode===v?'on':''}" data-fdnmode="${v}" aria-pressed="${F.negMode===v}"><span class="oct">${l}</span></button>`;
  const g=pan(`${titre('Combattants de Split')}<div class="fd-nfs">${filtre('champ','Champions')}${filtre('classe','Classés')}</div><div class="fd-nrs">${cats.map(ligne).join('')}</div>`,'','fd-ng');
  const autres=cl?`<div class="fd-nalt"><span class="etiq">Autre classé</span>${fdClassesSplit(sel).map(c=>{const pris=b.some(x=>x.a===c.id);return `<button class="fd-nac oct ${c===A?'on':''} ${pris?'pris':''}" data-fdnpick="${c.id}" aria-pressed="${c===A}" title="${pris?'Déjà sur la carte':''}"><span class="oct">${esc(c.nom)} <small>${pris?'sur la carte':`n° ${c.mondial}`}</small></span></button>`;}).join('')}</div>`:'';
  const face=C?fdNegCote(C,'Garden of Blood',cl?null:FD_DISPO.g[sel],true):`<div class="fd-ndc d"><span class="fd-ndo">${ogEmb('Garden of Blood',46)}<span>Garden of Blood</span></span><span class="T fd-ndn" style="font-size:44px">Personne</span></div>`;
  const m=pan(`<div class="fd-nh oct"><i></i><i class="d"></i>${fdNegCote(A,'Split',cl?null:FD_DISPO.s[sel],false)}<span class="fd-ndv"><em class="octr">VS</em><small>${esc(sel)}</small></span>${face}</div>${autres}${cl?fdNegResultatClasse(sel):fdNegResultat(sel)}`,'','fd-nm');
  const d=pan(titre('Carte',`${b.length}/5`)+`<div class="fd-nls">${FD_PLACES.map((_,i)=>place(i)).join('')}</div><div class="fd-nbas"><span class="fd-nrai ${pret?'':'att'}">${raison}${FD_RELIRE}</span><div>${fdNon('Annuler','data-fdnann')}<button class="bouton jaune cj oct fd-nenv" data-fdconf="contre" ${pret?'':'disabled'}>Envoyer</button></div></div>`,'','fd-nd');
  return `<div class="fd fd-neg ${F.anim?'fd-anim':''}">${g}${m}${d}</div>`;
}
/* ---- Le message du 31 décembre : ce qui se passe, et ce qui va être jugé. Le résultat reste pour le verdict. ---- */
function fdMsgBilan(a){
  const l=FD_SOIREES[a],tot=l.reduce((n,x)=>n+x[3],0),os=fdObjectifs(a,S.fd.cas);
  const st=(v,t)=>`<div><b class="T">${v}</b><span>${t}</span></div>`;
  const tuile=(o,i)=>{const v=o.type==='rang'?fdOt(o.but):o.type==='mondial'?`n° ${o.but}`:nb(o.but),s=o.type==='salle'?'places vendues':'ou mieux',c={...o,v:null,avant:null,liste:null};
    const vis=o.type==='rang'?fdVisRang(c,'cible'):o.type==='mondial'?fdVisMonde(c,'cible'):fdVisSalle({...o,v:o.but},'cible');
    return `<div class="fd-mt oct" style="--i:${i}"><div class="oct"><span class="fd-mth"><span class="fd-mtn octr">${i+1}</span><span class="fd-mtl">${esc(o.lab)}</span></span><span class="fd-mtv"><b class="T">${v}</b><small>${s}</small></span>${vis}</div></div>`;};
  return `<div class="fd-mb oct"><div class="fd-mbi oct"><i class="fd-mbt"></i><div class="fd-mbg"><span class="fd-eye">Saison ${a}</span><b class="T">Terminée</b><span class="fd-mbs">${FD_PATRON} ${S.fd.dec?'a rendu':'rend'} sa décision${S.fd.dec?'':' aujourd’hui'}.</span></div>
    <div class="fd-mbc">${st(l.length,'soirées')}${st(nb(tot),'spectateurs')}${st(nb(Math.round(tot/l.length)),'par soirée')}</div></div></div>
    <div class="fd-mjh"><span class="etiq">${S.fd.dec?'Objectifs jugés':'Objectifs à juger'}</span></div><div class="fd-mj">${os.map(tuile).join('')}</div>`;
}
const fdOuiM=(l,a)=>`<button class="bouton jaune cj ms-b fd-ouim" ${a}>${l}</button>`;
function fdMsgs(){
  const F=S.fd,a=fdAnnee(),l=[],d31=fdD(31,11,a);
  if(F.tardive&&F.etape==='message'){
    const o=fdOffres()[0],q=fdAttente();
    l.push({id:'offre0',tag:'Organisation',qui:fdCourt(o.nom),role:'direction',date:q,t:`${esc(fdCourt(o.nom))} te propose un poste`,vif:!F.dec,txt:esc(o.m.t),
      vue:()=>`<div class="fd-mo-b oct" style="--t:${ogTeinte(o.nom)[0]}"><i style="filter:${ogTeinte(o.nom)[1]||'none'} brightness(.8)"></i>${ogEmb(o.nom,92)}<span class="T">${esc(fdCourt(o.nom))}</span></div><div class="ms-cases g3">${msCase('Place',msGros(o.place+'/8',''))}${msCase('Salaire',msGros(nb(o.salaire)+' €','par mois'))}${msCase('Durée',msGros('1 saison',''))}</div>`,bas:()=>fdOuiM('Voir l’offre','data-fdgo="offres" data-fdi="0"')});
    return l;
  }
  if(F.etape==='mi'){
    const os=fdObjectifs(a,F.cas),place=F.cas==='tenu'?5:7,mond=F.cas==='tenu'?7:F.cas==='avert'?8:10;
    const o0=Object.assign({},os[0],{v:place,liste:null,det:`${place}/8 au 1er juillet.`}),o1=Object.assign({},os[1],{v:mond,det:`${lien(parId('gpoidslourdC'))} : n° ${mond} au 1er juillet.`});
    l.push({id:'mi',tag:'Organisation',qui:FD_PATRON,role:'patron',date:fdD(1,6,a),t:`Bilan de mi-saison ${a}`,vif:true,txt:FD_MI[F.cas],
      vue:()=>`<div class="fd-ls">${fdLigneObj(o0,'cours',0)}${fdLigneObj(o1,'cours',1)}${fdLigneObj(os[2],fdEtatDe(os[2]),2)}</div>`,bas:()=>`<div class="fd-mi-reg"><span class="etiq">Jugés le</span><b class="T">31 déc.</b><span>${F.cas==='renvoi'?'1 avertissement en cours':'aucun avertissement'}</span></div>${fdNon('Carrière','data-fdcarriere')}`});
    return l;
  }
  if(F.etape==='choc'){
    const att=F.choc==='recu',cl=fdCarte();
    l.push({id:'choc',tag:'Organisation',qui:'Marcus Varela',role:'Matchmaker',date:fdD(8,0,2028),t:'Garden of Blood propose un choc',vif:att,txt:`« Split achète. Nous, on signe les vedettes. » 5 combats : ${fdResume(cl)}.`,vue:()=>fdChocVue(),
      bas:()=>att?`${fdOuiM('Accepter','data-fdconf="choc"')}${fdNon('Négocier','data-fdnego')}${fdNon('Refuser','data-fdconf="chocrefus"')}`
        :`<div class="ms-ok"><span style="color:${F.choc==='accepte'?'var(--vert)':'var(--neg)'};display:flex">${ico(F.choc==='accepte'?'fdCoche':'fdCroix',24,3)}</span>${fdChocEtat()}</div>${fdNon('Voir les saisons','data-fdsuivre')}`});
    return l;
  }
  l.push({id:'bilan',tag:'Organisation',qui:FD_PATRON,role:'patron',date:d31,t:`Bilan de la saison ${a}`,vif:!F.dec,txt:'',
    vue:()=>fdMsgBilan(a),bas:()=>F.ordre==='prix'&&!F.dec?fdOuiM('Voir les prix','data-fdgo="prix"'):fdOuiM(F.dec?'Revoir la décision':'Voir la décision','data-fdgo="bilan"')});
  fdOffres().forEach((o,i)=>{if(F.refus.includes(i))return;l.push({id:'offre'+i,tag:'Organisation',qui:fdCourt(o.nom),role:'direction',date:d31,t:`${esc(fdCourt(o.nom))} te propose un poste`,vif:!F.dec,txt:esc(o.m.t),
    vue:()=>`<div class="fd-mo-b oct" style="--t:${ogTeinte(o.nom)[0]}"><i style="filter:${ogTeinte(o.nom)[1]||'none'} brightness(.8)"></i>${ogEmb(o.nom,92)}<span class="T">${esc(fdCourt(o.nom))}</span></div><div class="ms-cases g3">${msCase('Place',msGros(o.place+'/8',''))}${msCase('Salaire',msGros(nb(o.salaire)+' €','par mois'))}${msCase('Durée',msGros('1 saison',''))}</div>`,bas:()=>F.vu||F.dec?fdOuiM('Voir l’offre',`data-fdgo="offres" data-fdi="${i}"`):fdOuiM('Voir d’abord le bilan','data-fdgo="bilan"')});});
  l.push({id:'prix',tag:'Presse',qui:'Cage Hebdo',role:'',date:d31,t:`Prix ${a}`,vif:false,txt:'6 trophées.',
    vue:()=>`<div class="fd-mp">${FD_PRIX[a].map((p,i)=>`<button class="fd-mpl" data-fdgo="prix" data-fdpi="${i}"><span class="fd-med octr"><span class="octr">${ico(p.ic,22,2.2)}</span></span><span>${p.t}</span><b>${p.n.length?p.n.map(id=>{if(id==='fdferrand')fdFerrand();return esc(parId(id).nom);}).join(' et '):'Aucun candidat'}</b></button>`).join('')}</div>`,bas:()=>fdOuiM('Voir les prix','data-fdgo="prix"')});
  return l;
}
/* Les messages déjà lus de la boîte validée, sous ceux du jour ; un clic les ouvre dans l'écran Messages. */
const FD_ANCIENS=()=>['mi','choc'].includes(S.fd.etape)?MS_BOITE.slice(0,5).map(x=>`<div class="ms-l oct fd-anc"><div class="ms-li oct"><span class="point octr lu"></span><div class="ms-l-t"><div class="ms-titre">${x.t}</div><div class="sous">${esc(x.qui)} · ${fdDate(x.date)}</div></div>${msTag(x.tag)}</div></div>`).join(''):'';
function fdBoiteHtml(){
  const F=S.fd,l=fdMsgs(),m=l.find(x=>x.id===F.msg)||l[0];
  const g=pan(titre('Messages')+`<div class="defile ms-liste">${l.map(x=>`<div class="ms-l oct ${x.id===m.id?'sel':''}" data-fdmsg="${x.id}"><div class="ms-li oct"><span class="point octr ${x.vif?'':'lu'} ${x.vif?'pulse':''}"></span>
    <div class="ms-l-t"><div class="ms-titre ${x.vif?'vif':''}">${x.t}</div><div class="sous">${esc(x.qui)} · ${fdDate(x.date,false)}</div></div>${msTag(x.tag)}</div></div>`).join('')}${FD_ANCIENS()}</div>`,'','ms-g');
  const b=m.bas?m.bas():'';
  const c=pan(`<div class="ms-tete">${msTag(m.tag)}<span class="ms-de">${esc(m.qui)}${m.role?`<span class="sous"> · ${esc(m.role)}</span>`:''}</span>${FD_RELIRE}<span class="sous" style="margin-left:auto">${fdLong(m.date)}</span></div>
    <div class="pt ms-pt"><h2>${m.t}</h2></div><div class="defile ms-corps fd-mc ${F.anim?'ms-anim':''}">${m.txt?`<p class="ms-txt">${m.txt}</p>`:''}${m.vue?m.vue():''}</div>${b?`<div class="ms-bas fd-mbas">${b}</div>`:''}`,'','ms-g');
  return `<div class="ms fd-ms">${g}${c}</div>`;
}

/* ---- Tes saisons : le bilan, les prix et le classement de chaque saison, depuis Ta carrière ---- */
function fdSaisonsListe(){
  const F=S.fd,l=[];
  if(!F.termine)return l;
  if(F.cas==='renvoi'){l.push({annee:2028,issue:'renvoi'},{annee:2027,issue:'avert'});return l;}
  if(F.chocVu&&F.dec==='rester')l.push({annee:2028,enCours:true});
  l.push({annee:2027,issue:F.cas});
  return l;
}
function fdBandeSaison(s){
  const F=S.fd,v=FD_V[s.issue],os=fdObjectifs(s.annee,s.issue),n=os.filter(fdTenu).length,parti=s.annee===fdAnnee()?fdSigne():null;
  const c=(l,x,t)=>`<div class="fd-bc"><span class="etiq">${l}</span><span class="fd-bv"><b class="T">${x}</b></span><small>${t}</small></div>`;
  const ph=parti?`Tu as quitté Split pour ${esc(fdCourt(parti.nom))}.`:s.issue==='tenu'?`Prolongé jusqu’au ${fdDate(fdD(31,11,s.annee+1))}.`:s.issue==='avert'?'Avertissement : 1 saison pour redresser.':'2 saisons manquées : contrat terminé.';
  return `<div class="fd-sb oct fd-${s.issue}"><div class="fd-sbi oct">${fdTun(v.fil,'bande')}<div class="fd-sbt"><span class="fd-eye">Saison ${s.annee} · ${FD_PATRON}</span><div class="fd-mot"><b class="T fd-verdict">${v.mot}</b><span class="fd-tampon"><b class="T">${FD_MOTS[F.mots][s.issue]}</b></span></div><p class="fd-phrase">${ph}</p></div>
    <div class="fd-sbc">${c('Objectifs',`${n}/${os.length}`,'tenus')}${c('Place',fdPlace(s.issue)+'/8','')}${parti?c('Salaire',fdEuro(parti.salaire),`chez ${esc(fdCourt(parti.nom))}`):c('Salaire',fdEuro(s.issue==='tenu'?4000:FD_SALAIRE),'par mois')}</div></div></div>`;
}
function fdPrixGrille(a){
  return `<div class="fd-pg">${FD_PRIX[a].map((p,i)=>{
    if(!p.n.length)return `<div class="fd-pc oct vide" style="--i:${i}"><div class="oct"><span class="fd-med octr"><span class="octr">${ico(p.ic,28,2.2)}</span></span><span class="fd-pct">${p.t}</span><b class="T fd-pcn">Aucun candidat</b></div></div>`;
    const n=p.n.map(id=>{if(id==='fdferrand')fdFerrand();return lien(parId(id));}).join(' <small>et</small> '),k=p.k[0];
    return `<div class="fd-pc oct" style="--i:${i}"><div class="oct"><span class="fd-med octr"><span class="octr">${ico(p.ic,28,2.2)}</span></span><span class="fd-pct">${p.t}${p.relire?FD_RELIRE:''}</span><b class="T fd-pcn">${n}</b><span class="fd-pck2"><b class="T">${esc(k[1])}</b>${esc(k[2])}</span><button class="og-lien" data-fdcombat="${p.c}">Voir le combat ›</button></div></div>`;}).join('')}</div>`;
}
function fdSaisonsHtml(){
  const F=S.fd,l=fdSaisonsListe();
  if(!l.length)return `<div class="fd fd-sais ${F.anim?'fd-anim':''}"><div class="fd-vide oct"><div class="oct">${fdTun('brightness(.55)','bande')}<span class="fd-eye">Saisons</span><span class="T">Aucune saison terminée</span><span class="fd-phrase">Ta première saison se termine le 31 déc. 2027.</span></div></div></div>`;
  const s=l.find(x=>x.annee===F.saison)||l[0],dispo=s.enCours?['choc']:['bilan','prix','classement'],ong=dispo.includes(F.ong)?F.ong:dispo[0],noms={bilan:'Bilan',prix:'Prix',classement:'Classement',choc:'Choc'};
  const gauche=pan(titre('Saisons')+`<div class="fd-sl">${l.map(x=>{const os=x.enCours?null:fdObjectifs(x.annee,x.issue),n=os?os.filter(fdTenu).length:0;
    return `<button class="fd-si oct ${x.annee===s.annee?'sel':''}" data-fdsaison="${x.annee}"><span class="fd-sii oct"><b class="T">${x.annee}</b><span class="fd-sit"><span class="fd-sv ${x.enCours?'':x.issue}">${x.enCours?'En cours':FD_MOTS[F.mots][x.issue]}</span><span class="sous">${x.enCours?'Chez Split':`${fdPlace(x.issue)}/8 · objectifs ${n}/${os.length}`}</span></span></span></button>`;}).join('')}</div><div class="fd-sf"><span><b class="T">${l.filter(x=>!x.enCours).length}</b>saison${l.filter(x=>!x.enCours).length>1?'s':''}</span><span><b class="T">${l.filter(x=>!x.enCours).length*5}</b>soirées</span><span><b class="T">${F.cas==='tenu'?0:F.cas==='avert'?1:2}</b>avertiss.</span></div>`,'','fd-psg');
  let c;
  if(ong==='bilan')c=`${fdBandeSaison(s)}<div class="fd-ls">${fdObjectifs(s.annee,s.issue).map((o,k)=>fdLigneObj(o,fdEtatDe(o),k)).join('')}</div>`;
  else if(ong==='prix')c=fdPrixGrille(s.annee);
  else if(ong==='classement')c=`<div class="fd-cols fd-cols-a">${fdClasse(s.annee,s.issue).map(x=>fdColonne(x,false)).join('')}</div><div class="fd-bar fd-bar-e fd-bar-a"><div class="fd-bc fd-bct"><span class="etiq">Changements</span><span class="fd-bv"><b class="T">En ${s.annee+1}</b></span></div>${fdEffets(s.annee,s.issue)}</div>`;
  else c=pan(`${titre('Choc des organisations',fdChocEtat())}${fdChocVue(true)}${F.choc==='recu'?`<div class="fd-chrep">${fdNon('Répondre','data-fdgo="choc" data-fdmsgc')}</div>`:''}`,'','fd-pchoc');
  return `<div class="fd fd-sais ${F.anim?'fd-anim':''}">${gauche}<div class="fd-sd"><div class="cl-haut fd-songs">${dispo.map(k=>`<button class="onglet oct ${k===ong?'ouvert':''}" data-fdong="${k}">${noms[k]}</button>`).join('')}</div><div class="fd-sc2">${c}</div></div></div>`;
}

/* ---- Le détail d'un combat de prix, par-dessus ---- */
function fdCombatHtml(){
  const k=S.fd.combat;if(!k)return '';
  const c=fdCombat(k);if(!c)return '';
  if(c.a==='fdferrand')fdFerrand();
  const A=parId(c.a),B=parId(c.b),w=c.g==='a'?A:B,li=(a,b)=>`<div class="fd-dl"><span>${a}</span><b>${b}</b></div>`,tot=x=>x.reduce((s,v)=>s+v,0);
  const fin=c.meth==='Décision'?`Décision ${esc(c.det)}, ${c.n} rounds`:`${esc(c.meth)} · ${esc(c.det)}`;
  return `<div class="fd-voile" data-fdfermer></div><div class="fd-conf fd-cbt" role="dialog" aria-modal="true" aria-label="Combat">${pan(`<div class="pt"><h2>Combat</h2>${c.vrai?'':FD_RELIRE}<button class="bb oct petit fd-x" data-fdfermer aria-label="Fermer"><span class="oct">${ico('fdCroix',20,3)}</span></button></div>
    <div class="fd-cbv"><span class="${c.g==='a'?'g':''}">${c.g==='a'?'<i class="marque octr v">V</i>':''}${lien(A)}</span><b class="T">contre</b><span class="${c.g==='b'?'g':''}">${c.g==='b'?'<i class="marque octr v">V</i>':''}${lien(B)}</span></div>
    <div class="fd-dls">${li('Soirée',`${esc(c.s)}, ${esc(c.v)}`)}${li('Date',fdDate(c.d))}${li('Vainqueur',`${esc(w.prenom)} ${esc(w.nom)}`)}${li('Fin',fin)}${c.meth==='Décision'?'':li('Quand',`${c.rd}e round, ${esc(c.tps)}`)}${c.titre?li('Enjeu','Ceinture en jeu, 5 rounds'):''}${c.co?li('Frappes significatives',`${tot(c.co[0])} / ${tot(c.co[1])}`):''}</div>`)}</div>`;
}

/* ---- Confirmations en chiffres : l'action en jaune, Revenir en noir ---- */
function fdConfData(){
  const F=S.fd,c=F.conf;if(!c)return null;
  const a=fdAnnee(),off=c.i!=null?fdOffres()[c.i]:null,res=fdRestantes();
  if(c.t==='rester'){const l=[['Poste','Matchmaker'],['Jusqu’au',fdDate(fdD(31,11,a+1))],['Salaire',F.cas==='tenu'?`${fdEuro(FD_SALAIRE)} → ${fdEuro(4000)} par mois`:`${fdEuro(FD_SALAIRE)} par mois, inchangé`]];
    if(F.cas==='avert')l.push(['Objectifs 2028 manqués','le renvoi']);if(res.length)l.push([res.length>1?`${res.length} offres`:'L’offre',`refusée${res.length>1?'s':''} : ${res.map(o=>esc(fdCourt(o.nom))).join(', ')}`]);
    return {t:F.cas==='tenu'?'Rester chez Split':'Accepter les conditions',l,ok:F.cas==='tenu'?'Rester chez Split':'Accepter les conditions'};}
  if(c.t==='accepter'&&off)return {t:`Signer chez ${esc(fdCourt(off.nom))}`,l:[['Tu quittes',`Split, ${fdPlace(F.cas)}/8`],['Tu rejoins',`${esc(fdCourt(off.nom))}, ${off.place}/8`],['Salaire',`${fdEuro(off.salaire)} par mois`],['Durée',`1 saison, jusqu’au ${fdDate(fdD(31,11,a+1))}`],['Combattants de Split','restent chez Split']],ok:`Signer chez ${esc(fdCourt(off.nom))}`};
  if(c.t==='refuser'&&off){const der=fdRenvoi()&&res.length===1;return {t:`Refuser ${esc(fdCourt(off.nom))}`,l:[['Offre',`${esc(fdCourt(off.nom))}, ${off.place}/8`],['Salaire',`${fdEuro(off.salaire)} par mois`],['Durée','1 saison'],['Ensuite',der?(F.tardive?'tu restes sans poste':'sans poste au 1er janv. 2029'):'elle ne revient pas cette saison']],ok:'Refuser l’offre'};}
  if(c.t==='fin')return {t:'Finir ta carrière',l:[['Saisons','2, de 2027 à 2028'],['Soirées','10 chez Split'],['Dernière place','7/8'],['Ensuite','retour au menu principal']],ok:'Finir la carrière'};
  if(c.t==='choc')return {t:'Accepter le choc',l:[['Contre','Garden of Blood, 1/8'],['Date',fdDate(FD_CHOC_DATE)],['Combats',`5 : ${fdResume(fdCarte())}`],['Recette','50/50']],ok:'Accepter le choc'};
  if(c.t==='contre'){const l=fdBrouillon();return {t:'Envoyer ta proposition',l:[['À','Garden of Blood, 1/8'],['Carte',`5 combats : ${fdResume(l)}`],['Combat principal',`${esc(parId(l[0].a).nom)} contre ${esc(parId(l[0].b).nom)}`],['Date si accord',fdDate(FD_CHOC_DATE)],['Recette','50/50']],ok:'Envoyer'};}
  if(c.t==='chocrefus')return {t:'Refuser le choc',l:[['Contre','Garden of Blood, 1/8'],['Combats',`5 : ${fdResume(fdCarte())}`],['Ensuite','plus de proposition en 2028']],ok:'Refuser le choc'};
  return null;
}
function fdConfHtml(){
  const c=fdConfData();if(!c)return '';
  return `<div class="fd-voile" data-fdconfnon></div><div class="fd-conf" role="dialog" aria-modal="true" aria-labelledby="fdConfT">${pan(`<div class="pt"><h2 id="fdConfT">${c.t}</h2></div>
    <div class="fd-dls">${c.l.map(([a,b])=>`<div class="fd-dl"><span>${a}</span><b>${b}</b></div>`).join('')}</div>
    <div class="fd-cbas"><button class="bouton jaune cj fd-b" data-fdconfok>${c.ok}</button>${fdNon('Revenir','data-fdconfnon id="fdRevenir"')}</div>`)}</div>`;
}
function fdConfirmer(){
  const F=S.fd,c=F.conf;if(!c)return;F.conf=null;
  const apres=()=>{F.termine=true;F.etape=F.tardive||F.ordre==='prix'?'suite':'prix';F.msg='';};
  if(c.t==='rester')fdPas(()=>{F.dec='rester';F.refus=fdOffres().map((_,i)=>i);apres();});
  else if(c.t==='accepter')fdPas(()=>{F.dec='offre'+c.i;F.refus=fdOffres().map((_,i)=>i).filter(i=>i!==c.i);apres();});
  else if(c.t==='refuser')fdPas(()=>{F.refus=[...new Set([...F.refus,c.i])];const r=fdRestantes();if(r.length)F.sel=r[0].i;else if(fdRenvoi()){F.dec='sans';apres();}else F.etape='bilan';});
  else if(c.t==='fin'){fdGarder();aller('menu');}
  else if(c.t==='choc')fdPas(()=>{F.choc='accepte';F.chocVu=true;});
  else if(c.t==='contre')fdPas(()=>{F.carte=fdBrouillon().map(x=>({...x}));F.brouillon=null;F.choc='accepte';F.chocVu=true;F.etape='choc';F.msg='choc';});
  else if(c.t==='chocrefus')fdPas(()=>{F.choc='refuse';F.chocVu=true;});
}

/* ---- En-tête : sur une scène, le jaune nomme l'étape suivante, ou la décision est dans la scène ---- */
const fdEstScene=()=>['bilan','offres','prix','classement','suite'].includes(S.fd.etape);
const fdDateCourante=()=>{const F=S.fd,a=fdAnnee();
  if(F.etape==='mi')return fdD(1,6,a);if(F.etape==='choc'||F.etape==='negocier')return fdD(8,0,2028);
  if(F.tardive&&['message','offres','suite'].includes(F.etape))return fdAttente();
  if(F.etape==='suite'){if(F.dec==='rester')return fdD(1,0,a+1);if(fdSansPoste())return fdAttente();return fdD(31,11,a);}
  if(F.etape==='saisons')return !F.termine?S.date:F.cas!=='renvoi'&&F.chocVu?fdD(8,0,2028):fdD(31,11,a);
  return fdD(31,11,a);};
/* La décision est dans l'écran : Continuer laisse la place au seul bouton jaune. */
const fdDecisionIci=()=>{const F=S.fd;return (F.etape==='bilan'||F.etape==='offres')&&!F.dec||F.etape==='suite'&&!!fdSigne();};
const fdLibelle=()=>{const F=S.fd;
  if(F.etape==='saisons')return 'Carrière';
  if(F.etape==='prix')return 'Classement';
  if(F.etape==='classement')return F.dec?(fdSigne()?'Arrivée':fdSansPoste()?'Suite':`Saison ${fdAnnee()+1}`):'Bilan';
  if(F.tardive&&F.etape==='offres')return 'Suite';
  if(F.etape==='bilan'||F.etape==='offres')return F.ordre==='prix'?'Suite':'Prix';
  return 'Continuer';};
function fdEntete(){
  const F=S.fd,sc=fdEstScene(),pl={mi:'Messages',message:'Messages',choc:'Messages',negocier:'Négocier le choc',saisons:'Saisons',bilan:'Bilan de saison',offres:'Offres',prix:'Prix',classement:'Classement'}[F.etape]||(fdSigne()?'Arrivée':fdSansPoste()?'Fin de saison':`Saison ${fdAnnee()+1}`);
  rendreEntete(pl);
  const d=fdDateCourante(),e=$('#dateH');if(e)e.innerHTML=`${fdJour(d)} ${MOIS[d.getMonth()]} ${d.getFullYear()}`;
  const bo=document.querySelectorAll('#entete .boite')[1];
  if(bo){if(sc||F.etape==='saisons'||F.tardive)bo.remove();else{const a=d.getFullYear(),n=F.etape==='mi'?(a===2028?71:66):a===2028&&d.getMonth()===11?73:68;bo.querySelector('.T').innerHTML=`Split Fight Night <span style="color:var(--rouge-vif)">${n}</span>`;}}
  const c=$('#bContinuer');if(!c)return;
  if(F.etape==='negocier'||sc&&fdDecisionIci()){c.remove();return;}
  if(F.conf||F.combat){c.innerHTML=`${fdLibelle()} ${ico('avant',30,3)}`;c.classList.remove('jaune','cj');c.classList.add('fd-cont');return;}
  c.innerHTML=`${fdLibelle()} ${ico('avant',30,3)}`;
  if(!sc&&(F.conf||F.etape==='message'||F.etape==='choc'&&F.choc==='recu')){c.classList.remove('jaune','cj');c.classList.add('fd-cont');}
}
const fdBarre=()=>['mi','message','choc','negocier'].includes(S.fd.etape)?'messages':'organisation';
function fdCompter(rev){
  if(!S.fd.anim||!fdMvt())return;
  document.querySelectorAll('#corps [data-fdn]').forEach(e=>{const v=+e.dataset.fdn,t0=performance.now()+(rev?1500:150);
    e.textContent='0';const f=t=>{const k=Math.max(0,Math.min(1,(t-t0)/800));e.textContent=nb(v*(1-Math.pow(1-k,3)));if(k<1&&e.isConnected)requestAnimationFrame(f);};requestAnimationFrame(f);setTimeout(()=>{if(e.isConnected)e.textContent=nb(v);},rev?2600:1100);});
}
function fdHtml(rev){
  const F=S.fd;let h;
  if(F.etape==='bilan')h=fdVerdictHtml(rev);
  else if(F.etape==='offres')h=fdOffresHtml();
  else if(F.etape==='prix')h=fdPrixHtml();
  else if(F.etape==='classement')h=fdClassementHtml();
  else if(F.etape==='negocier')h=fdNegocierHtml();
  else if(F.etape==='saisons')h=fdSaisonsHtml();
  else if(F.etape==='suite')h=fdSigne()?fdSigneHtml():fdSansPoste()?fdSansPosteHtml():fdSaisonSuivanteHtml();
  else h=fdBoiteHtml();
  return `${h}${fdCombatHtml()}${fdConfHtml()}`;
}

/* ---- Les deux points d'entrée ajoutés aux écrans validés, sans les redessiner ---- */
function fdPoints(){
  /* Retour du 25/11 : un bouton dans la ligne des onglets de l'Organisation, sur chaque onglet ; il remplace le lien de Ta carrière (pas de doublon). */
  if(S.ecran==='organisation'){
    const t=$('.og-haut');if(t&&!t.querySelector('[data-fdsaisons]'))t.insertAdjacentHTML('beforeend','<button class="bb oct petit fd-osais" data-fdsaisons><span class="oct">Saisons ›</span></button>');
  }
  if(S.ecran==='calendrier'){
    document.querySelectorAll('.ca-faits .ca-f').forEach(f=>{const l=f.querySelector('.etiq');if(!l||f.querySelector('[data-fdouvrir]'))return;
      const k=/mi-saison/.test(l.textContent)?'mi':/Fin de saison/.test(l.textContent)?'message':null;
      if(k)f.insertAdjacentHTML('beforeend',`<button class="fd-lcal" data-fdouvrir="${k}">Voir ›</button>`);});
  }
}

/* ---- La fiche et les listes lisent les combats joués depuis janvier, le temps de se dessiner : rien n'est gardé dans l'effectif. ---- */
let FD_HIST=null;
const fdHistBase=historique;
historique=Object.assign(function(c){return FD_HIST&&FD_HIST.has(c.id)?FD_HIST.get(c.id):fdHistBase(c);},fdHistBase);
function fdCombatsJoues(fin){
  fdFerrand();const l=[];
  if(!S.rs.apres)['m0','m1','m2','m3','p0','p1','p2','p3','p4','p5'].forEach(k=>{const f=RS_63[k],b=PE_BASE[k[0]][+k.slice(1)];l.push({a:b.a,b:b.b,g:f.g,meth:f.meth,det:f.det,rd:f.rd,tps:f.tps,s:'Fight Night 63',d:fdD(16,1,2027),nr:f.nr,nm:f.nm});});
  Object.values(FD_X).forEach(x=>l.push(x));
  return l.filter(x=>x.d<=fin).sort((x,y)=>x.d-y.d);
}
function fdAvecSaison(fn){
  if(FD_HIST)return fn();
  ogClasse(); /* le classement des huit garde son cache d'origine */
  const fin=fdDateCourante(),d0=S.date,sauve=new Map(),hs=new Map(),bouts=fdCombatsJoues(fin);
  const garde=c=>{if(!sauve.has(c))sauve.set(c,{v:c.v,d:c.d,serie:c.serie,dernier:c.dernier,rang:c.rang,mondial:c.mondial,statut:c.statut,retour:c.retour,affiche:c.affiche,tend:c.tend});};
  try{
    bouts.forEach(b=>{const A=parId(b.a),B=parId(b.b);[[A,B,'a'],[B,A,'b']].forEach(([c,o,cote])=>{
      garde(c);if(!hs.has(c.id))hs.set(c.id,[...fdHistBase(c)]);
      const gagne=b.g===cote;hs.get(c.id).unshift({date:b.d,soiree:`Split ${b.s}`,adv:`${o.prenom} ${o.nom}`,advR:o.mondial,res:gagne?'v':'d',meth:[b.meth,b.det],rd:b.rd,tps:b.tps});
      if(gagne)c.v++;else c.d++;c.serie=(c.serie+(gagne?'v':'d')).slice(-5);c.dernier=b.d;c.tend='=';
      if(b.nr&&b.nr[cote]!=null)c.rang=b.nr[cote];if(b.nm&&b.nm[cote])c.mondial=b.nm[cote];});});
    if(bouts.length)COMBATTANTS.forEach(c=>{if(c.statut==='affiche'||c.statut==='blesse'){garde(c);c.statut='dispo';c.retour=undefined;c.affiche=undefined;}});
    FD_HIST=hs;S.date=fin;
    return fn();
  }finally{FD_HIST=null;S.date=d0;sauve.forEach((v,c)=>Object.assign(c,v));}
}
const fdFicheBase=rendreFiche;
rendreFiche=function(dir=0){if(S.ecran!=='finsaison'){fdFicheBase(dir);return;}fdAvecSaison(()=>fdFicheBase(dir));};

/* ---- Rendu et navigation, comme les autres écrans ---- */
let FD_REV=0;
const fdRendreBase=rendre;
rendre=function(){
  clearTimeout(FD_REV);
  if(typeof BR_ALIAS!=='undefined')BR_ALIAS.finsaison=fdBarre();
  if(S.ecran!=='finsaison'){document.body.classList.remove('fd-mode');fdRendreBase();fdPoints();return;}
  if(typeof SD_ANIM!=='undefined')cancelAnimationFrame(SD_ANIM.raf);
  if(typeof mnTunStop==='function'){mnTunStop();mnGenStop();}
  const F=S.fd,b=document.body;b.classList.remove('sd-mode','pp-mode','mn-mode');$('#corps').style.left='';
  b.classList.toggle('fd-mode',fdEstScene()&&!S.fiche);
  rendreBarre();$('#barre [data-go="carte"]')?.querySelectorAll('.mq').forEach(x=>x.remove());fdEntete();
  const a=$('#alerte');a.className='alerte-l';a.innerHTML='';
  const rev=F.etape==='bilan'&&F.anim&&!F.vu&&!F.sansRev&&fdMvt()&&!F.conf&&!F.combat;
  const c=$('#corps');c.style.top=fdEstScene()?'':'108px';c.innerHTML=fdAvecSaison(()=>fdHtml(rev));
  fdCompter(rev);
  if(F.etape==='bilan')F.vu=true;
  if(rev)FD_REV=setTimeout(()=>{const x=$('.fd-rev');if(x)x.classList.add('fd-fin');},4300);
  F.anim=false;F.pose=false;fdGarder();
  if(F.conf){const r=$('#fdRevenir');if(r)r.focus({preventScroll:true});}
  $('#zone').classList.toggle('fiche-ouverte',!!S.fiche);
};
const fdAllerBase=aller;
aller=function(ec){
  if(ec!=='finsaison'){if(S.ecran==='finsaison')S.fd.conf=null;document.body.classList.remove('fd-mode');fdAllerBase(ec);return;}
  if(S.fiche)fermerFiche(false);
  S.rs.det=null;S.rc.nego=null;
  if(S.ecran!==ec){S.hist.push(S.ecran);S.futur=[];S.fd.anim=true;}
  S.ecran=ec;rendre();
};
const fdOuvrirBase=ouvrirFiche;
ouvrirFiche=function(id,garderFutur=false){
  if(S.ecran!=='finsaison'){fdOuvrirBase(id,garderFutur);return;}
  if(!garderFutur)S.futur=[];
  if(S.fiche&&S.fiche!==id)S.ficheHist.push(S.fiche);
  S.fiche=id;S.panCat=false;rendre();rendreFiche();setTimeout(()=>$('#fiche').classList.add('ouverte'),30);
};
const fdRetourBase=retour;
retour=function(){
  while(S.ecran!=='finsaison'&&S.hist.length&&S.hist[S.hist.length-1]&&S.hist[S.hist.length-1].fd)S.hist.pop();
  if(S.ecran==='finsaison'&&!S.fiche){
    if(S.fd.conf){S.fd.conf=null;rendre();return;}
    const h=S.hist[S.hist.length-1];
    if(h&&h.fd){S.hist.pop();S.futur.push({fd:fdVue()});fdRestaure(h.fd);return;}
  }
  fdRetourBase();
};
function fdAvancer(){
  const f=S.futur[S.futur.length-1];
  if(S.ecran==='finsaison'&&!S.fiche&&f&&f.fd){S.futur.pop();S.hist.push({fd:fdVue()});S.fd.conf=null;fdRestaure(f.fd);return true;}
  return false;
}
function fdVers(etape,extra={}){fdPas(()=>{Object.assign(S.fd,{etape,combat:null},extra);if(etape==='choc')S.fd.chocVu=true;});}
function fdContinuer(){
  const F=S.fd;
  if(F.conf)return;
  if(F.etape==='mi'){fdVers('message',{msg:'bilan'});return;}
  if(F.tardive&&(F.etape==='message'||F.etape==='offres')){if(F.dec)fdVers('suite');else if(F.etape==='message')fdVers('offres');else fdVers('suite');return;}
  if(F.etape==='message'||F.etape==='bilan'||F.etape==='offres'){
    if(!F.dec){toast(`${FD_PATRON} attend ta réponse.`);if(F.etape==='message')fdVers(F.ordre==='prix'?'prix':'bilan');return;}
    fdVers(F.ordre==='prix'?'suite':'prix');return;
  }
  if(F.etape==='prix'){fdVers('classement');return;}
  if(F.etape==='classement'){fdVers(F.dec?'suite':'bilan');return;}
  if(F.etape==='suite'){
    if(F.dec==='rester'){fdVers('choc',{msg:'choc'});return;}
    if(fdSansPoste()){
      if(F.tardive&&!F.dec&&!F.refus.includes(0)){fdVers('message',{msg:'offre0'});return;}
      if(F.attente>=3&&!F.tardive){fdPas(()=>{F.attente=4;F.tardive=true;F.refus=[];F.dec=null;F.sel=0;F.etape='message';F.msg='offre0';});return;}
      fdPas(()=>{F.attente++;});toast(`Aucune offre au ${fdDate(fdAttente())}.`);return;}
    toast('Seul Split se joue dans la maquette.');return;
  }
  if(F.etape==='choc'){if(F.choc==='recu')toast('Réponse sous 14 jours.');fdVers('saisons',{saison:2028,ong:'choc'});return;}
  if(F.etape==='saisons'){S.og.onglet='carriere';S.og.sel=null;S.og.anim=true;aller('organisation');}
}

/* ---- Clics ---- */
document.addEventListener('click',e=>{
  const t=e.target,stop=()=>e.stopImmediatePropagation();let el;
  if(S.ecran==='organisation'&&t.closest('[data-fdsaisons]')){stop();S.fd.etape='saisons';S.fd.anim=true;S.fd.combat=null;aller('finsaison');return;}
  if(S.ecran==='calendrier'&&(el=t.closest('[data-fdouvrir]'))){stop();Object.assign(S.fd,{etape:el.dataset.fdouvrir,msg:el.dataset.fdouvrir==='mi'?'mi':'bilan',combat:null,anim:true});aller('finsaison');return;}
  if(S.ecran!=='finsaison')return;
  const F=S.fd;
  if(!S.fiche&&t.closest('#barre [data-go="messages"]')&&['mi','message','choc'].includes(F.etape)){stop();return;}
  if(t.closest('#bAvant')&&!S.fiche&&fdAvancer()){stop();return;}
  if(t.closest('#bRetour')&&!S.fiche&&(F.conf||(S.hist[S.hist.length-1]||{}).fd)){stop();retour();return;}
  if(t.closest('#bContinuer')){stop();if(S.fiche)fermerFiche();fdContinuer();return;}
  if(S.fiche&&t.closest('[data-action="proposer"]')){stop();toast('Cartes absentes de la maquette.');return;}
  /* Pendant le dévoilement, un clic montre tout de suite le verdict. */
  const rv=$('.fd-rev:not(.fd-fin)');if(rv&&t.closest('#corps')){stop();clearTimeout(FD_REV);rv.classList.add('fd-fin');return;}
  if(S.fiche||!t.closest('#corps'))return;
  if(t.closest('[data-fdconfok]')){stop();fdConfirmer();return;}
  if(t.closest('[data-fdconfnon]')){stop();F.conf=null;rendre();return;}
  if(F.conf)return;
  if(t.closest('[data-fiche]'))return;
  if(t.closest('[data-fdfermer]')){stop();fdPas(()=>{F.combat=null;});return;}
  if((el=t.closest('[data-fdconf]'))){stop();F.conf={t:el.dataset.fdconf,i:el.dataset.fdi!=null?+el.dataset.fdi:null};rendre();return;}
  if((el=t.closest('[data-fdgo]'))){stop();const x={};if(el.dataset.fdmsgc!=null)x.msg='choc';if(el.dataset.fdi!=null)x.sel=+el.dataset.fdi;if(el.dataset.fdpi!=null)x.prixi=+el.dataset.fdpi;fdVers(el.dataset.fdgo,x);return;}
  if((el=t.closest('[data-fdoff]'))){stop();const i=+el.dataset.fdoff;if(i!==F.sel)fdPas(()=>{F.sel=i;F.pose=true;});return;}
  if((el=t.closest('[data-fdprix]'))){stop();const i=+el.dataset.fdprix;if(i!==F.prixi)fdPas(()=>{F.prixi=i;F.pose=true;});return;}
  if(t.closest('[data-fdsans]')){stop();fdPas(()=>{F.dec='sans';F.termine=true;F.etape=F.ordre==='prix'?'suite':'prix';});return;}
  if(t.closest('[data-fdentrer]')){stop();toast('Seul Split se joue dans la maquette.');return;}
  if((el=t.closest('[data-fdmsg]'))){stop();const v=el.dataset.fdmsg;if(v!==F.msg)fdPas(()=>{F.msg=v;});return;}
  if((el=t.closest('[data-fdcombat]'))){stop();const v=el.dataset.fdcombat;fdPas(()=>{F.combat=v;});return;}
  if(t.closest('[data-fdcarriere]')){stop();S.og.onglet='carriere';S.og.sel=null;S.og.anim=true;aller('organisation');return;}
  if(t.closest('[data-fdsuivre]')){stop();fdVers('saisons',{saison:2028,ong:'choc'});return;}
  if(t.closest('[data-fdnego]')){stop();fdVers('negocier',{brouillon:fdCarte().map(x=>({...x}))});return;}
  if(t.closest('[data-fdnann]')){stop();fdVers('choc',{brouillon:null,msg:'choc'});return;}
  if((el=t.closest('[data-fdnch]'))){stop();const i=+el.dataset.fdnch;if(i!==F.negSel)fdPas(()=>{F.negSel=i;});return;}
  if((el=t.closest('[data-fdnmode]'))){stop();const v=el.dataset.fdnmode;if(v!==F.negMode)fdPas(()=>{F.negMode=v;});return;}
  if((el=t.closest('[data-fdnpick]'))){stop();const cat=fdCatsTout()[F.negSel],v=el.dataset.fdnpick;if(v!==fdPick(cat).id)fdPas(()=>{F.negPick={...F.negPick,[cat]:v};});return;}
  if((el=t.closest('[data-fdnadd]'))){stop();const cat=fdCatsTout()[F.negSel],b=fdBrouillon(),id=el.dataset.fdnadd,cl=el.dataset.fda!=null,a=cl?el.dataset.fda:fdChampSplit(cat).id;
    const libre=b.length<5&&!b.some(x=>x.a===a||x.b===id)&&(cl?fdClassesSplit(cat).some(c=>c.id===a):!FD_DISPO.s[cat]);
    if(libre)fdPas(()=>{F.brouillon=[...b,{c:cat,a,b:id}];});return;}
  if((el=t.closest('[data-fdnret]'))){stop();const i=+el.dataset.fdnret,b=fdBrouillon();fdPas(()=>{F.brouillon=b.filter((_,k)=>k!==i);});return;}
  if((el=t.closest('[data-fdsaison]'))){stop();const v=+el.dataset.fdsaison;if(v!==F.saison)fdPas(()=>{F.saison=v;});return;}
  if((el=t.closest('[data-fdong]'))){stop();const v=el.dataset.fdong;if(v!==F.ong)fdPas(()=>{F.ong=v;});return;}
},true);
document.addEventListener('keydown',e=>{
  if(S.ecran!=='finsaison'||S.fiche)return;
  const F=S.fd;
  if(e.key==='Escape'){
    if(F.conf){e.stopImmediatePropagation();e.preventDefault();F.conf=null;rendre();return;}
    if(F.combat){e.stopImmediatePropagation();e.preventDefault();fdPas(()=>{F.combat=null;});}
    return;
  }
  if(F.etape==='prix'&&!F.conf&&!F.combat&&(e.key==='ArrowUp'||e.key==='ArrowDown')){
    const n=FD_PRIX[fdAnnee()].length,i=(F.prixi+(e.key==='ArrowDown'?1:n-1))%n;e.stopImmediatePropagation();e.preventDefault();fdPas(()=>{F.prixi=i;F.pose=true;});
  }
},true);

/* ---- Lancement : une adresse avec un paramètre fd montre l'état demandé, sans lire ni écrire la mémoire ---- */
window.addEventListener('DOMContentLoaded',()=>{
  const q=new URLSearchParams(location.search);
  if(q.get('ecran')!=='finsaison')return;
  const g=k=>q.get(k),cles=['fdetape','fdcas','fdoffre','fddec','fdconf','fdchoc','fdcontre','fdnch','fdnmode','fdprix','fdsaison','fdong','fdcombat','fdmots','fdordre','fdvide','fdrev'];
  if(cles.some(k=>q.has(k))){
    const F=S.fd=Object.assign(fdNeuf(),{demo:true});
    if(Object.hasOwn(FD_CL,g('fdcas')||''))F.cas=g('fdcas');
    if(g('fdoffre')==='sans')F.avec=false;
    if(Object.hasOwn(FD_MOTS,g('fdmots')||''))F.mots=g('fdmots');
    if(g('fdordre')==='prix')F.ordre='prix';
    if(g('fdrev')==='0')F.sansRev=true;
    if(FD_ETAPES.includes(g('fdetape')))F.etape=g('fdetape');
    if(g('fdcontre')==='1'&&F.etape==='choc')F.etape='negocier';
    if(['choc','negocier'].includes(F.etape)&&F.cas==='renvoi')F.etape='bilan';
    if(F.etape==='offres'&&!fdOffres().length)F.etape='bilan';
    if(F.etape==='mi')F.msg='mi';else if(['choc','negocier'].includes(F.etape))F.msg='choc';
    const d=g('fddec');
    if(fdDecValide(d,F.cas,fdOffres().length))F.dec=d;
    else if(F.etape==='suite')F.dec=F.cas==='renvoi'?(F.avec?'offre0':'sans'):'rester';
    if(F.dec==='sans')F.refus=fdOffres().map((_,i)=>i);
    if(F.etape==='saisons'&&g('fdvide')!=='1'){F.termine=true;if(!F.dec)F.dec=F.cas==='renvoi'?'sans':'rester';}
    if(['choc','negocier'].includes(F.etape)&&!F.dec)F.dec='rester';
    if(['prix','classement','suite','choc','negocier'].includes(F.etape)||F.dec)F.termine=true;
    if(['choc','negocier'].includes(F.etape)||['accepte','refuse'].includes(g('fdchoc'))||g('fdong')==='choc'){if(F.cas!=='renvoi')F.chocVu=true;}
    if(['recu','accepte','refuse'].includes(g('fdchoc')))F.choc=g('fdchoc');
    if(F.etape==='negocier'&&F.choc!=='recu')F.etape='choc';
    if(/^([0-9]|1[01])$/.test(g('fdnch')||''))F.negSel=+g('fdnch');
    if(g('fdnmode')==='classe')F.negMode='classe';
    if(/^[0-5]$/.test(g('fdprix')||''))F.prixi=+g('fdprix');
    if(['2027','2028'].includes(g('fdsaison')))F.saison=+g('fdsaison');
    if(['bilan','prix','classement','choc'].includes(g('fdong')))F.ong=g('fdong');
    if(g('fdcombat')&&fdCombat(g('fdcombat')))F.combat=g('fdcombat');
    const co=g('fdconf'),libre=fdRestantes().some(o=>o.i===0);
    const permis={rester:F.cas!=='renvoi'&&!F.dec&&['bilan','offres'].includes(F.etape),accepter:libre&&!F.dec&&F.etape==='offres',refuser:libre&&!F.dec&&F.etape==='offres',fin:F.etape==='suite'&&fdSansPoste(),choc:F.etape==='choc'&&F.choc==='recu',chocrefus:F.etape==='choc'&&F.choc==='recu'};
    if(Object.hasOwn(permis,co||'')&&permis[co]===true)F.conf={t:co,i:co==='accepter'||co==='refuser'?0:null};
  }
  S.ecran='finsaison';S.hist=['accueil'];S.fd.anim=true;rendre();
});
/* ==== [FIN ANCRE] ==== */
