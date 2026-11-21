"use strict";
/* Maquette lot 1 — fixer les primes de performance (Q39a, R39, ajout du 07/11). Troisième onglet des Finances. Préfixe pm- (classes), pm / PM_ (fonctions, constantes).
   Trois primes pour toute l'organisation, de 1 000 à 100 000 €, fixées avant ou après une soirée, jamais au bilan.
   Un nouveau montant vaut à partir de la prochaine soirée (PRIMES_BAREMES, primeDe, fiche2.js) : une soirée jouée ne change jamais.
   Le coût se lit sur des faits : les primes données aux soirées 56 à 63 (fiSoiree), recalculées avec les montants choisis.
   Plaintes : une phrase et un nom, selon la règle proposée primeBasse (fiche2.js). Répliques inventées : À RELIRE.
   Adresse : ?ecran=finances&pmetat=actuel|change|confirme|plainte|apres. */

const PM_CLE='maquette-primes-1',PM_MIN=1000,PM_MAX=100000,PM_PAS=1000;
const PM_DEMOS={change:{soiree:60000,perf:60000,fin:30000},confirme:{soiree:60000,perf:60000,fin:30000},plainte:{soiree:50000,perf:50000,fin:10000}};
const pmRelire='<span class="relire">à relire</span>';
const pmE=v=>`${nb(Math.abs(v)).replace(/\s/g,' ')} €`;
const pmSigne=v=>v===0?'0 €':`${v>0?'+':'−'} ${pmE(v)}`;
const pmBorne=v=>Math.max(PM_MIN,Math.min(PM_MAX,Math.round(v/PM_PAS)*PM_PAS));
const pmProchaine=()=>S.rs.apres?64:63;
const pmActuels=()=>{const n=pmProchaine();return {soiree:primeDe('soiree',n),perf:primeDe('perf',n),fin:primeDe('fin',n)};};
const pmMemes=(a,b)=>PERF_TYPES.every(([k])=>a[k]===b[k]);
const pmQuand=()=>S.rs.apres?'Fight Night 64 · 3 avr. 2027':'Fight Night 63 · 16 févr. 2027';
const pmLiee=()=>S.fi.pm.br;

/* ---- Réglages : les montants fixés et le brouillon, gardés d'une visite à l'autre ---- */
function pmCharger(){
  let d=null;try{d=JSON.parse(localStorage.getItem(PM_CLE));}catch(e){d=null;}
  if(d&&Array.isArray(d.baremes))d.baremes.forEach(b=>{
    if(!b||(b.des!==63&&b.des!==64)||!b.m)return;
    const m={};for(const [k] of PERF_TYPES){const v=+b.m[k];if(!Number.isFinite(v))return;m[k]=pmBorne(v);}
    PRIMES_BAREMES.push({des:b.des,m:Object.freeze(m)});});
  PRIMES_BAREMES.sort((a,b)=>a.des-b.des);
  const br=pmActuels();
  if(d&&d.br)for(const [k] of PERF_TYPES){const v=+d.br[k];if(Number.isFinite(v))br[k]=pmBorne(v);}
  S.fi.pm={br,conf:false};
}
function pmGarder(){
  if(S.pmDemo)return;
  try{localStorage.setItem(PM_CLE,JSON.stringify({baremes:PRIMES_BAREMES.filter(b=>b.des>0),br:S.fi.pm.br}));}catch(e){}
}
/** Fixe les montants à partir de la prochaine soirée. Ne touche jamais une soirée jouée. */
function primesFixer(m){
  const des=pmProchaine(),fige={};for(const [k] of PERF_TYPES)fige[k]=pmBorne(m[k]);
  for(let i=PRIMES_BAREMES.length-1;i>0;i--)if(PRIMES_BAREMES[i].des>=des)PRIMES_BAREMES.splice(i,1);
  if(!pmMemes(fige,pmAvant(des)))PRIMES_BAREMES.push({des,m:Object.freeze(fige)});
  S.fi.pm={br:{...fige},conf:false};pmGarder();
}
const pmAvant=des=>({soiree:primeDe('soiree',des-1),perf:primeDe('perf',des-1),fin:primeDe('fin',des-1)});

