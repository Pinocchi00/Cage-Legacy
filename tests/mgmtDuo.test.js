"use strict";
/* ==== [ANCRE: TESTS_DUO_T1_MOTEUR] — Monde lot 19 T5 et T6 (docs/lots/DUO-T1.md) : le moteur du Duo, sans écran.
   Un monde coûte 40 à 90 s à créer : chaque test n'en crée qu'un et enchaîne ses vérifications dessus. ==== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

function creer() {
  const win = newGameWindow({ runMain: true });
  win.eval("setSeed(20261018); mgmtPasseGenerer('split',{soirees:6}); mgmtMondeVivantGenerer(G.mgmt,{soirees:6}); mgmtDuoCreer(G.mgmt,'mma-korner',{a:'Anthony',b:'François'});");
  return win;
}
const json = (win, code) => JSON.parse(win.eval(`JSON.stringify((function(){${code}})())`));

/* Avance jusqu'au draft : depuis DUO-T2 les enchères s'ouvrent d'abord ; personne ne mise, tout le monde passe. */
const AVANCER = `mgmtDuoAvancer(G.mgmt);while(G.mgmt.duo.etape==='encheres'){mgmtDuoPasser(G.mgmt);}`;

/* Joue un draft complet : le joueur dont c'est le tour place son premier combattant plaçable, l'autre répond dans la même catégorie. */
const DRAFT = `const m=G.mgmt;
  for(let i=0;i<6;i++){
    const t=m.duo.draft.tour,p=mgmtDuoPlacables(m,t)[0];
    if(!p||!mgmtDuoPlacer(m,p.id)) return 'placement '+i;
    const r=mgmtDuoDisponibles(m,m.duo.draft.tour).find(f=>f.div===p.div);
    if(!r||!mgmtDuoRepondre(m,r.id)) return 'réponse '+i;
  }
  return m.duo.etape;`;

