"use strict";
/* CAGE LEGACY — mgmt-corps.js
   ============================================================================
   MODE MANAGEMENT — le corps et la soirée : état physique caché (traumatisme
   0-100, récupération lente au repos avec une part acquise), dérivation sans rnd pour les niveau 1, profil
   de combat régénéré à l'identique (SEED sauvegardé puis restauré),
   couplage au moteur sans le modifier (simulateFight appelé, jamais édité),
   conséquences (blessures, suspensions, fin de carrière médicale), soirée
   calculée en une fois et trace rejouable de chaque combat (lot 3 T1 :
   l'instantané d'avant combat + l'état de la RNG, jamais le déroulé). Issu
   de mgmt-bureau.js, découpage de la dette
   CLAUDE.md §10 (ancre MGMT_LOT3A_CORPS, avec MGMT_LOT1_STYLE_STABLE
   imbriquée où elle est). Aucune voix, aucune réplique. Aucun accès DOM :
   le rendu vit dans mgmt-screens.js.

   Constantes évaluées au chargement : toutes littérales (MGMT_TRAUMA_MAX
   à MGMT_INJURY_KD) — aucune dépendance de chargement. Les fonctions
   dépendent au runtime de engine*.js (simulateFight, rollInjury, SEED,
   setSeed, makeFighter, num, clamp), ui-01-roster-matchmaking.js
   (correlatedRecord), mgmt-data.js (MGMT_EVENT_WEEKS, MGMT_BODY_THRESHOLD,
   MGMT_RAISONS), mgmt-bureau.js, mgmt-carte.js et mgmt-save.js.
   RNG : exclusivement la RNG à graine, jamais de tirage non seedé.
   ============================================================================ */

/* ==== [ANCRE: MGMT_LOT3A_CORPS] — Lot 3a le corps et la soirée : état
   physique caché (traumatisme 0-100, récupération lente au repos avec une
   part acquise), dérivation sans rnd pour les niveau 1, profil de combat
   régénéré à l'identique (SEED
   sauvegardé puis restauré), couplage au moteur sans le modifier
   (simulateFight appelé, jamais édité), conséquences (blessures,
   suspensions, fin de carrière médicale) et soirée calculée en une fois.
   Aucune voix, aucune réplique : là où Clara parlera (lot 3b), les écrans
   laissent l'emplacement vide. ==== */
const MGMT_TRAUMA_MAX=100;
const MGMT_TRAUMA_START_CAP=85;
const MGMT_KO_SHARE=26;
const MGMT_KO_TRAUMA=2;
const MGMT_TRAUMA_PERMANENT_SHARE=0.51;
const MGMT_TRAUMA_RECOVERY_PER_CYCLE=5;
const MGMT_CHIN_WEAR=0.55;
const MGMT_CHIN_FLOOR=0.35;
const MGMT_GAIN_CAP=45;
const MGMT_HEAD_SUSP=30;
const MGMT_INJURY_BASE=0.03;
const MGMT_INJURY_HEAD=0.004;
const MGMT_INJURY_TRAUMA=0.0015;
const MGMT_INJURY_KD=0.05;

/** Hachage stable FNV-1a 32 bits d'une chaîne : pur, ne consomme jamais
 *  rnd() — la dérivation du traumatisme n'avance pas la suite des tirages.
 *  @returns {number} entier non signé. */
function mgmtHashId(s){
  let h=0x811c9dc5;
  const str=String(s);
  for(let i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=Math.imul(h,0x01000193); }
  return h>>>0;
}

/** Traumatisme initial d'une ligne (CDC §3, niveau 1 sans combat : rien
 *  n'est stocké). Il est dérivé du bilan et d'un hachage de l'id : les KO
 *  passés restent estimés, mais leur trace cicatrisée ne vaut plus une
 *  blessure fraîche entière. L'âge relève du déclin, pas du traumatisme.
 *  Plafonné à 85 : personne ne commence retraité. Pur et déterministe.
 *  @returns {number} 0 à 100. */
