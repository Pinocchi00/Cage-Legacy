"use strict";
/* Maquette lot 1 — Recrutement (R23 à R25) : un seul écran avec un filtre Libres / Fin de contrat (Q24),
   une fiche courte à droite, puis la négociation façon FM en 2 à 4 échanges (Q25a). « Tu l'as vu » est retiré (Q25b) :
   on connaît le palmarès et les dernières victoires ; le style se débloque à la signature ou par le recruteur.
   Retours du 09/11 : marché varié (espoirs, champions régionaux, vétérans, nouveaux venus), plus de « Tes suivis » ici,
   négociation refaite (où vous en êtes, l'agent et son caractère, réponses animées), une négociation ratée reste close.
   Chargé après classements.js : remplace rendre(), aller(), retour() et la fiche pour l'écran « contrats ». Préfixe rc. */

/* La barre : l'élément « Contrats » devient « Recrutement » (les contrats de Split passent par la fiche et les messages, Q23b, Q23c). */
(function(){const i=ITEMS.findIndex(x=>x[0]==='contrats');if(i>=0)ITEMS[i]=['contrats','Recrutement'];})();
P.oeil='<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>';

/* Les agents ont un caractère : il fixe combien d'offres ils écoutent et la taille de leurs pas (À RELIRE). */
const RC_AGENTS=[
  ['Marco Bellini','Dur en affaires',3,.25],['Ana Duarte','Arrangeante',4,.45],['Tom Reilly','Pressé de conclure',2,.5],['Yusuf Kaya','Dur en affaires',3,.25],
  ['Inès Barrot','Arrangeante',4,.45],['Piotr Zielinski','Pressé de conclure',2,.5],['Sergio Leal','Arrangeant',4,.45],['Karim Ouali','Dur en affaires',3,.25]];
const RC_ARTS={Frappeur:'Boxe',Lutteur:'Lutte',Grappler:'Jiu-jitsu brésilien',Kickboxeur:'Kickboxing'};
const RC_STYLES={Frappeur:'frappeur de pression',Lutteur:'lutteur de contrôle',Grappler:'finit au sol',Kickboxeur:'frappeur de distance'};
/* Petites organisations (inventées) : les champions régionaux qui cherchent une grande scène. */
const RC_REG=['Nordic Cage','Liga Brava','Balkan Fight Night','Arena Iberia','Tokyo Grit','Danube Cage','Atlantic Fight Series','Celtic Combat'];
const RC_PRE_H=['Anton','Bastien','Emre','Lasha','Owen','Rustam','Felipe','Mateo','Sandro','Kyle','Ilias','Damian','Yuto','Liam','Nazar','Cédric','Rafał','Enzo','Kaan','Tariel',
  'Hamid','Viktor','Duarte','Callum','Zaur','Pavel','Lenny','Andrei','Joel','Malik','Goran','Nils','Ricardo','Shamil','Timur','Benoît','Luka','Arda','Kenji','Oskar','Islam','Adama','Ruben','Matías','Erwan'];
const RC_PRE_F=['Mariana','Jade','Olga','Tamires','Ewa','Sakura','Lucie','Camila','Daria','Noor','Ilona','Bianca','Hanna','Paula','Yara','Kim','Maud','Selin','Agnieszka','Rocío','Fatou','Tessa','Mina','Lara'];
const RC_NOMS=['Ferraz','Lazić','Ouedraogo','Rinaldi','Haas','Kerimov','Doyle','Salazar','Marek','Vukovic','Okoye','Bardin','Esposito','Iliev','Lund','Quintero','Gashi','Fontaine','Hollis','Matsui',
  'Zapata','Berisha','Konaté','Strand','Pereira','Novotny','Aliev','Carrel','Dimitrov','Oliveira','Kühn','Sabri','Taylor','Moura','Grenier','Zorić','Mbaye','Lindholm','Rocha','Aksoy',
  'Baranov','Cissé','Delmas','Ekström','Faria','Gutiérrez','Hadžić','Ibáñez','Jovanović','Kaminski','Laurent','Magomedov','Nkosi','Orlov','Pacheco','Quiroga','Rahimi','Sokolov','Tavares','Uçar',
  'Vasquez','Walsh','Yamada','Zaragoza','Abidi','Bianchi','Coelho','Duval','Eriksen','Fofana','Gallo','Horvat','Iqbal','Janssen'];
