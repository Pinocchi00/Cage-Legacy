# Monde lot 5 T6 — Réconcilier les tests du lot 1 avec la carte héritée

> **Décision du 13/10/2026 (Claude, superviseur) : cette fiche est exécutable, aucune question n'est ouverte.** Tu tranches toi-même le technique, tu notes tes choix dans le compte rendu.

## 1. Branche
`monde-lot-5-carte` (branche courante). Après les tranches T1 à T5 du lot 5, `npm run check` complet (≈ 10 min, à lancer en tâche de fond, jamais dans une commande de plus de 100 s) donne 1080 tests verts et **4 échecs**, tous dans des tests du lot 1 écrits avant la carte héritée :

1. `tests/mgmtPasse.test.js` : « Monde lot 1 T4 — les contrats, blessures, attentes, ceintures et historique sont conservés » : assertion `conservé : facts`. Cause probable : T1/T2 du lot 5 ajoutent à la clôture des faits (combats hérités, promesses héritées, demandes répondues) qui n'existaient pas avant la clôture ; le test exige que les faits soient identiques.
2. `tests/mgmtPasseSixAns.test.js` (ou le fichier qui porte l'intitulé) : « Monde lot 1 T4 bis — l'effectif total reste dans la fourchette de la création sans passé, et l'âge moyen de Split aussi ».
3. `tests/mgmtPasseT6.test.js` : « Monde lot 1 T6 — les rôles à mémoire s'allument au premier jour : ancien champion, gatekeeper, bête noire, revenant ».
4. `tests/mgmtPasseT6.test.js` : « Monde lot 1 T6 — les rivalités se lisent sur de vrais combats : la fenêtre ne rend pas le passé muet, n'en allume pas cinquante ».

## 2. Ce que tu dois faire
Pour chaque échec, DIAGNOSTIQUE d'abord par un script jetable (hors dépôt, dans le dossier temporaire), 16 créations de six ans au plus :
- **Si le défaut vient du code** (le lot 5 a cassé une propriété du lot 1 : effectif, rôles, rivalités) : corrige le code, sans modifier le test.
- **Si la propriété du test est devenue fausse par construction** (cas 1 : des faits sont ajoutés à la clôture par décision du lot 5) : adapte l'assertion en gardant la VRAIE propriété (« les faits du passé sont conservés ; seuls les faits d'héritage listés sont ajoutés »), avec en commentaire « décision du 13/10/2026 : le lot 5 ajoute des faits d'héritage à la clôture ».
- **Si l'écart vient d'un décalage du flux aléatoire** (mêmes règles, tirages différents : les fourchettes sont un peu dépassées) : élargis la borne d'au plus 10 % de sa largeur, en commentaire « décision du 13/10/2026 : décalage de flux du lot 5, bornes élargies » et liste la valeur mesurée avant/après dans le compte rendu. Tu n'élargis jamais plus : au-delà, c'est un défaut de code à corriger.

## 3. Règles
Aucun nouveau texte. Aucun écran. Version de sauvegarde inchangée (18). Chaque test lent se lance à part. Jamais plus de 16 créations de six ans par commande. Fin : `npm run check:rapide` vert et les quatre tests ci-dessus verts. Commit « Monde lot 5 T6 : tests du lot 1 réconciliés avec la carte héritée » (sans « inachevé »).

## 4. Hors périmètre
Tout le reste du lot 5, le lot 3, le lot 6.
