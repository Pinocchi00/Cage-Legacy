# Brief du 06/10/2026 — Lot 12 : les options, le son et la version PC

Code : `mgmt-reglages.js` (les réglages, sans DOM, à part des parties), `mgmt-options.js` (l'écran et ses cinq onglets), `mgmt-son.js` (le son synthétisé),
`sw.js` + `manifest.webmanifest` + `icons/` (la version installable). Branchements : `mgmt-combat.js` (son des coups et de la salle, images par seconde),
`arene-salle.js` (taille de l'image), `mgmt-cadre.js` (entrée Options du menu et de la barre), `main.js` (enregistrement du service worker). CSS `.mf-op-*`.
Tests : `tests/mgmtOptions.test.js`. Origine des sons : `docs/SONS-ORIGINE.md`.

## Livré
- **L'écran Options** (planches « Options », « L'affichage », « Le son », « Les touches », « La partie ») : cinq onglets, Tab pour passer de l'un à l'autre, ↑ ↓ pour choisir un réglage,
  ← → pour le changer, **R** pour remettre les réglages d'origine de l'onglet, Échap pour revenir d'où l'on vient. Ouvert depuis le menu principal (sans partie) ou la barre des sections ;
  grisé dans la barre pendant la soirée, comme le reste.
- **Combat (6)** : vitesse au départ x1/x2/x4, caméra au départ câble/plafond/large, commentaire, paroles des coins, nom des coups, secousses. Lus par l'écran du combat du lot 11 ;
  masquer un élément le retire de l'image sans toucher au combat (lecture de la trace seule).
- **Affichage (3)** : plein écran (suit aussi la touche du navigateur), taille de l'image 1280 × 720 / 1920 × 1080 / 2560 × 1440, images par seconde 30/60.
- **Son (5)** : volume général, musique, salle, coups (0 à 10), son coupé hors du jeu. Volume 0 coupe tout ; la fenêtre derrière coupe le son si le réglage le demande.
- **Touches** : la liste des planches (partout, dans les listes, pendant la soirée, pendant le combat).
- **Partie (3)** : sauvegarder maintenant, changer de partie (ouvre les trois emplacements), effacer (la confirmation de l'écran des emplacements).
- **Réglages à part des parties** : la clé `cage-legacy-reglages`, valable pour les trois emplacements et avant toute partie. Une valeur illisible ou hors liste revient à son origine ;
  aucun format de partie ne change (aucune migration).
- **Le son** : musique des menus et de la soirée (jamais en combat), public dont le niveau suit le remplissage de la salle, impacts à chaque coup qui touche, clic d'interface. Tout synthétisé.
- **La version PC** : application installable (manifeste, icônes, service worker). Elle se lance hors ligne ; les sauvegardes sont dans le localStorage de la page, qu'une mise à jour ne touche pas.

## Décisions
- **Sons synthétisés, aucun fichier** : pas de licence à acheter, pas d'origine à tracer fichier par fichier ; le test refuse tout fichier audio non documenté.
- **« Taille de l'image »** = la résolution à laquelle le combat est dessiné (plafonnée), plus la taille de la fenêtre quand le jeu tourne installé. L'échelle générale des écrans (`mfAjuste`) n'est pas touchée : des tests en dépendent.
- **Effacer** réutilise la confirmation des emplacements plutôt que d'en écrire une seconde.
- **Version installable = PWA** (Chrome/Edge sur PC), pas d'Electron : zéro dépendance, comme le reste du jeu.

## Textes d'auteur (à relire)
Les libellés et les aides de l'écran Options (`MGMT_OP_LIGNES`, `MGMT_OP_TOUCHES`) sont ceux des planches ou écrits sur leur modèle : `relu: false`. Anthony les relit à la fin.

## Écarts connus
- La taille de la fenêtre n'est changée que dans l'application installée (un navigateur refuse `resizeTo` sur un onglet).
- Pas de build Electron/Tauri : une version « .exe » demanderait un empaquetage que le dépôt ne fait pas.
- Les sons sont sobres (synthèse) ; des enregistrements sous licence pourraient les remplacer plus tard, avec leur ligne dans `docs/SONS-ORIGINE.md`.
