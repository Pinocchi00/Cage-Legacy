"use strict";
/* Maquette lot 1 — La présentation et le face-à-face d'un combat (R10 ; Q10a à Q10c).
   Préfixe pz- (classes), pz / PZ_ (fonctions, constantes). Chargé en dernier, après arrivee.js. Un écran « presentation »
   ouvert depuis la Carte (boutons Présentation et Face-à-face du combat ouvert), avec deux vues qui sont des pas du parcours :
     - pres : l'enjeu et leur histoire datée, comment chacun gagne et perd, ce que disent les trois médias présentés (Q10c) ;
     - face : les chiffres l'un contre l'autre avec le marqueur du meilleur côté (Q10b), leurs derniers combats.
   Retour du 20/11 : l'écran des dossiers de Leïla est retiré (la Carte validée garde son encadré, inchangé).
   Données : l'effectif (cadre.js), l'historique et les statistiques de la fiche (fiche.js, fiche2.js : historique, stats,
   finDe), la carte du 16 février (affiche.js : S.af, AF_LEILA, AF_HIST, AF_DEMANDES, afRaisons), la Presse (presse.js :
   PR_MEDIAS, PR_ART, PR_DEFIS). Les textes des médias sont inventés : À RELIRE. */

/* ---- Réglages de l'écran : la dernière vue d'un combat, gardée au retour ---- */
const PZ_CLE='maquette-presentation-1';
const PZ_VUES=['pres','face'];
S.pz={vue:'pres',place:'m0',a:null,b:null,marq:'point',anim:true,vueCombat:'pres'};
try{const g=JSON.parse(localStorage.getItem(PZ_CLE))||{};if(['pres','face'].includes(g.vueCombat))S.pz.vueCombat=g.vueCombat;
}catch(e){}
function pzGarder(){try{localStorage.setItem(PZ_CLE,JSON.stringify({vueCombat:S.pz.vueCombat}));}catch(e){}}
const pzEtat=()=>JSON.stringify({vue:S.pz.vue,place:S.pz.place,a:S.pz.a,b:S.pz.b});

/* ---- Cohérence des historiques (écart repéré le 19/11, à reprendre dans fiche.js ou le lot « Monde crédible », T8) ----
   Le générateur de fiche.js tire les adversaires d'une liste (ADV) qui contient des combattants de Split, sans écrire le combat
   dans la fiche de l'adversaire : Bello « bat Belkacem » en 2024, Keller aussi, Belkacem se bat lui-même à la Fight Night 41.
   Deux règles, appliquées à toutes les fiches (même source pour tous les écrans) :
     1. les combats fixés de Nana (fiche.js, fiche2.js : Darras, Carvalho, Belkacem, Kessler ; Mezouar l'est déjà) entrent
        aussi dans la fiche de l'adversaire, à la place du combat de même issue le plus proche : bilan et série inchangés ;
     2. un adversaire tiré par erreur de la liste ADV (un nom de Split dont la fiche n'a pas le combat, ou lui-même) est
        remplacé par un autre nom de la liste. Les adversaires des combattantes (des combattantes de leur catégorie,
        choix de classements.js) ne sont pas touchés. */
const PZ_ANON_H=()=>ADV.filter(n=>!COMBATTANTS.some(c=>`${c.prenom} ${c.nom}`===n));
let PZ_FIXES=null;
function pzFixes(){
  if(PZ_FIXES)return PZ_FIXES;PZ_FIXES=[];
  const n=parId('nana'),h=historique.pzBase(n);
  for(const f of h.slice(0,5)){f.pzFixe=true;const x=COMBATTANTS.find(c=>`${c.prenom} ${c.nom}`===f.adv);if(x&&!f.lien)PZ_FIXES.push({x,f,de:n});}
  return PZ_FIXES;
}
function pzCorriger(c,h){
  pzFixes();
  const nom=`${c.prenom} ${c.nom}`,fixe=f=>f.lien||f.pzFixe;
  for(const {x,f,de} of pzFixes()){if(x!==c)continue;
    const res=f.res==='v'?'d':'v',deNom=`${de.prenom} ${de.nom}`;
    if(h.some(g=>g.adv===deNom&&g.date.getTime()===f.date.getTime()))continue;
    const cands=h.filter(g=>g.res===res&&!fixe(g)).sort((a,b)=>Math.abs(a.date-f.date)-Math.abs(b.date-f.date));
    if(!cands.length)continue;
    Object.assign(cands[0],{date:new Date(f.date),soiree:f.soiree,adv:deNom,lien:de.id,meth:[...f.meth],rd:f.rd,tps:f.tps,pzFixe:true});
    const fx=FINS_FIXES[nom+'|'+f.soiree];if(fx)FINS_FIXES[deNom+'|'+f.soiree]=fx;
  }
  h.sort((a,b)=>b.date-a.date);
  if(COMBATTANTS.includes(c)&&h[0]&&h[0].date.getTime()!==c.dernier.getTime())c.dernier=new Date(h[0].date);
  const liste=PZ_ANON_H(),r=graine(c.id+'pz');
  for(const f of h){if(fixe(f)||!ADV.includes(f.adv)&&f.adv!==nom)continue;
    const x=COMBATTANTS.find(y=>`${y.prenom} ${y.nom}`===f.adv);if(!x)continue;
    if(x!==c&&historique.pzBase(x).some(g=>g.adv===nom&&g.date.getTime()===f.date.getTime()))continue;
    const libres=liste.filter(n=>!h.some(g=>g.adv===n));f.adv=(libres.length?libres:liste)[Math.floor(r()*(libres.length||liste.length))];}
}
{const base=historique;historique=function(c){const h=base(c);if(!h._pz){h._pz=true;pzCorriger(c,h);}return h;};historique.pzBase=base;}

