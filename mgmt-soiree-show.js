"use strict";
/* ==== [ANCRE: MGMT_BRIEF_LOT11_SOIREE] — Brief du 06/10/2026, lot 11 : le déroulé de la soirée (planches « Soirée 1 »
   à « Soirée 5 » et « Règles 3 »). Ce fichier est la logique, sans DOM :
   - le PROGRAMME : les combats de la soirée dans l'ordre de passage du lot 7 (préliminaires, puis la carte principale en
     remontant, le principal en dernier), chacun avec son nom de planche (PRÉLIM 1, COMBAT 5, CO-PRINCIPAL, COMBAT
     PRINCIPAL), ses deux côtés lus sur la trace du combat ;
   - la SALLE : la part remplie au combat principal est celle calculée au lot 8 (`taux`), plus basse au premier combat ;
   - l'AVANT-COMBAT : pour chaque combattant ce que le joueur a VU (rejeu de ses combats passés), ce qu'il ne sait pas, puis,
     zone par zone (au centre, contre la cage, au sol), comment ça peut se passer. JAMAIS qui gagne. Il ne lit que la
     connaissance du lot 6 (combats vus, rejoués depuis leur trace) et des chiffres publics (bilan d'AVANT le combat,
     classement d'avant la soirée, allonge). Il ne lit ni le niveau stocké (lot 2), ni les attributs, ni rien de la
     soirée en cours : la soirée est calculée d'un bloc (m.lastEvent), l'avant-combat d'un combat ne regarde que ce qui
     l'a précédé dans m.hist.
   Aucun état écrit : tout se dérive de m.lastEvent, m.hist et m.facts. Les textes sont des textes d'auteur marqués
   `relu:false`. ==== */

/** Les mots de la soirée. relu:false */
const MGMT_SOIREE_TEXTES={
  relu:false,
  prelim:'PRÉLIM {n}', combat:'COMBAT {n}', coprincipal:'CO-PRINCIPAL', principal:'COMBAT PRINCIPAL',
  court:{prelim:'PRÉLIM {n}', combat:'COMBAT {n}', coprincipal:'CO-PRINCIPAL', principal:'PRINCIPAL'},
  mois:'{nom} attend depuis {n} mois', battu:'{perdant} battu par {gagnant}', nul:'{a} et {b} se sont quittés sur un nul',
  ceinture:'Pour la ceinture', sansCeinture:'Ceinture pas en jeu', public:'Réclamé par le public', defi:'Défi public',
  rounds:{3:'trois',5:'cinq'},
};
/** Ce qu'on peut lire d'un combattant déjà vu. relu:false */
const MGMT_AVANT_TEXTES={
  relu:false,
  profils:{distance:'CONTRE À DISTANCE',sort:'FRAPPE ET SORT',avance:'AVANCE SANS ARRÊT',sol:'AMÈNE AU SOL',clinch:'ÉTOUFFE AU CLINCH',complet:'SANS SIGNATURE',inconnu:'PAS ENCORE VU'},
  lignes:{
    initiative:'Prend l’initiative des échanges', attend:'Laisse l’autre mener, attend l’erreur',
    loinJuste:'Frappe de loin et touche juste', loinVide:'Frappe de loin, beaucoup dans le vide',
    corps:'Cherche le corps à corps', amenee:'Cherche l’amenée au sol', controleSol:'Contrôle bien au sol',
    defendAmenee:'Défend bien les amenées', subitSol:'Perd ses moyens au sol', soumission:'Cherche la soumission',
    vacille:'Vacille quand on le touche', poidsClinch:'Impose son poids au clinch', subitCage:'Perd ses moyens contre la cage',
    rien:'Rien de marquant dans ses combats vus',
  },
  inconnus:{sol:'Au sol : jamais vu',cage:'Contre la cage : jamais vu',rounds:'Sur {r} rounds : jamais vu',style:'Son style : inconnu',faille:'Sa faille : inconnue'},
  zones:{centre:'AU CENTRE',cage:'CONTRE LA CAGE',sol:'AU SOL'},
  zone:{
    seul:'{x} y est à l’aise.', seulPas:'{x} y perd ses moyens.', seulRien:'{x} n’y a rien montré de marquant.',
    duo:'{x} y a l’avantage. {y} y perd ses moyens.', egal:'{x} et {y} s’y valent, d’après ce que tu as vu.',
    allonge:'{x} a {n} cm d’allonge de plus.',
    inconnu:'Personne ne sait. {x} n’y est jamais allé.', inconnu2:'Personne ne sait. Ni {x} ni {y} n’y sont allés.', autre:'{x} n’y est jamais allé.',
  },
  entete:{impose:'{x} impose son combat', imposeAutre:'{x} impose le sien', source:'D’après ce que tu as vu de leurs combats.', rien:'On ne sait pas encore ce que chacun impose.'},
  dernier:{aucun:'Aucun combat vu sous ton affiche', ligne:'{famille}, {round}, contre {adv}'},
};
const MGMT_OBS_MAX=8;
const MGMT_OBS_MEMO=new WeakMap();
const MGMT_OBS_ZERO=()=>({distAtt:0,distStrikes:0,clinchAtt:0,clinchStrikes:0,groundAtt:0,groundStrikes:0,sigAtt:0,sig:0,td:0,tdAtt:0,tdDef:0,
  subAtt:0,ctrlSec:0,clinchCtrlSec:0,groundCtrlSec:0,wobbled:0,kd:0});

