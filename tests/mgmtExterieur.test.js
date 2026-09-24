"use strict";
/* CAGE LEGACY — tests/mgmtExterieur.test.js
   ============================================================================
   LOT 2B T1 LE MONDE EXTÉRIEUR DÉRIVÉ (docs/LOT-2B-LE-VIVIER-SE-RENOUVELLE.md
   §T1 ; QO-8) — couvre l'ancre MGMT_LOT2B_EXTERIEUR de mgmt-bureau.js :

   - la trace est déterministe : deux lectures d'affilée donnent exactement
     la même chose ;
   - la lire ne consomme AUCUN tirage de la RNG du jeu (état de la RNG
     relevé avant et après : il ne bouge pas) ;
   - rien n'est écrit sur la ligne : après lecture, la ligne ne porte
     toujours que son identité (id, graine, catégorie, pays, cycle
     d'entrée dans le monde) ;
   - le bilan ne régresse jamais quand le cycle avance (propriété de
     préfixe : la trace au cycle C2 prolonge la trace au cycle C1) ;
   - deux graines différentes ne donnent pas la même trace ;
   - les chiffres s'additionnent : victoires + défaites = combats, fins de
     combats = combats, combats des organisations = combats ;
   - T1 bis : 30 vivants par catégorie, Split compris, à l'ouverture et
      après 20 cycles, sans un seul tirage de la RNG du jeu ;
   - les classements organisation et monde partagent la même loi ;
   - recrutement, retraite médicale et anciennes sauvegardes maintiennent
      le quota sans ajouter un champ aux lignes ;
   - persistance : validateMgmt / mgmtRepair sur le champ exterieur.
   ============================================================================ */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

/* Identité seule : la liste exacte des clés qu'une ligne extérieure a le
   droit de porter (ancre MGMT_LOT2B_EXTERIEUR). */
const CLEFS_IDENTITE=['born','ck','div','id','seed'];

function quotaParCategorie(win){
  return win.eval('MGMT_EXT_LIVE_PER_DIVISION');
}

/* Un état frais avec son monde : cohorte initiale + entrants jusqu'au cycle
   demandé. Retourne {m} sérialisable (les lignes sont des données pures). */
function mondeFrais(win,cycles){
  return win.eval(`(function(){
    const m=mgmtDefault(); mgmtNewRoster(m);
    mgmtExteriorEnsure(m);
    for(let c=0;c<${cycles};c++){ m.cycle++; mgmtExteriorArrive(m); }
    return {seq:m.seq,exterieur:JSON.parse(JSON.stringify(m.exterieur))};
  })()`);
}

test('MGMT lot 2B T1 bis — 30 vivants par catégorie à l’ouverture et après 20 cycles', () => {
  const win=newGameWindow();
  const quota=quotaParCategorie(win);
  const r=win.eval(`(function(){
    setSeed(9001);
    const m=mgmtDefault();
    mgmtNewRoster(m);
    const seqAvant=m.seq;
    mgmtExteriorEnsure(m);
    const ouverture=allDivisions().map(d=>({id:d.id,vivants:mgmtWorldLivingCount(m,d.id),
      split:m.roster.filter(o=>o.div===d.id&&o.retired!=='medical').length,
      ext:m.exterieur.filter(o=>o.div===d.id).length}));
    const clefs=m.exterieur.map(l=>Object.keys(l).sort().join(','));
    const seqApresCohorte=m.seq;
    for(let c=1;c<=20;c++){ m.cycle=c; mgmtExteriorArrive(m); }
    const apres20=allDivisions().map(d=>mgmtWorldLivingCount(m,d.id));
    return {ouverture:ouverture,apres20:apres20,clefs:clefs,
      seqApresCohorte:seqApresCohorte,seqAvant:seqAvant,total:m.roster.length+m.exterieur.length};
  })()`);
  assert.equal(r.ouverture.length,12,'les douze catégories sont couvertes');
  for(const d of r.ouverture){
    assert.equal(d.vivants,quota,`${d.id} : quota mondial exact à l’ouverture`);
    assert.equal(d.split+d.ext,quota,`${d.id} : Split et extérieur s’additionnent`);
  }
  assert.ok(r.apres20.every(n=>n===quota),'les douze catégories tiennent le quota après 20 cycles');
  assert.ok(r.clefs.every(k=>k===CLEFS_IDENTITE.join(',')),'chaque ligne extérieure ne porte que son identité');
  assert.equal(r.seqApresCohorte-r.seqAvant,r.ouverture.reduce((n,d)=>n+d.ext,0),'les identifiants viennent du compteur de la partie');
  assert.equal(r.total,quota*12,'à effectif vivant inchangé, 360 lignes mondiales suffisent');
});

