# Directives d'Architecture & Qualité - Cage Legacy

## 1. RÈGLES DE DÉVELOPPEMENT STRICTES
- **Langage** : Vanilla JavaScript (ES6+), sans aucun framework externe.
- **Performance Canvas 2D** : 
  - Toujours réutiliser les objets pour éviter le Garbage Collection pendant les boucles `requestAnimationFrame`.
  - Pas d'allocations de mémoire (`new Array()`, nouveaux objets) à l'intérieur de `ui.js` ou des boucles de rendu.
  - Utiliser un Object Pool pour les particules et les effets visuels.
- **Séparation des Responsabilités (Architecture)** :
  - `state.js` : Gère uniquement la donnée brute et la logique métier. AUCUN appel Canvas/DOM direct.
  - `ui.js` : Gère uniquement le rendu du Canvas 2D et les événements utilisateur.
  - `storage.js` : Gère les sauvegardes `localStorage` avec sérialisation propre.

## 2. STYLE DE CODE ET FORMATAGE
- Utiliser des structures modulaires ou des Objets JS clairs (`const Engine = { ... }`).
- Typer et valider chaque fonction complexe avec des commentaires JSDoc.
- Pas de fonctions géantes : découper toute méthode de plus de 40 lignes.
- Ne jamais supprimer de fonctions existantes dans `state.js` sans adapter les appels correspondants dans `ui.js`.

## 3. CHECKLIST DE VALIDATION AVANT MODIFICATION
Avant de générer ou de modifier un fichier :
1. Vérifier que la logique de simulation reste 100 % synchrone.
2. Garantir la compatibilité avec le système de sauvegarde `localStorage`.
3. S'assurer qu'aucun bug de rafraîchissement Canvas n'apparaît.