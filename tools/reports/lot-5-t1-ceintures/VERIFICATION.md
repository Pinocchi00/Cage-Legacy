# Lot 5 T1 — Vérification de livraison

02/10/2026 — worktree `cage-legacy-arene`, branche `lot-5-t1-ceintures`,
créée depuis `origin/main` (`d3fc0e5`).

## Vérifications exécutées

- `npm run check` (appelé par `npm.cmd` sous PowerShell) : **vert**.
  424 tests : 420 réussis, aucun échec, quatre ignorés existants de la T6.
  Les onze nouveaux tests T1 (dont trois de reprise Mémoire) sont inclus
  dans `npm test` et `test:watch`.
- `node tools/mesure-ceintures.js --save=tools/reports/lot-5-t1-capture-save.json` :
  vingt soirées par graine, trois graines, 300 titres : 41 changements et
  259 défenses gagnées ; aucun cycle d'attente. Rapport et chiffres détaillés
  dans `../LOT-5-T1-CEINTURES.md` et `../LOT-5-T1-CEINTURES.json`.
- `node tools/capture-ceintures.js` : Chrome réel, ressources locales,
  six audits (Mondial / Split à 1280, 1440 et 1920), aucun chevauchement
  dans les blocs Champion, aucun défilement horizontal, aucune erreur de
  console. Texte du nouveau bloc à 18px minimum, noms à 34px ; contraste
  minimum relevé **6,95:1**. Les libellés factuels et noms longs s'enroulent.
- Parcours réel à la souris : Champion → fiche → Retour aux classements,
  choix de titre par la case de la carte. Clavier : Espace annule puis
  réactive la case, avec focus conservé. Rechargement : le choix reste coché.
- Les traces de vrais combats en cinq rounds sont rejouées et comparées
  intégralement aux déroulés d'origine par les tests, sans déplacement de RNG.
- Reprise Mémoire : une partie neuve garde ses douze faits `title_initial`
  mais affiche **Mémoire · 0 faits**, sans ligne. Chaque `title_fight` a une
  seule ligne : **Ceinture conservée**, **Ceinture perdue**, ou **Ceinture
  attribuée**, avec les deux noms de sa trace. Le titre vacant après un nul
  reste indiqué **Titre vacant**. Le détenteur est nommé en premier, qu'il
  soit côté A ou B ; l'issue historique survit au changement de champion et
  au départ des deux combattants. Lecture sans mutation ni tirage, noms
  hostiles échappés : tests verts.
- Le compteur de Mémoire utilise exactement les lignes rendues (y compris
  celles rangées dans le déroulé des faits plus anciens), pas le total
  stocké. Dans la partie capturée après vingt soirées : **188 lignes**, dont
  **100 combats de titre**, et **Mémoire · 188 faits** ; les douze attributions
  initiales restent stockées, exclues du compteur et de la liste.

## Captures

- `classements_mondial_1920.png` : les cinq organisations, après vingt soirées.
- `classements_split_1920.png` : la ceinture de Split et ses défenses.
- `classements_mondial_1280.png` et `classements_mondial_1440.png` : lisibilité.
- `booking_titre_1920.png` : le geste explicite validé par Anthony.
- `maquette_titre_1920.png` : la maquette statique 04b validée avant codage.
- `semaine_memoire_neuve_1920.png` : la semaine neuve, Mémoire ouverte à zéro.
- `semaine_memoire_1920.png` : la semaine après vingt soirées, Mémoire ouverte
  avec les titres et le compteur des lignes effectivement rendues.
- `audit.json` : tailles, contrastes et contrôles du navigateur.

## Écarts trouvés et corrigés pendant le parcours

- **L2** : l'aplat jaune du Champion posé sur le halo supérieur aurait pu
  faire descendre le contraste. Le bloc garde le prune chaud comme fond
  opaque sous sa teinte jaune ; les données atteignent au moins 6,95:1.
- **L4 / S5** : dans la fiche existante, le nom condensé de 116px peint
  au-dessus de sa boîte de ligne et masquait le clic sur Retour. L'espace
  supérieur du nom est réservé ; le vrai clic et le retour sont vérifiés.
- **R4 / S6** : la case est absente pour une paire ne pouvant pas jouer le
  titre. Le changement du nombre de rounds est immédiat ; un premier combat
  reste en cinq rounds quand on décoche le titre.
- **H4 / R1** : noms issus des générateurs existants, libellés factuels
  seulement. Aucune réplique ni voix produite. `esc()` / `escJsAttr()` sur
  les données affichées et les liens de fiche.

## Sauvegardes et intégration

Migration management **10 → 11**, strictement séquentielle. Les anciens
combats conservent leurs trois rounds ; les attributions initiales sont
datées au cycle de migration, sans défense inventée. Les faits de titre
référencent leurs traces auto-portantes ; ni faits ni combats tronqués.
La réparation d'une trace illisible recale les références qui la suivent.
La suite teste aussi 120 défenses consécutives et le rechargement intact.

Tous les scripts du jeu modifiés portent `?v=lot5t1` ; `mgmt-data.js`,
`mgmt-ceintures.js` et `mgmt-ecran-semaine.js` portent `?v=lot5t1r2` pour la reprise,
avec le nouveau script
`mgmt-ceintures.js` placé après `mgmt-monde.js`, avant `mgmt-save.js`.
L'ordre est lu directement dans `index.html` par les tests et la mesure.

**H3 :** la version 11 est maintenant utilisée par T1. Sa migration
d'identité prévue au contrat 10 → 11 devra devenir **11 → 12** après
intégration de cette branche.

Les rapports et preuves sont explicitement réinclus dans `.gitignore`.
La sauvegarde temporaire de capture reste une sortie régénérable ignorée.
