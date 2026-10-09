"use strict";
/* ==== [ANCRE: MGMT_LOT5_H3_IDENTITE] — Lot 5 H3, catalogue §1–5, §7–8,
   §10 : lectures pures, aucun DOM ni état dérivé persisté. Chaque couche
   possède un flux mulberry32 indépendant, semé par l'identifiant. ==== */
const MGMT_IDENTITE_GENERATION=1;

/** Retours d'Anthony du 09/10/2026 (« sur une partie de A à Z tout doit toujours être différent ») : chaque partie neuve porte sa graine (`m.graine`, lue sur la RNG à la création), et tout ce qui se déduit d'un identifiant s'en sale — le combattant « mg1 » n'a plus le même métier, le même surnom, la même voix dans deux parties. Sans graine (une partie d'avant) : le sel est vide, rien ne bouge. */
function mgmtSel(){
  const m=typeof G!=='undefined'&&G&&G.mgmt;
  return m&&typeof m.graine==='string'&&m.graine?m.graine+'|':'';
}
/** La graine d'une partie neuve : l'état de la RNG à cet instant (lecture seule, aucun tirage). */
function mgmtGraineNeuve(){ return (SEED>>>0).toString(36); }
function mgmtIdentiteStream(id,couche){
  return mulberry32(duelFnv1a32('mgmt-identite|'+mgmtSel()+String(id)+'|'+couche));
}
function mgmtIdentitePick(id,couche,liste){
  return liste[Math.floor(mgmtIdentiteStream(id,couche)()*liste.length)];
}
/** Retrouver l'origine ancienne sans consommer la RNG de la partie. Les
 *  homonymes entre pays suivent l'ordre stable de COUNTRIES. */
function mgmtIdentitePays(f){
  if(f.ck&&COUNTRY_KEYS.includes(f.ck)) return f.ck;
  /* Lot 5 H2 bis : les noms retirés des listes (COUNTRY_LAST_ANCIENS) servent
     encore à retrouver l'origine d'une ancienne sauvegarde. */
  const anciens=typeof COUNTRY_LAST_ANCIENS!=='undefined'?COUNTRY_LAST_ANCIENS:{};
  const porte=ck=>COUNTRIES[ck].last.includes(f.last)||(anciens[ck]||[]).includes(f.last);
  const connu=COUNTRY_KEYS.find(ck=>porte(ck)
    ||!f.last&&COUNTRIES[ck].last.some(last=>String(f.name).endsWith(' '+last)));
  return connu||mgmtIdentitePick(f.id,'pays-migration',COUNTRY_KEYS);
}
function mgmtIdentiteVille(f){
  const villes=MGMT_VILLES[mgmtIdentitePays(f)];
  const poids=villes.flatMap(v=>MGMT_VILLES_ECOLES.includes(v)?[v,v]:[v]);
  return mgmtIdentitePick(f.id,'ville',poids);
}
/** Points ajoutés puis normalisés, sans arrondi qui modifierait la loi. */
function mgmtIdentiteStylePoids(ck,ville){
  const pays=MGMT_STYLE_PAYS[ck], decalage=MGMT_STYLE_VILLE[ville]?.styles||{};
  const total=STYLE_KEYS.reduce((n,k)=>n+pays[k]+(decalage[k]||0),0);
  return Object.fromEntries(STYLE_KEYS.map(k=>[k,100*(pays[k]+(decalage[k]||0))/total]));
}
function mgmtIdentiteStyle(f){
  const poids=mgmtIdentiteStylePoids(mgmtIdentitePays(f),mgmtIdentiteVille(f));
  let tirage=mgmtIdentiteStream(f.id,'style')()*100;
  for(const k of STYLE_KEYS){ tirage-=poids[k]; if(tirage<0) return k; }
  return STYLE_KEYS[STYLE_KEYS.length-1];
}
function mgmtIdentiteMetier(f){
  return mgmtIdentitePick(f.id,'metier',Object.values(MGMT_METIERS).flat()).texte;
}
function mgmtIdentiteLangue(ck){
  if(['FR','BE','CH','MA','DZ','SN','CM'].includes(ck)) return 'fr';
  return ({BR:'pt',MX:'es',JP:'ja'})[ck]||'en';
}
/** Permutation locale : les collisions ne consomment aucune autre couche. */
function mgmtIdentiteMelange(liste,r){
  const out=liste.slice();
  for(let i=out.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); [out[i],out[j]]=[out[j],out[i]]; }
  return out;
}
function mgmtIdentiteSurnoms(f){
  const ck=mgmtIdentitePays(f), langue=mgmtIdentiteLangue(ck);
  const r=mgmtIdentiteStream(f.id,'surnom'), banque=MGMT_SURNOMS[langue];
  const locale=({RU:'ru',DAG:'ru',KZ:'ru',KG:'ru',KR:'ko',GE:'ge',PL:'pl'})[ck];
  let tous=Object.values(banque).flat();
  if(locale){
    // Catalogue §3.2 : anglais et une part de langue du pays, sans nouveau poids.
    const locaux=MGMT_SURNOMS[locale].general.filter(t=>t.texte!=='Batyr'||ck==='KZ'||ck==='KG');
    tous=tous.concat(locaux);
  }
  let priorite=[];
  if(langue==='fr'){
    const metier=mgmtIdentiteMetier(f);
    priorite=banque.metiers.filter(t=>t.texte.toLocaleLowerCase('fr').slice(3)===metier);
    if(!priorite.length){
      const style=mgmtIdentiteStyle(f);
      priorite=['wrestler','bjj','sambo'].includes(style)?banque.animaux:banque.armes;
    }
  }
  const textes=mgmtIdentiteMelange(priorite,r).concat(mgmtIdentiteMelange(tous,r)).map(t=>t.texte);
  const ville=mgmtIdentiteVille(f);
  // Motifs du catalogue §3.4, autorisés à épuisement pour toute langue par
  // Anthony lors de H3. Aucun mot ajouté, aucune traduction inventée.
  const motifs=MGMT_SURNOMS_PROVENANCE.map(t=>t.texte.replace('{ville}',ville).replace('{Ville}',ville));
  return [...new Set(textes.concat(mgmtIdentiteMelange(motifs,r)))];
}
/** Allocation déterministe dans la catégorie entière (Split + extérieur).
 *  L'ordre numérique de mgmtNextId conserve les attributions quand un nouveau
 *  combattant arrive. Les retraités restent réservés, aucun cache ni registre
 *  parallèle. Un transfert conservant l'id est dédoublonné. */
