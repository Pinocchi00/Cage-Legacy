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

- Modifié : `mgmt-recruteur.js` rend la porte disponible neutre pour les identifiants qui ne sont pas des profils de retour ; `mgmt-recrutement.js` applique cette porte à la liste des combattants libres, afin d'exclure un profil rapporté lorsqu'il figure déjà dans l'effectif ou le marché extérieur. `index.html` versions les deux scripts.
- Tests : `node --test tests/mgmtLot42T1.test.js` — 9 tests verts. Le test prescrit `tests/mgmtLot60T1.test.js` est absent et ne peut pas être exécuté.
- Cases non terminées : parcours explicite vers l'écran Contrats et signature via ce parcours, suivi vérifié sur le chemin réel, approche rivale déterministe (35 % / 15 %) et actualité, délai de protection des suivis, tests exigés (classes, échappement, sauvegarde, déterminisme, fréquence) et plafond de sauvegarde.
- Écart / vérifications : tranche inachevée. Lint ciblé et `node tools/verif-versions.js origin/main` passent ; le test ciblé prescrit échoue car le fichier n'existe pas. Aucune migration de sauvegarde.
- Questions pour Anthony : aucune ; le travail restant est implémenté en partie et n'est pas bloqué par une question de spécification.

Règles communes : **additif** ; ne touche ni au moteur de combat, ni à `mgmt-traits*.js`, ni à `mgmt-attention.js`.
