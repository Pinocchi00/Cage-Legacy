"use strict";
/* Brief du 06/10/2026, lot 2 : un niveau propre à chaque combattant. Le niveau est une valeur stockée sur la
   ligne (niv, pot, pic), tirée sur le flux d'identité ; le palmarès en est une conséquence ; une défaite ne le
   change presque pas ; la trace d'un combat garde le niveau d'avant ; une partie d'avant le lot se migre sans
   perte et rejoue ses anciens combats à l'identique. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
function result(win,code){ return JSON.parse(win.eval(`JSON.stringify((function(){${code}})())`)); }
const NEUVE=`setSeed(9); const m=mgmtDefault(); mgmtNewRoster(m); mgmtExteriorEnsure(m); mgmtNewPile(m); G={theme:'dark',mgmt:m,screen:'mgmt_bureau'}; m.facts=[]; m.hist=[]; m.cycle=10;`;

test('Niveau — le tirage : niveau 40-80, potentiel 50-80, pic 26-30, déduit de l’identifiant seul', () => {
  const win=newGameWindow();
  const r=result(win,`
    const seed=SEED; const a=[],b=[];
    for(let i=0;i<500;i++){ const id='mg'+(100+i), age=19+(i%20); a.push(mgmtNiveauTire(id,age)); }
    for(let i=0;i<500;i++){ const id='mg'+(100+i), age=19+(i%20); b.push(mgmtNiveauTire(id,age)); }
    return {meme:JSON.stringify(a)===JSON.stringify(b),rng:seed===SEED,
      niv:[Math.min(...a.map(x=>x.niv)),Math.max(...a.map(x=>x.niv))],pot:[Math.min(...a.map(x=>x.pot)),Math.max(...a.map(x=>x.pot))],
      pic:[Math.min(...a.map(x=>x.pic)),Math.max(...a.map(x=>x.pic))],jamaisSous:a.every(x=>x.pot>=x.niv-0.01),
      pics:new Set(a.map(x=>x.pic)).size};`);
  assert.ok(r.meme&&r.rng,'même identifiant, même tirage ; la RNG de la partie ne bouge pas');
  assert.ok(r.niv[0]>=40&&r.niv[1]<=80); assert.ok(r.pot[0]>=50&&r.pot[1]<=80); assert.ok(r.pic[0]>=26&&r.pic[1]<=30);
  assert.ok(r.jamaisSous,'le potentiel n’est jamais sous le niveau'); assert.equal(r.pics,5,'les cinq âges de pic existent');
});

test('Niveau — une partie neuve : chaque ligne porte niv, pot, pic ; le profil de combat lit le niveau de la ligne, pas son bilan', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const toutes=m.roster.every(f=>Number.isFinite(f.niv)&&Number.isFinite(f.pot)&&Number.isFinite(f.pic));
    const f=m.roster[0]; f.niv=42; const bas=mgmtCombatProfile(f).overall; f.niv=78; const haut=mgmtCombatProfile(f).overall;
    const g=m.roster[1]; const w=g.W, l=g.L; g.niv=60; const o1=mgmtCombatProfile(g).overall; g.W=w+9; g.L=Math.max(0,l-1); const o2=mgmtCombatProfile(g).overall;
    return {toutes,n:m.roster.length,v:m.v,niveaux:m.niveaux,bas,haut,memeNiveauMemeProfil:o1===o2};`);
  assert.ok(r.toutes); assert.equal(r.v,14); assert.equal(r.niveaux,1);
  assert.ok(r.haut>r.bas+3,'un niveau de 78 vaut plus qu’un niveau de 42'); assert.ok(r.memeNiveauMemeProfil,'neuf victoires de plus ne changent pas le niveau : il est stocké');
});

test('Niveau — une défaite ne change presque rien ; avant le pic on monte ; après le pic on ne gagne plus en combattant', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const f=m.roster[0]; const rang=(age,niv,pot,pic)=>{ Object.assign(f,{age,niv,pot,pic}); return f; };
    const d1=(()=>{ rang(22,55,75,28); return mgmtNiveauApresCombat(m,f,'loss'); })();
    const g1=(()=>{ rang(22,55,75,28); return mgmtNiveauApresCombat(m,f,'win'); })();
    const g2=(()=>{ rang(22,74.5,75,28); return mgmtNiveauApresCombat(m,f,'win'); })();
    const apres=(()=>{ rang(33,70,75,28); return mgmtNiveauApresCombat(m,f,'win'); })();
    const apresPerd=(()=>{ rang(33,70,75,28); return mgmtNiveauApresCombat(m,f,'loss'); })();
    const plancher=(()=>{ rang(33,40,45,28); mgmtNiveauApresCombat(m,f,'loss'); return f.niv; })();
    const ancien=(()=>{ const x=Object.assign({},m,{niveaux:0}); rang(22,55,75,28); return mgmtNiveauApresCombat(x,f,'win'); })();
    return {d1,g1,g2,apres,apresPerd,plancher,ancien};`);
  assert.ok(r.d1>=-1&&r.d1<=3.5,'une défaite avant le pic reste dans quelques points, jamais un effondrement'); assert.ok(r.g1>0&&r.g1<=3.5);
  assert.ok(r.g2<0.2,'proche du potentiel, on ne gagne presque plus'); assert.equal(r.apres,0,'après le pic, un combat ne donne rien');
  assert.equal(r.apresPerd,-1,'une défaite coûte un point'); assert.equal(r.plancher,40,'le plancher tient'); assert.equal(r.ancien,0,'une partie sans niveaux ne bouge pas');
});

test('Niveau — une carrière : le niveau monte jusqu’au pic puis baisse, dans 9 carrières sur 10', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    let montePuisBaisse=0, n=0;
    for(let i=0;i<200;i++){
      const f={id:'mg'+(3000+i),ck:'FR',generation:MGMT_IDENTITE_GENERATION,W:0,L:0,D:0,div:'H-light',age:19,org:'Split',level:1,raison:null,interactions:0};
      Object.assign(f,mgmtNiveauTire(f.id,19)); m.roster=[f];
      const serie=[f.niv];
      for(let an=0;an<19;an++){ for(let k=0;k<2;k++) mgmtNiveauApresCombat(m,f,(i+k+an)%3===0?'loss':'win'); f.age++; mgmtNiveauAnniversaire(m,f); serie.push(f.niv); }
      const pic=serie.indexOf(Math.max(...serie)); n++;
      if(pic>0&&pic<serie.length-1&&serie[serie.length-1]<serie[pic]&&serie[pic]>serie[0]) montePuisBaisse++;
    }
    return {montePuisBaisse,n};`);
  assert.ok(r.montePuisBaisse/r.n>=0.9,`monte puis baisse : ${r.montePuisBaisse} carrières sur ${r.n}`);
});

test('Niveau — le palmarès est une conséquence : sur 200 mondes, des gonflés sous la médiane, des 50 % en haut du classement', () => {
  const win=newGameWindow();
  const r=result(win,`
    let gonfles=0, moyens=0, memeBilanEcart=0, total=0;
    for(let s=1;s<=200;s++){
      setSeed(s*17); const m=mgmtDefault(); mgmtNewRoster(m); total+=m.roster.length;
      for(const d of allDivisions()){
        const l=m.roster.filter(f=>f.div===d.id); if(l.length<8) continue;
        const niv=l.map(f=>f.niv).sort((a,b)=>a-b); const med=niv[Math.floor(niv.length/2)];
        const haute=niv[Math.floor(niv.length/2)];
        for(const f of l){ const t=f.W+f.L; if(t<8) continue; const p=f.W/t;
          if(p>0.75&&f.niv<med) gonfles++;
          if(p>=0.42&&p<=0.58&&f.niv>=haute) moyens++; }
      }
      const par={}; for(const f of m.roster){ const k=f.W+'-'+f.L; (par[k]=par[k]||[]).push(f.niv); }
      for(const v of Object.values(par)) if(v.length>1&&Math.max(...v)-Math.min(...v)>=10) memeBilanEcart++;
    }
    return {gonfles,moyens,memeBilanEcart,total};`);
  assert.ok(r.gonfles>20,`des combattants à plus de 75 % de victoires sous le niveau médian de leur catégorie : ${r.gonfles}`);
  assert.ok(r.moyens>20,`des combattants autour de 50 % dans la première moitié de leur classement : ${r.moyens}`);
  assert.ok(r.memeBilanEcart>50,`deux combattants au même palmarès, un niveau très différent : ${r.memeBilanEcart}`);
});

test('Niveau — la trace garde le niveau d’avant ; le rejeu retrouve le même combat ; une trace d’avant le lot se rejoue à l’identique', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const lib=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o)&&o.div===m.roster[0].div);
    const [a,b,c,d]=lib; const nivA=a.niv, nivB=b.niv;
    m.card.main=[{a:a.id,b:b.id,cycle:m.cycle,slot:'main'}]; m.card.prelims=[{a:c.id,b:d.id,cycle:m.cycle,slot:'prelim'}]; m.card.sizeMain=1; m.card.sizePrelims=1;
    const ev=mgmtRunEvent(m);
    const t=m.hist.find(x=>x.slot==='main');
    const rej=mgmtReplayFight(t);
    const ancien=JSON.parse(JSON.stringify(t)); delete ancien.a.niv; delete ancien.b.niv;
    const rejAncien=mgmtReplayFight(ancien);
    return {ok:!!t,traceA:t&&t.a.niv,traceB:t&&t.b.niv,nivA,nivB,apres:[a.niv,b.niv],rejeu:rej&&rej.winner,rejAncien:rejAncien&&typeof rejAncien.winner,valide:validateMgmt(JSON.parse(JSON.stringify(m))),
      valideAncien:mgmtValidFightTrace(ancien),vraiGagnant:t&&t.winner};`);
  assert.ok(r.ok); assert.equal(r.traceA,r.nivA,'la trace porte le niveau d’avant combat'); assert.equal(r.traceB,r.nivB);
  assert.ok(r.valide&&r.valideAncien,'la trace avec niveau et celle d’avant le lot sont valides'); assert.equal(r.rejAncien,'string','une trace d’avant le lot se rejoue (ancienne loi)');
});

test('Niveau — migration 13 → 14 : une partie d’avant se charge, chaque ligne reçoit le niveau que lui donnait son palmarès', () => {
  const win=newGameWindow();
  const r=result(win,`
    setSeed(31); const m=mgmtDefaultAvantH4(); mgmtNewRoster(m); mgmtExteriorEnsure(m); mgmtNewPile(m);
    const brut=JSON.parse(JSON.stringify(m)); brut.v=13; delete brut.niveaux;
    for(const o of brut.roster){ delete o.niv; delete o.pot; delete o.pic; }
    const mig=mgmtMigrate(brut);
    const bonnes=mig.roster.every(o=>o.niv===mgmtLevelForRecord(o.W,o.L)&&o.pot>=o.niv&&o.pic>=26&&o.pic<=30);
    return {v:mig.v,niveaux:mig.niveaux,bonnes,valide:validateMgmt(mig),n:mig.roster.length,pic:mig.roster.every(o=>o.pic===mgmtNivPic(o.id)),ancienneRef:m.roster.length===mig.roster.length};`);
  assert.equal(r.v,14); assert.equal(r.niveaux,1); assert.ok(r.bonnes,'le niveau de départ est celui du palmarès'); assert.ok(r.valide); assert.ok(r.pic);
});

test('Niveau — la validation : un niveau hors bornes est refusé ; une partie sans niveau d’avant le lot reste lisible', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const bon=validateMgmt(JSON.parse(JSON.stringify(m)));
    const mauvais=(k,v)=>{ const c=JSON.parse(JSON.stringify(m)); c.roster[0][k]=v; return validateMgmt(c); };
    const sans=JSON.parse(JSON.stringify(m)); for(const o of sans.roster){ delete o.niv; delete o.pot; delete o.pic; }
    const reparee=mgmtRepair(JSON.parse(JSON.stringify(sans)));
    return {bon,bas:mauvais('niv',12),haut:mauvais('pot',99),pic:mauvais('pic',50),nan:mauvais('niv',NaN),sansNiveau:validateMgmt(sans),repare:reparee.roster.every(o=>Number.isFinite(o.niv)),flag:mauvais.length};`);
  assert.ok(r.bon); assert.equal(r.bas,false); assert.equal(r.haut,false); assert.equal(r.pic,false); assert.equal(r.nan,false);
  assert.ok(r.sansNiveau,'une ligne sans niveau est valide (toléré)'); assert.ok(r.repare,'et la réparation lui en donne un');
});

test('Niveau — un recruté arrive avec le niveau de sa carrière dérivée ; une partie d’avant n’en reçoit pas', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const div=m.roster[0].div; const cand=mgmtRecrutables(m,div)[0];
    const trace=mgmtExteriorTrace(m.exterieur.find(e=>e.id===cand.id),m.cycle);
    const ligne=mgmtRecruter(m,cand.id);
    const ancien=(()=>{ const x=mgmtDefaultAvantH4(); mgmtNewRoster(x); mgmtExteriorEnsure(x); x.cycle=3; const c2=mgmtRecrutables(x,x.roster[0].div)[0]; const l2=mgmtRecruter(x,c2.id); return l2&&l2.niv; })();
    return {niv:ligne.niv,trace:trace.niveau,pot:ligne.pot,pic:ligne.pic,pic2:mgmtNivPic(cand.id),ancien:ancien===undefined,valide:validateMgmt(JSON.parse(JSON.stringify(m)))};`);
  assert.equal(r.niv,r.trace); assert.ok(r.pot>=r.niv&&r.pic===r.pic2); assert.ok(r.ancien); assert.ok(r.valide);
});

test('Niveau — la rouille : une baisse passagère après une très longue attente, effacée au combat suivant ; aucune sans niveau', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const f=m.roster[0]; f.lastCycle=1; m.cycle=40;
    const longue=mgmtRouille(m,f,40), courte=mgmtRouille(m,f,5), apres=(()=>{ f.lastCycle=40; return mgmtRouille(m,f,40); })();
    const sansNiveau=(()=>{ const g={id:'mg9',lastCycle:1,W:3,L:1,D:0,age:25}; return mgmtRouille(m,g,40); })();
    const preparee=(()=>{ f.lastCycle=1; const p1=mgmtFightReady(f,40).dynamic; f.lastCycle=40; const p2=mgmtFightReady(f,40).dynamic; return p1<p2; })();
    return {longue,courte,apres,sansNiveau,preparee};`);
  assert.ok(r.longue>0&&r.longue<=5); assert.equal(r.courte,0); assert.equal(r.apres,0,'effacée dès qu’il combat'); assert.equal(r.sansNiveau,0); assert.ok(r.preparee,'le combattant rouillé est moins bien préparé');
});
