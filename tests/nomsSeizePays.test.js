"use strict";
/* CAGE LEGACY — tests/nomsSeizePays.test.js
   ============================================================================
   Décision du 30/09 : seize nouveaux pays (lot 5 H2,
   docs/LOT-5-UN-MONDE-HUMAIN.md §7 H2 ; docs/CATALOGUE-HUMANITE.md §1.2) :
   BE CH MA DZ SN PL NL ES IT DE SE KZ KG CN AU CA s'ajoutent aux quatorze
   pays existants de COUNTRIES (engine.js). Chaque pays nouveau porte une
   liste de noms de famille RÉELS et courants du pays (au moins 20), de
   prénoms masculins réels (au moins 15) et de prénoms féminins réels
   (au moins 15) — même méthode que la T3 bis « noms » du 28/09 :
   apostrophes, traits d'union et accents gardés, rien d'inventé.
   makeName tire le prénom féminin dans la liste firstF du pays quand elle
   existe (c.firstF || FIRST_F), comme le prénom masculin lit c.first ||
   FIRST_M depuis le 28/09 — toujours exactement deux tirages (prénom,
   nom de famille), un seul avec firstOverride.
   COUNTRY_MMA_PREFIX porte les seize préfixes : sans lui, un pays neuf
   cassait l'écran des championnats amateurs (ui-01-roster-matchmaking.js,
   id pfx+'MMA').
   ============================================================================ */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

/* Les seize pays du catalogue §1.2, avec leurs noms français et leurs
   drapeaux — épinglés tels qu'ils doivent exister dans COUNTRIES. */
const NOUVEAUX_PAYS = {
  BE:{name:'Belgique',flag:'🇧🇪'},
  CH:{name:'Suisse',flag:'🇨🇭'},
  MA:{name:'Maroc',flag:'🇲🇦'},
  DZ:{name:'Algérie',flag:'🇩🇿'},
  SN:{name:'Sénégal',flag:'🇸🇳'},
  PL:{name:'Pologne',flag:'🇵🇱'},
  NL:{name:'Pays-Bas',flag:'🇳🇱'},
  ES:{name:'Espagne',flag:'🇪🇸'},
  IT:{name:'Italie',flag:'🇮🇹'},
  DE:{name:'Allemagne',flag:'🇩🇪'},
  SE:{name:'Suède',flag:'🇸🇪'},
  KZ:{name:'Kazakhstan',flag:'🇰🇿'},
  KG:{name:'Kirghizistan',flag:'🇰🇬'},
  CN:{name:'Chine',flag:'🇨🇳'},
  AU:{name:'Australie',flag:'🇦🇺'},
  CA:{name:'Canada',flag:'🇨🇦'},
};
/* Les quatorze pays d'avant (décision du 30/09 : seize nouveaux pays —
   les quatorze codes actuels de COUNTRIES restent, catalogue §1.2). */
const ANCIENS_PAYS = ['FR','BR','US','GB','RU','DAG','GE','CM','NG','IE','MX','JP','KR','TH'];
const ANCIENS_NOMS = {FR:'France',BR:'Brésil',US:'États-Unis',GB:'Royaume-Uni',RU:'Russie',
  DAG:'Daghestan',GE:'Géorgie',CM:'Cameroun',NG:'Nigéria',IE:'Irlande',MX:'Mexique',
  JP:'Japon',KR:'Corée',TH:'Thaïlande'};

