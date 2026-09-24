"use strict";
/* CAGE LEGACY — tests/mgmtTrace.test.js
   ============================================================================
   LOT 3 T1 LA TRACE (docs/LOT-3-L-ARENE.md §3 T1 ; constat C3 de
   docs/AUDIT-17-09.md). Couvre :

   - le rejeu fidèle (§3 T1) : chaque combat rejoué depuis sa trace redonne
     EXACTEMENT le même déroulé — même vainqueur, même famille de méthode,
     même round, même log moment pour moment (déroulés sérialisés comparés)
     — sur plusieurs graines et plusieurs soirées enchaînées, et rejouer ne
     déplace jamais la suite des tirages de la partie ;
   - l'historique survit aux soirées enchaînées (c'est précisément ce que C3
     reprochait au code actuel) : m.hist accumule, m.lastEvent est écrasé,
     la trace ne l'est pas ;
   - un adversaire disparu du roster ne casse pas l'historique de celui qui
     reste : l'adversaire est une référence copiée dans la trace, jamais une
     garantie ;
   - les migrations 5 → 6, 6 → 7 et 7 → 8 : une sauvegarde antérieure se charge sans perte ;
   - validateMgmt refuse un historique structurellement faux, mgmtRepair
     écarte une entrée illisible sans bloquer le chargement.

   Méthode : le vrai jeu (harnais loadGame), les vraies soirées
   (mgmtNewPile → carte principale en fixture §T3 → proposition en bloc de
   Leïla validée → mgmtRunEvent). Les déroulés ORIGINAUX sont captés au vol
   par une enveloppe posée puis retirée autour de simulateFight — le code du
   jeu n'est jamais modifié. Aucune interface : l'arène est la T2.
   ============================================================================ */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

/* État management neuf, roster généré par le vrai mgmtNewRoster. */
function freshMgmt(win,seed){
  win.eval(`(function(){ setSeed(${seed}); const m=mgmtDefault(); mgmtNewRoster(m); G={theme:'dark',mgmt:m}; })()`);
}

/* Une soirée complète : un cycle s'ouvre (mgmtNewPile, le compteur avance),
   la carte principale est posée en fixture (§T3, docs/LOT-2-CARTE-
   PRINCIPALE.md : la composition est le geste du joueur, T2), la
   proposition en bloc de Leïla est validée (les quatre préliminaires),
   mgmtRunEvent. @returns {boolean} vrai si la soirée a été jouée. */
function joueSoiree(win){
  return win.eval(`(function(){
    const m=G.mgmt;
    mgmtNewPile(m);
    m.card.main=[];
    const dispo=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o));
    if(dispo.length<10) return false;
    for(let i=0;i<5;i++) m.card.main.push({a:dispo[2*i].id,b:dispo[2*i+1].id,cycle:m.cycle,slot:'main'});
    m.pile=[]; m.open=null;
    if(mgmtClosePile(m)!=='refill') return false;
    const bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open');
    if(!bulk||!mgmtDecide(m,bulk.id,'validate')) return false;
    return !!mgmtRunEvent(m);
  })()`);
}

/* Capte les déroulés originaux au vol : le harnais enveloppe simulateFight
   le temps des soirées, puis le restitue — le jeu appelle ensuite le moteur
   tel qu'il l'a toujours appelé. */
function brancheEspion(win){
  win.eval(`(function(){
    window.__origSimulateFight=simulateFight;
    window.__deroules=[];
    simulateFight=function(A,B,r){
      const res=window.__origSimulateFight(A,B,r);
      window.__deroules.push(JSON.stringify(res));
      return res;
    };
  })()`);
}
function retireEspion(win){
  win.eval(`(function(){ simulateFight=window.__origSimulateFight; window.__origSimulateFight=null; })()`);
}

/* Joue au plus maxSoirees soirées (des cycles sans carte complète sont
   possibles : suspensions, pot épuisé — la soirée attend, T5). */
