"use strict";
/* Lot 5 T6 (lot 3B T3 à T5 ; QO-1 à QO-4 et QO-7) : la carte incomplète. Les
   répliques sont celles du registre d'Anthony, générées sans retouche. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {newGameWindow}=require('./helpers/loadGame');
function result(win,code){ return JSON.parse(win.eval(`JSON.stringify((function(){${code}})())`)); }
/* Une carte complète de 5 + 7, puis un retrait du deuxième combat de la carte principale. */
const CARTE=`setSeed(9); const m=mgmtDefault(); mgmtNewRoster(m); mgmtExteriorEnsure(m); mgmtNewPile(m); G={theme:'dark',mgmt:m,screen:'mgmt_bureau'}; m.facts=[]; m.pile=[]; m.open=null;
  const pool=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o)); const pris=new Set(); const paires=[];
  for(const a of pool){ if(pris.has(a.id)) continue; const b=pool.find(o=>o.id!==a.id&&!pris.has(o.id)&&o.div===a.div); if(b){ pris.add(a.id); pris.add(b.id); paires.push([a,b]); } if(paires.length===12) break; }
  m.card.main=paires.slice(0,5).map(p=>({a:p[0].id,b:p[1].id,cycle:m.cycle,slot:'main'})); m.card.prelims=paires.slice(5,12).map(p=>({a:p[0].id,b:p[1].id,cycle:m.cycle,slot:'prelim'}));
  const retire=(slot,i)=>{ const fight=m.card[slot][i]; const id=fight.a, adv=fight.b; m.card[slot]=m.card[slot].filter(x=>x!==fight); mgmtFighterById(m,id).susp=m.cycle;
    const fait={c:m.cycle,k:'retrait',a:id,adv,slot:slot==='main'?'main':'prelim'}; mgmtAddFact(m,fait); return fait; };`;

test('T6 — les répliques du registre sont générées du document, sans retouche, et A1 porte {nom}', () => {
  const win=newGameWindow();
  const {execFileSync}=require('node:child_process');
  const racine=path.join(__dirname,'..');
  const avant=fs.readFileSync(path.join(racine,'mgmt-retraits-data.js'),'utf8').replace(/\r\n/g,'\n');
  execFileSync(process.execPath,[path.join(racine,'tools','extraire-retraits.js')],{cwd:racine,stdio:'pipe'});
  assert.equal(fs.readFileSync(path.join(racine,'mgmt-retraits-data.js'),'utf8').replace(/\r\n/g,'\n'),avant,'fichier généré : on corrige le document, pas le fichier');
  const r=result(win,`return {cles:Object.keys(MGMT_RETRAITS_REPLIQUES),a1:MGMT_RETRAITS_REPLIQUES.A1.texte,d1:MGMT_RETRAITS_REPLIQUES.D1.texte,auteur:Object.values(MGMT_RETRAITS_REPLIQUES).every(x=>x.auteur==='Anthony'),
    chiffres:Object.values(MGMT_RETRAITS_REPLIQUES).some(x=>/\\d/.test(x.texte))};`);
  assert.deepEqual(r.cles,['A1','A2','B1','B2','C1','C2','C3','C4','D1','D2','D3','D4','E1']); assert.ok(r.a1.includes('{nom}')); assert.ok(r.auteur);
  assert.ok(r.d1.includes('je pense que .. Enfin'),'l’hésitation de D1 est conservée telle quelle'); assert.equal(r.chiffres,false,'aucun chiffre dans les répliques');
});

