"use strict";
/* Cage Legacy — le balayage des textes qui se superposent (retours d'Anthony du 09/10/2026 : « aucun texte ne se superpose »).
   S'exécute DANS le navigateur, sur le jeu servi en local (le jeu est lancé : http://127.0.0.1:8781/index.html par exemple) :
     const s=document.createElement('script'); s.src='/tools/balayage-textes.js'; document.head.appendChild(s);
     window.balayage();            // l'écran affiché : la liste des paires de textes qui se recouvrent (vide = rien)
   Il lit les boîtes réelles des textes (les rectangles de leurs lignes, resserrés sur les lettres), ignore ce qui est caché, coupé par un défilement ou réservé aux lecteurs d'écran. */
window.balayage=function(){
  const sortie=[], els=[];
  const marche=document.createTreeWalker(document.getElementById('app'),NodeFilter.SHOW_TEXT);
  let n;
  while((n=marche.nextNode())){
    if(!n.nodeValue.trim()) continue;
    const el=n.parentElement; if(!el||el.closest('.mf-sr')) continue;
    const cs=getComputedStyle(el); if(cs.visibility==='hidden'||cs.display==='none'||+cs.opacity===0) continue;
    const coupes=[];
    for(let p=el;p&&p!==document.body;p=p.parentElement){
      const c=getComputedStyle(p);
      if(c.overflow!=='visible'||c.overflowX!=='visible'||c.overflowY!=='visible'){ const q=p.getBoundingClientRect(); if(q.width>2&&q.height>2) coupes.push(q); }
    }
    const r=document.createRange(); r.selectNodeContents(n);
    const boites=[...r.getClientRects()].filter(q=>q.width>2&&q.height>2).map(q=>{
      const f=parseFloat(cs.fontSize)||20, h=Math.min(q.height,f*0.7), cy=q.top+q.height/2;
      return {left:q.left,right:q.right,top:cy-h/2,bottom:cy+h/2};
    }).filter(q=>coupes.every(c=>q.right>c.left&&q.left<c.right&&q.bottom>c.top+1&&q.top<c.bottom-1));
    if(boites.length) els.push({el:el,txt:n.nodeValue.trim().slice(0,38),boites:boites});
  }
  for(let i=0;i<els.length;i++) for(let j=i+1;j<els.length;j++){
    const a=els[i], b=els[j]; if(a.el===b.el) continue;
    let touche=0;
    for(const p of a.boites) for(const q of b.boites){
      const w=Math.min(p.right,q.right)-Math.max(p.left,q.left), h=Math.min(p.bottom,q.bottom)-Math.max(p.top,q.top);
      if(w>4&&h>4) touche=Math.max(touche,w*h);
    }
    if(touche>30) sortie.push(a.txt+' || '+b.txt+' ('+Math.round(touche)+')');
  }
  return sortie;
};
