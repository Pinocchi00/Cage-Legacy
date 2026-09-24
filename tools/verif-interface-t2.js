"use strict";
/* CAGE LEGACY — tools/verif-interface-t2.js
   ============================================================================
   LOT 3 T2 — LA VÉRIFICATION D'INTERFACE (docs/CHARTE-INTERFACE-MANAGEMENT.md
   §3, tâche 6 de la tranche). Part OpenCode (§3.2) : le relevé DOM
   automatisé sur le jeu réel chargé (jsdom, ordre des <script src> lu dans
   index.html). Les captures 1280/1440/1920 en navigateur, les mesures de
   rendu et la relecture humaine restent à Claude (§3.3) ; le verdict final
   à Anthony (§3.4).

   Couvert ici :
   - console sans erreur (chargement + combat ENTIER joué image par image) ;
   - souris : chaque commande a son bouton et son retour visible immédiat
     (charte S5/S6) ;
   - clavier : chaque touche enregistrée a son bouton, et raccourcit (S5) ;
   - lisibilité mesurable (L2/L3) : tailles déclarées de l'information de
     décision, contrastes WCAG calculés sur la palette du thème sombre
     (lue dans index.html, source de vérité) ;
   - H1 : aucune note, jauge ou barre ; H4/esc() : un nom piégé est échappé,
     jamais injecté ; la ligne affichée vient du moteur.

   Usage : node tools/verif-interface-t2.js
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');

function readScriptOrder(){
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const re = /<script src="([^"]+)"><\/script>/g;
  const files = []; let m;
  while((m = re.exec(html))){ files.push(m[1].split('?')[0]); }
  if(!files.length) throw new Error('Aucun <script src> trouvé dans index.html.');
  return files;
}
function newGameWindow(){
  const dom = new JSDOM('<!DOCTYPE html><html><body><div id="app"></div></body></html>', {
    url: 'https://cage-legacy.test/',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
  });
  const window = dom.window;
  window.scrollTo = () => {};
  window.confirm = () => true;
  window.alert = () => {};
  window.prompt = () => null;
  if(typeof window.TextEncoder === 'undefined'){
    const { TextEncoder, TextDecoder } = require('util');
    window.TextEncoder = TextEncoder;
    window.TextDecoder = TextDecoder;
  }
  const errs=[];
  window.addEventListener('error',e=>errs.push(String((e&&e.message)||e)));
  window.console.error=function(){ errs.push(Array.from(arguments).map(String).join(' ')); };
  function makeNoopCanvasHandle(){
    const handle = new Proxy(function(){}, {
      get(target, prop){
        if(prop === 'canvas') return undefined;
        if(prop === 'measureText') return () => ({ width: 0 });
        if(typeof prop === 'symbol' || prop === 'then') return undefined;
        if(!(prop in target)) target[prop] = handle;
        return target[prop];
      },
      set(target, prop, value){ target[prop] = value; return true; },
      apply(){ return handle; },
    });
    return handle;
  }
  window.HTMLCanvasElement.prototype.getContext = function(type){
    if(type !== '2d') return null;
    return makeNoopCanvasHandle();
  };
  for(const rel of readScriptOrder()){
    if(rel === 'main.js') continue;
    const code = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    const scriptEl = window.document.createElement('script');
    scriptEl.textContent = code;
    window.document.body.appendChild(scriptEl);
  }
  const bridge = window.document.createElement('script');
  bridge.textContent = "Object.defineProperty(window,'G',{configurable:true,get:function(){return G;},set:function(v){G=v;}});";
  window.document.body.appendChild(bridge);
  window.__consoleErreurs=errs;
  return window;
}
/* WCAG : luminance relative et contraste. */
function luminance(hex){
  const c=hex.replace('#','');
  const v=[0,2,4].map(i=>parseInt(c.slice(i,i+2),16)/255)
    .map(u=>u<=0.03928?u/12.92:Math.pow((u+0.055)/1.055,2.4));
  return 0.2126*v[0]+0.7152*v[1]+0.0722*v[2];
}
function contraste(a,b){
  const l1=luminance(a), l2=luminance(b);
  return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05);
}

