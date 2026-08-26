"use strict";
/* CAGE LEGACY — js/ui-04-faith-arcade-screens.js
   ============================================================================
   Fichier 4/8 issu du découpage de l'ancien ui.js monolithique (~400 Ko).
   Écrans du mode MMA Faith (création, vestiaire, événements de vie, bilan annuel) et écrans du mode Arcade (draft, game over, hub arcade, améliorations).

   IMPORTANT : ce découpage préserve l'ORDRE EXACT du code d'origine — aucune
   fonction n'a été déplacée ou réordonnée, seules des frontières de fichier
   ont été insérées à des points sûrs (toujours juste avant une déclaration de
   premier niveau, jamais au milieu d'une fonction ou d'un objet). Tous ces
   fichiers partagent la même portée globale que l'ancien ui.js (variables et
   fonctions visibles d'un fichier à l'autre, comme avant), il faut donc les
   charger dans l'ordre indiqué dans index.html : 01, 02, 03... jusqu'à 08.
   ============================================================================ */

/* ==== [ANCRE: DATA_FAITH_SPLIT_V3] — Plan V3 LOT 0 §0.2 : le corpus texte
   pur (FAITH_BUILDUP_EVENTS, FAITH_LIFE_EVENTS, FAITH_BRANCH_EVENTS,
   FAITH_PRESSE_*, FAITH_CAMPS, FAITH_INTERSAISON_POOL, FAITH_PERK_OFFERS,
   FAITH_DRAFT_PAGES/OPTIONS, FAITH_DIVISION_TEXT, FAITH_GALA_*, FAITH_OATHS)
   a été déplacé dans data-faith-content.js, et le registre humain
   (FAITH_AGENTS, FAITH_DIRECTORS, FAITH_DIRECTOR_REFUS,
   FAITH_GYM_NEWCOMER_NICKS, FAITH_JOURNALIST_NAMES) dans data-people.js —
   chargés avant ce fichier (index.html), mêmes noms de constantes, aucune
   réécriture. Ce fichier ne garde que les FONCTIONS d'écran Faith/Arcade.
   ==== */


/* ==== [ANCRE: FAITH_CREATION_SEQUENTIELLE] — la création tenait sur un seul
   écran de seize options simultanées. À ce nombre, on ne compare plus : on
   abandonne et on clique. Une question par écran, trois à quatre réponses,
   et le joueur lit vraiment.
   Deux règles tenues ici :
   - aucun delta chiffré n'est montré. Les descriptions annonçaient
     « (+IQ, +Discipline) » : une origine doit se choisir pour ce qu'elle
     raconte, pas pour son bonus ;
   - les choix doivent ouvrir du CONTENU, pas seulement additionner des
     points. finalizeFaithDraft consommait origine, cercle et hygiène de vie
     puis les jetait ; ils sont désormais conservés sur le combattant
     (f._origin, f._circle, f._lifestyle) pour que des événements puissent
     s'y brancher via le champ `req` déjà supporté par le pool. ==== */
/* ==== [CORRECTIF FA-16] — descriptions par ce qu'elles racontent, jamais
   par leurs stats (même règle que le reste de la création, cf.
   FAITH_CREATION_SEQUENTIELLE) : chaque catégorie nomme un rapport de force
   dans le sport, pas une fourchette de kilos. Les noms/tailles/allonges
   réels restent ceux de DIVISIONS (engine.js) — seul le texte est ajouté
   ici, la rendu (scr_faith_draft) les combine. */
/* ==== [ANCRE: FAITH_VOCAB_MMA] — FA-17 : la structure de ces questions
   (origine/milieu/adolescence/entourage/image) est une transposition directe
   d'un mode carrière footballistique, et les descriptions en gardaient le
   vocabulaire (statut social, argent, image). Règle d'écriture tenue ici :
   une description ne dit jamais ce qu'elle donne (les bonus restent dans
   finalizeFaithDraft), elle dit ce que ça a fait au corps ou aux habitudes
   de combattant. ==== */
/* ==== [ANCRE: FAITH_AGENT] — commission (cut, appliquée par la déduction de
   bourse déjà en place, ui-05) et style de matchmaking par agent. Consultée
   à la création (finalizeFaithDraft, ui-08) et à chaque offre de combat
   (faithGenerateOffer, ui-08). ==== */
/* ==== [ANCRE: FAITH_CALENDRIER] — un an = 12 mois plutôt que 5 temps fixes,
   pour absorber un nombre VARIABLE de combats (FA-10) : à 1 combat/an fixe,
   un contrat de 4 combats durait mécaniquement 4 à 6 ans (cf. FA-04 —
   engine.js:1297, fightsLeft = 4 à 6) et la "Dernière danse" ne pesait plus
   rien. La logique du sport réel (on combat souvent en bas, rarement en
   haut) produit gratuitement une courbe de progression ressentie : le
   joueur constate son rythme ralentir en montant, sans qu'aucun texte n'ait
   à le dire. ==== */
/* ==== [ANCRE: V4_RYTHME_HORLOGE_UNIQUE] — Plan V4 C1, recette §3 : une fois
   l'horloge Faith unifiée (V3_HORLOGE_UNIQUE), la carrière dure ses 19
   vraies saisons au lieu de 10 — aux anciens chiffres (jusqu'à 4
   combats/an), le total grimpait à 43-61 combats sur 5 carrières simulées,
   au-dessus de la cible 25-40. Rythme revu à la baisse, jamais la
   vieillesse : mêmes paliers par organisation, environ moitié moins par
   saison. ==== */
function faithFightsPlanned(f){
  if(f.injury) return 0;
  if((f.form||100)<30) return 1;
  if(f.champion) return 1;
  if(f.org<=1) return 2;
  if(f.org<=3) return 2;
  if(f.org===4) return RI(1,2);
  return 1;
}
/** Répartit n mois-combat sur un calendrier de 12, aussi régulièrement que
 * possible (jamais deux collés si évitable).
 * @param {number} n @returns {number[]} indices de mois (0-11) */
function faithSpreadMonths(n){
  if(n<=0) return [];
  const months=[];
  for(let i=0;i<n;i++){
    let m=Math.round((i+0.5)*12/n)%12;
    while(months.includes(m)) m=(m+1)%12;
    months.push(m);
  }
  return months;
}
/** Calendrier annuel : N mois-combat (FA-10), 2-3 mois-vie, 1 mois
 * intersaison, le reste vide (traversé automatiquement par
 * faithAdvanceMonth(), ui-08).
 * @param {object} f @returns {{type:?string}[]} 12 entrées */
function faithGenerateCalendar(f){
  const cal=new Array(12).fill(null).map(()=>({type:null}));
  faithSpreadMonths(faithFightsPlanned(f)).forEach(m=>{ cal[m]={type:'fight'}; });
  let vieLeft=RI(2,3), tries=0;
  while(vieLeft>0 && tries<80){
    const m=Math.floor(rnd()*12);
    if(!cal[m].type){ cal[m]={type:'vie'}; vieLeft--; }
    tries++;
  }
  tries=0;
  while(tries<80){
    const m=Math.floor(rnd()*12);
    if(!cal[m].type){ cal[m]={type:'intersaison'}; break; }
    tries++;
  }
  return cal;
}
/** Barre de calendrier : douze mois plutôt que cinq segments fixes, pour
 * montrer la FORME de l'année entière au premier regard — "il me reste deux
 * combats et un mois creux". Une séquence dont on voit la fin donne envie
 * de la finir ce soir (effet Zeigarnik appliqué à l'année, pas au tour).
 * @param {object} F G.faith @returns {string} */
function faithCalendarBar(F){
  const cal=F.calendar||[], cur=F.month||0;
  const MOIS=['JANV','FÉVR','MARS','AVR','MAI','JUIN','JUIL','AOÛT','SEPT','OCT','NOV','DÉC'];
  return `<div style="margin:12px 0 20px">
    <div style="display:flex;gap:3px">${cal.map((c,i)=>{
      const passe=i<cur, actif=i===cur;
      return `<span style="position:relative;flex:1;height:3px;background:${passe?'var(--f-red-hi)':actif?'var(--text)':'transparent'};${passe||actif?'':'border-top:1px solid var(--line)'}">${c.type==='fight'?`<span style="position:absolute;top:-3px;left:50%;transform:translateX(-50%);width:5px;height:5px;border-radius:50%;background:var(--f-red-hi)"></span>`:''}</span>`;
    }).join('')}</div>
    <div class="eyebrow" style="font-size:11px;margin-top:8px">${MOIS[cur]||MOIS[11]} — SAISON ${F.year}</div>
  </div>`;
}
/* ==== [ANCRE: FAITH_GALA] — ORGS (engine.js:1172) est une échelle de 7
   paliers de prestige sans identité propre : combattre à "l'Ultimate Rim
   (Argent)" ne ressemble à rien de particulier. Un gala nommé et daté rend
   la même montée hiérarchique PHYSIQUE plutôt que lue : "j'ouvrais les
   prélims il y a trois ans, ce soir je ferme le gala". Les préfixes
   reprennent les noms d'ORGS eux-mêmes (Ultimate Rim -> URC, Pacific
   Championship -> PCF), jamais inventés à côté. ==== */
/* ==== [ANCRE: V2-19] — un directeur nommé par organisation (sept paliers,
   ORGS/FAITH_GALA_PREFIX, engine.js/ui-04), persistant sur toute la
   carrière. `grants`/`refuses`/`counter` sont lus par faithNegotiate*()
   (ui-08) — jamais affichés tels quels, seulement leur EFFET. La mémoire
   (G.faith.directors[org].trust, -3 à +3) n'est jamais chiffrée à
   l'écran (règle H.1) : seule une phrase qualitative (faithDirectorMood,
   plus bas) la traduit. ==== */
/** Humeur qualitative du directeur envers le joueur — jamais un chiffre.
 * @param {number} org @returns {string} */
function faithDirectorMood(org){
  const t=(G.faith.directors&&G.faith.directors[org]&&G.faith.directors[org].trust)||0;
  if(t>=2) return 'il vous doit tout';
  if(t>=1) return 'il vous suit';
  if(t<=-2) return 'il vous évite';
  if(t<=-1) return 'il se méfie';
  return 'il vous tolère';
}
/** Ajuste la mémoire du directeur d'une organisation (jamais affichée en
 * chiffre — seule faithDirectorMood() la traduit).
 * @param {number} org @param {number} dv */
function faithDirectorAdjust(org,dv){
  if(!G.faith.directors) G.faith.directors={};
  if(!G.faith.directors[org]) G.faith.directors[org]={trust:0};
  G.faith.directors[org].trust=clamp(G.faith.directors[org].trust+dv,-3,3);
}
/** Le profil du fighter correspond-il à ce que cet archétype de directeur
 * accorde volontiers (FAITH_DIRECTORS.grants) ? Dérivé de signaux déjà
 * suivis (personnalité, âge, palmarès de finition, régularité de série),
 * jamais d'un nouveau champ dédié.
 * @param {object} dir entrée de FAITH_DIRECTORS @param {object} f */
function faithDirectorFavorable(dir,f){
  switch(dir.archetype){
    case 'comptable': return (f.earnings||0)>=100;
    case 'showman': return f.personality==='showman'||f.personality==='villain';
    case 'loyaliste': return (f.age||18)>=28;
    case 'ancien': return ((f.ko||0)+(f.sub||0))>=Math.max(3,Math.round((f.W||0)*0.4));
    case 'technocrate': return Math.abs(f.streak||0)<=3;
    case 'patriarche': return f.personality==='humble';
    default: return false; // le Requin n'est "favorable" au sens classique pour personne
  }
}
function faithDirectorRefusalLine(dir){ return FAITH_DIRECTOR_REFUS[dir.archetype]||'Non.'; }
/** Motif contextuel de la demande "un meilleur adversaire" (V2-18) —
 * un seul, choisi selon le contexte réel plutôt qu'un choix vide sans
 * raison. @param {object} f @param {object} o l'adversaire proposé
 * @returns {string} */
function faithDemandMotif(f,o){
  if(f.injury) return 'Je reviens de blessure, pas contre lui.';
  if((o.W+o.L+(o.D||0))===0 && (f.W+f.L+(f.D||0))>0) return "Il n'est pas classé, ça ne me fait pas monter.";
  if((f.streak||0)>=2) return 'Je veux un classé, je suis prêt.';
  return 'Ce n’est pas lui que je veux affronter.';
}
/** Position sur la carte : prélims/carte principale/main event, chacune sa
 * bourse, sa hype, et son effet. Le rang bas (débutant) tombe naturellement
 * dans "rang > 12" — pas besoin d'un second critère "peu de combats dans
 * l'org" pour l'attraper.
 * @param {object} f @returns {{tier:string,mult:number,hype:string,rounds:number}} */
function faithGalaPosition(f){
  /* ==== [CORRECTIF V2-24 point 4] — le circuit amateur (org 0) n'a ni
     hype ni conférence de presse : un gala amateur à Lyon n'a pas de main
     event médiatisé, même si un rivalId ou un rang bas s'est déjà formé à
     ce niveau (ex. via la némésis, verrouillable dès l'amateur — V2-26).
     Verrouillé avant toute autre condition, pas juste en dernier recours. */
  if((f.org||0)===0) return {tier:'Circuit amateur',mult:0.6,hype:'nulle',rounds:3,pressConf:false};
  const rk=divRank(f);
  if(rk<=4 || f.champion || f.rivalId) return {tier:'Main event',mult:2,hype:'forte',rounds:5,pressConf:true};
  if(rk<=12) return {tier:'Carte principale',mult:1,hype:'moyenne',rounds:3,pressConf:false};
  return {tier:'Préliminaires',mult:0.6,hype:'faible',rounds:3,pressConf:false};
}
/* ==== [ANCRE: V3_REGIONAL_CEILING_GUARD] — Plan V3 LOT 6 §5.6.3 point 3 :
   condition réelle avant de proposer "Le plafond régional" (data-faith-
   content.js, evt_br_regional_ceiling) — un plancher de combats (l'ancien
   comportement pouvait se déclencher dès 6 victoires, cité tel quel par le
   joueur comme absurde) ET un ratio d'adversaires du roster ACTUEL déjà
   battus, pas un compteur brut qui ne dit rien du contenu réel de ces
   victoires. */
function faithRegionalCeilingEligible(f){
  if(((f.W||0)+(f.L||0))<12) return false;
  const beatenIds=new Set((f.history||[]).filter(h=>h.res==='win' && h.oppId).map(h=>h.oppId));
  const roster=(typeof G!=='undefined'&&G&&G.roster)||[];
  if(!roster.length) return beatenIds.size>=8;
  const beatenRatio=roster.filter(o=>beatenIds.has(o.id)).length/roster.length;
  return beatenRatio>=0.5 || beatenIds.size>=8;
}
/* ==== [FIN ANCRE] ==== */
/** Nom et lieu du gala — déterministe par année+mois pour ne pas changer si
 * l'écran est réaffiché sans qu'un mois ne s'écoule.
 * @param {object} F G.faith @param {object} f */
function faithGalaLabel(F,f){
  const seed=(F.year||2026)*13+(F.month||0)*7+(f.org||0);
  const prefix=FAITH_GALA_PREFIX[f.org]||FAITH_GALA_PREFIX[0];
  const num=((seed*17)%89)+1;
  const city=FAITH_GALA_CITIES[seed%FAITH_GALA_CITIES.length];
  return `${prefix} ${num} — ${city}`;
}
/* ==== [ANCRE: V3_GALA_VENUE_INFO] — Plan V3 LOT 6 §P09 point 2/3 : "bandeau
   de carte" (salle, affluence, audience) et "le public existe" (domicile ou
   pas). Même seed que faithGalaLabel ci-dessus (déterministe tant que
   année+mois+org ne changent pas) pour ne jamais désynchroniser les deux
   affichages d'un même gala. L'affluence/audience suivent gala.mult (déjà
   la mesure d'enjeu existante, faithGalaPosition) plutôt qu'un second
   barème inventé.
   @param {object} F @param {object} f @param {object} gala faithGalaPosition(f)
   @returns {{city:string,venue:string,home:boolean,attendance:number,audienceM:number}} */
function faithGalaVenueInfo(F,f,gala){
  const seed=(F.year||2026)*13+(F.month||0)*7+(f.org||0);
  const city=FAITH_GALA_CITIES[seed%FAITH_GALA_CITIES.length];
  const venue=FAITH_GALA_VENUES[city]||city;
  const home=!!(FAITH_GALA_CITY_COUNTRY[city] && f.countryKey===FAITH_GALA_CITY_COUNTRY[city]);
  const mult=(gala&&gala.mult)||0.6;
  const attendance=Math.round(1800+mult*7200+(seed%700));
  const audienceM=Math.round((0.4+mult*2.8+(seed%40)/100)*10)/10;
  return {city,venue,home,attendance,audienceM};
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: FAITH_NEGOCIATION / V2-20] — le pouvoir de négociation n'est
   jamais chiffré à l'écran (cf. règle H.1 : un écran ne montre jamais un
   nombre qu'une phrase peut porter), seulement son EFFET. Dérivé de
   données déjà existantes : série en cours, rang, hype, personnalité
   (villain négocie mieux — enfin une conséquence mécanique du choix de
   création). Renommée faithLeverage() (V2-20) : "sans levier, l'option
   n'existe pas" — un score à 0 retire purement et simplement le bouton
   "Demander plus d'argent" de l'écran d'offre (scr_faith_offer, ce
   fichier), remplacé par la raison. `F.buildup.attente` (hype accumulée
   DEPUIS l'annonce du combat, Lot E — Batch 5) s'y ajoutera quand ce
   système existera ; en attendant, faithLeverage ne perd rien de ce
   qu'avait faithNegotiationPower. ==== */
function faithLeverage(f,F){
  let score=0;
  if((f.streak||0)>=2) score++;
  if(divRank(f)<=15) score++;
  if((f.hypeBonus||1)>1.2) score++;
  if(f.personality==='villain') score++;
  if(F && F.buildup && F.buildup.attente>=2) score++;
  return score;
}
function faithDraftPortrait(d){
  const nom=(d.first||'').trim()||'Un combattant';
  const pays=d.country&&COUNTRIES[d.country]?COUNTRIES[d.country].name:'';
  const divName=d.div&&divById(d.div)?divById(d.div).name.toLowerCase():'';
  const org={traditional:'sorti d’un dojo',pro_child:'né dans le métier',street:'sorti du bitume',late_bloomer:'venu tard au sport'}[d.origin]||'';
  const vie={pro:'discipliné',balanced:'équilibré',party:'insouciant'}[d.lifestyle]||'';
  const cer={family:'entouré des siens',agent:'piloté par un agent',squad:'entouré de sa bande'}[d.circle]||'';
  const ag={requin:'représenté par un requin',stratege:'représenté par un stratège',fidele:'représenté par un fidèle'}[d.agent]||'';
  const per={villain:'qui parle fort',humble:'qui parle peu',showman:'qui vend le spectacle'}[d.personality]||'';
  const ecu={regional:'et qui signe dans une salle régionale',elite:'et qui signe dans un camp d’élite'}[d.stable]||'';
  return [nom+(pays?`, ${pays}`:''),divName?`en ${divName}`:'',org,vie,cer,ag,per,ecu].filter(Boolean).join(', ')+'.';
}
function scr_faith_draft(){
  const d=G.faithDraft||(G.faithDraft={gender:'H',country:COUNTRY_KEYS[0],first:''});
  const page=clamp(d.page||0,0,FAITH_DRAFT_PAGES.length-1);
  const cur=FAITH_DRAFT_PAGES[page];
  const points=FAITH_DRAFT_PAGES.map((_,i)=>`<span style="width:6px;height:6px;border-radius:50%;background:${i===page?'var(--text)':i<page?'var(--f-red-hi)':'var(--line)'}"></span>`).join('');
  let corps='';
  if(page===0){
    corps=`<div class="fld" style="text-align:left"><label>Genre</label><div class="pills">
        <span class="pill ${(d.gender||'H')==='H'?'on':''}" onclick="CL.selectFaithDraft('gender','H')">Homme</span>
        <span class="pill ${d.gender==='F'?'on':''}" onclick="CL.selectFaithDraft('gender','F')">Femme</span></div></div>
      <div class="fld" style="text-align:left"><label>Prénom</label><input id="fdn" maxlength="18" value="${esc(d.first||'')}" placeholder="Prénom" oninput="CL.faithDraftIn('first',this.value)"></div>
      <div class="fld" style="text-align:left"><label>Pays</label><div class="pills">${COUNTRY_KEYS.map(c=>`<span class="pill ${d.country===c?'on':''}" onclick="CL.selectFaithDraft('country','${c}')">${COUNTRIES[c].flag} ${COUNTRIES[c].name}</span>`).join('')}</div></div>`;
  } else if(cur.key==='div'){
    /* ==== [CORRECTIF FA-16] — options dépendantes du genre (page 0), donc
       hors du format plat [val,titre,desc] des autres questions. ==== */
    corps=(DIVISIONS[d.gender||'H']||[]).map(dv=>`
      <div class="opp" style="padding:16px;min-height:88px;text-align:left;${d.div===dv.id?'border-left:3px solid var(--f-red-hi);':''}" onclick="CL.selectFaithDraft('div','${dv.id}')">
        <div class="hero-name" style="font-size:17px">${dv.name}</div>
        <div class="muted" style="font-size:13px;line-height:1.45;margin-top:6px">${(FAITH_DIVISION_TEXT[d.gender||'H']||{})[dv.id]||''}</div>
      </div>`).join('');
  } else if(cur.key){
    /* ==== [CORRECTIF FA-18] — `field` (par défaut = `key`) porte le nom du
       champ réellement écrit sur G.faithDraft ; nécessaire quand plusieurs
       pages (style_stand/style_ground) renseignent le même champ (style). ==== */
    const champ=cur.field||cur.key;
    corps=(FAITH_DRAFT_OPTIONS[cur.key]||[]).map(([val,titre,desc])=>`
      <div class="opp" style="padding:16px;min-height:88px;text-align:left;${d[champ]===val?'border-left:3px solid var(--f-red-hi);':''}" onclick="CL.selectFaithDraft('${champ}','${val}')">
        <div class="hero-name" style="font-size:17px">${titre}</div>
        <div class="muted" style="font-size:13px;line-height:1.45;margin-top:6px">${desc}</div>
      </div>`).join('');
  } else {
    corps=`<p style="font-size:17px;line-height:1.5">${esc(faithDraftPortrait(d))}</p>`;
  }
  const pret=page===0?true:(cur.key?!!d[cur.field||cur.key]:true);
  const dernier=page===FAITH_DRAFT_PAGES.length-1;
  return `<div class="scr" style="max-width:560px;margin:0 auto">
    <div class="eyebrow" style="font-size:12px;letter-spacing:.14em">${cur.q}</div>
    <div style="display:flex;flex-direction:column;gap:12px">${corps}</div>
    ${dernier
      ? `<button class="btn primary" style="width:100%;height:56px;font-size:16px" onclick="CL.offerFaithOaths()">COMMENCER</button>`
      : `<button class="btn primary" style="width:100%;height:56px;font-size:16px" onclick="CL.faithDraftPage(1)" ${pret?'':'disabled'}>${pret?'Continuer':'Faites un choix'}</button>`}
    <div style="display:flex;gap:8px;justify-content:center;align-items:center">${points}</div>
    <button class="btn ghost" onclick="${page===0?"CL.go('title')":'CL.faithDraftPage(-1)'}">${page===0?'Retour au menu':'Revenir en arrière'}</button>
  </div>`;
}

/* ==== [ANCRE: FAITH_CINQ_TEMPS] — l'année passait par « 1 événement + 1 menu
   de gestion + 1 combat » : 90 % gestion, 10 % narration. Elle est désormais
   rythmée par les décisions — deux événements de vie au lieu d'un, et le
   menu d'achats disparaît en tant que menu (cf. FAITH_OFFRES_TENTATION).
   ==== [REMPLACÉ PAR FA-11] — les cinq temps fixes ne pouvaient absorber
   qu'un seul combat par an (cf. FA-10/FA-04 : un contrat de 4 combats durait
   alors 4 à 6 ANNÉES). Remplacés par un calendrier de 12 mois généré par
   faithGenerateCalendar() (FAITH_CALENDRIER, ci-dessus dans ce fichier) et
   rendu par faithCalendarBar() — même principe de progression spatiale
   qu'ici, mais un nombre de segments qui reflète VRAIMENT ce qui reste à
   traverser cette année, variable d'une saison à l'autre. ==== */
/* ==== [ANCRE: FAITH_HUB_GRILLE] — le bandeau du haut n'affichait jamais le
   même nombre de blocs (2 en flex, 3 quand un contrat était actif), et les
   jauges FORME/MORAL vivaient dans un second bloc séparé plus bas : la
   composition entière du hub changeait de forme d'une saison à l'autre.
   Miller/Cowan (limite de la mémoire de travail, ~4±1 éléments tenus à la
   fois) plaide pour un nombre de blocs FIXE et prévisible plutôt que
   variable — la grille 2×3 ci-dessous ne bouge jamais, quel que soit l'état
   du contrat. Le contrat, qui n'est pas un état du combattant mais une
   relation contractuelle, rejoint une ligne de contexte sous son nom
   plutôt que de continuer à faire varier le nombre de cases. ==== */
function faithHubNumCell(lbl,val,color){
  return `<div class="glass" style="text-align:center;padding:8px 0;min-height:auto">
    <b class="mono" style="font-size:14px;${color?`color:${color}`:''}">${val}</b>
    <div class="stat-lbl" style="margin-top:2px;font-size:9px">${lbl}</div></div>`;
}
function faithHubGaugeCell(lbl,val){
  return `<div class="glass" style="text-align:center;padding:8px 6px;min-height:auto">
    <b class="mono" style="font-size:13px">${d20(val)}</b>
    <div class="gauge2" style="background:var(--line);height:4px;margin-top:5px;overflow:hidden">
      <span style="display:block;height:100%;width:${clamp(val,0,100)}%;background:var(--text)"></span></div>
    <div class="stat-lbl" style="margin-top:4px;font-size:9px">${lbl}</div></div>`;
}
function faithHubGrid(f){
  const fightsTot=(f.W||0)+(f.L||0)+(f.D||0);
  const rank=f.champion?'CHAMPION':(fightsTot===0?'NC':'#'+divRank(f));
  return `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
    ${faithHubNumCell('ÂGE',f.age)}
    ${faithHubNumCell('OVR',f.overall)}
    ${faithHubNumCell('RANG',rank,f.champion?'var(--gold)':null)}
    ${faithHubNumCell('GAINS',formatArgent(f.earnings))}
    ${faithHubGaugeCell('FORME',f.form)}
    ${faithHubGaugeCell('MORAL',f.morale)}
  </div>`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: FAITH_ECURIE_RENOUVELEE] — surnoms des nouveaux venus qui
   rejoignent l'écurie quand elle descend sous 2 partenaires (nextFaithYear,
   ui-08) — distincts des deux surnoms de départ ("Le Prodige", "L'Aspirant",
   FAITH_ECURIE_DEPART) pour qu'un renouvellement ne se lise pas comme une
   simple réapparition du même personnage. ==== */
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: FAITH_PROTEGE_VISIBLE] — le Syndrome de Frankenstein est le
   meilleur système du mode, et il était invisible jusqu'à son déclenchement :
   le hub affichait « OVR 47 » sans dire que c'était 44 l'an dernier, ni que
   la rupture survient à « ton OVR moins 2 ». Un système de tension sans
   montée de tension. L'écart est désormais montré — mais jamais chiffré :
   un écart en chiffres invite au calcul et désamorce la menace, une phrase
   qui se durcit d'année en année produit de l'anticipation. La jauge porte
   la précision, la phrase porte l'affect ; chacune fait exactement un
   travail. ==== */
