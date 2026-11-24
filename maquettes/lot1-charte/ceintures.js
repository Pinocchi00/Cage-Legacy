"use strict";
/* Maquette lot 1 — Ceintures (R22, T4c, Q22a à Q22c). Préfixe ce- (classes), ce / CE_ (fonctions, constantes). Chargé après calendrier.js.
   L'écran rejoint les Classements (« Ceinture et classement ensemble », T4) : un onglet entre « Classement » et « Les meilleurs »,
   avec la même ligne de filtres (Hommes, Femmes, catégories), gardée d'un onglet à l'autre. Il quitte la barre, comme Préliminaires a rejoint la Carte.
   Ce qu'il apporte, sans répéter le Classement : la lignée de chaque ceinture (règnes, intérims, vacances), puis le prochain défi.
     - Hommes ou Femmes sans catégorie : les champions de Split, une carte par ceinture (prochain défi, dernier combat pour le titre) ;
     - une catégorie : la lignée en frise datée, puis le prochain défi (le combat signé, ou le n° 1 à programmer).
   Règles réelles (sources dans comparaison.html) : pas de délai fixe à l'UFC ; les grands champions défendent tous les 6 à 9 mois ;
   une ceinture intérimaire est rare (aucune chez les femmes) et naît quand le champion ne peut pas combattre pendant des mois ;
   l'intérimaire est promu si le champion laisse la ceinture, sinon il l'affronte (réunification) ; refuser de défendre fait perdre la ceinture.
   Données : les règnes en cours suivent l'Effectif (champions), les Résultats et le Calendrier (titre en jeu aux soirées 56, 59 et 62 en 2026),
   la fiche de Nana (ceinture prise à Belkacem le 20 mars 2026, deux défenses) et les Records (Zaïtsev 40 mois, Garcia-Roy 5 défenses,
   Benyahia seul double champion, Kovač plus jeune champion en 2026). Les anciens champions sont inventés : À RELIRE. */

/* ---- La barre : Ceintures rejoint les Classements ---- */
(function(){const i=ITEMS.findIndex(x=>x[0]==='ceintures');if(i>=0)ITEMS.splice(i,1);})();

