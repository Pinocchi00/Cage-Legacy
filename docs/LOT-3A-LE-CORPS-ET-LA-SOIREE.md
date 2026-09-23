# CAGE LEGACY — MODE MANAGEMENT
## Lot 3a — Le corps et la soirée

Base : `main` à `b768830` (lot 2). Une branche, une PR, merge à la fin.
Documents d'autorité : `docs/CDC-MODE-MANAGEMENT.md`, `docs/CDC-MODE-MANAGEMENT-ADDENDUM.md`,
`docs/CDC-ADDENDUM-2-LES-SIX-REGARDS.md`, `docs/LES-SIX-VOIX-v1.1.md`.

---

## 0. POURQUOI CE LOT

Le lot 3 est Clara, la médecin (addendum 2 §7). Elle doit voir le corps des combattants.
Aujourd'hui, ce corps n'existe pas :

- `chinDegradationLevel` est lu (`engine-career.js:161`, `ui-05-fight-resolution.js:62,588`)
  et écrit nulle part ;
- `rollInjury()` tire une blessure uniforme, sans lien avec les coups reçus ;
- aucun fichier `mgmt-*` n'appelle `simulateFight` : la carte validée ne se joue jamais.

Le lot 3a construit le corps et fait jouer la soirée. **Aucune voix n'est ajoutée.** Clara
arrive au lot 3b et lira ce que ce lot produit.

---

## 1. PÉRIMÈTRE

1. Un état physique caché par combattant : le **traumatisme**.
2. Le couplage de cet état au moteur de combat, **sans modifier le moteur**.
3. La soirée : la carte de 4 combats se joue, les résultats s'affichent.
4. Le retour du combat sur le corps, les blessures, les suspensions, la fin de carrière
   médicale.
5. Le lendemain : séquence imposée et courte.
6. Sauvegarde, validation, migration.
7. Les tests, dont un calibrage Monte Carlo.
8. Une mise à jour de `docs/CDC-ADDENDUM-2-LES-SIX-REGARDS.md` (texte fourni au §10).

## 2. HORS PÉRIMÈTRE

- Toute réplique, toute voix, Clara comprise. Aucun texte de personnage n'est écrit par
  l'agent.
- Main event et co-main, le diffuseur et sa date imposée, l'arène animée, l'arrêt du combat
  par le coin (addendum §13), le vieillissement, les classements.
- **Aucune modification de `engine-*.js`**, ni coefficient, ni fonction. Ni de
  `ui-01` à `ui-10`.
- Les imprévus du dernier mois avant la soirée : blessure au camp, remplaçant à court
  préavis, changement de placement. Ils sont décidés (voir le texte du §10) et viendront
  dans un lot dédié.
- Le fait que la validation en bloc ne promeut pas les combattants : comportement du lot 2,
  on n'y touche pas.

---

## 3. LE TRAUMATISME

Nombre caché, de 0 à 100. **Jamais affiché**, ni en chiffre, ni en jauge, ni en couleur, ni
en libellé.

- **Décision d'Anthony du 22/09/2026 :** il récupère partiellement et lentement au repos ;
  une part des dégâts de chaque combat reste définitivement acquise, et un combat ne fait
  jamais descendre le total courant.
- À 100 : fin de carrière médicale, définitive.
- Constante `MGMT_BODY_THRESHOLD = 60` : le seuil au-delà duquel un corps est usé. Ce lot
  ne l'affiche nulle part ; il sert au calibrage et au lot 3b.

### 3.1 Règle du bureau (CDC §3) — rien n'est stocké pour un niveau 1 qui n'a pas combattu

Fonction `mgmtTrauma(f)` :
- si la ligne porte un champ `trauma` (combattant qui a déjà combattu sur la carte de
  Split), le renvoyer ;
- sinon, le **dériver** de la ligne : bilan, âge, nombre de combats, et un hachage stable de
  `f.id`. Estimer d'abord un nombre de défaites par KO à partir de `L` et du hachage, puis
  en déduire le traumatisme de départ. Plafonné à 85 : personne ne commence retraité.

**La dérivation ne consomme jamais `rnd()`.** Elle utilise un hachage local (à écrire dans
`mgmt-bureau.js`, type FNV-1a 32 bits), pas `duel-codec.js`. Appeler `mgmtTrauma()` mille
fois ne doit pas changer la suite des tirages de la partie.

Le champ `trauma` n'est écrit sur la ligne qu'après le premier combat du combattant sur
la carte. C'est une donnée cachée qui accompagne le bilan, au même titre que `W/L/D`, et
qui ne crée pas de dossier.

