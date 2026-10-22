'use strict';
const L = require('./lib.js');
const { C, XC, OCT, cham, big, txt, lab, key, tile, plus, moins, quest, fleche, haut, bas, coche, btnJaune, btnSombre, btnClair, onglets, panneau, ligneStat, planche, entete, banniere, octDot, octBadge, octRing, BTN, jauge } = L;

const ONGLETS_FICHE = ['APERÇU', 'STYLE', 'STATISTIQUES', 'COMBATS', 'CONTRAT', 'ON EN DIT'];
const SWAT = { prenom: 'YOUSSEF', surnom: 'LE COMPAS', nom: 'SWAT', palmares: '11-2-0', forme: ['V', 'V', 'D'], rang: 'N°2', cat: 'POIDS<br>LÉGER' };

/* Le bouton Suivre, état « suivi ». */
const suivi = `<div style="display: flex; align-items: center; gap: 14px">${key('S')}<button type="button" style="${BTN}; background: ${C.yel}; color: ${C.bg}; ${cham(10)}; height: 56px; padding: 0 20px; display: flex; align-items: center; gap: 10px; white-space: nowrap">${coche()}<span style="${XC}; font-size: 32px; line-height: 1">SUIVI</span></button></div>`;
const rangeeOnglets = actif => `<div style="height: 56px; flex: none; display: flex; justify-content: space-between; align-items: center">${onglets(ONGLETS_FICHE, actif)}${suivi}</div>`;
const touchesFiche = [[['Échap'], 'Retour'], [['←', '→'], 'Autre combattant'], [['Tab'], 'Onglet'], [['S'], 'Suivre'], [['Entrée'], 'Préparer son combat', true]];

/* ============ 1. Fiche — onglet Statistiques ============ */
function ficheStats() {
  const debout = panneau(`<div style="flex: 1; display: flex; flex-direction: column; justify-content: space-around; margin-top: 6px">
${ligneStat('Coups significatifs donnés par minute', '3,12', '', 52, 64, 'moy. 3,86 · 21e')}
${ligneStat('Précision', '58', '%', 58, 46, 'moy. 46 % · 2e')}
${ligneStat('Encaissés par minute', '2,41', '', 40, 59, 'moy. 3,52 · 3e')}
${ligneStat('Défense debout', '64', '%', 64, 55, 'moy. 55 % · 4e')}
</div>`, { titre: 'DEBOUT', droite: lab('13 COMBATS DOCUMENTÉS'), flex: '1.15' });
  const sol = panneau(`<div style="flex: 1; display: flex; flex-direction: column; justify-content: space-around; margin-top: 6px">
${ligneStat('Amenées par 15 minutes', '0,3', '', 6, 32, 'moy. 1,6 · 27e')}
${ligneStat('Défense d’amenée', '71', '%', 71, 63, 'moy. 63 % · 6e')}
${ligneStat('Soumissions tentées par 15 min', '0,1', '', 4, 20, 'moy. 0,5')}
${ligneStat('Contrôle au sol par 15 minutes', '0:24', '', 8, 37, 'moy. 1:51')}
</div>`, { titre: 'AU SOL', droite: lab('RANG SUR 30 LÉGERS'), flex: '1' });
  /* Barres empilées : la part de chaque zone, libellés dessous. */
  const pile = (titre, parts) => `<div style="display: flex; flex-direction: column; gap: 10px">${lab(titre)}<div style="display: flex; gap: 4px; height: 40px">${parts.map(([l, p], i) => `<div style="flex: ${p}; min-width: 0; background: ${i === 0 ? C.ink : i === 1 ? 'rgba(233, 230, 225, 0.55)' : C.tile}; color: ${i === 2 ? C.ink : C.bg}; display: flex; align-items: center; padding: 0 10px; ${XC}; font-size: 28px; line-height: 1">${p}</div>`).join('')}</div><div style="display: flex; justify-content: space-between; gap: 12px; font-size: 22px; line-height: 1; white-space: nowrap"><div>${parts[0][0]}</div><div style="color: ${C.dim}">${parts.slice(1).map(([l]) => l).join(' · ')}</div></div></div>`;
  const vic = `<div style="display: flex; flex-direction: column; gap: 10px">${lab('SES 11 VICTOIRES')}<div style="display: flex; gap: 4px; height: 48px"><div style="flex: 3; background: ${C.red}; color: ${C.bg}; ${cham(8)}; display: flex; align-items: center; gap: 10px; padding: 0 12px; white-space: nowrap"><span style="${XC}; font-size: 34px; line-height: 1">3</span><span style="font-size: 22px; line-height: 1; font-weight: 600">KO</span></div><div style="flex: 8; background: ${C.tile}; ${cham(8)}; display: flex; align-items: center; gap: 10px; padding: 0 12px; white-space: nowrap"><span style="${XC}; font-size: 34px; line-height: 1">8</span><span style="font-size: 22px; line-height: 1">décisions · aucune soumission</span></div></div></div>`;
  const facon = panneau(`${vic}${pile('OÙ IL TOUCHE (%)', [['Tête', 61], ['Corps', 22], ['Jambes', 17]])}${pile('D’OÙ IL TOUCHE (%)', [['Distance', 88], ['Clinch', 9], ['Sol', 3]])}<div style="margin-top: auto; display: flex; justify-content: space-between; align-items: baseline"><div style="font-size: 24px; line-height: 1">Durée moyenne d’un combat</div>${big('13:04', 40)}</div>`, { titre: 'SA FAÇON DE GAGNER', flex: '1', gap: 18 });
  const corps = `${banniere(SWAT)}${rangeeOnglets('STATISTIQUES')}<div style="flex: 1; display: flex; gap: 16px; min-height: 0">${debout}${sol}${facon}</div>`;
  return planche({ titre: 'Fiche du combattant, onglet Statistiques', section: 'EFFECTIF', marques: ['ACCUEIL', 'CARTE', 'CONTRATS'], entete: entete('EFFECTIF', 'COMBATTANT', '3 / 30'), corps, touches: touchesFiche });
}

