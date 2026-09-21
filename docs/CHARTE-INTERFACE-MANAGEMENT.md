# CAGE LEGACY — Charte d'interface du mode management

**Date :** 15/09/2026
**Autorité :** décision d'Anthony du 15/09/2026 — *« l'interface et l'UI sont les plus
importants : humanité, réalisme, mais avec une interface simple et compréhensible »*.
Rassemble et rend vérifiables les règles déjà posées par le CDC (§6, §7), l'addendum 1
(§20, §24, §25), l'addendum 2 (§5, §6) et le LOT-3B (« Principe »).
**S'applique à :** tout écran du mode management, dès le lot 3B T2. Pas au mode carrière.

---

## 1. Les trois mots

| Mot | Ce que ça veut dire à l'écran |
|---|---|
| **Humanité** | L'information arrive par des gens. Un personnage dit ce qui le gêne ; le jeu ne donne jamais son avis. |
| **Réalisme** | Le joueur voit ce qu'un vrai matchmaker verrait : noms, bilans, âges, catégories, classement, dates, argent. Il ne voit pas ce qu'aucun humain ne peut connaître : notes, probabilités, état caché d'un corps. |
| **Simple et compréhensible** | À l'ouverture d'un écran, on sait en trois secondes ce qui se passe et ce qu'on peut faire. Le reste se creuse, sans être imposé. |

---

## 2. Règles

### Humanité
- **H1.** Aucune note, jauge, étoile, barème ou indicateur de qualité d'un combat ou d'une
  carte, ni avant ni après (addendum 2 §6).
- **H2.** Une relation (patron, diffuseur, vestiaire, agents) ne s'affiche jamais en chiffre
  ni en jauge. Elle s'exprime par une phrase dans la voix d'un personnage (addendum 1 §1).
- **H3.** Aucun impact chiffré à côté d'une réponse (« +5 moral ») (CDC §6).
- **H4.** Toute parole de personnage vient d'un texte d'auteur. Un libellé d'interface n'imite
  jamais une voix. Texte manquant : `[EMPLACEMENT AUTEUR]`, signalé.
- **H5.** Silence : l'interface n'explique pas une mécanique cachée (pas d'infobulle
  « traumatisme élevé », pas de cause de retrait). Ce qui n'est pas dit est un choix.

### Réalisme
- **R1.** Données factuelles autorisées : nom, bilan, âge, catégorie de poids, rang dans la
  catégorie, organisation, date du dernier combat, suspension en cours, argent de
  l'organisation.
- **R2.** Vocabulaire de métier, en français, cohérent avec les répliques d'auteur : Leïla
  parle de « carte principale » et de « carte préliminaire » ; l'interface dit la même chose.
- **R3.** L'argent est la pression visible et permanente (CDC §7) : la trésorerie est lisible
  sans chercher, sans détail comptable imposé.
- **R4.** Une réponse qui n'existe pas n'est pas affichée en grisé : elle n'est simplement pas
  là (addendum 1 §20).

### Simplicité
- **S1.** Deux vitesses (addendum 2 §5) : niveau 1 immédiat (les combats et la phrase du
  personnage), niveau 2 au déroulé (les détails). Le joueur pressé n'est jamais puni.
- **S2.** **Jamais deux combats déroulés en même temps.** Ouvrir un combat referme le
  précédent (addendum 2 §5).
- **S3.** Une décision principale par moment. Deux à quatre réponses au plus (CDC §6).
- **S4.** L'état de la carte se lit d'un regard : combien de places restent en carte
  principale et en préliminaires.
- **S5.** Toute action se fait à la souris ; le clavier accélère, il n'est jamais exclusif
  (addendum 1 §25). Une action courante demande au plus deux clics.
- **S6.** Chaque action produit un retour visible immédiat (la ligne change, le compteur
  bouge). Pas de fenêtre de confirmation, sauf pour une décision irréversible qui engage
  l'argent ou une carrière.
- **S7.** Pas de jargon interne du code à l'écran (niveaux « nom / dossier / attaché »,
  identifiants, noms de constantes).

### Lisibilité mesurable (PC)
- **L1.** Mise en page prévue pour 1440px, lisible dès 1280, extensible à 1920, trois
  colonnes, sans défilement horizontal (addendum 1 §24).
- **L2.** Toute information utile à une décision (bilan, catégorie, âge, rang, argent) :
  **au moins 13px** à 1440px et **contraste d'au moins 4,5:1** avec son fond (norme WCAG AA).
- **L3.** Libellés décoratifs (titres de colonne) : au moins 11px, contraste d'au moins 3:1.
- **L4.** Noms longs (prénom + nom composés) : jamais tronqués au point de devenir
  ambigus, jamais de chevauchement.

---

## 3. Vérification, à chaque tranche qui touche un écran

1. **Nouvel écran ou geste nouveau → maquette d'abord.** Claude produit une maquette
   statique ; Anthony la valide ou la corrige ; ensuite seulement GLM code. Concerne au
   lot 3B : la composition de la carte principale (T2), les trois sorties (T6), l'argent
   au lendemain.
2. **GLM** respecte cette charte et cite la règle quand un choix d'interface en dépend.
3. **Claude**, sur le jeu réellement lancé :
   - captures à 1280, 1440 et 1920px ;
   - mesure automatique des tailles de texte et contrastes (L2, L3) ;
   - parcours complet à la souris, puis au clavier ;
   - console sans erreur ;
   - relecture contre H1 à S7, avec la règle citée pour chaque écart.
4. **Anthony** joue le parcours préparé. Sa question est la seule qui tranche :
   *« est-ce que c'est simple, compréhensible, et est-ce que j'ai eu l'impression de parler
   à des gens ? »* Non automatisable, et décisive.

---

## 4. État relevé le 15/09/2026 (bureau, 1440px, branche `lot-3b`)

Constaté en lançant le jeu (mesures par script dans la page) :

- **Contraste insuffisant sur les informations de décision** : catégorie, âge et bilan des
  combats à 11,5–12px, contraste 4,08:1 (L2 demande 13px et 4,5:1). « Adjointe matchmaker »
  à 11px, contraste 3,27:1.
- **Jargon interne visible** : la fiche d'un combattant affiche « NOM », c'est-à-dire le
  niveau 1 de la règle du bureau (S7).
- **Temps abstrait** : l'en-tête dit « Cycle 1 ». Un matchmaker pense en dates et en
  semaines avant la soirée (R2) — à décider par Anthony.
- **Pas d'argent visible** : attendu, la trésorerie arrive avec le lot 3B (R3).
- **Colonne Dossier en grande partie vide** sous deux fiches et un titre « Mémoire » sans
  contenu : à revoir avec la maquette de T2.

Ce qui fonctionne déjà et doit être conservé : trois colonnes lisibles, la phrase de Leïla
en tête de proposition (S1), les réponses écrites comme des choses qu'on dirait (CDC §6),
un seul échange ouvert.
