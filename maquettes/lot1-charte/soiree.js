"use strict";
/* Maquette lot 1 — La soirée en direct, le discours dans la cage, les temps forts et le bilan (R36 à R39 ;
   Q36a, Q36b, Q37a à Q37c, Q38, Q39a, Q39b). Préfixe sd- (classes), sd / SD_ (fonctions, constantes). Chargé en dernier.
   Un écran « soiree » : Split Fight Night 63, le 16 février 2027 au Forum de Lille, la carte complète de la Carte (S.af),
   jouée comme dans les Résultats (RS_63, rsJouer63, rsStats). Les états sont des pas du parcours (Retour et Avant) :
     - direct   : la soirée en cours, la carte dans l'ordre où elle se joue, la salle et l'ambiance (pas de recettes, Q36b) ;
     - fort     : un temps fort dans l'arène vue du dessus (rendu de la caméra « Plafond » du jeu), mêlé au récit (Q38) ;
     - resultat : le verdict qui se dévoile pas à pas, puis reste jusqu'au clic (Q36a) ;
     - discours : l'interview dans la cage, selon la règle de Q37 ;
     - bilan    : la fin de soirée, les vainqueurs, « Revoir » au choix (Q39b), les primes, les chiffres (Q36b) ;
     - recit    : par-dessus le bilan, le combat minute par minute.
   Retours du 20/11 (deuxième passe) : résultat moins brutal et plus lisible, discours refait, temps forts vivants, récit
   visuel, pas de revanche immédiate, les primes se fixent dans les Finances (pas au bilan), bandeau du bilan éclairci.
   Données : effectif (cadre.js), carte (affiche.js), Résultats (resultats.js), Finances (finances.js : fiSoiree),
   primes (fiche2.js : PRIMES_ORGA, medaille), Presse (presentation.js : PZ_SONDAGE). Inventé : À RELIRE. */

/* ---- Réglages gardés : la façon de regarder chaque combat (comme le jeu : Complet, Temps forts, Résultat) ---- */
const SD_CLE='maquette-soiree-1';
const SD_VUES=[['complet','Complet'],['forts','Temps forts'],['resultat','Résultat']];
S.sd={etat:'direct',n:0,k:null,mo:0,revoir:false,anim:true,vues:{}};
try{const g=JSON.parse(localStorage.getItem(SD_CLE))||{};if(g.vues&&typeof g.vues==='object')for(const [k,v] of Object.entries(g.vues))if(SD_VUES.some(x=>x[0]===v))S.sd.vues[k]=v;}catch(e){}
function sdGarder(){try{localStorage.setItem(SD_CLE,JSON.stringify({vues:S.sd.vues}));}catch(e){}}

/* ---- La soirée : ordre de passage (préliminaire 1 en premier, combat principal en dernier, comme le jeu) ---- */
const SD_ORDRE=['p0','p1','p2','p3','p4','p5','m3','m2','m1','m0'];
const SD_DATE=new Date(2027,1,16);
/* Présents dans la salle au début de chaque combat : la salle se remplit jusqu'au combat principal (4 012, Résultats). Inventé, à relire. */
const SD_SALLE=[1240,1690,2150,2580,2930,3270,3580,3810,3950,4012];
/* Le vainqueur était donné à … % par les lecteurs du Forum : le sondage de la Presse (PZ_SONDAGE) pour les deux combats annoncés,
   inventé pour les autres (à relire). Sert à la règle de la surprise (Q37b). */
const SD_SONDAGE={p0:['musaev',68],p1:['gpoidscoqf3',59],p2:['gpoidsmimoyen6',63],p3:['gpoidspaillef4',57],p4:['vanbelle',54],p5:['gpoidslourd10',81],m3:['labbe',72],m2:['bello',56]};
/* Défis lancés au micro (Q37c). Retour du 20/11 : pas de revanche immédiate, donc Mezouar ne réclame personne ;
   Rachidi, n° 1, réclame la championne Kovač (qui n'a pas combattu ce soir). */
const SD_DEFI={m1:'gpoidspaillefC'};
const SD_MICRO='Marc Duval';
/* L'interview (R37) : les questions du commentateur et les réponses, écrites sur ce combat précis (retour du 21/11 :
   « écris tous les dialogues »). Chaque phrase colle aux chiffres du combat (rounds, amenées, série, rang). À RELIRE.
   La dernière réponse porte le défi quand il y en a un (Q37c). */
const SD_ITW={
  m0:[['Ilyas, tu es le nouveau champion des légers. Qu’est-ce que cette ceinture représente ?','Des années de travail. Elle est autant à mon équipe de Marseille qu’à moi. Et respect à [[nana|Parfait]] : il m’a fait mal ce soir, c’est un vrai champion.'],
      ['Il gagne nettement le 3e round, puis tu prends son dos au 4e. C’était le plan ?','Le plan, c’était de l’emmener dans les rounds de championnat. Au 3e, il me touche beaucoup, je le sens. Au 4e, il laisse une ouverture en se relevant : je passe dans le dos et je ne lâche plus.'],
      ['Qui pour ta première défense ?','Ce n’est pas à moi de choisir. Je vais rentrer, soigner tout ça, et je défendrai contre celui que Split mettra en face.']],
  m1:[['Deux juges sur trois. Tu pensais l’avoir gagné ?','Oui. Je prends le premier et le dernier round, et je touche plus sur l’ensemble. Mais c’était serré, je ne vais pas dire le contraire : [[meziane|Lynda]] est très forte au sol.'],
      ['Elle t’amène deux fois au sol au 2e round. Qu’est-ce qui change au 3e ?','Mon coin m’a demandé de rester au centre et de punir ses entrées. Au 3e, je reste debout, là où je suis la plus forte.'],
      ['Cinq victoires de suite. Et maintenant ?','Je suis numéro un. [[gpoidspaillefC|Julia Kovač]] a la ceinture, il ne me reste qu’elle. [[gpoidspaillefC|Julia]], je suis prête quand Split le voudra.']],
  p5:[['Donné à 19 % par les lecteurs du Forum, KO en 1:12. Tu t’y attendais ?','Je ne lis pas les pronostics. Je savais qu’un crochet propre suffirait. Il est arrivé plus tôt que prévu.'],
      ['Ce crochet du droit, vous l’aviez travaillé ?','Toute la préparation. Quand [[gpoidslourd10|Bertin]] lance son direct, sa main gauche descend. On l’a vu sur ses combats et on l’a répété chaque jour.'],
      ['Et la suite ?','Je rentre dans le top 10. Je veux un classé, peu importe lequel. Je ne choisis pas mes adversaires.']],
};
const SD_AMB=['Calme','Attentive','Ça monte','Bruyante','Debout'];
/* Le médecin après les combats : les mêmes que rsJouer63 (Résultats), connus dès la sortie de la cage. */
const SD_MED={nana:['Coupure à l’arcade','19 mars'],bello:['KO, suspendu 60 jours','18 avril'],gpoidslourd10:['KO, suspendu 60 jours','18 avril']};
const sdRelire='<span class="relire">à relire</span>';
/** Une réplique : le texte échappé, les noms marqués [[id|nom]] deviennent cliquables. */
const sdParole=t=>esc(t).replace(/\[\[([a-zA-Z0-9]+)\|([^\]]+)\]\]/g,(x,id,n)=>`<span class="nom" data-fiche="${id}">${n}</span>`);

/* ---- Lecture des combats : la carte de la Carte, les résultats des Résultats, les valeurs d'avant la soirée ---- */
let SD_CARTE=null,SD_AV={},SD_F=null;
function sdInit(){
  if(SD_CARTE)return;
  /* La carte jouée est la carte complète de la maquette Carte (comme les Résultats). */
  if(!S.rs.apres){Object.assign(S.af.m[2],{b:'bello'});Object.assign(S.af.m[3],{a:'labbe',b:'darras'});}
  SD_CARTE=S.rs.apres&&S.rsCarte?{m:S.rsCarte.m,p:S.rsCarte.p}:{m:S.af.m.map(f=>({...f})),p:S.af.p.map(f=>({...f}))};
  for(const f of [...SD_CARTE.m,...SD_CARTE.p])for(const id of [f.a,f.b]){const c=parId(id);
    SD_AV[id]=c._rsAvant?{...c._rsAvant}:{rang:c.rang,mondial:c.mondial,v:c.v,d:c.d,serie:c.serie};}
}
const sdAv=c=>SD_AV[c.id]||c;
function sdF(k){
  if(!SD_F){SD_F={};sdInit();
    SD_ORDRE.forEach((x,i)=>{const c=(x[0]==='m'?SD_CARTE.m:SD_CARTE.p)[+x[1]],A=parId(c.a),B=parId(c.b),d=RS_63[x];
      SD_F[x]={k:x,i,A,B,d,W:d.g==='a'?A:B,L:d.g==='a'?B:A,ws:d.g,ls:d.g==='a'?'b':'a',cat:A.cat,titre:x==='m0',rounds:afRounds(x,c),role:afRole(x)};});}
  return SD_F[k];
}
/** Le combat au format des Résultats (rsStats, rsPhrase) : mêmes graines, donc mêmes chiffres que le relevé. */
function sdRs(f){return f._rs||(f._rs=Object.assign({k:f.k,A:f.A,B:f.B,cat:f.cat},f.d));}
const sdCote=(f,s)=>s==='a'?f.A:f.B;
const sdN=c=>`<span class="nom" data-fiche="${c.id}">${esc(c.nom)}</span>`;
const sdRang=av=>av.rang==='C'?AF_C:`<span class="af-rgb octr">${esc(av.rang)}</span>`;
const sdE=c=>/ F$/.test(c.cat)?'e':'';
const sdQuand=d=>d.meth==='Décision'?`après ${d.n} rounds`:`${rsOrd(d.rd)} round · ${d.tps}`;
const sdMeth=d=>d.meth==='Décision'?`Décision ${d.det}`:d.meth;
const sdDet=d=>d.det.charAt(0).toUpperCase()+d.det.slice(1);
const sdSec=t=>{const [a,b]=t.split(':');return +a*60+ +b;};
const sdMmss=s=>`${Math.floor(s/60)}:${String(Math.round(s%60)).padStart(2,'0')}`;
/** Le bilan après le combat, à partir des valeurs d'avant (même résultat que rsJouer63). */
function sdApres(f,s){const c=sdCote(f,s),av=sdAv(c),g=f.d.g===s;
  return {v:av.v+(g?1:0),d:av.d+(g?0:1),serie:(av.serie+(g?'v':'d')).slice(-5),rang:f.d.nr[s],mondial:f.d.nm[s]};}
/** La chance donnée au vainqueur par les lecteurs du Forum (Presse pour m0 et m1). */
function sdChance(f){
  if(f.k==='m0'||f.k==='m1'){const s=PZ_SONDAGE[pzCle(f.A.id,f.B.id)];return s.pour===f.W.id?s.p:100-s.p;}
  const [pour,p]=SD_SONDAGE[f.k];return pour===f.W.id?p:100-p;
}
/** Q37 : discours si le vainqueur est en combat principal ou co-principal (même après une décision partagée),
    ou si c'est une surprise : 10 rangs d'écart ou plus, ou vainqueur donné à moins de 25 %. */
function sdDiscours(k){
  const f=sdF(k),rw=rsRangV(sdAv(f.W).rang),rl=rsRangV(sdAv(f.L).rang),ch=sdChance(f);
  if(k==='m0')return {motif:'Combat principal',ch};
  if(k==='m1')return {motif:'Co-principal',ch};
  if(rw-rl>=10||ch<25)return {motif:'La surprise de la soirée',ch,surprise:true};
  return null;
}

