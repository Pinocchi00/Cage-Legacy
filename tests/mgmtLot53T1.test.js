"use strict";
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const jouerSoirees=require('./helpers/jouerSoirees');

test('Monde lot 53 T1 — voie réelle : une passe générée ouvre une soirée jouable',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const n=w.eval(`(()=>{setSeed(5301);const m=mgmtPasseGenerer('split',{soirees:3});G.mgmt=m;mgmtRetraitProb=()=>0;CL.mgmtEnter(1);return m;})()`);
    assert.ok(n);
    jouerSoirees(w,1);
    const r=w.eval(`(()=>{const p=mgmtSoireeProgramme(G.mgmt);G.screen='mgmt_soiree';render();return {n:p.length,screen:G.screen,html:document.getElementById('app').innerHTML};})()`);
    assert.ok(r.n>0);
    assert.equal(r.screen,'mgmt_soiree');
    assert.match(r.html,/La soirée|PRÉLIM|COMBAT/);
  }finally{w.close();}
});

test('Monde lot 53 T1 — le choix de vue reste indépendant pour chaque combat',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(5302);const m=mgmtPasseGenerer('split',{soirees:3});G.mgmt=m;mgmtRetraitProb=()=>0;CL.mgmtEnter(1);`);
    jouerSoirees(w,1);
    const r=w.eval(`(()=>{mgmtVueCombatChoisir(0,'resultat');mgmtVueCombatChoisir(1,'forts');return [mgmtVueDuCombat(G.mgmt,0),mgmtVueDuCombat(G.mgmt,1)];})()`);
    assert.deepEqual(Array.from(r),['resultat','forts']);
  }finally{w.close();}
});

test('Monde lot 53 T1 — la vue résultat affiche sa carte passable puis fait avancer la soirée',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(5305);const m=mgmtPasseGenerer('split',{soirees:3});G.mgmt=m;mgmtRetraitProb=()=>0;CL.mgmtEnter(1);`);
    jouerSoirees(w,1);
    const r=w.eval(`(()=>{G.screen='mgmt_soiree';const i=MGMT_SOIREE.index,original=setTimeout;let delai=0;window.setTimeout=(fn,ms)=>{delai=ms;return 1;};mgmtVueCombatChoisir(i,'resultat');CL.mgmtSoRegarder();window.setTimeout=original;return {avant:i,apres:MGMT_SOIREE.index,screen:G.screen,delai};})()`);
    assert.equal(r.apres,r.avant);
    assert.equal(r.screen,'mgmt_soiree');
    assert.equal(r.delai,5000);
    assert.match(w.eval(`document.getElementById('app').innerHTML`),/so3-resultat/);
    assert.match(w.eval(`document.getElementById('app').innerHTML`),/role="status" aria-live="polite"/);
    w.eval(`CL.mgmtSoResultatContinuer()`);
    assert.equal(w.eval(`MGMT_SOIREE.index`),r.avant+1);
  }finally{w.close();}
});

test('Monde lot 53 T1 — la carte résultat indique le temps de la finition ou du dernier round',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(5313);const m=mgmtPasseGenerer('split',{soirees:3});G.mgmt=m;mgmtRetraitProb=()=>0;CL.mgmtEnter(1);`);
    jouerSoirees(w,1);
    const r=w.eval(`(()=>{const p=mgmtSoireeProgramme(G.mgmt)[0],d=mgmtResultatDetail(G.mgmt,p.h);return {temps:d.temps,html:mgmtSoResultatSeulHtml(G.mgmt,p)};})()`);
    assert.match(r.temps,/^\d{1,2}:\d{2}$/);
    assert.ok(r.html.includes(`· ${r.temps}`));
  }finally{w.close();}
});

test('Monde lot 53 T1 — le cumul estimé inclut chaque combat et ses transitions',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(5303);const m=mgmtPasseGenerer('split',{soirees:3});G.mgmt=m;mgmtRetraitProb=()=>0;CL.mgmtEnter(1);`);
    jouerSoirees(w,1);
    const n=w.eval(`mgmtSoireeDureeEstimee(G.mgmt)`);
    assert.ok(Number.isFinite(n)&&n>0,`durée estimée invalide : ${n} s`);
    assert.ok(Math.abs(n-868.3830282197499)<0.001,`la formule documentée a changé : ${n} s`);
  }finally{w.close();}
});

