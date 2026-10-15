"use strict";
/* ==== [ANCRE: MONDE_LOT6_T4_TEST_AFFICHAGE] — Monde lot 6 T4 ==== */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {newGameWindow}=require('./helpers/loadGame');
const win=newGameWindow({runMain:true});

test('Monde lot 6 T4 — mgmtRaisonLignes rend deux lignes depuis la preuve sans relecture',()=>{
  const r=JSON.parse(win.eval(`(()=>{const m=mgmtDefault(),f={famille:'longue-attente',fait:{source:'attente',cycles:8,mois:7,a:'<img>'}};mgmtRaisonsPourPaire=()=>{throw Error('relecture interdite')};return JSON.stringify(mgmtRaisonLignes(m,f));})()`));
  assert.match(r.l1,/7 mois/);
  assert.match(r.l1,/Un combattant/);
  assert.equal(win.eval("MGMT_RAISON_PHRASES['longue-attente'].relu"),false);
  assert.match(r.l2,/remettre en activité/);
});

test('Monde lot 6 T4 — origine joueur et preuve absente ne produisent aucune ligne',()=>{
  assert.equal(win.eval(`mgmtRaisonLignes({},null)`),null);
  assert.equal(win.eval(`mgmtRaisonLignes({}, {origine:'joueur',famille:'debuts',fait:{}})`),null);
});

test('Monde lot 6 T4 — les préliminaires omettent une raison nulle sans exception',()=>{
  assert.doesNotThrow(()=>win.eval(`(()=>{const m=mgmtDefault();G.mgmt=m;G.screen='mgmt_prelims';return scr_mgmt_prelims();})()`));
  const html=win.eval(`(()=>{const m=mgmtDefault();G.mgmt=m;G.screen='mgmt_prelims';return scr_mgmt_prelims();})()`);
  assert.doesNotMatch(html,/mf-pre-pourquoi/);
});

/* ==== [ANCRE: MONDE_LOT6_T5_TEST_VARIANTES] — Monde lot 6 T5 ==== */
test('Monde lot 6 T5 — chaque famille possède trois formulations marquées relu:false',()=>{
  const r=JSON.parse(win.eval(`(()=>{
    const out={};
    for(const k of MGMT_RAISON_FAMILLES){
      const e=MGMT_RAISON_PHRASES[k];
      out[k]={relu:e?e.relu:null,n:e&&e.variantes?e.variantes.length:0,relus:e&&e.variantes?e.variantes.map(v=>v.relu):[],
        complete:!!(e&&e.variantes)&&e.variantes.every(v=>typeof v.l1==='string'&&v.l1.length>0&&typeof v.l2==='string'&&v.l2.length>0)};
    }
    return JSON.stringify({familles:MGMT_RAISON_FAMILLES.slice(),cles:Object.keys(MGMT_RAISON_PHRASES),out});
  })()`));
  assert.equal(r.cles.length,15,'exactement les 15 identifiants livrés');
  assert.equal(new Set(r.cles).size,15,'aucun identifiant en double');
  assert.ok(!r.cles.includes('retour-blessure'),'la famille blessure reste omise');
  for(const k of r.familles){
    const e=r.out[k]; assert.ok(e,'famille '+k+' présente au catalogue');
    assert.equal(e.relu,false,k+' relu:false');
    assert.ok(e.n>=3,k+' : au moins trois formulations');
    assert.ok(e.complete,k+' : chaque formulation a deux lignes pleines');
    assert.ok(e.relus.length>=3&&e.relus.every(x=>x===false),k+' : chaque formulation marquée relu:false');
  }
});

