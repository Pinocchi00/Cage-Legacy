# Brief du 18/10/2026 — le mode Duo (à deux sur le même PC)

Écrit par Claude le 18/10/2026 d'après les décisions d'Anthony du même jour. Branche : `mode-duo`, partie de `origin/main`
au commit `d24673c` (Monde lot 15 T1). Les fiches de tranche sont dans `docs/lots/DUO-T0.md` à `DUO-T4.md` : **ce sont les
seules spécifications du codeur**. Ce brief dit le pourquoi et l'ensemble ; en cas d'écart, la fiche prime pour le code,
les décisions d'Anthony ci-dessous priment sur tout.

## 1. Les décisions d'Anthony (18/10/2026)

Ses mots : « un mode sur le même PC maintenant, rapide à faire et simple, où on prend chacun une organisation […] le reste
du jeu, les autres soirées sont organisées et logiques d'après la vraie vie, par nos adjoints. Et tous les 2 ou 3 mois […]
on fait une super carte, je regarde mes combattants, j'en choisis un, ce qu'ils sont devenus, je le place, puis c'est à
François, pour une grosse carte de 6 combats principaux, avec des enchères sur les joueurs libres ». Référence donnée :
« PFL × MVP » (deux organisations qui montent une carte commune).

Réponses aux questions du 18/10 :

| Question | Décision |
|---|---|
| Rythme de la super carte | **Tous les 3 mois** (91 jours de calendrier) |
| Formation des 6 combats | **« Je place, tu réponds »** : un joueur place un de ses combattants, l'autre choisit son adversaire dans la même catégorie, puis on inverse (3 placements chacun) |
| Enchères sur les combattants libres | **Ouvertes, à tour de rôle** : chacun surenchérit ou abandonne, à la vue de l'autre |
| Qui code | OpenCode (agents sur ChatGPT), d'après les fiches |

## 2. Le mode en une page

- **Deux joueurs, un PC, deux organisations.** Le joueur 1 (J1) choisit son organisation, puis le joueur 2 (J2) la sienne,
  parmi les sept qui restent. La création est celle d'une partie normale : six ans de passé, huit organisations qui vivent.
