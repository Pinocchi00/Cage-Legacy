"use strict";
/* ==== [ANCRE: P9_T2_POSTE_CALCUL] — Monde lot 43 T1 ==== */
/** Niveau de confiance en mots : conf 4 est le meilleur (« Il est ravi », indice 0 des données), conf 0 le pire (« Il n’y croit plus », indice 4). */
function mgmtPosteNiveau(conf){
  const l=MGMT_POSTE.seuils.phrases, i=4-(Number.isSafeInteger(conf)?Math.max(0,Math.min(4,conf)):2);
  return l[i]||l[2];
}
function mgmtPostePatron(m){
  const o=typeof mgmtOrgParNom==='function'?mgmtOrgParNom(mgmtOrgNom(m)):null;
  if(o&&typeof o.patron==='string'&&o.patron.trim()) return o.patron.trim();
  /* Le patron de Split existe déjà dans les textes du jeu (mgmt-retraits.js : « Jean-Michel Delatour (le patron) »). */
  return mgmtOrgNom(m)==='Split'?'Jean-Michel Delatour':'le patron';
}
function mgmtPosteValide(p){
  if(!p||typeof p!=='object'||Array.isArray(p)||!Number.isSafeInteger(p.debut)||!Number.isSafeInteger(p.fin)||p.fin<=p.debut||!Number.isSafeInteger(p.salaire)||p.salaire<0||!Number.isSafeInteger(p.saison)||p.saison<1||!Array.isArray(p.obj)||p.obj.length<3||p.obj.length>5||!Number.isInteger(p.conf)||p.conf<0||p.conf>4||typeof p.mi!=='boolean'||!Array.isArray(p.hist)||p.hist.length>12)return false;
  if(!p.obj.every(o=>o&&typeof o==='object'&&MGMT_POSTE.types.includes(o.t)&&Number.isFinite(o.cible)&&['cours','tenu','manque','fait'].includes(o.e)&&Number.isFinite(o.v)))return false;
  return p.hist.every(h=>h&&Number.isSafeInteger(h.s)&&h.s>=0&&Number.isInteger(h.conf)&&h.conf>=0&&h.conf<=4&&typeof h.note==='string'&&/^[a-z-]{1,24}$/.test(h.note));
}
function mgmtPosteRang(m){
  const rows=typeof mgmtOrgClassement==='function'?mgmtOrgClassement(m):null;
  const id=typeof mgmtPredecesseurOrgId==='function'?mgmtPredecesseurOrgId(m):null;
  const row=rows&&rows.find(x=>x.id===id); return row?row.rang:4;
}
function mgmtPosteInit(m){
  if(!m||m.poste) return m&&m.poste||null;
  const manque=mgmtManque(m), objs=[];
  if(manque&&manque.objectif&&manque.objectif.cible) objs.push({t:'manque',cible:1,e:'cours',v:0});
  const rang=mgmtPosteRang(m), pop=mgmtOrgProfil(m).popularite;
  const candidats=[
    {t:'lourd-top15',cible:15},{t:'rang-orgs',cible:Math.max(1,rang-1)},
    {t:'champion-top5',cible:5},{t:'caisse',cible:0},
    {t:'popularite',cible:MGMT_POSTE.seuils.popularite.find(x=>x>pop)||Math.min(100,pop+10)}
  ];
  for(const o of candidats){
    if(objs.length>=4) break;
    const acquis=o.t==='rang-orgs'&&rang<=o.cible||o.t==='popularite'&&pop>=o.cible;
    if(!acquis) objs.push({t:o.t,cible:o.cible,e:'cours',v:0});
  }
  if(objs.length<3) objs.push({t:'salle',cible:0,e:'cours',v:0});
  m.poste={debut:typeof mgmtCalAujourdhui==='function'?mgmtCalAujourdhui(m):0,fin:(typeof mgmtCalAujourdhui==='function'?mgmtCalAujourdhui(m):0)+MGMT_POSTE.duree,salaire:MGMT_POSTE.salaire,saison:1,obj:objs,conf:2,mi:false,hist:[]};
  return m.poste;
}
function mgmtPosteValeur(m,o){
  if(o.t==='manque') return o.e==='tenu'?1:0;
  if(o.t==='lourd-top15') return (m.roster||[]).filter(f=>f&&f.div==='H-heavy'&&(mgmtDivisionRanking(m,f.div,'world')||[]).findIndex(r=>r.id===f.id)<15).length;
  if(o.t==='champion-top5') return (m.roster||[]).some(f=>f&&mgmtChampionIds(m).has(f.id)&&(mgmtDivisionRanking(m,f.div,'world')||[]).findIndex(r=>r.id===f.id)<5)?1:0;
  if(o.t==='rang-orgs') return mgmtPosteRang(m);
  if(o.t==='caisse') return m.treasury;
  if(o.t==='popularite') return Number.isFinite(m.pop)?m.pop:mgmtOrgProfil(m).popularite;
  if(o.t==='salle') return m.audiences&&m.audiences.length?m.audiences[m.audiences.length-1]:0;
  return 0;
}
function mgmtPosteSoiree(m){
  const p=m&&m.poste; if(!p)return null;
  let positif=0,negatif=0;
  p.obj.forEach(o=>{const v=mgmtPosteValeur(m,o);o.v=v;
    const atteint=o.t==='rang-orgs'?v<=o.cible:o.t==='caisse'?v>=o.cible:o.t==='popularite'?v>=o.cible:o.t==='manque'?v>0:v>0;
    if(atteint){if(o.e!=='tenu'&&o.e!=='fait')positif++;o.e='tenu';}else if(o.e!=='fait')o.e='cours';
  });
  if(m.treasury<0)negatif++;else if(m.treasury>0)positif++;
  const aud=m.audiences&&m.audiences[m.audiences.length-1]||0;
  if(aud>=MGMT_MAIN_SIZE)positif++;else if(aud>0&&aud<=MGMT_MAIN_SIZE/2)negatif++;
  const rang=mgmtPosteRang(m), prev=Number.isSafeInteger(p.rg)?p.rg:rang;   /* le rang précédent vit dans la sauvegarde : une partie rechargée se comporte comme une session continue */
  if(rang<prev)positif++;else if(rang>prev)negatif++;
  p.rg=rang;
  const avant=p.conf; p.conf=Math.max(0,Math.min(4,avant+(positif>negatif?1:negatif>positif?-1:0)));
  const jour=typeof mgmtCalAujourdhui==='function'?mgmtCalAujourdhui(m):m.eventsPlayed*35;
  if(!p.mi&&jour-p.debut>=MGMT_POSTE.mi)p.mi=true;
  p.hist.push({s:m.eventsPlayed,conf:p.conf,note:positif>negatif?'progres':negatif>positif?'recul':'stable'});
  if(p.hist.length>12)p.hist.shift(); return p;
}
function mgmtPosteBilan(m){
  const p=m&&m.poste;if(!p)return null;
  const objTenus=p.obj.filter(o=>o.e==='tenu'||o.e==='fait').length,objTotal=p.obj.length,ratio=objTotal?objTenus/objTotal:0;
  const aug=p.conf>=MGMT_POSTE.seuils.augmente.conf&&ratio>=MGMT_POSTE.seuils.augmente.tenus;
  const condition=p.conf>=MGMT_POSTE.seuils.condition.conf&&ratio>=MGMT_POSTE.seuils.condition.tenus;
  return {issue:aug?'prolonge-augmente':condition?'prolonge-condition':'renvoi',salaire:aug?Math.round(p.salaire*1.25):p.salaire,duree:MGMT_POSTE.duree,objTenus,objTotal};
}
/* ==== [ANCRE: P9_T4_OFFRES] — Monde lot 58 T1 ==== */
/** Offres sont un complément facultatif : elles ne changent jamais l'organisation active. */
function mgmtOffresValide(offres){
  if(!Array.isArray(offres)||offres.length>3)return false;
  return offres.every(o=>o&&typeof o==='object'&&!Array.isArray(o)&&typeof o.orgId==='string'&&!!mgmtOrgParId(o.orgId)&&typeof o.poste==='string'&&o.poste.length<=80&&Number.isSafeInteger(o.salaire)&&o.salaire>=0&&typeof o.texte==='string'&&o.texte.length<=300&&o.relu===false&&typeof o.refuse==='boolean'&&Array.isArray(o.raisons)&&o.raisons.length===4&&o.raisons.every(x=>typeof x==='string'&&x.length<=120));
}
function mgmtOffresCreer(m){
  if(!m||m.mondeVivant!==true||!Array.isArray(MGMT_ORGANISATIONS)||!m.poste)return [];
  const ranks=mgmtOrgClassement(m)||[],active=mgmtPredecesseurOrgId(m),rang=(ranks.find(x=>x.id===active)||{}).rang||4;
  const pool=MGMT_ORGANISATIONS.filter(o=>o.id!==active&&m.orgs&&m.orgs[o.id]).map(o=>({o,r:(ranks.find(x=>x.id===o.id)||{}).rang||8}));
  const renvoi=mgmtPosteBilan(m).issue==='renvoi';
  const candidats=pool.filter(x=>renvoi?x.r>rang:x.r<rang).sort((a,b)=>Math.abs(a.r-rang)-Math.abs(b.r-rang)||a.r-b.r);
  const graine=String(m.graine||m.seed||m.org||'split');
  const cle=`offres:${graine}:${m.poste.saison}:${m.poste.fin}:${active}`;
  const stream=typeof mgmtIdentiteStream==='function'?mgmtIdentiteStream(cle,'choix-offres',m):null;
  const ordre=candidats.map(x=>({x,k:stream?stream():0})).sort((a,b)=>a.k-b.k||Math.abs(a.x.r-rang)-Math.abs(b.x.r-rang));
  const nombre=Math.min(candidats.length,Math.max(2,Math.min(3,candidats.length)));
   const salaireBase=m.poste.salaire;
   const poste='matchmaker';
   m.offres=ordre.slice(0,nombre).map(({x:{o,r}})=>{
     const delta=Math.min(0.3,Math.max(-0.3,(rang-r)/10));
     const fonction=typeof poste==='string'&&poste.trim()?poste.trim():'matchmaker';
     return {orgId:o.id,poste:fonction,salaire:Math.max(0,Math.round(salaireBase*(1+delta))),texte:`${typeof o.patron==='string'&&o.patron.trim()?o.patron.trim():'Le matchmaker'} souhaite te confier le poste de ${fonction.toLowerCase()} chez ${o.nom}.`,relu:false,refuse:false,raisons:mgmtPosteRaisons(m,o.id)};
  });
  return m.offres;
}
/* ==== [ANCRE: P9_T4_ATTENDRE_OFFRES] — Monde lot 58 T1 ====
   Le renvoi n'impose pas de signer une destination : attendre conserve le
   contrat et les données de l'organisation active, sans créer de clé inutile. ==== */
