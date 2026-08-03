"use strict";
/* CAGE LEGACY — js/ui.js
   Logique de jeu (roster, adversaires, entraînement, combat, succès),
   écrans (SCREENS), rendu, arène 2D canvas, et l'objet CL exposé en global.
   Dépend de : data-skills.js, data-content.js, engine.js, state.js. */
/* ==== [ANCRE: TACTIQUES] — plan de combat pré-fight (audit §11). Les clés des
   modificateurs (str/ko/def/gi/td/tdd/sub/gnp/ctrl) correspondent aux canaux
   RÉELS produits par eff() : striking, power, footwork+fightIQ, takedown,
   tdd, submission, ground, topControl — vérifiés contre engine.js. ==== */
const TACTICS = {
  boxer: [
    { id: 'bx1', lbl: 'Volume Constant', desc: 'Sature l\u2019adversaire de jabs et de touches. Moins de puissance, plus de points.', m: { str: 1.3, ko: 0.7, gi: 0.2 } },
    { id: 'bx2', lbl: 'Chasse au KO', desc: 'Plante les appuis et cherche le coup fatal. Dangereux mais on s\u2019expose.', m: { ko: 1.4, def: 0.7, str: 0.8, gi: 0.2 } },
    { id: 'bx3', lbl: 'Out-boxing', desc: 'Recule, gère la distance et punit sur esquive. Combat lent et sûr.', m: { def: 1.4, str: 0.8, gi: 0.2 } },
    { id: 'bx4', lbl: 'Contre-Puncher', desc: 'Laisse venir, dévie et place le coup exact au bon moment. Patience payante.', m: { def: 1.2, ko: 1.2, str: 0.7, gi: 0.1 } }
  ],
  bjj: [
    { id: 'bj1', lbl: 'Takedown sans check', desc: 'Plonge dans les jambes à la moindre occasion. Sacrifice de la boxe.', m: { gi: 3.0, td: 1.3, str: 0.3 } },
    { id: 'bj2', lbl: 'Chasseur de cou', desc: 'Prend tous les risques au sol pour arracher une soumission rapide.', m: { sub: 1.5, ctrl: 0.6 } },
    { id: 'bj3', lbl: 'Tireur de garde', desc: 'Amène volontairement le combat au sol pour travailler sa garde, sans chercher le dessus.', m: { td: 1.5, sub: 1.5, ctrl: 0.1 } },
    { id: 'bj4', lbl: 'Contrôle & patience', desc: 'Prend le dessus et attend l\u2019ouverture plutôt que de la forcer.', m: { gi: 1.2, ctrl: 1.4, sub: 0.9, td: 0.9 } }
  ],
  wrestler: [
    { id: 'wr1', lbl: 'Chain Wrestling', desc: 'Enchaîne les tentatives d\u2019amenées jusqu\u2019à l\u2019épuisement de l\u2019adversaire.', m: { gi: 2.5, td: 1.3, str: 0.5 } },
    { id: 'wr2', lbl: 'Ground & Pound', desc: 'Privilégie les frappes lourdes au sol, quitte à perdre le contrôle positionnel.', m: { gnp: 1.5, ctrl: 0.7, sub: 0.5 } },
    { id: 'wr3', lbl: 'Sprawl & Brawl', desc: 'Refuse catégoriquement le sol, sprawle fort et boxe lourdement.', m: { gi: 0.1, tdd: 1.5, ko: 1.2 } },
    { id: 'wr4', lbl: 'Lay & Pray', desc: 'Amène au sol et verrouille le contrôle, sans forcer la finition. Vise les points.', m: { gi: 2.0, td: 1.1, ctrl: 1.6, gnp: 0.5, sub: 0.3 } }
  ],
  kickboxer: [
    { id: 'kb1', lbl: 'Pression Hollandaise', desc: 'Avance non-stop avec des combinaisons poings-pieds. Défense ouverte.', m: { str: 1.4, def: 0.7, gi: 0.1 } },
    { id: 'kb2', lbl: 'Sniper Extérieur', desc: 'Garde la distance maximale et punit les entrées avec des kicks lourds.', m: { def: 1.3, ko: 1.2, str: 0.7, gi: 0.1 } },
    { id: 'kb3', lbl: 'Sprawl & Kick', desc: 'Focus total sur la défense de lutte pour garder le combat debout à tout prix.', m: { tdd: 1.4, ko: 1.2, str: 0.9, gi: 0.1 } },
    { id: 'kb4', lbl: 'Low Kick Chirurgical', desc: 'Cible méthodiquement la jambe d\u2019appui jusqu\u2019à l\u2019effondrement.', m: { str: 1.2, ko: 0.9, def: 1.1, gi: 0.1 } }
  ],
  muayThai: [
    { id: 'mt1', lbl: 'Clinch Destructeur', desc: 'Ferme la distance pour imposer le corps-à-corps et les genoux.', m: { str: 1.3, td: 0.5, tdd: 1.2 } },
    { id: 'mt2', lbl: 'Coupeur de Têtes', desc: 'Cherche la destruction physique sur chaque coup, au détriment du volume.', m: { ko: 1.5, def: 0.6, gi: 0.1 } },
    { id: 'mt3', lbl: 'Le Mur Thaï', desc: 'Immobile, encaisse sur la garde et défend les lutteurs.', m: { def: 1.4, str: 0.8, tdd: 1.3, gi: 0.1 } },
    { id: 'mt4', lbl: 'Distance & Teep', desc: 'Tient l\u2019adversaire à longueur de jambe, refuse l\u2019échange rapproché.', m: { def: 1.3, str: 0.8, gi: 0.1, ko: 0.9 } }
  ],
  karate: [
    { id: 'ka1', lbl: 'Blitzkrieg', desc: 'Explosions soudaines en ligne droite. Frappe très fort mais se fatigue.', m: { ko: 1.4, str: 0.7, def: 0.8, gi: 0.1 } },
    { id: 'ka2', lbl: 'Fantôme (In/Out)', desc: 'Touche et s\u2019échappe instantanément. Très difficile à toucher ou à lutter.', m: { def: 1.6, str: 0.6, gi: 0.1 } },
    { id: 'ka3', lbl: 'Contre Parfait', desc: 'Attend que l\u2019adversaire s\u2019engage pour placer le coup d\u2019arrêt.', m: { ko: 1.5, str: 0.5, gi: 0.1 } },
    { id: 'ka4', lbl: 'Kick Haut Risque', desc: 'Cherche le high kick à chaque ouverture, quitte à se découvrir.', m: { ko: 1.6, def: 0.5, str: 0.6, gi: 0.1 } }
  ],
  sambo: [
    { id: 'sb1', lbl: 'Casting Punch', desc: 'Overhands brutaux pour masquer les entrées en lutte ou éteindre la lumière.', m: { ko: 1.4, td: 0.6, gi: 0.5 } },
    { id: 'sb2', lbl: 'Suplex City', desc: 'Projections de grande amplitude, risquées mais garantissent le dessus.', m: { td: 1.5, gnp: 1.2, ctrl: 0.6 } },
    { id: 'sb3', lbl: 'Voleur de Jambes', desc: 'Plonge dans la garde adverse pour arracher une cheville.', m: { sub: 1.6, ctrl: 0.4, tdd: 0.4 } },
    { id: 'sb4', lbl: 'Pression Constante', desc: 'Ne laisse jamais respirer : amène, contrôle, recommence.', m: { td: 1.2, gnp: 1.0, ctrl: 1.1, gi: 1.3 } }
  ],
  mma: [
    { id: 'mm1', lbl: 'Anti-Lutte', desc: 'Défend toutes les amenées et utilise la boxe avec puissance.', m: { gi: 0.2, tdd: 1.5, str: 1.2 } },
    { id: 'mm2', lbl: 'Lutte Offensive', desc: 'Force le combat au sol de manière méthodique pour dominer le chrono.', m: { gi: 2.0, td: 1.2, ctrl: 1.2, str: 0.7 } },
    { id: 'mm3', lbl: 'Opportuniste', desc: 'Adapte sa tactique, joue sur la défensive et saisit les ouvertures.', m: { def: 1.2, ko: 1.2, sub: 1.2, str: 0.8 } },
    { id: 'mm4', lbl: 'Chain Offense', desc: 'Enchaîne frappe et lutte sans temps mort, ne laisse aucun round au hasard.', m: { gi: 1.3, str: 1.0, td: 1.1, ctrl: 1.0 } }
  ]
};
/* ==== [FIN ANCRE] ==== */
const RAR_COLORS={C:'var(--text)',R:'#4DA6FF',E:'var(--gold)',L:'var(--blood)',M:'#8b5cf6'};
/* --------------------------- roster / classement -------------------------- */
/* ==== [ANCRE: AMA_CHAMPIONSHIPS] — un seul combat décisif (version légère
   validée), aucune incidence sur f.org/ORGS, amateurs uniquement. Config-driven
   pour ajouter facilement d'autres pays plus tard sans dupliquer de logique. ==== */
const AMA_CHAMPIONSHIPS=[
 {id:'wma',label:'WMA',name:'Championnat du monde amateur',country:null,rankMin:1,rankMax:2},
 ...COUNTRY_KEYS.map(ck=>{ const pfx=COUNTRY_MMA_PREFIX[ck]; const label=pfx+'MMA';
   return {id:label.toLowerCase(),label,name:`Championnat ${COUNTRIES[ck].name} amateur`,country:ck,rankMin:2,rankMax:5}; })
];
function amaScopedPool(f,cfg){ return G.roster.filter(o=>o.org===0 && o.div===f.div && (o.W+o.L+(o.D||0))>=5 && (!cfg.country || o.countryKey===cfg.country)); }
function amaScopedRank(f,cfg){ const pool=amaScopedPool(f,cfg).filter(o=>o.id!==f.id).concat([f]); return rankPool(pool).findIndex(o=>o===f)+1; }
function generateTournament(f,cfg){
  const pool=amaScopedPool(f,cfg);
  let top8=rankPool(pool).filter(o=>o.id!==f.id).slice(0,7);
  top8.push(f);
  top8=rankPool(top8); // reseeding avec le joueur inclus
  const matches=[{a:top8[0],b:top8[7]},{a:top8[1],b:top8[6]},{a:top8[2],b:top8[5]},{a:top8[3],b:top8[4]}];
  return {cfg,step:'Quarts de finale',matches,active:true};
}
function checkAmaChampionship(f){
  if(f.org!==0 || (f.W+f.L+(f.D||0))<5) return null;
  if(!f.amaTitles) f.amaTitles=[];
  if(!f.amaAttempted) f.amaAttempted=[];
  // Plafond de réalisme : être top 8 d'un pool national restreint ne suffit
  // pas si le classement général est médiocre (confirmé : joueur classé #44
  // au global repêché pour un tournoi censé représenter l'élite du pays,
  // à cause d'un pool pays/division trop petit). On exige en plus d'être
  // dans le premier quart du classement général de la division.
  const globalCeiling=Math.max(8, Math.round(G.roster.length*0.25));
  if(divRank(f)>globalCeiling) return null;
  for(const cfg of AMA_CHAMPIONSHIPS){
    if(f.amaAttempted.includes(cfg.id)) continue;
    if(cfg.country && f.countryKey!==cfg.country) continue;
    // Le bracket a besoin de 7 AUTRES participants réels : un pool scoped trop
    // petit (style/pays rare) ne peut pas remplir 8 places sans planter sur des
    // indices vides.
    if(amaScopedPool(f,cfg).filter(o=>o.id!==f.id).length<7) continue;
    const rnk=amaScopedRank(f,cfg);
    if(rnk>=1 && rnk<=8) return cfg; // n'importe qui du Top 8 est repêché pour le bracket
  }
  return null;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: LINEAGE] — registre des ceintures (Phase 6). Array de règnes,
   pas de clé composite string (évite toute ambiguïté de parsing) ; groupé par
   org+divName seulement à l'affichage (scr_beltLineage). Année réelle prise
   sur G.season.year (G.year n'existe nulle part dans l'état du jeu). ==== */
function recordTitleChange(org,divName,champion,dethroned){
  if(!G.titleHistory) G.titleHistory=[];
  G.titleHistory.unshift({org,divName,champion,year:(G.season&&G.season.year)||1,defenses:0,dethroned:dethroned||'Aucun'});
  if(G.titleHistory.length>200) G.titleHistory.length=200;
}
function recordTitleDefense(org,divName,champion){
  if(!G.titleHistory) G.titleHistory=[];
  const reign=G.titleHistory.find(r=>r.org===org&&r.divName===divName&&r.champion===champion);
  if(reign) reign.defenses+=1;
}
/* ==== [FIN ANCRE] ====*/
function orgLevel(org){ return [38,46,54,61,67,73,73][org]||40; }
function makeOrgRoster(f, oldRoster=null){ const base=orgLevel(f.org); const pool=[];
  const isAmateur=(f.org===0);
  const needed=isAmateur?100:30; // pro : 1 champion + 15 contenders classés + 14 non classés
  // Array.isArray est nécessaire : oldRoster peut valoir le sentinel 'PRO_TRANSITION'
  // (une chaîne, qui a un .length mais pas de .filter) — sans cette garde, ça plante.
  if(!isAmateur && oldRoster && Array.isArray(oldRoster) && oldRoster.length>0){
    const survivors=oldRoster.filter(o=>o.id!==f.id && !o.champion).slice(0,4);
    survivors.forEach(o=>{ o.attrs.fightIQ=clamp(o.attrs.fightIQ+RI(1,3),1,100); o.overall=overall(o); pool.push(o); });
  }
  if(!isAmateur && oldRoster==='PRO_TRANSITION' && f.amateurRivals){
    f.amateurRivals.forEach(r=>{ r.org=f.org; r.overall=clamp(r.overall+RI(5,12),35,95); r.isAmateurRival=true; r.orgWins=RI(0,2); pool.push(r); });
  }
  const toGenerate=needed-pool.length;
  for(let i=0;i<toGenerate;i++){ const lv=clamp(base+RI(-10,14)+3,20,97);
    const age=isAmateur?RI(17,24):RI(22,35);
    const o=makeFighter({gender:f.gender,div:f.div,level:lv,potential:lv+RI(2,12),age});
    o.org=f.org; // bug confirmé et corrigé : restait à 0 par défaut, faussant le x1.4 Pacific Championship
    o.W=isAmateur?RI(0,15):RI(6,24); o.L=isAmateur?RI(0,6):RI(1,8);
    o.ko=RI(0,o.W);
    o.streak=(o.L===0)?o.W:RI(-2,Math.min(5,o.W));
    if(!isAmateur) o.amaRec={W:RI(2,12),L:RI(0,4)};
    if(f.org>=3){ // durcissement de l'IA en ligue haute — évite les victoires faciles par spam
      o.attrs.tdd=clamp(o.attrs.tdd+RI(8,16),1,100);
      o.attrs.fightIQ=clamp(o.attrs.fightIQ+RI(6,12),1,100);
      o.attrs.durability=clamp(o.attrs.durability+RI(5,10),1,100);
      o.overall=overall(o);
    }
    // le PNJ est censé être établi DANS cette orga depuis un moment — sans ça,
    // la dynamique Elo (orgElo pèse 80%) donnerait un roster entièrement plat.
    // Pour l'amateur (org 0), seul careerElo compte dans p4pScore : il DOIT être
    // corrélé au record généré, sinon un PNJ classé peut afficher un palmarès
    // perdant (1-4) tout en étant classé #1 — confirmé, c'était le cas.
    const bias=Math.round((o.W-o.L)*18);
    if(!isAmateur){ o.orgElo=eloBaseline(f.org,o.overall)+bias+RI(-40,40); o.careerElo=eloBaseline(f.org,o.overall)+Math.round(bias*0.6); }
    else { o.careerElo=eloBaseline(0,o.overall)+bias+RI(-20,20); }
    pool.push(o); }
  const ranked=rankPool(pool);
  if(f.org>=1){ ranked[0].champion=(f.org>=5?'monde':f.org===4?'europe':f.org===3?'national':f.org===2?'regional':'local'); ranked[0].defenses=RI(0,4); ranked[0].orgElo=Math.max(ranked[0].orgElo||0,eloBaseline(f.org,ranked[0].overall)+RI(150,300)); }
  return ranked;
}
function divRank(f){ return rankPool(G.roster.filter(o=>!o.champion).concat([f])).findIndex(o=>o===f)+1; }
function advanceRoster(){
  if(typeof generateNPCNews==='function') generateNPCNews();
  const allFighters=G.roster.concat(G.f.champion?[]:[G.f]);
  const oldRanks={}; rankPool(allFighters).forEach((o,i)=>oldRanks[o.id]=i);
  const r=G.roster.filter(o=>!o.champion);
  const simCount=Math.min(Math.floor(r.length/1.5),20); // plafonné : roster amateur = 100, sans cap ça ferait ~66 combats simulés à chaque cycle
  const fought=new Set();
  for(let n=0;n<simCount;n++){ const a=pick(r),b=pick(r); if(a===b)continue; const res=simulateFight(a,b,3); applyResult(a,b,res,'A'); applyResult(b,a,res,'B');
    if(a.orgElo===undefined) a.orgElo=eloBaseline(a.org,a.overall); if(a.careerElo===undefined) a.careerElo=eloBaseline(a.org,a.overall);
    if(b.orgElo===undefined) b.orgElo=eloBaseline(b.org,b.overall); if(b.careerElo===undefined) b.careerElo=eloBaseline(b.org,b.overall);
    const d=calculateEloDelta(a.orgElo,b.orgElo,res.winner,res.method,res.round);
    a.orgElo=Math.max(500,a.orgElo+d.deltaA); b.orgElo=Math.max(500,b.orgElo+d.deltaB);
    a.careerElo=Math.max(500,a.careerElo+Math.round(d.deltaA*0.5)); b.careerElo=Math.max(500,b.careerElo+Math.round(d.deltaB*0.5));
    a.inactivityCycles=0; b.inactivityCycles=0; fought.add(a.id); fought.add(b.id);
  }
  // Décroissance d'inactivité (Rank Rust) : un PNJ non-combattant depuis 3+
  // cycles perd progressivement en crédibilité Elo.
  G.roster.forEach(o=>{ if(fought.has(o.id))return;
    if(o.inactivityCycles===undefined) o.inactivityCycles=0;
    o.inactivityCycles++;
    if(o.inactivityCycles>3){
      if(o.orgElo!==undefined) o.orgElo=Math.max(600,Math.round(o.orgElo*0.985));
      if(o.careerElo!==undefined) o.careerElo=Math.max(600,Math.round(o.careerElo*0.985));
    }
  });
  // ==== [ANCRE: CYCLE_VIE_PNJ] — manque confirmé : aucun PNJ ne vieillissait ni
  // ne prenait sa retraite en dehors des régénérations complètes de roster. Le
  // roster restait figé indéfiniment entre deux changements d'organisation.
  const freshR=[];
  G.roster.forEach(o=>{
    if(o.champion){ freshR.push(o); return; } // un champion ne part jamais sur un tirage aléatoire
    if(rnd()<0.15) o.age=(o.age||20)+1;
    const isNemesis=G.faith && o.id===G.f.faithNemesisId; // vieillit normalement, mais ne peut jamais être remplacée par un nouveau prospect
    const isTooOld=!isNemesis && (o.age>=39 && rnd()<0.5);
    const isWashedUp=!isNemesis && ((o.streak||0)<=-4);
    const totalOF=o.W+o.L;
    const isGatekeeper=!isNemesis && (totalOF>=15 && o.L>o.W+4);
    if(isTooOld||isWashedUp||isGatekeeper){
      const lv=clamp(orgLevel(G.f.org)+RI(-8,15),20,97);
      const prospect=makeFighter({gender:o.gender,div:o.div,level:lv,potential:lv+RI(3,14),age:RI(20,23)});
      prospect.org=o.org; prospect.W=0; prospect.L=0; prospect.D=0; prospect.streak=0;
      prospect.orgElo=Math.max(500,eloBaseline(o.org,prospect.overall)-60);
      prospect.careerElo=eloBaseline(o.org,prospect.overall);
      freshR.push(prospect);
    } else { freshR.push(o); }
  });
  G.roster=freshR;
  // ==== [FIN ANCRE] ====
  G.roster=rankPool(G.roster);
  rankPool(G.roster.concat([G.f])).forEach((o,i)=>{ const oldRk=oldRanks[o.id]; o.lastRankDelta=oldRk!==undefined?(oldRk-i):0; });
}

/* --------------------------- 3 adversaires + % ---------------------------- */
/* ==== [ANCRE: LEGENDS_RECONSTRUCT] — reconstruit un combattant simulable à
   partir des données figées du Panthéon. Utilise l.div (vrai ID de division)
   et l.styleKey (vrai ID de style) — PAS l.style/l.divName qui sont des noms
   d'affichage humains, incompatibles avec divById()/STYLES[] qui cherchent
   par ID exact. ==== */
// Neutralise l'avantage d'allonge entre deux combattants pour un combat
// d'exhibition inter-catégories (Fantasy Fight, Vs Ami, All-Stars) : on
// juge le combattant, pas son gabarit. N'affecte jamais les combats de
// carrière réels, qui restent intra-division par construction.
function neutralizeWeightGap(A,B){
  const avgReach=Math.round((((A.phys&&A.phys.reach)||0)+((B.phys&&B.phys.reach)||0))/2);
  if(A.phys) A.phys.reach=avgReach;
  if(B.phys) B.phys.reach=avgReach;
}
// Export/import d'une légende sous forme de code texte copiable — permet à un
// ami de partager une légende de SON Panthéon (stocké uniquement sur son
// appareil, il n'y a pas de serveur) pour l'affronter dans Vs Ami. Le code
// encode exactement la même forme d'objet que les entrées du Panthéon
// (voir enshrine() dans state.js), donc reconstructLegend() les traite de
// façon identique, qu'elles viennent de ton Panthéon ou d'un import.
function encodeLegendCode(l){
  try{ return btoa(unescape(encodeURIComponent(JSON.stringify(l)))); }catch(e){ return null; }
}
function decodeLegendCode(code){
  try{
    const obj=JSON.parse(decodeURIComponent(escape(atob((code||'').trim()))));
    if(!obj || !obj.name || !obj.attrs) return null;
    return obj;
  }catch(e){ return null; }
}
function reconstructLegend(l){
  const f=makeFighter({gender:'H',div:l.div||'H-welter',style:l.styleKey||'mma',first:l.name,age:l.age||35});
  if(l.attrs) f.attrs=JSON.parse(JSON.stringify(l.attrs));
  if(l.skills) f.skills=l.skills.slice();
  if(l.phys) f.phys=l.phys;
  if(l.overall) f.overall=l.overall;
  f.id=l.id||('legend_'+RI(1000,9999));
  f.name=l.name; f.first=l.name; f.last=l.name; f.nick=l.nick; f.flag=l.flag; f.styleLabel=l.style||l.styleKey; f.divName=l.divName||l.div;
  f.W=l.W; f.L=l.L; f.ko=l.ko; f.sub=l.sub; f.champion='monde';
  return f;
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: CARD_SLOT_POSTER] — placement sur la carte d'événement et
   affiche officielle, jamais construits auparavant (confirmé absent). ==== */
function getCardSlot(f,kind){
  if(f.org===0) return "CARTE AMATEUR";
  if(kind==='title'||kind==='defense') return "MAIN EVENT";
  const rnk=divRank(f);
  if(rnk<=3) return "CO-MAIN EVENT";
  if(rnk<=7) return "MAIN CARD";
  if(rnk<=12) return "PRELIMS";
  return "EARLY PRELIMS";
}
function renderFightPoster(f,opp,kind){
  const slot=getCardSlot(f,kind);
  const slotColors={'CARTE AMATEUR':'var(--muted)','EARLY PRELIMS':'var(--line)','PRELIMS':'#4DA6FF','MAIN CARD':'var(--sage)','CO-MAIN EVENT':'var(--blood)','MAIN EVENT':'var(--gold)'};
  const borderColor=slotColors[slot]||'var(--gold-d)';
  const orgName=orgDisplayName(f).toUpperCase();
  const fLast=esc(f.last||f.name).toUpperCase();
  const oppLast=esc(opp.last||opp.name).toUpperCase();
  return `<div class="card glass raise" style="text-align:center;background:linear-gradient(180deg,var(--panel2) 0%,var(--bg) 100%);border-color:${borderColor};padding:24px 16px;margin-bottom:24px;position:relative;overflow:hidden">
    <div style="position:absolute;top:-20px;left:-20px;font-size:120px;opacity:0.03;font-family:'Oswald';font-weight:700;color:var(--gold);pointer-events:none;z-index:0">${orgName}</div>
    <div class="eyebrow gold mb" style="position:relative;z-index:2;letter-spacing:0.3em">${orgName} // ${slot}</div>
    <div class="disp" style="position:relative;z-index:2;font-size:clamp(32px,9vw,42px);line-height:1.1;margin:12px 0">
      <span style="color:var(--text)">${fLast}</span><br>
      <span class="muted" style="font-size:18px;display:inline-block;margin:8px 0;font-family:'JetBrains Mono'">VS</span><br>
      <span style="color:var(--sage)">${oppLast}</span>
    </div>
    <div class="mono small muted mt" style="position:relative;z-index:2;border-top:1px solid var(--line);padding-top:12px">${(f.divName||'').toUpperCase()} BOUT · ${(kind==='title'||kind==='defense')?'5 ROUNDS':'3 ROUNDS'}</div>
  </div>`;
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: ECRAN_FANTASY_SETUP] ==== */
function scr_fantasySetup(){
  const list=loadHOF();
  if(list.length<2){
    return `<div class="scr center intro"><div class="eyebrow gold">Fantasy Fight</div><h2 class="disp">Choc des légendes</h2><p class="lede">Il faut au moins 2 légendes au Panthéon pour simuler un combat.</p><button class="btn ghost mt" onclick="CL.go('legends')">Retour</button></div>`;
  }
  let selA=G.fantasyA!==undefined?G.fantasyA:0;
  let selB=G.fantasyB!==undefined?G.fantasyB:(list.length>1?1:0);
  const lA=list[selA], lB=list[selB];
  return `<div class="scr center intro">
    <div class="eyebrow gold">Sandbox</div>
    <h2 class="disp">Fantasy Fight</h2>
    <p class="lede small">Sélectionne deux anciennes gloires du Panthéon pour un super-fight virtuel (5 rounds). Leurs attributs de fin de carrière sont préservés.</p>
    <div style="display:flex;justify-content:space-between;align-items:center;margin:32px 0">
       <div style="flex:1;text-align:center">
         <div class="hero-name" style="font-size:22px;color:var(--blood)">${esc(lA.name)} ${lA.flag}</div>
         <div class="muted small mb">${lA.style} · ${lA.W}-${lA.L}</div>
         <button class="btn ghost" style="display:inline-block;width:auto;padding:8px" onclick="CL.setFantasy(0,-1)">◀</button>
         <button class="btn ghost" style="display:inline-block;width:auto;padding:8px" onclick="CL.setFantasy(0,1)">▶</button>
       </div>
       <div class="disp gold" style="font-size:24px;padding:0 12px">VS</div>
       <div style="flex:1;text-align:center">
         <div class="hero-name" style="font-size:22px;color:var(--sage)">${esc(lB.name)} ${lB.flag}</div>
         <div class="muted small mb">${lB.style} · ${lB.W}-${lB.L}</div>
         <button class="btn ghost" style="display:inline-block;width:auto;padding:8px" onclick="CL.setFantasy(1,-1)">◀</button>
         <button class="btn ghost" style="display:inline-block;width:auto;padding:8px" onclick="CL.setFantasy(1,1)">▶</button>
       </div>
    </div>
    <button class="btn primary" style="font-size:18px;padding:16px" onclick="CL.launchFantasyFight()">SIMULER LE CHOC</button>
    <button class="btn ghost mt" onclick="CL.leaveSandbox()">Retour à la salle</button>
  </div>`;
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: ECRAN_ALLSTARS] ==== */
function scr_allstars(){
  const t=G.allstars;
  if(!t) return `<div class="scr center intro"><p class="lede">Aucun tournoi en cours.</p><button class="btn ghost mt" onclick="CL.go('legends')">Retour</button></div>`;
  let h=`<div class="scr"><div class="bar"><span class="eyebrow">Tournoi All-Stars</span><span class="eyebrow x" onclick="CL.leaveAllStars()">✕</span></div>
         <h2 class="disp gold" style="font-size:32px">CHOC DES TITANS</h2>`;
  if(t.champion){
    h+=`<div class="card glass raise" style="text-align:center;padding:32px 16px;background:var(--panel2);border-color:var(--gold)">
          <div class="eyebrow gold mb">VAINQUEUR DU TOURNOI</div>
          <div style="font-size:60px">${getStyleEmoji(t.champion.styleLabel||t.champion.style)}</div>
          <div class="disp" style="font-size:42px;margin:16px 0">${esc(t.champion.name).toUpperCase()} ${t.champion.flag}</div>
          <p class="muted small">${getFighterBlurb(t.champion)}</p>
        </div>
        <button class="btn ghost mt" onclick="CL.leaveAllStars()">Retour à la Salle des Légendes</button>`;
  } else {
    h+=`<div class="eyebrow mb" style="color:var(--text);border-bottom:1px solid var(--line);padding-bottom:8px">${t.step.toUpperCase()}</div>
        <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:24px">`;
    t.matches.forEach(m=>{
      h+=`<div class="card glass" style="background:var(--panel2);padding:12px;display:flex;justify-content:space-between;align-items:center;opacity:${m.winner?0.55:1}">
            <div style="flex:1;text-align:right;font-family:'Oswald';font-size:18px">${getStyleEmoji(m.a.styleLabel||m.a.style)} ${esc(m.a.name)} ${m.a.flag}</div>
            <div class="mono muted" style="padding:0 16px;font-size:12px">${m.winner?(m.winner===m.a?'◀ GAGNE':'GAGNE ▶'):'VS'}</div>
            <div style="flex:1;text-align:left;font-family:'Oswald';font-size:18px">${m.b.flag} ${esc(m.b.name)} ${getStyleEmoji(m.b.styleLabel||m.b.style)}</div>
          </div>`;
    });
    const remaining=t.matches.filter(m=>!m.winner).length;
    h+=`</div><button class="btn primary" style="font-size:18px;padding:16px" onclick="CL.advanceAllStars()">${remaining?'COMBAT SUIVANT':'PASSER AU TOUR SUIVANT'}</button>`;
  }
  if(t.history && t.history.length>0){
    h+=`<div class="card mt"><div class="eyebrow mb">Résultats précédents</div>`;
    t.history.forEach(log=>{ h+=`<div class="mono small" style="color:var(--sage);padding:4px 0;border-bottom:1px dotted var(--line)">${esc(log)}</div>`; });
    h+=`</div>`;
  }
  h+=`</div>`;
  return h;
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: ECRAN_VS_FRIEND] ==== */
function scr_vs_friend(){
  const list=loadHOF();
  const imported=G.importedFriendLegend;
  if(list.length===0){
    return `<div class="scr center intro"><div class="eyebrow gold">Défi Multijoueur</div><h2 class="disp">Panthéon vide</h2><p class="lede">${imported?`La légende de ${esc(imported.name)} a bien été importée, mais il te faut aussi au moins 1 légende dans TON propre Panthéon pour te représenter.`:'Il te faut au moins 1 légende au Panthéon pour défier un ami.'}</p><button class="btn ghost mt" onclick="CL.go('legends')">Retour</button></div>`;
  }
  if(list.length<2 && !imported){
    return `<div class="scr center intro">
      <div class="eyebrow gold">Défi Multijoueur</div>
      <h2 class="disp">Combattant d\u2019un ami</h2>
      <p class="lede small">Colle ici le code que ton ami t\u2019a envoyé (généré depuis son Panthéon, bouton "Exporter"). Sans code, il te faut au moins 2 légendes dans ton propre Panthéon.</p>
      <textarea id="friend_code" placeholder="Colle le code ici..." style="width:100%;min-height:80px;background:var(--panel2);color:var(--text);border:1px solid var(--line);padding:10px;font-family:'JetBrains Mono';font-size:12px;margin-top:16px"></textarea>
      <button class="btn primary mt" onclick="CL.importFriendCode()">IMPORTER LE CODE</button>
      <button class="btn ghost mt" onclick="CL.leaveSandbox()">Retour à la salle</button>
    </div>`;
  }
  let selA=G.vsFriendSelA!==undefined?G.vsFriendSelA:0;
  let selB=G.vsFriendSelB!==undefined?G.vsFriendSelB:(list.length>1?1:0);
  const lA=list[selA];
  const lB=imported||list[selB];
  return `<div class="scr center intro">
    <div class="eyebrow gold">Défi Multijoueur</div>
    <h2 class="disp">Combattant d\u2019un ami</h2>
    <p class="lede small">Choisis ta légende. ${imported?'La légende de ton ami a été importée.':'Choisis la légende de ton Panthéon que ton ami incarne, ou importe un vrai code d\u2019ami ci-dessous.'} Le combat se déroule dans ta catégorie de poids.</p>
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin:32px 0;gap:16px">
      <div style="flex:1;text-align:center">
         <div class="eyebrow mb">Ta légende</div>
         <div class="hero-name" style="font-size:22px;color:var(--blood)">${esc(lA.name)}</div>
         <div class="muted small mb">${lA.style} · OVR ${lA.overall||'?'}</div>
         <div><button class="btn ghost" style="display:inline-block;width:auto;padding:8px" onclick="CL.setVsFriendPlayer(0,-1)">◀</button>
         <button class="btn ghost" style="display:inline-block;width:auto;padding:8px" onclick="CL.setVsFriendPlayer(0,1)">▶</button></div>
      </div>
      <div class="disp gold" style="font-size:24px;padding-top:20px">VS</div>
      <div style="flex:1;text-align:center">
         <div class="eyebrow mb">${imported?'Légende importée de l\u2019ami':'Légende de l\u2019ami'}</div>
         <div class="hero-name" style="font-size:22px;color:var(--sage)">${esc(lB.name)}</div>
         <div class="muted small mb">${lB.style} · OVR ${lB.overall||'?'}</div>
         ${imported?`<button class="btn ghost" style="width:auto;padding:8px" onclick="CL.clearImportedFriend()">Retirer l\u2019import</button>`:
           `<div><button class="btn ghost" style="display:inline-block;width:auto;padding:8px" onclick="CL.setVsFriendPlayer(1,-1)">◀</button>
           <button class="btn ghost" style="display:inline-block;width:auto;padding:8px" onclick="CL.setVsFriendPlayer(1,1)">▶</button></div>`}
      </div>
    </div>
    ${!imported?`<div class="glass card mb" style="background:var(--panel2);padding:12px;text-align:left">
      <div class="eyebrow mb">Importer une vraie légende d\u2019ami</div>
      <textarea id="friend_code" placeholder="Colle le code de ton ami ici..." style="width:100%;min-height:60px;background:var(--bg);color:var(--text);border:1px solid var(--line);padding:8px;font-family:'JetBrains Mono';font-size:11px"></textarea>
      <button class="btn ghost mt" style="width:auto;padding:6px 12px" onclick="CL.importFriendCode()">Importer</button>
    </div>`:''}
    <button class="btn primary" style="font-size:18px;padding:16px" onclick="CL.launchVsFriend()">LANCER LE DÉFI</button>
    <button class="btn ghost mt" onclick="CL.leaveSandbox()">Retour à la salle</button>
  </div>`;
}
/* ==== [FIN ANCRE] ==== */

function tacticalRead(f,o){ const a=eff(f),b=eff(o);
  let prefix=(o.styleLabel||'')+'. '; const fights=o.W+o.L+o.D;
  if(fights<=5 && o.W>o.L) prefix+='Jeune loup imprévisible. ';
  else if(o.streak<=-2 && o.age>=32) prefix+='Vétéran sur le déclin. ';
  else if(o.streak>=3) prefix+='Sur une grosse série de victoires. ';
  // cohérence avec le scouting affiché (striking/grappling/danger) : si au moins
  // 2 des 3 catégories montrées penchent nettement dans le même sens, la lecture
  // tactique doit le refléter — pas seulement l'écart d'overall, qui peut rester
  // sous le seuil même quand les 3 catégories visibles sont unanimes.
  const oStr=(o.attrs.jab+o.attrs.cross+o.attrs.hook+o.attrs.kick)/4, fStr=(f.attrs.jab+f.attrs.cross+f.attrs.hook+f.attrs.kick)/4;
  const oGrap=(o.attrs.takedown+o.attrs.submission+o.attrs.topControl)/3, fGrap=(f.attrs.takedown+f.attrs.submission+f.attrs.topControl)/3;
  const oDan=o.attrs.power, fDan=f.attrs.power;
  const edgeOpp=[oStr-fStr,oGrap-fGrap,oDan-fDan].filter(d=>d>=8).length;
  const edgeMe=[oStr-fStr,oGrap-fGrap,oDan-fDan].filter(d=>d<=-8).length;
  let base='Combat équilibré — l\u2019intelligence fera la différence.';
  if(b.striking>b.ground+12 && b.striking>a.striking) base='Redoutable debout — amène-le au sol.';
  else if(b.takedown>a.tdd+10) base='Gros lutteur — garde la cage dans le dos, sprawle.';
  else if(b.submission>a.guard+12) base='Dangereux au sol — reste debout, méfie-toi du cou.';
  else if(a.overall>o.overall+8 || edgeMe>=2) base='Sur le papier, tu domines. Ne te relâche pas.';
  else if(o.overall>f.overall+8 || edgeOpp>=2) base='Plus fort que toi. Il te faudra un plan.';
  return prefix+base;
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
  let chosen=[];
  if(G.tournament && G.tournament.active && f.org===0){
    const myMatch=G.tournament.matches.find(m=>m.a.id===f.id || m.b.id===f.id);
    if(myMatch){
      const rival=myMatch.a.id===f.id?myMatch.b:myMatch.a;
      return [{o:rival, read:`Élimination directe.`, context:`TOURNOI ${G.tournament.cfg.label} — ${G.tournament.step}`}];
    }
  }
  const isDefense=!!f.champion;
  const isTitle=(!isDefense && isTitleEligible(f));
  if(isTitle){ const champ=pool.find(o=>o.champion)||pool[0];
    return [{o:champ, read:tacticalRead(f,champ), context:`COMBAT DE TITRE`}]; }
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
    // Filet de sécurité explicite : premier combat pro (0 combat dans cette
    // organisation), en plus de la protection déjà assurée par le clamp de rk
    // ci-dessus — garantit que les 3 propositions viennent du tout bas du
    // classement, sans dépendre du bon comportement de p4pScore/findIndex.
    if(f.org>0 && (f.W+f.L+(f.D||0))===0 && normalPool.length>=5){
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
  return uniqueOpps.map(o=>{ let read=tacticalRead(f,o);
    if(f.rivalId===o.id) read='RIVALITÉ. '+read;
    return {o, read}; });
}


function trainingOptions(f){ const gen=TRAIN.filter(x=>x.t.includes('all'));
  const spec=TRAIN.filter(x=>x.t.includes(f.style));
  const opts=[]; const s=spec.slice(); const g=gen.slice();
  // 2 liées au sport + 1 générale (mélangées)
  for(let i=0;i<2&&s.length;i++) opts.push(s.splice(Math.floor(rnd()*s.length),1)[0]);
  if(g.length) opts.push(g.splice(Math.floor(rnd()*g.length),1)[0]);
  while(opts.length<3 && g.length) opts.push(g.splice(Math.floor(rnd()*g.length),1)[0]);
  const exclusive=(typeof getExclusiveTraining==='function')?getExclusiveTraining(f):[];
  return opts.sort(()=>rnd()-0.5).concat(exclusive);
}

/* ------------------------------- flux ------------------------------------- */
function startFightSelect(){ if(G.f.injury) return; G.opps=genOpponents(G.f); G.screen='select'; save(); render(); }
function chooseOpponent(i){ G.sel=G.opps[i]; G.train=trainingOptions(G.f); generateSponsorObjective(G.f);
  G.f._rivalryPressDone=false; G.pressConf=(typeof triggerRivalPressConference==='function')?triggerRivalPressConference(G.f,G.sel.o):null;
  G.screen='camp'; save(); render(); }
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
    G.screen='hub'; save(); render(); return;
  }
  return finishTrainingFlow(null);
}
function finishTrainingFlow(pendingOppMalus){
  const kind=fightKind(); const opp=G.sel.o; const rounds=(kind==='title'||kind==='defense')?5:3;
  G.fight={kind,opp,rounds,malus:null,oppMalus:pendingOppMalus||null};
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
        G.f.champChampTarget=null; delete G.f._champChampHomeDiv; delete G.f._champChampHomeRoster;
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
    // Négociation : l'adversaire peut accepter de maintenir le combat contre une part de la bourse
    G.activeEvent={
      title:'Pesée ratée (Catchweight)',
      text:`Catastrophe sur la balance : ${wc.cutKg.toFixed(1)}kg au-dessus de la limite (${wc.limit}kg). Le combat devait être annulé, mais ${esc(opp.name)} accepte de maintenir l\u2019affrontement si vous lui cédez 35% de votre bourse. Vos capacités physiques seront fortement réduites ce soir.`,
      btn:'Accepter l\u2019amende et combattre', actionId:'botched_weight_accept',
      btn2:'Annuler le combat', actionId2:'botched_weight_decline'
    };
    G.screen='event'; save(); render(); return;
  }
  if(cutMods) G.fight.malus=Object.assign({},G.fight.malus,cutMods);
  // ==== [ANCRE: ADVERSAIRE_SURPOIDS] — l'inverse du catchweight joueur : c'est
  // l'adversaire qui rate sa pesée. Ici pas de tirage aléatoire côté adversaire :
  // c'est le JOUEUR qui choisit d'accepter (l'adversaire plus lourd gagne un vrai
  // bonus mécanique) ou de refuser (combat annulé). ====
  if(rnd()<0.1){
    const oppOverKg=+(RI(2,8)+rnd()).toFixed(1);
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
/* ==== [ANCRE: EVENEMENT] — blessures/coupe de poids, disruptif façon Destiny Eleven.
   H-heavy (poids lourd) et F-feather (poids plume) sont les catégories les PLUS
   HAUTES de leur genre (pas les plus petites) : la condition sert à empêcher
   toute tentative de "monter de catégorie" pour un combattant déjà au sommet,
   faute de catégorie supérieure où l'envoyer. ==== */
function generateRandomEvent(){ const f=G.f;
  const isTopDivision=(f.div==='H-heavy' || f.div==='F-feather');
  let pool=['minor_injury','minor_injury','training_partner_hurt','old_injury_flareup'];
  if(rnd()<0.25) pool.push('major_injury');
  if(f.W+f.L+(f.D||0)>=3) pool.push('hometown_crowd');
  // ==== [ANCRE: EVENEMENTS_ARGENT] — dilemmes financiers, réservés aux pros ====
  if(f.org>0){
    pool.push('media_chaos');
    if(f.org>=2) pool.push('coaching_change');
    if(f.org>=3) pool.push('streaming_deal');
    if(f.org>=5) pool.push('sponsor_clash','short_notice_money');
    if(f.org===4) pool.push('sell_out_fight');
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
  let title='', text='', btn='Continuer', actionId=type;
  const dynMatch=DYNAMIC_EVENTS.find(e=>e.id===type);
  if(dynMatch){
    title=dynMatch.title; text=dynMatch.text;
    if(dynMatch.malus) G.fight.malus=Object.assign({},G.fight.malus,dynMatch.malus);
    if(dynMatch.bonus && dynMatch.bonus.morale) f.morale=clamp(f.morale+dynMatch.bonus.morale,0,100);
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
    G.fight.malus={footSpeed:-15,explosiveness:-12};
  } else if(type==='major_injury'){
    title='Déchirure !';
    text='Sur un appui anodin à l\u2019entraînement, un claquement sourd. Le médecin est catégorique : combat annulé, et plusieurs mois de rééducation.';
    btn='Accepter le sort';
  } else if(type==='training_partner_hurt'){
    title='Partenaire d\u2019entraînement blessé';
    text='Ton partenaire de sparring principal se blesse à dix jours du combat. Impossible de reproduire son style à temps, la préparation en pâtit.';
    G.fight.malus={fightIQ:-10,adaptability:-8};
  } else if(type==='old_injury_flareup'){
    title='Vieille blessure qui se réveille';
    text='Cette épaule que tu t\u2019es abîmée il y a des années recommence à te lâcher pendant les derniers rounds de sparring. Rien de cassé, mais la confiance en prend un coup.';
    G.fight.malus={durability:-10,confidence:-8};
  } else if(type==='hometown_crowd'){
    title='Retour au pays';
    text='Le combat se tient près de chez toi. Ta famille, tes potes de toujours, la salle qui t\u2019a vu débuter : tout le monde sera là ce soir.';
    f.morale=clamp(f.morale+15,0,100); f.form=clamp(f.form+8,0,100);
  } else if(type==='media_chaos'){
    title='Conférence de presse chaotique';
    text='La conférence de presse dégénère en foire d\u2019empoigne verbale avec ton adversaire. Les caméras adorent ça, ton mental un peu moins.';
    G.fight.malus={composure:-15};
    f.morale=clamp(f.morale+10,0,100);
  } else if(type==='coaching_change'){
    title='Changement de coach';
    text='Ton entraîneur principal part accompagner un autre combattant à dix jours du combat. Tu dois t\u2019adapter à une nouvelle voix dans le coin.';
    G.fight.malus={adaptability:-12,composure:-8};
  } else if(type==='streaming_deal'){
    title='Contrat de streaming exclusif';
    text='Une plateforme de streaming te propose un cachet supplémentaire pour une exclusivité média, contre un calendrier de déplacements épuisant avant le combat.';
    f.earnings=(f.earnings||0)+80; f.form=clamp(f.form-10,0,100);
  } else if(type==='short_notice_money'){
    title='Sauver la carte (Short Notice)';
    const oldOppName=G.fight.opp.name;
    const swapPool=G.roster.filter(o=>o.id!==f.id && o.id!==G.fight.opp.id);
    const newOpp=swapPool.length?pick(swapPool):G.fight.opp;
    G.fight.opp=newOpp;
    text=`${esc(oldOppName)} se blesse et se retire du main-event. L\u2019organisation vous supplie de sauver la carte contre ${esc(newOpp.name)} avec seulement 4 jours de préparation, contre une prime gigantesque (500 000 $ garantis). Votre forme physique sera catastrophique.`;
    // 'form' est un champ direct du combattant (f.form), pas un attribut de f.attrs :
    // il ne peut pas passer par G.fight.malus (qui n'agit que sur f.attrs).
    G.fight.malus={cardio:-25};
    f.form=clamp(f.form-30,0,100);
    f.earnings=(f.earnings||0)+500;
  } else if(type==='sponsor_clash'){
    title='Guerre de Sponsors';
    text='Vous avez porté les couleurs d\u2019un sponsor concurrent lors de la pesée. L\u2019organisation vous met à l\u2019amende (perte de 150 000 $) mais votre aura auprès des fans rebelles explose.';
    f.earnings=Math.max(0,(f.earnings||0)-150);
    f.morale=clamp(f.morale+20,0,100);
  } else if(type==='sell_out_fight'){
    title='Combat Arrangé ?';
    text='Un bookmaker véreux vous offre 200 000 $ pour perdre le premier round volontairement avant de reprendre le combat. Accepter vous draine mentalement et ruine votre concentration.';
    f.earnings=(f.earnings||0)+200;
    G.fight.malus={composure:-20};
    f.morale=clamp(f.morale-15,0,100);
  }
  G.activeEvent={title,text,btn,actionId};
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: SAISON] — moteur de bilan annuel + 70 trophées (audit §12).
   Corrigé par rapport au brouillon de Gemini : la vraie structure de combat
   est res.stats.A/res.stats.B (pas st.Me/st.Op) — remappée ici une seule fois
   à l'enregistrement pour que les 70 conditions restent lisibles telles
   quelles. Le rythme de vieillissement RÉEL est RI(2,4) (aléatoire), pas un
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
  hammer: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 4l-4 4M21.5 2.5a2.12 2.12 0 0 0-3 0L3 18l3 3 15.5-15.5a2.12 2.12 0 0 0 0-3z"/></svg>`
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
  {id:'a11',lbl:'La Mitrailleuse',c:(s,f)=>s.sigMe>=120},
  {id:'a12',lbl:'Le Sniper',c:(s,f)=>s.koW>=2&&s.sigMe<=40},
  {id:'a13',lbl:'Le Marteau',c:(s,f)=>s.kdMe>=3},
  {id:'a14',lbl:'Tête Brûlée',c:(s,f)=>s.sigMe>80&&s.sigOp>80},
  {id:'a15',lbl:'Bain de Sang',c:(s,f)=>s.sigMe+s.sigOp>=180},
  {id:'a16',lbl:'Menton d\u2019Acier',c:(s,f)=>s.sigOp>=100&&s.koL===0},
  {id:'a17',lbl:'Intouchable',c:(s,f)=>s.W>=2&&s.sigOp<=15},
  {id:'a18',lbl:'One-Punch Man',c:(s,f)=>s.r1KOs>=2},
  {id:'a19',lbl:'Puncheur de l\u2019année',c:(s,f)=>s.koW>=2},
  {id:'a20',lbl:'Guerre d\u2019Usure',c:(s,f)=>s.decW>=2&&s.sigMe>=90},
  {id:'a21',lbl:'Brawler',c:(s,f)=>s.sigMe>50&&s.sigOp>50&&s.koW>=1},
  {id:'a22',lbl:'L\u2019Exécuteur',c:(s,f)=>s.kdMe>=4},
  {id:'a23',lbl:'Mâchoire de Verre',c:(s,f)=>s.koL>=2},
  {id:'a24',lbl:'Chasseur de Foie',c:(s,f)=>s.koW>=1&&f.style==='kickboxer'},
  {id:'a25',lbl:'Coudes Rasoirs',c:(s,f)=>s.koW>=1&&f.style==='muayThai'},
  {id:'a26',lbl:'Le Chirurgien',c:(s,f)=>s.sigMe>=60&&s.sigOp<=20},
  {id:'a27',lbl:'Blitzkrieg',c:(s,f)=>s.r1KOs>=1&&f.style==='karate'},
  {id:'a28',lbl:'Casting Mortel',c:(s,f)=>s.koW>=1&&f.style==='sambo'},
  {id:'a29',lbl:'Dirty Boxer',c:(s,f)=>s.sigMe>=70&&s.ctrlMe>0},
  {id:'a30',lbl:'Main Lourde',c:(s,f)=>s.koW>=1&&f.attrs.power>=80},
  // --- GRAPPLING & CONTRÔLE (20) ---
  {id:'a31',lbl:'La Sangsue',c:(s,f)=>s.ctrlMe>=6},
  {id:'a32',lbl:'Machine à Takedowns',c:(s,f)=>s.tdMe>=8},
  {id:'a33',lbl:'Le Destructeur au Sol',c:(s,f)=>s.koW>=1&&s.ctrlMe>=2},
  {id:'a34',lbl:'L\u2019Étau',c:(s,f)=>s.subW>=2},
  {id:'a35',lbl:'Mur de Briques',c:(s,f)=>s.tdOp===0&&s.W>=2&&f.attrs.tdd>=80},
  {id:'a36',lbl:'Grappler de l\u2019année',c:(s,f)=>s.subW>=1&&s.tdMe>=4},
  {id:'a37',lbl:'Suplex City',c:(s,f)=>s.tdMe>=5&&f.style==='wrestler'},
  {id:'a38',lbl:'Artiste de la Fuite',c:(s,f)=>s.ctrlOp>=4&&s.subL===0&&s.W>=1},
  {id:'a39',lbl:'Anaconda',c:(s,f)=>s.subW>=1&&f.style==='bjj'},
  {id:'a40',lbl:'Tireur d\u2019Élite (Sol)',c:(s,f)=>s.subW>=1&&s.ctrlMe<=1},
  {id:'a41',lbl:'Le Compresseur',c:(s,f)=>s.ctrlMe>=8},
  {id:'a42',lbl:'Pression Daghestanaise',c:(s,f)=>s.tdMe>=4&&s.ctrlMe>=5},
  {id:'a43',lbl:'Le Voleur de Jambes',c:(s,f)=>s.subW>=1&&s.tdMe===0},
  {id:'a44',lbl:'Roi du Scramble',c:(s,f)=>s.tdMe>=3&&s.tdOp>=3},
  {id:'a45',lbl:'Anti-Lutte',c:(s,f)=>s.tdOp===0&&s.sigMe>=50},
  {id:'a46',lbl:'Sol Étouffant',c:(s,f)=>s.ctrlMe>=4&&s.sigOp<=10},
  {id:'a47',lbl:'Ceinture Noire',c:(s,f)=>s.subW>=2&&f.attrs.submission>=85},
  {id:'a48',lbl:'Ground & Pounder',c:(s,f)=>s.koW>=1&&s.ctrlMe>=3},
  {id:'a49',lbl:'Lutte Universitaire',c:(s,f)=>s.tdMe>=6&&s.subW===0},
  {id:'a50',lbl:'L\u2019Enclume',c:(s,f)=>s.ctrlOp>=6&&s.L===s.total},
  // --- NARRATIF & CONTEXTE (20) ---
  {id:'a51',lbl:'Upset de l\u2019année',c:(s,f)=>s.biggestUpset>=8},
  {id:'a52',lbl:'Le Gatekeeper',c:(s,f)=>s.W>=1&&s.L>=1&&s.highestOppRank<=5&&!f.champion},
  {id:'a53',lbl:'Le Marathonien',c:(s,f)=>s.decW===s.total&&s.total>=3},
  {id:'a54',lbl:'Hold-up',c:(s,f)=>s.decW>=1&&s.sigMe<s.sigOp&&s.ctrlMe<s.ctrlOp},
  {id:'a55',lbl:'Domination Totale',c:(s,f)=>s.flawless>=1},
  {id:'a56',lbl:'Le Bourreau des Favoris',c:(s,f)=>s.biggestUpset>=4&&s.koW>=1},
  {id:'a57',lbl:'Roi de la Décision',c:(s,f)=>s.decW>=2&&s.L===0},
  {id:'a58',lbl:'Tueur de Vétérans',c:(s,f)=>s.W>=2&&f.age<=25},
  {id:'a59',lbl:'Garde du Temple',c:(s,f)=>s.L>=2&&s.highestOppRank>=10&&s.highestOppRank<999},
  {id:'a60',lbl:'L\u2019Artisan',c:(s,f)=>s.W>=2&&s.sigMe<=60&&s.ctrlMe<=3},
  {id:'a61',lbl:'Hype Train',c:(s,f)=>s.W>=3&&f.streak>=5},
  {id:'a62',lbl:'Hype Déraillée',c:(s,f)=>s.L>=2&&f.streak<=-3},
  {id:'a63',lbl:'Vengeance',c:(s,f)=>s.W>=1&&s.closeFights>=1},
  {id:'a64',lbl:'Le Fantôme',c:(s,f)=>s.sigOp<=20&&s.L===0&&s.total>=2},
  {id:'a65',lbl:'L\u2019Acrobate',c:(s,f)=>s.koW>=1&&f.attrs.flexibility>=80},
  {id:'a66',lbl:'Le Survivant',c:(s,f)=>s.ctrlOp>=5&&s.sigOp>=50&&s.W>=1},
  {id:'a67',lbl:'Sang Froid',c:(s,f)=>s.closeFights>=2&&s.W>=2},
  {id:'a68',lbl:'L\u2019Opportuniste',c:(s,f)=>s.subW>=1&&s.ctrlMe===0},
  {id:'a69',lbl:'Constance',c:(s,f)=>s.total>=3&&s.L===0&&s.decW>=2},
  {id:'a70',lbl:'Année Noire',c:(s,f)=>s.L===s.total&&s.total>=2},
];
function evaluateSeason(f,fights){ const s=compileSeasonStats(f,fights);
  let won=[]; SEASON_AWARDS.forEach(a=>{ if(a.c(s,f)) won.push(a); });
  return {stats:s, trophies:won.slice(0,5)};
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: RECRUTEUR] — offre de contrat pro, favorise le spectacle sur le
   ratio V/D propre (audit "Dana White Privilege"). res.stats.wars n'existe pas
   (res.stats={A,B} seulement) — le caractère "guerre" du combat est recalculé
   ici en ligne à partir des vraies stats A/B, sur le même principe que le
   moteur de saison. ==== */
/* ==== [ANCRE: PHRASES_RECRUTEMENT] — formulations variées pour nommer l'orga
   qui recrute, au lieu du nom de palier générique ("Circuit local"). ==== */
const CONTRACT_PHRASES=[
 o=>`${o} vous veut.`,
 o=>`Vous avez tapé dans l\u2019œil de ${o}.`,
 o=>`${o} a suivi votre parcours de près.`,
 o=>`Un recruteur de ${o} s\u2019est déplacé pour vous voir combattre.`,
 o=>`${o} vous propose un contrat, séduit par vos performances.`,
];
/* ==== [FIN ANCRE] ==== */
function evaluateProOffer(f, res, oppRank){
  if(f.org!==0 || (f.proOfferCooldown||0)>0) return null;
  if(f.age>=26){
    const baseTier=1;
    const orgFlavor1=ORG_FLAVORS[baseTier]?pick(ORG_FLAVORS[baseTier]):ORGS[baseTier];
    const phrase1=pick(CONTRACT_PHRASES)(orgFlavor1);
    return { forced:true, msg:'La limite d\u2019âge du circuit amateur (26 ans) est atteinte. Vous êtes forcé de passer professionnel aujourd\u2019hui ou de ranger les gants.', orgFlavor1, phrase1, baseTier };
  }
  const totalFights=f.W+f.L+f.D;
  if(totalFights<5) return null;
  const finishes=f.ko+f.sub;
  const hypeScore=(f.ko*3.5)+(f.sub*2.5)+f.W-(f.L*0.5);
  const upset=oppRank<=10 && res.method!=='Décision';
  let threshold=35; if(f.age<=20) threshold=55; if(f.age>=23) threshold=25;
  if(hypeScore>=threshold || upset || (rnd()<0.05 && hypeScore>15)){
    let msg=''; const fastTrack=upset||finishes>=8;
    if(upset) msg='Ton finish retentissant sur un membre du Top 10 national a fait le tour des réseaux. Les promoteurs frappent à la porte.';
    else if(finishes>=8) msg=`Avec ton style ultra-spectaculaire (${finishes} finitions) et ta réputation de tueur, le public pro te réclame malgré tes ${f.L} défaites.`;
    else if(f.age<=20) msg=`Tu n\u2019as que ${f.age} ans, mais ta maturité dans la cage affole les recruteurs régionaux. Tu es un prospect majeur.`;
    else msg='Tes résultats réguliers et ton classement sur le circuit IMMAF t\u2019ouvrent enfin les portes du monde professionnel.';
    // L'organisation proposée dépend désormais du classement/hype plutôt que
    // d'être fixée à un tier arbitraire (item #9) — un meilleur palmarès amateur
    // ouvre l'accès à des organisations plus prestigieuses dès le départ.
    let baseTier=1; const rk=divRank(f);
    if(rk<=10 || hypeScore>=40) baseTier=2;
    if(rk<=3 || hypeScore>=60) baseTier=3;
    const orgFlavor1=ORG_FLAVORS[baseTier]?pick(ORG_FLAVORS[baseTier]):ORGS[baseTier];
    const phrase1=pick(CONTRACT_PHRASES)(orgFlavor1);
    const fastTier=Math.min(4, baseTier+1);
    let orgFlavor3=null, phrase3=null;
    if(fastTrack){ orgFlavor3=ORG_FLAVORS[fastTier]?pick(ORG_FLAVORS[fastTier]):ORGS[fastTier]; phrase3=pick(CONTRACT_PHRASES)(orgFlavor3); }
    return { forced:false, msg, fastTrack, orgFlavor1, phrase1, orgFlavor3, phrase3, baseTier, fastTier };
  }
  return null;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: NARRATIF_CONTEXTUEL] — citations médias générées par tags de
   combat. Corrigé par rapport au brouillon : l'UPSET utilise les rangs
   PRE-combat (myRankBefore/oppRankBefore, déjà calculés plus haut dans
   resolveFight) plutôt qu'un divRank() recalculé après coup — sinon la
   victoire elle-même fausse le classement avant que la condition ne soit
   vérifiée (même piège déjà rencontré et corrigé pour le leapfrog). ==== */
const NARRATIVES=[
  { tags:['WIN','RIVAL'], src:'Interview Octogone', txt:f=>`"Il a beaucoup parlé avant le combat. Aujourd'hui, on a vu qui était le vrai combattant. La page est tournée."` },
  { tags:['LOSS','RIVAL'], src:'Conférence de presse', txt:f=>`"C'est dur à avaler. Je le déteste toujours autant, mais ce soir il a été meilleur. Je vais retourner à la salle et on se recroisera."` },
  { tags:['WIN','RIVAL','KO'], src:'Commentateur', txt:f=>`"C'est la fin parfaite pour cette rivalité ! ${esc(f.name)} vient d'éteindre les lumières et de clore le débat de la manière la plus brutale qui soit !"` },
  { tags:['WIN','WAR'], src:'Tweet du Président', txt:f=>`"${esc(f.name)} et son adversaire viennent de nous offrir le combat de l'année. Les deux partent à l'hôpital, mais quel spectacle. Félicitations au vainqueur."` },
  { tags:['LOSS','WAR'], src:'Média Spécialisé', txt:f=>`"Même dans la défaite, la cote de popularité de ${esc(f.name)} va exploser. Une guerre absolue dans la cage ce soir."` },
  { tags:['WIN','SNOOZEFEST'], src:'Foule', txt:f=>`*Huées descendant des gradins pendant l'annonce de la décision.*` },
  { tags:['WIN','SNOOZEFEST'], src:'Tweet d\u2019un fan', txt:f=>`"Victoire tactique ou juste combat soporifique ? ${esc(f.name)} a fait le job, mais personne ne paiera un PPV pour revoir ça."` },
  { tags:['LOSS','SNOOZEFEST'], src:'Le Coin (Coach)', txt:f=>`"Tu l'as laissé voler les rounds. Tu n'as rien fait, il n'a rien fait, mais les juges lui ont donné. On ne peut s'en prendre qu'à nous-mêmes."` },
  { tags:['WIN','FLAWLESS','SUB'], src:'Expert Jiu-Jitsu', txt:f=>`"Une masterclass au sol. Il a emballé son adversaire sans prendre un seul coup. De l'art martial pur."` },
  { tags:['WIN','FLAWLESS','KO'], src:'Commentateur', txt:f=>`"C'était un meurtre télévisé. Zéro dégât encaissé, une précision chirurgicale. ${esc(f.name)} est intouchable ce soir."` },
  { tags:['WIN','PROSPECT','KO','ESTABLISHED'], src:'Média Spécialisé', txt:f=>`"Le hype train est officiellement inarrêtable. À seulement ${f.age} ans, il nettoie la division avec une violence inouïe."` },
  { tags:['WIN','VETERAN'], src:'Interview Octogone', txt:f=>`"Ne m'enterrez pas trop vite. Les jeunes courent vite, mais je connais le chemin. J'ai encore de belles années devant moi."` },
  { tags:['LOSS','VETERAN'], src:'Tweet Analyste', txt:f=>`"Le combat de trop ? Il faut savoir raccrocher les gants. ${esc(f.name)} a semblé subir le poids des années ce soir."` },
  { tags:['WIN','UPSET'], src:'Commentateur', txt:f=>`"INCROYABLE ! Personne ne lui donnait la moindre chance ! ${esc(f.name)} vient de choquer le monde entier !"` },
];
function generateNarrativeQuote(f,p){
  const tags=[]; const st=p.res.stats;
  const totalSig=(st.A.sig||0)+(st.B.sig||0);
  const oppSig=p.win?st.B.sig:st.A.sig;
  tags.push(p.win?'WIN':'LOSS');
  if(p.method.startsWith('KO')) tags.push('KO');
  if(p.method.startsWith('Soum')) tags.push('SUB');
  if(isDecisionLike(p.method)) tags.push('DEC');
  if(totalSig>120 || st.A.kd+st.B.kd>=2) tags.push('WAR');
  if(f.stage==='pro' && (f.W+f.L)>=4) tags.push('ESTABLISHED');
  if(isDecisionLike(p.method) && totalSig<30 && (st.A.ctrl<2 && st.B.ctrl<2)) tags.push('SNOOZEFEST');
  if(p.win && oppSig<=5) tags.push('FLAWLESS');
  if(p.opp && f.rivalId===p.opp.id) tags.push('RIVAL');
  if(f.age<=22) tags.push('PROSPECT');
  if(f.age>=34) tags.push('VETERAN');
  if(p.win && p.myRank-p.oppRank>5) tags.push('UPSET');
  const validQuotes=NARRATIVES.filter(n=>n.tags.every(t=>tags.includes(t)));
  if(validQuotes.length>0) return pick(validQuotes);
  if(p.win) return { src:'Déclaration', txt:f=>`"C'était le plan prévu. On retourne à l'entraînement dès lundi."` };
  return { src:'Déclaration', txt:f=>`"On gagne et on apprend. Je reviendrai plus fort."` };
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: ARCADE_GAUNTLET] — mode Draft Rapide, autonome, permadeath.
   Corrigé par rapport au brouillon : generateFighter() n'existe pas (utilise
   makeFighter() réel) ; les attrs fictifs à 5 clés (grappling, power seuls)
   sont remplacés par de vrais combattants à 30 attributs (avec des valeurs
   volontairement skewées pour le flavor) ; org:'gf' cassait ORGS[f.org]
   (index numérique attendu) ; alert() remplacé par de vrais écrans stylés.
   Ce mode ne touche JAMAIS resolveFight()/le circuit amateur/les saisons/les
   promotions — un flux de combat entièrement séparé, pour ne rien risquer
   sur le mode Carrière déjà testé. ==== */
function makeArcadeArchetype(spec){
  const f=makeFighter({gender:'H',div:spec.div,style:spec.style,countryKey:spec.country,first:spec.first,age:spec.age,potential:96,level:70});
  for(const k in spec.attrs) f.attrs[k]=spec.attrs[k];
  f.overall=overall(f); f.stage='pro'; f.org=4; f.morale=100; f.form=100;
  f.nick=spec.nick; f._perk=spec.perk; f.styleLabel=spec.styleLabel;
  if(spec.flag) f.flag=spec.flag; // drapeau de flavor, découplé du pays réel utilisé pour le patronyme
  return f;
}
/* 23 archétypes (audit "Draft Rapide"). Styles fictifs de Gemini (Sumo, Point
   Fighter, Capoeira, Kung Fu, Street, Showman...) n'existent pas dans le
   moteur : mappés sur le style RÉEL le plus proche pour le calcul, en gardant
   le styleLabel affiché tel quel. Pays hors des 14 réels (NL, JM, CO, AU, CN,
   CA) : countryKey substitué par un pays réel (patronyme), drapeau d'origine
   conservé pour l'affichage via le champ flag. */
/* ==== [ANCRE: LOT11_GAUNTLET_ETENDU] — archétypes légendes + mode Boss Run.
   Format vérifié identique à ARCADE_ARCHETYPES (nick,flag,country,style,
   styleLabel,div,age,attrs,perk). ==== */
const ARCADE_EXTENDED_ARCHETYPES=[
  {nick:'Le Chirurgien',flag:'🇯🇵',country:'JP',style:'bjj',styleLabel:'Leglocker',div:'H-light',age:28,
    attrs:{submission:98,flexibility:90,tdd:20,jab:10,cross:10,power:15,cardio:75,chin:40},
    perk:'Ne regarde jamais plus haut que le genou. S\u2019il attrape une cheville, vous êtes estropié.'},
  {nick:'Le Colosse de Chair',flag:'🇺🇸',country:'US',style:'wrestler',styleLabel:'Insubmersible',div:'H-heavy',age:36,
    attrs:{durability:99,chin:99,heart:99,power:85,footSpeed:10,handSpeed:20,cardio:90,takedown:50},
    perk:'Encaisse des frappes de tractopelle en souriant. Lent mais avance toujours.'},
  {nick:'L\u2019Hélicoptère',flag:'🇰🇷',country:'KR',style:'kickboxer',styleLabel:'Spinning Kicker',div:'H-feather',age:22,
    attrs:{kick:98,explosiveness:95,footSpeed:90,tdd:15,jab:20,chin:30,cardio:60,power:80},
    perk:'Des coups de pied retournés constants. Soit il vous éteint, soit il s\u2019épuise en un round.'}
];
const ARCADE_UNLOCKABLE_ARCHETYPES=[
  {unlockId:'arch_titan',nick:'Le Titan Antique',flag:'🇬🇷',country:'GR',style:'wrestler',styleLabel:'Titan',div:'H-heavy',age:39,
    attrs:{strength:99,durability:95,power:90,takedown:85,topControl:90,cardio:40,footSpeed:10},
    perk:'Une force herculéenne. Brise la volonté de tout ce qu\u2019il attrape.'},
  {unlockId:'arch_ninja',nick:'Le Shinobi',flag:'🇯🇵',country:'JP',style:'bjj',styleLabel:'Furtif',div:'H-light',age:26,
    attrs:{submission:98,footSpeed:95,handSpeed:90,adaptability:90,power:30,chin:40},
    perk:'Disparaît du champ de vision pour réapparaître accroché à un cou.'},
  {unlockId:'arch_brawler',nick:'Le Roi de la Rue',flag:'🇮🇪',country:'IE',style:'boxer',styleLabel:'Bare Knuckle',div:'H-welter',age:31,
    attrs:{hook:95,clinchStr:95,durability:90,heart:99,killer:90,tdd:60,cardio:75},
    perk:'Refuse d\u2019aller au sol. Transforme la cage en bagarre de pub.'}
];
function injectExtendedArchetypes(){
  ARCADE_EXTENDED_ARCHETYPES.forEach(a=>{ if(!ARCADE_ARCHETYPES.some(x=>x.nick===a.nick)) ARCADE_ARCHETYPES.push(a); });
  ARCADE_UNLOCKABLE_ARCHETYPES.forEach(a=>{
    if(checkLegendUnlock(a.unlockId) && !ARCADE_ARCHETYPES.some(x=>x.nick===a.nick)) ARCADE_ARCHETYPES.push(a);
  });
}
function startBossRun(){
  G.arcade={active:true,streak:0,target:5,pool:buildArcadePool(),mode:'boss_run',condition:'ko_only'};
  G.screen='draft'; save(); render();
}
function genBossOpponent(streak){
  const div=G.f.div;
  const lv=clamp(G.f.overall+5+streak*3,70,99);
  const o=makeFighter({gender:G.f.gender,div,style:pick(STYLE_KEYS),level:lv,potential:99,age:RI(26,33)});
  o.stage='pro'; o.org=6; o.champion='monde'; o.W=RI(18,30); o.L=RI(0,2); o.ko=RI(10,o.W); o.sub=RI(0,o.W-o.ko);
  o.nick=pick(['Le Tyran','Le Cauchemar','L\u2019Intouchable','Le Destructeur']);
  return o;
}
/* ==== [FIN ANCRE] ==== */
const ARCADE_ARCHETYPES=[
  { nick:'Le Bûcheron', flag:'🇺🇸', country:'US', style:'boxer', styleLabel:'Bagarreur', div:'H-heavy', age:34,
    attrs:{power:95,chin:90,durability:88,strength:85,cardio:32,tdd:30,submission:15,footSpeed:30,handSpeed:55},
    perk:'Frapper fort, dormir tôt. Un cardio de fumeur mais une droite nucléaire.' },
  { nick:'L\u2019Anaconda', flag:'🇧🇷', country:'BR', style:'bjj', styleLabel:'Maître du Sol', div:'H-light', age:26,
    attrs:{submission:95,guardWork:90,topControl:80,flexibility:88,power:28,handSpeed:35,footSpeed:45,chin:60},
    perk:'Si le combat va au sol, c\u2019est terminé. S\u2019il reste debout, vous êtes mort.' },
  { nick:'Le Cyborg', flag:'🇷🇺', country:'RU', style:'sambo', styleLabel:'Machine', div:'H-welter', age:21,
    attrs:{takedown:78,cardio:90,power:70,tdd:75,submission:65,chin:80,strength:75},
    perk:'Le prospect parfait. Équilibré, increvable, programmé pour détruire.' },
  { nick:'Le Kaiju', flag:'🇯🇵', country:'JP', style:'wrestler', styleLabel:'Colosse', div:'H-heavy', age:32,
    attrs:{power:98,chin:95,durability:95,strength:95,cardio:18,footSpeed:15,handSpeed:30,takedown:60},
    perk:'Une anomalie physique colossale. Lent, lourd, mais chaque pas fait trembler la cage.' },
  { nick:'Le Tacticien', flag:'🏴', country:'GB', style:'karate', styleLabel:'Manager', div:'H-welter', age:38,
    attrs:{jab:70,cross:65,footSpeed:75,fightIQ:90,composure:90,cardio:85,power:35,chin:70},
    perk:'Il gère l\u2019économie de ses frappes comme un budget. Il ne prend aucun risque inutile.' },
  { nick:'Le Poids du Corps', flag:'🇫🇷', country:'FR', style:'mma', styleLabel:'Gymnaste', div:'H-light', age:23,
    attrs:{cardio:99,flexibility:90,takedown:70,submission:65,jab:60,cross:60,power:45,chin:65},
    perk:'Zéro fonte, que de la traction et de la mobilité. Une force fonctionnelle et une endurance hallucinante.' },
  { nick:'La Brique', flag:'🇫🇷', country:'FR', style:'boxer', styleLabel:'Incassable', div:'H-heavy', age:28,
    attrs:{jab:75,cross:80,hook:80,chin:99,durability:95,power:78,cardio:55,tdd:25},
    perk:'Dur au mal, taillé dans la brique rouge du nord. Littéralement impossible à mettre KO.' },
  { nick:'Le Botaniste', flag:'🇳🇱', country:'GE', style:'kickboxer', styleLabel:'Méthodique', div:'H-welter', age:25,
    attrs:{kick:90,cross:70,composure:85,fightIQ:80,cardio:80,power:60,chin:75},
    perk:'La patience est une vertu. Il laisse ses adversaires s\u2019épuiser avant de les cueillir.' },
  { nick:'Le Fantôme', flag:'🇮🇪', country:'IE', style:'karate', styleLabel:'Insaisissable', div:'H-light', age:27,
    attrs:{footSpeed:98,jab:85,cross:75,cardio:85,power:50,chin:35,durability:30},
    perk:'Touche sans être touché. S\u2019il prend un seul coup net, les lumières s\u2019éteignent.' },
  { nick:'Le Zombie', flag:'🇰🇷', country:'KR', style:'mma', styleLabel:'Mort-Vivant', div:'H-welter', age:35,
    attrs:{chin:99,durability:95,heart:95,hook:55,takedown:60,submission:55,cardio:75,power:55},
    perk:'Avance constamment en encaissant tout. La pression psychologique finit par briser l\u2019adversaire.' },
  { nick:'L\u2019Assassin', flag:'🇹🇭', country:'TH', style:'muayThai', styleLabel:'Clinch', div:'H-light', age:24,
    attrs:{clinchStr:95,kick:85,power:88,killer:85,chin:60,cardio:70},
    perk:'Des coudes tranchants comme des lames. Cherche l\u2019ouverture pour une hémorragie rapide.' },
  { nick:'La Pieuvre', flag:'🇷🇺', country:'RU', style:'wrestler', styleLabel:'Lutteur', div:'H-welter', age:30,
    attrs:{takedown:98,submission:80,topControl:85,chin:80,cardio:75,power:35,jab:15},
    perk:'Dès que ses mains vous touchent, vous volez. Il étouffe ses adversaires pendant 15 minutes.' },
  { nick:'Le Professeur', flag:'🇨🇦', country:'CM', style:'mma', styleLabel:'Vétéran', div:'H-heavy', age:41,
    attrs:{fightIQ:98,adaptability:90,jab:70,cross:70,takedown:65,submission:65,chin:55,cardio:45},
    perk:'Il a tout vu, tout fait. Son QI de combat est infini, mais son corps commence à le lâcher.' },
  { nick:'Flash', flag:'🇯🇲', country:'GE', style:'karate', styleLabel:'Acrobate', div:'H-light', age:22,
    attrs:{kick:88,footSpeed:95,explosiveness:90,power:70,chin:45,cardio:90},
    perk:'Des coups de pied retournés sortis de nulle part. Spectaculaire mais terriblement imprévisible.' },
  { nick:'Le Boucher', flag:'🇲🇽', country:'MX', style:'boxer', styleLabel:'Guerre', div:'H-welter', age:31,
    attrs:{jab:78,cross:82,hook:82,power:80,chin:88,heart:90,cardio:85},
    perk:'Transforme chaque combat en un bain de sang dans une cabine téléphonique.' },
  { nick:'L\u2019Ours', flag:'🇷🇺', country:'RU', style:'sambo', styleLabel:'Force Pure', div:'H-heavy', age:29,
    attrs:{strength:98,power:92,takedown:85,submission:80,chin:88,cardio:35},
    perk:'Peut soulever des montagnes. Mais au bout de trois minutes, il hiberne.' },
  { nick:'Le Gamin', flag:'🇺🇸', country:'US', style:'wrestler', styleLabel:'Phénomène', div:'H-light', age:19,
    attrs:{takedown:82,cardio:99,heart:85,chin:75,power:45,submission:55},
    perk:'Sort à peine du lycée. Une énergie inépuisable et une arrogance qui rend fou.' },
  { nick:'L\u2019Aristocrate', flag:'🇬🇧', country:'GB', style:'boxer', styleLabel:'Noble Art', div:'H-welter', age:33,
    attrs:{jab:92,cross:80,footSpeed:70,tdd:65,composure:85,power:65,chin:75,cardio:70},
    perk:'Un jab d\u2019une précision chirurgicale. Refuse d\u2019aller au sol, trouve ça salissant.' },
  { nick:'Le Moine', flag:'🇨🇳', country:'CM', style:'karate', styleLabel:'Spirituel', div:'H-light', age:36,
    attrs:{composure:95,discipline:95,jab:75,kick:75,chin:82,cardio:80,power:60},
    perk:'Ne ressent pas la douleur. Un état zen qui perturbe l\u2019algorithme des juges.' },
  { nick:'Le Contrebandier', flag:'🇨🇴', country:'MX', style:'mma', styleLabel:'Sale', div:'H-welter', age:27,
    attrs:{clinchStr:70,killer:85,aggression:88,power:78,chin:80,takedown:55,submission:50,cardio:65},
    perk:'Doigts dans les yeux, accrochages à la cage. Il utilise tout ce que l\u2019arbitre ne voit pas.' },
  { nick:'Le Surfer', flag:'🇦🇺', country:'BR', style:'bjj', styleLabel:'Détendu', div:'H-light', age:24,
    attrs:{submission:85,guardWork:88,composure:90,flexibility:80,power:42,chin:70,cardio:80},
    perk:'Arrive dans la cage en tongs. Soumet ses adversaires avec un grand sourire.' },
  { nick:'Le Météore', flag:'🇳🇬', country:'NG', style:'kickboxer', styleLabel:'Explosif', div:'H-welter', age:26,
    attrs:{kick:92,cross:80,power:96,explosiveness:92,chin:65,cardio:38},
    perk:'Le round 1 est une exécution publique. Le round 2 est une agonie respiratoire.' },
  { nick:'La Machine à Sous', flag:'🇺🇸', country:'US', style:'mma', styleLabel:'Superstar', div:'H-welter', age:30,
    attrs:{jab:70,cross:70,takedown:55,submission:45,power:72,chin:72,cardio:72,confidence:90},
    perk:'Stats moyennes, mais il attire la lumière. Capable d\u2019un miracle quand les caméras tournent.' },
];
function buildArcadePool(){
  const shuffled=ARCADE_ARCHETYPES.slice().sort(()=>0.5-rnd());
  return shuffled.slice(0,3).map(makeArcadeArchetype);
}
function genArcadeOpponent(streak){
  const div=G.f.div; const lv=clamp(G.f.overall-20+streak*5,30,99);
  const o=makeFighter({gender:'H',div,style:pick(STYLE_KEYS),level:lv,potential:clamp(lv+8,50,99),age:RI(23,34)});
  o.stage='pro'; o.org=4; o.W=RI(3,20); o.L=RI(0,6); o.ko=RI(0,o.W);
  return o;
}
function resolveArcadeFight(){
  const opp=G.arcade.opponent;
  const res=simulateFight(G.f,opp,3);
  const win=applyResult(G.f,opp,res,'A'); applyResult(opp,G.f,res,'B');
  { const last=G.f.history[G.f.history.length-1];
    if(last){ last.oppName=opp.name; last.oppFlag=opp.flag; last.oppRank='NR'; last.season=(G.arcade.mode==='boss_run')?(G.arcade.streak+1):(G.arcade.tournament?G.arcade.tournament.roundStep:1); } }
  G.fight={kind:'arcade',opp,rounds:3,plan:null};
  G.pending={res,win,method:res.method,finish:!isDecisionLike(res.method),opp:{name:opp.name,flag:opp.flag}};
  buildTimeline(); G.screen='arena'; save(); render();
}
/* ==== [ANCRE: WTUMMA_BRACKET64] — refonte du Gauntlet en tournoi à
   élimination directe à 64 combattants. N'affecte QUE le mode normal
   (G.arcade.mode!=='boss_run') — le Boss Run reste sur son propre système
   streak-based, séparé et intact. ==== */
function buildWTUMMABracket(player){
  const pSeed=clamp(64-Math.floor((player.overall-40)/2),1,64);
  const pool=[]; const meta=loadMetaStats();
  for(let i=1;i<=64;i++){
    if(i===pSeed){ player.seed=i; pool.push(player); }
    else if(i===1 && meta.wtNemesis && meta.wtNemesis.div===player.div){
      const boss=makeFighter({gender:player.gender,div:player.div,style:meta.wtNemesis.style,level:90});
      boss.attrs=JSON.parse(JSON.stringify(meta.wtNemesis.attrs));
      boss.skills=[...meta.wtNemesis.skills]; boss.overall=meta.wtNemesis.overall;
      boss.name=meta.wtNemesis.name; boss.flag=meta.wtNemesis.flag; boss.nick="LE CHAMPION EN TITRE";
      boss.stage='pro'; boss.org=6; boss.seed=1; pool.push(boss);
    } else {
      const lv=clamp(95-Math.floor(i/1.5)+RI(-3,3),30,99);
      const o=makeFighter({gender:player.gender,div:player.div,style:pick(STYLE_KEYS),level:lv,potential:99,age:RI(20,35)});
      o.stage='pro'; o.org=6; o.seed=i; o.W=RI(15,35); o.L=RI(0,4);
      pool.push(o);
    }
  }
  // Si la Némésis a déjà été placée en pSeed par coïncidence (rare), on décale d'un cran pour éviter le doublon
  let matches=[]; for(let i=0;i<32;i++){ matches.push({a:pool[i],b:pool[63-i]}); }
  return {active:true,roundStep:1,stepName:'Top 64 (32èmes)',matches,playerSeed:pSeed};
}
function advanceWTUMMABracket(){
  const t=G.arcade.tournament; const survivors=[];
  t.matches.forEach(m=>{
    if(m.a.id===G.f.id||m.b.id===G.f.id){ survivors.push(G.f); }
    else { const res=simulateFight(m.a,m.b,3); applyResult(m.a,m.b,res,'A'); applyResult(m.b,m.a,res,'B'); survivors.push(res.winner==='A'?m.a:m.b); }
  });
  t.roundStep++;
  const steps={2:'Seizièmes de finale',3:'Huitièmes de finale',4:'Quarts de finale',5:'Demi-finale',6:'Finale',7:'Victoire'};
  t.stepName=steps[t.roundStep];
  if(t.roundStep>6) return true;
  const newMatches=[]; for(let i=0;i<survivors.length;i+=2){ newMatches.push({a:survivors[i],b:survivors[i+1]}); }
  t.matches=newMatches;
  const playerMatch=t.matches.find(m=>m.a.id===G.f.id||m.b.id===G.f.id);
  G.arcade.opponent=playerMatch.a.id===G.f.id?playerMatch.b:playerMatch.a;
  return false;
}
function generateArcadeUpgrades(){
  const baseOpts=trainingOptions(G.f).slice(0,3);
  // Bonus x4 : le format court (Bracket 64 / Ladder 100) rend les bonus
  // habituels de carrière (sur 100) quasi invisibles sur un parcours de
  // seulement 6-8 combats — l'affichage réel se fait ensuite sur /20 via d20().
  G.arcade.trainOpts=baseOpts.map(opt=>({...opt,d:opt.d.map(delta=>[delta[0],delta[1]*4])}));
  G.arcade.skillOpts=[];
  const rStep=G.arcade.tournament?G.arcade.tournament.roundStep:1; // sécurité : absent en mode Ladder 100
  let validPool=poolEligible(G.f,false,false);
  if(rStep>=4) validPool=validPool.filter(s=>s.rar!=='C');
  if(rStep===6) validPool=validPool.filter(s=>s.rar==='L'||s.rar==='M');
  for(let i=0;i<3;i++){
    if(validPool.length===0) break;
    let rarity=tirerRarete();
    if(rStep>=4 && rarity==='C') rarity='R';
    if(rStep===6) rarity=rnd()<0.7?'L':'M';
    const sk=getFallbackSkill(validPool,rarity);
    if(sk){ G.arcade.skillOpts.push(sk); validPool=validPool.filter(s=>s.id!==sk.id); }
  }
  G.arcade.upgradesChosen={train:false,skill:false};
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: WTUMMA_LADDER100] — Lot 1, classement mondial à 100 PNJ avec
   saut de rang (Leapfrog). Mode séparé et parallèle au Bracket 64 et au Boss
   Run — ne modifie ni ne remplace aucun des deux. ==== */
function buildWTUMMALadder(division){
  const ladder=[];
  for(let i=1;i<=100;i++){
    const lv=clamp(100-Math.floor(i*0.66)+RI(-2,3),30,99);
    const o=makeFighter({gender:'H',div:division,style:pick(STYLE_KEYS),level:lv,potential:99,age:RI(20,35)});
    o.stage='pro'; o.org=6; o.ladderRank=i;
    o.W=RI(10,40); o.L=RI(0,5); o.ko=RI(0,o.W);
    if(i<=5) o.nick=pick(['Le Tyran','Le Cauchemar','L\u2019Intouchable','Le Destructeur','L\u2019Empereur']);
    ladder.push(o);
  }
  return ladder;
}
function genWTUMMAOpponent(){
  const currentRank=G.arcade.rank; let targetRank;
  if(currentRank<=15){ targetRank=1; }
  else { targetRank=Math.max(2,currentRank-RI(10,15)); }
  return G.arcade.ladder.find(o=>o.ladderRank===targetRank)||G.arcade.ladder[0];
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: FAITH_DRAFT_HUB] — Lot 1 du mode MMA Faith (carrière longue
   façon Destiny Eleven). Mode entièrement séparé et parallèle à la carrière
   classique — ne modifie aucun écran existant. ==== */
function scr_faith_draft(){
  const d=G.faithDraft;
  const opt=(key,val,icon,name,desc)=>`
    <div class="opp" style="padding:12px;text-align:left;border-color:${d[key]===val?'var(--gold)':'var(--line)'}" onclick="CL.selectFaithDraft('${key}','${val}')">
      <div class="hero-name" style="font-size:18px;text-transform:none;color:${d[key]===val?'var(--gold)':'var(--text)'}">${icon} ${name}</div>
      <div class="muted small mt">${desc}</div>
    </div>`;
  return `<div class="scr center intro">
    <h2 class="disp big" style="font-size:32px">ORIGINES</h2>
    <p class="lede small">Forgez l\u2019histoire et la psychologie de votre combattant.</p>

    <div class="fld" style="text-align:left"><label>Prénom</label><input id="fdn" maxlength="18" value="${esc(d.first||'')}" placeholder="Prénom" oninput="CL.faithDraftIn('first',this.value)"></div>
    <div class="fld" style="text-align:left"><label>Pays</label><div class="pills">${COUNTRY_KEYS.map(c=>`<span class="pill ${d.country===c?'on':''}" onclick="CL.selectFaithDraft('country','${c}')">${COUNTRIES[c].flag} ${COUNTRIES[c].name}</span>`).join('')}</div></div>

    <div class="fld" style="text-align:left"><label>1. VOTRE ORIGINE</label>
      ${opt('origin','traditional','⛩️','Dojo de la Discipline','Un maître obsessionnel vous a fait répéter le même jab dix mille fois avant le premier vrai sparring. (+IQ, +Discipline)')}
      ${opt('origin','pro_child','👑','Fils de la Maison','Votre nom de famille remplit les salles avant même votre premier combat — et pèse une tonne à chaque défaite. (+Argent, -Sang-froid)')}
      ${opt('origin','street','🩸','École du Bitume','Les vraies leçons se sont passées dans les parkings, pas sur les tatamis. (+Menton, +Cœur)')}
      ${opt('origin','late_bloomer','🕰️','Le Retardataire','Personne ne pariait un centime sur vous à seize ans. La rage a fait le reste. (+Puissance, -Technique)')}
    </div>

    <div class="fld" style="text-align:left"><label>2. DISCIPLINE DE BASE</label>
      ${opt('style','boxer','🥊','Boxe','Mains lourdes et déplacements.')}
      ${opt('style','wrestler','🤼','Lutte','Projections et contrôle absolu.')}
      ${opt('style','bjj','🕷️','Jiu-Jitsu','Soumissions et jeu au sol.')}
      ${opt('style','muayThai','🦴','Muay-Thaï','Clinch, genoux et coudes.')}
    </div>

    <div class="fld" style="text-align:left"><label>3. HYGIÈNE DE VIE (ADO)</label>
      ${opt('lifestyle','pro','💧','Moine Guerrier','Extinction des feux à 21h, zéro écart, zéro excuse. Les coachs vous adorent, vos amis vous ont oublié. (+Cardio, +Forme)')}
      ${opt('lifestyle','balanced','🧭','Ni Moine Ni Fêtard','Sérieux à la salle, tolérable en dehors. La voie du compromis. (Stats équilibrées)')}
      ${opt('lifestyle','party','🔥','La Vie Est Courte','Les réseaux sociaux avant le sommeil, les sorties avant les rounds de sac. Le talent compensera... ou pas. (+Hype, -Forme)')}
    </div>

    <div class="fld" style="text-align:left"><label>4. LE CERCLE (MANAGEMENT)</label>
      ${opt('circle','family','🛡️','Le Clan','Des parents qui négocient vos contrats en pyjama à la table de la cuisine. Rassurant, un peu étouffant. (+Moral)')}
      ${opt('circle','agent','💼','Le Requin','Un agent qui a senti l\u2019argent avant que vous ne sachiez lacer vos gants. Il prend sa part, toujours. (+Fonds de départ)')}
      ${opt('circle','squad','🐺','La Bande','Vos potes d\u2019enfance, bruyants et loyaux, présents à chaque combat sans jamais comprendre les règles. (Neutre)')}
    </div>

    <div class="fld" style="text-align:left"><label>5. PERSONNALITÉ (MÉDIAS)</label>
      ${opt('personality','villain','🎭','Le Vilain','Chaque conférence de presse est un règlement de comptes. Ça remplit les salles, ça vide le moral. (+Hype, -Moral)')}
      ${opt('personality','humble','🧘','Le Taiseux','Deux phrases par interview, un mental de granit. Les puristes vous respectent, les promoteurs s\u2019arrachent les cheveux. (+Moral, +Concentration)')}
    </div>

    <button class="btn primary mt" style="padding:16px;font-size:18px" onclick="CL.finalizeFaithDraft()">VALIDER ET COMMENCER</button>
    <button class="btn ghost mt" onclick="CL.go('title')">Retour au menu</button>
  </div>`;
}

function scr_faith_hub(){
  const f=G.f; const step=G.faith.step||1;
  const topBar=`<div style="display:flex;gap:8px;margin-bottom:12px">
    <div class="glass" style="flex:1.2;text-align:center;padding:8px 0;border-radius:6px;min-height:auto">
      <b style="font-size:16px;font-family:'Oswald'">${formatArgent(f.earnings)}</b></div>
    <div class="glass" style="flex:1;text-align:center;padding:8px 0;border-radius:6px;min-height:auto">
      <b class="mono" style="font-size:14px;color:var(--text)">OVR ${f.overall}</b></div>
    ${(f.org>0 && f.contract)?`<div class="glass" style="flex:1;text-align:center;padding:8px 0;border-radius:6px;min-height:auto">
      <b class="mono" style="font-size:14px;color:var(--gold)">${f.contract.fightsLeft} combat(s)</b></div>`:''}
  </div>
  <div style="display:flex;gap:16px;margin-bottom:24px;padding:0 4px">
    <div style="flex:1"><span class="stat-lbl" style="margin-bottom:4px">FORME</span>
      <div class="gauge2" style="background:var(--line);height:4px;border-radius:2px;overflow:hidden">
        <span style="display:block;height:100%;width:${clamp(f.form,0,100)}%;background:var(--text)"></span></div></div>
    <div style="flex:1"><span class="stat-lbl" style="margin-bottom:4px">MORAL</span>
      <div class="gauge2" style="background:var(--line);height:4px;border-radius:2px;overflow:hidden">
        <span style="display:block;height:100%;width:${clamp(f.morale,0,100)}%;background:var(--text)"></span></div></div>
  </div>
  ${(f.chinDegradationLevel>0)?`<div class="mono small mb" style="color:var(--loss);border-top:1px dashed var(--loss);padding-top:6px">⚠ Séquelles neurologiques : plafond d\u2019encaissement définitivement réduit (Stade ${f.chinDegradationLevel}).</div>`:''}
  ${(f.age>=28 && f.div!=='H-heavy' && f.div!=='F-feather')?`<div class="mono small mb" style="color:var(--gold);border-top:1px dashed var(--gold);padding-top:6px">⚠ Piège métabolique : ton corps s\u2019alourdit. Maintenir ce poids de forme devient difficile.</div>`:''}`;
  let actionsHtml='';
  if(step===1){
    actionsHtml=`<div class="eyebrow mb">PHASE 1 : PRÉPARATION</div>
    <p class="lede small">Affrontez les péripéties de la vie d\u2019un combattant.</p>
    <div style="display:grid;grid-template-columns:1fr;gap:10px">
      <div class="glass opp" style="padding:12px;text-align:center" onclick="CL.faithLifeEvent()">
        <div class="disp" style="font-size:18px;color:var(--text)">ÉVÉNEMENT DE VIE</div>
        <div class="mono muted small mt" style="font-size:10px">Choix narratif impactant votre condition et vos attributs</div></div>
    </div>`;
  } else if(step===2){
    actionsHtml=`<div class="eyebrow mb">PHASE 2 : AJUSTEMENT</div>
    <p class="lede small">Gérez votre condition ou investissez avant l\u2019affrontement. Fonds : <b>${formatArgent(f.earnings)}</b></p>
    <div style="display:flex;flex-direction:column;gap:10px">
      <div class="opp" style="padding:12px;text-align:center" onclick="CL.faithRest()">
        <div class="disp" style="font-size:18px;color:var(--text)">REPOS & RÉCUPÉRATION (Gratuit)</div>
        <div class="mono muted small mt" style="font-size:10px">+25 Forme, +10 Moral</div></div>

      ${(G.faith.gym && G.faith.gym.length>0)?`
      <div class="eyebrow mt" style="color:var(--sage)">La Salle d\u2019Entraînement</div>
      ${G.faith.gym.map(p=>`
        <div class="opp" style="border-left:3px solid var(--sage)" onclick="CL.faithSparring('${p.id}')">
          <b style="color:var(--sage)">Tourner avec ${esc(p.first)}</b>
          <div class="muted small mt">${p.styleLabel} · OVR ${p.overall} · ${p.age} ans.<br>Vous formez ce prospect (+15 Forme). Il copie vos meilleures armes.</div>
        </div>
      `).join('')}
      `:''}

      <div class="eyebrow mt" style="color:var(--gold)">Investissements de carrière</div>
      <div class="opp" onclick="CL.buyFaithPerk('hometown')"><b class="gold">Combat à Domicile (15k$)</b>
        <div class="muted small mt">Le prochain combat sera chez vous. +15 Moral, +8 Forme.</div></div>
      <div class="opp" onclick="CL.buyFaithPerk('catchweight')"><b class="gold">Forcer un Catchweight (35k$)</b>
        <div class="muted small mt">L\u2019adversaire subira un lourd malus de déshydratation (Cardio/Durabilité).</div></div>
      <div class="opp" onclick="CL.buyFaithPerk('protect_title')"><b class="gold">Sanctuariser le Titre (50k$)</b>
        <div class="muted small mt">Annule la pénalité d\u2019inactivité cette année.</div></div>

      <div class="eyebrow mt">Investissements financiers & illégaux</div>
      <div class="opp" style="border-left:3px solid var(--loss)" onclick="CL.buyFaithPerk('ped')"><b>Cellule de récupération PED (30k$)</b>
        <div class="muted small mt">+4 Menton et Résistance. <span style="color:var(--loss)">Risque de suspension (15%).</span></div></div>
      <div class="opp" style="border-left:3px solid var(--sage)" onclick="CL.buyFaithPerk('tiger')"><b>Stage au Tiger Muay Thai (50k$)</b>
        <div class="muted small mt">+5 Kick et Clinch garantis (hors-plafond). <span style="color:var(--loss)">Risque de blessure mineure (25%).</span></div></div>
      <div class="opp" style="border-left:3px solid var(--gold-d)" onclick="CL.buyFaithPerk('lobbying')"><b>Lobbying Managérial (100k$)</b>
        <div class="muted small mt">Force une offre de promotion après le prochain combat. <span style="color:var(--loss)">50% de chance d\u2019échec.</span></div></div>
      <div class="opp" style="border-left:3px solid var(--blood-d)" onclick="CL.buyFaithPerk('judges')"><b>Influence sur les Juges (20% des gains)</b>
        <div class="muted small mt">Clémence en cas de décision. <span style="color:var(--loss)">Risque de scandale et rétrogradation.</span></div></div>
      <div class="opp" onclick="CL.buyFaithPerk('diet')"><b>Diététicien Élite (40k$ / an)</b>
        <div class="muted small mt">Pesées "Sans effort" garanties pour les 12 prochains mois.</div></div>
    </div>`;
  } else {
    actionsHtml=`<div class="eyebrow mb">PHASE 3 : L\u2019OCTOGONE</div>
    <p class="lede small">Tout est en place. Il est temps de valider cette saison.</p>
    <button class="btn primary" style="padding:20px;font-size:20px;border-radius:8px;margin-top:10px" onclick="CL.faithFight()">COMBATTRE</button>`;
  }
  return `<div class="scr">
    ${topBar}
    ${G.currentEra?`<div class="card glass mb" style="border-left:3px solid var(--gold);background:var(--panel2);padding:12px">
      <div class="eyebrow gold mb">CONTEXTE MONDIAL : ${esc(G.currentEra.name).toUpperCase()}</div>
      <div class="muted small">L\u2019évolution du sport impose ses règles sur la division. Prépare-toi à affronter des spécialistes.</div>
    </div>`:''}
    <div class="glass mwash card" style="padding:16px;margin-bottom:20px;border-radius:8px;background:var(--panel2)">
      <div class="meta-strip" style="margin-bottom:8px;color:var(--text)">
        <span style="background:var(--line);padding:4px 8px;border-radius:4px">SAISON ${G.faith.year}</span>
        <span>ÉTAPE ${step} / 3</span></div>
      <div class="hero-name" style="font-size:28px">${esc(f.name)} ${f.flag}</div>
      <div class="mono small muted mt">Ligue : <b style="color:var(--text)">${orgDisplayName(f)}</b></div>
    </div>
    ${actionsHtml}
    <button class="btn ghost mt" onclick="CL.go('profile')">Voir fiche complète</button>
  </div>`;
}
/* ==== [ANCRE: FAITH_TRAIN_SCOUT_YEAREND] — Lot 2 du mode MMA Faith ==== */
const FAITH_LIFE_EVENTS=[
  {id:'evt_eco_exam',title:'Semaine de partiels',text:'La session d\u2019examens approche à l\u2019université. Vous passez vos nuits à réviser au lieu de récupérer de vos sparrings.',
    choices:[{label:'Prioriser les révisions (assurer l\u2019avenir)',d:[['fightIQ',3],['form',-12],['morale',5]],traitTag:'ascetic'},
             {label:'Ignorer la fac, aller tourner à la salle',d:[['jab',2],['morale',-15]]}]},
  {id:'evt_calisthenics',title:'Routine au poids du corps',text:'Vous remplacez votre séance de musculation lourde par une session stricte de calisthénie en plein air.',
    choices:[{label:'Focus explosivité & figures',d:[['explosiveness',3],['flexibility',2],['cardio',-4]]},
             {label:'Focus isométrie & maintien',d:[['strength',2],['durability',2],['form',-2]]}]},
  {id:'evt_plants',title:'Invasion de nuisibles',text:'Les feuilles de vos plantes tropicales sont attaquées. Vous passez des heures à les soigner au lieu de visualiser votre combat.',
    choices:[{label:'Sauver les plantes (patience & soin)',d:[['composure',4],['focus',2],['form',-5]]},
             {label:'Abandonner et aller s\u2019entraîner',d:[['morale',-10],['aggression',3]]}]},
  {id:'evt_streetwear',title:'Le tech pack',text:'Vous finalisez seul le dossier technique de votre marque indépendante. L\u2019usine attend vos mensurations exactes.',
    choices:[{label:'Financer la production (15k$)',cost:15,d:[['focus',-5],['morale',12],['composure',3]]},
             {label:'Repousser le drop, focus sur le MMA',d:[['morale',-12],['focus',6]]}]},
  {id:'evt_rainy_run',title:'Pluie battante',text:'Une pluie glaciale s\u2019abat sur la région. Votre footing matinal s\u2019annonce particulièrement misérable.',
    choices:[{label:'Courir quand même sous l\u2019averse',d:[['durability',5],['heart',4],['form',-8],['morale',-5]]},
             {label:'Rester au chaud',d:[['form',10],['discipline',-8]]}]},
  {id:'evt_ufc_live',title:'Main event à 5h du matin',text:'La carte principale d\u2019un événement majeur commence en pleine nuit, avec un combat crucial pour votre catégorie.',
    choices:[{label:'Analyser en direct',d:[['fightIQ',5],['adaptability',3],['form',-15]]},
             {label:'Dormir et regarder le replay',d:[['form',5],['fightIQ',1]]}]},
  {id:'evt_kaiju',title:'Soirée grand spectacle',text:'Pour décompresser avec votre cercle proche, vous organisez une soirée cinéma.',
    choices:[{label:'Profiter de la soirée',d:[['morale',12],['composure',3],['discipline',-4]]}]},
  {id:'evt_sparring_heavy',title:'Sparring lourd imprévu',text:'Un vétéran de la salle vous propose un sparring très appuyé, sans casque.',
    choices:[{label:'Accepter la guerre',d:[['chin',3],['durability',3],['form',-18],['morale',5]]},
             {label:'Refuser, travail technique',d:[['footSpeed',3],['jab',2],['morale',-5]]}]},
  {id:'evt_diet_temptation',title:'Tentation de triche',text:'En plein milieu de votre perte de poids, la faim vous tenaille l\u2019estomac.',
    choices:[{label:'Craquer pour un repas lourd',d:[['form',15],['morale',10],['discipline',-15]]},
             {label:'Boire de l\u2019eau et souffrir',d:[['discipline',5],['heart',2],['morale',-8]]}]},
  {id:'evt_wrestling_seminar',title:'Séminaire de l\u2019Est',text:'Un ancien lutteur médaillé donne un séminaire technique très coûteux sur le contrôle au sol.',
    choices:[{label:'Payer l\u2019accès (5k$)',cost:5,d:[['topControl',4],['takedown',3],['fightIQ',2]]},
             {label:'S\u2019entraîner seul',d:[['strength',2],['form',-3]]}]},
  {id:'evt_coach_clash',title:'Tension tactique',text:'Votre entraîneur veut vous imposer un plan de jeu extrêmement prudent qui va à l\u2019encontre de vos instincts.',
    choices:[{label:'Se plier à ses exigences',d:[['fightIQ',4],['composure',3],['aggression',-5]],traitTag:'ascetic'},
             {label:'Refuser, imposer votre vision',d:[['aggression',4],['confidence',3],['morale',-10]],traitTag:'rebel'}]},
  {id:'evt_media_call',title:'Interview locale',text:'Un média régional vous contacte pour un long format vidéo, sur votre journée de repos.',
    choices:[{label:'Faire le show',d:[['morale',8],['confidence',4],['form',-6],['focus',-3]],traitTag:'showman'},
             {label:'Décliner poliment',d:[['focus',4],['form',5],['morale',-5]]}]},
  {id:'evt_sauna_break',title:'Le sauna en panne',text:'Pour maintenir votre perte de poids, vous devez enfiler une combinaison de sudation et enchaîner les sprints.',
    choices:[{label:'Faire les sprints (épuisant)',d:[['cardio',4],['heart',3],['form',-15]],traitTag:'ascetic'},
             {label:'Décaler la perte de poids',d:[['form',5],['discipline',-10]]}]},
  {id:'evt_shadow_mirror',title:'Perfectionnisme',text:'La salle est vide. Vous passez une heure devant le miroir à corriger une micro-imperfection technique.',
    choices:[{label:'Chirurgie technique',d:[['handSpeed',3],['cross',3],['focus',2],['form',-4]]}]},
  {id:'evt_gourou',title:'Le gourou psychologique',text:'Un coach mental vous vend une préparation "prédateur alpha" à prix fort.',
    choices:[{label:'Payer la séance (8k$)',cost:8,d:[['confidence',4],['composure',3],['form',-6]]},
             {label:'Refuser, rester terre-à-terre',d:[['discipline',3],['morale',-3]]}]},
  // --- Événements conditionnels (req) : n'apparaissent que si l'état réel du combattant les justifie ---
  {id:'evt_crypto_crash',req:f=>(f.earnings||0)>50,title:'Sponsor véreux',text:'Le fondateur de "PunchCoin", votre sponsor principal, s\u2019est enfui aux Bahamas. Vous perdez votre investissement de départ, mais la communauté a pitié de vous.',
    choices:[{label:'Faire profil bas et encaisser la perte (20k$)',cost:20,d:[['composure',5],['morale',10],['focus',3]]},
             {label:'Insulter le fondateur sur les réseaux',d:[['aggression',6],['composure',-10],['morale',-5]]}]},
  {id:'evt_tax_audit',req:f=>(f.earnings||0)>150,title:'Contrôle fiscal',text:'L\u2019administration fiscale s\u2019intéresse de très près à vos déclarations. Votre comptable, qui a le charisme d\u2019une huître, vous conseille de payer pour éviter le tribunal.',
    choices:[{label:'Régler le redressement sans faire de bruit (40k$)',cost:40,d:[['focus',5],['morale',-10]]},
             {label:'Aller au tribunal (guerre d\u2019usure)',d:[['composure',-15],['discipline',-10],['fightIQ',2]]}]},
  {id:'evt_exotic_pet',req:f=>(f.earnings||0)>80,title:'Achat compulsif',text:'Suite à un pari avec un influenceur, vous venez d\u2019acheter un tigre albinos. L\u2019animal est magnifique, mais il a dévoré votre canapé et terrorise vos sparring-partners.',
    choices:[{label:'Le revendre à un zoo et payer l\u2019amende (15k$)',cost:15,d:[['discipline',5],['morale',-5]]},
             {label:'Le garder et s\u2019en occuper',d:[['focus',-12],['heart',4],['form',-8]]}]},
  {id:'evt_aging_joints',req:f=>f.age>33,title:'Le poids des années',text:'En vous levant ce matin, vos genoux ont craqué avec le bruit d\u2019un coup de fusil. Le déni ne fonctionne plus, votre corps réclame une maintenance drastique.',
    choices:[{label:'Investir dans des cellules souches expérimentales (25k$)',cost:25,d:[['recovery',6],['durability',4],['form',10]]},
             {label:'Prendre des anti-inflammatoires et serrer les dents',d:[['durability',-5],['heart',5],['recovery',-8]]}]},
  {id:'evt_prospect_hype',req:f=>f.age<22&&(f.streak||0)>=3,title:'Le hype train',text:'Les médias vous considèrent comme le nouveau prodige de la décennie. Vos DM explosent, les marques vous harcèlent et votre ego enfle dangereusement.',
    choices:[{label:'Couper le téléphone et retourner au sac de frappe',d:[['discipline',8],['focus',6],['morale',-5]],traitTag:'ascetic'},
             {label:'Profiter de la gloire et des soirées mondaines',d:[['composure',-12],['cardio',-10],['morale',20]],traitTag:'showman'}]},
  {id:'evt_losing_streak',req:f=>(f.streak||0)<=-2,title:'Le gouffre',text:'Les défaites s\u2019accumulent. Les fans qui vous adulaient hier vous conseillent de prendre votre retraite dans les commentaires de vos photos de vacances.',
    choices:[{label:'Isolement total et remise en question',d:[['fightIQ',6],['focus',8],['confidence',-15]],traitTag:'ascetic'},
             {label:'Répondre aux trolls avec agressivité',d:[['aggression',10],['composure',-15],['focus',-10]],traitTag:'rebel'}]},
  {id:'evt_champion_target',req:f=>!!f.champion,title:'La cible sur le dos',text:'En tant que champion, vous êtes épié. Le challenger numéro 1 a disséqué chacun de vos rounds et vient de publier une vidéo pointant vos défauts biomécaniques.',
    choices:[{label:'Modifier sa garde dans l\u2019urgence',d:[['adaptability',8],['fightIQ',4],['confidence',-8]]},
             {label:'Parier sur ses fondamentaux bruts',d:[['confidence',10],['adaptability',-6],['composure',4]]}]},
  {id:'evt_chin_check',req:f=>f.attrs.chin<50,title:'Verre pilé',text:'Pendant un sparring léger, un jab anodin vous fait vaciller. Votre menton est de plus en plus fragile et votre coach propose de changer toute l\u2019approche défensive.',
    choices:[{label:'Passer à un style purement évasif',d:[['footSpeed',8],['fightIQ',4],['power',-6],['aggression',-10]]},
             {label:'Refuser de reculer (risque de KO accru)',d:[['heart',8],['durability',-5],['composure',-5]],traitTag:'rebel'}]},
  {id:'evt_bjj_nerd',req:f=>f.style==='bjj'||f.attrs.submission>80,title:'Obsession articulaire',text:'Vous avez passé les 72 dernières heures à visionner des tutoriels de clés de cheville lituaniennes. Vous voyez des angles de soumission même quand vous pliez votre linge.',
    choices:[{label:'Intégrer ce savoir au gameplan',d:[['submission',6],['fightIQ',4],['cardio',-5]]},
             {label:'Forcer l\u2019application en sparring (risque de blesser un ami)',d:[['killer',8],['submission',2],['morale',-12]]}]},
  {id:'evt_podcast_disaster',req:null,title:'Le micro ouvert',text:'Vous êtes invité dans un podcast populaire de 4 heures. Vers la 3ème heure, fatigué, vous lâchez une théorie du complot absurde sur la forme de la Terre.',
    choices:[{label:'Assumer et embrasser le rôle de vilain',d:[['composure',-8],['aggression',6],['morale',15]],traitTag:'showman'},
             {label:'Engager une agence de gestion de crise (10k$)',cost:10,d:[['discipline',5],['focus',5],['morale',-10]]}]},
  {id:'evt_reality_tv',req:null,title:'Romance cathodique',text:'Vous commencez à fréquenter une star de télé-réalité. Les paparazzis campent devant votre salle d\u2019entraînement, brisant la concentration de tout le camp.',
    choices:[{label:'Mettre fin à la relation pour le sport',d:[['focus',10],['discipline',8],['morale',-20]],traitTag:'ascetic'},
             {label:'Gérer les caméras et la relation',d:[['composure',-10],['form',-15],['morale',15]],traitTag:'showman'}]},
  {id:'evt_bar_fight',req:null,title:'Désamorcer la bombe',text:'Dans un bar, un type éméché qui a fait deux mois de Krav Maga en 2014 décide que vous êtes l\u2019adversaire idéal pour prouver sa virilité à ses amis.',
    choices:[{label:'Lui payer un verre et quitter les lieux',d:[['composure',8],['fightIQ',4],['aggression',-5]]},
             {label:'Le balayer sèchement pour l\u2019exemple',d:[['aggression',8],['discipline',-15],['focus',-5]]}]},
  {id:'evt_guru_supplement',req:null,title:'La poudre magique',text:'Un préparateur physique douteux vous propose un complément alimentaire non-étiqueté qui "révolutionnera votre testostérone" mais sent fortement l\u2019ammoniaque.',
    choices:[{label:'Refuser et s\u2019en tenir au poulet-brocolis',d:[['discipline',6],['durability',3],['recovery',-4]]},
             {label:'Tester le produit (risque absolu)',d:[['explosiveness',8],['power',5],['cardio',-15],['form',-10]]}]},
  // --- Événements verrouillés par un trait émergent (cristallisé après 3 choix dans la même direction) ---
  {id:'evt_trait_rebel_sponsor',req:f=>f.faithTraits&&f.faithTraits.includes('Tête Brûlée'),title:'Conséquence : marque toxique',text:'Votre réputation de Tête Brûlée fait fuir les annonceurs traditionnels, mais attire une marque de boisson énergisante ultra-agressive qui adore votre image.',
    choices:[{label:'Signer le contrat controversé',reward:25,d:[['morale',15],['focus',-5]]},
             {label:'Refuser pour redorer son image',d:[['composure',5],['morale',-10]]}]},
  {id:'evt_trait_ascetic_camp',req:f=>f.faithTraits&&f.faithTraits.includes('Ascète'),title:'Conséquence : le vide absolu',text:'En tant qu\u2019Ascète reconnu, vous avez éliminé toute distraction. Vous passez un mois entier sans parler à personne d\u2019autre qu\u2019à votre sac de frappe.',
    choices:[{label:'Embrasser l\u2019isolement martial',d:[['focus',10],['discipline',5],['morale',-15]]}]},
  {id:'evt_trait_showman_deal',req:f=>f.faithTraits&&f.faithTraits.includes('Showman'),title:'Conséquence : le cirque médiatique',text:'Votre réputation de Showman précède chaque combat. Une chaîne de streaming vous propose une série documentaire intrusive sur votre quotidien.',
    choices:[{label:'Accepter, caméras partout',reward:35,d:[['focus',-10],['morale',10],['composure',-5]]},
             {label:'Refuser, préserver l\u2019intimité du camp',d:[['discipline',4],['morale',-5]]}]},
  // --- Événements liés à l'agent (Le Requin) — n'apparaissent que si ce cercle a été choisi au draft ---
  {id:'evt_agent_scheme',req:f=>f.agentCut>0,title:'Coup de fil du Requin',text:'Votre agent vous a décroché un spot publicitaire pour une marque d\u2019outillage peu glorieuse. "C\u2019est humiliant mais ça paye, gamin", dit-il.',
    choices:[{label:'Tourner la pub',reward:20,d:[['morale',-15],['focus',-10]]},
             {label:'Refuser catégoriquement (l\u2019agent s\u2019énerve)',d:[['confidence',5],['morale',5]]}]},
  {id:'evt_agent_lobby',req:f=>f.agentCut>0&&f.org>0,title:'Trafic d\u2019influence',text:'Votre agent utilise son carnet d\u2019adresses pour vous obtenir de meilleurs créneaux d\u2019entraînement, mais la facture vous revient.',
    choices:[{label:'Payer l\u2019accès VIP (10k$)',cost:10,d:[['form',20],['cardio',3]]},
             {label:'Se débrouiller seul',d:[['discipline',5],['form',-5]]}]},
  // --- Événements liés aux ères martiales (MMA_ERAS) ---
  {id:'evt_era_daghestan',req:f=>G.currentEra&&G.currentEra.id==='era_daghestan',title:'L\u2019invasion de l\u2019Est',text:'La ligue est inondée de lutteurs effrayants. L\u2019angoisse de finir sur le dos pousse votre coach à modifier tout votre camp d\u2019entraînement.',
    choices:[{label:'S\u2019entraîner spécifiquement contre la lutte',d:[['tdd',6],['guardWork',4],['form',-12]]},
             {label:'Faire confiance à son style',d:[['confidence',5],['adaptability',-5]]}]},
  {id:'evt_era_calf',req:f=>G.currentEra&&G.currentEra.id==='era_calf',title:'Chasse aux chevilles',text:'Détruire l\u2019appui avant est devenu la norme. Vos tibias sont couverts de contusions rien qu\u2019en sparring.',
    choices:[{label:'Adapter sa garde',d:[['power',-5],['footSpeed',5],['durability',3]]},
             {label:'Ignorer la mode (vos appuis sont en miettes)',d:[['durability',-8],['morale',5]]}]},
  {id:'evt_era_boxing',req:f=>G.currentEra&&G.currentEra.id==='era_boxing',title:'Le renouveau du noble art',text:'Les combattants avec une excellente anglaise règnent en maîtres. Les échanges de pur striking sont d\u2019une violence rare.',
    choices:[{label:'Affûter son jeu de jambes',d:[['footSpeed',6],['jab',3],['form',-8]]},
             {label:'Compenser par le clinch sale',d:[['clinchStr',5],['aggression',4],['fightIQ',-3]]}]},
  {id:'evt_era_bjj',req:f=>G.currentEra&&G.currentEra.id==='era_bjj',title:'La menace des leglocks',text:'Plus personne ne se sent en sécurité les jambes tendues. Toute la salle révise ses défenses articulaires.',
    choices:[{label:'Blinder sa défense de jambes',d:[['flexibility',5],['tdd',3],['form',-8]]},
             {label:'Rester concentré sur son propre jeu',d:[['confidence',4],['adaptability',-4]]}]},
  {id:'evt_era_clinch',req:f=>G.currentEra&&G.currentEra.id==='era_clinch',title:'L\u2019ère de la boxe sale',text:'Le clinch contre la cage est devenu une arme à part entière. Les coudes pleuvent dans chaque combat de haut niveau.',
    choices:[{label:'Travailler la boxe sale au clinch',d:[['clinchStr',6],['durability',3],['form',-10]]},
             {label:'Fuir le clinch systématiquement',d:[['footSpeed',4],['cardio',-4]]}]},
  {id:'evt_era_karate',req:f=>G.currentEra&&G.currentEra.id==='era_karate',title:'L\u2019avènement du style fuyant',text:'La distance et l\u2019angle deviennent rois. Les combattants qui restent statiques se font punir sans jamais toucher personne.',
    choices:[{label:'Adopter un jeu de jambes fuyant',d:[['footSpeed',6],['fightIQ',4],['power',-4]]},
             {label:'S\u2019en tenir à la pression constante',d:[['aggression',4],['cardio',-5]]}]},
  // --- Lot d'expansion : chaque choix est un vrai entraînement, pas un simple texte ---
  {id:'evt_boxing_pads',title:'Séance de pao',text:'Le coach vous colle aux patins pendant quarante minutes sans pause, à corriger chaque angle de frappe.',
    choices:[{label:'Vitesse et précision',d:[['handSpeed',4],['jab',3],['form',-6]]},
             {label:'Puissance et enracinement',d:[['power',4],['cross',3],['form',-8]]}]},
  {id:'evt_wrestling_room',title:'La salle de lutte',text:'Un vétéran vous propose de reprendre les bases : niveau des hanches, changements de direction, chaînes d\u2019amenées.',
    choices:[{label:'Perfectionner les amenées simples',d:[['takedown',5],['strength',3],['form',-10]]},
             {label:'Travailler la défense de projection',d:[['tdd',5],['footSpeed',2],['form',-8]]}]},
  {id:'evt_jiujitsu_open_mat',title:'Open mat du dimanche',text:'La salle ouvre ses tapis à tout le monde. Ceintures noires, débutants, tout le monde roule ensemble.',
    choices:[{label:'Chasser les soumissions',d:[['submission',5],['flexibility',2],['form',-6]]},
             {label:'Travailler la garde et la patience',d:[['guardWork',5],['composure',3],['form',-5]]}]},
  {id:'evt_clinch_work',title:'Travail au clinch',text:'Deux heures collé à un partenaire contre le mur, à chercher les genoux et à casser la posture adverse.',
    choices:[{label:'Genoux et coudes sales',d:[['clinchStr',5],['aggression',3],['form',-8]]},
             {label:'Contrôle et projection depuis le clinch',d:[['clinchStr',3],['takedown',3],['form',-6]]}]},
  {id:'evt_gnp_drilling',title:'Ground and pound au sac lesté',text:'Le préparateur physique a inventé un exercice à base de sac de sable posé sur un mannequin. C\u2019est aussi ridicule qu\u2019efficace.',
    choices:[{label:'Rafales courtes et répétées',d:[['gnp',5],['handSpeed',2],['form',-9]]},
             {label:'Frappes lourdes et posture',d:[['gnp',4],['power',3],['form',-7]]}]},
  {id:'evt_footwork_ladder',title:'L\u2019échelle de rythme',text:'Une session entière consacrée au jeu de jambes, digne d\u2019un boxeur des années 70.',
    choices:[{label:'Vitesse pure',d:[['footSpeed',5],['explosiveness',2],['form',-5]]},
             {label:'Angles et déplacements latéraux',d:[['footSpeed',3],['fightIQ',3],['form',-5]]}]},
  {id:'evt_iron_chin',title:'Renforcement du cou',text:'Un protocole spécifique de musculation cervicale, réputé réduire l\u2019impact des coups à la tête.',
    choices:[{label:'S\u2019y tenir sérieusement',d:[['durability',4],['discipline',3],['form',-4]]},
             {label:'Bâcler pour gagner du temps',d:[['durability',1],['form',2]]}]},
  {id:'evt_film_study',title:'Séance vidéo',text:'Des heures à décortiquer vos propres combats et ceux de la division au ralenti.',
    choices:[{label:'Analyser ses propres erreurs',d:[['fightIQ',5],['composure',2],['focus',-3]]},
             {label:'Étudier le style du prochain adversaire',d:[['adaptability',5],['fightIQ',2],['focus',-3]]}]},
  {id:'evt_altitude_camp',title:'Stage en altitude',text:'Deux semaines à 2000 mètres. Chaque respiration est un combat en soi.',
    choices:[{label:'S\u2019y donner à fond',d:[['cardio',6],['heart',3],['form',-15]]},
             {label:'Doser l\u2019effort pour ne pas se griller',d:[['cardio',3],['recovery',2],['form',-6]]}]},
  {id:'evt_flexibility_yoga',title:'Séance de mobilité',text:'Le staff insiste : un corps plus mobile encaisse mieux et attaque sous des angles impossibles.',
    choices:[{label:'S\u2019investir sérieusement',d:[['flexibility',5],['recovery',2],['form',-3]]},
             {label:'Le faire du bout des lèvres',d:[['flexibility',1],['discipline',-3]]}]},
  {id:'evt_mental_coach',title:'Le préparateur mental',text:'Un psychologue du sport propose des séances de visualisation avant chaque gros combat.',
    choices:[{label:'Adhérer pleinement à la méthode',d:[['composure',5],['confidence',3],['focus',2]]},
             {label:'Rester sceptique mais écouter poliment',d:[['composure',2],['discipline',1]]}]},
  {id:'evt_weight_class_debate',title:'Le débat de catégorie',text:'Votre entourage se dispute : rester dans votre catégorie actuelle, ou tenter le grand saut vers une division voisine ?',
    choices:[{label:'Se concentrer sur la catégorie actuelle',d:[['discipline',4],['composure',2]]},
             {label:'Se préparer mentalement à un changement futur',d:[['adaptability',5],['confidence',-3]]}]},
  {id:'evt_condition_check',title:'Bilan physique complet',text:'Un check-up médical complet, des pieds à la tête, pour repartir sur des bases saines.',
    choices:[{label:'Suivre à la lettre les recommandations',d:[['durability',3],['recovery',3],['discipline',2]]},
             {label:'Garder seulement ce qui vous arrange',d:[['confidence',3],['durability',-2]]}]},
  {id:'evt_sparring_partner_bond',title:'Le partenaire de confiance',text:'Un partenaire d\u2019entraînement régulier commence à vraiment comprendre votre jeu — dans les deux sens.',
    choices:[{label:'Approfondir cette complicité technique',d:[['adaptability',4],['fightIQ',3],['composure',2]]},
             {label:'Varier les partenaires pour rester imprévisible',d:[['adaptability',2],['confidence',3]]}]},
  {id:'evt_local_seminar',title:'Séminaire de passage',text:'Un ancien champion de passage dans la région donne un séminaire technique très demandé.',
    choices:[{label:'Payer l\u2019accès (6k$)',cost:6,d:[['fightIQ',4],['adaptability',3]]},
             {label:'Ne pas s\u2019y rendre',d:[['discipline',2]]}]},
  {id:'evt_referee_incident',title:'Incident avec un arbitre',text:'Un mauvais souvenir d\u2019arrêt de combat controversé refait surface dans les médias locaux.',
    choices:[{label:'Répondre calmement en interview',d:[['composure',4],['confidence',2]]},
             {label:'Laisser sa colère s\u2019exprimer publiquement',d:[['aggression',5],['composure',-6],['morale',8]]}]},
  {id:'evt_new_gym_offer',title:'Offre d\u2019une salle rivale',text:'Une salle réputée de l\u2019autre bout du pays propose de vous accueillir, avec des infrastructures bien supérieures.',
    choices:[{label:'Rester fidèle à sa salle d\u2019origine',d:[['discipline',3],['morale',6]]},
             {label:'Envisager sérieusement le changement',d:[['adaptability',3],['confidence',3],['morale',-4]]}]},
  {id:'evt_injury_scare',title:'Alerte à l\u2019entraînement',text:'Une torsion du genou pendant un exercice de niveau fait craindre le pire un instant. Finalement rien de cassé, mais l\u2019inquiétude reste.',
    choices:[{label:'Reprendre prudemment',d:[['durability',2],['discipline',2],['form',-8]]},
             {label:'Reprendre comme si de rien n\u2019était',d:[['confidence',4],['durability',-3],['form',-4]]}]},
  {id:'evt_public_workout',title:'Entraînement public',text:'L\u2019organisation demande une séance ouverte aux médias avant le prochain événement.',
    choices:[{label:'Montrer un vrai travail technique',d:[['fightIQ',3],['confidence',2],['focus',-3]]},
             {label:'Mettre en scène de la puissance brute',d:[['power',3],['aggression',3],['focus',-3]]}]},
  {id:'evt_old_footage',title:'Vieilles images',text:'Un fan retrouve une vidéo de vos tout premiers combats amateurs et la partage en ligne. Le contraste est saisissant.',
    choices:[{label:'En rire publiquement',d:[['composure',3],['morale',8]]},
             {label:'Ignorer complètement',d:[['discipline',2]]}]},
  {id:'evt_camp_relocation',title:'Délocalisation de camp',text:'Pour préparer un combat à l\u2019étranger, tout le camp part s\u2019installer un mois sur place.',
    choices:[{label:'S\u2019adapter au fuseau horaire et à la nourriture',d:[['adaptability',4],['recovery',2],['form',-6]]},
             {label:'Reproduire sa routine habituelle à tout prix',d:[['discipline',4],['adaptability',-2],['form',-4]]}]},
  {id:'evt_style_switch_temptation',title:'La tentation du style adverse',text:'En observant un adversaire dominer avec un style qui n\u2019est pas le vôtre, l\u2019envie de tout changer vous traverse.',
    choices:[{label:'Résister et approfondir son propre style',d:[['discipline',4],['confidence',3]]},
             {label:'Emprunter un peu de cette approche',d:[['adaptability',5],['fightIQ',2],['confidence',-2]]}]},
  {id:'evt_fan_letter',title:'Une lettre de fan',text:'Un jeune combattant amateur vous écrit une longue lettre expliquant à quel point votre parcours l\u2019a inspiré.',
    choices:[{label:'Répondre personnellement',d:[['morale',10],['composure',2]]},
             {label:'Passer à autre chose, trop de sollicitations',d:[['focus',3]]}]},
  {id:'evt_camp_conflict',title:'Tension entre coachs',text:'Deux membres de votre staff ne s\u2019entendent plus sur l\u2019approche à adopter pour le prochain combat.',
    choices:[{label:'Trancher soi-même la question',d:[['fightIQ',3],['confidence',3],['composure',-3]]},
             {label:'Laisser le coach principal décider',d:[['discipline',3],['confidence',-2]]}]},
  {id:'evt_documentary_offer',title:'Offre de documentaire',text:'Une équipe de tournage souhaite suivre une saison entière de votre carrière pour un documentaire.',
    choices:[{label:'Accepter, caméras partout',reward:15,d:[['focus',-8],['morale',12]]},
             {label:'Refuser, préserver la tranquillité du camp',d:[['discipline',3],['morale',-3]]}]},
  {id:'evt_home_gym_build',req:f=>(f.earnings||0)>100,title:'Salle personnelle',text:'Vos moyens permettent enfin d\u2019installer une salle privée chez vous, loin du bruit du club.',
    choices:[{label:'Investir dans l\u2019équipement (25k$)',cost:25,d:[['discipline',3],['recovery',3],['form',6]]},
             {label:'Continuer à s\u2019entraîner en club',d:[['composure',2]]}]},
  {id:'evt_weight_cut_horror',req:f=>f.age>28,title:'Une coupe de poids terrible',text:'La déshydratation de cette semaine a été la pire de votre carrière. Votre corps a mis des jours à s\u2019en remettre.',
    choices:[{label:'Revoir sérieusement sa méthode de coupe',d:[['discipline',4],['durability',3],['form',-10]]},
             {label:'Serrer les dents et continuer pareil',d:[['heart',5],['durability',-4],['form',-6]]}]},
  // --- Lot 2 (Gemini, vérifié) ---
  {id:'evt_ice_bath_extreme',title:'Bain de glace prolongé',text:'Votre préparateur vous met au défi de rester cinq minutes de plus dans l\u2019eau à 2°C pour tester vos limites mentales.',
    choices:[{label:'Serrer les dents et rester',d:[['recovery',5],['heart',4],['form',-8]]},
             {label:'Sortir, la récupération standard suffit',d:[['form',5],['discipline',-4]]}]},
  {id:'evt_prodigy_sparring',req:f=>f.org>0,title:'Le petit nouveau',text:'Un jeune prodige de 19 ans fraîchement débarqué à la salle vous met en réelle difficulté lors d\u2019un sparring. Votre ego en prend un coup.',
    choices:[{label:'Ranger son ego et analyser son jeu',d:[['fightIQ',5],['focus',4],['morale',-8]]},
             {label:'Durcir le sparring pour le calmer',d:[['aggression',6],['power',2],['form',-10]]}]},
  {id:'evt_mansion_buy',req:f=>(f.earnings||0)>=100,title:'Folie immobilière',text:'Avec vos récents gains, l\u2019envie d\u2019acheter une immense villa avec piscine devient obsédante. C\u2019est le symbole ultime de la réussite.',
    choices:[{label:'Acheter la villa (60k$)',cost:60,d:[['morale',20],['confidence',5],['focus',-10]]},
             {label:'Placer l\u2019argent sagement',d:[['discipline',6],['focus',4],['morale',-5]]}]},
  {id:'evt_food_poisoning',title:'Le buffet maudit',text:'Une intoxication alimentaire fulgurante vous cloue au lit à trois semaines du combat. Vous êtes complètement déshydraté et affaibli.',
    choices:[{label:'S\u2019entraîner quand même dans la douleur',d:[['heart',6],['durability',3],['form',-20],['cardio',-5]]},
             {label:'Garder le lit et se soigner',d:[['form',8],['recovery',4],['cardio',-8]]}]},
  {id:'evt_boxer_hands',req:f=>f.style==='boxer',title:'Mains de cristal',text:'Vos phalanges vous font atrocement souffrir après chaque séance aux paos. C\u2019est le prix à payer pour frapper aussi lourdement.',
    choices:[{label:'Bander lourdement et continuer de frapper',d:[['power',4],['hook',3],['form',-12]]},
             {label:'Mettre les poings au repos, focus jambes',d:[['footSpeed',5],['adaptability',3],['cross',-4]]}]},
  {id:'evt_wrestler_ear',req:f=>f.style==='wrestler',title:'Oreille en chou-fleur',text:'Votre oreille gauche vient de gonfler dramatiquement après un frottement sévère sur le tapis. Elle est prête à exploser.',
    choices:[{label:'La faire ponctionner chez le médecin',d:[['composure',5],['focus',3],['form',-8]]},
             {label:'La laisser durcir comme un trophée',d:[['durability',5],['confidence',3],['focus',-5]]}]},
  {id:'evt_era_calf_def',req:f=>G.currentEra&&G.currentEra.id==='era_calf',title:'Hachoir à viande',text:'Dans cette ère du calf-kick, vos mollets sont ciblés à chaque session d\u2019entraînement. Vous avez du mal à marcher le matin.',
    choices:[{label:'Conditionner les tibias sur des sacs durs',d:[['durability',6],['kick',3],['form',-15]]},
             {label:'Travailler les changements de garde fluides',d:[['adaptability',5],['footSpeed',4],['power',-5]]}]},
  {id:'evt_imposter_syndrome',title:'Le syndrome de l\u2019imposteur',text:'Il est 3h du matin. Vous fixez le plafond en vous demandant si vous avez vraiment le niveau pour monter dans cette cage face à des tueurs.',
    choices:[{label:'Regarder les vidéos de ses anciennes victoires',d:[['confidence',6],['morale',5],['form',-6]]},
             {label:'Appeler son coach en pleine nuit pour parler tactique',d:[['fightIQ',5],['focus',4],['morale',-5]]}]},
  {id:'evt_hollywood_cameo',req:f=>(f.earnings||0)>30,title:'Caméo hollywoodien',text:'Un studio de cinéma vous propose un petit rôle de mercenaire dans un film d\u2019action. Le tournage empiétera sur vos horaires de camp.',
    choices:[{label:'Accepter le rôle',reward:20,d:[['morale',15],['focus',-10],['form',-8]]},
             {label:'Refuser pour rester 100% focus sur le sport',d:[['discipline',8],['focus',6],['morale',-10]]}]},
  {id:'evt_overtraining',title:'La ligne rouge',text:'Votre corps vous supplie d\u2019arrêter. Vos temps de réaction s\u2019effondrent et votre système nerveux est complètement grillé par le surentraînement.',
    choices:[{label:'Prendre trois jours de repos complet',d:[['recovery',6],['form',15],['discipline',-6]]},
             {label:'Pousser la machine jusqu\u2019à la rupture',d:[['heart',8],['cardio',4],['form',-25]]}]},
  {id:'evt_forgotten_belt',req:f=>!!f.champion,title:'Ceinture oubliée',text:'Vous avez oublié votre ceinture de champion dans le coffre d\u2019un VTC après une soirée de célébration. Le chauffeur exige une récompense pour la rendre.',
    choices:[{label:'Payer la rançon discrètement (5k$)',cost:5,d:[['focus',5],['discipline',3],['morale',-5]]},
             {label:'Le menacer publiquement sur les réseaux',d:[['aggression',6],['confidence',4],['composure',-10]]}]},
  {id:'evt_lumpinee_trip',req:f=>f.style==='muayThai',title:'Pèlerinage au Lumpinee',text:'L\u2019appel de la Thaïlande se fait sentir. Partir s\u2019entraîner à la dure, dans la chaleur étouffante de Bangkok, pourrait raviver votre instinct animal.',
    choices:[{label:'Financer le voyage martial (15k$)',cost:15,d:[['clinchStr',6],['kick',5],['durability',4],['form',-12]]},
             {label:'Rester s\u2019entraîner dans son confort habituel',d:[['discipline',4],['morale',-6]]}]},
  {id:'evt_hot_yoga',title:'Yoga infernal',text:'Un coéquipier vous traîne dans un cours de yoga Bikram à 40°C. Vos muscles raides d\u2019artiste martial crient à l\u2019agonie dès les premières postures.',
    choices:[{label:'Souffrir en silence jusqu\u2019à la fin de la séance',d:[['flexibility',8],['recovery',4],['power',-4]]},
             {label:'Quitter la salle en plein milieu, trempé de sueur',d:[['power',3],['flexibility',-5],['morale',-2]]}]},
  {id:'evt_twitter_beef',title:'Guerre des claviers',text:'Un combattant que vous n\u2019avez même pas provoqué lance une attaque cinglante sur votre style de combat en ligne. Vos notifications explosent.',
    choices:[{label:'Rentrer dans le clash virtuel et faire le buzz',d:[['aggression',6],['confidence',5],['focus',-10]]},
             {label:'Désinstaller l\u2019application et l\u2019ignorer',d:[['composure',8],['discipline',5],['morale',-8]]}]},
  {id:'evt_boxing_gloves_16',req:f=>G.currentEra&&G.currentEra.id==='era_boxing',title:'Le test des 16oz',text:'Dans cette ère dominée par la boxe, d\u2019anciens pros viennent tourner à la salle avec des gants de 16oz pour vous donner une leçon d\u2019anglaise.',
    choices:[{label:'Mettre les gros gants et boxer avec eux',d:[['handSpeed',6],['cross',4],['kick',-5],['form',-8]]},
             {label:'Les emmener au sol (imposer les règles du MMA)',d:[['adaptability',6],['takedown',4],['handSpeed',-5]]}]},
  {id:'evt_invincible_aura',req:f=>(f.streak||0)>=4,title:'Aura d\u2019invincibilité',text:'Votre série de victoires vous donne l\u2019impression d\u2019être un demi-dieu. Plus rien ne semble pouvoir vous blesser dans la cage.',
    choices:[{label:'Embrasser cette confiance absolue',d:[['confidence',8],['power',5],['fightIQ',-8]]},
             {label:'Se forcer à rester humble et paranoïaque',d:[['composure',6],['focus',5],['morale',-6]]}]},
  {id:'evt_change_scenery',req:f=>(f.streak||0)<=-2,title:'Changement de décor',text:'La spirale de la défaite empoisonne l\u2019air de votre salle habituelle. Vous ressentez un besoin vital de vous exiler pour ce camp d\u2019entraînement.',
    choices:[{label:'Partir en camp d\u2019isolement à l\u2019étranger (10k$)',cost:10,d:[['adaptability',6],['fightIQ',5],['confidence',4],['form',-10]]},
             {label:'Serrer les dents et rester fidèle à son équipe',d:[['heart',6],['discipline',4],['confidence',-5]]}]},
  {id:'evt_intrusive_fan',title:'Le fan envahissant',text:'Pendant votre footing matinal à l\u2019aube, un fan vous reconnaît et commence à courir à côté de vous en vous posant mille questions.',
    choices:[{label:'Lui répondre gentiment et faire le footing ensemble',d:[['cardio',4],['morale',8],['focus',-5]]},
             {label:'Accélérer violemment l\u2019allure pour le semer',d:[['footSpeed',5],['explosiveness',4],['morale',-4]]}]},
  {id:'evt_creaky_knee',title:'Genou qui grince',text:'Sur une tentative de takedown routinière, votre genou émet un craquement sourd. La douleur est minime, mais l\u2019angoisse d\u2019une rupture ligamentaire est totale.',
    choices:[{label:'Consulter un spécialiste en urgence (5k$)',cost:5,d:[['recovery',6],['composure',4],['form',-4]]},
             {label:'Bander l\u2019articulation fortement et prier',d:[['heart',5],['durability',3],['confidence',-8]]}]},
  {id:'evt_martial_wisdom',req:f=>f.age>=35,title:'Sagesse martiale',text:'Vos fibres blanches disparaissent, votre explosivité n\u2019est plus ce qu\u2019elle était. Mais là où le corps ralentit, l\u2019esprit commence à voir tout au ralenti.',
    choices:[{label:'Adapter son style sur le timing et le coup d\u2019œil',d:[['fightIQ',8],['composure',6],['handSpeed',-6]]},
             {label:'Refuser l\u2019âge et forcer les drills de vitesse',d:[['handSpeed',5],['explosiveness',3],['recovery',-10],['form',-12]]}]},
  {id:'evt_stubborn_scale',title:'La balance qui stagne',text:'À une semaine de la pesée, votre poids refuse de descendre. Votre métabolisme s\u2019est mis en mode survie et stocke la moindre goutte d\u2019eau.',
    choices:[{label:'Enfiler la combinaison de sudation et courir',d:[['cardio',5],['chin',-8],['form',-18]]},
             {label:'Jeûne hydrique total et absolu dans le noir',d:[['discipline',8],['power',-8],['form',-15]]}]},
  {id:'evt_tape_study',title:'Nuit de cassettes',text:'Vous retrouvez une clé USB contenant des centaines d\u2019heures de combats d\u2019anciennes époques et de vieux tournois.',
    choices:[{label:'Analyser les vieux maîtres toute la nuit',d:[['fightIQ',6],['adaptability',5],['form',-8]]},
             {label:'Aller dormir, le sport a évolué de toute façon',d:[['recovery',5],['form',5],['fightIQ',-3]]}]},
  {id:'evt_cooper_test',title:'Le test de Cooper',text:'Votre préparateur physique apporte un sifflet sur la piste d\u2019athlétisme. "12 minutes. Montrez-moi de quoi vous êtes fait."',
    choices:[{label:'Vomir ses poumons pour battre le record de la salle',d:[['cardio',8],['heart',6],['form',-20]]},
             {label:'Gérer son allure pour faire le strict minimum syndical',d:[['recovery',5],['discipline',-5],['cardio',-2]]}]},
  {id:'evt_tv_documentary',req:f=>f.org>=3,title:'Dans l\u2019intimité du camp',text:'Une équipe télévisée réalise un documentaire "Embedded" sur votre préparation. Ils vous suivent même à la cantine et chez le kiné.',
    choices:[{label:'Jouer le jeu des caméras et faire le show',d:[['confidence',6],['morale',10],['focus',-10]]},
             {label:'Leur montrer la monotonie brutale et silencieuse du métier',d:[['discipline',6],['focus',5],['morale',-6]]}]},
  {id:'evt_gi_nogi',req:f=>f.style==='bjj',title:'L\u2019appel du Kimono',text:'Vos racines vous manquent. Vous ressentez l\u2019envie viscérale de remettre un Gi pour rouler, même si le MMA moderne se pratique en No-Gi.',
    choices:[{label:'Passer la semaine en Kimono',d:[['guardWork',6],['submission',5],['explosiveness',-6]]},
             {label:'Rester pragmatique et s\u2019entraîner en No-Gi',d:[['takedown',4],['adaptability',3],['morale',-5]]}]},
  {id:'evt_forest_kata',req:f=>f.style==='karate',title:'L\u2019esprit de la forêt',text:'Vous décidez de fuir les néons clignotants de la salle pour exécuter vos Katas pieds nus dans la forêt, au lever du soleil.',
    choices:[{label:'Rechercher la fluidité et le vide mental',d:[['footSpeed',6],['composure',5],['durability',-5]]},
             {label:'Durcir ses tibias et poings contre les écorces d\u2019arbres',d:[['durability',8],['kick',4],['form',-12]]}]},
  {id:'evt_neck_harness',title:'Collier de plomb',text:'Un lutteur de passage vous montre un vieil exercice avec un harnais de cou lesté de disques de fonte. Cela a l\u2019air dangereux pour les cervicales.',
    choices:[{label:'Charger les poids et renforcer la nuque',d:[['chin',6],['clinchStr',5],['form',-10]]},
             {label:'Protéger ses cervicales et faire des étirements',d:[['flexibility',5],['recovery',4],['chin',-4]]}]},
  {id:'evt_management_sim',title:'Nuit blanche tactique',text:'Un ami vous offre le dernier jeu de simulation de management sportif. Vous lancez une partie "juste pour voir les menus" et il est soudainement 6h du matin.',
    choices:[{label:'Terminer la saison (esprit tactique en ébullition)',d:[['fightIQ',5],['morale',12],['form',-18]]},
             {label:'Sauvegarder et aller dormir de force',d:[['discipline',6],['recovery',4],['morale',-5]]}]},
  {id:'evt_train_south',req:f=>f.org>0,title:'Retraite au soleil',text:'Pour couper avec la pression asphyxiante du camp, vous partez quelques jours dans le Sud. Le trajet est long, mais le soleil régénère l\u2019esprit.',
    choices:[{label:'Payer le voyage et s\u2019évader (4k$)',cost:4,d:[['morale',18],['recovery',6],['focus',-8]]},
             {label:'Annuler à la dernière minute et s\u2019enfermer à la salle',d:[['focus',6],['discipline',4],['morale',-10]]}]},
  {id:'evt_repotting',title:'Rempotage printanier',text:'Vos plantes d\u2019appartement commencent à étouffer dans leurs vieux pots. L\u2019opération de sauvetage botanique va vous prendre l\u2019après-midi entière.',
    choices:[{label:'Prendre le temps d\u2019avoir la main verte',d:[['composure',6],['recovery',4],['form',-6]]},
             {label:'Laisser les plantes souffrir pour le moment',d:[['focus',5],['aggression',3],['morale',-8]]}]},
  // --- Némésis parallèle : lit l'état réel du rival verrouillé dans le roster ---
  {id:'evt_nemesis_loss',req:f=>f.faithNemesisId&&G.roster.some(o=>o.id===f.faithNemesisId&&(o.streak||0)<0),title:'Chute du rival',text:'Votre rival historique vient de subir un lourd revers. Les journalistes s\u2019empressent de vous demander votre réaction à chaud.',
    choices:[{label:'L\u2019enterrer publiquement',d:[['aggression',4],['morale',5],['composure',-5]]},
             {label:'Lui souhaiter un bon rétablissement',d:[['composure',5],['focus',3]]}]},
  {id:'evt_nemesis_win',req:f=>f.faithNemesisId&&G.roster.some(o=>o.id===f.faithNemesisId&&(o.streak||0)>=3),title:'L\u2019ombre du rival',text:'Votre némésis enchaîne les victoires impressionnantes. Sa hype médiatique commence sérieusement à éclipser la vôtre.',
    choices:[{label:'S\u2019entraîner deux fois plus dur',d:[['form',-15],['focus',8],['cardio',4]]},
             {label:'L\u2019ignorer et rester concentré',d:[['confidence',5],['composure',3],['morale',-5]]}]},
  {id:'evt_nemesis_gym',req:f=>f.faithNemesisId&&G.roster.some(o=>o.id===f.faithNemesisId),title:'Guerre à distance',text:'Rumeur confirmée : votre némésis vient de rejoindre une salle rivale réputée pour sa lutte agressive. Le message est clair.',
    choices:[{label:'Travailler sa défense de lutte en prévision',d:[['tdd',6],['form',-8]]},
             {label:'Parier sur son propre striking',d:[['power',4],['handSpeed',3],['form',-6]]}]}
];
function formatEventDelta(d){
  if(!d || !d.length) return '';
  return d.map(([k,v])=>{
    const isGauge=(k==='morale'||k==='form');
    const lbl=k==='morale'?'Moral':k==='form'?'Forme':attrLabel(k);
    const shown=isGauge?v:Math.round(v/5); // même ratio que d20() pour les vrais attributs /20
    if(shown===0) return '';
    return `<span class="tag2" style="border-color:${shown>=0?'var(--win)':'var(--loss)'};color:${shown>=0?'var(--win)':'var(--loss)'}">${shown>=0?'+':''}${shown} ${lbl}</span>`;
  }).join('');
}
function scr_faith_event(){
  const ev=G.faith.currentEvent;
  if(!ev) return `<div class="scr center intro"><p class="lede">Aucun événement en cours.</p><button class="btn ghost mt" onclick="CL.go('faith_hub')">Retour</button></div>`;
  const f=G.f;
  return `<div class="scr"><div class="bar"><span class="eyebrow">Événement de vie</span></div>
   <h2 class="disp" style="font-size:24px">${esc(ev.title)}</h2>
   <p class="lede small mt">${esc(ev.text)}</p>
   <div style="display:flex;flex-direction:column;gap:10px;margin-top:20px">
     ${ev.choices.map((c,i)=>{
       const locked=c.cost&&(f.earnings||0)<c.cost;
       return `<div class="glass opp" style="padding:14px;text-align:left;opacity:${locked?0.4:1};cursor:${locked?'not-allowed':'pointer'}" ${locked?'':`onclick="CL.chooseFaithEvent(${i})"`}>
         <b>${esc(c.label)}</b>${c.cost?`<span class="muted small" style="color:var(--loss)"> (-${c.cost}k$)</span>`:''}${c.reward?`<span class="small" style="color:var(--win)"> (+${c.reward}k$)</span>`:''}
         <div class="tagrow" style="margin-top:8px">${formatEventDelta(c.d)}</div>
       </div>`;
     }).join('')}
   </div></div>`;
}
function scr_faith_year_end(){
  const ys=G.faith.yearStats; const f=G.f;
  let logHtml='';
  if(ys.yearLog && ys.yearLog.length>0){
    logHtml=`<div class="card glass mb" style="background:var(--panel2);padding:16px;text-align:left;border-left:3px solid var(--sage)">
      <div class="eyebrow mb" style="color:var(--sage)">Journal de bord</div>
      ${ys.yearLog.map(l=>`<div style="padding:6px 0;border-bottom:1px dotted var(--line)"><b style="color:var(--text)">${esc(l.title)}</b><br><span class="muted small">↳ Vous avez choisi : ${esc(l.choice)}</span></div>`).join('')}
    </div>`;
  }
  let skillsHtml='';
  if(ys.newSkills && ys.newSkills.length>0){
    skillsHtml=`<div class="eyebrow mt mb" style="color:var(--gold)">COMPÉTENCES DÉBLOQUÉES</div>`+
      ys.newSkills.map(s=>{ const color=RAR_COLORS[s.rar]||'var(--gold)';
        return `<div class="card glass" style="border-left:3px solid ${color};padding-left:12px;background:var(--panel2)">
          <b style="color:${color}">${s.name}</b> <span class="muted small">(${s.rar})</span>
          <div class="muted small">${s.desc||s.blurb||''}</div></div>`; }).join('');
  } else {
    skillsHtml=`<div class="mono muted small mt" style="padding:12px;border:1px dashed var(--line)">Aucune nouvelle compétence assimilée cette année. Entraînez-vous davantage.</div>`;
  }
  return `<div class="scr center intro">
   <div class="eyebrow sage">Bilan Annuel</div>
   <h2 class="disp big" style="font-size:42px">SAISON ${G.faith.year}</h2>
   <p class="lede small">Le conseil d\u2019administration a évalué votre progression sportive et financière.</p>
   <div class="glass" style="background:var(--panel2);border:1px solid var(--line);padding:16px;margin:20px 0;text-align:left">
     <div class="hero-name" style="font-size:22px">${orgDisplayName(f).toUpperCase()}</div>
     <div class="muted small">Ligue actuelle · Classement #${ys.rank}</div>
     <div class="hr"></div>
     <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;text-align:center">
       <div class="card" style="margin:0;padding:12px"><span class="stat-big ${ys.wins>ys.losses?'hot':''}">${ys.wins}-${ys.losses}</span><span class="stat-lbl">Record Annuel</span></div>
       <div class="card" style="margin:0;padding:12px"><span class="stat-big" style="color:${ys.eloDelta>=0?'var(--win)':'var(--loss)'}">${ys.eloDelta>0?'+':''}${ys.eloDelta}</span><span class="stat-lbl">Progression Elo</span></div>
       <div class="card" style="margin:0;padding:12px"><span class="stat-big" style="font-size:24px">${formatArgent(ys.earningsDelta)}</span><span class="stat-lbl">Gains Nets</span></div>
       <div class="card" style="margin:0;padding:12px"><span class="stat-big" style="font-size:24px;color:${ys.dmgHead>30?'var(--loss)':'var(--text)'}">${ys.dmgHead}</span><span class="stat-lbl">Dégâts Crâniens Reçus</span></div>
     </div>
   </div>
   ${logHtml}
   ${skillsHtml}
   <button class="btn primary mt" style="padding:20px;font-size:20px;margin-top:32px" onclick="CL.nextFaithYear()">DÉBUTER LA SAISON ${G.faith.year+1}</button>
  </div>`;
}
/* ==== [FIN ANCRE] ==== */
function scr_draft(){ const pool=G.arcade.pool; const isBoss=G.arcade.mode==='boss_run'; const isLadder=G.arcade.mode==='ladder_100';
  let h=`<div class="scr"><div class="bar" style="border-bottom:2px solid var(--line);margin-bottom:24px;padding-bottom:8px">
   <span class="eyebrow mono" style="color:var(--blood)">${isBoss?'BOSS RUN // 5 CHAMPIONS':isLadder?'WTUMMA // CLASSEMENT MONDIAL DES 100':'WTUMMA // WORLD TOURNAMENT'}</span></div>
   <p class="lede" style="margin-bottom:32px;font-size:15px">${isBoss?'Affrontez 5 champions d\u2019affilée. KO uniquement. La défaite est éliminatoire.':isLadder?'Vous commencez au rang #100. Défiez les combattants mieux classés pour voler leur place jusqu\u2019au sommet. La défaite est éliminatoire.':'Bracket à 64 combattants. Un OVR élevé vous donne une meilleure Seed, un OVR faible vous garantit l\u2019enfer.'}</p>`;
  pool.forEach((p,i)=>{
    h+=`<div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--line);padding:16px;margin-bottom:20px">
      <div class="meta-strip"><div><span>Style</span><b>${p.styleLabel}</b></div></div>
      <div class="hero-name">${p.nick} ${p.flag}</div>
      <div class="narr" style="margin:10px 0 0;position:relative;z-index:2"><blockquote style="font-size:14px">« ${p._perk||''} »</blockquote></div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:16px 0;position:relative;z-index:2" class="mono">
        <div style="background:var(--panel2);border:1px solid var(--line);padding:8px 0;text-align:center"><span class="stat-lbl">STRK</span><b style="font-size:18px">${Math.round((p.attrs.jab+p.attrs.cross+p.attrs.hook)/3)}</b></div>
        <div style="background:var(--panel2);border:1px solid var(--line);padding:8px 0;text-align:center"><span class="stat-lbl">GRAP</span><b style="font-size:18px">${Math.round((p.attrs.takedown+p.attrs.submission+p.attrs.topControl)/3)}</b></div>
        <div style="background:var(--panel2);border:1px solid var(--gold-d);padding:8px 0;text-align:center"><span class="stat-lbl">PUIS</span><b style="font-size:18px" class="gold">${p.attrs.power}</b></div>
        <div style="background:var(--panel2);border:1px solid var(--line);padding:8px 0;text-align:center"><span class="stat-lbl">CARDIO</span><b style="font-size:18px">${p.attrs.cardio}</b></div>
      </div>
      <button class="btn" style="border-color:var(--text);position:relative;z-index:2" onclick="CL.selectDraft(${i})">SÉLECTIONNER CE PROFIL</button>
    </div>`;
  });
  h+=`<button class="btn ghost mt" style="border:none;color:var(--muted)" onclick="CL.go('title')">← Annuler</button></div>`;
  return h;
}
function scr_gameover(){ const a=G.arcade, f=G.f;
  if(a.mode==='boss_run'){
    const isVictory=a.streak>=a.target;
    return `<div class="scr" style="display:flex;flex-direction:column;justify-content:center;min-height:80vh">
   <div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--line);padding:20px;margin-bottom:24px;text-align:center">
     <div class="hero-name" style="color:${isVictory?'var(--gold)':'var(--loss)'}">${isVictory?'CHAMPION ARCADE':'R.I.P.'}<em style="color:var(--muted)">${isVictory?'Survivant du Gauntlet':'Fin de la run'}</em></div>
   </div>
   <div class="glass" style="position:relative;background:var(--panel2);border:1px solid var(--line);border-left:3px solid ${isVictory?'var(--gold)':'var(--loss)'};padding:16px;margin-bottom:24px">
     <div class="meta-strip"><div><span>Profil</span><b>${(f.styleLabel||'').toUpperCase()}</b></div></div>
     <div class="hero-name" style="font-size:clamp(24px,7vw,32px)">${esc(f.nick||f.name)} ${f.flag}</div>
     <div class="stat-band"><div><span class="stat-big hot">${a.streak}/${a.target}</span><span class="stat-lbl">Victoires</span></div></div>
   </div>
   <div class="narr"><blockquote>${isVictory?`« Contre toute attente, il a marché sur l\u2019algorithme. 5 cadavres laissés dans la cage. Le contrat est rempli. »`:`« Le combat de trop. L\u2019ascension s\u2019arrête net sur la toile de l\u2019octogone. Les lumières s\u2019éteignent. »`}</blockquote></div>
   <button class="btn mt" style="padding:20px;font-size:18px;border-color:var(--text)" onclick="CL.retryArcade()">NOUVEAU RUN</button>
   <button class="btn ghost mt" onclick="CL.go('title')">${isVictory?'RETOURNER DANS L\u2019OMBRE':'ACCEPTER LA DÉFAITE'}</button>
   </div>`;
  }
  if(a.mode==='ladder_100'){
    const isVictory=a.rank===1;
    const earned=Math.max(10,Math.round((101-a.rank)*8));
    return `<div class="scr" style="display:flex;flex-direction:column;justify-content:center;min-height:80vh">
   <div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--line);padding:20px;margin-bottom:24px;text-align:center">
     <div class="hero-name" style="color:${isVictory?'var(--gold)':'var(--loss)'}">${isVictory?'CHAMPION WTUMMA':'R.I.P.'}<em style="color:var(--muted)">${isVictory?'Vous êtes le #1 mondial':'Éliminé au rang #'+a.rank}</em></div>
   </div>
   <div class="glass" style="position:relative;background:var(--panel2);border:1px solid var(--line);border-left:3px solid ${isVictory?'var(--gold)':'var(--loss)'};padding:16px;margin-bottom:24px">
     <div class="meta-strip"><div><span>Profil</span><b>${(f.styleLabel||'').toUpperCase()}</b></div></div>
     <div class="hero-name" style="font-size:clamp(24px,7vw,32px)">${esc(f.nick||f.name)} ${f.flag}</div>
     <div class="stat-band">
       <div><span class="stat-big hot">${a.fightsDone||0}</span><span class="stat-lbl">Victoires d\u2019ascension</span></div>
       <div><span class="stat-big gold">+${earned}</span><span class="stat-lbl">Points de salle gagnés</span></div>
     </div>
   </div>
   <div class="narr"><blockquote>${isVictory?`« 99 cadavres en contrebas. L\u2019ascension est terminée, le trône vous appartient. »`:`« Une erreur et c\u2019est la chute libre. Le sommet restera hors de portée. »`}</blockquote></div>
   <button class="btn mt" style="padding:20px;font-size:18px;border-color:var(--text)" onclick="CL.retryArcade()">NOUVEAU RUN</button>
   <button class="btn ghost mt" onclick="CL.go('title')">RETOURNER AU MENU</button>
   </div>`;
  }
  const isVictory=a.victory;
  const points={1:2,2:6,3:14,4:28,5:50,6:100,7:100};
  const earned=points[a.tournament.roundStep]||2;
  return `<div class="scr" style="display:flex;flex-direction:column;justify-content:center;min-height:80vh">
   <div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--line);padding:20px;margin-bottom:24px;text-align:center">
     <div class="hero-name" style="color:${isVictory?'var(--gold)':'var(--loss)'}">${isVictory?'CHAMPION WTUMMA':'ÉLIMINÉ'}<em style="color:var(--muted)">${a.tournament.stepName}</em></div>
   </div>
   <div class="glass" style="position:relative;background:var(--panel2);border:1px solid var(--line);border-left:3px solid ${isVictory?'var(--gold)':'var(--loss)'};padding:16px;margin-bottom:24px">
     <div class="meta-strip"><div><span>Profil</span><b>${(f.styleLabel||'').toUpperCase()}</b></div></div>
     <div class="hero-name" style="font-size:clamp(24px,7vw,32px)">${esc(f.nick||f.name)} ${f.flag}</div>
     <div class="stat-band"><div><span class="stat-big hot">+${earned}</span><span class="stat-lbl">WT Points gagnés</span></div></div>
   </div>
   <div class="narr"><blockquote>${isVictory?`« 63 combattants laissés sur le carreau. L\u2019octogone vous appartient, jusqu\u2019à ce qu\u2019un nouveau challenger se présente. »`:`« Le bracket est impitoyable. Une seule erreur et c\u2019est le vol de retour. »`}</blockquote></div>
   <button class="btn mt" style="padding:20px;font-size:18px;border-color:var(--text)" onclick="CL.retryArcade()">NOUVEAU RUN</button>
   <button class="btn ghost mt" onclick="CL.go('title')">RETOURNER AU MENU</button>
   </div>`;
}
function scr_arcadehub(){ const f=G.f, a=G.arcade;
  if(a.mode==='boss_run'){
    return `<div class="scr center intro"><div class="eyebrow" style="color:var(--blood)">GAUNTLET // RUN EN COURS</div>
   <div class="hero-name" style="text-align:center">${a.streak} / ${a.target}<em style="color:var(--muted)">${f.nick} ${f.flag} — ${recordStr(f)} sur ce run</em></div>
   <div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--line);padding:16px;text-align:left;margin-top:20px">
     <div class="eyebrow mb">Prochain adversaire</div>
     <div class="hero-name" style="font-size:clamp(22px,6vw,28px)">${esc(a.opponent.name)} ${a.opponent.flag}</div>
     <div class="muted small mt">${a.opponent.styleLabel} · ${a.opponent.age} ans</div></div>
   <button class="btn primary mt" style="font-size:20px;padding:18px" onclick="CL.fightArcade()">COMBATTRE</button>
   <button class="btn ghost" onclick="CL.go('title')">Abandonner le run</button></div>`;
  }
  if(a.mode==='ladder_100'){
    return `<div class="scr center intro"><div class="eyebrow" style="color:var(--sage)">WTUMMA // ASCENSION</div>
   <div class="hero-name" style="text-align:center">RANG #${a.rank}<em style="color:var(--muted)">${f.nick} ${f.flag} — Objectif #1</em></div>
   <div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--line);padding:16px;text-align:left;margin-top:20px">
     <div class="eyebrow mb">Prochaine cible : Rang #${a.opponent.ladderRank}</div>
     <div class="hero-name" style="font-size:clamp(22px,6vw,28px)">${esc(a.opponent.name)} ${a.opponent.flag}</div>
     <div class="muted small mt">${a.opponent.styleLabel} · OVR ${a.opponent.overall}</div></div>
   <button class="btn primary mt" style="font-size:20px;padding:18px" onclick="CL.fightArcade()">DÉFIER LE RANG #${a.opponent.ladderRank}</button>
   <button class="btn ghost" onclick="CL.go('title')">Abandonner le run</button></div>`;
  }
  return `<div class="scr center intro"><div class="eyebrow" style="color:var(--blood)">WTUMMA // ${a.tournament.stepName.toUpperCase()}</div>
   <div class="hero-name" style="text-align:center">TÊTE DE SÉRIE #${f.seed}<em style="color:var(--muted)">${f.nick} ${f.flag}</em></div>
   <div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--line);padding:16px;text-align:left;margin-top:20px">
     <div class="eyebrow mb">Prochain adversaire : Tête de série #${a.opponent.seed}</div>
     <div class="hero-name" style="font-size:clamp(22px,6vw,28px)">${esc(a.opponent.name)} ${a.opponent.flag}</div>
     <div class="muted small mt">${a.opponent.styleLabel} · OVR ${a.opponent.overall}</div></div>
   <button class="btn primary mt" style="font-size:20px;padding:18px" onclick="CL.fightArcade()">COMBATTRE (${a.tournament.stepName.toUpperCase()})</button>
   <button class="btn ghost" onclick="CL.go('title')">Abandonner le run</button></div>`;
}
/* ==== [ANCRE: ECRAN_ARCADE_UPGRADES] — camp d'entraînement roguelite entre
   chaque tour du Bracket 64 : un entraînement + une compétence à choisir. ==== */
function scr_arcade_upgrades(){
  const a=G.arcade, f=G.f, g=groupAvg(f);
  const stepName=a.tournament?a.tournament.stepName:'Ascension';
  const grp=(key,title,avg)=>`<div class="card"><div class="grp-h"><span class="disp" style="font-size:17px">${title}</span><span class="gold mono">${d20(avg)}/20</span></div>
     ${ATTR[key].map(att=>`<div class="attr"><span class="attr-l">${att[1]}</span>${gauge(f.attrs[att[0]])}<span class="attr-v">${d20(f.attrs[att[0]])}</span></div>`).join('')}</div>`;
  let h=`<div class="scr"><div class="bar"><span class="eyebrow">WTUMMA // AMÉLIORATIONS</span></div>`;
  if(!a.upgradesChosen.skill){
    h+=`<p class="lede small">L\u2019étau se resserre. Sélectionnez une nouvelle compétence pour la suite du parcours.</p>
        <div class="eyebrow mt mb" style="color:var(--gold)">1. NOUVELLE COMPÉTENCE (${stepName})</div>`;
    a.skillOpts.forEach((s,i)=>{
      const color=RAR_COLORS[s.rar]||'var(--gold)';
      h+=`<div class="opp" style="border-left:3px solid ${color}" onclick="CL.pickArcadeSkill(${i})">
            <b style="color:${color}">${s.name}</b> <span class="muted small">(${s.rar})</span>
            <div class="muted small mt">${s.desc||s.blurb||''}</div>
            ${s.fx?`<div class="mono small mt" style="color:var(--win)">${formatSkillFx(s.fx)}</div>`:''}</div>`;
    });
    if(!a.skillOpts.length) h+=`<div class="card glass mt"><span class="muted small">Aucune compétence disponible pour l\u2019instant.</span></div>
          <button class="btn ghost mt" onclick="CL.pickArcadeSkill(-1)">Continuer vers le camp</button>`;
  } else if(!a.upgradesChosen.train){
    h+=`<p class="lede small">Sélectionnez un ajustement physique.</p>
        <div class="eyebrow mt mb" style="color:var(--gold)">2. CONDITIONNEMENT & SPARRING</div>`;
    a.trainOpts.forEach((t,i)=>{
      const deltas=t.d.map(([k,v])=>{ const lbl=k==='morale'?'Moral':k==='form'?'Forme':attrLabel(k);
        const isGauge=(k==='morale'||k==='form');
        const shown=isGauge?v:Math.round(v/5); // même ratio que d20() pour les vrais attributs /20
        return `<span class="dlt ${v>=0?'up':'dn'}">${shown>=0?'+':''}${shown} ${lbl}</span>`; }).join('');
      h+=`<div class="opp" onclick="CL.pickArcadeTrain(${i})"><div class="opp-top"><span class="opp-nm">${t.label}</span></div>
            <div class="opp-mid">${t.hint}</div><div class="dlts">${deltas}</div></div>`;
    });
  }
  h+=`<div class="hr" style="margin:24px 0"></div>
      <div class="eyebrow mb">Attributs du combattant (temps réel)</div>
      ${grp('tech','Technique',g.tech)}${grp('ment','Mental',g.ment)}${grp('phys','Physique',g.phys)}
  </div>`;
  return h;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: TITLE_ELIGIBLE] — condition UNIQUE, partagée par genOpponents()
   et fightKind(). Avant : les deux vérifiaient des choses différentes
   (streak vs orgWins), ce qui permettait de battre le vrai champion sans que
   le combat soit jamais reconnu comme un combat de titre. ==== */
function isTitleEligible(f){
  if(f.org<1 || f.streak<=0) return false;
  if(f.history && f.history.length>=3){
    const recentLosses=f.history.slice(-3).filter(h=>h.res==='loss').length;
    if(recentLosses>=2) return false;
  }
  return (divRank(f)<=2 || ((f.streak||0)>=6 && divRank(f)<=4));
}
/* ==== [FIN ANCRE] ==== */
function fightKind(){ const f=G.f; if(f.champion) return 'defense'; if(isTitleEligible(f)) return 'title'; return 'normal'; }

function resolveFight(){ const {opp,rounds,kind}=G.fight;
  G.f.lastOpponentId=opp.id;
  G.f.recentOpps=G.f.recentOpps||[];
  G.f.recentOpps.unshift(opp.id);
  if(G.f.recentOpps.length>4) G.f.recentOpps.length=4;
  // ==== [ANCRE: RANGS_AVANT] — capturés avant simulateFight/applyResult, car la
  // victoire elle-même modifie le classement : le leapfrog doit juger la
  // situation AVANT le combat ("j'étais outsider, j'ai battu un top 3"),
  // pas après (sinon la condition échoue la plupart du temps — vérifié). ====
  const myRankBefore=divRank(G.f), oppRankBefore=divRank(opp);
  // ==== [FIN ANCRE] ====
  // ==== [ANCRE: META05] — boost temporaire "dernier tour de piste".
  // Le jeu ne connaît que l'âge en années entières (pas de calendrier précis),
  // donc "dernier combat avant la retraite" est approximé par : le combattant
  // est déjà dans sa dernière année avant le seuil de retraite forcée. ====
  let retAgeForLastFight=42; if(G.f.skills&&G.f.skills.includes('meta01')) retAgeForLastFight+=2;
  const isLikelyLastFight=G.f.skills&&G.f.skills.includes('meta05')&&G.f.age>=retAgeForLastFight-1;
  const OFFENSIVE_CHANNELS=['power','handSpeed','kick','explosiveness','killer'];
  const savedAttrs={};
  if(isLikelyLastFight){ OFFENSIVE_CHANNELS.forEach(k=>{ savedAttrs[k]=G.f.attrs[k]; G.f.attrs[k]=clamp(G.f.attrs[k]+6,1,100); }); }
  // ==== [ANCRE: MALUS_EVENEMENT] — coupe de poids ratée / blessure mineure,
  // fusionné avec le mécanisme meta05 existant (même savedAttrs, restauration commune). ====
  if(G.fight.malus){ for(const k in G.fight.malus){
    if(savedAttrs[k]===undefined) savedAttrs[k]=G.f.attrs[k];
    G.f.attrs[k]=clamp(G.f.attrs[k]+G.fight.malus[k],1,100); } }
  // ==== [FIN ANCRE] ====
  // ==== [ANCRE: LOT7_OPPMALUS + LOT1_BUFFS_TEMPORAIRES] — G.fight.oppMalus
  // (sparring sur-mesure) n'était jusqu'ici jamais appliqué à l'adversaire ;
  // opp est un objet PERSISTANT du roster (pas recréé à chaque combat), donc
  // sa restauration doit être distincte de savedAttrs (celui du joueur). ====
  const oppSavedAttrs={};
  if(G.fight.oppMalus){ for(const k in G.fight.oppMalus){
    if(oppSavedAttrs[k]===undefined) oppSavedAttrs[k]=opp.attrs[k];
    opp.attrs[k]=clamp(opp.attrs[k]+G.fight.oppMalus[k],1,100); } }
  if(typeof checkAndApplyEra==='function') checkAndApplyEra();
  const eraSavedMe=(typeof eraBuffSnapshot==='function')?eraBuffSnapshot(G.f):{};
  const eraSavedOpp=(typeof eraBuffSnapshot==='function')?eraBuffSnapshot(opp):{};
  const tacticalSavedOpp=(typeof applyTacticalMemory==='function')?applyTacticalMemory(opp,G.f):{};
  // ==== [FIN ANCRE] ====
  const adaptivePlanForOpp=(typeof getAdaptiveNPCTactics==='function')?getAdaptiveNPCTactics(opp,G.f):null;
  const res=simulateFight(G.f,opp,rounds,G.fight.plan,adaptivePlanForOpp&&adaptivePlanForOpp.m); const win=applyResult(G.f,opp,res,'A'); applyResult(opp,G.f,res,'B');
  if(typeof checkIronManDeath==='function') checkIronManDeath(res,null);
  if(typeof evaluateSponsor==='function') evaluateSponsor(res);
  // ==== [ANCRE: NARRATIF_APPEL] — calculé ici (mêmes données réelles qu'avant),
  // pour pouvoir à la fois l'afficher sur l'écran de résultat ET l'archiver
  // durablement dans f.history (Phase 6) — un seul générateur, pas de doublon. ====
  const narrative=generateNarrativeQuote(G.f,{win,method:res.method,res,opp,myRank:myRankBefore,oppRank:oppRankBefore});
  // ==== [FIN ANCRE] ====
  // ==== [ANCRE: HISTORIQUE_ENRICHI] — la dernière entrée poussée par applyResult()
  // (partagée avec les combats PNJ en coulisses, donc jamais modifiée elle-même)
  // est enrichie ici, seulement pour le joueur, avec les infos d'affichage que
  // scr_history() a besoin (adversaire, rang au moment du combat, année, narration). ====
  { const last=G.f.history[G.f.history.length-1];
    if(last){ last.oppName=opp.name; last.oppFlag=opp.flag; last.oppRank=oppRankBefore; last.season=(G.season&&G.season.year)||1; last.narrative=narrative.txt(G.f); } }
  // ==== [FIN ANCRE] ====
  for(const k in savedAttrs){ G.f.attrs[k]=savedAttrs[k]; }
  for(const k in oppSavedAttrs){ opp.attrs[k]=oppSavedAttrs[k]; }
  if(typeof restoreSnapshot==='function'){ restoreSnapshot(G.f,eraSavedMe); restoreSnapshot(opp,eraSavedOpp); restoreSnapshot(opp,tacticalSavedOpp); }
  if(Object.keys(savedAttrs).length) G.f.overall=overall(G.f);
  // ==== [ANCRE: DEGENERESCENCE_MENTON] — remplace l'ancienne dégradation
  // aléatoire et invisible (retirée de simulateFight) par des paliers de
  // dégâts crâniens cumulés, toujours explicites : les petits combats
  // techniques n'entament plus rien au hasard, seules les guerres et les KO
  // subis remplissent la jauge ; quand elle déborde, le plafond du menton
  // s'effondre d'un coup, avec un avertissement clair plutôt qu'un tirage
  // silencieux que le joueur ne peut jamais relier à une cause précise.
  const dmgTaken=res.stats.A.dmgHead||0;
  G.f.cumulativeHeadDamage=(G.f.cumulativeHeadDamage||0)+dmgTaken;
  if(!win && res.method.startsWith('KO')) G.f.cumulativeHeadDamage+=25;
  const degLevel=G.f.chinDegradationLevel||0;
  const chinThreshold=120+(degLevel*80); // seuils de rupture : 120, 200, 280...
  if(G.f.cumulativeHeadDamage>=chinThreshold){
    G.f.chinDegradationLevel=degLevel+1;
    if(!G.f.maxAttrs) G.f.maxAttrs={};
    const oldMax=G.f.maxAttrs.chin!=null?G.f.maxAttrs.chin:100;
    const drop=RI(10,15);
    G.f.maxAttrs.chin=Math.max(10,oldMax-drop);
    if(G.f.attrs.chin>G.f.maxAttrs.chin) G.f.attrs.chin=G.f.maxAttrs.chin;
    else G.f.attrs.chin=Math.max(1,G.f.attrs.chin-drop);
    G.f.overall=overall(G.f);
    G.lastMsg="ALERTE MÉDICALE CRITIQUE : le scanner post-combat est formel. Les commotions répétées ont laissé des traces. Votre menton s\u2019est brisé — vous ne pourrez plus jamais encaisser comme avant. Changez de style ou préparez votre retraite.";
  }
  // ==== [FIN ANCRE] ====
  // ==== [FIN ANCRE] ====
  // ==== [ANCRE: CACHET] — bourse en milliers $, structure Show/Win réaliste
  // (audit économie #9) : garantie de présence + prime de victoire séparées,
  // multiplicateur de champion différencié par palier, prime de performance
  // proportionnelle plutôt qu'un forfait fixe identique à tous les niveaux.
  // Lot 2 (contrat réel) : si un contrat existe (org pro), la bourse suit son
  // cachet fixé à la signature plutôt que le barème brut de l'organisation —
  // repli sur l'ancien barème pour l'amateur (pas de contrat) et les
  // sauvegardes migrées sans contrat encore assigné.
  const ORG_PURSES=[[0,0],[0.6,0.6],[2,2],[5,5],[15,15],[30,30],[250,0]];
  const CHAMP_MULT=[1,2.0,2.2,2.5,2.5,5.0,2.0];
  let showPurse,winBonus;
  if(G.f.org>0 && G.f.contract){
    showPurse=G.f.contract.show; winBonus=G.f.contract.win;
    if(G.f.champion && !G.f.contract.isChampContract){ const m=CHAMP_MULT[G.f.org]||1; showPurse*=m; winBonus*=m; }
  } else {
    [showPurse,winBonus]=ORG_PURSES[G.f.org]||[0,0];
    if(G.f.champion){ const m=CHAMP_MULT[G.f.org]||1; showPurse*=m; winBonus*=m; }
  }
  const rivalryMult=(typeof getRivalryPurseMultiplier==='function')?getRivalryPurseMultiplier(G.f,opp):1.0;
  showPurse*=rivalryMult; winBonus*=rivalryMult;
  let purse=showPurse;
  if(win) purse+=winBonus;
  if(win && !isDecisionLike(res.method)){ purse+=(G.f.org===5)?50:showPurse*0.25; }
  if(G.fight.pursePenalty) purse=Math.floor(purse*G.fight.pursePenalty*100)/100;
  const purseGross=purse;
  purse=Math.floor(purse*0.75*100)/100; // frais de camp fixes (manager, coach, salle) : ~25% de la bourse brute
  let agentFee=0;
  if(G.f.agentCut){ agentFee=Math.floor(purseGross*G.f.agentCut*100)/100; purse=Math.floor((purse-agentFee)*100)/100; }
  const campFee=+(purseGross-purse-agentFee).toFixed(2);
  G.f.earnings=(G.f.earnings||0)+purse;
  G.fight.purseDetail={gross:purseGross,fee:campFee,agentFee,net:purse};
  // Décompte du contrat : un combat de moins avant renégociation.
  let contractExpiry=false;
  if(G.f.org>0 && G.f.contract){
    G.f.contract.fightsLeft--;
    if(G.f.contract.fightsLeft<=0) contractExpiry=true;
  }
  // ==== [FIN ANCRE] ====
  // ==== [ANCRE: RIVALITE] — une défaite, ou une décision très serrée, crée une animosité ====
  const scoreDiff=Math.abs((res.scoreA||0)-(res.scoreB||0));
  if(!win || (isDecisionLike(res.method) && scoreDiff<=8)){
    if(!G.f._rivalries) G.f._rivalries={};
    G.f._rivalries[opp.id]=(G.f._rivalries[opp.id]||0)+1;
    if(G.f._rivalries[opp.id]>=2) G.f.rivalId=opp.id;
  }
  // Némésis Faith : verrouillée dès la première vraie rivalité, ne change plus
  // jamais ensuite (contrairement à f.rivalId qui peut glisser vers l'animosité
  // la plus récente) — c'est le fil rouge narratif de toute la carrière.
  if(G.faith && !G.f.faithNemesisId && G.f.rivalId){ G.f.faithNemesisId=G.f.rivalId; }
  // Le "plus grand rival" compte TOUTES les confrontations (peu importe le
  // résultat) — avant, seule l'animosité (défaite/décision serrée) comptait,
  // donc un adversaire battu 15 fois de façon décisive n'était presque jamais
  // retenu comme rival marquant.
  if(!G.f._allMeetings) G.f._allMeetings={};
  G.f._allMeetings[opp.id]=(G.f._allMeetings[opp.id]||0)+1;
  if(!G.f.biggestRival || G.f._allMeetings[opp.id]>(G.f.biggestRival.count||0)){
    G.f.biggestRival={name:opp.name,flag:opp.flag,count:G.f._allMeetings[opp.id],W:opp.W,L:opp.L,style:opp.styleLabel};
  }
  // ==== [FIN ANCRE] ====
  // ==== [ANCRE: LEAPFROG_CUT] — traçage de la facilité des combats + bond de classement,
  // et sanction si le joueur enchaîne trop d'adversaires trop faciles. ====
  let forced=G.f.retired||false;
  const myRankNow=myRankBefore, oppRankNow=oppRankBefore;
  // ==== [ANCRE: ELO_UPDATE] — met à jour orgElo (poids 80% dans p4pScore) et
  // careerElo (20%) du joueur ET de l'adversaire, K-factor modulé selon la
  // méthode de finition et le round — remplace l'ancien comptage brut orgWins.
  if(opp.orgElo===undefined) opp.orgElo=eloBaseline(opp.org,opp.overall);
  if(opp.careerElo===undefined) opp.careerElo=eloBaseline(opp.org,opp.overall);
  const eloRes=calculateEloDelta(G.f.orgElo,opp.orgElo,res.winner,res.method,res.round);
  G.f.orgElo=Math.max(500,G.f.orgElo+eloRes.deltaA); opp.orgElo=Math.max(500,opp.orgElo+eloRes.deltaB);
  G.f.careerElo=Math.max(500,G.f.careerElo+Math.round(eloRes.deltaA*0.5)); opp.careerElo=Math.max(500,opp.careerElo+Math.round(eloRes.deltaB*0.5));
  G.f.inactivityCycles=0;
  // ==== [FIN ANCRE] ====
  if(win){
    if(oppRankNow>myRankNow+4 && !opp.champion){ G.f.easyFights=(G.f.easyFights||0)+1; } else { G.f.easyFights=0; }
    // ==== [ANCRE: LEAPFROG_PROPORTIONNEL] — battre un adversaire mieux classé
    // referme la moitié de l'écart de SCORE vers lui (pas juste un bonus fixe
    // réservé au top-3) : bat le 13e, tu te rapproches vraiment de sa place.
    // Remplace l'ancienne règle étroite (+60 fixe, seulement si adversaire
    // top-3), désormais couverte naturellement par la proportionnalité. ====
    const oppScoreNow=p4pScore(opp), myScoreNow=p4pScore(G.f);
    if(oppScoreNow>myScoreNow){
      const rankGap=myRankNow-oppRankNow;
      let leapMult=0.5;
      if(rankGap>=10) leapMult=1.0;
      else if(rankGap>=5) leapMult=0.75;
      G.f.rankBoost=(G.f.rankBoost||0)+Math.round((oppScoreNow-myScoreNow)*leapMult);
    }
    // ==== [FIN ANCRE] ====
  } else if(res.winner==='D'){
    G.f.easyFights=0; // un match nul n'est ni un combat facile ni un vrai revers de classement
  } else {
    G.f.easyFights=0;
    // ==== [ANCRE: RANK_CRASH] — une défaite classé top-3 doit vraiment faire
    // chuter (vers la 4e place environ, comme en vrai MMA), pas juste reculer
    // proportionnellement au score : un gros capital de victoires rendait le
    // joueur insubmersible après une seule défaite (mesuré : #1 avec 1736 pts
    // restait #1 à 1601 pts après une perte, l'écart avec le n°2 étant trop
    // grand). ====
    if(myRankNow<=3){
      const sortedNow=G.roster.filter(o=>!o.champion).slice().sort((a,b)=>p4pScore(b)-p4pScore(a));
      const fallback={W:0,L:0,D:0,ko:0,sub:0,koLoss:0,streak:0,org:G.f.org,defenses:0,champion:null,orgWins:0};
      const targetScore=p4pScore(sortedNow[3]||sortedNow[sortedNow.length-1]||fallback);
      const scoreNoBoost=p4pScore(Object.assign({},G.f,{rankBoost:0}));
      if(scoreNoBoost>targetScore){ G.f.rankBoost=(G.f.rankBoost||0)-Math.round((scoreNoBoost-targetScore)*1.05); }
    }
    // ==== [FIN ANCRE] ====
  }
  let milestone='';
  // ==== [ANCRE: CASCADE_SERIE_DEFAITES] — 3 défaites d'affilée ont désormais
  // une vraie conséquence (manque confirmé : jusqu'ici seul le refus répété de
  // combats faciles déclenchait une rétrogradation, une série de défaites
  // n'avait aucun effet structurel en dehors des paliers internationaux).
  if(!forced && (G.f.streak||0)<=-3){
    if(G.f.org>1 && G.f.org<5){
      G.f.org--; G.f.orgWins=0; G.f.champion=null; G.f.defenses=0; G.f.rivalId=null;
      G.f.orgElo=eloBaseline(G.f.org,G.f.overall); G.f.rankBoost=0;
      if(ORG_FLAVORS[G.f.org]) G.f.orgFlavor=pick(ORG_FLAVORS[G.f.org]);
      G.roster=makeOrgRoster(G.f);
      milestone='Rétrogradé d\u2019organisation suite à cette série de défaites.';
    } else if(G.f.org===1){
      if(!G.f.org1Warned){
        G.f.org1Warned=true; G.f.orgWins=0; G.f.champion=null; G.f.defenses=0; G.f.rivalId=null;
        G.f.orgElo=eloBaseline(1,G.f.overall); G.f.rankBoost=0;
        milestone='Dernier avertissement du circuit pro. Une nouvelle série de défaites mettra fin à ton contrat.';
      } else {
        G.f.retired=true; forced=true; milestone='Renvoyé du circuit pro suite à vos défaites. Votre carrière s\u2019arrête ici.';
      }
    } else if(G.f.org===0 && (G.f.W<G.f.L || G.f.age>=26)){
      G.f.retired=true; forced=true; milestone='Éliminé du circuit amateur. Aucune organisation ne vous réengage.';
    }
  }
  // ==== [FIN ANCRE] ====
  if((G.f.easyFights||0)>=3){
    if(G.f.org>1){ G.f.org--; G.f.easyFights=0; G.f.champion=null; G.f.orgElo=eloBaseline(G.f.org,G.f.overall); G.f.rankBoost=0; milestone='Rétrogradé d\u2019organisation : refus des défis.'; G.roster=makeOrgRoster(G.f); }
    else if(G.f.org===1){
      if(!G.f.org1Warned){ G.f.org1Warned=true; G.f.easyFights=0; milestone='Dernier avertissement pour refus de combattre.'; }
      else { G.f.retired=true; forced=true; milestone='Contrat pro coupé pour refus de combattre. Retraite forcée.'; }
    }
    else { G.f.retired=true; forced=true; milestone='Contrat coupé par l\u2019organisation.'; }
  }
  // ==== [FIN ANCRE] ====
  G.f.orgWins=win?((G.f.orgWins||0)+1):Math.max(0,(G.f.orgWins||0)-1);
  const finish=!isDecisionLike(res.method);
  // titre
  if(win && kind==='title'){
    G.f.champion=(G.f.org>=5?'monde':G.f.org===4?'europe':G.f.org===3?'national':G.f.org===2?'regional':'local'); G.f.titles++; G.roster.forEach(o=>o.champion=null);
    milestone=`<span class="gold" style="display:inline-flex;align-items:center;gap:4px">${SVG.medal} CEINTURE ${orgDisplayName(G.f).toUpperCase()}</span>`;
    recordTitleChange(G.f.org,G.f.divName,G.f.name,opp.name);
  }
  else if(win && kind==='defense'){ G.f.defenses++; milestone='Titre défendu ('+G.f.defenses+')'; recordTitleDefense(G.f.org,G.f.divName,G.f.name); }
  else if(kind==='defense' && res.winner==='D'){ milestone='Titre conservé (match nul)'; }
  else if(!win && res.winner!=='D' && G.f.champion){ G.f.champion=null; G.f.defenses=0; milestone='Titre perdu'; }
  // compétence débloquée ?
  const skill=rollSkill(G.f);
  // ==== [ANCRE: SAISON_TRACKING] — enregistrement du combat pour le bilan annuel ====
  if(!G.season) G.season={year:1,fights:[]};
  G.season.fights.push({ win, method:res.method, round:res.round, scoreA:res.scoreA, scoreB:res.scoreB,
    st:{Me:res.stats.A, Op:res.stats.B}, myRank:myRankBefore, oppRank:oppRankBefore,
    isTitle:(kind==='title'||kind==='defense') });
  // ==== [FIN ANCRE] ====
  // vieillissement (1 an ~ 2-4 combats) — rythme RÉEL inchangé (RI(2,4), pas un cycle fixe)
  let endOfSeason=false;
  G.f._fy=(G.f._fy||0)+1; if(G.f._fy>=RI(2,4)){ applyAging(G.f); G.f._fy=0; endOfSeason=true;
    // ==== [ANCRE: SANTE_GFL] — Ultimate Rim : suivi médical premium. Le menton
    // (dommage neurologique) ne remonte JAMAIS, même ici — règle absolue. La
    // résistance générale (conditionnement physique, pas neuronal) reste un
    // vrai privilège de cette ligue, distinct du bonus classement d'Apex. ====
    if(G.f.org===6){ G.f.attrs.durability=clamp(G.f.attrs.durability+2,1,100); G.f.overall=overall(G.f); }
    // ==== [FIN ANCRE] ====
  }
  let retAge=42; if(G.f.skills.includes('meta01')) retAge+=2;
  if(!forced && (G.f.age>=retAge || (G.f.age>=38 && G.f.overall<48))){ G.f.retired=true; forced=true; }
  // ==== [ANCRE: CIRCUIT_AMATEUR] — remplace la promotion automatique org 0->1
  // par une offre de contrat pro (spectacle > ratio propre). Au-delà (org>=1),
  // la logique de promotion existante (canPromote) est inchangée, sauf à org 4
  // (Continentale) où elle bascule vers le dilemme Pacific Championship/Ultimate Rim.
  // Au-delà (org 5 ou 6), canPromote n'est plus jamais appelée : ligue terminale.
  let proOffer=null, topTierOffer=false, promoOffer=false;
  if(G.f.org===0){
    if((G.f.proOfferCooldown||0)>0) G.f.proOfferCooldown--;
    const warThisFight=(res.stats.A.sig+res.stats.B.sig>60) || (res.stats.A.kd+res.stats.B.kd>=2);
    if(oppRankBefore<=15 && (!win || isDecisionLike(res.method) || warThisFight)){
      G.f.amateurRivals=G.f.amateurRivals||[];
      if(!G.f.amateurRivals.find(r=>r.id===opp.id)) G.f.amateurRivals.push(opp);
    }
    // ==== [ANCRE: AMA_TOURNAMENT_RESOLVE] — bracket top-8 (quarts/demies/finale),
    // remplace l'ancien système "one-shot contre le rang #1". Les 3 autres matchs
    // de chaque tour sont simulés en coulisses via le vrai moteur (simulateFight),
    // pas un tirage arbitraire — les PNJ progressent selon un vrai résultat. ====
    if(G.tournament && G.tournament.active){
      const t=G.tournament;
      if(win){
        const survivors=[];
        t.matches.forEach(m=>{
          if(m.a.id===G.f.id || m.b.id===G.f.id){ survivors.push(G.f); }
          else {
            const npcRes=simulateFight(m.a,m.b,3);
            applyResult(m.a,m.b,npcRes,'A'); applyResult(m.b,m.a,npcRes,'B');
            survivors.push(npcRes.winner==='A'?m.a:m.b);
          }
        });
        if(t.step==='Quarts de finale'){
          t.step='Demi-finale';
          t.matches=[{a:survivors[0],b:survivors[3]},{a:survivors[1],b:survivors[2]}];
          milestone='Victoire en Quart ! Qualifié pour la Demi-finale.';
        } else if(t.step==='Demi-finale'){
          t.step='Finale';
          t.matches=[{a:survivors[0],b:survivors[1]}];
          milestone='Victoire en Demi ! Qualifié pour la Finale.';
        } else if(t.step==='Finale'){
          t.active=false; G.tournament=null;
          G.f.amaTitles=G.f.amaTitles||[]; G.f.amaTitles.push(t.cfg.id);
          G.f.amaAttempted=G.f.amaAttempted||[]; G.f.amaAttempted.push(t.cfg.id);
          G.f.rankBoost=(G.f.rankBoost||0)+100;
          milestone=`<span class="gold" style="display:inline-flex;align-items:center;gap:4px">${SVG.medal} Ceinture ${t.cfg.label} remportée !</span>`;
          recordTitleChange(0, t.cfg.name, G.f.name, opp.name);
          proOffer=evaluateProOffer(G.f,res,oppRankBefore);
        }
      } else {
        milestone=`Éliminé en ${t.step} du ${t.cfg.label}.`;
        G.f.amaAttempted=G.f.amaAttempted||[]; G.f.amaAttempted.push(t.cfg.id);
        t.active=false; G.tournament=null;
      }
    } else {
      const newCfg=checkAmaChampionship(G.f);
      if(newCfg && !G.tournament){ G.tournament=generateTournament(G.f,newCfg); milestone=milestone||`${newCfg.label} : qualifié dans le Top 8 pour le tournoi !`; }
    }
    // ==== [FIN ANCRE] ====
    if(win || G.f.age>=26){ proOffer=proOffer||evaluateProOffer(G.f,res,oppRankBefore); }
  } else if(G.f.org<5){
    if(!G.f.champion && canPromote(G.f) && (!G.f.promoCooldown || G.f.promoCooldown<=0)){
      if(G.f.org===4){ topTierOffer=true; }
      else { promoOffer=true; }
    }
    // Free Agency : un champion avec au moins 2 défenses attire les ligues supérieures
    else if(G.f.champion && G.f.defenses>=2 && (!G.f.promoCooldown || G.f.promoCooldown<=0)){
      if(G.f.org===4){ topTierOffer=true; }
      else { promoOffer=true; } // réutilise l'écran de promo, adapté pour signaler le transfert
    }
  } else if(G.f.org>=5 && (G.f.streak||0)<=-3){
    // ==== [ANCRE: RETROGRADATION_INTERNATIONAL] — les ligues internationales
    // (Pacific/Ultimate Rim) ne proposent JAMAIS de promotion (rien au-dessus),
    // mais sanctionnent une série de défaites par une vraie rétrogradation.
    G.f.org=4; G.f.orgWins=0; G.f.champion=null; G.f.defenses=0; G.f.rivalId=null; G.f.orgElo=eloBaseline(4,G.f.overall); G.f.rankBoost=0;
    if(ORG_FLAVORS[G.f.org]) G.f.orgFlavor=pick(ORG_FLAVORS[G.f.org]);
    G.roster=makeOrgRoster(G.f);
    milestone=milestone||'Rétrogradé : la ligue internationale coupe ton contrat après cette série de défaites.';
    // ==== [FIN ANCRE] ====
  }
  if(G.f.promoCooldown>0) G.f.promoCooldown--;
  // ==== [FIN ANCRE] ====
  // ==== [ANCRE: LOT1_CHAMPCHAMP_RESTORE] — si ce combat avait lieu dans
  // l'autre catégorie (Champ-Champ), on restaure la division d'origine et son
  // roster juste après, et on vérifie l'inactivité dans la division négligée.
  if(G.f._champChampHomeDiv){
    const foughtDiv=G.f.div;
    G.f.div=G.f._champChampHomeDiv; G.roster=G.f._champChampHomeRoster||G.roster;
    delete G.f._champChampHomeDiv; delete G.f._champChampHomeRoster;
    if(typeof resolveChampChampDefense==='function'){ const destMsg=resolveChampChampDefense(foughtDiv,win); if(destMsg) milestone=destMsg; }
  } else if(typeof resolveChampChampDefense==='function' && G.f.champChampTarget){
    const destMsg=resolveChampChampDefense(G.f.div,win); if(destMsg) milestone=destMsg;
  }
  // ==== [FIN ANCRE] ====
  const newAch=checkAch();
  if(typeof checkScenarioState==='function'){
    checkScenarioState(res);
    if(G.lastMsg && G.lastMsg.includes('Scénario')){ milestone=G.lastMsg; G.lastMsg=null; }
    if(G.f.retired) forced=true;
  }
  G.pending={res,win,method:res.method,finish,milestone,skill,newAch,forced,planLabel:G.fight.planLabel,endOfSeason,proOffer,topTierOffer,promoOffer,contractExpiry,narrative,purseDetail:G.fight.purseDetail,
    opp:{name:opp.name,flag:opp.flag}, camp:G.campApplied};
}
function turnPro(){ const f=G.f; f.amaRec={W:f.W,L:f.L}; f.stage='pro';
  f.W=f.L=f.D=f.ko=f.sub=f.dec=f.koLoss=f.streak=0; f.orgWins=0; f.easyFights=0; f.history=[]; f.champion=null; f.titles=0; f.defenses=0; f._fy=0;
  f.nick=earnNickname(f); }
function earnNickname(f){ const a=f.attrs;
  const striker=['le Sniper','le Marteau','la Foudre','le Bourreau','Mains de Pierre','le Cogneur','la Guillotine debout'];
  const grappler=['l\u2019Anaconda','le Python','le Boa','l\u2019Étau','le Sorcier du sol','le Suffocateur'];
  const pressure=['le Bulldozer','le Rouleau','Cœur de Lion','la Machine','l\u2019Ouragan'];
  const tech=['le Chirurgien','le Professeur','le Métronome','l\u2019Horloger','l\u2019Architecte'];
  const amaKO=f.amaRec, koRate=(f.amaRec&&(f.W))?0:0;
  // choisi selon les points forts
  if(a.submission>=a.power && a.submission>=a.jab) return pick(grappler);
  if(a.power>=70 || a.killer>=70) return pick(striker);
  if(a.fightIQ>=70 || a.adaptability>=70) return pick(tech);
  if(a.heart>=70 || a.cardio>=70) return pick(pressure);
  return pick(striker.concat(tech));
}

/* ------------------------------ succès ------------------------------------ */
/* ==== [ANCRE: SVG_ICONS] — width/height en 1em (pas 24 fixe) : hérite du
   font-size du conteneur. Sans ça, la légende de fin de carrière (font-size:60px)
   afficherait une icône minuscule 24px au lieu de remplir l'espace comme le
   faisait l'emoji. Les .ico des listes de succès (font-size:19px en CSS)
   héritent aussi correctement de cette façon. ==== */
const ACH=[
 {id:'debut',cat:'Carrière & Titres',ico:SVG.glove,h:'Baptême',d:'Gagner ton 1er combat',t:f=>f.W>=1||f.amaRec},
 {id:'pro',cat:'Carrière & Titres',ico:SVG.pro,h:'Passage pro',d:'Devenir professionnel',t:f=>f.stage==='pro'},
 {id:'euro',cat:'Carrière & Titres',ico:SVG.medal,h:'Roi d\u2019Europe',d:'Ceinture européenne',t:f=>f.titles>=1&&f._euro},
 {id:'world',cat:'Carrière & Titres',ico:SVG.crown,h:'Champion du monde',d:'Ceinture mondiale',t:f=>f._world},
 {id:'defend5',cat:'Carrière & Titres',ico:SVG.crown,h:'Dynastie',d:'5 défenses de titre',t:f=>f.defenses>=5},
 {id:'undef',cat:'Carrière & Titres',ico:SVG.diamond,h:'L\u2019Invaincu',d:'Champion sans défaite pro',t:f=>f._world&&f.L===0},
 {id:'ko1',cat:'Finitions & Séries',ico:SVG.ko,h:'Bonne nuit',d:'Gagner par KO',t:f=>f.ko>=1},
 {id:'sub1',cat:'Finitions & Séries',ico:SVG.sub,h:'Le piège',d:'Gagner par soumission',t:f=>f.sub>=1},
 {id:'streak8',cat:'Finitions & Séries',ico:SVG.fire,h:'Intouchable',d:'8 victoires d\u2019affilée',t:f=>f.streak>=8},
 {id:'koking',cat:'Finitions & Séries',ico:SVG.skull,h:'Machine à KO',d:'12 victoires par KO',t:f=>f.ko>=12},
 {id:'subking',cat:'Finitions & Séries',ico:SVG.web,h:'Le finisseur du sol',d:'12 soumissions',t:f=>f.sub>=12},
 {id:'skill3',cat:'Technique & Héritage',ico:SVG.skill,h:'Arsenal secret',d:'Débloquer 3 compétences',t:f=>f.skills.length>=3},
 {id:'skill8',cat:'Technique & Héritage',ico:SVG.dna,h:'Prodige technique',d:'Débloquer 8 compétences',t:f=>f.skills.length>=8},
 {id:'legend',cat:'Technique & Héritage',ico:SVG.goat,h:'Légende vivante',d:'Mondial + 5 défenses',t:f=>f._world&&f.defenses>=5},
 {id:'vet',cat:'Technique & Héritage',ico:SVG.veteran,h:'Vétéran',d:'30 combats pro',t:f=>f.stage==='pro'&&(f.W+f.L+f.D)>=30},
 {id:'amachamp',cat:'Carrière & Titres',ico:SVG.medal,h:'Champion amateur',d:'Remporter un tournoi amateur (WMA/DMMA)',t:f=>!!(f.amaTitles&&f.amaTitles.length>=1)},
 {id:'amachamp2',cat:'Carrière & Titres',ico:SVG.crown,h:'Double couronne amateur',d:'Remporter 2 tournois amateurs différents',t:f=>!!(f.amaTitles&&f.amaTitles.length>=2)},
 {id:'pacific',cat:'Carrière & Titres',ico:SVG.diamond,h:'Gloire internationale',d:'Signer avec Pacific Championship',t:f=>f.org===5},
 {id:'ultimaterim',cat:'Carrière & Titres',ico:SVG.diamond,h:'Contrat en argent',d:'Signer avec Ultimate Rim',t:f=>f.org===6},
 {id:'rivalry',cat:'Finitions & Séries',ico:SVG.skull,h:'Rivalité légendaire',d:'4 confrontations contre le même rival',t:f=>!!(f.biggestRival&&f.biggestRival.count>=4)},
 {id:'skill9',cat:'Technique & Héritage',ico:SVG.dna,h:'Encyclopédie vivante',d:'Débloquer 9 compétences',t:f=>f.skills.length>=9},
 // ==== [ANCRE: LOT8_VENGEANCE] ====
 {id:'vengeance_ultime',cat:'Finitions & Séries',ico:SVG.skull,h:'Vengeance Ultime',d:'Finir par KO ou Soumission un rival qui vous a battu lors de votre première rencontre.',
   t:f=>{ if(!f.history) return false; const rivalIds=Object.keys(f._rivalries||{});
     for(const rId of rivalIds){ const encounters=f.history.filter(h=>h.oppId==rId);
       if(encounters.length>=2){ const first=encounters[0], last=encounters[encounters.length-1];
         if(first.res==='loss' && last.res==='win' && (last.method.startsWith('KO')||last.method.startsWith('Soum'))) return true; } }
     return false; }},
 // ==== [FIN ANCRE] ====
 // ==== [ANCRE: FAITH_ACHIEVEMENTS] — Lot 3 du mode MMA Faith ====
 {id:'f_phenix',cat:'Carrière & Titres',ico:SVG.fire,h:'Phénix',d:'Remonter d\u2019une série de 3 défaites pour devenir champion.',
   t:f=>f.champion && f.history && f.history.length>5 && f.history.slice(-4).filter(x=>x.res==='loss').length>=3},
 {id:'f_murdutemps',cat:'Carrière & Titres',ico:SVG.skull,h:'Le Mur du Temps',d:'Rester invaincu professionnellement jusqu\u2019à l\u2019âge de 35 ans.',
   t:f=>f.L===0 && f.age>=35 && f.stage==='pro'},
 {id:'f_doublemonarque',cat:'Carrière & Titres',ico:SVG.crown,h:'Double Monarque',d:'Défendre deux ceintures de catégories différentes deux fois chacune.',
   t:f=>f.champChampDefenses && Object.keys(f.champChampDefenses).length>=2 && Object.values(f.champChampDefenses).every(v=>v>=2)},
 {id:'f_cyborg',cat:'Technique & Héritage',ico:SVG.veteran,h:'Cyborg',d:'Subir moins de 50 dégâts crâniens sur une série de 10 combats.',
   t:f=>G.season && G.season.fights && G.season.fights.length>=10 && G.season.fights.slice(-10).reduce((acc,fight)=>acc+((fight.st&&fight.st.Me&&fight.st.Me.dmgHead)||0),0)<50},
 {id:'f_ruine',cat:'Carrière & Titres',ico:SVG.hammer,h:'Hémorragie Financière',d:'Se retrouver ruiné (gains négatifs) après un événement ou investissement payant.',
   t:f=>(f.earnings||0)<0},
 {id:'f_bourreau',cat:'Technique & Héritage',ico:SVG.diamond,h:'Bourreau des Légendes',d:'Battre 3 adversaires distincts ayant un Elo supérieur à 1800.',
   t:f=>f.history && [...new Set(f.history.filter(h=>h.res==='win' && h.oppElo>1800).map(h=>h.oppId))].length>=3},
 {id:'f_plafondverre',cat:'Finitions & Séries',ico:SVG.star,h:'Plafond de Verre Percé',d:'Gagner par KO alors que votre puissance brute est inférieure à 40.',
   t:f=>f.attrs && f.attrs.power<40 && f.history && f.history.length>0 && f.history[f.history.length-1].method.startsWith('KO') && f.history[f.history.length-1].res==='win'}
 // ==== [FIN ANCRE] ====
];
/* ==== [FIN ANCRE] ==== */
function checkAch(){ G.ach=G.ach||[]; if(G.f.champion==='monde')G.f._world=true; if(G.f.champion==='europe')G.f._euro=true;
  const got=[]; for(const a of ACH){ if(!G.ach.includes(a.id)&&a.t(G.f)){ G.ach.push(a.id); got.push(a); } } return got; }

/* ============================== ÉCRANS ==================================== */
function last5(f){ const h=f.history.slice(-5); if(!h.length)return '<span class="muted small">Pas encore de combat</span>';
  return '<div class="l5">'+h.map(x=>{ const ko=x.method&&x.method.startsWith('KO'),sub=x.method&&x.method.startsWith('Soum');
    const letter=x.res==='win'?'V':(x.res==='draw'?'N':'D'); const cls=x.res==='win'?'w':(x.res==='draw'?'d':'l');
    return `<span class="p ${cls}" title="${x.method||''}">${letter}<i>${ko?'KO':sub?'SUB':'DÉC'}</i></span>`; }).join('')+'</div>'; }
function formatCtrl(v){ const totalSec=Math.round((v||0)*100); const m=Math.floor(totalSec/60), s=totalSec%60; return `${m}:${s<10?'0':''}${s}`; }
function formatArgent(kMontant){ const total=Math.round((kMontant||0)*1000);
  if(total>=1000000) return (total/1000000).toLocaleString('fr-FR',{minimumFractionDigits:0,maximumFractionDigits:1})+' M $';
  return total.toLocaleString('fr-FR')+' $';
}
function recordStr(f){ return `${f.W}<span class="muted">-</span><span class="loss">${f.L}</span>${f.D?('<span class="muted">-</span>'+f.D):''}`; }
function orgTag(f){ return `<span class="tag">${ORGS[f.org]}</span>`; }
function gauge(v){ return `<span class="gauge"><span style="width:${clamp(v,0,100)}%"></span></span>`; }

/* ==== [ANCRE: ECRAN_TITRE] — sas d'entrée séparant Carrière et Arcade.
   Adapté aux vrais gestionnaires existants : CL.go('intro') pour la carrière
   (reprendre/créer/panthéon), CL.startArcade() pour le Gauntlet — pas
   d'initCareer()/initArcade() qui n'existent pas. ==== */
function scr_title(){
  return `<div class="scr" style="display:flex;flex-direction:column;justify-content:center;min-height:80vh">
   <div style="text-align:center;margin-bottom:48px">
     <h1 class="disp" style="font-size:64px;line-height:.9;margin:0;letter-spacing:-.05em;color:var(--text)">CAGE<br>LEGACY</h1>
     <div class="mono muted" style="margin-top:16px;font-size:14px;letter-spacing:.2em;border-top:2px solid var(--line);border-bottom:2px solid var(--line);padding:8px 0">SIMULATEUR DE MANAGEMENT & ARCHIVES</div>
   </div>
   <button class="btn primary" style="font-size:20px;padding:24px" onclick="CL.startFaith()">1. MMA FAITH
     <span class="mono" style="display:block;font-size:12px;margin-top:8px;opacity:.8">Carrière longue — Gestion de vie (Destiny-like)</span></button>
   ${hasSave('faith')?`<button class="btn gold" style="font-size:16px;padding:14px;margin-top:8px" onclick="CL.cont()">REPRENDRE LA PARTIE MMA FAITH EN COURS</button>`:''}
   <button class="btn" style="font-size:20px;padding:24px;margin-top:16px;border-color:var(--text)" onclick="CL.go('intro')">2. CARRIÈRE COMPLÈTE
     <span class="mono muted" style="display:block;font-size:12px;margin-top:8px">Gérez l\u2019argent, les camps et l\u2019héritage</span></button>
   <button class="btn" style="font-size:20px;padding:24px;margin-top:16px;border-color:var(--sage);color:var(--sage)" onclick="CL.go('gauntlet_menu')">3. GAUNTLET
     <span class="mono muted" style="display:block;font-size:12px;margin-top:8px">Tournois et défis d\u2019ascension arcade</span></button>
   <div class="hr" style="margin:24px 0"></div>
   <button class="btn ghost" style="font-size:16px;padding:16px;border:1px dashed var(--gold);background:var(--panel2);color:var(--gold)" onclick="CL.go('legends')">BOUTIQUE : SALLE DES LÉGENDES
     <span class="mono muted" style="display:block;font-size:11px;margin-top:6px">Dépensez vos points de salle pour débloquer du contenu</span></button>
   </div>`;
}
/* ==== [ANCRE: SOUS_MENU_GAUNTLET] — regroupe les 3 formats du Gauntlet
   (Bracket 64, Classement des 100, Boss Run), auparavant tous au même niveau
   que les modes principaux sur l'écran titre. ==== */
function scr_gauntlet_menu(){
  return `<div class="scr center intro">
   <div class="eyebrow sage">Mode Arcade</div>
   <h2 class="disp big">GAUNTLET</h2>
   <p class="lede">Sélectionnez le format de l\u2019épreuve.</p>
   <button class="btn primary" style="font-size:18px;padding:16px" onclick="CL.startArcade()">BRACKET 64 (CLASSIQUE)
     <span class="mono" style="display:block;font-size:11px;margin-top:6px">Tournoi à élimination directe</span></button>
   <button class="btn" style="font-size:18px;padding:16px;margin-top:12px;border-color:var(--sage);color:var(--sage)" onclick="CL.startLadder100()">CLASSEMENT MONDIAL DES 100
     <span class="mono muted" style="display:block;font-size:11px;margin-top:6px">Grimpez du rang #100 jusqu\u2019au sommet</span></button>
   ${checkLegendUnlock('mode_boss')?`<button class="btn ghost" style="font-size:16px;padding:16px;margin-top:12px;border-color:var(--gold);color:var(--gold)" onclick="CL.startBossRun()">BOSS RUN
     <span class="mono muted" style="display:block;font-size:11px;margin-top:6px">5 champions d\u2019affilée, KO uniquement</span></button>`:''}
   <button class="btn ghost mt" onclick="CL.go('title')">Retour au menu</button>
  </div>`;
}
/* ==== [FIN ANCRE] ==== */
function scr_intro(){ const c=hasSave('career');
  return `<div class="scr center intro">
   <div class="eyebrow">Simulateur de gestion MMA</div>
   <h1 class="disp big">CAGE<br>LEGACY</h1>
   <p class="lede">Capital physique limité. Chaque camp d\u2019entraînement laisse des traces.</p>
   ${c?`<button class="btn gold" onclick="CL.cont()">Reprendre le dossier</button>`:''}
   <button class="btn primary" onclick="CL.go('create')">${c?'Nouveau prospect':'Jouer une future légende'}</button>
   <button class="btn ghost" onclick="CL.go('hof')">🏛️ Archives</button>
   <button class="btn ghost" onclick="CL.go('title')">← Retour au menu</button></div>`; }

function scr_create(){ const d=G.draft, divs=DIVISIONS[d.gender];
  const pills=(arr,key,fn)=>arr.map(x=>`<span class="pill ${d[key]===fn(x).v?'on':''}" onclick="CL.draft('${key}','${fn(x).v}')">${fn(x).t}</span>`).join('');
  return `<div class="scr"><div class="eyebrow">Création</div><h2 class="disp">Ton combattant</h2>
   <div class="fld"><label>Genre</label><div class="pills">${pills(['H','F'],'gender',g=>({v:g,t:g==='H'?'Homme':'Femme'}))}</div></div>
   <div class="fld"><label>Prénom</label><input id="fn" maxlength="18" value="${esc(d.first||'')}" placeholder="Prénom" oninput="CL.draftIn('first',this.value)"></div>
   <div class="fld"><label>Pays</label><div class="pills">${COUNTRY_KEYS.map(c=>`<span class="pill ${d.country===c?'on':''}" onclick="CL.draft('country','${c}')">${COUNTRIES[c].flag} ${COUNTRIES[c].name}</span>`).join('')}</div></div>
   <div class="fld"><label>Division</label><div class="pills">${divs.map(x=>`<span class="pill ${d.div===x.id?'on':''}" onclick="CL.draft('div','${x.id}')">${x.name}</span>`).join('')}</div></div>
   <div class="fld"><label>Discipline de base <span class="muted">(toutes équilibrées)</span></label><div class="pills">${STYLE_KEYS.map(s=>`<span class="pill ${d.style===s?'on':''}" onclick="CL.draft('style','${s}')">${styleLabel(s)}</span>`).join('')}</div></div>
   <div class="note small">Ton <b>origine</b>, ta <b>motivation</b> et ton <b>surnom</b> (au passage pro) se révéleront en jeu.</div>
   <div class="fld"><label>Mode <span class="muted">(optionnel)</span></label><div class="pills">
     <span class="pill ${d.ironMan?'on':''}" onclick="CL.draft('ironMan',${!d.ironMan})">Iron Man — une défaite ou blessure grave = fin définitive</span>
   </div></div>
   <div class="fld"><label>Défis prédéfinis <span class="muted">(Scénarios)</span></label>
     <button class="btn ghost" style="border:1px solid var(--line);margin:0;padding:12px" onclick="CL.go('scenarios')">Parcourir les scénarios</button>
   </div>
   <button class="btn primary" onclick="CL.create()">Débuter la carrière</button>
   <button class="btn ghost" onclick="CL.go('intro')">Retour</button></div>`; }

function scr_hub(){ const f=G.f; const champ=f.champion;
  const isGoodMsg=G.lastMsg && G.lastMsg.includes('sponsor validé');
  const msgColor=isGoodMsg?'var(--win)':'var(--loss)';
  const msgHtml=G.lastMsg?`<div class="card mb" style="border-left:3px solid ${msgColor};background:var(--panel2)"><div class="small" style="color:${msgColor}">${esc(G.lastMsg)}</div></div>`:'';
  if(G.lastMsg) G.lastMsg=null;
  const injuryHtml=f.injury?`<div class="card gold-b glass" style="border-color:var(--loss);margin-bottom:16px">
     <span class="eyebrow mb" style="color:var(--loss)">⚠ RAPPORT MÉDICAL CRITIQUE</span>
     <div class="disp" style="font-size:18px">${esc(f.injury.name)}</div>
     <div class="mono small mt">Convalescence requise : ${f.injury.left} cycle(s)</div>
     <button class="btn mt" style="width:100%;border-color:var(--loss);color:var(--loss)" onclick="CL.recoverInjury()">Laisser le corps récupérer</button>
   </div>`:'';
  const declineHtml=(!f.injury && isDeclining(f))?`<div class="mono small" style="color:var(--loss);margin-top:6px;border-top:1px dashed var(--loss);padding-top:6px">⚠ Tu prends de l\u2019âge, le corps commence à souffrir.</div>`:'';
  const neuroHtml=(f.chinDegradationLevel>0)?`<div class="mono small" style="color:var(--loss);margin-top:6px;border-top:1px dashed var(--loss);padding-top:6px">⚠ Séquelles neurologiques : plafond d\u2019encaissement définitivement réduit (Stade ${f.chinDegradationLevel}).</div>`:'';
  const metabolicHtml=(f.age>=28 && f.div!=='H-heavy' && f.div!=='F-feather')?`<div class="mono small" style="color:var(--gold);margin-top:6px;border-top:1px dashed var(--gold);padding-top:6px">⚠ Piège métabolique : ton corps s\u2019alourdit. Maintenir ce poids de forme devient difficile.</div>`:'';
  const fightBtnHtml=f.injury
    ?`<button class="btn ghost" style="font-size:20px;padding:18px;opacity:.5;cursor:not-allowed" disabled>Athlète inapte</button>`
    :`<button class="btn primary" style="font-size:20px;padding:18px" onclick="CL.fightSelect()">Évaluer les contrats (Matchmaking)</button>`;
  const rankTag=champ?`<span class="tag2 hot">CHAMP. ${orgDisplayName(f).toUpperCase()}</span>`:((f.W+f.L+(f.D||0))===0?`<span class="tag2">NON CLASSÉ</span>`:`<span class="tag2 hot">RANG #${divRank(f)}</span>`);
  const streakTag=f.streak>=3?`<span class="tag2" style="color:var(--win);border-color:var(--win)">Série de ${f.streak} victoires</span>`:(f.streak<=-2?`<span class="tag2" style="color:var(--loss);border-color:var(--blood-d)">${Math.abs(f.streak)} défaites d\u2019affilée</span>`:'');
  const amaTag=(f.stage==='pro'&&f.amaRec)?`<span class="tag2">Amateur : ${f.amaRec.W}-${f.amaRec.L}</span>`:'';
  const contractTag=(f.org>0 && f.contract)?`<span class="tag2" style="border-color:var(--gold);color:var(--gold)">Contrat : ${f.contract.fightsLeft} combat(s)</span>`:'';
  return `<div class="scr">
   <div class="bar" style="border-bottom:1px solid var(--line);padding-bottom:8px;margin-bottom:14px">
     <span class="eyebrow mono">${orgDisplayName(f).toUpperCase()} // ${f.divName.toUpperCase()}</span>
     <span class="eyebrow mono gold">${formatArgent(f.earnings)}</span>
   </div>
   ${msgHtml}
   ${injuryHtml}
   ${G.currentEra?`<div class="card glass mb" style="border-left:3px solid var(--gold);background:var(--panel2);padding:12px">
     <div class="eyebrow gold mb">CONTEXTE MONDIAL : ${esc(G.currentEra.name).toUpperCase()}</div>
     <div class="muted small">L\u2019évolution du sport impose ses règles sur la division. Prépare-toi à affronter des spécialistes.</div>
   </div>`:''}
   <div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--line);padding:16px;margin-bottom:20px">
     <div class="hero-name">${esc(f.name)} ${f.flag}<em>${f.nick?`« ${f.nick} » — `:''}${f.styleLabel}, ${f.age} ans</em></div>
     <div class="tagrow">${rankTag}${streakTag}${contractTag}${amaTag}</div>
     ${declineHtml}
     ${neuroHtml}
     ${metabolicHtml}
     <div class="stat-band">
       <div><span class="stat-big">${recordStr(f)}</span><span class="stat-lbl">Record actuel</span></div>
       <div style="text-align:right">${f.ko===f.sub?`<span class="stat-lbl" style="display:block;margin-bottom:2px">FINITIONS</span><span class="mono" style="font-size:20px"><span class="gold">${f.ko}</span> KO / <span class="gold">${f.sub}</span> SUB</span>`:f.ko>f.sub?`<span class="stat-big hot">${f.ko}</span><span class="stat-lbl">KO / ${f.sub} SUB</span>`:`<span class="stat-big hot">${f.sub}</span><span class="stat-lbl">SUB / ${f.ko} KO</span>`}</div>
     </div>
   </div>
   <div style="margin-bottom:20px">
     <div class="eyebrow" style="margin-bottom:8px">Derniers combats</div>
     ${last5(f)}
   </div>
   <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:28px">
     <div><span class="stat-lbl" style="margin-bottom:4px">MORAL</span><div class="gauge2" style="background:var(--line);height:4px"><span style="display:block;height:100%;width:${clamp(f.morale,0,100)}%;background:var(--win)"></span></div></div>
     <div><span class="stat-lbl" style="margin-bottom:4px">FORME</span><div class="gauge2" style="background:var(--line);height:4px"><span style="display:block;height:100%;width:${clamp(f.form,0,100)}%;background:var(--sage)"></span></div></div>
   </div>
   ${fightBtnHtml}
   <div class="g2"><button class="btn" onclick="CL.go('profile')">Bilan technique complet</button><button class="btn" onclick="CL.go('rankings')">Classements</button></div>
   <div class="g2"><button class="btn ghost" onclick="CL.go('ach')">Palmarès</button><button class="btn ghost" onclick="CL.go('history')">Archives</button></div>
   <button class="btn ghost" onclick="CL.go('beltLineage')">🌍 Registre des ceintures</button>
   ${(()=>{ if(!champ) return '';
     const divs=DIVISIONS[f.gender]||DIVISIONS.H; const idx=divs.findIndex(d=>d.id===f.div);
     if(f.champChampTarget){
       const targetName=(divs.find(d=>d.id===f.champChampTarget)||{}).name||f.champChampTarget;
       return `<div class="card mt" style="border-left:3px solid var(--gold);background:var(--panel2);padding:12px">
         <div class="eyebrow mb" style="color:var(--gold)">Objectif Champ-Champ</div>
         <div class="small">Vise la ceinture ${targetName}. Défends les deux titres régulièrement sous peine de destitution.</div>
         <button class="btn ghost mt" style="border-color:var(--gold);color:var(--gold)" onclick="CL.champChampFight()">Chercher un combat dans l\u2019autre catégorie</button>
       </div>`;
     }
     if(idx>=0 && idx+1<divs.length && (f.defenses||0)>=1){
       return `<button class="btn ghost mt" style="border-color:var(--gold);color:var(--gold)" onclick="CL.tryChampChamp('${divs[idx+1].id}')">Viser la ceinture ${divs[idx+1].name} (Champ-Champ)</button>`;
     }
     return '';
   })()}
   ${(G.divisionNews&&G.divisionNews.length)?`<div class="card mt" style="background:var(--panel2);padding:12px">
     <div class="eyebrow mb">Actualités de la division</div>
     ${G.divisionNews.slice(0,3).map(n=>`<div class="mono small muted" style="margin-top:4px">S${n.year} — ${n.text}</div>`).join('')}
   </div>`:''}
   <button class="btn ghost" style="color:var(--loss);margin-top:16px;border-top:1px dashed var(--line);padding-top:16px" onclick="CL.go('retire')">Déclarer la retraite (Définitif)</button>
   </div>`; }

function scr_select(){ const f=G.f;
  let h=`<div class="scr">
   <div class="bar" style="border-bottom:2px solid var(--line);margin-bottom:24px;padding-bottom:8px">
     <span class="eyebrow mono">BUREAU DU MATCHMAKER // ${orgDisplayName(f).toUpperCase()}</span>
   </div>
   <p class="lede" style="margin-bottom:32px;font-size:15px">Analysez les profils et signez le contrat. L\u2019ordre des propositions dicte le niveau de risque et la récompense au classement.</p>`;
  const rkMe=divRank(f);
  G.opps.forEach((e,i)=>{ const o=e.o;
    const isRival=(f.rivalId===o.id); const isAmaRival=(!isRival && o.isAmateurRival);
    const rnk=divRank(o); const fightsTot=o.W+o.L+(o.D||0);
    const rTag=o.champion?'CHAMPION':(fightsTot===0?'NON CLASSÉ':(rnk===1?'CHALLENGER #1':`RANG #${rnk}`));

    // Archétype de matchmaking : la logique de fond ne change pas (mêmes 3
    // adversaires que genOpponents() proposait déjà), seul l'habillage devient
    // un vrai dilemme risque/récompense lisible d'un coup d'œil.
    let mmRole='Opposition Logique', mmReward='Niveau équivalent, progression saine au classement.', roleColor='var(--text)';
    const isProspect=(o.age<=23 && fightsTot<=6 && o.W>o.L);
    const isVeteran=(o.age>=34 && o.L>=3);
    const isGatekeeper=(o.attrs.durability>75 || o.attrs.tdd>75) && o.L>o.W/2;
    if(e.context==='CHAMP-CHAMP'){ mmRole='Défi Historique'; mmReward='Devenir double monarque. La consécration ultime.'; roleColor='var(--gold)'; }
    else if(e.context && e.context.includes('TOURNOI')){ mmRole='Combat de Bracket'; mmReward='Avancer dans le tournoi amateur.'; roleColor='var(--sage)'; }
    else if(o.champion || e.context==='COMBAT DE TITRE'){ mmRole='Le Champion en Titre'; mmReward='Risque immense. Récompense absolue : la Ceinture.'; roleColor='var(--gold)'; }
    else if(f.champion){ mmRole='Challenger Légitime'; mmReward='Défense de titre. Confirme votre statut de roi de la division.'; roleColor='var(--sage)'; }
    else if(isRival){ mmRole='Rivalité Historique'; mmReward='L\u2019ego et la hype sont en jeu. Bonus de bourse garanti.'; roleColor='var(--blood)'; }
    else if(fightsTot===0){ mmRole='Le Débutant'; mmReward='Faible risque. Peu de crédit en cas de victoire, idéal pour se relancer.'; roleColor='var(--muted)'; }
    else if(rnk<rkMe-4){ mmRole='Le Raccourci (Risqué)'; mmReward='Gros écart de niveau en votre faveur. Bond massif au classement assuré si vous créez la surprise.'; roleColor='var(--gold)'; }
    else if(isProspect){ mmRole='Le Prodige Régional'; mmReward='Voler la hype du petit jeune. Très risqué pour votre crédibilité si battu.'; roleColor='#4DA6FF'; }
    else if(isGatekeeper){ mmRole='Le Gardien du Temple'; mmReward='Combat bourbier garanti. Passage obligatoire pour le haut du classement.'; roleColor='var(--sage)'; }
    else if(isVeteran){ mmRole='Le Vétéran'; mmReward='Nom connu, mais sur le déclin. Bon test pour rassurer votre camp.'; roleColor='var(--text)'; }
    else if(rnk>rkMe+5){ mmRole='Le Combat Piège'; mmReward='Classement inférieur au vôtre. Tout à perdre, rien à gagner.'; roleColor='var(--loss)'; }

    const striking=Math.round((o.attrs.jab+o.attrs.cross+o.attrs.hook+o.attrs.kick)/4);
    const grappling=Math.round((o.attrs.takedown+o.attrs.submission+o.attrs.topControl)/3);
    const danger=o.attrs.power;
    const myStr=Math.round((f.attrs.jab+f.attrs.cross+f.attrs.hook+f.attrs.kick)/4);
    const myGrap=Math.round((f.attrs.takedown+f.attrs.submission+f.attrs.topControl)/3);
    const myDan=f.attrs.power;
    const diffText=(opp,me)=>{ const diff=me-opp; if(diff>=12)return'Ton avantage net';if(diff>=5)return'Léger avantage';if(diff>-5&&diff<5)return'Équilibré';if(diff<=-12)return'Son avantage net';return'Léger désavantage'; };
    const getDiffColor=(txt)=>txt.startsWith('Son')||txt==='Léger désavantage'?'var(--loss)':(txt.startsWith('Ton')||txt==='Léger avantage')?'var(--gold)':'var(--text)';
    h+=`<div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--line);padding:16px;margin-bottom:20px">
      <div style="border-left:3px solid ${roleColor};padding-left:12px;margin-bottom:16px">
         <div class="disp" style="font-size:18px;color:${roleColor};line-height:1">${mmRole.toUpperCase()}</div>
         <div class="mono small muted" style="margin-top:4px">${mmReward}</div>
      </div>
      <div class="meta-strip"><div><span>Record</span><b style="white-space:nowrap">${recordStr(o)}</b></div>${o.amaRec?`<div><span>Amateur</span><b style="white-space:nowrap">${o.amaRec.W}-${o.amaRec.L}</b></div>`:''}<div><span>Mensurations</span><b style="white-space:nowrap">${o.phys.height}cm / ${o.phys.reach}cm</b></div></div>
      <div class="hero-name" style="${isRival?'color:var(--blood)':''}">${esc(o.name)} ${o.flag}<em>${o.styleLabel}, ${o.age} ans</em></div>
      <div class="tagrow">
        ${e.context?`<span class="tag2 hot" style="background:var(--gold);color:var(--bg);border-color:var(--gold)">${e.context}</span>`:''}
        ${isRival?'<span class="tag2" style="color:var(--bg);background:var(--blood);border-color:var(--blood)">RIVALITÉ ACTIVE</span>':''}
        ${isAmaRival?'<span class="tag2" style="color:var(--sage);border-color:var(--sage)">RIVAL AMATEUR</span>':''}
        <span class="tag2 hot">${rTag}</span>
      </div>
      <div class="stat-band" style="display:grid;grid-template-columns:1fr 1fr 1fr;text-align:left;border-top:1px dashed var(--line)">
        <div><span class="stat-lbl">STRIKING</span><b class="mono" style="font-size:13px;color:${getDiffColor(diffText(striking,myStr))}">${diffText(striking,myStr)}</b></div>
        <div><span class="stat-lbl">GRAPPLING</span><b class="mono" style="font-size:13px;color:${getDiffColor(diffText(grappling,myGrap))}">${diffText(grappling,myGrap)}</b></div>
        <div><span class="stat-lbl">DANGER (KO)</span><b class="mono" style="font-size:13px;color:${getDiffColor(diffText(danger,myDan))}">${diffText(danger,myDan)}</b></div>
      </div>
      <p class="event-text mono" style="font-size:11.5px;opacity:.85;margin:14px 0 0;position:relative;z-index:2;border-left:2px solid var(--gold);padding-left:10px">ANALYSE : ${e.read}</p>
      <button class="btn ${isRival?'primary':''}" style="margin-top:14px;font-size:15px;letter-spacing:.05em;position:relative;z-index:2" onclick="CL.opp(${i})">${isRival?'RÉGLER SES COMPTES':'ACCEPTER LE COMBAT'}</button>
    </div>`;
  });
  h+=`<button class="btn ghost mt" style="border:none" onclick="CL.go('hub')">← Retour au vestiaire</button></div>`;
  return h;
}

function scr_camp(){ const f=G.f;
  const deltaHtml=d=>d.map(([k,v])=>{ const lbl=k==='morale'?'Moral':k==='form'?'Forme':attrLabel(k);
     const vague=(k==='morale'||k==='form')?(v>0?`+${lbl}`:`-${lbl}`):(v>0?`Potentiel : ${lbl} ↑`:`Potentiel : ${lbl} ↓`);
     return `<span class="dlt ${v>=0?'up':'dn'}">${vague}</span>`; }).join('');
  const curTier=G.selectedCampTier||'gratuit';
  const activeTier=CAMP_TIERS.find(t=>t.id===curTier)||CAMP_TIERS[0];
  let tierDesc='';
  if(activeTier.id==='gratuit') tierDesc='Aucun coût financier. <span style="color:var(--loss)">Risque de blessure de 5%</span> (-15% Forme, -10% Moral).';
  else if(activeTier.id==='premium') tierDesc='Coût : 15k$. <span style="color:var(--win)">Zéro risque de blessure. Bonus garanti : +5% Forme, +5% Moral.</span>';
  else if(activeTier.id==='sparring') tierDesc='Coût : 35k$. <span style="color:var(--win)">Zéro risque. Bonus : +5% Forme.</span> L\u2019adversaire subira un malus tactique (-3 Adapt., -2 QI).';
  const tierTags=CAMP_TIERS.map(t=>{
    const canAfford=(f.earnings||0)>=t.cost;
    const style=`cursor:${canAfford?'pointer':'not-allowed'};opacity:${canAfford?1:0.35}`;
    const click=canAfford?` onclick="CL.setCampTier('${t.id}')"`:'';
    return `<span class="tag2 ${curTier===t.id?'hot':''}" style="${style}"${click}>${t.name}${t.cost?` (${t.cost}k$)`:''}</span>`;
  }).join('');
  return `<div class="scr"><div class="bar"><span class="eyebrow">Camp d\u2019entraînement</span><span class="eyebrow x" onclick="CL.go('select')">✕</span></div>
   <p class="lede small">Un seul axe avant ce combat. Chaque choix <b>monte et baisse</b> des attributs (bornés par ton potentiel).</p>
   <div class="tagrow mb">${tierTags}</div>
   <div class="card glass mb" style="background:var(--panel2);padding:12px;border-left:3px solid var(--gold)"><div class="mono small">${tierDesc}</div></div>
   ${G.train.map((t,i)=>`<div class="opp" onclick="CL.train(${i})"><div class="opp-top"><span class="opp-nm">${t.label}</span></div>
      <div class="opp-mid">${t.hint}</div><div class="dlts">${deltaHtml(t.d)}</div></div>`).join('')}
   </div>`; }

/* ==== [ANCRE: PLAN_COMBAT] — vestiaire, choix tactique juste avant le combat ==== */
function scr_plan(){ const f=G.f, opp=G.fight.opp; const plans=TACTICS[f.style]||[];
  const cr=G.fight.cutResult||{tier:'normal',effPct:0,kg:0,walk:(divById(G.f.div)?divById(G.f.div).kg:70),limit:(divById(G.f.div)?divById(G.f.div).kg:70)};
  const step=G.fight.planStep||1;
  const wcHtml={
    sans_effort:`<div class="card mt" style="border-left:3px solid var(--sage);padding-left:14px"><div class="eyebrow mb" style="color:var(--sage)">Pesée sans effort</div>
      <div class="mono small" style="margin-top:6px">Poids actuel : <b>${cr.walk.toFixed(1)}kg</b> <span class="muted">(limite ${cr.limit}kg)</span></div>
      <div class="small muted" style="margin-top:8px">Un moine bouddhiste au régime.</div>
      <div class="small" style="color:var(--sage);font-weight:bold;margin-top:4px">Bonus ce soir : cardio et solidité.</div></div>`,
    facile:`<div class="card mt" style="border-left:3px solid var(--sage);padding-left:14px"><div class="eyebrow mb" style="color:var(--sage)">Cutting facile</div>
      <div class="mono small" style="margin-top:6px">Poids actuel : <b>${cr.walk.toFixed(1)}kg</b> <span class="muted">(limite ${cr.limit}kg)</span></div>
      <div class="mono small" style="margin-top:2px">À perdre : <b>${cr.kg}kg</b> <span class="muted">(${cr.effPct.toFixed(1)}%)</span></div>
      <div class="small muted" style="margin-top:8px">Deux jours de sauna et un sandwich en moins, rien de dramatique.</div>
      <div class="small muted" style="margin-top:4px">Aucun impact ce soir.</div></div>`,
    normal:`<div class="card mt" style="border-left:3px solid var(--gold);padding-left:14px"><div class="eyebrow gold mb">Cutting normal</div>
      <div class="mono small" style="margin-top:6px">Poids actuel : <b>${cr.walk.toFixed(1)}kg</b> <span class="muted">(limite ${cr.limit}kg)</span></div>
      <div class="mono small" style="margin-top:2px">À perdre : <b>${cr.kg}kg</b> <span class="muted">(${cr.effPct.toFixed(1)}%)</span></div>
      <div class="small muted" style="margin-top:8px">Le sauna, le sac poubelle, la routine du métier.</div>
      <div class="small muted" style="margin-top:4px">Dans la norme du métier, aucun impact.</div></div>`,
    complique:`<div class="card mt glass" style="border-left:3px solid var(--loss);background:var(--panel2);padding-left:14px"><div class="eyebrow mb" style="color:var(--loss)">Cutting compliqué</div>
      <div class="mono small" style="margin-top:6px;position:relative;z-index:2">Poids actuel : <b>${cr.walk.toFixed(1)}kg</b> <span class="muted">(limite ${cr.limit}kg)</span></div>
      <div class="mono small" style="margin-top:2px;position:relative;z-index:2">À perdre : <b>${cr.kg}kg</b> <span class="muted">(${cr.effPct.toFixed(1)}%)</span></div>
      <div class="small muted" style="margin-top:8px;position:relative;z-index:2">Tu vas cracher dans un gobelet pendant six heures et dormir dans un sac poubelle. Pitoyable, mais professionnel.</div>
      <div class="small" style="color:var(--loss);font-weight:bold;margin-top:4px;position:relative;z-index:2">Malus ce soir : cardio, force, solidité et menton (déshydratation).</div></div>`,
  }[cr.tier]||'';
  let h=`<div class="scr"><div class="bar"><span class="eyebrow">Vestiaire · Plan de combat</span></div>
   ${renderFightPoster(f,opp,G.fight.kind)}`;
  if(step===1){
    h+=wcHtml;
    if(G.pressConf) h+=`<div class="card mt glass" style="border-left:3px solid var(--blood);padding-left:14px;background:var(--panel2)">
     <div class="eyebrow mb" style="color:var(--blood)">${G.pressConf.title}</div>
     <div class="small">${G.pressConf.text}</div></div>`;
    if(G.activeSponsor) h+=`<div class="card mt" style="border-left:3px solid var(--gold);padding-left:14px;background:var(--panel2)">
     <div class="eyebrow mb" style="color:var(--gold)">Objectif sponsor</div>
     <div class="mono small">${G.activeSponsor.text}</div></div>`;
    if(G.lastMsg){
      h+=`<div class="card mt glass" style="border-left:3px solid var(--text);padding-left:14px;background:var(--panel2)">
       <div class="eyebrow mb" style="color:var(--text)">Bilan du face-à-face</div>
       <div class="small">${esc(G.lastMsg)}</div></div>`;
      G.lastMsg=null;
    }
    h+=`<button class="btn primary mt" style="padding:16px;font-size:18px" onclick="G.fight.planStep=2; render();">SUIVANT</button>`;
  } else {
    h+=`<div class="card" style="border-color:transparent;padding:0 0 16px 0">
     <div class="muted small" style="border-left:2px solid var(--gold);padding-left:10px"><b>Analyse :</b> ${tacticalRead(f,opp)}</div>
   </div>
   <p class="lede small mt">Quelle est ta consigne tactique pour ce combat ? Cela modifiera radicalement ton comportement dans la cage.</p>
   ${getExclusiveTactics(f).concat(plans).map((p,i)=>`<div class="opp" onclick="CL.choosePlan(${i})">
     <div class="opp-top"><span class="opp-nm gold">${p.lbl}</span></div>
     <div class="opp-read" style="margin-top:4px;opacity:1">${p.desc}</div></div>`).join('')}`;
  }
  h+=`</div>`;
  return h;
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: NARRATION] — log texte à partir de res.log/res.stats, déjà calculés ==== */
function fightLog(res){ if(!res.log||!res.log.length)return '<span class="muted small">Décision aux cartes.</span>';
  const rows=res.log.map(L=>`<div class="log-row ${L.finish?'gold':''}"><span class="log-r">R${L.r}</span><span style="flex:1">${L.text||(L.phase==='sol'?'échanges au sol':'échanges debout')}</span></div>`);
  if(isDecisionLike(res.method)) rows.push(`<div class="log-row gold"><span class="log-r">R${res.round||3}</span><span style="flex:1">${res.method}${res.detail?' — '+res.detail:''}</span></div>`);
  return `<div class="fight-log" style="max-height:220px;overflow-y:auto;padding-right:5px">${rows.join('')}</div>`; }
/* ==== [FIN ANCRE] ==== */
function scr_hof(){
  const fullList=loadHOF();
  const filt=G.hofFilter||{};
  const list=(typeof filterHallOfFame==='function')?filterHallOfFame(filt):fullList;
  const styles=Object.values(STYLES).map(s=>s.label);
  const divisions=[...new Set(DIVISIONS.F.concat(DIVISIONS.H).map(d=>d.name))];
  const modes=[...new Set(fullList.map(f=>f.gameMode||'career'))];
  const modeLabels={career:'Carrière Complète',faith:'MMA Faith'};
  const showFilters=!!G.showHofFilters;
  return `<div class="scr"><div class="bar"><span class="eyebrow">Panthéon · ${list.length}/${fullList.length} légende(s)</span><span class="eyebrow x" onclick="CL.go('intro')">✕</span></div>
   <h2 class="disp">Tes anciens combattants</h2>
   <button class="btn ghost mb" style="border:1px solid var(--line);width:auto;padding:8px 16px" onclick="CL.toggleHofFilters()">Filtres ${showFilters?'−':'+'}</button>
   ${showFilters?`<div style="background:var(--panel2);padding:12px;border:1px solid var(--line);margin-bottom:16px">
   ${modes.length>1?`<div class="eyebrow mb">Mode</div><div class="tagrow mb"><span class="tag2 ${!filt.gameMode?'hot':''}" style="cursor:pointer" onclick="CL.filterHof('gameMode','')">Tous</span>${modes.map(m=>`<span class="tag2 ${filt.gameMode===m?'hot':''}" style="cursor:pointer" onclick="CL.filterHof('gameMode','${m}')">${modeLabels[m]||m}</span>`).join('')}</div>`:''}
   ${styles.length>1?`<div class="eyebrow mb mt">Styles</div><div class="tagrow mb"><span class="tag2 ${!filt.style?'hot':''}" style="cursor:pointer" onclick="CL.filterHof('style','')">Tous</span>${styles.map(s=>`<span class="tag2 ${filt.style===s?'hot':''}" style="cursor:pointer" onclick="CL.filterHof('style','${esc(s)}')">${esc(s)}</span>`).join('')}</div>`:''}
   ${divisions.length>1?`<div class="eyebrow mb mt">Divisions</div><div class="tagrow mb"><span class="tag2 ${!filt.divName?'hot':''}" style="cursor:pointer" onclick="CL.filterHof('divName','')">Toutes</span>${divisions.map(d=>`<span class="tag2 ${filt.divName===d?'hot':''}" style="cursor:pointer" onclick="CL.filterHof('divName','${esc(d)}')">${esc(d)}</span>`).join('')}</div>`:''}
   <div class="eyebrow mb mt">Défenses</div><div class="tagrow mb"><span class="tag2 ${!filt.minDefenses?'hot':''}" style="cursor:pointer" onclick="CL.filterHof('minDefenses',0)">Toutes</span><span class="tag2 ${filt.minDefenses>=2?'hot':''}" style="cursor:pointer" onclick="CL.filterHof('minDefenses',2)">2+ défenses</span></div>
   </div>`:''}
   ${G.exportedCode?`<div class="card glass mb" style="background:var(--panel2);padding:12px;border-left:3px solid var(--gold)">
     <div class="eyebrow mb" style="color:var(--gold)">Lien de ${esc(G.exportedName||'')} — envoie-le à ton ami</div>
     ${G.exportedLink?`<input readonly value="${esc(G.exportedLink)}" style="width:100%;background:var(--bg);color:var(--text);border:1px solid var(--line);padding:8px;font-family:'JetBrains Mono';font-size:11px" onclick="this.select()">
     <button class="btn primary mt" style="width:auto;padding:6px 14px" onclick="CL.copyExportedLink()">Copier le lien</button>`:''}
     <details class="mt"><summary class="muted small" style="cursor:pointer">Le lien ne marche pas ? Utiliser le code à la place</summary>
       <textarea readonly style="width:100%;min-height:70px;background:var(--bg);color:var(--text);border:1px solid var(--line);padding:8px;font-family:'JetBrains Mono';font-size:11px;resize:none;margin-top:8px" onclick="this.select()">${G.exportedCode}</textarea>
     </details>
     <button class="btn ghost mt" style="width:auto;padding:6px 12px" onclick="CL.clearExportedCode()">Fermer</button>
   </div>`:''}
   ${list.length?list.map((f,i)=>`<div class="glass card mb" style="background:var(--panel2);padding:16px">
      <div class="hero-name" style="font-size:20px">${i+1}. ${esc(f.name)} ${f.flag}<em>${f.nick?`« ${f.nick} » — `:''}${f.style} · ${f.div} · retraite ${f.age} ans</em></div>
      <div class="stat-band" style="border-top:none;padding-top:8px;margin-top:8px">
        <div><span class="stat-big" style="font-size:24px">${f.W}<span class="muted">-</span><span class="loss">${f.L}</span></span><span class="stat-lbl">${f.rank}</span></div>
        ${f.amaRec?`<div style="text-align:right"><span class="stat-big" style="font-size:24px">${f.amaRec.W}<span class="muted">-</span><span class="loss">${f.amaRec.L}</span></span><span class="stat-lbl">Amateur</span></div>`:''}
      </div>
      ${(f.amaTitles&&f.amaTitles.length)?`<div class="tagrow" style="margin-bottom:8px">${f.amaTitles.map(id=>{const cfg=AMA_CHAMPIONSHIPS.find(c=>c.id===id); return cfg?`<span class="tag2 hot">${SVG.medal} ${cfg.label}</span>`:'';}).join('')}</div>`:''}
      ${f.biggestRival?`<div class="mono small" style="color:var(--blood);margin-bottom:8px">⚔ Plus grand rival : ${esc(f.biggestRival.name)} ${f.biggestRival.flag} (${f.biggestRival.count} confrontations)</div>`:''}
      <div class="epis" style="position:relative;z-index:2">${f.epithets.map(e=>`<span class="epi">${e}</span>`).join('')}</div>
      <button class="btn ghost mt" style="width:auto;padding:6px 12px;font-size:12px" onclick="CL.exportLegend('${f.id}')">Exporter (partager avec un ami)</button></div>`).join(''):
      '<p class="lede">Aucune légende encore. Ta première carrière retraitée apparaîtra ici pour toujours.</p>'}
   <div class="tagrow mb">
     <button class="btn ghost" style="width:auto;padding:8px 12px" onclick="CL.go('codex')">Codex des compétences</button>
     <button class="btn ghost" style="width:auto;padding:8px 12px;border-color:var(--gold);color:var(--gold)" onclick="CL.go('legends')">Salle des Légendes</button>
   </div>
   <button class="btn ghost" onclick="CL.go('intro')">Retour</button></div>`; }
function scr_result(){ const p=G.pending,f=G.f,st=p.res.stats;
  let judgesHtml='';
  if(isDecisionLike(p.method) && !p.res.judges && p.res.scoreA!==undefined){
    judgesHtml=`<div class="card gold-b" style="text-align:center"><div class="eyebrow mb">Pointage (total)</div><div class="disp" style="font-size:22px">${p.res.scoreA} – ${p.res.scoreB}</div></div>`;
  } else if(isDecisionLike(p.method) && p.res.judges){
    const J=p.res.judges;
    judgesHtml=`<div class="card gold-b" style="text-align:center">
      <div class="eyebrow mb">Pointage des juges (10-point must)</div>
      <div class="duel2" style="justify-content:center;gap:16px">
        <span class="num ${J.j1[0]>J.j1[1]?'a':'b'}">${J.j1[0]}-${J.j1[1]}</span>
        <span class="num ${J.j2[0]>J.j2[1]?'a':'b'}">${J.j2[0]}-${J.j2[1]}</span>
        <span class="num ${J.j3[0]>J.j3[1]?'a':'b'}">${J.j3[0]}-${J.j3[1]}</span>
      </div>
      <div class="hr"></div>
      <div class="mono small muted" style="text-align:left;font-size:10px">
        <div style="display:flex;justify-content:space-between;color:var(--text);margin-bottom:4px"><span>RND</span><span>J1</span><span>J2</span><span>J3</span><span>SIG</span><span>TD</span><span>KD</span></div>
        ${(p.res.roundStats||[]).map(rs=>`<div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid var(--line)">
          <span style="color:var(--gold)">R${rs.r}</span><span>${rs.j1[0]}-${rs.j1[1]}</span><span>${rs.j2[0]}-${rs.j2[1]}</span><span>${rs.j3[0]}-${rs.j3[1]}</span><span>${rs.sigA}-${rs.sigB}</span><span>${rs.tdA}-${rs.tdB}</span><span>${rs.kdA}-${rs.kdB}</span>
        </div>`).join('')}
      </div></div>`;
  }
  let campHtml='';
  if(p.camp && p.camp.deltas.length){
    const rows=p.camp.deltas.map(d=>{
      if(Array.isArray(d)) return `<span class="dlt ${d[1]>=0?'up':'dn'}">${d[1]>0?'+':''}${d[1]} ${d[0]}</span>`;
      const b20=d20(d.before), a20=d20(d.after);
      if(b20===a20) return '';
      return `<span class="dlt ${a20>=b20?'up':'dn'}">${d.label} : ${b20} ➔ ${a20}</span>`;
    }).filter(Boolean);
    if(rows.length) campHtml=`<div class="card"><div class="eyebrow mb">Évolution (sur 20)</div><div class="dlts">${rows.join('')}</div></div>`;
  }
  return `<div class="scr">
   <div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--line);padding:16px;margin-bottom:20px;text-align:center">
     <div class="meta-strip" style="justify-content:center">${p.opp.flag} vs ${esc(p.opp.name)}</div>
     <div class="hero-name" style="color:${p.isFantasy||p.isVsFriend?(p.res.winner==='D'?'var(--gold)':(p.win?'var(--blood)':'#4DA6FF')):(p.win?'var(--win)':(p.res.winner==='D'?'var(--gold)':'var(--loss)'))}">${(p.isFantasy||p.isVsFriend)?(p.res.winner==='D'?'ÉGALITÉ':`${esc(p.win?f.name:p.opp.name)} gagne par ${p.method}`):(p.win?'VICTOIRE':(p.res.winner==='D'?'ÉGALITÉ':'DÉFAITE'))}<em style="color:var(--muted)">${(p.isFantasy||p.isVsFriend)?'':p.method}${p.res.round?' · Round '+p.res.round:''}</em></div>
     <div class="tagrow" style="justify-content:center">
       ${(p.res.moveName && !isDecisionLike(p.method))?(()=>{
         const typeStr=p.method.startsWith('KO')?'KO/TKO':'Soumission';
         const zoneRedundant=p.res.zone && p.res.moveName.toLowerCase().includes(p.res.zone.toLowerCase());
         const zoneDetail=(p.res.zone && !zoneRedundant)?` — ${p.res.zone}`:'';
         return `<span class="tag2 hot">${typeStr} (${esc(p.res.moveName)})${zoneDetail}</span>`;
       })():''}
       ${p.planLabel?`<span class="tag2">Tactique : ${p.planLabel}</span>`:''}
     </div>
     ${p.res.moveFlavor?`<div class="muted small mt" style="font-style:italic">${esc(p.res.moveFlavor)}</div>`:''}
   </div>
   ${judgesHtml}
   ${p.milestone?`<div class="card gold-b"><div class="disp" style="font-size:19px">${p.milestone}</div></div>`:''}
   ${p.skill?`<div class="card"><div class="skill-unlock">✨ Compétence débloquée : <b style="color:${RAR_COLORS[p.skill.rar]||'var(--gold)'}">${p.skill.name}</b><div class="muted small">${p.skill.desc||p.skill.blurb||''}</div>${p.skill.fx?`<div class="mono small mt">${Object.entries(p.skill.fx).map(([k,v])=>{const label=(ALL_ATTR.find(a=>a[0]===k)||[k,k])[1]; const after=d20(f.attrs[k]); const before=d20(f.attrs[k]-v); return `<div style="color:var(--win)">${before} → ${after} ${label}</div>`;}).join('')}</div>`:''}</div></div>`:''}
   <div class="card stats-card"><div class="eyebrow mb">Statistiques du combat</div>
     <div class="st-row"><span>${st.A.sig}</span><span class="st-l">Frappes sig.</span><span>${st.B.sig}</span></div>
     <div class="st-row"><span>${st.A.td}</span><span class="st-l">Amenées</span><span>${st.B.td}</span></div>
     <div class="st-row"><span>${formatCtrl(st.A.ctrl||0)}</span><span class="st-l">Temps de contrôle</span><span>${formatCtrl(st.B.ctrl||0)}</span></div>
     <div class="st-row"><span>${st.A.kd}</span><span class="st-l">Knockdowns</span><span>${st.B.kd}</span></div></div>
   ${p.purseDetail?`<div class="card"><div class="eyebrow mb">Bourse</div>
     <div class="mono small" style="display:flex;justify-content:space-between"><span class="muted">Bourse brute</span><span>${formatArgent(p.purseDetail.gross)}</span></div>
     <div class="mono small" style="display:flex;justify-content:space-between"><span class="muted">Frais de camp (manager, coach, salle)</span><span style="color:var(--loss)">-${formatArgent(p.purseDetail.fee)}</span></div>
     ${p.purseDetail.agentFee?`<div class="mono small" style="display:flex;justify-content:space-between"><span class="muted">Part de l\u2019agent (${Math.round((f.agentCut||0)*100)}%)</span><span style="color:var(--loss)">-${formatArgent(p.purseDetail.agentFee)}</span></div>`:''}
     <div class="mono small" style="display:flex;justify-content:space-between;margin-top:4px"><b>Net perçu</b><b class="gold">${formatArgent(p.purseDetail.net)}</b></div></div>`:''}
   <div class="card"><div class="eyebrow mb">Déroulé</div>${fightLog(p.res)}</div>
   ${campHtml}
   ${p.newAch&&p.newAch.length?`<div class="card">${p.newAch.map(a=>`<div class="ach"><span class="ico">${a.ico}</span><b class="gold">${a.h}</b> <span class="muted small">${a.d}</span></div>`).join('')}</div>`:''}
   ${p.narrative?`<div class="card glass narr" style="background:var(--panel2);padding:16px"><blockquote>« ${p.narrative.txt(f)} »</blockquote><cite>${p.narrative.src}</cite></div>`:''}
   <button class="btn primary" onclick="CL.${p.forced?'toLegacy':'afterResult'}()">${p.forced?'Voir mon palmarès':'Continuer'}</button></div>`; }

function scr_profile(){ const f=G.f; const g=groupAvg(f); const backScreen=G.faith?'faith_hub':'hub';
  const grp=(key,title,avg)=>`<div class="card"><div class="grp-h"><span class="disp" style="font-size:17px">${title}</span><span class="gold mono">${d20(avg)}/20</span></div>
     ${ATTR[key].map(a=>`<div class="attr"><span class="attr-l">${a[1]}</span>${gauge(f.attrs[a[0]])}<span class="attr-v">${d20(f.attrs[a[0]])}</span></div>`).join('')}</div>`;
  return `<div class="scr"><div class="bar"><span class="eyebrow">Fiche complète</span><span class="eyebrow x" onclick="CL.go('${backScreen}')">✕</span></div>
   <div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--line);padding:16px;margin-bottom:20px">
     <div class="meta-strip"><div><span>Division</span><b>${f.divName}</b></div><div><span>Taille</span><b>${f.phys.height}cm</b></div><div><span>Allonge</span><b>${f.phys.reach}cm</b></div></div>
     <div class="hero-name">${esc(f.name)} ${f.flag}<em>${f.nick?`« ${f.nick} » — `:''}${f.styleLabel}, ${f.age} ans</em></div>
     <div class="story" style="position:relative;z-index:2;margin-top:10px"><b>Origine.</b> ${f.origin}.</div>
     <div class="story" style="position:relative;z-index:2"><b>Se bat pour.</b> ${f.motivation}.</div>
     ${(f.faithTraits && f.faithTraits.length)?`<div class="story" style="position:relative;z-index:2;color:var(--blood)"><b>Traits de caractère.</b> ${f.faithTraits.join(', ')}.</div>`:''}
     ${(f.amaTitles&&f.amaTitles.length)?`<div class="tagrow">${f.amaTitles.map(id=>{const cfg=AMA_CHAMPIONSHIPS.find(c=>c.id===id); return cfg?`<span class="tag2 hot">Champion ${cfg.label}</span>`:'';}).join('')}</div>`:''}
     ${f.skills.length?(()=>{
       const rarOrder={C:0,R:1,E:2,L:3,M:4,X:5};
       const sorted=f.skills.filter(id=>SKILLS.some(s=>s.id===id)).slice().sort((a,b)=>{
         const sa=SKILLS.find(s=>s.id===a), sb=SKILLS.find(s=>s.id===b);
         return (rarOrder[sa.rar]??9)-(rarOrder[sb.rar]??9);
       });
       // hash déterministe simple : même tag = même couleur, sans mapping manuel sur 640 compétences
       const tagColor=t=>{ let h=0; for(let i=0;i<t.length;i++) h=(h*31+t.charCodeAt(i))>>>0;
         const palette=['var(--win)','var(--gold)','var(--loss)']; return palette[h%palette.length]; };
       return `<div class="story" style="position:relative;z-index:2;margin-top:10px"><b>Compétences.</b> <span class="muted small">(clique pour le détail)</span></div>`+
         sorted.map((id,i)=>{const sk=SKILLS.find(s=>s.id===id);
           const fxTxt=sk.fx?Object.entries(sk.fx).map(([k,v])=>{const label=(ALL_ATTR.find(a=>a[0]===k)||[k,k])[1]; return `+${Math.max(1,Math.round(v/5))} ${label}`;}).join(', '):'';
           return `<div style="margin:4px 0;position:relative;z-index:2">
             <div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px;cursor:pointer" onclick="const d=document.getElementById('skdet${i}'); d.style.display=d.style.display==='none'?'block':'none';">
               <span class="story" style="margin:0;color:${RAR_COLORS[sk.rar]||'var(--gold)'}">${sk.name}</span>
               ${(sk.tags||[]).map(t=>`<span class="tag" style="color:${tagColor(t)};border-color:${tagColor(t)}">${t}</span>`).join('')}
             </div>
             <div id="skdet${i}" class="muted small" style="display:none;margin:4px 0 0 0;padding-left:8px;border-left:2px solid var(--line)">${sk.desc||''}${fxTxt?`<div class="mono" style="color:var(--win);margin-top:2px">${fxTxt}</div>`:''}</div>
           </div>`;}).join('');
     })():''}
   </div>
   ${grp('tech','Technique',g.tech)}${grp('ment','Mental',g.ment)}${grp('phys','Physique',g.phys)}
   <div class="rarity-guide"><span><i style="background:${RAR_COLORS.C}"></i> Commune</span><span><i style="background:${RAR_COLORS.R}"></i> Rare</span><span><i style="background:${RAR_COLORS.E}"></i> Épique</span><span><i style="background:${RAR_COLORS.L}"></i> Légendaire</span><span><i style="background:${RAR_COLORS.M}"></i> Mythique</span></div>
   <button class="btn ghost" onclick="CL.go('${backScreen}')">Retour</button></div>`; }

function scr_rankings(){ const f=G.f; const dr=rankPool(G.roster.concat([f]));
  let h=`<div class="scr">
   <div class="bar" style="border-bottom:2px solid var(--line);margin-bottom:24px;padding-bottom:8px">
     <span class="eyebrow mono" style="letter-spacing:.1em">BASE DE DONNÉES // ${orgDisplayName(f).toUpperCase()} // ${f.divName.toUpperCase()}</span>
   </div>
   <div style="display:flex;border-bottom:1px solid var(--text);padding-bottom:4px;margin-bottom:8px;font-size:11px;color:var(--muted)" class="mono">
     <div style="width:32px">RANG</div><div style="flex:1">IDENTITÉ</div><div style="width:82px;text-align:right">RECORD</div><div style="width:70px;text-align:right">STATUT</div>
   </div>`;
  dr.slice(0,16).forEach((o,i)=>{ const isPlayer=(o===f); const rank=i+1;
    let arrow='–'; let arrowColor='var(--muted)';
    if(o.lastRankDelta>0){arrow='▲';arrowColor='var(--win)';} if(o.lastRankDelta<0){arrow='▼';arrowColor='var(--loss)';}
    const fightsTot=o.W+o.L+(o.D||0);
    const statusStr=o.champion?'CHAMPION':(fightsTot===0?'NR':arrow);
    const rowBg=isPlayer?'background:var(--text);color:var(--bg)':'';
    h+=`<div style="display:flex;align-items:center;padding:10px 0;border-bottom:1px dotted var(--line);font-size:15px;${rowBg}">
      <div class="mono" style="width:32px;font-size:15px;${o.champion&&!isPlayer?'color:var(--gold)':''}">${o.champion?'C':rank}</div>
      <div style="flex:1;display:flex;flex-direction:column">
        <span class="disp" style="font-size:17px;line-height:1.1">${esc(o.name)} ${o.flag}${isPlayer?' <span class="mono" style="font-size:11px">(TOI)</span>':''}</span>
        <span class="mono" style="font-size:10.5px;opacity:.7">${(o.styleLabel||'').toUpperCase()}</span>
      </div>
      <div class="mono" style="width:82px;text-align:right;font-size:14px;white-space:nowrap">${o.W}-${o.L}${o.D?'-'+o.D:''}</div>
      <div class="mono" style="width:70px;text-align:right;font-size:10.5px;opacity:.7;${!o.champion?('color:'+arrowColor):''}">${statusStr}</div>
    </div>`;
  });
  h+=`<button class="btn ghost mt" style="border:none" onclick="CL.go('${G.faith?'faith_hub':'hub'}')">← Revenir au hub</button></div>`;
  return h;
}

function scr_event(){ const ev=G.activeEvent;
  return `<div class="scr center" style="display:flex;flex-direction:column;justify-content:center;min-height:80vh"><div class="eyebrow blood">Événement imprévu</div>
   <div class="hero-name" style="text-align:center;font-size:clamp(26px,8vw,36px)">${ev.title}</div>
   <div class="glass card" style="background:var(--panel2);text-align:left;padding:16px;margin:16px 0"><p class="lede" style="margin:0;text-align:left;max-width:100%">${ev.text}</p></div>
   <button class="btn primary" onclick="CL.handleEvent('${ev.actionId}')">${ev.btn}</button>
   ${ev.btn2?`<button class="btn ghost mt" onclick="CL.handleEvent('${ev.actionId2}')">${ev.btn2}</button>`:''}</div>`; }

/* ==== [ANCRE: ECRAN_SAISON] — 'eval' renommé en 'seasonEval' : mot réservé en
   mode strict, une déclaration const eval=... provoque une SyntaxError. ==== */
function scr_season(){ const f=G.f; const sData=G.season||{year:1,fights:[]};
  const seasonEval=evaluateSeason(f,sData.fights); const s=seasonEval.stats;
  return `<div class="scr center intro"><div class="eyebrow gold">Bilan Saisonnier</div>
   <div class="hero-name" style="text-align:center">Année ${sData.year}<em style="color:var(--muted)">${s.W} V — ${s.L} D</em></div>
   <div class="glass card gold-b" style="margin:20px 0;background:var(--panel2)">
     <div class="tagrow" style="justify-content:center">
       <span class="tag2">${s.koW} KO</span><span class="tag2">${s.subW} SUB</span><span class="tag2">${s.decW} DÉC</span>
     </div>
     <div class="hr"></div>
     <div class="stat-band" style="justify-content:space-around;text-align:center">
       <div><span class="stat-big" style="font-size:24px">${s.sigMe}</span><span class="stat-lbl">Frappes</span></div>
       <div><span class="stat-big" style="font-size:24px">${s.tdMe}</span><span class="stat-lbl">Takedowns</span></div>
     </div>
   </div>
   <h3 class="disp" style="font-size:18px;color:var(--gold);margin-bottom:10px">Trophées de la Saison</h3>
   ${seasonEval.trophies.length>0?
     `<div class="tagrow" style="justify-content:center">${seasonEval.trophies.map(t=>`<span class="tag2 hot" style="display:inline-flex;align-items:center;gap:4px">${t.ico||SVG.medal} ${t.lbl}</span>`).join('')}</div>`
     : `<p class="muted small">Saison de transition. Aucun trophée majeur remporté cette année.</p>`}
   <button class="btn primary mt" onclick="CL.nextSeason()">Passer à l\u2019année suivante</button></div>`; }
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: SOMMET] — dilemme Pacific Championship (gloire) vs Ultimate Rim (argent+santé) ==== */
function scr_toptier(){
  return `<div class="scr center intro"><div class="eyebrow gold">Le Sommet du Monde</div>
   <div class="hero-name" style="text-align:center;font-size:clamp(26px,8vw,34px)">L\u2019Heure du Choix</div>
   <p class="lede">Vous avez conquis l\u2019Europe. Les deux plus grandes organisations mondiales vous offrent un contrat d\u2019exclusivité. Votre décision est définitive.</p>
   <div class="glass" style="position:relative;background:var(--panel2);border:1px solid var(--blood-d);text-align:left;padding:16px">
     <div class="hero-name" style="font-size:22px;color:var(--blood)">PACIFIC CHAMPIONSHIP<em style="color:var(--muted)">Gloire</em></div>
     <p class="muted small mt" style="position:relative;z-index:2">L\u2019organisation la plus prestigieuse et brutale au monde. Le niveau d\u2019opposition y est effrayant (+4 OVR pour tous les adversaires), mais la gloire y est inégalée (+40% de progression au classement). Les salaires restent standards.</p>
     <button class="btn primary" style="position:relative;z-index:2" onclick="CL.signTopTier(5)">Signer chez Pacific Championship</button>
   </div>
   <div class="glass" style="position:relative;background:var(--panel2);border:1px solid var(--sage);text-align:left;padding:16px;margin-top:15px">
     <div class="hero-name" style="font-size:22px;color:var(--sage)">ULTIMATE RIM<em style="color:var(--muted)">Argent & Santé</em></div>
     <p class="muted small mt" style="position:relative;z-index:2">La ligue des millionnaires. Les salaires sont multipliés par 3. Le niveau y est élite mais régulé, et le suivi médical de pointe entretient votre conditionnement physique au fil des mois — mais aucun médecin ne rend les neurones perdus au combat.</p>
     <button class="btn" style="background:var(--sage);color:#fff;border:none;position:relative;z-index:2" onclick="CL.signTopTier(6)">Signer chez Ultimate Rim</button>
   </div>
   <button class="btn ghost mt" onclick="CL.declineTopTier()">Ne rien signer — rester en Continentale</button>
   </div>`; }
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: LOT2_CONTRAT] — négociation de fin de contrat, remplace la
   promotion purement automatique par un vrai choix de carrière. ==== */
function scr_contract_nego(){
  const f=G.f;
  return `<div class="scr center intro">
    <div class="eyebrow gold">Fin de contrat</div>
    <h2 class="disp">Négociations</h2>
    <p class="lede">Votre contrat avec ${orgDisplayName(f)} est arrivé à son terme. Il est temps de discuter de votre avenir.</p>
    <div class="glass card mb" style="background:var(--panel2);padding:16px;text-align:left;border-left:3px solid var(--gold)">
       <div class="eyebrow mb">Statut actuel</div>
       <div class="mono small">Cachet de base : ${f.contract.show}k$ / ${f.contract.win}k$</div>
       <div class="mono small mt">Représentant : <b style="color:${f.agentCut>0?'var(--win)':'var(--text)'}">${f.agentCut>0?'Agent (booste les négociations)':'Aucun (négociation en solo)'}</b></div>
    </div>
    <button class="btn primary mt" onclick="CL.negoRenew()">Renouveler aux mêmes conditions (sûr)</button>
    <button class="btn mt" style="border-color:var(--gold);color:var(--gold)" onclick="CL.negoRaise()">Exiger une revalorisation (+40% cachet, risqué)</button>
    <button class="btn ghost mt" onclick="CL.negoMarket(false)">Tester le marché (free agency)</button>
  </div>`;
}
function scr_free_agency(){
  const offers=G.freeAgencyOffers||[];
  return `<div class="scr center intro">
    <div class="eyebrow gold">Marché libre (Free Agency)</div>
    <h2 class="disp">Offres de contrat</h2>
    <p class="lede">Voici les contrats disponibles sur la table.</p>
    ${offers.map((o,i)=>`
      <div class="glass card mb" style="background:var(--panel2);border:1px solid var(--gold-d);text-align:left;padding:16px">
        <div class="hero-name" style="font-size:20px">${o.flavor}</div>
        <div class="mono small gold">Ligue de niveau ${o.org} · ${o.contract.show}k$ Show / ${o.contract.win}k$ Win</div>
        <p class="muted small mt">${o.desc}</p>
        <button class="btn primary mt" onclick="CL.acceptFreeAgency(${i})">Signer (4 combats)</button>
      </div>
    `).join('')}
    ${offers.length===0?`<p class="muted">Aucune offre. Fin de carrière forcée.</p><button class="btn primary mt" onclick="CL.toLegacy()">Retraite</button>`:''}
  </div>`;
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: ECRAN_PROMO] — la promotion devient un choix du joueur (au lieu
   d'automatique) : rester chasser la ceinture locale, ou monter tout de suite. ==== */
function scr_promo(){
  const f=G.f; const isChamp=!!f.champion;
  const isAmateurOffer=(f.org===0 && G.pending && G.pending.proOffer);
  if(isAmateurOffer){
    const offer=G.pending.proOffer;
    return `<div class="scr center intro"><div class="eyebrow gold">Offre de Contrat Professionnel</div>
     <div class="hero-name" style="text-align:center;font-size:clamp(26px,8vw,34px)">Quelqu\u2019un veut te signer</div>
     <p class="lede mt">Où tu combats décide qui tu combats. Une salle plus grande est une salle plus dure.</p>
     <div class="glass" style="position:relative;background:var(--panel2);border:1px solid var(--gold-d);text-align:left;padding:16px;margin-top:18px">
       <div class="hero-name" style="font-size:20px">${offer.orgFlavor1}<em style="color:var(--muted)">Contrat standard</em></div>
       <p class="muted small mt">${offer.msg}</p>
       <div class="muted small mt">Si tu acceptes, ton palmarès sera réinitialisé à 0-0 pour ta carrière Pro. Ton record amateur (${f.W}-${f.L}) restera gravé dans ta fiche.</div>
       <button class="btn primary mt" style="position:relative;z-index:2" onclick="CL.acceptPro(${offer.baseTier||1},'${offer.orgFlavor1}')">${offer.phrase1}</button>
     </div>
     ${offer.fastTrack?`<div class="glass" style="position:relative;background:var(--panel2);border:1px solid var(--gold-d);text-align:left;padding:16px;margin-top:15px">
       <div class="hero-name" style="font-size:20px;color:var(--blood)">${offer.orgFlavor3}<em style="color:var(--muted)">Fast-Track (opposition bien plus dure)</em></div>
       <p class="muted small mt">Ton parcours fulgurant te permet de griller les étapes.</p>
       <button class="btn mt" style="background:var(--gold);color:#fff;border-color:var(--gold);font-weight:bold;position:relative;z-index:2" onclick="CL.acceptPro(${offer.fastTier||3},'${offer.orgFlavor3}')">${offer.phrase3}</button>
     </div>`:''}
     ${!offer.forced?`<button class="btn ghost mt" onclick="CL.declinePro()">Faire une saison de plus en amateur</button>`:''}
     </div>`;
  }
  // ==== [ANCRE: MARCHE_OFFRES] — le "tier" des orgas qui te veulent dépend de
  // tes accomplissements (titre, défenses, série) : un palmarès dominant ouvre
  // une offre "fast-track" concurrente en plus de l'offre standard, chacune
  // avec sa propre description et sa propre bourse — pas un simple "signer
  // avec X" unique. ====
  const orgPurseTotal=[0,1.2,4,10,30,60,250];
  const nextOrg=f.org+1;
  const flavorNext=ORG_FLAVORS[nextOrg]?pick(ORG_FLAVORS[nextOrg]):(ORGS[nextOrg]||'Ligue supérieure');
  const offers=[{org:nextOrg,flavor:flavorNext,purseTxt:formatArgent(orgPurseTotal[nextOrg]||0),
    desc:isChamp?`En tant que champion ${f.divName} dominant, ${flavorNext} veut racheter votre contrat. Accepter signifie abandonner votre ceinture actuelle pour monter d\u2019un cran.`
      :`${flavorNext} a suivi tes performances de près. Ils pensent que tu es prêt pour une salle plus grande.`}];
  const dominant=(isChamp||f.titles>=1) && ((f.defenses||0)>=2 || (f.streak||0)>=6);
  if(dominant && nextOrg+1<5){
    const flavorSkip=ORG_FLAVORS[nextOrg+1]?pick(ORG_FLAVORS[nextOrg+1]):(ORGS[nextOrg+1]||'Ligue supérieure');
    offers.push({org:nextOrg+1,flavor:flavorSkip,purseTxt:formatArgent(orgPurseTotal[nextOrg+1]||0),
      desc:`Ta domination a fait le tour du milieu : ${flavorSkip} veut te griller la politesse et t\u2019offre de brûler une étape.`});
  }
  return `<div class="scr center intro"><div class="eyebrow gold">${isChamp?'Free Agency (Transfert)':'Le Marché'}</div>
   <div class="hero-name" style="text-align:center;font-size:clamp(26px,8vw,34px)">Quelqu\u2019un veut te signer</div>
   <p class="lede mt">Où tu combats décide qui tu combats. Une salle plus grande est une salle plus dure.</p>
   ${offers.map(o=>`<div class="glass" style="position:relative;background:var(--panel2);border:1px solid var(--gold-d);text-align:left;padding:16px;margin-top:18px">
     <div class="hero-name" style="font-size:20px">${o.flavor}<em style="color:var(--muted)">Niveau ${o.org} · ${o.purseTxt} par combat</em></div>
     <p class="muted small mt">${o.desc}</p>
     <button class="btn primary mt" style="position:relative;z-index:2" onclick="CL.acceptPromo(${o.org})">${isChamp&&o.org===nextOrg?'Rendre la ceinture et signer avec ':'Signer avec '}${o.flavor}</button>
   </div>`).join('')}
   <button class="btn ghost mt" onclick="CL.declinePromo()">Ne rien signer — rester ici</button>
   </div>`;
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: ECRAN_HISTORIQUE] — corrigé par rapport au brouillon : l'ordre
   de stockage réel est chronologique croissant (push, pas unshift) car
   last5() en dépend déjà (slice(-5) = les plus récents) ; on inverse
   seulement à L'AFFICHAGE ici, sans toucher au stockage. res vaut 'win'/
   'loss' dans le vrai moteur (pas 'W'/'L'/'D') ; converti ici pour l'affichage
   sans changer le format stocké. Les entrées d'avant cette fonctionnalité
   n'ont pas oppName/oppRank/season : repli explicite sur '—'. ==== */
function scr_history(){ const f=G.f; const history=(f.history||[]).slice().reverse();
  const totalFights=f.W+f.L+(f.D||0);
  const winRate=totalFights>0?Math.round((f.W/totalFights)*100):0;
  let h=`<div class="scr">
   <div class="bar" style="border-bottom:2px solid var(--line);margin-bottom:24px;padding-bottom:8px">
     <span class="eyebrow mono">ARCHIVES PERSONNELLES</span>
   </div>
   <div class="glass" style="position:relative;background:var(--panel2);border:1px solid var(--line);padding:16px;margin-bottom:32px">
     <div class="stat-band" style="border-top:none;padding-top:0;margin-top:0">
       <div><span class="stat-big" style="font-size:32px">${formatArgent(f.earnings)}</span><span class="stat-lbl">Gains en carrière</span></div>
       <div style="text-align:right"><span class="stat-big hot" style="font-size:32px">${winRate}%</span><span class="stat-lbl">Efficacité (win rate)</span></div>
     </div>
   </div>
   <h3 class="disp" style="font-size:24px;margin-bottom:16px">REGISTRE DES AFFRONTEMENTS</h3>`;
  if(history.length===0){
    h+=`<div class="mono muted" style="padding:24px 0;border-top:1px dotted var(--line)">Aucune donnée archivée.</div>`;
  } else {
    h+=`<div style="display:flex;border-bottom:1px solid var(--text);padding-bottom:4px;margin-bottom:12px;font-size:11px;color:var(--muted)" class="mono">
      <div style="width:36px">RES</div><div style="flex:1">ADVERSAIRE</div><div style="width:50px;text-align:center">SAIS.</div><div style="width:90px;text-align:right">MÉTHODE</div></div>`;
    history.forEach(fight=>{
      const resLetter=fight.res==='win'?'W':(fight.res==='loss'?'L':'D');
      const resColor=resLetter==='W'?'var(--win)':(resLetter==='L'?'var(--loss)':'var(--gold)');
      const resText=resLetter==='W'?'VICTOIRE':(resLetter==='L'?'DÉFAITE':'NUL');
      const oppName=fight.oppName||'Adversaire inconnu';
      const oppRank=fight.oppRank?(fight.oppRank==='NR'?'NR':'#'+fight.oppRank):'—';
      const season=fight.season||'—';
      const method=(fight.method||'DÉC').split(' ')[0];
      h+=`<div style="display:flex;align-items:center;padding:12px 0;border-bottom:1px solid var(--panel2);font-size:15px">
        <div class="mono" style="width:36px;font-weight:bold;color:${resColor};font-size:16px">${resLetter}</div>
        <div style="flex:1;display:flex;flex-direction:column">
          <span class="disp" style="font-size:17px;line-height:1.1">${esc(oppName)} ${fight.oppFlag||''} <span style="font-size:11px;opacity:.5">(${oppRank})</span></span>
          <span class="mono" style="font-size:10.5px;opacity:.7;color:${resColor}">${resText}</span>
        </div>
        <div class="mono" style="width:50px;text-align:center;font-size:12px;opacity:.7">S${season}</div>
        <div class="mono" style="width:90px;text-align:right;font-size:12px">${method}${fight.round?' (R'+fight.round+')':''}</div>
      </div>
      ${fight.narrative?`<div class="small muted" style="margin:2px 0 10px;font-style:italic;opacity:.85">« ${esc(fight.narrative)} »</div>`:''}`;
    });
  }
  h+=`<button class="btn ghost mt" style="border:none" onclick="CL.go('hub')">← Retourner au bureau</button></div>`;
  return h;
}
/* ==== [ANCRE: LINEAGE_UI] — registre mondial des ceintures (Phase 6) ==== */
function scr_beltLineage(){
  const groups={};
  (G.titleHistory||[]).forEach(r=>{ const key=r.org+'|'+r.divName; (groups[key]=groups[key]||[]).push(r); });
  let h=`<div class="scr">
   <div class="bar" style="border-bottom:2px solid var(--line);margin-bottom:16px;padding-bottom:8px">
     <span class="eyebrow mono">ARCHIVES MONDIALES</span>
     <span class="eyebrow x" onclick="CL.go('hub')" style="cursor:pointer">✕</span>
   </div>
   <h3 class="disp" style="font-size:22px;margin-bottom:8px">Registre des ceintures</h3>
   <p class="lede small">L\u2019historique des règnes, des passations de pouvoir et du nombre de défenses.</p>`;
  const keys=Object.keys(groups);
  if(!keys.length){
    h+=`<div class="card mono muted small" style="text-align:center;padding:24px">Aucun titre n\u2019a encore été disputé.</div>`;
  } else {
    keys.forEach(key=>{ const reigns=groups[key]; const [org,divName]=[Number(key.split('|')[0]),reigns[0].divName];
      h+=`<div class="card glass mb" style="background:var(--panel2);padding:16px">
        <div class="hero-name" style="font-size:18px">${esc(ORGS[org]||'Organisation')}<em style="font-size:13px">${esc(divName)}</em></div>`;
      reigns.forEach((r,idx)=>{ const isCurrent=(idx===0);
        h+=`<div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--line);padding:6px 0;font-size:13px">
          <div><b style="color:${isCurrent?'var(--gold)':'var(--text)'}">${esc(r.champion)}</b>
            <span class="muted small" style="display:block">Défenses : ${r.defenses} · Précédent champion : ${esc(r.dethroned)}</span></div>
          <div class="mono small muted">Saison ${r.year}</div>
        </div>`;
      });
      h+=`</div>`;
    });
  }
  h+=`<button class="btn ghost mt" onclick="CL.go('hub')">← Retour au bureau</button></div>`;
  return h;
}
/* ==== [FIN ANCRE] ==== */
function scr_ach(){ G.ach=G.ach||[];
  let h=`<div class="scr">
   <div class="bar" style="border-bottom:2px solid var(--line);margin-bottom:24px;padding-bottom:8px">
     <span class="eyebrow mono" style="letter-spacing:.1em">PALMARÈS ${G.ach.length}/${ACH.length}</span>
   </div>`;
  const cats=['Carrière & Titres','Finitions & Séries','Technique & Héritage'];
  cats.forEach(c=>{
    h+=`<h3 class="disp" style="font-size:18px;margin:24px 0 12px;color:var(--muted)">${c}</h3>`;
    ACH.filter(a=>a.cat===c).forEach(a=>{ const got=G.ach.includes(a.id);
      h+=`<div class="ach ${got?'':'lk'}"><span class="ico" style="display:flex;align-items:center;color:var(--gold)">${a.ico}</span><span><b class="${got?'gold':''}">${a.h}</b><div class="muted small">${a.d}</div></span></div>`;
    });
  });
  h+=`<button class="btn ghost mt" style="border:none" onclick="CL.go('hub')">← Revenir au hub</button></div>`;
  return h; }

function scr_retire(){ return `<div class="scr center"><div class="eyebrow">Fin de carrière</div><h2 class="disp">Raccrocher les gants ?</h2>
   <p class="lede">Décision définitive. Ton palmarès sera scellé.</p>
   <button class="btn primary" onclick="CL.toLegacy()">Prendre ma retraite</button><button class="btn ghost" onclick="CL.go('hub')">Continuer</button>
   <button class="btn ghost" onclick="CL.exportSave()">Copier ma sauvegarde</button></div>`; }

function legacyTitle(f){ const s=(f._world?300:0)+(f._euro?120:0)+f.defenses*30+f.W*3-f.L*4+f.ko*2+f.sub*2;
  if(s>=380)return[SVG.goat,'LÉGENDE ÉTERNELLE']; if(s>=250)return[SVG.crown,'GRAND CHAMPION'];
  if(s>=140)return[SVG.star,'CHAMPION RESPECTÉ']; if(s>=60)return[SVG.glove,'COMBATTANT ACCOMPLI'];
  if(s>=10)return[SVG.veteran,'VÉTÉRAN DU CIRCUIT']; return[SVG.hammer,'GUERRIER DE L\u2019OMBRE']; }
function scr_legacy(){ const f=G.f; const [ico,rank]=legacyTitle(f); const ep=epithets(f);
  const notableWins=(f.history||[]).filter(h=>h.res==='win'&&h.oppWasChamp&&h.oppName).slice(-6).reverse();
  let nemesisHtml='';
  if(f.gameMode==='faith' && f.faithNemesisId){
    const nemesis=G.roster.find(o=>o.id===f.faithNemesisId);
    if(nemesis){
      const diffW=f.W-nemesis.W;
      nemesisHtml=`<div class="card mt glass" style="border-left:3px solid var(--blood);background:var(--panel2);padding:16px;text-align:left">
        <div class="eyebrow mb" style="color:var(--blood)">L\u2019ultime face-à-face (Némésis)</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div style="flex:1;text-align:center">
            <b style="font-size:18px">${esc(f.name)}</b>
            <div class="mono small muted mt">${f.W}-${f.L} · ${f.titles||0} Titre(s)</div>
          </div>
          <div class="disp gold" style="font-size:24px;padding:0 16px">VS</div>
          <div style="flex:1;text-align:center">
            <b style="font-size:18px">${esc(nemesis.name)}</b>
            <div class="mono small muted mt">${nemesis.W}-${nemesis.L} · ${nemesis.titles||0} Titre(s)</div>
          </div>
        </div>
        <div class="muted small" style="font-style:italic">« ${diffW>=0?`L\u2019histoire retiendra que vous avez surpassé ${esc(nemesis.name)}. Vous avez remporté cette guerre d\u2019usure.`:`Malgré tous vos efforts, le palmarès de ${esc(nemesis.name)} restera une ombre sur votre héritage.`} »</div>
      </div>`;
    }
  }
  return `<div class="scr center"><div class="eyebrow">Palmarès scellé</div>
   <div style="font-size:60px">${ico}</div>
   <div class="hero-name" style="text-align:center;color:var(--gold)">${rank}<em style="color:var(--muted)">${esc(f.name)}${f.nick?' « '+f.nick+' »':''}</em></div>
   <div class="glass card" style="background:var(--panel2);text-align:left;padding:16px"><div class="epis" style="position:relative;z-index:2">${ep.map(e=>`<span class="epi">${e}</span>`).join('')}</div>
     <div class="hr"></div>
     <div class="stat-band" style="border-top:none;padding-top:0;margin-top:0;flex-wrap:wrap;gap:16px">
       <div><span class="stat-big" style="font-size:26px">${recordStr(f)}</span><span class="stat-lbl">Bilan pro</span></div>
       <div>${f.ko===f.sub?`<span class="stat-lbl" style="display:block;margin-bottom:2px">FINITIONS</span><span class="mono" style="font-size:20px"><span class="gold">${f.ko}</span> KO / <span class="gold">${f.sub}</span> SUB</span>`:f.ko>f.sub?`<span class="stat-big hot" style="font-size:26px">${f.ko}</span><span class="stat-lbl">KO / ${f.sub} SUB</span>`:`<span class="stat-big hot" style="font-size:26px">${f.sub}</span><span class="stat-lbl">SUB / ${f.ko} KO</span>`}</div>
       <div><span class="stat-big" style="font-size:26px">${f.defenses}</span><span class="stat-lbl">Défenses</span></div>
       <div><span class="stat-big" style="font-size:26px">${f.skills.length}</span><span class="stat-lbl">Compét.</span></div>
     </div>
     <div class="muted small mt" style="position:relative;z-index:2">${f.motivation}</div>
     ${f.biggestRival?`<div class="mono small mt" style="color:var(--blood);position:relative;z-index:2">⚔ Plus grand rival : ${esc(f.biggestRival.name)} ${f.biggestRival.flag} — ${f.biggestRival.count} confrontations</div>`:''}</div>
   ${nemesisHtml}
   ${notableWins.length?`<div class="card mt"><div class="eyebrow mb">Adversaires notables battus</div>${notableWins.map(h=>`<div class="small muted" style="padding:4px 0">${esc(h.oppName)} ${h.oppFlag||''} <span class="mono" style="opacity:.7">(${h.oppRecord||'?'}) — ${h.method}</span></div>`).join('')}</div>`:''}
   <button class="btn primary" onclick="CL.newCareer()">Nouvelle carrière</button></div>`; }

/* ==== [ANCRE: LOT9_ECRAN_CODEX] ==== */
function formatSkillFx(fx){
  if(!fx) return '';
  return Object.entries(fx).map(([k,v])=>{
    const label=(ALL_ATTR.find(a=>a[0]===k)||[k,k])[1];
    const scaled=Math.round(v/5); // même ratio que d20() : fx est toujours un multiple de 5
    return `${scaled>=0?'+':''}${scaled} ${label}`;
  }).join(', ');
}
function scr_codex(){
  const unlocked=loadCodex(); const total=SKILLS.length;
  if(!G.codexFilter) G.codexFilter={style:'all',rar:'all',status:'all'};
  const filteredSkills=SKILLS.filter(s=>{
    if(G.codexFilter.style!=='all' && s.key!==G.codexFilter.style) return false;
    if(G.codexFilter.rar!=='all' && s.rar!==G.codexFilter.rar) return false;
    const isUnlocked=unlocked.includes(s.id);
    if(G.codexFilter.status==='unlocked' && !isUnlocked) return false;
    if(G.codexFilter.status==='locked' && isUnlocked) return false;
    return true;
  });
  return `<div class="scr"><div class="bar"><span class="eyebrow">Codex · ${unlocked.length} / ${total} découvertes</span><span class="eyebrow x" onclick="CL.go('hof')">✕</span></div>
   <h2 class="disp">Codex des compétences</h2>
   <p class="lede small">La base de données inter-carrières recense toutes les compétences débloquées dans l\u2019histoire de vos parties.</p>
   <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">
     <select style="background:var(--panel2);color:var(--text);border:1px solid var(--line);padding:8px" onchange="CL.filterCodex('style',this.value)">
       <option value="all" ${G.codexFilter.style==='all'?'selected':''}>Tous les styles</option>
       ${STYLE_KEYS.map(k=>`<option value="${k}" ${G.codexFilter.style===k?'selected':''}>${STYLES[k].label}</option>`).join('')}
     </select>
     <select style="background:var(--panel2);color:var(--text);border:1px solid var(--line);padding:8px" onchange="CL.filterCodex('rar',this.value)">
       <option value="all" ${G.codexFilter.rar==='all'?'selected':''}>Toutes raretés</option>
       <option value="C" ${G.codexFilter.rar==='C'?'selected':''}>Commune</option>
       <option value="R" ${G.codexFilter.rar==='R'?'selected':''}>Rare</option>
       <option value="E" ${G.codexFilter.rar==='E'?'selected':''}>Épique</option>
       <option value="L" ${G.codexFilter.rar==='L'?'selected':''}>Légendaire</option>
       <option value="M" ${G.codexFilter.rar==='M'?'selected':''}>Mythique</option>
     </select>
     <select style="background:var(--panel2);color:var(--text);border:1px solid var(--line);padding:8px" onchange="CL.filterCodex('status',this.value)">
       <option value="all" ${G.codexFilter.status==='all'?'selected':''}>Tout afficher</option>
       <option value="unlocked" ${G.codexFilter.status==='unlocked'?'selected':''}>Découvertes</option>
       <option value="locked" ${G.codexFilter.status==='locked'?'selected':''}>Verrouillées</option>
     </select>
   </div>
   ${filteredSkills.map(s=>{
     const isUnlocked=unlocked.includes(s.id);
     const color=isUnlocked?(RAR_COLORS[s.rar]||'var(--gold)'):'var(--line)';
     const name=isUnlocked?s.name:'???';
     const desc=isUnlocked?(s.desc||s.blurb||''):'Compétence verrouillée. Découvrez-la naturellement en carrière.';
     return `<div class="glass card mb" style="border-left:3px solid ${color};opacity:${isUnlocked?1:.55};background:var(--panel2);padding:12px">
       <b style="color:${color};font-size:15px">${name}</b> <em class="muted small">(${s.rar})</em>
       <div class="muted small mt">${desc}</div>
       ${isUnlocked&&s.fx?`<div class="mono small mt" style="color:var(--win)">${formatSkillFx(s.fx)}</div>`:''}</div>`;
   }).join('')}
   ${filteredSkills.length===0?'<div class="muted small">Aucune compétence ne correspond à ces filtres.</div>':''}
   <button class="btn ghost mt" onclick="CL.go('hof')">Retour au Panthéon</button></div>`;
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: LOT14_ECRAN_SALLE_LEGENDES] ==== */
function scr_legends(){
  const meta=loadMetaStats(); const pts=meta.legendPoints||0;
  const categories=[...new Set(LEGEND_UNLOCKABLES.map(i=>i.cat))];
  const owned=LEGEND_UNLOCKABLES.filter(i=>checkLegendUnlock(i.id));
  const remaining=LEGEND_UNLOCKABLES.filter(i=>!checkLegendUnlock(i.id));
  const nextUp=remaining.sort((a,b)=>a.cost-b.cost)[0];
  return `<div class="scr"><div class="bar"><span class="eyebrow">Salle des Légendes</span><span class="eyebrow x" onclick="CL.go('hof')">✕</span></div>
   <h2 class="disp gold">${pts} points de salle</h2>
   <p class="lede small">L\u2019héritage de vos retraités ouvre de nouvelles possibilités pour le compte — aucun avantage de statistiques en combat, jamais.</p>

   <div class="stat-band mb" style="border-top:none;padding-top:10px">
     <div><span class="stat-big" style="font-size:20px">${meta.totalRetirements||0}</span><span class="stat-lbl">Carrières terminées</span></div>
     <div><span class="stat-big" style="font-size:20px">${meta.totalFights||0}</span><span class="stat-lbl">Combats disputés</span></div>
     <div><span class="stat-big" style="font-size:20px">${meta.totalKO||0}</span><span class="stat-lbl">KO toutes carrières</span></div>
   </div>
   <div class="stat-band mb" style="border-top:none;padding-top:0">
     <div><span class="stat-big" style="font-size:20px">${meta.totalSub||0}</span><span class="stat-lbl">Soumissions</span></div>
     <div><span class="stat-big" style="font-size:20px">${meta.totalBelts||0}</span><span class="stat-lbl">Ceintures remportées</span></div>
     <div><span class="stat-big" style="font-size:20px">${formatArgent(meta.totalMoney||0)}</span><span class="stat-lbl">Gains cumulés</span></div>
   </div>
   <div class="mono small muted mb">${owned.length} / ${LEGEND_UNLOCKABLES.length} déblocages acquis</div>

   ${nextUp?`<div class="glass card mb" style="border-left:3px solid var(--gold);background:var(--panel2);padding:12px">
     <div class="eyebrow mb" style="color:var(--gold)">Prochain déblocage abordable</div>
     <b style="font-size:15px">${nextUp.name}</b>
     <div class="mono small muted mt">Encore ${Math.max(0,nextUp.cost-pts)} points nécessaires</div>
     <div class="gauge2" style="background:var(--line);height:4px;border-radius:2px;overflow:hidden;margin-top:8px">
       <span style="display:block;height:100%;width:${clamp(Math.round(pts/nextUp.cost*100),0,100)}%;background:var(--gold)"></span>
     </div>
   </div>`:`<div class="card mb" style="background:var(--panel2);padding:12px"><span class="mono small" style="color:var(--sage)">Tout est débloqué. Le Panthéon n\u2019a plus rien à t\u2019apprendre.</span></div>`}

   ${categories.map(cat=>`
     <div class="eyebrow mb mt" style="border-bottom:1px solid var(--line);padding-bottom:6px">${cat.toUpperCase()}</div>
     ${LEGEND_UNLOCKABLES.filter(i=>i.cat===cat).map(item=>{
       const isOwned=checkLegendUnlock(item.id);
       const canAfford=pts>=item.cost;
       const color=isOwned?'var(--sage)':(canAfford?'var(--gold)':'var(--line)');
       const btnHtml=isOwned?`<span class="mono small" style="color:var(--sage)">✓ Acquis</span>`
         :`<button class="btn ghost" style="border-color:${canAfford?'var(--gold)':'var(--line)'};color:${canAfford?'var(--gold)':'var(--muted)'};padding:6px 10px;width:auto" onclick="CL.purchaseUnlock('${item.id}')" ${canAfford?'':'disabled'}>${item.cost} pts</button>`;
       return `<div class="glass card mb" style="border-left:3px solid ${color};background:var(--panel2);padding:12px">
         <div style="display:flex;justify-content:space-between;align-items:center">
           <b style="font-size:14px">${item.name}</b>${btnHtml}
         </div>
         <div class="muted small mt">${item.desc||''}</div>
       </div>`;
     }).join('')}
   `).join('')}

   ${(()=>{ const unlockedThemes=ARENA_THEMES.filter(t=>t.id==='classic'||checkLegendUnlock('cosmetic_'+t.id));
     if(unlockedThemes.length<=1) return '';
     const curTheme=G.arenaCosmetic||'classic';
     return `<div class="card mt" style="background:var(--panel2);padding:12px">
       <div class="eyebrow mb">Thème visuel de l\u2019octogone actif</div>
       <div class="tagrow">${unlockedThemes.map(t=>`<span class="tag2 ${curTheme===t.id?'hot':''}" style="cursor:pointer" onclick="CL.setArenaTheme('${t.id}')">${t.name}</span>`).join('')}</div>
     </div>`;
   })()}
   <div class="hr" style="margin:20px 0"></div>
   ${checkLegendUnlock('mode_fantasy')?`<button class="btn primary mt" style="font-size:16px;padding:16px" onclick="CL.go('fantasy_setup')">LANCER FANTASY FIGHT</button>`:''}
   ${checkLegendUnlock('mode_allstars')?`<button class="btn mt" style="font-size:16px;padding:16px;border-color:var(--gold);color:var(--gold)" onclick="CL.initAllStars()">LANCER TOURNOI ALL-STARS</button>`:''}
   ${checkLegendUnlock('mode_vs_friend')?`<button class="btn mt" style="font-size:16px;padding:16px;border-color:var(--blood);color:var(--blood)" onclick="CL.go('vs_friend')">DÉFI VS AMI</button>`:''}
   <button class="btn ghost mt" onclick="CL.go('hof')">Consulter le Panthéon</button></div>`;
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: LOT4_ECRAN_MUE] ==== */
function scr_mueChoice(){
  const f=G.f;
  return `<div class="scr center intro"><div class="eyebrow blood">Mue Martiale</div>
   <div class="hero-name" style="text-align:center;font-size:clamp(24px,7vw,32px)">Choisis ton nouveau style</div>
   <p class="lede small">Cette décision est définitive pour la suite de la carrière — un cycle de combat complet sera sacrifié.</p>
   ${STYLE_KEYS.filter(k=>k!==f.style).map(k=>`<div class="opp" onclick="CL.chooseMue('${k}')">
     <div class="opp-top"><span class="opp-nm gold">${STYLES[k].label}</span></div></div>`).join('')}
   <button class="btn ghost mt" onclick="CL.go('hub')">Renoncer pour l\u2019instant</button></div>`;
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: LOT2_ECRAN_SCENARIOS] ==== */
function scr_scenarios(){
  return `<div class="scr"><div class="bar"><span class="eyebrow">Scénarios</span><span class="eyebrow x" onclick="CL.go('title')">✕</span></div>
   <h2 class="disp">Défis courts prédéfinis</h2>
   <p class="lede small">3 à 5 ans de jeu, un point de départ imposé, un objectif clair.</p>
   ${SCENARIOS.map(s=>`<div class="opp" onclick="CL.pickScenario('${s.id}')">
     <div class="opp-top"><span class="opp-nm gold">${s.name}</span></div>
     <div class="opp-read" style="margin-top:4px;opacity:1">${s.desc}</div></div>`).join('')}
   <button class="btn ghost mt" onclick="CL.go('title')">Retour</button></div>`;
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: LOGIQUE_ALLSTARS] ==== */
function getStyleEmoji(styleLabel){
  if(!styleLabel) return '🥋';
  const s=styleLabel.toLowerCase();
  if(s.includes('box')||s.includes('pugil')) return '🥊';
  if(s.includes('lutt')||s.includes('wrest')) return '🤼';
  if(s.includes('jiu')||s.includes('jitsu')||s.includes('bjj')) return '🕷️';
  if(s.includes('muay')||s.includes('thai')) return '🇹🇭';
  if(s.includes('karat')) return '🥋';
  if(s.includes('sambo')) return '🐻';
  if(s.includes('kick')) return '🦵';
  return '⚔️';
}
function getFighterBlurb(f){
  const ko=f.ko||0, sub=f.sub||0;
  if(ko>sub) return `Frappeur redoutable, son pouvoir de KO a terrifié sa génération.`;
  if(sub>ko) return `Maître du sol, une soumission inévitable pour quiconque croise son chemin.`;
  return `Combattant hybride par excellence, aucun domaine ne lui échappe.`;
}
function initAllStarsTournament(){
  const fullList=loadHOF();
  if(fullList.length<8){ G.lastMsg="Il faut au moins 8 légendes au Panthéon pour organiser un Tournoi All-Stars."; return; }
  G.allstarsDraft=[]; G.screen='allstars_setup';
}
function scr_allstars_setup(){
  const fullList=loadHOF();
  G.allstarsDraft=G.allstarsDraft||[];
  return `<div class="scr center intro">
     <div class="eyebrow gold">Tournoi All-Stars</div>
     <h2 class="disp">Sélection des participants</h2>
     <p class="lede small">Choisis 8 légendes de ton Panthéon pour le tournoi. (${G.allstarsDraft.length}/8)</p>
     <div style="display:flex;flex-direction:column;gap:8px;margin-top:16px;margin-bottom:24px;text-align:left">
       ${fullList.map((f,i)=>{
         const isSelected=G.allstarsDraft.includes(i);
         return `<div class="glass opp" style="border-color:${isSelected?'var(--gold)':'var(--line)'};padding:12px" onclick="CL.toggleAllStarsDraft(${i})">
           <div style="display:flex;justify-content:space-between;align-items:center">
             <div><b style="color:${isSelected?'var(--gold)':'var(--text)'}">${getStyleEmoji(f.style)} ${esc(f.name)} ${f.flag||''}</b><br><span class="muted small">${f.style||''} · OVR ${f.overall||'?'}</span></div>
             <div>${isSelected?'☑':''}</div>
           </div>
         </div>`;
       }).join('')}
     </div>
     ${G.allstarsDraft.length===8?`<button class="btn primary mt" style="padding:16px;font-size:18px" onclick="CL.launchAllStars()">LANCER LE TOURNOI</button>`:`<button class="btn mt" disabled style="opacity:0.5;padding:16px;font-size:18px">LANCER LE TOURNOI</button>`}
     <button class="btn ghost mt" onclick="CL.go('legends')">Annuler</button>
  </div>`;
}
function advanceAllStarsTournament(){
  const t=G.allstars; if(!t||!t.active) return;
  const next=t.matches.find(m=>!m.winner);
  if(next){
    neutralizeWeightGap(next.a,next.b);
    const res=simulateFight(next.a,next.b,3);
    const winner=res.winner==='A'?next.a:next.b, loser=res.winner==='A'?next.b:next.a;
    next.winner=winner;
    t.history.unshift(`${winner.name} bat ${loser.name} par ${res.method} (R${res.round||3})`);
    return;
  }
  const survivors=t.matches.map(m=>m.winner);
  if(t.step==='Quarts de finale'){ t.step='Demi-finale'; t.roundNum=2; t.matches=[{a:survivors[0],b:survivors[3]},{a:survivors[1],b:survivors[2]}]; }
  else if(t.step==='Demi-finale'){ t.step='Finale'; t.roundNum=3; t.matches=[{a:survivors[0],b:survivors[1]}]; }
  else if(t.step==='Finale'){ t.step='Terminé'; t.champion=survivors[0]; t.active=false; }
}
/* ==== [FIN ANCRE] ==== */
/* ==== [FIN ANCRE] ==== */
const SCREENS={title:scr_title,intro:scr_intro,create:scr_create,hub:scr_hub,select:scr_select,camp:scr_camp,arena:scr_arena,
  result:scr_result,profile:scr_profile,rankings:scr_rankings,ach:scr_ach,retire:scr_retire,legacy:scr_legacy,hof:scr_hof,event:scr_event,plan:scr_plan,season:scr_season,toptier:scr_toptier,
  draft:scr_draft,arcadehub:scr_arcadehub,gameover:scr_gameover,history:scr_history,beltLineage:scr_beltLineage,promo:scr_promo,codex:scr_codex,legends:scr_legends,mueChoice:scr_mueChoice,scenarios:scr_scenarios,
  fantasy_setup:scr_fantasySetup,allstars:scr_allstars,allstars_setup:scr_allstars_setup,vs_friend:scr_vs_friend,arcade_upgrades:scr_arcade_upgrades,
  faith_draft:scr_faith_draft,faith_hub:scr_faith_hub,faith_event:scr_faith_event,faith_year_end:scr_faith_year_end,
  contract_nego:scr_contract_nego,free_agency:scr_free_agency,
  gauntlet_menu:scr_gauntlet_menu};

/* ============================== RENDER + CL =============================== */
function render(preserveScroll){ const app=document.getElementById('app'); if(!app)return;
  const fn=SCREENS[G&&G.screen]||scr_intro; app.innerHTML=fn(); if(G&&G.screen==='arena') startArena(); if(!preserveScroll && window.scrollTo) window.scrollTo(0,0); }
function routeAfterOrgChange(){
  if(G.faith){ if(typeof CL.prepareFaithYearEnd==='function') CL.prepareFaithYearEnd(); return; }
  G.screen='hub'; save(); render();
}
const CL={
  theme(){ setTheme(G.theme==='light'?'dark':'light'); save(); render(); },
  go(s){ if(!G)G={theme:'dark'}; G.screen=s; render(); },
  filterCodex(key,val){ if(!G.codexFilter) G.codexFilter={style:'all',rar:'all',status:'all'}; G.codexFilter[key]=val; render(); },
  purchaseUnlock(itemId){ const r=purchaseLegendUnlock(itemId); G.lastMsg=r.msg; render(); },
  exportLegend(id){
    const l=loadHOF().find(x=>x.id===id); if(!l) return;
    G.exportedCode=encodeLegendCode(l); G.exportedName=l.name;
    try{ G.exportedLink=location.origin+location.pathname+'?legend='+encodeURIComponent(G.exportedCode); }catch(e){ G.exportedLink=null; }
    render();
  },
  copyExportedLink(){
    if(!G.exportedLink) return;
    try{
      navigator.clipboard.writeText(G.exportedLink);
      G.lastMsg="Lien copié !";
    }catch(e){ /* le champ texte reste sélectionnable en secours */ }
    render();
  },
  clearExportedCode(){ G.exportedCode=null; G.exportedName=null; G.exportedLink=null; render(); },
  purchaseUnlock(itemId){ const r=purchaseLegendUnlock(itemId); G.lastMsg=r.msg; render(); },
  setArenaTheme(themeId){ setArenaCosmeticTheme(themeId); render(); },
  leaveSandbox(){ if(G._backupF){ G.f=G._backupF; G.fight=G._backupFight; delete G._backupF; delete G._backupFight; } G.fantasyActive=false; G.vsFriendActive=false; CL.go('legends'); },
  leaveAllStars(){ G.allstars=null; CL.go('legends'); },
  setFantasy(side,dir){
     const max=loadHOF().length-1;
     if(side===0){ let n=(G.fantasyA||0)+dir; if(n<0)n=max; if(n>max)n=0;
       if(n===(G.fantasyB!==undefined?G.fantasyB:1)){ n+=dir; if(n<0)n=max; if(n>max)n=0; } G.fantasyA=n;
     } else { let n=(G.fantasyB!==undefined?G.fantasyB:1)+dir; if(n<0)n=max; if(n>max)n=0;
       if(n===(G.fantasyA||0)){ n+=dir; if(n<0)n=max; if(n>max)n=0; } G.fantasyB=n; }
     render();
  },
  launchFantasyFight(){
     const list=loadHOF();
     const lA=list[G.fantasyA||0], lB=list[G.fantasyB!==undefined?G.fantasyB:(list.length>1?1:0)];
     const A=reconstructLegend(lA), B=reconstructLegend(lB);
     neutralizeWeightGap(A,B);
     if(!G._backupF){ G._backupF=G.f; G._backupFight=G.fight; }
     G.f=A; G.fight={kind:'fantasy',opp:B,rounds:5,plan:null}; G.fantasyActive=true;
     const res=simulateFight(A,B,5);
     G.pending={res,win:res.winner==='A',method:res.method,finish:!isDecisionLike(res.method),opp:{name:B.name,flag:B.flag},isFantasy:true};
     buildTimeline(); G.screen='arena'; render();
  },
  initAllStars(){ initAllStarsTournament(); render(); },
  toggleAllStarsDraft(index){
     G.allstarsDraft=G.allstarsDraft||[];
     if(G.allstarsDraft.includes(index)) G.allstarsDraft=G.allstarsDraft.filter(i=>i!==index);
     else if(G.allstarsDraft.length<8) G.allstarsDraft.push(index);
     render();
  },
  launchAllStars(){
     if(!G.allstarsDraft || G.allstarsDraft.length!==8) return;
     const fullList=loadHOF();
     const top8=G.allstarsDraft.map(idx=>reconstructLegend(fullList[idx])).sort(()=>0.5-Math.random());
     G.allstars={active:true,step:'Quarts de finale',roundNum:1,
       matches:[{a:top8[0],b:top8[1]},{a:top8[2],b:top8[3]},{a:top8[4],b:top8[5]},{a:top8[6],b:top8[7]}],
       history:[]};
     G.screen='allstars'; render();
  },
  advanceAllStars(){ advanceAllStarsTournament(); render(); },
  setVsFriendPlayer(side,dir){
     const max=loadHOF().length-1;
     if(side===0){ let n=(G.vsFriendSelA||0)+dir; if(n<0)n=max; if(n>max)n=0; G.vsFriendSelA=n; }
     else { let n=(G.vsFriendSelB!==undefined?G.vsFriendSelB:1)+dir; if(n<0)n=max; if(n>max)n=0; G.vsFriendSelB=n; }
     render();
  },
  importFriendCode(){
     const el=document.getElementById('friend_code');
     const code=el&&el.value;
     const legend=decodeLegendCode(code);
     if(!legend){ G.lastMsg="Code invalide ou corrompu."; render(); return; }
     G.importedFriendLegend=legend; render();
  },
  clearImportedFriend(){ G.importedFriendLegend=null; render(); },
  launchVsFriend(){
     const list=loadHOF();
     const lA=list[G.vsFriendSelA||0];
     const lB=G.importedFriendLegend||list[G.vsFriendSelB!==undefined?G.vsFriendSelB:1];
     const A=reconstructLegend(lA);
     const B=reconstructLegend(lB);
     B.champion='monde'; B.flag=B.flag||'🏴\u200d☠️';
     neutralizeWeightGap(A,B);
     if(!G._backupF){ G._backupF=G.f; G._backupFight=G.fight; }
     G.f=A; G.fight={kind:'fantasy',opp:B,rounds:5,plan:null}; G.vsFriendActive=true;
     const res=simulateFight(A,B,5);
     G.pending={res,win:res.winner==='A',method:res.method,finish:!isDecisionLike(res.method),opp:{name:B.name,flag:B.flag},isVsFriend:true};
     buildTimeline(); G.screen='arena'; render();
  },
  filterHof(key,val){ if(!G.hofFilter) G.hofFilter={}; if(val===''||val===0) delete G.hofFilter[key]; else G.hofFilter[key]=val; render(); },
  toggleHofFilters(){ G.showHofFilters=!G.showHofFilters; render(); },
  tryChampChamp(targetDivId){ const r=attemptChampChamp(targetDivId); G.lastMsg=r.msg; render(); },
  champChampFight(){
    if(!G.f.champChampTarget) return;
    G.f._champChampHomeDiv=G.f.div; G.f._champChampHomeRoster=G.roster;
    G.f.div=G.f.champChampTarget;
    G.roster=makeOrgRoster(G.f);
    if(G.roster.length){ G.roster[0].champion=G.roster[0].champion||'monde'; }
    const champOpp=G.roster.find(o=>o.champion)||G.roster[0];
    G.opps=[{o:champOpp,read:'Combat de titre dans une catégorie différente.',context:'CHAMP-CHAMP'}];
    G.screen='select'; save(); render(); },
  chooseMue(styleId){ const r=triggerMueMartiale(G.f,styleId); G.lastMsg=r.msg||G.lastMsg;
    G.f._fy=(G.f._fy||0)+1; if(G.f._fy>=RI(2,4)){ applyAging(G.f); G.f._fy=0; }
    advanceRoster(); G.screen='hub'; save(); render(); },
  pickScenario(scenId){
    const scen=SCENARIOS.find(s=>s.id===scenId); if(!scen) return;
    wipe();
    G={theme:(G&&G.theme)||'dark',draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:''}};
    setTheme(G.theme);
    CL.create();
    G.activeScenario=scen.id;
    scen.init(G.f);
    // Recalcul critique : create() a fixé l'overall/Elo au niveau amateur, mais
    // scen.init() vient de changer radicalement l'organisation et le palmarès —
    // sans ce recalcul, le combattant restait à ~800 pts Elo pour toujours,
    // gelant son classement quel que soit son parcours réel.
    G.f.overall=overall(G.f);
    const bias=Math.round(((G.f.W||0)-(G.f.L||0))*18);
    G.f.orgElo=eloBaseline(G.f.org,G.f.overall)+bias;
    G.f.careerElo=eloBaseline(G.f.org,G.f.overall)+Math.round(bias*0.6);
    G.roster=makeOrgRoster(G.f);
    G.screen='hub'; save(); render(); },
  cont(){ if(load()){ setTheme(G.theme||'dark'); G.screen=G.faith?'faith_hub':'hub'; render(); } },
  draft(k,v){ G.draft[k]=v; if(k==='gender')G.draft.div=DIVISIONS[v][Math.min(3,DIVISIONS[v].length-1)].id; render(true); },
  draftIn(k,v){ G.draft[k]=v; },
  create(){ const d=G.draft; const f=makeFighter({gender:d.gender,div:d.div,style:d.style,countryKey:d.country,first:(d.first||'').trim()||undefined,age:RI(15,16),potential:RI(70,94)});
    f.stage='amateur'; f.org=0; f._fy=0;
    if(d.personality){ f.personality=d.personality;
      if(d.personality==='villain'){ f.hypeBonus=1.3; f.morale=clamp(f.morale-10,0,100); }
      else if(d.personality==='humble'){ f.hypeBonus=1.0; f.morale=clamp(f.morale+15,0,100); f.attrs.focus=clamp((f.attrs.focus||50)+10,1,100); }
    }
    G.ironMan=!!d.ironMan;
    // ==== [ANCRE: META02] — mentorat en 3 piliers, consommé une seule fois à la
    // création : (1) bonus d'archétype selon le style du mentor, (2) faveur des
    // promoteurs (cooldown d'offre pro réduit de 50%), (3) bonus de camp
    // persistant sur la stat principale du mentor (+2 à chaque entraînement).
    try{ const raw=localStorage.getItem('cage-legacy-mentor-bonus');
      if(raw){
        const mentor=JSON.parse(raw);
        const ARCHETYPE_BONUS={
          wrestler:{tdd:10,strength:5}, sambo:{tdd:10,strength:5},
          boxer:{handSpeed:10,jab:5,cross:5}, kickboxer:{handSpeed:10,jab:5,cross:5},
          muayThai:{handSpeed:10,jab:5,cross:5}, karate:{handSpeed:10,jab:5,cross:5},
          bjj:{submission:10,guardWork:5}, mma:{fightIQ:8,adaptability:8}
        };
        const MAIN_STAT={boxer:'jab',kickboxer:'kick',muayThai:'kick',karate:'kick',wrestler:'takedown',bjj:'submission',sambo:'takedown',mma:'fightIQ'};
        const bonus=ARCHETYPE_BONUS[mentor.style]||{};
        for(const k in bonus) if(f.attrs[k]!==undefined) f.attrs[k]=clamp(f.attrs[k]+bonus[k],1,100);
        f.overall=overall(f);
        f._mentorMainStat=MAIN_STAT[mentor.style]||null; // pilier 3, lu par chooseTraining()
        f.proOfferCooldown=0; f._mentorFastTrack=true; // pilier 2, lu par declinePro()
        localStorage.removeItem('cage-legacy-mentor-bonus');
      }
    }catch(e){}
    // ==== [FIN ANCRE] ====
    G.f=f; G.roster=makeOrgRoster(f); G.ach=[]; G.season={year:1,fights:[]}; checkAch(); G.screen='hub'; save(); render(); },
  fightSelect(){ startFightSelect(); },
  opp(i){
    if(G.faith){
      G.sel=G.opps[i];
      let pendingOppMalus=null, pendingMyMalus=null;
      if(G.faith.nextFightBuffs){
        pendingOppMalus=G.faith.nextFightBuffs.oppMalus;
        pendingMyMalus=G.faith.nextFightBuffs.myMalus;
        if(G.faith.nextFightBuffs.neutralizePlanB){ if(!pendingOppMalus) pendingOppMalus={}; pendingOppMalus.adaptability=-50; }
        G.faith.nextFightBuffs=null;
      }
      if(G.faith.perks && G.faith.perks.hometown){
        G.f.morale=clamp(G.f.morale+15,0,100); G.f.form=clamp(G.f.form+8,0,100); G.faith.perks.hometown=false;
      }
      if(G.faith.perks && G.faith.perks.catchweight){
        if(!pendingOppMalus) pendingOppMalus={}; pendingOppMalus.cardio=-20; pendingOppMalus.durability=-15; G.faith.perks.catchweight=false;
      }
      const kind=fightKind(); const opp=G.sel.o; const rounds=(kind==='title'||kind==='defense')?5:3;
      G.fight={kind,opp,rounds,malus:pendingMyMalus||null,oppMalus:pendingOppMalus||null};
      const wc=weightCutInfo(G.f);
      let cutTier;
      if(G.faith.dietYear===G.faith.year){ cutTier='sans_effort'; }
      else if(wc.cutPct<=3) cutTier='sans_effort';
      else if(wc.cutPct<=8) cutTier='facile';
      else if(wc.cutPct<=13) cutTier='normal';
      else if(wc.cutPct<=18) cutTier='complique';
      else cutTier='impossible';
      G.fight.cutResult={tier:cutTier,effPct:(G.faith.dietYear===G.faith.year)?0:wc.cutPct,kg:(G.faith.dietYear===G.faith.year)?0:wc.cutKg,walk:wc.walk,limit:wc.limit};
      proceedToFight();
    } else { chooseOpponent(i); }
  },
  train(i){ chooseTraining(i); },
  setCampTier(tierId){ G.selectedCampTier=tierId; render(); },
  skipArena(){ CL.toResult(); },
  nextRound(){ if(!ARENA||!ARENA.roundPause) return;
    ARENA.pauseOffset=performance.now()-ARENA.t0-(ARENA.pendingBeatIdx||0)*BEAT_MS;
    ARENA.roundPause=false;
    if(ARENA.loopFn) ARENA.raf=requestAnimationFrame(ARENA.loopFn);
  },
  handleEvent(actionId){ const ev=G.activeEvent; const id=actionId||(ev&&ev.actionId);
    if(id==='mue_martiale'){ G.screen='mueChoice'; save(); render(); return; }
    if(id==='mue_martiale_decline'){ G.f.morale=clamp(G.f.morale-5,0,100); G.lastMsg='Vous restez fidèle à votre style, pour le meilleur ou pour le pire.'; G.screen='hub'; save(); render(); return; }
    if(id==='major_injury'){ const f=G.f;
      f._fy=(f._fy||0)+1; if(f._fy>=RI(2,4)){ applyAging(f); f._fy=0; }
      const inj=rollInjury(); f.injury={name:inj.name,left:inj.fights};
      f.form=clamp(f.form-20,0,100); f.morale=clamp(f.morale-15,0,100);
      if(typeof checkIronManDeath==='function') checkIronManDeath(null,inj);
      advanceRoster(); G.screen='hub'; save(); render();
    } else if(id==='botched_weight_accept'){
      G.fight.malus=Object.assign({},G.fight.malus,{cardio:-20,durability:-15,strength:-10});
      G.fight.pursePenalty=0.65;
      proceedToFight();
    } else if(id==='botched_weight_decline'){
      G.f.morale=clamp(G.f.morale-8,0,100);
      G.lastMsg='Combat annulé. Mauvaise impression garantie auprès de l\u2019organisation.';
      G.f._fy=(G.f._fy||0)+1; if(G.f._fy>=RI(2,4)){ applyAging(G.f); G.f._fy=0; }
      advanceRoster();
      G.screen='hub'; save(); render();
    } else if(id==='opp_overweight_accept'){
      const oa=G.fight.opp.attrs;
      oa.killer=clamp((oa.killer||50)+5,1,100); oa.power=clamp((oa.power||50)+5,1,100);
      G.fight.opp.overall=overall(G.fight.opp);
      proceedToFight();
    } else if(id==='opp_overweight_decline'){
      G.f.form=clamp(G.f.form-5,0,100);
      G.lastMsg='Combat annulé suite au surpoids adverse. Un remplaçant est recherché pour la prochaine carte.';
      G.f._fy=(G.f._fy||0)+1; if(G.f._fy>=RI(2,4)){ applyAging(G.f); G.f._fy=0; }
      advanceRoster();
      G.screen='hub'; save(); render();
    } else if(id==='faceoff_smile' || id==='faceoff_ignore'){
      G.fight.malus=Object.assign({},G.fight.malus,{composure:8,focus:5,aggression:-5});
      G.f.morale=clamp(G.f.morale+5,0,100);
      G.lastMsg='Vous avez remporté la guerre psychologique de la pesée (+ Sang-froid/Moral).';
      proceedToFight();
    } else if(id==='faceoff_shove' || id==='faceoff_talkback'){
      G.fight.malus=Object.assign({},G.fight.malus,{confidence:8,aggression:10,composure:-10});
      G.lastMsg='L\u2019adrénaline monte avant même d\u2019entrer dans la cage (+ Agressivité/Confiance, - Sang-froid).';
      proceedToFight();
    } else { proceedToFight(); }
  },
  recoverInjury(){ const f=G.f; if(!f.injury)return;
    f.injury.left-=1; f.morale=clamp(f.morale+5,0,100); f.form=clamp(f.form+15,0,100);
    f._fy=(f._fy||0)+1; if(f._fy>=RI(2,4)){ applyAging(f); f._fy=0; }
    advanceRoster();
    if(f.injury.left<=0) f.injury=null;
    save(); render(); },
  choosePlan(idx){ const combined=getExclusiveTactics(G.f).concat(TACTICS[G.f.style]||[]); const planObj=combined[idx]; if(!planObj)return;
    G.fight.plan=planObj.m; G.fight.planLabel=planObj.lbl;
    resolveFight(); buildTimeline(); G.screen='arena'; save(); render(); },
  toResult(){ stopArena(); G.screen='result'; save(); render(); },
  afterResult(){
    if(G.pending && G.pending.isFantasy){
      if(G._backupF){ G.f=G._backupF; G.fight=G._backupFight; delete G._backupF; delete G._backupFight; }
      G.fantasyActive=false; G.screen='fantasy_setup'; render(); return;
    }
    if(G.pending && G.pending.isVsFriend){
      if(G._backupF){ G.f=G._backupF; G.fight=G._backupFight; delete G._backupF; delete G._backupFight; }
      G.vsFriendActive=false; G.screen='vs_friend'; render(); return;
    }
    if(G.faith){
      const p=G.pending;
      if(p&&p.proOffer){ G.screen='promo'; save(); render(); return; }
      if(p&&p.topTierOffer){ G.screen='toptier'; save(); render(); return; }
      if(p&&p.promoOffer){ G.screen='promo'; save(); render(); return; }
      if(p&&p.contractExpiry){ G.screen='contract_nego'; save(); render(); return; }
      if(typeof CL.prepareFaithYearEnd==='function') CL.prepareFaithYearEnd();
      return;
    }
    if(G.arcade && G.arcade.active){
      const win=G.pending&&G.pending.win;
      if(G.arcade.mode==='boss_run'){
        const koOnlyFail=G.arcade.condition==='ko_only' && win && G.pending.method && !G.pending.method.startsWith('KO');
        if(!win || koOnlyFail){ G.arcade.active=false; G.screen='gameover'; save(); render(); return; }
        G.arcade.streak++;
        if(G.arcade.streak>=G.arcade.target){ G.arcade.active=false; G.screen='gameover'; save(); render(); return; }
        G.f.form=Math.min(100,G.f.form+20);
        G.arcade.opponent=genBossOpponent(G.arcade.streak);
        G.screen='arcadehub'; save(); render(); return;
      }
      if(G.arcade.mode==='ladder_100'){
        if(!win){
          const earned=Math.max(2,Math.round((101-G.arcade.rank)*0.8));
          const meta=loadMetaStats(); meta.legendPoints=(meta.legendPoints||0)+earned; saveMetaStats(meta);
          G.arcade.active=false; G.screen='gameover'; save(); render(); return;
        }
        G.arcade.fightsDone=(G.arcade.fightsDone||0)+1;
        G.arcade.rank=G.arcade.opponent.ladderRank; // le joueur prend la place du vaincu
        if(G.arcade.rank===1){
          const meta=loadMetaStats(); meta.legendPoints=(meta.legendPoints||0)+80; saveMetaStats(meta);
          G.arcade.active=false; G.arcade.victory=true; G.screen='gameover'; save(); render(); return;
        }
        G.f.form=Math.min(100,G.f.form+20);
        generateArcadeUpgrades();
        G.screen='arcade_upgrades'; save(); render(); return;
      }
      // ==== Bracket 64 (WTUMMA) ====
      if(!win){
        const points={1:2,2:6,3:14,4:28,5:50,6:100,7:100};
        const meta=loadMetaStats();
        meta.legendPoints=(meta.legendPoints||0)+(points[G.arcade.tournament.roundStep]||2);
        saveMetaStats(meta);
        G.arcade.active=false; G.screen='gameover'; save(); render(); return;
      }
      const wonTournament=advanceWTUMMABracket();
      if(wonTournament){
        const meta=loadMetaStats();
        meta.wtNemesis={name:G.f.name,nick:G.f.nick,flag:G.f.flag,overall:G.f.overall,
          attrs:JSON.parse(JSON.stringify(G.f.attrs)),skills:[...G.f.skills],style:G.f.style,div:G.f.div};
        const points={1:2,2:6,3:14,4:28,5:50,6:100,7:100};
        meta.legendPoints=(meta.legendPoints||0)+(points[7]);
        saveMetaStats(meta);
        G.arcade.active=false; G.arcade.victory=true; G.screen='gameover'; save(); render(); return;
      }
      G.f.form=Math.min(100,G.f.form+20);
      generateArcadeUpgrades();
      G.screen='arcade_upgrades'; save(); render(); return;
    }
    const p=G.pending; G.screen=(p&&p.proOffer)?'promo':(p&&p.topTierOffer)?'toptier':(p&&p.promoOffer)?'promo':(p&&p.endOfSeason)?'season':'hub'; save(); render(); },
  startArcade(){ injectExtendedArchetypes(); G.arcade={active:true,streak:0,target:5,pool:buildArcadePool()}; G.screen='draft'; save(); render(); },
  startBossRun(){ startBossRun(); },
  startLadder100(){ injectExtendedArchetypes(); G.arcade={active:true,mode:'ladder_100',rank:100,victory:false,fightsDone:0,pool:buildArcadePool()}; G.screen='draft'; save(); render(); },
  startFaith(){ G.faithDraft={origin:'',style:'',lifestyle:'',circle:'',personality:'',first:'',country:COUNTRY_KEYS[0]}; G.screen='faith_draft'; save(); render(); },
  faithDraftIn(k,v){ G.faithDraft[k]=v; },
  selectFaithDraft(key,value){ G.faithDraft[key]=value; render(true); },
  finalizeFaithDraft(){
    const d=G.faithDraft;
    if(!d.origin || !d.style || !d.lifestyle || !d.circle || !d.personality){
      G.lastMsg="Complète les 5 catégories avant de commencer."; render(); return;
    }
    const f=makeFighter({gender:'H',style:d.style,countryKey:d.country||COUNTRY_KEYS[0],first:(d.first||'').trim()||undefined,age:18});
    f.gameMode='faith';
    if(d.origin==='traditional'){ f.attrs.fightIQ+=8; f.attrs.discipline+=8; }
    if(d.origin==='pro_child'){ f.earnings=50; f.attrs.composure-=10; f.hypeBonus=1.5; }
    if(d.origin==='street'){ f.attrs.chin+=10; f.attrs.heart+=10; f.attrs.fightIQ-=5; }
    if(d.origin==='late_bloomer'){ f.attrs.power+=12; f.attrs.takedown-=10; f.attrs.submission-=10; }
    if(d.lifestyle==='pro'){ f.attrs.cardio+=10; f.form=100; }
    if(d.lifestyle==='party'){ f.form=60; f.morale=90; f.hypeBonus=(f.hypeBonus||1)+0.3; }
    if(d.circle==='family'){ f.morale=100; }
    if(d.circle==='agent'){ f.earnings=(f.earnings||0)+30; f.agentCut=0.15; }
    f.personality=d.personality;
    if(d.personality==='villain'){ f.hypeBonus=(f.hypeBonus||1)+0.3; f.morale=clamp(f.morale-10,0,100); }
    else if(d.personality==='humble'){ f.hypeBonus=1.0; f.morale=clamp(f.morale+15,0,100); f.attrs.focus=clamp((f.attrs.focus||50)+10,1,100); }
    for(const k in f.attrs) f.attrs[k]=clamp(f.attrs[k],1,100);
    f.overall=overall(f);
    f.maxAttrs={};
    for(const k of ATTR_KEYS){
      let margin=RI(8,28);
      if(d.origin==='late_bloomer' && ['power','strength'].includes(k)) margin+=10;
      f.maxAttrs[k]=clamp(f.attrs[k]+margin,1,100);
    }
    G.f=f; G.roster=makeOrgRoster(f);
    // Partenaires de salle (Lot 7) : deux prospects générés dans la même
    // division/genre, qui progresseront en copiant les stats du joueur s'il
    // s'entraîne avec eux (voir CL.faithSparring).
    const p1=makeFighter({gender:f.gender,div:f.div,age:18,level:clamp(f.overall-15,20,60),potential:95});
    const p2=makeFighter({gender:f.gender,div:f.div,age:21,level:clamp(f.overall-10,20,60),potential:85});
    p1.isGymPartner=true; p2.isGymPartner=true;
    p1.nick='Le Prodige'; p2.nick='L\u2019Aspirant';
    G.faith={year:2026,step:1,fightsThisYear:0,trainingsThisYear:0,trainingTags:[],startOfYearElo:f.careerElo,startOfYearEarnings:f.earnings||0,gym:[p1,p2]};
    G.season={year:1,fights:[]};
    G.screen='faith_hub'; save(); render();
  },
  faithRest(){
    G.f.form=clamp(G.f.form+25,0,100); G.f.morale=clamp(G.f.morale+10,0,100);
    G.faith.step=3; G.screen='faith_hub'; save(); render();
  },
  faithSparring(partnerId){
    const partner=(G.faith.gym||[]).find(p=>p.id===partnerId); if(!partner) return;
    G.f.form=clamp(G.f.form+15,0,100);
    applyDeltas(G.f,[['fightIQ',1]]); // enseigner renforce l'intellect tactique
    // Syndrome de Frankenstein : le partenaire copie violemment les 2
    // meilleures stats du joueur — c'est lui qui, des années plus tard,
    // reviendra armé de vos propres armes.
    const bestStats=ATTR_KEYS.map(k=>({k,v:G.f.attrs[k]})).sort((a,b)=>b.v-a.v).slice(0,2);
    applyDeltas(partner,[[bestStats[0].k,3],[bestStats[1].k,3],['adaptability',2],['fightIQ',2]]);
    partner.overall=overall(partner);
    G.lastMsg=`Séance intense. ${esc(partner.first)} a parfaitement mimé votre ${attrLabel(bestStats[0].k)}. Il progresse à une vitesse terrifiante.`;
    if(!G.faith.yearLog) G.faith.yearLog=[];
    G.faith.yearLog.push({title:'Sparring',choice:`A tourné avec ${esc(partner.name)}`});
    G.faith.step=3; save(); render();
  },
  faithLifeEvent(){
    // Syndrome de Frankenstein : si un protégé a rattrapé (ou dépassé) le
    // joueur, il quitte la salle — court-circuite le pool normal d'événements
    // pour ce tour, ce moment doit être vécu, pas noyé dans la pioche.
    if(G.faith.gym){
      const monster=G.faith.gym.find(p=>p.overall>=G.f.overall-2 && p.overall>45);
      if(monster){
        G.faith.currentEvent={
          id:'evt_frankenstein_betrayal', monsterId:monster.id, title:'Le monstre s\u2019échappe',
          text:`Votre protégé, ${esc(monster.name)}, vient de vider son casier. "Je connais ton jeu par cœur, tu n\u2019as plus rien à m\u2019apprendre", lâche-t-il devant la salle. Il a signé un contrat dans votre ligue et promet de prendre votre place.`,
          choices:[
            {label:'Le laisser partir et préparer la guerre',d:[['aggression',8],['morale',-15],['focus',10]]},
            {label:'Le provoquer publiquement',d:[['composure',-10],['confidence',5],['morale',-10]]}
          ]
        };
        G.screen='faith_event'; save(); render();
        return;
      }
    }
    if(!G.faith.seenEvents) G.faith.seenEvents=[];
    let pool=FAITH_LIFE_EVENTS.filter(e=>!G.faith.seenEvents.includes(e.id) && (!e.req||e.req(G.f)));
    if(pool.length===0){ G.faith.seenEvents=[]; pool=FAITH_LIFE_EVENTS.filter(e=>!e.req||e.req(G.f)); }
    G.faith.currentEvent=pick(pool);
    G.screen='faith_event'; save(); render();
  },
  chooseFaithEvent(i){
    const ev=G.faith.currentEvent; if(!ev) return;
    const c=ev.choices[i]; if(!c) return;
    if(c.cost && (G.f.earnings||0)<c.cost){ G.lastMsg="Fonds insuffisants ("+c.cost+"k$)."; render(); return; }
    if(c.cost) G.f.earnings-=c.cost;
    if(c.reward) G.f.earnings=(G.f.earnings||0)+c.reward;
    applyDeltas(G.f,c.d);
    // Syndrome de Frankenstein : le protégé qui trahit rejoint réellement le
    // roster de l'organisation, en Némésis si aucune n'est encore verrouillée.
    if(ev.id==='evt_frankenstein_betrayal'){
      const monster=(G.faith.gym||[]).find(p=>p.id===ev.monsterId);
      if(monster){
        monster.org=G.f.org; monster.stage='pro';
        monster.W=Math.max(0,G.f.W-2); monster.L=1;
        monster.orgWins=0;
        monster.orgElo=Math.max(500,eloBaseline(G.f.org,monster.overall)+150);
        monster.careerElo=Math.max(500,eloBaseline(G.f.org,monster.overall)+100);
        G.roster.push(monster);
        if(!G.f.faithNemesisId) G.f.faithNemesisId=monster.id;
        G.f.rivalId=monster.id;
        if(!G.f._rivalries) G.f._rivalries={};
        G.f._rivalries[monster.id]=3;
        G.faith.gym=G.faith.gym.filter(p=>p.id!==monster.id);
        G.roster=rankPool(G.roster);
      }
    }
    if(!G.faith.seenEvents) G.faith.seenEvents=[];
    G.faith.seenEvents.push(ev.id);
    G.faith.currentEvent=null;
    G.lastMsg="Événement résolu : "+ev.title;
    if(!G.faith.yearLog) G.faith.yearLog=[];
    G.faith.yearLog.push({title:ev.title,choice:c.label});
    // Moteur d'émergence : un choix taggé traitTag renforce une tendance cachée ;
    // au 3e choix dans la même direction, elle se cristallise en trait permanent.
    if(c.traitTag){
      if(!G.f.hiddenTraits) G.f.hiddenTraits={};
      if(!G.f.faithTraits) G.f.faithTraits=[];
      G.f.hiddenTraits[c.traitTag]=(G.f.hiddenTraits[c.traitTag]||0)+1;
      const TRAIT_NAMES={rebel:'Tête Brûlée',ascetic:'Ascète',showman:'Showman'};
      const traitName=TRAIT_NAMES[c.traitTag];
      if(traitName && G.f.hiddenTraits[c.traitTag]>=3 && !G.f.faithTraits.includes(traitName)){
        G.f.faithTraits.push(traitName);
        G.lastMsg=`Événement résolu : ${ev.title}. NOUVEAU TRAIT ACQUIS : ${traitName} !`;
      }
    }
    G.faith.step=2; G.screen='faith_hub'; save(); render();
  },
  faithFight(){
    G.faith.fightsThisYear=(G.faith.fightsThisYear||0)+1;
    G.faith.step=4; // combat en cours — le retour se fera vers le bilan (voir afterResult)
    startFightSelect();
  },
  prepareFaithYearEnd(){
    const f=G.f;
    const dmgHead=(G.season.fights||[]).reduce((acc,fight)=>acc+((fight.st&&fight.st.Me&&fight.st.Me.dmgHead)||0),0);
    const eloDelta=Math.round(f.careerElo-(G.faith.startOfYearElo||f.careerElo));
    const earningsDelta=(f.earnings||0)-(G.faith.startOfYearEarnings||0);
    const rank=divRank(f);
    if((G.season.fights||[]).length>=1){
      let totalSig=0, totalTdAtt=0, totalCtrl=0, totalKD=0;
      G.season.fights.forEach(fight=>{ totalSig+=(fight.st&&fight.st.Me&&fight.st.Me.sig)||0; totalTdAtt+=(fight.st&&fight.st.Me&&fight.st.Me.tdAtt)||0; totalCtrl+=(fight.st&&fight.st.Me&&fight.st.Me.ctrl)||0; totalKD+=(fight.st&&fight.st.Me&&fight.st.Me.kd)||0; });
      const totalRounds=G.season.fights.reduce((acc,fight)=>acc+(fight.round||3),0);
      if(!f.faithSpecs) f.faithSpecs=[];
      if(!f._styleProfileOverride) f._styleProfileOverride=Object.assign({},STYLE_PROFILE[f.style]||STYLE_PROFILE.mma);
      if(!f.faithSpecs.includes('Striker Pur') && (totalSig/(totalSig+totalTdAtt*10+1))>0.85){
        f.faithSpecs.push('Striker Pur'); f._styleProfileOverride.sigVol+=0.15; f._styleProfileOverride.koMod+=0.10;
        G.lastMsg="Nouvelle Spécialisation : Striker Pur (+15% Vol, +10% KO)";
      } else if(!f.faithSpecs.includes('Boa Constrictor') && totalCtrl>totalRounds*0.60){
        f.faithSpecs.push('Boa Constrictor'); f._styleProfileOverride.subMod+=0.20; f._styleProfileOverride.gnpDmg+=0.15;
        G.lastMsg="Nouvelle Spécialisation : Boa Constrictor (+20% Sub, +15% GNP)";
      } else if(!f.faithSpecs.includes('Tueur à Gages') && totalKD>=4){
        f.faithSpecs.push('Tueur à Gages'); f._styleProfileOverride.koMod+=0.25;
        G.lastMsg="Nouvelle Spécialisation : Tueur à Gages (+25% KO)";
      }
    }
    // Tirage de compétence : 1 roll garanti si un événement de vie a été résolu
    // cette année (toujours vrai en pratique, Phase 1 en impose un). Corrige un
    // bug trouvé en vérifiant : l'ancienne condition (trainingsThisYear>=1)
    // dépendait d'un compteur mort depuis le remplacement de l'entraînement par
    // les événements de vie — plus aucune compétence ne pouvait plus se
    // débloquer en Faith.
    const nbRolls=((G.faith.yearLog||[]).length>=1)?1:0;
    const newSkills=[];
    let pool=poolEligible(f,f.age>=34,f.skills.length>=9);
    const tags=G.faith.trainingTags||[];
    for(let i=0;i<nbRolls;i++){
      if(pool.length===0) break;
      let currentPool=pool;
      if(tags.length>0 && rnd()<0.5){ const filtered=pool.filter(s=>s.fam==='style'&&s.key && tags.includes(s.key)); if(filtered.length>0) currentPool=filtered; }
      const rar=tirerRarete(); const sk=getFallbackSkill(currentPool,rar);
      if(sk){ grantSkill(f,sk); newSkills.push(sk); pool=poolEligible(f,f.age>=34,f.skills.length>=9); }
    }
    G.faith.yearStats={
      fights:G.faith.fightsThisYear,
      wins:(G.season.fights||[]).filter(x=>x.win).length,
      losses:(G.season.fights||[]).filter(x=>!x.win).length,
      eloDelta, earningsDelta, rank, dmgHead, newSkills, yearLog:G.faith.yearLog||[]
    };
    G.screen='faith_year_end'; save(); render();
  },
  nextFaithYear(){
    G.faith.year++; G.faith.step=1;
    G.faith.fightsThisYear=0; G.faith.trainingsThisYear=0; G.faith.trainingTags=[]; G.faith.yearLog=[];
    G.faith.startOfYearElo=G.f.careerElo; G.faith.startOfYearEarnings=G.f.earnings||0;
    G.season.fights=[];
    if(G.faith.pedActive!==G.faith.year) applyAging(G.f);
    advanceRoster();
    if(G.faith.gym){
      G.faith.gym.forEach(p=>{
        p.age++;
        applyDeltas(p,[['strength',1],['fightIQ',1],['cardio',1],['durability',1]]);
        p.overall=overall(p);
      });
    }
    G.screen='faith_hub'; save(); render();
  },
  buyFaithPerk(perkId){
    const f=G.f; if(!G.faith.perks) G.faith.perks={};
    const costMoney={hometown:15,catchweight:35,protect_title:50,ped:30,tiger:50,lobbying:100,diet:40};
    if(costMoney[perkId]||perkId==='judges'){
      let actualCost=costMoney[perkId];
      if(perkId==='judges') actualCost=(f.earnings||0)*0.20;
      if((f.earnings||0)<actualCost){ G.lastMsg="Fonds insuffisants."; render(); return; }
      f.earnings-=actualCost;
      if(perkId==='hometown'){ G.faith.perks.hometown=true; G.lastMsg="Privilège acquis : Votre prochain combat sera à domicile."; }
      else if(perkId==='catchweight'){ G.faith.perks.catchweight=true; G.lastMsg="Privilège acquis : Le prochain adversaire subira un lourd malus de déshydratation."; }
      else if(perkId==='protect_title'){ G.f.champChampInactivity=0; G.lastMsg="Privilège acquis : L\u2019inactivité est réinitialisée. Ceinture sanctuarisée."; }
      else if(perkId==='ped'){
        if(rnd()<0.15){ G.lastMsg="CATASTROPHE : Test antidopage positif ! Suspendu 1 an."; G.faith.month=1; G.faith.year++; G.faith.pa=3; f.rankBoost=Math.max(0,(f.rankBoost||0)-100); }
        else { f.attrs.chin=clamp(f.attrs.chin+4,1,100); f.attrs.durability=clamp(f.attrs.durability+4,1,100); f.overall=overall(f); G.faith.pedActive=G.faith.year; G.lastMsg="Protocoles PED réussis : Menton et Résistance +4."; }
      } else if(perkId==='tiger'){
        if(rnd()<0.25){ G.lastMsg="Le stage était d\u2019une rare violence. Blessure mineure contractée."; f.form=clamp(f.form-20,0,100); }
        else { f.attrs.kick=clamp(f.attrs.kick+5,1,100); f.attrs.clinchStr=clamp(f.attrs.clinchStr+5,1,100); f.overall=overall(f); G.lastMsg="Stage Tiger Muay Thai validé : Kick et Clinch +5 (hors-plafond)."; }
      } else if(perkId==='lobbying'){
        if(rnd()<0.50){ G.lastMsg="L\u2019argent a disparu dans les poches des promoteurs. Aucun effet."; }
        else { G.faith.perks.forcePromo=true; G.lastMsg="Lobbying réussi : Une offre de promotion sera forcée après votre prochain combat."; }
      } else if(perkId==='judges'){
        if(rnd()<0.10){ G.lastMsg="SCANDALE : Corruption découverte. L\u2019organisation coupe votre contrat !"; if(f.org>1) f.org--; G.roster=makeOrgRoster(f); }
        else { G.faith.perks.judges=true; G.lastMsg="Les juges ont été 'informés'. Vous bénéficierez d\u2019une grande clémence en cas de décision."; }
      } else if(perkId==='diet'){ G.faith.dietYear=G.faith.year; G.lastMsg="Diététicien Élite engagé pour l\u2019année. Les pesées seront une formalité."; }
    }
    save(); render();
  },
  selectDraft(i){ G.f=G.arcade.pool[i];
    if(G.arcade.mode==='boss_run'){ G.arcade.opponent=genBossOpponent(0); G.screen='arcadehub'; save(); render(); return; }
    if(G.arcade.mode==='ladder_100'){ G.arcade.ladder=buildWTUMMALadder(G.f.div); G.arcade.opponent=genWTUMMAOpponent(); G.screen='arcadehub'; save(); render(); return; }
    G.arcade.tournament=buildWTUMMABracket(G.f);
    const playerMatch=G.arcade.tournament.matches.find(m=>m.a.id===G.f.id||m.b.id===G.f.id);
    G.arcade.opponent=playerMatch.a.id===G.f.id?playerMatch.b:playerMatch.a;
    G.screen='arcadehub'; save(); render(); },
  pickArcadeTrain(idx){ if(G.arcade.upgradesChosen.train) return; applyDeltas(G.f,G.arcade.trainOpts[idx].d); G.arcade.upgradesChosen.train=true;
    if(G.arcade.mode==='ladder_100') G.arcade.opponent=genWTUMMAOpponent();
    CL.go('arcadehub'); },
  pickArcadeSkill(idx){ if(G.arcade.upgradesChosen.skill) return; if(idx>=0) grantSkill(G.f,G.arcade.skillOpts[idx]); G.arcade.upgradesChosen.skill=true; render(); },
  retryArcade(){ CL.startArcade(); },
  fightArcade(){ resolveArcadeFight(); },
  acceptPromo(targetOrg){
    G.f.org=targetOrg||(G.f.org+1); G.f.orgWins=0; G.f.champion=null; G.f.defenses=0; G.f.rivalId=null; G.f.orgElo=eloBaseline(G.f.org,G.f.overall); G.f.rankBoost=0;
    if(ORG_FLAVORS[G.f.org]) G.f.orgFlavor=pick(ORG_FLAVORS[G.f.org]);
    G.f.contract=generateContract(G.f,G.f.org,false);
    applyOrgAdvancementBoost(G.f,G.f.org);
    G.roster=makeOrgRoster(G.f);
    if(G.pending) G.pending.promoOffer=false;
    routeAfterOrgChange();
  },
  declinePromo(){
    G.f.promoCooldown=2;
    if(G.pending) G.pending.promoOffer=false;
    routeAfterOrgChange();
  },
  declineTopTier(){
    G.f.promoCooldown=2;
    if(G.pending) G.pending.topTierOffer=false;
    routeAfterOrgChange();
  },
  signTopTier(orgId){ G.f.org=orgId; G.f.orgWins=0; G.f.champion=null; G.f.rivalId=null; G.f.orgElo=eloBaseline(orgId,G.f.overall); G.f.rankBoost=0; if(G.pending)G.pending.topTierOffer=false;
    G.f.contract=generateContract(G.f,orgId,false);
    applyOrgAdvancementBoost(G.f,orgId);
    G.roster=makeOrgRoster(G.f);
    if(orgId===5){ G.roster.forEach(o=>{ o.overall=clamp(o.overall+4,30,99); o.attrs.fightIQ=clamp(o.attrs.fightIQ+5,1,100); }); }
    routeAfterOrgChange(); },
  acceptPro(orgIdx,flavorName){ turnPro(); G.f.org=orgIdx||1; G.f.orgElo=eloBaseline(G.f.org,G.f.overall); G.f.rankBoost=0; G.f.orgFlavor=flavorName||(ORG_FLAVORS[G.f.org]?pick(ORG_FLAVORS[G.f.org]):null);
    G.f.contract=generateContract(G.f,G.f.org,false);
    applyOrgAdvancementBoost(G.f,G.f.org); G.roster=makeOrgRoster(G.f,'PRO_TRANSITION'); if(G.pending)G.pending.proOffer=null; routeAfterOrgChange(); },
  declinePro(){ G.f.proOfferCooldown=G.f._mentorFastTrack?2:3; if(G.pending)G.pending.proOffer=null; routeAfterOrgChange(); },
  negoRenew(){
    G.f.contract=generateContract(G.f,G.f.org,false);
    if(G.pending) G.pending.contractExpiry=false;
    G.lastMsg="Contrat renouvelé (4 combats).";
    if(G.faith){ routeAfterOrgChange(); } else { G.screen=(G.pending&&G.pending.endOfSeason)?'season':'hub'; save(); render(); }
  },
  negoRaise(){
    const f=G.f; const hasAgent=(f.agentCut>0);
    let prob=0.3;
    if(f.champion) prob+=0.5;
    if(hasAgent) prob+=0.25;
    if((f.streak||0)>=2) prob+=0.15;
    if(rnd()<prob){
      G.f.contract=generateContract(f,f.org,true);
      if(G.pending) G.pending.contractExpiry=false;
      G.lastMsg="Coup de poker réussi ! L\u2019organisation s\u2019aligne sur vos exigences (+40%).";
      if(G.faith){ routeAfterOrgChange(); } else { G.screen=(G.pending&&G.pending.endOfSeason)?'season':'hub'; save(); render(); }
    } else {
      G.lastMsg="Négociations rompues. L\u2019organisation refuse vos conditions et vous libère.";
      CL.negoMarket(true);
    }
  },
  negoMarket(forcedPenalty){
    const f=G.f; const offers=[];
    const canUp=canPromote(f); const agentBonus=(f.agentCut>0);
    if(canUp && f.org===4){
      offers.push({org:5,flavor:'Pacific Championship',contract:generateContract(f,5,false),desc:"La ligue la plus prestigieuse. (+4 OVR pour l\u2019opposition)."});
      offers.push({org:6,flavor:'Ultimate Rim',contract:generateContract(f,6,false),desc:"La ligue des millionnaires. Suivi médical de pointe."});
    } else if(canUp && f.org<6){
      const nextOrg=f.org+1;
      offers.push({org:nextOrg,flavor:ORG_FLAVORS[nextOrg]?pick(ORG_FLAVORS[nextOrg]):(ORGS[nextOrg]||'Ligue supérieure'),contract:generateContract(f,nextOrg,false),desc:"La ligue supérieure veut vous signer."});
      if(agentBonus && nextOrg+1<=6 && ((f.defenses||0)>=2 || (f.streak||0)>=6)){
        const fastOrg=nextOrg+1;
        offers.push({org:fastOrg,flavor:ORG_FLAVORS[fastOrg]?pick(ORG_FLAVORS[fastOrg]):(ORGS[fastOrg]||'Ligue supérieure'),contract:generateContract(f,fastOrg,false),desc:"Votre agent a fait jouer ses contacts pour vous faire sauter une étape !"});
      }
    }
    let currentMult=forcedPenalty?0.7:1.1;
    if(agentBonus && forcedPenalty) currentMult=0.9;
    const latContract=generateContract(f,f.org,false);
    latContract.show=+(latContract.show*currentMult).toFixed(2); latContract.win=+(latContract.win*currentMult).toFixed(2);
    offers.push({org:f.org,flavor:ORG_FLAVORS[f.org]?pick(ORG_FLAVORS[f.org]):(ORGS[f.org]||'Concurrence'),contract:latContract,desc:forcedPenalty?"Une ligue concurrente vous repêche au rabais.":"Une ligue concurrente cherche à vous débaucher."});
    if(!forcedPenalty){ offers.push({org:f.org,flavor:orgDisplayName(f),contract:generateContract(f,f.org,false),desc:"Votre organisation actuelle s\u2019aligne pour vous garder."}); }
    G.freeAgencyOffers=offers;
    G.screen='free_agency'; save(); render();
  },
  acceptFreeAgency(index){
    const offer=G.freeAgencyOffers[index]; const isNewOrg=(offer.org!==G.f.org);
    G.f.contract=offer.contract;
    if(isNewOrg){
      G.f.org=offer.org; G.f.orgWins=0; G.f.champion=null; G.f.defenses=0; G.f.rivalId=null;
      G.f.orgElo=eloBaseline(G.f.org,G.f.overall); G.f.rankBoost=0; G.f.orgFlavor=offer.flavor;
      applyOrgAdvancementBoost(G.f,G.f.org);
      G.roster=makeOrgRoster(G.f);
    }
    if(G.pending){ G.pending.contractExpiry=false; }
    G.freeAgencyOffers=null;
    G.lastMsg=`Contrat signé avec ${offer.flavor} !`;
    if(G.faith){ routeAfterOrgChange(); } else { G.screen=(G.pending&&G.pending.endOfSeason)?'season':'hub'; save(); render(); }
  },
  nextSeason(){ G.season.year++; G.season.fights=[]; if(G.pending) G.pending.endOfSeason=false; if(typeof generateNPCNews==='function') generateNPCNews(true); G.screen='hub'; save(); render(); },
  toLegacy(){ if(G.f.skills&&G.f.skills.includes('meta02')){ try{ localStorage.setItem('cage-legacy-mentor-bonus',JSON.stringify({style:G.f.style})); }catch(e){} }
    G.f.retired=true; enshrine(G.f); syncPlayerSkillsToCodex(G.f); G.screen='legacy'; save(); render(); },
  newCareer(){ wipe(); const t=G.theme; G={theme:t,draft:{gender:'H',style:'boxer',country:COUNTRY_KEYS[0],div:DIVISIONS.H[3].id,first:''}}; setTheme(t); CL.go('create'); },
  exportSave(){ try{ const blob=JSON.stringify(G); const ta=document.createElement('textarea'); ta.value=blob; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select();
      try{ document.execCommand('copy'); alert('Sauvegarde copiée — colle-la dans un fichier texte pour la garder.'); }catch(e){ prompt('Copie ce texte :',blob); }
      document.body.removeChild(ta); }catch(e){ alert('Export impossible.'); } },
  importSave(){ const s=prompt('Colle ta sauvegarde ici :'); if(!s)return; try{ G=migrate(JSON.parse(s)); validateState(); setTheme(G.theme||'dark'); G.screen='hub'; save(); render(); }catch(e){ alert('Sauvegarde invalide ou corrompue.'); } },
};
window.CL=CL;
/* ============================ ARÈNE 2D & HYBRIDE ========================== */
/* Rejoue le combat round par round à partir de res.log (maintenant granulaire :
   plusieurs sous-événements textuels par round, momentum, dégâts par zone),
   en cohérence stricte avec le résultat du moteur (même vainqueur, méthode,
   round). Silhouettes dans la DA archive : oxblood = joueur, sage = adversaire.
   res.rounds n'existe pas (le champ réel est res.round, singulier) — corrigé
   ici par rapport au brouillon reçu. */
let ARENA=null;
const BEAT_MS=750; // ralenti pour laisser le temps de lire le flux narratif
function makeNoisePattern(ctx){ try{
  const n=64, c=document.createElement('canvas'); c.width=n; c.height=n;
  const nctx=c.getContext('2d'); const id=nctx.createImageData(n,n);
  for(let i=0;i<id.data.length;i+=4){ const v=Math.random()*255; id.data[i]=v; id.data[i+1]=v; id.data[i+2]=v; id.data[i+3]=16; }
  nctx.putImageData(id,0,0); return ctx.createPattern(c,'repeat');
}catch(e){ return null; } }
function buildTimeline(){
  const res=G.pending.res, you=G.f, opp=G.fight.opp, meWin=G.pending.win;
  const log=(res.log&&res.log.length)?res.log:[];
  const beats=log.map(L=>({phase:L.phase,by:L.by,round:L.r,finish:L.finish,method:L.method,
    text:L.text,momentum:L.momentum,snapA:L.snapA,snapB:L.snapB}));
  if(isDecisionLike(res.method)) beats.push({phase:'bell',finish:true,method:res.method,round:res.round||3,text:'[00:00] Fin du combat. Décision des juges.'});
  ARENA={beats,idx:-1,started:false,done:false,raf:0,to:0,t0:0,lastBeat:-1,
    stMe:100,stOp:100,
    flashMe:0,flashOp:0,shakeMe:0,shakeOp:0,lungeMe:0,lungeOp:0,fall:0,tap:0,method:res.method,meWin,
    currentMomentum:50,snapA:{h:0,b:0,l:0},snapB:{h:0,b:0,l:0},finishZone:res.zone||null,
    nmeName:you.first,nopName:opp.first,meFlag:you.flag,opFlag:opp.flag};
}
function startArena(){ if(!ARENA||ARENA.started)return; ARENA.started=true;
  const cv=document.getElementById('arena-cv');
  if(!cv||!cv.getContext||typeof requestAnimationFrame==='undefined'){ ARENA.done=true; return; } // pas de canvas (test)
  const dpr=Math.min(window.devicePixelRatio||1,2); const W=cv.clientWidth||360, H=220;
  cv.width=W*dpr; cv.height=H*dpr; const ctx=cv.getContext('2d'); ctx.scale(dpr,dpr);
  ARENA.W=W; ARENA.H=H; ARENA.ctx=ctx; ARENA.t0=performance.now(); ARENA.pauseOffset=0; ARENA.roundPause=false;
  ARENA.noise=makeNoisePattern(ctx);
  const total=ARENA.beats.length*BEAT_MS;
  const loop=(now)=>{ if(ARENA.roundPause) return; const el=now-ARENA.t0-ARENA.pauseOffset; const bi=Math.min(ARENA.beats.length-1,Math.floor(el/BEAT_MS));
    if(bi!==ARENA.lastBeat){
      // pause au changement de round (sauf le tout premier beat) — laisse le
      // joueur enchaîner manuellement plutôt qu'un défilement continu.
      // pauseHandledFor évite de redétecter EXACTEMENT le même changement de
      // round à la reprise (sinon nextRound() retombe sur le même bi, revoit
      // le même changement de round, et se re-bloque instantanément : le
      // bouton semblait "ne rien faire").
      const prevRound=ARENA.lastBeat>=0?(ARENA.beats[ARENA.lastBeat].round||1):null;
      const newRound=ARENA.beats[bi].round||1;
      if(prevRound!==null && newRound!==prevRound && !ARENA.beats[bi].finish && bi!==ARENA.pauseHandledFor){
        ARENA.roundPause=true; ARENA.pendingBeatIdx=bi; ARENA.pauseHandledFor=bi; renderArenaOverlay(); return;
      }
      ARENA.lastBeat=bi; applyBeat(ARENA.beats[bi]);
    }
    drawArena((el%BEAT_MS)/BEAT_MS); paintBars();
    if(el>=total){ ARENA.done=true; drawArena(1,true); ARENA.to=setTimeout(()=>CL.toResult(),1300); return; }
    ARENA.raf=requestAnimationFrame(loop); };
  ARENA.loopFn=loop;
  paintBars(); ARENA.raf=requestAnimationFrame(loop);
}
function renderArenaOverlay(){ const el=document.getElementById('ar-log'); if(!el) return;
  const finishedRound=ARENA.beats[ARENA.lastBeat]?(ARENA.beats[ARENA.lastBeat].round||1):1;
  el.innerHTML=`<div style="text-align:center"><b class="gold">Fin du round ${finishedRound}</b><br><button class="btn primary" style="margin-top:8px;padding:8px" onclick="CL.nextRound()">Round suivant ▸</button></div>`;
}
function applyBeat(b){ const A=ARENA; if(!b)return;
  if(b.phase==='bell'){ A.currentText=b.text; return; }
  if(b.by==='me'){ A.flashOp=1; A.shakeOp=1; A.lungeMe=1; }
  else { A.flashMe=1; A.shakeMe=1; A.lungeOp=1; }
  A.stMe=clamp(A.stMe-RI(2,5),12,100); A.stOp=clamp(A.stOp-RI(2,5),12,100);
  if(b.finish){ if(b.method&&b.method.startsWith('KO')){ if(A.meWin){A.fall=2;} else {A.fall=1;} }
    else if(b.method&&b.method.startsWith('Soum')){ A.tap=A.meWin?2:1; }
    if(A.finishZone){ const zoneLetter=A.finishZone==='tête'?'h':A.finishZone==='corps'?'b':'l';
      const loserPrefix=A.meWin?'do':'dm'; A.flashZoneId=`${loserPrefix}-${zoneLetter}`; } }
  A.curPhase=b.phase; A.curTop=(b.phase==='sol')?(b.by==='me'?'me':'op'):null;
  A.currentText=b.text; A.currentMomentum=b.momentum;
  if(b.snapA) A.snapA=b.snapA; if(b.snapB) A.snapB=b.snapB;
}
function fighter(ctx,x,groundY,face,color,o){ // o: {lunge,flash,shake,fallen,grounded,phase,top,tap}
  ctx.save();
  const sh=o.shake?((Math.random()-0.5)*4):0;
  x+=face*(o.lunge*14)+sh;
  const bob=Math.sin(performance.now()/240 + (face>0?0:1))*2;
  if(o.grounded){
    if(!o.top){
      // Sur le dos (garde) — buste allongé, tête décalée, jambes relevées
      ctx.translate(x, groundY-5);
      ctx.fillStyle=o.flash?'#fff':color; ctx.globalAlpha=.95;
      ctx.beginPath(); ctx.ellipse(0,0,30,9,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(-face*25,-2,7,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle=color; ctx.lineWidth=5; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(10,0); ctx.lineTo(0,-20); ctx.lineTo(-face*15,-15); ctx.stroke();
    } else {
      // Au-dessus (dominant) — buste vertical, bras qui contrôle/frappe
      ctx.translate(x-face*8, groundY-22);
      ctx.fillStyle=o.flash?'#fff':color; ctx.strokeStyle=o.flash?'#fff':color;
      ctx.lineWidth=12; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(0,10); ctx.lineTo(0,-15); ctx.stroke();
      ctx.beginPath(); ctx.arc(0,-22,8,0,Math.PI*2); ctx.fill();
      ctx.lineWidth=5;
      ctx.beginPath(); ctx.moveTo(0,-10); ctx.lineTo(face*15,(o.lunge*15)); ctx.stroke();
    }
    if(o.tap){ // halo de danger de soumission, pulsant, sur le combattant en péril
      const pulse=Math.abs(Math.sin(performance.now()/150))*5;
      ctx.beginPath(); ctx.arc(0,-15,20+pulse,0,Math.PI*2);
      ctx.fillStyle='rgba(232,68,47,0.3)'; ctx.fill();
      ctx.strokeStyle='#E8442F'; ctx.lineWidth=2; ctx.stroke();
    }
    ctx.restore(); return;
  }
  ctx.translate(x, groundY-52+bob+(o.fallen?46:0));
  if(o.fallen) ctx.rotate(face*1.3);
  const col=o.flash?'#fff':color;
  ctx.strokeStyle=col; ctx.lineWidth=6; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(-3,4); ctx.lineTo(-10,46); ctx.moveTo(4,4); ctx.lineTo(12,46); ctx.stroke();
  ctx.lineWidth=15; ctx.beginPath(); ctx.moveTo(0,-6); ctx.lineTo(0,26); ctx.stroke();
  ctx.fillStyle=col; ctx.beginPath(); ctx.arc(0,-20,9,0,Math.PI*2); ctx.fill();
  ctx.lineWidth=6;
  const reach=o.lunge;
  // flou de mouvement — traînée du bras avant en pleine frappe
  if(reach>0.1 && !o.fallen){
    for(let i=1;i<=3;i++){
      ctx.globalAlpha=0.25/i;
      const offset=(reach*20)*(i*0.4);
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(face*(10+(reach*20)-offset), -8+(reach*4)); ctx.stroke();
    }
  }
  ctx.globalAlpha=1;
  ctx.beginPath(); ctx.moveTo(0,2); ctx.lineTo(-face*8,-10); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(face*(10+reach*20), -8+reach*4); ctx.stroke();
  ctx.fillStyle=o.flash?'#fff':color; ctx.beginPath(); ctx.arc(face*(10+reach*20),-8+reach*4,4.5,0,Math.PI*2); ctx.fill();
  ctx.restore();
}
/* ==== [ANCRE: LOT12_COSMETIQUE_ARENE] — thèmes visuels de l'octogone. Adapté
   pour s'intégrer à la géométrie réelle de drawArena (8 points, pas la version
   simplifiée du brouillon) — seules les couleurs de sol/rails/poteaux changent,
   la forme reste identique. ==== */
const ARENA_THEMES=[
  {id:'classic',name:'Toile Noire (Classique)',floorColors:['#1c1710','#241d14'],railColor:'#4a3c1f',padColor:'#5C4B2E'},
  {id:'pride',name:'Toile Blanche & Bleue (Héritage)',floorColors:['#DCE2EB','#FFFFFF'],railColor:'#1A4D8F',padColor:'#B22222'},
  {id:'gold',name:'Bâche Royale (Prestige)',floorColors:['#E6B93A','#8A6A1E'],railColor:'#241D13',padColor:'#14100B'},
  {id:'neon',name:'Néons Cyberpunk',floorColors:['#0d0221','#26045c'],railColor:'#ff003c',padColor:'#00f0ff'},
  {id:'underground',name:'Béton Clandestin',floorColors:['#2a2a2a','#1a1a1a'],railColor:'#555555',padColor:'#000000'}
];
function setArenaCosmeticTheme(themeId){ G.arenaCosmetic=themeId; save(); }
function getArenaTheme(){ return ARENA_THEMES.find(t=>t.id===(G.arenaCosmetic||'classic'))||ARENA_THEMES[0]; }
/* ==== [FIN ANCRE] ==== */
function drawArena(frac,freeze){ const A=ARENA, ctx=A.ctx; if(!ctx)return; const W=A.W,H=A.H;
  ctx.clearRect(0,0,W,H);
  const gY=H-16;
  // Octogone agrandi (bord du haut à 84% de la largeur au lieu de 44%
  // auparavant) — occupe désormais la quasi-totalité du canevas, comme
  // demandé sur le schéma annoté.
  const topY=H*0.30, topL=W*0.08, topR=W*0.92;
  // ==== [ANCRE: ECLAIRAGE_GRADINS] — gradins en bande pleine sur toute la
  // largeur du haut (au lieu de petits rectangles cantonnés aux coins),
  // avec projecteur suspendu — pour correspondre au schéma envoyé (zone
  // rouge = gradins occupant tout le bandeau supérieur, zone jaune =
  // octogone agrandi). ====
  const spot=ctx.createRadialGradient(W*0.5,topY*0.3,0,W*0.5,topY*0.3,W*0.7);
  spot.addColorStop(0,'rgba(255,225,170,.34)'); spot.addColorStop(0.5,'rgba(255,225,170,.12)'); spot.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=spot; ctx.fillRect(0,0,W,topY);
  const bleacherRows=6;
  for(let r=0;r<bleacherRows;r++){ const ry=r*(topY/bleacherRows);
    const rh=(topY/bleacherRows)-1;
    ctx.fillStyle=`rgba(58,49,38,${0.55+r*0.06})`;
    ctx.fillRect(0,ry,W,rh);
    // silhouettes/lumières de foule sur chaque rangée
    ctx.fillStyle=`rgba(190,140,105,${0.35+r*0.05})`;
    const dots=14+r*3;
    for(let d=0;d<dots;d++){ const dx=(d/dots)*W+Math.sin(d+r)*3;
      ctx.beginPath(); ctx.arc(dx,ry+rh*0.5,1.6,0,Math.PI*2); ctx.fill(); }
  }
  // ==== [FIN ANCRE] ====
  // Sol en véritable octogone (8 côtés), agrandi pour occuper le canevas
  const botL=W*0.03, botR=W*0.97, gY2=H-6;
  ctx.beginPath();
  ctx.moveTo(botL,H); ctx.lineTo(botR,H); ctx.lineTo(W,gY2); ctx.lineTo(W,gY);
  ctx.lineTo(topR,topY); ctx.lineTo(topL,topY); ctx.lineTo(0,gY); ctx.lineTo(0,gY2);
  ctx.closePath();
  const arenaTheme=getArenaTheme();
  const g=ctx.createLinearGradient(0,topY,0,H); g.addColorStop(0,arenaTheme.floorColors[0]); g.addColorStop(1,arenaTheme.floorColors[1]);
  ctx.fillStyle=g; ctx.fill();
  if(A.noise){ ctx.save(); ctx.clip(); ctx.fillStyle=A.noise; ctx.fillRect(0,0,W,H); ctx.restore(); }
  ctx.strokeStyle='#3a2f20'; ctx.lineWidth=1;
  for(let i=0;i<=8;i++){ const x=i*W/8; ctx.globalAlpha=.5; ctx.beginPath(); ctx.moveTo(x,gY); ctx.lineTo(x*0.86+W*0.05,topY); ctx.stroke(); }
  ctx.globalAlpha=1; ctx.strokeStyle=arenaTheme.railColor; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(botL,H); ctx.lineTo(botR,H); ctx.stroke();      // rail bas
  ctx.beginPath(); ctx.moveTo(topL,topY); ctx.lineTo(topR,topY); ctx.stroke(); // rail haut
  ctx.beginPath(); ctx.moveTo(0,gY); ctx.lineTo(0,gY2); ctx.stroke();          // rail gauche
  ctx.beginPath(); ctx.moveTo(W,gY); ctx.lineTo(W,gY2); ctx.stroke();          // rail droit
  // poteaux d'angle — les 8 sommets de l'octogone
  ctx.fillStyle=arenaTheme.padColor;
  [[botL,H],[botR,H],[W,gY2],[W,gY],[topL,topY],[topR,topY],[0,gY],[0,gY2]].forEach(([px,py])=>{ ctx.fillRect(px-2,py-10,4,20); });
  const grounded=A.curPhase==='sol';
  // contrôle de cage : le momentum (0-100, 50=neutre) décale le centre du duel —
  // au-dessus de 50 le joueur pousse l'adversaire vers son propre mur.
  const mom=(A.currentMomentum!=null?A.currentMomentum:50);
  const shift=grounded?0:clamp((mom-50)/50,-1,1)*(W*0.09);
  let xOp=W*0.68+shift, xMe=W*0.32+shift;
  // au sol : chevauchement plus marqué (12px) pour un vrai rendu de dominance visuelle
  if(grounded){ const center=W*0.5+shift; xOp=center+(A.curTop==='op'?12:-12); xMe=center+(A.curTop==='me'?-12:12); }
  const isSubDanger=grounded && A.currentText && (A.currentText.includes('soum')||A.currentText.includes('clé')||A.currentText.includes('étrangl'));
  fighter(ctx, xOp, gY, -1, '#6E8478', {lunge:A.lungeOp*(1-frac),flash:A.flashOp>0,shake:A.shakeOp>0,fallen:A.fall===2,grounded,phase:A.curPhase,top:A.curTop==='op',tap:isSubDanger&&A.curTop!=='op'});
  fighter(ctx, xMe, gY, 1, '#B23B36', {lunge:A.lungeMe*(1-frac),flash:A.flashMe>0,shake:A.shakeMe>0,fallen:A.fall===1,grounded,phase:A.curPhase,top:A.curTop==='me',tap:isSubDanger&&A.curTop!=='me'});
  if(isSubDanger && !A.done){ ctx.save(); ctx.textAlign='center'; ctx.fillStyle='#E8442F'; ctx.font="700 12px 'Oswald'"; ctx.fillText('⚠ DANGER SOUMISSION',W/2,H*0.45); ctx.restore(); }
  A.flashMe=Math.max(0,A.flashMe-0.5); A.flashOp=Math.max(0,A.flashOp-0.5);
  A.shakeMe=Math.max(0,A.shakeMe-0.5); A.shakeOp=Math.max(0,A.shakeOp-0.5);
  A.lungeMe*=0.86; A.lungeOp*=0.86;
  // vignette — profondeur de "fiche imprimée", jamais un aplat plat
  const vg=ctx.createRadialGradient(W/2,H*0.55,H*0.25,W/2,H*0.55,Math.max(W,H)*0.62);
  vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,.38)');
  ctx.fillStyle=vg; ctx.fillRect(0,0,W,H);
  ctx.font="600 11px 'JetBrains Mono',monospace"; ctx.textAlign='center'; ctx.fillStyle='#9A8F7C';
  const rnd=A.beats[A.lastBeat]?A.beats[A.lastBeat].round:1;
  let label = A.curPhase==='sol'?'SOL':(A.curPhase==='clinch'?'CLINCH':'DEBOUT');
  if(A.done){ label = A.method==='Égalité'?'ÉGALITÉ':isDecisionLike(A.method)?'AUX POINTS':(A.method.startsWith('KO')?'KO / TKO':'SOUMISSION'); ctx.fillStyle='#C6A15B'; ctx.font="700 14px 'Oswald'"; }
  ctx.fillText(A.done?label:('ROUND '+rnd+' · '+label), W/2, 20);
  if(A.tap){ ctx.fillStyle='#C6A15B'; ctx.font="700 13px 'Oswald'"; ctx.fillText('TAP !', A.tap===1?W*0.34:W*0.66, gY-70); }
}
function stopArena(){ if(ARENA){ if(ARENA.raf&&typeof cancelAnimationFrame!=='undefined')cancelAnimationFrame(ARENA.raf); if(ARENA.to)clearTimeout(ARENA.to); } }
function scr_arena(){ const A=ARENA||{};
  return `<div class="fade">
   <div class="eyebrow center" style="margin-bottom:12px;font-size:12px;color:var(--text)">${esc(A.nmeName||'')} ${A.meFlag||''} VS ${A.opFlag||''} ${esc(A.nopName||'')}</div>
   <div class="card glass raise" style="padding:12px;border-color:var(--line);background:var(--panel2)">
     <div class="eyebrow center" style="font-size:9px;margin-bottom:6px">DOMINATION TERRITORIALE</div>
     <div style="height:6px;background:var(--sage);margin-bottom:20px;position:relative;overflow:hidden;border-radius:2px">
       <div id="ar-momentum" style="height:100%;width:50%;background:var(--blood);transition:width .4s ease"></div>
       <div style="position:absolute;left:50%;top:0;bottom:0;width:1px;background:var(--bg)"></div>
     </div>
     <div class="arena-hud" style="border-bottom:1px dashed var(--line);padding-bottom:16px;display:flex;justify-content:space-between">
       <div style="display:flex;flex-direction:column;align-items:flex-start">
         <span class="ah-name blood mono" style="font-size:13px">${esc(A.nmeName||'Toi')}</span>
         <div style="display:flex;flex-direction:column;gap:5px;margin-top:8px">
           <div style="display:flex;align-items:center;gap:6px"><span class="mono" style="font-size:10px;color:var(--muted);width:44px">Tête</span><div id="dm-h" style="width:16px;height:4px;background:var(--sage);transition:background .3s"></div></div>
           <div style="display:flex;align-items:center;gap:6px"><span class="mono" style="font-size:10px;color:var(--muted);width:44px">Corps</span><div id="dm-b" style="width:16px;height:4px;background:var(--sage);transition:background .3s"></div></div>
           <div style="display:flex;align-items:center;gap:6px"><span class="mono" style="font-size:10px;color:var(--muted);width:44px">Jambes</span><div id="dm-l" style="width:16px;height:4px;background:var(--sage);transition:background .3s"></div></div>
         </div>
       </div>
       <div style="display:flex;flex-direction:column;align-items:flex-end">
         <span class="ah-name sage mono" style="font-size:13px">${esc(A.nopName||'Adv.')}</span>
         <div style="display:flex;flex-direction:column;gap:5px;margin-top:8px;align-items:flex-end">
           <div style="display:flex;align-items:center;gap:6px"><div id="do-h" style="width:16px;height:4px;background:var(--sage);transition:background .3s"></div><span class="mono" style="font-size:10px;color:var(--muted);width:44px;text-align:right">Tête</span></div>
           <div style="display:flex;align-items:center;gap:6px"><div id="do-b" style="width:16px;height:4px;background:var(--sage);transition:background .3s"></div><span class="mono" style="font-size:10px;color:var(--muted);width:44px;text-align:right">Corps</span></div>
           <div style="display:flex;align-items:center;gap:6px"><div id="do-l" style="width:16px;height:4px;background:var(--sage);transition:background .3s"></div><span class="mono" style="font-size:10px;color:var(--muted);width:44px;text-align:right">Jambes</span></div>
         </div>
       </div>
     </div>
     <canvas id="arena-cv" style="width:100%;height:220px;display:block;margin-top:16px;border:1px solid var(--line);background:var(--bg)"></canvas>
     <div class="arena-st" style="margin-top:16px"><div class="st-lbl">CARDIO</div><div class="st-lbl" style="text-align:right">CARDIO</div></div>
     <div class="arena-bars sm" style="margin-top:6px"><div class="ab" style="background:var(--bg);border-color:var(--line)"><div class="ab-fill st" id="st-me" style="background:var(--gold)"></div></div><div class="ab" style="background:var(--bg);border-color:var(--line)"><div class="ab-fill st" id="st-op" style="background:var(--gold)"></div></div></div>
     <div id="ar-log" class="mono muted small" style="margin-top:20px;min-height:48px;display:flex;flex-direction:column;justify-content:flex-end;border-left:3px solid var(--gold);padding-left:12px;line-height:1.4;padding-bottom:4px"></div>
   </div>
   <button class="btn ghost mt" style="border:1px solid var(--line)" onclick="CL.skipArena()">Couper la transmission vidéo ▸</button>
  </div>`; }
/* mise à jour des barres HTML (plus de HP globaux) + momentum + points de dégâts par zone + terminal texte, à chaque frame */
function paintBars(){ if(!ARENA)return; const set=(id,v)=>{const e=document.getElementById(id); if(e)e.style.width=clamp(v,0,100)+'%';};
  set('st-me',ARENA.stMe); set('st-op',ARENA.stOp);
  if(ARENA.currentMomentum!==undefined) set('ar-momentum',ARENA.currentMomentum);
  const zoneColor=v=>v>28?'var(--blood)':v>14?'var(--gold)':'var(--sage)';
  const setZone=(id,v)=>{ const e=document.getElementById(id); if(e)e.style.background=zoneColor(v); };
  if(ARENA.snapA){ setZone('dm-h',ARENA.snapA.h); setZone('dm-b',ARENA.snapA.b); setZone('dm-l',ARENA.snapA.l); }
  if(ARENA.snapB){ setZone('do-h',ARENA.snapB.h); setZone('do-b',ARENA.snapB.b); setZone('do-l',ARENA.snapB.l); }
  if(ARENA.flashZoneId){ const e=document.getElementById(ARENA.flashZoneId); if(e){ e.style.background='var(--blood)'; e.style.boxShadow='0 0 6px var(--blood)'; } }
  const logEl=document.getElementById('ar-log');
  if(logEl && ARENA.currentText && logEl.getAttribute('data-last')!==ARENA.currentText){
    logEl.innerHTML=`<div style="animation:fade .3s ease;color:var(--text)">${ARENA.currentText}</div>`;
    logEl.setAttribute('data-last',ARENA.currentText);
  }
}
