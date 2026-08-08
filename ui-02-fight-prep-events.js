"use strict";
/* CAGE LEGACY — js/ui-02-fight-prep-events.js
   ============================================================================
   Fichier 2/8 issu du découpage de l'ancien ui.js monolithique (~400 Ko).
   Préparation d'un combat (lecture tactique, sélection d'adversaire, entraînement), et le système d'événements aléatoires de carrière + bilan de fin de saison.

   IMPORTANT : ce découpage préserve l'ORDRE EXACT du code d'origine — aucune
   fonction n'a été déplacée ou réordonnée, seules des frontières de fichier
   ont été insérées à des points sûrs (toujours juste avant une déclaration de
   premier niveau, jamais au milieu d'une fonction ou d'un objet). Tous ces
   fichiers partagent la même portée globale que l'ancien ui.js (variables et
   fonctions visibles d'un fichier à l'autre, comme avant), il faut donc les
   charger dans l'ordre indiqué dans index.html : 01, 02, 03... jusqu'à 08.
   ============================================================================ */

function tacticalRead(f,o){ const a=eff(f),b=eff(o);
  let prefix=(o.styleLabel||'')+'. '; const fights=o.W+o.L+o.D;
  // ==== [ANCRE: CORRECTIF_REPETITION_TEXTES] — chaque condition n'avait
  // qu'UNE seule phrase possible, répétée à l'identique à chaque adversaire
  // correspondant au même profil (remonté : "raccourci", "prodige" etc. mais
  // le problème touchait aussi cette lecture tactique, affichée sur chaque
  // carte de matchmaking). Pool de variantes + choix stable par adversaire
  // (pickStable, seed=id) : varié d'un combat à l'autre, mais ne change pas
  // à chaque re-rendu du même écran.
  if(fights<=5 && o.W>o.L) prefix+=pickStable(['Jeune loup imprévisible. ','Prospect encore instable, mais dangereux. ','Débutant fougueux, difficile à lire. ','Trop tôt dans sa carrière pour être prévisible. '],o.id+'p1');
  else if(o.streak<=-2 && o.age>=32) prefix+=pickStable(['Vétéran sur le déclin. ','Les jambes ne suivent plus comme avant. ','Un nom connu, mais une fin de carrière difficile. ','Le corps commence à lâcher. '],o.id+'p2');
  else if(o.streak>=3) prefix+=pickStable(['Sur une grosse série de victoires. ','En pleine confiance après plusieurs succès. ','Personne ne l\u2019a arrêté depuis longtemps. ','Il arrive avec une belle dynamique de victoires. '],o.id+'p3');
  // cohérence avec le scouting affiché (striking/grappling/danger) : si au moins
  // 2 des 3 catégories montrées penchent nettement dans le même sens, la lecture
  // tactique doit le refléter — pas seulement l'écart d'overall, qui peut rester
  // sous le seuil même quand les 3 catégories visibles sont unanimes.
  const oStr=(num(o.attrs.jab)+num(o.attrs.cross)+num(o.attrs.hook)+num(o.attrs.kick))/4, fStr=(num(f.attrs.jab)+num(f.attrs.cross)+num(f.attrs.hook)+num(f.attrs.kick))/4;
  const oGrap=(num(o.attrs.takedown)+num(o.attrs.submission)+num(o.attrs.topControl))/3, fGrap=(num(f.attrs.takedown)+num(f.attrs.submission)+num(f.attrs.topControl))/3;
  const oDan=num(o.attrs.power), fDan=num(f.attrs.power);
  const edgeOpp=[oStr-fStr,oGrap-fGrap,oDan-fDan].filter(d=>d>=8).length;
  const edgeMe=[oStr-fStr,oGrap-fGrap,oDan-fDan].filter(d=>d<=-8).length;
  let base=pickStable(['Combat équilibré — l\u2019intelligence fera la différence.','Match serré sur le papier — les détails décideront.','Rien ne sépare vraiment les deux profils ici.','Duel ouvert : la préparation fera toute la différence.'],o.id+'b0');
  if(b.striking>b.ground+12 && b.striking>a.striking) base=pickStable(['Redoutable debout — amène-le au sol.','Il vit et meurt par la frappe — au sol, il perd tous ses repères.','Dangereux à distance, beaucoup moins sur le dos.','Ne le laisse jamais s\u2019installer debout — traîne-le au tapis.'],o.id+'b1');
  else if(b.takedown>a.tdd+10) base=pickStable(['Gros lutteur — garde la cage dans le dos, sprawle.','Il va chercher l\u2019amenée en boucle — anticipe et défends-toi.','Sa lutte est son arme principale — ne la sous-estime pas.','Prépare-toi à défendre des amenées toute la soirée.'],o.id+'b2');
  else if(b.submission>a.guard+12) base=pickStable(['Dangereux au sol — reste debout, méfie-toi du cou.','Un sol avec lui est un pari risqué — évite d\u2019y traîner.','Ses soumissions sont sa vraie menace — ne t\u2019attarde pas en bas.','Le genre d\u2019adversaire qu\u2019on ne suit pas volontairement au tapis.'],o.id+'b3');
  else if(a.overall>o.overall+8 || edgeMe>=2) base=pickStable(['Sur le papier, tu domines. Ne te relâche pas.','L\u2019avantage est clairement de ton côté — ne le gâche pas par excès de confiance.','Tu es censé gagner ce combat — reste concentré jusqu\u2019au bout.','Favori net — le vrai danger, c\u2019est de le sous-estimer.'],o.id+'b4');
  else if(o.overall>f.overall+8 || edgeOpp>=2) base=pickStable(['Plus fort que toi. Il te faudra un plan.','L\u2019écart est réel — improviser ne suffira pas ce soir.','Un adversaire supérieur sur le papier — la tactique devra compenser.','Ce combat ne se gagne pas sur le talent brut seul.'],o.id+'b5');
  return prefix+base;
}
/* ==== [ANCRE: COMPARATIF_STATS_REUTILISABLE] — extrait de scr_select() pour
   être réutilisé ailleurs (ex. offre de supercombat champ-champ, item
   demandé : afficher striking/grappling/danger du champion adverse). ==== */
