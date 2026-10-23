# Monde lot 55 T1 (P11 T1 + T3) — la cérémonie de fin d'année et le carnet du matchmaker

Branche : `p11-ceremonie-carnet` (la branche courante de ce dossier ; commits ICI ; le superviseur fusionne). Brief : `docs/BRIEF-22-10-DES-COMBATTANTS-UNIQUES.md`, lot P11 T1 et T3 (lis P11 et P9 en entier). Maquettes **aux valeurs exactes** : `docs/planches-uniques/UniCeremonie.dc.html` (la cérémonie), `UniCarnet.dc.html` (le carnet), `UniRecords.dc.html` et `UniMeilleurs.dc.html` (records et meilleurs : pour les chiffres et les formes).

**Ce qui existe dans `main`** : les défis (P11 T2 : `m.defis`, `mgmt-defis*.js`), les primes, les relevés (`m.hist`), le contrat et le bilan du patron (P9 : `m.poste`, `mgmt_poste_bilan`), les histoires (P8 T1), les classements des huit organisations (Monde lot 9), la fin d'année actuelle (cherche `finAnnee`, `bilan`, `saison` dans `mgmt-*.js`). Lis-les d'abord.

## Cases
**[ ] 1. Les prix de l'année (T1).** `mgmtCeremonieCalculer(m)` (pur, déterministe, aucun `rnd()`) : **combattant, KO, soumission, combat, révélation, retour de l'année**, choisis « par la presse » **sur les relevés** de l'année écoulée (jamais au hasard ; départage stable) ; chacun avec une phrase de presse `relu:false`, spécifique au prix. Un prix sans candidat sérieux n'est pas décerné (jamais de prix bidon). Les prix sont **inscrits sur les fiches** des lauréats (un champ facultatif, validé/réparé).
**[ ] 2. L'écran de la cérémonie** (`UniCeremonie`) à la fin de l'année du jeu, avant le bilan du patron, **sans casser** l'enchaînement existant : les six prix, le classement final des huit, le bilan du patron (lien vers l'écran existant). Préfixe de style `ce3-`, chaque classe a sa règle, aucun texte sous 22 px.
**[ ] 3. Le carnet du matchmaker (T3).** Section secondaire (accessible comme les autres sections secondaires) : **champions couronnés sous toi**, **espoirs devenus classés**, **records de tes soirées**, primes, cérémonies, défis. Il se lit à partir de l'état existant (rien n'est recalculé de zéro quand une trace existe) ; `UniCarnet`.
**[ ] 4. Tests** (`tests/mgmtLot55T1.test.js`, dans `test` ET `test:watch`) : les prix sur au moins 3 années simulées (`mgmtPasseGenerer` puis soirées jouées) ; déterminisme (même état, mêmes prix) ; aucun prix sans candidat ; aucune phrase répétée sur 50 soirées ; classes sans règle = 0 ; échappement ; sauvegarde (facultatif, validé, réparé ; partie neuve ≤ plafond : `tests/mgmtReleveReduit.test.js` en arrière-plan ; partie ancienne intacte).
**[ ] 5. Fin.** Commit final `Monde lot 55 T1 : la cérémonie et le carnet` ; compte rendu honnête ; `TOUT_EST_FINI` seulement si tout est vert et commité.

Règles communes : **additif** ; ne touche ni au moteur de combat, ni à `mgmt-traits*.js`, ni à `mgmt-attention.js`.

## Compte rendu

- État constaté à la reprise : seul le commit de la fiche (`645a108`) figure dans l’historique de cette branche ; aucun fichier de la tranche ni test n’était présent dans le dépôt. Les modifications Git préexistantes des fichiers `.opencode/agents/*` et `opencode.json` sont étrangères à cette tranche et sont laissées intactes.
- Vérifications documentaires faites : sections P9 et P11 du brief, maquettes `UniCeremonie` et `UniCarnet`, et points d’entrée de validation/réparation des sauvegardes. Les maquettes requièrent une implémentation d’écran complète, et la fin d’année doit être raccordée au flux existant.
- Non réalisé : calcul et persistance des prix, écran de cérémonie et carnet, tests exigés, audit et vérification de la tranche. Aucun code n’a été ajouté ni présenté comme achevé.
- Écart à la fiche : la tranche reste entièrement à faire ; aucun commit de livraison n’a été produit. Il serait trompeur de déclarer les tests verts ou d’émettre `TOUT_EST_FINI`.
- Questions pour Anthony : aucune question de spécification précise identifiée dans la fiche ; le point restant est l’implémentation complète de la tranche sur cette branche.
