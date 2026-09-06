"use strict";
/* CAGE LEGACY — duel-codec.js
   ============================================================================
   LOT DUEL-01 — "Duel entre amis" (Carrière Complète), LOT DUEL-03 — duel
   sur légendes du Panthéon (le combattant de carrière en cours, G.f, n'est
   plus jamais concerné par ce fichier : chaque code encode une ENTRÉE DU
   PANTHÉON — la forme produite par enshrine()/loadHOF(), state-hof.js —
   jamais un Fighter de carrière vivant).

   Codec (encodage/décodage/validation), PRNG déterministe, et moteur de série
   (best-of-3) du duel d'exhibition entre deux légendes retraitées, partagées
   via un code texte copiable entre deux appareils.

   Zéro dépendance à G : toutes les fonctions ci-dessous prennent des objets
   explicites en paramètre et ne lisent/écrivent jamais l'état global. C'est
   ui-10-duel.js (écrans + CL) qui fait le pont avec G, jamais ce fichier.

   Dépend de engine.js (ATTR_KEYS, allDivisions, STYLE_KEYS, makeFighter,
   clamp, num, styleLabel, overall, isDecisionLike), data-skills.js (SKILLS)
   et engine-combat.js (simulateFight) : chargé après eux. Dépend aussi de
   reconstructLegend()/neutralizeWeightGap() (ui-01-roster-matchmaking.js,
   déjà utilisées par Fantasy Fight/All-Stars pour la même reconstruction
   fidèle d'une entrée du Panthéon) — jamais un second système de
   reconstruction parallèle. Chargé juste avant ui-10-duel.js.
   ============================================================================ */

/* ==== [ANCRE: DUEL_CODEC] — LOT DUEL-01, révisé LOT DUEL-03 (Panthéon) ====
   Format de code : "CLD2." + payload base64url(UTF-8 JSON) + "." + checksum
   4 caractères. CLD2 (et non plus CLD1) car le payload change de forme —
   voir duelLooksLikeOldLegendCode()/DUEL_CODE_PREFIX_OLD plus bas pour la
   détection d'un ancien code encore en circulation. Le payload est un
   TABLEAU à ordre de champs FIXE (pas un objet), volontairement réduit à ce
   que le combat et l'affichage ont réellement besoin (fiche compacte,
   jamais l'entrée complète du Panthéon) :
   [name, nick, divIdx, styleIdx, W, L, ko, sub, attrs[30], skillIdx[], flag, sig]
   divIdx/styleIdx/skillIdx sont des INDEX dans des tables globales stables
   (allDivisions(), STYLE_KEYS, SKILLS) plutôt que les chaînes elles-mêmes —
   c'est ce qui tient une légende réelle (avec une dizaine de compétences)
   sous la barre des 400 caractères visée par le lot. */
const DUEL_CODE_PREFIX='CLD2';
/** Ancien préfixe LOT DUEL-01 (payload [...,W,L,D,...], combattant de
 * carrière). Un code qui le porte encore est PÉRIMÉ, pas invalide : voir
 * decodeDuelCode() — reason:'version_precedente' plutôt que 'préfixe
 * inconnu', pour un message clair côté écran ("redemande-le à ton ami")
 * plutôt qu'un générique "code invalide". */
const DUEL_CODE_PREFIX_OLD='CLD1';

/** FNV-1a 32 bits — hash de chaîne pur, utilisé pour la somme de contrôle du
 * code ET pour dériver les graines déterministes de chaque manche.
 * @param {string} str @returns {number} entier non signé 32 bits */
function duelFnv1a32(str){
  let h=0x811c9dc5;
  for(let i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=Math.imul(h,0x01000193); }
  return h>>>0;
}
/** mulberry32 — PRNG déterministe léger (même sortie pour une même graine,
 * sur n'importe quel appareil). @param {number} seed @returns {()=>number} */
function mulberry32(seed){
  let t=(seed>>>0)||1;
  return function(){
    t|=0; t=(t+0x6D2B79F5)|0;
    let r=Math.imul(t^(t>>>15),1|t);
    r=(r+Math.imul(r^(r>>>7),61|r))^r;
    return ((r^(r>>>14))>>>0)/4294967296;
  };
}
function duelChecksum4(payload){ return duelFnv1a32(payload).toString(36).padStart(4,'0').slice(-4); }

