"use strict";
/* CAGE LEGACY — js/ui-07-contracts-legacy-screens.js
   ============================================================================
   Fichier 7/8 issu du découpage de l'ancien ui.js monolithique (~400 Ko).
   Écrans de contrats (sommet, négociation, marché libre, supercombat), historique, palmarès, retraite, codex, Salle des Légendes, et Tournoi All-Stars.

   IMPORTANT : ce découpage préserve l'ORDRE EXACT du code d'origine — aucune
   fonction n'a été déplacée ou réordonnée, seules des frontières de fichier
   ont été insérées à des points sûrs (toujours juste avant une déclaration de
   premier niveau, jamais au milieu d'une fonction ou d'un objet). Tous ces
   fichiers partagent la même portée globale que l'ancien ui.js (variables et
   fonctions visibles d'un fichier à l'autre, comme avant), il faut donc les
   charger dans l'ordre indiqué dans index.html : 01, 02, 03... jusqu'à 08.
   ============================================================================ */

function scr_toptier(){
  // ==== [ANCRE: HARMONISATION_OFFRES_SOMMET] — item demandé : afficher ces
  // deux organisations avec exactement le même gabarit de carte que toutes
  // les autres offres (contractPayLine, nombre de combats, bouton "Signer
  // avec X"), au lieu d'un style ad hoc rouge/sauge à part.
  const offers=[
    {org:6,flavor:'Pacific Championship',sub:'Gloire',color:'var(--gold)',contract:generateContract(G.f,6,false),
      desc:"L\u2019organisation la plus prestigieuse et brutale au monde. Le niveau d\u2019opposition y est effrayant (+4 OVR pour tous les adversaires), mais la gloire y est inégalée (+40% de progression au classement)."},
    {org:5,flavor:'Ultimate Rim',sub:'Argent & Santé',color:'var(--sage)',contract:generateContract(G.f,5,false),
      desc:"La ligue des millionnaires. Salaires multipliés par 3, niveau élite mais régulé, et suivi médical de pointe qui entretient votre conditionnement physique — mais aucun médecin ne rend les neurones perdus au combat."}
  ];
  return `<div class="scr center intro"><div class="eyebrow gold">Le Sommet du Monde</div>
   <div class="hero-name" style="text-align:center;font-size:clamp(26px,8vw,34px)">L\u2019Heure du Choix</div>
   <p class="lede">Vous avez conquis l\u2019Europe. Les deux plus grandes organisations mondiales vous offrent un contrat d\u2019exclusivité — chacune distincte, à comparer avant de signer. Votre décision est définitive.</p>
   ${offers.map(o=>`<div class="glass" style="position:relative;background:var(--panel2);border:1px solid ${o.color};text-align:left;padding:16px;margin-top:18px">
     <div class="hero-name" style="font-size:20px">${o.flavor}<em style="color:var(--muted)">${o.sub} · ${orgLevelTag(o.org)}</em></div>
     <div class="mono small gold mt">${contractPayLine(o.contract)}</div>
     <div class="mono small muted">Contrat de ${o.contract.fightsLeft} combats</div>
     ${o.contract.isFinalContract?`<div class="mono small mt" style="color:var(--blood);border:1px solid var(--blood);padding:6px 8px;border-radius:4px;background:color-mix(in srgb, var(--blood) 8%, transparent)">⚠ DERNIÈRE DANSE : le ${o.contract.finalFightNumber||o.contract.fightsLeft}e combat de ce contrat sera le dernier avant retraite obligatoire.</div>`:''}
     <p class="muted small mt">${o.desc}</p>
     <button class="btn primary mt" style="position:relative;z-index:2" onclick="CL.signTopTier(${o.org})">Signer avec ${o.flavor}</button>
   </div>`).join('')}
   <button class="btn ghost mt" onclick="CL.declineTopTier()">Ne rien signer — rester en Continentale</button>
   </div>`; }
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: LOT2_CONTRAT] — négociation de fin de contrat, remplace la
   promotion purement automatique par un vrai choix de carrière. ==== */
/* ==== [ANCRE: AFFICHAGE_CACHET_CONTRAT] — remplace les anciens libellés bruts
   du type "0.6k$ / 0.6k$" (illisible, cf. item demandé) par un montant réel
   et explicite en euros/dollars, avec le nombre de combats du contrat. ==== */
