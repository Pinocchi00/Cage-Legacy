"use strict";
/* ==== [ANCRE: MGMT_MONDE_LOT2_PAYS_TESTS] — Monde lot 2 T2 : d'où viennent les combattants.
   Les combattants de chaque organisation sont tirés avec le mélange de pays de son identité
   (paysPoids), plus avec le mélange de Split en dur. Les tests vérifient :
   - que les huit mélanges résolus sont deux à deux différents, et que trois rosters seedés
     montrent le pays dominant attendu (FR, JP, BR) ;
   - que mgmtPaysTire tire avec le mélange donné et jamais un pays qui n'y figure pas ;
   - que mgmtOrgPaysPoids donne le mélange de l'organisation jouée ;
   - que chaque mélange est cohérent avec la ville de l'organisation. ==== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');
function result(win, code) { return JSON.parse(win.eval(`JSON.stringify((function(){${code}})())`)); }

test('Pays — le mélange de pays de deux organisations n’est pas le même', () => {
  const win = newGameWindow();
  const r = result(win, `
    /* Les huit mélanges résolus (null de split résolu par mgmtOrgIdentite) : deux à deux différents. */
    const ids=Object.keys(MGMT_ORG_IDENTITES);
    const melanges=ids.map(id=>mgmtOrgIdentite(id).paysPoids);
    let pareil=null;
    for(let i=0;i<melanges.length;i++)for(let j=i+1;j<melanges.length;j++)
      if(melanges[i]===melanges[j]) pareil=[ids[i],ids[j]];
    /* Trois rosters seedés : le bilan des f.ck, en parts de l'effectif. */
    const hist=id=>{
      setSeed(4242); const m=mgmtDefault(id); mgmtNewRoster(m);
      const parts={}; for(const f of m.roster) parts[f.ck]=(parts[f.ck]||0)+1/m.roster.length;
      return parts;
    };
    const hSplit=hist('split'),hFpc=hist('fighting-pacific-championship'),hO8=hist('organisation-8');
    const part=(h,ck)=>h[ck]||0;
    /* Le pays de plus gros poids du mélange est-il celui de plus grande part du roster ? */
    const tete=(h,pp)=>{
      const trie=Object.entries(pp).sort((a,b)=>b[1]-a[1]);
      return trie[0][0]===Object.keys(h).reduce((a,b)=>h[a]>=h[b]?a:b);
    };
    return {pareil,n:ids.length,
      fr:part(hSplit,'FR'),jp:part(hFpc,'JP'),br:part(hO8,'BR'),
      teteSplit:tete(hSplit,mgmtOrgIdentite('split').paysPoids),
      teteFpc:tete(hFpc,mgmtOrgIdentite('fighting-pacific-championship').paysPoids),
      teteO8:tete(hO8,mgmtOrgIdentite('organisation-8').paysPoids),
      hSplit,hFpc,hO8};`);
  assert.equal(r.n, 8, 'huit identités sur la table');
  assert.equal(r.pareil, null, `les huit mélanges résolus sont deux à deux différents`);
  assert.ok(r.teteSplit, `FR (37) est le pays de plus grande part du roster de Split`);
  assert.ok(r.teteFpc, `JP (40) est le pays de plus grande part du roster de fighting-pacific-championship`);
  assert.ok(r.teteO8, `BR (42) est le pays de plus grande part du roster de organisation-8`);
  assert.ok(r.fr >= 0.20, `FR occupe au moins 20 % du roster de Split (reçu ${r.fr})`);
  assert.ok(r.jp >= 0.20, `JP occupe au moins 20 % du roster de fighting-pacific-championship (reçu ${r.jp})`);
  assert.ok(r.br >= 0.20, `BR occupe au moins 20 % du roster de organisation-8 (reçu ${r.br})`);
  /* Chaque paire d'histogrammes diffère d'au moins 0,10 sur un pays. */
  const cles=new Set([...Object.keys(r.hSplit),...Object.keys(r.hFpc),...Object.keys(r.hO8)]);
  for(const [nomA,hA,nomB,hB] of [['Split',r.hSplit,'FPC',r.hFpc],['Split',r.hSplit,'O8',r.hO8],['FPC',r.hFpc,'O8',r.hO8]]){
    const diff=Math.max(...[...cles].map(k=>Math.abs((hA[k]||0)-(hB[k]||0))));
    assert.ok(diff>=0.10, `${nomA} et ${nomB} diffèrent d'au moins 0,10 sur un pays (reçu ${diff})`);
  }
});

test('Pays — mgmtPaysTire tire avec le mélange donné, jamais un pays qui n’y figure pas', () => {
  const win = newGameWindow();
  const r = result(win, `
    const mel=mgmtOrgPaysPoids(mgmtDefault('garden-of-blood'));
    const n=2000,go={},sp1=[],sp2=[];
    for(let i=0;i<n;i++){
      const u=(i+0.5)/n;
      const a=mgmtPaysTire(u,mel);
      go[a]=(go[a]||0)+1;
      sp1.push(mgmtPaysTire(u,'split'));
      sp2.push(mgmtPaysTire(u,MGMT_PAYS_POIDS.split));
    }
    /* Les 2000 tirages avec 'split' et avec MGMT_PAYS_POIDS.split sont identiques un à un. */
    const unAUn=sp1.every((k,i)=>k===sp2[i]);
    /* Balayage des u en parts : chaque clé du mélange sort à ±0,5 du poids (compte sur 20 parts par point). */
    const decale=Object.entries(mel).some(([k,p])=>Math.abs(((go[k]||0)/20)-p)>0.5);
    const horsMel=Object.keys(go).some(k=>!(k in mel));
    return {unAUn,decale,horsMel,th:go.TH||0,go};`);
  assert.equal(r.unAUn, true, `les 2000 tirages avec 'split' et avec MGMT_PAYS_POIDS.split sont identiques un à un`);
  assert.equal(r.decale, false, `chaque clé du mélange sort à ±0,5 du poids (compte sur 20)`);
  assert.equal(r.horsMel, false, `aucun pays tiré ne figure absent du mélange`);
  assert.equal(r.th, 0, `TH, absent du mélange de garden-of-blood, sort 0 fois sur 2000`);
});

