# Cage Legacy — Plan V4 « Exécution »

**Objet.** Audit du repo réel (`github.com/Pinocchi00/Cage-Legacy`, commit `974e191`) contre les 23 retours du joueur et contre le Plan V3 Humanité, puis plan de correction ordonné.

**Méthode.** Chaque constat ci-dessous a été vérifié dans le code, en exécutant le jeu sous jsdom quand la lecture ne suffisait pas. Les mesures chiffrées viennent d'exécutions réelles, jamais d'une estimation.

**Statut du repo à l'audit.** Le Plan V3 a déjà été partiellement appliqué : `data-people.js`, `data-faith-content.js`, `tools/lint-content.js` et `tests/invariants.test.js` existent. Le travail restant n'est donc pas « tout faire », c'est **finir ce qui a été livré à moitié** et **reprendre cinq correctifs de façade**.

---

## 1. Résultat de l'audit

87 exigences distinctes extraites du PDF (23 retours décomposés), 11 exigences structurelles extraites du Plan V3.

| | Traité | Partiel | Absent |
|---|---|---|---|
| Exigences du PDF (87) | 38 | 21 | 28 |
| Exigences structurelles (11) | 5 | 3 | 3 |

### 1.1 Le motif à ne pas reproduire

Les passes précédentes ont **livré l'infrastructure et sauté l'usage**. C'est vérifiable point par point :

- `TEXT_POOLS` / `txtPick()` (engine.js:1722-1763) est un moteur correct — **5 pools migrés sur ~30**. Le linter du projet lui-même conclut : « 0 pool(s) enregistré(s) au runtime ».
- `data-people.js` livre **24 coachs et 10 salles** — **aucun écran ne les lit**. `scr_faith_camps()` (ui-04:906) lit toujours `FAITH_CAMPS`, 6 camps anonymes.
- `worldTick()` (engine.js:1767-1790) appelle `advanceRoster()` et pousse une ligne d'historique. Le commentaire assume que la progression des sparrings et la composition des cartes sont « explicitement DIFFÉRÉES ».
- `tools/lint-content.js` fonctionne et remonte **58 signalements** (48 chaînes trop longues, 10 anglicismes). Aucun n'a été traité.
- Sur 7 invariants déclarés bloquants au §6.2 du Plan V3, **4 le sont réellement** : INV-05 est absent du fichier, INV-03 et INV-06 sont dégradés en `console.log`.

### 1.2 Les cinq correctifs de façade à reprendre

Ancre présente, commentaire explicatif présent, correctif absent :

1. **P08.1** — `ui-04:829` : la chaîne `'il parle de repositionner sa liste de clients'`, citée nommément au §1.3 du Plan V3 comme exemple de ce qu'il faut supprimer, est toujours livrée à la ligne près.
2. **P21.1** — `ui-04:1386` : le grand chiffre de la fiche est toujours le score composite ; seule l'étiquette a changé (`/100 · Score de Légende (Héritage)`). L'overall n'apparaît nulle part.
3. **P17** — `ui-06:862`, `:867`, `:929` : les avertissements de plafond (`(déjà au maximum)`) sont intacts, les caps de `engine.js:638` et `:1644` aussi. Aucune des 4 exigences n'a été touchée.
4. **P10.2** — `ui-04:1064` : les options d'événement n'affichent que `c.label`. Les effets n'apparaissent qu'après le clic.
5. **P02** — `state.js:788` force encore `faithAmbiance='papier'` (valeur morte, mais le plan demandait `'nuit'`) et la bascule clair/sombre `CL.theme()` (ui-08:486) existe toujours.

---

## 2. Cause racine de P21.20 — « j'ai pu faire que 15 combats »

C'est le constat le plus important de cet audit. Deux bugs indépendants s'additionnent.

### 2.1 Le combattant Faith vieillit deux fois par saison

**Mesure.** Instrumentation de `applyAging` sur une carrière Faith complète (jsdom, code du repo) :

```
DEPART age=18 annee=2026
2026 → applyAging  at resolveFight    (ui-05:530)
2027 → applyAging  at nextFaithYear   (ui-08:2301)
2027 → applyAging  at resolveFight    (ui-05:530)
2028 → applyAging  at nextFaithYear   (ui-08:2301)
2028 → applyAging  at resolveFight    (ui-05:530)
…
```

