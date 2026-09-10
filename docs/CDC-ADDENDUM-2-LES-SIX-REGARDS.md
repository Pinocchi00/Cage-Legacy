# CAGE LEGACY — MODE MANAGEMENT
## Addendum 2 — Les six regards

Complète `CDC-MODE-MANAGEMENT.md` et son premier addendum. Même autorité.
Valide et remplace toute réponse antérieure sur la question « comment le joueur juge un
combat avant de le booker ».

---

# 1. LE PRINCIPE

**Un jeu de gestion sans information imparfaite est un tableur.** Si le joueur voit tout, il
existe un coup optimal et il l'exécute. Tous les bons jeux du genre cachent quelque chose ;
la seule question est *quoi*, et *comment on le révèle*.

La concurrence cache des chiffres derrière du brouillard. Le concurrent le plus proche
donne au joueur une note de combat et une note de carte, calculées à partir de sept
systèmes chiffrés imbriqués — hype de combat, position sur la carte, hype de promotion,
hype de ville, demande, taille d'événement, salle.

**Cage Legacy cache des chiffres derrière des gens.**

> Ce n'est pas de la narration. La conséquence n'est pas une histoire, c'est une décision :
> tu bookes ou tu ne bookes pas, tu te trompes ou tu as raison. Les six voix ne racontent
> rien — elles informent, avec du bruit. C'est un brouillard de guerre qui a un visage.

Rappel du §3 de l'addendum 1, toujours en vigueur : **il n'y a pas de note unique.** Le jeu
ne dira jamais si un combat était bon. Les quatre pressions jugent la même soirée
différemment, et le lendemain est porté par des personnes.

---

# 2. CHACUN NE VOIT QU'UNE FACETTE

Chaque personnage voit **ce que son métier lui donne à voir**, et rien d'autre.

| Personnage | Ce qu'il voit |
|---|---|
| **Leïla Malika** | L'appariement sportif : les styles, la dynamique, qui monte, qui n'est pas prêt |
| **Clara Saint-Marie** | Le corps : l'usure, les séquelles, ce qui ne devrait pas remonter |
| **Komma Chrome** | Le vestiaire : l'état d'esprit, ce qu'un homme traverse, ce qu'il ne dit pas |
| **Rebecca Lasso** | L'argent et l'ambition : qui veut quoi, qui est prêt à partir |
| **Stephen Tarpit** | L'audience : ce qui se regarde, ce qui ne se vend pas |
| **Jean-Michel Delatour** | Le coût : ce que ça rapporte, ce que ça coûte |

**Personne ne voit l'ensemble. Le joueur est le seul à entendre les six.**

C'est littéralement le métier de matchmaker, et c'est la mécanique centrale du mode. La
compétence du joueur n'est pas de lire des statistiques : c'est de **recouper ce que six
personnes partiellement informées lui disent**, et de savoir qui croire sur quoi.

---

# 3. PERDRE UNE RELATION, C'EST PERDRE UN ŒIL

**C'est la conséquence la plus importante de tout le mode.**

Le §7 du cahier des charges décrit l'effondrement d'une réputation par des comportements :
les refus se multiplient, les agents rappellent moins vite, les créneaux se dégradent.
**Il faut y ajouter ceci, qui prime :**

> Quand une relation se dégrade, **la personne cesse de te dire ce qu'elle voit.**
> Tu ne perds pas des points. Tu perds une source d'information, définitivement.

- Tu écrases Leïla trop souvent : elle se tait, et tu deviens aveugle au sportif.
- Tu ignores Clara : tu ne vois plus les corps.
- Tu contredis Komma sans cesse : le vestiaire ne te dit plus rien, et tu bookes des hommes
  dont tu ne sais plus rien.

**L'inversion par rapport à la concurrence est exactement ce qui rendra le mode
remarquable.** Chez le concurrent, le tableau de bord s'enrichit à mesure que la promotion
grandit. Ici, **le joueur commence avec six paires d'yeux et peut les perdre une par une.**
Jouer mal ne rend pas plus pauvre, ça rend aveugle. Jouer bien finit par donner six
personnes qui te disent tout — c'est ça, le vrai pouvoir d'un matchmaker.

