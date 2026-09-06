'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

function career(t){
  const w=newGameWindow();
  t.after(()=>w.close());
  w.eval("G={theme:'dark',draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:'Intégrité'}}; CL.create();");
  return w;
}
function storage(w){ return JSON.stringify(Object.fromEntries(Object.keys(w.localStorage).map(k=>[k,w.localStorage.getItem(k)]))); }
function failWrites(w, key, silent=false){
  const proto=Object.getPrototypeOf(w.localStorage), original=proto.setItem;
  proto.setItem=function(k,v){ if(!key||k===key){ if(silent)return; throw new w.DOMException('Quota dépassé','QuotaExceededError'); } return original.call(this,k,v); };
  return ()=>{proto.setItem=original;};
}

/* ==== [ANCRE: TEST_B02_SECOURS_PRESERVE] — les deux copies doivent survivre
   à une récupération, y compris au prochain enregistrement normal. ==== */
test('B02 — récupération conserve deux copies chargeables', t=>{
  const w=career(t); w.save();
  const backup=w.localStorage.getItem('cage-legacy-v3_backup');
  w.localStorage.setItem('cage-legacy-v3','{invalid');
  assert.equal(w.load(),true);
  assert.equal(w.localStorage.getItem('cage-legacy-v3_backup'),backup);
  assert.ok(w.parseAndValidate(w.localStorage.getItem('cage-legacy-v3')));
  w.save();
  assert.ok(w.parseAndValidate(w.localStorage.getItem('cage-legacy-v3_backup')));
});
test('B02 — échec de réparation disque conserve le secours et la carrière chargée', t=>{
  const w=career(t); w.save();
  w.localStorage.setItem('cage-legacy-v3','{invalid');
  const before=storage(w); failWrites(w,'cage-legacy-v3');
  assert.equal(w.load(),true); assert.equal(storage(w),before);
});
test('B02 — deux copies corrompues ne détruisent pas une partie en mémoire', t=>{
  const w=career(t), previous=w.G;
  w.localStorage.setItem('cage-legacy-v3','{invalid');
  w.localStorage.setItem('cage-legacy-v3_backup','null');
  const before=storage(w);
  assert.equal(w.load(),false); assert.equal(w.G,previous); assert.equal(storage(w),before);
});
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: TEST_B03_IMPORT_ATOMIQUE] — parse, migration et validation
   rejetés ne modifient ni G, ni le DOM, ni les sauvegardes. ==== */
test('B03 — import rejeté laisse état, écran, thème et stockage intacts', t=>{
  const w=career(t), previous=w.G, state=JSON.stringify(w.G), html=w.document.body.innerHTML, before=storage(w);
  let alerts=0; w.alert=()=>alerts++;
  for(const raw of ['{invalid','{"f":null}','{"version":5,"f":null}','{"version":4,"f":{"name":"X"}}','{"version":5,"f":{"name":"X","W":0.5}}']){
    w.prompt=()=>raw; w.CL.importSave();
    assert.equal(w.G,previous,raw); assert.equal(JSON.stringify(w.G),state,raw);
    assert.equal(w.document.body.innerHTML,html,raw); assert.equal(storage(w),before,raw);
  }
  assert.equal(alerts,5);
});
test('B03 — exception de validation ne publie pas le candidat', t=>{
  const w=career(t), previous=w.G, before=storage(w);
  w.prompt=()=>JSON.stringify(previous);
  w.validateState=()=>{throw new Error('validation interrompue');};
  w.CL.importSave(); assert.equal(w.G,previous); assert.equal(storage(w),before);
});
test('B03 — données imbriquées impossibles au rendu restaurent aussi le DOM',t=>{
  const w=career(t), previous=w.G, html=w.document.getElementById('app').innerHTML, before=storage(w);
  const candidate=JSON.parse(JSON.stringify(previous)); candidate.pending={};
  w.prompt=()=>JSON.stringify(candidate);
  assert.doesNotThrow(()=>w.CL.importSave());
  assert.equal(w.G,previous); assert.equal(w.document.getElementById('app').innerHTML,html); assert.equal(storage(w),before);
});
test('B03 — import valide puis rechargement conservent le combattant', t=>{
  const w=career(t), candidate=JSON.parse(JSON.stringify(w.G)); candidate.f.name='Import valide';
  w.prompt=()=>JSON.stringify(candidate); w.CL.importSave();
  assert.equal(w.G.f.name,'Import valide'); assert.equal(w.G.screen,'hub');
  assert.equal(w.load(),true); assert.equal(w.G.f.name,'Import valide');
});
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: TEST_B04_NOMBRES_VALIDES] — les bornes n'arrondissent et ne
   convertissent jamais une donnée rejetée. ==== */