test('H2 — chaque pays du catalogue §1.2 existe dans COUNTRIES, avec son nom et son drapeau', () => {
  const win = newGameWindow();
  const r = JSON.parse(win.eval(`JSON.stringify({
    tous:Object.fromEntries(COUNTRY_KEYS.map(ck=>[ck,{name:COUNTRIES[ck].name,flag:COUNTRIES[ck].flag}]))
  })`));
  /* Les trente codes existent (quatorze anciens + seize nouveaux). */
  for(const ck of ANCIENS_PAYS.concat(Object.keys(NOUVEAUX_PAYS))){
    assert.ok(r.tous[ck], `COUNTRIES.${ck} existe`);
    assert.ok(r.tous[ck].flag, `COUNTRIES.${ck}.flag présent`);
  }
  /* Les seize nouveaux portent le nom français du catalogue et leur drapeau. */
  for(const [ck,attendu] of Object.entries(NOUVEAUX_PAYS)){
    assert.equal(r.tous[ck].name, attendu.name, `COUNTRIES.${ck}.name = ${attendu.name}`);
    assert.equal(r.tous[ck].flag, attendu.flag, `COUNTRIES.${ck}.flag = ${attendu.flag}`);
  }
  /* Les quatorze anciens gardent leur nom (rien ne bouge). */
  for(const [ck,nom] of Object.entries(ANCIENS_NOMS)){
    assert.equal(r.tous[ck].name, nom, `COUNTRIES.${ck}.name reste ${nom}`);
  }
});

test('H2 — listes des seize nouveaux pays : tailles minimales, aucun doublon', () => {
  const win = newGameWindow();
  const cks = JSON.stringify(Object.keys(NOUVEAUX_PAYS));
  const r = JSON.parse(win.eval(`JSON.stringify((function(){ const o={}; for(const ck of ${cks}) o[ck]={last:COUNTRIES[ck].last,first:COUNTRIES[ck].first,firstF:COUNTRIES[ck].firstF}; return o; })())`));
  for(const [ck,l] of Object.entries(r)){
    assert.ok(l.last.length>=20, `${ck} : au moins 20 noms de famille (reçu ${l.last.length})`);
    assert.ok(l.first.length>=15, `${ck} : au moins 15 prénoms masculins (reçu ${l.first.length})`);
    assert.ok(l.firstF.length>=15, `${ck} : au moins 15 prénoms féminins (reçu ${l.firstF.length})`);
    assert.equal(new Set(l.last).size, l.last.length, `${ck} : aucun doublon dans last`);
    assert.equal(new Set(l.first).size, l.first.length, `${ck} : aucun doublon dans first`);
    assert.equal(new Set(l.firstF).size, l.firstF.length, `${ck} : aucun doublon dans firstF`);
    for(const nom of l.last){ assert.ok(typeof nom==='string'&&nom.trim().length>0, `${ck} : nom de famille non vide`); }
    for(const p of l.first.concat(l.firstF)){ assert.ok(typeof p==='string'&&p.trim().length>0, `${ck} : prénom non vide`); }
  }
  /* Les quatorze anciens restent sans doublon — aucun tirage ne bouge pour
     eux (les listes du 28/09 sont épinglées dans nomsApostrophe.test.js). */
  const anciens = JSON.parse(win.eval(`JSON.stringify(${JSON.stringify(ANCIENS_PAYS)}.map(k=>[k,COUNTRIES[k].last]))`));
  for(const [ck,l] of anciens){
    assert.equal(new Set(l).size, l.length, `${ck} : aucun doublon dans last`);
  }
});

test('H2 — apostrophes, traits d\'union, accents et graphies composées gardés', () => {
  const win = newGameWindow();
  const r = JSON.parse(win.eval(`JSON.stringify({
    sn:COUNTRIES.SN.last, dz:COUNTRIES.DZ.last, ch:COUNTRIES.CH.last, es:COUNTRIES.ES.last,
    pl:COUNTRIES.PL.last, nl:COUNTRIES.NL.last, ma:COUNTRIES.MA.last,
    snF:COUNTRIES.SN.firstF, plF:COUNTRIES.PL.firstF
  })`));
  assert.ok(r.dz.includes('Aït-Ali'), 'Algérie : le trait d\'union kabyle Aït-Ali');
  assert.ok(r.ch.includes('Müller')&&r.ch.includes('Bühler'), 'Suisse : umlauts gardés');
  assert.ok(r.es.includes('García')&&r.es.includes('Domínguez'), 'Espagne : accents espagnols');
  assert.ok(r.pl.includes('Wiśniewski')&&r.pl.includes('Dąbrowski'), 'Pologne : ś, ą gardés');
  assert.ok(r.nl.includes('De Jong')&&r.nl.includes('Van den Berg')&&r.nl.includes('Dijkstra'), 'Pays-Bas : graphies composées');
  assert.ok(r.ma.includes('Chraïbi')&&r.ma.includes('Benjelloun'), 'Maroc : ï gardé');
  assert.ok(r.sn.includes('Sène')&&r.sn.includes('Cissé'), 'Sénégal : è et é gardés');
  assert.ok(r.snF.includes('Ndèye')&&r.snF.includes('Maïmouna'), 'Sénégal : ï et è dans les prénoms féminins');
  assert.ok(r.plF.includes('Małgorzata'), 'Pologne : ł dans les prénoms féminins');
});