/* ---- Temps forts (Q38) : quelques moments tirés du combat lui-même, jamais le même schéma ---- */
function sdMoments(f){
  if(f._mo)return f._mo;
  const d=f.d,R=d.meth==='Décision'?d.n:d.rd,r=graine('sd'+f.k),out=[];
  const co=d.co,sol=[[],[]],finS=d.meth!=='Décision'?sdSec(d.tps):300;
  /* Les amenées au sol réussies (total des Résultats) sont réparties sur les rounds que chacun a gagnés. */
  for(const s of [0,1]){const won=[];for(let x=0;x<R;x++){const v=d.j.map(t=>t[x]).filter(Boolean);if(v.filter(y=>y===(s?'b':'a')).length>=2)won.push(x);}
    for(let n=0;n<d.sol[s];n++){const l=won.length?won:Array.from({length:R},(_,i)=>i),x=l[Math.floor(r()*l.length)];sol[s][x]=(sol[s][x]||0)+1;}}
  const tps=(lo,hi)=>{const s=lo+Math.floor(r()*Math.max(1,hi-lo));return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;};
  for(let x=0;x<R;x++){
    const fa=co[0][x]||0,fb=co[1][x]||0,j=d.j.map(t=>t[x]).filter(Boolean),fin=d.meth!=='Décision'&&x===R-1,lim=fin?finS-20:285;
    const info={rd:x+1,fa,fb,sa:sol[0][x]||0,sb:sol[1][x]||0,j:d.j.map(t=>t[x]||null)};
    if(fin)out.push({...info,type:d.meth==='KO'?'ko':'sou',acteur:d.g,t:d.tps,p:100});
    if(lim<40)continue;
    const fort=fa>=fb?'a':'b',diff=Math.abs(fa-fb);
    if(diff>=2)out.push({...info,type:'frappe',acteur:fort,t:tps(40,lim),p:40+2*diff});
    if(info.sa+info.sb>0){const s=info.sa>=info.sb?'a':'b';out.push({...info,type:'amenee',acteur:s,t:tps(15,lim),p:36+4*(info.sa+info.sb)});}
    if(j.length===3&&new Set(j).size===2)out.push({...info,type:'serre',acteur:fort,t:tps(60,lim),p:diff<4?46:30});
  }
  if(d.meth==='Décision')out.push({rd:R,fa:co[0][R-1],fb:co[1][R-1],sa:0,sb:0,j:d.j.map(t=>t[R-1]),type:'decision',acteur:d.g,t:'5:00',p:90});
  /* Retour du 21/11 : plus de temps forts. Jusqu'à deux par round (jamais deux du même type), et au total
     2 pour un round, 3 pour deux, 4 pour trois, 5 pour quatre, 6 pour cinq ; la fin est toujours là.
     Un type déjà pris perd du poids, un peu de hasard propre au combat : jamais la même suite. */
  const nb=[0,2,3,4,5,6][R],pris=[],reste=out.map(m=>({m,b:r()*14}));
  const parRd=x=>pris.filter(y=>y.rd===x.rd&&y.type!=='decision').length;
  while(pris.length<nb){let best=null,bv=-1e9;
    for(const x of reste){const m=x.m;if(pris.includes(m))continue;
      /* un round n'est jamais à la fois « dominé » et « très serré » */
      const contraire={frappe:'serre',serre:'frappe'}[m.type];
      if(m.type!=='decision'&&(parRd(m)>=2||pris.some(y=>y.rd===m.rd&&(y.type===m.type||y.type===contraire))))continue;
      const v=m.p+x.b-18*pris.filter(y=>y.type===m.type).length;if(v>bv){bv=v;best=m;}}
    if(!best)break;pris.push(best);}
  if(!pris.length)pris.push(out[0]);
  pris.sort((a,b)=>a.rd-b.rd||(a.type==='decision')-(b.type==='decision')||sdSec(a.t)-sdSec(b.t));
  /* deux moments d'un même round : au moins 40 secondes d'écart, et jamais après la fin */
  for(let i=1;i<pris.length;i++){const a=pris[i-1],b=pris[i];if(a.rd===b.rd&&b.type!=='decision'&&!['ko','sou'].includes(b.type)&&sdSec(b.t)-sdSec(a.t)<40){const s=Math.min(285,sdSec(a.t)+40);b.t=`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;}
    if(['ko','sou'].includes(b.type)&&a.rd===b.rd&&sdSec(a.t)>=sdSec(b.t)-20){const s=Math.max(10,sdSec(b.t)-45);a.t=`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;}}
  return f._mo=pris;
}
/** Le titre et le récit d'un moment : des faits, sans phrase romancée. Inventé à partir des chiffres : à relire. */
function sdMomentTxt(f,m){const o=sdMomentTxt0(f,m);o.tt=o.t.replace(/<[^>]+>/g,'');return o;}
function sdMomentTxt0(f,m){
  const X=sdCote(f,m.acteur),Y=sdCote(f,m.acteur==='a'?'b':'a'),fx=m.acteur==='a'?m.fa:m.fb,fy=m.acteur==='a'?m.fb:m.fa;
  switch(m.type){
    case 'ko':return {t:`${sdN(X)} met ${sdN(Y)} KO`,g:f.d.det.startsWith('arrêt')?'Arrêt':'KO',s:sdDet(f.d)};
    case 'sou':return {t:`${sdN(X)} fait abandonner ${sdN(Y)}`,g:'Soumission',s:sdDet(f.d)};
    case 'frappe':return {t:`${sdN(X)} domine l’échange`,g:`${fx} – ${fy}`,s:`frappes significatives au ${rsOrd(m.rd)} round`};
    case 'amenee':{const n=m.acteur==='a'?m.sa:m.sb;return {t:`${sdN(X)} amène ${sdN(Y)} au sol`,g:'Au sol',s:`${n} amenée${n>1?'s':''} réussie${n>1?'s':''} dans le round`};}
    case 'serre':return {t:`Échange très serré`,g:`${m.fa} – ${m.fb}`,s:'les juges se partagent le round'};
    default:return {t:`Décision ${f.d.det} pour ${sdN(X)}`,g:'Décision',s:f.d.det};
  }
}
/** Une icône par type de moment, la même dans la frise et sa légende. */
const SD_ICO={frappe:'<path d="M3 12h14M13 7l5 5-5 5"/>',amenee:'<path d="M12 3v13M7 11l5 5 5-5M4 20h16"/>',serre:'<path d="M4 9h15M15 5l4 4-4 4M20 15H5M9 11l-4 4 4 4"/>',
  ko:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',sou:'<path d="M18.5 8A7.5 7.5 0 1 0 19 15"/><path d="M19 4v4h-4"/>',decision:'<path d="M5 4h14v16H5zM8 9h8M8 13h8M8 17h5"/>'};
const SD_TYPES={frappe:'frappes',amenee:'au sol',serre:'round partagé',ko:'KO',sou:'soumission',decision:'décision'};
const sdIco=(t,s=22)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">${SD_ICO[t]}</svg>`;
/* ---- La salle et l'ambiance, combat après combat (pas de recettes en direct, Q36b) ---- */
function sdAmbiance(n){
  if(!n)return {lv:1,raison:null};
  const f=sdF(SD_ORDRE[n-1]),fin=f.d.meth!=='Décision',sur=!!(sdDiscours(f.k)&&sdDiscours(f.k).surprise);
  const base=n<=2?1:n<=5?2:n<=7?3:4,lv=Math.min(5,base+(fin?1:0)+(sur?1:0));
  const quoi=fin?`${f.d.meth==='KO'?'le KO':'la soumission'} de ${sdN(f.W)} (${rsOrd(f.d.rd)} round, ${f.d.tps})`:`la décision ${f.d.det} pour ${sdN(f.W)}`;
  return {lv,raison:quoi};
}
/** Plan de la salle vu du dessus : un carré pour 20 places, rempli à mesure que le public arrive. */
function sdPlan(present,cap){
  const pts=[],r=graine('sd-salle'),cx=230,cy=150;
  /* Quatre tribunes de quatre rangs ; le public remplit d'abord les premiers rangs (k = rang + un peu de hasard). */
  for(let j=0;j<4;j++){for(let i=0;i<17;i++){pts.push({x:118+i*14,y:52-j*12,k:j+r()*1.6});pts.push({x:118+i*14,y:248+j*12,k:j+r()*1.6});}
    for(let i=0;i<9;i++){pts.push({x:64-j*12,y:94+i*14,k:j+r()*1.6});pts.push({x:396+j*12,y:94+i*14,k:j+r()*1.6});}}
  const tot=pts.length,plein=Math.round(present/cap*tot);
  const ordre=[...pts].sort((a,b)=>a.k-b.k);ordre.forEach((p,i)=>p.on=i<plein);
  const oc=R=>{const o=[];for(let i=0;i<8;i++){const a=Math.PI/8+i*Math.PI/4;o.push(`${(cx+R*Math.cos(a)).toFixed(1)},${(cy+R*Math.sin(a)).toFixed(1)}`);}return o.join(' ');};
  return `<svg class="sd-plan" viewBox="0 0 460 300" role="img" aria-label="La salle vue du dessus : ${nb(present)} présents sur ${nb(cap)} places">
    <polygon points="${oc(74)}" class="sd-plan-cage"/><polygon points="${oc(60)}" class="sd-plan-sol"/>
    ${ordre.map((p,i)=>`<rect x="${p.x-4}" y="${p.y-4}" width="8" height="8" class="${p.on?'on':''}" style="--d:${(i%40)*12}ms"/>`).join('')}</svg>`;
}

/* ==== L'affiche d'un combat (DA validée de la présentation : tunnel centré sur le VS, doré pour un titre) ==== */
function sdCoteHero(f,s,res){
  const c=sdCote(f,s),av=sdAv(c),g=f.d.g===s,ap=res?sdApres(f,s):av;
  const v=res&&g?'<span class="marque octr v sd-vm">V</span>':'';
  const cases=res?(g&&f.titre?[`<span class="oct sd-nc">${AF_C}<span>Nouveau champion</span></span>`]:[]):[`n° ${av.mondial} mondial`,`${c.age} ans`,c.art||c.style].map(x=>`<span class="oct">${esc(x)}</span>`);
  return `<div class="pz-hc ${s} ${res?(g?'sd-gagne':'sd-perd'):''}"><div class="pz-hc1">${s==='a'?v+sdRang(av):''}<span>${esc(c.prenom)}${c.surnom?` « ${esc(c.surnom)} »`:''}</span>${s==='b'?sdRang(av)+v:''}</div>
    <div class="T pz-hc-n" style="${afNomStyle(c.nom,afTaille(c.nom,124,560))}">${sdN(c)}</div>
    <div class="pz-hc3">${s==='a'?`<span class="T">${rec(ap.v,ap.d,c.n)}</span>${serie(ap.serie)}`:`${serie(ap.serie)}<span class="T">${rec(ap.v,ap.d,c.n)}</span>`}</div>
    ${cases.length?`<div class="pz-hc4">${cases.join('')}</div>`:''}</div>`;
}
function sdHero(f){
  const chip=`<div class="pz-chip oct">${f.titre?'<b>Titre</b><i></i>':''}${esc(afCourt(f.cat))}<i></i>${f.rounds} rounds</div>`;
  return `<div class="pz-banw oct ${f.titre?'or':''}"><div class="pz-ban oct"><i class="pz-img"></i><i class="pz-flash"></i><i class="pz-reflet"></i>${sdCoteHero(f,'a',false)}
    <div class="pz-mil"><span class="pz-quand">${esc(f.role)}</span><div class="pz-vsw octr"><div class="pz-vsr octr"><div class="pz-vs octr T">VS</div></div></div>${chip}</div>${sdCoteHero(f,'b',false)}</div></div>`;
}

/* ==== État « direct » : la soirée en cours (R36) ==== */
const sdVue=k=>S.sd.vues[k]||(k[0]==='m'?'forts':'resultat');
function sdLigne(k,n){
  const f=sdF(k),i=f.i,joue=i<n,prochain=i===n;
  const role=`<span class="sd-l-r"><b>${esc(f.role)}</b><span>${esc(rsCatC(f.cat))}${f.titre?' · titre':''}</span></span>`;
  const no=`<span class="sd-l-n octr ${f.titre?'or':''}">${i+1}</span>`;
  if(joue)return `<div class="sd-l joue" style="--i:${i}">${no}${role}<span class="sd-l-f"><span class="marque octr v">V</span>${sdN(f.W)}<span class="sous">bat</span>${sdN(f.L)}</span>
    <span class="sd-l-m"><b>${esc(sdMeth(f.d))}</b><span>${esc(f.d.meth==='Décision'?`${f.d.n} rounds`:`${rsOrd(f.d.rd)} round · ${f.d.tps}`)}</span></span></div>`;
  const v=sdVue(k);
  return `<div class="sd-l ${prochain?'on oct':''}" style="--i:${i}">${no}${role}<span class="sd-l-f">${sdN(f.A)}<span class="sous">contre</span>${sdN(f.B)}</span>
    <span class="sd-l-v" role="group" aria-label="Le regarder en">${SD_VUES.map(([id,l])=>`<button class="oct ${v===id?'ouvert':''}" data-sdvue="${k}|${id}" aria-pressed="${v===id}">${l}</button>`).join('')}</span></div>`;
}
function sdDirect(){
  const n=S.sd.n,f=sdF(SD_ORDRE[n]),cap=RS_SOIREES[0].public[1],pres=SD_SALLE[n],a=sdAmbiance(n);
  const carte=pan(titre('La carte',`<span class="sd-ment">Le regarder en</span>`)+`<div class="sd-ls">${SD_ORDRE.map(k=>sdLigne(k,n)).join('')}</div>`,'flex:1','sd-carte');
  const salle=pan(titre('La salle')+`<div class="sd-s-n"><span class="T" data-sdcompte="${pres}">${nb(pres)}</span><span class="sd-s-cap">/ ${nb(cap)}</span></div>
    <div class="sous sd-s-s">présents</div>${sdPlan(pres,cap)}
    <div class="sd-amb"><span class="etiq">L’ambiance</span><div class="sd-amb-l"><span class="sd-amb-o">${[1,2,3,4,5].map(x=>`<i class="octr ${x<=a.lv?'on':''}" style="--k:${x}"></i>`).join('')}</span><span class="T">${SD_AMB[a.lv-1]}</span></div>
      <div class="sd-amb-r">${a.raison?`Depuis ${a.raison}.`:'Le public arrive.'} ${sdRelire}</div></div>`,'width:470px;flex:none','sd-salle');
  return `<div class="pz sd sd-direct ${S.sd.anim?'anim':''}">${sdHero(f)}<div class="sd-cols">${carte}${salle}</div></div>`;
}

/* ==== L'arène vue du dessus (Q38) ====
   Le rendu de la caméra « Plafond » de l'arène du jeu (arene-salle.js) : tribunes en anneaux octogonaux qui rougissent avec
   l'ambiance, sièges, tablier noir, tables des juges, médecin, tapis et logo, grillage blanc, pions à plat avec leur ombre,
   traces au sol, cercle pointillé au sol. La maquette le reproduit ; dans le jeu, les temps forts passeront par l'arène réelle.
   Retour du 21/11 : tout se comprend d'un coup d'œil, sans lire. Les noms sous les pions, un trait par coup qui touche,
   un compteur de frappes près de chacun, la flèche de l'amenée, le cercle de la soumission, les cartes des juges à leur
   table, et à droite un grand repère (« KO », « 21 – 10 », « Au sol »…). Objets réutilisés dans la boucle (pool d'effets). */
const SD_AR={W:1920,H:1080,ox:960,oy:560,Z:280};
const SD_C1=[22,14,14],SD_C2=[150,34,24],SD_NT=15,SD_M=96,SD_TAU=Math.PI*2,SD_SEG=Math.PI/4;
const sdLerp=(a,b,t)=>a+(b-a)*t;
const sdEase=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
const sdMix=(a,b,t)=>{t=Math.max(0,Math.min(1,t));return `rgb(${Math.round(sdLerp(a[0],b[0],t))},${Math.round(sdLerp(a[1],b[1],t))},${Math.round(sdLerp(a[2],b[2],t))})`;};
const sdHash=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const sdOctU=phi=>{const a=((phi+SD_SEG/2)%SD_SEG+SD_SEG)%SD_SEG-SD_SEG/2,rr=1/Math.cos(a);return [Math.cos(phi)*rr,Math.sin(phi)*rr];};
const SD_U=Array.from({length:SD_M+1},(_,j)=>sdOctU(j/SD_M*SD_TAU));
const sdRowR=i=>1.56+i*.2+(i>6?.26:0);
const sdAisle=j=>j%12===6, sdWalk=j=>j===35||j===36||j===83||j===84;
/* Les sièges, calculés une fois : position (unités de la cage), rang, couleur. */
const SD_SIEGES=(()=>{const o=[];for(let i=0;i<SD_NT;i++){const r0=sdRowR(i)+.0825;for(let j=0;j<SD_M;j++){if(sdAisle(j)||(i<=6&&sdWalk(j)))continue;
  for(let k=0;k<3;k++){const u=(k+.5)/3,x=sdLerp(SD_U[j][0],SD_U[j+1][0],u)*r0,y=sdLerp(SD_U[j][1],SD_U[j+1][1],u)*r0,h=sdHash(i*57.3+j*3.1+k*11.7);
    o.push({x,y,i,h,c:h<.07?'#E23A2B':h<.5?'#E9E6E1':'#BDB9B3'});}}}return o;})();
const SD_FXN=48;
const SD_ANIM={raf:0,cv:null,ctx:null,f:null,m:null,st:0,last:0,fx:Array.from({length:SD_FXN},()=>({on:false,x:0,y:0,x1:0,y1:0,t:0,k:'',a:0})),trA:[],trB:[],trT:0,
  cam:{x:0,y:0,z:1},fired:0};
const sdReduit=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
function sdFx(k,x,y,a,x1,y1){const p=SD_ANIM.fx.find(e=>!e.on)||SD_ANIM.fx[0];p.on=true;p.k=k;p.x=x;p.y=y;p.t=0;p.a=a||0;p.x1=x1||0;p.y1=y1||0;}
/* Le déroulé d'un moment : l'approche, le geste (ralenti, caméra qui se rapproche), puis le repère du moment. */
const SD_TK=2.4;
const SD_DUREE={frappe:5.4,serre:5.4,amenee:5.6,ko:6,sou:6.4,decision:6};
const SD_RALENTI={ko:[3.2,4.4],sou:[3.6,5.2],amenee:[2.9,3.6]};
/* l'instant (horloge du moment) où le grand repère apparaît */
const SD_REPERE={frappe:SD_TK+1.9,serre:SD_TK+2.3,amenee:SD_TK+1.3,ko:SD_TK+1.1,sou:SD_TK+3.2,decision:SD_TK+2.4};
const SD_COUPS={frappe:[.3,.62,.9,1.25,1.55,1.9],serre:[.3,.7,1.1,1.5,1.9,2.3]};
function sdPose(m,t,out){
  const ty=m.type,dur=SD_DUREE[ty];
  /* l'approche : les deux tournent l'un autour de l'autre, l'attaquant cherche la distance */
  const tb=Math.min(t,SD_TK),th=.6+tb*.42,cxp=-.06+.05*Math.sin(tb*.8),cyp=.02+.05*Math.cos(tb*.6),dist=.3+.05*Math.sin(tb*2.2);
  let ax=cxp-Math.cos(th)*dist/2,ay=cyp-Math.sin(th)*dist/2,bx=cxp+Math.cos(th)*dist/2,by=cyp+Math.sin(th)*dist/2;
  const ux=Math.cos(th),uy=Math.sin(th),vx=-uy,vy=ux;
  let hurtB=0,ko=0,sol=0,anneau=-1,exc=.15+.1*Math.sin(t*1.3),rx=.05,ry=.82,zoom=1,gagnant=0;
  const jab=(h,qui)=>{const u=(t-h)/.22;if(u>0&&u<1){const g=Math.sin(u*Math.PI)*.07;if(qui==='a'){ax+=ux*g;ay+=uy*g;}else{bx-=ux*g;by-=uy*g;}}};
  jab(.9,'a');jab(1.6,'b');jab(2.05,'a');
  const k=t-SD_TK;
  if(k>0){
    if(ty==='frappe'||ty==='serre'){
      const drive=ty==='frappe'?sdEase(k/1.8)*.42:Math.sin(k*1.4)*.08;
      bx+=ux*drive;by+=uy*drive;ax+=ux*drive*.92;ay+=uy*drive*.92;
      SD_COUPS[ty].forEach((h,i)=>{const u=(k-h)/.2;if(u>0&&u<1){const g=Math.sin(u*Math.PI)*.08,inv=ty==='serre'&&i%2;if(inv){bx-=ux*g;by-=uy*g;}else{ax+=ux*g;ay+=uy*g;}}});
      hurtB=ty==='frappe'?Math.max(0,Math.min(1,k/1.2))*(k<2.6?1:Math.max(0,1-(k-2.6))):0;
      if(ty==='frappe'&&k>2.2){const e=sdEase((k-2.2)/.9)*.2;bx+=vx*e;by+=vy*e;}
      exc=Math.min(1,.3+k*.3);zoom=1+.14*sdEase(k/1);
    }else if(ty==='amenee'||ty==='sou'){
      const rush=sdEase((k-.2)/.35),drive=sdEase((k-.55)/.6)*.42;
      ax=sdLerp(ax,bx-ux*.12,rush)+ux*drive;ay=sdLerp(ay,by-uy*.12,rush)+uy*drive;bx+=ux*drive;by+=uy*drive;
      if(k>1.2){sol=1;ax=bx-ux*.07;ay=by-uy*.07;}
      if(ty==='sou'&&k>1.6){const b=sdEase((k-1.6)/.6);ax=sdLerp(bx-ux*.07,bx+ux*.06+vx*.03,b);ay=sdLerp(by-uy*.07,by+uy*.06+vy*.03,b);}
      if(ty==='sou'&&k>2.3)anneau=Math.min(1,(k-2.3)/1.2);
      exc=Math.min(1,.3+k*.25);zoom=1+.22*sdEase((k-.8)/1);
      if(ty==='sou'&&k>3.3){rx=sdLerp(.05,bx+.12,sdEase((k-3.3)/.7));ry=sdLerp(.82,by+.14,sdEase((k-3.3)/.7));}
    }else if(ty==='ko'){
      const sw=sdEase((k-.85)/.25),fall=sdEase((k-1.1)/.6);
      ax+=ux*.06*Math.sin(Math.min(1,Math.max(0,(k-.2)/.25))*Math.PI);
      bx+=ux*(.2*fall)+vx*.05*fall;by+=uy*(.2*fall)+vy*.05*fall;
      if(k>1.4){const a2=sdEase((k-1.4)/1);ax-=vx*.18*a2+ux*.1*a2;ay-=vy*.18*a2+uy*.1*a2;}
      ko=fall;hurtB=sw;exc=Math.min(1,.3+sw*.8);zoom=1+.3*sdEase((k-.5)/.6)-.22*sdEase((k-2.2)/1);
      if(k>1.3){const a3=sdEase((k-1.3)/.8);rx=sdLerp(.05,(ax+bx)/2+.04,a3);ry=sdLerp(.82,(ay+by)/2+.1,a3);}
    }else{ /* décision : la cloche, chacun à son coin, les cartes, l'arbitre lève le bras du vainqueur */
      const sep=sdEase((k-.5)/1);ax=sdLerp(ax,-.6,sep);ay=sdLerp(ay,.16,sep);bx=sdLerp(bx,.6,sep);by=sdLerp(by,-.16,sep);
      const r1=sdEase((k-1)/.8),r2=sdEase((k-2.3)/.7),wx=m.acteur==='a'?ax:bx,wy=m.acteur==='a'?ay:by;
      rx=sdLerp(sdLerp(.05,0,r1),wx+.13,r2);ry=sdLerp(sdLerp(.82,0,r1),wy+.06,r2);gagnant=r2;exc=.35+.55*r2;
    }
  }
  const fcx=(ax+bx)/2,fcy=(ay+by)/2;
  /* l'acteur du moment est le pion « a » de la pose ; on remet les côtés à leur place */
  const A=m.acteur==='a'?{x:ax,y:ay}:{x:bx,y:by},B=m.acteur==='a'?{x:bx,y:by}:{x:ax,y:ay};
  out.A=A;out.B=B;out.R={x:rx,y:ry};out.def=m.acteur==='a'?'B':'A';out.hurt=hurtB;out.ko=ko;out.sol=sol;out.anneau=anneau;out.exc=exc;out.gagnant=gagnant;
  out.cam={x:zoom>1?fcx*.6:0,y:zoom>1?fcy*.6:0,z:zoom};out.k=k;
  return out;
}
/* Les événements visibles (étincelles, traits des coups, onde, tapes) : déclenchés une fois quand l'horloge les passe. */
function sdEvenements(m){
  const ty=m.type,ev=[[.92,'p','def'],[1.62,'p','att'],[2.07,'p','def']],k=SD_TK;
  if(SD_COUPS[ty])SD_COUPS[ty].forEach((h,i)=>{const qui=ty==='serre'&&i%2?'att':'def';ev.push([k+h+.08,'l',qui],[k+h+.1,'s',qui]);});
  if(ty==='amenee'||ty==='sou')ev.push([k+1.2,'r','def']);
  if(ty==='amenee')[1.8,2.2,2.6].forEach(h=>ev.push([k+h,'p','def']));
  if(ty==='ko')ev.push([k+.35,'l','def'],[k+.35,'p','def'],[k+1.05,'b','def'],[k+1.12,'s','def']);
  if(ty==='sou')[3.1,3.4,3.7].forEach(h=>ev.push([k+h,'t','def']));
  if(ty==='decision')ev.push([k+.5,'r','mil']);
  return ev.sort((a,b)=>a[0]-b[0]);
}
/** Le compteur de frappes d'un côté au fil du moment (les coups visibles comptent, puis le total du round). */
function sdCompte(m,s,st){
  const tot=s==='a'?m.fa:m.fb;if(!['frappe','serre'].includes(m.type))return null;
  const fin=SD_REPERE[m.type],p=Math.max(0,Math.min(1,st/fin));return Math.round(tot*sdEase(p));
}
function sdDessinerArene(){
  const A=SD_ANIM,ctx=A.ctx,f=A.f,m=A.m;if(!ctx)return;
  const P=sdPose(m,A.st,A._p||(A._p={}));
  const cam=A.cam,kl=A.reduit?1:.08;cam.x+=(P.cam.x-cam.x)*kl;cam.y+=(P.cam.y-cam.y)*kl;cam.z+=(P.cam.z-cam.z)*kl;
  const Z=SD_AR.Z*cam.z,X=x=>SD_AR.ox+(x-cam.x)*Z,Y=y=>SD_AR.oy+(y-cam.y)*Z;
  const T=(px,w)=>`${w||800} ${Math.round(px)}px "Saira Extra Condensed","Arial Narrow",sans-serif`,TC=(px,w)=>`${w||700} ${Math.round(px)}px "Saira Condensed","Arial Narrow",sans-serif`;
  let shake=0;for(const e of A.fx)if(e.on&&e.k==='b'&&e.t<.45)shake=Math.max(shake,14*(1-e.t/.45));
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#0B0909';ctx.fillRect(0,0,SD_AR.W,SD_AR.H);
  ctx.save();if(shake>.3)ctx.translate(Math.sin(A.st*71)*shake,Math.cos(A.st*83)*shake);
  /* les tribunes : un anneau octogonal par rang, plus rouge quand la salle s'échauffe ; une vague sur un grand moment */
  const vague=P.exc>.7?((A.st*6)%(SD_NT+6))-3:-99;
  for(let i=SD_NT-1;i>=0;i--){
    const r0=sdRowR(i),r1=r0+.165;let br=(.12+.42*P.exc)*(1-i*.03);br+=.6*Math.exp(-Math.pow(i-vague,2)/1.6);
    ctx.beginPath();
    for(let j=0;j<SD_M;j++){if(sdAisle(j)||(i<=6&&sdWalk(j)))continue;const a=SD_U[j],b=SD_U[j+1];
      ctx.moveTo(X(a[0]*r0),Y(a[1]*r0));ctx.lineTo(X(b[0]*r0),Y(b[1]*r0));ctx.lineTo(X(b[0]*r1),Y(b[1]*r1));ctx.lineTo(X(a[0]*r1),Y(a[1]*r1));ctx.closePath();}
    ctx.fillStyle=sdMix(SD_C1,SD_C2,br);ctx.fill();
  }
  const sz=Math.max(2.4,Math.min(6,Z*.011));
  for(const col of ['#BDB9B3','#E9E6E1','#E23A2B']){ctx.fillStyle=col;ctx.globalAlpha=col==='#E23A2B'?.8:.55;
    for(const s of SD_SIEGES){if(s.c!==col||s.h>.955)continue;const x=X(s.x),y=Y(s.y);if(x<-8||x>SD_AR.W+8||y<-8||y>SD_AR.H+8)continue;ctx.fillRect(x-sz/2,y-sz*.4,sz,sz*.8);}}
  if(P.exc>.6){ctx.globalAlpha=1;ctx.fillStyle='#FFF6E0';const n=Math.floor(A.st*20);for(let q=0;q<22;q++){const s=SD_SIEGES[Math.floor(sdHash(n*13.7+q*7.1)*SD_SIEGES.length)];ctx.fillRect(X(s.x)-sz,Y(s.y)-sz,sz*2,sz*2);}}
  ctx.globalAlpha=1;
  const oct=(r,fill,stroke,lw)=>{ctx.beginPath();for(let i=0;i<=8;i++){const a=SD_SEG/2+i*SD_SEG,q=r/Math.cos(SD_SEG/2);i?ctx.lineTo(X(Math.cos(a)*q),Y(Math.sin(a)*q)):ctx.moveTo(X(Math.cos(a)*q),Y(Math.sin(a)*q));}
    if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();}};
  oct(1.5,'#0D0B0B');oct(1.2,'#121010','rgba(233,230,225,.08)',2);
  /* les tables (trois juges, le chrono), le médecin */
  const JU=[[-1.33,0,26,70],[0,-1.33,90,26],[1.33,0,26,70]];
  const table=(x,y,w,h,lab)=>{ctx.fillStyle='#1B1717';ctx.strokeStyle='rgba(233,230,225,.35)';ctx.lineWidth=2;ctx.fillRect(X(x)-w/2,Y(y)-h/2,w,h);ctx.strokeRect(X(x)-w/2,Y(y)-h/2,w,h);
    if(lab){ctx.fillStyle='rgba(233,230,225,.55)';ctx.font=T(22);ctx.textAlign='center';ctx.fillText(lab,X(x),Y(y)-h/2-10);}};
  const rond=(x,y,r,c)=>{ctx.fillStyle=c;ctx.beginPath();ctx.arc(X(x),Y(y),r,0,SD_TAU);ctx.fill();};
  JU.forEach(([x,y,w,h])=>{table(x,y,w*cam.z,h*cam.z,y<0?'':'JUGE'); /* la table du haut passe sous le tableau d'affichage : pas d'étiquette coupée */rond(x+(x?Math.sign(x)*.09:0),y+(y?Math.sign(y)*.09:0),11*cam.z,'#4E4A48');});
  table(0,1.33,90*cam.z,26*cam.z,'CHRONO');
  rond(.98,.95,13*cam.z,'#E9E6E1');ctx.fillStyle='#E5483B';const mx=X(.98),my=Y(.95),q=4*cam.z;ctx.fillRect(mx-q*2.2,my-q*.6,q*4.4,q*1.2);ctx.fillRect(mx-q*.6,my-q*2.2,q*1.2,q*4.4);
  ctx.fillStyle='rgba(233,230,225,.55)';ctx.font=T(22);ctx.textAlign='center';ctx.fillText('MÉDECIN',X(1.12),Y(1.05)+24);
  /* le tapis, ses lignes, le logo */
  oct(1.0,'#1C1818');[.74,.5,.27].forEach(r=>oct(r,null,'rgba(233,230,225,.06)',2));
  ctx.fillStyle='rgba(233,230,225,.08)';ctx.font=T(34*cam.z);ctx.fillText('SPLIT FIGHT NIGHT',X(0),Y(-.1));
  ctx.font=T(110*cam.z);ctx.fillText('63',X(0),Y(.26));
  /* les traces au sol */
  if(A.st-A.trT>.09){A.trT=A.st;A.trA.push([P.A.x,P.A.y]);A.trB.push([P.B.x,P.B.y]);if(A.trA.length>24){A.trA.shift();A.trB.shift();}}
  ctx.lineCap='round';ctx.setLineDash([3,12]);ctx.lineWidth=5;
  for(const [tr,c] of [[A.trA,'233,230,225'],[A.trB,'226,58,43']])for(let q2=1;q2<tr.length;q2++){ctx.strokeStyle=`rgba(${c},${(.45*q2/tr.length).toFixed(2)})`;ctx.beginPath();ctx.moveTo(X(tr[q2-1][0]),Y(tr[q2-1][1]));ctx.lineTo(X(tr[q2][0]),Y(tr[q2][1]));ctx.stroke();}
  ctx.setLineDash([]);
  const att=P[P.def==='A'?'B':'A'],dfd=P[P.def];
  /* l'amenée : la flèche de la ruée, de l'attaquant jusqu'à la cage */
  if((m.type==='amenee'||m.type==='sou')&&P.k>.15){const p0=A._p0||(A._p0=sdPose(m,SD_TK+.2,{})),p1=A._p1||(A._p1=sdPose(m,SD_TK+1.2,{}));
    const s0=p0[p0.def==='A'?'B':'A'],e0=p1[p1.def],al=Math.min(1,(P.k-.15)/.5)*(P.k>3.2?Math.max(0,1-(P.k-3.2)):1);
    if(al>0){const x0=X(s0.x),y0=Y(s0.y),x1=X(e0.x),y1=Y(e0.y),an=Math.atan2(y1-y0,x1-x0);ctx.globalAlpha=al;ctx.strokeStyle='#E9E6E1';ctx.lineWidth=5;ctx.setLineDash([16,10]);ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle='#E9E6E1';ctx.beginPath();ctx.moveTo(x1+Math.cos(an)*22,y1+Math.sin(an)*22);ctx.lineTo(x1+Math.cos(an+2.5)*20,y1+Math.sin(an+2.5)*20);ctx.lineTo(x1+Math.cos(an-2.5)*20,y1+Math.sin(an-2.5)*20);ctx.fill();ctx.globalAlpha=1;}}
  /* au sol : le cercle pointillé qui tourne (comme le jeu) ; la soumission : l'arc qui se referme */
  const mxp=(P.A.x+P.B.x)/2,myp=(P.A.y+P.B.y)/2;
  if(P.sol){ctx.strokeStyle='rgba(233,230,225,.7)';ctx.lineWidth=3;ctx.setLineDash([10,10]);ctx.lineDashOffset=-A.st*40;ctx.beginPath();ctx.arc(X(mxp),Y(myp),.2*Z,0,SD_TAU);ctx.stroke();ctx.setLineDash([]);}
  if(P.anneau>=0){ctx.strokeStyle='#E9E6E1';ctx.lineWidth=8;ctx.beginPath();const a0=-Math.PI/2;ctx.arc(X(mxp),Y(myp),.15*Z,a0,a0+SD_TAU*Math.min(.98,P.anneau));ctx.stroke();}
  /* les effets : étincelles, traits des coups (du frappeur au touché), onde du KO, anneaux, tapes */
  for(const e of A.fx){if(!e.on)continue;const x=X(e.x),y=Y(e.y),u=e.t;
    if(e.k==='l'){const x0=X(e.x1),y0=Y(e.y1),al=Math.max(0,1-u/.5);ctx.strokeStyle=`rgba(233,230,225,${al.toFixed(2)})`;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(sdLerp(x0,x,Math.min(1,u/.1)),sdLerp(y0,y,Math.min(1,u/.1)));ctx.stroke();if(u>.5)e.on=false;}
    else if(e.k==='s'||e.k==='p'){const n=e.k==='s'?7:4,L=e.k==='s'?46:24;ctx.strokeStyle=`rgba(255,246,224,${(1-u/.4).toFixed(2)})`;ctx.lineWidth=e.k==='s'?4:3;
      for(let q2=0;q2<n;q2++){const a=q2/n*SD_TAU+e.a,r0=14+u*60,r1=r0+L*(1-u/.4);ctx.beginPath();ctx.moveTo(x+Math.cos(a)*r0,y+Math.sin(a)*r0);ctx.lineTo(x+Math.cos(a)*r1,y+Math.sin(a)*r1);ctx.stroke();}
      if(u>.4)e.on=false;}
    else if(e.k==='b'){ctx.strokeStyle=`rgba(255,240,215,${Math.max(0,1-u/.9).toFixed(2)})`;ctx.lineWidth=10*(1-u/.9)+2;ctx.beginPath();ctx.arc(x,y,30+u*420,0,SD_TAU);ctx.stroke();
      ctx.fillStyle=`rgba(255,240,215,${Math.max(0,.5-u).toFixed(2)})`;ctx.beginPath();ctx.arc(x,y,40+u*180,0,SD_TAU);ctx.fill();if(u>.9)e.on=false;}
    else if(e.k==='r'){ctx.strokeStyle=`rgba(233,230,225,${Math.max(0,.8-u).toFixed(2)})`;ctx.lineWidth=4;ctx.beginPath();ctx.arc(x,y,20+u*140,0,SD_TAU);ctx.stroke();if(u>.8)e.on=false;}
    else if(e.k==='t'){ctx.strokeStyle=`rgba(229,72,59,${Math.max(0,1-u/.3).toFixed(2)})`;ctx.lineWidth=5;ctx.beginPath();ctx.arc(x,y,40+u*50,0,SD_TAU);ctx.stroke();if(u>.3)e.on=false;}}
  /* les pions : ombre, disque, liseré, lettre, petit trait vers l'adversaire ; le touché tremble, le KO passe au gris */
  const pion=(x,y,r,col,dark,lettre,lc,face,o)=>{const px=X(x)+(o.wob||0),py=Y(y),R=r*Z;
    ctx.fillStyle='rgba(0,0,0,.45)';ctx.beginPath();ctx.ellipse(px+6,py+9,R,R*.9,0,0,SD_TAU);ctx.fill();
    ctx.fillStyle=dark;ctx.beginPath();ctx.arc(px,py,R,0,SD_TAU);ctx.fill();ctx.fillStyle=col;ctx.beginPath();ctx.arc(px,py,R*.84,0,SD_TAU);ctx.fill();
    if(face!==null){ctx.strokeStyle=dark;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(px+Math.cos(face)*R*.9,py+Math.sin(face)*R*.9);ctx.lineTo(px+Math.cos(face)*R*1.35,py+Math.sin(face)*R*1.35);ctx.stroke();}
    if(o.pulse){ctx.strokeStyle=`rgba(233,230,225,${o.pulse.toFixed(2)})`;ctx.lineWidth=4;ctx.beginPath();ctx.arc(px,py,R*(1.25+.25*Math.sin(A.st*8)),0,SD_TAU);ctx.stroke();}
    ctx.fillStyle=lc;ctx.font=T(R*1.05);ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(lettre,px,py+2);ctx.textBaseline='alphabetic';};
  const ini=c=>f.A.nom[0]===f.B.nom[0]?c.nom.slice(0,2):c.nom[0];
  const fA=Math.atan2(P.B.y-P.A.y,P.B.x-P.A.x),fB=fA+Math.PI,wob=P.hurt?Math.sin(A.st*18)*7*P.hurt:0;
  const sty=s=>{const dd=P.def===s,kod=dd&&P.ko>.5,win=m.type==='decision'&&m.acteur===(s==='A'?'a':'b');
    return {col:kod?'#6F6A67':s==='A'?'#E9E6E1':'#E23A2B',dark:kod?'#3a3634':s==='A'?'#BDB9B3':'#B32A1E',lc:s==='A'?'#0D0B0B':'#E9E6E1',o:{wob:dd?wob:0,pulse:win?P.gagnant:0}};};
  pion(P.R.x,P.R.y,.082,'#6A6562','#4E4A48','A','#E9E6E1',null,{});
  const ordre=P.sol?(P.def==='A'?['A','B']:['B','A']):['A','B'];
  for(const s of ordre){const o=sty(s),p=P[s],sc=P.def===s&&P.ko?1-.12*P.ko:1;pion(p.x,p.y,.112*sc,o.col,o.dark,ini(s==='A'?f.A:f.B),o.lc,P.ko>.5&&P.def===s?null:(s==='A'?fA:fB),o.o);}
  oct(1.0,null,'#E9E6E1',5);
  for(let i=0;i<8;i++){const a=SD_SEG/2+i*SD_SEG,rr=1/Math.cos(SD_SEG/2);ctx.fillStyle='#E9E6E1';ctx.fillRect(X(Math.cos(a)*rr)-6,Y(Math.sin(a)*rr)-6,12,12);}
  /* le nom sous chaque pion, et son compteur de frappes à côté quand le moment est un échange */
  const plaque=(txt,x,y,fond,coul,px)=>{ctx.font=T(px);const w=ctx.measureText(txt).width+20;ctx.fillStyle=fond;ctx.fillRect(x-w/2,y-px*.62,w,px*1.24);ctx.fillStyle=coul;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(txt,x,y+1);ctx.textBaseline='alphabetic';return w;};
  for(const s of ['A','B']){const c=s==='A'?f.A:f.B,p=P[s],R=.112*Z,dy=P.sol&&P.def!==s?-R-24:R+26,x=X(p.x)+(P.def===s?wob:0),y=Y(p.y)+dy;
    const w=plaque(c.nom.toUpperCase(),x,y,'rgba(13,11,11,.88)','#E9E6E1',24);
    const n=sdCompte(m,s==='A'?'a':'b',A.st);
    if(n!==null){const bx=x+w/2+26;ctx.fillStyle=s==='A'?'#E9E6E1':'#E23A2B';ctx.beginPath();ctx.arc(bx,y,22,0,SD_TAU);ctx.fill();ctx.fillStyle=s==='A'?'#0D0B0B':'#E9E6E1';ctx.font=T(26);ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(n),bx,y+1);ctx.textBaseline='alphabetic';}}
  /* la décision : chaque carte se pose devant la table de son juge, avec le nom de celui qu'il donne vainqueur */
  if(m.type==='decision')[0,1,2].forEach(q2=>{const c=rsCarteJuge(f.d,q2),tp=SD_TK+1.2+q2*.4,al=sdEase((A.st-tp)/.35);if(al<=0)return;
    const [jx,jy]=JU[q2],x=X(jx*.86),y=Y(jy*.86)+(jy?(jy<0?40:0):0),w=150,h=78;ctx.globalAlpha=al;ctx.fillStyle='#E9E6E1';ctx.fillRect(x-w/2,y-h/2,w,h);
    ctx.fillStyle='#0D0B0B';ctx.textAlign='center';ctx.font=T(40);ctx.fillText(c.txt,x,y+6);ctx.font=TC(20);ctx.fillText(sdCote(f,c.gagne||f.d.g).nom,x,y+30);ctx.globalAlpha=1;});
  ctx.restore();
  /* le pourtour s'assombrit quand la salle est calme, s'ouvre quand elle se lève */
  const g=ctx.createRadialGradient(SD_AR.ox,SD_AR.oy,300,SD_AR.ox,SD_AR.oy,1250);g.addColorStop(0,'rgba(11,9,9,0)');g.addColorStop(1,`rgba(11,9,9,${(.72-.35*P.exc).toFixed(2)})`);ctx.fillStyle=g;ctx.fillRect(0,0,SD_AR.W,SD_AR.H);
  /* le grand repère du moment, à droite de la cage : il se pose quand le geste a lieu, puis reste */
  const tx=sdMomentTxt(f,m),ap=A.reduit?1:sdEase((A.st-SD_REPERE[m.type])/.35);
  if(ap>0){const px=tx.g.length>8?92:tx.g.length>6?108:130;ctx.font=T(px);const w=Math.max(ctx.measureText(tx.g.toUpperCase()).width,300)+60,cx=1870-w/2,cy=500,sc=1+.25*(1-ap);
    ctx.save();ctx.globalAlpha=ap;ctx.translate(cx,cy);ctx.scale(sc,sc);ctx.fillStyle='rgba(13,11,11,.9)';ctx.fillRect(-w/2,-110,w,200);
    ctx.fillStyle='#E23A2B';ctx.fillRect(-w/2,-110,10,200);
    ctx.fillStyle='#E9E6E1';ctx.textAlign='center';ctx.fillText(tx.g.toUpperCase(),0,22);ctx.font=TC(26,600);ctx.fillStyle='rgba(233,230,225,.8)';ctx.fillText(tx.s,0,68);ctx.restore();}
  return P;
}
/** L'horloge du tableau d'affichage suit l'animation (le HTML n'est pas reconstruit). */
function sdMajHud(){
  const A=SD_ANIM,m=A.m,fin=sdSec(m.t),t0=Math.max(0,fin-28),p=Math.min(1,A.st/(SD_REPERE[m.type]||4)),clk=Math.round(t0+(fin-t0)*p);
  const e=document.getElementById('sd-clk');if(e){const v=sdMmss(clk);if(e.textContent!==v)e.textContent=v;}
}
function sdJouerMoment(){
  cancelAnimationFrame(SD_ANIM.raf);
  const cv=$('#sd-cv');if(!cv)return;
  /* les plaques et le logo sont en Saira Extra Condensed : tant qu'elle n'est pas chargée, on la charge puis on rejoue */
  if(document.fonts&&!document.fonts.check('800 34px "Saira Extra Condensed"')){document.fonts.load('800 34px "Saira Extra Condensed"').then(()=>{if(S.ecran==='soiree'&&['fort','combat'].includes(S.sd.etat)&&!S.fiche)sdJouerMoment();});}
  const A=SD_ANIM,f=sdF(S.sd.k),m=sdMoments(f)[S.sd.mo];
  A.cv=cv;A.ctx=cv.getContext('2d');A.f=f;A.m=m;A.st=0;A.last=0;A.trA.length=0;A.trB.length=0;A.trT=0;A.fired=0;A.cam.x=0;A.cam.y=0;A.cam.z=1;A.fx.forEach(e=>e.on=false);A._p0=null;A._p1=null;
  A.ev=sdEvenements(m);A.reduit=sdReduit();
  const dur=SD_DUREE[m.type];
  if(A.reduit){A.st=dur;const P=sdPose(m,dur,{});A.cam.x=P.cam.x;A.cam.y=P.cam.y;A.cam.z=P.cam.z;sdDessinerArene();sdMajHud();return;}
  const tick=now=>{
    const dt=A.last?Math.min(.05,(now-A.last)/1000):0;A.last=now;
    const sl=SD_RALENTI[m.type],rate=sl&&A.st>sl[0]&&A.st<sl[1]?.42:1;A.st+=dt*rate;
    while(A.fired<A.ev.length&&A.ev[A.fired][0]<=A.st){const [,k,qui]=A.ev[A.fired++],P=sdPose(m,A.st,{}),dfd=P[P.def],at=P[P.def==='A'?'B':'A'];
      const c=qui==='def'?dfd:qui==='att'?at:{x:(dfd.x+at.x)/2,y:(dfd.y+at.y)/2},o=qui==='att'?dfd:at;sdFx(k,c.x,c.y,Math.atan2(c.y-o.y,c.x-o.x),o.x,o.y);}
    for(const e of A.fx)if(e.on)e.t+=dt*rate;
    sdDessinerArene();sdMajHud();
    if(A.st<dur+1.2)A.raf=requestAnimationFrame(tick);
  };
  A.raf=requestAnimationFrame(tick);
}

