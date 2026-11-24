"use strict";
/* Maquette lot 1 — les Finances (R31, Q31). L'écran « Finances » de la barre. Préfixe fi- (classes) et fi / FI_ (fonctions, constantes).
   Q31 : toutes les informations nécessaires, pas de budget imposé : l'argent disponible dépend des soirées et des bourses.
   Deux onglets : « La caisse » (le solde, soirée par soirée, recettes et dépenses, ce qui a changé et pourquoi)
   et « Les bourses » (ce que coûtent les combattants sous contrat, catégorie par catégorie, et les fins de contrat).
   Les soirées sont celles des Résultats (Split Fight Night 56 à 63) : même public, mêmes combats, mêmes primes ;
   les bourses viennent des contrats de l'Effectif (bourse fixe = moitié, prime de victoire = moitié, comme l'onglet Contrat de la fiche).
   Au 12 janvier 2027, la soirée 63 est à venir ; avec ?apres=1, elle est jouée et reprend les chiffres du Lendemain.
   Hypothèses (à trancher par Anthony) : partenaires et « bar, boutique, VIP » ajoutés aux recettes du jeu (billetterie + diffuseur) ;
   pas de frais fixes (bureau, salariés), absents du jeu ; caisse de départ au 1er janvier 2026 ; prix moyens des billets. */

/* ---- Réglages de l'écran : gardés au retour ---- */
const FI_CLE='maquette-finances-1';
S.fi=Object.assign({onglet:'caisse',sel:null,sexe:'H',cat:'Poids léger',sens:-1,anim:true},(()=>{try{return JSON.parse(localStorage.getItem(FI_CLE))||{};}catch(e){return {};}})());
function fiGarder(){try{const {onglet,sexe,cat,sens}=S.fi;localStorage.setItem(FI_CLE,JSON.stringify({onglet,sexe,cat,sens}));}catch(e){}}
const fiEtat=()=>JSON.stringify({onglet:S.fi.onglet,sel:S.fi.sel,sexe:S.fi.sexe,cat:S.fi.cat,sens:S.fi.sens,pm:S.fi.pm});

/* ---- Les chiffres d'une soirée ----
   Prix moyen du billet et coût de la salle (location, cage, lumière, image, sécurité) par soirée. Ordres de grandeur :
   UFC Paris 2022, 3,4 M€ de billetterie pour 15 405 places (≈ 220 € la place) ; une organisation de niveau 2, 50 à 70 €.
   Diffuseur et partenaires : un montant par soirée, revu au palier du 10 janvier 2027 (message « les diffuseurs nationaux regardent Split »). */