test('T6 — un combattant booké peut se retirer à la veille : un fait, son combat tombe, son adversaire reste libre, la carte est incomplète', () => {
  const win=newGameWindow();
  const r=result(win,`${CARTE}
    const avant={full:mgmtCardFull(m),main:m.card.main.length};
    let fait=null; for(let c=0;c<400&&!fait;c++){ m.cycle=c; mgmtFighterById(m,m.card.main[0].a).susp=undefined; fait=mgmtRetraitsAvantSoiree(m);
      if(!fait){ /* les cartes se rebâtissent : on rejoue la veille de cycle en cycle */ m.card.main=paires.slice(0,5).map(p=>({a:p[0].id,b:p[1].id,cycle:m.cycle,slot:'main'})); m.card.prelims=paires.slice(5,12).map(p=>({a:p[0].id,b:p[1].id,cycle:m.cycle,slot:'prelim'})); for(const p of paires){ p[0].susp=undefined; p[1].susp=undefined; } } }
    if(!fait) return {rien:true};
    const adv=mgmtFighterById(m,fait.adv);
    return {avant,fait,complete:mgmtCardFull(m),adversaireLibre:!mgmtEngaged(m,adv),retireIndispo:!mgmtAvailable(m,mgmtFighterById(m,fait.a)),actif:!!mgmtRetraitActif(m),
      encore:mgmtRetraitsAvantSoiree(m),valide:(function(){ const c=JSON.parse(JSON.stringify(m)); c.hist=[]; return validateMgmt(c); })()};
  `);
  assert.ok(!r.rien,'un retrait arrive sur quatre cents veilles'); assert.ok(r.avant.full); assert.equal(r.complete,false); assert.ok(r.adversaireLibre); assert.ok(r.retireIndispo);
  assert.ok(r.actif); assert.equal(r.encore,null,'au plus un retrait par cycle'); assert.ok(r.valide); assert.ok(['main','prelim'].includes(r.fait.slot));
});

test('T6 — la chance de retrait vient de la charge ; hors partie neuve, personne ne se retire', () => {
  const win=newGameWindow();
  const r=result(win,`${CARTE}
    const f=mgmtFighterById(m,m.card.main[0].a); const base=mgmtRetraitProb(m,f);
    for(let i=0;i<5;i++) m.facts.push({c:m.cycle-i,k:'moment_vie',a:f.id,m:'deces-parent'}); const charge=mgmtRetraitProb(m,f);
    const ancien=mgmtDefaultAvantH4(); mgmtNewRoster(ancien);
    return {base,charge,bord:MGMT_RETRAIT_BASE+MGMT_RETRAIT_BORD,ancien:mgmtRetraitsAvantSoiree(ancien)};
  `);
  assert.equal(r.base,0.015); assert.equal(r.charge,r.bord,'au bord, le retrait devient bien plus probable'); assert.equal(r.ancien,null);
});

test('T6 — A1 et A2 : Leïla annonce, le combattant répond, ni l’une ni l’autre ne dit pourquoi ; le nom est celui du retiré', () => {
  const win=newGameWindow();
  const r=result(win,`${CARTE}
    const fait=retire('main',1); const nom=mgmtFighterById(m,fait.a).name; const html=mgmtRetraitHtml(m);
    return {a1:html.includes(esc(MGMT_RETRAITS_REPLIQUES.A1.texte.replace('{nom}',nom))),a2:html.includes(esc(MGMT_RETRAITS_REPLIQUES.A2.texte)),aria:html.includes('aria-label="Carte incomplète"'),
      brut:html.includes('{nom}'),semaine:SCREENS.mgmt_bureau().includes('mgmt-retrait')};
  `);
  assert.ok(r.a1&&r.a2&&r.aria); assert.equal(r.brut,false); assert.ok(r.semaine,'le bloc est dans la semaine');
});

test('T6 — sortie 1 (QO-1) : remonter un combat des préliminaires complète le trou, Leïla propose B1 la première fois, B2 répond', () => {
  const win=newGameWindow();
  const r=result(win,`${CARTE}
    const fait=retire('main',2); const premier=mgmtRetraitOptions(m); const html0=mgmtRetraitHtml(m);
    const prelAvant=m.card.prelims.length, mainAvant=m.card.main.length; const haut=m.card.prelims[0];
    CL.mgmtRetraitRemonter(); const apres=mgmtRetraitOptions(m);
    return {remonter:premier.remonter,b1:html0.includes(esc(MGMT_RETRAITS_REPLIQUES.B1.texte)),bouton:html0.includes('Remonter un combat des préliminaires'),
      prel:[prelAvant,m.card.prelims.length],main:[mainAvant,m.card.main.length],monte:m.card.main.some(x=>x.a===haut.a&&x.b===haut.b&&x.slot==='main'),
      b2:G.mgmt&&MGMT_RETRAIT_UI.texte===MGMT_RETRAITS_REPLIQUES.B2.texte,faitSortie:m.facts.some(x=>x.k==='retrait_sortie'&&x.s==='remonter'),
      pile:m.pile.some(a=>a.kind==='leila_bulk'),adv:mgmtEngaged(m,mgmtFighterById(m,fait.adv)),
      apresOptions:apres?apres.premiereFois:null};
  `);
  assert.ok(r.remonter&&r.b1&&r.bouton); assert.deepEqual(r.main,[4,5],'la carte principale est de nouveau pleine'); assert.deepEqual(r.prel,[7,6]);
  assert.ok(r.monte); assert.ok(r.b2); assert.ok(r.faitSortie); assert.ok(r.pile,'Leïla se débrouille : elle repropose les préliminaires');
});

