# Cage Legacy — règles des maquettes (mode management)

**Date :** 05/11/2026 · **Sources :** retours d'Anthony pendant la maquette du lot 1 (Accueil et fiche combattant), le plan de corrections `docs/PLAN-CORRECTIONS-01-11.md`, le dossier `docs/DOSSIER-UI-UX-GESTION-2026.pdf`, la charte `docs/CHARTE-INTERFACE-MANAGEMENT.md` et les mesures du jeu (`ui-cadre.css`).
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

## 11. Les pièces communes pas encore maquettées

Ces règles viennent de tes décisions dans le plan (`docs/PLAN-CORRECTIONS-01-11.md`), de la charte et du dossier UI/UX (`docs/DOSSIER-UI-UX-GESTION-2026.pdf`). Elles s'appliquent dès qu'un écran contient la pièce. La première maquette qui la montre la fait valider.

### Grands tableaux (Effectif, Classements, Contrats, Recrutement, Salles)
- **Toutes les colonnes se trient** d'un clic sur leur titre. Le titre trié est blanc, avec ▾ ou ▴.
- **Pas de titre bavard** au-dessus du tableau (« 29 combattants en poids léger », R15). Le titre de l'écran suffit ; les filtres disent le reste.
- **Filtres en boutons octogonaux**, sur une ligne au-dessus du tableau. Le filtre actif a le bord blanc. **Un filtre choisi n'est jamais remis à zéro** quand on revient sur l'écran (dossier UI/UX).
- **Vue essentielle et vue experte** : la vue essentielle a 6 à 8 colonnes utiles, la vue experte ajoute le détail. Les deux ont la même structure.
- **Colonnes à prévoir pour un combattant** : nom souligné avec le surnom dessous, catégorie, âge, palmarès, rang Split (ou C avec contour), rang mondial avec ▲ / ▼, 5 derniers combats, dernier combat (mois et semaines), état.
- **Aucune croix ni pastille sans rôle** (R15, R22). Un élément qu'on ne peut pas cliquer n'a pas l'air cliquable.
- **Un clic sur un nom** ouvre la fiche en panneau. Un clic ailleurs sur la ligne ne fait rien d'inattendu.
- Lignes de 56 à 60 px, séparées par un trait de 2 px (`--sep`), sans fond alterné.

### Sous-menus d'un écran (onglets du haut)
- Ils restent en haut, **sous l'en-tête, jamais par-dessus** (R18, Q18c) : à 136 px du haut (ou juste sous la ligne « Prochaine étape »).
- Mêmes onglets que la fiche : 56 px, octogonaux, celui qui est ouvert est blanc.
- Un onglet qui a du nouveau porte le **petit octogone jaune** à côté de son nom.

### Écran Messages (R13, T10, Q5a)
- **Deux colonnes, pas trois** : la liste des messages à gauche (≈ 520 px), le message ouvert au centre. Plus de colonne de droite.
- Chaque ligne de la liste : point jaune si non lu, titre, auteur et date, étiquette du type (LEÏLA, MÉDECIN, PALIER, PRESSE, RECRUTEUR, AGENT, ORGANISATION).
- Le message ouvert : qui parle, quand, le texte (largeur de lecture 55 à 80 caractères), puis **2 à 4 réponses au plus**, en boutons. La réponse principale est jaune, les autres sont noires avec un bord.
- **Un message important arrête Continuer** : blessure à l'affiche, poids raté, retour du recruteur, offre d'une autre organisation…
- **Un palier de croissance franchi arrive comme un message** (« Palier franchi »), pas dans le fil d'actualité.
- « Le fil » et « Tes suivis » ne sont pas dans les Messages. Le fil va dans Presse et les suivis dans Recrutement, sauf si tu décides autrement (choix ouvert).

### Continuer (T10)
- Toujours au même endroit : en haut à droite, en bouton jaune.
- Le temps avance **jour par jour** ; la date de la boîte change sous les yeux. Il **s'arrête sur le premier message important**.
- S'il reste une décision qui bloque (un combattant blessé à l'affiche, par exemple), Continuer **le dit et mène à l'écran où l'on règle le problème**, avec la personne déjà sélectionnée (dossier UI/UX). Ce qui peut attendre ne bloque pas.

