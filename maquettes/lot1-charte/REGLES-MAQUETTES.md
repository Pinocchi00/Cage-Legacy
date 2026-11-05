# Cage Legacy — règles des maquettes (mode management)

**Date :** 05/11/2026 · **Source :** retours d'Anthony pendant la maquette du lot 1 (Accueil et fiche combattant), le plan de corrections du 01/11, la charte `docs/CHARTE-INTERFACE-MANAGEMENT.md` et les mesures du jeu (`ui-cadre.css`).
**Référence visuelle validée :** `maquettes/lot1-charte/` (`index.html`, `comparaison.html`).
**S'applique à :** toute nouvelle maquette d'écran du management, avant le code.

Ce document ne tranche rien de nouveau. Il fixe ce qu'Anthony a dit, pour que chaque maquette parte du même point.

---

## 1. Principe : partir du jeu, pas d'une page blanche

1. **La maquette doit ressembler exactement au jeu actuel.** On garde la DA du jeu (cadre, panneaux, typographie, tunnel, couleurs). On ne change que ce que le plan du 01/11 ou Anthony demande. « Il ne faut pas tout changer, juste adapter et légèrement modifier. »
2. **Une ou deux maquettes d'écran au plus par passe**, travaillées à fond selon les exigences d'Anthony, plutôt que beaucoup d'écrans survolés.
3. **Toujours partir d'une capture du jeu actuel** de l'écran concerné. Sans capture, la demander.
4. **Livrer une comparaison côte à côte** : capture du jeu à gauche, maquette à droite, même écran (`comparaison.html`).
5. **Minimalisme classe** : chaque ajout doit être aussi fin et discret que le reste. Si un détail attire plus l'œil que son importance, il est trop gros.
6. **Ne rien décider à la place d'Anthony.** Une interprétation incertaine est faite, montrée, et signalée dans le compte rendu.

## 2. Format technique d'une maquette

- **Une scène fixe de 1920 × 1080**, mise à l'échelle de la fenêtre, comme le jeu. Toutes les mesures ci-dessous sont en pixels de cette scène.
- **Vanilla JS et CSS**, sans dépendance. Les fichiers vont dans `maquettes/<nom>/`. Le code du jeu n'est jamais modifié.
- **Polices locales du jeu** (`fonts/`) : titres en **Saira Extra Condensed 800** en capitales, texte en **Saira Condensed** (500 à 700).
- **Images du jeu** prises dans `images/`. Ne jamais redessiner ce qui existe déjà en image.
- **Données fictives mais crédibles**, cohérentes entre elles : un trait « Menton solide » interdit une défaite par KO, et un bilan doit coller à la série affichée.
- **Pas de panneau de réglages ni de bouton « Choix à faire » visible** dans la maquette finale. Les variantes se montrent en comparaison, pas dans l'écran.
- **Vérification avant livraison** : capture à 1920 × 1080, console sans erreur, test de chaque clic (ouvrir, Retour, Avant, liste, défilement).

## 3. Le cadre commun à tous les écrans

### Barre latérale (identique au jeu)
- Largeur **260 px**, fond `#0D0B0B`, bord droit de 2 px.
- **Logo** en haut, sur un bloc de 128 px.
- Éléments de **59 px** de haut, séparés par un trait de 2 px. Libellés en titre de 30 px, en capitales.
- L'élément courant est sur **fond blanc cassé `#E9E6E1`, texte noir**.
- « Quelque chose à faire » = **petit octogone jaune plein de 20 px** à droite du libellé.
- **Bouton de repli** : petite double flèche discrète (30 × 30 px, blanc à 40 %) **en haut à droite du bloc logo**. Il est purement fonctionnel : pas de libellé, pas de languette, pas d'interrupteur.
- Barre repliée : **84 px**, icônes SVG seules. L'octogone jaune passe dans le coin haut droit de l'icône.

### En-tête (64 px de haut, à 20 px du haut)
De gauche à droite :
1. **Flèche arrière** et **flèche avant** : deux boîtes de 64 × 64 px. Flèche avant grisée tant qu'il n'y a rien à refaire.
2. **La plaque du titre de l'écran** seule (« ACCUEIL », « EFFECTIF »). Pas de sous-libellé : pas de « Semaine 63 », pas de « Combattant », pas de « 1 / 11 ». *Ce retrait est à faire sur chaque écran du jeu plus tard.*
3. À droite, **la date du jour avec l'année** (« 12 JANVIER 2027 ») dans une boîte. Rien d'autre dans cette boîte : le lieu est déjà affiché ailleurs.
4. **Le nom de la soirée** dans une boîte, avec le numéro en rouge.
5. **Continuer** : bouton jaune du jeu (64 px), libellé et chevron seulement, **sans date dessous**.

### Ligne d'alerte sous l'en-tête (quand il y a une prochaine étape)
- Étiquette jaune « PROCHAINE ÉTAPE » (34 px de haut, contour de 1 px), puis une phrase courte en blanc.

## 4. Les formes

