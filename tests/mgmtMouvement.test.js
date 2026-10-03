"use strict";
/* Lot 5 H9 (contrat §3.5) : le mouvement. Le fil qui défile, les cartes qui
   glissent, les transitions — désactivées par prefers-reduced-motion. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {newGameWindow}=require('./helpers/loadGame');
function result(win,code){ return JSON.parse(win.eval(`JSON.stringify((function(){${code}})())`)); }
const NEUVE=`setSeed(9); const m=mgmtDefault(); mgmtNewRoster(m); mgmtExteriorEnsure(m); mgmtNewPile(m); G={theme:'dark',mgmt:m,screen:'mgmt_bureau'}; MGMT_FIL={actif:false,lignes:[],ms:0,jeton:0}; MGMT_POPUPS={file:[]};
  const moment=(f,id)=>m.facts.push({c:m.cycle,k:'moment_vie',a:f.id,m:id});`;

test('H9 — la durée du fil : deux à quatre secondes, selon les lignes', () => {
  const win=newGameWindow();
  const r=result(win,`return {un:mgmtFilDuree(1),trois:mgmtFilDuree(3),huit:mgmtFilDuree(8),zero:mgmtFilDuree(0),min:MGMT_FIL_MIN_MS,max:MGMT_FIL_MAX_MS};`);
  assert.equal(r.un,2000); assert.equal(r.zero,2000); assert.equal(r.huit,4000); assert.ok(r.trois>=2000&&r.trois<=4000);
  assert.equal(r.min,2000); assert.equal(r.max,4000);
});

test('H9 — les lignes du fil : demandes puis moments relayés, ton cercle d’abord, huit au plus, texte du catalogue', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    m.facts=[]; const [a,b,c,d]=m.roster.slice(0,4); mgmtCercleToggle(m,b.id);
    moment(a,'divorce'); moment(b,'mariage'); moment(c,'enfant-malade'); /* relais vide : privé */
    m.facts.push({c:m.cycle,k:'demande',a:d.id,want:'revanche',target:a.id});
    const l=mgmtFilLignes(m);
    for(const f of m.roster.slice(10,30)) moment(f,'video-virale');
    return {l,tailleMax:mgmtFilLignes(m).length,libM:mgmtVieMomentById('mariage').libelle,libD:mgmtVieMomentById('divorce').libelle,nomB:b.name,nomA:a.name,nomC:c.name,nomD:d.name};
  `);
  assert.ok(r.l[0].startsWith(r.nomD+' demande : une revanche'),'la demande d’abord');
  assert.equal(r.l[1],r.nomB+' : '+r.libM,'puis le cercle'); assert.ok(r.l.includes(r.nomA+' : '+r.libD));
  assert.ok(!r.l.some(x=>x.startsWith(r.nomC+' ')),'un moment privé ne défile pas'); assert.equal(r.tailleMax,8);
});

test('H9 — Continuer ouvre le fil : une semaine avec des moments le montre, une semaine muette non', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    m.facts=[]; moment(m.roster[0],'mariage'); moment(m.roster[1],'divorce');
    CL.mgmtFilDemarrer(); const ouvert=MGMT_FIL.actif, ms=MGMT_FIL.ms, n=MGMT_FIL.lignes.length;
    const html=SCREENS.mgmt_bureau();
    const overlay=html.includes('class="mgmt-fil"')&&html.includes('role="status"')&&html.includes('aria-live="polite"');
    const lignes=(html.match(/class="mgmt-fil-ligne"/g)||[]).length;
    CL.mgmtFilPasser(); const apres=MGMT_FIL.actif; const html2=SCREENS.mgmt_bureau();
    m.facts=[]; CL.mgmtFilDemarrer(); const muet=MGMT_FIL.actif;
    return {ouvert,ms,n,overlay,lignes,apres,disparu:!html2.includes('class="mgmt-fil"'),muet};
  `);
  assert.ok(r.ouvert&&r.overlay); assert.equal(r.lignes,r.n); assert.ok(r.ms>=2000&&r.ms<=4000);
  assert.equal(r.apres,false); assert.ok(r.disparu); assert.equal(r.muet,false,'rien à raconter : rien ne s’ouvre');
});

