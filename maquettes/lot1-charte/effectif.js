"use strict";
/* Maquette lot 1 — Effectif (R15) et son infirmerie (Q12b : l'infirmerie fait partie de l'Effectif, un bouton à droite des filtres).
   Chargé après cadre.js et fiche.js : remplace effectifHtml() ; le reste (fiche, Retour, tri par data-tri) est repris tel quel. */

/* ---- Données : états réalistes, peu de refus, et toujours avec une raison (Q15a, Q15b) ---- */
const SOIREE=new Date(2027,1,16);
Object.assign(ETATS,{
  suspendu:['var(--neg)','medical','Suspendu'],
  affiche:['var(--blanc)','calendrier','À l’affiche'],
  refus:['var(--jaune)','alerte','Refuse de combattre'],
});
Object.assign(parId('nana'),{statut:'affiche',affiche:'Combat principal, contre Ilyas Mezouar'});
Object.assign(parId('mezouar'),{statut:'affiche',affiche:'Combat principal, contre Parfait Nana'});
Object.assign(parId('rachidi'),{statut:'affiche',affiche:'Co-principal, contre Lynda Meziane'});
Object.assign(parId('meziane'),{statut:'affiche',affiche:'Co-principal, contre Hajar Rachidi'});
Object.assign(parId('lecomte'),{statut:'suspendu',retour:'6 février'});
Object.assign(parId('kessler'),{statut:'refus',raison:'Attend une prolongation',action:'Proposer'});
Object.assign(parId('diallo'),{raison:'Naissance de son fils. Il reprend l’entraînement en mars.'});
/* Mouvement au classement Split de la catégorie (remplace le rang mondial dans la vue essentielle). */
for(const [id,t] of Object.entries({nana:'=',mezouar:'+1',labbe:'=',bello:'+2',belkacem:'-1',darras:'=',lecomte:'-2',carvalho:'-1',vanbelle:'+1',kessler:'-1',rachidi:'=',meziane:'+1',diallo:'=',rizzo:'+2',musaev:'+1'}))parId(id).tendS=t;
/* Art martial affiché ; la spécialité (c.style, reprise par la fiche) s'ouvre au clic. */
for(const [id,a,sp] of [['nana','Boxe','Bagarreur, pression au centre'],['labbe','Lutte','Lutteur de contrôle'],['bello','Kickboxing','Frappeur de distance'],['mezouar','Jiu-jitsu brésilien','Grappler, finisseur au sol'],
  ['lecomte','Kickboxing','Kickboxeur de volume'],['rachidi','Muay-thaï','Frappeuse explosive'],['meziane','Lutte','Lutteuse de contrôle'],['diallo','Boxe','Boxeur contre-attaquant'],['rizzo','Lutte','Lutteur explosif'],
  ['musaev','Sambo','Sambiste, finit au sol'],['vanbelle','Karaté','Frappeur de distance, très précis'],['darras','Boxe','Boxeur de pression'],['carvalho','Jiu-jitsu brésilien','Spécialiste de la garde'],
  ['belkacem','Kickboxing','Kickboxeur contre-attaquant'],['kessler','Lutte','Lutteur, pression contre la cage']])Object.assign(parId(id),{art:a,style:sp});
for(const [id,sn] of [['rachidi','La Tornade'],['meziane','L’Étau'],['diallo','Le Mur'],['rizzo','Le Furet'],['musaev','Le Sambiste']])parId(id).surnom=sn;
COMBATTANTS.push(
  {id:'abiven',prenom:'Grégoire',nom:'Abiven',surnom:'Le Menhir',cat:'Poids lourd',kg:120,age:33,v:15,d:5,n:0,rang:3,mondial:27,tend:'-3',serie:'vvdvv',statut:'blesse',retour:'septembre',dernier:new Date(2026,9,3),
   taille:'1,93 m',allonge:'1,98 m',garde:'Orthodoxe',depuis:'2021',contrat:[2,'38 000 €'],art:'Lutte',style:'Lutteur, pression contre la cage',tendS:'-2'},
  {id:'roussel',prenom:'Camille',nom:'Roussel',surnom:'La Comète',cat:'Poids coq F',kg:61,age:26,v:9,d:2,n:0,rang:2,mondial:18,tend:'+1',serie:'vdvvv',statut:'blesse',retour:'15 février',dernier:new Date(2026,11,8),
   taille:'1,66 m',allonge:'1,68 m',garde:'Fausse garde',depuis:'2023',contrat:[2,'21 000 €'],art:'Boxe',style:'Boxeuse mobile, en contre',tendS:'='},
);