/* ============ 2. Fiche — Aperçu avec traits, surnom et mémoire ============ */
function trait(signe, nom, ligne, origine) {
  const marque = signe === '+' ? octBadge('+', 44, 34) : signe === '-' ? octBadge('–', 44, 34, C.red, C.bg) : octRing('?', 44, 30);
  return `<div style="background: ${signe === '?' ? 'transparent' : C.tile}; ${signe === '?' ? `border: 2px dashed ${C.l38}` : cham(12)}; padding: 12px 16px; display: flex; gap: 16px; align-items: center; flex: none">${marque}<div style="display: flex; flex-direction: column; gap: 9px; min-width: 0; flex: 1"><div style="display: flex; justify-content: space-between; align-items: baseline; gap: 12px">${big(nom, 30, 'line-height: 0.85')}<div style="font-size: 22px; line-height: 1; color: ${C.dim}; white-space: nowrap">${origine}</div></div><div style="font-size: 24px; line-height: 1.05">${ligne}</div></div></div>`;
}
function cageSvg(taille = 300) {
  return `<svg width="${taille}" height="${taille}" viewBox="0 0 250 250" fill="none" role="img" aria-label="La cage vue du dessus : en rouge là où il impose son combat, en hachuré là où il le subit" style="flex: none"><defs><pattern id="ha" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="9" height="9" fill="#252121"></rect><rect width="3" height="9" fill="#E9E6E1" fill-opacity="0.55"></rect></pattern></defs><path d="M76.12 7H173.88L243 76.12V173.88L173.88 243H76.12L7 173.88V76.12Z" fill="url(#ha)"></path><path d="M96.006 55H153.994L195 96.006V153.994L153.994 195H96.006L55 153.994V96.006Z" fill="#B32A1E"></path><path d="M76.12 7H173.88L243 76.12V173.88L173.88 243H76.12L7 173.88V76.12Z" stroke="#E9E6E1" stroke-width="4"></path><path d="M96.006 55H153.994L195 96.006V153.994L153.994 195H96.006L55 153.994V96.006Z" stroke="#E9E6E1" stroke-width="2"></path><circle cx="92" cy="158" r="12.7" fill="#E9E6E1" stroke="#0D0B0B" stroke-width="3"></circle><text x="92" y="164.358" text-anchor="middle" fill="#0D0B0B" style="${XC}; font-size: 18.7px">1</text><circle cx="164" cy="150" r="12.7" fill="#E9E6E1" stroke="#0D0B0B" stroke-width="3"></circle><text x="164" y="156.358" text-anchor="middle" fill="#0D0B0B" style="${XC}; font-size: 18.7px">2</text><circle cx="196" cy="62" r="12.7" fill="#E9E6E1" stroke="#0D0B0B" stroke-width="3"></circle><text x="196" y="68.358" text-anchor="middle" fill="#0D0B0B" style="${XC}; font-size: 18.7px">3</text><circle cx="125" cy="112" r="12.7" fill="#E9E6E1" stroke="#0D0B0B" stroke-width="3"></circle><text x="125" y="118.358" text-anchor="middle" fill="#0D0B0B" style="${XC}; font-size: 18.7px">4</text></svg>`;
}
function ficheApercu() {
  const traits = panneau(`<div style="display: flex; flex-direction: column; gap: 10px">
${trait('+', 'CONTREUR PATIENT', 'Attend l’erreur, contre du bras arrière', '9 combats sur 13')}
${trait('-', 'CRAQUE SOUS LA PRESSION', 'Recule droit quand on le colle au grillage', 'ses 2 défaites')}
${trait('+', 'VA AU BOUT', 'Jamais perdu un troisième round', '8 décisions sur 11')}
${trait('?', 'PAS ENCORE VU', 'Au sol, personne ne l’a jamais testé', 'caché')}
</div>`, { titre: 'CE QUI LE DISTINGUE', droite: lab('4 TRAITS'), flex: '1.15' });
  const cage = panneau(`<div style="flex: 1; display: flex; justify-content: center; align-items: center">${cageSvg(300)}</div><div style="display: flex; justify-content: space-between"><div style="display: flex; align-items: center; gap: 8px"><div style="width: 26px; height: 18px; flex: none; background: ${C.redDeep}"></div><div style="font-size: 22px; line-height: 1">Il impose</div></div><div style="display: flex; align-items: center; gap: 8px"><div style="width: 26px; height: 18px; flex: none; background: repeating-linear-gradient(45deg, rgba(233, 230, 225, 0.55) 0 3px, #252121 3px 9px)"></div><div style="font-size: 22px; line-height: 1">Il subit</div></div><div style="display: flex; align-items: center; gap: 8px"><div style="width: 24px; height: 24px; flex: none; border-radius: 50%; background: ${C.ink}; color: ${C.bg}; display: flex; align-items: center; justify-content: center; ${XC}; font-size: 22px; line-height: 1">1</div><div style="font-size: 22px; line-height: 1">Ses combats</div></div></div>`, { titre: 'DANS LA CAGE', flex: '0.8' });
  const case_ = (l, v) => `<div style="background: ${C.tile}; ${cham(10)}; height: 58px; padding: 0 12px; display: flex; flex-direction: column; justify-content: center; gap: 7px"><div style="font-weight: 600; font-size: 22px; line-height: 1; color: ${C.dim}; white-space: nowrap">${l}</div>${big(v, 32)}</div>`;
  const identite = panneau(`<div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px">${case_('Âge', '27 ANS')}${case_('Taille', '1,88 m')}${case_('Allonge', '1,98 m')}${case_('Garde', 'ORTHO.')}${case_('Chez Split', '2024')}${case_('Contrat', '3 COMBATS')}${case_('Mondial', '9e')}${case_('Surnom', 'SOIRÉE 58')}</div>`, { flex: 'none' });
  const souv = (t, s) => `<div style="display: flex; gap: 12px; align-items: center">${octDot(14, C.ink)}<div style="font-size: 24px; line-height: 1; flex: 1; white-space: nowrap">${t}</div><div style="font-size: 22px; line-height: 1; color: ${C.dim}; white-space: nowrap">${s}</div></div>`;
  const pense = panneau(`${lab('CE QU’IL PENSE DE TOI')}${big('TE DOIT SA CARRIÈRE', 50, `color: ${C.yel}`)}<div style="display: flex; flex-direction: column; gap: 12px; margin-top: auto">${souv('Le co-principal à Lyon, au pied levé', 'soirée 61')}${souv('Performance de la soirée, 50 000 €', 'soirée 62')}</div>`, { flex: '1', gap: 14 });
  const prochain = panneau(`<div style="display: flex; justify-content: space-between; align-items: center; gap: 12px"><div style="display: flex; flex-direction: column; gap: 10px">${lab('PROCHAIN COMBAT · SOIRÉE 64')}<div style="font-size: 24px; line-height: 1; white-space: nowrap">12 avril · contre Saygur Damagaev</div></div>${btnJaune('PRÉPARER', 'Entrée', 60, 32)}</div>`, { flex: 'none' });
  const droite = `<div style="flex: 1.25; display: flex; flex-direction: column; gap: 16px; min-width: 0">${identite}${pense}${prochain}</div>`;
  const corps = `${banniere(SWAT)}${rangeeOnglets('APERÇU')}<div style="flex: 1; display: flex; gap: 16px; min-height: 0">${traits}${cage}${droite}</div>`;
  return planche({ titre: 'Fiche du combattant, Aperçu avec ses traits', section: 'EFFECTIF', marques: ['ACCUEIL', 'CARTE', 'CONTRATS'], entete: entete('EFFECTIF', 'COMBATTANT', '3 / 30'), corps, touches: touchesFiche });
}