function mgmtInitialTrauma(f){
  if(!f) return 0;
  const W=Number.isSafeInteger(f.W)?f.W:0, L=Number.isSafeInteger(f.L)?f.L:0, D=Number.isSafeInteger(f.D)?f.D:0;
  const fights=W+L+D;
  let ko=0;
  for(let i=0;i<L;i++){ if(mgmtHashId(f.id+'#'+i)%100<MGMT_KO_SHARE) ko++; }
  const wear=Math.floor(Math.max(0,fights)/12);
  return Math.min(MGMT_TRAUMA_START_CAP,ko*MGMT_KO_TRAUMA+wear);
}

/** Part définitivement acquise. Les sauvegardes antérieures à la T1 ter
 *  n'en portent pas : leur dérivation initiale devient alors le plancher,
 *  borné par le total stocké. Pur. @returns {number} 0 à 100. */
function mgmtTraumaFloor(f){
  if(!f) return 0;
  const initial=mgmtInitialTrauma(f);
  if(typeof f.traumaFloor==='number'&&Number.isFinite(f.traumaFloor)){
    return clamp(f.traumaFloor,0,MGMT_TRAUMA_MAX);
  }
  if(typeof f.trauma==='number'&&Number.isFinite(f.trauma)){
    return Math.min(clamp(f.trauma,0,MGMT_TRAUMA_MAX),initial);
  }
  return initial;
}

/** Traumatisme courant. Après un combat, le total et sa part acquise sont
 *  écrits une fois ; au repos, seule la lecture dérive la récupération du
 *  nombre de cycles écoulés. Aucun cycle n'écrit la ligne. Pur et
 *  déterministe. @returns {number} 0 à 100. */
function mgmtTrauma(f,cycle){
  if(!f) return 0;
  if(typeof f.trauma!=='number'||!Number.isFinite(f.trauma)) return mgmtInitialTrauma(f);
  const total=clamp(f.trauma,0,MGMT_TRAUMA_MAX);
  const floor=Math.min(total,mgmtTraumaFloor(f));
  if(!Number.isSafeInteger(cycle)||!Number.isSafeInteger(f.lastCycle)||cycle<=f.lastCycle) return total;
  const recovered=(cycle-f.lastCycle)*MGMT_TRAUMA_RECOVERY_PER_CYCLE;
  return clamp(Math.max(floor,total-recovered),0,MGMT_TRAUMA_MAX);
}

/** Retrouve un niveau makeFighter en inversant correlatedRecord()
 *  (ui-01-roster-matchmaking.js:465) à partir du ratio de victoires,
 *  borné à 40-80. Pur et déterministe. */
function mgmtLevelForRecord(W,L){
  const t=(Number.isSafeInteger(W)&&Number.isSafeInteger(L)&&(W+L)>0)?W/(W+L):0.5;
  return clamp(Math.round(20+clamp((t-0.45)/0.43,0,1)*77),40,80);
}

/** Profil de combat d'une ligne : régénéré à chaque appel, jamais stocké.
 *  SEED sauvegardé, tirage sous hachage de l'id, SEED restauré — le même
 *  combattant donne exactement le même profil sans avancer la suite des
 *  tirages de la partie. L'identifiant de uniqueFighterId() n'est jamais
 *  conservé. */
function mgmtCombatProfile(f){
  const saved=SEED;
  let p;
  try{
    /* ==== [ANCRE: MGMT_LOT1_STYLE_STABLE] — Lot 1 le style stable (audit
       X2, §3.2 du lot 3a) : la graine du profil est le hachage de l'id de
       la ligne. Sans ce setSeed, chaque appel consommait le flux courant
       restauré à l'identique : tous les combattants générés au même
       instant recevaient le même style, et un même combattant changeait de
       style d'une soirée à l'autre. ==== */
    setSeed(mgmtHashId(f.id));
    const d=divById(f.div);
    p=makeFighter({div:f.div,gender:d?d.gender:'H',level:mgmtLevelForRecord(f.W,f.L),age:f.age});
  }finally{
    setSeed(saved);
  }
  p.id=f.id; p.name=f.name; p.first=f.first; p.last=f.last; p.age=f.age;
  p.W=f.W; p.L=f.L; p.D=f.D;
  return p;
}