Progression mesurée : `2026 age=18 · 2027 age=20 · 2028 age=22 · 2029 age=24 · 2030 age=26 … 2036 age=37`.

**Diagnostic.** Deux horloges tournent en parallèle. `ui-05:529-530` porte le compteur `_fy`, conçu pour le mode Carrière où le temps avance *par combat*. Le mode Faith a son propre calendrier de 12 mois (`FAITH_CALENDRIER`, ui-04:92) et fait déjà vieillir une fois par saison à `ui-08:2301`. La fenêtre 18→37 ans, qui vaut 19 saisons, est consommée en 10.

### 2.2 Le palmarès amateur est détruit, pas archivé

**Mesure.** Même sonde, transition amateur→pro : `2029 combats=12 org=0` puis `2030 combats=0 org=3`.

**Diagnostic.** `turnPro()` (ui-05:736) sauve le bilan chiffré dans `f.amaRec` mais exécute `f.history=[]`. La liste des combats amateurs est détruite. La fiche du joueur affichait « 2026-2036 · 9-6 · 3 KO » : 15 combats pro sur une carrière qui en comptait ~27.

**Conséquence.** Le joueur n'a pas eu une carrière courte. Il a eu une carrière deux fois trop rapide dont on lui a caché la première moitié. Aucun travail sur les relations, la némésis ou le pic de carrière n'a de sens tant que ces deux bugs sont là.

---

## 3. Les 20 correctifs

Chaque correctif porte : ce qui change, le fichier et le bloc, et l'écran où le joueur en voit l'effet. **Un correctif sans écran nommé n'est pas fait.**

### LOT 1 — Préalable bloquant

#### C1 — Une seule horloge par mode
**Fichier** `ui-05-fight-resolution.js:528-530`

AVANT
```js
let endOfSeason=false;
const fightsPerYear=(G.f.age>=18&&G.f.age<=23)?RI(3,4):RI(1,4);
G.f._fy=(G.f._fy||0)+1; if(G.f._fy>=fightsPerYear){ const declineLog=applyAging(G.f); G.f._fy=0; endOfSeason=true;
```

APRÈS
```js
/* ==== [ANCRE: V3_HORLOGE_UNIQUE] — Plan V4 §2.1, cause racine de P21 point 4 :
   en mode Faith le temps appartient au CALENDRIER (12 mois, FAITH_CALENDRIER)
   et le vieillissement est déjà appliqué une fois par saison par
   nextFaithYear() (ui-08:2301). Le compteur _fy ci-dessous est l'horloge du
   mode Carrière, où le temps avance par combat. Les deux tournaient ensemble :
   ~2 ans par saison, carrière de 10 saisons au lieu de 19. ==== */
let endOfSeason=false;
const modeFaith=!!G.faith;
const fightsPerYear=(G.f.age>=18&&G.f.age<=23)?RI(3,4):RI(1,4);
G.f._fy=(G.f._fy||0)+1;
if(!modeFaith && G.f._fy>=fightsPerYear){ const declineLog=applyAging(G.f); G.f._fy=0; endOfSeason=true;
```

`G.faith` est déjà le discriminant de mode utilisé dans ce fichier (ui-05:236). `state.js:594` confirme qu'aucun champ `G.mode` n'existe : ne pas en inventer un.

**Écran** : fiche de fin de carrière — le nombre de combats doit passer de ~15 à 25-40.
**Recette** : relancer la sonde §2.1. Attendu `age +1/saison`, retraite vers 2045. Si le total dépasse 40, réduire `faithFightsPlanned()` (ui-04:66-74), jamais rallonger la vieillesse.

#### C2 — L'historique de combats est déplacé, jamais détruit
**Fichier** `ui-05-fight-resolution.js:736`

AVANT
```js
function turnPro(){ const f=G.f; f.amaRec={W:f.W,L:f.L}; f.stage='pro';
  f.W=f.L=f.D=f.ko=f.sub=f.dec=f.koLoss=f.streak=0; f.orgWins=0; f.easyFights=0; f.history=[]; …
```