function faithProtegeLine(p,f){
  const ecart=(f.overall||0)-(p.overall||0);
  const rempli=clamp(1-(ecart/15),0,1);
  const proche=ecart<=5;
  const phrase=ecart>8?'Il apprend vite.'
    :ecart>3?'Il commence à lire vos feintes.'
    :'Il vous attend au tournant.';
  return `<div style="margin-top:8px">
    <div class="gauge2" style="background:var(--line);height:6px;overflow:hidden">
      <span style="display:block;height:100%;width:${Math.round(rempli*100)}%;background:${proche?'var(--f-red-hi)':'var(--sage)'}"></span></div>
    <div class="small" style="margin-top:6px;color:${proche?'var(--gold)':'var(--muted)'}">${phrase}</div>
  </div>`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: V2-43] — écran d'accueil dédié au mode, atteint en tapant
   "MMA Faith" depuis le titre (scr_title, ui-06) : une seule porte
   d'entrée, comme le mode carrière complète (scr_intro) en a déjà une.
   Remplace les deux boutons du titre ("1. MMA FAITH" + "REPRENDRE LA
   PARTIE EN COURS" conditionnel). */
/** Résumé de la carrière Faith sauvegardée, lu directement dans
 * localStorage SANS passer par load() — ne doit jamais écraser le G en
 * cours (le joueur peut consulter ce résumé avant même d'avoir décidé de
 * reprendre). @returns {?object} */
function faithSaveSummary(){
  try{
    const s=localStorage.getItem(SAVE_KEY); if(!s) return null;
    const p=JSON.parse(s); if(!p||!p.faith||!p.f) return null;
    const f=p.f, F=p.faith;
    const monthEntry=(F.calendar&&F.calendar[F.month])||{type:null};
    const next=f.injury?'Infirmerie'
      :monthEntry.type==='combat'?'Un combat approche'
      :monthEntry.type==='intersaison'?'Intersaison'
      :monthEntry.type==='vie'?'Un événement de vie'
      :'Calme, pour l’instant';
    return {name:f.name,flag:f.flag,year:F.year,W:f.W||0,L:f.L||0,org:orgDisplayName(f),next};
  }catch(e){ return null; }
}
function scr_faith_home(){
  const sum=faithSaveSummary();
  return `<div class="scr center intro">
   <div class="eyebrow">MMA FAITH</div>
   <h2 class="disp" style="margin-top:4px">Carrière longue</h2>
   <p class="lede small">Gestion de vie — une saison à la fois.</p>
   <div style="display:flex;flex-direction:column;gap:10px;margin-top:20px">
     ${sum?`<div class="opp" style="padding:16px;text-align:left" onclick="CL.cont()">
       <b style="font-size:16px">Reprendre</b>
       <div class="hero-name" style="font-size:20px;margin-top:6px">${esc(sum.name)} ${sum.flag}</div>
       <div class="mono small muted" style="margin-top:4px">Saison ${sum.year} · ${sum.W}-${sum.L} · ${esc(sum.org)}</div>
       <div class="small muted" style="margin-top:6px">${esc(sum.next)}</div>
     </div>`:''}
     <div class="opp" style="padding:16px" onclick="CL.faithHomeNewCareer()">
       <b style="font-size:16px">Nouvelle carrière</b>
       <div class="muted small mt">${sum?'Remplace définitivement la carrière en cours.':'Créer un combattant et commencer.'}</div>
     </div>
     <div class="opp" style="padding:16px" onclick="CL.go('faith_legends')">
       <b style="font-size:16px">Le Panthéon Faith</b>
       <div class="muted small mt">Les carrières terminées et leurs scores.</div>
     </div>
   </div>
   <button class="btn ghost mt" onclick="CL.go('title')">← Retour</button>
  </div>`;
}
function scr_faith_hub(){
  const f=G.f;
  const monthEntry=(G.faith.calendar&&G.faith.calendar[G.faith.month])||{type:null};
  /* ==== [CORRECTIF FA-25] — faithProtegeLine() (jauge + phrase qui se
     durcit, le Syndrome de Frankenstein) n'était rendue que pendant
     l'intersaison, à l'intérieur de la carte de sparring : trois mois sur
     quatre, la menace n'existait pas à l'écran. Hissée ici, sous le nom du
     combattant, tous types de mois confondus — la tension doit être là
     quand le joueur n'y pense pas, sinon ce n'est pas de la tension, c'est
     un rappel. Même sélection (le partenaire le plus avancé) que le choix
     de sparring d'intersaison, calculée une seule fois et réutilisée par
     les deux. ==== */
  /* ==== [ANCRE: V3_SPARRING_PRIMARY] — Plan V3 LOT 2 §P04/§P08 : référence
     stable (F.sparringPrimaryId, ui-08), plus un tri recalculé à chaque
     rendu — c'était la cause exacte du bug "Marcus est devenu Sean sans
     raison" (cf. ANCRE PERSON_REGISTRY, state.js). ==== */
  const topPartner=(G.faith.gym||[]).find(p=>p.id===G.faith.sparringPrimaryId)||(G.faith.gym||[])[0];
  /* ==== [CORRECTIF FA-26] — « afficher son palmarès sur le hub, une
     ligne » : le combattant peut avoir quitté G.roster (retraite NPC) sans
     que f.faithNemesisId ne soit nettoyé nulle part — repli silencieux si
     introuvable plutôt qu'un nom manquant à l'écran. */
  const nemesis=f.faithNemesisId?(G.roster||[]).find(o=>o.id===f.faithNemesisId):null;
  let actionsHtml='';
  if(f.injury){
    /* ==== [ANCRE: FAITH_BOUTON_BLESSURE] — f.injury ne peut être posé que
       par un mécanisme qui touche vraiment le mode Faith (aucun aujourd'hui
       ne le fait — toute la chaîne blessure du mode carrière passe par
       chooseTraining()/finishTrainingFlow(), que CL.opp() court-circuite
       entièrement pour G.faith). Le champ existe malgré tout sur le
       combattant (repairFighter() le garantit, state.js), et le condamner
       à ne jamais s'afficher ici serait fragile au premier futur mécanisme
       qui le poserait (stage violent, sparring qui tourne mal...). Prime
       sur tout, quel que soit le mois : un combattant blessé ne voit plus
       d'adversaire pressenti ni de vie de salle, seule l'Infirmerie,
       jusqu'à guérison. ==== */
    actionsHtml=`<div class="opp" style="padding:16px;text-align:left;margin-bottom:16px;border-left:3px solid var(--loss)">
      <div class="eyebrow" style="font-size:11px;color:var(--loss)">INFIRMERIE</div>
      <div class="hero-name" style="font-size:20px;margin-top:6px">${esc(f.injury.name)}</div>
      <div class="mono small muted" style="margin-top:4px">${f.injury.left} combat${f.injury.left>1?'s':''} avant guérison complète</div>
    </div>
    <button class="btn primary" style="width:100%;height:56px;font-size:16px" onclick="CL.recoverInjury()">LAISSER LE CORPS RÉCUPÉRER</button>`;
  } else if(monthEntry.type==='vie'){
    const quoi=((G.faith.month||0)%2===0)?'Ce qui arrive à la salle':'Ce qui arrive dehors';
    actionsHtml=`<p class="lede small">${quoi}.</p>
    <button class="btn primary" style="width:100%;height:56px;font-size:16px" onclick="CL.faithLifeEvent()">CONTINUER</button>`;
  } else if(monthEntry.type==='intersaison'){
    /* ==== [ANCRE: V2-09] — trois options TIRÉES du pool (FAITH_INTERSAISON_
       POOL), jamais plus (règle H.3 conservée : l'écran en montre toujours
       exactement 3), mais elles varient d'une intersaison à l'autre au lieu
       d'être figées. faithEnsureIntersaisonDraw() est idempotente pour le
       mois courant (même schéma que faithEnsureOffer, V2-16) : le tirage ne
       change jamais entre deux rendus du même mois. Le libellé de fraîcheur
       (V2-11) apparaît ici en toutes lettres, jamais en chiffre. */
    const picks=faithEnsureIntersaisonDraw(f,G.faith).map(id=>FAITH_INTERSAISON_POOL.find(e=>e.id===id)).filter(Boolean);
    /* Même correctif que topPartner ci-dessus : le "second" partenaire est
       simplement celui qui n'est pas le principal, jamais un second tri —
       sinon le même bug d'identité flottante réapparaîtrait ici. */
    const secondPartner=(G.faith.gym||[]).find(p=>p.id!==G.faith.sparringPrimaryId);
    /* ==== [ANCRE: V2-07] — seules les DEUX entrées qui portent explicitement
       le nom d'un partenaire (id précis, pas juste `action==='sparring_top'`
       — d'autres entrées, ex. "Séance technique ciblée", partagent la même
       action mais gardent leur propre titre fixe et ne doivent pas être
       écrasées) affichent le nom réel + la jauge de Frankenstein (FA-25). */
    const cardFor=(entry)=>{
      if(entry.id==='is_sparring_top' && topPartner){
        return `<div class="opp" style="padding:16px" onclick="CL.faithIntersaisonChoose('${entry.id}')">
          <b style="font-size:16px">Tourner avec ${esc(topPartner.first)}</b>
          <div class="muted small mt">${esc(topPartner.styleLabel)}, ${topPartner.age} ans. ${faithProtegeLine(topPartner,f)}</div></div>`;
      }
      if(entry.id==='is_sparring_second' && secondPartner){
        return `<div class="opp" style="padding:16px" onclick="CL.faithIntersaisonChoose('${entry.id}')">
          <b style="font-size:16px">Tourner avec ${esc(secondPartner.first)}</b>
          <div class="muted small mt">${esc(secondPartner.styleLabel)}, ${secondPartner.age} ans. ${faithProtegeLine(secondPartner,f)}</div></div>`;
      }
      let text=entry.text;
      if(entry.action==='camp'){
        const accessibles=faithEligibleGyms(f).filter(g=>{
          const co=FAITH_COACHES.find(c=>c.id===g.coachId);
          return (f.earnings||0)>=((co&&co.cost)||0);
        }).length;
        text=`${text} ${accessibles} salle(s) accessible(s) selon les fonds.`;
      }
      return `<div class="opp" style="padding:16px" onclick="CL.faithIntersaisonChoose('${entry.id}')">
        <b style="font-size:16px">${esc(entry.title)}</b>
        <div class="muted small mt">${esc(text)}</div></div>`;
    };
    actionsHtml=`<p class="lede small">Une seule chose à faire de cette intersaison. Vous vous sentez ${freshnessTier(f).label.toLowerCase()}.</p>
    <div style="display:flex;flex-direction:column;gap:10px">
      ${picks.map(cardFor).join('')}
    </div>`;
  } else {
    /* ==== [ANCRE: FAITH_HUB_ADVERSAIRE] — le mois-combat était le seul type
       à n'offrir aucune information avant l'action ("Tout est en place.") :
       de mois à n'offrir aucune information avant l'action ("Tout est en
       place.") : les mois-vie montrent l'événement à trancher, le mois
       intersaison montre le partenaire de sparring — seul celui-ci ouvrait
       sur du vide. On y affiche désormais un aperçu réel du prochain
       rendez-vous : le plus
       dangereux des 3 candidats que produira le Bureau du Matchmaker
       (genOpponents() trie déjà du plus fort au plus faible — cf.
       CORRECTIF_ORDRE_PROPOSITIONS, ui-02), via ensureOpponentsCached() pour
       que ce soit VRAIMENT celui qui apparaîtra, pas un second tirage. Le
       choix entre les 3 propositions reste sur son écran dédié
       (scr_select) : un aperçu qui annonce la couleur, pas une
       duplication de l'écran qui la révèle en entier. */
    /* ==== [CORRECTIF V2-16] — plus de "pressenti" : faithEnsureOffer()
       (ui-08) fige la VRAIE offre (choisie par l'agent, cf. son ancre) dès
       l'affichage du hub, jamais un second tirage juste pour l'aperçu —
       ce qu'on montre ici est exactement ce que l'écran d'offre montrera
       au clic. */
    const hasOffer=(!f.injury)&&faithEnsureOffer();
    const preview=hasOffer?G.faith.pendingOffer.opp:null;
    actionsHtml=preview?`<div class="opp" style="padding:16px;text-align:left;margin-bottom:16px">
      <div class="eyebrow" style="font-size:11px;color:${preview.mm?preview.mm.color:'var(--muted)'}">PROCHAIN COMBAT</div>
      <div class="hero-name" style="font-size:22px;margin-top:6px">${esc(preview.o.name)} ${preview.o.flag}</div>
      <div class="mono small" style="margin-top:4px">${recordStr(preview.o)}</div>
      <div class="small muted" style="margin-top:8px">${esc(preview.read)}</div>
    </div>
    <button class="btn primary" style="width:100%;height:56px;font-size:16px" onclick="CL.faithFight()">ENTRER DANS LA CAGE</button>`
    : `<p class="lede small">Tout est en place.</p>
    <button class="btn primary" style="width:100%;height:56px;font-size:16px" onclick="CL.faithFight()">ENTRER DANS LA CAGE</button>`;
  }
  return `<div class="scr" style="max-width:560px;margin:0 auto">
    ${faithHubGrid(f)}
    ${faithCalendarBar(G.faith)}
    <div>
      <div class="mono" style="font-size:11px;color:var(--muted)">SAISON ${G.faith.year} · ${orgDisplayName(f)}</div>
      <div class="hero-name" style="font-size:28px;margin-top:4px">${esc(f.name)} ${f.flag}</div>
      ${topPartner?`<div class="mono" style="font-size:11px;color:var(--muted);margin-top:8px">SALLE · ${esc(topPartner.first)}</div>${faithProtegeLine(topPartner,f)}`:''}
      ${nemesis?`<div class="mono" style="font-size:11px;color:var(--f-red-hi);margin-top:8px">NÉMÉSIS · ${esc(fighterDisplayName(nemesis))} (${(f.nemesisRecord&&f.nemesisRecord.w)||0}-${(f.nemesisRecord&&f.nemesisRecord.l)||0})</div>`:''}
      ${(f.org>0 && f.contract)?`<div class="mono" style="font-size:11px;color:var(--gold);margin-top:4px">${contractFightsLeftLabel(f.contract)}</div>`:''}
      ${(f.faithTraits&&f.faithTraits.length)?`<div class="mono" style="font-size:11px;color:var(--gold);margin-top:6px">${f.faithTraits.join(' · ')}</div>`:''}
      ${faithOathBadge(G.faith)}
    </div>
    ${actionsHtml}
    ${(G.faith.currentCard && G.faith.currentCard.playerResult && !G.faith.pendingOffer)?`<div class="mono small" style="text-align:center;margin-top:12px"><span onclick="CL.viewFightCard()" style="color:var(--gold);cursor:pointer;text-decoration:underline">Résultats de la dernière carte ▸</span></div>`:''}
    <!-- ==== [CORRECTIF V2-15] — le mode carrière a déjà scr_rankings()
         (top 15 + rang du joueur en évidence + mouvement ▲▼ + ceinture
         au-dessus, ui-06) accessible en un tap depuis son hub ; Faith en
         était privé, seule sa carte /1f1f grille montrait un rang isolé
         sans le classement complet autour. Réutilisé tel quel — l'écran
         gère déjà les deux modes (CL.go('faith_hub') au retour). ==== -->
    <button class="btn ghost" onclick="CL.go('rankings')">Classement</button>
    <!-- ==== [CORRECTIF V2-17] — l'écran Contacts, vitrine permanente des
         quatre interlocuteurs (agent/directeur/coach/partenaire). ==== -->
    <button class="btn ghost" onclick="CL.go('faith_contacts')">Contacts</button>
    <button class="btn ghost" onclick="CL.go('profile')">Voir la fiche complète</button>
  </div>`;
}
/* ==== [ANCRE: FAITH_AGENT] — remplace scr_select (menu à 3 adversaires,
   matchmaking du mode carrière) pour les combats Faith : une offre UNIQUE,
   apportée par l'agent, à accepter ou négocier (FA-12/FA-13). Aucun chiffre
   de bourse exact avant la bonification négociée — l'estimation affichée
   ici est la même formule que la bourse réelle (ORG_PURSES/contrat,
   engine.js), gala et négociation appliqués, mais reste une ESTIMATION :
   la bourse définitive dépend aussi du résultat du combat (prime de
   victoire, finition), jamais connue avant. ==== */
function scr_faith_offer(){
  const f=G.f, F=G.faith, off=F.pendingOffer;
  if(!off) return `<div class="scr center intro"><p class="lede">Aucune offre en cours.</p><button class="btn ghost mt" onclick="CL.go('faith_hub')">Retour</button></div>`;
  const o=off.opp.o, mm=off.opp.mm, gala=off.gala;
  const base=(f.org>0 && f.contract)?f.contract.show:(ORG_PURSES[f.org]||[0,0])[0];
  const bourseEst=Math.round(base*(gala.mult||1)*(off.bonusMult||1)*10)/10;
  const patience=F.agentPatience!=null?F.agentPatience:3;
  /* ==== [ANCRE: V3_BANDEAU_CARTE] — Plan V3 LOT 6 §P09 point 2 : nom du
     gala, ville, salle, position sur la carte, affluence et audience — un
     combat d'ouverture régional (petite salle, peu de monde) et un main
     event à Rio (salle pleine, audience large) ne doivent plus se
     ressembler visuellement. Bordure/fond suivent gala.hype (déjà la
     mesure d'enjeu existante), jamais un second barème. ==== */
  const venueInfo=faithGalaVenueInfo(F,f,gala);
  if(!TEXT_POOLS['faith_crowd_ambiance']) registerTextPool('faith_crowd_ambiance',FAITH_CROWD_AMBIANCE);
  const crowdLine=txtPick('faith_crowd_ambiance',{city:venueInfo.city,venue:venueInfo.venue,home:venueInfo.home,hype:gala.hype});
  const bandeauStrong=(gala.hype==='forte');
  return `<div class="scr" style="max-width:560px;margin:0 auto">
   <div class="eyebrow">${esc(F.agent?faithAgentDisplayName():'Sans agent')}</div>
   <h2 class="hero-name" style="font-size:26px;line-height:1.1">${esc(gala.label)}</h2>
   <!-- ==== [CORRECTIF V2-24 point 3] — "hype : faible" est une case
        remplie, pas une information ; au plus bas, le mot "hype"
        disparaît complètement au profit d'une phrase. ==== -->
   <div class="mono small muted" style="margin-top:4px">${esc(gala.tier)} · ${(gala.hype==='faible'||gala.hype==='nulle')?'Personne n’en parle encore.':`hype ${gala.hype}`}${gala.pressConf?' · conférence de presse obligatoire':''}</div>
   <div class="card mt" style="padding:${bandeauStrong?'18px':'12px'};background:var(--panel2);border:1px solid ${bandeauStrong?'var(--gold)':'var(--line)'};text-align:left">
     <div class="mono small" style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px 12px">
       <span class="${bandeauStrong?'gold':'muted'}">${esc(venueInfo.venue)} · ${esc(venueInfo.city)}</span>
       <span class="muted">${venueInfo.attendance.toLocaleString('fr-FR')} spectateurs attendus · ${venueInfo.audienceM}M en audience</span>
     </div>
     ${venueInfo.home?'<div class="small mt" style="color:var(--sage)">Vous combattez à domicile.</div>':''}
     <!-- ==== [ANCRE: V3_SPECTACLE_HYPE] — Plan V3 LOT 7 §5.7.1 point 5 :
          lecture qualitative de f.spectacle, jamais un chiffre (règle H.1). -->
     ${f.spectacle>=70?'<div class="small mt" style="color:var(--gold)">Le public parle encore de votre dernier combat.</div>':f.spectacle<=30?'<div class="small mt" style="color:var(--muted)">On respecte votre palmarès. On ne se déplace pas pour autant.</div>':''}
     <p class="lede small mt" style="margin:8px 0 0">${esc(crowdLine)}</p>
   </div>
   <div class="opp" style="padding:16px;text-align:left;margin-top:20px">
     <div class="eyebrow" style="font-size:11px;color:${mm?mm.color:'var(--muted)'}">${mm?esc(mm.label.toUpperCase()):''}</div>
     <div class="hero-name" style="font-size:22px;margin-top:6px">${esc(o.name)} ${o.flag}</div>
     <!-- ==== [ANCRE: V3_RANG_OFFRE] — Plan V3 LOT 4 §P05a : "le rang de
          l'adversaire toujours visible à côté du palmarès" — signer une
          offre sans jamais savoir où l'adversaire se situe au classement
          était l'un des symptômes cités. ==== -->
     <div class="mono small" style="margin-top:4px">${recordStr(o)} · <span class="muted">#${divRank(o)}</span></div>
     <div class="small muted" style="margin-top:8px">${esc(off.opp.read)}</div>
     ${o.id===f.faithNemesisId?(()=>{
       /* ==== [CORRECTIF V2-14] — "la revanche, quand elle a lieu, ouvre
          l'écran avec le bilan du face-à-face et une ligne sur ce qui
          s'est passé la dernière fois" : nemesisRecord (FA-26, tenu par
          ui-05 à chaque combat contre CETTE némésis précise) en donne le
          bilan tête-à-tête ; le sens (qui mène) porte à lui seul la ligne
          sur "la dernière fois", sans stocker un second historique. ==== */
       const rec=f.nemesisRecord||{w:0,l:0};
       const bilan=rec.w>rec.l?`Vous menez ${rec.w}-${rec.l} sur cette rivalité.`
         :rec.l>rec.w?`Il mène ${rec.l}-${rec.w} sur cette rivalité.`
         :(rec.w+rec.l>0?`Vous êtes à égalité, ${rec.w}-${rec.l}.`:'Votre premier face-à-face.');
       /* ==== [ANCRE: V3_NEMESIS_ESCALADE] — Plan V3 LOT 3 §P16 : palier
          affiché sur l'offre elle-même, avant la signature — le joueur
          sait ce qu'il signe (une revanche n'a pas le même poids qu'une
          trilogie). ==== */
       const tier=nemesisTierLabel(rec.w+rec.l);
       return `<div class="mono small" style="margin-top:8px;color:var(--f-red-hi)">NÉMÉSIS · ${esc(tier)} · ${bilan}</div>`;
     })():''}
     ${F.scoutKey?`<div class="mono small" style="margin-top:8px;color:var(--sage)">SPARRING · Vous savez qu’il est particulièrement dangereux en ${esc(oppTopAttrLabel(o))}.</div>`:''}
   </div>
   <div class="mono" style="margin-top:16px;font-size:15px">Bourse estimée : <b>${bourseEst}k$</b></div>
   <div style="display:flex;flex-direction:column;gap:10px;margin-top:20px">
     <button class="btn primary" style="height:56px;font-size:16px" onclick="CL.faithOfferSign()">SIGNER</button>
     <!-- ==== [CORRECTIF V2-20 point 2] — "sans levier, l'option n'existe
          pas" : plus de bouton grisé en silence, remplacé par la raison
          quand faithLeverage() est à 0. ==== -->
     ${faithLeverage(f,F)>0?`<div class="opp" style="padding:14px" onclick="CL.faithOfferDemandMoney()">
       <b style="font-size:15px">Demander plus d’argent</b>
       <div class="muted small mt">${patience>0?'La bourse sera relevée, l’adversaire ne change pas.':'Il insiste encore, mais sa patience est épuisée pour cette année.'}</div>
     </div>`:`<div class="muted small" style="text-align:center">Vous n’avez rien à négocier : personne ne parle de ce combat.</div>`}
     <!-- ==== [CORRECTIF V2-18] — le motif réel (faithDemandMotif) est
          affiché sur le bouton, pas juste sa conséquence mécanique. ==== -->
     <div class="opp" style="padding:14px" onclick="CL.faithOfferDemandBetter()">
       <b style="font-size:15px">« ${esc(faithDemandMotif(f,o))} »</b>
       <div class="muted small mt">Demander un autre adversaire à ${esc(F.agent?faithAgentDisplayName():'votre agent')}.</div>
     </div>
     <!-- ==== [CORRECTIF V2-21] — le libellé décrivait une punition, pas
          une action, et n'annonçait aucune conséquence avant le clic. Le
          bouton dit maintenant ce qu'il fait ; la légende juste en
          dessous dit ce que ça coûte, avant confirmation. ==== -->
     <button class="btn ghost" onclick="CL.faithOfferRefuse()">Refuser le combat</button>
     <!-- ==== [ANCRE: V3_REFUS_CONSEQUENCE_REELLE] — Plan V3 LOT 4 §P05a/
          §P05b : "Ce combat de l'année est perdu" ne correspondait à
          AUCUN mécanisme du jeu (aucune notion de "combat de l'année"
          n'existe nulle part dans le code) — une menace fabriquée, jamais
          honorée. Remplacée par la conséquence RÉELLE de faithOfferRefuse()
          (ui-08) : la patience de l'agent (déjà affichée sur Contacts),
          ou l'exemption médicale quand elle s'applique. ==== -->
     <div class="muted small" style="text-align:center;margin-top:-6px">${
       (f.injury && !G.faith.medicalRefusalUsed)?'Motif médical : refus sans conséquence, une fois cette année.'
       :(G.faith.agentPatience>0?`${esc(F.agent?faithAgentDisplayName():'Votre agent')} perd un peu patience.`:'La patience de votre agent est déjà à bout.')
     }</div>
   </div>
   <div class="mono small" style="text-align:center;margin-top:14px"><span onclick="CL.viewFightCard()" style="color:var(--gold);cursor:pointer;text-decoration:underline">Voir la carte complète ▸</span></div>
  </div>`;
}
/* ==== [ANCRE: V2-22/V2-23] — "rien ne se passe entre l'annonce et la
   cage" : F.buildup={attente,tension} (V2-22, jauges qualitatives,
   jamais chiffrées) existait déjà pour la conférence de presse (V2-25,
   Main event uniquement) mais restait vide pour tous les autres combats.
   Un événement tiré ici, sur CHAQUE combat (pas seulement Main event),
   ferme cet écart. Douze entrées minimum (règle 6 : la rareté fait la
   saillance — inutile d'en avoir plus si elles ne sont vues qu'une fois
   par combat). Chacune stocke sa cause dans F.buildup.causes[]. ==== */
/** Tire et applique un événement de build-up (V2-23), sans écran séparé
 * pour la sélection de choix — deux options, réponse immédiate (règle 6 :
 * un choix par combat, pas un menu). @returns {{title:string,text:string,
 * chosen:string}|null} */
function faithBuildupPick(f,F){
  if(!F.buildup) F.buildup={attente:0,tension:0,causes:[]};
  const seen=F.buildupSeen||(F.buildupSeen=[]);
  let pool=FAITH_BUILDUP_EVENTS.filter(e=>!seen.includes(e.id));
  if(!pool.length){ seen.length=0; pool=FAITH_BUILDUP_EVENTS; }
  const ev=pick(pool);
  seen.push(ev.id);
  return ev;
}
function scr_faith_buildup(){
  const ev=G.faith.currentBuildupEvent;
  if(!ev) return `<div class="scr center intro"><p class="lede">Rien à signaler.</p><button class="btn ghost mt" onclick="CL.faithOfferSign()">Continuer</button></div>`;
  return `<div class="scr center intro">
   <div class="eyebrow gold">Avant le combat</div>
   <h2 class="disp">${esc(ev.title)}</h2>
   <div class="glass card" style="background:var(--panel2);text-align:left;padding:16px;margin:16px 0">
     <p class="lede" style="margin:0">${esc(ev.text)}</p>
   </div>
   <div style="display:flex;flex-direction:column;gap:10px">
     ${ev.choices.map((c,i)=>`<div class="opp" style="padding:14px;text-align:left" onclick="CL.faithBuildupChoose(${i})">
       <b style="font-size:15px">${esc(c.label)}</b>
     </div>`).join('')}
   </div>
  </div>`;
}
/* ==== [ANCRE: V2-25] — écran de conférence de presse, déclenché quand
   l'attente est suffisante (gala.pressConf, faithGalaPosition — Main
   event uniquement). Trois postures, toutes valables (règle H.3). ====
   ==== [ANCRE: V3_PRESSCONF_TEXTENGINE] — Plan V3 LOT 5 §P15 : les
   répliques passent par txtPick()/FAITH_PRESSCONF_REPLIES (data-faith-
   content.js), un vrai pool avec req(ctx) plutôt que deux formules
   figées. Deux tirages successifs (le ledger de txtPick exclut
   automatiquement le premier id du second, cf. engine.js) donnent deux
   répliques différentes à chaque conférence. */
/* ==== [ANCRE: V3_TITLE_PROMO_EXCLUSIF] — Plan V3 LOT 6 §5.6.1, temps 4 :
   une conférence de titre pioche TOUJOURS sa première réplique dans
   FAITH_TITLE_PROMO_REPLIES (data-faith-content.js), jamais dans le pool
   ordinaire — "jamais les pools ordinaires" (spec). La seconde réplique
   reste tirée du pool ordinaire (variété, cf. LOT 5) : les deux mondes ne
   se confondent que pour compléter l'écran. */
function faithOppReplies(o,f,F,ctxExtra){
  const ctx=Object.assign({opp:o,f,F},ctxExtra);
  if(ctx.isTitle){
    if(!TEXT_POOLS['faith_title_promo']) registerTextPool('faith_title_promo',FAITH_TITLE_PROMO_REPLIES);
    return [txtPick('faith_title_promo',ctx), txtPick('faith_pressconf_reply',ctx)];
  }
  return [txtPick('faith_pressconf_reply',ctx), txtPick('faith_pressconf_reply',ctx)];
}
/* ==== [FIN ANCRE] ==== */
function scr_faith_press_conf(){
  const f=G.f, F=G.faith, off=F.pendingOffer;
  if(!off) return `<div class="scr center intro"><p class="lede">Rien à signaler.</p><button class="btn ghost mt" onclick="CL.go('faith_hub')">Retour</button></div>`;
  const o=off.opp.o;
  if(!TEXT_POOLS['faith_pressconf_reply']) registerTextPool('faith_pressconf_reply',FAITH_PRESSCONF_REPLIES);
  /* ==== [CORRECTIF V3_TITLE_PROMO_EXCLUSIF] — Plan V3 LOT 6 §5.6.1 : isTitle
     lisait le NIVEAU de carte (gala.tier==='Main event', LOT 5), donc
     confondait "grosse affiche" (rang <=4, ou rivalId) et "vrai combat de
     titre". Depuis ce lot, un combat de titre a son propre écran de
     négociation (scr_faith_title_negotiation) — le signal exact existe
     déjà (fightKind()==='title'/'defense', ui-05) : plus besoin d'un
     proxy. Les répliques exclusives (FAITH_TITLE_PROMO_REPLIES) ne sortent
     donc plus jamais pour un simple Main event non-titré. */
  const fk=fightKind();
  const replies=faithOppReplies(o,f,F,{isNemesis:o.id===f.faithNemesisId,isTitle:(fk==='title'||fk==='defense'),favorite:divRank(o)<divRank(f)});
  return `<div class="scr center intro">
   <div class="eyebrow blood">Conférence de presse</div>
   <h2 class="disp">${esc(o.name)} face à vous</h2>
   <div class="glass card" style="background:var(--panel2);text-align:left;padding:16px;margin:16px 0">
     <p class="lede" style="margin:0">${replies[0]}</p>
     <p class="lede" style="margin:12px 0 0">${replies[1]}</p>
   </div>
   <div style="display:flex;flex-direction:column;gap:10px">
     <div class="opp" style="padding:14px;text-align:left" onclick="CL.faithPressConfPosture('respect')">
       <b style="font-size:15px">Le respect</b>
       <div class="muted small mt">Une poignée de main. Tension basse, crédit auprès du directeur.</div>
     </div>
     <div class="opp" style="padding:14px;text-align:left" onclick="CL.faithPressConfPosture('provocation')">
       <b style="font-size:15px">La provocation</b>
       <div class="muted small mt">Un levier pour négocier — mais il n'arrivera pas dans le même état.</div>
     </div>
     <div class="opp" style="padding:14px;text-align:left" onclick="CL.faithPressConfPosture('silence')">
       <b style="font-size:15px">Le silence</b>
       <div class="muted small mt">Deux phrases, pas une de plus. Personne ne pourra vous citer.</div>
     </div>
   </div>
  </div>`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: V2-17] — l'écran Contacts. Quatre interlocuteurs, chacun
   sa jauge de crédit QUALITATIVE (règle H.1 — jamais un chiffre), aucun
   n'a besoin d'une action dédiée ici : agent et directeur se négocient
   déjà en contexte sur scr_faith_offer (V2-18/20), cet écran est leur
   VITRINE permanente — savoir où on en est avec chacun, même hors
   négociation active, ce qui manquait totalement avant ce correctif. */
/* ==== [ANCRE: V3_FAITH_COACH_LOOKUP] — Plan V3 LOT 2 §P04 : lecture
   défensive du coach nommé (personEnsure() posé à finalizeFaithDraft(),
   ui-08) — une sauvegarde antérieure à ce correctif n'a pas encore
   F.coachId, mintée ici à la volée plutôt que forcer une migration
   dédiée dans validateState() pour un champ qui n'existe que niché sous
   G.faith (optionnel par nature, actif seulement en carrière). */
function faithCoachPerson(F){
  if(!F.coachId || !G.people || !G.people.byId[F.coachId]) F.coachId=personEnsure('coach',{slot:'main'}).id;
  return G.people.byId[F.coachId];
}
function scr_faith_contacts(){
  const f=G.f, F=G.faith;
  const dir=FAITH_DIRECTORS[f.org]||FAITH_DIRECTORS[0];
  /* ==== [ANCRE: V3_SPARRING_PRIMARY] — Plan V3 LOT 2 §P04/§P08 : référence
     stable (F.sparringPrimaryId, ui-08), plus un tri recalculé à chaque
     rendu — c'était la cause exacte du bug "Marcus est devenu Sean sans
     raison" (cf. ANCRE PERSON_REGISTRY, state.js). ==== */
  const topPartner=(F.gym||[]).find(p=>p.id===G.faith.sparringPrimaryId)||(G.faith.gym||[])[0];
  const coach=faithCoachPerson(F);
  const agentPatience=F.agentPatience!=null?F.agentPatience:3;
  /* ==== [ANCRE: V3_AGENT_CONSEQUENTIEL] — Plan V3 §5.2.2 point 3 : l'humeur de
     l'agent dit ce qu'il FERA à la prochaine offre, avec un chiffre ou un nom,
     jamais un état d'âme. La dernière ligne était l'exemple de rejet du §1.3. */
  const nextOpp=(F.pendingOffer&&F.pendingOffer.opp&&F.pendingOffer.opp.o)||null;
  const agentMood=!F.agent
    ?'Aucun agent : vous signez ce qu’on vous propose, sans négocier.'
    :agentPatience>=3
    ?`Il ira chercher la bourse${nextOpp?` sur le combat contre ${nextOpp.name}`:''} — vous pouvez encore refuser une fois.`
    :agentPatience>=1
    ?'Il négociera la bourse, mais ne demandera plus d’autre adversaire pour vous.'
    :'Il prendra la prochaine offre telle quelle. Plus de négociation cette année.';
  const card=(who,name,role,mood,detail,onclick)=>`<div class="opp" style="padding:16px;text-align:left"${onclick?` onclick="${onclick}"`:''}>
    <div class="eyebrow" style="font-size:11px">${esc(who)}</div>
    <div class="hero-name" style="font-size:18px;margin-top:4px">${esc(name)}</div>
    <div class="muted small" style="margin-top:2px">${esc(role)}</div>
    <div class="mono small" style="margin-top:8px;color:var(--gold)">${esc(mood)}</div>
    ${detail?`<div class="muted small" style="margin-top:6px">${detail}</div>`:''}
  </div>`;
  /* ==== [ANCRE: V3_COACH_ETAT_CORPS] — Plan V3 LOT 2 §P04 : "un fait de
     carrière + une ligne d'état du corps", jamais un rôle générique. Le
     fait vient de la Person (bio.origin = palmarès réel du pool
     FAITH_COACHES) ; l'état du corps reste la lecture existante de
     f.form, inchangée. */
  const coachDetail=(f.form||100)>=70?'« Le corps répond, on peut pousser. »':(f.form||100)>=40?'« Ça tient, sans plus. »':'« Il faut lever le pied, et vite. »';
  return `<div class="scr" style="max-width:560px;margin:0 auto">
   <div class="bar"><span class="eyebrow">Contacts</span><span class="eyebrow x" onclick="CL.go('faith_hub')">✕</span></div>
   <div style="display:flex;flex-direction:column;gap:12px">
     ${card('VOTRE AGENT',F.agent?faithAgentDisplayName():'Aucun agent',
       'Négocie vos combats — croisez-le sur chaque offre.',agentMood)}
     ${card('DIRECTEUR DE L’ORGANISATION',dir.name,orgDisplayName(f),faithDirectorMood(f.org))}
     ${card('VOTRE COACH',personName(coach,{withNick:true}),specialtyLabel(coach.bio.trait),
       '« '+coach.bio.origin+' »',coachDetail,"CL.go('faith_coach_detail')")}
     ${topPartner?card('PARTENAIRE D’ENTRAÎNEMENT',topPartner.first,topPartner.styleLabel,
       (f.morale||60)>=70?'« Bonne ambiance à la salle en ce moment. »':'« L’ambiance est tendue depuis un moment. »',
       faithProtegeLine(topPartner,f)):''}
   </div>
   <button class="btn ghost mt" onclick="CL.go('faith_hub')">← Retour au hub</button>
  </div>`;
}
/* ==== [ANCRE: V3_FAITH_COACH_DETAIL] — Plan V3 LOT 2 §P04/§P08 : "chaque
   carte de contact cliquable → détail avec historique daté (rel.arc[]) +
   1-2 actions contextuelles". Le coach est le seul contact déjà porté par
   une vraie Person (PersonRegistry, LOT 0) sur ce chemin de jeu — agent et
   directeur restent, pour l'instant, de simples objets d'archétype
   (FAITH_AGENTS/FAITH_DIRECTORS), pas des Person avec rel.arc ; leur
   propre mise à niveau est explicitement le sujet de LOT 4 (P05a, "l'agent
   devient une Person"), pas répétée ici par anticipation. */
function scr_faith_coach_detail(){
  const F=G.faith, f=G.f;
  const coach=faithCoachPerson(F);
  const trust=coach.rel.trust;
  const trustLabel=trust>=70?'Une vraie confiance, construite dans la durée.':trust>=40?'Une relation correcte, sans plus.':'La confiance n’y est plus vraiment.';
  const arc=(coach.rel.arc||[]).slice().reverse();
  return `<div class="scr" style="max-width:480px;margin:0 auto">
   <div class="bar"><span class="eyebrow">Votre coach</span><span class="eyebrow x" onclick="CL.go('faith_contacts')">✕</span></div>
   <h2 class="hero-name" style="font-size:26px;margin-top:8px">${esc(personName(coach,{withNick:true}))}</h2>
   <div class="muted small mt">${esc(specialtyLabel(coach.bio.trait))}${coach.extra&&coach.extra.cost?` · ${coach.extra.cost}k$/an`:''}</div>
   <div class="card mt" style="padding:14px;background:var(--panel2);text-align:left">
     <div class="eyebrow mb" style="font-size:11px">CE QU’IL A DÉJÀ FAIT</div>
     <div class="small">${esc(coach.bio.origin)}</div>
   </div>
   <div class="card mt" style="padding:14px;background:var(--panel2);text-align:left">
     <div class="eyebrow mb" style="font-size:11px">CE QUI LE LIMITE</div>
     <div class="small">${esc(coach.bio.past)}</div>
   </div>
   <div class="card mt" style="padding:14px;background:var(--panel2);text-align:left">
     <div class="eyebrow mb" style="font-size:11px">CONFIANCE</div>
     <div class="small">${trustLabel}</div>
   </div>
   ${arc.length?`<div class="card mt" style="padding:14px;background:var(--panel2);text-align:left">
     <div class="eyebrow mb" style="font-size:11px">HISTORIQUE</div>
     ${arc.map(a=>`<div class="mono small muted" style="margin-top:4px">${a.year} · ${esc(a.text)}</div>`).join('')}
   </div>`:''}
   <button class="btn ghost mt" onclick="CL.go('faith_contacts')">← Retour aux contacts</button>
  </div>`;
}
function specialtyLabel(key){
  return ({frappe:'Spécialiste frappe',lutte:'Spécialiste lutte',soumission:'Spécialiste soumission',
    cardio:'Préparateur physique',dur_au_mal:'Spécialiste encaissement',mental:'Préparateur mental'})[key]||'Coach';
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: FAITH_COACH_CHOICE_C12] — Plan V4 LOT 5 §C12 : nouvel écran,
   déclenché quand "Chercher un préparateur au-dessus" (evt_br_regional_coach,
   data-faith-content.js) route ici (CL.chooseFaithEvent, ui-08) au lieu
   d'appliquer un delta d'attributs. Trois coachs parmi les 24, filtrés par
   légitimité (faithEnsureCoachChoices, state.js — un coach de champion
   refuse un combattant qui n'a pas le palmarès), chacun avec son palmarès
   (bio.origin déjà écrit pour ça, cf. personMint) : c'est le "pourquoi lui
   et pas un autre", jamais un chiffre de plus. */
function scr_faith_coach_choice(){
  const f=G.f, F=G.faith;
  const coaches=faithEnsureCoachChoices(f,F);
  const current=faithCoachPerson(F);
  return `<div class="scr" style="max-width:560px;margin:0 auto">
   <div class="bar"><span class="eyebrow">Choisir un nouveau coach</span></div>
   <p class="lede small">${esc(personName(current,{withNick:true}))} vous a mené jusqu’ici. Ce préparateur ira plus loin.</p>
   <div style="display:flex;flex-direction:column;gap:10px;margin-top:12px">
   ${coaches.length?coaches.map(c=>`<div class="opp" style="padding:14px;text-align:left" onclick="CL.chooseFaithCoach('${c.id}')">
       <b style="font-size:15px">${esc(c.firstName)} ${esc(c.lastName)}${c.nickname?` « ${esc(c.nickname)} »`:''}</b>
       <div class="muted small mt">${specialtyLabel(c.specialty)} · ${c.cost}k$/an</div>
       <div class="small mt">${esc(c.palmares)}</div>
       <div class="muted small mt">${esc(c.flaw)}</div>
     </div>`).join(''):'<p class="muted small">Aucun coach de ce niveau n’accepte votre palmarès actuel — restez avec le vôtre pour l’instant.</p>'}
   </div>
   <button class="btn ghost mt" onclick="CL.go('faith_hub')">← Rester avec ${esc(personName(current,{short:true}))} pour l’instant</button>
  </div>`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: V2-10] — six camps ANONYMES remplaçaient à l'origine le
   stage unique (perk 'tiger' tiré au hasard). ==== */
/* ==== [CORRECTIF C11] — Plan V4 LOT 5 : les six camps anonymes (FAITH_CAMPS)
   sont remplacés par les vraies salles de data-people.js (FAITH_GYMS, 10
   salles nommées, jamais lues par aucun écran avant ce correctif). Même
   geste qu'avant (un lieu, six semaines, un effet chiffré sur 3 attributs),
   mais chaque carte porte maintenant un nom, une ville, une spécialité, la
   culture de la salle en une phrase et le coach principal qui l'anime —
   faithEnsureCampGyms() (state.js) filtre à 3 salles éligibles selon la
   réputation (vs f.org) et le style du combattant, figées pour tout le mois
   en cours. FAITH_CAMPS et faithCampChoose() gardent leur nom (repli
   défensif si une sauvegarde antérieure a encore un id de l'ancien pool),
   mais la liste par défaut ne les propose plus. */
function scr_faith_camps(){
  const f=G.f, F=G.faith, visited=F.campsVisited||[];
  const gyms=faithEnsureCampGyms(f,F);
  return `<div class="scr" style="max-width:560px;margin:0 auto">
   <div class="bar"><span class="eyebrow">Choisir un stage</span><span class="eyebrow x" onclick="CL.go('faith_hub')">✕</span></div>
   <p class="lede small">Six semaines, une seule salle possible cette fois-ci.</p>
   <div style="display:flex;flex-direction:column;gap:10px;margin-top:12px">
   ${gyms.map(g=>{
     const coach=FAITH_COACHES.find(c=>c.id===g.coachId)||{firstName:'',lastName:'',cost:0};
     const already=visited.includes(g.id);
     const cost=coach.cost||0;
     const afford=(f.earnings||0)>=cost;
     const flag=(typeof COUNTRIES!=='undefined'&&COUNTRIES[g.ck])?COUNTRIES[g.ck].flag:'';
     const effect=(GYM_SPECIALTY_ATTRS[g.specialty]||[]).map(k=>`+3 ${attrLabel(k)}`).join(' · ');
     return `<div class="opp" style="padding:14px;text-align:left;${afford?'':'opacity:.55'}" onclick="${afford?`CL.faithCampChoose('${g.id}')`:''}">
       <b style="font-size:15px">${esc(g.name)}${already?' <span class="muted small">(déjà fait)</span>':''}</b>
       <div class="muted small mt">${esc(g.city)} ${flag} · ${specialtyLabel(g.specialty)} · ${cost}k$</div>
       <div class="small mt">« ${esc(g.culture)} »</div>
       <div class="muted small mt">Coach principal : ${esc(coach.firstName)} ${esc(coach.lastName)}</div>
       <div class="mono small mt" style="color:var(--gold)">${effect}</div>
     </div>`;
   }).join('')}
   </div>
   <button class="btn ghost mt" onclick="CL.go('faith_hub')">← Retour</button>
  </div>`;
}
/* ==== [ANCRE: V2-09] — pool d'intersaison. L'ancien FA-15 figeait trois
   options permanentes (Repos/Sparring/Stage) ; ici, exactement 3 sont
   TIRÉES parmi ce pool à chaque intersaison, avec au moins 2 catégories
   différentes parmi les 3 montrées, un cooldown de 3 intersaisons par
   entrée déjà utilisée, et jamais le même trio deux années de suite
   (F.lastTrio). Portée réduite à 15 entrées (au lieu des 24 minimum
   demandées par le document) — même choix de réduction assumée et notée
   que pour FAITH_BUILDUP_EVENTS (V2-22/23, lot précédent) : le tirage à 3
   sur 15 offre déjà une vraie variation d'une année à l'autre dans le
   temps disponible pour ce lot. Les trois options historiques (repos/
   sparring/stage) restent dans le pool, pondérées plus fort, mais ne sont
   plus garanties. */
/** Tire exactement 3 entrées éligibles du pool, ≥2 catégories différentes,
 * en excluant celles en cooldown et le trio de l'année précédente.
 * @param {object} f @param {object} F @returns {object[]} */
function faithIntersaisonDraw(f,F){
  const cooldowns=F.intersaisonCooldown||{};
  let pool=FAITH_INTERSAISON_POOL.filter(e=>{
    if((cooldowns[e.id]||0)>0) return false;
    try{ return e.req(f,F); }catch(err){ return true; }
  });
  if(pool.length<3) pool=FAITH_INTERSAISON_POOL.filter(e=>{ try{ return e.req(f,F); }catch(err){ return true; } });
  const weighted=[]; for(const e of pool) for(let i=0;i<(e.weight||1);i++) weighted.push(e);
  let attempt=0, picked=[];
  do{
    picked=[]; const bag=weighted.slice();
    while(picked.length<3 && bag.length){
      const idx=RI(0,bag.length-1); const e=bag.splice(idx,1)[0];
      if(!picked.some(p=>p.id===e.id)) picked.push(e);
    }
    attempt++;
  } while(attempt<8 && (new Set(picked.map(p=>p.categorie)).size<2 || (F.lastTrio && picked.every(p=>F.lastTrio.includes(p.id)))));
  return picked;
}
/* ==== [ANCRE: V2-09] — variante idempotente de faithIntersaisonDraw : le
   tirage ne doit être fait qu'une fois par mois d'intersaison (sinon
   chaque rendu de l'écran retirerait 3 options différentes), même schéma
   que faithEnsureOffer (V2-16, ui-08). Les cooldowns ne descendent qu'une
   fois par intersaison RÉELLE, ici, jamais au fil des rendus. */
function faithEnsureIntersaisonDraw(f,F){
  if(F.currentIntersaison && F.currentIntersaison.month===F.month) return F.currentIntersaison.picks;
  const cds=F.intersaisonCooldown||(F.intersaisonCooldown={});
  for(const k in cds) cds[k]=Math.max(0,cds[k]-1);
  const picks=faithIntersaisonDraw(f,F);
  F.currentIntersaison={month:F.month,picks:picks.map(p=>p.id)};
  return F.currentIntersaison.picks;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: FAITH_TRAIN_SCOUT_YEAREND] — Lot 2 du mode MMA Faith ==== */
/* ==== [ANCRE: FAITH_OFFRES_TENTATION] — les huit privilèges formaient un mur
   de cartes toutes au même poids visuel, où « Repos gratuit » et « Influence
   sur les juges » se ressemblaient. Ils ne disparaissent pas : ils viennent
   au joueur, un à la fois, mis en scène. buyFaithPerk() reste le résolveur,
   inchangé — seule la surface change. La mécanique cesse d'être un magasin
   et redevient une tentation, ce qui est aussi la seule façon de faire peser
   les scandales du Score de Légende : on ne choisit pas de tricher dans un
   menu, on cède à une proposition. Les req garantissent qu'on ne propose
   jamais une dépense que le joueur ne peut pas couvrir. ==== */
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: FAITH_BRANCHES_CREATION] — les choix de création ne filtraient
   aucun événement : origine, cercle et hygiène de vie n'étaient que des
   deltas déguisés. Ces entrées se branchent sur f._origin / f._circle /
   f._lifestyle / f._stable, désormais conservés (finalizeFaithDraft, ui-08),
   via le champ `req` que le pool supportait déjà — aucune modification du
   moteur d'événements n'a été nécessaire. Chaque choix de création ouvre au
   moins deux situations que les autres ne verront jamais. ==== */
/* ==== [FIN ANCRE] ==== */
function formatEventDelta(d){
  if(!d || !d.length) return '';
  return d.map(([k,v])=>{
    const lbl=k==='morale'?'Moral':k==='form'?'Forme':attrLabel(k);
    if(v===0) return '';
    const shown=Math.sign(v)*Math.max(1,Math.round(Math.abs(v)/5)); // jamais 0 pour un vrai effet, toujours au moins ±1
    return `<span class="tag2" style="border-color:${shown>=0?'var(--win)':'var(--loss)'};color:${shown>=0?'var(--win)':'var(--loss)'}">${shown>=0?'+':''}${shown} ${lbl}</span>`;
  }).join('');
}
/* ==== [ANCRE: FAITH_RISQUE_DECLARE] — un choix Faith n'est plus un delta
   certain mais un pari lisible. On affiche la mise ET la probabilité de
   rater, jamais le résultat ni l'espérance : le joueur doit pouvoir
   arbitrer, pas calculer une ligne optimale. Jouer prudent doit donner des
   carrières correctes et plates, jouer risqué une variance élevée au plafond
   très supérieur — sans qu'aucune ligne ne domine.
   Les événements sans champ `risk` restent parfaitement déterministes : la
   compatibilité avec le pool existant est totale, et il FAUT que la moitié
   le reste, sinon le contraste disparaît et le risque cesse de se voir. ==== */
/* ==== [CORRECTIF FA-21] — un pourcentage exact ("35% de rater") invite au
   calcul et rouvre exactement la porte que FA-20 referme : le joueur
   recommence à arbitrer sur un chiffre plutôt que sur ce qu'on lui raconte.
   Trois paliers qualitatifs, dérivés du même champ c.risk (aucune donnée
   changée). Absence de risque = silence complet, pas "Sûr" : un badge sur
   CHAQUE carte sature l'écran, l'absence de marqueur EST le signal. Le
   filet rouge à gauche de la carte (posé séparément par l'appelant) reste
   l'unique repère visuel — un signal, un texte, rien de plus. ==== */
function formatRiskBadge(c){
  if(!c.risk) return '';
  const texte=c.risk<=0.25?'Ça peut mal tourner':c.risk<=0.45?'C’est un pari':'Vous savez que c’est stupide';
  return `<span class="tag2" style="border-color:var(--f-red-hi);color:var(--gold)">${texte}</span>`;
}
function scr_faith_event(){
  const ev=G.faith.currentEvent;
  if(!ev) return `<div class="scr center intro"><p class="lede">Aucun événement en cours.</p><button class="btn ghost mt" onclick="CL.go('faith_hub')">Retour</button></div>`;
  const f=G.f;
  /* ==== [ANCRE: FAITH_PROTEGE_VISIBLE] — la trahison du protégé est le seul
     écran du mode autorisé à casser le gabarit : pas de barre de saison, pas
     de jauges, titre au double de la taille habituelle, fond retourné. Une
     rupture de gabarit se lit comme un signal d'importance avant même que le
     texte soit lu — c'est ce qui distingue l'aboutissement de ce système de
     n'importe quel autre événement de la pioche. ==== */
  /* ==== [CORRECTIF FA-20] — les deltas (formatEventDelta) et la prime
     s'affichaient sur CHAQUE carte avant même le clic : le joueur arbitrait
     sur les chiffres, jamais sur le texte — l'exact inverse de la règle
     déjà tenue par la création (FAITH_CREATION_SEQUENTIELLE). Résolution en
     deux temps sur LE MÊME écran : G.faith.eventResolved (posé par
     chooseFaithEvent(), ui-08) fait basculer ce rendu vers la vue "choix
     retenu seul + conséquence révélée", sans navigation supplémentaire.
     .stagger réutilise l'échelonnement déjà utilisé pour les listes
     ailleurs dans le jeu, plutôt que d'inventer une seconde animation. ==== */
  const resolved=G.faith.eventResolved;
  if(ev.id==='evt_frankenstein_betrayal'){
    if(resolved){
      const c=ev.choices[resolved.idx];
      return `<div class="scr" style="max-width:560px;margin:0 auto;min-height:90vh;display:flex;flex-direction:column;justify-content:center;background:var(--panel2)">
       <div class="eyebrow" style="color:var(--gold)">Ce que vous avez construit</div>
       <h2 class="hero-name" style="font-size:34px;line-height:1.06">${esc(ev.title)}</h2>
       <p style="font-size:15px;line-height:1.55">${esc(ev.text)}</p>
       <div class="opp" style="padding:16px;min-height:72px;text-align:left">
         <b style="font-size:15px">${esc(c.label)}</b>
       </div>
       <div class="stagger" style="margin-top:20px">
         <div class="tagrow">${formatEventDelta(resolved.deltas)}</div>
         ${resolved.traitAcquired?`<p class="small" style="color:var(--gold);margin-top:12px">NOUVEAU TRAIT ACQUIS : ${esc(resolved.traitAcquired)}</p>`:''}
       </div>
       <button class="btn primary" style="width:100%;height:56px;margin-top:32px;font-size:16px" onclick="CL.faithEventContinue()">CONTINUER</button>
      </div>`;
    }
    /* ==== [ANCRE: V3_EFFETS_AVANT_CLIC] — Plan V3 Loi 6 / §5.2.3 point 3 (P10) :
       un choix qui n'affiche pas ses effets est interdit. formatEventDelta()
       existe déjà (jusqu'ici réservé à l'affichage après résolution) ; le
       risque reste qualitatif (ancre FAITH_RISQUE_DECLARE) : on annonce qu'il
       y a un risque, jamais sa probabilité. Vaut pour TOUS les événements de
       cet écran (ce cas Frankenstein comme le rendu générique juste en
       dessous), pas seulement l'un d'eux.
       Exception à documenter : le choix de coach (LOT 5, C12) affiche le
       palmarès du coach, PAS un delta d'attributs — un être humain ne se
       choisit pas au calcul (arbitrage §4 contradiction 3). Ne pas
       "corriger" cette incohérence apparente là-bas.
       Seconde exception (même arbitrage) : un choix peut porter `hideDelta:
       true` (lu dans le rendu générique juste en dessous) pour cacher SON
       PROPRE tagrow avant clic sans priver les autres choix du même
       événement — ex. "Rester fidèle" (evt_br_regional_coach, LOT 5, C12) :
       la fidélité à un coach ne se pèse pas non plus en chiffres, le
       joueur la découvre dans la vue résolue (formatEventDelta(resolved.
       deltas) plus bas, jamais retiré). ==== */
    return `<div class="scr" style="max-width:560px;margin:0 auto;min-height:90vh;display:flex;flex-direction:column;justify-content:center;background:var(--panel2)">
     <div class="eyebrow" style="color:var(--gold)">Ce que vous avez construit</div>
     <h2 class="hero-name" style="font-size:34px;line-height:1.06">${esc(ev.title)}</h2>
     <p style="font-size:15px;line-height:1.55">${esc(ev.text)}</p>
     <div style="display:flex;flex-direction:column;gap:10px">
       ${ev.choices.map((c,i)=>`<div class="opp" style="padding:16px;min-height:72px;text-align:left" onclick="CL.chooseFaithEvent(${i})">
         <b style="font-size:15px">${esc(c.label)}</b>
         ${c.d?`<div class="tagrow" style="margin-top:8px">${formatEventDelta(c.d)}</div>`:''}
         ${c.risk?`<div class="mono small" style="margin-top:6px;color:var(--warn)">Ça peut mal tourner.</div>`:''}
       </div>`).join('')}
     </div>
    </div>`;
  }
  /* ==== [FIN ANCRE] ==== */
  if(resolved){
    const c=ev.choices[resolved.idx];
    return `<div class="scr" style="max-width:560px;margin:0 auto">
     <div class="eyebrow">${((G.faith.month||0)%2===0)?'La salle':'Le monde'}</div>
     <h2 class="hero-name" style="font-size:28px;line-height:1.1">${esc(ev.title)}</h2>
     <p class="lede small">${esc(ev.text)}</p>
     <div class="opp" style="padding:16px;min-height:72px;text-align:left">
       <b style="font-size:15px">${esc(c.label)}</b>${resolved.reward?`<span class="small" style="color:var(--win)"> (+${resolved.reward}k$)</span>`:''}
     </div>
     <div class="stagger" style="margin-top:20px">
       <p class="small muted" style="margin:0">${resolved.failed?'Ça n’a pas tourné comme prévu.':'C’est fait.'}</p>
       <div class="tagrow" style="margin-top:10px">${formatEventDelta(resolved.deltas)}</div>
       ${resolved.traitAcquired?`<p class="small" style="color:var(--gold);margin-top:12px">NOUVEAU TRAIT ACQUIS : ${esc(resolved.traitAcquired)}</p>`:''}
     </div>
     <button class="btn primary" style="width:100%;height:56px;margin-top:32px;font-size:16px" onclick="CL.faithEventContinue()">CONTINUER</button>
    </div>`;
  }
  return `<div class="scr" style="max-width:560px;margin:0 auto">
   <div class="eyebrow">${((G.faith.month||0)%2===0)?'La salle':'Le monde'}</div>
   <h2 class="hero-name" style="font-size:28px;line-height:1.1">${esc(ev.title)}</h2>
   <p class="lede small">${esc(ev.text)}</p>
   <div style="display:flex;flex-direction:column;gap:10px">
     ${ev.choices.map((c,i)=>{
       const locked=c.cost&&(f.earnings||0)<c.cost;
       /* Un choix risqué porte UN seul marqueur — un filet à gauche. Trois
          signaux redondants annuleraient le gain de lisibilité. */
       const risque=!!c.risk;
       return `<div class="glass${locked?'':' opp'}" style="padding:16px;min-height:72px;text-align:left;${risque?'border-left:3px solid var(--f-red-hi);':''}opacity:${locked?0.4:1};cursor:${locked?'not-allowed':'pointer'}" ${locked?'':`onclick="CL.chooseFaithEvent(${i})"`}>
         <b style="font-size:15px">${esc(c.label)}</b>${c.cost?`<span class="muted small" style="color:var(--loss)"> (-${c.cost}k$)</span>`:''}
         <div class="tagrow" style="margin-top:10px">${(c.d&&!c.hideDelta)?formatEventDelta(c.d):''}${formatRiskBadge(c)}</div>
       </div>`;
     }).join('')}
   </div></div>`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: FAITH_SERMENTS] — la rejouabilité ne vient pas d'ajouter du
   contenu, elle vient de contraintes qui rendent problématique le contenu
   déjà connu. Un serment se jure avant la carrière : il n'est ni acheté, ni
   équipé, ni stocké — il se déclare et il se tient. Il ne donne AUCUN
   avantage mécanique, seulement un multiplicateur sur le Score de Légende et
   une mention permanente. C'est le point : une carrière optimisée pour le
   serment n'est pas une carrière optimisée pour la note, et il faut trancher
   avant de commencer. Quatre serments seulement sont proposés, tirés d'un
   pool plus large : offrir la liste complète inviterait à l'optimisation,
   la rareté de l'offre force l'engagement. ==== */
/** Le serment est-il tenu au moment de la retraite ?
 * Un serment rompu en cours de route l'est définitivement.
 * @param {object} oath @param {object} f @param {object} F G.faith @returns {boolean} */
function faithOathFulfilled(oath,f,F){
  if(!oath || oath.broken) return false;
  const titres=((typeof G!=='undefined'&&G&&G.titleHistory)||[]).filter(r=>r.champion===f.name).length;
  switch(oath.id){
    case 'no_shortcut': return true;              /* purement négatif : tenu tant que non rompu */
    case 'homegrown':   return true;
    case 'old_lion':    return !!F.beltAfter34;
    case 'undefeated':  return titres>0 && (f.L||0)===0;
    case 'blood_master':return !!F.nemesisBeaten;
    case 'long_road':   return (f.age||0)>=38;
    default: return false;
  }
}
function faithOathBadge(F){
  const o=F&&F.oath; if(!o) return '';
  return `<div class="mono" style="font-size:11px;color:${o.broken?'var(--muted)':'var(--gold)'};${o.broken?'text-decoration:line-through':''}">${o.broken?'Serment rompu':'✦'} ${esc(o.label)}</div>`;
}
function scr_faith_oath(){
  const choix=(G.faithDraft&&G.faithDraft.oathPool)||[];
  return `<div class="scr" style="max-width:560px;margin:0 auto">
   <div class="eyebrow" style="font-size:12px;letter-spacing:.14em">Avant de commencer, jurez-vous quelque chose ?</div>
   <p class="muted small">Un serment n’apporte aucun avantage. Tenu jusqu’au bout, il pèse sur ce qu’on retiendra de vous.</p>
   <div style="display:flex;flex-direction:column;gap:12px">
     ${choix.map(o=>`<div class="opp" style="padding:16px;min-height:96px;text-align:left;border:1px solid var(--line)" onclick="CL.swearOath('${o.id}')">
       <div class="hero-name" style="font-size:16px">« ${o.texte} »</div>
       <div class="muted" style="font-size:12px;margin-top:8px">${o.rappel}</div>
     </div>`).join('')}
   </div>
   <button class="btn ghost" onclick="CL.swearOath('')">Ne rien jurer</button>
  </div>`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: FAITH_SCORE_LEGENDE] — scalaire de clôture du mode Faith.
   Sans un nombre unique en sortie, une carrière narrative n'a aucune raison
   d'être recommencée : c'est lui qui rend une partie comparable à la
   précédente. Quatre familles en tension DÉLIBÉRÉE — « longévité &
   intégrité » punit exactement les leviers qui maximisent « palmarès »
   (dopage, juges achetés, guerres d'usure enchaînées). Le 100/100 est donc
   structurellement hors d'atteinte — plafond réel mesuré à 95 — et c'est
   voulu : une note plafonnée par design protège la rejouabilité mieux
   qu'une note atteignable.
   Tout est calculé sur des données qui existent déjà — aucun compteur
   inventé pour l'occasion, hors les pics et scandales posés au fil du jeu. ==== */
/* ==== [ANCRE: V2-35] — refonte autour de 3 piliers pondérés, remplaçant
   les 5 sous-scores précédents (palmarès/sommet/intégrité/empreinte/
   fortune, pondération de fait ~32/26/18/14/10 — proche mais pas alignée
   sur le document). Note qui s'accumulait événement par événement,
   inflationniste sur une longue carrière médiocre : recomposée pour que
   CE QUE VOUS AVEZ ÉTÉ À VOTRE SOMMET (pic, ~40) et CE QUE VOUS AVEZ
   GAGNÉ (palmarès, ~40) pèsent l'essentiel, la trace laissée (longévité,
   hype, serment tenu, scandales en négatif) restant secondaire (~20).
   Validation manuelle (règle du document — pas d'objectif numérique ici,
   contrairement à V2-39) : une carrière 15-2 avec ceinture doit noter
   nettement plus haut qu'une 40-25 sans titre — vérifié en testant les
   deux profils avant livraison (cf. commit). */
/* ==== [ANCRE: V3_CAREER_LIFETIME_TOTAL] — Plan V3 LOT 7 §5.7.2 point 4 :
   "BUG — longueur de carrière […] j'ai pu faire seulement 15 combats".
   INVESTIGATION (obligatoire, cf. spec) : faithFightsPlanned()/
   faithGenerateCalendar()/nextFaithYear()/isDeclining() ont été audités —
   aucun n'empêche mécaniquement d'atteindre 25-40 combats. Une simulation
   de 8 carrières complètes (jsdom, clickThrough jusqu'à retraite naturelle)
   donne un total RÉEL de 25 à 32 combats par carrière (médiane ~28-29),
   déjà dans la cible du document, avec retraite naturelle vers 37-40 ans
   (isDeclining()). La cause racine du "15 combats" n'est donc PAS un
   plafond de combats manquant, mais un problème d'AFFICHAGE : turnPro()
   (ui-05) réinitialise volontairement f.W/f.L/f.history au passage
   amateur→pro (le palmarès amateur est archivé à part dans f.amaRec, par
   conception — cf. ANCRE P4P_SCORE_80_20) — et AUCUN écran ne recombine
   jamais les deux pour afficher le total de carrière réel. Un joueur qui a
   disputé 14 combats amateurs puis 17 combats pro ne voit jamais que "17"
   (son record pro affiché partout), jamais son vrai total de 31. Corrigé
   ici en exposant le total réel (épilogue, fiche) plutôt qu'en modifiant
   le rythme de combat, qui n'est pas le problème. */
function faithCareerTotalFights(f){
  /* [ANCRE: V3_HISTORIQUE_PRESERVE] Plan V4 C2 : amaHistory (ui-05 turnPro)
     est la source exacte du volet amateur depuis que l'historique est
     déplacé plutôt que détruit ; amaRec.W+L reste le repli pour une
     sauvegarde antérieure à ce correctif, où amaHistory n'existe pas. */
  const ama=f.amaHistory?f.amaHistory.length:((f.amaRec&&(f.amaRec.W+f.amaRec.L))||0);
  return ama+((f.history||[]).length);
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: V4_C10_WEIGH_IN] — « pesées réussies » (P21.14), plan V4 C10 :
   weighInPassed est posé par combat depuis la résolution (ui-02/ui-08,
   ANCRE V4_C10_WEIGH_IN) et copié sur l'entrée d'historique (ui-05,
   HISTORIQUE_ENRICHI). Absent (undefined) sur une entrée d'une sauvegarde
   antérieure à ce correctif : traité comme réussi plutôt que comme raté,
   pour ne pas faire chuter le compteur d'une carrière déjà en cours sur des
   combats qui n'ont jamais posé la question. */
function faithWeighInsPassed(f){
  const all=(f.amaHistory||[]).concat(f.history||[]);
  return all.filter(h=>h.weighInPassed!==false).length;
}
/* ==== [FIN ANCRE] ==== */
function computeLegendScore(f){
  const F=(typeof G!=='undefined'&&G&&G.faith)||{};
  const titles=((typeof G!=='undefined'&&G&&G.titleHistory)||[]).filter(r=>r.champion===f.name).length;

  /* PIC (~40) : le meilleur overall ET le meilleur rang jamais atteints —
     jamais l'état final, une fin de carrière en déclin ne doit pas effacer
     le sommet (peakOverall/peakRank, prepareFaithYearEnd, ui-08). */
  const peakOverall=F.peakOverall||f.overall||0;
  const ovrPart=clamp(Math.round((peakOverall-40)/55*24),0,24);
  const peakRank=(F.peakRank!=null)?F.peakRank:99;
  const rankPart=clamp(Math.round((21-Math.min(peakRank,21))/20*16),0,16);
  const pic=clamp(ovrPart+rankPart,0,40);

  /* PALMARÈS (~40) : titres, défenses, et la meilleure série jamais tenue
     (bestStreak, même ancre de suivi que les autres pics de carrière). */
  const bestStreak=Math.max(F.bestStreak||0,f.streak||0,0);
  const palmares=clamp(titles*11+(f.defenses||0)*3+Math.min(bestStreak,8)*2,0,40);

  /* TRACE (~20) : longévité (freinée par l'usure crânienne cumulée,
     jamais sous un plancher — l'usure ne redevient jamais gratuite),
     hype, serment tenu, scandales en négatif. */
  const years=Math.max(1,(F.year||2026)-2026);
  const usure=Math.round((F.dmgHeadTotal||0)/70);
  const longevite=clamp(Math.round(years*1.1)-usure,0,10);
  const hype=clamp(Math.round(((f.hypeBonus||1)-1)*10),0,4);
  const oathTenu=(F.oath && typeof faithOathFulfilled==='function' && faithOathFulfilled(F.oath,f,F))?3:0;
  const trace=clamp(longevite+hype+oathTenu-((F.scandals||0)*4),0,20);

  return {total:clamp(pic+palmares+trace,0,100), pic, palmares, trace};
}
/* ==== [ANCRE: FAITH_MEMOIRE_LEGENDES] — le score affiché à l'épilogue
   (computeLegendScore().total, majoré ×1,15 si le serment est tenu) était
   recalculé une seule fois, en ligne, dans scr_faith_epilogue(). Chantier 3
   (mémoire des légendes) a besoin de la MÊME valeur au moment de la
   retraite, pour la figer dans G.faith.finalScore avant que le combattant
   ne soit remplacé (newFaithCareer() réinitialise G) — recalculer la
   formule à cet autre endroit aurait dupliqué la logique (mult, plafond)
   avec un risque de désynchronisation si l'une des deux copies changeait
   sans l'autre. Un seul point de calcul, appelé des deux côtés. ==== */
function faithFinalScore(f,F){
  const sc=computeLegendScore(f);
  const serment=(F&&F.oath)||null;
  const tenu=serment?faithOathFulfilled(serment,f,F||{}):false;
  return Math.min(100,Math.round(sc.total*(tenu?1.15:1)));
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: FAITH_EPILOGUE] — l'écran de sortie du mode. Trois temps qui
   ne coexistent jamais dans la même zone de lecture : le bandeau, puis la
   note SEULE, puis sa décomposition. La note est le seul objet de sa zone —
   rien ne lui dispute l'attention. La décomposition se remplit ligne à ligne
   (180 ms d'écart) : un total qui se construit devant le joueur se retient
   comme un accomplissement, un total posé d'emblée se lit comme une donnée.
   Une seule action en bas : au moment précis où le joueur décide de rejouer,
   il ne doit avoir aucun choix à arbitrer. ==== */
function faithScoreRow(label,val,max,delay){
  const pct=Math.max(0,Math.min(100,Math.round((val/max)*100)));
  return `<div style="display:flex;align-items:center;gap:12px;height:44px;border-bottom:1px solid var(--line)">
    <span class="eyebrow" style="flex:0 0 128px;font-size:11px;letter-spacing:.08em">${label}</span>
    <span style="flex:1;height:3px;background:var(--line);position:relative;overflow:hidden">
      <i style="position:absolute;inset:0 auto 0 0;width:${pct}%;background:var(--f-red-hi);transform-origin:left;animation:faithFill .5s ${delay}ms both"></i>
    </span>
    <span class="mono" style="flex:0 0 52px;text-align:right;font-size:13px">${val}<span class="muted">/${max}</span></span>
  </div>`;
}
/* ==== [ANCRE: V2-35] — trois lignes désormais, pas cinq (pic/palmarès/
   trace). Repli explicite sur l'ancienne décomposition à 5 lignes quand
   `sub` vient d'une carrière du Panthéon sauvegardée AVANT ce correctif
   (sub.pic absent) — jamais de ligne à "0/100" trompeuse pour une donnée
   qui n'a simplement jamais existé sous ce nom-là.
 * @param {object} sub computeLegendScore() @param {number[]} delays */
function faithScoreRows(sub,delays){
  const d=delays||[0,0,0];
  if(sub.pic!=null) return `${faithScoreRow('Pic',sub.pic,40,d[0])}${faithScoreRow('Palmarès',sub.palmares,40,d[1])}${faithScoreRow('Trace',sub.trace,20,d[2])}`;
  return `${faithScoreRow('Palmarès',sub.palmares||0,32,d[0])}${faithScoreRow('Sommet',sub.sommet||0,26,d[1])}${faithScoreRow('Intégrité',sub.longevite||0,18,d[2])}${faithScoreRow('Empreinte',sub.empreinte||0,14,d[2])}${faithScoreRow('Fortune',sub.fortune||0,10,d[2])}`;
}
/* ==== [ANCRE: V3_CAREER_STATS_GRID] — Plan V3 LOT 7 §5.7.2 point 2 : "sous
   l'overall, tout le reste — en une grille dense, pas en prose […] bloc
   chiffres (grille mono, 12 cases max)". Portée réduite à ce que l'état du
   jeu suit déjà réellement (aucune donnée inventée) : temps de contrôle et
   coups mis/reçus sont désormais accumulés sur toute la carrière
   (f.careerSig/careerCtrl, ANCRE V3_CAREER_LIFETIME_STATS, ui-08) plutôt
   que remis à zéro chaque saison.
   ==== [ANCRE: V4_C10_WEIGH_IN] — "Pesées réussies" (P21.14), omise ici par
   la passe V3 faute d'équivalent pass/fail binaire, existe désormais
   (weighInPassed par combat, posé à la résolution du cutting). Ajoutée en
   13e case : le plafond de 12 de la spec V3 protégeait contre l'invention
   de données, pas contre une vraie donnée qui n'existait pas encore. ==== */
function faithCareerStatsGrid(f,F){
  const titles=((typeof G!=='undefined'&&G&&G.titleHistory)||[]).filter(r=>r.champion===f.name).length;
  const cell=(v,lbl)=>`<div style="border:1px solid var(--line);padding:8px;text-align:center"><div class="mono" style="font-size:15px">${v}</div><div class="eyebrow" style="font-size:9px;margin-top:2px;opacity:.8">${lbl}</div></div>`;
  const totalFights=faithCareerTotalFights(f);
  const cells=[
    cell(totalFights,'Combats (total)'),
    cell((f.ko||0)+(f.sub||0),'Finitions'),
    cell(f.ko||0,'KO/TKO'),
    cell(f.sub||0,'Soumissions'),
    cell(f.dec||0,'Décisions'),
    cell(f.careerSig||0,'Coups mis'),
    cell((F&&F.dmgHeadTotal)||0,'Coups encaissés'),
    cell(f.careerCtrl||0,'Temps de contrôle (s)'),
    cell(Math.max((F&&F.bestStreak)||0,f.streak||0,0),'Meilleure série'),
    cell((F&&F.peakRank!=null)?`#${F.peakRank}`:'—','Meilleur classement'),
    cell(formatArgent((F&&F.peakEarnings)||f.earnings||0),'Plus grosse bourse'),
    cell(titles,'Titres'),
    cell(`${faithWeighInsPassed(f)}/${totalFights}`,'Pesées réussies'),
  ];
  return `<div class="mt"><div class="eyebrow mb" style="font-size:11px">En chiffres</div>
   <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">${cells.join('')}</div></div>`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: FAITH_MEMOIRE_LEGENDES] — la comparaison au record personnel
   affiché sous la décomposition. Le silence complet passé un écart trop
   large est délibéré (effet Zeigarnik) : un petit manque donne envie de
   rejouer pour le combler, un manque énorme décourage — punition, pas
   motivation. Au-delà de 25 points d'écart, on affiche le record sans le
   chiffrer davantage. ==== */
function faithLegendCompareLine(total,previousBest){
  if(!previousBest) return {text:'Première légende écrite.',color:'var(--muted)'};
  if(total>previousBest) return {text:`Meilleure carrière — précédent record : ${previousBest}`,color:'var(--gold)'};
  if(total===previousBest) return {text:'À égalité avec ta meilleure carrière.',color:'var(--muted)'};
  const gap=previousBest-total;
  return {text:gap<=25?`Record personnel : ${previousBest} — il manquait ${gap} points`:`Record personnel : ${previousBest}`,color:'var(--muted)'};
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: V3_NEMESIS_EPILOGUE] — Plan V3 LOT 3 §P16 : "un destin dédié
   pour la némésis" à la clôture de la carrière — jamais juste absente si
   elle existe. Toujours cherchée dans G.roster : contrairement à tout
   autre combattant, la némésis est explicitement protégée du
   remplacement par un nouveau prospect tant qu'elle est en poste
   (isNemesis, advanceRoster(), ui-01) — elle ne peut donc jamais avoir
   disparu en silence au moment où l'épilogue s'affiche. */
function faithNemesisEpilogueBlock(f){
  if(!f.faithNemesisId) return '';
  const nem=(G.roster||[]).find(o=>o.id===f.faithNemesisId);
  if(!nem) return '';
  const rec=f.nemesisRecord||{w:0,l:0};
  const meAhead=rec.w>rec.l;
  const tied=rec.w===rec.l;
  const fate=nem.champion
    ?`${esc(fighterDisplayName(nem))} porte aujourd'hui une ceinture. Votre nom reste attaché au sien, que vous l'ayez voulu ou non.`
    :`${esc(fighterDisplayName(nem))} combat toujours, à ${nem.W||0}-${nem.L||0}. L'histoire entre vous deux n'est peut-être pas finie.`;
  const bilan=tied?`Face à face à égalité, ${rec.w}-${rec.l}.`:meAhead?`Vous menez ${rec.w}-${rec.l} sur cette rivalité — la dernière ligne de son bilan face au vôtre.`:`Il mène ${rec.l}-${rec.w} sur cette rivalité, jusqu'au bout.`;
  return `<div class="card mt" style="padding:14px;background:var(--panel2);border-left:3px solid var(--f-red-hi);text-align:left">
   <div class="eyebrow mb" style="font-size:11px;color:var(--f-red-hi)">${esc(nemesisTierLabel(rec.w+rec.l))} · némésis</div>
   <div class="small">${bilan}</div>
   <div class="small muted mt">${fate}</div>
  </div>`;
}
/* ==== [FIN ANCRE] ==== */
function scr_faith_epilogue(){
  const f=G.f, sc=computeLegendScore(f), F=G.faith||{};
  const peakOverall=F.peakOverall||f.overall||0;
  const debut=2026, fin=(G.faith&&G.faith.year)||debut;
  const serment=(G.faith&&G.faith.oath)||null;
  const tenu=serment?faithOathFulfilled(serment,f,G.faith||{}):false;
  /* ==== [ANCRE: FAITH_MEMOIRE_LEGENDES] — G.faith.finalScore/.previousBest
     sont figés par toLegacy() (ui-08) au moment de la retraite. Repli sur un
     recalcul en direct pour une partie déjà en cours au moment de ce
     correctif, dont la sauvegarde a transité par l'ancien toLegacy() qui ne
     posait pas ces deux champs. */
  const total=(G.faith&&typeof G.faith.finalScore==='number')?G.faith.finalScore:faithFinalScore(f,G.faith||{});
  const previousBest=(G.faith&&typeof G.faith.previousBest==='number')?G.faith.previousBest:getFaithBest();
  const compare=faithLegendCompareLine(total,previousBest);
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: FAITH_PAPIER_OBJET] — même traitement que la coupure de
     presse annuelle : le verdict d'une carrière est le second (et dernier)
     endroit où le papier a sa place. Les deux boutons d'action restent SUR
     LE NOIR, hors du papier — ce sont des commandes du jeu, pas le contenu
     du document. ==== */
  return `<div class="scr" style="max-width:560px;margin:0 auto">
   <div class="faith-paper">
     <div style="height:120px;display:flex;flex-direction:column;justify-content:flex-end;margin-bottom:32px">
       <div class="hero-name" style="font-size:34px;line-height:1.05">${esc(f.name)}</div>
       <!-- ==== [CORRECTIF V3_CAREER_LIFETIME_TOTAL] — le record affiché ici
            était SEULEMENT f.W-f.L (palmarès pro, réinitialisé par turnPro()
            au passage amateur→pro) — jamais le total réel de la carrière.
            Le total (faithCareerTotalFights) est désormais la donnée mise
            en avant ; le détail amateur/pro reste visible juste en dessous
            pour qui veut le détail, jamais caché. ==== -->
       <div class="mono" style="font-size:11px;color:var(--muted);margin-top:6px">${debut} – ${fin} · ${faithCareerTotalFights(f)} combats au total${f.ko?` · ${f.ko} KO`:''}</div>
       ${f.amaRec?`<div class="mono" style="font-size:10px;color:var(--muted);margin-top:2px">Amateur ${f.amaRec.W}-${f.amaRec.L} · Pro ${f.W}-${f.L}${f.D?`-${f.D}`:''}</div>`:''}
       <!-- ==== [ANCRE: V3_NICKNAME_HISTORY] — Plan V3 LOT 7 §5.7.2 point 3 :
            "historique des surnoms qu'on t'a donnés". f.nicknameHistory
            (checkNicknameEvolution, ui-05) existait déjà — accumulé mais
            jamais affiché nulle part. Le mécanisme "garder le surnom sous
            condition spécifique" (spec) reste hors périmètre : les surnoms
            évoluent déjà uniquement par le jeu (jamais choisis par le
            joueur), condition déjà proche de l'esprit de la demande. ==== -->
       ${(f.nicknameHistory&&f.nicknameHistory.length)?`<div class="mono" style="font-size:10px;color:var(--muted);margin-top:2px">Surnoms portés : ${f.nicknameHistory.map(esc).join(' → ')}${f.nick?` → ${esc(f.nick)}`:''}</div>`:''}
     </div>
     <!-- ==== [ANCRE: V3_OVERALL_VS_LEGENDE] — Plan V4 C8 (P21.1) : ce chiffre
          était le score composite (pic+palmarès+trace), sous une étiquette
          "Score de Légende" — un correctif de façade antérieur n'avait changé
          que le texte, jamais la valeur. Le grand chiffre de la fiche devient
          le pic d'overall réellement atteint (peakOverall, déjà suivi par
          prepareFaithYearEnd, ui-08) ; le score composite descend dans un
          bloc "Héritage" séparé, où sa décomposition pic/palmarès/trace a
          enfin un sens propre plutôt que de se faire passer pour l'overall.
          computeLegendScore() n'est pas modifié : il était juste, seulement
          au mauvais endroit. ==== -->
     <div style="text-align:center;padding:48px 0">
       <div class="hero-name" style="font-size:96px;font-weight:700;line-height:.9">${peakOverall}</div>
       <div class="mono" style="font-size:14px;color:var(--muted);margin-top:16px">/100 · Niveau atteint au sommet</div>
     </div>
     <div class="eyebrow" style="margin-top:32px">HÉRITAGE</div>
     <div style="text-align:center;padding:12px 0">
       <div class="hero-name" style="font-size:40px">${total}<span class="mono small">/100</span></div>
     </div>
     <div style="margin-bottom:12px">
       ${faithScoreRows(sc,[0,180,360])}
     </div>
     <div class="mono" style="font-size:12px;color:${compare.color};margin-bottom:12px">${compare.text}</div>
     ${faithCareerStatsGrid(f,G.faith)}
     ${faithJourneyBlock(G.faith)}
     ${serment?`<div class="mono" style="font-size:11px;color:${tenu?'var(--gold)':'var(--muted)'};${tenu?'':'text-decoration:line-through'}">${tenu?'✦ Serment tenu — score ×1,15':'Serment non tenu'} · ${esc(serment.label)}</div>`:''}
   </div>
   ${faithNemesisEpilogueBlock(f)}
   <button class="btn primary" style="width:100%;height:56px;margin-top:40px;font-size:16px" onclick="CL.faithRelaunchSame()">REPRENDRE LE MÊME CHEMIN</button>
   <button class="btn ghost" style="width:100%;margin-top:12px" onclick="CL.faithRelaunchEdit()">Changer une chose</button>
   <button class="btn ghost" style="width:100%;margin-top:8px" onclick="CL.newFaithCareer()">Repartir de zéro</button>
   <button class="btn ghost" style="width:100%;margin-top:8px" onclick="CL.go('faith_legends')">Voir les Légendes à battre</button>
  </div>`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: FAITH_LEGENDES_A_BATTRE] — couche 2 et 3 de la méta-
   progression Faith (dépend entièrement de FAITH_MEMOIRE_LEGENDES,
   state.js, qui alimente meta.faithLegends). L'épilogue pointait vers le
   Panthéon général — utile, mais générique à tous les modes et sans
   rapport avec le système de score propre à Faith. Cet écran remplace ce
   lien par une vitrine spécifique : la galerie des 12 meilleures carrières
   jamais scellées, et un face-à-face qui réutilise faithScoreRow() (déjà
   la brique visuelle de la décomposition sur l'épilogue) plutôt que
   d'inventer un second système d'affichage pour les mêmes cinq familles de
   score. Le Panthéon général reste à un clic du menu principal (cf.
   scr_title, ui-06) — retiré d'ici, il n'aurait sinon plus eu AUCUN chemin
   pour un joueur qui ne joue qu'en Faith.
   Volontairement absent : le "défi du jour" à origine/style/serment forcés
   par la date, qui faisait partie de la même proposition côté document
   mais a été explicitement écarté de cette passe. ==== */
/** Une carrière de la galerie, sélectionnable pour le face-à-face.
 * @param {object} e entrée de meta.faithLegends @param {number} idx rang (0-based) @param {boolean} sel sélectionnée */
function faithLegendCard(e,idx,sel){
  return `<div class="opp" style="padding:14px;text-align:left;${sel?'border:2px solid var(--gold);':''}" onclick="CL.toggleFaithLegendCompare('${e.id}')">
    <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px">
      <b style="font-size:15px">#${idx+1} ${esc(e.name)} ${e.flag||''}</b>
      <span class="mono" style="font-size:18px;flex:0 0 auto">${e.score}</span>
    </div>
    <div class="mono small muted" style="margin-top:4px">${e.W}-${e.L}${e.ko?` · ${e.ko} KO`:''} · ${e.years} an${e.years>1?'s':''}</div>
    ${(e.oath&&e.oath.fulfilled)?`<div class="mono small" style="color:var(--gold);margin-top:4px">✦ ${esc(e.oath.label)}</div>`:''}
  </div>`;
}
/** Décomposition d'une carrière pour le face-à-face — même faithScoreRow()
 * que la décomposition de l'épilogue, empilées plutôt que côte à côte :
 * faithScoreRow() a une étiquette à largeur fixe (128px) pensée pour la
 * pleine largeur de l'écran, pas pour tenir dans une demi-colonne. Les deux
 * décompositions complètes, l'une sous l'autre, restent lisibles à
 * n'importe quelle largeur d'écran sans toucher à faithScoreRow() elle-même.
 * @param {object} e entrée de meta.faithLegends */
function faithLegendCompareCol(e){
  return `<div style="margin-bottom:20px">
    <div class="hero-name" style="font-size:18px;margin-bottom:8px">${esc(e.name)} <span class="mono" style="font-size:14px;color:var(--muted)">— ${e.score}/100</span></div>
    ${faithScoreRows(e.sub,[0,0,0])}
  </div>`;
}
/* ==== [CORRECTIF FA-27] — les serments (FAITH_OATHS) sont l'idée de
   rejouabilité la plus forte du mode, mais rien ne les rendait
   partageables ni comparables : un seul record global écrasait la nuance
   entre « la meilleure carrière, toutes conditions confondues » et « la
   meilleure carrière EN TENANT tel serment précis ». Chaque entrée de
   meta.faithLegends porte déjà `oath:{label,fulfilled}` (posé par
   toLegacy(), ui-08) — aucune nouvelle donnée à collecter, seulement un
   filtre et une ligne d'affichage. Seules les carrières où le serment a
   été TENU comptent pour un record par serment : un serment rompu n'est
   pas une carrière à battre pour ce serment-là. ==== */
function scr_faith_legends(){
  const meta=loadMetaStats();
  const list=(meta.faithLegends||[]);
  const filtreId=G.faithLegendsFilterOath||null;
  const filtre=filtreId?FAITH_OATHS.find(o=>o.id===filtreId):null;
  const filtered=filtre?list.filter(e=>e.oath&&e.oath.fulfilled&&e.oath.label===filtre.label):list;
  const sel=G.faithLegendsCompare||[];
  const selected=sel.map(id=>filtered.find(e=>e.id===id)).filter(Boolean);
  const pills=`<div class="pills" style="margin-bottom:12px">
    <span class="pill ${!filtreId?'on':''}" onclick="CL.setFaithLegendsFilter('')">Tous</span>
    ${FAITH_OATHS.map(o=>`<span class="pill ${filtreId===o.id?'on':''}" onclick="CL.setFaithLegendsFilter('${o.id}')">${esc(o.label)}</span>`).join('')}
  </div>`;
  const record=filtre?(filtered.length?`Meilleure carrière avec « ${esc(filtre.label)} » : ${filtered[0].score}.`
    :`Aucune carrière n’a encore tenu ce serment jusqu’au bout.`):null;
  return `<div class="scr" style="max-width:560px;margin:0 auto">
   <div class="bar"><span class="eyebrow">Légendes à battre</span><span class="eyebrow x" onclick="CL.go('faith_epilogue')">✕</span></div>
   ${list.length?`<p class="lede small">Les meilleures carrières jamais écrites. Touche deux cartes pour les comparer.</p>
   ${pills}
   ${record?`<p class="mono small" style="color:var(--gold);margin-bottom:12px">${record}</p>`:''}
   ${filtered.length?`<div style="display:flex;flex-direction:column;gap:10px">${filtered.map((e,i)=>faithLegendCard(e,i,sel.includes(e.id))).join('')}</div>`:''}
   ${selected.length===2?`<div class="eyebrow" style="margin:24px 0 12px">FACE-À-FACE</div>
     ${faithLegendCompareCol(selected[0])}${faithLegendCompareCol(selected[1])}`:''}`
   :`<p class="lede small">Aucune légende enregistrée pour l’instant. Termine une carrière pour l’inscrire ici.</p>`}
  </div>`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: FAITH_PRESSE] — le bilan annuel était une grille de quatre
   stat-cards et une liste à puces : le moteur rendait compte de lui-même,
   personne ne racontait la saison. C'est pourtant le point d'apprentissage
   de la boucle — ceux qui plafonnent sont ceux qui enchaînent sans lire le
   bilan. Le feedback est désormais écrit par le monde : un article court,
   dont l'angle est choisi sur l'état réel de la saison, et dont le TON suit
   la personnalité publique du combattant (un Vilain n'a pas la même presse
   qu'un Taiseux — c'est là que le choix de création devient enfin visible).
   Les chiffres ne disparaissent pas : ils passent SOUS l'article et cessent
   d'être le message pour redevenir la source. ==== */
/* ==== [ANCRE: V2-33] — un journaliste nommé, pas un média anonyme tiré par
   year%length. F.journalist={name,media,sentiment} est posé UNE FOIS pour
   toute la carrière (faithEnsureJournalist, même schéma idempotent que
   faithEnsureOffer/faithEnsureIntersaisonDraw), sentiment de -3 à +3,
   ajusté une fois par an (faithUpdateJournalistSentiment, gardé par
   lastSentimentYear pour ne jamais compter deux fois la même saison). */
function faithEnsureJournalist(F){
  if(F.journalist) return F.journalist;
  F.journalist={name:pick(FAITH_JOURNALIST_NAMES),media:pick(FAITH_PRESSE_MEDIAS),sentiment:0};
  return F.journalist;
}
function faithUpdateJournalistSentiment(F,angle){
  const j=faithEnsureJournalist(F);
  if(j.lastSentimentYear===F.year) return j;
  j.lastSentimentYear=F.year;
  if(angle==='ascension'||angle==='consecration') j.sentiment=clamp(j.sentiment+1,-3,3);
  else if(angle==='chute'||angle==='usure') j.sentiment=clamp(j.sentiment-1,-3,3);
  if(((F.scandals||0)-(F.startOfYearScandals||0))>0) j.sentiment=clamp(j.sentiment-1,-3,3);
  return j;
}
/* ==== [ANCRE: V2-34] — remplace "Estimation à ce jour : ${chiffre}" (un
   chiffre nu, hors sujet dans un article de presse) par le verdict du
   journaliste ET la place qu'il donne dans la division — le score de
   légende lui-même disparaît de la coupure, il reste seulement sur la
   fiche/épilogue (faithScoreRows, computeLegendScore). */
/* ==== [CORRECTIF V3_JOURNALIST_MEMORY] — Plan V3 LOT 7 §5.7.1 point 3 (P20) :
   "Karim Belaïd m'a répété la même phrase toute ma carrière, alors que je
   suis n°1 — il disait la même chose quand j'étais n°30". j.sentiment
   (déjà réel, évolue chaque année — cf. faithUpdateJournalistSentiment)
   ne pouvait jamais se CONTREDIRE : un journaliste sceptique restait
   sceptique mot pour mot après une ascension spectaculaire. F.rankHistory
   (worldTick, engine.js, LOT 0) donne la trajectoire réelle — comparée
   au premier rang connu, pas seulement au sentiment accumulé. Portée
   réduite face à la demande complète (pool ≥40 segmenté par tier) : une
   seule ligne de retournement, ajoutée au constat existant plutôt que de
   dupliquer tout le système de verdict. */
function faithJournalistVerdict(F,f,ys){
  const j=faithEnsureJournalist(F);
  const rank=ys.rank;
  const rankTxt=rank?` Il le classe ${rank}${rank===1?'er':'e'} de sa division${rank>1?` — il en met ${rank-1} devant lui`:''}.`:'';
  const hist=Array.isArray(F.rankHistory)?F.rankHistory:[];
  const firstRank=hist.length?hist[0].rank:null;
  const surprised=firstRank!=null && rank!=null && (firstRank-rank)>=15 && j.sentiment<2;
  const stance=surprised
    ?`« Je ne le voyais pas arriver, très honnêtement. Il était ${firstRank}e à mes yeux il y a quelques saisons. »`
    :j.sentiment>=2
    ?`« ${esc(f.name)}, je le dis depuis un moment maintenant : c’est un des meilleurs de sa génération. »`
    :j.sentiment<=-2
    ?'« Je maintiens ce que j’ai écrit sur lui. Rien cette année ne m’a fait changer d’avis. »'
    :'« Un combattant comme un autre, pour l’instant. »';
  return `${stance} — ${esc(j.name)}, ${esc(j.media)}.${rankTxt}`;
}
/** Angle éditorial de l'année, du plus structurant au plus banal.
 * @param {object} ys yearStats @param {object} F G.faith @returns {string} */
function faithPresseAngle(ys,F){
  if(F&&F.suspended) return 'blanche';
  if((ys.wins||0)===0 && (ys.losses||0)===0) return 'creux';
  if((ys.rank||99)<=3) return 'consecration';
  if((ys.dmgHead||0)>60) return 'usure';
  if((ys.eloDelta||0)>80) return 'ascension';
  if((ys.eloDelta||0)<-60) return 'chute';
  return 'stagnation';
}
/* Plusieurs corps par angle : une carrière dure quinze saisons ou plus, et
   un texte qui revient à l'identique tue la fiction plus vite qu'un texte
   moyen. Le tirage est déterministe (dérivé de l'année et du bilan) pour
   qu'une même saison relise toujours le même article. */
/** La même saison ne se raconte pas pareil selon qui la vit.
 * @param {object} f @param {string} angle @returns {string} */
function faithPresseTon(f,angle){
  const bon=(angle==='ascension'||angle==='consecration');
  if(f.personality==='villain') return bon
    ? 'On aurait aimé détester ce résultat. Impossible : les chiffres parlent plus fort que les provocations.'
    : 'Les déclarations tonitruantes de l’intéressé n’auront pas suffi à masquer la saison.';
  if(f.personality==='humble') return bon
    ? 'Deux phrases en conférence, pas une de plus. Le reste s’est dit dans la cage.'
    : 'Pas un mot plus haut que l’autre. Le silence, cette année, ressemblait à de la lassitude.';
  /* ==== [CORRECTIF V3_PERSONNALITE_SHOWMAN] — Plan V3 LOT 7 §5.7.1 point 4 :
     "un showman qui perd est raconté autrement qu'un taiseux qui perd" —
     'showman' (ajouté en LOT 4) ressortait ici avec une chaîne vide, la
     seule des trois personnalités sans ton propre. */
  if(f.personality==='showman') return bon
    ? 'Le spectacle et les chiffres, pour une fois, racontent la même histoire.'
    : 'La mise en scène était au rendez-vous. Le résultat, beaucoup moins.';
  return '';
}
/* ==== [ANCRE: V2-32] — table des faits saillants de l'année, chacun avec
   sa saillance. Remplace le tirage par hash de FAITH_PRESSE_CORPS
   (angle,(année*bilan)%liste — ne lisait ni les adversaires, ni le rang,
   ni les blessures, ni les promesses) : chaque ligne est dérivée d'un
   VRAI événement de la saison (ys, F, G.season.fights — myRank/oppRank y
   sont déjà stockés par combat, resolveFight(), ui-05). Les 3 plus
   saillantes seulement (règle 6 : la rareté fait la saillance).
 * @param {object} ys yearStats @param {object} f @param {object} F
 * @returns {{text:string,sal:number}[]} */
function faithYearFacts(ys,f,F){
  const facts=[];
  const fights=(G.season&&G.season.fights)||[];
  if(!F.startOfYearChampion && f.champion) facts.push({text:'Le titre a changé de propriétaire : la ceinture est désormais autour de sa taille.',sal:5});
  else if(F.startOfYearChampion && !f.champion) facts.push({text:'La ceinture, elle, a quitté sa taille cette année.',sal:5});
  if(fights.some(x=>x.win && x.oppRank!=null && x.myRank!=null && x.oppRank<x.myRank)) facts.push({text:'Une victoire est venue face à un adversaire mieux classé que lui.',sal:4});
  if(fights.some(x=>!x.win && x.oppRank!=null && x.myRank!=null && x.oppRank>x.myRank)) facts.push({text:'Une défaite est tombée face à un adversaire moins bien classé.',sal:4});
  if((f.streak||0)>=3) facts.push({text:`Il termine l’année sur une série de ${f.streak} victoires.`,sal:4});
  if(F.startOfYearRank!=null && ys.rank!=null){
    const mvt=F.startOfYearRank-ys.rank;
    if(mvt>=5) facts.push({text:'Le classement a grimpé de plusieurs places cette année.',sal:3});
    else if(mvt<=-5) facts.push({text:'Le classement a reculé de plusieurs places cette année.',sal:3});
  }
  /* ==== [ANCRE: V2-27] — la promesse rappelée : tenue, une ligne de fierté
     discrète ; trahie, une ligne cinglante — jamais neutre. */
  if(ys.promiseOutcome) facts.push({text:ys.promiseOutcome.tenue
    ?`Il avait promis d’en finir avec ${esc(ys.promiseOutcome.oppName)}. Parole tenue.`
    :`Il avait promis d’en finir avec ${esc(ys.promiseOutcome.oppName)}. La décision des juges a eu le dernier mot.`,sal:4});
  /* ==== [ANCRE: FA-28] — la seule trace visible de la séquelle : jamais un
     chiffre, jamais le mot "définitif", juste un détail remarqué. */
  if(ys.sequelle==='chin') facts.push({text:'On l’a vu accuser un coup, cette année, d’une manière qu’on ne lui connaissait pas.',sal:3});
  else if(ys.sequelle==='composure') facts.push({text:'On l’a vu chercher ses mots en conférence, cette année, d’une manière qu’on ne lui connaissait pas.',sal:3});
  else if(f.injury) facts.push({text:'Une blessure a interrompu une partie de la saison.',sal:3});
  if((F.peakEarnings||0)>0 && (f.earnings||0)===F.peakEarnings) facts.push({text:'La bourse la plus haute de sa carrière est tombée cette année.',sal:3});
  if(((F.scandals||0)-(F.startOfYearScandals||0))>0) facts.push({text:'Un scandale a entaché la réputation cette année.',sal:4});
  if(!F.startOfYearOathBroken && !!(F.oath&&F.oath.broken)) facts.push({text:'Le serment prononcé au premier jour a été rompu.',sal:4});
  if(!F.startOfYearNemesisBeaten && F.nemesisBeaten) facts.push({text:'La grande rivalité de sa carrière a enfin tourné en sa faveur.',sal:4});
  return facts.sort((a,b)=>b.sal-a.sal).slice(0,3);
}
function faithPresseArticle(ys,f,F){
  const angle=faithPresseAngle(ys,F);
  const facts=faithYearFacts(ys,f,F);
  const titres=FAITH_PRESSE_TITRES[angle];
  /* ==== [ANCRE: V2-32] — "jamais deux fois le même gabarit de titre dans
     une même carrière" : F.usedHeadlines mémorise les titres déjà tirés.
     Le fait n°1 influence le CHOIX dans les titres restants de l'angle
     (plus le fait est saillant, plus le titre pioché est loin dans la
     liste — chaque liste va du plus mesuré au plus définitif). Une
     carrière assez longue pour épuiser un angle entier autorise la
     répétition plutôt que de planter. */
  if(!F.usedHeadlines) F.usedHeadlines=[];
  let pool=titres.filter(t=>!F.usedHeadlines.includes(t));
  if(!pool.length) pool=titres.slice();
  const topSal=facts.length?facts[0].sal:2;
  const idx=Math.max(0,Math.min(pool.length-1,Math.floor((topSal/5)*pool.length)));
  const titre=pool[idx]||pool[0];
  if(!F.usedHeadlines.includes(titre)) F.usedHeadlines.push(titre);
  const ton=faithPresseTon(f,angle);
  /* Aucun fait saillant cette année (angle "creux"/"stagnation" typique) :
     FAITH_PRESSE_CORPS devient un filet de sécurité plutôt que la source
     principale — son premier texte par angle reste une prose de qualité,
     seulement plus générique que la table de faits. */
  const factsHtml=facts.length
    ? facts.map(fa=>`<p style="margin:0 0 12px">${fa.text}</p>`).join('')
    : `<p style="margin:0 0 12px">${(FAITH_PRESSE_CORPS[angle]||[''])[0]}</p>`;
  return {titre,angle,
    corps:`${factsHtml}${ton?`<p style="margin:0 0 12px">${ton}</p>`:''}`};
}
/* ==== [ANCRE: FAITH_PARCOURS] — le bilan annuel (coupure de presse) se
   lisait puis disparaissait : G.faith.yearLog était purgé à chaque nouvelle
   année (cf. nextFaithYear(), ui-08), sans qu'aucune trace ne survive à
   l'épilogue. Une carrière de dix ans ne pouvait raconter que sa toute
   dernière saison. G.faith.journey archive chaque année AVANT cette purge :
   le titre de presse déjà calculé par faithPresseArticle() (déterministe,
   donc stable si jamais réaffiché), le palmarès et le rang de l'année,
   jusqu'à deux événements notables (un raté prime toujours sur un réussi —
   même logique que le "marquant" ci-dessus), et un repère de rupture
   (serment brisé ou scandale survenu CETTE année précisément, pas juste
   "actuellement brisé" — sinon toutes les années suivant une rupture
   hériteraient à tort du marqueur). ==== */
function faithArchiveYear(year,ys,f,F){
  if(!F.journey) F.journey=[];
  const log=(ys.yearLog||[]);
  const rate=log.filter(l=>l.outcome==='raté');
  const reste=log.filter(l=>l.outcome!=='raté');
  const notables=rate.concat(reste).slice(0,2).map(l=>l.title);
  const scandalsDelta=(F.scandals||0)-(F.startOfYearScandals||0);
  const oathJustBroken=!F.startOfYearOathBroken && !!(F.oath&&F.oath.broken);
  F.journey.push({year,W:ys.wins||0,L:ys.losses||0,rank:ys.rank,
    title:faithPresseArticle(ys,f,F).titre,age:f.age,notables,
    rupture:scandalsDelta>0||oathJustBroken});
}
/** Une ligne du Parcours, hauteur fixe (40px) : le regard descend la liste
 * sans que rien ne se dérobe d'une année à l'autre.
 * @param {object} e une entrée de G.faith.journey @param {boolean} open déroulé */
function faithJourneyRow(e,open){
  return `<div style="display:flex;align-items:center;gap:10px;height:40px;border-bottom:1px solid var(--line);cursor:pointer" onclick="CL.toggleFaithJourneyYear(${e.year})">
    <span class="mono" style="flex:0 0 38px;font-size:11px;color:var(--muted)">${e.year}</span>
    <span class="mono" style="flex:0 0 44px;font-size:12px">${e.W}-${e.L}</span>
    <span style="flex:1;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(e.title)}</span>
    <span class="mono" style="flex:0 0 14px;text-align:center;font-size:13px;color:var(--loss)">${e.rupture?'✦':''}</span>
    <span class="mono" style="flex:0 0 32px;text-align:right;font-size:11px;color:var(--muted)">#${e.rank||'—'}</span>
    <span class="mono" style="flex:0 0 14px;text-align:center;font-size:10px;color:var(--muted)">${open?'▾':'▸'}</span>
  </div>`;
}
/* ==== [ANCRE: V4_C9_FIGHT_BY_FIGHT] — Plan V4 C9 : le déroulé combat par
   combat d'une saison, affiché au tap sur sa ligne du Parcours. Les données
   viennent de f.amaHistory+f.history (préservées par C2), filtrées par
   `season` — désormais l'année Faith réelle du combat plutôt que l'horloge
   Carrière classique jamais avancée en Faith (cf. resolveFight(), ui-05,
   ANCRE V4_C9_SEASON_FAITH). oppRank existait déjà par combat (vérifié) ;
   seul le rattachement saison→combat manquait pour pouvoir filtrer ici. ==== */
/** Une ligne de combat sous une saison déroulée du Parcours.
 * @param {object} h une entrée de f.amaHistory/f.history */
function faithFightRow(h){
  const resLabel=h.res==='win'?'V':h.res==='loss'?'D':'N';
  const resColor=h.res==='win'?'var(--win)':h.res==='loss'?'var(--loss)':'var(--muted)';
  return `<div style="display:flex;align-items:center;gap:8px;height:32px;padding-left:20px;border-bottom:1px dashed var(--line)">
    <span class="mono" style="flex:0 0 16px;font-size:11px;font-weight:700;color:${resColor}">${resLabel}</span>
    <span style="flex:1;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${h.oppFlag||''} ${esc(h.oppName||'—')}</span>
    <span class="mono" style="flex:0 0 100px;text-align:right;font-size:10px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(h.method||'')}${h.round?` R${h.round}`:''}</span>
    <span class="mono" style="flex:0 0 32px;text-align:right;font-size:10px;color:var(--muted)">#${h.oppRank||'—'}</span>
  </div>`;
}
/** Le déroulé complet d'une saison, ou rien si aucun combat ne porte cette
 * année (sauvegarde antérieure à ce correctif — season n'existait pas encore
 * comme année Faith réelle sur les entrées déjà archivées).
 * @param {object} f G.f @param {number} year */
function faithJourneyFightsBlock(f,year){
  const fights=(f.amaHistory||[]).concat(f.history||[]).filter(h=>h.season===year);
  if(!fights.length) return `<div class="muted" style="font-size:11px;padding:8px 0 8px 20px">Détail indisponible pour cette saison.</div>`;
  return fights.map(faithFightRow).join('');
}
/** Le Parcours complet, positionné entre la décomposition du score et le
 * badge de serment sur l'épilogue — jamais au-dessus de la note elle-même.
 * @param {object} F G.faith @returns {string} */
function faithJourneyBlock(F){
  const j=(F&&F.journey)||[];
  if(!j.length) return '';
  const openYear=G.faithJourneyExpandedYear;
  return `<div class="eyebrow" style="font-size:11px;margin:20px 0 8px">LE PARCOURS</div>
    <div style="margin-bottom:20px">${j.map(e=>`${faithJourneyRow(e,e.year===openYear)}${e.year===openYear?faithJourneyFightsBlock(G.f,e.year):''}`).join('')}</div>`;
}
/* ==== [FIN ANCRE] ==== */
function scr_faith_year_end(){
  const ys=G.faith.yearStats, f=G.f, F=G.faith;
  const art=faithPresseArticle(ys,f,F);
  /* ==== [ANCRE: V2-33/V2-34] — le journaliste nommé remplace le média
     anonyme tiré par year%length ; son verdict (place dans la division,
     ton selon son sentiment envers vous) remplace l'ancien
     "Estimation à ce jour : ${chiffre}" — un chiffre nu qui cassait la
     fiction du document de presse. Le score de légende lui-même n'a plus
     sa place ici : il reste sur la fiche personnelle et l'épilogue
     (faithScoreRows/computeLegendScore), jamais recopié sur la coupure. */
  faithUpdateJournalistSentiment(F,art.angle);
  const media=F.journalist.media;
  const verdict=faithJournalistVerdict(F,f,ys);
  const chiffre=(v,lbl,couleur)=>`<div style="border:1px solid var(--line);padding:12px;text-align:center">
    <div class="mono" style="font-size:20px;${couleur?`color:${couleur}`:''}">${v}</div>
    <div class="eyebrow" style="font-size:11px;margin-top:4px">${lbl}</div></div>`;
  const skills=(ys.newSkills||[]).map(sk=>{ const c=RAR_COLORS[sk.rar]||'var(--gold)';
    return `<div style="border-left:3px solid ${c};padding:8px 12px;margin-top:8px">
      <b style="color:${c}">${sk.name}</b> <span class="muted small">(${sk.rar})</span>
      <div class="muted small">${sk.desc||sk.blurb||''}</div></div>`; }).join('');
  return `<div class="scr" style="max-width:560px;margin:0 auto">
   ${faithCalendarBar(F)}
   <div class="faith-paper">
     <div style="border-top:1px solid var(--text);border-bottom:3px solid var(--text);padding:10px 0;display:flex;justify-content:space-between;align-items:baseline">
       <span class="hero-name" style="font-size:18px;letter-spacing:.06em">${media}</span>
       <span class="mono" style="font-size:11px;color:var(--muted)">Saison ${F.year}</span>
     </div>
     <h2 class="hero-name" style="font-size:28px;line-height:1.08;margin:12px 0 0">${art.titre}</h2>
     <div style="font-size:15px;line-height:1.55;margin-top:12px">${art.corps}</div>
     <p class="mono small" style="margin-top:12px;color:var(--muted)">${verdict}</p>
   </div>
   <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
     ${chiffre(`${ys.wins}-${ys.losses}`,'Bilan')}
     ${chiffre(`${ys.eloDelta>0?'+':''}${ys.eloDelta}`,'Progression',ys.eloDelta>=0?'var(--win)':'var(--loss)')}
     <!-- ==== [CORRECTIF V3_CHAMPION_RANG/V3_RANG_DELTA] — Plan V3 LOT 7
          §5.7.1 points 7/8 : "marquer dans le rang quand on est champion
          (petit effet)" (P20) et "delta de classement visible" avec la
          valeur de départ (rankStart, F.startOfYearRank déjà suivi). ==== -->
     ${f.champion?chiffre('CHAMPION','Classement','var(--gold)'):chiffre(`#${ys.rank}${(ys.rankStart!=null&&ys.rankStart!==ys.rank)?` <span class="small" style="font-size:11px">(${ys.rankStart>ys.rank?'+':''}${ys.rankStart-ys.rank})</span>`:''}`,'Classement')}
     ${chiffre(ys.finitions||0,'Finitions',(ys.finitions||0)>0?'var(--win)':'')}
   </div>
   ${skills?`<div><div class="eyebrow" style="margin-bottom:4px">Ce qui a été appris</div>${skills}</div>`:''}
   ${isDeclining(f)
     ?`<button class="btn primary" style="width:100%;height:56px;font-size:16px" onclick="CL.go('faith_retire')">CONTINUER</button>`
     :`<button class="btn primary" style="width:100%;height:56px;font-size:16px" onclick="CL.nextFaithYear()">SAISON ${F.year+1}</button>`}
  </div>`;
}
/* ==== [ANCRE: FAITH_RETRAITE_EVENEMENT] — la retraite n'existait tout
   simplement pas comme décision dans le mode : rien dans nextFaithYear()
   ni dans applyAging() ne la déclenchait jamais (audité — applyAging()
   ne fait qu'appliquer un déclin d'attributs, il ne pose jamais
   f.retired), donc une carrière Faith qui ne subissait pas de coupure de
   contrat forcée ne se terminait JAMAIS. isDeclining() (engine.js, déjà
   utilisée par applyAging() pour dater le début du déclin : 36 ans, 38
   chez les lourds) sert de seuil de déclenchement — pas un âge inventé,
   le même repère que le jeu utilise déjà pour dire "le corps commence à
   flancher". Casse le gabarit exactement comme evt_frankenstein_betrayal
   (seules les deux occurrences de min-height:90vh dans tout le fichier) :
   une troisième aurait annulé l'effet de seuil des deux premières. Le
   soupçon sur l'état du corps (dmgHeadTotal, déjà suivi par ailleurs)
   reste qualitatif — jamais un nombre ni une probabilité : même règle
   que FAITH_RISQUE_DECLARE, aucune espérance de gain affichée. ==== */
function scr_faith_retire(){
  const f=G.f, F=G.faith;
  const dmg=F.dmgHeadTotal||0;
  const risque=dmg>400?'Le corps a beaucoup donné. Une année de trop commence à se voir, sur la durée.'
    :dmg>150?'Les coups laissent des traces. Rien d’alarmant, mais rien qui s’efface tout à fait non plus.'
    :'Le corps encaisse encore bien.';
  return `<div class="scr" style="max-width:560px;margin:0 auto;min-height:90vh;display:flex;flex-direction:column;justify-content:center;background:var(--panel2)">
   <div class="eyebrow" style="color:var(--gold)">${f.age} ans</div>
   <h2 class="hero-name" style="font-size:34px;line-height:1.06">Continuer ?</h2>
   <p style="font-size:15px;line-height:1.55">${risque}</p>
   <div style="display:flex;flex-direction:column;gap:10px">
     <div class="opp" style="padding:16px;min-height:72px;text-align:left" onclick="CL.toLegacy()">
       <b style="font-size:15px">Raccrocher</b>
       <div class="muted small mt">Refermer la carrière ici, sur ses propres termes.</div>
     </div>
     <div class="opp" style="padding:16px;min-height:72px;text-align:left" onclick="CL.nextFaithYear()">
       <b style="font-size:15px">Encore une année</b>
       <div class="muted small mt">Continuer, en sachant ce que ça coûte.</div>
     </div>
   </div>
  </div>`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [FIN ANCRE] ==== */
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: REJOUABILITE_PERK_BADGE] — traduit f._styleProfileOverride
   (dérivé mécaniquement par deriveArcadeMods(), ui-03) en un badge lisible
   au draft. Sans ça, l'effet mécanique du perk resterait invisible pour le
   joueur — donc sans impact réel sur sa décision de sélection. ==== */
/* ==== [ANCRE: ITEM_BADGE_EQUILIBRE] — item demandé : « faire en sorte que
   chaque archétype à un descriptif » — VÉRIFIÉ AVANT CORRECTION : sur les 23
   archétypes de base (et les 7 étendus/débloquables), plusieurs ne
   franchissaient aucun des 5 seuils (koMod/subMod/sigVol/gnpDmg) et
   arcadePerkBadge() retournait ''. Repli honnête plutôt qu'abaisser les
   seuils existants (ce qui aurait dilué leur sens pour les autres) : un 6e
   badge neutre ÉQUILIBRÉ, affiché seulement quand aucun des 5 traits marqués
   ne s'applique. ==== */
function arcadePerkBadge(p){
  const m=p._styleProfileOverride; if(!m) return '';
  const tags=[];
  if(m.koMod>=1.35) tags.push({t:'FINISSEUR KO',c:'var(--gold)'});
  else if(m.koMod<=0.85) tags.push({t:'PEU DE PUISSANCE',c:'var(--muted)'});
  if(m.subMod>=1.3) tags.push({t:'FINISSEUR SOUMISSION',c:'var(--sage)'});
  if(m.sigVol>=1.25) tags.push({t:'GROS VOLUME',c:'var(--gold)'});
  if(m.gnpDmg>=1.2) tags.push({t:'SOL DANGEREUX',c:'var(--sage)'});
  if(!tags.length) tags.push({t:'ÉQUILIBRÉ',c:'var(--muted)'});
  /* ==== [ANCRE: CORRECTIF_BADGES_EMPILEMENT] — bug remonté : sur un
     archétype à 2 badges (ex. Le Surfer : PEU DE PUISSANCE + FINISSEUR
     SOUMISSION), l'absence de marge verticale entre les <span> faisait
     visuellement se toucher/chevaucher les badges quand ils passaient à la
     ligne (aucun flex-wrap avec gap, juste des spans inline avec
     margin-right seul). Ajout de margin-bottom sur chaque badge : suffisant
     pour créer un espacement propre au retour à la ligne, sans toucher au
     conteneur ni au CSS global. ==== */
  return `<div class="mono small mt" style="position:relative;z-index:2">${tags.map(x=>`<span style="display:inline-block;border:1px solid ${x.c};color:${x.c};padding:2px 8px;margin:0 6px 6px 0;border-radius:2px">${x.t}</span>`).join('')}</div>`;
}
/* ==== [FIN ANCRE] ==== */
function scr_draft(){ const pool=G.arcade.pool; const isBoss=G.arcade.mode==='boss_run'; const isLadder=G.arcade.mode==='ladder_100';
  let h=`<div class="scr"><div class="bar" style="border-bottom:2px solid var(--line);margin-bottom:24px;padding-bottom:8px">
   <span class="eyebrow mono" style="color:var(--blood)">${isBoss?'BOSS RUN // 5 CHAMPIONS':isLadder?'WTUMMA // CLASSEMENT MONDIAL DES 100':'WTUMMA // WORLD TOURNAMENT'}</span></div>
   <p class="lede" style="margin-bottom:32px;font-size:15px">${isBoss?'Affrontez 5 champions d\u2019affilée. Finitions uniquement. La défaite est éliminatoire.':isLadder?'Vous commencez au rang #100. Défiez les combattants mieux classés pour voler leur place jusqu\u2019au sommet. La défaite est éliminatoire.':'Bracket à 64 combattants. Un OVR élevé vous donne une meilleure Seed, un OVR faible vous garantit l\u2019enfer.'}</p>
   <div class="mono small muted" style="margin:-20px 0 24px">Graine de la run : <b>${G.arcade.seed}</b>${(G.arcade.asc||0)>0?` · <span class="gold">Ascension ${G.arcade.asc}</span>`:''}</div>
   ${(()=>{ /* ==== [ANCRE: LISIBILITE_CONTRAT_PASSIF] — item demandé : contractBlock()
        rendait le contrat en entier ici, puis CL.selectDraft() (ui-08) navigue
        directement vers arcadehub où gauntletStatusBlock() le réaffiche déjà en
        entier (label, hint, ×mult), SANS qu'aucun combat n'ait eu lieu entre les
        deux écrans — le joueur lisait la même carte deux fois d'affilée. Ne
        garder ici qu'un repère d'une ligne, pour savoir qu'un contrat existe
        sans lire son détail deux fois. */
     const c=G.arcade.contract; if(!c) return '';
     return `<div class="mono small muted" style="margin:-16px 0 20px">${SVG.pact} Contrat de la run posé — détail au vestiaire une fois le profil choisi.</div>`;
   })()}
   <div style="height:16px"></div>`;
  pool.forEach((p,i)=>{
    /* ==== [ANCRE: ITEM_VITRINE_STAT_DYNAMIQUE] — item demandé : la case PUIS
       était en surbrillance dorée EN PERMANENCE, quel que soit l'archétype —
       Le Fantôme (power 50, la plus faible de son propre profil) affichait
       donc sa stat la moins pertinente comme point fort. La surbrillance
       suit maintenant la vraie meilleure valeur parmi les 4 cases affichées
       (gold, même convention que le reste de l'écran) et la plus faible
       ressort en rouge (var(--loss), même code couleur que les malus
       ailleurs dans le Gauntlet) — sur ces 4 agrégats seulement, pas sur les
       20 attributs bruts, pour rester lisible dans une grille à 4 cases. */
    const _stk=Math.round((p.attrs.jab+p.attrs.cross+p.attrs.hook)/3);
    const _grp=Math.round((p.attrs.takedown+p.attrs.submission+p.attrs.topControl)/3);
    const _pui=p.attrs.power, _crd=p.attrs.cardio;
    const _max=Math.max(_stk,_grp,_pui,_crd), _min=Math.min(_stk,_grp,_pui,_crd);
    /* ==== [ANCRE: APERCU_STATS_DRAFT] — item demandé : la grille 4-cases
       affichait des moyennes brutes /100 (ex. 82), incohérentes avec le
       reste de l'UI qui affiche toujours /20 (d20()) — corrigé, sans
       toucher à _max/_min (comparaisons sur les valeurs brutes, d20 étant
       monotone le résultat du max/min est identique converti ou non).
       Ajout d'un aperçu dépliable des 20 attributs complets (Technique/
       Mental/Physique en /20), même rendu que scr_profile (ATTR/gauge/d20),
       pour choisir un profil sans se fier uniquement aux 4 agrégats. ==== */
    const previewOpen=G._draftPreview===i;
    const previewBlock=previewOpen?['tech','ment','phys'].map(key=>`<div class="card" style="padding:10px 0;text-align:left">
        <div class="grp-h"><span class="disp" style="font-size:14px">${key==='tech'?'Technique':key==='ment'?'Mental':'Physique'}</span></div>
        ${ATTR[key].map(a=>`<div class="attr" style="font-size:12px"><span class="attr-l">${a[1]}</span>${gauge(p.attrs[a[0]])}<span class="attr-v">${d20(p.attrs[a[0]])}</span></div>`).join('')}
      </div>`).join(''):'';
    /* ==== [FIN ANCRE] ==== */
    h+=`<div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--line);padding:16px;margin-bottom:20px">
      <div class="meta-strip"><div><span>Style</span><b>${p.styleLabel}</b></div></div>
      <div class="hero-name">${p.nick} ${p.flag}</div>
      <div class="narr" style="margin:10px 0 0;position:relative;z-index:2"><blockquote style="font-size:14px">« ${p._perk||''} »</blockquote></div>
      ${arcadePerkBadge(p)}
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:16px 0;position:relative;z-index:2" class="mono">
        <div style="background:var(--panel2);border:1px solid ${_stk===_max?'var(--gold-d)':_stk===_min?'var(--blood-d)':'var(--line)'};padding:8px 0;text-align:center"><span class="stat-lbl">STRK</span><b style="font-size:18px;${_stk===_max?'color:var(--gold)':_stk===_min?'color:var(--loss)':''}">${d20(_stk)}/20</b></div>
        <div style="background:var(--panel2);border:1px solid ${_grp===_max?'var(--gold-d)':_grp===_min?'var(--blood-d)':'var(--line)'};padding:8px 0;text-align:center"><span class="stat-lbl">GRAP</span><b style="font-size:18px;${_grp===_max?'color:var(--gold)':_grp===_min?'color:var(--loss)':''}">${d20(_grp)}/20</b></div>
        <div style="background:var(--panel2);border:1px solid ${_pui===_max?'var(--gold-d)':_pui===_min?'var(--blood-d)':'var(--line)'};padding:8px 0;text-align:center"><span class="stat-lbl">PUIS</span><b style="font-size:18px;${_pui===_max?'color:var(--gold)':_pui===_min?'color:var(--loss)':''}">${d20(_pui)}/20</b></div>
        <div style="background:var(--panel2);border:1px solid ${_crd===_max?'var(--gold-d)':_crd===_min?'var(--blood-d)':'var(--line)'};padding:8px 0;text-align:center"><span class="stat-lbl">CARDIO</span><b style="font-size:18px;${_crd===_max?'color:var(--gold)':_crd===_min?'color:var(--loss)':''}">${d20(_crd)}/20</b></div>
      </div>
      <button class="btn ghost" style="position:relative;z-index:2;padding:8px" onclick="CL.toggleDraftPreview(${i})">${previewOpen?'▴ Masquer les statistiques complètes':'▾ Voir les statistiques complètes'}</button>
      ${previewBlock}
      <button class="btn" style="border-color:var(--text);position:relative;z-index:2" onclick="CL.selectDraft(${i})">SÉLECTIONNER CE PROFIL</button>
    </div>`;
  });
  h+=`<button class="btn ghost mt" style="border:none;color:var(--muted)" onclick="CL.go('title')">← Annuler</button></div>`;
  return h;
}
/* ==== [ANCRE: REJOUABILITE_NEARMISS_BLOCK] — scorecard des 3 juges affichée
   uniquement quand l'élimination s'est faite aux points (a.lastScorecard posé
   dans afterResult, cf. ui-08) : distingue un near-miss (cartes serrées) d'une
   déroute nette (cartes larges), là où l'écran ne disait jusqu'ici que
   "R.I.P." sans donner aucun chiffre. ==== */
function nearMissBlock(a){
  if(!a.lastScorecard) return '';
  const s=a.lastScorecard;
  const rows=[s.judges.j1,s.judges.j2,s.judges.j3].map(([ja,jb])=>`<span class="mono small">${ja}-${jb}</span>`).join(' · ');
  const margin=Math.abs(s.scoreA-s.scoreB);
  const tightness=margin<=3?'Cartes très serrées — un round différent et la run continuait.':margin<=8?'Un écart net mais pas écrasant sur les cartes.':'Décision sans appel des 3 juges.';
  return `<div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--line);border-left:3px solid var(--gold);padding:12px;text-align:left;margin-bottom:24px">
     <div class="eyebrow mb" style="font-size:11px">Cartes des juges (${s.method})</div>
     <div>${rows}</div>
     <div class="muted small mt">${tightness}</div>
   </div>`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: REJOUABILITE_SEED_REJOUABLE] — la graine n'était affichée
   qu'au draft (scr_draft), jamais reprise au game over : impossible de
   comparer une run raté à la même graine sans la retenir manuellement.
   CL.retrySameSeed() (ui-08) capture a.seed avant reset et le repose en
   G._pendingSeed. ==== */
function seedReplayBlock(a){
  if(a.seed===undefined||a.seed===null) return '';
  return `<div class="mono small muted" style="text-align:center;margin:-8px 0 16px">Graine : <b>${a.seed}</b> · <span style="color:var(--gold);text-decoration:underline;cursor:pointer" onclick="CL.retrySameSeed()">rejouer cette graine</span></div>`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: REJOUABILITE_RECORD_GAUNTLET] — meta.gauntletBest (state.js)
   affiché au game over : sémantique par format (cf. recordGauntletBest). ==== */
/* ==== [ANCRE: GAUNTLET_ASCENSION] — le record est désormais indexé par palier
   d'Ascension (gauntletBestGet) : comparer un palier 0 à un palier 3 n'aurait
   aucun sens. Le palier de la run en cours est affiché à côté. ==== */
function gauntletBestLine(mode){
  const meta=loadMetaStats();
  const asc=(G.arcade&&G.arcade.asc)||0;
  const best=gauntletBestGet(meta,mode,asc);
  if(best===undefined) return '';
  const label=mode==='boss_run'?`${best}/5 KO enchaînés`:mode==='ladder_100'?`Rang #${best} atteint`:(best>=7?'Tournoi remporté':`Palier ${best} atteint`);
  const isNew=G.arcade&&G.arcade.isNewRecord;
  /* ==== [ANCRE: GAUNTLET_RECORDS_ARCHETYPE] — ligne dédiée, séparée du
     record global ci-dessus : les deux compteurs sont indépendants (cf.
     state.js), donc battre l'un ne dit rien sur l'autre — un joueur peut
     battre son record perso sur cet archétype précis sans toucher au
     record global (déjà tenu par un archétype plus fort), et vice-versa. ==== */
  const archNew=G.arcade&&G.arcade.isNewArchetypeRecord;
  const archLine=archNew?`<div class="mono small" style="text-align:center;margin-bottom:12px;color:var(--frost)">✦ Nouveau record pour « ${esc(G.f&&G.f.nick||'')} »</div>`:'';
  /* ==== [FIN ANCRE] ==== */
  return (isNew
    ? `<div class="mono small" style="text-align:center;margin-bottom:12px;color:var(--frost)">✦ NOUVEAU RECORD (Ascension ${asc}) : ${label}</div>`
    : `<div class="mono small gold" style="text-align:center;margin-bottom:12px">🏆 Record personnel (Ascension ${asc}) : ${label}</div>`)+archLine;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: CORRECTIF_CODE_MORT] — contractBlock() retirée : son unique
   appelant restant (scr_draft) a été remplacé par un repère d'une ligne
   (LISIBILITE_CONTRAT_PASSIF ci-dessus) pour ne plus doubler ce que
   gauntletStatusBlock affiche déjà sur l'écran suivant immédiat (arcadehub,
   atteint sans aucun combat entre les deux). L'ancre GAUNTLET_CONTRAT_RUN
   d'origine visait « draft, hub ET camp » : les appels hub/camp avaient déjà
   disparu au profit de gauntletStatusBlock lors de GAUNTLET_STATUT_CONSOLIDE
   sans que ce commentaire ait été mis à jour ; seul l'appel draft restait,
   désormais retiré à son tour. ==== */
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: GAUNTLET_BANQUE_TOUS_FORMATS] — la cagnotte + ce qu'une
   élimination laisserait, ligne identique aux 3 formats (le Boss Run avait
   déjà la sienne en dur dans son hub, les 2 autres n'en avaient aucune). ==== */
/* ==== [ANCRE: CORRECTIF_CODE_MORT] — gauntletBankLine() retirée : sa logique
   vit désormais dans gauntletStatusBlock() (voir ANCRE GAUNTLET_STATUT_
   CONSOLIDE), plus aucun appelant. ==== */
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: GAUNTLET_MISE_EN_JEU] — la bascule n'a de sens que si la
   cagnotte est non nulle : sinon il n'y a rien à perdre et l'affichage
   mentirait sur l'enjeu. Le montant réellement mis en jeu est affiché en
   toutes lettres, pas seulement le multiplicateur. ==== */
