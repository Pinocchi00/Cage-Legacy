"use strict";
/* ==== [ANCRE: MGMT_LOT5_T3_MEDIAS] — Lot 5 T3, la couche médias (document des
   voix §6). Dix médias regardent la même soirée et en tirent chacun autre
   chose ; les lignes (mgmt-medias-data.js, relu:false) n'ont que des
   emplacements. Tout se déduit de l'état du jeu et se rejoue : le choix d'un
   média et d'une ligne est tiré sur un flux séparé (id, situation, cycle),
   jamais stocké. Une ligne dont un emplacement manque, ou dont la condition
   n'est pas remplie, n'est jamais montrée. Parties neuves seulement
   (effectifs===1). Trois situations : l'AFFICHE (la carte principale
   annoncée), le LENDEMAIN (le dernier combat principal joué), le REBOOK (un
   combattant remis sur la carte cinq semaines après un KO). ==== */

/** Au plus combien de lignes de presse par surface. */
const MGMT_MEDIAS_MAX=3;
/** Un pays est « rare » dans Split au plus à ce nombre de combattants. */
const MGMT_MEDIAS_PAYS_RARE=4;

function mgmtMediaDe(id){ return MGMT_MEDIAS.find(x=>x.id===id)||null; }

/** Les voix « bruyantes » du document des voix §4 (Timide contre n'importe qui de bruyant). */
const MGMT_MEDIAS_BRUYANTS=['le-sans-filtre','le-bavard-de-la-cage','le-mechant-de-catch','le-metteur-en-scene','linfluenceur','le-reclamant'];

/** Une voix correspond-elle à un jeton de condition : '*' (toute voix), 'bruyant', ou un identifiant. */
function mgmtMediasVoixJeton(jeton,voix){
  if(jeton==='*') return true;
  if(jeton==='bruyant') return MGMT_MEDIAS_BRUYANTS.includes(voix);
  return jeton===voix;
}

/** Quand deux voix se rencontrent (§4) : 'x+y' ; renvoie [premier,second] — le
 *  combattant de la première voix d'abord —, ou null. */
function mgmtMediasVoixPaire(spec,scene){
  const [x,y]=spec.split('+');
  if(mgmtMediasVoixJeton(x,scene.va)&&mgmtMediasVoixJeton(y,scene.vb)) return [scene.a,scene.b];
  if(mgmtMediasVoixJeton(x,scene.vb)&&mgmtMediasVoixJeton(y,scene.va)) return [scene.b,scene.a];
  return null;
}

/** Première soirée dont le combat principal est un combat féminin (scénario n° 32). */
function mgmtMediasPionniere(m,t){
  const tete={};
  for(const h of m.hist||[]){ if(h&&h.slot==='main'&&tete[h.c]===undefined) tete[h.c]=h; }
  const feminin=h=>{ const d=divById(h.a.div); return !!d&&d.gender==='F'; };
  if(tete[t.c]!==t||!feminin(t)) return false;
  return !Object.keys(tete).some(c=>Number(c)<t.c&&feminin(tete[c]));
}

/** Le pays d'un combattant est-il rare dans Split (et n'est-il pas la France) ? */
function mgmtMediasPaysRare(m,f){
  const ck=mgmtIdentitePays(f);
  if(ck==='FR') return null;
  const n=(m.roster||[]).filter(o=>!mgmtIsRetired(o)&&mgmtIdentitePays(o)===ck).length;
  return n<=MGMT_MEDIAS_PAYS_RARE?ck:null;
}

/** Le contexte d'une ligne de condition `si` pour la scène {x (sujet),y (l'autre),
 *  gagnant, trace}, ou null si la condition n'est pas remplie. */
