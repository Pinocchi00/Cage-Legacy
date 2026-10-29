"use strict";
/* ==== [ANCRE: TEST_MONDE_LOT48_T1] — Monde lot 48 T1 ==== */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');

test('Monde lot 48 T1 — écran poste inscrit, liens additifs et onglets',()=>{
  const w=newGameWindow({runMain:true});
  const r=w.eval(`(()=>{const m=mgmtPasseGenerer('split',{soirees:3});G.mgmt=m;if(!m.poste)mgmtPosteInit(m);const org=scr_mgmt_organisation(),acc=scr_mgmt_accueil();const p=scr_mgmt_poste();mgmtPosteOngletAjouter('essai','ESSAI',()=>'<p>onglet</p>');const tabs=scr_mgmt_poste();const old=mgmtPosteOngletActif;mgmtPosteOngletActif=1;const switched=scr_mgmt_poste();return {org,acc,p,tabs,switched,old}})()`);
  assert.match(r.org,/Les finances/);assert.match(r.org,/Revoir ce qui manque/);assert.match(r.org,/Ton poste/);
  assert.match(r.acc,/Ton poste/);assert.match(r.p,/TON POSTE/);assert.match(r.tabs,/ESSAI/);assert.match(r.switched,/onglet/);
});

test('Monde lot 48 T1 — contrat accessible, données échappées et sans jauge chiffrée',()=>{
  const w=newGameWindow({runMain:true});
  const r=w.eval(`(()=>{const m=mgmtPasseGenerer('split',{soirees:3});G.mgmt=m;if(!m.poste)mgmtPosteInit(m);return scr_mgmt_poste()})()`);
  assert.match(r,/3.{0,2}200.{0,2}€ \/ MOIS/);assert.match(r,/CE QU’EN PENSE LE PATRON/);assert.match(r,/TES OBJECTIFS/);assert.doesNotMatch(r,/confidence|\d+\/\d+/);
});

test('Monde lot 48 T1 — bilan expose les trois issues sans bloquer la partie',()=>{
  const w=newGameWindow({runMain:true});
  const r=w.eval(`(()=>{const m=mgmtPasseGenerer('split',{soirees:3});G.mgmt=m;if(!m.poste)mgmtPosteInit(m);const p=m.poste;p.fin=mgmtCalAujourdhui(m);p.conf=4;p.obj.forEach((o,i)=>o.e=i<3?'tenu':'cours');const a=mgmtPosteBilan(m).issue;p.conf=2;p.obj.forEach((o,i)=>o.e=i<2?'tenu':'cours');const b=mgmtPosteBilan(m).issue;p.conf=0;p.obj.forEach(o=>o.e='cours');const c=mgmtPosteBilan(m).issue;return {a,b,c,screen:scr_mgmt_poste_bilan(),carte:typeof scr_mgmt_carte==='function'}})()`);
  assert.deepEqual([r.a,r.b,r.c],['prolonge-augmente','prolonge-condition','renvoi']);assert.match(r.screen,/CONTINUER/);assert.equal(r.carte,true);
});

test('Monde lot 48 T1 — partie réelle, lien absent sans poste et lecture du bilan',()=>{
  const w=newGameWindow({runMain:true});
  const r=w.eval(`(()=>{const m=mgmtPasseGenerer('split',{soirees:3});G.mgmt=m;if(!m.poste)mgmtPosteInit(m);const sansPoste={...m};delete sansPoste.poste;G.mgmt=sansPoste;const accueilSansPoste=scr_mgmt_accueil();G.mgmt=m;m.poste.fin=mgmtCalAujourdhui(m);m.poste.conf=4;m.poste.obj.forEach(o=>{o.e='tenu';});const accueil=scr_mgmt_accueil();const carte=typeof scr_mgmt_carte==='function';const avant={...m};const issue=mgmtPosteBilan(m).issue;mgmtPosteRenouveler(m,issue);mgmtPosteBilanLu=true;const apres=scr_mgmt_accueil();return {accueilSansPoste,accueil,carte,avant,apres,poste:!!m.poste,issue,renewed:m.poste.fin>avant.poste.fin}})()`);
  assert.equal(r.poste,true);
  assert.equal(r.carte,true);
  assert.match(r.accueil,/Le bilan du patron/);
  assert.doesNotMatch(r.accueilSansPoste,/Ton poste/);
  assert.ok(['prolonge-augmente','prolonge-condition'].includes(r.issue));
  assert.equal(r.renewed,true);
  assert.doesNotMatch(r.apres,/Le bilan du patron/);
});

