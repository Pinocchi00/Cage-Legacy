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
   - le flux : cohorte initiale au premier jour, entrants dérivés à chaque
     cycle (aucun nombre fixe), sans un seul tirage de la RNG du jeu ;
   - persistance : validateMgmt / mgmtRepair sur le champ exterieur.
   ============================================================================ */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

/* Identité seule : la liste exacte des clés qu'une ligne extérieure a le
   droit de porter (ancre MGMT_LOT2B_EXTERIEUR). */
const CLEFS_IDENTITE=['born','ck','div','id','seed'];

/* Bande de la cohorte initiale (constantes du jeu, lues dans la fenêtre) :
   MGMT_EXT_INIT_MIN à MIN+SPREAD-1 (mgmt-data.js, ancre
   MGMT_LOT2B_EXTERIEUR_DONNEES). */
function bornesCohorte(win){
  return win.eval('({min:MGMT_EXT_INIT_MIN,spread:MGMT_EXT_INIT_SPREAD})');
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

test('MGMT lot 2B T1 — cohorte initiale et flux : le monde existe au premier jour, entrants dérivés cycle par cycle', () => {
  const win=newGameWindow();
  const B=bornesCohorte(win);
  const r=win.eval(`(function(){
    setSeed(9001);
    const m=mgmtDefault();
    mgmtNewRoster(m);
    const seqAvant=m.seq;
    mgmtExteriorEnsure(m);
    const cohorte=JSON.parse(JSON.stringify(m.exterieur));
    const seqApresCohorte=m.seq;
    m.cycle=7; mgmtExteriorArrive(m);
    m.cycle=8; mgmtExteriorArrive(m);
    return {cohorte:cohorte,seqApresCohorte:seqApresCohorte,seqAvant:seqAvant,
      apres:JSON.parse(JSON.stringify(m.exterieur.slice(cohorte.length))),
      total:m.exterieur.length};
  })()`);
  assert.ok(r.cohorte.length>=B.min&&r.cohorte.length<B.min+B.spread,
    `la cohorte initiale est dans la bande ${B.min}..+${B.spread} (mesuré : ${r.cohorte.length})`);
  for(const l of r.cohorte){ assert.deepEqual(Object.keys(l).sort(),CLEFS_IDENTITE,'une ligne ne porte que son identité'); assert.equal(l.born,0,'la cohorte initiale entre au cycle 0'); }
  assert.equal(r.seqApresCohorte,r.seqAvant+r.cohorte.length,'les identifiants viennent du compteur de la partie');
  assert.ok(r.total>=r.cohorte.length&&r.total<=r.cohorte.length+2*3,'le flux ajoute 0 à 3 entrants par cycle (aucun nombre fixe)');
  for(const l of r.apres){ assert.deepEqual(Object.keys(l).sort(),CLEFS_IDENTITE,'une ligne d\'entrant ne porte que son identité'); assert.ok(l.born===7||l.born===8,'un entrant porte le cycle où il entre dans le monde'); }
});

test('MGMT lot 2B T1 — le flux ne dépend pas de la RNG du jeu : même cycle, même entrants, seedés ou non', () => {
  const win=newGameWindow();
  const a=win.eval(`(function(){ setSeed(11); const m=mgmtDefault(); mgmtNewRoster(m); m.cycle=5; mgmtExteriorArrive(m); return {n:m.exterieur.length,ids:m.exterieur.map(l=>l.id),borns:m.exterieur.map(l=>l.born)}; })()`);
  const b=win.eval(`(function(){ setSeed(999999); const m=mgmtDefault(); mgmtNewRoster(m); m.cycle=5; mgmtExteriorArrive(m); return {n:m.exterieur.length,ids:m.exterieur.map(l=>l.id),borns:m.exterieur.map(l=>l.born)}; })()`);
  /* Les entrants d'un cycle sont dérivés du cycle (jamais d'un quota, jamais
     de la RNG du jeu) : seuls les identifiants — issus du compteur de la
     partie, donc de la taille du roster généré avant eux — peuvent différer
     d'une graine à l'autre ; le COMPTE et les cycles d'entrée non. */
  assert.equal(a.n,b.n,'même cycle → même nombre d\'entrants');
  assert.deepEqual(a.borns,b.borns,'même cycle → mêmes cycles d\'entrée');
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

test('MGMT lot 2B T1 — mgmtRepair : le vivier se recadre, créé s\'il manque, épuré d\'une ligne illisible', () => {
  const win=newGameWindow();
  const B2=bornesCohorte(win);
  const r=win.eval(`(function(){
    setSeed(88);
    const m=mgmtDefault(); mgmtNewRoster(m);
    mgmtExteriorEnsure(m); m.cycle=2; mgmtExteriorArrive(m);
    const avant=m.exterieur.length;
    m.exterieur[0].div='inconnu';
    const repare=mgmtRepair(m);
    const epure=repare.exterieur.length;
    /* Sauvegarde d'avant le lot : pas de champ exterieur du tout. */
    const ancienne=mgmtDefault(); ancienne.exterieur=undefined;
    mgmtNewRoster(ancienne);
    mgmtRepair(ancienne);
    return {avant:avant,epure:epure,recree:ancienne.exterieur?ancienne.exterieur.length:0,
      identite:repare.exterieur.every(l=>Object.keys(l).sort().join(',')==='born,ck,div,id,seed')};
  })()`);
  assert.equal(r.epure,r.avant-1,'la ligne illisible est écartée, les autres restent');
  assert.ok(r.recree>=B2.min,'une sauvegarde d\'avant le lot reçoit sa cohorte initiale');
  assert.ok(r.identite,'les lignes réparées ne portent toujours que leur identité');
});

test('MGMT lot 2B T1 — le bureau ouvre avec son monde : mgmtNewPile crée la cohorte et fait entrer le flux du cycle', () => {
  const win=newGameWindow();
  const B3=bornesCohorte(win);
  win.eval(`setSeed(66); CL.mgmtEnter();`);
  const r=win.eval(`(function(){
    /* CL.mgmtEnter ouvre le premier cycle : le monde porte la cohorte
       initiale (cycle 0) et les entrants de ce premier cycle. */
    const cohortes=G.mgmt.exterieur.filter(l=>l.born===0).length;
    const apresEntree=G.mgmt.exterieur.length;
    const bornsEntree=G.mgmt.exterieur.map(l=>l.born);
    mgmtNewPile(G.mgmt);
    const entrantsCycle=G.mgmt.exterieur.filter(l=>l.born===G.mgmt.cycle).length;
    return {cohortes:cohortes,apresEntree:apresEntree,bornsEntree:bornsEntree,
      entrantsCycle:entrantsCycle,cycle:G.mgmt.cycle};
  })()`);
  assert.ok(r.cohortes>=B3.min,'la cohorte initiale existe à l\'ouverture du bureau');
  assert.ok(r.bornsEntree.every(b=>b>=0&&b<=r.cycle),'chaque ligne porte un cycle d\'entrée cohérent (cohorte au 0, entrants aux cycles suivis)');
  assert.ok(r.entrantsCycle>0,'les entrants du cycle portent le cycle courant comme entrée dans le monde');
});
