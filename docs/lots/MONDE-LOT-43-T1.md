# Monde lot 43 T1 (P9 T1+T2+T3 du brief « Des combattants uniques ») — le contrat du matchmaker : la durée et le salaire, les objectifs de saison, la confiance du patron (sans écran)

Branche : `p9-contrat` (la branche courante de ce dossier ; commits ICI ; le superviseur fusionne). Brief : `docs/BRIEF-22-10-DES-COMBATTANTS-UNIQUES.md`, lot P9 T1 à T3 (lis T1 à T5 pour le contexte ; T4 le renvoi/les offres et T5 le changement d'organisation sont **hors tranche**). Maquettes de référence (textes et chiffres, pas d'écran ici) : `docs/planches-uniques/UniArriveeContrat.dc.html` (contrat d'un an, 3 200 € par mois, « mi-saison en juillet », quatre objectifs avec « Aujourd'hui : … », le premier vient de ce qui manque), `UniTonPoste.dc.html` (Ton poste : « Il est ravi », objectifs tenus/faits, prochain rendez-vous), `UniBilanPatron.dc.html` (le bilan de fin de contrat : prolongé et augmenté).

**Ce que tu construis.** Le joueur est un matchmaker salarié : un contrat d'un an, des objectifs de saison fixés par le patron, une confiance qui bouge. Rien de tout cela n'existe en code (le patron Jean-Michel Delatour de Split n'existe que dans les données ; cherche `Delatour`, `patron`, `mgmtLendemainPatron` dans `mgmt-retraits.js`, `mgmt-data.js` ligne ~236, `mgmt-organisations-identites-data.js`, `mgmt-humanite-data.js`). Lis aussi : `mgmt-manque.js` (`mgmtManque(m).objectif`, P4), `mgmt-monde.js` et `mgmt-organisations.js` (le classement des huit, la popularité), `mgmt-argent.js` (la caisse), `mgmt-corps.js` (la clôture d'une soirée), `mgmt-calendrier.js`, `mgmt-ecran-classements.js`, `mgmt-leaders.js` (classement mondial par catégorie). **Ne crée pas de second système** : réutilise ce qui calcule déjà le rang, le top mondial, la caisse.

## Cases
**[x] 1. Les données : `mgmt-poste-data.js`** (nouveau, `"use strict";`, ancre `/* ==== [ANCRE: P9_T1_POSTE] — Monde lot 43 T1 ==== */`, inscrit dans `index.html` après `mgmt-organisations-data.js`). `MGMT_POSTE` figé : durée d'un an (en jours, voir `mgmt-calendrier.js`), salaire de départ **3 200 € par mois** (salaire personnel du joueur : **il ne sort pas de la caisse de l'organisation**, aucune recalibration de l'économie), rendez-vous de mi-saison à six mois, les types d'objectifs (`manque`, `lourd-top15`, `rang-orgs`, `champion-top5`, `caisse`, `popularite`, `salle`, `titre-demande`), cinq niveaux de confiance avec phrases `relu:false` et leurs phrases de mi-saison. Les locutions sont des propositions Claude à relire. Le nom est résolu depuis les données d'organisation (repli « le patron »).

**[x] 2. Le calcul : `mgmt-poste.js`** (nouveau, après `mgmt-argent.js`). Objet facultatif `m.poste`, avec validation stricte, 3–5 objectifs et historique borné à 12. `mgmtPosteInit` est appelé lors de création neuve seulement. Clôture de soirée branchée une fois; confiance évolue au plus d'un cran, les six mois sont déterminés en jours. Seuils de bilan : prolongation augmentée à confiance 4 et 75 % d'objectifs tenus; prolongation sous condition à confiance ≥2 et 40 %; sinon renvoi. Le bilan ne déclenche rien.

**[x] 3. La sauvegarde.** `m.poste` validé; réparation supprime uniquement une clé présente mais invalide; aucune migration ne crée le poste; version inchangée.

**[x] 4. Tests.** Nouveau test `mgmtLot43T1.test.js`, inscrit dans les listes ciblées et dans `test`/`test:watch`. Les tests couvrent les soixante soirées, ancienne partie après clôture, trois issues de bilan, validation/réparation et bornes.

**[ ] 5. Fin.** `?v=` à la main (tout `.js` modifié ou ajouté), `node tools/verif-versions.js origin/main`, `node_modules/.bin/eslint .`, commit final `Monde lot 43 T1 : le contrat du matchmaker` (le numéro T1 est obligatoire), compte rendu dans cette fiche (fichiers et rôle, seuils choisis, tests, textes à relire, écarts).

## Compte rendu

- `mgmt-poste-data.js` : durée, salaire, types, seuils et banques de phrases (`relu:false`); les textes proposés restent à relire avant exposition.
- `mgmt-poste.js` : initialisation, évolution soirée, validation et calcul du bilan.
- `mgmt-corps.js`, `mgmt-screens.js` : branchement à la clôture et création neuve.
- `mgmt-save.js` : validation/réparation facultative sans migration ni changement de version.
- `index.html` : scripts chargés et versions; `package.json` : test et watch général ainsi que commandes ciblées; `tests/mgmtLot43T1.test.js` : tests « Monde lot 43 T1 — … ».
- Seuils retenus : augmenté conf. 4 / 75 %; condition conf. 2 / 40 %; popularité choisit le prochain seuil de 25 à 75.
- Vérifications : `node --test tests/mgmtLot43T1.test.js` (9 tests verts), `node --test tests/mgmtPasse.test.js` (13 tests verts), `node tools/verif-versions.js origin/main` (aucun écart), ESLint complet vert. `mgmtReleveReduit.test.js` a dépassé la limite de 120 s de l'outil; succès non établi.
- Écarts : aucune donnée patron nommée n'existe actuellement dans les organisations, donc repli « le patron » utilisé. Le manque est représenté comme objectif tenu au premier manque satisfait; les seuils populaires sont déterminés par les paliers existants.
- Questions pour Anthony : confirmer les seuils retenus (confiance 4 + 75 % pour augmenté; confiance ≥2 + 40 % pour conditionnel; hausse salariale de 25 %) et relire les textes; indiquer si un patron doit être ajouté aux données d'organisation.

Règles communes : **additif** ; **aucun écran** ici ; ne touche pas au moteur de combat ; ne modifie ni `mgmt-traits*.js` ni `mgmt-attention.js` ; un test n'est **jamais** assoupli sans citer la décision. Quand TOUT est fait et commité, termine ta réponse par la ligne exacte `TOUT_EST_FINI`.