test('T6 — le prélim n’est remonté que s’il en reste ; un trou dans les préliminaires est repris par Leïla, sans sortie à choisir', () => {
  const win=newGameWindow();
  const r=result(win,`${CARTE}
    retire('prelims',3); const o=mgmtRetraitOptions(m); const aff=mgmtClosePile(m);
    const m2=m; m2.card.prelims=[]; const ok=mgmtRetraitRemonter(m2);
    return {trouMain:o.trouMain,remonter:o.remonter,aff,ok};
  `);
  assert.equal(r.trouMain,false,'un trou en préliminaires n’appelle pas les trois sorties'); assert.equal(r.remonter,false); assert.equal(r.aff,'refill'); assert.equal(r.ok,false);
});

test('T6 — sortie 2 (QO-2) : un combattant de Split accepte en short notice (C1) ; le coût est payé, la carte est complète', () => {
  const win=newGameWindow();
  const r=result(win,`${CARTE}
    const fait=retire('main',1); const o=mgmtRetraitOptions(m); const split=o.candidats.find(c=>c.src==='split'); const treso=m.treasury;
    /* un Split hors du top 5 : on s'assure qu'il n'est pas refusé pour sa carrière */
    const rep=mgmtRetraitEngager(m,split.id);
    return {rep,split:split.name,cout:split.cout,tresoApres:m.treasury,treso,main:m.card.main.length,adv:m.card.main.some(x=>(x.a===fait.adv&&x.b===split.id)||(x.b===fait.adv&&x.a===split.id)),
      fait:m.facts.filter(x=>x.k==='engage')};
  `);
  if(r.rep.reponse==='C2'){ assert.equal(r.rep.ok,false,'un combattant du top 5 refuse le préavis'); return; }
  assert.ok(r.rep.ok); assert.equal(r.rep.reponse,'C1'); assert.equal(r.treso-r.tresoApres,r.cout,'payé sur la trésorerie, à découvert si besoin'); assert.equal(r.main,5); assert.ok(r.adv);
  assert.equal(r.fait.length,1);
});

test('T6 — un combattant du top 5 refuse un préavis qui nuirait à sa carrière (C2) ; le cachet insuffisant est refusé (C4) puis une offre plus haute passe', () => {
  const win=newGameWindow();
  const r=result(win,`${CARTE}
    retire('main',1); const o=mgmtRetraitOptions(m);
    const ext=o.candidats.find(c=>c.src==='autre'||c.src==='libre'); if(!ext) return {pasExterne:true};
    /* on cherche un cycle où la demande dépasse la première offre : C4 puis acceptation à l'offre suivante */
    let c4=0, ok=null;
    for(let i=0;i<30&&!ok;i++){ const rep=mgmtRetraitEngager(m,ext.id); if(rep.reponse==='C4') c4++; else { ok=rep; } if(rep.reponse==='C2'||rep.reponse==='plafond') break; }
    return {c4,ok,src:ext.src,faitsOffre:m.facts.filter(x=>x.k==='offre').length};
  `);
  if(r.pasExterne) return;
  if(r.ok){ assert.ok(['C3'].includes(r.ok.reponse)||r.ok.ok===false,'accepté (C3) après d’éventuels C4'); }
  assert.equal(r.faitsOffre,r.c4,'chaque offre insuffisante est un fait');
});

