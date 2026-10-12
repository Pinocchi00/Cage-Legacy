# Planches du brief « Un monde qui a vécu »

Copie des sept planches validées par Anthony le 10/10/2026 (canevas Design, page « Monde — à valider »).
Ce sont les références des tranches d'écran : on en **porte les valeurs exactes** (positions, tailles,
couleurs, polices), on ne les décrit pas.

| Planche | Tranche |
| --- | --- |
| `MondeNouvellePartie.dc.html` | Lot 2 T5 |
| `MondePresentationCombattant.dc.html`, `MondePresentationCombat.dc.html` | Lot 3 T2, T3, T5 |
| `MondeDossiersCombattant.dc.html`, `MondeDossiersAdversaire.dc.html` | Lot 4 T4, T5 |
| `MondeAccueilArrivee.dc.html`, `MondeAccueil.dc.html` | Lot 7 T4, T5 |

Chaque fichier est une page de 1920 × 1080 en styles en ligne. Les deux images `/_blob/…` sont le fond cendré
(plein écran) et le tunnel rouge derrière les combattants : le jeu les possède déjà, la fiche du combattant
(`mgmt-fiche-planche.js`, `mgmt-fiche-cadre.js`) s'en sert. Toutes les planches montrent « ACCUEIL » en tête de la
barre des sections : douze entrées de 69 px (au lieu de onze de 75 px).

## Correction du 10/10/2026 (midi)

La première version de ces planches portait des textes de 17 à 21 px, contre la règle de la charte et du test
`tests/mgmtCadre.test.js` (« jamais de texte sous 22 px »). Elles ont été refaites : **aucun texte sous 22 px**.
`MondeNouvellePartie` reprend désormais la mise en page réelle de l'écran (grille 4 × 2 de cartes de 440 × 322,
aperçu chiffré de 96 px, pied de 60 px avec « Créer ton organisation · À venir ») et y ajoute, dans chaque carte,
la ville, l'année et la réputation ; les intertitres « Les plus » / « Les contreparties » laissent la place à ces
trois lignes (les signes + et − suffisent). **Ces versions corrigées sont confirmées par Anthony le 10/10/2026** (« oui c'est bon »).