/* ==== État « fort » : l'arène en grand, et seulement l'essentiel autour (retour du 21/11 : « que ça respire ») ==== */
function sdFort(){
  const f=sdF(S.sd.k),mos=sdMoments(f),m=mos[Math.min(S.sd.mo,mos.length-1)],txt=sdMomentTxt(f,m);
  const tab=(c,s)=>`<span class="sd-tb-c ${s}"><span class="sd-pt ${s}"></span>${sdN(c)}<span class="sd-tb-b">${rec(sdAv(c).v,sdAv(c).d,c.n)}</span></span>`;
  const haut=`<div class="sd-th"><div class="sd-th-g"><span class="etiq">${S.sd.revoir?'Revoir · l’arène':'Temps forts'}</span><span class="sd-th-r">${esc(f.role)} · ${esc(rsCatC(f.cat))} · ${f.rounds} rounds</span></div>
    <div class="sd-tb oct"><div class="sd-tb-i oct">${tab(f.A,'a')}<span class="sd-tb-h"><span class="etiq">Round ${m.rd}</span><span class="T" id="sd-clk">${esc(m.t)}</span></span>${tab(f.B,'b')}</div></div>
    <div class="sd-th-d etiq">Moment ${S.sd.mo+1} sur ${mos.length}</div></div>`;
  /* le bandeau du moment, en bas à gauche : quand, quoi, et le chiffre du round */
  const fr=m.type==='decision'?[0,1,2].map(q=>rsCarteJuge(f.d,q).txt).join(' · '):`${sdN(f.A)} <b>${m.fa} – ${m.fb}</b> ${sdN(f.B)}`;
  const cap=`<div class="sd-cap oct"><span class="sd-cap-q etiq">${m.type==='decision'?'Fin du combat':`${rsOrd(m.rd)} round · ${esc(m.t)}`} ${sdRelire}</span>
    <div class="T sd-cap-t">${txt.t}</div><div class="sd-cap-f"><span class="etiq">${m.type==='decision'?'Les cartes':'Frappes du round'}</span><span>${fr}</span></div></div>`;
  /* la frise : chaque round à l'échelle de ses 5 minutes, chaque moment à sa place avec son icône ; on va de gauche à droite */
  const R=f.rounds,fini=f.d.meth==='Décision'?f.d.n:f.d.rd;
  const pos=x=>((x.rd-1)*300+Math.min(300,sdSec(x.t)))/(R*300)*100;
  const types=[...new Set(mos.map(x=>x.type))];
  const frise=`<div class="sd-fzw"><button class="sd-nav oct" data-sdnav="-1" ${S.sd.mo?'':'disabled'} aria-label="Moment précédent">${ico('retour',30,3)}</button>
    <div class="sd-fz"><div class="sd-fz-r">${Array.from({length:R},(_,i)=>`<span class="${i+1>fini?'nd':''}" style="--w:${100/R}%"><b>R${i+1}</b>${i+1>fini?'<em>non disputé</em>':''}</span>`).join('')}
      ${f.d.meth!=='Décision'?`<i class="sd-fz-stop" style="left:${pos({rd:fini,t:f.d.tps})}%"></i>`:''}</div>
    ${mos.map((x,i)=>`<button class="sd-fz-m octr ${i===S.sd.mo?'on':''} ${i<S.sd.mo?'vu':''}" style="left:${pos(x)}%;--i:${i}" data-sdmo="${i}" title="${esc(`${rsOrd(x.rd)} round, ${x.t} : ${sdMomentTxt(f,x).tt}`)}" aria-label="${esc(`Moment ${i+1} : ${sdMomentTxt(f,x).tt}`)}"><span class="octr">${sdIco(x.type,22)}</span></button>`).join('')}</div>
    <button class="sd-nav oct" data-sdnav="1" ${S.sd.mo<mos.length-1?'':'disabled'} aria-label="Moment suivant">${ico('avant',30,3)}</button></div>
    <div class="sd-fz-lg">${types.map(t=>`<span>${sdIco(t,18)}${SD_TYPES[t]}</span>`).join('')}<span class="sd-fz-lgf"><i></i>fin du combat</span></div>`;
  return `<div class="pz sd sd-fort ${S.sd.anim?'anim':''}"><canvas id="sd-cv" class="sd-cv" width="1920" height="1080" aria-label="L’arène vue du dessus"></canvas>${haut}${cap}${pan(frise,'','sd-fzp')}</div>`;
}

