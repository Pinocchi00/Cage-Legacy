"use strict";
/* ==== [ANCRE: P2_T1_TRAITS] — Monde lot 32 T1 ==== */
/* Proposition de Claude, relu:false : seuils fonctionnels du catalogue. */
const MGMT_TRAITS_SEUILS=Object.freeze({
  combats5:5, combats10:10, combats20:20, documentsTitres:3, kd3:3, kd2:2,
  derniers6:6, koRecents:2, koSansDefaite:4, moyenneEncaissee:4, moyenneEncaisseeConserve:3.5,
  moyenneDonnee:5, moyenneDonneeConserve:4.5, victoires45:.45, victoiresPrincipale35:.35,
  victoiresPrincipale45:.45, victoiresPrincipale70:.70, principale4:4, revanches2:2,
  controleSoumission120:120, soumissions3:3, amenees3:3, ameneesConserve:2.5,
  reussite45:.45, defense80:.80, defenseConserve:.75, controle240:240, controleConserve:200,
  victoires4:4, finition70:.70, finitionConserve:.60, decision70:.70, decisionConserve:.60,
  finitionsR13:3, victoiresKO4:4, victoiresSub3:3, partVictoiresSub40:.40,
  partVictoiresSubConserve:.30, guerres2:2, rouille12:12, age36:36, age34:34, combatsBriscard:20,
  ageJeune24:24, ageJeuneConserve:26, victoiresJeune3:3, victoiresInvaincu6:6,
  combatsDebutant3:3, combatsDebutantConserve:6, defensesTitre3:3, defensesTitreConserve:2,
  defaitesEnControle3:3, defaitesEnControleConserve:2, serieNoire3:3, serieLancee4:4,
  comebackDefaites2:2
});
const MGMT_TRAITS=Object.freeze([
  {id:'menton-granit',famille:'menton',nom:'Menton de granit',public:true,temporaire:false,effet:null,condition:c=>c.k.kdRecus>=3&&c.k.dKO===0&&c.k.n>=5,conserve:c=>c.k.dKO6===0},
  {id:'menton-fele',famille:'menton',nom:'Menton fêlé',public:false,temporaire:false,effet:null,condition:c=>c.k.dKO6>=2,conserve:c=>c.k.koSansDefaite<4},
  {id:'encaisseur',famille:'menton',nom:'Encaisseur',public:true,temporaire:false,effet:null,condition:c=>c.k.sigEncaisseParMin>=4&&c.k.n>=5&&c.k.tauxVictoires>=.45,conserve:c=>c.k.sigEncaisseParMin>=3.5},
  {id:'fragile-apres-ko',famille:'menton',nom:'Fragile après un KO',public:false,temporaire:true,effet:null,condition:c=>c.k.dernierKOsubi&&c.k.dernier.index>=Math.max(0,c.k.n-2),conserve:()=>false},
  {id:'diesel',famille:'cardio',nom:'Diesel',public:true,temporaire:false,effet:null,condition:c=>c.k.victoiresRound3>=3,conserve:c=>c.k.victoiresRound3>=2},
  {id:'s-eteint',famille:'cardio',nom:"S'éteint au troisième",public:false,temporaire:false,effet:null,condition:c=>c.k.defaitesRound3>=3,conserve:c=>c.k.defaitesRound3>=2},
  {id:'rythme-infernal',famille:'cardio',nom:'Rythme infernal',public:true,temporaire:false,effet:null,condition:c=>c.k.sigParMin>=5&&c.k.n>=5,conserve:c=>c.k.sigParMin>=4.5},
  {id:'sous-pression',famille:'mental',nom:'Perd ses moyens sous la pression',public:false,temporaire:false,effet:null,condition:c=>c.k.principale.n>=4&&c.k.principale.taux<=.35,conserve:c=>c.k.principale.n>=4&&c.k.principale.taux<=.45},
  {id:'revanchard',famille:'mental',nom:'Revanchard',public:false,temporaire:false,effet:null,condition:c=>c.k.revancheVictoires>=2,conserve:c=>c.k.revancheVictoires>=1},
  {id:'hesite-apres-ko',famille:'mental',nom:'Hésite après un KO',public:false,temporaire:true,effet:null,condition:c=>c.k.dernierKOsubi,conserve:()=>false},
  {id:'grands-soirs',famille:'mental',nom:'Se lève pour les grands soirs',public:false,temporaire:false,effet:null,condition:c=>c.k.principale.n>=4&&c.k.principale.taux>=.70,conserve:c=>c.k.principale.taux>=.60},
  {id:'serie-noire',famille:'mental',nom:'En plein doute',public:true,temporaire:true,effet:null,condition:c=>c.k.serieDefaites>=3,conserve:()=>false},
  {id:'sur-sa-lancee',famille:'mental',nom:'Sur sa lancée',public:true,temporaire:true,effet:null,condition:c=>c.k.serieVictoires>=4,conserve:()=>false},
  {id:'ne-se-releve-pas',famille:'sol',nom:'Ne se relève pas',public:false,temporaire:false,effet:null,condition:c=>c.k.defaitesControle>=3,conserve:c=>c.k.defaitesControle>=2},
  {id:'chasseur-de-cou',famille:'sol',nom:'Chasseur de cou',public:true,temporaire:false,effet:null,condition:c=>c.k.vSub>=3,conserve:c=>c.k.vSub>=2},
  {id:'tombeur',famille:'sol',nom:'Tombeur',public:true,temporaire:false,effet:null,condition:c=>c.k.ameneesPar15>=3&&c.k.reussiteAmenee>=.45&&c.k.n>=5,conserve:c=>c.k.ameneesPar15>=2.5},
  {id:'mur',famille:'sol',nom:'Mur anti-lutte',public:true,temporaire:false,effet:null,condition:c=>c.k.defenseAmenee>=.80&&c.k.ameneesAdverses>=10,conserve:c=>c.k.defenseAmenee>=.75},
  {id:'etouffeur',famille:'sol',nom:'Étouffeur',public:true,temporaire:false,effet:null,condition:c=>c.k.controlePar15>=240&&c.k.n>=5,conserve:c=>c.k.controlePar15>=200},
  {id:'finisseur',famille:'finition',nom:'Finisseur',public:true,temporaire:false,effet:null,condition:c=>c.k.victoires>=4&&c.k.tauxFinition>=.70,conserve:c=>c.k.tauxFinition>=.60},
  {id:'juge-dependant',famille:'finition',nom:'Juge-dépendant',public:true,temporaire:false,effet:null,condition:c=>c.k.n>=5&&c.k.tauxDecision>=.70,conserve:c=>c.k.tauxDecision>=.60},
  {id:'foudroyant',famille:'finition',nom:'Foudroyant',public:true,temporaire:false,effet:null,condition:c=>c.k.finitionsR1>=3,conserve:c=>c.k.finitionsR1>=2},
  {id:'poings-de-marbre',famille:'finition',nom:'Poings de marbre',public:true,temporaire:false,effet:null,condition:c=>c.k.vKO>=4,conserve:c=>c.k.vKO>=3},
  {id:'specialiste-soumission',famille:'finition',nom:'Spécialiste de la soumission',public:true,temporaire:false,effet:null,condition:c=>c.k.vSub>=3&&c.k.partVictoiresSub>=.40,conserve:c=>c.k.partVictoiresSub>=.30},
  {id:'guerrier',famille:'finition',nom:'Guerrier',public:false,temporaire:false,effet:null,condition:c=>c.k.guerres>=2,conserve:c=>c.k.guerres>=1},
  {id:'rouille',famille:'moment',nom:'Rouillé',public:true,temporaire:true,effet:null,condition:c=>c.k.cyclesDepuisDernier>=12,conserve:()=>false},
  {id:'vieux-briscard',famille:'moment',nom:'Vieux briscard',public:true,temporaire:false,effet:null,condition:c=>c.k.age>=36&&c.k.n>=20,conserve:c=>c.k.age>=34},
  {id:'jeune-loup',famille:'moment',nom:'Jeune loup',public:true,temporaire:false,effet:null,condition:c=>c.k.age<=24&&c.k.victoires>=3&&c.k.dKO===0,conserve:c=>c.k.age<=26},
  {id:'roi',famille:'moment',nom:'Roi de la catégorie',public:true,temporaire:false,effet:null,condition:c=>c.k.titres>=3,conserve:c=>c.k.titres>=2},
  {id:'invaincu',famille:'moment',nom:'Invaincu',public:true,temporaire:false,effet:null,condition:c=>c.k.victoires>=6&&c.k.defaites===0&&c.k.nuls===0,conserve:c=>c.k.defaites===0},
  {id:'debutant',famille:'moment',nom:'Débutant',public:true,temporaire:false,effet:null,condition:c=>c.k.bilanCombats<3,conserve:c=>c.k.bilanCombats<6},
  {id:'routinier',famille:'moment',nom:'Routinier',public:true,temporaire:false,effet:null,condition:c=>c.k.bilanCombats>=10,conserve:()=>false},
  {id:'comeback',famille:'mental',nom:'Revenu de loin',public:true,temporaire:true,effet:null,condition:c=>c.k.serieAvantDerniereDefaites>=2&&c.k.serieVictoires===1,conserve:()=>false}
]);
function mgmtTraitInfo(id){const x=MGMT_TRAITS.find(t=>t.id===id);return x?Object.freeze({...x}):null;}
