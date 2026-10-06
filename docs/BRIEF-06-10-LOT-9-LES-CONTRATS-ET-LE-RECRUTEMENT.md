# Brief du 06/10/2026 — Lot 9 : les contrats et le recrutement

Code : `mgmt-contrats.js` (règles, aucun DOM), `mgmt-contrats-ecran.js` (écran Contrats et Recrutement), l'onglet Contrat dans `mgmt-fiche-cadre.js`.
Tests : `tests/mgmtContrats.test.js` (14). Vaut pour une partie à l'agenda actif (lot 7) ; l'ancien rythme garde ses bourses calculées et l'ancien écran de recrutement.

## Livré
- **Un engagement par combattant** : `ligne.ct={n,f,b,since}` — combats signés, faits, bourse par combat (k$), cycle de signature. Donné à chaque combattant au passage à l'agenda
  (2 à 5 combats, bourse = son renom). **La bourse du soir est celle du contrat** (`mgmtPurse`), la même pour tous les emplacements.
- **L'offre et la réponse** (`mgmtContratReponse`, pur) : 1 à 8 combats, une bourse par combat ; il **refuse** si la bourse est trop basse, si la caisse ne paie pas la prime, ou s'il vise plus haut
  que l'organisation (renom × 100 > popularité + 25). **Prime à la signature** = 10 % du contrat, débitée de la caisse, qu'il combatte ou non. Le geste gratuit d'avant est refusé (`mgmtRecruter` sans offre).
- **Renouvellement** : les combats s'ajoutent aux restants, la bourse change, la prime est débitée ; après une longue attente (palier 3) il demande 10 % de plus.
- **Fin de contrat** : chaque combat joué retire un combat restant ; à zéro sans renouvellement il devient « sans contrat » (`ligne.libre`) : il ne se book plus, il figure au recrutement.
- **Le marché** : les sans-contrat de la partie, les débutants (23 ans ou moins, 3 combats pros ou moins) et une fin de contrat à tour de rôle (un extérieur sur six chaque cycle) chez les autres
  organisations. **Un combattant sous contrat ailleurs n'est pas recrutable.**
- **Paliers d'attente**, dans l'ordre : 3 soirées (« Attend un combat »), 5 (« Attend depuis longtemps » — la presse le relaiera au lot 10), 7 (« Revient rouillé » : la rouille du lot 2 démarre à 2,5 points puis un demi-point par
  soirée, bornée à 5, et s'efface au combat suivant ; il demande plus au renouvellement), 10 (« Refuse tout combat » : indisponible). Un combat joué ramène au début. Les paliers 1 et 2 sont gardés comme faits (`attend`).
- **Écran Contrats** (planches « Contrats » et « Le recrutement », R bascule) : sexe (G), catégorie (Tab), liste avec rang, pastilles de contrat, combats restants, situation ; à droite la fiche d'offre — nombre de combats (← →),
  bourse (+ −), « Il demande », « Tu proposes », prime, « Proposer ce contrat » (Entrée). Au recrutement : âge, palmarès, d'où il vient, « Tu l'as vu ».
- **Onglet Contrat de la fiche** : les combats un par un (fait, le prochain, à venir), la bourse fixée à la signature, ce qui se passe ensuite.
- Aucune bourse sur l'écran de la carte (testé).

## Rouille et rejeu
Les traces de combat portent `rg` (cycle de signature) pour que le rejeu retrouve la même rouille ; `validateMgmt` l'accepte (facultatif).

## Format de sauvegarde
Champs **optionnels** `ct` et `libre` sur les lignes, `rg` sur les traces ; validés (`mgmtContratLigneValide`) ; pas de changement de `MGMT_SAVE_VERSION`.

## Pas fait / décisions
- **« Ce que la presse en dit »** et **la parole du combattant** dans l'offre : d'auteur, lot 10 (la fiche d'offre n'affiche rien à leur place).
- **« Il le dit » / « la presse le relaie »** : des étiquettes fonctionnelles et deux faits, pas de texte de personnage.
- **Les fins de contrat des huit organisations** sont modélisées par la rotation du marché, pas par un calendrier de contrats par organisation.
- **Fins de contrat dans Finances** : la carte reste « — » (le suivi des contrats par date n'existe pas : un contrat se compte en combats).
- Valeurs (prime, marge de refus, paliers) : propositions `relu:false`. Aucun plafond d'effectif, aucune date limite, aucun débauchage en cours de contrat.