APRÈS
```js
function turnPro(){ const f=G.f; f.amaRec={W:f.W,L:f.L}; f.stage='pro';
  /* ==== [ANCRE: V3_HISTORIQUE_PRESERVE] — Plan V4 §2.2 : les compteurs pro
     repartent de zéro (règle du sport), mais l'historique des combats est la
     matière première des Archives (C10) et de la fiche (C17/C19). Déplacé,
     jamais détruit. ==== */
  f.amaHistory=(f.history||[]).slice();
  f.W=f.L=f.D=f.ko=f.sub=f.dec=f.koLoss=f.streak=0; f.orgWins=0; f.easyFights=0; f.history=[]; …
```

Corriger ensuite le total de la fiche pour additionner `amaHistory.length`.

**Écran** : fiche de carrière, ligne de palmarès et bloc « Le parcours ».

### LOT 2 — Réarmer les garde-fous

#### C3 — INV-05 et réarmement d'INV-03 / INV-06
**Fichier** `tests/invariants.test.js`

- Écrire **INV-05** (absent) : aucun événement narratif ne se déclenche sans que son `req(ctx)` soit satisfait. C'est l'invariant qui garde P05b, P12 et P20.
- `:146` (sauts de `nemesisRecord`) et `:151` (longueur de carrière) sont des `console.log`. Une fois C1 et C2 livrés, INV-06 devient satisfiable : convertir les deux en `assert`.

**Écran** : aucun — c'est le seul correctif du plan qui n'en a pas, et c'est assumé : il protège les 18 autres.

### LOT 3 — Les quatre mensonges à l'écran

#### C4 — La ligne d'agent
**Fichier** `ui-04-faith-arcade-screens.js:825-829`

AVANT
```js
const agentMood=!F.agent?'sans agent cette année'
  :agentPatience>=3?'il vous suit sans discuter'
  :agentPatience>=1?'il commence à compter les faveurs'
  :'il parle de repositionner sa liste de clients';
```

APRÈS
```js
/* ==== [ANCRE: V3_AGENT_CONSEQUENTIEL] — Plan V3 §5.2.2 point 3 : l'humeur de
   l'agent dit ce qu'il FERA à la prochaine offre, avec un chiffre ou un nom,
   jamais un état d'âme. La dernière ligne était l'exemple de rejet du §1.3. */
const nextOpp=(F.pendingOffer&&F.pendingOffer.opp&&F.pendingOffer.opp.o)||null;
const agentMood=!F.agent
  ?'Aucun agent : vous signez ce qu\u2019on vous propose, sans négocier.'
  :agentPatience>=3
  ?`Il ira chercher la bourse${nextOpp?` sur le combat contre ${nextOpp.name}`:''} — vous pouvez encore refuser une fois.`
  :agentPatience>=1
  ?'Il négociera la bourse, mais ne demandera plus d\u2019autre adversaire pour vous.'
  :'Il prendra la prochaine offre telle quelle. Plus de négociation cette année.';
```

**Écran** : Contacts, carte « Votre agent ».

#### C5 — Les effets avant le clic
**Fichier** `ui-04-faith-arcade-screens.js:1064-1066`

AVANT
```js
${ev.choices.map((c,i)=>`<div class="opp" … onclick="CL.chooseFaithEvent(${i})">
  <b style="font-size:15px">${esc(c.label)}</b>
</div>`).join('')}
```

APRÈS
```js
/* ==== [ANCRE: V3_EFFETS_AVANT_CLIC] — Plan V3 Loi 6 / §5.2.3 point 3 (P10) :
   un choix qui n'affiche pas ses effets est interdit. formatEventDelta() existe
   déjà (utilisé après résolution). Le risque reste qualitatif (ancre
   FAITH_RISQUE_DECLARE) : on annonce qu'il y a un risque, jamais sa proba. */
${ev.choices.map((c,i)=>`<div class="opp" … onclick="CL.chooseFaithEvent(${i})">
  <b style="font-size:15px">${esc(c.label)}</b>
  ${c.d?`<div class="tagrow" style="margin-top:8px">${formatEventDelta(c.d)}</div>`:''}
  ${c.risk?`<div class="mono small" style="margin-top:6px;color:var(--warn)">Ça peut mal tourner.</div>`:''}
</div>`).join('')}
```

