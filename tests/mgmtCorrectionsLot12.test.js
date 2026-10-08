"use strict";
/* Brief des corrections du 08/10/2026, lot 12 (D6) : l'écran Nouvelle partie ne promet rien de faux. Chaque ligne se déduit d'un réglage que le jeu lit, un aperçu chiffré
   de l'organisation choisie accompagne la carte, et aucune organisation n'est injouable. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const res=(w,code)=>JSON.parse(w.eval(`JSON.stringify((function(){ ${code} })())`));

test('12 — Chaque réglage d’un profil est lu par le jeu, et chaque ligne affichée est reliée à un réglage lu : sinon ce test échoue', () => {
  const win=newGameWindow({runMain:true});
  const r=res(win,`const lus=MGMT_ORG_REGLAGES_LUS; const horsListe=[], sansRegle=[];
    for(const o of MGMT_ORGANISATIONS){ for(const k of Object.keys(o.profil)) if(!lus.includes(k)) horsListe.push(o.nom+'.'+k);
      const a=mgmtOrgAtouts(o.profil); for(const x of a.regles) if(!lus.includes(x.reglage)) sansRegle.push(o.nom+' : '+x.texte);
      if(a.regles.length!==a.plus.length+a.moins.length) sansRegle.push(o.nom+' : ligne sans règle'); }
    for(const [reglage] of MGMT_ORG_ATOUTS_REGLES) if(!lus.includes(reglage)) sansRegle.push('règle '+reglage);
    return {horsListe,sansRegle};`);
  assert.deepEqual(r.horsListe,[]); assert.deepEqual(r.sansRegle,[]);
});

test('12 — L’écran Nouvelle partie affiche exactement les lignes déduites du profil, et l’aperçu chiffré de l’organisation choisie', () => {
  const win=newGameWindow({runMain:true});
  win.eval(`CL.mgmtNouvelle(2); CL.mgmtNouvelleChoisir(1);`);
  const r=res(win,`const cartes=[...document.querySelectorAll('.mf-org')].map(c=>[...c.querySelectorAll('.mf-org-ligne')].map(l=>l.textContent.trim()));
    const attendu=MGMT_ORGANISATIONS.map(o=>{ const a=mgmtOrgAtouts(o.profil); return a.plus.concat(a.moins); });
    const tuiles=[...document.querySelectorAll('.mf-org-tuile')].map(t=>t.textContent);
    return {cartes,attendu,tuiles,apercu:mgmtOrgApercu(MGMT_ORGANISATIONS[1]).map(x=>x.k+x.v)};`);
  assert.deepEqual(r.cartes,r.attendu);
  assert.equal(r.tuiles.length,6); assert.deepEqual(r.tuiles,r.apercu);
  win.eval(`CL.mgmtNouvelleChoisir(6)`);
  assert.match(win.eval(`document.querySelector('.mf-org-apercu-nom').textContent`),/Pure Impact/i);
});

test('12 — Les bourses de l’organisation sont lues : la même vedette coûte plus cher chez Garden of Blood que chez MMA Korner', () => {
  const win=newGameWindow({runMain:true});
  const r=res(win,`const par=id=>{ setSeed(11); const m=mgmtDefault(id); mgmtNewRoster(m); m.pop=50; const f=m.roster[0]; f.W=10;f.L=6; return mgmtBourseSouhaitee(m,f,false); };
    return {garden:par('garden-of-blood'),korner:par('mma-korner'),split:par('split')};`);
  assert.ok(r.garden>r.split&&r.split>r.korner,JSON.stringify(r));
});

test('12 — Aucune organisation n’est injouable : sur 12 soirées, chacune garde une carte remplissable et un public qui ne s’effondre pas (pas plus de dix points perdus)', () => {
  const win=newGameWindow({runMain:true});
  const r=res(win,`mgmtRetraitProb=function(){return 0;}; const out={};
    for(const o of MGMT_ORGANISATIONS){ setSeed(20261008); const m=mgmtDefault(o.id); mgmtNewRoster(m); mgmtExteriorEnsure(m); mgmtNewPile(m); G={theme:'dark',mgmt:m}; mgmtAgendaInit(m); let joues=0;
      for(let k=0;k<12;k++){ m.pile.forEach(x=>{x.status='closed';x.decision='ignored';}); m.open=null;
        for(const f of m.roster){ if(mgmtIsRetired(f)||f.libre||!f.ct||mgmtContratRestants(f)>1) continue; mgmtContratRenouveler(m,f.id,3,mgmtBourseSouhaitee(m,f,true)); }
        if(!m.cal.prochaines.length) mgmtAgendaPoser(m,m.cal.jour+MGMT_EVENT_WEEKS*7,'petite');
        const divs=[...new Set(mgmtCartRows(m).map(f=>f.div))]; let e=0;
        while(m.card.main.length<m.card.sizeMain&&e++<60){ const div=divs[(k+m.card.main.length+e)%divs.length]; const rows=mgmtCartRows(m).filter(f=>f.div===div&&mgmtSelectable(m,f,null)).sort((x,y)=>mgmtStar(y)-mgmtStar(x)); const a=rows[0], b=a&&rows.find(x=>x.id!==a.id&&mgmtSelectable(m,x,a.id)); if(a&&b) mgmtBookMain(m,a.id,b.id); }
        const bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open'); if(!bulk) mgmtOfferBulk(m,true); const b2=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open'); if(b2) mgmtDecide(m,b2.id,'validate');
        if(!mgmtAgendaJouer(m)) break; joues++; mgmtNewPile(m); }
      out[o.id]={joues,pop:m.pop,depart:o.profil.popularite,caisse:m.treasury}; }
    return out;`);
  for(const [id,x] of Object.entries(r)){ assert.equal(x.joues,12,id+' joue ses 12 soirées'); assert.ok(x.pop>=x.depart-10,id+' : popularité '+x.pop+' pour un départ à '+x.depart); }
});