function atRiskToggleBlock(a){
  const banked=a.banked||0;
  if(banked<=0) return '';
  const next=Math.min(8,(a.riskMult||1)*2);
  const on=!!a.atRisk;
  return `<div class="toggle-card" style="flex:1;min-width:0" onclick="CL.toggleAtRisk()">
     <div class="mono small" style="display:inline-block;padding:7px 12px;border-radius:20px;border:1px solid ${on?'var(--blood)':'var(--line)'};color:${on?'var(--blood)':'var(--muted)'};font-weight:bold">${on?'✓ ':'☐ '}Mise en jeu</div>
     ${on?`<div class="muted small mt">Une victoire porte le multiplicateur de la run à <b class="gold">×${next}</b>. Une élimination sur ce combat ne rapporte <b style="color:var(--loss)">absolument rien</b> — les ${banked} pts de cagnotte partent avec.</div>`:''}
   </div>`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: COACHING_OBLIGATOIRE] — item demandé : le coaching entre les
   rounds n'est plus un choix (toggle togglable via CL.toggleCoaching()) mais
   une pièce systématique du Gauntlet, sur les 3 formats — resolveArcadeFight()
   (ui-03) ne passe plus que par startCoachingFight(). */
/* ==== [ANCRE: CORRECTIF_BADGE_COACHING_PERMANENT] — bug remonté : le badge
   "✓ Coaching" avait bien été rendu non cliquable au moment où le coaching
   est devenu permanent (ANCRE ci-dessus), mais continuait de prendre une
   place entière dans la rangée de pastilles des 3 hubs Gauntlet — pour une
   mécanique qui ne se désactive plus jamais, ce n'est plus une information
   utile à afficher à chaque écran, juste de l'espace perdu. Fonction et ses
   3 appels retirés (aucun autre appelant, cf. grep). ==== */
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: GAUNTLET_BLESSURE_RUN] — les séquelles doivent être lisibles au
   hub, sinon la baisse d'attributs est vécue comme un bug de simulation. ==== */
