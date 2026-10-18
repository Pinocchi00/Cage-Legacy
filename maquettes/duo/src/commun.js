"use strict";
/* Socle commun des planches : la mise à l'échelle du jeu (mfAjuste), le choix de l'état (?etat=…), et le contrôle (?audit=1). */
(function(){
  const q=new URLSearchParams(location.search);
  function ajuste(){
    const s=Math.min(innerWidth/1920,innerHeight/1080);
    document.documentElement.style.setProperty('--s',String(Math.round(s*10000)/10000));
  }
  addEventListener('resize',ajuste); ajuste();

  /* Les états : l'URL choisit, sinon le premier listé dans <body data-etats>. */
  const etats=(document.body.dataset.etats||'').split(' ').filter(Boolean);
  const etat=q.get('etat')&&etats.includes(q.get('etat'))?q.get('etat'):etats[0];
  document.body.dataset.etat=etat;
  for(const el of document.querySelectorAll('[data-etat]')){
    if(el.dataset.etat.split(' ').includes(etat)) el.classList.add('vis');
  }
  window.PLANCHE={etat,q};

  /* Le contrôle : texte sous 22 px, texte hors de son bloc, textes qui se chevauchent. */
  function audit(){
    const stage=document.querySelector('.stage'), s=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--s'))||1;
    const err=[], textes=[];
    const W=document.createTreeWalker(stage,NodeFilter.SHOW_TEXT);
    const BLOCS='.p3,.tuile,.jaune-bloc,.carte-l,.bouton,.plaque,.sec,.k,.zone,.stage';
    let n;
    while((n=W.nextNode())){
      if(!n.nodeValue.trim()) continue;
      const el=n.parentElement; if(!el||!el.getClientRects().length) continue;
      const cs=getComputedStyle(el); if(cs.visibility==='hidden'||+cs.opacity===0) continue;
      const fs=parseFloat(cs.fontSize);
      const quoi=n.nodeValue.trim().slice(0,40);
      if(fs<22) err.push(`taille ${fs}px : « ${quoi} »`);
      const r=document.createRange(); r.selectNodeContents(n);
      /* L'encre des lettres, pas la boîte de la police : ±0,42 em autour du centre de la ligne (capitales et descendantes). */
      const demi=0.42*fs*s;
      const rects=[...r.getClientRects()].filter(x=>x.width>0).map(x=>{ const c=(x.top+x.bottom)/2; return {left:x.left,right:x.right,top:c-demi,bottom:c+demi}; });
      const bloc=el.closest(BLOCS)||stage, b=bloc.getBoundingClientRect();
      for(const x of rects){
        if(x.left<b.left-1||x.right>b.right+1||x.top<b.top-1||x.bottom>b.bottom+1) err.push(`déborde de ${bloc.className.split(' ')[0]||'bloc'} : « ${quoi} » (${Math.round((x.right-b.right)/s)} px à droite, ${Math.round((x.bottom-b.bottom)/s)} px en bas)`);
        textes.push({x,quoi,el});
      }
    }
    for(let i=0;i<textes.length;i++) for(let j=i+1;j<textes.length;j++){
      const a=textes[i].x, c=textes[j].x;
      const w=Math.min(a.right,c.right)-Math.max(a.left,c.left), h=Math.min(a.bottom,c.bottom)-Math.max(a.top,c.top);
      if(w>2*s&&h>4*s) err.push(`chevauchement : « ${textes[i].quoi} » / « ${textes[j].quoi} »`);
    }
    window.__audit={etat,textes:textes.length,erreurs:err};
    document.body.setAttribute('data-audit',JSON.stringify(window.__audit));
    document.title=(err.length?'AUDIT '+err.length+' ERREUR(S) — ':'AUDIT OK — ')+document.title;
    console.log(JSON.stringify(window.__audit,null,1));
    return window.__audit;
  }
  window.PLANCHE.audit=audit;
  if(q.get('audit')==='1') (document.fonts?document.fonts.ready:Promise.resolve()).then(()=>setTimeout(audit,50));
})();
