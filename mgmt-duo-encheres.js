"use strict";
/* ==== [ANCRE: DUO_T4_ECRANS] — Monde lot 19 T11 ==== */
function mgmtDuoEncheresHtml(){
  const m=G.mgmt;
  const e=m&&m.duo&&m.duo.encheres;
  if(!e||!e.lots||!e.lots[e.i]) return '';
  const L=e.lots[e.i];
  const tour=L.tour;
  const partieA=mgmtDuoPartie(m,'a');
  const partieB=mgmtDuoPartie(m,'b');
  const nomA=m.duo.noms.a;
  const nomB=m.duo.noms.b;
  const joueur= tour==='a'?nomA:nomB;
  const gagnant=L.gagnant==='a'?nomA:L.gagnant==='b'?nomB:'';
  const prochain=L.meneur===null?L.ouverture:L.prix+L.pas;
  const prix=L.prix||L.ouverture;
  const combattant=mgmtExteriorCombattant(m,L.id)||{};
  const origine=mgmtOrgParId(combattant.orgId);
  const nom=esc(combattant.name||L.name||'');
  const bilan=`${combattant.W||0}-${combattant.L||0}-${combattant.D||0}`;
  const caisseA=mgmtEuros(partieA.treasury);
  const caisseB=mgmtEuros(partieB.treasury);
  const refus=MGMT_DUO_UI.refus?`<p class="mf-duo-refus">Pas assez en caisse pour miser ${esc(mgmtEuros(prochain))}.</p>`:'';
  const adjudication=L.fini?`<div class="mf-duo-adjuge">${gagnant?`${esc(gagnant)} signe ${nom} pour ${esc(mgmtEuros(L.prix))}`:`Personne ne mise : ${nom} reste libre`}</div>`:'';
  return `<main class="mf-duo-encheres"><header><h1>Enchères · combattant ${e.i+1} sur ${e.lots.length}</h1><p class="mf-duo-tour ${tour==='a'?'j1':'j2'}">À ${esc(joueur)} de miser</p></header><section class="mf-duo-combattant"><h2>${nom}</h2><p>${esc(mgmtDivisionLabel(L.div))} · ${esc(bilan)} · ${esc(String(combattant.age||''))} ans · ${esc(String(L.rang))}e mondial</p><p>Libre · vient de ${esc(origine?origine.nom:'')}</p><strong>${L.meneur===null?'Ouverture à':'Prix actuel'} ${esc(mgmtEuros(prix))}</strong><p>${L.meneur===null?`${esc(mgmtEuros(L.ouverture))}`:`${esc(L.meneur==='a'?nomA:nomB)} mène`}</p></section><div class="mf-duo-caisses"><p>${esc(nomA)} · ${caisseA}</p><p>${esc(nomB)} · ${caisseB}</p></div>${adjudication}${refus}<div class="mf-duo-actions">${L.fini?'<button class="mf-duo-action" onclick="CL.mgmtDuoEncheresSuivant()">Combattant suivant · Entrée</button>':`<button class="mf-duo-action" onclick="CL.mgmtDuoMiser()">Miser ${esc(mgmtEuros(prochain))} · Entrée / M</button><button class="mf-duo-action" onclick="CL.mgmtDuoPasser()">Passer · P</button>`}</div></main>`;
}
SCREENS.mgmt_duo_encheres=mgmtDuoEncheresHtml;
/* État d'interface commun aux écrans Duo (non sauvegardé) : un seul objet, chaque écran y ajoute sa clé. */
var MGMT_DUO_UI=(typeof MGMT_DUO_UI==='undefined')?{}:MGMT_DUO_UI;
MGMT_DUO_UI.refus=false;
Object.assign(CL,{
  mgmtDuoEncheres(){MGMT_DUO_UI.refus=false;CL.go('mgmt_duo_encheres');},
  mgmtDuoMiser(){const r=mgmtDuoMiser(G.mgmt);MGMT_DUO_UI.refus=!r.ok&&r.raison==='caisse';if(G.mgmt.duo.etape!=='encheres')CL.go('mgmt_duo_draft');else render();},
  mgmtDuoPasser(){mgmtDuoPasser(G.mgmt);MGMT_DUO_UI.refus=false;if(G.mgmt.duo.etape!=='encheres')CL.go('mgmt_duo_draft');else render();},
  mgmtDuoEncheresSuivant(){const e=G.mgmt.duo.encheres;if(!e||!e.lots[e.i]||!e.lots[e.i].fini)return;e.i++;if(e.i>=e.lots.length){G.mgmt.duo.etape='draft';G.mgmt.duo.encheres=null;mgmtDuoDraftOuvrir(G.mgmt);CL.go('mgmt_duo_draft');}else render();}
});
keysRegister('mgmt_duo_encheres',{Enter(){const e=G.mgmt.duo.encheres;if(e&&e.lots[e.i]&&e.lots[e.i].fini)CL.mgmtDuoEncheresSuivant();else CL.mgmtDuoMiser();},KeyM(){CL.mgmtDuoMiser();},KeyP(){CL.mgmtDuoPasser();},Escape(){CL.go('mgmt_duo');}});