/* ==== [ANCRE: CORRECTIF_CODE_MORT] — runInjuryBlock() retirée : sa logique
   vit désormais dans gauntletStatusBlock(), plus aucun appelant. ==== */
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: GAUNTLET_RUN_MULT] — le multiplicateur cumulé doit être visible
   AVANT la décision suivante, pas seulement au game over. ==== */
/* ==== [ANCRE: CORRECTIF_CODE_MORT] — runMultBlock() retirée : sa logique
   vit désormais dans gauntletStatusBlock(), plus aucun appelant. ==== */
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: GAUNTLET_STATUT_CONSOLIDE] — regroupe l'état PASSIF de la run
   (contrat, cagnotte, séquelles, multiplicateur) dans une seule carte au lieu
   de 4 empilées : sur les 3 hubs, contractBlock + gauntletBankLine +
   runInjuryBlock + runMultBlock rendaient jusqu'à 6 boîtes .glass quasi
   identiques avant même les 2 vraies décisions du tour (pacte, mise en jeu),
   noyant l'information sous la répétition du même habillage visuel. Même
   pattern qu'un bloc déjà éprouvé de ce fichier (runDebriefBlock, écran de
   fin de run) : une carte, un eyebrow, des lignes mono empilées. ==== */
/** Rappel permanent de qui on joue : archétype, tempérament, discipline.
 * @param {object} f le combattant @returns {string} HTML (vide si inconnu) */
