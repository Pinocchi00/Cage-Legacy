# Monde lot 8 T1 : la marque

**Branche** : `monde-lot-8-marques` (vérifiée : branche courante). Dépend de rien d'autre. Piste B.

## 1. Objectif
Une petite marque jaune à côté du nom d'un combattant, dans chaque liste, dit qu'il lui est arrivé quelque chose depuis que le joueur a ouvert sa fiche. Ouvrir la fiche l'éteint partout, même après un rechargement.
Brief (Lot 8, T1) : « La partie retient, pour chaque combattant, la dernière semaine où sa fiche a été ouverte. C'est un changement de format : migration et validation. Un seul morceau de code dessine la marque, pour toutes les listes. »

## 2. Ce qui existe (vérifié)
- `MGMT_SAVE_VERSION=14` : `mgmt-bureau.js:81`. `mgmtDefault(orgRef)` : `mgmt-bureau.js:86`.
- `validateMgmt` `mgmt-save.js:225` (modèle : `raw.fil` ligne 265). `mgmtMigrate` `mgmt-save.js:354` (modèle : bloc `13 → 14`, le dernier). `mgmtRepair` `mgmt-save.js:474` (modèle : `m.fil` ligne 478). `saveMgmt()` `mgmt-save.js:661`.
- Le temps du jeu est le cycle `m.cycle` (c'est « la semaine » du brief et du conteur). Un cycle a DEUX moments : avant la soirée, puis après (résultats, blessures). `m.facts` et `m.hist` ne font que grandir (`mgmtAddFact` `mgmt-bureau.js:465`) : leur longueur est une horloge exacte. Un numéro de semaine seul ne sait pas dire si un combat joué CE cycle, après l'ouverture de la fiche, est nouveau.
- La fiche s'ouvre à DEUX endroits seulement : `CL.mgmtFiche(id)` `mgmt-screens.js:316` (pose `MGMT_FICHE` ligne 323) et `CL.mgmtFicheAutre(delta)` `mgmt-fiche-cadre.js:90` (← →, change `MGMT_FICHE.id` ligne 93). `MGMT_FICHE` est déclaré `mgmt-ecran-fiche.js:4`.
- Le motif de la barre des sections : `<i class="mf-oct" aria-hidden="true"></i>` (`mgmt-cadre.js:93`), style `ui-cadre.css:63` (`.mf-oct`, fond `var(--mf-jaune)`=`#F0B220`, `clip-path:polygon(29.3% 0,70.7% 0,100% 29.3%,100% 70.7%,70.7% 100%,29.3% 100%,0 70.7%,0 29.3%)`) et ligne 64 (`18px`). `mfMarque` (V/D/N) existe déjà `mgmt-cadre.js:128` : ne pas le toucher, ne pas réutiliser son nom.
- Événements existants rangés dans la partie : faits `m.facts` (`{c,k,a,…}`), traces `m.hist`. Le fil `m.fil` et les scénarios (`mgmt-scenarios.js`) ne stockent rien de neuf : leurs effets passent par des faits `demande` (`mgmt-promesses.js:182,199`).

## 3. Ce qui change
**Stockage** : `m.visites = { idCombattant: [nFaits, nCombats] }`. Pourquoi ce format : deux entiers par combattant, `m.facts.length` et `m.hist.length` au moment de l'ouverture ; une seule table, aucun champ sur chaque ligne ; exact là où une semaine ne l'est pas. Absent = `[0,0]` (rien vu).

**`mgmt-attention.js`** (nouvelle ancre `MONDE_LOT8_T1_MARQUE`, en fin de fichier, état pur, aucun DOM) :
- `const MGMT_MARQUE_FAITS=['moment_vie','demande','attend','injury','susp','retired'];`
- `const MGMT_MARQUE_LIBELLE={texte:'Du nouveau depuis ta dernière visite',relu:false};`
- `/** @returns {number[]} [nFaits,nCombats] vus */ function mgmtVisiteDe(m,id)` : lit `m.visites[id]`, sinon `[0,0]`.
- `/** Les événements arrivés à id depuis sa dernière visite, dans l'ordre. @returns {Array<{type:'fait',i:number,fait:object}|{type:'combat',i:number,trace:object}>} */ function mgmtEvenementsDepuis(m,id)` : parcourt `m.facts` de l'index `v[0]` à la fin (`i` = index dans `m.facts`), garde `x.a===id` et `MGMT_MARQUE_FAITS.includes(x.k)`. Pour `moment_vie`, garde seulement si `mgmtVieMomentById(x.m)` existe, a `relais.length>0` et `mgmtVieTexte(moment)` non nul (même règle que le conteur, `mgmt-attention.js:mgmtConteurCandidats`). Puis parcourt `m.hist` de `v[1]` à la fin : garde `t.slot==='main'` et (`t.a.id===id` ou `t.b.id===id`). Id invalide ou `m` absent : `[]`.
- `function mgmtMarque(m,id)` : `mgmtEvenementsDepuis(m,id).length>0`. Pur, ne modifie rien.
- `function mgmtVisitesInit(m)` : `m.visites={}` puis, pour chaque ligne `o` de `m.roster` (tolérer `roster`, `facts`, `hist` absents) avec `mgmtValidId(o.id)` : `m.visites[o.id]=[(m.facts||[]).length,(m.hist||[]).length]`. Tout est « vu ».
- `function mgmtVisitesValide(v)` : objet simple (pas tableau) ; chaque clé passe `mgmtValidId` ; chaque valeur est un tableau de 2 entiers sûrs ≥ 0.
- `function mgmtVuEnregistre(m,id)` : si `!mgmtValidId(id)` renvoie `false`. Crée `m.visites` si absent. Calcule `[m.facts.length,m.hist.length]`. Si identique à la valeur stockée, renvoie `false` ; sinon l'écrit et renvoie `true`.

**Ne sont PAS des événements** (décision de la T1) : les actes du joueur (`promesse`, `refus`, `contrarie`, `contrat`, `recrue`, `offre`, `engage`, `retrait*`, `reduite`, `swapped`, `ignored`) ; `title_initial` ; `libere`, `fin_contrat`, `depart_attente` (aucune phrase affichable aujourd'hui : la marque ne pourrait pas être expliquée par la fiche, T2) ; les combats de préliminaire ; les rivalités et scénarios dérivés (déjà portés par `demande`) ; les citations de médias (dérivées de la soirée).

**`mgmt-bureau.js`** : `MGMT_SAVE_VERSION=15` ; `mgmtDefault` ajoute `visites:{}` ; compléter le commentaire de version.

**`mgmt-save.js`** : voir §4.

**`mgmt-ecran-fiche.js`** (près de la ligne 4) : `function mgmtFicheVue(id)` : `const m=G&&G.mgmt; if(m&&mgmtVuEnregistre(m,id)) saveMgmt();`. On ne sauve que si la valeur a changé (une sauvegarde pèse ~350 Ko après dix soirées).

**Le point d'ouverture unique** : appeler `mgmtFicheVue(...)` dans les deux endroits ci-dessus, et nulle part ailleurs : `mgmt-screens.js`, `mgmtFiche(id)`, juste après `MGMT_FICHE={id,retour,cursor:0};` (ligne 323) ; `mgmt-fiche-cadre.js`, `mgmtFicheAutre`, juste après `MGMT_FICHE.id=…` (ligne 93), avant `render()`.

**`mgmt-screens.js:369`** : dans `if(!loadMgmt()){ … }`, appeler `mgmtVisitesInit(G.mgmt);` juste avant `saveMgmt();`. Une partie neuve démarre sans marque (57 combattants sur 364 s'allumeraient sinon dès le premier cycle).

**Le morceau de code unique qui dessine** : `mgmt-cadre.js`, juste après `mfMarque` (ligne 128) :
`/** La marque d'un nom : un octogone jaune de 18 px, ou '' si rien n'est arrivé. Seul dessinateur de la marque. */ function mfMarqueNom(m,id)` renvoie `''` si `!mgmtMarque(m,id)`, sinon `<span class="mf-oct mf-oct-nom" role="img" aria-label="${esc(MGMT_MARQUE_LIBELLE.texte)}" title="${esc(MGMT_MARQUE_LIBELLE.texte)}"></span>`. `m` est passé en paramètre : jamais `G.mgmt` dedans. Aucun autre fichier ne contient `mf-oct-nom`, sauf le CSS.
**`ui-cadre.css`**, après la ligne 64 : `.mf-oct-nom{width:18px;height:18px;flex:none;margin-left:10px;vertical-align:middle}` puis `.mf-eff-nom .mf-oct-nom,.mf-su-l-nom .mf-oct-nom,.mf-su-ca-mn .mf-oct-nom,.mf-su-r-nom div .mf-oct-nom,.mf-car-slot-n .mf-oct-nom{margin-left:0;align-self:center}` (ces conteneurs sont en flex avec un `gap`).

**Où la marque s'insère** (liste exhaustive des fonctions de rendu d'un nom en liste ; la marque va À LA FIN de la cellule du nom, jamais avant : rien d'existant ne bouge, rien n'est recouvert, L4 de la charte) :
1. `mgmt-effectif.js:88` `mgmtEffectifLigneHtml(m,x,i,choisi)` : dernier enfant de `<div class="mf-eff-nom">` (ligne 94), `mfMarqueNom(m,f.id)`.
2. `mgmt-contrats-ecran.js:61` `mgmtContratsLigneHtml(m,x,i,choisi)` : idem, `<div class="mf-eff-nom">` (ligne 67).
3. `mgmt-suivi-cadre.js:39` `mgmtSuNom(n,largeurPx,pPrenom,pNom,mini,sur)` : ajouter un 7e paramètre `marque` (chaîne HTML, défaut `''`), placé à la fin du premier `<span>` (le prénom).
4. `mgmt-suivi-cadre.js:57` `mgmtSuCarteClassement(m,x,selectionne,k)` : les deux appels de `mgmtSuNom` (lignes 63 et 68) passent `''` en 6e argument (`sur`) et `mfMarqueNom(m,x.id)` en 7e.
5. `mgmt-suivi-cadre.js:71` `mgmtSuLigneClassement(m,x,selectionne,k)` : dernier enfant de `<div class="mf-su-l-nom">` (ligne 76).
6. `mgmt-suivi-cadre.js:111` `mgmtSuCeintureCarte(m,d,k,selectionne)` : à la fin de `<span>${esc(n.first)}</span>` (ligne 116), seulement si `belt.id`, `mfMarqueNom(m,belt.id)`.
7. `mgmt-suivi-cadre.js:140` `mgmtSuReignLigne(m,r,k,total,actuelle)` : à la fin du `<div>` qui porte `<b>nom</b><span>prénom</span>` (ligne 144), `mfMarqueNom(m,r.id)`.
8. `mgmt-suivi-cadre.js:148` `mgmtSuCeintureDetail(m)` : l'appel `mgmtSuNom(n,640,56,150,60)` (ligne 155) devient `mgmtSuNom(n,640,56,150,60,'',mfMarqueNom(m,belt.id))`.
9. `mgmt-suivi-cadre.js:205` `mgmtSuCampGrand(m,g)` : dernier enfant de `<div class="mf-su-ca-mn">` (ligne 209), `mfMarqueNom(m,f.id)`.
10. `mgmt-carte-cadre.js:90` `mgmtCarteCombatLigne(m,i,fight,etatMain)` : dans `<div class="mf-car-slot-n">`, une marque juste après CHAQUE `</b>` : lignes 100 (`fa`, `fb`) et 108 (`pa`, `pb`) ; passer `fa&&fa.id` (peut être absent).
11. `mgmt-carte-cadre.js:136` `mgmtCarteAdvLigne(m,f,i,choisi,homo)` : DANS le `<b style="font-size:…">` du nom (ligne 141), après le nom, pas à côté (le parent est en `space-between` : un 3e enfant décalerait le bilan). Sert aussi la liste « Autres choix » des Préliminaires.
12. `mgmt-prelims.js:27` `mgmtPrelimsLigne(m,s,i,choisi)` : après chaque `</b>` de `<div class="mf-car-slot-n">` (ligne 33), `fa.id` et `fb.id`.

**Exclus, à ne pas toucher** : Presse et Résultats (le nom y est dans un titre-phrase en grand corps, `mgmtSuPresseTitreHtml`, `mgmtSuQui`) ; Calendrier et Finances (pas de liste de combattants) ; les détails du combattant choisi (`mgmtEffectifApercuHtml`, `mgmtCarteBanniere`, `mgmtCarteColonne`, boutons `mf-pre-cote`) ; la fiche et sa bannière ; les écrans hérités d'avant l'agenda (`mgmt-ecran-classements.js`, `mgmt-ecran-vestiaire.js`, `mgmt-ecran-carte.js`, `mgmt-ecran-semaine.js`, `mgmt-recrutement.js`).

## 4. Sauvegarde : oui. `MGMT_SAVE_VERSION` passe de 14 à 15.
**Si `main` porte déjà une version 15 au moment de la fusion, c'est Claude qui renumérote.** Ne renumérote pas toi-même.
- **Migration 14 → 15** (`mgmtMigrate`, après le bloc `13 → 14`, ancre `[ANCRE: MONDE_LOT8_T1_MIGRATION]`) : `if(raw.v===14){ mgmtVisitesInit(raw); raw.v=15; }`. Choix : tous les combattants déjà dans la partie sont considérés vus à l'instant de la migration, donc 0 marque au premier chargement (sinon 351 sur 364 s'allumeraient après dix soirées). Sans perte : aucun autre champ n'est touché.
- **`validateMgmt`** : `if(raw.visites!==undefined&&!mgmtVisitesValide(raw.visites)) return false;` (toléré absent, comme `fil`, pour les états construits par les tests).
- **`mgmtRepair`** : `if(!mgmtVisitesValide(m.visites)) mgmtVisitesInit(m);`.

## 5. Textes
Aucun à commander. Une seule étiquette fonctionnelle (`MGMT_MARQUE_LIBELLE`, `relu:false`) sert d'`aria-label` et d'infobulle.

## 6. Écran
Pas de planche : la marque n'est pas un écran, c'est le motif existant `.mf-oct` posé sur des lignes qui existent. Valeurs exactes : 18 × 18 px, `#F0B220`, même `clip-path` que la barre. Charte : L4 (jamais de chevauchement), S7 (pas de jargon). La relecture à 1920 px est faite par Claude, pas par toi.

## 7. Tests : `tests/mgmtMarque.test.js` (à ajouter dans `package.json`, scripts `test` ET `test:watch`)
Modèle d'amorce : `tests/mgmtSuivi.test.js:11` (`neuve(seed)`) et `tests/helpers/jouerSoirees.js`. Modèle de migration : `tests/mgmtNiveau.test.js:112`. Graine 7.
1. `Marque — mgmtMarque allume pour un moment relayé, une blessure, une demande et un combat du carton principal` : `neuve(7)`, `mgmtVisitesInit(m)`, vérifier `mgmtMarque` faux pour 3 combattants A, B, C ; pousser `{c:m.cycle,k:'injury',a:A}` : vrai pour A seul ; un moment avec `relais.length>0` pour B : vrai ; `{k:'demande',want:'revanche',…}` pour C : vrai.
2. `Marque — un acte du joueur, un moment sans relais et un combat de préliminaire n’allument pas` : après `mgmtVisitesInit`, pousser `contrat`, `promesse`, `refus` sur D ; un moment dont `relais.length===0` (il y en a 5 sur 109) sur E ; une trace copiée avec `slot='prelim'` et `a.id=F` : D, E, F restent faux (3 assertions `false`).
3. `Marque — après une soirée, exactement les combattants du carton principal et ceux qui ont un fait compté sont allumés` : `mgmtVisitesInit`, `jouer(win,1)` ; pour les 364 lignes, `mgmtMarque` égal à (id dans une trace `main`) OU (fait compté d'index ≥ longueur d'avant) ; au moins 2 allumés.
4. `Marque — la marque est dessinée dans chaque liste où le nom figure` : un fait `injury` poussé pour chacun des 364 combattants, puis chaque écran rendu (`CL.go`), nombre de `.mf-oct-nom` EXACT (mesuré en graine 7, avant la tranche) : Effectif `mgmt_effectif` 9 (dans `.mf-eff-nom`) ; Contrats `mgmt_contrats` 9 (`.mf-ct-ligne .mf-eff-nom`) ; Classements `mgmt_classements`, `MGMT_SU_CL={sexe:'H',div:'H-light',curseur:0,portee:'organization'}` 9 (1 `.mf-su-champ-nom` + 2 `.mf-su-rang-nom` + 6 `.mf-su-l-nom`) ; Ceintures, le mur `mgmt_ceintures` 8 (`.mf-su-ce-nom`) ; la ceinture ouverte (`MGMT_SU_CE.ouverte=true`) 2 (`.mf-su-det-nom`, `.mf-su-r-nom`) ; Camps `mgmt_camps` 6 (`.mf-su-ca-mn`) ; Carte `mgmt_carte` : 6 dans `.mf-car-adv`, puis après `carteComplete` (`tests/mgmtPrelims.test.js:8`) 2 par `.mf-car-slot.confirme` ; Préliminaires `mgmt_prelims` après `carteComplete` : 2 par `.mf-pre-slot.avalider`. Pour chaque marque : un ancêtre du sélecteur de nom ci-dessus et un `aria-label` non vide. Puis personne marqué (`mgmtVisitesInit`) : 0 `.mf-oct-nom` sur chacun de ces écrans.
5. `Marque — un seul combattant marqué n’allume qu’une marque dans la liste de l’Effectif` : marquer le premier de l’Effectif seul : `document.querySelectorAll('.mf-oct-nom').length===1` et elle est dans sa ligne (`data-id`).
6. `Marque — ouvrir la fiche éteint la marque partout, et elle reste éteinte après un rechargement` : marquer X (blessure), `CL.mgmtFiche(X)` : `mgmtMarque` faux ; l’Effectif ne montre plus sa marque ; `saveMgmt()` puis `G.mgmt=null; loadMgmt()` : toujours faux ; un nouveau fait pour X : vrai de nouveau.
7. `Marque — ← → de la fiche éteint aussi la marque du combattant atteint` : marquer le voisin de X, `CL.mgmtFiche(X)` puis `CL.mgmtFicheAutre(1)` : le voisin est éteint.
8. `Marque — une partie en version 14 se charge, se valide, ne s’allume pas, et joue une soirée` : `jouer(win,4)`, copie `brut`, `brut.v=14; delete brut.visites` ; `mgmtMigrate` : `v===15`, `validateMgmt` vrai, 0 combattant marqué sur 364 (`roster.filter(o=>mgmtMarque(m,o.id)).length===0`) ; charger par `mgmtParseAndValidate(JSON.stringify(brut))` non nul ; `jouer(win,1)` sur cet état ne lève rien et allume ≥ 2 combattants.
9. `Marque — validateMgmt refuse une table des visites mal formée, mgmtRepair la reconstruit` : refuse `visites:[]`, `{mg1:[1]}`, `{mg1:[-1,0]}`, `{'a b':[0,0]}`, `{mg1:[1.5,0]}` (5 `false`) ; `mgmtRepair` sur l’un d’eux donne une table valide, 0 marqué.
10. `Marque — le dessin de la marque tient dans sa cellule` : lire `ui-cadre.css` : la règle `.mf-oct-nom` contient `width:18px`, `height:18px`, `flex:none` et pas `position:absolute` ; et `grep` du source : `mf-oct-nom` n’apparaît dans aucun `mgmt-*.js` sauf `mgmt-cadre.js` (un seul dessinateur).
11. `Marque — une partie neuve démarre sans aucune marque` : `neuve(7)` : 0 combattant marqué sur 364.

## 8. Vérification
- Ciblée : `node --test tests/mgmtMarque.test.js` : 11 tests, 0 échec.
- Lots touchés : `node --test tests/mgmtEffectif.test.js tests/mgmtFicheCadre.test.js tests/mgmtCarteCadre.test.js tests/mgmtPrelims.test.js tests/mgmtContrats.test.js tests/mgmtNiveau.test.js` : 0 échec (le dernier teste la migration 13 → 14 : doit encore passer).
- Tranche : `npm run check:rapide` vert. Fin de tranche = 11 tests de la fiche verts + le rapide vert.

## 9. Hors périmètre
Le budget des marques (T6), le bloc « depuis ta dernière visite » (T2), tout événement nouveau (T4), les suites (T5), les six ans (T7). Ne change ni `mfMarque` ni la barre des sections. Ne touche ni `mgmt-scenarios.js` ni `mgmt-suivi.js`. Ne renumérote pas la version.

## 10. Pièges
- Ordre des scripts : `mfMarqueNom` et `mgmtMarque` sont appelées au rendu, pas au chargement : l'ordre de `index.html` n'a pas à changer. N'ajoute aucun fichier `.js` (aucune constante de premier niveau ne doit lire un fichier chargé plus tard).
- Cache : `node tools/_bump.js mgmt-attention.js mgmt-save.js mgmt-bureau.js mgmt-cadre.js mgmt-screens.js mgmt-fiche-cadre.js mgmt-ecran-fiche.js mgmt-effectif.js mgmt-contrats-ecran.js mgmt-suivi-cadre.js mgmt-carte-cadre.js mgmt-prelims.js ui-cadre.css` (une fois, à la fin).
- `esc()` : l'`aria-label` et le `title` passent par `esc()`. Les ids vont dans le HTML déjà échappés par les appelants.
- `m`, pas `G.mgmt` : `mgmtMarque`, `mgmtEvenementsDepuis` et `mfMarqueNom` lisent leur paramètre `m`. Seul `mgmtFicheVue` lit `G.mgmt`.
- Une ligne dont le combattant est absent (`fa` nul) : `mfMarqueNom(m,undefined)` doit renvoyer `''` sans lever.
- Les tests existants qui font `Object.assign(mgmtDefaultAvantH4(),{v:MGMT_SAVE_VERSION,…})` doivent passer sans toucher : c'est pourquoi `visites` est toléré absent.
- Le Lot 1 (six ans de passé) devra appeler `mgmtVisitesInit` à l'arrivée du joueur (même appel qu'ici) : ne l'anticipe pas.
- Un test existant qui compare une version en dur à 14 est à signaler dans ton compte rendu, jamais à assouplir en silence.
- Sur une ligne choisie (fond blanc cassé) le jaune se lit moins bien : ne change pas la couleur sans réponse d'Anthony (question 1).

