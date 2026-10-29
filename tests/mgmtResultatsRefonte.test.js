"use strict";
/* ==== [ANCRE: MONDE_LOT10_T3_TESTS] — Monde lot 10 T3 : la refonte de l'écran Résultats (planche maquettes/monde/refonte/MondeResultats.html,
   contrat LISEZ-MOI §3, validée par Anthony le 14/10/2026). Une partie Split à passé (graine 20261008, douze soirées de passé au lieu de 62 :
   la génération n'est faite qu'une fois pour le fichier) puis une soirée jouée par le joueur. ==== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { newGameWindow } = require('./helpers/loadGame');

const css = fs.readFileSync(path.join(__dirname, '..', 'ui-cadre.css'), 'utf8').split('\r\n').join('\n');
const lire = (win, code) => JSON.parse(win.eval(`JSON.stringify((function(){${code}})())`));
const touche = (win, key) => win.eval(`keysHandle({key:${JSON.stringify(key)},preventDefault(){}})`);
const texte = win => win.eval(`document.getElementById('app').textContent`);
const ouvrir = (win, s, i) => win.eval(`MGMT_SU_RE={s:${s},i:${i || 0},fen:0}; CL.go('mgmt_resultats');`);

const PASSE = 12;
let PARTIE = null;
/** La partie du fichier, générée une seule fois : passé de douze soirées, puis une soirée jouée. `snap` est la partie avant cette soirée. */
function partie() {
  if (PARTIE) return PARTIE;
  const win = newGameWindow({ runMain: true });
  win.eval(`setSeed(20261008); mgmtPasseGenerer('split',{soirees:${PASSE}}); mgmtRetraitProb=function(){return 0;};`);
  win.snap = win.eval('JSON.stringify(G.mgmt)');
  win.eval(`const m=G.mgmt;
    m.pile.forEach(x=>{x.status='closed';x.decision='ignored';}); m.open=null;
    const divs=[...new Set(mgmtCartRows(m).map(f=>f.div))]; let essais=0;
    while(m.card.main.length<m.card.sizeMain&&essais++<80){
      const div=divs[(m.card.main.length+essais)%divs.length];
      const rows=mgmtCartRows(m).filter(f=>f.div===div&&mgmtSelectable(m,f,null)&&!f.libre&&mgmtContratRestants(f)>0);
      const a=rows[0], b=a&&rows.find(x=>x.id!==a.id&&mgmtSelectable(m,x,a.id));
      if(a&&b) mgmtBookMain(m,a.id,b.id);
    }
    const bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open'); if(bulk) mgmtDecide(m,bulk.id,'validate');
    if(!mgmtAgendaJouer(m)) throw new Error('la soirée ne se joue pas');
    mgmtNewPile(G.mgmt);`);
  assert.deepEqual(lire(win, 'const m=G.mgmt; return [m.passe.soirees,m.eventsPlayed,mgmtSoireesJoueur(m)];'), [PASSE, PASSE + 1, 1]);
  win.eval('globalThis.__jouee=G.mgmt;');
  PARTIE = win;
  return win;
}
/** Une partie neuve sans aucune soirée (état « vide »). */
function neuve() {
  const win = newGameWindow({ runMain: true });
  win.eval('setSeed(7); CL.mgmtEnter(1);');
  return win;
}
/** Les phrases du détail et de la liste, lues sur la page. */
const lignes = (win, sel) => lire(win, `return [...document.querySelectorAll(${JSON.stringify(sel)})].map(e=>e.textContent);`);
test('Résultats — les préliminaires conservent leur numéro dans la soirée jouée',()=>{
  const win=partie();
  const r=lire(win,`const m=G.mgmt,s=mgmtSoirees(m).slice().reverse()[0],attendu=s.idx.filter(i=>m.hist[i].slot==='prelim').sort((a,b)=>a-b),liste=mgmtSuResultatsListe(m,s),avant=JSON.stringify(m);CL.mgmtSuResultatDe(attendu[0]);KEYS.maps.mgmt_releve.Escape();return {attendu,affiche:liste.filter(x=>!x.main).map(x=>x.i),lib:document.querySelector('.mf-re-det .mf-re-lab').textContent,pur:JSON.stringify(m)===avant};`);
  assert.ok(r.attendu.length>=2);
  assert.deepEqual(r.affiche,r.attendu);
  assert.equal(r.lib,'Préliminaire 1');
  assert.equal(r.pur,true);
});