test('Monde lot 6 T5 — les variantes respectent la preuve sans inventer de fait',()=>{
  const cases=[
    {k:'revanche',fait:{source:'hist',i:1,c:41,gagnant:'g'},marker:'41'},
    {k:'rivalite-ouverte',fait:{source:'facts',i:1,a:'x',target:'y',c:41},marker:'41'},
    {k:'series-croisees',fait:{source:'serie',combattants:[{a:'x',n:4},{a:'y',n:6}]},marker:'4'},
    {k:'classement-voisin',fait:{source:'classement',div:'Poids coq',combattants:[{a:'x',rang:2},{a:'y',rang:3}]},marker:'Poids coq'},
    {k:'test-jeune',fait:{source:'roles',a:'x',b:'y',age:22},marker:'22'},
    {k:'derniere-chance',fait:{source:'serie',a:'x',n:5},marker:'5'},
    {k:'longue-attente',fait:{source:'attente',a:'x',mois:7},marker:'7 mois'},
    {k:'demande-promesse',fait:{source:'facts',i:1,a:'x',c:41},marker:'41'},
    {k:'fin-contrat',fait:{source:'contrat',a:'x',restants:1},marker:'1'},
    {k:'styles-opposes',fait:{source:'bilan-public',combattants:[{a:'x',style:'frappe'},{a:'y',style:'sol'}]},marker:'frappe'},
    {k:'derby',fait:{source:'identite',pays:'<i>Kiwi</i>'},marker:'&lt;i&gt;Kiwi&lt;/i&gt;'},
    {k:'debuts',fait:{source:'hist',a:'x',n:0},marker:'Un combattant'},
    {k:'veteran',fait:{source:'bilan',a:'x',age:34,total:21},marker:'34'},
    {k:'reclame-public',fait:{source:'reclames',a:'x',c:41},marker:'41'},
    {k:'meme-categorie-jamais-affrontes',fait:{source:'hist',a:'x',b:'y',div:'Poids coq'},marker:'Poids coq'}
  ];
  const res=JSON.parse(win.eval(`(()=>{const m=mgmtDefault();const cases=${JSON.stringify(cases)};const out={};
    for(const c of cases){const base={famille:c.k,fait:c.fait};const vus=[],cles=new Set();
      for(let i=0;i<2000&&vus.length<3;i++){const r=mgmtRaisonLignes(m,base,[{id:'p'+i,div:'H-fly'},{id:'q'+i,div:'H-fly'}]);
        if(r){const cle=r.l1+' '+r.l2;if(!cles.has(cle)){cles.add(cle);vus.push(cle);}}}
      out[c.k]={marker:c.marker,vals:vus};}
    return JSON.stringify(out);})()`));
  for(const c of cases){
    const {marker,vals}=res[c.k];
    assert.equal(vals.length,3,c.k+' : les trois variantes sont atteignables');
    for(const v of vals){
      assert.ok(!/\{/.test(v),c.k+' : aucune substitution inachevée');
      assert.ok(v.includes(marker),c.k+' : la valeur de la preuve est citée ('+marker+')');
    }
  }
  const derby=res.derby.vals;
  assert.ok(derby.every(v=>!v.includes('<i>Kiwi')),'derby : le HTML joueur reste échappé');
  assert.ok(derby.every(v=>v.includes('&lt;i&gt;Kiwi&lt;/i&gt;')),'derby : la substitution HTML est échappée');
});

test('Monde lot 6 T5 — les accords féminins sont corrects',()=>{
  const r=JSON.parse(win.eval(`(()=>{
    const m=mgmtDefault();
    const base={famille:'longue-attente',fait:{source:'attente',cycles:8,mois:7,a:'zzz'}};
    const prem=mgmtRaisonLignes(m,base);
    for(let i=0;i<2000;i++){
      const fem=mgmtRaisonLignes(m,base,[{id:'a'+i,div:'F-fly'},{id:'b'+i,div:'F-fly'}]);
      if(fem&&(fem.l1!==prem.l1||fem.l2!==prem.l2)){
        const mas=mgmtRaisonLignes(m,base,[{id:'a'+i,div:'H-fly'},{id:'b'+i,div:'H-fly'}]);
        return JSON.stringify({prem,fem,mas});
      }
    }
    return JSON.stringify({prem,fem:null});
  })()`));
  assert.ok(r.fem,'une variante non première doit être atteignable');
  const femTxt=r.fem.l1+' '+r.fem.l2, masTxt=r.mas.l1+' '+r.mas.l2;
  assert.ok(!/\{(Il|il|lui|delui)\}/.test(femTxt),'aucun jeton d’accord oublié pour une combattante');
  assert.match(femTxt,/\belle\b/,'la combattante s’accorde au féminin');
  assert.ok(!/\b(il|lui)\b/.test(femTxt),'aucun pronom masculin pour une combattante');
  assert.ok(!/\{(Il|il|lui|delui)\}/.test(masTxt),'aucun jeton d’accord oublié pour un combattant');
  assert.match(masTxt,/\bil\b/,'le combattant reste au masculin');
  assert.ok(!/elle/.test(masTxt),'aucun féminin pour un combattant');
});

test('Monde lot 6 T5 — le choix de formulation est déterministe',()=>{
  const r=JSON.parse(win.eval(`(()=>{
    const m=mgmtDefault();
    const base={famille:'veteran',fait:{source:'bilan',a:'z',age:34,total:21}};
    const p=[{id:'x1',div:'H-fly'},{id:'x2',div:'H-fly'}];
    const r1=mgmtRaisonLignes(m,base,p),r2=mgmtRaisonLignes(m,base,p);
    const r3=mgmtRaisonLignes(m,base,[{id:'x2',div:'H-fly'},{id:'x1',div:'H-fly'}]);
    const sans=mgmtRaisonLignes(m,base);
    return JSON.stringify({r1,r2,r3,sans});
  })()`));
  assert.deepEqual(r.r1,r.r2,'même preuve et même paire → même variante');
  assert.deepEqual(r.r1,r.r3,'l’ordre des identifiants ne change pas la variante (tri)');
  assert.match(r.sans.l1,/: 34 ans, 21 combats/,'sans paire : la première formulation de T4 est conservée');
  assert.match(r.sans.l2,/éprouver cette expérience/,'sans paire : la seconde ligne de T4 est conservée');
});
