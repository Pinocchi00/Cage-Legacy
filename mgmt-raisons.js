"use strict";
/* ==== [ANCRE: MONDE_LOT6_T1_RAISON_CATALOGUE] — Monde lot 6 T1 ==== */
// Ordre de restitution, pas une priorité de booking. Le retour de blessure
// est omis : injury ne conserve pas l'échéance de guérison qui lui appartient.
const MGMT_RAISON_FAMILLES=Object.freeze([
  'revanche','rivalite-ouverte','series-croisees','classement-voisin',
  'test-jeune','derniere-chance','longue-attente','demande-promesse',
  'fin-contrat','styles-opposes','derby','debuts','veteran',
  'reclame-public','meme-categorie-jamais-affrontes'
]);
// Libellés publics de mgmtAnciensBilan, sans inférence sur les attributs.
const MGMT_RAISON_STYLES=Object.freeze({'Finit par KO':'frappe','Finit au sol':'sol'});

/* ==== [ANCRE: MONDE_LOT6_T4_RAISON_PHRASES] — Monde lot 6 T4 ==== */
/** Textes provisoires structurés pour l'affichage des preuves, sans reconstituer leur origine. */
const MGMT_RAISON_PHRASES=Object.freeze({
  'revanche':{l1:'Revanche après la victoire de {gagnant}, soirée {c}.',l2:'La revanche peut donner une suite à cette histoire.',relu:false},
  'rivalite-ouverte':{l1:'Revanche demandée pour la soirée {c}.',l2:'Le combat peut faire avancer cette rivalité.',relu:false},
  'series-croisees':{l1:'Série de {nA} victoires pour {a} et {nB} pour {b}.',l2:'Le combat peut départager leurs dynamiques.',relu:false},
  'classement-voisin':{l1:'Classement : {a} {rangA}, {b} {rangB}, catégorie {div}.',l2:'Le combat peut les départager au classement.',relu:false},
  'test-jeune':{l1:'Test : {a}, {age} ans, face à {b}.',l2:'Le combat peut mesurer son niveau.',relu:false},
  'derniere-chance':{l1:'{a} en série de {n} défaites.',l2:'Le résultat peut relancer sa trajectoire.',relu:false},
  'longue-attente':{l1:'{a} attend depuis {mois} mois.',l2:'Le combat peut le remettre en activité.',relu:false},
  'demande-promesse':{l1:'Engagement de {a} pour la soirée {c}.',l2:'Le combat peut tenir cet engagement.',relu:false},
  'fin-contrat':{l1:'Dernier combat du contrat de {a} ({restants} restant).',l2:'Le combat peut peser sur la suite.',relu:false},
  'styles-opposes':{l1:'Styles opposés : {styleA} et {styleB}.',l2:'Le combat mettra ces styles à l’épreuve.',relu:false},
  'derby':{l1:'Derby : même pays, {pays}, catégorie {div}.',l2:'Le combat peut faire valoir cette proximité.',relu:false},
  'debuts':{l1:'Débuts de {a} : {n} combat enregistré.',l2:'Le combat peut marquer ses débuts.',relu:false},
  'veteran':{l1:'{a} : {age} ans, {total} combats.',l2:'Le combat peut éprouver cette expérience.',relu:false},
  'reclame-public':{l1:'Combat réclamé par le public pour {c}.',l2:'Le combat peut répondre à cette attente.',relu:false},
  'meme-categorie-jamais-affrontes':{l1:'Même catégorie ({div}), aucun affrontement enregistré.',l2:'Le combat peut établir leur premier repère commun.',relu:false}
});

/* ==== [ANCRE: MONDE_LOT6_T4_RAISON_LIGNES] — Monde lot 6 T4 ==== */
/** Rend les deux lignes d'une preuve enregistrée, sans relecture de l'état de jeu.
 * @param {Object} m Partie contenant le roster pour résoudre les noms utiles.
 * @param {Object} raison Preuve persistée {famille,fait} et origine éventuelle.
 * @returns {{l1:string,l2:string}|null} HTML échappé des deux lignes, ou null si affichage interdit.
 */