/* ---- Le programme --------------------------------------------------------------------------------------------- */

/** Le nom de planche d'un combat de la soirée. Pur. @returns {string} */
function mgmtSoireeNom(slot,rangPrelim,rangMain,nMain){
  const T=MGMT_SOIREE_TEXTES;
  if(slot==='prelim') return T.prelim.replace('{n}',rangPrelim);
  if(rangMain===nMain-1) return T.principal;
  if(rangMain===nMain-2&&nMain>=2) return T.coprincipal;
  return T.combat.replace('{n}',nMain-rangMain);
}
function mgmtSoireeNomCourt(nom){
  return nom===MGMT_SOIREE_TEXTES.principal?MGMT_SOIREE_TEXTES.court.principal:nom;
}
/** Le programme de la soirée qui vient d'être calculée (m.lastEvent) : un élément par combat, dans l'ordre de passage.
 *  @returns {Array<{i:number,h:number,slot:string,nom:string,court:string,etiquette:string,div:string,titre:boolean,rounds:number,
 *    a:object,b:object,fait:object,trace:object|null}>} */
function mgmtSoireeProgramme(m){
  const e=m&&m.lastEvent;
  if(!e||!Array.isArray(e.fights)||!Array.isArray(m.hist)) return [];
  const idx=[]; m.hist.forEach((t,i)=>{ if(t&&t.c===e.cycle) idx.push(i); });
  let rp=0, rm=0;
  const nMain=e.fights.filter((x,i)=>{ const t=m.hist[idx[i]]; return t&&t.slot==='main'; }).length;
  return e.fights.map((x,i)=>{
    const h=idx[i], t=m.hist[h];
    const ok=t&&t.a&&t.b&&t.a.id===x.a&&t.b.id===x.b;
    const slot=ok&&t.slot==='main'?'main':'prelim';
    const nom=slot==='prelim'?mgmtSoireeNom('prelim',++rp,0,0):mgmtSoireeNom('main',0,rm++,nMain);
    const side=s=>s?{id:s.id,name:s.name,first:s.first||'',last:s.last||s.name}:{id:'',name:'?',first:'',last:'?'};
    return {i,h:ok?h:-1,slot,nom,court:mgmtSoireeNomCourt(nom),etiquette:nom,div:ok?t.a.div:'',titre:!!x.title,rounds:Number.isSafeInteger(x.rounds)?x.rounds:3,
      a:side(ok?t.a:null),b:side(ok?t.b:null),fait:x,trace:ok?t:null};
  });
}

/** Où en est la soirée quand `index` combats sont passés. @returns {'ouverture'|'entre'|'principal'|'fin'} */
function mgmtSoireeMoment(m,index){
  const n=m&&m.lastEvent&&Array.isArray(m.lastEvent.fights)?m.lastEvent.fights.length:0;
  if(index>=n) return 'fin';
  if(index<=0) return 'ouverture';
  return index===n-1?'principal':'entre';
}

/* ---- La salle -------------------------------------------------------------------------------------------------- */