/** Facteur d'usure menton/résistance : exactement 1 à traumatisme 0
 *  (combat strictement identique au moteur nu, même graine), décroissant
 *  ensuite, plancher anti-effondrement. Pur. */
function mgmtTraumaFactor(t){
  if(!(t>0)) return 1;
  return Math.max(MGMT_CHIN_FLOOR,1-(t/MGMT_TRAUMA_MAX)*MGMT_CHIN_WEAR);
}

/** Clone prêt à combattre : profil régénéré, copié en profondeur, attributs
 *  attrs.chin (engine.js:97, eff() en :413) et attrs.durability (engine.js:97,
 *  eff() en :423) réduits selon le traumatisme. À 0, le clone est inchangé. */
function mgmtFightReady(f,cycle){
  const c=JSON.parse(JSON.stringify(mgmtCombatProfile(f)));
  const k=mgmtTraumaFactor(mgmtTrauma(f,cycle));
  if(k!==1&&c&&c.attrs){
    c.attrs.chin=Math.max(1,Math.round(num(c.attrs.chin)*k));
    c.attrs.durability=Math.max(1,Math.round(num(c.attrs.durability)*k));
  }
  return c;
}

/* ==== [ANCRE: MGMT_LOT3_T1_TRACE] — Lot 3 T1 la trace (docs/LOT-3-L-ARENE.md
   §3 T1 ; constat C3, docs/AUDIT-17-09.md) : chaque combat laisse de quoi
   être REJOUÉ, pas le combat — garder le déroulé ferait enfler la sauvegarde
   sans fin, le dépôt régénère au lieu de stocker (mgmtCombatProfile, monde
   extérieur). Ce qu'un rejeu exige, et rien de plus :
   - l'instantané d'AVANT COMBAT des deux lignes. Le piège (C3) : les lignes
     changent après le combat — le bilan et le traumatisme avancent dans
     mgmtApplyFight — donc rejouer sur les lignes d'aujourd'hui ne redonne
     pas le combat d'hier. mgmtFightReady ne lit sur une ligne que l'id (qui
     sème le profil régénéré et la dérivation du traumatisme), la catégorie,
      l'âge, le bilan W/L/D, le traumatisme éventuel, sa part acquise, le
      cycle du dernier combat et les noms (cités par le déroulé du moteur) —
      l'instantané capture exactement ces champs ;
   - la valeur de SEED à l'instant de l'appel de simulateFight. Vérifié ligne
     à ligne dans engine-combat.js (simulateFight :618-2258) : tous les
     tirages passent par rnd() (pick/RI/gauss compris), G n'est lu que par
     applyResult (:2281,:2306 — jamais appelé par mgmtRunEvent),
     Date.now/Math.random ne sont consommés que par uniqueFighterId
     (engine.js:276, id écrasé par mgmtCombatProfile :101), plan/planB/opts
     sont null sur ce chemin — le déroulé d'un combat ne dépend donc que de
     (les deux combattants prêts, le nombre de rounds, l'état de la RNG).
   L'historique vit sur m.hist (append-only, chaque entrée auto-portante) :
   m.lastEvent garde son rôle, la trace ne l'écrase pas, et rien ne
   s'efface — la mémoire des combats ne disparaît pas (décision QO-9 du
   21/09 pour les faits, même esprit ici : la décision de tronquer
   appartient à l'auteur, pas au code). L'adversaire n'y figure que comme
   référence copiée : une ligne disparue du roster ne casse rien. ==== */

/** Instantané d'AVANT COMBAT d'une ligne : exactement les champs que
 *  mgmtFightReady lit pour reconstruire le combattant prêt — l'identité
 *  (l'id sème le profil régénéré et la dérivation du traumatisme ; les noms
 *  sont cités dans le déroulé), la catégorie, l'âge, le bilan (niveau dérivé
 *  et dérivation du traumatisme), le traumatisme de l'instant, sa part
 *  acquise et le cycle du dernier combat. null = champ absent à cet instant.
 *  Pur, ne consomme jamais rnd().
 *  @returns {object} */
