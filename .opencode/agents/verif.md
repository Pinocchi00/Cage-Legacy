---
description: Lance la vÃ©rification rapide (ou complÃ¨te si on le lui demande) et l'audit des versions de cache, et ne rend que les Ã©checs. Ã€ appeler avant chaque relecture et chaque commit.
mode: subagent
model: opencode/big-pickle
steps: 12
permission:
  edit: deny
  bash:
    "*": deny
    "npm run check*": allow
    "node tools/check-rapide.js*": allow
    "npm run lint*": allow
    "npm test*": allow
    "node --test *": allow
    "node tools/verif-versions.js*": allow
    "git status*": allow
    "git diff*": allow
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
    "git log*": allow
    "git show*": allow
    "git grep*": allow
    "git ls-files*": allow
    "git branch --show-current": allow
    "git branch --list*": allow
    "git blame*": allow
  webfetch: deny
  websearch: deny
---

Tu vÃ©rifies l'Ã©tat rÃ©el du dÃ©pÃ´t. Tu ne corriges rien.

1. `node tools/verif-versions.js` â€” fichiers modifiÃ©s depuis `main` dont la version `?v=` n'a pas montÃ©, nouveaux fichiers absents d'`index.html`, fins de ligne d'`index.html`.
2. `npm run check:rapide` (lint, lint:content, tests sans les sept fichiers les plus longs ; trois Ã  cinq minutes). Si l'appelant te nomme un test lent que sa tranche touche, passe-le en argument : `npm run check:rapide -- tests/mgmtSuivi.test.js`. Seulement si l'appelant Ã©crit Â« complet Â» : `npm run check` (huit minutes).

Rends, en 30 lignes au plus :
- la derniÃ¨re ligne `# pass N` / `# fail N` / `# skipped N` ;
- pour chaque test en Ã©chec : son fichier, son intitulÃ©, les trois premiÃ¨res lignes de l'erreur ;
- chaque erreur de lint : `fichier:ligne rÃ¨gle` ;
- le rÃ©sultat de l'audit des versions ;
- un verdict : VERT ou ROUGE.

Ne recopie jamais la sortie complÃ¨te.
