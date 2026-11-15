"use strict";
/* Maquette lot 1 — les Camps d'entraînement (R27 ; Q27a à Q27c). L'écran « Camps » de la barre. Préfixe cp-. Refait le 15/11 (2e passe).
   D'abord les salles de Split : où s'entraînent tes combattants, avec qui, qui prépare la soirée du 16 février, qui est blessé.
   Puis le monde, en vivier : le classement des salles (Q27a), qui bouge seul d'après leurs résultats (Q27b), et le Recruteur.
   Q27c : autant de salles que dans le paysage de l'UFC, de tailles différentes : hypothèse 240. Les classés viennent des Classements. */

/* ---- Les spécialités, et le passé de l'entraîneur ---- */
const CP_SPECS=['Lutte','Jiu-jitsu brésilien','Boxe anglaise','Kickboxing','Muay-thaï','Sambo','Judo','Karaté'];
const CP_ANCIEN={'Lutte':'ancien lutteur','Jiu-jitsu brésilien':'ceinture noire de jiu-jitsu brésilien','Boxe anglaise':'ancien boxeur','Kickboxing':'ancien kickboxeur',
  'Muay-thaï':'ancien combattant de muay-thaï','Sambo':'ancien sambiste','Judo':'ancien judoka','Karaté':'ancien karatéka'};

/* ---- Les pays : région du filtre, noms des entraîneurs (inventés), villes ---- */
const CP_NOMS={
  fr:[['Julien','Sébastien','Nicolas','Christophe','Mehdi','Olivier','Yannick','Franck','Rachid','Stéphane','Cédric','Laurent','Djamel','Fabien','Grégory','Romain','Jérôme','Thierry'],
      ['Aubry','Morel','Rey','Bouzid','Lacroix','Perrin','Vasseur','Hamdi','Chevalier','Ferrandi','Gauthier','Mallet','Brunel','Tessier','Lefort','Pujol','Arnaud','Benhamou','Colin','Royer','Joly','Masson','Bonnet','Dupuis','Guérin','Rolland','Marchal','Lemoine']],
  br:[['Rodrigo','Marcelo','Fábio','André','Thiago','Ricardo','Luiz','Paulo','Wagner','Eduardo'],['Cardoso','Brandão','Siqueira','Lopes','Prado','Teles','Moura','Aguiar','Campos','Bezerra']],
  en:[['Kyle','Brandon','Greg','Sean','Jason','Craig','Ryan','Derek','Matt','Chris','Owen','Travis'],['Brooks','Walsh','Doyle','Prescott','Mercer','Gaines','Holloway','Pratt','Kerr','Sutton','Whelan','Barlow','Fenton']],
  ru:[['Magomed','Ruslan','Arsen','Shamil','Timur','Murad','Zaur'],['Gadzhiev','Magomedov','Aliev','Kurbanov','Omarov','Isaev']],
  kz:[['Nurlan','Rustam','Daulet','Yerlan','Sanjar'],['Akhmetov','Kaliev','Tursunov','Seitkali','Rakhimov']],
  ge:[['Giorgi','Davit','Irakli','Zurab','Nika','Lasha'],['Kapanadze','Beridze','Lomidze','Tsiklauri','Gelashvili','Chikovani']],
  am:[['Tigran','Gor','Narek'],['Petrosyan','Hakobyan','Sargsyan']],
  mn:[['Batbayar','Ganzorig','Temuulen'],['Ganbold','Batjargal','Enkhbat']],
  pl:[['Andrzej','Tomasz','Krzysztof','Marcin'],['Kowal','Wróbel','Mazur','Krawczyk','Dudek']],
  de:[['Lukas','Stefan','Jonas','Tobias'],['Hofmann','Brandt','Vogel','Schreiber','Krause']],
  nl:[['Pieter','Bram','Joost','Wouter','Sander','Niels'],['Peeters','Janssens','van Dijk','Maes','Smits','Bakker','de Vries']],
  se:[['Erik','Anders','Mattias','Oskar','Viktor','Henrik'],['Lund','Berg','Holm','Sjöberg','Nyström','Dahl','Ek']],
  es:[['Javier','Sergio','Álvaro','Rubén'],['Navarro','Molina','Herrero','Castaño']],
  it:[['Matteo','Davide','Luca','Andrea'],['Ricci','Marino','Greco','Bruno','Galli']],
  pt:[['Tiago','Nuno','Rui'],['Pires','Matos','Nunes','Gouveia']],
  jp:[['Takeshi','Daisuke','Hiroki'],['Ishida','Kondo','Fujii','Mori']],kr:[['Min-jun','Seung-ho'],['Park','Choi','Han']],cn:[['Wei','Jun','Hao'],['Zhang','Liu','Wang']],
  ph:[['Rafael','Joel'],['Dela Cruz','Bautista']],th:[['Somsak','Anan','Kittisak','Prasert','Nattapong'],['Sitthichai','Wongsawat','Chaiyaporn','Boonmee','Srisuk']],
  ng:[['Emeka','Chinedu','Tunde'],['Okeke','Adeyemi','Nwosu']],sn:[['Ousmane','Moussa','Cheikh'],['Ndiaye','Diop','Faye']],cm:[['Serge','Patrice','Hervé'],['Mbarga','Ateba','Essomba']],
  za:[['Thabo','Sipho','Johan'],['Dlamini','Nkosi','van Wyk']],ma:[['Youssef','Hamza','Anas'],['El Idrissi','Benjelloun','Chraibi']],
  mx:[['Héctor','Rubén','Alonso','Joel'],['Ortiz','Robles','Zamora','Castro']],kg:[['Bakyt','Aibek','Nurbek'],['Usenov','Joldoshev','Asanov']],
};
/* [pays, région du filtre, langue des noms, villes] */
const CP_PAYS=[
  ['France','fr','fr',['Paris','Marseille','Toulouse','Nice','Nantes','Bordeaux','Lille','Rennes','Strasbourg','Montpellier','Toulon','Clermont-Ferrand','Rouen','Metz','Dijon','Perpignan','Annecy','Bayonne','Tours','Reims','Le Havre','Ajaccio','Nîmes','Amiens','Limoges','Valence','Chambéry','Orléans','Caen','Mulhouse']],
  ['États-Unis','am','en',['Denver','San Jose','Albuquerque','Miami','Houston','Sacramento','Chicago','Atlanta','Philadelphie','Salt Lake City']],
  ['Brésil','am','br',['São Paulo','Belo Horizonte','Manaus','Natal','Porto Alegre','Fortaleza']],
  ['Russie','est','ru',['Moscou','Saint-Pétersbourg','Grozny','Kazan','Iekaterinbourg']],
  ['Kazakhstan','est','kz',['Astana','Chymkent']],['Ouzbékistan','est','kz',['Tachkent']],['Arménie','est','am',['Erevan']],['Géorgie','est','ge',['Tbilissi']],['Mongolie','est','mn',['Oulan-Bator']],
  ['Royaume-Uni','eu','en',['Londres','Liverpool','Birmingham','Glasgow']],['Irlande','eu','en',['Cork']],
  ['Pologne','eu','pl',['Varsovie','Cracovie','Wrocław']],['Allemagne','eu','de',['Berlin','Cologne','Hambourg']],['Pays-Bas','eu','nl',['Rotterdam']],
  ['Belgique','eu','nl',['Bruxelles','Liège']],['Espagne','eu','es',['Madrid','Barcelone','Valence']],['Italie','eu','it',['Rome','Milan','Turin']],
  ['Portugal','eu','pt',['Lisbonne','Porto']],['Suisse','eu','fr',['Genève']],['Suède','eu','se',['Göteborg']],
  ['Thaïlande','as','th',['Bangkok','Chiang Mai']],['Kirghizistan','est','kg',['Och']],['Japon','as','jp',['Osaka','Nagoya']],['Corée du Sud','as','kr',['Séoul']],['Chine','as','cn',['Pékin','Chengdu']],['Philippines','as','ph',['Baguio']],
  ['Australie','as','en',['Melbourne','Perth','Brisbane']],['Nouvelle-Zélande','as','en',['Auckland']],
  ['Mexique','am','mx',['Mexico','Monterrey']],['Canada','am','en',['Montréal','Toronto']],
  ['Nigeria','af','ng',['Lagos']],['Sénégal','af','sn',['Dakar']],['Cameroun','af','cm',['Douala']],['Afrique du Sud','af','za',['Johannesburg']],['Maroc','af','ma',['Casablanca']],
];
const CP_REG={fr:'France',eu:'Europe',est:'Europe de l’Est et Asie centrale',am:'Amériques',as:'Asie et Océanie',af:'Afrique'};
const cpPays=p=>CP_PAYS.find(x=>x[0]===p);

