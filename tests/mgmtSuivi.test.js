"use strict";
/* Brief du 06/10/2026, lot 10 : le suivi du monde — classements et leur évolution, lignée des ceintures, camps et spécialités,
   fil de nouvelles, archive des soirées et rejeu. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const jouer=require('./helpers/jouerSoirees');
const touche=(win,key)=>win.eval(`keysHandle({key:${JSON.stringify(key)},preventDefault(){}})`);
const res=(win,code)=>JSON.parse(win.eval(`JSON.stringify((function(){${code}})())`));
const texte=win=>win.eval(`document.getElementById('app').textContent`);
function neuve(seed){ const win=newGameWindow({runMain:true}); win.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(${seed||7}); CL.mgmtEnter(1);`); return win; }

/* Une partie de quarante soirées, jouée une fois pour les tests qui lisent le long terme. */
let LONGUE=null;
function longue(){
  if(!LONGUE){ LONGUE=neuve(7); LONGUE.joues=jouer(LONGUE,40,{titre:true}); }
  return LONGUE;
}

test('Classements — après une soirée, les places gagnées ou perdues sont la différence entre les deux classements', () => {
  const win=neuve(7); jouer(win,3);
  const r=res(win,`const m=G.mgmt, out=[];
    for(const d of allDivisions()){
      const cur=mgmtDivisionRanking(m,d.id,'organization'), prev=mgmtDivisionRanking(m,d.id,'organization',m.cycle-1);
      const l=mgmtClassementLignes(m,d.id,'organization');
      for(const x of l){ const i=cur.findIndex(y=>y.id===x.id), j=prev.findIndex(y=>y.id===x.id); out.push({delta:x.delta,attendu:j<0?'nouveau':j-i}); }
    }
    return {n:out.length,faux:out.filter(o=>o.delta!==o.attendu).length,bougé:out.filter(o=>typeof o.delta==='number'&&o.delta!==0).length};`);
  assert.ok(r.n>50); assert.equal(r.faux,0,'chaque évolution affichée est la différence entre les deux classements'); assert.ok(r.bougé>0,'la soirée a déplacé quelqu’un');
});

test('Classements — le champion en tête (C), puis les rangs 1, 2, 3 ; série et dernier combat lus sur les résultats', () => {
  const win=neuve(7); jouer(win,3);
  win.eval(`MGMT_SU_CL={sexe:'H',div:'H-light',curseur:0,portee:'organization'}; CL.go('mgmt_classements');`);
  assert.equal(win.eval(`document.querySelectorAll('.mf-su-champ').length`),1,'une carte de champion');
  assert.equal(win.eval(`document.querySelectorAll('.mf-su-rang').length`),2,'les rangs 1 et 2');
  assert.equal(win.eval(`document.querySelector('.mf-su-champ-c').textContent`),'C');
  assert.equal(win.eval(`document.querySelector('.mf-su-rang-n').textContent`),'1');
  assert.equal(win.eval(`document.querySelectorAll('.mf-su-ligne').length>0`),true);
  const l=res(win,`const l=mgmtClassementLignes(G.mgmt,'H-light','organization'); return {champ:l[0].champion,rangs:l.slice(1,6).map(x=>x.rang),serie:l.filter(x=>x.serie).length,dernier:l.filter(x=>x.dernier).length};`);
  assert.ok(l.champ); assert.deepEqual(l.rangs,[1,2,3,4,5]); assert.ok(l.serie>0); assert.ok(l.dernier>0);
  const t=texte(win); assert.ok(t.includes('Série en cours')); assert.ok(t.includes('Dernier combat')); assert.ok(t.includes('PLACES GAGNÉES OU PERDUES DEPUIS LA DERNIÈRE SOIRÉE'));
});

test('Classements — clavier : ↓ choisit, G change de sexe, Tab de catégorie, M le classement mondial ; Entrée ouvre la fiche', () => {
  const win=neuve(7); jouer(win,2);
  win.eval(`MGMT_SU_CL={sexe:'H',div:'H-light',curseur:0,portee:'organization'}; CL.go('mgmt_classements');`);
  touche(win,'ArrowDown'); assert.equal(win.eval('MGMT_SU_CL.curseur'),1);
  touche(win,'Tab'); assert.notEqual(win.eval('MGMT_SU_CL.div'),'H-light'); assert.equal(win.eval('MGMT_SU_CL.curseur'),0);
  touche(win,'g'); assert.equal(win.eval('MGMT_SU_CL.sexe'),'F');
  touche(win,'m'); assert.equal(win.eval('MGMT_SU_CL.portee'),'world');
  touche(win,'Enter'); assert.equal(win.eval('G.screen'),'mgmt_fiche');
  win.eval(`CL.mgmtFicheRetour()`); assert.equal(win.eval('G.screen'),'mgmt_classements');
});

