"use strict";
/* Lot 5 H10 (contrat §5 n° 1, 2, 6 et §6) : la mémoire des affrontements.
   Tout se lit dans m.hist ; rien n'est stocké. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
function result(win,code){ return JSON.parse(win.eval(`JSON.stringify((function(){${code}})())`)); }
const NEUVE=`setSeed(9); const m=mgmtDefault(); mgmtNewRoster(m); mgmtExteriorEnsure(m); mgmtNewPile(m); G={theme:'dark',mgmt:m,screen:'mgmt_bureau'};
  m.facts=[]; m.hist=[]; m.cycle=10;
  const libres=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o)); const [X,Y,Z]=libres;
  /* le perdant a le meilleur bilan : le favori écrasé (H10 : défaite humiliante = finish au 1er round + bilan meilleur chez le perdant) */
  const combat=(c,g,p,family,round,gW,pW,pL)=>m.hist.push({c,slot:'main',rounds:3,a:{id:g.id,W:gW||5,L:pL===undefined?2:pL,D:0},b:{id:p.id,W:pW||8,L:0,D:0},winner:'A',family,round});`;

test('H10 — une défaite humiliante (KO ou soumission au premier round, le favori écrasé) fait une rivalité ; revanche due', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    combat(9,X,Y,'ko',1);
    const riv=mgmtRivalites(m); const avant=JSON.stringify(m.facts);
    mgmtRivalites(m);
    return {riv,x:X.id,y:Y.id,immuable:avant===JSON.stringify(m.facts)};
  `);
  assert.equal(r.riv.length,1); assert.equal(r.riv[0].k,'rivalite');
  assert.equal(r.riv[0].a,r.y,'le perdant demande la revanche'); assert.equal(r.riv[0].b,r.x); assert.ok(r.immuable,'rien n’est stocké');
});

test('H10 — pas de rivalité pour une décision, un finish tardif, un nul ; la revanche jouée éteint la rivalité', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    combat(9,X,Y,'dec',3); const dec=mgmtRivalites(m).length;
    m.hist=[]; combat(9,X,Y,'ko',2); const tard=mgmtRivalites(m).length;
    m.hist=[]; m.hist.push({c:9,slot:'main',rounds:3,a:{id:X.id,W:8,L:0,D:0},b:{id:Y.id,W:5,L:2,D:0},winner:'A',family:'ko',round:1}); const normal=mgmtRivalites(m).length;
    m.hist=[]; m.hist.push({c:9,slot:'main',rounds:3,a:{id:X.id,W:5,L:0,D:0},b:{id:Y.id,W:5,L:1,D:0},winner:'D',family:'draw',round:3}); const nul=mgmtRivalites(m).length;
    m.hist=[]; combat(9,X,Y,'sub',1); const sub=mgmtRivalites(m).length;
    /* la revanche : Y gagne par décision → plus une rivalité, une trilogie à jouer */
    m.hist.push({c:10,slot:'main',rounds:3,a:{id:Y.id,W:5,L:1,D:0},b:{id:X.id,W:6,L:0,D:0},winner:'A',family:'dec',round:3});
    const apres=mgmtRivalites(m);
    return {dec,tard,normal,nul,sub,apres};
  `);
  assert.equal(r.dec,0); assert.equal(r.tard,0,'un finish au 2e round n’humilie pas'); assert.equal(r.normal,0,'battre un adversaire au meilleur bilan n’est pas humiliant à l’envers'); assert.equal(r.nul,0); assert.equal(r.sub,1);
  assert.equal(r.apres.length,1); assert.equal(r.apres[0].k,'trilogie','la revanche jouée remplace la rivalité par une trilogie');
});

test('H10 — la trilogie : une victoire partout, le troisième combat est réclamé par celui qui vient de perdre ; elle se clôt au troisième', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    combat(7,X,Y,'dec',3); combat(9,Y,X,'dec',3);
    const t=mgmtRivalites(m);
    combat(10,X,Y,'dec',3);
    return {t,apres:mgmtRivalites(m).length,x:X.id,y:Y.id};
  `);
  assert.equal(r.t.length,1); assert.equal(r.t[0].k,'trilogie'); assert.equal(r.t[0].a,r.x,'Y a gagné le dernier : X le réclame'); assert.equal(r.t[0].b,r.y);
  assert.equal(r.apres,0,'trois combats : la trilogie est jouée');
});