/* ============ 3. Le combat en chiffres (présentation) ============ */
function combatChiffres() {
  const ombre = 'text-shadow: 0 0 0 #000, 3px 3px 0 #0D0B0B';
  const chip = (t, neg) => `<div style="height: 38px; padding: 0 14px; display: flex; align-items: center; gap: 10px; background: rgba(13, 11, 11, 0.86); border: 2px solid ${neg ? C.red : C.l38}; ${XC}; font-size: 26px; line-height: 1; white-space: nowrap">${neg ? `<span style="color: ${C.red}">–</span>` : '<span>+</span>'}${t}</div>`;
  const cote = (prenom, nom, pal, info, chips, droite) => `<div style="display: flex; flex-direction: column; gap: 12px; align-items: ${droite ? 'flex-end' : 'flex-start'}">${big(prenom, 36, ombre)}${big(nom, 110, `line-height: 0.72; ${ombre}${droite ? `; color: ${C.red}` : ''}`)}<div style="display: flex; gap: 16px; align-items: baseline; flex-direction: ${droite ? 'row-reverse' : 'row'}">${big(pal, 34)}<div style="font-size: 24px; line-height: 1; color: ${C.dim}; white-space: nowrap">${info}</div></div><div style="display: flex; gap: 8px; flex-direction: ${droite ? 'row-reverse' : 'row'}">${chips}</div></div>`;
  const hero = `<div style="position: relative; height: 244px; flex: none; overflow: hidden; background: ${C.bg}"><img src="${L.TUNNEL}" alt="" style="position: absolute; left: -82px; top: -350px; display: block; width: 1728px; height: 972px; max-width: none"><div style="position: absolute; inset: 0; background: linear-gradient(90deg, rgba(13,11,11,0.15) 0%, rgba(13,11,11,0.75) 50%, rgba(13,11,11,0.15) 100%)"></div><div style="position: absolute; left: 32px; right: 32px; top: 20px; bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end">${cote('YOUSSEF « LE COMPAS »', 'SWAT', '11-2-0', 'N°2 · 27 ans · Lyon', chip('CONTREUR PATIENT') + chip('SOUS LA PRESSION', true), false)}<div style="align-self: center; display: flex; flex-direction: column; align-items: center; gap: 14px">${octRing('VS', 110, 54)}<div style="${XC}; font-size: 28px; line-height: 1; text-align: center">POIDS LÉGER<br>CO-PRINCIPAL · 3 ROUNDS</div></div>${cote('SAYGUR', 'DAMAGAEV', '14-3-0', 'N°4 · 30 ans · Makhatchkala', chip('COUPE LA CAGE') + chip('DIESEL'), true)}</div></div>`;
  /* Lignes miroir : la meilleure valeur est pleine, l’autre est en retrait. */
  const ligne = (lib, a, b, pa, pb, mieux) => {
    const ca = mieux === 'a' ? C.ink : 'rgba(233, 230, 225, 0.42)', cb = mieux === 'b' ? C.red : 'rgba(226, 58, 43, 0.42)';
    return `<div style="display: grid; grid-template-columns: 120px 1fr 380px 1fr 120px; align-items: center; gap: 16px; height: 31px"><div style="${XC}; font-size: 34px; line-height: 1; text-align: right; color: ${mieux === 'a' ? C.ink : C.dim}">${a}</div><div style="height: 16px; display: flex; justify-content: flex-end"><div style="width: ${pa}%; background: ${ca}"></div></div><div style="font-size: 24px; line-height: 1; text-align: center; white-space: nowrap">${lib}</div><div style="height: 16px; display: flex"><div style="width: ${pb}%; background: ${cb}"></div></div><div style="${XC}; font-size: 34px; line-height: 1; color: ${mieux === 'b' ? C.ink : C.dim}">${b}</div></div>`;
  };
  const table = panneau(`<div style="display: flex; flex-direction: column; gap: 2px">
${ligne('Taille', '1,88 m', '1,75 m', 94, 87, 'a')}
${ligne('Allonge', '1,98 m', '1,80 m', 99, 90, 'a')}
${ligne('Coups significatifs donnés par minute', '3,12', '4,47', 62, 89, 'b')}
${ligne('Précision', '58 %', '43 %', 58, 43, 'a')}
${ligne('Encaissés par minute', '2,41', '3,05', 48, 61, 'a')}
${ligne('Défense debout', '64 %', '52 %', 64, 52, 'a')}
${ligne('Amenées par 15 minutes', '0,3', '3,8', 6, 76, 'b')}
${ligne('Défense d’amenée', '71 %', '58 %', 71, 58, 'a')}
${ligne('Contrôle par 15 minutes', '0:24', '4:12', 8, 84, 'b')}
</div>`, { titre: '', flex: 'none', pad: 18 });
  const decide = (t) => `<div style="display: flex; gap: 14px; align-items: flex-start">${octDot(18, C.yel)}<div style="font-size: 24px; line-height: 1.15">${t}</div></div>`;
  const cle = panneau(`${lab('CE QUI VA DÉCIDER')}<div style="display: flex; flex-direction: column; gap: 12px">${decide('Damagaev amène <b>3,8 fois</b> par quart d’heure ; Swat en repousse <b>71 %</b>.')}${decide('Swat perd ses moyens sous la pression, et Damagaev coupe la cage.')}${decide('Damagaev est lent à démarrer : le premier round est à Swat.')}</div>`, { flex: '1.6', gap: 14 });
  const pr = (v, n, p) => `<div style="display: flex; justify-content: space-between; align-items: baseline"><div style="font-size: 24px; line-height: 1">${v}</div><div style="display: flex; gap: 10px; align-items: baseline"><div style="font-size: 24px; line-height: 1; color: ${C.dim}">${n}</div>${big(p, 34)}</div></div>`;
  const pronos = panneau(`${lab('LES PRONOSTICS · TROIS VOIX')}<div style="display: flex; flex-direction: column; gap: 14px">${pr('Cage Hebdo', 'Damagaev', '61 %')}${pr('Tableau noir', 'Swat', 'aux points')}${pr('Le public', 'Damagaev', '57 %')}</div>`, { flex: '1', gap: 14 });
  const corps = `${hero}${table}<div style="flex: 1; display: flex; gap: 16px; min-height: 0">${cle}${pronos}</div>`;
  return planche({ titre: 'Présentation du combat, le face-à-face en chiffres', section: 'CARTE', marques: ['ACCUEIL', 'CONTRATS'], entete: entete('CARTE', 'PRÉSENTATION DU COMBAT', 'CO-PRINCIPAL'), corps, touches: [[['Échap'], 'Retour à la carte'], [['Tab'], 'Les chiffres · L’histoire · Les pronostics'], [['F'], 'Fiche de Swat'], [['G'], 'Fiche de Damagaev'], [['Entrée'], 'Confirmer le combat', true]] });
}

