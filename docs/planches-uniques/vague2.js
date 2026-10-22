'use strict';
const L = require('./lib.js');
const { C, XC, OCT, cham, big, lab, key, keyDark, plus, moins, coche, fleche, btnJaune, btnSombre, btnClair, onglets, panneau, planche, entete, octDot, octBadge, octRing, BTN } = L;

const ligneFait = (l, v, c = C.ink) => `<div style="display: flex; justify-content: space-between; align-items: baseline; gap: 16px; padding: 12px 0; border-bottom: 2px solid ${C.l16}"><div style="font-size: 24px; line-height: 1; color: ${C.dim}">${l}</div><div style="${XC}; font-size: 32px; line-height: 1; color: ${c}; white-space: nowrap">${v}</div></div>`;
const voix = (qui, t) => `<div style="display: flex; flex-direction: column; gap: 10px">${lab(qui)}<div style="font-size: 26px; line-height: 1.2; font-style: italic">« ${t} »</div></div>`;
const etapes = (liste, i) => `<div style="display: flex; gap: 8px">${liste.map((t, k) => `<div style="height: 56px; padding: 0 18px; display: flex; align-items: center; gap: 12px; background: ${k === i ? C.yel : k < i ? C.tile : 'transparent'}; color: ${k === i ? C.bg : C.ink}; border: ${k > i ? `2px solid ${C.l38}` : '0'}; box-sizing: border-box; ${cham(10)}">${k < i ? `<div style="width: 30px; height: 30px; background: ${C.ink}; ${OCT}; display: flex; align-items: center; justify-content: center">${coche(C.bg)}</div>` : `<div style="width: 30px; height: 30px; background: ${k === i ? C.bg : C.tile}; color: ${k === i ? C.yel : C.ink}; ${OCT}; display: flex; align-items: center; justify-content: center; ${XC}; font-size: 22px; line-height: 1">${k + 1}</div>`}<div style="${XC}; font-size: 28px; line-height: 1; white-space: nowrap">${t}</div></div>`).join('')}</div>`;
const ETAPES = ['TON CONTRAT', 'CE QUI MANQUE', 'TES TROIS ESPOIRS'];

/* ============ 8. L'arrivée — le contrat et ce qui manque ============ */
function arriveeContrat() {
  const tete = `<div style="height: 64px; flex: none; display: flex; justify-content: space-between; align-items: center">${etapes(ETAPES, 0)}<div style="font-size: 24px; line-height: 1; color: ${C.dim}">Mardi 12 janvier 2027, ton premier jour</div></div>`;
  const contrat = panneau(`${voix('JEAN-MICHEL DELATOUR, PATRON DE SPLIT', 'Un an pour me prouver que j’ai eu raison de te faire venir. Pas un jour de plus si ça ne marche pas.')}
<div style="display: flex; flex-direction: column">${ligneFait('Durée', '1 AN')}${ligneFait('Jusqu’au', '11 JANVIER 2028')}${ligneFait('Salaire', '3 200 € PAR MOIS')}${ligneFait('Rendez-vous', 'MI-SAISON, EN JUILLET')}${ligneFait('Ta réputation', 'TOUT À FAIRE')}</div>
<div style="margin-top: auto; font-size: 24px; line-height: 1.2">À la fin de l’année, trois issues : <b>prolongé et augmenté</b>, prolongé sous condition, ou remercié.</div>`, { titre: 'TON CONTRAT', droite: octRing('1', 56, 30, C.yel), flex: '1' });
  const obj = (n, t, auj, ok, part) => `<div style="display: flex; gap: 16px; align-items: flex-start; padding: 14px 0; border-bottom: 2px solid ${C.l16}">${octBadge(n, 44, 26, part ? C.yel : C.ink, C.bg)}<div style="display: flex; flex-direction: column; gap: 8px; flex: 1"><div style="font-size: 26px; line-height: 1.1">${t}</div><div style="font-size: 22px; line-height: 1; color: ${C.dim}">Aujourd’hui : ${auj}</div></div></div>`;
  const objectifs = panneau(`<div style="display: flex; flex-direction: column">
${obj('1', 'Un poids lourd de Split dans le top 15 mondial', 'le meilleur est 41e', false, true)}
${obj('2', 'Finir l’année dans les quatre premières organisations', 'Split est 5e sur 8', false)}
${obj('3', 'Un champion de Split dans le top 5 mondial', 'deux le sont déjà', true)}
${obj('4', 'Une caisse positive au 31 décembre', '50 000 €', true)}
</div><div style="margin-top: auto; display: flex; gap: 12px; align-items: center">${octDot(18, C.yel)}<div style="font-size: 24px; line-height: 1.15">Le premier objectif vient de ce qui manque à Split.</div></div>`, { titre: 'CE QU’IL ATTEND', droite: lab('SAISON 2027'), flex: '1.15' });
  const manque = panneau(`${lab('CE QUI MANQUE À SPLIT')}${big('DE BONS POIDS LOURDS', 72, `color: ${C.red}; white-space: normal; line-height: 0.85`)}
<div style="display: flex; flex-direction: column">${ligneFait('Lourds sous contrat', '7')}${ligneFait('Le champion, Jesús Maldonado', '41e MONDIAL')}${ligneFait('Dans le top 15 mondial', 'AUCUN', C.red)}${ligneFait('Chez Undisputed Cage', '6 DU TOP 15')}</div>
${voix('LEÏLA', 'On en trouvera un. Mais pas dans cet effectif.')}
<div style="margin-top: auto; display: flex; justify-content: flex-end">${btnJaune('SUITE : TES ESPOIRS', 'Entrée', 60, 32)}</div>`, { flex: '1.1', gap: 18 });
  const corps = `${tete}<div style="flex: 1; display: flex; gap: 16px; min-height: 0">${contrat}${objectifs}${manque}</div>`;
  return planche({ titre: 'Ton arrivée, le contrat et ce qui manque', section: 'ACCUEIL', entete: entete('TON ARRIVÉE', 'SPLIT · LYON · DEPUIS 2004', ''), corps, touches: [[['←', '→'], 'Étape'], [['Échap'], 'Revoir l’étape d’avant'], [['Entrée'], 'Suite', true]] });
}