### 3.2 Profil de combat — régénéré, jamais stocké

Une ligne du roster n'a pas d'attributs de combat. Fonction `mgmtCombatProfile(f)` :

1. sauvegarder `SEED`, puis `setSeed(hachage(f.id))` ;
2. `makeFighter({div:f.div, gender, level, age:f.age})`, où `level` est retrouvé en
   inversant `correlatedRecord()` (`ui-01-roster-matchmaking.js:465`) à partir de
   `W/(W+L)`, borné à 40–80 ;
3. **restaurer `SEED`** ;
4. écraser sur le profil : `id`, `name`, `first`, `last`, `age`, `W`, `L`, `D` de la ligne.
   Ne jamais conserver l'identifiant produit par `uniqueFighterId()`.

Le même combattant doit donner exactement le même profil à chaque appel. Rien n'est
sauvegardé.

---

## 4. LE COUPLAGE AU MOTEUR

Fonction `mgmtFightReady(f)` : clone profond du profil, puis réduction des attributs
`attrs.chin` et `attrs.durability` en fonction de `mgmtTrauma(f)`. Vérifier les clés exactes
dans `engine.js:97` et dans `eff()`.

**Invariant absolu : à traumatisme 0, le facteur vaut exactement 1.** Deux corps à 0
donnent un combat strictement identique à celui du moteur nu, avec la même graine.

La forme de la réduction est libre et doit atteindre les cibles du §8.

Le combat se joue par `simulateFight(A, B, 3)`. On n'appelle pas `applyResult()` : on met
à jour `W/L/D` de la ligne à la main.

---

## 5. LA SOIRÉE

**Rythme imposé (décision du 10/09/2026).** Le calendrier fixe la soirée, pas le joueur.
Il y a une soirée **à la fin de chaque cycle** : quand la pile n'a plus d'affaire ouverte
et que la carte est verrouillée (voir l'échéance ci-dessous), le contrôleur ouvre la
soirée au lieu d'appeler `mgmtNewPile()`.
Points d'entrée à modifier : les trois appels à `mgmtNewPile` dans le contrôleur de
`mgmt-screens.js`.

Constante `MGMT_EVENT_WEEKS = 5` : durée d'un cycle. Provisoire, le diffuseur la fixera
plus tard (addendum §16).

**Échéance de la carte (décision du 10/09/2026).** La carte doit être complète un mois
avant la soirée. **Le jeu ne choisit jamais un combat à la place du joueur.**

Dans ce lot, la phase du cycle où l'on traite la pile représente la période avant
l'échéance. Quand plus aucune affaire n'est ouverte :

- **carte complète** : la carte est verrouillée, puis la soirée se joue ;
- **carte incomplète** (par exemple après un écrasement) : le cycle ne se ferme pas.
  Leïla fait aussitôt une nouvelle proposition en bloc, en tête de pile. Le coût de
  l'écrasement du lot 2 s'applique : cette proposition est plus bâclée. On recommence
  jusqu'à ce que le joueur valide ou échange.

Tant que la carte est incomplète, la proposition en bloc **ne peut pas être ignorée**.
Seuls restent valider, échanger ou écraser. Sinon, ignorer deviendrait un moyen gratuit
d'obtenir une nouvelle proposition, sans le coût de l'écrasement.

Si Leïla ne trouve plus assez de paires (suspensions, contraintes de variété) :
1. assouplir d'abord les contraintes de variété (prénoms déjà vus, paires déjà
   proposées) ;
2. si c'est toujours impossible, **ne rien remplir d'office**, et le signaler dans le
   rapport de lot.

Entre le verrouillage et la soirée, la carte ne change plus dans ce lot. Les imprévus du
dernier mois viendront dans un lot dédié (§2).

**Anti-rechargement.** Les quatre combats et toutes leurs conséquences (§6) sont calculés
**en une seule fois**, stockés dans `m.lastEvent`, **sauvegardés**, puis affichés.
Recharger la page ne rejoue rien.

**Écran de soirée.** Un seul écran. Quatre lignes : les deux noms, le vainqueur, la
famille de la méthode (KO, arrêt, soumission, décision, nul) et le round.
Interdits (addendum 2 §6) : `res.detail`, les statistiques, toute note, toute étiquette
descriptive (« finition au corps », etc.). Continuer à la souris et au clavier (`ui-11-keys.js`).

