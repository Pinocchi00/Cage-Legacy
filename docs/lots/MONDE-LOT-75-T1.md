# Monde lot 75 T1 — l'Organisation : « Le classement des huit » (UniGuerre) et « La croissance » (UniCroissance) identiques aux planches

Branche : `fid-organisation2` (la branche courante de ce dossier ; commits ICI ; le superviseur fusionne). **Lis d'abord `C:/Users/antho/AppData/Local/Temp/p1/COMMUN-3E-TOUR.md`.** Dossier de travail pour l'outil : `C:/Users/antho/Documents/cage-legacy-p75`.

## Écrans : `guerre` (maquette `UniGuerre`) et `croissance` (maquette `UniCroissance`)
Fichiers : `mgmt-guerre-ecran.js` (`scr_mgmt_guerre`, déjà un `mfEcran`), `mgmt-ecran-organisation.js` (`scr_mgmt_organisation` = l'onglet « LA CROISSANCE », aujourd'hui **enveloppé dans `mgmtWithNav`** : c'est l'ANCIEN écran dans le cadre de compatibilité), `mgmtOrgOnglets`.

### Constat sur main (25/10)
**`croissance` n'a rien de la planche.** Le jeu affiche « L'EFFECTIF, PAR CATÉGORIE » + « LES FINANCES » + une petite liste « LA CROISSANCE ». La planche (`UniCroissance`) :
- en-tête : plaque `ORGANISATION`, libellé « SPLIT · 4e DES HUIT », à droite « Dans 34 jours », la date/lieu, « SPLIT FIGHT NIGHT n » ;
- rangée d'onglets dans le contenu (LE CLASSEMENT DES HUIT / **LA CROISSANCE** (actif, fond blanc) / TON POSTE / TON CARNET) avec « Popularité 43 ▲ +3 » à droite ;
- **un grand panneau de quatre échelles** : LES SALLES (Gymnase 1 500 places · Palais 4 000 · Dôme 9 000 · Aréna 16 000), LE DIFFUSEUR (Régional · National · Européen · Mondial), LE RECRUTEUR (La France · L'Europe · Le monde 1 mission · Le monde 2 missions), LES AGENTS LIBRES (Les oubliés · Les bons · Les très bons · Les meilleurs). Chaque échelle : titre 30 px + ligne d'explication à gauche, puis 4 marches **reliées par un trait** : ✓ dans un rond blanc = franchie, rond jaune = en cours, rond gris = à venir ; nom de la marche en dessous (22-24 px, majuscules) et sa précision (« 9 000 places », « Toute la France »…) ;
- **à droite un panneau « LA PROCHAINE MARCHE »** : nom en 40 px (« L'ARÉNA DE LYON »), un texte, puis les lignes Popularité 43 / 50, Rang huit 4e / 3e, Salles pleines de suite 1 / 3, et une note en bas.
Les données viennent de `mgmtPaliers*`, `m.croissance`, `mgmtOrgMoneyHtml` : **réutilise-les, n'invente aucune règle de jeu.** Les blocs « effectif par catégorie » et « finances » que des tests anciens exigent (cherche `tests/*Organisation*`, `mgmtLot5*`, `mgmtLot67*`, `mgmtLot7*`) **restent dans le HTML mais hors de l'écran visible de la planche** (ex. sous la planche dans une zone qui défile, ou derrière l'onglet existant le plus proche) ; sinon mets le test à jour avec la décision citée, en conservant la vérification de fond.

**`guerre`** : le tableau déborde son panneau (colonne « ÉVOLUTION » coupée, 8e ligne qui touche la barre des touches) et 9 textes sont coupés (« GARDEN OF BLOOD », « FIGHTING PACIFIC CHAMPIONSHIP »…). La planche : **8 lignes de ~74 px sans coupure**, colonnes POPULARITÉ / SALLE / NOTORIÉTÉ / PUISSANCE, rang en grand à gauche (40 px), nom d'organisation 32 px gras + ville/année 22 px dessous, **ligne de Split en surbrillance blanche**, étiquette rouge « TA RIVALE » à côté de l'organisation rivale, flèches ▲ ▼ avec la variation ; **panneau de droite « TA RIVALE DU MOMENT »** : nom en 56 px (« MMA KORNER »), phrase « Née de ce qui s'est passé depuis janvier : », puces rouges, « RUUD VERBEEK, SON MATCHMAKER » + citation en italique, note en bas. Le titre de la colonne d'évolution de l'ancien tableau devient la colonne ▲/▼ de la planche. **Aucun nom d'organisation coupé** : « FIGHTING PACIFIC CHAMPIONSHIP » passe sur deux lignes dans la ligne de 74 px (22-24 px) ou prend une taille réduite (26 px minimum).

**En-tête commun** des 4 onglets : plaque `ORGANISATION`, libellé « SPLIT · 4e DES HUIT », droite = date + lieu + « SPLIT FIGHT NIGHT n », comme les planches ; onglets dans le contenu, pas dans la barre latérale. Le carnet (déjà fait, ne le touche pas) a déjà ce modèle : copie son approche.

Écrans à contrôler : `guerre,guerreLong,croissance,croissanceLong`.

## Compte rendu

- Modifié dans les commits précédents : `mgmt-guerre-ecran.js`, `ui-cadre.css`, `index.html` (ajustement des noms, libellé de l'en-tête et colonne ▲/▼). Dans ce commit : `mgmt-screens.js` (retire `mgmt_organisation` de l'enveloppe `mgmtWithNav`, comme demandé pour éviter le double cadre) et `index.html` (version montée).
- Tests ajoutés : aucun. Test ciblé exécuté : `node --test tests/mgmtOrganisations.test.js` (9/9 verts). Audit : `node tools/verif-versions.js origin/main` sans écart.
- Migration de sauvegarde : aucune.
- Écarts à la fiche / travail restant : tranche encore incomplète. Le retrait de l'enveloppe est fait, mais `scr_mgmt_organisation` n'a pas encore été porté dans `mfEcran` ni redessiné selon UniCroissance ; les blocs effectif/finances ne sont pas encore réorganisés. Le tableau de guerre et le panneau rival ne reprennent pas encore l'intégralité d'UniGuerre. Les quatre scènes `guerre,guerreLong,croissance,croissanceLong` n'ont pas été capturées ; aucune ligne CONTRÔLE disponible. Décision de fidélité : appliquer la maquette validée plutôt que conserver le double cadre historique. Les fichiers de configuration de l'environnement et `sw.js` déjà modifiés dans le répertoire de travail sont étrangers à cette tranche et laissés hors commit.
- Questions pour Anthony : aucune.