test('Résultats — état joueur : la dernière soirée et son combat principal, « Ta soirée », revoir, fiche, spectateurs, bloc jaune', () => {
  const win = partie(); ouvrir(win, 0);
  const r = lire(win, `const m=G.mgmt, s=mgmtSoirees(m).slice().reverse()[0], d=mgmtResultatDetail(m,mgmtSoireeAffichage(m,s)[0]);
    return {n:s.n,principal:d.gagnant.name,prochaine:mgmtAccueilContenu(m).attend.prochaine.titre,spect:m.lastEvent&&m.lastEvent.finance?m.lastEvent.finance.spectateurs:null,
      titre:document.querySelector('.mf-re-sdt .mf-re-T').textContent,puce:document.querySelector('.mf-re-puce').textContent,
      pastilleBlanche:document.querySelector('.mf-re-puce').classList.contains('a-toi'),
      selection:[...document.querySelectorAll('.mf-re-cb')].findIndex(b=>b.classList.contains('sel')),
      detail:document.querySelector('.mf-re-det-g').textContent,lab:document.querySelector('.mf-re-det .mf-re-lab').textContent,
      boutons:[...document.querySelectorAll('.mf-re-actions .mf-bouton-t')].map(x=>x.textContent),
      jaune:document.querySelector('.mf-re-jaune .mf-re-T').textContent};`);
  assert.equal(r.titre, 'Split Fight Night ' + (PASSE + 1));
  assert.equal(r.puce, 'Ta soirée'); assert.ok(r.pastilleBlanche, 'la pastille « Ta soirée » est pleine');
  assert.equal(r.selection, 0, 'le combat principal est choisi');
  assert.equal(r.lab, 'Combat principal'); assert.equal(r.detail, r.principal);
  assert.ok(r.boutons.includes('Revoir le combat') && r.boutons.some(b => b.startsWith('Fiche de ')));
  assert.equal(r.jaune, r.prochaine, 'le bloc jaune lit la même source que l’Accueil');
  if (Number.isFinite(r.spect)) assert.ok(/spectateurs/.test(texte(win)), 'les spectateurs de la dernière soirée');
  assert.ok(!/cycle/i.test(texte(win)), 'jamais « cycle » à l’écran');
  assert.equal(win.eval(`document.querySelector('.mf-entete-lib').textContent.includes('${PASSE + 1}')`), true);
});

test('Résultats — état passé : « Soirée de {prédécesseur} », ni spectateurs, ni Revoir, la phrase de la planche', () => {
  const win = partie(); ouvrir(win, 1);
  const r = lire(win, `const m=G.mgmt; return {pred:mgmtSuPredecesseurNom(m),puce:document.querySelector('.mf-re-puce').textContent,
    aToi:document.querySelector('.mf-re-puce').classList.contains('a-toi'),titre:document.querySelector('.mf-re-sdt .mf-re-T').textContent,
    boutons:[...document.querySelectorAll('.mf-re-actions .mf-bouton-t')].map(x=>x.textContent),
    ligne:document.querySelector('.mf-re-sdt .mf-re-l1').textContent,touches:[...document.querySelectorAll('.mf-touche-g')].map(x=>x.textContent)};`);
  assert.ok(r.pred.length > 3, 'le prédécesseur est connu');
  assert.equal(r.puce, 'Soirée de ' + r.pred); assert.equal(r.aToi, false);
  assert.equal(r.titre, 'Split Fight Night ' + PASSE);
  assert.ok(!r.boutons.includes('Revoir le combat'));
  assert.ok(!/spectateurs/.test(r.ligne), 'les spectateurs ne sont pas gardés pour le passé');
  assert.ok(texte(win).includes('Combat d’avant ton arrivée : on lit le résultat, il ne se revoit pas.'));
  assert.ok(!r.touches.some(t => t.startsWith('R')), 'pas de touche R annoncée');
  touche(win, 'r'); assert.equal(win.eval('G.screen'), 'mgmt_resultats', 'R ne lance rien sur un combat d’avant l’arrivée');
});

