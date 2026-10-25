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

- Fichiers applicatifs : aucun nouveau changement nécessaire ; l'écran existant fournit les panneaux suivis, fil et détail et passe déjà les tests d'interface ciblés.
- Test ajouté : « Actualités — les trois blocs suivis, fil et détail sont présents comme sur les planches Uni* validées par Anthony ; l’écran suit la planche ».
- Contrôle ciblé `node --test tests/mgmtActualitesEcran.test.js` : 10/10 réussis.
- Versions : `node tools/verif-versions.js origin/main` ne signale aucun écart.
- Lint ciblé du test : le fichier est ignoré par la configuration ESLint (avertissement uniquement).
- Scène de capture : non exécutée ; `screens.js`, `shoot.js` et le dossier de scène ne sont pas présents dans ce dépôt et l’accès au dossier temporaire indiqué a été refusé par l’environnement. Les lignes `CONTRÔLE` avant/après sont donc indisponibles ; cible capture non vérifiée.
- Comparaison visuelle avec `UniActualites` et métriques (`chevauchements`, `textesSous22px`, `debordent`, `grosBlocs`) : non mesurées. Aucun écart chiffré ne peut être certifié à partir des seuls tests DOM.
- Écarts à la fiche : la scène et la vérification de la capture/mesures visuelles restent à faire ; aucune migration de sauvegarde.
- Questions pour Anthony : aucune ; l'accès à l'outil de capture devra être rétabli pour produire le contrôle exigé.