/** La salle d'un combat de la soirée : la part remplie au plus haut de la soirée (`taux`, calculée au lot 8 sur la
 *  carte d'avant la soirée), la progression dans la soirée (0 au premier combat, 1 au principal) et la part remplie à ce
 *  moment (un bon tiers du pic au départ, le pic au principal). `taux` nul : soirée d'avant l'agenda, salle neutre.
 *  @returns {{taux:number|null,prog:number,part:number,nom:string,capacite:number}} */
function mgmtSoireeSalle(m,i){
  const e=m&&m.lastEvent, n=e&&Array.isArray(e.fights)?e.fights.length:0;
  const fin=e&&e.finance?e.finance:{};
  const taux=Number.isFinite(fin.taux)?Math.max(0,Math.min(1,fin.taux)):null;
  const prog=n>1?Math.max(0,Math.min(1,i/(n-1))):1;
  const base=taux===null?0.65:taux;
  return {taux:taux,prog:prog,part:base*(0.35+0.65*prog),nom:typeof fin.salle==='string'?fin.salle:'',capacite:Number.isFinite(fin.capacite)?fin.capacite:0};
}
/** La date de la soirée qui vient d'être jouée : « 12 AVRIL », ou '' avant l'agenda. */
function mgmtSoireeDateTexte(m){
  const n=m&&Number.isSafeInteger(m.eventsPlayed)?m.eventsPlayed:0;
  const j=typeof mgmtSoireeJour==='function'?mgmtSoireeJour(m,n):null;
  if(!Number.isFinite(j)||n<=0) return '';
  const d=mgmtJourDate(j);
  return d.jour+' '+d.mois;
}

/* ---- Ce que le joueur a vu ------------------------------------------------------------------------------------- */

/** Le résumé d'un combat passé, rejoué depuis sa trace (le même combat, garde-fou du rejeu) : ce que l'avant-combat peut
 *  en lire, jamais le résultat brut. Mémorisé par trace. @returns {object|null} */
function mgmtObsResume(t){
  if(!t||typeof t!=='object') return null;
  if(MGMT_OBS_MEMO.has(t)) return MGMT_OBS_MEMO.get(t);
  let out=null;
  const res=mgmtReplayFight(t);
  if(res&&areneVerdictFidele(t,res)){
    const pick=s=>{ const o=MGMT_OBS_ZERO(), src=s||{}; for(const k of Object.keys(o)) o[k]=Number(src[k])||0; return o; };
    const log=Array.isArray(res.log)?res.log:[];
    out={A:pick(res.stats&&res.stats.A),B:pick(res.stats&&res.stats.B),
      cage:log.some(l=>l&&l.phase==='clinch'&&l.pos==='cage'),
      clinch:log.some(l=>l&&l.phase==='clinch'),
      sol:log.some(l=>l&&l.phase==='sol')};
  }
  MGMT_OBS_MEMO.set(t,out);
  return out;
}
/** Les combats d'un combattant AVANT l'index h de m.hist, du plus récent au plus ancien. @returns {number[]} */
function mgmtObsAvant(m,id,h){
  const out=[];
  for(let i=Math.min(h,m.hist.length)-1;i>=0;i--){
    const t=m.hist[i];
    if(t&&t.a&&t.b&&(t.a.id===id||t.b.id===id)) out.push(i);
  }
  return out;
}
function mgmtObsSomme(a,b){ for(const k of Object.keys(b)) a[k]=(a[k]||0)+b[k]; }

/** Ce que le joueur sait d'un combattant avant le combat d'index h : combats vus, ce qu'il a vu, ce qu'il ne sait pas,
 *  chaque zone vue ou non. Ne lit que m.hist avant h. @returns {object} */
