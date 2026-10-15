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
/* ==== [ANCRE: MONDE_LOT6_T5_RAISON_VARIANTES] — Monde lot 6 T5 ==== */
/** Textes provisoires structurés pour l'affichage des preuves, sans reconstituer leur origine.
 *  Trois formulations par famille : la première est celle livrée par T4, les deux
 *  suivantes sont des variantes ; toutes portent `relu:false` et n'emploient que
 *  les champs réellement enregistrés dans la preuve. */
const MGMT_RAISON_PHRASES=Object.freeze({
  'revanche':{relu:false,variantes:[
    {l1:'Revanche après la victoire de {gagnant}, soirée {c}.',l2:'La revanche peut donner une suite à cette histoire.',relu:false},
    {l1:'La soirée {c} a tourné pour {gagnant} ; la revanche peut rouvrir le dossier.',l2:'Ce combat peut répondre à cette soirée.',relu:false},
    {l1:'{gagnant} l’a emporté en soirée {c} ; {il} peut reprendre cette histoire.',l2:'La revanche peut écrire la suite de la soirée {c}.',relu:false}
  ]},
  'rivalite-ouverte':{relu:false,variantes:[
    {l1:'Revanche demandée pour la soirée {c}.',l2:'Le combat peut faire avancer cette rivalité.',relu:false},
    {l1:'{a} avait réclamé ce combat pour la soirée {c}.',l2:'Le combat peut prolonger cette demande.',relu:false},
    {l1:'{a} réclame ce combat pour la soirée {c} ; {il} ne lâche pas cette rivalité.',l2:'Le combat peut trancher cette rivalité ouverte.',relu:false}
  ]},
  'series-croisees':{relu:false,variantes:[
    {l1:'Série de {nA} victoires pour {a} et {nB} pour {b}.',l2:'Le combat peut départager leurs dynamiques.',relu:false},
    {l1:'{a} reste sur {nA} victoires, {b} sur {nB}.',l2:'Le combat peut croiser ces deux séries.',relu:false},
    {l1:'{a} aligne {nA} victoires ; {il} peut confirmer cette série face à {b}.',l2:'Le combat peut départager deux séries encore vives.',relu:false}
  ]},
  'classement-voisin':{relu:false,variantes:[
    {l1:'Classement : {a} {rangA}, {b} {rangB}, catégorie {div}.',l2:'Le combat peut les départager au classement.',relu:false},
    {l1:'{a} est {rangA}, {b} est {rangB} en {div}.',l2:'Le combat peut faire bouger ce voisinage.',relu:false},
    {l1:'Écart de classement en {div} : {rangA} contre {rangB}.',l2:'Le combat peut rapprocher ou écarter ces deux rangs.',relu:false}
  ]},
  'test-jeune':{relu:false,variantes:[
    {l1:'Test : {a}, {age} ans, face à {b}.',l2:'Le combat peut mesurer son niveau.',relu:false},
    {l1:'{a}, {age} ans, monte face à {b}.',l2:'Le combat peut situer son niveau réel.',relu:false},
    {l1:'{a} a {age} ans ; {il} passe un vrai test contre {b}.',l2:'Le combat peut montrer où {il} en est.',relu:false}
  ]},
  'derniere-chance':{relu:false,variantes:[
    {l1:'{a} en série de {n} défaites.',l2:'Le résultat peut relancer sa trajectoire.',relu:false},
    {l1:'{a} enchaîne {n} défaites.',l2:'Le résultat peut décider de sa suite.',relu:false},
    {l1:'{a} reste sur {n} défaites ; {il} joue gros ici.',l2:'Le combat peut relancer ou arrêter cette série.',relu:false}
  ]},
  'longue-attente':{relu:false,variantes:[
    {l1:'{a} attend depuis {mois} mois.',l2:'Le combat peut le remettre en activité.',relu:false},
    {l1:'{a} n’a plus combattu depuis {mois} mois ; {il} patiente encore.',l2:'Le combat peut raccourcir cette attente.',relu:false},
    {l1:'{mois} mois sans combat pour {a} ; {il} attend une date.',l2:'Le combat peut rompre cette attente.',relu:false}
  ]},
  'demande-promesse':{relu:false,variantes:[
    {l1:'Engagement de {a} pour la soirée {c}.',l2:'Le combat peut tenir cet engagement.',relu:false},
    {l1:'{a} a pris un engagement pour la soirée {c}.',l2:'Le combat peut honorer cette promesse.',relu:false},
    {l1:'{a} a promis ce combat pour {c} ; {il} peut le tenir.',l2:'Le combat peut répondre à cette promesse.',relu:false}
  ]},
  'fin-contrat':{relu:false,variantes:[
    {l1:'Dernier combat du contrat de {a} ({restants} restant).',l2:'Le combat peut peser sur la suite.',relu:false},
    {l1:'Contrat de {a} : {restants} combat restant.',l2:'Le combat peut décider de la suite du contrat.',relu:false},
    {l1:'{restants} combat restant au contrat de {a} ; {il} est à un tournant.',l2:'Le combat peut peser sur son avenir.',relu:false}
  ]},
  'styles-opposes':{relu:false,variantes:[
    {l1:'Styles opposés : {styleA} et {styleB}.',l2:'Le combat mettra ces styles à l’épreuve.',relu:false},
    {l1:'{styleA} contre {styleB} : deux styles à l’opposé.',l2:'Le combat peut trancher ce duel de styles.',relu:false},
    {l1:'Styles à l’opposé, {styleA} et {styleB}.',l2:'Le combat peut dire quel style tient.',relu:false}
  ]},
  'derby':{relu:false,variantes:[
    {l1:'Derby : même pays, {pays}, catégorie {div}.',l2:'Le combat peut faire valoir cette proximité.',relu:false},
    {l1:'Deux combattants du même pays : {pays}.',l2:'Le combat peut faire parler cette proximité.',relu:false},
    {l1:'Même drapeau, {pays}, pour ce combat.',l2:'Le combat peut valoir un derby local.',relu:false}
  ]},
  'debuts':{relu:false,variantes:[
    {l1:'Débuts de {a} : {n} combat enregistré.',l2:'Le combat peut marquer ses débuts.',relu:false},
    {l1:'Premier combat enregistré pour {a}.',l2:'Le combat peut écrire sa première ligne.',relu:false},
    {l1:'{a} n’a encore aucun combat enregistré ; {il} débute ici.',l2:'Le combat peut poser un premier repère.',relu:false}
  ]},
  'veteran':{relu:false,variantes:[
    {l1:'{a} : {age} ans, {total} combats.',l2:'Le combat peut éprouver cette expérience.',relu:false},
    {l1:'{total} combats et {age} ans pour {a}.',l2:'Le combat peut éprouver ce long parcours.',relu:false},
    {l1:'{a}, {age} ans, {total} combats ; {il} en a vu d’autres.',l2:'Le combat peut ajouter une ligne à ce parcours.',relu:false}
  ]},
  'reclame-public':{relu:false,variantes:[
    {l1:'Combat réclamé par le public pour {c}.',l2:'Le combat peut répondre à cette attente.',relu:false},
    {l1:'Le public réclame ce combat pour la soirée {c}.',l2:'Le combat peut répondre à cette demande.',relu:false},
    {l1:'Le public attend ce combat pour la soirée {c}.',l2:'Le combat peut combler cette attente.',relu:false}
  ]},
  'meme-categorie-jamais-affrontes':{relu:false,variantes:[
    {l1:'Même catégorie ({div}), aucun affrontement enregistré.',l2:'Le combat peut établir leur premier repère commun.',relu:false},
    {l1:'{div} : aucun affrontement enregistré dans cette catégorie.',l2:'Le combat peut poser un premier repère.',relu:false},
    {l1:'Même catégorie {div}, premier face-à-face à venir.',l2:'Le combat peut créer un premier précédent.',relu:false}
  ]}
});

