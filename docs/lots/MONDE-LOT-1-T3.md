# Monde lot 1 T3 et T4 — la génération des six ans, le passage de témoin

**Date :** 10/10/2026 · **Branche :** `monde-lot-1-passe` · **Autorité :** `docs/BRIEF-09-10-UN-MONDE-QUI-A-VECU.md` §Lot 1, T3 et T4 ; consigne du coordinateur (contraintes A à K).

## 1. Objectif

À la création, depuis l'écran Nouvelle partie seulement, le jeu fait vivre l'organisation six ans (62 soirées de 35 jours) sous la main du prédécesseur, puis remet au joueur une organisation dont la caisse, la popularité et les salles sont celles du profil. Le reste (contrats, blessures, attentes, classements, ceintures, historique) est l'héritage.

## 2. Ce qui existe

- Création : `mgmtDefault(orgRef)` (`mgmt-bureau.js`), `mgmtNewRoster(m)` (même fichier), `mgmtNewPile(m)`, `mgmtAgendaInit(m)` (`mgmt-agenda.js`) ; le jeu les enchaîne dans `CL.mgmtEnter` (`mgmt-screens.js`), les outils dans `partie()` de `tools/mesure-management.js`.
- Prédécesseur : `mgmtPredecesseurSoiree(m,k,reglages,mesure)` (`mgmt-predecesseur.js`), exige `G.mgmt===m`.
- Dates : `m.cal.jour` compte les jours depuis `MGMT_CALENDRIER_DEBUT` (12/01/2027) ; `mgmtJourDate(jour)` en dérive le jour et le mois (l'année ne s'affiche jamais).
- `mgmtRunEvent` (`mgmt-corps.js`) appelle `saveMgmt()` à chaque soirée.
- Monde extérieur (`mgmt-monde.js`) : dérivé de `m.cycle`, ouvert par `mgmtExteriorEnsure` dans `mgmtNewPile`. Il avance donc tout seul d'un cycle par soirée : 62 soirées du passé = 62 cycles, aucun code à écrire (point I, vérifié par test).

## 3. Ce qui change

**`mgmt-passe.js` (neuf, après `mgmt-predecesseur.js`)** — simulation pure, aucun DOM, trois pas :
- `mgmtPassePreparer(orgId,opts)` : crée la partie (`mgmtDefault`, graine, `mgmtNewRoster(m,{reculAns})`, `mgmtNewPile`, `mgmtAgendaInit`), pose `G.mgmt=m` et `m.passe={enCours:true,soirees:N}`. Rend `m`.
- `mgmtPasseSoiree(m,k)` : joue UNE soirée (`mgmtPredecesseurSoiree`) et rend l'avancement `{k,n,fait,annee,jouee}`.
- `mgmtPasseCloturer(m)` : le temps (T3) puis le passage de témoin (T4).
- `mgmtPasseGenerer(orgId,opts)` : les trois d'un coup, pour les tests et les outils. `opts.soirees` (62 par défaut) réduit la durée.
- `mgmtSoireesJoueur(m)` : les soirées jouées par le joueur (`eventsPlayed` moins celles du passé).

**`mgmt-bureau.js`** : `mgmtNewRoster(m,opts)`. Sans `opts`, chemin strictement inchangé (mêmes tirages). Avec `opts.reculAns` : l'âge d'arrivée est tiré comme avant puis reculé de six ans (plancher 18) ; le bilan d'avant est le bilan d'aujourd'hui moins les combats que les six ans apporteront (`opts.combatsAttendus`, mesuré) ; le niveau stocké est celui de l'âge reculé.