test('Résultats — état blessure : un combat qui laisse une blessure le dit, sans cause', () => {
  const win = partie();
  const c = lire(win, `const m=G.mgmt, soirees=mgmtSoirees(m).slice().reverse(); let trouve=null;
    soirees.forEach((s,k)=>mgmtSuResultatsListe(m,s).forEach(x=>{ if(!trouve&&x.d&&mgmtSuChangements(m,x,k===0).some(c=>c.t==='corps')) trouve={s:k,i:x.k}; }));
    if(!trouve){ /* aucune blessure dans cette partie : un fait de la trace de la dernière soirée, comme mgmtApplyFight l'écrit */
      const x=mgmtSuResultatsListe(m,soirees[0])[1], t=m.hist[x.i];
      m.facts.push({c:t.c,k:'injury',a:t.a.id}); trouve={s:0,i:1,ajoute:true}; }
    return trouve;`);
  ouvrir(win, c.s, c.i);
  const l = lignes(win, '.mf-re-chg span');
  assert.ok(l.some(t => /^(Blessure|Suspension médicale) pour /.test(t)), 'la ligne du corps : ' + l.join(' | '));
  assert.ok(lire(win, `return document.querySelectorAll('.mf-re-chg i.corps').length`) >= 1);
  assert.ok(l.every(t => !/cause|choc|coup/i.test(t)), 'aucune cause (charte H5)');
});

test('Résultats — état contrat : « un dernier combat à son contrat » seulement dans la dernière soirée, « au bout de son contrat » depuis le fait', () => {
  const win = partie();
  const r = lire(win, `const m=G.mgmt, soirees=mgmtSoirees(m).slice().reverse();
    const x=mgmtSuResultatsListe(m,soirees[0])[2], d=x.d, f=mgmtFighterById(m,d.gagnant.id), avant=f.ct?JSON.stringify(f.ct):null;
    f.ct={n:(f.ct?f.ct.f:0)+1,f:f.ct?f.ct.f:0,b:f.ct?f.ct.b:0,since:m.cycle};
    const dernier=mgmtSuChangements(m,x,true).map(c=>c.texte), pasDernier=mgmtSuChangements(m,x,false).map(c=>c.texte);
    return {restants:mgmtContratRestants(f),dernier,pasDernier,nom:d.gagnant.last||d.gagnant.name,k:x.k};`);
  assert.equal(r.restants, 1);
  assert.ok(r.dernier.includes(`${r.nom} : un dernier combat à son contrat`));
  assert.ok(!r.pasDernier.some(t => /un dernier combat/.test(t)), 'jamais pour une soirée plus ancienne');
  ouvrir(win, 0, r.k); assert.ok(texte(win).includes(`${r.nom} : un dernier combat à son contrat`));
  ouvrir(win, 1, 0); assert.ok(!/un dernier combat à son contrat/.test(texte(win)), 'une soirée du passé n’en dit rien');
  const fin = lire(win, `const m=G.mgmt; const x=mgmtSuResultatsListe(m,mgmtSoirees(m).slice().reverse()[2])[0], t=m.hist[x.i];
    m.facts.push({c:t.c,k:'fin_contrat',a:x.d.gagnant.id}); return mgmtSuChangements(m,x,false).map(c=>c.texte);`);
  assert.ok(fin.some(t => / arrive au bout de son contrat$/.test(t)));
});

test('Résultats — état premier-jour : « Ta première soirée », la dernière soirée du passé est choisie, six lignes, bloc jaune', () => {
  const win = partie();
  win.eval(`G.mgmt=mgmtParseAndValidate(${JSON.stringify(win.snap)}); MGMT_SU_RE={s:0,i:0,fen:0}; CL.go('mgmt_resultats');`);
  const r = lire(win, `const m=G.mgmt; return {joueur:mgmtSoireesJoueur(m),eventsPlayed:m.eventsPlayed,sous:[...document.querySelectorAll('.mf-re-sous')].map(e=>e.textContent),
    lignes:document.querySelectorAll('.mf-re-so').length,avenir:document.querySelector('.mf-re-avenir').textContent,
    titre:document.querySelector('.mf-re-sdt .mf-re-T').textContent,puce:document.querySelector('.mf-re-puce').textContent,
    jaune:document.querySelector('.mf-re-jaune .mf-re-T').textContent,prochaine:mgmtAccueilContenu(m).attend.prochaine.titre,
    tes:document.querySelector('.mf-re-so.sel .mf-re-so-h .mf-re-T').textContent};`);
  assert.equal(r.joueur, 0);
  assert.ok(r.sous.includes('Tes soirées · 0') && r.sous.includes('Avant ton arrivée · ' + PASSE));
  assert.ok(r.avenir.includes('Ta première soirée') && r.avenir.includes('Split Fight Night ' + (PASSE + 1)), r.avenir);
  assert.equal(r.lignes, 6, 'six lignes de soirée quand « Ta première soirée » est là');
  assert.equal(r.tes, 'Fight Night ' + PASSE, 'la dernière soirée du passé est choisie');
  assert.equal(r.titre, 'Split Fight Night ' + PASSE); assert.ok(/^Soirée de /.test(r.puce));
  assert.equal(r.jaune, r.prochaine);
  win.eval('G.mgmt=globalThis.__jouee;');
});