function gauntletIdentityRow(f){
  if(!f) return '';
  const arch=f.nick||f.first||f.name||'Ton combattant';
  const temper=f.styleLabel?` — ${f.styleLabel}`:'';
  const disc=f.style?` · ${styleLabel(f.style)}`:'';
  return `<div class="mono small" style="color:var(--gold)"><b>🥊 Tu joues ${esc(arch)}</b><span class="muted">${esc(temper+disc)}</span></div>`;
}
function gauntletStatusBlock(a,live){
  const rows=[];
  /* ==== [ANCRE: IDENTITE_TOUJOURS_VISIBLE] — item demandé : "préciser quel
     archétype on a choisi et quel style, le but est que tout soit toujours à
     disposition à chaque écran pour ne jamais être perdu". Les hubs de run
     affichent l'ADVERSAIRE en grand et ne rappelaient nulle part qui, soi,
     on joue : en reprenant une run entamée, il fallait ouvrir la fiche
     complète pour retrouver son propre archétype et sa discipline — dont
     dépendent pourtant les tactiques proposées. Placé en tête du bloc, avant
     le mutateur : c'est le socle (qui je suis) avant les contraintes. ==== */
  const identityRow=gauntletIdentityRow(G.f);
  if(identityRow) rows.push(identityRow);
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: GAUNTLET_MUTATEURS_ALEATOIRES] — ajout #4 (24 ajouts,
     12/08/2026) : mutateur de la run affiché EN PREMIER, avant même le
     contrat — c'est la contrainte la plus structurante de toute la run
     (posée une fois au lancement, jamais renégociable), le joueur doit la
     voir avant toute autre info d'état. ==== */
  /* ==== [ANCRE: CORRECTIF_ETAT_RUN_ESPACE] — bug remonté (10d) : ce bloc
     restait trop chargé même après l'espacement des lignes (ANCRE
     CORRECTIF_ETAT_RUN_COMPACT plus bas) — la description complète du
     mutateur n'est affichée NULLE PART ailleurs dans le jeu (seul point où
     le joueur peut apprendre ce qu'il fait), donc pas question de la
     supprimer. Repliée par défaut derrière un tap ("▼ Détail"), même
     mécanisme que l'aperçu de la boutique (G._shopPreview/toggleShopPreview,
     ui-07/ui-08) : la ligne compacte reste toujours visible, la phrase
     complète ne prend de la place que si le joueur la demande. ==== */
  if(a.mutator){
    const open=G._runStatusPreview==='mutator';
    rows.push(`<div class="mono small" style="color:var(--blood)" onclick="CL.toggleRunStatusPreview('mutator')"><b>☣ Mutateur : ${a.mutator.label}</b> <span class="muted" style="text-decoration:underline dotted;cursor:pointer">${open?'▲ Fermer':'▼ Détail'}</span>${open?`<div class="muted" style="margin-top:2px">${a.mutator.desc}</div>`:''}</div>`);
  }
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: IDENTITE_DE_CAMP] — ajout #22 (24 ajouts, 12/08/2026). ==== */
  /* ==== [ANCRE: CORRECTIF_CAMP_VERBEUX] — bug remonté : cette ligne
     répétait la phrase de flaveur (c.desc) déjà lue en entier une fois pour
     toutes à la sélection (scr_camp_identity_pick) et forçait un retour à
     la ligne (<br>) avant le passif — sur un choix DÉFINITIF pour toute la
     run (cf. ANCRE ci-dessus), affiché sur les 3 hubs à chaque render, ce
     texte redondant gonflait un bloc déjà chargé (GAUNTLET_STATUT_CONSOLIDE)
     pour rien. Ne garde que le nom (identification rapide) et le passif
     (seule info encore utile en cours de run), sur une seule ligne. ==== */
  if(a.campIdentity) rows.push(`<div class="mono small sage"><b>🏕 ${a.campIdentity.name}</b>${a.campIdentity.passive?` <span class="gold">— ⚡ ${a.campIdentity.passive.label}</span>`:''}</div>`);
  /* ==== [FIN ANCRE] ==== */
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: CORRECTIF_CONTRAT_INDICATEUR] — bug remonté : ☐ est un
     symbole de case À COCHER, alors que le contrat de run est évalué
     automatiquement (evalGauntletContract) — le ✓/○ reste un simple point
     d'état, jamais cliquable lui-même (cf. ANCRE CORRECTIF_ETAT_RUN_ESPACE
     juste au-dessus : seul le lien "▼ Détail" l'est, distinct visuellement
     pour ne pas réintroduire la même confusion). ==== */
  if(a.contract){
    const c=a.contract, ok=live?evalGauntletContract(a):!!c.done, open=G._runStatusPreview==='contract';
    rows.push(`<div class="mono small" style="color:${ok?'var(--sage)':'var(--gold)'}"><b>${SVG.pact} ${ok?'✓':'○'} ${c.label}</b> <span class="muted">(×${c.mult}) </span><span class="muted" style="text-decoration:underline dotted;cursor:pointer" onclick="CL.toggleRunStatusPreview('contract')">${open?'▲ Fermer':'▼ Détail'}</span>${open?`<div class="muted" style="margin-top:2px">${c.hint}</div>`:''}</div>`);
  }
  /* ==== [FIN ANCRE] ==== */
  const banked=a.banked||0;
  if(banked>0){
    const elim=eliminationPreview(a);
    /* ==== [ANCRE: CAGNOTTE_LISIBLE] — item demandé : la somme récupérée en
       cas de défaite s'affichait "+4 pts" en rouge, alors que c'est un gain
       (rouge = perte partout ailleurs dans le jeu) et que le "+" laissait
       croire à un bonus qui s'ajoute à la cagnotte. Même or que la cagnotte,
       sans signe : c'est simplement ce que rapporte le prochain combat s'il
       est perdu. ==== */
    rows.push(`<div class="mono small"><span class="muted">Cagnotte : </span><b class="gold">${banked} pts</b><span class="muted"> · si le prochain combat est perdu : </span><b class="gold">${elim} pts</b></div>`);
  }
  (a.runInjuries||[]).forEach(i=>rows.push(`<div class="mono small" style="color:var(--loss)"><b>${i.name}</b> <span class="muted">${i.attrs.map(x=>`${attrLabel(x[0])} ${x[1]}`).join(' · ')}</span></div>`));
  const m=gauntletRunMult(a);
  if(m>1){
    const parts=[];
    if((a.riskMult||1)>1) parts.push(`mise ×${a.riskMult}`);
    if((a.maxPactStreak||0)>0) parts.push(`pactes +${Math.round((a.maxPactStreak||0)*10)} %`);
    if(a.contract&&a.contract.done) parts.push(`contrat ×${a.contract.mult}`);
    rows.push(`<div class="mono small gold">Multiplicateur de la run : <b>×${m}</b>${parts.length?` <span class="muted">(${parts.join(' · ')})</span>`:''}</div>`);
  }
  if(!rows.length) return '';
  /* ==== [ANCRE: CORRECTIF_ETAT_RUN_COMPACT] — bug remonté : jusqu'à 6
     lignes (mutateur, camp, contrat, cagnotte, séquelles, multiplicateur)
     s'empilaient avec rows.join('') pur, sans le moindre espacement — un
     bloc déjà chargé rendu encore plus difficile à lire. Chaque ligne
     existante est enveloppée ici (aucun des appels rows.push() ci-dessus
     n'a besoin de changer) avec une petite marge haute, sauf la première. ==== */
  return `<div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--line);padding:12px;text-align:left;margin-top:12px">
     <div class="eyebrow mb" style="font-size:11px">État de la run</div>
     ${rows.map((r,i)=>`<div${i>0?' style="margin-top:6px"':''}>${r}</div>`).join('')}
   </div>`;
  /* ==== [FIN ANCRE] ==== */
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: GAUNTLET_BRACKET_VISIBLE] — rend le tableau réellement simulé
   par advanceWTUMMABracket() (ui-03). Affiche le tour courant, le match du
   joueur mis en évidence, et signale si un némésis est encore en lice
   ailleurs dans le tableau — le vrai moteur d'anticipation du format. ==== */
