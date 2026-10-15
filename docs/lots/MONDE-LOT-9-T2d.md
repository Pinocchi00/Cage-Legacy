# Monde lot 9 T2d — Les identifiants des organisations vivantes, et leurs comptes de soirée

## Branche
`monde-lot-9-identifiants` (tirée de `main` après la PR 180).

## Objectif
Deux défauts trouvés par le superviseur le 15/10/2026 sur une vraie partie (Split, graine 20261008, création complète avec le monde vivant) :

1. **Identifiants en collision.** Chaque sous-partie de `m.orgs` numérote ses combattants avec `mgmtNextId` (`'mg'+m.seq`, `mgmt-bureau.js:124`), comme la partie du joueur : Garden of Blood partage 254 identifiants sur 299 avec l'effectif de Split, et chaque autre organisation entre 175 et 304. Le classement mondial les écarte comme doublons (`mgmt-carte.js`, ensemble `deja`), et `mgmtExteriorCombattant`, la puissance (T3), le recrutement et les offres (T2c) confondent deux personnes. Sur cette partie, la puissance de trois organisations vaut 0.
2. **Comptes effacés.** `mgmtMondeVivantAlleger` (`mgmt-passe.js`) vide `m.comptes` ; le « stade » (T3) d'une organisation vivante retombe donc toujours sur sa plus petite salle.

## Ce qui change
- `mgmt-bureau.js` : `mgmtNextId(m)` rend `(m.idPrefixe||'mg')+m.seq`, avec `m.idPrefixe` absent dans la partie du joueur (identifiants inchangés : aucune empreinte de la partie du joueur ne doit bouger).
- `mgmt-passe.js`, `mgmtMondeVivantPas` : quand une sous-partie est rangée dans `m.orgs[id]`, ses identifiants sont renommés une fois, de façon déterministe, avec un préfixe court propre à l'organisation : `'o'+k+'mg'` où k est l'indice de l'organisation dans `MGMT_ORGANISATIONS` (`o2mg17`). Le renommage porte sur **toute** la sous-partie (effectif, combats, faits, carte, ceintures, contrats, calendrier, clés d'objets, paires « a|b ») : une fonction `mgmtMondeVivantPrefixer(sous,prefixe)` qui sérialise la sous-partie, remplace `\bmg(\d+)\b` par `prefixe+'$1'`, la relit, et pose `sous.idPrefixe=prefixe` (les identifiants créés ensuite, pendant les semaines, naissent préfixés). `validateMgmt` accepte le champ `idPrefixe` (chaîne de l'alphabet de `MGMT_ID_RE`).
- `mgmtMondeVivantAlleger` garde les **douze derniers comptes** réduits à `{salle,salleId,taux}` (le reste des comptes reste écarté) ; `mgmtOrgNiveaux` les lit déjà.
- **Sauvegarde** : `MGMT_SAVE_VERSION` passe à **21**. Migration 20 → 21 : une partie avec `mondeVivant===true` passe chaque sous-partie par `mgmtMondeVivantPrefixer` (même préfixe que ci-dessus) ; une partie sans monde vivant ne change pas. Ses comptes déjà effacés restent vides (le stade se recalera au fil des soirées) : écris-le dans le compte rendu.

## Tests (`tests/mgmtMondeVivant.test.js`, nommés `Monde lot 9 T2d — …`)
- aucun identifiant d'une organisation vivante n'est porté par un autre combattant (ni chez le joueur, ni dans une autre organisation), après la création et après une semaine de jeu ;
- le classement mondial d'une catégorie compte autant de lignes que la somme des combattants classables des huit organisations dans cette catégorie ;
- après une semaine, une organisation vivante a au moins un compte `{salle,salleId,taux}` et son stade est la capacité d'une salle remplie à 80 % ou plus, ou sa plus petite salle ;
- une partie v20 avec monde vivant se charge en v21 sans collision et se valide ; une partie v20 sans monde vivant est identique après migration (à `v` près) ;
- les empreintes de la partie du joueur (`tests/mgmtPasse.test.js`) ne bougent pas.

## Vérification
`node --test --test-name-pattern="T2d" tests/mgmtMondeVivant.test.js` (ce fichier crée des mondes : lance seulement ce motif), `node tools/verif-versions.js origin/main`. Pas de `check:rapide` (le superviseur le lance). Commit `Monde lot 9 T2d : identifiants des organisations vivantes, comptes de soirée`.

## Hors périmètre
Les écrans ; la mesure de la notoriété (signalée à part).

## AJOUT du superviseur — 15/10/2026 22 h 30 (fait partie de la tranche)
3. **L'ancien vivier lu en plus du monde vivant.** Sur la partie relevée, le classement mondial de H-light a 328 lignes : 30 de Split et 298 de `m.exterieur` (l'ancien monde calculé), **aucune** des sept organisations vivantes. `mgmtDivisionRankingCalcule` (`mgmt-carte.js`) ajoute `m.exterieur` même quand `m.mondeVivant===true`. Décision T2 : le monde vivant **remplace** l'ancien vivier. Donc, quand `m.mondeVivant===true` : la portée `world` = l'effectif du joueur + `mgmtExteriorEffectifs(m,div)` ; `m.exterieur` n'est plus lu (et `mgmtExteriorEnsure` ne le recrée plus pour une telle partie). Les parties sans monde vivant gardent exactement l'ancien calcul.
4. **Les tests doivent le prouver sur l'état réel** : pour chaque catégorie, le classement mondial contient au moins un combattant de chacune des sept organisations vivantes qui en a un non retraité dans cette catégorie, et aucun identifiant de `m.exterieur`. La puissance (T3) d'au moins cinq organisations est > 0 après la création.