/* Reprise du 02/10 — les combinaisons interdites : le jeu ne peut jamais
   générer le nom complet d'un sportif célèbre. La liste épinglée ci-dessous
   porte les noms retirés des listes à la demande d'Anthony (Hakimi,
   Amrabat, Mazraoui, Aguerd, Saïss, En-Nesyri ; Mahrez, Slimani, Bounedjah,
   Ghezzal) et ceux trouvés par la vérification des seize pays (Walid Cherif,
   Zhong Guo, Liu Xiang, Ma Long, Wang Tao, Wang Hao, Wu Lei, Sun Yang,
   Sun Yue, Zhu Ting, Xu Xin, Dries Mertens, Erik Karlsson, Elias
   Pettersson, Alexander Isak, Cooper Chapman, Émile Bouchard) ; les grands
   noms des sports hors des seize pays sont épinglés pour que la règle
   tienne si le tirage croise des listes voisines. */
const INTERDITS = [
  'Achraf Hakimi','Sofyan Amrabat','Noussair Mazraoui','Nayef Aguerd','Romain Saïss','Yassine En-Nesyri',
  'Riyad Mahrez','Islam Slimani','Baghdad Bounedjah','Rachid Ghezzal',
  'Walid Cherif','Zhong Guo','Liu Xiang','Ma Long','Wang Tao','Wang Hao','Wu Lei','Sun Yang','Sun Yue','Zhu Ting','Xu Xin','Lin Dan','Yao Ming',
  'Dries Mertens','Erik Karlsson','Elias Pettersson','Alexander Isak','Cooper Chapman','Émile Bouchard',
  'Zinedine Zidane','Robert Lewandowski','Romelu Lukaku','Kylian Mbappé','Khabib Nurmagomedov','Floyd Mayweather',
  'Anderson Silva','Thiago Silva','Rodrigo Nogueira','Júnior Dos Santos','Charles Oliveira','Jon Jones','Derrick Lewis','Anthony Smith','Kamaru Usman','Tony Ferguson','Conor McGregor','Kim Dong-hyun'
];

test('H2 / H2 bis — aucune combinaison prénom + nom des trente pays ne donne un sportif célèbre', () => {
  const win = newGameWindow();
  const cks = JSON.stringify(Object.keys(NOUVEAUX_PAYS).concat(ANCIENS_PAYS));
  const r = JSON.parse(win.eval(`JSON.stringify((function(){
    const interdits=new Set(${JSON.stringify(INTERDITS)});
    const cksListe=${cks};
    const collisions=[];
    for(const ck of cksListe){
      const c=COUNTRIES[ck];
      const prenoms=c.first.concat(c.firstF||[]);
      for(const p of prenoms){
        for(const n of c.last){
          const nom=p+' '+n;
          if(interdits.has(nom)) collisions.push(nom);
        }
      }
    }
    return collisions;
  })())`));
  assert.deepEqual(r, [], 'aucune combinaison interdite (' + JSON.stringify(r) + ')');
});