**Temps (point D).** La partie du passé tourne en jours 0…2205 ; à la clôture le calendrier avance de 35 jours (le vieillissement suit), puis tous les jours sont recalés de `origine = jour` : `cal.jour = 0` (12/01/2027, comme aujourd'hui), les soirées du passé ont des jours négatifs (février 2021 à décembre 2026). `m.cycle`, `eventsPlayed` et les identifiants ne bougent pas : la numérotation continue (la première soirée du joueur est la 63e). Justification : tout le code du jeu lit `cal.jour` à partir de zéro pour le premier jour ; seuls les validateurs de `faites.jour` s'ouvrent aux valeurs négatives.

**Passage de témoin (T4).** À la clôture : `treasury = profil.caisse`, `pop = profil.popularite`, `salles = mgmtSallesCreer(m)`, `comptes = recettes = audiences = []`, `lastEvent = null`. Gardés : contrats, blessures, attentes, faits, classements, ceintures, `hist`, carte, pile.

**Branchements.** `saveMgmt` ne sauvegarde pas tant que `m.passe.enCours` (rien d'une partie à moitié née ne touche l'emplacement). `mgmtEnter(n,orgId,opts)` accepte `opts.partie`. Là où « aucune soirée jouée » signifie « jouée par le joueur » (`mgmt-prise-en-main.js`, `mgmt-demo.js`, `mgmt-finances.js`, `mgmt-emplacements.js`) on lit `mgmtSoireesJoueur(m)` ; `mgmtAgendaJour` gagne le décalage du passé pour les soirées plus anciennes que `faites`.

**Écran (`mgmt-nouvelle.js`, `ui-cadre.css`).** Le bouton et Entrée appellent `CL.mgmtNouvelleLancer()` ; `CL.mgmtNouvelleCreer()` (synchrone, sans passé) reste pour les tests. Pendant la génération la zone de contenu montre « <Organisation> · <année> », une barre pleine largeur et « Création de la partie », sans touche active ; un pas par `requestAnimationFrame` puis `setTimeout(0)`.

## 4. Sauvegarde

`MGMT_SAVE_VERSION` 14 → 15 (ligne isolée, à renuméroter à la fusion). Champ `m.passe` `{soirees,ans,origineJours,...}`, facultatif. `mgmtMigrate` : une 14 passe en 15 sans changement (pas de passé). `validateMgmt` valide `passe` et accepte des `faites.jour` négatifs bornés.

## 5. Textes

Seulement « <Organisation> · <année> » et « Création de la partie ».

## 6. Tests (intitulés exacts)

1. `Monde lot 1 T3 — une partie créée sans le passé est identique à celle d'avant la tranche (empreinte)`
2. `Monde lot 1 T3 — deux créations avec la même graine donnent le même passé`
3. `Monde lot 1 T3 — le passé est joué par pas : k sur N, sans écran`
4. `Monde lot 1 T3 — les dates : le passé en 2021 à 2026, le premier jour du joueur au 12 janvier 2027`
5. `Monde lot 1 T3 — les bilans, les âges et l'effectif du premier jour restent dans les fourchettes`
6. `Monde lot 1 T3 — le monde extérieur a avancé d'autant de cycles que de soirées`
7. `Monde lot 1 T3 — l'écran montre la barre, avance pas à pas et ignore les touches`
8. `Monde lot 1 T4 — la caisse, la popularité et les salles du premier jour sont celles du profil`
9. `Monde lot 1 T4 — les contrats, blessures, attentes, ceintures et historique sont conservés`
10. `Monde lot 1 T4 — chaque catégorie a un champion au premier jour`
11. `Monde lot 1 T3 — une sauvegarde 14 se charge, se valide et joue une soirée`
12. `Monde lot 1 T3 — les six ans complets` (fichier lent, dans `LENTS`)
13. `Monde lot 1 T3 — l'optimisation du booking ne change aucun résultat`

## 7. Pièges

- Ne pas ajouter un seul tirage dans le chemin sans option de `mgmtNewRoster`.
- `saveMgmt` dans `mgmtRunEvent` : à neutraliser pendant le passé (62 écritures d'une partie qui grossit).
- Les consommateurs de `eventsPlayed===0` (tutoriel, démo, finances) : voir §3.
- Le prédécesseur laisse beaucoup de contrats échus : voir questions.

## 8. Questions pour Anthony

Voir le compte rendu.

## Compte rendu — Monde lot 1 T3 et T4 (10/10/2026)

**Fichiers.** `mgmt-passe.js` (neuf : préparer, une soirée, clôturer, tout d'un coup, `mgmtSoireesJoueur`, `mgmtPasseValide`, `mgmtPasseAnnee`) ; `mgmt-bureau.js` (`mgmtNewRoster(m,opts)`, `MGMT_SAVE_VERSION` 15, `mgmtEligiblePairs` plus rapide) ; `mgmt-carte.js` (`mgmtPickBulkPair`, `mgmtCartRows` plus rapides) ; `mgmt-save.js` (migration 14→15, `passe` validé et réparé, `saveMgmt` muet pendant la génération) ; `mgmt-agenda.js` (`faites.jour` négatif admis, décalage du passé dans `mgmtAgendaJour`) ; `mgmt-screens.js` (`mgmtEnter(n,orgId,{partie})`) ; `mgmt-nouvelle.js` + `ui-cadre.css` (la barre, `CL.mgmtNouvelleLancer`) ; `mgmt-prise-en-main.js`, `mgmt-demo.js`, `mgmt-finances.js` (comptent les soirées du joueur) ; `index.html`, `sw.js` (versions), `package.json`, `tools/check-rapide.js` (LENTS).

**Tests ajoutés.** `tests/mgmtPasse.test.js` : les 12 tests de la §6 (intitulés exacts ; le 12 est celui de la vitesse), 45 s. `tests/mgmtPasseSixAns.test.js` (LENTS) : « Monde lot 1 T3 — les six ans complets » et « … une autre organisation, une autre graine », 105 s. Tests existants modifiés, décisions citées : `r.v,14` devient 15 dans `mgmtEffectifs` (2), `mgmtNiveau` (2), `mgmtHumanite`, `mgmtEmplacements` (version de sauvegarde montée, décision G de la consigne) ; `mgmtOrganisations` et `mgmtEmplacements` (Entrée sur Nouvelle partie) posent `MGMT_NOUVELLE.soirees=0` (création sans passé, §3 Écran).

**Résultats.** `npm run check:rapide` : VERT, 868 tests, 0 échec (91 fichiers, 10 écartés). Lents lancés à part : `mgmtPredecesseur`, `mgmtClassementsMemoire`, `mgmtSuivi`, `mgmtSalles`, `mgmtSoireeShow` : 53/53. `verif-versions` : aucun écart.

**Sauvegarde.** 14 → 15 : champ facultatif `passe` `{soirees, origineJours, reculAns, combatsAttendus}` (`enCours` seulement en mémoire pendant la génération). Une partie d'avant n'a pas de passé. La montée est sur la ligne `const MGMT_SAVE_VERSION=15` et le bloc `if(raw.v===14)` de `mgmtMigrate`.

**Chiffres.** Six ans (Split, graine 20261008, `tools/mesure-management.js --six-ans`) : 75,2 s avant, 35,8 s après (booking 51,0 s → 7,8 s). La génération complète avec création : 35 s (Split), 33 s (FPC). Preuve de l'optimisation : l'outil sur 62 soirées donne les mêmes points (10, 20, 40, 62) hors chrono, et le test 12 compare l'état complet après six soirées (graines 20261008 et 20261009). Poids de la partie au premier jour : 886 Ko avec passé contre 236 Ko sans (`facts` 300 Ko pour 5 658 faits, `hist` 292 Ko pour 558 combats à 523 octets, `exterieur` 154 Ko, `roster` 121 Ko). Fourchettes (Split, six graines avant / passé 20261008 et 20261009) : vivants 351–374 / 365 et 350 ; âge moyen 28,50–29,07 / 28,78 et 28,69 ; victoires 11,18–12,10 / 11,64 et 11,39 ; défaites 5,45–6,01 / 5,85 et 5,80 ; combats 17,09–18,32 / 17,66 et 17,37. FPC : âge 31,35–32,07 / 31,56 ; victoires 14,07–14,60 / 14,26 ; combats 21,54–22,39 / 21,73. Les bornes élargies sont dans `mgmtPasseSixAns.test.js`.

**Écarts.** (1) Un passé de six ans ne donne aucun combattant de moins de 24 ans (naissance à 18 ans au plus bas) : Ultimate Rim sort un an plus âgée (26,9 contre 25,2–25,8), avec 9,4 victoires contre 7,8–8,5 ; par tranche d'âge les bilans restent dans la fourchette. (2) La valeur `combatsAttendus` (3) est mesurée : 62 soirées × 18 places / 366 combattants. (3) `mgmtRetraitProb` n'est pas touché (le retrait avant soirée est un geste d'écran, jamais joué par le prédécesseur). (4) `mgmt-emplacements.js` affiche « Soirées jouées 62 » au premier jour : laissé tel quel.

**Point I, le monde extérieur.** Exact et sans code : il est dérivé de `m.cycle`, que chaque soirée du passé avance d'un cycle (`mgmtNewPile`) ; au premier jour `cycle = soirées + 1` et chaque catégorie tient son quota (test 5).

**Questions pour Anthony.** (a) La numérotation continue : la première soirée du joueur est « Fight Night 63 » ; un compteur de soirées du joueur (« Soirée 1 ») est possible, au prix de décaler quarante affichages. (b) Environ 45 % de l'effectif (166 sur 366) est sans contrat au premier jour : le prédécesseur ne signe personne (héritage conservé tel quel, comme demandé) ; faut-il que le prédécesseur renouvelle plus largement (lot 2 T3 / lot 5) ? (c) Les arrivées pendant le passé : aucun jeune ne rejoint Split en six ans (seul le monde extérieur se renouvelle) ; si le prédécesseur doit recruter, cela redonne aussi les combattants de 20 à 23 ans. (d) Le passé s'applique aussi à la démo (35 s de chargement, la fin de démo compte les soirées du joueur) : à confirmer.

**Ce que T5, T6, T7 doivent savoir.** *T5 (archive légère)* : les combats du passé sont dans `m.hist` (558, 523 octets chacun, mêlés à ceux du joueur, ordre chronologique, `c` = cycle) ; les faits dans `m.facts` (5 658, `c` = cycle) ; `m.cal.faites` ne garde que les 24 dernières soirées, mais la date de toute soirée n ≤ `m.passe.soirees` se retrouve par `mgmtAgendaJour(m,n)` (35 jours d'écart, jours négatifs). Les victoires, défaites et nuls affichés d'un combattant contiennent sa part d'avant plus ses combats du passé : sa part d'avant = affichée moins ses entrées de `m.hist` (jamais négative, testé). `m.passe.enCours` n'existe qu'en mémoire. *T6 (Résultats, Ceintures, rôles)* : `mgmtSoirees(m)` numérote déjà de `eventsPlayed` en arrière (62 au premier jour) ; mais `mgmtSoireeJour` rend `null` hors `faites` pour une partie à l'agenda : utiliser `mgmtAgendaJour`. Les ceintures ont déjà leurs douze champions et des règnes dans `m.facts`. *T7 (parties existantes)* : sans `passe`, `mgmtSoireesJoueur(m) = eventsPlayed` ; une 14 migre sans rien changer et reste reconstituée à l'ancienne ; `mgmtAgendaJour` n'y change rien.
