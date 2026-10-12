# Monde lot 2 T8 — Lisibilité : l'en-tête, Résultats, le Calendrier

## Branche
`monde-lot-2-identites`. Fiche écrite par Claude le 12/10/2026 sur les captures d'Anthony (partie Garden of Blood,
1920 × 1080) : « trop d'éléments dépassent dans tous les sens, c'est brouillon, des phrases à moitié coupées,
le DÉCISION en rouge est horrible, l'écran Résultats n'est pas pratique ni lisible, quand je clique ça montre les combats
inférieurs, ce n'est pas explicite, on ne sait pas ce qu'on doit faire. » Décisions de Claude : tout ce qui suit.

## 1. Les défauts constatés (à reproduire avant de corriger)
Ouvre le jeu avec une partie Garden of Blood (nom long) et regarde, à 1920 × 1080 et à 1440 × 900 :
1. **En-tête** : « GARDEN OF BLOOD FIGHT NIGHT 63 » sort de l'écran à droite ; la ligne « … 8 DÉCEMBRE 2026 » se colle à « Dans 35 jours » (aucun espace) ; sur le Calendrier, « AUJOURD'HUI · 12 JANVIER » se colle à « Dans 35 jours ».
2. **Calendrier** : le titre de la soirée (« GARDEN OF BLOOD FIGHT NIGHT ») est coupé en haut de son cadre, sa ligne de date passe par-dessus le bord.
3. **Résultats** : le résultat « DÉCISION » est écrit en très gros rouge ; le rouge est la couleur de l'alerte et du combat principal, pas d'un résultat banal ; les pastilles de soirée (Soirée 62, 61…) ne disent ni la date ni qui a combattu ; un clic sur un combat ne dit pas ce qu'il va faire.

## 2. L'en-tête (`mfEcran`, `mgmt-cadre.js`, et ses feuilles de style)
- Le nom de la soirée suit la règle de la carte d'organisation (`mgmt-nouvelle.js`, `font-size: o.nom.length>18?30:44`) : au-delà de 18 caractères, 30 px ; au-delà de 26, il passe sur **deux lignes** dans le même cadre (jamais tronqué, jamais hors écran).
- Le numéro de soirée garde sa taille et reste visible à droite.
- Chaque élément de la ligne (libellé, date, « Dans N jours », lieu, nom de la soirée) a un **espace d'au moins 24 px** avec son voisin ; l'en-tête ne dépasse jamais la largeur de l'écran (`flex-wrap` ou réduction du libellé de gauche : la date longue passe sous le titre de page si besoin).
- Un test mesure le débordement avec les noms les plus longs des huit organisations (voir §6).

## 3. Résultats (`mgmt-ecran-resultats.js` ou équivalent : `grep -n "Revoir ce combat" mgmt-*.js`)
- **Disposition** : à gauche, la liste des soirées (les 5 dernières puis « Plus anciennes » défilant), chacune avec **sa date** et
  **son combat principal en une ligne** (« 8 déc. 2026 · Gosselin bat Dzhabrailova ») ; à droite, la soirée choisie : **tous ses
  combats en tableau**, une ligne par combat : place (Principal, Co-principal, 3, 4, 5, Prélim 1…), les deux noms avec le vainqueur en gras,
  la méthode et le round en texte normal (« Décision · 5 rounds », « KO · 2e round »).
- **Couleurs** : le rouge n'est plus utilisé pour le résultat. Vainqueur : texte crème en gras ; perdant : gris. Un titre en jeu
  porte l'étiquette jaune « CEINTURE » (comme dans Ceintures). Le « DÉCISION » géant disparaît.
- **Sélection explicite** : la ligne sous le curseur a un contour blanc (la même règle que la correction demandée sur Ceintures :
  contour blanc seulement sur l'élément sélectionné, pas de fond clair). Sous le tableau, une ligne d'aide dit ce que fait Entrée :
  « Entrée : revoir le combat » (pour un combat joué sous le joueur) ou « Combat des six ans : pas de rediffusion — Entrée ouvre la fiche
  du vainqueur » (pour un combat du passé, `mgmtCombatRevoyable(t)` faux). Plus jamais un clic dont on ne sait pas l'effet.
- **← →** changent de soirée, **↑ ↓** de ligne, **Tab** passe de la liste au tableau (barre de touches déjà au pied).
- Aucun texte sous 22 px, rien ne déborde du tableau (retours à la ligne autorisés).

## 4. Calendrier (`mgmt-ecran-calendrier.js` : `grep -n "OÙ EN EST LA SOIRÉE" mgmt-*.js`)
- Le titre du cadre rouge central suit la même règle que l'en-tête (30 px, deux lignes si > 26 caractères) et reste **à l'intérieur** du cadre.
- La ligne « 16 FÉVRIER · DÔME DE NICE · PETITE · 9 COMBATS » est à l'intérieur du cadre, au-dessus du titre, avec 12 px d'air.
- « DANS 35 JOURS » ne chevauche pas le numéro.

## 5. Ceintures (retour d'Anthony du 12/10)
Sur l'écran Ceintures, la carte **sélectionnée** n'a plus un fond clair : elle garde son fond sombre, avec un **contour blanc de 3 px**.
Les autres n'ont pas de contour. `grep -n "mf-ceinture" ui-cadre.css mgmt-*.js` pour trouver la classe de sélection.

## 6. Tests (`tests/mgmtLisibilite.test.js`, à ajouter à `package.json`)
1. Pour chacune des huit organisations, l'en-tête de l'écran Résultats rend un nom de soirée dont le `scrollWidth` ≤ `clientWidth` de son cadre, en jsdom avec un gabarit fixe de 1920 px (si jsdom ne mesure pas, tester la règle : `font-size` et nombre de lignes calculés par la fonction pure qui choisit la taille — l'extraire en `mfNomSoireeGabarit(nom)`).
2. Résultats : la liste montre une date et un combat principal par soirée ; le tableau rend autant de lignes que de combats de la soirée ; aucun style inline `color` rouge sur un résultat.
3. Résultats : sur un combat du passé (`p:true`), l'aide dit « pas de rediffusion » et Entrée ne lance aucune rediffusion.
4. Ceintures : la carte sélectionnée porte `outline`/`border` blanc 3 px et pas de fond clair.
5. Aucun texte sous 22 px sur Résultats, Calendrier, Ceintures (test existant `mgmtCadre.test.js` doit couvrir ces écrans ; sinon l'étendre).
6. Les tests existants de Résultats et Calendrier restent verts ; si un test lit un libellé que cette tranche change, l'adapter en citant « décision du 12/10/2026, retour d'Anthony » en commentaire.

## 7. Vérification dans le jeu réel (obligatoire, écran par écran)
`preview_start` sur le serveur du dossier, nouvelle partie Garden of Blood, captures 1920 × 1080 de : en-tête, Résultats (soirée 62 et une
soirée du joueur), Calendrier, Ceintures. Les joindre au compte rendu.

## 8. Hors périmètre
Les planches validées du brief (Présentation, Dossiers, Accueil) : lots 3, 4, 7. L'aperçu du combat avec stats est la planche
« Présentation du combat » du lot 3, pas ici.