function mgmtOffresAttendre(m){
  if(!m||!m.poste||mgmtPosteBilan(m).issue!=='renvoi') return false;
  if(Array.isArray(m.offres)) m.offres.forEach(o=>{if(o&&typeof o==='object')o.refuse=true;});
  return true;
}
function mgmtPosteRaisons(m,orgId){
  const ranks=mgmtOrgClassement(m)||[],org=mgmtOrgParId(orgId),profil=org&&org.profil, n=mgmtOrgNiveaux(m,orgId)||{};
  const puissance=(ranks.find(x=>x.id===orgId)||{}).rang||8;
  const roster=m.orgs&&m.orgs[orgId]&&Array.isArray(m.orgs[orgId].roster)?m.orgs[orgId].roster:[];
  const top=roster.map(f=>({f,r:(mgmtDivisionRanking(m,f.div,'world')||[]).findIndex(x=>x.id===f.id)})).filter(x=>x.r>=0).sort((a,b)=>a.r-b.r)[0];
  return [
    `Scène : salle de ${Math.max(0,Math.round(n.stade||0))} places, diffuseur ${puissance<=2?'de premier rang':'en développement'}, budget de recrutement ${Math.max(1,Math.round((profil&&profil.caisse||0)/1000))} k€.`,
    `Meilleurs du monde : ${top?`${top.f.nom||'Un combattant'} est classé ${top.r+1}e de sa catégorie mondiale`:'aucun combattant de cette organisation ne figure au classement mondial disponible'}.`,
    `Agents libres : le rang ${puissance} place ${org.nom} ${puissance<=2?'parmi les premières organisations approchées':'dans une position moins prioritaire'} pour les meilleurs libres.`,
    `Choc des organisations : ${puissance<=4?`${org.nom} est assez bien classée pour recevoir plus souvent une proposition et voir ses propres offres acceptées`:`${org.nom} peut proposer un choc, mais son rang rend l'accord moins fréquent`}.`
  ];
}
/* ==== [ANCRE: MONDE_LOT58_T1_CHOC_RANG] — Monde lot 58 T1 ====
   Le rang 1 est le meilleur. Ce tirage isolé ne consomme pas la graine de
   simulation et prépare le calcul de réponse aux propositions du choc. ==== */
