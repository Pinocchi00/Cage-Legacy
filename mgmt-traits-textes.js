"use strict";
/* ==== [ANCRE: P2_T3_TRAITS_TEXTES] — Monde lot 37 T1 ==== */
/* Textes Claude, relu:false. */
const MGMT_TRAITS_TEXTES=Object.freeze({
  'menton-granit':{fait:'{kdRecus} knockdowns encaissés, jamais mis K.-O.',phrase:'Encaisse les coups lourds sans céder.'},
  'menton-fele':{fait:'mis K.-O. {dKO6} fois sur ses 6 derniers combats',phrase:'Un coup net suffit parfois à le coucher.'},
  encaisseur:{fait:'{dec:sigEncaisseParMin} coups reçus par minute et toujours debout',phrase:'Accepte l’échange et reste debout.'},
  'fragile-apres-ko':{fait:'sort d’un K.-O. récent',phrase:'Pas encore remis de sa dernière nuit.'},
  diesel:{fait:'{victoiresRound3} victoires au troisième round',phrase:'Monte en régime quand les autres s’éteignent.'},
  's-eteint':{fait:'{defaitesRound3} défaites au troisième round',phrase:'Le troisième round lui pèse.'},
  'rythme-infernal':{fait:'{dec:sigParMin} coups significatifs par minute',phrase:'Ne laisse aucun répit.'},
  'sous-pression':{fait:'{pct:principal.taux} de victoires en combat principal',phrase:'Les grandes affiches lui échappent.'},
  revanchard:{fait:'{revancheVictoires} revanches gagnées',phrase:'Quand il retrouve un adversaire, il corrige sa copie.'},
  'hesite-apres-ko':{fait:'revient d’un K.-O.',phrase:'Plus prudent à la reprise.'},
  'grands-soirs':{fait:'{pct:principal.taux} de victoires en combat principal',phrase:'Les grandes affiches le réveillent.'},
  'serie-noire':{fait:'{serieDefaites} défaites de suite',phrase:'Les défaites s’enchaînent, la confiance fond.'},
  'sur-sa-lancee':{fait:'{serieVictoires} victoires de suite',phrase:'Il croit à tout ce qu’il tente.'},
  'ne-se-releve-pas':{fait:'{defaitesControle} défaites écrasées au sol',phrase:'Une fois au tapis, il y reste.'},
  'chasseur-de-cou':{fait:'{vSub} soumissions réussies',phrase:'Cherche la soumission dès que ça tombe au sol.'},
  tombeur:{fait:'{dec:ameneesPar15} amenées par quinze minutes',phrase:'Amène le combat au sol.'},
  mur:{fait:'{pct:defenseAmenee} d’amenées repoussées',phrase:'Impossible à amener.'},
  etouffeur:{fait:'{mmss:controlePar15} de contrôle par quinze minutes',phrase:'Écrase au sol sans lâcher.'},
  finisseur:{fait:'{victoires} victoires, {pct:tauxFinition} avant la limite',phrase:'Va chercher l’arrêt.'},
  'juge-dependant':{fait:'{pct:tauxDecision} de ses combats aux points',phrase:'Ses combats vont à la décision.'},
  foudroyant:{fait:'{finitionsR1} finitions au premier round',phrase:'Finit avant que l’adversaire s’installe.'},
  'poings-de-marbre':{fait:'{vKO} victoires par K.-O.',phrase:'Une touche, et c’est terminé.'},
  'specialiste-soumission':{fait:'{pct:partVictoiresSub} de ses victoires par soumission',phrase:'La soumission est sa signature.'},
  guerrier:{fait:'{guerres} guerre(s) dont on parle encore',phrase:'Ne recule jamais d’un échange.'},
  rouille:{fait:'sans combat depuis {cyclesDepuisDernier} cycles',phrase:'Longue absence, les jambes sont à retrouver.'},
  'vieux-briscard':{fait:'{age} ans, {n} combats documentés',phrase:'A tout vu, tout subi.'},
  'jeune-loup':{fait:'{age} ans, {victoires} victoires, jamais mis K.-O.',phrase:'Jeune, vorace.'},
  roi:{fait:'{titres} titres',phrase:'Il règne sur sa catégorie.'},
  invaincu:{fait:'{victoires} victoires, aucune défaite',phrase:'Personne ne l’a encore battu.'},
  debutant:{fait:'{bilanCombats} combats',phrase:'Trop tôt pour savoir.'},
  routinier:{fait:'{bilanCombats} combats',phrase:'Il en a vu d’autres.'},
  comeback:{fait:'{serieAvantDerniereDefaites} défaites puis une victoire',phrase:'Revenu de loin.'}
});
const MGMT_TRAITS_INDICES=Object.freeze({menton:'Personne ne l’a encore touché franchement.',cardio:'On ne l’a pas encore vu aller loin dans un combat.',mental:'On ne sait pas comment il réagit quand ça tourne mal.',sol:'Au sol, personne ne l’a vraiment testé.',finition:'On ne sait pas encore comment il termine ses combats.',moment:'C’est trop récent pour le dire.'});
/* ==== [ANCRE: P2_T3_TRAITS_TEXTE_FONCTIONS] — Monde lot 37 T1 ==== */
function mgmtTraitTexte(id,k){
  const t=MGMT_TRAITS_TEXTES[id]; if(!t)return {fait:'',phrase:''};
  const valeur=chemin=>String(chemin.split('.').reduce((o,p)=>o==null?undefined:o[p],k)??0);
  const format=(s)=>s.replace(/\{(pct|dec|mmss):([\w.]+)\}|\{([\w.]+)\}/g,(_m,type,path,champSimple)=>{
    const champ=path||champSimple, n=Number(champ.split('.').reduce((o,p)=>o==null?undefined:o[p],k));
    if(type==='pct')return `${Math.round(n*100)} %`;
    if(type==='dec')return (Number.isFinite(n)?n:0).toFixed(1).replace('.',',');
    if(type==='mmss'){const sec=Math.max(0,Math.round(Number.isFinite(n)?n:0));return `${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`;}
    return valeur(champ);
  });
  return {fait:format(t.fait),phrase:t.phrase};
}
function mgmtTraitsFiche(m,id,cycle){
  const ids=mgmtTraitsDe(m,id,cycle),ctx=mgmtTraitsContexte(m,id,cycle),hist=new Set(Array.isArray(m&&m.hist)?m.hist:[]);
  const docs=ctx.combats.filter(x=>hist.has(x.t)).length;
  const vus=[], caches=[];
  for(const idTrait of ids){const trait=MGMT_TRAITS.find(t=>t.id===idTrait);if(!trait)continue;
    if(!trait.public&&docs<3){caches.push(trait);continue;}
    const texte=mgmtTraitTexte(idTrait,ctx.k);vus.push({id:idTrait,nom:trait.nom,fait:texte.fait,phrase:texte.phrase,famille:trait.famille});
  }
  return {vus,caches:caches.length,indice:caches.length?MGMT_TRAITS_INDICES[caches[0].famille]||null:null};
}
