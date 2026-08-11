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

    <div class="fld" style="text-align:left"><label>Genre</label><div class="pills">
      <span class="pill ${(d.gender||'H')==='H'?'on':''}" onclick="CL.selectFaithDraft('gender','H')">Homme</span>
      <span class="pill ${d.gender==='F'?'on':''}" onclick="CL.selectFaithDraft('gender','F')">Femme</span>
    </div></div>
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
    <div style="flex:1"><span class="stat-lbl" style="margin-bottom:4px;display:flex;justify-content:space-between"><span>FORME</span><b class="mono" style="font-size:11px">${d20(f.form)}</b></span>
      <div class="gauge2" style="background:var(--line);height:4px;border-radius:2px;overflow:hidden">
        <span style="display:block;height:100%;width:${clamp(f.form,0,100)}%;background:var(--text)"></span></div></div>
    <div style="flex:1"><span class="stat-lbl" style="margin-bottom:4px;display:flex;justify-content:space-between"><span>MORAL</span><b class="mono" style="font-size:11px">${d20(f.morale)}</b></span>
      <div class="gauge2" style="background:var(--line);height:4px;border-radius:2px;overflow:hidden">
        <span style="display:block;height:100%;width:${clamp(f.morale,0,100)}%;background:var(--text)"></span></div></div>
  </div>`;
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
    const lbl=k==='morale'?'Moral':k==='form'?'Forme':attrLabel(k);
    if(v===0) return '';
    const shown=Math.sign(v)*Math.max(1,Math.round(Math.abs(v)/5)); // jamais 0 pour un vrai effet, toujours au moins ±1
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
       return `<div class="glass${locked?'':' opp'}" style="padding:14px;text-align:left;opacity:${locked?0.4:1};cursor:${locked?'not-allowed':'pointer'}" ${locked?'':`onclick="CL.chooseFaithEvent(${i})"`}>
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
   <div class="mono small muted" style="margin:-20px 0 24px">Graine de la run : <b>${G.arcade.seed}</b>${(G.arcade.asc||0)>0?` · <span class="gold">Ascension ${G.arcade.asc}</span>`:''}${G.arcade.daily?' · <span class="sage">DÉFI DU JOUR</span>':''}</div>
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
    h+=`<div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--line);padding:16px;margin-bottom:20px">
      <div class="meta-strip"><div><span>Style</span><b>${p.styleLabel}</b></div></div>
      <div class="hero-name">${p.nick} ${p.flag}</div>
      <div class="narr" style="margin:10px 0 0;position:relative;z-index:2"><blockquote style="font-size:14px">« ${p._perk||''} »</blockquote></div>
      ${arcadePerkBadge(p)}
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:16px 0;position:relative;z-index:2" class="mono">
        <div style="background:var(--panel2);border:1px solid ${_stk===_max?'var(--gold-d)':_stk===_min?'var(--blood-d)':'var(--line)'};padding:8px 0;text-align:center"><span class="stat-lbl">STRK</span><b style="font-size:18px;${_stk===_max?'color:var(--gold)':_stk===_min?'color:var(--loss)':''}">${_stk}</b></div>
        <div style="background:var(--panel2);border:1px solid ${_grp===_max?'var(--gold-d)':_grp===_min?'var(--blood-d)':'var(--line)'};padding:8px 0;text-align:center"><span class="stat-lbl">GRAP</span><b style="font-size:18px;${_grp===_max?'color:var(--gold)':_grp===_min?'color:var(--loss)':''}">${_grp}</b></div>
        <div style="background:var(--panel2);border:1px solid ${_pui===_max?'var(--gold-d)':_pui===_min?'var(--blood-d)':'var(--line)'};padding:8px 0;text-align:center"><span class="stat-lbl">PUIS</span><b style="font-size:18px;${_pui===_max?'color:var(--gold)':_pui===_min?'color:var(--loss)':''}">${_pui}</b></div>
        <div style="background:var(--panel2);border:1px solid ${_crd===_max?'var(--gold-d)':_crd===_min?'var(--blood-d)':'var(--line)'};padding:8px 0;text-align:center"><span class="stat-lbl">CARDIO</span><b style="font-size:18px;${_crd===_max?'color:var(--gold)':_crd===_min?'color:var(--loss)':''}">${_crd}</b></div>
      </div>
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
function gauntletStatusBlock(a,live){
  const rows=[];
  if(a.contract){
    const c=a.contract, ok=live?evalGauntletContract(a):!!c.done;
    rows.push(`<div class="mono small" style="color:${ok?'var(--sage)':'var(--gold)'}"><b>${SVG.pact} ${ok?'✓':'☐'} ${c.label}</b> <span class="muted">— ${c.hint} (×${c.mult} sur le gain)</span></div>`);
  }
  const banked=a.banked||0;
  if(banked>0){
    const elim=eliminationPreview(a);
    rows.push(`<div class="mono small"><span class="muted">Cagnotte : </span><b class="gold">${banked} pts</b><span class="muted"> · si le prochain combat est perdu : </span><b style="color:var(--loss)">+${elim} pts</b></div>`);
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
  return `<div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--line);padding:12px;text-align:left;margin-top:12px">
     <div class="eyebrow mb" style="font-size:11px">État de la run</div>
     ${rows.join('')}
   </div>`;
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
   <p class="lede small">Votre tête de série : #${t.playerSeed}. ${rivalAlive?'<b style="color:var(--blood)">Un némésis est encore en lice dans ce tableau.</b>':'Aucun némésis dans les survivants.'}</p>
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
  /* ==== [ANCRE: GAUNTLET_DAILY_STREAK] — le bonus de streak (finaliseGauntletRun,
     ui-08) s'applique EN PLUS de gauntletRunMult : le multiplicateur affiché
     doit l'inclure, sinon l'équation base×mult=gain ne balance plus dès
     qu'un défi du jour à streak>=3 est joué. ==== */
  const dailyBonusMult=a.dailyStreakBonusMult||1;
  if(dailyBonusMult>1) parts.push(`série de défis du jour (${a.dailyStreak}) ×${dailyBonusMult}`);
  const displayMult=Math.round(mult*dailyBonusMult*100)/100;
  /* ==== [FIN ANCRE] ==== */
  const contractLine=a.contract
    ? `<div class="mono small" style="color:${a.contract.done?'var(--sage)':'var(--muted)'}">${a.contract.done?'✓':'✗'} Contrat : ${a.contract.label}</div>`
    : '';
  const bounty=(a.bounties||0)>0?`<div class="mono small" style="color:var(--blood)">⚔ ${a.bounties} némésis vaincue(s) — primes déjà versées</div>`:'';
  const inj=(a.runInjuries||[]).length?`<div class="mono small muted">${a.runInjuries.length} séquelle(s) encaissée(s) : ${a.runInjuries.map(i=>i.name).join(', ')}</div>`:'';
  const curses=(a.cursedTaken||0)>0?`<div class="mono small muted">${a.cursedTaken} pacte(s) de camp maudit accepté(s)</div>`:'';
  const daily=a.daily?`<div class="mono small sage">Tentative du DÉFI DU JOUR consommée.</div>`:'';
  const multLine=(displayMult>1)
    ? `<div class="mono small gold"><b>${base} pts</b> × <b>${displayMult}</b> = <b>${a.earnedOnElimination||0} pts</b>${parts.length?` <span class="muted">(${parts.join(' · ')})</span>`:''}</div>`
    : '';
  const ach=(a.newAch||[]).length?`<div class="mono small gold mt">🏅 ${a.newAch.map(x=>x.h).join(' · ')}</div>`:'';
  if(!multLine && !contractLine && !bounty && !inj && !curses && !daily && !ach) return '';
  return `<div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--line);border-left:3px solid var(--gold);padding:12px;text-align:left;margin-bottom:20px">
     <div class="eyebrow mb" style="font-size:11px">Bilan de la run</div>
     ${multLine}${contractLine}${bounty}${inj}${curses}${daily}${ach}
   </div>`;
}
/* ==== [ANCRE: GAUNTLET_ASCENSION] — un palier ne se débloque qu'en gagnant le
   format : le message n'apparaît donc que sur une victoire réelle. ==== */
function ascensionUnlockBlock(a){
  if(!a.victory) return '';
  const meta=loadMetaStats();
  const lvl=gauntletAscLevel(meta,a.mode);
  if(lvl<=(a.asc||0)) return '';
  return `<div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--gold);padding:12px;text-align:center;margin-bottom:20px">
     <div class="mono small gold" style="font-weight:bold">⬆ ASCENSION ${lvl} DÉBLOQUÉE — adversaires plus forts, récompenses ×${gauntletAscPayoutMod(lvl)}</div>
   </div>`;
}
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
   <button class="btn mt" style="padding:20px;font-size:18px;border-color:var(--text)" onclick="CL.retryArcade()">NOUVELLE RUN</button>
   <button class="btn ghost mt" onclick="CL.go('title')">RETOURNER AU MENU</button>
   </div>`;
}
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
/* ==== [ANCRE: GAUNTLET_MUTATEURS_ASCENSION] — A3 : à partir du palier
   d'Ascension 3 (Bracket 64 / Ladder 100), le pacte n'est plus un choix —
   la carte devient un badge non cliquable (pas d'onclick) plutôt que le
   toggle-card habituel, pour que le joueur voie la contrainte au lieu de
   croire à un bug quand son clic ne fait plus rien. ==== */