test('Résultats — état vide : aucune soirée, le texte de la planche et la prochaine chose à faire ; rien ne plante', () => {
  const win = neuve(); ouvrir(win, 0);
  const t = texte(win);
  assert.ok(t.includes('Aucune soirée jouée'));
  assert.ok(t.includes('Les résultats de Split Fight Night 1 arriveront ici, le soir même.'));
  assert.ok(t.includes('Chaque combat dira qui a gagné, comment, et ce que ça change au classement, aux ceintures et aux contrats.'));
  assert.ok(t.includes('Tes soirées · 0') && t.includes('Ta première soirée'));
  assert.ok(!t.includes('Avant ton arrivée'), 'pas de groupe sans passé');
  assert.equal(win.eval(`document.querySelectorAll('.mf-re-cb').length`), 0);
  assert.equal(win.eval(`document.querySelector('.mf-re-jaune')!==null`), true);
  touche(win, 'ArrowLeft'); touche(win, 'ArrowDown'); touche(win, 'r'); touche(win, 'f');
  assert.equal(win.eval('G.screen'), 'mgmt_resultats');
});

test('Résultats — soirées groupées, dates longues et fenêtre stable de sept lignes', () => {
  const win = partie(); ouvrir(win, 0);
  const g = lire(win, `const m=G.mgmt, soirees=mgmtSoirees(m); const tes=soirees.filter(s=>s.n>m.passe.soirees), avant=soirees.filter(s=>s.n<=m.passe.soirees);
    return {tes:tes.length,avant:avant.length,sous:[...document.querySelectorAll('.mf-re-sous')].slice(0,2).map(e=>e.textContent),lignes:document.querySelectorAll('.mf-re-so').length,
      plus:document.querySelector('.mf-re-plus.bas .mf-re-l2').textContent};`);
  assert.equal(g.tes, 1); assert.equal(g.avant, PASSE);
  assert.deepEqual(g.sous, ['Tes soirées · 1', 'Avant ton arrivée · ' + PASSE]);
  assert.equal(g.lignes, 7, 'sept lignes de soirée');
  assert.equal(g.plus, (PASSE + 1 - 7) + ' soirées plus anciennes');
  const dates = lignes(win, '.mf-re-so-h span');
  for (const d of dates) assert.match(d, /^\d{1,2} [a-zéûô]+ 20\d\d$/, d);
  assert.ok(dates.every(d => d === d.toLowerCase()), 'mois en minuscules');
  assert.ok(!/\b\d{1,2} (JANVIER|FÉVRIER|MARS|AVRIL|MAI|JUIN|JUILLET|AOÛT|SEPTEMBRE|OCTOBRE|NOVEMBRE|DÉCEMBRE)\b/.test(texte(win).replace(/^.*Résultats/, '')), 'pas de mois en capitales dans les phrases');
  const visibles = () => lignes(win, '.mf-re-so .mf-re-so-h .mf-re-T');
  const avant = visibles();
  assert.equal(avant[0], 'Fight Night ' + (PASSE + 1));
  /* la sélection se déplace dans la fenêtre : rien ne bouge */
  touche(win, 'ArrowLeft'); touche(win, 'ArrowLeft'); touche(win, 'ArrowLeft');
  assert.equal(win.eval('MGMT_SU_RE.s'), 3); assert.deepEqual(visibles(), avant, 'choisir une soirée visible ne déplace pas les autres');
  /* elle sort de la fenêtre : la liste recule d'une ligne, pas plus */
  for (let k = 0; k < 4; k++) touche(win, 'ArrowLeft');
  assert.equal(win.eval('MGMT_SU_RE.s'), 7);
  const apres = visibles();
  assert.equal(apres.length, 7); assert.equal(apres[0], 'Fight Night ' + PASSE); assert.equal(apres[6], 'Fight Night ' + (PASSE - 6));
  assert.equal(win.eval(`document.querySelector('.mf-re-so.sel .mf-re-T').textContent`), 'Fight Night ' + (PASSE - 6), 'la sélection reste dans la fenêtre');
  assert.ok(texte(win).includes('soirée plus récente'), 'la ligne « plus récentes » apparaît');
  /* retour : la fenêtre ne remonte que quand la sélection la quitte */
  touche(win, 'ArrowRight'); assert.deepEqual(visibles(), apres);
  /* le passé n'a que « Avant ton arrivée » en tête quand la fenêtre est plus bas */
  assert.ok(lignes(win, '.mf-re-sous')[0].startsWith('Avant ton arrivée'));
});