test('Classements — une partie sans agenda (ancienne sauvegarde) garde l’ancien écran', () => {
  const win=neuve(7); win.eval(`G.mgmt.cal={actif:false}; CL.go('mgmt_classements');`);
  assert.equal(win.eval(`document.querySelectorAll('.mgmt-cl').length`),1); assert.equal(win.eval(`document.querySelectorAll('.mf-su-champ').length`),0);
});

test('Ceintures — le mur montre une ceinture par catégorie, champion, défenses, durée et prétendant', () => {
  const win=neuve(7); jouer(win,6,{titre:true});
  win.eval(`MGMT_SU_CE={sexe:'H',div:'',i:0,ouverte:false}; CL.go('mgmt_ceintures');`);
  const n=win.eval(`allDivisions().filter(d=>d.gender==='H').length`);
  assert.equal(win.eval(`document.querySelectorAll('.mf-su-ce').length`),n);
  const t=texte(win); assert.ok(t.includes('Prétendant')); assert.ok(t.includes('DÉFENSE')); assert.ok(t.includes(`${n} CEINTURES, UNE PAR CATÉGORIE`));
  const r=res(win,`const m=G.mgmt, d=allDivisions().find(x=>x.gender==='H'); const b=mgmtSplitTitle(m,d.id), p=mgmtPretendant(m,d.id);
    const rk=mgmtDivisionRanking(m,d.id,'organization'); return {champion:b.id,pret:p&&p.id,premierNonChampion:rk.find(x=>x.id!==b.id).id};`);
  assert.equal(r.pret,r.premierNonChampion,'le prétendant numéro un est le mieux classé qui n’est pas champion');
});

test('Ceintures — Entrée ouvre la ceinture (lignée, règne, dernière défense, prétendant), Échap revient au mur', () => {
  const win=neuve(7); jouer(win,6,{titre:true});
  win.eval(`MGMT_SU_CE={sexe:'H',div:'',i:3,ouverte:false}; CL.go('mgmt_ceintures');`);
  touche(win,'Enter'); assert.ok(win.eval('MGMT_SU_CE.ouverte'));
  const t=texte(win);
  for(const s of ['LA LIGNÉE','SON RÈGNE','SA DERNIÈRE DÉFENSE','LE PRÉTENDANT','Du champion actuel au tout premier.','OUVRIR SA FICHE'.toLowerCase()]) assert.ok(t.toLowerCase().includes(s.toLowerCase()),s);
  touche(win,'Tab'); assert.notEqual(win.eval('MGMT_SU_CE.div'),'H-light');
  touche(win,'Escape'); assert.ok(!win.eval('MGMT_SU_CE.ouverte')); assert.equal(win.eval('G.screen'),'mgmt_ceintures');
  const i0=win.eval('MGMT_SU_CE.i'); touche(win,'ArrowRight'); assert.equal(win.eval('MGMT_SU_CE.i'),i0+1);
});

