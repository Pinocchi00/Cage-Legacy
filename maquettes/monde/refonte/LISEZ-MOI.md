# Refonte de trois écrans — planches à valider (14/10/2026)

Trois planches, une par écran, **à valider par Anthony avant tout code** :

| Planche | Écran du jeu remplacé | États (`?etat=…`) |
|---|---|---|
| `MondeChargement.html` | la création des six ans (`scr_mgmt_nouvelle` pendant `MGMT_NOUVELLE.gen`, `mgmt-nouvelle.js`) | `chargement` · `debut` · `fin` · `erreur` — et `?demo=1` rejoue les 62 soirées |
| `MondeArrivee.html` | « Votre arrivée » (`scr_mgmt_arrivee`, `mgmt-prise-en-main.js`) | `premiere` · `sans-passe` |
| `MondeResultats.html` | Résultats (`scr_mgmt_resultats`, `mgmt-suivi-cadre.js`) | `joueur` · `passe` · `blessure` · `contrat` · `premier-jour` · `vide` |

**Les noms et les chiffres ne sont pas inventés** : ils viennent d'une vraie partie de Split (graine `20261008`), créée avec le passé
puis jouée une soirée, et relevée avec les fonctions du jeu sur `main` (`df8fd53`). Seuls les textes fixes d'interface sont proposés
(marqués *proposé* ci-dessous).

**Ouvrir** : servir ce dossier (`python -m http.server 8781` ici, ou la configuration `planches-refonte` de `.claude/launch.json`),
puis `http://127.0.0.1:8781/MondeResultats.html?etat=passe`. Comme le jeu, chaque planche est un cadre de 1920 × 1080 mis à
l'échelle de la fenêtre (`mfAjuste`) : à 1280 tout est réduit d'un tiers, rien ne se réorganise.

**Captures** : `captures/<Planche>-<état>-<largeur>.png` à 1280 × 720, 1440 × 900 et 1920 × 1080 (Edge sans fenêtre, `capturer.sh`).
**Contrôle** : `?audit=1` mesure chaque texte de la page — taille sous 22 px, texte qui sort de son bloc, textes qui se chevauchent.
Résultat dans `captures/audit.txt` : **0 erreur sur les 12 états**.

Sources : `src/` (`commun.css` porte les valeurs de `ui-cadre.css` ; `construire.js` assemble chaque page autonome).
Polices et fond copiés du dépôt dans `support/`.

---

## 1. Le chargement des six ans

### Ce qui ne va pas aujourd'hui (constaté dans le code)
- La barre saute : `mgmtNouvelleGenPas` appelle `render()` **à chaque soirée**, l'écran entier est reconstruit 62 fois.
- Le compteur « retraites » vaut toujours 0 (voir *Écarts*, point 1) et « champions » est absent.

