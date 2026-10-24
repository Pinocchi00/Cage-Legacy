"use strict";
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {newGameWindow}=require('./helpers/loadGame');
const source=fs.readFileSync(require('node:path').join(__dirname,'..','mgmt-ceremonie.js'),'utf8');
function charger(){const c={mgmtCalAujourdhui:()=>365,mgmtHistoirePoidsCombat:()=>0};vm.createContext(c);vm.runInContext(source,c);return c;}
test('Lot 55 T1 — le calcul des prix est pur et déterministe',()=>{
  const m={hist:[{c:1,a:{id:'a',name:'A'},b:{id:'b',name:'B'},winner:'A',family:'ko',round:1,slot:'main'},{c:2,a:{id:'a',name:'A'},b:{id:'c',name:'C'},winner:'A',family:'sub',round:2},{c:3,a:{id:'a',name:'A'},b:{id:'d',name:'D'},winner:'A',family:'ko',round:1}],roster:[{id:'a'}]};
  const c=charger(), before=JSON.stringify(m);assert.deepEqual(c.mgmtCeremonieCalculer(m),c.mgmtCeremonieCalculer(m));assert.equal(JSON.stringify(m),before);
});
test('Lot 55 T1 — aucun prix sans candidat minimum',()=>{
  const c=charger();assert.equal(JSON.stringify(c.mgmtCeremonieCalculer({hist:[]})),'[]');
});
test('Lot 55 T1 — les prix combattant et révélation respectent leurs minima',()=>{
  const c=charger();
  const combat=(id,opp,jour)=>({c:jour,a:{id,name:id,W:0,L:0,D:0},b:{id:opp,name:opp},winner:'A',family:'ko',round:1});
  const unSeul=c.mgmtCeremonieCalculer({hist:[combat('a','b',10)]});
  assert.ok(!unSeul.some(p=>p.id==='combattant'||p.id==='revelation'));
  const trois=c.mgmtCeremonieCalculer({hist:[combat('a','b',10),combat('a','c',20),combat('a','d',30)]});
  assert.ok(trois.some(p=>p.id==='combattant'&&p.laureat==='a'));
  assert.ok(trois.some(p=>p.id==='revelation'&&p.laureat==='a'));
});
test('Lot 55 T1 — les prix lauréats se consignent sans doublon',()=>{
  const c=charger(),m={roster:[{id:'a'}]},prix=[{id:'ko',laureat:'a'}];c.mgmtCeremonieInscrire(m,prix,2026);c.mgmtCeremonieInscrire(m,prix,2026);assert.equal(m.roster[0].prixAnnee.length,1);
});
test('Lot 55 T1 — rendu échappé et toutes les classes ce3 ont une règle',()=>{
  const c=charger();
  const js=source;
  assert.match(js,/mgmtCeremonieEchapper\(x\.nom\)/);
  const html=fs.readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8');
  const classes=[...new Set([...js.matchAll(/class="(ce3-[^"]+)"/g)].flatMap(m=>m[1].split(/\s+/)))];
  for(const name of classes)assert.match(html,new RegExp('\\.'+name+'(?:[^,{]*)\\{'),`règle CSS manquante: ${name}`);
  assert.equal(c.mgmtCeremonieEchapper('<script>'), '&lt;script&gt;');
});
test('Lot 55 T1 — champ prix facultatif et réparé sans création sur ancien état',()=>{
  const save=fs.readFileSync(require('node:path').join(__dirname,'..','mgmt-save.js'),'utf8');
  assert.match(save,/prixAnnee/);
  assert.match(save,/delete f\.prixAnnee/);
});
test('Lot 55 T1 — les relevés sont filtrés sur la fenêtre annuelle et les prix changent avec les combats',()=>{
  const c=charger();
  const combat=(jour,adversaire,family='ko')=>({c:jour,a:{id:'a',name:'A',W:3,L:0,D:0},b:{id:adversaire,name:adversaire},winner:'A',family,round:1,slot:'main'});
  const m={hist:[combat(1,'ancien'),combat(40,'b'),combat(100,'c'),combat(200,'d'),combat(366,'hors-fenetre')],roster:[]};
  const result=c.mgmtCeremonieCalculer(m);
  assert.ok(result.some(p=>p.id==='combattant'&&p.laureat==='a'));
  assert.ok(result.every(p=>p.relu===false));
  const avant=JSON.stringify(result);m.hist.push(combat(250,'e','sub'));
  assert.notEqual(JSON.stringify(c.mgmtCeremonieCalculer(m)),avant);
});
test('Lot 55 T1 — un prix de combat nul et une finition absente ne sont pas décernés',()=>{
  const c=charger(),m={hist:[
    {c:1,a:{id:'a',name:'A'},b:{id:'b',name:'B'},winner:'A',family:'decision'},
    {c:2,a:{id:'c',name:'C'},b:{id:'d',name:'D'},winner:'B',family:'decision'}
  ]};
  const ids=c.mgmtCeremonieCalculer(m).map(p=>p.id);
  assert.ok(!ids.includes('ko'));
  assert.ok(!ids.includes('soumission'));
  assert.ok(!ids.includes('combat'));
});
test('Lot 55 T1 — le retour tient compte du dernier combat avant la fenêtre annuelle',()=>{
  const c=charger(),m={hist:[
    {c:10,a:{id:'a'},b:{id:'b'},winner:'A',family:'decision'},
    {c:200,a:{id:'a',name:'A'},b:{id:'c',name:'C'},winner:'A',family:'decision'}
  ]};
  const retour=c.mgmtCeremonieCalculer(m).find(p=>p.id==='retour');
  assert.ok(retour);
  assert.equal(retour.laureat,'a');
});
test('Lot 55 T1 — le carnet lit les traces disponibles sans recalculer les saisons absentes',()=>{
  const c=charger();
  const m={roster:[{id:'x',name:'X',prixAnnee:[{prix:'ko',annee:2025}]}],hist:[{c:12,a:{id:'x',name:'X'},b:{id:'y',name:'Y'},winner:'A',primes:[{titre:'Prime observée'}]}],facts:[{k:'title_fight',fight:0,div:'fly'}],defis:[{id:'d',etat:'fait'}]};
  const carnet=c.mgmtCarnetLire(m);
  assert.equal(carnet.prix.length,1);
  assert.equal(carnet.champions.length,1);
  assert.equal(carnet.champions[0].nom,'X');
  assert.equal(carnet.primes[0].titre,'Prime observée');
  assert.equal(carnet.defis.length,1);
  assert.equal(carnet.soirees.length,1);
  assert.equal(JSON.stringify(c.mgmtCarnetLire({})),JSON.stringify({champions:[],espoirs:[],prix:[],records:[],defis:[],primes:[],soirees:[]}));
});
test('Lot 55 T1 — les records observés sont rendus dans le carnet sans mutation',()=>{
  const c=charger();
  c.mgmtRecords=m=>({unCombat:[{type:'Plus long combat',valeur:'25:00'}]});
  const m={hist:[{c:20}],roster:[]},avant=JSON.stringify(m);
  const carnet=c.mgmtCarnetLire(m);
  assert.deepEqual(JSON.parse(JSON.stringify(carnet.records)),[{type:'Plus long combat',valeur:'25:00'}]);
  assert.equal(JSON.stringify(m),avant);
});
test('Lot 55 T1 — le carnet conserve une forme vide complète sans partie',()=>{
  const c=charger();
  assert.deepEqual(JSON.parse(JSON.stringify(c.mgmtCarnetLire(null))),{
    champions:[],espoirs:[],prix:[],records:[],defis:[],primes:[],soirees:[]
  });
});
test('Lot 55 T1 — chaque prix possède trois formulations distinctes et spécifiques',()=>{
  const blocs=[...source.matchAll(/\{id:'(combattant|ko|soumission|combat|revelation|retour)'[^\n]*phrases:\[([^\]]+)\]/g)];
  assert.equal(blocs.length,6);
  const toutes=[];
  for(const [,id,contenu] of blocs){
    const phrases=[...contenu.matchAll(/'([^']+)'/g)].map(x=>x[1]);
    assert.equal(phrases.length,3,id);
    assert.equal(new Set(phrases).size,3,id);
    const mot=id==='ko'?'KO':id==='soumission'?'soumission':id==='combattant'?'combattant':id==='combat'?'combat':id==='revelation'?'révélation':'retour';
    assert.ok(phrases.every(p=>p.toLocaleLowerCase('fr').includes(mot.toLocaleLowerCase('fr'))),id);
    toutes.push(...phrases);
  }
  assert.equal(new Set(toutes).size,toutes.length,'formulations partagées entre familles');
});
test('Lot 55 T1 — seules les traces des 365 jours précédant la cérémonie comptent',()=>{
  const c=charger();
  const combat=(jour,nom)=>({c:jour,a:{id:'a',name:'A',W:0,L:0,D:0},b:{id:nom,name:nom},winner:'A',family:'ko',round:1,slot:'main'});
  const m={hist:[combat(-1,'avant'),combat(0,'debut'),combat(100,'milieu'),combat(364,'fin'),combat(365,'aujourdhui')]};
  const result=c.mgmtCeremonieCalculer(m);
  const combattant=result.find(p=>p.id==='combattant');
  assert.ok(combattant);
  assert.equal(combattant.stat,3);
  assert.equal(result.find(p=>p.id==='ko').stat,1);
});
test('Lot 55 T1 — les formulations de cérémonie ne se répètent pas sur cinquante années',()=>{
  const c=charger(),phrases=new Set();
  for(let annee=1;annee<=50;annee++){
    const now=annee*365;
    c.mgmtCalAujourdhui=()=>now;
    const m={hist:[
      {c:now-300,a:{id:'a',name:'A',W:4,L:0,D:0},b:{id:'b',name:'B'},winner:'A',family:'ko',round:1,slot:'main'},
      {c:now-200,a:{id:'a',name:'A',W:4,L:0,D:0},b:{id:'c',name:'C'},winner:'A',family:'sub',round:2},
      {c:now-100,a:{id:'a',name:'A',W:4,L:0,D:0},b:{id:'d',name:'D'},winner:'A',family:'ko',round:1}
    ]};
    for(const prix of c.mgmtCeremonieCalculer(m)){
      assert.equal(phrases.has(prix.phrase),false,`phrase répétée à l'année ${annee}: ${prix.id}`);
      phrases.add(prix.phrase);
    }
  }
  assert.equal(phrases.size,200);
});
test('Lot 55 T1 — une partie générée valide le champ facultatif des prix à la sauvegarde',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const r=JSON.parse(w.eval(`JSON.stringify((()=>{
      setSeed(5501);
      const m=mgmtPasseGenerer('split',{soirees:3});
      const absent=JSON.parse(mgmtSerialiser(m));
      const sansChamp=mgmtParseAndValidate(JSON.stringify(absent));
      const f=m.roster.find(x=>x&&x.id);
      f.prixAnnee=[{prix:'ko',annee:2026,relu:false},{prix:'inconnu',annee:'x'}];
      mgmtRepair(m);
      const charge=validateMgmt(m)?m:null;
      const laureat=charge&&charge.roster.find(x=>x.id===f.id);
      return {sansChamp:!!sansChamp&&sansChamp.roster.every(x=>!Object.hasOwn(x,'prixAnnee')),
        garde:!!laureat&&Array.isArray(laureat.prixAnnee)&&laureat.prixAnnee.length===1,
        prix:laureat&&laureat.prixAnnee[0].prix,annee:laureat&&laureat.prixAnnee[0].annee};
    })())`));
    assert.equal(r.sansChamp,true);
    assert.equal(r.garde,true);
    assert.equal(r.prix,'ko');
    assert.equal(r.annee,2026);
  }finally{w.close();}
});
test('Lot 55 T1 — trois soirées du passé produisent une lecture de prix déterministe',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const result=JSON.parse(w.eval(`JSON.stringify((()=>{
      setSeed(55103);
      const m=mgmtPasseGenerer('split',{soirees:3,reculAns:3});
      const jouees=[];
      for(let k=0;k<3;k++)jouees.push(mgmtPasseSoiree(m,k).jouee);
      const a=mgmtCeremonieCalculer(m),b=mgmtCeremonieCalculer(m);
      return {jouees,hist:Array.isArray(m.hist)?m.hist.length:0,identique:JSON.stringify(a)===JSON.stringify(b),valide:a.every(x=>x.relu===false)};
    })())`));
    assert.equal(result.jouees.filter(Boolean).length,3);
    assert.ok(result.hist>0);
    assert.equal(result.identique,true);
    assert.equal(result.valide,true);
  }finally{w.close();}
});
test('Lot 55 T1 — trois années de soirées jouées donnent des prix déterministes par fenêtre',()=>{
  const w=newGameWindow({runMain:true});
  try{
    const result=JSON.parse(w.eval(`JSON.stringify((()=>{
      setSeed(551055);
      const m=mgmtPasseGenerer('split',{soirees:9,reculAns:3});
      const jouees=[];
      for(let k=0;k<9;k++)jouees.push(mgmtPasseSoiree(m,k).jouee);
      const dates=m.hist.filter(t=>t&&Number.isFinite(t.c)).map(t=>t.c);
      const debut=Math.min(...dates),fin=Math.max(...dates);
      const lectures=[];
      for(let annee=0;annee<3;annee++){
        const jour=debut+(annee+1)*365;
        const fenetre=m.hist.filter(t=>t&&t.c>=jour-365&&t.c<jour);
        const copie={...m,hist:fenetre};
        const a=mgmtCeremonieCalculer(copie),b=mgmtCeremonieCalculer(copie);
        lectures.push({jour,combats:fenetre.length,identique:JSON.stringify(a)===JSON.stringify(b),prix:a.length,fin});
      }
      return {jouees,hist:m.hist.length,lectures};
    })())`));
    assert.equal(result.jouees.filter(Boolean).length,9);
    assert.ok(result.hist>=9);
    assert.equal(result.lectures.length,3);
    assert.ok(result.lectures.some(x=>x.combats>0));
    for(const lecture of result.lectures){
      assert.equal(lecture.identique,true);
    }
  }finally{w.close();}
});
