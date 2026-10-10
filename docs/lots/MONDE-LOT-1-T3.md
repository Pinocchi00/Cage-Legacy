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