/* ---- Les salles écrites à la main : les grandes écuries, puis les salles des combattants de Split (À RELIRE) ----
   [id, nom, ville, pays, spécialité, combattants, champions formés, entraîneur, depuis, fondée, ancien (facultatif), id de fiche (facultatif)] */
const CP_MAIN=[
  ['coral','Coral Coast Fight Team','Fort Lauderdale','États-Unis','Lutte',46,9,'Dwayne Harlan',2006,2001,'ancien lutteur universitaire'],
  ['kaspi','Kaspi Fight Club','Makhatchkala','Russie','Lutte',41,8,'Magomed Saidov',2009,2004,'ancien lutteur, champion de Russie'],
  ['leao','Academia Leão','Rio de Janeiro','Brésil','Jiu-jitsu brésilien',38,7,'Rodrigo Valadares',2003,1997],
  ['mesa','Mesa Combat Club','Phoenix','États-Unis','Kickboxing',34,6,'Ray Calloway',2012,2008],
  ['desert','Desert Kings MMA','Las Vegas','États-Unis','Boxe anglaise',31,4,'Marcus Delane',2015,2011,'ancien boxeur professionnel'],
  ['cross','Southern Cross MMA','Sydney','Australie','Kickboxing',29,5,'Tane Whitford',2014,2010],
  ['andaman','Andaman Fight Camp','Phuket','Thaïlande','Muay-thaï',27,3,'Somchai Rattanakorn',2013,2009],
  ['batoumi','Batoumi Fight Club','Batoumi','Géorgie','Lutte',26,3,'Levan Abashidze',2016,2012,'ancien lutteur gréco-romain'],
  ['nordic','Nordic Fight Academy','Stockholm','Suède','Kickboxing',25,2,'Johan Lindell',2010,2005],
  ['amstel','Amstel Kickboxing','Amsterdam','Pays-Bas','Kickboxing',19,2,'Remco de Wit',2009,1994],
  ['liffey','Liffey Combat Club','Dublin','Irlande','Jiu-jitsu brésilien',18,2,'Declan Moran',2011,2007],
  ['steppe','Steppe Fight Team','Almaty','Kazakhstan','Lutte',17,1,'Nurlan Akhmetov',2017,2014],
  ['northside','Northside MMA','Manchester','Royaume-Uni','Kickboxing',16,1,'Liam Hargreaves',2012,2009],
  ['pinheiro','Pinheiro Luta Livre','Curitiba','Brésil','Jiu-jitsu brésilien',15,1,'Marcelo Pinheiro',2004,2004],
  ['baltic','Baltic Fight Team','Gdańsk','Pologne','Lutte',14,1,'Paweł Zieliński',2013,2010],
  ['frontera','Frontera Boxing Club','Tijuana','Mexique','Boxe anglaise',14,1,'Héctor Salinas',2008,2002],
  ['shinjuku','Shinjuku Grappling Dojo','Tokyo','Japon','Judo',13,1,'Kenji Morimoto',2006,1999],
  ['alga','Alga Fight Club','Bichkek','Kirghizistan','Sambo',12,0,'Bakyt Usenov',2015,2015],
  ['scheldt','Scheldt Fight Gym','Anvers','Belgique','Karaté',11,0,'Pieter Claes',2016,2016],
  ['villette','Académie de la Villette','Paris','France','Kickboxing',24,2,'Christophe Aubry',2010,2008],
  ['lyonfc','Lyon Fight Club','Lyon','France','Boxe anglaise',21,3,'Karim Ouali',2006,2006,'ancien boxeur amateur'],
  ['rhone','Team Rhône MMA','Villeurbanne','France','Lutte',14,1,'Samir Haddad',2014,2012],
  ['benyahia','Benyahia MMA','Marseille','France','Kickboxing',13,1,'Farid Benyahia',2022,2022,'ancien combattant de Split','sbenyahia'],
  ['grenoble','MMA Grenoble Alpes','Grenoble','France','Jiu-jitsu brésilien',11,0,'Julien Rey',2015,2013],
  ['croix','Croix-Rousse Muay-thaï','Lyon','France','Muay-thaï',10,1,'Sébastien Morel',2011,2003],
  ['nantes','Team Nantes','Nantes','France','Kickboxing',9,0,'Yannick Perrin',2017,2017],
  ['armen','Ar Men Fight Club','Brest','France','Lutte',9,1,'Bastien Kerloc’h',2023,2019,'ancien champion de Split','skerloch'],
  ['stetienne','MMA Saint-Étienne','Saint-Étienne','France','Lutte',8,0,'Samir Bouzid',2018,2016],
];
/* Où s'entraînent les combattants de Split déjà connus (Nana : Lyon Fight Club et Karim Ouali, comme sa fiche). */
const CP_SPLIT={nana:'lyonfc',labbe:'lyonfc',diallo:'lyonfc',roussel:'lyonfc',bello:'villette',darras:'villette',lecomte:'nantes',mezouar:'grenoble',carvalho:'grenoble',
  rachidi:'croix',meziane:'rhone',rizzo:'rhone',kessler:'stetienne',belkacem:'benyahia',abiven:'armen',musaev:'alga',vanbelle:'scheldt'};

/* ---- Le monde des salles : 240, de la grande écurie au club de quartier ---- */
const CP_TOTAL=240;
const cpDe=v=>/^Le /.test(v)?'du '+v.slice(3):/^Les /.test(v)?'des '+v.slice(4):/^[AEIOUÉÈÎ]/.test(v)?'d’'+v:'de '+v;
const CP_MODELES={fr:[v=>`${v} Fight Club`,v=>`Team ${v}`,v=>`MMA ${v}`,v=>`Académie de combat ${cpDe(v)}`,v=>`${v} Combat Club`],
  autre:[v=>`${v} Fight Team`,v=>`${v} MMA`,v=>`${v} Combat Club`,(v,n)=>`Team ${n}`,(v,n)=>`${n} MMA`]};
function cpPoids(r,l,w){const t=l.reduce((a,x)=>a+w(x),0);let k=r()*t;for(const x of l){k-=w(x);if(k<=0)return x;}return l[l.length-1];}
function cpCoach(pays,r,vus,fam){const L=CP_NOMS[cpPays(pays)[2]];let n,f,i=0;do{f=L[1][Math.floor(r()*L[1].length)];n=L[0][Math.floor(r()*L[0].length)]+' '+f;}while((vus.has(n)||(fam.has(f)&&i<25))&&i++<40);vus.add(n);return n;}