/* ============ 9. L'arrivée — les trois espoirs ============ */
function arriveeEspoirs() {
  const tete = `<div style="height: 64px; flex: none; display: flex; justify-content: space-between; align-items: center">${etapes(ETAPES, 2)}<div style="display: flex; align-items: center; gap: 14px"><div style="font-size: 24px; line-height: 1">Gardés</div>${big('2 / 3', 48)}</div></div>`;
  const leila = `<div style="height: 70px; flex: none; display: flex; align-items: center; gap: 18px; padding: 0 22px; background: ${C.tile2}; border-left: 6px solid ${C.yel}"><div style="${XC}; font-size: 30px; line-height: 1; color: ${C.yel}">LEÏLA</div><div style="font-size: 26px; line-height: 1.1; font-style: italic">« Six noms. Garde ceux que tu veux voir grandir. Je te donnerai de leurs nouvelles, toutes les semaines. »</div></div>`;
  const carte = (angle, prenom, nom, info, pal, stats, trait, neg, raison, etat) => {
    const garde = etat === 'garde', vise = etat === 'vise';
    const bord = garde ? C.yel : vise ? C.ink : C.l16;
    return `<div style="flex: 1; min-width: 0; position: relative; box-sizing: border-box; background: ${garde ? 'rgba(240, 178, 32, 0.07)' : C.panel}; border: ${garde || vise ? 4 : 2}px solid ${bord}; ${cham(18)}; padding: 16px 20px; display: flex; flex-direction: column; gap: 10px">
<div style="display: flex; justify-content: space-between; align-items: center">${lab(angle, `color: ${garde ? C.yel : C.dim}`)}${garde ? `<div style="height: 36px; padding: 0 12px; background: ${C.yel}; color: ${C.bg}; ${cham(8)}; display: flex; align-items: center; gap: 8px">${coche(C.bg)}<span style="${XC}; font-size: 26px; line-height: 1">GARDÉ</span></div>` : vise ? `<div style="display: flex; align-items: center; gap: 8px">${key('Entrée', C.yel)}<span style="${XC}; font-size: 26px; line-height: 1; color: ${C.yel}">GARDER</span></div>` : ''}</div>
<div style="display: flex; justify-content: space-between; align-items: flex-end; gap: 12px"><div style="display: flex; flex-direction: column; gap: 6px">${big(prenom, 28)}${big(nom, 58, 'line-height: 0.75')}</div>${big(pal, 52, 'line-height: 0.75')}</div>
<div style="font-size: 22px; line-height: 1; color: ${C.dim}">${info}</div>
<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px">${stats.map(([l, v]) => `<div style="background: ${C.tile}; ${cham(8)}; height: 52px; padding: 0 12px; display: flex; flex-direction: column; justify-content: center; gap: 6px"><div style="font-size: 22px; line-height: 1; color: ${C.dim}; white-space: nowrap">${l}</div>${big(v, 28)}</div>`).join('')}</div>
<div style="display: flex; align-items: center; gap: 10px">${neg ? octBadge('–', 32, 26, C.red, C.bg) : octBadge('+', 32, 26)}<div style="${XC}; font-size: 28px; line-height: 1; white-space: nowrap">${trait}</div></div>
<div style="margin-top: auto; font-size: 24px; line-height: 1.1; white-space: nowrap">${raison}</div></div>`;
  };
  const r1 = `<div style="flex: 1; display: flex; gap: 16px; min-height: 0">
${carte('CELUI QUI RÉPOND AU MANQUE', 'BRUNO', 'OKORO', 'Poids lourd · 23 ans · Lagos', '7-0', [['Finitions', '7 SUR 7'], ['Au 1er round', '6']], 'FINISSEUR', false, 'Jamais vu en carte principale.', 'garde')}
${carte('CELUI QUI MONTE', 'ZAUR', 'RASULOV', 'Poids mouche · 28 ans · Makhatchkala', '14-1', [['Amenées / 15 min', '3,2'], ['Précision', '51 %']], 'NE RECULE JAMAIS', false, 'Vient de battre le n°1 de sa catégorie.', 'garde')}
${carte('À RECRUTER · KIRGHIZISTAN', 'ADILET', 'ABDYLDAEV', 'Poids mi-lourd · 22 ans · Bichkek', '8-0', [['Finitions', '8 SUR 8'], ['Amenées / 15 min', '4,6']], 'PROJECTIONS DE JUDOKA', false, 'Champion de l’Alash Pride FC. Libre.', 'vise')}
</div>`;
  const r2 = `<div style="flex: 1; display: flex; gap: 16px; min-height: 0">
${carte('LA PLUS JEUNE', 'LINA', 'ARAÚJO', 'Poids paille · 21 ans · Recife', '6-0', [['Soumissions', '4'], ['Tentées / 15 min', '2,8']], 'CHASSEUSE DE COU', false, 'Quatre soumissions en six combats.', '')}
${carte('CELUI QU’ON NE REGARDE PAS', 'MATHIS', 'DORÉ', 'Poids léger · 24 ans · Clermont-Ferrand', '9-2', [['Coups / min', '5,10'], ['Précision', '47 %']], 'LENT À DÉMARRER', true, 'Le plus gros volume des légers.', '')}
${carte('LE REVENANT', 'KOFI', 'MENSAH', 'Poids mi-moyen · 26 ans · Accra', '10-3', [['Absent depuis', '11 MOIS'], ['Défense debout', '61 %']], 'ROUILLÉ', true, 'Genou réparé, il veut une date avant l’été.', '')}
</div>`;
  const corps = `${tete}${leila}${r1}${r2}`;
  return planche({ titre: 'Ton arrivée, les trois espoirs de Leïla', section: 'ACCUEIL', entete: entete('TON ARRIVÉE', 'LEÏLA TE CONFIE TROIS ESPOIRS', ''), corps, touches: [[['↑', '↓', '←', '→'], 'Choisir'], [['F'], 'Sa fiche'], [['Entrée'], 'Garder ou rendre', true], [['Tab'], 'Entrer dans Split, une fois les trois gardés']] });
}

