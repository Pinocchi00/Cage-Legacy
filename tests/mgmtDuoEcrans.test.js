"use strict";
const test=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');

test('Duo T3 — le menu Duo existe hors démo et reste masqué en démo',()=>{
  const w=newGameWindow();
  assert.equal(w.eval("MF_MENU.some(x=>x.id==='duo')"),true);
  assert.equal(w.eval("CL_DEMO=true; mfMenu().some(x=>x.id==='duo')"),false);
});

test('Duo T8 — création : l’emplacement vide ouvre la saisie des deux noms',()=>{
  const w=newGameWindow();
  w.eval('CL.mgmtDuoParties(); CL.mgmtPartieOuvrir();');
  assert.equal(w.eval('G.screen'),'mgmt_duo_nouvelle');
  assert.match(w.document.body.textContent,/Joueur 1/);
  assert.match(w.document.body.textContent,/Joueur 2/);
});

test('Duo T8 — création : J1 choisit puis J2 ne peut pas reprendre son organisation',()=>{
  const w=newGameWindow();
  w.eval('CL.mgmtDuoNouvelle(1); CL.mgmtDuoNouvelleContinuer(); CL.mgmtDuoNouvelleChoisir(0); CL.mgmtDuoNouvelleValider();');
  assert.equal(w.eval('MGMT_DUO_NOUVELLE.etape'),'b');
  w.eval('CL.mgmtDuoNouvelleChoisir(MGMT_DUO_NOUVELLE.a);');
  assert.notEqual(w.eval('MGMT_DUO_NOUVELLE.i'),0);
});

test('Duo T3 — une création courte se termine sur mgmt_duo avec m.duo posé',()=>{
  const w=newGameWindow({runMain:true});
  /* passé court réel, comme les tests de création existants ; la partie prête est remise à `mgmtNouvelleEntrer` comme le fait la génération */
  w.eval("setSeed(20261018); mgmtPasseGenerer('split',{soirees:6}); mgmtMondeVivantGenerer(G.mgmt,{soirees:6});");
  w.eval("MGMT_NOUVELLE.gen={slot:1,pret:true,m:G.mgmt,duo:{b:'mma-korner',noms:{a:'Anthony',b:'François'}}}; CL.mgmtNouvelleEntrer();");
  /* le QG (T9) n'est pas encore là : tant qu'il manque, l'entrée retombe sur l'écran existant ; il suffit que la partie soit à deux */
  if(w.eval("typeof SCREENS.mgmt_duo==='function'")) assert.equal(w.eval('G.screen'),'mgmt_duo');
  assert.equal(w.eval("G.mgmt.duo&&G.mgmt.duo.b"),'mma-korner');
  assert.equal(w.eval("G.mgmt.duo.noms.a"),'Anthony');
});

