"use strict";
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {newGameWindow}=require('./helpers/loadGame');

test('Recrutement — cases allégées et pastilles proportionnelles aux vraies chances de pépite',()=>{
 const w=newGameWindow({runMain:true});try{
  w.eval(`setSeed(7);CL.mgmtEnter(1);CL.go('mgmt_recruteur_mission')`);
  const d=JSON.parse(w.eval('JSON.stringify(MGMT_RECRUTEUR.destinations)'));
  const nodes=[...w.document.querySelectorAll('.rc-dest')];assert.equal(nodes.length,d.length);
  const remplis=nodes.map((n,i)=>{assert.equal(n.children.length,3);assert.equal(n.querySelectorAll('.rc-dots i').length,3);assert.match(n.querySelector('.rc-dots').getAttribute('aria-label'),new RegExp('1 sur '+d[i].pepites));return n.querySelectorAll('.rc-dot-full').length;});
  for(let a=0;a<d.length;a++)for(let b=0;b<d.length;b++)if(d[a].pepites<d[b].pepites)assert.ok(remplis[a]>=remplis[b]);
  assert.equal(remplis[d.findIndex(x=>x.id==='pologne')],3);assert.equal(remplis[d.findIndex(x=>x.id==='japon')],1);
  assert.match(w.document.querySelector('.rc-mission').textContent,/Chance de pépite1 SUR 40/);
 }finally{w.close();}
});

test('Retours — trois colonnes, profils fermés et navigation vers le profil réellement ouvert',()=>{
 const w=newGameWindow({runMain:true});
 try{
  w.eval(`setSeed(7);const m=mgmtPasseGenerer('split',{soirees:3});m.treasury=100;m.graine='retour-t2';G.mgmt=m;
    mgmtRecruteurEnvoyer(m,{dest:'france',cat:'H-light',style:'lutteur',sem:2});m.cal.jour+=14;mgmtRecruteurRetour(m);MGMT_RC_UI.profil=0;CL.go('mgmt_recruteur_retours');`);
  assert.equal(w.document.querySelector('.rc-contract'),null);
  w.eval('CL.rcReveal()');assert.ok(w.document.querySelector('.rc-list'));assert.ok(w.document.querySelector('.rc-open'));assert.ok(w.document.querySelector('.rc-contract'));
  assert.equal(w.document.querySelector('.rc-open .rc-contract'),null);
  w.eval(`keysHandle({key:'ArrowDown',preventDefault(){}})`);
  assert.equal(w.eval('MGMT_RC_UI.profil'),1);assert.equal(w.eval('G.mgmt.recruteur.retours[0].lus'),1);assert.equal(w.document.querySelector('.rc-contract'),null);
  w.eval(`CL.rcSigner=id=>window.preuveSigne=id;keysHandle({key:'Enter',preventDefault(){}})`);assert.equal(w.preuveSigne,undefined);
  w.eval(`keysHandle({key:' ',preventDefault(){}});keysHandle({key:'Enter',preventDefault(){}})`);
  assert.equal(w.preuveSigne,w.eval('G.mgmt.recruteur.retours[0].profils[1].id'));
  w.eval('CL.rcProfil(-999)');assert.equal(w.eval('MGMT_RC_UI.profil'),0);
 }finally{w.close();}
});

test('Recruteur — la mission affiche la date du calendrier et le prix réellement débité',()=>{
 const w=newGameWindow({runMain:true});
 try{
  const r=JSON.parse(w.eval(`JSON.stringify((()=>{setSeed(7);CL.mgmtEnter(1);const m=G.mgmt;MGMT_RC_UI.dest=1;MGMT_RC_UI.sem=3;
    mgmtCroissanceCoutRecruteur=(m,cout)=>cout-200;m.treasury=17.8;const html=mgmtRcMission(),jour=mgmtJourDateTexte(m.cal.jour+21),avant=m.treasury;
    CL.rcEnvoyer();return {html,jour,debite:avant-m.treasury,retour:mgmtRcMission(),date:mgmtJourDateTexte(m.recruteur.mission.retourLe)};})())`));
  assert.match(r.html,/17\s*800\s*€/);assert.ok(r.html.includes(r.jour));assert.equal(r.debite,17.8);
  assert.ok(r.retour.includes(r.date));assert.ok(!r.html.includes('Caisse insuffisante'));
 }finally{w.close();}
});