Ce correctif traite P10.2 sur **tous** les événements du jeu, pas seulement l'écran de coach.

**Écran** : tout écran d'événement de vie ou de branche.
**Exception à documenter** : le choix de coach (C7) affiche le palmarès du coach, **pas** un delta d'attributs — un être humain ne se choisit pas au calcul. Sans cette note dans l'ancre, quelqu'un « corrigera » l'incohérence plus tard.

#### C6 — Supprimer les plafonds
**Fichiers** `ui-06-career-screens.js:862`, `:867`, `:929` puis `engine.js:638`, `:1644`

Affichage, `ui-06:929` :

AVANT
```js
${trueZeroGain?' <span class="muted" style="font-size:11px">(déjà au maximum)</span>':''}
```
APRÈS
```js
/* [V3_PLAFOND_INVISIBLE] P17.2 : le joueur ne lit jamais qu'il a atteint une
   limite. Le gain nul reste nul, il n'est plus commenté. */
${''}
```
Même traitement pour `:862` et `:867` (« X déjà au maximum — converti en… ») : garder la conversion, supprimer la mention du plafond.

Mécanique, remplacer le mur par un rendement décroissant :
```js
/* ==== [ANCRE: V3_RENDEMENT_DECROISSANT] — Plan V3 §5.7.3 point 2 (P17), et
   arbitrage A1 : aucune limite côté joueur. Passer de 90 à 95 coûte cher mais
   reste possible. La plausibilité se joue côté roster PNJ (INV-02). ==== */
function gainAttenue(valeur,gainBrut){
  const resistance=valeur<70?1:valeur<85?0.5:valeur<95?0.25:0.12;
  return gainBrut*resistance;
}
```

**Écran** : écran de résultat de combat, bloc de progression d'attributs.
**Recette** : relancer l'audit Monte-Carlo existant (`EQUILIBRAGE_MC`, engine.js:661) sur 500 runs. La queue haute doit exister sans que la médiane dérive.
**Dépendance** : voir §4, contradiction 2 — `advanceRoster()` doit laisser progresser les PNJ d'élite au-delà de leur plafond actuel, sinon la fin de carrière devient une promenade.

#### C7 — Mode sombre définitif
**Fichiers** `state.js:788`, `ui-08:486`

AVANT `if(G.settings.faithAmbiance!=='papier' && G.settings.faithAmbiance!=='nuit') G.settings.faithAmbiance='papier';`
APRÈS `G.settings.faithAmbiance='nuit'; // [V3_DARK_ONLY] P02 : plus un réglage, une constante`

Supprimer `CL.theme()` et tout appelant orphelin.

**Écran** : aucun changement visible (le CSS `.faith-papier` est déjà supprimé) — c'est de l'hygiène, pour que le mode blanc ne ressuscite pas dans six mois.

### LOT 4 — La fiche de carrière

#### C8 — Overall ≠ score de légende
**Fichier** `ui-04-faith-arcade-screens.js:1385-1388`

AVANT
```html
<div class="hero-name" style="font-size:96px">${total}</div>
<div class="mono">/100 · Score de Légende (Héritage)</div>
```
APRÈS
```html
<!-- ==== [ANCRE: V3_OVERALL_VS_LEGENDE] — P21 point 1 : "ce score est censé
     être la note d'overall, pas un mélange entre pic, palmarès etc.". Le grand
     chiffre devient le pic d'overall atteint ; le score composite descend dans
     Héritage, où sa décomposition pic/palmarès/trace a enfin un sens. ==== -->
<div class="hero-name" style="font-size:96px">${F.peakOverall||f.overall}</div>
<div class="mono">/100 · Niveau atteint au sommet</div>
…
<div class="eyebrow" style="margin-top:32px">HÉRITAGE</div>
<div class="hero-name" style="font-size:40px">${total}<span class="mono small">/100</span></div>
${faithScoreRows(sc,[0,180,360])}
```

`computeLegendScore()` (ui-04:1197-1219) n'est pas modifié : il est juste, il était au mauvais endroit.

**Écran** : fiche de carrière, en-tête.

#### C9 — Le déroulé par combat
**Fichier** `ui-04:1680` (`faithJourneyBlock`)