test('MGMT lot 2B T1 bis — compléter une catégorie ne dépend pas de la RNG du jeu', () => {
  const win=newGameWindow();
  const r=win.eval(`(function(){
    setSeed(11);
    const base=mgmtDefault(); mgmtNewRoster(base); mgmtExteriorEnsure(base);
    const retire=base.roster.find(o=>o.retired!=='medical'); retire.retired='medical'; base.cycle=5;
    const a=JSON.parse(JSON.stringify(base)), b=JSON.parse(JSON.stringify(base));
    setSeed(123); const rngA=rnd(); setSeed(123); mgmtExteriorArrive(a); const apresA=rnd();
    setSeed(999999); mgmtExteriorArrive(b);
    return {a:JSON.stringify(a.exterieur),b:JSON.stringify(b.exterieur),rng:rngA===apresA,
      born:a.exterieur[a.exterieur.length-1].born,div:retire.div,
      vivants:mgmtWorldLivingCount(a,retire.div)};
  })()`);
  assert.equal(r.a,r.b,'même état du monde → mêmes entrants malgré deux états de RNG différents');
  assert.ok(r.rng,'le remplissage ne consomme aucun tirage de la RNG du jeu');
  assert.equal(r.born,5,'le remplaçant porte le cycle où il entre dans le monde');
  assert.equal(r.vivants,quotaParCategorie(win),`${r.div} revient à 30 vivants`);
});

test('MGMT lot 2B T1 — la trace est déterministe : deux lectures d\'affilée donnent exactement la même chose', () => {
  const win=newGameWindow();
  const monde=mondeFrais(win,6);
  const r=win.eval(`(function(){
    const ext=${JSON.stringify(monde.exterieur)};
    const cycle=40;
    const t1=JSON.stringify(mgmtExteriorTrace(ext[0],cycle));
    const t2=JSON.stringify(mgmtExteriorTrace(ext[0],cycle));
    const t3=JSON.stringify(mgmtExteriorTrace(ext[Math.floor(ext.length/2)],cycle));
    const t4=JSON.stringify(mgmtExteriorTrace(ext[Math.floor(ext.length/2)],cycle));
    return {a:t1===t2,b:t3===t4,t1:t1,t3:t3};
  })()`);
  assert.ok(r.a,'deux lectures successives de la même ligne : identiques');
  assert.ok(r.b,'deux lectures successives d\'une autre ligne : identiques');
  assert.ok(r.t1.length>100,'la trace porte une carrière complète, pas un résumé vide');
});

test('MGMT lot 2B T1 — lire la trace, le vivier et les entrants ne consomme AUCUN tirage de la RNG du jeu', () => {
  const win=newGameWindow();
  const monde=mondeFrais(win,6);
  const ok=win.eval(`(function(){
    setSeed(424242);
    const premier=rnd();
    setSeed(424242);
    /* Toute la lecture du monde : cohorte, entrants, traces répétées.
       Aucune génération de roster ici — seule la lecture du monde est
       mesurée (mgmtNewRoster, elle, consomme la RNG du jeu, c'est son
       rôle). */
    const m=mgmtDefault();
    mgmtExteriorEnsure(m);
    for(let c=1;c<=6;c++){ m.cycle=c; mgmtExteriorArrive(m); }
    const ext=${JSON.stringify(monde.exterieur)};
    for(const l of ext){ mgmtExteriorTrace(l,10); mgmtExteriorTrace(l,50); mgmtExteriorTrace(l,50); }
    const dernier=rnd();
    return premier===dernier;
  })()`);
  assert.ok(ok,'l\'état de la RNG relevé avant et après la lecture du monde : identique');
});

test('MGMT lot 2B T1 — rien n\'est écrit sur la ligne : après lecture, elle ne porte toujours que son identité', () => {
  const win=newGameWindow();
  const monde=mondeFrais(win,4);
  const r=win.eval(`(function(){
    const ext=${JSON.stringify(monde.exterieur)};
    const avant=ext.map(l=>JSON.stringify(l));
    for(const l of ext) mgmtExteriorTrace(l,77);
    const apres=ext.map(l=>JSON.stringify(l));
    return {meme:avant.every((s,i)=>s===apres[i]),
      clefs:ext.map(l=>Object.keys(l).sort().join(','))};
  })()`);
  assert.ok(r.meme,'la ligne est inchangée octet pour octet après lecture');
  for(const k of r.clefs) assert.equal(k,CLEFS_IDENTITE.join(','),'clés exactement '+CLEFS_IDENTITE.join(','));
});