test('Monde lot 53 T1 — les durées forfaitaires suivent les vues et ajoutent la transition',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const n=w.eval(`(()=>{const m={vues:{0:'forts',1:'resultat'}};mgmtSoireeProgramme=()=>[{i:0},{i:1}];return mgmtSoireeDureeEstimee(m);})()`);
    assert.equal(n,70);
  }finally{w.close();}
});

test('Monde lot 53 T1 — la durée forfaitaire d’une soirée complète additionne neuf transitions',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const total=w.eval(`(()=>{const m={vues:{}};mgmtSoireeProgramme=()=>Array.from({length:9},(_,i)=>({i}));for(let i=0;i<9;i++)m.vues[i]='resultat';return mgmtSoireeDureeEstimee(m);})()`);
    assert.equal(total,135);
  }finally{w.close();}
});

test('Monde lot 53 T1 — la fin annonce les primes présentes dans les relevés et échappe les noms',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const html=w.eval(`(()=>{const m={lastEvent:{cycle:7},hist:[{c:7,pr:'cs',a:{id:'a',name:'<img src=x>'},b:{id:'b',name:'B'}},{c:7,pr:'pf',winner:'A',a:{id:'a',name:'<img src=x>'},b:{id:'c',name:'C'}}]};return mgmtSoPrimesFinHtml(m);})()`);
    assert.equal((html.match(/class="so3-prime"/g)||[]).length,2);
    assert.match(html,/COMBAT DE LA SOIRÉE/);
    assert.match(html,/PERFORMANCE DE LA SOIRÉE/);
    assert.doesNotMatch(html,/<img/);
    assert.match(html,/&lt;img/i);
    const css=require('fs').readFileSync('ui-cadre.css','utf8');
    assert.match(css,/\.so3-primes\s*\{/);
    assert.match(css,/\.so3-prime\s*\{/);
    assert.match(css,/\.so3-fin\s*\{/);
  }finally{w.close();}
});

test('Monde lot 53 T1 — la fin annonce le combat de la soirée et les deux performances du relevé',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const html=w.eval(`(()=>{const m={lastEvent:{cycle:8,finance:{primes:15}},hist:[
      {c:8,pr:'cs',a:{id:'a',name:'Alpha'},b:{id:'b',name:'Bravo'}},
      {c:8,pr:'pf',winner:'A',a:{id:'c',name:'Charlie'},b:{id:'d',name:'Delta'}},
      {c:8,pr:'pf',winner:'A',a:{id:'e',name:'Echo'},b:{id:'f',name:'Foxtrot'}}],
      facts:[{k:'prime',type:'pf',fight:1,a:'d'},{k:'prime',type:'pf',fight:2,a:'f'}]};
      mgmtSoireeProgramme=()=>m.hist.map((t,h)=>({h}));return mgmtSoPrimesFinHtml(m);})()`);
    assert.equal((html.match(/class="so3-prime"/g)||[]).length,3);
    assert.match(html,/ALPHA · BRAVO/);
    assert.match(html,/>DELTA</);
    assert.match(html,/>FOXTROT</);
  }finally{w.close();}
});

