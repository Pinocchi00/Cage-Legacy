"use strict";
/* Maquette lot 1 — Classements (R18 à R21) : classement Split et classement mondial (Q20b : un filtre Split / Monde, choisi le 09/11),
   Les meilleurs (Q19a : un cadre ouvre la liste complète de sa statistique), Records en un seul onglet (Q21a).
   Chargé après messages.js : remplace rendre(), aller() et ouvrirFiche() pour l'écran « classements ». */

/* ---- Le monde : les sept autres organisations du jeu (mgmt-data.js, MGMT_EXT_ORGS_HUIT) ---- */
const CL_ORGS=['Garden of Blood','MMA Korner','Pure Impact','Ultimate Rim','Knuckle Gate','Undisputed Cage','Fighting Pacific Championship'];
const CL_PRE_H=['Rafael','Mateusz','Arman','Diego','Kai','Ignacio','Bogdan','Movsar','Leon','Vicente','Joaquin','Caio','Marvin','Roman','Jiří','Volkan','Tai','Petr','Umar','Alexandre','Tatsuro','Manel','Joshua','Elias','Nikolai','Hugo','Darius','Kenta','Aurelio','Stefan','Malik','Tomás','Jonas','Rustam','Felipe','Yusuf'];
const CL_PRE_F=['Valentina','Erin','Tatiana','Alexa','Marina','Ketlen','Irene','Raquel','Natalia','Karine','Iasmin','Viviane','Molly','Gillian','Mayra','Luana','Denise','Miranda','Julija','Priscila','Ailin','Hannah','Emily','Ana','Rina','Sofia'];
const CL_NOMS=['Andrade','Kowalski','Haugen','Okonkwo','Varga','Takeda','Mendez','Petrović','Lindgren','Al-Rashid','Dumont','Kuznetsov','Brennan','Yilmaz','Sørensen','Castillo','Nakamura','Abbasov','Moreira','Krüger','Halvorsen','Ortega','Tanaka','Volkov','Reyes','Coulibaly','Jankowski','Murphy','Esposito','Hakimi','Laine','Duarte','Kaminski','Oyelaran','Bauer','Szabó','Rocha','Ibragimov','Fitzgerald','Vásquez','Novotný','Mbaye','Arslan','Quintero','Hagberg','Sato','Ferro','Bakker'];
const CL_SURN_H=['El Tanque','Il Lupo','The Hammer','Kazak','Bulldog','Samurai','The Surgeon','Taifun','Cobra','Tornado','The Butcher','Matador','Dynamo','Lobo','Ronin','Gringo','The Anvil','Grizzly','Mamba','Falcon','Razor','Diesel','Brick','Atlas','Cannon','Sniper','Voodoo','Zorro','Highlander','Polar Bear','Saber','Typhoon','Mongoose','Jaguar','Bandit','Outlaw','Phantom','Lumberjack','Goliath','Spartan','Comet','Rhino','Wolverine','Bison','Kodiak','Thunder','Monk','Python','Crusher','Nomad','Pharaoh','Scorpion','Raven','Titan','Hawk','Prophet','Oak','Machete','El Diablo','Tank'];
const CL_SURN_F=['La Leona','Lightning','Viper','Queen Bee','Furia','Little Rock','Gata','Storm','Pantera','Valkyrie','Firecracker','Sparrow','Rosa Negra','Wildcat','Banshee','Phoenix','Tigress','Sunshine','Hurricane','Dynamite','Lady Hawk','Nova','Siren','Jaguara','Kitsune','Raven','Blade','Mamba','Cherry Bomb','Diamond','Ice Queen','Fury','Spitfire','Tempest','Lynx','Comet','Pixie','Saber','Ember','Thunder','Falcon','Medusa','Venus','Cyclone','Scorpion','Iron Lady','La Bruja','Hornet','Starlight','Rebel','Vixen','Nightingale','Gazelle','Cobra'];
const CL_MOIS=['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
const clMois=d=>`${CL_MOIS[d.getMonth()]} ${d.getFullYear()}`;

/* Dans une catégorie, deux combattants générés ne partagent pas le même prénom (quatre « Nadia » chez les pailles). */
(function(){
  const PH=['Yanis','Mathis','Bruno','Kamil','Sergueï','Lucas','Ibrahim','Nolan','Marco','Dmitri','Adrien','Tomasz','Mehdi','Joaquim','Arthur','Kofi','Nikola','Hamza','Victor','Ryo','Florian','Dawid','Samuel','Teodor','Rayan','Gaël','Aslan','Paulo','Quentin','Bilal','Hugo','Elias','Matteo','Oscar','Idriss','Luka'];
  const PF=['Léa','Inès','Marta','Chloé','Aya','Julia','Sana','Elena','Manon','Yasmine','Alice','Noémie','Kaori','Laura','Salomé','Nadia','Clara','Zoé','Amira','Lina','Eva','Maëlle','Jade','Rose','Anaïs','Lou','Mila','Sarah','Iris','Emma'];
  for(const cat of new Set(COMBATTANTS.map(c=>c.cat))){
    const l=COMBATTANTS.filter(c=>c.cat===cat),pris=new Set(l.filter(c=>c.id[0]!=='g').map(c=>c.prenom)),P=/ F$/.test(cat)?PF:PH;let k=0;
    l.filter(c=>c.id[0]==='g').forEach(c=>{if(pris.has(c.prenom)){while(pris.has(P[k%P.length])&&k<200)k++;c.prenom=P[k%P.length];}pris.add(c.prenom);});
  }
})();

/* Le rang mondial de Split ne doit pas se doubler dans une catégorie : un doublon recule d'une place. */
(function(){
  const cats=[...new Set(COMBATTANTS.map(c=>c.cat))];
  for(const cat of cats){const pris=new Set();
    COMBATTANTS.filter(c=>c.cat===cat).sort((a,b)=>a.mondial-b.mondial).forEach(c=>{while(pris.has(c.mondial))c.mondial++;pris.add(c.mondial);});}
})();

/** Classement mondial d'une catégorie (60 places) : Split à ses rangs, le reste vient des sept autres organisations.
    Palmarès à l'échelle des grandes organisations (Q20a) : 30 combats au plus, rarement plus de 5 défaites en haut du classement. */
const CL_MONDE={};
/** Ordre des sept champions du monde d'une catégorie (stable, propre à la catégorie). */
const CL_ORDRE=cat=>{const r=graine(cat+'champions');return [...CL_ORGS].sort(()=>r()-.5);};
/* Chaque organisation a sa couleur : contour et tunnel (le rouge reste à Split, le doré aux champions de Split). */
const CL_TEINTES={'Split':['#E23A2B',''],'Garden of Blood':['#9B4DE0','hue-rotate(262deg) saturate(1.15)'],'MMA Korner':['#3B82E6','hue-rotate(212deg) saturate(1.1)'],
  'Pure Impact':['#1FB5A0','hue-rotate(160deg)'],'Ultimate Rim':['#F08A24','hue-rotate(26deg) saturate(1.25) brightness(1.15)'],'Knuckle Gate':['#A7B0BC','grayscale(1) brightness(1.3)'],
  'Undisputed Cage':['#E0408F','hue-rotate(318deg) saturate(1.1)'],'Fighting Pacific Championship':['#22B8E0','hue-rotate(186deg) saturate(1.1)']};
const clTeinte=c=>CL_TEINTES[c&&c.org||'Split']||CL_TEINTES.Split;
function clMonde(cat){
  if(CL_MONDE[cat])return CL_MONDE[cat];
  const split=COMBATTANTS.filter(c=>c.cat===cat&&c.mondial<=60),pris=new Map(split.map(c=>[c.mondial,c]));
  const f=/ F$/.test(cat),kg=(COMBATTANTS.find(c=>c.cat===cat)||{}).kg||70,l=[],snPris=new Set(),dejaP=new Set(split.map(c=>c.prenom)),dejaN=new Set(split.map(c=>c.nom));
  for(let pos=1;pos<=60;pos++){
    if(pris.has(pos)){l.push(pris.get(pos));continue;}
    const parti=(typeof CL_PARTIS!=='undefined'?CL_PARTIS:[]).find(x=>x.cat===cat&&x.mondial===pos);
    if(parti){l.push(parti);continue;}
    const r=graine(cat+'monde'+pos),P=f?CL_PRE_F:CL_PRE_H;let pr,no;
    /* Prénom et nom jamais deux fois dans la même catégorie (au-delà de la liste, on accepte un prénom déjà vu). */
    let n=0;do{pr=P[Math.floor(r()*P.length)];}while(dejaP.has(pr)&&n++<60);n=0;do{no=CL_NOMS[Math.floor(r()*CL_NOMS.length)];}while(dejaN.has(no)&&n++<80);dejaP.add(pr);dejaN.add(no);
    const haut=pos<=10,v=(haut?15+Math.floor(r()*10):9+Math.floor(r()*11))-(f?4:0),d=haut?1+Math.floor(r()*4):2+Math.floor(r()*5);
    const s=['vvvvv','vvdvv','dvvvv','vdvvv','vvvdv','vvvvd','dvdvv','vvdvd'][Math.floor(r()*8)];
    const nExt=l.filter(x=>x.ext).length,org=nExt<7?CL_ORDRE(cat)[nExt]:CL_ORGS[Math.floor(r()*CL_ORGS.length)],mois=Math.floor(r()*6);
    const sl=f?CL_SURN_F:CL_SURN_H;let sn=sl[Math.floor(r()*sl.length)],q=0;while(snPris.has(sn)&&q++<sl.length)sn=sl[(sl.indexOf(sn)+1)%sl.length];snPris.add(sn);
    const t=r()<.4?'=':r()<.65?'+'+(1+Math.floor(r()*3)):'-'+(1+Math.floor(r()*3));
    const e={id:'w'+slug(cat)+pos,prenom:pr,nom:no,surnom:sn,cat,kg,age:24+Math.floor(r()*12),v,d,n:r()<.12?1:0,rang:'–',mondial:pos,tend:t,serie:s,statut:'dispo',
      dernier:new Date(2026,11-mois,5+Math.floor(r()*20)),taille:'1,7'+Math.floor(r()*9)+' m',allonge:'1,8'+Math.floor(r()*5)+' m',garde:r()<.75?'Orthodoxe':'Fausse garde',
      depuis:'—',contrat:[0,'—'],style:['Frappeur','Lutteur','Grappler','Kickboxeur'][Math.floor(r()*4)],ext:true,org,
      dc:{meth:s.slice(-1)==='v'?(r()<.4?'KO':r()<.65?'Soumission':'Décision'):(r()<.5?'Décision':'KO')}};
    if(r()<.35)e.prochain={date:['6 mars','20 mars','3 avril','17 avril','8 mai'][Math.floor(r()*5)],soiree:`${org} ${20+Math.floor(r()*60)}`};
    if(nExt<7)e.champOrg=true;
    EXT.push(e);l.push(e);
  }
  /* Adversaires : un autre classé de la liste, jamais lui-même. */
  l.forEach((c,i)=>{if(!c.ext)return;if(!c.dc)c.dc={meth:'Décision'};const r=graine(c.id+'adv');
    c.dc.adv=l[(i+1+Math.floor(r()*12))%l.length];if(c.prochain){let a=l[(i+3+Math.floor(r()*9))%l.length];c.prochain.adv=a===c?l[(i+1)%l.length]:a;}});
  return CL_MONDE[cat]=l;
}

/* Les adversaires des combattantes : des combattantes de leur catégorie (la liste ADV de la fiche est masculine). */
const clHistBase=historique;
historique=function(c){
  const h=clHistBase(c);
  if(!/ F$/.test(c.cat)||h._f)return h;
  const autres=COMBATTANTS.filter(x=>x.cat===c.cat&&x.id!==c.id),r=graine(c.id+'advF');
  h.forEach((f,i)=>{if(f.lien)return;const a=autres[Math.floor(r()*autres.length)];f.adv=a.prenom+' '+a.nom;});
  h._f=true;return h;
};

/* ---- Réglages de l'écran : gardés au retour (dossier UI/UX) ---- */
const CL_CLE='maquette-classements';
S.cl={vue:'classement',portee:'split',sexe:'H',cats:{H:'Poids léger',F:'Poids paille F'},stat:null};
try{const g=JSON.parse(localStorage.getItem(CL_CLE)||'{}');delete g.stat;delete g.formule;delete g.tri;Object.assign(S.cl,g);}catch(e){}
function clGarder(){try{const {stat,formule,anim,...g}=S.cl;localStorage.setItem(CL_CLE,JSON.stringify(g));}catch(e){}}
const clCat=()=>S.cl.cats[S.cl.sexe];
/** « Hommes » ou « Femmes » sans catégorie : toutes les catégories du sexe choisi. */
const clToutes=()=>clCat()==='toutes';
const clCatsSexe=()=>CATS[S.cl.sexe].map(x=>x[0]);

/* ---- Pièces ---- */
const clTend=t=>t==='='?'<span class="sous">=</span>':t[0]==='+'?`<span class="cl-up">▲ ${t.slice(1)}</span>`:`<span class="cl-down">▼ ${t.slice(1)}</span>`;
/** Série en cours, lue sur les combats du plus ancien au plus récent : « 3 victoires de suite », « 2 défaites ». */
function clSerieTxt(s){const x=s.slice(-1);let n=0;for(let i=s.length-1;i>=0&&s[i]===x;i--)n++;
  return x==='v'?`<span class="cl-up">${n>1?`${n} victoires de suite`:'1 victoire'}</span>`:`<span class="cl-down">${n>1?`${n} défaites de suite`:'1 défaite'}</span>`;}
/** Le dernier combat : Split le lit dans son historique (même source que la fiche), le monde dans sa liste. Toujours rempli (R18, Morgan). */
function clDernier(c){
  if(c.ext){const x=c.serie.slice(-1);return {res:x,meth:c.dc.meth,adv:c.dc.adv,date:c.dernier};}
  const h=historique(c)[0];return {res:h.res,meth:h.meth[0],adv:parNom(h.adv,c.cat),date:h.date};
}
function clDernierHtml(c){const d=clDernier(c);
  return `<div class="cl-2l"><span class="cl-l1"><span class="marque octr ${d.res}">${d.res.toUpperCase()}</span>${esc(d.meth)}<span class="sous">· ${clMois(d.date)}</span></span><span class="sous cl-ell">contre ${lien(d.adv)}</span></div>`;}
/** Prochain combat : la carte de Split (S.af) d'abord, l'état ensuite. */
function clProchainHtml(c){
  if(c.ext)return c.prochain?`<div class="cl-2l"><span class="cl-l1">${esc(c.prochain.date)}<span class="sous">· ${esc(c.prochain.soiree)}</span></span><span class="sous cl-ell">contre ${lien(c.prochain.adv)}</span></div>`:'<span class="sous">Rien de prévu</span>';
  const f=[...S.af.m,...S.af.p].find(x=>x.a===c.id||x.b===c.id);
  if(f){const a=parId(f.a===c.id?f.b:f.a);return `<div class="cl-2l"><span class="cl-l1">16 février<span class="sous">· Lille</span></span><span class="sous cl-ell">${a?`contre ${lien(a)}`:'adversaire à trouver'}</span></div>`;}
  if(/blesse|suspendu/.test(c.statut))return `<div class="cl-2l"><span class="cl-l1" style="color:var(--neg)">${ico('medical',18)}${c.statut==='blesse'?'Blessé':'Suspendu'}</span><span class="sous">retour le ${esc(c.retour)}</span></div>`;
  if(c.statut==='pause')return '<span class="sous">En pause</span>';
  return '<span class="cl-dispo">Disponible</span>';
}
const clForme=c=>`<div class="cl-2l">${serie5(c.serie)}<span class="cl-st">${clSerieTxt(c.serie)}</span></div>`;
const clChamp=c=>c.ext?!!c.champOrg:c.rang==='C';
/* Chaque organisation a son petit octogone, à sa couleur et à ses initiales ; un champion porte un petit C doré. */
const CL_SIGLES={'Split':'S','Garden of Blood':'GB','MMA Korner':'MK','Pure Impact':'PI','Ultimate Rim':'UR','Knuckle Gate':'KG','Undisputed Cage':'UC','Fighting Pacific Championship':'FP'};
const clSigle=c=>{const o=c&&c.org||'Split';return `<span class="cl-sigle octr" style="background:${clTeinte(c)[0]}" title="${esc(o)}">${CL_SIGLES[o]||'?'}</span>`;};
/* Le C du champion : le même badge que dans l'Effectif, en petit. */
const CL_C='<span class="rang-c octr cl-cb" title="Champion"><span class="octr"><b class="octr">C</b></span></span>';
/** Organisation (et, toutes catégories, la catégorie). */
function clOrg(c){
  const l2=clToutes()?esc(courte(c.cat)):c.ext||c.rang==='C'?'':`n° ${c.rang} chez Split`;
  return `<div class="cl-2l"><span class="cl-l1 cl-ell">${c.ext?esc(c.org):'Split'}${clChamp(c)?CL_C:''}</span>${l2?`<span class="sous">${l2}</span>`:''}</div>`;
}
const clCatCell=c=>`<div class="cl-2l"><span class="cl-l1">${esc(courte(c.cat))}${c.rang==='C'?CL_C:''}</span><span class="sous">n° ${c.mondial} mondial</span></div>`;

/* ---- Podium : le rang dans le logo du jeu (R18, Q18b). Contour jaune pour tout champion ; tunnel doré pour un champion de Split,
   rouge pour Split, à la couleur de son organisation pour les autres. ---- */
const CL_LOGO=n=>`<span class="cl-logo">${LOGO}<b class="T">${n}</b></span>`;
function clCarte(c,place,monde,rangAff){
  const toutes=clToutes(),ch=!monde&&!toutes&&clChamp(c),or=ch&&!c.ext,[col,filtre]=clTeinte(c);
  const badge=!monde&&!toutes&&c.rang==='C'?'<span class="rang-c octr"><span class="octr"><b class="octr">C</b></span></span>':CL_LOGO(rangAff);
  const t=toutes?'':monde?c.tend:(c.tendS||'=');
  const org=`<span class="cl-l1"><span class="cl-ell">${c.ext?esc(c.org):'Split'}</span>${clChamp(c)?CL_C:''}</span>`;
  const sous=monde?(toutes?`${org}<span class="sous">${esc(courte(c.cat))}</span>`:org)
    :`<span class="sous cl-l1">${toutes?esc(courte(c.cat))+' · ':c.rang==='C'?'':`n° ${c.rang} chez Split · `}n° ${c.mondial} mondial${toutes&&clChamp(c)?CL_C:''}</span>`;
  return `<div class="cl-c oct apparait ${ch?'or':''}" style="animation-delay:${place*60}ms"><div class="cl-ci oct"><i class="cl-img ${or?'or':''}" style="${or?'':`filter:${filtre} brightness(.8)`}"></i>
    <div class="cl-badge">${badge}${t?`<span class="cl-ct">${clTend(t)}</span>`:''}</div>
    <div class="cl-noms"><span class="cl-pre">${esc(c.prenom)}${c.surnom?` <i>« ${esc(c.surnom)} »</i>`:''}</span><span class="cl-nom nom ${c.nom.length>8?'long':''}" data-fiche="${c.id}">${esc(c.nom)}</span></div>
    <div class="cl-box"><span class="T cl-bil">${bilan(c)}</span>${serie5(c.serie)}${sous}</div>
  </div></div>`;
}

/* ---- Le tableau : l'ordre est celui du classement, les titres de colonnes ne se cliquent pas (retour du 09/11) ---- */
const CL_COLS={rang:['Rang',130],nom:['Combattant',null],org:['Organisation',240],cat:['Catégorie',170],bilan:['Palmarès',130],forme:['Forme',225],dernier:['Dernier combat',280],mondial:['Mondial',130],prochain:['Prochain combat',250]};
function clColonnes(){
  if(S.cl.portee==='monde')return ['rang','nom','org','bilan','forme','dernier','prochain'];
  return clToutes()?['rang','nom','cat','bilan','forme','dernier','prochain']:['rang','nom','bilan','forme','dernier','mondial','prochain'];}
function clCellule(c,k,r){
  const monde=S.cl.portee==='monde',toutes=clToutes();
  switch(k){
    case 'rang':return `<span class="eff-r"><span class="T eff-rang">${r}</span>${toutes?'':clTend(monde?c.tend:(c.tendS||'='))}</span>`;
    case 'nom':return `<div class="eff-nom">${lien(c)}<span class="sous">${c.surnom?`« ${esc(c.surnom)} »`:'&nbsp;'}</span></div>`;
    case 'org':return clOrg(c);
    case 'cat':return clCatCell(c);
    case 'bilan':return `<span class="T" style="font-size:32px">${bilan(c)}</span>`;
    case 'forme':return clForme(c);
    case 'dernier':return clDernierHtml(c);
    case 'mondial':return `<span style="white-space:nowrap">n° ${c.mondial}&nbsp; ${clTend(c.tend)}</span>`;
    case 'prochain':return clProchainHtml(c);
  }
}
/** La liste affichée, dans l'ordre, avec le rang à montrer. Toutes catégories : les 30 meilleurs d'après leur rang mondial. */
function clListe(){
  const monde=S.cl.portee==='monde',cats=clCatsSexe();
  if(clToutes()){
    const l=monde?cats.flatMap(clMonde):COMBATTANTS.filter(c=>cats.includes(c.cat));
    return l.sort((a,b)=>a.mondial-b.mondial||(b.v-b.d)-(a.v-a.d)).slice(0,30).map((c,i)=>[c,i+1]);
  }
  const cat=clCat();
  return monde?clMonde(cat).map(c=>[c,c.mondial]):COMBATTANTS.filter(c=>c.cat===cat).sort((a,b)=>rangN(a)-rangN(b)).map(c=>[c,c.rang]);
}
function clClassementHtml(){
  const monde=S.cl.portee==='monde',toutes=clToutes(),l=clListe(),tete=l.slice(0,3),reste=l.slice(3),cols=clColonnes();
  const th=k=>{const [t0,w]=CL_COLS[k],t=k==='rang'&&monde&&!toutes?'Rang mondial':t0;return `<th ${w?`style="width:${(w/1500*100).toFixed(2)}%"`:''}>${t}</th>`;};
  const leg='<span class="cl-leg">'+CL_C+' champion</span>';
  const pied=toutes?`Les 30 meilleur${S.cl.sexe==='F'?'es':'s'} ${monde?'du monde':'de Split'}, toutes catégories, d’après leur rang mondial`:`▲ ▼ places gagnées ou perdues depuis la dernière soirée${monde?'':' de Split'}`;
  return `<div class="cl-podium">${tete.map(([c,r],i)=>clCarte(c,i,monde,r)).join('')}</div>
    <div class="cl-pan">${pan(`<div class="defile cl-defile"><table class="eff-t cl-t fixe"><thead><tr>${cols.map(th).join('')}</tr></thead>
      <tbody>${reste.map(([c,r],i)=>`<tr class="apparait ${monde&&!c.ext?'cl-nous':''}" style="animation-delay:${Math.min(i,10)*25}ms">${cols.map(k=>`<td class="c-${k}">${clCellule(c,k,r)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
      <div class="cl-pied"><span>${pied}</span></div>`,'height:100%')}</div>`;
}

/* ---- Les meilleurs : une vitrine vivante (chiffres qui montent, barres qui se remplissent, forme du meilleur), un cadre ouvre la liste complète (Q19a) ---- */
function clFinitions(c){return historique(c).filter(f=>f.res==='v'&&f.meth[0]!=='Décision').length;}
function clMeilleureSerie(c){let m=0,n=0;for(const f of [...historique(c)].reverse()){n=f.res==='v'?n+1:0;m=Math.max(m,n);}return m;}
const CL_STATS=[
  ['fin','Le plus de finitions','Victoires par KO ou soumission chez Split','','Finitions',c=>clFinitions(c),0],
  ['fpm','Le plus gros volume','Coups significatifs portés par minute','/ min','Coups par minute',c=>stats(c).fpm,2],
  ['prec','Le plus précis','Part des coups significatifs qui touchent','%','Précision',c=>stats(c).prec,0],
  ['defF','La meilleure défense','Part des coups adverses évités','%','Coups évités',c=>stats(c).defF,0],
  ['am','Le lutteur','Amenées au sol réussies en 15 minutes','/ 15 min','Amenées en 15 min',c=>stats(c).am,2],
  ['defA','Le mur','Part des amenées adverses stoppées','%','Amenées stoppées',c=>stats(c).defA,0],
  ['sub','Le chasseur de soumission','Tentatives de soumission en 15 minutes','/ 15 min','Tentatives en 15 min',c=>stats(c).sub,2],
  ['serie','La plus longue série','Victoires de suite, sur toute sa carrière','V','Victoires de suite',c=>clMeilleureSerie(c),0],
];
const clVal=(v,dec)=>dec?v.toFixed(dec).replace('.',','):String(v);
/** Classement d'une statistique (la catégorie, ou toutes celles du sexe choisi) : au moins 5 combats, égalités départagées par le palmarès. */
function clStatListe(k){const s=CL_STATS.find(x=>x[0]===k),cats=clToutes()?clCatsSexe():[clCat()];
  return COMBATTANTS.filter(c=>cats.includes(c.cat)&&c.v+c.d+c.n>=5).map(c=>({c,v:s[5](c)})).sort((a,b)=>b.v-a.v||(b.c.v-b.c.d)-(a.c.v-a.c.d));}
const clQui=c=>`${clToutes()?esc(courte(c.cat))+' · ':''}${c.rang==='C'?'champion':'n° '+c.rang+' chez Split'}`;
function clMeilleursHtml(){
  return `<div class="cl-mg">${CL_STATS.map(([k,t,expl,u,,,dec],i)=>{const l=clStatListe(k),m=l[0].v||1,ch=l[0].c;
    const rang=(x,j)=>`<div class="cl-mr"><span class="cl-mn">${j+2}</span><span class="cl-ell">${lien(x.c)}</span><i class="cl-mb"><i style="width:${(x.v/m*100).toFixed(1)}%;animation-delay:${300+i*40+j*80}ms"></i></i><b>${clVal(x.v,dec)}</b></div>`;
    return `<button class="cl-m oct apparait" data-clstat="${k}" style="animation-delay:${i*40}ms"><span class="cl-mi oct"><i class="cl-mimg"></i>
      <span class="etiq">${t}</span><span class="sous cl-mx">${expl}</span>
      <span class="cl-mv"><span class="T" data-clcompte="${l[0].v}" data-dec="${dec}">${clVal(l[0].v,dec)}</span>${u?`<small>${u}</small>`:''}</span>
      <span class="cl-ml cl-ell">${lien(ch)}</span>
      <span class="cl-mrs">${l.slice(1,3).map(rang).join('')}</span>
      <span class="cl-mtous">Les ${l.length} classé${S.cl.sexe==='F'?'e':''}s ›</span></span></button>`;}).join('')}</div>`;
}
/** Les chiffres des meilleurs montent jusqu'à leur valeur à l'ouverture. */
function clCompteurs(){document.querySelectorAll('[data-clcompte]').forEach((e,i)=>{const v=+e.dataset.clcompte,dec=+e.dataset.dec,t0=performance.now()+i*40;
  const f=t=>{const k=Math.max(0,Math.min(1,(t-t0)/700)),q=1-Math.pow(1-k,3);e.textContent=clVal(dec?v*q:Math.round(v*q),dec);if(k<1)requestAnimationFrame(f);};requestAnimationFrame(f);});}
function clStatHtml(){
  const [k,t,expl,u,court,,dec]=CL_STATS.find(x=>x[0]===S.cl.stat),l=clStatListe(k),m=l[0].v||1;
  return `<div class="cl-pan">${pan(`<div class="pt"><h2>${t}</h2><span class="ment">${clToutes()?(S.cl.sexe==='F'?'Toutes les femmes':'Tous les hommes'):esc(clCat())} · ${expl}</span>
      <button class="bb oct petit" data-clstatfermer style="margin-left:24px"><span class="oct">‹ Les meilleurs</span></button></div>
    <div class="defile cl-defile"><table class="eff-t cl-t"><thead><tr><th style="width:8%">Rang</th><th>Combattant</th><th style="width:12%">Palmarès</th><th style="width:40%">${esc(court)}</th><th style="width:12%">Combats</th></tr></thead>
    <tbody>${l.map((x,i)=>`<tr class="apparait ${i===0?'cl-tete':''}" style="animation-delay:${Math.min(i,10)*25}ms"><td><span class="T eff-rang">${i+1}</span></td>
      <td><div class="eff-nom">${lien(x.c)}<span class="sous">${clQui(x.c).replace(/^./,m=>m.toUpperCase())}</span></div></td>
      <td><span class="T" style="font-size:32px">${bilan(x.c)}</span></td>
      <td><span class="cl-lb"><i class="cl-mb"><i style="width:${(x.v/m*100).toFixed(1)}%"></i></i><b>${clVal(x.v,dec)}${u&&u!=='V'?` <small>${u}</small>`:''}</b></span></td>
      <td>${x.c.v+x.c.d+x.c.n}</td></tr>`).join('')}</tbody></table></div>`,'height:100%')}</div>`;
}

/* ---- Les anciens : fiches de staff (consultante, entraîneur, commentateur, agent, gérant de salle) et combattants partis ailleurs ---- */
const CL_STAFF=[
  {id:'sgarciaroy',f:1,prenom:'Inès',nom:'Garcia-Roy',surnom:'La Reine',cat:'Poids paille F',age:38,role:'Consultante',chez:'Pour Cage Hebdo',depuis:2021,lieu:'Paris',
   bilanF:'17-3-0',titres:'Championne des poids pailles, de 2016 à 2020',
   cite:'« Je juge Split comme j’aurais aimé qu’on me juge : sans cadeau. »',apport:'Elle signe la chronique du lundi. Quand elle aime une affiche, les fans suivent.',action:'L’inviter au bord de la cage le 16 février',rel:.7,relT:'Elle aime Split',
   act:[['12 janv.','« Lille mérite mieux qu’une carte à moitié vide. »','d'],['5 janv.','Elle classe Hajar Rachidi n° 1 des espoirs français.','v'],['29 déc.','Son bilan 2026 : « Split a retrouvé des têtes d’affiche. »','v']],
   avis:['rachidi','« Elle a ce que j’avais : la patience. Donnez-lui sa chance avant l’été. »'],
   jalons:[[2014,'Arrive chez Split'],[2016,'Championne des poids pailles'],[2020,'Cinquième défense, puis la retraite'],[2021,'Consultante pour Cage Hebdo']]},
  {id:'skerloch',prenom:'Bastien',nom:'Kerloc’h',surnom:'Le Phare',cat:'Poids moyen',age:41,role:'Entraîneur',chez:'Ar Men Fight Club, à Brest',depuis:2023,lieu:'Brest',
   bilanF:'19-6-0',titres:'Champion des poids moyens, de 2017 à 2019',
   cite:'« Mes lutteurs sont prêts. Il leur manque une soirée. »',apport:'Son club forme des lutteurs. Deux de ses élèves cherchent une organisation.',action:'Voir ses deux élèves',rel:.85,relT:'Très attaché à Split',
   act:[['10 janv.','Deux de ses élèves invaincus chez les amateurs, à 6-0 et 5-0.','v'],['20 déc.','Il accueille un stage de lutte ouvert aux pros.','n'],['2 déc.','« Split devrait regarder du côté de la Bretagne. »','n']],
   avis:['kessler','« Anton est le plus dur que j’aie croisé. Il lui manque un vrai camp de lutte. »'],
   jalons:[[2012,'Premier combat chez Split'],[2017,'Champion des poids moyens'],[2022,'Dernier combat, 19e victoire chez Split'],[2023,'Ouvre l’Ar Men Fight Club']]},
  {id:'sferhat',prenom:'Yacine',nom:'Ferhat',surnom:'Le Lynx',cat:'Poids plume',age:35,role:'Commentateur',chez:'Il commente les soirées de Split',depuis:2022,lieu:'Lyon',
   bilanF:'15-4-0',titres:'Le record de finitions chez Split : 12',
   cite:'« Une finition, ça se raconte. Une décision, ça s’explique. »',apport:'Ses phrases font les extraits qui tournent le lendemain. Un bon combat bien raconté attire plus de spectateurs à la soirée suivante.',action:'Lui parler avant la soirée',rel:.9,relT:'Il fait partie de la maison',
   act:[['8 déc.','Il commente Split Fight Night 62.','n'],['9 déc.','Son « Nana ne recule jamais » a tourné partout.','v'],['14 nov.','Il regrette deux décisions serrées à Split Fight Night 61.','d']],
   avis:['nana','« Le Boucher n’a plus vingt ans, mais personne ne le fait reculer. »'],
   jalons:[[2015,'Premier combat chez Split'],[2019,'12e finition, le record'],[2021,'Retraite'],[2022,'Commentateur des soirées de Split']]},
  {id:'shaddou',prenom:'Samir',nom:'Haddou',surnom:'',cat:'Poids mi-moyen',age:39,role:'Agent',chez:'Il représente quatre combattants, dont Sofiane Belkacem',depuis:2023,lieu:'Marseille',
   bilanF:'21-5-0',titres:'9 victoires de suite, de 2017 à 2020',
   cite:'« Mes combattants valent plus que ce que tu leur offres. Parlons-en. »',apport:'Il négocie dur. Un accord avec lui peut aussi t’ouvrir un espoir des poids plumes que d’autres organisations suivent.',action:'Voir les combattants qu’il représente',rel:.45,relT:'Méfiant',
   act:[['10 janv.','Il a refusé une offre de MMA Korner pour un de ses combattants.','n'],['6 janv.','Il veut un adversaire du top 3 pour Sofiane Belkacem.','n'],['18 déc.','« Split paie moins que les autres. Ça va changer. »','d']],
   avis:['belkacem','« Sofiane veut un adversaire du top 3. Donne-le-lui et il remplira ta salle. »'],
   jalons:[[2013,'Premier combat chez Split'],[2017,'Début de la série de 9 victoires'],[2022,'Retraite'],[2023,'Devient agent']]},
  {id:'sbenyahia',prenom:'Farid',nom:'Benyahia',surnom:'Le Double',cat:'Poids léger',age:37,role:'Gérant de salle',chez:'Benyahia MMA, à Marseille',depuis:2022,lieu:'Marseille',
   bilanF:'18-4-0',titres:'Double champion : poids légers en 2019, poids mi-moyens en 2020',
   cite:'« À Marseille, tout le monde veut combattre pour Split. »',apport:'Sa salle accueille des camps, moins chers qu’à Lyon, avec de bons partenaires de lutte.',action:'Proposer un camp chez lui',rel:.75,relT:'Il garde un bon souvenir de Split',
   act:[['9 janv.','Ilyas Mezouar fait son camp chez lui pour le 16 février.','v'],['22 déc.','Sa salle ouvre une section femmes.','n'],['1 déc.','Il cherche un deuxième entraîneur de lutte.','n']],
   avis:['mezouar','« Ilyas s’entraîne chez moi depuis un mois. Il sera prêt pour Nana. »'],
   jalons:[[2014,'Premier combat chez Split'],[2019,'Champion des poids légers'],[2020,'Champion des poids mi-moyens'],[2022,'Retraite, ouvre Benyahia MMA']]},
];
CL_STAFF.forEach(x=>EXT.push(Object.assign({staff:true,v:+x.bilanF.split('-')[0],d:+x.bilanF.split('-')[1],n:0,rang:'–',mondial:0,serie:'vvvvv',statut:'retraite',ext:true},x)));
/* Partis ailleurs : leur fiche prend la couleur de leur organisation. */
const CL_PARTIS=[Object.assign(parNom('Kamel Yahiaoui','Poids plume'),{org:'Pure Impact',surnom:'Kamikaze',mondial:14,tend:'+1',dc:{meth:'KO'},depart:new Date(2024,6,1)}),
  Object.assign(parNom('Dmitri Zaïtsev','Poids lourd'),{org:'Garden of Blood',surnom:'L’Ours blanc',age:36,mondial:9,tend:'=',dc:{meth:'Décision'},depart:new Date(2021,8,1)})];
function clStaffHtml(c){
  const fait=(l,v)=>`<div class="oct cl-fait"><div class="sous">${l}</div><div class="T">${v}</div></div>`;
  const recs=clRecords().flatMap(([,l])=>l).filter(x=>x.qui&&x.qui.id===c.id),av=parId(c.avis[0]),il=c.f?'elle':'il';
  const ton={v:'var(--vert)',d:'var(--neg)',n:'var(--texte2)'};
  return `<div class="banniere" style="height:260px"><div class="ban-contenu"><i class="fb-img cl-staff-img"></i>
      <div class="fb-nom"><span style="font-size:64px">${esc(c.prenom)}${c.surnom?`<em class="s">« ${esc(c.surnom)} »</em>`:''}</span><span style="font-size:${c.nom.length>8?150:200}px">${esc(c.nom)}</span></div>
      <div class="fb-pal"><div style="display:flex;flex-direction:column;gap:14px"><span style="font-weight:600;font-size:22px;letter-spacing:.04em;color:var(--texte2)">AUJOURD’HUI</span>
        <b class="T" style="font-size:72px;line-height:.8">${esc(c.role)}</b><span class="sous">Ancien${c.f?'ne':''} de Split · ${esc(c.bilanF)}</span></div></div></div></div>
    <div class="cl-staff">
      ${pan(titre(esc(c.role),esc(c.lieu))+`<div class="cl-chez">${esc(c.chez)}</div>
        <div class="cl-sf">${fait('Depuis',c.depuis)}${fait('Âge',c.age+' ans')}${fait('Relation',`<span style="color:${c.rel>=.6?'var(--vert)':'var(--jaune)'}">${c.rel>=.8?'Très bonne':c.rel>=.6?'Bonne':'Fragile'}</span>`)}</div>
        <div class="etiq">Ces dernières semaines</div>
        ${c.act.map(([d,t,k],i)=>`<div class="cl-act apparait" style="animation-delay:${200+i*90}ms"><i class="octr" style="background:${ton[k]}"></i><span class="sous">${d}</span><span>${esc(t)}</span></div>`).join('')}
        <div class="cl-cite">${esc(c.cite)}</div>`,'height:100%','apparait')}
      ${pan(titre('Sa carrière',esc(c.bilanF))+`<div class="cl-titre-c"><span style="color:var(--jaune);display:flex">${ico('ceintures',26)}</span><span>${esc(c.titres)}</span></div>
        <div class="cl-frise">${c.jalons.map(([a,t],i)=>`<div class="apparait" style="animation-delay:${200+i*90}ms"><b class="T">${a}</b><i class="octr"></i><span>${esc(t)}</span></div>`).join('')}</div>
        ${recs.length?`<div class="etiq" style="margin-top:auto">${recs.length>1?'Ses records chez Split':'Son record chez Split'}</div>${recs.map(r=>`<div class="cl-srec"><b class="T">${r.v}</b><span>${r.l}</span></div>`).join('')}`:''}`,'height:100%','apparait')}
      ${pan(titre('Avec Split')+`<div style="display:flex;justify-content:space-between;align-items:baseline"><b style="font-size:24px">${esc(c.relT)}</b><span class="sous">${Math.round(c.rel*100)} / 100</span></div>
        <div class="jauge cl-sj"><i style="width:${c.rel*100}%;background:${c.rel>=.6?'var(--vert)':'var(--jaune)'}"></i></div>
        <div class="etiq">Ce qu’${il} pense de ${lien(av)}</div><div class="cl-avis">${esc(c.avis[1])}</div>
        <div class="etiq" style="margin-top:20px">Ce qu’${il} peut t’apporter</div><div style="font-size:22px;line-height:1.3;margin-top:6px">${esc(c.apport)}</div>
        <button class="bouton petit oct" data-clstaff="${c.id}" style="margin-top:auto;align-self:flex-start">${esc(c.action)}</button>`,'height:100%','apparait')}
    </div>`;
}
/* La fiche : un ancien ouvre sa fiche de staff ; un combattant d'une autre organisation prend sa couleur, son sigle et son rang mondial. */
const clRendreFicheBase=rendreFiche;
rendreFiche=function(dir=0){
  const c=parId(S.fiche);
  if(c&&c.staff){$('#fiche').innerHTML=clStaffHtml(c);return;}
  clRendreFicheBase(dir);
  /* Parcours du mondial : un combattant de Split montre son rang mondial, pas son rang chez Split (doré s'il est champion). */
  if(c&&!c.org&&!c.ext&&S.clNavMonde){const r=$('#banC .fb-pal>div:last-child>:first-child');
    if(r)r.outerHTML=`<span class="marque octr cl-fmond" style="width:84px;height:84px;background:${c.rang==='C'?'var(--jaune)':'var(--blanc)'}">${c.mondial}</span><span class="cl-fmlib">Mondial</span>`;}
  if(c&&c.org){const img=$('#fiche .fb-img');if(img){img.classList.remove('or');img.style.filter=clTeinte(c)[1];}
    const m=$('#banC .fb-pal>div:last-child>.marque');if(m){m.textContent=c.mondial;m.classList.add('cl-fmond');if(c.champOrg)m.style.background='var(--jaune)';
      m.insertAdjacentHTML('afterend',`<span class="cl-fmlib">Mondial</span>`);}
    const f=[...document.querySelectorAll('#fiche .oct')].find(e=>e.firstElementChild&&e.firstElementChild.textContent==='Contrat');
    if(S.onglet==='Aperçu'||S.onglet==='Relation')clApercuExt(c);
    if(f){f.firstElementChild.textContent='Organisation';f.lastElementChild.textContent=c.org;f.lastElementChild.style.cssText+=';font-size:'+(c.org.length>12?20:26)+'px;white-space:normal;line-height:1';f.lastElementChild.title=c.org;}}
};

/** Un combattant du mondial : les flèches et le panneau de catégorie suivent les 30 premiers du classement mondial. */
const clDuMonde=c=>c&&c.org&&!c.staff;
const clTrente=c=>{const l=clMonde(c.cat).slice(0,30);return l.includes(c)?l:[...l,c];};
const clAllerVoisinBase=allerVoisin;
allerVoisin=function(d){const c=parId(S.fiche);if(!S.clNavMonde||c.staff){clAllerVoisinBase(d);return;}
  const l=clTrente(c),i=l.indexOf(c);S.futur=[];S.ficheHist.push(S.fiche);S.fiche=l[(i+d+l.length)%l.length].id;S.panCat=false;rendreFiche(d);};
const clPanneauBase=panneauCat;
panneauCat=function(c){
  if(!S.clNavMonde||c.staff)return clPanneauBase(c);
  const l=clTrente(c),cur=x=>x.id===c.id,noir=x=>cur(x)?'color:var(--noir)':'';
  return `<div class="panneau-cat">${pan(titre(esc(pluriel(c.cat)),'Classement mondial · les 30 premiers')+`<div class="defile" style="padding-right:10px">${l.map(x=>`<div class="lc oct ${cur(x)?'cur':''}" data-lc="${x.id}">
      <span class="T" style="font-size:30px;color:${cur(x)?'var(--noir)':'var(--texte2)'}">${x.mondial}</span>
      <span style="min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;flex-direction:column;gap:4px"><span class="T" style="font-size:32px">${esc(x.prenom)} ${esc(x.nom)}</span><span style="font-size:19px;opacity:.75">${x.surnom?`« ${esc(x.surnom)} »`:''}</span></span>
      <span class="T" style="font-size:32px">${bilan(x)}</span><span class="sous" style="${noir(x)}">${x.ext?esc(x.org):'Split'}</span><span>${serie(x.serie)}</span>
      <span style="font-size:20px;line-height:1.15"><span class="sous" style="${noir(x)}">Dernier combat</span><br>il y a ${depuis(x.dernier)}</span>
      <span style="font-size:20px">${cur(x)?'Fiche ouverte':x.ext?(x.prochain?`Combat le ${esc(x.prochain.date)}`:'<span class="sous">Rien de prévu</span>'):etat(x)}</span></div>`).join('')}</div>`,'height:100%')}</div>`;
};

/* ---- Fiche d'un combattant d'une autre organisation : chaque onglet parle de son organisation, jamais d'un contrat chez Split ---- */
const clAutre=c=>c&&c.org&&!c.staff;
/* Un nom déjà connu (mondial, anciens) ouvre toujours la même fiche. */
const clParNomBase=parNom;
parNom=function(nom,cat){const e=EXT.find(x=>x.prenom+' '+x.nom===nom&&!x.staff&&x.cat===cat)||EXT.find(x=>x.prenom+' '+x.nom===nom&&!x.staff);return e&&!COMBATTANTS.find(x=>x.prenom+' '+x.nom===nom)?e:clParNomBase(nom,cat);};
/* Ses soirées : celles de son organisation (après son départ de Split pour un ancien). */
const clHistOrgBase=historique;
historique=function(c){
  const h=clHistOrgBase(c);
  if(!clAutre(c)||h._o)return h;
  const r=graine(c.id+'soirees'),n0=40+Math.floor(r()*40);
  const autres=clMonde(c.cat).filter(x=>x.ext&&x!==c&&!x.staff);
  h.forEach((f,i)=>{if(c.depart&&f.date<c.depart)return;f.soiree=`${c.org} ${n0-i*3}`;
    /* Hors de Split, il n'affronte pas un combattant de Split. */
    if(COMBATTANTS.some(x=>x.prenom+' '+x.nom===f.adv)&&autres.length){const a=autres[Math.floor(r()*autres.length)];f.adv=a.prenom+' '+a.nom;delete f.lien;}});
  h._o=true;return h;
};
/** Ce que la presse sait de son contrat (l'organisation ne publie rien). */
function clContratExt(c){const r=graine(c.id+'contrat'),tot=3+Math.floor(r()*3),reste=1+Math.floor(r()*(tot-1)),bourse=(c.champOrg?70:c.mondial<=15?40:22)+Math.floor(r()*12);
  return {tot,reste,bourse:bourse*1000,fin:2027+Math.floor(reste/2)};}
const clContratBase=contratHtml;
contratHtml=function(c){
  if(!clAutre(c))return clContratBase(c);
  const k=clContratExt(c),il=/ F$/.test(c.cat)?'elle':'il',split=COMBATTANTS.filter(x=>x.cat===c.cat).map(x=>({x,s:+x.contrat[1].replace(/\D/g,'')})).sort((a,b)=>b.s-a.s);
  const demande=Math.round(k.bourse*1.25/1000)*1000,place=split.filter(y=>y.s>demande).length+1;
  const fait=(l,v,s)=>`<div class="oct cl-fait"><div class="sous">${l}</div><div class="T">${v}</div>${s?`<div class="sous" style="font-size:17px">${s}</div>`:''}</div>`;
  return `<div style="display:grid;grid-template-columns:1.1fr 1fr;gap:20px;height:100%">
    ${pan(titre('Son contrat',esc(c.org))+`<div class="T" style="font-size:52px;line-height:.9">Sous contrat avec ${esc(c.org)}</div>
      <div class="cl-sf">${fait('Combats restants',`${k.reste} sur ${k.tot}`)}${fait('Bourse',`${nb(k.bourse)} €`,'estimée, par combat')}${fait('Fin prévue',k.fin)}</div>
      <div class="sous" style="font-size:20px">Ces chiffres viennent de la presse : ${esc(c.org)} ne publie pas ses contrats.</div>
      <div class="etiq" style="margin-top:24px">Pour le faire venir chez Split</div>
      <div style="font-size:23px;line-height:1.3;margin-top:8px">${c.depart?`Il est parti de Split en ${c.depart.getFullYear()}. `:''}Il faut attendre la fin de son contrat, en ${k.fin}. Tant qu’${il} est sous contrat, tu ne peux pas lui proposer de combat.</div>
      <button class="bouton petit oct" data-clsuivre="${c.id}" style="margin-top:auto;align-self:flex-start">Le suivre</button>`,'height:100%')}
    ${pan(titre('Chez Split, il coûterait',`${pluriel(c.cat)}`)+`<div class="T" style="font-size:64px;line-height:.9">${nb(demande)} €</div>
      <div class="sous" style="font-size:20px;margin-top:6px">par combat, ce que son agent demanderait</div>
      <div style="font-size:23px;margin:18px 0 12px">Ce serait le ${place===1?'plus gros salaire':`${place}e salaire`} des ${esc(pluriel(c.cat).toLowerCase())} de Split.</div>
      ${split.slice(0,4).map((y,i)=>`<div class="cl-srec"><b class="T" style="font-size:26px">${nb(y.s)} €</b><span class="cl-l1">${lien(y.x)}${y.x.rang==='C'?CL_C:''}</span></div>`).join('')}`,'height:100%')}
  </div>`;
};
const clEchosBase=echosDe;
echosDe=function(c){
  if(!clAutre(c))return clEchosBase(c);
  const st=stats(c),pr=st.fpm>=st.enc,k=clContratExt(c),o=c.org;
  return [
    ['pos','Cage Hebdo','Presse',c.champOrg?`${c.nom}, champion de ${o}`:`${c.nom} monte chez ${o}`,c.depart?`Parti de Split en ${c.depart.getFullYear()}, il est aujourd’hui ${c.mondial}e mondial. À Lyon, certains le regrettent.`:`${c.mondial}e mondial, il est l’un des noms qui comptent chez ${o}.`,'il y a 2 semaines',0,'Julien Morel'],
    ['info','Tableau Noir','Statistiques',pr?'Il touche plus qu’il ne prend':'Il prend plus qu’il ne touche',`${virg(st.fpm)} frappes données par minute, ${virg(st.enc)} reçues.`,'il y a 1 mois',0,''],
    [c.depart?'neg':'pos','Le Forum','Supporters','',c.depart?`Il est parti chez ${o} pour l’argent. Qu’il y reste.`:`${c.nom} contre un gars de Split ? Je paierais ma place.`,'il y a 5 jours',0,'Ring_Side'],
    ['info','Le marché','Contrats','Son contrat',`Il lui reste ${k.reste} combat${k.reste>1?'s':''} chez ${o}. Son agent dit qu’il écoutera toutes les offres.`,'il y a 3 semaines',0,''],
    ['info','Hors de la cage','Portrait','Loin des micros','Discret hors de la salle, il ne donne presque jamais d’interview avant un combat.','',0,'']];
};
const clRelationDeBase=relationDe;
relationDe=function(c){
  if(!clAutre(c))return clRelationDeBase(c);
  const r=graine(c.id+'rel'),pairs=clMonde(c.cat).filter(x=>x.ext&&x.org===c.org&&x!==c),pick=k=>pairs.length?`${pairs[k%pairs.length].prenom} ${pairs[k%pairs.length].nom}`:'—';
  const debut=2026-Math.floor((c.v+c.d)/2.5),m=c.mondial;
  const moments=c.depart?[[String(debut),'Signe chez Split','Premier contrat, en préliminaires'],['2021','Le KO le plus rapide de Split','0:09, toujours le record'],[String(c.depart.getFullYear()),`Part chez ${c.org}`,'Fin de contrat, une meilleure offre'],['2026',`${m}e mondial`,'Son meilleur classement']]
    :[[String(debut),`Signe chez ${c.org}`,'Premier contrat'],[String(debut+2),'Entre dans le top 30 mondial',''],...(c.champOrg?[['2025',`Champion de ${c.org}`,'Sa ceinture']]:[]),['2026',`${m}e mondial`,'']];
  return {rapport:c.depart?1:2,moments,
    entourage:[['Agent',['Marco Bellini','Ana Duarte','Tom Reilly','Yusuf Kaya'][Math.floor(r()*4)],'Écoute les offres'],['Entraîneur',['Diego Alves','Lars Holm','Mehmet Arslan','Kenji Ito'][Math.floor(r()*4)],'Depuis ses débuts'],['Organisation',c.org,c.champOrg?'Champion':'Sous contrat'],['Salle',['Kings Gym','Nova Fight','Iron Temple','Blue Lion MMA'][Math.floor(r()*4)],'']],
    vestiaire:[['Partenaire',pick(1),`Chez ${c.org}`],['Rival',pick(4),'Guerre des mots'],['Ami',pick(7),'Même salle']],
    objectifs:[[c.champOrg?`Défendre sa ceinture chez ${c.org}`:`Devenir champion de ${c.org}`,'cours',''],['Entrer dans le top 10 mondial',m<=10?'atteint':'cours',m<=10?'':`${m}e aujourd’hui`],['Aller au bout de son contrat','cours',`fin ${clContratExt(c).fin}`]],
    mondial:[['2022',m+30],['2023',m+18],['2024',m+9],['2025',m+3],['2026',m]]};
};
/* L'Aperçu : son organisation et son prochain combat là-bas ; on le suit, on ne lui propose pas de combat. */
function clApercuExt(c){
  const enCe=[...document.querySelectorAll('#fiche .etiq')].find(e=>e.textContent==='En ce moment');
  if(enCe&&enCe.nextElementSibling)enCe.nextElementSibling.innerHTML=`<b>Sous contrat avec ${esc(c.org)}</b>`;
  const pro=[...document.querySelectorAll('#fiche .etiq')].find(e=>e.textContent==='Prochain combat');
  if(pro){const box=pro.parentElement;box.querySelector('.T').textContent=c.prochain?c.prochain.date:'Aucun combat prévu';
    if(c.prochain&&!box.querySelector('.sous'))box.insertAdjacentHTML('beforeend',`<div class="sous" style="margin-top:6px">${esc(c.prochain.soiree)}, contre ${lien(c.prochain.adv)}</div>`);
    const b=box.parentElement.querySelector('[data-action="proposer"]');if(b)b.outerHTML=`<button class="bouton petit oct" data-clsuivre="${c.id}">Le suivre</button>`;}
  const t=[...document.querySelectorAll('#fiche .pt h2')].find(e=>e.textContent==='Rapport avec l’organisation');if(t)t.textContent='Rapport avec Split';
}
document.addEventListener('click',e=>{const el=e.target.closest('[data-clsuivre]');if(el){toast(`Tu suis ${esc(parId(el.dataset.clsuivre).prenom)} ${esc(parId(el.dataset.clsuivre).nom)} : il apparaîtra dans « Tes suivis ».`);}});

/* ---- Records : un seul onglet, rangé par type (Q21a). Des valeurs crédibles, le détenteur et ce qu'il devient (R21). ---- */
function clRecords(){
  const ch=msChamp('Poids mouche'),P_=id=>parId(id);
  const R=(v,l,qui,ou,dev,actif)=>({v,l,qui,ou,dev,actif});
  /* Les soirées : le combat principal vient de l'historique du combattant (mêmes soirées, mêmes résultats que sur sa fiche) ; jamais deux fois la même soirée. */
  const vues=new Set(),soir=(v,l,lieu,id,i)=>{const c=parId(id),h=historique(c);while(h[i+1]&&vues.has(h[i].soiree))i++;const f=h[i];vues.add(f.soiree);return {v,l,ou:`${f.soiree} · ${lieu}, ${clMois(f.date)}`,aff:{f,a:c,b:parNom(f.adv,c.cat)}};};
  return [
    ['En un combat',[
      R('0:09','Le KO le plus rapide',parNom('Kamel Yahiaoui','Poids plume'),'Mars 2021 · Split Fight Night 41','Parti chez Pure Impact'),
      R('187','Coups portés en un combat',P_('lecomte'),'Juin 2025 · Split Fight Night 55','Toujours chez Split',1),
      R('9','Amenées au sol en un combat',P_('kessler'),'Avril 2024 · Split Fight Night 49','Toujours chez Split',1),
      R('3','Knockdowns en un combat',P_('nana'),'Nov. 2024 · Split Fight Night 52','Champion des poids légers',1),
    ]],
    ['En carrière',[
      R('19','Victoires chez Split',P_('skerloch'),'De 2012 à 2022','Entraîneur à Brest'),
      R('12','Finitions chez Split',P_('sferhat'),'8 KO et 4 soumissions','Commentateur des soirées de Split'),
      R('22','Combats chez Split',P_('kessler'),'Depuis 2020','Record encore en cours',1),
      R('9','Victoires de suite',P_('shaddou'),'De 2017 à 2020','Agent de combattants'),
    ]],
    ['Ceintures',[
      R('5','Défenses de titre de suite',P_('sgarciaroy'),'Poids pailles, 2016 à 2020','Consultante pour Cage Hebdo'),
      R('40','Mois de règne, le plus long',parNom('Dmitri Zaïtsev','Poids lourd'),'Poids lourds, 2018 à 2021','Parti chez Garden of Blood'),
      R(`${ch.age-1} ans`,'Le plus jeune champion',ch,'Poids mouches, 2026','Toujours champion',1),
      R('2','Ceintures, le seul double champion',P_('sbenyahia'),'Léger en 2019, mi-moyen en 2020','Gérant d’une salle à Marseille'),
    ]],
    ['Soirées',[
      soir('7 812','Spectateurs, la salle la plus pleine','Lille','kessler',1),
      soir('1,9 M€','La plus grosse recette','Paris','nana',2),
      soir('1,4 M','Téléspectateurs, le record','Lyon','nana',3),
      soir('8 / 10','Combats finis avant la limite','Grenoble','belkacem',1),
    ]],
  ];
}
function clRecordsHtml(){
  const item=x=>{
    if(x.aff){const {f,a,b}=x.aff,g=f.res==='v'?a:b,p=g===a?b:a;
      return `<div class="cl-rec"><span class="T cl-rv">${x.v}</span>
      <div class="cl-rt"><div class="cl-rl">${x.l}</div><div class="sous">${esc(x.ou)}</div></div>
      <div class="cl-rt"><div class="cl-rq cl-ell">${lien(g)} bat ${lien(p)}</div><div class="sous">${esc(f.meth[0])}, ${f.rd}${f.rd===1?'er':'e'} round</div></div></div>`;}
    return `<div class="cl-rec"><span class="T cl-rv">${x.v}</span>
      <div class="cl-rt"><div class="cl-rl">${x.l}</div>${x.qui?`<div class="cl-rq">${lien(x.qui)}</div>`:''}</div>
      <div class="cl-rt"><div class="sous">${esc(x.ou)}</div>${x.dev?`<div class="cl-rd ${x.actif?'actif':''}">${x.actif?ico('ok',18,3):''}${esc(x.dev)}</div>`:''}</div></div>`;};
  return `<div class="cl-recs">${clRecords().map(([t,l],i)=>pan(titre(t)+`<div class="defile">${l.map(item).join('')}</div>`,`animation-delay:${i*50}ms`,'apparait')).join('')}</div>`;
}

/* ---- L'écran ---- */
function clOnglets(){
  const o=(v,t,on)=>`<button class="onglet oct ${on?'ouvert':''}" data-clvue="${v}">${t}</button>`,F=S.cl;
  const liste=[['classement','Classement',F.vue==='classement'],['meilleurs','Les meilleurs',F.vue==='meilleurs'],['records','Records',F.vue==='records']];
  return `<div class="cl-haut">${liste.map(x=>o(...x)).join('')}</div>`;
}
function clFiltres(){
  const b=(attr,v,t,on)=>`<button class="bb oct petit ${on?'on':''}" ${attr}="${esc(v)}"><span class="oct">${t}</span></button>`;
  const portee=S.cl.vue==='classement'?`<span class="cl-portee">${b('data-clportee','split','Split',S.cl.portee==='split')}${b('data-clportee','monde','Monde',S.cl.portee==='monde')}</span>`:'';
  return `<div class="eff-filtres">${b('data-clsexe','H','Hommes',S.cl.sexe==='H')}${b('data-clsexe','F','Femmes',S.cl.sexe==='F')}<i class="eff-sep"></i>
    ${CATS[S.cl.sexe].map(([cat,t])=>b('data-clcat',cat,t,clCat()===cat)).join('')}${portee}</div>`;
}
function clHtml(){
  clGarder();const F=S.cl;
  const corps=F.vue==='records'?clRecordsHtml():F.vue==='meilleurs'?(F.stat?clStatHtml():clMeilleursHtml()):clClassementHtml();
  return `<div class="cl">${clOnglets()}${F.vue==='records'?'':clFiltres()}${corps}</div>`;
}

/* ---- Branchement dans le cadre ---- */
const clRendreBase=rendre;
rendre=function(){
  if(S.ecran!=='classements'){clRendreBase();return;}
  rendreBarre();rendreEntete('Classements');$('#alerte').classList.remove('af-al');msAlerte();
  $('#corps').style.top='152px';$('#corps').innerHTML=clHtml();
  $('#zone').classList.toggle('fiche-ouverte',!!S.fiche);
  if(S.cl.anim&&S.cl.vue==='meilleurs'&&!S.cl.stat)clCompteurs();
  S.cl.anim=false;
};
const clAllerBase=aller;
aller=function(ec){
  if(ec!=='classements'){clAllerBase(ec);return;}
  if(S.fiche)fermerFiche(false);
  if(S.ecran!=='classements'){S.hist.push(S.ecran);S.futur=[];}
  S.ecran='classements';S.cl.anim=true;rendre();
};
/* La fiche s'ouvre par-dessus le classement, sans le quitter. */
const clOuvrirBase=ouvrirFiche;
ouvrirFiche=function(id,garderFutur=false){
  if(S.ecran!=='classements'){clOuvrirBase(id,garderFutur);return;}
  if(!garderFutur)S.futur=[];
  if(S.fiche&&S.fiche!==id)S.ficheHist.push(S.fiche);
  S.fiche=id;S.panCat=false;rendre();rendreFiche();setTimeout(()=>$('#fiche').classList.add('ouverte'),30);
};

document.addEventListener('click',e=>{
  const t=e.target;let el;
  if((el=t.closest('[data-clstaff]'))){const c=parId(el.dataset.clstaff);toast(`${esc(c.action)} : écran hors de cette maquette.`);return;}
  if(S.ecran!=='classements')return;
  if(t.closest('#fiche')||t.closest('[data-fiche]'))return;
  const F=S.cl;
  if((el=t.closest('[data-clvue]'))){F.vue=el.dataset.clvue;
    F.stat=null;F.anim=true;rendre();return;}
  if((el=t.closest('[data-clportee]'))){F.portee=el.dataset.clportee;rendre();return;}
  /* Hommes ou Femmes : toutes les catégories du sexe choisi ; une catégorie : elle seule. */
  if((el=t.closest('[data-clsexe]'))){F.sexe=el.dataset.clsexe;F.cats[F.sexe]='toutes';F.anim=true;rendre();return;}
  if((el=t.closest('[data-clcat]'))){F.cats[F.sexe]=el.dataset.clcat;F.anim=true;rendre();return;}
  if((el=t.closest('[data-clstat]'))){F.stat=el.dataset.clstat;rendre();return;}
  if(t.closest('[data-clstatfermer]')){F.stat=null;F.anim=true;rendre();return;}
});

/* ---- Les flèches et le panneau restent sur le classement d'où la fiche a été ouverte (mondial ou Split) ---- */
const clOuvrirMonde=ouvrirFiche;
ouvrirFiche=function(id,g){
  if(!S._clGarde)S.clNavMonde=clAutre(parId(id))||(S.ecran==='classements'&&S.cl.vue==='classement'&&S.cl.portee==='monde'&&!S.fiche);
  S._clGarde=false;clOuvrirMonde(id,g);
};
document.addEventListener('click',e=>{if(e.target.closest('[data-lc]')&&S.clNavMonde)S._clGarde=true;},true);

/* ---- Lancement : ?ecran=classements, options clvue=meilleurs|records, portee=monde, sexe=F, clcat=<catégorie|toutes>, stat=<clé>, fiche=<id> ---- */
window.addEventListener('DOMContentLoaded',()=>{
  const q=new URLSearchParams(location.search);
  if(q.get('ecran')!=='classements')return;
  S.ecran='classements';S.hist=['accueil'];
  if(q.get('clvue'))S.cl.vue=q.get('clvue');
  if(q.get('portee'))S.cl.portee=q.get('portee');
  if(q.get('sexe'))S.cl.sexe=q.get('sexe');
  if(q.get('clcat'))S.cl.cats[S.cl.sexe]=q.get('clcat');
  if(q.get('stat')){S.cl.vue='meilleurs';S.cl.stat=q.get('stat');}
  S.cl.anim=true;rendre();
  if(q.get('fiche'))setTimeout(()=>ouvrirFiche(q.get('fiche')),50);
});