/* ---- Le coût : les vraies primes des soirées jouées, recalculées ---- */
const pmJouees=()=>fiJouees();
const pmCoutDe=(o,m)=>PERF_TYPES.reduce((t,[k])=>t+o.pr[k]*m[k],0);
function pmTotaux(m){
  const l=pmJouees(),verse=l.reduce((t,o)=>t+o.dep.primes,0),choix=l.reduce((t,o)=>t+pmCoutDe(o,m),0),net=l.reduce((t,o)=>t+o.net,0);
  return {n:l.length,de:l[0].n,a:l[l.length-1].n,verse,choix,ecart:choix-verse,net,netChoix:net-(choix-verse)};
}

/* ---- Les plaintes ---- */
/** Qui trouve sa prime basse : aux montants de chaque soirée (m absent) ou aux montants choisis. Une ligne par combattant, la plus récente. */
function pmPlaintes(m){
  const vus=new Set(),out=[];
  [...pmJouees()].reverse().forEach(o=>{
    const avant=o.net+o.dep.primes,prix=k=>m?m[k]:primeDe(k,o.n),tous=PERF_TYPES.reduce((t,[k])=>t+o.pr[k]*prix(k),0),reste=avant-tous,ici=[];
    rsSoiree(o.n).combats.forEach((f,i)=>['a','b'].forEach(sd=>{const l=(f.pr||{})[sd]||[];if(!l.length)return;
      const c=sd==='a'?f.A:f.B,total=l.reduce((t,k)=>t+prix(k),0),bourse=fiBourse(c,i===0);
      if(primeBasse(total,bourse,avant,reste))ici.push({c,n:o.n,total,bourse});}));
    ici.sort((a,b)=>b.bourse-a.bourse).forEach(x=>{if(!vus.has(x.c.id)){vus.add(x.c.id);out.push(x);}});
  });
  return out;
}
/* Chaque réplique part du combat réel du combattant (méthode, round, adversaire, public). {m} = ce qu'il touche en primes ce soir-là. À RELIRE. */
const PM_REPLIQUES={
  '56:nana':'Cinq rounds en combat principal devant 5 800 personnes, et {m}. C’est peu pour ce qu’on a rempli.',
  '56:belkacem':'J’ai perdu, d’accord, mais on a fait le combat de la soirée. {m} pour cinq rounds, c’est juste.',
  '56:gpoidsmouchef16':'KO au 2e round, en carte principale, et je repars avec {m}. Je m’attendais à plus.',
  '56:gpoidsmouche8':'J’ai cherché la soumission pendant trois rounds. {m}, ça ne paie pas ce risque.',
  '56:gpoidsmoyen9':'Une soumission au 2e round et {m}. Mon agent va en reparler.',
  '56:gpoidsmimoyen13':'Fini en 1 min 32, et {m}. La soirée a rapporté bien plus que ça.',
  '56:gpoidscoqf9':'Je finis Elena Okafor au 3e round et on me donne {m}. Ce n’est pas sérieux.',
  '57:gpoidsmouchef16':'Deuxième finition de suite et toujours {m}. À un moment, il faut le reconnaître.',
  '57:gpoidscoqf17':'KO au 2e round à Bordeaux. {m}, pour les coups que j’ai pris avant, c’est léger.',
  '57:gpoidsleger19':'Je gagne à 16 secondes de la fin et ça vaut {m} ? J’aurais pu rester sur la décision.',
  '57:gpoidsmouchef9':'Trois rounds à aller la chercher au sol, pour {m}. Je voudrais en parler.',
  '57:gpoidsmoyen7':'Un KO au 3e round en préliminaires, et {m}. Ça ne donne pas envie de prendre des risques.',
  '57:gpoidsmilourd19':'À 22 ans, je veux bien attendre. Mais {m} pour une finition, c’est peu.',
  '58:gpoidsmouchef10':'Performance de la soirée et {m} au total. Je pensais que ça valait davantage.',
  '58:gpoidsmouchef18':'KO en 1 min 18. {m}, c’est ce qu’on me donne pour avoir fait le travail vite.',
  '58:gpoidsmouche9':'Je règle ça au 1er round et je touche {m}. Mon équipe trouve ça bas, moi aussi.',
  '58:gpoidsplume12':'À 30 ans, je ne vais pas me battre longtemps pour {m} de prime.',
  '58:gpoidscoq8':'Un KO à Nice, en préliminaires, pour {m}. J’aimerais que ça compte davantage.',
  '59:nana':'KO au 3e round en combat principal à Lyon. {m}, pour le public que je ramène, c’est peu.',
  '59:gpoidsmouche13':'Une soumission au 1er round, et {m}. Je pensais que Split payait mieux ses finisseurs.',
  '59:gpoidspaillef9':'À 34 ans, chaque combat compte. {m} pour un KO, ce n’est pas assez.',
  '59:gpoidsplume15':'J’ai fini mon combat, j’ai fait mon travail. {m}, je ne trouve pas ça correct.',
  '59:gpoidsmilourd13':'Un KO au 2e round à Lyon et {m}. Je vais demander à mon agent d’appeler.',
  '60:gpoidscoqf8':'Inès Haddad soumise en 1 min 25, et {m}. Je m’attendais à mieux.',
  '60:gpoidscoqf18':'Je suis allée chercher la soumission au 3e round. {m}, ça fait peu pour ce risque.',
  '60:gpoidsplumef16':'Un KO en préliminaires, ça se paie aussi. {m}, non.',
  '60:gpoidscoq3':'Un KO au 1er round et je touche {m}. À mon niveau, ce n’est pas normal.',
  '60:gpoidsplumef4':'Trois rounds, un KO, et {m}. Je ne trouve pas ça à la hauteur.',
  '61:gpoidsleger17':'Performance de la soirée à Marseille, 6 340 personnes, et {m}. La recette, elle, était là.',
  '61:gpoidsmouche18':'6 340 personnes, une soumission au 1er round, et {m}. Split a bien gagné sa soirée.',
  '61:gpoidscoqf20':'J’ai fini au 1er round devant la plus grosse salle de l’année. {m}, c’est peu.',
  '61:gpoidsmimoyen22':'À 22 ans, je finis mon combat à Marseille et je touche {m}. Je pensais que ça valait plus.',
  '61:gpoidscoqf4':'Soumission à six secondes de la fin. {m} pour ça, je trouve ça léger.',
  '61:gpoidsmimoyen6':'Un KO au 2e round devant 6 340 personnes. Pour {m}, je ne sais pas si je reprends les mêmes risques.',
  '62:nana':'Cinq rounds, le combat de la soirée, et {m}. Je veux qu’on en parle.',
  '62:darras':'Je perds, mais c’est le combat de la soirée. {m} pour cinq rounds contre Nana, c’est bas.',
  '62:gpoidsmouchef14':'À 34 ans, un KO au 2e round, et {m}. Je n’ai plus le temps d’attendre mieux.',
  '62:gpoidspaillef17':'Soumission au 2e round, carte principale. {m}, c’est en dessous de ce que je vaux.',
  '62:gpoidscoq16':'Un KO au 3e round, et {m}. Je demanderai à être mieux payé la prochaine fois.',
  '62:gpoidslourd9':'Soumission au 3e round chez les lourds, ça n’arrive pas tous les soirs. {m}, c’est peu.',
  '63:mezouar':'Je prends la ceinture par soumission au 4e round et je touche {m}. Pour un soir comme ça, c’est peu.',
  '63:rachidi':'Combat de la soirée, trois rounds contre Lynda Meziane, et {m}. On a fait le spectacle.',
  '63:meziane':'J’ai perdu, mais le public a eu son combat. {m}, c’est bas pour ça.',
  '63:belkacem':'KO au 2e round contre Bello et {m}. J’attends mieux après ce que j’ai montré.',
  '63:musaev':'J’ai 22 ans, je soumets Kaya au 1er round et je touche {m}. Je voudrais comprendre.',
  '63:gpoidsmimoyen6':'Deuxième KO de suite chez Split, et encore {m}. Je vais demander à mon agent d’en parler.',
  '63:carvalho':'Soumission au 2e round et {m}. Après ce que la soirée a rapporté, ça passe mal.',
  '63:gpoidslourd13':'KO en 1 min 12 chez les lourds. {m}, c’est trop peu pour un combat pareil.'
};
const pmReplique=x=>(PM_REPLIQUES[`${x.n}:${x.c.id}`]||'[EMPLACEMENT AUTEUR]').replace('{m}',pmE(x.total));
/* La prime de finition : ce qu'en dit une combattante qui en vit. Jamais un chiffre d'effet (donnée cachée). À RELIRE. */
function pmFinitionPhrase(v,auj){
  if(v>auj)return `À ${pmE(v)} la finition, je ne vais pas attendre les juges.`;
  if(v<auj)return `À ${pmE(v)}, je ne vais pas prendre un risque de plus au 3e round.`;
  return `La finition, je la cherche de toute façon. ${pmE(v)}, ça aide.`;
}