function joueSoirees(win,n,maxCycles){
  win.eval(`(function(){
    window.__jouees=0;
    for(let g=0;g<${maxCycles}&&window.__jouees<${n};g++){
      if(joueSoireeImpl()) window.__jouees++;
    }
    function joueSoireeImpl(){
      const m=G.mgmt;
      mgmtNewPile(m);
      m.card.main=[];
      const dispo=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o));
      if(dispo.length<10) return false;
      for(let i=0;i<5;i++) m.card.main.push({a:dispo[2*i].id,b:dispo[2*i+1].id,cycle:m.cycle,slot:'main'});
      m.pile=[]; m.open=null;
      if(mgmtClosePile(m)!=='refill') return false;
      const bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open');
      if(!bulk||!mgmtDecide(m,bulk.id,'validate')) return false;
      return !!mgmtRunEvent(m);
    }
  })()`);
  return win.eval('window.__jouees');
}

/* ---- Tâche 3 : la preuve que le rejeu est fidèle ------------------------- */
test('MGMT trace — rejeu fidèle : chaque combat rejoué redonne le même déroulé, moment pour moment', () => {
  for(const seed of [20260921, 31337, 4242]){
    const win = newGameWindow();
    freshMgmt(win,seed);
    brancheEspion(win);
    const jouees=joueSoirees(win,3,12);
    retireEspion(win);
    const s = JSON.parse(win.eval(`(function(){
      const m=G.mgmt, rep=[];
      for(let i=0;i<m.hist.length;i++){
        const res=mgmtReplayFight(m.hist[i]);
        /* Une décision ne porte pas de round (judgesVerdict) : le même
           repli à 3 que mgmtRunEvent s'applique des deux côtés. */
        rep.push({d:JSON.stringify(res)===window.__deroules[i],
          w:res.winner===m.hist[i].winner,
          f:mgmtMethodFamily(res.method,res.winner)===m.hist[i].family,
          r:(Number.isSafeInteger(res.round)?res.round:3)===m.hist[i].round});
      }
      return JSON.stringify({n:m.hist.length,deroules:window.__deroules.length,rep});
    })()`));
    assert.equal(jouees,3,'trois soirées jouées (graine '+seed+')');
    assert.equal(s.n,27,'neuf combats par soirée, trois soirées : 27 traces (graine '+seed+')');
    assert.equal(s.deroules,27,'27 déroulés originaux captés (graine '+seed+')');
    assert.equal(s.rep.length,27,'chaque trace a été rejouée (graine '+seed+')');
    for(let i=0;i<s.rep.length;i++){
      assert.ok(s.rep[i].d,'déroulé rejoué identique, moment pour moment (graine '+seed+', combat '+i+')');
      assert.ok(s.rep[i].w&&s.rep[i].f&&s.rep[i].r,
        'vainqueur, famille et round identiques (graine '+seed+', combat '+i+')');
    }
  }
});

test('MGMT trace — rejouer un combat ne déplace pas la suite des tirages de la partie', () => {
  const win = newGameWindow();
  freshMgmt(win,20260923);
  assert.ok(joueSoiree(win),'une soirée a été jouée');
  /* rnd() est une fonction pure de SEED — l'état entier du générateur tient
     dans cet entier : l'égalité de SEED avant et après le rejeu est la
     preuve complète que la suite des tirages de la partie n'a pas bougé. */
  const s = JSON.parse(win.eval(`(function(){
    const etat0=SEED;
    const trois=[rnd(),rnd(),rnd()];
    const etat1=SEED;
    mgmtReplayFight(G.mgmt.hist[0]);
    const etat2=SEED;
    mgmtReplayFight(G.mgmt.hist[7]);
    const etat3=SEED;
    const suite=[rnd(),rnd(),rnd()];
    return JSON.stringify({etat0,etat1,etat2,etat3,trois,suite});
  })()`));
  assert.equal(s.etat2, s.etat1, 'un rejeu ne consomme aucun tirage (SEED restauré)');
  assert.equal(s.etat3, s.etat1, 'deux rejeux non plus — le motif SEED sauvegardé / restauré tient');
  assert.notEqual(s.etat1, s.etat0, 'les trois tirages de référence ont bien fait avancer la partie');
});

