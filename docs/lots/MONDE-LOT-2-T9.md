# Monde lot 2 T9 — L'écran d'arrivée

## Branche
`monde-lot-2-identites`. Découpée de la T7 le 12/10/2026 par Claude. Retour d'Anthony : « l'écran Votre arrivée a les mêmes problèmes : vide, on ne sait pas ce qu'on doit faire ».

## 1. L'écran d'arrivée (« Votre arrivée »)
Trouve l'écran avec `grep -n "Votre arrivée\|mgmtArrivee\|prise-en-main" mgmt-*.js` (probablement `mgmt-prise-en-main.js`).
- Il remplace la boîte seule sur fond vide par **trois blocs** dans la grille actuelle :
  - **Ton organisation** : les quatre lignes actuelles (caisse, popularité, plus grande salle, première soirée dans N jours),
    en 24 px, valeurs en gras.
  - **Ce qui s'est passé avant toi** : « {n} soirées, {c} combats, {ch} champions en titre, {r} retraités » (valeurs lues dans la partie, les mêmes fonctions que les compteurs du §2).
  - **Ce que tu dois faire maintenant**, trois étapes numérotées : « 1 · Ouvre la Carte : cinq combats à composer. 2 · Laisse
    Leïla proposer, ou choisis toi-même. 3 · Quand la carte est complète, pose la soirée au Calendrier. »
- La réplique de Leïla garde sa barre jaune.
- Bouton jaune « Entrée — Commencer » (existant) inchangé ; il mène à l'écran actuel, l'Accueil du lot 7 le remplacera.
- Ne touche pas au contenu de la planche `maquettes/monde/MondeAccueilArrivee.dc.html` : elle est pour le lot 7. Ceci est le palier d'avant.


## 2. Fichiers
Le fichier trouvé par le grep ci-dessus, `ui-cadre.css` (classes `mf-arrivee-*`), `tests/mgmtArrivee.test.js` (à ajouter à `package.json`, `test` et `test:watch`), `?v=` montés, `SW_VERSION`.

## 3. Tests
1. Les trois blocs sont présents.
2. Les chiffres du passé égalent ceux de la partie (soirées = `eventsPlayed`, combats = `m.hist.length`).
3. Aucun texte sous 22 px.
4. `tests/mgmtPriseEnMain.test.js` reste vert sans retouche (écran `mgmt_arrivee` avant `mgmt_carte`, « matchmaker de Split »).