/** Le surnom d'un combattant par son identifiant (roster ou monde extérieur), pour l'afficher partout où l'on nomme (demande d'Anthony du 08/10/2026 : « ajoute dans le jeu les surnoms »).
 *  Les surnoms d'une catégorie s'allouent d'un bloc : on les garde par catégorie, le temps d'un cycle et d'un effectif. Pur. @returns {string} "" si inconnu. */
function mgmtSurnomDe(m,id){
  if(!m||!id) return '';
  const f=(m.roster||[]).find(o=>o.id===id)||(m.exterieur||[]).find(o=>o.id===id);
  if(!f||!f.div) return '';
  const cle=(m.cycle||0)+'|'+(m.roster?m.roster.length:0)+'|'+(m.exterieur?m.exterieur.length:0);
  if(MGMT_SURNOMS_MEMO.m!==m||MGMT_SURNOMS_MEMO.cle!==cle){ MGMT_SURNOMS_MEMO.m=m; MGMT_SURNOMS_MEMO.cle=cle; MGMT_SURNOMS_MEMO.par=new Map(); }
  if(!MGMT_SURNOMS_MEMO.par.has(f.div)) MGMT_SURNOMS_MEMO.par.set(f.div,mgmtIdentiteSurnomsDe(m,f.div));
  return MGMT_SURNOMS_MEMO.par.get(f.div).get(id)||'';
}
const MGMT_SURNOMS_MEMO={m:null,cle:'',par:new Map()};

function mgmtIdentiteSurnom(m,f){
  return mgmtIdentiteAllouer(m,f.div,f,f.id).get(f.id)||'';
}
/** Les surnoms de TOUTE une catégorie, en une seule passe (lot 5 H8, le
 *  vestiaire) : la même allocation que mgmtIdentiteSurnom, sans la refaire
 *  pour chaque ligne. @returns {Map<string,string>} id → surnom */
function mgmtIdentiteSurnomsDe(m,div){
  return mgmtIdentiteAllouer(m,div,null,null);
}
function mgmtIdentiteAllouer(m,div,extra,jusquA){
  const lignes=new Map();
  for(const o of [...(m?.roster||[]),...(m?.exterieur||[]),extra]){
    if(o&&o.div===div) lignes.set(o.id,o);
  }
  const ordre=(a,b)=>{
    const na=/^mg(\d+)$/.exec(a.id),nb=/^mg(\d+)$/.exec(b.id);
    if(na&&nb) return Number(na[1])-Number(nb[1]);
    return a.id<b.id?-1:a.id>b.id?1:0;
  };
  const pris=new Set(), sortie=new Map();
  for(const o of [...lignes.values()].sort(ordre)){
    const candidats=mgmtIdentiteSurnoms(o);
    let surnom=candidats.find(t=>!pris.has(t));
    // Décision Anthony H3 : après banque ET motifs de sa ville épuisés,
    // ordinal romain de désambiguïsation, jamais de texte inventé.
    if(!surnom){
      const base=candidats[candidats.length-1];
      let n=2;
      do{ surnom=base+' · '+mgmtIdentiteOrdinal(n++); }while(pris.has(surnom));
    }
    sortie.set(o.id,surnom);
    pris.add(surnom);
    if(jusquA!==null&&o.id===jusquA) break;
  }
  return sortie;
}
function mgmtIdentiteOrdinal(n){
  let texte='';
  for(const [valeur,signe] of [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']]){
    while(n>=valeur){ texte+=signe; n-=valeur; }
  }
  return texte;
}
function mgmtIdentite(m,f){
  const traits={};
  for(const key of ['discipline','ambition','loyaute','sangFroid','temperament','exposition','fairPlay']){
    traits[key]=1+Math.floor(mgmtIdentiteStream(f.id,'trait-'+key)()*20);
  }
  return {ville:mgmtIdentiteVille(f),
    milieu:mgmtIdentitePick(f.id,'milieu',MGMT_MILIEUX).texte,
    metier:mgmtIdentiteMetier(f),surnom:mgmtIdentiteSurnom(m,f),
    rituel:mgmtIdentitePick(f.id,'rituel',MGMT_RITUELS).texte,
    trajectoire:mgmtIdentitePick(f.id,'trajectoire',MGMT_TRAJECTOIRES).libelle,traits};
}
/* ==== [FIN ANCRE] ==== */
