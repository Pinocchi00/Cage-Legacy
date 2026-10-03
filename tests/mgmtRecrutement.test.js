"use strict";
/* Lot 5 T5 (reprend le lot 2B T2, maquettes/12-recrutement.html) : le recrutement.
   Aucune note, aucun pronostic ; le recruté ne change pas de rang mondial. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {newGameWindow}=require('./helpers/loadGame');
function result(win,code){ return JSON.parse(win.eval(`JSON.stringify((function(){${code}})())`)); }
const NEUVE=`setSeed(9); const m=mgmtDefault(); mgmtNewRoster(m); mgmtExteriorEnsure(m); mgmtNewPile(m); G={theme:'dark',mgmt:m,screen:'mgmt_recrutement'}; m.cycle=12; mgmtExteriorEnsure(m); /* le monde se complète à l'ouverture d'un cycle, comme en jeu */
  MGMT_RECRUTEMENT={div:'H-light',page:0,curseur:0,message:''}; const DIV='H-light';`;

test('T5 — les recrutables : le monde hors de Split, du mieux classé au moins bien classé, avec leur trace', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const rec=mgmtRecrutables(m,DIV); const chez=new Set(m.roster.map(o=>o.id));
    const rangs=rec.map(x=>x.rang);
    return {n:rec.length,horsSplit:rec.every(x=>!chez.has(x.id)),croissant:rangs.every((v,i)=>i===0||rangs[i-1]<v),
      champs:Object.keys(rec[0]).sort(),vide:mgmtRecrutables(m,'xx').length,orgsNommees:rec.every(x=>x.orgs.every(o=>MGMT_EXT_ORGS.includes(o))),
      total:mgmtWorldLivingCount(m,DIV),roster:m.roster.filter(o=>o.div===DIV).length};
  `);
  assert.ok(r.n>50); assert.ok(r.horsSplit); assert.ok(r.croissant); assert.equal(r.vide,0); assert.ok(r.orgsNommees);
  assert.deepEqual(r.champs,['W','L','age','derniere','id','name','orgs','rang'].sort(),'nom, âge, bilan, d’où il vient — jamais une note');
  assert.equal(r.n+r.roster,r.total,'le monde de la catégorie = Split + les recrutables');
});

test('T5 — recruter : une ligne de Split à son âge et à son bilan, niveau 1, un fait ; il ne change ni de rang mondial ni la catégorie du monde', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const x=mgmtRecrutables(m,DIV)[5]; const viv=mgmtWorldLivingCount(m,DIV);
    const rangAvant=x.rang; const lineExt=m.exterieur.find(e=>e.id===x.id); const traceAvant=JSON.stringify(mgmtExteriorTrace(lineExt,m.cycle));
    const l=mgmtRecruter(m,x.id);
    const rangApres=mgmtDivisionRank(m,l,'world');
    return {ligne:l,x,rangAvant,rangApres,viv,viv2:mgmtWorldLivingCount(m,DIV),fait:m.facts.filter(f=>f.k==='recrue'),
      ext:m.exterieur.some(e=>e.id===x.id),traceIdentique:traceAvant===JSON.stringify(mgmtExteriorTrace(lineExt,m.cycle)),
      encore:mgmtRecrutables(m,DIV).some(y=>y.id===x.id),cycle:m.cycle,valide:validateMgmt(JSON.parse(JSON.stringify(m)))};
  `);
  assert.equal(r.ligne.id,r.x.id); assert.equal(r.ligne.name,r.x.name); assert.equal(r.ligne.age,r.x.age); assert.equal(r.ligne.W,r.x.W); assert.equal(r.ligne.L,r.x.L);
  assert.equal(r.ligne.level,1); assert.equal(r.ligne.raison,null); assert.equal(r.ligne.interactions,0); assert.equal(r.ligne.org,'Split');
  assert.equal(r.rangApres,r.rangAvant,'signer ne fait pas monter au classement'); assert.equal(r.viv2,r.viv,'recruter ne vide pas la catégorie');
  assert.deepEqual(r.fait,[{c:r.cycle,k:'recrue',a:r.x.id}]); assert.ok(r.ext,'la ligne extérieure reste (QO-9)'); assert.ok(r.traceIdentique,'rien n’est écrit sur la ligne');
  assert.equal(r.encore,false,'il n’est plus recrutable'); assert.ok(r.valide,'la sauvegarde accepte le recruté et son fait');
});

test('T5 — on ne recrute pas deux fois, ni un inconnu, ni un retraité, ni un identifiant bizarre', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const x=mgmtRecrutables(m,DIV)[0]; const a=mgmtRecruter(m,x.id)!==null, b=mgmtRecruter(m,x.id), c=mgmtRecruter(m,'mg999999'), d=mgmtRecruter(m,'<b>'), e=mgmtRecruter(m,m.roster[0].id), f=mgmtRecruter(null,x.id);
    const retraite=m.exterieur.find(l=>l.div===DIV&&!m.roster.some(o=>o.id===l.id)); const cy=m.cycle; m.cycle=cy+5000; const g=mgmtRecruter(m,retraite.id); m.cycle=cy;
    return {a,b,c,d,e,f,g,faits:m.facts.filter(y=>y.k==='recrue').length};
  `);
  assert.ok(r.a); assert.equal(r.b,null); assert.equal(r.c,null); assert.equal(r.d,null); assert.equal(r.e,null); assert.equal(r.f,null); assert.equal(r.g,null,'un retraité du monde ne se recrute pas');
  assert.equal(r.faits,1);
});

