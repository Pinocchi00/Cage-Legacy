"use strict";
/* Brief démo du 09/10/2026 (décision d'Anthony : « enlever tous les textes qui se superposent dans le jeu »).
   On dessine un combat entier sur une fausse toile qui note chaque texte posé (sa boîte, après les translations et les échelles) ;
   dans aucune image deux textes différents ne doivent se recouvrir. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const jouer=require('./helpers/jouerSoirees');

function installerToile(win){
  win.eval(`window.__boites=[]; window.__toileSuperposition=function(){
    const pile=[], M={a:1,d:1,e:0,f:0}; let etat=Object.assign({},M);
    const mem={globalAlpha:1,font:'20px x',textAlign:'left'};
    const ctx=new Proxy(mem,{get(t,k){
      if(k==='measureText') return s=>({width:String(s).length*(parseFloat(/(\\d+(?:\\.\\d+)?)px/.exec(t.font||'')?.[1])||20)*0.4});
      if(k==='createRadialGradient'||k==='createLinearGradient') return ()=>({addColorStop(){}});
      if(k==='save') return ()=>{ pile.push(Object.assign({},etat)); };
      if(k==='restore') return ()=>{ etat=pile.pop()||Object.assign({},M); };
      if(k==='setTransform') return (a,b,c,d,e,f)=>{ etat={a:a,d:d,e:e,f:f}; };
      if(k==='translate') return (x,y)=>{ etat.e+=etat.a*x; etat.f+=etat.d*y; };
      if(k==='scale') return (x,y)=>{ etat.a*=x; etat.d*=y; };
      if(k==='fillRect') return (x,y,w,h)=>{ const c=String(t.fillStyle); if(w>=1900&&h>=1000&&(c.indexOf('rgba(11,9,9,0.8')===0||c.indexOf('rgba(11,9,9,0.9')===0)) window.__boites.length=0; };
      if(k==='fillText') return (txt,x,y)=>{
        if(!(t.globalAlpha>0.08)||!String(txt).trim()) return;
        const px=(parseFloat(/(\\d+(?:\\.\\d+)?)px/.exec(t.font||'')?.[1])||20), w=String(txt).length*px*0.4;
        const x0=t.textAlign==='center'?x-w/2:(t.textAlign==='right'||t.textAlign==='end'?x-w:x);
        window.__boites.push({t:String(txt),l:etat.a*x0+etat.e,r:etat.a*(x0+w)+etat.e,tp:etat.d*(y-px*0.75)+etat.f,b:etat.d*(y+px*0.05)+etat.f});
      };
      if(k in t) return t[k]; return function(){}; },set(t,k,v){ t[k]=v; return true; }});
    return {width:1920,height:1080,clientWidth:1920,getBoundingClientRect(){ return {width:1920}; },getContext(){ return ctx; }}; };`);
}

test('Un combat entier : dans aucune image deux textes ne se recouvrent', () => {
  const win=newGameWindow({runMain:true});
  win.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(7); CL.mgmtEnter(1);`);
  jouer(win,1,{titre:true});
  installerToile(win);
  const r=JSON.parse(win.eval(`JSON.stringify((function(){
    const m=G.mgmt, p=mgmtSoireeProgramme(m), trouves=new Map(); let images=0, textes=0;
    MGMT_SOIREE.index=0; CL.go('mgmt_soiree');
    for(const x of p){
      const tr=mgmtSoireeTrace(m,x.h); if(!tr) continue;
      mgmtCombatOuvrir({trace:tr}); const C=MGMT_COMBAT; if(!C.session) continue;
      C.vue=areneSalleCreer(window.__toileSuperposition()); if(!C.vue) continue; C.vitesse=4;
      for(let k=0;k<4000&&C.mode!=='fin';k++){
        window.__boites.length=0;
        mgmtCombatAvancer(0.2);
        C.vue.dessiner(mgmtCombatCx()); images++;
        const b=window.__boites; textes+=b.length;
        for(let i=0;i<b.length;i++) for(let j=i+1;j<b.length;j++){
          const A=b[i], B=b[j]; if(A.t.length===1||B.t.length===1||(A.t===B.t&&Math.abs(A.l-B.l)<2&&Math.abs(A.tp-B.tp)<2)) continue;
          const w=Math.min(A.r,B.r)-Math.max(A.l,B.l), h=Math.min(A.b,B.b)-Math.max(A.tp,B.tp);
          if(w>6&&h>6) trouves.set(A.t+' || '+B.t,(trouves.get(A.t+' || '+B.t)||0)+1);
        }
        if(C.d>=C.session.dureeAffichage-0.05&&C.mode==='dec'&&C.decT>8) break;
      }
      mgmtCombatNettoyer();
    }
    return {images,textes,trouves:[...trouves.entries()]};
  })())`));
  assert.ok(r.images>150&&r.textes>800,'le combat est bien dessiné ('+r.images+' images, '+r.textes+' textes)');
  assert.deepEqual(r.trouves,[],'aucun texte posé sur un autre');
});