function mgmtMediasContexte(m,si,scene){
  const base={n:scene.n,round:scene.round,rounds:scene.rounds,cat:scene.cat,org:mgmtOrgNom(m)};
  const pair=[scene.a,scene.b].filter(Boolean);
  const fam=scene.family;
  switch(si||''){
    case '': return Object.assign(base,{a:scene.a.name,b:scene.b.name});
    case 'finition': return fam&&fam!=='dec'?Object.assign(base,{a:scene.a.name,b:scene.b.name}):null;
    case 'dec': return fam==='dec'?Object.assign(base,{a:scene.a.name,b:scene.b.name}):null;
    case 'ko1': return fam&&fam!=='dec'&&scene.round===1?Object.assign(base,{a:scene.a.name,b:scene.b.name}):null;
    case 'surprise': return scene.surprise?Object.assign(base,{a:scene.a.name,b:scene.b.name}):null;
    case 'serie': return scene.serie?Object.assign(base,{a:scene.a.name,b:scene.b.name}):null;
    case 'fr': {
      const fr=pair.find(f=>mgmtIdentitePays(f)==='FR');
      return fr?Object.assign(base,{a:fr.name,b:(fr===scene.a?scene.b:scene.a).name}):null;
    }
    case 'etranger': case 'etrangerPerd': {
      const cand=si==='etranger'?(scene.gagne?[scene.a]:pair):(scene.gagne?[scene.b]:[]);
      const lui=cand.find(f=>mgmtMediasPaysRare(m,f));
      if(!lui) return null;
      return Object.assign(base,{a:lui.name,b:(lui===scene.a?scene.b:scene.a).name,pays:COUNTRIES[mgmtIdentitePays(lui)].name});
    }
    case 'pionniere': return scene.pionniere?Object.assign(base,{a:scene.a.name,b:scene.b.name}):null;
    case 'guerre': return scene.guerre?Object.assign(base,{a:scene.a.name,b:scene.b.name}):null;
    default: {
      if(!si.startsWith('voix:')) return null;
      const p=mgmtMediasVoixPaire(si.slice(5),scene);
      return p?Object.assign(base,{a:p[0].name,b:p[1].name}):null;
    }
  }
}

/** Les lignes de presse d'une scène pour une situation : au plus `max`, de
 *  médias différents, dans un ordre tiré sur (cle, situation, cycle).
 *  @returns {Array<{media,nom,texte}>} */
function mgmtMediasScene(m,situation,scene,cle,max,role){
  /* Retours d'Anthony du 09/10/2026 (« toujours différent ») : parmi les lignes que la scène permet (la condition tient, les emplacements se remplissent), on lit
     les suivantes à chaque cycle, dans un ordre mélangé une fois pour la partie (flux 'presse') — la même ligne ne revient qu'après le tour des autres. Les lignes de
     rencontre de voix, de pionnière et de guerre passent d'abord. `role` décale la scène secondaire d'un demi-tour. Rien ne se stocke. */
  const pool=MGMT_MEDIAS_LIGNES.filter(l=>l.situation===situation);
  const ordre=mgmtIdentiteMelange(pool.map((l,i)=>i),mgmtIdentiteStream('presse','ordre|'+situation)), rang=[]; ordre.forEach((i,p)=>{ rang[i]=p; });
  const eligibles=[];
  pool.forEach((l,i)=>{
    const ctx=mgmtMediasContexte(m,l.si,scene); if(!ctx) return;
    const plein=mgmtVoixRemplit(l.texte,ctx); if(plein===null) return;
    eligibles.push({l,plein,rang:rang[i],s:/^(voix:|pionniere|guerre)/.test(l.si||'')?0:1});
  });
  eligibles.sort((x,y)=>x.s-y.s||x.rang-y.rang);
  /* Dans chaque groupe, les lignes s'alternent d'un média à l'autre (un tour de chacun, puis un second tour…) : trois lignes de suite viennent de trois médias,
     et le tour se lit de bout en bout avant de recommencer. */
  const alterne=g=>{
    const parMedia=new Map(); for(const x of g){ if(!parMedia.has(x.l.media)) parMedia.set(x.l.media,[]); parMedia.get(x.l.media).push(x); }
    const listes=[...parMedia.values()], out=[];
    for(let r=0;listes.some(l=>l.length>r);r++) for(const l of listes) if(l.length>r) out.push(l[r]);
    return out;
  };
  const groupes=[alterne(eligibles.filter(x=>x.s===0)),alterne(eligibles.filter(x=>x.s===1))];
  const out=[], pris=new Set();
  for(const g of groupes){
    const n=g.length; if(!n) continue;
    const debut=((m.cycle||0)*MGMT_MEDIAS_MAX+(role?Math.floor(n/2):0))%n;
    for(let k=0;k<n&&out.length<max;k++){
      const {l,plein}=g[(debut+k)%n];
      if(pris.has(l.media)) continue;
      const media=mgmtMediaDe(l.media);
      pris.add(l.media);
      out.push({media:l.media,nom:media.nom,texte:media.majuscules?plein.toLocaleUpperCase('fr'):plein});
    }
  }
  return out;
}