test('Résultats — combats séparés : carte principale et préliminaires, numérotés dans chaque groupe, comme le jeu les ordonne', () => {
  const win = partie();
  for (const s of [0, 1, 3]) {
    ouvrir(win, s);
    // Le principal reste en tête ; les préliminaires reprennent leur ordre de passage.
    const r = lire(win, `const m=G.mgmt, soi=mgmtSoirees(m).slice().reverse()[${s}], source=mgmtSoireeAffichage(m,soi),aff=source.filter(i=>m.hist[i].slot==='main').concat(soi.idx.filter(i=>m.hist[i].slot!=='main').sort((a,b)=>a-b));
      const main=aff.filter(i=>m.hist[i].slot==='main').length, prel=aff.length-main;
      const noms=aff.map(i=>mgmtResultatDetail(m,i)).map(d=>d.gagnant.last||d.gagnant.name);
      return {total:aff.length,main,prel,noms,gr:[...document.querySelectorAll('.mf-re-gr')].map(e=>e.textContent),
        nums:[...document.querySelectorAll('.mf-re-n')].map(e=>+e.textContent),
        lignes:[...document.querySelectorAll('.mf-re-cb .mf-re-l1')].map(e=>e.textContent)};`);
    assert.equal(r.lignes.length, r.total);
    assert.equal(r.gr[0], `Carte principale${r.main} combat${r.main > 1 ? 's' : ''}`);
    assert.equal(r.gr[1], `Carte préliminaire${r.prel} combat${r.prel > 1 ? 's' : ''}`);
    assert.deepEqual(r.nums, [...Array(r.main).keys()].map(k => k + 1).concat([...Array(r.prel).keys()].map(k => k + 1)));
    assert.ok(r.lignes.every((l,k)=>l.includes(r.noms[k])), 'chaque ligne dit le bon vainqueur dans le bon ordre');
    assert.ok(r.lignes.every(l => / bat | et .* : match nul/.test(l)));
  }
});

test('Résultats — détail : place, noms, méthode, bilans avant le combat, ceinture et classement cohérents avec les sources', () => {
  const win = partie();
  const r = lire(win, `const m=G.mgmt, out={combats:0,titres:0,garde:0,prend:0,ordre:0,rangs:0,mauvais:[],defOk:0};
    const soirees=mgmtSoirees(m).slice().reverse();
    soirees.forEach((s,k)=>{
      mgmtSuResultatsListe(m,s).forEach(x=>{
        out.combats++; const d=x.d, ch=mgmtSuChangements(m,x,k===0), t=m.hist[x.i];
        const ceint=ch.filter(c=>c.t==='ceint');
        if(d.titre&&!d.nul){
          out.titres++; const issue=mgmtTitreIssue(m,x.i);
          if(ceint.length!==1) out.mauvais.push('ceinture '+x.i+' : '+ceint.length+' lignes');
          if(issue==='garde'){ out.garde++; if(!/garde sa ceinture/.test(ceint[0].texte)) out.mauvais.push('garde '+ceint[0].texte); }
          if(issue==='prend'){ out.prend++; if(!/prend la ceinture/.test(ceint[0].texte)) out.mauvais.push('prend '+ceint[0].texte); }
        }else if(ceint.length) out.mauvais.push('ceinture sans combat de titre '+x.i);
        for(const c of ch){
          let mm=/monte de la (\\d+)(?:re|e) à la (\\d+)(?:re|e) place/.exec(c.texte); if(mm){ out.rangs++; if(!(+mm[2]<+mm[1])) out.mauvais.push(c.texte); }
          mm=/recule de la (\\d+)(?:re|e) à la (\\d+)(?:re|e) place/.exec(c.texte); if(mm){ out.rangs++; if(!(+mm[2]>+mm[1])) out.mauvais.push(c.texte); }
          if(/ 0e | 0re /.test(c.texte)) out.mauvais.push('rang zéro : '+c.texte);
        }
      });
    });
    for(const dv of allDivisions()){
      const l=mgmtCeintureLignee(m,dv.id);
      if(l.actuel){ const dern=l.actuel.derniere; if(dern){ const f=m.facts.find(x=>x.k==='title_fight'&&x.fight===dern.fight); if(f&&mgmtSuDefenseRang(m,dv.id,dern.fight)===l.actuel.defenses) out.defOk++; else out.mauvais.push('défense '+dv.id); } }
    }
    return out;`);
  assert.ok(r.combats >= 9 * 2);
  assert.deepEqual(r.mauvais, [], 'les lignes de ceinture et de classement suivent les sources');
  assert.ok(r.rangs > 0, 'des places gagnées ou perdues sont dites');
  /* le détail d'un combat du joueur : méthode fine, bilans, catégorie et rounds */
  ouvrir(win, 0, 0);
  const d = lire(win, `const m=G.mgmt, x=mgmtSuResultatsListe(m,mgmtSoirees(m).slice().reverse()[0])[0], t=m.hist[x.i], d=x.d, l2=[...document.querySelectorAll('.mf-re-det .mf-re-l2')].map(e=>e.textContent);
    return {l2,fine:mgmtSuMethodeFine(d),cat:mgmtDivisionLabel(d.cat)+' · en '+d.rounds+' rounds',bil:'Bilans avant le combat : '+mgmtSuBilan(d.gagnant)+' et '+mgmtSuBilan(d.perdant),
      winnerEstA:d.gagnant===t.a||d.gagnant===t.b,geste:d.geste};`);
  assert.ok(d.l2[0].startsWith(d.fine)); assert.ok(d.l2.includes(d.cat)); assert.ok(d.l2.includes(d.bil)); assert.ok(d.winnerEstA);
  assert.ok(!d.geste || d.l2[0].endsWith(' · ' + d.geste), 'le geste n’est dit que s’il est lu');
});