function statComparisonHtml(f,o){
  const striking=Math.round((o.attrs.jab+o.attrs.cross+o.attrs.hook+o.attrs.kick)/4);
  const grappling=Math.round((o.attrs.takedown+o.attrs.submission+o.attrs.topControl)/3);
  const danger=o.attrs.power;
  const myStr=Math.round((f.attrs.jab+f.attrs.cross+f.attrs.hook+f.attrs.kick)/4);
  const myGrap=Math.round((f.attrs.takedown+f.attrs.submission+f.attrs.topControl)/3);
  const myDan=f.attrs.power;
  const diffText=(opp,me)=>{ const diff=me-opp; if(diff>=12)return'Ton avantage net';if(diff>=5)return'Léger avantage';if(diff>-5&&diff<5)return'Équilibré';if(diff<=-12)return'Son avantage net';return'Léger désavantage'; };
  const getDiffColor=(txt)=>txt.startsWith('Son')||txt==='Léger désavantage'?'var(--loss)':(txt.startsWith('Ton')||txt==='Léger avantage')?'var(--gold)':'var(--text)';
  return `<div class="stat-band" style="display:grid;grid-template-columns:1fr 1fr 1fr;text-align:left;border-top:1px dashed var(--line)">
    <div><span class="stat-lbl">STRIKING</span><b class="mono" style="font-size:13px;color:${getDiffColor(diffText(striking,myStr))}">${diffText(striking,myStr)}</b></div>
    <div><span class="stat-lbl">GRAPPLING</span><b class="mono" style="font-size:13px;color:${getDiffColor(diffText(grappling,myGrap))}">${diffText(grappling,myGrap)}</b></div>
    <div><span class="stat-lbl">DANGER (KO)</span><b class="mono" style="font-size:13px;color:${getDiffColor(diffText(danger,myDan))}">${diffText(danger,myDan)}</b></div>
  </div>`;
}
// ==== [ANCRE: MATCHMAKING_ROLES] — item demandé : les archétypes de
// matchmaking (Prodige Régional, Gardien du Temple, Raccourci Risqué...)
// existaient déjà comme habillage narratif recalculé à chaque render() dans
// scr_select() (ui-06), sans exister comme donnée : impossible de s'y fier
// ailleurs (résolution de combat, historique) et pas garanti de rester
// stable entre deux rendus du même écran si la donnée sous-jacente change
// (streak, morale...) pendant que le joueur regarde. Extrait ici en fonction
// pure, appelée UNE FOIS par genOpponents() et figée sur l'entrée (e.mm) —
// scr_select() consomme désormais cette donnée figée au lieu de la
// recalculer. Permet un vrai enjeu mécanique (voir CREDIBILITE_PRODIGE plus
// bas dans ui-05) au lieu d'une simple étiquette cosmétique.
function matchmakingRole(f,o,e){
  const rkMe=divRank(f), rnk=divRank(o), fightsTot=o.W+o.L+(o.D||0);
  const isRival=(f.rivalId===o.id);
  const isProspect=(o.age<=23 && fightsTot<=6 && o.W>o.L);
  const isVeteran=(o.age>=34 && o.L>=3);
  const isGatekeeper=(o.attrs.durability>75 || o.attrs.tdd>75) && o.L>o.W/2;
  let role='logique', label='Opposition Logique', reward='Niveau équivalent, progression saine au classement.', color='var(--text)';
  if(e.context==='CHAMP-CHAMP'){ role='champchamp'; label='Défi Historique'; reward='Devenir double monarque. La consécration ultime.'; color='var(--gold)'; }
  else if(e.context && e.context.includes('TOURNOI')){ role='tournoi'; label='Combat de Bracket'; reward='Avancer dans le tournoi amateur.'; color='var(--sage)'; }
  else if(o.champion || e.context==='COMBAT DE TITRE'){ role='titre'; label='Le Champion en Titre'; reward='Risque immense. Récompense absolue : la Ceinture.'; color='var(--gold)'; }
  else if(f.champion){ role='challenger'; label='Challenger Légitime'; reward='Défense de titre. Confirme votre statut de roi de la division.'; color='var(--sage)'; }
  else if(isRival){ role='rivalite'; label='Rivalité Historique'; reward='L\u2019ego et la hype sont en jeu. Bonus de bourse garanti.'; color='var(--blood)'; }
  else if(fightsTot===0){ role='debutant'; label='Le Débutant'; reward='Faible risque. Peu de crédit en cas de victoire, idéal pour se relancer.'; color='var(--muted)'; }
  else if(rnk<rkMe-4){ role='raccourci'; label='Le Raccourci (Risqué)'; reward='Adversaire bien mieux classé. Bond massif au classement si vous créez la surprise.'; color='var(--gold)'; }
  else if(isProspect){ role='prospect'; label='Le Prodige Régional'; reward='Voler la hype du petit jeune. Très risqué pour votre crédibilité si battu.'; color='#4DA6FF'; }
  else if(isGatekeeper){ role='gatekeeper'; label='Le Gardien du Temple'; reward='Combat bourbier garanti. Passage obligatoire pour le haut du classement.'; color='var(--sage)'; }
  else if(isVeteran){ role='veteran'; label='Le Vétéran'; reward='Nom connu, mais sur le déclin. Bon test pour rassurer votre camp.'; color='var(--text)'; }
  else if(rnk>rkMe+5){ role='piege'; label='Le Combat Piège'; reward='Classement inférieur au vôtre. Tout à perdre, rien à gagner.'; color='var(--loss)'; }
  return {role,label,reward,color};
}
function genOpponents(f){
  let pool=G.roster.filter(o=>o.id!==f.id);
  // Anti-répétition globale : mémoire des 4 derniers adversaires, appliquée
  // AVANT tout branchement (titre/défense/normal) — l'ancien filtre à 1 seul
  // adversaire (lastOpponentId) ne protégeait que le matchmaking normal,
  // laissant les combats de titre et les défenses totalement exposés à la
  // répétition, ce qui explique le cas signalé (même adversaire proposé
  // après avoir pris ET défendu la ceinture contre lui).
  if(f.recentOpps && f.recentOpps.length>0){
    const filtered=pool.filter(o=>!f.recentOpps.includes(o.id));
    if(filtered.length>=5) pool=filtered;
  }
  // ==== [ANCRE: CORRECTIF_RIVALITE_PLAFOND] — bug remonté : rien ne limitait
  // le nombre TOTAL de confrontations contre le même adversaire sur toute la
  // carrière (seule la fenêtre glissante des 4 derniers combats ci-dessus
  // protégeait, insuffisant sur un long règne de champion — un même prétendant
  // n°1 pouvait ressortir indéfiniment dès qu'il sortait de cette fenêtre,
  // menant à des rivalités à 14 confrontations, bien au-delà du seuil de
  // l'achievement "Rivalité légendaire" — 4). Plafond dur à 6 confrontations
  // totales, appliqué avec le même filet de sécurité (pool restant suffisant)
  // que le filtre ci-dessus pour ne jamais casser un petit roster.
  if(f._allMeetings){
    const capped=pool.filter(o=>o.champion || (f._allMeetings[o.id]||0)<6);
    if(capped.length>=5) pool=capped;
  }
  let chosen=[];
  if(G.tournament && G.tournament.active && f.org===0){
    const myMatch=G.tournament.matches.find(m=>m.a.id===f.id || m.b.id===f.id);
    if(myMatch){
      const rival=myMatch.a.id===f.id?myMatch.b:myMatch.a;
      const entry={o:rival, read:`Élimination directe.`, context:`TOURNOI ${G.tournament.cfg.label} — ${G.tournament.step}`};
      entry.mm=matchmakingRole(f,rival,entry);
      return [entry];
    }
  }
  const isDefense=!!f.champion;
  const isTitle=(!isDefense && isTitleEligible(f));
  if(isTitle){ const champ=pool.find(o=>o.champion)||pool[0];
    const entry={o:champ, read:tacticalRead(f,champ), context:`COMBAT DE TITRE`};
    entry.mm=matchmakingRole(f,champ,entry);
    return [entry]; }
  if(isDefense){
    const r1=pool[0]||pool[1];
    const rest=pool.slice(1,8).filter(o=>o && o.id!==r1.id);
    rest.sort(()=>0.5-rnd());
    chosen.push(r1, rest[0]||pool[1], rest[1]||pool[2]);
  }
  else {
    let normalPool=rankPool(pool.filter(o=>!o.champion)); // trié du meilleur au pire — myRank/rk ci-dessous en dépendent directement
    const myRank=normalPool.findIndex(o=>p4pScore(o)<p4pScore(f));
    // rk clampé à un index VALIDE du pool (jamais pool.length) : sinon pool[rk] est
    // undefined et retombe sur pool[0] via le ||pool[0] plus bas — c'est-à-dire le
    // champion/N°1 — exactement le bug "j'affronte le N°1 à mon 1er combat".
    const rk=Math.min(myRank===-1?normalPool.length-1:myRank, normalPool.length-1);
    // écart proportionnel à la taille du pool (6%, minimum 2) : un pool amateur de
    // ~100 a besoin d'une fenêtre bien plus large qu'un pool pro de ~30, sinon
    // rk±2 retombe régulièrement sur le tout premier du classement par accident.
    const spread=Math.max(2,Math.round(normalPool.length*0.06));
    // Filet de sécurité explicite : premier combat dans le pool actuel (0 combat
    // dans cette organisation, amateur INCLUS — corrige le cas où un débutant
    // amateur 0-0 se voyait proposer le premier du classement), en plus de la
    // protection déjà assurée par le clamp de rk ci-dessus — garantit que les 3
    // propositions viennent du tout bas du classement, sans dépendre du bon
    // comportement de p4pScore/findIndex.
    if((f.W+f.L+(f.D||0))===0 && normalPool.length>=5){
      const bottom=normalPool.slice(-5);
      chosen.push(bottom[bottom.length-1], bottom[Math.floor(bottom.length/2)], bottom[0]);
    } else if(f.streak<=-2){
      // SCÉNARIO A : Le Rebond (Prospect vs Vétéran)
      // Bug corrigé : .find() scannait tout normalPool depuis le rang #1, donc
      // un joueur classé #30 pouvait se voir proposer le #1 du classement s'il
      // correspondait par hasard au profil recherché (confirmé : items #7/#13).
      // On borne désormais la recherche à une fenêtre autour du rang réel (rk).
      const searchWindow=normalPool.slice(Math.max(0,rk-spread*2), Math.min(normalPool.length,rk+spread*2+1));
      const prospect=searchWindow.find(o=>(o.W+o.L)<=5 && o.W>o.L && p4pScore(o)<p4pScore(f)) || normalPool[Math.min(normalPool.length-1, rk+spread)];
      const veteran=searchWindow.find(o=>o.age>=32 && o.streak<0) || normalPool[Math.min(normalPool.length-1, rk+spread+1)];
      const mid=normalPool[rk]||normalPool[0];
      chosen.push(prospect, veteran, mid);
    } else if(f.streak>=2){
      // SCÉNARIO B : L'Anti-chambre (Gatekeeper) — même correction de fenêtre
      const searchWindow=normalPool.slice(Math.max(0,rk-spread*2), Math.min(normalPool.length,rk+spread*2+1));
      const gatekeeper=searchWindow.find(o=>o.attrs.durability>75 || o.attrs.tdd>75) || normalPool[Math.max(0, rk-spread)];
      const higher=normalPool[Math.max(0, rk-spread-1)];
      const trap=normalPool[Math.min(normalPool.length-1, rk+1)];
      chosen.push(gatekeeper, higher, trap);
    } else {
      // SCÉNARIO C : Statu Quo
      chosen.push(normalPool[Math.max(0, rk-spread)], normalPool[rk]||normalPool[0], normalPool[Math.min(normalPool.length-1, rk+spread)]);
    }
    if(f.rivalId){ const rival=normalPool.find(o=>o.id===f.rivalId && !o.champion);
      if(rival && !chosen.includes(rival)) chosen[1]=rival; }
  }
  let uniqueOpps=[...new Set(chosen)].filter(Boolean);
  while(uniqueOpps.length<3 && uniqueOpps.length<pool.length){ const rand=pick(pool);
    if(!uniqueOpps.includes(rand) && !rand.champion) uniqueOpps.push(rand); }
  uniqueOpps=uniqueOpps.slice(0,3);
  // ==== [ANCRE: CORRECTIF_ORDRE_PROPOSITIONS] — bug remonté : l'écran du
  // Bureau du Matchmaker (scr_select) affirme que "l'ordre des propositions
  // dicte le niveau de risque", mais aucune des branches ci-dessus ne
  // garantissait un ordre réel par difficulté — la défense de titre allait
  // jusqu'à mélanger aléatoirement 2 des 3 propositions (rest.sort(()=>0.5-
  // rnd())). On trie maintenant explicitement le résultat final par force
  // réelle (p4pScore décroissant : l'adversaire le plus dangereux en premier,
  // le plus abordable en dernier), pour que le texte affiché soit enfin vrai
  // quelle que soit la branche qui a construit la liste.
  uniqueOpps.sort((a,b)=>p4pScore(b)-p4pScore(a));
  return uniqueOpps.map(o=>{ let read=tacticalRead(f,o);
    if(f.rivalId===o.id) read='RIVALITÉ. '+read;
    const entry={o, read};
    entry.mm=matchmakingRole(f,o,entry);
    return entry; });
}

