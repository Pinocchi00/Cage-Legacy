# Brief du 06/10/2026 — Lot 11 : la soirée et le combat

Code : `mgmt-soiree-show.js` (programme, salle, avant-combat — logique sans DOM), `mgmt-soiree-cadre.js` (les écrans de la soirée), `mgmt-combat.js` (l'écran du combat animé),
`arene-coups.js` (les échanges, le commentaire et les coins), `arene-salle.js` (le dessin : cage, salle, caméras, voix, décision), `mgmt-combat-data.js` (les mots du combat),
`arene-etat.js` (échelle de temps, `areneConstruire(res,noms,{echelle,pause})`). CSS `.mf-so-*` et `.mf-cb-*` dans `ui-cadre.css`.
Tests : `tests/mgmtSoireeShow.test.js`. Tout ceci ne vaut qu'avec l'agenda actif (lot 7) ; une partie d'avant garde l'ancien écran de soirée et l'arène d'origine (`arene_socle`).

## Livré
- **La soirée en cinq moments** (planches « Soirée 1 » à « Soirée 5 ») : l'**ouverture** (la carte entière — « La carte de Leïla », « Ta carte », Entrée pour commencer), l'**entre-deux** (le combat qui vient en grand : bannière, classement,
  palmarès, allonge, style, trois derniers combats, enjeux ; à gauche le résultat du précédent ; à droite la suite ; les neuf pastilles en bas), l'**attente du combat principal** (même écran), l'**avant-combat** (F) et la **fin**
  (résultat du principal, état de la soirée, la suivante, sections rouvertes). La barre des sections est grisée de l'ouverture au dernier combat et se rouvre à la fin. Entre deux combats : regarder (Entrée), passer (P), avant-combat (F),
  voir un autre combat de la carte (← →, les combats déjà joués restent derrière).
- **L'ordre de passage** est celui du lot 7 : les préliminaires, puis COMBAT 5, 4, 3, le CO-PRINCIPAL, le COMBAT PRINCIPAL. Il est lu sur la soirée calculée (`m.lastEvent` + `m.hist`), jamais recalculé.
- **L'avant-combat** : pour chaque combattant, ce que le joueur a **vu** (son profil — « CONTRE À DISTANCE », « AVANCE SANS ARRÊT »… — et trois lignes tirées du **rejeu** de ses combats passés), ce qu'il **ne sait pas** (« Au sol : jamais vu »,
  « Sur cinq rounds : jamais vu »), son dernier combat, trois chiffres publics ; puis « Comment ça peut se passer » zone par zone (au centre, contre la cage, au sol) : **une zone jamais observée est dite inconnue**.
  Il ne lit **que** : les combats passés dans `m.hist` (rejoués), le bilan d'avant combat porté par la trace, le classement d'**avant la soirée** (`mgmtDivisionRanking` au cycle de la soirée, ceinture lue sur les faits antérieurs au combat),
  l'allonge publique. Ni le niveau stocké, ni les attributs, ni ce qui s'est passé ce soir : testé en renversant le niveau, le bilan du jour et le résultat de ce combat et des suivants — l'avant-combat ne bouge pas.
  Il ne dit jamais qui gagne : seulement où chacun est à l'aise d'après ce qui a été vu.
- **Le combat animé** (planches « Le combat animé », « Règles 3 », plans fixes, salles) : des pions à plat sur la cage de la planche, une **caméra sur câble** qui suit l'action (plus large au début, serrée contre le grillage au clinch, plus
  basse au sol) et **quatre plans fixes** (plafond, large, un par coin), choisis avec C ou la barre du bas. **Aucune jauge, aucune barre de moments clés, aucun indicateur de domination.** Une étiquette nomme le coup à côté de celui qui frappe.
  L'horloge du round, les rounds, les records, la caméra courante sont dans l'en-tête, comme sur la planche.