### États
| État | Quand | Ce qui change |
|---|---|---|
| `debut` | entre le geste et la fin de `mgmtPassePreparer` (k = 0) | « Les combattants arrivent », année = première année, compteurs à 0, pas de « dernier fait » |
| `chargement` | 0 < k < n | année, « Split Fight Night k », « Soirée k sur n », barre, compteurs, dernier fait |
| `fin` | `g.pret` | barre pleine (sans hachures), « Six ans sont écrits », bouton jaune **Entrer dans Split** (Entrée) — il n'existe qu'ici |
| `erreur` | exception dans un pas (aujourd'hui : retour muet au choix) | barre figée grise, « La création s'est arrêtée pendant l'année A. Rien n'a été enregistré : l'emplacement N reste libre. », **Recommencer** (jaune, Entrée) / **Choisir une autre organisation** (Échap) |
| mouvement réduit | `prefers-reduced-motion` ou `mgmtAnimOk()` faux | pas de hachures qui défilent, pas de fondu des cartons, la barre avance sans transition |

### Ce que le code devra lire
| Zone | Donnée |
|---|---|
| Nom, « Lyon · depuis 2004 » | `g.org` ; `mgmtOrgIdentite(g.orgId).ville`, `.annee` |
| Grande année | `g.annee` (déjà rendu par `mgmtPasseSoiree`) ; à la fin : `mgmtPasseAnnee(n, n−1)` |
| « Split Fight Night k », « Soirée k sur n » | `g.k`, `g.n` ; le nom des soirées : `ident.soirees` |
| « Kader Malika compose les cartes » | `ident.predecesseur.prenom + nom` ; à la fin « a composé les n cartes » |
| Barre | largeur = `g.k / g.n` ; **six traits d'années à leur vraie place** : le trait de l'année Y est posé à `i / n`, i = premier indice tel que `mgmtPasseAnnee(n, i) === Y` (pur, calculé une fois) |
| Étiquettes d'années | même calcul ; passée = blanc, en cours = blanc gras + filet rouge 4 px, à venir = `--mf-texte2` |
| Soirées jouées | `g.k` |
| Combats | `g.m.hist.length` |
| Champions couronnés | **lecture incrémentale** de `g.m.facts` depuis l'indice `g.vus` : `title_initial` pose le détenteur de `f.div` (sans compter) ; `title_fight` → vainqueur de `g.m.hist[f.fight]` ; s'il diffère du détenteur, +1 et il devient détenteur. Coût : les faits nouveaux du pas, rien d'autre |
| Retraites | même lecture : faits `retired` (voir *Écarts* 1) |
| Le dernier fait marquant | le dernier changement de ceinture ou la dernière retraite vus par cette lecture : « {nom} prend la ceinture » / « {catégorie} · Split Fight Night {f.c} » (`mgmtDivisionLabel`) ; absent tant qu'il n'y en a pas |
| Cartons | `MGMT_NOUVELLE_LECTURES` (textes inchangés, `relu:false`) ; **« Leïla t'aide » doit lire `ident.adjointe.prenom`** (Rachel chez Garden of Blood) |

### Mouvement et clavier
- Pendant la génération, **ne plus appeler `render()`** : l'écran est posé une fois, puis chaque pas met à jour
  `textContent` des compteurs, de l'année, du fait et `style.width` de la barre. La barre a une transition `width` linéaire de 600 ms ;
  elle ne recule jamais.
- Hachures : fond `repeating-linear-gradient(-45deg, transparent 0 14px, rgba(13,11,11,.10) 14px 28px)` qui glisse de 40 px en 1,2 s ;
  coupé à la fin, à l'erreur et sous mouvement réduit.
- Cartons : 7 s chacun (`MGMT_NOUVELLE_LECTURE_MS`), fondu de 300 ms, **← →** et clic sur les pastilles 1-5 (repartent de zéro).
- **Échap** abandonne (pendant) ; **Entrée** entre (fin) ; à l'erreur Entrée recommence, Échap revient au choix. Le bouton « Entrer » a
  le focus dès qu'il apparaît.

---

## 2. Ton arrivée

Écran sans barre de sections (comme aujourd'hui), affiché une fois, entre le chargement et le jeu. Il répond, dans l'ordre de lecture :
**qui suis-je** (bande du haut), **ce que l'organisation a vécu** (colonne 1), **qui tient les ceintures** (colonne 2), **ce qu'on me
laisse et par quoi commencer** (colonne 3, bloc jaune).

### États
| État | Quand | Ce qui change |
|---|---|---|
| `premiere` | `mgmtSoireesJoueur(m) === 0` et `m.passe` | tout |
| `sans-passe` | `mgmtSoireesJoueur(m) === 0` sans `m.passe` (partie créée sans les six ans) | colonne 1 = « Split aujourd'hui » sans chiffres ni rivalité ; champions sans « depuis » ; colonne 3 = « Par où commencer » avec les trois pas de `scr_mgmt_arrivee` actuel |
| bloc vide | une donnée absente (pas de rivalité, aucun blessé, aucune promesse, aucun contrat qui finit, pas d'identité) | **le bloc n'est pas affiché** (charte R4) — jamais un bloc vide ou grisé |
| après la 1re soirée | `mgmtSoireesJoueur(m) > 0` | l'écran n'existe plus |

### Ce que le code devra lire
| Zone | Donnée |
|---|---|
| En-tête droite | `mgmtAccueilContenu(m).ou` : « Dans {rest} jours », date et salle de `m.cal.prochaines[0]`, « {org} Fight Night {eventsPlayed+1} » |
| Bande : « Tu es le nouveau matchmaker de {org}. » *(proposé)* ; « {date}, ton premier jour. » | `ou.date` — **en minuscules** (voir *Écarts* 3) |
| Tuile prédécesseur | `ident.predecesseur` (prénom nom), `.posteActuel` |
| Tuile adjointe | `ident.adjointe.prenom` ; la ligne « Sa fille » vient de la planche validée du 10/10 et **n'a pas de champ** : à ajouter à l'identité (texte d'auteur) ou à retirer |
| Tuile première soirée | `ou.soiree.dans`, `ou.soiree.nom` |
| Six ans · 2021 → 2026 | `mgmtPasseAnnee(n,0)` → `mgmtPasseAnnee(n,n−1)` |
| Soirées / Combats | `m.passe.soirees` ; `m.passe.nHist` |
| Champions couronnés | même lecture que l'écran de chargement, sur les `m.passe.nFacts` premiers faits |
| Blessures | nombre de faits `injury` parmi les `m.passe.nFacts` premiers |
| Ce qu'on en dit · Sa rivale | `ident.reputation` ; `mgmtOrgParId(ident.rivale).nom` |
| Une rivalité en cours | `mgmtRivalites(m)[0]` : trilogie → « Une victoire chacun · le troisième combat » ; rivalité → « Revanche due » |
| Les blessés | combattants non retraités avec `f.susp >= m.cycle` : leur nombre ; « le plus long » = le plus grand `f.susp − m.cycle + 1` (« N soirées ») |
| Ses douze champions | `allDivisions()` × `mgmtSplitTitle(m,div)` ; « depuis {année} » = année de la soirée `mgmtCeintureLignee(m,div).actuel.depuis` (`mgmtSoireeJour` → date) ; vacante : « Vacante » sans nom |
| Le plus long règne | parmi les règnes actuels, le plus ancien `actuel.depuis` (à égalité : le plus de `defenses`) |
| Prochaine chose à faire | `mgmtAccueilContenu(m).attend.prochaine` (`titre`, `detail`, `onclick`) ; préfixe *(proposé)* « {prédécesseur} a signé {N} combats. » avec N = `m.card.main.filter(x=>x.herite).length`, si N > 0 |
| Ses promesses | `heritage.promesses` (≤ 3) ; **l'échéance se dit en soirée, pas en cycle** : « Au plus tard : {org} Fight Night {eventsPlayed + 1 + (p.due − m.cycle)} », « ta première soirée » si `p.due === m.cycle` |
| Ses contrats qui finissent | non retraités, `f.ct` et `mgmtContratRestants(f) === 1` : noms de famille, « Un dernier combat à leur contrat » |

### Clavier et souris
↑ ↓ choisissent une ligne, **Tab** passe au bloc suivant, **Entrée** ouvre ce qui est choisi — **au départ, le bloc jaune** (Ouvrir la
carte). **Échap** : aller à l'Accueil. Chaque nom souligné ouvre sa fiche ; « Décider › », « Contrats › », « Ceintures › »,
« Effectif › » ouvrent l'écran nommé.

---

## 3. Résultats

Trois colonnes : **quelle soirée** (liste), **quels combats** (le tableau), **ce combat et ce qu'il change** (le détail), et en bas à
droite **la prochaine chose à faire**. Le joueur ne voit jamais deux combats détaillés ; choisir une ligne remplace le détail, rien ne
s'ouvre par-dessus, rien ne défile ailleurs que dans la liste des soirées.

### Ce qui ne va pas aujourd'hui (constaté dans le code)
- La liste coupe les soirées en « 5 récentes » + « plus anciennes » glissantes (`deb=…`) : choisir une soirée déplace les autres.
- Le combat principal n'est pas désigné, la carte principale et les préliminaires sont mêlés, rien ne dit ce que le combat change.
- Les dates sont en capitales et sans année (`mgmtJourDateTexte` : « 16 FÉVRIER »).

### États
| État | Quand |
|---|---|
| `joueur` | soirée jouée par le joueur, combat principal choisi (arrivée depuis le lendemain : la dernière soirée, combat principal) |
| `passe` | soirée d'avant l'arrivée : pastille « Soirée de {prédécesseur} », pas de spectateurs (non gardés), pas de « Revoir » mais la phrase « Combat d'avant ton arrivée : on lit le résultat, il ne se revoit pas. » |
| `blessure` | un combat qui laisse une blessure (préliminaire 2) |
| `contrat` | un combat après lequel il reste un combat au contrat (combat 3) |
| `premier-jour` | aucune soirée du joueur : « Ta première soirée · {org} Fight Night 63 · dans 35 jours », la dernière soirée du passé est choisie, bloc jaune = carte |
| `vide` | aucune soirée du tout (partie sans passé, avant la première) |
| combat illisible | `mgmtResultatDetail` rend null : la ligne est remplacée par « Un combat de cette soirée n'a pas pu être relu. » (jamais une ligne vide) |

### Ce que le code devra lire
| Zone | Donnée |
|---|---|
| Liste : groupes | « Tes soirées · N » = soirées de `mgmtSoirees(m)` dont `n > m.passe.soirees` ; « Avant ton arrivée · {m.passe.soirees} » (groupe absent sans passé) |
| Liste : une ligne | « Fight Night {s.n} », date `mgmtJourDate(s.jour)` en « 16 février 2027 », principal `mgmtSuPrincipalLigne(m,s)` |
| Liste : fenêtre | **sept lignes de soirée fixes** (six quand la ligne « Ta première soirée » est là), la fenêtre ne bouge que quand la sélection en sort ; dessous « {reste} soirées plus anciennes » |
| Tête : titre, pastille | « {org} Fight Night {s.n} » ; « Ta soirée » (blanc plein) si `s.n > m.passe.soirees`, sinon « Soirée de {prédécesseur} » |
| Tête : ligne | date longue (`MGMT_ACCUEIL_JOURS` + `mgmtJourDate`) · salle `mgmtSalleParId(m, faite.salle).nom` si la soirée est dans `m.cal.faites` · spectateurs `m.lastEvent.finance.spectateurs` **seulement pour la dernière soirée** |
| Tableau | `mgmtSoireeAffichage(m,s)` séparé par `m.hist[i].slot` : « Carte principale · N combats », « Carte préliminaire · N combats », numéros 1… dans chaque groupe |
| Ligne : 1re ligne | « {gagnant.last} bat {perdant.last} » (vainqueur en 600), nul : « {a} et {b} : match nul » |
| Ligne : 2e ligne | pastille « Ceinture » si `d.titre` · méthode par famille : `ko` « KO au 3e round », `stop` « Arrêt au 2e round », `sub` « Soumission au 1er round », `dec` « Décision après 5 rounds », `draw` « Match nul après 3 rounds » · `mgmtDivisionLabel(d.cat)` |
| Détail : en-tête | place : « Combat principal », « Co-principal », « Carte principale · 3e combat », « Préliminaire 2 » ; noms complets |
| Détail : méthode fine | `d.methode` (« Décision unanime après 5 rounds ») ; « · {d.geste} » si présent (rejeu fidèle seulement) |
| Détail : lignes | « {catégorie} · en {d.rounds} rounds » ; « Bilans avant le combat : W-L et W-L » (`t.a`, `t.b` de la trace) |
| Ce que ça change — ceinture | `mgmtTitreIssue(m,i)` : `garde` → « {G} garde sa ceinture : {k}e défense » (k = rang du combat parmi les combats de titre gagnés dans le règne de `mgmtCeintureLignee`) ; `prend` → « {G}, {rang avant}, prend la ceinture » et « {P} perd sa ceinture et passe à la {rang après} place » ; `vacant` → « {G} prend la ceinture vacante » |
| — classement | rang **avant** = `mgmtDivisionRanking(m, cat, 'organization', t.c)`, rang **après** = même chose au cycle `t.c + 1` (sans cycle si `t.c + 1 === m.cycle`) — vérifié : un classement au cycle c ne compte que les combats de cycle < c. **Numérotation de l'écran Classements** : le détenteur de la ceinture à ce cycle est retiré, les autres sont 1, 2, 3… Phrases : « {X} monte de la 15e à la 8e place », « recule de la 1re à la 8e place », « garde la 1re place » ; le champion n'a pas de ligne de classement |
| — corps | faits `injury` / `susp` de cycle `t.c` sur l'un des deux : « Blessure pour {X} », « Suspension médicale pour {X} » (aucune cause, charte H5) |
| — contrat | fait `fin_contrat` de cycle `t.c` : « {X} arrive au bout de son contrat » ; pour **la dernière soirée seulement**, `mgmtContratRestants(f) === 1` : « {X} : un dernier combat à son contrat » |
| Boutons | « Revoir le combat » (R) si `mgmtCombatRevoyable(t)` ; « Fiche de {G} » (F) si `mgmtFicheLigne(m, id)` |
| Prochaine chose à faire | `mgmtAccueilContenu(m).attend.prochaine` — la même source que l'Accueil |

### Clavier et souris
← → soirée précédente / suivante · ↑ ↓ combat · **R** revoir · **F** fiche du vainqueur · **Entrée** la prochaine chose à faire
(le jaune, comme au lendemain) · Échap retour · A E sections. Souris : clic sur une soirée, sur un combat, sur les boutons ; la molette
fait défiler la liste des soirées. La touche Tab (liste/tableau) disparaît : chaque flèche a un seul sens.

---

## Écarts et questions pour Anthony

1. **Aucune retraite en six ans.** Sur la partie relevée (graine 20261008), `m.facts` ne contient aucun fait `retired` après les 62
   soirées, et aucun combattant n'est retraité (le plus vieux a 36 ans). Le compteur « Retraites » demandé affichera donc **0**, et
   l'écran actuel aussi (`scr_mgmt_arrivee` compte les mêmes faits). À trancher : corriger la simulation du passé (les retraites
   devraient exister) ou remplacer ce compteur (par exemple « Blessures », 164 sur cette partie). Les planches montrent la vraie
   valeur, 0.
2. **« Votre arrivée » et l'Accueil disent la même chose.** La décision du 12/10 envoie « Commencer » vers l'Accueil, dont la première
   visite montre déjà l'héritage (`mgmtAccueilContenu(m).heritage`). Proposition : la nouvelle arrivée porte l'héritage, Entrée va
   directement à la prochaine chose à faire, Échap à l'Accueil ; l'Accueil retire alors son bloc « héritage ». À valider.
3. **Dates en capitales.** `mgmtJourDate` rend le mois en capitales (« Mardi 12 JANVIER 2027 » dans `mgmtAccueilDate`, « 16 FÉVRIER »
   dans Résultats). Dans une phrase, le mois s'écrit en minuscules ; les plaques de l'en-tête restent en capitales.
4. **Échéance des promesses en « cycle ».** L'Accueil affiche « Promise · échéance : cycle 63 » : étiquette technique (charte S7).
   Les planches la disent en soirée.
5. **Douze ceintures, pas neuf.** La planche du 10/10 disait « 9 ceintures » ; le jeu en a douze (huit masculines, quatre féminines).
6. **Textes proposés, non relus** : « Tu es le nouveau matchmaker de {org}. », « Six années se jouent avant ton arrivée. »,
   « {prédécesseur} a signé N combats. », « Combat d'avant ton arrivée : on lit le résultat, il ne se revoit pas. », les phrases de
   « Ce que ça change », « Le bouton pour entrer apparaîtra à la fin des six ans. ». Les cartons restent ceux du code (`relu:false`).
