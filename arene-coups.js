"use strict";
/* CAGE LEGACY — arene-coups.js
   ============================================================================
   LOT 11 — LES COUPS, LA VOIX ET LES COINS (brief du 06/10/2026, planches « Règles 3 »
   et « Le combat animé »). Ce fichier ne décide RIEN du combat : il lit une session
   d'arène (arene-etat.js, bâtie sur un résultat du moteur) et en tire, une fois, trois
   listes datées en secondes d'affichage :
     - session.coups : les échanges — qui frappe, quel coup (le NOM que le moteur donne
       déjà, la clé de res.stats.X.byType), touché / bloqué / esquivé, et les gestes
       (amenée au sol, il se relève) ;
     - session.voix : le commentaire (niveau 0 voix posée, 1 voix qui monte, 2 cri) ;
     - session.coins : ce que crie chaque coin.
   Les échanges sont répartis sur le temps debout, au clinch et au sol à proportion de
   ce que le moteur a compté (distAtt/clinchAtt/groundAtt, leur part touchée, byType) ;
   un tirage LOCAL à graine (areneAlea, jamais Math.random) les place. La graine ne
   dépend que du combat : regarder, passer, revoir ou changer de caméra donne la même
   trace. Le temps n'entre jamais dans le moteur : rien ici ne touche à res.
   Textes : mgmt-combat-data.js (tous `relu:false`).
   ============================================================================ */

/* ==== [ANCRE: ARENE_LOT11_COUPS] — Lot 11 : coups nommés, voix, coins. ==== */
/** Secondes d'affichage entre deux échanges, en moyenne (la planche en montre un toutes les ~1,7 s). */
const ARENE_COUPS_PAS=1.9;
/** Écart minimal entre deux répliques du commentaire / de chaque coin. */
const ARENE_VOIX_ECART=2.4;
const ARENE_COIN_ECART=3.0;
/** Durée d'affichage d'une réplique (aussi lue par le dessin). */
const ARENE_VOIX_DUREE={0:2.3,1:2.1,2:3.2};
const ARENE_COIN_DUREE=1.9;

function areneCoupsSeed(S){
  let h=2166136261>>>0;
  const mange=s=>{ s=String(s); for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619)>>>0; } };
  mange(S.noms.a.complet); mange(S.noms.b.complet); mange(Math.round(S.finT*100)); mange(S.vainqueur); mange(S.methode);
  return h>>>0;
}
/** Tire une clé d'un objet de poids (≥ 0) ; null si tous nuls. */
function areneCoupsTirer(rng,poids,cles){
  let tot=0; for(const k of cles) tot+=Math.max(0,poids[k]||0);
  if(tot<=0) return null;
  let x=rng()*tot;
  for(const k of cles){ x-=Math.max(0,poids[k]||0); if(x<=0) return k; }
  return cles[cles.length-1];
}
/** Majuscule de tête : « low kick » → « Low kick » (pour une phrase du commentaire). */
function areneCoupsPhrase(libelle){
  const s=String(libelle||'').toLowerCase();
  return s.charAt(0).toUpperCase()+s.slice(1);
}
/** Remplit un modèle : {X} {Y} {N} {COUP} {QUEL}. Le nom passe en capitales à partir du niveau 1. */
function areneCoupsModele(t,jetons,haut){
  return String(t).replace(/\{([A-Z]+)\}/g,(m,k)=>{
    const v=jetons[k]; if(v===undefined) return m;
    return (haut&&(k==='X'||k==='Y'))?String(v).toUpperCase():String(v);
  });
}
function areneCoupsPhaseDe(sg){ return sg.phase==='debout'||sg.phase==='clinch'||sg.phase==='sol'?sg.phase:null; }

/** Construit les trois listes sur la session (idempotent : un second appel ne refait rien).
 *  @param {object} S session d'arène (areneConstruire). @returns {object} S */
