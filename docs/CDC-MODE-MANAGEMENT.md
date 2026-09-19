# CAGE LEGACY — MODE MANAGEMENT
## Cahier des charges (v1)

Document de design. Aucun code n'est écrit avant qu'il soit validé.
Maître mot du jeu : **l'humanité.**

---

## 1. POSITION DU JOUEUR

**Tu es le matchmaker d'une organisation de MMA. Tu n'en es pas le patron.**

Ce choix n'est pas cosmétique, il porte tout le mode. Un patron ne rend de comptes à
personne : ses arbitrages sont froids, il tranche et il assume. Un matchmaker est coincé
entre quatre volontés qui ne peuvent pas être satisfaites en même temps, et il doit
regarder en face les gens à qui il vient de faire du tort. C'est structurellement la
position la plus humaine du sport, et personne ne l'a mise en jeu.

Les quatre pressions, permanentes et incompatibles :

| Qui | Veut |
|---|---|
| Le diffuseur | Du spectacle, des noms précis, des dates tenues |
| Le patron | De la marge, pas d'histoires, pas de scandale |
| Les combattants | Une carrière, de l'argent, du respect, de l'activité |
| La commission / le médecin | De la sécurité, des suspensions respectées |

Aucune carte ne contente les quatre. Chacun se souvient.

---

## 2. LA TENSION CENTRALE

> **La carte de ce soir doit être bonne. Les carrières doivent durer des années.
> Chaque bonne carte abîme quelqu'un.**

Tout le mode est cette phrase, répétée. Un combat qui fera un carton est presque toujours
un combat qu'un des deux hommes ne devrait pas prendre. Un combat sûr pour tes deux
combattants ne vend rien.

Si une décision du joueur ne se ramène pas à cet arbitrage, c'est probablement une
décision inutile — supprime-la.

---

## 3. LA RÈGLE DU BUREAU (validée)

> ⚠️ **Remplacé par VISION-MODE-MANAGEMENT.md le 17/09/2026.**

C'est la réponse au problème « des centaines de combattants, mais on est débordé ».
Le monde est peuplé. Le bureau est petit.

Trois niveaux de profondeur, et un combattant ne monte de niveau que par le jeu :

**Niveau 1 — NOM.** Une ligne de classement : nom, bilan, âge, catégorie, organisation.
Rien d'autre n'existe, ni en mémoire ni en base. Le monde peut en contenir des centaines.

**Niveau 2 — DOSSIER.** Généré au moment exact où il croise ton bureau : tu lui proposes un
combat, il refuse, il te demande quelque chose, il se blesse sur ta carte, son agent
t'appelle à son sujet. Le jeu fabrique alors sa raison de se battre, sa situation, sa
voix. **Une seule fois, définitivement.** Il ne redevient jamais un nom.

**Niveau 3 — ATTACHÉ.** Après trois interactions, ou une seule marquante (KO grave,
titre, trahison). Il te contacte désormais de lui-même, il apparaît dans les conversations
des autres, sa carrière te suit même quand tu ne t'en occupes pas.

Conséquence : le joueur ne lit jamais cent biographies. Il en accumule dix à vingt sur une
saison, et ce sont exactement celles qu'il a lui-même provoquées. C'est ainsi que
l'attachement se forme dans la vraie vie, et c'est ce qui rend la mémoire tenable.

---

## 4. LA BOUCLE

Un événement toutes les 4 à 6 semaines. Entre deux événements :

