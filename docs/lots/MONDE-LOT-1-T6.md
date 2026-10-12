# Monde lot 1 T6 — ce que le passé allume ; T7 — les parties existantes

**Date :** 12/10/2026 · **Branche :** `monde-lot-1-passe` · **Autorité :** brief §Lot 1 T6 et T7 ; consigne du superviseur. Aucune planche : chaque écran garde sa grammaire.

## 1. Ce qui existait déjà (T5)

Les 558 combats du passé vivent dans `m.hist` (`p:true`), les faits gardés dans `m.facts` : Résultats, Ceintures, la fiche, les classements et les rivalités les lisent sans rien changer. T6 corrige ce qui, en les lisant, se trompait ou se taisait.

## 2. Ce qui change

- **Dates.** `mgmtSoireeJour` retrouve le jour d'une soirée du passé hors des 24 de l'agenda (`mgmtAgendaJour`, rythme de 35 jours) ; `mgmtJourDateTexte(jour)` ajoute l'année quand le jour précède l'ouverture (2021 à 2026). Résultats : « Fight Night 12 · 7 MARS 2024 ». La fiche (`mgmtSoireeNomDate`) en fait autant.
- **Résultats** : les 62 soirées se parcourent (cinq pastilles à la fois, déjà paginées) ; le bouton et la touche « Revoir ce combat » n'existent que pour un combat joué sous le joueur.
- **Ceintures** : la lignée (`mgmtCeintureLignee`, inchangée) montre ses règnes datés (« Soirées 12 à 15 · 2023-2024 ») ; au-delà de cinq, « Les 5 derniers sur N. ».
- **Fiche, onglet Combats** : chaque ligne d'un combat du passé ouvre la fiche de l'adversaire (retraités compris) — `mgmtHistoriqueRevoir`, `retour` conservé ; la touche Entrée dit « Ouvrir son adversaire ». La part d'avant reste celle de `mgmtAncienAdversaire`.
- **Rôles** (`mgmt-attention.js`, bloc `MONDE_LOT1_T6_ROLES`, seulement autour de `mgmtRole`) :
  - *Ancien champion* : un règne de la lignée d'une ceinture de Split, et ne la porte plus (priorité : après Champion et En perdition, avant Contender).
  - *Remplaçant de luxe* : au moins deux faits `engage` (court préavis).
  - *Bête noire* : a battu au moins deux adversaires distincts aujourd'hui mieux classés que lui (classement de l'organisation).
  - *Revenant* : dernier combat dans les trois derniers cycles, le précédent au moins 11 cycles avant (plus d'un an).
  - *Gatekeeper* : plus de 30 ans, a battu et perdu contre des adversaires aujourd'hui dans les 15 premiers de l'organisation.
  Les quatre derniers passent après Contender, dans cet ordre, avant Invaincu. Mémoire en clé (combats, faits, cycle, effectif) : une passe sur `m.hist` pour tout le vestiaire.
- **Rivalités** : `mgmtAffrontements` lit déjà tous les combats ; la fenêtre de 12 cycles laisse au premier jour 2 rivalités actives sur Split (une rivalité, une trilogie) : ni muet, ni cinquante.

## 3. Résultats mesurés (Split, graine 20261008, premier jour)

Rôles : ancien champion 19, gatekeeper 13, bête noire 5, revenant 3, **remplaçant de luxe 0** (le prédécesseur n'engage personne à court préavis : rien n'est fabriqué, le rôle s'allume en jeu — testé en posant deux faits). Règnes par ceinture : de 2 (F-bantam) à 9 (H-welter), 90 défenses en tout. Rivalités actives : 2.

## 4. T7 — les parties existantes

`tests/fixtures/mgmt-sauvegarde-14.json` : une vraie sauvegarde 14 fabriquée le 12/10/2026 par le code de `main` (c36784a), avant le lot (Split, graine 20261012, trois soirées, titres en jeu). Elle se charge sans rien perdre (seule la version change), se valide, s'écrit telle quelle (aucune archive), se reprend par l'emplacement sans l'écran d'arrivée, joue une soirée, et ses combats se revoient. Résultats, Ceintures, fiche et rôles se rendent sans erreur. `mgmtSoireesJoueur` y vaut `eventsPlayed`.

## 5. Tests

`tests/mgmtPasseT6.test.js` (LENTS, six ans) : ceintures, Résultats (62 soirées), combats retrouvables et fiche, rôles, rivalités. `tests/mgmtSauvegarde14.test.js` : T7. `tests/mgmtArchive.test.js` : le test du bouton de la fiche suit le nouveau comportement (la ligne ouvre l'adversaire, décision de cette fiche §2).

## 6. Pour le lot 2 T3 (la main du prédécesseur)

Les réglages à brancher sont ceux de `mgmtPredecesseurSoiree(m,k,reglages)` (`mgmt-predecesseur.js`) : `titreCadence`, `renouvelle` (re-signer les sans-contrat), `recrues` `{depuis, pas, parSoiree, ageMax, fin, finAgeMax, plan}`. `mgmtPasseSoiree` (`mgmt-passe.js`) les construit à chaque soirée à partir de `MGMT_PASSE_FENETRE_RECRUES`, `_PAS`, `_PAR_SOIREE`, `_AGE_MAX`, `_FIN`, `_FIN_AGE_MAX` ; une organisation aura son jeu de valeurs (par exemple `jeunes` = plus de recrues et une fenêtre plus longue pour Ultimate Rim). Le plan par catégorie vient de `mgmtNewRoster(m,{plan})`. Les bornes élargies de `mgmtPasseSixAns.test.js` (combats des moins de 25 ans, vivants et âge de Rim) sont à resserrer alors.
