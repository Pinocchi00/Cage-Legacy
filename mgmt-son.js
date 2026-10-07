"use strict";
/* ==== [ANCRE: MGMT_BRIEF_LOT12_SON] — Brief du 06/10/2026, lot 12 : le son. Aucun fichier de son dans le dépôt : tout est SYNTHÉTISÉ à l'exécution avec
   l'API Web Audio (bruit filtré, oscillateurs, enveloppes). Il n'y a donc ni licence à noter par fichier ni droit à acheter pour vendre le jeu ;
   l'origine de chaque son est écrite dans docs/SONS-ORIGINE.md. Quatre familles :
   - la MUSIQUE des menus et de la soirée : un nappage lent en quatre accords, jamais pendant le combat ;
   - la SALLE : le public pendant le combat, un bruit filtré dont le niveau suit le remplissage de la salle (le calcul du lot 8) ;
   - les COUPS : un impact grave à chaque coup qui touche dans la cage, plus fort sur un coup décisif ;
   - l'INTERFACE : un petit clic à chaque bouton.
   Le volume général multiplie les trois autres ; 0 coupe tout. Avec « son coupé hors du jeu », tout se tait quand la fenêtre n'est plus au
   premier plan. Le navigateur n'autorise le son qu'après un geste du joueur : le contexte est créé au premier clic ou à la première touche.
   Sans Web Audio (le harnais de test), toutes les fonctions sont sans effet. ==== */

let MGMT_SON={ctx:null,maitre:null,musique:null,salle:null,coups:null,ui:null,foule:null,bruit:null,muet:false,musiqueOn:false,minuteur:0,accord:0,sonCoups:0};
/** Les quatre accords de la musique (hertz). */
const MGMT_SON_ACCORDS=[[110,164.8,220,261.6],[87.3,130.8,174.6,220],[130.8,196,261.6,329.6],[98,146.8,196,246.9]];

/** Le niveau d'une famille, de 0 à 1 (courbe en carré : l'oreille entend en logarithme). Pur.
 *  @param {'general'|'musique'|'salle'|'coups'} cat */