test('Monde lot 53 T1 — la fin de soirée expose la salle finale et le lendemain existant',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(5311);const m=mgmtPasseGenerer('split',{soirees:3});G.mgmt=m;mgmtRetraitProb=()=>0;CL.mgmtEnter(1);`);
    jouerSoirees(w,1);
    const html=w.eval(`(()=>{const m=G.mgmt,p=mgmtSoireeProgramme(m);return mgmtSoFinHtml(m,p);})()`);
    const header=w.eval(`mgmtSoEnteteFin(G.mgmt,mgmtSoireeProgramme(G.mgmt))`);
    const screen=w.eval(`(()=>{MGMT_SOIREE.index=mgmtSoireeProgramme(G.mgmt).length;MGMT_SOIREE_UI.focus=null;G.screen='mgmt_soiree';mgmtProchaineChose=()=>({texte:'rappel de test',onclick:''});return scr_mgmt_soiree_cadre();})()`);
    /* Décision : planches Uni* validées par Anthony ; le titre vit dans l'en-tête commun, pas une seconde fois dans le contenu. */
    assert.match(html,/aria-label="Fin de soirée"/);
    assert.match(header,/FIN DE SOIRÉE/);
    assert.match(header,/Ce soir/);
    assert.match(header,/FIGHT NIGHT/);
    assert.match(header,/\/\s*\d+/);
    /* Décision : planches Uni* validées par Anthony ; l'en-tête de fin garde date, lieu et numéro d'événement. */
    assert.match(header,/mf-so-chip"><b>[^<]+<\/b><span>[^<]+<\/span><\/div>/);
    assert.match(header,/mf-so-chip org"><b>[^<]+ FIGHT NIGHT<\/b><b class="r">\d+<\/b>/);
    /* Décision : planches Uni* validées par Anthony ; compteur à côté de la plaque du titre. */
    assert.match(header,/<div class="mf-plaque"><span>FIN DE SOIRÉE<\/span><\/div><b class="mf-so-cpt">\d+ \/ \d+<\/b>/);
    assert.doesNotMatch(header,/mf-so-pips/);
    /* Décision : planches Uni* validées par Anthony ; l'écran suit la planche, sans bandeau d'étape suivant. */
    assert.match(screen,/FIN DE SOIRÉE/);
    assert.match(screen,/class="so3-fin-recomposee"/);
    assert.doesNotMatch(screen,/mf-prise|rappel de test/);
    /* Décision : planches Uni* validées par Anthony ; la fin n'affiche pas les commandes de vues du combat en cours. */
    assert.doesNotMatch(screen,/TEMPS FORTS|COMPLET/);
    /* Décision : planches Uni* validées par Anthony ; l'écran suit la planche. */
    assert.match(html,/class="so3-fin-soiree"/);
    /* Décision : planches Uni* validées par Anthony ; les données réelles déterminent les cartes, sans les réduire quand deux performances existent. */
    assert.match(html,/class="so3-fin-cartes"/);
    assert.equal((html.match(/class="so3-fin-prime performance"/g)||[]).length,2);
    assert.match(html,/LA SALLE/);
    assert.match(html,/LA SOIRÉE/);
    assert.match(html,/L'AMBIANCE À LA FIN/);
    assert.equal((html.match(/<i class="(?:on)?"><\/i>/g)||[]).length,10);
    assert.match(html,/LA RECETTE/);
    /* Décision : planches Uni* validées par Anthony ; les cartes portent leur rôle explicitement plutôt que par leur position. */
    assert.equal((html.match(/class="so3-fin-prime (?:combat|performance)"/g)||[]).length,3);
    assert.match(html,/class="so3-fin-prime combat"/);
    /* Décision : planches Uni* validées par Anthony ; le combat occupe la carte principale avant les performances. */
    assert.ok(html.indexOf('class="so3-fin-prime combat"')<html.indexOf('class="so3-fin-prime performance"'));
    /* Décision : planches Uni* validées par Anthony ; les deux noms du combat sont empilés dans la carte claire. */
    assert.match(html,/class="so3-fin-prime combat"[\s\S]*?<strong><span>[^<]+<\/span><span>[^<]+<\/span><\/strong>/);
    assert.equal((html.match(/class="so3-fin-prime performance"/g)||[]).length,2);
    /* Décision : planches Uni* validées par Anthony ; l'écran suit la planche. */
    assert.match(html,/COMBAT DE LA SOIRÉE/);
    assert.match(html,/PERFORMANCE DE LA SOIRÉE/);
    assert.match(html,/PRIMES PAYÉES/);
    /* Décision : planches Uni* validées par Anthony ; sous la recette, le libellé est « primes payées », sans répéter le total. */
    assert.match(html,/<small>PRIMES PAYÉES<\/small>/);
    assert.doesNotMatch(html,/<small>PRIMES PAYÉES ·/);
    /* Décision : planches Uni* validées par Anthony ; l'écran suit la planche, avec les actions visibles au-dessus de la barre de touches. */
    assert.match(html,/class="so3-fin-actions"[^>]*>[\s\S]*Tous les résultats[\s\S]*Le lendemain/);
    /* Décision : planches Uni* validées par Anthony ; les deux actions de fin gardent leur libellé et leur touche. */
    assert.match(html,/<span class="mf-k">R<\/span><span class="mf-bouton-t">Tous les résultats<\/span>/);
    assert.match(html,/<span class="mf-k">Entrée<\/span><span class="mf-bouton-t">Le lendemain<\/span>/);
    /* Décision : planches Uni* validées par Anthony ; noms, salle et pastilles reprennent leurs tailles et formes de la planche. */
    const css=require('fs').readFileSync('ui-cadre.css','utf8');
    assert.match(css,/\.so3-fin-prime\.combat strong\{font-size:104px;line-height:\.8\}/);
    assert.match(css,/\.so3-fin-prime\.performance strong\{font-size:92px;line-height:\.8\}/);
    assert.match(css,/\.so3-fin-salle b,\.so3-fin-recette b\{font-family:var\(--mf-titre\);font-size:64px;line-height:\.8\}/);
    assert.match(css,/\.so3-fin-ambiance i\{width:34px;height:34px;flex:none/);
    assert.match(css,/\.so3-fin-recomposee\{[^}]*grid-template-rows:470px 280px 64px/);
    assert.match(css,/\.so3-fin-actions\{[^}]*justify-content:flex-end/);
    assert.doesNotMatch(html,/SPLIT FIGHT NIGHT TERMINÉE|OÙ EN EST LA SOIRÉE|mf-so-fcw|mf-so-ph/);
  }finally{w.close();}
});

test('Monde lot 53 T1 — toutes les classes so3 des écrans ont une règle de style',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(5312);const m=mgmtPasseGenerer('split',{soirees:3});G.mgmt=m;mgmtRetraitProb=()=>0;CL.mgmtEnter(1);`);
    jouerSoirees(w,1);
    const classes=w.eval(`(()=>{const m=G.mgmt,p=mgmtSoireeProgramme(m),html=[mgmtSoOuvertureHtml(m,p),mgmtSoEntreHtml(m,p,0,0),mgmtSoFinHtml(m,p),mgmtSoResultatSeulHtml(m,p[0])].join(' '),out=new Set();for(const x of html.matchAll(/class="([^"]+)"/g))for(const c of x[1].split(/\\s+/))if(c.startsWith('so3-'))out.add(c);return Array.from(out);})()`);
    const css=require('fs').readFileSync('ui-cadre.css','utf8');
    const absentes=Array.from(classes).filter(c=>!new RegExp(`\\.${c.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}[^{}]*\\{`).test(css));
    assert.deepEqual(absentes,[]);
  }finally{w.close();}
});