test('Duo T8 — création : un nom injecté est échappé et les noms restent en texte',()=>{
  const w=newGameWindow();
  w.eval('CL.mgmtDuoNouvelle(1); MGMT_DUO_NOUVELLE.noms.a="<b>O\'Neil</b>"; MGMT_DUO_NOUVELLE.etape="a"; render();');
  assert.doesNotMatch(w.document.body.innerHTML,/<b>O'Neil<\/b>/i);
  /* Décision d'Anthony du 18/10/2026 (planches Duo) : les noms de joueur s'écrivent en capitales ; le texte reste échappé. */
  assert.match(w.document.body.innerHTML,/&lt;b&gt;O(&#39;|')Neil&lt;\/b&gt;/i);
});

test('Duo T13 — l’écran de soirée est enregistré',()=>{
  const w=newGameWindow();
  assert.equal(w.eval("typeof SCREENS.mgmt_duo_soiree"),'function');
  assert.equal(w.eval("typeof CL.mgmtDuoSoireeRegarder"),'function');
});

test('Duo T3 — une partie Duo rouverte ouvre mgmt_duo si l’écran existe',()=>{
  const w=newGameWindow({runMain:true});
  w.eval('SCREENS.mgmt_duo=()=>"Duo";');
  w.eval('setSeed(20261018); CL.mgmtEnter(1); mgmtDuoActif=()=>true; CL.mgmtEnter(1);');
  assert.equal(w.eval('G.screen'),'mgmt_duo');
});

test('Duo T3 — l’emplacement affiche le libellé DUO et la prochaine super carte',()=>{
  const w=newGameWindow();
  w.eval(`setSeed(20261018); mgmtPasseGenerer('split',{soirees:6}); mgmtMondeVivantGenerer(G.mgmt,{soirees:6}); mgmtDuoCreer(G.mgmt,'mma-korner',{a:'Anthony',b:'François'});`);
  const txt=w.eval(`mgmtPartieHtml(1,1,{dates:{}},Date.now())`);
  assert.match(txt,/DUO · .* × .*Super carte 1/);
});

test('Duo T3 — mgmtDuoEffectif lit le côté B, trie et expose son état',()=>{
  const w=newGameWindow();
  w.eval(`setSeed(20261018); mgmtPasseGenerer('split',{soirees:6}); mgmtMondeVivantGenerer(G.mgmt,{soirees:6}); mgmtDuoCreer(G.mgmt,'mma-korner',{a:'Anthony',b:'François'});`);
  const result=w.eval(`(()=>{const m=G.mgmt,d=allDivisions()[0].id; return mgmtDuoEffectif(m,'b',d);})()`);
  assert.ok(result.length>0);
  const j1ids=w.eval('G.mgmt.roster.map(f=>f.id)');
  assert.ok(result.every(x=>!j1ids.includes(x.id)));
  assert.ok(result.every(x=>['dispo','blesse','libre','refuse'].includes(x.etat)));
  assert.deepEqual(Object.keys(result[0]),['id','name','rang','W','L','D','age','etat','restants','forme']);
});

test('Duo T3 — aucun texte de travail dans les écrans ajoutés',()=>{
  const w=newGameWindow();
  assert.equal(w.eval("String(SCREENS.mgmt_duo_nouvelle()).includes('TODO')"),false);
});

test('Duo T9 — le QG montre les deux organisations, les deux noms échappés et le bouton de l’étape',()=>{
  const w=newGameWindow();
  w.eval(`setSeed(20261018); mgmtPasseGenerer('split',{soirees:6}); mgmtMondeVivantGenerer(G.mgmt,{soirees:6}); mgmtDuoCreer(G.mgmt,'mma-korner',{a:"<b>O'Neil</b>",b:'François'}); G.screen='mgmt_duo'; render();`);
  assert.match(w.document.body.textContent,/Split/);
  assert.match(w.document.body.textContent,/MMA Korner/);
  /* Décision d'Anthony du 18/10/2026 (planches Duo) : les noms de joueur s'écrivent en capitales ; le texte reste échappé. */
  assert.match(w.document.body.innerHTML,/&lt;b&gt;O(&#39;|')Neil&lt;\/b&gt;/i);
  assert.doesNotMatch(w.document.body.innerHTML,/<b>O'Neil<\/b>/i);
  /* Décision d'Anthony du 18/10/2026 (planche DuoQG) : le bouton de l'étape s'écrit « AVANCER — Jusqu'à la super carte du … ». */
  assert.match(w.document.body.textContent,/AVANCER/);
  assert.match(w.document.body.textContent,/Jusqu’à la super carte du/);
});

test('Duo T9 — mgmtDuoAvancer atteint la date et le QG montre l’étape suivante',async()=>{
  const w=newGameWindow();
  w.eval(`setSeed(20261018); mgmtPasseGenerer('split',{soirees:6}); mgmtMondeVivantGenerer(G.mgmt,{soirees:6}); mgmtDuoCreer(G.mgmt,'mma-korner',{a:'Anthony',b:'François'}); G.mgmt.cal.prochaines=[]; G.screen='mgmt_duo'; CL.mgmtDuoAvancer();`);
  for(let i=0;i<200&&!w.eval("G.mgmt.cal.jour>=G.mgmt.duo.prochaine");i++) await new Promise(resolve=>setTimeout(resolve,25));
  assert.equal(w.eval("G.mgmt.cal.jour>=G.mgmt.duo.prochaine"),true);
  assert.equal(w.eval("['encheres','draft'].includes(G.mgmt.duo.etape)"),true);
});

test('Duo T9 — le QG ne contient aucun texte de travail',()=>{
  const w=newGameWindow();
  assert.doesNotMatch(w.eval("String(SCREENS.mgmt_duo)").toUpperCase(),/EMPLACEMENT AUTEUR|TODO/);
});

test('Duo T4 — enchères : le joueur du tour est nommé et les noms restent du texte',()=>{
  const w=newGameWindow({runMain:true});
  w.eval(`const m=G.mgmt||{}; G.mgmt=m; m.duo={b:'mma-korner',noms:{a:"<J1'",b:'J2'},etape:'encheres',encheres:{i:0,lots:[{id:'x',name:'Combattant',div:'plume',rang:1,ouverture:1000,pas:100,prix:0,meneur:null,tour:'a',passes:0,fini:false,gagnant:null}]}};
    m.orgs=m.orgs||{}; m.orgs['mma-korner']={treasury:10000};
    mgmtDuoPartie=(m,c)=>c==='a'?m:m.orgs['mma-korner'];
    mgmtExteriorCombattant=()=>({name:'Combattant',W:2,L:1,D:0,age:25,libre:true});
    mgmtDivisionLabel=()=> 'Poids plume'; mgmtEuros=x=>String(x)+' €'; mgmtOrgNom=()=> 'Organisation';
    CL.go('mgmt_duo_encheres');`);
  assert.match(w.document.body.textContent,/À <J1'/);
  assert.doesNotMatch(w.document.body.innerHTML,/<J1'/);
});