function mgmtObservation(m,id,h,roundsCombat){
  const passes=mgmtObsAvant(m,id,h), vus=passes.length;
  const f=MGMT_OBS_ZERO(), o=MGMT_OBS_ZERO();
  let n=0, cage=false, sol=false, clinch=false, maxRounds=0;
  for(const i of passes){ const t=m.hist[i]; if(Number.isSafeInteger(t.rounds)) maxRounds=Math.max(maxRounds,t.rounds); }
  for(const i of passes.slice(0,MGMT_OBS_MAX)){
    const t=m.hist[i], r=mgmtObsResume(t); if(!r) continue;
    const cote=t.a.id===id?'A':'B';
    mgmtObsSomme(f,r[cote]); mgmtObsSomme(o,r[cote==='A'?'B':'A']);
    cage=cage||r.cage; sol=sol||r.sol; clinch=clinch||r.clinch; n++;
  }
  const att=f.distAtt+f.clinchAtt+f.groundAtt;
  const sd=att>0?f.distAtt/att:0, sc=att>0?f.clinchAtt/att:0;
  const land=f.distAtt>0?f.distStrikes/f.distAtt:0;
  /* Le profil : le trait qui ressort de ses combats vus (rien sans combat vu). */
  const T=MGMT_AVANT_TEXTES;
  let profil=T.profils.inconnu;
  if(n>0){
    const scores=[
      [f.tdAtt/Math.max(1,n)/3,T.profils.sol],
      [sc>=0.2?sc*2:0,T.profils.clinch],
      [(sd>=0.6&&land>=0.5&&f.sigAtt<=o.sigAtt*1.1)?0.8:0,T.profils.distance],
      [(sd>=0.6)?0.6:0,T.profils.sort],
      [(f.sigAtt>=o.sigAtt*1.2)?0.7+sc:0,T.profils.avance],
    ];
    let best=[0.1,T.profils.complet];
    for(const s of scores) if(s[0]>best[0]) best=s;
    profil=best[1];
  }
  /* Ce qu'il a fait, en trois lignes au plus. */
  const L=T.lignes, lignes=[];
  if(n>0){
    const cand=[];
    if(f.sigAtt>=o.sigAtt*1.25) cand.push(L.initiative); else if(f.sigAtt<o.sigAtt*0.8) cand.push(L.attend);
    if(sd>=0.6) cand.push(land>=0.5?L.loinJuste:L.loinVide);
    if(sc>=0.25) cand.push(L.corps);
    if(f.tdAtt>=2) cand.push(L.amenee);
    if(f.td>=1&&f.groundCtrlSec>=30) cand.push(L.controleSol);
    if(o.tdAtt>=2&&f.tdDef/Math.max(1,o.tdAtt)>=0.6) cand.push(L.defendAmenee);
    if(o.td>=1&&o.groundCtrlSec>=30) cand.push(L.subitSol);
    if(f.subAtt>=2) cand.push(L.soumission);
    if(f.wobbled>=2) cand.push(L.vacille);
    if(clinch&&f.clinchCtrlSec>o.clinchCtrlSec*1.3) cand.push(L.poidsClinch);
    else if(cage&&clinch&&f.clinchCtrlSec<o.clinchCtrlSec*0.7) cand.push(L.subitCage);
    for(const c of cand){ if(lignes.length<3&&!lignes.includes(c)) lignes.push(c); }
    if(!lignes.length) lignes.push(L.rien);
  }
  /* Ce qu'il ne sait pas : une zone jamais vue, un nombre de rounds jamais vu. */
  const I=T.inconnus, inconnus=[];
  if(n===0){ inconnus.push(I.style,I.faille); }
  else{
    if(!sol) inconnus.push(I.sol);
    if(!cage) inconnus.push(I.cage);
    if(roundsCombat>maxRounds&&maxRounds>0) inconnus.push(I.rounds.replace('{r}',MGMT_SOIREE_TEXTES.rounds[roundsCombat]||String(roundsCombat)));
  }
  /* La force dans chaque zone, de −1 à 1, seulement si la zone a été vue. */
  const diff=(a,b)=>(a-b)/(a+b+1);
  const zones={
    centre:{vu:n>0&&f.distAtt+o.distAtt>0,force:diff(f.distStrikes,o.distStrikes)},
    cage:{vu:cage&&clinch,force:diff(f.clinchCtrlSec+f.clinchStrikes*3,o.clinchCtrlSec+o.clinchStrikes*3)},
    sol:{vu:sol,force:diff(f.groundCtrlSec+f.td*20+f.groundStrikes*3,o.groundCtrlSec+o.td*20+o.groundStrikes*3)},
  };
  return {vus,n,profil,lignes:lignes,inconnus:inconnus.slice(0,3),zones};
}

/* ---- Le côté d'un combattant dans l'avant-combat -------------------------------------------------------------------- */

