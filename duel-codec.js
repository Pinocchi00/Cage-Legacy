"use strict";
/* CAGE LEGACY — duel-codec.js
   ============================================================================
   LOT DUEL-01 — "Duel entre amis" (Carrière Complète).
   Codec (encodage/décodage/validation), PRNG déterministe, et moteur de série
   (best-of-3) du duel d'exhibition entre deux combattants EN COURS DE
   CARRIÈRE, partagés via un code texte copiable entre deux appareils.

   Zéro dépendance à G : toutes les fonctions ci-dessous prennent des objets
   explicites en paramètre et ne lisent/écrivent jamais l'état global. C'est
   ui-10-duel.js (écrans + CL) qui fait le pont avec G, jamais ce fichier.

   Dépend de engine.js (ATTR_KEYS, allDivisions, STYLE_KEYS, makeFighter,
   clamp, num, styleLabel, overall, isDecisionLike), data-skills.js (SKILLS)
   et engine-combat.js (simulateFight) : chargé après eux. N'a pas besoin de
   state/*.js ni de ui-0X-*.js — chargé juste avant ui-10-duel.js.
   ============================================================================ */

/* ==== [ANCRE: DUEL_CODEC] — LOT DUEL-01 ====
   Format de code : "CLD1." + payload base64url(UTF-8 JSON) + "." + checksum
   4 caractères. Le payload est un TABLEAU à ordre de champs FIXE (pas un
   objet), volontairement réduit à ce que le combat et l'affichage ont
   réellement besoin (fiche compacte, jamais la sauvegarde complète) :
   [name, nick, divIdx, styleIdx, W, L, D, attrs[30], skillIdx[], flag, sig]
   divIdx/styleIdx/skillIdx sont des INDEX dans des tables globales stables
   (allDivisions(), STYLE_KEYS, SKILLS) plutôt que les chaînes elles-mêmes —
   c'est ce qui tient un combattant réel (avec une dizaine de compétences)
   sous la barre des 400 caractères visée par le lot. */
const DUEL_CODE_PREFIX='CLD1';

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

/** Construit la fiche compacte (tableau à ordre fixe) à partir d'un
 * combattant réel (G.f). Ne mute jamais f. @param {Fighter} f @returns {Array} */
function buildDuelFiche(f){
  const attrs=ATTR_KEYS.map(k=>duelClampInt(f.attrs&&f.attrs[k],50,0,100));
  const allSkills=SKILLS, ownedIds=Array.isArray(f.skills)?f.skills:[];
  const skillIdx=ownedIds.map(id=>allSkills.findIndex(s=>s.id===id)).filter(i=>i>=0).slice(0,60);
  const divIdx=Math.max(0,allDivisions().findIndex(d=>d.id===f.div));
  const styleIdx=Math.max(0,STYLE_KEYS.indexOf(f.style));
  const sig=(f.signatureMove&&f.signatureMove.name)?String(f.signatureMove.customSuffix?`${f.signatureMove.name} ${f.signatureMove.customSuffix}`:f.signatureMove.name):'';
  return [
    duelSafeStr(f.name||f.first||'',40,'Combattant'),
    duelSafeStr(f.nick||'',24,''),
    divIdx, styleIdx,
    duelClampInt(f.W,0,0,999), duelClampInt(f.L,0,0,999), duelClampInt(f.D,0,0,999),
    attrs, skillIdx,
    duelSafeStr(f.flag||'',8,''),
    duelSafeStr(sig,30,'')
  ];
}

/** Encode un combattant en code de duel partageable. Ne lance jamais
 * d'exception : renvoie null en cas d'échec. @param {Fighter} f @returns {?string} */
function encodeDuelCode(f){
  try{
    const payload=duelUtf8ToBase64Url(JSON.stringify(buildDuelFiche(f)));
    return `${DUEL_CODE_PREFIX}.${payload}.${duelChecksum4(payload)}`;
  }catch(e){ return null; }
}