/* Le poids de chaque pays dans le MMA (ordre de grandeur des effectifs de l'UFC : États-Unis et Brésil loin devant). */
const CP_POIDS_PAYS={'États-Unis':8,'Brésil':4,'Russie':3,'Royaume-Uni':2,'Mexique':2,'Australie':2,'Canada':2,'Pologne':2,'Kazakhstan':1.5,'Géorgie':1.5,'Japon':1.5,'Chine':1.5};
const CP_SALLES=(function(){
  const l=[],noms=new Set(),coachs=new Set(),famille=new Set(CP_MAIN.map(x=>x[7].split(' ').slice(1).join(' ')));
  for(const [id,nom,ville,pays,spec,pros,,coach,depuis,fondee,ancien] of CP_MAIN){
    l.push({id,nom,ville,pays,spec,pros,coach,depuis,fondee,ancien,main:true});noms.add(nom);coachs.add(coach);}
  /* Les autres, tirées une fois pour toutes (graine), dans le monde entier : la France n'en a qu'une sur dix environ. */
  const r=graine('camps-monde');let k=0;
  while(l.length<CP_TOTAL&&k++<4000){
    const fr=r()<.035,P=fr?CP_PAYS[0]:cpPoids(r,CP_PAYS.slice(1),x=>CP_POIDS_PAYS[x[0]]||1),ville=P[3][Math.floor(r()*P[3].length)];
    const M=CP_MODELES[fr?'fr':'autre'],coach=cpCoach(P[0],r,coachs,famille),nomC=coach.split(' ').slice(1).join(' ');
    const mod=Math.floor(r()*M.length),nom=M[mod](ville,nomC),parNomC=!fr&&mod>=3;
    if(noms.has(nom)||nom.length>22||(parNomC&&famille.has(nomC))){coachs.delete(coach);continue;}noms.add(nom);famille.add(nomC);
    const salle=r()<.24,pros=salle?8+Math.floor(r()*12):1+Math.floor(r()*7);
    const spec=P[0]==='Thaïlande'?'Muay-thaï':cpPoids(r,CP_SPECS,s=>({Lutte:5,'Jiu-jitsu brésilien':4,Kickboxing:4,'Boxe anglaise':3,'Muay-thaï':2,Sambo:1,Judo:1,Karaté:1}[s]*(P[1]==='est'&&/Lutte|Sambo/.test(s)?3:P[2]==='br'&&/Jiu/.test(s)?3:1)));
    const fondee=1995+Math.floor(r()*29);
    l.push({id:'s'+l.length,nom,ville,pays:P[0],spec,pros,coach,depuis:Math.min(2025,fondee+Math.floor(r()*6)),fondee});
  }
  return l;
})();
const cpSalle=id=>CP_SALLES.find(s=>s.id===id);

/* ---- Qui s'entraîne où : les classés du monde (Classements), puis tout l'effectif de Split ---- */
(function cpRepartir(){
  CP_SALLES.forEach(s=>{s.split=[];s.ext=[];});
  /* Les classés des autres organisations vont dans les vraies salles (8 combattants ou plus), surtout les grandes écuries. */
  const etr=CP_SALLES.filter(s=>s.pays!=='France'&&s.pros>=8),fra=CP_SALLES.filter(s=>s.pays==='France');
  for(const sexe of ['H','F'])for(const [cat] of CATS[sexe])clMonde(cat).slice(0,30).forEach(c=>{
    if(!c.ext||c.staff)return;const r=graine(c.id+'salle');
    const s=cpPoids(r,r()<.05?fra.filter(x=>x.pros>=8):etr,x=>c.champOrg&&x.ext.filter(y=>y.champOrg).length>=4?0:Math.pow(x.pros,c.champOrg?2.4:1.8));
    s.ext.push(c);c.cpSalle=s.id;});
  /* Split, deuxième organisation du monde : un tiers de ses combattants en France, les autres dans le monde entier. */
  const proche=/Lyon|Villeurbanne|Grenoble|Saint-Étienne|Annecy|Chambéry|Valence/;
  const monde=CP_SALLES.filter(x=>x.pays!=='France');
  COMBATTANTS.forEach(c=>{
    let s=CP_SPLIT[c.id]&&cpSalle(CP_SPLIT[c.id]);
    if(!s){const r=graine(c.id+'camp');s=r()<.35?cpPoids(r,fra,x=>Math.pow(x.pros,.5)*(proche.test(x.ville)?1.3:1)):cpPoids(r,monde,x=>Math.pow(x.pros,.8));}
    s.split.push(c);c.cpSalle=s.id;});
  /* Sa taille, ses champions en titre, ses classés (top 15 mondial), son année ; le classement en découle (Q27b). */
  CP_SALLES.forEach(s=>{
    const r=graine(s.id+'saison'),tous=[...s.ext,...s.split];
    s.pros=Math.max(s.pros,s.split.length+s.ext.length+Math.floor(r()*3));
    s.taille=s.pros>=25?'ecurie':s.pros>=8?'salle':'club';
    s.champions=tous.filter(c=>c.ext?c.champOrg:c.rang==='C').length;
    s.classes=tous.filter(c=>c.mondial<=15).length;
    const q=Math.min(1,s.classes/10+s.champions/8),comb=Math.max(1,Math.round(s.pros*(1.1+r()*.35)));
    s.v=Math.round(comb*(.44+q*.16+r()*.08));s.d=Math.max(0,comb-s.v);
    s.score=s.champions*20+s.classes*8+s.pros*1.5+(s.v-s.d)*.8+r()*3;
  });
  [...CP_SALLES].sort((a,b)=>b.score-a.score).forEach((s,i)=>{s.rang=i+1;const r=graine(s.id+'tend');
    s.tend=i<3||r()<.55?'=':r()<.55?'+'+(1+Math.floor(r()*3)):'-'+(1+Math.floor(r()*3));});
})();
/* ---- Ce qui bouge (Q27b, retour du 15/11 : « progresser, rétrograder, changer de salle ») ; À RELIRE ----
   La taille d'il y a un an : une salle qui gagne passe de club à salle, de salle à grande écurie ; une qui perd redescend. */
