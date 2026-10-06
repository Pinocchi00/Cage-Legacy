"use strict";
/* Lot 5 T3 : la couche médias. Les lignes sont des propositions (relu:false) ;
   le code n'en écrit aucune, il choisit, remplit, et n'affiche jamais une ligne
   dont un emplacement manque. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
function result(win,code){ return JSON.parse(win.eval(`JSON.stringify((function(){${code}})())`)); }
const NEUVE=`setSeed(9); const m=mgmtDefault(); mgmtNewRoster(m); mgmtExteriorEnsure(m); mgmtNewPile(m); G={theme:'dark',mgmt:m,screen:'mgmt_bureau'}; m.facts=[]; m.hist=[]; m.cycle=10; m.eventsPlayed=7; m.card.main=[]; m.card.prelims=[];
  const libres=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o)&&divById(o.div).id===m.roster[0].div); const [X,Y,Z]=libres;
  const combat=(c,g,p,family,round,wl)=>m.hist.push({c,slot:'main',rounds:3,a:{id:g.id,W:wl?wl[0]:5,L:0,D:0},b:{id:p.id,W:wl?wl[1]:5,L:1,D:0},winner:'A',family,round});
  const lendemain=(family,round,wl)=>{ m.hist=[]; combat(m.cycle,X,Y,family,round,wl); m.lastEvent={cycle:m.cycle,fights:[{a:X.id,b:Y.id,winner:'A',family,round,rounds:3}],touched:[],finance:{},e1:false}; };`;

test('T3 — les dix médias et leurs lignes : relu:false, emplacements connus, aucun nom propre, règles d’écriture', () => {
  const win=newGameWindow();
  const r=result(win,`const ok=new Set(['a','b','n','round','rounds','cat','pays','org']);
    const manques=[]; const inconnus=[];
    for(const l of MGMT_MEDIAS_LIGNES){ if(!MGMT_MEDIAS.some(x=>x.id===l.media)) manques.push(l.media);
      for(const s of l.texte.matchAll(/\\{([a-z]+)\\}/g)) if(!ok.has(s[1])) inconnus.push(s[1]); }
    return {n:MGMT_MEDIAS.length,manques,inconnus,relu:MGMT_MEDIAS_LIGNES.every(l=>l.relu===false),
      situations:[...new Set(MGMT_MEDIAS_LIGNES.map(l=>l.situation))].sort(),
      parMedia:MGMT_MEDIAS.map(x=>MGMT_MEDIAS_LIGNES.filter(l=>l.media===x.id).length),
      exclam:MGMT_MEDIAS_LIGNES.filter(l=>l.media==='cage-hebdo'&&l.texte.includes('!')).length};`);
  assert.equal(r.n,10); assert.deepEqual(r.manques,[]); assert.deepEqual(r.inconnus,[]); assert.ok(r.relu);
  assert.deepEqual(r.situations,['affiche','lendemain','rebook']);
  assert.ok(r.parMedia.every(n=>n>=1),'chaque média a au moins une ligne');
  assert.equal(r.exclam,0,'Cage Hebdo : jamais de point d’exclamation');
});

test('T3 — le lendemain : les noms viennent du jeu, aucun emplacement ne reste, Clé de Bras crie, rien n’est stocké', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    lendemain('ko',1); const seed=SEED; const cles=Object.keys(m).sort().join();
    const l=mgmtMediasLendemain(m); const l2=mgmtMediasLendemain(m);
    return {n:l.length,stable:JSON.stringify(l)===JSON.stringify(l2),noms:l.every(x=>x.texte.toUpperCase().includes(X.name.toUpperCase())||/PRESSE|\\(/i.test(x.texte)||true),
      accolades:l.some(x=>/[{}]/.test(x.texte)),differents:new Set(l.map(x=>x.media)).size===l.length,
      cle:l.filter(x=>x.media==='cle-de-bras').every(x=>x.texte===x.texte.toLocaleUpperCase('fr')),
      rng:seed===SEED,cles:cles===Object.keys(m).sort().join(),
      nomX:X.name,textes:l.map(x=>x.texte)};`);
  assert.ok(r.n>=1&&r.n<=3,'une à trois lignes'); assert.ok(r.stable,'rejouer dit la même chose'); assert.ok(!r.accolades);
  assert.ok(r.differents,'jamais deux fois le même média'); assert.ok(r.cle); assert.ok(r.rng); assert.ok(r.cles);
  assert.ok(r.textes.some(t=>t.toUpperCase().includes(r.nomX.toUpperCase())),'le vainqueur est nommé');
});

test('T3 — les conditions : une décision ne reçoit ni « KO en un round », ni « GOAT » ; un KO au round 1 reçoit les deux', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const pool=cas=>{ const vus=new Set(); for(let c=1;c<=40;c++){ m.cycle=c; lendemain(cas[0],cas[1],cas[2]); m.cycle=c; mgmtMediasLendemain(m).forEach(x=>vus.add(x.texte)); } return [...vus]; };
    const dec=pool(['dec',3]); const ko=pool(['ko',1]); const surprise=pool(['ko',2,[2,8]]);
    return {decKo:dec.some(t=>/UN ROUND|GOAT/i.test(t)),koUn:ko.some(t=>/UN ROUND/i.test(t)),koGoat:ko.some(t=>/GOAT/.test(t)),
      decVol:dec.some(t=>/VOL/.test(t)),koVol:ko.some(t=>/VOOOL/.test(t)),surprise:surprise.some(t=>/N’EN REVIENNENT PAS|rendez l’argent/i.test(t))};`);
  assert.equal(r.decKo,false); assert.ok(r.koUn); assert.ok(r.koGoat); assert.ok(r.decVol); assert.equal(r.koVol,false); assert.ok(r.surprise);
});

test('T3 — l’affiche : la tête de la carte principale, deux noms, jamais un emplacement vide', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    m.card.main=[{a:X.id,b:Y.id,cycle:m.cycle,slot:'main'}];
    const l=mgmtMediasAffiche(m);
    return {n:l.length,accolades:l.some(x=>/[{}]/.test(x.texte)),noms:l.every(x=>x.texte.includes(X.name)||x.texte.includes(Y.name)||x.texte.toUpperCase().includes(X.name.toUpperCase())),
      vide:mgmtMediasAffiche(Object.assign({},m,{card:{main:[]}})).length};`);
  assert.ok(r.n>=1); assert.ok(!r.accolades); assert.ok(r.noms); assert.equal(r.vide,0,'pas de carte principale, pas d’affiche');
});

test('T3 — La Pesée : un combattant rebooké le cycle suivant un KO subi', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    m.hist=[]; combat(m.cycle-1,Y,X,'ko',1); m.card.main=[{a:X.id,b:Z.id,cycle:m.cycle,slot:'main'}];
    const l=mgmtMediasRebook(m);
    m.hist=[]; combat(m.cycle-3,Y,X,'ko',1);
    return {n:l.length,media:l[0]&&l[0].media,vieux:mgmtMediasRebook(m).length};`);
  assert.equal(r.n,1); assert.equal(r.media,'la-pesee'); assert.equal(r.vieux,0,'un KO d’il y a trois cycles ne compte plus');
});

test('T3 — la presse du pays ne parle que d’un étranger rare ; Coin Rouge d’un Français', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const pays=f=>mgmtIdentitePays(f);
    const rare=m.roster.find(f=>pays(f)!=='FR'&&mgmtMediasPaysRare(m,f)); const fr=m.roster.find(f=>pays(f)==='FR');
    const vus={};
    for(let c=1;c<=60;c++){ m.cycle=c;
      if(rare&&fr){ m.card.main=[{a:rare.id,b:fr.id,cycle:c,slot:'main'}]; mgmtMediasAffiche(m).forEach(x=>{ vus[x.media]=(vus[x.media]||[]).concat(x.texte); }); } }
    return {rare:!!rare,fr:!!fr,vus:Object.keys(vus),presse:(vus['presse-du-pays']||[])[0]||'',coin:(vus['coin-rouge']||[])[0]||'',nomRare:rare&&rare.name,pays:rare&&COUNTRIES[pays(rare)].name};`);
  assert.ok(r.rare&&r.fr,'fixture : un étranger rare et un Français');
  assert.ok(r.vus.includes('presse-du-pays')); assert.ok(r.vus.includes('coin-rouge'));
  assert.ok(r.presse.includes(r.nomRare)&&r.presse.includes(r.pays),'« notre X » du bon pays');
});

test('T3 — la semaine, le fil et le lendemain portent la presse ; une partie d’avant H4 n’en a aucune', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    lendemain('ko',1); m.card.main=[{a:Z.id,b:Y.id,cycle:m.cycle,slot:'main'}];
    const html=mgmtSemaineMonde(m); const semaine=html.match(/data-type="presse"/g)||[]; const source=MGMT_MEDIAS.map(x=>x.nom).find(n=>html.includes(esc(n)));
    const fil=mgmtFilLignes(m);
    G.screen='mgmt_lendemain'; render(); const ld=document.getElementById('app').innerHTML;
    const lignes=mgmtMediasLignes(m).length;
    m.effectifs=0;
    return {semaine:semaine.length,source,fil:fil.some(t=>MGMT_MEDIAS.some(x=>t.startsWith(x.nom+' : '))),
      ld:ld.includes('Ce qu’en dit la presse'),lignes,ancien:mgmtMediasLignes(m).length};`);
  assert.equal(r.semaine.length||r.semaine,1); assert.ok(r.fil); assert.ok(r.ld); assert.ok(r.lignes>=2);
  assert.ok(MGMT_NOMS_OK(r.source),'la source de la ligne est un média');
  assert.equal(r.ancien,0);
});
function MGMT_NOMS_OK(s){ return ['Cage Hebdo','Sources Proches','Clé de Bras','La Pesée','Tableau Noir','Micro Tendu','Le Plateau','Le Forum','La presse du pays','Coin Rouge'].includes(s); }

const AVEC_VOIX=`const origV=mgmtVoixActuelle; const voix=(map)=>{ mgmtVoixActuelle=(mm,f)=>map[f.id]||origV(mm,f); };`;

test('T3 rencontres — deux voix qui se rencontrent (§4) font l’affiche, dans l’ordre des voix, avant les lignes ordinaires', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}${AVEC_VOIX}
    m.card.main=[{a:Y.id,b:X.id,cycle:m.cycle,slot:'main'}];
    voix({[X.id]:'le-timide',[Y.id]:'le-sans-filtre'});
    const vus=new Set(); for(let c=1;c<=30;c++){ m.cycle=c; m.card.main[0].cycle=c; mgmtMediasAffiche(m).forEach(x=>vus.add(x.media+'|'+x.texte)); }
    m.cycle=10;
    const l=mgmtMediasAffiche(m);
    voix({[X.id]:'le-fataliste',[Y.id]:'le-sans-filtre'}); const caps=mgmtMediasAffiche(m).find(x=>x.media==='cle-de-bras');
    voix({[X.id]:'le-metronome',[Y.id]:'le-fataliste'}); const aucune=mgmtMediasAffiche(m).some(x=>/trois semaines|GLACÉE|se taira/.test(x.texte));
    voix({[X.id]:'linterprete',[Y.id]:'le-fataliste'}); const interprete=mgmtMediasAffiche(m).some(x=>x.media==='le-forum'&&/n’a pas répondu/.test(x.texte));
    return {coin:[...vus].filter(s=>s.startsWith('coin-rouge|')),x:X.name,y:Y.name,premier:l[0]&&l[0].media,caps:caps&&caps.texte,aucune,interprete};`);
  assert.equal(r.coin.length,1,'le Timide contre un bruyant : Coin Rouge'); assert.ok(r.coin[0].includes(r.x+' se taira, '+r.y),'le Timide d’abord ({a}), le bruyant ensuite');
  assert.equal(r.premier,'coin-rouge','la ligne de la rencontre passe avant les lignes ordinaires');
  assert.ok(r.caps&&r.caps.includes(r.y.toUpperCase())&&r.caps.includes(r.x.toUpperCase()),'Clé de Bras écrit en majuscules, le Sans-filtre d’abord');
  assert.equal(r.aucune,false,'deux voix qui ne se rencontrent pas : aucune ligne de rencontre'); assert.ok(r.interprete,'tout le monde contre l’Interprété');
});

test('T3 rencontres — la pionnière : la première soirée dont le combat principal est féminin, une seule fois', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    const dF=allDivisions().find(d=>d.gender==='F'); const f=m.roster.filter(o=>o.div===dF.id); const [A,B]=f;
    const trace=(c,g,p)=>({c,slot:'main',rounds:3,a:{id:g.id,W:g.W,L:g.L,D:0,div:g.div},b:{id:p.id,W:p.W,L:p.L,D:0,div:p.div},winner:'A',family:'dec',round:3});
    m.hist=[trace(10,A,B)]; m.lastEvent={cycle:10,fights:[{a:A.id,b:B.id,winner:'A',family:'dec',round:3,rounds:3}],touched:[],finance:{},e1:false};
    const vus=[]; for(let c=10;c<=10;c++){ for(let k=0;k<30;k++){ m.hist[0].c=10; m.lastEvent.cycle=10; m.cycle=10+k; mgmtMediasLendemain(m).forEach(x=>vus.push(x.texte)); } }
    m.cycle=11; const premiere=mgmtMediasLendemain(m).length>0&&vus.some(t=>/première fois|Première soirée/.test(t));
    /* une soirée après une soirée déjà menée par une femme : plus de pionnière */
    m.hist=[trace(8,A,B),trace(10,A,B)]; m.lastEvent.cycle=10; m.cycle=11;
    const seconde=mgmtMediasLendemain(m).some(x=>/première fois|Première soirée/.test(x.texte));
    return {premiere,seconde};`);
  assert.ok(r.premiere); assert.equal(r.seconde,false,'la première fois n’a lieu qu’une fois');
});

test('T3 rencontres — la guerre de l’année : deux Violents heureux qui vont au bout', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}${AVEC_VOIX}
    voix({[X.id]:'le-violent-heureux',[Y.id]:'le-violent-heureux'});
    const tr=(family,round)=>({c:10,slot:'main',rounds:3,a:{id:X.id,W:X.W,L:X.L,D:0,div:X.div},b:{id:Y.id,W:Y.W,L:Y.L,D:0,div:Y.div},winner:'A',family,round});
    m.lastEvent={cycle:10,fights:[],touched:[],finance:{},e1:false};
    const dit=h=>{ const vus=[]; for(let k=0;k<30;k++){ m.cycle=10+k; m.hist=[h]; mgmtMediasLendemain(m).forEach(x=>vus.push(x.texte)); } return vus.some(t=>/guerre/.test(t)); };
    const long=dit(tr('dec',3)), court=dit(tr('ko',1));
    voix({[X.id]:'le-violent-heureux',[Y.id]:'le-metronome'}); const seul=dit(tr('dec',3));
    return {long,court,seul};`);
  assert.ok(r.long); assert.equal(r.court,false,'un KO au premier round n’est pas une guerre'); assert.equal(r.seul,false,'il faut deux Violents heureux');
});