test('H10 — une rivalité s’éteint avec le temps ou si l’un des deux part', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    combat(9,X,Y,'ko',1); const vive=mgmtRivalites(m).length;
    m.cycle=9+MGMT_RIVALITE_CYCLES+1; const vieille=mgmtRivalites(m).length;
    m.cycle=10; Y.retired='medical'; const parti=mgmtRivalites(m).length;
    return {vive,vieille,parti};
  `);
  assert.equal(r.vive,1); assert.equal(r.vieille,0); assert.equal(r.parti,0);
});

test('H10 — la défaite humiliante impose la demande de revanche à coup sûr, la trilogie le troisième combat', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    combat(9,X,Y,'ko',1);
    const imp=mgmtDemandesImposees(m);
    const fait=mgmtDemandesOuvreCycle(m);
    const encore=mgmtDemandesOuvreCycle(m);
    m.facts=[]; m.hist=[]; combat(8,X,Y,'dec',3); combat(9,Y,X,'dec',3); m.cycle=10;
    const trilogie=mgmtDemandesOuvreCycle(m);
    return {imp,fait,encoreMeme:encore&&encore.a===Y.id&&encore.want==='revanche',x:X.id,y:Y.id,trilogie,valide:(function(){ const c=JSON.parse(JSON.stringify(m)); c.hist=[]; return validateMgmt(c); })()};
  `);
  assert.deepEqual(r.imp,[{a:r.y,want:'revanche',target:r.x}]);
  assert.equal(r.fait.a,r.y); assert.equal(r.fait.want,'revanche'); assert.equal(r.fait.target,r.x);
  assert.equal(r.encoreMeme,false,'la même demande ne se répète pas tant qu’elle est ouverte');
  assert.equal(r.trilogie.want,'trilogie'); assert.equal(r.trilogie.a,r.x); assert.equal(r.trilogie.target,r.y);
  assert.ok(r.valide,'la porte de sauvegarde accepte la demande « trilogie »');
});

test('H10 — donner la revanche : promettre pose une promesse tenue quand le combat se joue ; la refuser pèse', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    combat(9,X,Y,'ko',1); const fait=mgmtDemandesOuvreCycle(m); const i=m.facts.indexOf(fait);
    mgmtRepondreDemande(m,i,'promettre');
    const enCours=mgmtPromesses(m,Y)[0].etat;
    m.hist.push({c:11,slot:'main',rounds:3,a:{id:Y.id,W:5,L:1,D:0},b:{id:X.id,W:6,L:0,D:0},winner:'A',family:'dec',round:3}); m.cycle=11;
    const tenue=mgmtPromesses(m,Y)[0].etat;
    const m2=m; m2.facts=[]; m2.hist=[]; m2.cycle=10; combat(9,X,Y,'ko',1); const f2=mgmtDemandesOuvreCycle(m2); const j=m2.facts.indexOf(f2);
    const chargeAvant=mgmtVieCharge(m2,Y,10); mgmtRepondreDemande(m2,j,'refuser'); const chargeApres=mgmtVieCharge(m2,Y,10);
    return {enCours,tenue,refus:chargeApres-chargeAvant};
  `);
  assert.equal(r.enCours,'en cours'); assert.equal(r.tenue,'tenue','la revanche jouée tient la promesse'); assert.equal(r.refus,10,'refuser la revanche pèse sur lui');
});

test('H10 — le tueur de hype : un combattant bat un invaincu de cinq victoires ou plus', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    m.hist.push({c:9,slot:'main',rounds:3,a:{id:X.id,W:12,L:6,D:0},b:{id:Y.id,W:6,L:0,D:0},winner:'A',family:'dec',round:3});
    const t=mgmtTueursDeHype(m,9);
    m.hist=[]; m.hist.push({c:9,slot:'main',rounds:3,a:{id:X.id,W:12,L:6,D:0},b:{id:Y.id,W:3,L:0,D:0},winner:'A',family:'dec',round:3});
    const peu=mgmtTueursDeHype(m,9).length;
    m.hist=[]; m.hist.push({c:9,slot:'main',rounds:3,a:{id:X.id,W:12,L:6,D:0},b:{id:Y.id,W:6,L:0,D:0},winner:'B',family:'dec',round:3});
    const inverse=mgmtTueursDeHype(m,9).length;
    return {t,x:X.id,y:Y.id,peu,inverse};
  `);
  assert.deepEqual(r.t,[{gagnant:r.x,perdant:r.y,c:9}]); assert.equal(r.peu,0,'moins de cinq victoires : pas une hype'); assert.equal(r.inverse,0,'l’invaincu qui gagne n’est pas tué');
});