test('Ceintures — la lignée d’une ceinture liste tous ses champions, dans l’ordre et sans trou, sur quarante soirées', () => {
  const win=longue();
  assert.equal(win.joues,40,'quarante soirées jouées');
  const r=res(win,`const m=G.mgmt, sorties=[];
    for(const d of allDivisions()){
      const L=mgmtCeintureLignee(m,d.id), b=mgmtSplitTitle(m,d.id);
      const decisifs=(m.facts||[]).filter(x=>x&&x.k==='title_fight'&&x.div===d.id&&m.hist[x.fight].winner!=='D').length;
      const initial=(m.facts||[]).some(x=>x&&x.k==='title_initial'&&x.div===d.id&&x.a);
      const somme=L.reigns.reduce((s,r)=>s+r.defenses,0);
      let ordre=true, raccord=true;
      for(let k=1;k<L.reigns.length;k++){ if(L.reigns[k].depuis<L.reigns[k-1].depuis) ordre=false; if(L.reigns[k-1].jusqua!==null&&L.reigns[k-1].jusqua!==L.reigns[k].depuis&&L.reigns[k-1].jusqua>L.reigns[k].depuis) raccord=false; }
      const ouverts=L.reigns.filter(r=>r.jusqua===null).length;
      sorties.push({div:d.id,n:L.reigns.length,decisifs,somme,initial,ordre,raccord,ouverts,tete:L.actuel?L.actuel.id:null,ceinture:b.id,titresJoues:(m.facts||[]).filter(x=>x&&x.k==='title_fight'&&x.div===d.id).length});
    }
    return sorties;`);
  assert.ok(r.some(x=>x.titresJoues>0),'des combats de titre ont eu lieu');
  for(const x of r){
    assert.ok(x.ordre,x.div+' : les règnes se suivent dans l’ordre'); assert.ok(x.raccord,x.div+' : chaque règne s’achève quand le suivant commence');
    assert.equal(x.somme+(x.n-(x.initial?1:0)),x.decisifs,x.div+' : chaque combat de titre décisif est une défense ou un changement de champion');
    assert.ok(x.ouverts<=1,x.div+' : un seul règne en cours');
    if(x.ceinture) assert.equal(x.tete,x.ceinture,x.div+' : le champion de la lignée est le détenteur de la ceinture');
  }
  assert.ok(r.some(x=>x.n>=2),'au moins une ceinture a changé de main en quarante soirées');
});

test('Camps — une salle par ville : les combattants de la même ville s’y entraînent ensemble, avec leur spécialité', () => {
  const win=neuve(7);
  const r=res(win,`const m=G.mgmt, l=mgmtCampsListe(m), tous=mgmtCampsToutes(m);
    const deux=tous.filter(g=>g.membres.length>=2).length;
    const memes=l.every(g=>g.membres.every(f=>mgmtMemeCamp(m,f,g.membres[0])));
    const a=mgmtCampsListe(m).map(g=>g.cle+'|'+g.specialite.id).join(';'), b=mgmtCampsListe(m).map(g=>g.cle+'|'+g.specialite.id).join(';');
    return {n:l.length,tous:tous.length,deux,memes,stable:a===b,roster:m.roster.length,total:tous.reduce((s,g)=>s+g.membres.length,0),specs:[...new Set(l.map(g=>g.specialite.id))].length};`);
  assert.ok(r.n>=3&&r.n<=r.tous); assert.ok(r.deux>=5,'plusieurs salles abritent deux combattants ou plus'); assert.ok(r.memes); assert.ok(r.stable);
  assert.ok(r.total<=r.roster&&r.total>r.roster-5,'chaque combattant est dans une salle'); assert.ok(r.specs>=2,'des spécialités différentes');
});

test('Camps — la spécialité pèse sur la progression : plein pour le style qui convient, moitié pour le fond, rien sinon, rien sans agenda', () => {
  const win=neuve(7);
  const r=res(win,`const m=G.mgmt; const out={};
    const camp=(id)=>MGMT_CAMP_SPECIALITES.find(s=>s.id===id);
    const f=m.roster[0]; const style=mgmtCombatProfile(f).style;
    const sauve=mgmtCampSpecialite;
    mgmtCampSpecialite=()=>({id:'x',styles:[style],libelle:'x'}); out.plein=mgmtCampSpecBonus(m,f);
    mgmtCampSpecialite=()=>({id:'y',styles:['__aucun__'],libelle:'y'}); out.rien=mgmtCampSpecBonus(m,f);
    mgmtCampSpecialite=()=>camp('cardio'); out.fond=mgmtCampSpecBonus(m,f);
    const cal=m.cal; m.cal={actif:false}; mgmtCampSpecialite=()=>({id:'x',styles:[style],libelle:'x'}); out.sansAgenda=mgmtCampSpecBonus(m,f); m.cal=cal;
    mgmtCampSpecialite=sauve; out.spec=MGMT_CAMP_SPEC; return out;`);
  assert.equal(r.plein,r.spec); assert.equal(r.rien,0); assert.equal(r.fond,r.spec/2); assert.equal(r.sansAgenda,0);
  /* Et le gain de niveau après un combat l'accompagne. */
  const g=res(win,`const m=G.mgmt, sauve=mgmtCampSpecialite; const f=m.roster[0]; f.age=Math.min(f.age,f.pic); f.niv=50; f.pot=75;
    const style=mgmtCombatProfile(f).style;
    mgmtCampSpecialite=()=>({id:'x',styles:[style],libelle:'x'}); const a=mgmtNiveauApresCombat(m,f,'win'); f.niv=50;
    mgmtCampSpecialite=()=>({id:'y',styles:['__aucun__'],libelle:'y'}); const b=mgmtNiveauApresCombat(m,f,'win'); mgmtCampSpecialite=sauve; return {a,b};`);
  assert.ok(g.a>g.b,'le style qui convient progresse plus vite ('+g.a+' > '+g.b+')');
});