### Panneaux par-dessus (fiche, liste de la catégorie, détail d'un combat)
- Ils s'ouvrent **par-dessus l'écran courant, sans le quitter**. L'écran derrière s'efface et se retrouve intact au Retour.
- Ils gardent le cadre du jeu : panneau à double bord octogonal, titre avec la barre rouge.
- Ils se ferment par Retour, par un nouveau clic sur leur bouton, ou par un clic en dehors.

### Confirmations et erreurs
- **Pas de fenêtre de confirmation**, sauf pour une décision irréversible qui engage l'argent ou une carrière : libérer un combattant, valider la carte, fixer les primes (charte S6).
- La confirmation reprend **ce qui va se passer, en chiffres** (qui, combien, quand), avec deux boutons : l'action en jaune, « Revenir » en noir.
- **Un refus dit pourquoi et quoi faire** : « Impossible : Rizzo est blessé jusqu'au 2 février. » Jamais « Erreur » ou « Action impossible » seul.
- Le retour d'une action se voit tout de suite (la ligne change, le compteur bouge). Un petit message en bas, au même cadre, pendant 3 secondes, suffit.

### États vides
- **Un emplacement vide le dit simplement** : « Libre », « Aucun combat prévu », « Aucune demande ». Il ne garde jamais le texte d'avant (R12).
- **Pas de grisé pour une option qui n'existe pas** : elle n'est simplement pas là (charte R4).

### La carte d'une soirée (R12, Q12, Q14)
- Composer se fait **au glisser-déposer**, avec une **animation satisfaisante au dépôt**. Les places de la carte s'échangent entre elles de la même façon.
- **4 combats en carte principale, 6 en préliminaires**. Les préliminaires sont composés seuls (priorité aux inactifs, au moins 2 combats féminins) et **modifiables à la main**.
- La **liste complète des combattants** est à droite : elle défile, se filtre par catégorie et dit quel niveau de combat chacun mérite.
- Un combattant **indisponible affiche sa raison** : blessé jusqu'au…, déjà à l'affiche, refuse (et pourquoi).
- **Le combat sélectionné est au centre**, avec Présentation, Face-à-face et Retirer. Pas de croix sur chaque ligne de gauche.
- **Le bilan se voit pendant la composition, avant de valider** : recette estimée (une fourchette), ce qu'on en dit (une phrase de la presse, jamais une jauge, charte H1), et ce qu'il reste à régler. Les préliminaires y pèsent très peu.
- **Valider ouvre un résumé** de la carte avant de confirmer.
- « Demander à Leïla » est **une aide à la demande** : elle n'impose jamais d'adversaire (Q7).
- Comparer deux combattants : **un point devant la meilleure valeur** (ou la valeur en vert : choix ouvert, Q10b).

### Mouvement
- **Écrans de gestion : discret** (apparition douce de 0,45 s, compteurs, jauges, point qui pulse). Une action fréquente n'attend jamais une animation.
- **Combat et soirée : spectaculaire autorisé** (T3) : faisceaux, noms qui entrent, flash, temps forts animés de l'arène vue du dessus (R38).
- Tout mouvement s'arrête si l'ordinateur demande moins d'animations (`prefers-reduced-motion`).

### Lisibilité (charte L1 à L5)
- Prévu pour 1920, **lisible dès 1280** : la scène entière se met à l'échelle, sans défilement horizontal.
- Toute info utile à une décision : **au moins 18 px dans la scène de 1920**. C'est le minimum de la charte (13 px à 1440, L2), arrondi ; viser 20 px pour rester confortable à 1280. Contraste d'au moins 4,5 : 1.
- Libellés décoratifs (titres de colonne, mentions) : au moins 15 px dans la scène de 1920 (11 px à 1440, L3), avec un contraste d'au moins 3 : 1.
- **Écart de lecture** : deux textes voisins d'une même ligne sont séparés d'au moins 26 px (`--mf-ecart`). On passe à la ligne plutôt que de les coller.
- Un nom long n'est jamais coupé au point de devenir ambigu.