const RC_MOIS=['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
const rcJour=d=>`${d.getDate()} ${RC_MOIS[d.getMonth()]}`;
const rc1000=x=>Math.max(0,Math.round(x/1000)*1000);
const rcIl=c=>/ F$/.test(c.cat)?'elle':'il';
const rcIL=c=>/ F$/.test(c.cat)?'Elle':'Il';
const rcLui=c=>/ F$/.test(c.cat)?'elle':'lui';
const rcE=c=>/ F$/.test(c.cat)?'e':'';
const rcRang=c=>c.nonClasse?'non classé'+rcE(c):`n° ${c.mondial}`;

/* ---- Ce qu'il demande : le niveau et le profil font le prix ---- */
function rcDemande(c,profil){
  const r=graine(c.id+'demande'),m=c.mondial;
  let b=profil==='espoir'?8+r()*4:profil==='regional'?10+r()*5:profil==='veteran'?14+r()*7:profil==='ancien'?22+r()*8
    :m<=15?42+r()*14:m<=30?27+r()*10:m<=60?17+r()*9:10+r()*8;
  b=rc1000(b*1000);
  const combats=profil==='espoir'?5:profil==='veteran'||profil==='ancien'?2+Math.floor(r()*2):3+Math.floor(r()*3);
  return {bourse:b,combats,vic:b,sig:rc1000(b*(.3+r()*.25)),dmd:null};
}
/* Ses demandes (le mot « promesse » n'apparaît jamais) : 1 à 3 par combattant, selon son profil.
   Poids : « il y tient » (fort), « ça compte » (moyen), « un souhait » (léger). Seul le haut du classement demande le titre. */
const RC_POIDS={fort:['Il y tient',.86],moyen:['Ça compte',.94],leger:['Un souhait',.98]};
function rcDemandes(c,x){
  /* Ce qu'un combattant négocie vraiment dans un contrat : le titre et la tête d'affiche pour les meilleurs,
     de l'activité garantie, une porte de sortie, ses sponsors, son équipe, le droit de boxer ailleurs. */
  const r=graine(c.id+'demandes'),pf=x.profil,m=c.nonClasse?999:c.mondial,l=[],pays=origineDe(c)[1];
  if(m<=10)l.push({id:'titre',t:'Une chance au titre avant fin 2028',p:'fort'});
  else if(pf==='ancien')l.push({id:'titre',t:'Une chance au titre s’il gagne ses deux premiers combats',p:'moyen'});
  const opt=[];
  if(m<=15)opt.push({id:'principal',t:'Être en tête d’affiche d’une soirée dans l’année',p:'moyen'});
  if(['espoir','regional','ex'].includes(pf))opt.push({id:'activite',t:'Au moins trois combats par an',p:'moyen'});
  if(['veteran','ex','ancien'].includes(pf)||m<=30)opt.push({id:'sortie',t:'Pouvoir partir s’il reste six mois sans combat',p:'moyen'});
  if(m<=60||pf==='ancien')opt.push({id:'sponsors',t:'Garder ses propres sponsors',p:'leger'});
  opt.push({id:'equipe',t:'Le voyage et l’hôtel pour trois personnes de son équipe',p:'leger'});
  opt.push({id:'salle',t:'Ne jamais affronter un combattant de sa salle',p:'leger'});
  if(c.style==='Frappeur'||c.style==='Kickboxeur')opt.push({id:'boxe',t:'Pouvoir faire un combat de boxe anglaise ailleurs',p:'leger'});
  if(pays!=='France')opt.push({id:'pays',t:`Combattre une fois dans son pays (${pays})`,p:'leger'});
  if(['veteran','espoir'].includes(pf))opt.push({id:'categorie',t:'Pouvoir changer de catégorie',p:'leger'});
  opt.sort(()=>r()-.5);
  const n=Math.max(1,(r()<.3?1:r()<.75?2:3)-l.length);
  return l.concat(opt.slice(0,n));
}

/* ---- Le marché ---- */
const RC=[];
const rcDe=id=>RC.find(x=>x.id===id);
const rcAgent=(r)=>RC_AGENTS[Math.floor(r()*RC_AGENTS.length)];
(function(){
  const PRIS=new Set(),NOMS=new Set();
  for(const sexe of ['H','F'])for(const [cat] of CATS[sexe]){
    const monde=clMonde(cat);
    monde.forEach(x=>{PRIS.add(x.prenom+' '+x.nom);});
    /* Fin de contrat : un dernier combat à faire chez son organisation (mêmes chiffres que l'onglet Contrat de sa fiche). */
    const fins=monde.filter(c=>c.ext&&!c.champOrg&&!c.staff&&c.mondial>=6&&clContratExt(c).reste===1).slice(0,sexe==='H'?4:2);
    fins.forEach(c=>{const r=graine(c.id+'fin');
      c.art=c.art||RC_ARTS[c.style]||'Boxe';
      const prof=c.age>=34?'veteran':c.mondial<=15?'haut':'';
      RC.push({id:c.id,type:'fin',profil:prof,fin:c.prochain?`après le ${c.prochain.date}`:`en ${['mars','avril','mai','juin'][Math.floor(r()*4)]} 2027`,
        tag:c.mondial<=15?`n° ${c.mondial} mondial`:`chez ${c.org}`,dem:rcDemande(c,''),agent:rcAgent(r),vu:null,etat:null});});
    /* Libres : des profils différents dans chaque catégorie, jamais deux fois le même nom dans tout le marché. */
    const f=sexe==='F',P=f?RC_PRE_F:RC_PRE_H,sl=f?CL_SURN_F:CL_SURN_H,snPris=new Set(monde.map(x=>x.surnom));
    const profils=sexe==='H'?['ex','regional','veteran','espoir','ex']:['ex','regional','espoir'];
    if(graine(cat+'ancien')()<.35)profils[profils.length-1]='ancien';
    const kg=(COMBATTANTS.find(c=>c.cat===cat)||{}).kg||70;
    profils.forEach((pf,i)=>{
      const r=graine(cat+'libre'+i);let pr,no,k=0;
      do{pr=P[Math.floor(r()*P.length)];no=RC_NOMS[Math.floor(r()*RC_NOMS.length)];}while((PRIS.has(pr+' '+no)||NOMS.has(no))&&k++<300);
      PRIS.add(pr+' '+no);NOMS.add(no);
      let sn=sl[Math.floor(r()*sl.length)];k=0;while(snPris.has(sn)&&k++<sl.length)sn=sl[(sl.indexOf(sn)+1)%sl.length];snPris.add(sn);
      const st=['Frappeur','Lutteur','Grappler','Kickboxeur'][Math.floor(r()*4)];
      const big=CL_ORGS[Math.floor(r()*CL_ORGS.length)],reg=RC_REG[Math.floor(r()*RC_REG.length)];
      /* Profil : âge, bilan, série et organisation d'où il vient. */
      const P2={
        ex:{age:26+Math.floor(r()*8),v:10+Math.floor(r()*8),d:3+Math.floor(r()*3),s:['vvvdd','vvdvd','vdvdd','vvvvd'][Math.floor(r()*4)],org:big,m:62+Math.floor(r()*60)},
        regional:{age:23+Math.floor(r()*5),v:8+Math.floor(r()*4),d:Math.floor(r()*2),s:['vvvvv','vdvvv','vvvvv'][Math.floor(r()*3)],org:reg,m:0},
        veteran:{age:34+Math.floor(r()*4),v:19+Math.floor(r()*7),d:6+Math.floor(r()*3),s:['vdvdd','vvddv','dvvdd'][Math.floor(r()*3)],org:big,m:80+Math.floor(r()*50)},
        espoir:{age:21+Math.floor(r()*3),v:4+Math.floor(r()*3),d:0,s:'vvvvv',org:reg,m:0},
        ancien:{age:35+Math.floor(r()*3),v:22+Math.floor(r()*5),d:7+Math.floor(r()*3),s:['dvddv','vdvdd'][Math.floor(r()*2)],org:big,m:70+Math.floor(r()*30)},
      }[pf];
      /* Série tirée selon le profil (du plus ancien au plus récent) : un libéré finit souvent sur une défaite. */
      const pv={ex:.62,regional:.85,veteran:.5,espoir:1,ancien:.45}[pf];
      let sa=Array.from({length:5},()=>r()<pv?'v':'d');if(pf==='ex'||pf==='veteran'||pf==='ancien')sa[4]='d';if(pf==='ex'&&r()<.5)sa[3]='d';
      /* La série colle au palmarès : jamais plus de défaites qu'il n'en a. */
      let nd0=sa.filter(z=>z==='d').length;for(let j=0;j<5&&nd0>P2.d;j++)if(sa[j]==='d'){sa[j]='v';nd0--;}
      const v=pf==='espoir'?P2.v:P2.v-(f?3:0),serie=sa.join('');
      const recents=i===1||(i===0&&cat==='Poids moyen');
      const depuis=recents?new Date(2027,0,5+Math.floor(r()*6)):new Date(2026,8+Math.floor(r()*4),2+Math.floor(r()*26));
      const meilleur=8+Math.floor(r()*16);
      const c={id:'r'+slug(cat)+i,prenom:pr,nom:no,surnom:sn,cat,kg,age:P2.age,v,d:P2.d,n:0,rang:'–',mondial:P2.m||300+i,nonClasse:!P2.m,tend:'=',serie,statut:'dispo',
        dernier:new Date(depuis.getTime()-864e5*(10+Math.floor(r()*40))),taille:'1,7'+Math.floor(r()*9)+' m',allonge:'1,8'+Math.floor(r()*5)+' m',garde:r()<.75?'Orthodoxe':'Fausse garde',
        depuis:'—',contrat:[0,'—'],style:st,art:RC_ARTS[st],ext:true,org:P2.org,libre:depuis,dc:{meth:serie.slice(-1)==='v'?'Décision':'KO'}};
      c.dc.adv=monde[(i*7+5)%monde.length];
      EXT.push(c);
      const nd=(serie.match(/d+$/)||[''])[0].length,il=f?'elle':'il',e=f?'e':'';
      const tag={ex:`ex-${P2.org}`,regional:`champion${e} de ${reg}`,veteran:`ex-n° ${meilleur} mondial`,espoir:`invaincu${e}, ${v}-0`,ancien:`ancien${e} champion${e}`}[pf];
      const raison={ex:nd?`${P2.org} ne l’a pas prolongé${e} après ${nd>1?'deux défaites':'une défaite'}.`:`Pas d’accord avec ${P2.org} sur son salaire.`,
        regional:`Champion${e} de ${reg}, ${il} veut une grande organisation.`,veteran:`Ancien${e} n° ${meilleur} mondial, ${il} cherche un dernier contrat.`,
        espoir:`Pro depuis deux ans, personne ne l’a encore signé${e}.`,ancien:`Ancien${e} champion${e} de ${big}, ${il} veut finir sur une belle soirée.`}[pf];
      RC.push({id:c.id,type:'libre',profil:pf,tag,raison,dem:rcDemande(c,pf),agent:rcAgent(r),vu:null,etat:null});
    });
  }
  /* Deux dossiers écrits à la main chez les poids légers (À RELIRE). */
  const t=parId('rpoidsleger0');
  Object.assign(t,{prenom:'Tiago',nom:'Ferraz',surnom:'O Martelo',age:29,v:14,d:3,serie:'vvvdd',mondial:64,nonClasse:false,org:'Pure Impact',libre:new Date(2026,10,18),style:'Kickboxeur',art:'Muay-thaï',
    dernier:new Date(2026,9,24),taille:'1,78 m',allonge:'1,83 m',garde:'Orthodoxe'});
  Object.assign(rcDe(t.id),{dem:{bourse:24000,combats:4,vic:24000,sig:10000,dmd:[{id:'activite',t:'Au moins trois combats par an',p:'moyen'},{id:'sponsors',t:'Garder ses propres sponsors',p:'leger'}]},agent:RC_AGENTS[1],tag:'ex-Pure Impact',
    raison:'Pure Impact ne l’a pas prolongé après deux défaites.',veut:['Être payé comme un titulaire','Combattre souvent : quatre combats par an']});
  const fin=RC.find(x=>x.type==='fin'&&parId(x.id).cat==='Poids léger');
  if(fin){Object.assign(fin,{vu:new Date(2027,0,4),agent:RC_AGENTS[0],
    avis:'Très propre debout, il ne se fatigue pas. Il n’aime pas qu’on le mette dos à la cage : c’est là qu’on le bat.',
    veut:['Une chance au titre avant la fin 2028','Rester au-dessus de 35 000 € par combat']});
    Object.assign(fin.dem,{bourse:38000,combats:4,vic:38000,sig:15000,dmd:[{id:'titre',t:'Une chance au titre avant fin 2028',p:'fort'},{id:'principal',t:'Être en tête d’affiche d’une soirée dans l’année',p:'leger'},{id:'equipe',t:'Le voyage et l’hôtel pour trois personnes de son équipe',p:'leger'}]});}
  RC.forEach(x=>{x.patience=x.agent[2];if(!x.dem.dmd)x.dem.dmd=rcDemandes(parId(x.id),x);x.nouveau=x.type==='libre'&&(S.date-parId(x.id).libre)<864e5*10;});
})();

/* ---- Les dossiers (offres, accords, refus) sont gardés, même en rechargeant la page ---- */
const RC_DOS='maquette-recrutement-dossiers';
function rcSauver(){try{const o={};RC.forEach(x=>{if(x.etat||x.nego)o[x.id]={etat:x.etat,nego:x.nego,patience:x.patience,retour:x.retour,rapport:x.rapport};});localStorage.setItem(RC_DOS,JSON.stringify(o));}catch(e){}}
function rcCharger(){try{const o=JSON.parse(localStorage.getItem(RC_DOS)||'{}');for(const [id,v] of Object.entries(o)){const x=rcDe(id);if(!x)continue;
  Object.assign(x,v);if(v.retour)x.retour=new Date(v.retour);if(v.rapport)x.rapport=new Date(v.rapport);}}catch(e){}}

/* ---- Réglages gardés au retour (dossier UI/UX) ---- */
const RC_CLE='maquette-recrutement';
S.rc={statut:'tous',sexe:'H',cat:'Poids léger',tri:{col:'mondial',sens:1},sel:null,nego:null,confirmer:false,attente:false,suivis:[]};
try{const g=JSON.parse(localStorage.getItem(RC_CLE)||'{}');['statut','sexe','cat','tri'].forEach(k=>{if(g[k]!==undefined)S.rc[k]=g[k];});}catch(e){}
function rcGarder(){try{const {statut,sexe,cat,tri}=S.rc;localStorage.setItem(RC_CLE,JSON.stringify({statut,sexe,cat,tri}));}catch(e){}}

/* ---- Liste ---- */
const rcCats=()=>CATS[S.rc.sexe].map(x=>x[0]);
function rcListe(){
  const cats=rcCats(),F=S.rc;
  const l=RC.filter(x=>{const c=parId(x.id);return (F.cat==='toutes'?cats.includes(c.cat):c.cat===F.cat)&&(F.statut==='tous'||(F.statut==='libres'?x.type==='libre':x.type==='fin'));});
  const col=RC_COL[F.tri.col]?F.tri.col:'mondial',f=RC_COL[col][2];
  return l.sort((a,b)=>{const x=f(a),y=f(b);return ((x>y?1:x<y?-1:0)||(parId(a.id).mondial-parId(b.id).mondial))*F.tri.sens;});
}
const RC_COL={
  nom:['Combattant','minmax(0,1.35fr)',x=>parId(x.id).nom],
  cat:['Catégorie','104px',x=>parId(x.id).kg],
  age:['Âge','56px',x=>parId(x.id).age],
  bilan:['Palmarès','104px',x=>parId(x.id).v-parId(x.id).d],
  mondial:['Mondial','120px',x=>parId(x.id).mondial],
  serie:['5 derniers combats','184px',x=>[...parId(x.id).serie].reverse().reduce((a,v,i)=>a+(v==='v'?5-i:0),0)],
  situation:['Situation','minmax(0,1.3fr)',x=>x.type==='libre'?0:1],
  demande:['Il demande','122px',x=>x.dem.bourse],
};
const rcCols=()=>S.rc.cat==='toutes'?['nom','cat','age','bilan','mondial','serie','situation','demande']:['nom','age','bilan','mondial','serie','situation','demande'];
const rcGrille=()=>rcCols().map(k=>RC_COL[k][1]).join(' ');

/* Où en est le dossier : la couleur dit si c'est fait (vert), raté (rouge) ou à toi (jaune). */
function rcEtatHtml(x){
  switch(x.etat){
    case 'cours':return '<span style="color:var(--jaune);font-weight:700">Négociation en cours</span>';
    case 'accord':return '<span style="color:var(--vert);font-weight:700">Accord trouvé</span>';
    case 'signe':return '<span style="color:var(--vert);font-weight:700">Signé chez Split</span>';
    case 'refus':return `<span style="color:var(--neg);font-weight:700">Pas d’accord</span>`;
    case 'recruteur':return '<span>Ton recruteur y va</span>';
  }
  return '';
}
function rcSituation(x){
  const c=parId(x.id),e=rcEtatHtml(x);
  const l1=x.type==='libre'?`<b>Libre</b>`:`<b>${esc(c.org)}</b>`;
  const l2=e||`<span class="sous">${x.type==='libre'?esc(x.tag):`libre ${esc(x.fin)}`}</span>`;
  return `<div class="rc-2l"><span class="rc-ell">${l1}</span><span class="rc-ell" style="font-size:18px">${l2}</span></div>`;
}
function rcCellule(x,k){
  const c=parId(x.id);
  switch(k){
    case 'nom':return `<div class="rc-nomc"><div class="eff-nom">${lien(c)}<span class="sous">« ${esc(c.surnom)} »${x.nouveau&&!x.etat?' <span class="rc-neuf">Nouveau</span>':''}${x.vu?` <span class="rc-vu" title="Rapport de ton recruteur, ${rcJour(x.vu)}">${ico('oeil',18)}</span>`:''}</span></div></div>`;
    case 'cat':return esc(courte(c.cat));
    case 'age':return c.age;
    case 'bilan':return `<span class="T" style="font-size:30px">${bilan(c)}</span>`;
    case 'mondial':return c.nonClasse?'<span class="sous">non classé</span>':`n° ${c.mondial}`;
    case 'serie':return serie5(c.serie);
    case 'situation':return rcSituation(x);
    case 'demande':return `<div class="rc-2l"><b>${nb(x.dem.bourse)} €</b><span class="sous" style="font-size:18px">par combat</span></div>`;
  }
}
function rcTableau(){
  const l=rcListe(),F=S.rc;
  if(!F.sel||!l.some(x=>x.id===F.sel))F.sel=l[0]&&l[0].id;
  const th=k=>{const on=F.tri.col===k;return `<button class="rc-th ${on?'trie':''}" data-rctri="${k}">${RC_COL[k][0]}${on?(F.tri.sens>0?' ▾':' ▴'):''}</button>`;};
  const vide=`<div class="rc-vide">Personne dans cette catégorie pour l’instant.</div>`;
  return pan(`<div class="rc-tete" style="grid-template-columns:${rcGrille()}">${rcCols().map(th).join('')}</div>
    <div class="defile rc-liste">${l.length?l.map((x,i)=>`<div class="rc-l oct ${x.id===F.sel?'sel':''} apparait" data-rcsel="${x.id}" style="animation-delay:${Math.min(i,10)*25}ms">
      <div class="rc-li oct" style="grid-template-columns:${rcGrille()}">${rcCols().map(k=>`<div class="rc-c c-${k}">${rcCellule(x,k)}</div>`).join('')}</div></div>`).join(''):vide}</div>`,'height:100%');
}

/* ---- Fiche courte à droite ---- */
const rcFait=(l,v,s='')=>`<div class="oct rc-fait"><div class="sous">${l}</div><div class="T">${v}</div>${s?`<div class="sous" style="font-size:17px">${s}</div>`:''}</div>`;
function rcVictoires(c){
  return historique(c).filter(f=>f.res==='v').slice(0,3).map(f=>{const a=parNom(f.adv,c.cat);
    return `<div class="rc-vic"><span class="sous">${rcJour(f.date)} ${f.date.getFullYear()}</span><span><b>${esc(f.meth[0])}</b>${f.rd?` <span class="sous">· R${f.rd}</span>`:''}</span><span class="rc-ell">${lien(a)}</span></div>`;}).join('')
    ||'<div class="sous">Aucune victoire sur ses derniers combats.</div>';
}
function rcFicheCourte(){
  const x=rcDe(S.rc.sel);if(!x)return pan('<div class="rc-vide">Choisis un combattant.</div>','height:100%');
  const c=parId(x.id),il=rcIl(c),o=origineDe(c),suivi=S.rc.suivis.includes(c.id);
  const situ=x.type==='libre'?`Libre depuis le ${rcJour(c.libre)} · <span class="sous">${esc(x.tag)}</span>`:`${esc(c.org)} · libre ${esc(x.fin)}`;
  const style=x.vu?`<div class="rc-bloc"><div class="etiq">Son style <span class="rc-date">rapport du ${rcJour(x.vu)}</span></div>
      <div style="font-size:23px;margin-top:6px"><b>${esc(c.art)}</b> · ${esc(RC_STYLES[c.style]||c.style)}</div></div>`
    :x.etat==='recruteur'?`<div class="rc-bloc"><div class="etiq">Son style</div><div style="font-size:22px;margin-top:6px">Ton recruteur part le voir. Rapport vers le ${rcJour(x.rapport)}.</div></div>`
    :`<div class="rc-bloc"><div class="etiq">Son style</div><div class="rc-cache"><span class="sous">Personne ne l’a encore vu de près.</span>
      <button class="bb oct petit" data-rcenvoyer="${c.id}"><span class="oct">${ico('oeil',20)}Envoyer le recruteur</span></button></div></div>`;
  const act=x.etat==='signe'?`<div class="rc-fin" style="color:var(--vert)">${ico('ok',22)} Signé : ${il} rejoint l’effectif.</div>`
    :x.etat==='accord'?`<div class="rc-fin" style="color:var(--vert)">${ico('ok',22)} Accord : ${il} signe ${esc(x.fin)}.</div>`
    :x.etat==='refus'?`<div class="rc-fin" style="color:var(--neg)">Pas d’accord. Son agent ne reprendra pas avant le ${rcJour(x.retour)}.</div>`
    :`<button class="bouton jaune cj" style="--c:14px;height:58px;font-size:32px" data-rcoffre="${c.id}">${x.etat==='cours'?'Reprendre la négociation':'Faire une offre'}</button>`;
  return pan(`<div class="rc-fc apparait" data-cle="${c.id}">
    <div class="rc-fc-h"><div style="min-width:0"><div class="rc-pre">${esc(c.prenom)} <span>« ${esc(c.surnom)} »</span></div>
      <div class="T rc-grand nom" data-fiche="${c.id}">${esc(c.nom)}</div>
      <div class="sous" style="margin-top:6px">${esc(courte(c.cat))} · ${c.age} ans · ${esc(o[0])}, ${esc(o[1])}</div></div></div>
    <div class="rc-sit">${situ}</div>
    <div class="rc-mil"><div class="rc-faits">${rcFait('Palmarès',bilan(c))}${rcFait('Mondial',`<span style="text-transform:none">${rcRang(c)}</span>`)}${rcFait('Gabarit',esc(c.taille),`allonge ${esc(c.allonge)}`)}</div>
    <div class="rc-bloc"><div class="etiq">Ses dernières victoires</div>${rcVictoires(c)}</div>
    ${style}</div>
    <div class="rc-dem"><div><div class="etiq">Il demande</div><div class="T" style="font-size:46px;margin-top:6px">${nb(x.dem.bourse)} €</div>
      <div class="sous">par combat · ${x.dem.combats} combats · ${x.dem.dmd.length} demande${x.dem.dmd.length>1?'s':''}</div></div>
      <div style="text-align:right"><div class="etiq">Son agent</div><div style="font-size:23px;font-weight:700;margin-top:6px">${esc(x.agent[0])}</div><div class="sous" style="font-size:18px">${esc(x.agent[1])}</div></div></div>
    <div class="rc-actions">${act}<button class="bb oct petit ${suivi?'on':''}" data-rcsuivre="${c.id}"><span class="oct">${suivi?'Suivi':'Suivre'}</span></button></div>
  </div>`,'height:100%');
}

/* ---- Négociation (Q25a) ---- */
const RC_LEV=[['bourse','Bourse','par combat'],['combats','Combats','sur le contrat'],['vic','Prime de victoire','par victoire'],['sig','Prime de signature','une fois']];
function rcOuvrirNego(id){
  const x=rcDe(id);if(!x)return;
  if(!x.nego){const d=x.dem;
    x.nego={dem:{...d,dmd:[...d.dmd]},dem0:{...d},demPrev:null,offre:{bourse:rc1000(d.bourse*.9),combats:d.combats,vic:rc1000(d.vic*.9),sig:rc1000(d.sig*.6),eng:[]},ech:0,fini:null,score:null,prev:null,
      log:[{qui:'lui',t:rcPhrase(x,'ouverture')}]};
    if(!x.etat||x.etat==='recruteur')x.etat='cours';}
  S.rc.sel=id;S.rc.nego=id;S.rc.confirmer=false;S.rc.anim=true;rendre();
}
function rcPhrase(x,cas,o){
  const c=parId(x.id),p=c.prenom,d=x.nego?x.nego.dem:x.dem,il=rcIl(c),IL=rcIL(c),e=rcE(c);
  switch(cas){
    case 'ouverture':return `${p} veut ${nb(d.bourse)} € par combat sur ${d.combats} combats, autant à la victoire, et ${nb(d.sig)} € à la signature.${d.dmd.length?` ${IL} a aussi ${d.dmd.length>1?d.dmd.length+' demandes':'une demande'}.`:''}`;
    case 'proche':return `On y est presque. Encore un effort et on signe.`;
    case 'moyen':return `Ce n’est pas assez pour ${il==='elle'?'une combattante':'un combattant'} de son niveau. Voilà où on peut descendre.`;
    case 'fort':{const f=d.dmd.find(z=>z.p==='fort'&&!(o.eng||[]).includes(z.id));return `Pour ${p}, un point n’est pas négociable : ${f?f.t.charAt(0).toLowerCase()+f.t.slice(1):''}. Le reste peut se discuter.`;}
    case 'combats':return `Sur l’argent, on est d’accord. ${p} veut ${d.combats} combats, pas ${o.combats}.`;
    case 'compromis':return `On fait un pas vers vous. Voilà ce qu’on peut accepter.`;
    case 'meme':return `C’est la même offre. Si vous ne bougez pas, on ne bouge pas.`;
    case 'loin':return `Ce n’est pas sérieux. Revenez avec une vraie offre.`;
    case 'dernier':return `${IL} a d’autres pistes. Votre prochaine offre sera la dernière.`;
    case 'accord':return `Ça nous va. ${p} est content${e} de venir chez Split.`;
    case 'refus':return `On s’arrête là. ${p} va voir ailleurs.`;
  }
}
/** Ce que l'agent pense de l'offre : 1 = tout ce qu'il demande. La chance au titre pèse lourd quand il la veut. */
function rcScore(o,d){
  const b=Math.min(1.15,o.bourse/d.bourse),v=d.vic?Math.min(1.15,o.vic/d.vic):1,s=d.sig?Math.min(1.2,o.sig/d.sig):1;
  const dm=(d.dmd||[]).reduce((a,z)=>a*((o.eng||[]).includes(z.id)?1:RC_POIDS[z.p][1]),1);
  return (b*.55+v*.25+s*.2)*dm*(1-.03*Math.abs(o.combats-d.combats));
}
/** Ce sur quoi vous n'êtes pas encore d'accord. */
const rcEcarts=(o,d)=>['bourse','combats','vic','sig'].filter(k=>k==='combats'?o.combats!==d.combats:o[k]<d[k]).concat((d.dmd||[]).filter(z=>!(o.eng||[]).includes(z.id)).map(z=>'dm:'+z.id));
/** Tu fais ton offre ; l'agent réfléchit un instant, puis répond. Après son avertissement, l'offre suivante est la dernière. */
function rcProposer(direct=false){
  const x=rcDe(S.rc.nego),N=x.nego;if(N.fini||S.rc.attente)return;
  const o={...N.offre,eng:[...N.offre.eng]};N.ech++;N.log.push({qui:'toi',o,ech:N.ech});
  const repondre=()=>{
    const d=N.dem,sc=rcScore(o,d);N.prev=N.score;N.score=sc;N.demPrev={...d};
    if(sc>=.97){N.fini='accord';N.log.push({qui:'lui',t:rcPhrase(x,'accord'),ok:true});}
    else if(N.ech>=x.patience){N.fini='refus';x.etat='refus';x.retour=new Date(S.date.getTime()+864e5*60);N.log.push({qui:'lui',t:rcPhrase(x,'refus'),non:true});}
    /* « Pas sérieux » ne juge que l'argent : refuser une demande se discute, sans l'agacer. */
    else if(rcScore({...o,eng:d.dmd.map(z=>z.id)},d)<.72){N.log.push({qui:'lui',t:rcPhrase(x,'loin')});x.patience=Math.max(N.ech+1,x.patience-1);}
    else if(N.avant&&rcScore(o,d)<=rcScore(N.avant,d)+.005){N.log.push({qui:'lui',t:rcPhrase(x,'meme')});}
    else{
      const pas=(sc>=.93?1.6:1)*x.agent[3];
      /* Il ne descend jamais sous son plancher (88 % de sa demande de départ). */
      const d0=N.dem0||x.dem;['bourse','vic','sig'].forEach(k=>{if(o[k]<d[k])d[k]=Math.max(rc1000(d0[k]*.88),rc1000(d[k]-(d[k]-o[k])*pas));});
      /* Il peut renoncer à une demande légère, puis à une qui compte ; jamais à celle à laquelle il tient. */
      const lache=d.dmd.filter(z=>!o.eng.includes(z.id)).find(z=>z.p==='leger'&&sc>=.88||z.p==='moyen'&&sc>=.93&&N.ech>=2);
      if(lache){d.dmd=d.dmd.filter(z=>z!==lache);(N.lache=N.lache||[]).push(lache);}
      /* Les combats aussi se discutent : il fait un pas vers ton nombre. */
      if(o.combats!==d.combats&&sc>=.8)d.combats+=Math.sign(o.combats-d.combats)*Math.max(1,Math.floor(Math.abs(o.combats-d.combats)/2));
      const reste=rcEcarts(o,d),cas=d.dmd.some(z=>z.p==='fort'&&!o.eng.includes(z.id))?'fort':reste.length===1&&reste[0]==='combats'?'combats':sc>=.93?'proche':N.ech>1?'compromis':'moyen';
      N.log.push({qui:'lui',t:rcPhrase(x,cas,o)+(lache?` ${parId(x.id).prenom} peut renoncer à « ${lache.t.toLowerCase()} ».`:''),dem:{...d,dmd:[...d.dmd]},o,avant:N.demPrev});
    }
    N.avant=o;
    if(!N.fini&&N.ech===x.patience-1){N.dernier=true;N.log.push({qui:'lui',t:rcPhrase(x,'dernier'),alerte:true});}
    S.rc.attente=false;S.rc.anim=true;rendre();rcDefiler();
  };
  if(direct){repondre();return;}
  S.rc.attente=true;rendre();rcDefiler();setTimeout(repondre,1100);
}
function rcDefiler(){const j=$('.rc-log');if(j)j.scrollTo({top:j.scrollHeight,behavior:'smooth'});}

/* Où vous en êtes : une règle de « Loin » à « Accord », le curseur glisse après chaque réponse. */
const rcPos=s=>s==null?0:Math.max(0,Math.min(1,(s-.62)/.375));
function rcJauge(x){
  const N=x.nego,fini=N.fini,s=N.score;
  const mot=fini==='accord'?'Accord':fini==='refus'?'Rompu':s==null?'En attente de ton offre':s<.72?'Loin':s<.9?'À discuter':'Proche';
  const col=fini==='accord'?'var(--vert)':fini==='refus'?'var(--neg)':s==null?'var(--texte2)':s<.72?'var(--neg)':s<.9?'var(--blanc)':'var(--vert)';
  const pos=fini==='accord'?1:fini==='refus'?0:rcPos(s),avant=fini?rcPos(N.prev):rcPos(N.prev);
  const offres=Array.from({length:N.ech},(_,i)=>`<i class="octr fait" title="Offre ${i+1}"></i>`).join('')+(fini?'':`<i class="octr ${N.dernier?'derniere':''}" title="${N.dernier?'Dernière offre':'Prochaine offre'}"></i>`);
  return `<div class="rc-ou">
    <div class="rc-ou-h"><span class="etiq">Où vous en êtes</span><span class="T rc-mot" style="color:${col}">${mot}</span></div>
    <div class="rc-regle ${fini||''}"><div class="rc-zones"><span>Loin</span><span>À discuter</span><span>Proche</span><span>Accord</span></div>
      <div class="rc-piste"><i class="rc-rempli" data-vers="${pos}" style="width:${(S.rc.anim?avant:pos)*100}%;background:${col}"></i>
        ${s==null&&!fini?'':`<span class="rc-cur octr" data-vers="${pos}" style="left:${(S.rc.anim?avant:pos)*100}%;background:${col}"></span>`}</div></div>
    <div class="rc-offres"><span class="etiq">Tes offres</span>${offres}${N.dernier&&!fini?'<span class="rc-der">Dernière offre</span>':''}</div></div>`;
}
/* Un levier : ce qu'il demande (repère blanc) et ton offre (la barre), le bouton − / + à droite. */
function rcLevier([k,t,s],x){
  const N=x.nego,o=N.offre[k],d=N.dem[k],fini=!!N.fini||S.rc.attente,av=N.demPrev&&N.demPrev[k];
  const baisse=av!=null&&typeof d==='number'&&d<av?`<span class="rc-baisse">▼ ${nb(av-d)} €</span>`:'';
  if(k==='combats'){
    const nbs=[1,2,3,4,5,6,7,8].map(n=>`<button class="rc-nb octr ${n===o?'on':''} ${n===d?'veut':''}" ${fini?'disabled':''} data-rcnb="${n}" title="${n===d?'Ce qu’il veut':''}"><span class="octr">${n}</span></button>`).join('');
    return `<div class="rc-lev"><div><div class="rc-lev-t">${t}</div><div class="rc-lev-d">il en veut <b>${d}</b></div></div><div class="rc-nbs">${nbs}</div></div>`;
  }
  const max=d*1.25,ok=o>=d,proche=o>=d*.9,col=ok?'var(--vert)':proche?'var(--blanc)':'rgba(233,230,225,.45)';
  return `<div class="rc-lev"><div><div class="rc-lev-t">${t} <span class="sous">${s}</span></div><div class="rc-lev-d">il demande <b class="${baisse?'rc-chg':''}">${nb(d)} €</b> ${baisse}</div></div>
    <div class="rc-barre"><i style="width:${Math.min(100,o/max*100)}%;background:${col}"></i><span class="rc-rep" style="left:80%" title="Ce qu’il demande"></span></div>
    <div class="rc-pas">${fini?'':`<button class="bb oct petit" data-rcpas="${k}" data-v="-1000" title="Moins"><span class="oct">−</span></button>`}
      <span class="T rc-val" style="${ok?'color:var(--vert)':''}">${nb(o)} €</span>
      ${fini?'':`<button class="bb oct petit" data-rcpas="${k}" data-v="1000" title="Plus"><span class="oct">+</span></button>`}</div></div>`;
}
/* Ses demandes : à toi de t'y engager ou non. Celles auxquelles il a renoncé restent visibles, barrées. */
function rcDemandesHtml(x){
  const N=x.nego,fini=!!N.fini||S.rc.attente,l=N.dem.dmd,lache=N.lache||[];
  return `<div class="rc-dmds"><div class="rc-lev-t">Ses demandes</div>
    ${l.map(z=>{const on=N.offre.eng.includes(z.id);return `<div class="rc-dmd"><span class="rc-dmd-t">${esc(z.t)}</span><span class="rc-poids ${z.p}">${RC_POIDS[z.p][0]}</span>
      <button class="bb oct petit ${on?'on':''}" ${fini?'disabled':''} data-rceng="${z.id}"><span class="oct">${on?ico('ok',18)+'Tu t’engages':'T’engager'}</span></button></div>`;}).join('')}
    ${lache.map(z=>`<div class="rc-dmd lache"><span class="rc-dmd-t">${esc(z.t)}</span><span class="rc-poids">Il y renonce</span><span></span></div>`).join('')}</div>`;
}
function rcNegoHtml(){
  const x=rcDe(S.rc.nego),c=parId(x.id),N=x.nego,o=N.offre,fini=N.fini,[agent,trait]=x.agent;
  const total=o.combats*(o.bourse+o.vic)+o.sig;
  const split=COMBATTANTS.filter(y=>y.cat===c.cat).map(y=>+y.contrat[1].replace(/\D/g,'')).sort((a,b)=>b-a),place=split.filter(s=>s>o.bourse).length+1;
  const humeur=fini==='accord'?'Content de l’accord.':fini==='refus'?'Il est passé à autre chose.':S.rc.attente?'Il lit ton offre…':N.dernier?'Il n’attendra plus.':N.ech===0?'Il attend ton offre.':'Il veut aller vite.';
  const hcol=fini==='accord'?'var(--vert)':fini==='refus'||N.dernier?'var(--neg)':'var(--blanc)';
  const ini=agent.split(' ').map(m=>m[0]).join('');
  const u=t=>`<span style="white-space:nowrap">${t}</span>`;
  const puces=(r,av)=>[['bourse',`${nb(r.bourse)} €`,'par combat'],['combats',`${r.combats} combats`,''],['vic',`${nb(r.vic)} €`,'victoire'],['sig',`${nb(r.sig)} €`,'signature']]
    .map(([k,v,l])=>`<span class="rc-puce ${av&&av[k]!==r[k]?'bouge':''}">${u(v)}${l?` <i>${l}</i>`:''}${av&&typeof r[k]==='number'&&av[k]>r[k]&&k!=='combats'?` <em>▼ ${nb(av[k]-r[k])}</em>`:''}</span>`).join('')
    +'';
  /* Ton offre en une ligne ; sa réponse : ce qu'il accepte, puis ce qu'il veut encore face à ton chiffre. */
  const LIB={bourse:['Bourse',v=>`${nb(v)} €`],combats:['Combats',v=>`${v}`],vic:['Prime de victoire',v=>`${nb(v)} €`],sig:['Signature',v=>`${nb(v)} €`]};
  const tDm=(r,id)=>{const z=(r.dmd||[]).concat(N.lache||[],x.dem.dmd).find(q=>q.id===id);return z?z.t:id;};
  const ligne=r=>[u(`${nb(r.bourse)} € par combat`),u(`${r.combats} combats`),u(`${nb(r.vic)} € à la victoire`),u(`${nb(r.sig)} € à la signature`)].join(' · ')
    +(r.eng&&r.eng.length?`<div class="sous" style="font-size:18px;margin-top:2px">Tu t’engages : ${r.eng.map(id=>esc(tDm(r,id).toLowerCase())).join(' ; ')}</div>`:'');
  const reponse=e=>{const ec=rcEcarts(e.o,e.dem),ok=['bourse','combats','vic','sig'].filter(k=>!ec.includes(k)),okd=(e.dem.dmd||[]).filter(z=>e.o.eng.includes(z.id)).length;
    const okL=ok.map(k=>LIB[k][0].toLowerCase()).concat(okd?[okd>1?okd+' de ses demandes':'une de ses demandes']:[]);
    return `${okL.length?`<div class="rc-dac">${ico('ok',18)} D’accord sur : ${okL.join(', ')}</div>`:''}
      ${ec.length?`<div class="rc-ecarts"><span></span><span class="etiq">Il veut</span><span class="etiq">Tu proposais</span>${ec.map(k=>k.startsWith('dm:')?`<span>${esc(tDm(e.dem,k.slice(3)))}</span><b>oui</b><span class="sous">non</span>`:`<span>${LIB[k][0]}</span><b>${LIB[k][1](e.dem[k])}</b><span class="sous">${LIB[k][1](e.o[k])}</span>`).join('')}</div>`:''}`;};
  const log=N.log.map((e,i)=>{const neuf=i>=N.log.length-2&&S.rc.anim?'entre':'';
    return e.qui==='toi'?`<div class="rc-bul toi ${neuf}"><div><div class="etiq">Toi · offre ${e.ech}</div><div class="rc-ligne">${ligne(e.o)}</div></div></div>`
    :`<div class="rc-bul lui ${neuf} ${e.ok?'ok':''} ${e.non?'non':''} ${e.alerte?'alerte':''}"><span class="rc-av octr">${ini}</span><div>
      <div class="etiq">${esc(agent)}</div><div class="rc-dit">« ${esc(e.t)} »<span class="relire">à relire</span></div>${e.dem&&e.o?reponse(e):''}</div></div>`;}).join('')
    +(S.rc.attente?`<div class="rc-bul lui entre"><span class="rc-av octr">${ini}</span><div class="rc-pense"><i></i><i></i><i></i></div></div>`:'');
  const derniere=N.log.slice().reverse().find(e=>e.dem);
  const pied=fini==='accord'?`<span class="rc-accord">${ico('ok',26)} Accord trouvé</span><button class="bouton jaune cj" style="--c:14px;height:56px;font-size:30px;margin-left:auto" data-rcsigner>${x.type==='fin'?'Conclure l’accord':'Signer le contrat'}</button>`
    :fini==='refus'?`<span class="rc-rompu">Pas d’accord. Pas de nouvelle offre avant le ${rcJour(x.retour)}.</span><button class="bb oct" data-rcfermer style="margin-left:auto"><span class="oct">Revenir à la liste</span></button>`
    :`<button class="bouton jaune cj" style="--c:14px;height:56px;font-size:30px" data-rcproposer ${S.rc.attente?'disabled':''}>${N.dernier?'Dernière offre':'Faire cette offre'}</button>
      ${derniere?`<button class="bb oct" data-rcreprendre title="Mettre dans ton offre ce qu’il veut"><span class="oct">Prendre ses chiffres</span></button>`:''}
      <button class="bb oct" data-rcfermer style="margin-left:auto" title="La négociation reste ouverte"><span class="oct">Plus tard</span></button>`;
  return `<div class="rc-nego ${fini?'fini-'+fini:''}">
    ${pan(`<div class="rc-band">
      <div class="rc-qui"><div class="rc-pre">${esc(c.prenom)} <span>« ${esc(c.surnom)} »</span></div><div class="T rc-grand nom" data-fiche="${c.id}">${esc(c.nom)}</div>
        <div class="sous">${esc(courte(c.cat))} · ${c.age} ans · ${bilan(c)} · ${rcRang(c)}</div>
        <div class="rc-sit2">${x.type==='libre'?`Libre · ${esc(x.tag)}`:`${esc(c.org)} · libre ${esc(x.fin)}`}</div></div>
      ${rcJauge(x)}
      <div class="rc-agent"><span class="rc-av grand octr">${ini}</span><div><div class="etiq">Son agent</div><div class="rc-ag-nom">${esc(agent)}</div>
        <div class="sous" style="font-size:19px">${esc(trait)}<span class="relire">à relire</span></div><div class="rc-hum" style="color:${hcol}">${humeur}</div></div></div>
    </div>`,'','rc-pband apparait')}
    <div class="rc-bas">
      ${pan(`<div class="rc-offre">${RC_LEV.map(l=>rcLevier(l,x)).join('')}${rcDemandesHtml(x)}
        <div class="rc-cout"><div><span class="etiq">Au plus, sur tout le contrat</span> <span class="T rc-total">${nb(total)} €</span></div>
          <div class="sous" style="font-size:20px">${place===1?'Le plus gros salaire':`Le ${place}<sup>e</sup> salaire`} des ${esc(pluriel(c.cat).toLowerCase())} de Split</div></div>
        <div class="rc-pied">${pied}</div></div>`,'height:100%','apparait')}
      ${pan(titre('La discussion')+`<div class="defile rc-log">${log}</div>`,'height:100%','apparait')}
    </div>
  </div>${S.rc.confirmer?rcConfirmerHtml(x):''}`;
}
/* Confirmation : décision qui engage l'argent (charte S6), en chiffres. */
function rcConfirmerHtml(x){
  const c=parId(x.id),o=x.nego.offre,total=o.combats*(o.bourse+o.vic)+o.sig;
  const l=(t,v)=>`<div class="rc-cl"><span>${t}</span><b>${v}</b></div>`;
  return `<div class="rc-voile">${pan(titre(x.type==='fin'?'Conclure l’accord':'Signer le contrat',`${esc(c.prenom)} ${esc(c.nom)}`)+`
    ${l('Combats',`${o.combats}`)}${l('Bourse par combat',`${nb(o.bourse)} €`)}${l('Prime de victoire',`${nb(o.vic)} €`)}${l('Prime de signature',`${nb(o.sig)} €`)}
    ${o.eng.map(id=>l('Tu t’engages',esc(((x.nego.dem.dmd||[]).concat(x.dem.dmd).find(z=>z.id===id)||{t:id}).t))).join('')}${l('Au plus, sur tout le contrat',`${nb(total)} €`)}
    <div style="font-size:21px;margin:16px 0 4px">${x.type==='fin'?`${rcIL(c)} signe chez Split ${esc(x.fin)}. Jusque-là, ${rcIl(c)} reste chez ${esc(c.org)}.`:`${rcIL(c)} rejoint l’effectif aujourd’hui. La prime de signature est versée tout de suite.`}</div>
    <div class="rc-pied"><button class="bouton jaune cj" style="--c:14px;height:56px;font-size:30px" data-rcok>${x.type==='fin'?'Conclure':'Signer'}</button>
      <button class="bb oct" data-rcrevenir><span class="oct">Revenir</span></button></div>`,'width:760px','rc-conf')}</div>`;
}
/* Après l'affichage : le curseur et la barre glissent de l'ancienne position à la nouvelle. */
function rcAnimer(){
  if(!S.rc.anim)return;S.rc.anim=false;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    document.querySelectorAll('.rc-cur[data-vers]').forEach(e=>e.style.left=(+e.dataset.vers*100)+'%');
    document.querySelectorAll('.rc-rempli[data-vers]').forEach(e=>e.style.width=(+e.dataset.vers*100)+'%');
  }));
}

