"use strict";
/* ==== [ANCRE: MGMT_PRESENTATION_ENTREES] — Monde lot 3 T5 ==== */
const MGMT_PRESENTATION_UI={pile:[],vue:'histoire'};
let mgmtPresentationPartie=null;
function mgmtPresentationCadre(){
  if(mgmtPresentationPartie!==G.mgmt){ MGMT_PRESENTATION_UI.pile=[]; mgmtPresentationPartie=G.mgmt; }
  return MGMT_PRESENTATION_UI.pile.at(-1)||null;
}
function mgmtPresentationDonnees(m,v){
  if(!v) return null;
  if(v.mode==='soiree') return mgmtPresentationCombatSoiree(m,v.i)?.presentation||null;
  return v.mode==='combattant'?mgmtPresentationCombattant({m,h:v.h},v.ids[0]):mgmtPresentationCombat({m,h:v.h},...v.ids);
}
function mgmtPresentationRoute(v){ return v.mode==='soiree'?'mgmt_soiree_avant':'mgmt_presentation_'+v.mode; }
/* ==== [ANCRE: MONDE_LOT21_SOIREE_SANS_SORTIE] — Monde lot 21 (retour d'Anthony du 18/10/2026 : « dans l'avant-combat, un clic sur un combattant nous sort de la soirée et elle se joue sans nous »).
   La présentation d'un combattant ouverte depuis l'avant-combat d'une soirée (et la fiche qui s'ouvre depuis elle) garde la barre des sections GRISÉE, comme les écrans de la soirée :
   la seule sortie est le retour, jamais une section. ==== */
/** Vrai si une présentation de la soirée est dans la pile (un combattant ou une fiche ouverts depuis l'avant-combat). @returns {boolean} */
function mgmtPresentationDansSoiree(){
  return MGMT_PRESENTATION_UI.pile.some(x=>x&&x.mode==='soiree');
}
/** Ouvre sans mutation métier ; false si présentation indisponible.
 * @param {'combattant'|'combat'|'soiree'} mode @param {string[]} ids
 * @param {{h?:number,i?:number,liste?:Array<{ids:string[],h?:number,i?:number}>,retour?:string}} [opts]
 * @returns {boolean} */
