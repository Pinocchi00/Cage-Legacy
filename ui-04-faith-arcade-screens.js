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
const FAITH_DRAFT_PAGES=[
  {key:null,q:'Qui êtes-vous ?'},
  {key:'origin',q:'D’où venez-vous ?'},
  {key:'style',q:'Où avez-vous appris à vous battre ?'},
  {key:'lifestyle',q:'Quel adolescent avez-vous été ?'},
  {key:'circle',q:'Qui vous entoure ?'},
  {key:'personality',q:'Que donnez-vous à voir ?'},
  {key:'stable',q:'Où signez-vous votre premier contrat ?'},
  {key:null,q:'Voilà qui vous êtes.'}
];
const FAITH_DRAFT_OPTIONS={
  origin:[
    ['traditional','Dojo de la discipline','Un maître obsessionnel vous a fait répéter le même jab dix mille fois avant le premier vrai sparring.'],
    ['pro_child','Fils de la maison','Votre nom de famille remplit les salles avant votre premier combat — et pèse une tonne à chaque défaite.'],
    ['street','École du bitume','Les vraies leçons se sont passées dans les parkings, pas sur les tatamis.'],
    ['late_bloomer','Le retardataire','Personne ne pariait un centime sur vous à seize ans. La rage a fait le reste.']],
  style:[
    ['boxer','Boxe','Des mains lourdes, des appuis, et l’art de ne pas être là où le coup arrive.'],
    ['wrestler','Lutte','Décider où le combat se passe. Debout ou au sol, mais c’est vous qui choisissez.'],
    ['bjj','Jiu-jitsu','Laisser venir, encaisser la position, et refermer la prise quand personne ne l’attend.'],
    ['muayThai','Muay-thaï','Le corps à corps, les genoux, les coudes. La distance où les gens renoncent.']],
  lifestyle:[
    ['pro','Moine guerrier','Extinction des feux à 21h, zéro écart, zéro excuse. Les coachs vous adorent, vos amis vous ont oublié.'],
    ['balanced','Ni moine ni fêtard','Sérieux à la salle, tolérable en dehors. La voie du compromis.'],
    ['party','La vie est courte','Les sorties avant les rounds de sac. Le talent compensera — ou pas.']],
  circle:[
    ['family','Le clan','Des parents qui négocient vos contrats en pyjama à la table de la cuisine. Rassurant, un peu étouffant.'],
    ['agent','Le requin','Un agent qui a senti l’argent avant que vous sachiez lacer vos gants. Il prend sa part, toujours.'],
    ['squad','La bande','Vos potes d’enfance, bruyants et loyaux, présents à chaque combat sans jamais comprendre les règles.']],
  personality:[
    ['villain','Le vilain','Chaque conférence de presse est un règlement de comptes. Ça remplit les salles.'],
    ['humble','Le taiseux','Deux phrases par interview, un mental de granit. Les puristes vous respectent, les promoteurs s’arrachent les cheveux.']],
  /* ==== [ANCRE: FAITH_ECURIE_DEPART] — le premier vrai dilemme, absent
     jusqu'ici : temps de jeu contre prestige. Une salle régionale fait
     combattre souvent contre des adversaires abordables ; un camp d'élite
     fait signer plus haut, contre plus dur, avec ce que ça implique. ==== */
  stable:[
    ['regional','Une salle régionale','On vous fera combattre souvent, contre des gens de votre niveau. Vous apprendrez sur le tas, loin des caméras.'],
    ['elite','Un camp d’élite','On ne vous fera pas de cadeau : des partenaires meilleurs que vous, des affiches plus dures, et du monde qui regarde.']]
};
function faithDraftPortrait(d){
  const nom=(d.first||'').trim()||'Un combattant';
  const pays=d.country&&COUNTRIES[d.country]?COUNTRIES[d.country].name:'';
  const org={traditional:'sorti d’un dojo',pro_child:'né dans le métier',street:'sorti du bitume',late_bloomer:'venu tard au sport'}[d.origin]||'';
  const vie={pro:'discipliné',balanced:'équilibré',party:'insouciant'}[d.lifestyle]||'';
  const cer={family:'entouré des siens',agent:'piloté par un agent',squad:'entouré de sa bande'}[d.circle]||'';
  const per={villain:'qui parle fort',humble:'qui parle peu'}[d.personality]||'';
  const ecu={regional:'et qui signe dans une salle régionale',elite:'et qui signe dans un camp d’élite'}[d.stable]||'';
  return [nom+(pays?`, ${pays}`:''),org,vie,cer,per,ecu].filter(Boolean).join(', ')+'.';
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
  } else if(cur.key){
    corps=(FAITH_DRAFT_OPTIONS[cur.key]||[]).map(([val,titre,desc])=>`
      <div class="opp" style="padding:16px;min-height:88px;text-align:left;${d[cur.key]===val?'border-left:3px solid var(--f-red-hi);':''}" onclick="CL.selectFaithDraft('${cur.key}','${val}')">
        <div class="hero-name" style="font-size:17px">${titre}</div>
        <div class="muted" style="font-size:13px;line-height:1.45;margin-top:6px">${desc}</div>
      </div>`).join('');
  } else {
    corps=`<p style="font-size:17px;line-height:1.5">${esc(faithDraftPortrait(d))}</p>`;
  }
  const pret=page===0?true:(cur.key?!!d[cur.key]:true);
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
   Les cinq temps : 1 la salle, 2 le camp, 3 le monde, 4 l'octogone, 5 le
   bilan. Le temps 5 n'a pas d'écran de hub — il vit sur le bilan annuel,
   qui affiche la barre à son dernier segment. ==== */
const FAITH_TEMPS=[
  {n:1,saison:'Hiver',lieu:'La salle'},
  {n:2,saison:'Printemps',lieu:'Le camp'},
  {n:3,saison:'Été',lieu:'Le monde'},
  {n:4,saison:'Automne',lieu:'L’octogone'},
  {n:5,saison:'Bilan',lieu:'La presse'}
];
/** Barre de saison : cinq segments, remplace « ÉTAPE 2 / 3 ».
 * Une progression spatiale se lit sans être décodée, contrairement à une
 * fraction ; et une séquence visiblement incomplète appelle son achèvement.
 * @param {number} step temps courant (1-5) @returns {string} HTML */