## 12. Index écran par écran

Pour chaque nouvelle maquette, **lire d'abord les remarques de l'écran dans le plan** (`docs/PLAN-CORRECTIONS-01-11.md`, section « Écran par écran »), puis appliquer ce document. Les points d'interface à ne pas oublier :

| Écran | Remarques | À appliquer en priorité |
|---|---|---|
| Arrivée | R1 à R4 | Intro façon FM, courte et marquante. « Ton contrat » et « Ce qui manque » fusionnés. **2 espoirs sur 6**, en cartes avec particularité et style, sans histoire. La fiche s'ouvre sans sauter l'étape. Le prédécesseur n'apparaît que dans l'histoire de l'organisation. |
| Accueil | R5, R6 | Validé (section 10). |
| Leïla, présentation, face-à-face | R7 à R10 | Leïla à la demande, des confrontations propres à chaque combattant. Le combattant choisi reste visible pendant le choix de l'adversaire. Présentation et face-à-face restent **deux écrans** riches et uniques. Marqueur du meilleur côté. Les trois médias renommés et présentés. Plus de « Peu de combats documentés » trompeur. |
| Carte, préliminaires | R12, R14 | Section 11, « La carte d'une soirée ». |
| Messages | R13, R17 | Section 11, « Écran Messages » et « Continuer ». |
| Effectif, Infirmerie | R15, Q12b | Section 11, « Grands tableaux ». **Infirmerie = un onglet de l'Effectif.** Peu de refus au départ, toujours avec une raison et une solution. |
| Fiche | R16 | Validé (section 10). |
| Classements | R18 à R21 | **Logo du jeu sur le n° 1 et le n° 2.** Tunnel rouge. Victoire et défaite, montée et descente en vert / rouge. Sous-menus moins hauts. « Les meilleurs » en vitrine colorée, où un clic ouvre la liste complète de la statistique. Records regroupés et séparés par type. |
| Ceintures | R22 | Une version avec un vrai sens (lignée des champions, règnes, intérims, prochain défi), regroupée avec le Classement. **Tu décides ensuite de la garder ou non.** Défenses et durée du règne sont dans le Classement de toute façon. |
| Contrats, recrutement | R23 à R25 | **Un seul écran de recrutement** avec un filtre (agents libres, fins de contrat ailleurs). Négociation FM en 2 à 4 allers-retours (salaire, nombre de combats, primes, chance au titre sous le nom des demandes). « Il dit » et l'avis des médias passent dans la fiche. « Tu l'as vu » est retiré. |
| Recruteur | R26 | Départ de Lyon, toutes les catégories, 2 / 4 / 6 profils selon la durée du voyage. De vrais styles de combat. |
| Salles et camps | R27 | Liste verticale avec un classement (réputation, champions formés) et une spécialité. Elles évoluent seules. |
| Presse | R28 | **Nouveaux exemples visuels à montrer avant toute refonte.** Les « envies du public » seulement pour les très grosses affiches. |
| Calendrier, résultats, lendemain | R29, R30, R40, R41 | Pour chaque soirée : enjeu, ceinture, ville, salle. Résultats lisibles d'un coup d'œil (vainqueur en couleur, méthode, round et temps, surnoms, mouvement au classement, bonus). Les 3 cartes des juges, avec le nom de celui qui a eu 10. Lendemain refait (phrases, défilement, couleur, mouvement). |
| Finances | R31 | Toutes les infos (courbe du solde, recettes et dépenses par soirée, masse salariale). Pas de budget imposé. |
| Organisation, croissance, poste | R32 à R35 | Mesures renommées, compréhensibles d'un coup d'œil. Le classement des organisations bouge. **Poste et Carnet fusionnés.** Défis par paliers. |
| Soirée en direct, discours, temps forts, bilan | R36 à R39 | Niveau **spectaculaire**. Le résultat reste jusqu'au clic « Combat suivant ». Recettes à la fin seulement. Discours selon la règle de Q37. Temps forts vus du dessus. **Primes fixées par le joueur, de 1 000 € à 100 000 €.** « Revoir » au choix : l'arène ou le récit. |

