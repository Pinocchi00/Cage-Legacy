"use strict";
/* ==== [ANCRE: P11_T2_DEFIS] — Monde lot 46 T1 ==== */
/* Les défis secondaires (brief du 22/10/2026, P11 T2), qui serviront aussi de
   succès Steam. Une quarantaine de défis : la soirée, la saison, la carrière.
   Chaque défi ne porte que des données : un identifiant stable, un titre et un
   texte sobres en français, une famille, et un test lisible que mgmt-defis.js
   sait évaluer UNIQUEMENT sur l'état du jeu (m.hist, m.facts, classements,
   caisse, m.comptes). Aucun écran, aucun nom propre inventé.

   Les textes sont des propositions de l'agent (relu:false) : Anthony les
   relira. Aucun défi ne dépend d'un fait qui n'existe pas encore. */

const MGMT_DEFIS=Object.freeze([
  /* ---- La soirée (13) ---- */
  Object.freeze({id:'soiree-trois-finitions-r1',titre:'Trois finitions au premier round',texte:'Finir trois combats de la soirée au premier round.',famille:'soiree',test:Object.freeze({type:'soiree_finitions_r1',min:3}),relu:false}),
  Object.freeze({id:'soiree-cinq-finitions',titre:'Cinq finitions dans la soirée',texte:'Finir cinq combats de la même soirée.',famille:'soiree',test:Object.freeze({type:'soiree_finitions',min:5}),relu:false}),
  Object.freeze({id:'soiree-trois-ko',titre:'Trois KO dans la même soirée',texte:'Compter trois victoires par KO sur une seule carte.',famille:'soiree',test:Object.freeze({type:'soiree_ko',min:3}),relu:false}),
  Object.freeze({id:'soiree-deux-soumissions',titre:'Deux soumissions dans la même soirée',texte:'Compter deux victoires par soumission sur une seule carte.',famille:'soiree',test:Object.freeze({type:'soiree_soumissions',min:2}),relu:false}),
  Object.freeze({id:'soiree-une-decision',titre:'Presque aucune décision',texte:'Jouer une soirée avec une décision au plus.',famille:'soiree',test:Object.freeze({type:'soiree_decisions_max',max:1}),relu:false}),
  Object.freeze({id:'soiree-une-guerre',titre:'Une guerre dans la soirée',texte:'Voir les deux combattants envoyer l’autre au tapis dans le même combat.',famille:'soiree',test:Object.freeze({type:'soiree_guerres',min:1}),relu:false}),
  Object.freeze({id:'soiree-deux-titres',titre:'Deux ceintures sur la même soirée',texte:'Mettre deux ceintures en jeu sur une seule carte.',famille:'soiree',test:Object.freeze({type:'soiree_titres',min:2}),relu:false}),
  Object.freeze({id:'soiree-grande-salle',titre:'Remplir une grande salle',texte:'Réunir au moins huit mille spectateurs dans la même soirée.',famille:'soiree',test:Object.freeze({type:'soiree_affluence',min:8000}),relu:false}),
  Object.freeze({id:'soiree-grosse-recette',titre:'Une soirée à grosse recette',texte:'Dégager au moins cinq cent mille euros de recette sur une soirée.',famille:'soiree',test:Object.freeze({type:'soiree_recette',min:500}),relu:false}),
  Object.freeze({id:'soiree-trois-finitions-prelim',titre:'Trois finitions en préliminaires',texte:'Finir trois combats de la carte préliminaire.',famille:'soiree',test:Object.freeze({type:'soiree_finitions_prelim',min:3}),relu:false}),
  Object.freeze({id:'soiree-ko-trente-secondes',titre:'Un KO en moins de trente secondes',texte:'Terminer un combat par KO dans la première demi-minute.',famille:'soiree',test:Object.freeze({type:'soiree_ko_rapide',maxSecondes:30}),relu:false}),
  Object.freeze({id:'soiree-deux-surprises',titre:'Deux surprises dans la soirée',texte:'Faire tomber deux favoris sur la même carte.',famille:'soiree',test:Object.freeze({type:'soiree_surprise',min:2}),relu:false}),
  Object.freeze({id:'soiree-neuf-combats',titre:'Une carte de neuf combats',texte:'Présenter neuf combats sur la même soirée.',famille:'soiree',test:Object.freeze({type:'soiree_combats',min:9}),relu:false}),

  /* ---- La saison (16) ---- */
  Object.freeze({id:'saison-quarante-combats',titre:'Quarante combats en un an',texte:'Organiser quarante combats sur une saison.',famille:'saison',test:Object.freeze({type:'saison_combats',min:40}),relu:false}),
  Object.freeze({id:'saison-vingt-victoires',titre:'Vingt victoires en un an',texte:'Compter vingt victoires sur une saison.',famille:'saison',test:Object.freeze({type:'saison_victoires',min:20}),relu:false}),
  Object.freeze({id:'saison-douze-finitions',titre:'Douze finitions en un an',texte:'Finir douze combats sur une saison.',famille:'saison',test:Object.freeze({type:'saison_finitions',min:12}),relu:false}),
  Object.freeze({id:'saison-six-finitions-r1',titre:'Six finitions au premier round',texte:'Finir six combats au premier round sur une saison.',famille:'saison',test:Object.freeze({type:'saison_finitions_r1',min:6}),relu:false}),
  Object.freeze({id:'saison-trois-guerres',titre:'Trois guerres en un an',texte:'Voir trois combats où les deux combattants vont au tapis.',famille:'saison',test:Object.freeze({type:'saison_guerres',min:3}),relu:false}),
  Object.freeze({id:'saison-deux-titres',titre:'Deux titres en un an',texte:'Mettre deux ceintures en jeu sur une saison.',famille:'saison',test:Object.freeze({type:'saison_titres',min:2}),relu:false}),
  Object.freeze({id:'saison-deux-defenses',titre:'Deux défenses de ceinture',texte:'Réussir deux défenses de titre sur une saison.',famille:'saison',test:Object.freeze({type:'saison_defenses',min:2}),relu:false}),
  Object.freeze({id:'saison-nouveau-champion',titre:'Un nouveau champion',texte:'Couronner un champion qui ne l’avait jamais été.',famille:'saison',test:Object.freeze({type:'saison_champion',min:1}),relu:false}),
  Object.freeze({id:'saison-serie-six',titre:'Six victoires de suite',texte:'Porter un combattant à six victoires consécutives sur une saison.',famille:'saison',test:Object.freeze({type:'saison_serie',min:6}),relu:false}),
  Object.freeze({id:'saison-invaincu-six',titre:'Six victoires sans perdre',texte:'Compter six victoires et aucune défaite pour un combattant sur une saison.',famille:'saison',test:Object.freeze({type:'saison_invaincu',min:6}),relu:false}),
  Object.freeze({id:'saison-deux-surnoms',titre:'Deux surnoms en un an',texte:'Voir la presse donner deux surnoms sur une saison.',famille:'saison',test:Object.freeze({type:'saison_surnoms',min:2}),relu:false}),
  Object.freeze({id:'saison-dix-soirees',titre:'Dix soirées en un an',texte:'Jouer dix soirées sur une saison.',famille:'saison',test:Object.freeze({type:'saison_soirees',min:10}),relu:false}),
  Object.freeze({id:'saison-poids-lourd-classe',titre:'Un poids lourd classé',texte:'Placer un poids lourd dans le classement de l’organisation.',famille:'saison',test:Object.freeze({type:'saison_classement',div:'H-heavy',portee:'organization',rangMax:8}),relu:false}),
  Object.freeze({id:'saison-top-cinq-mondial',titre:'Un combattant dans le top cinq mondial',texte:'Placer un combattant parmi les cinq premiers du classement mondial.',famille:'saison',test:Object.freeze({type:'saison_classement_monde',rangMax:5}),relu:false}),
  Object.freeze({id:'saison-trois-espoirs',titre:'Trois espoirs suivis',texte:'Suivre trois espoirs à la fois.',famille:'saison',test:Object.freeze({type:'saison_espoirs',min:3}),relu:false}),
  Object.freeze({id:'saison-espoir-classe',titre:'Un espoir classé',texte:'Faire entrer un espoir au classement mondial.',famille:'saison',test:Object.freeze({type:'saison_espoir_classe',rangMax:8}),relu:false}),

  /* ---- La carrière (14) ---- */
  Object.freeze({id:'carriere-zero-zero-champion',titre:'Un 0-0 devient champion',texte:'Couronner un combattant qui n’avait aucun combat au moment de signer.',famille:'carriere',test:Object.freeze({type:'carriere_champion_zero_zero'}),relu:false}),
  Object.freeze({id:'carriere-salle-pleine',titre:'Remplir la plus grande salle',texte:'Remplir à quatre-vingt-quinze pour cent une salle de huit mille places ou plus.',famille:'carriere',test:Object.freeze({type:'carriere_salle_pleine',capaciteMin:8000,tauxMin:0.95}),relu:false}),
  Object.freeze({id:'carriere-huit-mille-spectateurs',titre:'Huit mille spectateurs',texte:'Réunir huit mille spectateurs dans une soirée.',famille:'carriere',test:Object.freeze({type:'carriere_affluence',min:8000}),relu:false}),
  Object.freeze({id:'carriere-recette-million',titre:'Un million d’euros sur une soirée',texte:'Dégager un million d’euros de recette sur une soirée.',famille:'carriere',test:Object.freeze({type:'carriere_recette',min:1000}),relu:false}),
  Object.freeze({id:'carriere-cent-victoires',titre:'Cent victoires',texte:'Compter cent victoires dans l’organisation.',famille:'carriere',test:Object.freeze({type:'carriere_victoires',min:100}),relu:false}),
  Object.freeze({id:'carriere-cent-finitions',titre:'Cent finitions',texte:'Compter cent combats finis avant la limite.',famille:'carriere',test:Object.freeze({type:'carriere_finitions',min:100}),relu:false}),
  Object.freeze({id:'carriere-cinq-titres',titre:'Cinq combats de titre',texte:'Mettre cinq ceintures en jeu dans la même carrière.',famille:'carriere',test:Object.freeze({type:'carriere_titres',min:5}),relu:false}),
  Object.freeze({id:'carriere-trois-champions',titre:'Trois champions couronnés',texte:'Couronner trois champions différents.',famille:'carriere',test:Object.freeze({type:'carriere_champions',min:3}),relu:false}),
  Object.freeze({id:'carriere-cinq-defenses',titre:'Cinq défenses de ceinture',texte:'Réussir cinq défenses de titre dans la même carrière.',famille:'carriere',test:Object.freeze({type:'carriere_defenses',min:5}),relu:false}),
  Object.freeze({id:'carriere-dix-victoires-suite',titre:'Dix victoires de suite',texte:'Porter un combattant à dix victoires consécutives.',famille:'carriere',test:Object.freeze({type:'carriere_serie',min:10}),relu:false}),
  Object.freeze({id:'carriere-cinquante-soirees',titre:'Cinquante soirées',texte:'Jouer cinquante soirées dans la même carrière.',famille:'carriere',test:Object.freeze({type:'carriere_soirees',min:50}),relu:false}),
  Object.freeze({id:'carriere-caisse-cinq-cent-mille',titre:'Cinq cent mille euros en caisse',texte:'Tenir cinq cent mille euros de trésorerie.',famille:'carriere',test:Object.freeze({type:'carriere_caisse',min:500}),relu:false}),
  Object.freeze({id:'carriere-espoir-champion',titre:'Un espoir devient champion',texte:'Couronner un combattant que tu suivais comme espoir.',famille:'carriere',test:Object.freeze({type:'carriere_espoir_champion'}),relu:false}),
  Object.freeze({id:'carriere-premier-mondial',titre:'Le premier mondial',texte:'Placer un combattant à la première place du classement mondial.',famille:'carriere',test:Object.freeze({type:'carriere_classement_premier',rangMax:1}),relu:false}),
]);