Après la soirée : la carte est vidée (`m.card.main = []`, `m.card.prelims = []` —
structure {main,prelims} depuis le lot 2 T1), puis le lendemain, puis `mgmtNewPile()`.

---

## 6. CE QUE LE COMBAT FAIT AU CORPS

Pour chaque combattant, après son combat :

**6.1 Traumatisme.** Il augmente selon les dégâts **subis**. Vérifier dans
`engine-combat.js` si `res.stats[side].dmgHead` et `.kd` comptent ce que le combattant a
infligé ou encaissé, et prendre ce qu'il a encaissé. Cibles d'ordre de grandeur :
- une décision sans casse : +2 à +5 ;
- une défaite par KO : +20 à +30 ;
- chaque knockdown encaissé ajoute.

**6.2 Blessure.** Une blessure survient si la méthode est `'Blessure'`, ou par un tirage
après le combat dont la probabilité croît avec les dégâts encaissés et le traumatisme. Le
type vient de `rollInjury()`, inchangé.

**6.3 Suspension médicale.** Non contournable (addendum §15). Durées en jours. Le premier
cycle jouable est celui dont la date tombe après l'échéance : avec 5 semaines entre deux
soirées, une suspension de 30 jours n'écarte pas de la soirée à J+35 ; 60 jours écarte de
J+35 mais pas de J+70 ; 90 jours écarte de J+35 et J+70 ; 180 jours écarte jusqu'à J+175,
mais pas de J+210. **Correction T1 ter du 22/09/2026 :** l'ancien calcul gardait chaque
suspension une soirée de trop.

| Situation | Suspension |
|---|---|
| Arrêt médical (coupure) | 30 j |
| Défaite par KO | 60 j |
| Entorse grave à la cheville | 60 j |
| Fracture de la main, fracture orbitale | 90 j |
| Déchirure ligamentaire, commotion cérébrale sévère | 180 j |
| Décision, dégâts à la tête très élevés | 30 j |

Si plusieurs lignes s'appliquent, la plus longue l'emporte. Champ sur la ligne :
`susp` = cycle jusqu'auquel il est indisponible.

**6.4 Fin de carrière médicale.** Définitive, sans réparation. Elle survient si :
- le traumatisme atteint 100 ;
- ou une commotion cérébrale sévère touche un corps déjà au-dessus de
  `MGMT_BODY_THRESHOLD`.

Champ `retired: 'medical'` sur la ligne. Le combattant reste dans le roster et dans la
mémoire, mais n'est plus jamais proposé.

**6.5 Indisponibles.** Suspendus et retraités sont exclus de `mgmtEligiblePairs`, de la
proposition en bloc et des propositions simples.

**6.6 Règle du bureau.** Déclencheur `'injury'` (déjà dans `MGMT_TRIGGERS`) :
- blessure ou suspension de 90 j et plus : passage au niveau 2, **sans compter
  d'interaction** (addendum §5 : ce n'est pas un choix du joueur) ;
- fin de carrière médicale : passage **direct au niveau 3** (CDC §3, « KO grave »).

**6.7 Mémoire.** Seules les blessures, suspensions de 90 j et plus, et fins de carrière
deviennent des faits (`mgmtAddFact`). Pas les résultats ordinaires : dix faits maximum,
ils ne doivent pas être noyés par chaque soirée.

---

## 7. LE LENDEMAIN

Séquence imposée et courte (addendum §14). Une carte par combattant touché (suspension,
blessure, fin de carrière), du plus grave au moins grave. Seule action : continuer.

Chaque carte montre le nom et le fait, avec les libellés neutres existants (même style que
`MGMT_FACT_LABELS`). À la place de la parole de Clara, un emplacement vide selon la
convention du lot 1 : `[RÉPLIQUE MANQUANTE — Clara : ...]`.

Personne touché : pas de lendemain. Aucune phrase générique pour combler.

---

## 8. CALIBRAGE — CIBLES MONTE CARLO

Script dans `tools/` et rapport dans `tools/reports/`. Au moins 20 000 combats par
catégorie, combattants générés comme le roster de Split.

| Mesure | Cible |
|---|---|
| Deux corps à traumatisme 0 | Résultats identiques au moteur nu, même graine |
| Fin de carrière sur un combat, corps < 30 | < 0,5 % |
| Suspension ≥ 90 j ou fin de carrière, corps ≥ 60 | 20 à 30 % des combats |
| Fin de carrière sur un combat, corps ≥ 60 | 8 à 12 % |
| Défaite par KO, corps ≥ 60 contre corps sain de même niveau | au moins 1,5 fois plus fréquente |
| Roster initial au-dessus du seuil | 10 à 15 % des combattants |