test('T5 — aucun plafond de vivier : trente recrues de suite, la sauvegarde reste valide, l’économie ne les compte pas', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const avant=m.roster.length; let n=0;
    for(const d of allDivisions()) for(const x of mgmtRecrutables(m,d.id).slice(0,3)) if(mgmtRecruter(m,x.id)) n++;
    return {n,apres:m.roster.length-avant,ids:new Set(m.roster.map(o=>o.id)).size===m.roster.length,valide:validateMgmt(JSON.parse(JSON.stringify(m))),treasury:m.treasury};
  `);
  assert.equal(r.n,36); assert.equal(r.apres,36); assert.ok(r.ids,'aucun identifiant en double chez Split'); assert.ok(r.valide);
});

test('T5 — le recruté est un combattant de Split : disponible, bookable, dans le vestiaire, avec sa fiche', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const x=mgmtRecrutables(m,DIV)[2]; const l=mgmtRecruter(m,x.id);
    MGMT_VESTIAIRE={div:'',role:'',dispo:false,lien:'',signe:false,page:0};
    const vest=mgmtVestiaireLignes(m).some(y=>y.f.id===l.id);
    MGMT_FICHE={id:l.id,retour:'mgmt_recrutement',cursor:0}; G.screen='mgmt_fiche'; const fiche=scr_mgmt_fiche();
    const adv=m.roster.find(o=>o.id!==l.id&&o.div===l.div&&mgmtAvailable(m,o)&&!mgmtEngaged(m,o));
    const pose=adv?mgmtBookMain(m,l.id,adv.id):null;
    return {dispo:mgmtAvailable(m,l),vest,fiche:fiche.includes(esc(l.name))&&fiche.includes('Chez Split'),pose:!!pose,camp:fiche.includes('Son camp'),
      combat:mgmtCombatProfile(l).phys!==undefined,id:mgmtVoixId(l).length>0};
  `);
  assert.ok(r.dispo); assert.ok(r.vest); assert.ok(r.fiche); assert.ok(r.pose,'on le booke comme les autres'); assert.ok(r.combat); assert.ok(r.id);
});

test('T5 — l’écran : chips des douze catégories, douze lignes, nom + âge + bilan + organisations, bouton Recruter ; ni note ni pronostic', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const html=SCREENS.mgmt_recrutement();
    const lignes=(html.match(/class="mgmt-recru-row( alt)?( cur)?"/g)||[]).length;
    return {chips:(html.match(/class="mgmt-vest-chip[ "]/g)||[]).length,lignes,titre:html.includes('Le recrutement'),bouton:(html.match(/>Recruter</g)||[]).length,
      nav:/Recrutement<\\/button>/.test(html)&&html.includes('aria-current="page"'),note:/note|pronostic[^.]*:|jauge|%|\\/100/i.test(html.replace('Aucune note, aucun pronostic','').replace('aucun plafond',''))
      ,orgs:html.includes('mgmt-recru-orgs'),pages:html.includes('Page 1 / ')};
  `);
  assert.equal(r.chips,12); assert.equal(r.lignes,12); assert.ok(r.titre); assert.equal(r.bouton,12); assert.ok(r.nav); assert.ok(r.orgs); assert.ok(r.pages);
  assert.equal(r.note,false,'aucune note, aucun pourcentage, aucune jauge');
});

test('T5 — la souris : le filtre de catégorie, la pagination (bornée), Recruter retire la ligne et le dit ; un nom hostile est échappé', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const premier=mgmtRecrutables(m,DIV)[0]; const ext=m.exterieur.find(e=>e.id===premier.id);
    const nomOriginal=mgmtExteriorTrace(ext,m.cycle).name;
    CL.mgmtRecrutementFiltre('H-fly'); const div=MGMT_RECRUTEMENT.div; const rec=mgmtRecrutables(m,'H-fly');
    CL.mgmtRecrutementPage(-3); const bas=MGMT_RECRUTEMENT.page; CL.mgmtRecrutementPage(999); G.screen='mgmt_recrutement'; SCREENS.mgmt_recrutement(); const haut=MGMT_RECRUTEMENT.page;
    CL.mgmtRecrutementFiltre(DIV); const x=mgmtRecrutables(m,DIV)[0]; render(); const avant=mgmtRecrutables(m,DIV).length;
    CL.mgmtRecruter(x.id); const apres=mgmtRecrutables(m,DIV).length; const msg=MGMT_RECRUTEMENT.message; const html=SCREENS.mgmt_recrutement();
    return {div,pagesOk:Math.ceil(rec.length/MGMT_RECRUTEMENT_PAGE)-1===haut,bas,avant,apres,msg,nom:x.name,html:html.includes('mgmt-recru-msg'),ok:G.mgmt.facts.some(f=>f.k==='recrue'&&f.a===x.id)};
  `);
  assert.equal(r.div,'H-fly'); assert.ok(r.pagesOk); assert.equal(r.bas,0); assert.equal(r.apres,r.avant-1); assert.equal(r.msg,r.nom+' rejoint Split.'); assert.ok(r.html); assert.ok(r.ok);
});