test('H2 — les noms de sportifs célèbres sont bien sortis des listes (reprise du 02/10)', () => {
  const win = newGameWindow();
  const r = JSON.parse(win.eval(`JSON.stringify({
    maLast:COUNTRIES.MA.last, dzLast:COUNTRIES.DZ.last, dzFirst:COUNTRIES.DZ.first,
    cnFirst:COUNTRIES.CN.first, cnFirstF:COUNTRIES.CN.firstF,
    beFirst:COUNTRIES.BE.first, seFirst:COUNTRIES.SE.first,
    auLast:COUNTRIES.AU.last, caFirst:COUNTRIES.CA.first
  })`));
  /* Maroc : les six noms de la sélection sortent, les remplacements entrent. */
  for(const sorti of ['Hakimi','Amrabat','Mazraoui','Aguerd','Saïss','En-Nesyri']){
    assert.ok(!r.maLast.includes(sorti), 'Maroc : ' + sorti + ' retiré');
  }
  for(const entre of ['Ouazzani','Chami','Sekkat','Lahlou','Benhima','Lamrani']){
    assert.ok(r.maLast.includes(entre), 'Maroc : ' + entre + ' entre');
  }
  /* Algérie : les quatre noms de la sélection sortent, les remplacements entrent. */
  for(const sorti of ['Mahrez','Slimani','Bounedjah','Ghezzal']){
    assert.ok(!r.dzLast.includes(sorti), 'Algérie : ' + sorti + ' retiré');
  }
  for(const entre of ['Mansouri','Meziane','Taleb','Boukhari']){
    assert.ok(r.dzLast.includes(entre), 'Algérie : ' + entre + ' entre');
  }
  /* Walid Cherif : le prénom sort de la liste algérienne. */
  assert.ok(!r.dzFirst.includes('Walid'), 'Algérie : le prénom Walid retiré (Walid Cherif)');
  assert.ok(r.dzFirst.includes('Hicham'), 'Algérie : Hicham entre');
  /* Chine : Zhong (« Zhong Guo ») et les prénoms des sportifs célèbres sortent. */
  for(const sorti of ['Zhong','Xiang','Tao','Lei','Hao']){
    assert.ok(!r.cnFirst.includes(sorti), 'Chine : ' + sorti + ' retiré de first');
  }
  for(const sorti of ['Ting','Yue','Xin']){
    assert.ok(!r.cnFirstF.includes(sorti), 'Chine : ' + sorti + ' retiré de firstF');
  }
  /* Les autres neutralisations de la vérification. */
  assert.ok(!r.beFirst.includes('Dries'), 'Belgique : Dries retiré (Dries Mertens)');
  assert.ok(r.beFirst.includes('Wout'), 'Belgique : Wout entre');
  assert.ok(!r.seFirst.includes('Erik')&&!r.seFirst.includes('Elias'), 'Suède : Erik et Elias retirés (Erik Karlsson, Elias Pettersson)');
  assert.ok(r.seFirst.includes('Filip')&&r.seFirst.includes('Samuel'), 'Suède : Filip et Samuel entrent');
  assert.ok(!r.auLast.includes('Chapman'), 'Australie : Chapman retiré (Cooper Chapman)');
  assert.ok(r.auLast.includes('Robinson'), 'Australie : Robinson entre');
  assert.ok(!r.caFirst.includes('Émile'), 'Canada : Émile retiré (Émile Bouchard)');
  assert.ok(r.caFirst.includes('Mathis'), 'Canada : Mathis entre');
  /* Tailles maintenues après retrait/remplacement. */
  assert.ok(r.maLast.length>=20, 'Maroc : toujours au moins 20 noms de famille');
  assert.ok(r.dzLast.length>=20, 'Algérie : toujours au moins 20 noms de famille');
  assert.ok(r.cnFirst.length>=15&&r.cnFirstF.length>=15, 'Chine : toujours 15 prénoms et 15 prénoms féminins');
});