/** Décode un code de duel. NE LANCE JAMAIS D'EXCEPTION : {ok:false,reason} en
 * cas de code absent/tronqué/corrompu/trafiqué, {ok:true,fighter} sinon.
 * fighter est une fiche VALIDÉE ET BORNÉE — jamais de NaN/Infinity, jamais de
 * chaîne surdimensionnée, jamais de div/style/compétence inconnus du jeu.
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
    if(parts.length!==3) return {ok:false,reason:'format inattendu'};
    const [pfxRaw,payload,sum]=parts;
    // Normalisation de la casse du préfixe uniquement — le payload base64url
    // est sensible à la casse, jamais touché.
    if(pfxRaw.toUpperCase()!==DUEL_CODE_PREFIX) return {ok:false,reason:'préfixe inconnu'};
    if(!payload || duelChecksum4(payload)!==sum) return {ok:false,reason:'somme de contrôle invalide'};
    let json;
    try{ json=duelBase64UrlToUtf8(payload); }catch(e){ return {ok:false,reason:'payload illisible'}; }
    let arr;
    try{ arr=JSON.parse(json); }catch(e){ return {ok:false,reason:'payload corrompu'}; }
    if(!Array.isArray(arr)||arr.length<11) return {ok:false,reason:'structure inattendue'};
    const [name,nick,divIdxRaw,styleIdxRaw,W,L,D,attrsRaw,skillIdxRaw,flag,sig]=arr;
    const divs=allDivisions();
    const divIdx=duelClampInt(divIdxRaw,0,0,divs.length-1);
    const div=(divs[divIdx]||divs[0]).id;
    const styleIdx=duelClampInt(styleIdxRaw,0,0,STYLE_KEYS.length-1);
    const style=STYLE_KEYS[styleIdx]||STYLE_KEYS[0];
    const gender=(DIVISIONS.F.some(d=>d.id===div))?'F':'H';
    const attrs={};
    ATTR_KEYS.forEach((k,i)=>{ attrs[k]=duelClampInt(Array.isArray(attrsRaw)?attrsRaw[i]:undefined,50,0,100); });
    const skills=(Array.isArray(skillIdxRaw)?skillIdxRaw:[])
      .map(i=>duelClampInt(i,-1,-1,SKILLS.length-1))
      .filter(i=>i>=0 && SKILLS[i])
      .map(i=>SKILLS[i].id)
      .slice(0,60);
    const fighter={
      name:duelSafeStr(name,40,'Combattant'), nick:duelSafeStr(nick,24,''),
      div, gender, style,
      W:duelClampInt(W,0,0,999), L:duelClampInt(L,0,0,999), D:duelClampInt(D,0,0,999),
      attrs, skills,
      flag:duelSafeStr(flag,8,''), sig:duelSafeStr(sig,30,'')
    };
    return {ok:true,fighter};
  }catch(e){ return {ok:false,reason:'code corrompu'}; }
}

/** Reconstruit un Fighter complet (compatible simulateFight/eff()) à partir
 * d'une fiche décodée. sig (prise signature) reste une métadonnée
 * d'affichage — on ne connaît ni son type (ko/sub) ni sa zone à partir du
 * seul nom, donc on ne la câble jamais dans f.signatureMove pour ne pas
 * fausser silencieusement le tirage des finitions. Jamais de mutation de
 * `fiche` lui-même. @param {object} fiche @returns {Fighter} */
function duelFicheToFighter(fiche){
  const f=makeFighter({gender:fiche.gender,div:fiche.div,style:fiche.style,first:fiche.name,age:28,level:50});
  f.name=fiche.name; f.first=fiche.name; f.last=fiche.name; f.nick=fiche.nick||null;
  if(fiche.flag) f.flag=fiche.flag;
  f.styleLabel=styleLabel(fiche.style);
  f.attrs=Object.assign({},fiche.attrs);
  f.skills=fiche.skills.slice();
  f.W=fiche.W; f.L=fiche.L; f.D=fiche.D;
  f.overall=overall(f);
  f._duelSigDisplay=fiche.sig||'';
  return f;
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
    const baseA=duelFicheToFighter(ficheCanonA), baseB=duelFicheToFighter(ficheCanonB);
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