/* ============ 4. Le relevé round par round ============ */
function releve() {
  const tete = `<div style="height: 150px; flex: none; display: flex; justify-content: space-between; align-items: center; padding: 0 8px"><div style="display: flex; flex-direction: column; gap: 18px"><div style="display: flex; align-items: baseline; gap: 22px">${big('SWAT', 112)}${big('BAT', 56, `color: ${C.dim}`)}${big('DAMAGAEV', 112, `color: ${C.red}`)}</div><div style="display: flex; gap: 14px; align-items: center"><div style="background: ${C.ink}; color: ${C.bg}; ${cham(8)}; height: 40px; padding: 0 14px; display: flex; align-items: center; ${XC}; font-size: 28px; line-height: 1">DÉCISION PARTAGÉE</div><div style="font-size: 26px; line-height: 1">29-28, 28-29, 29-28 · Split Fight Night 64 · co-principal</div></div></div><div style="display: flex; gap: 12px">${btnSombre('TEMPS FORTS', 'T')}${btnJaune('REVOIR LE COMBAT', 'R')}</div></div>`;
  const tot = (lib, a, b, ia, ib) => `<div style="display: grid; grid-template-columns: 1fr 1.3fr 1fr; align-items: center; height: 52px; border-bottom: 2px solid ${C.l16}"><div style="display: flex; flex-direction: column; gap: 4px">${big(a, 36, ia ? '' : `color: ${C.dim}`)}</div><div style="font-size: 24px; line-height: 1.05; text-align: center">${lib}</div><div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-end">${big(b, 36, ib ? `color: ${C.red}` : `color: ${C.dim}`)}</div></div>`;
  const total = panneau(`<div style="display: grid; grid-template-columns: 1fr 1.3fr 1fr; align-items: center">${big('SWAT', 36)}<div></div>${big('DAMAGAEV', 36, `color: ${C.red}; text-align: right`)}</div><div style="display: flex; flex-direction: column">
${tot('Coups significatifs', '61 / 104', '48 / 131', 1, 0)}
${tot('Précision', '59 %', '37 %', 1, 0)}
${tot('Tête · corps · jambes', '38 · 14 · 9', '30 · 10 · 8', 1, 0)}
${tot('Amenées', '0 / 0', '2 / 9', 0, 1)}
${tot('Contrôle', '0:12', '3:41', 0, 1)}
${tot('Knockdowns', '1', '0', 1, 0)}
${tot('Soumissions tentées', '0', '1', 0, 1)}
</div>`, { titre: 'LE COMBAT EN CHIFFRES', flex: '1' });
  const round = (n, a, b, td, ctrl, juges, kd, tourne) => {
    const max = 32;
    const col = (v, c, l) => `<div style="display: flex; flex-direction: column; align-items: center; gap: 8px; width: 74px"><div style="${XC}; font-size: 32px; line-height: 1; color: ${c === C.red ? C.red : C.ink}">${v}</div><div style="width: 54px; height: ${Math.round(v / max * 170)}px; background: ${c}"></div><div style="font-size: 22px; line-height: 1; color: ${C.dim}">${l}</div></div>`;
    const j = juges.map(x => `<div style="flex: 1; height: 40px; ${cham(8)}; background: ${x === 'S' ? C.ink : C.red}; color: ${C.bg}; display: flex; align-items: center; justify-content: center; ${XC}; font-size: 26px; line-height: 1">${x === 'S' ? 'SWAT' : 'DAMA.'}</div>`).join('');
    return `<div style="flex: 1; min-width: 0; background: ${tourne ? 'rgba(240, 178, 32, 0.08)' : C.tile2}; ${tourne ? `border: 2px solid ${C.yel}` : ''}; ${cham(12)}; padding: 16px; display: flex; flex-direction: column; gap: 14px"><div style="display: flex; justify-content: space-between; align-items: center">${big('ROUND ' + n, 40)}${kd ? `<div style="background: ${C.yel}; color: ${C.bg}; ${cham(6)}; padding: 4px 10px; ${XC}; font-size: 24px; line-height: 1">KNOCKDOWN</div>` : ''}</div><div style="height: 230px; display: flex; align-items: flex-end; justify-content: center; gap: 22px">${col(a, C.ink, 'Swat')}${col(b, C.red, 'Damag.')}</div><div style="display: flex; flex-direction: column; gap: 8px; font-size: 22px; line-height: 1"><div style="display: flex; justify-content: space-between"><span style="color: ${C.dim}">Amenées</span><span>${td}</span></div><div style="display: flex; justify-content: space-between"><span style="color: ${C.dim}">Contrôle</span><span>${ctrl}</span></div></div><div style="display: flex; flex-direction: column; gap: 8px">${lab('LES TROIS JUGES')}<div style="display: flex; gap: 6px">${j}</div></div></div>`;
  };
  const rounds = panneau(`<div style="flex: 1; display: flex; gap: 12px; min-height: 0">${round(1, 24, 14, '0 / 2', '0:18 Damagaev', ['S', 'S', 'S'], false, false)}${round(2, 15, 19, '2 / 4', '2:47 Damagaev', ['D', 'D', 'D'], false, false)}${round(3, 22, 15, '0 / 3', '0:36 Damagaev', ['S', 'D', 'S'], true, true)}</div><div style="display: flex; gap: 14px; align-items: center; flex: none">${octDot(18, C.yel)}<div style="font-size: 24px; line-height: 1.1"><b>Le tournant, round 3, 1:48.</b> Damagaev l’enferme contre la cage ; Swat sort par la gauche et place le crochet arrière.</div></div>`, { titre: 'ROUND PAR ROUND', droite: lab('COUPS SIGNIFICATIFS TOUCHÉS'), flex: '1.45' });
  const corps = `${tete}<div style="flex: 1; display: flex; gap: 16px; min-height: 0">${total}${rounds}</div>`;
  return planche({ titre: 'Résultat d’un combat, le relevé round par round', section: 'RÉSULTATS', marques: ['ACCUEIL', 'ACTUALITÉS'], entete: entete('RÉSULTATS', 'SPLIT FIGHT NIGHT 64', '2 / 9'), corps, touches: [[['Échap'], 'Retour aux résultats'], [['←', '→'], 'Autre combat'], [['T'], 'Temps forts'], [['R'], 'Revoir le combat', true]] });
}