function mgmtTraceSide(f){
  return {id:f.id,name:f.name,first:f.first,last:f.last,div:f.div,age:f.age,
    W:f.W,L:f.L,D:f.D,
    trauma:(typeof f.trauma==='number'&&Number.isFinite(f.trauma))?f.trauma:null,
    traumaFloor:(typeof f.traumaFloor==='number'&&Number.isFinite(f.traumaFloor))?f.traumaFloor:null,
    lastCycle:Number.isSafeInteger(f.lastCycle)?f.lastCycle:null};
}

/** Reconstitue la ligne d'avant combat depuis son instantané : l'état exact
 *  que mgmtFightReady attend, le champ trauma absent quand la trace porte
 *  null. Pur. @returns {object} */
function mgmtTraceLine(t){
  const f={id:t.id,name:t.name,first:t.first,last:t.last,div:t.div,age:t.age,W:t.W,L:t.L,D:t.D};
  if(t.trauma!==null) f.trauma=t.trauma;
  if(t.traumaFloor!==null) f.traumaFloor=t.traumaFloor;
  if(t.lastCycle!==null) f.lastCycle=t.lastCycle;
  return f;
}

/** Rejoue un combat depuis sa trace : les deux combattants reconstruits à
 *  l'identique d'avant combat (mgmtFightReady sur les instantanés), la RNG
 *  restaurée à l'état capturé — le motif « SEED sauvegardé, opération, SEED
 *  restauré » de mgmtCombatProfile — puis simulateFight appelé tel quel.
 *  Le déroulé rendu est celui du combat joué : même vainqueur, même méthode,
 *  même round, même log moment pour moment. La RNG de la partie ne bouge
 *  pas d'un rejeu.
 *  @returns {object} le résultat complet du moteur (log, stats, juges...). */
function mgmtReplayFight(t){
  if(!t||!t.a||!t.b) return null;
  const saved=SEED;
  let res;
  try{
    setSeed(t.seed);
    res=simulateFight(mgmtFightReady(mgmtTraceLine(t.a),t.c),mgmtFightReady(mgmtTraceLine(t.b),t.c),t.rounds);
  }finally{
    setSeed(saved);
  }
  return res;
}

/** Les combats d'un combattant (M4) : contre qui, quand, l'issue, et de quoi
 *  rejouer — lus sur la trace auto-portante, jamais sur le roster : une
 *  ligne disparue (retraité, partie) ne casse pas l'historique de celui qui
 *  reste. Pur. @returns {Array} */
function mgmtFightHistory(m,f){
  if(!m||!f||!Array.isArray(m.hist)) return [];
  return m.hist.filter(x=>x&&(x.a.id===f.id||x.b.id===f.id));
}
/* ==== [FIN ANCRE] ==== */

/** Famille d'une méthode pour l'écran de soirée (addendum 2 §6 : ni
 *  res.detail, ni statistiques, ni note). Blessure et disqualification sont
 *  des combats arrêtés par l'arbitre : famille 'stop'. */
function mgmtMethodFamily(method,winner){
  if(winner==='D') return 'draw';
  if(typeof method!=='string') return 'stop';
  if(method.indexOf('KO')===0) return 'ko';
  if(method.indexOf('Soumission')===0) return 'sub';
  if(method.indexOf('Décision')===0) return 'dec';
  if(method.indexOf('Nul')===0) return 'draw';
  return 'stop';
}

/** Gain de traumatisme après un combat, selon les dégâts subis : H les
 *  dégâts tête encaissés (res.stats[side].dmgHead — ce que le combattant a
 *  encaissé, engine-combat.js:1690-1691,1730), K les knockdowns encaissés
 *  (res.stats[side].wobbled — res.stats[side].kd compte ceux qu'il a
 *  infligés, engine-combat.js:1768,1774). Déterministe, borné, jamais
 *  négatif : un combat ne fait jamais descendre le total courant. */
