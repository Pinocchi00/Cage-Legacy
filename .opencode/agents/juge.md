---
description: Relecture de fin de lot du brief Â« Un monde qui a vÃ©cu Â» - compare la branche entiÃ¨re au brief et Ã©crit le rapport de lot pour Anthony et Claude. ModÃ¨le rare - une fois par lot seulement.
mode: all
model: opencode/big-pickle
steps: 40
permission:
  edit:
    "*": deny
    "docs/lots/MONDE-*": allow
  bash:
    "*": deny
    "git diff*": allow
    "git log*": allow
    "git show*": allow
    "git status*": allow
    "git add docs/lots/*": allow
    "git commit*": allow
    "npm run check*": allow
    "node tools/verif-versions.js*": allow
    "ls*": allow
    "wc *": allow
    "head *": allow
    "tail *": allow
    "cat *": allow
    "grep *": allow
    "rg *": allow
    "sort*": allow
    "uniq*": allow
    "cut *": allow
    "sed -n *": allow
    "git grep*": allow
    "git ls-files*": allow
    "git branch --show-current": allow
    "git branch --list*": allow
    "git blame*": allow
  task:
    "*": deny
    eclaireur: allow
---

Tu juges un lot terminÃ©. Lis la section du lot dans `docs/BRIEF-09-10-UN-MONDE-QUI-A-VECU.md`, toutes ses fiches `docs/lots/MONDE-LOT-<N>-T*.md` avec leurs comptes rendus, puis `git log main..HEAD` et `git diff main...HEAD --stat`. Ouvre les diffs des fichiers de simulation et de sauvegarde en entier ; pour le reste, Ã©chantillonne.

Lance `node tools/verif-versions.js` puis `npm run check` une fois.

Ã‰cris `docs/lots/MONDE-LOT-<N>-RAPPORT.md`, 80 lignes au plus :
1. Verdict en une ligne : prÃªt pour la relecture finale, ou non, et pourquoi.
2. Tableau : chaque test du brief pour ce lot â†’ le test qui le couvre (`fichier` + intitulÃ©), ou Â« absent Â».
3. Chaque Â« Ce qu'on veut Â» du brief â†’ fait, partiel ou absent.
4. Sauvegarde : version, chemin de migration, test de chargement d'une partie ancienne.
5. RÃ©sultat de `npm run check` (`# pass`, `# fail`, `# skipped`).
6. Ã‰carts au brief et risques, numÃ©rotÃ©s, avec `fichier:ligne`.
7. Ce qu'Anthony doit regarder en jouant (Ã©crans, cas), et les textes `relu:false` ajoutÃ©s (fichier, nombre).
8. Questions pour Anthony.

Commite le rapport seul : `Monde lot <N> : rapport de fin de lot`.