test('H9 — un clic ou une touche passe le fil ; le délai le passe aussi ; un fil passé ne repasse pas', async () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    m.facts=[]; moment(m.roster[0],'mariage'); CL.mgmtFilDemarrer(); const a=MGMT_FIL.actif;
    document.getElementById('app').innerHTML=SCREENS.mgmt_bureau();
    document.querySelector('.mgmt-fil').click(); const clic=MGMT_FIL.actif;
    CL.mgmtFilDemarrer(); const touche0=MGMT_FIL.actif;
    document.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true})); const touche=MGMT_FIL.actif;
    CL.mgmtFilDemarrer(); document.dispatchEvent(new KeyboardEvent('keydown',{key:'Shift',bubbles:true})); const shift=MGMT_FIL.actif;
    CL.mgmtFilPasser(); const jeton=MGMT_FIL.jeton; CL.mgmtFilPasser();
    return {a,clic,touche0,touche,shift,jetonStable:jeton===MGMT_FIL.jeton};
  `);
  assert.ok(r.a); assert.equal(r.clic,false,'un clic passe le fil'); assert.ok(r.touche0); assert.equal(r.touche,false,'une touche passe le fil');
  assert.equal(r.shift,true,'une touche de modification ne le passe pas'); assert.ok(r.jetonStable);
  /* le délai : le minuteur du fil appelle mgmtFilPasser une fois les 2 à 4 s écoulées */
  win.eval(`${NEUVE} m.facts=[]; moment(m.roster[0],'mariage'); window.__t=[]; const so=window.setTimeout; window.setTimeout=function(f,ms){ window.__t.push([f,ms]); return 1; }; CL.mgmtFilDemarrer(); window.setTimeout=so;`);
  const [fn,ms]=win.eval('window.__t[0]');
  assert.ok(ms>=2000&&ms<=4000,'délai de '+ms+' ms');
  assert.equal(win.eval('MGMT_FIL.actif'),true); win.eval('window.__t[0][0]()'); assert.equal(win.eval('MGMT_FIL.actif'),false,'le délai passe le fil');
});

test('H9 — les cartes : les moments du cercle et des suivis, deux au plus, après le fil, avec portrait et actions', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    m.facts=[]; const [a,b,c,d]=m.roster.slice(0,4); mgmtCercleToggle(m,a.id); mgmtSuiviToggle(m,b.id); mgmtSuiviToggle(m,c.id);
    moment(a,'mariage'); moment(b,'divorce'); moment(c,'video-virale'); moment(d,'deces-parent');
    CL.mgmtFilDemarrer(); const pendantFil=MGMT_POPUPS.file.length; const htmlFil=SCREENS.mgmt_bureau();
    CL.mgmtFilPasser(); const file=MGMT_POPUPS.file.map(x=>x.id); const html=SCREENS.mgmt_bureau();
    return {pendantFil,file,ids:[a.id,b.id,c.id,d.id],carte:html.includes('class="mgmt-popup"'),lien:html.includes('Ton cercle'),
      portrait:html.includes(a.name.toUpperCase())||html.includes(esc(a.name)),moment:html.includes(mgmtVieMomentById('mariage').libelle),
      fiche:html.includes('Voir la fiche'),fermer:html.includes('aria-label="Fermer"'),horsFil:!htmlFil.includes('class="mgmt-popup"')};
  `);
  assert.equal(r.pendantFil,0,'les cartes attendent la fin du fil'); assert.deepEqual(r.file,[r.ids[0],r.ids[1]],'cercle puis suivi, deux au plus');
  assert.ok(r.carte&&r.lien&&r.portrait&&r.moment&&r.fiche&&r.fermer); assert.ok(r.horsFil);
});