test('Monde lot 53 T1 — le panneau de combat rend les trois vues réglables',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(5304);const m=mgmtPasseGenerer('split',{soirees:3});G.mgmt=m;mgmtRetraitProb=()=>0;CL.mgmtEnter(1);`);
    jouerSoirees(w,1);
    const r=w.eval(`(()=>{const p=mgmtSoireeProgramme(G.mgmt);const html=mgmtSoEntreHtml(G.mgmt,p,0,0),ouverture=mgmtSoOuvertureHtml(G.mgmt,p);return {html,ouverture,selected:MGMT_SOIREE_UI.focus};})()`);
    for(const label of ['COMPLET','TEMPS FORTS','RÉSULTAT']) assert.ok(r.html.includes(label),label);
    /* Décision : planches Uni* validées par Anthony ; l'écran suit la planche. */
    assert.match(r.html,/LE PROCHAIN/);
    assert.match(r.html,/class="so3-prochain so3-prochain-panneau"/);
    assert.match(r.html,/class="so3-bandeau"/);
    assert.match(r.ouverture,/title="Changer la vue avec V"/);
    const css=require('fs').readFileSync('ui-cadre.css','utf8');
    assert.match(css,/\.so3-vue:focus-visible\s*\{[^}]*outline:3px solid #F0B220/);
    assert.equal(r.selected,null);
  }finally{w.close();}
});

/* ==== [ANCRE: MONDE65T1_TEST_CARTE_NEUF_COMBATS] — Monde lot 65 T1 ==== */
test('Monde lot 65 T1 — la soirée en cours expose ses neuf lignes, bandeau et vues par combat',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(6501);const m=mgmtPasseGenerer('split',{soirees:3});G.mgmt=m;mgmtRetraitProb=()=>0;CL.mgmtEnter(1);`);
    jouerSoirees(w,1);
    const html=w.eval(`(()=>{const m=G.mgmt,p=mgmtSoireeProgramme(m);return mgmtSoEntreHtml(m,p,0,0);})()`);
    /* Décision : planches Uni* validées par Anthony ; l'écran suit la planche. */
    assert.equal((html.match(/class="so3-ligne/g)||[]).length,9);
    assert.equal((html.match(/class="so3-vue(?: choisi)?"/g)||[]).length,27);
    for(const bloc of ['so3-bandeau','so3-carte','so3-prochain-panneau','LA SALLE',"L'AMBIANCE",'LA RECETTE','LA CARTE','LE PROCHAIN','TU LE REGARDES EN']) assert.ok(html.includes(bloc),bloc);
    const css=require('fs').readFileSync('ui-cadre.css','utf8');
    for(const classe of ['so3-tableau','so3-bandeau','so3-corps','so3-carte','so3-ligne','so3-rang','so3-categorie','so3-noms','so3-carte-vues','so3-prochain-panneau','so3-prochain-noms','so3-prochain-vue']){
      assert.match(css,new RegExp(`\\.${classe}[^{}]*\\{`),`règle absente pour .${classe}`);
    }
  }finally{w.close();}
});