/* ============ 10. L'Accueil enrichi ============ */
function accueil() {
  const bloc = (l, v, s) => `<div style="display: flex; flex-direction: column; gap: 10px; padding: 0 26px; border-left: 2px solid ${C.l16}">${lab(l)}${big(v, 56)}<div style="font-size: 24px; line-height: 1">${s}</div></div>`;
  const bande = `<div style="height: 150px; flex: none; position: relative; overflow: hidden; background: ${C.bg}"><img src="${L.TUNNEL}" alt="" style="position: absolute; left: -82px; top: -410px; display: block; width: 1728px; height: 972px; max-width: none; opacity: 0.55"><div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: space-between; padding: 0 30px"><div style="display: flex; flex-direction: column; gap: 14px">${big('SPLIT', 96, 'line-height: 0.72')}<div style="font-size: 24px; line-height: 1">Lyon · depuis 2004 · <b>5e des huit</b> · lundi 23 février 2027</div></div><div style="display: flex; background: rgba(13, 11, 11, 0.86); padding: 18px 0">${bloc('PROCHAINE SOIRÉE', 'DANS 34 J', 'Split Fight Night 64')}${bloc('LE LIEU', 'DÔME', 'Lyon, 12 avril')}${bloc('LA CARTE', '3 / 5', 'Deux places à finir')}${bloc('LES PRÉVENTES', '4 120', 'sur 9 000 places')}</div></div></div>`;
  const evt = (nom, quoi, sous, menu, suivi) => `<div style="flex: none; display: flex; gap: 14px; align-items: flex-start; padding: 12px 0; border-bottom: 2px solid ${C.l16}">${suivi ? octDot(16, C.yel) : `<div style="width: 16px; flex: none"></div>`}<div style="flex: 1; display: flex; flex-direction: column; gap: 7px; min-width: 0"><div style="font-size: 26px; line-height: 1.05"><b style="text-decoration: underline; text-underline-offset: 4px">${nom}</b>${quoi}</div><div style="font-size: 22px; line-height: 1; color: ${C.dim}">${sous}</div></div><div style="font-weight: 600; font-size: 22px; line-height: 1; letter-spacing: 0.04em; border: 2px solid ${C.l38}; padding: 5px 8px; white-space: nowrap">${menu}</div></div>`;
  const passe = panneau(`<div style="display: flex; flex-direction: column">
${evt('Rasulov', ' gagne un trait : « Ne recule jamais »', 'Ton espoir · après sa victoire sur Vial', 'EFFECTIF', true)}
${evt('Garden of Blood', ' approche Rasulov', 'Deux combats à son contrat', 'CONTRATS', true)}
${evt('Damagaev', ' bat un record de Split', '131 coups significatifs tentés', 'CLASSEMENTS', false)}
${evt('Montagné', ' devient « Le Vieux Lion »', 'Le surnom vient de Tableau noir', 'PRESSE', true)}
${evt('Okoro', ' se blesse au camp', 'Ton espoir · trois semaines d’arrêt', 'EFFECTIF', true)}
</div>`, { titre: 'CE QUI S’EST PASSÉ', droite: lab('CETTE SEMAINE'), flex: '1.3', gap: 10 });
  const dem = (nom, quoi, sous, act) => `<div style="flex: none; display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 2px solid ${C.l16}"><div style="display: flex; flex-direction: column; gap: 7px; min-width: 0"><div style="font-size: 26px; line-height: 1.05"><b style="text-decoration: underline; text-underline-offset: 4px">${nom}</b>${quoi}</div><div style="font-size: 22px; line-height: 1; color: ${C.dim}">${sous}</div></div><div style="display: flex; align-items: center; gap: 6px; ${XC}; font-size: 26px; line-height: 1; color: ${C.yel}; white-space: nowrap">${act}${fleche(C.yel)}</div></div>`;
  const esp = (n, s, e, c) => `<div style="display: flex; align-items: center; gap: 12px">${octDot(16, C.yel)}<div style="${XC}; font-size: 28px; line-height: 1; width: 150px">${n}</div><div style="font-size: 22px; line-height: 1; color: ${C.dim}; flex: 1">${s}</div><div style="${XC}; font-size: 24px; line-height: 1; color: ${c}; white-space: nowrap">${e}</div></div>`;
  const attend = panneau(`<div style="background: ${C.yel}; color: ${C.bg}; ${cham(14)}; padding: 16px 18px; display: flex; flex-direction: column; gap: 10px; flex: none"><div style="font-weight: 600; font-size: 22px; line-height: 1; letter-spacing: 0.04em">LA PROCHAINE CHOSE À FAIRE</div><div style="display: flex; justify-content: space-between; align-items: center">${big('FINIR LA CARTE', 52)}${keyDark('Entrée')}</div><div style="font-size: 24px; line-height: 1">Deux places libres. Leïla a préparé des dossiers.</div></div>
${lab('ILS T’ATTENDENT', 'margin-top: 6px')}<div style="display: flex; flex-direction: column">
${dem('Keller', ' veut un combat avant l’été', 'Sans combat depuis sept mois · il commence à le dire', 'RÉPONDRE')}
${dem('Swat', ' arrive en fin de contrat', 'Encore trois combats · il te doit sa carrière', 'PROLONGER')}
</div>${lab('TES ESPOIRS', 'margin-top: auto')}<div style="display: flex; flex-direction: column; gap: 10px">${esp('RASULOV', 'N°3 des mouches', 'à booker', C.yel)}${esp('OKORO', 'blessé au camp', '3 semaines', C.red)}${esp('ABDYLDAEV', 'signé lundi', 'premier combat', C.yel)}</div>`, { titre: 'CE QUI T’ATTEND', flex: '1.15', gap: 12 });
  const obj = (t, v, p) => `<div style="display: flex; flex-direction: column; gap: 8px; padding: 10px 0; border-bottom: 2px solid ${C.l16}"><div style="display: flex; justify-content: space-between; gap: 10px"><div style="font-size: 24px; line-height: 1.05">${t}</div><div style="${XC}; font-size: 28px; line-height: 1; white-space: nowrap">${v}</div></div><div style="height: 8px; background: ${C.tile}"><div style="width: ${p}%; height: 8px; background: ${p >= 100 ? C.ink : C.yel}"></div></div></div>`;
  const saison = panneau(`<div style="display: flex; flex-direction: column">
${obj('Un lourd dans le top 15 mondial', '41e → 15e', 18)}
${obj('Top 4 des organisations', '5e', 70)}
${obj('Un champion dans le top 5', 'FAIT', 100)}
</div><div style="display: flex; flex-direction: column; gap: 10px; margin-top: 4px">${lab('LE PATRON')}<div style="${XC}; font-size: 34px; line-height: 1">IL EST SATISFAIT</div><div style="font-size: 22px; line-height: 1; color: ${C.dim}">La salle pleine à Marseille lui a plu.</div></div><div style="margin-top: auto; display: flex; flex-direction: column; gap: 10px">${lab('TON RECRUTEUR')}<div style="display: flex; justify-content: space-between; align-items: baseline"><div style="font-size: 24px; line-height: 1">Kirghizistan · retour</div>${big('DANS 6 J', 34, `color: ${C.yel}`)}</div></div>`, { titre: 'TA SAISON', droite: lab('2027'), flex: '1', gap: 12 });
  const corps = `${bande}<div style="flex: 1; display: flex; gap: 16px; min-height: 0">${passe}${attend}${saison}</div>`;
  return planche({ titre: 'L’Accueil, avec tes suivis, ta saison et ton recruteur', section: 'ACCUEIL', marques: ['ACTUALITÉS', 'CARTE', 'CONTRATS'], entete: entete('ACCUEIL', 'SEMAINE 7', ''), corps, touches: [[['A', 'E'], 'Section'], [['↑', '↓'], 'Choisir'], [['Tab'], 'Bloc suivant'], [['Entrée'], 'Ouvrir', true]] });
}