/* ==== Les cartes des juges (Q41) : une carte par juge, le nom de celui qui gagne chaque round ==== */
function sdCartesJuges(f,anim){
  const d=f.d,R=d.meth==='Décision'?d.n:d.rd;
  return `<div class="sd-sc">${[0,1,2].map(q=>{const c=rsCarteJuge(d,q);
    const rows=Array.from({length:R},(_,x)=>{const w=c.r[x];return `<div class="sd-sc-r"><span>R${x+1}</span>${w?`<b class="${w===d.g?'g':'p'}">${sdN(sdCote(f,w))}</b>`:'<em>non noté</em>'}</div>`;}).join('');
    const tot=c.r.length?`<div class="sd-sc-t"><span class="T">${c.txt}</span><b class="${c.gagne===d.g?'g':'p'}">${c.gagne?sdN(sdCote(f,c.gagne)):'égalité'}</b></div>`:'<div class="sd-sc-t"><span class="sous">aucun round terminé</span></div>';
    return `<div class="sd-sc-c oct" style="--q:${q}"><div class="sd-sc-h">${esc(RS_JUGES[q])}</div>${rows}${tot}</div>`;}).join('')}</div>`;
}
function sdPhraseJuges(f){
  const d=f.d,c=[0,1,2].map(q=>rsCarteJuge(d,q)),pw=c.filter(x=>x.gagne===d.g).length,pl=c.filter(x=>x.gagne&&x.gagne!==d.g).length;
  if(d.meth==='Décision')return pw===3?`Les trois juges donnent la victoire à ${sdN(f.W)}.`:`${pw} juges sur 3 donnent la victoire à ${sdN(f.W)}.`;
  if(!c[0].r.length)return 'Fin au 1er round : aucune carte rendue.';
  return pl>pw?`Avant la fin, ${sdN(f.L)} menait sur ${pl} carte${pl>1?'s':''} sur 3.`:pw?`Avant la fin, ${sdN(f.W)} menait sur ${pw} carte${pw>1?'s':''} sur 3.`:'Avant la fin, les cartes étaient à égalité.';
}

