"use strict";
/* Monde lot 7 (12/10/2026) : la section Accueil. Décisions d'Anthony du 12/10/2026 : l'Accueil est la première section et l'écran
   d'arrivée, il remplace « La semaine » dans la navigation, rien à minuterie ni par-dessus, une demande ou une affaire ouverte s'y règle. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {newGameWindow}=require('./helpers/loadGame');
const res=(w,code)=>JSON.parse(w.eval(`JSON.stringify((function(){ ${code} })())`));
const neuve=()=>{ const w=newGameWindow({runMain:true}); w.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(7); CL.mgmtEnter(1);`); return w; };
/* Monde lot 10 T2 (MONDE-LOT-10-DECISIONS §2) : Entrée sur l’arrivée mène à la Carte, Échap à l’Accueil ; le montage ouvre donc l’Accueil comme Échap. */
const ouverte=()=>{ const w=neuve(); w.eval(`CL.go('mgmt_accueil');`); return w; };
/* Une partie « après la première soirée » : l'état seul change (aucune soirée jouée par le joueur = première arrivée). */
const apres=`m.eventsPlayed=(m.passe?m.passe.soirees:0)+1;`;

test('T1 — Accueil première section ; neuve : arrivée puis Accueil ; reprise : Accueil', () => {
  const w=neuve();
  const r=res(w,`const premier=G.screen; CL.go('mgmt_accueil'); const ap=G.screen; const barre=[...document.querySelectorAll('.mf-barre-item[data-section]')].map(b=>b.dataset.section);
    const cur=document.querySelector('.mf-barre-item.cur'); G.mgmt=null; CL.mgmtEnter(1);
    return {premier,ap,reprise:G.screen,tete:barre.slice(0,2),n:MF_SECTIONS.length,cur:cur&&cur.dataset.section};`);
  /* Décision d’Anthony du27/10/2026 : Organisation est la quatorzième section commune. */
  assert.deepEqual(r,{premier:'mgmt_arrivee',ap:'mgmt_accueil',reprise:'mgmt_accueil',tete:['accueil','actualites'],n:14,cur:'accueil'});
});

test('T1 — une partie laissée en pleine soirée mène toujours à la soirée (avant l’Accueil)', () => {
  const src=fs.readFileSync(path.join(__dirname,'..','mgmt-screens.js'),'utf8');
  const i=src.indexOf("mgmtSoireeReprendre(G.mgmt); CL.go('mgmt_soiree')"), j=src.indexOf("CL.go('mgmt_accueil');",i);   /* 16/10/2026 : des touches Échap contiennent aussi cet appel, plus haut dans le fichier : on cherche donc après la reprise */
  assert.ok(i>0&&j>i,'la reprise de soirée passe avant l’ouverture de l’Accueil');
});

test('T2 — la fonction de contenu est pure : même partie, même résultat, partie intacte', () => {
  const w=ouverte();
  const r=res(w,`const m=G.mgmt; const avant=JSON.stringify(m); const a=JSON.stringify(mgmtAccueilContenu(m)), b=JSON.stringify(mgmtAccueilContenu(m));
    return {egal:a===b,intacte:JSON.stringify(m)===avant,cles:Object.keys(mgmtAccueilContenu(m))};`);
  assert.equal(r.egal,true); assert.equal(r.intacte,true);
  assert.deepEqual(r.cles,['premiere','ou','passe','attend','ailleurs','heritage']);
});

/* Monde lot 10 T2 (MONDE-LOT-10-DECISIONS §2) : le bloc héritage quitte l’Accueil (l’arrivée le porte) ; la donnée `heritage` reste fournie,
   le panneau « L’ORGANISATION » n’est plus affiché, et le reste de l’Accueil (« CE QUI S’EST PASSÉ ») est inchangé. */