/* ---- Tâche 2 : l'historique par combattant ne se perd plus (C3) ---------- */
test('MGMT trace — l\u2019historique survit aux soirées enchaînées : m.lastEvent est écrasé, la trace non', () => {
  const win = newGameWindow();
  freshMgmt(win,20260922);
  const compte=[];
  for(let e=0;e<3;e++){
    assert.ok(joueSoiree(win),'soirée '+(e+1)+' jouée');
    compte.push(win.eval('G.mgmt.hist.length'));
  }
  assert.deepEqual(compte,[9,18,27],'neuf combats de plus à chaque soirée : rien ne s\u2019efface');
  const s = JSON.parse(win.eval(`(function(){
    const m=G.mgmt;
    const cycles=[...new Set(m.hist.map(x=>x.c))].sort((a,b)=>a-b);
    let deux=0;
    for(const o of m.roster){ if(mgmtFightHistory(m,o).length>=2) deux++; }
    return JSON.stringify({cycles,deux,last:m.lastEvent.fights.length,
      dernierCycle:m.lastEvent.cycle});
  })()`));
  assert.deepEqual(s.cycles,[1,2,3],'les combats des trois cycles sont tous dans la trace');
  assert.ok(s.deux>0,'des combattants ont combattu plusieurs fois et gardent chacun de leurs combats');
  assert.equal(s.last,9,'m.lastEvent ne garde que la dernière soirée — l\u2019historique, lui, garde tout');
  assert.equal(s.dernierCycle,3,'m.lastEvent porte le cycle de la dernière soirée, comme avant');
});

/* ==== [ANCRE: TEST_MGMT_LOT3_T5_FICHE] — Lot 3 T5 : l'historique de la fiche
   reste lisible après deux soirées, même sans adversaire dans le roster ;
   le bouton ouvre le rejeu fidèle et revient à la même fiche. ==== */
test('MGMT T5 — fiche, adversaire échappé, cycles et rejeu à la souris', () => {
  const win=newGameWindow();
  freshMgmt(win,20260925);
  assert.ok(joueSoiree(win));
  assert.ok(joueSoiree(win));
  const id=win.eval(`G.mgmt.hist[0].a.id`);
  win.eval(`G.screen='mgmt_carte'; CL.mgmtFiche(${JSON.stringify(id)});`);
  assert.equal(win.eval('G.screen'),'mgmt_fiche');
  const m=win.G.mgmt, traces=m.hist.filter(t=>t.a.id===id||t.b.id===id);
  const original=traces[0].a.id===id?traces[0].b.name:traces[0].a.name;
  assert.ok(traces.length>=1);
  const html=win.document.getElementById('app').innerHTML;
  for(const t of traces){
    const opp=t.a.id===id?t.b:t.a;
    assert.ok(html.includes(opp.name),'adversaire du cycle '+t.c);
    assert.ok(html.includes('Cycle '+t.c),'date disponible dans la trace');
  }
  /* Une ancienne trace peut contenir un nom hostile ; la fiche ne doit
     jamais l'injecter en HTML, même si l'adversaire a quitté le roster. */
  win.eval(`(function(){
    const t=G.mgmt.hist[0], f=mgmtFighterById(G.mgmt,${JSON.stringify(id)});
    (t.a.id===f.id?t.b:t.a).name='<img src=x onerror=alert(1)>';
    render();
  })()`);
  const safe=win.document.getElementById('app');
  assert.equal(safe.querySelector('img'),null,'aucune balise hostile insérée');
  assert.ok(safe.innerHTML.includes('&lt;img'),'nom échappé');
  /* Restaurer le nom de la trace pour conserver le rejeu fidèle. */
  win.eval(`(function(){
    const t=G.mgmt.hist[0], f=mgmtFighterById(G.mgmt,${JSON.stringify(id)});
    (t.a.id===f.id?t.b:t.a).name=${JSON.stringify(original)};
    render();
  })()`);
  win.document.querySelector('[onclick^="CL.mgmtHistoriqueRevoir"]').click();
  assert.equal(win.eval('G.screen'),'arene_socle');
  assert.ok(win.document.querySelector('canvas'));
  win.CL.areneSocleQuitter();
  assert.equal(win.eval('G.screen'),'mgmt_fiche','retour à la même fiche');
  win.keysHandle({key:'ArrowDown',preventDefault(){}});
  win.keysHandle({key:'Enter',preventDefault(){}});
  assert.equal(win.eval('G.screen'),'arene_socle','Entrée accélère le même rejeu accessible à la souris');
  win.CL.areneSocleQuitter();
});