test('MGMT lot 2B T1 — le bilan ne régresse jamais quand le cycle avance (propriété de préfixe)', () => {
  const win=newGameWindow();
  const monde=mondeFrais(win,6);
  const r=win.eval(`(function(){
    const ext=${JSON.stringify(monde.exterieur)};
    let lignes=0, violations='', croissance=0;
    for(const l of ext){
      let prev=null;
      for(let c=l.born;c<=l.born+70;c++){
        const t=mgmtExteriorTrace(l,c);
        if(!t){ violations+='trace nulle au cycle '+c+';'; break; }
        if(prev){
          if(t.pro.W<prev.pro.W||t.pro.L<prev.pro.L||t.fights<prev.fights) violations+='bilan pro en régression au cycle '+c+';';
          if(t.age<prev.age) violations+='âge en régression au cycle '+c+';';
          for(const k of ['ko','sub','dec']) if(t.pro.fin[k]<prev.pro.fin[k]) violations+='fins pro en régression au cycle '+c+';';
          if(t.orgs.length<prev.orgs.length) violations+='organisations en régression au cycle '+c+';';
          if(JSON.stringify(t.amateur)!==JSON.stringify(prev.amateur)) violations+='bilan amateur qui bougerait au cycle '+c+';';
          if(t.name!==prev.name||t.first!==prev.first||t.last!==prev.last) violations+='nom instable au cycle '+c+';';
          if(t.fights>prev.fights) croissance++;
        }
        prev=t;
      }
      lignes++;
    }
    return {lignes:lignes,violations:violations,croissance:croissance};
  })()`);
  assert.equal(r.violations,'','aucune régression sur '+r.lignes+' lignes, 70 cycles chacune');
  assert.ok(r.croissance>0,'le bilan d\'un non-recruté AVANCE avec les cycles (au moins une progression observée)');
});

test('MGMT lot 2B T1 — deux graines différentes ne donnent pas la même trace', () => {
  const win=newGameWindow();
  const monde=mondeFrais(win,6);
  const r=win.eval(`(function(){
    const ext=${JSON.stringify(monde.exterieur)};
    const vus={};
    let collisions=0;
    for(const l of ext){
      const t=JSON.stringify(mgmtExteriorTrace(l,45));
      if(vus[t]) collisions++;
      vus[t]=true;
    }
    /* Contrôle direct : deux lignes re-seedées artificiellement divergent. */
    const l1={id:'a',seed:1234,div:'H-light',ck:'FR',born:0};
    const l2={id:'b',seed:5678,div:'H-light',ck:'FR',born:0};
    const diff=JSON.stringify(mgmtExteriorTrace(l1,45))!==JSON.stringify(mgmtExteriorTrace(l2,45));
    return {collisions:collisions,n:ext.length,diff:diff};
  })()`);
  assert.equal(r.collisions,0,r.n+' graines différentes, zéro trace identique');
  assert.ok(r.diff,'deux graines posées à la main sur la même catégorie et le même pays donnent deux traces différentes');
});

test('MGMT lot 2B T1 — les chiffres s\'additionnent : victoires + défaites = combats, fins = combats, organisations = combats', () => {
  const win=newGameWindow();
  const monde=mondeFrais(win,6);
  const r=win.eval(`(function(){
    const ext=${JSON.stringify(monde.exterieur)};
    let lignes=0, violations='';
    for(const l of ext){
      const t=mgmtExteriorTrace(l,60);
      if(!t){ violations+='trace nulle;'; continue; }
      lignes++;
      if(t.pro.W+t.pro.L!==t.fights) violations+='W+L != combats pro;';
      if(t.pro.fin.ko+t.pro.fin.sub+t.pro.fin.dec!==t.fights) violations+='fins pro != combats pro;';
      if(t.amateur.W+t.amateur.L!==t.amateur.fin.ko+t.amateur.fin.sub+t.amateur.fin.dec) violations+='amateur : bilan et fins ne racontent pas la même phase;';
      let somme=0;
      for(const o of t.orgs) somme+=o.fights;
      if(somme!==t.fights) violations+='combats des organisations ('+somme+') != combats pro ('+t.fights+');';
      if(t.orgs[0].i!==0) violations+='la carrière commence dans la première organisation;';
      for(let i=0;i<t.orgs.length;i++){ if(t.orgs[i].i!==i) violations+="échelle d'organisations discontinue;"; }
      if(t.age<MGMT_EXT_AGE_START_MIN||t.age>100) violations+='âge courant hors bornes;';
    }
    return {lignes:lignes,violations:violations};
  })()`);
  assert.equal(r.violations,'','tous les compteurs se tiennent sur '+r.lignes+' lignes');
});