/* ==== [ANCRE: LISIBILITE_PACTE_MISE_PASTILLES] — item demandé : « beaucoup
   trop d'informations » — pactToggleBlock() rendait un paragraphe complet en
   PERMANENCE. Passe en pastille courte, le paragraphe ne réapparaît que
   quand l'option est ACTIVE (ou verrouillée par le mutateur A3, où elle est
   de toute façon permanente). Le texte accepte désormais KO/TKO OU
   soumission (ITEM_PACTE_AVEC_SOUMISSIONS) — seule une victoire aux points
   reste un échec du pacte, cohérent avec le check réel côté ui-08. ==== */
function pactToggleBlock(a){
  const streak=a.pactStreak||0;
  const streakLine=streak>0?`<br><b class="gold">🔥 Série : ${streak}${streak>=3?' — Légendaire garantie au prochain camp !':''}</b>`:'';
  if((a.asc||0)>=3){
    return `<div style="flex:1;min-width:0">
     <div class="mono small" style="display:inline-block;padding:7px 12px;border-radius:20px;border:1px solid var(--blood);color:var(--blood);font-weight:bold">⚠ Pacte obligatoire</div>
     <div class="muted small mt">Ascension ${a.asc} : chaque combat ne compte que par finition (KO/TKO ou soumission), sans exception. Une victoire aux points arrête la run comme une défaite.${streakLine}</div>
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
  const analysis=gauntletRumorActive(G.arcade)?gauntletRumorText(opp):tacticalRead(f,opp);
  const analysisLabel=gauntletRumorActive(G.arcade)?'Rumeur':'Analyse';
  /* ==== [FIN ANCRE] ==== */
  return `<div class="scr"><div class="bar"><span class="eyebrow">Gauntlet · Plan de combat</span></div>
   <div class="hero-name" style="text-align:center;font-size:20px">${esc(f.nick||f.name)} <span class="muted">vs</span> ${esc(opp.name)}</div>
   <div class="card mt" style="border-color:transparent;padding:0 0 16px 0">
     <div class="muted small" style="border-left:2px solid var(--gold);padding-left:10px"><b>${analysisLabel} :</b> ${analysis}</div>
   </div>
   <p class="lede small mt">Quelle est ta consigne tactique pour ce combat ?</p>
   ${combined.map((p,i)=>`<div class="opp" onclick="CL.chooseArcadePlan(${i})">
     <div class="opp-top"><span class="opp-nm gold">${p.lbl}</span></div>
     <div class="opp-read" style="margin-top:4px;opacity:1">${p.desc}</div></div>`).join('')}
   <button class="btn ghost mt" onclick="CL.chooseArcadePlan(-1)">Aucune consigne particulière</button>
  </div>`;
}
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
     ${rivalBadge(a.opponent)}
     <div class="hero-name" style="font-size:clamp(22px,6vw,28px)">${esc(a.opponent.name)} ${a.opponent.flag}</div>
     <div class="muted small mt">${a.opponent.styleLabel} · ${a.opponent.age} ans</div></div>
   ${gauntletStatusBlock(a,true)}
   <div style="display:flex;gap:10px;margin-top:12px">${atRiskToggleBlock(a)}</div>
   <button class="btn primary mt" style="font-size:20px;padding:18px" onclick="CL.fightArcade()">COMBATTRE</button>
   <button class="btn ghost" onclick="CL.go('title')">Abandonner la run (0 pt)</button></div>`;
  }
  if(a.mode==='ladder_100'){
    /* ==== [ANCRE: REJOUABILITE_LADDER_CIBLES] — a.targets (2-3 profils,
       cf. genWTUMMATargets ui-03) remplace la cible unique imposée : chaque
       carte affiche l'écart de rang (le vrai signal de risque) et déclenche
       CL.pickLadderTarget(rank) au clic. ==== */
    const targets=a.targets||[];
    const targetCard=t=>{
      const gap=a.rank-t.ladderRank;
      const riskLabel=gap>=18?'AGRESSIF':gap>=10?'MÉDIAN':'SÛR';
      const riskColor=gap>=18?'var(--blood)':gap>=10?'var(--gold)':'var(--sage)';
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
  return `<div class="scr center intro"><div class="eyebrow" style="color:var(--blood)">WTUMMA // ${a.tournament.stepName.toUpperCase()}</div>
   <div class="hero-name" style="text-align:center">TÊTE DE SÉRIE #${f.seed}<em style="color:var(--muted)">${f.nick} ${f.flag}</em></div>
   <div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--line);padding:16px;text-align:left;margin-top:20px">
     <div class="eyebrow mb">Prochain adversaire : Tête de série #${a.opponent.seed}</div>
     ${rivalBadge(a.opponent)}
     <div class="hero-name" style="font-size:clamp(22px,6vw,28px)">${esc(a.opponent.name)} ${a.opponent.flag}</div>
     <div class="muted small mt">${gauntletRumorActive(a)?a.opponent.styleLabel:`${a.opponent.styleLabel} · OVR ${a.opponent.overall}`}</div></div>
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
      h+=`<div class="eyebrow mt mb" style="color:var(--blood)">PACTE DU CAMP — OPTION MAUDITE</div>
          <div class="opp" style="border-left:3px solid var(--blood)" onclick="CL.pickCursedSkill()">
            <b style="color:${RAR_COLORS[cs.skill.rar]||'var(--gold)'}">${cs.skill.name}</b> <span class="muted small">(${cs.skill.rar}) — garantie</span>
            <div class="muted small mt">${cs.skill.desc||cs.skill.blurb||''}</div>
            <div class="mono small mt" style="color:var(--blood)"><b>${cs.curseLabel}</b> — séquelle permanente sur cette run</div>
            <div class="dlts">${deltasTxt}</div>
          </div>`;
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
      const deltas=t.d.map(([k,v])=>{ const lbl=k==='morale'?'Moral':k==='form'?'Forme':attrLabel(k);
        const before=k==='morale'?f.morale:k==='form'?f.form:f.attrs[k];
        if(v>0 && k!=='morale' && k!=='form'){
          let cap=(f.maxAttrs && f.maxAttrs[k]!=null) ? f.maxAttrs[k] : f.potential+4;
          if(f.agedCeilings && f.agedCeilings[k]!=null) cap=Math.min(cap, f.agedCeilings[k]);
          if(before>=cap) return `<span class="dlt">${lbl} ${d20(before)} (déjà au max)</span>`;
          return `<span class="dlt up">${lbl} ${d20(before)} → ${d20(Math.min(before+v,cap))}</span>`;
        }
        const after=k==='morale'||k==='form'?clamp(before+v,0,100):Math.max(1,before+v);
        return `<span class="dlt ${v>=0?'up':'dn'}">${lbl} ${d20(before)} → ${d20(after)}</span>`; }).join('');
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
      <div class="eyebrow mb mt">Attributs du combattant (temps réel)</div>
      ${grp('tech','Technique',g.tech)}${grp('ment','Mental',g.ment)}${grp('phys','Physique',g.phys)}
  </div>`;
  /* ==== [FIN ANCRE] ==== */
  return h;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: TITLE_ELIGIBLE] — condition UNIQUE, partagée par genOpponents()
   et fightKind(). Avant : les deux vérifiaient des choses différentes
   (streak vs orgWins), ce qui permettait de battre le vrai champion sans que
   le combat soit jamais reconnu comme un combat de titre. ==== */
