"use strict";
/* CAGE LEGACY — tests/mgmtClassementsCycle.test.js
   ===========================================================================
   Lot 4 T6 (docs/LOT-4-LA-PEAU-DU-JEU.md §3 T6) — le classement à un cycle
   donné : mgmtDivisionRanking(m,divId,scope,cycle).
   - cycle omis = le classement d'aujourd'hui, à l'exact pour les appelants
     (identique au cycle explicite) ;
   - au cycle passé, la même loi (mgmtRankingCompare) trie les vues d'hier :
     extérieur par mgmtExteriorTrace(line,cycle), Split par le bilan d'AVANT
     COMBAT des traces (m.hist) — recalculé, jamais stocké ;
   - après une soirée, le rang d'hier se retrouve ; après un cycle passé,
     il reste le même (préfixe, rien de stocké).
   ========================================================================== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

test('MGMT T6 — cycle omis à cycle explicite : le même classement, une seule loi', () => {
  const win = newGameWindow();
  const r = JSON.parse(win.eval(`(function(){
    setSeed(300);
    const m=mgmtDefault(); mgmtNewRoster(m); m.cycle=6; mgmtExteriorEnsure(m);
    const avant=JSON.stringify({roster:m.roster,exterieur:m.exterieur});
    const omissions={}, explicites={};
    for(const scope of ['organization','world']){
      omissions[scope]={legere:JSON.stringify(mgmtDivisionRanking(m,'H-light',scope).map(x=>x.id)),
        mouche:JSON.stringify(mgmtDivisionRanking(m,'H-fly',scope).map(x=>x.id))};
      explicites[scope]={legere:JSON.stringify(mgmtDivisionRanking(m,'H-light',scope,m.cycle).map(x=>x.id)),
        mouche:JSON.stringify(mgmtDivisionRanking(m,'H-fly',scope,m.cycle).map(x=>x.id))};
    }
    return JSON.stringify({omissions:omissions,explicites:explicites,
      intact:avant===JSON.stringify({roster:m.roster,exterieur:m.exterieur})});
  })()`));
  assert.equal(r.omissions.world.legere, r.explicites.world.legere,
    'classement mondial, cycle omis et explicite : le même ordre');
  assert.equal(r.omissions.organization.legere, r.explicites.organization.legere,
    'classement de Split, cycle omis et explicite : le même ordre');
  assert.equal(r.omissions.world.mouche, r.explicites.world.mouche,
    'la deuxième catégorie suit la même loi');
  assert.ok(r.intact, 'lire le classement au cycle courant n’écrit sur aucune ligne');
});

test('MGMT T6 — après une soirée, le rang d’hier se retrouve', () => {
  const win = newGameWindow();
  const s = JSON.parse(win.eval(`(function(){
    setSeed(301);
    const m=mgmtDefault(); mgmtNewRoster(m); m.cycle=2; mgmtExteriorEnsure(m);
    /* Une catégorie de Split avec deux disponibles pour booker le combat. */
    let div=null, cible=null;
    for(const d of allDivisions()){
      const dispo=m.roster.filter(o=>o.div===d.id&&!mgmtIsRetired(o)&&mgmtAvailable(m,o));
      if(dispo.length>=2){ div=d.id; cible=[dispo[0],dispo[1]]; break; }
    }
    if(!div) return 'null';
    /* Carte complète : cinq combats bookés à la main, préliminaires par le
       bloc de Leïla (même fixture éprouvée que mgmtEconomie). */
    m.card.main=[];
    const dispo=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o));
    if(dispo.length<10) return 'null';
    /* Lot 5 H3 : la cible est le premier combat booké, jamais un tirage qui
       dépend de la composition du vestiaire (pays pondérés). */
    cible=[dispo[0],dispo[1]]; div=dispo[0].div;
    const avant=JSON.stringify(mgmtDivisionRanking(m,div,'world').map(x=>x.id));
    for(let i=0;i<5;i++) m.card.main.push({a:dispo[2*i].id,b:dispo[2*i+1].id,cycle:m.cycle,slot:'main'});
    m.pile=[]; m.open=null;
    if(mgmtClosePile(m)!=='refill') return 'null';
    const bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open');
    if(!bulk||!mgmtDecide(m,bulk.id,'validate')) return 'null';
    const ev=mgmtRunEvent(m);
    if(!ev) return 'null';
    const apres=JSON.stringify(mgmtDivisionRanking(m,div,'world',m.cycle).map(x=>x.id));
    /* Le management passe ensuite un cycle : le monde avance — le classement
       d'hier doit rester le même, recalculé depuis les traces. */
    mgmtNewPile(m);
    const plusTard=JSON.stringify(mgmtDivisionRanking(m,div,'world',ev.cycle).map(x=>x.id));
    /* Les deux bookés ont bien combattu : leur bilan a avancé. */
    const fa=mgmtFighterById(m,cible[0].id), fb=mgmtFighterById(m,cible[1].id);
    const t=m.hist.find(x=>x.c===ev.cycle&&(x.a.id===fa.id||x.b.id===fb.id));
    if(!t) return 'null';
    return JSON.stringify({avant:avant,apres:apres,plusTard:plusTard,
      joue:fa.W+fa.L+fa.D>0||fb.W+fb.L+fb.D>0});
  })()`));
  assert.ok(s, 'la fixture a booké et joué une soirée');
  assert.equal(s.joue, true, 'les deux combattants visés ont combattu lors de la soirée');
  assert.equal(s.apres, s.avant, 'le rang d’hier se retrouve : même ordre qu’avant la soirée');
  assert.equal(s.plusTard, s.avant, 'un cycle plus tard, le rang d’hier reste le même — recalculé, jamais stocké');
});

test('MGMT T6 — le monde extérieur d’hier suit mgmtExteriorTrace au cycle lu', () => {
  const win = newGameWindow();
  const r = JSON.parse(win.eval(`(function(){
    setSeed(302);
    const m=mgmtDefault(); mgmtNewRoster(m); m.cycle=4; mgmtExteriorEnsure(m);
    const ext=m.exterieur.find(o=>o.div==='H-light');
    if(!ext) return 'null';
    const hier=mgmtDivisionRanking(m,'H-light','world',2);
    const maintenant=mgmtDivisionRanking(m,'H-light','world');
    /* En recalcule indépendant : chaque ligne du monde, trace au cycle 2. */
    const tracesOk=hier.filter(x=>!m.roster.some(o=>o.id===x.id))
      .every(x=>{
        const line=m.exterieur.find(o=>o.id===x.id);
        const t=mgmtExteriorTrace(line,2);
        return t&&x.W===t.pro.W&&x.L===t.pro.L;
      });
    /* Chaque ligne du monde d'hier, recalculée indépendamment sur sa trace
       au cycle 2. */
    return JSON.stringify({hierN:hier.length,maintenantN:maintenant.length,
      tracesOk:tracesOk,hierMeme:hier.every(x=>maintenant.some(y=>y.id===x.id))});
  })()`));
  assert.ok(r, 'la fixture a une ligne extérieure dans la catégorie');
  assert.ok(r.hierN>0, 'le classement d’hier contient des combattants');
  assert.ok(r.tracesOk, 'chaque ligne extérieure d’hier porte le bilan de sa trace au cycle 2');
  assert.ok(r.maintenantN>=r.hierN, 'le classement du jour compte au moins autant de vivants');
});

/* Le retraité du cycle reste au classement d'hier (reprise T6-3) : sa
   retraite est tombée APRÈS le cycle lu, « sort du classement » se lit
   encore. Deux cas : fin de carrière médicale pendant la soirée du cycle
   lu (il y a combattu — l'instantané d'avant combat le classe, capturé par
   le vrai mgmtTraceSide, le même que la soirée capture) et retraite
   d'âge appliquée à l'ouverture d'un cycle postérieur, sans combat
   depuis (bilan courant). */
test('MGMT T6 — un retraité du management reste au classement d’hier', () => {
  const win = newGameWindow();
  const s = JSON.parse(win.eval(`(function(){
    setSeed(303);
    const m=mgmtDefault(); mgmtNewRoster(m); m.cycle=2; mgmtExteriorEnsure(m);
    G={theme:'dark',mgmt:m};
    let div=null;
    for(const d of allDivisions()){
      const dans=m.roster.filter(o=>o.div===d.id&&!mgmtIsRetired(o));
      if(dans.length>=3){ div=d.id; break; }
    }
    if(!div) return 'null';
    const avant=mgmtDivisionRanking(m,div,'world').map(x=>x.id);
    if(avant.length<3) return 'null';
    /* Le combat du cycle lu : la trace est capturée AVANT combat par le
       vrai mgmtTraceSide — le médical y combat, l'age non. */
    const med=m.roster.find(o=>o.div===div&&!mgmtIsRetired(o));
    const age=m.roster.find(o=>o.div===div&&!mgmtIsRetired(o)&&o!==med);
    const memeDiv=m.roster.find(o=>o.div===div&&!mgmtIsRetired(o)&&o!==med&&o!==age);
    if(!med||!age||!memeDiv) return 'null';
    m.hist.push({c:m.cycle,slot:'main',seed:0,rounds:3,
      a:mgmtTraceSide(med),b:mgmtTraceSide(memeDiv),winner:'A',family:'ko',round:1});
    med.retired='medical';
    mgmtAddFact(m,{c:m.cycle,k:'retired',a:med.id});
    mgmtNewPile(m);
    age.retired='age';
    mgmtAddFact(m,{c:m.cycle,k:'retired',a:age.id});
    const hier=mgmtDivisionRanking(m,div,'world',2).map(x=>x.id);
    const vivant=mgmtDivisionRanking(m,div,'world').map(x=>x.id);
    return JSON.stringify({medIn:hier.indexOf(med.id)>=0,
      ageIn:hier.indexOf(age.id)>=0,
      medOut:vivant.indexOf(med.id)<0,ageOut:vivant.indexOf(age.id)<0,
      medMeme:hier.indexOf(med.id)===avant.indexOf(med.id),
      ageMeme:hier.indexOf(age.id)===avant.indexOf(age.id)});
  })()`));
  assert.ok(s,'la fixture a deux retraits lisibles dans une catégorie assez garnie');
  assert.ok(s.medIn,'la fin de carrière médicale du cycle lu figure encore au classement d’hier');
  assert.ok(s.ageIn,'le retraité d’âge du cycle suivant figure aussi au classement d’hier');
  assert.ok(s.medOut,'le fin de carrière médical sort du classement vivant');
  assert.ok(s.ageOut,'le retraite d’âge sort du classement vivant');
  assert.ok(s.medMeme,'la fin de carrière médical garde son rang d’hier');
  assert.ok(s.ageMeme,'le retraite d’âge garde son rang d’hier');
});
