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
- **Ordre, titres et hauteurs en version repliée** : section 11, « Barre latérale et navigation » (validée le 22/11).

### En-tête (64 px de haut, à 20 px du haut)
De gauche à droite :
1. **Flèche arrière** et **flèche avant** : deux boîtes de 64 × 64 px. Flèche avant grisée tant qu'il n'y a rien à refaire.
2. **La plaque du titre de l'écran** seule (« ACCUEIL », « EFFECTIF »). Pas de sous-libellé : pas de « Semaine 63 », pas de « Combattant », pas de « 1 / 11 ». *Ce retrait est à faire sur chaque écran du jeu plus tard.*
3. À droite, **la date du jour avec l'année** (« 12 JANVIER 2027 ») dans une boîte. Rien d'autre dans cette boîte : le lieu est déjà affiché ailleurs.
4. **Le nom de la soirée** dans une boîte, avec le numéro en rouge.
5. **Continuer** : bouton jaune du jeu (64 px), libellé et chevron seulement, **sans date dessous**. **Rectangulaire, comme les autres boîtes de l'en-tête** : contour gris de 2 px, filet noir, puis le jaune (décision du 08/11).

### Ligne d'alerte sous l'en-tête (quand il y a une prochaine étape)
- Étiquette jaune « PROCHAINE ÉTAPE » (34 px de haut, contour de 1 px), puis une phrase courte en blanc.

## 4. Les formes

- **Octogone partout** : les 4 coins sont coupés, jamais 2 seulement (fin des coins rognés, Q19b). Cela vaut pour les panneaux, les boutons, les onglets, les étiquettes, les cases et les marques. **Seule exception : le bouton Continuer, rectangulaire** (09/11).
- **Une surbrillance (ligne choisie, survol) suit elle aussi l'octogone et porte son encadré** : jamais un fond rectangulaire coupé par les angles d'un panneau (09/11).
- **Panneau** : bord de 2 px (`rgba(233,230,225,.38)`, qui ressort en `#74716F` à l'écran), puis 5 px de noir, puis le fond `#121010`. Coins coupés de 18 / 17 / 14 px.
- **Un bord suit toujours les angles coupés.** Ne jamais combiner `border` et `clip-path` : le bord disparaît dans les coins. Il faut deux couches, une extérieure de la couleur du bord et une intérieure du fond (classes `.pan`, `.bb`).
- **Titre de panneau** : 44 px en capitales, avec la **barre rouge de 56 × 6 px** dessous. Une mention à droite en capitales espacées de 20 px (« 2 NON LUS · TOUT VOIR › »).
- **Onglets** : 56 px de haut, fond `#252121`, octogonaux. L'onglet ouvert est sur fond blanc cassé et texte noir.
- **Boutons secondaires** (Suivre, effectif de la catégorie) : fond noir, **bord de 2 px qui suit l'octogone**, et le bord passe au blanc au survol.

## 5. Les cases jaunes

- **Contour de 1 px, sans espace, sur toutes les cases jaunes** (décision du 09/11, qui remplace les précédentes) : un trait de 1 px de la même couleur que le cadre de la date (`#74716F`), puis directement le jaune. Pas de filet noir, quelle que soit la taille de la case.
- **Le contour a la même épaisseur dans les angles coupés** : la couche jaune rentrée de 1 px a des coins de `c − 0,59 px` (`.cj`, `charte.css`).
- **Continuer est à part** : encadré **rectangulaire** comme les boîtes de l'en-tête (contour gris de 2 px), puis le jaune **sans écart**. C'est le seul bouton rectangulaire.
- **Une case jaune est toujours octogonale, contour compris** (décision du 08/11). La classe `.cj` découpe elle-même son octogone : un contour gris rectangulaire autour d'un bouton octogonal ne doit plus jamais apparaître. Tout nouvel encadré avec un contour suit la même règle : c'est l'élément qui porte le contour qui est découpé.
- Toute autre case, jaune ou non, est octogonale (étiquettes de type comprises). Les boîtes de l'en-tête restent comme dans le jeu (hypothèse, à confirmer).
- Le **C du champion** a aussi son contour, dans le même esprit.
- Texte **noir** sur fond jaune.

## 6. Les couleurs (jaune, vert, rouge)

Base : décision T11 (vert = positif, rouge = négatif, jaune = important).

**Jaune — « à toi d'agir », et l'or des champions**
- Oui : l'action principale (Continuer, Proposer un combat, Ouvrir la carte), la marque « à faire », la prochaine étape, les liens d'action (« Tout voir › », « Ouvrir › »), une valeur **en cours** vers un objectif, le champion (C, tunnel doré).
- Non : un nom, un **surnom**, un titre, une donnée neutre, une décoration.
- Limite : un seul bloc jaune plein par panneau, un seul bouton jaune par écran.
- **Primes de performance en médailles** (10/11, remplace le liseré jaune du 07/11) : un petit octogone doré (contour jaune, fond sombre, pictogramme jaune), un pictogramme par prime — **flamme** = combat de la soirée, **éclair** = performance, **cible** = finition — suivi du nom de la prime et du montant. Partout : résultats, relevé, lendemain, fiche (Combats, Contrat). Pièce commune `medaille()` (`fiche2.js`).

**Vert — ce qui va bien, rien d'autre**
- Victoire (V), « Disponible », montée au classement (▲), objectif tenu, mieux que la moyenne de la catégorie.
- Jamais pour un bouton, un lien ou une décoration.

**Rouge — deux usages jamais mélangés**
- *Rouge de marque* (`#B32A1E` / `#E23A2B`) : logo, barre sous les titres, tunnel, numéro de soirée. Décor seulement, jamais sur une donnée.
- *Rouge de sens* (`#E5483B`) : défaite (D), blessé, descente (▼), objectif manqué, perte d'argent.
- Jamais pour un bouton d'action.

**Les côtés d'un combat, sur le résumé « Valider la carte » seulement (décision du 08/11)** — les lignes de la carte n'ont pas de dégradé sur les côtés.
- Combat de titre : dégradé **jaune du côté du champion**, rouge en face, tunnel doré au milieu.
- Combat sans ceinture en jeu ni champion : **rouge des deux côtés**, tunnel rouge au milieu.

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
- **Série des 5 derniers combats** : marques octogonales V (vert) et D (rouge), **sans flèche** à côté. **Toujours du plus récent (à gauche) au plus ancien (à droite)**, partout (bannière, listes, effectif) : le combat le plus récent est le premier lu (décision du 08/11).
- **Combats en 5 rounds** : un combat pour le titre, une défense de titre et un combat principal se jouent en 5 rounds (cartes des juges sur 50, par exemple 48-47). Les autres en 3 rounds (décision du 08/11).
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

### Grands tableaux (Effectif, Classements, Contrats, Recrutement, Salles ; Effectif et Infirmerie validés le 21/11)
- **Toutes les colonnes se trient** d'un clic sur leur titre. Le titre trié est blanc, avec ▾ ou ▴. **Exception : les classements**, dont l'ordre ne change pas (09/11).
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

### Écran Messages (R13, T10, Q5a, validé le 09/11)
- **Deux colonnes, pas trois** : la liste des messages à gauche (≈ 520 px), le message ouvert au centre. Plus de colonne de droite.
- Chaque ligne de la liste : point jaune si non lu, titre, auteur et date, étiquette du type (LEÏLA, MÉDECIN, PALIER, PRESSE, RECRUTEUR, AGENT, ORGANISATION).
- Le message ouvert : qui parle, quand, le texte (largeur de lecture 55 à 80 caractères), puis **2 à 4 réponses au plus**, en boutons. La réponse principale est jaune, les autres sont noires avec un bord.
- **Un message important arrête Continuer** : blessure à l'affiche, poids raté, retour du recruteur, offre d'une autre organisation…
- **Un palier de croissance franchi arrive comme un message** (« Palier franchi »), pas dans le fil d'actualité.
- **Retours du 09/11 (première maquette)** : le panneau de gauche s'appelle « Messages » ; pas de mention (« 1 non lu », « Tout est lu »), pas de filtres (Tous, Non lus, À répondre), pas de « Réponse attendue » : **un point jaune suffit** (non lu, ou décision attendue), et ces lignes sont plus blanches. La ligne choisie est octogonale, avec son encadré.
- **Pas d'intitulé « Ta réponse ».** Les boutons sont en bas, simples ; ce qui mène ailleurs (Infirmerie, Ouvrir la carte, Ouvrir le recrutement) est un bouton à part, jamais obligatoire. Un message qui n'appelle pas de décision n'a pas de réponse (une blessure hors affiche : juste le bouton Infirmerie, le même que dans l'Effectif).
- **Chaque message montre ses données** dans des cases : chiffres, frise, bilans, série… Les cases vides se remplissent d'éléments utiles, jamais de décor. Mouvement léger à l'ouverture (apparition, jauges, compteurs).
- **Un message se supprime** (corbeille en haut à droite), **seulement une fois la décision prise** : tant qu'il attend une réponse, la corbeille n'est pas là.
- **Pas de barre de défilement visible** dans les listes et le message ; une jauge prend la place du trait de sa ligne, jamais un trait puis une jauge décalée.
- « Le fil » et « Tes suivis » ne sont pas dans les Messages. Le fil va dans Presse et les suivis dans Recrutement, sauf si tu décides autrement (choix ouvert).

### Continuer (T10)
- Toujours au même endroit : en haut à droite, en bouton jaune.
- Le temps avance **jour par jour** ; la date de la boîte change sous les yeux. Il **s'arrête sur le premier message important**.
- S'il reste une décision qui bloque (un combattant blessé à l'affiche, par exemple), Continuer **le dit et mène à l'écran où l'on règle le problème**, avec la personne déjà sélectionnée (dossier UI/UX). Ce qui peut attendre ne bloque pas.

