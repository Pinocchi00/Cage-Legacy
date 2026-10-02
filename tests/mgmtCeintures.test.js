"use strict";
/* Lot 5 T1 : décisions d'Anthony du 02/10/2026, contrat §T1.
   Vraies soirées et rejeux ; transitions sportives, sauvegardes longues,
   trace extérieure inchangée et absence de stockage dérivé. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');

function fresh(){
  const win=newGameWindow();
  win.eval('setSeed(20261002); const m=mgmtDefault(); mgmtNewRoster(m); G={theme:"dark",mgmt:m}; mgmtExteriorEnsure(m);');
  return win;
}

test('T1 ceintures — attribution initiale stable, indépendante du rang vivant et de la RNG',()=>{
  const win=fresh();
  const r=JSON.parse(win.eval(`JSON.stringify((()=>{
    const m=G.mgmt, seed=SEED, before=JSON.stringify(m);
    const belts=allDivisions().map(d=>mgmtSplitTitle(m,d.id));
    const ranked=allDivisions().map(d=>mgmtDivisionRanking(m,d.id,'organization')[0]?.id??null);
    mgmtInitTitles(m);
    const unchanged=JSON.stringify(m)===before;
    const belt=belts.find(x=>x.id),f=mgmtFighterById(m,belt.id);
    f.W=0; f.L=100;
    return {belts,ranked,unchanged,rng:seed===SEED,after:mgmtSplitTitle(m,belt.div),belt};
  })())`));
  assert.deepEqual(r.belts.map(b=>b.id),r.ranked);
  assert.ok(r.belts.every(b=>b.defenses===0));
  assert.ok(r.unchanged&&r.rng,'idempotence et lecture sans tirage');
  assert.deepEqual(r.after,r.belt,'un recul au classement ne perd pas la ceinture');
});

test('T1 ceintures — titre explicite, champion requis et une seule ceinture par catégorie',()=>{
  const win=fresh();
  const r=JSON.parse(win.eval(`JSON.stringify((()=>{
    const m=G.mgmt, group=allDivisions().map(d=>m.roster.filter(f=>f.div===d.id)).find(a=>a.length>=4);
    const champ=mgmtSplitTitle(m,group[0].div).id, others=group.filter(f=>f.id!==champ);
    const first=mgmtBookMain(m,others[0].id,others[1].id);
    const bad=mgmtSetTitle(m,0,true),ordinary=first.title!==true;
    mgmtRemoveMain(m,0);
    const fight=mgmtBookMain(m,champ,others[0].id);
    const on=mgmtSetTitle(m,0,true),off=mgmtSetTitle(m,0,false);
    const invalid=mgmtSetTitle(m,0,'true');
    mgmtSetTitle(m,0,true);
    const duplicate={a:champ,b:others[2].id,title:true,slot:'prelim'};
    m.card.prelims.push(duplicate);
    const conflict=mgmtCanTitle(m,fight);
    return {bad,ordinary,on,off,invalid,conflict};
  })())`));
  assert.deepEqual(r,{bad:false,ordinary:true,on:true,off:true,invalid:false,conflict:false});
});

test('T1 ceintures — cinq rounds en combat principal et titre ailleurs, vrai rejeu fidèle et rechargement',()=>{
  const win=fresh();
  const r=JSON.parse(win.eval(`JSON.stringify((()=>{
    const m=G.mgmt;
    const groups=allDivisions().map(d=>m.roster.filter(f=>f.div===d.id)).filter(a=>a.length>=2);
    m.card.sizeMain=2; m.card.sizePrelims=1;
    const book=g=>{
      const champ=mgmtSplitTitle(m,g[0].div).id;
      return mgmtBookMain(m,champ,g.find(f=>f.id!==champ).id);
    };
    book(groups[0]); book(groups[1]);
    mgmtSetTitle(m,1,true);
    const rest=groups.find(g=>g.every(f=>!mgmtEngaged(m,f)));
    m.card.prelims=[{a:rest[0].id,b:rest[1].id,slot:'prelim'}];
    const orig=simulateFight,originals=[];
    simulateFight=(a,b,rounds)=>{ const res=orig(a,b,rounds); originals.push(JSON.stringify(res)); return res; };
    const event=mgmtRunEvent(m);
    simulateFight=orig;
    const replays=m.hist.map((t,i)=>JSON.stringify(mgmtReplayFight(t))===originals[i]);
    const facts=m.facts.filter(f=>f.k==='title_fight');
    const winner=m.hist[1].winner;
    const expected=winner==='A'?m.hist[1].a.id:(winner==='B'?m.hist[1].b.id:mgmtSplitTitle(m,groups[1][0].div).id);
    const belt=mgmtSplitTitle(m,groups[1][0].div);
    const valid=validateMgmt(m),before=JSON.stringify(m);
    saveMgmt(); G.mgmt=null;
    const loaded=loadMgmt(),same=JSON.stringify(G.mgmt)===before;
    return {rounds:m.hist.map(t=>t.rounds),replays,facts,eventRounds:event.fights.map(t=>t.rounds),
      expected,belt,valid,loaded,same};
  })())`));
  assert.deepEqual(r.rounds,[5,5,3]);
  assert.deepEqual(r.eventRounds,[5,5,3]);
  assert.ok(r.replays.every(Boolean),'déroulé entier identique à l’original');
  assert.equal(r.facts.length,1,'seul le titre explicitement choisi laisse un fait de titre');
  assert.equal(r.facts[0].fight,1,'la référence pointe sur le titre, pas sur le main event');
  // Une retraite médicale simultanée rend le titre vacant.
  assert.ok(r.belt.id===r.expected||r.belt.id===null);
  assert.ok(r.valid&&r.loaded&&r.same,'sauvegarde et secours : aucun recalcul de soirée');
});

test('T1 ceintures — nul, défense, changement, titre vacant, longue mémoire et validation stricte',()=>{
  const win=fresh();
  const r=JSON.parse(win.eval(`JSON.stringify((()=>{
    const m=G.mgmt,g=allDivisions().map(d=>m.roster.filter(f=>f.div===d.id)).find(a=>a.length>=3);
    const id=mgmtSplitTitle(m,g[0].div).id,A=mgmtFighterById(m,id),B=g.find(f=>f.id!==id);
    function result(winner){
      m.hist.push({c:m.cycle,slot:'main',seed:1,rounds:5,a:mgmtTraceSide(A),b:mgmtTraceSide(B),winner,family:'dec',round:5});
      mgmtAddFact(m,{c:m.cycle,k:'title_fight',div:A.div,fight:m.hist.length-1});
    }
    result('D'); const draw=mgmtSplitTitle(m,A.div);
    for(let i=0;i<120;i++) result('A');
    const defenses=mgmtSplitTitle(m,A.div);
    result('B'); const changed=mgmtSplitTitle(m,A.div);
    const before=JSON.stringify(m),roundtrip=mgmtParseAndValidate(before);
    mgmtRepair(roundtrip);
    const intact=JSON.stringify(roundtrip)===before;
    const last=m.facts.at(-1); last.fight=99999;
    const badRef=validateMgmt(m); last.fight=m.hist.length-1;
    m.hist.at(-1).rounds=3; const badRounds=validateMgmt(m); m.hist.at(-1).rounds=5;
    B.retired='age'; const vacant=mgmtSplitTitle(m,A.div);
    return {id,challenger:B.id,draw,defenses,changed,intact,badRef,badRounds,vacant};
  })())`));
  assert.equal(r.draw.id,r.id); assert.equal(r.draw.defenses,0,'nul : aucune défense gagnée');
  assert.equal(r.defenses.defenses,120,'aucun fait tronqué');
  assert.equal(r.changed.id,r.challenger); assert.equal(r.changed.defenses,0);
  assert.ok(r.intact); assert.ok(!r.badRef&&!r.badRounds);
  assert.equal(r.vacant.id,null,'retraite : titre vacant, historique intact');
});

test('T1 ceintures — migration v10 sans requalifier les anciens combats, zéro défense initiale',()=>{
  const win=fresh();
  const r=JSON.parse(win.eval(`JSON.stringify((()=>{
    const m=G.mgmt; m.v=10; m.facts=m.facts.filter(f=>!f.k.startsWith('title_'));
    m.facts.push({c:0,k:'ignored',a:m.roster[0].id});
    const A=m.roster[0],B=m.roster[1];
    m.hist.push({c:0,slot:'main',seed:1,rounds:3,a:mgmtTraceSide(A),b:mgmtTraceSide(B),winner:'A',family:'dec',round:3});
    const hist=JSON.stringify(m.hist),fact=JSON.stringify(m.facts[0]);
    const migrated=mgmtMigrate(m);
    return {v:migrated.v,current:MGMT_SAVE_VERSION,valid:validateMgmt(migrated),hist:hist===JSON.stringify(migrated.hist),
      fact:fact===JSON.stringify(migrated.facts[0]),n:migrated.facts.filter(f=>f.k==='title_initial').length,
      defenses:allDivisions().map(d=>mgmtSplitTitle(migrated,d.id).defenses)};
  })())`));
  assert.equal(r.v,r.current); assert.ok(r.valid&&r.hist&&r.fact);
  assert.equal(r.n,12); assert.ok(r.defenses.every(n=>n===0));
});

test('T1 ceintures — extérieur dérivé : préfixe, résultats de carrière, org active et RNG intacte',()=>{
  const win=fresh();
  const r=JSON.parse(win.eval(`JSON.stringify((()=>{
    const m=G.mgmt,before=JSON.stringify(m),seed=SEED,rows=[];
    for(const div of allDivisions()){
      const early=mgmtExteriorTitles(m,div.id,0),late=mgmtExteriorTitles(m,div.id,20);
      rows.push({prefix:JSON.stringify(early.history)===JSON.stringify(late.history.filter(x=>x.c<=0)),
        repeat:JSON.stringify(late)===JSON.stringify(mgmtExteriorTitles(m,div.id,20)),
        valid:late.belts.every(b=>{
          if(!b.id) return b.defenses===0;
          const f=m.exterieur.find(x=>x.id===b.id),t=mgmtExteriorTrace(f,20);
          return t.org===b.orgIdx&&!mgmtExteriorRetired(f,20)&&b.defenses>=0;
        }),
        defenses:late.history.filter(x=>x.type==='defense').every(x=>{
          const line=m.exterieur.find(f=>f.id===x.id);
          return mgmtExteriorCareer(line.seed,line.born,20).bouts.some(b=>b.c===x.c&&b.org===x.orgIdx&&b.win);
        })});
    }
    return {rows,unchanged:before===JSON.stringify(m),rng:seed===SEED};
  })())`));
  assert.ok(r.rows.every(x=>x.prefix&&x.repeat&&x.valid&&x.defenses));
  assert.ok(r.unchanged&&r.rng,'aucun état extérieur ou tirage global stocké');
});

test('T1 ceintures — case de booking, retour immédiat, focus clavier et noms échappés',()=>{
  const win=fresh();
  win.eval(`(()=>{
    const m=G.mgmt,g=allDivisions().map(d=>m.roster.filter(f=>f.div===d.id)).find(a=>a.length>=2);
    const champ=mgmtSplitTitle(m,g[0].div).id;
    mgmtBookMain(m,champ,g.find(f=>f.id!==champ).id);
    G.screen='mgmt_carte'; render();
  })()`);
  let box=win.document.getElementById('mgmt-title-0');
  assert.ok(box&&!box.checked,'aucun titre implicite au booking');
  box.click();
  box=win.document.getElementById('mgmt-title-0');
  assert.ok(box.checked); assert.equal(win.eval('G.mgmt.card.main[0].title'),true);
  assert.equal(win.document.activeElement,box,'focus conservé après rendu');
  win.eval(`CL.mgmtTitle(0,false)`);
  assert.ok(!win.document.getElementById('mgmt-title-0').checked);
  win.eval(`(()=>{
    const m=G.mgmt,f=mgmtFighterById(m,m.card.main[0].a);
    f.name='<img src=x onerror=alert(1)>';
    MGMT_CLASSEMENTS={div:f.div,scope:'split'}; CL.go('mgmt_classements');
  })()`);
  assert.equal(win.document.querySelectorAll('.mgmt-cl-champion').length,1);
  const name=win.document.querySelector('.mgmt-cl-champion-name');
  assert.ok(name.textContent.includes('<img'));
  assert.equal(win.document.querySelector('img'),null);
  const button=win.document.querySelector('button.mgmt-cl-champion');
  button.click(); assert.equal(win.eval('G.screen'),'mgmt_fiche');
});

test('T1 ceintures — réparation recale une référence après une trace illisible sans changer le titre',()=>{
  const win=fresh();
  const r=JSON.parse(win.eval(`JSON.stringify((()=>{
    const m=G.mgmt,g=allDivisions().map(d=>m.roster.filter(f=>f.div===d.id)).find(a=>a.length>=2);
    const A=g[0],B=g[1];
    m.hist.push({invalide:true});
    m.hist.push({c:0,slot:'main',seed:1,rounds:5,a:mgmtTraceSide(A),b:mgmtTraceSide(B),winner:'B',family:'dec',round:5});
    mgmtAddFact(m,{c:0,k:'title_fight',div:A.div,fight:1});
    mgmtRepair(m);
    return {index:m.facts.at(-1).fight,id:mgmtSplitTitle(m,A.div).id,expected:B.id,valid:validateMgmt(m)};
  })())`));
  assert.equal(r.index,0); assert.equal(r.id,r.expected); assert.ok(r.valid);
});

test('T1 reprise — partie neuve : Mémoire zéro, attributions initiales conservées sans ligne',()=>{
  const win=fresh();
  win.eval(`CL.go('mgmt_bureau')`);
  const memo=win.document.querySelector('.mgmt-week-memo');
  assert.equal(memo.querySelector(':scope > summary').textContent,'Mémoire · 0 faits');
  assert.equal(memo.querySelectorAll('.mgmt-week-fact').length,0);
  assert.equal(win.eval(`G.mgmt.facts.filter(f=>f.k==='title_initial').length`),12);
  assert.ok(win.eval(`allDivisions().some(d=>mgmtSplitTitle(G.mgmt,d.id).id)`),
    'les ceintures restent attribuées');
  win.eval(`G.mgmt.facts.push({c:0,k:'non_affiche'}); render();`);
  assert.equal(win.document.querySelector('.mgmt-week-memo > summary').textContent,'Mémoire · 0 faits',
    'le compteur ne compte aucun autre fait sans ligne');
});

test('T1 reprise — un titre : une ligne, bon libellé et les deux noms, champion A ou B',()=>{
  for(const side of ['A','B']) for(const outcome of ['retain','loss','award','draw','vacant_draw']){
    const win=fresh();
    const fixture=JSON.parse(win.eval(`JSON.stringify((()=>{
      const m=G.mgmt,group=allDivisions().map(d=>m.roster.filter(f=>f.div===d.id)).find(a=>a.length>=2);
      const initial=m.facts.find(f=>f.k==='title_initial'&&f.div===group[0].div);
      const champion=mgmtFighterById(m,initial.a),challenger=group.find(f=>f.id!==champion.id);
      if('${outcome}'==='award'||'${outcome}'==='vacant_draw') initial.a=null;
      m.cycle=1;
      const a='${side}'==='A'?champion:challenger,b=a===champion?challenger:champion;
      const winner='${outcome}'==='draw'||'${outcome}'==='vacant_draw'?'D':
        ('${outcome}'==='loss'?('${side}'==='A'?'B':'A'):'${side}');
      m.hist.push({c:1,slot:'main',seed:1,rounds:5,a:mgmtTraceSide(a),b:mgmtTraceSide(b),
        winner,family:winner==='D'?'draw':'dec',round:5});
      mgmtAddFact(m,{c:1,k:'title_fight',div:champion.div,fight:0});
      const stored=JSON.stringify(m),seed=SEED;
      CL.go('mgmt_bureau');
      return {champion:champion.name,challenger:challenger.name,
        immutable:JSON.stringify(m)===stored&&SEED===seed,valid:validateMgmt(m)};
    })())`));
    const labels={retain:'Ceinture conservée',loss:'Ceinture perdue',award:'Ceinture attribuée',
      draw:'Ceinture conservée',vacant_draw:'Titre vacant'};
    const memo=win.document.querySelector('.mgmt-week-memo'),rows=memo.querySelectorAll('.mgmt-week-fact');
    assert.equal(memo.querySelector(':scope > summary').textContent,'Mémoire · 1 fait');
    assert.equal(rows.length,1,outcome+' / champion '+side);
    assert.ok(rows[0].textContent.includes(labels[outcome]),outcome+' : libellé factuel exact');
    assert.ok(rows[0].textContent.includes(fixture.champion));
    assert.ok(rows[0].textContent.includes(fixture.challenger));
    if(outcome==='retain'||outcome==='loss'||outcome==='draw'){
      assert.ok(rows[0].textContent.indexOf(fixture.champion)<rows[0].textContent.indexOf(fixture.challenger),
        'le détenteur est nommé en premier, même sur le côté B');
    }
    assert.ok(fixture.immutable&&fixture.valid,'lecture sans écriture ni tirage, sauvegarde inchangée');
    win.close();
  }
});

test('T1 reprise — l’issue historique et les noms survivent au changement de champion et au départ',()=>{
  const win=fresh();
  win.eval(`(()=>{
    const m=G.mgmt,group=allDivisions().map(d=>m.roster.filter(f=>f.div===d.id)).find(a=>a.length>=2);
    const initial=m.facts.find(f=>f.k==='title_initial'&&f.div===group[0].div);
    const a=mgmtFighterById(m,initial.a),b=group.find(f=>f.id!==a.id);
    a.name='<img src=x onerror=alert(1)> Champion'; b.name='Adversaire & <b>nom</b>';
    for(let c=1;c<=2;c++){
      m.hist.push({c,slot:'main',seed:1,rounds:5,a:mgmtTraceSide(a),b:mgmtTraceSide(b),
        winner:'B',family:'dec',round:5});
      mgmtAddFact(m,{c,k:'title_fight',div:a.div,fight:c-1});
    }
    m.cycle=2; m.roster=m.roster.filter(f=>f.id!==a.id&&f.id!==b.id);
    CL.go('mgmt_bureau');
  })()`);
  const memo=win.document.querySelector('.mgmt-week-memo'),rows=[...memo.querySelectorAll('.mgmt-week-fact')];
  assert.equal(memo.querySelector(':scope > summary').textContent,'Mémoire · 2 faits');
  assert.equal(rows.length,2);
  assert.ok(rows[0].textContent.includes('Ceinture conservée'), 'le nouveau champion défend au cycle 2');
  assert.ok(rows[1].textContent.includes('Ceinture perdue'), 'la défaite du cycle 1 garde son sens');
  assert.ok(rows.every(row=>row.textContent.includes('<img')&&row.textContent.includes('Adversaire & <b>nom</b>')));
  assert.equal(memo.querySelector('img, b'),null,'les deux noms de la trace restent du texte échappé');
});