function trainingOptions(f){ const gen=TRAIN.filter(x=>x.t.includes('all'));
  const spec=TRAIN.filter(x=>x.t.includes(f.style));
  const exclusive=(typeof getExclusiveTraining==='function')?getExclusiveTraining(f):[];
  const opts=[]; const s=spec.concat(exclusive); const g=gen.slice();
  // 2 liées au sport (dont l'exclusif désormais, à égalité de chances) + 1 générale
  for(let i=0;i<2&&s.length;i++) opts.push(s.splice(Math.floor(rnd()*s.length),1)[0]);
  if(g.length) opts.push(g.splice(Math.floor(rnd()*g.length),1)[0]);
  while(opts.length<3 && g.length) opts.push(g.splice(Math.floor(rnd()*g.length),1)[0]);
  return opts.sort(()=>rnd()-0.5);
}

/* ------------------------------- flux ------------------------------------- */
function startFightSelect(){ if(G.f.injury) return; G.opps=genOpponents(G.f); G.screen='select'; save(); render(); }
function chooseOpponent(i){ G.sel=G.opps[i]; G.train=trainingOptions(G.f); generateSponsorObjective(G.f);
  G.f._rivalryPressDone=false; G.pressConf=(typeof triggerRivalPressConference==='function')?triggerRivalPressConference(G.f,G.sel.o):null;
  G.screen=G.pressConf?'press_conf':'camp'; save(); render(); }