- **Octogone partout** : les 4 coins sont coupés, jamais 2 seulement (fin des coins rognés, Q19b). Cela vaut pour les panneaux, les boutons, les onglets, les étiquettes, les cases et les marques.
- **Panneau** : bord de 2 px (`rgba(233,230,225,.38)`, qui ressort en `#74716F` à l'écran), puis 5 px de noir, puis le fond `#121010`. Coins coupés de 18 / 17 / 14 px.
- **Un bord suit toujours les angles coupés.** Ne jamais combiner `border` et `clip-path` : le bord disparaît dans les coins. Il faut deux couches, une extérieure de la couleur du bord et une intérieure du fond (classes `.pan`, `.bb`).
- **Titre de panneau** : 44 px en capitales, avec la **barre rouge de 56 × 6 px** dessous. Une mention à droite en capitales espacées de 20 px (« 2 NON LUS · TOUT VOIR › »).
- **Onglets** : 56 px de haut, fond `#252121`, octogonaux. L'onglet ouvert est sur fond blanc cassé et texte noir.
- **Boutons secondaires** (Suivre, effectif de la catégorie) : fond noir, **bord de 2 px qui suit l'octogone**, et le bord passe au blanc au survol.

## 5. Les cases jaunes

- **Contour de 2 px, posé sur le bord, de la même couleur que les autres encadrés (`#74716F`)**. Pas de liseré intérieur, pas de double trait.
- **Proportionnel** : une petite étiquette (≈ 34 px de haut) a un contour de **1 px**.
- Le **C du champion** a aussi son contour, dans le même esprit.
- Texte **noir** sur fond jaune.

## 6. Les couleurs (jaune, vert, rouge)

Base : décision T11 (vert = positif, rouge = négatif, jaune = important).

**Jaune — « à toi d'agir », et l'or des champions**
- Oui : l'action principale (Continuer, Proposer un combat, Ouvrir la carte), la marque « à faire », la prochaine étape, les liens d'action (« Tout voir › », « Ouvrir › »), une valeur **en cours** vers un objectif, le champion (C, tunnel doré).
- Non : un nom, un **surnom**, un titre, une donnée neutre, une décoration.
- Limite : un seul bloc jaune plein par panneau, un seul bouton jaune par écran.

**Vert — ce qui va bien, rien d'autre**
- Victoire (V), « Disponible », montée au classement (▲), objectif tenu, mieux que la moyenne de la catégorie.
- Jamais pour un bouton, un lien ou une décoration.

**Rouge — deux usages jamais mélangés**
- *Rouge de marque* (`#B32A1E` / `#E23A2B`) : logo, barre sous les titres, tunnel, numéro de soirée. Décor seulement, jamais sur une donnée.
- *Rouge de sens* (`#E5483B`) : défaite (D), blessé, descente (▼), objectif manqué, perte d'argent.
- Jamais pour un bouton d'action.

**Partout**
- Jamais une couleur seule : toujours avec une lettre, un mot ou une icône (V / D, « Disponible », croix médicale, ▲ / ▼).
- Le neutre est blanc ou gris : bilans, âges, tailles, dates, et **la moyenne de référence** (repère blanc).

## 7. Les tunnels d'octogones

- **On reprend les images du jeu**, sans les redessiner : `images/tunnel-or.jpg` (doré, champion) et `images/accueil-octogones.jpg` (rouge).
- **Bannière de fiche** : même cadrage que `.mf-fb-img`. Image de 1728 × 972 px, posée à `left:-150.6px; top:-356px`, dans une bannière de 1564 × 260 px.
- **Bandeau de l'accueil** : le tunnel rouge **part du même endroit et s'étend autant que sur la fiche**. Mêmes `left` et taille ; `top` recalculé pour centrer la hauteur, soit `-407px` pour 158 px. Il est **moins lumineux** (`brightness(.8)`).
- Les chiffres posés sur un tunnel ont un **fond noir presque opaque** (`rgba(13,11,11,.86)`) pour rester lisibles, **sans séparation verticale** entre eux.

## 8. Navigation et interaction

- **Tout se fait à la souris. Aucune touche clavier n'est affichée** : plus de barre « Échap / Tab / Entrée », plus de « Onglet suivant 3/60 ». Les raccourcis restent actifs mais cachés (T1).
- **Retour et Avant** marchent sur tout le parcours, y compris de fiche en fiche.
- **La fiche s'ouvre en panneau par-dessus l'écran courant** (T7), qui reste derrière sans être perdu.
- **Tout nom de combattant est souligné et cliquable**, partout : listes, messages, suivis, et **chaque adversaire des derniers combats**, même hors de Split (sa fiche s'ouvre quand même).
- **Passer d'un combattant à l'autre** : cliquer-tirer la bannière, avec une animation qui suit le geste, ou les flèches qui apparaissent au survol.
- **Liste de la catégorie** (remplace « ‹ 1 / 11 › ») :
  - Un **bouton minimaliste** : l'icône des **deux bonhommes et deux flèches haut / bas**, sans texte, octogonal, avec un bord qui suit les angles.
  - Il ouvre un **panneau par-dessus les cases du bas** : l'effectif de la catégorie en vue simplifiée, qui **défile à la molette**.
  - Chaque ligne montre : le rang (ou le C avec contour), le **nom avec le surnom dessous**, le palmarès, le rang mondial, la série, le **dernier combat** et l'état. La fiche ouverte est sur fond blanc cassé.
  - Un clic sur une ligne ouvre la fiche et referme le panneau.
- **Mouvement discret** sur les écrans de gestion : apparition douce, compteurs qui défilent, jauges qui se remplissent, point « non lu » qui pulse. Le spectaculaire est réservé au combat et à la soirée (T3).
- **Barres de défilement fines** (5 px).

## 9. Le contenu et les textes

- **Aucun texte de tutoriel** à l'écran (T5). L'info arrive au moment de l'action.
- **Ton sobre, façon FM** (T6). Tout texte inventé porte la marque **« À RELIRE »**.
- **L'humain d'abord** (charte) :
  - aucune note, jauge ou étoile sur un combat ;
  - une relation se dit dans une phrase du personnage, jamais en chiffre (« Relation inconnue » devient une phrase de lui) ;
  - pas de donnée cachée affichée, comme la forme en % ou la fatigue.
- **Surnoms** : sous le nom, dans la majorité des écrans où ils apportent quelque chose. Couleur neutre, pas jaune.
- **Temps depuis le dernier combat** : en **mois et semaines** (« il y a 2 mois », « il y a 3 mois et 1 semaine », « il y a moins d'une semaine »). Quatre semaines comptent comme un mois.
- **Série des 5 derniers combats** : marques octogonales V (vert) et D (rouge), **sans flèche** à côté.
- **Dates courtes** : « 8 déc. 2026 ». Mois abrégés corrects : janv., févr., mars, avr., mai, juin, juil., août, sept., oct., nov., déc.
- **Pas de doublon** : une info déjà visible sur l'écran n'est pas répétée à côté (le lieu sous la soirée, « 2e des huit », la date sous « Split »).
- **Une info par ligne** dans les listes courtes de l'accueil (« Tes suivis »), avec « Tout voir › » pour aller plus loin.

## 10. Écrans déjà validés (référence)

### Accueil
- **Bandeau** : « SPLIT » et « Lyon · depuis 2004 », puis Prochaine soirée, Le lieu, La carte (jaune tant qu'elle est incomplète), Les préventes (avec une jauge).
- **Derniers messages** : point jaune pour les non-lus, titre, auteur et date, étiquette du type à droite (LEÏLA, MÉDECIN, PALIER, PRESSE, RECRUTEUR).
- **Ce qui t'attend** :
  - un seul bloc jaune « La prochaine chose à faire », avec un bouton noir ;
  - **pas** de « Demander des idées à Leïla » ;
  - puis « À surveiller » et « Tes suivis », une info chacun, avec « Tout voir › ».
- **Pas de « La semaine du combat »** : elle arrivera en continuant le jeu (à voir plus tard).
- **Ta saison** : des objectifs jamais déjà atteints (« 2e, à garder »), puis Le patron (une phrase de lui) et Ton recruteur.
- **Ton recruteur** : « Disponible » avec « Ouvrir › », ou « En voyage à <ville> » avec « Retour le <date> ». Rien de plus.

### Fiche combattant
- **Bannière** : prénom et surnom, puis le nom en très grand. Tunnel du jeu, doré pour un champion. Cadre « Palmarès » à droite avec la série, et le rang (C avec contour) avec la catégorie.
- **Onglets** : Aperçu, Statistiques, Combats, Contrat, On en dit, Lui et Split. À droite : le bouton de la liste de la catégorie, puis Suivre.
- **Aperçu** en trois colonnes :
  - **Ce qui le distingue** : ses traits, puis les derniers combats, avec tous les adversaires cliquables ;
  - **Dans la cage** : l'octogone rempli, sans hachures ;
  - **les huit faits** (âge, taille, allonge, garde, chez Split, contrat, mondial, style), **En ce moment** (état et temps depuis le dernier combat) et **Prochain combat** avec « Proposer un combat ».
- **Statistiques** : chaque barre a un repère blanc pour la moyenne de la catégorie et un point vert si c'est mieux. Les fins de combat sont dites clairement (« arrêt de l'arbitre sur coups », « arrêt du médecin »).

## 11. Interprétations à confirmer, et ce qui reste à décider ailleurs

- La boîte de date de l'en-tête affiche **la date du jour** (elle avance avec Continuer). Le 16 février est la date de la soirée et reste dans le bandeau.
- Le nom de la soirée reste « Split Fight Night 63 » comme dans le jeu, alors que le plan prévoit « Split : X vs Y » pour les fight nights (Q29a).
- Le fond cendré est retiré (C1). La maquette utilise un gris chaud texturé proche du jeu ; le choix final du fond n'est pas encore validé.
- Les surnoms ajoutés aux poids légers (Le Notaire, Baba, Le Faucon…) sont des propositions à relire. Seul « Le Boucher » vient du jeu.