/* ==== État « resultat » (Q36a) : le verdict se dévoile pas à pas, puis reste jusqu'au clic ==== */
function sdResultat(){
  const f=sdF(S.sd.k),d=f.d,dec=d.meth==='Décision',rs=sdRs(f),st=rsStats(rs);
  /* le centre de l'affiche : d'abord ce qui s'est passé, puis (décision) les trois cartes une à une, enfin le vainqueur */
  const jc=dec?`<div class="sd-vjs">${[0,1,2].map(q=>{const c=rsCarteJuge(d,q);return `<span class="sd-vj oct" style="--q:${q}"><em>${esc(RS_JUGES[q].split(' ')[1])}</em><b class="T">${c.txt}</b><span>${sdN(sdCote(f,c.gagne))}</span></span>`;}).join('')}</div>`
    :`<div class="sd-varr oct"><span class="T">${esc(d.meth==='KO'?(d.det.startsWith('arrêt')?'Arrêt de l’arbitre':'KO'):'Abandon')}</span><span>${rsOrd(d.rd)} round · ${d.tps}</span></div>`;
  const mil=`<div class="pz-mil sd-ver"><span class="pz-quand sd-v0">${dec?'Décision des juges':'Fin du combat'}</span>${jc}
    <div class="sd-mw oct"><div class="sd-mr oct"><div class="sd-m oct"><span class="sd-m-v">Vainqueur</span><span class="T sd-m-t">${sdN(f.W)}</span><span class="sd-m-q">${esc(dec?`décision ${d.det}`:sdDet(d))}</span></div></div></div></div>`;
  const ban=`<div class="pz-banw oct sd-res ${f.titre?'or':''} ${dec?'dec':'fin'}"><div class="pz-ban oct"><i class="pz-img"></i><i class="pz-flash"></i><i class="pz-reflet"></i>${sdCoteHero(f,'a',true)}${mil}${sdCoteHero(f,'b',true)}</div></div>`;
  const phrase=`<div class="sd-phr oct"><span class="marque octr v">V</span><span>${rsPhrase(rs).replace(f.W.prenom+' '+f.W.nom,`${f.W.prenom} ${sdN(f.W)}`)}</span>${sdDiscours(f.k)?`<span class="sd-phr-d etiq">Il prend la parole · ${esc(sdDiscours(f.k).motif.toLowerCase())}</span>`.replace('Il prend',`${sdE(f.W)?'Elle':'Il'} prend`):''}</div>`;
  /* les chiffres, côte à côte, la meilleure valeur en blanc avec le point (comme le face-à-face validé) */
  const a=st.a,b=st.b,dur=st.duree;
  const lignes=[['Frappes significatives',a.fs,b.fs,1,x=>x],['Précision',Math.round(a.fs/a.tent*100),Math.round(b.fs/b.tent*100),1,x=>x+' %'],
    ['Amenées au sol',a.td,b.td,1,(x,s)=>`${x}/${s.tdt}`],['Temps de contrôle',a.ctrl,b.ctrl,1,x=>sdMmss(x)],['Tentatives de soumission',a.sub,b.sub,1,x=>x],['Knockdowns',a.kd,b.kd,1,x=>x]];
  const pt='<span class="pz-pt octr"></span>';
  const cmp=lignes.map(([l,va,vb,dir,fmt],i)=>{const mx=Math.max(va,vb,1),mA=va>vb,mB=vb>va;
    return `<div class="sd-cp" style="--i:${i}"><span class="sd-cp-v ${mA?'w':''}">${mA?pt:''}${fmt(va,a)}</span><span class="sd-cp-b g"><i style="width:${va/mx*100}%"></i></span>
      <span class="sd-cp-l">${l}</span><span class="sd-cp-b d"><i style="width:${vb/mx*100}%"></i></span><span class="sd-cp-v d ${mB?'w':''}">${fmt(vb,b)}${mB?pt:''}</span></div>`;}).join('');
  const R=dec?d.n:d.rd;
  const rounds=Array.from({length:R},(_,x)=>{const fa=d.co[0][x],fb=d.co[1][x],w=fa===fb?null:fa>fb?f.A:f.B;
    return `<div class="sd-ro oct" style="--i:${x}"><span class="etiq">R${x+1}</span><span class="T">${fa} – ${fb}</span><span class="sous">${w?sdN(w):'égalité'}</span></div>`;}).join('');
  const tete=`<div class="sd-cp sd-cp-h"><span class="sd-cp-v w">${sdN(f.A)}</span><span></span><span></span><span></span><span class="sd-cp-v d w">${sdN(f.B)}</span></div>`;
  const chiffres=pan(titre('Le combat en chiffres',`<span class="sd-lgd">${pt} le meilleur · durée ${sdMmss(dur)}</span>`)+`<div class="sd-cps">${tete}${cmp}</div>
    <div class="sd-ros"><span class="etiq">Frappes significatives par round</span><div class="sd-ros-l">${rounds}</div></div>
`,'flex:1','sd-rc');
  const juges=pan(titre('Les juges')+sdCartesJuges(f)+`<div class="sd-j-p">${sdPhraseJuges(f)}</div>`,'width:580px;flex:none','sd-rj');
  /* ce que ça change : avant → après, pour les deux */
  const ligne=s=>{const c=sdCote(f,s),av=sdAv(c),ap=sdApres(f,s),med=SD_MED[c.id],g=f.d.g===s;
    const box=v=>v==='C'?rsCb(30):`<span class="rs-rk">${esc(v)}</span>`;
    const fl=(x,y)=>{const dd=rsRangV(x)-rsRangV(y);return dd?`<span class="rs-fl ${dd>0?'up':'down'}">${dd>0?'▲':'▼'}</span>`:'<span class="rs-fl">=</span>';};
    return `<div class="sd-ch ${g?'g':''}"><div class="sd-ch-n"><span class="marque octr ${g?'v':'d'}">${g?'V':'D'}</span>${lien(c)}</div>
      <div class="sd-ch-g">
        <div class="sd-ch-c"><span class="etiq">Chez Split</span><span class="rs-rgs">${box(av.rang)}${fl(av.rang,ap.rang)}${box(ap.rang)}</span></div>
        <div class="sd-ch-c"><span class="etiq">Mondial</span><span class="sd-ch-v">${av.mondial} <span class="rs-fl ${av.mondial>ap.mondial?'up':av.mondial<ap.mondial?'down':''}">${av.mondial>ap.mondial?'▲':av.mondial<ap.mondial?'▼':'='}</span> <b>${ap.mondial}</b></span></div>
        <div class="sd-ch-c"><span class="etiq">Bilan</span><span class="sd-ch-v"><b>${rec(ap.v,ap.d,c.n)}</b></span></div>
        <div class="sd-ch-c"><span class="etiq">5 derniers</span>${serie(ap.serie)}</div></div>
      ${med?`<div class="sd-ch-m">${ico('medical',18)}${esc(med[0].replace(', suspendu 60 jours',''))} · retour le ${esc(med[1])}</div>`:''}</div>`;};
  const change=pan(titre('Ce que ça change')+ligne(f.ws)+ligne(f.ls),'width:520px;flex:none','sd-rch');
  return `<div class="pz sd sd-res-e ${dec?'dec':'fin'} ${S.sd.anim?'anim':''}">${ban}${phrase}<div class="sd-cols">${juges}${chiffres}${change}</div></div>`;
}