/* ---- Rendu ---- */
function pmBandeau(){
  const t=pmTotaux(pmLiee()),change=t.ecart!==0,an=S.fi.anim;
  const st=(id,l,v,s,cl='')=>`<div class="stat-b fi-st"><span class="etiq" id="pm${id}L">${l}</span><span class="T fi-stv ${cl}" id="pm${id}V">${v}</span><span class="sous" id="pm${id}S">${s}</span></div>`;
  return `<div class="bandeau fi-band pm-band ${an?'apparait':''}"><i class="bandeau-img"></i>
    <div class="fi-bt"><span class="etiq">Versé en primes</span><span class="T fi-caisse"><span data-fin="${t.verse}">${nb(t.verse)}</span> €</span><span class="sous">${t.n} soirées, de la ${t.de} à la ${t.a}</span></div>
    ${st('Choix','À ces montants',pmE(t.choix),'sur les mêmes soirées')}
    ${st('Ecart','L’écart',pmSigne(t.ecart),change?`${pmSigne(Math.round(t.ecart/t.n))} par soirée`:'aucun changement',t.ecart>0?'fi-neg':t.ecart<0?'fi-pos':'')}
    ${st('Net',change?'Il te serait resté':'Il t’est resté',pmSigne(t.netChoix),change?`contre ${pmSigne(t.net)} en réalité`:`sur ces ${t.n} soirées`,t.netChoix>=0?'fi-pos':'fi-neg')}</div>`;
}
function pmMontant(k,lab,i){
  const v=pmLiee()[k],auj=pmActuels()[k],pct=x=>(x-PM_MIN)/(PM_MAX-PM_MIN)*100;
  return `<div class="pm-m ${S.fi.anim?'apparait':''}" style="animation-delay:${80+i*70}ms" data-pmligne="${k}">
    <div class="pm-mh">${medaille(k,40)}<span class="pm-mn">${esc(lab)}</span><span class="T pm-mv" data-pmv="${k}">${pmE(v)}</span></div>
    <div class="pm-sl">
      <button class="pm-b oct" data-pmpas="${k}:-1" aria-label="${esc(lab)} : baisser de 1 000 €" title="− 1 000 €"><span class="oct">−</span></button>
      <span class="pm-rail" style="--p:${pct(v)}%"><i class="pm-rep" style="left:${pct(auj)}%"></i>
        <input type="range" min="${PM_MIN}" max="${PM_MAX}" step="${PM_PAS}" value="${v}" data-pmr="${k}" aria-label="${esc(lab)}, en euros" aria-valuetext="${pmE(v)}"></span>
      <button class="pm-b oct" data-pmpas="${k}:1" aria-label="${esc(lab)} : monter de 1 000 €" title="+ 1 000 €"><span class="oct">+</span></button>
    </div>
    <div class="pm-mb"><span class="pm-auj"><i></i>Aujourd’hui ${pmE(auj)}</span><span class="pm-dif" data-pmd="${k}">${pmDif(v,auj)}</span></div>
  </div>`;
}
const pmDif=(v,auj)=>v===auj?'':`${v>auj?'▲':'▼'} ${pmE(v-auj)}`;
function pmPied(){
  const change=!pmMemes(pmLiee(),pmActuels());
  return `<span class="pm-des"><b>Dès la ${esc(pmQuand())}</b><span class="sous">Les soirées jouées ne changent pas.</span></span>
    ${change&&!S.fi.pm.conf?`<span class="pm-act"><button class="bouton oct pm-btn" data-pmannule>Annuler</button><button class="bouton jaune cj oct pm-btn" data-pmfixe>Fixer les primes</button></span>`:''}`;
}
function pmLigneSoiree(o,i){
  const an=S.fi.anim?'apparait':'',d=`style="animation-delay:${120+i*40}ms"`;
  const tete=`<span class="pm-sn"><b class="T">${o.n}</b><span>${esc(o.ville)}</span></span>`;
  if(!o.joue)return `<div class="pm-l pm-venir ${an}" ${d}>${tete}<span class="pm-vt">À venir, rien n’est encore versé</span></div>`;
  const a=pmCoutDe(o,pmLiee()),r=o.net+o.dep.primes-a,diff=a!==o.dep.primes;
  const med=PERF_TYPES.filter(([k])=>o.pr[k]).map(([k])=>`<span class="pm-md">${medaille(k,26,o.n)}<b>${o.pr[k]}</b></span>`).join('');
  return `<button class="pm-l ${an}" ${d} data-pmres="${o.n}" title="Voir les résultats de la ${o.n}">${tete}<span class="pm-meds">${med}</span>
    <span class="pm-c">${pmE(o.dep.primes)}</span><span class="pm-c ${diff?'pm-on':'pm-off'}">${pmE(a)}</span>
    <span class="pm-c pm-r ${r>=0?'fi-pos':'fi-neg'}">${pmSigne(r)}</span><span class="pm-go">›</span></button>`;
}
function pmCout(){
  const t=pmTotaux(pmLiee()),change=t.ecart!==0,nbp=pmJouees().reduce((s,o)=>s+o.pr.soiree+o.pr.perf+o.pr.fin,0);
  return titre('Soirée par soirée')+`<div class="pm-th"><span>Soirée</span><span>Primes données</span><span class="pm-tn">Versé</span><span class="pm-tn">À ces montants</span><span class="pm-tn">${change?'Il serait resté':'Il est resté'}</span><span></span></div>
    <div class="pm-ls">${fiNums().map(fiSoiree).map(pmLigneSoiree).join('')}</div>
    <div class="pm-l pm-tot"><span class="pm-sn"><b class="T">Total</b></span><span class="pm-meds pm-nb">${nbp} primes</span><span class="pm-c">${pmE(t.verse)}</span><span class="pm-c ${change?'pm-on':'pm-off'}">${pmE(t.choix)}</span><span class="pm-c pm-r ${t.netChoix>=0?'fi-pos':'fi-neg'}">${pmSigne(t.netChoix)}</span><span></span></div>`;
}
const pmNoms=l=>{const v=l.slice(0,3).map(x=>lien(x.c)).join(', ');return l.length>3?`${v} <span class="sous">et ${l.length-3} autre${l.length>4?'s':''}</span>`:v;};
function pmGens(nq=3){
  const br=pmLiee(),change=!pmMemes(br,pmActuels()),reel=pmPlaintes(null),choix=change?pmPlaintes(br):reel;
  const ci=new Set(choix.map(x=>x.c.id)),calmes=reel.filter(x=>!ci.has(x.c.id));
  /* Plus aucune plainte à ces montants : on montre ce qu'ils disaient vraiment, plutôt qu'un vide. */
  const apaise=change&&!choix.length&&calmes.length>0,liste=apaise?calmes:choix,aussi=liste.slice(nq),hypo=change&&!apaise;
  const q=x=>`<div class="pm-q"><p>« ${esc(pmReplique(x))} »</p><span class="pm-qn">${lien(x.c)}<span class="sous">${hypo?`à la ${x.n}, à ces montants`:`après la ${x.n}`}</span></span></div>`;
  const bilan=aussi.length||(change&&!apaise&&calmes.length)?`<div class="pm-bil">${aussi.length?`<div><span class="pm-bt">Aussi</span><span>${pmNoms(aussi)}</span></div>`:''}${change&&!apaise&&calmes.length?`<div><span class="pm-bt fi-pos">▲ Plus de plainte</span><span>${pmNoms(calmes)}</span></div>`:''}</div>`:'';
  const l=pmJouees(),fins=l.reduce((t,o)=>t+rsSoiree(o.n).combats.filter(f=>f.meth!=='Décision').length,0),tot=l.reduce((t,o)=>t+o.combats,0);
  const mercier=COMBATTANTS.find(c=>c.id==='gpoidsmouchef16');
  return titre('Les combattants',pmRelire)+`<div class="pm-qs">${apaise?`<div class="pm-ok"><span class="fi-pos">▲</span>À ces montants, plus personne ne s’en plaindrait.</div>`:''}<span class="etiq">${apaise?'Ce qu’ils disaient':hypo?'Ce qu’ils pourraient dire':'Ce qu’ils ont dit'}</span>
      ${liste.length?liste.slice(0,nq).map(q).join(''):`<div class="pm-vide">${change?'À ces montants, personne n’aurait trouvé sa prime basse.':'Personne ne trouve sa prime basse.'}</div>`}${bilan}</div>
    <div class="pm-regle"><span class="etiq">Règle proposée</span><p>Une prime paraît basse sous la bourse du combattant et sous ${Math.round(PRIME_PART_SOIREE*100)} % de ce que la soirée a rapporté avant primes.</p></div>
    <div class="pm-fin"><div class="pm-fh"><span class="pm-fm">${medaille('fin',30)}<span class="etiq">Les finitions</span></span><span class="pm-fc"><b class="T">${fins}</b><span class="sous">sur ${tot} combats</span></span></div>
      <p>« ${esc(pmFinitionPhrase(br.fin,pmActuels().fin))} »</p><span class="pm-qn">${mercier?lien(mercier):'Clara Mercier'}</span></div>`;
}
function pmConfirme(){
  const br=pmLiee(),auj=pmActuels(),t=pmTotaux(br);
  const l=PERF_TYPES.map(([k,lab])=>`<div class="pm-cl">${medaille(k,34)}<span>${esc(lab)}</span><span class="pm-ca">${pmE(auj[k])}</span><span class="pm-cf">›</span><b class="T">${pmE(br[k])}</b></div>`).join('');
  return `<div class="pm-voile" data-pmvoile><div class="pm-dlg apparait" role="dialog" aria-modal="true" aria-labelledby="pmTitre">${pan(`<div class="pt"><h2 id="pmTitre">Fixer les primes ?</h2></div>${l}
    <div class="pm-cc"><div><span class="etiq">À partir de</span><b class="T">${esc(pmQuand())}</b></div>
      <div><span class="etiq">Coût sur les ${t.n} dernières soirées</span><b class="T ${t.ecart>0?'fi-neg':t.ecart<0?'fi-pos':''}">${pmSigne(t.ecart)}</b></div></div>
    <p class="pm-cn">Les soirées déjà jouées gardent leurs montants.</p>
    <div class="pm-cb"><button class="bouton oct" data-pmrevenir>Revenir</button><button class="bouton jaune cj oct" data-pmok>Fixer les primes</button></div>`)}</div></div>`;
}
function pmHtml(){
  const conf=S.fi.pm.conf;
  return `${pmBandeau()}<div class="pm-g">
    ${pan(titre('Les montants')+`<div class="pm-ms">${PERF_TYPES.map(([k,l],i)=>pmMontant(k,l,i)).join('')}</div><div class="pm-pied" id="pmPied">${pmPied()}</div>`,'height:100%','pm-gauche')}
    ${pan(`<div class="pm-cout" id="pmCout">${pmCout()}</div>`,'height:100%','pm-milieu')}
    ${pan(`<div class="pm-gens" id="pmGens">${pmGens()}</div>`,'height:100%','pm-droite')}
  </div>${conf?pmConfirme():''}`;
}