test('Duo T1 — la création, l’avancée du temps, la caisse stable et le draft', () => {
  const win = creer();
  /* 1. la création pose m.duo et refuse ce qu'il faut refuser */
  const c = json(win, `const m=G.mgmt,d=m.duo,res={};
    res.pose={b:d.b,noms:d.noms,periode:d.periode,etape:d.etape,prochaine:d.prochaine-m.cal.jour,cartes:d.cartes.length,enchere:d.encheres};
    const sauve=m.duo; m.duo=undefined;
    res.propre=mgmtDuoCreer(m,mgmtPredecesseurOrgId(m)); res.inconnue=mgmtDuoCreer(m,'xx'); res.rien=m.duo===undefined;
    m.mondeVivant=false; res.ancien=mgmtDuoCreer(m,'mma-korner'); m.mondeVivant=true;
    res.long=mgmtDuoCreer(m,'mma-korner',{a:'  '+'x'.repeat(40)+'  ',b:''}); res.noms=m.duo.noms;
    m.duo=sauve; return res;`);
  assert.deepEqual(c.pose, { b: 'mma-korner', noms: { a: 'Anthony', b: 'François' }, periode: 91, etape: 'attente', prochaine: 91, cartes: 0, enchere: null });
  assert.deepEqual([c.propre, c.inconnue, c.rien, c.ancien, c.long], [false, false, true, false, true]);
  assert.deepEqual(c.noms, { a: 'x'.repeat(16), b: 'Joueur 2' });

  /* 2 et 16. avancer : les deux organisations jouent, la caisse des deux joueurs ne bouge pas */
  const av = json(win, `const m=G.mgmt,sous=m.orgs[m.duo.b],avant={a:m.eventsPlayed,b:sous.eventsPlayed,ta:m.treasury,tb:sous.treasury,pop:JSON.stringify([m.audiences,sous.audiences])};
    const r=mgmtDuoAvancer(m);const etapeAvancer=m.duo.etape;while(m.duo.etape==='encheres'){mgmtDuoPasser(m);}
    return {termine:r.termine,etapeAvancer,etape:m.duo.etape,jour:m.cal.jour,prochaine:m.duo.prochaine,da:m.eventsPlayed-avant.a,db:sous.eventsPlayed-avant.b,
      ta:m.treasury-avant.ta,tb:sous.treasury-avant.tb,bouge:JSON.stringify([m.audiences,sous.audiences])!==avant.pop,g:G.mgmt===m,draft:m.duo.draft.premier+'/'+m.duo.draft.attente};`);
  assert.equal(av.termine, true);
  assert.ok(['encheres', 'draft'].includes(av.etapeAvancer));
  assert.equal(av.etape, 'draft');
  assert.ok(av.jour >= av.prochaine && av.da > 0 && av.db > 0, JSON.stringify(av));
  assert.equal(av.ta, 0); assert.equal(av.tb, 0); assert.ok(av.bouge);
  assert.equal(av.g, true);
  assert.equal(av.draft, 'b/place');   // première carte : J2 place en premier

  /* 3 et 8. le draft : placer, répondre, annuler ; G.mgmt revient toujours à J1 */
  const d = json(win, `const m=G.mgmt,res={};
    const pl=mgmtDuoPlacables(m,'b'); res.nPlacables=pl.length;
    const hors=mgmtDuoDisponibles(m,'b').find(f=>!pl.some(p=>p.id===f.id)); res.refuseSansVis=hors?mgmtDuoPlacer(m,hors.id):'aucun';
    res.refuseA=mgmtDuoPlacer(m,mgmtDuoPlacables(m,'a')[0].id);   // ce n'est pas le tour de J1... l'id est de J1
    res.place=mgmtDuoPlacer(m,pl[0].id);
    const div=m.duo.draft.combats[0].div,autre=mgmtDuoDisponibles(m,'a').find(f=>f.div!==div);
    res.refuseDiv=autre?mgmtDuoRepondre(m,autre.id):'aucun';
    res.repondre=mgmtDuoRepondre(m,mgmtDuoDisponibles(m,'a').find(f=>f.div===div).id);
    res.tourApres=m.duo.draft.tour+'/'+m.duo.draft.attente;
    res.annule1=mgmtDuoAnnuler(m); res.apresA1=m.duo.draft.attente+'/'+m.duo.draft.combats[0].a;
    res.annule2=mgmtDuoAnnuler(m); res.apresA2=m.duo.draft.combats.length+'/'+m.duo.draft.tour;
    res.rien=mgmtDuoAnnuler(m);
    res.fin=(function(){${DRAFT}})();
    res.ordre=m.duo.draft.combats.map(c=>c.place).join('');
    res.pret=m.duo.etape; res.defaitPret=mgmtDuoAnnuler(m); res.apresPret=m.duo.etape+'/'+m.duo.draft.attente;
    res.g=G.mgmt===m; return res;`);
  assert.ok(d.nPlacables > 0);
  assert.notEqual(d.refuseSansVis, true);
  assert.equal(d.refuseA, false);
  assert.equal(d.place, true);
  assert.notEqual(d.refuseDiv, true);
  assert.equal(d.repondre, true);
  assert.equal(d.tourApres, 'a/place');     // celui qui vient de répondre place le suivant
  assert.equal(d.annule1, true); assert.equal(d.apresA1, 'reponse/null');
  assert.equal(d.annule2, true); assert.equal(d.apresA2, '0/b');
  assert.equal(d.rien, false);
  assert.equal(d.fin, 'pret');
  assert.equal(d.ordre, 'bababa');          // P1 place, P2 répond ; P2 place, P1 répond… trois placements chacun
  assert.equal(d.defaitPret, true); assert.equal(d.apresPret, 'draft/reponse');
  assert.equal(d.g, true);

  /* 9. sauvegarde puis chargement : m.duo identique, à l'étape du draft */
  const sv = json(win, `const m=G.mgmt,avant=JSON.stringify(m.duo);saveMgmt();
    const c=mgmtParseAndValidate(stockageLire(mgmtSlotKey(MGMT_SLOT)));return {ok:!!c,egal:!!c&&JSON.stringify(c.duo)===avant};`);
  assert.deepEqual(sv, { ok: true, egal: true });

  /* 10. une partie à deux abîmée est refusée */
  const val = json(win, `const base=JSON.parse(JSON.stringify(G.mgmt)),essais={};
    const essai=(nom,f)=>{const x=JSON.parse(JSON.stringify(base));f(x);essais[nom]=validateMgmt(x);};
    essai('sain',()=>{});
    essai('bInconnu',x=>{x.duo.b='zz';}); essai('bPropre',x=>{x.duo.b=mgmtPredecesseurOrgId(G.mgmt);});
    essai('nom17',x=>{x.duo.noms.a='x'.repeat(17);}); essai('nomVide',x=>{x.duo.noms.b='';});
    essai('sept',x=>{x.duo.draft.combats.push({place:'a',a:null,b:null,div:'x'},{place:'a',a:null,b:null,div:'x'});x.duo.draft.combats.length=7;});
    essai('etape',x=>{x.duo.etape='zz';}); essai('periode',x=>{x.duo.periode=-1;}); essai('encheres',x=>{x.duo.encheres={};});
    essai('soiree',x=>{x.duo.soiree={i:9};}); essai('cartes',x=>{x.duo.cartes=[{combats:[],gains:{a:1,b:1}}];});
    essai('ancien',x=>{x.mondeVivant=false;});
    return essais;`);
  assert.equal(val.sain, true);
  for (const k of Object.keys(val)) if (k !== 'sain') assert.equal(val[k], false, k);
});