Ajouter le détail par combat au tap sur une saison. Les données sont dans `history[]` — à condition que C2 les préserve **et** qu'on y stocke le rang de l'adversaire au moment du combat, qui n'y est pas aujourd'hui : l'ajouter à la résolution.

**Écran** : fiche de carrière, bloc « Le parcours ».

#### C10 — Les pesées réussies
Case P21.14, omise et déclarée telle par la passe précédente. Ajouter un booléen `weighInPassed` à la résolution du cutting (le tier `complique` peut échouer) et la case correspondante dans `faithCareerStatsGrid()` (ui-04:1282-1299).

**Écran** : fiche de carrière, grille de statistiques.

### LOT 5 — L'entourage humain

C'est le cœur de la demande du joueur et le lot le moins avancé.

#### C11 — Brancher les 10 salles
**Fichier** `ui-04:906` (`scr_faith_camps`)

Remplacer la lecture de `FAITH_CAMPS` (6 camps anonymes) par `FAITH_GYMS`, filtrée à 3 salles éligibles selon réputation (`régionale` tant que `f.org<=1`), style et argent. Chaque carte affiche : nom, ville, spécialité, la culture en une phrase (**déjà écrite dans les données**), le coach principal nommé, l'effet chiffré du camp.

**Écran** : écran des camps d'entraînement.

#### C12 — L'écran de choix de coach
**Nouveau** `scr_faith_coach_choice()`, routé dans `SCREENS` (ui-08:20-21)

Trois coachs tirés de `FAITH_COACHES` (24 disponibles) par filtre de légitimité — un coach de champion refuse un combattant à 2-2. Chacun affiche son palmarès d'entraîneur : le « pourquoi lui et pas un autre » que le joueur réclame est **déjà écrit** dans `bio.origin`, il n'est simplement affiché nulle part hors de la carte Contacts.

Puis `data-faith-content.js:428-431`, événement `evt_br_regional_coach` :

AVANT
```js
choices:[{label:'Rester fidèle',d:[['morale',9],['heart',4],['fightIQ',-3]]},
         {label:'Chercher un préparateur au-dessus',d:[['fightIQ',7],['adaptability',4],['morale',-9]]}]
```
APRÈS — la seconde branche route vers l'écran de choix au lieu d'appliquer un delta ; la première gagne un effet réel (`trust` au maximum, arc tardif) pour cesser d'être la branche perdante par défaut.

**Écran** : nouvel écran de choix de coach, atteint depuis l'événement « Le coach qui plafonne ».

#### C13 — Le sparring devient une personne
**Fichier** `ui-04:823`

`F.sparringPrimaryId` pointe déjà vers un id stable, mais le repli `||(G.faith.gym||[])[0]` peut encore changer d'interlocuteur en silence — c'est le chemin par lequel le bug « Marcus devenu Sean » peut revenir. Le supprimer : si l'id est introuvable, il faut un événement daté avec `leftReason`, jamais un repli.

Faire du sparring principal une `Person` avec `bio` et `rel.arc[]`, comme le coach.

**Écran** : Contacts, carte « Partenaire d'entraînement » — qui doit devenir cliquable.

#### C14 — Le lore des combattants
**Fichier** génération du roster + `ui-04` (offre, fiche adverse, classement)

`PERSON_TRAITS` (data-people.js:252) n'est lu qu'à un seul endroit, `state.js:740`, pour les coachs et agents. Les combattants n'ont rien. Poser à la génération trois chaînes courtes **stables à vie** : `bio.origin`, `bio.past`, `bio.trait`. Les afficher sur l'offre (une seule des trois, celle qui est pertinente pour ce combat), sur la fiche adverse, et au tap dans le classement.

**Écran** : écran d'offre, fiche d'adversaire, classement.

### LOT 6 — L'univers

#### C15 — Les Archives
**Nouveau** `scr_faith_archives()`

Possible seulement après C2. Une ligne par combat, densité `mono`, aucune prose : saison, adversaire (nom + rang **au moment du combat**), résultat, méthode, round, bourse. Filtre par adversaire pour voir une trilogie d'un coup. Accessible depuis le hub et depuis toute fiche de combattant.

**Écran** : nouvel écran Archives.

#### C16 — L'univers qui change
**Fichier** `data-faith-content.js:490-493`

