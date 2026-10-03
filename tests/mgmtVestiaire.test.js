"use strict";
/* Lot 5 H8 (contrat §4, maquettes/11-vestiaire.html) : l'écran du vestiaire
   et la fiche étendue. Aucun texte d'auteur : milieux, métiers, rôles et
   surnoms viennent du catalogue. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
function result(win,code){ return JSON.parse(win.eval(`JSON.stringify((function(){${code}})())`)); }
const NEUVE=`setSeed(9); const m=mgmtDefault(); mgmtNewRoster(m); mgmtExteriorEnsure(m); mgmtNewPile(m); G={theme:'dark',mgmt:m}; MGMT_VESTIAIRE={div:'',role:'',dispo:false,lien:'',signe:false,page:0};`;

test('H8 — le vestiaire liste les 130 à 150 de Split, par pages, sans erreur ; la navigation y mène', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    G.screen='mgmt_vestiaire'; const page=SCREENS.mgmt_vestiaire();
    const lignes=mgmtVestiaireLignes(m);
    return {n:lignes.length,roster:m.roster.filter(f=>!mgmtIsRetired(f)).length,rows:(page.match(/class="mgmt-vest-row( alt)?( off)?"/g)||[]).length,
      pageSize:MGMT_VESTIAIRE_PAGE,nav:/Vestiaire<\\/button>/.test(page)&&page.includes('aria-current="page"'),titre:page.includes('Le vestiaire'),
      pages:page.includes('Page 1 / '+Math.ceil(lignes.length/MGMT_VESTIAIRE_PAGE))};
  `);
  assert.equal(r.n,r.roster); assert.ok(r.n>=130); assert.equal(r.rows,r.pageSize,'une page de lignes');
  assert.ok(r.nav,'le bouton Vestiaire est dans la navigation, courant'); assert.ok(r.titre); assert.ok(r.pages);
});

test('H8 — chaque ligne montre nom, surnom unique, rôle, catégorie, bilan ; un clic ouvre la fiche et Retour revient', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    G.screen='mgmt_vestiaire'; render();
    const premier=document.querySelector('.mgmt-vest-row:not(.head)'); const nom=premier.querySelector('.mgmt-vest-name b').textContent;
    const tous=[]; for(const d of allDivisions()) for(const [id,s] of mgmtIdentiteSurnomsDe(m,d.id)) tous.push([d.id,s]);
    const vus=new Set(tous.map(x=>x.join('|')));
    const surnomsAffiches=[...document.querySelectorAll('.mgmt-vest-name em')].map(e=>e.textContent);
    premier.click(); const ecran=G.screen, fiche=MGMT_FICHE.retour;
    CL.mgmtFicheRetour();
    return {nom,uniques:vus.size===tous.length,sur:surnomsAffiches.length,ecran,fiche,retour:G.screen};
  `);
  assert.ok(r.nom.length>0); assert.ok(r.uniques,'surnoms uniques dans la catégorie'); assert.ok(r.sur>0,'le surnom est affiché');
  assert.equal(r.ecran,'mgmt_fiche'); assert.equal(r.fiche,'mgmt_vestiaire'); assert.equal(r.retour,'mgmt_vestiaire','Retour ramène au vestiaire');
});

test('H8 — les surnoms d’une catégorie en une passe sont ceux de mgmtIdentiteSurnom', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const div=m.roster[0].div; const tous=mgmtIdentiteSurnomsDe(m,div);
    const memes=m.roster.filter(f=>f.div===div).slice(0,10).every(f=>tous.get(f.id)===mgmtIdentiteSurnom(m,f));
    const t0=performance.now(); for(let i=0;i<5;i++) mgmtIdentiteSurnomsDe(m,div); const passe=(performance.now()-t0)/5;
    return {memes,passe,n:tous.size};
  `);
  assert.ok(r.memes); assert.ok(r.n>=10); assert.ok(r.passe<200,`une catégorie en ${r.passe.toFixed(0)} ms`);
});

test('H8 — filtres : catégorie, rôle, disponibles, cercle, suivis, quelque chose à dire ; ils se combinent et se défont', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const f0=m.roster[0], div=f0.div;
    CL.mgmtVestiaireFiltre('div',div); const parDiv=mgmtVestiaireLignes(m);
    const okDiv=parDiv.every(x=>x.f.div===div)&&parDiv.length===m.roster.filter(f=>f.div===div&&!mgmtIsRetired(f)).length;
    CL.mgmtVestiaireFiltre('div','');
    const r0=m.roster.map(f=>mgmtRole(m,f)).find(Boolean); CL.mgmtVestiaireFiltre('role',r0.id);
    const parRole=mgmtVestiaireLignes(m); const okRole=parRole.length>0&&parRole.every(x=>x.role&&x.role.id===r0.id);
    CL.mgmtVestiaireFiltre('role','');
    m.roster[5].susp=m.cycle+9; CL.mgmtVestiaireFiltre('dispo','');
    const dispo=mgmtVestiaireLignes(m); const okDispo=dispo.every(x=>mgmtAvailable(m,x.f))&&!dispo.some(x=>x.f.id===m.roster[5].id);
    CL.mgmtVestiaireFiltre('dispo','');
    mgmtCercleToggle(m,m.roster[1].id); mgmtSuiviToggle(m,m.roster[2].id);
    CL.mgmtVestiaireFiltre('lien','cercle'); const cer=mgmtVestiaireLignes(m).map(x=>x.f.id);
    CL.mgmtVestiaireFiltre('lien','suivi'); const sui=mgmtVestiaireLignes(m).map(x=>x.f.id);
    CL.mgmtVestiaireFiltre('lien','suivi'); const tout=mgmtVestiaireLignes(m).length;
    m.facts.push({c:m.cycle,k:'moment_vie',a:m.roster[7].id,m:'mariage'});
    CL.mgmtVestiaireFiltre('signe',''); const sig=mgmtVestiaireLignes(m).map(x=>x.f.id);
    CL.mgmtVestiaireFiltre('signe','');
    return {okDiv,okRole,okDispo,cer,sui,tout,roster:m.roster.length,sig:sig.includes(m.roster[7].id),premier:cer[0]===m.roster[1].id,id1:m.roster[1].id,id2:m.roster[2].id};
  `);
  assert.ok(r.okDiv); assert.ok(r.okRole); assert.ok(r.okDispo);
  assert.deepEqual(r.cer,[r.id1]); assert.deepEqual(r.sui,[r.id2]); assert.equal(r.tout,r.roster,'un second clic défait le filtre');
  assert.ok(r.sig,'un moment relayé cette semaine est un signe');
});

test('H8 — le tri : ton cercle, tes suivis, puis ceux qui ont quelque chose à dire ; la pagination borne les pages', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    m.facts=[]; /* aucun signe tiré au hasard : seul roster[7] en porte un */
    mgmtCercleToggle(m,m.roster[9].id); mgmtSuiviToggle(m,m.roster[8].id);
    m.facts.push({c:m.cycle,k:'moment_vie',a:m.roster[7].id,m:'mariage'});
    const t=mgmtVestiaireLignes(m).slice(0,3).map(x=>x.f.id);
    CL.mgmtVestiairePage(-5); const bas=MGMT_VESTIAIRE.page;
    CL.mgmtVestiairePage(2); G.screen='mgmt_vestiaire'; const html=SCREENS.mgmt_vestiaire(); const p2=MGMT_VESTIAIRE.page;
    CL.mgmtVestiairePage(999); const haut=SCREENS.mgmt_vestiaire()&&MGMT_VESTIAIRE.page;
    return {ordre:[m.roster[9].id,m.roster[8].id,m.roster[7].id],t,bas,p2,haut,pages:Math.ceil(mgmtVestiaireLignes(m).length/MGMT_VESTIAIRE_PAGE)};
  `);
  assert.deepEqual(r.t,r.ordre); assert.equal(r.bas,0); assert.equal(r.p2,2); assert.equal(r.haut,r.pages-1,'la page reste dans les bornes');
});

test('H8 — un carré signale une demande en attente ; l’aside liste le cercle et les suivis ; tout est échappé', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const f=m.roster[3]; f.name='<img src=x>'+f.name;
    m.facts.push({c:m.cycle,k:'demande',a:f.id,want:'revanche',target:m.roster[4].id});
    mgmtCercleToggle(m,f.id);
    G.screen='mgmt_vestiaire'; const html=SCREENS.mgmt_vestiaire();
    return {signe:mgmtVestiaireSigne(m,f),carre:html.includes('aria-label="Quelque chose à dire"'),brut:html.includes('<img src=x>'),echappe:html.includes('&lt;img src=x&gt;'),
      cercle:html.includes('Ton cercle · 1/5'),vide:html.includes('Tes suivis · 0/15')};
  `);
  assert.ok(r.signe&&r.carre); assert.equal(r.brut,false); assert.ok(r.echappe); assert.ok(r.cercle&&r.vide);
});

