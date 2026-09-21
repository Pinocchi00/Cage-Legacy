"use strict";
/* CAGE LEGACY — tests/mgmtSoiree.test.js
   ============================================================================
   LOT 3A LE CORPS ET LA SOIRÉE — fichier demandé par le §11 du lot 3a,
   livré avec le lot 1 le style stable (audit du 17/09 : X2, B2 — il
   n'avait jamais été écrit). Couvre :

   - le profil de combat stable (mgmtCombatProfile, §3.2 du lot 3a) :
     identique d'un appel à l'autre, après sauvegarde et rechargement, et
     quand le bilan change ;
   - la pureté des dérivations (mgmtTrauma et mgmtCombatProfile ne
     consomment jamais rnd(), §3.1) ;
   - le couplage au moteur (§4) : à traumatisme 0, combat strictement
     identique au moteur nu, même graine ;
   - le corps après la soirée (§6) : traumatisme monotone borné, fin de
     carrière médicale définitive, suspensions respectées ;
   - l'anti-rechargement (§5) : la soirée est calculée une seule fois ;
   - l'absence de toute valeur de traumatisme dans le DOM (§3).
   ============================================================================ */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

/* Entrée du bureau avec graine imposée (déterministe). */
function enterMgmt(win,seed){
  win.eval(`setSeed(${seed}); CL.mgmtEnter();`);
}

/* État management neuf avec roster généré par le vrai mgmtNewRoster, sans
   passer par l'écran : pour les tests qui ne regardent que la logique. */
function freshState(win,seed){
  win.eval(`(function(){ setSeed(${seed}); const m=mgmtDefault(); mgmtNewRoster(m); G={theme:'dark',mgmt:m}; })()`);
}

/* Le traumatisme est caché : aucune valeur ne doit fuiter dans le DOM.
   Le marqueur 91 est planté sur toutes les lignes : un nombre qui
   n'apparaît légitimement sur aucun écran management (âges 22-35, bilans
   ≤ 30 combats, rounds 1-3, jours de suspension 30/60/90/180, cycles et
   comptes de carte à un chiffre). */
const TRAUMA_PLANTÉ=91;
function assertSansTrauma(html,label){
  assert.ok(!new RegExp('(^|[^0-9])'+TRAUMA_PLANTÉ+'(?![0-9])').test(html),
    label+' — la valeur plantée du traumatisme fuit dans le DOM');
  assert.ok(!/trauma/i.test(html), 'le mot trauma ne fuit pas dans le DOM ('+label+')');
  assert.ok(!/traumatisme/i.test(html), 'le mot traumatisme ne s\'affiche jamais ('+label+')');
}

test('MGMT corps — même combattant : profil identique (style et attrs) d’un appel à l’autre', () => {
  const win = newGameWindow();
  enterMgmt(win,201);
  const r = win.eval(`(function(){
    const f=G.mgmt.roster[3];
    const key=p=>JSON.stringify({style:p.style,attrs:p.attrs});
    const p1=mgmtCombatProfile(f);
    /* La partie vit entre deux appels : des tirages passent (une soirée
       entière de simulations et de dossiers). */
    for(let i=0;i<150;i++) rnd();
    const p2=mgmtCombatProfile(f);
    for(let i=0;i<300;i++) rnd();
    const p3=mgmtCombatProfile(f);
    return JSON.stringify({k1:key(p1),k2:key(p2),k3:key(p3)});
  })()`);
  const s=JSON.parse(r);
  assert.equal(s.k1,s.k2,'le profil ne dépend pas de la position du flux au moment de l’appel');
  assert.equal(s.k2,s.k3,'le profil reste identique appel après appel');
});

test('MGMT corps — même combattant : profil identique après sauvegarde puis rechargement', () => {
  const win = newGameWindow();
  enterMgmt(win,202);
  win.eval(`(function(){
    const f=G.mgmt.roster[3];
    const p=mgmtCombatProfile(f);
    window.__profilAvant=JSON.stringify({style:p.style,attrs:p.attrs});
    for(let i=0;i<120;i++) rnd();
    saveMgmt();
  })()`);
  win.eval(`G.mgmt=null; loadMgmt();`);
  const r = win.eval(`(function(){
    const f=G.mgmt.roster[3];
    for(let i=0;i<120;i++) rnd();
    const p=mgmtCombatProfile(f);
    return JSON.stringify({style:p.style,attrs:p.attrs});
  })()`);
  assert.equal(win.eval(`window.__profilAvant`), r,
    'le même combattant redonne le même profil après saveMgmt puis loadMgmt');
});

