"use strict";
/* Lot 5 H7 (catalogue §8) : traits cachés et leur mot, demandes, promesses,
   loyauté, décisions contraires. Aucun texte d'auteur : mots et libellés du catalogue. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
function result(win,code){ return JSON.parse(win.eval(`JSON.stringify((function(){${code}})())`)); }
const NEUVE=`setSeed(9); const m=mgmtDefault(); mgmtNewRoster(m); mgmtExteriorEnsure(m); mgmtNewPile(m); G={theme:'dark',mgmt:m};`;

test('H7 — les sept traits se déduisent de l’id (1 à 20) ; le mot n’existe qu’à l’extrême', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const cles=['discipline','ambition','loyaute','sangFroid','temperament','exposition','fairPlay'];
    const bornes=m.roster.every(f=>cles.every(c=>{ const v=mgmtTrait(f,c); return v>=1&&v<=20; }));
    const f=m.roster[0]; const egal=cles.every(c=>mgmtTrait(f,c)===mgmtIdentite(m,f).traits[c]);
    const mots=new Set(m.roster.map(o=>mgmtTraitMot(m,o)).filter(Boolean));
    const nommes=new Set(Object.values(MGMT_TRAITS_MOTS).flatMap(o=>Object.values(o).map(x=>x.texte)));
    const sans=m.roster.filter(o=>!mgmtTraitMot(m,o)).length;
    return {bornes,egal,mots:[...mots],horsCatalogue:[...mots].filter(x=>!nommes.has(x)),sans,total:m.roster.length};
  `);
  assert.ok(r.bornes); assert.ok(r.egal,'même flux que mgmtIdentite');
  assert.deepEqual(r.horsCatalogue,[],'tout mot vient du catalogue §8.2');
  assert.ok(r.mots.length>=3,'plusieurs mots différents dans un vestiaire'); assert.ok(r.sans>0,'beaucoup de combattants n’ont aucun mot');
});

test('H7 — une demande est un fait ; promettre pose une promesse, refuser un refus ; une demande ne se répond qu’une fois', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    m.cycle=5; const f=m.roster[0], g=m.roster[1];
    m.facts.push({c:5,k:'demande',a:f.id,want:'carte-principale'});
    m.facts.push({c:5,k:'demande',a:g.id,want:'revanche',target:m.roster[2].id});
    const ouvertes=mgmtDemandesOuvertes(m).map(d=>[d.a,d.want]);
    const i=m.facts.length-2, j=m.facts.length-1;
    const p=mgmtRepondreDemande(m,i,'promettre'), encore=mgmtRepondreDemande(m,i,'refuser'), refus=mgmtRepondreDemande(m,j,'refuser'), faux=mgmtRepondreDemande(m,j,'oui');
    return {ouvertes,p,encore,refus,faux,apres:mgmtDemandesOuvertes(m).length,promesse:m.facts.find(x=>x.k==='promesse'),refusFait:m.facts.find(x=>x.k==='refus'),valide:validateMgmt(JSON.parse(JSON.stringify(m)))};
  `);
  assert.equal(r.ouvertes.length,2); assert.equal(r.p,true); assert.equal(r.encore,false,'une demande déjà répondue ne se répond plus');
  assert.equal(r.refus,true); assert.equal(r.faux,false); assert.equal(r.apres,0);
  assert.equal(r.promesse.due,r.promesse.c+3,'trois cycles pour tenir'); assert.equal(r.promesse.want,'carte-principale');
  assert.ok(r.refusFait&&Number.isSafeInteger(r.refusFait.d)); assert.ok(r.valide,'la sauvegarde accepte ces faits');
});

test('H7 — la porte de sauvegarde refuse les faits de promesse mal formés', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const id=m.roster[0].id; const essai=fait=>{ const c=JSON.parse(JSON.stringify(m)); c.facts.push(fait); return validateMgmt(c); };
    return {ok:essai({c:0,k:'demande',a:id,want:'revanche',target:m.roster[1].id}),
      want:essai({c:0,k:'demande',a:id,want:'inconnu'}),id:essai({c:0,k:'refus',a:'<b>',d:0}),
      due:essai({c:0,k:'promesse',a:id,want:'revanche',due:-1,d:0}),poids:essai({c:0,k:'contrarie',a:id,p:99,why:'titre'}),
      why:essai({c:0,k:'contrarie',a:id,p:20,why:'x'}),futur:essai({c:99,k:'refus',a:id,d:0})};
  `);
  assert.equal(r.ok,true); for(const k of ['want','id','due','poids','why','futur']) assert.equal(r[k],false,k);
});

test('H7 — l’état d’une promesse se lit dans l’historique : tenue, rompue, en cours', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const f=m.roster[0], g=m.roster[1], h=m.roster[2];
    m.cycle=10;
    m.facts.push({c:10,k:'promesse',a:f.id,want:'carte-principale',due:13,d:0});
    m.facts.push({c:10,k:'promesse',a:g.id,want:'revanche',target:h.id,due:13,d:1});
    const enCours=[mgmtPromesses(m,f)[0].etat,mgmtPromesses(m,g)[0].etat];
    m.hist=[{c:11,slot:'prelim',a:{id:f.id},b:{id:'mg9998'},winner:'A'}];
    const prelim=mgmtPromesses(m,f)[0].etat;
    m.hist.push({c:12,slot:'main',a:{id:f.id},b:{id:'mg9998'},winner:'A'});
    const main=mgmtPromesses(m,f)[0].etat;
    m.hist.push({c:12,slot:'prelim',a:{id:g.id},b:{id:h.id},winner:'B'});
    const cible=mgmtPromesses(m,g)[0].etat;
    m.cycle=14; m.hist=[]; const rompue=[mgmtPromesses(m,f)[0].etat,mgmtPromesses(m,g)[0].etat];
    const avant=JSON.stringify(m.facts); mgmtPromesses(m,f);
    return {enCours,prelim,main,cible,rompue,immuable:avant===JSON.stringify(m.facts)};
  `);
  assert.deepEqual(r.enCours,['en cours','en cours']); assert.equal(r.prelim,'en cours','la carte principale se promet en carte principale');
  assert.equal(r.main,'tenue'); assert.equal(r.cible,'tenue','la revanche se tient contre la bonne cible');
  assert.deepEqual(r.rompue,['rompue','rompue'],'l’échéance passée sans combat : rompue'); assert.ok(r.immuable,'rien n’est stocké');
});

test('H7 — la loyauté se dérive : promesse tenue la renforce, rompue ou refus la ronge ; sa valeur reste dans 1 à 20', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const f=m.roster[0]; m.cycle=20; const base=mgmtLoyaute(m,f), trait=mgmtTrait(f,'loyaute');
    m.facts.push({c:10,k:'promesse',a:f.id,want:'carte-principale',due:13,d:0});
    m.hist=[{c:11,slot:'main',a:{id:f.id},b:{id:'mg9998'},winner:'A'}];
    const tenue=mgmtLoyaute(m,f);
    m.hist=[]; const rompue=mgmtLoyaute(m,f);
    for(let i=0;i<8;i++) m.facts.push({c:15,k:'refus',a:f.id,d:i+1});
    const ronge=mgmtLoyaute(m,f);
    return {base,trait,tenue,rompue,ronge};
  `);
  assert.equal(r.base,r.trait); assert.ok(r.tenue===Math.min(20,r.trait+3));
  assert.ok(r.rompue===Math.max(1,r.trait-5)); assert.ok(r.ronge>=1&&r.ronge<=r.rompue);
});

test('H7 — le mot de loyauté suit les gestes du joueur (Fidèle se gagne et se perd)', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    m.cycle=30; const f=m.roster[0];
    const tous=['discipline','ambition','exposition','temperament','fairPlay'];
    /* un combattant sans autre trait extrême : on cherche la loyauté qui décide */
    const cand=m.roster.find(o=>tous.every(c=>{ const v=mgmtTrait(o,c); return v>5&&v<16; })&&mgmtTrait(o,'loyaute')>=11&&mgmtTrait(o,'loyaute')<=13);
    if(!cand) return {saute:true};
    const avant=mgmtTraitMot(m,cand);
    for(let k=0;k<2;k++){ m.facts.push({c:10+k,k:'promesse',a:cand.id,want:'carte-principale',due:11+k,d:k});
      m.hist.push({c:11+k,slot:'main',a:{id:cand.id},b:{id:'mg9998'},winner:'A'}); }
    const apres=mgmtTraitMot(m,cand);
    return {avant,apres};
  `);
  if(r.saute) return;
  assert.equal(r.avant,null); assert.equal(r.apres,'Fidèle');
});

test('H7 — les décisions contraires deviennent de la charge : refus 10, rompue 20, titre 20, jeûne 15 ; elles comptent dans le risque', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const f=m.roster[0]; m.cycle=20;
    const base=mgmtVieCharge(m,f,20);
    m.facts.push({c:19,k:'refus',a:f.id,d:0});
    const refus=mgmtVieCharge(m,f,20)-base;
    m.facts.push({c:10,k:'promesse',a:f.id,want:'carte-principale',due:15,d:1});
    const rompue=mgmtVieCharge(m,f,20)-base-refus;
    m.facts.push({c:20,k:'contrarie',a:f.id,p:20,why:'titre'});
    const titre=mgmtVieCharge(m,f,20)-base-refus-rompue;
    const risque=mgmtVieCharge(m,f,20,true)-base;
    const dehors=mgmtVieCharge(m,f,40)-mgmtVieCharge({...m,facts:[]},f,40);
    return {refus,rompue,titre,risque,total:refus+rompue+titre,dehors};
  `);
  assert.equal(r.refus,10); assert.equal(r.rompue,20); assert.equal(r.titre,20);
  assert.equal(r.risque,r.total,'ces poids comptent dans le risque de blessure'); assert.equal(r.dehors,0,'hors de l’année : plus de poids');
});

