# Monde lot 58 T1 (P9 T4 + choc des organisations) — le renvoi, les offres, le choc

Branche : `p9-renvoi-offres` (la branche courante de ce dossier ; commits ICI ; le superviseur fusionne). Brief : `docs/BRIEF-22-10-DES-COMBATTANTS-UNIQUES.md`, lot P9 T4 et la section « Pourquoi rejoindre plus fort » (**quatre raisons**), lis tout P9 et P10. Maquettes **aux valeurs exactes** : `docs/planches-uniques/UniChoc.dc.html` (le choc des organisations), `UniBilanPatron.dc.html` et `UniTonPoste.dc.html` (le bilan et le poste, déjà portés : regarde ce qui existe dans `mgmt-poste*.js`).

**Ce qui existe dans `main`** : le contrat (`m.poste`, objectifs, confiance, bilan de fin de contrat), les huit organisations et leur classement (Monde lot 9), l'écran Ton poste. **Cette tranche ne change PAS d'organisation** : T5 « changer d'organisation » n'est pas codée avant une étude (case 5).

## Cases
**[ ] 1. Le renvoi (T4).** Au bilan de fin de contrat, une confiance au plus bas donne le renvoi (déjà possible ? lis `mgmt-poste*.js`) : le joueur reçoit alors **deux à trois offres** d'organisations plus petites **ou peut attendre** ; bien noté, il est **approché** par de plus grandes. Chaque offre : l'organisation, le poste, le salaire, une phrase `relu:false` du patron concerné (nom déjà validé dans les données, sinon la fonction du poste). Il peut **refuser**. Les offres sont stockées dans un champ facultatif (`m.offres`), validé, réparé seulement s'il est présent.
**[ ] 2. Les quatre raisons de rejoindre plus fort** : calcule et affiche pour chaque offre les raisons concrètes qu'on peut mesurer dans les données (la scène : salle/diffuseur/budget ; les meilleurs du monde au classement mondial de l'organisation ; l'attrait pour les agents libres ; le choc des organisations possible). Pas de jauge, des mots.
**[ ] 3. Le choc des organisations.** Une soirée commune, champion contre champion, **au plus une fois par an** : une autre organisation la propose et le joueur accepte ou refuse, ou le joueur la propose et l'autre répond (la probabilité d'accepter dépend du rang : une organisation bien classée reçoit plus de propositions et voit les siennes plus souvent acceptées). Accepté, le choc est **programmé** comme une soirée spéciale (utilise l'agenda existant, sans second système) ; y gagner fait monter l'organisation. Écran `UniChoc`, préfixe `ch3-`, chaque classe a sa règle, aucun texte sous 22 px.
**[ ] 4. Rester est une vraie voie** : un test de bout en bout montre qu'une partie qui refuse toutes les offres et fait monter Split continue (contrat prolongé, pas de plantage).
**[ ] 5. L'étude de T5 (document, pas de code)** : écris `docs/lots/ETUDE-CHANGER-D-ORGANISATION.md` : comment passer de Split à l'une des sept autres organisations du monde vivant sans recréer la partie (ce que `m.orgs[id]` porte, ce qu'il faut échanger, les risques de sauvegarde, le plan en tranches). **Aucun code de T5.**
**[ ] 6. Tests** (`tests/mgmtLot58T1.test.js`, dans `test` ET `test:watch`) ; sauvegarde facultative, validée, réparée ; partie neuve ≤ plafond (`tests/mgmtReleveReduit.test.js` en arrière-plan) ; partie ancienne intacte.
**[ ] 7. Fin.** Commit final `Monde lot 58 T1 : le renvoi, les offres et le choc` ; compte rendu honnête ; `TOUT_EST_FINI` seulement si tout est vert et commité.

Règles communes : **additif** ; ne touche ni au moteur de combat, ni à `mgmt-traits*.js`, ni à `mgmt-attention.js`.

## Compte rendu

- **État : inachevé.** Branche vérifiée : `p9-renvoi-offres`. Le journal ne contenait que le commit de création de la fiche ; aucune implémentation/tests de cette tranche n'étaient déjà livrés.
- **Fichier ajouté :** `docs/lots/ETUDE-CHANGER-D-ORGANISATION.md`, inventaire initial et plan d'étude T5 fondés sur `mgmt-organisations.js` et `mgmt-organisations-data.js`.
- **Tests ajoutés :** aucun. Tests ciblés : aucun lancé ; les fonctionnalités des cases 1 à 4 et 6 restent à implémenter et vérifier.
- **Sauvegarde :** aucune modification effectuée ; version inchangée.
- **Écarts à la fiche :** renvoi/offres, raisons, choc, écran `UniChoc`, chemin « rester », assertions de sauvegarde et intégration package ne sont pas réalisés. Aucune maquette n'a été portée.
- **Questions pour Anthony :** aucune nouvelle question de conception soulevée par la lecture. L'étude signale les champs actifs et le traitement des contrats lors d'un changement comme points à inventorier avant T5, sans trancher leur comportement.
- **État préalable préservé :** les modifications locales de `.opencode/agents/*` et `opencode.json` sont préexistantes et n'ont pas été incluses.