/* Ce que dit le médecin : une blessure = quoi, quand, où, retour prévu, et où il en est aujourd'hui (phase 0 à 3). */
const PHASES=['Repos','Rééducation','Reprise','Apte'];
const INFIRMERIE=[
  {id:'rizzo',quoi:'Élongation à la cuisse droite',ou:'Au camp, en sparring',debut:new Date(2026,11,28),fin:new Date(2027,1,2),
   phase:2,etape:'Reprise légère',avis:'Il a repris la course. Pas de lutte avant fin janvier.'},
  {id:'lecomte',quoi:'Suspension médicale après un KO',ou:'En combat, au deuxième round',debut:new Date(2026,11,8),fin:new Date(2027,1,6),
   phase:0,etape:'Repos imposé',avis:'60 jours imposés par la commission. Scanner normal. Pas de sparring avant la fin de la suspension.'},
  {id:'roussel',quoi:'Fracture de la main gauche',ou:'En combat, au premier round',debut:new Date(2026,11,8),fin:new Date(2027,1,15),
   phase:1,etape:'Rééducation de la main',avis:'Plâtre retiré. Elle frappe au sac à partir du 1er février.'},
  {id:'abiven',quoi:'Rupture du ligament croisé du genou',ou:'À l’entraînement, en lutte',debut:new Date(2026,10,20),fin:new Date(2027,8,15),
   phase:1,etape:'Rééducation du genou',avis:'Opéré le 2 décembre. Saison presque terminée. Il reste payé jusqu’à la fin de son contrat.'},
];
const A_SURVEILLER=[
  {id:'nana',t:'Trois combats durs en quatorze mois, à 37 ans.',s:'Le médecin conseille trois mois sans sparring dur après son prochain combat.'},
  {id:'bello',t:'Gêne à l’épaule gauche depuis la semaine dernière.',s:'Rien d’officiel. Examen prévu le 18 janvier.'},
];

/* Les catégories du jeu ; celles que la maquette n'a pas remplies reçoivent un effectif fictif stable. */
const CATS={H:[['Poids mouche','Mouche',57],['Poids coq','Coq',61],['Poids plume','Plume',66],['Poids léger','Léger',70],['Poids mi-moyen','Mi-moyen',77],['Poids moyen','Moyen',84],['Poids mi-lourd','Mi-lourd',93],['Poids lourd','Lourd',120]],
  F:[['Poids paille F','Paille',52],['Poids mouche F','Mouche',57],['Poids coq F','Coq',61],['Poids plume F','Plume',66]]};