function faithSeasonBar(step){
  const cur=FAITH_TEMPS.find(t=>t.n===step)||FAITH_TEMPS[0];
  return `<div style="margin:12px 0 20px">
    <div style="display:flex;gap:6px">${FAITH_TEMPS.map(t=>{
      const passe=t.n<step, actif=t.n===step;
      return `<span style="flex:1;height:3px;background:${passe?'var(--f-red-hi)':actif?'var(--text)':'transparent'};${passe||actif?'':'border-top:1px solid var(--line)'}"></span>`;
    }).join('')}</div>
    <div class="eyebrow" style="font-size:11px;margin-top:8px">${cur.saison} — ${cur.lieu}</div>
  </div>`;
}
function faithGauges(f){
  const g=(lbl,val)=>`<div style="flex:1">
    <span class="stat-lbl" style="margin-bottom:4px;display:flex;justify-content:space-between;font-size:11px"><span>${lbl}</span><b class="mono" style="font-size:11px">${d20(val)}</b></span>
    <div class="gauge2" style="background:var(--line);height:6px;overflow:hidden">
      <span style="display:block;height:100%;width:${clamp(val,0,100)}%;background:var(--text)"></span></div></div>`;
  return `<div style="display:flex;gap:16px">${g('FORME',f.form)}${g('MORAL',f.morale)}</div>`;
}
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
function scr_faith_hub(){
  const f=G.f; const step=G.faith.step||1;
  const topBar=`<div style="display:flex;gap:8px">
    <div class="glass" style="flex:1.2;text-align:center;padding:8px 0;min-height:auto">
      <b style="font-size:16px;font-family:'Oswald'">${formatArgent(f.earnings)}</b></div>
    <div class="glass" style="flex:1;text-align:center;padding:8px 0;min-height:auto">
      <b class="mono" style="font-size:14px;color:var(--text)">OVR ${f.overall}</b></div>
    ${(f.org>0 && f.contract)?`<div class="glass" style="flex:1;text-align:center;padding:8px 0;min-height:auto">
      <b class="mono" style="font-size:14px;color:var(--gold)">${f.contract.fightsLeft} combat${f.contract.fightsLeft>1?'s':''}</b></div>`:''}
  </div>`;
  let actionsHtml='';
  if(step===1 || step===3){
    const quoi=step===1?'Ce qui arrive à la salle':'Ce qui arrive dehors';
    actionsHtml=`<p class="lede small">${quoi}.</p>
    <button class="btn primary" style="width:100%;height:56px;font-size:16px" onclick="CL.faithLifeEvent()">CONTINUER</button>`;
  } else if(step===2){
    /* Trois options, jamais plus : au-delà l'écran redevient un menu. Le
       stage d'entraînement payant a rejoint les offres qui viennent au
       joueur (FAITH_OFFRES_TENTATION), il n'est plus une carte de plus. */
    actionsHtml=`<p class="lede small">Une seule chose à faire de cette intersaison.</p>
    <div style="display:flex;flex-direction:column;gap:10px">
      <div class="opp" style="padding:16px" onclick="CL.faithRest()">
        <b style="font-size:16px">Se reposer</b>
        <div class="muted small mt">Récupérer, souffler, laisser le corps se refaire.</div></div>
      ${(G.faith.gym||[]).slice(0,2).map(p=>`
        <div class="opp" style="padding:16px;border-left:3px solid var(--sage)" onclick="CL.faithSparring('${p.id}')">
          <b style="font-size:16px">Tourner avec ${esc(p.first)}</b>
          <div class="muted small mt">${p.styleLabel}, ${p.age} ans. ${faithProtegeLine(p,f)}</div>
        </div>`).join('')}
    </div>`;
  } else {
    actionsHtml=`<p class="lede small">Tout est en place.</p>
    <button class="btn primary" style="width:100%;height:56px;font-size:16px" onclick="CL.faithFight()">ENTRER DANS LA CAGE</button>`;
  }
  return `<div class="scr" style="max-width:560px;margin:0 auto">
    ${topBar}
    ${faithSeasonBar(step)}
    <div>
      <div class="mono" style="font-size:11px;color:var(--muted)">SAISON ${G.faith.year} · ${orgDisplayName(f)}</div>
      <div class="hero-name" style="font-size:28px;margin-top:4px">${esc(f.name)} ${f.flag}</div>
      ${(f.faithTraits&&f.faithTraits.length)?`<div class="mono" style="font-size:11px;color:var(--gold);margin-top:6px">${f.faithTraits.join(' · ')}</div>`:''}
      ${faithOathBadge(G.faith)}
    </div>
    ${faithGauges(f)}
    ${actionsHtml}
    <button class="btn ghost" onclick="CL.go('profile')">Voir la fiche complète</button>
  </div>`;
}
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
const FAITH_PERK_OFFERS=[
  {id:'evt_offer_hometown',title:'Un promoteur du coin',req:f=>(f.earnings||0)>=15&&f.org>0,
   text:'Il connaît votre nom, votre salle, le nom de votre première victime amateur. Il peut faire venir le prochain combat ici, chez vous. Ça se paie.',
   choices:[{label:'Accepter — combattre à domicile',perk:'hometown'},
            {label:'Refuser, ça ne change rien au travail',d:[['focus',3]],traitTag:'ascetic'}]},
  {id:'evt_offer_catchweight',title:'La pesée arrangée',req:f=>(f.earnings||0)>=35&&f.org>0,
   text:'Votre manager a une idée : négocier un poids intermédiaire. L’adversaire acceptera — et arrivera vidé, à sec, sans jambes.',
   choices:[{label:'Faire signer le catchweight',perk:'catchweight'},
            {label:'Le prendre à son poids',d:[['confidence',4]],traitTag:'ascetic'}]},
  {id:'evt_offer_protect',title:'La ceinture dort',req:f=>(f.earnings||0)>=50&&!!f.champion,
   text:'La fédération s’agace de votre inactivité. Un versement au bon service, et le compteur repart à zéro.',
   choices:[{label:'Payer pour sanctuariser le titre',perk:'protect_title'},
            {label:'Laisser courir',d:[['composure',3]]}]},
  {id:'evt_offer_ped',title:'Un homme vous attend sur le parking',req:f=>(f.earnings||0)>=30,
   text:'Il ne se présente pas. Il parle de récupération, de cellule hyperbare, de « protocoles » que tout le monde utilise et que personne ne nomme. Il laisse une carte.',
   choices:[{label:'Écouter ce qu’il propose',perk:'ped',tone:'gamble'},
            {label:'Jeter la carte',d:[['discipline',5],['morale',-3]],traitTag:'ascetic'}]},
  {id:'evt_offer_tiger',title:'Une place s’est libérée',req:f=>(f.earnings||0)>=50,
   text:'Un camp thaïlandais réputé pour casser les hommes autant que les former a une place. Six semaines. On y entre entier, rarement.',
   choices:[{label:'Partir six semaines',perk:'tiger',tone:'gamble'},
            {label:'Rester à la salle',d:[['form',5]]}]},
  {id:'evt_offer_lobbying',title:'Le dîner qui compte',req:f=>(f.earnings||0)>=100,
   text:'Une table, trois costumes, personne ne parle de sport. On vous fait comprendre qu’une promotion se décide ici, pas dans la cage.',
   choices:[{label:'Payer l’addition',perk:'lobbying',tone:'gamble'},
            {label:'Partir avant le dessert',d:[['confidence',3],['morale',3]],traitTag:'rebel'}]},
  {id:'evt_offer_judges',title:'Une enveloppe, pas une question',req:f=>(f.earnings||0)>=40&&f.org>0,
   text:'On vous explique, sans jamais le dire, que les cartes des juges sont parfois écrites avant le premier round. Un cinquième de votre bourse suffirait.',
   choices:[{label:'Faire glisser l’enveloppe',perk:'judges',tone:'gamble'},
            {label:'Refuser net',d:[['heart',5],['discipline',3]],traitTag:'ascetic'}]},
  {id:'evt_offer_diet',title:'La nutritionniste',req:f=>(f.earnings||0)>=40,
   text:'Elle a fait descendre trois champions sans les vider. Elle prend cher, à l’année, et ne travaille qu’avec des gens sérieux.',
   choices:[{label:'L’engager pour la saison',perk:'diet'},
            {label:'Continuer à la sueur et au sauna',d:[['durability',2],['form',-4]]}]}
];
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: FAITH_BRANCHES_CREATION] — les choix de création ne filtraient
   aucun événement : origine, cercle et hygiène de vie n'étaient que des
   deltas déguisés. Ces entrées se branchent sur f._origin / f._circle /
   f._lifestyle / f._stable, désormais conservés (finalizeFaithDraft, ui-08),
   via le champ `req` que le pool supportait déjà — aucune modification du
   moteur d'événements n'a été nécessaire. Chaque choix de création ouvre au
   moins deux situations que les autres ne verront jamais. ==== */
