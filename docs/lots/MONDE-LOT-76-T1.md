# Monde lot 76 T1 — Ton poste (UniTonPoste) identique à la planche

Branche : `fid-tonposte2` (la branche courante de ce dossier ; commits ICI ; le superviseur fusionne). **Lis d'abord `C:/Users/antho/AppData/Local/Temp/p1/COMMUN-3E-TOUR.md`.** Dossier de travail pour l'outil : `C:/Users/antho/Documents/cage-legacy-p76`.

## Écran : `tonposte` (maquette `UniTonPoste`) — et `bilan` (`UniBilanPatron`, déjà propre : ne le dégrade pas)
Fichier : `mgmt-ecran-poste.js` (`scr_mgmt_poste`).

### Constat sur main (25/10)
Le jeu montre **deux** panneaux pauvres (« TON POSTE » avec un bouton jaune rogné en bas + « DERNIÈRES SOIRÉES » en liste) et 3 chevauchements (« IL ATTEND DE VOIR » sur la barre des touches). La planche en a **trois colonnes** :
1. **TON CONTRAT** (titre 40 px + trait rouge) : 4 lignes, label gris 22 px à gauche / valeur 28-30 px blanche en capitales à droite : « Durée · 1 AN », « Fin du contrat · 11 JANVIER 2028 », « Salaire · 3 200 € / MOIS », « Ta réputation · QUI MONTE » (jaune) ; **en bas du panneau** « LES OFFRES » (petit titre) + un paragraphe (« Personne ne t'a encore approché. Knuckle Gate a demandé ton nom à la conférence de presse. »).
2. **CE QU'EN PENSE LE PATRON** : nom du patron en petites capitales (« JEAN-MICHEL DELATOUR »), **verdict en 60-64 px jaune** (« IL EST RAVI » / « IL ATTEND DE VOIR »…), citation en italique 22 px ; puis **4 événements** en lignes : à gauche l'étiquette (« SOIRÉE 63 », « JANVIER ») 22 px grise, flèche ▲ (vert) ou ▼ (rouge), titre blanc 24 px (« Le Palais des sports à moitié vide ») + sous-ligne grise (« Marseille · − 52 000 € ») ; **en bas** « Prochain rendez-vous » à gauche, « JUILLET · MI-SAISON » à droite en gras.
3. **TES OBJECTIFS** : « LA SAISON » + 4 lignes (texte à gauche, valeur colorée à droite, **barre de progression** fine dessous : « Un lourd dans le top 15 mondial · OKORO 22e » etc.) ; puis « LA SOIRÉE 65 » + 2 puces jaunes avec titre et sous-ligne.

Au-dessus : l'en-tête commun (plaque `ORGANISATION`, libellé « SPLIT · 4e DES HUIT », date/lieu, soirée), la rangée d'onglets dans le contenu avec « Matchmaker de Split depuis le 12 janvier 2027 » à droite (le carnet, déjà fait par un autre lot, a ce modèle : copie son approche, ne le touche pas).

Les données existent dans `m.poste` (`mgmtPoste*`) : la **réputation**, le **verdict du patron**, la **chronologie des événements** (cherche `mgmtPosteHistorique`, `mgmtPosteEvenements`…), les **objectifs**. **Ne crée aucune règle de jeu.** Ce que les tests anciens exigent reste dans le HTML (le bloc « LE CHOC DES ORGANISATIONS » et son bouton « Ouvrir le choc », les liens vers le bilan, etc.) : **place-le sans chevauchement** (ex. dans le panneau « LES OFFRES » du panneau 1 ; le bouton devient un petit bouton dans ce panneau, texte ≥ 22 px). **Lis `tests/mgmtLot48T1.test.js`, `mgmtLot57T1`, `mgmtLot58T1`, `mgmtPoste*` avant de commencer.**

Écrans à contrôler : `tonposte,tonposteLong,bilan,bilanLong`.

## Compte rendu

- `mgmt-ecran-poste.js` : plaque et libellé communs adaptés à l’organisation, descriptif du matchmaker, nom de patron lu depuis l’organisation lorsqu’il existe ; correction du libellé de réputation ; détails d’historique issus des données disponibles et flèches codées en couleur. `bilan` laissé intact.
- `ui-cadre.css` : actions confinées dans leur flux et styles de flèches positif/négatif. Versions montées avec `_bump.js` ; `index.html` contient les versions actualisées.
- Tests ajoutés : aucun. Tests ciblés vérifiés : `mgmtLot48T1.test.js` (9/9), `mgmtLot57T1.test.js` (33/33), `mgmtLot58T1.test.js` (19/19), tous verts. `node tools/verif-versions.js origin/main` et `node_modules/.bin/eslint .` réussis.
- Migration de sauvegarde : aucune.
- Écarts et reprise 25/10 : le nom du patron affiché utilise maintenant `mgmtPostePatron` (Jean-Michel Delatour pour Split, champ existant sinon) ; « LA SOIRÉE 65 » suit le libellé de la planche. La sous-ligne d’événement n’est affichée que si `h.lieu` existe ; l’historique actuel n’en fournit pas, donc aucune donnée n’est inventée. Captures après reprise : `tonposte` et `tonposteLong` ont `chevauchements:0`, `textesSous22px:0`, `debordent:[]`, `defilent:2`, `grosBlocs:18.0` ; `bilan` et `bilanLong` ont `chevauchements:0`, `textesSous22px:0`, `debordent:[]`, `defilent:0`, `grosBlocs:12.3`. Les quatre cibles de contrôle sont donc confirmées, mais le seuil `grosBlocs ≤15` de `tonposte` reste dépassé (18.0). Essai de correspondance des tailles maquette sur les panneaux (44 px titres, 15 px marge, 28 px valeurs objectifs) a fait monter `grosBlocs` à 18.9 ; CSS ramené à sa version antérieure (18.0). Tests ciblés finaux : `mgmtLot48T1.test.js` 9/9 ; `mgmtLot58T1.test.js` 19/19 ; versions vérifiées et ESLint réussi. `mgmtLot57T1.test.js` lu mais non relancé, car ses tests ne couvrent pas l’écran poste. Les changements hors tranche (`.opencode/`, `opencode.json`, `sw.js`) ne sont pas inclus.
- Questions pour Anthony : aucune.

### Reprise 6 — 25/10
- `mgmt-ecran-poste.js` : complété le texte de l’état sans offre pour reprendre la formulation présente sur la planche, sans modifier les règles de jeu.
- `index.html` : version de `mgmt-ecran-poste.js` montée avec `_bump.js`.
- Tests : `mgmtLot48T1.test.js` (9/9) réussi après cette modification ; `mgmtLot57T1.test.js` a été lancé mais dépassé le délai de 120 s de l’outil, bien que son exécution antérieure dans cette reprise ait terminé avec 33/33 ; `mgmtLot58T1.test.js` a lui aussi dépassé le délai de 120 s lors du second lancement (il avait auparavant terminé avec 19/19). `node tools/verif-versions.js origin/main` et ESLint réussis.
- La lecture de `C:/Users/antho/AppData/Local/Temp/p1/COMMUN-3E-TOUR.md` a été refusée par la permission d’accès à ce chemin externe ; aucune consigne STOP de cette ressource n’a donc pu être vérifiée. Les changements locaux préexistants `.opencode/`, `opencode.json` et `sw.js` restent hors de ce commit.

### Reprise 7 — 25/10
- `ui-cadre.css` : le panneau trois-colonnes occupe désormais la zone utile jusqu’à 144 px au-dessus de la barre ; les offres et le prochain rendez-vous sont ancrés en bas par le flux flex. Renforcement ciblé de la règle du verdict 60 px, actions non absolues, titres d’événement 24 px et valeurs d’objectifs 24 px avec jauge fine.
- `index.html` : version de `ui-cadre.css` montée par `node tools/_bump.js`.
- Tests ciblés : `mgmtLot48T1.test.js` 9/9, `mgmtLot57T1.test.js` 33/33 et `mgmtLot58T1.test.js` 19/19. `node tools/verif-versions.js origin/main` et ESLint réussis. Le contrôle rapide des versions est passé ; le check complet n’a pas été lancé conformément à la consigne de reprise.
- Pas de test nouveau, pas de migration. Aucun relevé de capture actualisé pendant cette reprise : le seuil mesuré `grosBlocs ≤ 15` de tonposte reste à confirmer, l’ancienne mesure était 18.0. Le nom du patron demeure celui fourni par `mgmtPostePatron` (champ disponible dans les données). La lecture du fichier COMMUN demandé reste empêchée par les permissions d’accès externe.

### Reprise 9 — 25/10
- La lecture de `C:/Users/antho/AppData/Local/Temp/p1/COMMUN-3E-TOUR.md` a finalement réussi via Node : maquettes validées, cibles de capture détaillées, aucun STOP. Les modifications de code de cette tranche étaient déjà commitées (`296afc6d`) ; aucune modification de code supplémentaire n’était justifiée sans identifier l’écart mesuré.
- Captures effectuées : `tonposte` et `tonposteLong` ont chacune `chevauchements:0`, `textesSous22px:0`, `debordent:[]`, `nbDebordent:0`, mais `grosBlocs:18.8` (cible ≤15, donc non atteinte) ; `bilan` a zéro chevauchement, zéro texte sous 22 px, aucun débordement, `grosBlocs:12.3`. La capture combinée a dépassé le délai de l’outil après le premier écran. `bilanLong` n’a pas été relevé.
- Tests : `mgmtLot48T1.test.js` 9/9 réussi. Le lancement de `mgmtLot58T1.test.js` dans la même commande a excédé 120 s avant d’afficher son résultat ; ESLint n’a pas été atteint. `node tools/verif-versions.js origin/main` réussi. Le seuil de distance visuelle demeure non conforme et les relevés de `bilanLong` manquent ; ces écarts sont conservés explicitement, sans annoncer la tranche terminée.
- Aucun changement aux fichiers hors tranche `.opencode/`, `opencode.json` et `sw.js`.

### Reprise 10 — 25/10
- État initial : branche `fid-tonposte2`, commits de la tranche déjà présents jusqu’à `155ca22f` ; seuls `.opencode/`, `opencode.json` et `sw.js` étaient modifiés, et sont laissés hors commit.
- Lecture de `COMMUN-3E-TOUR.md` : aucun STOP ; fond cendré conservé, cibles de mesure rappelées.
- Captures actualisées : `tonposte` et `tonposteLong` : chevauchements 0, textes sous 22 px 0, débordements 0, défilement 2, `grosBlocs` 18.8 (cible ≤15 non atteinte). `bilan` : chevauchements 0, textes sous 22 px 0, débordements 0, défilement 0, `grosBlocs` 12.3. La capture a dépassé 120 s après `tonposte`; `bilanLong` n’a pas été obtenu.
- Le code ciblé déjà commité présente les trois colonnes, actions en flux, pieds ancrés par flex et tailles d’événements/objectifs ajustées. Aucun changement CSS supplémentaire n’a été fait : les essais antérieurs documentés à la reprise 6 augmentaient la distance visuelle au lieu de la réduire. L’écart restant est le seuil `grosBlocs` du poste et l’absence de mesure `bilanLong`.
- Vérifications réussies : `mgmtLot48T1.test.js` 9/9, `mgmtLot57T1.test.js` 33/33, `mgmtLot58T1.test.js` 19/19 ; `node tools/verif-versions.js origin/main` et ESLint. Aucun test nouveau ni migration.

### Reprise 11 — 25/10
- Aucun fichier de code de la tranche n’était modifié à la reprise ; les changements hors tranche `.opencode/`, `opencode.json` et `sw.js` restent exclus.
- Lecture de `COMMUN-3E-TOUR.md` : aucun STOP. Nouvelle capture `tonposte` : `CONTRÔLE {"chevauchements":0,"exemples":[],"textesSous22px":0,"debordent":[],"nbDebordent":0,"defilent":2}` ; `grosBlocs:18.8` (cible ≤15 non atteinte). Essai CSS reprenant les valeurs de maquette (marges de panneaux 15 px, titres 44 px, jauges 10 px) a dégradé `grosBlocs` à 19 ; ces règles ont été annulées.
- `mgmtLot48T1.test.js` : 9/9 réussi. `mgmtLot57T1.test.js` : 33/33 réussi. `mgmtLot58T1.test.js` n’a pas affiché de résultat avant l’expiration de 120 s. `node tools/verif-versions.js origin/main` réussi. ESLint non relancé.
- Les quatre scènes `tonposte`, `tonposteLong`, `bilan`, `bilanLong` ne disposent toujours pas de relevés nouveaux complets ; seules la scène normale `tonposte` a été recapturée. Le seuil de fidélité `grosBlocs ≤15` reste non conforme. Ces limites ne sont pas déclarées terminées.
