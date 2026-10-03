"use strict";
/* Lot 5 T7 : les camps. Une salle et un coach sont des éléments du monde que
   le joueur observe et subit ; tout se déduit, rien ne se stocke. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
function result(win,code){ return JSON.parse(win.eval(`JSON.stringify((function(){${code}})())`)); }
const NEUVE=`setSeed(9); const m=mgmtDefault(); mgmtNewRoster(m); mgmtExteriorEnsure(m); mgmtNewPile(m); G={theme:'dark',mgmt:m,screen:'mgmt_bureau'}; m.facts=[]; m.hist=[]; m.cycle=20;
  const F=m.roster[0];`;

test('T7 — les modèles de salles : propositions relu:false, bâties sur la ville, sans nom de personne ni emplacement oublié', () => {
  const win=newGameWindow();
  const r=result(win,`const t=Object.values(MGMT_SALLES_MODELES).flat();
    return {langues:Object.keys(MGMT_SALLES_MODELES),n:t.length,relu:t.every(x=>x.relu===false),ville:t.every(x=>x.texte.includes('{Ville}')),
      parLangue:Object.values(MGMT_SALLES_MODELES).every(l=>l.length===5),changements:Object.keys(MGMT_CAMP_CHANGEMENTS)};`);
  assert.deepEqual(r.langues,['fr','pt','es','en']); assert.equal(r.n,20); assert.ok(r.relu); assert.ok(r.ville); assert.ok(r.parLangue);
  assert.ok(r.changements.includes('change-de-camp')&&r.changements.includes('coach-meurt'));
});

test('T7 — le camp d\u2019origine se déduit de l\u2019id : stable, sans RNG de partie, jamais stocké ; la salle porte la ville', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const seed=SEED; const a=m.roster.map(f=>JSON.stringify(mgmtCamp(m,f))), b=m.roster.map(f=>JSON.stringify(mgmtCamp(m,f)));
    const champs=Object.keys(F).filter(k=>/camp|coach|salle/i.test(k));
    const camp=mgmtCamp(m,F);
    return {stable:JSON.stringify(a)===JSON.stringify(b),rng:seed===SEED,champs,nomVille:camp.nom.includes(camp.ville),brut:/\\{Ville\\}/.test(camp.nom),
      coach:/^\\S+ \\S+/.test(camp.coach),villes:new Set(m.roster.map(f=>mgmtCamp(m,f).ville)).size};
  `);
  assert.ok(r.stable); assert.ok(r.rng); assert.deepEqual(r.champs,[]); assert.ok(r.nomVille); assert.equal(r.brut,false); assert.ok(r.coach); assert.ok(r.villes>20);
});

test('T7 — 85 % s\u2019entraînent dans leur ville, 15 % ailleurs dans leur pays ; le coach est un nom réel du pays', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    let chez=0,total=0,pays=0,coachOk=0;
    for(let i=0;i<4000;i++){ const f={id:'mg'+(2000+i),div:'H-light',age:27,W:8,L:3,D:0}; const c=mgmtCampInitial(f); total++;
      if(c.ville===mgmtIdentiteVille(f)) chez++; if(c.ck===mgmtIdentitePays(f)) pays++;
      const co=COUNTRIES[c.ck]; const [prenom,...nom]=c.coach.split(' '); if((co.first||FIRST_M).includes(prenom)&&co.last.includes(nom.join(' '))) coachOk++; }
    return {chez:chez/total,pays:pays/total,coachOk:coachOk/total};
  `);
  assert.ok(r.chez>0.8&&r.chez<0.9,'dans sa ville : '+r.chez.toFixed(3)); assert.equal(r.pays,1,'le camp d\u2019origine reste dans son pays'); assert.ok(r.coachOk>0.99,'prénom et nom réels du pays');
});

test('T7 — un changement de camp est un moment de vie gardé : le camp suivant est neuf, le précédent se retrouve avant', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const avant=mgmtCamp(m,F); m.facts.push({c:12,k:'moment_vie',a:F.id,m:'change-de-camp'});
    const t0=mgmtCamp(m,F,11), t1=mgmtCamp(m,F,12), t2=mgmtCamp(m,F,20);
    return {avant:avant.nom+'|'+avant.coach,t0:t0.nom+'|'+t0.coach,t1:t1.nom+'|'+t1.coach,t2:t2.nom,idem:t1.nom===t2.nom,
      change:t1.nom!==t0.nom||t1.ville!==t0.ville,pays:t1.ck===t0.ck,derniere:t2.changement,n:t2.changements};
  `);
  assert.equal(r.avant,r.t0,'avant le changement, le camp d\u2019origine'); assert.ok(r.change,'après, un autre camp'); assert.ok(r.idem); assert.ok(r.pays,'dans le même pays');
  assert.deepEqual(r.derniere,{c:12,id:'change-de-camp',camp:true}); assert.equal(r.n,1);
});

test('T7 — « à l\u2019étranger » change de pays ; la mort ou la retraite du coach change le coach seulement', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const o=mgmtCamp(m,F);
    m.facts.push({c:12,k:'moment_vie',a:F.id,m:'etranger-camp'}); const e=mgmtCamp(m,F,15);
    m.facts=[{c:12,k:'moment_vie',a:F.id,m:'coach-meurt'}]; const c=mgmtCamp(m,F,15);
    return {etranger:e.ck!==o.ck,coachSeul:c.nom===o.nom&&c.ville===o.ville&&c.coach!==o.coach,derniere:c.changement};
  `);
  assert.ok(r.etranger); assert.ok(r.coachSeul); assert.deepEqual(r.derniere,{c:12,id:'coach-meurt',camp:false});
});

test('T7 — les moments à part (dispute avec le coach, déménagement) ne changent le camp que pour une part des combattants', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    let dispute=0, demenage=0, n=0;
    for(let i=0;i<600;i++){ const f={id:'mg'+(3000+i),div:'H-light',age:27,W:8,L:3,D:0}; const m2={roster:[f],facts:[{c:5,k:'moment_vie',a:f.id,m:'dispute-coach-publique'},{c:6,k:'moment_vie',a:f.id,m:'demenage-autre-ville'}],cycle:9,effectifs:1};
      const ch=mgmtCampChangements(m2,f); n++; if(ch[0].camp) dispute++; if(ch[1].camp) demenage++; if(!ch[0].coach) throw new Error('la dispute change aussi le coach'); }
    return {dispute:dispute/n,demenage:demenage/n};
  `);
  assert.ok(r.dispute>0.5&&r.dispute<0.7,'dispute '+r.dispute.toFixed(2)); assert.ok(r.demenage>0.42&&r.demenage<0.58,'déménagement '+r.demenage.toFixed(2));
});

test('T7 — la qualité du camp infléchit la forme ; un changement de camp coûte un rodage de deux cycles', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const par={}; for(const f of m.roster){ const q=mgmtCamp(m,f).qualite; par[q]=(par[q]||0)+1; }
    const f=m.roster.find(o=>mgmtCamp(m,o).qualite===1)||F;
    const q=mgmtCamp(m,f).qualite;
    const sans=mgmtCampForme(m,f,20);
    m.facts.push({c:20,k:'moment_vie',a:f.id,m:'change-de-camp'});
    const rodage=[mgmtCampForme(m,f,20),mgmtCampForme(m,f,21),mgmtCampForme(m,f,22)];
    const quals=[mgmtCamp(m,f,20).qualite,mgmtCamp(m,f,22).qualite];
    const ancien=mgmtDefaultAvantH4(); mgmtNewRoster(ancien);
    return {par,q,sans,rodage,quals,forme:q*MGMT_CAMP_FORME,ancien:mgmtCampForme(ancien,ancien.roster[0],3),ext:mgmtCampForme(m,{id:m.exterieur[0].id,div:m.exterieur[0].div},20)};
  `);
  assert.ok(r.par['-1']>0&&r.par['0']>0&&r.par['1']>0,'des camps bons, ordinaires et moins bons'); assert.equal(r.sans,r.forme);
  assert.equal(r.rodage[0],r.quals[0]*3-3,'le jour du changement : le nouveau camp moins le rodage');
  assert.equal(r.rodage[1],r.quals[0]*3-3,'un cycle après : encore en rodage'); assert.equal(r.rodage[2],r.quals[1]*3,'deux cycles après : le rodage est fini');
  assert.equal(r.ancien,0,'une ancienne partie ne change pas'); assert.equal(r.ext,0,'le monde extérieur ne s\u2019entraîne pas à Split');
});

test('T7 — le camp joue dans le combat : mgmtFightReady lit la qualité et le rodage, le rejeu retrouve la même forme', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const f=m.roster.find(o=>mgmtCamp(m,o).qualite===1&&mgmtVieFormeBaisse(m,o,20)===0);
    const base=mgmtCombatProfile(f).dynamic||0;
    const pret=mgmtFightReady(f,20); const a=pret.dynamic, o2=pret.overall;
    const rejeu=mgmtFightReady(f,20);
    G.mgmt=null; const sansPartie=mgmtFightReady(f,20).dynamic; G.mgmt=m;
    return {base,a,gain:a-base,rejeu:rejeu.dynamic===a&&rejeu.overall===o2,sansPartie};
  `);
  assert.equal(r.gain,3,'un bon camp : +3 de forme'); assert.ok(r.rejeu,'même combat, même forme'); assert.equal(r.sansPartie,r.base,'hors partie, le profil est nu');
});

test('T7 — deux coéquipiers booktés l\u2019un contre l\u2019autre : décision contraire (15) pour les deux, la sauvegarde l\u2019accepte', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const [a,b]=m.roster.filter(o=>mgmtCamp(m,o).ville).slice(0,2);
    /* deux combattants du même camp : on aligne b sur le camp de a par un changement de camp sans effet de hasard */
    let paire=null;
    for(let i=0;i<m.roster.length&&!paire;i++) for(let j=i+1;j<m.roster.length&&!paire;j++) if(mgmtMemeCamp(m,m.roster[i],m.roster[j])) paire=[m.roster[i],m.roster[j]];
    return {trouve:!!paire,a:paire&&paire[0].id,b:paire&&paire[1].id};
  `);
  if(!r.trouve){ /* aucun coéquipier dans ce vestiaire : on fabrique le cas par deux identifiants au même camp */
    const r2=result(win,`${NEUVE}
      const base=m.roster[0]; const camp=mgmtCampInitial(base); let jumeau=null;
      for(let i=0;i<20000&&!jumeau;i++){ const f={id:'mg'+(7000+i),div:base.div,age:27,W:8,L:3,D:0,ck:mgmtIdentitePays(base),generation:1}; const c=mgmtCampInitial(f); if(c.ville===camp.ville&&c.k===camp.k&&c.ck===camp.ck) jumeau=f; }
      m.roster.push(Object.assign(jumeau,{name:'Jumeau Test',first:'Jumeau',last:'Test',D:0,level:2,raison:'x'}));
      const n=mgmtContrariesApresSoiree(m,[{c:20,rounds:3,a:{id:base.id},b:{id:jumeau.id}}]);
      const faits=m.facts.filter(x=>x.k==='contrarie');
      return {n,faits:faits.map(x=>[x.why,x.p]),memeCamp:mgmtMemeCamp(m,base,jumeau),poids:MGMT_CONTRARIE_COEQUIPIER,
        valide:(function(){ const c=JSON.parse(JSON.stringify(m)); c.hist=[]; c.roster=c.roster.filter(o=>o.id!==jumeau.id); c.facts=c.facts.filter(x=>x.a!==jumeau.id); c.facts.push({c:20,k:'contrarie',a:base.id,p:15,why:'coequipier'}); return validateMgmt(c); })()};
    `);
    assert.ok(r2.memeCamp); assert.equal(r2.n,2); assert.deepEqual(r2.faits,[['coequipier',15],['coequipier',15]]); assert.equal(r2.poids,15); assert.ok(r2.valide);
    return;
  }
  assert.ok(r.a&&r.b);
});

test('T7 — « Son camp » sur la fiche : salle, pays, coach, le changement qui l\u2019explique, le rodage ; tout échappé ; rien pour une ancienne partie', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    MGMT_FICHE={id:F.id,retour:'mgmt_bureau',cursor:0}; G.screen='mgmt_fiche';
    const camp=mgmtCamp(m,F); const sans=scr_mgmt_fiche();
    m.cycle=21; m.facts.push({c:20,k:'moment_vie',a:F.id,m:'change-de-camp'});
    const apres=scr_mgmt_fiche(); const c2=mgmtCamp(m,F);
    const ancien=mgmtDefaultAvantH4(); mgmtNewRoster(ancien);
    return {bloc:sans.includes('Son camp')&&sans.includes(camp.nom.replace(/&/g,'&amp;'))&&sans.includes('Coach : '),
      sansChangement:!sans.includes('Rodage'),change:apres.includes(mgmtVieMomentById('change-de-camp').libelle)&&apres.includes('cycle 20'),
      rodage:apres.includes('Rodage dans le nouveau camp'),nouveau:apres.includes(c2.nom.replace(/&/g,'&amp;')),brut:/\\{Ville\\}/.test(apres),ancien:mgmtFicheCamp(ancien,ancien.roster[0])};
  `);
  assert.ok(r.bloc); assert.ok(r.sansChangement); assert.ok(r.change); assert.ok(r.rodage); assert.ok(r.nouveau); assert.equal(r.brut,false); assert.equal(r.ancien,'');
});

test('T7 — le coût : la fiche avec son camp reste rapide, l\u2019ordre de chargement est tenu', () => {
  const win=newGameWindow();
  const {readScriptOrder}=require('./helpers/loadGame');
  const o=readScriptOrder();
  assert.ok(o.indexOf('mgmt-camps-data.js')<o.indexOf('mgmt-camps.js')&&o.indexOf('mgmt-camps.js')<o.indexOf('mgmt-screens.js'));
  const r=result(win,`${NEUVE}
    MGMT_FICHE={id:F.id,retour:'mgmt_bureau',cursor:0}; G.screen='mgmt_fiche'; scr_mgmt_fiche();
    const t=performance.now(); scr_mgmt_fiche(); const fiche=performance.now()-t;
    const t2=performance.now(); for(const f of m.roster) mgmtCampForme(m,f,20); const tous=performance.now()-t2;
    return {fiche,tous};
  `);
  assert.ok(r.fiche<100,'fiche '+r.fiche.toFixed(0)+' ms'); assert.ok(r.tous<400,'camp de tout le vestiaire '+r.tous.toFixed(0)+' ms');
});
