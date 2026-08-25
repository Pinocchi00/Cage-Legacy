"use strict";
/* CAGE LEGACY — tests/helpers/playthrough.js
   ============================================================================
   Un "joueur automatique" générique : lit le HTML réellement rendu par
   render(), trouve le PREMIER `onclick="..."` cliquable, et l'exécute —
   toujours le premier choix disponible (README-TESTS.md, "Ces
   tests jouent le jeu bêtement"). Ne connaît AUCUN écran par son nom :
   robuste aux variations narratives du jeu (conférence de presse parfois
   déclenchée, face-à-face parfois présent, combat vedette parfois...) sans
   qu'il faille maintenir une séquence d'écrans câblée en dur ici.

   ==== [ANCRE: TESTS_PLAYTHROUGH_V3] — Plan V3 LOT 0 §6.1. ==== */

/** Extrait TOUS les `onclick="..."` du HTML actuellement rendu, dans
 * l'ordre d'apparition. La grande majorité passent par `CL.xxx(...)`, mais
 * quelques écrans manipulent `G` directement puis appellent `render()`
 * sans détour par CL (ex. `onclick="G.fight.planStep=2; render();"`,
 * scr_plan, ui-06) — n'importe quel onclick non vide est donc accepté, pas
 * seulement ceux qui commencent par CL. Le bouton ✕ de fermeture
 * (class="eyebrow x", convention constante dans tout le projet) est
 * filtré : c'est presque toujours le tout premier onclick d'un écran,
 * avant son contenu réel, et le prendre reviendrait à fermer l'écran au
 * lieu d'y répondre.
 * @param {Window} win @returns {string[]} */
function allOnclicks(win){
  const app = win.document.getElementById('app');
  if(!app) return [];
  const html = app.innerHTML.replace(/<span class="eyebrow x"[^>]*>.*?<\/span>/g, '');
  const re = /onclick="([^"]+)"/g;
  const out = [];
  let m;
  // Le HTML échappe les apostrophes en attribut nulle part dans ce projet
  // (esc() n'échappe que & < >, jamais les guillemets simples utilisés pour
  // les arguments CL.xxx('...')) — décodage des entités & < > suffisant.
  while((m = re.exec(html))) out.push(m[1].replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>'));
  return out;
}
/** Compat : le premier onclick trouvé (voir allOnclicks). */
function firstOnclick(win){ return allOnclicks(win)[0] || null; }

/** Exécute jusqu'à `maxSteps` clics "premier choix disponible", en
 * s'arrêtant plus tôt si plus aucun onclick CL.* n'est trouvé (écran mort,
 * ou un des écrans "hors CL" comme l'arène en pause automatique) ou si
 * `stopWhen(win)` devient vrai. Chaque clic est protégé : une exception
 * JS interrompt immédiatement avec un message qui inclut l'écran et
 * l'action en cause (jamais une pile muette).
 * @param {Window} win @param {{maxSteps?:number, stopWhen?:(w:Window)=>boolean}} [opts]
 * @returns {{steps:number, lastAction:?string}} */
function clickThrough(win, opts){
  const maxSteps = (opts && opts.maxSteps) || 500;
  const stopWhen = (opts && opts.stopWhen) || (() => false);
  let steps = 0, lastAction = null;
  let curScreen = win.G && win.G.screen;
  let tried = new Set(); // actions déjà essayées SUR CET écran sans le faire avancer
  while(steps < maxSteps){
    if(stopWhen(win)) break;
    if(win.G && win.G.screen !== curScreen){ curScreen = win.G.screen; tried = new Set(); }
    const actions = allOnclicks(win);
    // ==== [ANCRE: TESTS_PLAYTHROUGH_SELECTEUR] — certains écrans posent un
    // sélecteur/bascule AVANT le contenu réel (ex. CL.setCampTier('gratuit')
    // avant les options CL.train(i), scr_camp/ui-02) : l'exécuter ne change
    // ni l'écran ni ce sélecteur (déjà à sa valeur par défaut), donc le
    // reprendre en boucle ne fait jamais avancer la partie. On saute au
    // premier onclick de la liste qui n'a pas déjà été tenté sans effet sur
    // CET écran, plutôt que de s'y arrêter indéfiniment.
    const action = actions.find(a => !tried.has(a));
    if(!action) break;
    lastAction = action;
    try{
      win.eval(action);
    }catch(e){
      const screen = (win.G && win.G.screen) || '?';
      throw new Error(`clickThrough: échec de "${action}" sur l'écran "${screen}" (étape ${steps}) — ${e.message}`);
    }
    steps++;
    if(win.G && win.G.screen === curScreen) tried.add(action);
    else { curScreen = win.G && win.G.screen; tried = new Set(); }
  }
  return { steps, lastAction };
}