/* ---- Lecture des données partagées ---- */
const pzCle=(x,y)=>[x,y].sort().join('|');
const pzNomC=c=>`${c.prenom} ${c.nom}`;
const pzRang=c=>c.rang==='C'?AF_C:`<span class="af-rgb octr">${esc(c.rang)}</span>`;
const pzRangTxt=c=>c.rang==='C'?'champion':`n° ${c.rang}`;
const pzOrd=n=>n===1?'1er':`${n}e`;
const pzCat=c=>courte(c.cat).toLowerCase()+(/ F$/.test(c.cat)?' F':'');
const pzN=c=>`<span class="nom" data-fiche="${c.id}">${esc(c.nom)}</span>`;
const pzRelire='<span class="relire">à relire</span>';
/** Les combats d'une place de la carte : la place choisie par Leïla, ou celle où la paire est déjà affichée. */
function pzPlaceDe(a,b){for(const k of afCles()){const f=afFight(k);if(f.a&&f.b&&[f.a,f.b].sort().join()===[a,b].sort().join())return k;}return null;}
/** Déjà affrontés : seulement si les deux fiches le disent (même date). Sinon, rien n'est affirmé (écart signalé). */
function pzDeja(A,B){
  return historique(A).filter(f=>f.adv===pzNomC(B)&&historique(B).some(g=>g.adv===pzNomC(A)&&g.date.getTime()===f.date.getTime()));
}
/** Adversaires communs : même nom dans les deux historiques, hors eux-mêmes. */
function pzCommuns(A,B){
  const hA=historique(A),hB=historique(B),out=[];
  for(const f of hA){if([pzNomC(A),pzNomC(B)].includes(f.adv)||out.some(o=>o.adv===f.adv))continue;
    const g=hB.find(x=>x.adv===f.adv);if(g&&pzFiable(A,f)&&pzFiable(B,g))out.push({adv:f.adv,fa:f,fb:g});}
  return out.sort((x,y)=>Math.max(y.fa.date,y.fb.date)-Math.max(x.fa.date,x.fb.date));
}
/** Comment un combat a fini, comme l'onglet Combats de la fiche (finDe). */
function pzFin(f){const [t,d]=finDe(f);
  return t==='Décision'?`décision ${d.toLowerCase()}`:t==='Arrêt du médecin'?`arrêt du médecin, ${pzOrd(f.rd)} round`:`${t==='Soumission'?d.toLowerCase():t}, ${pzOrd(f.rd)} round`;}
/** La fin en court, pour une ligne étroite : « soumission, 2e round », « décision ». */
const pzFinC=f=>{const t=finDe(f)[0];return t==='Décision'?'décision':`${t==='Arrêt du médecin'?'médecin':t==='Soumission'?'soumission':t}, ${pzOrd(f.rd)} round`;};
const pzType=f=>{const t=finDe(f)[0];return t==='KO'||t==='TKO'?'ko':t==='Soumission'?'sou':t==='Décision'?'dec':'med';};
function pzBilanFins(c){
  const h=historique(c),o={v:{ko:0,sou:0,dec:0,med:0},d:{ko:0,sou:0,dec:0,med:0}};
  for(const f of h)if(f.res==='v'||f.res==='d')o[f.res][pzType(f)]++;
  return o;
}
const pzMoisC=d=>`${MOIS_C[d.getMonth()]} ${d.getFullYear()}`;
/** Un fait tiré d'une fiche n'est repris que s'il ne contredit aucune autre fiche : un adversaire de Split doit avoir
    le combat dans la sienne, à la même date (sinon c'est un écart du générateur d'historique, signalé dans comparaison.html). */