function mgmtPresentationOuvrir(mode,ids,opts={}){
  const m=G&&G.mgmt;
  if(!m||!['combattant','combat','soiree'].includes(mode)||!Array.isArray(ids)) return false;
  mgmtPresentationCadre();
  const v={mode,ids:ids.slice(),h:opts.h,i:opts.i,liste:[],index:0,page:0,nom:0,vue:'histoire',retour:opts.retour||G.screen};
  if(mode==='soiree'){
    const p=mgmtSoireeProgramme(m)[opts.i]; if(!p) return false;
    v.ids=[p.a.id,p.b.id];v.h=p.h;
    v.liste=mgmtSoireeProgramme(m).map((p,i)=>({ids:[p.a.id,p.b.id],h:p.h,i}));
  }
  const d=mgmtPresentationDonnees(m,v); if(!d) return false;
  v.h=d.h;
  if(mode==='combattant') v.liste=mgmtPresentationsCategorie({m,h:v.h},d.div).map(p=>({ids:[p.id],h:v.h}));
  else if(mode==='combat') v.liste=(opts.liste||[{ids:v.ids,h:v.h}]).filter(x=>x&&Array.isArray(x.ids)&&x.ids.length===2)
    .map(x=>({ids:x.ids.slice(),h:x.h===undefined?opts.h:x.h}));
  v.index=v.liste.findIndex(x=>x.ids.join('|')===v.ids.join('|')&&(mode!=='soiree'||x.i===v.i));
  if(v.index<0){ v.liste.unshift({ids:v.ids.slice(),h:v.h,i:v.i});v.index=0; }
  MGMT_PRESENTATION_UI.pile=[v];
  if(mode==='soiree') MGMT_SOIREE_UI.focus=v.i;
  CL.go(mgmtPresentationRoute(v));return true;
}
/** Déplace dans la liste figée, bornée sans boucle ; remet page/nom à zéro. @param {number} delta */
function mgmtPresentationAutre(delta){
  const v=mgmtPresentationCadre();if(!v) return;
  const pas=delta<0?-1:1;
  for(let k=v.index+pas;k>=0&&k<v.liste.length;k+=pas){
    const cible={...v,...v.liste[k],index:k,page:0,nom:0};
    const d=mgmtPresentationDonnees(G.mgmt,cible);if(!d) continue;
    Object.assign(v,cible,{h:d.h});if(v.mode==='soiree') MGMT_SOIREE_UI.focus=v.i;
    render();return;
  }
}
/** Choisit un nom historique, borné sans boucle. @param {number} delta */
function mgmtPresentationNom(delta){
  const v=mgmtPresentationCadre();if(!v) return;
  const noms=v.noms||mgmtPresentationLignes(G.mgmt,v).noms;
  v.nom=Math.max(0,Math.min(noms.length-1,v.nom+delta));render();
}
/** Tourne les pages du même contenu, bornées sans boucle. @param {number} delta */
function mgmtPresentationPage(delta){
  const v=mgmtPresentationCadre();if(!v) return;
  v.page=Math.max(0,Math.min((v.pages||1)-1,v.page+delta));render();
}
/* ==== [ANCRE: MONDE_T5_VUE_PRESENTATION_CHIFFRES] — Monde lot 36 T2 ==== */
function mgmtPresentationVueAlterner(){
  const v=mgmtPresentationCadre();if(!v||v.mode==='combattant')return;
  v.vue=v.vue==='chiffres'?'histoire':'chiffres';render();
}
function mgmtPresentationVueChoisir(vue){
 const v=mgmtPresentationCadre();if(!v||v.mode==='combattant'||!['histoire','chiffres'].includes(vue))return;
 v.vue=vue;v.page=0;render();
}
function mgmtPresentationFaceAFaceHtml(m,vue,a,b){
  const f=mgmtFaceAFace(m,vue.ids[0],vue.ids[1]);
  const labels={taille:'Taille',allonge:'Allonge',sigParMin:'Coups significatifs donnés par minute',precision:'Précision',encaisseParMin:'Encaissés par minute',defense:'Défense debout',ameneesPar15:'Amenées par 15 minutes',defenseAmenee:'Défense d’amenée',controlePar15:'Contrôle par 15 minutes'};
  const val=(id,x)=>{if(x==null)return '—';if(id==='taille'||id==='allonge')return (x/100).toFixed(2).replace('.',',')+' m';if(id==='precision'||id==='defense'||id==='defenseAmenee')return Math.round(x*100)+'\u00a0%';if(id==='controlePar15')return Math.floor(x/60)+':'+String(Math.floor(x%60)).padStart(2,'0');if(id==='sigParMin'||id==='encaisseParMin')return Number(x).toFixed(2).replace('.',',');if(id==='ameneesPar15')return Number(x).toFixed(1).replace('.',',');return String(x);};
  const visibles=f.lignes.filter(l=>!(['taille','allonge'].includes(l.id)&&l.a==null&&l.b==null));
  const lignes=visibles.map(l=>{const max=Math.max(l.a||0,l.b||0,1), pct=x=>x==null||l.a==null||l.b==null?0:Math.max(3,Math.min(100,Math.abs(x)/max*100));const color=(side)=>l.meilleur==null||l.a==null||l.b==null||l.a===l.b?'#E9E6E1':l.meilleur===side?'#E9E6E1':'rgba(233,230,225,.74)';
    const barre=side=>side==='b'?(l.meilleur==='b'?'#E23A2B':'rgba(226,58,43,.42)'):(l.meilleur==='a'?'#E9E6E1':'rgba(233,230,225,.42)');
    return `<div class="mf-cc-ligne"><b style="color:${color('a')}">${esc(val(l.id,l.a))}</b><span class="mf-cc-bar"><i style="width:${pct(l.a)}%;background:${barre('a')}"></i></span><span class="mf-cc-label">${esc(labels[l.id]||l.id)}</span><span class="mf-cc-bar cote-b"><i style="width:${pct(l.b)}%;background:${barre('b')}"></i></span><b style="color:${color('b')}">${esc(val(l.id,l.b))}</b></div>`;}).join('');
   return mfPanneau(`<section class="mf-cc-panneau" style="--mf-cc-lignes:${visibles.length}">${lignes}</section>`,'normal','mf-cc-cadre')+`${f.a.documentes<3||f.b.documentes<3?'<p class="mf-cc-peu">Peu de combats documentés : ces chiffres bougent encore.</p>':''}`;
}
/* ==== [ANCRE: FIDELITE_COMBAT_CHIFFRES_20261028] — UniCombatChiffres, lectures et textes existants ==== */
function mgmtPresentationChiffresBanniere(m,v,a,b,tag){
 const negatif=new Set(['menton-fele','fragile-apres-ko','s-eteint','sous-pression','hesite-apres-ko','serie-noire','ne-se-releve-pas','rouille']);
 const cote=(f,side)=>{
  const surnom=mgmtSurnomDe(m,f.id),prenom=mfNet(f.first||'')+(surnom?' « '+mfNet(surnom)+' »':''),nom=mfNet(f.last||f.name);
  const rang=mgmtFicheSituation(m,f,'organization'),ville=mgmtIdentiteVille(f);
  const traits=mgmtTraitsFiche(m,f.id,v.h).vus.slice(0,2).map(t=>`<span class="mf-cc-trait${negatif.has(t.id)?' negatif':''}">${esc(t.nom)}</span>`).join('');
  const k=v.noms?.indexOf(f.id)??-1,nomHtml=v.mode==='soiree'&&k>=0?`<button type="button" class="mf-pr-lien" onclick="MGMT_PRESENTATION_UI.pile.at(-1).nom=${k};CL.mgmtPresentationNomOuvrir()">${esc(nom)}</button>`:esc(nom);
  return `<div class="mf-cc-identite ${side}"><div class="mf-cc-prenom" style="font-size:${mfCorps(prenom,570,36,22)}px">${esc(prenom)}</div><b class="mf-cc-nom" style="font-size:${mfCorps(nom,570,110,22)}px">${nomHtml}</b><div class="mf-cc-bilan"><strong>${esc(f.W)}-${esc(f.L)}-${esc(f.D||0)}</strong><span>${esc(rang)} · ${esc(f.age)} ans${ville?' · '+esc(ville):''}</span></div><div class="mf-cc-traits">${traits}</div></div>`;
 };
 return `<div class="mf-cc-identites">${cote(a,'a')}<div class="mf-cc-duel"><div class="mf-cc-vs"><b>VS</b></div><span>${esc(tag)}</span></div>${cote(b,'b')}</div>`;
}
function mgmtPresentationPronosticsHtml(m,lignes){return lignes.map(x=>`<details class="mf-cc-prono mf-pr-ligne" data-sources="${esc(JSON.stringify(x.sources||[]))}"><summary><span class="mf-pr-media">${esc(x.media||'')}</span><span class="mf-cc-prono-valeur">${x.sujet?`<span class="mf-cc-prono-nom" style="font-size:${mfCorps(mgmtNomParId(m,x.sujet).last||mgmtNomParId(m,x.sujet).name,310,24,22)}px">${esc(mgmtNomParId(m,x.sujet).last||mgmtNomParId(m,x.sujet).name)}</span>`:''}${x.sourcePct!=null?` <b>${esc(Math.round(x.sourcePct))} %</b>`:''}<i aria-hidden="true">⌄</i></span></summary><p class="mf-pr-phrase">${esc(x.texte||'')}</p></details>`).join('');}
function mgmtPresentationChiffresBas(m,v,panneaux){
 const analyse=panneaux.find(p=>p.titre==='CE QUE CHACUN IMPOSE')||panneaux.find(p=>p.titre==='CE QUI LE REND UNIQUE'),pronostics=panneaux.find(p=>p.titre==='LES PRONOSTICS');
 const gauche=analyse?mfPanneau(`<h2>CE QUI VA DÉCIDER</h2><div class="mf-cc-faits">${analyse.lignes.map(x=>mgmtPresentationLigneHtml(m,v,x.compact?{...x,pastille:'jaune'}:{...x,entete:'',texte:(x.entete?x.entete+' · ':'')+(x.texte||''),pastille:'jaune'})).join('')}</div>`,'normal','mf-cc-analyse'):'';
 const voix=pronostics?mgmtPresentationPronosticsHtml(m,pronostics.lignes):'';
 const droite=pronostics?mfPanneau(`<h2>LES PRONOSTICS · ${pronostics.lignes.length} VOIX</h2><div class="mf-cc-pronos">${voix}</div>`,'normal','mf-cc-pronostics'):'';
 return gauche||droite?`<div class="mf-cc-dessous">${gauche}${droite}</div>`:'';
}
/* ==== [FIN ANCRE] ==== */
/** Ouvre le nom choisi dans une présentation enfant ; fiche existante si T2 retourne null. */
function mgmtPresentationNomOuvrir(){
  const v=mgmtPresentationCadre();if(!v) return;
  const id=(v.noms||mgmtPresentationLignes(G.mgmt,v).noms)[v.nom];if(!id) return;
  const parents=MGMT_PRESENTATION_UI.pile.slice();
  if(mgmtPresentationOuvrir('combattant',[id],{h:v.h,retour:mgmtPresentationRoute(v)})){
    MGMT_PRESENTATION_UI.pile=parents.concat(MGMT_PRESENTATION_UI.pile);
    render();   /* Monde lot 21 : le rendu fait par l'ouverture ne voyait pas encore le parent (la soirée) : on le refait avec la pile complète. */
  }else CL.mgmtFiche(id);
}
/** Ouvre la fiche complète du sujet (premier côté pour une paire), retour au cadre conservé. */
function mgmtPresentationFiche(cote=0){ const v=mgmtPresentationCadre();if(v&&v.ids[cote===1?1:0]) CL.mgmtFiche(v.ids[cote===1?1:0]); }
/** Regarde seulement le prochain combat réel en mode soirée ; sinon aucune action. */
function mgmtPresentationRegarder(){
  const v=mgmtPresentationCadre();if(!v||v.mode!=='soiree'||v.i!==MGMT_SOIREE.index||v.i>=mgmtSoireeProgramme(G.mgmt).length) return;
  MGMT_SOIREE_UI.focus=v.i;CL.mgmtSoAvantRegarder();
}
/** Dépile ; revient à la présentation parente ou à l'écran d'origine. */
function mgmtPresentationRetour(){
  const v=mgmtPresentationCadre();if(!v) return;
  MGMT_PRESENTATION_UI.pile.pop();const parent=mgmtPresentationCadre();CL.go(parent?mgmtPresentationRoute(parent):v.retour);
}
/* ==== [ANCRE: MONDE_LOT12_T3_PRESENTATION_LECTURES] — Monde lot 12 T3 ====
   Lectures pures de l'écran (décision du superviseur du 17/10/2026) : le rejeu du combat et le
   moteur restent interdits dans les présentations ; `mgmtLectureStyle`, `mgmtCombatProfile` et
   la lecture de `m.hist` le sont. Aucun panneau sans donnée n'est rendu (charte R4). ==== */