test('MGMT corps — même combattant : style identique quand le bilan W/L change', () => {
  const win = newGameWindow();
  enterMgmt(win,203);
  const r = win.eval(`(function(){
    const f=G.mgmt.roster[5];
    const s1=mgmtCombatProfile(f).style;
    /* Le bilan change comme après une vraie soirée : des tirages passent
       (le niveau dérivé du bilan peut bouger, jamais le style). */
    f.W+=3; f.L+=1;
    for(let i=0;i<80;i++) rnd();
    const s2=mgmtCombatProfile(f).style;
    return JSON.stringify({s1,s2});
  })()`);
  const s=JSON.parse(r);
  assert.equal(s.s2,s.s1,'le style ne suit pas le bilan : il appartient au combattant, pas à son dernier résultat');
});

test('MGMT corps — mgmtTrauma et mgmtCombatProfile n’ont aucun effet sur la suite de rnd()', () => {
  const win = newGameWindow();
  const r = win.eval(`(function(){
    setSeed(4242);
    const avant=[rnd(),rnd(),rnd(),rnd(),rnd()];
    setSeed(4242);
    const f={id:'mgProbe',name:'Probe Test',first:'Probe',last:'Test',W:12,L:9,D:2,age:31,div:'H-welter',divName:'Poids mi-moyen',org:'Split',level:1,raison:null,interactions:0};
    mgmtTrauma(f);
    mgmtCombatProfile(f);
    const apres=[rnd(),rnd(),rnd(),rnd(),rnd()];
    return JSON.stringify({avant,apres});
  })()`);
  const s=JSON.parse(r);
  assert.deepEqual(s.apres,s.avant,
    'les dérivations du corps et du profil sont pures : elles ne déplacent pas la suite des tirages');
});

/* Seuil de la régression X2 : cinq styles distincts au moins. Avec le
   correctif, chaque combattant tire son profil sous setSeed(hachage de
   son id) : 40 à 60 graines distinctes donnent des styles indépendants
   et ~uniformes parmi les 8 du moteur. La probabilité que 40 tirages
   indépendants tombent dans 4 styles au plus est sous 1e-7 (50 paires de
   styles × (4/8)^40 ≈ 4,5e-8) ; avec le bug X2, tous les profils étant
   tirés depuis la même position du flux restauré, le compte vaut
   exactement 1. Cinq est donc à la fois mordant et sans faux positif. */
test('MGMT corps — régression X2 : le roster initial n’a pas un style unique', () => {
  const win = newGameWindow();
  enterMgmt(win,205);
  const arr = JSON.parse(win.eval(`JSON.stringify(G.mgmt.roster.map(o=>mgmtCombatProfile(o).style))`));
  const distinct = new Set(arr).size;
  assert.ok(distinct>=5,
    `au moins 5 styles distincts attendus sur ${arr.length} combattants (8 styles existants), vus ${distinct}`);
});

test('MGMT corps — traumatisme 0 : combat strictement identique au moteur nu, même graine', () => {
  const win = newGameWindow();
  freshState(win,206);
  const r = win.eval(`(function(){
    const m=G.mgmt;
    const pair=m.roster.filter(o=>o.div===m.roster[0].div).slice(0,2);
    if(pair.length<2) return 'null';
    const [fa,fb]=pair;
    fa.trauma=0; fb.trauma=0;
    const profA=mgmtCombatProfile(fa), profB=mgmtCombatProfile(fb);
    setSeed(909);
    const nu=simulateFight(JSON.parse(JSON.stringify(profA)),JSON.parse(JSON.stringify(profB)),3);
    setSeed(909);
    const pret=simulateFight(mgmtFightReady(fa),mgmtFightReady(fb),3);
    return JSON.stringify({nu:JSON.stringify(nu),pret:JSON.stringify(pret)});
  })()`);
  assert.notEqual(r,'null','deux combattants de la même catégorie existent dans le roster');
  const s=JSON.parse(r);
  assert.equal(s.pret,s.nu,
    'à traumatisme 0, le facteur vaut exactement 1 : le combat préparé est celui du moteur nu');
});