test('Monde lot 48 T1 — date annuelle, confiance verbale et objectifs avec état',()=>{
  const w=newGameWindow({runMain:true});
  const r=w.eval(`(()=>{const m=mgmtPasseGenerer('split',{soirees:3});G.mgmt=m;if(!m.poste)mgmtPosteInit(m);const html=scr_mgmt_poste();return {html,fin:new Date(MGMT_CALENDRIER_DEBUT+m.poste.fin*86400000).getUTCFullYear(),finText:mgmtPosteDateTexte(m.poste.fin)}})()`);
  assert.match(r.html,new RegExp(String(r.fin)));
  assert.match(r.html,/\/ MOIS/);
  assert.match(r.html,/IL EST RAVI|IL EST CONTENT|IL ATTEND DE VOIR|IL COMMENCE À DOUTER|IL N’Y CROIT PLUS/);
  assert.match(r.html,/EN COURS|TENU|FAIT/);
  assert.doesNotMatch(r.html,/\b\d+\s*\/\s*\d+\b|confiance\s*[:=]?\s*\d/i);
});

test('Monde lot 48 T1 — échappement, styles po2 complets, tailles lisibles et rendu rapide',()=>{
  const w=newGameWindow({runMain:true});
  const r=w.eval(`(()=>{const m=mgmtPasseGenerer('split',{soirees:3});G.mgmt=m;if(!m.poste)mgmtPosteInit(m);const start=performance.now();const html=scr_mgmt_poste()+scr_mgmt_poste_bilan();return {html,ms:performance.now()-start,css:document.querySelector('link[href*="ui-cadre.css"]')?.href||''}})()`);
  assert.ok(r.ms<200,`rendu ${r.ms} ms`);
  const classes=[...r.html.matchAll(/class="([^"]+)"/g)].flatMap(x=>x[1].split(/\s+/)).filter(x=>x.startsWith('po2-'));
  const css=require('node:fs').readFileSync(require('node:path').join(__dirname,'..','ui-cadre.css'),'utf8');
  for(const c of new Set(classes)) assert.match(css,new RegExp(`\\.${c}(?![\\w-])`),`style manquant: ${c}`);
  for(const [,size] of css.matchAll(/\.po2-[^{]+\{[^}]*?font(?:-size)?\s*:[^;}]*?(\d+)px/gs)) assert.ok(Number(size)>=22);
  assert.match(r.html,/«/);
});

test('Monde lot 48 T1 — Tab et Maj+Tab changent l’onglet inscrit',()=>{
  const w=newGameWindow({runMain:true});
  const r=w.eval(`(()=>{const m=mgmtPasseGenerer('split',{soirees:3});G.mgmt=m;if(!m.poste)mgmtPosteInit(m);mgmtPosteOngletAjouter('autre','AUTRE',()=>'<p>contenu autre</p>');keysRegister;return {keys:typeof keysRegister,screen:scr_mgmt_poste()}})()`);
  assert.equal(r.keys,'function');assert.match(r.screen,/AUTRE/);
});

test('Ton poste — dates enregistrées, confiance documentée et aucune approche ou soirée inventée',()=>{
 const w=newGameWindow({runMain:true});try{
  w.eval(`setSeed(7);CL.mgmtEnter(1);const m=G.mgmt;m.poste.debut=31;m.poste.fin=396;m.poste.conf=3;
   m.poste.hist=[{s:1,conf:4,note:'progres'},{s:2,conf:4,note:'progres'},{s:3,conf:3,note:'recul'}];m.offres=[];CL.go('mgmt_poste');`);
  const fleches=[...w.document.querySelectorAll('.po2-evenement-fleche')].map(x=>x.textContent);assert.deepEqual(fleches,['—','—','▼']);
  assert.deepEqual([...w.document.querySelectorAll('.po2-evenement-date')].map(x=>x.textContent),['SOIRÉE 1','SOIRÉE 2','SOIRÉE 3']);
  assert.equal(w.document.querySelector('.po2-tabs'),null);
  assert.ok(w.document.querySelector('.po2-bureau-nav .mo67-tabs'));assert.ok(w.document.querySelector('.po2-contrat .po2-offres-bas'));
  assert.ok(w.document.querySelector('.po2-depuis').textContent.includes(w.eval('mgmtPosteDateTexte(G.mgmt.poste.debut)')));
  assert.ok(w.document.querySelector('.po2-prochain strong').textContent.includes(w.eval('mgmtPosteDateTexte(G.mgmt.poste.debut+MGMT_POSTE.mi)')));
  assert.doesNotMatch(w.document.querySelector('.po2-scene').textContent,/LA SOIRÉE 65|Knuckle Gate a demandé ton nom|Évolution de la confiance/);
  const composition=[...w.document.querySelectorAll('.po2-composition')];assert.equal(composition.length,2);
  assert.ok(composition[0].textContent.includes(w.eval(`String(Math.max(0,G.mgmt.card.sizeMain-G.mgmt.card.main.length))`)+' place'));
  w.eval(`keysHandle({key:'Tab',preventDefault(){}})`);assert.equal(w.document.activeElement.textContent,'TON CARNET');
  assert.equal(w.eval(`keysHandle({key:'Enter',target:document.activeElement,preventDefault(){throw Error('Onglet bloqué');}})`),false);
  w.eval(`mgmtPosteOngletAjouter('autre','AUTRE',()=>'<p>Autre rubrique</p>');mgmtPosteOngletActif=0;keysHandle({key:'Tab',shiftKey:true,preventDefault(){}})`);
  assert.equal(w.eval('mgmtPosteOngletActif'),1);assert.match(w.document.querySelector('.po2-scene').textContent,/Autre rubrique/);
 }finally{w.close();}
});

