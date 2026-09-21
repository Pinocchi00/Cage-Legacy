"use strict";
/* CAGE LEGACY — arene-ecran.js
   ============================================================================
   LOT 3 T2 — LE SOCLE DE L'ARÈNE NEUVE : L'ÉCRAN DE VÉRIFICATION
   (docs/LOT-3-L-ARENE.md §3 T2 ; charte docs/CHARTE-INTERFACE-MANAGEMENT.md).

   L'écran du socle : l'octogone de l'arène neuve jouant un combat du VRAI
   moteur, avec les commandes de la vision (« deux vitesses et un bouton
   « moment suivant » suffisent »). Il prépare lui-même son combat (deux
   profils du générateur existant, simulateFight tel quel — le moteur décide)
   sous le motif « SEED sauvegardé / restauré » : la RNG de la partie ne
   bouge pas. La T4 branchera la soirée du management sur cette arène ;
   l'écran n'est pour l'instant rejoint que par CL.go('arene_socle').

   Charte appliquée :
   - H1 (ni note, ni barème, ni jauge) : aucun chiffre de qualité, aucun
     momentum, aucun snap — l'état d'un combattant se lit à son pion ;
   - R1/R2 (factuel, vocabulaire de métier) : noms, round, horloge, phase
     nommée (« À distance », « Clinch », « Contre le grillage », « Au sol —
     GARDE FERMÉE ») ;
   - H4 : aucune réplique — les textes affichés viennent du moteur ;
     l'emplacement du refus de rejeu reste [EMPLACEMENT AUTEUR], signalé ;
   - S5 (souris d'abord, clavier accélérateur) : chaque touche a son bouton ;
   - S6 : chaque action a un retour visible immédiat.

   Portée globale classique ; SCREENS/CL étendus via Object.assign (jamais
   d'édition directe de ui-08, motif mgmt-screens.js). esc() sur tout nom
   injecté en HTML. Dépend au chargement de ui-08 (SCREENS, CL), ui-11
   (keysRegister), arene-etat.js et arene-vue.js.
   ============================================================================ */

/* ==== [ANCRE: ARENE_T2_ECRAN] — Lot 3 T2 le socle de l'arène neuve :
   l'écran de vérification (commandes de lecture, garde-fou du rejeu affiché,
   emplacement auteur du refus). ==== */

/* Trace de rendu (jamais persistée, motif MGMT_CART) : la session courante
   et l'état de lecture. */
let ARENE_ECRAN={compteur:0,session:null,refuse:false,trace:null,vue:null,
  d:0,offset:0,t0:0,vitesse:1,pause:false,fini:false,raf:0};
const ARENE_ECRAN_BASE_SEED=20260921;

/** Libellé de phase (R2 — vocabulaire de métier, phases lisibles). */
function arenePhaseLabel(etat){
  if(etat.phase==='coins'||etat.phase==='exam') return 'ENTRE LES ROUNDS';
  if(etat.phase==='fini') return 'FIN DU COMBAT';
  if(etat.phase==='clinch') return etat.posClinch==='cage'?'CONTRE LE GRILLAGE':'CLINCH';
  if(etat.phase==='sol') return 'AU SOL — '+(ARENE_POS_SOL_NOM[etat.posSol]||'AU SOL');
  return 'À DISTANCE';
}
function areneHorlogeTxt(sec){
  const s=Math.min(ARENE_ROUND_LEN,Math.max(0,Math.round(sec)));
  const m=Math.floor(s/60), r=s%60;
  return m+':'+(r<10?'0':'')+r;
}

/** Charge un combat dans l'écran. Avec une trace (rejeu), le garde-fou du
 *  rejeu s'applique : issue divergente, le refus est posé et RIEN n'est
 *  montré (ancre ARENE_T2_GARDE_REJEU). Sans trace (combat frais), rien à
 *  comparer. @returns {boolean} vrai si le combat est montrable. */