test('MGMT corps — le traumatisme ne descend jamais et reste dans [0,100]', () => {
  const win = newGameWindow();
  freshState(win,207);
  const r = win.eval(`(function(){
    const m=G.mgmt;
    const methods=['KO/TKO','Décision','Soumission','Arrêt médical','Blessure','Décision partagée'];
    let bad=0,n=0,capAtteint=false;
    for(let i=0;i<600;i++){
      const f=m.roster[i%m.roster.length];
      const t0=mgmtTrauma(f);
      const side=(i%2)?'A':'B';
      const res={winner:(i%17===0)?'D':side,method:methods[i%methods.length],round:1+(i%3),
        stats:{A:{dmgHead:RI(0,80),wobbled:RI(0,3)},B:{dmgHead:RI(0,80),wobbled:RI(0,3)}}};
      mgmtApplyFight(m,f,m.roster[(i+1)%m.roster.length],res,side);
      const t1=mgmtTrauma(f);
      if(!(t1>=t0)||t1<0||t1>100) bad++;
      if(t1===100) capAtteint=true;
      n++;
    }
    /* Cas dirigé : un corps à 99 qui perd par KO atteint le plafond. */
    const f=m.roster[0];
    f.trauma=99; f.W=0; f.L=0; f.D=0;
    const res={winner:'B',method:'KO/TKO',round:2,stats:{A:{dmgHead:40,wobbled:2},B:{dmgHead:0,wobbled:0}}};
    mgmtApplyFight(m,f,m.roster[1],res,'A');
    if(mgmtTrauma(f)!==100) bad++;
    else capAtteint=true;
    n++;
    return JSON.stringify({n,bad,capAtteint});
  })()`);
  const s=JSON.parse(r);
  assert.equal(s.n,601,'les 600 combats dirigés plus le cas dirigé ont été appliqués');
  assert.equal(s.bad,0,'jamais une descente, jamais hors [0,100]');
  assert.equal(s.capAtteint,true,'le plafond 100 (fin de carrière médicale) est bien atteint');
});

/* Roster réduit au pot minimal : les paires légales sont (A,B),(A,C),(B,C). */
function miniRosterEval(){
  return `const mk=(id,first)=>({id:id,name:first+' Test',first:first,last:'Test',W:9,L:7,D:0,age:27,div:'H-light',divName:'Poids léger',org:'Split',level:1,raison:null,interactions:0});
    m.roster=[mk('mgA','Alain'),mk('mgB','Bruno'),mk('mgC','César')];`;
}

test('MGMT corps — fin de carrière médicale définitive : jamais reproposé, jamais remis en carte', () => {
  const win = newGameWindow();
  freshState(win,208);
  const r = win.eval(`(function(){
    const m=G.mgmt;
    const mk=(id,first)=>({id:id,name:first+' Test',first:first,last:'Test',W:9,L:7,D:0,age:27,div:'H-light',divName:'Poids léger',org:'Split',level:1,raison:null,interactions:0});
    m.roster=[mk('mgA','Alain'),mk('mgB','Bruno'),mk('mgC','César'),mk('mgD','Dorian'),mk('mgE','Enzo'),mk('mgF','Farid'),mk('mgG','Gabin'),mk('mgH','Hugo'),mk('mgI','Ivan'),mk('mgJ','Jules'),mk('mgK','Karl'),mk('mgL','Luc'),mk('mgM','Marc'),mk('mgN','Noël'),mk('mgO','Oscar'),mk('mgP','Paul'),mk('mgQ','Quentin'),mk('mgR','Raoul'),mk('mgS','Sacha')];
    const f=m.roster[0];
    f.trauma=100; f.retired='medical';
    const vu=new Set();
    for(let c=0;c<40;c++){
      mgmtNewPile(m);
      /* §T3 : le bloc attend la carte principale complète — posée en
         fixture pour faire entrer la proposition dans le contrôle. */
      const dispo=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o));
      if(dispo.length>=10){
        for(let i=0;i<5;i++) m.card.main.push({a:dispo[2*i].id,b:dispo[2*i+1].id,cycle:m.cycle,slot:'main'});
        m.pile=[]; m.open=null;
        mgmtClosePile(m);
      }
      for(const a of m.pile){
        const list=(a.kind==='leila_bulk'&&Array.isArray(a.fights))?a.fights:[a];
        for(const x of list){ vu.add(x.a); vu.add(x.b); }
      }
      const bulk=m.pile.find(x=>x.kind==='leila_bulk'&&x.status==='open');
      if(bulk&&mgmtDecide(m,bulk.id,'validate')) mgmtRunEvent(m);
    }
    /* Le garde direct : un retraité posé en carte (fixture §T1 — carte
       complète 5+4, le retraité dans chaque combat) ne joue pas, et rien ne
       bouge (ni bilan, ni corps, ni trésorerie, ni carte). */
    m.pile=[]; m.open=null;
    m.card.main=[]; m.card.prelims=[];
    for(let i=0;i<5;i++){
      const b=i%2?m.roster[1]:m.roster[2];
      m.card.main.push({a:f.id,b:b.id,cycle:1,slot:'main'});
    }
    for(let i=0;i<4;i++){
      const b=i%2?m.roster[2]:m.roster[1];
      m.card.prelims.push({a:f.id,b:b.id,cycle:1,slot:'prelim'});
    }
    const avant=JSON.stringify({W:f.W,L:f.L,trauma:f.trauma,T:m.treasury,cardLen:m.card.main.length+m.card.prelims.length,ev:m.lastEvent});
    const joue=mgmtRunEvent(m);
    const apres=JSON.stringify({W:f.W,L:f.L,trauma:f.trauma,T:m.treasury,cardLen:m.card.main.length+m.card.prelims.length,ev:m.lastEvent});
    return JSON.stringify({ok:!vu.has(f.id),proposé:vu.size,refus:joue===null,intact:avant===apres});
  })()`);
  const s=JSON.parse(r);
  assert.equal(s.ok,true,'sur 40 cycles complets, le retraité médical ne revient dans aucune proposition');
  assert.ok(s.proposé>=2,'les 40 cycles ont bien produit des propositions pour les autres combattants (au moins deux vus)');
  assert.equal(s.refus,true,'posé en carte malgré la retraite : mgmtRunEvent refuse de jouer');
  assert.equal(s.intact,true,'le refus de jouer ne change rien (anti-mutation avant disponibilité)');
});