function mgmtTraumaGain(method,fam,issue,H,K){
  const h=Math.max(0,Math.round(num(H))), k=Math.max(0,Math.round(num(K)));
  if(issue==='win'&&h===0&&k===0) return 0;
  let g;
  if(issue==='loss'){
    if(fam==='ko') g=11+k*3+Math.floor(h/15);
    else if(fam==='sub'||fam==='stop') g=(fam==='sub'?10:13)+k*3+Math.floor(h/15);
    else g=3+Math.min(3,Math.floor(h/12))+k*3;
  }else if(issue==='win'){
    g=(fam==='dec')?2+Math.min(3,Math.floor(h/12)):3;
  }else{
    g=3+Math.min(3,Math.floor(h/12))+k*3;
  }
  if(method==='Blessure'&&issue==='loss') g+=4;
  return clamp(Math.round(g),0,MGMT_GAIN_CAP);
}

/** Durée de suspension en jours d'un nom de blessure du moteur
 *  (INJURY_TYPES, engine-progression.js:67-73), selon la table du lot
 *  (§6.3). 0 si le nom est inconnu. */
function mgmtInjuryDays(name){
  if(typeof name!=='string') return 0;
  if(name.indexOf('Commotion')>=0||name.indexOf('Déchirure')>=0) return 180;
  if(name.indexOf('Fracture')>=0) return 90;
  if(name.indexOf('Entorse')>=0) return 60;
  return 0;
}

/** Dernier cycle où une suspension est encore active. Une soirée est
 *  espacée de MGMT_EVENT_WEEKS : si l'échéance en jours tombe avant la
 *  soirée suivante, le combattant y est disponible. Pur. */
function mgmtSuspensionUntil(cycle,days){
  const spans=Math.max(1,Math.ceil(Math.max(0,days)/(MGMT_EVENT_WEEKS*7)));
  return cycle+spans-1;
}

/** Disponibilité pour une proposition : ni retraité médical, ni suspendu
 *  (susp = cycle jusqu'auquel il est indisponible). */
function mgmtAvailable(m,f){
  if(!f||f.retired) return false;
  if(Number.isSafeInteger(f.susp)&&m&&Number.isSafeInteger(m.cycle)&&m.cycle<=f.susp) return false;
  return true;
}

/** Dossier sans interaction comptée (addendum §5 : ce n'est pas un choix du
 *  joueur) : la raison est attribuée, le compteur d'interactions ne bouge
 *  pas — ni vers le niveau 3, ni ailleurs. level 3 sur fin de carrière
 *  (CDC §3, « KO grave »). */
function mgmtPromoteSilent(m,f,level){
  if(!f) return null;
  if(f.level<2){ f.level=2; if(f.raison==null) f.raison=pick(MGMT_RAISONS).id; }
  if(level>=3) f.level=3;
  return f;
}

/** Rang de gravité pour le lendemain (du plus grave au moins grave) :
 *  fin de carrière d'abord, puis durée de suspension, puis blessure. */
function mgmtTouchedRank(t){
  return (t.retired?1000000:0)+(Number.isSafeInteger(t.days)?t.days:0)*10+(t.injury?1:0);
}

/** Applique à une ligne tout ce que son combat lui a fait (§6) : bilan,
 *  traumatisme (écrit sur la ligne — premier combat sur la carte),
 *  blessure (rollInjury(), inchangé), suspension (la plus longue l'emporte),
 *  fin de carrière médicale (traumatisme 100, ou commotion sévère sur un
 *  corps déjà au-dessus du seuil — définitive, sans réparation), promotions
 *  règle du bureau et faits (blessures, suspensions de 90 j et plus, fins
 *  de carrière — jamais les résultats ordinaires).
 *  @returns {object|null} la carte du lendemain pour ce combattant, ou null
 *  si rien ne le touche. */
