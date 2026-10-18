"use strict";
/* ==== [ANCRE: DUO_T4_ECRANS] — Monde lot 19 T11 ==== */
/* ==== [ANCRE: MONDE_LOT_19_T52_ENCHERES] — Monde lot 19 T52 ==== */
function mgmtDuoEncheresHtml(){
  const m=G.mgmt;
  const e=m&&m.duo&&m.duo.encheres;
  if(!e||!e.lots||!e.lots[e.i]) return '';
  const L=e.lots[e.i];
  const tour=L.tour;
  const partieA=mgmtDuoPartie(m,'a');
  const partieB=mgmtDuoPartie(m,'b');
  const sc=mgmtDuoScore(m);
  const nomA=m.duo.noms.a;
  const nomB=m.duo.noms.b;
  const joueur= tour==='a'?nomA:nomB;
  const autre=tour==='a'?'b':'a';
  const prochain=L.meneur===null?L.ouverture:L.prix+L.pas;
  const prix=L.prix||L.ouverture;
  const combattant=mgmtExteriorCombattant(m,L.id)||{};
  const origine=mgmtOrgParId(combattant.orgId);
  const nom=duoEsc(duoMaj(combattant.name||L.name||''));
  const bilan=`${combattant.W||0}-${combattant.L||0}-${combattant.D||0}`;
  const caisse=c=>{const p=c==='a'?partieA:partieB, id=c==='a'?m.duo.noms.a:m.duo.noms.b, o=c==='a'?MGMT_ORGANISATIONS.find(x=>x.id===mgmtPredecesseurOrgId(m)):MGMT_ORGANISATIONS.find(x=>x.id===m.duo.b), disponible=p?Math.max(0,p.treasury+mgmtOverdraftCap(p)):0;
    return duoPan(`en-caisse ${c==='a'?'j1':'j2'}`,`<div class="bande"></div><div class="lab">${duoEsc(duoMaj(o&&o.nom||''))}</div><div class="T en-nom">${duoEsc(duoMaj(id))}</div>
      <div class="sep"></div><div class="lab">En caisse</div><div class="T en-v">${duoEuros(p?p.treasury:0)}</div>
      <div class="sep"></div><div class="lab">Peut miser</div><div class="l1">${disponible>0?`jusqu’à ${duoEuros(disponible)}`:'rien : la caisse est à découvert'}</div>`);};
  const libellePrix=L.fini?'Adjugé':L.meneur===null?'Ouverture':'Prix actuel';
  const prixBloc=`<div class="lab">${libellePrix}</div><div class="T en-prix">${duoEuros(prix)}</div>${L.fini?`<div class="l2">${duoEsc(duoMaj(L.gagnant==='a'?nomA:L.gagnant==='b'?nomB:nom))} ${L.gagnant?'signe '+duoEsc(duoMaj(L.name||combattant.name||''))+' pour '+duoEuros(L.prix):'a passé'}</div>`:`<div class="l2">${L.meneur===null?`Personne n’a encore misé · palier ${duoEuros(L.pas)}`:`${duoTag(m,autre)} mène · palier ${duoEuros(L.pas)}`}</div>`}`;
  const tourHtml=L.fini&&L.gagnant?`<div class="tour ${L.gagnant==='a'?'j1':'j2'}"><span class="T">${duoEsc(duoMaj(L.gagnant==='a'?nomA:nomB))} SIGNE ${duoEsc(duoMaj(L.name||combattant.name||''))}</span></div>`:L.fini?`<div class="tour ${tour==='a'?'j2':'j1'}"><span class="T">${duoEsc(duoMaj(tour==='a'?nomB:nomA))} A PASSÉ</span></div>`:`<div class="tour ${tour==='a'?'j1':'j2'}"><span class="T">À ${duoEsc(duoMaj(joueur))} DE MISER</span></div>`;
  const orgSignee=L.gagnant==='a'?MGMT_ORGANISATIONS.find(x=>x.id===mgmtPredecesseurOrgId(m)):MGMT_ORGANISATIONS.find(x=>x.id===m.duo.b);
  const boutons=L.fini?`<div class="en-boutons"><button type="button" class="bouton jaune" onclick="CL.mgmtDuoEncheresSuivant()"><span class="T">COMBATTANT SUIVANT</span><span class="k">Entrée</span></button></div><div class="l1 t2 en-sous">Contrat de 3 combats chez ${duoEsc(orgSignee&&orgSignee.nom||'')}.</div>`:`<div class="en-boutons"><button type="button" class="bouton jaune" onclick="CL.mgmtDuoMiser()"><span class="T">MISER ${duoEuros(prochain)}</span><span class="k">Entrée</span></button><button type="button" class="bouton" onclick="CL.mgmtDuoPasser()"><span class="T">PASSER</span><span class="k">P</span></button></div>${MGMT_DUO_UI.refus?`<div class="en-refus l1">Pas assez en caisse pour miser ${duoEuros(prochain)}.</div>`:''}`;
  const versus=`${duoEsc(duoMaj(nomA))} <span class="t2">×</span> ${duoEsc(duoMaj(nomB))}`;
  const contenu=`${duoEntete(versus,duoDroiteSaison(sc.saison,sc.numero))}
    <main class="contenu large"><div class="en">${caisse('a')}
      ${duoPan('en-centre',`<div class="en-lots">${e.lots.map((_,i)=>`<span class="en-pt${i===e.i?' on':''}">${i+1}</span>`).join('')}<span class="lab">Combattant ${e.i+1} sur ${e.lots.length}</span></div>
        <div class="lab">${duoEsc(duoMaj(mgmtDivisionLabel(L.div)))} · LIBRE · VIENT DE ${duoEsc(duoMaj(origine&&origine.nom||''))}</div>
        <div class="T en-cb">${nom}</div>
        <div class="en-tuiles"><div class="tuile"><div class="lab">Bilan</div><div class="T">${duoEsc(bilan)}</div></div><div class="tuile"><div class="lab">Âge</div><div class="T">${duoEsc(combattant.age||'')} ANS</div></div><div class="tuile"><div class="lab">Mondial</div><div class="T">${L.rang===1?'1er':`${duoEsc(L.rang)}e`}</div></div></div>
        <div class="en-prixbloc">${prixBloc}</div>${tourHtml}${boutons}`)}${caisse('b')}</div></main>
    ${duoTouches([[['F'],'Fiche',false,'CL.mgmtDuoEncheresFiche()'],[['Entrée'],L.fini?'Combattant suivant':'Miser',true], [['P'],'Passer'],[['Échap'],'Retour au QG',false,"CL.go('mgmt_duo')"]])}`;
  return duoCadre(contenu);
}
SCREENS.mgmt_duo_encheres=mgmtDuoEncheresHtml;
/* État d'interface commun aux écrans Duo (non sauvegardé) : un seul objet, chaque écran y ajoute sa clé. */
var MGMT_DUO_UI=(typeof MGMT_DUO_UI==='undefined')?{}:MGMT_DUO_UI;
MGMT_DUO_UI.refus=false;
Object.assign(CL,{
  mgmtDuoEncheres(){MGMT_DUO_UI.refus=false;CL.go('mgmt_duo_encheres');},
  mgmtDuoMiser(){const r=mgmtDuoMiser(G.mgmt);MGMT_DUO_UI.refus=!r.ok&&r.raison==='caisse';if(G.mgmt.duo.etape!=='encheres')CL.go('mgmt_duo_draft');else render();},
  mgmtDuoPasser(){mgmtDuoPasser(G.mgmt);MGMT_DUO_UI.refus=false;if(G.mgmt.duo.etape!=='encheres')CL.go('mgmt_duo_draft');else render();},
  mgmtDuoEncheresSuivant(){const e=G.mgmt.duo.encheres;if(!e||!e.lots[e.i]||!e.lots[e.i].fini)return;e.i++;if(e.i>=e.lots.length){G.mgmt.duo.etape='draft';G.mgmt.duo.encheres=null;mgmtDuoDraftOuvrir(G.mgmt);CL.go('mgmt_duo_draft');}else render();},
  mgmtDuoEncheresFiche(){const m=G.mgmt,e=m&&m.duo&&m.duo.encheres,L=e&&e.lots[e.i];if(L)CL.mgmtDuoFiche(L.id,'mgmt_duo_encheres');}
});
keysRegister('mgmt_duo_encheres',{Enter(){const e=G.mgmt.duo.encheres;if(e&&e.lots[e.i]&&e.lots[e.i].fini)CL.mgmtDuoEncheresSuivant();else CL.mgmtDuoMiser();},KeyF(){CL.mgmtDuoEncheresFiche();},KeyM(){CL.mgmtDuoMiser();},KeyP(){CL.mgmtDuoPasser();},Escape(){CL.go('mgmt_duo');}});
