# Monde lot 71 T1 — l'écran Actualités fidèle à `UniActualites`, et sa scène de capture

Branche : `fid-actualites` (la branche courante de ce dossier ; commits ICI ; le superviseur fusionne). **Les maquettes (`docs/planches-uniques/Uni*.dc.html`) sont validées par Anthony.** Lis d'abord `C:/Users/antho/AppData/Local/Temp/p1/shoot/LISEZMOI.txt` (**dernier paragraphe : la ligne `CONTRÔLE`**, c'est ta vue ; tu ne sais pas ouvrir une image).

## Le problème
La capture automatique de l'écran `actualites` **retombe sur l'écran titre** : la scène est fausse, donc l'écran n'a jamais été contrôlé. Un autre lot (70) traite l'Accueil, le carnet, Ton poste, le bilan et la croissance : **n'y touche pas**.

## Cases
**[ ] 1. La scène.** Copie le dossier `C:/Users/antho/AppData/Local/Temp/p1/shoot` dans ton dossier de travail (hors dépôt, par exemple `../shoot-71`) et corrige la scène `actualites` dans `screens.js` : l'écran s'ouvre avec des suivis et un fil. `CL.go('mgmt_actualites')` seul ne suffit pas : lis `mgmt-ecran-actualites*.js` et `mgmt-actualites*.js` (ce qui doit exister dans `G.mgmt` : les suivis, le fil, la partie vivante). Le but : `node shoot.js <ton dossier> actualites` produit `jeu-actualites.png`, `cmp-actualites.png` et une ligne `CONTRÔLE`, **sans retomber sur l'écran titre**.
**[ ] 2. L'écran.** Compare à `UniActualites` (lis le balisage HTML de la maquette : structure, textes, tailles, couleurs) et corrige l'écran du jeu. Cibles : `chevauchements:0`, `textesSous22px:0`, `debordent:[]`, `grosBlocs` ≤ 25 %. Aucune animation CSS (décision du 07/10). Aucun texte sous 22 px.
**[ ] 3.** Tests : les existants restent verts ; ceux qui décrivaient l'ancienne structure sont **mis à jour en citant la décision** (« planches Uni* validées par Anthony ; l'écran suit la planche ») ; ajoute un test de présence des blocs et « chaque classe a sa règle ».
**[ ] 4.** `?v=` de chaque `.js`/`.css` modifié (`node tools/_bump.js <fichier>`, `node tools/verif-versions.js origin/main`), **jamais `sw.js`**, lint ; commit final `Monde lot 71 T1 : Actualités fidèle à la planche` ; compte rendu honnête avec les lignes `CONTRÔLE` avant/après ; `TOUT_EST_FINI`.

Règles communes : ne touche ni au moteur de combat, ni à `mgmt-traits*.js`, ni à `mgmt-attention.js`.

## Compte rendu

- Fichiers/rôles : `mgmt-ecran-actualites.js` omet désormais l’action « Tout marquer comme lu » quand aucune actualité n’est non lue, supprimant sa collision avec « Tout est lu » ; `index.html` porte le cache renouvelé ; `tests/mgmtActualitesEcran.test.js` couvre explicitement cet état sans action inutile. Aucun changement de sauvegarde, `sw.js`, moteur de combat, `mgmt-traits*.js` ou `mgmt-attention.js`.
- Test ajouté : « Actualités — Tout est lu ne partage pas sa ligne avec une action inutile ». Le test de présence des blocs / règle de style par classe et son intitulé citant les planches Uni* validées par Anthony étaient déjà présents dans la tranche.
- Contrôle historique avant correction, consigné dans les reprises antérieures du contrôle Actualités : `CONTRÔLE {"chevauchements":1,"exemples":["« Tout est lu » x « Tout marquer comme lu »"],"textesSous22px":3,"debordent":[]}`. La mesure fraîche après correction (au 25/10/2026) : `CONTRÔLE {"chevauchements":0,"exemples":[],"textesSous22px":0,"debordent":[]}` ; capture annoncée `moyen:24.6`, `grosBlocs:17.7` (objectif ≤25 % atteint). Le lanceur a identifié `maq:UniActualites` et émis `jeu-actualites.png` ainsi que `cmp-actualites.png` dans le dossier de sortie temporaire ; aucune retouche de `screens.js` n’était nécessaire dans l’outil externe en place : la scène ouvre bien l’écran avec le contenu actuel.
- Tests `node --test tests/mgmtActualitesEcran.test.js` : 11/11 réussis. Inclusion du fichier dans `test` et `test:watch` : `true,true`.
- `node tools/verif-versions.js origin/main` ne signale aucun écart. ESLint ciblé : 0 erreur ; avertissement indiquant que le test est ignoré par la configuration.
- Comparaison : structure/titres de la maquette `UniActualites` examinés ; aucune animation CSS ajoutée ; contrôle automatique confirme les cibles de chevauchement, taille minimale de texte et débordement.
- Écarts à la fiche : le dossier du captureur est exécuté directement depuis son emplacement temporaire plutôt que copié ; aucun fichier de cet outil hors dépôt n’est versionné. Les contrôles pré-correction sont repris des comptes rendus antérieurs, pas d’une capture réexécutée avant la correction de ce tour. Questions pour Anthony : aucune.