(function remplir(){
  const PH=['Yanis','Mathis','Bruno','Kamil','Sergueï','Lucas','Ibrahim','Nolan','Marco','Dmitri','Adrien','Tomasz','Mehdi','Joaquim','Arthur','Kofi','Nikola','Hamza','Victor','Ryo','Florian','Dawid','Samuel','Teodor','Rayan','Gaël','Aslan','Paulo','Quentin','Bilal'];
  const PF=['Léa','Inès','Marta','Chloé','Aya','Julia','Sana','Elena','Manon','Yasmine','Alice','Noémie','Kaori','Laura','Salomé','Nadia'];
  const NO=['Moreau','Kovač','Benali','Ferreira','Novak','Garnier','Okafor','Lindqvist','Barbosa','Haddad','Petrov','Marchand','Costa','Nowak','Traoré','Lemaire','Ivanov','Durand','Santos','Keller','Bertin','Sato','Mendes','Rossi','Fabre','Ndiaye','Wojcik','Leclerc','Aydin','Vidal','Gomes','Roux','Brunet','Kaya','Morel','Silva','Faure','Diaz','Mercier','Hamidi'];
  const ST=[['Boxe','Boxeur de pression'],['Lutte','Lutteur de contrôle'],['Kickboxing','Kickboxeur de volume'],['Jiu-jitsu brésilien','Spécialiste de la garde'],['Karaté','Frappeur de distance'],['Lutte','Lutteur, finit au sol'],['Boxe','Boxeur contre-attaquant'],['Muay-thaï','Clinch et coudes'],['Sambo','Sambiste, clés de jambe'],['Judo','Projections et contrôle']];
  const SN=['Le Roc','Le Taureau','La Foudre','Le Mineur','Le Cobra','Le Docteur','Le Gitan','Le Marteau','Le Loup','Le Sage','Le Tank','Le Félin','Le Fantôme','Le Pitbull','L’Ours','Le Chirurgien','Le Corsaire','Le Volcan','Le Duc','Le Scorpion','Le Moine','Le Baron','Le Cyclone','Le Bison','Le Renard','Le Comte','Le Lion','Le Requin','Le Prince','Le Bourreau','Le Bélier','Le Viking du Nord','Le Faucheur','Le Gladiateur','Le Mustang','L’Enclume','Le Boxeur Fou','Le Sorcier','Le Titan','Le Chacal','Le Dragon','L’Ombre','Le Cogneur','Le Diable','Le Silencieux','Le Bulldozer','Le Professeur','Le Matador','Le Tigre','Le Pirate','Le Rocher','Le Kid','Le Héron','Le Soldat','Le Patron','Le Missile','Le Volcan Noir','Le Forgeron','Le Mur de Brest','Le Chat','Le Grizzly','Le Nomade'];
  const SNF=['La Lionne','La Panthère','La Flèche','L’Orage','La Reine','La Lame','La Vipère','La Louve','La Fée','L’Abeille','La Tigresse','L’Éclair','La Mante','La Sirène','La Furie','La Comtesse','La Guêpe','L’Étoile','La Princesse','La Gazelle','La Torpille','La Duchesse','La Bombe','La Rafale','La Muraille','La Patronne','La Boxeuse','La Hyène','L’Aigle','La Fusée','La Cobra','La Brute','La Petite Reine','La Sorcière','La Dame de Fer','La Mitraille','La Gitane','La Corsaire'];
  const snVus=new Set();
  const QUAL=['de Marseille','du Nord','de Dakar','de Belém','des Balkans','de Varsovie','du Port','de Tbilissi','de Bordeaux','des Alpes','de Lisbonne','de Naples','de Casablanca','de Montréal','de Kyiv','de Lagos','de Lille','de Porto','de Séville','de Bastia'];
  let k=0;const vus=new Set(COMBATTANTS.map(c=>c.prenom+c.nom));
  for(const sexe of ['H','F'])for(const [cat,,kg] of CATS[sexe]){
    const pris=new Set(COMBATTANTS.filter(c=>c.cat===cat).map(c=>c.rang));
    /* Comme le jeu (environ 30 par catégorie) : le champion, puis tout l'effectif classé de 1 à 27. */
    const places=['C',...Array.from({length:27},(_,i)=>i+1)];
    for(const place of places){
      if(pris.has(place))continue;
      const rang=typeof place==='string'&&place[0]==='n'?'–':place,num=rang==='C'?0:rang==='–'?15+(+place.slice(1)):rang;
      const r=graine(cat+place),f=sexe==='F',L=f?PF:PH;let pr,no;do{pr=L[Math.floor(r()*L.length)];no=NO[(k++*7+Math.floor(r()*NO.length))%NO.length];}while(vus.has(pr+no));vus.add(pr+no);
      const v=6+Math.floor(r()*14)-Math.floor(num/4),d=1+Math.floor(r()*5),s=['vvvdv','vdvvv','vvdvd','dvvvv','vvvvd','dvdvv','vvvvv','ddvvv'][Math.floor(r()*8)];
      const tend=r()<.35?'=':r()<.6?'+'+(1+Math.floor(r()*3)):'-'+(1+Math.floor(r()*3)),mois=Math.floor(r()*7);
      const t=f?150+kg*.25:155+kg*.27,cm=Math.round(t+r()*6);
      const SL=f?SNF:SN;let sn='';{let i=Math.floor(r()*SL.length),n=0;while(snVus.has(SL[i])&&n++<SL.length)i=(i+1)%SL.length;if(!snVus.has(SL[i])){sn=SL[i];}else{let q=0;do{sn=SL[Math.floor(r()*SL.length)]+' '+QUAL[q++%QUAL.length];}while(snVus.has(sn)&&q<400);}snVus.add(sn);}
      const st=ST[Math.floor(r()*ST.length)];
      COMBATTANTS.push({id:'g'+slug(cat)+place,prenom:pr,nom:no,surnom:sn,cat,kg,age:22+Math.floor(r()*13),v:Math.max(v,s.split('v').length-1+1),d:Math.max(d,s.split('d').length-1),n:0,rang,
        mondial:rang==='C'?6+Math.floor(r()*8):10+num*5+Math.floor(r()*6),tend,serie:s,statut:'dispo',dernier:new Date(2026,11-mois,8),
        taille:`${(cm/100).toFixed(2).replace('.',',')} m`,allonge:`${((cm+2+Math.floor(r()*6))/100).toFixed(2).replace('.',',')} m`,garde:r()<.75?'Orthodoxe':'Fausse garde',
        depuis:String(2019+Math.floor(r()*7)),contrat:[1+Math.floor(r()*4),nb((rang==='C'?45+Math.floor(r()*40):10+Math.floor(r()*20))*1000)+' €'],art:st[0],style:st[1],tendS:rang==='C'||rang==='–'?'=':tend});
    }
  }
})();
/* Le KO de Lecomte doit se retrouver dans son dernier combat, sur la fiche. */
(function(){const h=historique(parId('lecomte'));if(h[0]&&h[0].res==='d')h[0].meth=['KO','coups de poing'];})();