function contractPayLine(c){
  return `${formatArgent(c.show)} <span class="muted">par combat</span> + ${formatArgent(c.win)} <span class="muted">par victoire</span>`;
}
function scr_contract_nego(){
  const f=G.f;
  if(f.contractNonRenewed){
    // ==== [ANCRE: ECRAN_NON_RENOUVELLEMENT] — remplace l'ancienne
    // rétrogradation instantanée : à l'échéance, l'organisation explique
    // pourquoi elle ne prolonge pas, avec le bilan chiffré du contrat, puis
    // renvoie directement vers le marché (offres d'organisations de niveaux
    // variés, cf. negoMarket).
    return `<div class="scr center intro">
      <div class="eyebrow blood">Fin de contrat</div>
      <h2 class="disp">Non-renouvellement</h2>
      <p class="lede">${orgDisplayName(f)} ne souhaite pas prolonger votre contrat : ${esc(f.contractNonRenewalReason||'bilan jugé insuffisant sur ce contrat')}.</p>
      <div class="glass card mb" style="background:var(--panel2);padding:16px;text-align:left;border-left:3px solid var(--loss)">
         <div class="eyebrow mb" style="color:var(--loss)">Statut actuel</div>
         <div class="mono small">Dernier salaire : ${contractPayLine(f.contract)}</div>
      </div>
      <button class="btn primary mt" onclick="CL.negoMarket(true)">Chercher un nouveau contrat</button>
    </div>`;
  }
  return `<div class="scr center intro">
    <div class="eyebrow gold">Fin de contrat</div>
    <h2 class="disp">Négociations</h2>
    <p class="lede">Votre contrat avec ${orgDisplayName(f)} est arrivé à son terme. Il est temps de discuter de votre avenir.</p>
    <div class="glass card mb" style="background:var(--panel2);padding:16px;text-align:left;border-left:3px solid var(--gold)">
       <div class="eyebrow mb">Statut actuel</div>
       <div class="mono small">Salaire : ${contractPayLine(f.contract)}</div>
       <div class="mono small mt">Réputation : <b class="gold">${f.contract.reputation||'Solide'}</b></div>
    </div>
    ${f.contract.isFinalContract?`<div class="glass card mb" style="background:var(--panel2);padding:16px;text-align:left;border-left:3px solid var(--blood)">
       <div class="eyebrow mb" style="color:var(--blood)">⚠ Dernière danse</div>
       <p class="muted small">L\u2019âge rattrape ${esc(f.name)}. Si ce contrat est reconduit, le ${f.contract.finalFightNumber||f.contract.fightsLeft}e et dernier combat de ce nouveau contrat sera le dernier de sa carrière : la retraite deviendra obligatoire à son échéance.</p>
    </div>`:''}
    <button class="btn primary mt" onclick="CL.negoRenew()">Renouveler aux mêmes conditions (sûr)</button>
    <button class="btn mt" style="border-color:var(--gold);color:var(--gold)" onclick="CL.negoRaise()">Exiger une revalorisation (+40% salaire, risqué)</button>
    <button class="btn ghost mt" onclick="CL.negoMarket(false)">Tester le marché (free agency)</button>
  </div>`;
}
function scr_free_agency(){
  const offers=G.freeAgencyOffers||[];
  return `<div class="scr center intro">
    <div class="eyebrow gold">Marché libre (Free Agency)</div>
    <h2 class="disp">Offres de contrat</h2>
    <p class="lede">Actuellement : <b>${orgDisplayName(G.f)}</b> — ${orgLevelTag(G.f.org)}.</p>
    <p class="lede">Voici les contrats disponibles sur la table — chacun distinct, à comparer avant de signer.</p>
    ${offers.map((o,i)=>`
      <div class="glass card mb" style="background:var(--panel2);border:1px solid var(--gold-d);text-align:left;padding:16px">
        <div class="hero-name" style="font-size:20px">${o.flavor}<em style="color:var(--muted)">${orgLevelTag(o.org)}</em></div>
        <div class="mono small gold mt">${contractPayLine(o.contract)}</div>
        <div class="mono small muted">Contrat de ${o.contract.fightsLeft||4} combats</div>
        ${o.contract.isFinalContract?`<div class="mono small mt" style="color:var(--blood);border:1px solid var(--blood);padding:6px 8px;border-radius:4px;background:color-mix(in srgb, var(--blood) 8%, transparent)">⚠ DERNIÈRE DANSE : le ${o.contract.finalFightNumber||o.contract.fightsLeft}e combat de ce contrat sera le dernier avant retraite obligatoire.</div>`:''}
        <p class="muted small mt">${o.desc}</p>
        <button class="btn primary mt" onclick="CL.acceptFreeAgency(${i})">Signer avec ${o.flavor}</button>
      </div>
    `).join('')}
    ${offers.length===0?`<p class="muted">Aucune offre. Fin de carrière forcée.</p><button class="btn primary mt" onclick="CL.toLegacy()">Retraite</button>`:''}
  </div>`;
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: ECRAN_PROMO] — la promotion devient un choix du joueur (au lieu
   d'automatique) : rester chasser la ceinture locale, ou monter tout de suite. ==== */
/* ==== [ANCRE: CHAMPCHAMP_OFFRE] — le président de l'organisation propose le
   supercombat après 3 défenses (puis tous les 2 supplémentaires si refusé),
   contre un adversaire unique et verrouillé dès l'offre. ==== */
function scr_champ_champ_offer(){
  const f=G.f, offer=f.champChampOffer;
  if(!offer) return `<div class="scr center intro"><p class="lede">Aucune offre en cours.</p><button class="btn ghost mt" onclick="CL.go('hub')">Retour</button></div>`;
  const texts=[
    `Le président de l\u2019organisation vous convoque. « Vous dominez votre catégorie depuis trop longtemps. Que diriez-vous d\u2019écrire l\u2019histoire ? » Il vous propose un supercombat pour la ceinture ${offer.targetDivName}, face à ${esc(offer.champion.name)}.`,
    `Le président revient à la charge. « J\u2019ai toujours ce supercombat sur la table, si le cœur vous en dit. » ${esc(offer.champion.name)} attend toujours en ${offer.targetDivName}.`,
    `Nouvelle visite du président. « Le public commence à réclamer ce combat à corps et à cris. Dernière chance avant que j\u2019offre l\u2019opportunité à quelqu\u2019un d\u2019autre. » ${esc(offer.champion.name)} n\u2019attend que vous.`
  ];
  const waveIdx=Math.min(2,Math.floor((f.champChampLastOfferDefenses||0)/2));
  return `<div class="scr center intro">
    <div class="eyebrow gold">Proposition du Président</div>
    <h2 class="disp">Supercombat — Double Ceinture</h2>
    <p class="lede">${texts[waveIdx]}</p>
    <div class="glass card mb" style="background:var(--panel2);border:1px solid var(--gold-d);text-align:left;padding:16px;margin-top:16px">
      <div class="hero-name" style="font-size:20px">${esc(offer.champion.name)} ${offer.champion.flag}<em>${offer.champion.styleLabel}, ${offer.champion.age} ans</em></div>
      <div class="mono small muted mt">Champion ${offer.targetDivName} · ${recordStr(offer.champion)}</div>
      ${statComparisonHtml(f,offer.champion)}
    </div>
    <button class="btn primary mt" onclick="CL.acceptChampChampOffer()">Accepter le supercombat (5 rounds)</button>
    <button class="btn ghost mt" onclick="CL.declineChampChampOffer()">Décliner pour l\u2019instant</button>
  </div>`;
}
function scr_champ_champ_decision(){
  const f=G.f;
  return `<div class="scr center intro">
    <div class="eyebrow blood">Double Champion</div>
    <h2 class="disp">Où concentrer vos efforts ?</h2>
    <p class="lede">Vous détenez désormais deux ceintures. Sur laquelle voulez-vous porter votre attention prioritaire pour les prochaines défenses ?</p>
    <button class="btn primary mt" onclick="CL.chooseChampChampFocus('${f.div}')">${f.divName} (ceinture d\u2019origine)</button>
    <button class="btn mt" style="border-color:var(--blood);color:var(--blood)" onclick="CL.chooseChampChampFocus('${f.champChampBeltDivId||''}')">${f.champChampBelt} (nouvelle ceinture)</button>
  </div>`;
}
/* ==== [FIN ANCRE] ==== */
function scr_promo(){
  const f=G.f; const isChamp=!!f.champion;
  const isAmateurOffer=(f.org===0 && G.pending && G.pending.proOffer);
  if(isAmateurOffer){
    const offer=G.pending.proOffer;
    const previewStd=generateContract(f,offer.baseTier||1,false);
    return `<div class="scr center intro"><div class="eyebrow gold">Offre de Contrat Professionnel</div>
     <div class="hero-name" style="text-align:center;font-size:clamp(26px,8vw,34px)">Quelqu\u2019un veut te signer</div>
     <p class="lede mt">Actuellement : <b>Amateur</b> — ${orgLevelTag(0)}.</p>
     <p class="lede mt">Où tu combats décide qui tu combats. Une salle plus grande est une salle plus dure. ${offer.fastTrack?'Deux offres sont sur la table — compare-les avant de choisir.':''}</p>
     <!-- ==== [CORRECTIF V2-38, option (a)] — ce message décrit le passage
          amateur → pro lui-même, pas une des deux offres en particulier :
          avant ce correctif il ne s'affichait que sous l'offre standard,
          jamais sous l'offre Fast-Track, alors que signer L'UNE OU L'AUTRE
          déclenche exactement la même remise à zéro (turnPro(), ui-05).
          Décision (b) du document (palmarès pro global, sans remise à
          zéro) écartée ici : turnPro() ne s'exécute qu'une seule fois par
          carrière (à ce seul écran), donc f.W/f.L EST déjà le palmarès pro
          global demandé — rien à changer côté remise à zéro elle-même, le
          bug réel était uniquement ce message à moitié affiché. Le bilan
          maison par organisation (f.orgRecords, engine.js applyResult())
          reste ajouté comme le préconise (b), affiché sur la fiche
          (scr_profile, ui-06). ==== -->
     <div class="muted small mt" style="text-align:center">Si tu acceptes, ton palmarès sera réinitialisé à 0-0 pour ta carrière Pro. Ton record amateur (${f.W}-${f.L}) restera gravé dans ta fiche.</div>
     <div class="glass" style="position:relative;background:var(--panel2);border:1px solid var(--gold-d);text-align:left;padding:16px;margin-top:18px">
       <div class="hero-name" style="font-size:20px">${offer.orgFlavor1}<em style="color:var(--muted)">${orgLevelTag(offer.baseTier||1)}</em></div>
       <div class="mono small gold mt">${contractPayLine(previewStd)}</div>
       <div class="mono small muted">Contrat de ${previewStd.fightsLeft} combats</div>
       <p class="muted small mt">${offer.msg}</p>
       <!-- ==== [ANCRE: CORRECTIF_PHRASE_CONTRAT] — A1 : phrase1 était calculée
            (CONTRACT_PHRASES, ui-03) mais jamais lue nulle part — affichée ici
            en note de flavor sous le message principal, purement additif. ==== -->
       ${offer.phrase1?`<p class="muted small mt" style="font-style:italic">${offer.phrase1}</p>`:''}
       <button class="btn primary mt" style="position:relative;z-index:2" onclick="CL.acceptPro(${offer.baseTier||1},'${offer.orgFlavor1}')">Signer avec ${offer.orgFlavor1}</button>
     </div>
     ${offer.fastTrack?(()=>{ const previewFast=generateContract(f,offer.fastTier||3,false); return `<div class="glass" style="position:relative;background:var(--panel2);border:1px solid var(--gold-d);text-align:left;padding:16px;margin-top:15px">
       <div class="hero-name" style="font-size:20px">${offer.orgFlavor3}<em style="color:var(--muted)">${orgLevelTag(offer.fastTier||3)} — Fast-Track</em></div>
       <div class="mono small gold mt">${contractPayLine(previewFast)}</div>
       <div class="mono small muted">Contrat de ${previewFast.fightsLeft} combats</div>
       <p class="muted small mt">Ton parcours fulgurant te permet de griller les étapes.</p>
       ${offer.phrase3?`<p class="muted small mt" style="font-style:italic">${offer.phrase3}</p>`:''}
       <button class="btn mt" style="background:var(--gold-d);color:#fff;border-color:var(--gold-d);font-weight:bold;position:relative;z-index:2" onclick="CL.acceptPro(${offer.fastTier||3},'${offer.orgFlavor3}')">Signer avec ${offer.orgFlavor3}</button>
     </div>`; })():''}
     ${!offer.forced?`<button class="btn ghost mt" onclick="CL.declinePro()">Faire une saison de plus en amateur</button>`:''}
     </div>`;
  }
  // ==== [ANCRE: MARCHE_OFFRES] — le "tier" des orgas qui te veulent dépend de
  // tes accomplissements (titre, défenses, série) : un palmarès dominant ouvre
  // une offre "fast-track" concurrente en plus de l'offre standard, chacune
  // avec sa propre description et sa propre bourse — deux offres clairement
  // séparées, chacune avec son cachet précis et son nombre de combats. ====
  const nextOrg=f.org+1;
  const flavorNext=ORG_FLAVORS[nextOrg]?pick(ORG_FLAVORS[nextOrg]):(ORGS[nextOrg]||'Ligue supérieure');
  const offers=[{org:nextOrg,flavor:flavorNext,contract:generateContract(f,nextOrg,false),
    desc:isChamp?`En tant que champion ${f.divName} dominant, ${flavorNext} veut racheter votre contrat. Accepter signifie abandonner votre ceinture actuelle pour monter d\u2019un cran.`
      :`${flavorNext} a suivi tes performances de près. Ils pensent que tu es prêt pour une salle plus grande.`}];
  const recentFinishes=(f.history||[]).slice(-3).filter(h=>h.res==='win' && !isDecisionLike(h.method)).length;
  // ==== [ANCRE: FAST_TRACK_ELARGI] — avant : réservé aux champions/tenants de
  // titre (barre très haute). Un jeune prospect qui enchaîne 3 victoires avec
  // des finitions mérite lui aussi une offre concurrente, sans attendre une
  // ceinture — item demandé : choix plus intéressants pour monter vite.
  const dominantChamp=(isChamp||f.titles>=1) && ((f.defenses||0)>=2 || (f.streak||0)>=6);
  const hotProspect=!dominantChamp && (f.streak||0)>=3 && recentFinishes>=2;
  const dominant=dominantChamp||hotProspect;
  if(dominant && nextOrg+1<5){
    const flavorSkip=ORG_FLAVORS[nextOrg+1]?pick(ORG_FLAVORS[nextOrg+1]):(ORGS[nextOrg+1]||'Ligue supérieure');
    offers.push({org:nextOrg+1,flavor:flavorSkip,contract:generateContract(f,nextOrg+1,false),
      desc:hotProspect?`Trois victoires d\u2019affilée, presque toutes avant la limite : ${flavorSkip} ne veut pas rater le prochain grand nom et t\u2019offre de brûler une étape.`
        :`Ta domination a fait le tour du milieu : ${flavorSkip} veut te griller la politesse et t\u2019offre de brûler une étape.`});
  }
  return `<div class="scr center intro"><div class="eyebrow gold">${isChamp?'Free Agency (Transfert)':'Le Marché'}</div>
   <div class="hero-name" style="text-align:center;font-size:clamp(26px,8vw,34px)">Quelqu\u2019un veut te signer</div>
   <p class="lede mt">Actuellement : <b>${orgDisplayName(f)}</b> — ${orgLevelTag(f.org)}.</p>
   <p class="lede mt">Où tu combats décide qui tu combats. Une salle plus grande est une salle plus dure. ${offers.length>1?'Deux offres sont sur la table — compare-les avant de choisir.':''}</p>
   ${offers.map(o=>`<div class="glass" style="position:relative;background:var(--panel2);border:1px solid var(--gold-d);text-align:left;padding:16px;margin-top:18px">
     <div class="hero-name" style="font-size:20px">${o.flavor}<em style="color:var(--muted)">${orgLevelTag(o.org)}</em></div>
     <div class="mono small gold mt">${contractPayLine(o.contract)}</div>
     <div class="mono small muted">Contrat de ${o.contract.fightsLeft} combats</div>
     <p class="muted small mt">${o.desc}</p>
     <button class="btn primary mt" style="position:relative;z-index:2" onclick="CL.acceptPromo(${o.org})">Signer avec ${o.flavor}</button>
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
   <h3 class="disp" style="font-size:22px;margin-bottom:8px">${SVG.belt} Registre des ceintures</h3>
   <p class="lede small">L\u2019historique des règnes, des passations de pouvoir et du nombre de défenses.</p>`;
  const keys=Object.keys(groups);
  if(!keys.length){
    h+=`<div class="card mono muted small" style="text-align:center;padding:24px">Aucun titre n\u2019a encore été disputé.</div>`;
  } else {
    keys.forEach(key=>{ const reigns=groups[key]; const [org,divName]=[Number(key.split('|')[0]),reigns[0].divName];
      // ==== [ANCRE: CORRECTIF_NOM_ORG_REGISTRE] — item demandé : n'afficher que
      // de vrais noms d'organisation (ex. "Octogone MMA"), jamais le label
      // générique de palier ("Continentale") qui n'est qu'un TIER interne —
      // orgFlavor était déjà enregistré par recordTitleChange() mais jamais lu
      // ici. On prend le flavor du règne le plus récent qui en a un, avec
      // repli sur le label de palier seulement si aucun flavor n'a jamais été
      // capturé pour cette lignée (anciennes sauvegardes).
      const orgLabel=(reigns.find(r=>r.orgFlavor)||{}).orgFlavor||ORGS[org]||'Organisation';
      h+=`<div class="card glass mb" style="background:var(--panel2);padding:16px">
        <div class="hero-name" style="font-size:18px">${esc(orgLabel)}<em style="font-size:13px">${esc(divName)}</em></div>`;
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
/* ==== [ANCRE: SUCCES_VITRINE_DIRECTE] — même vocabulaire que la Boutique
   (Vitrine), appliqué aux Succès. Les exploits n'ont pas de "rareté" par
   coût comme la Boutique : la couleur du socle porte ici la CATÉGORIE (une
   couleur fixe et stable, reconnaissable d'un coup d'œil), en réutilisant
   les teintes déjà chargées de sens ailleurs dans le jeu (or = prestige,
   sang = violence/finition, sauge = technique) plus le bleu déjà utilisé
   pour la rareté "Rare" des compétences (Codex), pour la 4e catégorie
   Gauntlet plutôt que d'inventer une couleur sans lien avec le reste.
   Cette réécriture absorbe 3 correctifs ponctuels précédents : la
   catégorie Gauntlet manquante à l'affichage, l'en-tête ✕/.disp aligné
   sur Boutique/Panthéon, et la progression X/Y — tous trois toujours
   présents ici, réintégrés dans une structure en rails. ==== */
const ACH_CAT_COLOR={'Carrière & Titres':'var(--gold)','Finitions & Séries':'var(--blood)','Technique & Héritage':'var(--sage)'};
function scr_ach(){ if(!G.ach) G.ach=loadAch();
  const cats=['Carrière & Titres','Finitions & Séries','Technique & Héritage'];
  let h=`<div class="scr">
   <div class="bar"><span class="eyebrow">Palmarès</span><span class="eyebrow x" onclick="CL.go('${G.f?'hub':'title'}')">✕</span></div>
   <h2 class="disp">${G.ach.length} / ${ACH.length} exploits</h2>`;

  cats.forEach(c=>{
    const items=ACH.filter(a=>a.cat===c).map(a=>{
      const got=G.ach.includes(a.id);
      const progPair=(!got && G.f && a.prog)?a.prog(G.f):null;
      const ratio=progPair?progPair[0]/progPair[1]:0;
      return {a,got,progPair};
    });
    /* Tri : obtenus d'abord, puis en cours (du plus proche du but au plus
       loin), puis jamais entamés — pour que ce qu'il reste à viser en
       priorité soit toujours le premier exploit non obtenu visible. */
    items.sort((x,y)=>{
      if(x.got!==y.got) return x.got?-1:1;
      const rx=x.progPair?x.progPair[0]/x.progPair[1]:-1, ry=y.progPair?y.progPair[0]/y.progPair[1]:-1;
      return ry-rx;
    });
    const gc=ACH_CAT_COLOR[c];
    h+=`<div class="gal-rail-title">${c}<span class="n">${items.filter(i=>i.got).length}/${items.length}</span></div>
    <div class="gal-rail">${items.map(({a,got,progPair})=>{
      const started=progPair&&progPair[0]>0;
      const baseTxt=got?'✓ Obtenu':(progPair?`${progPair[0]}/${progPair[1]}`:(started?'En cours':'Verrouillé'));
      return `<div class="gal-tile ${got?'owned':''} ${!got&&!started?'locked':''}" style="--gc:${gc}" onclick="CL.viewAchPreview('${a.id}')">
        <div class="glow"></div>
        <div><span class="ico">${a.ico}</span><div class="nm">${a.h}</div><div class="preview-hint">▼ Détail</div></div>
        <div class="base">${baseTxt}</div>
      </div>`;
    }).join('')}</div>`;
  });
  h+=`<div class="mono small muted" style="text-align:center;margin-top:24px;opacity:.6">Un jeu développé par Pinocchio et testé par Garfield</div>`;
  h+=`<button class="btn ghost mt" style="border:none" onclick="CL.go('${G.f?'hub':'title'}')">← Revenir au ${G.f?'hub':'menu principal'}</button></div>`;
  return h; }
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: PREVIEW_SUCCES_ECRAN_DEDIE] — item demandé : même principe que
   la fenêtre dédiée du Marché noir (scr_consumable_preview, ui-08) plutôt
   que le texte replié sur place utilisé jusqu'ici (CL.toggleAchPreview,
   retiré) : le clic sur une tuile d'exploit ouvre un écran plein dédié
   (même en-tête ✕/titre que les autres fenêtres de détail). Pas de fenêtre
   Canvas ici : un succès n'a pas d'effet à visualiser dans l'octogone,
   contrairement à un consommable (buff/veto/filet de sécurité). ==== */
function scr_ach_preview(){
  const a=ACH.find(x=>x.id===G._achPreviewId);
  if(!a) return `<div class="scr center intro"><p class="lede">Exploit introuvable.</p><button class="btn ghost mt" onclick="CL.closeAchPreview()">Fermer</button></div>`;
  if(!G.ach) G.ach=loadAch();
  const got=G.ach.includes(a.id);
  const progPair=(!got && G.f && a.prog)?a.prog(G.f):null;
  const gc=ACH_CAT_COLOR[a.cat];
  const statusLine=got?`<span class="mono small" style="color:var(--sage)">✓ Déjà obtenu</span>`
    :progPair?`<span class="mono small" style="color:${gc}">Progression : ${progPair[0]} / ${progPair[1]}</span>`
    :`<span class="mono small muted">Pas encore entamé — condition binaire, se débloque d’un coup</span>`;
  return `<div class="scr"><div class="bar"><span class="eyebrow">Palmarès — détail</span><span class="eyebrow x" onclick="CL.closeAchPreview()">✕</span></div>
   <h2 class="disp gold" style="font-size:20px"><span class="ico" style="margin-right:6px">${a.ico}</span>${a.h}</h2>
   <div class="card glass mt" style="padding:14px;border-left:3px solid ${gc};background:var(--panel2)">
     <div class="eyebrow mb" style="color:${gc}">${a.cat}</div>
     <div class="muted small">Condition : ${a.d}</div>
     <div class="mt">${statusLine}</div>
   </div>
   <button class="btn ghost mt" onclick="CL.closeAchPreview()">Fermer</button>
  </div>`;
}
/* ==== [FIN ANCRE] ==== */

function scr_retire(){ return `<div class="scr center"><div class="eyebrow">Fin de carrière</div><h2 class="disp">Raccrocher les gants ?</h2>
   <p class="lede">Décision définitive. Ton palmarès sera scellé.</p>
   <button class="btn primary" onclick="CL.toLegacy()">Prendre ma retraite</button><button class="btn ghost" onclick="CL.go('hub')">Continuer</button>
   <button class="btn ghost" onclick="CL.exportSave()">Copier ma sauvegarde</button></div>`; }

// ==== [ANCRE: CORRECTIF_DUPLICATION_SCORE] — legacyTitle() recalculait ici,
// à l'identique, exactement la même formule que hofScore() (state.js) —
// même risque de désynchronisation future que pour ORG_PURSES/CHAMP_MULT
// (cf. engine.js). hofScore() est chargé avant ce fichier (state.js précède
// les écrans ui-0X dans l'ordre de chargement), donc l'appeler directement
// ici est sûr et élimine la duplication.
/* ==== [ANCRE: TITRES_PANTHEON_DIVERSITE] — item demandé : avec seulement 6
   paliers très espacés (380/250/140/60/10), la majorité des carrières
   tombaient dans les deux mêmes cases — un Panthéon de 5 fiches affichait
   3 fois "GRAND CHAMPION", donc aucune diversité visible d'une légende à
   l'autre. 12 paliers, resserrés là où les scores se concentrent réellement
   (55-340, la zone d'une carrière pro classique), pour qu'une carrière un
   peu différente donne un titre différent. Les noms restent des formules
   parlantes sans jargon MMA (cf. item « explicite pour un néophyte »).
   enshrine() (state.js) fige le titre au moment de la retraite : les fiches
   déjà au Panthéon gardent le leur, seules les futures retraites utilisent
   cette échelle. ==== */
function legacyTitle(f){ const s=hofScore(f);
  if(s>=520)return[SVG.goat,'LÉGENDE ÉTERNELLE'];    if(s>=420)return[SVG.infinity,'MONUMENT DU SPORT'];
  if(s>=340)return[SVG.trophy,'ROI DE LA CAGE'];     if(s>=270)return[SVG.crown,'GRAND CHAMPION'];
  if(s>=210)return[SVG.belt,'CHAMPION DOMINANT'];    if(s>=160)return[SVG.star,'CHAMPION RESPECTÉ'];
  if(s>=120)return[SVG.fire,'PRÉTENDANT AU TITRE'];  if(s>=85)return[SVG.medal,'TÊTE D’AFFICHE'];
  if(s>=55)return[SVG.glove,'COMBATTANT ACCOMPLI'];  if(s>=30)return[SVG.skill,'ESPOIR CONFIRMÉ'];
  if(s>=10)return[SVG.veteran,'VÉTÉRAN DU CIRCUIT']; return[SVG.hammer,'GUERRIER DE L\u2019OMBRE']; }
/* ==== [FIN ANCRE] ==== */
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
            <b style="font-size:18px">${esc(fighterDisplayName(nemesis))}</b>
            <div class="mono small muted mt">${nemesis.W}-${nemesis.L} · ${nemesis.titles||0} Titre(s)</div>
          </div>
        </div>
        <div class="muted small" style="font-style:italic">« ${diffW>=0?`L\u2019histoire retiendra que vous avez surpassé ${esc(fighterDisplayName(nemesis))}. Vous avez remporté cette guerre d\u2019usure.`:`Malgré tous vos efforts, le palmarès de ${esc(fighterDisplayName(nemesis))} restera une ombre sur votre héritage.`} »</div>
      </div>`;
    }
  }
  return `<div class="scr center"><div class="eyebrow">Palmarès scellé</div>
   <div style="font-size:60px">${ico}</div>
   <div class="hero-name" style="text-align:center;color:var(--gold)">${rank}<em style="color:var(--muted)">${esc(f.name)}${f.nick?' « '+f.nick+' »':''}</em></div>
   <div class="glass card" style="background:var(--panel2);text-align:left;padding:16px"><div class="epis" style="position:relative;z-index:2">${ep.map(e=>`<span class="epi">${e}</span>`).join('')}</div>
     ${(f.nicknameHistory&&f.nicknameHistory.length)?`<div class="mono small muted mt">Ancien(s) surnom(s) : ${f.nicknameHistory.map(n=>`« ${esc(n)} »`).join(', ')}</div>`:''}
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
   ${notableWins.length?`<div class="card mt"><div class="eyebrow mb">🏅 Adversaires notables battus</div>${notableWins.map(h=>`<div class="small muted" style="padding:4px 0">${esc(h.oppName)} ${h.oppFlag||''} <span class="mono" style="opacity:.7">(${h.oppRecord||'?'}) — ${h.method}</span></div>`).join('')}</div>`:''}
   ${f.beltHistory && f.beltHistory.length ? `<div class="card mt"><div class="eyebrow mb">👑 Ceintures remportées</div>${f.beltHistory.map(b=>`<div class="small muted" style="padding:4px 0">${esc(b.orgName)} <span class="mono" style="opacity:.7">(${esc(b.divName)}) — Année ${b.year} — ${b.defenses} défense(s)</span></div>`).join('')}</div>` : ''}
   ${retireSeasonRecapHtml(f)}
   ${retireAchievementsHtml(f)}
   ${retireLegendPointsHtml(f)}
   <button class="btn primary mt" onclick="CL.newCareer()">Nouvelle carrière</button>
   <button class="btn ghost mt" onclick="CL.go('title')">Retour au menu</button></div>`; }