test('MGMT lot 2B T1 — trajectoire lisible : la trace raconte des carrières différentes et tenues', () => {
  const win=newGameWindow();
  const monde=mondeFrais(win,6);
  const r=win.eval(`(function(){
    const ext=${JSON.stringify(monde.exterieur)};
    let bilans={}, orgsMax=0, finsTot=0, combatsTot=0;
    for(const l of ext){
      const t=mgmtExteriorTrace(l,60);
      bilans[t.pro.W+'-'+t.pro.L]=(bilans[t.pro.W+'-'+t.pro.L]||0)+1;
      orgsMax=Math.max(orgsMax,t.orgs.length);
      finsTot+=t.pro.fin.ko+t.pro.fin.sub; combatsTot+=t.fights;
    }
    const cles=Object.keys(bilans);
    return {bilansDistincts:cles.length,orgsMax:orgsMax,spectacle:combatsTot>0?finsTot/combatsTot:0,n:ext.length,
      exemple:JSON.stringify(mgmtExteriorTrace(ext[0],60))};
  })()`);
  const bornes=win.eval('({max:MGMT_EXT_ORGS.length,ageMin:MGMT_EXT_AGE_START_MIN})');
  assert.ok(r.bilansDistincts>Math.floor(r.n*0.5),'les bilans ne se ressemblent pas (mesuré : '+r.bilansDistincts+' bilans distincts pour '+r.n+' lignes)');
  assert.ok(r.orgsMax>=1&&r.orgsMax<=bornes.max,'l\'échelle d\'organisations est respectée');
  assert.ok(r.spectacle>0.4&&r.spectacle<0.9,'la part de finitions du monde dérivé est d\'un ordre réaliste (mesuré : '+(r.spectacle*100).toFixed(1)+' %)');
  const ex=JSON.parse(r.exemple);
  assert.ok(ex.orgs.length>=1&&ex.orgs[0].from!==null,'la première organisation porte sa période');
  assert.ok(typeof ex.age==='number'&&ex.age>=bornes.ageMin,'l\'âge courant est dérivé, pas stocké');
});

test('MGMT lot 2B T1 bis — deux classements, une seule loi : organisation et monde', () => {
  const win=newGameWindow();
  const r=win.eval(`(function(){
    const mk=(id,W,L,lastCycle)=>({id:id,name:id,first:id,last:'Test',W:W,L:L,D:0,age:27,
      div:'H-light',divName:'Poids léger',org:'Split',level:1,raison:null,interactions:0,lastCycle:lastCycle});
    const m=mgmtDefault();
    m.roster=[mk('split-a',14,2,4),mk('split-b',12,3,8),mk('split-c',14,2,4)];
    m.seq=100; m.cycle=10; mgmtExteriorEnsure(m);
    const ext=m.exterieur.find(o=>o.div==='H-light');
    const avant=JSON.stringify({roster:m.roster,exterieur:m.exterieur});
    const orgA=mgmtDivisionRank(m,m.roster[0]);
    const orgB=mgmtDivisionRank(m,m.roster[1]);
    const worldA=mgmtDivisionRank(m,m.roster[0],'world');
    const worldB=mgmtDivisionRank(m,m.roster[1],'world');
    const orgC=mgmtDivisionRank(m,m.roster[2]);
    const worldC=mgmtDivisionRank(m,m.roster[2],'world');
    const worldExt=mgmtDivisionRank(m,ext,'world');
    const orgExt=mgmtDivisionRank(m,ext);
    return {orgA:orgA,orgB:orgB,orgC:orgC,worldA:worldA,worldB:worldB,worldC:worldC,worldExt:worldExt,orgExt:orgExt,
      orgN:mgmtDivisionRanking(m,'H-light','organization').length,
      worldN:mgmtDivisionRanking(m,'H-light','world').length,
      intact:avant===JSON.stringify({roster:m.roster,exterieur:m.exterieur})};
  })()`);
  assert.equal(r.orgN,3,'le classement de l’organisation ne contient que Split');
  assert.equal(r.worldN,quotaParCategorie(win),'le classement mondial contient Split et l’extérieur');
  assert.ok(r.orgA<r.orgB&&r.worldA<r.worldB,'deux combattants de Split gardent le même ordre relatif dans les deux portées');
  assert.notEqual(r.orgA,r.orgC,'une égalité parfaite garde deux rangs positionnels distincts dans Split');
  assert.notEqual(r.worldA,r.worldC,'une égalité parfaite garde deux rangs positionnels distincts dans le monde');
  assert.ok(Number.isSafeInteger(r.worldExt),'une ligne extérieure reçoit un rang mondial dérivé');
  assert.equal(r.orgExt,null,'une ligne extérieure n’entre pas au classement de Split');
  assert.ok(r.intact,'calculer les deux classements n’écrit sur aucune ligne');
});