test('B04 — version exacte, finitude, compteurs entiers et bornes', t=>{
  const w=career(t), base=JSON.stringify(w.G);
  const changes=[g=>delete g.version,g=>g.version=999,g=>g.version=4,g=>g.version=5.5,
    ...['W','L','D','ko','sub','dec','koLoss','titles','defenses','orgWins'].flatMap(k=>[
      g=>g.f[k]=0.5,g=>g.f[k]=-1,g=>g.f[k]=Infinity,g=>g.f[k]='2',g=>g.f[k]=Number.MAX_SAFE_INTEGER+1]),
    g=>g.f.age=101,g=>g.f.age=-1,g=>g.season.year=1.5,
    g=>g.f.attrs.power=Infinity,g=>g.f.phys.height=Infinity,g=>g.roster[0].W=0.5,
    g=>g.f.money=Infinity,g=>g.f.money='12',g=>g.f.attrs.power='50',g=>g.f.phys.height='180',g=>g.f=[]];
  assert.equal(w.validateSave(JSON.parse(base)),true);
  for(const change of changes){
    const g=JSON.parse(base); change(g); const before=JSON.stringify(g);
    assert.equal(w.validateSave(g),false,String(change)); assert.equal(JSON.stringify(g),before);
  }
  const g=JSON.parse(base); g.f.age=22.5; assert.equal(w.validateSave(g),true,'âge fractionnaire autorisé');
  const raw=base.replace('"W":0','"W":1e400'); assert.equal(w.parseAndValidate(raw),null);
});
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: TEST_B05_REGISTRES_CORROMPUS] — vue filtrée sans réécriture
   de l'original, même si un écrivain est appelé ensuite. ==== */
for(const [key,reader,writer,screen] of [
  ['hof',w=>w.loadHOF(),w=>w.saveHOF([]),'hof'],
  ['metastats',w=>w.loadMetaStats(),w=>w.saveMetaStats(w.loadMetaStats()),'codex'],
  ['achievements',w=>w.loadAch(),w=>w.saveAch([]),'ach'],
  ['codex',w=>w.loadCodex(),w=>w.saveToCodex(w.eval('SKILLS[0].id')),'codex']
]) test(`B05 — registre ${key} : objets, null et JSON cassé sans perte ni écran mort`,t=>{
  const w=career(t); let alerts=0; w.alert=()=>alerts++;
  for(const raw of ['{}','null','{invalid']){
    w.localStorage.setItem('cage-legacy-'+key,raw);
    assert.doesNotThrow(()=>reader(w));
    assert.doesNotThrow(()=>w.CL.go(screen));
    assert.doesNotThrow(()=>writer(w));
    assert.equal(w.localStorage.getItem('cage-legacy-'+key),raw);
  }
  assert.ok(alerts>0,'avertissement visible');
});
test('B05 — Panthéon mixte : légende saine affichée et original protégé',t=>{
  const w=career(t); w.enshrine(w.G.f); const good=w.loadHOF()[0];
  const raw=JSON.stringify([null,{},good,{...good,id:'bad',decorations:{}},{...good,id:'bad-recap',seasonRecap:[{}]}]);
  w.localStorage.setItem('cage-legacy-hof',raw);
  assert.equal(w.loadHOF().length,1);
  assert.doesNotThrow(()=>w.CL.go('hof'));
  w.CL.viewLegend(good.id); assert.ok(w.document.getElementById('app').textContent.includes(good.name));
  w.CL.toggleHofFav(good.id); assert.equal(w.localStorage.getItem('cage-legacy-hof'),raw);
});
test('B05 — succès, codex et statistiques filtrent les éléments invalides',t=>{
  const w=career(t), ach=w.eval('ACH[0].id'), skill=w.eval('SKILLS[0].id');
  w.localStorage.setItem('cage-legacy-achievements',JSON.stringify([ach,null,{},'inconnu']));
  w.localStorage.setItem('cage-legacy-codex',JSON.stringify([skill,null,{},'inconnu']));
  assert.equal(JSON.stringify(w.loadAch()),JSON.stringify([ach]));
  assert.equal(JSON.stringify(w.loadCodex()),JSON.stringify([skill]));
  w.localStorage.setItem('cage-legacy-metastats',JSON.stringify({totalFights:7,totalKO:'oops',unlockedItems:{},divisions:{'H-welter':{careers:1,fights:7,wins:4},'H-light':null}}));
  const before=storage(w), m=w.loadMetaStats();
  assert.equal(m.totalFights,7); assert.equal(m.totalKO,0); assert.equal(m.divisions['H-welter'].wins,4);
  assert.equal(m.divisions['H-light'],undefined); assert.ok(Array.isArray(m.unlockedItems));
  w.recordCareerStart(w.G.f); assert.equal(storage(w),before);
});
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: TEST_R01_ARCHIVAGE_CONFIRME] — quota, écriture ignorée et
   disparition de l'entrée interdisent de sceller ou purger la carrière. ==== */
