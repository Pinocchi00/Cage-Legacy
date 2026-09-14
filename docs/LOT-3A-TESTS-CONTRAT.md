# LOT 3A-TESTS — Tests de cycle périmés dans mgmtBureau.test.js

**Date :** 14/09/2026 (v2 — corrigée après relecture de `docs/LOT-3A-LE-CORPS-ET-LA-SOIREE.md`)
**Périmètre :** `tests/mgmtBureau.test.js` uniquement
**Base :** branche `lot-3a-corps-soiree`
**Document d'autorité :** `docs/LOT-3A-LE-CORPS-ET-LA-SOIREE.md` §5 et §11

---

## 1. Contexte

Deux tests de `tests/mgmtBureau.test.js` datent du lot 1g et appliquent l'ancienne règle
« pile vide = cycle suivant ». Le code suit désormais le §5 du lot 3a.

**Les tests sont périmés, le code est correct.** Ce lot corrige les tests, pas le jeu.

- `tests/mgmtBureau.test.js:680` — attend qu'une pile vidée ouvre le cycle suivant
  immédiatement. Règle 3a §5 : pile vidée + carte complète → la carte est verrouillée, puis
  la soirée se joue ; le cycle n'avance qu'après « Continuer » soirée puis lendemain.
- `tests/mgmtBureau.test.js:689` — attend que « Cycle suivant » fasse +1. Règle 3a §5 : carte
  incomplète → le cycle ne se ferme pas, Leïla repropose un bloc en tête de pile.

---

## 2. ÉTAPE 0 — vérification préalable, avant toute modification

Le §11 du lot 3a prévoit déjà, dans `tests/mgmtSoiree.test.js`, un test « carte incomplète
quand la pile est vide : le cycle ne se ferme pas, et une nouvelle proposition de Leïla arrive
en tête de pile ».

**Vérifie d'abord si ce test existe et s'il passe.**

- S'il existe et couvre la règle 3a §5 : les deux tests de `mgmtBureau.test.js` sont des
  **doublons périmés**. Propose leur suppression, avec la preuve que la couverture est
  conservée par `mgmtSoiree.test.js`. Ne supprime rien avant validation d'Anthony : écris la
  recommandation dans le rapport et arrête-toi.
- S'il n'existe pas ou ne couvre pas la règle : passe au §4.

---

## 3. Règle absolue

**Interdiction d'assouplir, de supprimer ou de contourner une assertion pour faire passer un
test.** Un test se réécrit sur la nouvelle règle, jamais sur le comportement observé.

---

## 4. Périmètre autorisé

| Autorisé | Interdit |
|---|---|
| `tests/mgmtBureau.test.js` | Tout fichier du jeu |
| `docs/QUESTIONS-OUVERTES.md` (création / ajout) | `tests/mgmtSoiree.test.js` |
| `docs/lots/LOT-3A-RAPPORT-TESTS.md` (création) | Toute implémentation de fonctionnalité |

---

## 5. Tests attendus

Tous fondés sur le §5 et le §11 du lot 3a, et sur rien d'autre.

**Test 1 — pile vidée avec carte complète.** La carte est verrouillée, la soirée s'ouvre.
Le cycle vaut encore 1 à ce moment. Après « Continuer » soirée puis lendemain, le cycle vaut 2.

**Test 2 — carte incomplète, pile vide.** Le cycle ne se ferme pas, et une nouvelle
proposition en bloc de Leïla arrive en tête de pile.

**Test 3 — carte complète.** « Cycle suivant » fait bien avancer le cycle.

**Test 4 — proposition non ignorable.** Tant que la carte est incomplète, la proposition en
bloc ne peut pas être ignorée : seuls restent valider, échanger ou écraser (§5).

**Test 5 — aucun remplissage d'office.** Aucun combat n'est jamais ajouté à la carte sans une
action du joueur (valider ou échanger). Si Leïla ne trouve plus assez de paires, rien n'est
rempli d'office (§5).

---

## 6. Hors périmètre explicite

Ne teste ni n'implémente : remplaçant à court préavis, combat des préliminaires remonté,
découvert, plafond de découvert, soirée en carte réduite. Le §2 du lot 3a réserve les imprévus
du dernier mois à un lot dédié. Toute question sur ces sujets va dans `docs/QUESTIONS-OUVERTES.md`
et nulle part ailleurs.

---

## 7. Preuve que les tests mordent

Pour chacun des cinq tests : casse volontairement la règle correspondante dans le code du jeu,
montre que le test échoue, puis remets le code exact d'origine.

**Un test qui n'échoue jamais ne prouve rien.**

Vérifie avec `git diff` qu'aucun fichier du jeu n'a été laissé modifié à la fin.

---

## 8. Textes

N'écris aucune réplique de personnage. Convention d'emplacement du projet (lot 3a §7) :

```
[RÉPLIQUE MANQUANTE — Nom du personnage : contexte]
```

---

## 9. Livrables

Lance `npm run check`.

Écris dans `docs/lots/LOT-3A-RAPPORT-TESTS.md` :

- le commit de départ ;
- le résultat de l'étape 0 (doublon ou non, avec preuve) ;
- les tests réécrits et ajoutés, avec leur numéro de ligne ;
- le résultat de chaque preuve par cassure volontaire ;
- le résultat de `npm run check` avant et après ;
- la liste des questions ouvertes inscrites.

---

## 10. Décision de référence

> **3A-§5** — La pile vide n'avance plus le cycle. Carte complète → verrouillage puis soirée
> puis lendemain, et seulement ensuite le cycle suivant. Carte incomplète → le cycle ne se
> ferme pas, Leïla repropose en bloc, proposition non ignorable, aucun remplissage d'office.
> Remplace la règle 1G. Tests corrigés le 14/09/2026.