test('Camps — l’écran défile les salles, annonce le refus, Entrée ouvre un combattant', () => {
  const win=neuve(7);
  win.eval(`MGMT_SU_CA={i:0}; CL.go('mgmt_camps');`);
  assert.equal(win.eval(`document.querySelectorAll('.mf-su-ca-gr').length`),1); assert.equal(win.eval(`document.querySelectorAll('.mf-su-ca-p:not(.vide)').length`),2,'une salle de chaque côté');
  const t=texte(win); for(const s of ['LE COACH','ON Y TRAVAILLE','COMBATTANTS CHEZ TOI']) assert.ok(t.includes(s),s);
  touche(win,'ArrowRight'); assert.equal(win.eval('MGMT_SU_CA.i'),1);
  touche(win,'ArrowLeft'); touche(win,'ArrowLeft'); assert.equal(win.eval('MGMT_SU_CA.i'),win.eval('mgmtCampsListe(G.mgmt).length-1'),'le défilé fait le tour');
  const refus=res(win,`const l=mgmtCampsListe(G.mgmt); return l.filter(g=>g.refus).length;`);
  assert.ok(refus>=1);
  win.eval(`MGMT_SU_CA.i=mgmtCampsListe(G.mgmt).findIndex(g=>g.refus); render();`);
  assert.ok(texte(win).includes('Les opposer les contrarie'));
  touche(win,'Enter'); assert.equal(win.eval('G.screen'),'mgmt_fiche');
});

test('Camps — deux combattants du même camp opposés sur une carte déclenchent le refus annoncé par l’écran', () => {
  const win=neuve(7);
  const r=res(win,`const m=G.mgmt; const g=mgmtCampsListe(m).find(x=>x.refus);
    let a=null,b=null; for(const f of g.membres){ for(const o of g.membres){ if(o.id!==f.id&&o.div===f.div&&mgmtSelectable(m,f,null)&&mgmtSelectable(m,o,f.id)){ a=f;b=o;break; } } if(a) break; }
    m.pile.forEach(x=>{x.status='closed';x.decision='ignored';}); m.open=null;
    if(!m.cal.prochaines.length) mgmtAgendaPoser(m,m.cal.jour+10,'petite');
    mgmtBookMain(m,a.id,b.id);
    const divs=[...new Set(mgmtCartRows(m).map(f=>f.div))]; let e=0;
    while(m.card.main.length<m.card.sizeMain&&e++<60){ const div=divs[e%divs.length]; const rows=mgmtCartRows(m).filter(f=>f.div===div&&mgmtSelectable(m,f,null)); const x=rows[0], y=x&&rows.find(z=>z.id!==x.id&&mgmtSelectable(m,z,x.id)); if(x&&y) mgmtBookMain(m,x.id,y.id); }
    const bulk=m.pile.find(p=>p.kind==='leila_bulk'&&p.status==='open'); if(bulk) mgmtDecide(m,bulk.id,'validate');
    const ok=!!mgmtAgendaJouer(m);
    const faits=(m.facts||[]).filter(x=>x&&x.k==='contrarie'&&x.why==='coequipier').map(x=>x.a);
    return {ok,a:a.id,b:b.id,faits};`);
  assert.ok(r.ok); assert.ok(r.faits.includes(r.a)&&r.faits.includes(r.b),'les deux coéquipiers en portent la charge');
});