const MGMT_CHOC_ACCEPTATION_PAR_RANG=[0.9,0.82,0.74,0.66,0.58,0.5,0.42,0.34];
function mgmtChocProbabiliteAcceptation(rang){
  const r=Number.isInteger(rang)?Math.max(1,Math.min(8,rang)):8;
  return MGMT_CHOC_ACCEPTATION_PAR_RANG[r-1];
}
function mgmtChocTirageAcceptation(m,orgId){
  if(!m||typeof orgId!=='string')return false;
  const ligne=(mgmtOrgClassement(m)||[]).find(x=>x.id===orgId);
  if(!ligne)return false;
  const jour=m.cal&&Number.isSafeInteger(m.cal.jour)?m.cal.jour:(m.eventsPlayed||0)*35;
  const annee=typeof mgmtJourDate==='function'?new Date(mgmtJourDate(jour).ts).getUTCFullYear():0;
  const stream=typeof mgmtIdentiteStream==='function'?mgmtIdentiteStream(`choc:${String(m.graine||m.seed||m.org||'split')}:${orgId}:${annee}`,'acceptation-choc',m):null;
  return !!stream&&stream()<mgmtChocProbabiliteAcceptation(ligne.rang);
}
/* ==== [ANCRE: MONDE_LOT58_T1_CHOC_ANNUEL] — Monde lot 58 T1 ====
   Prépare une proposition annuelle à partir du calendrier; l'agenda reste
   l'unique support des soirées et aucune date n'est consommée au refus. ==== */