test('H10 — la semaine, le fil et la fiche racontent la rivalité ; tout est échappé ; une ancienne partie ne montre rien', () => {
  const win=newGameWindow();
  const r=result(win,`${NEUVE}
    X.name='<b>'+X.name; combat(9,X,Y,'ko',1); m.pile=[];
    const lignes=mgmtRivalitesLignes(m);
    const semaine=SCREENS.mgmt_bureau(); const fil=mgmtFilLignes(m);
    MGMT_FICHE={id:Y.id,retour:'mgmt_bureau',cursor:0}; G.screen='mgmt_fiche'; const fiche=scr_mgmt_fiche();
    const ancien=mgmtDefaultAvantH4(); mgmtNewRoster(ancien); ancien.hist=[{c:1,slot:'main',rounds:3,a:{id:ancien.roster[0].id,W:5,L:0,D:0},b:{id:ancien.roster[1].id,W:5,L:1,D:0},winner:'A',family:'ko',round:1}]; ancien.cycle=2;
    /* le favori écrasé était invaincu de 8 victoires : la même scène est aussi un tueur de hype */
    return {n:lignes.filter(l=>l.text.includes('revanche due')).length,hype:lignes.some(l=>l.text.includes('invaincu')),texte:lignes[0].text.includes('revanche due'),semaine:semaine.includes('data-type="rivalite"')&&semaine.includes('revanche due'),
      brut:semaine.includes('<b>'+X.name.slice(3)),fil:fil.some(x=>x.includes('revanche due')),rivaux:fiche.includes('Ses rivaux')&&fiche.includes('Revanche due'),
      fcheBrut:fiche.includes('<b>'),ancien:mgmtFicheRivaux(ancien,ancien.roster[0])};
  `);
  assert.equal(r.n,1); assert.ok(r.hype); assert.ok(r.texte); assert.ok(r.semaine); assert.ok(r.fil); assert.ok(r.rivaux);
  assert.equal(r.fcheBrut,false,'rien n’est injecté sans esc()'); assert.equal(r.ancien,'');
});

test('H10 — une vraie soirée : un KO au premier round crée la rivalité et la demande du lendemain', () => {
  const win=newGameWindow();
  const r=result(win,`setSeed(11); const m=mgmtDefault(); mgmtNewRoster(m); mgmtExteriorEnsure(m); mgmtNewPile(m); G={theme:'dark',mgmt:m,screen:'mgmt_bureau'};
    let trouve=null;
    for(let c=0;c<25&&!trouve;c++){
      const pool=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o)); const pris=new Set(); const paires=[];
      for(const a of pool){ if(pris.has(a.id)) continue; const b=pool.find(o=>o.id!==a.id&&!pris.has(o.id)&&o.div===a.div); if(b){ pris.add(a.id); pris.add(b.id); paires.push([a,b]); } if(paires.length===12) break; }
      if(paires.length<12){ mgmtNewPile(m); continue; }
      m.card.main=paires.slice(0,5).map(p=>({a:p[0].id,b:p[1].id,cycle:m.cycle,slot:'main'}));
      m.card.prelims=paires.slice(5,12).map(p=>({a:p[0].id,b:p[1].id,cycle:m.cycle,slot:'prelim'}));
      mgmtRunEvent(m); mgmtNewPile(m);
      const riv=mgmtRivalites(m).filter(x=>x.k==='rivalite'); if(riv.length) trouve=riv[0];
    }
    const faits=m.facts.filter(x=>x.k==='demande'&&x.want==='revanche');
    return {trouve:!!trouve,imposee:trouve?mgmtDemandesImposees(m).some(d=>d.a===trouve.a&&d.target===trouve.b):null,
      demande:trouve?faits.some(x=>x.a===trouve.a&&x.target===trouve.b):null,valide:validateMgmt(JSON.parse(JSON.stringify(m)))};
  `);
  assert.ok(r.trouve,'une soirée jouée produit une rivalité dans les vingt-cinq premiers cycles'); assert.ok(r.demande||r.imposee); assert.ok(r.valide);
});