/* ---- Réglages de l'écran : jamais remis à zéro au retour (dossier UI/UX) ---- */
const EFF_CLE='maquette-effectif';
S.eff={onglet:'combattants',sexe:'H',cat:'Poids léger',vue:'essentielle'};
S.artOuvert=new Set();
try{Object.assign(S.eff,JSON.parse(localStorage.getItem(EFF_CLE)||'{}'));}catch(e){}
S.tri={col:'rang',sens:1}; /* à l'ouverture : toujours par rang, du meilleur au moins bon */
function effGarder(){try{localStorage.setItem(EFF_CLE,JSON.stringify(S.eff));}catch(e){}}

/* ---- Colonnes : vue essentielle (8) et vue experte (même structure, le détail en plus) ---- */
const courte=cat=>cat.replace(/^Poids /,'').replace(/ F$/,'').replace(/^./,x=>x.toUpperCase());
const rangN=c=>c.rang==='C'?0:typeof c.rang==='number'?c.rang:99;
const ORDRE_ETAT={dispo:0,affiche:1,refus:2,pause:3,suspendu:4,blesse:5};
const COL_EFF={
  rang:['Rang',120,c=>rangN(c)],
  nom:['Combattant',null,c=>c.nom],
  cat:['Catégorie',120,c=>c.kg],
  age:['Âge',70,c=>c.age],
  bilan:['Palmarès',130,c=>c.v-c.d],
  mondial:['Mondial',140,c=>c.mondial],
  serie:['5 derniers combats',230,c=>[...c.serie].reduce((a,x,i)=>a+(x==='v'?1+i:0),0)],
  dernier:['Dernier combat',200,c=>-c.dernier],
  etat:['État',320,c=>ORDRE_ETAT[c.statut]],
  gabarit:['Gabarit',170,c=>parseFloat(c.allonge.replace(',','.'))],
  garde:['Garde',160,c=>c.garde],
  style:['Art martial',230,c=>c.art],
  contrat:['Contrat',150,c=>c.contrat[0]],
  salaire:['Salaire',160,c=>+c.contrat[1].replace(/\D/g,'')],
  depuis:['Chez Split',140,c=>+c.depuis],
};
const W_EXP={rang:80,age:60,bilan:100,gabarit:150,mondial:110,style:180,contrat:120,salaire:150,etat:210};
/* Largeurs en proportion de la table (1500 px, barre ouverte) : barre réduite, toutes les colonnes s'élargissent ensemble. */
const pct=w=>(w/1500*100).toFixed(2)+'%';
function colonnes(){
  const toutes=S.eff.cat==='toutes';
  const base=S.eff.vue==='experte'?['rang','nom','age','bilan','gabarit','mondial','style','contrat','salaire','etat']:['rang','nom','age','bilan','serie','dernier','etat'];
  if(toutes)base.splice(2,0,'cat');
  return base;
}
/* Série lue de gauche (le plus récent, plein) à droite (le plus ancien, qui s'efface un peu). */
const serie5=s=>`<span class="s5" title="Du plus récent au plus ancien">${[...s].reverse().map((x,i)=>`<span class="marque octr ${x}" style="opacity:${(1-i*.125).toFixed(3)}">${x.toUpperCase()}</span>`).join('')}</span>`;
const rangHtml=c=>`<span class="eff-r">${c.rang==='C'?'<span class="rang-c octr" style="width:44px;height:44px;padding:2px"><span class="octr" style="padding:2px"><b class="octr" style="font-size:26px">C</b></span></span>':`<span class="T eff-rang">${esc(c.rang)}</span>`}${S.eff.vue==='experte'?'':tendHtml(c.tendS||'=')}</span>`;
function tendHtml(t){return t==='='?'<span class="sous">=</span>':t[0]==='+'?`<span style="color:var(--vert);font-weight:700">▲ ${t.slice(1)}</span>`:`<span style="color:var(--neg);font-weight:700">▼ ${t.slice(1)}</span>`;}
function etatHtml(c){
  const [col,i,t]=ETATS[c.statut];
  const det=c.statut==='blesse'||c.statut==='suspendu'?`Retour prévu le ${esc(c.retour)}`:c.statut==='affiche'?esc(c.affiche):c.raison?esc(c.raison):'';
  const act=c.action?`<button class="eff-act" data-eaction="${c.id}">${esc(c.action)} ›</button>`:'';
  return `<div class="eff-etat"><span style="color:${col}">${ico(i,22)}<b>${t}</b></span>${det||act?`<span class="eff-det"><span class="sous" title="${det}">${det}</span>${act}</span>`:''}</div>`;
}
function cellule(c,k){
  switch(k){
    case 'rang':return rangHtml(c);
    case 'nom':return `<div class="eff-nom">${lien(c)}<span class="sous">${c.surnom?`« ${esc(c.surnom)} »`:'&nbsp;'}</span></div>`;
    case 'cat':return esc(courte(c.cat));
    case 'age':return c.age;
    case 'bilan':return `<span class="T" style="font-size:32px">${bilan(c)}</span>`;
    case 'mondial':return `<span style="white-space:nowrap">n° ${c.mondial}&nbsp; ${tendHtml(c.tend)}</span>`;
    case 'serie':return serie5(c.serie);
    case 'dernier':{const m=Math.round((S.date-c.dernier)/864e5/30.44);return m<1?'il y a moins d’un mois':`il y a ${m} mois`;}
    case 'etat':return etatHtml(c);
    case 'gabarit':return `${esc(c.taille)} · ${esc(c.allonge)}<span class="sous" style="display:block;font-size:18px">${esc(c.garde)}</span>`;
    case 'garde':return esc(c.garde);
    case 'style':{const o=S.artOuvert.has(c.id);return `<button class="eff-art" data-eart="${c.id}" title="${o?'Masquer':'Voir'} sa spécialité">${esc(c.art)}</button>${o?`<span class="sous" style="display:block;font-size:18px">${esc(c.style)}</span>`:''}`;}
    case 'contrat':return `${c.contrat[0]} combat${c.contrat[0]>1?'s':''}<span class="sous" style="display:block;font-size:18px">restant${c.contrat[0]>1?'s':''}</span>`;
    case 'salaire':return `${esc(c.contrat[1])}<span class="sous" style="display:block;font-size:18px">par combat</span>`;
    case 'depuis':return esc(c.depuis);
  }
}
function liste(){
  const cats=CATS[S.eff.sexe].map(x=>x[0]);
  const l=COMBATTANTS.filter(c=>S.eff.cat==='toutes'?cats.includes(c.cat):c.cat===S.eff.cat);
  const col=COL_EFF[S.tri.col]?S.tri.col:'rang',f=COL_EFF[col][2];
  return l.sort((a,b)=>{const x=f(a),y=f(b);return ((x>y?1:x<y?-1:0)||(a.kg-b.kg)||(rangN(a)-rangN(b)))*S.tri.sens;});
}