test('T5 — la première arrivée : héritage avant la première soirée, semaine ensuite, rien dans la sauvegarde', () => {
  const w=ouverte();
  const r=res(w,`const m=G.mgmt, av=mgmtAccueilContenu(m); const t1=document.getElementById('app').textContent;
    ${apres} render(); const ap=mgmtAccueilContenu(m); const t2=document.getElementById('app').textContent;
    return {p1:av.premiere,h1:!!av.heritage,p2:ap.premiere,h2:ap.heritage,t1:/ORGANISATION/.test(t1),t2:/CE QUI S.EST PASS/.test(t2),saved:Object.keys(m).includes('accueil')};`);
  /* ==== [ANCRE: ACCUEIL_TEST_PASSE_VIDE_R4] — Monde lot 12 T2 ==== */
  /* Fiche T2, R4 : sans événement, le panneau du passé n'est plus affiché. */
  assert.deepEqual([r.p1,r.h1,r.p2,r.h2,r.t1,r.t2,r.saved],[true,true,false,null,false,false,false]);
});

/* ==== [ANCRE: TEST_MGMT_PRESENTATION_ACCUEIL_ROUTE] — Monde lot 3 T5 ==== */
/* Fiche T5 §4 et décision §12 : les actifs internes ouvrent T2, extérieurs/retraités restent en fiche. */
test('T4 — chaque nom affiché ouvre la présentation du bon combattant actif', () => {
  const w=ouverte();
  const r=res(w,`const m=G.mgmt; ${apres}
    const ids=m.roster.filter(f=>!mgmtIsRetired(f)).slice(0,2).map(f=>f.id); for(const id of ids) m.facts.push({k:'injury',a:id,c:m.cycle});
    render(); const c=mgmtAccueilContenu(m); const noms=[...document.querySelectorAll('.mf-ac-nom')];
    const premier=noms[0]; const attendu=(/mgmtAccueilNom\\('([^']+)'\\)/.exec(premier.getAttribute('onclick'))||[])[1];
    const nomAffiche=premier.textContent; premier.click();
    return {lies:c.passe.length,noms:noms.length,ecran:G.screen,sujet:mgmtPresentationCadre().ids[0],attendu,bon:mgmtFighterById(m,attendu).name===nomAffiche};`);
  assert.ok(r.lies>=1&&r.noms>=1); assert.equal(r.ecran,'mgmt_presentation_combattant'); assert.equal(r.sujet,r.attendu); assert.equal(r.bon,true);
});

/* ==== [ANCRE: ACCUEIL_DEMANDE_ACTION_TEST] — Monde lot 12 T2 ==== */
/* Fiche T2, écart 4 : Répondre ouvre la fiche existante au lieu des deux décisions dans la liste. */
test('T6 — une demande ouverte se règle depuis l’Accueil (lot 26 : « veut … » remplace « demande : »)', () => {
  const w=ouverte();
  const r=res(w,`const m=G.mgmt; ${apres} const f=m.roster.find(x=>!mgmtIsRetired(x));
    m.facts.push({k:'demande',a:f.id,want:'carte-principale',c:m.cycle}); render();
    const avant=mgmtDemandesOuvertes(m).length, vue=/veut/.test(document.querySelector('.mf-ac').textContent);
    document.querySelector('.mf-ac-demande').click();
    const bouton=[...document.querySelectorAll('.mf-demande .mf-bouton')].find(b=>/Refuser/.test(b.textContent)); bouton.click();
    CL.go('mgmt_accueil');
    return {avant,vue,ap:mgmtDemandesOuvertes(m).length,ecran:G.screen};`);
  assert.ok(r.avant>=1); assert.equal(r.vue,true); assert.equal(r.ap,r.avant-1); assert.equal(r.ecran,'mgmt_accueil');
});

test('T6 — une affaire ouverte se règle depuis l’Accueil', () => {
  const w=ouverte();
  const r=res(w,`const m=G.mgmt; ${apres} render();
    const n0=m.pile.filter(a=>a.status==='open').length; const ligne=document.querySelector('.mf-ac-act');
    if(!ligne) return {n0,sans:true};
    /* REPRISE 2 : l'échange est désormais ouvert dans Les affaires. */
    ligne.click(); const boutons=[...document.querySelectorAll('button')].filter(b=>/CL.mgmtReply/.test(b.getAttribute('onclick')||''));
    const avant=boutons.length; boutons[0].click();
    return {n0,avant,ecran:G.screen};`);
  assert.ok(r.sans||(r.avant>=1&&r.ecran==='mgmt_bureau'));
});

