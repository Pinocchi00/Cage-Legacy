# Lot 3 T5 — historique consultable

- Diff de la tranche : `mgmt-screens.js` (fiche accessible du bureau et de la carte, historique et rejeu) ; `tests/mgmtTrace.test.js` (deux soirées, nom hostile échappé, ouverture souris et clavier, retour à la fiche). Aucun autre code changé.
- `npm.cmd run check` : 330 tests, 326 réussis, 4 ignorés, aucun échec. `git diff --check` : vide. `git diff -- engine-*.js state/ mgmt-corps.js mgmt-monde.js mgmt-data.js mgmt-save.js mgmt-argent.js` : vide.
- Navigateur réel à 1280, 1440 et 1920 × 1080 : aucun défilement horizontal, aucune erreur console, bouton « Revoir le combat » ouvre le canvas et « Retour » retrouve la même fiche.
- Le « quand » est le **cycle enregistré dans la trace** (`t.c`). La trace ne porte pas de date civile et aucun calendrier absolu n'est défini : aucune date inventée. Le « comment » est le libellé exact du moteur lorsque le rejeu est fidèle ; en cas de divergence, seule la famille d'issue enregistrée reste visible et le rejeu est refusé par l'arène.
- Aucun seuil, constante de simulation ou comportement hors de T5 n'a changé. La sélection clavier de la fiche est une trace de navigation non sauvegardée ; flèches et Entrée accélèrent les boutons disponibles à la souris.