function mgmtSonNiveau(cat){
  const s=MGMT_REGLAGES.son, g=Math.pow(s.general/10,2);
  return cat==='general'?g:g*Math.pow(s[cat]/10,2);
}
/** Le jeu est-il au premier plan ? */
function mgmtSonPremierPlan(){
  if(typeof document==='undefined') return true;
  return !document.hidden&&(typeof document.hasFocus!=='function'||document.hasFocus());
}
function mgmtSonCtx(){
  if(MGMT_SON.ctx) return MGMT_SON.ctx;
  const AC=typeof window!=='undefined'&&(window.AudioContext||window.webkitAudioContext);
  if(!AC) return null;
  try{
    const c=new AC(), S=MGMT_SON;
    S.ctx=c; S.maitre=c.createGain(); S.maitre.connect(c.destination);
    for(const k of ['musique','salle','coups','ui']){ S[k]=c.createGain(); S[k].connect(S.maitre); }
    /* Deux secondes de bruit blanc, relues en boucle pour la salle et les impacts. */
    const n=c.sampleRate*2, buf=c.createBuffer(1,n,c.sampleRate), d=buf.getChannelData(0);
    let x=12345; for(let i=0;i<n;i++){ x=(x*1664525+1013904223)>>>0; d[i]=x/2147483648-1; }
    S.bruit=buf;
    S.foule=c.createGain(); S.foule.gain.value=0; S.foule.connect(S.salle);
    const src=c.createBufferSource(); src.buffer=buf; src.loop=true;
    const f=c.createBiquadFilter(); f.type='bandpass'; f.frequency.value=700; f.Q.value=0.6;
    src.connect(f); f.connect(S.foule); src.start();
    mgmtSonAppliquer();
    return c;
  }catch(e){ MGMT_SON.ctx=null; return null; }
}
function mgmtSonPose(param,v){
  if(!param) return;
  const c=MGMT_SON.ctx;
  if(typeof param.setTargetAtTime==='function'&&c) param.setTargetAtTime(v,c.currentTime,0.04); else param.value=v;
}
/** Règle les niveaux sur les réglages (appelé à chaque changement). */
function mgmtSonAppliquer(){
  const S=MGMT_SON; if(!S.ctx) return;
  S.muet=!!MGMT_REGLAGES.son.silence&&!mgmtSonPremierPlan();
  mgmtSonPose(S.maitre.gain,S.muet?0:mgmtSonNiveau('general'));
  mgmtSonPose(S.musique.gain,mgmtSonNiveau('musique')>0?Math.pow(MGMT_REGLAGES.son.musique/10,2)*0.30:0);
  mgmtSonPose(S.salle.gain,Math.pow(MGMT_REGLAGES.son.salle/10,2));
  mgmtSonPose(S.coups.gain,Math.pow(MGMT_REGLAGES.son.coups/10,2));
  mgmtSonPose(S.ui.gain,0.5);
  if(!MGMT_REGLAGES.son.musique||!MGMT_REGLAGES.son.general) mgmtSonMusique(false);
}
/** Le premier geste du joueur ouvre le son. */
function mgmtSonDebloquer(){
  const c=mgmtSonCtx();
  if(c&&c.state==='suspended'&&typeof c.resume==='function') c.resume();
}
/** Un son court : bruit filtré ou oscillateur, avec son enveloppe. */
function mgmtSonImpulsion(bus,o){
  const S=MGMT_SON, c=S.ctx; if(!c||!bus||S.muet) return false;
  const t=c.currentTime, g=c.createGain();
  g.gain.setValueAtTime(o.vol,t); g.gain.exponentialRampToValueAtTime(0.0001,t+o.dur);
  g.connect(bus);
  if(o.bruit){
    const s=c.createBufferSource(); s.buffer=S.bruit; const f=c.createBiquadFilter(); f.type=o.filtre||'lowpass'; f.frequency.value=o.freq;
    s.connect(f); f.connect(g); s.start(t,(S.sonCoups++*0.37)%1.5); s.stop(t+o.dur);
  }
  if(o.osc){
    const s=c.createOscillator(); s.type=o.type||'sine'; s.frequency.setValueAtTime(o.osc,t);
    if(o.vers) s.frequency.exponentialRampToValueAtTime(o.vers,t+o.dur);
    s.connect(g); s.start(t); s.stop(t+o.dur);
  }
  return true;
}
/** Un coup qui touche : un impact grave (p : 0 à 1, la puissance de l'éclat). Présentation seule. */
function mgmtSonCoup(p){
  const forte=Math.max(0.2,Math.min(1,p||0.4));
  mgmtSonImpulsion(MGMT_SON.coups,{bruit:true,freq:260+300*forte,vol:0.5+0.5*forte,dur:0.16+0.18*forte});
  mgmtSonImpulsion(MGMT_SON.coups,{osc:130,vers:48,type:'sine',vol:0.6*forte+0.25,dur:0.2+0.2*forte});
}
function mgmtSonClic(){
  mgmtSonImpulsion(MGMT_SON.ui,{osc:880,vers:440,type:'triangle',vol:0.18,dur:0.07});
}
/** Le public : `niveau` de 0 à 1 (la part remplie de la salle, son bruit et l'instant). */
function mgmtSonSalle(niveau){
  const S=MGMT_SON; if(!S.ctx||!S.foule) return;
  mgmtSonPose(S.foule.gain,Math.max(0,Math.min(1,niveau))*0.9);
}
/** La musique : un nappage en quatre accords, un toutes les 3,2 secondes. */
function mgmtSonMusique(on){
  const S=MGMT_SON;
  if(!on){
    S.musiqueOn=false;
    if(S.minuteur&&typeof clearInterval!=='undefined') clearInterval(S.minuteur);
    S.minuteur=0; return;
  }
  if(S.musiqueOn||!S.ctx||typeof setInterval==='undefined') return;
  if(!MGMT_REGLAGES.son.musique||!MGMT_REGLAGES.son.general) return;
  S.musiqueOn=true;
  const joue=()=>{
    const c=S.ctx; if(!c||S.muet) return;
    const t=c.currentTime, acc=MGMT_SON_ACCORDS[S.accord++%MGMT_SON_ACCORDS.length];
    for(const f of acc){
      const o=c.createOscillator(), g=c.createGain();
      o.type='triangle'; o.frequency.value=f; o.detune.value=(f%7)-3;
      g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(0.16,t+1.2); g.gain.linearRampToValueAtTime(0.0001,t+3.6);
      o.connect(g); g.connect(S.musique); o.start(t); o.stop(t+3.7);
    }
  };
  joue(); S.minuteur=setInterval(joue,3200);
}
/** Après chaque dessin d'écran : la musique accompagne les menus et la soirée, jamais le combat ; la salle ne parle qu'au combat. */
function mgmtSonEcran(){
  if(typeof G==='undefined'||!G) return;
  const ecran=G.screen||'', combat=ecran==='mgmt_combat';
  mgmtSonMusique(!combat&&(ecran==='title'||ecran.indexOf('mgmt_')===0));
  if(!combat) mgmtSonSalle(0);
}
if(typeof document!=='undefined'&&document.addEventListener){
  const ouvre=()=>mgmtSonDebloquer();
  document.addEventListener('pointerdown',ouvre,true);
  document.addEventListener('keydown',ouvre,true);
  document.addEventListener('click',e=>{ const b=e.target&&e.target.closest?e.target.closest('button'):null; if(b&&!b.disabled) mgmtSonClic(); },true);
  document.addEventListener('visibilitychange',mgmtSonAppliquer);
}
if(typeof window!=='undefined'&&window.addEventListener){
  window.addEventListener('blur',mgmtSonAppliquer);
  window.addEventListener('focus',mgmtSonAppliquer);
}
/* Chaque écran dessiné règle la musique et la salle. */
if(typeof window!=='undefined'&&typeof render==='function'&&!render.sonne){
  const dessin=render;
  window.render=function(){ const r=dessin.apply(this,arguments); try{ mgmtSonEcran(); }catch(e){} return r; };
  window.render.sonne=true;
}
/* ==== [FIN ANCRE] ==== */