AVANT
```js
choices:[{label:'Aller chercher plus loin',d:[['confidence',6],['adaptability',5],['morale',-5]]},
         {label:'Régner sur son territoire',d:[['morale',9],['confidence',4],['fightIQ',-3]]}]
```
APRÈS
```js
/* ==== [ANCRE: V3_MONDE_QUI_CHANGE] — P12 point 3 : "je veux que l'univers du
   jeu change". Un choix de trajectoire ne se paie pas en attributs : il change
   le bassin d'adversaires, l'organisation et le lieu des galas. Le socle existe
   déjà (FAITH_GALA_CITIES, FAITH_GALA_CITY_COUNTRY, avantage du terrain) — il
   manquait seulement un choix qui le pilote. ==== */
choices:[
 {label:'Aller chercher plus loin',
  effect:f=>{ f._territoire='international'; faithUnlockOrgTier(f,2); F.galaPool='international'; },
  d:[['confidence',4],['morale',-5]]},
 {label:'Régner sur son territoire',
  effect:f=>{ f._territoire='regional'; F.galaPool='regional'; F.homeAdvantage=true; },
  d:[['morale',9]]}]
```

**Écran** : écran de gala (villes), écran d'offre (bassin d'adversaires).

#### C17 — Le rang mondial
`p4pScore()` est déjà calculé et sert au tri des propositions et à l'onglet P4P. Il n'est jamais montré au joueur comme **sa** position. L'exposer : `#N mondial` sur le hub, à côté du rang de division, et sur la fiche. Correctif d'affichage, pas de calcul.

**Écran** : hub, bandeau supérieur.

### LOT 7 — Le contenu

À écrire **après** C1 : doubler la longueur de carrière double les occurrences, donc les seuils de la Loi 4 doivent être recalculés sur la carrière réelle.

#### C18 — Le cutting
**Fichier** `ui-06:503-522`

Quatre gabarits en dur pour ~20 pesées par carrière (~40 après C1). Sortir la phrase d'ambiance dans `FAITH_CUTTING_LINES` : **80 entrées**, réparties 15/20/25/20 sur les quatre tiers, chacune avec son `req(ctx)`. Le HTML, les chiffres et les effets ne bougent pas.

Cas qui doivent exister et qui manquent : le poids lourd qui ne coupe rien, le troisième cutting difficile d'affilée, le vétéran dont le corps ne répond plus, la descente de catégorie.

**Écran** : vestiaire, bloc cutting.

#### C19 — Conférence et pesée
**Fichiers** `ui-04:785-793` (postures), `data-faith-content.js:879` (réponses), nouvel écran de pesée

- Postures : remplacer les trois libellés en dur (`Le respect` / `La provocation` / `Le silence`) par un tirage de 3 parmi **12+**, filtré par `f.personality`, la nature de l'adversaire et l'historique commun. Un `taiseux` ne voit jamais « Vendre le combat » ; un `showman` a accès à « Lui caresser le nez pour rigoler » — textuellement dans la demande P19 — dont l'issue dépend du caractère de l'adversaire, jamais d'un dé nu.
- `FAITH_PRESSCONF_REPLIES` : de **27 à 80+**, `req(ctx)` déjà en place.
- Pesée : lui donner son écran, avec cinq registres tirés selon `F.buildup.tension`, la personnalité des **deux** combattants et leur historique commun.
  ```js
  const REGISTRES=['calme','tendu','comique','menacant','spectacle'];
  ```
  `FAITH_PESEE_SITUATIONS` : **60 entrées**, 12 par registre, chacune avec 2-3 gestes dont l'issue lit `personality` et `trait` de l'adversaire — deux champs déjà présents.
- **Gating obligatoire** : même condition que `pressConf` (rang ≤ 4, champion, ou rival), et pas plus de deux temps forts d'avant-combat par carte. Sans ça on recrée exactement le problème P15.1.

**Écran** : conférence de presse, nouvel écran de pesée.

#### C20 — Le caractère au bilan
**Fichier** `ui-04`, générateur de titres de presse

`f.spectacle` existe (initialisé ui-08:1558, alimenté ui-05:727-729, lu ui-04:632 et :1570) mais le bilan ne l'exploite qu'une fois. Croiser les deux axes :

