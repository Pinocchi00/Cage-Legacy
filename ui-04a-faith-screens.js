"use strict";
/* CAGE LEGACY — js/ui-04a-faith-screens.js
   ============================================================================
   Écrans du mode MMA Faith (création, vestiaire, événements de vie, presse,
   serments, épilogue, contacts). Moitié Faith de l'ancien ui-04-faith-arcade-
   screens.js (Fichier 4/8 du découpage de l'ancien ui.js monolithique).

   ==== [CORRECTIF FICHIER_SCINDE_FAITH_GAUNTLET] — second découpage,
   ultérieur au split en 8 fichiers (même logique que ui-09-arena.js,
   index.html) : ui-04-faith-arcade-screens.js mélangeait deux moitiés sans
   AUCUN symbole partagé entre elles (vérifié — aucune fonction Gauntlet
   n'appelle une fonction Faith, et réciproquement), simplement recopiées
   dans l'ordre du monolithe d'origine. Coupure nette à la frontière
   Faith/Gauntlet, sans toucher une ligne de code : ce fichier reprend tel
   quel le contenu Faith d'origine (lignes 1-2324 de l'ancien fichier), la
   suite Gauntlet vit dans ui-04b-gauntlet-screens.js. ====

   IMPORTANT : aucune fonction n'a été déplacée ou réordonnée à l'intérieur
   de la moitié Faith — seule une frontière de fichier a été insérée à la
   jonction Faith/Gauntlet. Ce fichier partage la même portée globale que le
   reste de l'ancien ui.js (variables et fonctions visibles d'un fichier à
   l'autre) ; il faut donc le charger AVANT ui-04b-gauntlet-screens.js et
   dans l'ordre indiqué dans index.html : 01, 02, 03, 04a, 04b, 05... jusqu'à
   08.
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
  if(f.injury) return 1;
  if((f.form||100)<30) return 1;
  if(f.champion) return 1;
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
 * @param {object} f @param {object} [opponent] l'adversaire RÉELLEMENT
 * proposé sur cette carte, quand il est déjà connu — absent (filtre
 * préliminaire avant qu'un candidat ne soit choisi, ou simple aperçu
 * d'affichage) : le statut de némésis n'entre alors pas en jeu.
 * @returns {{tier:string,mult:number,hype:string,rounds:number}} */