- **Personne ne booke les soirées ordinaires.** Celles de J1 sont jouées par son adjoint avec le matchmaker automatique
  qui fait déjà vivre les sept autres organisations (`mgmtPredecesseurSoiree`, avec la politique de l'organisation). Celles
  de J2 l'étaient déjà : son organisation est une des sept de `m.orgs`.
- **Tous les 3 mois, la super carte.** Le temps avance d'un bouton jusqu'à la date ; on lit ce qui s'est passé de chaque
  côté ; les enchères ouvrent sur les meilleurs combattants libres du moment ; puis le draft « je place, tu réponds » forme
  6 combats J1 contre J2 ; puis la soirée se regarde dans l'arène actuelle, combat par combat.
- **Le score** : la super carte est gagnée par celui qui gagne le plus de combats. Une saison = 4 super cartes (un an).
- **Ce que le combat change** : bilans, blessures, suspensions, expérience, contrats et classement **dans chaque
  organisation**, comme un combat de soirée. Pas de titre en jeu, pas de recette ni de cachet en version 1.

## 3. Pourquoi c'est faisable vite (ce qui existe déjà)

- `m.orgs` (Monde lot 9 T2a, `mgmt-passe.js`) : les sept autres organisations sont des parties complètes, au même format
  que celle du joueur, avec leur effectif, leur caisse, leur calendrier.
- `mgmtPredecesseurSoiree` (`mgmt-predecesseur.js`) joue une soirée entière d'une partie sans écran : contrats, carte,
  titres, soirée, ouverture du cycle suivant. Il exige `G.mgmt === m`.
- Le recrutement « monde vivant » déplace déjà une ligne d'une organisation à l'autre (`mgmtRecruterVivant`,
  `mgmt-recrutement.js`) et la liste des sans-contrat du monde existe (`mgmtRecrutables`).
- L'écran de combat animé ouvre n'importe quelle trace auto-portante (`mgmtCombatOuvrir`, `mgmt-combat.js`).

## 4. Deux défauts de `main` trouvés en préparant ce brief (DUO-T0, à faire en premier)

Vérifiés le 18/10/2026 par un essai sur `d24673c` (création à 6 soirées de passé, graine 20261015) :

1. **Le monde vivant s'arrête après une soirée.** `mgmtMondeVivantSemaine` ne fait jouer une organisation que si elle a
   une soirée posée ; or `mgmtPredecesseurSoiree` ne pose la suivante qu'au moment de la jouer. Résultat mesuré : après
   6 soirées de Split, MMA Korner en a joué **1** (cycle 8 contre 13). Avec le correctif : 6 (cycle 13 contre 13).
2. **La sauvegarde écrit une autre organisation à la place de la partie du joueur.** Pendant que le monde vivant fait jouer
   une organisation, `G.mgmt` est sa sous-partie ; sa soirée appelle `saveMgmt()` (dans `mgmtRunEvent`) et l'emplacement
   reçoit cette sous-partie. Mesuré : avant la soirée, l'emplacement contient « Split » avec ses sept organisations ;
   juste après, « Undisputed Cage », sans aucune organisation. Si le joueur quitte à ce moment-là, il recharge la partie
   d'une autre organisation.

Ces deux défauts touchent aussi le mode solo et la démo. Le mode Duo en dépend : sans le premier, l'organisation de J2 ne
fait plus de soirées ; sans le second, une partie Duo se corrompt.

## 5. Ce qui n'est PAS dans la version 1 (noté, pas codé)

- Titre en jeu à la super carte, réunification des ceintures.
- Recette, cachets, salle et public de la super carte (elle se joue salle pleine, sans argent sauf les enchères).
- Planches d'écran : **décision de Claude, à confirmer par Anthony** — pour aller vite, les écrans du Duo sont montés avec
  les composants existants du cadre (`mfEcran`, `mfBouton`, cartes d'organisation de « Nouvelle partie », listes de
  l'Effectif), sans planche validée. Les planches viendront après le premier essai avec François.
- Plus de deux joueurs. Jeu en ligne (Steam Remote Play Together le permettra sans code réseau une fois sur Steam).

## 6. Idées en attente de la décision d'Anthony (ne pas coder)

1. **Le défi** : avant le draft, chacun peut réclamer un combattant précis de l'autre ; refuser coûte de la popularité.
2. **Le pari** : chacun mise une part de sa caisse sur le score de la carte.
3. **L'unification** : deux champions de la même catégorie → un combat de réunification en tête d'affiche.
4. **Le débauchage** : un combattant de l'autre à son dernier combat de contrat part aux enchères.
5. **Le perdant choisit en premier** à la super carte suivante — **retenu dans la v1** pour l'ordre du draft et des enchères
   (c'est un réglage, pas un système) ; Anthony peut le retirer.

## 7. Les tranches, dans l'ordre

| Tranche | Contenu | Écran | Sauvegarde |
|---|---|---|---|
| DUO-T0 | Les deux correctifs du monde vivant | non | inchangée |
| DUO-T1 | Le moteur : `m.duo`, création, avancer jusqu'à la super carte, draft, combat entre deux organisations et son rejeu, score, résumé | non | champ facultatif `m.duo`, version inchangée |
| DUO-T2 | Les enchères et le transfert d'un combattant vers l'une ou l'autre organisation | non | idem |
| DUO-T3 | Menu, création à deux, QG du Duo, effectif de chaque joueur | oui | — |
| DUO-T4 | Écrans des enchères, du draft, de la soirée de la super carte et du bilan | oui | — |

Une session par tranche. `npm run check:rapide` à chaque tranche, `npm run check` complet avant la fusion. Chaque `.js`
modifié monte son `?v=` (`node tools/_bump.js <fichiers>`), vérifié par `node tools/verif-versions.js origin/main`.

**Un seul changement de format de sauvegarde à la fois** : le Duo ne monte pas `MGMT_SAVE_VERSION` (champ facultatif,
comme `ouverture` au lot 15). Si une autre branche (lot 16 « palmarès ») la monte entre-temps, le Duo n'a rien à
renuméroter.

## 8. Fin de lot

Toutes les tranches commitées : `/bilan` (rapport `docs/lots/DUO-RAPPORT.md`), puis message à Claude, qui relit, joue une
partie Duo complète (création, une super carte avec enchères, draft, soirée, bilan, rechargement), ouvre la PR et fusionne.