- **Les touches** : Espace pause, V vitesse (x1, x2, x4), C caméra, P passer, R revoir après la décision, Entrée revenir à la soirée ; chacune a son bouton. Échap pendant un combat le passe.
- **La salle** : les gradins autour de la cage, **remplis selon le calcul du lot 8** (`finance.taux` = spectateurs / capacité de la soirée), un bon tiers du pic au premier combat, le pic au combat principal ; le haut est **bâché** quand même
  le pic ne le remplit pas. Le commentaire du début dit la salle (vide, aux deux tiers, pleine).
- **La décision** : après la dernière cloche, les trois juges notent (« 10 – ? » sur leur table), puis les trois cartes (score et nom) et le vainqueur ; pour une finition, le vainqueur, la méthode et le round.
- **A et E** passent à la section d'avant ou d'après quand la barre est ouverte (la rangée de touches l'annonçait depuis le lot 4, sans que rien ne la tienne).

## Le temps et ce que regarder ne change pas
Un round de 300 s de combat tient en ~43 s d'affichage à x1 (`MGMT_COMBAT_ECHELLE=7`, comme la planche) : x2 et x4 divisent d'autant. `arene-etat.js` reçoit une **échelle** (`areneConstruire(res,noms,{echelle,pause})`) ; sans elle,
tout est comme avant (l'arène d'origine, utilisée par la carrière et par les parties sans agenda, n'a pas bougé). Les échanges, le commentaire et les coins sont tirés **une fois**, avec une graine qui ne dépend que du combat : regarder, passer,
changer de caméra ou revoir donnent le même combat, la même trace, et ne touchent ni `G.mgmt` ni la RNG (testé).
Le moteur donne ~6 moments par round et un total de frappes par type (`byType`) : l'arène répartit ces totaux sur le temps debout, au clinch et au sol (un échange toutes les ~1,9 s en moyenne), avec la part touchée de chaque combattant ;
le **nom du coup** est la clé de `byType` (jab, direct, crochet, low kick…), libellée pour la planche.

## Décisions et valeurs à relire (`relu:false`)
- **Tous les textes** de `mgmt-combat-data.js` (noms de coups, commentaire, cris des coins), `MGMT_SOIREE_TEXTES`, `MGMT_AVANT_TEXTES` et `MGMT_SOIREE_ECRAN` sont des textes d'auteur écrits par l'agent : à relire par Anthony. Ce que dit Leïla à
  l'ouverture (« Mes quatre préliminaires sont prêts. X passe en deuxième : il attend depuis 7 mois. ») en fait partie.
- **« Un combat passé avec P compte-t-il comme vu ? »** (question ouverte du lot 6) : **oui**. Son résultat est connu et la connaissance se lit sur `m.hist` ; passer un combat ne retire rien.
- **Un seul rejeu de contrôle** : si l'issue rejouée ne correspond plus à l'issue enregistrée, le combat n'est pas montré (`[EMPLACEMENT AUTEUR]`, comme l'arène d'origine).
- **Les réglages** (vitesse et caméra de départ, commentaire, coins, nom des coups, secousses) existent avec leurs valeurs d'origine (`MGMT_COMBAT_REGLAGES`) et sont lus par le dessin ; leur écran et leur sauvegarde sont au lot 12.
- **Revoir** (Résultats, Lendemain, Fiche) ouvre le même écran animé avec l'agenda ; la salle d'un combat passé est celle de sa soirée (`comptes` ou `lastEvent`), à sa place dans la soirée.
- **La fin** mène aux Résultats ; s'il y a des touchés, le Lendemain passe d'abord (séquence imposée du lot 3a, inchangée).

## Pas fait
- Le **son** (musique de la salle, public, impacts, interface) est au lot 12 ; le dessin est prêt à le suivre (le niveau de bruit de la salle existe : `room.noise`).
- Le **mode carrière** et le **Duel** gardent l'arène d'origine (hors périmètre) ; elle porte encore sa liste de moments clés.
- Pas de **ralenti** sur les coups décisifs (la planche en a un) : le temps du combat reste un.