/* ==== [ANCRE: MONDE_LOT6_T4_RAISON_LIGNES] — Monde lot 6 T4 ==== */
/* ==== [ANCRE: MONDE_LOT6_T5_RAISON_SELECTION] — Monde lot 6 T5 ==== */
/** Identifiants des deux combattants d'une paire (objets ou ids), triés ; vide sinon. */
function mgmtRaisonIds(paire){
  const xs=Array.isArray(paire)?paire:(paire&&(paire.a!=null||paire.b!=null)?[paire.a,paire.b]:[]);
  const ids=xs.filter(x=>x!=null).map(x=>String(typeof x==='object'?x.id:x)).filter(Boolean);
  return ids.length===2?ids.slice().sort():[];
}
/** Catégorie de la paire : première division portée par un combattant (objet ou id). */
function mgmtRaisonDivision(m,paire){
  const xs=Array.isArray(paire)?paire:(paire&&(paire.a!=null||paire.b!=null)?[paire.a,paire.b]:[]);
  for(const x of xs){
    if(!x) continue;
    if(typeof x==='object'){ if(x.div) return x.div; continue; }
    const f=mgmtFighterById(m,x); if(f&&f.div) return f.div;
  }
  return '';
}
/** Hachage stable d'une chaîne (djb2) : aucun RNG, même entrée → même index. */
function mgmtRaisonHachage(s){ let h=5381; for(let i=0;i<s.length;i++) h=((h*33)^s.charCodeAt(i))>>>0; return h; }
/** Rend les deux lignes d'une preuve enregistrée, sans relecture de l'état de jeu.
 * @param {Object} m Partie contenant le roster pour résoudre les noms utiles.
 * @param {Object} raison Preuve persistée {famille,fait} et origine éventuelle.
 * @param {Array<Object|string>} [paire] Les deux combattants concernés : fixe la variante
 *  (hachage stable des identifiants triés) et la catégorie d'accord ; absent, première variante.
 * @returns {{l1:string,l2:string}|null} HTML échappé des deux lignes, ou null si affichage interdit.
 */