test('Résultats — un titre construit : « garde sa ceinture : 1re défense », « prend la ceinture » et la perte avec le rang après', () => {
  const win = partie();
  const r = lire(win, `const m=G.mgmt, div='H-light', t0=m.hist.length;
    const tenant=mgmtSplitTitle(m,div).id; const rows=mgmtDivisionRanking(m,div,'organization').filter(x=>x.id!==tenant);
    const out=[]; const fake=(w,l)=>{ const A=mgmtFighterById(m,w), B=mgmtFighterById(m,l);
      const side=f=>({id:f.id,name:f.name,first:f.first||'',last:f.last||f.name,div:f.div,age:f.age||25,W:3,L:1,D:0});
      m.hist.push({c:m.cycle,slot:'main',seed:1,rounds:5,a:side(A),b:side(B),winner:'A',family:'dec',round:5,p:true}); return m.hist.length-1; };
    const i=fake(tenant,rows[0].id); m.facts.push({c:m.cycle,k:'title_fight',div,fight:i,a:tenant,b:rows[0].id});
    return {tenant:!!tenant,i,issue:mgmtTitreIssue(m,i),k:mgmtSuDefenseRang(m,div,i),ch:mgmtSuChangements(m,{d:mgmtResultatDetail(m,i),i,k:0,main:true},true).map(c=>c.texte),
      defenses:mgmtCeintureLignee(m,div).actuel.defenses};`);
  /* la partie du fichier est rendue telle qu’elle était : le combat et le fait ajoutés disparaissent */
  win.eval(`const m=G.mgmt; m.hist.pop(); m.facts.pop(); mgmtRangsInvalider(m);`);
  assert.equal(win.eval('mgmtSoirees(G.mgmt).length'), PASSE + 1);
  assert.equal(r.tenant, true); assert.equal(r.issue, 'garde');
  assert.ok(r.k >= 1 && r.k === r.defenses, 'la défense compte comme la lignée');
  assert.ok(r.ch.some(t => /garde sa ceinture : \d+(?:re|e) défense$/.test(t)), r.ch.join(' | '));
});