(function cpBouger(){
  CP_SALLES.forEach(s=>{const r=graine(s.id+'taille0'),pente=s.tend[0]==='+'?3:s.tend[0]==='-'?-3:0;
    s.prosAvant=Math.max(1,s.pros-pente-Math.round((r()-.5)*6));s.tailleAvant=s.prosAvant>=25?'ecurie':s.prosAvant>=8?'salle':'club';});
  /* L'entraîneur : son passé (adjoint dans une plus grande salle), et parfois un changement d'entraîneur en 2026. */
  const grandes=CP_SALLES.filter(x=>x.taille!=='club');
  CP_SALLES.forEach(s=>{const r=graine(s.id+'coach');s.parcours=[];
    if(r()<.65){const a=cpPoids(r,grandes.filter(x=>x!==s&&x.rang<s.rang+40),x=>cpPays(x.pays)[1]===cpPays(s.pays)[1]?4:1),fin=s.depuis,deb=Math.max(1998,fin-3-Math.floor(r()*6));
      s.parcours.push([`${deb} – ${fin}`,'Entraîneur adjoint',a.id]);}
    s.parcours.push([`depuis ${s.depuis}`,'Entraîneur principal',s.id]);
    if(!s.main&&r()<.08){const m=3+Math.floor(r()*9);s.depuis=2026;s.parcours[s.parcours.length-1][0]='depuis '+RC_MOIS[m]+' 2026';
      s.coachAvant={nom:cpCoach(s.pays,r,new Set(CP_SALLES.map(x=>x.coach)),new Set()),date:new Date(2026,m,1),vers:cpPoids(r,grandes.filter(x=>x!==s),x=>x.pros).id};}
  });
  /* Qui est l'entraîneur : son âge, et s'il a combattu en MMA, son bilan et ses années. */
  CP_SALLES.forEach(s=>{const r=graine(s.id+'homme'),deb=+String(s.parcours[0][0]).match(/\d{4}/)[0];
    s.coachAge=Math.min(66,Math.max(33,2026-deb+29+Math.floor(r()*8)));
    if(/combattant|champion de Split/.test(s.ancien||'')||r()<.5){const fin=Math.max(1995,deb-Math.floor(r()*3)),dbt=fin-5-Math.floor(r()*6);
      s.coachMMA={v:8+Math.floor(r()*13),d:2+Math.floor(r()*7),de:dbt,a:fin};}
    /* Son équipe : une grande écurie a un entraîneur par domaine, un club tient souvent à un seul homme. */
    const vus=new Set(CP_SALLES.map(x=>x.coach)),rr=graine(s.id+'equipe');
    const roles=s.taille==='ecurie'?['Frappe','Lutte','Jiu-jitsu brésilien','Préparation physique']:s.taille==='salle'?['Frappe','Lutte','Préparation physique']:rr()<.5?['Frappe']:[];
    const fam=new Set([s.coach.split(' ').slice(1).join(' ')]),pre=new Set([s.coach.split(' ')[0]]);
    s.equipe=roles.map(x=>{let n,k=0,dup;do{n=cpCoach(s.pays,rr,vus,fam);dup=pre.has(n.split(' ')[0])||fam.has(n.split(' ').slice(1).join(' '));}while(dup&&k++<30);if(dup)return null;fam.add(n.split(' ').slice(1).join(' '));pre.add(n.split(' ')[0]);return [x,n];}).filter(Boolean);
  });
  /* Les combattants de Split qui ont changé de salle en 2026 (un sur huit environ). */
  COMBATTANTS.forEach(c=>{const r=graine(c.id+'transfert');if(r()>.12)return;const ici=cpSalle(c.cpSalle);
    const avant=cpPoids(r,CP_SALLES.filter(x=>x!==ici&&(x.pays===ici.pays||r()<.3)),x=>Math.sqrt(x.pros));
    c.cpAvant=avant.id;c.cpDate=new Date(2026,2+Math.floor(r()*10),1+Math.floor(r()*27));});
})();
/** Les mouvements d'une salle en 2026 : arrivées, départs, entraîneur, taille ; du plus récent au plus ancien. */
function cpMouvements(s){
  const l=[];
  COMBATTANTS.forEach(c=>{if(!c.cpAvant)return;
    if(c.cpSalle===s.id)l.push([c.cpDate,'arr',c,cpSalle(c.cpAvant)]);
    else if(c.cpAvant===s.id)l.push([c.cpDate,'dep',c,cpSalle(c.cpSalle)]);});
  if(s.coachAvant)l.push([s.coachAvant.date,'coach',null,cpSalle(s.coachAvant.vers)]);
  if(s.tailleAvant!==s.taille)l.push([new Date(2026,11,31),'taille',null,null]);
  return l.sort((a,b)=>b[0]-a[0]);
}
/* La statistique de chaque spécialité (à quoi on la reconnaît dans la cage), et la moyenne mondiale ; À RELIRE. */
const CP_STAT={
  'Lutte':['amenées au sol par 15 min',1.6,1,''],'Jiu-jitsu brésilien':['de leurs victoires par soumission',22,0,' %'],
  'Boxe anglaise':['de précision sur les frappes à la tête',41,0,' %'],'Kickboxing':['coups de pied par combat',11,0,''],
  'Muay-thaï':['frappes au clinch (coudes, genoux) par combat',6,0,''],'Sambo':['de leurs soumissions sur une clé de jambe',14,0,' %'],
  'Judo':['projections réussies par combat',1.1,1,''],'Karaté':['frappes encaissées par minute',3.2,1,'']};
CP_SALLES.forEach(s=>{const [,m,d]=CP_STAT[s.spec],r=graine(s.id+'stat'),k=s.spec==='Karaté'?1/(1.2+r()*.5):1.2+r()*.7;s.stat=d?+(m*k).toFixed(1):Math.round(m*k);});
const cpVal=(v,d)=>d?String(v).replace('.',','):String(v);
const CP_COMPTE={ecurie:CP_SALLES.filter(s=>s.taille==='ecurie').length,salle:CP_SALLES.filter(s=>s.taille==='salle').length,club:CP_SALLES.filter(s=>s.taille==='club').length};
const CP_TAILLE_MOT={ecurie:'Grande écurie',salle:'Salle',club:'Club'};

/* ---- Ce que vivent tes combattants : la soirée du 16 février (la carte de la maquette Carte), l'infirmerie, l'année 2026 ---- */
/** Le combat prévu d'un combattant de Split : sur la carte de Split Fight Night 63, ou rien. */
function cpCombat(id){
  for(const f of [...S.af.m,...S.af.p]){if(f.a===id)return {adv:f.b};if(f.b===id)return {adv:f.a};}
  return null;
}
/** Ses combats de 2026 : les derniers de sa série (le plus récent est le dernier caractère). */
function cpAnnee(c){if(!c.dernier||c.dernier.getFullYear()!==2026)return '';let h=0;for(const ch of c.id)h=(h*31+ch.charCodeAt(0))>>>0;return c.serie.slice(-(1+h%2));}
function cpBilanSplit(s){const t=s.split.map(cpAnnee).join('');return [t.split('v').length-1,t.split('d').length-1];}
const cpAffiche=s=>s.split.filter(c=>cpCombat(c.id)).length;

/* ---- L'état de l'écran : Split ou Le monde, taille, spécialité, sens du rang (gardés au retour), salle choisie ---- */
const CP_CLE='maquette-camps-4';
S.cp=Object.assign({vue:'split',taille:'toutes',spec:'toutes',sens:1,menu:false,sel:'lyonfc',msel:'kaspi',anim:true},(()=>{try{return JSON.parse(localStorage.getItem(CP_CLE))||{};}catch(e){return {};}})());
function cpGarder(){try{const {vue,taille,spec,sens}=S.cp;localStorage.setItem(CP_CLE,JSON.stringify({vue,taille,spec,sens}));}catch(e){}}
const cpEtat=()=>JSON.stringify({coach:S.cp.coach||null,vue:S.cp.vue,taille:S.cp.taille,spec:S.cp.spec,sens:S.cp.sens,sel:S.cp.sel,msel:S.cp.msel});

/* ---- Les salles en cartes, rangées par taille (retours du 15/11 : « plus vivant », « faire la différence entre
   grandes écuries, salles et clubs », « pouvoir trier ») : trois rayons, et dans chacun le tri choisi.
   Grandes écuries : grandes cartes, deux par ligne. Salles : trois par ligne. Clubs : petites cartes, quatre par ligne. ---- */