test('H2 — makeName : les femmes des seize pays tirent dans firstF, les hommes dans first', () => {
  const win = newGameWindow();
  const cks = JSON.stringify(Object.keys(NOUVEAUX_PAYS));
  const r = JSON.parse(win.eval(`JSON.stringify((function(){
    const cksListe=${cks};
    const out={};
    for(const ck of cksListe){
      setSeed(4100+cksListe.indexOf(ck)*7);
      const h=makeName('H',ck), f=makeName('F',ck);
      out[ck]={hFirst:h.first,hLast:h.last,fFirst:f.first,fLast:f.last};
    }
    return out;
  })())`));
  /* Les listes du pays, tirées une fois pour la comparaison côté Node. */
  const lists = JSON.parse(win.eval(`JSON.stringify((function(){ const o={}; for(const ck of ${cks}) o[ck]={last:COUNTRIES[ck].last,first:COUNTRIES[ck].first,firstF:COUNTRIES[ck].firstF}; return o; })())`));
  for(const [ck,m] of Object.entries(r)){
    assert.ok(lists[ck].first.includes(m.hFirst), `homme ${ck} : prénom du pays (${m.hFirst})`);
    assert.ok(lists[ck].last.includes(m.hLast), `homme ${ck} : nom du pays (${m.hLast})`);
    assert.ok(lists[ck].firstF.includes(m.fFirst), `femme ${ck} : prénom féminin du pays (${m.fFirst})`);
    /* Corrections du 08/10, 5.2 : une femme porte la forme féminine du nom quand la langue en a une. */
    const fem=lists[ck].last.some(l=>win.eval(`feminiserNom(${JSON.stringify(l)},${JSON.stringify(ck)})`)===m.fLast);
    assert.ok(lists[ck].last.includes(m.fLast)||fem, `femme ${ck} : nom du pays, au féminin si la langue en a un (${m.fLast})`);
  }
  /* H2 bis (03/10) : les quatorze anciens pays ont désormais leur firstF et leur first. */
  const vieux = JSON.parse(win.eval(`JSON.stringify((function(){
    setSeed(5050); const fr=makeName('F','FR');
    setSeed(5051); const kr=makeName('F','KR');
    setSeed(5052); const ge=makeName('F','GE');
    setSeed(5053); const frH=makeName('H','FR');
    return {fr:fr.first,kr:kr.first,ge:ge.first,frH:frH.first,
      ffr:COUNTRIES.FR.firstF,fkr:COUNTRIES.KR.firstF,fge:COUNTRIES.GE.firstF,mfr:COUNTRIES.FR.first};
  })())`));
  assert.ok(vieux.ffr.includes(vieux.fr), 'femme française : firstF du pays');
  assert.ok(vieux.fkr.includes(vieux.kr), 'femme coréenne : firstF du pays');
  assert.ok(vieux.fge.includes(vieux.ge), 'femme géorgienne : firstF du pays');
  assert.ok(vieux.mfr.includes(vieux.frH), 'homme français : first du pays');
  /* Une femme d'un pays à liste féminine ne tire jamais dans first (hommes). */
  const plF = JSON.parse(win.eval(`JSON.stringify((function(){
    setSeed(5060); const f=makeName('F','PL');
    setSeed(5061); const h=makeName('H','PL');
    return {f:f.first,h:h.first,ff:COUNTRIES.PL.firstF,fm:COUNTRIES.PL.first};
  })())`));
  assert.ok(plF.ff.includes(plF.f), 'femme polonaise dans la liste féminine du pays');
  assert.ok(plF.fm.includes(plF.h), 'homme polonais dans la liste masculine du pays');
});