## 11. Questions pour Anthony (aucune ne bloque)
1. Sur une ligne choisie (fond blanc cassé), la barre des sections masque son octogone jaune quand la section est celle qui est ouverte. Faut-il masquer ou garder la marque sur une ligne choisie ? Par défaut : la garder.
2. Presse et Résultats : le nom est dans un grand titre-phrase. La T1 n'y met pas de marque. Faut-il en ajouter une plus tard ?
3. Écrans d'avant l'agenda (parties jamais passées à l'agenda) : hors T1. Les couvrir aussi ?
4. T1 seule allume presque tout le monde en dix soirées si le joueur n'ouvre aucune fiche (351 sur 364, mesuré). La T6 doit suivre tout de suite. Les livrer ensemble ?

## Décisions de Claude après relecture (10/10/2026)

- **`m.visites` compte les faits et les combats, pas la semaine** : accepté. C'est plus exact que le mot
  « semaine » du brief (un cycle a deux moments), et le joueur ne voit aucune différence.
- **Question 1 (ligne choisie, fond clair)** : la marque reste visible, en encre `#0D0B0B` sur le fond clair
  (le jaune y serait illisible). Même forme, même taille.
- **Question 2 (Presse et Résultats)** : pas de marque dans un titre-phrase. La marque va sur les lignes de
  liste (un nom par ligne). C'est noté pour la relecture d'Anthony en fin de lot.
- **Question 3 (écrans d'avant l'agenda)** : non couverts. Tout comportement nouveau n'existe qu'avec
  l'agenda actif ; une partie d'avant garde ses écrans tels quels.
- **Question 4 (T1 et T6)** : oui. La T6 (le budget des marques) est codée juste après la T1, sur cette même
  branche, et les deux partent ensemble. Rien n'est fusionné avec la T1 seule.