test('Monde lot 53 T1 — la frise des temps forts reflète le moment actif',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const html=w.eval(`(()=>{MGMT_COMBAT.vueCombat='forts';MGMT_COMBAT.tempsFortActif=1;MGMT_COMBAT.tempsForts=[{raison:'Ouverture'},{raison:'Finition <test>'}];return mgmtCombatFriseHtml();})()`);
    assert.match(html,/so3-frise/);
    assert.match(html,/aria-label="Frise des 2 moments forts"/);
    assert.equal((html.match(/class="so3-moment/g)||[]).length,2);
    assert.match(html,/actif/);
    assert.match(html,/Finition &lt;test&gt;/);
    assert.match(html,/aria-current="step"/);
    assert.match(html,/Moment 1, passé : Ouverture/);
    assert.match(html,/Moment 2, en cours : Finition &lt;test&gt;/);
    assert.match(html,/Entrée/);
    assert.match(html,/Continuer au verdict/);
    const css=require('fs').readFileSync('ui-cadre.css','utf8');
    for(const c of ['so3-frise','so3-moment','so3-moment b','so3-moment span','so3-moment.actif','so3-moment.passe','so3-frise-aide','so3-frise-aide span','so3-frise-aide kbd'])assert.match(css,new RegExp(`\\.${c.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}\\s*\\{`));
  }finally{w.close();}
});

test('Monde lot 53 T1 — la lecture accélère hors des fenêtres et garde la vitesse normale dedans',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const result=w.eval(`(()=>{const C=MGMT_COMBAT;C.session={dureeAffichage:100};C.refuse=false;C.pause=false;C.real=0;C.mode='fight';C.d=0;C.fin=0;C.queue=5;C.tempsForts=[{t:350},{t:700}];
      mgmtCombatAvancer(0.01);const entree=C.vitesse,position=C.d;C.d=20;mgmtCombatAvancer(0.01);return {entree,position,hors:C.vitesse,vitesseRapide:typeof MGMT_TF_VITESSE==='number'?MGMT_TF_VITESSE:8};})()`);
    assert.equal(result.entree,1);
    assert.ok(result.position>0);
    assert.ok(result.hors===1||result.hors===result.vitesseRapide);
  }finally{w.close();}
});

