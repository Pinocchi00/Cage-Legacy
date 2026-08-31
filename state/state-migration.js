"use strict";
/* CAGE LEGACY — state/state-migration.js
   Migration d'une sauvegarde ancienne vers la version courante. */
const SAVE_VERSION=3;
/* ==== [ANCRE: MIGRATION] — on empile les blocs, on n'en modifie jamais un livré ==== */
function migrate(g){ if(!g)return g; g.version=g.version||1;
  if(g.version<SAVE_VERSION){ g.version=SAVE_VERSION; }
  /* ==== [ANCRE: FAITH_CINQ_TEMPS] — l'année Faith est passée de 3 à 5 temps.
     Une partie sauvegardée sous l'ancienne numérotation se retrouverait au
     mauvais moment de l'année : step 3 valait « combat », il vaut désormais
     « le monde ». Correspondance par intention, pas par arithmétique —
     l'ancien 3 devient 4 (l'octogone), pas 5 (le bilan), sans quoi le joueur
     sauterait le combat qu'il s'apprêtait à disputer. Le drapeau
     stepScale5 rend la migration idempotente. ==== */
  if(g.faith && !g.faith.stepScale5){
    const ancien=g.faith.step||1;
    g.faith.step=(ancien>=3)?4:ancien;
    g.faith.stepScale5=true;
  }
  /* ==== [ANCRE: FAITH_CINQ_TEMPS] (suite) — la refonte ultérieure de l'échelle
     à temps fixes ci-dessus vers un calendrier de 12 mois (G.faith.month,
     G.faith.calendar — cf. ANCRE FAITH_CALENDRIER, ui-08) n'avait reçu aucune
     migration : une sauvegarde antérieure n'a ni l'un ni l'autre, et
     G.faith.month++ (faithAdvanceMonth(), ui-08) évalue undefined+1 → NaN,
     ce qui bloque définitivement l'avance de l'année. Génère le calendrier
     manquant sur le même modèle que finalizeFaithDraft()/nextFaithYear()
     (ui-08) — un an neuf, mois 0 — puis avance jusqu'au premier mois occupé,
     comme faithLandOnMonth() (ui-08) sans jamais l'appeler : ce dernier lit
     et modifie G, le combattant global pas encore réassigné à ce stade
     (migrate() ne fait que retourner g, l'affectation G=migrate(g) vient
     après), donc reproduit ici sur g. La présence de g.faith.calendar sert
     elle-même de témoin d'idempotence : une sauvegarde déjà migrée n'est
     jamais reconstruite. ==== */
  if(g.faith && !g.faith.calendar){
    g.faith.calendar=faithGenerateCalendar(g.f);
    let m=0; while(m<12 && !(g.faith.calendar[m]||{}).type) m++;
    g.faith.month=Math.min(m,11);
  }
  return g; }
/* ==== [FIN ANCRE] ==== */