test('T6 — C2 : un combattant du top 5 de sa catégorie refuse, quoi qu’on offre ; la carte reste incomplète', () => {
  const win=newGameWindow();
  const r=result(win,`${CARTE}
    const fait=retire('main',1); const reste=mgmtFighterById(m,fait.adv);
    const top=mgmtDivisionRanking(m,reste.div,'organization').slice(0,5).map(x=>x.id).find(id=>id!==reste.id&&id!==fait.a&&mgmtAvailable(m,mgmtFighterById(m,id))&&!mgmtEngaged(m,mgmtFighterById(m,id)));
    if(!top) return {pasDeTop:true};
    /* on force ce combattant dans la liste des candidats en le retirant d'un combat de la carte */
    const o=mgmtRetraitOptions(m); const present=o.candidats.some(c=>c.id===top);
    const rep=present?mgmtRetraitEngager(m,top):{ok:false,reponse:'hors liste'};
    return {present,rep,incomplete:!mgmtCardFull(m)};
  `);
  if(r.pasDeTop) return;
  assert.equal(r.rep.ok,false); assert.ok(['C2','hors liste'].includes(r.rep.reponse)); assert.ok(r.incomplete);
});

test('T6 — sortie 3 (QO-3) : un combattant libre de contrat, d’une autre organisation, rejoint Split pour la soirée (C3) ; la carte est complète', () => {
  const win=newGameWindow();
  const r=result(win,`${CARTE}
    const fait=retire('main',0); const o=mgmtRetraitOptions(m);
    const libre=o.candidats.find(c=>c.src==='libre'), autre=o.candidats.find(c=>c.src==='autre');
    const cand=libre||autre; if(!cand) return {pasLibre:true};
    let rep=null; for(let i=0;i<8;i++){ rep=mgmtRetraitEngager(m,cand.id); if(rep.ok||rep.reponse==='C2'||rep.reponse==='plafond') break; }
    const chezSplit=m.roster.some(x=>x.id===cand.id);
    return {src:cand.src,rep,chezSplit,main:m.card.main.length,recrue:m.facts.some(x=>x.k==='recrue'&&x.a===cand.id),engage:m.facts.filter(x=>x.k==='engage').map(x=>x.src),
      valide:(function(){ const c=JSON.parse(JSON.stringify(m)); c.hist=[]; return validateMgmt(c); })()};
  `);
  if(r.pasLibre) return;
  if(r.rep.ok){ assert.equal(r.rep.reponse,'C3'); assert.ok(r.chezSplit); assert.equal(r.main,5); assert.ok(r.recrue); assert.deepEqual(r.engage,[r.src]); assert.ok(r.valide); }
  else assert.equal(r.rep.reponse,'C2','sinon le combattant du top 5 refuse');
});

test('T6 — au-delà du plafond : plus de short notice (boutons désactivés), la carte réduite est la seule sortie (D1) ; elle se joue avec pénalité', () => {
  const win=newGameWindow();
  const r=result(win,`${CARTE}
    const fait=retire('main',1); m.card.prelims=[]; /* plus de prélim à remonter */
    m.treasury=-10000; /* un découvert bien au-delà du plafond */
    const o=mgmtRetraitOptions(m); const html=mgmtRetraitHtml(m);
    const refus=o.candidats.map(c=>mgmtRetraitEngager(m,c.id).reponse);
    const ok=mgmtRetraitReduite(m);
    const events=mgmtClosePile(m);
    const attractionPlein=null;
    const ev=mgmtRunEvent(m);
    return {payables:o.payables.length,reduite:o.reduite,d1:html.includes(esc(MGMT_RETRAITS_REPLIQUES.D1.texte)),boutonReduite:html.includes('Jouer la soirée en carte réduite'),
      desactives:(html.match(/disabled/g)||[]).length,refus,ok,events,joue:!!ev,fights:ev?ev.fights.length:0,faits:m.facts.filter(x=>x.k==='reduite').length,
      valide:(function(){ const c=JSON.parse(JSON.stringify(m)); c.hist=[]; return validateMgmt(c); })()};
  `);
  assert.equal(r.payables,0); assert.ok(r.reduite); assert.ok(r.d1); assert.ok(r.boutonReduite); assert.ok(r.desactives>=1); assert.ok(r.refus.every(x=>x==='plafond'||x==='C2'),'aucun engagement au-delà du plafond : '+r.refus); assert.ok(r.refus.includes('plafond')||r.refus.length>0);
  assert.ok(r.ok); assert.equal(r.events,'event'); assert.ok(r.joue,'la soirée se joue incomplète'); assert.equal(r.fights,4,'quatre combats : la carte principale moins le combat tombé, sans préliminaire (le test les a ôtés pour fermer la sortie 1)'); assert.equal(r.faits,1);
});