function mgmtRaisonLignes(m,raison){
  if(!raison||raison.origine==='joueur'||!raison.famille||!raison.fait) return null;
  const phrases=MGMT_RAISON_PHRASES[raison.famille]; if(!phrases) return null;
  const f=raison.fait, fighter=id=>{const x=id&&mgmtFighterById(m,id);return x?(x.last||x.name):'Un combattant';};
  const cs=f.combattants||[], vars={a:fighter(f.a||cs[0]?.a),b:fighter(f.b||cs[1]?.a),gagnant:fighter(f.gagnant),
    mois:Number.isFinite(f.mois)?f.mois:'',cycles:Number.isFinite(f.cycles)?f.cycles:'',c:Number.isFinite(f.c)?f.c:'',div:f.div||'',
    rangA:cs[0]?.rang??'',rangB:cs[1]?.rang??'',age:f.age??'',total:f.total??'',n:f.n??'',restants:f.restants??'',pays:f.pays||'',
    nA:cs[0]?.n??'',nB:cs[1]?.n??'',styleA:cs[0]?.style||'',styleB:cs[1]?.style||''};
  const l1=phrases.l1.replace(/\{(\w+)\}/g,(_,k)=>String(vars[k]));
  if(/\{[^}]+\}/.test(l1)) return null;
  return {l1:esc(l1),l2:esc(phrases.l2)};
}

/* ==== [ANCRE: MONDE_LOT6_T1_RAISON_LECTURE] — Monde lot 6 T1 ==== */
/** Lit les familles justifiées pour deux combattants, sans mutation ni texte.
 * @param {Object} m Partie en mémoire.
 * @param {Object} fa Premier combattant.
 * @param {Object} fb Second combattant.
 * @returns {Array<Object>} {famille,fait} dans l'ordre du catalogue ; ids canoniques.
 */
function mgmtRaisonsPourPaire(m,fa,fb){
  if(!m||!fa||!fb||!fa.id||!fb.id||fa.id===fb.id) return [];
  // Les lecteurs publics ont des mémos globaux. Une copie locale empêche aussi
  // les accessoires publics de remplir un cache sur la partie ou sur G.
  const local=JSON.parse(JSON.stringify(m));
  const fs=[fa,fb].map(f=>JSON.parse(JSON.stringify(f))).sort((a,b)=>a.id<b.id?-1:1);
  local.roster=(local.roster||[]).map(f=>fs.find(x=>x.id===f.id)||f);
  const memo={...MGMT_ROLES_MEMO};
  try{ return mgmtRaisonsLire(local,fs); }
  finally{ Object.assign(MGMT_ROLES_MEMO,memo); }
}

/* ==== [ANCRE: MONDE_LOT6_T2_RAISON_INDEX] — Monde lot 6 T2 ==== */
/** Lit les preuves d'un ensemble de paires sans effet de bord. @param {Object} m Partie. @param {Array<Array<Object>>} paires Couples de combattants. @returns {Map<string,Array<Object>>} Clés ids triés joints par |, preuves {famille,fait}. */
function mgmtRaisonsIndex(m,paires){
  const out=new Map();
  if(!m) return out;
  const local=JSON.parse(JSON.stringify(m)), roster=local.roster||[];
  const origin=new Map(roster.map(f=>[f.id,JSON.stringify(f)])), lectures=new Map(), preparations=new Map();
  const prepare=f=>{
    if(!preparations.has(f)){
      const json=JSON.stringify(f);
      preparations.set(f,{json,identique:origin.get(f.id)===json});
    }
    const p=preparations.get(f);
    return {f:JSON.parse(p.json),identique:p.identique};
  };
  const memo={...MGMT_ROLES_MEMO};
  try{
    for(const [fa,fb] of paires){
      if(!fa||!fb||!fa.id||!fb.id||fa.id===fb.id) continue;
      const key=[fa.id,fb.id].sort().join('|');
      if(out.has(key)) continue;
      const prep=[prepare(fa),prepare(fb)], identiques=prep.every(p=>p.identique);
      const fs=prep.map(p=>p.f).sort((a,b)=>a.id<b.id?-1:1);
      local.roster=identiques?roster:roster.map(f=>fs.find(x=>x.id===f.id)||f);
      if(!identiques) MGMT_ROLES_MEMO.m=null;
      out.set(key,mgmtRaisonsLire(local,fs,identiques?lectures:new Map()));
      if(!identiques) MGMT_ROLES_MEMO.m=null;
    }
    return out;
  }finally{ Object.assign(MGMT_ROLES_MEMO,memo); }
}

