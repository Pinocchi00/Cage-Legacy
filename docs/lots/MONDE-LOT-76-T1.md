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
- Écarts : pas de donnée de sous-ligne événementielle dans `m.poste.hist` ; le code affiche seulement les informations enregistrées, sans inventer de détail. À défaut de patron connu, le nom de l’organisation reste le substitut. Capture `tonposte` : chevauchements 0, textes sous 22 px 0, débordements 0, défilants 2, `grosBlocs` 18.4 (cible ≤15 non atteinte). Le contrôle complet `tonposte,tonposteLong,bilan,bilanLong` a dépassé le délai de l’outil après le premier écran ; les cibles de `tonposteLong`, `bilan` et `bilanLong` restent donc à confirmer. Fichiers `.opencode/`, `opencode.json` et modifications préexistantes de `index.html`/`sw.js` laissés hors commit, à l’exception des versions requises dans `index.html`.
- Questions pour Anthony : aucune.