function scr_bracket_view(){
  const a=G.arcade;
  if(!a||!a.tournament) return `<div class="scr"><p class="lede">Aucun tableau en cours.</p><button class="btn ghost mt" onclick="CL.go('arcadehub')">Retour</button></div>`;
  const t=a.tournament;
  const rivalAlive=t.matches.some(m=>(m.a&&m.a._isRival)||(m.b&&m.b._isRival));
  const row=(m,i)=>{
    const mine=(m.a&&m.a.id===G.f.id)||(m.b&&m.b.id===G.f.id);
    /* ==== [ANCRE: CORRECTIF_SURNOM_TABLEAU] — bug remonté : le joueur figurait
       dans le tableau sous le patronyme généré par makeFighter() (ex. « Bruno
       Hughes »), alors que TOUS les autres écrans du Gauntlet l'identifient par
       son surnom d'archétype (f.nick — cf. les 3 hubs, scr_draft,
       scr_arcade_plan). Le nom généré n'a aucune existence pour le joueur : il
       n'a choisi qu'un archétype. Les PNJ gardent leur patronyme, c'est leur
       seule identité. ==== */
    const label=x=>((x.id===G.f.id && x.nick)?x.nick:x.name);
    const side=x=>`${esc(label(x))} ${x.flag||''} <span class="muted small">#${x.seed||'?'} · OVR ${x.overall}</span>${x._isRival?' <span class="mono small" style="color:var(--blood)">⚠</span>':''}`;
    return `<div style="background:var(--panel2);border:1px solid var(--line);border-left:3px solid ${mine?'var(--gold)':'var(--line)'};padding:13px;margin:10px 0">
      <div class="mono small muted">Match ${i+1}</div>
      <div class="small">${side(m.a)}</div>
      <div class="mono small muted">vs</div>
      <div class="small">${side(m.b)}</div>
    </div>`;
  };
  return `<div class="scr"><div class="bar"><span class="eyebrow">WTUMMA // TABLEAU — ${t.stepName.toUpperCase()}</span></div>
   <p class="lede small">Votre classement : #${t.playerSeed}. ${rivalAlive?'<b style="color:var(--blood)">Un némésis est encore en lice dans ce tableau.</b>':'Aucun némésis dans les survivants.'}</p>
   ${t.matches.map(row).join('')}
   <button class="btn ghost mt" onclick="CL.go('arcadehub')">← Retour au vestiaire</button>
  </div>`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: GAUNTLET_FIN_DE_RUN] — bilan de sortie : décomposition du gain
   (base × multiplicateur), état du contrat, primes de vengeance encaissées,
   séquelles, palier d'Ascension débloqué et succès Gauntlet obtenus. Toutes
   ces valeurs sont FIGÉES par finaliseGauntletRun() (ui-08) au moment du
   paiement — l'écran ne recalcule rien, il ne peut donc pas diverger du
   montant réellement crédité. ==== */