function areneCoupsConstruire(S){
  if(!S||S.coups) return S;
  const rng=areneAlea(areneCoupsSeed(S));
  const stats=(S.res&&S.res.stats)||{}, zero={};
  const sa=stats.A||zero, sb=stats.B||zero;
  const cote=c=>c==='A'?sa:sb;
  const court=c=>S.noms[c==='A'?'a':'b'].court;
  const autre=c=>c==='A'?'B':'A';
  const coups=[], voixC=[], coinsC=[];

  /* --- le choix d'un coup, d'après ce que le combattant a réellement lancé --- */
  const typeDe=(c,phase,filtre)=>{
    const by=cote(c).byType||{};
    const permis=(filtre||MGMT_COUP_PHASES[phase]||MGMT_COUP_PHASES.debout);
    return areneCoupsTirer(rng,by,permis)||MGMT_COUP_REPLI[phase]||'jab';
  };
  const ratio=(c,phase)=>{
    const s=cote(c);
    const att=phase==='clinch'?s.clinchAtt:(phase==='sol'?s.groundAtt:s.distAtt);
    const ok=phase==='clinch'?s.clinchStrikes:(phase==='sol'?s.groundStrikes:s.distStrikes);
    if(!(att>0)) return 0.45;
    return Math.max(0.12,Math.min(0.9,(ok||0)/att));
  };
  const pousse=(t,by,type,r,big,k)=>{
    coups.push({t:t,by:by,type:type||null,k:k||MGMT_COUP_NOMS[type]||'',r:r,
      p:big?1:(MGMT_COUP_PUISSANCE[type]||0.3),big:!!big});
  };

  /* --- les échanges --- */
  const segs=S.segs;
  for(let i=0;i<segs.length;i++){
    const sg=segs[i], ph=areneCoupsPhaseDe(sg);
    const prec=i>0?segs[i-1]:null;
    /* gestes de changement de phase */
    if(prec&&!sg.nouvelleRonde){
      if(sg.phase==='sol'&&prec.phase!=='sol') pousse(sg.t0+0.05,sg.top==='B'?'B':'A',null,3,false,MGMT_GESTES.amenee);
      else if(sg.phase==='sol'&&prec.phase==='sol'&&sg.top&&prec.top&&sg.top!==prec.top) pousse(sg.t0+0.05,sg.top,null,3,false,MGMT_GESTES.retourne);
      else if(sg.phase==='debout'&&prec.phase==='sol') pousse(sg.t0+0.05,autre(prec.top==='B'?'B':'A'),null,3,false,MGMT_GESTES.releve);
    }
    /* le coup du moteur (lourd, décisif) : ancré sur son moment */
    if(sg.act&&(sg.act.type==='punch'||sg.act.type==='kick')){
      const c=sg.act.de==='B'?'B':'A';
      const filtre=sg.act.type==='kick'?['headKick','bodyKick','legKick','spinning']:(ph==='clinch'?['elbow','knee','hook']:(ph==='sol'?['groundPunch','elbow']:['cross','hook','uppercut','jab']));
      const type=typeDe(c,ph||'debout',filtre);
      const tx=sg.beat?String(sg.beat.text||''):'';
      const gros=!!sg.act.fin||/tapis|lourd|touche fort|place un coup|accuse/i.test(tx);
      pousse(sg.act.t0+0.05,c,type,1,gros);
    }
    if(!ph) continue;
    /* les échanges courants, à proportion de ce que le moteur a compté */
    const debut=sg.t0+0.9, fin=Math.min(sg.t1,S.finT-ARENE_FIN_S)-0.3;
    if(fin-debut<0.8) continue;
    const vitesse=ph==='sol'?1.5:(ph==='clinch'?1.15:1);
    let t=debut+rng()*0.9;
    while(t<fin){
      let wA,wB;
      if(ph==='sol'){ wA=sg.top==='B'?1:7; wB=sg.top==='B'?7:1; }
      else{
        const att=c=>Math.max(1,ph==='clinch'?cote(c).clinchAtt:cote(c).distAtt)||1;
        wA=att('A'); wB=att('B');
        if(sg.beat&&sg.beat.by==='me') wA*=1.6; else if(sg.beat&&sg.beat.by==='op') wB*=1.6;
      }
      const c=rng()*(wA+wB)<wA?'A':'B';
      const type=typeDe(c,ph);
      const u=rng();
      const r=u<ratio(c,ph)?1:(rng()<0.5?2:0);
      pousse(t,c,type,r,false);
      t+=ARENE_COUPS_PAS*vitesse*(0.55+rng()*0.9);
    }
  }
  coups.sort((x,y)=>x.t-y.t);

  /* --- le commentaire --- */
  const dire=(t,famille,jetons)=>{
    const liste=MGMT_COMMENTAIRE[famille]; if(!Array.isArray(liste)||!liste.length) return;
    const m=liste[Math.floor(rng()*liste.length)];
    const j=Object.assign({},jetons);
    const l=m.l;
    voixC.push({t:t,l:l,a:areneCoupsModele(m.t,j,l>=1),b:m.u?areneCoupsModele(m.u,j,true):null});
  };
  const dit=(t,l,texte)=>voixC.push({t:t,l:l,a:texte,b:null});
  voixC.push({t:0.3,l:0,a:'',b:null,salle:true});
  const dernierR=segs.length?segs[segs.length-1].r:1;
  for(let r=1;r<=dernierR;r++){
    const tR=(r-1)*S.roundLen, fR=r*S.roundLen;
    const fini=S.finT<fR-0.5;
    if(r===1) dit(2.0,1,MGMT_COMMENTAIRE.debut.t[Math.floor(rng()*MGMT_COMMENTAIRE.debut.t.length)]);
    else dit(tR+1.2,1,areneCoupsModele(MGMT_COMMENTAIRE.round.t[0],{N:r},true));
    if(!fini){
      if(fR-tR>12) dit(fR-7.5,0,MGMT_COMMENTAIRE.minute[0].t);
      if(fR-tR>12) dit(fR-3.2,1,MGMT_COMMENTAIRE.dix[0].t);
      dit(fR-0.1,2,MGMT_COMMENTAIRE.finRound[0].t);
      if(r===dernierR&&(S.methode.indexOf('Décision')===0||S.methode.indexOf('Nul')===0)) dit(fR+1.8,0,MGMT_COMMENTAIRE.juges[Math.floor(rng()*MGMT_COMMENTAIRE.juges.length)].t);
    }
  }
  for(let i=0;i<segs.length;i++){
    const sg=segs[i], prec=i>0?segs[i-1]:null;
    if(sg.nouvelleRonde||!prec) continue;
    const tp=sg.top==='B'?'B':'A', dom=sg.beat&&sg.beat.by==='op'?'B':'A';
    if(sg.phase==='clinch'&&prec.phase!=='clinch'){
      if(sg.posClinch==='cage') dire(sg.t0+0.3,'clinchCage',{X:court(dom),Y:court(autre(dom))});
      else dire(sg.t0+0.3,'clinchCentre',{X:court(dom),Y:court(autre(dom))});
    }else if(sg.phase==='sol'&&prec.phase!=='sol'){
      dire(sg.t0+0.3,'amene',{X:court(tp),Y:court(autre(tp))});
    }else if(sg.phase==='debout'&&prec.phase==='sol'){
      dire(sg.t0+0.3,'releve',{X:court(autre(prec.top==='B'?'B':'A')),Y:court(prec.top==='B'?'B':'A')});
    }else if(sg.phase==='debout'&&prec.phase==='clinch'){
      dire(sg.t0+0.3,'separe',{});
    }
    if(sg.phase==='sol'&&sg.t1-sg.t0>5) dire(sg.t0+3.6,'sol',{X:court(tp),Y:court(autre(tp))});
    if(sg.phase==='sol'&&sg.beat&&sg.beat.sub) dire(sg.t0+0.5,'sub',{X:court(tp),Y:court(autre(tp))});
    if(sg.phase==='debout') for(let u=sg.t0+4+rng()*2;u<sg.t1-1.5;u+=6+rng()*3){
      const x=rng()<0.5?'A':'B';
      dire(u,rng()<0.35?'coupe':'tourne',{X:court(x),Y:court(autre(x))});
    }
  }
  for(const w of S.tapis){
    const cib=w.cible==='B'?'B':'A';
    dire(w.t0+0.3,'tapis',{X:court(autre(cib)),Y:court(cib)});
  }
  for(const e of coups){
    if(e.r===3||e.big) { if(e.big&&e.by) dire(e.t+0.35,'touche',{X:court(e.by),Y:court(autre(e.by))}); continue; }
    const u=rng();
    if(e.r===1&&u<0.34) dire(e.t+0.2,'coup',{X:court(e.by),Y:court(autre(e.by)),COUP:areneCoupsPhrase(e.k)});
    else if(e.r===2&&u<0.5) dire(e.t+0.2,'bloque',{X:court(e.by),Y:court(autre(e.by))});
    else if(e.r===0&&u<0.5) dire(e.t+0.2,'esquive',{X:court(e.by),Y:court(autre(e.by))});
  }
  const bFin=segs.length?segs[segs.length-1]:null;
  if(bFin&&bFin.phase==='fini'){
    const g=S.vainqueur==='B'?'B':'A';
    const fam=S.methode.indexOf('KO')===0?'finKO':(S.methode.indexOf('Soumission')===0?'finSub':(S.methode.indexOf('Décision')===0||S.methode.indexOf('Nul')===0?null:'finStop'));
    if(fam&&S.vainqueur!=='D') dire(bFin.t0+0.1,fam,{X:court(g),Y:court(autre(g))});
  }
  /* tri, écarts : une réplique plus forte prend la place d'une plus faible qui la gêne */
  voixC.sort((x,y)=>x.t-y.t||y.l-x.l);
  const voix=[];
  for(const v of voixC){
    const der=voix[voix.length-1];
    const duree=der&&der.salle?1.6:(der?(ARENE_VOIX_DUREE[der.l]||2):0);
    if(der&&v.t-der.t<duree*0.9+0.2){
      if(v.l>der.l&&!der.salle) voix[voix.length-1]=v;
      continue;
    }
    voix.push(v);
  }

  /* --- les coins --- */
  const crie=(t,c,famille)=>{
    const liste=MGMT_COINS[famille]; if(!liste) return;
    coinsC.push({t:t,w:c,a:liste[Math.floor(rng()*liste.length)]});
  };
  for(let r=1;r<=dernierR;r++){
    const tR=(r-1)*S.roundLen;
    crie(tR+(r===1?4.2:3.2),'A','debut'); crie(tR+(r===1?5.2:4.4),'B',rng()<0.5?'avance':'debut');
  }
  for(let i=0;i<segs.length;i++){
    const sg=segs[i], prec=i>0?segs[i-1]:null;
    if(sg.nouvelleRonde||!prec) continue;
    const dom=sg.beat&&sg.beat.by==='op'?'B':'A', tp=sg.top==='B'?'B':'A';
    if(sg.phase==='clinch'&&prec.phase!=='clinch'&&sg.posClinch==='cage'){ crie(sg.t0+1.4,dom,'cageDom'); crie(sg.t0+2.6,autre(dom),'cagePris'); }
    if(sg.phase==='sol'&&prec.phase!=='sol'){ crie(sg.t0+2.0,tp,'solDessus'); crie(sg.t0+3.4,autre(tp),'solDessous'); }
  }
  for(const e of coups){
    if(e.big&&e.r===1){ crie(e.t+0.5,e.by,'encore'); crie(e.t+1.1,autre(e.by),'recule'); }
  }
  for(let r=1;r<=dernierR;r++){
    const fR=r*S.roundLen;
    if(S.finT>=fR-0.5&&fR-(r-1)*S.roundLen>12) crie(fR-3.0,(r%2)?'A':'B','dix');
  }
  coinsC.sort((x,y)=>x.t-y.t);
  const coins=[], dernier={A:-99,B:-99};
  for(const c of coinsC){
    if(c.t<0||c.t>S.finT-0.5) continue;
    if(c.t-dernier[c.w]<ARENE_COIN_ECART) continue;
    dernier[c.w]=c.t; coins.push(c);
  }
  S.coups=coups; S.voix=voix; S.coins=coins;
  return S;
}
/** La réplique du commentaire en cours à l'instant t, ou null. @returns {object|null} */
function areneVoixA(S,t){
  const liste=S&&S.voix||[]; let cur=null;
  for(let i=0;i<liste.length;i++){ if(t>=liste[i].t) cur=liste[i]; else break; }
  return cur;
}
/** Les cris des coins visibles à l'instant t. @returns {Array} */
function areneCoinsA(S,t){
  const out=[], liste=S&&S.coins||[];
  for(let i=0;i<liste.length;i++){ const d=t-liste[i].t; if(d>=0&&d<ARENE_COIN_DUREE) out.push({c:liste[i],d:d}); }
  return out;
}
/* ==== [FIN ANCRE] ==== */
