# Lot 3 T2 — Vérification d’interface (charte §3) — relevé DOM automatisé

*Part OpenCode (§3.2) : le jeu réel chargé (jsdom), relevé DOM automatisé. Captures 1280/1440/1920, mesures de rendu réel et relecture humaine : à Claude (§3.3) ; verdict final : à Anthony (§3.4).*

| Vérification | Résultat |
|---|---|
| L’écran se charge avec un combat réel du moteur (canvas et deux noms en place) | OK |
| Le combat entier se dessine image par image (54253 images, canvas muet) — console sans erreur | OK |
| Pause au clic : état basculé des deux sens, libellé « Reprendre » pendant la pause (S6) | OK |
| Vitesse ×2 au clic : aria-pressed bascule (S6) | OK |
| Moment suivant au clic : l’instant avance, le HUD suit (S6) | OK |
| Touche Espace existe au bouton Pause, et bascule (S5) | OK |
| Touche n existe au bouton Moment suivant, et avance (S5) | OK |
| Touches 1/2 existent aux boutons ×1/×2, et basculent (S5) | OK |
| L2 — nom des combattants 22px (≥13px), horloge 34px, phase et round 13px, ligne du moment 17px | OK |
| L2 — contraste information de décision (texte sur fond) : 16.51:1 ≥ 4,5 | OK |
| L3 — contraste libellé ROUND (or sur fond) : 10.25:1 ≥ 3 | OK |
| L2 — contraste ligne du moment (texte sur panel2) : 14.53:1 ≥ 4,5 | OK |
| H1 — aucun momentum, jauge ou barre de dégâts à l’écran | OK |
| esc() — un nom piégé est échappé, jamais injecté (H4/esc) | OK |
| H4 — la ligne affichée vient du déroulé du moteur (ar2-texte alimenté par etat.texte) | OK (structure vérifiée ; le contenu testé ci-dessus) |