/* ============ 11. La semaine du combat ============ */
function semaine() {
  const jour = (j, quoi, etat, note) => {
    const fait = etat === 'fait', now = etat === 'now';
    return `<div style="flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; gap: 12px; position: relative">${now ? octBadge('', 44, 0, C.yel) : fait ? `<div style="width: 44px; height: 44px; background: ${C.ink}; ${OCT}; display: flex; align-items: center; justify-content: center">${coche(C.bg)}</div>` : octRing('', 44, 0, C.l38)}<div style="${XC}; font-size: 32px; line-height: 1; color: ${now ? C.yel : C.ink}">${j}</div><div style="font-size: 22px; line-height: 1; color: ${C.dim}; white-space: nowrap">${quoi}</div>${note ? `<div style="margin-top: 4px; font-size: 22px; line-height: 1.1; text-align: center; padding: 6px 10px; background: ${C.tile}; ${cham(6)}; white-space: nowrap">${note}</div>` : ''}</div>`;
  };
  const frise = `<div style="height: 168px; flex: none; position: relative; display: flex; gap: 8px; padding: 0 20px"><div style="position: absolute; left: 90px; right: 90px; top: 21px; height: 4px; background: ${C.l38}"></div><div style="position: absolute; left: 90px; width: 60%; top: 21px; height: 4px; background: ${C.ink}"></div>
${jour('LUNDI', 'Arrivée à Lyon', 'fait', '')}
${jour('MARDI', 'Journée des médias', 'fait', 'Rasulov : 2 M de vues')}
${jour('MERCREDI', 'Conférence de presse', 'fait', 'Damagaev provoque Swat')}
${jour('JEUDI', 'Face-à-face', 'fait', 'Préventes : +1 200')}
${jour('VENDREDI', 'La pesée', 'now', '')}
${jour('SAMEDI', 'La soirée', '', '')}
</div>`;
  const choix = (titre, lignes, k, prim) => `<div style="flex: 1; min-width: 0; box-sizing: border-box; background: ${prim ? 'rgba(240, 178, 32, 0.07)' : C.tile2}; border: ${prim ? 4 : 2}px solid ${prim ? C.yel : C.l38}; ${cham(16)}; padding: 20px; display: flex; flex-direction: column; gap: 14px"><div style="display: flex; justify-content: space-between; align-items: center">${big(titre, 44)}${key(k, prim ? C.yel : C.ink)}</div>${lignes.map(([s, t]) => `<div style="display: flex; gap: 12px; align-items: flex-start">${s === '+' ? plus : s === '-' ? moins : octDot(16, C.ink)}<div style="font-size: 24px; line-height: 1.15">${t}</div></div>`).join('')}</div>`;
  const probleme = panneau(`<div style="display: flex; justify-content: space-between; align-items: flex-start"><div style="display: flex; flex-direction: column; gap: 12px">${lab('VENDREDI, 11 H 40 · LA PESÉE', `color: ${C.red}`)}${big('DAMAGAEV MANQUE LE POIDS', 76, 'line-height: 0.8')}</div><div style="flex: none; display: flex; flex-direction: column; align-items: flex-end; gap: 10px">${big('71,9 KG', 64, `color: ${C.red}`)}<div style="font-size: 22px; line-height: 1; color: ${C.dim}; white-space: nowrap">pour 70,8 kg autorisés</div><div style="font-size: 22px; line-height: 1; color: ${C.dim}; white-space: nowrap">sa troisième pesée manquée</div></div></div>
<div style="font-size: 26px; line-height: 1.2">Il a une heure pour repasser sur la balance. Son coin dit qu’il ne perdra plus rien. Swat est prêt à combattre quand même.</div>
<div style="flex: 1; display: flex; gap: 16px; min-height: 0">${choix('LE COMBAT A LIEU', [['', 'Poids intermédiaire.'], ['+', '20 % de la bourse de Damagaev, <b>6 000 €</b>, vont à Swat.'], ['-', 'La presse parlera d’un combat déséquilibré.']], 'A', true)}${choix('ANNULER LE COMBAT', [['', 'Swat est payé quand même : <b>15 000 €</b>.'], ['-', 'Le co-principal saute. Leïla remonte Naber contre Richards.'], ['-', 'Moins de monde samedi soir.']], 'B', false)}</div>`, { flex: '1.75', gap: 18 });
  const bref = (t, s, bon) => `<div style="flex: none; display: flex; gap: 14px; align-items: flex-start; padding: 12px 0; border-bottom: 2px solid ${C.l16}">${bon ? octDot(16, C.yel) : octDot(16, C.ink)}<div style="display: flex; flex-direction: column; gap: 7px"><div style="font-size: 26px; line-height: 1.05">${t}</div><div style="font-size: 22px; line-height: 1; color: ${C.dim}">${s}</div></div></div>`;
  const semaineBref = panneau(`<div style="display: flex; flex-direction: column">
${bref('Les préventes s’emballent', '6 840 places sur 9 000 · record de Split à Lyon', true)}
${bref('La vidéo du camp de Rasulov fait le tour', 'Deux millions de vues en deux jours', true)}
${bref('Damagaev à la conférence', '« Il se cache derrière son allonge. Samedi, il n’aura nulle part où aller. »', false)}
${bref('Swat lui répond', '« Qu’il monte sur la balance ou pas, je viens. »', false)}
</div>${L.btnSombre('LA CARTE DE SAMEDI', 'C', 56, 28)}`, { titre: 'LA SEMAINE EN BREF', flex: '1', gap: 12 });
  const corps = `${frise}<div style="flex: 1; display: flex; gap: 16px; min-height: 0">${probleme}${semaineBref}</div>`;
  return planche({ titre: 'La semaine du combat, la pesée manquée', section: 'ACCUEIL', marques: ['ACTUALITÉS'], entete: entete('LA SEMAINE DU COMBAT', 'SPLIT FIGHT NIGHT 64', 'J-1', `<div style="display: flex; align-items: center; gap: 16px"><div style="font-size: 24px; line-height: 1; color: ${C.dim}; white-space: nowrap">Demain</div>${L.plaque(`<div style="${XC}; font-size: 40px; line-height: 0.69">12 AVRIL</div><div style="font-weight: 600; font-size: 24px; line-height: 1; letter-spacing: 0.06em">DÔME DE LYON</div>`)}${L.plaque(`<div style="${XC}; font-size: 56px; line-height: 0.69">SPLIT FIGHT NIGHT</div><div style="${XC}; font-size: 56px; line-height: 0.69; color: ${C.red}">64</div>`, 'gap: 14px')}</div>`), corps, touches: [[['←', '→'], 'Jour de la semaine'], [['A'], 'Le combat a lieu', true], [['B'], 'Annuler le combat'], [['F'], 'Fiche de Damagaev']] });
}