/* ==== [ANCRE: TEST_MGMT_T4_REPRISE_RESUME] — Lot 3 T4, reprise : le résumé
   de chaque vrai combat est borné à cinq lignes et le moteur reste intact. ==== */
test('MGMT T4 reprise — soirée réelle : zéro à cinq moments par combat, sans marqueurs', () => {
  const win=newGameWindow();
  freshMgmt(win,20260927);
  assert.ok(joueSoiree(win));
  const result=JSON.parse(win.eval(`(function(){
    const m=G.mgmt, nombre=[];
    for(let i=0;i<m.lastEvent.fights.length;i++){
      const html=mgmtSoireeResume(m,i);
      nombre.push((html.match(/class="mgmt-meta"/g)||[]).length);
      if(/\\[(?:CRITIQUE|ARBITRAGE)\\]/.test(html)) throw new Error('marqueur interne visible');
    }
    return JSON.stringify(nombre);
  })()`));
  assert.equal(result.length,9,'tous les combats sont examinés');
  assert.ok(result.every(n=>n<=5),'aucun résumé ne déborde : '+result.join(','));
});

/* ---- Un adversaire disparu du roster ne casse rien ----------------------- */
test('MGMT trace — un adversaire disparu du roster ne casse pas l\u2019historique de celui qui reste', () => {
  const win = newGameWindow();
  freshMgmt(win,20260924);
  brancheEspion(win);
  assert.ok(joueSoiree(win),'une soirée a été jouée');
  retireEspion(win);
  const repere = JSON.parse(win.eval(`(function(){
    const m=G.mgmt, x=m.hist[0];
    const restant=x.a.id, parti=x.b.id;
    /* La ligne adverse disparaît du roster (retraité parti, ligne perdue). */
    m.roster=m.roster.filter(o=>o.id!==parti);
    saveMgmt();
    return JSON.stringify({restant,parti});
  })()`));
  win.eval(`G.mgmt=null; loadMgmt();`);
  const s = JSON.parse(win.eval(`(function(){
    const m=G.mgmt;
    const restant=mgmtFighterById(m,${JSON.stringify(repere.restant)});
    const h=mgmtFightHistory(m,restant);
    const cible=h.find(x=>x.a.id===${JSON.stringify(repere.parti)}||x.b.id===${JSON.stringify(repere.parti)});
    const rep=cible?mgmtReplayFight(cible):null;
    return JSON.stringify({charge:!!m,valid:validateMgmt(m),
      dansHist:!!cible,
      fidele:rep?JSON.stringify(rep)===window.__deroules[0]:false});
  })()`));
  assert.equal(s.charge,true,'la sauvegarde se recharge après la disparition de la ligne');
  assert.equal(s.valid,true,'elle passe la porte de validateMgmt : l\u2019historique ne dépend pas du roster');
  assert.equal(s.dansHist,true,'l\u2019historique du combattant restant contient toujours le combat');
  assert.equal(s.fidele,true,'le combat rejoué depuis sa trace reste identique, adversaire parti compris');
});