test('Monde lot 42 T2 — Recrutement expose ses trois onglets sans remplacer les libres',()=>{const w=newGameWindow();try{const html=w.eval(`(()=>{G=G||{};G.mgmt=mgmtPasseGenerer('split',{soirees:3});return scr_mgmt_recrutement()})()`);assert.match(html,/LES LIBRES/);assert.match(html,/ENVOYER LE RECRUTEUR/);assert.match(html,/SES RETOURS/);assert.match(html,/Le recrutement/);}finally{w.close();}});
test('Monde lot 42 T2 — mission, frais, verrou de mission et fonds insuffisants',()=>{const w=newGameWindow();try{const out=w.eval(`(()=>{let m=mgmtPasseGenerer('split',{soirees:3});G.mgmt=m;let d=MGMT_RECRUTEUR.destinations[1];m.treasury=80;MGMT_RC_UI.dest=1;let h=mgmtRcMission(),before=m.treasury,ok=mgmtRecruteurEnvoyer(m,{dest:d.id,cat:d.categories[0],style:'lutteur',sem:3}),after=m.treasury,one=mgmtRecruteurEnvoyer(m,{dest:d.id,cat:d.categories[0],style:'lutteur',sem:3});delete m.recruteur;m.treasury=10;let poor=mgmtRcMission();return JSON.stringify({html:h,ok,debit:before-after,one,poor:poor.includes('Caisse insuffisante')})})()`);const x=JSON.parse(out);assert.match(x.html,/18\s*000\s*€/);assert.match(x.html,/Lutte, judo/);assert.doesNotMatch(x.html,/H-light|daghestan/);assert.equal(x.html.includes('aria-disabled="true"'),false);assert.equal(x.ok,true);assert.equal(x.debit,18);assert.equal(x.one,false);assert.equal(x.poor,true);}finally{w.close();}});
test('Monde lot 42 T2 — retour fermé puis dévoilé profil par profil',()=>{const w=newGameWindow();try{assert.equal(w.eval(`(()=>{let m=mgmtPasseGenerer('split',{soirees:3});m.treasury=50000;m.graine='retour-t2';G.mgmt=m;mgmtRecruteurEnvoyer(m,{dest:'france',cat:'H-light',style:'lutteur',sem:2});m.cal.jour+=14;let r=mgmtRecruteurRetour(m);if(r.bredouille)return JSON.stringify({bredouille:true});MGMT_RC_UI.profil=0;let before=mgmtRcRetours();CL.rcReveal();let after=mgmtRcRetours();return JSON.stringify({closed:before.includes('Encore fermé'),opened:after.includes(r.profils[0].name),lus:r.lus})})()`),JSON.stringify({closed:true,opened:true,lus:1}));}finally{w.close();}});
test('Monde lot 42 T2 — signature et nom hostile échappé dans le retour',()=>{const w=newGameWindow();try{const ok=w.eval(`(()=>{let m=mgmtPasseGenerer('split',{soirees:3});m.treasury=50000;m.graine='signer-t2';G.mgmt=m;mgmtRecruteurEnvoyer(m,{dest:'france',cat:'H-light',style:'lutteur',sem:2});m.cal.jour+=14;let r=mgmtRecruteurRetour(m);if(r.bredouille)return false;let p=r.profils[0];p.name='<img src=x onerror=alert(1)>';r.lus=1;MGMT_RC_UI.profil=0;let html=mgmtRcRetours();CL.go=(s)=>{window.__screen=s};let f=mgmtRecruteurSigner(m,p.id);return JSON.stringify({safe:!html.includes('<img src=x'),escaped:html.includes('&lt;img'),signed:!!f,offered:!mgmtRcRetours().includes('<img src=x'),inExterior:!!(m.exterieur||[]).some(x=>x.id===p.id),screen:window.__screen})})()`);const x=JSON.parse(ok);assert.equal(x.safe,true);assert.equal(x.escaped,true);assert.equal(x.signed,true);assert.equal(x.offered,true);assert.equal(x.inExterior,true);assert.equal(x.screen,'mgmt_contrats');}finally{w.close();}});
test('Monde lot 42 T2 — classes rc-* stylées et tailles minimales',()=>{const css=fs.readFileSync('mgmt-ecran-recruteur.css','utf8');const js=fs.readFileSync('mgmt-ecran-recruteur.js','utf8');const classes=new Set([...js.matchAll(/class="([^"]*)"/g)].flatMap(m=>m[1].replace(/\$\{[^}]*\}/g,'').split(/\s+/)).filter(x=>x.startsWith('rc-')));for(const c of classes)assert.match(css,new RegExp('\\.'+c+'(?:[\\s.,:{#]|$)'),`classe sans règle : ${c}`);for(const m of css.matchAll(/font-size\s*:\s*(\d+)px/g))assert.ok(Number(m[1])>=22,`texte ${m[1]}px sous 22`);});
test('Monde lot 42 T2 — écran absent de recruteur lisible et rendu rapide',()=>{const w=newGameWindow();try{const html=w.eval(`(()=>{G=G||{};G.mgmt=mgmtDefault();delete G.mgmt.recruteur;const t=Date.now(),h=mgmtRcRetours();return JSON.stringify({ms:Date.now()-t,html:h,tabs:mgmtRcOnglets('mgmt_recruteur_retours')})})()`);const x=JSON.parse(html);assert.ok(x.ms<200);assert.match(x.html,/Aucun retour pour le moment/);assert.match(x.tabs,/LES LIBRES/);}finally{w.close();}});
