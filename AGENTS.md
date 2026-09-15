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

`npm run check` (lint + lint:content + tests) doit passer. Tu le lances toi-même.

## Règles de travail

- Pas de stub, pas de `TODO`, pas de fonction vide. Ce que tu livres est fini.
- Fichiers complets, jamais de diff partiel ni de « … reste inchangé ».
- Un changement à la fois, tests verts après chacun.
- Tu ne demandes pas la permission de continuer. Tu produis et tu vérifies.
- Tu ne combles jamais un trou de spécification par une supposition : tu poses la question.

## Ce que tu n'écris jamais

**Les dialogues et la voix des personnages sont écrits par l'auteur, pas par toi.**
Si une tâche demande des répliques, des noms de personnages ou leurs motivations, tu
laisses un emplacement vide et tu le signales. Une réplique générique est pire que rien.

## Documents de référence

- `docs/CDC-MODE-MANAGEMENT.md` — cahier des charges du mode en cours. Fait foi.
- `docs/ETAT-DES-LIEUX.md` — fichiers concernés, à garder, à jeter.
- `docs/CHARTE-INTERFACE-MANAGEMENT.md` — règles d'interface du management (humanité, réalisme, simplicité, lisibilité mesurable). Tout écran management la respecte.
- `docs/QUESTIONS-OUVERTES.md` — ce qui n'est pas tranché. N'y réponds pas seul.
