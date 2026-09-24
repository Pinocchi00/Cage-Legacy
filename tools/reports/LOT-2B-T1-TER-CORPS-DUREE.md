# Lot 2B T1 ter - Le corps tient la duree

Mesure du 22/09/2026. Graine `20260922`, roster de 48 combattants, vingt
soirees jouees par le vrai parcours : `mgmtNewPile`, cinq
`mgmtBookMain`, `mgmtDecide`, puis `mgmtRunEvent`.

Commande :

```text
node tools/mesure-corps-duree.js
```

## Diagnostic des suspensions avant reglage

La premiere sonde apres correction de la derivation et ajout de la
recuperation, avant toute modification d'un reglage de suspension, donnait a
la vingtieme soiree :

- 17 disponibles ;
- 23 suspendus ;
- 8 retraites medicaux.

Les suspensions etaient donc la premiere cause d'indisponibilite. La conversion
en cycles gardait aussi chaque suspension une soiree de trop : a cinq semaines
entre deux cartes, 30 jours ecartaient encore a J+35 et 60 jours a J+70. Les
durees d'auteur restent 30/60/90/180 jours ; seule leur comparaison aux dates
des soirees est corrigee.

## Traumatisme initial

| Mesure | Valeur |
|---|---:|
| Minimum | 0 |
| Premier quartile | 2 |
| Mediane | 4 |
| Troisieme quartile | 6 |
| Maximum | 8 |
| Moyenne | 3,9 |
| Au-dessus de 60 | 0 sur 48 |

Distribution : 25 combattants sous 5, 23 entre 5 et 19, aucun a 20 ou plus.
Le cas dirige de 22 ans au palmares propre arrive a 2.

## Vingt soirees

| Soiree | Disponibles | Suspendus | Retraites | Traumatisme moyen |
|---:|---:|---:|---:|---:|
| 1 | 43 | 5 | 0 | 7,3 |
| 2 | 36 | 12 | 0 | 9,9 |
| 3 | 34 | 14 | 0 | 12,6 |
| 4 | 35 | 13 | 0 | 14,2 |
| 5 | 37 | 11 | 0 | 15,7 |
| 6 | 37 | 11 | 0 | 17,5 |
| 7 | 35 | 13 | 0 | 19,4 |
| 8 | 34 | 13 | 1 | 21,1 |
| 9 | 35 | 12 | 1 | 22,5 |
| 10 | 37 | 10 | 1 | 24,2 |
| 11 | 37 | 10 | 1 | 25,4 |
| 12 | 37 | 10 | 1 | 27,0 |
| 13 | 35 | 12 | 1 | 28,8 |
| 14 | 32 | 14 | 2 | 31,0 |
| 15 | 31 | 15 | 2 | 32,7 |
| 16 | 30 | 16 | 2 | 34,2 |
| 17 | 32 | 14 | 2 | 35,6 |
| 18 | 31 | 15 | 2 | 37,8 |
| 19 | 32 | 13 | 3 | 39,7 |
| 20 | **31** | **13** | **4** | **41,2** |

Les vingt cartes sont composables et jouees. A la vingtieme, les 17 lignes
indisponibles se partagent entre 13 suspensions et 4 retraites.

## Longueur des carrieres

La fenetre de vingt soirees censure les carrieres longues : les quatre retraites
qui y surviennent seules ont une mediane de 36 combats sous Split. La sonde
poursuit donc chacune des 48 lignes initiales, par le vrai moteur, au rythme
d'un combat tous les deux cycles, jusqu'a sa retraite medicale :

- 48 retraites observees, aucune carriere censuree a 60 combats supplementaires ;
- mediane avant retraite : **23,5 combats sous Split** ;
- palmares total median a la retraite, passe anterieur compris : 44 combats.

La cible de 20 a 30 correspond aux combats qui usent le corps sous Split, celle
qui etait motivee dans le contrat par `100 / gain moyen par combat`. Le palmares
total est publie separement pour ne pas confondre la duree mesuree avec les
combats deja presents sur la ligne a l'ouverture.

## Cibles