test('Presse — le fil garde le type, la date et le combat de chaque nouvelle ; rejouer la mise à jour n’ajoute rien', () => {
  const win=neuve(7); jouer(win,4,{titre:true});
  const r=res(win,`const m=G.mgmt; const n0=m.fil.length; const a=mgmtFilMettreAJour(m), b=mgmtFilMettreAJour(m);
    const types=[...new Set(m.fil.map(x=>x.k))];
    const avecCombat=m.fil.filter(x=>Number.isSafeInteger(x.f)&&x.k==='presse');
    return {n0,a,b,types,avecCombat:avecCombat.length,combatsValides:avecCombat.every(x=>!!m.hist[x.f]),datees:m.fil.every(x=>Number.isSafeInteger(x.c)&&(x.j===undefined||x.j>=0))&&m.fil.some(x=>Number.isSafeInteger(x.j)),valide:validateMgmt(JSON.parse(JSON.stringify(m)))};`);
  assert.ok(r.n0>0); assert.equal(r.a,0); assert.equal(r.b,0,'rien de nouveau au second passage'); assert.ok(r.types.includes('presse')); assert.ok(r.avecCombat>0);
  assert.ok(r.combatsValides); assert.ok(r.datees,'chaque nouvelle porte son jour'); assert.ok(r.valide,'le fil se sauvegarde');
  const bad=res(win,`const m=JSON.parse(JSON.stringify(G.mgmt)); m.fil=[{k:'inconnu',c:1,a:'x'}]; return validateMgmt(m);`);
  assert.equal(bad,false,'un fil mal formé est refusé');
});

test('Presse — l’écran trie par défis, presse, public, combattants ; ← → choisit, Tab change de filtre', () => {
  const win=neuve(7); jouer(win,6,{titre:true});
  win.eval(`MGMT_SU_PR={filtre:'',i:0}; CL.go('mgmt_presse');`);
  const t=texte(win); for(const s of ['TOUT','DÉFIS','PRESSE','PUBLIC','COMBATTANTS']) assert.ok(t.includes(s),s);
  assert.equal(win.eval(`document.querySelectorAll('.mf-su-pt').length>0`),true);
  touche(win,'ArrowRight'); assert.equal(win.eval('MGMT_SU_PR.i'),1);
  touche(win,'Tab'); assert.equal(win.eval('MGMT_SU_PR.filtre'),'defi'); assert.equal(win.eval('MGMT_SU_PR.i'),0);
  touche(win,'Tab'); assert.equal(win.eval('MGMT_SU_PR.filtre'),'presse');
  const ok=res(win,`return mgmtFilListe(G.mgmt,'presse').every(x=>x.k==='presse')&&mgmtFilListe(G.mgmt,null).length>=mgmtFilListe(G.mgmt,'presse').length;`);
  assert.ok(ok);
});

test('Presse — une nouvelle de défi ouvre la carte sur le combat qu’elle réclame', () => {
  const win=neuve(7);
  const r=res(win,`const m=G.mgmt; m.pile.forEach(x=>{x.status='closed';x.decision='ignored';}); m.open=null;
    const rows=mgmtCartRows(m).filter(f=>mgmtSelectable(m,f,null)); const a=rows[0], b=rows.find(x=>x.id!==a.id&&x.div===a.div&&mgmtSelectable(m,x,a.id));
    m.facts.push({c:m.cycle,k:'demande',a:a.id,want:'revanche',target:b.id}); mgmtFilMettreAJour(m);
    MGMT_SU_PR={filtre:'defi',i:0}; CL.go('mgmt_presse');
    const x=mgmtFilListe(m,'defi')[0]; return {a:a.id,b:b.id,x:x&&{a:x.a,b:x.b},preparable:mgmtFilPreparable(m,x),quote:!!x.t};`);
  assert.equal(r.x.a,r.a); assert.equal(r.x.b,r.b); assert.ok(r.preparable); assert.ok(r.quote,'une parole dans sa voix');
  assert.ok(texte(win).includes('PRÉPARER CE COMBAT')||texte(win).toLowerCase().includes('préparer ce combat'));
  touche(win,'Enter');
  assert.equal(win.eval('G.screen'),'mgmt_carte');
  const o=res(win,`const m=G.mgmt; return {pick:MGMT_CART.pick,vise:mgmtCarteListe(m)[MGMT_CART.cursor].id};`);
  assert.equal(o.pick,r.a,'le premier combattant est choisi'); assert.equal(o.vise,r.b,'l’adversaire réclamé est visé');
  assert.ok(texte(win).toLowerCase().includes('confirmer le combat'));
});

