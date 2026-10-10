# Cage Legacy — instructions pour agents

Jeu de simulation de carrière MMA. **JS vanilla, canvas 2D, scope global partagé, pas de
modules ES, pas de bundler, pas de framework, 100 % offline.**

## Conventions non négociables

- `G` = état du jeu (`state-core.js`). `CL` = contrôleur (`ui-08-controller-arena.js`,
  exposé via `window.CL`).
- **`esc()` sur toute donnée joueur injectée en HTML. Aucune exception.**
- Sauvegardes : `SAVE_KEY` / `SAVE_BACKUP_KEY`, avec `migrate()` séquentiel et
  `validateSave()` comme seule porte d'entrée.
- Ancres : `/* ==== [ANCRE: NOM] ==== */` avec la référence du lot qui l'a créée.
  Respecte la convention, ne casse jamais une ancre existante sans la remplacer.
- **Aucun `Math.random()` dans la simulation.** RNG à graine, déterministe, injectée.
- L'ordre des `<script>` dans `index.html` est fragile : le harnais de test le lit
  directement. **Vérifie-le, ne le suppose jamais.**
Aucun modèle marqué « entraînement : utilisé » ou « rétention : aucun accord » n'a accès au dépôt.
Vérifier la table de politique de données de Go avant tout changement de modèle.

## Avant de livrer

Une tranche : `npm run check:rapide` (les mêmes contrôles, sans les sept fichiers de test les plus longs) doit passer.
Un lot, et toute fusion : `npm run check` complet (lint + lint:content + tests) doit passer.

## Règles de travail

- Pas de stub, pas de `TODO`, pas de fonction vide. Ce que tu livres est fini.
- Modifie par éditions ciblées (outil d'édition). Ne réécris jamais un fichier existant en
  entier : plusieurs fichiers `mgmt-*.js` dépassent 600 lignes, et `mgmt-voix-data.js` 3 000.
- Un changement à la fois, tests verts après chacun.
- Tu ne demandes pas la permission de continuer. Tu produis et tu vérifies.
- Tu ne combles jamais un trou de spécification par une supposition : tu poses la question.

## Économie (offre OpenCode Go : chaque modèle a son budget)

- Lis les fichiers par morceaux (offset/limit) autour de ce que tu cherches. Pour chercher,
  `@eclaireur` d'abord.
- Pendant le travail : `node --test tests/<fichier>.test.js`, jamais toute la suite.
  `npm run check` complet une fois, à la fin, par `@verif`.
- Mesures et Monte Carlo : petits paramètres pendant les essais (`--n=1000`), une mesure
  complète à la fin.
- Une session par tranche. On ne prolonge pas une session d'une tranche à la suivante.

## Les textes

**Avant le 09/10/2026** : les dialogues et la voix des personnages étaient écrits par l'auteur ;
tu laissais un emplacement vide.

**Depuis la décision d'Anthony du 09/10/2026** (brief « Un monde qui a vécu ») : les textes de
ce brief — fiches d'organisation, adjointes, prédécesseurs, raisons, présentations, pronostics,
événements — sont écrits par Claude (agent `@ecrivain`) et entrent marqués `relu:false`.
Le codeur n'en invente aucun : il passe la commande de sa fiche à `@ecrivain`. Hors de ce
brief, l'ancienne règle s'applique toujours.

## Le brief en cours

- `docs/BRIEF-09-10-UN-MONDE-QUI-A-VECU.md` — le brief, neuf lots (« Monde lot 1 » à 9).
- `docs/PLAN-OPENCODE-MONDE.md` — l'ordre des lots, les branches, les agents.
- `docs/lots/MONDE-LOT-<N>-T<K>.md` — la fiche de chaque tranche : la seule spécification
  du codeur.

## Documents de référence

- `docs/VISION-MODE-MANAGEMENT.md` — vision du mode management. **Prime en cas de
  contradiction avec tout autre document, y compris le cahier des charges.**
- `docs/CDC-MODE-MANAGEMENT.md` — cahier des charges du mode en cours, et ses deux
  addendums. Fait foi sauf contradiction avec la vision ; ses sections périmées
  portent en tête la mention « remplacé par VISION-MODE-MANAGEMENT.md le 17/09/2026 ».
- `docs/ETAT-DES-LIEUX.md` — fichiers concernés, à garder, à jeter.
- `docs/CHARTE-INTERFACE-MANAGEMENT.md` — règles d'interface du management (humanité, réalisme, simplicité, lisibilité mesurable). Tout écran management la respecte.
- `docs/QUESTIONS-OUVERTES.md` — ce qui n'est pas tranché. N'y réponds pas seul.