test('H9 — fermer une carte montre la suivante ; Échap la ferme ; « Voir la fiche » et « Lui trouver un combat » mènent où il faut', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    m.facts=[]; const [a,b]=m.roster.filter(o=>mgmtAvailable(m,o)).slice(0,2); /* des combattants disponibles : la suspension tirée au cycle ouvert n'entre pas dans l'essai */
    mgmtCercleToggle(m,a.id); mgmtCercleToggle(m,b.id);
    moment(a,'mariage'); moment(b,'divorce'); CL.mgmtFilDemarrer(); CL.mgmtFilPasser();
    const premiere=MGMT_POPUPS.file[0].id; CL.mgmtPopupFermer(); const seconde=MGMT_POPUPS.file[0].id;
    document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true})); const vide=MGMT_POPUPS.file.length;
    CL.mgmtFilDemarrer(); CL.mgmtFilPasser(); const bouton=SCREENS.mgmt_bureau().includes('Lui trouver un combat');
    CL.mgmtPopupFiche(a.id); const fiche=G.screen, fermee=MGMT_POPUPS.file.length;
    G.screen='mgmt_bureau'; CL.mgmtFilDemarrer(); CL.mgmtFilPasser(); CL.mgmtPopupCombat(a.id);
    return {premiere,seconde,ids:[a.id,b.id],vide,bouton,fiche,fermee,carte:G.screen,pick:MGMT_CART.pick};
  `);
  /* à lien égal, le moment le plus lourd d'abord : le divorce (73) avant le mariage (50) */
  assert.equal(r.premiere,r.ids[1]); assert.equal(r.seconde,r.ids[0]); assert.equal(r.vide,0,'Échap ferme la dernière');
  assert.ok(r.bouton,'un combattant libre se voit proposer un combat'); assert.equal(r.fiche,'mgmt_fiche'); assert.equal(r.fermee,0);
  assert.equal(r.carte,'mgmt_carte'); assert.equal(r.pick,r.ids[0],'la carte s’ouvre sur ce combattant');
});

test('H9 — tout est échappé : nom, surnom, libellé ; une ancienne partie n’a ni fil ni carte', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    m.facts=[]; const f=m.roster[0]; f.name='<img src=x>'+f.name; mgmtCercleToggle(m,f.id); moment(f,'mariage');
    CL.mgmtFilDemarrer(); const fil=SCREENS.mgmt_bureau(); CL.mgmtFilPasser(); const carte=SCREENS.mgmt_bureau();
    const ancien=mgmtDefaultAvantH4(); mgmtNewRoster(ancien); mgmtNewPile(ancien); G.mgmt=ancien;
    CL.mgmtFilDemarrer(); const sans=MGMT_FIL.actif||MGMT_POPUPS.file.length>0;
    return {brutFil:fil.includes('<img src=x>'),echFil:fil.includes('&lt;img src=x&gt;'),brutCarte:carte.includes('<img src=x>'),echCarte:carte.includes('&lt;img src=x&gt;'),sans};
  `);
  assert.equal(r.brutFil,false); assert.ok(r.echFil); assert.equal(r.brutCarte,false); assert.ok(r.echCarte); assert.equal(r.sans,false);
});

test('H9 — le CSS : toute animation du mouvement vit sous prefers-reduced-motion:no-preference ; rien ne bouge sinon', () => {
  const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
  const a=html.indexOf('MGMT_LOT5_H9_CSS_MOUVEMENT'), b=html.indexOf('[FIN ANCRE]',a);
  const css=html.slice(a,b);
  const sans=css.replace(/@media\(prefers-reduced-motion:no-preference\)\{[\s\S]*?\n\}\n/,'');
  assert.ok(/@media\(prefers-reduced-motion:no-preference\)\{/.test(css),'bloc no-preference');
  const animee=sans.split('\n').filter(l=>/animation\s*:|transition\s*:/.test(l)&&!/@keyframes/.test(l));
  assert.deepEqual(animee,[],'aucune animation hors du bloc no-preference');
  for(const k of ['mgmtFilEntre','mgmtPopupGlisse','mgmtSemaineEntre']) assert.ok(css.includes('@keyframes '+k),k);
  /* le fil et la carte restent lisibles sans animation : opacité 1 par défaut (la ligne n'est masquée que dans le bloc animé) */
  assert.ok(!/\.mgmt-fil-ligne\{[^}]*opacity:0/.test(sans),'sans animation, les lignes sont visibles');
});

test('H9 — le fil et les cartes sont dans l’ordre de chargement et les écrans existants rendent sans erreur', () => {
  const win=newGameWindow();
  const {readScriptOrder}=require('./helpers/loadGame');
  const ordre=readScriptOrder();
  assert.ok(ordre.indexOf('mgmt-mouvement.js')>ordre.indexOf('mgmt-attention.js')&&ordre.indexOf('mgmt-mouvement.js')<ordre.indexOf('mgmt-screens.js'));
  const r=result(win,`${NEUVE}
    const ecrans=['mgmt_bureau','mgmt_carte','mgmt_fiche','mgmt_classements','mgmt_organisation','mgmt_vestiaire'];
    MGMT_FICHE={id:m.roster[0].id,retour:'mgmt_bureau',cursor:0};
    return ecrans.map(e=>{ G.screen=e; try{ return typeof SCREENS[e]()==='string'; }catch(x){ return String(x); } });
  `);
  assert.deepEqual(r,[true,true,true,true,true,true]);
});