function mgmtRoundOrdinal(r){ return r===1?'1er round':r+'e round'; }
function mgmtAllongeTexte(f){
  const p=mgmtCombatProfile(f).phys||{};
  return Number.isFinite(p.reach)?(p.reach/100).toFixed(2).replace('.',',')+' m':'?';
}
function mgmtAllongeCm(f){ const p=mgmtCombatProfile(f).phys||{}; return Number.isFinite(p.reach)?p.reach:0; }
/** Le rang d'avant la soirée : « C » pour le champion, N°k sinon, null si hors classement. Jamais le rang d'après. */
function mgmtRangAvant(m,id,div,cycle,h){
  let champ=null;
  for(const fact of m.facts||[]){
    if(!fact||fact.div!==div) continue;
    if(fact.k==='title_initial') champ=fact.a;
    else if(fact.k==='title_fight'&&Number.isSafeInteger(fact.fight)&&fact.fight<h){
      const t=m.hist[fact.fight];
      if(!t||!t.a||!t.b) continue;
      const g=t.winner==='A'?t.a.id:(t.winner==='B'?t.b.id:null);
      if(g) champ=g;
    }
  }
  if(champ===id) return 'C';
  const l=mgmtDivisionRanking(m,div,'organization',cycle).filter(x=>x.id!==champ);
  const k=l.findIndex(x=>x.id===id);
  return k>=0?'N°'+(k+1):null;
}
/** Le dernier combat d'un combattant avant h : {issue:'v'|'d'|'n',texte} ou null. */
function mgmtDernierAvant(m,id,h){
  const i=mgmtObsAvant(m,id,h)[0];
  if(i===undefined) return null;
  const t=m.hist[i], cote=t.a.id===id?'A':'B', adv=cote==='A'?t.b:t.a;
  const issue=t.winner==='D'?'n':(t.winner===cote?'v':'d');
  const fam=MGMT_FAMILY_LABELS[t.family]||'';
  const rnd=(t.family==='dec'||t.family==='draw')?'après '+t.rounds+' rounds':mgmtRoundOrdinal(t.round);
  return {issue,texte:MGMT_AVANT_TEXTES.dernier.ligne.replace('{famille}',fam).replace('{round}',rnd).replace('{adv}',adv.last||adv.name)};
}
/** Les trois derniers combats d'un combattant avant h, du plus ancien au plus récent : ['v','d','n']. */
function mgmtFormeAvant(m,id,h){
  return mgmtObsAvant(m,id,h).slice(0,3).reverse().map(i=>{
    const t=m.hist[i], cote=t.a.id===id?'A':'B';
    return t.winner==='D'?'n':(t.winner===cote?'v':'d');
  });
}
/** Le bilan d'AVANT le combat, lu sur la trace (jamais sur le bilan d'aujourd'hui, qui compte déjà ce soir). */
function mgmtBilanAvant(side){ return side.W+'-'+side.L+'-'+(side.D||0); }

/** Le côté d'un combattant : tout ce que l'écran peut montrer de lui avant le combat. */
function mgmtAvantCote(m,p,cote){
  const t=p.trace, s=cote==='A'?t.a:t.b, ligne=mgmtTraceLine(s);
  const ob=mgmtObservation(m,s.id,p.h,p.rounds);
  const style=ob.n>0?mgmtCommentIlCombat(ligne):null;
  return {id:s.id,name:s.name,first:s.first||'',last:s.last||s.name,
    vus:ob.vus,profil:ob.profil,lignes:ob.lignes,inconnus:ob.inconnus,zones:ob.zones,
    style:style?style.style.toUpperCase():'',garde:style?style.garde:'',
    rang:mgmtRangAvant(m,s.id,s.div,t.c,p.h),palmares:mgmtBilanAvant(s),allonge:mgmtAllongeTexte(ligne),reach:mgmtAllongeCm(ligne),
    forme:mgmtFormeAvant(m,s.id,p.h),dernier:mgmtDernierAvant(m,s.id,p.h),
    attente:Number.isSafeInteger(s.lastCycle)&&s.lastCycle>=0?Math.max(0,Math.round((t.c-s.lastCycle)*MGMT_VOIX_MOIS_PAR_CYCLE)):0};
}