/* ============ 5. Classements — Les meilleurs ============ */
function meilleurs() {
  const carte = (titre, nom, val, unite, suiv, mis) => `<div style="flex: 1; min-width: 0; background: ${mis ? 'rgba(240, 178, 32, 0.08)' : C.tile2}; border: 2px solid ${mis ? C.yel : C.l16}; ${cham(14)}; padding: 20px; display: flex; flex-direction: column; gap: 14px">${lab(titre)}<div style="display: flex; align-items: baseline; gap: 8px">${big(val, 96, 'line-height: 0.75')}${unite ? big(unite, 36, `color: ${C.dim}`) : ''}</div>${big(nom, 40, 'line-height: 0.9')}<div style="margin-top: auto; display: flex; flex-direction: column; gap: 8px">${suiv.map(([n, v], i) => `<div style="display: flex; justify-content: space-between; font-size: 22px; line-height: 1; color: ${C.dim}"><span>${i + 2}. ${n}</span><span>${v}</span></div>`).join('')}</div></div>`;
  const rangee1 = `<div style="flex: 1; display: flex; gap: 16px; min-height: 0">
${carte('LE PLUS DE FINITIONS', 'RUSLAN KERIMOV', '9', '', [['Damagaev', '8'], ['Okafor', '6']])}
${carte('LE PLUS GROS VOLUME', 'SAYGUR DAMAGAEV', '4,47', '/ MIN', [['Okafor', '4,21'], ['Lindqvist', '4,02']])}
${carte('LE PLUS PRÉCIS', 'YOUSSEF SWAT', '58', '%', [['Chadaler', '54 %'], ['Kerimov', '51 %']], true)}
${carte('LA MEILLEURE DÉFENSE', 'CHUKWUDI OKAFOR', '67', '%', [['Swat', '64 %'], ['Montagné', '61 %']])}
</div>`;
  const rangee2 = `<div style="flex: 1; display: flex; gap: 16px; min-height: 0">
${carte('LE LUTTEUR', 'SAYGUR DAMAGAEV', '3,8', '/ 15 MIN', [['Kerimov', '3,1'], ['Pereira', '2,6']])}
${carte('LE MUR', 'ERIK LINDQVIST', '88', '%', [['Swat', '71 %'], ['Okafor', '70 %']])}
${carte('LE CHASSEUR DE COU', 'THIAGO PEREIRA', '2,1', '/ 15 MIN', [['Kerimov', '1,4'], ['Chun', '0,9']])}
${carte('LA PLUS LONGUE SÉRIE', 'MIN-JUN CHUN', '7', 'V', [['Kerimov', '5'], ['Swat', '4']])}
</div>`;
  const ruban = `<div style="height: 84px; flex: none; background: ${C.ink}; color: ${C.bg}; ${cham(14)}; display: flex; align-items: center; gap: 22px; padding: 0 26px"><div style="background: ${C.red}; color: ${C.bg}; ${cham(8)}; height: 48px; padding: 0 16px; display: flex; align-items: center; ${XC}; font-size: 30px; line-height: 1; white-space: nowrap">RECORD BATTU</div><div style="font-size: 26px; line-height: 1.1"><b>Damagaev, 131 coups significatifs tentés en trois rounds</b> à Split Fight Night 63. L’ancien record tenait depuis 2023 (Montagné, 124).</div><div style="margin-left: auto; display: flex; align-items: center; gap: 10px; white-space: nowrap">${L.keyDark('R')}<span style="${XC}; font-size: 30px; line-height: 1">LES RECORDS</span></div></div>`;
  const corps = `<div style="height: 56px; flex: none; display: flex; justify-content: space-between; align-items: center">${onglets(['SPLIT', 'MONDIAL', 'LES MEILLEURS', 'LES RECORDS'], 'LES MEILLEURS')}<div style="display: flex; gap: 8px">${onglets(['HOMMES', 'FEMMES'], 'HOMMES')}</div></div>${rangee1}${rangee2}${ruban}`;
  return planche({ titre: 'Classements, les meilleurs de la catégorie', section: 'CLASSEMENTS', marques: ['ACCUEIL', 'ACTUALITÉS'], entete: entete('CLASSEMENTS', 'HOMMES · POIDS LÉGER', ''), corps, touches: [[['Échap'], 'Accueil'], [['Tab'], 'Catégorie'], [['G'], 'Hommes ou femmes'], [['↑', '↓', '←', '→'], 'Choisir'], [['Entrée'], 'Ouvrir la fiche', true]] });
}