function areneEcranCharger(res,noms,trace){
  ARENE_ECRAN.session=null; ARENE_ECRAN.refuse=false; ARENE_ECRAN.trace=null;
  if(trace){
    if(!areneVerdictFidele(trace,res)){
      ARENE_ECRAN.refuse=true; ARENE_ECRAN.trace=trace;
      return false;
    }
  }
  const session=areneConstruire(res,noms);
  if(!session) return false;
  ARENE_ECRAN.session=session;
  ARENE_ECRAN.d=0; ARENE_ECRAN.offset=0; ARENE_ECRAN.t0=0;
  ARENE_ECRAN.vitesse=1; ARENE_ECRAN.pause=false; ARENE_ECRAN.fini=false;
  ARENE_ECRAN.vue=null;
  return true;
}

/** Prépare un combat frais : deux profils du générateur existant,
 *  simulateFight tel quel (le moteur décide de tout), SEED restauré — la
 *  RNG de la partie ne bouge pas d'un passage par l'écran. */
function areneEcranCombatFrais(){
  const compteur=(ARENE_ECRAN&&ARENE_ECRAN.compteur)?ARENE_ECRAN.compteur:0;
  const graine=ARENE_ECRAN_BASE_SEED+compteur+1;
  const saved=SEED;
  let res=null,na=null,nb=null;
  try{
    setSeed(graine);
    const A=makeFighter({div:'H-welter',gender:'H'});
    const B=makeFighter({div:'H-welter',gender:'H'});
    res=simulateFight(A,B,3);
    na=A.name; nb=B.name;
  }finally{
    setSeed(saved);
  }
  ARENE_ECRAN.compteur=compteur+1;
  areneEcranCharger(res,{a:na,b:nb},null);
}

/** La ligne de résultat (factuel — R1) : vainqueur, méthode, round. */
function areneResultatTxt(session){
  if(!session) return '';
  if(session.vainqueur==='D') return 'Nul — '+(session.methode||'');
  const nom=session.vainqueur==='A'?session.noms.a.complet:session.noms.b.complet;
  let t=nom+' — '+(session.methode||'');
  if(Number.isSafeInteger(session.roundFin)) t+=' · Round '+session.roundFin;
  return t;
}