test('MGMT corps — suspendu : exclu de toutes les propositions jusqu’à la fin de sa suspension, puis re-proposable', () => {
  const win = newGameWindow();
  freshState(win,209);
  const r = win.eval(`(function(){
    const m=G.mgmt;
    const mk=(id,first)=>({id:id,name:first+' Test',first:first,last:'Test',W:9,L:7,D:0,age:27,div:'H-light',divName:'Poids léger',org:'Split',level:1,raison:null,interactions:0});
    m.roster=[mk('mgA','Alain'),mk('mgB','Bruno'),mk('mgC','César'),mk('mgD','Dorian'),mk('mgE','Enzo'),mk('mgF','Farid'),mk('mgG','Gabin'),mk('mgH','Hugo'),mk('mgI','Ivan'),mk('mgJ','Jules'),mk('mgK','Karl'),mk('mgL','Luc'),mk('mgM','Marc'),mk('mgN','Noël'),mk('mgO','Oscar'),mk('mgP','Paul'),mk('mgQ','Quentin'),mk('mgR','Raoul'),mk('mgS','Sacha')];
    const f=m.roster[0];
    f.susp=2; /* indisponible jusqu'au cycle 2 inclus, cycles arrondis au supérieur */
    const pendant=[],apres=[];
    for(let c=0;c<25;c++){
      mgmtNewPile(m);
      /* §T3 : le bloc attend la carte principale complète — posée en
         fixture (le suspendu en est exclu) pour que les propositions
         de Leïla passent le contrôle. */
      const dispo=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o));
      if(dispo.length>=10){
        for(let i=0;i<5;i++) m.card.main.push({a:dispo[2*i].id,b:dispo[2*i+1].id,cycle:m.cycle,slot:'main'});
        m.pile=[]; m.open=null;
        mgmtClosePile(m);
      }
      for(const a of m.pile){
        const list=(a.kind==='leila_bulk'&&Array.isArray(a.fights))?a.fights:[a];
        for(const x of list){ if(x.a===f.id||x.b===f.id) (m.cycle<=f.susp?pendant:apres).push(m.cycle); }
      }
    }
    m.cycle=1;
    const pendantPaires=mgmtEligiblePairs(m,new Set(),new Set(),null,0).some(p=>p[0].id===f.id||p[1].id===f.id);
    m.cycle=f.susp+1;
    const apresPaires=mgmtEligiblePairs(m,new Set(),new Set(),null,0).some(p=>p[0].id===f.id||p[1].id===f.id);
    return JSON.stringify({pendant:pendant.length,apres:apres.length,pendantPaires,apresPaires});
  })()`);
  const s=JSON.parse(r);
  assert.equal(s.pendant,0,'aucune affaire, aucun bloc ne contient le suspendu pendant sa suspension');
  assert.equal(s.pendantPaires,false,'mgmtEligiblePairs ne propose jamais un suspendu');
  assert.ok(s.apres>0,'après la fin de la suspension, il revient dans les propositions');
  assert.equal(s.apresPaires,true,'mgmtEligiblePairs le repropose après la fin de la suspension');
});