const MGMT_CHOC_BILLETTERIE_BONUS=0.25;
const MGMT_CHOC_PROPOSITION_PAR_RANG=[0.42,0.36,0.3,0.24,0.19,0.14,0.1,0.07];
function mgmtChocAnnee(m){
  const jour=m&&m.cal&&Number.isSafeInteger(m.cal.jour)?m.cal.jour:0;
  return typeof mgmtJourDate==='function'?new Date(mgmtJourDate(jour).ts).getUTCFullYear():0;
}
function mgmtChocValide(choc){
  return !!choc&&typeof choc==='object'&&!Array.isArray(choc)&&typeof choc.orgId==='string'&&!!mgmtOrgParId(choc.orgId)&&typeof choc.div==='string'&&Number.isSafeInteger(choc.jour)&&choc.jour>=0&&['recu','propose','accepte','refuse','programme','termine'].includes(choc.etat)&&Number.isInteger(choc.annee)&&(!Object.hasOwn(choc,'resultat')||['victoire','defaite'].includes(choc.resultat))&&(!Object.hasOwn(choc,'a')||typeof choc.a==='string')&&(!Object.hasOwn(choc,'b')||typeof choc.b==='string');
}
function mgmtChocProposition(m){
  if(!m||!m.mondeVivant||m.choc&&mgmtChocValide(m.choc)&&m.choc.annee===mgmtChocAnnee(m))return null;
  const rangs=mgmtOrgClassement(m)||[],active=mgmtPredecesseurOrgId(m);
  const meilleure=(m.roster||[]).filter(f=>mgmtChampionIds(m).has(f.id)).map(f=>({f,rank:(mgmtDivisionRanking(m,f.div,'world')||[]).findIndex(x=>x.id===f.id)})).filter(x=>x.rank>=0).sort((a,b)=>a.rank-b.rank)[0];
  if(!meilleure)return null;
  const partenaires=MGMT_ORGANISATIONS.filter(o=>o.id!==active&&m.orgs&&m.orgs[o.id]).map(o=>({o,r:(rangs.find(x=>x.id===o.id)||{}).rang||8})).filter(x=>{
    const c=(m.orgs[x.o.id].roster||[]).find(f=>f&&f.div===meilleure.f.div&&mgmtChampionIds({roster:m.orgs[x.o.id].roster||[]}).has(f.id));
    return !!c;
  }).sort((a,b)=>a.r-b.r);
  if(!partenaires.length)return null;
  const graine=String(m.graine||m.seed||m.org||'split'),annee=mgmtChocAnnee(m);
  const stream=typeof mgmtIdentiteStream==='function'?mgmtIdentiteStream(`choc-proposition:${graine}:${active}:${annee}`,'proposition-choc',m):null;
  if(!stream)return null;
  const candidat=partenaires.find(({r})=>stream()<MGMT_CHOC_PROPOSITION_PAR_RANG[Math.max(0,Math.min(7,r-1))]);
  if(!candidat)return null;
   const adverse=(m.orgs[candidat.o.id].roster||[]).find(f=>f&&f.div===meilleure.f.div&&mgmtChampionIds({roster:m.orgs[candidat.o.id].roster||[]}).has(f.id));
   if(!adverse)return null;
   m.choc={orgId:candidat.o.id,div:meilleure.f.div,jour:typeof mgmtCalAujourdhui==='function'?mgmtCalAujourdhui(m):0,annee,etat:'recu',a:meilleure.f.id,b:adverse.id};
  return m.choc;
}
function mgmtChocRepondre(m,accepte){
  if(!m||!mgmtChocValide(m.choc)||m.choc.etat!=='recu')return false;
  if(!accepte){m.choc.etat='refuse';return true;}
  const base=typeof mgmtCalAujourdhui==='function'?mgmtCalAujourdhui(m):m.choc.jour;
  for(let j=base+42;j<=base+70;j++)if(mgmtAgendaPoser(m,j,'petite').ok){m.choc.jour=j;m.choc.etat='programme';return true;}
  return false;
}
/* ==== [ANCRE: MONDE_LOT58_T1_CHOC_SORTANT] — Monde lot 58 T1 ====
   Le joueur peut solliciter un partenaire admissible une seule fois par an;
   le refus ou l'accord sont déterministes et l'agenda reste le calendrier unique. ==== */