function chooseTraining(i){ const opt=G.train[i];
  const tierId=G.selectedCampTier||'gratuit';
  const tier=CAMP_TIERS.find(t=>t.id===tierId)||CAMP_TIERS[0];
  let pendingOppMalus=null;
  if(tierId!=='gratuit'){
    if((G.f.earnings||0)<tier.cost){ G.lastMsg="Fonds insuffisants pour ce camp — passage au camp gratuit."; }
    else {
      G.f.earnings-=tier.cost;
      const applied=applyDeltas(G.f,opt.d); G.campApplied={label:opt.label+` (${tier.name})`,deltas:applied};
      if(G.f._mentorMainStat && G.f.attrs[G.f._mentorMainStat]!==undefined){
        const extra=applyDeltas(G.f,[[G.f._mentorMainStat,2]]); G.campApplied.deltas=G.campApplied.deltas.concat(extra);
      }
      if(tier.buff){ if(tier.buff.morale) G.f.morale=clamp(G.f.morale+tier.buff.morale,0,100); if(tier.buff.form) G.f.form=clamp(G.f.form+tier.buff.form,0,100); }
      if(tier.oppDebuff) pendingOppMalus=tier.oppDebuff;
      G.selectedCampTier='gratuit';
      return finishTrainingFlow(pendingOppMalus);
    }
  }
  const applied=applyDeltas(G.f,opt.d); G.campApplied={label:opt.label,deltas:applied};
  if(G.f._mentorMainStat && G.f.attrs[G.f._mentorMainStat]!==undefined){
    const extra=applyDeltas(G.f,[[G.f._mentorMainStat,2]]); G.campApplied.deltas=G.campApplied.deltas.concat(extra);
  }
  // Risque de blessure à l'entraînement — nul sur les choix non-physiques (repos/mental).
  // Réutilise le catalogue réel (rollInjury/f.injury de Phase 4), pas un tirage
  // parallèle qui doublerait le risque déjà couvert par generateRandomEvent()/major_injury.
  const lowRisk=(opt.label==='Repos & analyse vidéo'||opt.label==='Travail mental');
  if(!lowRisk && rnd()<0.03){
    const inj=rollInjury(); G.f.injury={name:inj.name,left:inj.fights};
    G.f.form=clamp(G.f.form-15,0,100); G.f.morale=clamp(G.f.morale-10,0,100);
    if(typeof checkIronManDeath==='function') checkIronManDeath(null,inj);
    // ==== [ANCRE: CORRECTIF_IRONMAN_INFIRMERIE] — bug trouvé : une blessure
    // grave hors combat pouvait déclencher G.f.retired=true (mode Iron Man)
    // sans que l'écran ne route jamais vers la retraite — le joueur atterrissait
    // simplement au vestiaire, où rien ne bloquait la reprise des combats.
    if(G.f.retired){ CL.toLegacy(); return; }
    G.screen='hub'; save(); render(); return;
  }
  return finishTrainingFlow(null);
}
function finishTrainingFlow(pendingOppMalus){
  // ==== [ANCRE: CORRECTIF_KIND_CHAMPCHAMP] — bug majeur trouvé : ce flux
  // écrasait TOUJOURS G.fight (donc G.fight.kind) avec fightKind(), qui
  // renvoie 'defense' dès que f.champion est vrai — ce qui est TOUJOURS le
  // cas pour un supercombat champ-champ (le joueur détient déjà sa première
  // ceinture). Résultat : le supercombat était traité comme une simple
  // défense de titre ordinaire, jamais reconnu comme la conquête d'une
  // double couronne (cause commune des deux bugs signalés : pas de message
  // "double champion", pas de choix de division, pas de bonus dédié). On
  // préserve maintenant explicitement le kind 'champchamp_title' déjà posé
  // par acceptChampChampOffer() avant d'entrer dans ce flux.
  const isChampChamp=G.fight && G.fight.kind==='champchamp_title';
  const kind=isChampChamp?'champchamp_title':fightKind(); const opp=G.sel.o;
  // Popularité (#3) : un combattant très en vue décroche parfois le statut de
  // combat vedette (5 rounds, feu des projecteurs) même hors combat de titre.
  const isStarFight=(kind!=='title' && kind!=='defense' && kind!=='champchamp_title') && (G.f.hypeBonus||1)>=1.4 && rnd()<0.30;
  const rounds=(kind==='title'||kind==='defense'||kind==='champchamp_title'||isStarFight)?5:3;
  G.fight={kind,opp,rounds,malus:null,oppMalus:pendingOppMalus||null,isStarFight,mmRole:G.sel.mm?G.sel.mm.role:null};
  // ==== [ANCRE: CUTTING_5PALIERS] — déterministe, à CHAQUE combat. Le poids de
  // forme est un trait VARIABLE (weightCutInfo tire un % neuf à chaque appel),
  // pas un socle figé à la création — donc le palier change réellement d'un
  // combat à l'autre sans avoir besoin d'une variance ajoutée par-dessus.
  const wc=weightCutInfo(G.f); const isTopDivision=(G.f.div==='H-heavy'||G.f.div==='F-feather');
  const effPct=wc.cutPct;
  let cutTier, cutMods=null;
  if(effPct<=3){ cutTier='sans_effort'; cutMods={cardio:6,durability:4}; }
  else if(effPct<=8){ cutTier='facile'; }
  else if(effPct<=13){ cutTier='normal'; }
  else if(effPct<=18){ cutTier='complique'; cutMods={cardio:-12,strength:-10,durability:-8,chin:-12}; }
  else { cutTier='impossible'; }
  G.fight.cutResult={tier:cutTier,effPct,kg:wc.cutKg,walk:wc.walk,limit:wc.limit};
  if(cutTier==='impossible'){
    G.f.botchedWeightCuts=(G.f.botchedWeightCuts||0)+1;
    G.f.form=clamp(G.f.form-15,0,100); G.f.morale=clamp(G.f.morale-12,0,100);
    if(G.f.botchedWeightCuts>=3 && !isTopDivision){
      const divs=DIVISIONS[G.f.gender]; const curIdx=divs.findIndex(d=>d.id===G.f.div); const nextDiv=divs[curIdx+1];
      if(nextDiv){
        G.f.div=nextDiv.id; G.f.divName=nextDiv.name; G.f.botchedWeightCuts=0;
        // Purge du statut dans l'ancienne division
        G.f.champion=null; G.f.titles=0; G.f.defenses=0; G.f.orgWins=0; G.f.rankBoost=0;
        // Purge du contexte relationnel et des objectifs croisés — une nouvelle
        // division, c'est un nouveau roster, les rivalités de l'ancienne n'ont
        // plus de sens.
        G.f.rivalId=null; G.f._rivalries={};
        if(G.f.gameMode==='faith') G.f.faithNemesisId=null;
        G.f.recentOpps=[];
        G.f.champChampOffer=null; G.f.champChampBelt=null; G.f.champChampBeltDivId=null; G.f.champChampLastOfferDefenses=null;
        // Ajustement biomécanique naturel : plus lourd, plus fort, plus résistant,
        // mais moins véloce — cohérent avec le changement de gabarit.
        G.f.attrs.strength=clamp((G.f.attrs.strength||50)+6,1,100);
        G.f.attrs.durability=clamp((G.f.attrs.durability||50)+4,1,100);
        G.f.attrs.footSpeed=clamp((G.f.attrs.footSpeed||50)-5,1,100);
        G.f.attrs.handSpeed=clamp((G.f.attrs.handSpeed||50)-4,1,100);
        G.f.overall=overall(G.f);
        G.f.orgElo=eloBaseline(G.f.org,G.f.overall);
        G.roster=makeOrgRoster(G.f);
        G.lastMsg=`Le corps dit stop. Le piège métabolique s\u2019est refermé : la commission vous interdit de redescendre. Vous êtes monté définitivement en ${G.f.divName}. Vos stats physiques se sont adaptées à votre nouveau gabarit.`;
      }
      else G.lastMsg='Pesée ratée. Le combat est annulé.';
      G.screen=G.faith?'faith_hub':'hub'; save(); render(); return; // 3e coupe ratée : conséquence déjà tranchée plus haut
    }
    // ==== [ANCRE: CORRECTIF_CATCHWEIGHT_PLAFOND] — item demandé : plafond
    // strict à 1,3kg (3lbs) — au-delà, l'organisation refuse systématiquement
    // le combat en catchweight (plus de tirage probabiliste 55%/15% au-delà
    // de ce seuil, remplacé par un rejet automatique). En dessous de 1,3kg,
    // le comportement gradué existant (90% d'acceptation, pénalité 20-30%)
    // est conservé tel quel.
    const missedBy=rnd()<0.05?+(1.6+rnd()*2.9).toFixed(1):+(0.1+rnd()*1.2).toFixed(1);
    const withinLimit=missedBy<=1.3;
    const acceptChance=withinLimit?0.90:0, penaltyPct=withinLimit?RI(20,30):0;
    const willAccept=withinLimit && rnd()<acceptChance;
    if(willAccept){
      G.fight.cutResult.catchweightPenaltyPct=penaltyPct;
      G.activeEvent={
        title:'Pesée ratée (Catchweight)',
        text:`Catastrophe sur la balance : vous êtes à ${missedBy}kg au-dessus de la limite (${wc.limit}kg). Le combat devait être annulé, mais ${esc(opp.name)} accepte de maintenir l\u2019affrontement si vous lui cédez ${penaltyPct}% de votre bourse. Vos capacités physiques seront fortement réduites ce soir.`,
        btn:'Accepter l\u2019amende et combattre', actionId:'botched_weight_accept',
        btn2:'Annuler le combat', actionId2:'botched_weight_decline'
      };
      G.screen='event'; save(); render(); return;
    }
    G.activeEvent={
      title:'Pesée ratée (Annulation)',
      text:`Catastrophe sur la balance : ${missedBy}kg au-dessus de la limite (${wc.limit}kg). ${withinLimit?esc(opp.name)+' refuse catégoriquement ce désavantage.':'L\u2019écart dépasse le plafond de 1,3kg toléré en catchweight — la commission refuse net.'} Le combat est annulé sur-le-champ.`,
      btn:'Encaisser l\u2019humiliation', actionId:'botched_weight_decline'
    };
    G.screen='event'; save(); render(); return;
  }
  if(cutMods) G.fight.malus=Object.assign({},G.fight.malus,cutMods);
  // ==== [ANCRE: ADVERSAIRE_SURPOIDS] — l'inverse du catchweight joueur : c'est
  // l'adversaire qui rate sa pesée. Ici pas de tirage aléatoire côté adversaire :
  // c'est le JOUEUR qui choisit d'accepter (l'adversaire plus lourd gagne un vrai
  // bonus mécanique) ou de refuser (combat annulé).
  // ==== [ANCRE: CORRECTIF_SURPOIDS_ADVERSAIRE_SYMETRIE] — item demandé : même
  // plafond strict de 1,3kg que côté joueur (CORRECTIF_CATCHWEIGHT_PLAFOND) —
  // au-delà, la commission annule directement au lieu de proposer un choix.
  // Fréquence aussi réduite (10% → 5%), jugée trop élevée par le joueur.
  if(rnd()<0.05){
    const oppOverKg=+(RI(0,3)+rnd()).toFixed(1);
    if(oppOverKg>1.3){
      G.activeEvent={
        title:'L\u2019adversaire a raté sa pesée',
        text:`${esc(opp.name)} se présente ${oppOverKg}kg au-dessus de la limite — bien au-delà du plafond de 1,3kg toléré en catchweight. La commission annule le combat sur-le-champ, un remplaçant est cherché.`,
        btn:'Encaisser la nouvelle', actionId:'opp_overweight_decline'
      };
      G.screen='event'; save(); render(); return;
    }
    G.activeEvent={
      title:'L\u2019adversaire a raté sa pesée',
      text:`${esc(opp.name)} se présente ${oppOverKg}kg au-dessus de la limite. L\u2019organisation vous laisse décider : accepter le combat en catchweight (il combattra avec un vrai avantage de gabarit) ou le refuser (combat annulé, un remplaçant est cherché).`,
      btn:'Accepter le catchweight', actionId:'opp_overweight_accept',
      btn2:'Refuser le combat', actionId2:'opp_overweight_decline'
    };
    G.screen='event'; save(); render(); return;
  }
  // ==== [FIN ANCRE] ====
  if(rnd()<0.08){ generateRandomEvent(); G.screen='event'; save(); render(); }
  else { proceedToFight(); }
}
function proceedToFight(){
  const opp=G.fight.opp, kind=G.fight.kind;
  // Face-à-face / pesée (Faith uniquement — la Carrière Complète a déjà son
  // propre événement de pesée ratée dans chooseOpponent(), pas besoin d'un
  // deuxième rituel de pesée qui ferait doublon).
  if(G.faith && !G.fight._faceoffDone){
    G.fight._faceoffDone=true;
    const isRanked=divRank(opp)<=15 && (opp.W+opp.L+(opp.D||0))>0;
    if(kind==='title' || kind==='defense' || (isRanked && rnd()<0.40)){
      const scenarios=[
        {title:'Pesée : le coup de pression',
         text:`Sous les flashs des journalistes, ${esc(opp.name)} s\u2019approche front contre front et vous pousse violemment au niveau du torse. L\u2019arène retient son souffle.`,
         btn:'Sourire avec un sang-froid glacial',actionId:'faceoff_smile',
         btn2:'Le repousser avec agressivité',actionId2:'faceoff_shove'},
        {title:'Pesée : guerre verbale',
         text:`Lors du face-à-face, ${esc(opp.name)} commence à vous insulter à voix basse, ciblant directement votre entourage et votre dernier camp d\u2019entraînement.`,
         btn:'L\u2019ignorer royalement',actionId:'faceoff_ignore',
         btn2:'Répondre du tac au tac',actionId2:'faceoff_talkback'}
      ];
      G.activeEvent=pick(scenarios);
      G.screen='event'; save(); render();
      return;
    }
  }
  G.screen='plan'; save(); render();
}
/* ==== [ANCRE: RENDU_EFFETS_EVENEMENT] — affichage uniforme des effets d'un
   événement de carrière : malus temporaires (combat en cours) en rouge,
   effets persistants (Moral/Forme/argent) en vert ou rouge selon le signe,
   attributs toujours ramenés à l'échelle /20 affichée partout ailleurs dans
   le jeu (division par 5, jamais 0 pour un effet réellement appliqué). ====*/