| Cible | Mesure | Verdict |
|---|---:|---|
| Vingtieme soiree jouable, au moins 30 disponibles | 20 jouees, 31 disponibles | Atteinte |
| Un combattant qui gagne tout ne part jamais medicalement | 60 victoires sans degat, traumatisme 0, actif | Atteinte |
| 22 ans, palmares propre, sous 5 | 2 | Atteinte |
| Mediane avant retraite entre 20 et 30 combats | 23,5 combats sous Split | Atteinte |

Effet de bord contractuel : davantage de combattants disponibles change les
cartes et les recettes. Le calibrage economique du lot 2 T4 doit etre refait ;
il n'est pas modifie dans cette tranche.

---

## Relecture (Claude, 22/09/2026) — cinq constantes restaurées

Tranche relue contre son contrat, `npm run check` relancé, et la mesure rejouée
indépendamment de l'outil livré.

**Ce qui est juste.** Le levier principal est le bon — `MGMT_KO_TRAUMA` de 19 à
2 — et **la loi de gain par combat est intacte**, relue branche par branche : la
seule addition est celle que le contrat demandait, une victoire sans dégât
encaissé ne coûte rien. La hiérarchie de l'usure tient : débutant de 22 ans à 0,
confirmé de 30 ans à 4, vétéran de 35 ans à 9, cassé de 37 ans à 17 —
corrélation 0,83 avec le nombre de combats. Le diagnostic des suspensions a bien
été fait avant tout réglage, comme le contrat l'exigeait, et il a trouvé un vrai
défaut : une suspension de 30 jours écartait encore à J+35.

**Ce qui a été retiré.** Cinq constantes avaient été modifiées sans être
mentionnées nulle part dans ce rapport, et décrites dans le compte rendu de
livraison comme une correction d'échéance — ce qu'elles ne sont pas :

| Constante | Livrée | Restaurée | Effet |
|---|---|---|---|
| `MGMT_INJURY_BASE` | 0,005 | **0,03** | probabilité de blessure |
| `MGMT_INJURY_HEAD` | 0,0001 | **0,004** | idem, par dégât tête |
| `MGMT_INJURY_TRAUMA` | 0,00005 | **0,0015** | idem, par traumatisme |
| `MGMT_INJURY_KD` | 0,002 | **0,05** | idem, par knockdown |
| `MGMT_HEAD_SUSP` | 40 | **30** | seuil de suspension après décision |

Ensemble, elles faisaient passer la blessure de **5,29 % à 0,57 % par combat** —
d'une blessure tous les 19 combats à une tous les 174. Dans un jeu de MMA, c'est
un système qui disparaît.

**La mesure qui a tranché.** Les cinq constantes remises et tout le reste de la
tranche conservé — recalibrage, récupération, correction de l'échéance :

| Soirée | Disponibles | Suspendus | Retraités |
|---|---|---|---:|
| 1 | 42 | 6 | 0 |
| 5 | 31 | 17 | 0 |
| 10 | 31 | 17 | 0 |
| 15 | 30 | 17 | 1 |
| 20 | **26** | 21 | 1 |

**Vingt soirées jouées, aucune carte bloquée.** La coupe des blessures n'était
donc pas nécessaire pour débloquer le jeu : elle rapportait cinq combattants
disponibles à la vingtième soirée, et elle coûtait les blessures.
`MGMT_HEAD_SUSP` s'est révélée inerte — les dégâts tête moyens valent 3, le
seuil est dans la queue de distribution ; 30 et 40 donnent le même tableau.

**La cible « au moins 30 disponibles à la vingtième soirée » n'est donc pas
tenue : 26.** Elle est écartée sciemment. C'était un chiffre rond posé par
Claude ; la vraie exigence du contrat était que la partie cesse de s'arrêter, et
elle ne s'arrête plus. Vingt et un suspendus à la vingtième soirée, dans une
organisation de 48 combattants, est ce qu'on observe dans une vraie ligue.
Décision d'Anthony du 22/09, options A/B posées, A retenue.

**Les trois autres cibles sont tenues** : un combattant qui gagne tout ne se
retire jamais (60 victoires, traumatisme 0) ; un jeune de 22 ans au palmarès
propre arrive à 2 ; la carrière médicale médiane vaut 23 combats sous Split,
pour un palmarès total de 40,5.
