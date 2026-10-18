# Mode Duo — planches à valider (18/10/2026)

Sept planches, une par écran du mode Duo (brief `docs/BRIEF-18-10-MODE-DUO.md`, fiches `docs/lots/DUO-T3.md` et `DUO-T4.md`).
**À valider par Anthony avant le code des tranches d'écran.** Une fois validées, elles priment sur les fiches pour tout ce qui se voit
(positions, tailles, couleurs, textes) ; les fiches gardent les règles de jeu.

| Planche | Écran du jeu (fiche) | États (`?etat=…`) |
|---|---|---|
| `DuoCreation.html` | `mgmt_duo_nouvelle` (DUO-T3 §2) | `noms` · `j1` · `j2` |
| `DuoQG.html` | `mgmt_duo` (DUO-T3 §3) | `attente` · `progression` · `arrivee` |
| `DuoEffectif.html` | `mgmt_duo_effectif` (DUO-T3 §4) | `j1` · `j2` |
| `DuoEncheres.html` | `mgmt_duo_encheres` (DUO-T4 §1) | `ouverture` · `mise` · `adjuge` (+ `caisse` si un joueur ne peut pas miser) |
| `DuoDraft.html` | `mgmt_duo_draft` (DUO-T4 §2) | `place` · `reponse` · `pret` |
| `DuoSoiree.html` | `mgmt_duo_soiree` (DUO-T4 §3) | `avant` · `resultat` · `principal` |
| `DuoBilan.html` | `mgmt_duo_bilan` (DUO-T4 §4) | `carte` · `saison` |

**Les noms et les chiffres ne sont pas inventés.** Ils viennent d'une vraie partie (Split pour Anthony, Garden of Blood pour François,
graine `20261018`, six ans de passé), jouée avec les fonctions du jeu sur `main` (`d24673c`) plus les correctifs de DUO-T0 et le moteur
tel que DUO-T1 le décrit (`src/extraire.js`) : quatre super cartes, chacune après les soirées des adjoints. Seuls les textes fixes
d'interface sont proposés. Les écrans montrent la super carte 2 (la saison 1 en cours) ; le bilan `saison` montre la 4e.

**Ouvrir** : double-clic sur un fichier `.html` (tout est dans le dossier : polices et fond dans `support/`), puis ajouter
`?etat=…` à l'adresse pour changer d'état. Comme le jeu, chaque planche est un cadre de 1920 × 1080 mis à l'échelle de la fenêtre.

**Captures** : `captures/<Planche>-<état>-<largeur>.png` à 1280 × 720, 1440 × 900 et 1920 × 1080 (`node src/capturer.js`).
**Contrôle** : `?audit=1` mesure chaque texte — taille sous 22 px, texte qui sort de son bloc, textes qui se chevauchent.
Résultat dans `captures/audit.txt`.

**Sources** : `src/construire.js` assemble chaque page depuis `src/donnees.json` ; `src/commun.css` et `src/commun.js` sont ceux des
planches de la refonte (valeurs de `ui-cadre.css`) ; `src/duo.css` ajoute ce qui est propre au Duo.

## Ce que les planches décident

- **Deux couleurs de joueur**, prises dans la palette des affiches du jeu (`mfAfficheDonnees`) : **joueur 1 rouge `#E23A2B`**, **joueur 2
  bleu-vert `#1B8C8F`** (chiffres et noms en `#3FB7BA` sur fond noir pour la lisibilité). Le **jaune reste l'action principale**, jamais un
  joueur (la fiche DUO-T4 disait « J2 le jaune » : remplacé par ces planches). La couleur du joueur marque : son panneau (filet de 10 px
  en tête), son nom, son score, la case de la carte qu'il a placée, et le **bandeau « À {nom} de … »** de 92 px qui dit à qui c'est.
- **Pas de barre des sections** : le Duo a son propre QG, le logo en haut à gauche comme l'écran d'arrivée.
- **QG** : trois colonnes 676 / 424 / 676 px. Chaque joueur : organisation en 76 px, score de saison en 120 px, trois tuiles (caisse,
  rang parmi les huit organisations, champions), six combats de ses soirées depuis la dernière super carte, bouton de son effectif.
  Au centre : le score de saison en 200 px, la date de la prochaine super carte, l'action jaune (`AVANCER`, puis `LES ENCHÈRES`…),
  et pendant la progression une barre hachurée avec la date du jour et le numéro des deux dernières soirées.
- **Enchères** : le combattant au centre (nom en 124 px, bilan, âge, rang mondial, d'où il vient), le prix en 96 px, le bandeau du
  joueur qui doit miser, `MISER {prix}` et `PASSER`. À gauche et à droite, la caisse de chaque joueur et **ce qu'il peut miser**.
- **Draft** : la carte à gauche (6 cases, du combat 6 au combat principal, filet de la couleur de celui qui a placé, case active
  cerclée de jaune), la liste du joueur dont c'est le tour au centre (onglets en placement, une seule catégorie en réponse),
  à droite **combien l'autre a de disponibles par catégorie**.
- **Soirée** : face-à-face façon affiche — nom de famille en 150 px, prénom dessous, **bilan d'avant combat en gros chiffres (128 px)**,
  rang dans son organisation, âge ; le score de la soirée en haut à droite. Résultat : le vainqueur garde son panneau cerclé de sa couleur
  avec `VAINQUEUR`, le perdant s'estompe, la ligne `X BAT Y` et la méthode en bas.
- **Bilan** : bandeau de la couleur du vainqueur (gris pour une égalité), les six combats avec une coche au vainqueur et `Revoir`, la
  saison à droite (score, prochaine date, **l'argent de la super carte pour chacun**, recrues des enchères ; à la 4e carte, le vainqueur
  de la saison, les quatre scores et l'argent gagné sur la saison).

## Écarts et questions relevés en faisant les planches

1. **L'argent — tranché par Anthony le 18/10 (15 h 54)** : « le matchmaker automatique reste toujours stable et ce sont les super
   cartes qui génèrent le plus de bénéfices pour le vainqueur ». La première version de ces planches montrait la caisse de Split à
   découvert à chaque super carte (−106 000 € à −300 000 €) : le matchmaker automatique la faisait plonger, et Anthony ne pouvait plus
   miser. Les planches sont refaites avec la règle décidée (DUO-T1) : **les soirées des adjoints ne font plus bouger la caisse**, la
   super carte rapporte **200 000 € au vainqueur, 50 000 € au perdant** (125 000 € chacun sur égalité). Le bilan montre ces gains.
   **Prix des enchères — tranché le 18/10 (16 h 08)** : Anthony retient la recommandation de Claude, le prix d'ouverture est **la
   valeur du contrat, 3 × la bourse** (Julius Hoffman : 69 000 € au lieu de 7 000 €, palier 7 000 €). Les planches le montrent.
2. **L'écran « Nouvelle partie » du jeu coupe déjà certaines réputations** (hauteur de 48 px pour deux lignes) : la planche garde 50 px et
   resserre les marges ; à revoir dans `ui-cadre.css` en même temps que DUO-T3.