const FAITH_BRANCH_EVENTS=[
  {id:'evt_br_street_parking',req:f=>f._origin==='street',title:'Retour au parking',
   text:'Le terrain vague où vous vous battiez à seize ans est devenu un chantier. Un ancien vous reconnaît et vous propose « une dernière, pour la route ».',
   choices:[{label:'Remettre les mains dedans, une fois',d:[['aggression',6],['heart',4],['discipline',-8]],risk:0.35,bad:[['form',-18],['discipline',-12],['morale',-8]],traitTag:'rebel'},
            {label:'Serrer la main et repartir',d:[['composure',6],['focus',3]],traitTag:'ascetic'}]},
  {id:'evt_br_street_family',req:f=>f._origin==='street',title:'Le petit frère du quartier',
   text:'Un gamin de la cité traîne devant la salle tous les soirs. Il ne demande rien, il regarde.',
   choices:[{label:'Lui ouvrir la porte',d:[['morale',8],['discipline',4],['form',-5]]},
            {label:'Le renvoyer chez lui',d:[['focus',5],['morale',-6]]}]},
  {id:'evt_br_dojo_master',req:f=>f._origin==='traditional',title:'Le maître est malade',
   text:'Celui qui vous a fait répéter le même jab dix mille fois ne se lève plus. Il demande à vous voir avant votre prochain camp.',
   choices:[{label:'Tout arrêter et partir le voir',d:[['fightIQ',6],['composure',6],['form',-10]],traitTag:'ascetic'},
            {label:'Envoyer un message, rester au camp',d:[['discipline',4],['morale',-10]]}]},
  {id:'evt_br_dojo_kata',req:f=>f._origin==='traditional',title:'Le retour aux formes',
   text:'Votre coach actuel trouve vos routines d’échauffement « folkloriques ». Elles viennent du dojo, et vous n’avez jamais su vous en passer.',
   choices:[{label:'Les garder, quoi qu’on en dise',d:[['discipline',6],['focus',4],['adaptability',-4]]},
            {label:'Passer à la méthode moderne',d:[['adaptability',6],['cardio',3],['composure',-3]]}]},
  {id:'evt_br_prochild_name',req:f=>f._origin==='pro_child',title:'Le nom sur l’affiche',
   text:'L’affiche du prochain gala met votre nom de famille en plus gros que votre prénom. Votre père n’a jamais combattu dans cette salle, et pourtant c’est lui qu’on vient voir.',
   choices:[{label:'Exiger que l’affiche change',d:[['confidence',7],['morale',5],['discipline',-4]],traitTag:'rebel'},
            {label:'Laisser courir et gagner',d:[['focus',6],['morale',-6]]}]},
  {id:'evt_br_late_doubt',req:f=>f._origin==='late_bloomer',title:'Le temps perdu',
   text:'Un journaliste vous rappelle en direct que les combattants de votre niveau ont commencé dix ans avant vous.',
   choices:[{label:'Le prendre comme un carburant',d:[['aggression',7],['heart',5],['composure',-5]]},
            {label:'Reconnaître le retard, et travailler',d:[['discipline',7],['fightIQ',4],['morale',-4]],traitTag:'ascetic'}]},
  {id:'evt_br_agent_cut',req:f=>f._circle==='agent',title:'La clause en petits caractères',
   text:'Votre agent a fait passer un avenant. Le pourcentage a bougé, discrètement, en sa faveur.',
   choices:[{label:'Le confronter, quitte à tout casser',d:[['confidence',6],['morale',-8]],risk:0.30,bad:[['morale',-16],['focus',-8]],traitTag:'rebel'},
            {label:'Signer et continuer à combattre',d:[['composure',5],['focus',4]]}]},
  {id:'evt_br_family_dinner',req:f=>f._circle==='family',title:'Le repas de famille',
   text:'Toute la table a un avis sur votre prochain adversaire. Personne autour n’a jamais mis un gant.',
   choices:[{label:'Écouter jusqu’au bout',d:[['morale',8],['composure',4],['focus',-5]]},
            {label:'Quitter la table',d:[['focus',7],['morale',-8]]}]},
  {id:'evt_br_squad_night',req:f=>f._circle==='squad',title:'La bande débarque',
   text:'Vos potes ont réservé une soirée pour « fêter le camp ». Le camp commence dans neuf heures.',
   choices:[{label:'Y aller une heure, pas plus',d:[['morale',7],['form',-8]],risk:0.35,bad:[['form',-20],['discipline',-10],['morale',-5]]},
            {label:'Annuler et dormir',d:[['discipline',6],['form',6],['morale',-6]],traitTag:'ascetic'}]},
  {id:'evt_br_party_relapse',req:f=>f._lifestyle==='party',title:'La vieille habitude',
   text:'Trois semaines de camp irréprochable. Ce soir, la tentation est exactement la même qu’à dix-sept ans.',
   choices:[{label:'Céder une dernière fois',d:[['morale',10],['form',-12]],risk:0.40,bad:[['form',-26],['discipline',-12],['morale',-10]]},
            {label:'Tenir',d:[['discipline',8],['confidence',4]],traitTag:'ascetic'}]},
  {id:'evt_br_pro_burnout',req:f=>f._lifestyle==='pro',title:'La machine bien huilée',
   text:'Rien à redire : sommeil, nutrition, séances. C’est justement ce que votre préparateur trouve inquiétant — vous ne vivez plus rien d’autre.',
   choices:[{label:'Continuer, la rigueur paie',d:[['discipline',6],['cardio',4],['morale',-8]],traitTag:'ascetic'},
            {label:'S’autoriser une vraie coupure',d:[['morale',12],['form',8],['discipline',-6]]}]},
  {id:'evt_br_regional_loyalty',req:f=>f._stable==='regional',title:'L’offre du gros camp',
   text:'Une structure réputée vous propose une place. Votre salle régionale vous a tout donné, et n’a pas les moyens de s’aligner.',
   choices:[{label:'Partir pour le camp d’élite',d:[['fightIQ',6],['adaptability',5],['morale',-10]],oathBreak:'homegrown'},
            {label:'Rester là où on vous a formé',d:[['morale',10],['heart',5],['fightIQ',-3]]}]},
  {id:'evt_br_elite_pecking',req:f=>f._stable==='elite',title:'La hiérarchie du camp',
   text:'Dans cette salle, vous n’êtes ni le plus fort ni le mieux payé. On vous le fait sentir à chaque round de sparring.',
   choices:[{label:'Serrer les dents et encaisser',d:[['durability',5],['heart',6],['form',-12]],risk:0.30,bad:[['form',-24],['morale',-12]]},
            {label:'Changer de partenaires d’entraînement',d:[['composure',5],['adaptability',4],['morale',-4]]}]}
,
  {id:'evt_br_dojo_belt',req:f=>f._origin==='traditional',title:'La ceinture du dojo',
   text:'On vous propose de venir remettre les ceintures aux enfants du club. Le même tatami, la même odeur, vingt ans plus tard.',
   choices:[{label:'Y passer la journée',d:[['morale',9],['composure',4],['form',-6]]},
            {label:'Décliner, le camp d’abord',d:[['focus',6],['morale',-5]],traitTag:'ascetic'}]},
  {id:'evt_br_prochild_shadow',req:f=>f._origin==='pro_child',title:'L’ombre du père',
   text:'Un ancien adversaire de votre père vous arrête dans un couloir : « Tu frappes moins fort que lui, mais tu réfléchis mieux. »',
   choices:[{label:'Prendre ça pour un compliment',d:[['fightIQ',6],['confidence',4]]},
            {label:'Le prendre très mal',d:[['aggression',8],['composure',-6]],traitTag:'rebel'}]},
  {id:'evt_br_prochild_money',req:f=>f._origin==='pro_child',title:'L’héritage encombrant',
   text:'La salle familiale coule. On vous demande de remettre de l’argent, discrètement, pour éviter la fermeture.',
   choices:[{label:'Payer sans faire de bruit',cost:25,d:[['morale',8],['discipline',3]]},
            {label:'Refuser, ce n’est plus votre histoire',d:[['focus',6],['morale',-10]],traitTag:'rebel'}]},
  {id:'evt_br_street_cops',req:f=>f._origin==='street',title:'Le contrôle',
   text:'Trois heures au commissariat pour une histoire qui ne vous concerne pas, la veille d’une séance décisive.',
   choices:[{label:'Encaisser sans rien dire',d:[['composure',7],['form',-8]],traitTag:'ascetic'},
            {label:'Hausser le ton',d:[['aggression',6],['morale',-8]],risk:0.35,bad:[['morale',-16],['discipline',-10],['form',-10]],traitTag:'rebel'}]},
  {id:'evt_br_late_body',req:f=>f._origin==='late_bloomer',title:'Un corps de trente ans',
   text:'Le kiné est formel : vos articulations ont commencé le sport dix ans trop tard, et elles vous le rappellent chaque matin.',
   choices:[{label:'Adapter tout le programme',d:[['recovery',7],['durability',4],['explosiveness',-4]]},
            {label:'Ignorer et charger la mule',d:[['power',6],['heart',4]],risk:0.40,bad:[['durability',-10],['form',-20]]}]},
  {id:'evt_br_late_proof',req:f=>f._origin==='late_bloomer',title:'La preuve par les faits',
   text:'Un podcast vous présente comme « l’exception qui confirme la règle ». Vos coachs détestent la formule.',
   choices:[{label:'La reprendre à votre compte',d:[['confidence',7],['morale',6]],traitTag:'showman'},
            {label:'Refuser l’étiquette',d:[['focus',6],['discipline',4]],traitTag:'ascetic'}]},
  {id:'evt_br_family_pressure',req:f=>f._circle==='family',title:'La peur des siens',
   text:'Votre mère a vu le dernier combat en entier. Elle ne veut plus jamais le revoir, et le dit à table.',
   choices:[{label:'Promettre d’arrêter les guerres',d:[['composure',6],['morale',6],['aggression',-6]]},
            {label:'Expliquer que c’est le métier',d:[['confidence',5],['morale',-6]]}]},
  {id:'evt_br_family_manager',req:f=>f._circle==='family',title:'Le contrat sur la table de la cuisine',
   text:'Votre oncle a « négocié » votre prochaine bourse. Le promoteur a souri poliment pendant tout l’appel.',
   choices:[{label:'Laisser la famille gérer',d:[['morale',7]],risk:0.35,bad:[['morale',-10]]},
            {label:'Reprendre la main soi-même',d:[['fightIQ',5],['discipline',4],['morale',-6]]}]},
  {id:'evt_br_agent_media',req:f=>f._circle==='agent',title:'Le plan média',
   text:'Votre agent a bloqué trois jours de tournage promotionnel en plein pic de charge. « C’est ça ou tu restes invisible. »',
   choices:[{label:'Faire le tournage',d:[['confidence',5],['form',-10]],traitTag:'showman'},
            {label:'Tout annuler et s’entraîner',d:[['form',8],['discipline',5],['morale',-6]],traitTag:'ascetic'}]},
  {id:'evt_br_agent_rival',req:f=>f._circle==='agent',title:'Le poulain d’à côté',
   text:'Vous découvrez que votre agent gère aussi un combattant de votre division, plus jeune, mieux placé.',
   choices:[{label:'Exiger l’exclusivité',d:[['confidence',6],['morale',-6]],risk:0.30,bad:[['morale',-14],['focus',-8]],traitTag:'rebel'},
            {label:'S’en servir comme motivation',d:[['aggression',5],['focus',5]]}]},
  {id:'evt_br_squad_loyalty',req:f=>f._circle==='squad',title:'Un des vôtres dérape',
   text:'Un ami d’enfance s’est battu dans un bar en se réclamant de vous. La vidéo circule.',
   choices:[{label:'Le défendre publiquement',d:[['morale',6],['composure',-8]],risk:0.35,bad:[['morale',-14],['focus',-10]],traitTag:'rebel'},
            {label:'Prendre ses distances',d:[['focus',6],['morale',-8]],traitTag:'ascetic'}]},
  {id:'evt_br_squad_ride',req:f=>f._circle==='squad',title:'Le convoi',
   text:'Toute la bande veut vous accompagner au gala, à six heures de route. Personne n’a de billet.',
   choices:[{label:'Les emmener quand même',cost:8,d:[['morale',10],['focus',-5]]},
            {label:'Partir seul avec le staff',d:[['focus',7],['morale',-7]]}]},
  {id:'evt_br_pro_science',req:f=>f._lifestyle==='pro',title:'Le laboratoire',
   text:'Une équipe universitaire veut faire de vous un cas d’étude : capteurs, prises de sang, sommeil surveillé.',
   choices:[{label:'Se prêter au protocole',d:[['cardio',5],['recovery',5],['morale',-5]]},
            {label:'Refuser d’être un sujet',d:[['composure',5],['confidence',4]],traitTag:'rebel'}]},
  {id:'evt_br_pro_isolation',req:f=>f._lifestyle==='pro',title:'La chambre d’hôtel',
   text:'Quatrième camp de l’année loin de chez vous. Tout est optimal, et personne ne vous attend le soir.',
   choices:[{label:'Tenir le protocole jusqu’au bout',d:[['discipline',7],['morale',-10]],traitTag:'ascetic'},
            {label:'Rentrer une semaine',d:[['morale',12],['form',-8]]}]},
  {id:'evt_br_balanced_choice',req:f=>f._lifestyle==='balanced',title:'Le milieu du gué',
   text:'Votre préparateur pose le constat : ni assez rigoureux pour les protocoles de pointe, ni assez relâché pour tenir sur la durée.',
   choices:[{label:'Basculer vers la rigueur totale',d:[['discipline',8],['cardio',4],['morale',-8]],traitTag:'ascetic'},
            {label:'Assumer l’équilibre',d:[['morale',8],['composure',5],['discipline',-3]]}]},
  {id:'evt_br_balanced_job',req:f=>f._lifestyle==='balanced',title:'Le travail à côté',
   text:'Le poste à mi-temps que vous gardez « au cas où » tombe en plein camp. Il faut choisir cette semaine.',
   choices:[{label:'Démissionner et tout miser',d:[['focus',7],['confidence',5]],risk:0.35,bad:[['morale',-14],['form',-10]]},
            {label:'Garder la sécurité',d:[['composure',6],['morale',4],['focus',-4]]}]},
  {id:'evt_br_balanced_friends',req:f=>f._lifestyle==='balanced',title:'Les deux vies',
   text:'Un mariage le samedi, une pesée le dimanche. Les deux comptent, et vous ne pouvez pas être entier aux deux.',
   choices:[{label:'Y aller, partir tôt',d:[['morale',7],['form',-6]]},
            {label:'S’excuser et rester au camp',d:[['discipline',6],['morale',-7]],traitTag:'ascetic'}]},
  {id:'evt_br_party_image',req:f=>f._lifestyle==='party',title:'La photo de trop',
   text:'Une story de 3h du matin circule, trois jours avant la pesée. Votre coach l’a vue avant vous.',
   choices:[{label:'En rire publiquement',d:[['confidence',6],['morale',5],['discipline',-8]],traitTag:'showman'},
            {label:'Fermer les comptes une saison',d:[['focus',8],['discipline',6],['morale',-8]],traitTag:'ascetic'}]},
  {id:'evt_br_regional_crowd',req:f=>f._stable==='regional',title:'La salle des fêtes',
   text:'Six cents personnes, un ring monté le matin même, et la moitié du public qui connaît votre prénom.',
   choices:[{label:'Leur donner le spectacle',d:[['confidence',6],['morale',8],['form',-6]],traitTag:'showman'},
            {label:'Faire le travail proprement',d:[['focus',6],['fightIQ',4]],traitTag:'ascetic'}]},
  {id:'evt_br_regional_coach',req:f=>f._stable==='regional',title:'Le coach qui plafonne',
   text:'Celui qui vous entraîne depuis le début n’a jamais mené personne au-delà du niveau régional. Il le sait.',
   choices:[{label:'Rester fidèle',d:[['morale',9],['heart',4],['fightIQ',-3]]},
            {label:'Chercher un préparateur au-dessus',d:[['fightIQ',7],['adaptability',4],['morale',-9]],oathBreak:'homegrown'}]},
  {id:'evt_br_elite_camera',req:f=>f._stable==='elite',title:'Les caméras dans la salle',
   text:'Le camp tourne un documentaire. Vos séances les plus dures seront diffusées, ratages compris.',
   choices:[{label:'Jouer le jeu',d:[['confidence',5],['morale',4],['focus',-5]],traitTag:'showman'},
            {label:'Exiger d’être coupé au montage',d:[['focus',6],['composure',4],['morale',-4]]}]},
  {id:'evt_br_elite_bench',req:f=>f._stable==='elite',title:'Le second couteau',
   text:'Le camp prépare une tête d’affiche pour un titre mondial. Vous êtes officiellement son partenaire d’entraînement.',
   choices:[{label:'Servir de sparring et tout apprendre',d:[['fightIQ',7],['adaptability',5],['form',-10]]},
            {label:'Refuser de tenir la lampe',d:[['confidence',6],['aggression',5],['morale',-6]],traitTag:'rebel'}]},
  {id:'evt_br_party_crash',req:f=>f._lifestyle==='party',title:'Le réveil difficile',
   text:'Séance de 7h. Vous y êtes, debout, mais votre corps est resté quelque part entre hier soir et ce matin.',
   choices:[{label:'Faire la séance quand même',d:[['heart',5],['form',-10]],risk:0.40,bad:[['form',-22],['durability',-6]]},
            {label:'Rentrer dormir et assumer',d:[['form',6],['discipline',-6],['morale',4]]}]},
  {id:'evt_br_party_manager',req:f=>f._lifestyle==='party',title:'L’ultimatum du staff',
   text:'Le coach pose les choses simplement : soit vous levez le pied cette saison, soit il passe la main à quelqu’un d’autre.',
   choices:[{label:'Promettre et tenir',d:[['discipline',9],['form',6],['morale',-6]],traitTag:'ascetic'},
            {label:'Changer de coach',d:[['confidence',6],['morale',5],['fightIQ',-4]],traitTag:'rebel'}]},
  {id:'evt_br_dojo_lineage',req:f=>f._origin==='traditional',title:'La lignée',
   text:'On vous demande de porter le nom du dojo sur votre short. C’est un honneur, et une dette.',
   choices:[{label:'Le porter fièrement',d:[['discipline',6],['morale',6],['confidence',-3]]},
            {label:'Combattre sous son propre nom',d:[['confidence',7],['morale',-6]],traitTag:'rebel'}]},
  {id:'evt_br_prochild_press',req:f=>f._origin==='pro_child',title:'La question qui revient',
   text:'Quinzième interview de l’année, quinzième question sur votre père.',
   choices:[{label:'Couper court sèchement',d:[['aggression',6],['composure',-5]],traitTag:'rebel'},
            {label:'Répondre patiemment, encore',d:[['composure',7],['focus',3]],traitTag:'ascetic'}]},
  {id:'evt_br_street_debt',req:f=>f._origin==='street',title:'Une vieille dette',
   text:'Quelqu’un du quartier vous rappelle un service rendu il y a dix ans. Il ne demande pas d’argent.',
   choices:[{label:'Rendre le service',d:[['morale',6],['focus',-6]],risk:0.35,bad:[['morale',-14],['discipline',-10]]},
            {label:'Dire que c’est une autre vie',d:[['focus',7],['morale',-7]]}]},
  {id:'evt_br_late_mentor',req:f=>f._origin==='late_bloomer',title:'Le vétéran',
   text:'Un combattant en fin de carrière vous prend à part : « Tu as moins de temps que les autres. Ne le gaspille pas en technique inutile. »',
   choices:[{label:'Se spécialiser à outrance',d:[['power',6],['killer',5],['adaptability',-5]]},
            {label:'Continuer à tout apprendre',d:[['fightIQ',6],['adaptability',6],['power',-3]]}]},
  {id:'evt_br_family_child',req:f=>f._circle==='family',title:'Un nouveau venu',
   text:'La famille s’agrandit. Les nuits raccourcissent, et le regard sur le métier change.',
   choices:[{label:'Redoubler d’ambition',d:[['heart',7],['focus',5],['form',-8]]},
            {label:'Lever le pied cette saison',d:[['morale',10],['form',6],['aggression',-6]]}]},
  {id:'evt_br_agent_offer',req:f=>f._circle==='agent',title:'Le transfert',
   text:'Une écurie concurrente propose à votre agent de vous racheter. Il vous en parle après avoir dit oui.',
   choices:[{label:'Accepter le mouvement',d:[['adaptability',6],['fightIQ',4],['morale',-6]]},
            {label:'Bloquer le transfert',d:[['confidence',7],['morale',-8]],traitTag:'rebel'}]},
  {id:'evt_br_squad_business',req:f=>f._circle==='squad',title:'Le projet des potes',
   text:'La bande veut monter une marque de vêtements à votre nom. Personne dans le groupe n’a jamais géré une entreprise.',
   choices:[{label:'Investir dedans',cost:20,d:[['morale',9]],risk:0.45,bad:[['morale',-12],['focus',-8]],traitTag:'showman'},
            {label:'Refuser poliment',d:[['focus',6],['morale',-5]]}]},
  {id:'evt_br_pro_plateau',req:f=>f._lifestyle==='pro',title:'Le plateau',
   text:'Tout est parfait sur le papier, et pourtant plus rien ne progresse depuis six mois.',
   choices:[{label:'Tout casser et repartir de zéro',d:[['adaptability',8],['form',-12]],risk:0.35,bad:[['form',-22],['confidence',-8]]},
            {label:'Faire confiance au protocole',d:[['discipline',6],['composure',4]],traitTag:'ascetic'}]},
  {id:'evt_br_balanced_doubt',req:f=>f._lifestyle==='balanced',title:'La question du soir',
   text:'Un soir de fatigue, la question tombe toute seule : est-ce que vous voulez vraiment de cette vie-là ?',
   choices:[{label:'Répondre oui, et s’y remettre',d:[['heart',7],['focus',5]]},
            {label:'Ne pas répondre',d:[['composure',5],['morale',-5]]}]},
  {id:'evt_br_regional_ceiling',req:f=>f._stable==='regional',title:'Le plafond régional',
   text:'Vous avez battu tout le monde dans un rayon de trois cents kilomètres. Il n’y a plus personne à affronter ici.',
   choices:[{label:'Aller chercher plus loin',d:[['confidence',6],['adaptability',5],['morale',-5]]},
            {label:'Régner sur son territoire',d:[['morale',9],['confidence',4],['fightIQ',-3]]}]},
  {id:'evt_br_elite_cut',req:f=>f._stable==='elite',title:'La coupe du camp',
   text:'Le camp réduit son effectif. Deux places sautent, et la vôtre n’est pas garantie.',
   choices:[{label:'Se battre pour rester',d:[['focus',7],['aggression',5],['form',-8]]},
            {label:'Partir avant qu’on vous pousse',d:[['confidence',5],['composure',5],['morale',-6]]}]}];
