"use strict";
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {newGameWindow}=require('./helpers/loadGame');
const source=fs.readFileSync(require('node:path').join(__dirname,'..','mgmt-ceremonie.js'),'utf8');
function charger(){const c={mgmtCalAujourdhui:()=>365,mgmtHistoirePoidsCombat:()=>0};vm.createContext(c);vm.runInContext(source,c);return c;}
test('Lot 55 T1 — calcul et lecture du carnet ne tirent aucun hasard',()=>{
  assert.doesNotMatch(source,/\b(?:Math\.random|rnd)\s*\(/);
});
test('Lot 55 T1 — une trace sans identifiants de combattants est ignorée sans plantage',()=>{
  const c=charger();
  const prix=c.mgmtCeremonieCalculer({hist:[{c:100,a:{name:'A'},b:{name:'B'},winner:'A',family:'ko',round:1}]});
  assert.deepEqual(JSON.parse(JSON.stringify(prix)),[]);
});
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
test('Lot 55 T1 — la révélation utilise le palmarès au premier combat chronologique',()=>{
  const c=charger();
  const combat=(jour,w,l,family='decision')=>({c:jour,a:{id:'rookie',name:'Rookie',W:w,L:l,D:0},b:{id:`opp${jour}`,name:`Opp${jour}`},winner:'A',family});
  const m={hist:[combat(200,0,2,'ko'),combat(100,0,6,'ko'),combat(300,1,2)]};
  assert.ok(!c.mgmtCeremonieCalculer(m).some(p=>p.id==='revelation'));
});
test('Lot 55 T1 — les prix lauréats se consignent sans doublon',()=>{
  const c=charger(),m={roster:[{id:'a'}]},prix=[{id:'ko',laureat:'a'}];c.mgmtCeremonieInscrire(m,prix,2026);c.mgmtCeremonieInscrire(m,prix,2026);assert.equal(m.roster[0].prixAnnee.length,1);
});
test('Lot 55 T1 — le combat de l’année est inscrit sur les deux fiches',()=>{
  const c=charger(),m={roster:[{id:'a'},{id:'b'}]};
  c.mgmtCeremonieInscrire(m,[{id:'combat',laureats:['a','b']}],2026);
  assert.deepEqual(JSON.parse(JSON.stringify(m.roster.map(f=>f.prixAnnee.map(p=>p.prix)))),[['combat'],['combat']]);
});
test('Lot 55 T1 — un titre relevé sur un autre combat ne décale pas le bonus de titre',()=>{
  const c=charger();
  const hist=[
    {c:10,a:{id:'x',name:'X'},b:{id:'y',name:'Y'},winner:'A',family:'ko',round:1},
    {c:20,a:{id:'u',name:'U'},b:{id:'v',name:'V'},winner:'B',family:'ko',round:2},
    {c:30,a:{id:'p',name:'P'},b:{id:'q',name:'Q'},winner:'A',family:'decision'}
  ];
  const prix=c.mgmtCeremonieCalculer({hist,facts:[{k:'title_fight',fight:1}]});
  assert.equal(prix.find(p=>p.id==='ko').laureat,'v');
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
test('Lot 55 T1 — les prix de finition privilégient titre, surprise, premier round et affiche principale',()=>{
  const c=charger();
  const m={
    hist:[
      {c:100,a:{id:'x',name:'X'},b:{id:'y',name:'Y'},winner:'A',family:'ko',round:3,slot:'prelim',publicOddsWinner:70},
      {c:200,a:{id:'z',name:'Z'},b:{id:'w',name:'W'},winner:'A',family:'ko',round:1,slot:'main',publicOddsWinner:30}
    ],
    facts:[{k:'title_fight',fight:1}]
  };
  const ko=c.mgmtCeremonieCalculer(m).find(p=>p.id==='ko');
  assert.ok(ko);
  assert.equal(ko.laureat,'z');
  assert.equal(ko.stat,1);
});
test('Lot 55 T1 — un fait de titre garde son index historique après filtrage annuel',()=>{
  const c=charger();
  const m={hist:[
    {c:1,a:{id:'old',name:'Old'},b:{id:'old-op',name:'Old op'},winner:'A',family:'ko',round:1},
    {c:100,a:{id:'regular',name:'Regular'},b:{id:'regular-op',name:'Regular op'},winner:'A',family:'ko',round:3,slot:'prelim'},
    {c:200,a:{id:'champ',name:'Champ'},b:{id:'champ-op',name:'Champ op'},winner:'A',family:'ko',round:3,slot:'prelim'}
  ],facts:[{k:'title_fight',fight:2}]};
  const ko=c.mgmtCeremonieCalculer(m).find(p=>p.id==='ko');
  assert.ok(ko);
  assert.equal(ko.laureat,'champ');
});
test('Lot 55 T1 — les égalités de prix sont stables malgré l’ordre des traces',()=>{
  const c=charger();
  const x={c:100,a:{id:'z',name:'Z',W:3,L:0,D:0},b:{id:'o1',name:'O1'},winner:'A',family:'ko',round:1,slot:'main'};
  const y={c:100,a:{id:'a',name:'A',W:3,L:0,D:0},b:{id:'o2',name:'O2'},winner:'A',family:'ko',round:1,slot:'main'};
  const lire=hist=>c.mgmtCeremonieCalculer({hist}).filter(p=>p.id==='combattant'||p.id==='ko').map(p=>[p.id,p.laureat]);
  assert.deepEqual(JSON.parse(JSON.stringify(lire([x,y]))),JSON.parse(JSON.stringify(lire([y,x]))));
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
test('Lot 55 T1 — le retour exige au moins 182 jours sans combat',()=>{
  const c=charger();
  const combat=(jour,id,adversaire)=>({c:jour,a:{id,name:id},b:{id:adversaire,name:adversaire},winner:'A',family:'decision'});
  const hist=[combat(10,'court','avant-court'),combat(192,'court','apres-court'),combat(10,'long','avant-long'),combat(193,'long','apres-long')];
  const retour=c.mgmtCeremonieCalculer({hist}).find(p=>p.id==='retour');
  assert.ok(retour);
  assert.equal(retour.laureat,'long');
});
test('Lot 55 T1 — le retour départage par poids d’histoire avant la durée d’absence',()=>{
  const c=charger();
  c.mgmtHistoirePoidsCombat=(_m,t)=>t.poids;
  const combat=(id,jour,poids)=>({c:jour,a:{id,name:id},b:{id:`opp-${id}-${jour}`,name:'Adversaire'},winner:'A',family:'decision',poids});
  const m={hist:[combat('fort',1,0),combat('long',1,0),combat('fort',200,8),combat('long',300,1)]};
  const retour=c.mgmtCeremonieCalculer(m).find(p=>p.id==='retour');
  assert.ok(retour);
  assert.equal(retour.laureat,'fort');
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
test('Lot 55 T1 — le carnet lit aussi les primes consignées dans les faits historiques',()=>{
  const c=charger(),m={hist:[{c:120,a:{id:'f',name:'A'},b:{id:'b',name:'B'},winner:'A'}],facts:[{k:'prime',a:'f',fight:0,c:120,nom:'Combat de la soirée',montant:250}]};
  const carnet=c.mgmtCarnetLire(m);
  assert.equal(carnet.primes.length,1);
  assert.deepEqual(JSON.parse(JSON.stringify(carnet.primes[0])),{nom:'Combat de la soirée',montant:250,jour:120,combattant:'f'});
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
test('Lot 55 T1 — le rendu du carnet échappe les noms provenant des fiches',()=>{
  const c=charger();
  c.G={mgmt:{roster:[{id:'x',name:'<img src=x onerror=alert(1)>',prixAnnee:[{prix:'ko',annee:2026}]}],hist:[],facts:[]}};
  c.mgmtOrgNom=()=> 'Organisation';
  c.mfEcran=contenu=>contenu;
  c.CL={go:()=>{}};
  const rendu=c.scr_mgmt_carnet();
  assert.ok(rendu.includes('&lt;img src=x onerror=alert(1)&gt;'));
  assert.ok(!rendu.includes('<img src=x'));
});
test('Lot 55 T1 — les règles ce3 n’abaissent pas la typographie sous 22 px',()=>{
  const html=fs.readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8');
  const regles=[...html.matchAll(/\.ce3-[^{]+\{([^}]+)\}/g)].map(x=>x[1]);
  assert.ok(regles.length>0,'aucune règle ce3 trouvée');
  for(const regle of regles){
    for(const [,valeur] of regle.matchAll(/font-size\s*:\s*([\d.]+)px/gi)){
      assert.ok(Number(valeur)>=22,`taille trop petite : ${valeur}px`);
    }
  }
});
test('Lot 55 T1 — toute classe réellement rendue par les écrans ce3 possède une règle',()=>{
  const c=charger();
  c.G={mgmt:{roster:[],hist:[],facts:[],defis:[]}};
  c.mgmtOrgNom=()=> 'Organisation';
  c.mgmtOrgClassement=()=>[];
  c.mfEcran=contenu=>contenu;
  c.CL={go:()=>{}};
  const html=c.scr_mgmt_ceremonie()+c.scr_mgmt_carnet();
  const classes=new Set([...html.matchAll(/class="([^"]+)"/g)].flatMap(x=>x[1].split(/\s+/)));
  const css=fs.readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8');
  for(const classe of classes){
    const selecteur=new RegExp(`\\.${classe}(?![\\w-])`);
    assert.ok([...css.matchAll(/([^{}]+)\{/g)].some(x=>selecteur.test(x[1])),`aucune règle pour .${classe}`);
  }
});
test('Lot 55 T1 — la cérémonie échappe les noms du classement et conserve les six prix',()=>{
  const c=charger();
  c.G={mgmt:{roster:[],hist:[],facts:[]}};
  c.mgmtOrgNom=()=> 'Organisation';
  c.mgmtOrgClassement=()=>[{id:'x',nom:'<svg onload=alert(1)>'}];
  c.mfEcran=contenu=>contenu;
  c.CL={go:()=>{}};
  const rendu=c.scr_mgmt_ceremonie();
  assert.ok(rendu.includes('&lt;svg onload=alert(1)&gt;'));
  assert.ok(!rendu.includes('<svg onload'));
  for(const prix of ['COMBATTANT DE L’ANNÉE','KO DE L’ANNÉE','SOUMISSION DE L’ANNÉE','COMBAT DE L’ANNÉE','RÉVÉLATION DE L’ANNÉE','RETOUR DE L’ANNÉE']){
    assert.ok(rendu.includes(prix),`prix absent : ${prix}`);
  }
});
test('Lot 55 T1 — la cérémonie annonce honnêtement les prix sans candidat',()=>{
  const c=charger();
  c.G={mgmt:{roster:[],hist:[],facts:[]}};
  c.mgmtOrgNom=()=> 'Organisation';
  c.mgmtOrgClassement=()=>[];
  c.mfEcran=contenu=>contenu;
  c.CL={go:()=>{}};
  const rendu=c.scr_mgmt_ceremonie();
  assert.equal((rendu.match(/Pas de /g)||[]).length,6);
  assert.match(rendu,/Aucun candidat ne répond aux critères cette année\./);
});
test('Lot 55 T1 — les écrans utilisent mfEcran avec les options de navigation',()=>{
  const c=charger();
  c.G={mgmt:{roster:[],hist:[],facts:[]}};
  c.mgmtOrgNom=()=> 'Organisation';
  c.mgmtOrgClassement=()=>[];
  let options;
  c.mfEcran=(_contenu,valeurs)=>{options=valeurs;return 'écran';};
  c.scr_mgmt_ceremonie();
  assert.equal(options.barre,'jeu');
  assert.equal(options.courant,'accueil');
  assert.equal(options.m,c.G.mgmt);
  c.scr_mgmt_carnet();
  assert.equal(options.barre,'jeu');
  assert.equal(options.courant,'accueil');
  assert.equal(options.m,c.G.mgmt);
});
test('Lot 55 T1 — les prix attribués portent une phrase de presse marquée non relue',()=>{
  const c=charger();
  const hist=[
    {c:10,a:{id:'a',name:'A',W:0,L:0,D:0},b:{id:'b',name:'B'},winner:'A',family:'ko',round:1,slot:'main',knockdownsA:2,knockdownsB:1},
    {c:20,a:{id:'a',name:'A',W:1,L:0,D:0},b:{id:'c',name:'C'},winner:'A',family:'sub',round:2,slot:'main'},
    {c:30,a:{id:'a',name:'A',W:2,L:0,D:0},b:{id:'d',name:'D'},winner:'A',family:'ko',round:1,slot:'main'}
  ];
  const prix=c.mgmtCeremonieCalculer({hist});
  assert.ok(prix.length>0);
  for(const p of prix){
    assert.equal(p.relu,false,p.id);
    assert.equal(typeof p.phrase,'string');
    assert.ok(p.phrase.includes(p.nom),`phrase du prix ${p.id} sans lauréat`);
    assert.ok(/\d/.test(p.phrase),`phrase du prix ${p.id} sans chiffre de relevé`);
  }
});
test('Lot 55 T1 — à score égal la finition la plus tôt dans l’année est retenue',()=>{
  const c=charger();
  const m={hist:[
    {c:20,a:{id:'premier',name:'Premier'},b:{id:'p',name:'P'},winner:'A',family:'ko',round:1,slot:'main'},
    {c:200,a:{id:'second',name:'Second'},b:{id:'s',name:'S'},winner:'A',family:'ko',round:1,slot:'main'}
  ]};
  const ko=c.mgmtCeremonieCalculer(m).find(p=>p.id==='ko');
  assert.equal(ko.laureat,'premier');
});
test('Lot 55 T1 — une trace sans vainqueur ne produit aucun prix de finition ou de retour',()=>{
  const c=charger();
  const prix=c.mgmtCeremonieCalculer({hist:[
    {c:20,a:{id:'a',name:'A'},b:{id:'b',name:'B'},winner:null,family:'ko',round:1,slot:'main'},
    {c:200,a:{id:'c',name:'C'},b:{id:'d',name:'D'},winner:'A',family:'decision',round:3,slot:'main'}
  ]});
  assert.ok(!prix.some(p=>p.id==='ko'||p.id==='soumission'||p.id==='retour'));
});
test('Lot 55 T1 — le carnet tolère les collections historiques facultatives absentes',()=>{
  const c=charger();
  const carnet=c.mgmtCarnetLire({});
  assert.equal(JSON.stringify(carnet),JSON.stringify({champions:[],espoirs:[],prix:[],records:[],defis:[],primes:[],soirees:[]}));
});

test('Lot 55 T1 — un relevé sans issue ne peut attribuer aucun prix',()=>{
  const c=charger();
  const hist=[
    {c:10,a:{id:'a',name:'A'},b:{id:'b',name:'B'},family:'ko',round:1,slot:'main',knockdownsA:4},
    {c:20,a:{id:'a',name:'A'},b:{id:'c',name:'C'},family:'sub',round:1,slot:'main',knockdownsB:3},
    {c:30,a:{id:'a',name:'A'},b:{id:'d',name:'D'},family:'decision',slot:'main'}
  ];
  assert.deepEqual(JSON.parse(JSON.stringify(c.mgmtCeremonieCalculer({hist}))),[]);
});
