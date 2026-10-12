# Monde lot 1 T5 — l'archive légère

**Date :** 10/10/2026 · **Branche :** `monde-lot-1-passe` · **Autorité :** brief §Lot 1 T5 ; consigne du superviseur (plafonds : combats du passé ≤ 80 Ko, partie du premier jour ≤ 420 Ko sur Split).

## 1. Pourquoi c'est sérieux : le pire cas de `localStorage`

`MGMT_SLOTS = 3` emplacements (`mgmt-save.js:606`), chacun écrit deux fois (clé principale + secours : `saveMgmt` recopie la version précédente), donc 6 écritures par joueur. Limite du navigateur : environ 5 millions de caractères pour toute l'origine (carrière, registre, réglages compris).

- Avant la T5 : 1 018 Ko (T4 bis) × 6 = 6,1 M de caractères : **la troisième partie ne s'écrit plus** (le joueur voit « Réessayer »).
- Après la T5 : 388 Ko × 6 = 2,3 M de caractères, soit 47 % de la limite, avant les parties jouées (une soirée ajoute environ 5 Ko : 9 combats à 523 octets dans `m.hist`, quand elle est jouée sous le joueur ; ce poids-là existait déjà).

## 2. Choix de format

Celui du superviseur, confirmé : **compact à la sauvegarde seulement, redéployé au chargement, un seul endroit en mémoire.**

- *En mémoire* (clôture du passé, `mgmtPasseAlleger`) : `m.hist` garde ses entrées, allégées et marquées `p:true` (côtés sans corps ni niveau, `seed` 0) ; `m.passe.nHist` et `nFacts` disent combien d'entrées de tête sont du passé. Résultats, fiche, affrontements, classements, ceintures lisent toujours `m.hist` et `m.facts`.
- *Sur le disque* (`mgmtSerialiser`, appelé par `saveMgmt`, la restauration du secours et l'export de fichier) : ces entrées de tête sont écrites dans `m.passe.archive = {v,s,g,h,f}` : `s` table de chaînes (identifiants, familles, valeurs de texte), `h` une ligne de 16 nombres par combat (cycle, emplacement, A, âge, V, D, N, B, âge, V, D, N, issue, famille, round, rounds), `g` les signatures de faits (sorte + clés), `f` une ligne par fait (cycle, signature, valeurs ; une chaîne vaut −(rang+1)).
- *Au chargement* (`mgmtParseAndValidate` → `mgmtPasseDeployer`, avant la validation) : les entrées reviennent à l'identique ; `archive` n'existe pas en mémoire. Si quelque chose d'inattendu s'oppose au compactage (clé hors ordre, valeur négative, identifiant absent de l'effectif), la partie s'écrit en clair : plus lourde, jamais fausse. Une archive illisible fait refuser la sauvegarde (secours pris), jamais planter.

Version de sauvegarde : reste à 15 (le format 15 est celui du lot).

## 3. Ce qui est gardé du passé, et pourquoi

- **Combats** : tous (558). Qui, quand (cycle), emplacement, issue, famille de fin, round, rounds (le titre se lit dans les faits `title_fight`, qui pointent l'index dans `m.hist`), âge et bilan des deux côtés avant le combat. Perdus : seed, corps, niveau, rouille (ne servaient qu'à rejouer).
- **Faits** gardés : `moment_vie`, `title_initial`, `title_fight`, `injury`, `susp`, `retired`, `recrue`, `fin_contrat`, `booked`, `demande`, `contrarie` (lus par les rôles à mémoire, les rivalités, la lignée des ceintures, la fiche, les promesses, les camps).
- **Faits écartés à la clôture** : `depart_attente`, `contrat`, `attend` (3 000 de 8 300 faits). Le jeu n'écrit les deux premiers que pour les ré-écrire ; aucun lecteur ne les relit hors du cycle courant, sauf le dédoublonnage de `attend` (au pire, la presse répète une fois une nouvelle d'attente). Ce sont des faits du prédécesseur, pas du joueur : QO-9 ne s'y applique pas.

## 4. Un combat du passé ne se revoit pas

`mgmtReplayFight` rend `null` pour `p:true` ; `mgmtCombatRevoyable(t)` ne propose le geste ni dans la fiche (bouton et ligne), ni dans Résultats (bouton et touche Entrée) ; `mgmtRevoirCombat` et `mgmtHistoriqueRevoir` ne font rien. Les combats joués sous le joueur se revoient comme avant.

## 5. Fichiers touchés

`mgmt-passe.js` (archive), `mgmt-save.js` (validateur : `p` toléré ; écriture et lecture), `mgmt-options.js` (export), `mgmt-corps.js` (rejeu), `mgmt-combat.js`, `mgmt-ecran-fiche.js`, `mgmt-fiche-planche.js`, `mgmt-suivi-cadre.js`, `mgmt-screens.js` (revoir), `index.html`/`sw.js` (versions), `package.json`, `tests/mgmtArchive.test.js`, `tests/mgmtPasseSixAns.test.js`.

## 6. Tests

`tests/mgmtArchive.test.js` (6 s) : « même graine, même archive » ; « chaque combat de l'archive nomme deux combattants retrouvables, retraités compris » ; « pour chaque combattant, … donnent son bilan affiché » ; « sauvegarder puis recharger rend le même état en mémoire » ; « une archive illisible … n'est pas chargée, jamais un plantage » ; « un combat du passé ne se revoit pas : ni bouton mort, ni plantage » ; « les écrans qui lisent le passé continuent de fonctionner ». `tests/mgmtPasseSixAns.test.js` : poids (combats ≤ 80 Ko, partie ≤ 420 Ko) et relecture identique sur les six ans complets. La sauvegarde 14 se charge : test de `mgmtPasse.test.js` (inchangé).

## 7. Chiffres mesurés (Split, graine 20261008, six ans complets)

Partie du premier jour : 388 Ko sur disque (774 Ko en clair en mémoire ; 1 018 Ko avant la T5), plafond 420 Ko. Combats du passé : 28 Ko dans l'archive (558 combats), plafond 80 Ko. Faits du passé : 3 310 gardés, 55 Ko compactés. Le reste du poids est le monde extérieur (160 Ko, 1 861 lignes d'identité) et l'effectif (126 Ko) : ils ne viennent pas du passé mais de la durée de vie du monde (+35 % de lignes extérieures en 62 cycles). Relecture : identique à la mémoire, vérifiée sur les six ans.

**Écart** : `tests/mgmtPasse.test.js` (test T4 « conservés ») compare désormais les combats par leurs champs d'issue et les faits hors sortes perdues, la clôture allégeant l'historique (décision de cette fiche, §3).