function mgmtRaisonLignes(m,raison,paire){
  if(!raison||raison.origine==='joueur'||!raison.famille||!raison.fait) return null;
  const entree=MGMT_RAISON_PHRASES[raison.famille]; if(!entree||!entree.variantes||!entree.variantes.length) return null;
  const f=raison.fait, fighter=id=>{const x=id&&mgmtFighterById(m,id);return x?(x.last||x.name):'Un combattant';};
  const cs=f.combattants||[], vars={a:fighter(f.a||cs[0]?.a),b:fighter(f.b||cs[1]?.a),gagnant:fighter(f.gagnant),
    mois:Number.isFinite(f.mois)?f.mois:'',cycles:Number.isFinite(f.cycles)?f.cycles:'',c:Number.isFinite(f.c)?f.c:'',div:f.div||'',
    rangA:cs[0]?.rang??'',rangB:cs[1]?.rang??'',age:f.age??'',total:f.total??'',n:f.n??'',restants:f.restants??'',pays:f.pays||'',
    nA:cs[0]?.n??'',nB:cs[1]?.n??'',styleA:cs[0]?.style||'',styleB:cs[1]?.style||''};
  const ids=mgmtRaisonIds(paire), variantes=entree.variantes;
  const idx=ids.length===2?mgmtRaisonHachage(raison.famille+'|'+ids.join('|'))%variantes.length:0;
  const phrases=variantes[idx], genre={div:mgmtRaisonDivision(m,paire)};
  const rendu=src=>{
    const rempli=String(src).replace(/\{(\w+)\}/g,(mot,k)=>Object.prototype.hasOwnProperty.call(vars,k)?String(vars[k]):mot);
    return mgmtAccord(genre,rempli);
  };
  const l1=rendu(phrases.l1), l2=rendu(phrases.l2);
  if(/\{[^}]+\}/.test(l1)||/\{[^}]+\}/.test(l2)) return null;
  return {l1:esc(l1),l2:esc(l2)};
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