/** La ligne du combattant au cycle de la présentation : le côté de sa trace la plus récente
 *  avant h, sinon la fiche d'aujourd'hui (mgmtFicheLigne). Pure. */
function mgmtPresentationLigneCycle(m,id,h){
  const t=m.hist&&m.hist[mgmtObsAvant(m,id,h)[0]];
  if(t&&t.a&&t.b) return t.a.id===id?t.a:t.b;
  const l=mgmtFicheLigne(m,id);
  return l?l.f:null;
}
/** « Ses points forts » (décision du 17/10/2026) : les forces lues sur le profil
 *  (`mgmtLectureStyle(ligne).lignes`, une à trois phrases), plus chaque victoire par KO ou
 *  soumission de son histoire (« KO contre X, 2e round ») ; jamais les combats gagnés aux
 *  points, jamais l'histoire. Liste vide sans aucune force lisible. */
function mgmtPointsFortLignes(m,id,h){
  const ligne=id?mgmtPresentationLigneCycle(m,id,h):null,out=[];
  if(ligne) mgmtLectureStyle(ligne).lignes.forEach(x=>{
    if(x!==MGMT_AVANT_TEXTES.lignes.rien) out.push({texte:x,pastille:'plus',sources:[]});
  });
  for(const i of mgmtObsAvant(m,id,h)){
    const t=m.hist[i],adv=t.a.id===id?t.b:t.a;
    if(t.winner!==(t.a.id===id?'A':'B')) continue;
    if(t.family!=='ko'&&t.family!=='sub') continue;
    out.push({texte:MGMT_FAMILY_LABELS[t.family]+' contre '+mgmtNomParId(m,adv.id).name
      +(Number.isSafeInteger(t.round)?', '+mgmtRoundOrdinal(t.round):''),pastille:'plus',
      sources:[{type:'hist',index:i}]});
  }
  return out;
}
/** « Ce que chacun impose » : une ligne par zone (au centre, contre la cage, au sol), tirée
 *  des forces de profil des deux lignes (lecture pure) et des textes de l'avant-combat
 *  (MGMT_AVANT_TEXTES.zone) ; l'allonge s'ajoute au centre. */
