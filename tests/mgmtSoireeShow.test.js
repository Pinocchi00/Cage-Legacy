"use strict";
/* Brief du 06/10/2026, lot 11 : la soirée et le combat — le déroulé en cinq moments, l'avant-combat, les cinq caméras, la salle
   qui se remplit, les coups nommés, le commentaire et les coins, la décision. Critères d'acceptation du brief, un test chacun. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const jouer=require('./helpers/jouerSoirees');
const touche=(win,key)=>win.eval(`keysHandle({key:${JSON.stringify(key)},preventDefault(){}})`);
const res=(win,code)=>JSON.parse(win.eval(`JSON.stringify((function(){${code}})())`));
const texte=win=>win.eval(`document.getElementById('app').textContent`);
/* Les boutons s'écrivent en capitales par la feuille de style : on lit le texte comme on le voit. */
const maj=win=>texte(win).toUpperCase();
function neuve(seed,n){
  const win=newGameWindow({runMain:true});
  win.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(${seed||7}); CL.mgmtEnter(1);`);
  jouer(win,n===undefined?4:n,{titre:true});
  win.eval(`MGMT_SOIREE.index=0; MGMT_SOIREE_UI.focus=null; MGMT_SOIREE_UI.commence=null; CL.go('mgmt_soiree');`);
  return win;
}
/* Une fausse toile qui note le texte dessiné : le dessin se vérifie sans pixel. */
function toile(win){
  win.eval(`window.__toile=function(){ const log=[]; const mem={};
    const ctx=new Proxy(mem,{get(t,k){ if(k==='measureText') return s=>({width:String(s).length*12}); if(k==='createRadialGradient'||k==='createLinearGradient') return ()=>({addColorStop(){}});
      if(k in t) return t[k]; return function(...a){ if(k==='fillText'||k==='strokeText') log.push(String(a[0])); }; },set(t,k,v){ t[k]=v; return true; }});
    const cv={width:1920,height:1080,clientWidth:1920,getBoundingClientRect(){ return {width:1920}; },getContext(){ return ctx; }};
    return {cv,log}; };`);
}

test('Le programme — les préliminaires d\'abord, la carte principale en remontant, le combat principal en dernier', () => {
  const win=neuve(7);
  const r=res(win,`const m=G.mgmt, p=mgmtSoireeProgramme(m);
    return {n:p.length,slots:p.map(x=>x.slot),noms:p.map(x=>x.etiquette),hist:p.map(x=>x.h),ids:p.map(x=>[x.a.id,x.b.id]),fights:m.lastEvent.fights.map(f=>[f.a,f.b]),titre:p.map(x=>x.titre)};`);
  assert.equal(r.n,9);
  const nPre=r.slots.filter(s=>s==='prelim').length;
  assert.deepEqual(r.slots,[...Array(nPre).fill('prelim'),...Array(9-nPre).fill('main')],'les préliminaires, puis la carte principale');
  assert.deepEqual(r.noms.slice(nPre),['COMBAT 5','COMBAT 4','COMBAT 3','CO-PRINCIPAL','COMBAT PRINCIPAL'],'la carte principale en remontant, le principal en dernier');
  assert.equal(r.noms[0],'PRÉLIM 1');
  assert.deepEqual(r.ids,r.fights,'l\'ordre est celui de la soirée calculée');
  for(let i=1;i<r.hist.length;i++) assert.equal(r.hist[i],r.hist[i-1]+1,'chaque combat est la trace qui suit celle d\'avant');
});

test('La soirée en cinq moments — ouverture, entre-deux, attente du principal, avant-combat, fin', () => {
  const win=neuve(7);
  assert.equal(win.eval(`G.screen`),'mgmt_soiree');
  assert.ok(maj(win).includes('COMMENCER LA SOIRÉE')); assert.ok(maj(win).includes('PRÉLIMINAIRES')); assert.ok(maj(win).includes('CARTE PRINCIPALE'));
  assert.ok(texte(win).includes('La carte de Leïla')); assert.ok(/prêts/.test(texte(win)));
  assert.equal(win.eval(`document.querySelectorAll('.mf-so-lg').length`),9,'les neuf combats de la carte');
  touche(win,'Enter');
  assert.ok(maj(win).includes('REGARDER LE COMBAT')); assert.ok(maj(win).includes('PASSER')); assert.ok(maj(win).includes('AVANT-COMBAT'));
  assert.equal(win.eval(`document.querySelectorAll('.mf-so-tag').length`),9,'les neuf pastilles');
  touche(win,'f'); assert.equal(win.eval(`G.screen`),'mgmt_soiree_avant'); assert.ok(maj(win).includes('COMMENT ÇA PEUT SE PASSER'));
  assert.ok(maj(win).includes('CE QUE TU AS VU')); assert.ok(maj(win).includes('CE QUE TU NE SAIS PAS')); assert.ok(maj(win).includes('SON DERNIER COMBAT'));
  touche(win,'Escape'); assert.equal(win.eval(`G.screen`),'mgmt_soiree');
  for(let i=0;i<8;i++) touche(win,'p');
  assert.equal(win.eval(`MGMT_SOIREE.index`),8); assert.ok(maj(win).includes('COMBAT PRINCIPAL'),'l\'attente du principal');
  touche(win,'p'); assert.equal(win.eval(`MGMT_SOIREE.index`),9);
  assert.ok(maj(win).includes('VOIR LES RÉSULTATS')); assert.ok(texte(win).includes('Les sections sont rouvertes')); assert.ok(maj(win).includes('JOUÉ'));
});

test('Pendant la soirée, aucune section de la barre ne s\'ouvre ; elles se rouvrent à la fin', () => {
  const win=neuve(7);
  const sections=`[...document.querySelectorAll('.mf-barre-item[data-section]')].filter(b=>!['options','menu'].includes(b.dataset.section))`;
  const etat=()=>res(win,`const s=${sections}; return {n:s.length,ouvertes:s.filter(b=>!b.disabled&&!b.classList.contains('grise')).length};`);
  assert.equal(etat().n,11); assert.equal(etat().ouvertes,0,'ouverture : grisée');
  touche(win,'Enter'); assert.equal(etat().ouvertes,0,'entre-deux : grisée');
  touche(win,'f'); assert.equal(etat().ouvertes,0,'avant-combat : grisée'); touche(win,'Escape');
  win.eval(`CL.mgmtSoRegarder()`); assert.equal(win.eval(`document.querySelectorAll('.mf-barre').length`),0,'le combat : plein écran, pas de barre');
  win.eval(`CL.mgmtCbPasser(); CL.mgmtCbRetour()`); assert.equal(win.eval(`G.screen`),'mgmt_soiree'); assert.equal(etat().ouvertes,0,'après un combat vu : grisée');
  for(let i=0;i<8;i++) touche(win,'p');
  touche(win,'p'); assert.equal(etat().ouvertes,11,'la fin de soirée rouvre les sections');
  /* A et E passent d'une section à l'autre quand la barre est ouverte. */
  const avant=win.eval(`G.screen`);
  win.eval(`document.dispatchEvent(new KeyboardEvent('keydown',{key:'e',bubbles:true}))`);
  assert.notEqual(win.eval(`G.screen`),avant,'E : la section d\'après');
});

test('Regarder, passer, changer de caméra, revoir : même résultat, même trace, la partie n\'est pas touchée', () => {
  const win=neuve(7);
  touche(win,'Enter');
  const avant=win.eval(`JSON.stringify(G.mgmt)+'|'+SEED`);
  const trace=win.eval(`JSON.stringify(mgmtSoireeProgramme(G.mgmt)[0].trace)`);
  win.eval(`CL.mgmtSoRegarder()`);
  assert.equal(win.eval(`G.screen`),'mgmt_combat');
  for(let i=0;i<30;i++) win.eval(`mgmtCombatAvancer(0.5)`);
  for(const p of ['plafond','large','coinA','coinB','cable']){ win.eval(`CL.mgmtCbCamera('${p}')`); win.eval(`mgmtCombatAvancer(0.5)`); }
  win.eval(`CL.mgmtCbVitesse(4); CL.mgmtCbPause(); CL.mgmtCbPause();`);
  while(win.eval(`MGMT_COMBAT.mode`)==='fight') win.eval(`mgmtCombatAvancer(0.5)`);
  win.eval(`CL.mgmtCbRevoir()`); assert.equal(win.eval(`MGMT_COMBAT.mode`),'fight'); assert.equal(win.eval(`MGMT_COMBAT.d`),0);
  win.eval(`CL.mgmtCbPasser()`); assert.equal(win.eval(`MGMT_COMBAT.mode`),'dec');
  assert.equal(win.eval(`JSON.stringify(G.mgmt)+'|'+SEED`),avant,'rien n\'a bougé dans la partie ni dans la RNG');
  assert.equal(win.eval(`JSON.stringify(mgmtSoireeProgramme(G.mgmt)[0].trace)`),trace,'la trace est la même');
  win.eval(`CL.mgmtCbRetour()`); assert.equal(win.eval(`G.screen`),'mgmt_soiree'); assert.equal(win.eval(`MGMT_SOIREE.index`),1,'la soirée avance d\'un combat');
  /* Le même combat, deux fois : les mêmes échanges, la même voix, les mêmes coins. */
  const a=res(win,`const t=mgmtSoireeProgramme(G.mgmt)[0].trace, mk=()=>{ const r=mgmtReplayFight(t); const S=areneConstruire(r,{a:t.a.name,b:t.b.name},{echelle:MGMT_COMBAT_ECHELLE,pause:MGMT_COMBAT_PAUSE}); areneCoupsConstruire(S); return JSON.stringify([S.coups,S.voix,S.coins,S.dureeAffichage]); }; return mk()===mk();`);
  assert.equal(a,true);
});

test('Le combat — aucune jauge, aucune barre de moments clés, aucun indicateur de domination', () => {
  const win=neuve(7); touche(win,'Enter'); win.eval(`CL.mgmtSoRegarder()`);
  const html=win.eval(`document.getElementById('app').innerHTML`);
  for(const mot of ['Moments clés','arene-fil','momentum','jauge','gauge','domination']) assert.ok(!html.includes(mot),'pas de '+mot);
  const cles=res(win,`return Object.keys(mgmtCombatCx());`);
  for(const k of cles) assert.ok(!/momentum|jauge|gauge|domin|moments?|score|avantage/i.test(k),'champ du dessin '+k);
  assert.equal(win.eval(`MGMT_COMBAT.session.momentsCles===undefined`),true,'la liste de moments clés n\'est pas bâtie');
  assert.ok(win.eval(`document.getElementById('mc-cv')!==null`)); assert.equal(win.eval(`document.querySelectorAll('.mf-cb-p').length`),8,'3 vitesses et 5 caméras');
});

test('Les touches du combat : Espace, V, C, P, R, Entrée', () => {
  const win=neuve(7); touche(win,'Enter'); win.eval(`CL.mgmtSoRegarder()`);
  touche(win,' '); assert.equal(win.eval(`MGMT_COMBAT.pause`),true); assert.ok(win.eval(`document.getElementById('mc-pause').textContent`)==='Reprendre'); touche(win,' '); assert.equal(win.eval(`MGMT_COMBAT.pause`),false);
  const vits=[]; for(let i=0;i<3;i++){ touche(win,'v'); vits.push(win.eval(`MGMT_COMBAT.vitesse`)); } assert.deepEqual(vits,[2,4,1]);
  const cams=[]; for(let i=0;i<5;i++){ touche(win,'c'); cams.push(win.eval(`MGMT_COMBAT.plan`)); } assert.deepEqual(cams,['plafond','large','coinA','coinB','cable']);
  touche(win,'Enter'); assert.equal(win.eval(`G.screen`),'mgmt_combat','Entrée ne quitte pas un combat en cours');
  touche(win,'r'); assert.equal(win.eval(`MGMT_COMBAT.mode`),'fight','R ne revoit qu\'après la décision');
  touche(win,'p'); assert.equal(win.eval(`MGMT_COMBAT.mode`),'dec'); assert.ok(texte(win).includes('Revoir le combat')); assert.ok(texte(win).includes('Revenir à la soirée'));
  touche(win,'r'); assert.equal(win.eval(`MGMT_COMBAT.mode`),'fight'); assert.equal(win.eval(`MGMT_COMBAT.d`),0);
  touche(win,'p'); touche(win,'Enter'); assert.equal(win.eval(`G.screen`),'mgmt_soiree'); assert.equal(win.eval(`MGMT_SOIREE.index`),1);
});

test('L\'avant-combat n\'affiche rien qui dépende du niveau stocké, du résultat de la soirée, ni du vainqueur probable', () => {
  const win=neuve(7,6);
  const base=res(win,`const m=G.mgmt, n=m.lastEvent.fights.length; return Array.from({length:n},(_,i)=>mgmtAvantCombat(m,i));`);
  assert.ok(base.length===9&&base.every(x=>x));
  /* Le niveau stocké bouge, le bilan d'aujourd'hui et le résultat de ce combat et des suivants sont renversés : l'avant-combat ne change pas. */
  const apres=res(win,`const m=G.mgmt; const h0=mgmtSoireeProgramme(m)[0].h;
    const ce_soir=new Set(m.hist.slice(h0).flatMap(t=>[t.a.id,t.b.id]));
    for(const f of m.roster){ f.niv=(f.niv||0)>0.5?0.01:0.99; if(ce_soir.has(f.id)){ const w=f.W; f.W=f.L; f.L=w; } }
    for(let i=h0;i<m.hist.length;i++){ const t=m.hist[i]; t.winner=t.winner==='A'?'B':'A'; t.family=t.family==='dec'?'ko':'dec'; t.round=t.round===1?2:1; }
    for(const x of m.facts) if(x&&x.k==='title_fight'&&x.fight>=h0) x.fight=-1;
    return Array.from({length:m.lastEvent.fights.length},(_,i)=>mgmtAvantCombat(m,i));`);
  assert.deepEqual(apres,base,'ni le niveau stocké, ni ce qui s\'est passé ce soir ne se lit dans l\'avant-combat');
  const s=JSON.stringify(base);
  for(const mot of ['gagnant','vainqueur','favori','probable','pronostic','victoire probable']) assert.ok(!s.toLowerCase().includes(mot),'pas de '+mot);
});

test('L\'avant-combat — une zone jamais observée est dite inconnue, ce qui est vu vient des combats passés', () => {
  const win=neuve(7,12);
  const r=res(win,`const m=G.mgmt, n=m.lastEvent.fights.length, out=[];
    for(let i=0;i<n;i++){ const a=mgmtAvantCombat(m,i); out.push({vus:[a.a.vus,a.b.vus],zones:a.zones.map(z=>[z.id,z.inconnu]),
      inc:[a.a.inconnus,a.b.inconnus],lignes:[a.a.lignes.length,a.b.lignes.length],profil:[a.a.profil,a.b.profil]}); }
    return out;`);
  const vu=r.filter(x=>x.vus[0]>0||x.vus[1]>0);
  assert.ok(vu.length>0,'après quelques soirées, des combattants ont été vus');
  for(const x of r){
    for(const k of [0,1]){
      if(x.vus[k]===0){ assert.equal(x.lignes[k],0,'jamais vu : rien n\'est dit de lui'); assert.equal(x.profil[k],'PAS ENCORE VU'); assert.ok(x.inc[k].length>0); }
      else assert.ok(x.lignes[k]>0&&x.lignes[k]<=3);
    }
    if(x.vus[0]===0&&x.vus[1]===0) assert.ok(x.zones.every(z=>z[1]),'aucun des deux vu : toutes les zones sont inconnues');
  }
});

test('La salle — la part remplie au combat principal est celle du lot 8, plus basse au premier combat', () => {
  const win=neuve(7);
  const r=res(win,`const m=G.mgmt, n=m.lastEvent.fights.length, taux=m.lastEvent.finance.taux;
    return {taux,premier:mgmtSoireeSalle(m,0).part,principal:mgmtSoireeSalle(m,n-1).part,prog:[0,1,2,3,4,5,6,7,8].map(i=>mgmtSoireeSalle(m,i).part),
      room0:areneSalleRoom(taux,0).part,room1:areneSalleRoom(taux,1).part,fin:m.lastEvent.finance.spectateurs/m.lastEvent.finance.capacite};`);
  assert.ok(r.taux>0&&r.taux<=1); assert.ok(Math.abs(r.taux-r.fin)<0.001,'le taux est celui de la billetterie du lot 8');
  assert.ok(Math.abs(r.principal-r.taux)<1e-9,'au principal, la salle est remplie du taux calculé'); assert.ok(r.premier<r.principal,'plus basse au premier combat');
  for(let i=1;i<r.prog.length;i++) assert.ok(r.prog[i]>=r.prog[i-1]-1e-9,'elle se remplit au fil de la soirée');
  assert.ok(Math.abs(r.room1-r.taux)<1e-9); assert.ok(r.room0<r.room1);
  /* Le combat principal montre cette part : la salle du dessin est celle du taux. */
  win.eval(`MGMT_SOIREE.index=8; MGMT_SOIREE_UI.commence=G.mgmt.lastEvent.cycle; CL.mgmtSoRegarder()`);
  assert.ok(Math.abs(win.eval(`MGMT_COMBAT.room.part`)-r.taux)<1e-9,'la salle montrée au principal est celle du lot 8');
  assert.equal(win.eval(`MGMT_COMBAT.salle.prog`),1);
  /* Le haut est bâché quand même la soirée la plus pleine ne le remplit pas. */
  assert.equal(win.eval(`areneSalleRoom(0.2,1).closed`),true); assert.equal(win.eval(`areneSalleRoom(0.9,1).closed`),false);
  assert.equal(win.eval(`areneSalleRoom(0.2,1).occ.length`),15);
});

test('Le temps de combat — un round de 300 s tient en une quarantaine de secondes ; l\'échelle 1 reste celle de l\'arène d\'origine', () => {
  const win=neuve(7); touche(win,'Enter');
  const r=res(win,`const t=mgmtSoireeProgramme(G.mgmt)[0].trace, rr=mgmtReplayFight(t);
    const a=areneConstruire(rr,{a:'A',b:'B'}), b=areneConstruire(rr,{a:'A',b:'B'},{echelle:7,pause:3.4});
    return {a:[a.echelle,a.roundLen,a.dureeCombat],b:[b.echelle,b.roundLen,b.dureeCombat,b.pauseS],h:areneMoment(b,b.dureeCombat*0.5).horloge,rounds:t.rounds};`);
  assert.deepEqual(r.a.slice(0,2),[1,300]); assert.ok(Math.abs(r.b[1]-300/7)<1e-9); assert.ok(r.b[2]<r.a[2]/6.5,'le combat compressé est sept fois plus court');
  assert.equal(r.b[3],3.4); assert.ok(r.h>0&&r.h<=300);
});

test('Les coups — le nom du coup est celui que le moteur donne déjà (byType), les gestes ont leur mot', () => {
  const win=neuve(7); touche(win,'Enter'); win.eval(`CL.mgmtSoRegarder()`);
  const r=res(win,`const S=MGMT_COMBAT.session, noms=MGMT_COUP_NOMS, cles=Object.keys(S.res.stats.A.byType);
    const typed=S.coups.filter(c=>c.type), gestes=S.coups.filter(c=>!c.type);
    return {n:S.coups.length,typed:typed.length,ok:typed.every(c=>cles.includes(c.type)&&c.k===noms[c.type]),gestes:[...new Set(gestes.map(c=>c.k))],tri:S.coups.every((c,i)=>i===0||c.t>=S.coups[i-1].t),
      cles:cles.length,tout:cles.every(k=>noms[k]),rs:[...new Set(S.coups.map(c=>c.r))].sort(),dans:S.coups.every(c=>c.t>=0&&c.t<=S.finT),
      phases:typed.every(c=>MGMT_COUP_PHASES.debout.includes(c.type)||MGMT_COUP_PHASES.clinch.includes(c.type)||MGMT_COUP_PHASES.sol.includes(c.type))};`);
  assert.ok(r.n>10&&r.typed>5); assert.ok(r.ok,'chaque étiquette est le libellé d\'une clé de byType'); assert.ok(r.tri); assert.ok(r.dans); assert.ok(r.phases); assert.equal(r.cles,12); assert.ok(r.tout);
  for(const g of r.gestes) assert.ok(['AMENÉE AU SOL','IL LE RETOURNE','IL SE RELÈVE'].includes(g),g);
});

test('Le commentaire et les coins — datés dans le combat, jamais l\'un sur l\'autre, textes marqués relu:false', () => {
  const win=neuve(7); touche(win,'Enter'); win.eval(`CL.mgmtSoRegarder()`);
  const r=res(win,`const S=MGMT_COMBAT.session;
    return {voix:S.voix.length,coins:S.coins.length,niv:[...new Set(S.voix.map(v=>v.l))].sort(),tri:S.voix.every((v,i)=>i===0||v.t>=S.voix[i-1].t),ecart:S.voix.every((v,i)=>i===0||v.t-S.voix[i-1].t>=1.5),
      coinsOk:['A','B'].every(w=>S.coins.filter(c=>c.w===w).every((c,i,l)=>i===0||c.t-l[i-1].t>=ARENE_COIN_ECART-1e-9)),
      vide:S.voix.some(v=>!v.salle&&(!v.a||/\\{|\\}/.test(v.a))),relu:[MGMT_COMMENTAIRE.relu,MGMT_COINS.relu,MGMT_SOIREE_TEXTES.relu,MGMT_AVANT_TEXTES.relu,MGMT_SOIREE_ECRAN.relu],
      salle:S.voix[0].salle===true};`);
  assert.ok(r.voix>=6); assert.ok(r.coins>=3); assert.ok(r.tri); assert.ok(r.ecart); assert.ok(r.coinsOk); assert.equal(r.vide,false,'aucun jeton de modèle ne reste dans une réplique');
  assert.deepEqual(r.relu,[false,false,false,false,false],'tous les textes d\'auteur écrits par l\'agent sont marqués relu:false'); assert.ok(r.salle);
});

test('Masquer le commentaire, les coins ou le nom des coups les retire de l\'image sans changer le combat', () => {
  const win=neuve(7); toile(win); touche(win,'Enter'); win.eval(`CL.mgmtSoRegarder()`);
  win.eval(`cancelAnimationFrame(MGMT_COMBAT.raf); MGMT_COMBAT.raf=0; window.__T=__toile(); MGMT_COMBAT.vue=areneSalleCreer(__T.cv);`);
  /* Un instant où tout parle : une voix, un coin, un échange nommé. */
  const trouve=win.eval(`(function(){ const C=MGMT_COMBAT; for(let d=3.5;d<C.session.dureeAffichage;d+=0.1){ C.d=d; const cx=mgmtCombatCx(); if(cx.voix&&cx.voix.a&&cx.coins.length&&cx.etat.t>=0&&C.session.coups.some(c=>c.k&&c.r!==3&&cx.t-c.t>=0.2&&cx.t-c.t<0.8)) return d; } return -1; })()`);
  assert.ok(trouve>0,'un instant où tout parle existe');
  const dessine=reglage=>res(win,`const C=MGMT_COMBAT; Object.assign(MGMT_COMBAT_REGLAGES,MGMT_COMBAT_REGLAGES_ORIGINE,${JSON.stringify(reglage)}); C.d=${trouve}; __T.log.length=0; C.vue.dessiner(mgmtCombatCx()); const l=__T.log.slice(); Object.assign(MGMT_COMBAT_REGLAGES,MGMT_COMBAT_REGLAGES_ORIGINE); return l;`);
  const avant=win.eval(`JSON.stringify(MGMT_COMBAT.session.res)+'|'+JSON.stringify(G.mgmt)`);
  const tout=dessine({}), sansVoix=dessine({commentaire:false}), sansCoins=dessine({coins:false}), sansNoms=dessine({noms:false});
  assert.ok(tout.includes('COMMENTAIRE')); assert.ok(tout.some(x=>/^LE COIN DE/.test(x))); assert.ok(tout.some(x=>win.eval(`Object.values(MGMT_COUP_NOMS).includes(${JSON.stringify(x)})`)),'un nom de coup à l\'image');
  assert.ok(!sansVoix.includes('COMMENTAIRE'),'le commentaire disparaît'); assert.ok(sansVoix.some(x=>/^LE COIN DE/.test(x)),'mais pas les coins');
  assert.ok(!sansCoins.some(x=>/^LE COIN DE/.test(x)),'les coins disparaissent'); assert.ok(sansCoins.includes('COMMENTAIRE'));
  assert.ok(!sansNoms.some(x=>win.eval(`Object.values(MGMT_COUP_NOMS).includes(${JSON.stringify(x)})`)),'les noms de coups disparaissent');
  assert.equal(win.eval(`JSON.stringify(MGMT_COMBAT.session.res)+'|'+JSON.stringify(G.mgmt)`),avant,'le combat n\'a pas changé');
});

test('La décision — trois cartes de juges pour une décision, une annonce pour une finition', () => {
  const win=neuve(7,8); touche(win,'Enter');
  const r=res(win,`const m=G.mgmt, out={dec:null,fin:null};
    for(const t of m.hist){ const rs=mgmtReplayFight(t); if(!rs) continue; const S=areneConstruire(rs,{a:t.a.name,b:t.b.name},{echelle:7});
      const d=areneSalleDecision(S); if(d.decision&&!out.dec) out.dec=d; if(!d.decision&&!out.fin) out.fin=d; if(out.dec&&out.fin) break; }
    return out;`);
  assert.ok(r.dec&&r.fin,'les deux sortes de fins existent dans la partie');
  assert.equal(r.dec.cartes.length,3); for(const c of r.dec.cartes){ assert.ok(/^\d+-\d+$/.test(c.score)); assert.ok(c.nom.length>0); }
  assert.ok(/^VAINQUEUR PAR DÉCISION|^MATCH NUL/.test(r.dec.titre)); assert.equal(r.fin.cartes.length,0); assert.ok(/ROUND \d+$/.test(r.fin.titre));
});

test('Revoir un combat depuis les résultats : l\'écran animé avec l\'agenda, l\'arène d\'avant sans', () => {
  const win=neuve(7,3);
  win.eval(`MGMT_SU_RE.s=0; MGMT_SU_RE.i=0; CL.go('mgmt_resultats'); CL.mgmtSuReRevoir();`);
  assert.equal(win.eval(`G.screen`),'mgmt_combat'); assert.equal(win.eval(`MGMT_COMBAT.retour`),'mgmt_resultats');
  win.eval(`CL.mgmtCbPasser(); CL.mgmtCbRetour();`); assert.equal(win.eval(`G.screen`),'mgmt_resultats');
  win.eval(`G.mgmt.cal={actif:false}; CL.go('mgmt_resultats'); CL.mgmtSuReRevoir();`);
  assert.equal(win.eval(`G.screen`),'arene_socle','une partie d\'avant l\'agenda garde l\'arène d\'origine');
});

test('Une partie d\'avant l\'agenda garde l\'ancien écran de soirée', () => {
  const win=neuve(7,1);
  win.eval(`G.mgmt.cal={actif:false}; CL.go('mgmt_soiree');`);
  assert.equal(win.eval(`document.querySelectorAll('.mgmt-fight').length>0`),true); assert.equal(win.eval(`document.querySelectorAll('.mf-so').length`),0);
  touche(win,'2'); assert.equal(win.eval(`MGMT_SOIREE.index`),1,'les touches d\'origine tiennent');
});

test('La fin de la soirée mène aux résultats ; le lendemain passe d\'abord s\'il y a des touchés', () => {
  const win=neuve(7,2);
  touche(win,'Enter'); for(let i=0;i<9;i++) touche(win,'p');
  assert.equal(win.eval(`MGMT_SOIREE.index`),9);
  const touches=win.eval(`G.mgmt.lastEvent.touched.length`);
  touche(win,'Enter');
  assert.equal(win.eval(`G.screen`),touches>0?'mgmt_lendemain':'mgmt_resultats');
});

test('L\'avant-combat de huit combats vus se calcule vite (les rejeux sont gardés)', () => {
  const win=neuve(7,10);
  const t0=Date.now(); win.eval(`for(let i=0;i<G.mgmt.lastEvent.fights.length;i++) mgmtAvantCombat(G.mgmt,i);`); const d1=Date.now()-t0;
  const t1=Date.now(); win.eval(`for(let i=0;i<G.mgmt.lastEvent.fights.length;i++) mgmtAvantCombat(G.mgmt,i);`); const d2=Date.now()-t1;
  assert.ok(d1<20000,'premier calcul '+d1+' ms'); assert.ok(d2<d1/2+50,'second calcul '+d2+' ms (mémorisé)');
});