/* ============ 12. Le recruteur — la mission ============ */
function recruteurMission() {
  const dest = (nom, styles, fortes, coût, pep, sel) => `<div style="box-sizing: border-box; min-width: 0; background: ${sel ? 'rgba(240, 178, 32, 0.07)' : C.tile2}; border: ${sel ? 4 : 2}px solid ${sel ? C.yel : C.l16}; ${cham(14)}; padding: 16px 18px; display: flex; flex-direction: column; gap: 10px"><div style="display: flex; justify-content: space-between; align-items: center">${big(nom, 40, sel ? `color: ${C.yel}` : '')}<div style="display: flex; gap: 4px">${[1, 2, 3].map(i => octDot(14, i <= pep ? (sel ? C.yel : C.ink) : C.tile)).join('')}</div></div><div style="font-size: 24px; line-height: 1">${styles}</div><div style="display: flex; justify-content: space-between; font-size: 22px; line-height: 1; color: ${C.dim}"><span>${fortes}</span><span>${coût}</span></div></div>`;
  const carte = panneau(`<div style="flex: 1; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); grid-template-rows: repeat(3, minmax(0, 1fr)); gap: 10px; min-height: 0">
${dest('DAGHESTAN', 'Lutte, sambo', 'Légers, mi-moyens', '16 000 €', 3, false)}
${dest('KIRGHIZISTAN', 'Lutte, judo', 'Moyens, mi-lourds', '18 000 €', 2, true)}
${dest('BRÉSIL', 'Jiu-jitsu, muay-thaï', 'Toutes', '20 000 €', 3, false)}
${dest('ÉTATS-UNIS', 'Lutte universitaire', 'Lourds, mi-lourds', '24 000 €', 2, false)}
${dest('PAYS-BAS', 'Kickboxing', 'Moyens, lourds', '12 000 €', 1, false)}
${dest('THAÏLANDE', 'Muay-thaï', 'Mouches, coqs', '14 000 €', 2, false)}
${dest('POLOGNE', 'Complets, frappeurs', 'Lourds', '10 000 €', 1, false)}
${dest('JAPON', 'Grappling, soumissions', 'Mouches, coqs', '22 000 €', 2, false)}
${dest('FRANCE', 'Complets, boxe anglaise', 'Toutes', '6 000 €', 1, false)}
</div><div style="display: flex; gap: 18px; align-items: center; font-size: 22px; line-height: 1; color: ${C.dim}; flex: none"><div style="display: flex; gap: 4px">${octDot(14, C.ink)}${octDot(14, C.ink)}${octDot(14, C.ink)}</div><div>Les chances d’y trouver une pépite, d’après ses voyages passés</div></div>`, { titre: 'OÙ L’ENVOYER', flex: '1.45', gap: 14 });
  const puces = (liste, actif) => `<div style="display: flex; flex-wrap: wrap; gap: 8px">${liste.map(t => `<div style="height: 46px; padding: 0 16px; display: flex; align-items: center; ${cham(8)}; background: ${t === actif ? C.ink : C.tile}; color: ${t === actif ? C.bg : C.ink}; ${XC}; font-size: 26px; line-height: 1; white-space: nowrap">${t}</div>`).join('')}</div>`;
  const mission = panneau(`<div style="display: flex; flex-direction: column; gap: 10px">${lab('KARIM OUALI, TON RECRUTEUR')}<div style="font-size: 26px; line-height: 1.2; font-style: italic">« Bichkek, Och, Talas. Des lutteurs qui parlent peu et qui gagnent. Je pars lundi si tu veux. »</div></div>
<div style="display: flex; flex-direction: column; gap: 10px">${lab('LA CATÉGORIE')}${puces(['MOYEN', 'MI-LOURD', 'LOURD', 'TOUTES'], 'MI-LOURD')}</div>
<div style="display: flex; flex-direction: column; gap: 10px">${lab('LE STYLE CHERCHÉ')}${puces(['LUTTEUR', 'FRAPPEUR', 'GRAPPLER', 'COMPLET'], 'LUTTEUR')}</div>
<div style="display: flex; flex-direction: column; gap: 10px">${lab('LA DURÉE')}${puces(['2 SEMAINES', '3 SEMAINES', '4 SEMAINES'], '3 SEMAINES')}</div>
<div style="display: flex; flex-direction: column">${ligneFait('Coût', '18 000 €')}${ligneFait('Retour', 'LUNDI 16 MARS')}${ligneFait('Profils', 'TROIS À CINQ')}</div>
<div style="margin-top: auto">${btnJaune('ENVOYER KARIM AU KIRGHIZISTAN', 'Entrée', 64, 32)}</div>`, { titre: 'LA MISSION', flex: '1', gap: 16 });
  const corps = `<div style="height: 56px; flex: none; display: flex; justify-content: space-between; align-items: center">${onglets(['LES LIBRES', 'ENVOYER LE RECRUTEUR', 'SES RETOURS'], 'ENVOYER LE RECRUTEUR')}<div style="font-size: 24px; line-height: 1; color: ${C.dim}">Une mission à la fois · caisse : 50 000 €</div></div><div style="flex: 1; display: flex; gap: 16px; min-height: 0">${carte}${mission}</div>`;
  return planche({ titre: 'Recrutement, envoyer le recruteur', section: 'CONTRATS', marques: ['ACCUEIL'], entete: entete('CONTRATS', 'RECRUTEMENT', ''), corps, touches: [[['Échap'], 'Accueil'], [['↑', '↓', '←', '→'], 'Destination'], [['Tab'], 'Catégorie, style, durée'], [['Entrée'], 'Envoyer', true]] });
}