test('Résultats — combat illisible : la ligne le dit, jamais une ligne vide', () => {
  const win = partie();
  win.eval(`globalThis.__orig=mgmtResultatDetail; const m=G.mgmt, s=mgmtSoirees(m).slice().reverse()[0], cible=mgmtSoireeAffichage(m,s)[1];
    mgmtResultatDetail=function(mm,i){ return i===cible?null:globalThis.__orig(mm,i); };`);
  try {
    ouvrir(win, 0, 1);
    const phrase = 'Un combat de cette soirée n\'a pas pu être relu.';
    const l = lignes(win, '.mf-re-cb .mf-re-col');
    assert.equal(l.length, lire(win, 'return mgmtSuResultatsListe(G.mgmt,mgmtSoirees(G.mgmt).slice().reverse()[0]).length;'), 'aucun combat retiré de la liste');
    assert.equal(l.filter(t => t === phrase).length, 1);
    assert.ok(l.every(t => t.trim().length > 0), 'aucune ligne vide');
    assert.ok(texte(win).includes(phrase));
    assert.equal(lire(win, `return document.querySelectorAll('.mf-re-det .mf-re-vide-t').length`), 1, 'le détail le dit aussi');
    touche(win, 'r'); touche(win, 'f'); assert.equal(win.eval('G.screen'), 'mgmt_resultats');
  } finally { win.eval('mgmtResultatDetail=globalThis.__orig;'); }
});

test('Résultats — clavier et souris : R, F, Entrée, flèches à sens unique, clic, molette dans la seule liste', () => {
  const win = partie(); ouvrir(win, 0);
  /* flèches : ← → la soirée, ↑ ↓ le combat ; Tab ne fait plus rien */
  touche(win, 'ArrowLeft'); assert.deepEqual(lire(win, 'return [MGMT_SU_RE.s,MGMT_SU_RE.i];'), [1, 0]);
  touche(win, 'ArrowDown'); assert.deepEqual(lire(win, 'return [MGMT_SU_RE.s,MGMT_SU_RE.i];'), [1, 1]);
  touche(win, 'ArrowUp'); assert.deepEqual(lire(win, 'return [MGMT_SU_RE.s,MGMT_SU_RE.i];'), [1, 0]);
  touche(win, 'ArrowRight'); assert.deepEqual(lire(win, 'return [MGMT_SU_RE.s,MGMT_SU_RE.i];'), [0, 0]);
  touche(win, 'Tab'); assert.deepEqual(lire(win, 'return [MGMT_SU_RE.s,MGMT_SU_RE.i];'), [0, 0]);
  /* F : la fiche du vainqueur, si on la trouve */
  assert.equal(win.eval('mgmtFicheLigne(G.mgmt,CL.mgmtSuReCourant().x.d.gagnant.id)!==null'), true);
  touche(win, 'f'); assert.equal(win.eval('G.screen'), 'mgmt_fiche'); assert.equal(win.eval('MGMT_FICHE.id===CL.mgmtSuReCourant().x.d.gagnant.id'), true);
  win.eval('CL.mgmtFicheRetour()'); assert.equal(win.eval('G.screen'), 'mgmt_resultats');
  /* R : revoir, seulement si le combat est revoyable */
  touche(win, 'r'); assert.equal(win.eval('G.screen'), 'mgmt_combat'); assert.equal(win.eval('MGMT_COMBAT.retour'), 'mgmt_resultats');
  win.eval('CL.mgmtCbPasser(); CL.mgmtCbRetour();'); assert.equal(win.eval('G.screen'), 'mgmt_resultats');
  /* Entrée : la prochaine chose à faire de l'Accueil */
  const p = lire(win, 'return mgmtAccueilContenu(G.mgmt).attend.prochaine;');
  win.eval('globalThis.__go=[]; globalThis.__cl=CL.go; CL.go=function(s){ globalThis.__go.push(s); return globalThis.__cl.apply(CL,arguments); };');
  try {
    touche(win, 'Enter');
    const cible = /CL\.go\('([a-z_]+)'\)/.exec(p.onclick);
    if (cible) assert.deepEqual(lire(win, 'return globalThis.__go;'), [cible[1]], 'Entrée suit la prochaine chose à faire');
    else assert.notEqual(win.eval('G.screen'), 'mgmt_resultats');
  } finally { win.eval('CL.go=globalThis.__cl;'); }
  win.eval(`CL.go('mgmt_resultats')`);
  /* souris : clic sur une soirée, sur un combat ; la molette n'agit que dans la liste */
  win.eval(`document.querySelectorAll('.mf-re-so')[2].click()`); assert.deepEqual(lire(win, 'return [MGMT_SU_RE.s,MGMT_SU_RE.i];'), [2, 0]);
  win.eval(`document.querySelectorAll('.mf-re-cb')[1].click()`); assert.deepEqual(lire(win, 'return [MGMT_SU_RE.s,MGMT_SU_RE.i];'), [2, 1]);
  assert.equal(win.eval(`document.querySelectorAll('[onwheel]').length`), 1);
  assert.equal(win.eval(`document.querySelector('[onwheel]').classList.contains('mf-re-liste')`), true);
  win.eval(`CL.mgmtSuReMolette({deltaY:120,preventDefault(){}})`);
  assert.deepEqual(lire(win, 'return [MGMT_SU_RE.s,MGMT_SU_RE.i,MGMT_SU_RE.fen];'), [2, 1, 1], 'la molette fait défiler la liste sans changer la sélection');
  win.eval(`CL.mgmtSuReMolette({deltaY:-120,preventDefault(){}}); CL.mgmtSuReMolette({deltaY:-120,preventDefault(){}})`);
  assert.equal(win.eval('MGMT_SU_RE.fen'), 0, 'bornée en haut');
  win.eval(`for(let k=0;k<40;k++) CL.mgmtSuReMolette({deltaY:120,preventDefault(){}})`);
  assert.equal(win.eval('MGMT_SU_RE.fen'), PASSE + 1 - 7, 'bornée en bas');
  /* les boutons de la souris existent pour chaque geste du clavier */
  ouvrir(win, 0);
  const onclicks = lire(win, `return [...document.querySelectorAll('.mf-touches button, .mf-re-actions button, .mf-re-jaune')].map(b=>b.getAttribute('onclick'));`);
  for (const g of ['CL.mgmtSuReRevoir()', 'CL.mgmtSuReFiche()', 'CL.mgmtSuReProchaine()']) assert.ok(onclicks.includes(g), g);
});