test('Duo T1 — la super carte : combats, bilans de chaque côté, gains, rejeu fidèle, équité, rechargement, allègement', () => {
  const win = creer();
  win.eval(AVANCER);
  assert.equal(json(win, DRAFT.replace(/^const m=G.mgmt;/, 'const m=G.mgmt;')), 'pret');

  /* 6. l'équité : le profil d'un combattant de J2 se calcule avec SA partie */
  win.eval(`window.__vus=[];window.__orig=mgmtFightReady;
    mgmtFightReady=function(f,c){window.__vus.push(G.mgmt.duo?'a':'b');return window.__orig(f,c);};`);
  const av = json(win, `const m=G.mgmt,sous=m.orgs[m.duo.b],draft=m.duo.draft.combats.map(c=>({a:c.a,b:c.b,div:c.div}));
    const bilan=id=>{const f=mgmtFighterById(m,id)||mgmtFighterById(sous,id);return f.W+'-'+f.L+'-'+f.D;};
    const avant=draft.map(c=>[bilan(c.a),bilan(c.b)]),ta=m.treasury,tb=sous.treasury,hA=m.hist.length,hB=sous.hist.length,prochaine=m.duo.prochaine;
    const carte=mgmtDuoJouer(m);
    return {carte,draft,avant,apres:draft.map(c=>[bilan(c.a),bilan(c.b)]),dta:m.treasury-ta,dtb:sous.treasury-tb,dhA:m.hist.length-hA,dhB:sous.hist.length-hB,
      etape:m.duo.etape,dprochaine:m.duo.prochaine-prochaine,soiree:m.duo.soiree,g:G.mgmt===m,
      rounds:m.hist.slice(-6).map(t=>t.rounds),duos:m.hist.slice(-6).every(t=>t.duo&&t.duo.b===m.duo.b),
      vus:window.__vus.join('')};`);
  win.eval('mgmtFightReady=window.__orig;');
  assert.ok(av.carte, 'la carte est jouée');
  assert.deepEqual(av.rounds, [3, 3, 3, 3, 3, 5]);
  assert.ok(av.duos);
  assert.equal(av.dhA, 6); assert.equal(av.dhB, 6);
  assert.equal(av.etape, 'soiree'); assert.deepEqual(av.soiree, { i: 0 }); assert.equal(av.dprochaine, 91);
  assert.ok(av.g);
  for (let i = 0; i < 6; i++) { assert.notEqual(av.avant[i][0], av.apres[i][0], 'bilan de J1'); assert.notEqual(av.avant[i][1], av.apres[i][1], 'bilan de J2'); }
  assert.equal(av.vus, 'abababababab');      // chaque profil est calculé dans la partie de son combattant, J1 puis J2
  /* 17. les gains : 200 au vainqueur, 50 au perdant, 125 chacun sur une égalité */
  const g = av.carte.gains, att = av.carte.gagnant === 'nul' ? { a: 125, b: 125 } : av.carte.gagnant === 'a' ? { a: 200, b: 50 } : { a: 50, b: 200 };
  assert.deepEqual(g, att);
  assert.equal(av.dta, g.a); assert.equal(av.dtb, g.b);

  /* 5. le rejeu est fidèle pour chaque combat de la carte ; 7. les classements se calculent ; 13. la validation passe */
  const rj = json(win, `const m=G.mgmt,sous=m.orgs[m.duo.b],res={fidele:[],rangs:true};
    for(const c of m.duo.cartes[0].combats){const t=m.hist[c.h];res.fidele.push(areneVerdictFidele(t,mgmtReplayFight(t)));}
    for(const p of [m,sous]) for(const d of allDivisions()){try{mgmtDivisionRanking(p,d.id,'organization');}catch(e){res.rangs=false;}}
    res.valide=validateMgmt(JSON.parse(JSON.stringify(m)));res.g=G.mgmt===m;
    res.score=mgmtDuoScore(m);res.resume={a:mgmtDuoResume(m,'a').combats.length,b:mgmtDuoResume(m,'b').combats.length};
    return res;`);
  assert.deepEqual(rj.fidele, Array(6).fill(true));
  assert.ok(rj.rangs); assert.ok(rj.valide); assert.ok(rj.g);
  assert.equal(rj.score.saison, 1); assert.equal(rj.score.numero, 2);
  assert.equal(rj.score.total.a + rj.score.total.b <= 1, true);
  assert.deepEqual(rj.resume, { a: 0, b: 0 });   // rien d'ordinaire depuis la super carte

  /* 8. une erreur dans fn rend quand même G.mgmt à J1 */
  const er = json(win, `const m=G.mgmt;let leve=false;try{mgmtDuoAvec(m,'b',()=>{throw new Error('x');});}catch(e){leve=true;}return {leve,g:G.mgmt===m};`);
  assert.deepEqual(er, { leve: true, g: true });

  /* la soirée, le bilan, le retour à l'attente */
  const so = json(win, `const m=G.mgmt,vus=[];for(let i=0;i<6;i++){mgmtDuoSoireeSuivante(m);vus.push(m.duo.etape);}mgmtDuoTerminer(m);return {vus,fin:m.duo.etape,soiree:m.duo.soiree};`);
  assert.deepEqual(so.vus, ['soiree', 'soiree', 'soiree', 'soiree', 'soiree', 'bilan']);
  assert.deepEqual([so.fin, so.soiree], ['attente', null]);

  /* 9 et 13. sauvegarde puis chargement : m.duo et les six traces `duo` sont gardés */
  const sv = json(win, `const m=G.mgmt,avant=JSON.stringify(m.duo);saveMgmt();const c=mgmtParseAndValidate(stockageLire(mgmtSlotKey(MGMT_SLOT)));
    return {ok:!!c,egal:!!c&&JSON.stringify(c.duo)===avant,traces:c?c.hist.filter(t=>t.duo).length:0};`);
  assert.deepEqual(sv, { ok: true, egal: true, traces: 6 });

  /* 14 et 15. une soirée ordinaire plus tard, la partie de J2 s'allège : sa copie de trace `duo` devient une entrée allégée,
     et elle se recharge */
  const al = json(win, `const m=G.mgmt,sous=m.orgs[m.duo.b];
    const rc=mgmtRecruterVivant(m,sous.roster.find(f=>!mgmtIsRetired(f)).id);   // un combattant recruté hors de son organisation d'origine
    const ok=mgmtDuoAvec(m,'b',p=>mgmtPasseAlleger(p,MGMT_MONDE_FAITS_GARDES));
    saveMgmt();const c=mgmtParseAndValidate(stockageLire(mgmtSlotKey(MGMT_SLOT)));
    return {ok,duoRestants:sous.hist.filter(t=>t.duo).length,allegees:sous.hist.filter(t=>t.p===true).length,recharge:!!c,g:G.mgmt===m,rc:!!rc};`);
  assert.equal(al.ok, true);
  assert.equal(al.duoRestants, 0);
  assert.ok(al.allegees >= 6);
  assert.ok(al.recharge, 'la partie allégée se recharge');
  assert.ok(al.g);
});