test('Résultats — chaque soirée jouée est archivée, combat par combat, avec méthode et possibilité de revoir', () => {
  const win=neuve(7); jouer(win,3,{titre:true});
  const r=res(win,`const m=G.mgmt, s=mgmtSoirees(m); return {n:s.length,numeros:s.map(x=>x.n),combats:s.map(x=>x.idx.length),total:m.hist.length,joues:m.eventsPlayed};`);
  assert.equal(r.n,3); assert.deepEqual(r.numeros,[1,2,3]); assert.equal(r.combats.reduce((a,b)=>a+b,0),r.total); assert.equal(r.joues,3);
  win.eval(`MGMT_SU_RE={s:0,i:0}; CL.go('mgmt_resultats');`);
  const t=texte(win); for(const s of ['SOIRÉE 3','SOIRÉE 2','SOIRÉE 1','COMBAT PRINCIPAL','CO-PRINCIPAL']) assert.ok(t.includes(s),s);
  assert.ok(win.eval(`document.querySelector('.mf-su-h-titre').textContent.includes('BAT ')||document.querySelector('.mf-su-h-titre').textContent.includes('NUL')`));
  touche(win,'Tab'); assert.equal(win.eval('MGMT_SU_RE.s'),1); assert.ok(texte(win).includes('Soirée 2')||texte(win).includes('SOIRÉE 2'));
  touche(win,'ArrowRight'); assert.equal(win.eval('MGMT_SU_RE.i'),1);
  /* Lot 11 : avec l'agenda, revoir ouvre l'écran du combat animé (la planche « Le combat animé »), non plus l'arène d'origine ; le retour reste les résultats. */
  touche(win,'Enter'); assert.equal(win.eval('G.screen'),'mgmt_combat','Revoir ouvre le combat animé sur la trace');
  assert.equal(win.eval('MGMT_COMBAT.retour'),'mgmt_resultats');
});

test('Résultats — un combat de la première soirée se revoit à l’identique après quarante soirées', () => {
  const win=longue();
  const r=res(win,`const m=G.mgmt; const s=mgmtSoirees(m); const t=m.hist[0]; const rej=mgmtReplayFight(t);
    const d=mgmtResultatDetail(m,0);
    return {soirees:s.length,premier:s[0].n,dernier:s[s.length-1].n,winner:t.winner,rej:rej.winner,fidele:areneVerdictFidele(t,rej),methode:!!d.methode,
      memeTrace:JSON.stringify(m.hist[0])===JSON.stringify(m.hist[0]),familleRejouee:mgmtMethodFamily(rej.method,rej.winner)===t.family};`);
  assert.equal(r.soirees,40); assert.equal(r.premier,1); assert.equal(r.dernier,40);
  assert.equal(r.rej,r.winner,'le rejeu rend le même vainqueur'); assert.ok(r.fidele,'le verdict rejoué est fidèle'); assert.ok(r.familleRejouee,'même méthode'); assert.ok(r.methode);
  win.eval(`MGMT_SU_RE={s:39,i:0}; CL.go('mgmt_resultats');`);
  assert.ok(texte(win).includes('SOIRÉE 1')); assert.equal(win.eval(`mgmtSuResultatsListe(G.mgmt,mgmtSoirees(G.mgmt)[0]).length`),win.eval('mgmtSoirees(G.mgmt)[0].idx.length'));
  const sauve=res(win,`return validateMgmt(JSON.parse(JSON.stringify(G.mgmt)));`);
  assert.ok(sauve,'quarante soirées plus tard la partie se sauvegarde');
});

test('Barre — les cinq sections du suivi ouvrent leur écran', () => {
  const win=neuve(7);
  const r=res(win,`return ['ceintures','camps','presse','resultats','classements'].map(id=>MF_SECTIONS.find(s=>s.id===id).ecran);`);
  assert.deepEqual(r,['mgmt_ceintures','mgmt_camps','mgmt_presse','mgmt_resultats','mgmt_classements']);
  for(const e of r){ win.eval(`CL.go('${e}')`); assert.equal(win.eval('G.screen'),e); assert.ok(texte(win).length>100,e); }
});