function mgmtApplyFight(m,f,opp,res,side){
  if(!m||!f||!res) return null;
  const st=res.stats?res.stats[side]:null;
  const H=st?Math.max(0,Math.round(num(st.dmgHead))):0;
  const K=st?Math.max(0,Math.round(num(st.wobbled))):0;
  const fam=mgmtMethodFamily(res.method,res.winner);
  const issue=res.winner==='D'?'draw':(res.winner===side?'win':'loss');
  const T0=mgmtTrauma(f,m.cycle);
  const gain=mgmtTraumaGain(res.method,fam,issue,H,K);
  const T1=Math.min(MGMT_TRAUMA_MAX,T0+gain);
  const floor0=mgmtTraumaFloor(f);
  f.trauma=Math.max(T0,T1);
  f.traumaFloor=Math.min(f.trauma,Math.min(MGMT_TRAUMA_MAX,
    floor0+gain*MGMT_TRAUMA_PERMANENT_SHARE));
  /* Lot 2 T1 : dernier combat sous Split, écrit ici où le lot 3a écrit déjà
     le traumatisme. Absent = n'a jamais combattu sous Split. */
  f.lastCycle=m.cycle;
  if(issue==='win') f.W++;
  else if(issue==='loss') f.L++;
  else f.D++;
  const loserSide=res.winner==='D'?null:(res.winner==='A'?'B':'A');
  let injury=null;
  if(res.method==='Blessure'&&loserSide===side){
    injury=rollInjury();
  }else{
    const p=MGMT_INJURY_BASE+MGMT_INJURY_HEAD*H+MGMT_INJURY_TRAUMA*T0+(K>0?MGMT_INJURY_KD*K:0);
    if(rnd()<p) injury=rollInjury();
  }
  let days=0;
  if(injury) days=Math.max(days,mgmtInjuryDays(injury.name));
  if(issue==='loss'&&fam==='ko') days=Math.max(days,60);
  if(issue==='loss'&&res.method==='Arrêt médical') days=Math.max(days,30);
  if(fam==='dec'&&H>=MGMT_HEAD_SUSP) days=Math.max(days,30);
  if(days>0){
    const until=mgmtSuspensionUntil(m.cycle,days);
    f.susp=Math.max(Number.isSafeInteger(f.susp)?f.susp:0,until);
  }
  let retired=false;
  if(f.trauma>=MGMT_TRAUMA_MAX) retired=true;
  else if(injury&&typeof injury.name==='string'&&injury.name.indexOf('Commotion')>=0&&T0>MGMT_BODY_THRESHOLD) retired=true;
  if(retired){
    f.retired='medical';
    mgmtPromoteSilent(m,f,3);
    mgmtAddFact(m,{c:m.cycle,k:'retired',a:f.id});
  }else if(injury||days>=90){
    mgmtPromoteSilent(m,f,2);
    mgmtAddFact(m,{c:m.cycle,k:injury?'injury':'susp',a:f.id});
  }
  if(!retired&&!injury&&!(days>0)) return null;
  return {id:f.id,retired:retired,injury:injury?injury.name:null,days:days};
}

/** Joue la soirée : les combats de la carte se règlent en une seule fois
 *  par simulateFight(A,B,3) — sans applyResult(), le bilan est mis à jour
 *  à la main — avec toutes leurs conséquences (§6). Lot 3b T1 (QO-5) : le
 *  même calcul unique porte la finance — attrait et cachets lus sur les
 *  lignes d'avant combat, spectacle observé sur les combats joués, recette
 *  nette R = billetterie + droits − cachets ajoutée au solde unique
 *  (remboursement automatique : tant que T < 0, rien n'est bénéfice),
 *  audience, historiques et E1 (patron : T < 0 avant la soirée et R > 0).
 *  Stocké dans m.lastEvent puis sauvegardé avant tout affichage : recharger
 *  la page ne rejoue rien. Lot 3 T1 : chaque combat laisse aussi sa trace
 *  dans m.hist (ancre MGMT_LOT3_T1_TRACE) — de quoi rejouer, jamais le
 *  combat ; m.lastEvent garde son rôle, l'historique vient à côté.
 *  La carte est vidée. Ne remplit jamais rien
 *  d'office : carte incomplète ou paire introuvable, on ne joue pas (null),
 *  avant toute mutation.
 *  @returns {object|null} m.lastEvent. */