test('Duo T1 — même graine, mêmes gestes, même partie ; une partie sans duo se joue comme avant', () => {
  const a = creer(), b = creer();
  for (const w of [a, b]) { w.eval(AVANCER); w.eval(`(function(){${DRAFT}})()`); w.eval('mgmtDuoJouer(G.mgmt)'); }
  assert.equal(a.eval('mgmtSerialiser(G.mgmt)'), b.eval('mgmtSerialiser(G.mgmt)'));

  /* 12. sans m.duo : le monde vivant continue exactement comme avant (deux fenêtres, l'une sans duo, l'autre avec duo en attente) */
  const sans = newGameWindow({ runMain: true }), avec = newGameWindow({ runMain: true });
  const base = "setSeed(20261018); mgmtPasseGenerer('split',{soirees:6}); mgmtMondeVivantGenerer(G.mgmt,{soirees:6});";
  sans.eval(base); avec.eval(base + " mgmtDuoCreer(G.mgmt,'mma-korner');");
  for (const w of [sans, avec]) w.eval('G.mgmt.cal.jour+=MGMT_EVENT_WEEKS*7;G.mgmt.cycle++;mgmtMondeVivantSemaine(G.mgmt)');
  const sansDuo = JSON.parse(sans.eval('mgmtSerialiser(G.mgmt)')), avecDuo = JSON.parse(avec.eval('mgmtSerialiser(G.mgmt)'));
  delete avecDuo.duo;
  assert.deepEqual(avecDuo, sansDuo);
});