function mgmtImposerLignes(m,ids,h){
  const a=ids[0]?mgmtPresentationLigneCycle(m,ids[0],h):null,b=ids[1]?mgmtPresentationLigneCycle(m,ids[1],h):null;
  if(!a||!b) return [];
  const za=mgmtLectureStyle(a).zones,zb=mgmtLectureStyle(b).zones;
  const nom=id=>{const n=mgmtNomParId(m,id);return n.last||n.name;};
  const T=MGMT_AVANT_TEXTES.zone,out=[];
  for(const k of ['centre','cage','sol']){
    const d=za[k]-zb[k],x=d>=0?nom(ids[0]):nom(ids[1]),y=d>=0?nom(ids[1]):nom(ids[0]);
    let texte,marque;
    if(Math.abs(d)<0.15){texte=T.egal.replace('{x}',x).replace('{y}',y);marque='q';}
    else{texte=T.duo.replace('{x}',x).replace('{y}',y);
      marque=(d>0?zb[k]:za[k])<=-0.2?'moins':'plus';}
    let precision='';
    if(k==='centre'){const dr=mgmtAllongeCm(a)-mgmtAllongeCm(b);
      if(Math.abs(dr)>=8) texte+=' '+T.allonge.replace('{x}',dr>0?nom(ids[0]):nom(ids[1]))
        .replace('{n}',String(Math.round(Math.abs(dr))));
      if(Math.abs(dr)>=8)precision='Allonge : +'+Math.round(Math.abs(dr))+' cm '+(dr>0?'à gauche':'à droite');}
    out.push({texte,compact:Math.abs(d)<.15?'ÉQUILIBRÉ':d>0?'← AVANTAGE À GAUCHE':'AVANTAGE À DROITE →',precision,entete:MGMT_AVANT_TEXTES.zones[k],pastille:marque,sources:[]});
  }
  return out;
}
/** Le libellé d'une soirée de l'histoire : « Split Fight Night 13 · 2026 », lu sur la trace
 *  (soirée par `mgmtSoirees`, année par jour). `lat` : la carte cycle→soirée du rendu courant. */
function mgmtHistoireSoireeLabel(m,index,lat){
  const t=m.hist&&m.hist[index];
  if(!t||!lat) return '';
  const s=lat.get(t.c);
  if(!s||!Number.isSafeInteger(s.n)) return '';
  let texte=mgmtOrgNom(m)+' Fight Night '+s.n;
  const j=Number.isFinite(s.jour)?s.jour:mgmtSoireeJour(m,s.n);
  if(Number.isFinite(j)) texte+=' · '+new Date(MGMT_CALENDRIER_DEBUT+j*86400000).getUTCFullYear();
  return texte;
}
/** Panneaux de l'écran : un objet par bloc, dans l'ordre des planches ; `pastille` porte la
 *  marque de la ligne (jaune, +, −, ?, v, d, n), `sous` la précision, `entete` le libellé
 *  d'une zone, `tab` un tableau d'adversaires. Les blocs sans lignes sont retirés. */
