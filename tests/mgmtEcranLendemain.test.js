"use strict";
/* CAGE LEGACY — tests/mgmtEcranLendemain.test.js
   ===========================================================================
   Lot 4 T4 (docs/LOT-4-LA-PEAU-DU-JEU.md §3 T4, maquette 06) :
   - l'écran du lendemain rend comme sa maquette : en-tête « Le lendemain
     de Split N » et bouton « Préparer Split N+1 » (pas de jour : le
     calendrier du mode ne dérive pas d'aucune date) ;
   - les résultats racontés par les faits du moteur : « X bat Y » (issue
     stockée), méthode détaillée rejouée (méthode, round, geste de
     finition, « secoué n fois » d'après les knockdowns encaissés du
     déroulé), Revoir (rejeu, retour au lendemain) et « Voir toute la
     soirée » ;
   - « Ce que ça a changé » : les constats factuels — entrées et sorties
     du top 15 mondial par mgmtDivisionRanking au cycle précédent (la
     seule loi, même dérivation que les classements T6), puis retraites,
     blessures et suspensions dans l'ordre du plus grave ;
   - ce qui attend le lot 5 n'apparaît pas : ni « On en parle », ni presse,
     ni suites réclamées — aucun texte de la maquette en jeu ;
   - esc() sur tout nom ; aucun Math.random() ; ni note, ni barème.
   ========================================================================== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

const TRAVAIL_RE=/RÉPLIQUE MANQUANTE|EMPLACEMENT AUTEUR|TODO/i;

function freshMgmt(win,seed){
  win.eval(`(function(){ setSeed(${seed}); const m=mgmtDefaultAvantH4(); mgmtNewRoster(m); G={theme:'dark',mgmt:m}; })()`);
}

/* Une soirée complète (copie de la fixture de mgmtTrace.test.js) : la carte
   principale est posée en fixture (§T3), Leïla propose les préliminaires,
   mgmtRunEvent. @returns {boolean} */
function joueSoiree(win){
  return win.eval(`(function(){
    const m=G.mgmt;
    mgmtNewPile(m);
    m.card.main=[];
    const dispo=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o));
    if(dispo.length<10) return false;
    for(let i=0;i<5;i++) m.card.main.push({a:dispo[2*i].id,b:dispo[2*i+1].id,cycle:m.cycle,slot:'main'});
    m.pile=[]; m.open=null;
    if(mgmtClosePile(m)!=='refill') return false;
    const bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open');
    if(!bulk||!mgmtDecide(m,bulk.id,'validate')) return false;
    return !!mgmtRunEvent(m);
  })()`);
}

