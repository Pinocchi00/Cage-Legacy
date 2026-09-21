# LOT 2B — Le vivier se renouvelle

*Contrat de lot. Écrit le 21/09/2026 par Claude, sur les décisions d'Anthony des
20 et 21/09.*

Répond à **QO-8** (`docs/QUESTIONS-OUVERTES.md`) : l'organisation s'use et rien
n'y entre. Défaut reconnu par Anthony le 21/09/2026.

**Numérotation.** « 2B » et non « 3 » : les lots 3 (l'arène), 4 (la peau du jeu)
et 5 (le monde qui parle) gardent leurs numéros et leur contenu. Ce lot s'insère
**juste après le lot 2 et avant l'arène**, parce qu'il touche l'économie que le
lot 2 T4 vient de calibrer : plus il attend, plus ce calibrage est une vérité à
durée limitée. Même précédent de nommage que les lots 3a et 3B.

**Documents qui priment**, dans cet ordre : `docs/VISION-MODE-MANAGEMENT.md`,
`docs/CHARTE-INTERFACE-MANAGEMENT.md`, puis `docs/CDC-MODE-MANAGEMENT.md` §3 (la
règle du bureau et les trois niveaux) et `docs/LOT-3B-CONTRAT.md` §C (le vivier
extérieur, textes d'auteur déjà écrits).

---

## 0. Décisions d'auteur (20 et 21/09/2026)

1. **Le déclin du vivier est un défaut**, pas une pression de jeu voulue. Une
   organisation est censée se renouveler.
2. **Les nouveaux sont régénérés**, sur le modèle des *newgens* de Football
   Manager : ils combattent en amateur et dans d'autres organisations avant que
   Split ne les voie. Ils arrivent avec un passé, jamais vierges.
3. **Le monde extérieur est dérivé, pas simulé.** Aucun second moteur ne tourne à
   côté de Split. Mais il doit être **réaliste** au sens mesurable du §4.
4. **L'histoire d'un nouveau est sa trace de carrière**, pas une biographie
   écrite : bilan amateur, organisations traversées, manière dont ses combats se
   sont finis, âge et trajectoire. **Dérivée à la lecture, jamais stockée** —
   comme le classement du lot 2 T1. **La raison de se battre reste au niveau 2**
   (`MGMT_RAISONS`, CDC §3) : la règle du bureau n'est pas touchée.
5. **Flux régulier de recrutables, mais le joueur recrute et lui seul.** Le jeu
   ne signe jamais à sa place.
6. **L'arrivée n'est pas un événement** : personne ne l'annonce, aucune réplique
   ne se déclenche. C'est **son premier combat sous Split** qui peut porter du
   récit.
7. **Les partants partent à la retraite**, simplement. Aucune autre sortie.
8. **Un seul monde extérieur.** Celui de QO-2 et QO-3 (short notice, combattant
   libre de contrat) et celui des nouveaux sont **le même** — jamais deux
   systèmes côte à côte.

---

## 1. Ce que le joueur doit pouvoir faire à la fin du lot

Voir arriver, cycle après cycle, des combattants qu'il ne connaît pas, lire d'où
ils viennent et ce qu'ils ont fait ailleurs, en recruter ceux qu'il veut — et
continuer à composer des cartes rentables à la dixième soirée comme à la
première, parce que son vivier ne fond plus.

---

## 2. Découpage en tranches

Une tranche à la fois, relue par Claude avant la suivante.

### T1 — Le monde extérieur, dérivé *(aucune interface)*

- **Un combattant extérieur ne stocke que son identité** : une graine, sa
  catégorie, son pays, sa date de naissance sportive (le cycle où il entre dans
  le monde). Tout le reste — bilan amateur, organisations traversées, fins de
  combats, âge courant — est **dérivé par fonction pure** à partir de ces
  champs et du cycle courant. Rien n'est écrit sur la ligne (règle du bureau,
  CDC §3).
- **Réutiliser `makeName()` et `correlatedRecord()`** (`engine.js`,
  `ui-01-roster-matchmaking.js`), déjà employés par `mgmtNewRoster`. Jamais un
  second générateur.
- **La trace progresse sans le moteur** : un combattant non recruté continue de
  combattre ailleurs, et son bilan avance — par abstraction, jamais par
  `simulateFight`. Reproductible : même graine, même cycle, même trace.
- **Aucun `Math.random()`**, RNG à graine uniquement.
- **Tests** : trace déterministe et identique d'un appel à l'autre ; jamais
  écrite sur la ligne ; un bilan qui ne régresse jamais ; deux combattants de
  graines différentes ne produisent pas la même trace.

### T2 — Le recrutement *(interface — vérification charte §3 obligatoire)*

- **Le flux** : à chaque cycle, un nombre borné de recrutables est visible. Ils
  ne rejoignent Split que par le geste du joueur.
- **Ce que l'écran montre** : nom, catégorie, âge, bilan, et la trace de
  carrière du §T1 — d'où il vient et ce qu'il a fait. **Aucune note, aucune
  recommandation, aucun pronostic, aucune jauge** (vision, addendum 2 §6).
- **Le geste de recrutement**, souris d'abord, clavier en accélérateur
  (`ui-11-keys.js`), `esc()` sur tout nom affiché.
- **Le recruté entre au niveau 1**, comme n'importe quelle ligne : sa raison de
  se battre ne s'attribue qu'au niveau 2, quand le joueur s'y intéresse.
- **Mise en page** : 1440px, lisible dès 1280 — charte §L1.
- **Livrable de vérification** : la capture ou le relevé DOM exigé par la
  charte §3.

### T3 — Les départs *(après T2)*

- **La retraite**, seule sortie ordinaire. Elle retire le combattant du vivier
  et des classements, sans drame et sans réplique (décision 6).
- **Sauvegarde** : évolution du format par la migration du circuit management
  (`mgmtMigrate`) et sa validation (`validateMgmt`, `mgmtRepair`). Jamais de
  plantage au chargement, jamais de contamination avec la carrière.
- **Tests** : un retraité sort du vivier et du classement ; la migration charge
  une sauvegarde d'avant le lot sans perte.

### T4 — L'économie sur la durée de vie *(après T3 — condition de fusion)*

- `tools/monte-carlo-economie.js` mesure désormais des organisations **qui se
  renouvellent**, sur `--soirees=K` avec K assez grand pour voir la dixième
  soirée.
- **La cible de QO-8** : le joueur d'écran reste dans la bande 70 à 80 % de
  soirées rentables **sur la durée de vie de l'organisation**, et non plus
  seulement à la première soirée. Les constantes d'économie sont recalibrées si
  besoin — **jamais les cibles**, qui sont des décisions d'auteur.
- **Test** : sur une graine fixe, la rentabilité ne s'effondre plus avec l'âge de
  l'organisation.
- Rapport de calibrage dans `tools/reports/`, format du lot 2 T4.

---

## 3. Ce que « réaliste » veut dire, et comment on le mesure

Le monde dérivé doit être **indiscernable d'un monde simulé sur les statistiques
observables**. Deux cibles, vérifiables par Monte Carlo avec l'outillage existant :

1. **Le bilan prédit le résultat.** Un combattant donné pour 18-4 se comporte
   comme un 18-4 quand `simulateFight` le fait combattre : la corrélation entre
   le bilan dérivé et le taux de victoire observé doit être du même ordre que
   celle mesurée sur le roster actuel, généré par `correlatedRecord`.
2. **Les fins de combats collent.** La répartition KO / soumission / décision de
   la trace dérivée suit celle que le moteur produit réellement — référence :
   `tools/reports/LOT-3A-CALIBRAGE-SOIREE.md`.

Un écart mesuré est un défaut de la tranche, pas une tolérance.

---

## 4. Interdits, toutes tranches

- **Aucune modification du moteur** : `engine-*.js`, `ui-*.js` (sauf
  `ui-11-keys.js` si l'enregistrement d'une touche l'exige), `state/*.js`,
  `index.html`. `git diff <base> -- engine-*.js state/` doit rester vide.
- **Jamais un second système** à côté d'un système existant : un seul monde
  extérieur (décision 8), un seul générateur de noms, un seul générateur de
  bilans.
- **Aucune réplique, aucun nom, aucune motivation de personnage.** Un texte
  manquant reste `[EMPLACEMENT AUTEUR]` et se signale. Les raisons de se battre
  existantes ne se réécrivent pas.
- **Aucune note, aucun barème, aucune jauge à l'écran.**
- **Aucun `Math.random()`**, aucun `import`/`export`, `"use strict";` en tête.
- **Aucun test réécrit pour retrouver du vert** sans citer la décision qui change
  le comportement attendu.
- **Aucune fusion dans `main`** avant la fin de T4.

---

## 5. Ce qui n'est pas tranché, et qu'Anthony doit décider avant la T2

Aucune de ces questions n'est comblée par une supposition.

1. **Le recrutement coûte-t-il de l'argent ?** L'économie existe depuis le lot 3B
   T1 (trésorerie, plafond de découvert). Signer pourrait coûter — ou ne rien
   coûter et n'engager que des cachets futurs. Cela change le poids du geste.
2. **Combien de recrutables par cycle ?** « Flux régulier » fixe l'intention, pas
   le nombre. Trois par cycle et dix par cycle ne font pas le même jeu.
3. **À quelles conditions un combattant prend-il sa retraite ?** L'âge seul ? Le
   corps (traumatisme du lot 3a) ? Une série de défaites ? Le joueur l'apprend-il,
   et comment — sachant que QO-10 dit que l'interface explique, pas une voix ?
4. **Où recrute-t-on ?** Un écran neuf, ou une colonne de l'écran de la carte ?
5. **Le récit du premier combat** (décision 6) : sous quelle forme ? Un marqueur
   d'interface, ou un texte que tu écriras ? QO-10 penche pour l'interface, mais
   c'est le seul endroit du lot où une voix aurait du sens.

---

## 6. Terminé pour le lot

1. Des combattants inconnus arrivent régulièrement, avec une trace de carrière
   complète et cohérente, et le joueur en recrute qui il veut.
2. Les partants prennent leur retraite ; le vivier ne fond plus.
3. Le monde dérivé tient les deux cibles de réalisme du §3.
4. `npm run check` vert, aucun test existant assoupli sans décision citée.
5. La vérification d'interface de la charte §3 est livrée pour T2.
6. L'économie reste dans la bande 70 à 80 % **sur la durée de vie** de
   l'organisation — la réponse mesurée à QO-8.
