# Monde lot 2 T7 — L'écran de création et l'écran d'arrivée

## Branche
`monde-lot-2-identites`. Fiche écrite par Claude le 12/10/2026 après le retour d'Anthony sur le jeu réel
(« la barre est affreuse, vide : il faudrait de la lecture, une barre fluide, du mouvement, une explication,
et un bouton pour avancer une fois le chargement fini. L'écran « Votre arrivée » a les mêmes problèmes »).
Décisions de Claude : tout ce qui suit. Rien n'est à demander à Anthony avant le code.

> **Périmètre réduit le 12/10 (le codeur échouait sur la fiche entière) : T7 = SEULEMENT l'écran de création (§2). L'écran d'arrivée est la tranche T9 (`MONDE-LOT-2-T9.md`).**

## 1. Objectif
Les ~10 à 50 secondes de création des six ans deviennent un écran qu'on lit et qui explique le jeu.
Le joueur ne fait jamais le « Entrée » à l'aveugle : il avance quand il le décide.

## 2. L'écran de création (`mgmtNouvelleGenHtml`, `mgmt-nouvelle.js`)
Même cadre (`mfEcran`, plaque Management, libellé « Nouvelle partie »), contenu en deux colonnes sur 1440 px minimum,
**aucun texte sous 22 px**, rien qui déborde, rien qui se superpose.

**Colonne gauche — « Ce qui se passe »** (largeur ~40 %)
- Titre : le nom de l'organisation en grand (`{org}`), et dessous, sur une ligne : « Six années à vivre avant ton arrivée ».
- Une frise de six années (2021 → 2026) : l'année en cours est marquée, les passées sont cochées.
- Quatre compteurs qui montent pendant la génération, lus dans `g.m` à chaque pas (fonctions existantes, rien de neuf à calculer) :
  « soirées jouées » (`g.k`), « combats » (`g.m.hist.length`), « champions couronnés » (nombre de faits `title_fight` ou équivalent déjà lu par `mgmtCeintureLignee`),
  « retraites » (faits `retired`). Si un compteur n'est pas lisible à coût nul, ne l'affiche pas : jamais de chiffre inventé.
- La barre : **fluide**. Sa largeur est interpolée à chaque image (`requestAnimationFrame`) vers le pourcentage réel, avec un
  amortissement (rattrape 20 % de l'écart par image), jamais en escalier ; une légère lueur qui se déplace sur la partie pleine
  (CSS seul, `prefers-reduced-motion` : désactivée). Libellé sous la barre : « Année 2023 — soirée 31 sur 62 ».

**Colonne droite — « Pendant que ça charge, ce qu'il faut savoir »** (largeur ~60 %)
- Un seul carton lisible à la fois, qui change toutes les 7 secondes (fondu CSS de 300 ms ; pas de `setTimeout` caché dans
  le rendu : un seul minuteur d'écran posé et nettoyé comme celui du lot 4 de la démo, nettoyé quand l'écran change).
  Pastilles 1/5 à 5/5 sous le carton ; le joueur peut passer au suivant avec → et revenir avec ← (clavier) ou en cliquant une pastille.
- Chaque carton : un titre court (≥ 28 px), deux à trois phrases (≥ 22 px).
- Les cinq cartons (propositions de Claude, `relu:false`, `const MGMT_NOUVELLE_LECTURES`, dans `mgmt-nouvelle.js`) :
  1. **Tu es le matchmaker.** « Tu ne diriges pas l'organisation : tu composes ses soirées. Tu choisis qui combat qui, et tu en réponds devant tout le monde. »
  2. **Leïla t'aide.** « Ton assistante te propose des combats et dit pourquoi. Tu acceptes, tu refuses, ou tu choisis toi-même dans la liste complète. »
  3. **Rien n'est inventé.** « Ces six années sont jouées par le même moteur que tes soirées. Les champions, les rivalités, les blessés : tout ce que tu vas lire a eu lieu. »
  4. **Les marques te guident.** « Un point à côté d'un nom dit qu'il lui est arrivé quelque chose depuis ta dernière visite. Ouvre sa fiche : la marque s'éteint. »
  5. **Une soirée toutes les cinq semaines.** « Une carte principale de cinq combats, quatre préliminaires. Quand la carte est complète, tu poses la soirée et tu la lances. »

**Fin du chargement**
- La génération s'arrête sur l'écran (la partie est prête mais **`CL.mgmtEnter` n'est PAS appelé tout seul**).
- La barre est pleine, le libellé devient « Prêt. Six ans d'histoire sont écrits. », la colonne gauche garde ses compteurs finaux.
- Un bouton jaune apparaît, en bas à droite, avec la touche : **« Entrée — Entrer dans {org} »**. Entrée et clic font ce que fait
  aujourd'hui la fin du pas (`CL.mgmtEnter(slot,undefined,{partie:m})`). Échap pendant le chargement : retour au choix des
  organisations et abandon propre (`MGMT_NOUVELLE.gen=null; G.mgmt=null`), comme aujourd'hui sur erreur.
- `keysRegister('mgmt_nouvelle')` : Entrée ne relance plus rien pendant `gen` ; elle valide seulement quand `gen.pret`.

## 4. Fichiers
`mgmt-nouvelle.js` (écran, lectures, minuteur, fin sur bouton), `ui-cadre.css` (classes `mf-genese-*`, `mf-lecture-*`, `mf-arrivee-*`),
`mgmt-prise-en-main.js` ou le fichier trouvé (arrivée), `tests/mgmtNouvelleChargement.test.js` (à ajouter à `package.json`, `test` et `test:watch`).
Monter les `?v=` (`node tools/_bump.js`), `SW_VERSION`.

## 5. Tests
1. `Chargement — la partie attend le bouton : après le dernier pas, G.mgmt reste null et gen.pret vaut true ; Entrée ouvre la partie ; Échap pendant gen abandonne proprement.`
2. `Chargement — les cinq lectures s'affichent une à une, → et ← les parcourent, le minuteur est nettoyé quand l'écran change` (aucun minuteur vivant après `CL.mgmtNouvelleRetour()`).
3. `Chargement — aucun texte sous 22 px dans l'écran de création` (comme `tests/mgmtCadre.test.js`).
4. `Chargement — la largeur de la barre est monotone et finit à 100 %` (suite de pas simulés).
6. Tous les tests existants de création restent verts : ceux qui créent des parties passent par `mgmtNouvelleCreer` (sans passé) et ne sont pas touchés.

## 6. Hors périmètre
L'Accueil du lot 7, la présentation du lot 3, la carte déjà commencée du lot 5, la refonte de Résultats (T8).
Aucune donnée écrite dans la sauvegarde. Aucune règle de simulation touchée.