function mgmtPresentationLignes(m,v){
  const d=mgmtPresentationDonnees(m,v);if(!d) return {noms:[],panneaux:[]};
  const noms=[],nom=id=>{if(mgmtFicheLigne(m,id)&&!noms.includes(id)) noms.push(id);return id;};
  const phrase=x=>({texte:x.texte,sources:x.fait?.sources||x.sources||[]});
  const lat=new Map();for(const s of mgmtSoirees(m)) lat.set(s.c,s);
  const inscrit=id=>[].concat(id).map(nom);
  let panneaux;
  if(v.mode==='combattant'){
    const nHistoire=mgmtObsAvant(m,d.id,d.h).length;
    panneaux=[
      {titre:'CE QUI LE DISTINGUE',lignes:d.faits.map(x=>({...phrase(x),pastille:'jaune'}))},
      {titre:'SES POINTS FORTS',lignes:mgmtPointsFortLignes(m,d.id,d.h)},
      {titre:'SON HISTOIRE ICI',sous:nHistoire?nHistoire+(nHistoire>1?' combats':' combat')+' chez Split':'',
         lignes:d.histoire.flatMap(x=>{
           const t=m.hist[x.index],issue=t.winner==='D'?'n':t.winner===(t.a.id===d.id?'A':'B')?'v':'d';
           const soiree=mgmtHistoireSoireeLabel(m,x.index,lat);
           const base={texte:mgmtNomParId(m,x.adversaire).name,ids:inscrit(x.adversaire),pastille:issue,
             sous:[MGMT_FAMILY_LABELS[t.family]||t.family||'',soiree].filter(Boolean).join(' · '),
             sources:[{type:'hist',index:x.index}]};
           const traits=(mgmtTraitsFiche(m,d.id,d.h).vus||[]).slice(0,4).map(tr=>({texte:tr.nom+' · '+tr.fait,sous:tr.phrase,sources:[{type:'hist',index:x.index}]}));
           return [base,...traits];})}];
  }else{
    const cote=(t,id)=>t.a.id===id?'A':t.b.id===id?'B':null;
    const lui=(t,id,degaine)=>{ /* sous du côté d'un suje, ou null s'il n'y combat pas */
      const c=cote(t,id);if(!c) return null;
      const issue=t.winner==='D'?'n':t.winner===c?'v':'d';
      let sous=MGMT_FAMILY_LABELS[t.family]||t.family||'';
      if(issue!=='n'&&Number.isSafeInteger(t.round)) sous+=', '+mgmtRoundOrdinal(t.round);
      const famille={ko:'KO',sub:'SOUM.',stop:'ARRÊT',dec:'DÉC.',draw:'NUL'}[t.family]||MGMT_FAMILY_LABELS[t.family]||t.family;
      return {pastille:issue,sous,court:famille+(issue!=='n'&&Number.isSafeInteger(t.round)?' · R'+t.round:'')};
    };
    panneaux=[
      {titre:'CE QUI LE REND UNIQUE',lignes:d.faits.map(x=>({...phrase(x),pastille:'jaune'}))},
      {titre:'CE QUE CHACUN IMPOSE',lignes:mgmtImposerLignes(m,d.ids,d.h)},
       {titre:'LEUR HISTOIRE',lignes:d.histoire.flatMap(x=>{
           const t=m.hist[x.index];
           const entreEux=x.ids.includes(d.ids[0])&&x.ids.includes(d.ids[1]);
           const advId=entreEux?null:(t.a.id===d.ids[0]||t.a.id===d.ids[1]?t.b.id:t.a.id);
           const tableau=d.ids.map(id=>lui(t,id));
           const base={texte:entreEux?mgmtHistoireSoireeLabel(m,x.index,lat):mgmtNomParId(m,advId).name,
             ids:entreEux?[]:inscrit(advId),tab:tableau,sources:[{type:'hist',index:x.index}]};
           const traits=[];
           for(const id of d.ids){
             const fiche=mgmtTraitsFiche(m,id,d.h);
             for(const tr of (fiche.vus||[]).slice(0,4)) traits.push({texte:tr.nom+' · '+tr.fait,sous:tr.phrase,sources:[{type:'hist',index:x.index}]});
           }
           return [base,...traits];})},
      {titre:'LES PRONOSTICS',sous:d.pronostics.length+' voix',
        lignes:d.pronostics.map(x=>({texte:x.texte,media:x.nom,sourcePct:x.pourcentage,sujet:x.vainqueur,
          sources:x.preuves.flatMap(p=>p.sources)}))}];
  }
  if(v.mode!=='combattant'){
    const p=panneaux.find(p=>p.titre==='LEUR HISTOIRE');
    if(p&&p.lignes.length) p.tete=['Adversaire commun',mgmtNomParId(m,d.ids[0]).name,mgmtNomParId(m,d.ids[1]).name];
    else if(p) p.tete=null;
    if(d.histoire.length===0) p.notes='Premier combat entre eux.';
    /* ==== [ANCRE: MONDE_LOT21_AVANT_COMBAT_NOMS] — Monde lot 65 T1 ==== */
    /* Les deux participants restent consultables depuis l’avant-combat, même sans historique commun. */
    if(v.mode==='soiree') for(const id of v.ids) nom(id);
  }
  const sujets=v.mode==='combattant'?[d.id]:d.ids,limite=d.h<m.hist.length?(m.hist[Math.max(0,d.h-1)]?.c??0):m.cycle;
  const dits=new Set(),avis=mgmtFilListe(m).filter(x=>(x.k==='presse'||x.k==='public')&&sujets.some(id=>x.a===id||x.b===id)&&x.c<=limite&&(!Number.isSafeInteger(x.f)||x.f<d.h)).filter(x=>{const t=x.t||mgmtFilTitre(m,x);if(dits.has(t))return false;dits.add(t);return true;}).slice(0,3);
  panneaux.push({titre:'CE QUE LES GENS EN PENSENT',lignes:avis.map(x=>({texte:x.t||mgmtFilTitre(m,x),resume:mgmtFilTitre(m,x),media:x.k==='presse'?'LA PRESSE':x.k==='public'?'LES FANS':mgmtNomParId(m,x.a).name,sources:[{type:'fil',index:(m.fil||[]).indexOf(x)}]})),notes:avis.length?'':'Pas encore d’avis publié.'});
  return {d,noms,panneaux:panneaux.filter(p=>p.lignes.length||p.notes)};
}
function mgmtPresentationNomHtml(m,v,id){
  const nom=mgmtNomParId(m,id).name;
  const noms=v.noms||mgmtPresentationLignes(m,v).noms,k=noms.indexOf(id);
  if(k<0) return esc(nom);
  return `<button type="button" class="mf-pr-lien${v.nom===k?' choisi':''}" onclick="MGMT_PRESENTATION_UI.pile.at(-1).nom=${k};CL.mgmtPresentationNomOuvrir()">${esc(nom)}</button>`;
}
/** La marque d'une ligne : pastille jaune, + ou − (deux barres), ? ou pastille V/D/N
 *  (de la planche), none sans donnée. Les marques sont des constantes internes. */
