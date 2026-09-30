# Lot 4 T8a — carrière, accueil 01 et Panthéon 09

Livraison du 30/09/2026, branche `lot-4-t8a-accueil-pantheon`, base `77ca94b`.
Référence : décision d'Anthony du 28/09, `docs/LOT-4-LA-PEAU-DU-JEU.md`
§1, §3 T8, §4 et §4 bis ; maquettes `01-accueil.html` et `09-pantheon.html`.

## Les trois commits

1. `5114879` — la DA carrière consomme les jetons communs : Saira embarquée,
   prune, crème et jaune. Les gabarits des écrans sans maquette restent ceux
   du jeu. Check : 384 tests réussis, 4 déjà ignorés.
2. `70c8f68` — accueil 01 : les quatre entrées, la reprise management, la
   dernière soirée réelle, les constats dérivés et leur absence quand vides.
   Check : 387 tests réussis, 4 déjà ignorés.
3. Le commit de ce rapport — Panthéon et fiche de légende, captures finales,
   finitions de fidélité des interlignes et des jetons, audit élargi au Codex,
   aux succès et à la retraite. Check final : **389 réussis, 0 échec, 4 déjà
   ignorés**, soit 393 tests.

## Ce qui est porté

- Palette et polices : une source dans les jetons `--mgmt-*` d'`index.html`.
  Les couleurs translucides et les halos des nouveaux écrans se dérivent de
  ces jetons ; les fichiers CSS d'écran ne recopient pas la palette.
  Les anciens noms de familles présents dans les styles de carrière sont
  repris par la couche de compatibilité Saira. Aucun chargement Google en jeu.
- Accueil à 1920 : marges 70/90 px, grille `minmax(0,1fr) 560px`, espace
  80 px, titre 150 px, quatre tuiles en deux colonnes de 380 px, noms 34 px,
  descriptions 17 px, faits de soirée 18 px. La sauvegarde management est
  lue par sa porte de validation, sans être chargée dans `G` par le rendu.
- Panthéon à 1920 : marges 44/64/48 px, grille `minmax(0,1fr) 460px`, espace
  56 px ; mesure réelle **1276/460 px**. Titre 64 px, compteurs 38 px,
  noms de cartes 30 px, métadonnées 17 px, faits 18 px.
- Les compteurs viennent de `loadMetaStats()` : `legendPoints` et
  `careersCompleted`. Le compteur des carrières ne varie pas avec un filtre
  ni avec le plafond de conservation des archives.
- Cartes et fiche : noms, bilans, catégories, âge de retraite, finitions,
  titres, défenses et épithètes déjà générés. La fiche garde l'origine,
  la motivation existante, les ceintures, le rival, les succès et le bilan
  saison par saison. Le panneau de partage existant est commun à la liste
  et à la fiche. Favoris, suppression, filtres et Duel restent opérants.
- `esc()` sur les données rendues dans ces blocs, `escJsAttr()` sur les
  identifiants des légendes et les valeurs de filtres dans les actions.
  Des noms, surnoms, épithètes et identifiants hostiles sont testés au clic.

## Écarts déclarés aux maquettes

1. **Textes et données d'exemple absents.** Les captures de jeu n'utilisent
   aucun nom, résultat, biographie ni point de la maquette. L'accueil montre
   une soirée réelle de neuf combats ; le Panthéon montre quatre carrières
   réellement jouées sur 12 combats chacune, puis archivées.
2. **Dernière soirée :** trois résultats visibles, les autres au déroulé
   « Tous les résultats ». Les méthodes sont les familles réellement
   stockées : aucune décision n'est déclarée unanime sans cette information.
   Le lien « Voir le lendemain » est remplacé par ce déroulé : le lendemain
   actuel est une étape du calendrier, et son bouton Continuer ouvre le
   cycle suivant. Le relier comme une archive ferait avancer une seconde fois
   la partie. Aucun contrôleur ni calendrier n'a été modifié.
3. **Ce qui t'attend :** places libres et affaires ouvertes seulement.
   Pas de mois d'inactivité, de recrutement ni de date inventés. Le bloc
   disparaît s'il n'y a aucun constat ; la colonne de reprise disparaît
   sans partie management. Ces variations et les longueurs des noms réels
   déplacent légèrement les groupes centrés verticalement de l'accueil.
4. **Pied d'accueil :** accès Succès existant conservé. Pas de menus factices
   Options / Sauvegardes / Crédits : aucun écran dédié correspondant à ces
   liens de maquette n'est enregistré. La copie de sauvegarde et les crédits
   déjà présents sur les écrans de carrière ne sont pas réinventés ici.
5. **Points :** `legendPoints` existe mais aucun code ne le crédite ni ne le
   dépense ; les quatre carrières de capture montrent donc **0**. Le score
   `f.score`, utilisé par le tri existant des archives, n'est pas converti en
   monnaie et n'est pas ajouté comme note aux cartes.