test('H2 — makeName consomme toujours exactement deux tirages (prénom, nom)', () => {
  const win = newGameWindow();
  const ticks = JSON.parse(win.eval(`JSON.stringify((()=>{
    const orig=rnd; let n=0;
    rnd=function(){ n++; return orig(); };
    setSeed(901); n=0; makeName('F','PL'); const plF=n;
    setSeed(901); n=0; makeName('H','CA'); const caH=n;
    setSeed(901); n=0; makeName('F','FR'); const frF=n;
    setSeed(901); n=0; makeName('H','KZ','Alikhan'); const over=n;
    rnd=orig;
    return {plF,caH,frF,over};
  })())`));
  assert.equal(ticks.plF, 2, 'une femme polonaise : deux tirages');
  assert.equal(ticks.caH, ticks.plF, 'un homme canadien : autant de tirages');
  assert.equal(ticks.frF, ticks.plF, 'une femme française (FIRST_F) : autant de tirages');
  assert.equal(ticks.over, 1, 'firstOverride : un seul tirage (le nom de famille)');
});

test('H2 — COUNTRY_MMA_PREFIX complet et sans collision : un championnat amateur par pays', () => {
  const win = newGameWindow();
  const r = JSON.parse(win.eval(`JSON.stringify((function(){
    const prefixes={}; let bad=0;
    for(const ck of COUNTRY_KEYS){
      const pfx=COUNTRY_MMA_PREFIX[ck];
      if(typeof pfx!=='string'||pfx.length===0){ bad++; continue; }
      if(prefixes[pfx]) bad++;
      prefixes[pfx]=ck;
    }
    return {keys:COUNTRY_KEYS.length, prefixes, bad};
  })())`));
  assert.equal(r.keys, 30, 'COUNTRY_KEYS compte les trente pays (décision du 30/09 : seize nouveaux pays)');
  assert.equal(r.bad, 0, 'chaque pays a un préfixe unique : aucun id undefinedMMA à l\'écran des championnats');
  /* Épinglés : les seize nouveaux préfixes et trois anciens qui restent. */
  const attendus = {BE:'BE',CH:'SUI',MA:'MA',DZ:'ALG',SN:'SEN',PL:'PO',NL:'PA',ES:'ES',
    IT:'IT',DE:'ALL',SE:'SWE',KZ:'KA',KG:'KI',CN:'CH',AU:'AU',CA:'CAN',CM:'CA',KR:'CO',FR:'F'};
  for(const [ck,pfx] of Object.entries(attendus)){
    assert.equal(r.prefixes[pfx], ck, `préfixe ${pfx} porte ${ck}`);
  }
});

test('H2 — les championnats amateurs portent les trente pays, ids uniques, aucun undefined', () => {
  const win = newGameWindow();
  win.eval(`G={theme:'dark'};`);
  const r = JSON.parse(win.eval(`JSON.stringify((function(){
    const orgs=AMA_CHAMPIONSHIPS.filter(o=>o.country);
    const ids=new Set();
    let bad=0;
    for(const o of orgs){ if(ids.has(o.id)) bad++; ids.add(o.id);
      if(!o.country||!COUNTRIES[o.country]) bad++; }
    const codes=orgs.map(o=>o.country);
    const manque=${JSON.stringify(Object.keys(NOUVEAUX_PAYS))}.filter(ck=>!codes.includes(ck));
    return {n:orgs.length,bad,manque};
  })())`));
  assert.equal(r.n, 30, 'un championnat amateur par pays (décision du 30/09 : seize nouveaux pays)');
  assert.equal(r.bad, 0, 'aucun id en doublon, aucun pays inconnu');
  assert.deepEqual(r.manque, [], 'les seize nouveaux pays ont chacun leur championnat');
});

test('H2 — le monde extérieur dérive des noms des seize pays (mgmtExteriorName)', () => {
  const win = newGameWindow();
  win.eval(`setSeed(77); CL.mgmtEnter();`);
  const cks = JSON.stringify(Object.keys(NOUVEAUX_PAYS));
  const r = JSON.parse(win.eval(`JSON.stringify((function(){
    const div=divById('H-light');
    const out={};
    for(const ck of ${cks}){
      const nom=mgmtExteriorName(987654,div,ck);
      out[ck]={name:nom.name,
        okFirst:COUNTRIES[ck].first.includes(nom.first),
        okFirstF:COUNTRIES[ck].firstF.includes(nom.first),
        okLast:COUNTRIES[ck].last.includes(nom.last)};
    }
    return out;
  })())`));
  for(const [ck,m] of Object.entries(r)){
    assert.ok(m.okLast, `dérivation ${ck} : le nom vient de la liste du pays (${m.name})`);
    assert.ok(m.okFirst||m.okFirstF, `dérivation ${ck} : le prénom vient de la liste du pays (${m.name})`);
  }
});