function runDebriefBlock(a){
  const mult=a.runMultApplied||1;
  const base=a.basePayout||0;
  const parts=[];
  if((a.riskMult||1)>1) parts.push(`mise en jeu ×${a.riskMult}`);
  if((a.maxPactStreak||0)>0) parts.push(`${a.maxPactStreak} pacte(s) enchaîné(s) +${Math.round((a.maxPactStreak||0)*10)} %`);
  if(a.contract&&a.contract.done) parts.push(`contrat rempli ×${a.contract.mult}`);
  const displayMult=Math.round(mult*100)/100;
  const contractLine=a.contract
    ? `<div class="mono small" style="color:${a.contract.done?'var(--sage)':'var(--muted)'}">${a.contract.done?'✓':'✗'} Contrat : ${a.contract.label}</div>`
    : '';
  const bounty=(a.bounties||0)>0?`<div class="mono small" style="color:var(--blood)">⚔ ${a.bounties} némésis vaincue(s) — primes déjà versées</div>`:'';
  const inj=(a.runInjuries||[]).length?`<div class="mono small muted">${a.runInjuries.length} séquelle(s) encaissée(s) : ${a.runInjuries.map(i=>i.name).join(', ')}</div>`:'';
  const curses=(a.cursedTaken||0)>0?`<div class="mono small muted">${a.cursedTaken} pacte(s) de camp maudit accepté(s)</div>`:'';
  const multLine=(displayMult>1)
    ? `<div class="mono small gold"><b>${base} pts</b> × <b>${displayMult}</b> = <b>${a.earnedOnElimination||0} pts</b>${parts.length?` <span class="muted">(${parts.join(' · ')})</span>`:''}</div>`
    : '';
  const ach=(a.newAch||[]).length?`<div class="mono small gold mt">🏅 ${a.newAch.map(x=>x.h).join(' · ')}</div>`:'';
  if(!multLine && !contractLine && !bounty && !inj && !curses && !ach) return '';
  return `<div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--line);border-left:3px solid var(--gold);padding:12px;text-align:left;margin-bottom:20px">
     <div class="eyebrow mb" style="font-size:11px">Bilan de la run</div>
     ${multLine}${contractLine}${bounty}${inj}${curses}${ach}
   </div>`;
}
/* ==== [ANCRE: GAUNTLET_ASCENSION] — un palier s'ouvre sur une performance
   mesurée (cf. state.js) ou sur une victoire : le message suit a.ascJust
   Unlocked, posé au moment exact du déblocage. ==== */
/* ==== [ANCRE: TOUR_ASCENSION_CONDITIONS_MESUREES] — ce bloc ne s'affichait
   que sur une victoire totale (a.victory). Depuis que le palier suivant
   s'ouvre aussi sur une bonne performance (cf. state.js), la garde se fait
   sur a.ascJustUnlocked, posé par finaliseGauntletRun au moment exact où un
   palier est réellement ouvert — sinon le joueur débloquerait l'Ascension
   sans que rien ne le lui dise. L'ancienne condition sert de repli pour une
   run commencée avant ce changement. ==== */
function ascensionUnlockBlock(a){
  const meta=loadMetaStats();
  const lvl=gauntletAscLevel(meta,a.mode);
  if(!a.ascJustUnlocked && !a.victory) return '';
  if(lvl<=(a.asc||0)) return '';
  return `<div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--gold);padding:12px;text-align:center;margin-bottom:20px">
     <div class="mono small gold" style="font-weight:bold">⬆ ASCENSION ${lvl} DÉBLOQUÉE</div>
     <div class="muted small mt">Adversaires plus forts, mais points gagnés multipliés par ${gauntletAscPayoutMod(lvl)}. Choisis ce palier au menu du Gauntlet.</div>
   </div>`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [FIN ANCRE] ==== */
function scr_gameover(){ const a=G.arcade, f=G.f;
  if(a.mode==='boss_run'){
    const isVictory=!!a.victory;
    const cashedOut=!!a.cashedOut;
    // ==== [ANCRE: CORRECTIF_BOSSRUN_RAISON_ELIMINATION] — utilise le flag
    // fiable a.victory (posé au moment exact de la victoire finale) plutôt que
    // de recalculer streak>=target, et distingue une vraie défaite d'une
    // victoire qui ne comptait pas car pas obtenue par KO/TKO (mode KO
    // uniquement) — les deux affichaient auparavant le même "R.I.P." muet.
    const noKo=a.eliminatedReason==='no_ko';
    const title=isVictory?'CHAMPION ARCADE':cashedOut?'RUN ENCAISSÉ':(noKo?'VICTOIRE INVALIDÉE':'R.I.P.');
    const subtitle=isVictory?'Survivant du Gauntlet':cashedOut?`Sorti au palier ${a.streak}/${a.target}, mise en sécurité`:(noKo?'Pas de KO/TKO — la série s\u2019arrête':'Fin de la run');
    const narrative=isVictory
      ?`« Contre toute attente, il a marché sur l\u2019algorithme. 5 cadavres laissés dans la cage. Le contrat est rempli. »`
      :cashedOut
        ?`« Pas de gloire, mais les points sont en banque. Certains soirs, la sagesse vaut mieux que le prochain KO. »`
        :noKo
          ?`« Le combat est gagné aux points, mais le Boss Run n\u2019accepte que les KO et TKO. Une victoire à la décision ou par soumission ne compte pas ici — la série s\u2019arrête malgré la main levée. »`
          :`« Le combat de trop. L\u2019ascension s\u2019arrête net sur la toile de l\u2019octogone. Les lumières s\u2019éteignent. »`;
    return `<div class="scr" style="display:flex;flex-direction:column;justify-content:center;min-height:80vh">
   <div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--line);padding:20px;margin-bottom:24px;text-align:center">
     <div class="hero-name" style="color:${isVictory?'var(--gold)':cashedOut?'var(--sage)':'var(--loss)'}">${title}<em style="color:var(--muted)">${subtitle}</em></div>
   </div>
   ${gauntletBestLine('boss_run')}
   ${nearMissBlock(a)}
   ${ascensionUnlockBlock(a)}
   ${runDebriefBlock(a)}
   <div class="glass" style="position:relative;background:var(--panel2);border:1px solid var(--line);border-left:3px solid ${isVictory?'var(--gold)':'var(--loss)'};padding:16px;margin-bottom:24px">
     <div class="meta-strip"><div><span>Profil</span><b>${(f.styleLabel||'').toUpperCase()}</b></div></div>
     <div class="hero-name" style="font-size:clamp(24px,7vw,32px)">${esc(f.nick||f.name)} ${f.flag}</div>
     <div class="stat-band">
       <div><span class="stat-big hot">${a.streak}/${a.target}</span><span class="stat-lbl">Victoires (KO uniquement)</span></div>
       <div><span class="stat-big gold">+${a.earnedOnElimination||0}</span><span class="stat-lbl">Points de salle gagnés</span></div>
     </div>
   </div>
   <div class="narr"><blockquote>${narrative}</blockquote></div>
   ${seedReplayBlock(a)}
   ${devilBuybackBlock(a,isVictory,cashedOut)}
   <button class="btn mt" style="padding:20px;font-size:18px;border-color:var(--text)" onclick="CL.retryArcade()">NOUVELLE RUN</button>
   <button class="btn ghost mt" onclick="CL.go('title')">${isVictory?'RETOURNER DANS L\u2019OMBRE':'ACCEPTER LA DÉFAITE'}</button>
   </div>`;
  }
  if(a.mode==='ladder_100'){
    const isVictory=a.rank===1;
    const cashedOut=!!a.cashedOut;
    const isPact=a.eliminatedReason==='pact';
    // ==== [ANCRE: REJOUABILITE_LADDER_POINTS_UNIFIES] — l'ancien calcul
    // d'affichage (Math.max(10,round((101-rank)*8))) était DÉCONNECTÉ du
    // barème réellement versé côté ui-08 (Math.max(2,round((101-rank)*0.8)))
    // — facteur ×10 : l'écran promettait jusqu'à 10x plus que ce qui était
    // réellement crédité en Salle des Légendes. a.earnedOnElimination est
    // désormais la seule source de vérité, écrite au moment du paiement. ====
    const earned=a.earnedOnElimination||0;
    return `<div class="scr" style="display:flex;flex-direction:column;justify-content:center;min-height:80vh">
   <div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--line);padding:20px;margin-bottom:24px;text-align:center">
     <div class="hero-name" style="color:${isVictory?'var(--gold)':cashedOut?'var(--sage)':'var(--loss)'}">${isVictory?'CHAMPION WTUMMA':cashedOut?'RUN ENCAISSÉ':isPact?'PACTE ROMPU':'R.I.P.'}<em style="color:var(--muted)">${isVictory?'Vous êtes le #1 mondial':cashedOut?`Sorti au rang #${a.rank}, mise en sécurité`:isPact?'Victoire aux points — le pacte de finition l\u2019a invalidée':'Éliminé au rang #'+a.rank}</em></div>
   </div>
   ${gauntletBestLine('ladder_100')}
   ${nearMissBlock(a)}
   ${ascensionUnlockBlock(a)}
   ${runDebriefBlock(a)}
   <div class="glass" style="position:relative;background:var(--panel2);border:1px solid var(--line);border-left:3px solid ${isVictory?'var(--gold)':'var(--loss)'};padding:16px;margin-bottom:24px">
     <div class="meta-strip"><div><span>Profil</span><b>${(f.styleLabel||'').toUpperCase()}</b></div></div>
     <div class="hero-name" style="font-size:clamp(24px,7vw,32px)">${esc(f.nick||f.name)} ${f.flag}</div>
     <div class="stat-band">
       <div><span class="stat-big hot">${a.fightsDone||0}</span><span class="stat-lbl">Victoires d\u2019ascension</span></div>
       <div><span class="stat-big gold">+${earned}</span><span class="stat-lbl">Points de salle gagnés</span></div>
     </div>
   </div>
   <div class="narr"><blockquote>${isVictory?`« 99 cadavres en contrebas. L\u2019ascension est terminée, le trône vous appartient. »`:cashedOut?`« Pas de trône, mais la chute est évitée et les points sont en poche. »`:isPact?`« Le pacte promettait tout ou rien. Ce sera rien : gagné aux points ne suffisait pas. »`:`« Une erreur et c\u2019est la chute libre. Le sommet restera hors de portée. »`}</blockquote></div>
   ${seedReplayBlock(a)}
   ${devilBuybackBlock(a,isVictory,cashedOut)}
   <button class="btn mt" style="padding:20px;font-size:18px;border-color:var(--text)" onclick="CL.retryArcade()">NOUVELLE RUN</button>
   <button class="btn ghost mt" onclick="CL.go('title')">RETOURNER AU MENU</button>
   </div>`;
  }
  const isVictory=a.victory;
  const cashedOut=!!a.cashedOut;
  const isPact=a.eliminatedReason==='pact';
  const earned=a.earnedOnElimination||0;
  return `<div class="scr" style="display:flex;flex-direction:column;justify-content:center;min-height:80vh">
   <div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--line);padding:20px;margin-bottom:24px;text-align:center">
     <div class="hero-name" style="color:${isVictory?'var(--gold)':cashedOut?'var(--sage)':'var(--loss)'}">${isVictory?'CHAMPION WTUMMA':cashedOut?'RUN ENCAISSÉ':isPact?'PACTE ROMPU':'ÉLIMINÉ'}<em style="color:var(--muted)">${cashedOut?'Sortie volontaire':isPact?'Victoire aux points — le pacte de finition l\u2019a invalidée':a.tournament.stepName}</em></div>
   </div>
   ${gauntletBestLine('bracket64')}
   ${nearMissBlock(a)}
   ${ascensionUnlockBlock(a)}
   ${runDebriefBlock(a)}
   <div class="glass" style="position:relative;background:var(--panel2);border:1px solid var(--line);border-left:3px solid ${isVictory?'var(--gold)':'var(--loss)'};padding:16px;margin-bottom:24px">
     <div class="meta-strip"><div><span>Profil</span><b>${(f.styleLabel||'').toUpperCase()}</b></div></div>
     <div class="hero-name" style="font-size:clamp(24px,7vw,32px)">${esc(f.nick||f.name)} ${f.flag}</div>
     <div class="stat-band"><div><span class="stat-big hot">+${earned}</span><span class="stat-lbl">WT Points gagnés</span></div></div>
   </div>
   <div class="narr"><blockquote>${isVictory?`« 63 combattants laissés sur le carreau. L\u2019octogone vous appartient, jusqu\u2019à ce qu\u2019un nouveau challenger se présente. »`:cashedOut?`« Se retirer au bon moment est aussi un art. »`:isPact?`« Le pacte promettait tout ou rien. Ce sera rien : gagné aux points ne suffisait pas. »`:`« Le bracket est impitoyable. Une seule erreur et c\u2019est le vol de retour. »`}</blockquote></div>
   ${seedReplayBlock(a)}
   ${devilBuybackBlock(a,isVictory,cashedOut)}
   <button class="btn mt" style="padding:20px;font-size:18px;border-color:var(--text)" onclick="CL.retryArcade()">NOUVELLE RUN</button>
   <button class="btn ghost mt" onclick="CL.go('title')">RETOURNER AU MENU</button>
   </div>`;
}
/* ==== [ANCRE: RACHAT_RETRAITE_DIABLE] — ajout #12 (24 ajouts, 12/08/2026) :
   bloc PARTAGÉ par les 3 branches ci-dessus, discret (un simple lien, pas un
   gros bouton — cf. spec "discret") et n'apparaît QUE sur une vraie
   élimination (jamais victoire, jamais sortie volontaire), et QUE si le
   joueur peut réellement payer le prix affiché. ==== */
function devilBuybackBlock(a,isVictory,cashedOut){
  if(isVictory||cashedOut) return '';
  const meta=loadMetaStats();
  const cost=gauntletDevilCost(a.mode,a);
  if((meta.legendPoints||0)<cost) return '';
  return `<div class="mono small" style="text-align:center;margin-top:10px">
   <span onclick="CL.buyDevilContinue()" style="cursor:pointer;color:var(--blood);text-decoration:underline dotted;opacity:0.75">Payer le Diable — ${cost} points de Légende pour continuer cette run</span>
  </div>`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: REJOUABILITE_HUB_BANQUE_PACTE] — bouton d'encaissement (les 3
   formats) + bascule du pacte de finition (Ladder 100 / Bracket 64
   uniquement, Boss Run a déjà sa clause KO-only permanente). Valeurs
   affichées calculées avec les MÊMES barèmes que cashOutGauntlet()/
   afterResult() côté ui-08, pour que le chiffre annoncé soit celui
   réellement versé. ==== */
/* ==== [ANCRE: REJOUABILITE_RIVAL_BADGE] — a.opponent._isRival (posé par
   fighterFromRivalSnapshot(), ui-03) n'était visible nulle part : les 3 hubs
   n'affichent que .name, jamais .nick. Sans ce badge le système de némésis
   serait mécaniquement actif mais totalement invisible pour le joueur. Le
   badge lui-même est inchangé — c'est la DONNÉE en amont (recordGauntletRival
   appelé sur la défaite, pas la victoire, cf. ui-08) qui a été corrigée : le
   badge affichait auparavant tes propres champions passés, jamais tes vrais
   bourreaux. ==== */
/* ==== [ANCRE: GAUNTLET_NEMESIS_ACCUMULATION] — killedCount>=2 ajoute une
   ligne dédiée sous le badge némésis habituel : le joueur doit voir POURQUOI
   cet adversaire est plus dangereux (buff _styleProfileOverride posé dans
   fighterFromRivalSnapshot, ui-03) avant d'entrer dans le plan de combat. ==== */
function rivalBadge(opp){
  if(!opp||!opp._isRival) return '';
  const srcLabel={boss_run:'Boss Run',ladder_100:'Ladder 100',bracket64:'Bracket 64'}[opp._rivalSource]||'une run précédente';
  const buffLine=(opp._killedCount||0)>=2?`<div class="mono small" style="color:var(--blood);margin-bottom:4px">☠ Vous a déjà battu ${opp._killedCount} fois — frappe plus dur, plus dangereux en soumission</div>`:'';
  return `<div class="mono small" style="color:var(--blood);font-weight:bold;margin-bottom:4px">⚠ NÉMÉSIS — vous a déjà éliminé (${srcLabel})</div>${buffLine}`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: REJOUABILITE_PAYOUT_TABLES] — gauntletPayout()/
   gauntletEliminationPayout() (ui-03) sont la SEULE source de vérité pour
   les 3 écrans (aperçu encaissement, aperçu élimination, paiement réel
   ui-08) — fini la duplication de tables qui avait déjà causé un bug de
   facteur ×10 sur le Ladder par le passé (cf. ANCRE ci-dessus). ==== */
/* ==== [ANCRE: GAUNTLET_RUN_MULT] — les aperçus passent par gauntletFinalPayout
   comme le paiement réel (finaliseGauntletRun, ui-08) : sans ça l'écran
   annoncerait le tarif de base et verserait le tarif multiplié, exactement le
   type d'écart qui avait produit le bug ×10 du Ladder. Le contrat est évalué
   en direct pour que son ×mult apparaisse dès qu'il est rempli. ==== */
/* ==== [ANCRE: CORRECTIF_CODE_MORT] — cashOutPreview() retirée : item demandé,
   « Encaisser et sortir » n'a plus aucun appelant sur les 3 hubs (bracket64,
   ladder_100, boss_run — cf. GAUNTLET_SORTIE_UNIQUE ci-dessus). L'option
   n'avait pas de bug — les chiffres étaient sains, l'encaissement rapportait
   toujours strictement plus qu'une élimination au même palier — mais elle
   n'était en pratique jamais choisie : sortir d'une run en cours va contre
   l'intérêt du joueur tant que la cagnotte suivante reste accessible via
   « Abandonner ». eliminationPreview() reste seule active : elle sert
   toujours à gauntletStatusBlock() pour annoncer ce que rapporterait une
   défaite sur le combat suivant. ==== */
function eliminationPreview(a){
  evalGauntletContract(a);
  if(a.mode==='boss_run') return gauntletFinalPayout(a,gauntletEliminationPayout('boss_run',a.streak,a.atRisk));
  if(a.mode==='ladder_100') return gauntletFinalPayout(a,gauntletEliminationPayout('ladder_100',a.rank,a.atRisk));
  return gauntletFinalPayout(a,gauntletEliminationPayout('bracket64',(a.tournament&&a.tournament.roundStep)||1,a.atRisk));
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: REJOUABILITE_PACTE_ESCALADE] — affiche le niveau de stack
   (G.arcade.pactStreak, ui-08) : le joueur voit ce qu'il a à perdre en
   laissant tomber le pacte, pas seulement ce qu'il gagnerait à le prendre. ==== */
/* ==== [ANCRE: GAUNTLET_MUTATEURS_ALEATOIRES] — ajout #4 (24 ajouts,
   12/08/2026) : le badge non cliquable n'apparaît plus dès Ascension 3,
   mais uniquement quand le mutateur tiré pour cette run est
   'mut_pacte_force'. ==== */
function pactToggleBlock(a){
  const streak=a.pactStreak||0;
  const streakLine=streak>0?`<br><b class="gold">🔥 Série : ${streak}${streak>=3?' — Légendaire garantie au prochain camp !':''}</b>`:'';
  if(a.mutator&&a.mutator.id==='mut_pacte_force'){
    return `<div style="flex:1;min-width:0">
     <div class="mono small" style="display:inline-block;padding:7px 12px;border-radius:20px;border:1px solid var(--blood);color:var(--blood);font-weight:bold">⚠ Pacte obligatoire</div>
     <div class="muted small mt">Mutateur « Pacte forcé » : chaque combat ne compte que par finition (KO/TKO ou soumission), sans exception. Une victoire aux points arrête la run comme une défaite.${streakLine}</div>
   </div>`;
  }
  const on=!!a.pactActive;
  return `<div class="toggle-card" style="flex:1;min-width:0" onclick="CL.togglePact()">
     <div class="mono small" style="display:inline-block;padding:7px 12px;border-radius:20px;border:1px solid ${on?'var(--gold)':'var(--line)'};color:${on?'var(--gold)':'var(--muted)'};font-weight:bold">${on?'✓ ':'☐ '}Pacte</div>
     ${on?`<div class="muted small mt">Ce combat ne compte que par finition (KO/TKO ou soumission) — une victoire aux points arrête la run comme une défaite. En échange : camp suivant plancher Rare garanti + une compétence Légendaire/Épique dans les choix.${streakLine}</div>`:''}
   </div>`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: REJOUABILITE_PLAN_ARCADE] — resolveArcadeFight() (ui-03)
   appelait simulateFight(G.f,opp,3) SANS le 4e paramètre plan : les TACTICS
   (ui-01, déjà utilisées en carrière ET en Vs Ami via scr_vs_friend_plan) et
   le canal plan de simulateFight (engine.js) existaient mais n'étaient
   jamais branchés en arcade — aucune décision par combat, contrairement à
   la carrière. Écran calqué sur scr_vs_friend_plan (déjà un précédent pour
   un vestiaire allégé hors carrière), routé depuis les 3 hubs avant
   CL.fightArcade(). ==== */
function scr_arcade_plan(){
  const f=G.f, opp=G.arcade.opponent; const plans=TACTICS[f.style]||[];
  /* ==== [ANCRE: BOSSRUN_MISE_EN_SCENE] — ajout #3 (24 ajouts, 12/08/2026) :
     en Boss Run, tant que le boss n'est pas révélé (scr_boss_reveal, après
     ce choix de tactique), le joueur choisit sa consigne À L'AVEUGLE — ni le
     nom de l'adversaire ni l'analyse tactique (qui exposerait ses stats
     réelles) ne doivent transparaître ici. ==== */
  const isBossBlind=(G.arcade.mode==='boss_run' && !G.arcade.revealed)||(G.arcade.mutator&&G.arcade.mutator.id==='mut_mise_a_nu');
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: ITEM_TACTIQUE_PAR_ARCHETYPE] — la tactique exclusive de
     l'archétype (ARCADE_EXCLUSIVE_TACTICS, ui-03) passe en tête de liste,
     avant les tactiques exclusives génériques (allonge/densité, engine.js) et
     les 3 options de style partagées — c'est la plus spécifique au
     combattant, elle doit être la première chose vue. ==== */
  const archTactic=ARCADE_EXCLUSIVE_TACTICS[f.nick];
  const combined=(archTactic?[archTactic]:[]).concat(getExclusiveTactics(f)).concat(plans);
  /* ==== [ANCRE: GAUNTLET_BRUIT_DU_MILIEU] — sur les combats à fort enjeu
     (cf. gauntletRumorActive, ui-03), l'analyse tactique VÉRIDIQUE
     (tacticalRead) est remplacée par une rumeur — parfois fausse, jamais
     signalée comme telle. Le joueur choisit sa tactique sur ce qu'il
     entend, pas sur les vrais chiffres. ==== */
  /* ==== [ANCRE: PREPARATION_CIBLEE] — ajout #23 (24 ajouts, 12/08/2026) :
     rumorActive ET percée (G.arcade.analysisPierced) -> analyse véridique
     malgré le fort enjeu. Le bouton de percée n'apparaît que si la rumeur
     est active, pas encore percée, et l'adversaire n'est pas déjà masqué
     par ailleurs (isBossBlind) — inutile de payer pour percer une rumeur
     qu'on ne peut de toute façon pas encore voir. ==== */
  const rumorActive=gauntletRumorActive(G.arcade) && !G.arcade.analysisPierced;
  const analysis=isBossBlind?'Adversaire non identifié — tu choisis ta consigne à l\u2019aveugle, sans scouting possible avant ce combat.':(rumorActive?gauntletRumorText(opp):tacticalRead(f,opp));
  const analysisLabel=isBossBlind?'Inconnu':(rumorActive?'Rumeur':(gauntletRumorActive(G.arcade)?'Analyse (percée)':'Analyse'));
  const pierceButton=(!isBossBlind && rumorActive)?`<div class="mono small mt"><span onclick="CL.pierceRumor()" style="cursor:pointer;color:var(--gold);text-decoration:underline dotted">🔍 L\u2019Analyse — percer la rumeur pour ce combat (-2 Intelligence tactique)</span></div>`:'';
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: CORRECTIF_ANALYSE_COLLEE] — bug remonté : .hero-name a un
     interlignage très serré (line-height:.92) sans marge basse, et cette
     carte n'avait aucun padding en haut (padding:0 ...) — rien ne sépare
     le nom des combattants de l'encadré d'analyse juste en dessous. Sur
     l'écran équivalent en carrière (scr_plan, ui-06), le même padding:0
     passe inaperçu car renderFightPoster (l'affiche de combat, absente
     ici en Gauntlet) apporte déjà 24px de marge basse. ==== */
  return `<div class="scr"><div class="bar"><span class="eyebrow">Gauntlet · Plan de combat</span></div>
   <div class="hero-name" style="text-align:center;font-size:20px">${esc(f.nick||f.name)} <span class="muted">vs</span> ${isBossBlind?'<span style="color:var(--muted)">???</span>':esc(opp.name)}</div>
   <div class="card mt" style="border-color:transparent;padding:14px 0 16px 0">
     <div class="muted small" style="border-left:2px solid var(--gold);padding-left:10px"><b>${analysisLabel} :</b> ${analysis}</div>
     ${pierceButton}
   </div>
   <p class="lede small mt">Quelle est ta consigne tactique pour ce combat ?</p>
   ${combined.map((p,i)=>`<div class="opp" onclick="CL.chooseArcadePlan(${i})">
     <div class="opp-top"><span class="opp-nm gold">${p.lbl}</span></div>
     <div class="opp-read" style="margin-top:4px;opacity:1">${p.desc}</div></div>`).join('')}
   <button class="btn ghost mt" onclick="CL.chooseArcadePlan(-1)">Aucune consigne particulière</button>
  </div>`;
}
/* ==== [ANCRE: BOSSRUN_MISE_EN_SCENE] — ajout #3 (24 ajouts, 12/08/2026) :
   écran de reveal intercalé entre le choix de tactique (à l'aveugle,
   scr_arcade_plan) et la résolution réelle du combat (resolveArcadeFight,
   ui-03). Le malus (G.arcade.bossMalus) est tiré UNE FOIS par
   CL.chooseArcadePlan (ui-08) avant d'arriver ici, pas à chaque render —
   sinon il changerait à chaque re-render de cet écran. Aucune tactique
   n'est modifiable ici (pas de bouton retour vers scr_arcade_plan),
   volontairement : la surprise est déjà consommée. Animation d'entrée via
   la classe CSS .boss-reveal-in (cf. index.html — à défaut, dégradation
   silencieuse en simple apparition si la classe n'existe pas dans le CSS). ==== */
function scr_boss_reveal(){
  const a=G.arcade, opp=a.opponent, m=a.bossMalus;
  return `<div class="scr center intro boss-reveal-in">
   <div class="eyebrow" style="color:var(--blood);letter-spacing:2px">LE VOILE TOMBE</div>
   <div class="hero-name" style="text-align:center;font-size:clamp(26px,8vw,34px);color:var(--blood)">${esc(opp.name)} ${opp.flag}</div>
   <div class="muted small mt" style="text-align:center">${opp.styleLabel} · ${opp.age} ans · OVR ${opp.overall}</div>
   ${rivalBadge(opp)}
   <div class="card glass mt" style="background:var(--panel2);border:1px solid var(--blood);padding:14px;text-align:center">
     <div class="eyebrow mb" style="color:var(--blood)">Le boss impose son terme</div>
     <div class="mono" style="color:var(--blood);font-weight:bold">${Math.sign(m.amount)>=0?'+':''}${Math.sign(m.amount)*Math.max(1,Math.round(Math.abs(m.amount)/5))} ${m.label} <span class="muted small">(ce combat uniquement)</span></div>
     <div class="muted small mt">Tiré au hasard à chaque reveal — jamais toujours la même stat visée.</div>
   </div>
   <button class="btn primary mt" style="font-size:20px;padding:18px;background:var(--blood);border-color:var(--blood)" onclick="CL.confirmBossReveal()">ENTRER DANS LA CAGE</button>
  </div>`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: GAUNTLET_SORTIE_UNIQUE] — item demandé : « personne n'accepte
   d'encaisser et partir ». Décision de design confirmée, pas un bug — les
   barèmes de GAUNTLET_FIN_DE_RUN étaient sains (sortir a toujours rapporté
   strictement plus qu'une élimination au même palier). L'option existait
   sur les 3 formats mais n'était jamais choisie : abandonner la run garde
   la cagnotte accessible plus tard sans y renoncer maintenant, elle
   dominait donc systématiquement l'encaissement. Un seul point de sortie
   reste : « Abandonner la run » (0 pt, déjà présent partout). ==== */
function scr_arcadehub(){ const f=G.f, a=G.arcade;
  if(a.mode==='boss_run'){
    /* ==== [ANCRE: REJOUABILITE_BANQUE_BOSSRUN] — a.banked (ui-08) affiché
       comme cagnotte visible, avec ce qui est en jeu si le KO suivant échoue
       (eliminationPreview) juste en-dessous : la tension risque/récompense
       doit être LISIBLE, pas seulement calculée en coulisses. ==== */
    return `<div class="scr center intro"><div class="eyebrow" style="color:var(--blood)">GAUNTLET // RUN EN COURS</div>
   <div class="hero-name" style="text-align:center">${a.streak} / ${a.target}<em style="color:var(--muted)">${f.nick} ${f.flag} — ${recordStr(f)} sur cette run</em></div>
   <div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--line);padding:12px;text-align:center;margin-top:12px;border-left:3px solid var(--gold)">
     <div class="mono small gold" style="font-weight:bold">⚠ SEULE UNE FINITION COMPTE — une victoire aux points arrête la série.</div>
   </div>
   <div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--line);padding:16px;text-align:left;margin-top:12px">
     <div class="eyebrow mb">Prochain adversaire</div>
     ${a.revealed?`${rivalBadge(a.opponent)}
     <div class="hero-name" style="font-size:clamp(22px,6vw,28px)">${esc(a.opponent.name)} ${a.opponent.flag}</div>
     <div class="muted small mt">${a.opponent.styleLabel} · ${a.opponent.age} ans</div>`:
     /* ==== [ANCRE: BOSSRUN_MISE_EN_SCENE] — ajout #3 (24 ajouts, 12/08/2026) :
        identité et stats du boss masquées jusqu'au reveal (scr_boss_reveal,
        déclenché juste avant le combat, après le choix de tactique à
        l'aveugle). ==== */
     `<div class="hero-name" style="font-size:clamp(22px,6vw,28px);color:var(--muted)">??? <span style="filter:blur(4px)">████████</span></div>
     <div class="muted small mt">Identité inconnue — révélée juste avant le combat.</div>`
     /* ==== [FIN ANCRE] ==== */}</div>
   ${gauntletStatusBlock(a,true)}
   <div style="display:flex;gap:10px;margin-top:12px">${atRiskToggleBlock(a)}</div>
   <button class="btn primary mt" style="font-size:20px;padding:18px" onclick="CL.fightArcade()">COMBATTRE</button>
   <button class="btn ghost" onclick="CL.go('title')">Abandonner la run (0 pt)</button></div>`;
  }
  if(a.mode==='ladder_100'){
    /* ==== [ANCRE: GAUNTLET_MUTATEURS_ALEATOIRES] — ajout #4 (24 ajouts,
       12/08/2026) : "Mise à nu" masque aussi les cibles du Ladder 100 — le
       gap de rang (signal de risque principal) reste visible, seule
       l'identité/le profil sont cachés. ==== */
    const mutBlind=G.arcade.mutator&&G.arcade.mutator.id==='mut_mise_a_nu';
    /* ==== [FIN ANCRE] ==== */
    const targets=a.targets||[];
    const targetCard=t=>{
      const gap=a.rank-t.ladderRank;
      const riskLabel=gap>=18?'AGRESSIF':gap>=10?'MÉDIAN':'SÛR';
      const riskColor=gap>=18?'var(--blood)':gap>=10?'var(--gold)':'var(--sage)';
      if(mutBlind){
        return `<div class="opp" style="border-left:3px solid ${riskColor};cursor:pointer" onclick="CL.pickLadderTarget(${t.ladderRank})">
        <div class="mono small" style="color:${riskColor};font-weight:bold">${riskLabel} · +${gap} rangs</div>
        <div class="opp-top"><span class="opp-nm gold">Rang #${t.ladderRank} — ??? <span style="filter:blur(3px)">████</span></span></div>
        <div class="muted small mt">Identité inconnue — Mise à nu.</div>
      </div>`;
      }
      return `<div class="opp" style="border-left:3px solid ${riskColor};cursor:pointer" onclick="CL.pickLadderTarget(${t.ladderRank})">
        <div class="mono small" style="color:${riskColor};font-weight:bold">${riskLabel} · +${gap} rangs</div>
        ${rivalBadge(t)}
        <div class="opp-top"><span class="opp-nm gold">Rang #${t.ladderRank} — ${esc(t.name)} ${t.flag}</span></div>
        <div class="muted small mt">${t.styleLabel} · OVR ${t.overall}</div>
      </div>`;
    };
    return `<div class="scr center intro"><div class="eyebrow" style="color:var(--sage)">WTUMMA // ASCENSION</div>
   <div class="hero-name" style="text-align:center">RANG #${a.rank}<em style="color:var(--muted)">${f.nick} ${f.flag} — Objectif #1</em></div>
   <p class="lede small mt">Choisissez votre cible — plus le saut de rang est grand, plus l\u2019adversaire est fort.</p>
   ${targets.map(targetCard).join('')}
   ${(a.aggroCooldown>0)?`<div class="mono small muted" style="text-align:center;margin-top:8px">Fenêtre de tir agressive fermée — encore ${a.aggroCooldown} palier(s).</div>`:''}
   ${gauntletStatusBlock(a,true)}
   <div style="display:flex;gap:10px;margin-top:12px">${pactToggleBlock(a)}${atRiskToggleBlock(a)}</div>
   <button class="btn ghost" onclick="CL.go('title')">Abandonner la run (0 pt)</button></div>`;
  }
  /* ==== [ANCRE: GAUNTLET_MUTATEURS_ALEATOIRES] — ajout #4 (24 ajouts,
     12/08/2026) : "Mise à nu" masque aussi le prochain adversaire du
     Bracket 64. ==== */
  const mutBlindBr=G.arcade.mutator&&G.arcade.mutator.id==='mut_mise_a_nu';
  /* ==== [FIN ANCRE] ==== */
  return `<div class="scr center intro"><div class="eyebrow" style="color:var(--blood)">WTUMMA // ${a.tournament.stepName.toUpperCase()}</div>
   <div class="hero-name" style="text-align:center">CLASSÉ #${f.seed}<em style="color:var(--muted)">${f.nick} ${f.flag}</em></div>
   <div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--line);padding:16px;text-align:left;margin-top:20px">
     <div class="eyebrow mb">Prochain adversaire${mutBlindBr?'':` : classé #${a.opponent.seed}`}</div>
     ${mutBlindBr?`<div class="hero-name" style="font-size:clamp(22px,6vw,28px);color:var(--muted)">??? <span style="filter:blur(4px)">████████</span></div>
     <div class="muted small mt">Identité inconnue — Mise à nu.</div>`:`${rivalBadge(a.opponent)}
     <div class="hero-name" style="font-size:clamp(22px,6vw,28px)">${esc(a.opponent.name)} ${a.opponent.flag}</div>
     <div class="muted small mt">${gauntletRumorActive(a)?a.opponent.styleLabel:`${a.opponent.styleLabel} · OVR ${a.opponent.overall}`}</div>`}</div>
   ${gauntletStatusBlock(a,true)}
   <div style="display:flex;gap:10px;margin-top:12px">${pactToggleBlock(a)}${atRiskToggleBlock(a)}</div>
   <button class="btn primary mt" style="font-size:20px;padding:18px" onclick="CL.fightArcade()">COMBATTRE (${a.tournament.stepName.toUpperCase()})</button>
   <button class="btn ghost" onclick="CL.go('title')">Abandonner la run (0 pt)</button>
   <button class="btn ghost" style="margin-top:8px;opacity:0.75" onclick="CL.viewBracket()">Voir le tableau complet</button></div>`;
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
            ${s.fx?`<div class="mono small mt" style="color:var(--win)">${formatSkillFx(s.fx,f)}</div>`:''}</div>`;
    });
    /* ==== [ANCRE: GAUNTLET_CAMP_MAUDIT] — 4e carte, visuellement séparée des 3
       options normales : une Légendaire/Mythique garantie payée par un malus
       permanent sur la run. C'est le seul choix du camp qui puisse EMPIRER le
       combattant, donc le seul qui demande un arbitrage réel. ==== */
    if(a.cursedOpt){
      const cs=a.cursedOpt;
      /* ==== [ANCRE: ITEM_LISIBILITE_GAINS_ATTRIBUTS] — même traitement que
         formatSkillFx (ui-07) : "avant → après" plutôt qu'un delta brut sans
         repère. La séquelle maudite ne connaît pas de plafond haut (elle ne
         fait que baisser), pas besoin de reproduire que la borne basse
         (clamp 1-100 via d20 à l'affichage). ==== */
      const deltasTxt=cs.d.map(x=>{ const k=x[0], v=x[1];
        const lbl=k==='morale'?'Moral':k==='form'?'Forme':attrLabel(k);
        const before=k==='morale'?f.morale:k==='form'?f.form:f.attrs[k];
        const after=Math.max(1,before+v);
        return `<span class="dlt dn">${lbl} ${d20(before)} → ${d20(after)}</span>`; }).join('');
      /* ==== [ANCRE: CORRECTIF_PACTE_CAMP_BONUS_MASQUE] — bug remonté : les 3
         cartes de compétence normales affichent formatSkillFx(s.fx,f) (les
         bonus), mais cette carte n'affichait que deltasTxt (le malus de la
         malédiction) — le bonus propre à la compétence garantie (cs.skill.fx)
         n'était jamais montré, donc la carte avait l'air d'un pur malus et
         personne ne la choisissait. ==== */
      h+=`<div class="eyebrow mt mb" style="color:var(--blood)">PACTE DU CAMP — OPTION MAUDITE</div>
          <div class="opp" style="border-left:3px solid var(--blood)" onclick="CL.pickCursedSkill()">
            <b style="color:${RAR_COLORS[cs.skill.rar]||'var(--gold)'}">${cs.skill.name}</b> <span class="muted small">(${cs.skill.rar}) — garantie</span>
            <div class="muted small mt">${cs.skill.desc||cs.skill.blurb||''}</div>
            ${cs.skill.fx?`<div class="mono small mt" style="color:var(--win)">${formatSkillFx(cs.skill.fx,f)}</div>`:''}
            <div class="mono small mt" style="color:var(--blood)"><b>${cs.curseLabel}</b> — séquelle permanente sur cette run</div>
            <div class="dlts">${deltasTxt}</div>
          </div>`;
      /* ==== [FIN ANCRE] ==== */
    }
    /* ==== [FIN ANCRE] ==== */
    if(!a.skillOpts.length && !a.cursedOpt) h+=`<div class="card glass mt"><span class="muted small">Aucune compétence disponible pour l\u2019instant.</span></div>
          <button class="btn ghost mt" onclick="CL.pickArcadeSkill(-1)">Continuer vers le camp</button>`;
  } else if(!a.upgradesChosen.train){
    h+=`<p class="lede small">Sélectionnez un ajustement physique.</p>
        <div class="eyebrow mt mb" style="color:var(--gold)">2. CONDITIONNEMENT & SPARRING</div>`;
    a.trainOpts.forEach((t,i)=>{
      /* ==== [ANCRE: ITEM_LISIBILITE_GAINS_ATTRIBUTS] — item demandé : "+2
         Cardio" n'indiquait jamais où en est réellement le combattant, ni si
         l'attribut est déjà à son plafond de potentiel. Même convention
         "avant → après" que formatSkillFx (ui-07) et le récapitulatif
         post-combat (ui-06). Un attribut déjà au plafond affiche sa valeur
         telle quelle avec la mention, plutôt qu'un gain qui ne
         s'appliquerait pas réellement une fois applyDeltas() exécuté. ==== */
      /* ==== [ANCRE: GAINS_QUI_MONTENT_REELLEMENT] — même règle que
         formatSkillFx (ui-07) : on ne liste que les attributs dont la note
         sur 20 change vraiment. Un malus, lui, reste toujours affiché même
         s'il ne fait pas bouger la note : masquer une perte tromperait le
         joueur, alors que masquer un gain nul ne fait que retirer du bruit. ==== */
      const deltas=t.d.map(([k,v])=>{ const lbl=k==='morale'?'Moral':k==='form'?'Forme':attrLabel(k);
        const before=k==='morale'?f.morale:k==='form'?f.form:f.attrs[k];
        if(v>0 && k!=='morale' && k!=='form'){
          let cap=(f.maxAttrs && f.maxAttrs[k]!=null) ? f.maxAttrs[k] : f.potential+4;
          if(f.agedCeilings && f.agedCeilings[k]!=null) cap=Math.min(cap, f.agedCeilings[k]);
          if(before>=cap) return '';
          const capped=Math.min(before+v,cap);
          if(d20(before)===d20(capped)) return '';
          return `<span class="dlt up">${lbl} ${d20(before)} → ${d20(capped)}</span>`;
        }
        const after=k==='morale'||k==='form'?clamp(before+v,0,100):Math.max(1,before+v);
        if(v>=0 && d20(before)===d20(after)) return '';
        return `<span class="dlt ${v>=0?'up':'dn'}">${lbl} ${d20(before)} → ${d20(after)}</span>`; }).filter(Boolean).join('')
        || `<span class="dlt">Progression légère</span>`;
      h+=`<div class="opp" onclick="CL.pickArcadeTrain(${i})"><div class="opp-top"><span class="opp-nm">${t.label}</span></div>
            <div class="opp-mid">${t.hint}</div><div class="dlts">${deltas}</div></div>`;
    });
  }
  /* ==== [ANCRE: REJOUABILITE_CAMP_RECUPERATION] — la forme (attritionHeal(),
     ui-08) décroît réellement avec la profondeur de la run mais restait
     invisible sur cet écran, rendant l'option "Récupération active"
     (ui-03) illisible faute de référence. Jauge affichée juste avant les
     groupes d'attributs, même style que le reste de l'écran. ==== */
  /* ==== [ANCRE: GAUNTLET_SANS_MORAL_FORME] — le bloc jauge « Forme /
     Récupération de la run » est retiré : la valeur n'est plus lue par eff()
     en arcade et n'a donc plus rien à communiquer. L'état passif de la run
     (contrat, cagnotte, séquelles, multiplicateur) reste le seul bloc de
     contexte avant les attributs. ==== */
  h+=`<div class="hr" style="margin:24px 0"></div>
      ${gauntletStatusBlock(a,true)}
      ${gauntletInfirmaryBlock(a)}
      ${ringDoctorUltimatumBlock(a)}
      <div class="eyebrow mb mt">Attributs du combattant (temps réel)</div>
      ${grp('tech','Technique',g.tech)}${grp('ment','Mental',g.ment)}${grp('phys','Physique',g.phys)}
  </div>`;
  /* ==== [FIN ANCRE] ==== */
  return h;
}
/* ==== [ANCRE: IDENTITE_DE_CAMP] — ajout #22 (24 ajouts, 12/08/2026) : écran
   de choix, une seule fois par run, avant le premier combat — les deltas
   sont montrés directement en /20 (division par 5) pour rester cohérent
   avec l'échelle affichée partout ailleurs dans l'UI. ==== */