Ces valeurs sont des décisions de design, pas des mesures. Si une cible est inatteignable
sans toucher au moteur, **s'arrêter et le signaler** au lieu de la contourner.

---

## 9. SAUVEGARDE

- `MGMT_SAVE_VERSION` passe de 2 à 3. **Une sauvegarde v2 se charge sans perte** :
  migration 2 → 3. Aucun reset.
- `validateMgmt` / `mgmtValidLine` :
  - `trauma` absent, ou nombre fini dans [0, 100] ;
  - `susp` absent, ou entier ≥ 0 ;
  - `retired` absent, ou `'medical'` ;
  - `m.lastEvent` absent, ou structure valide.
- `mgmtRepair` couvre les nouveaux champs.

---

## 10. DOCUMENTATION

Ajouter tel quel à `docs/CDC-ADDENDUM-2-LES-SIX-REGARDS.md`, à la fin du §3 :

> **Exception : Clara** *(décisions du 10/09/2026, mises en œuvre au lot 3b)*.
> - Ignorer ses avis la fait taire peu à peu, par résignation, jamais par rancune.
> - Le premier drame sur ta carte (fin de carrière ou blessure grave) la change pour de
>   bon : elle perd ses tics, et ils ne reviennent jamais.
> - Si elle s'était tue, elle reparle.
> - Si tu continues de l'ignorer, elle peut se taire à nouveau, et chaque nouveau drame
>   la fait revenir.
> - Quand le drame arrive sur un corps qu'elle n'avait pas vu venir, elle ne dit rien :
>   il n'y a que le fait.
>
> C'est la seule relation qu'on ne perd pas pour toujours. On la récupère, chaque fois,
> au prix d'une carrière.
>
> **Rythme des soirées** *(décision du 10/09/2026)*. Le calendrier impose une soirée à la
> fin de chaque cycle. La carte doit être complète un mois avant ; tant qu'elle ne l'est
> pas, la soirée ne peut pas se lancer. **Le jeu ne choisit jamais un combat à la place du
> joueur.** Pendant ce dernier mois, des imprévus peuvent survenir : blessure au camp,
> remplaçant à court préavis, changement de placement. Chacun arrive comme une décision
> du joueur, jamais comme un choix automatique.

---

## 11. TESTS — `tests/mgmtSoiree.test.js`, inclus dans `npm test`

- `mgmtTrauma` et `mgmtCombatProfile` : identiques d'un appel à l'autre, et sans effet sur
  la suite de `rnd()`.
- Traumatisme 0 : combat identique au moteur nu, même graine.
- **Décision d'Anthony du 22/09/2026 :** le traumatisme reste dans [0, 100], sa part
  acquise ne se récupère jamais, et un combat ne fait jamais descendre le total courant.
- Fin de carrière définitive : jamais reproposé, jamais remis en carte.
- Suspendus exclus de toutes les propositions jusqu'à la fin de la suspension, puis de
  nouveau proposables.
- Soirée calculée une seule fois : recharger après la soirée ne change aucun résultat.
- Une soirée à chaque fin de cycle, et jamais avec une carte incomplète.
- Carte incomplète quand la pile est vide : le cycle ne se ferme pas, et une nouvelle
  proposition de Leïla arrive en tête de pile.
- Aucun combat n'est jamais ajouté à la carte sans une action du joueur (valider ou
  échanger).
- La proposition en bloc ne peut pas être ignorée tant que la carte est incomplète.
- Carte verrouillée entre l'échéance et la soirée.
- Carte vidée après la soirée, puis nouvelle proposition en bloc de Leïla.
- Promotions : niveau 2 sans interaction comptée sur blessure, niveau 3 sur fin de
  carrière.
- Aucune valeur de traumatisme dans le DOM des écrans bureau, soirée et lendemain.
- Sauvegarde v2 chargée et migrée ; champs invalides rejetés ou réparés.
- `git diff main -- engine-*.js ui-0*.js ui-10-*.js` est vide.

`npm run check` vert. Aucun test existant supprimé ni ignoré.

---

## 12. RAPPORT DE LOT

Livrer `LOT-3A-RAPPORT.md`, même format que `LOT-1-RAPPORT.md` :
- ce qui a été fait ;
- les valeurs de calibrage retenues et le tableau du §8 **mesuré** ;
- les écarts aux cibles ;
- les questions rencontrées.