let PZ_CANON=null;
/** Les combats fixés par la fiche (fiche2.js), repris par les Résultats et la Presse : leurs dates, par combattant. */
function pzCanon(){
  if(PZ_CANON)return PZ_CANON;PZ_CANON={};
  for(const c of COMBATTANTS)for(const f of historique(c))if(FINS_FIXES[f.adv+'|'+f.soiree])
    for(const n of [pzNomC(c),f.adv])(PZ_CANON[n]=PZ_CANON[n]||[]).push(f.date.getTime());
  return PZ_CANON;
}
function pzFiable(c,f){
  if(f.lien||FINS_FIXES[f.adv+'|'+f.soiree])return true;
  /* Un autre combat à moins de 45 jours d'un combat fixé ailleurs : la fiche se contredit (Darras le 7 et le 8 décembre). */
  if((pzCanon()[pzNomC(c)]||[]).some(t=>Math.abs(t-f.date.getTime())<45*864e5))return false;
  const x=COMBATTANTS.find(y=>pzNomC(y)===f.adv);if(!x)return true;
  if(x===c)return false;
  return historique(x).some(g=>g.adv===pzNomC(c)&&g.date.getTime()===f.date.getTime());
}
/** Série en cours : « 5 victoires de suite », « 1 défaite ». La série est rangée du plus ancien au plus récent. */
function pzSerieTxt(c){const s=c.serie,x=s.slice(-1);let n=0;for(let i=s.length-1;i>=0&&s[i]===x;i--)n++;
  return x==='v'?(n>1?`${n} victoires de suite`:'1 victoire'):(n>1?`${n} défaites de suite`:'1 défaite');}

/* ---- Les médias (Presse, Q10c : noms gardés en attendant ta décision) ---- */
/* Le sondage des lecteurs du Forum : celui de la Presse (12 janv.) pour les combats annoncés avant ce jour. */
const PZ_SONDAGE={'mezouar|nana':{pour:'mezouar',p:61,votes:3140},'meziane|rachidi':{pour:'rachidi',p:74,votes:3140}};
/** Le pronostic d'un média, tiré des mêmes chiffres que la fiche. Phrases À RELIRE. */
function pzProno(m,A,B){
  if(m==='lf'){const s=PZ_SONDAGE[pzCle(A.id,B.id)];if(!s)return null;const W=parId(s.pour);return {W,txt:`${s.p} % des ${nb(s.votes)} votes`,p:s.p};}
  if(m==='ch'){
    const W=afRangN(A)<=afRangN(B)?A:B,L=W===A?B:A;
    const txt=pzCle(A.id,B.id)==='mezouar|nana'?'« Nana a gagné ses trois combats pour la ceinture depuis août 2025. Il la garde. »'
      :`« ${W.nom} est ${pzRangTxt(W)}, ${L.nom} ${pzRangTxt(L)}. ${W.nom} reste sur ${pzSerieTxt(W)}. »`;
    return {W,txt};
  }
  const s=c=>{const x=stats(c);return (x.fpm-x.enc)+.6*(x.am*x.amR/100)+.5*x.sub;};
  const W=s(A)>=s(B)?A:B,x=stats(W),fin=pzBilanFins(W).v,lim=(fin.ko+fin.sou+fin.med)/Math.max(1,W.v)>=.55;
  return {W,meth:lim?'avant la limite':'aux points',txt:`« ${W.nom} : ${virg(x.fpm)} frappes significatives par minute, ${virg(x.enc)} encaissées. »`};
}
/** Ce qu'un média a écrit d'eux depuis décembre (articles de la Presse, même source que le Fil). */
function pzArticle(m,A,B){
  const nomA=new RegExp(A.nom),nomB=new RegExp(B.nom);
  return PR_ART.filter(a=>a.m===m&&(nomA.test(a.t)||nomB.test(a.t))).sort((x,y)=>y.d-x.d)[0]||null;
}

/* ==== Bannière d'un combat : l'affiche (présentation et face-à-face) ====
   Le tunnel du jeu est centré sur le VS (centre de l'image mesuré : 1 234 × 535 px sur 1 920 × 1 080). */