/* ==== État « discours » (R37, Q37) : le grand moment où l'on écoute le vainqueur (refait le 21/11) ====
   Une scène : le vainqueur sous le projecteur, ce que sa victoire veut dire, la salle ; puis l'interview se déroule
   (la question, la réponse qui s'écrit mot à mot pendant que sa voix bouge, la réaction de la salle) ; à droite ce qu'il gagne,
   ce qui en reste pour la suite, et le défi s'il y en a un (Q37c). Textes inventés : À RELIRE. */
/* La réaction de la salle après chaque réponse (null : rien de marquant). */
const SD_REAC={
  m0:['La salle applaudit [[nana|Nana]]',null,'La salle scande son nom'],
  m1:['Quelques sifflets : une partie de la salle voyait [[meziane|Meziane]] gagner',null,'La salle se lève'],
  p5:['Rires dans la salle',null,'Applaudissements'],
};
/* Ce qui en reste pour la suite de l'histoire (faits tirés de la soirée). */
const SD_RESTE={
  m0:['Il ne réclame personne : son premier challenger reste à choisir.','[[nana|Nana]], coupé à l’arcade, ne combattra pas avant le 19 mars.'],
  m1:['Elle réclame [[gpoidspaillefC|Julia Kovač]] en direct : la presse reprendra le défi.','[[meziane|Meziane]] reste n° 3 des pailles.'],
  p5:['Il ne nomme personne : il veut un classé du top 10.','[[gpoidslourd10|Bertin]] est suspendu 60 jours, jusqu’au 18 avril.'],
};
/** Ce que la victoire veut dire, en deux lignes : le gros titre et sa précision. */
function sdTitreVictoire(f){
  const W=f.W,av=sdAv(W),ap=sdApres(f,f.ws),pl=rsCatPl(f.cat),e=sdE(W);
  let n=0;for(let i=ap.serie.length-1;i>=0&&ap.serie[i]==='v';i--)n++;
  if(ap.rang==='C'&&av.rang!=='C')return [`Nouve${e?'lle':'au'} champion${e?'ne':''}`,`des ${pl}`];
  if(typeof ap.rang==='number'&&ap.rang<=10&&rsRangV(av.rang)>10)return ['Entre dans le top 10',`des ${pl} · n° ${av.rang} → n° ${ap.rang}`];
  if(ap.rang===av.rang)return [`Reste n° ${ap.rang}`,`des ${pl} · ${n} victoire${n>1?'s':''} de suite`];
  return [`Monte n° ${ap.rang}`,`des ${pl}`];
}
/** Une réponse qui s'écrit mot à mot : chaque mot (un nom marqué [[id|nom]] compte pour un) a son instant d'apparition. */
function sdMots(t,d0,pas){
  const toks=t.match(/\[\[[^\]]+\]\]\S*|\S+/g)||[];
  const html=toks.map((w,i)=>`<span class="sd-w" style="--d:${(d0+pas*i).toFixed(2)}s">${i===0?'« ':''}${sdParole(w)}${i===toks.length-1?' »':''}</span>`).join(' ');
  return {html,fin:d0+pas*toks.length};
}
const sdBox=v=>v==='C'?rsCb(30):`<span class="rs-rk">${esc(v)}</span>`;
const sdFl=d=>d>0?'<span class="rs-fl up">▲</span>':d<0?'<span class="rs-fl down">▼</span>':'<span class="rs-fl">=</span>';
function sdDiscoursHtml(){
  const f=sdF(S.sd.k),dc=sdDiscours(f.k)||{motif:'Après le combat',ch:sdChance(f)},W=f.W,L=f.L,e=sdE(W);
  const cible=SD_DEFI[f.k]&&parId(SD_DEFI[f.k]),ap=sdApres(f,f.ws),av=sdAv(W);
  const pourquoi=dc.surprise?`La surprise · donné${e} à ${dc.ch} %`:dc.motif;
  const [h1,h2]=sdTitreVictoire(f),amb=sdAmbiance(f.i+1),champ=ap.rang==='C'&&av.rang!=='C';
  const ban=`<div class="sd-dv oct ${f.titre?'or':''}"><div class="sd-dv-i oct"><i class="sd-dv-img"></i><i class="sd-dv-spot"></i><i class="pz-reflet"></i>
    <div class="sd-dv-g"><div class="sd-dv-h"><span class="sd-dp oct">${f.titre?AF_C:''}${esc(pourquoi)}</span><span class="sd-dc">${esc(rsCatL(f.cat))}</span></div>
      <div class="sd-dpre">${esc(W.prenom)}${W.surnom?` « ${esc(W.surnom)} »`:''}</div>
      <div class="T sd-dn" style="${afNomStyle(W.nom,afTaille(W.nom,150,760))}">${sdN(W)}</div>
      <div class="sd-dbt"><span class="marque octr v">V</span><span>bat ${sdN(L)} · ${esc(f.d.meth==='KO'?'KO':sdMeth(f.d).toLowerCase())}, ${esc(sdQuand(f.d))}</span></div></div>
    <div class="sd-dv-r"><span class="sd-live oct" style="--i:0"><i></i>En direct · dans la cage</span>
      <div class="sd-dv-big" style="--i:1">${champ?`<span class="sd-dv-c">${rsCb(76)}</span>`:''}<div><span class="T">${esc(h1)}</span><span class="sd-dv-s">${esc(h2)}</span></div></div>
      <div class="sd-dv-amb" style="--i:2"><span class="etiq">Le Forum</span><span class="sd-amb-o">${[1,2,3,4,5].map(x=>`<i class="octr ${x<=amb.lv?'on':''}"></i>`).join('')}</span><b class="T">${SD_AMB[amb.lv-1]}</b></div></div></div></div>`;
  /* l'interview, qui se déroule : la question, puis la réponse mot à mot (la voix bouge), puis la salle réagit */
  const itw=SD_ITW[f.k]||[],reac=SD_REAC[f.k]||[];let t=1.4;
  const ech=itw.map(([q,r],i)=>{
    const t0=t,d0=t0+1,{html,fin}=sdMots(r,d0,.05),tn=fin+.9;t=tn;
    const nv=Math.max(1,Math.ceil((fin-d0)/.4)),defi=cible&&i===itw.length-1,tard=`style="--d:${(fin+.1).toFixed(2)}s"`;
    return `<div class="sd-ech ${defi?'defi':''}" style="--t:${t0.toFixed(2)}s;--tn:${(tn-t0).toFixed(2)}s">
      <span class="sd-ech-n octr">${i+1}</span>
      <div class="sd-ech-c"><div class="sd-q"><span class="sd-who">${esc(SD_MICRO)}</span>${esc(q)}</div>
        <div class="sd-r-h"><span class="sd-who b">${sdN(W)}</span><span class="sd-voix" style="--d0:${d0.toFixed(2)}s;--n:${nv}" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
          ${defi?`<span class="sd-r-tag oct sd-tard" ${tard}>Le défi · ${sdN(cible)}</span>`:''}
          ${reac[i]?`<span class="sd-reac sd-tard" ${tard}>${ico('effectif',18)}${sdParole(reac[i])}</span>`:''}</div>
        <p class="sd-r-t">${html}</p></div></div>`;}).join('');
  const passer=S.sd.anim&&!sdReduit()?`<button class="sd-passer" data-sdpasser="1" style="--fin:${t.toFixed(2)}s">Tout afficher ›</button>`:'';
  const micro=pan(titre('Dans la cage',`${esc(SD_MICRO)}, commentateur de Split ${sdRelire}${passer}`)+`<div class="sd-echs">${ech}</div>`,'flex:1','sd-mic');
  /* à droite : ce qu'il gagne et ce qui en reste ; le défi seulement s'il y en a un (Q37c) */
  const dm=av.mondial-ap.mondial;
  const gagne=pan(titre(`Ce qu’${e?'elle':'il'} gagne`)+`<div class="sd-gc">
      <div><span class="etiq">Bilan</span><span class="sd-gc-v">${rec(ap.v,ap.d,W.n)}</span>${serie(ap.serie)}</div>
      <div><span class="etiq">Chez Split</span><span class="rs-rgs">${sdBox(av.rang)}${sdFl(rsRangV(av.rang)-rsRangV(ap.rang))}${sdBox(ap.rang)}</span></div>
      <div><span class="etiq">Mondial</span><span class="sd-gc-v">${av.mondial} ${sdFl(dm)} <b>${ap.mondial}</b></span></div></div>
    <div class="etiq sd-reste-t">Ce qui en reste ${sdRelire}</div>
    <ul class="sd-reste">${(SD_RESTE[f.k]||[]).map(x=>`<li>${sdParole(x)}</li>`).join('')}</ul>`,'','sd-gagne');
  /* sans défi : le bilan du combat (Q37c), la fin, les frappes, le pronostic, puis chaque round */
  const tot=s2=>f.d.co[s2].reduce((x,y)=>x+y,0),R=f.d.meth==='Décision'?f.d.n:f.d.rd;
  const combat=cible?'':pan(`<div class="etiq sd-combat-t">Son combat</div><div class="sd-gc">
      <div><span class="etiq">Fin</span><span class="sd-gc-v"><b>${esc(f.d.meth==='Décision'?'Décision':f.d.meth)}</b></span><span class="sous">${esc(f.d.meth==='Décision'?f.d.det:`${rsOrd(f.d.rd)} round · ${f.d.tps}`)}</span></div>
      <div><span class="etiq">Frappes</span><span class="sd-gc-v"><b>${tot(f.ws==='a'?0:1)}</b> – ${tot(f.ls==='a'?0:1)}</span><span class="sous">${sdN(W)} – ${sdN(L)}</span></div>
      <div><span class="etiq">Donné${e} à</span><span class="sd-gc-v"><b>${dc.ch} %</b></span><span class="sous">lecteurs du Forum</span></div></div>
    <div class="etiq sd-reste-t">Frappes par round · ${sdN(f.A)} – ${sdN(f.B)}</div><div class="sd-dr-ro">${Array.from({length:R},(_,x)=>{const fa=f.d.co[0][x],fb=f.d.co[1][x],w=fa===fb?null:fa>fb?f.A:f.B;
      return `<div class="sd-dro oct"><span class="etiq">R${x+1}</span><span class="T"><b class="${w===f.A?'w':''}">${fa}</b> – <b class="${w===f.B?'w':''}">${fb}</b></span></div>`;}).join('')}</div>`,'flex:1','sd-combat');
  let defi='';
  if(cible){
    const fc=SD_ORDRE.map(sdF).find(x=>x.A===cible||x.B===cible),ac=fc?sdApres(fc,fc.A===cible?'a':'b'):sdAv(cible),med=SD_MED[cible.id];
    const avant=x=>x.date<SD_DATE,dej=pzDeja(W,cible).filter(avant),dernier=historique(cible).filter(avant)[0];
    const etat=med?`<span class="sd-de neg">${ico('medical',18)}${esc(med[0])} · retour le ${esc(med[1])}</span>`
      :cible.statut==='blesse'?`<span class="sd-de neg">${ico('medical',18)}Blessé${sdE(cible)}${cible.retour?` · retour le ${esc(cible.retour)}`:''}</span>`:`<span class="sd-de ok">${ico('ok',18)}Disponible</span>`;
    defi=pan(`<div class="sd-dd-ban oct or"><i class="sd-dd-img"></i><div class="sd-dd-in"><span class="etiq">Le défi · le prochain adversaire possible</span>
        <div class="sd-dd-h">${sdRang(ac)}<span>${esc(cible.prenom)}${cible.surnom?` « ${esc(cible.surnom)} »`:''}</span></div><div class="T sd-dd-n">${sdN(cible)}</div>
        <div class="sd-dd-l"><span class="T">${rec(ac.v,ac.d,cible.n)}</span>${serie(ac.serie)}</div></div></div>
      <div class="sd-dd-x"><span class="etiq">Son état</span>${etat}</div>
      <div class="sd-dd-x"><span class="etiq">Déjà affronté${sdE(cible)}s</span><span>${dej.length?dej.map(x=>`${MOIS_C[x.date.getMonth()]} ${x.date.getFullYear()}`).join(', '):'Jamais'}</span></div>
      ${dernier?`<div class="sd-dd-x"><span class="etiq">Son dernier combat</span><span>${dernier.res==='v'?'bat':'perd contre'} ${lien(parNom(dernier.adv,cible.cat))} · ${MOIS_C[dernier.date.getMonth()]} ${dernier.date.getFullYear()}</span></div>`:''}`,'','sd-dd1');
  }
  return `<div class="pz sd sd-disc ${S.sd.anim?'anim':''}">${ban}<div class="sd-cols">${micro}<div class="sd-dr">${gagne}${defi}${combat}</div></div></div>`;
}