/* ---- Rendu ---- */
const ICO_VUE='<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M3 5h18v14H3zM9 5v14M15 5v14"/></svg>';
function effFiltres(){
  const b=(attr,v,t,on)=>`<button class="bb oct petit ${on?'on':''}" ${attr}="${esc(v)}"><span class="oct">${t}</span></button>`,inf=S.eff.onglet==='infirmerie';
  return `<div class="eff-filtres">${b('data-esexe','H','Hommes',!inf&&S.eff.sexe==='H')}${b('data-esexe','F','Femmes',!inf&&S.eff.sexe==='F')}<i class="eff-sep"></i>
    ${CATS[S.eff.sexe].map(([cat,t])=>b('data-ecat',cat,t,!inf&&S.eff.cat===cat)).join('')}
    <button class="bb oct petit ${inf?'on':''}" data-einf style="margin-left:auto" title="Blessés, suspendus et combattants à surveiller"><span class="oct"><span style="color:var(--neg);display:flex">${ico('medical',22)}</span>Infirmerie <b style="color:var(--neg)">${INFIRMERIE.length}</b></span></button></div>`;
}
function tableau(){
  const cols=colonnes(),l=liste();
  const th=k=>{const [t,w0]=COL_EFF[k],on=S.tri.col===k,w=S.eff.vue==='experte'&&W_EXP[k]||w0;
    return `<th data-tri="${k}" class="${on?'trie':''}" ${w?`style="width:${pct(w)}"`:''}>${t}${on?(S.tri.sens>0?' ▾':' ▴'):''}</th>`;};
  const exp=S.eff.vue==='experte',vue=`<th class="th-vue"><button class="bb oct petit ${exp?'on':''}" data-evue title="${exp?'Revenir à la vue essentielle':'Voir le détail (vue experte)'}"><span class="oct">${ICO_VUE}</span></button></th>`;
  return `<div class="defile eff-defile"><table class="eff-t"><thead><tr>${cols.map(th).join('')}${vue}</tr></thead>
    <tbody>${l.map((c,i)=>`<tr class="apparait" style="animation-delay:${Math.min(i,12)*25}ms">${cols.map(k=>`<td class="c-${k}">${cellule(c,k)}</td>`).join('')}<td></td></tr>`).join('')}</tbody></table></div>`;
}
function semaines(d){const j=Math.round((d-S.date)/864e5);if(j<=0)return'aujourd’hui';if(j<14)return`dans ${j} jours`;const s=Math.round(j/7);return s<9?`dans ${s} semaines`:`dans ${Math.round(j/30.44)} mois`;}
function infirmerieHtml(){
  const ligne=(b,i)=>{const c=parId(b.id),k=Math.max(0,Math.min(1,(S.date-b.debut)/(b.fin-b.debut)));
    return `<div class="inf-l apparait" style="animation-delay:${i*40}ms">
      <div class="eff-nom">${lien(c)}<span class="sous">${esc(c.cat)} · ${rangN(c)===0?'champion':'n° '+c.rang}</span></div>
      <div><div style="font-weight:700;color:var(--neg);display:flex;gap:10px;align-items:center">${ico('medical',20)}${esc(b.quoi)}</div><div class="sous">${esc(b.ou)}, le ${dCourt(b.debut).replace(/ 20\d\d$/,'')}</div></div>
      <div class="conv"><div class="conv-etapes">${PHASES.slice(0,3).map((p,j)=>`<div class="${j<b.phase?'fait':j===b.phase?'ici':''}"><i></i><span>${p}</span></div>`).join('')}</div>
        <div class="conv-fin"><b>Apte le ${dCourt(b.fin).replace(/ 2027$/,'')}</b><span class="sous">${semaines(b.fin)}</span></div></div>
      <div class="inf-avis">${esc(b.avis)}</div></div>`;};
  const surv=a=>{const c=parId(a.id);return `<div class="inf-s"><div style="font-size:24px;font-weight:700">${lien(c)}</div><div style="font-size:21px;margin-top:4px">${esc(a.t)}</div><div class="sous" style="margin-top:4px">${esc(a.s)}</div></div>`;};
  const pause=COMBATTANTS.filter(c=>c.statut==='pause');
  return `<div class="inf-g">
    ${pan(titre('Blessés et suspendus',`${INFIRMERIE.length} indisponibles`)+`<div class="inf-l inf-tete"><span>Combattant</span><span>Blessure</span><span>Convalescence</span></div>
      <div class="defile">${INFIRMERIE.map(ligne).join('')}</div>`,'height:100%','apparait')}
    ${pan(titre('À surveiller')+`<div class="defile">${A_SURVEILLER.map(surv).join('')}
      ${pause.length?`<div class="etiq" style="margin:24px 0 2px">En pause</div>${pause.map(c=>`<div class="inf-s"><div style="font-size:24px;font-weight:700">${lien(c)}</div><div class="sous" style="margin-top:4px">${esc(c.raison||'')}</div></div>`).join('')}`:''}</div>`,'height:100%','apparait')}
  </div>`;
}
function effectifHtml(){
  effGarder();
  return `<div class="eff">${effFiltres()}${S.eff.onglet==='infirmerie'?infirmerieHtml():`<div class="eff-pan">${pan(tableau(),'height:100%')}</div>`}</div>`;
}