test('MGMT lot 2B T1 bis — recruter ne déplace pas le rang mondial et ne vide pas la catégorie', () => {
  const win=newGameWindow();
  const r=win.eval(`(function(){
    setSeed(20260922);
    const m=mgmtDefault(); mgmtNewRoster(m); m.cycle=1; mgmtExteriorEnsure(m);
    let choisi=null, trace=null, last=-1;
    for(const line of m.exterieur){
      const t=mgmtExteriorTrace(line,m.cycle);
      const lc=t.orgs.length?t.orgs[t.orgs.length-1].to:-1;
      if(Number.isSafeInteger(lc)&&lc<0){ choisi=line; trace=t; last=lc; break; }
    }
    if(!choisi) return {erreur:'aucune récence extérieure négative'};
    const avant=mgmtDivisionRank(m,choisi,'world');
    const totalAvant=mgmtWorldLivingCount(m,choisi.div);
    const extAvant=m.exterieur.filter(o=>o.div===choisi.div).length;
    m.exterieur=m.exterieur.filter(o=>o.id!==choisi.id);
    const recrute={id:choisi.id,name:trace.name,first:trace.first,last:trace.last,
      W:trace.pro.W,L:trace.pro.L,D:0,age:trace.age,div:choisi.div,
      divName:divById(choisi.div).name,org:MGMT_ORG,level:1,raison:null,interactions:0,lastCycle:last};
    m.roster.push(recrute);
    mgmtExteriorArrive(m);
    return {avant:avant,apres:mgmtDivisionRank(m,recrute,'world'),
      totalAvant:totalAvant,totalApres:mgmtWorldLivingCount(m,choisi.div),
      extAvant:extAvant,extApres:m.exterieur.filter(o=>o.div===choisi.div).length,
      last:last,valide:validateMgmt(m),
      clefs:m.exterieur.every(o=>Object.keys(o).sort().join(',')==='born,ck,div,id,seed')};
  })()`);
  assert.equal(r.erreur,undefined,'la fixture couvre un dernier combat antérieur au cycle 0');
  assert.equal(r.apres,r.avant,'changer de maison ne change pas le rang mondial');
  assert.ok(r.last<0,'la récence extérieure négative reste exacte');
  assert.ok(r.valide,'la recrue et sa récence passent la porte de sauvegarde');
  assert.equal(r.totalAvant,quotaParCategorie(win));
  assert.equal(r.totalApres,quotaParCategorie(win),'la catégorie reste pleine, Split compris');
  assert.equal(r.extApres,r.extAvant-1,'l’extérieur cède une ligne à Split sans recréer un doublon');
  assert.ok(r.clefs,'aucune ligne extérieure ne gagne un champ pendant le recrutement');
});

test('MGMT lot 2B T1 bis — un retraité médical sort des deux classements et du quota', () => {
  const win=newGameWindow();
  const r=win.eval(`(function(){
    setSeed(444);
    const m=mgmtDefault(); mgmtNewRoster(m); m.cycle=7; mgmtExteriorEnsure(m);
    const f=m.roster.find(o=>mgmtDivisionRank(m,o)!==null);
    const extAvant=m.exterieur.length;
    f.retired='medical';
    const creux=mgmtWorldLivingCount(m,f.div);
    mgmtExteriorArrive(m);
    return {org:mgmtDivisionRank(m,f),world:mgmtDivisionRank(m,f,'world'),creux:creux,
      plein:mgmtWorldLivingCount(m,f.div),ajouts:m.exterieur.length-extAvant,
      born:m.exterieur[m.exterieur.length-1].born};
  })()`);
  assert.equal(r.org,null,'le retraité sort du classement de Split');
  assert.equal(r.world,null,'le retraité sort du classement mondial');
  assert.equal(r.creux,quotaParCategorie(win)-1,'le retraité ne compte plus parmi les vivants');
  assert.equal(r.plein,quotaParCategorie(win),'l’extérieur complète la place libérée');
  assert.equal(r.ajouts,1,'une ligne nouvelle, aucune ligne morte supprimée');
  assert.equal(r.born,7,'la nouvelle ligne porte le cycle courant');
});

/* ==== [ANCRE: MGMT_LOT2B_T3_EXTERIEUR_TESTS] — Lot 2B T3 les départs :
   le monde extérieur part sous la même loi que le roster. Une ligne en fin
   de carrière sort des vivants SANS être supprimée, sa sortie libère une
   place que le quota fait entrer à un jeune, et à 240 cycles chaque
   catégorie contient encore des moins de 25 ans (le monde se renouvelle,
   il ne vieillit pas en bloc). ==== */