test('Duo T2 — les enchères : lots, mises, passes, caisse, transferts, rechargement, draft ensuite', () => {
  const win = creer();
  win.eval('mgmtDuoAvancer(G.mgmt)');
  const a = json(win, `const m=G.mgmt,e=m.duo.encheres,res={etape:m.duo.etape,premier:e.premier,n:e.lots.length};
    res.lots=e.lots.map(l=>({id:l.id,orgId:l.orgId,rang:l.rang,ouv:l.ouverture,b:l.b,pas:l.pas,dansJ1:m.roster.some(f=>f.id===l.id),libre:mgmtExteriorCombattant(m,l.id).libre===true}));
    res.valide=validateMgmt(JSON.parse(JSON.stringify(m)));
    return res;`);
  assert.equal(a.etape, 'encheres'); assert.equal(a.premier, 'b');
  assert.ok(a.n >= 1 && a.n <= 3, 'au plus trois lots');
  for (const l of a.lots) {
    assert.notEqual(l.orgId, 'mma-korner'); assert.equal(l.dansJ1, false); assert.equal(l.libre, true);
    assert.equal(l.ouv, 3 * l.b); assert.equal(l.pas, Math.max(1, Math.ceil(l.ouv * 0.1)));
  }
  assert.deepEqual(a.lots.map(l => l.rang), a.lots.map(l => l.rang).slice().sort((x, y) => x - y));
  assert.ok(a.valide);
  /* des caisses de 400 k€ (deux gains de super carte) : une ouverture à la valeur d'un contrat s'y paie */
  win.eval('G.mgmt.treasury=400;G.mgmt.orgs[G.mgmt.duo.b].treasury=400;');

  /* mises : J2 commence, l'ouverture puis un palier ; une mise au-delà de la caisse est refusée sans rien changer */
  const b = json(win, `const m=G.mgmt,L=m.duo.encheres.lots[0],res={};
    res.m1=mgmtDuoMiser(m); res.apres1={prix:L.prix,meneur:L.meneur,tour:L.tour};
    const sauve=m.treasury; m.treasury=-1e9; res.refus=mgmtDuoMiser(m); m.treasury=sauve; res.apresRefus={prix:L.prix,meneur:L.meneur,tour:L.tour};
    res.m2=mgmtDuoMiser(m); res.pas=L.pas; res.ouv=L.ouverture;
    /* rechargement au milieu de l'enchère : même lot, même prix, même tour */
    saveMgmt(); const c=mgmtParseAndValidate(stockageLire(mgmtSlotKey(MGMT_SLOT)));
    res.recharge=!!c&&JSON.stringify(c.duo.encheres)===JSON.stringify(m.duo.encheres);
    res.g=G.mgmt===m; return res;`);
  assert.deepEqual(b.m1.ok, true); assert.equal(b.m1.prix, a.lots[0].ouv); assert.deepEqual(b.apres1, { prix: a.lots[0].ouv, meneur: 'b', tour: 'a' });
  assert.deepEqual(b.refus, { ok: false, raison: 'caisse' }); assert.deepEqual(b.apresRefus, { prix: a.lots[0].ouv, meneur: 'b', tour: 'a' }.prix === b.apresRefus.prix ? b.apresRefus : {});
  assert.equal(b.apresRefus.meneur, 'b'); assert.equal(b.apresRefus.tour, 'a');
  assert.equal(b.m2.prix, a.lots[0].ouv + b.pas);
  assert.ok(b.recharge, 'l’enchère reprend au même point'); assert.ok(b.g);

  /* J2 (tour courant : 'b') passe : J1 mène, elle signe le combattant — il quitte sa sous-partie et entre chez J1 avec 3 combats */
  const c = json(win, `const m=G.mgmt,L=m.duo.encheres.lots[0],id=L.id,prix=L.prix,avant=m.treasury,org=L.orgId;
    const res={tour:L.tour,meneur:L.meneur};
    mgmtDuoPasser(m);
    const f=m.roster.find(x=>x.id===id);
    res.entre=!!f; res.ct=f&&{n:f.ct.n,f:f.ct.f,libre:f.libre===true}; res.quitte=!(m.orgs[org].roster||[]).some(x=>x.id===id);
    res.caisse=avant-m.treasury===prix; res.prix=prix; res.gagnant=L.gagnant; res.i=m.duo.encheres.i; res.recrues=m.duo.recrues.map(r=>r.id===id&&r.cote);
    return res;`);
  assert.equal(c.tour, 'b'); assert.equal(c.meneur, 'a');
  assert.ok(c.entre); assert.deepEqual(c.ct, { n: 3, f: 0, libre: false }); assert.ok(c.quitte); assert.ok(c.caisse);
  assert.equal(c.gagnant, 'a'); assert.equal(c.i, 1); assert.deepEqual(c.recrues, ['a']);

  /* lot suivant : personne ne mise (deux passes), le combattant reste libre ; puis, s'il y a un troisième, J2 le gagne et rien n'entre chez J1 */
  const d = json(win, `const m=G.mgmt,e=m.duo.encheres,res={restants:e.lots.length-e.i};
    if(e.lots[e.i]){ const L=e.lots[e.i],id=L.id; mgmtDuoPasser(m); mgmtDuoPasser(m); res.libre=mgmtExteriorCombattant(m,id)&&mgmtExteriorCombattant(m,id).libre===true; res.fini=L.fini; res.gagnant=L.gagnant; }
    const suite=m.duo.encheres&&m.duo.encheres.lots[m.duo.encheres.i];
    if(suite){ const id=suite.id,sous=m.orgs[m.duo.b],avantB=sous.treasury,avantA=m.treasury,nR=m.roster.length;
      mgmtDuoMiser(m); mgmtDuoPasser(m);   // J2 mise (elle commence), J1 passe : J2 signe
      res.b={chez:!!sous.roster.find(x=>x.id===id),rienChezJ1:m.roster.length===nR&&!m.roster.some(x=>x.id===id),caisseB:avantB-sous.treasury===suite.prix,caisseA:m.treasury===avantA}; }
    res.etape=m.duo.etape; res.encheres=m.duo.encheres; res.draft=!!m.duo.draft&&m.duo.draft.attente==='place';
    res.disponible=m.duo.recrues.filter(r=>r.cote==='a').every(r=>mgmtDuoDisponibles(m,'a').some(f=>f.id===r.id)||true);
    res.g=G.mgmt===m; return res;`);
  if (d.libre !== undefined) { assert.equal(d.libre, true); assert.equal(d.fini, true); assert.equal(d.gagnant, null); }
  if (d.b) { assert.ok(d.b.chez); assert.ok(d.b.rienChezJ1); assert.ok(d.b.caisseB); assert.ok(d.b.caisseA); }
  assert.equal(d.etape, 'draft'); assert.equal(d.encheres, null); assert.ok(d.draft); assert.ok(d.g);
  /* 6. la recrue des enchères de J1 est disponible au draft qui suit (si elle n'est pas indisponible) */
  const e = json(win, `const m=G.mgmt,r=m.duo.recrues.find(x=>x.cote==='a');return {a:!!r,dispo:r?mgmtDuoDisponibles(m,'a').some(f=>f.id===r.id)||!mgmtAvailable(m,mgmtFighterById(m,r.id),null):null};`);
  assert.ok(e.a); assert.ok(e.dispo);
  /* 10. le perdant de la carte précédente commence */
  const f = json(win, `const m=G.mgmt,sauve=m.duo.cartes;const r={};for(const g of ['a','b','nul']){m.duo.cartes=[{gagnant:g}];r[g]=mgmtDuoPremier(m);}m.duo.cartes=[];r.aucune=mgmtDuoPremier(m);m.duo.cartes=sauve;return r;`);
  assert.deepEqual(f, { a: 'b', b: 'a', nul: 'b', aucune: 'b' });
  /* 8. la validation accepte ce nouvel état et refuse une enchère abîmée */
  const g = json(win, `const m=G.mgmt,base=JSON.parse(JSON.stringify(m));base.duo.etape='encheres';
    const lot={id:m.roster[0].id,b:1,ouverture:3,pas:1,prix:0,meneur:null,gagnant:null,tour:'a',passes:0,fini:false};
    const essai=(f)=>{const x=JSON.parse(JSON.stringify(base));x.duo.encheres={i:0,premier:'b',lots:[Object.assign({},lot)]};f(x.duo.encheres);return validateMgmt(x);};
    return {sain:essai(()=>{}),passes:essai(e=>{e.lots[0].passes=3;}),tour:essai(e=>{e.lots[0].tour='z';}),quatre:essai(e=>{e.lots=[lot,lot,lot,lot];}),prix:essai(e=>{e.lots[0].prix=-1;})};`);
  assert.deepEqual(g, { sain: true, passes: false, tour: false, quatre: false, prix: false });
});
