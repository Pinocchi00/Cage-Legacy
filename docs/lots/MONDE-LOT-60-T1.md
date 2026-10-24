# Monde lot 60 T1 (P5 T4) — signer ou suivre : ce que devient un profil rapporté par le recruteur

Branche : `p5-signer-suivre` (la branche courante de ce dossier ; commits ICI ; le superviseur fusionne). Brief : `docs/BRIEF-22-10-DES-COMBATTANTS-UNIQUES.md`, lot P5 T4 (lis P3 « Le bouton Suivre » et P5 en entier). Maquette **aux valeurs exactes** : `docs/planches-uniques/UniRecruteurRetour.dc.html` (le retour du recruteur : le bloc d'action de chaque profil).

**Ce qui existe dans `main`** : l'écran du recruteur et ses retours (`mgmt-recruteur*.js`, `mgmt-ecran-recruteur*.js`, `m.recruteur.retours`, P5 T1-T3, fusionné par la PR 230), le bouton Suivre (P3 : `m.suivis`, `mgmtSuivre`…, lis `mgmt-suivi*.js`), l'écran Contrats / la signature d'un combattant libre (`mgmt-recrutement.js`, `mgmt-contrats*.js`), les organisations qui agissent et la rivalité (P10 T1-T2, `mgmt-orgs-agissent.js`, `mgmt-rivalite-orgs.js`).

## Cases
**[ ] 1. Signer.** Sur chaque profil d'un retour du recruteur : un bouton **« Signer »** qui ouvre **l'écran Contrats existant** pour ce combattant (la même fonction que le recrutement normal ; **aucun second chemin de signature**) ; si la caisse ne suffit pas, le bouton le dit en mots (pas de jauge) ; un profil signé n'est plus proposé comme libre.
**[ ] 2. Suivre.** Un bouton **« Suivre »** qui l'ajoute aux suivis par la fonction du bouton Suivre existant ; un profil déjà suivi affiche « Suivi » (pas de doublon).
**[ ] 3. Le profil non signé.** Un profil rapporté mais ni signé ni suivi peut être **approché par une organisation rivale** : avec le calcul de rivalité existant (P10 T2), une organisation (la rivale du moment en priorité, sinon une organisation à proximité du classement qui a un manque dans cette catégorie) le signe **au plus 14 jours** après le retour, avec une probabilité modérée (constante nommée, 35 % pour la rivale du moment, 15 % sinon) calculée de façon **déterministe** (`mgmtIdentiteStream`, jamais `rnd()`). Le profil signé ailleurs disparaît de l'écran Contrats et le fil de presse le dit (une ligne `relu:false`, spécifique, trois formulations). Un profil **suivi** n'est jamais approché avant 28 jours (le joueur a du temps pour lui).
**[ ] 4. Tests** (`tests/mgmtLot60T1.test.js`, dans `test` ET `test:watch`) : par le chemin réel (`mgmtPasseGenerer('split',{soirees:3})` puis une mission du recruteur terminée) : signer via l'écran Contrats ; suivre sans doublon ; l'approche d'une rivale sur 200 retours simulés (la fréquence de l'approche est proche de la constante, à ±8 points ; jamais pour un suivi avant 28 jours) ; déterminisme ; classes sans règle = 0 ; échappement ; sauvegarde (clés facultatives, validées, réparées ; partie neuve ≤ plafond : `tests/mgmtReleveReduit.test.js` en arrière-plan ; partie ancienne intacte).
**[ ] 5. Fin.** Commit final `Monde lot 60 T1 : signer ou suivre` ; compte rendu honnête ; `TOUT_EST_FINI` seulement si tout est vert et commité.

## Compte rendu

- Modifié dans ce tour : `mgmt-recruteur.js` ajoute `mgmtRecruteurProfilDisponible`, porte commune permettant de rejeter un profil déjà dans l'effectif ou le marché extérieur ; signature, suivi idempotent et présentation des états existaient déjà dans les commits précédents.
- Tests : `node --test tests/mgmtLot42T1.test.js` — 9 tests verts. `tests/mgmtLot60T1.test.js` n'existe pas encore ; les exigences de bout en bout ne sont donc pas validées.
- Cases non terminées : ouverture explicite de l'écran Contrats, retrait des profils signés du marché via la porte d'admission, approche rivale déterministe et presse, tests requis (dont sauvegarde/classement/échappement), vérification de partie neuve.
- Écart : aucun écran supplémentaire ni migration de sauvegarde ajoutés. Cette tranche demeure inachevée ; `mgmtRecruteurProfilDisponible` n'est pas encore consommée par les écrans Contrats.
- Vérifications : test ciblé historique P5 T1 vert ; aucun lint global ni audit versions exécuté dans ce tour.
- Questions pour Anthony : aucune ; le travail restant est identifié et doit être implémenté, non soumis à arbitrage.

Règles communes : **additif** ; ne touche ni au moteur de combat, ni à `mgmt-traits*.js`, ni à `mgmt-attention.js`.