function mgmtPresentationMarqueHtml(x){
  if(!x.pastille) return '';
  if(x.pastille==='jaune') return '<span class="mf-pr-craie"></span>';
  if(x.pastille==='plus') return '<svg class="mf-pr-marque" viewBox="0 0 26 26" fill="none" aria-hidden="true"><path d="M13 4v18M4 13h18" stroke="currentColor"></path></svg>';
  if(x.pastille==='moins') return '<svg class="mf-pr-marque" viewBox="0 0 26 26" fill="none" aria-hidden="true"><path d="M4 13h18" stroke="#E23A2B" stroke-width="4"></path></svg>';
  if(x.pastille==='q') return '<span class="mf-pr-q">?</span>';
  return `<span class="mf-pr-marq ${x.pastille}">${x.pastille.toUpperCase()}</span>`;
}
function mgmtPresentationLigneHtml(m,v,x){
  if(x.compact)return `<div class="mf-pr-ligne mf-pr-compact" title="${esc(x.texte)}">${mgmtPresentationMarqueHtml(x)}<div class="mf-pr-vr"><strong>${esc(x.entete)}</strong><span>${esc(x.compact)}</span>${x.precision?`<small>${esc(x.precision)}</small>`:''}</div></div>`;
  /* La ligne-tableau « Leur histoire » : trois colonnes, pastille V/D/N et méthode de chaque côté. */
  if(x.tab) return `<div class="mf-pr-ligne ta" data-sources="${esc(JSON.stringify(x.sources||[]))}">`
    +`<div class="mf-pr-ta1">${x.ids.length?[...new Set(x.ids)].map(id=>mgmtPresentationNomHtml(m,v,id)).join(' · '):esc(x.texte||'')}</div>`
    +x.tab.map(c=>c?`<div class="mf-pr-tac" title="${esc(c.sous)}">${mgmtPresentationMarqueHtml(c)}<span class="mf-pr-sous">${esc(c.court||c.sous)}</span></div>`:'<div class="mf-pr-tac">—</div>').join('')
    +`</div>`;
  /* Une ligne d'histoire porte le nom de l'adversaire en bouton ; une ligne de pronostic
     porte la voix et son pourcentage autorisé (décision du 09/10). */
  const principal=x.pastille==='v'||x.pastille==='d'||x.pastille==='n'
    ?[...new Set(x.ids)].map(id=>mgmtPresentationNomHtml(m,v,id)).join(''):esc(x.texte||'');
  /* Monde lot 20 (retour d'Anthony du 18/10/2026) : le pourcentage se lit seul, sans le nom du combattant collé à la voix. */
  const pct=x.sourcePct!=null&&x.sujet?`<span class="mf-pr-pct">${esc(Math.round(Math.min(100,Math.max(0,x.sourcePct||0)))+' %')}</span>`:'';
  return `<div class="mf-pr-ligne" data-sources="${esc(JSON.stringify(x.sources))}">${mgmtPresentationMarqueHtml(x)}<div class="mf-pr-vr">`
    +(x.media||pct?`<div class="mf-pr-hd">${x.media?`<span class="mf-pr-media">${esc(x.media)}</span>`:''}${pct}</div>`:'')
    +(x.sujet&&!pct?`<div class="mf-pr-sujet">${esc(mgmtNomParId(m,x.sujet).name)}</div>`:'')
    +(x.entete?`<div class="mf-pr-phrase zn">${esc(x.entete)}</div>`:'')
    +(principal?`<div class="mf-pr-phrase">${principal}</div>`:'')
    +(x.sous?`<div class="mf-pr-sous">${esc(x.sous)}</div>`:'')
    +(!x.pastille&&x.ids?`<div class="mf-pr-noms">${[...new Set(x.ids)].map(id=>mgmtPresentationNomHtml(m,v,id)).join(' · ')}</div>`:'')
    +`</div></div>`;
}
/* ==== [ANCRE: MGMT_PRESENTATION_PAGES] — Monde lot 3 T5 ==== */
/** Mesure de lignes hors viewport, retirées avant le rendu : aucun panneau posé sur l'écran. */
function mgmtPresentationHauteur(m,v,x,largeur){
  const el=document.createElement('div');el.style.cssText=`position:absolute;left:-100000px;top:0;width:${largeur}px;pointer-events:none`;
  el.innerHTML=mgmtPresentationLigneHtml(m,v,x);document.body.append(el);
  const h=el.getBoundingClientRect().height;el.remove();
  // Un DOM virtuel n'a pas de layout ; mesure conservatrice au même corps.
  return h||14+Math.ceil((x.texte.length+(x.media?.length||0)+(x.sujet?mgmtNomParId(m,x.sujet).name.length:0)+(x.ids||[]).reduce((s,id)=>s+mgmtNomParId(m,id).name.length,0))*13/(largeur-32))*27+((x.media||x.sujet||x.ids)?30:0);
}
function mgmtPresentationPaginer(m,v,lignes,hauteur,largeur){
  const morceaux=[];
  for(const x of lignes){
    if(mgmtPresentationHauteur(m,v,x,largeur)<=hauteur){morceaux.push(x);continue;}
    const mots=x.texte.split(' ');let debut=0;
    while(debut<mots.length){
      let fin=debut+1;
      while(fin<mots.length&&mgmtPresentationHauteur(m,v,{...x,texte:mots.slice(debut,fin+1).join(' ')},largeur)<=hauteur) fin++;
      morceaux.push({...x,texte:mots.slice(debut,fin).join(' ')});debut=fin;
    }
  }
  const pages=[[]];let utilise=0;
  for(const x of morceaux){
    const h=mgmtPresentationHauteur(m,v,x,largeur);
    if(pages.at(-1).length&&utilise+h+12>hauteur){pages.push([]);utilise=0;}
    pages.at(-1).push(x);utilise+=h+12;
  }
  return pages;
}
/** HTML échappé du cadre courant ; chaîne vide sans cadre valide.
 * @param {object} m @param {object} vue @returns {string} */
