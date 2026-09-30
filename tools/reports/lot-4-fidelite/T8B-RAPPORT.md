# Lot 4 T8b — le hub carrière porte la maquette 10

Livraison du 30/09/2026, worktree `cage-legacy-arene`, branche
`lot-4-t8b-carriere`, créée depuis `origin/main` à `d3cb671`.
Reprise avant commit sur `de7db10` : moral et forme conservés en texte,
vidéo locale uniquement, capture de carrière neuve ajoutée aux preuves.
Contrat : `docs/LOT-4-LA-PEAU-DU-JEU.md` §1, T8 et §4 bis.

## Portage

- `ui-06-career-screens.js` rend le hub dans les trois colonnes de 10.
  `ui-carriere.css` consomme uniquement les couleurs et polices des jetons
  communs T8a ; Saira reste chargée localement, sans réseau.
- À 1920×1080 : padding **40px 64px 48px**, grille
  **560px / minmax(0,1fr) / 420px**, écart **52px**, titre **76px**,
  paragraphes **18–20px**, historique **90px / minmax(0,1fr)**.
  Mesure réelle des trois colonnes : **560 / 708 / 420px**.
- Le halo vient de 10 : ellipse 800×600 à 25% / 5%, jaune à 18%, puis le
  dégradé prune partagé. Les titres, le panneau découpé du prochain combat,
  l'octogone et l'action inclinée suivent la maquette.
- Un bloc sans données disparaît, et sa colonne se referme. « Ton état »
  reste toujours présent : le moral et la forme existent dès la création.
  À 1280 et 1440,
  les trois colonnes deviennent proportionnelles ; le titre reste à 76px
  et peut revenir à la ligne. Aucun texte de décision n'est réduit.
- Les six accès existants du Dossier sont conservés dans un déroulé natif,
  accessible à la souris et au clavier. L'historique apparaît une seule fois,
  ses cinq dernières lignes en ordre inverse, avec accès aux archives.
- Moral et forme sont conservés dans « Ton état », en texte sans barre :
  `Moral N/20 · Forme N/20`, avec `d20(f.morale)` et `d20(f.form)`.
  Tous les champs rendus
  dans les nouveaux blocs passent par `esc()` ; les identifiants de clic
  passent aussi par `escJsAttr()`.

## Sources et différences nécessaires avec l'exemple de 10

1. **Ton combattant** : nom, surnom, catégorie carrière, âge, W/L/D,
   amateur/pro, rang, champion, combats restants au contrat, bilan amateur
   et gains de carrière existants. Le nom réel est ajouté sous le titre.
2. **Ce que tu es devenu** : discipline actuelle, méthodes de victoire
   cumulées, série existante et mouvement signature acquis s'il existe.
   Aucun récit de progression ni jugement technique n'est inventé.
3. **Le camp de cette semaine** : uniquement les choix réels de `G.train`
   d'une préparation en cours ; clic vers `CL.train(i)` et accès à l'écran
   de camp existant pour ses détails. Aucun choix arbitrairement surligné,
   aucun coach ni consigne d'auteur absents des données. Le titre est le
   libellé demandé, pas une horloge hebdomadaire ajoutée au moteur.
4. **Ton prochain combat** : uniquement l'adversaire d'un camp ou d'un plan
   réellement ouvert/repris. Les trois offres du matchmaking ne deviennent
   jamais des combats signés au rendu. Le bouton principal mène au camp ou
   au plan en cours ; hors préparation, il ouvre le matchmaking existant.
5. **Ta carrière** : `f.history`. Résultat, adversaire, surnom, drapeau,
   méthode, round/temps de finition et rang archivés. Aucun geste de finition
   non archivé n'est reconstruit. Une ancienne méthode « Décision » reste
   « Décision » : l'ancien helper fabriquait une unanimité sans preuve.
6. **Ton état** : moral et forme toujours présents, puis blessure/convalescence
   existantes ou poids/limite de la pesée déjà calculée du plan.
   Aucun état caché du corps, poids de camp ni
   délai fictif de cinq semaines. La récupération garde son action existante.
7. **Ce qu'on dit de toi** : absent, car aucun flux de presse carrière ne
   fournit ce contenu. **Ton agent** : absent conformément à la demande.
8. L'en-tête montre l'organisation et l'année existantes, jamais une semaine
   inventée. Aucun nom ni phrase d'exemple de la maquette n'entre dans le jeu.

### Préparation sans nouveau système