function mgmtChocProposer(m,orgId){
  if(!m||!m.mondeVivant||m.choc&&mgmtChocValide(m.choc)&&m.choc.annee===mgmtChocAnnee(m))return false;
  const rangs=mgmtOrgClassement(m)||[],active=mgmtPredecesseurOrgId(m);
  const champion=(m.roster||[]).filter(f=>mgmtChampionIds(m).has(f.id)).map(f=>({f,r:(mgmtDivisionRanking(m,f.div,'world')||[]).findIndex(x=>x.id===f.id)})).filter(x=>x.r>=0).sort((a,b)=>a.r-b.r)[0];
  const org=MGMT_ORGANISATIONS.find(o=>o.id===orgId&&o.id!==active&&m.orgs&&m.orgs[o.id]);
  if(!champion||!org)return false;
  const adversaire=(m.orgs[org.id].roster||[]).find(f=>f&&f.div===champion.f.div&&mgmtChampionIds({roster:m.orgs[org.id].roster||[]}).has(f.id));
  if(!adversaire)return false;
  const annee=mgmtChocAnnee(m),jour=typeof mgmtCalAujourdhui==='function'?mgmtCalAujourdhui(m):0;
  m.choc={orgId:org.id,div:champion.f.div,jour,annee,etat:mgmtChocTirageAcceptation(m,org.id)?'accepte':'refuse',propose:true,a:champion.f.id,b:adversaire.id};
  if(m.choc.etat==='accepte'){
    for(let j=jour+42;j<=jour+70;j++)if(mgmtAgendaPoser(m,j,'petite').ok){m.choc.jour=j;m.choc.etat='programme';return true;}
    m.choc.etat='refuse';
  }
  return true;
}
function mgmtOffreRefuser(m,index){if(!m||!Array.isArray(m.offres)||!Number.isInteger(index)||!m.offres[index])return false;m.offres[index].refuse=true;return true;}
/* ==== [ANCRE: MONDE_LOT61_T1_ECHANGE_ORGANISATION] — Monde lot 61 T1 ====
   Les sous-parties sont des parties complètes. On échange leurs champs de
   simulation, en laissant au matchmaker ses données personnelles. ==== */
