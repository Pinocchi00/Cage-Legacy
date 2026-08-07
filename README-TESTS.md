# Suite de tests — Cage Legacy

## Ce que c'est

Une suite de tests qui exécute le **vrai code du jeu** (`engine.js`, `ui.js`,
`state.js`, `data-*.js`, `main.js`) dans un navigateur virtuel (jsdom), pour
détecter automatiquement :

- les erreurs JavaScript qui ne surviennent que dans des situations précises
  (ex. une carrière assez longue, un joueur invaincu qui monte vite au
  classement) — le genre de bug qu'on ne trouve pas en jouant à la main ;
- les incohérences d'état (deux combattants classés #1 en même temps, un
  contrat qui survit à une rétrogradation, etc.).

Chaque test simule des actions de joueur (créer un combattant, enchaîner des
combats, exporter une légende...) et vérifie que le résultat est cohérent.

## Installation (une seule fois)

Il faut [Node.js](https://nodejs.org) installé (version 18 ou plus récente).
Dans un terminal, à la racine du projet :

```bash
npm install
```

Ça installe `jsdom`, la seule dépendance nécessaire (le navigateur virtuel).

## Lancer les tests

```bash
npm test
```

Tu dois voir quelque chose comme :

```
ok 1 - une carrière complète (amateur -> pro -> retraite) ne produit jamais d'erreur JS
ok 2 - une carrière amateur ne s'arrête jamais prématurément sans raison légitime
...
# tests 13
# pass 13
# fail 0
```

**`# fail 0`** = tout va bien, aucune régression détectée.
**`not ok`** sur une ligne = un test a échoué ; le message juste en dessous
explique quoi et où (fichier + numéro de ligne).

## Quand les lancer

- **Avant chaque mise en ligne**, systématiquement. Deux minutes qui peuvent
  éviter de publier une régression.
- **Après chaque session de correction de bug**, pour vérifier qu'un
  correctif n'en a pas cassé un autre ailleurs.
- Idéalement, en les demandant à Claude explicitement à la fin d'une session
  de modifications : "lance la suite de tests avant de me livrer les
  fichiers".

## Organisation des fichiers

```
tests/
  helpers/
    loadGame.js       <- charge le jeu dans un navigateur virtuel
    playthrough.js     <- un "joueur automatique" qui clique à travers les écrans
  career.test.js        <- simulations de carrière complètes
  hallOfFame.test.js     <- Panthéon (suppression, favoris, export)
  champChamp.test.js     <- supercombat double champion
  ranking.test.js        <- classement (rang #1, pénalités du champion)
```

Chaque fichier `*.test.js` couvre un thème. `helpers/` contient le code
partagé — tu n'as normalement jamais besoin d'y toucher.

## Ajouter un nouveau test

Le meilleur moment pour écrire un test : juste après avoir corrigé un bug.
Le test capture ce bug pour de bon — s'il revient un jour (une future
modification qui recasse la même chose sans le savoir), le test le signale
immédiatement au lieu d'attendre qu'un joueur le remarque.

Modèle minimal (à adapter, dans n'importe quel fichier `*.test.js` existant
ou un nouveau) :

```js
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { newGameWindow } = require('./helpers/loadGame');

test('description claire de ce qui est vérifié', () => {
  const win = newGameWindow();
  // ... mettre le jeu dans la situation à tester (win.G, win.CL, etc.) ...
  assert.equal(resultatObtenu, resultatAttendu, 'message si ça échoue');
});
```

Si tu ne sais pas comment traduire un bug en test, demande à Claude — c'est
un aller-retour rapide une fois que la suite existe.

## Limite connue

Ces tests jouent le jeu "bêtement" (toujours le premier choix disponible) —
ils ne vérifient pas l'équilibrage ou le plaisir de jeu, seulement l'absence
d'erreur et la cohérence des données. C'est volontaire : c'est exactement le
type de vérification qu'un humain ne peut pas faire à la main sur des
centaines de parties, et qui complète (sans le remplacer) le test manuel en
jouant.