6. **Colonne du Panthéon :** pas de dépenses ni de « regret de Split » sans
   système ou texte d'auteur. Les actions existantes Duel, Codex et Filtres
   occupent la colonne annexe. Les cartes gardent Favori / Partager /
   Supprimer, ce qui les rend plus hautes que les cartes sans actions de 09.
   L'accent jaune marque le favori choisi, pas une note de mérite.
7. **Dates de carrière :** aucune période calendaire n'est archivée.
   L'âge réel à la retraite remplace les années fictives. Pas de carte
   « En cours » ajoutée aux archives terminées.
8. **Contraste :** le rouge `#E5322D` reste l'accent et le rouge des aplats.
   Le texte de danger de la carrière utilise un mélange dérivé de 40 % de
   ce rouge et 60 % de crème pour atteindre 4,5:1 sur le prune. Les textes
   trop petits sont remontés à 13 px ; les opacités qui empêchaient de lire
   les métadonnées, le Codex ou les crédits sont corrigées.
9. **Écrans sans maquette dans T8a :** leurs gabarits existants restent en
   place, y compris le hub carrière en colonne de 560 px. La disposition
   de la maquette 10 relève de la tranche suivante.

## Lien mort demandé

Les deux lignes de classement appellent toujours `CL.go('opponent_card')`
dans `ui-06-career-screens.js`, actuellement lignes **1157 et 1193**
(1124 et 1160 sur cette base ; 1112/1148 dans le repère du prompt).
`opponent_card` n'est jamais enregistré dans `SCREENS`. Le routeur retombe
sur `scr_intro`. **Signalé, non corrigé.**

## Vérifications exécutées

- `npm run check`, exécuté avec `npm.cmd` sous PowerShell : lint, lint de
  contenu, 393 tests ; **389 réussis, 4 ignorés existants, aucun échec**.
  Les trois signalements non bloquants « MAIN EVENT » du lint de contenu
  existaient sur la base. Le contrôle négatif des apostrophes émet son
  exception attendue dans le harnais ; il réussit.
- `node tools/verif-t8a.js` : 12 écrans/états de carrière contrôlés dans
  Chromium, textes visibles à au moins 13 px, contraste minimal **5,09:1**.
- `node tools/verif-t8a.js accueil` : 1920, 1440, 1280 px ; contraste minimal
  **5,89:1**, aucun débordement horizontal, navigation souris/clavier,
  neuf résultats accessibles et reprise à froid après rechargement.
- `node tools/verif-t8a.js pantheon` : écran vide, quatre archives, filtres,
  fiche et partage, aux trois largeurs ; contraste minimal **5,42:1**,
  aucun débordement horizontal ni texte sortant d'une carte. Favori et
  ouverture de fiche au clavier, partage décodable, série complète de Duel
  **sans écriture dans localStorage**. Console Chromium sans erreur.
- Les fonds du contraste sont les pixels réellement rendus, capturés sans
  texte. Les familles calculées sont vérifiées : aucune ancienne police
  dans les textes audités. Les contrôles désactivés sont exclus.
- Le test de palette suit désormais le jeton du fond partagé et son alpha
  dérivé ; les valeurs de prune, crème, jaune, rouge et la position du halo
  restent strictement vérifiées. Décision citée : T8a / 28/09, source unique.
- Ordre des scripts inchangé ; versions montées pour chaque ressource
  de jeu modifiée (`lot4t8a1` puis `lot4t8a2` / `lot4t8a3`).
  Aucun fichier `engine-*`, `state/` ou `mgmt-ecran-lendemain.js` modifié.
  Aucun tirage ni règle de jeu ajouté ou modifié.

## Captures et preuves

Comparaisons relues côte à côte, **jeu à gauche, maquette à droite**, chaque
moitié en 1920×1080 :

- `t8a-accueil-comparaison-1920.png`
- `t8a-pantheon-comparaison-1920.png`

Les prises individuelles sont `t8a-accueil-jeu-1920.png`,
`t8a-accueil-maquette-1920.png`, `t8a-pantheon-jeu-1920.png` et
`t8a-pantheon-maquette-1920.png`. La fiche a sa capture
`t8a-legende-jeu-1920.png`. Les captures du jeu à 1280 et 1440 px sont
aussi présentes pour ces trois écrans, avec la largeur dans leur nom.

Les maquettes chargent les mêmes fichiers Saira locaux pour la comparaison
hors ligne ; leur HTML et leurs textes restent inchangés.
Les relevés sont `t8a-da-audit.json`, `t8a-accueil-audit.json` et
`t8a-pantheon-audit.json`. Tout se trouve dans ce dossier.
