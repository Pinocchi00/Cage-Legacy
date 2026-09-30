"use strict";
/* CAGE LEGACY — js/ui-06-career-screens.js
   ============================================================================
   Fichier 6/8 issu du découpage de l'ancien ui.js monolithique (~400 Ko).
   Écrans principaux de la carrière : titre, création de personnage, vestiaire, sélection d'adversaire, plan de combat, fiche de résultat, classement.

   IMPORTANT : ce découpage préserve l'ORDRE EXACT du code d'origine — aucune
   fonction n'a été déplacée ou réordonnée, seules des frontières de fichier
   ont été insérées à des points sûrs (toujours juste avant une déclaration de
   premier niveau, jamais au milieu d'une fonction ou d'un objet). Tous ces
   fichiers partagent la même portée globale que l'ancien ui.js (variables et
   fonctions visibles d'un fichier à l'autre, comme avant), il faut donc les
   charger dans l'ordre indiqué dans index.html : 01, 02, 03... jusqu'à 08.
   ============================================================================ */

/* ==== [ANCRE: ESCJS_ATTR_ONCLICK] — décision d'Anthony du 28/09/2026 : un
   nom avec apostrophe (O'Connor, généré ou saisi) passe par esc() et devient
   &#39; — dans un attribut onclick, l'analyseur HTML le redécode en '
   et casse la chaîne JS de l'attribut. Aucun nom n'est aujourd'hui injecté
   dans un onclick (vérifié : les trois seules interpolations de valeur libre
   sont ci-dessous — surnoms suggérés, libellés de style et de division du
   Panthéon) ; ce helper rend l'anti-pattern impossible : échappement JS
   d'abord (backslash devant ' et \), esc() ensuite pour l'attribut — le
   navigateur redécode &#39; en \' que le parseur JS lit comme une apostrophe
   échappée. Sert UNIQUEMENT dans un attribut onclick à valeur de chaîne. ==== */
function escJsAttr(s){ return esc((''+s).replace(/\\/g,'\\\\').replace(/'/g,"\\'")); }
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: PROCHAIN_OBJECTIF] — retour utilisateur : l'encart prenait
   trop de place et restait affiché en permanence. Il ne sert plus qu'à
   l'amorçage — tant que le joueur n'a lancé aucune run — et disparaît de
   lui-même dès la première terminée (nextObjective() renvoie null au-delà).
   Format resserré : une ligne de titre, une d'explication, un bouton. ==== */
function nextObjectiveBlock(){
  return "";
}
/* ==== [ANCRE: TITRE_SANS_NOTIFICATIONS] — T8a porte l'accueil 01 en
   conservant ce correctif : les notifications de partie sont consommées SANS être
   affichées — elles concernent l'écran d'où vient l'action, pas l'accueil —
   et seule l'erreur de lien de légende partagé, posée au démarrage par
   main.js dans G.bootMsg, reste visible. ==== */
function scr_title(){
  /* ==== [ANCRE: LOT4_T8A_ACCUEIL_01] — T8a, maquette 01 : quatre entrées,
     reprise management et faits réels. Lecture validée, sans charger une
     partie dans G et sans stocker les textes dérivés. ==== */
  const m=titleMgmtState(), upcoming=titleMgmtUpcoming(m);
  const management=m?`Split ${m.cycle} · ${mgmtCardLabel(m)}`:'Split — matchmaker';
  G.lastMsg=null;
  const boot=G.bootMsg;G.bootMsg=null;
  return `<div class="scr title-screen"><div class="title-grid${m?'':' title-no-save'}">
    <main class="title-main">
      <!-- ==== [ANCRE: V3_TITRE_PROMESSE] — T8a : hiérarchie du titre portée
           de 01 ; la promesse d'origine n'est plus un bandeau. ==== -->
      <div><div class="title-brand"><span class="title-oct" aria-hidden="true"></span><span>${esc(MGMT_ORG)} MMA</span></div>
        <h1>CAGE<br>LEGACY</h1></div>
      ${boot?`<p class="title-message" role="alert">${esc(boot)}</p>`:''}
      <!-- ==== [ANCRE: V3_MODES_PROMESSE] — T8a : descriptions existantes,
           aucune phrase d'exemple de la maquette. ==== -->
      <nav class="title-modes" aria-label="Modes de jeu">
        <!-- ==== [ANCRE: MGMT_LOT1_ENTREE] — même entrée validée. ==== -->
        <button class="title-mode title-management" onclick="CL.mgmtEnter()"><strong>Management</strong><span>${esc(management)}</span></button>
        <button class="title-mode" onclick="CL.go('intro')"><strong>Carrière</strong><span>Montez les échelons, un combat à la fois</span></button>
        <button class="title-mode" onclick="CL.duelEnter()"><strong>Duel entre amis</strong><span>Affronte deux légendes de ton Panthéon</span></button>
        <button class="title-mode" onclick="CL.go('hof')"><strong>Panthéon</strong><span>Toutes les légendes retraitées</span></button>
      </nav>
      <nav class="title-utils" aria-label="Archives"><button onclick="CL.go('ach')">Succès</button></nav>
    </main>
    ${m?`<aside class="title-aside" aria-label="Partie management">
      ${titleMgmtLastEvent(m)}
      ${upcoming.length?`<section class="title-upcoming"><h2>Ce qui t'attend</h2><p>${upcoming.map(esc).join('<br>')}</p></section>`:''}
      <button class="title-resume" onclick="CL.mgmtEnter()"><span>Reprendre</span></button>
    </aside>`:''}
  </div></div>`;
}

function titleMgmtState(){
  if(G&&G.mgmt&&validateMgmt(G.mgmt)) return G.mgmt;
  try{
    for(const key of [MGMT_KEY,MGMT_BACKUP_KEY]){
      const m=mgmtParseAndValidate(localStorage.getItem(key));
      if(m) return m;
    }
  }catch(e){}
  return null;
}

function titleMgmtUpcoming(m){
  if(!m) return [];
  const facts=[];
  if(m.card){
    const free=Math.max(0,m.card.sizeMain-m.card.main.length);
    if(free) facts.push(`${free} place${free===1?'':'s'} libre${free===1?'':'s'} en carte principale de Split ${m.cycle}.`);
  }
  const open=mgmtOpenCount(m);
  if(open) facts.push(mgmtOpenLabel(open)+'.');
  return facts;
}

function titleMgmtLastEvent(m){
  const e=m&&m.lastEvent;
  if(!e||!e.fights.length) return '';
  const rows=e.fights.map(x=>{
    const trace=(m.hist||[]).find(t=>t.c===e.cycle&&t.a.id===x.a&&t.b.id===x.b);
    const a=trace?trace.a:mgmtFighterById(m,x.a),b=trace?trace.b:mgmtFighterById(m,x.b);
    if(!a||!b) return '';
    const result=x.winner==='D'?`${a.name} contre ${b.name} : nul`
      :`${x.winner==='A'?a.name:b.name} bat ${x.winner==='A'?b.name:a.name}`;
    const method=MGMT_FAMILY_LABELS[x.family]||'';
    return `<li>${esc(result)} · ${esc(method)} · round ${esc(x.round)}</li>`;
  }).filter(Boolean);
  if(!rows.length) return '';
  return `<section class="title-last"><h2>La dernière soirée</h2><div class="title-event">
    <h3>Split ${esc(e.cycle)}</h3><ul>${rows.slice(0,3).join('')}</ul>
    ${rows.length>3?`<details><summary>Tous les résultats (${rows.length})</summary><ul>${rows.slice(3).join('')}</ul></details>`:''}
  </div></section>`;
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
   <button class="btn primary" onclick="CL.create()">Débuter la carrière</button>
   <button class="btn ghost" onclick="CL.go('intro')">Retour</button></div>`; }

function scr_pro_nickname(){
  const f=G.f;
  if(!G._proNickDraft) G._proNickDraft = f.nick || earnNickname(f);
  const s1 = earnNickname(f), s2 = earnNickname(f), s3 = earnNickname(f);
  const uniqueSugg = [...new Set([s1, s2, s3])].filter(Boolean).slice(0, 3);
  return `<div class="scr center intro">
    <div class="eyebrow gold">Passage Professionnel // Surnom</div>
    <h2 class="disp" style="font-size:clamp(22px,6vw,30px);margin-top:4px">C'est le moment de choisir ton surnom</h2>
    <p class="lede mt">Le speaker a besoin de quelque chose à crier au micro avant que le combat commence.</p>
    <div class="card" style="text-align:left;background:var(--panel2);border:1px solid var(--line);padding:16px;margin:20px 0">
      <div class="fld" style="margin-bottom:12px">
        <label class="eyebrow" style="display:block;margin-bottom:6px">Ton Surnom</label>
        <input id="pro-nick-input" type="text" maxlength="25" value="${esc(G._proNickDraft||'')}" style="width:100%;box-sizing:border-box;background:var(--bg);border:1px solid var(--line);color:var(--text);padding:12px;font-family:var(--mgmt-font-body);font-style:italic;font-size:16px" oninput="G._proNickDraft=this.value"/>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <span class="eyebrow" style="font-size:10px">Idées :</span>
        <button class="tag2" style="background:var(--bg);border-color:var(--gold);color:var(--gold);cursor:pointer;padding:6px 12px" onclick="G._proNickDraft=rollRandomNickname();render();">🎲 Aléatoire</button>
      </div>
      <div class="tagrow" style="margin:0">
        ${uniqueSugg.map(s=>`<button class="tag2" style="cursor:pointer" onclick="G._proNickDraft='${escJsAttr(s)}';render();">« ${esc(s)} »</button>`).join('')}
      </div>
    </div>
    <button class="btn primary" style="font-size:18px;padding:16px" onclick="CL.confirmProNickname(G._proNickDraft)">Valider & Entrer chez les Pros</button>
  </div>`;
}

/* ==== [ANCRE: LOT4_T8B_PREPARATION_LUE] — Lot 4 T8b : trace de navigation
   non sauvegardée. Seuls camp/plan prouvent qu'un combat est en préparation ;
   G.sel/G.train/G.fight seuls peuvent encore décrire le combat précédent.
   Aucun tirage, aucune offre créée par le rendu, aucun calendrier inventé. ==== */
let careerHubPreparation=null;
function careerTrackPreparation(screen){
  if(!G||!G.f){ careerHubPreparation=null; return; }
  if(screen==='camp'||screen==='plan'){
    careerHubPreparation={screen,f:G.f,sel:G.sel,fight:G.fight,
      count:G.f.W+G.f.L+(G.f.D||0),age:G.f.age,org:G.f.org,div:G.f.div};
  }else if(!['hub','opponent_card','profile','rankings','history','beltLineage','ach','hof','ach_preview'].includes(screen)){
    careerHubPreparation=null;
  }
  if(G.f.injury||G.f.retired) careerHubPreparation=null;
}
function careerCurrentPreparation(){
  const p=careerHubPreparation,f=G.f;
  if(!p||p.f!==f||p.sel!==G.sel||p.count!==f.W+f.L+(f.D||0)
    ||p.age!==f.age||p.org!==f.org||p.div!==f.div||f.injury||f.retired) return null;
  if(p.screen==='camp') return G.sel&&G.sel.o&&G.train&&G.train.length?p:null;
  return p.fight===G.fight&&G.fight&&G.fight.opp&&!G.fight._resolved?p:null;
}
function careerRecordText(f){ return `${f.W}-${f.L}${f.D?'-'+f.D:''}`; }
/* ==== [FIN ANCRE] ==== */

function scr_hub(){ const f=G.f;
  // ==== [ANCRE: CORRECTIF_COULEUR_MESSAGE] — bug trouvé : un seul message
  // ("sponsor validé") était reconnu comme positif ; TOUS les autres
  // messages, y compris clairement positifs (ex. "Contrat renouvelé"),
  // s'affichaient donc en rouge par défaut. Classification élargie par
  // mots-clés, avec un ton neutre (doré) par défaut plutôt que négatif.
  // « sponsor validé » retiré de la liste — Lot C01/2026 §C10b :
  // l'objectif sponsor qui produisait ce message a été supprimé.
  const msgLower=(G.lastMsg||'').toLowerCase();
  const POSITIVE_HINTS=['renouvelé','copié','remporté','accepté','testamentaire actif','débloqué avec succès','victoire','succès','signé'];
  const NEGATIVE_HINTS=['refus','annulé','insuffisant','invalide','corrompu','impossible','ratée','échec','mauvaise impression','interdit','critique'];
  const isGoodMsg=POSITIVE_HINTS.some(k=>msgLower.includes(k));
  const isBadMsg=!isGoodMsg && NEGATIVE_HINTS.some(k=>msgLower.includes(k));
  const msgColor=isGoodMsg?'var(--win)':isBadMsg?'var(--loss)':'var(--gold)';
   const msgHtml=G.lastMsg?`<p class="career-message" role="status" style="color:${msgColor}">${esc(G.lastMsg)}</p>`:'';
   if(G.lastMsg) G.lastMsg=null;
   /* ==== [ANCRE: LOT4_T8B_CARRIERE_10] — maquette 10, §1/§4 bis : identité,
      finitions et séries déjà acquises, préparation active et historique.
      Ni presse ni coach ni semaine ni agent n'existent sur ce hub. ==== */
   const prep=careerCurrentPreparation();
   const opponent=prep?(prep.screen==='plan'?G.fight.opp:G.sel.o):null;
   const history=hubCombatHtml(f);
   const evolution=[];
   if(f.styleLabel) evolution.push(f.styleLabel);
   if(f.ko||f.sub||f.dec) evolution.push(`${f.ko||0} KO/TKO · ${f.sub||0} soumission${f.sub===1?'':'s'} · ${f.dec||0} décision${f.dec===1?'':'s'}`);
   if(f.streak>=3) evolution.push(`${f.streak} victoires d’affilée`);
   if(f.streak<=-2) evolution.push(`${Math.abs(f.streak)} défaites d’affilée`);
   if(f.signatureMove&&f.signatureMove.name) evolution.push(`Mouvement signature : ${f.signatureMove.name}${f.signatureMove.customSuffix?' '+f.signatureMove.customSuffix:''}`);
    /* T8b reprise : additif par défaut, moral et forme restent lisibles
       en texte avec leur échelle d20 existante, sans barre. */
    const state=[`Moral ${d20(f.morale)}/20 · Forme ${d20(f.form)}/20`];
   if(f.injury) state.push(`${f.injury.name} · convalescence : ${f.injury.left} cycle${f.injury.left===1?'':'s'}`);
   if(f.retired) state.push('Carrière terminée');
   const cut=prep&&prep.screen==='plan'&&G.fight.cutResult;
   if(cut&&Number.isFinite(cut.walk)&&Number.isFinite(cut.limit)) state.push(`Poids à la pesée : ${cut.walk.toFixed(1)} kg · limite : ${cut.limit.toFixed(1)} kg`);
    const hasMiddle=!!(opponent||history);
   const fightAction=f.injury?'<button class="career-primary" onclick="CL.recoverInjury()">Laisser le corps récupérer</button>'
     :f.retired?'':prep?`<button class="career-primary" onclick="CL.go('${prep.screen}')">${prep.screen==='plan'?'Aller au combat':'Continuer le camp'}</button>`
     :'<button class="career-primary" onclick="CL.fightSelect()">Choisir un combat</button>';
   return `<div class="scr career-screen"><header class="career-header">
     <div class="career-heading"><button class="career-home" onclick="CL.go('title')" aria-label="Retour au menu principal"><span aria-hidden="true"></span></button><span>Carrière</span></div>
     <span class="career-context">${esc(orgDisplayName(f))}${G.season&&G.season.year?` · année ${esc(G.season.year)}`:''}</span>${fightAction}
    </header>${msgHtml}<div class="career-columns${hasMiddle?'':' career-no-middle'}">
   <section class="career-identity"><div><h1>Ton combattant</h1><div class="career-name">${esc(f.name)} ${esc(f.flag||'')}${f.nick?` « ${esc(f.nick)} »`:''}</div>
     <p class="career-meta">${esc(f.divName)} · ${esc(f.age)} ans · ${esc(careerRecordText(f))}${f.stage==='amateur'?' · amateur':''}</p>
     ${f.champion?`<p class="career-meta">Champion · ${esc(orgDisplayName(f))}</p>`:f.W+f.L+(f.D||0)>0?`<p class="career-meta">Rang #${esc(divRank(f))}</p>`:''}
     ${f.org>0&&f.contract?`<p class="career-meta">${esc(contractFightsLeftLabel(f.contract))}</p>`:''}
     ${f.stage==='pro'&&f.amaRec?`<p class="career-meta">Amateur : ${esc(f.amaRec.W)}-${esc(f.amaRec.L)}</p>`:''}
     <p class="career-meta">Gains en carrière : ${esc(formatArgent(f.earnings))}</p></div>
     ${evolution.length?`<section class="career-block"><h2>Ce que tu es devenu</h2><p class="career-evolution">${evolution.map(esc).join('<br>')}</p></section>`:''}
     ${prep&&prep.screen==='camp'?`<section class="career-block career-camp"><h2>Le camp de cette semaine</h2><div class="career-training">${G.train.map((t,i)=>`<button onclick="CL.train(${i})">${esc(t.label)}</button>`).join('')}</div><button class="career-link" onclick="CL.go('camp')">Voir les détails du camp</button></section>`:''}
     <!-- ==== [ANCRE: HUB_SOUS_MENUS] — Lot P3/2026, remplacé par T8b :
          historique au centre ; les six accès Dossier restent au déroulé. ==== -->
     <details class="career-dossier"><summary>Dossier</summary>${hubDossierHtml()}</details>
     ${!f.retired?'<button class="career-link career-retire" onclick="CL.go(\'retire\')">Déclarer la retraite (définitif)</button>':''}
   </section>
   ${hasMiddle?`<section class="career-main">
     ${opponent?`<section class="career-block"><h2>Ton prochain combat</h2><div class="career-next"><span class="career-meta">${esc(orgDisplayName(f))} · ${prep.screen==='camp'?'camp de préparation':'plan de combat'}</span><h3>Contre ${esc(opponent.name)}</h3><p>${esc(careerRecordText(opponent))}${opponent.styleLabel?' · '+esc(opponent.styleLabel):''}${opponent.age?' · '+esc(opponent.age)+' ans':''}</p><button class="career-link" onclick="CL.viewCareerOpponent('${escJsAttr(opponent.id)}','hub')">Étudier ses combats</button></div></section>`:''}
     ${history?`<section class="career-block"><h2>Ta carrière</h2>${history}${f.history.length>5?'<button class="career-link" onclick="CL.go(\'history\')">Toutes les archives</button>':''}</section>`:''}
   </section>`:''}
    <aside class="career-aside"><section class="career-block"><h2>Ton état</h2><p>${state.map(esc).join('<br>')}</p></section></aside>
   </div></div>`;
}
/* ==== [ANCRE: HUB_SOUS_MENUS_HELPERS] — Lot P3/2026, porté par T8b :
   historique partagé, cinq lignes, grille 90px / minmax(0,1fr) de 10. ==== */
/** Sous-menu Combat du hub : les 5 derniers combats de f.history, du plus
 * récent au plus ancien, un par ligne (pas de carte). Une sauvegarde
 * ancienne peut porter des entrées sans oppNick/oppRank/time (ajoutés au
 * Lot P3/2026, cf. engine-combat.js applyResult()) : chaque champ absent
 * disparaît de l'affichage plutôt que d'imprimer "undefined".
 * @param {Fighter} f @returns {string} */
function hubCombatHtml(f){
  const h=(f.history||[]).slice(-5).reverse();
   if(!h.length) return '';
  const rows=h.map((e,i)=>{
    const resLabel=e.res==='win'?'Victoire':e.res==='loss'?'Défaite':'Nul';
     const resClass=e.res==='win'?'career-win':e.res==='loss'?'career-loss':'career-draw';
    const method=e.method||'';
    let methodLine=method;
    if(!isDecisionLike(method) && method){
      methodLine=method;
      if(e.round) methodLine+=` · R${e.round}`;
      if(e.time) methodLine+=` · ${e.time}`;
     }
     const nickHtml=e.oppNick?` « ${esc(e.oppNick)} »`:'';
     const rankHtml=e.oppRank?` · RANG #${esc(e.oppRank)}`:'';
     const last=i===h.length-1;
     return `<div class="career-history-row${last?' career-history-last':''}"><span class="career-result ${resClass}">${resLabel}</span><div>contre ${esc(e.oppName||'')}${nickHtml}${e.oppFlag?' '+esc(e.oppFlag):''}${methodLine?', '+esc(methodLine):''}${rankHtml}</div></div>`;
   }).join('');
   return `<div class="career-history">${rows}</div>`;
}
/** Sous-menu Dossier du hub : les six écrans annexes de carrière, en grille
 * 2 colonnes. Mêmes cibles de navigation que l'ancienne grille à six
 * boutons (ANCRE HUB_GRILLE, retirée). @returns {string} */