/* ==== État « bilan » (R39) : les vainqueurs, revoir, les primes, les chiffres (à la fin seulement, Q36b) ==== */
function sdBenef(){
  const out=[];SD_ORDRE.forEach(k=>{const f=sdF(k);for(const s of ['a','b'])for(const p of ((f.d.pr||{})[s]||[]))out.push({c:sdCote(f,s),p,f});});
  return out;
}
const sdTotal=()=>sdBenef().reduce((t,b)=>t+primeDe(b.p,63),0);
/** La règle commune (primeBasse, fiche2.js) : elle tient compte de ce que la soirée a rapporté (R39). Les montants se fixent dans les Finances. */
function sdPlainte(c,reste){
  const l=sdBenef().filter(b=>b.c===c),tot=l.reduce((t,b)=>t+primeDe(b.p,63),0);
  return primeBasse(tot,fiBourse(c,l.some(b=>b.f.k==='m0')),reste+sdTotal(),reste);
}
function sdChiffres(){const o=fiSoiree(63),primes=sdTotal(),dep=o.dep.fixe+o.dep.vict+primes+o.dep.salle;return {o,primes,dep,reste:o.recette-dep};}
function sdBilan(){
  const s=RS_SOIREES[0],x=sdChiffres(),o=x.o,a=sdAmbiance(10);
  const cas=(e,v,sous,i)=>`<div class="sd-bc" style="--i:${i}"><span class="etiq">${e}</span><span class="T">${v}</span><span class="sous">${sous}</span></div>`;
  const ban=`<div class="sd-bb oct or"><div class="sd-bb-i oct"><i class="sd-bb-img"></i>
    <div class="sd-bb-g"><div class="T sd-bb-t">Split Fight Night <span style="color:var(--rouge-vif)">63</span></div><div class="sd-bb-l">16 février 2027 · ${esc(s.salle)}</div></div>
    ${cas('Le public',`<span data-sdcompte="${s.public[0]}">${nb(s.public[0])}</span>`,`sur ${nb(s.public[1])} places`,0)}
    ${cas('L’ambiance',SD_AMB[a.lv-1],`depuis ${a.raison} ${sdRelire}`,1)}
    ${cas('La recette',`<span data-sdcompte="${o.recette}">${nb(o.recette)}</span> €`,'billetterie, diffuseur, partenaires, bar',2)}
    ${cas('Ce qu’il te reste',`<span class="${x.reste>=0?'cl-up':'cl-down'}">${x.reste>=0?'+':'−'} <span data-sdcompte="${Math.abs(x.reste)}">${nb(Math.abs(x.reste))}</span> €</span>`,'recette moins les dépenses',3)}</div></div>`;
  const ligne=(k,i)=>{const f=sdF(k),ap=sdApres(f,f.ws),av=sdAv(f.W),mv=rsMvt(av.rang,ap.rang);
    return `<div class="sd-v ${f.titre?'titre':''} ${i===4?'sep':''}" style="--i:${i}"><span class="marque octr v">V</span>
      <span class="sd-v-n">${lien(f.W)}<span class="sous">bat ${sdN(f.L)}</span></span>
      <span class="sd-v-m"><b>${esc(sdMeth(f.d))}</b><span>${esc(f.d.meth==='Décision'?`${f.d.n} rounds`:`${rsOrd(f.d.rd)} round · ${f.d.tps}`)}</span></span>
      <span class="sd-v-mv">${mv}</span>
      <span class="sd-v-r"><button class="sd-ic oct" data-sdrevoir="arene|${k}" title="Revoir dans l’arène" aria-label="Revoir ${esc(f.W.nom)} contre ${esc(f.L.nom)} dans l’arène">${ico('carte',24)}</button>
        <button class="sd-ic oct" data-sdrevoir="recit|${k}" title="Lire le récit" aria-label="Lire le récit de ${esc(f.W.nom)} contre ${esc(f.L.nom)}">${ico('presse',24)}</button></span></div>`;};
  const vainq=pan(titre('Les vainqueurs',`<span class="sd-lg">${ico('carte',20)} l’arène <i></i>${ico('presse',20)} le récit</span>`)+
    `<div class="sd-vs">${[...SD_ORDRE].reverse().map(ligne).join('')}</div><button class="sd-lien sd-tout" data-sdtout="1">Tous les résultats ›</button>`,'flex:1','sd-vq');
  const ben=sdBenef();
  const prime=(p,i)=>{const l=ben.filter(b=>b.p===p);
    return `<div class="sd-pb" style="--i:${i}">${medaille(p,40,63)}<div class="sd-pb-t"><span class="sd-pb-n">${esc(PERF_TYPES.find(y=>y[0]===p)[1])}</span>
      <span class="sd-pb-q">${l.map(b=>sdN(b.c)).join(', ')}</span></div><span class="T sd-pb-v">${nb(primeDe(p,63))} €</span></div>`;};
  const plaintes=[...new Set(ben.map(b=>b.c))].filter(c=>sdPlainte(c,x.reste));
  /* Retour du 20/11 : les montants se fixent dans les Finances, avant ou après une soirée, pas au bilan. */
  const primes=pan(titre('Les primes',`<button data-pmouvrir>Montants : Finances ›</button>`)+`${['soiree','perf','fin'].map(prime).join('')}
    <div class="sd-pt-t"><span class="etiq">Ce soir</span><span class="T">${nb(x.primes)} €</span><span class="sous">${ben.length} primes</span></div>
    <div class="sd-pt-d">${plaintes.length?`<span class="cl-down">▼</span> ${plaintes.map(sdN).join(', ')} ${plaintes.length>1?'trouvent leur':'trouve sa'} prime basse`:`<span class="cl-up">●</span> Personne ne se plaint de sa prime`}</div>`,'width:440px;flex:none','sd-pr');
  const l=(t,v,max,neg)=>`<div class="sd-dt"><span>${t}</span><b>${neg?'− ':''}${nb(v)} €</b><span class="jauge"><i style="width:${v/max*100}%;background:${neg?'var(--texte2)':'var(--blanc)'}"></i></span></div>`;
  const m=Math.max(o.rec.diff,o.dep.fixe+o.dep.vict,x.primes);
  const detail=pan(titre('Le détail')+`<div class="etiq sd-dt-h">Recettes</div>${l('Billetterie',o.rec.billet,m)}${l('Diffuseur',o.rec.diff,m)}${l('Partenaires',o.rec.part,m)}${l('Bar et boutique',o.rec.bar,m)}
    <div class="etiq sd-dt-h">Dépenses</div>${l('Bourses',o.dep.fixe+o.dep.vict,m,1)}${l('Primes',x.primes,m,1)}${l('Salle et production',o.dep.salle,m,1)}
    <button class="sd-lien" data-go="finances">Les finances ›</button>`,'width:400px;flex:none','sd-det');
  return `<div class="pz sd sd-bilan ${S.sd.anim?'anim':''}">${ban}<div class="sd-cols">${vainq}${primes}${detail}</div>${S.sd.etat==='recit'?sdRecit():''}</div>`;
}
/* ---- Par-dessus le bilan : le récit d'un combat (Q39b), minute par minute puis round par round ---- */
function sdMinutes(f){
  if(f._mn)return f._mn;const d=f.d,R=d.meth==='Décision'?d.n:d.rd,r=graine('mn'+f.k),out=[];
  const fin=d.meth==='Décision'?300:sdSec(d.tps);
  for(let x=0;x<R;x++){const last=x===R-1,nm=last?Math.max(1,Math.ceil(fin/60)):5;
    for(const s of [0,1]){const w=Array.from({length:nm},()=>.4+r()),t=w.reduce((a,b)=>a+b,0);let reste=d.co[s][x];
      w.forEach((v,i)=>{const n=i===nm-1?reste:Math.min(reste,Math.round(d.co[s][x]*v/t));reste-=n;(out[x*5+i]=out[x*5+i]||{rd:x+1,mi:i,a:0,b:0})[s?'b':'a']=n;});}}
  return f._mn=out.filter(Boolean);
}
function sdRecit(){
  const f=sdF(S.sd.k),d=f.d,R=d.meth==='Décision'?d.n:d.rd,mos=sdMoments(f),mn=sdMinutes(f),T=f.rounds*5;
  const max=Math.max(...mn.map(x=>Math.max(x.a,x.b)),1),W=1660,H=230,mid=H/2,bw=W/T;
  const ico2={ko:'éclair',sou:'boucle',frappe:'série',amenee:'au sol',serre:'serré',decision:'cartes'};
  const svg=`<svg class="sd-mn" viewBox="0 0 ${W} ${H+40}" role="img" aria-label="Frappes significatives minute par minute">
    ${Array.from({length:f.rounds},(_,i)=>`<rect x="${i*5*bw}" y="0" width="${5*bw}" height="${H}" class="${i+1>R?'nd':i%2?'imp':''}"/><text x="${i*5*bw+10}" y="${H+30}" class="sd-mn-r">R${i+1}${i+1>R?' · non disputé':''}</text>`).join('')}
    <line x1="0" x2="${W}" y1="${mid}" y2="${mid}" class="sd-mn-ax"/>
    ${mn.map((x,i)=>{const X=((x.rd-1)*5+x.mi)*bw+bw*.18,w=bw*.64,ha=x.a/max*(mid-14),hb=x.b/max*(mid-14);
      return `<rect x="${X}" y="${mid-ha}" width="${w}" height="${ha}" class="a" style="--i:${i}"/><rect x="${X}" y="${mid}" width="${w}" height="${hb}" class="b" style="--i:${i}"/>`;}).join('')}
    ${d.meth!=='Décision'?`<line x1="${((R-1)*5+sdSec(d.tps)/60)*bw}" x2="${((R-1)*5+sdSec(d.tps)/60)*bw}" y1="0" y2="${H}" class="sd-mn-fin"/>`:''}
    ${mos.map((m,i)=>{const x=((m.rd-1)*5+Math.min(5,sdSec(m.t)/60))*bw;return `<g class="sd-mn-m" transform="translate(${Math.min(W-22,Math.max(22,x))},24)"><title>${esc(`${rsOrd(m.rd)} round, ${m.t} : ${sdMomentTxt(f,m).tt}`)}</title><polygon points="${sdOct(20,0,0)}"/><g transform="translate(-10,-10) scale(.833)" class="sd-mn-i">${SD_ICO[m.type]}</g></g>`;}).join('')}
  </svg>`;
  const col=x=>{const j=d.j.map(t=>t[x]||null),ms=mos.filter(m=>m.rd===x+1);
    return `<div class="sd-rc-c" style="--i:${x}"><div class="sd-rc-h"><span class="T">${rsOrd(x+1)} round</span><span class="sd-rc-js">${j.map(w=>w?`<i class="${w}" title="${esc(sdCote(f,w).nom)}"></i>`:'<i class="nn" title="non noté"></i>').join('')}</span></div>
      <div class="sd-rc-f"><b class="T">${d.co[0][x]}</b><span class="sd-fb"><i style="width:${d.co[0][x]/Math.max(1,d.co[0][x]+d.co[1][x])*100}%"></i></span><b class="T">${d.co[1][x]}</b></div>
      ${ms.length?ms.map(m=>{const i=mos.indexOf(m),t=sdMomentTxt(f,m);return `<div class="sd-rc-m"><span class="sd-rc-n octr">${sdIco(m.type,18)}</span><div><b>${esc(m.t)} · ${t.t}</b><p>${esc(t.g)} · ${esc(t.s)}</p></div></div>`;}).join('')
        :`<div class="sd-rc-m vide">Pas de temps fort : ${d.co[0][x]>d.co[1][x]?sdN(f.A):sdN(f.B)} touche plus (${Math.max(d.co[0][x],d.co[1][x])} contre ${Math.min(d.co[0][x],d.co[1][x])}).</div>`}</div>`;};
  return `<div class="sd-over">${pan(titre(`${sdN(f.A)} contre ${sdN(f.B)}`,`${sdRelire}<button data-sdrevoir="arene|${f.k}">L’arène ›</button>`)+
    `<div class="sd-rc-s"><span class="marque octr v">V</span><span>${rsPhrase(sdRs(f)).replace(f.W.prenom+' '+f.W.nom,`${esc(f.W.prenom)} ${sdN(f.W)}`)}</span></div>
     <div class="sd-mn-h"><span class="etiq">Frappes significatives, minute par minute</span><span class="sd-lgd"><i class="sd-k a"></i>${sdN(f.A)} en haut <i class="sd-k b"></i>${sdN(f.B)} en bas · ${[...new Set(mos.map(x=>x.type))].map(t=>`${sdIco(t,18)} ${SD_TYPES[t]}`).join(' · ')}</span></div>${svg}
     <div class="sd-rc-cs" style="--n:${R}">${Array.from({length:R},(_,x)=>col(x)).join('')}</div>
     <div class="sous sd-rc-lg"><i class="sd-k a"></i><i class="sd-k b"></i> les trois juges, round par round (vide : non noté)</div>`,'height:100%')}</div>`;
}
const sdOct=(R,cx,cy)=>{const o=[];for(let i=0;i<8;i++){const a=Math.PI/8+i*Math.PI/4;o.push(`${(cx+R*Math.cos(a)).toFixed(1)},${(cy+R*Math.sin(a)).toFixed(1)}`);}return o.join(' ');};