/** Joue une carrière complète en mode carrière classique : création d'un
 * combattant, puis enchaîne des combats (toujours le premier adversaire,
 * le premier entraînement, le premier plan) jusqu'à `targetFights` combats
 * résolus ou la retraite, selon ce qui arrive en premier.
 * @param {Window} win @param {{targetFights?:number, first?:string}} [opts]
 * @returns {{fights:number, retired:boolean}} */
/* ==== [ANCRE: TESTS_TURNPRO_RESET] — trouvé en stress-testant le Plan V3
   LOT 1 : compter les combats via f.W+f.L+f.D casse dès que la carrière
   franchit amateur->pro, où turnPro() (ui-05) remet volontairement W/L à
   zéro (palmarès amateur archivé à part dans f.amaRec — seul reset
   légitime du jeu, cf. ANCRE P4P_SCORE_80_20, engine.js:1266). Le total
   observable retombait alors sous sa valeur d'avant-promotion pour
   plusieurs combats d'affilée : `after > before` ne se déclenchait plus,
   et clickThrough épuisait ses 200 pas au milieu d'un combat au lieu de
   rendre la main proprement — et même corrigé en `!==`, le compteur de
   combats renvoyé par playCareer() restait faux (redescendu) juste après
   la promotion. f.history (engine.js:1026, poussé une fois par combat
   résolu, amateur ET pro, jamais remis à zéro par turnPro()) est le seul
   compteur réellement monotone sur toute la carrière — utilisé partout
   ci-dessous à la place de W+L+D. */
function totalFightsPlayed(win){ return (win.G.f.history||[]).length; }
function playCareer(win, opts){
  const targetFights = (opts && opts.targetFights) || 15;
  const first = (opts && opts.first) || 'Auto';
  win.CL.newCareer();
  win.G.draft.first = first;
  win.CL.create();
  let fights = 0;
  let guard = 0;
  while(fights < targetFights && !win.G.f.retired && guard < 2000){
    guard++;
    const before = totalFightsPlayed(win);
    /* maxSteps:400, pas 200 — trouvé en stress-testant le Plan V3 LOT 1
       (seed=1 reproduit systématiquement) : un cycle complet hub->
       sélection->camp->plan->arène->résultat coûte ~12-13 clics, mais un
       enchaînement de plusieurs écrans à un seul clic après un combat
       (jalon débloqué, promotion, contrat...) peut en ajouter plusieurs
       dizaines — avec 200, clickThrough pouvait épuiser son budget PENDANT
       la traversée vers le combat suivant, juste avant d'atteindre les
       boutons de plan de combat (déjà vérifié manuellement : les cliquer
       fonctionne, il ne restait simplement plus de pas pour les essayer).
       400 laisse une marge large sans jamais masquer un vrai blocage
       (un écran mort épuiserait 400 pas tout aussi sûrement que 200). */
    clickThrough(win, { maxSteps: 400, stopWhen: w => {
      return totalFightsPlayed(w) > before || w.G.f.retired || w.G.screen === 'gameover';
    }});
    const after = totalFightsPlayed(win);
    if(after <= before && !win.G.f.retired) break; // plus aucune action possible : on sort plutôt que de boucler à vide
    fights = after;
  }
  return { fights, retired: !!win.G.f.retired };
}

module.exports = { firstOnclick, allOnclicks, clickThrough, playCareer, totalFightsPlayed };
