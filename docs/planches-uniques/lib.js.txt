'use strict';
/* Bibliothèque des planches « Combattants uniques » : valeurs exactes des planches validées
   (FicheFinal, MondeAccueil) — fond #0D0B0B, encre #E9E6E1, rouge #E23A2B, jaune #F0B220,
   panneaux #121010, tuiles #252121, Saira Condensed 500/600 et Saira Extra Condensed 800. */

const C = {
  bg: '#0D0B0B', ink: '#E9E6E1', red: '#E23A2B', redDeep: '#B32A1E', yel: '#F0B220',
  panel: '#121010', tile: '#252121', tile2: '#1B1818',
  l38: 'rgba(233, 230, 225, 0.38)', l16: 'rgba(233, 230, 225, 0.16)', l50: 'rgba(233, 230, 225, 0.5)',
  dim: 'rgba(233, 230, 225, 0.74)', faint: 'rgba(233, 230, 225, 0.5)',
};
const FOND = '/_blob/318791530b7ad80e04db5f5d4e771a0b';
const TUNNEL = '/_blob/f0735629a6f7ece03b1dd472f1279f76';
const XC = "font-family: 'Saira Extra Condensed', 'Arial Narrow', sans-serif; font-weight: 800";
const SC = "font-family: 'Saira Condensed', 'Arial Narrow', sans-serif";
const OCT = 'clip-path: polygon(29.3% 0, 70.7% 0, 100% 29.3%, 100% 70.7%, 70.7% 100%, 29.3% 100%, 0 70.7%, 0 29.3%)';
const cham = n => `clip-path: polygon(${n}px 0, 100% 0, 100% calc(100% - ${n}px), calc(100% - ${n}px) 100%, 0 100%, 0 ${n}px)`;
const BTN = `appearance: none; margin: 0; border: 0; cursor: pointer; text-align: left; color: inherit; ${SC}`;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const h = s => s; /* texte déjà sûr (écrit ici) */

/* ---- Petits éléments ------------------------------------------------------------------------ */
const big = (t, size, extra = '') => `<div style="${XC}; font-size: ${size}px; line-height: 0.8; white-space: nowrap${extra ? '; ' + extra : ''}">${t}</div>`;
const txt = (t, size = 24, extra = '') => `<div style="font-size: ${size}px; line-height: 1.15${extra ? '; ' + extra : ''}">${t}</div>`;
const lab = (t, extra = '') => `<div style="font-weight: 600; font-size: 22px; line-height: 1; letter-spacing: 0.04em; color: ${C.dim}; white-space: nowrap${extra ? '; ' + extra : ''}">${t}</div>`;
const key = (k, col = C.ink) => `<div style="border: 2px solid ${col}; color: ${col}; padding: 5px 9px; font-size: 24px; line-height: 1; white-space: nowrap">${k}</div>`;
const keyDark = k => `<div style="border: 2px solid ${C.bg}; color: ${C.bg}; padding: 5px 9px; font-size: 24px; line-height: 1; white-space: nowrap">${k}</div>`;
const bar = (w = 56) => `<div style="width: ${w}px; height: 8px; background: ${C.red}; clip-path: polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)"></div>`;
const octDot = (size = 18, col = C.yel) => `<div style="width: ${size}px; height: ${size}px; flex: none; background: ${col}; ${OCT}"></div>`;
const octBadge = (t, size = 84, fs = 46, bg = C.ink, fg = C.bg) => `<div style="width: ${size}px; height: ${size}px; flex: none; background: ${bg}; color: ${fg}; ${OCT}; display: flex; align-items: center; justify-content: center; ${XC}; font-size: ${fs}px; line-height: 1">${t}</div>`;
const octRing = (t, size = 84, fs = 40, col = C.ink) => `<div style="width: ${size}px; height: ${size}px; flex: none; background: ${col}; ${OCT}; display: flex; align-items: center; justify-content: center"><div style="width: ${size - 6}px; height: ${size - 6}px; background: ${C.bg}; ${OCT}; display: flex; align-items: center; justify-content: center; ${XC}; font-size: ${fs}px; line-height: 1; color: ${col}">${t}</div></div>`;
const vd = r => r === 'V'
  ? `<div style="width: 34px; height: 34px; flex: none; background: ${C.red}; color: ${C.bg}; ${OCT}; display: flex; align-items: center; justify-content: center; ${XC}; font-size: 24px; line-height: 1">V</div>`
  : `<div style="width: 34px; height: 34px; flex: none; background: ${C.ink}; ${OCT}; display: flex; align-items: center; justify-content: center"><div style="width: 29px; height: 29px; background: ${C.bg}; ${OCT}; display: flex; align-items: center; justify-content: center; ${XC}; font-size: 24px; line-height: 1">${r}</div></div>`;