/* ==== [ANCRE: ECRAN_RETRAITE_DETAILLE] — trois blocs ajoutés à l'écran de
   retraite : bilan saison par saison, succès débloqués pendant CETTE
   carrière, et points de légende gagnés grâce à elle.
   ==== [ANCRE: LISIBILITE_RETRAITE] — item demandé : l'écran devenait un mur
   ininterrompu de texte sur une longue carrière (15+ saisons, 20+ succès).
   Corrections : bouton "Nouvelle carrière" dupliqué en haut (plus besoin de
   tout parcourir pour relancer une partie), et le détail saison par saison —
   de loin le bloc le plus long — est replié par défaut au-delà de 5 saisons
   via <details>, un résumé chiffré restant visible en permanence. ==== */
function retireSeasonRecapHtml(f){
  const recap=f.seasonRecap||[];
  if(!recap.length) return '';
  const totalW=recap.reduce((s,y)=>s+y.W,0), totalL=recap.reduce((s,y)=>s+y.L,0);
  const rows=recap.map(s=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px dotted var(--line)">
      <div><b>Année ${s.year}</b> <span class="muted small">(${s.age} ans · ${s.divName})</span></div>
      <div class="mono small"><span style="color:var(--win)">${s.W}V</span> — <span style="color:var(--loss)">${s.L}D</span>
        <span class="muted"> · ${s.koW} KO / ${s.subW} SUB / ${s.decW} DÉC</span></div>
    </div>${s.trophies.length?`<div class="muted small" style="padding:2px 0 4px 0">🏆 ${s.trophies.join(', ')}</div>`:''}`).join('');
  const summaryTxt=`📅 Bilan saison par saison`;
  const subTxt=`${recap.length} saison(s) · ${totalW}V-${totalL}D au total`;
  if(recap.length>5){
    // ==== [ANCRE: AFFORDANCE_DEPLIABLE] — item demandé : le <details> ne
    // signalait pas visuellement qu'il était cliquable. Repris avec le même
    // langage visuel que les cartes cliquables du matchmaking (classe .opp,
    // curseur, bordure) + chevron explicite et texte "Toucher pour déplier".
    return `<details class="mt"><summary class="opp" style="list-style:none;display:flex;justify-content:space-between;align-items:center">
        <span><span class="eyebrow" style="display:block">${summaryTxt}</span><span class="muted small">${subTxt}</span></span>
        <span class="gold mono" style="font-size:18px">▸</span>
      </summary><div class="card mt" style="border-top:none">${rows}</div></details>`;
  }
  return `<div class="card mt"><div class="eyebrow mb">${summaryTxt} <span class="muted" style="font-weight:normal">— ${subTxt}</span></div>${rows}</div>`;
}
function retireAchievementsHtml(f){
  const earned=ACH.filter(a=>{ try{ return a.t(f); }catch(e){ return false; } });
  if(!earned.length) return '';
  const chips=earned.map(a=>`<span class="tag2 hot" style="display:inline-flex;align-items:center;gap:5px" title="${esc(a.d)}"><span style="font-size:15px">${a.ico}</span>${esc(a.h)}</span>`).join('');
  const summaryTxt=`🏆 Succès débloqués`;
  const subTxt=`${earned.length}/${ACH.length} obtenus`;
  if(earned.length>10){
    return `<details class="mt"><summary class="opp" style="list-style:none;display:flex;justify-content:space-between;align-items:center">
        <span><span class="eyebrow" style="display:block">${summaryTxt}</span><span class="muted small">${subTxt}</span></span>
        <span class="gold mono" style="font-size:18px">▸</span>
      </summary><div class="card mt" style="border-top:none;display:flex;flex-wrap:wrap;gap:8px">${chips}</div></details>`;
  }
  return `<div class="card mt"><div class="eyebrow mb">${summaryTxt} <span class="muted" style="font-weight:normal">(${subTxt})</span></div>
    <div style="display:flex;flex-wrap:wrap;gap:8px">${chips}</div>
  </div>`;
}
function retireLegendPointsHtml(f){
  const earned=Math.max(0,Math.round((hofScore(f)||0)/10));
  return `<div class="card mt glass" style="border-left:3px solid var(--gold);background:var(--panel2)">
    <div class="eyebrow mb" style="color:var(--gold)">Points de Légende gagnés</div>
    <div class="stat-big gold" style="font-size:30px">+${earned}</div>
    <div class="muted small mt">Score d\u2019héritage : ${hofScore(f)||0} (défenses, victoires, titres, finitions). Utilisables dans la Salle des Légendes pour débloquer modes, archétypes et cosmétiques.</div>
  </div>`;
}

/* ==== [ANCRE: LOT9_ECRAN_CODEX] ==== */
function formatSkillFx(fx, f){
  if(!fx) return '';
  /* ==== [ANCRE: ITEM_LISIBILITE_GAINS_ATTRIBUTS] — item demandé : cette carte
     affichait "+2 Cardio" sans jamais dire où en est réellement le
     combattant, obligeant à ouvrir la fiche complète et chercher la ligne
     correspondante pour savoir si le gain a un sens. Quand un fighter f est
     fourni (carte de compétence en cours de run), le format bascule en
     "avant → après" (même convention que le récapitulatif post-combat,
     ui-06 ANCRE ci-dessus). Un attribut déjà à son plafond n'est plus
     MASQUÉ (perte d'information : la carte pouvait sembler ne rien
     apporter) mais affiché explicitement "Label 20" avec sa mention.
     Sans f (Codex, catalogue hors combattant vivant), le format "+X"
     d'origine est conservé — aucun avant/après n'a de sens hors contexte. ==== */
  /* ==== [ANCRE: GAINS_QUI_MONTENT_REELLEMENT] — item demandé : "enlever les
     16 → 16, montrer ce qui monte réellement". Un gain interne (échelle
     1-100) ne fait pas toujours bouger la note affichée sur 20 : la carte
     listait alors des lignes "16 → 16" et "20 (déjà au max)" qui occupent
     de la place pour dire qu'il ne se passe rien. Ces lignes sont retirées,
     il ne reste que les attributs dont la note change vraiment. Si aucune
     ne bouge, une mention courte remplace la liste — mieux qu'une carte
     muette qui laisserait croire à un bug. ==== */
  const shown=Object.entries(fx).map(([k,v])=>{
    const label=(ALL_ATTR.find(a=>a[0]===k)||[k,k])[1];
    const scaled=Math.round(v/5);
    if(!f || v<=0 || !f.attrs || f.attrs[k]===undefined) return `${scaled>=0?'+':''}${scaled} ${label}`;
    let cap=(f.maxAttrs && f.maxAttrs[k]!=null) ? f.maxAttrs[k] : f.potential+4;
    if(f.agedCeilings && f.agedCeilings[k]!=null) cap=Math.min(cap, f.agedCeilings[k]);
    const before=f.attrs[k];
    if(before>=cap) return '';
    const after=Math.min(before+v, cap);
    if(d20(before)===d20(after)) return '';
    return `${label} ${d20(before)} → ${d20(after)}`;
  }).filter(Boolean);
  return shown.length?shown.join(', '):'Progression légère';
}
/* ==== [FIN ANCRE] ==== */
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
   ${(()=>{
     const byRar={C:0,R:0,E:0,L:0,M:0};
     unlocked.forEach(id=>{ const s=SKILLS.find(x=>x.id===id); if(s) byRar[s.rar]=(byRar[s.rar]||0)+1; });
     const meta=loadMetaStats();
     /* ==== [ANCRE: ANALYTICS_LOCALES_CODEX] — chantier 2 : le panneau existant
        n'affichait que 2 chiffres (retraites, combats totaux). getAnalytics()
        (state.js) réutilise le MÊME registre (META_STATS_KEY) enrichi par
        recordCareerStart()/updateMetaStatsOnRetirement() — aucune 2e source de
        vérité, juste plus de champs à afficher ici. 100% local, déjà agrégé
        (aucune donnée personnelle au-delà de ce que le Codex montrait déjà). */
     const an=getAnalytics();
     const topDiv=Object.entries(an.divisions).sort((a,b)=>(b[1].careers||0)-(a[1].careers||0))[0];
     const topDivName=topDiv?((divById(topDiv[0])||{}).name||topDiv[0]):null;
     return `<div class="card mb glass" style="border-left:3px solid var(--gold);background:var(--panel2);padding:12px">
       <div class="eyebrow mb" style="color:var(--gold)">Codex Inter-carrières — statistiques cumulées</div>
       <div class="tagrow">
         <span class="tag2" style="border-color:${RAR_COLORS.C};color:${RAR_COLORS.C}">${byRar.C} Communes</span>
         <span class="tag2" style="border-color:${RAR_COLORS.R};color:${RAR_COLORS.R}">${byRar.R} Rares</span>
         <span class="tag2" style="border-color:${RAR_COLORS.E};color:${RAR_COLORS.E}">${byRar.E} Épiques</span>
         <span class="tag2" style="border-color:${RAR_COLORS.L};color:${RAR_COLORS.L}">${byRar.L} Légendaires</span>
         <span class="tag2" style="border-color:${RAR_COLORS.M};color:${RAR_COLORS.M}">${byRar.M} Mythiques</span>
       </div>
       <div class="muted small mt">${meta.totalRetirements||0} carrière(s) retraitée(s) sur ${an.careersStarted} commencée(s) · ${meta.totalFights||0} combat(s) au total, toutes carrières confondues.</div>
       <div class="muted small mt">Bilan cumulé : ${an.totalWins}V - ${an.totalLosses}D - ${an.totalDraws}N · ${an.koPct}% KO, ${an.subPct}% soumission, ${an.decPct}% décision.</div>
       <div class="muted small mt">Meilleure série : ${an.bestWinStreak} victoire(s) · Plus longue carrière : ${an.longestCareerFights} combat(s) · Record Overall : ${an.highestOverall} · Record Elo : ${an.highestElo}.</div>
       ${topDivName?`<div class="muted small mt">Division favorite : ${esc(topDivName)} (${topDiv[1].careers} carrière(s)).</div>`:''}
     </div>`;
   })()}
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
   ${SCENARIOS.map(s=>{
     return `<div class="opp" onclick="CL.pickScenario('${s.id}')">
     <div class="opp-top"><span class="opp-nm gold">${s.name}</span></div>
     <div class="opp-read" style="margin-top:4px;opacity:1">${s.desc}</div></div>`;
   }).join('')}
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
     <button class="btn ghost mt" onclick="CL.go('hof')">Annuler</button>
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