/* ---- L'écran ---- */
function rcOnglets(){
  const o=(v,t,on)=>`<button class="onglet oct ${on?'ouvert':''}" data-rcvue="${v}">${t}</button>`;
  return `<div class="cl-haut">${o('marche','Combattants',true)}${o('recruteur','Recruteur',false)}</div>`;
}
function rcFiltres(){
  const b=(attr,v,t,on)=>`<button class="bb oct petit ${on?'on':''}" ${attr}="${esc(v)}"><span class="oct">${t}</span></button>`,F=S.rc;
  return `<div class="eff-filtres">${b('data-rcsexe','H','Hommes',F.sexe==='H')}${b('data-rcsexe','F','Femmes',F.sexe==='F')}<i class="eff-sep"></i>
    ${CATS[F.sexe].map(([cat,t])=>b('data-rccat',cat,t,F.cat===cat)).join('')}
    <span class="cl-portee">${b('data-rcstatut','libres','Libres',F.statut==='libres')}${b('data-rcstatut','fins','Fin de contrat',F.statut==='fins')}${b('data-rcstatut','tous','Tous',F.statut==='tous')}</span></div>`;
}
function rcHtml(){
  rcGarder();rcSauver();const F=S.rc;
  if(F.nego)return `<div class="rc">${rcOnglets()}${rcNegoHtml()}</div>`;
  return `<div class="rc">${rcOnglets()}${rcFiltres()}<div class="rc-g">${rcTableau()}${rcFicheCourte()}</div></div>`;
}