/* ============ 6. Classements — Les records de Split ============ */
function records() {
  const rec = (val, unite, lib, qui, quand, avant, neuf) => `<div style="display: grid; grid-template-columns: 210px 1fr; gap: 20px; align-items: center; padding: 14px 0; border-bottom: 2px solid ${C.l16}"><div style="display: flex; align-items: baseline; gap: 6px">${big(val, 72, `line-height: 0.75${neuf ? `; color: ${C.yel}` : ''}`)}${unite ? big(unite, 30, `color: ${C.dim}`) : ''}</div><div style="display: flex; flex-direction: column; gap: 8px; min-width: 0"><div style="display: flex; align-items: center; gap: 12px"><div style="font-size: 26px; line-height: 1.05">${lib}</div>${neuf ? `<div style="background: ${C.yel}; color: ${C.bg}; ${cham(6)}; padding: 3px 9px; ${XC}; font-size: 22px; line-height: 1; white-space: nowrap">NOUVEAU</div>` : ''}</div><div style="font-size: 22px; line-height: 1; color: ${C.dim}">${qui} · ${quand}${avant ? ' · avant : ' + avant : ''}</div></div></div>`;
  const combat = panneau(`<div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between">
${rec('131', '', 'Coups significatifs tentés en un combat', 'Saygur Damagaev', 'Split Fight Night 63', 'Montagné, 124', true)}
${rec('0:07', '', 'Le KO le plus rapide', 'Ruslan Kerimov', 'Split Fight Night 29, 2023', '')}
${rec('6', '', 'Amenées réussies en un combat', 'Thiago Pereira', 'Split Fight Night 44, 2024', '')}
${rec('4', '', 'Knockdowns dans un même combat', 'Guy Montagné contre Chun', 'Split Fight Night 18, 2022', '')}
${rec('11:52', '', 'Contrôle au sol en trois rounds', 'Saygur Damagaev', 'Split Fight Night 57, 2025', '')}
${rec('38', '', 'Coups au corps en un combat', 'Guy Montagné', 'Split Fight Night 51, 2025', '')}
</div>`, { titre: 'EN UN COMBAT', flex: '1' });
  const carriere = panneau(`<div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between">
${rec('9', '', 'Finitions chez Split', 'Ruslan Kerimov', 'depuis 2021', '')}
${rec('5', '', 'Défenses de titre de suite', 'Youcef Benamar', 'poids coq, 2021-2026', '')}
${rec('7', '', 'Victoires de suite', 'Min-jun Chun', 'en cours', '')}
${rec('22', '', 'Combats chez Split', 'Guy Montagné', 'depuis 2021', '')}
${rec('4', '', 'Primes de la soirée', 'Saygur Damagaev', 'deux combats, deux performances', '')}
${rec('22', 'ANS', 'Le plus jeune champion', 'Yaëlle Valentin', 'poids paille, 2026', '')}
</div>`, { titre: 'EN CARRIÈRE', flex: '1' });
  const corps = `<div style="height: 56px; flex: none; display: flex; justify-content: space-between; align-items: center">${onglets(['SPLIT', 'MONDIAL', 'LES MEILLEURS', 'LES RECORDS'], 'LES RECORDS')}<div style="font-size: 24px; line-height: 1; color: ${C.dim}">Tous les combats de Split depuis 2021, toutes catégories</div></div><div style="flex: 1; display: flex; gap: 16px; min-height: 0">${combat}${carriere}</div>`;
  return planche({ titre: 'Classements, le livre des records de Split', section: 'CLASSEMENTS', marques: ['ACCUEIL', 'ACTUALITÉS'], entete: entete('CLASSEMENTS', 'LE LIVRE DES RECORDS', ''), corps, touches: [[['Échap'], 'Accueil'], [['Tab'], 'Onglet'], [['↑', '↓'], 'Choisir'], [['Entrée'], 'Ouvrir la fiche', true]] });
}

