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
const ouverte=()=>{ const w=neuve(); w.eval(`CL.mgmtArriveeFin();`); return w; };
/* Une partie « après la première soirée » : l'état seul change (aucune soirée jouée par le joueur = première arrivée). */
const apres=`m.eventsPlayed=(m.passe?m.passe.soirees:0)+1;`;

test('T1 — Accueil première section ; neuve : arrivée puis Accueil ; reprise : Accueil', () => {
  const w=neuve();
  const r=res(w,`const premier=G.screen; CL.mgmtArriveeFin(); const ap=G.screen; const barre=[...document.querySelectorAll('.mf-barre-item[data-section]')].map(b=>b.dataset.section);
    const cur=document.querySelector('.mf-barre-item.cur'); G.mgmt=null; CL.mgmtEnter(1);
    return {premier,ap,reprise:G.screen,tete:barre.slice(0,2),n:MF_SECTIONS.length,cur:cur&&cur.dataset.section};`);
  assert.deepEqual(r,{premier:'mgmt_arrivee',ap:'mgmt_accueil',reprise:'mgmt_accueil',tete:['accueil','carte'],n:12,cur:'accueil'});
});

test('T1 — une partie laissée en pleine soirée mène toujours à la soirée (avant l’Accueil)', () => {
  const src=fs.readFileSync(path.join(__dirname,'..','mgmt-screens.js'),'utf8');
  const i=src.indexOf("mgmtSoireeReprendre(G.mgmt); CL.go('mgmt_soiree')"), j=src.indexOf("CL.go('mgmt_accueil');");
  assert.ok(i>0&&j>i,'la reprise de soirée passe avant l’ouverture de l’Accueil');
});

test('T2 — la fonction de contenu est pure : même partie, même résultat, partie intacte', () => {
  const w=ouverte();
  const r=res(w,`const m=G.mgmt; const avant=JSON.stringify(m); const a=JSON.stringify(mgmtAccueilContenu(m)), b=JSON.stringify(mgmtAccueilContenu(m));
    return {egal:a===b,intacte:JSON.stringify(m)===avant,cles:Object.keys(mgmtAccueilContenu(m))};`);
  assert.equal(r.egal,true); assert.equal(r.intacte,true);
  assert.deepEqual(r.cles,['premiere','ou','passe','attend','ailleurs','heritage']);
});

test('T5 — la première arrivée : héritage avant la première soirée, semaine ensuite, rien dans la sauvegarde', () => {
  const w=ouverte();
  const r=res(w,`const m=G.mgmt, av=mgmtAccueilContenu(m); const t1=document.getElementById('app').textContent;
    ${apres} render(); const ap=mgmtAccueilContenu(m); const t2=document.getElementById('app').textContent;
    return {p1:av.premiere,h1:!!av.heritage,p2:ap.premiere,h2:ap.heritage,t1:/ORGANISATION/.test(t1),t2:/CE QUI S.EST PASS/.test(t2),saved:Object.keys(m).includes('accueil')};`);
  assert.deepEqual([r.p1,r.h1,r.p2,r.h2,r.t1,r.t2,r.saved],[true,true,false,null,true,true,false]);
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

test('T6 — une demande ouverte se règle depuis l’Accueil', () => {
  const w=ouverte();
  const r=res(w,`const m=G.mgmt; ${apres} const f=m.roster.find(x=>!mgmtIsRetired(x));
    m.facts.push({k:'demande',a:f.id,want:'carte-principale',c:m.cycle}); render();
    const avant=mgmtDemandesOuvertes(m).length, vue=/demande/.test(document.querySelector('.mf-ac').textContent);
    const bouton=[...document.querySelectorAll('.mf-ac-ra .mf-bouton')].find(b=>/Refuser/.test(b.textContent)); bouton.click();
    return {avant,vue,ap:mgmtDemandesOuvertes(m).length,ecran:G.screen};`);
  assert.ok(r.avant>=1); assert.equal(r.vue,true); assert.equal(r.ap,r.avant-1); assert.equal(r.ecran,'mgmt_accueil');
});

test('T6 — une affaire ouverte se règle depuis l’Accueil', () => {
  const w=ouverte();
  const r=res(w,`const m=G.mgmt; ${apres} render();
    const n0=m.pile.filter(a=>a.status==='open').length; const ligne=document.querySelector('.mf-ac-act');
    if(!ligne) return {n0,sans:true};
    ligne.click(); const avant=document.querySelectorAll('.mf-ac-reps .mf-bouton').length; document.querySelector('.mf-ac-reps .mf-bouton').click();
    return {n0,avant,ecran:G.screen};`);
  assert.ok(r.sans||(r.avant>=1&&r.ecran==='mgmt_accueil'));
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