## 13. Choix encore ouverts (à trancher sur une prochaine maquette)

Chaque maquette part de l'hypothèse notée ici et le signale. Rien n'est tranché sans toi.

| Sujet | Hypothèse actuelle de la maquette | Source |
|---|---|---|
| Fond (le cendré est retiré) | Gris chaud texturé, proche du jeu | C1, T2 |
| Police | Saira, celle du jeu | T2b |
| Octogone « Dans la cage » | Version « rempli » (il impose / il subit). Deux autres versions existent : « en chiffres » et « comment il gagne » | Q16c |
| Nom des demandes des combattants | « Ses demandes » (autres pistes : « Engagements », « Parole donnée ») | Point tranché n° 1 |
| Barre latérale | Liste actuelle du jeu, « Actualités » devenu « Messages ». Le regroupement en familles sous de nouveaux noms (T4, Q11) reste à proposer | T4, Q11 |
| Place du « Fil » et des « Suivis » | Fil dans Presse, Suivis dans Recrutement (et un aperçu sur l'Accueil) | Q13 |
| Classement Split / Monde | À montrer : un écran avec filtre, ou deux écrans | Q20b |
| Écran Ceintures | À montrer avec un vrai sens, puis à garder ou supprimer | Point tranché n° 2 |
| Nom des soirées | « Split Fight Night 63 » comme dans le jeu ; le plan prévoit « Split : X vs Y » pour les fight nights et « Split 1 » pour les grandes soirées | Q21c, Q29a |
| Meilleur côté dans une comparaison | Un point jaune devant la valeur, ou la valeur en vert | Q10b |
| Surnoms affichés | Sous le nom dans les listes, à côté du prénom dans la bannière. La liste des écrans concernés reste à valider | T11 |
| Noms des trois médias | Cage Hebdo, Tableau Noir, Le Forum (à renommer) | Q10c |
| Date de l'en-tête | La date du jour (le 16 février reste la date de la soirée) | Retour du 05/11 |

## 14. Méthode pour chaque nouvelle maquette

1. Demander (ou retrouver) **la capture du jeu actuel** de l'écran.
2. Lire **les remarques de l'écran** dans le plan (section 12) et les décisions qui s'y rattachent.
3. Partir de `maquettes/lot1-charte/` (`charte.css`, `cadre.js`) : même scène, même cadre, mêmes pièces. Ne recréer une pièce que si elle n'existe pas encore.
4. Appliquer ce document. Tout écart volontaire est signalé.
5. Vérifier :
   - capture à 1920 × 1080 ;
   - console sans erreur ;
   - chaque clic testé ;
   - chaque nom cliquable ;
   - aucune touche affichée ;
   - couleurs conformes à la section 6.
6. Livrer **côte à côte avec le jeu** (`comparaison.html`), avec la liste des hypothèses prises dans la section 13.
7. Quand une règle nouvelle est validée par Anthony, **l'ajouter à ce document** le jour même.

## 15. Documents de référence

- `docs/PLAN-CORRECTIONS-01-11.md` : les 41 remarques, tes décisions mot pour mot, les conflits tranchés, l'ordre des lots.
- `docs/DOSSIER-UI-UX-GESTION-2026.pdf` : l'étude comparative (FM, Crusader Kings III, Against the Storm…). Les pages 18 à 24 donnent les 12 lois utiles et l'architecture conseillée pour Cage Legacy.
- `docs/CHARTE-INTERFACE-MANAGEMENT.md` : humanité, réalisme, simplicité, lisibilité (H1 à L5).
- `maquettes/lot1-charte/` : la maquette de référence (Accueil et fiche) et sa comparaison avec le jeu.