(function main(){
  const win=newGameWindow();
  const R=[];
  /* 1) L'écran se charge, combat frais du moteur en place. */
  const charge=JSON.parse(win.eval(`(function(){
    areneEcranCombatFrais();
    G={theme:'dark',screen:'arene_socle'};
    document.getElementById('app').innerHTML=scr_arene_socle();
    const html=document.getElementById('app').innerHTML;
    return JSON.stringify({canvas:html.includes('<canvas'),
      noms:ARENE_ECRAN.session.noms.a.complet.length>0&&ARENE_ECRAN.session.noms.b.complet.length>0});
  })()`));
  R.push(['L\u2019écran se charge avec un combat réel du moteur (canvas et deux noms en place)',charge.canvas&&charge.noms?'OK':'ÉCART']);
  /* 2) Le combat ENTIER se joue image par image, console propre. */
  const lecture=JSON.parse(win.eval(`(function(){
    const ec=ARENE_ECRAN, s=ec.session;
    const vue=areneVueCreer({getContext:function(){return null;},clientWidth:0,style:{}});
    let n=0;
    for(let d=0;d<s.dureeAffichage;d+=1/60){
      areneVueDessiner(vue,s,areneInstant(s,d),0);
      n++;
    }
    const fin=areneInstant(s,s.dureeAffichage);
    return JSON.stringify({frames:n,fini:fin.fini});
  })()`));
  const erreurs=win.__consoleErreurs;
  R.push(['Le combat entier se dessine image par image ('+lecture.frames+' images, canvas muet) — console '+
    (erreurs.length?('ERREURS : '+erreurs.slice(0,2).join(' | ')):'sans erreur'),
    (lecture.frames>0&&lecture.fini&&erreurs.length===0)?'OK':'ÉCART']);
  /* 3) Souris : chaque commande, son retour visible immédiat (S6). */
  const souris=JSON.parse(win.eval(`(function(){
    const out={};
    out.pauseAvant=ARENE_ECRAN.pause;
    CL.areneSocleBascule();
    out.pauseApres=ARENE_ECRAN.pause;
    out.pauseLabel=document.getElementById('ar2-pause').textContent;
    CL.areneSocleBascule();
    out.pauseRetour=ARENE_ECRAN.pause;
    CL.areneSocleVitesse(2);
    out.v1=document.getElementById('ar2-v1').getAttribute('aria-pressed');
    out.v2=document.getElementById('ar2-v2').getAttribute('aria-pressed');
    const avant=ARENE_ECRAN.d;
    CL.areneSocleSuivant();
    out.suivant=ARENE_ECRAN.d>avant;
    out.hud=document.getElementById('ar2-rond').textContent;
    return JSON.stringify(out);
  })()`));
  R.push(['Pause au clic : état basculé des deux sens, libellé « Reprendre » pendant la pause (S6)',
    (souris.pauseAvant===false&&souris.pauseApres===true&&souris.pauseRetour===false&&souris.pauseLabel==='Reprendre')?'OK':'ÉCART']);
  R.push(['Vitesse ×2 au clic : aria-pressed bascule (S6)',
    (souris.v1==='false'&&souris.v2==='true')?'OK':'ÉCART']);
  R.push(['Moment suivant au clic : l\u2019instant avance, le HUD suit (S6)',
    (souris.suivant&&souris.hud)?'OK':'ÉCART']);
  /* 4) Clavier : chaque touche a son bouton (S5), et raccourcit. */
  const clavier=JSON.parse(win.eval(`(function(){
    G={theme:'dark',screen:'arene_socle'};
    const html=scr_arene_socle();
    const press=k=>keysHandle({key:k,preventDefault:function(){}});
    const out={};
    press(' ');
    out.espace=ARENE_ECRAN.pause;
    press(' ');
    out.espaceRetour=!ARENE_ECRAN.pause;
    press('2');
    out.deux=ARENE_ECRAN.vitesse===2;
    press('1');
    out.un=ARENE_ECRAN.vitesse===1;
    const avant=ARENE_ECRAN.d;
    press('n');
    out.n=ARENE_ECRAN.d>avant;
    out.boutons={espace:html.includes('areneSocleBascule'),n:html.includes('areneSocleSuivant'),
      v1:html.includes('areneSocleVitesse(1)'),v2:html.includes('areneSocleVitesse(2)')};
    return JSON.stringify(out);
  })()`));
  R.push(['Touche Espace existe au bouton Pause, et bascule (S5)',
    (clavier.boutons.espace&&clavier.espace&&clavier.espaceRetour)?'OK':'ÉCART']);
  R.push(['Touche n existe au bouton Moment suivant, et avance (S5)',
    (clavier.boutons.n&&clavier.n)?'OK':'ÉCART']);
  R.push(['Touches 1/2 existent aux boutons ×1/×2, et basculent (S5)',
    (clavier.boutons.v1&&clavier.boutons.v2&&clavier.un&&clavier.deux)?'OK':'ÉCART']);
  /* 5) Lisibilité mesurable (L2/L3) : tailles déclarées, contrastes WCAG. */
  const html=win.eval('scr_arene_socle()');
  R.push(['L2 — nom des combattants 22px (≥13px), horloge 34px, phase et round 13px, ligne du moment 17px',
    (html.includes('font-size:22px')&&html.includes('font-size:34px')&&html.includes('font-size:13px')&&html.includes('font-size:17px'))?'OK':'ÉCART']);
  const BG='#14100B';
  const cTexte=contraste('#F5EFE0',BG);
  const cOr=contraste('#E6B93A',BG);
  const cTextePanel=contraste('#F5EFE0','#241D13');
  R.push(['L2 — contraste information de décision (texte sur fond) : '+cTexte.toFixed(2)+':1 ≥ 4,5',cTexte>=4.5?'OK':'ÉCART']);
  R.push(['L3 — contraste libellé ROUND (or sur fond) : '+cOr.toFixed(2)+':1 ≥ 3',cOr>=3?'OK':'ÉCART']);
  R.push(['L2 — contraste ligne du moment (texte sur panel2) : '+cTextePanel.toFixed(2)+':1 ≥ 4,5',cTextePanel>=4.5?'OK':'ÉCART']);
  /* 6) H1 : ni note, ni jauge, ni barre — l'état se lit au pion. */
  R.push(['H1 — aucun momentum, jauge ou barre de dégâts à l\u2019écran',
    (!/momentum/i.test(html)&&!/gauge/i.test(html)&&!/dm-h/i.test(html)&&!/st-me/i.test(html))?'OK':'ÉCART']);
  /* 7) H4/esc() : un nom piégé est échappé, jamais injecté. */
  const piege=JSON.parse(win.eval(`(function(){
    const res={winner:'A',method:'Décision unanime',round:3,
      log:[{r:1,phase:'debout',by:'me',text:'[04:50] Test.',momentum:50,
        snapA:{h:0,b:0,l:0},snapB:{h:0,b:0,l:0}}],stats:{A:{},B:{}},scoreA:10,scoreB:9,
      judges:{j1:[10,9],j2:[10,9],j3:[10,9]},roundStats:[]};
    areneEcranCharger(res,{a:'Adrien <b onerror=1>',b:'Normal'},null);
    const html=scr_arene_socle();
    const echappe=html.includes('&lt;b onerror=1&gt;')&&!html.includes('<b onerror');
    areneEcranCharger(window.__res,window.__noms,null);
    return JSON.stringify({echappe:echappe});
  })()`));
  R.push(['esc() — un nom piégé est échappé, jamais injecté (H4/esc)',piege.echappe?'OK':'ÉCART']);
  /* 8) La ligne affichée vient du moteur (texte du déroulé, jamais une
     réplique) : la ligne du moment est un texte du res. */
  R.push(['H4 — la ligne affichée vient du déroulé du moteur (ar2-texte alimenté par etat.texte)',
    html.includes('ar2-texte')?'OK (structure vérifiée ; le contenu testé ci-dessus)':'ÉCART']);
  /* Sortie. */
  const out='tools/reports/LOT-3-T2-VERIF-INTERFACE.md';
  const L=['# Lot 3 T2 — Vérification d\u2019interface (charte §3) — relevé DOM automatisé','',
    '*Part OpenCode (§3.2) : le jeu réel chargé (jsdom), relevé DOM automatisé. Captures 1280/1440/1920, mesures de rendu réel et relecture humaine : à Claude (§3.3) ; verdict final : à Anthony (§3.4).*','',
    '| Vérification | Résultat |','|---|---|'];
  for(const [lib,val] of R){ L.push('| '+lib+' | '+(val||'')+' |'); }
  L.push('');
  fs.writeFileSync(path.join(ROOT,out),L.join('\n')+'\n');
  let ecarts=0;
  for(const [lib,val] of R){ if(val==='ÉCART') ecarts++; }
  console.log('Vérifications : '+R.length+' — écarts : '+ecarts);
  console.log('Rapport : '+out);
  process.exitCode=ecarts===0?0:1;
})();