const cpTend=t=>t==='='?'':t[0]==='+'?`<span class="cp-up">▲ ${t.slice(1)}</span>`:`<span class="cp-down">▼ ${t.slice(1)}</span>`;
const CP_TAILLES=[['ecurie','Grandes écuries','25 combattants ou plus'],['salle','Salles','8 à 24 combattants'],['club','Clubs','moins de 8 combattants']];
const cpBlesses=s=>s.split.filter(c=>c.statut==='blesse').length;
const cpBase=()=>S.cp.vue==='monde'?CP_SALLES:CP_SALLES.filter(s=>s.split.length);
function cpListe(){
  const F=S.cp;
  return cpBase().filter(s=>(F.taille==='toutes'||s.taille===F.taille)&&(F.spec==='toutes'||s.spec===F.spec)).sort((a,b)=>(a.rang-b.rang)*F.sens);
}
/** La taille en un coup d'œil : trois octogones, pleins selon la taille (3 = grande écurie, 2 = salle, 1 = club). */
const cpTaillePicto=t=>`<span class="cp-tp" title="${esc(CP_TAILLE_MOT[t])}">${[1,2,3].map(k=>`<i class="octr ${k<=({ecurie:3,salle:2,club:1}[t])?'on':''}"></i>`).join('')}</span>`;
/** Un octogone par combattant de Split : plein jaune s'il est à l'affiche, rouge s'il est blessé, gris sinon. */
function cpPoints(s,max){
  const l=[...s.split].sort((a,b)=>(cpCombat(b.id)?2:b.statut==='blesse'?1:0)-(cpCombat(a.id)?2:a.statut==='blesse'?1:0));
  return `<div class="cp-pts">${l.slice(0,max).map((c,i)=>`<i class="octr ${cpCombat(c.id)?'p-af':c.statut==='blesse'?'p-bl':''}" style="animation-delay:${120+i*25}ms" title="${esc(c.prenom+' '+c.nom)}"></i>`).join('')}${l.length>max?`<span class="sous">+${l.length-max}</span>`:''}</div>`;
}
const cpMini=(x,l,cls='')=>`<div class="cp-m ${cls}"><b class="T">${x}</b><span>${l}</span></div>`;
/** Monté ou descendu d'une taille depuis un an. */
function cpBouge(s){if(s.tailleAvant===s.taille)return '';const o=['club','salle','ecurie'],up=o.indexOf(s.taille)>o.indexOf(s.tailleAvant);
  return `<span class="cp-bg ${up?'up':'down'}" title="${up?'Monté':'Descendu'} : ${esc(CP_TAILLE_MOT[s.tailleAvant].toLowerCase())} il y a un an">${up?'▲':'▼'} ${up?'monte':'descend'}</span>`;}
const cpCoachLien=s=>`<span class="nom cp-col" data-cpcoach="${s.id}">${esc(s.coach)}</span>`;
/** La petite fenêtre de la spécialité : le chiffre qui la montre dans la cage, face à la moyenne. */
function cpPop(s){const [l,m,d,u]=CP_STAT[s.spec],k=s.spec==='Karaté'?m/s.stat:s.stat/m;
  return `<div class="cp-pop"><div class="cp-popv"><b class="T">${cpVal(s.stat,d)}${u}</b><span>${esc(l)}</span></div>
    <div class="cp-popj"><i style="width:${Math.min(100,50*k)}%"></i><b style="left:50%"></b></div><span class="sous">moyenne mondiale : ${cpVal(m,d)}${u}${s.spec==='Karaté'?' (moins, c’est mieux)':''}</span></div>`;}
function cpCarte(s,i,sel){
  const monde=S.cp.vue==='monde',t=s.taille,lieu=`${esc(s.ville)}${s.pays!=='France'||monde?', '+esc(s.pays):''}`;
  let corps;const pop=S.cp.pop===s.id;
  if(monde){
    const m=[[s.champions||'—','champions'],[s.classes||'—','classés'],...(t==='club'?[]:[[`${s.v}-${s.d}`,'en 2026']]),[s.split.length||'—','chez Split']];
    corps=`${pop?cpPop(s):''}<div class="cp-kf n${m.length}">${m.map(([x,l])=>cpMini(x,l)).join('')}</div>`;
  }else{
    const n=cpAffiche(s),b=cpBlesses(s),[v,d]=cpBilanSplit(s);
    const m=[[n||'—','à l’affiche',n?'m-af':''],[b||'—',b>1?'blessés':'blessé',b?'m-bl':''],...(t==='club'?[]:[[v+d?`${v}-${d}`:'—','en 2026','']])];
    corps=`${pop?cpPop(s):`<div class="cp-kc"><b class="T cp-kg">${s.split.length}</b><span class="sous">combattant${s.split.length>1?'s':''} de Split<br>avec ${cpCoachLien(s)}</span></div>
      ${cpPoints(s,t==='ecurie'?30:t==='salle'?16:10)}`}<div class="cp-kf n${m.length}">${m.map(([x,l,c])=>cpMini(x,l,c)).join('')}</div>`;
  }
  return `<div class="cp-k t-${t} oct ${s.id===sel?'sel':''} ${monde&&s.split.length?'split':''} ${S.cp.anim?'apparait':''}" data-cpsel="${s.id}" style="animation-delay:${Math.min(i,12)*30}ms"><div class="cp-ki oct">
    <i class="cp-kimg"></i>
    <div class="cp-kt">${cpTaillePicto(t)}<button class="cp-spc ${S.cp.spec===s.spec||S.cp.pop===s.id?'on':''}" data-cpspec="${s.id}">${esc(s.spec)}</button>${cpBouge(s)}${monde?`<span class="cp-kr"><b class="T">n° ${s.rang}</b>${cpTend(s.tend)}</span>`:''}</div>
    <div class="cp-kh"><span class="T cp-kn">${esc(s.nom)}</span><span class="sous">${lieu}${monde?` · avec ${cpCoachLien(s)}`:''}</span></div>
    ${corps}
  </div></div>`;
}
function cpMur(){
  const F=S.cp,l=cpListe(),sel=cpSel(),monde=F.vue==='monde';let i=0;
  const h=(F.sens>0?CP_TAILLES:[...CP_TAILLES].reverse()).filter(([t])=>F.taille==='toutes'||F.taille===t).map(([t,titre,def])=>{
    const z=l.filter(s=>s.taille===t);if(!z.length)return '';
    const nc=z.reduce((a,s)=>a+s.split.length,0);
    const mt=z.filter(x=>x.tailleAvant!==x.taille).length,bouge=mt?` · ${mt} changement${mt>1?'s':''} de taille en 2026`:'';
    const info=(monde?`${z.length} dans le monde · ${def}`:`${z.length} · ${nc} de tes combattants`)+bouge;
    return `<div class="cp-sec">${cpTaillePicto(t)}<span class="cp-st">${titre}</span><span class="sous">${info}</span></div>
      <div class="cp-grille g-${t}">${z.map(s=>cpCarte(s,i++,sel)).join('')}</div>`;}).join('');
  return `<div class="cp-mur defile">${h||'<div class="rc-vide">Aucune salle avec ce filtre.</div>'}</div>`;
}