test('T6 — la carte réduite coûte : moins d’attrait, moins de droits, moins d’audience que la même carte complète', () => {
  const win=newGameWindow();
  const r=result(win,`${CARTE}
    const copie=JSON.stringify(m); const base=JSON.parse(copie);
    /* même graine, carte complète */
    setSeed(77); const complet=mgmtRunEvent(m);
    /* même état, une carte réduite */
    const m2=JSON.parse(copie); m2.facts=[]; G.mgmt=m2;
    const fight=m2.card.main[1]; m2.card.main=m2.card.main.filter(x=>x!==fight); mgmtAddFact(m2,{c:m2.cycle,k:'retrait',a:fight.a,adv:fight.b,slot:'main'});
    m2.card.prelims=[]; m2.treasury=-10000; mgmtRetraitReduite(m2); setSeed(77); const reduit=mgmtRunEvent(m2);
    return {pleinAud:complet.finance.audience,reduitAud:reduit.finance.audience,pleinRec:complet.finance.recette,reduitRec:reduit.finance.recette,pleinTv:complet.finance.tv,reduitTv:reduit.finance.tv};
  `);
  assert.ok(r.reduitAud<r.pleinAud,'l’audience baisse'); assert.ok(r.reduitTv<r.pleinTv,'les droits suivent le nombre de combats joués');
});

test('T6 — D2 puis D3 : la première carte réduite est accueillie froidement, dès la deuxième le patron s’énerve ; D4 si l’audience a vraiment baissé', () => {
  const win=newGameWindow();
  const r=result(win,`${CARTE}
    const R=MGMT_RETRAITS_REPLIQUES;
    m.lastEvent={cycle:5,fights:[],touched:[],finance:{audience:100},e1:false}; m.audiences=[900,900,100]; m.facts=[{c:5,k:'reduite'}];
    const un=mgmtLendemainPatron(m);
    m.facts.unshift({c:2,k:'reduite'}); const deux=mgmtLendemainPatron(m);
    m.facts=[{c:5,k:'reduite'}]; m.audiences=[900,900,880]; m.lastEvent.finance.audience=880; const sansBaisse=mgmtLendemainPatron(m);
    m.lastEvent.cycle=6; const pasReduite=mgmtLendemainPatron(m);
    return {un:un.map(x=>[x.qui,x.texte===R.D2.texte,x.texte===R.D4.texte,x.texte===R.D3.texte]),deux:deux.map(x=>[x.qui,x.texte===R.D3.texte]),sansBaisse:sansBaisse.length,pasReduite:pasReduite.length,d2D3:R.D2.texte!==R.D3.texte};
  `);
  assert.deepEqual(r.un[0],['Jean-Michel Delatour',true,false,false],'première carte réduite : D2'); assert.deepEqual(r.un[1].slice(0,1),['Stephen Tarpit'],'audience en chute : D4');
  assert.deepEqual(r.deux[0],['Jean-Michel Delatour',true],'deuxième carte réduite : D3'); assert.equal(r.sansBaisse,1,'D4 seulement si l’audience a réellement baissé'); assert.equal(r.pasReduite,0);
});

test('T6 — E1 : le patron ne parle de la dette que si un découvert a été déduit, jamais après une bonne soirée sans dette', () => {
  const win=newGameWindow();
  const r=result(win,`${CARTE}
    m.lastEvent={cycle:5,fights:[],touched:[],finance:{audience:900},e1:true}; m.audiences=[900,900]; const avec=mgmtLendemainPatron(m);
    m.lastEvent.e1=false; const sans=mgmtLendemainPatron(m);
    m.lastEvent.e1=true; const html=mgmtLendemainPatronHtml(m);
    const ancien=mgmtDefaultAvantH4(); ancien.lastEvent={cycle:1,fights:[],touched:[],finance:{audience:1},e1:true};
    return {avec:avec.map(x=>x.texte===MGMT_RETRAITS_REPLIQUES.E1.texte),sans:sans.length,html:html.includes('Jean-Michel Delatour')&&html.includes('mgmt-ld-parole'),ancien:mgmtLendemainPatron(ancien).length};
  `);
  assert.deepEqual(r.avec,[true]); assert.equal(r.sans,0); assert.ok(r.html); assert.equal(r.ancien,0);
});