test('MGMT lot 2B T3 — une ligne extérieure en fin de carrière sort des vivants, sa ligne reste, le quota la remplace', () => {
  const win = newGameWindow();
  const r = win.eval(`(function(){
    setSeed(20261001);
    const m=mgmtDefault(); mgmtNewRoster(m); mgmtExteriorEnsure(m);
    /* La frontière exacte d'une ligne : pas encore partie un cycle plus
       tôt, partie à son cycle de retraite. */
    const l=m.exterieur[0];
    const tl0=mgmtExteriorTrace(l,0);
    const fin=tl0.retireCycle;
    const avantFin=mgmtExteriorRetired(l,fin-1);
    const aFin=mgmtExteriorRetired(l,fin);
    const gelaAvant=mgmtExteriorTrace(l,fin-1).fights;
    const gelaApres=mgmtExteriorTrace(l,fin+60).fights;
    const bilanAvant=mgmtExteriorTrace(l,fin-1).pro;
    const bilanApres=mgmtExteriorTrace(l,fin+60).pro;
    m.cycle=fin;
    const vivantsAvant=mgmtWorldLivingCount(m,l.div);
    const lignesAvant=m.exterieur.length;
    const toujoursLa=m.exterieur.some(o=>o.id===l.id);
    mgmtExteriorArrive(m);
    const entrants=m.exterieur.filter(o=>o.born===fin);
    const jeunes=entrants.filter(o=>mgmtExteriorTrace(o,fin).age<MGMT_EXT_AGE_MIN+MGMT_EXT_AGE_SPREAD);
    const rangMonde=mgmtDivisionRank(m,l,'world');
    return JSON.stringify({avantFin,aFin,vivantsAvant,vivantsApres:mgmtWorldLivingCount(m,l.div),
      lignesAvant,lignesApres:m.exterieur.length,toujoursLa,entrants:entrants.length,
      jeunes:jeunes.length,rangMonde,quota:MGMT_EXT_LIVE_PER_DIVISION,
      gela:gelaApres>=gelaAvant,gelaConstant:mgmtExteriorTrace(l,fin+600).fights===gelaApres,
      bilanOk:bilanApres.W>=bilanAvant.W&&bilanApres.L>=bilanAvant.L,
      identite:m.exterieur.every(o=>Object.keys(o).sort().join(',')==='born,ck,div,id,seed')});
  })()`);
  const s=JSON.parse(r);
  assert.equal(s.avantFin,false,'un cycle avant son terme, la ligne est encore vivante');
  assert.equal(s.aFin,true,'à son cycle de retraite, la ligne ne compte plus parmi les vivants');
  assert.ok(s.gela&&s.gelaConstant&&s.bilanOk,'après le terme, le bilan se fige sans jamais régresser');
  assert.equal(s.vivantsApres,s.quota,'la place libérée ramène la catégorie au quota');
  assert.ok(s.lignesApres>s.lignesAvant,'des lignes sont ajoutées');
  assert.ok(s.toujoursLa,'la ligne du partant n\u2019est pas supprimée (QO-9 : le passé du monde ne disparaît pas)');
  assert.ok(s.entrants>=1,'la sortie déclenche au moins un remplaçant');
  assert.equal(s.jeunes,s.entrants,'chaque remplaçant est un jeune du monde');
  assert.equal(s.rangMonde,null,'le partant sort du classement mondial');
  assert.ok(s.identite,'aucune ligne n\u2019a gagné un champ : la retraite est dérivée, jamais stockée');
});

test('MGMT lot 2B T3 — après 240 cycles, le monde s’est renouvelé : plus aucune ligne fondatrice, des moins de 25 ans, médiane loin du bloc vieillissant', () => {
  const win = newGameWindow();
  const r = win.eval(`(function(){
    setSeed(20261002);
    const m=mgmtDefault(); mgmtNewRoster(m); mgmtExteriorEnsure(m);
    for(let c=1;c<=240;c++){ m.cycle=c; mgmtExteriorArrive(m); }
    const parCategorie=allDivisions().map(d=>{
      const split=m.roster.filter(o=>o&&o.div===d.id&&!mgmtIsRetired(o)).length;
      const vivants=m.exterieur.filter(o=>o.div===d.id&&!mgmtExteriorRetired(o,m.cycle));
      const ages=vivants.map(o=>mgmtExteriorTrace(o,m.cycle).age);
      return {div:d.id,vivants:split+vivants.length,moins25:ages.filter(a=>a<25).length,
        median:ages.sort((x,y)=>x-y)[Math.floor(ages.length/2)]};
    });
    const ages=[];
    for(const o of m.exterieur){ if(!mgmtExteriorRetired(o,m.cycle)) ages.push(mgmtExteriorTrace(o,m.cycle).age); }
    ages.sort((a,b)=>a-b);
    return JSON.stringify({cycle:m.cycle,lignes:m.exterieur.length,
      fondatrices:m.exterieur.filter(o=>o.born===0&&!mgmtExteriorRetired(o,m.cycle)).length,
      mondeMoins25:ages.filter(a=>a<25).length,mondeMin:ages[0],
      mondeMedian:ages[Math.floor(ages.length/2)],parCategorie:parCategorie});
  })()`);
  const s=JSON.parse(r);
  assert.equal(s.cycle,240,'240 cycles ont passé');
  assert.equal(s.fondatrices,0,'plus aucune ligne fondatrice (born 0) ne vit encore : la cohorte d’ouverture a entièrement passé la main');
  assert.ok(s.mondeMoins25>=10&&s.mondeMin<25,
    'le monde contient une vraie jeunesse (mesuré : '+s.mondeMoins25+' lignes de moins de 25 ans, minimum '+s.mondeMin+')');
  assert.ok(s.mondeMedian<40,'l’âge médian du monde ('+s.mondeMedian+') reste loin des 48 du monde sans départs (T1 bis) — voir le rapport pour la tension sur la décennie exacte');
  for(const d of s.parCategorie){
    assert.equal(d.vivants,quotaParCategorie(win),`${d.div} tient toujours le quota`);
  }
  assert.ok(s.lignes>s.parCategorie.length*quotaParCategorie(win),'les lignes s’accumulent sans jamais être supprimées');
});
/* ==== [FIN ANCRE] ==== */

