# CAGE LEGACY — Plan pour Claude Code (4 chantiers)

Repo : `github.com/Pinocchi00/Cage-Legacy`

Objectif global : améliorer robustesse, profondeur et maintenabilité **sans réécrire le jeu**.

---

## ⚠️ Contraintes d'architecture à respecter absolument

Avant toute modification, Claude Code doit inspecter l'architecture existante :

- 13 fichiers JS vanilla, **scope global partagé, pas de modules, pas de bundler**.
- Ordre de chargement strict dans `index.html` :
  `data-skills.js → data-content.js → engine.js → state.js → ui-01…ui-08 → main.js`
- Convention d'ancrage : `/* ==== [ANCRE: NOM] ==== */` — à conserver sur tout code déplacé.
- Persistance via `localStorage`, déploiement GitHub Pages, doit rester 100 % offline.
- Validation : `node --check` sur chaque fichier modifié + harnais de tests jsdom existants (Claude Code doit d'abord regarder `package.json` / dossier de tests pour voir quelles commandes existent réellement — ne pas supposer `npm test` s'il n'existe pas).

**Ne jamais introduire `import`/`export` ES modules.** Toute extraction de fichier doit rester chargée via balise `<script>` classique, insérée au bon endroit dans l'ordre de chargement, avec les fonctions toujours accessibles en scope global (ou via un namespace du type `window.SaveSystem = {...}` si besoin de regroupement).

---

## Ordre recommandé

```
1️⃣ Sauvegardes (sécuriser les données existantes en premier)
2️⃣ Analytics locales
3️⃣ Génération procédurale (rivalités / arcs narratifs / événements)
4️⃣ Refactorisation progressive du moteur (le plus risqué → en dernier)
```

---

## 1. 💾 Sauvegarde versionnée + récupération automatique

- Créer/augmenter proprement `SAVE_VERSION` (constante existante à identifier d'abord, pas à dupliquer).
- Chaque sauvegarde contient `version`, `player`, `career`, `rankings`, `history`, etc.
- `migrateSave(save)` : migration séquentielle (v1→v2→v3…), jamais de suppression d'une ancienne sauvegarde.
- Backup automatique avant chaque écriture (`save` + `save_backup`) ; restauration auto si `save` est corrompue.
- `validateSave(save)` avant chargement : version valide, joueur présent, stats numériques, `history` en tableau, division/année valides, aucun `NaN`, aucune donnée impossible. Une sauvegarde invalide ne doit jamais faire planter le jeu.
- Migration tolérante pour les nouvelles stats (ex. `if (save.fighter.morale === undefined) save.fighter.morale = 50;`).

## 2. 📊 Analytics locales

- Objet `analytics` global : `careersStarted`, `careersCompleted`, `totalFights`, `totalWins/Losses/Draws`, `totalKO/Submissions/Decisions`, `longestCareer`, `highestOverall`, `highestElo`, `bestWinStreak`.
- `analytics.divisions.{division}` : `careers`, `fights`, `wins`.
- Répartition par méthode de victoire (KO / soumission / décision, en %).
- Par carrière terminée : `duration`, `fights`, `wins/losses/draws`, `titles`, `peakOverall`, `peakElo`, `winStreak`, `finishRate`.
- 100 % local (`localStorage`), **aucune collecte réseau, aucune donnée personnelle, pas de tracking externe.**

## 3. 🧠 Génération procédurale avancée

Renforcer les systèmes existants (ères MMA, news, mémoire tactique) — ne pas créer de système parallèle.

- **Rivalités persistantes** : `rivalryHeat` (0–100) qui monte à chaque affrontement répété entre deux combattants ; paliers (adversaire normal → rival potentiel → rivalité → rivalité majeure → rivalité historique).
- **Conséquences** : une rivalité chaude augmente intérêt médiatique, popularité, valeur du combat, récompense — mais aussi pression et risque de mauvais choix.
- **Arc post-défaite** : 2 défaites consécutives → événement "camp de rédemption" → arc de comeback si victoires qui suivent.
- **Arc d'ascension** : paliers de victoires consécutives (prospect → contender → title shot → superstar) qui changent le discours médiatique généré.
- **News contextuelles** : générer les actualités à partir des vraies stats de carrière ("X bat Y après 3 défaites consécutives", "Y prend sa revanche après sa défaite controversée") plutôt que du texte générique.
- **Événements rares** (probabilité faible, jamais obligatoires) : blessure, retour surprise, upset, combat de l'année, déclin, changement de catégorie, retraite surprise.

## 4. 🧩 Refactorisation progressive du moteur (sans ES modules)

`engine.js` (~125 000 caractères) est trop gros. Objectif : extraire progressivement vers des fichiers séparés, **chargés en `<script>` classique insérés dans l'ordre existant**, jamais en `import`/`export`.

Cible indicative :
```
engine-career.js
engine-combat.js
engine-rankings.js
engine-progression.js
engine-saves.js
engine-analytics.js
engine-rivalries.js
engine-events.js
engine-hall-of-fame.js
engine.js (ce qui reste)
```

Étapes :
1. **Identifier les responsabilités** dans `engine.js` (combat, carrière, classement, progression, sauvegarde, stats, événements, panthéon, news).
2. **Extraire sans changer le comportement** — copier une fonction dans son nouveau fichier, garder son nom et sa signature exactes, garder l'ancre `/* ==== [ANCRE: NOM] ==== */`.
3. **Ajouter le `<script>` du nouveau fichier dans `index.html`**, positionné correctement dans l'ordre de chargement (avant tout fichier qui l'utilise).
4. **Réduire les dépendances globales progressivement** — regrouper en objets type `CareerSystem`, `RankingSystem`, `SaveSystem` seulement si ça ne casse pas les appels existants ailleurs dans le code.
5. **Tester après chaque extraction** : `node --check` sur le fichier touché + harnais de tests jsdom existants. Si un test échoue, corriger avant de passer au module suivant — ne pas empiler les extractions.

---

## 🛡️ Règles absolues

- Ne pas modifier le gameplay existant sans nécessité — les nouvelles fonctionnalités sont additives.
- Les anciennes sauvegardes doivent rester compatibles, jamais supprimées.
- Les tests/harnais existants doivent continuer à passer.
- Aucun système existant supprimé juste parce qu'il peut être remplacé.
- En cas de conflit entre existant et nouveau, privilégier la compatibilité avec le comportement actuel.
- Conserver : fonctionnement offline, fonctionnement mobile, partage de légendes, Panthéon, systèmes de classement/carrière, ères MMA, news, mémoire tactique.
- Ne jamais introduire `import`/`export` ES modules ni bundler.
- Avant de coder, inspecter l'architecture actuelle et les systèmes déjà présents — ne pas dupliquer.

## Livrables attendus en fin de mission

1. Fichiers modifiés/créés
2. Fonctionnalités ajoutées
3. Migrations de sauvegarde (avant/après)
4. Tests exécutés et résultats
5. Problèmes restants / points d'attention