/** L'affiche : la tête de la carte principale. @returns {Array} */
function mgmtMediasAffiche(m){
  if(!m||m.effectifs!==1||!m.card||!Array.isArray(m.card.main)) return [];
  const cf=m.card.main.find(x=>x&&x.a&&x.b);
  if(!cf) return [];
  const a=mgmtFighterById(m,cf.a), b=mgmtFighterById(m,cf.b);
  if(!a||!b) return [];
  const scene={a,b,n:m.eventsPlayed+1,cat:mgmtDivisionLabel(a.div),va:mgmtVoixActuelle(m,a),vb:mgmtVoixActuelle(m,b)};
  return mgmtMediasScene(m,'affiche',scene,cf.a+'|'+cf.b,MGMT_MEDIAS_MAX)
    .map(x=>Object.assign(x,{id:a.id,div:a.div}));
}

/** La scène d'un combat joué, lue sur sa trace (gagnant en a, perdant en b), ou null pour un nul. */
function mgmtMediasSceneDe(m,t){
  if(!t||t.winner==='D') return null;
  const gagnant=t.winner==='A'?t.a:t.b, perdant=t.winner==='A'?t.b:t.a;
  const a=mgmtFighterById(m,gagnant.id), b=mgmtFighterById(m,perdant.id);
  if(!a||!b) return null;
  /* La série et la surprise se lisent dans la trace d'avant combat. */
  const serie=mgmtResultatsDetail(m,a).filter((x,i,l)=>l.slice(0,i+1).every(y=>y.issue==='win')).length>=3;
  const surprise=(perdant.W-perdant.L)>(gagnant.W-gagnant.L);
  const scene={a,b,gagne:true,family:t.family,round:t.round,rounds:t.rounds,n:m.eventsPlayed,
    cat:mgmtDivisionLabel(a.div),serie,surprise,va:mgmtVoixActuelle(m,a),vb:mgmtVoixActuelle(m,b)};
  scene.pionniere=mgmtMediasPionniere(m,t);
  scene.guerre=scene.va==='le-violent-heureux'&&scene.vb==='le-violent-heureux'&&(t.family==='dec'||t.round>=3);
  return scene;
}

/** Le poids d'un résultat pour la presse du lendemain (corrections du 08/10, 3.2) : un champion battu ou une ceinture qui change de
 *  main d'abord, puis un favori fini au premier round. 0 : rien de marquant. Pur. */
function mgmtMediasMarquant(m,t,h){
  if(!t||t.winner==='D') return 0;
  const gagnant=t.winner==='A'?t.a:t.b, perdant=t.winner==='A'?t.b:t.a;
  const champPerd=typeof mgmtRangAvant==='function'&&mgmtRangAvant(m,perdant.id,perdant.div,t.c,h)==='C';
  if(champPerd) return 3;
  const favoriFini=t.family!=='dec'&&t.round===1&&(perdant.W-perdant.L)>(gagnant.W-gagnant.L);
  return favoriFini?2:0;
}

