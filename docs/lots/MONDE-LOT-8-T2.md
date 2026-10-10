# Monde lot 8 T2 : « Depuis ta dernière visite »

**Branche** : `monde-lot-8-marques` (vérifiée : branche courante). **Prérequis** : la T1 est faite dans cette branche. Vérifie : `grep -n "function mgmtFicheVue" mgmt-ecran-fiche.js` doit répondre. Sinon arrête-toi et écris-le dans ton compte rendu.
Les numéros de ligne ci-dessous sont ceux d'AVANT la T1 : cherche par nom de fonction.

## 1. Objectif
En ouvrant la fiche d'un combattant marqué, le joueur lit tout de suite ce qui lui est arrivé, dans l'onglet « On en dit », en tête. La marque est déjà éteinte (T1).
Brief (Lot 8) : « En tête, "depuis ta dernière visite" raconte l'événement. La marque s'éteint alors partout. » et « Jamais une fenêtre, jamais une minuterie. »

## 2. Ce qui existe (vérifié)
- T1 (à réutiliser, ne pas recopier) dans `mgmt-attention.js` : `mgmtEvenementsDepuis(m,id)` rend `[{type:'fait',i,fait}|{type:'combat',i,trace}]` (`i` = index dans `m.facts` ou `m.hist`) ; `mgmtMarque`, `mgmtVuEnregistre`. Dans `mgmt-ecran-fiche.js` : `mgmtFicheVue(id)` (appelée par `CL.mgmtFiche`, `mgmt-screens.js:316`, et par `CL.mgmtFicheAutre`, `mgmt-fiche-cadre.js:90`, qui sont les deux seuls points d'ouverture).
- `MGMT_FICHE` : `let MGMT_FICHE={id:null,retour:'mgmt_carte',cursor:0}` `mgmt-ecran-fiche.js:4`. Remis à `{id,retour,cursor:0}` à chaque `CL.mgmtFiche` (`mgmt-screens.js:323`) : un champ ajouté à `MGMT_FICHE` vit le temps d'une visite, n'est jamais sauvegardé.
- L'onglet qui s'ouvre : `mgmtFicheOngletCourant()` `mgmt-fiche-cadre.js:16` (défaut `'apercu'`). `CL.mgmtFicheOnglet(x)` `mgmt-fiche-cadre.js:83` (appelle `render()`).
- L'onglet « On en dit » : `mgmtFicheOnEnDitHtml(m,f)` `mgmt-fiche-planche.js:256`. Il rend un panneau `mfPanneau(<div class="mf-fi-p mf-fi-scroll">${rows}${reste}</div>,'normal','mf-fi-pan mf-fi-fill')` (ligne 266). `rows` est une suite de `<div class="mf-fi-oc">` (ligne 262) : à gauche `.mf-fi-ocq` (un `<span>` de 22 px et un `<b>` de 34 px, colonne de 260 px, `nowrap`), à droite `.mf-fi-oct` avec `.mf-fi-ocp` (phrase, 28 px, passe à la ligne) et `.mf-fi-rp` (24 px). Le panneau défile : `.mf-fi-scroll{overflow-y:auto}` (`ui-cadre.css:1098`). Un en-tête de panneau existe : `<div class="mf-fi-cth"><span>…</span><span>…</span></div>` (ligne 225 du même fichier).
- Les phrases existent déjà (aucun texte à écrire) :
  - blessure, suspension, fin de carrière : `MGMT_FACT_LABELS[x.k]` (`mgmt-data.js:175`), comme `mgmtFicheCorps` (`mgmt-ecran-fiche.js:231`) ;
  - demande : `MGMT_DEMANDES[x.want].libelle` (`mgmt-promesses.js:37`), plus « — » et le nom de la cible (`mgmtFighterById(m,x.target).name`), comme `mgmtFichePromesses` (`mgmt-ecran-fiche.js:201`) ;
  - attente : `mgmtFilTitre(m,{k:'combattant',w:'attend',a:id,n:mois})` (`mgmt-suivi.js`, modèle `attend`), `mois=Math.max(1,Math.round(mgmtContratAttente(m,f)*MGMT_VOIX_MOIS_PAR_CYCLE))` comme `mgmtFilMettreAJour` ;
  - moment de vie : `mgmtVieTexte(mgmtVieMomentById(x.m))` (`mgmt-vie.js`), et ses relais `moment.relais` ;
  - combat du carton principal : `Victoire`/`Défaite`/`Nul` + ` · ` + nom de l'adversaire, comme `mgmtHistoriqueHtml` (`mgmt-ecran-fiche.js:148`) ; seconde ligne `mgmtSuRoundLigne(d)` (`mgmt-suivi-cadre.js:348`) avec `d=mgmtResultatDetail(m,i)` (peut être `null` : alors `MGMT_FAMILY_LABELS[t.family]||''`).
- La date : `mgmtSoireeNomDate(m,c)` (`mgmt-calendrier.js:19`), `c` = `fait.c` ou `trace.c`.

## 3. Ce qui change
**`mgmt-fiche-planche.js`** (avant `mgmtFicheOnEnDitHtml`) :
- `const MGMT_DEPUIS_LIBELLES={vie:'Sa vie',demande:'Une demande',attente:'Une attente',corps:'Son corps',resultat:'Un résultat',titre:'Un titre',relu:false};` (étiquettes fonctionnelles, 12 caractères au plus, pour tenir dans la colonne de 260 px).
- `/** Ce qui est arrivé à id depuis sa dernière visite, du plus récent au plus ancien. Pur, sans DOM, ne modifie rien. @returns {Array<{sorte:string,libelle:string,phrase:string,detail:string,c:number}>} sorte ∈ vie|demande|attente|corps|resultat|titre */ function mgmtDepuisVisite(m,id)` : part de `mgmtEvenementsDepuis(m,id)`, rend un objet par événement avec la phrase de la liste ci-dessus ; `detail` = la date `mgmtSoireeNomDate(m,c)`, suivie de ` · via ` + relais joints par ` · ` pour un moment, de ` · Attend ta réponse` pour une demande encore ouverte (`mgmtDemandesOuvertes(m).some(d=>d.i===e.i)`), de ` · ` + `mgmtSuRoundLigne(d)` pour un combat. `sorte:'titre'` si `m.facts.some(x=>x&&x.k==='title_fight'&&x.fight===e.i)`, sinon `'resultat'`. Tri : `c` décroissant, puis un combat avant un fait, puis `i` décroissant. Toute chaîne est du texte brut : l'échappement se fait au rendu.
- `function mgmtFicheDepuisHtml(liste)` : `''` si `liste` n'est pas un tableau ou est vide. Sinon : `<div class="mf-fi-cth"><span>DEPUIS TA DERNIÈRE VISITE</span><span>${n} ÉVÉNEMENT${n>1?'S':''}</span></div>` suivi, pour chaque élément, de `<div class="mf-fi-oc depuis"><div class="mf-fi-ocq"><span>${esc(libelle en majuscules)}</span></div><div class="mf-fi-oct"><div class="mf-fi-ocp">${esc(phrase)}</div><div class="mf-fi-rp">${esc(detail)}</div></div></div>`. Aucun `<b>` à gauche (34 px, `nowrap`, déborderait de la colonne de 260 px). Aucune autre classe, aucun CSS neuf, aucun `position`.
- `mgmtFicheOnEnDitHtml` : la chaîne du panneau devient `<div class="mf-fi-p mf-fi-scroll">${depuis}${rows}${reste}</div>` avec `const depuis=(MGMT_FICHE.id===f.id)?mgmtFicheDepuisHtml(MGMT_FICHE.depuis):'';`. Le bloc passe donc en tête du panneau qui défile ; il ne remplace rien (les trois lignes du fil restent dessous, même si l'une répète un événement : ne dédoublonne pas).

**`mgmt-ecran-fiche.js`** : réécrire `mgmtFicheVue(id)` (créée par la T1) dans CET ORDRE, qui est le point de la tranche :
1. `const m=G&&G.mgmt; if(!m) return;`
2. `MGMT_FICHE.depuis=mgmtDepuisVisite(m,id);` : on calcule AVANT d'enregistrer la visite, sinon le bloc serait toujours vide.
3. `if(MGMT_FICHE.depuis.length) MGMT_FICHE.onglet='ondit';` : l'histoire est lue là où elle est (décision de la T2, question 1).
4. `if(mgmtVuEnregistre(m,id)) saveMgmt();`
Ne change aucun des deux appelants. Le bloc d'une visite est donc calculé une fois : changer d'onglet et revenir (`render()`) le montre toujours ; rouvrir la fiche le recalcule, donc vide.

## 4. Sauvegarde : non
`MGMT_SAVE_VERSION` ne bouge pas (reste celle de la T1). `MGMT_FICHE.depuis` n'est pas une donnée de la partie.

## 5. Textes
Aucune commande à `@ecrivain` : chaque sorte a déjà sa phrase (liste du §2). Seules les six étiquettes de `MGMT_DEPUIS_LIBELLES` et l'en-tête sont écrits ici, marqués `relu:false`. Si une sorte te semble sans phrase affichable, ne l'invente pas : signale-la.

## 6. Écran
Aucune planche neuve : le bloc reprend le panneau « On en dit » (`mfPanneau`, `mf-fi-pan mf-fi-fill`, défilant) et ses lignes `.mf-fi-oc` (grille 260 px | reste, fond `var(--mf-ligne)`, coins coupés de 10 px). Aucune valeur n'est ajoutée. Charte : L4 (jamais de chevauchement), S6 (retour visible, pas de fenêtre). La relecture à 1920 px est faite par Claude.

## 7. Tests : `tests/mgmtDepuis.test.js` (à ajouter dans `package.json`, scripts `test` ET `test:watch`)
Amorce : celle de `tests/mgmtMarque.test.js` (T1) : `neuve(7)`, `mgmtVisitesInit(m)`, `jouer` de `tests/helpers/jouerSoirees.js`. Graine 7.
1. `Depuis — chaque sorte comptée donne une ligne avec la phrase de son système` : pour un combattant X, pousser un fait à la fois (`injury`, `susp`, `retired`, `demande` avec `want:'revanche'` et une cible Y, `attend` avec `p:1`, un `moment_vie` relayé) : `mgmtDepuisVisite(m,X).length===1` à chaque fois, `phrase` égale respectivement `'Blessure'`, `'Suspension médicale'`, `'Fin de carrière médicale'`, `'Une revanche — '+Y.name`, `mgmtFilTitre(...)`, `mgmtVieTexte(moment)` ; `sorte` et `libelle` justes.
2. `Depuis — un combat du carton principal donne « Victoire · adversaire » et sa seconde ligne` : `jouer(win,1)`, pour le gagnant du premier combat `main` : `phrase==='Victoire · '+perdant.name`, `detail` contient `mgmtSuRoundLigne(mgmtResultatDetail(m,i))` et `mgmtSoireeNomDate(m,trace.c)` ; un combat de titre (`jouer(win,1,{titre:true})`) donne `sorte==='titre'` si `title_fight` existe.
3. `Depuis — l’ordre : le plus récent d’abord, un combat avant un fait du même cycle` : un fait de cycle 2, un fait de cycle 5, un combat de cycle 5 : l’ordre rendu est combat 5, fait 5, fait 2 (3 éléments, `c` : 5, 5, 2).
4. `Depuis — ouvrir une fiche marquée l’ouvre sur « On en dit » avec une ligne par événement` : X avec 2 événements : `CL.mgmtFiche(X)` ; `MGMT_FICHE.onglet==='ondit'` ; `document.querySelectorAll('.mf-fi-oc.depuis').length===2` ; l’en-tête contient `DEPUIS TA DERNIÈRE VISITE` et `2 ÉVÉNEMENTS` ; chaque ligne est dans `.mf-fi-scroll`.
5. `Depuis — le bloc est calculé avant la visite : une fiche marquée n’est jamais ouverte sur un bloc vide` : `mgmtMarque(m,X)` vrai avant ; après `CL.mgmtFiche(X)` : `MGMT_FICHE.depuis.length` égale le nombre d’événements (≥ 1) ET `mgmtMarque(m,X)` faux.
6. `Depuis — rouvrir la même fiche la même semaine : le bloc a disparu` : `CL.mgmtFicheRetour(); CL.mgmtFiche(X)` : 0 ligne `.mf-fi-oc.depuis`, 0 en-tête, `MGMT_FICHE.onglet` vaut `'apercu'`.
7. `Depuis — changer d’onglet puis revenir pendant la même visite garde le bloc` : `CL.mgmtFicheOnglet('apercu')` puis `('ondit')` : toujours 2 lignes.
8. `Depuis — après un rechargement la fiche ne rejoue pas le bloc` : ouvrir X, `saveMgmt()`, `G.mgmt=null; loadMgmt()`, `CL.mgmtFiche(X)` : 0 ligne.
9. `Depuis — sans nouveauté : pas de bloc, la fiche s’ouvre sur Aperçu` : combattant sans événement : `MGMT_FICHE.depuis` vide, onglet `'apercu'`, aucun `.mf-fi-cth` contenant « DEPUIS ».
10. `Depuis — ← → affiche le bloc du combattant atteint, jamais celui d’avant` : X (2 événements) et son voisin V (1 ; `V=mgmtFicheVoisins(m,f).ids[i+1]`) : `CL.mgmtFiche(X)` puis `CL.mgmtFicheAutre(1)` : 1 ligne ; retour (`-1`) : 0 ligne (X déjà vu).
11. `Depuis — rien ne déborde : 15 événements défilent dans le panneau` : 15 faits `injury` pour X : 15 lignes `.mf-fi-oc.depuis`, toutes dans `.mf-fi-scroll` ; `ui-cadre.css` contient `.mf-fi-scroll{overflow-y:auto` ; aucune ligne `.depuis` n’a de `<b>` dans `.mf-fi-ocq` ; la règle `.mf-fi-oc{` ne contient pas `position:absolute`.
12. `Depuis — tout texte injecté est échappé` : renommer la cible d’une demande `'<i>x</i>'` : le HTML contient `&lt;i&gt;x` et `document.querySelector('.mf-fi-oc.depuis i')` est `null`.

## 8. Vérification
- Ciblée : `node --test tests/mgmtDepuis.test.js` : 12 tests, 0 échec.
- Lots touchés : `node --test tests/mgmtMarque.test.js tests/mgmtFicheCadre.test.js tests/mgmtCorrectionsLot4.test.js tests/mgmtCorrectionsLot5.test.js tests/mgmtTunnels.test.js tests/mgmtDefautsDemo.test.js tests/mgmtFicheCombats.test.js`.
- Un test existant qui ouvre une fiche d’un combattant ayant un événement et attendait l’onglet `'apercu'` à l’ouverture échouera à cause de la décision « ouvrir sur On en dit ». Corrige-le en ouvrant explicitement l’onglet attendu (`CL.mgmtFicheOnglet('apercu')`), cite cette décision dans ton compte rendu. N’assouplis aucune autre assertion.
- Tranche : `npm run check:rapide` vert. Fin de tranche = 12 tests verts + les fichiers ci-dessus verts + le rapide vert.

## 9. Hors périmètre
La marque et la table des visites (T1, ne les modifie pas : seule `mgmtFicheVue` est réécrite). Le budget (T6). Tout événement nouveau, les « à suivre » (T4, T5). Les six ans (T7). `mgmt-suivi.js`, `mgmt-vie.js`, `mgmt-promesses.js`. Le fil `m.fil`. Le CSS.

## 10. Pièges
- Ordre : calcul AVANT `mgmtVuEnregistre`. C'est la seule erreur qui rend le bloc toujours vide.
- Cache : `node tools/_bump.js mgmt-fiche-planche.js mgmt-ecran-fiche.js` (une fois, à la fin). Aucun fichier ajouté, l’ordre de `index.html` ne change pas.
- `esc()` sur `phrase`, `detail`, `libelle`, en-tête. `mgmtFicheOnEnDitHtml` est enveloppé par `mgmtAccord` (`mgmt-fiche-cadre.js:65`) : les `{il}` éventuels des textes d’auteur s’accordent seuls.
- `m` ou `G.mgmt` : `mgmtDepuisVisite(m,id)` lit son paramètre ; seule `mgmtFicheVue` lit `G.mgmt`.
- Un combattant extérieur peut s’ouvrir (`mgmtFicheLigne`) : `mgmtDepuisVisite` doit rendre `[]` sans lever (il n’a ni fait ni combat).
- `mgmtResultatDetail` rejoue le combat : mémoïsé, mais peut rendre `null` ; ne lève pas.
- Le fil d’en dessous (trois lignes) peut répéter un événement : normal.
- Presse ouvre déjà `'ondit'` pour une demande (`mgmt-suivi-cadre.js:441`) : compatible, rien à changer.

## 11. Questions pour Anthony (aucune ne bloque)
1. Faut-il ouvrir la fiche directement sur « On en dit » quand il y a quelque chose à lire (valeur par défaut ici), ou garder Aperçu et mettre un indice sur l’onglet ?
2. Le bloc répète parfois une ligne du fil juste dessous. On le laisse tel quel en T2 ?

## Décisions de Claude (10/10/2026) — Anthony : « fais le mieux pour la lisibilité »

- **Question 5 : oui.** Quand il y a du nouveau, la fiche s'ouvre sur l'onglet « On en dit », le bloc « Depuis ta
  dernière visite » en tête. L'onglet « Aperçu » est déjà plein : y glisser un bloc de plus ferait déborder ses
  panneaux. L'onglet « On en dit » porte la marque (le même octogone, `mfMarqueNom`) tant que le bloc n'a pas été
  lu, pour que le joueur comprenne pourquoi la fiche s'ouvre là. Sans rien de nouveau, la fiche s'ouvre sur
  « Aperçu », comme aujourd'hui.
- **Question 6 : pas de doublon.** Une ligne déjà dite dans « Depuis ta dernière visite » n'est pas répétée dans le
  fil juste en dessous, tant que le bloc est affiché.
- Un test existant qui attend « Aperçu » après un événement s'adapte en citant cette décision.