test('MGMT lot 2B T1 bis — après une retraite, continuer ou recharger crée le même remplaçant', () => {
  const win=newGameWindow();
  const r=win.eval(`(function(){
    setSeed(445);
    const base=mgmtDefault(); mgmtNewRoster(base); base.cycle=6; mgmtExteriorEnsure(base);
    base.roster[0].retired='medical';
    const continuee=JSON.parse(JSON.stringify(base));
    mgmtExteriorEnsure(continuee);
    localStorage.setItem(MGMT_KEY,JSON.stringify(base));
    G={theme:'dark'};
    const charge=loadMgmt();
    return {charge:charge,
      continuee:JSON.stringify(continuee.exterieur),
      rechargee:JSON.stringify(G.mgmt.exterieur),
      seqContinuee:continuee.seq,seqRechargee:G.mgmt.seq};
  })()`);
  assert.ok(r.charge,'la sauvegarde creusée par la retraite se charge');
  assert.equal(r.rechargee,r.continuee,'la réparation et la continuation dérivent la même identité');
  assert.equal(r.seqRechargee,r.seqContinuee,'le compteur avance de façon identique');
});

test('MGMT lot 2B T1 bis — une soirée rétablit le quota avant de sauvegarder ses retraites', () => {
  const win=newGameWindow();
  const r=win.eval(`(function(){
    setSeed(446);
    const m=mgmtDefault(); mgmtNewRoster(m); m.cycle=4; mgmtExteriorEnsure(m);
    G={theme:'dark',mgmt:m};
    const pris=m.roster.slice(0,18);
    for(const f of pris) f.trauma=MGMT_TRAUMA_MAX;
    m.card.main=[]; m.card.prelims=[];
    for(let i=0;i<5;i++) m.card.main.push({a:pris[i*2].id,b:pris[i*2+1].id,cycle:m.cycle,slot:'main'});
    for(let i=5;i<9;i++) m.card.prelims.push({a:pris[i*2].id,b:pris[i*2+1].id,cycle:m.cycle,slot:'prelim'});
    const event=mgmtRunEvent(m);
    const saved=JSON.parse(localStorage.getItem(MGMT_KEY));
    return {event:!!event,retraites:m.roster.filter(o=>o.retired==='medical').length,
      memoire:allDivisions().map(d=>mgmtWorldLivingCount(m,d.id)),
      disque:allDivisions().map(d=>mgmtWorldLivingCount(saved,d.id))};
  })()`);
  assert.ok(r.event,'la soirée complète est jouée');
  assert.ok(r.retraites>0,'la fixture produit des retraites médicales');
  assert.ok(r.memoire.every(n=>n===quotaParCategorie(win)),
    `le monde en mémoire est complet dès la fin de soirée (${r.memoire.join(',')})`);
  assert.ok(r.disque.every(n=>n===quotaParCategorie(win)),
    `la sauvegarde de la soirée est déjà complète (${r.disque.join(',')})`);
});

