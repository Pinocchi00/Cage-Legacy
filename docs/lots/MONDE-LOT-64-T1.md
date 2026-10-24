# Monde lot 64 T1 — fidélité aux maquettes : l'Accueil et le fil d'Actualités

Branche : `fid-accueil` (la branche courante de ce dossier ; commits ICI ; le superviseur fusionne). **Les maquettes (`docs/planches-uniques/Uni*.dc.html`) sont validées par Anthony : l'écran du jeu doit leur ressembler, pas seulement les évoquer.** Lis d'abord `C:/Users/antho/AppData/Local/Temp/p1/shoot/LISEZMOI.txt` : un outil capture ton écran à 1920×1080 et le compare à la maquette (image côte à côte `cmp-<écran>.png` : jeu à gauche, maquette à droite). **C'est ton moyen de vérifier : utilise-le après chaque étape.**

Écrans de ta tranche : `accueil` (maquette `UniAccueil`) et `actualites` (maquette `UniActualites`). Fichiers du jeu : `mgmt-accueil.js`, `mgmt-actualites.js`, `mgmt-ecran-actualites*.js` (cherche), `ui-cadre.css`.

## Écarts constatés le 24/10 (à corriger tous)
**Accueil.** (1) **Bug : le bloc « LA SEMAINE DU COMBAT » déborde sur la barre des touches du bas** (texte superposé). (2) La maquette a **trois colonnes : « CE QUI S'EST PASSÉ », « CE QUI T'ATTEND » (avec « LA PROCHAINE CHOSE À FAIRE » jaune, « ILS T'ATTENDENT », puis « TES ESPOIRS » en bas de la colonne) et « TA SAISON »** (trois objectifs du contrat avec barres de progression et rang « 41e → 15e », « LE PATRON : IL EST SATISFAIT » + sa phrase, « TON RECRUTEUR : destination · retour DANS 6 J ») ; le jeu a « ET AILLEURS » à la place de « TA SAISON » et pas de bloc recruteur ni de patron. (3) L'en-tête de la maquette : « SPLIT / Lyon · depuis 2004 · 5e des huit · date » et **quatre cases** (PROCHAINE SOIRÉE, LE LIEU, LA CARTE, **LES PRÉVENTES** « 4 120 sur 9 000 places »). (4) Les points jaunes de la barre latérale pour ce qui attend (Actualités, Carte, Contrats…). Les données viennent de ce qui existe (contrat `m.poste`, objectifs, confiance, recruteur `m.recruteur`, salle…) : **ne crée aucune mécanique**, branche l'existant ; « ET AILLEURS » (monde vivant) ne disparaît pas : place-le où la maquette laisse de la place ou sous « TA SAISON » si ça tient, sinon dans l'écran Actualités.
**Actualités.** Écart mesuré 34 % (le plus gros des écrans d'origine) : compare et corrige.

## Cases
**[ ] 1.** Corrige le débordement de la semaine du combat (rien ne se superpose ; aucun texte sous 22 px).
**[ ] 2.** Recompose l'Accueil sur la maquette : en-tête à quatre cases, trois colonnes, « TA SAISON » avec objectifs et barres, « LE PATRON », « TON RECRUTEUR ».
**[ ] 3.** Aligne l'écran Actualités sur sa maquette.
**[ ] 4.** À chaque étape : capture, ouvre `cmp-…png`, corrige ce qui diffère (structure, textes, tailles, couleurs, ordre, alignements). Objectif mesurable : `grosBlocs` ≤ 20 % pour les deux écrans sans bloc manquant ni chevauchement.
**[ ] 5.** Tests : les tests existants de ces écrans restent verts ; s'ils décrivaient l'ancienne structure, **mets-les à jour en citant la décision** : « les planches Uni* sont validées par Anthony (brief du 22/10) ; l'écran suit la planche » ; ajoute un test qui vérifie la présence des blocs (« TA SAISON », « LE PATRON », « TON RECRUTEUR », « LES PRÉVENTES ») et que **chaque classe du balisage a sa règle de style**.
**[ ] 6.** `?v=` des fichiers modifiés, `node tools/verif-versions.js origin/main`, lint ; commit final `Monde lot 64 T1 : l'Accueil et les Actualités fidèles aux planches` ; compte rendu honnête (avant/après `moyen` et `grosBlocs`) ; `TOUT_EST_FINI`.

Règles communes : **additif** pour les données ; ne touche ni au moteur de combat, ni à `mgmt-traits*.js`, ni à `mgmt-attention.js`.