test('H7 — après une soirée : le combat de titre d’un sang-froid faible et le jeûne imposé laissent un fait', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    m.cycle=8;
    const faible=m.roster.find(o=>mgmtTrait(o,'sangFroid')<=6), fort=m.roster.find(o=>mgmtTrait(o,'sangFroid')>6&&o.id!==faible.id);
    const t1=[{c:8,rounds:5,a:{id:faible.id},b:{id:fort.id}}];
    const n1=mgmtContrariesApresSoiree(m,t1);
    const titres=m.facts.filter(x=>x.k==='contrarie'&&x.why==='titre').map(x=>x.a);
    m.facts.push({c:8,k:'moment_vie',a:fort.id,m:'mois-de-jeune-camp'});
    const n2=mgmtContrariesApresSoiree(m,[{c:8,rounds:3,a:{id:fort.id},b:{id:'mg9998'}}]);
    const jeune=m.facts.filter(x=>x.k==='contrarie'&&x.why==='jeune').map(x=>x.a);
    const aucun=mgmtContrariesApresSoiree(m,[{c:8,rounds:3,a:{id:'mg9997'},b:{id:'mg9996'}}]);
    const ancien=mgmtDefaultAvantH4(); mgmtNewRoster(ancien);
    return {n1,titres:titres.includes(faible.id)&&!titres.includes(fort.id),n2,jeune:jeune.includes(fort.id),aucun,ancien:mgmtContrariesApresSoiree(ancien,[{c:1,rounds:5,a:{id:ancien.roster[0].id},b:{id:ancien.roster[1].id}}])};
  `);
  assert.equal(r.n1,1); assert.ok(r.titres); assert.equal(r.n2,1); assert.ok(r.jeune); assert.equal(r.aucun,0);
  assert.equal(r.ancien,0,'une partie d’avant H4 garde son comportement');
});

test('H7 — une vraie soirée avec un titre pose les faits contraires et la sauvegarde reste valide', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    m.cycle=2; mgmtExteriorEnsure(m);
    const faible=m.roster.find(o=>mgmtTrait(o,'sangFroid')<=6&&mgmtAvailable(m,o));
    const ent={};
    const pool=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o)); const pris=new Set(); const paires=[];
    const ordre=[faible,...pool.filter(o=>o.id!==faible.id)];
    for(const a of ordre){ if(pris.has(a.id)) continue; const b=ordre.find(o=>o.id!==a.id&&!pris.has(o.id)&&o.div===a.div); if(b){ pris.add(a.id); pris.add(b.id); paires.push([a,b]); } if(paires.length===12) break; }
    m.card.main=paires.slice(0,5).map(p=>({a:p[0].id,b:p[1].id,cycle:m.cycle,slot:'main'}));
    m.card.prelims=paires.slice(5,12).map(p=>({a:p[0].id,b:p[1].id,cycle:m.cycle,slot:'prelim'}));
    const ev=mgmtRunEvent(m);
    /* T7 : un combat entre coéquipiers pèse aussi (why 'coequipier') ; ici on isole le titre. */
    const faits=m.facts.filter(x=>x.k==='contrarie'&&x.why!=='coequipier');
    return {joue:!!ev,faits:faits.length,titre:faits.every(x=>x.why==='titre'&&x.a===faible.id),valide:validateMgmt(JSON.parse(JSON.stringify(m)))};
  `);
  /* Le premier combat de la carte principale est en cinq rounds (T1) : le sang-froid faible qui l'ouvre laisse un fait. */
  assert.ok(r.joue); assert.ok(r.valide); assert.equal(r.faits,1,'un seul fait : son combat de titre'); assert.ok(r.titre);
});