const FI_LIEU={56:[64,110000],57:[55,100000],58:[58,115000],59:[64,110000],60:[52,95000],61:[60,130000],62:[64,110000],63:[66,120000]};
const FI_DIFF={avant:280000,apres:380000},FI_PART={avant:110000,apres:140000},FI_BAR=12;
const FI_CAISSE0=300000,FI_DEBUT=new Date(2026,0,1),FI_PLACES63=4000;
const FI_LENDEMAIN={recette:846000,bourses:345000,salle:120000}; /* Split Fight Night 63, onglet Le lendemain des Résultats */
const FI_MOIS=['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
const fiD=d=>`${d.getDate()} ${FI_MOIS[d.getMonth()]} ${d.getFullYear()}`;
const fiDc=d=>`${d.getDate()} ${FI_MOIS[d.getMonth()]}`;
const fiE=v=>`${nb(Math.abs(v))} €`;
const fiSigne=v=>`${v>=0?'+':'−'} ${nb(Math.abs(v))} €`;

/** La bourse d'un combat (fixe + victoire) d'après le contrat ; un adversaire hors de Split reçoit une bourse d'un combat. */
function fiBourse(c,principal){const b=euros(c&&c.contrat?c.contrat[1]:'');return b||(principal?30000:14000);}

const FI_CACHE={};
/** Une soirée : recettes, dépenses, primes, ce qu'il reste. Mise en cache (les soirées passées ne bougent plus). */
function fiSoiree(n){
  const cle=n+(S.rs.apres?'a':'b');if(FI_CACHE[cle]&&n!==63)return FI_CACHE[cle];
  const s=RS_SOIREES.find(x=>x.n===n),[prix,salle]=FI_LIEU[n],joue=n<63||S.rs.apres;
  const o={n,date:s.date,ville:s.ville,salle:s.salle,lieu:s.salle,public:s.public,joue,prix,titre:!!s.titre};
  if(!joue){ /* à venir : ce qui est déjà signé ou vendu, rien d'autre */
    const pleins=S.af.m.concat(S.af.p).filter(f=>f.a&&f.b);
    o.public=[S.preventes,FI_PLACES63];
    o.rec={billet:S.preventes*prix,diff:FI_DIFF.apres,part:FI_PART.apres,bar:null};
    o.dep={fixe:pleins.reduce((t,f)=>t+fiBourse(parId(f.a))/2+fiBourse(parId(f.b))/2,0),vict:null,primes:null,salle};
    o.combats=pleins.length;o.places=S.af.m.length+S.af.p.length;
    o.sur=o.rec.billet+o.rec.diff+o.rec.part-o.dep.fixe-o.dep.salle;
    return o;
  }
  const r=rsSoiree(n),pr={soiree:0,perf:0,fin:0};let fixe=0,vict=0,top=null;
  r.combats.forEach((f,i)=>{['a','b'].forEach(sd=>{const c=sd==='a'?f.A:f.B,b=fiBourse(c,i===0);fixe+=b/2;if(f.g===sd)vict+=b/2;
    if(!top||b>top.b)top={c,b};((f.pr||{})[sd]||[]).forEach(p=>pr[p]++);});});
  const primes=Object.entries(pr).reduce((t,[k,q])=>t+q*primeDe(k,n),0);
  if(n===63){ /* les chiffres du Lendemain */
    const k=FI_LENDEMAIN.bourses/(fixe+vict);fixe=Math.round(fixe*k/1000)*1000;vict=FI_LENDEMAIN.bourses-fixe;
    const billet=s.public[0]*prix;
    o.rec={billet,diff:FI_DIFF.apres,part:FI_PART.apres,bar:FI_LENDEMAIN.recette-billet-FI_DIFF.apres-FI_PART.apres};
  }else o.rec={billet:s.public[0]*prix,diff:FI_DIFF.avant,part:FI_PART.avant,bar:s.public[0]*FI_BAR};
  o.dep={fixe,vict,primes,salle};o.pr=pr;o.top=top;o.combats=r.combats.length;
  o.main=r.combats[0];
  o.recette=Object.values(o.rec).reduce((t,v)=>t+v,0);o.depense=Object.values(o.dep).reduce((t,v)=>t+v,0);o.net=o.recette-o.depense;
  return FI_CACHE[cle]=o;
}
const fiNums=()=>[56,57,58,59,60,61,62,63];
const fiJouees=()=>fiNums().map(fiSoiree).filter(o=>o.joue);
const fiSel=()=>{const l=fiNums();return l.includes(S.fi.sel)?S.fi.sel:fiJouees().slice(-1)[0].n;};
/** La caisse : départ au 1er janvier 2026, puis chaque soirée, en une fois (règle du jeu : la recette tombe le soir même). */
function fiCaisse(){let c=FI_CAISSE0;const pts=[{d:FI_DEBUT,c}];fiJouees().forEach(o=>{pts.push({d:o.date,c,o,avant:true});c+=o.net;pts.push({d:o.date,c,o});});return {c,pts};}
/** Découvert autorisé (règle du jeu) : la dernière recette nette, lissée sur deux soirées, jamais négative. */
function fiDecouvert(){const l=fiJouees().slice(-2);return Math.max(0,Math.round(l.reduce((t,o)=>t+o.net,0)/l.length/1000)*1000);}

/* ---- Onglets et filtres ---- */
function fiHaut(){
  const F=S.fi,o=(v,t)=>`<button class="onglet oct ${F.onglet===v?'ouvert':''}" data-fiong="${v}">${t}</button>`;
  const b=(k,v,l)=>`<button class="bb oct petit ${F[k]===v?'on':''}" data-fif="${k}:${v}"><span class="oct">${l}</span></button>`;
  const fl=F.onglet==='bourses'?`<span style="margin-left:auto"></span>${b('sexe','H','Hommes')}${b('sexe','F','Femmes')}`:'';
  return `<div class="cl-haut fi-haut">${o('caisse','Caisse')}${o('bourses','Bourses')}${o('primes','Primes')}${fl}</div>`;
}

/* ---- La caisse : le bandeau ---- */
function fiBandeau(){
  const {c}=fiCaisse(),an=fiJouees().filter(o=>o.date.getFullYear()===2026).reduce((t,o)=>t+o.net,0),dec=fiDecouvert();
  const st=(l,v,s,x='')=>`<div class="stat-b fi-st"><span class="etiq">${l}</span><span class="T fi-stv">${v}</span><span class="sous">${s}</span>${x}</div>`;
  const der=fiJouees().slice(-1)[0];
  const quatre=S.rs.apres
    ?st('Dernière soirée',`<span class="${der.net>=0?'fi-pos':'fi-neg'}">${der.net>=0?'+':'−'} <span data-fin="${Math.abs(der.net)}">0</span> €</span>`,`Split Fight Night ${der.n}, ${esc(der.ville)}`)
    :st('Préventes du 16 février',`<span id="preventes">${nb(S.preventes)}</span><span class="jauge fi-jp"><i id="jPrev" style="width:${S.preventes/FI_PLACES63*100}%;background:var(--blanc)"></i></span>`,`places sur ${nb(FI_PLACES63)}`);
  return `<div class="bandeau fi-band ${S.fi.anim?'apparait':''}"><i class="bandeau-img"></i>
    <div class="fi-bt"><span class="etiq">En caisse</span><span class="T fi-caisse"><span data-fin="${c}">0</span> €</span><span class="sous">au ${S.date.getDate()} ${MOIS[S.date.getMonth()]} ${S.date.getFullYear()}</span></div>
    ${st('En 2026',`<span class="${an>=0?'fi-pos':'fi-neg'}">${an>=0?'+':'−'} <span data-fin="${Math.abs(an)}">0</span> €</span>`,(()=>{const l=fiJouees().filter(o=>o.date.getFullYear()===2026);return `${l.length} soirées, de la ${l[0].n} à la ${l[l.length-1].n}`;})())}
    ${st('Découvert autorisé',`<span data-fin="${dec}">0</span> €`,'pour un remplaçant de dernière minute')}
    ${quatre}</div>`;
}

/* ---- La caisse : le solde dans le temps, puis les soirées ---- */
function fiSolde(){
  const sel=fiSel();
  const puce=n=>{const o=fiSoiree(n),cl=o.joue?(o.net>=0?'fi-pos':'fi-neg'):'';
    return `<button class="fi-s oct ${n===sel?'sel':''} ${S.fi.anim?'apparait':''}" style="animation-delay:${(n-56)*50+200}ms" data-fisel="${n}"><span class="fi-si oct">
      <span class="fi-sh"><span class="T fi-sn">${n}</span><span class="fi-sv">${esc(o.ville)}</span><span class="sous">${fiDc(o.date)}</span></span>
      ${o.joue?`<span class="T fi-sr ${cl}">${fiSigne(o.net)}</span>`:`<span class="fi-sr fi-avenir">dans ${S.jours} jours</span>`}</span></button>`;};
  const best=fiJouees().reduce((m,o)=>!m||o.net>m.net?o:m,null);
  return pan(titre('Solde',`depuis janvier 2026 · meilleure soirée : la ${best.n}, ${esc(best.ville)}`)+`
    <div class="fi-courbe" id="fiCourbe"></div>
    <div class="fi-puces">${fiNums().map(puce).join('')}</div>`,'height:100%','fi-gauche');
}
/** La courbe : un escalier, une marche par soirée (verte si elle rapporte, rouge si elle coûte). Dessinée à la taille réelle. */
function fiCourbe(){
  const el=$('#fiCourbe');if(!el)return;
  const W=el.clientWidth,H=el.clientHeight,g=64,dr=24,ht=14,bs=34;
  const {pts}=fiCaisse(),fin=new Date(2027,2,1),t0=FI_DEBUT.getTime(),t1=fin.getTime();
  const max=Math.max(...pts.map(p=>p.c)),pas=max>1.6e6?500000:250000,ymax=Math.ceil(max*1.12/pas)*pas;
  const X=d=>g+(d.getTime()-t0)/(t1-t0)*(W-g-dr),Y=v=>ht+(1-v/ymax)*(H-ht-bs);
  const auj=S.date,sel=fiSel();
  let d=`M${X(pts[0].d)},${Y(pts[0].c)}`;pts.slice(1).forEach(p=>{d+=` L${X(p.d)},${Y(p.c)}`;});d+=` L${X(auj)},${Y(pts[pts.length-1].c)}`;
  const aire=d+` L${X(auj)},${Y(0)} L${X(pts[0].d)},${Y(0)} Z`;
  let grille='';for(let v=0;v<=ymax;v+=pas)grille+=`<line x1="${g}" x2="${W-dr}" y1="${Y(v)}" y2="${Y(v)}" class="fi-gr"/><text x="${g-10}" y="${Y(v)+5}" text-anchor="end" class="fi-ax">${v?nb(v/1000)+' k€':'0'}</text>`;
  let mois='';for(let m=0;m<14;m++){const dm=new Date(2026,m,1);if(dm>=fin)break;const x=X(new Date(2026,m,15));
    mois+=`<text x="${x}" y="${H-8}" text-anchor="middle" class="fi-ax ${dm.getFullYear()===2027?'fi-ax27':''}">${FI_MOIS[dm.getMonth()]}${dm.getMonth()===0?' '+dm.getFullYear():''}</text>`;}
  const oc=(x,y,r)=>{const a=r*.4142;return `${x-a},${y-r} ${x+a},${y-r} ${x+r},${y-a} ${x+r},${y+a} ${x+a},${y+r} ${x-a},${y+r} ${x-r},${y+a} ${x-r},${y-a}`;};
  const marches=pts.filter(p=>p.o&&!p.avant).map((p,i)=>{const av=pts[pts.indexOf(p)-1],x=X(p.d),cl=p.o.net>=0?'fi-mp':'fi-mn',y=Y(p.c);
    return `<line x1="${x}" x2="${x}" y1="${Y(av.c)}" y2="${y}" class="fi-m ${cl}" style="animation-delay:${.9+i*.1}s"/>
      <g class="fi-pt ${p.o.n===sel?'sel':''}" data-fisel="${p.o.n}" style="animation-delay:${1+i*.1}s"><title>Split Fight Night ${p.o.n} · ${fiD(p.o.date)} · ${fiSigne(p.o.net)}</title>
      <polygon points="${oc(x,y,17)}" class="${cl}"/><text x="${x}" y="${y+6}" text-anchor="middle">${p.o.n}</text></g>`;}).join('');
  const der=pts[pts.length-1],xa=X(auj),y63=Y(der.c);
  const venir=S.rs.apres?'':(()=>{const x=X(new Date(2027,1,16));return `<line x1="${xa}" x2="${x}" y1="${y63}" y2="${y63}" class="fi-pointille"/>
      <g class="fi-pt fi-pt63 ${sel===63?'sel':''}" data-fisel="63"><title>Split Fight Night 63 · 16 févr. 2027 · à venir</title><polygon points="${oc(x,y63,17)}"/><text x="${x}" y="${y63+6}" text-anchor="middle">63</text></g>`;})();
  el.innerHTML=`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs><linearGradient id="fiDeg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#E9E6E1" stop-opacity=".16"/><stop offset="1" stop-color="#E9E6E1" stop-opacity="0"/></linearGradient></defs>
    ${grille}${mois}<path d="${aire}" fill="url(#fiDeg)" class="fi-aire"/><path d="${d}" class="fi-ligne" pathLength="1"/>
    <line x1="${xa}" x2="${xa}" y1="${ht}" y2="${H-bs+4}" class="fi-auj"/><text x="${xa}" y="${ht+2}" text-anchor="middle" class="fi-ax fi-auj-t" dy="-2">aujourd’hui</text>
    ${venir}${marches}</svg>`;
  if(!S.fi.anim)el.classList.add('fi-fixe');else el.classList.remove('fi-fixe');
}

/* ---- La caisse : le détail d'une soirée ---- */
function fiLigne(lab,sous,v,max,cl,i,extra=''){
  const l=v===null?`<span class="fi-lv sous">après la soirée</span>`:`<span class="T fi-lv"><span data-fin="${v}">0</span> €</span>`;
  return `<div class="fi-l" style="animation-delay:${300+i*60}ms"><div class="fi-lh"><span class="fi-lt">${lab}${extra}</span>${l}</div>
    ${sous?`<div class="fi-ls">${sous}</div>`:''}<div class="fi-lj"><i class="${cl}" style="--p:${v===null?0:Math.max(2,v/max*100)}%;animation-delay:${400+i*60}ms"></i></div></div>`;
}
const fiAvec=(o,c)=>rsSoiree(o.n).combats.some(f=>f.A===c||f.B===c);
/** Ce qui a changé depuis la soirée d'avant : les deux plus gros écarts, avec leur raison, en effet sur ce qu'il te reste. */
function fiChangements(o){
  const p=fiNums().map(fiSoiree).find(x=>x.n===o.n-1);if(!p||!o.joue)return '';
  const dp=o.public[0]-p.public[0],ch=[];
  const add=(lab,eff,why)=>{if(Math.abs(eff)>=1000)ch.push({lab,eff,why});};
  add('Billetterie',o.rec.billet-p.rec.billet,dp?`${nb(Math.abs(dp))} spectateurs ${dp>0?'de plus':'de moins'} qu’à ${esc(p.ville)}`:`billet moyen à ${o.prix} € contre ${p.prix} €`);
  add('Diffuseur',o.rec.diff-p.rec.diff,'nouveau contrat depuis le palier du 10 janvier');
  add('Partenaires',o.rec.part-p.rec.part,'nouveaux partenaires depuis le palier du 10 janvier');
  const b=o.dep.fixe+o.dep.vict,bp=p.dep.fixe+p.dep.vict;
  const sans=o.top&&p.top&&p.top.b>o.top.b*1.5&&!fiAvec(o,p.top.c);
  add('Bourses',-(b-bp),sans?`sans ${lien(p.top.c)}, ${fiE(p.top.b)} à la ${p.n}`:`plus grosse bourse : ${lien(o.top.c)}, ${fiE(o.top.b)}`);
  const PL={soiree:'combat de la soirée',perf:'performance',fin:'finition'};
  const kx=Object.keys(PL).sort((a,z)=>Math.abs((o.pr[z]-p.pr[z])*primeDe(z,o.n))-Math.abs((o.pr[a]-p.pr[a])*primeDe(a,o.n)))[0],dk=o.pr[kx]-p.pr[kx];
  add('Primes',-(o.dep.primes-p.dep.primes),dk?`${Math.abs(dk)} prime${Math.abs(dk)>1?'s':''} « ${PL[kx]} » de ${dk>0?'plus':'moins'}, ${fiE(primeDe(kx,o.n))} chacune`:'mêmes primes');
  add('Salle et production',-(o.dep.salle-p.dep.salle),`${esc(o.salle)} contre ${esc(p.salle)}`);
  const l=ch.sort((x,y)=>Math.abs(y.eff)-Math.abs(x.eff)).slice(0,2);
  return `<div class="fi-chg"><div class="fi-ct"><span class="etiq">Depuis la ${p.n}</span><span class="T fi-ctn ${o.net-p.net>=0?'fi-pos':'fi-neg'}">${fiSigne(o.net-p.net)}</span><button class="fi-lien" data-firesu="${o.n}">Voir les résultats ›</button></div>
    ${l.map((x,i)=>`<div class="fi-c" style="animation-delay:${700+i*90}ms"><span class="fi-cf ${x.eff>=0?'fi-pos':'fi-neg'}">${x.eff>=0?'▲':'▼'}</span>
      <span class="fi-cl"><b>${x.lab}</b><span class="sous">${x.why}</span></span><span class="T fi-ce ${x.eff>=0?'fi-pos':'fi-neg'}">${fiSigne(x.eff)}</span></div>`).join('')}</div>`;
}
function fiDetail(){
  const o=fiSoiree(fiSel()),R=o.rec,D=o.dep;
  const max=Math.max(...Object.values(R).concat(Object.values(D)).filter(v=>v!==null));
  const med=o.pr?Object.entries(o.pr).filter(([,q])=>q).map(([k,q])=>`<span class="fi-med">${medaille(k,24,o.n)}${q>1?`<b>${q}</b>`:''}</span>`).join(''):'';
  const pub=o.joue?`${nb(o.public[0])} spectateurs, ${o.prix} € en moyenne`:`${nb(o.public[0])} places vendues sur ${nb(o.public[1])}`;
  const recettes=[fiLigne('Billetterie',pub,R.billet,max,'fi-jr',0),fiLigne('Diffuseur','contrat de la saison, par soirée',R.diff,max,'fi-jr',1),
    fiLigne('Partenaires','contrat de la saison, par soirée',R.part,max,'fi-jr',2),fiLigne('Bar, boutique, VIP',R.bar===null?'après la soirée':`${nb(R.bar/o.public[0])} € par spectateur`,R.bar,max,'fi-jr',3)].join('');
  const depenses=o.joue?[fiLigne('Bourses fixes',`${o.combats} combats, ${o.combats*2} combattants`,D.fixe,max,'fi-jd',4),fiLigne('Primes de victoire',`${o.combats} vainqueurs`,D.vict,max,'fi-jd',5),
      `<div class="fi-l" style="animation-delay:660ms"><div class="fi-lh"><span class="fi-lt">Primes de performance</span></div>
        <div class="fi-lh fi-lh2"><span class="fi-meds">${med}</span><span class="T fi-lv"><span data-fin="${D.primes}">0</span> €</span></div>
        <div class="fi-lj"><i class="fi-jd" style="--p:${Math.max(2,D.primes/max*100)}%;animation-delay:760ms"></i></div></div>`,fiLigne('Salle et production','location, cage, image, sécurité',D.salle,max,'fi-jd',7)].join('')
    :[fiLigne('Bourses fixes',`${o.combats} combats sur ${o.places} composés`,D.fixe,max,'fi-jd',4),fiLigne('Primes de victoire','selon les vainqueurs',null,max,'fi-jd',5),
      `<div class="fi-l fi-lp" style="animation-delay:660ms"><div class="fi-lh"><span class="fi-lt">Primes de performance</span><button class="fi-lien" data-fiprimes>Modifier ›</button></div>
        <div class="fi-tes">${PERF_TYPES.map(([k])=>`<span class="fi-med">${medaille(k,22,o.n)}<span>${fiE(primeDe(k,o.n))}</span></span>`).join('')}</div></div>`,
      fiLigne('Salle et production',esc(o.salle),D.salle,max,'fi-jd',7)].join('');
  const tete=o.joue
    ?`<div class="fi-res"><span class="etiq">Reste</span><span class="T ${o.net>=0?'fi-pos':'fi-neg'}">${o.net>=0?'+':'−'} <span data-fin="${Math.abs(o.net)}">0</span> €</span></div>`
    :`<div class="fi-res"><span class="etiq">Déjà signé ou vendu</span><span class="T ${o.sur>=0?'fi-pos':'fi-neg'}">${o.sur>=0?'+':'−'} <span data-fin="${Math.abs(o.sur)}">0</span> €</span></div>`;
  const recT=o.joue?o.recette:null,depT=o.joue?o.depense:null;
  return pan(`<div class="fi-d" data-cle="${o.n}${o.joue?'j':''}">
    <div class="rt-ban fi-ban ${o.titre?'fi-or':'fi-rouge'}"><i class="rt-ban-img fi-ban-img"></i><div class="rt-ban-t fi-bant">
      <div><div class="T fi-bn">Split Fight Night <span style="color:var(--rouge-vif)">${o.n}</span></div><div class="fi-bl">${esc(o.ville)} · ${esc(o.salle)} · ${fiD(o.date)}</div></div>${tete}</div></div>
    <div class="fi-cols">
      <div class="fi-col"><div class="fi-colt"><span class="etiq">Recettes</span>${o.joue?`<b class="T">${fiE(recT)}</b>`:''}</div>${recettes}</div>
      <div class="fi-col"><div class="fi-colt"><span class="etiq">Dépenses</span>${o.joue?`<b class="T">${fiE(depT)}</b>`:''}</div>${depenses}</div>
    </div>
    ${o.joue?fiChangements(o):`<div class="fi-chg"><div class="fi-ct"><span class="etiq">Changements pour cette soirée</span><button class="fi-lien" data-figo="carte">Ouvrir la carte ›</button></div>
      <div class="fi-c"><span class="fi-cf fi-pos">▲</span><span class="fi-cl"><b>Diffuseur et partenaires</b><span class="sous">nouveaux contrats depuis le palier du 10 janvier</span></span><span class="T fi-ce fi-pos">${fiSigne(FI_DIFF.apres-FI_DIFF.avant+FI_PART.apres-FI_PART.avant)}</span></div></div>`}
  </div>`,'height:100%','fi-droite');
}

/* ---- Les bourses : une carte par catégorie, puis la catégorie choisie ---- */
const fiCatsDe=sx=>CATS[sx].map(([cat,court,kg])=>{const l=COMBATTANTS.filter(c=>c.cat===cat&&!c.ext&&euros(c.contrat[1]));
  const tot=l.reduce((t,c)=>t+euros(c.contrat[1]),0);return {cat,court,kg,l,moy:Math.round(tot/l.length/100)*100,fins:l.filter(c=>c.contrat[0]===1),haut:l.reduce((m,c)=>!m||euros(c.contrat[1])>euros(m.contrat[1])?c:m,null),an:fiVerseCat(cat)};});
function fiBourses(){
  const F=S.fi,cats=fiCatsDe(F.sexe),max=Math.max(...cats.map(x=>x.moy));
  if(!cats.some(x=>x.cat===F.cat))F.cat=cats[0].cat;
  const l=[...cats].sort((a,b)=>a.kg-b.kg); /* du plus léger au plus lourd, sans bouton de tri (retour du 15/11) */
  const carte=(x,i)=>`<button class="fi-k oct ${x.cat===F.cat?'sel':''} ${F.anim?'apparait':''}" style="animation-delay:${i*45}ms" data-ficat="${esc(x.cat)}"><span class="fi-ki oct">
      <span class="fi-kh"><span class="T fi-kn">${esc(x.court)}</span><span class="sous">${x.kg} kg · ${x.l.length} sous contrat</span></span>
      <span class="fi-kc"><span class="T fi-kv"><span data-fin="${x.moy}">0</span> €</span><span class="sous">en moyenne par combat</span></span>
      <span class="fi-kj"><i style="--p:${x.moy/max*100}%;animation-delay:${200+i*45}ms"></i></span>
      <span class="fi-kb"><span class="fi-kr"><span class="sous">Versé en 2026</span><b>${fiE(x.an.v)}</b></span><span class="fi-kr fi-kr2"><span class="sous">Plus haute</span><b>${fiE(euros(x.haut.contrat[1]))}</b></span><span class="fi-kt2">${lien(x.haut)}</span></span></span></button>`;
  return `${fiBandeauB()}<div class="fi-g"><div class="fi-mur fi-mur-${F.sexe}">${l.map(carte).join('')}</div>${fiCatPanneau(cats.find(x=>x.cat===F.cat))}</div>`;
}
/** Le bandeau des bourses : tout l'effectif sous contrat, ce qui a été versé en 2026, la plus haute bourse. */
function fiBandeauB(){
  const tous=COMBATTANTS.filter(c=>!c.ext&&euros(c.contrat[1])),moy=Math.round(tous.reduce((t,c)=>t+euros(c.contrat[1]),0)/tous.length/100)*100;
  const verse=fiJouees().filter(o=>o.date.getFullYear()===2026).reduce((t,o)=>t+o.dep.fixe+o.dep.vict+o.dep.primes,0);
  const haut=tous.reduce((m,c)=>!m||euros(c.contrat[1])>euros(m.contrat[1])?c:m,null),fins=tous.filter(c=>c.contrat[0]===1).length;
  const st=(l,v,s)=>`<div class="stat-b fi-st"><span class="etiq">${l}</span><span class="T fi-stv">${v}</span><span class="sous">${s}</span></div>`;
  return `<div class="bandeau fi-band ${S.fi.anim?'apparait':''}"><i class="bandeau-img"></i>
    <div class="fi-bt"><span class="etiq">Sous contrat</span><span class="T fi-caisse"><span data-fin="${tous.length}">0</span></span><span class="sous">combattants, hommes et femmes</span></div>
    ${st('Bourse moyenne',`<span data-fin="${moy}">0</span> €`,'par combat, victoire comprise')}
    ${st('Versé en 2026',`<span data-fin="${verse}">0</span> €`,'bourses et primes, 7 soirées')}
    <div class="stat-b fi-st"><span class="etiq">Plus haute</span><span class="T fi-stv">${fiE(euros(haut.contrat[1]))}</span><span class="sous fi-sth">${lien(haut)}</span></div>
    ${st('Fins de contrat',`<span data-fin="${fins}">0</span>`,'dernier combat à venir')}</div>`;
}
const fiAffiche=id=>!S.rs.apres&&S.af.m.concat(S.af.p).some(f=>f.a===id||f.b===id);
/** Ce que la catégorie a coûté en 2026 : bourses et primes de ses combattants, soirée par soirée (les mêmes que dans « La caisse »). */
function fiVerseCat(cat){let v=0,n=0;fiJouees().filter(o=>o.date.getFullYear()===2026).forEach(o=>rsSoiree(o.n).combats.forEach((f,i)=>{if(f.cat!==cat)return;n++;
  ['a','b'].forEach(sd=>{const c=sd==='a'?f.A:f.B,b=fiBourse(c,i===0);v+=b/2+(f.g===sd?b/2:0)+((f.pr||{})[sd]||[]).reduce((t,p)=>t+primeDe(p,o.n),0);});}));return {v,n};}
function fiCatPanneau(x){
  const tri=[...x.l].sort((a,b)=>euros(b.contrat[1])-euros(a.contrat[1])),max=euros(tri[0].contrat[1]),tot=x.l.reduce((t,c)=>t+euros(c.contrat[1]),0);
  const rang=c=>c.rang==='C'?`<span class="marque octr fi-c8">C</span>`:`<span class="fi-rg">n° ${c.rang}</span>`;
  const haut=tri.slice(0,4).map((c,i)=>{const b=euros(c.contrat[1]);return `<div class="fi-h" style="animation-delay:${200+i*60}ms">${rang(c)}<span class="fi-hn">${lien(c)}</span>
    <span class="fi-hj"><i style="--p:${b/max*100}%;animation-delay:${300+i*60}ms"></i></span><span class="T fi-hv">${fiE(b)}</span></div>`;}).join('');
  const fins=[...x.fins].sort((a,b)=>euros(b.contrat[1])-euros(a.contrat[1])).map(c=>`<div class="fi-f">${rang(c)}<span class="fi-hn">${lien(c)}${fiAffiche(c.id)?'<span class="sous fi-af"> · à l’affiche le 16 févr.</span>':''}</span><span class="fi-fb">${fiE(euros(c.contrat[1]))}</span><button class="fi-lien" data-fiprol="${c.id}">Prolonger ›</button></div>`).join('');
  const fait=(l,v,s)=>`<div class="rc-fait oct fi-fait"><div class="etiq">${l}</div><div class="T">${v}</div><div class="sous">${s}</div></div>`;
  return pan(`<div class="fi-d" data-cle="${esc(x.cat)}">
    <div class="rt-ban fi-ban"><i class="rt-ban-img fi-ban-img"></i><div class="rt-ban-t"><div class="T fi-bn">${esc(x.cat.replace(/ F$/,''))}</div><div class="fi-bl">${S.fi.sexe==='F'?'Femmes':'Hommes'} · ${x.kg} kg</div></div></div>
    <div class="rc-faits fi-faits">${fait('Combats en 2026',`<span data-fin="${x.an.n}">0</span>`,`${x.l.length} combattants sous contrat`)}${fait('Fins de contrat',`<span data-fin="${x.fins.length}">0</span>`,'dernier combat à venir')}</div>
    <div class="etiq fi-sect">Plus hautes bourses</div><div class="fi-hauts">${haut}</div>
    <div class="etiq fi-sect">Dernier combat sous contrat</div><div class="fi-fins">${fins||'<div class="sous">Aucun contrat ne finit dans cette catégorie.</div>'}</div>
  </div>`,'height:100%','fi-droite');
}

function fiHtml(){
  fiGarder();
  if(S.fi.onglet==='bourses')return `<div class="rc fi">${fiHaut()}${fiBourses()}</div>`;
  if(S.fi.onglet==='primes')return `<div class="rc fi pm">${fiHaut()}${pmHtml()}</div>`;
  return `<div class="rc fi">${fiHaut()}${fiBandeau()}<div class="fi-g">${fiSolde()}${fiDetail()}</div></div>`;
}

/* ---- Mouvement : les chiffres défilent, une fois par changement ---- */
function fiCompter(){
  const calme=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  document.querySelectorAll('.fi [data-fin]').forEach((e,i)=>{const v=+e.dataset.fin;
    if(calme||(!S.fi.anim&&e.closest('.fi-band,.fi-k'))){e.textContent=nb(v);return;}
    const t0=performance.now()+Math.min(i,12)*35,f=t=>{const k=Math.max(0,Math.min(1,(t-t0)/700)),x=1-Math.pow(1-k,3);e.textContent=nb(v*x);if(k<1)requestAnimationFrame(f);};requestAnimationFrame(f);setTimeout(()=>{e.textContent=nb(v);},1500);});
}

/* ---- Branchement dans le cadre ---- */
const fiRendreBase=rendre;
rendre=function(){
  if(S.ecran!=='finances'){fiRendreBase();return;}
  rendreBarre();rendreEntete('Finances');$('#alerte').classList.remove('af-al');
  if(S.rs.apres&&typeof rsAlerte==='function')rsAlerte();else msAlerte();
  $('#corps').style.top='152px';
  const cle=($('.fi .fi-d')||{dataset:{}}).dataset.cle;
  $('#corps').innerHTML=fiHtml();
  fiCourbe();fiSuivre();
  const d=$('.fi .fi-d');if(d&&!S.fi.anim&&cle===d.dataset.cle){d.classList.add('fi-fixe');document.querySelectorAll('.fi [data-fin]').forEach(e=>e.textContent=nb(+e.dataset.fin));}
  else fiCompter();
  S.fi.anim=false;
  $('#zone').classList.toggle('fiche-ouverte',!!S.fiche);
};
const fiAllerBase=aller;
aller=function(ec){
  if(ec!=='finances'){fiAllerBase(ec);return;}
  if(S.fiche)fermerFiche(false);
  if(S.ecran!==ec){S.hist.push(S.ecran);S.futur=[];S.fi.anim=true;}
  S.ecran=ec;rendre();
};
/* Retour et Avant à l'intérieur de l'écran : l'onglet, la soirée, la catégorie, le filtre et le tri sont des pas du parcours. */
function fiPas(maj){S.hist.push({fi:fiEtat()});S.futur=[];maj();rendre();}
const fiRetourBase=retour;
retour=function(){
  while(S.ecran!=='finances'&&S.hist.length&&S.hist[S.hist.length-1]&&S.hist[S.hist.length-1].fi)S.hist.pop();
  const h=S.hist[S.hist.length-1];
  if(S.ecran==='finances'&&!S.fiche&&h&&h.fi){S.hist.pop();S.futur.push({fi:fiEtat()});Object.assign(S.fi,JSON.parse(h.fi),{anim:true});rendre();return;}
  fiRetourBase();
};
function fiAvancer(){
  const f=S.futur[S.futur.length-1];
  if(S.ecran==='finances'&&!S.fiche&&f&&f.fi){S.futur.pop();S.hist.push({fi:fiEtat()});Object.assign(S.fi,JSON.parse(f.fi),{anim:true});rendre();return true;}
  return false;
}
const fiOuvrirBase=ouvrirFiche;
ouvrirFiche=function(id,garderFutur=false){
  if(S.ecran!=='finances'){fiOuvrirBase(id,garderFutur);return;}
  if(!garderFutur)S.futur=[];
  if(S.fiche&&S.fiche!==id)S.ficheHist.push(S.fiche);
  S.fiche=id;S.panCat=false;rendre();rendreFiche();setTimeout(()=>$('#fiche').classList.add('ouverte'),30);
};
/* Continuer : les préventes avancent dans le bandeau (cadre), puis le détail de la 63 suit. */
const fiContinuerBase=continuer;
continuer=function(){fiContinuerBase();if(S.ecran==='finances')setTimeout(()=>{if(S.ecran==='finances'&&!S.fiche)rendre();},1500);};

/* ---- Clics ---- */
document.addEventListener('click',e=>{
  if(S.ecran!=='finances')return;
  const t=e.target;let el;
  if(t.closest('#bAvant')&&!S.fiche&&fiAvancer()){e.stopImmediatePropagation();return;}
  if(t.closest('#bRetour')&&!S.fiche){const h=S.hist[S.hist.length-1];if(h&&h.fi){e.stopImmediatePropagation();retour();return;}}
  if(t.closest('#bContinuer')&&S.rs.apres){e.stopImmediatePropagation();toast('Continuer reprend le temps jour par jour jusqu’au prochain message (hors de cette maquette).');return;}
  if(t.closest('#bContinuer')){e.stopImmediatePropagation();continuer();return;}
  if(S.fiche||t.closest('[data-fiche]')||!t.closest('#corps'))return;
  const F=S.fi;
  if((el=t.closest('[data-fiong]'))){e.stopImmediatePropagation();const v=el.dataset.fiong;if(v!==F.onglet)fiPas(()=>{F.onglet=v;F.anim=true;});return;}
  if((el=t.closest('[data-fif]'))){e.stopImmediatePropagation();const [k,v]=el.dataset.fif.split(':');if(F[k]!==v)fiPas(()=>{F[k]=v;F.anim=true;if(k==='sexe')F.cat=CATS[v].some(x=>x[0]===F.cat)?F.cat:(v==='F'?'Poids paille F':'Poids léger');});return;}
  if((el=t.closest('[data-fisel]'))){e.stopImmediatePropagation();const n=+el.dataset.fisel;if(n!==fiSel())fiPas(()=>{F.sel=n;});return;}
  if((el=t.closest('[data-ficat]'))){e.stopImmediatePropagation();const c=el.dataset.ficat;if(c!==F.cat)fiPas(()=>{F.cat=c;});return;}
  if((el=t.closest('[data-firesu]'))){e.stopImmediatePropagation();S.rs.sel=+el.dataset.firesu;S.rs.vue='resultats';S.rs.det=null;aller('resultats');return;}
  if((el=t.closest('[data-figo]'))){e.stopImmediatePropagation();aller(el.dataset.figo);return;}
  if((el=t.closest('[data-fiprol]'))){e.stopImmediatePropagation();S.onglet='Contrat';ouvrirFiche(el.dataset.fiprol);return;}
  if(t.closest('[data-fiprimes]')){e.stopImmediatePropagation();pmOuvrir();return;}
},true);

/* ---- Lancement : ?ecran=finances, options vue=caisse|bourses, soiree=<56…63>, sexe=H|F, categorie=<catégorie> (onglet et cat sont pris par la fiche), apres=1 (après la 63), fiche=<id> ---- */
window.addEventListener('DOMContentLoaded',()=>{
  const q=new URLSearchParams(location.search);
  if(q.get('ecran')!=='finances')return;
  if(q.get('apres')){Object.assign(S.af.m[2],{b:'bello'});Object.assign(S.af.m[3],{a:'labbe',b:'darras'});rsJouer63();}
  if(q.get('vue'))S.fi.onglet=q.get('vue');if(q.get('soiree'))S.fi.sel=+q.get('soiree');
  if(q.get('sexe'))S.fi.sexe=q.get('sexe');if(q.get('categorie'))S.fi.cat=q.get('categorie');
  S.ecran='finances';S.hist=['accueil'];S.fi.anim=true;rendre();
  if(q.get('fiche'))setTimeout(()=>ouvrirFiche(q.get('fiche')),80);
});
/* La courbe se redessine si sa place change (polices chargées, fenêtre) ; sans rejouer l'animation. */
const FI_RO=typeof ResizeObserver==='function'?new ResizeObserver(es=>{for(const e of es){const el=e.target,k=el.clientWidth+'x'+el.clientHeight;if(el.dataset.k&&el.dataset.k!==k){el.dataset.k=k;fiCourbe();}else el.dataset.k=k;}}):null;
const fiSuivre=()=>{const el=$('#fiCourbe');if(el&&FI_RO){el.dataset.k=el.clientWidth+'x'+el.clientHeight;FI_RO.observe(el);}};