test('MGMT lot 2B T1 — persistance : validateMgmt accepte le vivier, refuse une ligne qui porterait plus que son identité', () => {
  const win=newGameWindow();
  const ok=win.eval(`(function(){
    setSeed(77);
    const m=mgmtDefault(); mgmtNewRoster(m);
    mgmtExteriorEnsure(m); m.cycle=3; mgmtExteriorArrive(m);
    const propre=JSON.parse(JSON.stringify(m));
    /* Une ligne qui accumulerait un bilan stocké ne passe plus la porte. */
    const alourdie=JSON.parse(JSON.stringify(m));
    alourdie.exterieur[0].W=12;
    const seedNegative=JSON.parse(JSON.stringify(m));
    seedNegative.exterieur[1].seed=-1;
    const paysInconnu=JSON.parse(JSON.stringify(m));
    paysInconnu.exterieur[2].ck='XX';
    const absente=JSON.parse(JSON.stringify(m)); delete absente.exterieur;
    return {propre:validateMgmt(propre),alourdie:validateMgmt(alourdie),
      seedNegative:validateMgmt(seedNegative),paysInconnu:validateMgmt(paysInconnu),
      absente:validateMgmt(absente)};
  })()`);
  assert.equal(ok.propre,true,'une sauvegarde avec le vivier passe la porte');
  assert.equal(ok.alourdie,false,'une ligne qui stockerait un bilan est refusée');
  assert.equal(ok.seedNegative,false,'une graine hors 32 bits est refusée');
  assert.equal(ok.paysInconnu,false,'un pays hors catalogue est refusé');
  assert.equal(ok.absente,true,'le champ est toléré absent (sauvegardes d\'avant le lot 2B)');
});

test('MGMT lot 2B T1 bis — mgmtRepair filtre puis complète les anciennes sauvegardes', () => {
  const win=newGameWindow();
  const quota=quotaParCategorie(win);
  const r=win.eval(`(function(){
    setSeed(88);
    const m=mgmtDefault(); mgmtNewRoster(m);
    mgmtExteriorEnsure(m); m.cycle=2; mgmtExteriorArrive(m);
    const avant=m.exterieur.length;
    m.exterieur[0].div='inconnu';
    const repare=mgmtRepair(m);
    const epure=repare.exterieur.length;
    /* Sauvegarde d'avant la tranche : petit monde global et catégories
       creuses, mais lignes T1 valides. */
    const ancienne=mgmtDefault();
    mgmtNewRoster(ancienne);
    mgmtExteriorEnsure(ancienne); ancienne.exterieur=ancienne.exterieur.slice(0,35);
    const idsAvant=ancienne.exterieur.map(o=>o.id);
    const valideAvant=validateMgmt(ancienne);
    localStorage.setItem(MGMT_KEY,JSON.stringify(ancienne));
    G={theme:'dark'};
    const charge=loadMgmt();
    return {avant:avant,epure:epure,valideAvant:valideAvant,charge:charge,
      quotas:allDivisions().map(d=>mgmtWorldLivingCount(G.mgmt,d.id)),
      conserve:idsAvant.every(id=>G.mgmt.exterieur.some(o=>o.id===id)),
      identite:repare.exterieur.every(l=>Object.keys(l).sort().join(',')==='born,ck,div,id,seed')};
  })()`);
  assert.equal(r.epure,r.avant,'la ligne illisible est remplacée après filtrage pour tenir le quota');
  assert.ok(r.valideAvant,'l’ancien petit monde passe validateMgmt avant réparation');
  assert.ok(r.charge,'l’ancienne sauvegarde se charge par la porte normale');
  assert.ok(r.quotas.every(n=>n===quota),'les catégories creuses sont complétées au chargement');
  assert.ok(r.conserve,'aucune ligne valide de l’ancien monde n’est perdue');
  assert.ok(r.identite,'les lignes réparées ne portent toujours que leur identité');
});

test('MGMT lot 2B T1 bis — le bureau ouvre à 30 par catégorie et remplace une retraite au cycle suivant', () => {
  const win=newGameWindow();
  const quota=quotaParCategorie(win);
  win.eval(`setSeed(66); CL.mgmtEnter();`);
  const r=win.eval(`(function(){
    const ouverture=allDivisions().map(d=>mgmtWorldLivingCount(G.mgmt,d.id));
    const f=G.mgmt.roster.find(o=>o.retired!=='medical');
    f.retired='medical';
    const avant=G.mgmt.exterieur.length;
    mgmtNewPile(G.mgmt);
    const cycleEntree=G.mgmt.cycle-1;
    const entrantsCycle=G.mgmt.exterieur.filter(l=>l.born===cycleEntree).length;
    return {ouverture:ouverture,ajouts:G.mgmt.exterieur.length-avant,
      entrantsCycle:entrantsCycle,cycleEntree:cycleEntree,cycle:G.mgmt.cycle,
      plein:mgmtWorldLivingCount(G.mgmt,f.div)};
  })()`);
  assert.ok(r.ouverture.every(n=>n===quota),'le bureau ouvre avec douze catégories pleines');
  assert.equal(r.ajouts,1,'la retraite crée exactement une place extérieure');
  assert.equal(r.entrantsCycle,1,'le remplaçant porte le cycle de la retraite avant l’ouverture suivante');
  assert.equal(r.plein,quota,'la catégorie est de nouveau pleine');
});