/* Décision : planche UniBilanPatron validée par Anthony ; les trois issues restent accessibles au clavier comme à la souris. */
test('Bilan — bouton et Entrée produisent le même contrat, les mêmes offres et la même destination',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const r=JSON.parse(w.eval(`JSON.stringify((()=>{
      const resultats=[];
      for(const conf of [4,2,0]){
        const m=mgmtPasseGenerer('split',{soirees:3});mgmtPosteInit(m);m.poste.conf=conf;
        m.poste.obj.forEach((o,i)=>o.e=conf===4||conf===2&&i<2?'tenu':'cours');
        const issue=mgmtPosteBilan(m).issue,avant=JSON.stringify(m),sorties=[];
        for(const clavier of [false,true]){
          G.mgmt=JSON.parse(avant);G.screen='mgmt_poste_bilan';document.body.innerHTML=scr_mgmt_poste_bilan();
          if(clavier)keysHandle({key:'Enter',preventDefault(){}});else document.querySelector('.po2-bilan-actions button').click();
          sorties.push({screen:G.screen,poste:G.mgmt.poste,offres:G.mgmt.offres||null,valid:validateMgmt(G.mgmt)});
        }
        resultats.push({issue,identique:JSON.stringify(sorties[0])===JSON.stringify(sorties[1]),...sorties[0]});
      }
      return resultats;
    })())`));
    assert.deepEqual(r.map(x=>x.issue),['prolonge-augmente','prolonge-condition','renvoi']);
    for(const x of r){assert.equal(x.identique,true,x.issue);assert.equal(x.valid,true,x.issue);assert.equal(x.screen,'mgmt_poste');}
    assert.equal(r[0].poste.saison,2);assert.equal(r[0].poste.salaire,4000);
    assert.equal(r[1].poste.saison,2);assert.equal(r[1].poste.salaire,3200);
    assert.equal(r[2].poste.saison,1,'continuer après un renvoi ne renouvelle pas le contrat');
  }finally{w.close();}
});

/* Relevé visuel du 23/10/2026 : la confiance 4 (la meilleure) affichait « Il n'y croit plus » parce que les niveaux des données vont du meilleur au pire et que l'indice était pris tel quel. */
test('Monde lot 48 T1 — la confiance se lit dans le bon sens : 4 est « Il est ravi », 0 « Il n’y croit plus »',()=>{
  const w=newGameWindow({runMain:true});
  const r=JSON.parse(w.eval(`JSON.stringify((()=>({haut:mgmtPosteNiveau(4).niveau,bas:mgmtPosteNiveau(0).niveau,milieu:mgmtPosteNiveau(2).niveau,hors:mgmtPosteNiveau(99).niveau,absent:mgmtPosteNiveau(undefined).niveau}))())`));
  assert.equal(r.haut,'Il est ravi');
  assert.equal(r.bas,'Il n’y croit plus');
  assert.equal(r.milieu,'Il attend de voir');
  assert.equal(r.hors,'Il est ravi');
  assert.equal(r.absent,'Il attend de voir');
});

/* Constat du 23/10/2026 (CI de la PR « Ton poste ») : mgmtManque appelait `.includes` sur le Set rendu par mgmtChampionIds : la création d'une partie plantait pour les organisations dont le manque compte les champions (mgmtPosteInit appelle mgmtManque). */
test('Monde lot 48 T1 — mgmtManque et mgmtPosteInit fonctionnent pour les huit organisations',()=>{
  const w=newGameWindow({runMain:true});
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{const out=[];for(const o of MGMT_ORGANISATIONS){setSeed(5);const m=mgmtDefault(o.id);mgmtNewRoster(m);try{const man=mgmtManque(m);mgmtPosteInit(m);out.push([o.id,!!man,!!m.poste]);}catch(e){out.push([o.id,'ERREUR '+e.message]);}}return out;})())`));
  assert.equal(r.length,8);
  for(const x of r) assert.equal(x[2],true,x[0]+' : '+x[1]);
});
