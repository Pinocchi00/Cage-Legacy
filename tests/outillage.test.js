"use strict";
/* Brief des corrections du 08/10/2026, lot 7 : l'outillage. Le joueur automatique de la carrière n'a plus deux versions qui divergent (7.2), la mesure d'ensemble du
   management tourne et rend ses colonnes (7.1), l'export des textes à relire couvre les cinq familles sans rien modifier (7.3), le README dit les modes réels (7.4). */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const racine=path.join(__dirname,'..');
const lire=f=>fs.readFileSync(path.join(racine,f),'utf8');

/** Le corps de allOnclicks d'un fichier, sans commentaires ni espaces : la partie qui décide ce que le joueur automatique clique. */
function corpsAllOnclicks(src){
  const i=src.indexOf('function allOnclicks(win){');
  assert.ok(i>=0,'allOnclicks est défini');
  let prof=0, j=src.indexOf('{',i);
  for(let k=j;k<src.length;k++){ if(src[k]==='{') prof++; else if(src[k]==='}'){ prof--; if(!prof){ j=k; break; } } }
  return src.slice(i,j+1).replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'').replace(/\s+/g,'');
}

test('7.2 — Le joueur automatique du Monte-Carlo de la carrière et celui des tests sont le même : si les deux copies divergent, ce test échoue', () => {
  assert.equal(corpsAllOnclicks(lire('tools/monte-carlo.js')),corpsAllOnclicks(lire('tests/helpers/playthrough.js')));
  assert.ok(lire('tools/monte-carlo.js').includes('career-home'),'le filtre du bouton retour du hub (30/09) y est');
});

test('7.1 — La mesure d’ensemble du management joue des soirées et rend caisse, popularité, satisfaction, paliers, refus, titres et âges', () => {
  const sortie=execFileSync(process.execPath,[path.join(racine,'tools','mesure-management.js'),'10','--orgs','split','--json'],{encoding:'utf8',timeout:120000,stdio:['ignore','pipe','ignore']});
  const r=JSON.parse(sortie.slice(sortie.indexOf('{')));
  const x=r.split['10'];
  assert.ok(x,'une mesure à la soirée 10');
  for(const k of ['caisse','pop','satisfaction','effectif','sansContrat','paliers','refus','titresParCarte','changementsDeChampion','ageMoyen','moins25','plus36','retraites','top5Renouvele','marcheJeunes']) assert.ok(k in x,k);
  assert.deepEqual(Object.keys(x.paliers),['p1','p2','p3','p4']);
  assert.ok(x.effectif>100&&x.caisse>0&&x.ageMoyen>20);
});

test('7.3 — L’export des textes à relire couvre les cinq familles et ne modifie aucun fichier de données', () => {
  const avant=['mgmt-humanite-data.js','mgmt-voix-data.js','mgmt-medias-data.js','mgmt-camps-data.js','mgmt-combat-data.js'].map(f=>lire(f));
  const tmp=path.join(os.tmpdir(),'textes-a-relire-test.md');
  execFileSync(process.execPath,[path.join(racine,'tools','exporter-textes.js'),'--out',tmp],{stdio:'ignore',timeout:120000});
  const md=fs.readFileSync(tmp,'utf8');
  for(const fam of ['Humanité','Voix des combattants','Médias','Camps et salles','Combat']) assert.match(md,new RegExp('## '+fam));
  assert.ok((md.match(/^- \[ \] /gm)||[]).length>800,'plus de 800 textes listés');
  const apres=['mgmt-humanite-data.js','mgmt-voix-data.js','mgmt-medias-data.js','mgmt-camps-data.js','mgmt-combat-data.js'].map(f=>lire(f));
  assert.deepEqual(apres,avant,'aucun texte n’a été modifié');
});

test('7.4 — Le README décrit les deux modes, les commandes et le fichier de liste des tests', () => {
  const t=lire('README.md');
  assert.match(t,/Mode management/);
  assert.match(t,/Carrière Complète/);
  assert.match(t,/mesure-management\.js/);
  assert.match(t,/package\.json/);
  assert.ok(!/9 fichiers de test, 62 tests/.test(t));
});