function pzHero(A,B){
  const k=pzPlaceDe(A.id,B.id),f={a:A.id,b:B.id},t=afTitre(f),r=k?afRounds(k,f):(t?5:3);
  const cote=(c,s)=>`<div class="pz-hc ${s}"><div class="pz-hc1">${s==='a'?pzRang(c):''}<span>${esc(c.prenom)}${c.surnom?` « ${esc(c.surnom)} »`:''}</span>${s==='b'?pzRang(c):''}</div>
    <div class="T pz-hc-n" style="${afNomStyle(c.nom,afTaille(c.nom,124,560))}">${pzN(c)}</div>
    <div class="pz-hc3">${s==='a'?`<span class="T">${bilan(c)}</span>${serie(c.serie)}`:`${serie(c.serie)}<span class="T">${bilan(c)}</span>`}</div>
    <div class="pz-hc4">${(S.pz.vue==='face'?[`n° ${c.mondial} mondial`,`${c.taille}`,`allonge ${c.allonge}`]:[`n° ${c.mondial} mondial`,`${c.age} ans`,c.art||c.style]).map(x=>`<span class="oct">${esc(x)}</span>`).join('')}</div></div>`;
  return `<div class="pz-banw oct ${t?'or':''}"><div class="pz-ban oct"><i class="pz-img"></i><i class="pz-flash"></i><i class="pz-reflet"></i>${cote(A,'a')}
    <div class="pz-mil"><span class="pz-quand">16 févr. · Forum de Lille</span><div class="pz-vsw octr"><div class="pz-vsr octr"><div class="pz-vs octr T">VS</div></div></div>
      <div class="pz-chip oct">${t?'<b>Titre</b><i></i>':''}${esc(afCourt(A.cat))}<i></i>${r} rounds</div></div>${cote(B,'b')}</div></div>`;
}
/** Le sous-menu du combat (R10 : les sous-menus se voient) et ce qui situe le combat sur la carte. */
function pzOnglets(A,B){
  const k=pzPlaceDe(A.id,B.id),v=S.pz.vue;
  const ou=k?`${esc(afRole(k))} · 16 févr. · Forum de Lille`:`Pas encore sur la carte · ${esc(afRole(S.pz.place).toLowerCase())}`;
  const placer=!k&&pzPeutPlacer(A,B)?`<button class="bouton jaune cj pz-placer" data-pzplacer="${A.id}|${B.id}">Placer sur la carte ${ico('avant',22,3)}</button>`:'';
  return `<div class="pz-ongs"><button class="onglet oct ${v==='pres'?'ouvert':''}" data-pzvue="pres">Présentation</button>
    <button class="onglet oct ${v==='face'?'ouvert':''}" data-pzvue="face">Face-à-face</button><span class="pz-ou">${ou}</span>${placer}</div>`;
}
function pzPeutPlacer(A,B){
  const f=afFight(S.pz.place);if(afComplet(f))return false;
  const ok=c=>{const e=afEtat(c);return e.ok||e.eng===S.pz.place;};
  const fixe=f.a||f.b;return ok(A)&&ok(B)&&(!fixe||fixe===A.id||fixe===B.id)&&A.cat===B.cat;
}

