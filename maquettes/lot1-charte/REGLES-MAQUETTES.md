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

### Grands tableaux (Effectif, Classements, Contrats, Recrutement, Salles)
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
- **Un seul écran**, à la place de « Contrats » dans la barre (hypothèse : les contrats de Split se gèrent dans la fiche et par le message de fin de contrat, Q23b, Q23c). Onglets : Combattants · Recruteur (R26, prochaine maquette).
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
| Contrats, recrutement | R23 à R25 | Section 11, « Écran Recrutement ». **Un seul écran de recrutement** avec un filtre (agents libres, fins de contrat ailleurs). Négociation FM en 2 à 4 allers-retours (salaire, nombre de combats, primes, chance au titre sous le nom des demandes). « Il dit » et l'avis des médias passent dans la fiche. « Tu l'as vu » est retiré. |
| Recruteur | R26 | Départ de Lyon, toutes les catégories, 2 / 4 / 6 profils selon la durée du voyage. De vrais styles de combat. |
| Salles et camps | R27 | Liste verticale avec un classement (réputation, champions formés) et une spécialité. Elles évoluent seules. |
| Presse | R28 | **Nouveaux exemples visuels à montrer avant toute refonte.** Les « envies du public » seulement pour les très grosses affiches. |
| Calendrier, résultats, lendemain | R29, R30, R40, R41 | Résultats et lendemain validés (section 11). Calendrier : pour chaque soirée, enjeu, ceinture, ville, salle. |
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
| Place du « Fil » et des « Suivis » | Fil dans Presse ; Suivis **pas** dans Recrutement (retour du 09/11), place à décider (aperçu sur l'Accueil) | Q13 |
| Logo sur le n° 1 et le n° 2 | Le rang écrit dans le logo du jeu, sur le tunnel rouge | Q18b |
| Couleurs des organisations | Une couleur par organisation (contour, tunnel, pastille) ; palette proposée | 09/11 |
| Écran Ceintures | À montrer avec un vrai sens, puis à garder ou supprimer | Point tranché n° 2 |
| Nom des soirées | « Split Fight Night 63 » comme dans le jeu ; le plan prévoit « Split : X vs Y » pour les fight nights et « Split 1 » pour les grandes soirées | Q21c, Q29a |
| Meilleur côté dans une comparaison | Un point jaune devant la valeur, ou la valeur en vert | Q10b |
| Surnoms affichés | Sous le nom dans les listes, à côté du prénom dans la bannière. La liste des écrans concernés reste à valider | T11 |
| Noms des trois médias | Cage Hebdo, Tableau Noir, Le Forum (à renommer) | Q10c |
| Écran Recrutement | Remplace « Contrats » dans la barre ; onglets Combattants · Recruteur ; « Ses demandes » avec trois poids et « T'engager » | R23 à R25, 09/11 |
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
