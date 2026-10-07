"use strict";
/* ==== [ANCRE: MGMT_LOT5_T7_CAMPS] — Lot 5 T7, contrat §3 (M8) : les camps. Une
   salle et un coach sont des éléments du MONDE que le joueur observe et subit,
   sans gérer d'entraînement. Tout se déduit (règle du bureau) :
   - le camp d'origine vient de l'identifiant (ville du combattant, ou une
     autre ville de son pays pour 15 %) sur un flux séparé 'camp' ;
   - un changement de camp ou de coach est un MOMENT DE VIE déjà gardé
     (H5 : « Change de camp », « Dispute publique avec son coach », « Déménage
     dans une autre ville », « S'installe à l'étranger pour un camp », « Le
     coach meurt », « Le coach prend sa retraite ») : le camp à un cycle se lit
     dans ces faits, rien n'est stocké ;
   - la qualité du camp (cachée, jamais un chiffre) infléchit la forme, et un
     changement de camp coûte un rodage de deux cycles : la trajectoire se
     lit, et le bloc « Son camp » l'explique.
   Aucun nom de coach n'est écrit : il se tire des noms réels du pays. Les
   noms de salles viennent des modèles de mgmt-camps-data.js (relu:false). ==== */

/** Un nom de coach tiré des listes réelles du pays (engine.js), sous un
 *  hachage stable : SEED sauvegardé puis restauré, aucun tirage de partie. */
function mgmtCoachNom(ck,cle){
  const saved=SEED;
  try{
    setSeed(mgmtHashId('coach|'+ck+'|'+cle));
    const nm=makeName('H',ck);
    return nm.first+' '+nm.last;
  }finally{ setSeed(saved); }
}

function mgmtCampModele(ck,k){
  const lang=mgmtIdentiteLangue(ck);
  const liste=MGMT_SALLES_MODELES[lang]||MGMT_SALLES_MODELES.en;
  return liste[k%liste.length].texte;
}

/** Lot 10 : une ville n'a qu'une salle — son modèle de nom se tire de la ville, pas du combattant. Ainsi les combattants d'une
 *  même ville s'entraînent ensemble (c'est ce que l'écran Camps montre) au lieu d'une salle par tête. */
function mgmtCampSalleDeVille(ck,ville){ return duelFnv1a32('salle|'+ck+'|'+ville)%5; }

/** Un camp : {ville, ck, k (modèle), coachCle, nom, coach, qualite}. Pur. */
function mgmtCampFait(ck,ville,k,coachCle){
  const nom=mgmtCampModele(ck,k).replace('{Ville}',ville);
  const r=mgmtIdentiteStream('camp|'+ck+'|'+ville+'|'+k,'qualite');
  const u=r();
  return {ville,ck,k,coachCle,nom,coach:mgmtCoachNom(ck,ville+'|'+k+'|'+coachCle),
    qualite:u<0.2?-1:(u>0.8?1:0)};
}

/** Le camp d'origine : sa ville, ou (15 %) une autre ville de son pays. */
function mgmtCampInitial(f){
  const ck=mgmtIdentitePays(f);
  let ville=mgmtIdentiteVille(f);
  const r=mgmtIdentiteStream(f.id,'camp');
  if(r()<MGMT_CAMP_AILLEURS){
    const autres=MGMT_VILLES[ck].filter(v=>v!==ville);
    if(autres.length) ville=autres[Math.floor(r()*autres.length)];
  }
  return mgmtCampFait(ck,ville,mgmtCampSalleDeVille(ck,ville),0);
}

/** Les changements de camp et de coach d'un combattant de Split, du plus
 *  ancien au plus récent : lus dans les moments de vie gardés. Un moment à
 *  « part » < 1 ne change le camp que pour cette part des combattants
 *  (flux 'camp-part'). @returns {Array<{c:number,id:string,camp:boolean,coach:boolean,etranger:boolean}>} */