const tile = (inner, extra = '') => `<div style="background: ${C.tile}; ${cham(10)}; padding: 0 16px; display: flex; align-items: center; gap: 14px${extra ? '; ' + extra : ''}">${inner}</div>`;
const plus = `<svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true" style="flex: none"><path d="M13 4v18M4 13h18" stroke="${C.ink}" stroke-width="4"></path></svg>`;
const moins = `<svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true" style="flex: none"><path d="M4 13h18" stroke="${C.red}" stroke-width="4"></path></svg>`;
const quest = `<div style="width: 26px; height: 26px; flex: none; display: flex; align-items: center; justify-content: center; ${XC}; font-size: 34px; line-height: 1; color: ${C.ink}">?</div>`;
const fleche = (col = C.ink) => `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true" style="flex: none"><path d="M6 3l9 8-9 8" stroke="${col}" stroke-width="4"></path></svg>`;
const haut = (col = C.ink) => `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true" style="flex: none"><path d="M11 3l8 12H3z" fill="${col}"></path></svg>`;
const bas = (col = C.red) => `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true" style="flex: none"><path d="M11 19L3 7h16z" fill="${col}"></path></svg>`;
const coche = (col = C.bg) => `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" style="flex: none"><path d="M4 12l5 5L20 6" stroke="${col}" stroke-width="4"></path></svg>`;

/* Boutons : jaune (action principale), sombre (secondaire), clair (onglet actif). */
const btnJaune = (t, k = 'Entrée', h = 60, fs = 34) => `<button type="button" style="${BTN}; background: ${C.yel}; color: ${C.bg}; ${cham(14)}; height: ${h}px; padding: 0 22px; display: flex; align-items: center; gap: 14px; white-space: nowrap">${k ? keyDark(k) : ''}<div style="${XC}; font-size: ${fs}px; line-height: 1">${t}</div></button>`;
const btnSombre = (t, k = '', h = 60, fs = 32) => `<button type="button" style="${BTN}; background: ${C.tile}; color: ${C.ink}; ${cham(14)}; height: ${h}px; padding: 0 22px; display: flex; align-items: center; gap: 14px; white-space: nowrap">${k ? key(k) : ''}<div style="${XC}; font-size: ${fs}px; line-height: 1">${t}</div></button>`;
const btnClair = (t, k = '', h = 60, fs = 32) => `<button type="button" style="${BTN}; background: ${C.ink}; color: ${C.bg}; ${cham(14)}; height: ${h}px; padding: 0 22px; display: flex; align-items: center; gap: 14px; white-space: nowrap">${k ? keyDark(k) : ''}<div style="${XC}; font-size: ${fs}px; line-height: 1">${t}</div></button>`;
const onglets = (liste, actif) => `<div style="display: flex; gap: 8px">${liste.map(t => `<button type="button" style="${BTN}; background: ${t === actif ? C.ink : C.tile}; color: ${t === actif ? C.bg : C.ink}; ${cham(10)}; height: 56px; padding: 0 24px; ${XC}; font-size: 32px; line-height: 56px; white-space: nowrap">${t}</button>`).join('')}</div>`;