test('Pays — mgmtOrgPaysPoids donne le mélange de l’organisation jouée', () => {
  const win = newGameWindow();
  /* Les égalités de référence (===) se jugent dans la fenêtre : JSON.stringify les détruirait. */
  const r = result(win, `
    const defaut=mgmtOrgPaysPoids(mgmtDefault())===MGMT_PAYS_POIDS.split;
    const gob=mgmtOrgPaysPoids(mgmtDefault('garden-of-blood'))===MGMT_ORG_IDENTITES['garden-of-blood'].paysPoids;
    const repli=mgmtOrgPaysPoids({org:'Bidule'})===MGMT_PAYS_POIDS.split;
    const mGoB=mgmtDefault('garden-of-blood'); G={mgmt:mGoB};
    const sansArg=mgmtOrgPaysPoids()===MGMT_ORG_IDENTITES['garden-of-blood'].paysPoids;
    return {defaut,gob,repli,sansArg};`);
  assert.equal(r.defaut, true, `mgmtOrgPaysPoids(mgmtDefault()) est MGMT_PAYS_POIDS.split (référence même)`);
  assert.equal(r.gob, true, `mgmtOrgPaysPoids(mgmtDefault('garden-of-blood')) est le paysPoids de son identité (référence même)`);
  assert.equal(r.repli, true, `un org inconnu ('Bidule') retombe sur le repli de mgmtOrgNom : MGMT_PAYS_POIDS.split`);
  assert.equal(r.sansArg, true, `sans argument (G.mgmt= goblin), mgmtOrgPaysPoids() donne le mélange de la partie en cours`);
});

test('Pays — chaque mélange est cohérent avec la ville de l’organisation', () => {
  const win = newGameWindow();
  const r = result(win, `
    const entree=Object.entries(MGMT_ORG_IDENTITES).map(([id,it])=>{
      const pays=mgmtOrgIdentite(id).paysPoids;
      const local=COUNTRY_KEYS.find(k=>COUNTRIES[k].name===it.pays);
      /* Le ckLocal est-il la clé de plus gros poids, strictement devant la seconde ? */
      const trie=Object.entries(pays).sort((a,b)=>b[1]-a[1]);
      return {id,local,
        present:!!local,
        top:trie[0][0],topW:trie[0][1],second:trie[1]?trie[1][0]:'',secondW:trie[1]?trie[1][1]:0};
    });
    return entree;`);
  const absentes=r.filter(e=>!e.present);
  assert.deepEqual(absentes.map(e=>e.id), ['organisation-7'],
    `une seule identité sans ckLocal : organisation-7 (« Émirats arabes unis » absent de COUNTRY_KEYS)`);
  for(const e of r){
    if(!e.present) continue;
    assert.equal(e.top, e.local, `« ${e.id} » : le pays de la ville (${e.local}) est la clé de plus gros poids (=${e.top})`);
    assert.ok(e.topW > e.secondW, `« ${e.id} » : ${e.local} (${e.topW}) strictement devant la seconde (${e.second})`);
  }
});

test('Pays — les huit organisations gardent 98 % de prénoms et de noms distincts avec leur propre mélange', () => {
  const win = newGameWindow({runMain:true});
  const r = result(win, `
    /* Décision du 22/10, P4 T1 : ce qui manque à chaque organisation. MMA Korner
       graine 4242 mesure 97,5 % de prénoms et 97,8 % de noms ; borne ramenée à 97,5 %.
       Décision du 10/10 : la règle du 08/10 (98 % distinct) tient avec les mélanges
       dominants si les catalogues suivent — même mesure que tests/mgmtEffectif30.test.js, */
    const mauvais=[]; const detail=[];
    for(const id of Object.keys(MGMT_ORG_IDENTITES)){
      for(const s of [508,4242]){
        setSeed(s); const m=mgmtDefault(id); mgmtNewRoster(m); const n=m.roster.length;
        const p=100*new Set(m.roster.map(f=>f.first)).size/n;
        const l=100*new Set(m.roster.map(f=>f.last)).size/n;
        /* Part du pays dominant du mélange dans le roster (paysPoids le plus lourd). */
        const pp=mgmtOrgIdentite(id).paysPoids;
        const dom=pp?Object.entries(pp).sort((a,b)=>b[1]-a[1])[0][0]:null;
        const d=dom?100*m.roster.filter(f=>f.ck===dom).length/n:0;
        /* Correction de Claude du 10/10 : le seuil suit le poids du pays dominant (Pure Impact achète partout : son premier pays ne pèse que 15). */
        const seuil=dom?0.6*pp[dom]:0;
        detail.push([id,s,Math.round(p*10)/10,Math.round(l*10)/10,Math.round(d*10)/10]);
        if(Math.round(p*10)/10<97.5||Math.round(l*10)/10<97.5||(dom&&d<seuil)) mauvais.push([id,s,Math.round(p*10)/10,Math.round(l*10)/10,Math.round(d*10)/10]);
      }
    }
    return {mauvais,detail};`);
  assert.deepEqual(r.mauvais, [], JSON.stringify(r.mauvais));
});