/* ---- Tâche 2 : migration 5 → 6, une sauvegarde d'avant le lot se charge -- */
test('MGMT trace — migration 5 → 6 sans perte : une sauvegarde d\u2019avant le lot se charge', () => {
  const win = newGameWindow();
  freshMgmt(win,20260925);
  assert.ok(joueSoiree(win),'une soirée a été jouée (l\u2019état porte une trace)');
  /* L'état d'avant les lots : la même sauvegarde, ramenée en v5 sans trace
     ni calendrier d'âge, ajouté seulement par la décision T2 bis. */
  const v5Raw = JSON.parse(win.eval(`(function(){
    const raw=JSON.parse(JSON.stringify(G.mgmt));
    raw.v=5; delete raw.hist; delete raw.ageWeeks;
    return JSON.stringify(raw);
  })()`));
  const sansVersionEtTrace = x => {
    const c=JSON.parse(JSON.stringify(x)); delete c.v; delete c.hist; delete c.ageWeeks; return c;
  };
  const etatV5 = JSON.stringify(sansVersionEtTrace(v5Raw));
  const mig = JSON.parse(win.eval(`JSON.stringify(mgmtMigrate(JSON.parse(JSON.stringify(${JSON.stringify(v5Raw)}))))`));
  assert.equal(mig.v, win.eval(`MGMT_SAVE_VERSION`), 'tampon de la version courante');
  assert.deepEqual(mig.hist, [], 'la trace démarre vide : les combats d\u2019avant le lot n\u2019ont rien laissé à migrer (C3)');
  assert.equal(win.eval(`validateMgmt(${JSON.stringify(mig)})`), true, 'la v5 migrée passe la porte courante');
  /* La même v5 se charge depuis le stockage dédié. */
  win.localStorage.setItem('cage-legacy-mgmt', JSON.stringify(v5Raw));
  win.eval(`G.mgmt=null; loadMgmt();`);
  const apres = JSON.parse(win.eval(`(function(){
    const m=G.mgmt;
    return JSON.stringify({v:m.v,hist:m.hist,etat:JSON.stringify((function(){
      const c=JSON.parse(JSON.stringify(m)); delete c.v; delete c.hist; delete c.ageWeeks; return c;
    })())});
  })()`));
  /* Sans perte : tout ce que la v5 portait est intact, à la version et à la
     trace près (vide par construction). */
  assert.equal(apres.v, win.eval(`MGMT_SAVE_VERSION`), 'la v5 se charge en version courante');
  assert.deepEqual(apres.hist, [], 'hist:[] au chargement');
  assert.equal(JSON.parse(win.eval(`JSON.stringify(G.mgmt.ageWeeks)`)),0,
    'décision Anthony 22/09 : le calendrier d’âge d’une sauvegarde antérieure repart de zéro');
  assert.equal(apres.etat, etatV5, 'roster, carte, argent, affaires, soirée : tout ce que la v5 portait est intact');
});

test('MGMT corps — migration 6 → 7 : décision Anthony 22/09, part acquise et temps complètent les traces', () => {
  const win = newGameWindow();
  freshMgmt(win,20260927);
  assert.ok(joueSoiree(win),'une soirée a été jouée pour produire corps et traces');
  const v6 = JSON.parse(win.eval(`(function(){
    const raw=JSON.parse(JSON.stringify(G.mgmt));
    raw.v=6;
    for(const o of raw.roster) delete o.traumaFloor;
    for(const x of raw.hist){
      for(const t of [x.a,x.b]){ delete t.traumaFloor; delete t.lastCycle; }
    }
    return JSON.stringify(raw);
  })()`));
  const mig = JSON.parse(win.eval(`JSON.stringify(mgmtMigrate(JSON.parse(JSON.stringify(${JSON.stringify(v6)}))))`));
  assert.equal(mig.v,win.eval(`MGMT_SAVE_VERSION`),'la v6 atteint la version courante');
  assert.equal(win.eval(`validateMgmt(${JSON.stringify(mig)})`),true,'la v6 complétée passe validateMgmt');
  assert.ok(mig.roster.filter(o=>o.trauma!==undefined).every(o=>Number.isFinite(o.traumaFloor)&&o.traumaFloor<=o.trauma),
    'chaque corps existant reçoit une part acquise bornée par son total');
  assert.ok(mig.hist.every(x=>x.a.traumaFloor===null&&x.a.lastCycle===null&&x.b.traumaFloor===null&&x.b.lastCycle===null),
    'les anciennes traces signalent explicitement les deux informations absentes');
});