### 4.1 Le bureau
> ⚠️ **Remplacé par VISION-MODE-MANAGEMENT.md le 17/09/2026** (la pile d'affaires
> n'est plus l'écran principal ; le bureau n'est plus le centre du jeu).

L'écran principal est une **pile d'affaires** : appels, demandes, problèmes. Huit à
quinze par cycle. Chaque affaire est une personne, jamais un menu.

Tu ne peux pas tout traiter. **Ignorer est une décision** : le combattant que tu n'as
jamais rappelé s'en souvient, et le jeu ne te préviendra pas.

### 4.2 La carte
- **Main event et co-main : tu les choisis toi.** *(Remplacé par
  VISION-MODE-MANAGEMENT.md le 17/09/2026 : le joueur ne se limite plus au main
  event et au co-main — il gère la carte principale.)* Ce sont les seuls combats sur lesquels le
  jeu te laisse t'attarder. Ils doivent être douloureux à trancher.
- **Le reste de la carte : ton adjoint te la propose.** Tu valides d'un geste, tu échanges
  un combat, ou tu écrases tout. Écraser coûte — voir §5.
- **Deux ou trois dossiers du cycle** : un combattant dont l'histoire arrive à maturité et
  qui exige une décision personnelle.

Total : **trois à cinq décisions réelles par événement.** Pas trente.
*(Remplacé par VISION-MODE-MANAGEMENT.md le 17/09/2026 : le quota de décisions
est abandonné — un vrai travail, sans quota.)*

### 4.3 La soirée
Elle se déroule, tu regardes. Le moteur de combat existant fait le travail.

### 4.4 Le lendemain
C'est ici que le mode vit, pas dans la carte. Blessures, suspensions médicales, une
carrière qui s'arrête, une cote qui explose, le patron qui commente, le diffuseur qui
appelle. Le lendemain est un écran à part entière, pas un récapitulatif.

---

## 5. LES PERSONNAGES RÉCURRENTS

Six personnes présentes sur des années, avec leur agenda propre. Elles ne sont pas des
sources de bonus : **elles sont le mode.**

1. **L'adjoint matchmaker** — il propose la sous-carte. Il a des goûts, il croit à un
   gamin, il te trouve trop dur ou pas assez. Quand tu écrases ses propositions trois fois
   de suite, il te le dit. Le mécanisme qui te sauve du surmenage est aussi celui qui rend
   le poste habité.
2. **Le patron** — il ne comprend pas le sport, il comprend les chiffres. Il te protège
   tant que tu produis. C'est lui qui te vire.
3. **L'agent** — il représente trois de tes meilleurs et s'en sert. Il ment bien.
4. **Le représentant du diffuseur** — il exige des noms précis à des dates précises.
   Il ne négocie pas, il rappelle le contrat.
5. **Le médecin de commission** — il n'a aucun pouvoir sur toi, seulement raison.
6. **Le vétéran du vestiaire** — aucune autorité officielle, toute l'autorité réelle.
   Ce qu'il pense de toi devient ce que le vestiaire pense de toi.

*(Un septième, le journaliste avec un dossier sur toi, est en réserve pour la v2.)*

---

## 6. LES ÉCHANGES PARLÉS

**Les décisions arrivent par la parole, pas par un menu.** Le chiffre qui bouge est la
conséquence, jamais l'interface.

Format strict :
- Trois à six lignes, **une seule voix**. Pas de narration omnisciente.
- Deux à quatre réponses. Ce sont des **choses que tu dirais**, pas des options étiquetées.
- **Aucun impact chiffré affiché.** Ni « +5 moral », ni « −10 réputation ». Le joueur
  apprend les conséquences en les vivant, comme dans la vie.
- Le ton varie selon qui parle et selon l'historique. Un agent ne te parle pas comme un
  vétéran.
- Zéro réplique générique. C'est la faille documentée du concurrent le plus proche : il a
  dû corriger des combattants qui réclamaient mécaniquement une augmentation après une
  défaite. Une réplique qui pourrait sortir de n'importe quelle bouche ne sort d'aucune.

---

## 7. L'ÉCHEC

**La faillite est un mauvais game over.** Le vrai échec d'un matchmaker, c'est que plus
personne ne veuille travailler avec lui.

Quatre réputations distinctes, jamais fusionnées en une jauge :

- **Vestiaire** — s'effondre : les combattants refusent tes combats, préfèrent la
  concurrence, parlent à la presse.
- **Agents** — s'effondre : tu n'as plus accès aux talents. Tes cartes se vident.
- **Diffuseur** — s'effondre : pires créneaux, moins d'argent, exigences plus dures.
- **Patron** — s'effondre : **tu es viré. C'est la seule fin de partie.**

L'argent reste la pression visible et permanente. La réputation humaine est la condition
de défaite. Le joueur doit pouvoir être rentable et fini.

---

## 8. HORS PÉRIMÈTRE DE LA V1

À ne pas construire, quoi qu'il arrive :

- ❌ **Aucun arbre de compétences, aucun système de déblocage.** C'est le reproche numéro un
  adressé au concurrent direct : les joueurs de sims de gestion ne veulent pas être guidés
  dans un couloir à chaque partie. Bac à sable dès la première minute.
- ❌ Pas de construction de salle, pas d'entraînement de combattants par le joueur — tu es
  matchmaker, pas coach. Le mode Coach est un autre mode, plus tard.
- ❌ Pas de gestion de plusieurs organisations.
- ❌ Pas de nouveaux systèmes de combat. Le moteur existant suffit et il est bon.

---

## 9. CHIFFRES DE CADRAGE

- Roster sous contrat : **40 à 60**. Pas 200.
- Monde total : quelques centaines de noms (niveau 1), classements et promotions rivales.
- Événements : un toutes les 4 à 6 semaines.
- Décisions réelles par événement : 3 à 5.
  *(Remplacé par VISION-MODE-MANAGEMENT.md le 17/09/2026 : quota abandonné.)*
- Affaires au bureau par cycle : 8 à 15.
  *(Remplacé par VISION-MODE-MANAGEMENT.md le 17/09/2026 : la pile d'affaires
  n'est plus l'écran principal — voir §4.1 — et son volume par cycle n'est plus
  un chiffre de cadrage.)*
- Personnages récurrents : 6.
- Dossiers accumulés par le joueur sur une saison : 10 à 20.

---

## 10. INTERFACE — PC, PAS TÉLÉPHONE

Le portage n'est pas un emballage, c'est une refonte de la mise en page. Référence du
genre : les meilleures sims de booking gagnent sur le confort du minute par minute, pas sur
la profondeur — un concurrent bien plus riche perd des joueurs uniquement parce que son
interface fait durer trop longtemps la même série d'actions.

- **Densité.** La carte, le roster et les finances visibles en même temps. Le gabarit
  560px force le séquentiel : un écran, un clic, un écran. C'est ça qui fait « mobile »,
  pas la résolution.
- **Une soirée = un écran.** Pas sept écrans de tableaux.
- **Clavier d'abord.** Tout au raccourci. Proposer un combat = une action, pas trois clics.
- **Survol et clic droit.** La fiche complète d'un combattant au survol, sans quitter la
  carte. C'est ce qui permet la densité sans la confusion.
- **La direction artistique de registre d'archives est un avantage concurrentiel.** Le
  concurrent le plus proche fait tourner des milliers de portraits générés par IA que son
  propre développeur présente comme un pis-aller. Ne va pas sur ce terrain.

---

## 11. CE QUE TU ÉCRIS TOI-MÊME (ANTHONY)

**Aucun modèle n'écrit ces lignes.** C'est ce qui décide de tes avis Steam.

- [ ] Les six personnages : nom, âge, parcours, ce qu'ils veulent, **comment ils parlent**.
      Une page chacun, à la main.
- [ ] Vingt à trente répliques de référence, réparties sur les six voix, couvrant :
      demander, refuser, mentir, menacer, s'excuser, encaisser une mauvaise nouvelle.
      Elles serviront de gabarit à tout le reste.
- [ ] Les cinq à dix raisons de se battre qui peuvent être attribuées à un dossier
      (§3, niveau 2). Elles doivent changer le sens d'un combat qu'on propose : un homme
      qui envoie de l'argent au pays ne refuse jamais un mauvais combat.
- [ ] Le nom de l'organisation et le contexte de départ.

Tout le reste peut être délégué à un agent. Pas ça.

---

## 12. CRITÈRE DE RÉUSSITE

Pas un nombre de tests. Une question, posée à quelqu'un qui a joué trois heures :

> **Raconte-moi ce qui est arrivé à un de tes combattants.**

S'il raconte une histoire avec un nom dedans, le mode est réussi.
S'il décrit des systèmes, il est raté.