test('MGMT soirée — calculée une seule fois : recharger après la soirée ne change aucun résultat', () => {
  const win = newGameWindow();
  win.eval(`(function(){
    setSeed(210);
    const m=mgmtDefault(); mgmtNewRoster(m);
    /* §T3 (docs/LOT-2-CARTE-PRINCIPALE.md ; LOT-3B §2) : la carte
       principale d'abord en fixture (composition = T2), la proposition de
       Leïla ensuite, sur des combattants disponibles hors carte. */
    m.card.main=[];
    const dispo=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o));
    if(dispo.length<10) throw new Error('roster trop court');
    for(let i=0;i<5;i++) m.card.main.push({a:dispo[2*i].id,b:dispo[2*i+1].id,cycle:m.cycle,slot:'main'});
    m.pile=[]; m.open=null;
    if(mgmtClosePile(m)!=='refill') throw new Error('pas de proposition en bloc');
    const bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open');
    if(!bulk||!mgmtDecide(m,bulk.id,'validate')) throw new Error('pas de proposition en bloc');
    G={theme:'dark',mgmt:m};
    if(!mgmtRunEvent(G.mgmt)) throw new Error('soirée non jouée');
  })()`);
  const snap=`JSON.stringify({ev:G.mgmt.lastEvent,
    lignes:G.mgmt.roster.map(o=>({W:o.W,L:o.L,D:o.D,trauma:o.trauma,susp:o.susp,retired:o.retired})),
    T:G.mgmt.treasury,e:G.mgmt.eventsPlayed,card:{main:G.mgmt.card.main.length,prelims:G.mgmt.card.prelims.length}})`;
  const before = JSON.parse(win.eval(snap));
  win.eval(`G.mgmt=null; loadMgmt();`);
  const after = JSON.parse(win.eval(snap));
  assert.deepEqual(after,before,
    'recharger la page ne rejoue ni combat, ni conséquence, ni finance : tout vient de m.lastEvent sauvegardé');
  assert.equal(win.eval(`mgmtRunEvent(G.mgmt)`),null,
    'la carte est vidée après la soirée : un second appel ne rejoue rien');
});

test('MGMT corps — aucune valeur de traumatisme dans le DOM des écrans bureau, soirée et lendemain', () => {
  const win = newGameWindow();
  enterMgmt(win,211);
  win.eval(`G.mgmt.roster.forEach(o=>{o.trauma=${TRAUMA_PLANTÉ};}); render();`);
  let html = win.document.getElementById('app').innerHTML;
  assert.ok(html.includes('Le bureau'),'l\'écran du bureau est rendu');
  assertSansTrauma(html,'bureau');
  win.eval(`(function(){
    const m=G.mgmt;
    m.lastEvent={cycle:m.cycle,fights:[{a:m.roster[0].id,b:m.roster[1].id,winner:'A',family:'ko',round:2},
      {a:m.roster[2].id,b:m.roster[3].id,winner:'B',family:'dec',round:3}]};
    G.screen='mgmt_soiree'; render();
  })()`);
  html = win.document.getElementById('app').innerHTML;
  assert.ok(html.includes('La soirée'),'l\'écran de soirée est rendu');
  assertSansTrauma(html,'soirée');
  win.eval(`(function(){
    const m=G.mgmt;
    m.lastEvent.touched=[{id:m.roster[0].id,retired:false,injury:'Fracture de la main',days:90},
      {id:m.roster[2].id,retired:true,injury:null,days:0}];
    G.screen='mgmt_lendemain'; render();
  })()`);
  html = win.document.getElementById('app').innerHTML;
  assert.ok(html.includes('Le lendemain'),'l\'écran du lendemain est rendu');
  assertSansTrauma(html,'lendemain');
});