/* ---- Le panneau de droite ---- */
const cpSel=()=>{const F=S.cp,l=cpListe(),id=F.vue==='monde'?F.msel:F.sel;return l.some(s=>s.id===id)?id:(l[0]?l[0].id:null);};
function cpFait(l,v,s){return `<div class="oct rc-fait"><div class="sous">${l}</div><div class="T">${v}</div>${s?`<div class="sous">${s}</div>`:''}</div>`;}
const cpTendMot=t=>t==='='?'stable ce mois-ci':t[0]==='+'?`<span class="cp-up">▲ ${t.slice(1)}</span> ce mois-ci`:`<span class="cp-down">▼ ${t.slice(1)}</span> ce mois-ci`;
const cpRangSplit=c=>c.rang==='C'?'champion'+(/ F$/.test(c.cat)?'ne':''):c.rang==='–'?'non classé'+(/ F$/.test(c.cat)?'e':''):`n° ${c.rang} chez Split`;
const cpCat=c=>esc(courte(c.cat))+(/ F$/.test(c.cat)?' F':'');
const CP_C='<span class="rang-c octr cl-cb" title="Champion"><span class="octr"><b class="octr">C</b></span></span>';
/** Ce que fait un combattant de Split en ce moment : à l'affiche (contre qui), blessé, en pause, disponible. */
function cpMaintenant(c){
  const f=cpCombat(c.id);
  if(f)return f.adv?`<span class="cp-af">16 févr. contre ${lien(parId(f.adv))}</span>`:`<button class="cp-afj" data-go="carte">16 févr. · adversaire à trouver ›</button>`;
  if(c.statut==='blesse')return `<span class="cp-bl">${ico('medical',18)}Blessé, retour ${esc(c.retour)}</span>`;
  if(c.statut==='pause')return `<span class="cp-tn">En pause</span>`;
  return `<span class="cp-ok">Disponible</span>`;
}
function cpSplitListe(s){
  const ordre=c=>(cpCombat(c.id)?0:c.statut==='blesse'?1:2)*100+(c.rang==='C'?0:+c.rang||60);
  return `<div class="defile cp-cl">${[...s.split].sort((a,b)=>ordre(a)-ordre(b)).map((c,i)=>`<div class="cp-cb apparait" style="animation-delay:${160+Math.min(i,8)*45}ms">
    <div class="rc-2l"><span class="cp-cbn">${lien(c)}${c.rang==='C'?CP_C:''}</span><span class="sous rc-ell">${cpCat(c)} · ${cpRangSplit(c)}</span></div>
    <div class="cp-mt">${cpMaintenant(c)}</div></div>`).join('')}</div>`;
}
function cpMondeListe(s){
  const l=[...s.ext,...s.split.filter(c=>c.mondial<=30)].sort((a,b)=>((b.ext?b.champOrg:b.rang==='C')?1:0)-((a.ext?a.champOrg:a.rang==='C')?1:0)||a.mondial-b.mondial);
  if(!l.length)return `<div class="cp-vide">Aucun combattant dans le top 30 mondial.</div>`;
  return `<div class="defile cp-cl">${l.map((c,i)=>{const ch=c.ext?c.champOrg:c.rang==='C';
    return `<div class="cp-cb ${c.ext?'':'split'} apparait" style="animation-delay:${160+Math.min(i,8)*45}ms"><div class="rc-2l"><span class="cp-cbn">${lien(c)}${ch?CP_C:''}</span>
      <span class="sous rc-ell">${cpCat(c)} · ${c.ext?esc(c.org):'Split'}</span></div><span class="cp-cbm"><span class="sous">mondial</span> n° ${c.mondial}</span></div>`;}).join('')}</div>`;
}
/** La destination du Recruteur qui couvre ce pays (le Daghestan pour Makhatchkala et Grozny). */
function cpDest(s){if(typeof RT_DEST==='undefined'||s.pays==='France')return null;
  if(/Makhatchkala|Grozny/.test(s.ville))return RT_DEST.find(d=>d.id==='daghestan');return RT_DEST.find(d=>d.pays===s.pays)||null;}
const cpMois=d=>`${RC_MOIS[d.getMonth()]} ${d.getFullYear()}`;
const cpSalleLien=x=>`<button class="cp-sl" data-cpsalle="${x.id}">${esc(x.nom)}</button>`;
/** Une ligne de mouvement : arrivée, départ, nouvel entraîneur, changement de taille. */
const cpMouvLigne=s=>([d,k,c,x])=>{
  const t=k==='arr'?`${lien(c)} arrive de ${cpSalleLien(x)}`:k==='dep'?`${lien(c)} part pour ${cpSalleLien(x)}`
    :k==='coach'?`Nouvel entraîneur : ${esc(s.coach)}. ${esc(s.coachAvant.nom)} part adjoint à ${cpSalleLien(x)}`
    :cpTailleTexte(s);
  return `<div class="cp-mv"><span class="cp-mvd ${k}">${k==='taille'?'2026':cpMois(d)}</span><span>${t}</span></div>`;};
/** « Devenue grande écurie : 21 combattants il y a un an, 25 aujourd'hui. » */
function cpTailleTexte(s){const o=['club','salle','ecurie'],up=o.indexOf(s.taille)>o.indexOf(s.tailleAvant),m={club:'club',salle:'salle',ecurie:'grande écurie'}[s.taille],f=s.taille!=='club';
  return `<span class="${up?'cp-up':'cp-down'}">${up?'▲':'▼'}</span> ${up?(f?'Devenue':'Devenu'):(f?'Redevenue':'Redevenu')} ${m} : ${s.prosAvant} combattants il y a un an, ${s.pros} aujourd’hui`;}
/** L'entraîneur (retour du 15/11 : « en savoir plus sur lui », sans la liste des combattants) : qui il est, d'où il vient,
    ce que sa salle fait sous sa direction. */
