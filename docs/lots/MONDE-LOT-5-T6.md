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

## Compte rendu

### Diagnostic et choix techniques
- Sondes jetables, jamais ajoutées à Git : cinq créations complètes de six ans et une création réduite à deux soirées. Comparaison de la génération actuelle avec les fonctions du prédécesseur/passé d'avant T1 (`7f6e692`), puis essai de la correction par photographie des réclamations.
- **Faits** : la cause probable de la fiche n'était pas la cause mesurée. Sur le passé de deux soirées, aucun ajout de fait à la clôture ; la promesse conservée passe de `d:179` à `d:145`, toujours vers la même demande après filtrage. Le test exige désormais l'égalité complète des faits conservés après ce seul recalage autorisé par T2. Aucun ajout arbitraire ni changement de contenu n'est toléré.
- **Booking** : T2 répond avant la pose/booking, ce qui retire les demandes répondues de `mgmtDemandesOuvertes`, donc de `mgmtPublicReclame`. L'intégration changeait ainsi involontairement le booking porté. La liste des réclamations est maintenant photographiée après contrats/recrues, avant les réponses, puis passée au booker existant. Réponses toujours avant booking, toutes les gardes de sélection conservées, aucun second système, aucune priorité nouvelle pour les promesses futures. Les appelants sans réponses et la carte héritée gardent leur lecture directe habituelle.
- **Rôles et rivalités** : leurs règles et leurs tests sont inchangés. Split `20261008`, avant correction → après correction : revenants **0 → 2**, rivalités actives **0 → 1** (trilogie). Le contrepoint d'avant T1 donnait 3 revenants et 2 rivalités : on ne cherche pas à rétablir ses tirages ni son historique exact.
- **Effectif et âge Split**, avant correction → après correction : `20261008`, **357 → 357**, **28,784314 → 28,801120** ans ; `20261009`, **343 → 346**, **28,755102 → 28,658960** ans. Bornes originales conservées : effectif `[345,380]`, âge `[28.2,29.4]`. **Aucun élargissement de borne.**

### Fichiers modifiés et rôle
- `mgmt-predecesseur.js` : photographie éphémère des réclamations, passée au booking commun ; pas d'état sauvegardé supplémentaire.
- `tests/mgmtPasse.test.js` : comparaison des faits avec recalage des références, plus régression rapide du booking après réponse.
- `index.html`, `sw.js` : versions de cache remontées par `node tools/_bump.js mgmt-predecesseur.js`, ordre des scripts inchangé, `index.html` en LF.
- La présente fiche : diagnostic, choix, vérifications et bilan.

### Tests ajoutés et adaptés
- Ajout : `Monde lot 5 T6 — répondre à une demande ne retire pas son combat du booking porté` : une demande de revanche réelle est promise, disparaît des demandes ouvertes, mais son combat réclamé est effectivement joué sur la principale.
- Adaptation autorisée : `Monde lot 1 T4 — les contrats, blessures, attentes, ceintures et historique sont conservés` : seules les références `d` aux demandes conservées sont recalées dans l'attendu ; tous les autres champs restent comparés à l'identique.
- Aucun nouveau fichier de test : scripts `test` et `test:watch` inchangés.

### Vérifications
- `node --test tests/mgmtPasse.test.js` : **13/13**.
- `node --test tests/mgmtPasseT6.test.js` : **5/5**, dont les deux tests de mémoire/rivalités cités par la fiche.
- `node --test --test-name-pattern="effectif total" tests/mgmtPasseSixAns.test.js` : **1/1**, quatre créations, bornes originales.
- `node --test tests/mgmtPredecesseurDemandes.test.js` : **6/6** ; `node --test tests/mgmtPredecesseur.test.js` : **6/6**.

### Sauvegarde, écarts et questions pour Anthony
- Format inchangé, **version 18**, aucune migration ni réparation rétroactive. Aucun texte joueur, écran ou CSS ajouté.
- L'accès en écriture au dossier temporaire indiqué a été refusé par l'outil malgré deux essais ; sondes et journaux rangés dans `tools/reports/`, ignoré par Git, conformément à la règle générale du dépôt. Ils ne sont pas commités.
- Première exécution du fichier six ans entier interrompue sans détail d'assertion ; relance isolée en tâche de fond. Chaque commande reste sous 16 créations, aucune commande bloquante de plus de 100 secondes.
- Questions pour Anthony : **aucune**.

### Reprise (14/10/2026)
- `node tools/verif-versions.js` : aucun écart par rapport à `main` (exit 0).
- `npm run check:rapide` : VERT — 107 fichiers lancés, 14 écartés ; durée ≈ 388,7 s.
- Tests de tranche verts : `mgmtPasse.test.js` 13/13, `mgmtPasseT6.test.js` 5/5, `mgmtPasseSixAns.test.js` (pattern « effectif total ») 1/1.
- Fichiers committés seuls : `docs/lots/MONDE-LOT-5-T6.md`, `index.html`, `mgmt-predecesseur.js`, `sw.js`, `tests/mgmtPasse.test.js`.
- `mgmt-retraits-data.js` et `mgmt-voix-data.js` remis à HEAD (changements de fins de ligne seuls) et hors du commit.
