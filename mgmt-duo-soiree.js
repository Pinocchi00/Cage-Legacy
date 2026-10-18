"use strict";
/* ==== [ANCRE: DUO_T4_ECRANS] — Monde lot 19 T13 ====*/
var MGMT_DUO_UI=(typeof MGMT_DUO_UI==='undefined')?{}:MGMT_DUO_UI;
MGMT_DUO_UI.vu=false;

/* ==== [ANCRE: MONDE_LOT_19_T54_SOIREE] — Monde lot 19 T54 ==== */
function mgmtDuoSoireeHtml(){
  const m=G&&G.mgmt;
  if(!mgmtDuoActif(m)||!m.duo.soiree||!m.duo.cartes.length) return duoCadre('');
  const score=mgmtDuoScore(m),n=score.numero;
  const i=m.duo.soiree.i;
  const carte=m.duo.cartes[m.duo.cartes.length-1];
  const c=carte.combats[i];
  const t=c&&m.hist[c.h];
  if(!c||!t) return duoCadre('');
  const a=t.a,b=t.b;
  const resultat=MGMT_DUO_UI.vu;
  const org=id=>(MGMT_ORGANISATIONS.find(x=>x.id===id)||{}).nom||'';
  const nomOrgA=org(m.duo.a||mgmtPredecesseurOrgId(m)),nomOrgB=org(m.duo.b);
  const gagnant=t.winner==='A'?0:t.winner==='B'?1:-1;
  const cote=(x,sideIndex)=>{
    const effectif=mgmtDuoEffectif(m,sideIndex?'b':'a',x.div).find(f=>f.id===x.id);
    const wins=Number(x.W)||0,losses=Number(x.L)||0,draws=Number(x.D)||0;
    const record=resultat&&gagnant===sideIndex?`${Math.max(0,wins-1)}-${losses}-${draws}`:resultat&&gagnant>=0?`${wins}-${Math.max(0,losses-1)}-${draws}`:`${wins}-${losses}-${draws}`;
    const nom=String(x.name||''),parts=nom.split(' '),famille=parts.pop()||'',prenom=parts.join(' ');
    const gagne=resultat&&gagnant===sideIndex,perd=resultat&&gagnant>=0&&gagnant!==sideIndex;
    const rang=effectif&&effectif.rang?`${effectif.rang}e de sa catégorie`:'Hors classement';
    return `<div class="so-cote ${sideIndex?'j2':'j1'}${gagne?' gagne':''}${perd?' perd':''}"><div class="bande"></div><div class="lab">${duoEsc(duoMaj(sideIndex?nomOrgB:nomOrgA))} · ${duoEsc(duoMaj(m.duo.noms[sideIndex?'b':'a']))}</div>
      <div class="T so-nom">${duoEsc(duoMaj(famille))}</div><div class="so-prenom l1">${duoEsc(prenom)}</div>
      <div class="so-rec"><div class="lab">Bilan avant le combat</div><div class="T">${record.split('-').map((v,j)=>`<span>${v}</span>${j<2?'<i>-</i>':''}`).join('')}</div></div>
      <div class="so-tuiles"><div class="tuile"><div class="lab">Chez ${duoEsc(sideIndex?nomOrgB:nomOrgA)}</div><div class="T">${duoEsc(effectif&&effectif.rang?`N° ${effectif.rang}`:'Hors classement')}</div></div><div class="tuile"><div class="lab">Âge</div><div class="T">${duoEsc(x.age)} ANS</div></div></div>
      ${gagne?'<div class="so-verdict T">VAINQUEUR</div>':''}</div>`;
  };
  const methode=typeof mgmtLendemainMethode==='function'?mgmtLendemainMethode(t):mgmtSuMethodeFamille(t);
  const bas=resultat?`<div class="so-res"><div class="T">${duoEsc(duoMaj(gagnant<0?`${a.name} et ${b.name}`:`${gagnant===0?a.name:b.name} bat ${gagnant===0?b.name:a.name}`))}</div><div class="l1">${duoEsc(methode)}</div></div>
        <div class="so-boutons"><div class="bouton jaune" onclick="CL.mgmtDuoSoireeSuivant()"><span class="T">${i===5?'LE BILAN':'COMBAT SUIVANT'}</span><span class="k">Entrée</span></div><div class="bouton" onclick="CL.mgmtDuoSoireeRegarder()"><span class="T">REVOIR</span><span class="k">R</span></div></div>`
      :`<div class="so-boutons"><div class="bouton jaune" onclick="CL.mgmtDuoSoireeRegarder()"><span class="T">REGARDER</span><span class="k">Entrée</span></div><div class="bouton" onclick="CL.mgmtDuoSoireeResultat()"><span class="T">RÉSULTAT</span><span class="k">P</span></div></div>`;
  const titre=`La super carte · ${duoEsc(duoMaj(m.duo.noms.a))} × ${duoEsc(duoMaj(m.duo.noms.b))}`;
  const corps=`${duoEntete(titre,duoDroiteSaison(score.saison,n))}
    <main class="contenu large"><div class="so">
      <div class="so-haut"><div class="col"><div class="lab">Super carte ${n} · ${duoEsc(mgmtJourDateTexte(m.cal.jour).toLowerCase())}</div><div class="T so-num">${i===5?'COMBAT PRINCIPAL':'COMBAT '+(6-i)}</div><div class="l2">${duoEsc(mgmtDivisionLabel(c.div))} · ${i===5?'5 rounds':'3 rounds'}</div></div>
        <div class="so-score"><span class="lab">${duoEsc(duoMaj(m.duo.noms.a))}</span><span class="T j1c">${score.a}</span><span class="T t2">–</span><span class="T j2c">${score.b}</span><span class="lab">${duoEsc(duoMaj(m.duo.noms.b))}</span></div></div>
      <div class="so-face">${cote(a,0)}<div class="so-vs T">VS</div>${cote(b,1)}</div><div class="so-pied">${bas}</div></div></main>
    ${duoTouches([[['Entrée'],resultat?(i===5?'Le bilan':'Combat suivant'):'Regarder',true,resultat?'CL.mgmtDuoSoireeSuivant()':'CL.mgmtDuoSoireeRegarder()'],[['P'],'Résultat',false,'CL.mgmtDuoSoireeResultat()'],[['Échap'],'Retour au QG',false,'CL.mgmtDuoSoireeEchapper()']])}`;
  return duoCadre(corps);
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