function cpPanneauCoach(s){
  const tous=[...s.ext,...s.split],ch=tous.filter(c=>c.ext?c.champOrg:c.rang==='C').length,fs=s.coach.length>18?48:56,[sl,sm,sd,su]=CP_STAT[s.spec];
  const mma=s.coachMMA?`Combattant de MMA de ${s.coachMMA.de} à ${s.coachMMA.a} : ${s.coachMMA.v} victoires, ${s.coachMMA.d} défaites.`:'Pas de carrière en MMA.';
  const pc=[...s.parcours].reverse().map(([a,r,id])=>`<div class="cp-mv"><span class="cp-mvd">${esc(a)}</span><span>${esc(r)} à ${cpSalleLien(cpSalle(id))}${r==='Entraîneur principal'&&s.fondee===s.depuis?' (il l’a fondée)':''}</span></div>`).join('');
  const av=s.coachAvant?`<div class="cp-mv"><span class="cp-mvd">${cpMois(s.coachAvant.date)}</span><span>Succède à ${esc(s.coachAvant.nom)}</span></div>`:'';
  const pct=Math.round(100*s.v/Math.max(1,s.v+s.d));
  return pan(`<div class="rt-p cp-p cp-pc" data-cle="c${s.id}">
    <div class="rt-ban"><i class="rt-ban-img"></i><div class="rt-ban-t"><div class="cp-sur">Entraîneur principal · ${esc(s.spec)}</div>
      <div class="T rt-grand cp-grand" style="--fs:${fs}px">${esc(s.coach)}</div><div class="rt-ou">${cpSalleLien(s)}, ${esc(s.ville)}</div></div></div>
    <div class="rc-faits">${cpFait('Âge',`${s.coachAge} ans`,'')}${cpFait('Depuis',String(s.depuis),'à la tête de la salle')}${cpFait('Champions',`<span data-cpn="${ch}">${ch}</span>`,'en titre chez lui')}</div>
    <div class="cp-bloc"><div class="etiq">Avant d’entraîner</div><div class="cp-cv">${esc((s.ancien||CP_ANCIEN[s.spec]).replace(/^./,x=>x.toUpperCase()))}.</div><div class="sous cp-l2">${mma}</div></div>
    <div class="cp-bloc"><div class="etiq">Son parcours</div>${pc}${av}</div>
    <div class="cp-bloc"><div class="etiq">Son équipe</div>${s.equipe.length?`<div class="cp-eq">${s.equipe.map(([r,n])=>`<div><span class="sous">${esc(r)}</span><b>${esc(n)}</b></div>`).join('')}</div>`:'<div class="cp-l2">Il entraîne seul : pas d’adjoint dans la salle.</div>'}</div>
    <div class="cp-bloc"><div class="etiq">Sa salle en 2026</div>
      <div class="cp-kf n3 cp-pcf">${cpMini(`${s.v}-${s.d}`,`${pct} % de victoires`)}${cpMini(`n° ${s.rang}`,'au classement')}${cpMini(s.split.length||'—','de tes combattants')}</div>
      <div class="cp-l2 cp-pcs"><b>${cpVal(s.stat,sd)}${su}</b> ${esc(sl)} <span class="sous">· moyenne mondiale ${cpVal(sm,sd)}${su}</span></div></div>
  </div>`,'height:100%');
}
function cpPanneau(){
  const s=cpSalle(cpSel());if(!s)return pan('<div class="rc-vide">Aucune salle avec ce filtre.</div>','height:100%');
  const monde=S.cp.vue==='monde',fs=s.nom.length>20?46:s.nom.length>16?52:58;
  const ban=`<div class="rt-ban"><i class="rt-ban-img"></i><div class="rt-ban-t"><div class="cp-sur">${esc(CP_TAILLE_MOT[s.taille])} · ${esc(s.spec)}</div>
    <div class="T rt-grand cp-grand" style="--fs:${fs}px">${esc(s.nom)}</div><div class="rt-ou">${esc(s.ville)}, ${esc(s.pays)}</div></div></div>`;
  if(S.cp.coach===s.id)return cpPanneauCoach(s);
  const [sl,sm,sd,su]=CP_STAT[s.spec];
  const coach=`<div class="cp-duo"><div class="cp-coach"><span class="etiq">Entraîneur</span><b>${cpCoachLien(s)}</b><span class="sous">depuis ${String(s.parcours[s.parcours.length-1][0]).replace('depuis ','')}</span></div>
    <div class="cp-coach"><span class="etiq">${esc(s.spec)}</span><b>${cpVal(s.stat,sd)}${su}</b><span class="sous">${esc(sl)} · moyenne ${cpVal(sm,sd)}${su}</span></div></div>`;
  const mv=cpMouvements(s),mouv=mv.length?`<div class="cp-bloc"><div class="etiq">En 2026</div>${mv.slice(0,3).map(cpMouvLigne(s)).join('')}</div>`:'';
  if(!monde){const [v,d]=cpBilanSplit(s),n=cpAffiche(s);
    return pan(`<div class="rt-p cp-p" data-cle="s${s.id}">${ban}
      <div class="rc-faits">${cpFait('Tes combattants',`<span data-cpn="${s.split.length}">${s.split.length}</span>`,`sur ${s.pros} dans la salle`)}${cpFait('À l’affiche',`<span data-cpn="${n}">${n}</span>`,'le 16 février')}${cpFait('En 2026',v+d?`${v}-${d}`:'—','victoires-défaites')}</div>
      ${coach}${mouv}
      <div class="cp-bloc cp-flex"><div class="etiq">Tes combattants ici</div>${cpSplitListe(s)}</div>
    </div>`,'height:100%');}
  const dest=cpDest(s);
  return pan(`<div class="rt-p cp-p" data-cle="m${s.id}">${ban}
    <div class="rc-faits">${cpFait('Rang',`n° <span data-cpn="${s.rang}">${s.rang}</span>`,cpTendMot(s.tend))}${cpFait('Champions',`<span data-cpn="${s.champions}">${s.champions}</span>`,'en titre')}${cpFait('Classés',`<span data-cpn="${s.classes}">${s.classes}</span>`,'top 15 mondial')}</div>
    ${coach}${mouv}
    <div class="cp-bloc cp-flex"><div class="etiq">Ses meilleurs combattants</div>${cpMondeListe(s)}</div>
    ${dest?`<div class="cp-bas"><span class="sous cp-voy">7 jours sur place : ${nb(rtVoyage(dest,7,S.date).cout)} €</span><button class="bb oct petit" data-cpdest="${dest.id}"><span class="oct">Envoyer Marco ${esc(rtPrep(dest))} ›</span></button></div>`:''}
  </div>`,'height:100%');
}

/* ---- Filtres : la taille, le rang (croissant ou décroissant), la spécialité ; à droite Split / Le monde (comme les Classements) ---- */
const CP_SENS_ICO=d=>`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square" aria-hidden="true">${d>0?'<path d="M4 6h6M4 12h10M4 18h14"/>':'<path d="M4 6h14M4 12h10M4 18h6"/>'}<path d="M20 ${d>0?'4v16M17 17l3 3 3-3':'20V4M17 7l3-3 3 3'}"/></svg>`;
function cpFiltres(){
  const F=S.cp,t=(v,l)=>`<button class="bb oct petit ${F.taille===v?'on':''}" data-cpf="taille:${v}"><span class="oct">${l}</span></button>`;
  const vue=(v,l)=>`<button class="bb oct petit ${F.vue===v?'on':''}" data-cpf="vue:${v}"><span class="oct">${l}</span></button>`;
  const base=cpBase().filter(s=>F.taille==='toutes'||s.taille===F.taille),n=v=>base.filter(s=>v==='toutes'||s.spec===v).length;
  const menu=F.menu?`<div class="cp-menu oct"><div class="oct">${['toutes',...CP_SPECS].map(v=>`<button class="${F.spec===v?'on':''}" data-cpf="spec:${v}"><span>${v==='toutes'?'Toutes les spécialités':esc(v)}</span><span class="sous">${n(v)}</span></button>`).join('')}</div></div>`:'';
  return `<div class="eff-filtres">${t('toutes','Toutes')}${CP_TAILLES.map(([v,l])=>t(v,l)).join('')}<i class="eff-sep"></i>
    <button class="bb oct petit" data-cprang title="${F.sens>0?'Du n° 1 au dernier':'Du dernier au n° 1'}"><span class="oct">Rang ${CP_SENS_ICO(F.sens)}</span></button>
    <span class="cp-spw"><button class="bb oct petit ${F.spec!=='toutes'||F.menu?'on':''}" data-cpmenu><span class="oct">${F.spec==='toutes'?'Spécialité':esc(F.spec)} <span class="cp-chev">${F.menu?'▴':'▾'}</span></span></button>${menu}</span>
    <span style="margin-left:auto"></span>${vue('split','Split')}${vue('monde','Le monde')}</div>`;
}
function cpHtml(){cpGarder();return `<div class="rc cp">${cpFiltres()}<div class="cp-g">${cpMur()}${cpPanneau()}</div></div>`;}

/* ---- Mouvement : les chiffres du panneau défilent ---- */
function cpCompter(){document.querySelectorAll('.cp-p [data-cpn]').forEach((e,i)=>{const v=+e.dataset.cpn,t0=performance.now()+i*60,de=/Rang/.test(e.closest('.rc-fait').textContent)?Math.min(CP_TOTAL,v+12):0;
  const f=t=>{const k=Math.max(0,Math.min(1,(t-t0)/600)),x=1-Math.pow(1-k,3);e.textContent=Math.round(de+(v-de)*x);if(k<1)requestAnimationFrame(f);};requestAnimationFrame(f);});}

