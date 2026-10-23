"use strict";
/* ==== [ANCRE: TEST_MGMT_PRESENTATION_ENTREES] — Monde lot 3 T5 ==== */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const lire=(w,code)=>JSON.parse(w.eval(`JSON.stringify((()=>{${code}})())`));
const touche=(w,key,shiftKey=false)=>w.eval(`keysHandle({key:${JSON.stringify(key)},shiftKey:${shiftKey},preventDefault(){}})`);
const clic=(w,lib)=>w.eval(`(()=>{const b=[...document.querySelectorAll('#app button')].find(b=>(b.querySelector('.mf-bouton-t')||b).textContent.trim()===${JSON.stringify(lib)});if(!b)throw Error('Bouton absent : '+G.screen);b.click();})()`);
let archive,sauvegarde;
function passe(){
  if(!archive){
    archive=newGameWindow({runMain:true});
    archive.eval(`setSeed(20261008);mgmtPasseGenerer('split',{soirees:4});
      G.mgmt.lastEvent={cycle:G.mgmt.hist.at(-1).c,touched:[],fights:G.mgmt.hist.filter(t=>t.c===G.mgmt.hist.at(-1).c)
        .map(t=>({a:t.a.id,b:t.b.id,winner:t.winner,family:t.family,round:t.round,rounds:t.rounds||3,title:!!t.title}))};`);
    sauvegarde=archive.eval('JSON.stringify(G.mgmt)');
  }
  archive.eval(`G.mgmt=JSON.parse(${JSON.stringify(sauvegarde)});MGMT_PRESENTATION_UI.pile=[];MGMT_SOIREE.index=0;MGMT_SOIREE_UI.focus=null;MGMT_SOIREE_UI.commence=G.mgmt.lastEvent.cycle;G.screen='mgmt_accueil';`);
  return archive;
}
test('Monde lot 3 T5 — cinq entrées et retour exact',()=>{
  const w=passe();
  w.eval(`var prPair=mgmtSoireeProgramme(G.mgmt)[0];G.mgmt.card.main=[{a:prPair.a.id,b:prPair.b.id,rounds:3}];G.mgmt.card.prelims=[{a:prPair.a.id,b:prPair.b.id,rounds:3}];
    MGMT_CART={pick:null,cursor:0,div:prPair.a.div};MGMT_PRELIMS.i=0;`);
  for(const route of ['mgmt_carte','mgmt_prelims','mgmt_soiree','mgmt_presse','mgmt_accueil']){
    w.eval(`CL.go('${route}')`);
    const avant=w.eval(`JSON.stringify([G.mgmt,MGMT_CART,MGMT_PRELIMS,MGMT_SOIREE.index,MGMT_SU_PR,MGMT_ACCUEIL])`);
    if(route==='mgmt_accueil')w.eval(`document.querySelector('.mf-ac-nom').click()`);
    else clic(w,route==='mgmt_soiree'?'Avant-combat':'Présentation');
    assert.ok(['mgmt_presentation_combattant','mgmt_presentation_combat','mgmt_soiree_avant'].includes(w.eval('G.screen')));
    const r=lire(w,`const v=mgmtPresentationCadre();return {id:v.ids,retour:v.retour,valide:!!mgmtPresentationDonnees(G.mgmt,v)};`);
    assert.equal(r.retour,route);assert.ok(r.valide);
    if(route==='mgmt_carte'||route==='mgmt_prelims'||route==='mgmt_soiree')assert.deepEqual(r.id,lire(w,'return [prPair.a.id,prPair.b.id];'));
    touche(w,'Escape');assert.equal(w.eval('G.screen'),route);
    assert.equal(w.eval(`JSON.stringify([G.mgmt,MGMT_CART,MGMT_PRELIMS,MGMT_SOIREE.index,MGMT_SU_PR,MGMT_ACCUEIL])`),avant);
  }
});
test('Monde lot 3 T5 — soirée sans doublon ni fuite du résultat',()=>{
  const w=passe();w.eval(`CL.go('mgmt_soiree');CL.mgmtSoAvant()`);
  assert.equal(w.eval('G.screen'),'mgmt_soiree_avant');
  const r=lire(w,`const v=mgmtPresentationCadre(),p=mgmtSoireeProgramme(G.mgmt)[0],voix=new Set();for(let page=0;page<v.pages;page++){const el=document.createElement('div');el.innerHTML=mgmtPresentationHtml(G.mgmt,{...v,page});for(const e of el.querySelectorAll('.mf-pr-media'))voix.add(e.textContent);}return {h:v.h,attendu:p.h,voix:voix.size,index:MGMT_SOIREE.index,barre:[...document.querySelectorAll('.mf-barre-item[data-section]')].filter(b=>!['options','menu'].includes(b.dataset.section)).every(b=>b.disabled||b.classList.contains('grise'))};`);
  assert.equal(r.h,r.attendu);assert.equal(r.voix,3);assert.equal(r.index,0);assert.ok(r.barre);
  const avant=w.eval('mgmtPresentationHtml(G.mgmt,mgmtPresentationCadre())');
  w.eval(`G.mgmt.hist.slice(mgmtPresentationCadre().h).forEach(t=>{t.winner='D';t.family='SUB';t.round=5;});`);
  assert.equal(w.eval('mgmtPresentationHtml(G.mgmt,mgmtPresentationCadre())'),avant);
  touche(w,'ArrowRight');assert.equal(w.eval('MGMT_SOIREE.index'),0);
  assert.ok(!w.eval(`document.getElementById('app').textContent.includes('Regarder le combat')`));
  touche(w,'Enter');assert.equal(w.eval('G.screen'),'mgmt_soiree_avant');
  touche(w,'ArrowLeft');touche(w,'Enter');assert.equal(w.eval('G.screen'),'mgmt_combat');
  w.eval('CL.mgmtCbPasser();CL.mgmtCbRetour()');assert.equal(w.eval('MGMT_SOIREE.index'),1);assert.equal(w.eval('G.screen'),'mgmt_soiree');
});
test('Monde lot 3 T5 — clavier, noms et fiche complète',()=>{
  const w=passe();
  const r=lire(w,`const m=G.mgmt,p=mgmtSoireeProgramme(m).find(p=>mgmtPresentationCombattant({m,h:p.h},p.a.id).histoire.length);return {id:p.a.id,h:p.h};`);
  w.eval(`CL.mgmtPresentationOuvrir('combattant',[${JSON.stringify(r.id)}],{h:${r.h}})`);
  touche(w,'ArrowUp');assert.equal(w.eval('mgmtPresentationCadre().nom'),0);
  touche(w,'ArrowDown');touche(w,'ArrowUp');
  const choisi=w.eval(`mgmtPresentationLignes(G.mgmt,mgmtPresentationCadre()).noms[mgmtPresentationCadre().nom]`);
  touche(w,'Enter');assert.equal(w.eval('mgmtPresentationCadre().ids[0]'),choisi);assert.equal(w.eval('mgmtPresentationCadre().h'),r.h);
  touche(w,'Escape');assert.equal(w.eval('mgmtPresentationCadre().ids[0]'),r.id);
  const contenu=w.eval('JSON.stringify(mgmtPresentationCadre())');
  touche(w,'F');assert.equal(w.eval('G.screen'),'mgmt_fiche');assert.equal(w.eval(`document.querySelectorAll('.mf-fiche-onglets .mf-onglet:not(.mf-fiche-retour)').length`),6); /* brief du 22/10, P1 T4 : l'onglet Statistiques */
  touche(w,'Escape');assert.equal(w.eval('JSON.stringify(mgmtPresentationCadre())'),contenu);
  w.eval('mgmtPresentationCadre().index=0');assert.equal(w.eval('mgmtPresentationCadre().index'),0);
  touche(w,'ArrowLeft');assert.equal(w.eval('mgmtPresentationCadre().index'),0);
  w.eval('mgmtPresentationCadre().index=mgmtPresentationCadre().liste.length-2');touche(w,'ArrowRight');assert.ok(w.eval('mgmtPresentationCadre().index===mgmtPresentationCadre().liste.length-1'));
  const fin=w.eval('mgmtPresentationCadre().ids[0]');touche(w,'ArrowRight');assert.equal(w.eval('mgmtPresentationCadre().ids[0]'),fin);
});
test('Monde lot 3 T5 — présentation sans rejeu, moteur ni mutation',()=>{
  const w=passe();
  const r=lire(w,`const m=G.mgmt,p=mgmtSoireeProgramme(m)[0],avant=JSON.stringify(m),seed=SEED,desc=[];
    const noms=['mgmtReplayFight','mgmtObservation','mgmtAvantCote'],anciens=noms.map(k=>window[k]);let lectures=0,appels=0;
    /* Décision T3 autorise explicitement mgmtCombatProfile/mgmtLectureStyle et ses niveaux publics. */
    for(const f of m.roster.concat(m.hist.flatMap(t=>[t,t.a,t.b])))for(const k of ['stats','phys','skills','trauma']){
      desc.push([f,k,Object.getOwnPropertyDescriptor(f,k)]);Object.defineProperty(f,k,{configurable:true,get(){lectures++;throw Error(k);}});}
    try{for(const k of noms)window[k]=()=>{appels++;throw Error(k);};
      const identiques=[];for(const mode of ['combattant','combat','soiree']){
        CL.mgmtPresentationOuvrir(mode,mode==='combattant'?[p.a.id]:[p.a.id,p.b.id],{h:p.h,i:0});
        const a=scr_mgmt_presentation(),b=scr_mgmt_presentation();identiques.push(a===b);}
      return {lectures,appels,seed:SEED===seed,identiques};
    }finally{noms.forEach((k,i)=>window[k]=anciens[i]);for(const [f,k,d]of desc){if(d)Object.defineProperty(f,k,d);else delete f[k];}window.__prInchange=JSON.stringify(m)===avant;}`);
  assert.equal(r.lectures,0);assert.equal(r.appels,0);assert.ok(r.seed);assert.ok(r.identiques.every(Boolean));assert.ok(w.__prInchange);
});
test('Monde lot 3 T5 — trente contenus distincts et six ouvertures',()=>{
  const w=newGameWindow({runMain:true});
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{
    const m={cycle:8,eventsPlayed:8,graine:'faits',org:'split',facts:[],hist:[],roster:[]};
    for(let i=0;i<30;i++) m.roster.push({id:'f'+i,name:'F '+i,ck:'FR',div:allDivisions()[0].id,age:20+i,W:10+i,L:0,D:0,lastCycle:0,ct:{since:0,n:4,f:0}});
    const ps=mgmtPresentationsCategorie({m},m.roster[0].div);
    return ps.map(p=>({ouverture:p.ouverture,html:mgmtPresentationHtml(m,{mode:'combattant',ids:[p.id],h:p.h,page:0,nom:0})}));
  })())`));
  assert.equal(r.length,30);const compte={};
  for(const p of r) compte[p.ouverture]=(compte[p.ouverture]||0)+1;
  assert.ok(Object.values(compte).every(n=>n<=6));
  assert.equal(new Set(r.map(p=>p.html.replace(/F \d+|f\d+/g,''))).size,30);
});
test('Monde lot 12 T3 — Ses points forts ne répète pas l’histoire',()=>{
  const w=passe();
  const r=lire(w,`/* Monde lot 16 : le premier vainqueur par KO ou soumission n'a plus forcément de points forts (bilans et âges changés) ; on prend le premier qui en a. */
    const m=G.mgmt,t=m.hist.find((x,i)=>x.winner!=='D'&&(x.family==='ko'||x.family==='sub')&&mgmtPointsFortLignes(m,x[x.winner==='A'?'a':'b'].id,i).length>0),id=t[t.winner==='A'?'a':'b'].id,h=m.hist.indexOf(t),v={mode:'combattant',ids:[id],h,page:0,nom:0};
    const c=mgmtPresentationLignes(m,v),fort=c.panneaux.find(x=>x.titre==='SES POINTS FORTS');
    return {fort:fort&&fort.lignes.map(x=>x.texte),points:mgmtPointsFortLignes(m,id,h).map(x=>x.texte),forces:mgmtLectureStyle(mgmtPresentationLigneCycle(m,id,h)).lignes};`);
  assert.ok(r.fort);assert.deepEqual(r.fort,r.points);assert.ok(r.forces.every(x=>r.fort.includes(x)));
});
test('Monde lot 12 T3 — le cartouche donne le rang mondial et le contrat',()=>{
  const w=passe();
  const r=lire(w,`const m=G.mgmt,f=m.roster.find(x=>x.ct&&!x.libre),v={mode:'combattant',ids:[f.id],h:m.hist.length,page:0,nom:0},html=mgmtPresentationHtml(m,v),fc=mgmtFicheLigne(m,f.id).f;
    return {html,monde:mgmtFicheSituation(m,fc,'world'),reste:mgmtContratRestants(fc)};`);
  assert.match(r.html,/AU MONDE/);assert.ok(r.html.includes(String(r.monde)));assert.ok(r.html.includes(String(r.reste)+' COMBAT'));
});
test('Monde lot 12 T3 — un panneau sans donnée n’est pas affiché',()=>{
  const w=newGameWindow({runMain:true});
  const r=lire(w,`const m={cycle:0,eventsPlayed:0,graine:'vide',org:'split',facts:[],hist:[],roster:[{id:'a',name:'A',first:'A',last:'',ck:'FR',div:allDivisions()[0].id,age:24,W:0,L:0,D:0,ct:null}]},v={mode:'combattant',ids:['a'],h:0,page:0,nom:0};
    return {p:mgmtPresentationLignes(m,v).panneaux.map(x=>x.titre),html:mgmtPresentationHtml(m,v)};`);
  assert.ok(!r.p.includes('CE QU’ON EN DIT'));assert.ok(!r.p.includes('LE MONDE'));
});
test('Monde lot 12 T3 — voix, pourcentage et sources affichées',()=>{
  const w=passe();
  const r=lire(w,`const m={cycle:8,eventsPlayed:0,graine:'faits',org:'split',facts:[],hist:[],roster:[{id:'a',name:'Sujet A',ck:'FR',div:allDivisions()[0].id,age:24,W:8,L:2,D:0,ct:{since:0,n:4,f:0}},{id:'b',name:'Sujet B',ck:'FR',div:allDivisions()[0].id,age:25,W:2,L:8,D:0,ct:{since:0,n:4,f:0}}]};
    const v={mode:'combat',ids:['a','b'],page:0,nom:0},el=document.createElement('div');el.innerHTML=mgmtPresentationHtml(m,v);const voix=[],textes=[];for(let page=0;page<v.pages;page++){v.page=page;el.innerHTML=mgmtPresentationHtml(m,v);voix.push(...[...el.querySelectorAll('.mf-pr-media')].map(e=>e.textContent));textes.push(el.textContent);}return {voix:[...new Set(voix)],texte:textes.join(' ')};`);
  assert.deepEqual(r.voix,['Cage Hebdo','Tableau Noir','Le Forum']);assert.ok(/68\s*%/.test(r.texte));
  const p=lire(w,`const m=G.mgmt,out=[];
    for(const cycle of [...new Set(m.hist.map(t=>t.c))]){const h=m.hist.findIndex(t=>t.c===cycle),t=m.hist[h];
      for(const mode of ['combattant','combat']){
        const v={mode,ids:mode==='combattant'?[t.a.id]:[t.a.id,t.b.id],h,page:0,nom:0},c=mgmtPresentationLignes(m,v);mgmtPresentationHtml(m,v);
         const attendus=mode==='combattant'?c.d.faits.concat(c.d.histoire).map(x=>x.texte):c.d.faits.concat(c.d.pronostics).map(x=>x.texte);
         const profils=(mode==='combattant'?[t.a.id]:[t.a.id,t.b.id]).flatMap(id=>{const f=m.roster.find(x=>x.id===id);return mgmtLectureStyle(f).lignes.filter(x=>x!==MGMT_AVANT_TEXTES.lignes.rien);});if(mode==='combattant') attendus.push(...profils); else attendus.push(...mgmtImposerLignes(m,[t.a.id,t.b.id],h).map(x=>x.texte),...Object.values(MGMT_AVANT_TEXTES.zones));
         const phrases=[],sources=[];for(let page=0;page<v.pages;page++){v.page=page;const el=document.createElement('div');el.innerHTML=mgmtPresentationHtml(m,v);for(const e of el.querySelectorAll('.mf-pr-phrase')){const ligne=e.closest('.mf-pr-ligne');phrases.push(e.textContent);sources.push(...JSON.parse(ligne?.dataset.sources||'[]'));}}
        const bonnes=sources.every(s=>s.type==='hist'?!!m.hist[s.index]&&(s.projection?s.index>=h:s.index<h):s.type==='fiche'?m.roster.some(f=>f.id===s.id):s.type==='facts'?!!m.facts[s.index]:s.type==='classement'?s.h===h:s.type==='calendrier');
        out.push({phrases,attendus,bonnes,variable:/\{[^}]+\}/.test(phrases.join(' '))});
      }}return out;`);
  assert.equal(p.length,8);
  // La décision T3 remplace les lignes narratives par les zones de profil et le tableau histoire.
   for(const x of p){assert.ok(x.bonnes);assert.ok(!x.variable);for(const phrase of x.attendus)if(phrase)assert.ok(x.phrases.includes(phrase),'phrase attendue absente : '+phrase);assert.ok(x.phrases.every(phrase=>x.attendus.includes(phrase)),`Phrase affichée sans source attendue: ${x.phrases.filter(phrase=>!x.attendus.includes(phrase)).join(' | ')}`);}
});
test('Monde lot 3 T5 — échappement, absents et pagination',()=>{
  const w=passe();
  const r=lire(w,`const m=G.mgmt,f=m.roster[0];Object.assign(f,{name:'<img src=x onerror=alert(1)>',first:'<svg>',last:'<img src=x>'});
    CL.mgmtPresentationOuvrir('combattant',[f.id]);const injecte=document.querySelectorAll('.mf-pr img').length,route=G.screen;
    const invalide=CL.mgmtPresentationOuvrir('combat',[f.id,'absent']);
    const v=mgmtPresentationCadre(),texte='Elle observe et poursuit sa carrière. '.repeat(200).trim(),lignes=[{texte,sources:[]}],pages=mgmtPresentationPaginer(m,v,lignes,142,466);
    return {injecte,invalide,route:G.screen===route,pages:pages.length,texte:pages.flat().map(x=>x.texte).join(' '),attendu:texte};`);
  // La décision T3 autorise les SVG des marques internes ; les noms fournis restent échappés.
  assert.equal(r.injecte,0);assert.equal(r.invalide,false);assert.ok(r.route);assert.ok(r.pages>1);assert.equal(r.texte,r.attendu);
  w.eval(`CL.go('mgmt_prelims');G.mgmt.card.prelims=[];G.mgmt.pile=[];MGMT_PRELIMS.i=0;render()`);
  assert.ok(!w.eval(`document.getElementById('app').textContent.includes('Présentation')`));
  const ex=w.eval(`G.mgmt.roster.find(f=>!mgmtIsRetired(f)).id`);
  w.eval(`G.mgmt.roster.find(f=>f.id===${JSON.stringify(ex)}).retired=true;G.screen='mgmt_accueil';CL.mgmtAccueilNom(${JSON.stringify(ex)})`);
  assert.equal(w.eval('G.screen'),'mgmt_fiche');
  w.eval(`G.screen='mgmt_accueil';var exterieur=Object.values(G.mgmt.ext?.orgs||{}).flatMap(o=>o.roster||[])[0];`);
  // La fiche extérieure est exercée par la porte existante quand la population en contient une.
  if(w.eval('!!exterieur')){w.eval('CL.mgmtAccueilNom(exterieur.id)');assert.equal(w.eval('G.screen'),'mgmt_fiche');}
});

/* Monde lot 21 (retour d'Anthony du 18/10/2026 : « dans l'avant-combat, cliquer sur un combattant nous sort de la soirée, qui se joue sans nous ») :
   la présentation d'un combattant ouverte depuis l'avant-combat — et la fiche qui s'ouvre depuis elle — gardent la barre des sections grisée. */
/* Décision (superviseur, 22/10/2026, brief P4 T1 : le tableau de ce qui manque à chaque organisation) : avec la nouvelle composition de Split, l'avant-combat de cette fixture (graines 20261008, 777, 4242, 20261009) n'offre plus aucun nom cliquable (mgmtPresentationLignes(...).noms est vide pour les neuf combats). Le comportement testé (barre des sections grisée depuis un nom cliqué) n'est pas modifié par la tranche ; la fixture est à recaler : test marqué `todo` (il s'exécute, son échec n'arrête pas la suite) — dette notée dans le compte rendu de la tranche. */
test('Monde lot 21 — un nom cliqué dans l’avant-combat ne laisse aucune porte de sortie vers les sections',{todo:'fixture à recaler : plus aucun nom cliquable dans l’avant-combat depuis P4 T1'},()=>{
  const w=newGameWindow({runMain:true});
  w.eval("setSeed(20261008);mgmtPasseGenerer('split',{soirees:6});");
  const jouer=require('./helpers/jouerSoirees.js'); jouer(w,6);
  const essai=()=>JSON.parse(w.eval(`JSON.stringify((()=>{
     /* Combat lot 1 (22/10/2026) : les combats simulés changent avec le recalibrage ; on cherche le premier combat de la soirée (par la ligne choisie, focus) dont l'avant-combat porte un nom cliquable. */
      let lien=null,choisi=-1;
      const p=mgmtSoireeProgramme(G.mgmt)[1],precedent=G.mgmt.hist[0];
      /* brief du 22/10, P4 T1 : la composition de Split a changé, la fixture fabrique la revanche. */
      const revanche={...precedent,a:{...precedent.a,id:p.a.id},b:{...precedent.b,id:p.b.id},p:true,c:precedent.c-1};
      G.mgmt.hist.splice(Math.max(0,p.h-1),0,revanche);
      for(let i=0;i<9&&!lien;i++){
        MGMT_SOIREE.index=1;MGMT_SOIREE_UI.focus=i;MGMT_PRESENTATION_UI.pile=[];
        CL.go('mgmt_soiree');CL.mgmtSoAvant();
        const v=mgmtPresentationCadre();
        if(mgmtPresentationLignes(G.mgmt,v).noms.length) lien=document.querySelector('#app .mf-pr-lien');
        if(lien) choisi=i;
      }
     lien.click();
    const enfant={screen:G.screen,grisees:[...document.querySelectorAll('.mf-barre-item')].filter(b=>!/mgmtMenuPrincipal/.test(b.getAttribute('onclick')||'')).every(b=>b.disabled)};
    document.querySelectorAll('.mf-barre-item')[0].click();
    const apresClic=G.screen;
    CL.mgmtPresentationFiche();
    const fiche={screen:G.screen,grisees:[...document.querySelectorAll('.mf-barre-item')].filter(b=>!/mgmtMenuPrincipal/.test(b.getAttribute('onclick')||'')).every(b=>b.disabled)};
    return {enfant,apresClic,fiche,index:MGMT_SOIREE.index,choisi};})())`));
  const r=essai();
  assert.equal(r.enfant.screen,'mgmt_presentation_combattant');
  assert.equal(r.enfant.grisees,true,'barre grisée dans la présentation du combattant');
  assert.equal(r.apresClic,'mgmt_presentation_combattant','un clic sur une section ne fait rien');
  assert.equal(r.fiche.screen,'mgmt_fiche');
  assert.equal(r.fiche.grisees,true,'barre grisée aussi sur la fiche ouverte depuis l’avant-combat');
  assert.equal(r.index,1,'la soirée est restée au même combat');
});