---

# 4. LES TÉMOIGNAGES NE SONT PAS FIABLES

**Ce ne sont pas des flux de données, ce sont des témoignages.**

- Leïla plaide sur le ressenti (voix v1.1) : elle se trompe parfois.
- Rebecca survend : c'est son métier.
- Tarpit répète ce que le patron a dit avant de l'appeler.
- Clara a raison et n'arrive pas à le dire.
- Komma parle au nom d'un vestiaire qui a ses propres intérêts.
- Delatour ne comprend pas le sport qu'il vend.

Conséquence recherchée : **aucune stratégie d'optimisation n'est possible.** Le joueur
n'apprend pas des chiffres, il apprend des personnes — qui exagère, qui a raison sans
savoir le formuler, qui a intérêt à mentir. C'est le maître mot du jeu appliqué à une
mécanique au lieu d'être une intention.

---

# 5. AFFICHAGE — DEUX VITESSES DANS LE MÊME ÉCRAN

Contrainte de lisibilité, non négociable : **compréhensible au premier coup d'œil, tout en
permettant de creuser.**

**Niveau 1 — immédiat.** À l'ouverture d'une proposition : les combats, et **la remarque du
personnage sur celui qui le gêne.** Une phrase, dans sa voix, sans aucun chiffre. Le joueur
peut décider là-dessus et valider sans rien dérouler.

**Niveau 2 — au déroulé.** Le joueur ouvre un combat et obtient les statistiques complètes
des deux hommes.

**Règle d'affichage absolue : jamais deux combats déroulés en même temps.** Ouvrir un
combat referme le précédent. Sans cette règle, on retombe sur l'écran saturé rejeté au
lot 1.

Le joueur pressé lit une phrase et valide. Le joueur méfiant déroule et compare. **Aucun
des deux n'est puni.** C'est le confort du minute par minute, qui fait gagner les bonnes
sims contre les plus riches.

---

# 6. CE QU'ON NE REPREND PAS À LA CONCURRENCE

- ❌ **Aucune note de combat, aucune note de carte, aucun barème.** Ni avant, ni après.
- ❌ **Aucune étiquette descriptive après coup** du type « finition au corps » ou
  « beaucoup de soumissions ». C'est de l'information sur le spectacle. Après un combat, ce
  que le joueur reçoit, c'est **Clara qui appelle, ou Komma qui ne dit rien.**
- ❌ Aucun indicateur chiffré de qualité d'appariement, aucune jauge, aucune étoile.

---

# 7. MISE EN ŒUVRE PROGRESSIVE

Le système est conçu pour six voix. **Il s'active une par une.**

- **Lot 2** — Leïla seule. Elle signale d'elle-même le combat qui la gêne dans sa propre
  proposition : une phrase, dans sa voix, sans chiffre. Cette phrase **disparaît
  définitivement** quand elle a été trop écrasée (mécanique `warnProb` déjà en place).
- **Lot suivant** — Clara. Le corps.
- **Ensuite** — les quatre autres, dans l'ordre qui servira le mieux le jeu.

**Coût d'écriture, à surveiller.** Une remarque n'est pas une réplique unique : c'est une
poignée de tournures qui se combinent avec des noms et des situations. Dix à quinze
formules par personnage couvrent des centaines de cas, parce que c'est le contexte qui
change, pas la phrase.

**Ces formules sont écrites par l'auteur.** Aucun agent ne les rédige. La règle générale
s'applique : un emplacement vide vaut mieux qu'une phrase générique.

---

# RESTE À ÉCRIRE PAR ANTHONY

- [ ] La remarque de Leïla sur un combat qui la gêne — une formule pour le lot 2.
- [ ] Les six répliques du lot 2 : proposer la carte en bloc, réagir à un échange, réagir à
      un écrasement, et les trois réponses du joueur.