### Écran Classements (R18 à R21, validé le 09/11)
- **Onglets sous l'en-tête** : Classement · Les meilleurs · Records, puis la ligne des filtres. Le filtre choisi est gardé au retour.
- **Hommes ou Femmes** (sans catégorie) : toutes les catégories du sexe choisi, partout (classement Split, mondial, Les meilleurs). Au classement : les 30 meilleurs d'après leur rang mondial.
- **Split ou Monde (Q20b, tranché le 09/11)** : un seul écran, avec un filtre **Split / Monde** à droite de la ligne des catégories. Pas d'onglets Split et Mondial séparés.
- **Podium** : au classement Split d'une catégorie, le champion a le contour jaune et le tunnel doré, les autres le contour rouge. En vue toutes catégories, contour rouge pour tous et badge C pour les champions. **Au mondial, contour rouge pour tous** ; le tunnel prend la couleur de l'organisation et un champion n'est marqué que par le badge C, même dans les trois premiers. Le rang est écrit dans le logo du jeu (hypothèse pour « le logo sur le n° 1 et le n° 2 »).
- **Couleur des organisations** : chacune a sa couleur, utilisée pour le contour et le tunnel ; dans les tableaux, **le nom de l'organisation seul**, sans couleur ni pastille (rouge = Split ; Garden of Blood violet, MMA Korner bleu, Pure Impact vert d'eau, Ultimate Rim orange, Knuckle Gate acier, Undisputed Cage rose, Fighting Pacific cyan : couleurs proposées). La fiche d'un combattant d'une autre organisation prend le tunnel de son organisation, son **rang mondial** dans l'octogone (doré s'il est champion), et le nom de l'organisation **dans la case « Organisation »** (à la place de « Contrat »), sans étiquette. Ses flèches et le panneau de catégorie suivent **le classement d'où la fiche a été ouverte** : ouverte depuis le mondial (ou pour un combattant d'ailleurs), les 30 premiers du mondial, combattants de Split compris ; ouverte depuis Split, les 30 de Split. Dans le parcours du mondial, un combattant de Split montre aussi son **rang mondial** dans l'octogone (doré s'il est champion), pas son rang chez Split.
- **Tous les onglets de sa fiche parlent de son organisation** : ses combats sont ceux de ses soirées (après son départ pour un ancien de Split), jamais contre un combattant de Split ; Contrat = « Sous contrat avec … », chiffres estimés par la presse, ce qu'il coûterait chez Split ; Échos et Relation (« Rapport avec Split ») adaptés ; Aperçu : « Sous contrat avec … », son prochain combat là-bas, un bouton « Le suivre » au lieu de « Proposer un combat ».
- **Surnoms** : tout combattant classé a un surnom, jamais deux fois le même dans une catégorie.
- **Bas du tableau** : seulement la phrase utile (▲ ▼ ou « les 30 meilleurs… »), pas de légende.
- **Champion** : jamais le mot en toutes lettres dans les tableaux, le **badge C de l'Effectif, en petit**, à côté de l'organisation ou de la catégorie (légende en bas du tableau).
- **Mondial** : « Rang mondial » ; les sept champions des autres organisations sont en tête. Chaque combattant a son organisation, son surnom, sa forme, son dernier et son prochain combat. Les combattants de Split ont un trait jaune.
- **Tableau** : pas de tri au clic sur les titres de colonnes (retour du 09/11) ; l'ordre est celui du classement. Chaque ligne a sa forme, son dernier combat et son prochain combat, jamais vides. 30 classés par catégorie.
- **Les meilleurs** : vitrine de 8 cadres, qui s'anime à l'ouverture (chiffres qui montent, barres qui se remplissent). Seul l'essentiel : la mesure, la valeur, le nom du meilleur, le 2e et le 3e ; un clic sur le cadre ouvre la liste complète, un clic sur un nom ouvre la fiche (Q19a).
- **Records (Q21a)** : un seul onglet, quatre familles. Chaque record dit qui, quand et ce qu'il devient ; les soirées donnent leur combat principal (tiré de l'historique du combattant). Pas de phrase « avant ton arrivée ».
- **Fiches de staff** : un ancien devenu consultant, entraîneur, commentateur, agent ou gérant de salle ouvre une fiche à lui : son rôle et ses dernières semaines (avec une couleur de ton), sa carrière en frise et ses records, sa relation avec Split, ce qu'il pense d'un combattant de Split, ce qu'il peut t'apporter et une action.
- **Noms** : jamais le nom d'un vrai combattant (« Arman Tsarukyan » retiré de la liste d'adversaires de la fiche).