function renderEventEffects(fx){
  if(!fx) return '';
  const chips=[];
  const chip=(txt,positive)=>`<span class="tag2" style="border-color:${positive?'var(--win)':'var(--loss)'};color:${positive?'var(--win)':'var(--loss)'}">${txt}</span>`;
  if(fx.malus){ Object.entries(fx.malus).forEach(([k,v])=>{ if(!v) return;
    const shown=Math.sign(v)*Math.max(1,Math.round(Math.abs(v)/5));
    chips.push(chip(`${shown} ${attrLabel(k)} (ce combat)`,shown>=0)); }); }
  if(fx.bonusAttrs){ Object.entries(fx.bonusAttrs).forEach(([k,v])=>{ if(!v) return;
    const shown=Math.sign(v)*Math.max(1,Math.round(Math.abs(v)/5));
    chips.push(chip(`${shown>=0?'+':''}${shown} ${attrLabel(k)} (ce combat)`,shown>=0)); }); }
  if(fx.moraleDelta){ const shown=Math.sign(fx.moraleDelta)*Math.max(1,Math.round(Math.abs(fx.moraleDelta)/5));
    chips.push(chip(`${shown>=0?'+':''}${shown} Moral`,shown>=0)); }
  if(fx.formDelta){ const shown=Math.sign(fx.formDelta)*Math.max(1,Math.round(Math.abs(fx.formDelta)/5));
    chips.push(chip(`${shown>=0?'+':''}${shown} Forme`,shown>=0)); }
  if(fx.money){ chips.push(chip(`${fx.money>=0?'+':''}${formatArgent(fx.money)}`,fx.money>=0)); }
  return chips.length?`<div class="tagrow mt" style="position:relative;z-index:2">${chips.join('')}</div>`:'';
}
/* ==== [ANCRE: EVENEMENT] — blessures/coupe de poids, disruptif façon Destiny Eleven.
   H-heavy (poids lourd) et F-feather (poids plume) sont les catégories les PLUS
   HAUTES de leur genre (pas les plus petites) : la condition sert à empêcher
   toute tentative de "monter de catégorie" pour un combattant déjà au sommet,
   faute de catégorie supérieure où l'envoyer. ==== */
