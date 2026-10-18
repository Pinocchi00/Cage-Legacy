# Monde lot 19 T7 — mode Duo : le menu, les emplacements, l'entrée dans une partie Duo, l'effectif en lecture

Branche : `mode-duo`. **Spécification : `docs/lots/DUO-T3.md` (lis-la en entier ; cette fiche en retient UNE PART, les autres parts sont d'autres tranches) ; planches validées par Anthony : `maquettes/duo/` (elles priment sur la fiche pour tout ce qui se voit).** Le moteur `mgmt-duo.js` est livré (T0 à T6) : lis ses fonctions, n'y change que ce que cette fiche demande.
Règles communes du lot 19 : cherche toi-même dans le code (grep/glob) ; **tout texte nouveau est `relu:false`** ; le jeu tutoie ; aucun `Math.random()` ; aucune modification du moteur de combat (`engine-combat*.js`) ; un test existant n'est réécrit que pour une décision citée ; `node tools/_bump.js` sur chaque `.js` modifié ; `node tools/verif-versions.js origin/main` ; la version de sauvegarde `MGMT_SAVE_VERSION` ne change pas (champ facultatif `m.duo`) ; **lance les tests UN FICHIER À LA FOIS** (`node --test tests/<fichier>.test.js`), jamais `npm run check` en entier ; si un test reste rouge ou si tu bloques, commite l'état avec « (inachevé) » dans le message et décris précisément le blocage dans le compte rendu : jamais de travail non commité.
**Tu écris le code en lisible (une instruction par ligne), tu ne t'arrêtes pas au premier obstacle : si un test échoue, tu le corriges ; tu ne rends « inachevé » qu'après avoir réellement essayé et seulement avec le blocage précis.**

## Ce que tu fais (DUO-T3 §1, et la fonction pure du §4)
1. Le menu : entrée « Duo » dans `MF_MENU` (`mgmt-cadre.js`), `CL.mgmtDuoParties()`, `MGMT_PARTIES.duo`, `mgmtPartieOuvrir` (emplacement vide en mode Duo → `CL.mgmtDuoNouvelle(n)` : l'écran vient en T8, laisse un écran minimal temporaire qui dit « bientôt » si `SCREENS.mgmt_duo_nouvelle` est absent), `mgmtPartieHtml` (`DUO · {org J1} × {org J2}`, `Super carte {n}`). La démo ne montre pas le Duo.
2. `CL.mgmtEnter` : une partie Duo s'ouvre sur `mgmt_duo` (l'écran vient en T9 : si `SCREENS.mgmt_duo` est absent, retombe sur l'écran actuel).
3. Dans `mgmt-duo.js` : `mgmtDuoEffectif(m,cote,divId)` (spécification §4) ; `mgmtDuoResume` rend aussi `rounds` pour chaque combat (déjà le cas : vérifie).
4. Fichier neuf `mgmt-duo-ecrans.js` (§« Fichier neuf », index.html juste avant `main.js`), vide d'écrans pour l'instant : seulement l'ancre et les tableaux d'état (`MGMT_DUO_NOUVELLE`, `MGMT_DUO_QG`).

## Tests — `tests/mgmtDuoEcrans.test.js` (nouveau, dans `test` et `test:watch`), intitulés `Duo T3 — <point>`
Points (1) menu hors démo / pas en démo, (2) emplacement vide en mode Duo, (5) une partie Duo rouverte ouvre `mgmt_duo` (ou retombe), (10) l'emplacement affiche `DUO · … × …`, et un test de `mgmtDuoEffectif` (tri par rang, états, `restants`, forme). **Un monde coûte 40 à 90 s : n'en crée qu'un par test** (`setSeed(20261018); mgmtPasseGenerer('split',{soirees:6}); mgmtMondeVivantGenerer(G.mgmt,{soirees:6}); mgmtDuoCreer(G.mgmt,'mma-korner',{a:'Anthony',b:'François'});`). Un fichier à la fois, délai 590 s.

## Fin
`node tools/_bump.js` sur chaque `.js` touché, `node tools/verif-versions.js origin/main`, commit `Monde lot 19 T7 : le menu Duo, les emplacements, l'entrée dans une partie Duo, l'effectif en lecture`.

## Compte rendu

- `mgmt-cadre.js` : entrée « Duo » au menu principal ; `mfMenu()` conserve son filtre de démo.
- `mgmt-emplacements.js` : mode duo pour les emplacements partagés, création temporaire, affichage DUO/super carte ; retour à `CL.mgmtParties()` remet le mode solo.
- `mgmt-screens.js` : une reprise Duo ouvre `mgmt_duo` si l'écran est enregistré, sinon garde le chemin actuel.
- `mgmt-duo.js` : fonction de lecture `mgmtDuoEffectif`, rang organisationnel, état de contrat/blessure/libre et forme récente.
- `mgmt-duo-ecrans.js` : déclaration des états interface et écran temporaire de création ; chargé juste avant `main.js`.
- Tests : `Duo T3 — le menu Duo existe hors démo et reste masqué en démo`, `Duo T3 — emplacement vide en mode Duo ouvre la création temporaire`, `Duo T3 — une partie Duo rouverte ouvre mgmt_duo si l’écran existe`, `Duo T3 — l’emplacement affiche le libellé DUO et la prochaine super carte`, `Duo T3 — mgmtDuoEffectif lit le côté B, trie et expose son état`, `Duo T3 — aucun texte de travail dans les écrans ajoutés`.
- Sauvegarde inchangée. Reprise de relecture : `tests/mgmtDuoEcrans.test.js` est inscrit dans `test` et `test:watch`. Aucun des fichiers hors périmètre listés dans la reprise n'est inclus dans cette tranche. L’écran effectif reste hors de cette tranche ; aucun contrôle visuel réalisé.
- Questions pour Anthony : aucune.

