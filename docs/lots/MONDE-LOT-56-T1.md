# Monde lot 56 T1 (P11 T4) — la croissance visible : des paliers liés à la popularité et au rang

Branche : `p11-croissance` (la branche courante de ce dossier ; commits ICI ; le superviseur fusionne). Brief : `docs/BRIEF-22-10-DES-COMBATTANTS-UNIQUES.md`, lot P11 T4 et le passage P9 « Devenir le plus fort sans partir » et « Pourquoi rejoindre plus fort » (lis-les). Maquette **aux valeurs exactes** : `docs/planches-uniques/UniCroissance.dc.html`.

**Ce qui existe dans `main`** : l'écran Organisation, la popularité, la salle, le diffuseur et les salles accessibles (cherche `salle`, `diffuseur` dans `mgmt-*.js`), le budget du recruteur (P5), les classements des huit (Monde lot 9 : `mgmt-organisations*.js`, `mgmt-monde.js`), les agents libres (recrutement). Lis-les d'abord.

## Cases
**[ ] 1. Les paliers.** `mgmtPaliersCalculer(m)` (pur) : une table de **paliers** (≥ 5) liés à la popularité et au rang de Split chez les huit ; chaque palier ouvre **quelque chose de réel et déjà présent** : salles accessibles, palier du diffuseur, budget du recruteur, attrait pour les agents libres. **Ne crée aucune mécanique nouvelle** : branche seulement des plafonds ou des multiplicateurs sur ce qui existe, avec des valeurs faibles et documentées ; chaque effet a un test. Aucun palier ne peut faire baisser une valeur d'une partie existante (additif).
**[ ] 2. L'annonce.** Chaque palier franchi est **annoncé** (une fois : l'Accueil et le fil de presse) avec une phrase `relu:false` spécifique au palier.
**[ ] 3. L'écran** (`UniCroissance`) sur la page **Organisation** : les paliers franchis, la marche suivante (ce qu'elle ouvre, ce qu'il faut), le rang chez les huit. Préfixe de style `cr3-`, chaque classe a sa règle, aucun texte sous 22 px.
**[ ] 4. Tests** (`tests/mgmtLot56T1.test.js`, dans `test` ET `test:watch`) : franchissement sur une partie qui monte (chemin réel `mgmtPasseGenerer` + soirées) ; annonce unique ; effets bornés ; rien ne baisse pour une partie ancienne (empreintes de `tests/mgmtPasse.test.js` identiques) ; écran sans classe sans règle ; sauvegarde facultative, validée, réparée ; partie neuve ≤ plafond (`tests/mgmtReleveReduit.test.js` en arrière-plan).
**[ ] 5. Fin.** Commit final `Monde lot 56 T1 : la croissance visible` ; compte rendu honnête ; `TOUT_EST_FINI` seulement si tout est vert et commité.

Règles communes : **additif** ; ne touche ni au moteur de combat, ni à `mgmt-traits*.js`, ni à `mgmt-attention.js`.