/* ==== Vue « pres » : l'enjeu et leur histoire, comment ils gagnent, ce qu'en dit la presse ==== */
/** Le titre du combat : celui du dossier de Leïla, sinon la première raison de la Carte. */
function pzTitre(A,B){
  for(const [x,y] of [[A,B],[B,A]]){const d=(AF_LEILA[x.id]||[]).find(([id])=>id===y.id);if(d)return d[1];}
  const k=pzPlaceDe(A.id,B.id)||S.pz.place,r=afRaisons(k,{a:A.id,b:B.id}).find(x=>x[0]==='p');return r?r[1]:'Premier combat entre eux';
}
function pzHistoire(A,B){
  const deja=pzDeja(A,B),ev=[];
  for(const f of deja){const w=f.res==='v'?A:B,l=w===A?B:A;ev.push({d:f.date,t:`${pzN(w)} bat ${pzN(l)} : ${esc(pzFin(f))}, ${esc(f.soiree)}.`});}
  for(const x of PR_DEFIS)if(pzCle(x.de,x.vers)===pzCle(A.id,B.id)){const a=prArt(x.art);ev.push({d:a.d,t:`${pzN(parId(x.de))} réclame ${pzN(parId(x.vers))} dans ${esc(PR_MEDIAS[a.m].nom)} : <button class="pz-lien" data-prouvre="${a.id}">${esc(x.dit)}</button>`});}
  const cm=pzCommuns(A,B)[0];
  if(cm){const r=(c,f)=>`${pzN(c)} ${f.res==='v'?'l’a battu':'a perdu'} (${esc(pzFin(f).replace(/, \d.*$/,''))}, ${pzMoisC(f.date)})`;
    ev.push({d:new Date(Math.max(cm.fa.date,cm.fb.date)),t:`Adversaire commun, ${lien(parNom(cm.adv,A.cat))} : ${r(A,cm.fa)} ; ${r(B,cm.fb)}.`});}
  const vus=new Set();
  for(const c of [A,B]){const a=PR_ART.filter(x=>new RegExp(c.nom).test(x.t)&&!PR_DEFIS.some(d=>d.art===x.id&&pzCle(d.de,d.vers)===pzCle(A.id,B.id))).sort((x,y)=>y.d-x.d)[0];
    if(a&&!vus.has(a.id)){vus.add(a.id);ev.push({d:a.d,t:`${esc(PR_MEDIAS[a.m].nom)} : <button class="pz-lien" data-prouvre="${a.id}">${prT(a.t)}</button>`,p:1});}}
  for(const c of [A,B]){const f=historique(c)[0];if(f.adv===pzNomC(A)||f.adv===pzNomC(B)||(cm&&f.adv===cm.adv)||!pzFiable(c,f))continue;
    ev.push({d:f.date,t:`${pzN(c)} ${f.res==='v'?'bat':'perd contre'} ${lien(parNom(f.adv,c.cat))} : ${esc(pzFin(f))}.`,p:2});}
  if(!ev.length)ev.push({d:S.date,t:'Premier combat entre eux, et aucun adversaire en commun.'});
  return ev.sort((x,y)=>(x.p||0)-(y.p||0)).slice(0,4).sort((x,y)=>y.d-x.d);
}
function pzEnjeu(A,B){
  const deja=pzDeja(A,B),e=Math.abs(afRangN(A)-afRangN(B)),t=afTitre({a:A.id,b:B.id});
  const qui=[A,B].find(c=>AF_DEMANDES[c.id]),dem=qui&&AF_DEMANDES[qui.id],adv=qui===A?B:A;
  const cases=[t?['Ceinture','En jeu',A.cat.toLowerCase().replace(/ f$/,'')+'s']:['Classement',e?`${e} place${e>1?'s':''}`:'Voisins',"d’écart"],
    ['Déjà affrontés',deja.length?`${deja.length} fois`:'Jamais',deja.length?dMois(deja[0].date):'chez Split'],
    dem?['Sa demande',dem.tenue(adv)?'<span style="color:var(--vert)">Tenue</span>':'<span style="color:var(--neg)">Pas tenue</span>',esc(dem.court.replace(/^veut /,''))]
      :['Bourses',`${nb(afBourse(A)+afBourse(B))} €`,'à eux deux']];
  const h=AF_HIST[pzCle(A.id,B.id)];
  return pan(`<div class="pz-ej-t T">${esc(pzTitre(A,B))}</div>
    ${h?`<div class="pz-note">« ${esc(h)} » ${pzRelire}</div>`:''}
    <div class="etiq pz-h-t">Leur histoire</div>
    <div class="pz-tl">${pzHistoire(A,B).map((x,i)=>`<div class="pz-tli" style="--i:${i}"><span class="pz-tlm octr"></span><span class="pz-tld">${dMois(x.d)}</span><span class="pz-tlt">${x.t}</span></div>`).join('')}</div>
    <div class="etiq pz-h-t">Ce qui fait le combat</div><div class="pz-rai">${afRaisons(pzPlaceDe(A.id,B.id)||S.pz.place,{a:A.id,b:B.id}).slice(0,3).map(afRl).join('')}</div>
    <div class="pz-cases">${cases.map(([e,v,s],i)=>`<div class="pz-cs" style="--i:${i}"><span class="etiq">${e}</span><span class="T">${v}</span><span class="sous">${s}</span></div>`).join('')}</div>`,'','pz-p1');
}
/** Comment ils gagnent et perdent : un papillon, A à gauche, B à droite ; victoires en vert, défaites en rouge (le sens). */
function pzGagne(A,B){
  /* L'arrêt du médecin compte comme un TKO, comme dans les statistiques officielles. */
  const oa=pzBilanFins(A),ob=pzBilanFins(B);for(const o of [oa,ob])for(const r of ['v','d']){o[r].ko+=o[r].med;o[r].med=0;}
  const rows=[['v','ko','KO, TKO'],['v','sou','Soumission'],['v','dec','Décision'],['d','ko','KO, TKO'],['d','sou','Soumission'],['d','dec','Décision']];
  const max=Math.max(1,...rows.map(([r,t])=>Math.max(oa[r][t],ob[r][t])));
  const lim=(o,c)=>Math.round((o.v.ko+o.v.sou+o.v.med)/Math.max(1,c.v)*100);
  const ligne=([r,t,l],i)=>{const a=oa[r][t],b=ob[r][t];
    return `${i===3?'<div class="pz-bf-sep"><span class="etiq">Défaites</span></div>':''}<div class="pz-bf ${r}"><span class="n">${a}</span><span class="g"><i style="width:${a/max*100}%;animation-delay:${.25+i*.06}s"></i></span><span class="l">${l}</span><span class="d"><i style="width:${b/max*100}%;animation-delay:${.25+i*.06}s"></i></span><span class="n">${b}</span></div>`;};
  return pan(`<div class="pz-bf-h"><div><span class="T">${lim(oa,A)} %</span><span class="sous">de ses ${A.v} victoires<br>avant la limite</span></div>
      <div class="pz-bf-hm etiq">Victoires</div>
      <div class="d"><span class="T">${lim(ob,B)} %</span><span class="sous">de ses ${B.v} victoires<br>avant la limite</span></div></div>
    ${rows.map(ligne).join('')}`,'','pz-p2');
}
/* Chaque média a sa couleur d'identité, en décor seulement (comme les organisations) : proposition, à valider. */
const PZ_MED_COUL={ch:'#3D7BD9',tn:'#E9E6E1',lf:'#9B6BDC'};
function pzPresse(A,B){
  const k=pzPlaceDe(A.id,B.id);
  const med=m=>{const M=PR_MEDIAS[m];let corps;
    if(k){const p=pzProno(m,A,B);
      corps=p?`${m==='lf'?`<div class="pz-mj"><span class="jauge"><i style="width:${p.p}%;background:var(--blanc)"></i></span><span class="sous">${esc(p.txt)}</span></div>`:`<div class="pz-mt">${p.meth?`<b>${esc(p.meth[0].toUpperCase()+p.meth.slice(1))}.</b> `:''}${esc(p.txt)}</div>`}`
        :'<div class="pz-mt sous">Pas encore de sondage sur ce combat.</div>';}
    else{const a=pzArticle(m,A,B);
      corps=a?`<div class="pz-mt"><span class="sous">${prDc(a.d)} ·</span> <button class="pz-lien" data-prouvre="${a.id}">${prT(a.t)}</button></div>`
        :'<div class="pz-mt sous">Rien écrit sur eux depuis décembre.</div>';}
    const p=k&&pzProno(m,A,B);
    const droite=k?(p?`<span class="pz-mp"><span class="etiq">Pronostic</span><span class="T">${pzN(p.W)}</span></span>`:''):'';
    return `<div class="pz-m" style="--m:${PZ_MED_COUL[m]}"><div class="pz-mh"><span class="T">${esc(M.nom)}</span>${droite}</div><div class="pz-mq">${esc(M.quoi.split(',')[0].split(' :')[0])} · ${nb(M.n)} ${esc(M.u)}</div>${corps}</div>`;};
  return pan(`<div class="pz-pr-h"><span class="etiq">${k?'La presse':'La presse · pas encore annoncé'}</span>${pzRelire}</div>${['ch','tn','lf'].map(med).join('')}`,'','pz-p3');
}
function pzPres(A,B){
  return `<div class="pz pz-combat pz-pres ${S.pz.anim?'anim':''}">${pzOnglets(A,B)}${pzHero(A,B)}<div class="pz-cols">${pzEnjeu(A,B)}${pzGagne(A,B)}${pzPresse(A,B)}</div></div>`;
}