/** Le lendemain : d'abord le combat principal de la dernière soirée (le dernier de la carte principale, dans l'ordre de passage),
 *  puis les résultats les plus marquants — champion battu, favori fini au premier round, ceinture qui change de main
 *  (corrections du 08/10, 3.1 et 3.2). @returns {Array} */
function mgmtMediasLendemain(m){
  if(!m||m.effectifs!==1||!m.lastEvent||!Array.isArray(m.hist)) return [];
  const c=m.lastEvent.cycle;
  const traces=[]; m.hist.forEach((t,h)=>{ if(t&&t.c===c) traces.push({t,h}); });
  const mains=traces.filter(x=>x.t.slot==='main'&&x.t.winner!=='D');
  const principal=mains[mains.length-1];
  const lignes=[];
  const marquants=traces.filter(x=>x!==principal).map(x=>({x,p:mgmtMediasMarquant(m,x.t,x.h)})).filter(y=>y.p>0).sort((y,z)=>z.p-y.p||y.x.h-z.x.h).slice(0,1);
  if(principal){
    const scene=mgmtMediasSceneDe(m,principal.t);
    if(scene) for(const l of mgmtMediasScene(m,'lendemain',scene,principal.t.a.id+'|'+principal.t.b.id,marquants.length?2:MGMT_MEDIAS_MAX))
      lignes.push(Object.assign(l,{id:scene.a.id,div:scene.a.div}));
  }
  for(const {x} of marquants){
    const scene=mgmtMediasSceneDe(m,x.t);
    if(scene) for(const l of mgmtMediasScene(m,'lendemain',scene,x.t.a.id+'|'+x.t.b.id,1,1)) lignes.push(Object.assign(l,{id:scene.a.id,div:scene.a.div}));
  }
  return lignes;
}

/** Le rebook : un combattant de la carte dont le dernier combat est un KO subi
 *  le cycle précédent (La Pesée). @returns {Array} */
function mgmtMediasRebook(m){
  if(!m||m.effectifs!==1) return [];
  for(const cf of mgmtCardFights(m)){
    for(const id of [cf.a,cf.b]){
      const f=mgmtFighterById(m,id);
      const dernier=f?mgmtResultatsDetail(m,f)[0]:null;
      if(dernier&&dernier.issue==='loss'&&dernier.family==='ko'&&dernier.c===m.cycle-1){
        const scene={a:f,b:f,n:m.eventsPlayed+1,cat:mgmtDivisionLabel(f.div)};
        const l=mgmtMediasScene(m,'rebook',scene,f.id,1)[0];
        if(l) return [Object.assign(l,{id:f.id,div:f.div})];
      }
    }
  }
  return [];
}

/** Toute la presse de la semaine, dans l'ordre où elle se lit : le rebook (il
 *  met le joueur face à ses décisions), le lendemain, puis l'affiche. */
function mgmtMediasLignes(m){
  const recent=m&&m.lastEvent&&m.lastEvent.cycle>=m.cycle-1;
  return [].concat(mgmtMediasRebook(m),recent?mgmtMediasLendemain(m):[],mgmtMediasAffiche(m));
}

/** Le bloc « Ce qu'en dit la presse » du lendemain. */
function mgmtMediasLendemainHtml(m){
  const l=mgmtMediasLendemain(m);
  if(!l.length) return '';
  return `<div class="mgmt-ld-presse"><h3 class="mgmt-ld-hd">Ce qu’en dit la presse</h3>`
    +l.map(x=>`<p class="mgmt-ld-parole"><span>${esc(x.nom)}</span> ${esc(x.texte)}</p>`).join('')+`</div>`;
}
/* ==== [FIN ANCRE] ==== */