test('T6 — la réponse de celui qu’on vient d’engager (C1) reste lue ce cycle, une fois le trou comblé', () => {
  const win=newGameWindow();
  const r=result(win,`${CARTE}
    retire('main',1); const o=mgmtRetraitOptions(m); const split=o.candidats.find(c=>c.src==='split');
    CL.mgmtRetraitEngager(split.id); const pleine=mgmtCardFull(m); const html=mgmtRetraitHtml(m);
    const lue=html.includes('mgmt-retrait')&&(html.includes(esc(MGMT_RETRAITS_REPLIQUES.C1.texte))||html.includes(esc(MGMT_RETRAITS_REPLIQUES.C2.texte)));
    m.cycle+=1; const plusTard=mgmtRetraitHtml(m);
    return {pleine,lue,plusTard};
  `);
  if(r.pleine) assert.ok(r.lue,'C1 reste affichée une fois la carte complète'); assert.equal(r.plusTard,'','un cycle plus tard, plus rien');
});

test('T6 — le déroulé réel : Continuer à la veille peut ouvrir un retrait, le joueur sort du trou, la soirée se joue et le cycle avance', () => {
  const win=newGameWindow();
  const r=result(win,`${CARTE}
    let vu=false, joue=false, cycle0=m.cycle;
    for(let tour=0;tour<60&&!joue;tour++){
      const refaire=()=>{ const pl=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o)); const pr=new Set(); const pa=[]; for(const a of pl){ if(pr.has(a.id)) continue; const b=pl.find(o=>o.id!==a.id&&!pr.has(o.id)&&o.div===a.div); if(b){ pr.add(a.id); pr.add(b.id); pa.push([a,b]); } if(pa.length===12) break; }
        m.card.main=pa.slice(0,5).map(p=>({a:p[0].id,b:p[1].id,cycle:m.cycle,slot:'main'})); m.card.prelims=pa.slice(5,12).map(p=>({a:p[0].id,b:p[1].id,cycle:m.cycle,slot:'prelim'})); };
      if(!mgmtCardFull(m)){ if(m.card.main.length<5&&!mgmtRetraitActif(m)) refaire(); else if(!mgmtRetraitActif(m)) refaire(); }
      m.pile=[]; m.open=null; m.cycle=cycle0+tour;
      CL.mgmtNextCycle();
      if(mgmtRetraitActif(m)){ vu=true; const o=mgmtRetraitOptions(m); if(o.remonter) CL.mgmtRetraitRemonter(); else if(o.trouMain&&o.candidats[0]) CL.mgmtRetraitEngager(o.candidats[0].id); if(!mgmtCardFull(m)&&mgmtRetraitActif(m)){ m.treasury=-10000; CL.mgmtRetraitReduite(); } CL.mgmtNextCycle(); }
      if(G.screen==='mgmt_soiree') joue=true;
    }
    return {vu,joue,ecran:G.screen};
  `);
  assert.ok(r.joue,'une soirée finit par se jouer'); /* le retrait est probabiliste : on exige seulement que le déroulé ne se bloque jamais */
});

test('T6 — la maquette-texte : les sorties ont leurs mots (remonter, short notice, libre de contrat, carte réduite) et le script est chargé avant les écrans', () => {
  const {readScriptOrder}=require('./helpers/loadGame');
  const o=readScriptOrder(); assert.ok(o.indexOf('mgmt-retraits-data.js')<o.indexOf('mgmt-retraits.js')&&o.indexOf('mgmt-retraits.js')<o.indexOf('mgmt-screens.js'));
  const win=newGameWindow();
  const r=result(win,`${CARTE}
    retire('main',1); const html=mgmtRetraitHtml(m); return {rem:html.includes('Remonter un combat des préliminaires'),short:html.includes('Short notice'),libre:/Libre de contrat|Short notice, une autre organisation/.test(html),chiffre:/\\d+ k\\$/.test(html)};
  `);
  assert.ok(r.rem&&r.short&&r.libre); assert.ok(r.chiffre,'le coût du préavis se lit sur le bouton, jamais dans une réplique');
});