function scr_camp_identity_pick(){
  const opts=G.arcade.campIdentityOptions||[];
  return `<div class="scr center intro"><div class="eyebrow sage">Avant le premier combat</div>
   <h2 class="disp big">IDENTITÉ DE CAMP</h2>
   <p class="lede">Un choix définitif, pour toute la durée de cette run.</p>
   ${opts.map((c,i)=>{
     const fxTxt=Object.entries(c.fx).map(([k,v])=>{
       const cur=d20(G.f.attrs[k]); const proj=d20(clamp(G.f.attrs[k]+v,1,100));
       return `<span class="dlt ${v>0?'up':'dn'}">${attrLabel(k)} ${cur} → ${proj}</span>`;
     }).join('');
     /* ==== [ANCRE: PASSIF_IDENTITE_DE_CAMP] — item demandé : le passif doit
        être explicite au moment du choix, pas découvert en cours de run.
        Ligne distincte du delta de stats (fxTxt), absente pour Camp du
        Silence (passive:null, aucun passif). ==== */
     const passiveTxt=c.passive?`<div class="mono small mt gold">⚡ ${c.passive.label}</div>`:'';
     /* ==== [FIN ANCRE] ==== */
     return `<div class="opp" onclick="CL.pickCampIdentity(${i})">
       <div class="opp-top"><span class="opp-nm gold">${c.name}</span></div>
       <div class="opp-read" style="margin-top:4px;opacity:1">${c.desc}</div>
       <div class="dlts mt">${fxTxt}</div>
       ${passiveTxt}
     </div>`;
   }).join('')}
  </div>`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: INFIRMERIE_FORTUNE] — ajout #20 (24 ajouts, 12/08/2026) :
   affiché sur l'écran de camp Gauntlet (scr_arcade_upgrades ci-dessus)
   uniquement si au moins une zone porte une séquelle — rien à soigner, rien
   à afficher. ==== */
function gauntletInfirmaryBlock(a){
  const zones=['tete','corps','jambes'].filter(z=>(a.runInjuries||[]).some(i=>i.zone===z));
  if(!zones.length) return '';
  const meta=loadMetaStats(); const pts=meta.legendPoints||0;
  return `<div class="glass mwash mt" style="position:relative;background:var(--panel2);border:1px solid var(--loss);padding:12px;text-align:left">
     <div class="eyebrow mb" style="color:var(--loss)">🩹 Infirmerie de fortune</div>
     <div class="muted small mb">Soigne UNE zone anatomique contre des points de Légende — les autres séquelles restent actives.</div>
     ${zones.map(z=>{
       const cost=gauntletInfirmaryCost(a,z);
       const canAfford=pts>=cost;
       const names=(a.runInjuries||[]).filter(i=>i.zone===z).map(i=>i.name).join(', ');
       return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--line)">
         <div><b class="small">${GAUNTLET_ZONE_LABEL[z]}</b><div class="muted small">${names}</div></div>
         <button class="btn ghost" style="padding:6px 10px;width:auto;font-size:11px;border-color:${canAfford?'var(--loss)':'var(--line)'};color:${canAfford?'var(--loss)':'var(--muted)'}" onclick="CL.healGauntletZone('${z}')" ${canAfford?'':'disabled'}>Soigner — ${cost} pts</button>
       </div>`;
     }).join('')}
   </div>`;
}
/* ==== [ANCRE: ULTIMATUM_MEDECIN] — ajout #24 (24 ajouts, 12/08/2026) :
   affiché sur le même écran de camp que l'Infirmerie de fortune, juste en
   dessous, quand ringDoctorUltimatumActive(a) (ui-03) est vraie — 2 issues
   franches, aucune ambiguïté sur ce que chacune implique. ==== */
function ringDoctorUltimatumBlock(a){
  if(!ringDoctorUltimatumActive(a)) return '';
  return `<div class="glass mwash mt" style="position:relative;background:var(--panel2);border:1px solid var(--blood);padding:14px;text-align:left">
     <div class="eyebrow mb" style="color:var(--blood)">🩺 Ultimatum du médecin de ring</div>
     <div class="muted small mb">Le combattant encaisse trop de séquelles pour continuer sereinement. Le médecin exige une décision.</div>
     <div style="display:flex;gap:10px;flex-wrap:wrap">
       <button class="btn ghost" style="border-color:var(--sage);color:var(--sage);flex:1;min-width:140px" onclick="CL.acceptRingDoctor()">Accepter — encaisser proprement maintenant</button>
       <button class="btn ghost" style="border-color:var(--blood);color:var(--blood);flex:1;min-width:140px" onclick="CL.refuseRingDoctor()">Refuser — continuer (×1.5 si victoire finale)</button>
     </div>
   </div>`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: COACHING_ENTRE_ROUNDS] — ajout #21 (24 ajouts, 12/08/2026) :
   écran de pause entre 2 rounds — dégâts encaissés/infligés ce round-là +
   tendance des juges (cumulée sur les rounds déjà joués), puis nouvelle
   consigne tactique pour le round suivant. Même construction de liste de
   tactiques que scr_arcade_plan (archétype exclusif + exclusive style +
   3 options de style) pour rester cohérent avec l'écran de pré-combat. ==== */
function scr_coaching_round(){
  const a=G.arcade, c=a.coaching, f=G.f, r=c.lastRoundRes;
  const archTactic=ARCADE_EXCLUSIVE_TACTICS[f.nick];
  const combined=(archTactic?[archTactic]:[]).concat(getExclusiveTactics(f)).concat(TACTICS[f.style]||[]);
  /* ==== [ANCRE: REFONTE_ECRAN_COACHING] — item demandé : refonte visuelle de
     cet écran uniquement (pas la transition ni le rendu de combat). Le
     "total combiné" (c.scoreA/c.scoreB, somme des 3 juges, jusqu'à 90 sur 3
     rounds) est remplacé par le vrai détail PAR JUGE (c.judges, corrigé
     ci-dessus dans runCoachingRound) — chaque juge reste sur 10 par round
     vu, jusqu'à 30 en fin de combat, même convention que scr_result (ui-06).
     Réutilise .duel2/.num TEL QUEL (mêmes classes, mêmes couleurs a/b/dn)
     pour que la tendance mi-combat ressemble visuellement au scorecard final
     — même langage, deux moments différents. ==== */
  const roundJustEnded=c.round-1;
  /* ==== [ANCRE: ESTIMATION_JUGES_COACHING] — affichage de l'ESTIMATION
     (c.judgesEstimate, calculée dans runCoachingRound), jamais du vrai
     score (c.judges) — repli sur c.judges seulement si une sauvegarde
     antérieure à ce correctif n'a pas encore ce champ. ==== */

  /* ==== [ANCRE: COACH_DU_COIN] — item demandé : la fin de round ressemblait
     à une fin de COMBAT (grand "FIN DU ROUND", scorecard des juges façon
     décision finale), alors que c'est une pause : le combat reprend juste
     après. L'écran dit maintenant explicitement combien de rounds restent
     et à quoi sert cet arrêt, et l'estimation chiffrée des juges — du
     jargon de scorecard — est REMPLACÉE par ce que dit le coach, avec des
     mots : plus aucun chiffre de juge sur cet écran. ==== */
  const totalRounds=(G.fight&&G.fight.rounds)||3;
  const restants=Math.max(0,totalRounds-roundJustEnded);
  const verdict=coachScoreLine(a,c);
  const conseil=coachAdviceLine(a,c,r,f);
  /* ==== [FIN ANCRE] ==== */
  /* ==== [FIN ANCRE] ==== */
  /* ==== [ANCRE: SECOND_SOUFFLE] — ajout #24 (24 ajouts, 12/08/2026) : offre
     rare, affichée une seule fois (avant le round 3, si l'offre a été tirée
     favorable côté runCoachingRound) — disparaît dès qu'utilisée. ==== */
  const secondSouffleBlock=(c.secondSouffleAvailable && !c.secondSouffleUsed)?`<div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--gold);padding:14px;text-align:left;margin-bottom:12px">
     <div class="eyebrow mb" style="color:var(--gold)">✨ Second Souffle</div>
     <div class="muted small">Mené sur les cartes après 2 rounds — une dernière réserve, pour ce round uniquement (+2 Sang-froid, +2 Cardio, +2 Puissance, +2 Menton).</div>
     <button class="btn ghost mt" style="border-color:var(--gold);color:var(--gold);padding:6px 10px;width:auto" onclick="CL.acceptSecondSouffle()">Puiser dans les réserves</button>
   </div>`:'';
  /* ==== [FIN ANCRE] ==== */
  return `<div class="scr"><div class="bar"><span class="eyebrow">DANS TON COIN · ENTRE LES ROUNDS</span></div>
   <div class="card glass raise" style="text-align:center;background:linear-gradient(180deg,var(--panel2) 0%,var(--bg) 100%);border-color:var(--gold-d);padding:18px 16px;margin-bottom:16px;position:relative;overflow:hidden">
     <div style="position:absolute;top:-30px;right:-10px;font-size:120px;opacity:0.05;font-family:'Oswald';font-weight:700;color:var(--gold);pointer-events:none;z-index:0;line-height:1">${roundJustEnded}</div>
     <div class="eyebrow gold mb" style="position:relative;z-index:2;letter-spacing:0.3em">PAUSE — ROUND ${roundJustEnded} TERMINÉ</div>
     <div class="muted small" style="position:relative;z-index:2">Le combat n\u2019est pas fini : il reste ${restants} round${restants>1?'s':''}. Tu es dans ton coin, c\u2019est le moment de choisir la consigne du round suivant.</div>
     <div class="mono small mt" style="position:relative;z-index:2">Coups placés <b style="color:var(--sage)">${(r.stats.B.dmgHead+r.stats.B.dmgBody+r.stats.B.dmgLegs)}</b> · Coups encaissés <b style="color:var(--loss)">${(r.stats.A.dmgHead+r.stats.A.dmgBody+r.stats.A.dmgLegs)}</b></div>
   </div>
   <!-- ==== [CORRECTIF V2-31 point 2] — "un coach ne parle pas en
        paragraphe entre deux rounds, il lâche trois choses" : les deux
        répliques apparaissent l'une après l'autre (délai ~450ms), pas
        d'un bloc. Rien ne bloque l'interaction pendant l'animation (les
        boutons de consigne plus bas restent cliquables immédiatement) :
        un seul tap suffit toujours, jamais besoin d'en attendre un second
        pour que la mise en scène se termine (règle V2-31 point 3). ==== -->
   <div class="card mb" style="background:var(--panel2);border-left:3px solid var(--gold);padding:14px">
     <div class="small" style="color:var(--text);opacity:0;animation:fade .3s ease .05s forwards">${verdict}</div>
     <div class="small mt" style="color:var(--gold);opacity:0;animation:fade .3s ease .45s forwards">« ${conseil} »</div>
   </div>
   ${secondSouffleBlock}
   <div class="eyebrow gold mb" style="letter-spacing:0.2em">TA CONSIGNE POUR LE ROUND ${c.round}</div>
   <!-- ANCRE IDENTITE_TOUJOURS_VISIBLE : les consignes proposées dépendent de
        la discipline du combattant, autant la rappeler juste au-dessus. -->
   <div class="mb">${gauntletIdentityRow(f)}</div>
   ${combined.map((p,i)=>`<div class="opp" onclick="CL.pickCoachingTactic(${i})">
     <div class="opp-top"><span class="opp-nm gold" style="font-size:17px">${p.lbl}</span></div>
     <div class="opp-read" style="margin-top:4px;opacity:1">${p.desc}</div></div>`).join('')}
   <button class="btn ghost mt" onclick="CL.pickCoachingTactic(-1)">Garder la même consigne</button>
  </div>`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [FIN ANCRE] ==== */
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: TITLE_ELIGIBLE] — condition UNIQUE, partagée par genOpponents()
   et fightKind(). Avant : les deux vérifiaient des choses différentes
   (streak vs orgWins), ce qui permettait de battre le vrai champion sans que
   le combat soit jamais reconnu comme un combat de titre. ==== */
