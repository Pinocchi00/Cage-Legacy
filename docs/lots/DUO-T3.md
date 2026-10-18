# DUO-T3 — entrer dans le Duo : menu, création à deux, QG, effectifs

Branche : `mode-duo`, après DUO-T2. Brief : `docs/BRIEF-18-10-MODE-DUO.md`. Commit : `Duo T3 : menu, création à deux, QG et effectifs`.
Version de sauvegarde inchangée.

**Planches** : `maquettes/duo/` (`DuoCreation`, `DuoQG`, `DuoEffectif`, lire `maquettes/duo/LISEZ-MOI.md`). **Rien ne se code avant
qu'Anthony les ait validées** ; ensuite elles priment sur cette fiche pour tout ce qui se voit : porte leurs valeurs exactes (positions,
tailles, couleurs, textes — `src/duo.css` et `src/commun.css`), ne les décris pas. Pour le reste, les composants existants (`mfEcran`,
`mfBouton`, `mgmtNouvelleOrgHtml`, classes de l'Effectif). Règles du cadre inchangées : **aucun texte sous 22 px**, rien ne déborde ni ne se
superpose à 1280, 1440 et 1920 px (`mfAjuste`), `esc()` sur **tout** nom. Le CSS neuf va dans `ui-cadre.css` sous
`/* ==== [ANCRE: DUO_T3_ECRANS] ==== */`, avec des classes préfixées `mf-duo-`.

## Fichier neuf `mgmt-duo-ecrans.js`

`"use strict";`, ancre `DUO_T3_ECRANS`. Dans `index.html`, **juste avant** `main.js` (après `mgmt-animations.js`) : il lit
`mfEcran`, `SCREENS`, `CL`, `keysRegister` au chargement. Les écrans enregistrés ici : `mgmt_duo_nouvelle`, `mgmt_duo`,
`mgmt_duo_effectif`, `mgmt_duo_histo`. Les données viennent de `mgmt-duo.js` ; aucune règle de jeu dans ce fichier.

## 1. Le menu et les emplacements

- `MF_MENU` (`mgmt-cadre.js`) : une entrée après « Management » :
  `{id:'duo',t:'Duo',sous:'À deux sur ce PC',action:'CL.mgmtDuoParties()',fn:()=>CL.mgmtDuoParties(),classe:'title-duo'}`.
  `mfMenu()` ne change pas : la démo (`CL_DEMO`) ne garde que management, options et quitter, donc pas le Duo.
- `CL.mgmtDuoParties()` : comme `CL.mgmtParties()` (`mgmt-emplacements.js`) avec `MGMT_PARTIES.duo=true` ;
  `CL.mgmtParties()` remet `duo:false`. Les trois emplacements sont **les mêmes** que le solo.
- `mgmtPartieOuvrir` : emplacement vide **et** `MGMT_PARTIES.duo` → `CL.mgmtDuoNouvelle(n)` ; sinon inchangé.
- `mgmtPartieHtml` : une partie avec `m.duo` affiche `DUO · {org de J1} × {org de J2}` comme organisation, et
  `Super carte {n}` (prochaine, `mgmtDuoScore(m)`) à la place de « La prochaine soirée … Fight Night ».
- `CL.mgmtEnter` (`mgmt-screens.js`) : juste après `if(mgmtAgendaSuivante(G.mgmt)) saveMgmt();`, ajoute
  `if(typeof mgmtDuoActif==='function'&&mgmtDuoActif(G.mgmt)){ CL.go('mgmt_duo'); return; }` — une partie Duo ne s'ouvre
  **jamais** sur l'Accueil, l'arrivée ou une soirée ordinaire (personne ne les joue à la main en Duo).

## 2. La création à deux — écran `mgmt_duo_nouvelle`

État d'interface (jamais sauvegardé) : `MGMT_DUO_NOUVELLE={slot,etape:'noms'|'a'|'b',noms:{a:'',b:''},a:null,i:0}`.

1. **`noms`** : deux champs texte (`maxlength="16"`), étiquettes « Joueur 1 » et « Joueur 2 », la saisie met à jour l'état
   sans re-rendre l'écran (le curseur ne doit pas sauter). Bouton jaune « Continuer » (Entrée). Champs vides acceptés :
   `mgmtDuoCreer` mettra « Joueur 1 » / « Joueur 2 ». Échap → retour aux emplacements.
   Pendant la saisie, les touches du jeu ne doivent rien déclencher d'autre qu'Entrée et Échap (vérifie `ui-11-keys.js` :
   une lettre tapée dans le champ ne doit pas lancer un raccourci).
2. **`a`** : la grille des huit organisations (mêmes cartes et même aperçu que « Nouvelle partie »), libellé
   `{nom J1} · choisis ton organisation`. Flèches et clic comme `mgmt_nouvelle`. Entrée → `a`, puis l'étape `b`.
3. **`b`** : la même grille, libellé `{nom J2} · choisis ton organisation` ; la carte de J1 est grisée (`aria-disabled`,
   non choisissable, le curseur la saute) avec la mention `{nom J1}`. Entrée → lance la création **par le chemin existant** :
   `MGMT_NOUVELLE={gen:null,slot,i:<index de a>,duo:{b:<orgId>,noms}}`, `CL.go('mgmt_nouvelle')`, `CL.mgmtNouvelleLancer()`.
   Échap revient à l'étape précédente.

Modifications additives de `mgmt-nouvelle.js` (trois lignes, rien d'autre) :
- `mgmtNouvelleLancer` : copie `duo:MGMT_NOUVELLE.duo||null` dans `MGMT_NOUVELLE.gen` ; une création Duo force `avecMonde:true`.
- `mgmtNouvelleRecommencer` : recopie `duo` comme les autres champs.
- `mgmtNouvelleEntrer` : si `g.duo`, `mgmtDuoCreer(m,g.duo.b,g.duo.noms)` **avant** `CL.mgmtEnter(slot,undefined,{partie:m})` ;
  `mgmtNouvelleAbandonner` d'une création Duo ramène à `CL.mgmtDuoNouvelle(slot)` étape `b`.

## 3. Le QG — écran `mgmt_duo`

`mfEcran(contenu,{barre:'logo',plaque:'Duo',libelle:'{nom J1} × {nom J2}',droite:'Saison {s} · super carte {numero} sur 4',touches:[…]})`.

**Deux colonnes égales, une par joueur** (J1 à gauche, J2 à droite), même contenu des deux côtés :
- le nom de l'organisation, en grand ; dessous le nom du joueur ;
- le score de la saison en gros chiffre (`mgmtDuoScore(m).a` / `.b`) ;
- `En caisse` : `mgmtEuros(partie.treasury)` ; `Classement des organisations` : le rang de l'organisation dans
  `mgmtOrgClassement(m)` ; `Champions` : le nombre de catégories où `mgmtDuoResume(m,cote).champions` a un champion ;
- `Depuis la dernière super carte` : `{soirees} soirées`, puis au plus 6 lignes de `mgmtDuoResume(m,cote).combats` :
  `{vainqueur} bat {perdant} · {catégorie} · {méthode}` ; la méthode est `mgmtSuMethodeFamille({nul:winner==='D',family,round,rounds})`
  (`mgmt-suivi-cadre.js`, le libellé du tableau de l'écran Résultats) — **jamais un rejeu** : les combats de J2 sont allégés
  et ne se rejouent pas, et rejouer 12 combats à chaque affichage serait lent ; aucune ligne → `Rien encore`.
  `mgmtDuoResume` rend donc aussi `rounds` pour chaque combat.

**Au centre, sous les colonnes** : `Prochaine super carte : {mgmtJourDateTexte(m.duo.prochaine)}` et le bouton jaune de l'étape :

| `m.duo.etape` | Bouton (Entrée) | Effet |
|---|---|---|
| `attente` | `Avancer jusqu'à la super carte` | la progression ci-dessous |
| `encheres` | `Ouvrir les enchères` | `CL.go('mgmt_duo_encheres')` (DUO-T4) |
| `draft` | `Composer la super carte` | `CL.go('mgmt_duo_draft')` (DUO-T4) |
| `pret` | `Lancer la super carte` | `CL.go('mgmt_duo_draft')` (DUO-T4) |
| `soiree` | `Reprendre la soirée` | `CL.go('mgmt_duo_soiree')` (DUO-T4) |
| `bilan` | `Voir le bilan` | `CL.go('mgmt_duo_bilan')` (DUO-T4) |

En T3, un écran de DUO-T4 absent de `SCREENS` → le bouton n'est pas affiché, l'étape s'écrit en texte.

**La progression** (`CL.mgmtDuoAvancer()`) : un pas `mgmtDuoAvancerPas(G.mgmt)` par image (motif `mgmtNouvelleGenSuite` :
`requestAnimationFrame` puis `setTimeout(…,0)`), l'écran montre une barre (jour courant / date de la super carte, en
partant du jour où l'on a appuyé) et `Les soirées des adjoints se jouent · {date du jour courant}`. Aucune touche n'agit pendant
la progression : on ne l'interrompt pas (chaque pas est sauvegardé, un rechargement reprend à l'étape `attente`). À la
fin, le QG se ré-affiche avec le bouton de l'étape suivante. Une erreur pendant un pas : message `La progression s'est
arrêtée. Réessayer` (bouton), `G.mgmt` rendu, rien d'autre.

**Autres boutons** : `Effectif de {nom J1}` (touche `1`), `Effectif de {nom J2}` (touche `2`), `Super cartes passées`
(touche `H`, seulement s'il y en a), `Quitter` (Échap → `CL.mgmtLeave()`).

## 4. L'effectif d'un joueur — écran `mgmt_duo_effectif`

Fonction pure dans `mgmt-duo.js` : `mgmtDuoEffectif(m,cote,divId)` → `[{id,name,rang,W,L,D,age,etat,restants,forme}]`, lue
dans `mgmtDuoAvec`, triée par rang (sans rang en dernier) : `etat` = `'dispo'` | `'blesse'` (suspendu : `f.susp>=partie.cycle`)
| `'libre'` (`f.libre`) | `'refuse'` (`mgmtContratIndispo` vrai) ; `restants = mgmtContratRestants(f)` ; `forme` = les
3 derniers résultats (`mgmtResultatsDetail(partie,f)`, `'v'|'d'|'n'`, comme l'affiche de l'accueil).

Écran : en-tête `Effectif · {org} · {nom du joueur}` ; onglets de catégorie (`mgmtDivisionLabel`, ← →) ; liste : rang,
nom, bilan `W-L-D`, âge, forme (trois pastilles), état (`Disponible`, `Blessé`, `Sans contrat`, `Refuse de combattre`),
`{n} combats au contrat`. `Tab` passe à l'effectif de l'autre joueur ; Échap → QG. Pas de fiche ni d'action : on regarde.

## 5. Les super cartes passées — écran `mgmt_duo_histo`

Liste de `m.duo.cartes`, la plus récente en haut : `Super carte {n} · {date} · {nom J1} {x} – {y} {nom J2}`, puis ses 6
combats (`{na} – {nb} · {catégorie} · vainqueur · méthode · R{round}`). Chaque combat a `Revoir` :
`mgmtCombatOuvrir({trace:m.hist[c.h],etiquette:'SUPER CARTE',retour:'mgmt_duo_histo',salle:{taux:1,prog:1}})`. Échap → QG.

## Textes (interface, à relire par Anthony, liste dans le compte rendu)

`Duo`, `À deux sur ce PC`, `Joueur 1`, `Joueur 2`, `Continuer`, `choisis ton organisation`, `Prochaine super carte`,
`Avancer jusqu'à la super carte`, `Les soirées des adjoints se jouent`, `Ouvrir les enchères`, `Composer la super carte`,
`Lancer la super carte`, `Reprendre la soirée`, `Voir le bilan`, `Depuis la dernière super carte`, `Rien encore`,
`Effectif de`, `Super cartes passées`, `Disponible`, `Blessé`, `Sans contrat`, `Refuse de combattre`, `combats au contrat`,
`La progression s'est arrêtée`, `Réessayer`. Tutoiement. Aucun texte de personnage.

## Tests — nouveau fichier `tests/mgmtDuoEcrans.test.js` (dans `test` et `test:watch`)

Intitulés `Duo T3 — <point>` : (1) le menu montre « Duo » hors démo et pas en démo ; (2) emplacement vide en mode Duo →
`mgmt_duo_nouvelle` ; (3) les noms, J1 choisit, J2 ne peut pas choisir la même organisation ; (4) une création courte
(`MGMT_NOUVELLE.soirees` petit, comme les tests de création existants) se termine sur `mgmt_duo` avec `m.duo` posé ;
(5) une partie Duo rouverte (`CL.mgmtEnter(n)`) ouvre `mgmt_duo`, jamais `mgmt_accueil` ; (6) le QG montre les deux
organisations, les deux noms (passés par `esc` : un nom `<b>O'Neil</b>` s'affiche en texte), le bouton de l'étape ;
(7) `CL.mgmtDuoAvancer()` va jusqu'à la date et le QG montre le bouton suivant ; (8) l'effectif de J2 liste des
identifiants préfixés de son organisation et `Tab` bascule ; (9) aucun texte de travail (`EMPLACEMENT AUTEUR`, `TODO`) ;
(10) l'emplacement d'une partie Duo s'affiche `DUO · … × …`.

## Vérification

Tests ciblés puis `npm run check:rapide`. `node tools/_bump.js` sur chaque `.js` touché, `node tools/verif-versions.js origin/main`.
**Contrôle visuel obligatoire** (charte §3) : captures du QG, de l'effectif et de la création à 1280, 1440 et 1920 px sur
une partie Duo avec passé (fenêtre visible : la création se fige quand le panneau est caché). Joins-les au compte rendu.

## Hors périmètre

Les écrans des enchères, du draft, de la soirée et du bilan (DUO-T4). Toute fiche ou action sur un combattant depuis le Duo.

## Pièges

- La création passe **par** `mgmt-nouvelle.js` : ne recopie pas la génération du passé ni la barre.
- `CL.mgmtEnter` d'une partie Duo ne doit pas appeler l'arrivée (`mgmt_arrivee`) même sur une partie neuve.
- La progression appelle des fonctions longues : ne fais **jamais** deux pas dans la même image.