/* Le panneau à trois épaisseurs des planches validées. */
function panneau(contenu, { titre = '', droite = '', flex = '1', pad = 15, gap = 16, style = '', fond = C.panel, cadre = C.l50 } = {}) {
  const tete = titre ? `<div style="display: flex; justify-content: space-between; align-items: flex-start; flex: none"><div style="display: flex; flex-direction: column; gap: 12px">${big(titre, 44, 'line-height: 0.75')}${bar()}</div>${droite}</div>` : '';
  return `<div style="box-sizing: border-box; display: flex; background: ${cadre}; padding: 2px; ${cham(18)}; flex: ${flex}; min-width: 0; min-height: 0${style ? '; ' + style : ''}"><div style="flex: 1; min-width: 0; box-sizing: border-box; display: flex; background: ${C.bg}; padding: 5px; ${cham(17)}"><div style="flex: 1; min-width: 0; min-height: 0; box-sizing: border-box; background: ${fond}; ${cham(14)}; padding: ${pad}px; display: flex; flex-direction: column; gap: ${gap}px">${tete}${contenu}</div></div></div>`;
}

/* Barre de statistique : valeur du combattant face à la moyenne de la catégorie. */
function jauge(pct, moy, { col = C.ink, h = 14 } = {}) {
  return `<div style="position: relative; height: ${h + 10}px; flex: none"><div style="position: absolute; left: 0; right: 0; top: 5px; height: ${h}px; background: ${C.tile}"></div><div style="position: absolute; left: 0; top: 5px; width: ${pct}%; height: ${h}px; background: ${col}"></div><div style="position: absolute; left: calc(${moy}% - 2px); top: 0; width: 4px; height: ${h + 10}px; background: ${C.red}"></div></div>`;
}
function ligneStat(libelle, valeur, unite, pct, moy, legende, { col = C.ink } = {}) {
  return `<div style="display: flex; flex-direction: column; gap: 8px; flex: none"><div style="display: flex; justify-content: space-between; align-items: flex-end; gap: 12px"><div style="font-size: 24px; line-height: 1">${libelle}</div><div style="display: flex; align-items: baseline; gap: 6px">${big(valeur, 44, 'line-height: 0.75')}${unite ? `<div style="${XC}; font-size: 26px; line-height: 1; color: ${C.dim}">${unite}</div>` : ''}</div></div><div style="display: flex; align-items: center; gap: 14px"><div style="flex: 1; min-width: 0">${jauge(pct, moy, { col, h: 10 })}</div><div style="font-size: 22px; line-height: 1; color: ${C.dim}; white-space: nowrap">${legende}</div></div></div>`;
}

/* ---- Le cadre de jeu -------------------------------------------------------------------------- */
const SECTIONS = ['ACCUEIL', 'ACTUALITÉS', 'CARTE', 'PRÉLIMINAIRES', 'EFFECTIF', 'CLASSEMENTS', 'CEINTURES', 'CONTRATS', 'CAMPS', 'PRESSE', 'CALENDRIER', 'RÉSULTATS', 'FINANCES', 'ORGANISATION'];
const LOGO = `<div style="display: inline-flex; align-items: center; gap: 11px"><svg width="88" height="88" viewBox="0 0 400 400" fill="none" role="img" aria-label="L’octogone rouge gravé" style="flex: none"><path d="M292.0 238.1L238.1 292.0L161.9 292.0L108.0 238.1L108.0 161.9L161.9 108.0L238.1 108.0L292.0 161.9Z" stroke="${C.red}" stroke-width="15.0" stroke-linejoin="miter"></path><path d="M331.0 254.3L254.3 331.0L145.7 331.0L69.0 254.3L69.0 145.7L145.7 69.0L254.3 69.0L331.0 145.7Z" stroke="${C.red}" stroke-width="21.0" stroke-linejoin="miter"></path><path d="M371.0 270.8L270.8 371.0L129.2 371.0L29.0 270.8L29.0 129.2L129.2 29.0L270.8 29.0L371.0 129.2Z" stroke="${C.red}" stroke-width="12.0" stroke-linejoin="miter"></path></svg><div style="display: flex; flex-direction: column; gap: 3px"><div style="${XC}; font-size: 38.3px; line-height: 0.72; white-space: nowrap">CAGE</div><div style="${XC}; font-size: 26px; line-height: 0.72; white-space: nowrap; color: ${C.ink}">LEGACY</div></div></div>`;