### Écran Recrutement (R23 à R25, Q24, Q25a, Q25b, validé le 09/11)
- **Un seul écran**, à la place de « Contrats » dans la barre (hypothèse : les contrats de Split se gèrent dans la fiche et par le message de fin de contrat, Q23b, Q23c). Onglets : Combattants · Recruteur · Rapports (R26, validé le 15/11).
- **Pas de « Tes suivis » ici** (retour du 09/11) : « Suivre » reste sur la fiche courte ; leur place est à décider (aperçu de l'Accueil).
- **Filtres** : Hommes / Femmes et catégories à gauche, **Libres / Fin de contrat / Tous** à droite (Q24). Gardés au retour.
- **Un marché varié** (retour du 09/11 : « toujours les mêmes ») : fins de contrat tirées du classement mondial, libérés après des défaites, vétérans (ex-n° X mondial), anciens champions, champions de petites organisations, espoirs invaincus non classés. Jamais deux fois le même nom ; la série colle au palmarès. Arrivé sur le marché depuis moins de dix jours : le mot « Nouveau », petit et gris, après le surnom (pas de point jaune, réservé à « non lu » et « à toi d'agir », 09/11).
- **Tableau** en lignes octogonales triables ; la ligne choisie porte son encadré. **Fiche courte à droite** : situation, palmarès, rang, gabarit, trois dernières victoires, style seulement s'il a été vu (sinon « Envoyer le recruteur »), ce qu'il demande, son agent et son caractère.
- **Négociation**, par-dessus l'écran :
  - un bandeau : lui, **« Où vous en êtes »** (une règle Loin · À discuter · Proche · Accord, le curseur glisse après chaque réponse, tes offres en pastilles, la dernière en rouge), et **son agent** (initiales, caractère, humeur en une phrase colorée) ;
  - **ton offre** : bourse, combats, prime de victoire, prime de signature, puis **ses demandes** ; sous chaque levier, ce qu'il demande (repère blanc sur la barre) ; vert quand tu l'atteins ; ce qu'il vient de lâcher s'affiche « ▼ 1 000 € » en vert ;
  - **la discussion** (retour du 09/11 : « plus lisible ») : ton offre à droite, encadrée, en une ligne (« Toi · offre 2 ») ; sa réponse à gauche, avec son nom, sa phrase, puis **« D'accord sur : … »** en vert et un petit tableau **Il veut / Tu proposais** pour ce qui reste à régler ; il « lit ton offre » un instant (points animés) avant de répondre.
  - **de vraies options** (retour du 09/11 : « pas accepter que ce qu'il veut ») : « Faire cette offre », « Prendre ses chiffres », « Plus tard » (pas de « Couper la poire en deux », retiré le 09/11). L'agent fait des compromis sur l'argent **et sur le nombre de combats**, et un levier plus généreux peut en compenser un autre.
- **Ses demandes (retour du 09/11 : « tout le monde veut sa place pour le titre »)** : 1 à 3 par combattant, selon son profil, parmi ce qu'un combattant négocie vraiment (retour du 09/11 : « pas réaliste ») — chance au titre (seulement le top 10, ou un ancien champion), tête d'affiche d'une soirée dans l'année (top 15), au moins trois combats par an, pouvoir partir après six mois sans combat, garder ses propres sponsors, le voyage et l'hôtel pour trois personnes de son équipe, ne jamais affronter un combattant de sa salle, pouvoir faire un combat de boxe anglaise ailleurs, combattre une fois dans son pays, pouvoir changer de catégorie. Chacune a un poids : **Il y tient** (non négociable, sauf à payer très cher), **Ça compte**, **Un souhait**. Tu t'engages ou non (« T'engager »). L'agent peut **renoncer** à un souhait, puis à ce qui compte (barré, « Il y renonce » en vert) ; jamais à ce à quoi il tient. Le mot « promesse » n'apparaît jamais.
- **Règles des échanges** : le caractère de l'agent fixe le nombre d'offres (2 à 4) et la taille de ses pas ; il ne bouge pas si tu refais la même offre ; il ne descend jamais sous un plancher ; il prévient avant la dernière offre. **Une négociation rompue reste close deux mois**, même après « Plus tard » ou en rechargeant. Accord = **confirmation en chiffres** (charte S6).
- **Fiche d'un combattant du marché** : Contrat = sa situation et ce qu'il demande ; Statistiques cachées tant que personne ne l'a vu (Q25b) ; un libre a le tunnel gris et « Libre » dans la case Organisation.

### Écran Résultats et lendemain (R29, R30, R40, R41, Q30, Q40, Q41, validé le 10/11)
- **Un seul écran, deux onglets** : Résultats · Le lendemain. Le lendemain reste consultable ici (R41) ; il porte l'octogone jaune qui pulse tant qu'il n'a pas été ouvert. Il n'existe que pour la dernière soirée.
- **Les soirées** à gauche : nom, date, ville · salle, combat principal (C du champion pour un titre). « Tes soirées » puis « Avant toi ».
- **Bandeau** : la soirée (tunnel doré pour un titre), une case « L'enjeu » (avec la ceinture : « X devient champion » / « garde sa ceinture ») et une case « Le public ».
- **Chaque combat sur une ligne, comme une affiche** : V vert et vainqueur à gauche (nom souligné, surnom dessous), la méthode au centre dans une case (« SOUMISSION / 4e round · 3:12 », ou « DÉCISION PARTAGÉE / 29-28 · 28-29 · 29-28 »), le perdant en gris à droite ; une flèche ▲ / ▼ seulement quand le rang bouge ; catégorie et rounds ; les primes en médailles.
- **Le relevé d'un combat** s'ouvre par-dessus la liste :
  - les **juges en tableau** (un round par ligne, un juge par colonne, le nom du gagnant du round dans la case : blanc pour le vainqueur du combat, gris pour l'autre), le round de la finition « non noté », les rounds non disputés ; le score de chaque juge et une phrase (« 2 juges sur 3 donnent la victoire à… », « Avant la fin, X menait sur 2 cartes sur 3 ») ;
  - les **frappes significatives round par round** en colonnes ;
  - **les statistiques en tuiles**, chacune avec sa forme : frappes significatives (tête, corps, jambes), précision des frappes en jauges octogonales, amenées au sol et tentatives de soumission en pastilles, temps de contrôle sur la durée du combat, knockdowns ;
  - **termes du MMA** : frappes significatives, temps de contrôle, amenées au sol, tentatives de soumission, knockdowns ;
  - Revoir (l'arène) et Le récit, en haut ; combat précédent / suivant.
- **Le lendemain, sur un seul écran sans défilement** : trois moments (la ceinture, la finition, le combat de la soirée) avec deux phrases et « Voir le combat › » ; le classement qui a bougé (rang avant → après, champion en or, rang mondial) avec un lien vers les Classements ; « On en parle » (la une, deux voix, les vestiaires) ; « La soirée » (public, recette, dépenses détaillées, ce qu'il te reste, popularité, les primes de chacun, tes blessés).
- **Mouvement** : lignes qui arrivent l'une après l'autre, flèches et médailles qui apparaissent, jauges et barres qui se remplissent, compteurs ; tout s'arrête avec `prefers-reduced-motion`.
- Après la soirée, **les autres écrans suivent** (Classements, fiches, en-tête « Split Fight Night 64 »).

### Écran Recruteur et Rapports (R26, Q26a à Q26d, T10, validé le 15/11)
- **Onglet Recruteur** : le tableau du marché, **un chiffre par case** (destination et villes, spécialités, distance de Lyon, billet aller-retour, bourse demandée), triable ; filtres par région (Europe de l’Ouest, Europe de l’Est et Asie centrale, Asie et Océanie, Amériques, Afrique). Les colonnes ne changent pas avec la durée.
- **Panneau de droite** : le pays sur le tunnel gris du jeu, sa scène en une phrase, ses spécialités, trois cases (le voyage, la bourse demandée en moyenne, la date de retour avec le nombre de profils), la durée **3 / 7 / 14 jours = 2 / 4 / 6 profils**, et « Envoyer Marco ». En voyage : où il en est, retour, profils, coût.
- **Prix** : billet selon la distance depuis Lyon + 280 € par jour (route comprise) + interprète là où Marco ne parle pas la langue. Rien d’autre ne change le prix ; la chance d’une pépite est la même partout.
- **Spécialités** : neuf styles communs (boxe anglaise, kickboxing, muay-thaï, karaté, taekwondo, lutte, judo, sambo, jiu-jitsu brésilien) et quelques styles propres à un pays (boxe française, lutte sénégalaise, lutte mongole, sanda, lutte universitaire, karaté Kyokushin, lutte gréco-romaine). Deux ou trois par pays, selon sa réputation. Toujours « muay-thaï », jamais « boxe thaï ».
- **Messages** : le départ (où, quand, coût détaillé, ce qu’il cherche), puis au retour **un condensé** qui arrête Continuer : une ligne par profil, l’avis de Marco, la bourse demandée, et « Lire le rapport ».
- **Onglet Rapports** : pas de bandeau. À gauche le voyage et ses profils dans l’ordre de Marco ; à droite un seul profil : son nom sur le tunnel du jeu, **l’avis de Marco en un mot** (Coup de cœur, À signer, Intéressant, Solide, À suivre, Pas encore prêt, Un pari, À revoir, Pour dépanner) avec une phrase, trois cases (ce qu’il demande, combien de fois Marco l’a vu et où, son gabarit), **Ses points forts / À surveiller** (trois lignes au plus chacun), puis Faire une offre.
- **Profils variés** : jeunes pros invaincus, champions de circuits locaux, venus d’un autre sport, invaincus dans leur pays contre des adversaires faibles (faux bons profils), combattants expérimentés, profils avec peu de combats officiels. Jamais deux fois le même parcours plus de deux fois dans un voyage, ni un nom déjà pris.
- **Textes de Marco** : factuels, comme un rapport de recruteur. **Jamais de phrase romancée** (« lui s’en fichait », dîners, scènes). Pas de prédiction de classement chez Split.
- **Tous ses rapports** : la colonne de gauche liste les voyages (pays, date, durée, coût, profils, à signer, signés) ; un clic ouvre le rapport.
- **La fiche d’un profil ramené** : statistiques visibles (Q25b), traits selon son parcours, « Libre, sans contrat », mondial « — », onglet Relation propre (sa carrière, son entourage, ses objectifs, son bilan par année).
- **Mouvement** : tunnel qui glisse, cases qui apparaissent l’une après l’autre, chiffres qui défilent, lignes qui se décalent au survol.

### Écran Camps (R27, Q27a à Q27c, validé le 15/11)
- **Plus de tableur** (retour du 15/11) : les salles en **cartes**, rangées en **trois rayons par taille** : grandes écuries (25 combattants ou plus, grandes cartes, deux par ligne), salles (8 à 24, trois par ligne), clubs (moins de 8, petites cartes, quatre par ligne). Trois octogones (●●● ●● ●) répètent la taille sur chaque carte et chaque titre de rayon. Pas de podium (trop proche des Classements).
- **Deux vues, à droite de la ligne de filtres** : **Split** (par défaut : les salles où s’entraînent tes combattants) et **Le monde** (les 240 salles, en vivier). À gauche : la taille (Toutes, Grandes écuries, Salles, Clubs), **un seul tri, « Rang »**, avec une icône croissant / décroissant (en décroissant, les rayons s’inversent aussi et la liste revient en haut), et un menu **« Spécialité »** (huit spécialités, avec le nombre de salles). Filtres gardés au retour.
- **Carte Split** : taille, spécialité (étiquette), « ▲ monte » / « ▼ descend », nom, ville, le nombre de tes combattants « avec <entraîneur> », **un octogone par combattant** (jaune à l’affiche, rouge blessé, gris sinon), puis à l’affiche, blessés, bilan 2026. **Carte Le monde** : rang (▲ / ▼ seulement s’il bouge), champions, classés, bilan, combattants chez Split ; trait jaune quand Split y a des combattants.
- **Un clic sur l’étiquette de spécialité** remplace le milieu de la carte par **sa statistique** (rien ne se superpose), avec une jauge face à la moyenne mondiale. Une statistique différente par spécialité : amenées au sol (lutte), victoires par soumission (jiu-jitsu brésilien), précision à la tête (boxe anglaise), coups de pied (kickboxing), frappes au clinch (muay-thaï), clés de jambe (sambo), projections (judo), frappes encaissées (karaté, « moins, c’est mieux »).
- **Panneau de la salle (Split)** : tunnel gris, trois cases (tes combattants sur le total de la salle, à l’affiche le 16 février, victoires-défaites 2026), l’entraîneur et la statistique de la spécialité, **« En 2026 »** (arrivées, départs, nouvel entraîneur, changement de taille, datés), puis **ce que fait chacun de tes combattants** : « 16 févr. contre X », « adversaire à trouver › » en jaune (mène à la carte), « Blessé, retour… », « Disponible ».
- **Panneau Le monde** : rang, champions en titre, classés du top 15, ses meilleurs combattants, et « Envoyer Marco … › » vers le Recruteur (avec le prix de 7 jours sur place).
- **L’entraîneur** est souligné partout ; un clic ouvre **son portrait** à la place du panneau, **sans liste de combattants** : âge, depuis quand il dirige la salle, champions en titre chez lui, ce qu’il faisait avant (et son bilan s’il a combattu en MMA), son parcours de salle en salle, **son équipe** (quatre adjoints dans une grande écurie, trois dans une salle, zéro ou un dans un club), sa salle en 2026. Retour ou le nom de la salle ramène au panneau.
- **Ce qui bouge** (Q27b, « réalisme ») : une salle monte ou descend d’une taille (« Devenue grande écurie : 21 combattants il y a un an, 25 aujourd’hui ») ; des combattants de Split changent de salle ; une salle change d’entraîneur (l’ancien part adjoint ailleurs). Le classement des salles est revu chaque mois.
- **Vérifié avec la vraie vie** : 240 salles dans le monde entier (10 % en France ; les pays pèsent comme dans l’effectif de l’UFC, États-Unis et Brésil devant) ; un tiers des combattants de Split en France, les autres partout ; environ 1,3 combat par combattant et par an ; une salle gagne au mieux 6 combats sur 10 ; 5 champions en titre au plus par salle. Les classés viennent des Classements, les combattants de Split de l’Effectif ; la fiche (onglet Relation) lit la salle et l’entraîneur de cet écran.
- **Retirés** : le carrousel, « S’ils se battent, ils le prennent mal », le tableau, l’onglet Entraîneurs, les « champions formés ». L’effet du camp sur la forme n’est pas affiché (donnée cachée).

### Écran Finances (R31, Q31, validé le 15/11)
- **Trois onglets** : La caisse · Les bourses · Les primes (section « Les primes », validée le 21/11). Pas de budget imposé (Q31) : l’argent disponible dépend des soirées et des bourses.
- **Bandeau sur le tunnel** : En caisse, puis trois ou quatre chiffres (En 2026, Découvert autorisé, Préventes de la prochaine soirée avec leur jauge ; dans Les bourses : sous contrat, bourse moyenne, versé en 2026, la plus haute, fins de contrat). **Chaque bloc a la même structure et se centre dans la barre** : étiquette, chiffre, ligne du dessous, à égale distance, alignés d’un bloc à l’autre (retour du 15/11).
- **Le solde** : une seule courbe, en escalier, une marche par soirée (verte si elle rapporte, rouge si elle coûte), sans prévision ; repère « aujourd’hui », la prochaine soirée en pointillé. Sous la courbe, une case par soirée (de la plus ancienne à la plus récente, dans le sens de la courbe) avec ce qu’il te reste ; la prochaine dit « dans 35 jours ».
- **Le détail d’une soirée** : le tunnel rouge (doré pour un titre), ce qu’il te reste ; Recettes (billetterie, diffuseur, partenaires, bar, boutique, VIP) et Dépenses (bourses fixes, primes de victoire, primes de performance en médailles, salle et production), chacune avec sa jauge ; puis **ce qui a changé depuis la soirée d’avant** : les deux plus gros écarts, en effet sur ce qu’il te reste, avec leur raison (« 2 780 spectateurs de moins qu’à Lyon », « sans Parfait Nana, 120 000 € à la 56 »). « Voir les résultats › » ouvre la soirée dans les Résultats.
- **La soirée à venir** ne montre que le signé et le vendu (préventes, diffuseur, partenaires, bourses des combats composés, salle) et tes primes, **sur une seule ligne** (retour du 15/11), avec « Modifier › », qui ouvre l'onglet Les primes.
- **Les bourses** : une carte par catégorie, **du plus léger au plus lourd**, sans bouton de tri (retour du 15/11) ; filtre Hommes / Femmes gardé au retour. Chaque carte : bourse moyenne par combat, versé en 2026, la bourse la plus haute et son nom. Panneau : combats en 2026, fins de contrat, les bourses les plus hautes, puis le dernier combat sous contrat de chacun avec « Prolonger › » (fiche, onglet Contrat).
- **Données** : les soirées et leurs combats viennent des Résultats, les bourses des contrats de l’Effectif (moitié fixe, moitié à la victoire). Après la soirée, la 63 reprend les chiffres du Lendemain. Ordres de grandeur vérifiés (billetterie de l’UFC Paris, bourses de Bellator) ; diffuseur, partenaires, bar et salle sont des hypothèses. Pas de frais fixes (absents du jeu).
- **Mouvement** : courbe qui se trace, marches et octogones qui apparaissent, chiffres qui défilent, jauges qui se remplissent.

### Écran Organisation (R32, R33, Q32a, Q32b, Q33a, Q33b, validé le 16/11)
- **Deux onglets** : Les huit · La croissance. Poste et Carnet (R34, R35) viendront plus tard.
- **Bandeau sur le tunnel** : Ta place (6e des huit, flèche et place un mois plus tôt), Juste devant (nom cliquable, avec le chiffre qui suffit pour la passer, calculé sur le vrai rang), Juste derrière (et l'écart), Fin de saison (le rang fixe le diffuseur et les agents libres).
- **Les huit en colonnes**, de la 1re à la 8e : tunnel à la couleur de l'organisation, emblème (les trois octogones du logo, recolorés), place et flèche, nom et ville ; Split ressort en rouge.
- **Quatre mesures, chacune avec son unité** (retour du 16/11 : « Public », « Vedettes », « Classés » ne se comprenaient pas) : **Spectateurs** (par soirée), **Record** (spectateurs), **Top 5 mondial** (combattants), **Top 30 mondial** (combattants), avec une jauge comparée à la meilleure des huit. Le rang additionne les places sur les quatre, le public départage ; il est revu chaque mois.
- **Bas de colonne** : des faits, pas de formules (retour du 16/11) : « Dernière soirée », date et ville, spectateurs.
- **Le détail d'une organisation** s'ouvre par-dessus les colonnes, **sans cadre rectangulaire autour de l'octogone** (retour du 16/11 : les colonnes sont masquées) : bannière, place, croix ; « Ce qui a bougé » (place d'il y a un mois, puis un fait daté) ; les quatre mesures en tuiles avec la valeur de Split ; diffuseur et salles ; ses cinq meilleurs classés (noms vers la fiche) et « Classement mondial › ».
- **La croissance** : six pistes à gauche (marche actuelle, avancée, la plus proche) ; à droite la piste choisie : escalier de quatre marches (« Tu es ici », « Prochaine marche »), ce que Split a aujourd'hui, les conditions en gros chiffres avec le visuel qui convient (jauge, place sur huit, rang sur le top 10, dépendance vers une autre piste), ce que ça donne et un bouton vers l'écran concerné.
- **Dates** : on est le 12 janvier 2027 ; flèches comparées au 12 décembre ; fin de saison le 31 déc. 2027.
- **Données** : top 5 et top 30 comptés dans le classement mondial des Classements ; le public et la dernière soirée de Split viennent des Résultats ; les chiffres des sept autres sont inventés à l'échelle réelle (UFC, Oktagon, PFL) et leurs raisons de mouvement sont « à relire ». **Ouvert** : Split est 6e avec ces données, alors que l'Accueil affiche « 2e ».

### Ta carrière (R34, R35, Q34a, Q34b, Q35a, Q35b, validé le 16/11)
- **Poste et Carnet fusionnés** en « Ta carrière », troisième onglet de l'écran Organisation (après Les huit et La croissance), sans entrée de plus dans la barre.
- **Rien n'est compté comme fait si le joueur ne l'a pas fait** : il arrive le 4 janvier 2027 ; 0 soirée, 0 signature avant la première soirée. L'historique de l'organisation est à part (« Split avant toi »).
- **Bandeau** : Ton poste (Matchmaker, depuis le 4 janv., en jours), Ton contrat (fin, durée, salaire), Ta réputation (cinq niveaux en octogones, aucun avant la première soirée), Ta première soirée, Le patron (son humeur, son nom, le bilan de mi-saison du 1er juillet).
- **Objectifs 2027 du patron**, jugés le 31 déc. : l'intitulé, puis sur une ligne la place visée et la tienne (huit places, top 10 mondial ou jauge) et une phrase concrète (« Il faut passer… », « Le mieux classé : … »). Règle affichée : manqués, un avertissement ; manqués encore la saison suivante, le renvoi (Q34a).
- **Ton parcours** : trois chiffres (soirées, combats placés, signatures) puis les événements datés depuis l'arrivée, une ligne chacun, qui ouvrent l'écran concerné.
- **Split avant toi** : soirées depuis 2004 sous le prédécesseur, champions, record, salles pleines ; « Les soirées › » vers les Résultats.
- **Défis** : cinq paliers de neuf ; le suivant s'ouvre quand le précédent est fini (Q35a). Le palier ouvert suit l'état réel ; un défi à faire une fois dit « À faire » (pas de « 0 / 1 »), un défi à compter a sa jauge. Les paliers fermés se consultent, avec un cadenas.
- **Grande salle** (Q35b) : une arène de 15 000 places ou plus, comme les grandes soirées de l'UFC ; défi du palier 3.
- **Ouvert** : Messages et l'Accueil disent « Rester dans les deux premières » ; ici « Finir la saison dans les quatre premières » (Split 6e). À aligner. Combien d'objectifs manqués déclenchent l'avertissement : à trancher.

### Écran Calendrier (R29, Q29a, Q29b, Q21c, T9, validé le 17/11)
- **Six mois à la fois** (« Janvier – juin 2027 »), flèches pour les six mois d'avant ou d'après, de janvier 2026 à décembre 2027. Les jours des mois voisins ne sont pas affichés (« trop d'information ») ; la hauteur d'une semaine s'ajuste pour remplir la case d'un mois.
- **Légende au-dessus, seulement les repères présents** : aujourd'hui (anneau blanc), ta soirée (octogone rouge), ceinture en jeu (octogone doré), jouée (gris), fermé (une seule zone hachurée), rendez-vous (trait sous le chiffre). **Le jour choisi est en blanc cassé, texte noir**, comme l'élément courant du jeu. Pas de couleurs d'autres organisations (retour du 17/11).
- **Chaque soirée a sa ligne sous son mois** : la date dans un octogone à la couleur de la soirée, le nom, la ville. Une soirée jouée se lit par son résultat (« Nana bat Darras »).
- **Noms** : « Fight Night 63 », comme l'en-tête, avec l'affiche « Nana vs Mezouar » ; « Soirée phare » remplace « grande soirée », numérotée « Split 1 », une par mois, une ceinture en jeu (proposition).
- **Règles proposées** : poser ou retirer une soirée **au moins 10 semaines avant** (le temps de vendre les places ; billetterie ouverte à ce moment-là) ; **au moins 3 semaines entre deux soirées** (le plus court écart de Split en 2026 est de 24 jours), donc deux soirées au plus par mois. Retirer coûte une part de la location : rien au-delà de 180 jours, 20 % de 91 à 180, 50 % de 70 à 90. Un jour fermé dit pourquoi et donne la première date libre.
- **À droite, la soirée choisie** : en-tête sur le tunnel (doré pour une ceinture), trois cases (places, préventes, billet), l'enjeu, la carte principale et les préliminaires, la semaine du combat, puis le retrait (possible ou non, avec le coût) et « Ouvrir la carte ». Une soirée à composer : billetterie, location, « Le même soir » (texte), la salle la dernière fois, les plus longtemps sans combat.
- **Poser** : un clic sur un jour libre ; le genre, la salle (places, dernière soirée de Split, location), le nom qu'elle prendra, « Poser la soirée ». **Retirer** : confirmation en chiffres (date, salle, coût, ensuite).
- **Un jour à rendez-vous** : le mois dans l'ordre (rendez-vous, soirées, autres organisations), ce jour en blanc, avec les liens.
- **En bas** : Tes soirées en 2027, Première date libre, Bilan de mi-saison (1er juil.), Fin de saison (31 déc.).
- **Inventé, à relire** : la 64 posée par le prédécesseur le 2 déc. 2026, la conférence de presse et la pesée, les soirées des autres organisations. **Écarts ailleurs** : 4 000 ou 4 200 places à la 63, ceinture gardée ou prise à la 56, soirées 62 et 63 un mardi.

### Écran Ceintures (R22, T4c, Q22a à Q22c, validé le 18/11)
- **Un onglet des Classements** : Classement · Ceintures · Les meilleurs · Records, avec la même ligne de filtres (Hommes, Femmes, catégories), gardée d'un onglet à l'autre. **Ceintures quitte la barre**, comme Préliminaires a rejoint la Carte.
- **Hommes ou Femmes sans catégorie** : une carte par champion, sur le tunnel doré : catégorie et poids, le C, prénom « surnom » en texte courant, le nom, puis palmarès · rang mondial et « 9e champion de la lignée ». Dessous : le prochain défi (combat signé, ou « Rien de prévu » et le n° 1) et le dernier combat pour le titre (date, il y a combien). Femmes : quatre cartes larges, avec les trois championnes d'avant.
- **Une catégorie : la lignée en frise datée**, un trait par règne à l'échelle du temps : gris (un règne), doré (en titre), hachuré au-dessus (intérim), pointillés (vacante), octogone doré (prochain défi). Légende des seuls repères présents. Chaque champion au-dessus ou au-dessous, en alternance, sans chevauchement : nom, dates, défenses (et intérim), fin du règne. **Pas d'axe des années.** Textes de 18 px au moins.
- **Pas de doublon avec le Classement** : le règne en cours ne répète ni ses défenses ni sa durée (à ajouter au Classement, R22).
- **Le prochain défi** : bandeau doré pour un combat signé (date, soirée, salle, 5 rounds, « Ouvrir la carte »), tunnel éteint pour « rien de signé » (le champion face au n° 1, « Proposer le combat »). À droite : leur dernier combat ou le dernier combat pour le titre, puis les n° 2 et 3 avec leur état. Les deux côtés partent de la même hauteur.
- **Un ancien champion** a sa fiche courte, tirée de la lignée : ce qu'il fait (à relire), son parcours, sa ceinture (la prise, la fin), toute la lignée avec sa place, « Voir la lignée ».
- **Règles réelles** : pas de délai de défense affiché (l'UFC n'en a pas ; ses grands champions défendent tous les 6 à 9 mois). Intérim rare (aucun chez les femmes), quand le champion ne peut pas combattre des mois ; l'intérimaire réunifie ou est promu. Refuser de défendre fait perdre la ceinture. Aucun règne au-delà de 40 mois (Zaïtsev), aucune série au-delà de 5 défenses (Garcia-Roy).
- **Données** : la fiche de Nana prime pour la 56 (ceinture prise à Belkacem) ; en 2026, ceinture en jeu aux soirées 56, 59 et 62 seulement, donc cinq champions sans défense depuis plus d'un an. Le dernier combat des champions est leur dernier combat pour le titre, et leur fiche le marque. Anciens champions et adversaires des défenses inventés, à relire.
- **Mouvement** : tunnel qui glisse, C qui se pose, carte qui se soulève au survol ; traits qui se tracent, reflet sur le règne en cours, prochain défi qui pulse ; combattants qui arrivent de leur coin, VS qui se pose, nombres qui défilent.
- **Écarts repérés, à aligner** : Résultats de la 56 (« gardée »), « qu'il avait battu en 2025 » (Résultats, Calendrier), autres combats pour le titre absents des Résultats 56, 59, 62, champions de 22-23 ans face au record du plus jeune champion (25 ans), numéros de soirée des Records.

### Écran Presse (R28, Q28a, Q28b, Q13, Q10c, validé le 18/11)
- **Trois onglets**, trois façons de lire la presse : À la une · Les défis · Le fil.
- **À la une** : l'article du moment sur le tunnel (doré pour un titre), avec trois faits datés ; « Tes combattants dans la presse », une ligne chacun avec **Salué** (vert), **Critiqué** (rouge) ou **Cité** (gris), le média et la date ; les trois médias présentés (ce qu'ils sont, leur public, un autre article) ; le pronostic des lecteurs (qui gagne, en % des votes, jamais une note du combat, H1).
- **Les défis** : qui réclame qui, la phrase exacte, sa source et sa date, puis ce que la carte permet : « Possible » (blanc, place vide) avec « Placer sur la carte › », « Signé » (vert), « Déjà à l'affiche » (gris), blessé (rouge, avec la date de retour). Un clic sur la ligne ouvre l'article.
- **Les envies du public** (Q28b) : un seul encadré, pour une très grosse affiche seulement (ici champion contre champion), avec le sondage et la condition qui la rend possible.
- **Le fil** (Q13) : tout ce qui s'est écrit, par jour, filtres par sujet (Split, ta soirée, tes combattants, ailleurs) et par média, gardés au retour ; la ligne choisie comme dans les Messages. L'article : média, titre, chapeau, signature, texte, trois faits, les autres médias sur le sujet, une action. Liste vide : une phrase et les boutons qui défont le filtre.
- **Précision d'un vrai média** : le geste et le temps d'une finition (« coude au sol, à 0:50 du 1er round »), les cartes des juges d'une décision. Retirés : « attend depuis 15 mois », le nombre de nouvelles, les envies du public pour n'importe quel combat.
- **Pas de doublon avec les Messages** : un article déjà annoncé par message est une ligne du fil, avec « Le message ».
- **Médias** : Cage Hebdo, Tableau Noir, Le Forum gardés pour l'instant ; « Le Forum » se confond avec le Forum de Lille (propositions de noms dans comparaison.html). Le jeu a dix médias dans ses données : le sort des sept autres reste à décider.
- **Mouvement** : tunnel qui glisse et reflet, chiffres qui défilent, jauges des pronostics, combattants qui arrivent de leur coin, lignes qui se décalent au survol.

### Écran Arrivée (R1 à R4, point tranché n° 8, validé le 19/11)
- **Une ouverture courte, puis trois étapes** : tunnel qui s'ouvre sur « Bienvenue chez SPLIT · Split t'embauche comme MATCHMAKER » (3,9 s, un clic la passe, absente en mouvement réduit), puis Split · Ton contrat · Tes espoirs, en onglets cochés au passage. Pas de barre latérale ; le bouton jaune de l'en-tête nomme l'étape suivante (« Ton contrat », « Tes espoirs », « Entrer chez Split »). Retour et Avant suivent les étapes.
- **Split** : bandeau sur le tunnel (SPLIT, Lyon · depuis 2004 ; Ton poste : MATCHMAKER, depuis ce matin) et **quatre cases, un thème chacune**, tirées des autres écrans : place au classement et son point faible (la mesure du classement des huit où Split est le plus mal placé), caisse au 4 janvier (Finances), places vendues en 2026 (une jauge), combats pour un titre en 2026 (12 octogones, pleins = ceinture mise en jeu, vides dessinés en entier). Un libellé sur une ligne, un sous-titre, rien qui déborde.
- **Le fil « Split en bref »** sous le bandeau, sur toute la largeur, détaché (fond plus clair, trait opaque, étiquette blanche) ; le tunnel s'arrête net au-dessus. Il ne répète rien des cases et **tient en entier quand il ne défile pas** (mouvement réduit) : trois nouvelles au plus.
- **Dessous** : « Ta première soirée » (date, salle, combat principal, carte, préventes, billet) et « Ton équipe » (Vasseur, Leïla, Marco, Dr Roux, avec leur état).
- **Ton contrat** fusionne contrat et « Ce qui manque » : à gauche poste, durée, salaire, bilan du 1er juillet, réputation, la phrase du patron ; à droite les objectifs de la saison (aujourd'hui, ce qu'il veut, ce qui manque, encadré à bord jaune).
- **Tes espoirs : 2 sur 6**, en cartes sans histoire : catégorie et âge, état, prénom « surnom », nom (ouvre la fiche), palmarès, série, rang Split et mondial, art et style, **une particularité** chiffrée, le contrat, Choisir. Le nom choisi vole vers sa case du bandeau. Un troisième choix ou « Suite » à moins de deux est refusé (message et case vide qui tremble). **La fiche s'ouvre par-dessus sans quitter l'étape.**
- **La fin** : l'Accueil du 4 janvier (cinq messages du jour, dont celui de Leïla qui nomme les deux espoirs, « Tes suivis » = les espoirs choisis) ; Continuer mène au 12 janvier, l'Accueil validé, sans le changer. Le prédécesseur n'apparaît que dans l'histoire de l'organisation.
- **Mouvement** : tunnel qui respire, reflet, logo qui luit, chiffres qui défilent, visuels qui se posent, fil qui défile (pause au survol), bandeau qui change de hauteur d'une étape à l'autre ; tout s'arrête en mouvement réduit.
- **Écarts repérés, à aligner** : objectifs de l'Accueil (2e, top 10 / n° 14) et de Ta carrière (4e, top 5) ; message du patron daté du 5 janvier ; « 2 combats placés » (Ta carrière) face à Nana–Mezouar déjà annoncé ; blessure de Rizzo (28 déc. ou « hier ») ; fiche générée de Petrov ; messages du 4 janvier absents de la boîte ; combats pour un titre hors combat principal absents des Résultats.

### Présentation et face-à-face (R10, Q10a à Q10c, validé le 20/11)
- **Deux écrans d'un même combat**, ouverts par les boutons Présentation et Face-à-face du combat ouvert sur la Carte ; onglets Présentation · Face-à-face sous l'en-tête, plaque « Carte ». À droite : la place du combat (« Co-principal · 16 févr. · Forum de Lille ») ou « Placer sur la carte » pour une paire pas encore placée. Retour et Avant suivent chaque pas.
- **Pas d'écran à part pour les dossiers de Leïla** (retiré le 20/11) : la Carte validée garde son encadré.
- **L'affiche**, commune aux deux : le tunnel du jeu **centré sur le VS**, doré pour une ceinture ; **contour de l'affiche et du VS doré pour un titre, rouge sinon**. Prénom « surnom » et rang, nom en très grand, palmarès et série, trois cases : mondial, âge, art (présentation) ou mondial, taille, allonge (face-à-face). Au milieu : date et salle, VS, catégorie et rounds. À l'ouverture : tunnel qui avance, combattants qui entrent de leur coin, VS qui tombe avec un éclair, reflet.
- **Présentation, trois cadres** : **l'enjeu** (titre du combat, la phrase de la Carte, leur histoire en frise datée, ce qui fait le combat, trois cases : classement ou ceinture, déjà affrontés, bourses ou demande ; il tient sans défilement) ; **victoires et défaites**, centrées, en papillon (% avant la limite en grand, puis KO, TKO · Soumission · Décision pour les victoires en vert comme pour les défaites en rouge ; l'arrêt du médecin compte en TKO) ; **la presse** : les trois médias présentés, chacun avec sa couleur d'identité (décor), son pronostic pour un combat annoncé, ce qu'il a écrit sur eux sinon.
- **Face-à-face** : les chiffres comme la première version : la valeur, sa barre vers l'extérieur avec le **repère blanc de la moyenne de la catégorie**, la mesure au milieu ; **le meilleur des deux en blanc avec un point jaune** (variante : la valeur en vert, Q10b), légende dans le titre. Pas de « sur 22 et 16 combats », pas de phrase sous le tableau, pas de gabarit. À droite : leurs trois derniers combats et leurs adversaires communs.
- **Données** : historiques et statistiques de la fiche, carte du 16 février, articles et défis de la Presse. Les historiques des hommes sont rendus cohérents entre fiches (un combat contre un combattant de Split figure dans les deux fiches, à la même date) ; à reprendre dans `fiche.js` (T8).
- **Ouvert** : les noms des médias (Q10c) ; les couleurs des médias (bleu, blanc, violet) sont une proposition ; R7 à R9 (dossiers de Leïla) restent à traiter dans la Carte.

### Soirée en direct, temps forts, résultat, discours, bilan (R36 à R39, Q36a, Q36b, Q37a à Q37c, Q38, Q39a, Q39b, validé le 21/11)
- **Un écran « Soirée », des pas** : la soirée, un temps fort, le résultat, le discours, le bilan, le récit ; Retour et Avant suivent chaque pas. **Le bouton jaune de l'en-tête nomme l'étape suivante** (Regarder, Le résultat, Le discours, Combat suivant, Fin de la soirée, Le lendemain). La barre latérale s'efface pendant un temps fort, un résultat et un discours.
- **La soirée en direct** : l'affiche validée de la présentation pour le prochain combat ; la carte dans l'ordre où elle se joue (préliminaire 1 d'abord, le prochain encadré), avec Complet · Temps forts · Résultat par combat (gardé) ; la salle vue du dessus qui se remplit ; l'ambiance en un mot et cinq octogones, avec ce qui l'a fait monter. **Aucune recette en direct** (Q36b).
- **Les temps forts** (Q38) : l'arène du jeu en plein écran, au rendu de la caméra « Plafond ». **Lisibles d'un coup d'œil, sans lire** (retour du 21/11) : le nom sous chaque pion, un compteur de frappes qui monte près de chacun, un trait par coup qui touche, la flèche de l'amenée, l'anneau de la soumission, les cartes posées devant les juges, un grand repère à droite (« KO », « 21 – 10 », « Au sol »). Autour, seulement le tableau d'affichage, un bandeau (quand, quoi, frappes du round) et la frise : chaque round à l'échelle, chaque moment à sa minute avec son icône et sa légende. **On va d'un moment à l'autre de gauche à droite** (flèches, frise) ; pas de panneau de droite, ni « Rejouer », ni « Le résultat ». 2 à 6 moments selon la durée, deux au plus par round, jamais le même schéma, jamais un round à la fois « dominé » et « serré ».
- **Le résultat** (Q36a) : il **se dévoile pas à pas** (« Décision des juges », les trois cartes une à une, puis le vainqueur ; ou « Fin du combat » et l'arrêt), le perdant s'éteint, puis tout reste jusqu'au clic. Une phrase dit tout en clair. Dessous : **les cartes des juges** (le nom de qui gagne chaque round, Q41), **le combat en chiffres** côte à côte (les mêmes que le relevé des Résultats, le meilleur avec le point, amenées en « 2/3 »), **ce que ça change** pour les deux (chez Split, mondial avec ▲ vert ou ▼ rouge, bilan, série, médecin). Le tunnel est centré sur le verdict.
- **Le discours** (Q37a, Q37b, refait le 21/11) : seulement pour le combat principal, le co-principal (même une décision partagée) ou une surprise (10 rangs d'écart, ou vainqueur donné à moins de 25 %). **Une scène** : le vainqueur sous le projecteur, pourquoi il parle, « En direct · dans la cage », **ce que sa victoire veut dire** en gros (« Nouveau champion des poids légers », « Entre dans le top 10… »), la salle. **L'interview se déroule** : la question du commentateur, la réponse qui s'écrit mot à mot pendant que la voix bouge, la réaction de la salle ; « Tout afficher › ». À droite : ce qu'il gagne, ce qui en reste pour la suite, puis **le défi** s'il y en a un (le prochain adversaire possible, Q37c), sinon le bilan du combat.
- **Les défis** : jamais de revanche immédiate ; un défi est une vraie réponse, marquée « Le défi · … », jamais un nom en fin de phrase. Les répliques sont écrites sur le combat lui-même (rounds, amenées, série, rang), ton sobre.
- **Le bilan** (R39) : le tunnel doré visible derrière le titre ; le public, l'ambiance, la recette, ce qu'il te reste (**les chiffres à la fin seulement**) ; les vainqueurs avec la montée au classement et **« Revoir » au choix** (l'arène ou le récit, Q39b) ; les primes données en médailles, leur total, qui les trouve basses ; le détail des recettes et dépenses. **Les montants des primes se fixent dans les Finances**, avant ou après une soirée, jamais au bilan (retour du 20/11). « Le lendemain » referme la soirée proprement (bug de « Tous les résultats »).
- **Le récit** : les frappes minute par minute, les temps forts à leur minute, puis chaque round (les trois juges, les frappes, le temps fort du round).
- **Mouvement** : spectaculaire (T3) : tunnel qui avance, salle qui se remplit, scènes de l'arène avec ralenti et caméra, verdict dévoilé, interview mot à mot ; tout s'arrête en mouvement réduit.
- **Ouvert** : Mezouar–Nana en 2025 (le vainqueur n'est pas affiché), 4 000 ou 4 200 places (4 200 des Résultats), la règle des primes « trop basses » (remplacée le 21/11, voir « Les primes »).

### Les primes, dans les Finances (Q39a, R39, ajout du 07/11, validé le 21/11)
- **Troisième onglet des Finances** : La caisse · Les bourses · Les primes. « Modifier › » (soirée à venir) et « Montants : Finances › » (bilan) l'ouvrent. Les montants se fixent ici, avant ou après une soirée, **jamais au bilan**.
- **Trois primes pour toute l'organisation**, de 1 000 à 100 000 €, par pas de 1 000 € : Combat de la soirée, Performance de la soirée, Finition (victoire avant la limite). Chacune a son curseur, ses boutons − et +, et un repère blanc « Aujourd'hui ».
- **Le bandeau** : Versé en primes, À ces montants, L'écart, Il t'est resté (ou « Il te serait resté » dès qu'un montant change).
- **Le coût sur des faits, jamais une prévision** : soirée par soirée, les primes réellement données en médailles, le versé, le même nombre de primes aux montants choisis, ce qu'il serait resté, puis le total. Une soirée à venir dit « À venir, rien n'est encore versé ». Un clic sur une ligne ouvre ses Résultats.
- **Les combattants** : une phrase et un nom, jamais une jauge ni une note (H1). Trois répliques au plus, les autres noms dans « Aussi », « Plus de plainte » pour ceux que les nouveaux montants apaisent. Une réplique par prime reçue, écrite sur le vrai combat (méthode, round, adversaire, public), marquée « à relire ».
- **Règle des plaintes** (proposition affichée dans l'écran, commune au bilan) : une prime paraît basse quand elle est sous la bourse du combattant **et** sous 6 % de ce que la soirée a rapporté avant primes. Une soirée qui finit en perte ne fait pas de plainte. Les 6 % sont un réglage, pas un chiffre du MMA réel.
- **La finition** : le nombre réel de finitions et une phrase de Clara Mercier, qui change si la prime monte ou baisse. Aucun pourcentage, aucune donnée cachée.
- **Confirmation en chiffres** (S6) : chaque montant avant et après, la soirée à partir de laquelle il vaut, le coût sur les soirées jouées ; « Fixer les primes » en jaune, « Revenir » en noir. Un clic en dehors, Échap ou Retour referme.
- **Une soirée jouée ne change jamais** : `PRIMES_ORGA` est figé, un nouveau montant est un barème « à partir de » la prochaine soirée, et tout écran lit `primeDe(type, soirée)`. Les soirées d'avant la 63 sont figées avant que la 63 ne change les rangs (sinon une page ouverte après la 63 réécrivait leurs préliminaires).
- **Navigation** : Retour et Avant suivent chaque réglage (les clics rapprochés sur une même prime comptent pour un pas) ; la fiche s'ouvre par-dessus sans perdre les montants. Montants et brouillon gardés en `localStorage`. Adresses : `?ecran=finances&pmetat=actuel|change|confirme|plainte|apres`.
- **Vérifié avec la vraie vie** : UFC, 100 000 $ par prime depuis janvier 2026 et 25 000 $ pour une finition sans autre prime ; Oktagon, 5 000 € par prime. Une étude sur 2 589 combats de l'UFC ne trouve pas de lien net entre la taille des primes et les finitions : prévoir un effet léger dans le jeu.
- **Mouvement** : discret (lignes qui apparaissent, chiffres du bandeau qui défilent) ; tout s'arrête en mouvement réduit.
- **Écarts repérés, à aligner** : l'onglet Contrat de la fiche déduit les primes d'une règle générale (67 participations sur 158 diffèrent des Résultats) ; à 50 000 / 50 000 / 20 000 €, les primes pèsent 18 à 38 % de la recette, et bourses plus primes 58 à 83 % ; Split cumule performance et finition, l'UFC non.

### Écran Options (T1, T5, validé le 21/11)
- **Tout simple** (retour du 21/11 : « c'est des options, ça suit la DA mais c'est tout simple ») : le vrai écran du jeu mis à la charte. Des onglets, un panneau, une ligne par réglage. Pas d'aperçu, pas de capture, pas de recherche, pas de barre de touches.
- **Sept onglets** : Combat · Affichage · Son · Soirée · Touches · Partie · Aide. Mêmes réglages, mêmes valeurs d'origine et mêmes phrases que le jeu (`mgmt-options.js`, `mgmt-reglages.js`).
- **Une ligne** : le nom, sa phrase dessous, le choix à droite. Dimensions du jeu : ligne de 88 px, écart de 8, nom en 36, phrase en 22, boutons de 48 en 30, blocs de 28 × 40.
- **Les choix sur une même grille** : boutons de 156 px, écart de 6, alignés à droite ; leurs bords tombent au même endroit d'une ligne à l'autre et d'un onglet à l'autre. Choix actif en blanc cassé, les autres en noir avec un bord qui suit l'octogone. Les actions et « Réglages d'origine » ont la largeur de deux choix.
- **Le son** : dix blocs octogonaux de la largeur de deux choix, le chiffre devant. Un clic sur le dernier bloc allumé baisse d'un cran, jusqu'à 0.
- **Touches** : le seul endroit où les touches restent écrites (exception à T1), en quatre groupes.
- **Partie** : sauvegarder (le seul bouton jaune), revoir son arrivée, changer de partie, exporter, importer, effacer, accompagnement de Leïla ; l'emplacement en bas. Effacer demande une confirmation en chiffres (S6). Ouvert depuis le menu principal, sans partie : pas de barre, pas d'action sur une partie.
- **Aide** (T5) : les cinq familles sur la ligne des onglets (La soirée, Combattants, L'argent, Organisation, Les repères), la liste à gauche, le texte à droite. 24 articles, tirés des règles validées et des constantes du jeu, marqués « à relire ». L'inventaire complet des phrases de tutoriel du jeu reste à faire au lot 3.
- **Ajout** : « Temps forts » dans la vue des combats, pour suivre la Soirée validée.
- **Maquette** : les réglages sont gardés en `localStorage` mais ne pilotent pas encore les autres écrans ; exporter et importer donnent un message, « Changer de partie » ouvre Mes parties (22/11). Adresses : `?ecran=options&opong=combat|affichage|son|soiree|touches|partie|aide`, `&oparticle=<id>`, `&opetat=effacer|sanspartie`.
- **Mouvement** : discret, les lignes apparaissent une fois à l'ouverture ; rien en mouvement réduit.
- **Ouvert** : l'accompagnement de Leïla, gardé et activé comme dans le jeu, ressemble au tutoriel que T5 retire. **Écart repéré** : le jeu compose encore 9 combats (5 + 4), la règle validée en demande 10 (4 + 6).

### Écran Pesée (T1, T3, T5, T10, Q17, validé le 22/11)
- **Plus d'écran « semaine du combat »** (retour du 22/11) : conférence, journée des médias, face-à-face à part et jour J sont retirés. Il reste **la pesée**, le 15 février, puis la Soirée.
- **Déroulé** : onglets Préliminaires, puis les quatre combats de la carte principale, du combat 4 au combat principal. **Les six préliminaires sur un même écran**, adversaires côte à côte ; **la carte principale deux par deux**, un duel par écran. Le bouton jaune nomme l'étape suivante (Carte principale, Combat suivant, La soirée).
- **La jauge** : les deux adversaires **partent de 0 en même temps et arrivent ensemble en une seconde**, le chiffre suit la barre, puis le verdict se pose (« Dans le poids » en vert, « 1,2 kg de trop » en rouge). Trait blanc = limite de la catégorie. L'échelle commence à 85 % de la limite, valeur écrite sous la paire. Mouvement fluide, sans délai au clic.
- **Face-à-face** : une phrase, pour la carte principale seulement.
- **Un poids manqué : c'est l'adversaire qui décide** (retour du 22/11), jamais le joueur. Pas de bouton ni de confirmation : l'écran montre sa réponse, sa phrase et les chiffres (ce que perd le fautif, ce que reçoit l'adversaire, le versé sans combat, la carte). S'il accepte : poids convenu, 20 % de la bourse du fautif passent à l'adversaire, 0 € pour Split. S'il refuse : combat annulé, l'adversaire reçoit sa part fixe (hypothèse).
- **Un clic pendant la montée du duel au poids manqué** affiche le verdict au lieu de passer au combat suivant.
- **Maquette** : la carte complète de la 63 est lue sans rien changer (Résultats, Soirée, Finances identiques). « Accepte » par défaut ; « refuse » ne lance pas la Soirée, qui joue une carte fixe. On y arrive par « Voir la pesée › » dans le Calendrier ; dans le jeu, Continuer s'arrêtera le jour de la pesée. Adresses : `?ecran=pesee&pepas=0..4&pecas=accepte|refuse|sans&pevue=carte&pemouv=1` (`pemouv=1` montre la montée même si l'ordinateur demande moins d'animations).
- **Inventé, à relire** : les 20 poids, le poids manqué de Darras, les réponses de Labbé, les phrases de face-à-face.
- **Ouvert** : ce qui fait accepter ou refuser un adversaire ; la place des 22 familles d'événements du jeu (blessure au camp, visa…), qui n'ont plus d'écran ; « les soirées le mardi ».
- **Écarts repérés, à aligner** : le jeu laisse le joueur choisir et retire la pénalité de la caisse de Split ; le bloc « La semaine du combat » du Calendrier annonce encore la conférence ; Darras « de Lille » (Presse, Messages) ou de Dakar (fiche) ; son trait « Jamais deux défaites de suite » est faux après la 63 ; Mezouar à Grenoble (Camps) ou à Marseille (discours de la Soirée).

### Menu principal, Mes parties, Nouvelle partie, création (T1, T2, T3, T5, T6, R1, validé le 22/11)
- **L'accueil reste celui du jeu** (retour du 22/11 : « l'accueil fait comme avant ») : mêmes entrées (Management, Duo, Mode histoire, Patron, Dirigeant de salle, Options, Quitter), mêmes mesures, même affiche de la prochaine soirée sur le tunnel. Carrière et Duel n'y sont pas (décision du 16/10). Deux écarts seulement : la barre de touches disparaît (T1), **« Reprendre » en jaune prend sa place** avec l'organisation et la date, et l'entrée choisie a ses quatre coins coupés.
- **Nouvelle partie et chargement poussés à fond** (retour du 22/11) : exception voulue au mouvement discret des écrans de gestion. Le tunnel du jeu avance, **teinté à la couleur de l'organisation** (`CL_TEINTES`).
- **Mes parties** : la dernière partie en grand avec le seul bouton jaune, les deux autres à côté ; un clic reprend, sans étape « choisir puis valider ». Un emplacement montre seulement l'organisation, la date de jeu, la prochaine soirée, la place, la caisse et la dernière sauvegarde. Le fond prend la couleur de la partie survolée.
- **Les états** : aucune partie, emplacement libre, trois pleins (« Nouvelle partie » en haut à droite, puis « Remplacer cette partie »), sauvegarde abîmée (« Reprendre la copie »), illisible sans copie (seulement la corbeille).
- **Effacer ou remplacer** : confirmation en chiffres (S6 : emplacement, organisation, date, caisse), l'action en jaune, « Revenir » en noir et sélectionné par défaut. Une partie remplacée n'est écrasée **qu'à la fin de la création** : abandonner ne perd rien.
- **Nouvelle partie** : les huit organisations en liste à gauche ; à droite une scène par organisation : ville, nom en très grand, phrase, atouts (+ vert, − rouge), classement et quatre mesures de l'écran Organisation avec **huit octogones qui montrent sa place**, puis effectif, âge, popularité, salle, bourses. On change à la liste, à la molette ou en tirant la scène.
- **La création** : l'année au centre d'un octogone qui se trace en six ans, les soirées, combats et ceintures qui montent, les vrais changements de ceinture (lignée des Ceintures), la frise de 2021 à 2026. Elle dure 9,5 s dans la maquette, un clic la passe, Retour abandonne sans rien écrire, puis **on entre seul sur l'Arrivée validée**. Les cinq cartons de lecture du jeu sont retirés (T5).
- **Reprendre une partie** : 0,7 s dans le tunnel de l'organisation, un clic la passe, rien en mouvement réduit.
- **Maquette** : seule la clé `maquette-menu-1` est écrite, jamais une sauvegarde du jeu. Seul Split se joue jusqu'au bout. Options › « Changer de partie » ouvre Mes parties. Adresses : `?ecran=menu&mnvue=menu|parties|nouvelle|creation&mnetat=aucune|une|libre|pleines|abimee|illisible&mnconf=effacer|ecraser&mnslot=1..3&mnorg=<id>&mnduo=1&mnchoix=1&mngen=0..1&mnmouv=1` (`mnmouv=1` montre le mouvement même si l'ordinateur en demande moins).
- **Inventé, à relire** : les parties Garden of Blood et MMA Korner, les phrases de sauvegarde abîmée et de remplacement.
- **Ouvert** : garder ou non le choix de l'organisation ; « À venir » reste jaune comme dans le jeu alors que le jaune est réservé à l'action ; la durée réelle de la création dépendra du calcul.
- **Écarts repérés, à aligner** : Split 6e ou 2e ; caisse de départ de 50 000 € dans le jeu et 952 200 € à l'Arrivée (donc non affichée à la création) ; « plus grande salle » du jeu égale aux spectateurs moyens de Garden of Blood (12 600) ; Split « depuis 2004 » mais 62 soirées de 2021 à 2026 ; 9 combats par soirée dans le jeu, 10 dans la règle validée ; dans le jeu, une bande diagonale cache le 3e emplacement.

### Barre latérale et navigation (T4, Q11, validé le 22/11)
- **Tout est visible sous quatre titres** (retour du 22/11) : Accueil, Messages ; **Soirées** : Carte, Calendrier, Résultats ; **Combattants** : Effectif, Recrutement ; **Le monde** : Classements, Camps, Presse ; **Direction** : Finances, Organisation ; en bas, Options et Menu principal.
- **Chaque écran est à un clic**, barre ouverte ou repliée. Les quatre titres ne sont pas cliquables.
- **Mêmes hauteurs ouverte et repliée** : logo sur 128 px, lignes de 59 px, titres de 31 px, trait de 2 px avant Options. La barre remplit les 1080 px et aucune ligne ne bouge en hauteur quand on la replie. Largeur : 260 px, 84 px repliée.
- **Repliée** : les icônes sont centrées dans leur ligne, les titres restent écrits et centrés en 16 px. Le logo de 54 px garde le même centre vertical que le grand logo et s'aligne sur la colonne des icônes. Le bouton de repli reste dans l'angle.
- **L'octogone jaune** reste sur la ligne de l'écran concerné, à droite du libellé, puis dans l'angle de l'icône en version repliée.
- **Mouvement** : la case blanche est celle de `mouvement.js`, sans second système ni mode de fusion.
- **Identifiants inchangés** : `S.ecran`, `data-go`, adresses, Retour et Avant. Les sous-menus restent en haut de l'écran, sous l'en-tête. Recruteur et Rapports éclairent Recrutement, la présentation éclaire la Carte, la Pesée éclaire l'Accueil.
- **Sans barre** : Menu principal, Mes parties, Nouvelle partie, création, Arrivée, et les temps forts, résultats et discours de la soirée.
- **Maquette** : `barre.js`, `barre.css`, préfixe `br-`, chargés juste avant `mouvement.js`. Seule la clé `maquette-barre-1` est écrite. Adresses : `&brbarre=ouverte|repliee`, `&brvar=titres|groupes|r11|jeu` (la version validée, deux variantes écartées, la barre d'avant), `&brgroupe=soirees|monde|direction|aucun` pour les variantes à groupes.
- **Inventé, à relire** : les quatre titres. La mention « à relire » s'affiche barre ouverte ; elle ne tient pas en version repliée.
- **Ouvert** : une fin de contrat allume « Contrats » dans le jeu ; la maquette n'allume pas Recrutement, car ces contrats se gèrent dans la fiche et par message.
- **Écarts pour le code** : les touches A et E devront suivre le nouvel ordre ; l'octogone des Préliminaires devra allumer la Carte ; la Pesée éclaire l'Accueil alors qu'on y arrive par le Calendrier.

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

### La carte d'une soirée (R12, Q12, Q14, validée le 21/11)
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

### Le mouvement commun à tous les écrans (T3, validé le 22/11)
- **Un seul jeu d'effets** (`mouvement.js`, `mouvement.css`, préfixe `mv-`), chargé en dernier, qui ne change ni les données ni le rendu des écrans. Toute nouvelle maquette en profite sans rien ajouter.
- **Trois règles** : rien ne bloque un clic ; seul ce qui est visible s'anime ; un écran déjà vu s'ouvre plus vite.
- **Barre latérale** : la case blanche glisse d'un écran à l'autre en 0,26 s. La case d'arrivée ne s'allume pas avant la fin du passage.
- **Onglets** : la plaque blanche glisse vers l'onglet choisi, y compris dans la fiche.
- **Filtres** : un trait blanc relie l'ancien filtre au nouveau. **Sa durée dépend de la distance** (retour du 22/11 : « trop rapide ») : de 0,32 à 0,72 s, puis il se pose et s'efface.
- **Tris** : chaque ligne visible glisse à sa nouvelle place. Au-delà de 40 lignes, le tableau bouge d'un seul bloc pour ne pas saccader.
- **Survol** : une surbrillance octogonale suit la souris dans les tableaux ; les lignes de l'Accueil, des Messages et de la Presse se décalent de 6 px.
- **Accueil et Effectif** : blocs qui arrivent en moins de 0,7 s, chiffres qui défilent, jauges qui se remplissent, reflet sur la prochaine chose à faire, lignes en cascade, série qui se pose.
- **Pas de tunnel animé sur l'Accueil** (retour du 22/11). Les tunnels déjà validés (Arrivée, Nouvelle partie, création, soirée) gardent le leur.
- **Gardé tel quel** : les entrées validées de chaque écran ; la pesée, la présentation, la soirée, l'Arrivée et le menu gardent leur mise en scène.
- **Couleurs** (retour du 22/11) : **jamais de mode de fusion** (`mix-blend-mode`) pour un effet qui passe sur du texte : il transforme le jaune en bleu. La plaque contient une vraie copie du texte en noir. Pendant un glissement, le texte de la barre et des onglets reste en gris neutre, car Windows colore sinon le bord des lettres.
- **Maquette** : `&mvmouv=1` montre tout le mouvement même si l'ordinateur en demande moins, et le garde pendant la session ; `&mvmouv=0` revient au réglage de l'ordinateur ; `&mvessai=0` retire ce jeu d'effets pour comparer.
- **Pas encore dans le jeu** : il y entrera avec chaque écran.

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
| Arrivée | R1 à R4 | Validé (section 11, « Écran Arrivée ») : ouverture, Split, Ton contrat, Tes espoirs (2 sur 6), puis l'Accueil du 4 janvier. |
| Accueil | R5, R6 | Validé (section 10). |
| Leïla, présentation, face-à-face | R7 à R10 | Présentation et face-à-face validés (section 11, « Présentation et face-à-face ») : l'affiche au tunnel centré sur le VS, l'enjeu, victoires et défaites, la presse ; les chiffres avec le point du meilleur. Dossiers de Leïla (R7 à R9) : l'encadré de la Carte, le reste à traiter dans la Carte. Médias à renommer (Q10c). |
| Carte, préliminaires | R12, R14 | Validé (section 11, « La carte d'une soirée »). |
| Messages | R13, R17 | Section 11, « Écran Messages » et « Continuer ». |
| Effectif, Infirmerie | R15, Q12b | Validé (section 11, « Grands tableaux »). **Infirmerie = un onglet de l'Effectif.** Peu de refus au départ, toujours avec une raison et une solution. |
| Fiche | R16 | Validé (section 10). |
| Classements | R18 à R21 | **Logo du jeu sur le n° 1 et le n° 2.** Tunnel rouge. Victoire et défaite, montée et descente en vert / rouge. Sous-menus moins hauts. « Les meilleurs » en vitrine colorée, où un clic ouvre la liste complète de la statistique. Records regroupés et séparés par type. |
| Ceintures | R22 | Validé (section 11, « Écran Ceintures ») : un onglet des Classements. Défenses et durée du règne restent à ajouter au Classement. |
| Contrats, recrutement | R23 à R25 | Section 11, « Écran Recrutement ». **Un seul écran de recrutement** avec un filtre (agents libres, fins de contrat ailleurs). Négociation FM en 2 à 4 allers-retours (salaire, nombre de combats, primes, chance au titre sous le nom des demandes). « Il dit » et l'avis des médias passent dans la fiche. « Tu l'as vu » est retiré. |
| Recruteur | R26 | Validé (section 11, « Écran Recruteur et Rapports »). |
| Salles et camps | R27 | Validé (section 11, « Écran Camps »). |
| Presse | R28 | Validé (section 11, « Écran Presse ») : À la une, Les défis, Le fil. Médias à renommer (Q10c). |
| Calendrier, résultats, lendemain | R29, R30, R40, R41 | Validés (section 11, « Écran Calendrier » et « Écran Résultats et lendemain »). |
| Finances, primes | R31, Q39a | Validé (section 11, « Écran Finances » et « Les primes ») : La caisse, Les bourses, Les primes. Un nouveau montant vaut dès la prochaine soirée et ne réécrit jamais une soirée jouée. |
| Organisation, croissance, carrière | R32 à R35 | Validé (section 11, « Écran Organisation » et « Ta carrière »). |
| Soirée en direct, discours, temps forts, bilan | R36 à R39 | Validé (section 11, « Soirée en direct, temps forts, résultat, discours, bilan ») : temps forts dans l'arène lisibles d'un coup d'œil, résultat dévoilé pas à pas, discours en scène et interview, bilan avec « Revoir » au choix. Primes fixées par le joueur (1 000 € à 100 000 €) **dans les Finances** (section 11, « Les primes »). |
| Options, aide | T1, T5 | Validé (section 11, « Écran Options ») : le vrai écran du jeu à la charte, tout simple ; les aides regroupées dans l'onglet Aide. |
| Pesée (à la place de la semaine du combat) | T10, Q17 | Validé (section 11, « Écran Pesée ») : préliminaires sur un écran, carte principale deux par deux, jauges qui montent ensemble depuis 0, une phrase de face-à-face. Sur un poids manqué, c'est l'adversaire qui décide. |
| Menu, Mes parties, Nouvelle partie, création | T1, T2, T3, T5, T6, R1 | Validé (section 11, « Menu principal, Mes parties, Nouvelle partie, création ») : l'accueil du jeu avec « Reprendre » à la place des touches ; la dernière partie en grand ; une scène par organisation ; six ans qui défilent, puis l'Arrivée. |
| Mouvement commun, tous les écrans | T3 | Validé (section 11, « Le mouvement commun à tous les écrans ») : barre, onglets, filtres, tris et survol, sans tunnel animé sur l'Accueil ni mode de fusion sur le texte. |
| Barre latérale et navigation | T4, Q11 | Validé (section 11, « Barre latérale et navigation ») : les 12 écrans visibles sous quatre titres, chacun à un clic, aux mêmes hauteurs ouverte et repliée. |

## 13. Choix encore ouverts (à trancher sur une prochaine maquette)

Chaque maquette part de l'hypothèse notée ici et le signale. Rien n'est tranché sans toi.

| Sujet | Hypothèse actuelle de la maquette | Source |
|---|---|---|
| Fond (le cendré est retiré) | Gris chaud texturé, proche du jeu | C1, T2 |
| Police | Saira, celle du jeu | T2b |
| Octogone « Dans la cage » | Version « rempli » (il impose / il subit). Deux autres versions existent : « en chiffres » et « comment il gagne » | Q16c |
| Nom des demandes des combattants | « Ses demandes » (autres pistes : « Engagements », « Parole donnée ») | Point tranché n° 1 |
| Barre latérale | Structure validée le 22/11 : 12 écrans visibles sous quatre titres. Restent à relire les noms Soirées, Combattants, Le monde et Direction ; reste à trancher si une fin de contrat allume Recrutement | T4, Q11 |
| Place du « Fil » et des « Suivis » | Fil dans Presse (validé le 18/11) ; Suivis **pas** dans Recrutement (retour du 09/11), place à décider (aperçu sur l'Accueil) | Q13 |
| Logo sur le n° 1 et le n° 2 | Le rang écrit dans le logo du jeu, sur le tunnel rouge | Q18b |
| Couleurs des organisations | Une couleur par organisation (contour, tunnel, pastille) ; palette proposée | 09/11 |
| Écran Ceintures | Gardé, en onglet des Classements (validé le 18/11) | Point tranché n° 2 |
| Nom des soirées | « Split Fight Night 63 » comme dans le jeu ; le plan prévoit « Split : X vs Y » pour les fight nights et « Split 1 » pour les grandes soirées | Q21c, Q29a |
| Meilleur côté dans une comparaison | Un point jaune devant la valeur (validé le 20/11 sur le face-à-face) ; la valeur en vert reste en variante | Q10b |
| Surnoms affichés | Sous le nom dans les listes, à côté du prénom dans la bannière. La liste des écrans concernés reste à valider | T11 |
| Noms des trois médias | Cage Hebdo, Tableau Noir, Le Forum (à renommer) | Q10c |
| Écran Recrutement | Remplace « Contrats » dans la barre ; onglets Combattants · Recruteur · Rapports ; « Ses demandes » avec trois poids et « T'engager » | R23 à R25, 09/11 |
| Date de l'en-tête | La date du jour (le 16 février reste la date de la soirée) | Retour du 05/11 |
| Accompagnement de Leïla | Gardé et activé, comme dans le jeu ; il ressemble au tutoriel que T5 retire | T5, Options |
| Choix de l'organisation à la création | Gardé comme dans le jeu, Split par défaut ; seul Split va jusqu'à l'Arrivée dans la maquette | Menu, 22/11 |

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