test('T5 — le clavier : flèches pour la ligne, Entrée ouvre la fiche, R recrute, Échap ramène à la semaine', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const k=KEYS.maps.mgmt_recrutement; render();
    k.ArrowDown(); const c1=MGMT_RECRUTEMENT.curseur; k.ArrowDown(); k.ArrowUp(); const c2=MGMT_RECRUTEMENT.curseur; k.ArrowUp(); k.ArrowUp(); const c0=MGMT_RECRUTEMENT.curseur;
    for(let i=0;i<40;i++) k.ArrowDown(); const bas=MGMT_RECRUTEMENT.curseur;
    MGMT_RECRUTEMENT.curseur=1; const cible=mgmtRecrutables(m,DIV)[1];
    k.r(); const recrue=m.roster.some(o=>o.id===cible.id);
    MGMT_RECRUTEMENT.curseur=0; const suivant=mgmtRecrutables(m,DIV)[0]; k.Enter(); const fiche=G.screen==='mgmt_fiche'&&MGMT_FICHE.id===suivant.id&&MGMT_FICHE.retour==='mgmt_recrutement';
    G.screen='mgmt_recrutement'; k.Escape(); const retour=G.screen;
    return {c1,c2,c0,bas,recrue,fiche,retour,pageMax:MGMT_RECRUTEMENT_PAGE-1};
  `);
  assert.equal(r.c1,1); assert.equal(r.c2,1); assert.equal(r.c0,0,'la ligne ne sort pas par le haut'); assert.equal(r.bas,r.pageMax,'ni par le bas');
  assert.ok(r.recrue,'R recrute la ligne choisie'); assert.ok(r.fiche,'Entrée ouvre la fiche, qui revient au recrutement'); assert.equal(r.retour,'mgmt_bureau');
});

test('T5 — la semaine et le fil racontent la recrue (organisation d’où elle vient) ; tout est échappé', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    m.facts=m.facts.filter(f=>f.k!=='demande'); m.pile=[];
    const x=mgmtRecrutables(m,DIV)[0]; const l=mgmtRecruter(m,x.id); l.name='<img src=x>'+l.name;
    const lignes=mgmtRecruesLignes(m); const fil=mgmtFilLignes(m); const semaine=SCREENS.mgmt_bureau();
    return {n:lignes.length,texte:lignes[0].text,org:x.derniere,fil:fil.some(t=>t.includes('rejoint Split')),semaine:semaine.includes('data-type="recrue"'),
      brut:semaine.includes('<img src=x>'),vieille:(function(){ m.cycle+=5; return mgmtRecruesLignes(m).length; })()};
  `);
  assert.equal(r.n,1); assert.ok(r.texte.includes('rejoint Split, venu de '+r.org)); assert.ok(r.fil); assert.ok(r.semaine); assert.equal(r.brut,false); assert.equal(r.vieille,0,'après deux cycles, plus une nouvelle');
});

test('T5 — une partie d’avant H4 recrute aussi, et sa sauvegarde reste valide', () => {
  const win=newGameWindow();
  const r=result(win,`setSeed(7); const m=mgmtDefaultAvantH4(); mgmtNewRoster(m); mgmtExteriorEnsure(m); mgmtNewPile(m); G={theme:'dark',mgmt:m};
    const x=mgmtRecrutables(m,'H-light')[0]; const l=mgmtRecruter(m,x.id);
    return {ok:!!l,valide:validateMgmt(JSON.parse(JSON.stringify(m))),quota:mgmtWorldLivingCount(m,'H-light')};
  `);
  assert.ok(r.ok); assert.ok(r.valide); assert.equal(r.quota,30,'le monde à 30 tient');
});

test('T5 — la maquette 12 est dans le dépôt, le script est chargé avant les écrans, l’écran rend vite', () => {
  assert.ok(fs.existsSync(path.join(__dirname,'..','maquettes','12-recrutement.html')),'maquette 12');
  const {readScriptOrder}=require('./helpers/loadGame');
  const o=readScriptOrder(); assert.ok(o.indexOf('mgmt-recrutement.js')<o.indexOf('mgmt-screens.js'));
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    SCREENS.mgmt_recrutement(); const t=performance.now(); SCREENS.mgmt_recrutement(); return {ms:performance.now()-t};
  `);
  assert.ok(r.ms<150,'écran en '+r.ms.toFixed(0)+' ms');
});