/* ---- Mise à jour sans redessiner (le curseur reste en main) ---- */
function pmMaj(){
  const br=pmLiee(),auj=pmActuels(),pct=x=>(x-PM_MIN)/(PM_MAX-PM_MIN)*100,set=(id,v)=>{const e=$('#'+id);if(e)e.textContent=v;};
  PERF_TYPES.forEach(([k])=>{const v=br[k],r=document.querySelector(`[data-pmr="${k}"]`);
    if(r){if(+r.value!==v)r.value=v;r.setAttribute('aria-valuetext',pmE(v));r.parentElement.style.setProperty('--p',pct(v)+'%');}
    const a=document.querySelector(`[data-pmv="${k}"]`),d=document.querySelector(`[data-pmd="${k}"]`);if(a)a.textContent=pmE(v);if(d)d.textContent=pmDif(v,auj[k]);});
  const t=pmTotaux(br),ch=t.ecart!==0;
  set('pmChoixV',pmE(t.choix));set('pmEcartV',pmSigne(t.ecart));set('pmEcartS',ch?`${pmSigne(Math.round(t.ecart/t.n))} par soirée`:'aucun changement');
  set('pmNetL',ch?'Il te serait resté':'Il t’est resté');set('pmNetV',pmSigne(t.netChoix));set('pmNetS',ch?`contre ${pmSigne(t.net)} en réalité`:`sur ces ${t.n} soirées`);
  const e=$('#pmEcartV');if(e)e.className=`T fi-stv ${t.ecart>0?'fi-neg':t.ecart<0?'fi-pos':''}`;
  const n=$('#pmNetV');if(n)n.className=`T fi-stv ${t.netChoix>=0?'fi-pos':'fi-neg'}`;
  const pied=$('#pmPied');if(pied)pied.innerHTML=pmPied();
  const c=$('#pmCout');if(c)c.innerHTML=pmCout();
  const g=$('#pmGens');if(g)g.innerHTML=pmGens();
  pmAjuster();
}
/** Rien n'est coupé : si trois répliques ne tiennent pas, la dernière passe dans « Aussi », avec son nom. */
function pmAjuster(){
  const g=$('#pmGens');if(!g)return;
  for(let n=3;n>1;n--){const q=g.querySelector('.pm-qs');if(!q||q.scrollHeight<=q.clientHeight)return;g.innerHTML=pmGens(n-1);}
}
const pmRendreBase=rendre;
rendre=function(){pmRendreBase();if(S.ecran==='finances'&&S.fi.onglet==='primes')pmAjuster();};
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{if(S.ecran==='finances'&&S.fi.onglet==='primes'&&$('#pmGens')){$('#pmGens').innerHTML=pmGens();pmAjuster();}});
/** Un pas du parcours (Retour, Avant). Les réglages rapprochés d'un même curseur comptent pour un seul pas. */
function pmPas(cle,maj){
  const t=Date.now();
  if(!(S.pmCle===cle&&t-S.pmT<1200&&S.pmLong===S.hist.length)){S.hist.push({fi:fiEtat()});S.futur=[];}
  S.pmCle=cle;S.pmT=t;S.pmLong=S.hist.length;maj();pmGarder();pmMaj();
}
function pmOuvrir(){
  S.pmCle=null;
  if(S.ecran==='finances'){if(S.fi.onglet!=='primes')fiPas(()=>{S.fi.onglet='primes';S.fi.anim=true;});return;}
  S.fi.onglet='primes';aller('finances');
}
/** Après « Fixer » : Retour ne doit pas rouvrir la confirmation ni rendre l'ancien brouillon. */
function pmValider(){
  const br={...S.fi.pm.br};primesFixer(br);S.pmCle=null;S.futur=[];
  S.hist.forEach(h=>{if(h&&h.fi){const x=JSON.parse(h.fi);x.pm={br:{...br},conf:false};h.fi=JSON.stringify(x);}});
  rendre();toast(`Primes fixées, dès la ${esc(pmQuand())}.`);
}