function faithGalaPosition(f,opponent){
  /* ==== [CORRECTIF V2-24 point 4] — le circuit amateur (org 0) n'a ni
     hype ni conférence de presse : un gala amateur à Lyon n'a pas de main
     event médiatisé, même si un rivalId ou un rang bas s'est déjà formé à
     ce niveau (ex. via la némésis, verrouillable dès l'amateur — V2-26).
     Verrouillé avant toute autre condition, pas juste en dernier recours. */
  if((f.org||0)===0) return {tier:'Circuit amateur',mult:0.6,hype:'nulle',rounds:3,pressConf:false};
  const rk=divRank(f);
  /* ==== [ANCRE: CORRECTIF_MAIN_EVENT_NEMESIS_PERMANENT] — bug trouvé :
     `f.rivalId` (posé une seule fois par lockFaithNemesis() et jamais remis
     à null tant que la némésis vit) était testé seul, sans jamais vérifier
     que L'ADVERSAIRE DE CE COMBAT-CI est bien elle. Une fois une némésis
     verrouillée, TOUTE la carrière restante passait en Main event (bourse
     doublée à vie, 5 reprises, conférence de presse + pesée obligatoires
     avant CHAQUE combat — contredisant frontalement le plafond de
     V4_C19_PESEE_GATING). Comparé désormais à l'adversaire réel de cette
     offre, quand il est connu. ==== */
  if(rk<=4 || f.champion || (opponent && f.rivalId===opponent.id)) return {tier:'Main event',mult:2,hype:'forte',rounds:5,pressConf:true};
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
/* ==== [ANCRE: V4_C16_TERRITOIRE_GALA] — Plan V4 LOT 6 C16 : "je veux que
   l'univers du jeu change" — le socle existait déjà (FAITH_GALA_CITIES,
   FAITH_GALA_CITY_COUNTRY, avantage du terrain) mais aucun choix ne le
   pilotait : les deux branches du plafond régional (evt_br_regional_
   ceiling, data-faith-content.js) ne faisaient que des deltas d'attributs.
   F.territoire ('regional'|'international', posé par ce choix dans
   chooseFaithEvent(), ui-08) restreint désormais le pool de villes tirées
   au sort : "régner sur son territoire" ne joue plus qu'à domicile (dans
   le pays du combattant, quand une ville y correspond), "aller chercher
   plus loin" ne joue plus qu'à l'étranger. Même seed que l'existant :
   déterministe tant qu'année+mois+org ne changent pas. */
function faithGalaCity(F,f){
  const seed=(F.year||2026)*13+(F.month||0)*7+(f.org||0);
  if(F.territoire==='regional'){
    const home=FAITH_GALA_CITIES.filter(c=>FAITH_GALA_CITY_COUNTRY[c]===f.countryKey);
    if(home.length) return home[seed%home.length];
  } else if(F.territoire==='international'){
    const away=FAITH_GALA_CITIES.filter(c=>FAITH_GALA_CITY_COUNTRY[c]!==f.countryKey);
    if(away.length) return away[seed%away.length];
  }
  return FAITH_GALA_CITIES[seed%FAITH_GALA_CITIES.length];
}
/* ==== [FIN ANCRE] ==== */
/** Nom et lieu du gala — déterministe par année+mois pour ne pas changer si
 * l'écran est réaffiché sans qu'un mois ne s'écoule.
 * @param {object} F G.faith @param {object} f */
function faithGalaLabel(F,f){
  const seed=(F.year||2026)*13+(F.month||0)*7+(f.org||0);
  const prefix=FAITH_GALA_PREFIX[f.org]||FAITH_GALA_PREFIX[0];
  const num=((seed*17)%89)+1;
  const city=faithGalaCity(F,f);
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
  const city=faithGalaCity(F,f);
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
   fichier), remplacé par la raison. faithLeverage ne perd rien de ce
   qu'avait faithNegotiationPower.
   ==== [CORRECTIF V2-20bis] — F.buildup.attente n'entre plus dans le score :
   le build-up n'est tiré qu'APRÈS la signature (faithOfferSign, ui-08),
   jamais avant la négociation de CETTE offre, et F.buildup n'est jamais
   remis à zéro entre deux combats — la condition ne pouvait refléter que le
   reliquat d'un combat précédent, avec un score++ qui finissait par se
   figer en permanence dès qu'attente franchissait 2 une fois dans la
   carrière. ==== */
function faithLeverage(f,F){
  let score=0;
  if((f.streak||0)>=2) score++;
  if(divRank(f)<=15) score++;
  if((f.hypeBonus||1)>1.2) score++;
  if(f.personality==='villain') score++;
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
function faithHubNumCell(lbl,val,color,sub){
  return `<div class="glass" style="text-align:center;padding:8px 0;min-height:auto">
    <b class="mono" style="font-size:14px;${color?`color:${color}`:''}">${val}</b>
    <div class="stat-lbl" style="margin-top:2px;font-size:9px">${lbl}</div>
    ${sub?`<div class="mono" style="margin-top:2px;font-size:9px;color:var(--muted)">${sub}</div>`:''}</div>`;
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
  /* ==== [ANCRE: V4_C17_P4P_RANG_MONDIAL] — cf. engine.js pour le détail du
     calcul. Affiché comme sous-ligne de la case RANG (division) plutôt
     qu'une 7e case : la grille 2×3 est volontairement fixe (ANCRE
     FAITH_HUB_GRILLE juste au-dessus), jamais variable. */
  const p4p=fightsTot>0?p4pRank(f):null;
  return `<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
    ${faithHubNumCell('ÂGE',f.age)}
    ${faithHubNumCell('OVR',f.overall)}
    ${faithHubNumCell('RANG',rank,f.champion?'var(--gold)':null,p4p?`P4P #${p4p}`:null)}
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
      :monthEntry.type==='fight'?'Un combat approche'
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
     <div class="opp" style="padding:16px" onclick="G._legendsReturn='faith_home';CL.go('faith_legends')">
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
     raison" (cf. ANCRE PERSON_REGISTRY, state.js). Repli `||gym[0]` supprimé
     (CORRECTIF C13, cf. scr_faith_contacts plus bas — même raison). ==== */
  const topPartner=(G.faith.gym||[]).find(p=>p.id===G.faith.sparringPrimaryId);
  /* ==== [CORRECTIF FA-26] — « afficher son palmarès sur le hub, une
     ligne » : le combattant peut avoir quitté G.roster (retraite NPC) sans
     que f.faithNemesisId ne soit nettoyé nulle part — repli silencieux si
     introuvable plutôt qu'un nom manquant à l'écran. */
  const nemesis=f.faithNemesisId?(G.roster||[]).find(o=>o.id===f.faithNemesisId):null;
  let actionsHtml='';
  if(f.injury){
    /* ==== [ANCRE: FAITH_BOUTON_BLESSURE] — f.injury peut être posé par
       faithCampChoose() (stage à risque, ui-08). Prime sur tout, quel que
       soit le mois : un combattant blessé ne voit plus d'adversaire
       pressenti ni de vie de salle, seule l'Infirmerie, jusqu'à guérison.
       Décompte en MOIS (CL.faithRecoverInjury, ui-08), pas en combats —
       CL.recoverInjury() est le handler du mode carrière, il n'avance
       jamais G.faith.month. ==== */
    actionsHtml=`<div class="opp" style="padding:16px;text-align:left;margin-bottom:16px;border-left:3px solid var(--loss)">
      <div class="eyebrow" style="font-size:11px;color:var(--loss)">INFIRMERIE</div>
      <div class="hero-name" style="font-size:20px;margin-top:6px">${esc(f.injury.name)}</div>
      <div class="mono small muted" style="margin-top:4px">${f.injury.left} mois avant guérison complète</div>
    </div>
    <button class="btn primary" style="width:100%;height:56px;font-size:16px" onclick="CL.faithRecoverInjury()">LAISSER LE CORPS RÉCUPÉRER</button>`;
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
    : `<p class="lede small">${G.lastMsg?esc(G.lastMsg):'Tout est en place.'}</p>
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
    <!-- ==== [ANCRE: V4_C15_FAITH_ARCHIVES] — Plan V4 LOT 6 C15 : accessible
         depuis le hub, cf. scr_faith_archives (ui-04). ==== -->
    <button class="btn ghost" onclick="CL.viewFaithArchives()">Archives</button>
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
/* ==== [ANCRE: FIGHTER_BIO_C14] — Plan V4 LOT 5 §C14 : bio.origin/bio.past/
   bio.trait existent maintenant sur tout combattant (posés une seule fois à
   la génération, makeFighter()/engine.js) mais ne s'affichaient nulle
   part. Trois surfaces : une seule ligne pertinente sur l'offre (ci-dessous,
   jamais les trois à la fois — un adversaire ne se résume pas d'un coup),
   la fiche complète sur la nouvelle "fiche adverse" (scr_opponent_card,
   plus bas) et au classement (scr_rankings, ui-06, désormais tapable). */
/** Choisit LA ligne de lore pertinente pour CE combat précis, jamais les
 * trois à la fois (règle H.1-like : un adversaire ne se résume pas d'un
 * coup) : une némésis mérite qu'on sache ce qui le définit, un vétéran
 * connu se lit par ce qui le pousse encore, un inconnu se découvre par
 * d'où il vient. @param {object} o @param {object} f @returns {?{label:string,text:string}} */
function oppRelevantLore(o,f){
  if(!o.bio) return null;
  if(o.id===f.faithNemesisId) return {label:'CE QUI LE DÉFINIT',text:o.bio.trait};
  const fights=(o.W||0)+(o.L||0)+(o.D||0);
  if(fights>=15) return {label:'CE QUI LE POUSSE',text:o.bio.past};
  return {label:'D’OÙ IL VIENT',text:o.bio.origin};
}
/** La "fiche adverse" : identité, palmarès et les trois lignes de lore
 * d'un combattant du roster (opposant), jamais celles du joueur (déjà sur
 * scr_profile). Cible dynamique (G._oppCardId, posé par l'appelant avant
 * CL.go) — même convention que G._profileReturn (scr_profile, ui-06) pour
 * un écran qui n'a pas de référence fixe unique dans SCREENS. */
function scr_opponent_card(){
  const o=(G.roster||[]).find(x=>x.id===G._oppCardId);
  const back=G._oppCardReturn||'faith_hub';
  if(!o) return `<div class="scr center intro"><p class="lede">Adversaire introuvable.</p><button class="btn ghost mt" onclick="CL.go('${back}')">Retour</button></div>`;
  const rnk=divRank(o);
  return `<div class="scr" style="max-width:480px;margin:0 auto">
   <div class="bar"><span class="eyebrow">Fiche adverse</span><span class="eyebrow x" onclick="CL.go('${back}')">✕</span></div>
   <h2 class="hero-name" style="font-size:26px;margin-top:8px">${esc(o.name)} ${o.flag||''}</h2>
   <div class="muted small mt">${esc(o.styleLabel||'')}, ${o.age} ans</div>
   <div class="mono small mt">${recordStr(o)} · ${o.champion?'CHAMPION':`#${rnk}`}</div>
   ${o.bio?`<div class="card mt" style="padding:14px;background:var(--panel2);text-align:left">
     <div class="eyebrow mb" style="font-size:11px">D’OÙ IL VIENT</div>
     <div class="small">${esc(o.name)} ${esc(o.bio.origin)}.</div>
   </div>
   <div class="card mt" style="padding:14px;background:var(--panel2);text-align:left">
     <div class="eyebrow mb" style="font-size:11px">CE QUI LE POUSSE</div>
     <div class="small">${esc(o.bio.past)}.</div>
   </div>
   <div class="card mt" style="padding:14px;background:var(--panel2);text-align:left">
     <div class="eyebrow mb" style="font-size:11px">CE QUI LE DÉFINIT</div>
     <div class="small">${esc(o.bio.trait)}</div>
   </div>`:''}
   <!-- ==== [ANCRE: V4_C15_FAITH_ARCHIVES] — Plan V4 LOT 6 C15 : accessible
        depuis toute fiche de combattant — celle-ci en est une (fiche
        adverse). Le lien pré-filtre sur cet adversaire (CL.viewFaithArchives
        (o.id)) pour montrer la trilogie d'un coup, mais seulement s'il y a
        déjà un face-à-face à montrer. ==== -->
   ${(G.faith && ((G.f.amaHistory||[]).concat(G.f.history||[])).some(h=>h.oppId===o.id))?`<div class="mono small" style="text-align:center;margin-top:8px"><span onclick="CL.viewFaithArchives('${o.id}')" style="color:var(--muted);cursor:pointer;text-decoration:underline">Voir le face-à-face dans les Archives ▸</span></div>`:''}
   <button class="btn ghost mt" onclick="CL.go('${back}')">← Retour</button>
  </div>`;
}
/* ==== [FIN ANCRE] ==== */
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
  /* ==== [ANCRE: V2-32ter] — crowdLine figée par faithEnsureOffer() (ui-08)
     à la génération de l'offre, jamais retirée à chaque rendu. ==== */
  const crowdLine=off.crowdLine||'';
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
     ${(()=>{ const lore=oppRelevantLore(o,f); return lore?`<div class="small muted" style="margin-top:8px">${esc(lore.label)} · ${esc(lore.text)}</div>`:''; })()}
   </div>
   <div class="mono" style="margin-top:16px;font-size:15px">Bourse estimée : <b>${bourseEst}k$</b></div>
   <!-- ==== [CORRECTIF V2-20bis] — off.finishBonus (posé par
        faithOfferDemandMoney(), ui-08, sur deux de ses quatre issues) double
        finishBonusMult à la résolution du combat (ui-05) sans jamais toucher
        off.bonusMult : bourseEst restait inchangée à l'écran alors qu'une
        vraie contrepartie mécanique venait d'être négociée. ==== -->
   ${off.finishBonus?`<div class="mono small" style="color:var(--gold);margin-top:4px">Prime de finition doublée sur ce combat.</div>`:''}
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
   <div class="mono small" style="text-align:center;margin-top:8px"><span onclick="G._oppCardId='${o.id}';G._oppCardReturn='faith_offer';CL.go('opponent_card')" style="color:var(--muted);cursor:pointer;text-decoration:underline">Voir la fiche adverse ▸</span></div>
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
/** Tire un événement de build-up (V2-23), sans écran séparé pour la
 * sélection de choix — deux options, réponse immédiate (règle 6 : un choix
 * par combat, pas un menu). @returns {{title:string,text:string,
 * chosen:string}|null} */
function faithBuildupPick(F){
  if(!F.buildup) F.buildup={attente:0,tension:0,causes:[]};
  const seen=F.buildupSeen||(F.buildupSeen=[]);
  let pool=FAITH_BUILDUP_EVENTS.filter(e=>!seen.includes(e.id));
  if(!pool.length){
    const last=seen[seen.length-1];
    seen.length=0;
    pool=FAITH_BUILDUP_EVENTS.filter(e=>e.id!==last);
  }
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
/* ==== [ANCRE: V4_C19_PRESSCONF_POSTURES] — Plan V4 LOT 7 §C19 point 1 : les
   trois postures de scr_faith_press_conf (respect/provocation/silence)
   restaient trois libellés fixes, identiques à chaque conférence d'une
   carrière qui en traverse pourtant plusieurs dizaines depuis le Lot 1.
   Le TROIS RESTE TROIS (faithPressConfPosture(), ui-08, ne connaît que ces
   trois branches mécaniques — respect/provocation/silence — jamais touchée
   ici) : seul le LIBELLÉ/l'accroche affiché sur chaque bouton est tiré
   d'un pool de 15 (FAITH_PRESSCONF_POSTURES, data-faith-content.js), un
   par catégorie via le filtre `tier` déjà prévu par txtPick (réutilisé ici
   pour la catégorie de posture plutôt que pour un rang). req(ctx) lit
   f.personality et l'historique commun avec cet adversaire précis
   (ctx.commonHistory), les deux champs demandés. */
function faithPressConfPostureOptions(f,o){
  if(!TEXT_POOLS['faith_pressconf_posture']) registerTextPool('faith_pressconf_posture',FAITH_PRESSCONF_POSTURES);
  const commonHistory=(f.history||[]).filter(h=>h.oppId===o.id).length;
  /* ==== [CORRECTIF V2-32ter] — F:f envoyait le ledger anti-répétition sur
     le combattant (f.textLedger) au lieu de G.faith.textLedger, où
     faithOppReplies() (juste au-dessus) écrit déjà les siens : deux ledgers
     concurrents sur le même écran, l'un réinitialisé par faithRelaunchSame
     et pas l'autre. ==== */
  const base={personality:f.personality,commonHistory,F:G.faith};
  return ['respect','provocation','silence'].map(type=>{
    const picked=txtPick('faith_pressconf_posture',Object.assign({},base,{rankTier:type,ledgerKey:'faith_pressconf_posture:'+type}));
    return Object.assign({type},picked&&typeof picked==='object'?picked:{label:type,hint:''});
  });
}
/* ==== [FIN ANCRE] ==== */
function scr_faith_press_conf(){
  const F=G.faith, off=F.pendingOffer;
  if(!off) return `<div class="scr center intro"><p class="lede">Rien à signaler.</p><button class="btn ghost mt" onclick="CL.go('faith_hub')">Retour</button></div>`;
  const o=off.opp.o;
  /* ==== [ANCRE: V2-32ter] — répliques et postures figées par
     faithOfferSign() (ui-08) à l'entrée de la conférence, jamais retirées à
     chaque rendu (même motif que off.pesee, ANCRE V4_C19_PESEE). ==== */
  const replies=(off.pressConf&&off.pressConf.replies)||['',''];
  const postures=(off.pressConf&&off.pressConf.postures)||[];
  return `<div class="scr center intro">
   <div class="eyebrow blood">Conférence de presse</div>
   <h2 class="disp">${esc(o.name)} face à vous</h2>
   <div class="glass card" style="background:var(--panel2);text-align:left;padding:16px;margin:16px 0">
     <p class="lede" style="margin:0">${replies[0]}</p>
     <p class="lede" style="margin:12px 0 0">${replies[1]}</p>
   </div>
   <div style="display:flex;flex-direction:column;gap:10px">
     ${postures.map(p=>`<div class="opp" style="padding:14px;text-align:left" onclick="CL.faithPressConfPosture('${p.type}')">
       <b style="font-size:15px">${esc(p.label)}</b>
       <div class="muted small mt">${esc(p.hint)}</div>
     </div>`).join('')}
   </div>
  </div>`;
}
/* ==== [ANCRE: V4_C19_PESEE] — Plan V4 LOT 7 §C19 point 3 : la pesée
   n'existait qu'en coulisses (calcul silencieux du palier de coupe,
   CUTTING_5PALIERS — ui-02/ui-08), jamais montrée au joueur en Faith,
   contrairement à la conférence de presse qui a son écran depuis le LOT 5.
   Le REGISTRE (calme/tendu/comique/menaçant/spectacle) est pondéré par
   f.personality — un vilain fait monter la tension, un showman cherche le
   spectacle, un taiseux préfère le calme — puis une mise en scène concrète
   est tirée dans ce registre (FAITH_PESEE_SITUATIONS, data-faith-content.
   js) via `tier`, en lisant f.personality et le trait de l'adversaire
   (opp.bio.trait), les deux champs demandés. Calculé UNE SEULE FOIS par
   faithOfferSign() (ui-08, ANCRE V4_C19_PESEE_GATING) au moment d'entrer
   sur l'écran — jamais retiré à chaque rendu, même règle que
   G.faith.currentBuildupEvent. */
function faithPeseeRegistre(f){
  const w=f.personality==='villain'?{calme:1,tendu:4,comique:1,menacant:4,spectacle:2}
    :f.personality==='showman'?{calme:1,tendu:1,comique:4,menacant:1,spectacle:5}
    :f.personality==='humble'?{calme:4,tendu:2,comique:2,menacant:1,spectacle:1}
    :{calme:2,tendu:2,comique:2,menacant:2,spectacle:2};
  const entries=Object.entries(w); const total=entries.reduce((s,e)=>s+e[1],0);
  let roll=rnd()*total;
  for(const [k,v] of entries){ roll-=v; if(roll<=0) return k; }
  return entries[entries.length-1][0];
}
const FAITH_PESEE_REGISTRE_LABEL={calme:'Pesée sous contrôle',tendu:'Pesée électrique',comique:'Pesée qui tourne au sketch',menacant:'Pesée qui dérape',spectacle:'Pesée-spectacle'};
function scr_faith_pesee(){
  const F=G.faith, off=F.pendingOffer;
  if(!off||!off.pesee) return `<div class="scr center intro"><p class="lede">Rien à signaler.</p><button class="btn ghost mt" onclick="CL.go('faith_hub')">Retour</button></div>`;
  return `<div class="scr center intro">
   <div class="eyebrow blood">Pesée officielle</div>
   <h2 class="disp">${esc(FAITH_PESEE_REGISTRE_LABEL[off.pesee.registre]||'Pesée officielle')}</h2>
   <div class="glass card" style="background:var(--panel2);text-align:left;padding:16px;margin:16px 0">
     <p class="lede" style="margin:0">${off.pesee.line}</p>
   </div>
   <button class="btn primary" style="width:100%;height:56px;font-size:16px" onclick="CL.faithPeseeContinue()">Continuer vers la cage</button>
  </div>`;
}
/* ==== [FIN ANCRE] ==== */
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
   G.faith (optionnel par nature, actif seulement en carrière).
   ==== [CORRECTIF V3_FAITH_COACH_LOOKUP_bis] — l'ancienne garde
   (`!F.coachId || !G.people.byId[F.coachId]`) dupliquait, en pire, la
   résolution que personEnsure() fait déjà en interne par clé stable
   ('coach:main', personKeyFor) : un F.coachId incohérent avec un
   byKey['coach:main'] pourtant valide déclenchait quand même personMint()
   → pick(pool), un coach qui change d'identité sans raison, exactement le
   repli supprimé pour le sparring par CORRECTIF C13. personEnsure() est
   désormais l'unique autorité : elle retrouve la Person existante par clé
   si elle existe, ne mint que si elle n'existe vraiment nulle part. */
function faithCoachPerson(F){
  const p=personEnsure('coach',{slot:'main'});
  F.coachId=p.id;
  return p;
}
/* ==== [ANCRE: V3_SPARRING_PERSON_C13] — Plan V4 LOT 5 §C13 : le partenaire
   de sparring principal reste un objet combattant (makeFighter(), engine.js
   — il a besoin de vrais attributs pour le Syndrome de Frankenstein), mais
   il lui manquait ce que le coach a déjà depuis LOT 2 : une Person avec
   bio/rel.arc[]. faithSparringPerson() en construit une qui REND l'identité
   déjà affichée (partner.first/last/nick), jamais une nouvelle générée par
   makeName() (Loi 1 : une seule identité par personne) — dédoublonnée par
   id de combattant ('sparring:<id>', personKeyFor), donc rappeler cette
   fonction pour le même partenaire renvoie toujours la même Person.
   Depuis §C14, partner.bio (posé une seule fois à la génération par
   makeFighter(), engine.js) EST déjà la source stable — la Person ne fait
   que la reprendre, jamais un second tirage indépendant qui pourrait
   diverger (repli sur PERSON_TRAITS seulement pour une sauvegarde
   antérieure à C14, où partner.bio n'existe pas encore). */
function faithSparringPerson(partner){
  if(!partner) return null;
  const reg=ensurePeopleRegistry();
  const key='sparring:'+partner.id;
  if(reg.byKey[key]!=null && reg.byId[reg.byKey[key]]) return reg.byId[reg.byKey[key]];
  const id=reg.nextId++;
  const p={id,firstName:partner.first,lastName:partner.last||'',nickname:partner.nick||null,
    flag:partner.flag||'',born:partner.countryKey||'',role:'sparring',
    bio:partner.bio||{origin:partner.origin||'',past:partner.motivation||'',trait:pick(PERSON_TRAITS)},
    rel:personDefaultRel(),state:{gymId:null,active:true,leftAt:null,leftReason:null},memory:[],
    extra:{fighterId:partner.id}};
  reg.byId[id]=p; reg.byKey[key]=p.id;
  return p;
}
/* ==== [FIN ANCRE] ==== */
function scr_faith_contacts(){
  const f=G.f, F=G.faith;
  const dir=FAITH_DIRECTORS[f.org]||FAITH_DIRECTORS[0];
  /* ==== [ANCRE: V3_SPARRING_PRIMARY] — Plan V3 LOT 2 §P04/§P08 : référence
     stable (F.sparringPrimaryId, ui-08), plus un tri recalculé à chaque
     rendu — c'était la cause exacte du bug "Marcus est devenu Sean sans
     raison" (cf. ANCRE PERSON_REGISTRY, state.js). */
  /* ==== [CORRECTIF C13] — le repli `||(G.faith.gym||[])[0]` est supprimé :
     c'est exactement le chemin par lequel le bug pouvait revenir (un id
     introuvable retombait en silence sur le premier de la liste, sans
     jamais dire pourquoi). ensureSparringPrimary() (ui-08) est désormais le
     SEUL endroit qui peut faire "partir" un partenaire, et il le fait
     traçable (personDepart) — plus jamais ici. Si topPartner est null, la
     carte ne s'affiche simplement pas (cf. plus bas), ce qui n'arrive en
     pratique jamais : l'écurie ne descend jamais sous 2 partenaires
     (FAITH_ECURIE_RENOUVELEE, ui-08). ==== */
  const topPartner=(F.gym||[]).find(p=>p.id===F.sparringPrimaryId);
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
       faithProtegeLine(topPartner,f),"CL.go('faith_sparring_detail')"):''}
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
/* ==== [ANCRE: V3_SPARRING_DETAIL_C13] — Plan V4 LOT 5 §C13 : même traitement
   que le coach (scr_faith_coach_detail juste au-dessus) — historique daté
   (rel.arc[]) + 1-2 informations contextuelles — pour le partenaire de
   sparring principal, désormais lui aussi porté par une vraie Person
   (faithSparringPerson). Les informations propres au combattant (style,
   âge, familiarité) restent lues sur l'objet fighter (partner), la Person
   ne portant que l'identité/relation (Loi de séparation, cf. bio/rel). */
function scr_faith_sparring_detail(){
  const F=G.faith, f=G.f;
  const partner=(F.gym||[]).find(p=>p.id===F.sparringPrimaryId);
  if(!partner) return `<div class="scr center intro"><p class="lede">Aucun partenaire pour l’instant.</p><button class="btn ghost mt" onclick="CL.go('faith_contacts')">Retour</button></div>`;
  const person=faithSparringPerson(partner);
  const trust=person.rel.trust;
  const trustLabel=trust>=70?'Une vraie confiance, construite dans la durée.':trust>=40?'Une relation correcte, sans plus.':'La confiance n’y est plus vraiment.';
  const arc=(person.rel.arc||[]).slice().reverse();
  return `<div class="scr" style="max-width:480px;margin:0 auto">
   <div class="bar"><span class="eyebrow">Partenaire d’entraînement</span><span class="eyebrow x" onclick="CL.go('faith_contacts')">✕</span></div>
   <h2 class="hero-name" style="font-size:26px;margin-top:8px">${esc(personName(person,{withNick:true}))}</h2>
   <div class="muted small mt">${esc(partner.styleLabel||'')}, ${partner.age} ans</div>
   <div class="card mt" style="padding:14px;background:var(--panel2);text-align:left">
     <div class="eyebrow mb" style="font-size:11px">CE QU’IL A DÉJÀ FAIT</div>
     <div class="small">${esc(person.firstName)} ${esc(person.bio.origin)}.</div>
   </div>
   <div class="card mt" style="padding:14px;background:var(--panel2);text-align:left">
     <div class="eyebrow mb" style="font-size:11px">CE QUI LE POUSSE</div>
     <div class="small">${esc(person.bio.past)}.</div>
   </div>
   <div class="card mt" style="padding:14px;background:var(--panel2);text-align:left">
     <div class="eyebrow mb" style="font-size:11px">CONFIANCE</div>
     <div class="small">${trustLabel}</div>
   </div>
   <div class="card mt" style="padding:14px;background:var(--panel2);text-align:left">
     <div class="eyebrow mb" style="font-size:11px">SYNDROME DE FRANKENSTEIN</div>
     ${faithProtegeLine(partner,f)}
   </div>
   ${arc.length?`<div class="card mt" style="padding:14px;background:var(--panel2);text-align:left">
     <div class="eyebrow mb" style="font-size:11px">HISTORIQUE</div>
     ${arc.map(a=>`<div class="mono small muted" style="margin-top:4px">${a.year} · ${esc(a.text)}</div>`).join('')}
   </div>`:''}
   <button class="btn ghost mt" onclick="CL.go('faith_contacts')">← Retour aux contacts</button>
  </div>`;
}
/* ==== [FIN ANCRE] ==== */
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
  /* ==== [CORRECTIF V2-09bis] — `e.req` absent (entrées sans condition) levait
     un TypeError, admis par le catch : ça marchait par accident. Le jour où
     une `req` réelle plante sur une donnée manquante, elle sera admise au
     lieu d'être signalée. `!e.req ||` traite l'absence de condition
     explicitement, le try ne reste que pour les vraies erreurs. ==== */
  let pool=FAITH_INTERSAISON_POOL.filter(e=>{
    if((cooldowns[e.id]||0)>0) return false;
    try{ return !e.req || e.req(f,F); }catch(err){ return true; }
  });
  if(pool.length<3) pool=FAITH_INTERSAISON_POOL.filter(e=>{ try{ return !e.req || e.req(f,F); }catch(err){ return true; } });
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
   que faithEnsureOffer (V2-16, ui-08).
   ==== [CORRECTIF V2-09bis] — le décrément des cooldowns vivait ici, dans
   une fonction de PRÉPARATION D'ÉCRAN, alors que leur écriture vit dans le
   contrôleur (faithCampChoose/faithIntersaisonChoose, ui-08) : un futur
   appel de cette fonction depuis un aperçu (le même besoin qui a produit le
   preview du hub, cf. FAITH_HUB_ADVERSAIRE) purgerait tous les cooldowns
   silencieusement. Déplacé à côté de la pose du cooldown choisi (ui-08),
   au moment où l'intersaison est RÉELLEMENT résolue plutôt qu'à chaque
   tirage d'écran. ==== */
function faithEnsureIntersaisonDraw(f,F){
  if(F.currentIntersaison && F.currentIntersaison.month===F.month) return F.currentIntersaison.picks;
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
    /* /5 suppose la MÊME échelle 0-100 pour les attributs et pour
       morale/form — vrai aujourd'hui (les deux sont bornés 0-100 dans tout
       le fichier), mais rien ici ne le vérifie ni ne le documente ailleurs
       que ce commentaire : une future échelle différente pour l'un des deux
       casserait ce calcul en silence. */
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
      return `<div class="scr scr-rupture">
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
    return `<div class="scr scr-rupture">
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
/* ==== [CORRECTIF TITRES_HELPER] — le même calcul (G.titleHistory filtré par
   nom de champion) était recopié à trois endroits de ce fichier. Extrait
   ici plutôt que gardé en triple — le matching par NOM plutôt que par id
   reste tel quel (limitation connue, hors périmètre de ce correctif). */
function faithTitlesWon(f){
  return ((typeof G!=='undefined'&&G&&G.titleHistory)||[]).filter(r=>r.champion===f.name).length;
}
/** Le serment est-il tenu au moment de la retraite ?
 * Un serment rompu en cours de route l'est définitivement.
 * @param {object} oath @param {object} f @param {object} F G.faith @returns {boolean} */
function faithOathFulfilled(oath,f,F){
  if(!oath || oath.broken) return false;
  const titres=faithTitlesWon(f);
  switch(oath.id){
    case 'no_shortcut': return true;              /* purement négatif : tenu tant que non rompu */
    case 'homegrown':   return true;              /* purement négatif aussi : rompu par oathBreak:'homegrown' (data-faith-content.js — évt du transfert accepté, camp d'élite, préparateur externe), lu par ui-08 */
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
/* ==== [CORRECTIF V2-35bis] — F.peakEarnings (ui-08:2660) suit le pic de
   f.earnings, un CUMUL de carrière (bourses, primes, dépenses de stage) —
   pas la plus grosse bourse d'un seul combat. h.purse (posé par
   resolveFight(), ui-05) est la vraie donnée par combat, déjà affichée dans
   le détail de carrière (faithJourneyFightsBlock). @param {object} f
   @returns {number} */
function faithBestPurse(f){
  const purses=(f.history||[]).map(h=>h.purse||0);
  return purses.length?Math.max(...purses):0;
}
/* ==== [FIN ANCRE] ==== */
function computeLegendScore(f){
  const F=(typeof G!=='undefined'&&G&&G.faith)||{};
  const titles=faithTitlesWon(f);

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
  sub=sub||{};
  const d=delays||[0,0,0];
  /* ==== [CORRECTIF FA-27ter] — plafond réel de sub.trace (computeLegendScore,
     ci-dessus) : longevite(10)+hype(4)+oathTenu(3) = 17, jamais 20. La barre
     ne pouvait donc jamais dépasser 85% de son rail, quoi que fasse le
     joueur. ==== */
  if(sub.pic!=null) return `${faithScoreRow('Pic',sub.pic,40,d[0])}${faithScoreRow('Palmarès',sub.palmares,40,d[1])}${faithScoreRow('Trace',sub.trace,17,d[2])}`;
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
  const titles=faithTitlesWon(f);
  const cell=(v,lbl)=>`<div style="border:1px solid var(--line);padding:8px;text-align:center"><div class="mono" style="font-size:15px">${v}</div><div class="eyebrow" style="font-size:9px;margin-top:2px;opacity:.8">${lbl}</div></div>`;
  const totalFights=faithCareerTotalFights(f);
  const cells=[
    cell(totalFights,'Combats (total)'),
    cell((f.ko||0)+(f.sub||0),'Finitions'),
    cell(f.ko||0,'KO/TKO'),
    cell(f.sub||0,'Soumissions'),
    cell(f.dec||0,'Décisions'),
    cell(f.careerSig||0,'Coups mis'),
    cell((F&&F.dmgHeadTotal)||0,'Dégâts encaissés (tête)'),
    cell(f.careerCtrl||0,'Temps de contrôle (s)'),
    cell(Math.max((F&&F.bestStreak)||0,f.streak||0,0),'Meilleure série'),
    cell((F&&F.peakRank!=null)?`#${F.peakRank}`:'—','Meilleur classement'),
    cell(formatArgent(faithBestPurse(f)),'Plus grosse bourse'),
    cell(titles,'Titres'),
    /* ==== [CORRECTIF FA-27ter] — même base que le numérateur
       (faithWeighInsPassed) plutôt que totalFights (faithCareerTotalFights,
       qui retombe sur amaRec.W+L pour une sauvegarde antérieure à
       l'historique amateur préservé) : sur une telle sauvegarde, le
       numérateur ne comptait que le volet pro quand le dénominateur comptait
       les deux, affichant par exemple "17/31". ==== */
    cell(`${faithWeighInsPassed(f)}/${(f.amaHistory||[]).concat(f.history||[]).length}`,'Pesées réussies'),
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
     <!-- ==== [CORRECTIF FA-27ter] — la mention du multiplicateur de serment
          était sous les barres de décomposition, avec pour seul lien un bloc
          de style identique. La somme des barres (sc, non multiplié) ne
          correspond au grand chiffre ci-dessus que si le serment est tenu —
          remontée ici, entre le total et sa décomposition, pour que la
          réconciliation ne repose plus sur le lecteur. ==== -->
     ${serment?`<div class="mono" style="font-size:11px;text-align:center;margin-bottom:12px;color:${tenu?'var(--gold)':'var(--muted)'};${tenu?'':'text-decoration:line-through'}">${tenu?'✦ Serment tenu — score ×1,15':'Serment non tenu'} · ${esc(serment.label)}</div>`:''}
     <div style="margin-bottom:12px">
       ${faithScoreRows(sc,[0,180,360])}
     </div>
     <div class="mono" style="font-size:12px;color:${compare.color};margin-bottom:12px">${compare.text}</div>
     ${faithCareerStatsGrid(f,G.faith)}
     ${faithJourneyBlock(G.faith)}
   </div>
   ${faithNemesisEpilogueBlock(f)}
   <button class="btn primary" style="width:100%;height:56px;margin-top:40px;font-size:16px" onclick="CL.faithRelaunchSame()">REPRENDRE LE MÊME CHEMIN</button>
   <button class="btn ghost" style="width:100%;margin-top:12px" onclick="CL.faithRelaunchEdit()">Changer une chose</button>
   <button class="btn ghost" style="width:100%;margin-top:8px" onclick="CL.newFaithCareer()">Repartir de zéro</button>
   <button class="btn ghost" style="width:100%;margin-top:8px" onclick="G._legendsReturn='faith_epilogue';CL.go('faith_legends')">Voir les Légendes à battre</button>
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
  /* ==== [CORRECTIF FA-27bis] — même motif que G._oppCardReturn (l.685) et
     G._archivesReturn (l.2114) : cet écran a deux portes d'entrée (le hub,
     avant même qu'une carrière soit scellée, et l'épilogue) — un retour en
     dur vers l'épilogue éjectait un joueur venu du hub sur une carrière pas
     encore la sienne. ==== */
  const back=G._legendsReturn||'faith_home';
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
  const record=filtre?(filtered.length?`Meilleure carrière avec « ${esc(filtre.label)} » : ${Math.max(...filtered.map(e=>e.score))}.`
    :`Aucune carrière n’a encore tenu ce serment jusqu’au bout.`):null;
  return `<div class="scr" style="max-width:560px;margin:0 auto">
   <div class="bar"><span class="eyebrow">Légendes à battre</span><span class="eyebrow x" onclick="CL.go('${back}')">✕</span></div>
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
  if(angle==='ascension'||angle==='consecration'||angle==='spectacle_vend'||angle==='spectacle_divertit') j.sentiment=clamp(j.sentiment+1,-3,3);
  else if(angle==='chute'||angle==='usure'||angle==='spectacle_ennuie'||angle==='spectacle_disparait') j.sentiment=clamp(j.sentiment-1,-3,3);
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
 * @param {object} ys yearStats @param {object} F G.faith @param {object} f G.f
 * @returns {string} */
/* ==== [ANCRE: V4_C20_SPECTACLE_ANGLE] — Plan V4 LOT 7 §C20 : f.spectacle
   (0-100, alimenté à chaque combat — ui-05, ANCRE V3_SPECTACLE_UPDATE)
   n'était lu qu'UNE SEULE FOIS dans tout le jeu (la citation qualitative de
   scr_faith_offer, ui-04, ANCRE V3_SPECTACLE_HYPE) — jamais croisé avec le
   bilan de saison, alors même que "gagner mais être chiant" / "perdre mais
   être divertissant" est exactement l'axe que f.spectacle a été créé pour
   capturer (ANCRE V3_SPECTACLE_AXIS, ui-08). Les quatre familles ci-dessous
   (gagne et vend / gagne et ennuie / perd et divertit / perd et disparaît)
   sont insérées juste avant le repli générique 'stagnation' : les angles
   déjà spécifiques (blanche/creux/consecration/usure/ascension/chute)
   restent prioritaires — un titre gagné ou une blessure grave RESTENT le
   titre de l'année, le spectacle ne fait que différencier les saisons
   autrement mornes que 'stagnation' aurait toutes traitées à l'identique.
   Seuils (>=65/<=35) alignés sur ceux déjà utilisés pour la lecture
   qualitative de spectacle (ANCRE V3_SPECTACLE_HYPE utilise 70/30 sur un
   passage plus resserré ; une marge légèrement plus large ici évite qu'une
   saison entière retombe systématiquement en 'stagnation' faute d'y
   arriver jamais sur le cumul de plusieurs combats). */
function faithPresseAngle(ys,F,f){
  if(F&&F.suspended) return 'blanche';
  if((ys.wins||0)===0 && (ys.losses||0)===0) return 'creux';
  if((ys.rank||99)<=3) return 'consecration';
  if((ys.dmgHead||0)>60) return 'usure';
  if((ys.eloDelta||0)>80) return 'ascension';
  if((ys.eloDelta||0)<-60) return 'chute';
  const spectacle=(f&&f.spectacle!=null)?f.spectacle:50;
  const wonSeason=(ys.wins||0)>(ys.losses||0);
  const lostSeason=(ys.losses||0)>(ys.wins||0);
  if(wonSeason && spectacle>=65) return 'spectacle_vend';
  if(wonSeason && spectacle<=35) return 'spectacle_ennuie';
  if(lostSeason && spectacle>=65) return 'spectacle_divertit';
  if(lostSeason && spectacle<=35) return 'spectacle_disparait';
  return 'stagnation';
}
/* ==== [FIN ANCRE] ==== */
/* Plusieurs corps par angle : une carrière dure quinze saisons ou plus, et
   un texte qui revient à l'identique tue la fiction plus vite qu'un texte
   moyen. Le tirage est déterministe (dérivé de l'année et du bilan) pour
   qu'une même saison relise toujours le même article. */
/** La même saison ne se raconte pas pareil selon qui la vit.
 * @param {object} f @param {string} angle @returns {string} */
function faithPresseTon(f,angle){
  const bon=(angle==='ascension'||angle==='consecration'||angle==='spectacle_vend'||angle==='spectacle_divertit');
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
  /* ==== [CORRECTIF V2-35bis] — F.peakEarnings suit f.earnings (un cumul de
     carrière, en baisse dès qu'un stage est payé) : ce fait se déclenchait
     donc CHAQUE année, jamais seulement quand une vraie bourse record tombait.
     h.purse (par combat, f.history) permet de comparer le meilleur cachet de
     l'année aux cachets des années précédentes. */
  const purses=(f.history||[]).map(h=>h.purse||0), thisYearN=ys.fights||0;
  const purseThisYear=thisYearN>0?Math.max(0,...purses.slice(-thisYearN)):0;
  const purseBefore=thisYearN>0?(purses.length>thisYearN?Math.max(0,...purses.slice(0,-thisYearN)):0):0;
  if(purseThisYear>0 && purseThisYear>purseBefore) facts.push({text:'La bourse la plus haute de sa carrière est tombée cette année.',sal:3});
  if(((F.scandals||0)-(F.startOfYearScandals||0))>0) facts.push({text:'Un scandale a entaché la réputation cette année.',sal:4});
  if(!F.startOfYearOathBroken && !!(F.oath&&F.oath.broken)) facts.push({text:'Le serment prononcé au premier jour a été rompu.',sal:4});
  if(!F.startOfYearNemesisBeaten && F.nemesisBeaten) facts.push({text:'La grande rivalité de sa carrière a enfin tourné en sa faveur.',sal:4});
  return facts.sort((a,b)=>b.sal-a.sal).slice(0,3);
}
function faithPresseArticle(ys,f,F){
  const angle=faithPresseAngle(ys,F,f);
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
   et un repère de rupture (serment brisé ou scandale survenu CETTE année
   précisément, pas juste "actuellement brisé" — sinon toutes les années
   suivant une rupture hériteraient à tort du marqueur).
   ==== [CORRECTIF FAITH_PARCOURS_DONNEES_MORTES] — `notables`/`age`
   n'étaient lus par aucun écran (faithJourneyRow n'affiche que year/W-L/
   title/rupture/rank, faithJourneyFightsBlock relit f.history directement) :
   deux champs persistés en localStorage à chaque saison sans jamais être
   affichés. Retirés plutôt que gardés morts. ==== */
function faithArchiveYear(year,ys,f,F){
  if(!F.journey) F.journey=[];
  const scandalsDelta=(F.scandals||0)-(F.startOfYearScandals||0);
  const oathJustBroken=!F.startOfYearOathBroken && !!(F.oath&&F.oath.broken);
  /* ==== [ANCRE: V2-32bis] — réutilise l'article déjà figé et lu par le
     joueur sur scr_faith_year_end (F.currentArticle) plutôt que d'en tirer
     un second qui filtrerait le titre que celui-ci vient d'enregistrer dans
     F.usedHeadlines. Repli sur un tirage frais pour le seul appelant qui ne
     passe jamais par cet écran : la retraite en cours d'année (CL.opp). */
  const titre=(F.currentArticle&&F.currentArticle.year===year)?F.currentArticle.art.titre:faithPresseArticle(ys,f,F).titre;
  F.journey.push({year,W:ys.wins||0,L:ys.losses||0,rank:ys.rank,
    title:titre,
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
/* ==== [ANCRE: V4_C15_FAITH_ARCHIVES] — Plan V4 LOT 6 C15 : "possible
   seulement depuis C2" — l'historique complet (amateur + pro) n'est
   disponible que depuis que turnPro() le déplace au lieu de le détruire
   (f.amaHistory, C2) ; le rang de l'adversaire au moment du combat et la
   saison réelle existent déjà par entrée (oppRank/season, C9). Densité
   `mono`, aucune prose (contrairement à scr_history(), ui-07, la version
   Carrière classique, qui affiche la citation narrative de chaque combat) :
   une ligne = saison, adversaire + son rang à l'époque, résultat, méthode,
   round, bourse (posée par ANCRE V4_C15_FAITH_ARCHIVES, ui-05). Filtrable
   par adversaire (G._archivesFilterOppId, CL.setArchivesFilter) pour revoir
   une trilogie d'un coup — pré-rempli quand on arrive depuis la fiche
   adverse (scr_opponent_card) ou la fiche complète (scr_profile). ==== */
function scr_faith_archives(){
  const f=G.f;
  const back=G._archivesReturn||'faith_hub';
  const all=(f.amaHistory||[]).concat(f.history||[]).slice().reverse();
  const filterId=G._archivesFilterOppId||null;
  const rows=filterId?all.filter(h=>h.oppId===filterId):all;
  const seen=new Set(); const opponents=[];
  all.forEach(h=>{ if(h.oppId && !seen.has(h.oppId)){ seen.add(h.oppId); opponents.push({id:h.oppId,name:h.oppName||'—',flag:h.oppFlag||''}); } });
  const resLetter=r=>r==='win'?'V':r==='loss'?'D':'N';
  const resColor=r=>r==='win'?'var(--win)':r==='loss'?'var(--loss)':'var(--muted)';
  return `<div class="scr">
   <div class="bar" style="border-bottom:2px solid var(--line);margin-bottom:16px;padding-bottom:8px">
     <span class="eyebrow mono">ARCHIVES</span>
     <span class="eyebrow x" onclick="CL.go('${back}')">✕</span>
   </div>
   ${opponents.length?`<div class="pills" style="margin-bottom:12px;flex-wrap:wrap">
     <span class="pill ${!filterId?'on':''}" onclick="CL.setArchivesFilter(null)">Tout</span>
     ${opponents.map(o=>`<span class="pill ${filterId===o.id?'on':''}" onclick="CL.setArchivesFilter('${o.id}')">${o.flag||''} ${esc(o.name)}</span>`).join('')}
   </div>`:''}
   ${rows.length===0?`<div class="mono muted" style="padding:24px 0">Aucun combat archivé.</div>`
   :`<div style="display:flex;border-bottom:1px solid var(--text);padding-bottom:4px;margin-bottom:8px;font-size:10px;color:var(--muted)" class="mono">
     <div style="width:20px">R</div><div style="width:32px">SAIS.</div><div style="flex:1">ADVERSAIRE</div><div style="width:78px;text-align:right">MÉTHODE</div><div style="width:60px;text-align:right">BOURSE</div>
   </div>
   ${rows.map(h=>`<div class="mono" style="display:flex;align-items:center;padding:8px 0;border-bottom:1px dotted var(--line);font-size:12px">
     <div style="width:20px;font-weight:700;color:${resColor(h.res)}">${resLetter(h.res)}</div>
     <div style="width:32px;color:var(--muted)">S${h.season||'—'}</div>
     <div style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${h.oppFlag||''} ${esc(h.oppName||'Adversaire inconnu')} <span style="opacity:.6">(${h.oppRank?'#'+h.oppRank:'—'})</span></div>
     <div style="width:78px;text-align:right;color:var(--muted)">${esc((h.method||'—').split(' ')[0])}${h.round?' R'+h.round:''}</div>
     <div style="width:60px;text-align:right">${h.purse!=null?formatArgent(h.purse):'—'}</div>
   </div>`).join('')}`}
   <button class="btn ghost mt" style="border:none" onclick="CL.go('${back}')">← Retour</button>
  </div>`;
}
/* ==== [FIN ANCRE] ==== */
function scr_faith_year_end(){
  const ys=G.faith.yearStats, f=G.f, F=G.faith;
  /* ==== [ANCRE: V2-32bis] — même motif que faithEnsureOffer/
     faithEnsureIntersaisonDraw/off.pesee : l'article est figé une fois par
     saison, jamais retiré à chaque rendu. Sans ça, faithArchiveYear()
     (nextFaithYear(), ui-08) retirait un second titre après que celui-ci ait
     déjà consommé F.usedHeadlines, archivant dans le Parcours un gros titre
     que le joueur n'avait jamais lu. ==== */
  if(!F.currentArticle || F.currentArticle.year!==F.year) F.currentArticle={year:F.year,art:faithPresseArticle(ys,f,F)};
  const art=F.currentArticle.art;
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
   flancher". Casse le gabarit exactement comme evt_frankenstein_betrayal,
   via la même classe .scr-rupture (index.html) — l'invariant "seuls ces
   écrans cassent le gabarit" est comptable (grep -c 'scr-rupture'), pas
   recopié une quatrième fois sans que personne ne le voie. Le soupçon sur
   l'état du corps (dmgHeadTotal, déjà suivi par ailleurs)
   reste qualitatif — jamais un nombre ni une probabilité : même règle
   que FAITH_RISQUE_DECLARE, aucune espérance de gain affichée. ==== */
function scr_faith_retire(){
  const f=G.f, F=G.faith;
  const dmg=F.dmgHeadTotal||0;
  const risque=dmg>400?'Le corps a beaucoup donné. Une année de trop commence à se voir, sur la durée.'
    :dmg>150?'Les coups laissent des traces. Rien d’alarmant, mais rien qui s’efface tout à fait non plus.'
    :'Le corps encaisse encore bien.';
  return `<div class="scr scr-rupture">
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