function mgmtOrgChanger(m,orgId,offre){
  const actif=m&&mgmtPredecesseurOrgId(m),sous=m&&m.orgs&&m.orgs[orgId];
  if(!m||m.mondeVivant!==true||!sous||orgId===actif||!mgmtOrgParId(orgId)||!validateMgmt(sous))return false;
  const sauvegarde=JSON.stringify(m);
  const joueur=new Set(['poste','offres','memoire','carnet','prix','defis','suivis','espoirs','espoirsPropose','graine','seed','mondeVivant','orgs','guerre','choc','duo']);
  const ancien={};for(const k of Object.keys(m))if(!joueur.has(k))ancien[k]=m[k];
  const promu={};for(const k of Object.keys(sous))if(!joueur.has(k))promu[k]=sous[k];
  const contrat=m.poste, orgs=m.orgs;
  orgs[actif]=Object.assign({},ancien,{org:m.org});delete orgs[orgId];
  Object.keys(m).forEach(k=>{if(!joueur.has(k))delete m[k];});
  Object.assign(m,promu,{org:mgmtOrgParId(orgId).nom,orgs,mondeVivant:true,poste:contrat});
  if(offre&&Number.isSafeInteger(offre.salaire)&&m.poste){m.poste.salaire=offre.salaire;m.poste.debut=mgmtCalAujourdhui(m);m.poste.fin=m.poste.debut+MGMT_POSTE.duree;}
  if(m.poste)m.poste.conf=2;
  if(Array.isArray(m.espoirsPropose))m.espoirsPropose=[];
  if(typeof mgmtEspoirsFixer==='function')mgmtEspoirsFixer(m);
  /* L'ordre canonique des sous-parties fait partie du contrat de sauvegarde. */
  const ordre=mgmtMondeVivantIds(m), range={};
  ordre.forEach(id=>{if(orgs[id])range[id]=orgs[id];});
  m.orgs=range;
  if(mgmtMondeVivantValide(m))return true;
  const original=JSON.parse(sauvegarde);
  Object.keys(m).forEach(k=>delete m[k]);
  Object.assign(m,original);
  return false;
}
function mgmtOffreAccepter(m,index){
  const o=m&&Array.isArray(m.offres)&&m.offres[index], org=o&&mgmtOrgParId(o.orgId);
  if(!o||o.refuse||!org||typeof confirm!=='function')return false;
  const ancien=mgmtOrgNom(m);
  if(!confirm(`Tu quittes ${ancien} pour ${org.nom}. Ton équipe, ton carnet et ta réputation te suivent ; tes combattants restent chez ${ancien}.`))return false;
  if(!mgmtOrgChanger(m,o.orgId,o))return false;
  if(typeof saveMgmt==='function')saveMgmt();
  if(typeof mgmtEspArriveeOuvrir==='function')mgmtEspArriveeOuvrir(1);
  return true;
}
/* ==== [ANCRE: P9_T2_POSTE_RENOUVELER] — Monde lot 43 T2 ==== */
function mgmtPosteRenouveler(m,issue){
  if(!m||!m.poste||!['prolonge-augmente','prolonge-condition'].includes(issue)) return null;
  const ancien=m.poste, bilan=mgmtPosteBilan(m);
  const salaire=issue==='prolonge-augmente'?bilan.salaire:ancien.salaire;
  const debut=ancien.fin;
  delete m.poste;
  mgmtPosteInit(m);
  m.poste.debut=debut;
  m.poste.fin=debut+MGMT_POSTE.duree;
  m.poste.saison=ancien.saison+1;
  m.poste.salaire=salaire;
  return m.poste;
}