/* ==== Vue « face » : les chiffres en duel, leurs derniers combats ==== */
/** Les chiffres l'un contre l'autre, comme la première version (retour du 20/11) : la valeur, sa barre vers l'extérieur avec
    le repère blanc de la moyenne de la catégorie (comme la fiche), la mesure au milieu ; le meilleur des deux marqué (Q10b). */
function pzChiffres(A,B){
  const sa=stats(A),sb=stats(B),pt='<span class="pz-pt octr"></span>',vert=S.pz.marq==='vert';
  const ligne=([k,l,u,dir],i)=>{
    const va=sa[k],vb=sb[k],moy=MOY[k],haut=Math.max(va,vb,moy)*1.12,w=x=>Math.max(4,Math.round(x/haut*100));
    const m=va===vb?0:(dir>0?va>vb:va<vb)?1:-1;
    const v=(x,b)=>`<span class="pz-sv ${b?'w':''} ${vert&&b?'vert':''}">${!vert&&b?pt:''}<b>${virg(x)}${u?' '+u:''}</b></span>`;
    const barre=(x,s)=>`<span class="pz-sb ${s}"><i style="width:${w(x)}%;animation-delay:${.15+i*.05}s"></i><u style="${s==='g'?'right':'left'}:${w(moy)}%"></u></span>`;
    return `<div class="pz-st" style="--i:${i}">${v(va,m>0)}${barre(va,'g')}<span class="pz-sl">${l}</span>${barre(vb,'d')}${v(vb,m<0)}</div>`;};
  return pan(titre('Les chiffres',`<span class="pz-lgd">${vert?'<b style="color:var(--vert)">vert</b>':pt} le meilleur<i class="pz-moy"></i>moyenne de la catégorie</span>`)+
    `<div class="pz-sts">${STATS.map(ligne).join('')}</div>`,'','pz-f1');
}
function pzDerniers(A,B){
  const dc=c=>historique(c).slice(0,3).map(f=>`<div class="pz-dc"><span class="marque octr ${f.res}">${f.res.toUpperCase()}</span>
    <span class="pz-dca">${lien(parNom(f.adv,c.cat))}<span class="sous">${esc(pzFinC(f))}</span></span><span class="sous pz-dcd">${pzMoisC(f.date)}</span></div>`).join('');
  const cm=pzCommuns(A,B).slice(0,2);
  const r=f=>`<span class="pz-cmr"><span class="marque octr ${f.res}">${f.res.toUpperCase()}</span><span class="sous">${pzMoisC(f.date)}</span></span>`;
  return pan(titre('Derniers combats')+`<div class="pz-dch"><span class="T">${pzN(A)}</span>${dc(A)}</div><div class="pz-dch"><span class="T">${pzN(B)}</span>${dc(B)}</div>
    <div class="etiq pz-h-t">Adversaires communs</div>
    ${cm.length?cm.map(x=>`<div class="pz-cm">${lien(parNom(x.adv,A.cat))}${r(x.fa)}${r(x.fb)}</div>`).join('')
      :'<div class="sous">Aucun.</div>'}`,'','pz-f2');
}
function pzFace(A,B){
  return `<div class="pz pz-combat pz-face ${S.pz.anim?'anim':''}">${pzOnglets(A,B)}${pzHero(A,B)}<div class="pz-cols">${pzChiffres(A,B)}${pzDerniers(A,B)}</div></div>`;
}