/* ---- Branchement dans le cadre ---- */
const cpRendreBase=rendre;
rendre=function(){
  if(S.ecran!=='camps'){cpRendreBase();return;}
  rendreBarre();rendreEntete('Camps');$('#alerte').classList.remove('af-al');msAlerte();
  $('#corps').style.top='152px';
  const g=$('.cp-mur'),y=g?g.scrollTop:0,cle=($('.cp-p')||{}).dataset;
  $('#corps').innerHTML=cpHtml();
  const g2=$('.cp-mur');if(g2){g2.scrollTop=S.cp.anim?0:y;const sel=g2.querySelector('.sel[data-cpsel]');
    if(!S.cp.haut&&sel&&(sel.offsetTop<g2.scrollTop||sel.offsetTop+sel.offsetHeight>g2.scrollTop+g2.clientHeight))g2.scrollTop=Math.max(0,sel.offsetTop-60);}
  const p=$('.cp-p');if(p&&(!cle||cle.cle!==p.dataset.cle||S.cp.anim))cpCompter();else if(p)p.classList.add('cp-fixe');
  S.cp.anim=false;S.cp.haut=false;
  $('#zone').classList.toggle('fiche-ouverte',!!S.fiche);
};
const cpAllerBase=aller;
aller=function(ec){
  if(ec!=='camps'){cpAllerBase(ec);return;}
  if(S.fiche)fermerFiche(false);
  if(S.ecran!==ec){S.hist.push(S.ecran);S.futur=[];S.cp.anim=true;}
  S.ecran=ec;rendre();
};
/* Retour et Avant à l'intérieur de l'écran : la vue, les filtres, le tri et la salle choisie sont des pas du parcours. */
function cpPas(maj){S.hist.push({cp:cpEtat()});S.futur=[];maj();rendre();}
const cpRetourBase=retour;
retour=function(){
  while(S.ecran!=='camps'&&S.hist.length&&S.hist[S.hist.length-1]&&S.hist[S.hist.length-1].cp)S.hist.pop();
  const h=S.hist[S.hist.length-1];
  if(S.ecran==='camps'&&!S.fiche&&h&&h.cp){S.hist.pop();S.futur.push({cp:cpEtat()});Object.assign(S.cp,JSON.parse(h.cp));rendre();return;}
  cpRetourBase();
};
function cpAvancer(){
  const f=S.futur[S.futur.length-1];
  if(S.ecran==='camps'&&!S.fiche&&f&&f.cp){S.futur.pop();S.hist.push({cp:cpEtat()});Object.assign(S.cp,JSON.parse(f.cp));rendre();return true;}
  return false;
}
const cpOuvrirBase=ouvrirFiche;
ouvrirFiche=function(id,garderFutur=false){
  if(S.ecran!=='camps'){cpOuvrirBase(id,garderFutur);return;}
  if(!garderFutur)S.futur=[];
  if(S.fiche&&S.fiche!==id)S.ficheHist.push(S.fiche);
  S.fiche=id;S.panCat=false;rendre();rendreFiche();setTimeout(()=>$('#fiche').classList.add('ouverte'),30);
};
/* La fiche d'un combattant de Split dit sa vraie salle et son vrai entraîneur ; le partenaire « même salle » est vraiment de sa salle. */
const cpRelationDeBase=relationDe;
relationDe=function(c){
  const R=cpRelationDeBase(c),s=c&&c.cpSalle&&!c.ext&&cpSalle(c.cpSalle);if(!s||c.id==='nana')return R;
  const pote=s.split.find(x=>x.id!==c.id&&x.cat!==c.cat)||s.split.find(x=>x.id!==c.id);
  const vest=R.vestiaire.map(v=>v[2]==='Même salle'?(pote?['Partenaire',`${pote.prenom} ${pote.nom}`,'Même salle']:null):v).filter(Boolean);
  return Object.assign({},R,{vestiaire:vest,entourage:R.entourage.map(([r,n,d])=>r==='Salle'?['Salle',s.nom,s.ville]:r==='Entraîneur'?['Entraîneur',s.coach,`Depuis ${Math.max(s.depuis,+c.depuis||s.depuis)}`]:[r,n,d])});
};

/* ---- Clics ---- */
document.addEventListener('click',e=>{
  if(S.ecran!=='camps')return;
  const t=e.target;let el;
  if(t.closest('#bAvant')&&!S.fiche&&cpAvancer()){e.stopImmediatePropagation();return;}
  if(t.closest('#bRetour')&&!S.fiche){const h=S.hist[S.hist.length-1];if(h&&h.cp){e.stopImmediatePropagation();retour();return;}}
  if(S.fiche||t.closest('[data-fiche]')||!t.closest('#corps'))return;
  const F=S.cp;
  if((el=t.closest('[data-cpf]'))){e.stopImmediatePropagation();const i=el.dataset.cpf.indexOf(':'),k=el.dataset.cpf.slice(0,i),v=el.dataset.cpf.slice(i+1);F.menu=false;F.pop=null;if(F[k]!==v)cpPas(()=>{F[k]=v;F.anim=true;F.haut=true;F.coach=null;});else rendre();return;}
  if((el=t.closest('[data-cpspec]'))){e.stopImmediatePropagation();const id=el.dataset.cpspec;F.pop=F.pop===id?null:id;rendre();return;}
  if(F.pop&&!t.closest('.cp-pop')){F.pop=null;rendre();if(!t.closest('[data-cpsel],[data-cpf],[data-cprang],[data-cpmenu],[data-cpcoach],[data-cpsalle]'))return;}
  if((el=t.closest('[data-cpcoach]'))){e.stopImmediatePropagation();const id=el.dataset.cpcoach;cpPas(()=>{F.coach=id;if(F.vue==='monde')F.msel=id;else F.sel=id;});return;}
  if((el=t.closest('[data-cpsalle]'))){e.stopImmediatePropagation();const id=el.dataset.cpsalle,x=cpSalle(id);
    cpPas(()=>{F.coach=null;F.taille='toutes';F.spec='toutes';if(F.vue==='split'&&!x.split.length)F.vue='monde';if(F.vue==='monde')F.msel=id;else F.sel=id;});return;}
  if(t.closest('[data-cpmenu]')){e.stopImmediatePropagation();F.menu=!F.menu;rendre();return;}
  if(F.menu&&!t.closest('.cp-menu')){F.menu=false;rendre();}
  if(t.closest('[data-cprang]')){e.stopImmediatePropagation();cpPas(()=>{F.sens=-F.sens;F.anim=true;F.haut=true;});return;}
  if((el=t.closest('[data-cptri]'))){e.stopImmediatePropagation();const k=el.dataset.cptri;cpPas(()=>{F.tri=F.tri.col===k?{col:k,sens:-F.tri.sens}:{col:k,sens:k==='nom'||k==='coach'?1:-1};});return;}
  if((el=t.closest('[data-cpdest]'))){e.stopImmediatePropagation();S.rt.dest=el.dataset.cpdest;S.rt.reg='toutes';aller('recruteur');return;}
  if((el=t.closest('[data-cpsel]'))){e.stopImmediatePropagation();const id=el.dataset.cpsel;if(id!==cpSel()||F.coach)cpPas(()=>{F.coach=null;if(F.vue==='monde')F.msel=id;else F.sel=id;});return;}
},true);

/* ---- Lancement : ?ecran=camps, options vue=split|monde, taille=ecurie|salle|club, spec=<spécialité>, sens=1|-1, sel=<id de salle>, fiche=<id> ---- */
window.addEventListener('DOMContentLoaded',()=>{
  const q=new URLSearchParams(location.search);
  if(q.get('ecran')!=='camps')return;
  for(const k of ['vue','taille','spec'])if(q.get(k))S.cp[k]=q.get(k);if(q.get('sens'))S.cp.sens=+q.get('sens');
  if(q.get('sel')&&cpSalle(q.get('sel'))){if(S.cp.vue==='monde')S.cp.msel=q.get('sel');else S.cp.sel=q.get('sel');}
  S.ecran='camps';S.hist=['accueil'];S.cp.anim=true;rendre();
  if(q.get('fiche'))setTimeout(()=>ouvrirFiche(q.get('fiche')),80);
});