/* ============ 7. Actualités ============ */
function actualites() {
  const suivi = (nom, org, n, espoir, actif) => `<div style="height: 54px; flex: none; display: flex; align-items: center; gap: 12px; padding: 0 12px; background: ${actif ? C.ink : 'transparent'}; color: ${actif ? C.bg : C.ink}; ${cham(8)}">${espoir ? octDot(16, actif ? C.bg : C.yel) : `<div style="width: 16px; flex: none"></div>`}<div style="display: flex; flex-direction: column; gap: 4px; min-width: 0; flex: 1"><div style="${XC}; font-size: 28px; line-height: 0.85; white-space: nowrap">${nom}</div><div style="font-size: 22px; line-height: 1; opacity: 0.8; white-space: nowrap">${org}</div></div>${n ? `<div style="min-width: 30px; height: 30px; ${OCT}; background: ${actif ? C.bg : C.yel}; color: ${actif ? C.ink : C.bg}; display: flex; align-items: center; justify-content: center; ${XC}; font-size: 22px; line-height: 1">${n}</div>` : ''}</div>`;
  const gauche = panneau(`<div style="display: flex; gap: 8px">${onglets(['TOUS', 'NON LUS'], 'TOUS')}</div><div style="display: flex; flex-direction: column; gap: 4px">${lab('TES ESPOIRS', 'margin: 4px 0 4px 12px')}
${suivi('ZAUR RASULOV', 'Split · mouche', 2, true, true)}
${suivi('ADILET ABDYLDAEV', 'Split · mi-lourd', 0, true, false)}
${suivi('BRUNO OKORO', 'Split · lourd', 1, true, false)}
${lab('TES SUIVIS', 'margin: 12px 0 4px 12px')}
${suivi('YOUSSEF SWAT', 'Split · léger', 0, false, false)}
${suivi('GUY MONTAGNÉ', 'Split · moyen', 1, false, false)}
${suivi('MIN-JUN CHUN', 'Split · léger', 0, false, false)}
${suivi('LÉO CHADALER', 'Garden of Blood · léger', 1, false, false)}
</div>`, { titre: 'TES SUIVIS', droite: lab('14'), flex: '0 0 380px', gap: 12 });
  const item = (type, titre, sous, quand, nonlu, actif) => `<div style="flex: none; display: flex; gap: 16px; align-items: flex-start; padding: 14px 16px; background: ${actif ? C.ink : C.tile2}; color: ${actif ? C.bg : C.ink}; ${cham(10)}"><div style="width: 132px; flex: none; display: flex; flex-direction: column; gap: 8px"><div style="${XC}; font-size: 24px; line-height: 1; color: ${actif ? C.redDeep : type === 'RUMEUR' || type === 'BLESSURE' ? C.red : C.yel}">${type}</div><div style="font-size: 22px; line-height: 1; opacity: 0.75">${quand}</div></div><div style="display: flex; flex-direction: column; gap: 6px; min-width: 0; flex: 1"><div style="font-size: 26px; line-height: 1.05; font-weight: ${nonlu ? 600 : 500}">${titre}</div><div style="font-size: 22px; line-height: 1.1; opacity: 0.8">${sous}</div></div>${nonlu ? octDot(14, actif ? C.bg : C.yel) : ''}</div>`;
  const fil = panneau(`<div style="display: flex; flex-direction: column; gap: 8px">${lab('AUJOURD’HUI')}
${item('RUMEUR', 'Garden of Blood approche Zaur Rasulov', 'Deux combats à son contrat. Il estime qu’on le cache.', 'Lundi', true, true)}
${item('TRAIT', 'Rasulov gagne un trait : « Ne recule jamais »', 'Après sa victoire sur Vial, le n°1 de la catégorie.', 'Lundi', true, false)}
${item('BLESSURE', 'Bruno Okoro se tord la cheville au camp', 'Trois semaines d’arrêt. Il ne sera pas prêt pour la soirée 64.', 'Lundi', true, false)}
${lab('CETTE SEMAINE', 'margin-top: 6px')}
${item('SURNOM', 'Montagné devient « Le Vieux Lion »', 'Donné par Tableau noir après sa victoire à 38 ans.', 'Jeudi', false, false)}
${item('RÉSULTAT', 'Chadaler conserve sa ceinture chez Garden of Blood', 'TKO au deuxième round. Il réclame un champion de Split.', 'Mercredi', false, false)}
</div>`, { titre: 'LE FIL', droite: lab('5 NON LUES'), flex: '1.45', gap: 12 });
  const fait = (l, v, c = C.ink) => `<div style="display: flex; justify-content: space-between; align-items: baseline; padding: 10px 0; border-bottom: 2px solid ${C.l16}"><div style="font-size: 24px; line-height: 1; color: ${C.dim}">${l}</div><div style="${XC}; font-size: 30px; line-height: 1; color: ${c}">${v}</div></div>`;
  const detail = panneau(`<div style="display: flex; flex-direction: column; gap: 12px">${big('GARDEN OF BLOOD APPROCHE RASULOV', 48, 'white-space: normal; line-height: 0.9')}<div style="font-size: 24px; line-height: 1.2">Selon Cage Hebdo, le matchmaker de Garden of Blood a parlé au camp de Rasulov après sa victoire sur Vial. Il y aurait un combat principal à New York pour lui.</div></div><div style="display: flex; flex-direction: column">${fait('Contrat restant', '2 COMBATS')}${fait('Ce qu’il pense de toi', 'ON LE CACHE', C.red)}${fait('Son rang', 'N°3 · 20e MONDIAL')}</div><div style="margin-top: auto; display: flex; flex-direction: column; gap: 10px">${btnJaune('PRÉPARER SON COMBAT', 'Entrée', 60, 32)}<div style="display: flex; gap: 10px">${btnSombre('SA FICHE', 'F', 56, 28)}${btnSombre('PROLONGER', 'P', 56, 28)}</div></div>`, { titre: '', flex: '1', gap: 18 });
  const corps = `<div style="flex: 1; display: flex; gap: 16px; min-height: 0">${gauche}${fil}${detail}</div>`;
  return planche({ titre: 'Actualités, le fil des combattants suivis', section: 'ACTUALITÉS', marques: ['ACCUEIL', 'ACTUALITÉS', 'CARTE'], entete: entete('ACTUALITÉS', 'TES SUIVIS ET TES ESPOIRS', ''), corps, touches: [[['Échap'], 'Accueil'], [['Tab'], 'Colonne'], [['↑', '↓'], 'Choisir'], [['S'], 'Ne plus suivre'], [['Entrée'], 'Préparer son combat', true]] });
}

module.exports = { ficheStats, ficheApercu, combatChiffres, releve, meilleurs, records, actualites };