function generateRandomEvent(){ const f=G.f;
  const isTopDivision=(f.div==='H-heavy' || f.div==='F-feather');
  // ==== [ANCRE: POOL_EVENEMENTS_ELARGI] — pool élargi (item demandé : les
  // événements revenaient trop souvent) : ajout de 7 nouveaux scénarios
  // (positifs, mixtes et négatifs) répartis sur les mêmes conditions
  // d'éligibilité que l'existant, sans rien retirer.
  let pool=['minor_injury','minor_injury','training_partner_hurt','old_injury_flareup',
    'sparring_breakthrough','bad_camp_conditions','rival_trashtalk','motivational_speech'];
  if(rnd()<0.25) pool.push('major_injury');
  if(f.W+f.L+(f.D||0)>=3) pool.push('hometown_crowd');
  if((f.streak||0)>=2) pool.push('super_fan_boost');
  // ==== [ANCRE: EVENEMENTS_ARGENT] — dilemmes financiers, réservés aux pros ====
  if(f.org>0){
    pool.push('media_chaos','social_media_storm');
    if(f.org>=2) pool.push('coaching_change');
    if(f.org>=3) pool.push('streaming_deal');
    // ==== [ANCRE: CORRECTIF_BOSS_UNIMPRESSED] — avant : se déclenchait au
    // hasard dès org>=3, y compris au tout premier combat après une finition
    // (illogique : "vos victoires aux points m'endorment" sans qu'aucune
    // victoire aux points n'ait jamais eu lieu). Exige désormais un vrai
    // historique récent de victoires par décision (au moins 2 des 3
    // dernières victoires), preuve concrète du reproche formulé.
    if(f.org>=3 && !f.bossUnimpressed && f.history && f.history.length>=3){
      const recentWins=f.history.slice(-5).filter(h=>h.res==='win');
      const decisionWins=recentWins.filter(h=>isDecisionLike(h.method));
      if(recentWins.length>=3 && decisionWins.length>=2) pool.push('boss_unimpressed');
    }
    if(f.org>=5) pool.push('sponsor_clash','short_notice_money');
    if(f.org===4) pool.push('sell_out_fight');
    if((f.earnings||0)>=20) pool.push('training_camp_upgrade');
  }
  // ==== [FIN ANCRE] ====
  if((typeof checkMueMartialeEligibility==='function') && checkMueMartialeEligibility(f) && !f._mueOffered){ pool.push('mue_martiale'); }
  // ==== [ANCRE: EVENEMENTS_DYNAMIQUES] — événements conditionnels basés sur l'état
  // réel du combattant (âge/récupération, hype précoce, difficultés financières),
  // plutôt qu'un tirage uniforme déconnecté du profil. ====
  const DYNAMIC_EVENTS=[
    {id:'dyn_aging',req:f=>f.age>=35&&f.attrs.recovery<60,title:'Réveil douloureux',text:`À ${f.age} ans, la récupération n\u2019est plus la même. Vos vieilles blessures dictent l\u2019intensité du camp.`,malus:{recovery:-5,form:-10}},
    {id:'dyn_prospect',req:f=>f.age<=22&&(f.streak||0)>=3,title:'Excès de confiance',text:'La presse vous encense comme le prodige de l\u2019année. Vous avez séché deux séances pour des interviews.',malus:{discipline:-10,form:-5},bonus:{morale:15}},
    {id:'dyn_broke',req:f=>f.org>0&&(f.earnings||0)<15,title:'Fins de mois difficiles',text:'Vos finances sont dans le rouge. L\u2019angoisse de ne pas pouvoir payer votre manager parasite votre concentration.',malus:{focus:-15,composure:-10}}
  ];
  DYNAMIC_EVENTS.filter(e=>e.req(f)).forEach(e=>pool.push(e.id));
  // ==== [FIN ANCRE] ====
  const type=pick(pool);
  let title='', text='', btn='Continuer', actionId=type, fx=null;
  const dynMatch=DYNAMIC_EVENTS.find(e=>e.id===type);
  if(dynMatch){
    title=dynMatch.title; text=dynMatch.text;
    fx={malus:dynMatch.malus};
    if(dynMatch.malus) G.fight.malus=Object.assign({},G.fight.malus,dynMatch.malus);
    if(dynMatch.malus && dynMatch.malus.form){ fx.formDelta=dynMatch.malus.form; delete fx.malus.form; }
    if(dynMatch.bonus && dynMatch.bonus.morale){ f.morale=clamp(f.morale+dynMatch.bonus.morale,0,100); fx.moraleDelta=dynMatch.bonus.morale; }
  } else if(type==='mue_martiale'){
    f._mueOffered=true;
    title='Remise en question'; actionId='mue_martiale';
    text=`${f.name} traverse une crise sportive profonde. Un vieux coach propose une refonte complète de l\u2019approche technique — une Mue Martiale. Cela coûtera un cycle de combat complet, mais pourrait relancer la carrière sous un jour nouveau.`;
    btn='Envisager la reconversion';
    G.screen='event'; G.activeEvent={title,text,btn,actionId,btn2:'Refuser, rester fidèle à son style',actionId2:'mue_martiale_decline'}; return;
  }
  if(type==='minor_injury'){
    title='Pépin physique';
    text='Mauvaise torsion du genou lors du dernier sparring. Rien qui n\u2019empêche de combattre, mais vous allez le sentir dans l\u2019octogone.';
    G.fight.malus={footSpeed:-15,explosiveness:-12}; fx={malus:{footSpeed:-15,explosiveness:-12}};
  } else if(type==='major_injury'){
    title='Déchirure !';
    text='Sur un appui anodin à l\u2019entraînement, un claquement sourd. Le médecin est catégorique : combat annulé, et plusieurs mois de rééducation.';
    btn='Accepter le sort';
  } else if(type==='training_partner_hurt'){
    title='Partenaire d\u2019entraînement blessé';
    text='Ton partenaire de sparring principal se blesse à dix jours du combat. Impossible de reproduire son style à temps, la préparation en pâtit.';
    G.fight.malus={fightIQ:-10,adaptability:-8}; fx={malus:{fightIQ:-10,adaptability:-8}};
  } else if(type==='old_injury_flareup'){
    title='Vieille blessure qui se réveille';
    text='Cette épaule que tu t\u2019es abîmée il y a des années recommence à te lâcher pendant les derniers rounds de sparring. Rien de cassé, mais la confiance en prend un coup.';
    G.fight.malus={durability:-10,confidence:-8}; fx={malus:{durability:-10,confidence:-8}};
  } else if(type==='hometown_crowd'){
    title='Retour au pays';
    text='Le combat se tient près de chez toi. Ta famille, tes potes de toujours, la salle qui t\u2019a vu débuter : tout le monde sera là ce soir.';
    f.morale=clamp(f.morale+15,0,100); f.form=clamp(f.form+8,0,100);
    fx={moraleDelta:15,formDelta:8};
  } else if(type==='sparring_breakthrough'){
    title='Déclic à l\u2019entraînement';
    text='Un détail technique répété cent fois finit par cliquer en plein sparring. Le coach n\u2019en revient pas : quelque chose vient de changer dans ta lecture du combat.';
    // G.fight.malus est le SEUL canal lu par resolveFight() pour les effets
    // temporaires de combat (voir ui.js ~L2077) — malgré son nom, il accepte
    // aussi bien des valeurs positives (comme ici) que négatives.
    G.fight.malus=Object.assign({},G.fight.malus,{fightIQ:8}); f.morale=clamp(f.morale+10,0,100);
    fx={bonusAttrs:{fightIQ:8},moraleDelta:10};
  } else if(type==='bad_camp_conditions'){
    title='Camp d\u2019entraînement chaotique';
    text='Salle surchauffée, partenaires indisponibles, matériel défaillant : ce camp n\u2019a pas ressemblé aux précédents, et ça se sent dans les jambes.';
    f.form=clamp(f.form-12,0,100);
    fx={formDelta:-12};
  } else if(type==='rival_trashtalk'){
    title='Provocation publique';
    text='Ton adversaire multiplie les déclarations mordantes en conférence de presse. Ça te met dans un état d\u2019esprit combatif, mais un peu trop nerveux pour ce soir.';
    G.fight.malus={composure:-10}; f.morale=clamp(f.morale+8,0,100);
    fx={malus:{composure:-10},moraleDelta:8};
  } else if(type==='motivational_speech'){
    title='Discours du coach';
    text='La veille du combat, ton coach prend dix minutes pour te rappeler pourquoi tu es là. Simple, direct, efficace.';
    f.morale=clamp(f.morale+12,0,100);
    fx={moraleDelta:12};
  } else if(type==='super_fan_boost'){
    title='La série fait parler';
    text='Ta série de victoires commence à faire du bruit. Les réseaux s\u2019enflamment, le public te porte.';
    f.morale=clamp(f.morale+18,0,100); f.hypeBonus=Math.min(2,(f.hypeBonus||1)+0.05);
    fx={moraleDelta:18};
  } else if(type==='media_chaos'){
    title='Conférence de presse chaotique';
    text='La conférence de presse dégénère en foire d\u2019empoigne verbale avec ton adversaire. Les caméras adorent ça, ton mental un peu moins.';
    G.fight.malus={composure:-15};
    f.morale=clamp(f.morale+10,0,100);
    fx={malus:{composure:-15},moraleDelta:10};
  } else if(type==='social_media_storm'){
    title='Bad buzz';
    text='Une déclaration mal interprétée s\u2019est transformée en polémique en ligne. Impossible d\u2019y échapper, même en camp fermé.';
    f.morale=clamp(f.morale-15,0,100);
    fx={moraleDelta:-15};
  } else if(type==='coaching_change'){
    title='Changement de coach';
    text='Ton entraîneur principal part accompagner un autre combattant à dix jours du combat. Tu dois t\u2019adapter à une nouvelle voix dans le coin.';
    G.fight.malus={adaptability:-12,composure:-8}; fx={malus:{adaptability:-12,composure:-8}};
  } else if(type==='streaming_deal'){
    title='Contrat de streaming exclusif';
    text='Une plateforme de streaming te propose un salaire supplémentaire pour une exclusivité média, contre un calendrier de déplacements épuisant avant le combat.';
    f.earnings=(f.earnings||0)+80; f.form=clamp(f.form-10,0,100);
    fx={money:80,formDelta:-10};
  } else if(type==='training_camp_upgrade'){
    title='Stage de préparation premium';
    text='Un centre haute performance te propose un stage intensif de dix jours, tout confort, contre une partie de ta bourse à venir.';
    f.earnings=Math.max(0,(f.earnings||0)-20); f.form=clamp(f.form+15,0,100);
    fx={money:-20,formDelta:15};
  } else if(type==='short_notice_money'){
    title='Sauver la carte (Short Notice)';
    // ==== [ANCRE: CORRECTIF_SHORT_NOTICE] — avant : l'adversaire était
    // échangé et les effets appliqués AUTOMATIQUEMENT, sans que le joueur
    // puisse voir contre qui il se retrouvait ni refuser. Corrigé : aperçu
    // complet de l'adversaire de remplacement + vrai choix accepter/refuser
    // (traité dans handleEvent). Prime également réduite de moitié (500k$
    // → 250k$), jugée excessive pour un simple remplacement de dernière
    // minute.
    const oldOppName=G.fight.opp.name;
    const swapPool=G.roster.filter(o=>o.id!==f.id && o.id!==G.fight.opp.id);
    const newOpp=swapPool.length?pick(swapPool):G.fight.opp;
    G._pendingShortNoticeOpp=newOpp;
    const oppFights=newOpp.W+newOpp.L+(newOpp.D||0);
    text=`${esc(oldOppName)} se blesse et se retire du main-event. L\u2019organisation vous supplie de sauver la carte contre <b>${esc(newOpp.name)} ${newOpp.flag||''}</b> avec seulement 4 jours de préparation.`;
    const previewHtml=`<div class="card mt" style="background:var(--bg);padding:10px;border-left:3px solid var(--gold)">
      <div class="mono small"><b>${esc(newOpp.name)}</b> — ${newOpp.styleLabel||newOpp.style} · ${newOpp.W}-${newOpp.L}${newOpp.D?`-${newOpp.D}`:''} · OVR ${newOpp.overall||'?'} <span class="muted">(${oppFights} combat(s) pro)</span></div>
      <div class="muted small mt">${tacticalRead(f,newOpp)}</div>
    </div>`;
    // Rien n'est appliqué tant que le joueur n'a pas choisi — le malus/forme/
    // argent ci-dessous ne sont qu'un APERÇU (voir handleEvent pour l'application réelle).
    const shortNoticeEffectsHtml=previewHtml+renderEventEffects({malus:{cardio:-25},formDelta:-30,money:250});
    btn='Accepter le remplacement'; actionId='short_notice_accept';
    // ==== [CORRECTIF LINT] — bug trouvé par ESLint (no-undef) : btn2/actionId2
    // n'étaient jamais déclarés (absents du `let title='',...` en tête de
    // fonction), contrairement à tous les autres usages du fichier qui les
    // passent en clés d'objet directes. En mode strict, cette affectation à
    // une variable non déclarée provoque un plantage (ReferenceError) —
    // c'était donc un vrai crash potentiel à chaque tirage de cet événement,
    // pas juste un avertissement cosmétique.
    G.activeEvent={title,text,btn,actionId,btn2:'Refuser, garder le combat prévu',actionId2:'short_notice_decline',effectsHtml:shortNoticeEffectsHtml}; return;
  } else if(type==='boss_unimpressed'){
    title='Le patron n\u2019est pas impressionné';
    text='Le président de l\u2019organisation vous convoque : "Vos victoires aux points m\u2019endorment. Le public veut du spectacle." Tant que vous gagnerez sans finir vos adversaires, votre progression au classement restera freinée — une finition (KO ou soumission) effacera immédiatement cette pénalité.';
    f.bossUnimpressed=3;
  } else if(type==='sponsor_clash'){
    title='Guerre de Sponsors';
    text='Vous avez porté les couleurs d\u2019un sponsor concurrent lors de la pesée. L\u2019organisation vous met à l\u2019amende mais votre aura auprès des fans rebelles explose.';
    f.earnings=Math.max(0,(f.earnings||0)-150);
    f.morale=clamp(f.morale+20,0,100);
    fx={money:-150,moraleDelta:20};
  } else if(type==='sell_out_fight'){
    title='Combat Arrangé ?';
    text='Un bookmaker véreux vous offre une forte somme pour perdre le premier round volontairement avant de reprendre le combat. Accepter vous draine mentalement et ruine votre concentration.';
    f.earnings=(f.earnings||0)+200;
    G.fight.malus={composure:-20};
    f.morale=clamp(f.morale-15,0,100);
    fx={malus:{composure:-20},moraleDelta:-15,money:200};
  }
  const effectsHtml=renderEventEffects(fx);
  G.activeEvent={title,text,btn,actionId,effectsHtml};
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: SAISON] — moteur de bilan annuel + 70 trophées (audit §12).
   Corrigé par rapport au brouillon de Gemini : la vraie structure de combat
   est res.stats.A/res.stats.B (pas st.Me/st.Op) — remappée ici une seule fois
   à l'enregistrement pour que les 70 conditions restent lisibles telles
   quelles. Le rythme de vieillissement est de 1 à 3 combats/an (moyenne 2),
   cycle fixe de 3 combats comme le supposait Gemini — la fin de saison est
   accrochée au vrai cycle existant, sans le remplacer. ==== */