/* ---- Clics et curseurs ---- */
document.addEventListener('click',e=>{
  const t=e.target;
  if(t.closest('[data-pmouvrir]')){e.stopImmediatePropagation();pmOuvrir();return;}
  if(S.ecran!=='finances'||S.fi.onglet!=='primes'||S.fiche||!t.closest('#corps')||t.closest('[data-fiche]'))return;
  const F=S.fi,stop=()=>e.stopImmediatePropagation();let el;
  if(F.pm.conf){
    if(t.closest('[data-pmok]')){stop();pmValider();return;}
    if(t.closest('[data-pmrevenir]')||(t.closest('[data-pmvoile]')&&!t.closest('.pm-dlg'))){stop();fiPas(()=>{F.pm={...F.pm,conf:false};});return;}
    if(t.closest('[data-pmvoile]'))stop();
    return;
  }
  if((el=t.closest('[data-pmpas]'))){stop();const [k,s]=el.dataset.pmpas.split(':'),v=pmBorne(F.pm.br[k]+(+s)*PM_PAS);
    if(v===F.pm.br[k]){toast(`Une prime va de ${pmE(PM_MIN)} à ${pmE(PM_MAX)}.`);return;}
    pmPas('pas:'+k,()=>{F.pm={...F.pm,br:{...F.pm.br,[k]:v}};});return;}
  if(t.closest('[data-pmfixe]')){stop();S.pmCle=null;fiPas(()=>{F.pm={...F.pm,conf:true};});return;}
  if(t.closest('[data-pmannule]')){stop();S.pmCle=null;fiPas(()=>{F.pm={br:pmActuels(),conf:false};pmGarder();});return;}
  if((el=t.closest('[data-pmres]'))){stop();S.rs.sel=+el.dataset.pmres;S.rs.vue='resultats';S.rs.det=null;aller('resultats');return;}
},true);
document.addEventListener('input',e=>{
  const r=e.target.closest&&e.target.closest('[data-pmr]');if(!r||S.ecran!=='finances')return;
  const k=r.dataset.pmr,v=pmBorne(+r.value);if(v===S.fi.pm.br[k])return;
  pmPas('rail:'+k,()=>{S.fi.pm={...S.fi.pm,br:{...S.fi.pm.br,[k]:v}};});
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&S.ecran==='finances'&&S.fi.onglet==='primes'&&S.fi.pm.conf&&!S.fiche){e.stopImmediatePropagation();e.preventDefault();fiPas(()=>{S.fi.pm={...S.fi.pm,conf:false};});}
},true);

/* ---- Lancement : ?ecran=finances&pmetat=actuel|change|confirme|plainte|apres. Un état d'adresse ne touche pas aux réglages gardés. ---- */
pmCharger();
window.addEventListener('DOMContentLoaded',()=>{
  const q=new URLSearchParams(location.search),et=q.get('pmetat');
  if(!et||q.get('ecran')!=='finances')return;
  S.pmDemo=true;PRIMES_BAREMES.length=1;
  if(et==='apres'&&!S.rs.apres){Object.assign(S.af.m[2],{b:'bello'});Object.assign(S.af.m[3],{a:'labbe',b:'darras'});rsJouer63();}
  S.fi.onglet='primes';S.fi.pm={br:{...(PM_DEMOS[et]||pmActuels())},conf:et==='confirme'};S.fi.anim=true;rendre();
});