/* ---- Rendu et branchement dans le cadre ---- */
function sdHtml(){
  sdInit();const e=S.sd.etat;
  if(e==='direct')return sdDirect();
  if(e==='fort'||e==='combat')return sdFort();
  if(e==='resultat')return sdResultat();
  if(e==='discours')return sdDiscoursHtml();
  return sdBilan();
}
/** Le bouton jaune de l'en-tête nomme l'étape suivante (comme l'Arrivée) ; il garde la place de Continuer. */
function sdBouton(){
  const e=S.sd.etat;
  if(e==='direct')return sdVue(SD_ORDRE[S.sd.n])==='resultat'?'Voir le résultat':'Regarder';
  if(e==='fort'||e==='combat')return S.sd.revoir?'Le bilan':'Le résultat';
  const der=SD_ORDRE.indexOf(S.sd.k)===SD_ORDRE.length-1;
  if(e==='resultat')return sdDiscours(S.sd.k)?'Le discours':der?'Fin de la soirée':'Combat suivant';
  if(e==='discours')return der?'Fin de la soirée':'Combat suivant';
  return 'Le lendemain';
}
const sdPlein=()=>['fort','combat','resultat','discours'].includes(S.sd.etat);
const sdRendreBase=rendre;
rendre=function(){
  document.body.classList.toggle('sd-mode',S.ecran==='soiree'&&sdPlein());
  if(S.ecran!=='soiree'){cancelAnimationFrame(SD_ANIM.raf);sdRendreBase();return;}
  sdInit();S.date=new Date(SD_DATE);cancelAnimationFrame(SD_ANIM.raf);
  rendreBarre();rendreEntete('Soirée');$('#alerte').innerHTML='';
  const b=[...document.querySelectorAll('#entete .boite .T')].find(x=>/Fight Night/.test(x.textContent));if(b)b.innerHTML='Split Fight Night <span style="color:var(--rouge-vif)">63</span>';
  const c=$('#bContinuer');if(c)c.innerHTML=`${esc(sdBouton())} ${ico('avant',30,3)}`;
  $('#corps').style.top='108px';$('#corps').innerHTML=sdHtml();
  $('#zone').classList.toggle('fiche-ouverte',!!S.fiche);
  sdApresRendu();S.sd.anim=false;
};
/** Après le rendu : l'arène, les compteurs. */
function sdApresRendu(){
  const e=S.sd.etat;
  if((e==='fort'||e==='combat')&&!S.fiche){
    /* la police des plaques et du logo doit être prête avant le premier dessin */
    sdJouerMoment();}
  if(S.sd.anim&&!sdReduit())document.querySelectorAll('[data-sdcompte]').forEach(el=>{const v=+el.dataset.sdcompte,t0=performance.now(),d=1100;
    const f=t=>{const k=Math.min(1,(t-t0)/d),e2=1-Math.pow(1-k,3);el.textContent=nb(v*e2);if(k<1)requestAnimationFrame(f);};requestAnimationFrame(f);});
}
const sdAllerBase=aller;
aller=function(ec){
  if(ec!=='soiree'){if(S.ecran==='soiree'){cancelAnimationFrame(SD_ANIM.raf);document.body.classList.remove('sd-mode');
    /* la soirée refermée, les autres écrans sont au lendemain (comme les Résultats) */
    if(S.rs.apres)S.date=new Date(2027,1,17);}sdAllerBase(ec);return;}
  if(S.fiche)fermerFiche(false);
  if(S.ecran!==ec){S.hist.push(S.ecran);S.futur=[];S.sd.anim=true;}
  S.ecran=ec;rendre();
};
/* Retour et Avant à l'intérieur de l'écran : chaque état est un pas du parcours. */
const sdEtat=()=>JSON.stringify({etat:S.sd.etat,n:S.sd.n,k:S.sd.k,mo:S.sd.mo,revoir:S.sd.revoir});
function sdPas(maj){S.hist.push({sd:sdEtat()});S.futur=[];maj();S.sd.anim=true;if(S.sd.etat==='bilan'||S.sd.etat==='recit')sdFinir();rendre();}
const sdAppliquer=v=>{Object.assign(S.sd,JSON.parse(v),{anim:true});};
const sdRetourBase=retour;
retour=function(){
  while(S.ecran!=='soiree'&&S.hist.length&&S.hist[S.hist.length-1]&&S.hist[S.hist.length-1].sd)S.hist.pop();
  const h=S.hist[S.hist.length-1];
  if(S.ecran==='soiree'&&!S.fiche&&h&&h.sd){S.hist.pop();S.futur.push({sd:sdEtat()});sdAppliquer(h.sd);rendre();return;}
  sdRetourBase();
};
function sdAvancer(){
  const f=S.futur[S.futur.length-1];
  if(S.ecran==='soiree'&&!S.fiche&&f&&f.sd){S.futur.pop();S.hist.push({sd:sdEtat()});sdAppliquer(f.sd);rendre();return true;}
  return false;
}
const sdOuvrirBase=ouvrirFiche;
ouvrirFiche=function(id,garderFutur=false){
  if(S.ecran!=='soiree'){sdOuvrirBase(id,garderFutur);return;}
  cancelAnimationFrame(SD_ANIM.raf);
  if(!garderFutur)S.futur=[];
  if(S.fiche&&S.fiche!==id)S.ficheHist.push(S.fiche);
  S.fiche=id;S.panCat=false;rendre();rendreFiche();setTimeout(()=>$('#fiche').classList.add('ouverte'),30);
};
/** La soirée est finie : les Résultats, les classements, les fiches et les Finances suivent (même source, rsJouer63). */
function sdFinir(){if(!S.rs.apres){rsJouer63();S.sd.n=10;}}

/** Le bouton jaune : l'étape suivante. */
function sdSuivant(){
  const e=S.sd.etat;
  const apres=k=>{const i=SD_ORDRE.indexOf(k)+1;return i>=SD_ORDRE.length?()=>{S.sd.etat='bilan';S.sd.k=null;S.sd.n=10;}:()=>{S.sd.etat='direct';S.sd.n=i;S.sd.k=null;};};
  if(e==='direct'){const k=SD_ORDRE[S.sd.n],v=sdVue(k);
    if(v==='complet')toast('Le combat complet se joue dans l’arène du jeu, inchangée (hors de cette maquette).');
    sdPas(()=>{S.sd.k=k;S.sd.mo=0;S.sd.revoir=false;S.sd.etat=v==='forts'?'fort':'resultat';});return;}
  if(e==='fort'||e==='combat'){sdPas(()=>{if(S.sd.revoir){S.sd.etat='bilan';S.sd.revoir=false;}else S.sd.etat='resultat';});return;}
  if(e==='resultat'){if(sdDiscours(S.sd.k)){sdPas(()=>{S.sd.etat='discours';});return;}sdPas(apres(S.sd.k));return;}
  if(e==='discours'){sdPas(apres(S.sd.k));return;}
  sdLendemain();
}
function sdLendemain(){sdFinir();S.rs.vue='lendemain';S.rs.sel=63;S.rs.det=null;aller('resultats');}

/* ---- Clics ---- */
document.addEventListener('click',e=>{
  if(S.ecran!=='soiree')return;
  const t=e.target;let el;const stop=()=>e.stopImmediatePropagation();
  if(t.closest('#bAvant')&&!S.fiche&&sdAvancer()){stop();return;}
  if(t.closest('#bRetour')&&!S.fiche){const h=S.hist[S.hist.length-1];if(h&&h.sd){stop();retour();return;}}
  if(t.closest('#bContinuer')){stop();if(S.fiche)fermerFiche(false);sdSuivant();return;}
  if(S.fiche||t.closest('[data-fiche]')||!t.closest('#corps'))return;
  if((el=t.closest('[data-sdvue]'))){stop();const [k,v]=el.dataset.sdvue.split('|');S.sd.vues[k]=v;sdGarder();rendre();return;}
  if((el=t.closest('[data-sdmo]'))){stop();const i=+el.dataset.sdmo;if(i!==S.sd.mo)sdPas(()=>{S.sd.mo=i;S.sd.etat='fort';});else sdJouerMoment();return;}
  if(t.closest('[data-sdpasser]')){stop();const m=$('.sd-mic');if(m)m.classList.add('tout');return;}
  if((el=t.closest('[data-sdnav]'))){stop();const n=sdMoments(sdF(S.sd.k)).length,i=S.sd.mo+(+el.dataset.sdnav);if(i>=0&&i<n)sdPas(()=>{S.sd.mo=i;S.sd.etat='fort';});return;}
  if((el=t.closest('[data-sdrevoir]'))){stop();const [q,k]=el.dataset.sdrevoir.split('|');sdPas(()=>{S.sd.k=k;S.sd.mo=0;if(q==='arene'){S.sd.etat='fort';S.sd.revoir=true;}else S.sd.etat='recit';});return;}
  if(t.closest('[data-sdtout]')){stop();sdFinir();S.rs.vue='resultats';S.rs.sel=63;S.rs.det=null;aller('resultats');return;}
  if(S.sd.etat==='recit'&&!t.closest('.sd-over')&&t.closest('.sd-bilan')){stop();retour();return;}
},true);

/* ---- Lancement : ?ecran=soiree, options sdetat=direct|combat|fort|resultat|discours|bilan|recit,
   sdn=0…9 (combats déjà joués, état direct), sdcombat=p0…p5|m3…m0 (le combat), sdmoment=1… (le temps fort), sdfiche=<id> ---- */
window.addEventListener('DOMContentLoaded',()=>{
  const q=new URLSearchParams(location.search);
  if(q.get('ecran')!=='soiree')return;
  sdInit();
  const et=q.get('sdetat')||'direct',k=q.get('sdcombat');
  S.sd.etat=['direct','combat','fort','resultat','discours','bilan','recit'].includes(et)?et:'direct';
  if(S.sd.etat==='combat')S.sd.etat='fort';
  S.sd.n=Math.max(0,Math.min(9,parseInt(q.get('sdn')||'0',10)||0));
  S.sd.k=SD_ORDRE.includes(k)?k:['direct','bilan'].includes(S.sd.etat)?null:'m0';
  S.sd.mo=Math.max(0,(parseInt(q.get('sdmoment')||'1',10)||1)-1);if(S.sd.k)S.sd.mo=Math.min(S.sd.mo,sdMoments(sdF(S.sd.k)).length-1);
  if(['fort','resultat','discours'].includes(S.sd.etat)&&S.sd.k)S.sd.n=SD_ORDRE.indexOf(S.sd.k);
  if(['bilan','recit'].includes(S.sd.etat))sdFinir();
  S.ecran='soiree';S.hist=['accueil'];S.sd.anim=true;rendre();
  if(q.get('sdfiche'))setTimeout(()=>ouvrirFiche(q.get('sdfiche')),80);
});