function hubDossierHtml(){
   const tile=(label,target)=>`<button class="career-link" onclick="CL.go('${target}')">${label}</button>`;
  return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
    ${tile('Bilan technique','profile')}${tile('Classements','rankings')}
    ${tile('Palmarès','ach')}${tile('Archives','history')}
    ${tile('Ceintures','beltLineage')}${tile('Panthéon','hof')}
  </div>`;
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: LOT4_T8B_FICHE_ADVERSAIRE] — réparation du lien des deux
   classements. Même identité et même historique que le hub, lecture seule.
   Les PNJ peuvent n'avoir aucun historique : aucun combat n'est fabriqué. ==== */
function careerOpponentById(id){
  const candidates=[...(G.roster||[]),...(G.opps||[]).map(e=>e.o),G.sel&&G.sel.o,G.fight&&G.fight.opp];
  return candidates.find(o=>o&&String(o.id)===String(id))||null;
}
function scr_opponent_card(){
  const o=careerOpponentById(G._oppCardId),back=G._oppCardReturn==='rankings'?'rankings':'hub';
  const returnButton=`<button class="career-link" onclick="CL.go('${back}')">Retour ${back==='rankings'?'aux classements':'à la carrière'}</button>`;
  if(!o) return `<div class="scr career-screen"><p>Combattant introuvable.</p>${returnButton}</div>`;
  const history=hubCombatHtml(o);
  return `<div class="scr career-screen career-opponent"><header class="career-header"><div class="career-heading">Fiche combattant</div>${returnButton}</header><div class="career-opponent-columns"><section class="career-identity"><div><h1>${esc(o.name)}</h1>${o.nick?`<p>« ${esc(o.nick)} »</p>`:''}<p class="career-meta">${esc(o.flag||'')} ${esc(o.divName)} · ${esc(o.age)} ans · ${esc(careerRecordText(o))}</p>${o.styleLabel?`<p>${esc(o.styleLabel)}</p>`:''}</div>${o.phys?`<p>${esc(o.phys.height)} cm · allonge ${esc(o.phys.reach)} cm · ${o.phys.stance==='southpaw'?'garde gauchère':'garde orthodoxe'}</p>`:''}</section>${history?`<section class="career-block"><h2>Ses derniers combats</h2>${history}</section>`:''}</div></div>`;
}
/* ==== [FIN ANCRE] ==== */

function scr_select(){ const f=G.f;
  let h=`<div class="scr">
   <div class="bar" style="border-bottom:2px solid var(--line);margin-bottom:24px;padding-bottom:8px">
     <span class="eyebrow mono">BUREAU DU MATCHMAKER // ${orgDisplayName(f).toUpperCase()}</span>
   </div>
   <p class="lede" style="margin-bottom:32px;font-size:15px">Analysez les profils et signez le contrat. L\u2019ordre des propositions dicte le niveau de risque et la récompense au classement.</p>
   <div class="stagger">`;
  G.opps.forEach((e,i)=>{ const o=e.o;
    const isRival=(f.rivalId===o.id); const isAmaRival=(!isRival && o.isAmateurRival);
    const rnk=divRank(o); const fightsTot=o.W+o.L+(o.D||0);
    const rTag=o.champion?'CHAMPION':(fightsTot===0?'NON CLASSÉ':(rnk===1?'CHALLENGER #1':`RANG #${rnk}`));

    // ==== [ANCRE: MATCHMAKING_ROLES] — l'archétype (mêmes 3 adversaires que
    // genOpponents() proposait déjà) est désormais calculé UNE FOIS dans
    // genOpponents() (matchmakingRole(), ui-02) et figé sur l'entrée (e.mm),
    // plutôt que recalculé à chaque render() : garantit la cohérence entre
    // ce qui est affiché ici et ce que resolveFight() utilise réellement
    // (voir CREDIBILITE_PRODIGE, ui-05). Filet de sécurité conservé pour les
    // entrées qui n'en auraient pas (ex. sauvegarde ancienne rechargée).
    const mmData=e.mm||matchmakingRole(f,o,e);
    const mmRole=mmData.label, mmReward=mmData.reward, roleColor=mmData.color;


    // ==== [ANCRE: COMPARATIF_STATS_REUTILISABLE] — factorisé dans statComparisonHtml() ====
    h+=`<div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--line);padding:16px;margin-bottom:20px">
      <div style="border-left:3px solid ${roleColor};padding-left:12px;margin-bottom:16px">
         <div class="disp" style="font-size:18px;color:${roleColor};line-height:1">${mmRole.toUpperCase()}</div>
         <div class="mono small muted" style="margin-top:4px">${mmReward}</div>
      </div>
      <div class="meta-strip"><div><span>Record</span><b style="white-space:nowrap">${recordStr(o)}</b></div>${o.amaRec?`<div><span>Amateur</span><b style="white-space:nowrap">${o.amaRec.W}-${o.amaRec.L}</b></div>`:''}<div><span>Mensurations</span><b style="white-space:nowrap">${o.phys.height}cm / ${o.phys.reach}cm</b></div></div>
      <!-- ==== [ANCRE: CORRECTIF_SURNOM_MATCHMAKING] — Lot C01/2026 §C14a :
           surnom inséré comme sur la fiche joueur (scr_hub), absent ici
           jusqu'à présent. ==== -->
      <div class="hero-name" style="${isRival?'color:var(--blood)':''}">${esc(o.name)} ${o.flag}<em>${o.nick?`« ${esc(o.nick)} » — `:''}${o.styleLabel}, ${o.age} ans</em></div>
      <div class="tagrow">
        ${e.context?`<span class="tag2 hot gold-fill">${e.context}</span>`:''}
        ${isRival?'<span class="tag2" style="color:var(--bg);background:var(--blood);border-color:var(--blood)">RIVALITÉ ACTIVE</span>':''}
        ${isAmaRival?'<span class="tag2" style="color:var(--sage);border-color:var(--sage)">RIVAL AMATEUR</span>':''}
        <span class="tag2 hot">${rTag}</span>
      </div>
      ${statComparisonHtml(f,o)}
      <p class="event-text mono" style="font-size:11.5px;opacity:.85;margin:14px 0 0;position:relative;z-index:2;border-left:2px solid var(--gold);padding-left:10px">ANALYSE : ${e.read}</p>
      <button class="btn ${isRival?'primary':''}" style="margin-top:14px;font-size:15px;letter-spacing:.05em;position:relative;z-index:2" onclick="CL.opp(${i})">${isRival?'RÉGLER SES COMPTES':'ACCEPTER LE COMBAT'}</button>
    </div>`;
  });
  h+=`</div><button class="btn ghost mt" style="border:none" onclick="CL.go('hub')">← Retour au vestiaire</button></div>`;
  return h;
}