`G.sel`, `G.train` et `G.fight` peuvent survivre au combat terminé ou annulé.
Leur présence ne suffit donc pas à annoncer un prochain combat.
Une trace de navigation, hors de `G` et hors sauvegarde, retient uniquement
l'ouverture réelle de `camp` ou `plan`. À la reprise, `CL.cont()` lit la
destination déjà validée de la sauvegarde avant de revenir au hub.
La trace se ferme à la résolution, aux événements, au matchmaking, à la
blessure et aux changements de carrière ; la consultation du Dossier ou de
l'adversaire la conserve. Aucun tirage ni donnée dérivée persistée.

## Les deux liens `opponent_card`

- La route est désormais enregistrée dans `SCREENS`, avec
  `scr_opponent_card()` dans `ui-06-career-screens.js`.
- Les deux classements, division et P4P, appellent
  `CL.viewCareerOpponent(id, 'rankings')`. Les lignes ont un focus et
  répondent à Entrée/Espace. La fiche revient aux classements en conservant
  l'onglet, même après un nouveau rendu.
- « Étudier ses combats » ouvre la même fiche et revient au hub.
- La fiche lit l'identité, le bilan, le style, les mensurations et les
  combats réellement présents dans l'historique du combattant. Un PNJ
  sans historique ne reçoit aucun combat fabriqué ; ce bloc disparaît.
- La consultation ne remplace jamais le joueur dans `G.f`.

## Vérifications exécutées

- **`npm run check`**, exécuté via `npm.cmd run check` sous PowerShell :
  lint et lint de contenu verts ; **407 tests, 403 réussis, 0 échec,
  4 ignorés existants**. Les trois signalements non bloquants « MAIN EVENT »
  et l'exception du contrôle négatif des apostrophes existaient déjà.
- Les tests T8b vérifient l'absence des blocs vides, les offres non signées,
  la préparation reprise, son invalidation après blessure/résolution, les
  deux routes et leurs retours, l'échappement des données hostiles et la
  lecture sans tirage ni mutation du combattant.
- Le test de reprise vérifie sur une carrière neuve les deux valeurs d20
  en texte, leur actualisation et l'absence de barres.
- Les assertions adaptées portent leur décision : §1/§4 bis impose l'absence
  du bloc d'historique vide et la nouvelle grille ; une décision ancienne ne
  prouve pas l'unanimité. Le pilote automatique exclut le nouveau retour
  octogonal, comme il excluait déjà la fermeture ✕. Les assertions de
  progression et de carrière complète restent actives.
- **`node tools/verif-t8b.js`** : navigateur Chromium réel, offline,
  carrière neuve puis huit combats effectivement joués par les actions du
  jeu. Rechargement complet de la page pour les reprises de camp et de plan.
  La graine est fixée à la création et au point de contrôle après reprise
  pour rendre l'outillage reproductible ; aucune donnée de maquette injectée.
- Relevé du hub : contraste minimal **5,86:1** à 1920, **5,88:1** à 1280,
  **5,97:1** à 1440 ; textes visibles à au moins **18px**, Saira/Saira
  Condensed, aucun débordement horizontal ni texte tronqué.
- Souris : création, choix du combat/camp, reprise, étude, Dossier et les
  deux classements. Clavier : déroulé, les deux fiches de classement,
  Tab vers l'étude, Entrée et retour. Console Chromium sans erreur.
- Ordre des `<script>` inchangé. Version **`lot4t8b2`** pour
  `ui-06-career-screens.js` après reprise ; **`lot4t8b1`** pour
  `ui-08-controller-arena.js` et la nouvelle CSS.
- `git diff --check` passe.

## Preuves

Dans ce dossier, jeu à gauche et maquette à droite :

- `t8b-carriere-comparaison-1920.png` — deux vues natives 1920×1080 ;
- `t8b-carriere-comparaison-1280.png` ;
- `t8b-carriere-comparaison-1440.png`.

La maquette est un dessin fixe de 1920px sans responsive. Dans les deux
dernières comparaisons, sa capture native est réduite proportionnellement,
alors que le jeu est réellement rendu à 1280 / 1440×1080. Ses textes et son
HTML restent intacts ; les mêmes fontes locales Saira sont chargées pour
comparer hors ligne.

Preuves complémentaires :

- `t8b-carriere-neuve-1920.png` — moral et forme dès la création ;
- `t8b-carriere-camp-1920.png` — les trois choix de camp réels ;
- `t8b-carriere-focus-1440.png` — focus visible sur le lien d'étude ;
- `t8b-carriere-souris-clavier-1440.webm` — reprise, Dossier, fiche à la
  souris puis étude et retour au clavier ; conservée en local, ignorée par Git ;
- `t8b-carriere-audit.json` — géométrie, tailles, contraste sur les pixels
  du fond rendu, historique de la carrière jouée et résultat des parcours.

La liste des captures de preuve est réincluse dans `.gitignore`. Le script
produit aussi les prises individuelles du jeu et de la maquette, accessibles
localement et régénérables, sans multiplier les preuves versionnées.
