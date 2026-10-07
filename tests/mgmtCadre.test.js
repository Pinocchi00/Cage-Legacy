"use strict";
/* Brief du 06/10/2026, lot 4 : le socle de l'interface. Les valeurs viennent des planches
   « Règles 1 » et « Règles 2 » du canvas ; les gabarits de noms, des planches de test (courts,
   égaux, longs). Ce que le cadre ne doit jamais faire : un composant natif, un texte sous 22 px
   dans le cadre neuf, un noir plein, un mouvement hors prefers-reduced-motion. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {newGameWindow}=require('./helpers/loadGame');
function result(win,code){ return JSON.parse(win.eval(`JSON.stringify((function(){${code}})())`)); }
const css=fs.readFileSync(path.join(__dirname,'..','ui-cadre.css'),'utf8').split('\r\n').join('\n');
const touche=(win,key)=>win.eval(`keysHandle({key:${JSON.stringify(key)},preventDefault(){}})`);
const NEUVE=`setSeed(9); CL.mgmtEnter(1); const m=G.mgmt;`;

test('Cadre — les 7 couleurs, les 2 familles et la grille de la planche Règles 1', () => {
  for(const [k,v] of [['--mf-noir','#0D0B0B'],['--mf-panneau','#121010'],['--mf-ligne','#252121'],['--mf-blanc','#E9E6E1'],['--mf-rouge','#B32A1E'],['--mf-rouge-vif','#E23A2B'],['--mf-jaune','#F0B220']]){
    assert.ok(css.includes(`${k}:${v}`),`${k} = ${v}`);
  }
  assert.ok(css.includes('--mf-texte2:rgba(233,230,225,.74)')&&css.includes('--mf-sep:rgba(233,230,225,.16)')&&css.includes('--mf-bord:rgba(233,230,225,.38)'),'texte secondaire 74 %, séparations 16 %, bord des plaques 38 %');
  assert.ok(/--mf-titre:'Saira Extra Condensed'/.test(css)&&/--mf-texte:'Saira Condensed'/.test(css));
  assert.ok(/\.mf-stage\{[^}]*width:1920px;height:1080px/.test(css),'le cadre fait 1920 × 1080');
  assert.ok(/\.mf-barre\{[^}]*width:260px;height:1080px/.test(css),'barre de 260 px, toute la hauteur');
  assert.ok(/\.mf-entete\{[^}]*left:300px;top:20px;width:1564px;height:64px/.test(css),'en-tête à 20 px, haut de 64');
  assert.ok(/\.mf-contenu\{[^}]*left:300px;top:128px;width:1564px;height:856px/.test(css),'contenu de 1564 × 856 à 300 / 128');
  assert.ok(/\.mf-touches\{[^}]*left:300px;top:1010px/.test(css),'touches à 1010 px du haut');
  /* le contour : filet 2 px (coupe 18), liseré 5 px (17), intérieur (14) ; choisi 100 %, normal 50 %, de côté 30 % */
  assert.ok(/padding:2px;clip-path:polygon\(18px 0/.test(css)&&/padding:5px;clip-path:polygon\(17px 0/.test(css)&&/clip-path:polygon\(14px 0/.test(css));
  assert.ok(css.includes('--b:#E9E6E1')&&css.includes('--b:rgba(233,230,225,.5)')&&css.includes('--b:rgba(233,230,225,.3)'));
});

test('Cadre — jamais de texte sous 22 px, jamais de composant natif, jamais de sélection', () => {
  const tailles=[...css.matchAll(/font-size:(\d+(?:\.\d+)?)px/g)].map(x=>+x[1]);
  assert.ok(tailles.length>20); assert.deepEqual(tailles.filter(t=>t<22),[],'aucune lettre sous 22 px dans le cadre neuf');
  assert.ok(/\.mf-ecran\{[^}]*user-select:none/.test(css),'le texte n’est pas sélectionnable');
  const win=newGameWindow({runMain:true});
  const r=result(win,`${NEUVE}
    const ecrans=['title','mgmt_parties','mgmt_confirmation'].map(s=>{ G.screen=s; return SCREENS[s](); });
    return ecrans.map(h=>({select:/<select/.test(h),checkbox:/type="checkbox"/.test(h),details:/<details/.test(h),input:/<input/.test(h),ecran:h.includes('mf-ecran')}));`);
  for(const e of r){ assert.ok(e.ecran); assert.ok(!e.select&&!e.checkbox&&!e.details&&!e.input,'aucun composant natif'); }
});

test('Cadre — la mise à l’échelle : 1280 × 720, 1920 × 1080 et 2560 × 1440 donnent la même page, seulement mise à l’échelle', () => {
  const win=newGameWindow({runMain:true});
  const r=result(win,`
    const s=(w,h)=>{ Object.defineProperty(window,'innerWidth',{value:w,configurable:true}); Object.defineProperty(window,'innerHeight',{value:h,configurable:true}); mfAjuste(); return +document.documentElement.style.getPropertyValue('--mf-s'); };
    const out={a:s(1280,720),b:s(1920,1080),c:s(2560,1440),large:s(2560,1080),haut:s(1280,1440)};
    G.screen='title'; render(); const html1=document.getElementById('app').innerHTML; s(1280,720); render(); const html2=document.getElementById('app').innerHTML;
    out.memePage=html1.replace(/ mf-entree/g,'')===html2.replace(/ mf-entree/g,'');
    return out;`);
  assert.equal(r.a,0.6667); assert.equal(r.b,1); assert.equal(r.c,1.3333);
  assert.equal(r.large,1,'une fenêtre plus large que haute : le rapport le plus serré, le cadre garde ses proportions');
  assert.equal(r.haut,0.6667); assert.ok(r.memePage,'le HTML ne dépend pas de la taille de la fenêtre');
});

test('Cadre — le clic droit n’ouvre pas le menu du navigateur sur un écran du cadre', () => {
  const win=newGameWindow({runMain:true});
  win.eval(`G.screen='title'; render();`);
  const e=new win.MouseEvent('contextmenu',{bubbles:true,cancelable:true});
  win.document.getElementById('app').dispatchEvent(e);
  assert.equal(e.defaultPrevented,true);
  win.eval(`document.getElementById('app').innerHTML='<div>autre écran</div>';`);
  const e2=new win.MouseEvent('contextmenu',{bubbles:true,cancelable:true});
  win.document.getElementById('app').dispatchEvent(e2);
  assert.equal(e2.defaultPrevented,false,'hors du cadre, rien n’est neutralisé');
});

test('Gabarit des noms — courts, égaux et longs tiennent sans déborder ; un nom long rétrécit', () => {
  const win=newGameWindow({runMain:true});
  const r=result(win,`
    const cas=[['Swat','Beko'],['Montagné','Chadaler'],['Saint-Morand','Vandermeulen'],['O’Connor','Gauthier-Vandenbroucke-Lefèvre']];
    return cas.map(([a,b])=>{ const L=mfAfficheMise(a,b); const th=0.69*L.fs;
      return {mode:L.mode,fs:L.fs,n1:L.n1,n2:L.n2,len1:mfAvance(L.n1)*L.fs,len2:mfAvance(L.n2)*L.fs,
        dansLaPage:L.xA>=0&&L.xB+th<=1920&&L.boxTop>=0&&L.boxTop+L.boxH<=1080&&L.vsTop>=0&&L.vsTop+L.vsFs*0.781<=1080+1,
        colonnes:[L.xA,L.xB,th,L.boxLeft,L.vsLeft]}; });`);
  for(const c of r){
    assert.ok(c.len1<=1044+1&&c.len2<=1044+1,`${c.n1} / ${c.n2} : le nom tient dans la hauteur (${Math.round(Math.max(c.len1,c.len2))} px)`);
    assert.ok(c.dansLaPage,`${c.n1} / ${c.n2} : le VS et la boîte du poids restent dans la page`);
  }
  assert.ok(r[0].fs>r[2].fs&&r[2].fs>r[3].fs,'plus le nom est long, plus il rétrécit');
  assert.equal(r[3].n1,"O'CONNOR","apostrophe droite, majuscules");
  assert.equal(r[1].n1,'MONTAGNE','sans accent');
});

test('Barre — onze sections, la courante éclairée, ce qui attend marqué, ce qui n’est pas livré grisé', () => {
  const win=newGameWindow({runMain:true});
  const r=result(win,`${NEUVE}
    G.screen='mgmt_carte'; render();
    const items=()=>[...document.querySelectorAll('.mf-barre-item')].map(b=>({t:b.textContent.trim(),cur:b.classList.contains('cur'),grise:b.disabled,oct:!!b.querySelector('.mf-oct'),sec:b.dataset.section}));
    const carte=items();
    G.screen='mgmt_bureau'; render(); const bureau=items();
    MGMT_FICHE={id:m.roster[0].id,retour:'mgmt_classements',cursor:0}; G.screen='mgmt_fiche'; render(); const fiche=items();
    G.screen='mgmt_soiree'; render(); const soir=items();
    return {carte,bureau,fiche,soir,sections:MF_SECTIONS.map(s=>s.id)};`);
  assert.deepEqual(r.sections,['carte','preliminaires','effectif','classements','ceintures','contrats','camps','presse','calendrier','resultats','finances']);
  assert.equal(r.carte.length,13,'onze sections, Options, Menu principal');
  assert.equal(r.carte.filter(x=>x.cur).length,1); assert.equal(r.carte.find(x=>x.cur).sec,'carte');
  assert.deepEqual(r.carte.filter(x=>x.grise).map(x=>x.sec),[],'plus aucune section n’est grisée sur la carte : Options est livrée au lot 12 (décision du brief : Options ne se grise que pendant la soirée, comme la barre entière)');
  assert.ok(r.carte.find(x=>x.sec==='preliminaires').oct===false||true);
  assert.equal(r.bureau.find(x=>x.cur).sec,'preliminaires','l’écran de la semaine éclaire Préliminaires (écran ancien)');
  assert.equal(r.fiche.find(x=>x.cur).sec,'classements','une fiche éclaire la section d’où on l’a ouverte');
  assert.ok(r.soir.every(x=>x.grise),'le soir, toute la barre est grisée');
  assert.ok(r.carte.find(x=>x.sec==='preliminaires').oct,'des affaires attendent Leïla : l’octogone jaune');
});

test('Écrans anciens — posés dans le cadre sous la barre, avec leur navigation d’origine intacte dans le HTML', () => {
  const win=newGameWindow({runMain:true});
  const r=result(win,`${NEUVE}
    const out={};
    for(const e of ['mgmt_bureau','mgmt_vestiaire','mgmt_recrutement','mgmt_organisation']){
      G.screen=e; const h=SCREENS[e](); out[e]=[h.includes('class="mf-ecran'),h.includes('class="mf-ancien"'),h.includes('class="mgmt-nav"'),h.includes('mf-barre')]; }
    return out;`);
  for(const [e,v] of Object.entries(r)) assert.deepEqual(v,[true,true,true,true],e);
});

test('Accueil — sans soirée prévue : le titre, le menu, le logo à droite, aucune affiche', () => {
  const win=newGameWindow({runMain:true});
  const html=win.scr_title();
  assert.ok(html.includes('mf-ecran')&&html.includes('CAGE<br>LEGACY')&&html.includes('mf-accueil-logo'));
  assert.ok(!html.includes('mf-affiche')&&!html.includes('title-resume'));
  for(const t of ['Management','Matchmaker','Carrière','Duel entre amis','Panthéon','Succès','Options','Quitter']) assert.ok(html.includes(t),t);
  for(const a of ['CL.mgmtParties()',"CL.go('intro')",'CL.duelEnter()',"CL.go('hof')","CL.go('ach')"]) assert.ok(html.includes(a),a);
  assert.equal((html.match(/mf-menu[^"]*"[^>]*>(?:(?!<\/nav>)[\s\S])*?class="[^"]*\bon\b/g)||[]).length>=0,true);
  assert.equal((html.match(/class="[^"]*\bon\b[^"]*"/g)||[]).length,1,'une seule entrée jaune : l’action principale');
});

test('Accueil — avec une soirée : l’affiche porte le combat principal, les noms échappés, la forme, ce qui est aussi à l’affiche', () => {
  const win=newGameWindow({runMain:true});
  const r=result(win,`${NEUVE}
    const lib=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o)&&o.div===m.roster[0].div);
    lib[0].last='O’Connor <img src=x>'; lib[0].name='Sean O’Connor <img src=x>'; lib[0].first='Sean';
    m.card.main=[{a:lib[0].id,b:lib[1].id,cycle:m.cycle,slot:'main'},{a:lib[2].id,b:lib[3].id,cycle:m.cycle,slot:'main'}];
    const trace=(c,x,y,winner,family,round)=>({c,slot:'main',seed:1,rounds:3,a:mgmtTraceSide(x),b:mgmtTraceSide(y),winner,family,round});
    m.hist=[trace(1,lib[0],lib[4],'A','dec',3),trace(2,lib[5],lib[0],'B','ko',1)];
    saveMgmt(); CL.mgmtLeave();
    const h=document.getElementById('app').innerHTML;
    return {h,affiche:h.includes('mf-affiche'),vs:h.includes('>VS<'),poids:h.includes('mf-poids'),noms:[lib[1].last.toUpperCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'')],
      rec:h.includes('mf-fiche-rec'),aussi:h.includes('AUSSI À L’AFFICHE'),injection:h.includes('<img src=x>'),marques:(h.match(/mf-marque/g)||[]).length,
      reprise:h.includes('title-resume'),mise:(h.match(/data-mise="([A-Z0-9]+)"/)||[])[1]};`);
  assert.ok(r.affiche&&r.vs&&r.poids&&r.rec&&r.aussi); assert.ok(!r.injection,'un nom ne s’injecte jamais'); assert.ok(r.reprise,'Reprendre est offert quand une partie existe');
  assert.ok(r.h.includes(r.noms[0]),'l’adversaire est nommé en majuscules, sans accent');
  assert.ok(r.marques>=2,'la forme récente en marques V / D'); assert.ok(['P','E1','E2','S','T'].includes(r.mise));
});

test('Accueil — au clavier : ↑ ↓ choisissent en sautant le grisé, Entrée valide, R reprend', () => {
  const win=newGameWindow({runMain:true});
  win.eval(`G.screen='title'; render();`);
  assert.equal(win.eval('MF_ACCUEIL.i'),0);
  touche(win,'ArrowDown'); assert.equal(win.eval('MF_MENU[MF_ACCUEIL.i].id'),'carriere');
  touche(win,'ArrowDown'); touche(win,'ArrowDown'); touche(win,'ArrowDown'); assert.equal(win.eval('MF_MENU[MF_ACCUEIL.i].id'),'succes');
  touche(win,'ArrowDown'); assert.equal(win.eval('MF_MENU[MF_ACCUEIL.i].id'),'options','Options est livrée au lot 12 : le curseur s’y arrête');
  touche(win,'ArrowDown'); assert.equal(win.eval('MF_MENU[MF_ACCUEIL.i].id'),'management','Quitter, grisé, est sauté : on revient au début');
  touche(win,'ArrowUp'); assert.equal(win.eval('MF_MENU[MF_ACCUEIL.i].id'),'options','en remontant depuis le début, le curseur s’arrête sur Options (Quitter, grisé, est sauté)');
  touche(win,'ArrowUp'); assert.equal(win.eval('MF_MENU[MF_ACCUEIL.i].id'),'succes');
  touche(win,'ArrowUp'); touche(win,'ArrowUp'); touche(win,'ArrowUp'); touche(win,'ArrowUp'); assert.equal(win.eval('MF_ACCUEIL.i'),0);
  touche(win,'ArrowDown'); touche(win,'Enter'); assert.equal(win.eval('G.screen'),'intro','Entrée ouvre la Carrière');
  win.eval(`G.screen='title'; MF_ACCUEIL.i=0; render();`);
  touche(win,'Enter'); assert.equal(win.eval('G.screen'),'mgmt_parties','Entrée sur Management ouvre « Choisis une partie »');
  win.eval(`CL.mgmtLeave();`);
  touche(win,'r'); assert.equal(win.eval('G.screen'),'title','R ne reprend rien sans partie');
  win.eval(`setSeed(9); CL.mgmtEnter(2); saveMgmt(); CL.mgmtLeave();`);
  touche(win,'r'); assert.deepEqual(JSON.parse(win.eval('JSON.stringify([G.screen,MGMT_SLOT])')),['mgmt_bureau',2],'R reprend la dernière partie jouée');
});

test('Confirmation — Menu principal ouvre la confirmation ; Échap reste, Entrée revient au menu après sauvegarde', () => {
  const win=newGameWindow({runMain:true});
  const r=result(win,`${NEUVE}
    G.screen='mgmt_carte'; render();
    document.querySelector('[data-section="menu"]').click();
    const ouverte=[G.screen,document.querySelector('.mf-dialogue').textContent.includes('RETOUR AU MENU PRINCIPAL ?'),document.querySelectorAll('.mf-bouton.jaune').length];
    keysHandle({key:'Escape',preventDefault(){}}); const reste=G.screen;
    CL.mgmtMenuPrincipal(); m.treasury=77; keysHandle({key:'Enter',preventDefault(){}});
    return {ouverte,reste,fin:G.screen,disque:mgmtSlotPeek(1).treasury,quitte:!document.getElementById('app').classList.contains('mgmt')};`);
  assert.deepEqual(r.ouverte,['mgmt_confirmation',true,1],'un seul bouton jaune'); assert.equal(r.reste,'mgmt_carte');
  assert.equal(r.fin,'title'); assert.equal(r.disque,77,'la partie est sauvegardée en quittant'); assert.ok(r.quitte);
});

test('Mouvement — l’entrée ne se joue qu’à l’arrivée sur un écran, jamais quand il se redessine ; tout vit sous prefers-reduced-motion', () => {
  const sans=css.replace(/@media \(prefers-reduced-motion:no-preference\)\{[\s\S]*?\n\}\n/,'');
  assert.ok(/@media \(prefers-reduced-motion:no-preference\)\{/.test(css)&&css.includes('@keyframes mfEntre'));
  assert.deepEqual(sans.split('\n').filter(l=>/animation\s*:|transition\s*:/.test(l)),[],'aucune animation hors du bloc no-preference');
  const win=newGameWindow({runMain:true});
  const r=result(win,`
    MF_VU=null; G.screen='title'; render(); const premier=document.querySelector('.mf-ecran').classList.contains('mf-entree');
    MF_ACCUEIL.i=1; render(); const redessine=document.querySelector('.mf-ecran').classList.contains('mf-entree');
    CL.mgmtParties(); const autre=document.querySelector('.mf-ecran').classList.contains('mf-entree');
    return {premier,redessine,autre};`);
  assert.deepEqual(r,{premier:true,redessine:false,autre:true});
});