test('Lot 7 — le lien des affaires mène à l’Accueil ; aucune minuterie ni surimpression dans l’Accueil', () => {
  const w=ouverte();
  const r=res(w,`const src=mgmtAccueilContenu.toString()+scr_mgmt_accueil.toString()+mgmtAccueilAttend.toString();
    return {minut:/setTimeout|setInterval|requestAnimationFrame/.test(src),popup:/mgmt-popup|mgmt-fil|mgmtFil/.test(src),bureau:/mgmt_bureau/.test(mgmtAgendaBlocages.toString())};`);
  assert.equal(r.minut,false); assert.equal(r.popup,false); assert.equal(r.bureau,false);
});

test('Lot 7 — aucun texte sous 22 px dans les règles de l’Accueil, aucune animation', () => {
  const css=fs.readFileSync(path.join(__dirname,'..','ui-cadre.css'),'utf8');
  const bloc=css.slice(css.indexOf('MONDE_LOT7_ACCUEIL_CSS'));
  const tailles=[...bloc.matchAll(/font-size:\s*([0-9.]+)px/g)].map(x=>parseFloat(x[1]));
  assert.ok(tailles.length>10); assert.deepEqual(tailles.filter(t=>t<22),[]);
  assert.ok(!/@keyframes|animation:|transition:/.test(bloc),'aucune animation');
});

/* ==== [ANCRE: ACCUEIL_PLANCHE_TEST] — Monde lot 12 T2 ==== */
/* Les planches Uni* sont validées par Anthony (brief du 22/10) ; l'écran suit la planche. */
test('Monde lot 12 T2 — l’Accueil a trois colonnes, le bandeau de la prochaine soirée et une action par affaire', () => {
  const w=ouverte();
  const r=res(w,`const m=G.mgmt;
    const f=m.roster.find(x=>!mgmtIsRetired(x));
    m.facts.push({k:'injury',a:f.id,c:m.cycle});
    m.facts.push({k:'demande',a:f.id,want:'carte-principale',c:m.cycle});
    render();
    const c=mgmtAccueilContenu(m);
    const colonnes=[...document.querySelector('.mf-ac-cols').children];
    const lignes=[...document.querySelectorAll('.mf-ac-haut .mf-ac-ligne')];
    const bandeau=document.querySelector('.mf-ac-tuiles').textContent;
    const date=mgmtJourDate(mgmtCalAujourdhui(m));
    return {colonnes:colonnes.length,titres:colonnes.map(x=>x.querySelector('.mf-ac-h').textContent),
      bandeau,date:c.ou.date,mois:date.mois.toLowerCase(),
      lignes:lignes.length,attend:c.attend.ouvertes.length,
      actions:lignes.map(x=>x.querySelectorAll('.mf-ac-act,.mf-ac-demande').length),
      decisions:document.querySelectorAll('.mf-ac-ra').length,
      prochaine:document.querySelectorAll('.mf-prise-suite').length,
      jaune:document.querySelector('.mf-ac-jaune').textContent,
      vides:mgmtAccueilPasse(m,{passe:[]})+mgmtAccueilAilleurs(m,{ailleurs:[]})};`);
  assert.equal(r.colonnes,3);
   assert.deepEqual(r.titres,['CE QUI S’EST PASSÉ','CE QUI T’ATTEND','TA SAISON']);
   assert.match(r.bandeau,/Prochaine soirée.*Le lieu.*La carte.*LES PRÉVENTES/);
   assert.match(w.document.querySelector('.mf-ac-cols').textContent,/LE PATRON/);
   assert.match(w.document.querySelector('.mf-ac-cols').textContent,/TON RECRUTEUR/);
  assert.doesNotMatch(r.bandeau,/prédécesseur|adjointe|première soirée/);
  assert.ok(r.date.includes(r.mois));
  assert.equal(r.lignes,Math.min(4,r.attend));
  assert.ok(r.actions.every(n=>n===1));
  assert.equal(r.decisions,0);
  assert.equal(r.prochaine,0);
  assert.equal(r.vides,'');
  assert.equal((r.jaune.match(/Finir la carte/gi)||[]).length,1);
  assert.equal((r.jaune.match(/Ouvrir les dossiers/gi)||[]).length,1);
  const css=fs.readFileSync(path.join(__dirname,'..','ui-cadre.css'),'utf8');
  assert.match(css,/\.mf-ac-cols>\.mf-ac-p\{flex:5 1 0;min-width:0\}/);
  assert.doesNotMatch(css,/\.mf-ac-haut[^{}]*\{[^}]*overflow-y:auto/);
});