function barreSections(actif, marques = []) {
  const item = (s) => {
    const on = s === actif;
    return `<button type="button" style="${BTN}; box-sizing: border-box; width: 100%; height: 59px; padding: 0 22px 0 28px; background: ${on ? C.ink : 'transparent'}; color: ${on ? C.bg : C.ink}; border-bottom: 2px solid ${C.l16}; display: flex; align-items: center; justify-content: space-between; ${XC}; font-size: 30px; line-height: 1; white-space: nowrap"><span>${s}</span>${marques.includes(s) ? octDot(18) : ''}</button>`;
  };
  const bas = (s) => `<button type="button" style="${BTN}; box-sizing: border-box; width: 100%; height: 60px; padding: 0 22px 0 28px; background: transparent; color: ${C.ink}; border-bottom: 2px solid ${C.l16}; display: flex; align-items: center; justify-content: space-between; ${XC}; font-size: 30px; line-height: 1; white-space: nowrap"><span>${s}</span></button>`;
  return `<div style="position: absolute; left: 0; top: 0; width: 260px; height: 1080px; box-sizing: border-box; background: ${C.bg}; border-right: 2px solid ${C.l38}; display: flex; flex-direction: column"><div style="height: 128px; flex: none; box-sizing: border-box; padding: 0 22px; border-bottom: 2px solid ${C.l16}; display: flex; align-items: center">${LOGO}</div>${SECTIONS.map(item).join('')}<div style="margin-top: auto; border-top: 2px solid ${C.l16}">${bas('OPTIONS')}${bas('MENU PRINCIPAL')}</div></div>`;
}

const plaque = (inner, extra = '') => `<div style="box-sizing: border-box; height: 64px; padding: 0 18px; border: 2px solid ${C.l38}; background: ${C.bg}; display: flex; align-items: center; gap: 16px; white-space: nowrap${extra ? '; ' + extra : ''}">${inner}</div>`;
function entete(titre, sous = '', compteur = '', droite = null) {
  const gauche = `<div style="display: flex; align-items: center; gap: 18px">${plaque(`<div style="${XC}; font-size: 56px; line-height: 0.69">${titre}</div>`)}${sous ? `<div style="font-weight: 600; font-size: 22px; line-height: 1; letter-spacing: 0.06em; white-space: nowrap">${sous}</div>` : ''}${compteur ? `<div style="${XC}; font-size: 44px; line-height: 0.69">${compteur}</div>` : ''}</div>`;
  const d = droite !== null ? droite : `<div style="display: flex; align-items: center; gap: 16px"><div style="font-size: 24px; line-height: 1; color: ${C.dim}; white-space: nowrap">Dans 34 jours</div>${plaque(`<div style="${XC}; font-size: 40px; line-height: 0.69">12 AVRIL</div><div style="font-weight: 600; font-size: 24px; line-height: 1; letter-spacing: 0.06em">DÔME DE LYON</div>`)}${plaque(`<div style="${XC}; font-size: 56px; line-height: 0.69">SPLIT FIGHT NIGHT</div><div style="${XC}; font-size: 56px; line-height: 0.69; color: ${C.red}">64</div>`, 'gap: 14px')}</div>`;
  return `<div style="position: absolute; left: 300px; top: 20px; width: 1564px; height: 64px; display: flex; align-items: center; justify-content: space-between">${gauche}${d}</div>`;
}
function barreTouches(touches, left = 300) {
  const t = touches.map(([ks, lib, jaune]) => `<div style="display: flex; align-items: center; gap: 10px">${ks.map(k => key(k, jaune ? C.yel : C.ink)).join('')}<div>${lib}</div></div>`).join('');
  return `<div style="position: absolute; left: ${left}px; top: 1010px; height: 48px; display: flex; align-items: center; gap: 28px; font-size: 24px; line-height: 1; white-space: nowrap">${t}</div>`;
}