/* ---- Rendu et branchement dans le cadre ---- */
function pzHtml(){
  const v=S.pz.vue,A=parId(S.pz.a),B=parId(S.pz.b);
  if(!A||!B){const f=afFight(S.pz.place);S.pz.a=f.a||'belkacem';S.pz.b=f.b||'bello';return pzHtml();}
  return v==='face'?pzFace(A,B):pzPres(A,B);
}
const pzRendreBase=rendre;
rendre=function(){
  if(S.ecran!=='presentation'){pzRendreBase();return;}
  rendreBarre();const it=$('.barre [data-go="carte"]');if(it)it.classList.add('cur');
  rendreEntete('Carte');afAlerte();const v=$('#alerte .af-valider');if(v)v.remove();
  $('#corps').style.top='152px';$('#corps').innerHTML=pzHtml();
  /* La mesure n'est juste qu'avec les polices et les feuilles chargées : l'enjeu est remesuré quand elles le sont. */
  pzAjuster();Promise.all([document.fonts.ready,new Promise(r=>document.readyState==='complete'?r():addEventListener('load',r,{once:true}))]).then(pzRemesurer);
  $('#zone').classList.toggle('fiche-ouverte',!!S.fiche);
  S.pz.anim=false;
};
/** L'enjeu tient sans défilement : s'il déborde, les faits les moins utiles partent (raisons, puis le plus ancien de l'histoire). */
function pzRemesurer(){
  const el=$('.pz-p1'),A=parId(S.pz.a),B=parId(S.pz.b);if(!el||!A||!B||S.ecran!=='presentation')return;
  const t=document.createElement('div');t.innerHTML=pzEnjeu(A,B);const n=t.firstElementChild;n.style.animation='none';
  el.replaceWith(n);pzAjuster();
}
function pzAjuster(){
  const p=$('.pz-p1 .p3');if(!p)return;
  const deborde=()=>p.scrollHeight>p.clientHeight+1;
  for(let n=0;deborde()&&n<8;n++){
    const r=p.querySelectorAll('.pz-rai .af-rl'),h=p.querySelectorAll('.pz-tli');
    if(r.length>1)r[r.length-1].remove();else if(h.length>2)h[h.length-1].remove();
    else if(r.length){r[0].parentNode.previousElementSibling.remove();r[0].parentNode.remove();}else break;
  }
}
const pzAllerBase=aller;
aller=function(ec){
  if(ec!=='presentation'){pzAllerBase(ec);return;}
  if(S.fiche)fermerFiche(false);
  if(S.ecran!==ec){S.hist.push(S.ecran);S.futur=[];S.pz.anim=true;}
  S.ecran=ec;rendre();
};
/* Retour et Avant à l'intérieur de l'écran : la vue et le combat choisis sont des pas du parcours. */
function pzPas(maj){S.hist.push({pz:pzEtat()});S.futur=[];maj();S.pz.anim=true;rendre();}
const pzAppliquer=v=>{Object.assign(S.pz,JSON.parse(v),{anim:true});};
const pzRetourBase=retour;
retour=function(){
  while(S.ecran!=='presentation'&&S.hist.length&&S.hist[S.hist.length-1]&&S.hist[S.hist.length-1].pz)S.hist.pop();
  const h=S.hist[S.hist.length-1];
  if(S.ecran==='presentation'&&!S.fiche&&h&&h.pz){S.hist.pop();S.futur.push({pz:pzEtat()});pzAppliquer(h.pz);rendre();return;}
  pzRetourBase();
};
function pzAvancer(){
  const f=S.futur[S.futur.length-1];
  if(S.ecran==='presentation'&&!S.fiche&&f&&f.pz){S.futur.pop();S.hist.push({pz:pzEtat()});pzAppliquer(f.pz);rendre();return true;}
  return false;
}
const pzOuvrirBase=ouvrirFiche;
ouvrirFiche=function(id,garderFutur=false){
  if(S.ecran!=='presentation'){pzOuvrirBase(id,garderFutur);return;}
  if(!garderFutur)S.futur=[];
  if(S.fiche&&S.fiche!==id)S.ficheHist.push(S.fiche);
  S.fiche=id;S.panCat=false;rendre();rendreFiche();setTimeout(()=>$('#fiche').classList.add('ouverte'),30);
};

