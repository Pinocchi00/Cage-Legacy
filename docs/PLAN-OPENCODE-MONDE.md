# Plan d'exécution OpenCode — brief « Un monde qui a vécu »

09/10/2026. Le brief : `docs/BRIEF-09-10-UN-MONDE-QUI-A-VECU.md` (copie du document en ligne).
Ce plan dit qui fait quoi, dans quel ordre, et où Anthony et Claude interviennent.

## En bref

OpenCode fait tout le travail courant avec sept agents répartis sur six modèles de l'offre Go,
parce que **chaque modèle a son propre budget** : répartir le travail multiplie ce qu'on peut
dépenser. Le modèle rapide et bon marché (GLM 5.3 Flash) code ; des modèles plus forts écrivent
la fiche avant et relisent après. Claude n'intervient qu'aux points où une erreur coûte cher :
les planches, la relecture de fin de lot avec le jeu ouvert, la PR et la fusion.

## Les agents

| Agent | Modèle Go | Rôle | Budget Go (5 h / mois, requêtes estimées) |
| --- | --- | --- | --- |
| `architecte` | mimo-v2.6-pro | Lit le brief et le code, écrit la fiche de tranche | 3 250 / 16 300 |
| `codeur` | glm-5.3-flash | Code la tranche, teste, commite | 6 320 / 31 580 |
| `eclaireur` | mimo-v2.6-flash | Cherche dans le code, rend `fichier:ligne` | 30 100 / 150 400 |
| `verif` | mimo-v2.6-flash | `npm run check` + audit des versions, rend les échecs seuls | même budget |
| `relecteur` | kimi-k2.7-code | Relit le diff contre la fiche : ACCEPTÉ ou À REPRENDRE | 1 350 / 6 750 |
| `ecrivain` | claude-haiku-5-5 | Écrit les textes `relu:false` | 3 850 / 19 230 |
| `juge` | kimi-k3 | Relecture de fin de lot, rapport | 110 / 490 — une fois par lot |

Les budgets sont ceux de la page Go au 09/10/2026, calculés pour des requêtes moyennes : les
contextes de Cage Legacy sont plus gros, compte deux fois moins. Tous ces modèles sont
« entraînement : non utilisé » ; rétention 0 jour, sauf Claude Haiku (30 jours, accord en
place).