/* ============ 13. Le recruteur — le retour ============ */
function recruteurRetour() {
  const petite = (nom, info, pal, etat) => `<div style="flex: none; height: 104px; box-sizing: border-box; display: flex; align-items: center; gap: 14px; padding: 0 16px; background: ${etat === 'vu' ? C.tile2 : 'transparent'}; border: 2px ${etat === 'cache' ? 'dashed' : 'solid'} ${etat === 'actif' ? C.yel : C.l16}; ${etat === 'cache' ? '' : cham(12)}">${etat === 'cache' ? octRing('?', 56, 32, C.l38) : octBadge(pal.split('-')[0], 56, 28, etat === 'actif' ? C.yel : C.ink, C.bg)}<div style="display: flex; flex-direction: column; gap: 8px; min-width: 0">${big(nom, 32, etat === 'cache' ? `color: ${C.dim}` : '')}<div style="font-size: 22px; line-height: 1; color: ${C.dim}; white-space: nowrap">${info}</div></div></div>`;
  const pile = `<div style="width: 330px; flex: none; display: flex; flex-direction: column; gap: 10px">${lab('CE QUE KARIM RAPPORTE', 'margin-bottom: 4px')}
${petite('TALANT ISAEV', '11-2 · moyen · 27 ans', '11-2', 'vu')}
${petite('BEKZAT OMUROV', '6-1 · mi-lourd · 24 ans', '6-1', 'vu')}
${petite('ADILET ABDYLDAEV', '8-0 · mi-lourd · 22 ans', '8-0', 'actif')}
${petite('PROFIL 4', 'Encore fermé', '', 'cache')}
<div style="margin-top: auto; font-size: 24px; line-height: 1.2; color: ${C.dim}">Trois semaines au Kirghizistan. Quatre profils, dont une pépite.</div></div>`;
  const tampon = `<div style="position: absolute; right: 34px; top: 30px; transform: rotate(8deg); width: 196px; height: 196px; background: ${C.yel}; ${OCT}; display: flex; align-items: center; justify-content: center"><div style="width: 178px; height: 178px; background: ${C.bg}; ${OCT}; display: flex; align-items: center; justify-content: center"><div style="width: 166px; height: 166px; background: ${C.yel}; ${OCT}; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; color: ${C.bg}"><div style="${XC}; font-size: 50px; line-height: 0.8">PÉPITE</div><div style="font-weight: 600; font-size: 22px; line-height: 1">1 SUR 40</div></div></div></div>`;
  const st = (l, v) => `<div style="background: ${C.tile}; ${cham(10)}; padding: 12px 14px; display: flex; flex-direction: column; gap: 8px"><div style="font-size: 22px; line-height: 1; color: ${C.dim}; white-space: nowrap">${l}</div>${big(v, 40)}</div>`;
  const grande = `<div style="flex: 1; min-width: 0; position: relative; box-sizing: border-box; background: ${C.panel}; border: 4px solid ${C.yel}; ${cham(22)}; padding: 26px 30px; display: flex; flex-direction: column; gap: 18px; overflow: hidden">
<img src="${L.TUNNEL}" alt="" style="position: absolute; left: -300px; top: -420px; width: 1728px; height: 972px; max-width: none; opacity: 0.22">
${tampon}
<div style="position: relative; display: flex; flex-direction: column; gap: 14px">${lab('PROFIL 3 SUR 4 · ALASH PRIDE FC, CHAMPION DES MI-LOURDS', `color: ${C.yel}`)}${big('ADILET', 52)}${big('ABDYLDAEV', 150, 'line-height: 0.72')}<div style="display: flex; gap: 22px; align-items: baseline">${big('8-0-0', 64)}<div style="font-size: 26px; line-height: 1">Mi-lourd · 22 ans · Bichkek · 1,88 m</div></div></div>
<div style="position: relative; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px">${st('Finitions', '8 SUR 8')}${st('Amenées / 15 min', '4,6')}${st('Réussite', '62 %')}${st('Coups au sol / min', '3,9')}</div>
<div style="position: relative; display: flex; gap: 12px; align-items: center">${octBadge('+', 40, 30)}${big('PROJECTIONS DE JUDOKA', 36)}<div style="font-size: 24px; line-height: 1; color: ${C.dim}">Trait révélé par Karim</div></div>
<div style="position: relative; margin-top: auto; padding: 16px 20px; background: rgba(13, 11, 11, 0.86); border-left: 6px solid ${C.yel}; font-size: 28px; line-height: 1.2; font-style: italic">« Il projette comme un judoka et finit avec les coudes. J’ai vu la salle de Bichkek se lever deux fois. Personne ne l’a encore appelé. »</div>
<div style="position: relative; font-size: 22px; line-height: 1; color: ${C.dim}">Chiffres sur 3 combats filmés · 5 TKO, 3 soumissions</div></div>`;
  const droite = panneau(`<div style="display: flex; flex-direction: column">${ligneFait('Combats', '4')}${ligneFait('Par combat', '9 000 €')}${ligneFait('Prime de signature', '5 000 €')}</div>
<div style="display: flex; flex-direction: column; gap: 10px; padding: 14px 16px; border: 2px solid ${C.red}; ${cham(10)}">${lab('ON LE REGARDE AUSSI', `color: ${C.red}`)}<div style="font-size: 24px; line-height: 1.15">MMA Korner avait quelqu’un dans la salle le même soir.</div></div>
<div style="margin-top: auto; display: flex; flex-direction: column; gap: 10px">${btnJaune('LE SIGNER', 'Entrée', 64, 34)}${btnSombre('LE SUIVRE', 'S', 56, 30)}${btnSombre('PROFIL SUIVANT', '→', 56, 30)}</div>`, { titre: 'CE QU’IL DEMANDE', flex: '0 0 380px', gap: 16 });
  const corps = `<div style="height: 56px; flex: none; display: flex; justify-content: space-between; align-items: center">${onglets(['LES LIBRES', 'ENVOYER LE RECRUTEUR', 'SES RETOURS'], 'SES RETOURS')}<div style="font-size: 24px; line-height: 1; color: ${C.dim}">Karim est rentré ce matin</div></div><div style="flex: 1; display: flex; gap: 18px; min-height: 0">${pile}${grande}${droite}</div>`;
  return planche({ titre: 'Recrutement, le retour du recruteur et la pépite', section: 'CONTRATS', marques: ['ACCUEIL', 'CONTRATS'], entete: entete('CONTRATS', 'RECRUTEMENT', '3 / 4'), corps, touches: [[['Échap'], 'Accueil'], [['↑', '↓'], 'Profil'], [['Espace'], 'Ouvrir le profil suivant'], [['S'], 'Suivre'], [['Entrée'], 'Le signer', true]] });
}

module.exports = { arriveeContrat, arriveeEspoirs, accueil, semaine, recruteurMission, recruteurRetour };