test('H2 — un combattant des seize pays passe la porte de sauvegarde (validateMgmt)', () => {
  const win = newGameWindow();
  win.eval(`setSeed(31); CL.mgmtEnter();`);
  win.eval(`(function(){
    G.mgmt.roster.push({id:'mgX',name:'Adilet Ismailov',first:'Adilet',last:'Ismailov',
      W:5,L:2,D:0,age:24,div:'H-welter',divName:'Poids mi-moyen',org:'Split',
      level:1,raison:null,interactions:0,ck:'KG'});
  })()`);
  const ok = JSON.parse(win.eval(`JSON.stringify({passe:validateMgmt(G.mgmt)})`));
  assert.equal(ok.passe, true, 'un combattant kirghize passe la porte de sauvegarde (COUNTRY_KEYS étendue)');
});

/* Lot 5 H2 bis (03/10/2026) — les quatorze anciens pays : plus de nom de
   combattant, de footballeur ou de politique célèbre (Nurmagomedov, Makhachev,
   Chimaev, Tsarnaev, Adesanya, Biya, Canelo, McGregor…), plus de nom de ring
   thaïlandais, et chacun porte ses prénoms masculins et féminins. */
test('H2 bis — les quatorze anciens pays : noms célèbres sortis, prénoms du pays présents', () => {
  const win = newGameWindow();
  const r = JSON.parse(win.eval(`JSON.stringify({
    pays:${JSON.stringify(ANCIENS_PAYS)}.map(k=>({k,last:COUNTRIES[k].last,first:COUNTRIES[k].first,firstF:COUNTRIES[k].firstF})),
    anciens:COUNTRY_LAST_ANCIENS
  })`));
  const SORTIS = ['Tsarnaev','Nurmagomedov','Makhachev','Chimaev','Adesanya','Biya','Canelo','McGregor','Cejudo',
    'Emelianenko','Bisping','Aspinall','Pimblett','Dvalishvili','Topuria','Gaethje','Sakuraba','Saenchai','Rodtang'];
  for(const p of r.pays){
    assert.ok(p.last.length>=14, p.k + ' : au moins 14 noms de famille');
    assert.ok(p.first&&p.first.length>=9, p.k + ' : prénoms masculins du pays');
    assert.ok(p.firstF&&p.firstF.length>=15, p.k + ' : prénoms féminins du pays');
    assert.equal(new Set(p.last).size, p.last.length, p.k + ' : aucun doublon (noms)');
    assert.equal(new Set(p.first).size, p.first.length, p.k + ' : aucun doublon (prénoms)');
    assert.equal(new Set(p.firstF).size, p.firstF.length, p.k + ' : aucun doublon (prénoms féminins)');
    for(const s of SORTIS){ assert.ok(!p.last.includes(s), p.k + ' : ' + s + ' retiré'); }
  }
  /* Les noms retirés restent connus d'une seule chose : retrouver l'origine d'une ancienne sauvegarde. */
  assert.ok(r.anciens.DAG.includes('Tsarnaev')&&r.anciens.DAG.includes('Chimaev'), 'DAG : noms retirés mémorisés');
  assert.ok(r.anciens.TH.includes('Saenchai'), 'TH : noms de ring mémorisés');
  for(const [ck,l] of Object.entries(r.anciens)){
    const actuels = r.pays.find(p=>p.k===ck).last;
    for(const nom of l){ assert.ok(!actuels.includes(nom), ck + ' : ' + nom + ' absent des tirages'); }
  }
});