/* ---- Clics propres à l'écran (le tri passe par data-tri, déjà géré par cadre/fiche) ---- */
document.addEventListener('click',e=>{
  const t=e.target;let el;
  if(t.closest('[data-einf]')){S.eff.onglet=S.eff.onglet==='infirmerie'?'combattants':'infirmerie';rendre();return;}
  if(t.closest('[data-evue]')){S.eff.vue=S.eff.vue==='experte'?'essentielle':'experte';rendre();return;}
  if((el=t.closest('[data-eart]'))){const id=el.dataset.eart;S.artOuvert.has(id)?S.artOuvert.delete(id):S.artOuvert.add(id);rendre();return;}
  /* Hommes ou Femmes : toutes les catégories du sexe choisi ; une catégorie : elle seule. */
  if((el=t.closest('[data-esexe]'))){S.eff.sexe=el.dataset.esexe;S.eff.cat='toutes';S.eff.onglet='combattants';rendre();return;}
  if((el=t.closest('[data-ecat]'))){S.eff.cat=el.dataset.ecat;S.eff.onglet='combattants';rendre();return;}
  if((el=t.closest('[data-eaction]'))){toast(`Ouvre la négociation avec ${esc(parId(el.dataset.eaction).nom)} : écran Contrats, hors de cette maquette.`);return;}
});
window.addEventListener('DOMContentLoaded',()=>{
  const q=new URLSearchParams(location.search);
  if(q.get('ecran')==='effectif'){S.ecran='effectif';S.hist=['accueil'];}
  if(q.get('eonglet'))S.eff.onglet=q.get('eonglet');
  if(q.get('vue'))S.eff.vue=q.get('vue');
  if(q.get('ecat'))S.eff.cat=q.get('ecat');
  if(q.get('art'))S.artOuvert.add(q.get('art'));
  if(q.get('repli'))document.body.classList.add('repliee');
  rendre();
});
