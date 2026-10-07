# Brief du 06/10/2026 — Lot 10 : le suivi du monde

Code : `mgmt-suivi.js` (lecture du monde, fil de nouvelles, aucun DOM), `mgmt-suivi-cadre.js` (les cinq écrans), CSS `.mf-su-*` dans `ui-cadre.css`.
Tests : `tests/mgmtSuivi.test.js` (17), aide `tests/helpers/jouerSoirees.js`. Les classements nouveaux ne remplacent l'ancien écran que dans une partie à l'agenda actif (lot 7) ; les quatre autres écrans sont neufs.

## Livré
- **Classements** (planche « Classements — Hommes, poids léger ») : hommes ou femmes (G), catégorie (Tab), le champion en tête (« C » jaune), les rangs 1 et 2 en cartes, puis le tableau des rangs suivants (rang,
  évolution, combattant, palmarès, série en cours, dernier combat avec marque V/D/N). Les places gagnées (▲ blanc) ou perdues (▼ rouge) sont la **différence entre le classement d'aujourd'hui et celui du cycle
  précédent**, tous deux calculés sur les résultats (`mgmtDivisionRanking`), jamais sur le niveau stocké. M bascule vers le classement mondial. Entrée ouvre la fiche.
- **Ceintures** : le mur (une ceinture par catégorie : champion, défenses, depuis combien de temps, prétendant) puis, avec Entrée, **la ceinture** : le champion, **la lignée** du champion actuel au tout premier
  (soirée où chacun l'a prise ou « depuis le début », ses défenses), son règne, sa dernière défense, le prétendant n° 1 (« sur la carte, contre … »). La lignée est relue dans les faits (`title_initial`,
  `title_fight`, `retired`) : **tous les champions, dans l'ordre, sans trou** (testé sur 40 soirées : chaque combat de titre décisif est soit une défense, soit un changement de champion). Le prétendant est
  le mieux classé de la catégorie qui n'est pas champion.
- **Camps** : le défilé des salles où des combattants de Split s'entraînent ensemble (deux au moins, ou un champion) — la salle choisie au centre, une de chaque côté, le tour complet ; ville, coach, **ce qu'on y
  travaille**, ses combattants chez le joueur (rang, catégorie), et « Ils refusent de s'affronter entre eux ». Entrée ouvre la fiche d'un combattant de la salle.
- **Presse** : le fil de nouvelles daté — défis, presse, public, combattants (filtre : Tab) — la nouvelle choisie en grand, la ligne de média qui la commente à côté, les trois suivantes dessous. **Une nouvelle de défi
  ouvre la carte sur le combat qu'elle réclame** (le défieur est choisi, l'adversaire visé, il ne reste qu'à confirmer). Une nouvelle de résultat ouvre le résultat.
- **Résultats** : chaque soirée jouée (SOIRÉE n), combat par combat — le combat principal en grand, le co-principal, les suivants — avec la méthode (rejouée depuis la trace, montrée seulement si le verdict rejoué est
  fidèle), le round, le geste de finition du moteur, « Il garde sa ceinture », et **Revoir ce combat** (retour sur l'écran des résultats). Un combat de la première soirée se revoit à l'identique après 40 soirées (testé).
- **La fiche d'offre des contrats** (lot 9) reçoit enfin ses deux textes : la parole du combattant et « Cage Hebdo en dit » (la ligne de média la plus récente sur lui).

## Le fil de nouvelles (`m.fil`)
Liste facultative de `{k, c, j?, a, b?, f?, w?, t?, x?, p?, n?}` : type (`defi|presse|public|combattant`), cycle, jour de l'agenda, combattants, **index du combat dans `m.hist`**, sous-type, texte, média.
Elle se met à jour à l'ouverture d'un cycle (défis, combattants qui attendent, public) et à la fin d'une soirée (résultat du principal, ceintures, lignes des médias), **sans doublon** (clé de déduplication : rejouer
la mise à jour n'ajoute rien). 200 nouvelles au plus. Les lignes de média commentent la nouvelle du même combat (`mgmtFilVoisine`) au lieu d'être des nouvelles. Validée par `validateMgmt` (`mgmtFilValide`),
réparée par `mgmtRepair` (un fil mal formé est supprimé). **Pas de changement de `MGMT_SAVE_VERSION`.**

## Décisions et valeurs à relire (`relu:false`)
- **Une salle par ville** : `mgmtCampSalleDeVille` tire le modèle de nom de la ville et non du combattant. Avant, 135 combattants s'entraînaient dans 118 salles ; maintenant les combattants d'une même ville
  partagent une salle (et le « coéquipier » de H7 prend son sens). Les anciennes sauvegardes changent de nom de salle ; la qualité du camp suit la salle.
- **Spécialités** (`MGMT_CAMP_SPECIALITES`) : le contre à distance (boxe, karaté, kickboxing), le clinch et les coudes (muay-thaï, kickboxing), la lutte et le contrôle (lutte, sambo), le travail au sol (jiu-jitsu,
  sambo), le cardio et les longs combats (tous). **Elles pèsent sur la progression du lot 2** : le gain de niveau après un combat et à l'anniversaire est majoré de 15 % pour le style qui convient (7,5 % pour le
  cardio), **agenda actif seulement** (`mgmtCampSpecBonus`). Les traces de combat gardent le niveau d'avant : le rejeu n'est pas touché.
- **Refus entre coéquipiers** : l'écran Camps l'annonce ; l'effet est celui de H7 (décision contraire de 15 pour chacun des deux, `why:'coequipier'`) — le joueur peut toujours les opposer, il en paie le prix.
- Les titres de presse (« X défie Y », « X garde sa ceinture », « Le public réclame ce combat », « X attend depuis N mois »…) sont des **modèles `relu:false`** (`MGMT_FIL_MODELES`) ; la parole du défi est une
  réplique d'annonce de la voix du combattant (texte des voix, `relu:false`) ; les lignes de média sont celles de `mgmt-medias-data.js`.

## Pas fait
- Les nouvelles « combattant » ne couvrent que l'attente (lot 9) et les demandes sans cible ; les moments de vie relayés ne sont pas encore au fil.
- Les ceintures extérieures (autres organisations) ne se lisent qu'au classement mondial (blocs du lot 5) ; le mur est celui de Split.
- Le lieu de la soirée (« salle plus ou moins pleine ») et la caméra restent au lot 11.