/* Une planche complète. `corps` est posé dans la zone 300,128 → 1564×856 (ou plein écran si plein:true). */
function planche({ titre, section = null, marques = [], entete: et = '', corps, touches = [], plein = false, fond = true }) {
  const zone = plein ? corps : `<div style="position: absolute; left: 300px; top: 128px; width: 1564px; height: 856px; display: flex; flex-direction: column; gap: 16px">${corps}</div>`;
  const inner = `${fond ? `<img src="${FOND}" alt="" style="position: absolute; left: 0; top: 0; display: block; width: 1920px; height: 1080px">` : ''}${plein ? '' : et}${plein ? '' : barreSections(section, marques)}${zone}${touches.length ? barreTouches(touches, plein ? 80 : 300) : ''}`;
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>${titre}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Saira+Condensed:wght@500;600&amp;family=Saira+Extra+Condensed:wght@800&amp;display=swap">
<style>
body{margin:0}
</style>
</helmet>
<div style="width: 1920px; height: 1080px; box-sizing: border-box; position: relative; overflow: hidden; background: ${C.bg}; color: ${C.ink}; ${SC}; font-weight: 500">
${inner}
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":1920,"height":1080}}'>
class Component extends DCLogic {
renderVals() {
return {};
}
}
</script>
</body>
</html>
`;
}

/* La bannière de fiche (tunnel derrière le nom), avec palmarès et rang. */
function banniere({ prenom, surnom = '', nom, palmares, forme, rang, cat, sousTitre = '', h: haut = 260, nomPx = 200 }) {
  const ombre = 'text-shadow: 0.03em 0.0em 0 #0D0B0B, 0.0277em 0.0115em 0 #0D0B0B, 0.0212em 0.0212em 0 #0D0B0B, 0.0115em 0.0277em 0 #0D0B0B, 0.0em 0.03em 0 #0D0B0B, -0.0115em 0.0277em 0 #0D0B0B, -0.0212em 0.0212em 0 #0D0B0B, -0.0277em 0.0115em 0 #0D0B0B, -0.03em 0.0em 0 #0D0B0B, -0.0277em -0.0115em 0 #0D0B0B, -0.0212em -0.0212em 0 #0D0B0B, -0.0115em -0.0277em 0 #0D0B0B, -0.0em -0.03em 0 #0D0B0B, 0.0115em -0.0277em 0 #0D0B0B, 0.0212em -0.0212em 0 #0D0B0B, 0.0277em -0.0115em 0 #0D0B0B';
  return `<div style="position: relative; width: 1564px; height: ${haut}px; flex: none; background: ${C.bg}; overflow: hidden"><img src="${TUNNEL}" alt="" style="position: absolute; left: -150.6px; top: -356.0px; display: block; width: 1728px; height: 972px; max-width: none">${sousTitre ? `<div style="position: absolute; left: 32px; top: 26px; font-weight: 600; font-size: 22px; line-height: 1; letter-spacing: 0.04em; color: ${C.ink}; background: rgba(13, 11, 11, 0.86); padding: 7px 12px; white-space: nowrap">${sousTitre}</div>` : ''}<div style="position: absolute; left: 32px; bottom: 30px; display: flex; flex-direction: column; gap: 16px"><div style="display: flex; align-items: baseline; gap: 18px"><div style="${XC}; font-size: 64px; line-height: 0.69; white-space: nowrap; ${ombre}">${prenom}</div>${surnom ? `<div style="${XC}; font-size: 64px; line-height: 0.69; white-space: nowrap; color: ${C.yel}; ${ombre}">« ${surnom} »</div>` : ''}</div><div style="${XC}; font-size: ${nomPx}px; line-height: 0.69; white-space: nowrap; ${ombre}">${nom}</div></div><div style="position: absolute; right: 32px; top: 30px; width: 400px; height: 200px; box-sizing: border-box; border: 2px solid ${C.l38}; background: rgba(13, 11, 11, 0.86); padding: 0 22px; display: flex; align-items: center; justify-content: space-between"><div style="display: flex; flex-direction: column; gap: 14px">${lab('PALMARÈS')}${big(palmares, 116, 'line-height: 0.69')}<div style="display: flex; gap: 8px; margin-top: 4px">${forme.map(vd).join('')}</div></div><div style="display: flex; flex-direction: column; align-items: center; gap: 14px">${octBadge(rang)}<div style="${XC}; font-size: 30px; line-height: 1.1; text-align: center">${cat}</div></div></div></div>`;
}

module.exports = { C, FOND, TUNNEL, XC, SC, OCT, cham, BTN, esc, big, txt, lab, key, keyDark, bar, octDot, octBadge, octRing, vd, tile, plus, moins, quest, fleche, haut, bas, coche, btnJaune, btnSombre, btnClair, onglets, panneau, jauge, ligneStat, barreSections, plaque, entete, barreTouches, planche, banniere, SECTIONS };