/* ---- Branchement dans le cadre ---- */
const rcRendreBase=rendre;
rendre=function(){
  if(S.ecran!=='contrats'){rcRendreBase();return;}
  rendreBarre();rendreEntete('Recrutement');$('#alerte').classList.remove('af-al');msAlerte();
  const g=$('.rc-liste'),y=g?g.scrollTop:0,lg=$('.rc-log'),ly=lg?lg.scrollTop:0;
  $('#corps').style.top='152px';$('#corps').innerHTML=rcHtml();
  const g2=$('.rc-liste');if(g2)g2.scrollTop=y;
  const l2=$('.rc-log');if(l2)l2.scrollTop=ly;
  $('#zone').classList.toggle('fiche-ouverte',!!S.fiche);
  rcAnimer();
};
const rcAllerBase=aller;
aller=function(ec){
  if(ec!=='contrats'){S.rc.nego=null;rcAllerBase(ec);return;}
  if(S.fiche)fermerFiche(false);
  if(S.ecran!=='contrats'){S.hist.push(S.ecran);S.futur=[];}
  S.ecran='contrats';rendre();
};
/* Retour ferme d'abord la confirmation, puis la négociation (qui reste ouverte), avant de quitter l'écran. */
const rcRetourBase=retour;
retour=function(){
  if(S.ecran==='contrats'&&!S.fiche){if(S.rc.confirmer){S.rc.confirmer=false;rendre();return;}if(S.rc.nego&&!S.rc.attente){S.rc.nego=null;rendre();return;}}
  rcRetourBase();
};
const rcEnteteBase=rendreEntete;
rendreEntete=function(p){rcEnteteBase(p);if(S.ecran==='contrats'&&S.rc.nego){const b=$('#bRetour');if(b)b.disabled=false;}};
const rcOuvrirBase=ouvrirFiche;
ouvrirFiche=function(id,garderFutur=false){
  if(S.ecran!=='contrats'){rcOuvrirBase(id,garderFutur);return;}
  if(!garderFutur)S.futur=[];
  if(S.fiche&&S.fiche!==id)S.ficheHist.push(S.fiche);
  S.fiche=id;S.panCat=false;rendre();rendreFiche();setTimeout(()=>$('#fiche').classList.add('ouverte'),30);
};