test('Résultats — un nom hostile est échappé partout (liste, tableau, détail, en-tête)', () => {
  const win = partie();
  const mal = '<img src=x onerror=alert(1)>';
  win.eval(`const m=G.mgmt, s=mgmtSoirees(m).slice().reverse()[0], i=mgmtSoireeAffichage(m,s)[0], t=m.hist[i];
    for(const c of [t.a,t.b]){ c.name=${JSON.stringify(mal)}; c.last=${JSON.stringify(mal)}; c.first=${JSON.stringify(mal)}; }`);
  ouvrir(win, 0);
  const html = win.eval(`document.getElementById('app').innerHTML`);
  assert.ok(!html.includes('<img'), 'aucune balise injectée');
  assert.ok(html.includes('&lt;img'), 'le nom est affiché échappé');
  assert.equal(win.eval(`document.querySelectorAll('#app img').length`), 0);
});

test('Résultats — jamais de texte sous 22 px (feuille de style et styles en ligne, tous les états)', () => {
  const bloc = css.slice(css.indexOf('Monde lot 10 T3 : Résultats'), css.indexOf('MONDE_LOT7_ACCUEIL_CSS'));
  assert.ok(bloc.length > 2000, 'le bloc de la planche est trouvé');
  const tailles = [...bloc.matchAll(/font-size:(\d+(?:\.\d+)?)px/g)].map(x => +x[1]);
  assert.ok(tailles.length > 15); assert.deepEqual(tailles.filter(t => t < 22), [], 'aucune lettre sous 22 px dans le bloc Résultats');
  assert.ok(!/font-size:\s*(\d+(?:\.\d+)?)(?:em|rem|%)/.test(bloc), 'toutes les tailles sont en px');
  const win = partie();
  const etats = [[0, 0], [1, 0], [0, 3], [2, 5]];
  for (const [s, i] of etats) {
    ouvrir(win, s, i);
    const px = lire(win, `return [...document.querySelectorAll('#app [style]')].map(x=>x.style.fontSize).filter(Boolean).map(parseFloat);`);
    assert.deepEqual(px.filter(t => t < 22), [], `styles en ligne (${s},${i})`);
    assert.ok(!/cycle/i.test(texte(win)), 'jamais « cycle »');
  }
  win.eval(`G.mgmt=mgmtParseAndValidate(${JSON.stringify(win.snap)}); MGMT_SU_RE={s:0,i:0,fen:0}; CL.go('mgmt_resultats');`);
  assert.deepEqual(lire(win, `return [...document.querySelectorAll('#app [style]')].map(x=>x.style.fontSize).filter(Boolean).map(parseFloat).filter(t=>t<22);`), []);
  const v = neuve(); ouvrir(v, 0);
  assert.deepEqual(lire(v, `return [...document.querySelectorAll('#app [style]')].map(x=>x.style.fontSize).filter(Boolean).map(parseFloat).filter(t=>t<22);`), []);
});