/** Les enjeux d'un combat : trois au plus, dits en une ligne chacun. Lus avant la soirée. */
function mgmtSoireeEnjeux(m,p,A,B){
  const T=MGMT_SOIREE_TEXTES, out=[], t=p.trace;
  if(p.titre) out.push(T.ceinture);
  else if(A.rang==='C'||B.rang==='C') out.push(T.sansCeinture);   /* corrections du 08/10, 2.2 : un champion qui combat sans sa ceinture, on le dit */
  for(const c of [A,B]) if(c.attente>=3) out.push(T.mois.replace('{nom}',c.last).replace('{n}',c.attente));
  /* La dernière rencontre, avant ce soir. */
  for(let i=p.h-1;i>=0;i--){
    const x=m.hist[i]; if(!x||!x.a||!x.b) continue;
    const mm=(x.a.id===t.a.id&&x.b.id===t.b.id)||(x.a.id===t.b.id&&x.b.id===t.a.id); if(!mm) continue;
    if(x.winner==='D'){ out.push(T.nul.replace('{a}',A.last).replace('{b}',B.last)); break; }
    const g=x.winner==='A'?x.a:x.b, pl=x.winner==='A'?x.b:x.a;
    out.push(T.battu.replace('{perdant}',pl.last||pl.name).replace('{gagnant}',g.last||g.name)); break;
  }
  if(Array.isArray(m.fil)){
    const demande=m.fil.some(x=>x&&(x.k==='defi'||x.k==='public')&&Number.isSafeInteger(x.c)&&x.c<=t.c&&((x.a===t.a.id&&x.b===t.b.id)||(x.a===t.b.id&&x.b===t.a.id)));
    if(demande) out.push(T.public);
  }
  return out.slice(0,3);
}

/** L'avant-combat complet d'un combat de la soirée. @returns {object|null} */
function mgmtAvantCombat(m,i){
  const prog=mgmtSoireeProgramme(m), p=prog[i];
  if(!p||!p.trace||p.h<0) return null;
  const A=mgmtAvantCote(m,p,'A'), B=mgmtAvantCote(m,p,'B');
  const Z=MGMT_AVANT_TEXTES, nA=A.last, nB=B.last;
  /* Zone par zone : jamais un vainqueur, seulement où chacun est à l'aise d'après ce qui a été vu. */
  const zones=['centre','cage','sol'].map(id=>{
    const za=A.zones[id], zb=B.zones[id], titre=Z.zones[id];
    let texte, inconnu=false, avantage=null;
    if(!za.vu&&!zb.vu){ texte=Z.zone.inconnu2.replace('{x}',nA).replace('{y}',nB); inconnu=true; }
    else if(za.vu&&zb.vu){
      const d=za.force-zb.force;
      if(Math.abs(d)<0.15) texte=Z.zone.egal.replace('{x}',nA).replace('{y}',nB);
      else{ const x=d>0?A:B, y=d>0?B:A; avantage=d>0?'A':'B'; texte=Z.zone.duo.replace('{x}',x.last).replace('{y}',y.last); }
    }else{
      const c=za.vu?A:B, z=za.vu?za:zb, autre=za.vu?B:A;
      avantage=z.force>0.2?(za.vu?'A':'B'):null;
      texte=(z.force>0.2?Z.zone.seul:(z.force<-0.2?Z.zone.seulPas:Z.zone.seulRien)).replace('{x}',c.last);
      texte+=' '+Z.zone.autre.replace('{x}',autre.last);
      inconnu=false;
    }
    if(id==='centre'&&(za.vu||zb.vu)){
      const dr=A.reach-B.reach;
      if(Math.abs(dr)>=8){ const x=dr>0?A:B; texte+=' '+Z.zone.allonge.replace('{x}',x.last).replace('{n}',Math.round(Math.abs(dr))); }
    }
    return {id,titre,texte,inconnu,avantage};
  });
  const entete=(A.vus>0&&B.vus>0)
    ?{a:Z.entete.impose.replace('{x}',nA),b:Z.entete.imposeAutre.replace('{x}',nB),source:Z.entete.source}
    :{a:'',b:'',source:Z.entete.rien};
  return {i,etiquette:p.nom,court:p.court,titre:p.titre,rounds:p.rounds,div:p.div,divLabel:mgmtDivisionLabel(p.div),
    a:A,b:B,zones,entete,enjeux:mgmtSoireeEnjeux(m,p,A,B)};
}
/* ==== [FIN ANCRE] ==== */