for(const silent of [false,true]) test(`R01 — archivage ${silent?'ignoré':'en quota dépassé'} conserve la carrière puis permet une reprise`,t=>{
  const w=career(t), previous=w.G, state=JSON.stringify(w.G), before=storage(w);
  let alerts=0; w.alert=()=>alerts++;
  const restore=failWrites(w,'cage-legacy-hof',silent);
  assert.equal(w.saveHOF([]),false);
  w.CL.toLegacy(); assert.equal(w.G,previous); assert.equal(JSON.stringify(w.G),state); assert.equal(storage(w),before);
  assert.ok(alerts>0); restore();
  w.CL.toLegacy(); assert.equal(w.G.f._enshrined,true); assert.equal(w.loadHOF().length,1);
  w.CL.toLegacy(); assert.equal(w.loadHOF().length,1);
  w.CL.exitLegacy(); assert.equal(w.hasSave(),false); assert.equal(w.loadHOF().length,1);
});
test('R01 — une archive disparue après intronisation interdit la purge',t=>{
  const w=career(t); w.CL.toLegacy(); const previous=w.G;
  w.localStorage.setItem('cage-legacy-hof','[]'); const before=storage(w);
  w.CL.exitLegacy(); assert.equal(w.G,previous); assert.equal(storage(w),before);
  w.CL.newCareer(); assert.equal(w.G,previous); assert.equal(storage(w),before);
});
test('R01 — plafond du Panthéon : une entrée exclue ne scelle pas la carrière',t=>{
  const w=career(t); w.enshrine(w.G.f); const template=w.loadHOF()[0];
  w.saveHOF(Array.from({length:20},(_,i)=>({...template,id:'archive-'+i,score:999999,favorite:false})));
  const before=storage(w), state=JSON.stringify(w.G);
  w.CL.toLegacy(); assert.equal(JSON.stringify(w.G),state); assert.equal(storage(w),before);
});
test('R01 — appel direct et saison en cours restent intacts sous quota',t=>{
  const w=career(t);
  w.G.f.skills=['meta02'];
  w.G.season.fights=[{win:true,method:'KO',round:1,myRank:8,oppRank:4,st:{Me:{sig:12,td:0,ctrl:0,kd:1},Op:{sig:3,td:0,ctrl:0,kd:0}}}];
  w.save(); const state=JSON.stringify(w.G), before=storage(w);
  const restore=failWrites(w,'cage-legacy-hof');
  assert.equal(w.enshrine(w.G.f),false); assert.equal(JSON.stringify(w.G),state);
  w.CL.toLegacy(); assert.equal(JSON.stringify(w.G),state); assert.equal(storage(w),before);
  restore(); w.CL.toLegacy();
  assert.equal(w.G.f.seasonRecap.length,1); assert.equal(w.G.season.fights.length,0);
  assert.equal(w.loadHOF()[0].seasonRecap.length,1);
});
test('R01 — reprise après écriture HOF ne duplique ni archive ni statistiques',t=>{
  const w=career(t); const unsealed=JSON.stringify(w.G);
  assert.equal(w.enshrine(w.G.f),true);
  const retirements=w.loadMetaStats().totalRetirements;
  w.G=JSON.parse(unsealed); w.CL.toLegacy();
  assert.equal(w.G.f._enshrined,true); assert.equal(w.loadHOF().length,1);
  assert.equal(w.loadMetaStats().totalRetirements,retirements);
});
/* ==== [FIN ANCRE] ==== */
