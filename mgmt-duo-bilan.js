"use strict";
/* ==== [ANCRE: DUO_T4_ECRANS] — Monde lot 19 T14, docs/lots/DUO-T4.md §4 ==== */
/* Bilan au balisage exact de la planche maquettes/duo/DuoBilan.html. Les textes fixes
   de la planche sont relu:false ; les noms et chiffres viennent de la partie Duo. */

/* ==== [ANCRE: MONDE_LOT_19_T55_BILAN] — Monde lot 19 T55 ==== */
function mgmtDuoBilanHtml(){
  const m=G&&G.mgmt,d=m&&m.duo,cartes=d&&Array.isArray(d.cartes)?d.cartes:[],c=cartes[cartes.length-1];
  const scoreA=c.combats.filter(x=>x.winner==='A').length,scoreB=c.combats.filter(x=>x.winner==='B').length;
  const win=c.gagnant==='a'?'a':c.gagnant==='b'?'b':null;
  const orgA=mgmtOrgNom(m),orgB=mgmtOrgNom(mgmtDuoPartie(m,'b'));
  const lignes=c.combats.map((x,i)=>{
    const detail=mgmtResultatDetail(m,x.h),meth=detail?mgmtSuMethodeFine(detail):mgmtSuMethodeFamille({nul:x.winner==='D',family:x.family,round:x.round,rounds:x.rounds});
    return `<div class="bi-l" data-duo-combat="${i}"><div class="lab bi-num">${i===5?'PRINCIPAL':'COMBAT '+(6-i)}</div><div class="bi-n l1 ${x.winner==='A'?'gagne':''}"><span class="pt j1"></span>${duoEsc(x.na)}</div><div class="bi-n l1 ${x.winner==='B'?'gagne':''}"><span class="pt j2"></span>${duoEsc(x.nb)}</div><div class="bi-m l2">${duoEsc(mgmtDivisionLabel(x.div))} · ${duoEsc(meth)}</div><div class="aller" onclick="CL.mgmtDuoBilanRevoir(${i})" style="cursor:pointer">Revoir ›</div></div>`;
  }).join('');
  const n=c.n, saison=mgmtDuoScore(m),fin=n%MGMT_DUO_CARTES_SAISON===0;
  let saisonHtml;
  if(fin){
    const debut=Math.max(0,cartes.length-MGMT_DUO_CARTES_SAISON),saisonCartes=cartes.slice(debut);
    const saisonA=saisonCartes.filter(k=>k.gagnant==='a').length,saisonB=saisonCartes.filter(k=>k.gagnant==='b').length,saisonNo=Math.ceil(n/MGMT_DUO_CARTES_SAISON);
    const g=saisonA===saisonB?null:saisonA>saisonB?'a':'b';
    saisonHtml=`${duoTitre('LA SAISON '+saisonNo,'4 SUPER CARTES')}<div class="bi-gros"><span class="T j1c">${saisonA}</span><span class="T t2">–</span><span class="T j2c">${saisonB}</span></div><div class="T bi-sw ${g?g==='a'?'j1c':'j2c':''}">${g?`${duoEsc(duoMaj(d.noms[g]))} REMPORTE LA SAISON ${saisonNo}`:`SAISON ${saisonNo} : ÉGALITÉ`}</div>${saisonCartes.map(k=>`<div class="ligne"><div class="l1">Super carte ${k.n} · ${duoEsc(mgmtJourDateTexte(k.jour).toLowerCase())}</div><div class="l1">${k.combats.filter(x=>x.winner==='A').length} – ${k.combats.filter(x=>x.winner==='B').length}</div></div>`).join('')}<div class="bi-argent"><div class="sous">Gagné sur la saison</div><div class="ligne"><div class="l1">${duoTag(m,'a')} ${duoEsc(orgA)}</div><div class="T bi-g">+ ${duoEuros(saisonCartes.reduce((t,k)=>t+(k.gains.a||0),0))}</div></div><div class="ligne"><div class="l1">${duoTag(m,'b')} ${duoEsc(orgB)}</div><div class="T bi-g">+ ${duoEuros(saisonCartes.reduce((t,k)=>t+(k.gains.b||0),0))}</div></div></div>`;
  }else{
    saisonHtml=`${duoTitre('LA SAISON '+saison.saison,`APRÈS ${n} SUPER CARTE${n>1?'S':''}`)}<div class="bi-gros"><span class="T j1c">${saison.a}</span><span class="T t2">–</span><span class="T j2c">${saison.b}</span></div><div class="l1 t2">Prochaine super carte : ${duoEsc(mgmtJourDateTexte(d.prochaine).toLowerCase())}</div><div class="bi-argent"><div class="sous">L’argent de la super carte</div><div class="ligne"><div class="l1">${duoTag(m,'a')} ${duoEsc(orgA)}</div><div class="T bi-g">+ ${duoEuros(c.gains.a||0)}</div></div><div class="ligne"><div class="l1">${duoTag(m,'b')} ${duoEsc(orgB)}</div><div class="T bi-g">+ ${duoEuros(c.gains.b||0)}</div></div></div>`;
    const recrues=(d.recrues||[]).filter(r=>r&&r.n===n);
    if(recrues.length) saisonHtml+=duoPan('bi-rec',`<div class="sous">Recrues des enchères</div>${recrues.map(r=>`<div class="l1">${duoTag(m,r.cote)} signe <span class="nom">${duoEsc(r.name)}</span> · ${duoEuros(r.prix)}</div>`).join('')}`);
  }
  const corps=`${duoEntete(`Le bilan · ${duoEsc(duoMaj(d.noms.a))} <span class="t2">×</span> ${duoEsc(duoMaj(d.noms.b))}`,duoDroiteSaison(saison.saison,(n-1)%MGMT_DUO_CARTES_SAISON+1))}
  <main class="contenu large bi"><div class="bi-bandeau ${win?win==='a'?'j1':'j2':'nul'}"><span class="T">${win?`${duoEsc(duoMaj(d.noms[win]))} REMPORTE LA SUPER CARTE ${n}`:`ÉGALITÉ À LA SUPER CARTE ${n}`}</span><span class="T bi-sc">${scoreA} – ${scoreB}</span></div><div class="bi-cols">${duoPan('bi-liste',`${duoTitre('LES SIX COMBATS',duoEsc(mgmtJourDateTexte(c.jour)))}<div class="bi-l bi-h"><div class="lab bi-num"></div><div class="bi-n lab">${duoEsc(duoMaj(orgA))} · ${duoEsc(duoMaj(d.noms.a))}</div><div class="bi-n lab">${duoEsc(duoMaj(orgB))} · ${duoEsc(duoMaj(d.noms.b))}</div><div class="bi-m lab">Comment</div><div></div></div>${lignes}`)}${duoPan('bi-saison',saisonHtml)}</div><div class="bi-bas"><div class="bouton jaune" onclick="CL.mgmtDuoBilanRetour()" style="cursor:pointer"><span class="T">RETOUR AU QG</span><span class="k">Entrée</span></div></div></main>${duoTouches([[['↑','↓'],'Combat'],[['R'],'Revoir'],[['Entrée'],'Retour au QG',true,'CL.mgmtDuoBilanRetour()']])}`;
  return duoCadre(corps);
}
SCREENS.mgmt_duo_bilan=mgmtDuoBilanHtml;

/* ==== [ANCRE: MONDE_LOT_19_T55_COMMANDES] — Monde lot 19 T55 ==== */
Object.assign(CL,{
  mgmtDuoBilanRevoir(i){const m=G&&G.mgmt,d=m&&m.duo,c=d&&d.cartes[d.cartes.length-1],x=c&&c.combats[i],t=x&&m.hist?m.hist[x.h]:null;if(t) mgmtRevoirCombat(t,'mgmt_duo_bilan',null);},
  mgmtDuoBilanRetour(){mgmtDuoTerminer(G.mgmt);CL.go('mgmt_duo');}
});
keysRegister('mgmt_duo_bilan',{Enter(){CL.mgmtDuoBilanRetour();}});