/* ==== [ANCRE: MONDE_LOT6_T1_RAISON_PREUVES] — Monde lot 6 T1 ==== */
/** Lecteurs existants portés sur un état local ; aucune sélection dominante.
 * Chaque famille garde sa première preuve dans l'ordre des ids canoniques.
 * Les indices hist/facts se rapportent à la partie d'origine, non réordonnée.
 */
function mgmtRaisonsLire(m,fs,lectures){
  /* ==== [ANCRE: MONDE_LOT6_T2_LECTURES_LOCALES] — Monde lot 6 T2 ==== */
  // Seulement l'état local identique est partagé entre paires ; jamais un cache du jeu.
  const lit=(cle,fn)=>{
    if(!lectures) return fn();
    if(!lectures.has(cle)) lectures.set(cle,fn());
    return lectures.get(cle);
  };
  const [a,b]=fs, out=new Map(), ids=fs.map(f=>f.id);
  const ajoute=(famille,fait)=>{ if(!out.has(famille)) out.set(famille,{famille,fait}); };
  const paire=x=>ids.includes(x.a)&&ids.includes(x.b)&&x.a!==x.b;
  const rencontres=lit('affrontements',()=>mgmtAffrontements(m)).get(ids.join('|'))||[];
  const dernier=rencontres[rencontres.length-1];
  if(dernier&&dernier.gagnant) ajoute('revanche',{source:'hist',i:dernier.i,c:dernier.c,gagnant:dernier.gagnant,perdant:dernier.perdant});
  const reclames=lit('reclames',()=>mgmtReclamesRaisons(m)).filter(paire);
  for(const r of reclames){
    const fait={source:'reclames',a:r.a,b:r.b,raison:r.raison,c:r.c};
    ajoute('reclame-public',fait);
    if(r.raison==='micro'||r.raison==='reseaux') ajoute('rivalite-ouverte',{...fait});
  }
  const demandes=lit('demandes',()=>mgmtDemandesOuvertes(m));
  for(const d of demandes){
    if(ids.includes(d.a)&&d.want==='revanche'&&ids.includes(d.target)&&d.target!==d.a){
      ajoute('rivalite-ouverte',{source:'facts',i:d.i,a:d.a,target:d.target,c:d.c});
    }
  }
  const series=fs.map(f=>lit('serie|'+f.id,()=>mgmtSerie(m,f)));
  if(series.every(s=>s&&s.issue==='win'&&s.n>=3)) ajoute('series-croisees',{
    source:'serie',combattants:fs.map((f,i)=>({a:f.id,...series[i]}))
  });
  const rangs=a.div===b.div?lit('rangs|'+a.div,()=>mgmtClassementLignes(m,a.div,'organization')):[];
  const ra=rangs.find(r=>r.id===a.id), rb=rangs.find(r=>r.id===b.id);
  if(ra&&rb&&Math.abs(ra.rang-rb.rang)<=2) ajoute('classement-voisin',{
    source:'classement',portee:'organization',div:a.div,combattants:[{a:a.id,rang:ra.rang},{a:b.id,rang:rb.rang}]
  });
  const roles=fs.map(f=>lit('role|'+f.id,()=>mgmtRole(m,f)));
  const total=f=>(f.W||0)+(f.L||0)+(f.D||0);
  const veteran=f=>f.age>=33||total(f)>=20;
  for(let j=0;j<fs.length;j++){
    const f=fs[j], contre=fs[1-j], role=roles[j]?.id||null, autre=roles[1-j]?.id||null;
    const jeune=role==='espoir'||role==='invaincu'||(f.age<25&&total(f)<6);
    const installe=autre==='contender'||autre==='champion'||autre==='veteran'||veteran(contre);
    if(jeune&&installe) ajoute('test-jeune',{source:'roles',a:f.id,b:contre.id,role,contreRole:autre,age:f.age,total:total(f),contreAge:contre.age,contreTotal:total(contre)});
    const s=series[j];
    if(s&&s.issue==='loss'&&s.n>=2) ajoute('derniere-chance',{source:'serie',a:f.id,...s});
    /* ==== [ANCRE: MONDE_LOT6_T1_ATTENTE_SEUIL] — Monde lot 6 T1 ==== */
    const cycles=mgmtContratAttente(m,f), mois=cycles*MGMT_EVENT_WEEKS/4.345;
    if(mois>=6) ajoute('longue-attente',{source:'attente',a:f.id,cycles,mois:Math.round(mois),depuis:m.cycle-cycles});
    const rangContre=rangs.find(r=>r.id===contre.id);
    const compatible=d=>!['pause','carte-principale'].includes(d.want)
      &&((['revanche','trilogie'].includes(d.want)&&d.target===contre.id)
        ||(d.want==='un-classe'&&rangContre&&rangContre.rang<=15&&(!d.target||d.target===contre.id)));
    for(const d of demandes.filter(d=>d.a===f.id&&compatible(d))) ajoute('demande-promesse',{source:'facts',i:d.i,k:'demande',a:f.id,want:d.want,target:d.target,c:d.c});
    for(const p of lit('promesses|'+f.id,()=>mgmtPromesses(m,f)).filter(p=>p.etat==='en cours'&&compatible(p))) ajoute('demande-promesse',{source:'facts',i:p.i,k:'promesse',a:f.id,want:p.want,target:p.target,c:p.c,due:p.due});
    if(f.ct&&mgmtContratRestants(f)===1) ajoute('fin-contrat',{source:'contrat',a:f.id,n:f.ct.n,f:f.ct.f,restants:1});
    if(!lit('resultats|'+f.id,()=>mgmtResultats(m,f)).length) ajoute('debuts',{source:'hist',a:f.id,n:0});
    if(veteran(f)) ajoute('veteran',{source:'bilan',a:f.id,age:f.age,total:total(f)});
  }
  const styles=fs.map(f=>lit('style|'+f.id,()=>mgmtCarteStyleBilan(m,f).t));
  if(MGMT_RAISON_STYLES[styles[0]]&&MGMT_RAISON_STYLES[styles[1]]&&MGMT_RAISON_STYLES[styles[0]]!==MGMT_RAISON_STYLES[styles[1]]) ajoute('styles-opposes',{
    source:'bilan-public',combattants:fs.map((f,i)=>({a:f.id,style:styles[i]}))
  });
  const pays=fs.map(mgmtIdentitePays), villes=fs.map(mgmtIdentiteVille);
  if(pays[0]===pays[1]) ajoute('derby',{source:'identite',a:a.id,b:b.id,pays:pays[0],ville:villes[0]===villes[1]?villes[0]:null});
  if(a.div===b.div&&!rencontres.length) ajoute('meme-categorie-jamais-affrontes',{source:'hist',a:a.id,b:b.id,div:a.div,n:0});
  return MGMT_RAISON_FAMILLES.filter(k=>out.has(k)).map(k=>out.get(k));
}