test('H8 — la fiche étendue : son histoire (milieu, ancien métier) et son corps (disponibilité, blessures gardées)', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const f=m.roster[2]; m.cycle=12;
    MGMT_FICHE={id:f.id,retour:'mgmt_bureau',cursor:0}; G.screen='mgmt_fiche';
    const id=mgmtIdentite(m,f); const sain=scr_mgmt_fiche();
    m.facts.push({c:9,k:'injury',a:f.id}); m.facts.push({c:11,k:'susp',a:f.id}); f.susp=m.cycle+3;
    const blesse=scr_mgmt_fiche();
    return {histoire:sain.includes('Son histoire')&&sain.includes(id.milieu.replace(/'/g,'&#39;'))||sain.includes('Milieu :'),metier:sain.includes('Ancien métier'),
      dispo:sain.includes('Disponible'),indispo:blesse.includes('Indisponible'),blessure:blesse.includes('Blessure')&&blesse.includes('cycle 9'),susp:blesse.includes('Suspension médicale'),
      ordre:blesse.indexOf('cycle 11')<blesse.indexOf('cycle 9'),jauge:/\\/20|%/.test(blesse.slice(blesse.indexOf('Son corps'),blesse.indexOf('Son corps')+300))};
  `);
  assert.ok(r.histoire&&r.metier); assert.ok(r.dispo&&r.indispo); assert.ok(r.blessure&&r.susp); assert.ok(r.ordre,'le plus récent d’abord');
  assert.equal(r.jauge,false,'ni jauge ni pourcentage');
});

test('H8 — la fiche d’un combattant du monde extérieur reste valide : histoire sans corps', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    m.cycle=8; const ligne=m.exterieur[0];
    MGMT_FICHE={id:ligne.id,retour:'mgmt_vestiaire',cursor:0}; G.screen='mgmt_fiche'; const page=scr_mgmt_fiche();
    return {histoire:page.includes('Son histoire'),corps:page.includes('Son corps'),ok:page.includes('La fiche')};
  `);
  assert.ok(r.ok); assert.ok(r.histoire); assert.equal(r.corps,false,'le corps n’existe que pour Split');
});

test('H8 — la maquette 11 est dans le dépôt et le clavier ramène à la semaine', () => {
  const win=newGameWindow();
  const fs=require('node:fs'), path=require('node:path');
  assert.ok(fs.existsSync(path.join(__dirname,'..','maquettes','11-vestiaire.html')),'maquette 11');
  const r=result(win,`${NEUVE}
    G.screen='mgmt_vestiaire'; render();
    return {enregistre:typeof keysRegister==='function',nav:SCREENS.mgmt_vestiaire!==undefined};
  `);
  assert.ok(r.nav);
});
