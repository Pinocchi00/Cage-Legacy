# Reprise de fidélité aux planches — 07/10/2026

Demande d'Anthony : les planches ne sont pas toutes respectées (l'accueil par exemple) et tout le management doit être dans la direction visuelle.

**Méthode.** Les planches (`.dc.html`, statiques) sont chargées à côté du jeu à 1920 × 1080 ; un outil de comparaison (hors dépôt) extrait le texte, la position et le corps de chaque élément des deux côtés et liste les écarts. Les écrans sont ensuite comparés à l'œil.

## Ce qui a changé
- **L'en-tête de tous les écrans du cadre** (planches « Carte », « Effectif », « Classements »…) : à droite, « Dans N jours », la boîte du jour et du lieu, la boîte « Split Fight Night » avec le numéro en rouge ; à gauche, la plaque, les pastilles de progression de la carte (Carte, Préliminaires), le grand nombre (44 px) et son libellé (22 px). Un nom de salle trop long pour la boîte est remplacé par sa ville. Sans agenda (partie d'avant), seule la boîte de la soirée reste.
- **L'accueil** : l'affiche porte maintenant « 12 AVRIL — DÔME DE LYON » en bas à droite (la boîte existait en CSS mais n'était jamais écrite).
- **Contrats** : « Sous contrat » et « Recrutement » sont des onglets de l'en-tête (la planche), avec le même effet que R.
- **Libellés d'en-tête** : Camps « N salles », Presse « N nouvelles cette semaine », Résultats « Split Fight Night 3 · 15 février », Effectif au féminin pour les catégories féminines, Fiche « Combattant 3 / 30 ».
- **Options** : les valeurs de la planche (lignes de 88 px à coins coupés de 14 px, titre 36 px, choix de 48 px en 30 px, choix inversés sur la ligne choisie) et le bouton « R — Réglages d'origine » dans le panneau.
- **Les écrans qui n'avaient pas de planche et gardaient l'ancien habillage** (la semaine — rebaptisée « Les affaires » —, le lendemain, l'organisation, le vestiaire, l'ancien recrutement) sont dessinés dans le langage des planches : mêmes noirs, blanc cassé, jaune et rouge ; titres extra-condensés avec la barre rouge ; panneaux à coins coupés ; lignes choisies en blanc cassé ; un seul jaune pour l'action ; rien sous 22 px. Aucune règle ni donnée ne change : seul l'habillage (les jetons `--mgmt-*` sont redéfinis sous `.mf-ancien`, les trois colonnes de la semaine et les deux du lendemain et de l'organisation sont posées dans des panneaux du cadre).

- **Le logo.** La planche « Logo » retient deux versions : B (octogone à côté du titre) pour la barre des sections — déjà en place — et A (le titre dans l'octogone) « pour l'icône du jeu et tout ce qui se montre seul ; l'accueil garde le titre écrit ». L'accueil sans soirée n'a donc plus d'octogone à droite, comme sa planche ; l'icône de la version installable reprend les trois octogones de la planche.

- **Le mouvement** (planche « Le mouvement de l'interface ») : `mgmt-animations.js` rejoue ses gestes, aux durées et courbes de la planche : l'arrivée d'un écran (barre 200 ms, en-tête 220 ms, panneaux 340 ms avec rebond, touches), la bande à 45° (blanc cassé, rouge, noir) qui traverse en 620 ms pendant que l'écran change à mi-course, la ligne claire qui arrive en biais sur un choix (190 ms), le glissement de 60 px d'un changement d'onglet, le défilé des cartes du calendrier (170 px), le bouton jaune qui s'enfonce avec son éclat, la phrase de la voix qui se déroule. Rien ne bouge au repos. Un réglage **Affichage › Mouvement de l'interface** (oui d'origine) le coupe ; je ne suis pas la préférence « moins de mouvement » du système, qui était activée dans le navigateur où j'ai vérifié et aurait masqué tout le mouvement — c'est un écart à l'usage courant, à trancher.

## Ce qui reste écart
- Ces cinq écrans n'ont pas de planche : ils suivent le langage visuel, pas une maquette. À dessiner si Anthony veut une composition exacte.
- Les colonnes de quelques tableaux (Classements : Palmarès, Série en cours, Dernier combat ; Effectif) sont décalées de quelques dizaines de pixels par rapport aux planches.
- Booking (la carte) : le bloc « Leïla — Préliminaires » sous la carte et le lien « Voir les N combattants » de la planche ne sont pas posés ; les préliminaires à catégorie choisie dans la ligne ne le sont pas non plus.
- Le lendemain garde la barre des sections grisée (séquence imposée du lot 4).

## Les tunnels et la Fiche (07/10/2026)

- Les tunnels d'octogones figurent sur d'autres planches que l'accueil : **rouge** derrière la bannière de la Fiche (`images/accueil-octogones.jpg`), **jaune** (`images/tunnel-or.jpg`) derrière la bannière d'un champion, la carte du champion des Classements et la ceinture ouverte. Les deux images sont précachées (`sw.js`, version b29).
- La Fiche est refaite sur ses six planches (`mgmt-fiche-planche.js`) : bannière, cinq onglets (aperçu, style, combats, contrat, on en dit), variante champion. Rien de nouveau dans le jeu : tout se lit dans les systèmes existants. Les phrases que j'ai écrites (`MGMT_FICHE_TEXTES`) sont `relu:false`.
- Conservé de l'ancienne Fiche : le libellé « féminin » (dans la bannière), la date « Cycle N » de chaque combat, la trajectoire d'un combattant extérieur (onglet Combats), le rejeu une seule fois par trace.
- Écart assumé : l'ancienne ligne « Chez Split : rang · rang mondial » n'a pas de place dans les planches ; la bannière porte le rang dans la catégorie.