/* ---- Dates ---- */
const CE_M=['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
const ceDate=s=>{const [a,m,j]=String(s).split('-').map(Number);return new Date(a,(m||1)-1,j||1);};
const cePrecis=s=>String(s).split('-').length===3;
const ceMois=s=>{const d=ceDate(s);return `${CE_M[d.getMonth()]} ${d.getFullYear()}`;};
const ceJour=s=>{const d=ceDate(s);return `${d.getDate()===1?'1er':d.getDate()} ${CE_M[d.getMonth()]} ${d.getFullYear()}`;};
const ceQuand=s=>cePrecis(s)?ceJour(s):ceMois(s);
const ceAn=s=>ceDate(s).getFullYear();
/** Mois écoulés entre deux dates (au jour près). */
const ceMoisEntre=(a,b)=>(b.getFullYear()-a.getFullYear())*12+(b.getMonth()-a.getMonth())+(b.getDate()-a.getDate())/30.44;

/* ---- Les lignées ----
   Un règne : [qui, début, fin (null = en cours), défenses, comment il finit, options].
   qui : « @id » (un combattant, un ancien du staff), « #Prénom Nom » (parti ailleurs, fiche existante),
         ou « Prénom Nom|Surnom|aujourd'hui|détail|arrivée chez Split » pour un ancien champion inventé
         (aujourd'hui : R retraité, E entraîneur, C consultant, G gérant de salle, P parti dans une autre organisation).
   fin : ['perd', méthode] (le suivant lui prend la ceinture), ['retraite'], ['part', organisation], ['retiree', raison],
         ['laisse', raison], et pour un intérim ['promu', raison] ou ['reunifie'].
   Aucun règne au-delà de 40 mois (record de Zaïtsev) ; aucune série au-delà de 5 défenses (record de Garcia-Roy). */
const CE_L={
  'Poids mouche':[
    ['Jérémy Lam|Le Moustique|R|2018|2012','2014-10','2017-03',2,['perd','décision unanime']],
    ['Ryota Kimura|Le Colibri|E|Osaka|2015','2017-03','2019-11',3,['retraite']],
    ['Damien Royer|Le Frelon|G|Grenoble|2017','2020-04','2022-07',2,['perd','soumission, 3e round']],
    ['Luka Ivanković|Le Zèbre|P|Knuckle Gate|2019','2022-07','2024-05',1,['perd','KO, 1er round']],
    ['Thiago Pinto|O Gato|R|2026|2021','2024-05','2026-07-19',2,['perd','décision unanime']],
    ['@gpoidsmoucheC','2026-07-19',null,0]],
  'Poids coq':[
    ['Lucas Fontaine|Le Furet|R|2016|2010','2011-06','2014-02',2,['perd','décision partagée']],
    ['Minh Dao|L’Anguille|E|Lyon|2012','2014-02','2016-10',3,['perd','KO, 2e round']],
    ['Rafael Ocampo|El Gallo|R|2020|2014','2016-10','2019-04',2,['perd','soumission, 4e round']],
    ['Jordan Lemoine|Le Ressort|R|2023|2017','2019-04','2022-04',2,['perd','décision unanime']],
    ['Enzo Rinaldi|Lo Squalo|R|2026|2019','2022-04','2025-02-22',1,['perd','décision unanime']],
    ['@gpoidscoqC','2024-08-06','2025-02-22',0,['reunifie'],{int:1,pour:'Rinaldi blessé au genou'}],
    ['@gpoidscoqC','2025-02-22',null,1]],
  'Poids plume':[
    ['Nicolas Ferrandi|Le Furtif|R|2012|2006','2008-05','2010-11',2,['perd','décision unanime']],
    ['David Assouline|Le Comptable|C|Le Forum|2008','2010-11','2013-07',3,['perd','KO, 3e round']],
    ['Piotr Kaczmarek|Le Polonais|P|MMA Korner|2011','2013-07','2016-04',2,['part','MMA Korner']],
    ['Florent Achard|Le Lutin|R|2020|2013','2016-09','2019-06',3,['perd','soumission, 2e round']],
    ['Karim Bensaïd|Le Serpent|G|Montpellier|2016','2019-06','2022-03',2,['perd','décision unanime']],
    ['Diogo Neves|O Touro|P|Pure Impact|2019','2022-03','2024-09-28',2,['perd','KO, 2e round']],
    ['@gpoidsplumeC','2024-09-28',null,2]],
  'Poids léger':[
    ['Julien Bastide|Le Marquis|R|2010|2005','2006-03','2008-10',2,['perd','KO, 2e round']],
    ['Samuel Okoro|Le Mamba|E|Toulouse|2006','2008-10','2011-04',3,['perd','soumission, 3e round']],
    ['Bruno Lacombe|Le Sanglier|R|2014|2007','2011-04','2014-02',3,['retraite']],
    ['Mehdi Sahraoui|Le Chat|C|Tableau Noir|2011','2014-06','2017-05',4,['perd','décision partagée']],
    ['Yann Tavares|Le Rouquin|R|2021|2013','2017-05','2019-03',1,['perd','KO, 1er round']],
    ['@sbenyahia','2019-03','2020-12',1,['laisse','champion des mi-moyens depuis mars 2020']],
    ['Cédric Valette|Le Métronome|P|Knuckle Gate|2016','2020-07','2020-12',0,['promu','Benyahia laisse la ceinture'],{int:1,pour:'Benyahia monte chez les mi-moyens'}],
    ['Cédric Valette|Le Métronome|P|Knuckle Gate|2016','2020-12','2023-10',3,['perd','KO, 3e round']],
    ['@belkacem','2023-10','2026-03-20',2,['perd','décision partagée']],
    ['@nana','2026-03-20',null,2]],
  'Poids mi-moyen':[
    ['Arnaud Delmas|La Pioche|R|2010|2004','2006-06','2008-12',2,['perd','KO, 1er round']],
    ['Moussa Kanté|Le Mur|E|Paris|2007','2008-12','2011-09',3,['perd','décision unanime']],
    ['Thibault Rousseau|Le Forgeron|R|2015|2008','2011-09','2014-03',1,['retiree','refuse de défendre contre Lindahl']],
    ['Viktor Lindahl|Le Suédois|E|Göteborg|2012','2014-07','2017-06',3,['perd','soumission, 2e round']],
    ['Jérôme Hamel|Le Bouledogue|R|2021|2014','2017-06','2020-03',2,['perd','décision unanime']],
    ['@sbenyahia','2020-03','2022-05',2,['retraite']],
    ['Teddy Ancelin|Le Docker|P|Undisputed Cage|2019','2022-10','2024-11-09',1,['perd','KO, 2e round']],
    ['@gpoidsmimoyenC','2024-11-09',null,2]],
  'Poids moyen':[
    ['Grégory Marchetti|Le Corse|R|2011|2004','2006-10','2009-06',2,['perd','décision unanime']],
    ['Ousmane Diop|Le Griot|E|Marseille|2006','2009-06','2012-04',3,['retraite']],
    ['Laurent Picard|Le Tracteur|R|2017|2010','2012-09','2015-02',2,['perd','soumission, 1er round']],
    ['Mathias Brandt|Le Bavarois|R|2019|2012','2015-02','2017-05',2,['perd','soumission, 3e round']],
    ['@skerloch','2017-05','2019-11',3,['perd','décision partagée']],
    ['Romain Sorel|Le Taiseux|P|Fighting Pacific Championship|2016','2019-11','2022-06',2,['part','Fighting Pacific Championship']],
    ['Kenzo Morin|Le Samouraï|R|2026|2018','2022-11','2025-04-14',2,['perd','KO, 4e round']],
    ['@gpoidsmoyenC','2025-04-14',null,1]],
  'Poids mi-lourd':[
    ['Stéphane Rigaud|Le Maçon|R|2013|2008','2009-04','2011-11',2,['perd','KO, 2e round']],
    ['Paul Tchoumi|Le Rhinocéros|E|Lille|2009','2011-11','2014-09',3,['perd','décision unanime']],
    ['Alexis Varenne|Le Lord|P|Ultimate Rim|2012','2014-09','2017-01',2,['part','Ultimate Rim']],
    ['Igor Shevtsov|Le Cosaque|R|2022|2015','2017-05','2020-02',3,['perd','soumission, 3e round']],
    ['Nassim Daoud|L’Épervier|G|Nice|2017','2020-02','2022-12',2,['perd','KO, 1er round']],
    ['Maxime Lambert|Le Colosse|R|2025|2019','2022-12','2024-11-09',1,['perd','décision unanime']],
    ['@gpoidsmilourdC','2024-11-09',null,2]],
  'Poids lourd':[
    ['Jean-Marc Lévêque|Le Menhir|R|2010|2005','2006-11','2009-05',1,['perd','KO, 1er round']],
    ['Adama Sissoko|Le Baobab|E|Bordeaux|2007','2009-05','2012-03',2,['perd','décision partagée']],
    ['Ante Horvat|Le Croate|R|2014|2010','2012-03','2014-11',2,['retraite']],
    ['Fabien Moulin|Le Pressoir|R|2019|2012','2015-04','2018-05',3,['perd','KO, 2e round']],
    ['#Dmitri Zaïtsev','2018-05','2021-09',3,['part','Garden of Blood']],
    ['Thierry Bocquet|Le Rempart|R|2025|2019','2022-02','2024-06-08',1,['perd','soumission, 1er round']],
    ['@gpoidslourdC','2024-06-08',null,1]],
  'Poids paille F':[
    ['Sonia Mercadier|La Brise|R|2017|2011','2013-11','2016-12',2,['perd','décision unanime']],
    ['@sgarciaroy','2016-12','2020-03',5,['retraite']],
    ['Margaux Delorme|La Mésange|E|Nantes|2017','2020-09','2023-04',2,['perd','décision unanime']],
    ['Nour Benhamou|La Sentinelle|P|Undisputed Cage|2020','2023-04','2025-04-14',1,['perd','KO, 2e round']],
    ['@gpoidspaillefC','2025-04-14',null,1]],
  'Poids mouche F':[
    ['Justine Barreau|La Fourmi|R|2019|2014','2016-05','2018-11',2,['perd','décision unanime']],
    ['Mélanie Arnaud|L’Hirondelle|R|2022|2015','2018-11','2020-09',1,['perd','soumission, 2e round']],
    ['Inga Petersen|La Danoise|P|Knuckle Gate|2018','2020-09','2022-06',1,['perd','décision partagée']],
    ['Linh Tran|La Libellule|R|2025|2019','2022-06','2025-04',2,['retraite']],
    ['@gpoidsmouchefC','2025-10-18',null,1]],
  'Poids coq F':[
    ['Élodie Marchal|La Fronde|R|2018|2012','2014-09','2017-02',2,['perd','décision unanime']],
    ['Sara Lindberg|La Suédoise|E|Stockholm|2015','2017-02','2019-12',3,['perd','KO, 3e round']],
    ['Bianca Ramos|A Onça|R|2024|2017','2019-12','2023-01',2,['perd','décision partagée']],
    ['Aminata Konaté|La Marée|P|MMA Korner|2020','2023-01','2025-12-13',2,['perd','décision unanime']],
    ['@gpoidscoqfC','2025-12-13',null,0]],
  'Poids plume F':[
    ['Marine Kerboul|La Tempête|E|Brest|2017','2019-05','2021-12',2,['perd','soumission, 1er round']],
    ['Fanny Morvan|La Bretonne|R|2025|2018','2021-12','2024-03-16',1,['perd','KO, 2e round']],
    ['@gpoidsplumefC','2024-03-16',null,3]],
};

/* ---- Les combats pour le titre des champions en titre (du plus récent au plus ancien), pour que leur fiche dise la même chose.
   En 2026, une ceinture n'a été en jeu qu'aux soirées 56, 59 et 62, toutes à Lyon (Résultats, Calendrier). Avant, les numéros de soirée suivent
   la fiche de Nana (44 le 6 août 2024, 47 le 16 déc. 2024, 50 le 14 avr. 2025, 53 le 4 août 2025). Les adversaires des défenses sont inventés (À RELIRE). ---- */
const CE_TITRES={
  gpoidsmoucheC:[{d:'2026-07-19',l:'Pour le titre',r:'C',adv:'Thiago Pinto',m:['Décision','unanime'],s:59}],
  gpoidscoqC:[{d:'2026-12-08',l:'Défense n° 1',r:1,adv:'Yohan Briand',m:['KO','coups de poing'],rd:3,tps:'2:41',s:62},
    {d:'2025-02-22',l:'Réunification',r:'C',adv:'Enzo Rinaldi',m:['Décision','unanime'],s:49},
    {d:'2024-08-06',l:'Titre intérimaire',r:2,adv:'Loïc Barral',m:['Soumission','étranglement arrière'],rd:2,tps:'3:58',s:44}],
  gpoidsplumeC:[{d:'2026-07-19',l:'Défense n° 2',r:1,adv:'Ilias Bouzid',m:['Décision','unanime'],s:59},
    {d:'2025-06-21',l:'Défense n° 1',r:2,adv:'Erwan Le Goff',m:['KO','coups de poing'],rd:4,tps:'1:20',s:52},
    {d:'2024-09-28',l:'Pour le titre',r:'C',adv:'Diogo Neves',m:['KO','coups de poing'],rd:2,tps:'4:05',s:45}],
  gpoidsmimoyenC:[{d:'2026-12-08',l:'Défense n° 2',r:1,adv:'Nabil Ferhani',m:['Décision','unanime'],s:62},
    {d:'2025-06-21',l:'Défense n° 1',r:2,adv:'Dorian Masson',m:['Soumission','étranglement arrière'],rd:3,tps:'2:12',s:52},
    {d:'2024-11-09',l:'Pour le titre',r:'C',adv:'Teddy Ancelin',m:['KO','coups de poing'],rd:2,tps:'0:58',s:46}],
  gpoidsmoyenC:[{d:'2026-03-20',l:'Défense n° 1',r:1,adv:'Rafael Moura',m:['Décision','unanime'],s:56},
    {d:'2025-04-14',l:'Pour le titre',r:'C',adv:'Kenzo Morin',m:['KO','coups de poing'],rd:4,tps:'3:31',s:50}],
  gpoidsmilourdC:[{d:'2025-12-13',l:'Défense n° 2',r:2,adv:'Steven Achour',m:['KO','coups de poing'],rd:1,tps:'2:47',s:55},
    {d:'2025-06-21',l:'Défense n° 1',r:1,adv:'Marco Bellini',m:['Décision','unanime'],s:52},
    {d:'2024-11-09',l:'Pour le titre',r:'C',adv:'Maxime Lambert',m:['Décision','unanime'],s:46}],
  gpoidslourdC:[{d:'2025-08-04',l:'Défense n° 1',r:1,adv:'Bruno Teixeira',m:['Décision','partagée'],s:53},
    {d:'2024-06-08',l:'Pour le titre',r:'C',adv:'Thierry Bocquet',m:['Soumission','étranglement arrière'],rd:1,tps:'4:12',s:43}],
  gpoidspaillefC:[{d:'2025-10-18',l:'Défense n° 1',r:1,adv:'Laura Pires',m:['Décision','unanime'],s:54},
    {d:'2025-04-14',l:'Pour le titre',r:'C',adv:'Nour Benhamou',m:['KO','coups de poing'],rd:2,tps:'1:44',s:50}],
  gpoidsmouchefC:[{d:'2026-03-20',l:'Défense n° 1',r:1,adv:'Maëva Courtois',m:['Décision','unanime'],s:56},
    {d:'2025-10-18',l:'Titre vacant',r:2,adv:'Sabrina Touré',m:['Décision','unanime'],s:54}],
  gpoidscoqfC:[{d:'2025-12-13',l:'Pour le titre',r:'C',adv:'Aminata Konaté',m:['Décision','unanime'],s:55}],
  gpoidsplumefC:[{d:'2025-08-04',l:'Défense n° 3',r:1,adv:'Julie Lefèvre',m:['Décision','unanime'],s:53},
    {d:'2025-02-22',l:'Défense n° 2',r:2,adv:'Anna Kowal',m:['KO','coups de poing'],rd:3,tps:'3:09',s:49},
    {d:'2024-09-28',l:'Défense n° 1',r:1,adv:'Nadège Rivet',m:['Décision','partagée'],s:45},
    {d:'2024-03-16',l:'Pour le titre',r:'C',adv:'Fanny Morvan',m:['KO','coups de poing'],rd:2,tps:'2:20',s:42}],
};

/* ---- Les anciens champions inventés : une fiche courte, tirée de la lignée ---- */
const CE_ROLES={R:['Retraité','Retraitée'],E:['Entraîneur','Entraîneuse'],C:['Consultant','Consultante'],G:['Gérant de salle','Gérante de salle'],P:['Ailleurs','Ailleurs']};
function ceAncien(spec,cat){
  const [plein,surnom,role,det,arr]=spec.split('|'),sp=plein.split(' '),id='ce'+slug(plein);
  let c=EXT.find(x=>x.id===id);if(c)return c;
  const r=graine(id),f=/ F$/.test(cat);
  c={id,prenom:sp[0],nom:sp.slice(1).join(' '),surnom,cat,ceAncien:true,ext:true,f,role,det,arr:+arr,v:0,d:0,n:0,rang:'–',mondial:0,serie:'vvvvv',statut:'dispo',
    dernier:new Date(2000,0,1),taille:'—',allonge:'—',garde:'—',depuis:arr,contrat:[0,'—'],style:'—',aTitre:27+Math.floor(r()*5),_r:r()};
  EXT.push(c);return c;
}
/** Qui porte le règne : un combattant de Split, un ancien du staff, un parti ailleurs, ou un ancien inventé. */
function ceQui(spec,cat){
  if(spec[0]==='@')return parId(spec.slice(1));
  if(spec[0]==='#')return parNom(spec.slice(1),cat);
  return ceAncien(spec,cat);
}

/* ---- La lignée d'une catégorie, prête à lire ----
   Chaque règne : {c, de, a, def, fin, int, pour, n (rang dans la lignée), suivant}. Les vacances se lisent entre deux règnes.
   Après la 63 jouée (Résultats), Mezouar prend la ceinture des légers : la lignée suit. */
const CE_CACHE={};
function ceLignee(cat){
  const cle=cat+(S.rs&&S.rs.apres?'|apres':'');if(CE_CACHE[cle])return CE_CACHE[cle];
  const brut=(CE_L[cat]||[]).map(x=>x.slice());
  if(cat==='Poids léger'&&S.rs&&S.rs.apres){const nana=brut[brut.length-1];nana[2]='2027-02-16';nana[4]=['perd','soumission, 4e round'];brut.push(['@mezouar','2027-02-16',null,0]);}
  const l=brut.map(([q,de,a,def,fin,o])=>({c:ceQui(q,cat),de,a,def,fin:fin||null,int:!!(o&&o.int),pour:o&&o.pour,cat}));
  let n=0;l.forEach(x=>{if(!x.int)x.n=++n;});
  l.forEach(x=>{if(x.int){const p=l.find(y=>!y.int&&y.c===x.c&&y.de===x.a);x.n=p?p.n:null;}});
  /* Qui lui prend la ceinture : le règne (ou l'intérim qui réunifie) qui commence quand le sien finit. */
  l.forEach(x=>{if(x.fin&&x.fin[0]==='perd')x.suivant=(l.find(y=>y!==x&&!y.int&&y.de===x.a)||{}).c;});
  return CE_CACHE[cle]=l;
}
/* Les anciens existent dès le chargement : leur fiche s'ouvre aussi depuis l'adresse (?fiche=) ou depuis une autre fiche. */
Object.keys(CE_L).forEach(ceLignee);
const ceEnCours=cat=>{const l=ceLignee(cat);return l.find(x=>!x.a&&!x.int)||null;};
const ceRegnesDe=c=>Object.keys(CE_L).flatMap(cat=>ceLignee(cat).filter(x=>x.c===c));

/* ---- Fiches : les combats pour le titre des champions en titre ----
   Le dernier combat d'un champion est son dernier combat pour le titre ; une série qui finissait par une défaite est remise dans l'ordre
   (même bilan, même nombre de victoires et de défaites sur cinq). */
(function ceRetouches(){
  for(const [id,T] of Object.entries(CE_TITRES)){
    const c=parId(id);if(!c)continue;
    if(c.serie.slice(-1)==='d')c.serie=[...c.serie].reverse().join('');
    c.dernier=ceDate(T[0].d);delete c._h;
    const h=historique(c);
    T.forEach((t,i)=>{const f=h[i];if(!f)return;const dec=t.m[0]==='Décision';
      Object.assign(f,{date:ceDate(t.d),res:'v',meth:t.m,rd:t.rd||5,tps:dec?'5:00':(t.tps||f.tps),advR:t.r});
      if(t.s)f.soiree='Split Fight Night '+t.s;if(t.adv)f.adv=t.adv;
      /* La fin du combat dite comme dans la lignée (la fiche tire sinon un détail au hasard). */
      const maj=x=>x.charAt(0).toUpperCase()+x.slice(1);
      if(t.adv&&t.s)FINS_FIXES[`${t.adv}|${f.soiree}`]=dec?['Décision',maj(t.m[1])]:t.m[0]==='Soumission'?['Soumission',maj(t.m[1])]:['KO','Crochet du droit'];});
    for(let i=T.length;i<h.length;i++)if(h[i].date>=h[i-1].date){const d=new Date(h[i-1].date);d.setMonth(d.getMonth()-5);h[i].date=d;}
    TITRES[id]=T.map(t=>[t.l,t.r]);
  }
})();

/* ---- Réglages : ceux des Classements (sexe, catégorie, onglet), gardés au retour ---- */
const ceEtat=()=>JSON.stringify({vue:S.cl.vue,sexe:S.cl.sexe,cats:S.cl.cats,stat:S.cl.stat||null});
const ceCourt=cat=>courte(cat);
const ceKg=cat=>{for(const s of ['H','F'])for(const [c,,kg] of CATS[s])if(c===cat)return kg;return '';};
const cePl=cat=>pluriel(cat).replace(/ F$/,'').toLowerCase();       /* « poids légers », « poids pailles » */
const ceIlYa=s=>`il y a ${depuis(ceDate(s))}`;
const ceN1=cat=>COMBATTANTS.filter(c=>c.cat===cat&&typeof c.rang==='number').sort((a,b)=>a.rang-b.rang);
/** Le combat pour le titre déjà signé : la carte de Split (S.af), avant la 63. */
function ceSigne(cat){
  if(S.rs&&S.rs.apres)return null;
  const ch=ceEnCours(cat);if(!ch)return null;
  const f=S.af.m.find(x=>x.a===ch.c.id||x.b===ch.c.id);
  if(!f||!f.a||!f.b)return null;const adv=parId(f.a===ch.c.id?f.b:f.a);
  return adv&&adv.cat===cat?{adv,date:'2027-02-16',n:63,lieu:'Forum de Lille',ville:'Lille'}:null;
}
/** Le dernier combat pour le titre du champion : sa prise de ceinture ou sa dernière défense (même source que sa fiche). */
function ceDernierTitre(cat){
  const ch=ceEnCours(cat);if(!ch)return null;
  const T=CE_TITRES[ch.c.id];
  if(T)return {d:T[0].d,prise:T[0].l==='Pour le titre'||T[0].l==='Titre vacant'||T[0].l==='Réunification',adv:T[0].adv};
  if(ch.c.id==='nana')return {d:'2026-12-08',prise:false};
  if(ch.c.id==='mezouar')return {d:'2027-02-16',prise:true,adv:'Parfait Nana'};
  return {d:ch.de,prise:true};
}
/** Ce que le n° 1 fait en ce moment, en quelques mots. */
function ceEtatCourt(c){
  const f=[...S.af.m,...S.af.p].find(x=>x.a===c.id||x.b===c.id);
  if(f&&!(S.rs&&S.rs.apres)){const a=parId(f.a===c.id?f.b:f.a);return {t:a?`À l’affiche le 16 févr. contre ${lien(a)}`:'À l’affiche le 16 févr.',col:''};}
  if(c.statut==='blesse')return {t:`Blessé${/ F$/.test(c.cat)?'e':''}, retour ${/^\d/.test(c.retour)?'le':'en'} ${esc(c.retour)}`,col:'neg',ico:'medical'};
  if(c.statut==='pause')return {t:'En pause',col:''};
  return {t:'Disponible',col:'vert'};
}
/** Série en cours, en mots (série rangée du plus ancien au plus récent). */
function ceSerie(c){const x=c.serie.slice(-1);let n=0;for(let i=c.serie.length-1;i>=0&&c.serie[i]===x;i--)n++;
  return x==='v'?(n>1?`${n} victoires de suite`:'1 victoire'):(n>1?`${n} défaites de suite`:'1 défaite');}

/* ---- Pièces ---- */
const CE_CB='<span class="rang-c octr ce-cb" title="Champion"><span class="octr"><b class="octr">C</b></span></span>';
const ceRangB=c=>c.rang==='C'?CE_CB:`<span class="ce-rg octr">${esc(c.rang)}</span>`;
/** Comment un règne s'est terminé, en deux lignes : [ligne 1, ligne 2]. */
function ceFin(x){
  const f=x.fin;if(!f)return null;
  const nom=c=>c?lien(c):'';
  switch(f[0]){
    case 'perd':return [`perd contre ${nom(x.suivant)}`,f[1]];
    case 'retraite':return [x.c.f||/ F$/.test(x.cat)?'prend sa retraite':'prend sa retraite',''];
    case 'part':return [`part chez ${esc(f[1])}`,''];
    case 'retiree':return ['ceinture retirée',f[1]];
    case 'laisse':return ['laisse la ceinture',f[1]];
    case 'promu':return ['promu champion',f[1]];
    case 'reunifie':return ['réunifie les ceintures',''];
  }
  return null;
}

/* ---- Les champions : une carte par ceinture (Hommes ou Femmes, sans catégorie) ---- */
function ceCarte(cat,i){
  const ch=ceEnCours(cat),l=ceLignee(cat);if(!ch)return '';
  const c=ch.c,sig=ceSigne(cat),dt=ceDernierTitre(cat),n1=ceN1(cat)[0];
  const def=sig?`<b>${ceJour(sig.date).replace(/ \d{4}$/,'')} · contre ${lien(sig.adv)}</b><span class="sous">Fight Night ${sig.n}, ${esc(sig.ville)}</span>`
    :`<b class="ce-aprog">Rien de prévu</b><span class="sous">n° 1 : ${n1?lien(n1):'personne'}</span>`;
  const der=dt?`<b>${ceQuand(dt.d)}</b><span class="sous">${ceIlYa(dt.d)}</span>`:'';
  return `<div class="ce-carte oct apparait" data-cecat="${esc(cat)}" style="animation-delay:${i*55}ms;--d:${i*55}ms"><div class="ce-ci oct">
    <div class="ce-haut"><i class="ce-img"></i>
      <div class="ce-cat"><span class="T">${esc(ceCourt(cat))}</span><span class="ce-kg">${ceKg(cat)} kg</span></div>
      <div class="ce-champ">${CE_CB}<div class="ce-noms"><span class="ce-pre">${esc(c.prenom)}${c.surnom?` <i>« ${esc(c.surnom)} »</i>`:''}</span><span class="ce-nom nom ${c.nom.length>8?'long':''}" data-fiche="${c.id}">${esc(c.nom)}</span><span class="ce-lg"><b>${bilan(c)}</b> · n° ${c.mondial} mondial</span><span class="ce-lg">${ch.n}<sup>e</sup> champion${/ F$/.test(cat)?'ne':''} de la lignée</span></div></div>
      </div>
    <div class="ce-bas">
      <div class="ce-l"><span class="etiq">Prochain défi</span>${def}</div>
      <div class="ce-l"><span class="etiq">Dernier combat pour le titre</span>${der}</div>
      ${S.cl.sexe==='F'?`<div class="ce-l ce-avant"><span class="etiq">Avant elle</span>${l.filter(y=>!y.int&&y.a).slice(-3).reverse().map(y=>`<span class="ce-av">${lien(y.c)}<span class="sous">${ceAn(y.de)} – ${ceAn(y.a)}</span></span>`).join('')}</div>`:''}
    </div></div></div>`;
}
function ceMur(){
  const sx=S.cl.sexe,cats=CATS[sx].map(x=>x[0]);
  return `<div class="ce-mur ${sx==='F'?'f':''}">${cats.map(ceCarte).join('')}</div>`;
}

/* ---- La lignée en frise : un trait par règne, à l'échelle du temps ; le nom au-dessus ou au-dessous, en alternance ---- */
const CE_FW=1518;   /* largeur utile de la frise, en pixels de la scène */
function ceFrise(cat){
  const l=ceLignee(cat),sig=ceSigne(cat),auj=S.date;
  const t0=ceDate(l[0].de),fin=sig?ceDate(sig.date):auj,t1=new Date(fin.getFullYear(),fin.getMonth()+1,fin.getDate());
  const tot=ceMoisEntre(new Date(t0.getFullYear(),t0.getMonth()-3,1),t1),orig=new Date(t0.getFullYear(),t0.getMonth()-3,1);
  const X=d=>Math.round(ceMoisEntre(orig,d)/tot*CE_FW);
  const fin_=x=>x.a?ceDate(x.a):auj;
  /* Les années : une sur deux quand la ceinture a plus de douze ans. */
  const a0=orig.getFullYear()+1,a1=t1.getFullYear(),pas=a1-a0>12?2:1;
  const ans='';
  /* Les traits : un règne (gris), le règne en cours (or), un intérim (hachuré, au-dessus), une vacance (pointillés). */
  let traits='';
  l.forEach((x,i)=>{const g=X(ceDate(x.de)),d=X(fin_(x)),w=Math.max(6,d-g-3),cur=!x.a&&!x.int;
    traits+=`<div class="ce-tr ${x.int?'int':''} ${cur?'cur':''}" data-cen="${x.n}" style="left:${g}px;width:${w}px;animation-delay:${120+i*60}ms" title="${esc(x.c.prenom+' '+x.c.nom)}">${!x.int&&w>=26?`<b>${x.n}</b>`:''}</div>`;});
  const vides=[];l.filter(x=>!x.int&&x.a).forEach(x=>{const s=l.find(y=>!y.int&&y!==x&&ceDate(y.de)>=ceDate(x.a));
    if(s&&ceDate(s.de)>ceDate(x.a)){const g=X(ceDate(x.a)),d=X(ceDate(s.de));traits+=`<i class="ce-vac" style="left:${g}px;width:${Math.max(4,d-g-3)}px"></i>`;vides.push(1);}});
  /* Le prochain défi signé : un octogone doré sur la frise, à sa date. */
  if(sig)traits+=`<i class="ce-futur octr pulse" style="left:${X(ceDate(sig.date))-9}px" title="Prochain défi : ${ceJour(sig.date)}"></i>`;
  /* Les noms : du plus récent au plus ancien, le règne en cours au-dessus ; placés après mesure (ceCaler), en alternance, sans se chevaucher.
     Quatre lignes : qui, quand, défenses (et intérim), comment le règne finit. Le règne en cours ne répète pas ses défenses (Classement). */
  const regnes=l.filter(x=>!x.int);let noms='';
  [...regnes].reverse().forEach((x,k)=>{
    const intr=l.find(y=>y.int&&y.c===x.c&&y.a===x.de),cur=!x.a,f=ceFin(x);
    const l2=cur?(cePrecis(x.de)?`depuis le ${ceJour(x.de)}`:`depuis ${ceMois(x.de)}`):`${ceMois(x.de)} – ${ceMois(x.a)}`;
    const dIntr=intr?`intérim dès ${ceMois(intr.de)}`:'',dSig=sig?`défend le ${ceJour(sig.date).replace(/ \d{4}$/,'')}`:'',dAdv=sig?`contre ${lien(sig.adv)}`:'';
    /* Un intérim tenu par un autre pendant son règne (blessure, autre catégorie) se dit aussi sur sa ligne. */
    const autreInt=l.find(y=>y.int&&y.c!==x.c&&ceDate(y.de)>=ceDate(x.de)&&ceDate(y.de)<(x.a?ceDate(x.a):auj));
    const l3=cur?(dIntr||dSig):`${x.def} défense${x.def>1?'s':''}${dIntr?` · ${dIntr}`:autreInt?` · intérim en ${ceAn(autreInt.de)}`:''}`;
    const l4=cur?(dIntr?[dSig,dAdv].filter(Boolean).join(' '):dAdv):f?(f[0].startsWith('perd')?`perd contre ${x.suivant?`<span class="nom" data-fiche="${x.suivant.id}">${esc(x.suivant.nom)}</span>`:''}`:f[0]):'';
    const g=X(ceDate(x.de));
    noms+=`<div class="ce-nm ${cur?'cur':''} apparait" data-cen="${x.n}" data-g="${g}" style="left:0;animation-delay:${260+k*50}ms">
      <div class="ce-nm1"><span class="ce-num octr">${x.n}</span><span class="ce-nmn">${lien(x.c)}</span></div>
      <div class="ce-nm2">${esc(l2)}</div><div class="ce-nm3">${l3}</div>${l4?`<div class="ce-nm3">${l4}</div>`:''}</div>
      <i class="ce-lien" data-cen="${x.n}" style="left:${g+1}px;animation-delay:${200+k*50}ms"></i>`;
  });
  const fe=/ F$/.test(cat)?'ne':'';
  const leg=[['tr','Un règne'],['cur',`Champion${fe} en titre`]].concat(l.some(x=>x.int)?[['int',`Champion${fe} intérimaire`]]:[]).concat(vides.length?[['vac','Ceinture vacante']]:[]).concat(sig?[['fut','Prochain défi']]:[]);
  const legende=`<span class="ce-leg">${leg.map(([k,t])=>`<span><i class="ce-lg-${k} ${k==='fut'?'octr':''}"></i>${t}</span>`).join('')}</span>`;
  const nInt=l.filter(x=>x.int).length;
  return pan(`<div class="pt"><h2>Lignée</h2><span class="ment ce-ment"><span data-cecompte="${regnes.length}">${regnes.length}</span> champion${/ F$/.test(cat)?'ne':''}s depuis ${ceAn(l[0].de)}${nInt?` · ${nInt} intérim`:''}</span>${legende}</div>
    <div class="ce-frise">${ans}${traits}${noms}</div>`,'','ce-lig');
}

/* ---- Le prochain défi : le combat signé, ou le n° 1 qu'il reste à programmer ---- */
function ceCote(c,s,rangTxt,etat){
  return `<div class="ce-cote ${s}"><div class="ce-c1">${ceRangB(c)}<span>${esc(c.prenom)}${c.surnom?` « ${esc(c.surnom)} »`:''}</span></div>
    <div class="ce-c2"><span class="nom ${c.nom.length>8?'long':''}" data-fiche="${c.id}">${esc(c.nom)}</span></div>
    <div class="ce-c3"><span class="T">${bilan(c)}</span><span>${rangTxt}</span></div>
    ${etat?`<div class="ce-c4 ${etat.col?'ce-'+etat.col:''}">${etat.ico?ico(etat.ico,18):''}${etat.t}</div>`:''}</div>`;
}
function ceDefi(cat){
  const ch=ceEnCours(cat);if(!ch)return '';
  const c=ch.c,sig=ceSigne(cat),dt=ceDernierTitre(cat),l1=ceN1(cat),fem=/ F$/.test(cat);
  const adv=sig?sig.adv:l1[0];if(!adv)return '';
  const tete=sig?`Fight Night ${sig.n} · ${ceJour(sig.date)} · ${esc(sig.lieu)}`:`Rien de signé · ${fem?'la championne':'le champion'} et ${fem?'la':'le'} n° 1`;
  const bande=`<div class="ce-band ${sig?'':'aprog'}"><i class="ce-band-img"></i>
      <div class="ce-band-t">${sig?CE_CB.replace('ce-cb','ce-cb ce-cbp'):''}<span>${tete}</span></div>
      ${ceCote(c,'a',`n° ${c.mondial} mondial`)}
      <div class="ce-mil"><div class="vsw octr"><div class="vsr octr"><div class="vs octr">VS</div></div></div><span class="ce-chip oct">${esc(ceCourt(cat))} · 5 rounds</span></div>
      ${ceCote(adv,'b',`n° ${adv.mondial} mondial`,sig?null:ceEtatCourt(adv))}</div>`;
  /* À droite : leur histoire (ou le dernier combat pour le titre), puis qui attend derrière le n° 1. */
  let fait1;
  if(sig&&c.id==='nana'&&adv.id==='mezouar')fait1=['Dernier affrontement',`<b>${lien(adv)} gagne par soumission</b><span class="sous">étranglement arrière, 2e round · 4 août 2025</span>`];
  else if(sig)fait1=['Dernier affrontement','<b>Jamais affrontés</b>'];
  else fait1=['Dernier combat pour le titre',`<b>${ceQuand(dt.d)}</b><span class="sous">${dt.prise?(dt.adv?`prend la ceinture à ${lien(parNom(dt.adv,cat))}`:'prend la ceinture vacante'):'défend sa ceinture'}</span><span class="sous">${ceIlYa(dt.d)}</span>`];
  const derriere=l1.filter(x=>x!==adv&&x.id!==c.id).slice(0,2);
  const ligneD=x=>{const e=ceEtatCourt(x);return `<div class="ce-dr"><span class="ce-rg octr">${x.rang}</span><div class="ce-drt"><span class="ce-drn">${lien(x)}</span><span class="ce-dre ${e.col?'ce-'+e.col:''}">${e.ico?ico(e.ico,16):''}${e.t}</span></div></div>`;};
  const bouton=sig?`<button class="bouton jaune cj ce-act" data-go="carte">Ouvrir la carte ›</button>`
    :`<button class="bouton jaune cj ce-act" data-ceprop="${esc(cat)}">Proposer le combat ›</button>`;
  const fait=([t,v])=>`<div class="ce-f"><span class="etiq">${t}</span>${v}</div>`;

  return pan(`<div class="pt"><h2>Prochain défi</h2><span class="ment">${sig?`dans <span data-cecompte="${Math.round((ceDate(sig.date)-S.date)/864e5)}">${Math.round((ceDate(sig.date)-S.date)/864e5)}</span> jours`:'à programmer'}</span></div>
    <div class="ce-defi">${bande}
      <div class="ce-droite">
        <div class="ce-faits">${fait(fait1)}${fait(['Prétendants',derriere.map(ligneD).join('')])}</div>
        ${bouton}</div></div>`,'','ce-pd');
}
function ceDetail(cat){return `<div class="ce-det">${ceFrise(cat)}${ceDefi(cat)}</div>`;}
/** Place les noms de la frise une fois mesurés : du plus récent au plus ancien, au-dessus puis au-dessous en alternance ;
    si les deux côtés sont pris, le côté qui laisse le plus de place, le texte se coupant au besoin. */
function ceCaler(){
  const fr=document.querySelector('.ce-frise');if(!fr)return;
  const W=fr.clientWidth,occ={h:[],b:[]},E=30;
  /* Une place sur un côté : à l'aplomb de son trait, sinon décalée vers la gauche juste avant le nom suivant,
     tant que le trait de rappel tombe encore sous le nom. */
  const essai=(c,g,w)=>{
    const libre=x=>x>=0&&occ[c].every(([a,b])=>x+w+E<=a||x>=b+E);
    const x0=Math.max(0,Math.min(g,W-w));if(libre(x0))return x0;
    for(const [a] of occ[c].filter(([a])=>a>x0-w).sort((p,q)=>p[0]-q[0])){const x=a-E-w;if(x<=g&&x+w>=g-8&&libre(x))return x;}
    return null;};
  [...fr.querySelectorAll('.ce-nm')].forEach((el,k)=>{
    const w=Math.ceil(el.scrollWidth)+4,g=+el.dataset.g,pref=k%2?'b':'h',autre=pref==='h'?'b':'h';
    let cote=pref,x=essai(pref,g,w),larg=w;
    if(x===null){x=essai(autre,g,w);cote=autre;}
    if(x===null){const place=c=>{const s=occ[c].filter(([a])=>a>g).map(([a])=>a);return (s.length?Math.min(...s):W)-E-g;};
      cote=place(pref)>=place(autre)?pref:autre;x=g;larg=Math.max(120,place(cote));}
    occ[cote].push([x,x+larg]);
    el.classList.add(cote);el.style.left=x+'px';el.style.width=larg+'px';
    const li=fr.querySelector(`.ce-lien[data-cen="${el.dataset.cen}"]`);if(li)li.classList.add(cote);
  });
}
const ceRendreBase=rendre;
/** Mouvement discret : les chiffres défilent jusqu'à leur valeur à l'ouverture de l'onglet ou d'une catégorie. */
function ceCompter(){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  document.querySelectorAll('[data-cecompte]').forEach(e=>{const v=+e.dataset.cecompte,t0=performance.now()+250;
    const f=t=>{const k=Math.max(0,Math.min(1,(t-t0)/700)),x=1-Math.pow(1-k,3);e.textContent=Math.round(v*x);if(k<1)requestAnimationFrame(f);};requestAnimationFrame(f);});}
rendre=function(){const anim=S.cl.anim;ceRendreBase();if(S.ecran==='classements'&&S.cl.vue==='ceintures'){ceCaler();if(anim)ceCompter();}};

/* ---- La fiche d'un ancien champion : ce qu'il fait, sa ceinture, sa place dans la lignée ---- */
function ceFicheHtml(c){
  const R=ceRegnesDe(c).filter(x=>!x.int),I=ceRegnesDe(c).filter(x=>x.int),f=c.f,e=f?'e':'';
  const x0=R[0],l=ceLignee(x0.cat),k=l.filter(y=>!y.int).indexOf(x0),av=l.filter(y=>!y.int)[k-1],ap=l.filter(y=>!y.int)[k+1];
  const r=graine(c.id+'b'),def=R.reduce((s,x)=>s+x.def,0),v=11+def*2+Math.floor(r()*5),d=2+Math.floor(r()*4),bil=`${v}-${d}-0`;
  const anTitre=ceAn(x0.de),age=c.aTitre+(2027-anTitre),finAn=x0.a?ceAn(x0.a):2027;
  const role=c.role==='P'?`Chez ${c.det.replace(' Championship','')}`:CE_ROLES[c.role][f?1:0];
  const fait={R:`A arrêté le combat en ${c.det}.`,E:`Entraîneur${f?'e':''} à ${c.det}.`,C:`Consultant${e} pour ${c.det}.`,G:`Gère une salle à ${c.det}.`,P:`Combat pour ${c.det} depuis ${Math.max(finAn,c.arr+1)}.`}[c.role];
  const lieu={R:'',E:c.det,C:c.det,G:c.det,P:''}[c.role];
  const faitB=(t,val)=>`<div class="oct cl-fait"><div class="sous">${t}</div><div class="T">${val}</div></div>`;
  const prise=y=>{const p=l.filter(z=>!z.int)[l.filter(z=>!z.int).indexOf(y)-1];if(!p)return 'Premier champion de la catégorie';
    if(p.fin&&p.fin[0]==='perd')return `Bat ${p.c.prenom} ${p.c.nom}, ${p.fin[1]}`;
    const ii=l.find(z=>z.int&&z.c===y.c&&z.a===y.de);if(ii)return ii.fin[0]==='promu'?`Champion intérimaire en ${ceMois(ii.de)}, promu en ${ceMois(y.de)}`:`Champion intérimaire en ${ceMois(ii.de)}`;
    return 'Ceinture vacante';};
  const jal=[[c.arr,`Arrive chez Split`]];
  R.forEach(y=>{jal.push([ceAn(y.de),`Champion${e} des ${cePl(y.cat)}`]);const fn=ceFin(y);if(fn)jal.push([ceAn(y.a),fn[0].replace(/<[^>]+>/g,'').replace(/^./,m=>m.toUpperCase())]);});
  if(c.role==='R'&&!R.some(y=>y.fin&&y.fin[0]==='retraite'))jal.push([+c.det,`Arrête le combat`]);
  if(c.role==='P'&&!R.some(y=>y.fin&&y.fin[0]==='part'))jal.push([Math.max(finAn,c.arr+1),`Part chez ${c.det}`]);
  return `<div class="banniere" style="height:260px"><div class="ban-contenu"><i class="fb-img cl-staff-img"></i>
      <div class="fb-nom ${accentHaut(c.nom)?'accent':''}"><span style="font-size:64px">${esc(c.prenom)}${c.surnom?`<em class="s">« ${esc(c.surnom)} »</em>`:''}</span><span style="font-size:${c.nom.length>8?150:200}px">${esc(c.nom)}</span></div>
      <div class="fb-pal"><div style="display:flex;flex-direction:column;gap:14px"><span style="font-weight:600;font-size:22px;letter-spacing:.04em;color:var(--texte2)">AUJOURD’HUI</span>
        <b class="T" style="font-size:${role.length>12?52:72}px;line-height:.8">${esc(role)}</b><span class="sous">Ancien${e} champion${f?'ne':''} de Split · ${bil}</span></div></div></div></div>
    <div class="cl-staff ce-anc">
      ${pan(titre(esc(role),esc(lieu))+`<div class="cl-chez">${esc(fait)}<span class="relire">à relire</span></div>
        <div class="cl-sf">${faitB('Chez Split',`${c.arr} – ${c.role==='R'?c.det:c.role==='P'?Math.max(finAn,c.arr+1):finAn}`)}${faitB('Âge',age+' ans')}${faitB('Palmarès',bil)}</div>
        <div class="etiq">Parcours</div>
        <div class="cl-frise">${jal.map(([a,t],i)=>`<div class="apparait" style="animation-delay:${200+i*90}ms"><b class="T">${a}</b><i class="octr"></i><span>${esc(t)}</span></div>`).join('')}</div>`,'height:100%','apparait')}
      ${pan(titre(R.length>1?'Ses ceintures':'Sa ceinture',esc(R.map(y=>ceCourt(y.cat)).join(' · ')))+R.map(y=>{const fn=ceFin(y);return `<div class="cl-titre-c"><span style="color:var(--jaune);display:flex">${ico('ceintures',26)}</span><span>Champion${e} des ${esc(cePl(y.cat))}</span></div>
        <div class="cl-sf ce-sf">${faitB('Règne',`${ceAn(y.de)} – ${ceAn(y.a)}`)}${faitB('Défenses',y.def)}</div>
        <div class="ce-anl"><span class="etiq">Prise · ${ceMois(y.de)}</span><span>${esc(prise(y))}</span></div>
        <div class="ce-anl"><span class="etiq">Fin · ${ceMois(y.a)}</span><span>${fn?fn[0].replace(/^./,m=>m.toUpperCase())+(fn[1]?`, ${esc(fn[1])}`:''):''}</span></div>`;}).join('')
        +(I.length&&R.length===1?'':'' ),'height:100%','apparait')}
      ${pan(titre('Dans la lignée',`${x0.n}<sup>e</sup> sur ${l.filter(y=>!y.int).length}`)+`<div class="ce-ll">${l.filter(y=>!y.int).slice().reverse().map(y=>`<div class="ce-lli ${y.c===c?'moi oct':''}"><span class="ce-num octr ${!y.a?'cur':''}">${y.n}</span><span class="ce-lln">${y.c===c?`${esc(y.c.prenom)} ${esc(y.c.nom)}`:lien(y.c)}</span><span class="sous">${y.a?`${ceAn(y.de)} – ${ceAn(y.a)}`:`depuis ${ceAn(y.de)}`}</span></div>`).join('')}</div>
        <button class="bouton petit oct ce-voir" data-celignee="${esc(x0.cat)}" style="margin-top:auto;align-self:flex-start">Voir la lignée des ${esc(cePl(x0.cat))} ›</button>`,'height:100%','apparait')}
    </div>`;
}

/* ---- L'onglet ---- */
const ceToutes=()=>clCat()==='toutes';
function ceHtml(){return ceToutes()?ceMur():ceDetail(clCat());}

/* ---- Branchement dans les Classements : l'onglet, le rendu, Retour et Avant, la fiche ---- */
clOnglets=function(){
  const o=(v,t)=>`<button class="onglet oct ${S.cl.vue===v?'ouvert':''}" data-clvue="${v}">${t}</button>`;
  return `<div class="cl-haut">${o('classement','Classement')}${o('ceintures','Ceintures')}${o('meilleurs','Les meilleurs')}${o('records','Records')}</div>`;
};
const ceClHtmlBase=clHtml;
clHtml=function(){
  if(S.cl.vue!=='ceintures')return ceClHtmlBase();
  clGarder();return `<div class="cl ce">${clOnglets()}${clFiltres()}${ceHtml()}</div>`;
};
const ceAllerBase=aller;
aller=function(ec){
  if(ec==='ceintures'){S.cl.vue='ceintures';ec='classements';}
  ceAllerBase(ec);
};
/* Retour et Avant à l'intérieur de l'écran : changer d'onglet (vers ou depuis Ceintures), de sexe ou de catégorie est un pas du parcours. */
function cePas(maj){S.hist.push({ce:ceEtat()});S.futur=[];maj();S.cl.anim=true;rendre();}
const ceAppliquer=v=>{const o=JSON.parse(v);S.cl.vue=o.vue;S.cl.sexe=o.sexe;S.cl.cats=o.cats;S.cl.stat=o.stat;S.cl.anim=true;};
const ceRetourBase=retour;
retour=function(){
  while(S.ecran!=='classements'&&S.hist.length&&S.hist[S.hist.length-1]&&S.hist[S.hist.length-1].ce)S.hist.pop();
  const h=S.hist[S.hist.length-1];
  if(S.ecran==='classements'&&!S.fiche&&h&&h.ce){S.hist.pop();S.futur.push({ce:ceEtat()});ceAppliquer(h.ce);rendre();return;}
  ceRetourBase();
};
function ceAvancer(){
  const f=S.futur[S.futur.length-1];
  if(S.ecran==='classements'&&!S.fiche&&f&&f.ce){S.futur.pop();S.hist.push({ce:ceEtat()});ceAppliquer(f.ce);rendre();return true;}
  return false;
}
/* La fiche d'un ancien champion s'ouvre comme celle d'un ancien du staff. */
const ceRendreFicheBase=rendreFiche;
rendreFiche=function(dir=0){
  const c=parId(S.fiche);
  if(c&&c.ceAncien){$('#fiche').innerHTML=ceFicheHtml(c);return;}
  ceRendreFicheBase(dir);
};
/* Survol : le trait et le nom d'un même règne s'allument ensemble. */
document.addEventListener('mouseover',e=>{
  const el=e.target.closest&&e.target.closest('.ce-frise [data-cen]');
  document.querySelectorAll('.ce-frise .on').forEach(x=>x.classList.remove('on'));
  if(el)document.querySelectorAll(`.ce-frise [data-cen="${el.dataset.cen}"]`).forEach(x=>x.classList.add('on'));
});

document.addEventListener('click',e=>{
  const t=e.target;let el;
  /* Depuis la fiche d'un ancien : la lignée de sa catégorie. */
  if((el=t.closest('[data-celignee]'))){e.stopImmediatePropagation();const cat=el.dataset.celignee,sx=/ F$/.test(cat)?'F':'H';
    const deja=S.ecran==='classements'&&S.cl.vue==='ceintures'&&S.cl.sexe===sx&&S.cl.cats[sx]===cat;
    fermerFiche(deja);if(deja)return;if(S.ecran!=='classements'){S.hist.push(S.ecran);S.futur=[];S.ecran='classements';}
    cePas(()=>{S.cl.vue='ceintures';S.cl.sexe=sx;S.cl.cats[sx]=cat;});return;}
  if(S.ecran!=='classements')return;
  if(t.closest('#bAvant')&&!S.fiche&&ceAvancer()){e.stopImmediatePropagation();return;}
  if(t.closest('#bRetour')&&!S.fiche){const h=S.hist[S.hist.length-1];if(h&&h.ce){e.stopImmediatePropagation();retour();return;}}
  if(S.fiche||t.closest('[data-fiche]')||!t.closest('#corps'))return;
  const F=S.cl;
  if((el=t.closest('[data-clvue]'))){const v=el.dataset.clvue;if(v===F.vue)return;
    if(v==='ceintures'||F.vue==='ceintures'){e.stopImmediatePropagation();cePas(()=>{F.vue=v;F.stat=null;});}return;}
  if(F.vue!=='ceintures')return;
  if((el=t.closest('[data-clsexe]'))){e.stopImmediatePropagation();const v=el.dataset.clsexe;if(v!==F.sexe||F.cats[v]!=='toutes')cePas(()=>{F.sexe=v;F.cats[v]='toutes';});return;}
  if((el=t.closest('[data-clcat]'))){e.stopImmediatePropagation();const v=el.dataset.clcat;if(v!==F.cats[F.sexe])cePas(()=>{F.cats[F.sexe]=v;});return;}
  if((el=t.closest('[data-cecat]'))){e.stopImmediatePropagation();const v=el.dataset.cecat;cePas(()=>{F.cats[F.sexe]=v;});return;}
  if((el=t.closest('[data-ceprop]'))){e.stopImmediatePropagation();const cat=el.dataset.ceprop,ch=ceEnCours(cat).c,n1=ceN1(cat)[0];
    toast(`${esc(ch.nom)} – ${esc(n1.nom)} pour la ceinture des ${esc(cePl(cat))} : à placer sur la Fight Night 64 (3 avr., Bordeaux). Sa carte n’est pas dans cette maquette.`);return;}
},true);

/* ---- Lancement : ?ecran=ceintures (ou ?ecran=classements&clvue=ceintures), options sexe=H|F, cecat=<catégorie|toutes>, apres=1 (la 63 jouée), fiche=<id> ---- */
window.addEventListener('DOMContentLoaded',()=>{
  const q=new URLSearchParams(location.search);
  if(q.get('ecran')!=='ceintures')return;
  if(q.get('apres')){Object.assign(S.af.m[2],{b:'bello'});Object.assign(S.af.m[3],{a:'labbe',b:'darras'});rsJouer63();}
  S.ecran='classements';S.hist=['accueil'];S.cl.vue='ceintures';
  if(q.get('sexe'))S.cl.sexe=q.get('sexe');
  const cat=q.get('cecat');if(cat){const all=[...CATS.H,...CATS.F].map(x=>x[0]);const m=cat==='toutes'?'toutes':all.find(x=>slug(x)===slug(cat)||slug(courte(x))===slug(cat)&&/ F$/.test(x)===(S.cl.sexe==='F'));if(m)S.cl.cats[S.cl.sexe]=m;}
  S.cl.anim=true;rendre();
  if(q.get('fiche'))setTimeout(()=>ouvrirFiche(q.get('fiche')),80);
});