function scr_arene_socle(){
  const ec=ARENE_ECRAN;
  const retour=`<button class="btn ghost" style="width:auto;padding:10px 16px" onclick="CL.go('title')">← Retour au titre</button>`;
  if(ec&&ec.refuse){
    /* Garde-fou du rejeu (ancre ARENE_T2_GARDE_REJEU) : issue divergente,
       RIEN n'est montré — ni arène, ni combat. Ce que l'écran dit alors est
       un texte d'auteur : emplacement posé, signalé, jamais comblé. */
    return `<div class="scr center intro"><div class="eyebrow gold">Arène — socle (lot 3, tranche 2)</div>`
      +`<h2 class="disp">L'arène</h2>`
      +`<div class="card" style="max-width:640px;margin:16px auto;padding:18px;border-color:var(--line)">`
      +`<div class="mgmt-say" style="border-left-color:var(--faint)">${esc('[EMPLACEMENT AUTEUR — rejeu divergent : ce combat ne peut pas être montré]')}</div>`
      +`<div class="mono small muted" style="margin-top:10px">L'issue rejouée ne correspond plus à l'issue enregistrée.</div>`
      +`</div>`
      +`<button class="btn primary mt" onclick="CL.areneSocle()">Autre combat</button>`
      +`<div class="mt">${retour}</div></div>`;
  }
  if(!ec||!ec.session){
    return `<div class="scr center intro"><div class="eyebrow gold">Arène — socle (lot 3, tranche 2)</div>`
      +`<h2 class="disp">L'arène</h2>`
      +`<p class="lede">Aucun combat chargé.</p>`
      +`<button class="btn primary mt" onclick="CL.areneSocle()">Ouvrir le socle</button>`
      +`<div class="mt">${retour}</div></div>`;
  }
  const s=ec.session;
  const nomA=esc(s.noms.a.complet), nomB=esc(s.noms.b.complet);
  return `<div class="scr" style="max-width:1100px;margin:0 auto;padding:20px 16px 40px">`
    +`<div style="display:flex;justify-content:space-between;align-items:center;gap:12px">`
    +`<div><div class="eyebrow gold">Arène — socle (lot 3, tranche 2)</div>`
    +`<h2 class="disp" style="font-size:26px">L'arène</h2></div>${retour}</div>`
    +`<div style="display:grid;grid-template-columns:1fr auto 1fr;align-items:baseline;gap:16px;margin:14px 0 8px">`
    +`<div style="min-width:0"><div style="width:min(320px,90%);height:5px;background:${ARENE_COUL_A};transform:skewX(-20deg)"></div>`
    +`<div style="font-family:Oswald,sans-serif;font-weight:700;text-transform:uppercase;font-size:22px;line-height:1.1;color:var(--text)">${nomA}</div></div>`
    +`<div style="text-align:center">`
    +`<div id="ar2-rond" style="font-family:Oswald,sans-serif;font-weight:600;font-size:13px;letter-spacing:.18em;color:var(--gold)">ROUND 1</div>`
    +`<div id="ar2-temps" style="font-family:Oswald,sans-serif;font-weight:700;font-style:italic;font-size:34px;line-height:1;color:var(--text)">5:00</div>`
    +`<div id="ar2-phase" style="font-family:'JetBrains Mono',monospace;font-size:13px;letter-spacing:.14em;color:var(--text);margin-top:3px">À DISTANCE</div>`
    +`</div>`
    +`<div style="min-width:0;text-align:right"><div style="width:min(320px,90%);height:5px;background:${ARENE_COUL_B};transform:skewX(-20deg);margin-left:auto"></div>`
    +`<div style="font-family:Oswald,sans-serif;font-weight:700;text-transform:uppercase;font-size:22px;line-height:1.1;color:var(--text)">${nomB}</div></div>`
    +`</div>`
    +`<canvas id="arene-socle-cv" aria-label="Octogone vu de trois quarts" style="display:block;width:100%;border:1px solid var(--line)"></canvas>`
    +`<div id="ar2-texte" style="min-height:56px;text-align:center;font-family:Fraunces,serif;font-style:italic;font-size:17px;line-height:1.4;color:var(--text);padding:12px 24px 0"></div>`
    +`<div id="ar2-resultat" style="display:none;text-align:center;font-family:Oswald,sans-serif;font-weight:700;text-transform:uppercase;font-size:20px;color:var(--gold);padding:6px 0 0"></div>`
    +`<div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-top:12px">`
    +`<button class="btn ghost" id="ar2-pause" aria-pressed="false" style="width:auto;padding:10px 16px" onclick="CL.areneSocleBascule()">Pause</button>`
    +`<button class="btn ghost" id="ar2-v1" aria-pressed="true" style="width:auto;padding:10px 16px" onclick="CL.areneSocleVitesse(1)">×1</button>`
    +`<button class="btn ghost" id="ar2-v2" aria-pressed="false" style="width:auto;padding:10px 16px" onclick="CL.areneSocleVitesse(2)">×2</button>`
    +`<button class="btn primary" style="width:auto;padding:10px 22px" onclick="CL.areneSocleSuivant()">Moment suivant</button>`
    +`<button class="btn ghost" style="width:auto;padding:10px 16px" onclick="CL.areneSocle()">Autre combat</button>`
    +`</div></div>`;
}