/* ==== [ANCRE: PRESS_CONF_ECRAN] — écran dédié, plutôt qu'une carte noyée
   dans le vestiaire (le joueur passait complètement à côté). ==== */
function scr_press_conf(){
  const pc=G.pressConf;
  if(!pc) return `<div class="scr center intro"><p class="lede">Rien à signaler.</p><button class="btn ghost mt" onclick="CL.go('camp')">Continuer</button></div>`;
  return `<div class="scr center intro">
    <div class="eyebrow blood">Médiatisation</div>
    <h2 class="disp">${pc.title}</h2>
    <div class="glass card" style="background:var(--panel2);text-align:left;padding:16px;margin:20px 0;border-left:3px solid var(--blood)">
      <p class="lede" style="margin:0">${pc.text}</p>
    </div>
    <div class="tagrow" style="justify-content:center;margin-bottom:24px">
      ${(()=>{ const shown=Math.sign(pc.moraleEffect)*Math.max(1,Math.round(Math.abs(pc.moraleEffect)/5));
        return `<span class="tag2 hot" style="color:${shown>=0?'var(--win)':'var(--loss)'};border-color:${shown>=0?'var(--win)':'var(--loss)'}">${shown>=0?'+':''}${shown} Moral</span>`; })()}
    </div>
    <button class="btn primary" onclick="G.pressConf=null; CL.go('camp')">Continuer vers le camp d\u2019entraînement</button>
  </div>`;
}
/* ==== [FIN ANCRE] ==== */
function scr_camp(){ const f=G.f;
  const deltaHtml=d=>d.map(([k,v])=>{ const lbl=k==='morale'?'Moral':k==='form'?'Forme':attrLabel(k);
     const vague=(k==='morale'||k==='form')?(v>0?`+${lbl}`:`-${lbl}`):(v>0?`Potentiel : ${lbl} ↑`:`Potentiel : ${lbl} ↓`);
     return `<span class="dlt ${v>=0?'up':'dn'}">${vague}</span>`; }).join('');
  const curTier=G.selectedCampTier||'gratuit';
  const activeTier=CAMP_TIERS.find(t=>t.id===curTier)||CAMP_TIERS[0];
  let tierDesc='';
  if(activeTier.id==='gratuit') tierDesc='Aucun coût financier. <span style="color:var(--loss)">Risque de blessure de 5%</span> (-15% Forme, -10% Moral).';
  else if(activeTier.id==='premium') tierDesc='Coût : 15k$. <span style="color:var(--win)">Zéro risque de blessure. Bonus garanti : +3% Forme, +3% Moral.</span>';
  else if(activeTier.id==='sparring') tierDesc='Coût : 35k$. <span style="color:var(--win)">Zéro risque. Bonus : +3% Forme.</span> L\u2019adversaire subira un malus tactique (-3 Adapt., -2 QI).';
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
/* ==== [ANCRE: V3_REGLAGES_SUPPRIMES] — Plan V3 LOT 1 §P07, arbitrage A4 :
   l'écran Réglages (V2-44) et son bloc Rythme de combat (V2-28,
   combatPaceToggleBlock(), qui vivait aussi ici dans scr_plan) sont
   supprimés du menu. Le rythme n'est plus un réglage joueur : il est forcé
   à l'entrée de la carrière (forceFightPaceForMode(), ui-08-controller-
   arena.js — toujours 'rapide', seul le mode Carrière Complète existe).
   Mise à jour Lot 6/P8 §6.3 : les moments de bascule (basculeEnabled), qui
   avaient déjà perdu leur seul point d'accès joueur ici, ont depuis été
   retirés du jeu en entier (ancre P8_L6_BASCULE_SUPPRIMEE, ui-09-arena.js) —
   `G.settings.basculeEnabled` n'est plus lu nulle part, mais la clé reste
   tolérée telle quelle par `validateState()` (state/state-validation.js)
   pour ne jamais faire échouer le chargement d'une sauvegarde qui la
   contiendrait encore. ==== */
function scr_plan(){ const f=G.f, opp=G.fight.opp; const plans=TACTICS[f.style]||[];
  const cr=G.fight.cutResult||{tier:'normal',effPct:0,kg:0,walk:(divById(G.f.div)?divById(G.f.div).kg:70),limit:(divById(G.f.div)?divById(G.f.div).kg:70)};
  const step=G.fight.planStep||1;
  /* ==== [ANCRE: V4_C18_CUTTING_TEXTENGINE] — Plan V4 LOT 7 §C18 : les quatre
     gabarits ci-dessous codaient chacun une seule phrase d'ambiance en dur,
     revue identique à chaque combat. Migré vers txtPick/FAITH_CUTTING_LINES
     (data-faith-content.js) — le HTML, les chiffres (poids/kg/%) et les
     effets (bonus/malus) restent des littéraux inchangés juste en dessous,
     seule la ligne d'ambiance change de source. ctx.thirdComplique/
     ctx.divDescended sont lus sur f.history (cutTier/div posés par
     resolveFight(), ui-05, ANCRE V4_C18_CUT_HISTORY) — jamais recalculés
     ailleurs, jamais dupliqués. */
  const cutLine = (cr.tier === 'sans_effort') ? "La balance valide le poids sans une goutte de sueur." : (cr.tier === 'facile') ? "Un cutting propre, l'énergie est intacte." : (cr.tier === 'normal') ? "La routine habituelle des pesées." : "Le corps a souffert pour faire le poids.";
  const wcHtml={
    sans_effort:`<div class="card mt" style="border-left:3px solid var(--sage);padding-left:14px"><div class="eyebrow mb" style="color:var(--sage)">Pesée sans effort</div>
      <div class="mono small" style="margin-top:6px">Poids actuel : <b>${cr.walk.toFixed(1)}kg</b> <span class="muted">(limite ${cr.limit}kg)</span></div>
      <div class="small muted" style="margin-top:8px">${cutLine}</div>
      <div class="small" style="color:var(--sage);font-weight:bold;margin-top:4px">Bonus ce soir : cardio et solidité.</div></div>`,
    facile:`<div class="card mt" style="border-left:3px solid var(--sage);padding-left:14px"><div class="eyebrow mb" style="color:var(--sage)">Cutting facile</div>
      <div class="mono small" style="margin-top:6px">Poids actuel : <b>${cr.walk.toFixed(1)}kg</b> <span class="muted">(limite ${cr.limit}kg)</span></div>
      <div class="mono small" style="margin-top:2px">À perdre : <b>${cr.kg}kg</b> <span class="muted">(${cr.effPct.toFixed(1)}%)</span></div>
      <div class="small muted" style="margin-top:8px">${cutLine}</div>
      <div class="small muted" style="margin-top:4px">Aucun impact ce soir.</div></div>`,
    normal:`<div class="card mt" style="border-left:3px solid var(--gold);padding-left:14px"><div class="eyebrow gold mb">Cutting normal</div>
      <div class="mono small" style="margin-top:6px">Poids actuel : <b>${cr.walk.toFixed(1)}kg</b> <span class="muted">(limite ${cr.limit}kg)</span></div>
      <div class="mono small" style="margin-top:2px">À perdre : <b>${cr.kg}kg</b> <span class="muted">(${cr.effPct.toFixed(1)}%)</span></div>
      <div class="small muted" style="margin-top:8px">${cutLine}</div>
      <div class="small muted" style="margin-top:4px">Dans la norme du métier, aucun impact.</div></div>`,
    complique:`<div class="card mt glass" style="border-left:3px solid var(--loss);background:var(--panel2);padding-left:14px"><div class="eyebrow mb" style="color:var(--loss)">Cutting compliqué</div>
      <div class="mono small" style="margin-top:6px;position:relative;z-index:2">Poids actuel : <b>${cr.walk.toFixed(1)}kg</b> <span class="muted">(limite ${cr.limit}kg)</span></div>
      <div class="mono small" style="margin-top:2px;position:relative;z-index:2">À perdre : <b>${cr.kg}kg</b> <span class="muted">(${cr.effPct.toFixed(1)}%)</span></div>
      <div class="small muted" style="margin-top:8px;position:relative;z-index:2">${cutLine}</div>
      <div class="small" style="color:var(--loss);font-weight:bold;margin-top:4px;position:relative;z-index:2">Malus ce soir : cardio, force, solidité et menton (déshydratation).</div></div>`,
  }[cr.tier]||'';
  let h=`<div class="scr"><div class="bar"><span class="eyebrow">Vestiaire · Plan de combat</span></div>
   <!-- ==== [ANCRE: CORRECTIF_LIBELLE_COMBAT_PHARE] — Lot C01/2026 §C10c :
        "vedette" retiré des libellés joueur (retour #10, même grief que
        "reprise"). ==== -->
   ${G.fight.isStarFight?`<div class="card mb" style="border-left:3px solid var(--gold);background:var(--panel2);padding:10px"><span class="mono small gold">★ COMBAT PHARE — ta popularité t\u2019offre 5 rounds sous les projecteurs ce soir.</span></div>`:''}
   ${renderFightPoster(f,opp,G.fight.kind)}`;
  if(step===1){
    h+=wcHtml;
    /* ==== [ANCRE: CORRECTIF_LASTMSG_FACEOFF] — Lot C01/2026 §C07 : le
       face-à-face (V2-26/V2-27, trois postures avant le combat) est
       retiré — écran sans conséquence lisible pour le joueur. G.lastMsg
       reste affiché ici pour les autres textes de passage du step 1
       (aucun aujourd'hui après la suppression de l'objectif sponsor,
       §C10b — le bloc reste au cas où un futur texte de passage
       l'utilise, comme documenté à l'origine). ==== */
    if(G.lastMsg){
      h+=`<div class="card mt glass" style="border-left:3px solid var(--text);padding-left:14px;background:var(--panel2)">
       <div class="small">${esc(G.lastMsg)}</div></div>`;
      G.lastMsg=null;
    }
    h+=`<button class="btn primary mt" style="padding:16px;font-size:18px" onclick="G.fight.planStep=2; render();">SUIVANT</button>`;
  } else {
    /* ==== [ANCRE: V2-30] — "le plan de combat, un seul écran" : les deux
       parties utiles, dans l'ordre. 1) Ce qu'on sait de lui (tacticalRead(),
       déjà réel — arme/faille de l'adversaire, jamais un texte générique).
       2) Le plan — TACTICS[f.style] est déjà à 3 entrées par style ;
       .slice(0,3) plafonne pour de bon même quand getExclusiveTactics() en
       ajoute une 4e (règle H.3, pas respectée jusqu'ici sur les rares tags
       physiques exclusifs). La troisième partie « La clé » (un détail
       exploitable gagné hors combat, quasi toujours absent) a été retirée
       — Lot C01/2026 §C01 : elle n'affichait jamais qu'une case vide, sans
       jamais être alimentée par une mécanique de jeu réelle. ==== */
    const combinedTactics=getExclusiveTactics(f).concat(plans).slice(0,3);
    h+=`<div class="card" style="border-color:transparent;padding:0 0 16px 0">
     <div class="eyebrow gold mb" style="letter-spacing:0.2em">CE QU’ON SAIT DE LUI</div>
     <div class="muted small" style="border-left:2px solid var(--gold);padding-left:10px">${tacticalRead(f,opp)}</div>
   </div>
   <div class="eyebrow gold mb" style="letter-spacing:0.2em">LE PLAN</div>
   <p class="lede small">Quelle est ta consigne tactique pour ce combat ? Cela modifiera radicalement ton comportement dans la cage.</p>
   ${combinedTactics.map((p,i)=>`<div class="opp" onclick="CL.choosePlan(${i})">
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
  if(isDecisionLike(res.method)) rows.push(`<div class="log-row gold"><span class="log-r">R${res.round||(res.roundStats&&res.roundStats.length)||3}</span><span style="flex:1">${res.method}${res.detail?' — '+res.detail:''}</span></div>`);
  return `<div class="fight-log" style="max-height:220px;overflow-y:auto;padding-right:5px">${rows.join('')}</div>`; }
/* ==== [FIN ANCRE] ==== */
function scr_hof(){
  /* ==== [ANCRE: LOT4_T8A_PANTHEON_09] — maquette 09 : en-tête chiffré,
     cartes et colonne 460px. Seuls les faits déjà archivés sont rendus.
     legendPoints est lu dans les méta-statistiques, jamais assimilé au
     score de tri d'une légende ; aucune dépense n'existe dans le jeu. ==== */
  const fullList=loadHOF();
  const meta=loadMetaStats();
  const filt=G.hofFilter||{};
  const list=(typeof filterHallOfFame==='function')?filterHallOfFame(filt):fullList;
  const styles=Object.values(STYLES).map(s=>s.label);
  const divisions=[...new Set(DIVISIONS.F.concat(DIVISIONS.H).map(d=>d.name))];
  const modes=[...new Set(fullList.map(f=>f.gameMode||'career'))];
  const modeLabels={career:'Carrière Complète'};
  const showFilters=!!G.showHofFilters;
  const backDest=(G.f && !G.f.retired)?'hub':'title';
  return `<div class="scr hof-screen"><header class="hof-header">
   <div class="hof-heading"><button class="hof-home" onclick="CL.go('${backDest}')" aria-label="Retour au ${backDest==='hub'?'vestiaire':'menu principal'}"><span aria-hidden="true"></span></button><h1>Panthéon</h1></div>
   <div class="hof-totals"><div><strong>${esc(meta.legendPoints.toLocaleString('fr-FR'))}</strong><span>Points de légende</span></div><div><strong>${esc(meta.careersCompleted.toLocaleString('fr-FR'))}</strong><span>Carrières terminées</span></div></div>
   </header><div class="hof-columns"><aside class="hof-aside">
   <!-- ==== [ANCRE: DUEL_ENTREE_PANTHEON] — LOT DUEL-03 : le Duel entre amis
        entre désormais par le Panthéon (le LOT DUEL-02, qui l'avait déplacé
        vers scr_intro(), est annulé) — c'est ici, et nulle part ailleurs,
        que se choisissent les deux légendes du duel. ==== -->
   <button class="hof-action" onclick="CL.duelEnter()"><strong>Duel entre amis</strong><span>Affronte deux légendes de ton Panthéon</span></button>
   <button class="hof-action" onclick="CL.go('codex')"><strong>Codex des compétences</strong></button>
   <button class="hof-action" onclick="CL.toggleHofFilters()" aria-expanded="${showFilters}"><strong>Filtres ${showFilters?'−':'+'}</strong><span>${esc(list.length)} / ${esc(fullList.length)} légendes</span></button>
   ${showFilters?`<div class="hof-filters">
   ${modes.length>1?`<div class="eyebrow mb">Mode</div><div class="tagrow mb"><button class="tag2 ${!filt.gameMode?'hot':''}" onclick="CL.filterHof('gameMode','')">Tous</button>${modes.map(m=>`<button class="tag2 ${filt.gameMode===m?'hot':''}" onclick="CL.filterHof('gameMode','${escJsAttr(m)}')">${esc(modeLabels[m]||m)}</button>`).join('')}</div>`:''}
   ${styles.length>1?`<div class="eyebrow mb mt">Styles</div><div class="tagrow mb"><button class="tag2 ${!filt.style?'hot':''}" onclick="CL.filterHof('style','')">Tous</button>${styles.map(s=>`<button class="tag2 ${filt.style===s?'hot':''}" onclick="CL.filterHof('style','${escJsAttr(s)}')">${esc(s)}</button>`).join('')}</div>`:''}
   ${divisions.length>1?`<div class="eyebrow mb mt">Divisions</div><div class="tagrow mb"><button class="tag2 ${!filt.divName?'hot':''}" onclick="CL.filterHof('divName','')">Toutes</button>${divisions.map(d=>`<button class="tag2 ${filt.divName===d?'hot':''}" onclick="CL.filterHof('divName','${escJsAttr(d)}')">${esc(d)}</button>`).join('')}</div>`:''}
   <div class="eyebrow mb mt">Défenses</div><div class="tagrow mb"><button class="tag2 ${!filt.minDefenses?'hot':''}" onclick="CL.filterHof('minDefenses',0)">Toutes</button><button class="tag2 ${filt.minDefenses>=2?'hot':''}" onclick="CL.filterHof('minDefenses',2)">2+ défenses</button></div>
   </div>`:''}
   ${hofExportHtml()}
   <button class="hof-return" onclick="CL.go('${backDest}')">← Revenir au ${backDest==='hub'?'vestiaire':'menu principal'}</button>
   </aside><section class="hof-main"><h2>Les légendes</h2><div class="leg-grid">${(()=>{
     /* ==== [ANCRE: GOAT_PANTHEON] — T8a : le tri par f.score reste celui
        de l'archive ; l'écran montre les faits et le favori, pas une note
        ni un indicateur de mérite ajouté à la carte de la maquette 09. ==== */
     /* T8a : le score conserve le tri existant, pas de barème affiché.
        L'accent de carte signale le favori réellement choisi par le joueur. */
     return list.length?list.map(f=>{
      const decorations=f.decorations||[];
      const deco=legendDecoStyle(decorations);
      return `<article class="leg-tcard hof-card${f.favorite?' hof-favorite':''}" style="${deco.borderCss}">
      ${deco.holoCss?'<div class="hof-holo" aria-hidden="true"></div>':''}
      <button class="hof-card-open" onclick="CL.viewLegend('${escJsAttr(f.id)}')">
        <span class="nm" style="${deco.nameCss}">${f.favorite?'★ ':''}${esc(f.name)}</span>
        <span class="hof-card-meta">${esc(f.divName)} · retraite à ${esc(f.age)} ans · ${esc(f.W)}-${esc(f.L)} · ${esc(f.ko+f.sub)} finitions</span>
        <span class="hof-card-facts">${esc(f.style)} · ${esc(f.ko)} KO / ${esc(f.sub)} SUB${f.titles?` · ${esc(f.titles)} titre${f.titles===1?'':'s'}`:''}${f.defenses?` · ${esc(f.defenses)} défense${f.defenses===1?'':'s'}`:''}</span>
        ${(f.epithets||[]).length?`<span class="hof-card-description">${f.epithets.map(esc).join(' · ')}</span>`:''}
        <span class="hof-card-rank">${esc(f.rank)}</span>
      </button>
      ${deco.stickers.length?`<div class="stickers">${deco.stickers.map(s=>`<span>${s}</span>`).join('')}</div>`:''}
      <div class="hof-card-actions">
        <button onclick="CL.toggleHofFav('${escJsAttr(f.id)}')" aria-pressed="${!!f.favorite}">${f.favorite?'★':'☆'} Favori</button>
        <button onclick="CL.exportLegend('${escJsAttr(f.id)}')">Partager</button>
        <button onclick="CL.deleteHof('${escJsAttr(f.id)}')">Supprimer</button>
      </div></article>`;
    }).join(''):
      (fullList.length?'<p class="lede">Aucune légende ne correspond aux filtres.</p>':'<p class="lede">Aucune légende encore. Ta première carrière retraitée apparaîtra ici pour toujours.</p>');
   })()}</div></section></div></div>`; }

/* Même panneau de partage existant sur la liste et sur sa fiche : le
   contrôleur produit le lien/code, ce helper ne fait que les afficher. */
function hofExportHtml(){
  if(!G.exportedCode) return '';
  return `<section class="hof-export"><h2>Lien de ${esc(G.exportedName||'')} — envoie-le à ton ami</h2>
    ${G.exportedLink?`<input readonly value="${esc(G.exportedLink)}" onclick="this.select()" aria-label="Lien de partage"><button class="btn primary" onclick="CL.copyExportedLink()">Copier le lien</button>`:''}
    <details><summary>Le lien ne marche pas ? Utiliser le code à la place</summary><textarea readonly onclick="this.select()" aria-label="Code de la légende">${esc(G.exportedCode)}</textarea></details>
    <button class="hof-return" onclick="CL.clearExportedCode()">Fermer</button></section>`;
}
// ==== [ANCRE: ECRAN_DETAIL_LEGENDE] (rendu) — bug bloquant corrigé : le
// routeur (ui-08-controller-arena.js) référence scr_legend_detail comme
// gestionnaire de l'écran 'legend_detail' (déclenché par CL.viewLegend()),
// mais cette fonction n'existait nulle part dans le codebase -> ReferenceError
// au chargement du script (objet-routeur évalué immédiatement), donc page
// blanche totale avant même le premier rendu. Fiche complète reprenant les
// données déjà capturées par enshrine() (state.js) pour chaque légende.
function scr_legend_detail(){
  const list=loadHOF(); const f=list.find(x=>String(x.id)===String(G.viewingLegendId));
  if(!f) return `<div class="scr center"><p class="lede">Légende introuvable.</p><button class="btn ghost mt" onclick="CL.go('hof')">Retour au Panthéon</button></div>`;
  /* ==== [ANCRE: ALBUM_LEGEND_STYLE] — T8a : la fiche est la version
     grand format de la carte de 09 ; décorations lues par la MÊME
     fonction partagée (legendDecoStyle) plutôt que par une logique
     dupliquée et différente de celle de la liste. Ouvrir une légende, c'est
     visuellement "sortir sa carte du classeur", pas changer d'écran. ==== */
  const decorations=f.decorations||[];
  const deco=legendDecoStyle(decorations);
  /* ==== [ANCRE: CORRECTIF_COSMETIQUES_EXCLUSIFS_INVISIBLES] — voir ancre
     jumelle dans state.js : excl_mask_oni/excl_gloves_relic figurent
     désormais directement dans LEGEND_UNLOCKABLES (l'offre du jour a été
     retirée), donc ce panneau les voit sans traitement particulier. ==== */
  /* ==== [ANCRE: LOT4_T8A_FICHE_LEGENDE] — même cadre que 09, faits de
     l'archive et actions existantes ; aucun portrait ni description nouvelle. ==== */
  return `<div class="scr hof-screen hof-detail"><header class="hof-header"><div class="hof-heading"><button class="hof-home" onclick="CL.go('hof')" aria-label="Retour au Panthéon"><span aria-hidden="true"></span></button><h1>${esc(f.name)}</h1></div>
    <div class="hof-totals"><div><strong>${esc(f.W)}-${esc(f.L)}</strong><span>Bilan pro</span></div><div><strong>${esc(f.ko+f.sub)}</strong><span>Finitions</span></div></div></header>
    <div class="hof-columns"><section class="hof-main">
   ${G.lastMsg?(()=>{ const m=G.lastMsg; G.lastMsg=null; return `<div class="card mb glass" style="border-left:3px solid var(--gold);background:var(--panel2);padding:10px 14px"><span class="small">${esc(m)}</span></div>`; })():''}
   <div class="leg-hero-card" style="${deco.borderCss}">
      ${deco.holoCss?'<div class="hof-holo" aria-hidden="true"></div>':''}
     <!-- ==== [ANCRE: CORRECTIF_SURNOMS_PARASITES] — Lot C01/2026 §C13a :
          f.classLabel/f.class31Label (libellés de classe interne, ex. "Le
          Mur Défensif") se lisaient comme des surnoms et entraient en
          conflit avec f.nick — retirés de cette ligne, qui se limite
          désormais à « nick » — style · division. ==== -->
      <div class="hof-legend-meta">${esc(f.flag||'')} ${f.nick?`« ${esc(f.nick)} » — `:''}${esc(f.style)} · ${esc(f.divName)}</div>
     <!-- ==== [ANCRE: CORRECTIF_ORIGINE_MANQUANTE] — Lot C01/2026 §C13b :
          f.origin existe depuis la génération (engine.js) mais n'était
          affiché nulle part sur la fiche — capturé dans l'entrée du
          Panthéon (state-hof.js, CORRECTIF_ORIGINE_PANTHEON) et affiché
          ici, au-dessus de la motivation qu'il précède naturellement. ==== -->
     ${f.origin?`<div class="story" style="position:relative;z-index:1"><b>Venait de.</b> ${esc(f.origin)}</div>`:''}
     ${f.motivation?`<div class="story" style="position:relative;z-index:1"><b>Se battait pour.</b> ${esc(f.motivation)}.</div>`:''}
      <div class="epis mt" style="position:relative;z-index:1">${(f.epithets||[]).map(e=>`<span class="epi">${esc(e)}</span>`).join('')}</div>
     ${deco.stickers.length?`<div class="stickers-lg mt">${deco.stickers.map(s=>`<span>${s}</span>`).join('')}</div>`:''}
      ${f.amaRec?`<div class="hof-legend-meta">Amateur : ${esc(f.amaRec.W)}-${esc(f.amaRec.L)}</div>`:''}
   </div>
   ${(f.amaTitles&&f.amaTitles.length)?`<div class="tagrow mb">${f.amaTitles.map(id=>{const cfg=AMA_CHAMPIONSHIPS.find(c=>c.id===id); return cfg?`<span class="tag2 hot">${SVG.medal} ${cfg.label}</span>`:'';}).join('')}</div>`:''}
   <!-- ==== [ANCRE: CORRECTIF_CEINTURES_BADGES] — Lot C01/2026 §C13c :
        f.beltHistory était rendu en liste de texte, un format différent du
        badge WMA (tag2 hot) des titres amateurs juste au-dessus — même
        composant de badge désormais, un par ceinture, dans une tagrow
        homogène juste sous le badge amateur : "ORG (Division) — Année N". ==== -->
   ${(f.beltHistory&&f.beltHistory.length)?`<div class="tagrow mb">${f.beltHistory.map(b=>`<span class="tag2 hot">${SVG.medal} ${esc(b.orgName)} (${esc(b.divName)}) — Année ${b.year}</span>`).join('')}</div>`:''}
   ${f.biggestRival?`<div class="card mb"><div class="eyebrow mb">⚔ Plus grand rival</div><div class="small" style="color:var(--blood)">${esc(f.biggestRival.name)} ${esc(f.biggestRival.flag||'')} — ${esc(f.biggestRival.count)} confrontations</div></div>`:''}
   ${f.notableWins&&f.notableWins.length?`<div class="card mb"><div class="eyebrow mb">🏅 Adversaires notables battus</div>${f.notableWins.map(h=>`<div class="small muted" style="padding:4px 0">${esc(h.oppName)} ${esc(h.oppFlag||'')} <span class="mono">(${esc(h.oppRecord||'?')}) — ${esc(h.method)}</span></div>`).join('')}</div>`:''}
   ${f.nicknameHistory&&f.nicknameHistory.length?`<div class="card mb"><div class="eyebrow mb">Historique des surnoms</div>${f.nicknameHistory.map(n=>`<div class="small muted" style="padding:4px 0">« ${esc(n)} »</div>`).join('')}</div>`:''}
   ${f.signatureMove?`<div class="card mb" style="border-left:3px solid var(--gold-d)"><div class="eyebrow gold mb">${SVG.star} Mouvement Signature</div><b style="color:var(--gold)">${esc(f.signatureMove.customSuffix?`${f.signatureMove.name} ${f.signatureMove.customSuffix}`:f.signatureMove.name)}</b></div>`:''}
   <!-- ==== [ANCRE: PANTHEON_RECAP_SAISON] — item demandé (P5a) : seasonRecap
        est capturé par enshrine() (state-hof.js) mais n'était jamais rendu
        sur la fiche de légende, seulement sur l'écran de retraite (scr_legacy,
        via retireSeasonRecapHtml, ui-07). Même fonction partagée, appelée ici
        avec l'entrée HOF (qui porte f.seasonRecap au même format) — la fiche
        Panthéon doit contenir tout ce que contenait l'écran de retraite. ==== -->
   ${retireSeasonRecapHtml(f)}
   ${f.earnedAchievements&&f.earnedAchievements.length?`<div class="card mb"><div class="eyebrow mb">Succès obtenus (${f.earnedAchievements.length}/${ACH.length})</div>${f.earnedAchievements.map(id=>{const a=ACH.find(x=>x.id===id); return a?`<div class="ach"><span class="ico" style="display:flex;align-items:center;color:var(--gold)">${a.ico}</span><span><b class="gold">${a.h}</b><div class="muted small">${a.d}</div></span></div>`:'';}).join('')}</div>`:''}
   </section><aside class="hof-aside"><h2>${esc(f.rank)}</h2>
    <p class="hof-legend-meta">Retraite à ${esc(f.age)} ans · ${esc(f.ko)} KO / ${esc(f.sub)} SUB<br>${esc(f.titles||0)} titre${f.titles===1?'':'s'} · ${esc(f.defenses||0)} défense${f.defenses===1?'':'s'}</p>
    <button class="hof-action" onclick="CL.toggleHofFav('${escJsAttr(f.id)}')" aria-pressed="${!!f.favorite}"><strong>${f.favorite?'★':'☆'} Favori</strong></button>
    <button class="hof-action" onclick="CL.exportLegend('${escJsAttr(f.id)}')"><strong>Exporter (partager avec un ami)</strong></button>
    ${hofExportHtml()}
    <button class="hof-return" onclick="CL.go('hof')">Retour au Panthéon</button>
   </aside></div></div>`;
}
// ==== [ANCRE: SYSTEME_CLASSES] (rendu) — bug bloquant corrigé : même
// symptôme que scr_legend_detail juste au-dessus. Le routeur référence
// scr_class_choice pour l'écran 'class_choice' (levé par classOffer en
// ui-05, résolu par CL.chooseClass() déjà présent dans ui-08), mais aucune
// fonction de ce nom n'existait -> ReferenceError au chargement -> page
// blanche. fx est en échelle brute /100 (25/15/-15 depuis le rééquilibrage
// Bug #8) : affiché divisé par 5 pour matcher la note /20 (+5/+3/-3), comme
// pour tout le reste de l'UI (voir d20()).
function scr_class_choice(){
  const f=G.f; const pool=CLASSES[f.style]||[];
  return `<div class="scr center intro">
   <div class="eyebrow gold">Choix de Classe</div>
   <h2 class="disp">Une spécialisation définitive</h2>
   <p class="lede">À 23 ans, chaque combattant choisit une identité qui le suivra pour le reste de sa carrière. Ce choix ne pourra jamais être changé.</p>
   ${pool.map((cls,idx)=>{
     const fits=(()=>{ try{ return cls.fit(f); }catch(e){ return false; } })();
     const deltaTags=Object.entries(cls.fx||{}).map(([k,v])=>{
       const shown=Math.sign(v)*Math.max(1,Math.round(Math.abs(v)/5));
       return `<span class="dlt ${v>=0?'up':'dn'}">${shown>0?'+':''}${shown} ${attrLabel(k)}</span>`;
     }).join('');
     return `<div class="glass card mt" style="text-align:left;background:var(--panel2);border:1px solid var(--line);padding:16px">
       <b style="font-size:17px;color:var(--gold)">${cls.lbl}</b>
       <div class="story mt" style="font-style:italic">« ${cls.desc} »</div>
       <div class="dlts mt">${deltaTags}</div>
       <div class="mono small mt" style="color:${fits?'var(--win)':'var(--muted)'}">${fits?'✓ Correspond à ton parcours jusqu\u2019ici':'Ne correspond pas particulièrement à ton style actuel — reste un choix valide.'}</div>
       <button class="btn primary mt" onclick="CL.chooseClass(${idx})">Choisir « ${cls.lbl} » — définitif</button>
     </div>`;
   }).join('')}
   <button class="btn ghost mt" onclick="G._profileReturn='class_choice';CL.go('profile')">Voir la fiche complète du combattant</button>
  </div>`;
}
// ==== [ANCRE: SYSTEME_CLASSES_31] (rendu) — même structure que
// scr_class_choice() ci-dessus, mais le pool vient de CLASSES_31[style][f.class]
// (dépend du choix fait à 23 ans, jamais du style seul). f.class est garanti
// non-null ici : class31Offer (ui-05) ne se lève que si classChosen est déjà
// vrai. Filet de sécurité quand même (pool vide) pour ne jamais planter sur
// une sauvegarde où class31Offer aurait été levé sans classChosen valide.
function scr_class_choice_31(){
  const f=G.f; const pool=(CLASSES_31[f.style]&&CLASSES_31[f.style][f.class])||[];
  const parentCls=(CLASSES[f.style]||[]).find(c=>c.id===f.class);
  if(!pool.length){
    return `<div class="scr center intro">
     <div class="eyebrow gold">Choix de Classe (31 ans)</div>
     <p class="lede">Aucune spécialisation complémentaire disponible pour ce profil.</p>
     <button class="btn ghost mt" onclick="CL.go('hub')">Retour au vestiaire</button>
    </div>`;
  }
  return `<div class="scr center intro">
   <div class="eyebrow gold">Choix de Classe — 31 ans</div>
   <h2 class="disp">Une seconde spécialisation, définitive elle aussi</h2>
   <p class="lede">À 31 ans, l\u2019identité choisie à 23 ans${parentCls?' (« '+parentCls.lbl+' »)':''} se prolonge et se précise. Ce choix ne pourra jamais être changé.</p>
   ${pool.map((cls,idx)=>{
     const fits=(()=>{ try{ return cls.fit(f); }catch(e){ return false; } })();
     const deltaTags=Object.entries(cls.fx||{}).map(([k,v])=>{
       const shown=Math.sign(v)*Math.max(1,Math.round(Math.abs(v)/5));
       return `<span class="dlt ${v>=0?'up':'dn'}">${shown>0?'+':''}${shown} ${attrLabel(k)}</span>`;
     }).join('');
     return `<div class="glass card mt" style="text-align:left;background:var(--panel2);border:1px solid var(--line);padding:16px">
       <b style="font-size:17px;color:var(--gold)">${cls.lbl}</b>
       <div class="story mt" style="font-style:italic">« ${cls.desc} »</div>
       <div class="dlts mt">${deltaTags}</div>
       <div class="mono small mt" style="color:${fits?'var(--win)':'var(--muted)'}">${fits?'✓ Correspond à ton parcours jusqu\u2019ici':'Ne correspond pas particulièrement à ton style actuel — reste un choix valide.'}</div>
       <button class="btn primary mt" onclick="CL.chooseClass31(${idx})">Choisir « ${cls.lbl} » — définitif</button>
     </div>`;
   }).join('')}
   <button class="btn ghost mt" onclick="G._profileReturn='class_choice_31';CL.go('profile')">Voir la fiche complète du combattant</button>
  </div>`;
}
/* ==== [ANCRE: CORRECTIF_CLASSEMENT_EXPLIQUE] — Lot C01/2026 §C02 : la
   variation de rang (#101 -> #85) était affichée en petit texte mono,
   coincée entre le tableau des juges et la promesse de face-à-face
   (retirée §C07), sans jamais expliquer À QUOI elle était due. Phrase de
   cause construite à partir de données réelles du combat (rang de
   l'adversaire au moment du combat, méthode de victoire, série en cours),
   jamais un texte générique. */
function rankChangeReasonHtml(p,f){
  const improved=p.rankAfter<p.rankBefore;
  const oppRank=p.opp&&p.opp.rank;
  // "au #N de la division" / "à Nom" — contraction à+le=au gérée ici plutôt
  // que de coller "à" devant "le #N" (accord fautif).
  const oppTxt=(oppRank>0&&oppRank<999)?`au #${oppRank} de la division`:`à ${esc(p.opp.name)}`;
  const finishTxt=p.method.startsWith('KO')?'par KO/TKO':p.method.startsWith('Soum')?'par soumission':isDecisionLike(p.method)?'aux points':`par ${esc(p.method)}`;
  const streakTxt=(improved&&(f.streak||0)>=3)?` — ${f.streak}e victoire d’affilée`:'';
  if(p.res&&p.res.winner==='D') return `Match nul face ${oppTxt} : le classement bouge malgré tout.`;
  if(improved) return `Victoire ${finishTxt} face ${oppTxt}${streakTxt}.`;
  return p.win?`Victoire ${finishTxt} face ${oppTxt}, pas de quoi devancer le reste de la division.`:`Défaite face ${oppTxt} — le classement recule.`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: STATS_COMBAT_PANEL_ENRICHI] — affichage complet des statistiques de combat ==== */
function renderCombatStatsCard(st, f, opp){
  const sigA=st.A.sig||0, sigB=st.B.sig||0;
  const sigAttA=st.A.sigAtt||sigA, sigAttB=st.B.sigAtt||sigB;
  const pctSigA=Math.round((sigA/Math.max(1,sigAttA))*100);
  const pctSigB=Math.round((sigB/Math.max(1,sigAttB))*100);

  const totA=st.A.total||sigA, totB=st.B.total||sigB;
  const totAttA=st.A.totalAtt||sigAttA, totAttB=st.B.totalAtt||sigAttB;

  const defA=Math.round(((Math.max(0,sigAttB-sigB))/Math.max(1,sigAttB))*100);
  const defB=Math.round(((Math.max(0,sigAttA-sigA))/Math.max(1,sigAttA))*100);

  const tdA=st.A.td||0, tdB=st.B.td||0;
  const tdAttA=st.A.tdAtt||tdA, tdAttB=st.B.tdAtt||tdB;
  const pctTdA=Math.round((tdA/Math.max(1,tdAttA))*100);
  const pctTdB=Math.round((tdB/Math.max(1,tdAttB))*100);

  const tdDefA=st.A.tdDef||0, tdDefB=st.B.tdDef||0;
  const pctTdDefA=Math.round((tdDefA/Math.max(1,tdDefA+tdB))*100);
  const pctTdDefB=Math.round((tdDefB/Math.max(1,tdDefB+tdA))*100);

  const ctrlAStr=formatCtrl(st.A.ctrl||0);
  const ctrlBStr=formatCtrl(st.B.ctrl||0);

  const dmgA=(st.A.dmgHead||0)+(st.A.dmgBody||0)+(st.A.dmgLegs||0);
  const dmgB=(st.B.dmgHead||0)+(st.B.dmgBody||0)+(st.B.dmgLegs||0);

  return `<div class="card stats-card">
    <div class="eyebrow mb">Statistiques du combat</div>
    <div class="st-row" style="border-bottom:1px solid var(--gold-d);padding-bottom:6px;font-weight:700">
      <span style="font-family:'Oswald';font-size:13.5px">${esc(f?f.name:'Combattant A')}</span>
      <span class="st-l" style="color:var(--gold)">VS</span>
      <span style="font-family:'Oswald';font-size:13.5px">${esc(opp?opp.name:'Combattant B')}</span>
    </div>
    <div class="st-row">
      <span><b>${sigA}</b>/${sigAttA} <small class="muted">(${pctSigA}%)</small></span>
      <span class="st-l">Frappes sig.</span>
      <span><b>${sigB}</b>/${sigAttB} <small class="muted">(${pctSigB}%)</small></span>
    </div>
    <div class="st-row">
      <span>${totA}/${totAttA}</span>
      <span class="st-l">Total frappes</span>
      <span>${totB}/${totAttB}</span>
    </div>
    <div class="st-row">
      <span>${st.A.powerStrikes||0}</span>
      <span class="st-l">Frappes puissantes</span>
      <span>${st.B.powerStrikes||0}</span>
    </div>
    <div class="st-row">
      <span>${defA}%</span>
      <span class="st-l">Défense frappes</span>
      <span>${defB}%</span>
    </div>
    <div class="st-row">
      <span>${st.A.kd||0}</span>
      <span class="st-l">Knockdowns</span>
      <span>${st.B.kd||0}</span>
    </div>
    <div class="st-row" style="font-size:11.5px;opacity:.95">
      <span>${st.A.sigHead||0} tête · ${st.A.sigBody||0} corps · ${st.A.sigLeg||0} jambe</span>
      <span class="st-l">Par cible</span>
      <span>${st.B.sigHead||0} tête · ${st.B.sigBody||0} corps · ${st.B.sigLeg||0} jambe</span>
    </div>
    <div class="st-row" style="font-size:11.5px;opacity:.95">
      <span>${st.A.distStrikes||0} dist · ${st.A.clinchStrikes||0} clinch · ${st.A.groundStrikes||0} sol</span>
      <span class="st-l">Par position</span>
      <span>${st.B.distStrikes||0} dist · ${st.B.clinchStrikes||0} clinch · ${st.B.groundStrikes||0} sol</span>
    </div>
    <div class="st-row">
      <span><b>${tdA}</b>/${tdAttA} <small class="muted">(${pctTdA}%)</small></span>
      <span class="st-l">Amenées</span>
      <span><b>${tdB}</b>/${tdAttB} <small class="muted">(${pctTdB}%)</small></span>
    </div>
    <div class="st-row">
      <span>${pctTdDefA}% <small class="muted">(${tdDefA}/${tdDefA+tdB})</small></span>
      <span class="st-l">Défense lutte</span>
      <span>${pctTdDefB}% <small class="muted">(${tdDefB}/${tdDefB+tdA})</small></span>
    </div>
    <div class="st-row">
      <span>${ctrlAStr}</span>
      <span class="st-l">Temps de contrôle</span>
      <span>${ctrlBStr}</span>
    </div>
    <div class="st-row">
      <span>${st.A.subAtt||0} tent.${st.A.subEscapes?` · ${st.A.subEscapes} éch.`:''}</span>
      <span class="st-l">Soumissions</span>
      <span>${st.B.subAtt||0} tent.${st.B.subEscapes?` · ${st.B.subEscapes} éch.`:''}</span>
    </div>
    <div class="st-row" style="font-size:11.5px;opacity:.95">
      <span>${st.A.guardPasses||0} pass. · ${st.A.reversals||0} renv. · ${st.A.standups||0} rel.</span>
      <span class="st-l">Lutte au sol</span>
      <span>${st.B.guardPasses||0} pass. · ${st.B.reversals||0} renv. · ${st.B.standups||0} rel.</span>
    </div>
    <div class="st-row">
      <span>${dmgB} pts</span>
      <span class="st-l">Dégâts infligés</span>
      <span>${dmgA} pts</span>
    </div>
    ${(st.A.wobbled||st.B.wobbled||st.A.cuts||st.B.cuts)?`
    <div class="st-row" style="font-size:11.5px;color:var(--gold)">
      <span>${st.B.wobbled||0} sonné${(st.B.wobbled||0)>1?'s':''}${st.B.cuts?` · ${st.B.cuts} coupure${st.B.cuts>1?'s':''}`:''}</span>
      <span class="st-l">Impact critique</span>
      <span>${st.A.wobbled||0} sonné${(st.A.wobbled||0)>1?'s':''}${st.A.cuts?` · ${st.A.cuts} coupure${st.A.cuts>1?'s':''}`:''}</span>
    </div>`:''}
  </div>`;
}
/* ==== [FIN ANCRE] ==== */
function scr_result(){ const p=G.pending,f=G.f,st=p.res.stats;
  let judgesHtml='';
  if(isDecisionLike(p.method) && !p.res.judges && p.res.scoreA!==undefined){
    judgesHtml=`<div class="card gold-b" style="text-align:center"><div class="eyebrow mb">Pointage (total)</div><div class="disp" style="font-size:22px">${p.res.scoreA} – ${p.res.scoreB}</div></div>`;
  } else if(isDecisionLike(p.method) && p.res.judges){
    const J=p.res.judges;
    judgesHtml=`<div class="card gold-b" style="text-align:center">
      <div class="eyebrow mb">Score des juges (10-point must)</div>
      <div class="duel2" style="justify-content:center;gap:16px">
        <span class="num ${J.j1[0]>J.j1[1]?'a':(J.j1[0]===J.j1[1]?'b':'dn')}">${J.j1[0]}-${J.j1[1]}</span>
        <span class="num ${J.j2[0]>J.j2[1]?'a':(J.j2[0]===J.j2[1]?'b':'dn')}">${J.j2[0]}-${J.j2[1]}</span>
        <span class="num ${J.j3[0]>J.j3[1]?'a':(J.j3[0]===J.j3[1]?'b':'dn')}">${J.j3[0]}-${J.j3[1]}</span>
      </div>
      <div class="hr"></div>
      <div class="mono small muted" style="text-align:left;font-size:11px">
        <div style="display:flex;justify-content:space-between;color:var(--text);margin-bottom:4px"><span>RND</span><span>J1</span><span>J2</span><span>J3</span><span>SIG</span><span>TD</span><span>KD</span></div>
        ${(p.res.roundStats||[]).map(rs=>`<div style="padding:3px 0;border-bottom:1px solid var(--line)">
          <div style="display:flex;justify-content:space-between">
            <span style="color:var(--gold)">R${rs.r}</span><span>${rs.j1[0]}-${rs.j1[1]}</span><span>${rs.j2[0]}-${rs.j2[1]}</span><span>${rs.j3[0]}-${rs.j3[1]}</span><span>${rs.sigA}-${rs.sigB}</span><span>${rs.tdA}-${rs.tdB}</span><span>${rs.kdA}-${rs.kdB}</span>
          </div>
          ${(rs.sigAttA!=null||rs.ctrlSecA!=null)?`<div style="display:flex;justify-content:space-between;font-size:9.5px;color:var(--muted);margin-top:2px">
            <span>Détail</span><span>${rs.sigA}/${rs.sigAttA||rs.sigA} (${rs.sigAttA?Math.round(rs.sigA/Math.max(1,rs.sigAttA)*100):0}%)</span><span>vs</span><span>${rs.sigB}/${rs.sigAttB||rs.sigB} (${rs.sigAttB?Math.round(rs.sigB/Math.max(1,rs.sigAttB)*100):0}%)</span><span>Ctrl: ${formatCtrl(rs.ctrlA||0)}-${formatCtrl(rs.ctrlB||0)}</span>
          </div>`:''}
        </div>`).join('')}
      </div></div>`;
  }
  let campHtml='';
  if(p.camp && p.camp.deltas.length){
    /* ==== [CORRECTIF V2-36] — deux bugs de la même famille (règle 7 :
       jamais de récompense nulle) corrigés ensemble ici :
       1. `if(b20===a20) return '';` faisait disparaître silencieusement
          toute ligne dont le gain réel (échelle /100) ne franchissait pas
          de palier /20 — un gain qui a bien eu lieu s'évaporait purement
          et simplement de l'écran, pire que "10 -> 10" (au moins ce
          dernier restait visible). Remplacé par une annotation, jamais
          par une disparition.
       2. Les entrées `converted` (convertZeroGain(), engine.js) —
          conversion vers un attribut voisin ou vers de l'argent quand
          un gain demandé était totalement plafonné — ont leur propre
          rendu : elles doivent toujours s'afficher, y compris quand la
          conversion elle-même ne franchit pas de palier /20. ==== */
    /* ==== [ANCRE: CORRECTIF_GAIN_INVISIBLE_MASQUE] — Lot C01/2026 §C03 :
       règle inversée par rapport à CORRECTIF_GAIN_MASQUE_ARRONDI (retirée) —
       un gain réel qui ne franchit aucun palier /20 ne s'annonce plus du
       tout ("gain interne minime"/"gain minime"), il disparaît simplement
       de la liste (retour '', éliminé par le .filter(Boolean) déjà en
       place) plutôt que d'afficher une ligne sans information utile pour
       le joueur. Les entrées converted() sans palier franchi restent
       affichées SANS suffixe (règle 7 : jamais de récompense nulle sans
       explication — la conversion elle-même EST l'information). Toutes les
       entrées de p.camp.deltas sont désormais au format objet uniforme
       (morale/forme inclus, cf. applyDeltas()) : plus de format tableau à
       gérer ici. ==== */
    const rows=p.camp.deltas.map(d=>{
      /* ==== [ANCRE: V3_PLAFOND_INVISIBLE] P17.2 : le joueur ne lit jamais
         qu'il a atteint une limite — il n'y en a plus (V3_DIMINISHING_RETURNS,
         engine.js) que le déclin par l'âge. La conversion elle-même reste
         annoncée (règle 7, jamais de récompense nulle sans explication),
         seule la mention du plafond disparaît. ==== */
      if(d.converted && d.key===null){
        return `<span class="dlt up">${d.fromLabel} converti en +${d.money}k$</span>`;
      }
      const b20=d20(d.before), a20=d20(d.after);
      if(d.converted){
        return `<span class="dlt up">${d.fromLabel} reporté sur ${d.label}</span>`;
      }
      if(b20===a20) return '';
      return `<span class="dlt ${a20>=b20?'up':'dn'}">${d.label} : ${b20} ➔ ${a20}</span>`;
    }).filter(Boolean);
    if(rows.length) campHtml=`<div class="card"><div class="eyebrow mb">Évolution (sur 20)</div><div class="dlts">${rows.join('')}</div></div>`;
  }
  return `<div class="scr">
   <div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--line);padding:16px;margin-bottom:20px;text-align:center">
     <div class="meta-strip" style="justify-content:center">${f.flag} ${esc(f.name)} vs ${p.opp.flag} ${esc(p.opp.name)}</div>
     <div class="hero-name" style="color:${p.isFantasy||p.isVsFriend?(p.res.winner==='D'?'var(--gold)':(p.win?'var(--gold)':'var(--loss)')):(p.win?'var(--win)':(p.res.winner==='D'?'var(--gold)':'var(--loss)'))}">${(p.isFantasy||p.isVsFriend)?(p.res.winner==='D'?'ÉGALITÉ':`${esc(p.win?f.name:p.opp.name)} gagne par ${p.method}`):(p.win?'VICTOIRE':(p.res.winner==='D'?'ÉGALITÉ':'DÉFAITE'))}<em style="color:var(--muted)">${(p.isFantasy||p.isVsFriend)?'':p.method}${p.res.round?' · Round '+p.res.round:''}${(p.res.finishTimeStr && !isDecisionLike(p.method))?' · '+p.res.finishTimeStr:''}</em></div>
     <div class="tagrow" style="justify-content:center">
       ${(p.res.moveName && !isDecisionLike(p.method))?(()=>{
         const typeStr=isKOMethod(p.method)?'KO/TKO':'Soumission';
         // ==== [ANCRE: DETECTION_ZONE_REDONDANTE] — élargie aux synonymes
         // anatomiques (ex. "plexus"/"menton" pour la zone "corps"/"tête") :
         // avant, seule une correspondance texte EXACTE du mot de zone
         // évitait le doublon d'affichage (ex. "Chassé frontal (teep) au
         // plexus — CORPS", redondant car "plexus" ET "corps" désignent la
         // même zone sans que le mot "corps" apparaisse littéralement).
         const ZONE_SYNONYMS={'tête':['tête','tete','menton','crâne','crane','visage','mâchoire','machoire','tempe'],
           'corps':['corps','plexus','foie','côtes','cotes','ventre','tronc','flanc'],
           'jambes':['jambe','tibia','genou','cuisse','mollet','cheville']};
         const synonyms=(p.res.zone && ZONE_SYNONYMS[p.res.zone])||[p.res.zone];
         const moveNameLower=p.res.moveName.toLowerCase();
         const zoneRedundant=p.res.zone && synonyms.some(s=>moveNameLower.includes(s));
         const zoneDetail=(p.res.zone && !zoneRedundant)?` — ${p.res.zone}`:'';
         return `<span class="tag2 hot">${typeStr} (${esc(p.res.moveName)})${zoneDetail}</span>`;
       })():''}
       ${p.planLabel?`<span class="tag2">Tactique : ${p.planLabel}</span>`:''}
     </div>
     ${p.res.moveFlavor?(()=>{ const isSig=p.res.moveFlavor.includes('MOUVEMENT SIGNATURE'); return `<div class="${isSig?'':'muted'} small mt" style="font-style:italic;${isSig?'color:var(--gold);font-weight:bold;font-style:normal':''}">${esc(p.res.moveFlavor)}</div>`; })():''}
     ${p.nickEvoHtml?`<div class="small mt" style="font-style:italic">${p.nickEvoHtml}</div>`:''}
   </div>
   ${judgesHtml}
   ${p.milestone?`<div class="card gold-b"><div class="disp" style="font-size:19px">${p.milestone}</div></div>`:''}
   ${p.upsetLine?`<div class="card" style="text-align:center;background:var(--panel2);border-left:3px solid var(--gold)"><p class="lede small" style="margin:0;font-style:italic">${esc(p.upsetLine)}</p></div>`:''}
   ${p.skill?`<div class="card"><div class="skill-unlock">✨ Compétence débloquée : <b style="color:${RAR_COLORS[p.skill.rar]||'var(--gold)'}">${p.skill.name}</b><div class="muted small">${p.skill.desc||p.skill.blurb||''}</div>${p.skill.fx?`<div class="mono small mt">${Object.entries(p.skill.fx).map(([k,v])=>{const label=(ALL_ATTR.find(a=>a[0]===k)||[k,k])[1]; const after=d20(f.attrs[k]); const realBefore=p.skill._realBefore&&p.skill._realBefore[k]!==undefined?p.skill._realBefore[k]:(f.attrs[k]-v); const before=d20(realBefore);
   /* ==== [ANCRE: CORRECTIF_GAIN_INVISIBLE_MASQUE] — Lot C01/2026 §C03 :
      règle inversée par rapport à CORRECTIF_GAIN_MASQUE_ARRONDI (retirée) —
      d20() arrondit /100->/20, donc un petit gain interne réel peut ne
      franchir aucun palier affiché et ressortir "17 -> 17", identique à un
      gain nul. Plutôt que d'annoter ce cas ("gain interne minime"), la
      ligne ne s'affiche plus du tout : un gain invisible sur l'échelle /20
      n'apporte rien au joueur, avec ou sans annotation. ==== */
   const noVisibleGain=before===after && f.attrs[k]>realBefore;
   /* ==== [ANCRE: V3_PLAFOND_INVISIBLE] P17.2 : le joueur ne lit jamais qu'il
      a atteint une limite. Un gain qui ne franchit aucun palier /20 reste nul
      à l'écran ("10 -> 10" nu), il n'est plus commenté par un plafond — il
      n'y en a plus (V3_DIMINISHING_RETURNS, engine.js) hormis le déclin par
      l'âge, qui ne concerne pas cet affichage. ==== */
   if(noVisibleGain) return '';
   return `<div style="color:var(--win)">${before} → ${after} ${label}</div>`;}).filter(Boolean).join('')}</div>`:''}</div></div>`:''}
    ${renderCombatStatsCard(st, f, p.opp)}
   ${p.purseDetail?`<div class="card"><div class="eyebrow mb">Bourse</div>
     <div class="mono small" style="display:flex;justify-content:space-between"><span class="muted">Bourse brute</span><span>${formatArgent(p.purseDetail.gross)}</span></div>
     <div class="mono small" style="display:flex;justify-content:space-between"><span class="muted">Frais de camp (manager, coach, salle)</span><span style="color:var(--loss)">-${formatArgent(p.purseDetail.fee)}</span></div>
     ${p.purseDetail.agentFee?`<div class="mono small" style="display:flex;justify-content:space-between"><span class="muted">Part de l\u2019agent (${Math.round((f.agentCut||0)*100)}%)</span><span style="color:var(--loss)">-${formatArgent(p.purseDetail.agentFee)}</span></div>`:''}
     <div class="mono small" style="display:flex;justify-content:space-between;margin-top:4px"><b>Net perçu</b><b class="gold">${formatArgent(p.purseDetail.net)}</b></div></div>`:''}
   <div class="card"><div class="eyebrow mb">Déroulé</div>${fightLog(p.res)}</div>
   ${(p.rankBefore!=null && p.rankAfter!=null && p.rankBefore!==p.rankAfter)?`<div class="card"><div class="eyebrow mb">Classement</div>
     <div class="disp" style="font-size:24px;color:${p.rankAfter<p.rankBefore?'var(--pos)':'var(--neg)'}">#${p.rankBefore} ➔ #${p.rankAfter}</div>
     <div class="muted small mt">${rankChangeReasonHtml(p,f)}</div>
   </div>`:''}
   ${campHtml}
   ${p.newAch&&p.newAch.length?`<div class="card">${p.newAch.map(a=>`<div class="ach"><span class="ico">${a.ico}</span><b class="gold">${a.h}</b> <span class="muted small">${a.d}</span></div>`).join('')}</div>`:''}
   <!-- ==== [ANCRE: CORRECTIF_NARRATIVE_NON_SERIALISABLE] — p.narrative.txt
        est désormais une chaîne déjà résolue (ui-05, au moment où G.pending
        est construit), plus une fonction : JSON.stringify() (save()) omet
        silencieusement les propriétés-fonctions, ce qui plantait ici après
        un vrai rechargement (save()/load()) avec "txt is not a function". -->
   ${p.narrative?`<div class="card glass narr" style="background:var(--panel2);padding:16px"><blockquote>« ${p.narrative.txt} »</blockquote><cite>${p.narrative.src}</cite></div>`:''}
   ${ghostComparisonHtml()}
   <button class="btn primary" onclick="CL.${p.forced?'toLegacy':'afterResult'}()">${p.forced?'Voir mon palmarès':'Continuer'}</button></div>`; }
/* ==== [ANCRE: GAUNTLET_FANTOME] — ajout #5 (24 ajouts, 12/08/2026) : compare
   le combat qui vient de se jouer à la même position dans la MEILLEURE run
   connue du joueur sur ce même archétype/mode/palier (meta.gauntletGhostLog,
   state.js). N'affiche rien tant qu'aucun record n'existe encore (première
   run sur cette combinaison) — le message par défaut (narrative ci-dessus,
   ou rien) reste seul visible, comme demandé. Même habillage visuel
   (.card.glass.narr) que le bloc de citation d'ambiance juste au-dessus,
   pour rester dans le même bloc visuel de bas d'écran. ==== */
function ghostComparisonHtml(){ return ''; }
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: CARTE_MOUVEMENT_SIGNATURE] — met en avant le geste devenu
   signature (5 finitions identiques, cf. pickFinishMove dans engine.js) : ce
   bonus existait déjà mécaniquement (+6 sur 2 attributs) mais n'était visible
   nulle part dans l'interface — corrigé ici avec un encart dédié dans la
   fiche complète, affichant le geste ET les gains concrets qu'il a apportés. ==== */
/* ==== [ANCRE: BADGE_CHAMPION] — remplace l'ancien bonus chiffré de champion
   (retiré du score de classement, item demandé) par un badge purement
   informatif dans le bilan technique : ceinture(s), organisation, et statut
   actuel/ancien clairement précisé. ==== */
function championBadgeCard(f){
  const badges=[];
  if(f.champion){
    badges.push({label:`Champion ${orgDisplayName(f)} — ${f.divName}`,status:'Titre actuel',current:true});
  }
  if(!f.champion && (f.titles||0)>0){
    badges.push({label:`${f.titles} règne(s) de champion à son actif`,status:'Titre(s) ancien(s) — ceinture perdue ou abandonnée',current:false});
  }
  if(!badges.length) return '';
  return `<div class="card mt grain" style="position:relative;z-index:2;background:var(--panel2);border:1px solid ${badges.some(b=>b.current)?'var(--gold)':'var(--line)'};padding:14px;text-align:left">
    <div class="eyebrow mb" style="color:${badges.some(b=>b.current)?'var(--gold)':'var(--muted)'}">${SVG.crown} Statut de championnat</div>
    ${badges.map(b=>`<div class="mono small" style="margin-top:4px"><b style="color:${b.current?'var(--gold)':'var(--muted)'}">${b.status}</b> — ${esc(b.label)}</div>`).join('')}
  </div>`;
}
function signatureMoveCard(f){
  if(!f.signatureMove) return '';
  const sm=f.signatureMove;
  /* ==== [ANCRE: CORRECTIF_BOOST_SIGNATURE_AFFICHAGE] — bug trouvé : la fiche
     recalculait un boost générique (submission+killer / power+killer pour
     tout), ignorant la zone, alors que engine.js applique
     SIGNATURE_BOOST_BY_ZONE depuis ANCRE CORRECTIF_BOOST_SIGNATURE_
     DIFFERENCIE. Même table, même constante SIGNATURE_BOOST_PTS que
     l'engine : le texte affiché correspond désormais au boost réellement
     appliqué. ==== */
  const boostKeys=(SIGNATURE_BOOST_BY_ZONE[sm.type]&&SIGNATURE_BOOST_BY_ZONE[sm.type][sm.zone])||(sm.type==='sub'?['submission','killer']:['power','killer']);
  const boostTxt=boostKeys.map(k=>{ const lbl=(ALL_ATTR.find(a=>a[0]===k)||[k,k])[1]; return `+${Math.max(1,Math.round(SIGNATURE_BOOST_PTS/5))} ${lbl}`; }).join(', ');
  const typeLbl=sm.type==='sub'?'Soumission':'KO';
  /* ==== [ANCRE: PRISE_SIGNATURE_NOMMEE] — ajout #1 (24 ajouts, 12/08/2026) :
     tant que le joueur n'a pas validé (sm.locked===true), un champ libre
     permet de taper un complément qui s'ajoute au nom de base (jamais ne le
     remplace) — aperçu mis à jour lettre par lettre via CL.setSignatureSuffix
     (render(true) : préserve le scroll, cf. pattern CL.setGauntletSeed).
     Une fois validé (CL.lockSignatureSuffix), le champ disparaît et le nom
     complet est figé définitivement. ==== */
  const fullName=sm.customSuffix?`${sm.name} ${sm.customSuffix}`:sm.name;
  const namingHtml=sm.locked?'':`<div class="mt" style="text-align:left">
      <div class="muted small mb">Donne un nom complet à ta prise signature (le nom de base reste toujours affiché) :</div>
      <div class="mono" style="color:var(--gold);font-size:15px;margin-bottom:6px">Aperçu : ${esc(sm.name)}${sm._draftSuffix?' '+esc(sm._draftSuffix):''}</div>
      <input id="sig-suffix" maxlength="24" placeholder="ex. de Marseille, du Valhalla" value="${esc(sm._draftSuffix||'')}" oninput="CL.setSignatureSuffix(this.value)">
      <button class="btn primary" style="margin-top:8px;padding:8px 14px;font-size:13px" onclick="CL.lockSignatureSuffix()" ${sm._draftSuffix&&sm._draftSuffix.trim()?'':'disabled'}>Valider (définitif)</button>
    </div>`;
  return `<div class="card mt" style="position:relative;z-index:2;background:var(--panel2);border:1px solid var(--gold-d);padding:14px;text-align:left">
    <div class="eyebrow gold mb">${SVG.star} Mouvement Signature</div>
    <b style="font-size:17px;color:var(--gold)">${esc(fullName)}</b> <span class="muted small">(${typeLbl})</span>
    <div class="muted small mt">40 % de chances de conclure par ce geste à chaque finition.</div>
    <div class="mono small mt" style="color:var(--win)">Effets acquis : ${boostTxt}</div>
    ${namingHtml}
  </div>`;
  /* ==== [FIN ANCRE] ==== */
}
/* ==== [ANCRE: CORRECTIF_RETOUR_FICHE_PROFIL] — bug trouvé : G._profileReturn
   était nullé dès le rendu de l'écran, pas au moment de la sortie. Tout
   render() déclenché pendant que la fiche est ouverte (ex. un bouton qui
   appelle render() sans changer d'écran)
   écrasait donc la cible et renvoyait au hub au lieu de class_choice/
   class_choice_31 — sortie latérale sur un choix bloquant non résolu. Le
   nullage est déplacé sur les deux points de sortie réels (✕ et Retour). ==== */
function scr_profile(){ const f=G.f; const g=groupAvg(f); const backScreen=G._profileReturn||'hub';
  /* ==== [ANCRE: LISIBILITE_FICHE_TECHNIQUE] — item demandé : la jauge .gauge
     (flex:1, cf. index.html) n'avait quasi aucune largeur disponible dans le
     layout Mental/Physique côte à côte (2 colonnes de ~150px sur mobile,
     .attr-l prenant 120px fixes + .attr-v 26px fixes) — la barre était
     réduite à quelques pixels, fonctionnellement invisible. Mental et
     Physique passent en pleine largeur, empilés comme Technique (déjà en
     hero), ce qui résout le manque de place à la source plutôt que de
     compresser le contenu davantage. `flex:1` sur .card (hérité du layout en
     ligne d'origine) est retiré : sans conteneur flex-row, il ne servait qu'à
     forcer les deux cartes à la même hauteur artificielle. ==== */
  /* ==== [ANCRE: ATTRIBUTS_EXPLIQUES] — retour utilisateur : le dépliant
     global affichait les 30 définitions d'un coup et rallongeait beaucoup
     trop la fiche. On clique désormais sur UNE ligne pour lire sa
     définition, et elle seule ; recliquer la referme. La fiche garde
     exactement sa longueur d'origine tant qu'on ne demande rien. ==== */
  const aide=G._attrHelp;
  const grp=(key,title,avg,hero)=>`<div class="card" style="padding:${hero?'20':'14'}px 0"><div class="grp-h"><span class="disp" style="font-size:${hero?'22px':'15px'}">${title}</span><span class="gold mono" style="font-size:${hero?'16px':'13px'}">${d20(avg)}/20</span></div>
     ${ATTR[key].map(a=>`<div class="attr" style="${hero?'':'font-size:12px'};cursor:pointer" onclick="CL.toggleAttrHelp('${a[0]}')"><span class="attr-l">${a[1]}</span>${gauge(f.attrs[a[0]])}<span class="attr-v">${d20(f.attrs[a[0]])}</span></div>${aide===a[0]?`<div class="muted" style="font-size:11px;padding:2px 12px 8px;line-height:1.35">${attrHelp(a[0])}</div>`:''}`).join('')}</div>`;
  return `<div class="scr"><div class="bar"><span class="eyebrow">Fiche complète</span><span class="eyebrow x" onclick="G._profileReturn=null;CL.go('${backScreen}')">✕</span></div>
   <div class="muted small mb">Touche une ligne pour savoir ce qu\u2019elle mesure.</div>
   <div class="glass mwash" style="position:relative;background:var(--panel2);border:1px solid var(--line);padding:16px;margin-bottom:20px">
     <div class="meta-strip"><div><span>Division</span><b>${f.divName}</b></div><div><span>Taille</span><b>${f.phys.height}cm</b></div><div><span>Allonge</span><b>${f.phys.reach}cm</b></div><div><span>Garde</span><b>${f.phys.stance==='southpaw'?'Gauchère':'Orthodoxe'}</b></div></div>
     <div class="hero-name">${esc(f.name)} ${f.flag}<em>${f.nick?`« ${f.nick} » — `:''}${f.styleLabel}, ${f.age} ans</em></div>
     <div class="story" style="position:relative;z-index:2;margin-top:10px"><b>Origine.</b> ${f.origin}.</div>
      <div class="story" style="position:relative;z-index:2"><b>Se bat pour.</b> ${f.motivation}.</div>
      <!-- ==== [ANCRE: FIX_LOT0_PURGE_FAITH_TRAITS_UI06] — suppression de l'affichage
           mort de f.faithTraits issu du mode Faith retiré. ==== -->
      <!-- ==== [FIN ANCRE] ==== -->
      <!-- ==== [ANCRE: V2-38] — bilan maison : le palmarès global (f.W/f.L,
          jamais réinitialisé après le seul passage amateur→pro) reste la
          référence affichée partout ailleurs ; cette ligne ajoute le détail
          par organisation (f.orgRecords, engine.js applyResult()), un
          second objectif de progression pour une carrière qui change
          d'écurie plusieurs fois. Absente tant qu'aucun combat pro n'a
          encore été disputé. ==== -->
     ${(f.orgRecords && Object.keys(f.orgRecords).length)?`<div class="story" style="position:relative;z-index:2"><b>Bilan maison.</b> ${Object.entries(f.orgRecords).map(([orgId,rec])=>`${rec.W}-${rec.L}${rec.D?`-${rec.D}`:''} sous les couleurs de ${esc(ORGS[orgId]||'—')}`).join(' · ')}.</div>`:''}
     ${(f.amaTitles&&f.amaTitles.length)?`<div class="tagrow">${f.amaTitles.map(id=>{const cfg=AMA_CHAMPIONSHIPS.find(c=>c.id===id); return cfg?`<span class="tag2 hot">Champion ${cfg.label}</span>`:'';}).join('')}</div>`:''}
     <!-- ==== [CORRECTIF V3_CAREER_LIFETIME_TOTAL] — Plan V3 LOT 7 §5.7.2
          point 4 : le total de carrière (amateur + pro, jamais recombiné
          nulle part ailleurs — cf. faithCareerTotalFights, ui-04) affiché
          sur la fiche elle-même, pas seulement à l'épilogue Faith. ==== -->
     ${f.amaRec?`<div class="story" style="position:relative;z-index:2"><b>Combats au total.</b> ${f.amaRec.W+f.amaRec.L+f.W+f.L+(f.D||0)} (amateur + pro).</div>`:''}
     <!-- ==== [ANCRE: V4_C17_P4P_RANG_MONDIAL] — Plan V4 LOT 6 C17 : p4pScore()
          était calculé et déjà utilisé (tri des propositions, onglet P4P de
          scr_rankings) mais jamais montré au joueur comme SA position. p4pRank()
          (engine.js) réutilise le même tri, ici affiché à côté du rang de
          division — absent tant qu'aucun combat n'a encore été disputé. ==== -->
     ${((f.W||0)+(f.L||0)+(f.D||0))>0?`<div class="story" style="position:relative;z-index:2"><b>Classement.</b> #${divRank(f)} en division · #${p4pRank(f)} au P4P.</div>`:''}
     ${championBadgeCard(f)}
     ${signatureMoveCard(f)}
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
   ${f.skills.length?`<div class="rarity-guide" style="margin-top:12px"><span><i style="background:${RAR_COLORS.C}"></i> Commune</span><span><i style="background:${RAR_COLORS.R}"></i> Rare</span><span><i style="background:${RAR_COLORS.E}"></i> Épique</span><span><i style="background:${RAR_COLORS.L}"></i> Légendaire</span><span><i style="background:${RAR_COLORS.M}"></i> Mythique</span></div>`:''}
   </div>
   ${grp('tech','Technique',g.tech,true)}
   <div style="display:flex;flex-direction:column;gap:16px">${grp('ment','Mental',g.ment,true)}${grp('phys','Physique',g.phys,true)}</div>
   <button class="btn ghost" onclick="G._profileReturn=null;CL.go('${backScreen}')">Retour</button></div>`; }

/* ==== [ANCRE: V3_RANKINGS_P4P_TAB] — Plan V3 LOT 6 §5.6.3 point 1 : "un
   onglet P4P dans l'écran Classement", exposant l'ancre P4P_SCORE_80_20
   (engine.js:1266) déjà calculée par p4pScore() mais jamais montrée
   telle quelle. Portée réduite par rapport à un vrai "classement mondial
   toutes divisions confondues" : le jeu ne modélise à aucun moment un
   roster couvrant plusieurs divisions/organisations simultanément (chaque
   G.roster est régénéré pour LA division/organisation courante du joueur,
   cf. makeOrgRoster) — synthétiser un vrai classement mondial croisé
   demanderait de construire cette donnée de toutes pièces, hors périmètre
   de ce lot. L'onglet P4P reclasse donc le MÊME pool par score pur
   (p4pScore, sans l'exception "champion toujours premier" du classement de
   division), ce qui EST la vraie différence P4P/division dans ce jeu : un
   prétendant en pleine bourre peut dépasser un champion qui ronronne. */
function scr_rankings(){ const f=G.f; const dr=rankPool(G.roster.concat([f]));
  const tab=(G._rankingsTab==='p4p')?'p4p':'division';
  /* ==== [ANCRE: CORRECTIF_SURNOM_CLASSEMENT] — Lot C01/2026 §C14a : colonne
     IDENTITÉ des deux onglets (Division et P4P), surnom absent jusqu'ici.
     Format "Prénom « Surnom » Nom", repli propre sur le nom complet quand
     nick est absent ; troncature une seule ligne (text-overflow:ellipsis)
     côté rendu pour ne jamais casser la mise en page mobile. ==== */
  const rankIdentityName=o=>o.nick?`${esc(o.first||'')} « ${esc(o.nick)} » ${esc(o.last||'')}`.replace(/\s+/g,' ').trim():esc(o.name);
  let h=`<div class="scr">
   <div class="bar" style="border-bottom:2px solid var(--line);margin-bottom:12px;padding-bottom:8px">
     <span class="eyebrow mono" style="letter-spacing:.1em">BASE DE DONNÉES // ${orgDisplayName(f).toUpperCase()} // ${f.divName.toUpperCase()}</span>
   </div>
   <div class="pills" style="margin-bottom:16px">
     <span class="pill ${tab==='division'?'on':''}" onclick="CL.setRankingsTab('division')">Division</span>
     <span class="pill ${tab==='p4p'?'on':''}" onclick="CL.setRankingsTab('p4p')">P4P</span>
   </div>`;
  if(tab==='p4p'){
    const p4pSorted=dr.slice().sort((a,b)=>p4pScore(b)-p4pScore(a)).slice(0,15);
    h+=`<div style="display:flex;border-bottom:1px solid var(--text);padding-bottom:4px;margin-bottom:8px;font-size:11px;color:var(--muted)" class="mono">
     <div style="width:32px">RANG</div><div style="flex:1">IDENTITÉ</div><div style="width:82px;text-align:right">RECORD</div><div style="width:56px;text-align:right">P4P</div>
    </div>`;
    p4pSorted.forEach((o,i)=>{ const isPlayer=(o===f); const rowBg=isPlayer?'background:var(--text);color:var(--bg)':'';
      h+=`<div style="display:flex;align-items:center;padding:10px 0;border-bottom:1px dotted var(--line);font-size:15px;${rowBg}${isPlayer?'':'cursor:pointer'}"${isPlayer?'':` role="button" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();this.click()}" onclick="CL.viewCareerOpponent('${escJsAttr(o.id)}','rankings')"`}>
        <div class="mono" style="width:32px;font-size:15px">${i+1}</div>
        <div style="flex:1;min-width:0;display:flex;flex-direction:column">
          <span class="disp" style="font-size:17px;line-height:1.1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${rankIdentityName(o)} ${o.flag}${isPlayer?' <span class="mono" style="font-size:11px">(TOI)</span>':''}${o.champion?' <span class="mono gold" style="font-size:11px">C</span>':''}</span>
          <span class="mono" style="font-size:10.5px;opacity:.7">${(o.styleLabel||'').toUpperCase()}</span>
        </div>
        <div class="mono" style="width:82px;text-align:right;font-size:14px;white-space:nowrap">${o.W}-${o.L}${o.D?'-'+o.D:''}</div>
        <!-- ==== [ANCRE: CORRECTIF_P4P_SCORE_BRUT] — Lot C01/2026 §C15a :
             Math.round(p4pScore(o)) affichait un nombre à quatre chiffres
             illisible, un score brut jamais montré au joueur nulle part
             ailleurs — remplacé par le rang, cohérent avec la fiche (qui
             affiche déjà correctement p4pRank(f), ui-06 scr_profile). ==== -->
        <div class="mono" style="width:56px;text-align:right;font-size:14px">#${i+1}</div>
      </div>`;
    });
    h+=`<button class="btn ghost mt" style="border:none" onclick="CL.go('hub')">← Revenir au hub</button></div>`;
    return h;
  }
  h+=`<div style="display:flex;border-bottom:1px solid var(--text);padding-bottom:4px;margin-bottom:8px;font-size:11px;color:var(--muted)" class="mono">
     <div style="width:32px">RANG</div><div style="flex:1">IDENTITÉ</div><div style="width:82px;text-align:right">RECORD</div><div style="width:70px;text-align:right">STATUT</div>
   </div>`;
  // ==== [ANCRE: CORRECTIF_NUMEROTATION_CLASSEMENT] — bug trouvé : le rang
  // affiché utilisait l'index brut dans le pool (qui inclut le champion à la
  // 1re place), donc le premier VRAI challenger affichait "#2" au lieu de
  // "#1" — la numérotation sautait le 1. Un compteur dédié aux non-champions
  // redémarre proprement à 1 (item demandé : C, puis 1, 2... jusqu'à 15).
  const hasChampInPool=dr.some(o=>o.champion);
  let contenderRank=0;
  dr.slice(0,hasChampInPool?16:15).forEach((o,i)=>{ const isPlayer=(o===f);
    if(!o.champion) contenderRank++;
    const rank=contenderRank;
    let arrow='–'; let arrowColor='var(--muted)';
    if(o.lastRankDelta>0){arrow='▲';arrowColor='var(--win)';} if(o.lastRankDelta<0){arrow='▼';arrowColor='var(--loss)';}
    const fightsTot=o.W+o.L+(o.D||0);
    const statusStr=o.champion?'CHAMPION':(fightsTot===0?'NR':arrow);
    const rowBg=isPlayer?'background:var(--text);color:var(--bg)':'';
    h+=`<div style="display:flex;align-items:center;padding:10px 0;border-bottom:1px dotted var(--line);font-size:15px;${rowBg}${isPlayer?'':'cursor:pointer'}"${isPlayer?'':` role="button" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();this.click()}" onclick="CL.viewCareerOpponent('${escJsAttr(o.id)}','rankings')"`}>
      <div class="mono" style="width:32px;font-size:15px;${o.champion&&!isPlayer?'color:var(--gold)':''}">${o.champion?'C':rank}</div>
      <div style="flex:1;min-width:0;display:flex;flex-direction:column">
        <span class="disp" style="font-size:17px;line-height:1.1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${rankIdentityName(o)} ${o.flag}${isPlayer?' <span class="mono" style="font-size:11px">(TOI)</span>':''}</span>
        <span class="mono" style="font-size:10.5px;opacity:.7">${(o.styleLabel||'').toUpperCase()}</span>
      </div>
      <div class="mono" style="width:82px;text-align:right;font-size:14px;white-space:nowrap">${o.W}-${o.L}${o.D?'-'+o.D:''}</div>
      <div class="mono" style="width:70px;text-align:right;font-size:10.5px;opacity:.7;${!o.champion?('color:'+arrowColor):''}">${statusStr}</div>
    </div>`;
  });
  h+=`<button class="btn ghost mt" style="border:none" onclick="CL.go('hub')">← Revenir au hub</button></div>`;
  return h;
}

function scr_event(){ const ev=G.activeEvent;
  return `<div class="scr center" style="display:flex;flex-direction:column;justify-content:center;min-height:80vh"><div class="eyebrow blood">Événement imprévu</div>
   <div class="hero-name" style="text-align:center;font-size:clamp(26px,8vw,36px)">${ev.title}</div>
   <div class="glass card" style="position:relative;background:var(--panel2);text-align:left;padding:16px;margin:16px 0"><p class="lede" style="margin:0;text-align:left;max-width:100%">${ev.text}</p>${ev.effectsHtml||''}</div>
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