/* ==== [FIN ANCRE] ==== */
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
    choices:[{label:'Accepter la guerre',d:[['chin',3],['durability',3],['form',-18],['morale',5]],risk:0.35,bad:[['form',-32],['durability',-4],['morale',-10]]},
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
             {label:'Refuser de reculer (risque de KO accru)',d:[['heart',8],['durability',-5],['composure',-5]],traitTag:'rebel',risk:0.4,bad:[['chin',-6],['durability',-9],['morale',-12]]}]},
  {id:'evt_bjj_nerd',req:f=>f.style==='bjj'||f.attrs.submission>80,title:'Obsession articulaire',text:'Vous avez passé les 72 dernières heures à visionner des tutoriels de clés de cheville lituaniennes. Vous voyez des angles de soumission même quand vous pliez votre linge.',
    choices:[{label:'Intégrer ce savoir au gameplan',d:[['submission',6],['fightIQ',4],['cardio',-5]]},
             {label:'Forcer l\u2019application en sparring (risque de blesser un ami)',d:[['killer',8],['submission',2],['morale',-12]]}]},
  {id:'evt_podcast_disaster',req:null,title:'Le micro ouvert',text:'Vous êtes invité dans un podcast populaire de 4 heures. Vers la 3ème heure, fatigué, vous lâchez une théorie du complot absurde sur la forme de la Terre.',
    choices:[{label:'Assumer et embrasser le rôle de vilain',d:[['composure',-8],['aggression',6],['morale',15]],traitTag:'showman',risk:0.35,bad:[['composure',-14],['morale',-14],['focus',-8]]},
             {label:'Engager une agence de gestion de crise (10k$)',cost:10,d:[['discipline',5],['focus',5],['morale',-10]]}]},
  {id:'evt_reality_tv',req:null,title:'Romance cathodique',text:'Vous commencez à fréquenter une star de télé-réalité. Les paparazzis campent devant votre salle d\u2019entraînement, brisant la concentration de tout le camp.',
    choices:[{label:'Mettre fin à la relation pour le sport',d:[['focus',10],['discipline',8],['morale',-20]],traitTag:'ascetic'},
             {label:'Gérer les caméras et la relation',d:[['composure',-10],['form',-15],['morale',15]],traitTag:'showman'}]},
  {id:'evt_bar_fight',req:null,title:'Désamorcer la bombe',text:'Dans un bar, un type éméché qui a fait deux mois de Krav Maga en 2014 décide que vous êtes l\u2019adversaire idéal pour prouver sa virilité à ses amis.',
    choices:[{label:'Lui payer un verre et quitter les lieux',d:[['composure',8],['fightIQ',4],['aggression',-5]]},
             {label:'Le balayer sèchement pour l\u2019exemple',d:[['aggression',8],['discipline',-15],['focus',-5]],risk:0.3,bad:[['discipline',-22],['composure',-10],['morale',-12]]}]},
  {id:'evt_guru_supplement',req:null,title:'La poudre magique',text:'Un préparateur physique douteux vous propose un complément alimentaire non-étiqueté qui "révolutionnera votre testostérone" mais sent fortement l\u2019ammoniaque.',
    choices:[{label:'Refuser et s\u2019en tenir au poulet-brocolis',d:[['discipline',6],['durability',3],['recovery',-4]]},
             {label:'Tester le produit (risque absolu)',d:[['explosiveness',8],['power',5],['cardio',-15],['form',-10]],risk:0.45,bad:[['cardio',-22],['form',-20],['discipline',-6]]}]},
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
    choices:[{label:'S\u2019y donner à fond',d:[['cardio',6],['heart',3],['form',-15]],risk:0.3,bad:[['form',-28],['recovery',-6]]},
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
             {label:'Reprendre comme si de rien n\u2019était',d:[['confidence',4],['durability',-3],['form',-4]],risk:0.35,bad:[['durability',-9],['form',-22],['recovery',-5]]}]},
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
             {label:'Emprunter un peu de cette approche',d:[['adaptability',5],['fightIQ',2],['confidence',-2]],risk:0.35,bad:[['confidence',-10],['focus',-8],['discipline',-5]]}]},
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
             {label:'Serrer les dents et continuer pareil',d:[['heart',5],['durability',-4],['form',-6]],risk:0.4,bad:[['durability',-9],['form',-20],['cardio',-6]]}]},
  // --- Lot 2 (Gemini, vérifié) ---
  {id:'evt_ice_bath_extreme',title:'Bain de glace prolongé',text:'Votre préparateur vous met au défi de rester cinq minutes de plus dans l\u2019eau à 2°C pour tester vos limites mentales.',
    choices:[{label:'Serrer les dents et rester',d:[['recovery',5],['heart',4],['form',-8]],risk:0.3,bad:[['form',-18],['recovery',-5],['morale',-8]]},
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
             {label:'Pousser la machine jusqu\u2019à la rupture',d:[['heart',8],['cardio',4],['form',-25]],risk:0.45,bad:[['form',-38],['recovery',-8],['morale',-12]]}]},
  {id:'evt_forgotten_belt',req:f=>!!f.champion,title:'Ceinture oubliée',text:'Vous avez oublié votre ceinture de champion dans le coffre d\u2019un VTC après une soirée de célébration. Le chauffeur exige une récompense pour la rendre.',
    choices:[{label:'Payer la rançon discrètement (5k$)',cost:5,d:[['focus',5],['discipline',3],['morale',-5]]},
             {label:'Le menacer publiquement sur les réseaux',d:[['aggression',6],['confidence',4],['composure',-10]]}]},
  {id:'evt_lumpinee_trip',req:f=>f.style==='muayThai',title:'Pèlerinage au Lumpinee',text:'L\u2019appel de la Thaïlande se fait sentir. Partir s\u2019entraîner à la dure, dans la chaleur étouffante de Bangkok, pourrait raviver votre instinct animal.',
    choices:[{label:'Financer le voyage martial (15k$)',cost:15,d:[['clinchStr',6],['kick',5],['durability',4],['form',-12]]},
             {label:'Rester s\u2019entraîner dans son confort habituel',d:[['discipline',4],['morale',-6]]}]},
  {id:'evt_hot_yoga',title:'Yoga infernal',text:'Un coéquipier vous traîne dans un cours de yoga Bikram à 40°C. Vos muscles raides d\u2019artiste martial crient à l\u2019agonie dès les premières postures.',
    choices:[{label:'Souffrir en silence jusqu\u2019à la fin de la séance',d:[['flexibility',8],['recovery',4],['power',-4]],risk:0.25,bad:[['form',-14],['power',-6]]},
             {label:'Quitter la salle en plein milieu, trempé de sueur',d:[['power',3],['flexibility',-5],['morale',-2]]}]},
  {id:'evt_twitter_beef',title:'Guerre des claviers',text:'Un combattant que vous n\u2019avez même pas provoqué lance une attaque cinglante sur votre style de combat en ligne. Vos notifications explosent.',
    choices:[{label:'Rentrer dans le clash virtuel et faire le buzz',d:[['aggression',6],['confidence',5],['focus',-10]],risk:0.35,bad:[['focus',-20],['composure',-9],['morale',-12]]},
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
function formatRiskBadge(c){
  if(!c.risk) return `<span class="tag2" style="border-color:var(--line);color:var(--muted)">Sûr</span>`;
  return `<span class="tag2" style="border-color:var(--f-red-hi);color:var(--gold)">${Math.round(c.risk*100)}% de rater</span>`;
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
  if(ev.id==='evt_frankenstein_betrayal'){
    return `<div class="scr" style="max-width:560px;margin:0 auto;min-height:90vh;display:flex;flex-direction:column;justify-content:center;background:var(--panel2)">
     <div class="eyebrow" style="color:var(--gold)">Ce que vous avez construit</div>
     <h2 class="hero-name" style="font-size:34px;line-height:1.06">${esc(ev.title)}</h2>
     <p style="font-size:15px;line-height:1.55">${esc(ev.text)}</p>
     <div style="display:flex;flex-direction:column;gap:10px">
       ${ev.choices.map((c,i)=>`<div class="opp" style="padding:16px;min-height:72px;text-align:left" onclick="CL.chooseFaithEvent(${i})">
         <b style="font-size:15px">${esc(c.label)}</b>
         <div class="tagrow" style="margin-top:10px">${formatEventDelta(c.d)}</div>
       </div>`).join('')}
     </div>
    </div>`;
  }
  /* ==== [FIN ANCRE] ==== */
  return `<div class="scr" style="max-width:560px;margin:0 auto">
   <div class="eyebrow">${(G.faith.step||1)>=3?'Le monde':'La salle'}</div>
   <h2 class="hero-name" style="font-size:28px;line-height:1.1">${esc(ev.title)}</h2>
   <p class="lede small">${esc(ev.text)}</p>
   <div style="display:flex;flex-direction:column;gap:10px">
     ${ev.choices.map((c,i)=>{
       const locked=c.cost&&(f.earnings||0)<c.cost;
       /* Un choix risqué porte UN seul marqueur — un filet à gauche. Trois
          signaux redondants annuleraient le gain de lisibilité. */
       const risque=!!c.risk;
       return `<div class="glass${locked?'':' opp'}" style="padding:16px;min-height:72px;text-align:left;${risque?'border-left:3px solid var(--f-red-hi);':''}opacity:${locked?0.4:1};cursor:${locked?'not-allowed':'pointer'}" ${locked?'':`onclick="CL.chooseFaithEvent(${i})"`}>
         <b style="font-size:15px">${esc(c.label)}</b>${c.cost?`<span class="muted small" style="color:var(--loss)"> (-${c.cost}k$)</span>`:''}${c.reward?`<span class="small" style="color:var(--win)"> (+${c.reward}k$)</span>`:''}
         <div class="tagrow" style="margin-top:10px">${formatRiskBadge(c)}${formatEventDelta(c.d)}</div>
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
const FAITH_OATHS=[
  {id:'no_shortcut',label:'Jamais de raccourci',
   texte:'Je ne prendrai jamais de raccourci : ni produit, ni juge acheté, ni pesée arrangée.',
   rappel:'Aucun privilège illégal de toute la carrière.'},
  {id:'old_lion',label:'Le vieux lion',
   texte:'Je serai encore champion quand on me dira que je suis trop vieux.',
   rappel:'Décrocher une ceinture à 34 ans ou plus.'},
  {id:'undefeated',label:'Invaincu jusqu’au titre',
   texte:'Je porterai la ceinture sans avoir jamais connu la défaite.',
   rappel:'Être champion en n’ayant jamais perdu.'},
  {id:'blood_master',label:'Le sang du maître',
   texte:'Celui que j’aurai formé tombera devant moi.',
   rappel:'Battre son propre protégé devenu rival.'},
  {id:'long_road',label:'La route longue',
   texte:'Je combattrai jusqu’à ce que mon corps me le refuse.',
   rappel:'Aller jusqu’à 38 ans sans raccrocher.'},
  {id:'homegrown',label:'Fidèle à la salle',
   texte:'Je ne quitterai jamais ceux qui m’ont appris à me battre.',
   rappel:'Ne jamais accepter l’offre d’une autre écurie.'}
];
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
function computeLegendScore(f){
  const F=(typeof G!=='undefined'&&G&&G.faith)||{};
  /* Les règnes du joueur seulement : G.titleHistory enregistre TOUS les
     champions du monde simulé, pas uniquement le sien. */
  const titles=((typeof G!=='undefined'&&G&&G.titleHistory)||[]).filter(r=>r.champion===f.name).length;
  const palmares=clamp(titles*8+(f.defenses||0)*4,0,32);

  const peak=F.peakElo||f.careerElo||1000;
  const sommet=clamp(Math.round(((peak-900)/900)*26),0,26);

  /* L'intégrité se plafonne AVANT d'encaisser ses pénalités, sinon une
     carrière longue absorbe silencieusement les dégâts et les scandales et
     le 100/100 redevient atteignable. La pénalité de dégâts ne descend
     jamais sous un plancher dérivé du palmarès : on ne devient pas champion
     sans encaisser, même quand les compteurs disent le contraire. C'est ce
     qui rend le sans-faute structurellement impossible — plafond réel 95. */
  const years=Math.max(1,(F.year||2026)-2026);
  const base=clamp(Math.round(years*1.6),0,18);
  const usure=Math.max(Math.round((F.dmgHeadTotal||0)/40),Math.round(palmares/6));
  const longevite=clamp(base-usure-((F.scandals||0)*6),0,18);

  const empreinte=clamp((f.faithTraits||[]).length*3
    +(f.faithSpecs||[]).length*3
    +(F.nemesisBeaten?5:0),0,14);

  const fortune=clamp(Math.round(((F.peakEarnings||f.earnings||0)/2500)*10),0,10);

  return {total:clamp(palmares+sommet+longevite+empreinte+fortune,0,100),
          palmares,sommet,longevite,empreinte,fortune};
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
function scr_faith_epilogue(){
  const f=G.f, sc=computeLegendScore(f);
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
  return `<div class="scr" style="max-width:560px;margin:0 auto">
   <div style="height:120px;display:flex;flex-direction:column;justify-content:flex-end;margin-bottom:32px">
     <div class="hero-name" style="font-size:34px;line-height:1.05">${esc(f.name)}</div>
     <div class="mono" style="font-size:11px;color:var(--muted);margin-top:6px">${debut} – ${fin} · ${f.W}-${f.L}${f.ko?` · ${f.ko} KO`:''}</div>
   </div>
   <div style="text-align:center;padding:48px 0">
     <div class="hero-name" style="font-size:96px;font-weight:700;line-height:.9">${total}</div>
     <div class="mono" style="font-size:14px;color:var(--muted);margin-top:16px">/100</div>
   </div>
   <div style="margin-bottom:12px">
     ${faithScoreRow('Palmarès',sc.palmares,32,0)}
     ${faithScoreRow('Sommet',sc.sommet,26,180)}
     ${faithScoreRow('Intégrité',sc.longevite,18,360)}
     ${faithScoreRow('Empreinte',sc.empreinte,14,540)}
     ${faithScoreRow('Fortune',sc.fortune,10,720)}
   </div>
   <div class="mono" style="font-size:12px;color:${compare.color};margin-bottom:12px">${compare.text}</div>
   ${faithJourneyBlock(G.faith)}
   ${serment?`<div class="mono" style="font-size:11px;color:${tenu?'var(--gold)':'var(--muted)'};${tenu?'':'text-decoration:line-through'}">${tenu?'✦ Serment tenu — score ×1,15':'Serment non tenu'} · ${esc(serment.label)}</div>`:''}
   <button class="btn primary" style="width:100%;height:56px;margin-top:40px;font-size:16px" onclick="CL.newFaithCareer()">ÉCRIRE UNE AUTRE LÉGENDE</button>
   <button class="btn ghost" style="width:100%;margin-top:12px" onclick="CL.go('hof')">Voir le Panthéon</button>
  </div>`;
}
/* ==== [FIN ANCRE] ==== */
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
const FAITH_PRESSE_MEDIAS=['LA GAZETTE DE LA CAGE','COMBAT HEBDO','LE ROUND','RINGSIDE'];
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
const FAITH_PRESSE_TITRES={
  blanche:['Une année pour rien','Le nom effacé des affiches','Suspendu, et déjà oublié','Douze mois de silence administratif','La saison qui n’a jamais eu lieu','Rayé du calendrier'],
  consecration:['Le sommet, enfin','Plus personne devant','La division a un patron','On regarde tout le monde d’en haut','Le trône est occupé','Il n’y a plus d’adversaire évident'],
  usure:['À quel prix ?','Les coups s’accumulent','Une guerre de trop','Le corps envoie la facture','Gagner en laissant des morceaux','Ce que le classement ne dit pas'],
  ascension:['La marche a été franchie','On ne rigole plus','L’année qui change tout','Le saut que personne n’attendait','Un cran au-dessus','La hiérarchie a bougé'],
  chute:['La chute','Le doute s’installe','Où est passé le combattant ?','Le classement ne pardonne pas','Une année à oublier','Le contrecoup'],
  creux:['Une saison sans combat','Le silence de la cage','Absent des affiches','Une année en pointillés'],
  stagnation:['Sur place','Ni progrès ni recul','Une année de transition','Le surplace','Rien n’a bougé','Une saison sans relief']
};
/* Plusieurs corps par angle : une carrière dure quinze saisons ou plus, et
   un texte qui revient à l'identique tue la fiction plus vite qu'un texte
   moyen. Le tirage est déterministe (dérivé de l'année et du bilan) pour
   qu'une même saison relise toujours le même article. */
const FAITH_PRESSE_CORPS={
  blanche:[
    'Licence suspendue, saison annulée. Le dossier restera dans les archives de la fédération bien après que le public aura tourné la page.',
    'Une signature au bas d’un rapport de laboratoire aura suffi à rayer douze mois de travail. La cage, elle, n’a pas attendu.',
    'Le calendrier s’est refermé sans un seul combat. Les concurrents, eux, ont continué d’avancer.'],
  consecration:[
    'Le classement ne se discute plus. Reste à savoir combien de temps un sommet se défend — l’histoire du sport dit rarement longtemps.',
    'Il faudra désormais battre ce nom pour exister dans la division. Tous les calendriers de l’an prochain seront écrits autour de lui.',
    'La place est prise, et personne ne semble pressé de la réclamer. C’est précisément là que les carrières deviennent dangereuses.'],
  usure:[
    'Le bilan comptable est correct. Le bilan médical l’est moins. En coulisses, plus d’un observateur compte les années qui restent.',
    'Chaque victoire de cette saison s’est payée en coups encaissés. Ce genre d’arithmétique finit toujours par se solder.',
    'On a vu un combattant gagner. On a aussi vu un homme rentrer au vestiaire plus lentement qu’il y était entré.'],
  ascension:[
    'La progression est nette, mesurable, et les promoteurs l’ont remarquée avant les fans. Le calendrier de l’an prochain sera plus dur.',
    'Il y a douze mois, ce nom ne figurait dans aucune conversation sérieuse. Il ouvre désormais les discussions de matchmaking.',
    'Le genre de saison qui déplace une carrière d’un étage. Reste à tenir le rythme quand les adversaires cesseront d’être des tests.'],
  chute:[
    'La saison laisse des traces au classement. Un accident de parcours, dit l’entourage ; une tendance, disent les chiffres.',
    'Rien ne s’est écroulé d’un coup. C’est bien ce qui inquiète : la pente a été régulière, et personne ne l’a enrayée.',
    'Les mêmes armes, les mêmes plans, mais plus les mêmes résultats. La division a appris à lire ce combattant.'],
  creux:[
    'Aucun combat cette année. Dans ce sport, l’absence se paie deux fois : au classement, et dans la mémoire du public.',
    'Douze mois sans entrer dans la cage. Les fans passent à autre chose plus vite que les blessures ne guérissent.'],
  stagnation:[
    'Rien de déshonorant, rien de marquant non plus. Le genre de saison qu’on oublie avant même la suivante.',
    'Une année propre, sans éclat. À ce niveau, ne pas monter revient déjà à laisser passer du monde.',
    'Le travail est là, les résultats suivent à peine. La différence se fera ailleurs que dans la salle.']
};
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
  return '';
}
function faithPresseArticle(ys,f,F){
  const angle=faithPresseAngle(ys,F);
  const h=Math.abs((F.year||2026)+(ys.wins||0)*7+(ys.losses||0)*13);
  const titres=FAITH_PRESSE_TITRES[angle];
  const corpsList=FAITH_PRESSE_CORPS[angle];
  const corpsTxt=corpsList[(h*3)%corpsList.length];
  /* Un pari perdu fait un meilleur papier qu'une routine réussie. */
  const log=(ys.yearLog||[]);
  const marquant=log.find(l=>l.outcome==='raté')||log[log.length-1]||null;
  const ligne=marquant?`<p style="margin:0 0 12px">« ${esc(marquant.title)} » aura marqué l’année${marquant.outcome==='raté'?' — et pas dans le bon sens':''}.</p>`:'';
  const ton=faithPresseTon(f,angle);
  return {titre:titres[h%titres.length],angle,
    corps:`${ligne}<p style="margin:0 0 12px">${corpsTxt}</p>${ton?`<p style="margin:0">${ton}</p>`:''}`};
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
 * @param {object} e une entrée de G.faith.journey */
function faithJourneyRow(e){
  return `<div style="display:flex;align-items:center;gap:10px;height:40px;border-bottom:1px solid var(--line)">
    <span class="mono" style="flex:0 0 38px;font-size:11px;color:var(--muted)">${e.year}</span>
    <span class="mono" style="flex:0 0 44px;font-size:12px">${e.W}-${e.L}</span>
    <span style="flex:1;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(e.title)}</span>
    <span class="mono" style="flex:0 0 14px;text-align:center;font-size:13px;color:var(--loss)">${e.rupture?'✦':''}</span>
    <span class="mono" style="flex:0 0 32px;text-align:right;font-size:11px;color:var(--muted)">#${e.rank||'—'}</span>
  </div>`;
}
/** Le Parcours complet, positionné entre la décomposition du score et le
 * badge de serment sur l'épilogue — jamais au-dessus de la note elle-même.
 * @param {object} F G.faith @returns {string} */
function faithJourneyBlock(F){
  const j=(F&&F.journey)||[];
  if(!j.length) return '';
  return `<div class="eyebrow" style="font-size:11px;margin:20px 0 8px">LE PARCOURS</div>
    <div style="margin-bottom:20px">${j.map(faithJourneyRow).join('')}</div>`;
}
/* ==== [FIN ANCRE] ==== */
function scr_faith_year_end(){
  const ys=G.faith.yearStats, f=G.f, F=G.faith;
  const art=faithPresseArticle(ys,f,F);
  const media=FAITH_PRESSE_MEDIAS[(F.year||2026)%FAITH_PRESSE_MEDIAS.length];
  const chiffre=(v,lbl,couleur)=>`<div style="border:1px solid var(--line);padding:12px;text-align:center">
    <div class="mono" style="font-size:20px;${couleur?`color:${couleur}`:''}">${v}</div>
    <div class="eyebrow" style="font-size:10px;margin-top:4px">${lbl}</div></div>`;
  const skills=(ys.newSkills||[]).map(sk=>{ const c=RAR_COLORS[sk.rar]||'var(--gold)';
    return `<div style="border-left:3px solid ${c};padding:8px 12px;margin-top:8px">
      <b style="color:${c}">${sk.name}</b> <span class="muted small">(${sk.rar})</span>
      <div class="muted small">${sk.desc||sk.blurb||''}</div></div>`; }).join('');
  return `<div class="scr" style="max-width:560px;margin:0 auto">
   ${faithSeasonBar(5)}
   <div style="border-top:1px solid var(--text);border-bottom:3px solid var(--text);padding:10px 0;display:flex;justify-content:space-between;align-items:baseline">
     <span class="hero-name" style="font-size:18px;letter-spacing:.06em">${media}</span>
     <span class="mono" style="font-size:11px;color:var(--muted)">Saison ${F.year}</span>
   </div>
   <h2 class="hero-name" style="font-size:28px;line-height:1.08;margin:0">${art.titre}</h2>
   <div style="font-size:15px;line-height:1.55">${art.corps}</div>
   <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
     ${chiffre(`${ys.wins}-${ys.losses}`,'Bilan')}
     ${chiffre(`${ys.eloDelta>0?'+':''}${ys.eloDelta}`,'Progression',ys.eloDelta>=0?'var(--win)':'var(--loss)')}
     ${chiffre(`#${ys.rank}`,'Classement')}
     ${chiffre(ys.dmgHead,'Coups encaissés',ys.dmgHead>30?'var(--loss)':'')}
   </div>
   ${skills?`<div><div class="eyebrow" style="margin-bottom:4px">Ce qui a été appris</div>${skills}</div>`:''}
   <button class="btn primary" style="width:100%;height:56px;font-size:16px" onclick="CL.nextFaithYear()">SAISON ${F.year+1}</button>
  </div>`;
}
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
   <div class="card mb" style="background:var(--panel2);border-left:3px solid var(--gold);padding:14px">
     <div class="small" style="color:var(--text)">${verdict}</div>
     <div class="small mt" style="color:var(--gold)">« ${conseil} »</div>
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