test('Monde lot 53 T1 — le calcul temps forts reste borné et respecte l’ordre chronologique',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(5306);const m=mgmtPasseGenerer('split',{soirees:3});G.mgmt=m;mgmtRetraitProb=()=>0;CL.mgmtEnter(1);`);
    jouerSoirees(w,1);
    const result=w.eval(`(()=>{const p=mgmtSoireeProgramme(G.mgmt)[0], moments=mgmtTempsFortsChoisir(G.mgmt,p);return {moments,duree:mgmtTempsFortsDuree(G.mgmt,p)};})()`);
    assert.ok(result.moments.length>=4&&result.moments.length<=8);
    assert.deepEqual(Array.from(result.moments,x=>x.t),Array.from(result.moments,x=>x.t).slice().sort((a,b)=>a-b));
    assert.ok(result.duree>=30&&result.duree<=60,`durée observée: ${result.duree}s`);
  }finally{w.close();}
});

test('Monde lot 53 T1 — la touche V règle la vue du combat sélectionné',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(5307);const m=mgmtPasseGenerer('split',{soirees:3});G.mgmt=m;mgmtRetraitProb=()=>0;CL.mgmtEnter(1);`);
    jouerSoirees(w,1);
    const r=w.eval(`(()=>{G.screen='mgmt_soiree';MGMT_SOIREE_UI.focus=0;mgmtVueCombatChoisir(0,'complet');return {avant:mgmtVueDuCombat(G.mgmt,0),html:mgmtSoOuvertureHtml(G.mgmt,mgmtSoireeProgramme(G.mgmt))};})()`);
    assert.equal(r.avant,'complet');
    assert.match(r.html,/COMBAT|PRÉLIM/);
  }finally{w.close();}
});

test('Monde lot 53 T1 — V règle aussi le combat sélectionné sur la carte d’ouverture',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(5320);const m=mgmtPasseGenerer('split',{soirees:3});G.mgmt=m;mgmtRetraitProb=()=>0;CL.mgmtEnter(1);`);
    jouerSoirees(w,1);
    const r=w.eval(`(()=>{G.screen='mgmt_soiree';MGMT_SOIREE_UI.commence=null;MGMT_SOIREE_UI.focus=1;MGMT_SOIREE.index=0;mgmtSoTouche('v')();return {focus:MGMT_SOIREE_UI.focus,vue:mgmtVueDuCombat(G.mgmt,1),screen:G.screen};})()`);
    assert.equal(r.focus,1);
    assert.equal(r.vue,'forts');
    assert.equal(r.screen,'mgmt_soiree');
  }finally{w.close();}
});

test('Monde lot 53 T1 — le sélecteur expose son état de vue choisi',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(5321);const m=mgmtPasseGenerer('split',{soirees:3});G.mgmt=m;mgmtRetraitProb=()=>0;CL.mgmtEnter(1);`);
    jouerSoirees(w,1);
    const result=w.eval(`(()=>{const p=mgmtSoireeProgramme(G.mgmt);mgmtVueCombatChoisir(p[0].i,'forts');return mgmtSoOuvertureHtml(G.mgmt,p);})()`);
    assert.match(result,/aria-label="Vue du combat 1 : TEMPS FORTS" aria-valuetext="TEMPS FORTS"/);
    const defaultView=w.eval(`(()=>{mgmtVueCombatChoisir(mgmtSoireeProgramme(G.mgmt)[1].i,'complet');return mgmtSoOuvertureHtml(G.mgmt,mgmtSoireeProgramme(G.mgmt));})()`);
    assert.match(defaultView,/aria-label="Vue du combat 2 : COMPLET" aria-valuetext="COMPLET"/);
  }finally{w.close();}
});