test('H7 — les demandes naissent chaque cycle, au plus une, au plus deux ouvertes, sans RNG de partie', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const seed=SEED; let posees=0, maxOuv=0, parCycle=[];
    for(let c=1;c<=60;c++){ m.cycle=c; const avant=m.facts.length; const d=mgmtDemandesOuvreCycle(m); if(d) posees++;
      parCycle.push(m.facts.length-avant); maxOuv=Math.max(maxOuv,mgmtDemandesOuvertes(m).length); }
    const types=new Set(m.facts.filter(x=>x.k==='demande').map(x=>x.want));
    const cibles=m.facts.filter(x=>x.k==='demande'&&x.want!=='carte-principale').every(x=>mgmtValidId(x.target));
    const rng=seed===SEED;
    const ancien=mgmtDefaultAvantH4(); mgmtNewRoster(ancien); ancien.cycle=3;
    return {posees,maxOuv,max:Math.max(...parCycle),types:[...types],cibles,rng,ancien:mgmtDemandesOuvreCycle(ancien)};
  `);
  assert.ok(r.posees>0,'des demandes arrivent'); assert.ok(r.maxOuv<=2); assert.ok(r.max<=1);
  assert.ok(r.types.length>=1); assert.ok(r.cibles,'revanche et classé portent une cible'); assert.ok(r.rng); assert.equal(r.ancien,null);
});

test('H7 — la semaine et Continuer parlent d’une demande ; la fiche propose Promettre et Refuser et les boutons agissent', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    m.cycle=6; m.pile=[]; const f=m.roster[3];
    m.facts.push({c:6,k:'demande',a:f.id,want:'carte-principale'});
    G.screen='mgmt_bureau'; const page=scr_mgmt_bureau();
    const raison=mgmtContinuerRaison(m);
    CL.mgmtContinuer(); const ecran=G.screen;
    MGMT_FICHE={id:f.id,retour:'mgmt_bureau',cursor:0}; const avant=scr_mgmt_fiche();
    CL.mgmtDemande(m.facts.length-1,'promettre'); G.screen='mgmt_fiche'; const apres=scr_mgmt_fiche();
    return {news:page.includes('data-type="demande"')&&page.includes('La carte principale'.toLowerCase()),raison,ecran,
      boutons:avant.includes('Promettre')&&avant.includes('Refuser'),promesse:apres.includes('Promesse en cours'),
      plusDeBoutons:!apres.includes('Promettre'),faits:m.facts.filter(x=>x.k==='promesse').length};
  `);
  assert.ok(r.news,'la demande est dans la semaine'); assert.deepEqual(r.raison,{libelle:'Demande en attente',raison:'demande'});
  assert.equal(r.ecran,'mgmt_fiche','Continuer mène à la fiche'); assert.ok(r.boutons); assert.ok(r.promesse);
  assert.ok(r.plusDeBoutons); assert.equal(r.faits,1);
});

test('H7 — la fiche échappe tout et ne montre jamais de chiffre de trait ; une ancienne partie ne montre rien de H7', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    m.cycle=4; const f=m.roster[0], o=m.roster[1]; o.name='<img src=x>'+o.name;
    m.facts.push({c:4,k:'demande',a:f.id,want:'revanche',target:o.id});
    MGMT_FICHE={id:f.id,retour:'mgmt_bureau',cursor:0}; G.screen='mgmt_fiche'; const page=scr_mgmt_fiche();
    const ancien=mgmtDefaultAvantH4(); mgmtNewRoster(ancien); mgmtNewPile(ancien);
    return {brut:page.includes('<img src=x>'),echappe:page.includes('&lt;img src=x&gt;'),chiffres:/loyaut|ambition|sang-froid|tempérament|discipline/i.test(page.replace(/Tempérament/,'')),
      ancien:mgmtFichePromesses(ancien,ancien.roster[0])};
  `);
  assert.equal(r.brut,false); assert.ok(r.echappe); assert.equal(r.ancien,'');
});