/* ---- Boucle de lecture (le temps d'affichage traverse le montage) --------- */
function areneEcranDemarrer(){
  const ec=ARENE_ECRAN;
  if(!ec||!ec.session||ec.refuse) return;
  if(ec.raf&&typeof cancelAnimationFrame!=='undefined') cancelAnimationFrame(ec.raf);
  ec.raf=0;
  const cv=document.getElementById('arene-socle-cv');
  ec.vue=cv?areneVueCreer(cv):null;
  ec.t0=(typeof performance!=='undefined'&&performance.now)?performance.now():0;
  ec.offset=ec.d||0;
  if(ec.vue&&typeof requestAnimationFrame!=='undefined') ec.raf=requestAnimationFrame(areneEcranBoucle);
  areneEcranHud(ar2EtatInit(ec));
}
function ar2EtatInit(ec){
  return areneInstant(ec.session,ec.d||0);
}
function areneEcranBoucle(now){
  const ec=ARENE_ECRAN;
  if(!ec||!ec.session){ ec.raf=0; return; }
  const vue=ec.vue;
  if(!vue||!vue.cv||!vue.cv.isConnected){ ec.raf=0; return; }
  if(!ec.pause&&!ec.fini){
    const base=(typeof performance!=='undefined'&&performance.now)?performance.now():now;
    const d=ec.offset+(base-ec.t0)/1000*ec.vitesse;
    ec.d=Math.min(ec.session.dureeAffichage,Math.max(0,d));
    if(ec.d>=ec.session.dureeAffichage){
      ec.fini=true;
      const el=document.getElementById('ar2-resultat');
      if(el){ el.textContent=areneResultatTxt(ec.session); el.style.display='block'; }
    }
  }
  const etat=areneInstant(ec.session,ec.d);
  areneVueDessiner(vue,ec.session,etat,now);
  areneEcranHud(etat);
  ec.raf=requestAnimationFrame(areneEcranBoucle);
}
/** Mise à jour directe du HUD (aucun rendu HTML reconstruit). */
function areneEcranHud(etat){
  const ec=ARENE_ECRAN;
  const rond=document.getElementById('ar2-rond');
  const temps=document.getElementById('ar2-temps');
  const phase=document.getElementById('ar2-phase');
  const texte=document.getElementById('ar2-texte');
  if(rond) rond.textContent=etat.phase==='coins'?'ENTRE LES ROUNDS':(etat.fini?'FIN DU COMBAT':'ROUND '+etat.r);
  if(temps) temps.textContent=areneHorlogeTxt(etat.horloge);
  if(phase) phase.textContent=arenePhaseLabel(etat);
  if(texte) texte.textContent=etat.texte||'';
}
function areneEcranReancre(){
  const ec=ARENE_ECRAN;
  ec.t0=(typeof performance!=='undefined'&&performance.now)?performance.now():0;
  ec.offset=ec.d||0;
}

/* ---- Branchement : écran, clavier, contrôleur ----------------------------- */
Object.assign(SCREENS,{arene_socle:scr_arene_socle});

keysRegister('arene_socle',{
  ' '(){ CL.areneSocleBascule(); },
  'n'(){ CL.areneSocleSuivant(); },
  '1'(){ CL.areneSocleVitesse(1); },
  '2'(){ CL.areneSocleVitesse(2); },
  Escape(){ CL.go('title'); },
});

Object.assign(CL,{
  areneSocle(){
    areneEcranCombatFrais();
    CL.go('arene_socle');
    areneEcranDemarrer();
  },
  areneSocleBascule(){
    const ec=ARENE_ECRAN;
    if(!ec||!ec.session||ec.refuse) return;
    ec.pause=!ec.pause;
    areneEcranReancre();
    const el=document.getElementById('ar2-pause');
    if(el){ el.textContent=ec.pause?'Reprendre':'Pause'; el.setAttribute('aria-pressed',String(ec.pause)); }
  },
  areneSocleVitesse(v){
    const ec=ARENE_ECRAN;
    if(!ec||!ec.session||ec.refuse) return;
    ec.vitesse=(v===2)?2:1;
    areneEcranReancre();
    const b1=document.getElementById('ar2-v1'), b2=document.getElementById('ar2-v2');
    if(b1) b1.setAttribute('aria-pressed',String(ec.vitesse===1));
    if(b2) b2.setAttribute('aria-pressed',String(ec.vitesse===2));
  },
  areneSocleSuivant(){
    const ec=ARENE_ECRAN;
    if(!ec||!ec.session||ec.refuse) return;
    if(ec.d>=ec.session.dureeAffichage-0.01) return;
    const m=ec.session.montage;
    let cible=ec.session.dureeAffichage;
    for(let i=0;i<m.length;i++){
      const ent=m[i];
      if(ent.genre==='pause'){
        if(ec.d<ent.d1){ cible=ent.d1; break; }
      }else if(ent.d0>ec.d+0.01){
        cible=ent.d0; break;
      }
    }
    ec.d=Math.min(ec.session.dureeAffichage,Math.max(ec.d,cible));
    areneEcranReancre();
  },
  areneSocleRejouer(){ CL.areneSocle(); },
});
/* ==== [FIN ANCRE] ==== */