function duelUtf8ToBase64Url(str){
  const bytes=new TextEncoder().encode(str);
  let bin=''; for(let i=0;i<bytes.length;i++) bin+=String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function duelBase64UrlToUtf8(str){
  let b64=str.replace(/-/g,'+').replace(/_/g,'/');
  while(b64.length%4) b64+='=';
  const bin=atob(b64);
  const bytes=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/** Entier borné, jamais NaN/Infinity — coeur du bornage défensif du décodage.
 * @param {*} v @param {number} def @param {number} lo @param {number} hi @returns {number} */
function duelClampInt(v,def,lo,hi){
  let n=Number(v);
  if(!Number.isFinite(n)) n=def;
  n=Math.round(n);
  if(n<lo) n=lo; if(n>hi) n=hi;
  return n;
}
/** Chaîne bornée en longueur, jamais autre chose qu'une chaîne.
 * @param {*} v @param {number} maxLen @param {string} def @returns {string} */
function duelSafeStr(v,maxLen,def){
  if(typeof v!=='string') return def;
  const t=v.slice(0,maxLen);
  return t.length?t:def;
}

/** Construit la fiche compacte (tableau à ordre fixe) à partir d'une entrée
 * du Panthéon (forme loadHOF()/enshrine() : l.div/l.styleKey sont les VRAIS
 * ID de division/style, l.style est le libellé d'affichage — jamais
 * l'inverse). Ne mute jamais l. @param {object} l @returns {Array} */
function buildDuelFiche(l){
  const attrs=ATTR_KEYS.map(k=>duelClampInt(l.attrs&&l.attrs[k],50,0,100));
  const allSkills=SKILLS, ownedIds=Array.isArray(l.skills)?l.skills:[];
  const skillIdx=ownedIds.map(id=>allSkills.findIndex(s=>s.id===id)).filter(i=>i>=0).slice(0,60);
  const divIdx=Math.max(0,allDivisions().findIndex(d=>d.id===l.div));
  const styleIdx=Math.max(0,STYLE_KEYS.indexOf(l.styleKey||l.style));
  const sig=(l.signatureMove&&l.signatureMove.name)?String(l.signatureMove.customSuffix?`${l.signatureMove.name} ${l.signatureMove.customSuffix}`:l.signatureMove.name):'';
  return [
    duelSafeStr(l.name||'',40,'Combattant'),
    duelSafeStr(l.nick||'',24,''),
    divIdx, styleIdx,
    duelClampInt(l.W,0,0,999), duelClampInt(l.L,0,0,999),
    duelClampInt(l.ko,0,0,999), duelClampInt(l.sub,0,0,999),
    attrs, skillIdx,
    duelSafeStr(l.flag||'',8,''),
    duelSafeStr(sig,30,'')
  ];
}

/** Encode une entrée du Panthéon en code de duel partageable. Ne lance
 * jamais d'exception : renvoie null en cas d'échec. @param {object} l entrée
 * loadHOF() (ou objet de même forme) @returns {?string} */
function encodeDuelCode(l){
  try{
    const payload=duelUtf8ToBase64Url(JSON.stringify(buildDuelFiche(l)));
    return `${DUEL_CODE_PREFIX}.${payload}.${duelChecksum4(payload)}`;
  }catch(e){ return null; }
}

/** Un ancien code "Vs Ami" (fonctionnalité retirée, LOT DUEL-03) était un
 * simple blob base64(UTF-8 JSON), jamais le format à trois segments pointés
 * de ce codec — jamais de lancer d'exception. @param {string} s @returns {boolean} */
function duelLooksLikeOldLegendCode(s){
  try{
    const obj=JSON.parse(decodeURIComponent(escape(atob(s))));
    return !!(obj && typeof obj==='object' && obj.name && obj.attrs);
  }catch(e){ return false; }
}

/** Décode un code de duel. NE LANCE JAMAIS D'EXCEPTION : {ok:false,reason} en
 * cas de code absent/tronqué/corrompu/trafiqué, {ok:true,fighter} sinon.
 * fighter est une fiche VALIDÉE ET BORNÉE, de la même forme qu'une entrée du
 * Panthéon (name/nick/div/styleKey/style/divName/W/L/ko/sub/attrs/skills/
 * flag/overall) — jamais de NaN/Infinity, jamais de chaîne surdimensionnée,
 * jamais de div/style/compétence inconnus du jeu. reason:'version_precedente'
 * (jamais un message générique) quand le code porte l'ancien préfixe CLD1 ou
 * ressemble à un ancien export "Vs Ami" — un lien PÉRIMÉ n'est pas un lien
 * INVALIDE, voir FEEDBACK_LIEN_AMI (ui-08/main.js).
 * @param {string} raw @returns {{ok:false,reason:string}|{ok:true,fighter:object}} */
function decodeDuelCode(raw){
  try{
    if(typeof raw!=='string') return {ok:false,reason:'code absent'};
    // Trim + suppression de tout espace/retour à la ligne/caractère invisible
    // (l'autocapitalisation/l'autocorrection mobile ou un copier-coller
    // multi-lignes ne doivent jamais faire échouer un code par ailleurs bon).
    const s=raw.trim().replace(/[\s\u200B-\u200D\uFEFF\u00A0]/g,'');
    if(!s) return {ok:false,reason:'code vide'};
    const parts=s.split('.');
    if(parts.length!==3) return {ok:false,reason:duelLooksLikeOldLegendCode(s)?'version_precedente':'format inattendu'};
    const [pfxRaw,payload,sum]=parts;
    // Normalisation de la casse du préfixe uniquement — le payload base64url
    // est sensible à la casse, jamais touché.
    const pfxUp=pfxRaw.toUpperCase();
    if(pfxUp===DUEL_CODE_PREFIX_OLD) return {ok:false,reason:'version_precedente'};
    if(pfxUp!==DUEL_CODE_PREFIX) return {ok:false,reason:'préfixe inconnu'};
    if(!payload || duelChecksum4(payload)!==sum) return {ok:false,reason:'somme de contrôle invalide'};
    let json;
    try{ json=duelBase64UrlToUtf8(payload); }catch(e){ return {ok:false,reason:'payload illisible'}; }
    let arr;
    try{ arr=JSON.parse(json); }catch(e){ return {ok:false,reason:'payload corrompu'}; }
    if(!Array.isArray(arr)||arr.length<12) return {ok:false,reason:'structure inattendue'};
    const [name,nick,divIdxRaw,styleIdxRaw,W,L,ko,sub,attrsRaw,skillIdxRaw,flag,sig]=arr;
    const divs=allDivisions();
    const divIdx=duelClampInt(divIdxRaw,0,0,divs.length-1);
    const divObj=divs[divIdx]||divs[0];
    const styleIdx=duelClampInt(styleIdxRaw,0,0,STYLE_KEYS.length-1);
    const styleKey=STYLE_KEYS[styleIdx]||STYLE_KEYS[0];
    const attrs={};
    ATTR_KEYS.forEach((k,i)=>{ attrs[k]=duelClampInt(Array.isArray(attrsRaw)?attrsRaw[i]:undefined,50,0,100); });
    const skills=(Array.isArray(skillIdxRaw)?skillIdxRaw:[])
      .map(i=>duelClampInt(i,-1,-1,SKILLS.length-1))
      .filter(i=>i>=0 && SKILLS[i])
      .map(i=>SKILLS[i].id)
      .slice(0,60);
    const fighter={
      name:duelSafeStr(name,40,'Combattant'), nick:duelSafeStr(nick,24,''),
      div:divObj.id, divName:divObj.name||'', styleKey, style:styleLabel(styleKey),
      W:duelClampInt(W,0,0,999), L:duelClampInt(L,0,0,999),
      ko:duelClampInt(ko,0,0,999), sub:duelClampInt(sub,0,0,999),
      attrs, skills, overall:overall({attrs}),
      flag:duelSafeStr(flag,8,''), sig:duelSafeStr(sig,30,'')
    };
    return {ok:true,fighter};
  }catch(e){ return {ok:false,reason:'code corrompu'}; }
}
/* ==== [FIN ANCRE] ==== */

/* ==== [ANCRE: DUEL_SERIE] — LOT DUEL-01, avenant "Format en trois manches"
   Série au meilleur des trois : manche 1 et 2 sur 3 rounds, manche 3 (si et
   seulement si 1-1 après la manche 2) sur 5 rounds. Chaque manche est jouée
   sur un CLONE profond des combattants reconstruits une seule fois à partir
   des fiches décodées d'origine (jamais mutées) ; seule la fatigue accumulée
   traverse les manches. ==== */

/** Clone profond d'un Fighter reconstruit — jamais la fiche source elle-même.
 * @param {Fighter} f @returns {Fighter} */
function cloneDuelFighter(f){ return JSON.parse(JSON.stringify(f)); }

/** Malus de fatigue sur cardio/durability (les deux attributs qui portent
 * concrètement "l'endurance" côté eff()), plafonné à 25% de la valeur de
 * base de CHAQUE attribut pris isolément — jamais 25% d'un seul canal
 * partagé entre les deux. Le système de blessures (dmgHead/dmgBody/dmgLegs)
 * n'est jamais touché : la fatigue de duel est un mécanisme strictement
 * local, jamais écrit sur G. @param {Fighter} f @param {number} fatigue */
function applyDuelFatigue(f,fatigue){
  const baseCardio=f.attrs.cardio, baseDurability=f.attrs.durability;
  const malusCardio=Math.min(Math.max(fatigue,0),baseCardio*0.25);
  const malusDurability=Math.min(Math.max(fatigue,0),baseDurability*0.25);
  f.attrs.cardio=clamp(baseCardio-malusCardio,0,100);
  f.attrs.durability=clamp(baseDurability-malusDurability,0,100);
}

/** Rounds réellement disputés dans une manche : le round de la finition s'il
 * y en a une, sinon la longueur totale de la manche (décision/nul, jusqu'au
 * bout). @param {object} res @param {number} mancheRounds @returns {number} */
function duelRoundsDisputed(res,mancheRounds){ return (res.round!=null)?res.round:mancheRounds; }

/** Lance UNE manche avec un PRNG semé, en patchant le point d'entrée RÉEL de
 * l'aléatoire du moteur (`rnd()`, engine.js) — simulateFight() n'appelle
 * JAMAIS Math.random() directement, patcher Math.random n'aurait aucun
 * effet sur le résultat. Toujours restauré, y compris si simulateFight
 * lève. @param {Fighter} A @param {Fighter} B @param {number} rounds @param {number} seed @returns {object} */
function runSeededDuelFight(A,B,rounds,seed){
  const originalRnd=window.rnd;
  window.rnd=mulberry32(seed);
  try{ return simulateFight(A,B,rounds); }
  finally{ window.rnd=originalRnd; }
}

/** Départage explicite d'une série qui n'a produit aucun 2-0/2-1 net (score
 * de manches 1-1-1 ou 0-0-3, seulement possible si le moteur a rendu au
 * moins un nul de manche) : 1) plus de finitions, 2) plus de "rounds
 * gagnés" (toutes les rounds de la manche pour le vainqueur — res.winner
 * est déjà l'issue AUTORITATIVE posée par le moteur, judgesVerdict() y
 * compris pour une décision ; jamais re-dérivée d'une comparaison de score
 * séparée qui pourrait diverger sur un verdict majoritaire/partagé ;
 * partagée à égalité sur une manche réellement nulle), 3) avantage au
 * challenger (celui qui a collé le code de l'autre). Toujours défini —
 * jamais de résultat implicite. Pur et testable indépendamment de
 * simulateFight(). @param {Array} manches @param {boolean} selfIsCanonicalA @returns {'self'|'friend'} */
function resolveDuelTie(manches,selfIsCanonicalA){
  const sideOf=winSide=>{
    if(winSide==='D') return 'draw';
    const aIsSelf=selfIsCanonicalA;
    return (winSide==='A')?(aIsSelf?'self':'friend'):(aIsSelf?'friend':'self');
  };
  let finSelf=0,finFriend=0,rndSelf=0,rndFriend=0;
  manches.forEach(m=>{
    const decisionLike=isDecisionLike(m.res.method);
    const side=sideOf(m.winSide);
    if(!decisionLike){ if(side==='self') finSelf++; else if(side==='friend') finFriend++; }
    if(side==='self') rndSelf+=m.rounds;
    else if(side==='friend') rndFriend+=m.rounds;
    else { rndSelf+=m.rounds/2; rndFriend+=m.rounds/2; }
  });
  if(finSelf!==finFriend) return finSelf>finFriend?'self':'friend';
  if(rndSelf!==rndFriend) return rndSelf>rndFriend?'self':'friend';
  return 'friend'; // avantage au challenger, faute d'autre écart mesurable
}

/** Simule la série complète de duel entre deux codes. Exhibition PURE :
 * aucune lecture ni écriture de G, aucun appel à save(). L'ordre des deux
 * codes ne change jamais QUI gagne (canonicalisation interne par tri
 * lexicographique des codes avant de décider qui est "A"/"B" côté moteur) —
 * seul le départage final ("avantage au challenger") reste sensible au rôle
 * self/friend, par construction (c'est le sens même de la règle).
 * Les deux fiches décodées passent par reconstructLegend() (LOT DUEL-03,
 * ui-01-roster-matchmaking.js — même reconstruction que Fantasy Fight/
 * All-Stars, jamais un second système parallèle) puis neutralizeWeightGap()
 * AVANT toute simulation, une seule fois pour les deux bases : deux légendes
 * de divisions différentes ne doivent jamais se départager sur l'allonge.
 * @param {string} codeSelf mon propre code (généré localement)
 * @param {string} codeFriend le code collé de l'ami (le "challenger")
 * @returns {{ok:false,reason:string}|{ok:true,self:object,friend:object,
 *   manches:Array,score:{self:number,friend:number},decider:boolean,
 *   tieBreak:boolean,seriesWinner:'self'|'friend'}} */
function simulateDuelSeries(codeSelf,codeFriend){
  try{
    const decSelf=decodeDuelCode(codeSelf), decFriend=decodeDuelCode(codeFriend);
    if(!decSelf.ok) return {ok:false,reason:'self:'+decSelf.reason};
    if(!decFriend.ok) return {ok:false,reason:'friend:'+decFriend.reason};
    const rawSelf=String(codeSelf).trim(), rawFriend=String(codeFriend).trim();
    const sorted=[rawSelf,rawFriend].slice().sort();
    const selfIsCanonicalA=(sorted[0]===rawSelf);
    const ficheCanonA=selfIsCanonicalA?decSelf.fighter:decFriend.fighter;
    const ficheCanonB=selfIsCanonicalA?decFriend.fighter:decSelf.fighter;
    const seedBase=duelFnv1a32(sorted.join(''));
    const baseA=reconstructLegend(ficheCanonA), baseB=reconstructLegend(ficheCanonB);
    neutralizeWeightGap(baseA,baseB);
    baseA._duelSigDisplay=ficheCanonA.sig||''; baseB._duelSigDisplay=ficheCanonB.sig||'';
    let fatigueA=0,fatigueB=0;
    const mancheRoundsSeq=[3,3,5];
    const manches=[]; let scoreA=0,scoreB=0;
    for(let i=1;i<=3;i++){
      if(i===3 && !(scoreA===1 && scoreB===1)) break;
      const rounds=mancheRoundsSeq[i-1];
      const cloneA=cloneDuelFighter(baseA), cloneB=cloneDuelFighter(baseB);
      applyDuelFatigue(cloneA,fatigueA); applyDuelFatigue(cloneB,fatigueB);
      const seed=duelFnv1a32(String(seedBase)+'#'+i);
      const res=runSeededDuelFight(cloneA,cloneB,rounds,seed);
      const rd=duelRoundsDisputed(res,rounds);
      fatigueA+=rd*3; fatigueB+=rd*3;
      if(!isDecisionLike(res.method)){
        if(res.winner==='A') fatigueB+=10; else if(res.winner==='B') fatigueA+=10;
      }
      if(res.winner==='A') scoreA++; else if(res.winner==='B') scoreB++;
      manches.push({index:i,rounds,res,winSide:res.winner,fighterA:cloneA,fighterB:cloneB});
      if(scoreA>=2||scoreB>=2) break;
    }
    let seriesWinnerSide, tieBreak=false;
    if(scoreA>=2) seriesWinnerSide=selfIsCanonicalA?'self':'friend';
    else if(scoreB>=2) seriesWinnerSide=selfIsCanonicalA?'friend':'self';
    else { tieBreak=true; seriesWinnerSide=resolveDuelTie(manches,selfIsCanonicalA); }
    const toSelfFriend=winSide=>{
      if(winSide==='D') return 'draw';
      return (winSide==='A')?(selfIsCanonicalA?'self':'friend'):(selfIsCanonicalA?'friend':'self');
    };
    const outManches=manches.map(m=>({
      index:m.index, rounds:m.rounds, res:m.res, winner:toSelfFriend(m.winSide),
      selfFighter:selfIsCanonicalA?m.fighterA:m.fighterB,
      friendFighter:selfIsCanonicalA?m.fighterB:m.fighterA
    }));
    const scoreSelf=selfIsCanonicalA?scoreA:scoreB, scoreFriend=selfIsCanonicalA?scoreB:scoreA;
    return {
      ok:true,
      self:decSelf.fighter, friend:decFriend.fighter,
      manches:outManches,
      score:{self:scoreSelf,friend:scoreFriend},
      decider:outManches.length===3,
      tieBreak,
      seriesWinner:seriesWinnerSide
    };
  }catch(e){ return {ok:false,reason:'exception : '+(e&&e.message||e)}; }
}
/* ==== [FIN ANCRE] ==== */
