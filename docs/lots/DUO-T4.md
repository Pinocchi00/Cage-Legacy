# DUO-T4 — la super carte à l'écran : enchères, draft, soirée, bilan

Branche : `mode-duo`, après DUO-T3. Brief : `docs/BRIEF-18-10-MODE-DUO.md`. Commit : `Duo T4 : enchères, draft, soirée et bilan de la super carte`.
Mêmes règles d'écran que DUO-T3 (composants existants, pas de planche, ≥ 22 px, 1280/1440/1920 sans débordement, `esc()`
partout, CSS dans `ui-cadre.css` sous `/* ==== [ANCRE: DUO_T4_ECRANS] ==== */`, classes `mf-duo-`). Tout dans
`mgmt-duo-ecrans.js`. Version de sauvegarde inchangée.

**Règle des deux joueurs sur un écran** : chaque écran dit en haut, en grand, **à qui c'est** : `À {nom} de miser`,
`À {nom} de placer`, `À {nom} de répondre`. La couleur du joueur dont c'est le tour : J1 le rouge de la direction
visuelle, J2 le jaune, les mêmes sur tous les écrans du Duo (variables CSS existantes du cadre, aucune couleur neuve).

## 1. Les enchères — écran `mgmt_duo_encheres`

Lit `m.duo.encheres` (DUO-T2). Pour le lot courant :
- en tête : `Enchères · combattant {i+1} sur {n}` ;
- au centre, le combattant : nom en grand, catégorie (`mgmtDivisionLabel`), bilan, âge, `{rang}e mondial`, `Libre · vient de {organisation}` ;
- dessous : `Prix actuel {mgmtEuros(prix)}` et `{nom du meneur} mène`, ou `Ouverture à {mgmtEuros(ouverture)}` si personne n'a misé ;
- de chaque côté, la caisse de chaque joueur (`mgmtEuros(treasury)` de sa partie) ;
- boutons : `Miser {mgmtEuros(prochain prix)}` (jaune, Entrée ou `M`) → `CL.mgmtDuoMiser()` ; `Passer` (`P`) → `CL.mgmtDuoPasser()`.
  Refus caisse : ligne `Pas assez en caisse pour miser {prix}.` sous les boutons, rien ne change.
- un lot adjugé : bandeau `{nom} signe {combattant} pour {prix}` pendant que l'on passe au suivant (un appui sur Entrée) ;
  un lot sans mise : `Personne ne mise : {combattant} reste libre`.
- après le dernier lot : `CL.go('mgmt_duo_draft')`. Échap → QG (l'enchère reste où elle en est, elle est sauvegardée).

## 2. Le draft — écran `mgmt_duo_draft`

Trois zones de gauche à droite :
1. **La carte** (colonne étroite) : les 6 combats dans l'ordre de la soirée, `COMBAT 6` en haut (le premier joué) jusqu'à
   `COMBAT PRINCIPAL · 5 ROUNDS` en bas (`combats[5]`). Chaque case : les deux noms (ou `à placer` / `à répondre`), la
   catégorie, la couleur du joueur qui a placé.
2. **La liste du joueur dont c'est le tour** : en placement, `mgmtDuoPlacables(m,tour)` avec onglets de catégorie (← →) ;
   en réponse, `mgmtDuoDisponibles(m,tour)` **filtrés sur la catégorie** du combattant placé, sans onglets. Lignes : rang dans
   son organisation, nom, bilan, âge, forme (trois pastilles, `mgmtDuoEffectif`). ↑ ↓ et Entrée, ou clic, pour placer ou répondre
   (`CL.mgmtDuoPlacer(id)` / `CL.mgmtDuoRepondre(id)`).
3. **En face** (colonne étroite) : par catégorie, `{n} disponibles` chez l'autre joueur — pour savoir où il pourra répondre.

`Retour arrière` (touche `Backspace`, bouton `Annuler le dernier choix`) → `CL.mgmtDuoAnnuler()`.
À l'étape `pret` : la liste est remplacée par le bouton jaune `Lancer la super carte` (Entrée) → `CL.mgmtDuoJouer()`
(`mgmtDuoJouer(G.mgmt)`, puis `CL.go('mgmt_duo_soiree')`). S'il rend `null` (un combattant s'est blessé entre-temps, cas
théorique) : message `Un combat ne peut plus se jouer : annule-le et refais-le.`. Échap → QG (le draft est sauvegardé).

## 3. La soirée — écran `mgmt_duo_soiree`

Lit `m.duo.soiree.i` et la dernière carte de `m.duo.cartes` (tout est déjà joué et sauvegardé par `mgmtDuoJouer`).
État d'interface non sauvegardé : `MGMT_DUO_UI.vu` (le résultat du combat `i` est-il montré ?), remis à `false` à chaque combat.

- **Avant le combat** : `SUPER CARTE {n} · COMBAT {6-i}` (ou `COMBAT PRINCIPAL` pour `i===5`) ; les deux côtés face à face :
  organisation, nom du joueur, nom du combattant, bilan **d'avant combat** (lu sur la trace `m.hist[c.h].a` / `.b`, jamais
  sur la ligne qui a déjà bougé), catégorie ; le score de la soirée jusque-là (`{nom J1} {x} – {y} {nom J2}`).
  Boutons : `Regarder` (jaune, Entrée) et `Résultat` (`P`, comme « passer le combat » ailleurs dans le jeu).
