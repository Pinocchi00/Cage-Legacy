"use strict";
/* Lot 8 du brief démo (09/10/2026) : la première demi-heure — l'arrivée, les six moments de Leïla, la prochaine étape, le réglage. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const res=(w,code)=>JSON.parse(w.eval(`JSON.stringify((function(){ ${code} })())`));
const neuve=()=>{ const w=newGameWindow({runMain:true}); w.eval(`mgmtRetraitProb=function(){return 0;}; setSeed(7); CL.mgmtEnter(1);`); return w; };

test('T1 — partie neuve : l’arrivée passe avant la carte ; partie reprise : elle ne repasse pas', () => {
  const w=neuve();
  const r=res(w,`const premier=G.screen, texte=document.getElementById('app').textContent; CL.mgmtArriveeFin(); const apres=G.screen;
    G.mgmt=null; CL.mgmtEnter(1); return {premier,apres,reprise:G.screen,titre:texte.includes('matchmaker de Split'.toUpperCase())||texte.toUpperCase().includes('MATCHMAKER DE SPLIT')};`);
  assert.deepEqual(r,{premier:'mgmt_arrivee',apres:'mgmt_carte',reprise:'mgmt_carte',titre:true});
});

test('T2 — les moments de Leïla sortent dans l’ordre de la partie, une seule fois chacun', () => {
  const w=neuve();
  const r=res(w,`const m=G.mgmt, vus=[]; const lire=ecran=>{ const id=mgmtPriseMoment(m,ecran); if(id&&!vus.includes(id)) vus.push(id); return id; };
    lire('mgmt_carte');                                              /* carte vide */
    const rows=mgmtCartRows(m).filter(f=>mgmtSelectable(m,f,null)); mgmtBookMain(m,rows[0].id,rows.find(x=>x.id!==rows[0].id&&mgmtSelectable(m,x,rows[0].id)).id);
    lire('mgmt_carte');                                              /* premier combat */
    const divs=[...new Set(mgmtCartRows(m).map(f=>f.div))]; let k=0;
    while(m.card.main.length<m.card.sizeMain-1&&k++<80){ const d=divs[k%divs.length]; const rr=mgmtCartRows(m).filter(f=>f.div===d&&mgmtSelectable(m,f,null)); const a=rr[0], b=a&&rr.find(x=>x.id!==a.id&&mgmtSelectable(m,x,a.id)); if(a&&b) mgmtBookMain(m,a.id,b.id); }
    m.pile=m.pile.filter(a=>a.kind!=='leila_bulk');
    const rr2=mgmtCartRows(m).filter(f=>mgmtSelectable(m,f,null)); m.pile=[];
    const x=rr2[0], y=rr2.find(z=>z.id!==x.id&&z.div===x.div&&mgmtSelectable(m,z,x.id)); mgmtBookMain(m,x.id,y.id);  /* cinquième : Leïla propose les préliminaires */
    lire('mgmt_carte');
    const bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open'); lire('mgmt_carte');
    if(bulk) mgmtDecide(m,bulk.id,'validate'); m.pile.forEach(a=>{ if(a.status==='open'){ a.status='closed'; a.decision='ignored'; } });
    lire('mgmt_carte');
    const encore=[mgmtPriseMoment(m,'mgmt_carte'),mgmtPriseMoment(m,'mgmt_carte')];
    return {vus,encore,pret:mgmtAgendaPret(m)};`);
  assert.equal(r.vus[0],'carte_vide'); assert.equal(r.vus[1],'premier_combat');
  const ordre=['carte_vide','premier_combat','carte_complete','prelims','soiree_prete'];
  assert.deepEqual(r.vus,ordre.filter(x=>r.vus.includes(x)),'dans l’ordre'); assert.equal(new Set(r.vus).size,r.vus.length,'une seule fois chacun');
});

test('T2 — le premier lendemain se dit une fois ; l’accompagnement coupé : aucun moment ne sort', () => {
  const w=neuve();
  const r=res(w,`const m=G.mgmt; m.eventsPlayed=1; const a=mgmtPriseMoment(m,'mgmt_lendemain'), b=mgmtPriseMoment(m,'mgmt_lendemain'); mgmtPriseMoment(m,'mgmt_carte'); const c=mgmtPriseMoment(m,'mgmt_lendemain');
    MGMT_PRISE={courant:null,vus:new Set()}; mgmtReglagesChanger('aide','accompagnement',false); m.eventsPlayed=0; const coupe=[mgmtPriseMoment(m,'mgmt_carte'),mgmtPriseMoment(m,'mgmt_carte')];
    mgmtReglagesChanger('aide','accompagnement',true);
    return {a,b,c,coupe};`);
  assert.equal(r.a,'premier_lendemain'); assert.equal(r.b,'premier_lendemain'); assert.equal(r.c,null); assert.deepEqual(r.coupe,[null,null]);
});

test('T2 — les moments déjà vus ne reviennent pas aux parties suivantes', () => {
  const w=neuve();
  const r=res(w,`const m=G.mgmt; const id=mgmtPriseMoment(m,'mgmt_carte'); mgmtPriseMarquer(id); MGMT_PRISE={courant:null,vus:null}; const apres=mgmtPriseMoment(m,'mgmt_carte'); return {id,apres,vus:[...mgmtPriseVus()]};`);
  assert.equal(r.id,'carte_vide'); assert.notEqual(r.apres,'carte_vide'); assert.ok(r.vus.includes('carte_vide'));
});

test('T3 — la ligne « prochaine étape » dit la même chose que la première ligne de « Ce qui empêche la soirée »', () => {
  const w=neuve();
  const r=res(w,`const m=G.mgmt; mgmtReglagesChanger('aide','accompagnement',false); const b=mgmtAgendaBlocages(m)[0], p=mgmtProchaineChose(m); CL.mgmtArriveeFin(); const html=document.getElementById('app').textContent;
    return {ok:!!b&&p.texte===b.texte&&p.onclick===b.onclick,visible:html.includes(b.texte)};`);
  assert.equal(r.ok,true); assert.equal(r.visible,true);
});

test('T3 — quand rien ne bloque, la ligne dit que la soirée est prête', () => {
  const w=neuve();
  const r=res(w,`const m=G.mgmt; mgmtAgendaBlocages=function(){ return []; }; return mgmtProchaineChose(m).texte;`);
  assert.equal(r,'La soirée est prête.');
});

test('T4 — le réglage « Accompagnement de Leïla » vit dans l’onglet Partie, hors des parties, et revient à « oui » par défaut', () => {
  const w=neuve();
  const r=res(w,`const ligne=MGMT_OP_LIGNES.partie.find(l=>l.cle==='accompagnement'); const defaut=MGMT_REGLAGES.aide.accompagnement;
    CL.mgmtOptions(); CL.mgmtOpOnglet('partie'); CL.mgmtOpChoisir('aide','accompagnement',1); const coupe=MGMT_REGLAGES.aide.accompagnement; const html=document.getElementById('app').textContent;
    return {ligne:!!ligne,defaut,coupe,html:html.includes('ACCOMPAGNEMENT DE LEÏLA')};`);
  assert.deepEqual(r,{ligne:true,defaut:true,coupe:false,html:true});
});

test('Les textes de la prise en main sont des propositions non relues, et Leïla y vouvoie', () => {
  const w=neuve();
  const r=res(w,'const t=[MGMT_PRISE_TEXTES.arrivee.titre,MGMT_PRISE_TEXTES.arrivee.leila,MGMT_PRISE_TEXTES.arrivee.bouton,MGMT_PRISE_TEXTES.prete,...Object.values(MGMT_PRISE_TEXTES.moments)]; return t;');
  assert.ok(r.every(x=>x.relu===false));
  assert.ok(r.every(x=>!/(^|[^a-zéèêà])(tu|ton|ta|tes|toi)([^a-zéèêà]|$)/i.test(x.texte)),'Leïla vouvoie');
});