test('MGMT lot 2B T2 bis — migration 7 → 8 : les âges restent courants et le calendrier repart de là', () => {
  const win = newGameWindow();
  freshMgmt(win,20260928);
  const v7 = JSON.parse(win.eval(`(function(){
    const raw=JSON.parse(JSON.stringify(G.mgmt));
    raw.v=7; delete raw.ageWeeks; raw.cycle=37;
    raw.roster.forEach((o,i)=>{ o.age=24+(i%13); });
    return JSON.stringify(raw);
  })()`));
  const ages=v7.roster.map(o=>o.age);
  const mig = JSON.parse(win.eval(`JSON.stringify(mgmtMigrate(JSON.parse(JSON.stringify(${JSON.stringify(v7)}))))`));
  assert.equal(mig.v,win.eval(`MGMT_SAVE_VERSION`),'la v7 atteint la version courante');
  assert.deepEqual(mig.roster.map(o=>o.age),ages,'chaque âge existant reste son âge courant');
  assert.equal(mig.cycle,37,'le cycle de la partie est conservé');
  assert.equal(mig.ageWeeks,0,'le calendrier d’âge repart de la migration');
  assert.equal(win.eval(`validateMgmt(${JSON.stringify(mig)})`),true,'la v7 migrée passe validateMgmt');
  win.localStorage.setItem('cage-legacy-mgmt',JSON.stringify(v7));
  win.eval(`G.mgmt=null; loadMgmt(); mgmtNewPile(G.mgmt);`);
  assert.deepEqual(JSON.parse(win.eval(`JSON.stringify(G.mgmt.roster.map(o=>o.age))`)),ages,
    'un premier cycle de cinq semaines après migration ne déclenche pas un anniversaire');
  assert.equal(win.eval(`G.mgmt.ageWeeks`),5,'les cinq premières semaines sont conservées pour la suite');
});

/* ---- Tâche 5 : validateMgmt refuse un historique structurellement faux --- */
test('MGMT trace — validateMgmt refuse un historique structurellement faux, mgmtRepair l\u2019écarte', () => {
  const win = newGameWindow();
  freshMgmt(win,20260926);
  assert.ok(joueSoiree(win),'une soirée a été jouée (trace réelle en base)');
  const okTrace = JSON.parse(win.eval(`JSON.stringify(G.mgmt.hist[0])`));
  const valide = t => win.eval(`(function(){
    const m=mgmtDefault(); m.hist=JSON.parse(${JSON.stringify(JSON.stringify([t]))});
    return validateMgmt(m);
  })()`);
  assert.equal(valide(okTrace), true, 'une trace réelle bien formée passe la porte');
  /* Chaque champ structurel, corrompu un par un. */
  const cas = [
    ['seed non entier', x => { x.seed='x'; }],
    ['seed négatif', x => { x.seed=-1; }],
    ['seed hors 32 bits', x => { x.seed=4294967296; }],
    ['rounds nul', x => { x.rounds=0; }],
    ['vainqueur inconnu', x => { x.winner='X'; }],
    ['famille inconnue', x => { x.family='ko2'; }],
    ['round nul', x => { x.round=0; }],
    ['cycle négatif', x => { x.c=-1; }],
    ['emplacement inconnu', x => { x.slot='x'; }],
    ['instantané A sans nom', x => { delete x.a.name; }],
    ['instantané A sans id', x => { delete x.a.id; }],
    ['instantané A traumatisme hors bornes', x => { x.a.trauma=101; }],
    ['instantané A part acquise hors bornes', x => { x.a.traumaFloor=101; }],
    ['instantané A dernier cycle invalide', x => { x.a.lastCycle='hier'; }],
    ['instantané A bilan négatif', x => { x.a.W=-1; }],
    ['instantané A catégorie inconnue', x => { x.a.div='Z-nulle'; }],
    ['instantané B absent', x => { delete x.b; }],
    ['clé étrangère dans la trace', x => { x.log=[1,2,3]; }],
  ];
  for(const [lib,mut] of cas){
    const x=JSON.parse(JSON.stringify(okTrace));
    mut(x);
    assert.equal(valide(x), false, 'refusé : '+lib);
  }
  /* Le rechargement tolérant écarte l'entrée illisible, garde l'autre. */
  const repare = JSON.parse(win.eval(`(function(){
    const m=mgmtDefault();
    const ok=JSON.parse(${JSON.stringify(JSON.stringify(okTrace))});
    const casse=JSON.parse(JSON.stringify(ok)); casse.seed='x';
    m.hist=[ok,casse];
    mgmtRepair(m);
    return JSON.stringify({n:m.hist.length,garde:m.hist[0]===ok});
  })()`));
  assert.equal(repare.n,1,'mgmtRepair écarte l\u2019entrée structurellement fausse');
  assert.equal(repare.garde,true,'l\u2019entrée saine est conservée telle quelle');
});