test('MGMT T4 — l’écran rend : en-tête, résultats, constats, rien des lots 5', () => {
  const win = newGameWindow();
  freshMgmt(win,501);
  assert.ok(joueSoiree(win),'une soirée a été jouée');
  win.eval(`G.screen='mgmt_lendemain'; render();`);
  const html = win.document.getElementById('app').innerHTML;
  /* L'en-tête : le lendemain de la soirée jouée, la suivante préparée —
     aucun jour en date (le calendrier du mode ne dérive pas d'une date). */
  assert.equal(win.eval('G.mgmt.eventsPlayed'),1,'une seule soirée jouée');
  assert.ok(html.includes('Le lendemain de Split 1'),'l’en-tête porte la soirée jouée');
  assert.ok(html.includes('Préparer Split 2'),'le bouton prépare la soirée suivante');
  assert.ok(!/\b(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\b/i.test(html),
    'aucun jour de la semaine en en-tête');
  /* Les trois lectures : résultats, constats, et ni presse ni suites réclamées. */
  assert.ok(html.includes('Les résultats'),'le bloc des résultats porte son titre');
  assert.ok(html.includes('Ce que ça a changé'),'le bloc des constats porte son titre');
  assert.ok(!html.includes('On en parle'),'la presse attend le lot 5');
  assert.ok(!/[Cc]age Hebdo/.test(html),'aucun nom de la maquette en jeu');
  assert.ok(!/agent parle de retraite/.test(html),'aucune phrase de la maquette');
  assert.ok(!/la presse se demande/.test(html),'aucune phrase de la maquette');
  assert.ok(!/réclame/i.test(html),'les suites réclamées attendent le lot 5');
  assert.ok(!TRAVAIL_RE.test(html),'aucun texte de travail');
  /* Les résultats : chaque combat porte « bat » (ou un match nul), une
     méthode, un bouton REVOIR ; un lien vers toute la soirée. */
  const titles=[...win.document.querySelectorAll('.mgmt-ld-results .mgmt-ld-title')];
  assert.equal(titles.length,win.G.mgmt.lastEvent.fights.length,'un titre par combat');
  assert.ok(titles.every(t=>/ bat /.test(t.textContent)||/Match nul/.test(t.textContent)),
    'chaque titre raconte l’issue stockée');
  const rev=[...win.document.querySelectorAll('.mgmt-ld-results .mgmt-ld-link')];
  assert.ok(rev.length>=titles.length,'Revoir est là (et le lien de la soirée)');
  assert.equal(rev.filter(b=>b.textContent==='Revoir').length,titles.length,'un Revoir par combat');
  assert.ok(rev.some(b=>/Voir toute la soirée/.test(b.textContent)),'« Voir toute la soirée » porte son lien');
  /* La séquence impose sa suite : le bouton de l'en-tête rend la main. */
  win.eval(`CL.mgmtLendemainNext()`);   /* brief démo, lot 6 T3 : l'action du soir suivant est la touche jaune de la barre du bas */
  assert.equal(win.eval('G.screen'),'mgmt_carte','la main passe à la carte (décision d’Anthony du 08/10/2026 : plus d’écran « Les affaires » à l’ouverture, on revient à la carte)');
});

test('MGMT T4 — la ligne de méthode vient du déroulé rejoué : méthode, round, geste, secoués', () => {
  const win = newGameWindow();
  freshMgmt(win,502);
  assert.ok(joueSoiree(win),'une soirée a été jouée');
  const s = JSON.parse(win.eval(`(function(){
    const m=G.mgmt, t=m.hist[0];
    const res=mgmtReplayFight(t);
    const fidele=res&&areneVerdictFidele(t,res);
    const famille=res?mgmtMethodFamily(res.method,res.winner):null;
    const cible=fidele&&famille!=='draw'?(res.winner==='A'?'B':'A'):null;
    const st=fidele&&cible?res.stats[cible]:null;
    return JSON.stringify({
      methode:res?res.method:'',
      round:t.round,
      move:fidele?(res.moveName||''):null,
      secoue:st?Math.max(0,Math.round(st.wobbled)):0,
      ligne:mgmtLendemainMethode(t),
      sansTrace:mgmtLendemainMethode(null)
    });
  })()`));
  assert.equal(s.sansTrace,'','sans trace, la ligne est vide');
  assert.ok(s.ligne.length>0,'une méthode détaillée se lit');
  assert.ok(s.methode.length>0,'le calcul de référence existe');
  assert.ok(s.ligne.startsWith(s.methode),'la méthode rejouée ouvre la ligne');
  assert.ok(s.ligne.includes(' au round '+s.round)||s.ligne.includes(' en '+s.round+' rounds'),
    'le round fait partie de la ligne');
  if(s.move){
    assert.ok(s.ligne.includes(', '+s.move),'le geste de finition du moteur se lit');
  }else{
    assert.ok(!/, retenu/.test(s.ligne),'aucun geste inventé pour un arrêt sans geste');
  }
  if(s.secoue>0){
    const mot=['une fois','deux fois','trois fois','quatre fois','cinq fois','six fois'][s.secoue-1]||(s.secoue+' fois');
    assert.ok(s.ligne.includes(', secoué '+mot),'les knockdowns encaissés se lisent : « secoué '+mot+' »');
  }
  assert.ok(!/\[CRITIQUE\]|\[ARBITRAGE\]/.test(s.ligne),'aucun marqueur interne du moteur');
});

test('MGMT T4 — les constats suivent le classement au cycle précédent, une seule loi', () => {
  const win = newGameWindow();
  freshMgmt(win,503);
  assert.ok(joueSoiree(win),'une soirée a été jouée');
  const m=win.G.mgmt;
  const attendus=JSON.parse(win.eval(`(function(){
    const m=G.mgmt, e=m.lastEvent, liste=[];
    const divs=[];
    for(const f of e.fights){
      for(const id of [f.a,f.b]){
        const fr=mgmtFighterById(m,id);
        if(fr&&fr.div&&!divs.includes(fr.div)) divs.push(fr.div);
      }
    }
    const TOP=MGMT_CL_TOP;
    for(const divId of divs){
      const cur=mgmtDivisionRanking(m,divId,'world');
      const prev=mgmtDivisionRanking(m,divId,'world',m.cycle-1);
      for(let i=0;i<Math.min(TOP,cur.length);i++){
        if(!prev.some(x=>x.id===cur[i].id)) liste.push('entre:'+cur[i].id);
      }
      for(let p=0;p<Math.min(TOP,prev.length);p++){
        const j=cur.findIndex(x=>x.id===prev[p].id);
        if(j<0||j>=TOP) liste.push('sort:'+prev[p].id);
      }
    }
    return JSON.stringify(liste);
  })()`));
  /* Les constats du classement à l'écran ne sont pas obligatoires (une
     soirée peut ne faire entrer ni sortir personne) : le test lit ce que
     l'écran a posé et n'exige que la CORRESPONDANCE avec la même loi. */
  const e=JSON.parse(win.eval(`(function(){
    const m=G.mgmt;
    G.screen='mgmt_lendemain'; render();
    const items=[...document.querySelectorAll('.mf-ld-change .mgmt-ld-title')];
    return JSON.stringify(items.map(x=>x.textContent));
  })()`));
  let entre=0,sort=0;
  for(const piece of attendus){
    const id=piece.slice(5);
    const gl=win.eval(`(function(){const m=G.mgmt,l=mgmtFicheLigne(m,${JSON.stringify(id)});return l?l.f.name:''})()`);
    if(piece.startsWith('entre:')){
      entre++;
      assert.ok(e.some(x=>x===gl+' entre dans le top 15'),'le constat d’entrée se lit pour '+gl);
    }else{
      sort++;
      assert.ok(e.some(x=>x===gl+' sort du top 15'),'le constat de sortie se lit pour '+gl);
    }
  }
  assert.equal(e.filter(x=>x.endsWith('entre dans le top 15')).length,entre,'tous les constats d’entrée sont là');
  assert.equal(e.filter(x=>x.endsWith('sort du top 15')).length,sort,'tous les constats de sortie sont là');
  assert.ok(e.length>=attendus.length,'le bloc n’oublie aucun constat (constats : '+e.length+' attendus '+attendus.length+')');
  /* Retenir un rang au mauvais endroit : « au classement mondial » est la
     seule lecture de rang, jamais un score ni une tendance visible. */
  const html=win.document.getElementById('app').innerHTML;
  assert.ok(!/note|barème|étoile/i.test(html),' aucune note ni barème (charte H1)');
});

test('MGMT T4 — les touchés se racontent en faits : retraite, blessure, suspension', () => {
  const win = newGameWindow();
  freshMgmt(win,503);
  win.eval(`(function(){
    const m=G.mgmt;
    /* Fixture : la même porte que les soirées réelles, événements plantés
       pour lire les trois libellés. */
    m.lastEvent={cycle:m.cycle,fights:[{a:m.roster[0].id,b:m.roster[1].id,winner:'A',family:'ko',round:2}],
      touched:[{id:m.roster[0].id,retired:false,injury:'Fracture de la main',days:90},
        {id:m.roster[1].id,retired:true,injury:null,days:0},
        {id:m.roster[2].id,retired:false,injury:null,days:60}]};
    G.screen='mgmt_lendemain'; render();
  })()`);
  const html=win.document.getElementById('app').innerHTML;
  assert.ok(/fin de carrière médicale/i.test(html),'la retraite se lit en fait');
  assert.ok(html.includes('Fracture de la main'),'la blessure se lit par son nom');
  assert.ok(html.includes('suspendu 90 jours'),'la suspension de la blessure se lit');
  assert.ok(html.includes('suspendu 60 jours'),'la suspension sèche se lit');
  assert.ok(html.includes('Le lendemain de Split'),'l’écran rend malgré des événements plantés');
  assert.ok(!/trauma/i.test(html),'le corps reste caché');
});

test('MGMT T4 — Revoir rejoue depuis l\'écran et revient au lendemain', () => {
  const win = newGameWindow();
  freshMgmt(win,504);
  assert.ok(joueSoiree(win),'une soirée a été jouée');
  win.eval(`G.screen='mgmt_lendemain'; render();`);
  const premier=[...win.document.querySelectorAll('[onclick^="CL.mgmtLendemainRevoir"]')];
  assert.ok(premier.length>0,'les boutons Revoir sont là');
  premier[0].click();
  assert.equal(win.eval('G.screen'),'arene_socle','le rejeu ouvre l\'arène');
  assert.ok(win.document.querySelector('canvas'),'l\'arène montre le combat');
  win.CL.areneSocleQuitter();
  assert.equal(win.eval('G.screen'),'mgmt_lendemain','retour au lendemain');
  /* Le rejeu depuis le lendemain ne déplace aucun tirage de la partie. */
  const s=JSON.parse(win.eval(`(function(){
    const avant=SEED;
    mgmtLendemainMethode(G.mgmt.hist[0]);
    return JSON.stringify({avant,apres:SEED});
  })()`));
  assert.equal(s.apres,s.avant,'le rejeu (la ligne de méthode) ne consomme rien');
});

test('MGMT T4 — nom hostile dans la trace : échappé, jamais injecté', () => {
  const win = newGameWindow();
  freshMgmt(win,505);
  assert.ok(joueSoiree(win),'une soirée a été jouée');
  win.eval(`(function(){
    const m=G.mgmt;
    m.hist[0].b.name='<img src=x onerror=alert(1)>';
    G.screen='mgmt_lendemain'; render();
  })()`);
  const doc=win.document.getElementById('app');
  assert.equal(doc.querySelector('img,svg[onload]'),null,'aucun élément hostile ne s\'injecte');
  assert.ok(doc.innerHTML.includes('&lt;img'),'le nom s\'échappe');
});

test('MGMT T4 — sans soirée en mémoire, l\'écran rend la main à la semaine', () => {
  const win = newGameWindow();
  freshMgmt(win,506);
  win.eval(`G.screen='mgmt_lendemain'; render();`);
  const html=win.document.getElementById('app').innerHTML;
  assert.ok(html.includes('La semaine'),'le fallback de sécurité reste le bureau');
});
