"use strict";
/* ==== [ANCRE: DUO_T4_ECRANS] — Monde lot 19 T13 ==== */
let MGMT_DUO_UI={vu:false};

function mgmtDuoSoireeHtml(){
  const m=G&&G.mgmt;
  if(!mgmtDuoActif(m)||!m.duo.soiree||!m.duo.cartes.length) return mfEcran('<div class="mf-duo-so"><h2>La soirée n’est pas disponible.</h2></div>',{barre:'logo',plaque:'Duo',libelle:'La super carte'});
  const n=mgmtDuoScore(m).numero;
  const i=m.duo.soiree.i;
  const carte=m.duo.cartes[m.duo.cartes.length-1];
  const c=carte.combats[i];
  const t=c&&m.hist[c.h];
  if(!c||!t) return mfEcran('<div class="mf-duo-so"><h2>Le combat n’est pas disponible.</h2></div>',{barre:'logo',plaque:'Duo',libelle:'La super carte'});
  const a=t.a,b=t.b;
  const ea=t.duo&&mgmtDuoEffectif(m,'a',a.div).find(x=>x.id===a.id);
  const eb=t.duo&&mgmtDuoEffectif(m,'b',b.div).find(x=>x.id===b.id);
  const resultat=MGMT_DUO_UI.vu;
  const score=mgmtDuoScore(m);
  const nomA=esc(m.duo.noms.a),nomB=esc(m.duo.noms.b);
  const vainqueur=t.winner;
  const gagnant=vainqueur==='A'?0:vainqueur==='B'?1:-1;
  const etiquette='SUPER CARTE · '+(i===5?'COMBAT PRINCIPAL':'COMBAT '+(6-i));
  const bilan=(x,avant)=>`${avant?x.W:x.W}-${avant?x.L:x.L}-${x.D||0}`;
  const side=(x,org,player,eff,sideIndex)=>`<section class="mf-duo-so-cote ${sideIndex?'j2':'j1'} ${resultat?(gagnant===sideIndex?'gagne':gagnant>=0?'perd':''):''}"><div class="mf-duo-so-org">${esc(org)} · ${player}</div><div class="mf-duo-so-nom">${esc(x.name)}</div><div class="mf-duo-so-prenom">${esc(x.firstName||'')}</div><div class="mf-duo-so-bilan">Bilan avant le combat <strong>${esc(bilan(x,true))}</strong></div><div class="mf-duo-so-meta">${esc(mgmtDivisionLabel(x.div))} · ${esc(eff&&eff.rang?`${eff.rang}e de sa catégorie`:'Sans rang')} · ${esc(x.age)} ans</div></section>`;
  const avant=`<div class="mf-duo-so-haut"><div>SUPER CARTE ${esc(n)} · ${i===5?'COMBAT PRINCIPAL':`COMBAT ${6-i}`}</div><div class="mf-duo-so-score">${nomA} <b>${score.a}</b> – <b>${score.b}</b> ${nomB}</div></div><div class="mf-duo-so-face">${side(a,mgmtOrgNom(m),nomA,ea,0)}<div class="mf-duo-so-vs">VS</div>${side(b,mgmtOrgNom(m.orgs[m.duo.b]),nomB,eb,1)}</div><div class="mf-duo-so-pied"><button class="mf-duo-so-primary" onclick="CL.mgmtDuoSoireeRegarder()">Regarder</button><button onclick="CL.mgmtDuoSoireeResultat()">Résultat</button></div>`;
  const res= gagnant<0?'Match nul':`${esc(gagnant===0?a.name:b.name)} bat ${esc(gagnant===0?b.name:a.name)}`;
  const methode=typeof mgmtLendemainMethode==='function'?mgmtLendemainMethode(t):mgmtSuMethodeFamille(t);
  const apres=`<div class="mf-duo-so-haut"><div>SUPER CARTE ${esc(n)} · ${i===5?'COMBAT PRINCIPAL':`COMBAT ${6-i}`}</div><div class="mf-duo-so-score">${nomA} <b>${score.a}</b> – <b>${score.b}</b> ${nomB}</div></div><div class="mf-duo-so-face">${side(a,mgmtOrgNom(m),nomA,ea,0)}<div class="mf-duo-so-vs">VS</div>${side(b,mgmtOrgNom(m.orgs[m.duo.b]),nomB,eb,1)}</div><div class="mf-duo-so-pied"><div><strong>${res}</strong><br>${esc(methode)}</div><button class="mf-duo-so-primary" onclick="CL.mgmtDuoSoireeSuivant()">${i===5?'Le bilan':'Combat suivant'}</button></div>`;
  return mfEcran(`<main class="mf-duo-so">${resultat?apres:avant}</main>`,{barre:'logo',plaque:'Duo',libelle:'La super carte '+n,touches:[{ks:['Entrée'],t:resultat?(i===5?'Le bilan':'Combat suivant'):'Regarder',jaune:true},{ks:['P'],t:'Résultat'},{ks:['Échap'],t:'Retour au QG'}]});
}
SCREENS.mgmt_duo_soiree=mgmtDuoSoireeHtml;
Object.assign(CL,{
  mgmtDuoSoireeRegarder(){
    const m=G&&G.mgmt;
    if(!mgmtDuoActif(m)||!m.duo.soiree)return;
    const carte=m.duo.cartes[m.duo.cartes.length-1],c=carte.combats[m.duo.soiree.i],t=c&&m.hist[c.h];
    if(!t)return;
    const n=mgmtDuoScore(m).numero;
    mgmtCombatOuvrir({trace:t,etiquette:'SUPER CARTE · '+(m.duo.soiree.i===5?'COMBAT PRINCIPAL':'COMBAT '+(6-m.duo.soiree.i)),salle:{taux:1,prog:1},retour:'mgmt_duo_soiree',finRetour:()=>{MGMT_DUO_UI.vu=true;},org:`${mgmtOrgNom(m)} × ${mgmtOrgNom(m.orgs[m.duo.b])}`,num:String(n)});
  },
  mgmtDuoSoireeResultat(){MGMT_DUO_UI.vu=true;render();},
  mgmtDuoSoireeSuivant(){
    if(!MGMT_DUO_UI.vu)return;
    mgmtDuoSoireeSuivante(G.mgmt);MGMT_DUO_UI.vu=false;
    if(G.mgmt.duo.etape==='bilan')CL.go('mgmt_duo_bilan');else render();
  },
  mgmtDuoSoireeEchapper(){CL.go('mgmt_duo');}
});
keysRegister('mgmt_duo_soiree',{Enter(){if(MGMT_DUO_UI.vu)CL.mgmtDuoSoireeSuivant();else CL.mgmtDuoSoireeRegarder();},KeyP(){CL.mgmtDuoSoireeResultat();},Escape(){CL.mgmtDuoSoireeEchapper();}});