function mgmtRunEvent(m){
  if(!m||!m.card||!Array.isArray(m.card.main)||!Array.isArray(m.card.prelims)) return null;
  if(!mgmtCardFull(m)) return null;
  /* Lot 2 T1 : chaque combat porte son emplacement (slot:'main'|'prelim')
     et la soirée joue la carte principale d'abord, puis les préliminaires. */
  const booked=mgmtCardFights(m).map(f=>({a:f.a,b:f.b,slot:f.slot==='main'?'main':'prelim'}));
  /* Disponibilités vérifiées d'abord : une paire introuvable n'applique
     aucune conséquence — la soirée n'a pas commencé. */
  for(const cf of booked){
    const fa=mgmtFighterById(m,cf.a), fb=mgmtFighterById(m,cf.b);
    if(!fa||!fb||!mgmtAvailable(m,fa)||!mgmtAvailable(m,fb)) return null;
  }
  /* Cachets et attrait : la carte d'avant la soirée — le bilan et le corps
     d'avant combat, jamais d'après (les combats mutent les lignes). */
  const attraction=mgmtCardAttraction(m,booked);
  const purses=mgmtPurses(m,booked);
  const fights=[];
  const touched=[];
  if(!Array.isArray(m.hist)) m.hist=[];
  for(const cf of booked){
    const fa=mgmtFighterById(m,cf.a), fb=mgmtFighterById(m,cf.b);
    /* Lot 3 T1 : la trace se capture AVANT le combat — l'état de la RNG à
       l'instant de l'appel et les deux lignes d'avant combat (mgmtApplyFight
       avance bilan et traumatisme juste après). La capture lit SEED, ne le
       déplace pas : les combats sont tirés exactement comme avant (motif
       intact, aucun reseingage par combat). */
    const traceA=mgmtTraceSide(fa), traceB=mgmtTraceSide(fb);
    const seedFight=SEED;
    const res=simulateFight(mgmtFightReady(fa,m.cycle),mgmtFightReady(fb,m.cycle),3);
    const fam=mgmtMethodFamily(res.method,res.winner);
    const roundF=Number.isSafeInteger(res.round)?res.round:3;
    fights.push({a:fa.id,b:fb.id,winner:res.winner,family:fam,round:roundF});
    m.hist.push({c:m.cycle,slot:cf.slot,seed:seedFight,rounds:3,a:traceA,b:traceB,
      winner:res.winner,family:fam,round:roundF});
    const ta=mgmtApplyFight(m,fa,fb,res,'A');
    const tb=mgmtApplyFight(m,fb,fa,res,'B');
    if(ta) touched.push(ta);
    if(tb) touched.push(tb);
  }
  touched.sort((x,y)=>mgmtTouchedRank(y)-mgmtTouchedRank(x));
  const finance=mgmtEventRecette(attraction,mgmtSpectacle(fights),purses,fights.length);
  /* Un seul solde (QO-5) : T ← T + R. Remboursement « avant tout bénéfice »
     automatique — tant que T < 0, rien n'est bénéfice. E1 si et seulement
     si T < 0 avant la soirée et R > 0. */
  const debtBefore=Number.isSafeInteger(m.treasury)&&m.treasury<0;
  m.treasury=(Number.isSafeInteger(m.treasury)?m.treasury:MGMT_TREASURY_START)+finance.recette;
  if(!Array.isArray(m.recettes)) m.recettes=[];
  m.recettes.push(finance.recette);
  while(m.recettes.length>2) m.recettes.shift();
  if(!Array.isArray(m.audiences)) m.audiences=[];
  m.audiences.push(finance.audience);
  m.eventsPlayed=(Number.isSafeInteger(m.eventsPlayed)?m.eventsPlayed:0)+1;
  m.lastEvent={cycle:m.cycle,fights:fights,touched:touched,finance,e1:!!(debtBefore&&finance.recette>0)};
  m.card.main=[];
  m.card.prelims=[];
  saveMgmt();
  return m.lastEvent;
}

/* ==== [FIN ANCRE] ==== */