function compileSeasonStats(f, fights){
  let s={ total:fights.length, W:0, L:0, koW:0, subW:0, decW:0, koL:0, subL:0, decL:0,
    sigMe:0, sigOp:0, tdMe:0, tdOp:0, ctrlMe:0, ctrlOp:0, kdMe:0, kdOp:0,
    biggestUpset:0, highestOppRank:999, titleWins:0, r1KOs:0, closeFights:0, wars:0, flawless:0 };
  fights.forEach(ft=>{
    if(ft.win){ s.W++;
      if(ft.method.startsWith('KO')){ s.koW++; if(ft.round===1)s.r1KOs++; }
      else if(ft.method.startsWith('Soum')) s.subW++;
      else s.decW++;
      if(ft.oppRank<s.highestOppRank) s.highestOppRank=ft.oppRank;
      if(ft.myRank-ft.oppRank>s.biggestUpset) s.biggestUpset=ft.myRank-ft.oppRank;
      if(ft.isTitle) s.titleWins++;
      if(ft.st.Op.sig===0 && ft.st.Op.td===0) s.flawless++;
    } else { s.L++;
      if(ft.method.startsWith('KO')) s.koL++;
      else if(ft.method.startsWith('Soum')) s.subL++;
      else s.decL++;
    }
    s.sigMe+=ft.st.Me.sig||0; s.sigOp+=ft.st.Op.sig||0;
    s.tdMe+=ft.st.Me.td||0; s.tdOp+=ft.st.Op.td||0;
    s.ctrlMe+=ft.st.Me.ctrl||0; s.ctrlOp+=ft.st.Op.ctrl||0;
    s.kdMe+=ft.st.Me.kd||0; s.kdOp+=ft.st.Op.kd||0;
    const totalSig=(ft.st.Me.sig||0)+(ft.st.Op.sig||0);
    if(totalSig>60 || ft.st.Me.kd+ft.st.Op.kd>=2) s.wars++;
    if(isDecisionLike(ft.method) && Math.abs((ft.scoreA||0)-(ft.scoreB||0))<=5) s.closeFights++;
  });
  return s;
}
const SVG = {
  glove: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 6l-6 6M7 17l-4 4M21 3l-4 4M8 12a4 4 0 0 0-4 4c0 2 2 4 4 4s4-2 4-4a4 4 0 0 0-4-4zM16 4a4 4 0 0 0-4 4c0 2 2 4 4 4s4-2 4-4a4 4 0 0 0-4-4z"/></svg>`,
  pro: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  medal: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`,
  crown: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="2 4 5 16 12 22 19 16 22 4 17 9 12 4 7 9 2 4"/></svg>`,
  fire: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
  ko: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  sub: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>`,
  skill: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  dna: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3c0 4 12 4 12 8s-12 4-12 8M18 3c0 4-12 4-12 8s12 4 12 8"/></svg>`,
  skull: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M8 20v2h8v-2"/><path d="M12.5 17l-.5-1-.5 1h1z"/><path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20"/></svg>`,
  web: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M4.9 19.1l14.2-14.2"/></svg>`,
  diamond: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3h12l4 6-10 13L2 9Z"/></svg>`,
  goat: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/><circle cx="12" cy="11" r="3"/></svg>`,
  veteran: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  star: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  hammer: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 4l-4 4M21.5 2.5a2.12 2.12 0 0 0-3 0L3 18l3 3 15.5-15.5a2.12 2.12 0 0 0 0-3z"/></svg>`,
  /* ==== [ANCRE: ICONES_SUCCES_UNIQUES] — jeu d'icônes additionnel pour que
     chaque succès (ACH) ait un pictogramme distinct, sans doublon. ==== */
  trophy: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4z"/><path d="M7 5H4a1 1 0 0 0-1 1v1a4 4 0 0 0 4 4M17 5h3a1 1 0 0 1 1 1v1a4 4 0 0 1-4 4"/></svg>`,
  shield: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5l8-3z"/></svg>`,
  flag: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 3v18M5 4h13l-3 4 3 4H5"/></svg>`,
  compass: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16 8 14 14 8 16 10 10 16 8"/></svg>`,
  gem: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8l4-5h10l4 5-9 13z"/><path d="M3 8h18M9 3l3 5 3-5M7 8l5 13 5-13"/></svg>`,
  mask: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 8c0-3 3-5 8-5s8 2 8 5-2 9-8 9-8-6-8-9z"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="9" r="1"/><path d="M9 13c1 1 5 1 6 0"/></svg>`,
  book: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  target: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>`,
  phoenix: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22V10M12 10c-4-1-7-5-6-10 3 1 6 4 6 8 0-4 3-7 6-8 1 5-2 9-6 10z"/></svg>`,
  hourglass: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2h12v4l-6 6 6 6v4H6v-4l6-6-6-6V2z"/></svg>`,
  infinity: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 12c0-2.2 1.8-4 4-4 3 0 3 8 6 8 2.2 0 4-1.8 4-4s-1.8-4-4-4c-3 0-3 8-6 8-2.2 0-4-1.8-4-4z"/></svg>`,
  coin: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9 9.5c0-1.5 1.3-2.5 3-2.5s3 1 3 2.2c0 3-6 1.5-6 4.5 0 1.4 1.3 2.3 3 2.3s3-1 3-2.5"/></svg>`,
  axe: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 3c4 0 7 3 7 7l-3 3c-4 0-7-3-7-7l3-3z"/><path d="M12 12l7 7-2 2-7-7"/></svg>`,
  circuit: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="7" y="7" width="10" height="10" rx="1"/><path d="M7 3v4M17 3v4M7 17v4M17 17v4M3 7h4M17 7h4M3 17h4M17 17h4"/></svg>`
};

const SEASON_AWARDS=[
  // --- PRESTIGE (10) ---
  {id:'a1',lbl:'Combattant de l\u2019année',ico:SVG.crown,c:(s,f)=>s.W>=3&&s.L===0&&s.titleWins>0},
  {id:'a2',lbl:'Prospect de l\u2019année',ico:SVG.star,c:(s,f)=>s.W>=3&&s.L===0&&f.age<=23&&!f.champion},
  {id:'a3',lbl:'Vétéran de l\u2019année',ico:SVG.veteran,c:(s,f)=>s.W>=2&&f.age>=34},
  {id:'a4',lbl:'Comeback de l\u2019année',ico:SVG.fire,c:(s,f)=>s.W>=2&&(f.streak||0)===2&&f.history.length>5&&f.L>0},
  {id:'a5',lbl:'Combat de l\u2019année',ico:SVG.glove,c:(s,f)=>s.wars>=1},
  {id:'a6',lbl:'Performance de l\u2019année',ico:SVG.diamond,c:(s,f)=>s.biggestUpset>=5&&s.koW+s.subW>0},
  {id:'a7',lbl:'KO de l\u2019année',ico:SVG.ko,c:(s,f)=>s.r1KOs>=1&&s.kdMe>=2},
  {id:'a8',lbl:'Soumission de l\u2019année',ico:SVG.sub,c:(s,f)=>s.subW>=1&&s.biggestUpset>=3},
  {id:'a9',lbl:'Le Chouchou du Public',ico:SVG.medal,c:(s,f)=>s.total>=3&&s.wars>=2},
  {id:'a10',lbl:'Saison Parfaite',ico:SVG.skull,c:(s,f)=>s.total>=3&&s.W===s.total&&s.koW+s.subW===s.total},
  // --- STRIKING & DÉGÂTS (20) ---
  {id:'a11',ico:SVG.hammer,lbl:'La Mitrailleuse',c:(s,f)=>s.sigMe>=120},
  {id:'a12',ico:SVG.ko,lbl:'Le Sniper',c:(s,f)=>s.koW>=2&&s.sigMe<=40},
  {id:'a13',ico:SVG.hammer,lbl:'Le Marteau',c:(s,f)=>s.kdMe>=3},
  {id:'a14',ico:SVG.fire,lbl:'Tête Brûlée',c:(s,f)=>s.sigMe>80&&s.sigOp>80},
  {id:'a15',ico:SVG.skull,lbl:'Bain de Sang',c:(s,f)=>s.sigMe+s.sigOp>=180},
  {id:'a16',ico:SVG.veteran,lbl:'Menton d\u2019Acier',c:(s,f)=>s.sigOp>=100&&s.koL===0},
  {id:'a17',ico:SVG.star,lbl:'Intouchable',c:(s,f)=>s.W>=2&&s.sigOp<=15},
  {id:'a18',ico:SVG.ko,lbl:'One-Punch Man',c:(s,f)=>s.r1KOs>=2},
  {id:'a19',ico:SVG.ko,lbl:'Puncheur de l\u2019année',c:(s,f)=>s.koW>=2},
  {id:'a20',ico:SVG.fire,lbl:'Guerre d\u2019Usure',c:(s,f)=>s.decW>=2&&s.sigMe>=90},
  {id:'a21',ico:SVG.fire,lbl:'Brawler',c:(s,f)=>s.sigMe>50&&s.sigOp>50&&s.koW>=1},
  {id:'a22',ico:SVG.hammer,lbl:'L\u2019Exécuteur',c:(s,f)=>s.kdMe>=4},
  {id:'a23',ico:SVG.skull,lbl:'Mâchoire de Verre',c:(s,f)=>s.koL>=2},
  {id:'a24',ico:SVG.ko,lbl:'Chasseur de Foie',c:(s,f)=>s.koW>=1&&f.style==='kickboxer'},
  {id:'a25',ico:SVG.ko,lbl:'Coudes Rasoirs',c:(s,f)=>s.koW>=1&&f.style==='muayThai'},
  {id:'a26',ico:SVG.diamond,lbl:'Le Chirurgien',c:(s,f)=>s.sigMe>=60&&s.sigOp<=20},
  {id:'a27',ico:SVG.ko,lbl:'Blitzkrieg',c:(s,f)=>s.r1KOs>=1&&f.style==='karate'},
  {id:'a28',ico:SVG.skull,lbl:'Casting Mortel',c:(s,f)=>s.koW>=1&&f.style==='sambo'},
  {id:'a29',ico:SVG.fire,lbl:'Dirty Boxer',c:(s,f)=>s.sigMe>=70&&s.ctrlMe>0},
  {id:'a30',ico:SVG.hammer,lbl:'Main Lourde',c:(s,f)=>s.koW>=1&&f.attrs.power>=80},
  // --- GRAPPLING & CONTRÔLE (20) ---
  {id:'a31',ico:SVG.web,lbl:'La Sangsue',c:(s,f)=>s.ctrlMe>=6},
  {id:'a32',ico:SVG.skill,lbl:'Machine à Takedowns',c:(s,f)=>s.tdMe>=8},
  {id:'a33',ico:SVG.hammer,lbl:'Le Destructeur au Sol',c:(s,f)=>s.koW>=1&&s.ctrlMe>=2},
  {id:'a34',ico:SVG.sub,lbl:'L\u2019Étau',c:(s,f)=>s.subW>=2},
  {id:'a35',ico:SVG.veteran,lbl:'Mur de Briques',c:(s,f)=>s.tdOp===0&&s.W>=2&&f.attrs.tdd>=80},
  {id:'a36',ico:SVG.web,lbl:'Grappler de l\u2019année',c:(s,f)=>s.subW>=1&&s.tdMe>=4},
  {id:'a37',ico:SVG.skill,lbl:'Suplex City',c:(s,f)=>s.tdMe>=5&&f.style==='wrestler'},
  {id:'a38',ico:SVG.goat,lbl:'Artiste de la Fuite',c:(s,f)=>s.ctrlOp>=4&&s.subL===0&&s.W>=1},
  {id:'a39',ico:SVG.sub,lbl:'Anaconda',c:(s,f)=>s.subW>=1&&f.style==='bjj'},
  {id:'a40',ico:SVG.diamond,lbl:'Tireur d\u2019Élite (Sol)',c:(s,f)=>s.subW>=1&&s.ctrlMe<=1},
  {id:'a41',ico:SVG.web,lbl:'Le Compresseur',c:(s,f)=>s.ctrlMe>=8},
  {id:'a42',ico:SVG.skill,lbl:'Pression Daghestanaise',c:(s,f)=>s.tdMe>=4&&s.ctrlMe>=5},
  {id:'a43',ico:SVG.sub,lbl:'Le Voleur de Jambes',c:(s,f)=>s.subW>=1&&s.tdMe===0},
  {id:'a44',ico:SVG.skill,lbl:'Roi du Scramble',c:(s,f)=>s.tdMe>=3&&s.tdOp>=3},
  {id:'a45',ico:SVG.veteran,lbl:'Anti-Lutte',c:(s,f)=>s.tdOp===0&&s.sigMe>=50},
  {id:'a46',ico:SVG.web,lbl:'Sol Étouffant',c:(s,f)=>s.ctrlMe>=4&&s.sigOp<=10},
  {id:'a47',ico:SVG.sub,lbl:'Ceinture Noire',c:(s,f)=>s.subW>=2&&f.attrs.submission>=85},
  {id:'a48',ico:SVG.hammer,lbl:'Ground & Pounder',c:(s,f)=>s.koW>=1&&s.ctrlMe>=3},
  {id:'a49',ico:SVG.skill,lbl:'Lutte Universitaire',c:(s,f)=>s.tdMe>=6&&s.subW===0},
  {id:'a50',ico:SVG.skull,lbl:'L\u2019Enclume',c:(s,f)=>s.ctrlOp>=6&&s.L===s.total},
  // --- NARRATIF & CONTEXTE (20) ---
  {id:'a51',ico:SVG.star,lbl:'Upset de l\u2019année',c:(s,f)=>s.biggestUpset>=8},
  {id:'a52',ico:SVG.veteran,lbl:'Le Gatekeeper',c:(s,f)=>s.W>=1&&s.L>=1&&s.highestOppRank<=5&&!f.champion},
  {id:'a53',ico:SVG.medal,lbl:'Le Marathonien',c:(s,f)=>s.decW===s.total&&s.total>=3},
  {id:'a54',ico:SVG.diamond,lbl:'Hold-up',c:(s,f)=>s.decW>=1&&s.sigMe<s.sigOp&&s.ctrlMe<s.ctrlOp},
  {id:'a55',ico:SVG.crown,lbl:'Domination Totale',c:(s,f)=>s.flawless>=1},
  {id:'a56',ico:SVG.skull,lbl:'Le Bourreau des Favoris',c:(s,f)=>s.biggestUpset>=4&&s.koW>=1},
  {id:'a57',ico:SVG.medal,lbl:'Roi de la Décision',c:(s,f)=>s.decW>=2&&s.L===0},
  {id:'a58',ico:SVG.goat,lbl:'Tueur de Vétérans',c:(s,f)=>s.W>=2&&f.age<=25},
  {id:'a59',ico:SVG.veteran,lbl:'Garde du Temple',c:(s,f)=>s.L>=2&&s.highestOppRank>=10&&s.highestOppRank<999},
  {id:'a60',ico:SVG.diamond,lbl:'L\u2019Artisan',c:(s,f)=>s.W>=2&&s.sigMe<=60&&s.ctrlMe<=3},
  {id:'a61',ico:SVG.fire,lbl:'Hype Train',c:(s,f)=>s.W>=3&&f.streak>=5},
  {id:'a62',ico:SVG.skull,lbl:'Hype Déraillée',c:(s,f)=>s.L>=2&&f.streak<=-3},
  {id:'a63',ico:SVG.fire,lbl:'Vengeance',c:(s,f)=>s.W>=1&&s.closeFights>=1},
  {id:'a64',ico:SVG.goat,lbl:'Le Fantôme',c:(s,f)=>s.sigOp<=20&&s.L===0&&s.total>=2},
  {id:'a65',ico:SVG.star,lbl:'L\u2019Acrobate',c:(s,f)=>s.koW>=1&&f.attrs.flexibility>=80},
  {id:'a66',ico:SVG.veteran,lbl:'Le Survivant',c:(s,f)=>s.ctrlOp>=5&&s.sigOp>=50&&s.W>=1},
  {id:'a67',ico:SVG.diamond,lbl:'Sang Froid',c:(s,f)=>s.closeFights>=2&&s.W>=2},
  {id:'a68',ico:SVG.sub,lbl:'L\u2019Opportuniste',c:(s,f)=>s.subW>=1&&s.ctrlMe===0},
  {id:'a69',ico:SVG.medal,lbl:'Constance',c:(s,f)=>s.total>=3&&s.L===0&&s.decW>=2},
  {id:'a70',ico:SVG.skull,lbl:'Année Noire',c:(s,f)=>s.L===s.total&&s.total>=2},
];
function evaluateSeason(f,fights){ const s=compileSeasonStats(f,fights);
  let won=[]; SEASON_AWARDS.forEach(a=>{ if(a.c(s,f)) won.push(a); });
  return {stats:s, trophies:won.slice(0,5)};
}
/* ==== [FIN ANCRE] ==== */