- `Regarder` → `mgmtCombatOuvrir({trace:m.hist[c.h],etiquette:'SUPER CARTE · '+(i===5?'COMBAT PRINCIPAL':'COMBAT '+(6-i)),
  salle:{taux:1,prog:1},retour:'mgmt_duo_soiree',finRetour:()=>{MGMT_DUO_UI.vu=true;},org:'{org J1} × {org J2}',num:String(n)})`.
  **Deux paramètres facultatifs neufs dans `mgmtCombatOuvrir`** (`mgmt-combat.js`), additifs :
  `C.org=mfNet(o.org||mgmtOrgNom(m))` et `C.num=o.num||String(soir?soir.n:(m.eventsPlayed||1))`. Sans eux, rien ne change.
- **Après** (vu ou `Résultat`) : `{vainqueur} bat {perdant}` (ou `Match nul`), la méthode fine `mgmtLendemainMethode(m.hist[c.h])`
  (`mgmt-ecran-lendemain.js` : elle rejoue la trace, donc passe par `mgmtDuoRejouer`), à défaut `mgmtSuMethodeFamille` ; le score mis à jour ; bouton `Combat suivant` (Entrée) →
  `CL.mgmtDuoSuivant()` (`mgmtDuoSoireeSuivante`, `MGMT_DUO_UI.vu=false`) ; après le combat principal : `Le bilan`.
- Recharger la page au milieu : `CL.mgmtEnter` ouvre le QG, dont le bouton `Reprendre la soirée` revient au combat `i`.

## 4. Le bilan — écran `mgmt_duo_bilan`

- bandeau : `{nom} remporte la super carte {n}` (couleur du joueur) ou `Égalité` ; le score `{x} – {y}` ;
- les 6 combats en lignes (`combat`, les deux noms, vainqueur, méthode, round, `Revoir` comme l'écran `mgmt_duo_histo`) ;
- `Recrues des enchères` : les lignes de `m.duo.recrues` dont `n` est cette carte (`{nom} signe {combattant} · {prix}`), sinon rien ;
- si c'était la 4e carte de la saison : `{nom} remporte la saison {s}` (ou `Saison {s} : égalité`) avec le score de saison ;
- bouton jaune `Retour au QG` (Entrée) → `mgmtDuoTerminer(G.mgmt)`, `CL.go('mgmt_duo')`.

## Clavier (récapitulatif, `keysRegister` par écran)

Enchères : Entrée/`M` miser, `P` passer, Échap QG. Draft : ← → catégorie, ↑ ↓ ligne, Entrée choisir, `Backspace` annuler,
Échap QG. Soirée : Entrée regarder / suivant, `P` résultat. Bilan : Entrée QG.

## Textes (interface, à relire par Anthony, liste dans le compte rendu)

`Enchères`, `combattant {i} sur {n}`, `Prix actuel`, `mène`, `Ouverture à`, `Libre · vient de`, `Miser`, `Passer`,
`Pas assez en caisse pour miser`, `signe`, `pour`, `Personne ne mise`, `reste libre`, `À {nom} de miser`, `À {nom} de placer`,
`À {nom} de répondre`, `à placer`, `à répondre`, `disponibles`, `Annuler le dernier choix`, `Lancer la super carte`,
`Un combat ne peut plus se jouer : annule-le et refais-le.`, `SUPER CARTE`, `COMBAT PRINCIPAL`, `Regarder`, `Résultat`,
`bat`, `Match nul`, `Combat suivant`, `Le bilan`, `remporte la super carte`, `Égalité`, `Recrues des enchères`,
`remporte la saison`, `Retour au QG`. Tutoiement.

## Tests — dans `tests/mgmtDuoEcrans.test.js`, intitulés `Duo T4 — <point>`

(1) enchères : l'écran nomme le joueur dont c'est le tour, Entrée mise, `P` passe, le bandeau d'adjudication apparaît, la
caisse du gagnant baisse ; (2) une mise refusée affiche la ligne de caisse et ne change rien ; (3) draft : en réponse, la
liste ne montre que la catégorie du combattant placé ; `Backspace` défait ; (4) six combats → `Lancer la super carte` ;
(5) soirée : le bilan d'avant combat vient de la trace ; `P` montre le résultat sans ouvrir l'écran de combat ; `Regarder`
ouvre `mgmt_combat` avec l'étiquette `SUPER CARTE` et l'organisation `{org J1} × {org J2}` ; au retour le résultat est
montré ; (6) une partie rechargée au milieu de la soirée reprend au même combat ; (7) bilan : vainqueur, 6 lignes, retour
au QG avec l'étape `attente` et la date suivante ; (8) `mgmtCombatOuvrir` sans `org` ni `num` affiche comme avant ;
(9) un nom de joueur avec `<` et `'` reste du texte sur tous ces écrans ; (10) partie complète en jsdom : création courte,
avancer, enchères (une mise de chaque côté), draft complet, soirée en `P`, bilan, puis une deuxième super carte où le perdant
commence.

## Vérification

Tests ciblés, puis **`npm run check` complet** (dernière tranche du lot). `node tools/_bump.js` sur chaque `.js` touché,
`node tools/verif-versions.js origin/main`. Captures des quatre écrans à 1280, 1440 et 1920 px, jointes au compte rendu.

## Hors périmètre

Titre en jeu, argent de la soirée, sons nouveaux, animations nouvelles (le mouvement existant du cadre s'applique tel quel).

## Pièges

- Le résultat d'un combat ne s'affiche **jamais** avant `Regarder` fini ou `Résultat` : ni dans le score, ni dans la carte,
  ni dans un attribut HTML (un test lit le HTML de l'avant-combat et n'y trouve pas le vainqueur).
- `mgmtCombatOuvrir` rejoue via `mgmtReplayFight`, qui passe par `mgmtDuoRejouer` (DUO-T1) : n'appelle pas `simulateFight` depuis l'écran.
- La soirée ne mute rien : seuls `mgmtDuoSoireeSuivante` et `mgmtDuoTerminer` écrivent (l'index et l'étape).