test('Monde lot 64 T1 — accueil planche : quatre cases, saison, patron, recruteur et styles des classes',()=>{
  const w=ouverte(),html=w.document.querySelector('.mf-ac').innerHTML,css=fs.readFileSync(path.join(__dirname,'..','ui-cadre.css'),'utf8');
  for(const texte of ['LES PRÉVENTES','TA SAISON','LE PATRON','TON RECRUTEUR']) assert.ok(w.document.querySelector('.mf-ac').textContent.includes(texte),`bloc ${texte}`);
  const classes=[...new Set([...html.matchAll(/class="([^"]+)"/g)].flatMap(x=>x[1].split(/\s+/)).filter(c=>c.startsWith('mf-ac-')))];
  for(const nom of classes) assert.match(css,new RegExp(`\\.${nom}(?:[\\s.:,{>#]|$)`),`classe ${nom} stylée`);
});

test('Monde lot 64 T1 — un contrat presque échu allume sa section sans ajouter de donnée',()=>{
  const w=ouverte(),r=res(w,`const m=G.mgmt,f=m.roster.find(x=>!mgmtIsRetired(x));f.ct={n:2,f:1,b:0};render();const item=document.querySelector('.mf-barre-item[data-section="contrats"]');return {attente:mfAttentes(m).has('contrats'),marque:!!item.querySelector('.mf-oct')};`);
  assert.deepEqual(r,{attente:true,marque:true});
});

/* ==== [ANCRE: ACCUEIL_REPRISE_2_TESTS] — Monde lot 12 T2 ==== */
test('Monde lot 12 T2 — reprise 2 — colonnes 5 / 5 / 3',()=>{
  const css=fs.readFileSync(path.join(__dirname,'..','ui-cadre.css'),'utf8');
  assert.match(css,/\.mf-ac-cols>\.mf-ac-p\{flex:5 1 0;min-width:0\}/);
  assert.match(css,/\.mf-ac-cols>\.mf-ac-c3\{flex:3 1 0\}/);
  assert.match(css,/\.mf-ac-cols\{display:flex;align-items:stretch;gap:18px;min-height:700px/);
});

test('Monde lot 12 T2 — reprise 2 — seulement demandes et affaires de Leïla',()=>{
  const w=ouverte();
  const r=res(w,`const m=G.mgmt, [a,b]=m.roster;
    m.facts=[{k:'demande',a:a.id,want:'carte-principale',c:m.cycle}];
    const kinds=['leila_propose','leila_react','leila_bulk','leila_react_swap','leila_react_crush'];
    m.pile=kinds.map((kind,i)=>({id:'r'+i,kind,status:'open',a:a.id,b:b.id,fights:[]}));
    m.pile.push({id:'fermee',kind:'leila_propose',status:'closed'},{id:'contrat',kind:'contrat',status:'open'});
    return mgmtAccueilContenu(m).attend.ouvertes.map(x=>({id:x.id,kind:x.kind,relu:x.relu}));`);
  assert.equal(r.length,6);
  assert.deepEqual(r.slice(1).map(x=>x.id),['r0','r1','r2','r3','r4']);
  assert.ok(r.slice(1).every(x=>x.kind==='affaire'&&x.relu===false));
});

test('Monde lot 12 T2 — reprise 2 — actions et résumé sans échange développé',()=>{
  const w=ouverte();
  const r=res(w,`const m=G.mgmt, [a,b]=m.roster;
    m.facts=[]; m.pile=[{id:'reprise',kind:'leila_propose',status:'open',a:a.id,b:b.id}]; m.open='reprise'; render();
    const ligne=document.querySelector('.mf-ac-ligne');
    const texte=ligne.querySelector('.mf-ac-rp').textContent, sous=ligne.querySelector('.mf-ac-rs').textContent;
    const action=ligne.querySelector('.mf-ac-act').textContent, echanges=document.querySelectorAll('.mf-ac-ech').length;
    document.querySelector('.mf-ac-act').click();
    return {texte,sous,action,echanges,ecran:G.screen,open:m.open,a:a.name,b:b.name,record:a.W+'-'+a.L+'-'+a.D};`);
  assert.equal(r.texte,`Leïla propose ${r.a} contre ${r.b}`);
  assert.ok(r.sous.includes(r.record)); assert.equal(r.action,'Décider ›');
  assert.equal(r.echanges,0); assert.equal(r.ecran,'mgmt_bureau'); assert.equal(r.open,'reprise');
});

test('Monde lot 12 T2 — reprise 2 — lieu en majuscules et mois en minuscules',()=>{
  const w=ouverte();
  const r=res(w,`const m=G.mgmt, c=mgmtAccueilContenu(m), infos=mfSoireeInfos(m);
    const salle=mgmtSalleParId(m,m.cal.prochaines[0].salle);
    return {lieu:c.ou.lieu,nom:salle.nom,ville:salle.ville,date:infos.date};`);
  assert.equal(r.lieu.nom,r.nom.toUpperCase());
  assert.equal(r.lieu.sous,r.ville+', '+r.date.toLowerCase());
});

test('Monde lot 12 T2 — reprise 2 — listes limitées et Voir tout sans nom coupé',()=>{
  const w=ouverte();
  const r=res(w,`const m=G.mgmt; m.facts=[]; m.pile=[]; m.visites={};
    /* Le budget du conteur reste indépendant de la limite de rendu testée. */
    mgmtMarqueBudget=()=>7;
    for(const f of m.roster.filter(x=>!mgmtIsRetired(x)).slice(0,7)){
      m.facts.push({k:'injury',a:f.id,c:m.cycle},{k:'demande',a:f.id,want:'carte-principale',c:m.cycle});
    }
    const nomLong='Alexandre & Jean-Baptiste de La Roche';
    m.roster.filter(x=>!mgmtIsRetired(x)).slice(0,7).forEach(f=>{f.name=nomLong;});
    const [a,b]=m.roster;
    m.pile=[{id:'debordement',kind:'leila_propose',status:'open',a:a.id,b:b.id}];
    render(); const c=mgmtAccueilContenu(m);
    const liens=[...document.querySelectorAll('.mf-ac-lien')].filter(x=>x.textContent==='Voir tout ›');
    MGMT_ACCUEIL.cur=4; CL.mgmtAccueilDeplacer(1);
    return {total:c.passe.length,passe:document.querySelectorAll('.mf-ac-ev').length,
      affaires:document.querySelectorAll('.mf-ac-ligne').length,
      liens:liens.map(x=>({famille:x.dataset.famille,go:x.getAttribute('onclick'),attend:!!x.closest('.mf-ac-haut')})),
      noms:[...document.querySelectorAll('.mf-ac-ev .mf-ac-nom,.mf-ac-ligne .mf-ac-nom')].map(x=>x.textContent),
      nomLong,cur:MGMT_ACCUEIL.cur};`);
  assert.ok(r.total>5); assert.equal(r.passe,5); assert.equal(r.affaires,4);
  assert.deepEqual(r.liens.find(x=>x.famille==='passe'),{famille:'passe',go:"CL.go('mgmt_effectif')",attend:false});
  assert.deepEqual(r.liens.find(x=>x.famille==='demande'),{famille:'demande',go:"CL.go('mgmt_effectif')",attend:true});
  assert.deepEqual(r.liens.find(x=>x.famille==='affaire'),{famille:'affaire',go:"CL.go('mgmt_bureau')",attend:true});
  assert.equal(r.liens.length,3); assert.equal(r.cur,0);
  assert.ok(r.noms.length>=9); assert.ok(r.noms.every(n=>n===r.nomLong),'les noms complets restent dans chaque bouton');
  const css=fs.readFileSync(path.join(__dirname,'..','ui-cadre.css'),'utf8');
  /* Décision : les planches Uni* sont validées par Anthony (brief du 22/10) ; l'écran suit la planche. */
  assert.match(css,/\.mf-ac\{[^}]*overflow:hidden/);
  assert.match(css,/\.mf-ac-p>\.mf-p2>\.mf-p3\{[^}]*overflow:visible/);
  assert.match(css,/\.mf-ac \.mf-ac-nom\{white-space:normal;overflow:visible;overflow-wrap:anywhere;max-width:100%\}/);
});

test('Monde lot 12 T2 — reprise 2 — bloc jaune en casse phrase et action à droite',()=>{
  const w=ouverte();
  const r=res(w,`const titre=document.querySelector('.mf-ac-jt').textContent;
    const ligne=document.querySelector('.mf-ac-jp');
    return {titre,classes:[...ligne.children].map(x=>x.className),entree:ligne.querySelector('.mf-ac-jb').textContent};`);
  assert.equal(r.titre,'Finir la carte'); assert.deepEqual(r.classes,['mf-ac-jd','mf-ac-jb']);
  assert.match(r.entree,/Entrée/);
  const css=fs.readFileSync(path.join(__dirname,'..','ui-cadre.css'),'utf8');
  assert.match(css,/\.mf-ac-jp\{display:flex;justify-content:space-between;align-items:center;gap:12px\}/);
  assert.doesNotMatch(css,/[^{}]*\.mf-ac-jp[^{}]*\{[^}]*flex-wrap:wrap/);
});

/* ==== [ANCRE: ACCUEIL_CORRECTIONS_RELECTURE_TESTS] — Monde lot 12 T2 ==== */
test('Monde lot 12 T2 — reprise — bloc jaune conserve Leïla depuis Continuer',()=>{
  const w=ouverte();
  const r=res(w,`mgmtAgendaBlocages=()=>[]; mgmtAgendaActif=()=>false;
    const m=G.mgmt; m.pile=[{id:'leila',kind:'leila_propose',status:'open'}];
    render(); return {source:mgmtContinuerRaison(m).libelle,titre:document.querySelector('.mf-ac-jt').textContent};`);
  assert.equal(r.source,'Répondre à Leïla'); assert.equal(r.titre,r.source);
});

test('Monde lot 12 T2 — reprise — dossiers sur le premier emplacement libre',()=>{
  const w=ouverte();
  const r=res(w,`const m=G.mgmt, [a,b]=m.roster; m.card.main=new Array(2); m.card.main[1]={a:a.id,b:b.id};
    /* La presse ne fait pas partie du choix de l'emplacement testé. */
    mgmtMediasLignes=()=>[];
    let cible=null; CL.mgmtCarteDossiersOuvrir=i=>{cible=i;};
    render(); const titre=document.querySelector('.mf-ac-jt').textContent;
    document.querySelector('.mf-ac-jb').click(); return {titre,cible};`);
  assert.equal(r.titre,'Finir la carte'); assert.equal(r.cible,0);
});

test('Monde lot 12 T2 — reprise — Voir tout est exporté parmi les textes à relire',()=>{
  const dir=fs.mkdtempSync(path.join(require('node:os').tmpdir(),'cage-accueil-textes-'));
  try{
    const out=path.join(dir,'textes.md');
    require('node:child_process').execFileSync(process.execPath,['tools/exporter-textes.js','--out',out],{cwd:path.join(__dirname,'..'),stdio:'pipe'});
    const texte=fs.readFileSync(out,'utf8');
    assert.match(texte,/MGMT_ACCUEIL_TEXTES\.voirTout[^\n]*Voir tout ›/);
    assert.match(texte,/MGMT_ACCUEIL_TEXTES\.finir[^\n]*Finir la carte/);
    assert.match(texte,/MGMT_ACCUEIL_TEXTES\.resumes\.leila_propose[^\n]*Leïla propose/);
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