function mgmtCampChangements(m,f){
  const out=[];
  for(const x of m.facts||[]){
    if(!x||x.k!=='moment_vie'||x.a!==f.id) continue;
    const ch=MGMT_CAMP_CHANGEMENTS[x.m];
    if(!ch) continue;
    const prend=ch.part===undefined||ch.part>=1||mgmtIdentiteStream(f.id,'camp-part|'+x.m+'|'+x.c)()<ch.part;
    out.push({c:x.c,id:x.m,camp:!!ch.camp&&prend,coach:!!ch.coach,etranger:!!ch.etranger});
  }
  return out.sort((a,b)=>a.c-b.c);
}

/** Le camp d'un combattant à un cycle (par défaut le cycle courant) : le camp
 *  d'origine, puis un camp neuf à chaque changement (même pays, ou un autre
 *  pour « à l'étranger »), un nouveau coach à chaque départ de coach.
 *  Dérivé, jamais stocké. @returns {object} */
function mgmtCamp(m,f,cycle){
  const fin=Number.isSafeInteger(cycle)?cycle:m.cycle;
  let camp=mgmtCampInitial(f), n=0, dernierChangement=null;
  const changements=(m.roster||[]).some(o=>o.id===f.id)?mgmtCampChangements(m,f):[];
  for(const ch of changements){
    if(ch.c>fin) break;
    n++;
    if(ch.camp){
      const r=mgmtIdentiteStream(f.id,'camp|'+n);
      let ck=camp.ck;
      if(ch.etranger){
        const autres=COUNTRY_KEYS.filter(k=>k!==ck&&MGMT_VILLES[k]);
        ck=autres[Math.floor(r()*autres.length)];
      }
      const villes=MGMT_VILLES[ck].filter(v=>v!==camp.ville||ck!==camp.ck);
      const nv=villes[Math.floor(r()*villes.length)];
      camp=mgmtCampFait(ck,nv,mgmtCampSalleDeVille(ck,nv),n);
      dernierChangement={c:ch.c,id:ch.id,camp:true};
    }else if(ch.coach){
      camp=mgmtCampFait(camp.ck,camp.ville,camp.k,n);
      dernierChangement={c:ch.c,id:ch.id,camp:false};
    }
  }
  return {...camp,changement:dernierChangement,changements:n};
}

/** Le camp infléchit la forme : sa qualité, et un rodage de MGMT_CAMP_RODAGE
 *  cycles après un changement de camp. Points de `dynamic`, ± ; 0 pour qui
 *  n'a jamais changé et dont le camp est ordinaire. */
function mgmtCampForme(m,f,cycle){
  if(m.effectifs!==1||!(m.roster||[]).some(o=>o.id===f.id)) return 0;
  const camp=mgmtCamp(m,f,cycle);
  let forme=camp.qualite*MGMT_CAMP_FORME;
  const ch=camp.changement;
  if(ch&&ch.camp&&cycle-ch.c<MGMT_CAMP_RODAGE&&cycle>=ch.c) forme-=MGMT_CAMP_FORME;
  return forme;
}

/** Deux combattants du même camp (même salle, même ville). */
function mgmtMemeCamp(m,a,b){
  const ca=mgmtCamp(m,a), cb=mgmtCamp(m,b);
  return ca.ck===cb.ck&&ca.ville===cb.ville&&ca.k===cb.k;
}

/** « Son camp » (fiche) : la salle, la ville, le coach — et, si le camp ou le
 *  coach a changé, le moment qui l'explique (libellé du catalogue, tel quel)
 *  et le rodage. Ni jauge ni chiffre. */
function mgmtFicheCamp(m,f){
  if(m.effectifs!==1) return '';
  const camp=mgmtCamp(m,f);
  const pays=COUNTRIES[camp.ck];
  let html=`<h3>Son camp</h3><p>${esc(camp.nom)} · ${esc(pays.name)}</p><p>Coach : ${esc(camp.coach)}</p>`;
  if(camp.changement){
    const mo=mgmtVieMomentById(camp.changement.id);
    if(mo) html+=`<p class="mgmt-fiche-camp-changement">${esc(mo.libelle)} <span class="mgmt-fiche-vie-relais">cycle ${esc(camp.changement.c)}</span></p>`;
    if(camp.changement.camp&&m.cycle-camp.changement.c<MGMT_CAMP_RODAGE) html+='<p>Rodage dans le nouveau camp.</p>';
  }
  return html;
}
/* ==== [FIN ANCRE] ==== */