**Les modèles DeepSeek sont refusés sur ce compte** (constaté le 09/10/2026 : « This Go model
requires Global regions », un réglage de confidentialité de l'espace Go). Ils sont remplacés par
MiMo. Si Anthony active un jour les régions mondiales, revenir à DeepSeek tient en une ligne
`model:` dans `.opencode/agents/`, après avoir revérifié son accord de rétention.

Le relecteur n'est pas de la même famille que le codeur : un modèle relit mal ses propres
erreurs.

## Les commandes

| Commande | Agent | Ce qu'elle fait |
| --- | --- | --- |
| `/fiche 1 3` | architecte | Écrit et commite `docs/lots/MONDE-LOT-1-T3.md` |
| `/tranche 1 3` | codeur | Code d'après la fiche, appelle `@verif` puis `@relecteur`, commite, écrit le compte rendu |
| `/verifier` | verif | `npm run check` + `tools/verif-versions.js`, rend les échecs seuls |
| `/relire 1 3` | relecteur | Relecture seule, sans rien modifier |
| `/textes …` | ecrivain | Écrit les textes demandés |
| `/bilan 1` | juge | Écrit `docs/lots/MONDE-LOT-1-RAPPORT.md` |

## Le cycle d'une tranche

1. Session neuve, agent `architecte` : `/fiche N K`. Deux minutes de lecture de la fiche par
   Anthony, surtout « Questions pour Anthony ». Une ligne `STOP` en tête = rien ne part.
2. Session neuve (`/new`), agent `codeur` : `/tranche N K`. Il va jusqu'au commit sans
   demander la permission.
3. Lire la fin du compte rendu. Tranche suivante : retour en 1.
4. Toutes les tranches du lot commitées : session neuve, `/bilan N`.
5. Envoyer à Claude le message de fin de lot (plus bas). Claude relit, joue, ouvre la PR et
   fusionne.

**Une session par fiche et une par tranche.** C'est la plus grosse économie : une session
longue renvoie tout son historique à chaque requête.

## Les deux pistes en parallèle

Deux sessions OpenCode tournent en même temps, chacune dans son dossier :

| Piste | Dossier | Pour |
| --- | --- | --- |
| A | `C:\Users\antho\Documents\cage-legacy-corps` | Le chemin critique : lots 1, 6, 4, 5 |
| B | `C:\Users\antho\Documents\cage-legacy-arene` | Ce qui peut avancer à côté : lots 2, 3, 8, 7 |

`cage-legacy-docs` reste sur `main` : c'est là que Claude fusionne et que le jeu se lance.

**Un seul changement de format de sauvegarde à la fois.** Les lots 1 (T5), 6 (T3) et 8 (T1)
montent `MGMT_SAVE_VERSION`. Deux branches qui la montent en même temps donnent deux
versions 6 différentes. Le calendrier ci-dessous les place sur des étapes distinctes ; si une
piste en a besoin hors calendrier, elle attend la fusion de l'autre.

Pour ouvrir une branche de lot (Anthony, dans le dossier de la piste, après chaque fusion) :

```
git fetch origin
git switch -c monde-lot-1-passe origin/main
```

## Le calendrier

Les étapes s'enchaînent ; dans une étape, les pistes A et B avancent en même temps.

| Étape | Piste A | Piste B | Claude et Anthony | Pour passer à la suite |
| --- | --- | --- | --- | --- |
| 1 | Lot 1 T1 : le classement en mémoire, puis l'outil qui chronomètre | Lot 2 T1, T2, T4, T6 : identités, pays, profils, export | Claude écrit les fiches d'identité (avant la T1 de la piste B), puis les planches : présentation d'un combattant et d'un combat, dossier, Accueil, Nouvelle partie ajustée | Anthony lance la mesure sur son PC et donne le temps |
| 2 | Lot 1 T2 à T7 : le prédécesseur, les six ans, l'archive | Lot 2 T5 (écran Nouvelle partie, sur sa planche), bilan du lot 2 sans T3 | Fusion du lot 2, validation des planches | Lot 1 fusionné |
| 3 | Lot 2 T3 (la main du prédécesseur), puis lot 6 : les raisons | Lot 3 T1 à T3 : le tri des faits, les deux présentations | Fusions | Lots 3 et 6 fusionnés |
| 4 | Lot 4 : les dossiers | Lot 3 T5 et T7, puis lot 8 T1 à T3 : la marque, « depuis ta dernière visite », l'inventaire | Anthony valide l'inventaire du lot 8 | Lot 4 fusionné |
| 5 | Lot 5 : la première carte | Lot 7 : l'Accueil (T5 après la fusion du lot 5) | Partie complète jouée de bout en bout | **Démo prête** |
| 6 | Après le festival : lot 8 T4 à T8, lot 9 | Lot 3 T6 (qui avait raison) | Seuils du lot 9 (T6, T10) | — |

Si la mesure de l'étape 1 dépasse trois minutes sur le PC d'Anthony, les leviers 2 et 3 du
lot 9 T1 (booking direct des prédécesseurs, semaine ouverte une seule fois) passent dans le
lot 1, avant la T3.

Le lot 2 écrit les fiches des huit organisations dès l'étape 1 : c'est du texte, et les huit
existent déjà dans le jeu. Seule leur simulation complète attend le lot 9.

## Les points d'arrêt

| Quand | Qui | Quoi |
| --- | --- | --- |
| Lot 1 T1 | Anthony | Lance l'outil de mesure sur son PC, donne la durée des six ans |
| Étape 1 | Claude, puis Anthony | Planches des écrans neufs : rien ne se code sans planche validée |
| Lot 8 T3 | Anthony | Valide l'inventaire des événements avant la T4 |
| Lot 9 T6 et T10 | Anthony | Nombre de candidats par métier, seuils du renvoi |
| Fin de chaque lot | Claude | Relecture, jeu dans le navigateur pour les lots à écran, PR, fusion |
| Fiche ou compte rendu avec `STOP` ou question | Anthony | Répond dans la fiche, relance |
| Tranche inachevée (règle des deux heures) | Claude | Lit le compte rendu, réécrit la fiche |

## Ce que chaque lot doit surveiller

Pour l'architecte : ces pièges se reportent dans les fiches.

- **Lot 1 T1** : le classement en mémoire doit donner exactement le même classement que le
  calcul actuel. Premier test : sur plusieurs graines et quarante soirées, comparer les deux à
  chaque soirée. `mgmtDivisionRank` a une vingtaine d'appelants (`mgmt-carte.js:605`).
- **Lot 1 T2** : « porte » le joueur automatique de `tools/mesure-management.js` ; l'outil
  l'appelle ensuite au lieu de le recopier.
- **Lot 1 T3** : « le monde extérieur avance du même nombre de semaines » est une piste à
  vérifier dans le brief ; l'architecte vérifie avant d'écrire la fiche, et pose la question
  s'il y a un doute.
- **Lot 1 T7, lots 6 T3 et 8 T1** : sauvegarde. Une partie d'avant se charge et joue une soirée.
- **Lot 2 T1** : la fiche de Split reprend `docs/SPLIT-CONTEXTE-DEPART.md` sans le réécrire.
  Leïla n'existe qu'à Split ; les sept autres adjointes sont à écrire.
- **Lot 3** : les fonctions de présentation ne lisent ni le niveau caché ni les attributs du
  moteur ; un pourcentage de pronostic ne dépend que de ce que le joueur voit.
- **Lot 4** : pas un second système de booking. Les dossiers posent le combat par
  `mgmtBookMain`, comme la liste.
- **Lot 7** : l'Accueil ne crée aucune donnée ; la première arrivée se reconnaît à l'état de la
  partie, sans rien ajouter à la sauvegarde.
- **Lot 9** : le monde extérieur actuel est remplacé, pas doublé — exception écrite à la règle
  « additif par défaut ».

## Les textes

Le brief demande 250 à 300 phrases courtes, toutes `relu:false`. Deux sortes :

- **Les fiches d'identité** (lot 2 T1 : huit organisations, sept adjointes, huit prédécesseurs).
  Elles servent partout ensuite. Recommandé : Claude les écrit en une séance, l'architecte
  reçoit le fichier prêt.
- **Le reste** (raisons, faits, pronostics, événements) : des formulations à variables, écrites
  par `@ecrivain` à la demande du codeur.

Relecture par Anthony à la fin de chaque lot : `node tools/exporter-textes.js`, puis
`docs/TEXTES-A-RELIRE.md`.

## Les messages à copier

**Fin de lot, à Claude** :

```
Monde lot N terminé sur la branche monde-lot-N-… (dossier cage-legacy-…).
Rapport : docs/lots/MONDE-LOT-N-RAPPORT.md. Fais la relecture de fin de lot
(check, jeu dans le navigateur s'il y a un écran), puis PR et fusion.
```

**Tranche bloquée, à Claude** :

```
Monde lot N TK bloquée. Lis le compte rendu de docs/lots/MONDE-LOT-N-TK.md
sur la branche monde-lot-N-…, dis-moi quoi décider et réécris la fiche.
```

## Ce que coûte l'ensemble

62 tranches au total, dont 45 pour la démo (trois sont des planches, faites par Claude). Ordre de grandeur, à vérifier dans la console Go
après les premières tranches : 100 à 200 requêtes de codeur par tranche, 30 de fiche, 30 de
relecture. Le tout tient dans un mois d'offre Go si les deux pistes tournent ; le budget le plus
serré est celui du juge (Kimi K3 : 490 requêtes par mois, une quarantaine par lot). S'il
manque, `juge` passe sur `mimo-v2.6-pro`.

Économies déjà en place dans ce dépôt :

- `opencode.json` ne charge plus six documents dans chaque requête (58 Ko, environ 16 000
  jetons) ; chaque agent lit ce dont il a besoin.
- `AGENTS.md` interdit la réécriture complète d'un fichier : éditions ciblées.
- Les tests se lancent fichier par fichier pendant le travail ; la suite complète une fois, par
  `@verif`, qui ne renvoie que les échecs. Mesuré le 09/10/2026 : `npm run check` = 926 tests,
  7 min 16 s. Le lancer à chaque petit pas coûterait plus de temps que de jetons.
- Les recherches passent par `@eclaireur`, sur le modèle le moins cher.