function mgmtPresentationHtml(m,vue){
  const contenu=mgmtPresentationLignes(m,vue),{d,panneaux}=contenu;if(!d) return '';
  vue.noms=contenu.noms;
  const solo=vue.mode==='combattant',base=mgmtFaitsBase({m,h:d.h},vue.ids[0]);
  const f=id=>base.population.find(x=>x.id===id),a=f(vue.ids[0]),b=solo?null:f(vue.ids[1]);
  /* Monde lot 20 (retour d'Anthony du 18/10/2026) : le rang actuel chez l'organisation s'affiche à côté du prénom de chaque combattant d'un combat ; pendant la soirée, c'est le rang d'avant la soirée. */
  const rgOrg=f=>{ if(solo||!f||typeof mgmtLendemainRangs!=='function') return '';
    const r=mgmtLendemainRangs(m,f.id); const n=r?(vue.mode==='soiree'?(r.avant||r.apres):r.apres):null;
    return n?`<em class="mf-pr-rg">N°${esc(n)}</em>`:''; };
   const affiche=(f,cote)=>{const k=vue.noms.indexOf(f.id),nomHtml=!solo&&vue.mode==='soiree'&&k>=0?`<button type="button" class="mf-pr-lien" onclick="MGMT_PRESENTATION_UI.pile.at(-1).nom=${k};CL.mgmtPresentationNomOuvrir()">${esc(mfNet(f.last||f.name))}</button>`:esc(mfNet(f.last||f.name));return `<div class="mf-pr-nom ${cote}"><span class="mf-pr-l1" style="font-size:${mfCorps(f.first||'',solo?1000:570,solo?64:40,22)}px">${cote==='b'?rgOrg(f):''}${esc(mfNet(f.first||''))}${cote==='a'?rgOrg(f):''}</span><b style="font-size:${mfCorps(f.last||f.name,solo?1000:570,solo?200:116,22)}px">${nomHtml}</b></div>`;};
  const rang=base.rang.findIndex(x=>x.id===a.id);
  /* Cartouche fidèle à la planche : rang chez l'organisation, rang mondial (mgmtFicheSituation)
     et combats restants au contrat (mgmtContratRestants), avec la catégorie en précision. */
  const ligneCart=solo?mgmtFicheLigne(m,vue.ids[0]):null,fc=ligneCart&&ligneCart.f;
  const monde=fc?mgmtFicheSituation(m,fc,'world'):'—';
  const reste=fc&&fc.ct?mgmtContratRestants(fc):null;
  const contrat=fc?(fc.libre?'LIBRE':fc.ct?reste+' COMBAT'+(reste>1?'S':''):'—'):'—';
  const divL=mgmtDivisionLabel(a.div);
  const cellCart=(titre,val,sous)=>`<div><div>${esc(titre)}</div><b style="font-size:${mfCorps(String(val),213,40,22)}px">${esc(val)}</b>${sous?`<span class="mf-pr-cs">${esc(sous)}</span>`:''}</div>`;
  const cartouche=solo?`<div class="mf-pr-cartouche">${cellCart('PALMARÈS',a.W+'-'+a.L+'-'+(a.D||0))}`
    +cellCart('CHEZ '+mgmtOrgNom(m),rang<0?'—':'N°'+(rang+1),divL)
    +cellCart('AU MONDE',monde,divL)+cellCart('CONTRAT',contrat)+'</div>':'';
  /* ==== [ANCRE: MONDE_LOT6_PRESENTATION_RAISON] — Monde lot 6 ==== */
  // Combat proposé par Leïla et porteur d'une raison : ses deux lignes en tête, lues sur la preuve enregistrée (rien si raison nulle ou origine joueur).
  const carteRaison=!solo&&(vue.mode==='combat'||vue.mode==='soiree')?[...(m.card?.main||[]),...(m.card?.prelims||[])].find(x=>[x.a,x.b].sort().join('|')===vue.ids.slice().sort().join('|')):null;
  const lignesRaison=carteRaison&&a&&b?mgmtRaisonLignes(m,carteRaison.raison&&{...carteRaison.raison,origine:carteRaison.origine},[a,b]):null;
  const programme=vue.mode==='soiree'?mgmtPresentationCombatSoiree(m,vue.i):null;
  const carte=vue.mode==='combat'?[...(m.card?.main||[]),...(m.card?.prelims||[])].find(x=>[x.a,x.b].sort().join('|')===vue.ids.slice().sort().join('|')):null;
  /* Plaque sous le VS (planche) : étiquette du combat · catégorie · rounds · titre. */
  const pprog=programme?mgmtSoireeProgramme(m)[vue.i]:null;
  const iLocal=carte?(m.card?.main||[]).findIndex(x=>x.a===vue.ids[0]&&x.b===vue.ids[1]||x.a===vue.ids[1]&&x.b===vue.ids[0]):-1;
  const iPre=carte&&iLocal<0?(m.card?.prelims||[]).findIndex(x=>x.a===vue.ids[0]&&x.b===vue.ids[1]||x.a===vue.ids[1]&&x.b===vue.ids[0]):-1;
  const plaque=programme?[programme.etiquette,pprog&&pprog.divLabel||'',programme.rounds+' ROUNDS',programme.titre?'TITRE':'']
    :carte?[(iLocal===0?'Combat principal':iLocal===1?'Co-principal':iLocal>1?'Combat '+(iLocal+1):iPre>=0?'Préliminaire '+(iPre+1):''),divL,carte.rounds?carte.rounds+' ROUNDS':'',carte.title?'TITRE':'']:[];
  const tag=plaque.filter(Boolean).join(' · ');
  const ban=`<div class="mf-pr-banniere">${affiche(a,'a')}${b?affiche(b,'b')+`<div class="mf-pr-vs"><b>VS</b>${tag?`<span>${esc(tag)}</span>`:''}</div>`:cartouche}</div>`;
  if(!solo&&vue.vue==='chiffres')return `<main class="mf-pr mf-pr-chiffres duo">${mgmtPresentationChiffresBanniere(m,vue,a,b,tag)}${mgmtPresentationFaceAFaceHtml(m,vue,a,b)}${mgmtPresentationChiffresBas(m,vue,panneaux)}</main>`;
  /* Anthony,28/10 : une synthèse entière dans le viewport, sans pages ni défilement.
     Les données détaillées restent dans les fiches ; aucune phrase n'est tronquée. */
  const resumes=panneaux.map(p=>{
    if(p.titre==='LEUR HISTOIRE'){
      const lignes=p.lignes.filter(x=>x.tab);return {...p,lignes:lignes.slice(0,2),tete:lignes.length?['Adversaire / soirée','Gauche','Droite']:null,sous:lignes.length>2?'2 lignes sur '+lignes.length:p.sous};
    }
    if(p.titre==='SON HISTOIRE ICI')return {...p,lignes:p.lignes.filter(x=>['v','d','n'].includes(x.pastille)).slice(0,2)};
    if(p.titre==='CE QUE LES GENS EN PENSENT')return {...p,lignes:p.lignes.slice(0,2).map(x=>({...x,texte:x.texte.length>110?x.resume:x.texte}))};
    if(p.titre==='LES PRONOSTICS')return p;
    return {...p,lignes:p.lignes.slice(0,p.titre==='CE QUE CHACUN IMPOSE'?3:2)};
  });
  const visibles=new Set(resumes.flatMap(p=>p.lignes.flatMap(x=>x.ids||[])));
  vue.noms=contenu.noms.filter(id=>visibles.has(id)||vue.mode==='soiree'&&vue.ids.includes(id));vue.nom=Math.max(0,Math.min(vue.nom||0,vue.noms.length-1));vue.pages=1;vue.page=0;
  const panneau=(p,k)=>`<section class="mf-pr-panneau${p.titre==='LES PRONOSTICS'?' mf-pr-pronostics':''}"><div class="mf-pr-ph"><h2>${esc(p.titre)}</h2>${p.sous?`<span class="mf-pr-phs">${esc(p.sous)}</span>`:''}</div>`
    +(p.tete?`<div class="mf-pr-tab-tete">${p.tete.map(t=>`<span>${esc(t)}</span>`).join('')}</div>`:'')
    +(k===0&&lignesRaison?`<p class="mf-pr-raison-mini">${lignesRaison.l1}</p>`:'')
    +(p.titre==='LES PRONOSTICS'?`<div class="mf-cc-pronos">${mgmtPresentationPronosticsHtml(m,p.lignes)}</div>`:`<div class="mf-pr-lignes">${p.lignes.map(x=>mgmtPresentationLigneHtml(m,vue,x)).join('')}</div>`)
    +(p.notes?`<div class="mf-pr-foot">${esc(p.notes)}</div>`:'')+'</section>';
  const bas=resumes.slice(3);
  return `<main class="mf-pr ${solo?'solo':'duo'}">${solo?ban:mgmtPresentationChiffresBanniere(m,vue,a,b,tag)}<div class="mf-pr-rangee">${resumes.slice(0,3).map((p,k)=>panneau(p,k)).join('')}</div>`
    +(bas.length?`<div class="mf-pr-rangee bas"${bas.length<3?` style="grid-template-columns:repeat(${bas.length},minmax(0,1fr))"`:''}>${bas.map((p,k)=>panneau(p,k+3)).join('')}</div>`:'')
    +'</main>';
}
/** Écran complet du cadre courant ; retour d'origine si devenu invalide. @returns {string} */
function scr_mgmt_presentation(){
  const v=mgmtPresentationCadre();if(!v) return SCREENS.mgmt_accueil();
  const html=mgmtPresentationHtml(G.mgmt,v);
  if(!html){MGMT_PRESENTATION_UI.pile.pop();G.screen=v.retour;return SCREENS[v.retour]();}
  const soir=v.mode==='soiree',regarder=soir&&v.i===MGMT_SOIREE.index&&v.i<mgmtSoireeProgramme(G.mgmt).length;
  const chiffres=v.vue==='chiffres'&&v.mode!=='combattant';
  const touches=chiffres?[{ks:['Échap'],t:'Retour',onclick:'CL.mgmtPresentationRetour()'},{ks:['Tab'],t:'L’histoire',onclick:'CL.mgmtPresentationVueAlterner()'},{ks:['F'],t:'Fiche gauche',onclick:'CL.mgmtPresentationFiche()'},{ks:['G'],t:'Fiche droite',onclick:'CL.mgmtPresentationFiche(1)'}]:[{ks:['Échap'],t:'Retour',onclick:'CL.mgmtPresentationRetour()'},
    {ks:['←'],t:'',onclick:'CL.mgmtPresentationAutre(-1)'},{ks:['→'],t:v.mode==='combattant'?'Autre combattant':'Autre combat',onclick:'CL.mgmtPresentationAutre(1)'},
    {ks:['↑'],t:'',onclick:'CL.mgmtPresentationNom(-1)'},{ks:['↓'],t:'Choisir un nom',onclick:'CL.mgmtPresentationNom(1)'},
    {ks:['F'],t:'Fiche complète',onclick:'CL.mgmtPresentationFiche()'}];
  if((!soir&&(!chiffres||v.noms.length))||regarder) touches.push({ks:['Entrée'],t:soir?'Regarder le combat':'Ouvrir le nom choisi',jaune:true,onclick:soir?'CL.mgmtPresentationRegarder()':'CL.mgmtPresentationNomOuvrir()'});
  if(v.mode!=='combattant'&&!chiffres)touches.push({ks:['Tab'],t:'Les chiffres',onclick:'CL.mgmtPresentationVueAlterner()'});
  if(v.pages>1&&v.vue!=='chiffres') touches.push({ks:['⇤'],t:'',onclick:'CL.mgmtPresentationPage(-1)'},{ks:['⇥'],t:(v.page+1)+' / '+v.pages,onclick:'CL.mgmtPresentationPage(1)'});
  return mfEcran(html,{barre:'jeu',m:G.mgmt,grise:soir||mgmtPresentationDansSoiree()||(typeof mgmtDuoPresentationActive==='function'&&mgmtDuoPresentationActive()),plaque:soir?'Soirée':v.mode==='combattant'?'Effectif':'Carte',libelle:v.mode==='combattant'?'Présentation':'',onglets:v.mode==='combattant'?null:[{t:'Présentation',on:!chiffres,onclick:"CL.mgmtPresentationVueChoisir('histoire')"},{t:'Face-à-face',on:chiffres,onclick:"CL.mgmtPresentationVueChoisir('chiffres')"}],compteur:(v.index+1)+' / '+v.liste.length,touches});
}
Object.assign(CL,{mgmtPresentationOuvrir,mgmtPresentationAutre,mgmtPresentationNom,mgmtPresentationPage,mgmtPresentationVueAlterner,mgmtPresentationVueChoisir,mgmtPresentationNomOuvrir,mgmtPresentationFiche,mgmtPresentationRegarder,mgmtPresentationRetour});
SCREENS.mgmt_presentation_combattant=scr_mgmt_presentation;
SCREENS.mgmt_presentation_combat=scr_mgmt_presentation;
const mgmtPresentationTouches={ArrowLeft(){mgmtPresentationAutre(-1);},ArrowRight(){mgmtPresentationAutre(1);},ArrowUp(){mgmtPresentationNom(-1);},ArrowDown(){mgmtPresentationNom(1);},
  Enter(){const v=mgmtPresentationCadre();if(v?.mode==='soiree') mgmtPresentationRegarder();else mgmtPresentationNomOuvrir();},
  f:mgmtPresentationFiche,F:mgmtPresentationFiche,g(){const v=mgmtPresentationCadre();if(v?.vue==='chiffres'&&v.mode!=='combattant')mgmtPresentationFiche(1);},G(){const v=mgmtPresentationCadre();if(v?.vue==='chiffres'&&v.mode!=='combattant')mgmtPresentationFiche(1);},Escape:mgmtPresentationRetour,Tab(e){const v=mgmtPresentationCadre();if(v&&v.mode!=='combattant'){e?.preventDefault?.();mgmtPresentationVueAlterner();}else mgmtPresentationPage(e?.shiftKey?-1:1);}};
for(const route of ['mgmt_presentation_combattant','mgmt_presentation_combat','mgmt_soiree_avant']) keysRegister(route,mgmtPresentationTouches);