| | spectacle haut | spectacle bas |
|---|---|---|
| **bilan positif** | « Le nouveau visage de la division » | « Efficace. Personne ne parle de lui. » |
| **bilan négatif** | « Il perd, mais on rachète des billets » | « L'année où plus rien n'a pris » |

Quatre familles de titres, 10+ variantes chacune. Traite P11.5, P11.6 et P11.1 ensemble.

**Écran** : écran de bilan de saison, coupure de presse.

---

## 4. Contradictions à arbitrer avant d'écrire

1. **C1 invalide tous les seuils de la Loi 4.** Doubler la carrière double les occurrences. Écrire 80 variantes de conférence avant C1, c'est en écrire la moitié de ce qu'il faut. → **C1 avant tout contenu, sans exception.**
2. **C6 (plafonds) contre INV-02 (plausibilité du roster).** Supprimer les plafonds côté joueur pendant que l'invariant contraint les PNJ crée une asymétrie : à 40 combats, le joueur écrase un roster borné. L'arbitrage A1 tranche pour le joueur — il faut alors que `advanceRoster()` fasse progresser les PNJ d'élite au-delà de leur plafond actuel, sinon la fin de carrière devient une promenade et P09.4 tombe.
3. **C12 (choix de coach) contre C5 (effets avant clic).** Un choix de coach qui affiche ses deltas devient un calcul d'optimisation, pas une décision humaine. → Afficher le palmarès du coach, pas le delta. Exception assumée, **à documenter dans l'ancre**.
4. **C2 (historique préservé) contre le poids de la sauvegarde.** 40 combats × historique complet + `amaHistory` + `rankHistory` + registre des Persons : vérifier le volume `localStorage` (~5 Mo) avant de livrer. Si ça coince, tronquer `history[]` à l'essentiel (adversaire, rang, résultat, méthode, round, bourse) plutôt qu'abandonner les Archives.
5. **C19 (pesée) contre P15.1 (rareté).** Un écran de pesée à chaque combat recrée le problème de la conférence. Gating identique, deux temps forts maximum par carte.

---

## 5. Ordre d'exécution

| Lot | Correctifs | Pourquoi ici |
|---|---|---|
| 1 | C1, C2 | Cause racine. Tout le reste est calibré dessus. |
| 2 | C3 | Sans les invariants réarmés, rien ne garantit que la suite ne casse pas C1. |
| 3 | C4, C5, C6, C7 | Quatre mensonges à l'écran, courts, isolés. Effet immédiat. |
| 4 | C8, C9, C10 | La fiche : le joueur y juge sa carrière, elle doit être vraie avant d'être riche. |
| 5 | C11, C12, C13, C14 | L'entourage et le roster. Le plus gros du travail, le cœur de la demande. |
| 6 | C15, C16, C17 | Archives, univers, rang mondial. Dépendent de C2 et C11-C12. |
| 7 | C18, C19, C20 | Le contenu. En dernier, une fois les fréquences réelles connues. |

Ordre de grandeur du travail restant : 25 à 40 heures. Ce n'est pas une session.

---

## 6. Critère de recette

**Un correctif n'est fait que si on peut nommer l'écran où le joueur en voit l'effet.**

Pas l'ancre posée. Pas le test qui passe. Pas la donnée en place. L'écran.

C'est exactement le contrôle qui a manqué aux passes précédentes : chaque pièce était vérifiable individuellement et passait ; l'ensemble ne produisait rien pour le joueur. La seule exception est C3, qui n'a pas d'écran et dont c'est le rôle.

Contrôles complémentaires à chaque fin de lot :

- `node --check` sur chaque fichier modifié
- `node --test tests/` — vert, invariants inclus
- `node tools/lint-content.js` — le nombre de signalements doit **baisser**, jamais monter (58 au départ)
- Une carrière Faith jouée de bout en bout sous jsdom, sans écran bloqué
- La question posée à voix haute : *sur quel écran je le vois ?*

---

## 7. La phrase à garder en tête

Le joueur a écrit la ligne qui résume ses 23 retours :

> « On affronte un nom, pas une personne. »

Chaque correctif de ce document sert à rendre cette phrase fausse. Un correctif qui n'y contribue pas est un correctif technique — utile, mais pas suffisant au regard de la demande.
