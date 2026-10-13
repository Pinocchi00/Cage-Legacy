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

/* ==== [ANCRE: MONDE_LOT6_T1_RAISON_PREUVES] — Monde lot 6 T1 ==== */
/** Lecteurs existants portés sur un état local ; aucune sélection dominante.
 * Chaque famille garde sa première preuve dans l'ordre des ids canoniques.
 * Les indices hist/facts se rapportent à la partie d'origine, non réordonnée.
 */
function mgmtRaisonsLire(m,fs){
  const [a,b]=fs, out=new Map(), ids=fs.map(f=>f.id);
  const ajoute=(famille,fait)=>{ if(!out.has(famille)) out.set(famille,{famille,fait}); };
  const paire=x=>ids.includes(x.a)&&ids.includes(x.b)&&x.a!==x.b;
  const rencontres=mgmtAffrontements(m).get(ids.join('|'))||[];
  const dernier=rencontres[rencontres.length-1];
  if(dernier&&dernier.gagnant) ajoute('revanche',{source:'hist',i:dernier.i,c:dernier.c,gagnant:dernier.gagnant,perdant:dernier.perdant});
  const reclames=mgmtReclamesRaisons(m).filter(paire);
  for(const r of reclames){
    const fait={source:'reclames',a:r.a,b:r.b,raison:r.raison,c:r.c};
    ajoute('reclame-public',fait);
    if(r.raison==='micro'||r.raison==='reseaux') ajoute('rivalite-ouverte',{...fait});
  }
  const demandes=mgmtDemandesOuvertes(m);
  for(const d of demandes){
    if(ids.includes(d.a)&&d.want==='revanche'&&ids.includes(d.target)&&d.target!==d.a){
      ajoute('rivalite-ouverte',{source:'facts',i:d.i,a:d.a,target:d.target,c:d.c});
    }
  }
  const series=fs.map(f=>mgmtSerie(m,f));
  if(series.every(s=>s&&s.issue==='win'&&s.n>=3)) ajoute('series-croisees',{
    source:'serie',combattants:fs.map((f,i)=>({a:f.id,...series[i]}))
  });
  const rangs=a.div===b.div?mgmtClassementLignes(m,a.div,'organization'):[];
  const ra=rangs.find(r=>r.id===a.id), rb=rangs.find(r=>r.id===b.id);
  if(ra&&rb&&Math.abs(ra.rang-rb.rang)<=2) ajoute('classement-voisin',{
    source:'classement',portee:'organization',div:a.div,combattants:[{a:a.id,rang:ra.rang},{a:b.id,rang:rb.rang}]
  });
  const roles=fs.map(f=>mgmtRole(m,f));
  const total=f=>(f.W||0)+(f.L||0)+(f.D||0);
  const veteran=f=>f.age>=33||total(f)>=20;
  for(let j=0;j<fs.length;j++){
    const f=fs[j], contre=fs[1-j], role=roles[j]?.id||null, autre=roles[1-j]?.id||null;
    const jeune=role==='espoir'||role==='invaincu'||(f.age<25&&total(f)<6);
    const installe=autre==='contender'||autre==='champion'||autre==='veteran'||veteran(contre);
    if(jeune&&installe) ajoute('test-jeune',{source:'roles',a:f.id,b:contre.id,role,contreRole:autre,age:f.age,total:total(f),contreAge:contre.age,contreTotal:total(contre)});
    const s=series[j];
    if(s&&s.issue==='loss'&&s.n>=2) ajoute('derniere-chance',{source:'serie',a:f.id,...s});
    const cycles=mgmtContratAttente(m,f), mois=Math.round(cycles*MGMT_EVENT_WEEKS/4.345);
    if(mois>=6) ajoute('longue-attente',{source:'attente',a:f.id,cycles,mois,depuis:m.cycle-cycles});
    const rangContre=rangs.find(r=>r.id===contre.id);
    const compatible=d=>!['pause','carte-principale'].includes(d.want)
      &&((['revanche','trilogie'].includes(d.want)&&d.target===contre.id)
        ||(d.want==='un-classe'&&rangContre&&rangContre.rang<=15&&(!d.target||d.target===contre.id)));
    for(const d of demandes.filter(d=>d.a===f.id&&compatible(d))) ajoute('demande-promesse',{source:'facts',i:d.i,k:'demande',a:f.id,want:d.want,target:d.target,c:d.c});
    for(const p of mgmtPromesses(m,f).filter(p=>p.etat==='en cours'&&compatible(p))) ajoute('demande-promesse',{source:'facts',i:p.i,k:'promesse',a:f.id,want:p.want,target:p.target,c:p.c,due:p.due});
    if(f.ct&&mgmtContratRestants(f)===1) ajoute('fin-contrat',{source:'contrat',a:f.id,n:f.ct.n,f:f.ct.f,restants:1});
    if(!mgmtResultats(m,f).length) ajoute('debuts',{source:'hist',a:f.id,n:0});
    if(veteran(f)) ajoute('veteran',{source:'bilan',a:f.id,age:f.age,total:total(f)});
  }
  const styles=fs.map(f=>mgmtCarteStyleBilan(m,f).t);
  if(MGMT_RAISON_STYLES[styles[0]]&&MGMT_RAISON_STYLES[styles[1]]&&MGMT_RAISON_STYLES[styles[0]]!==MGMT_RAISON_STYLES[styles[1]]) ajoute('styles-opposes',{
    source:'bilan-public',combattants:fs.map((f,i)=>({a:f.id,style:styles[i]}))
  });
  const pays=fs.map(mgmtIdentitePays), villes=fs.map(mgmtIdentiteVille);
  if(pays[0]===pays[1]) ajoute('derby',{source:'identite',a:a.id,b:b.id,pays:pays[0],ville:villes[0]===villes[1]?villes[0]:null});
  if(a.div===b.div&&!rencontres.length) ajoute('meme-categorie-jamais-affrontes',{source:'hist',a:a.id,b:b.id,div:a.div,n:0});
  return MGMT_RAISON_FAMILLES.filter(k=>out.has(k)).map(k=>out.get(k));
}