/** Ouvre l'écran depuis la Carte : un pas de plus dans l'historique, Retour ramène à la Carte. */
function pzEntrer(maj){
  if(S.fiche)fermerFiche(false);
  S.hist.push(S.ecran);S.futur=[];S.ecran='presentation';maj();S.pz.anim=true;rendre();
}
function pzVoirCombat(v,a,b){
  const m=()=>{S.pz.vue=v;S.pz.a=a;S.pz.b=b;S.pz.vueCombat=v;pzGarder();};
  if(S.ecran!=='presentation')pzEntrer(m);else pzPas(m);
}
/** Placer : la paire va sur la carte, à la place choisie ; la Carte s'ouvre sur elle. */
function pzPlacer(a,b){
  const k=S.pz.place,f=afFight(k),A=parId(a),B=parId(b);
  if(!pzPeutPlacer(A,B)){toast(`Impossible : ${esc(afRole(k).toLowerCase())} n’accepte pas ce combat.`);return;}
  if(f.a===a||f.a===b){f.b=f.a===a?b:a;}else if(f.b===a||f.b===b){f.a=f.b===a?b:a;}else{f.a=a;f.b=b;}
  S.af.sel=k;S.af.tab='m';S.af.vue='detail';S.af.onglet='enjeu';
  aller('carte');
  toast(`${esc(A.nom)} contre ${esc(B.nom)} : placé en ${esc(afRole(k).toLowerCase())}.`);
}

/* ---- Clics ---- */
document.addEventListener('click',e=>{
  const t=e.target;let el;const stop=()=>e.stopImmediatePropagation();
  if(S.ecran==='carte'&&!S.fiche){
    if(t.closest('[data-afpres]')||t.closest('[data-afface]')){stop();const f=afFight(S.af.sel);if(!afComplet(f))return;
      const v=t.closest('[data-afpres]')?'pres':'face';pzEntrer(()=>{S.pz.vue=v;S.pz.a=f.a;S.pz.b=f.b;S.pz.place=S.af.sel;S.pz.vueCombat=v;pzGarder();});return;}
  }
  if(S.ecran!=='presentation')return;
  if(t.closest('#bAvant')&&!S.fiche&&pzAvancer()){stop();return;}
  if(t.closest('#bRetour')&&!S.fiche){const h=S.hist[S.hist.length-1];if(h&&h.pz){stop();retour();return;}}
  if(S.fiche||t.closest('[data-fiche]')||t.closest('[data-prouvre]')||!t.closest('#corps'))return;
  const P=S.pz;
  if((el=t.closest('[data-pzplacer]'))){stop();const [a,b]=el.dataset.pzplacer.split('|');pzPlacer(a,b);return;}
  if((el=t.closest('[data-pzvoir]'))){stop();const [v,a,b]=el.dataset.pzvoir.split('|');pzVoirCombat(v,a,b);return;}
  if((el=t.closest('[data-pzvue]'))){stop();const v=el.dataset.pzvue;if(v!==P.vue)pzVoirCombat(v,P.a,P.b);return;}
},true);

/* ---- Lancement : ?ecran=presentation, options pzvue=pres|face, pzplace=m0|m1|m2|m3 (le combat de la carte),
   pzpaire=<id>,<id> (une paire pas encore placée), pzmarq=point|vert (Q10b), pzplace2=1 (Belkacem–Bello déjà placé), pzfiche=<id> ---- */
window.addEventListener('DOMContentLoaded',()=>{
  const q=new URLSearchParams(location.search);
  if(q.get('pzmarq')==='vert')S.pz.marq='vert';
  if(q.get('ecran')!=='presentation')return;
  if(q.get('pzplace2'))Object.assign(S.af.m[2],{b:'bello'});
  const pl=q.get('pzplace');if(/^m[0-3]$/.test(pl||''))S.pz.place=pl;
  const v=q.get('pzvue');if(PZ_VUES.includes(v))S.pz.vue=v;
  const pr=(q.get('pzpaire')||'').split(',');
  if(pr.length===2&&parId(pr[0])&&parId(pr[1])){S.pz.a=pr[0];S.pz.b=pr[1];if(!pl)S.pz.place='m2';}
  else{const f=afFight(S.pz.place);if(afComplet(f)){S.pz.a=f.a;S.pz.b=f.b;}else{S.pz.a='belkacem';S.pz.b='bello';}}
  S.ecran='presentation';S.hist=['accueil','carte'];S.pz.anim=true;rendre();
  if(q.get('pzfiche'))setTimeout(()=>ouvrirFiche(q.get('pzfiche')),80);
});