/* ---- La fiche d'un combattant du marché : libre (plus d'organisation), style caché tant que personne ne l'a vu ---- */
const rcStatsBase=statsHtml;
statsHtml=function(c){
  const x=rcDe(c.id);
  if(!x||x.vu||x.etat==='signe')return rcStatsBase(c);
  return pan(`<div class="rc-cachee"><div class="T" style="font-size:44px">Pas encore vu de près</div>
    <div style="font-size:23px;max-width:640px;line-height:1.35">On connaît son palmarès et ses combats. Ses statistiques et son style se sauront à la signature, ou quand ton recruteur l’aura vu.</div>
    ${x.etat==='recruteur'?`<div style="font-size:22px">Ton recruteur part le voir. Rapport vers le ${rcJour(x.rapport)}.</div>`:`<button class="bb oct" data-rcenvoyer="${c.id}"><span class="oct">${ico('oeil',22)}Envoyer le recruteur</span></button>`}</div>`,'height:100%');
};
const rcContratBase=contratHtml;
contratHtml=function(c){
  const x=rcDe(c.id);if(!x)return rcContratBase(c);
  const d=x.dem,il=rcIl(c);
  return `<div style="display:grid;grid-template-columns:1.1fr 1fr;gap:20px;height:100%">
    ${pan(titre('Sa situation',x.type==='libre'?'Libre':esc(c.org))+`<div class="T" style="font-size:52px;line-height:.9">${x.type==='libre'?`Libre depuis le ${rcJour(c.libre)}`:`Libre ${esc(x.fin)}`}</div>
      <div style="font-size:23px;line-height:1.3;margin-top:14px">${x.type==='libre'?`${esc(x.raison||'')} ${rcIL(c)} peut signer tout de suite.`:`Dernier combat de son contrat chez ${esc(c.org)}. Tu peux trouver un accord maintenant : ${il} signera chez Split après.`}</div>
      <div style="margin-top:auto;display:flex;gap:14px;align-items:center">${['signe','refus','accord'].includes(x.etat)?rcEtatHtml(x):`<button class="bouton jaune cj" style="--c:12px;height:52px;font-size:28px" data-rcoffre="${c.id}">${x.etat==='cours'?'Reprendre la négociation':'Faire une offre'}</button>`}</div>`,'height:100%')}
    ${pan(titre('Ce qu’il demande',`agent : ${esc(x.agent[0])}`)+`<div class="T" style="font-size:64px;line-height:.9">${nb(d.bourse)} €</div>
      <div class="sous" style="font-size:20px;margin-top:6px">par combat, sur ${d.combats} combats</div>
      <div class="cl-sf" style="margin-top:18px">${rcFait('Prime de victoire',`${nb(d.vic)} €`)}${rcFait('Signature',`${nb(d.sig)} €`)}${rcFait('Demandes',`${d.dmd.length}`)}</div>
      <div class="rc-bloc" style="margin-top:14px">${d.dmd.map(z=>`<div class="rc-dmd"><span class="rc-dmd-t">${esc(z.t)}</span><span class="rc-poids ${z.p}">${RC_POIDS[z.p][0]}</span><span></span></div>`).join('')}</div>`,'height:100%')}
  </div>`;
};
const rcFicheBase=rendreFiche;
rendreFiche=function(dir=0){
  rcFicheBase(dir);
  const c=parId(S.fiche),x=c&&rcDe(c.id);
  if(!x||x.type!=='libre')return;
  /* Un libre n'a plus d'organisation : tunnel gris, « Libre » dans la case, rang « — » s'il n'est pas classé. */
  const img=$('#fiche .fb-img');if(img)img.style.filter='grayscale(1) brightness(.85)';
  if(c.nonClasse){const m=$('#banC .cl-fmond');if(m)m.textContent='—';}
  const w=document.createTreeWalker($('#fiche'),NodeFilter.SHOW_TEXT);let n;
  while((n=w.nextNode())){if(n.nodeValue===c.org&&n.parentElement.closest('.oct')){n.nodeValue='Libre';}
    else if(n.nodeValue.includes(`Sous contrat avec ${c.org}`))n.nodeValue=n.nodeValue.replace(`Sous contrat avec ${c.org}`,`Libre, a quitté ${c.org}`);}
};

