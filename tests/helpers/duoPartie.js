"use strict";
/* ==== [ANCRE: TESTS_DUO_PARTIE] — Monde lot 19 : les pas de partie Duo partagés par les tests (T5/T6 et T14), une
   seule source, jamais recopiés d'un fichier de test à l'autre. ==== */

/* Avance jusqu'au draft : les enchères s'ouvrent d'abord (DUO-T2) ; personne ne mise, tout le monde passe. */
const AVANCER = `mgmtDuoAvancer(G.mgmt);while(G.mgmt.duo.etape==='encheres'){mgmtDuoPasser(G.mgmt);}`;

/* Joue un draft complet : le joueur dont c'est le tour place son premier combattant plaçable, l'autre répond dans la même catégorie. */
const DRAFT = `const m=G.mgmt;
  for(let i=0;i<6;i++){
    const t=m.duo.draft.tour,p=mgmtDuoPlacables(m,t)[0];
    if(!p||!mgmtDuoPlacer(m,p.id)) return 'placement '+i;
    const r=mgmtDuoDisponibles(m,m.duo.draft.tour).find(f=>f.div===p.div);
    if(!r||!mgmtDuoRepondre(m,r.id)) return 'réponse '+i;
  }
  return m.duo.etape;`;

module.exports = { AVANCER, DRAFT };