test('Monde lot 53 T1 — les repères de temps forts conservent l’ordre et l’échappement dans la frise',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const html=w.eval(`(()=>{MGMT_COMBAT.vueCombat='forts';MGMT_COMBAT.tempsFortActif=0;MGMT_COMBAT.tempsForts=[{t:0,raison:'Ouverture <test>'},{t:30,raison:'Fin du combat'}];return mgmtCombatFriseHtml();})()`);
    assert.ok(html.indexOf('Ouverture &lt;test&gt;')<html.indexOf('Fin du combat'));
    assert.match(html,/class="so3-moment actif"[^>]*aria-current="step"/);
    assert.match(html,/class="so3-moment"[^>]*aria-label="Moment 2, à venir/);
    assert.doesNotMatch(html,/<test>/);
  }finally{w.close();}
});

test('Monde lot 53 T1 — Entrée passe le combat en temps forts au verdict et la frise fond brièvement',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const r=w.eval(`(()=>{MGMT_COMBAT.session={};MGMT_COMBAT.vueCombat='forts';MGMT_COMBAT.mode='fight';MGMT_COMBAT.refuse=false;CL.mgmtCbRetour();return MGMT_COMBAT.mode;})()`);
    assert.equal(r,'dec');
    const css=require('fs').readFileSync('ui-cadre.css','utf8');
    /* Décision du 07/10 (planche « Le mouvement de l’interface ») : tout le mouvement est en script, jamais en feuille de style ; le fondu de la frise est dans mgmt-combat.js. */
    assert.doesNotMatch(css,/so3-fondu/);
    assert.match(require('fs').readFileSync('mgmt-combat.js','utf8'),/so3-frise/);
  }finally{w.close();}
});

test('Monde lot 53 T1 — le fondu d’une fenêtre assombrit brièvement l’image de l’arène',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const niveaux=w.eval(`(()=>[mgmtCombatFonduFenetre(10,10),mgmtCombatFonduFenetre(10.11,10),mgmtCombatFonduFenetre(10.22,10)])()`);
    assert.equal(niveaux[0],1);
    assert.ok(niveaux[1]>0&&niveaux[1]<1);
    assert.equal(niveaux[2],0);
  }finally{w.close();}
});

test('Monde lot 53 T1 — T bascule des temps forts au combat entier sans quitter l’arène (C reste la caméra)',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const r=w.eval(`(()=>{MGMT_COMBAT.session={};MGMT_COMBAT.vueCombat='forts';MGMT_COMBAT.tempsForts=[{t:0}];MGMT_COMBAT.mode='fight';CL.mgmtCbComplet();return {vue:MGMT_COMBAT.vueCombat,frise:MGMT_COMBAT.tempsForts,mode:MGMT_COMBAT.mode};})()`);
    assert.deepEqual(JSON.parse(JSON.stringify(r)),{vue:'complet',frise:null,mode:'fight'});
  }finally{w.close();}
});

test('Monde lot 53 T1 — le rendu d’ouverture de soirée conserve les neuf combats et ses repères de navigation',()=>{
  const w=newGameWindow({runMain:true});
  try{
    w.eval(`setSeed(5310);const m=mgmtPasseGenerer('split',{soirees:3});G.mgmt=m;mgmtRetraitProb=()=>0;CL.mgmtEnter(1);`);
    jouerSoirees(w,1);
    const result=w.eval(`(()=>{G.screen='mgmt_soiree';render();return document.getElementById('app').innerHTML;})()`);
    assert.equal((result.match(/class="mf-so-lg/g)||[]).length,9);
     assert.match(result,/SOIRÉE/);
      assert.match(result,/<span>0 \/ 9 · COMBATS<\/span>/);
    assert.match(result,/Commencer la soirée/);
    assert.equal((result.match(/class="so3-vue"/g)||[]).length,9);
    assert.match(result,/aria-label="Vue du combat 1 :/);
  }finally{w.close();}
});