/* ---- Clics ---- */
document.addEventListener('click',e=>{
  const t=e.target;let el;
  if((el=t.closest('[data-rcoffre]'))){e.stopPropagation();const id=el.dataset.rcoffre;if(S.fiche)fermerFiche(false);if(S.ecran!=='contrats')aller('contrats');rcOuvrirNego(id);return;}
  if((el=t.closest('[data-rcenvoyer]'))){const x=rcDe(el.dataset.rcenvoyer),c=parId(x.id);x.etat='recruteur';x.rapport=new Date(S.date.getTime()+864e5*9);
    toast(`Ton recruteur part voir ${esc(c.prenom)} ${esc(c.nom)}. Son rapport arrivera dans tes messages vers le ${rcJour(x.rapport)}.`);rendre();if(S.fiche)rendreFiche();return;}
  if(S.ecran!=='contrats')return;
  if(t.closest('#fiche')||t.closest('[data-fiche]'))return;
  const F=S.rc,x=F.nego&&rcDe(F.nego);
  if((el=t.closest('[data-rcvue]'))){if(el.dataset.rcvue==='recruteur'){toast('L’écran du recruteur est la prochaine maquette (R26).');return;}F.nego=null;rendre();return;}
  if((el=t.closest('[data-rcsexe]'))){F.sexe=el.dataset.rcsexe;F.cat='toutes';F.sel=null;rendre();return;}
  if((el=t.closest('[data-rccat]'))){F.cat=el.dataset.rccat;F.sel=null;rendre();return;}
  if((el=t.closest('[data-rcstatut]'))){F.statut=el.dataset.rcstatut;F.sel=null;rendre();return;}
  if((el=t.closest('[data-rctri]'))){const k=el.dataset.rctri;F.tri=F.tri.col===k?{col:k,sens:-F.tri.sens}:{col:k,sens:['bilan','serie','demande'].includes(k)?-1:1};rendre();return;}
  if((el=t.closest('[data-rcsel]'))){if(F.sel!==el.dataset.rcsel){F.sel=el.dataset.rcsel;rendre();}return;}
  if((el=t.closest('[data-rcsuivre]'))){const id=el.dataset.rcsuivre,i=F.suivis.indexOf(id);if(i>=0)F.suivis.splice(i,1);else{F.suivis.push(id);toast(`Tu suis ${esc(parId(id).prenom)} ${esc(parId(id).nom)}.`);}rendre();return;}
  if(!x)return;
  const N=x.nego;
  if(N.fini&&!t.closest('[data-rcfermer],[data-rcsigner],[data-rcok],[data-rcrevenir]')&&!F.confirmer)return;
  if(F.attente)return;
  if((el=t.closest('[data-rcpas]'))){const k=el.dataset.rcpas;N.offre[k]=Math.max(0,N.offre[k]+(+el.dataset.v));rendre();return;}
  if((el=t.closest('[data-rcnb]'))){N.offre.combats=+el.dataset.rcnb;rendre();return;}
  if((el=t.closest('[data-rceng]'))){const id=el.dataset.rceng,e2=N.offre.eng;e2.includes(id)?e2.splice(e2.indexOf(id),1):e2.push(id);rendre();return;}
  if(t.closest('[data-rcproposer]')){rcProposer();return;}
  if(t.closest('[data-rcreprendre]')){Object.assign(N.offre,{bourse:N.dem.bourse,vic:N.dem.vic,sig:N.dem.sig,combats:N.dem.combats,eng:N.dem.dmd.map(z=>z.id)});rendre();return;}
  if(t.closest('[data-rcfermer]')){F.nego=null;rendre();return;}
  if(t.closest('[data-rcsigner]')){F.confirmer=true;rendre();return;}
  if(t.closest('[data-rcrevenir]')||(F.confirmer&&t.classList.contains('rc-voile'))){F.confirmer=false;rendre();return;}
  if(t.closest('[data-rcok]')){const c=parId(x.id);x.etat=x.type==='fin'?'accord':'signe';F.confirmer=false;F.nego=null;rendre();
    toast(x.etat==='signe'?`${esc(c.prenom)} ${esc(c.nom)} signe chez Split. ${rcIL(c)} rejoint l’effectif des ${esc(pluriel(c.cat).toLowerCase())}.`:`Accord avec ${esc(c.prenom)} ${esc(c.nom)} : ${rcIl(c)} signe ${esc(x.fin)}.`);return;}
});

/* ---- Lancement : ?ecran=recrutement, options statut=libres|fins, rccat=<catégorie|toutes>, sexe=F, sel=<id>, nego=<id>, offres=<n>,
   neuf=1 (efface les négociations gardées) ---- */
window.addEventListener('DOMContentLoaded',()=>{
  const q=new URLSearchParams(location.search);
  if(q.get('neuf')){try{localStorage.removeItem(RC_DOS);}catch(e){}}
  rcCharger();
  if(q.get('ecran')!=='recrutement')return;
  S.ecran='contrats';S.hist=['accueil'];
  if(q.get('statut'))S.rc.statut=q.get('statut');
  if(q.get('sexe'))S.rc.sexe=q.get('sexe');
  if(q.get('rccat'))S.rc.cat=q.get('rccat');
  if(q.get('sel'))S.rc.sel=q.get('sel');
  rendre();
  if(q.get('nego')){rcOuvrirNego(q.get('nego'));for(let i=0;i<(+q.get('offres')||0);i++){const N=rcDe(S.rc.nego).nego;if(N.fini)break;N.offre.bourse+=i?2000:0;rcProposer(true);}}
  if(q.get('fiche'))setTimeout(()=>ouvrirFiche(q.get('fiche')),50);
});
