"use strict";
/* ==== [ANCRE: MONDE_LOT_19_T8_CREATION] — Monde lot 19 T8 ==== */
let MGMT_DUO_NOUVELLE={slot:0,etape:'noms',noms:{a:'',b:''},a:null,i:0};
let MGMT_DUO_QG={};
let MGMT_DUO_EFFECTIF_COTE='a';

/* ==== [ANCRE: MONDE_LOT_19_T9_QG] — Monde lot 19 T9 ==== */
/** « d’Anthony » devant une voyelle, « de François » sinon. @returns {string} */
function mgmtDuoDe(nom){
  const t=String(nom||'');
  return /^[aeiouyhàâäéèêëîïôöùûü]/i.test(t)?'d’'+t:'de '+t;
}
/** Le QG, au balisage exact de la planche DuoQG (maquettes/duo) : deux colonnes de joueur, le score de la saison au centre, l'action de l'étape. */
function mgmtDuoQGHtml(){
  const m=G.mgmt,d=m.duo,sc=mgmtDuoScore(m);
  const idDe=cote=>cote==='a'?mgmtPredecesseurOrgId(m):d.b;
  const nomOrg=id=>(MGMT_ORGANISATIONS.find(o=>o.id===id)||{}).nom||'';
  const classement=mgmtOrgClassement(m);
  const etat=MGMT_DUO_QG.enCours?'progression':(d.etape==='attente'?'attente':'arrivee');
  const nCartes=d.cartes.length;
  const colonne=cote=>{
    const id=idDe(cote), ident=(typeof mgmtOrgIdentite==='function'&&mgmtOrgIdentite(id))||{};
    const resume=mgmtDuoResume(m,cote);
    const caisse=duoEuros(mgmtDuoPartie(m,cote).treasury);
    const rang=(classement.find(x=>x.id===id)||{}).rang||'—';
    const champions=resume.champions.filter(x=>x.id).length;
    const lignes=resume.combats.length===0
      ?`<div class="vide l1 t2">${nCartes?`Rien encore depuis la super carte ${nCartes}.`:'Rien encore.'}</div>`
      :resume.combats.slice(0,6).map(x=>{
        const gagnant=x.winner==='A'?x.a:x.b, perdant=x.winner==='A'?x.b:x.a;
        const methode=mgmtSuMethodeFamille({nul:x.winner==='D',family:x.family,round:x.round,rounds:x.rounds});
        return `<div class="ligne"><div class="col"><div class="l1">${x.winner==='D'?`${duoEsc(x.a)} et ${duoEsc(x.b)}`:`<span class="nom">${duoEsc(gagnant)}</span> bat ${duoEsc(perdant)}`}</div><div class="l2">${duoEsc(mgmtDivisionLabel(x.div))} · ${duoEsc(methode)}</div></div></div>`;
      }).join('');
    const n=resume.soirees;
    return duoPan(`qg-cote ${cote==='a'?'j1':'j2'}`,`<div class="bande"></div>
      <div class="qg-tete"><div class="col"><div class="T qg-org">${duoEsc(duoMaj(nomOrg(id)))}</div><div class="lab">${duoEsc(duoMaj(d.noms[cote]))}${ident.ville?` · ${duoEsc(duoMaj(ident.ville))} · DEPUIS ${duoEsc(ident.annee)}`:''}</div></div><div class="qg-score T">${sc[cote]}</div></div>
      <div class="qg-tuiles">
        <div class="tuile"><div class="lab">En caisse</div><div class="T">${caisse}</div></div>
        <div class="tuile"><div class="lab">Organisations</div><div class="T">${duoEsc(rang)}<small>e sur ${classement.length}</small></div></div>
        <div class="tuile"><div class="lab">Champions</div><div class="T">${champions}<small> sur ${allDivisions().length}</small></div></div>
      </div>
      <div class="sous">Depuis la dernière super carte · ${n} soirée${n>1?'s':''}</div>
      <div class="qg-lignes">${lignes}</div>
      <div class="bouton qg-eff" onclick="CL.mgmtDuoOuvrirEffectif('${cote}')"><span class="T">EFFECTIF ${cote==='a'?'D’':'DE '}${duoEsc(duoMaj(d.noms[cote]))}</span><span class="k">${cote==='a'?'1':'2'}</span></div>`);
  };
  const dernier=nCartes?d.cartes[nCartes-1]:null;
  const lectureDernier=(()=>{
    if(!dernier) return 'Aucune super carte jouée';
    const a=dernier.combats.filter(c=>c.winner==='A').length, b=dernier.combats.filter(c=>c.winner==='B').length;
    return a===b?`Super carte ${dernier.n} : égalité ${a}–${b}`:`Super carte ${dernier.n} : ${a}–${b}`;
  })();
  const jours=Math.max(0,d.prochaine-m.cal.jour);
  const date=mgmtJourDateTexte(d.prochaine);
  const ecrans={encheres:'mgmt_duo_encheres',draft:'mgmt_duo_draft',pret:'mgmt_duo_draft',soiree:'mgmt_duo_soiree',bilan:'mgmt_duo_bilan'};
  const textes={
    encheres:['C’est le jour','LES ENCHÈRES',`${d.encheres?d.encheres.lots.length:0} combattants libres, puis la composition de la carte.`],
    draft:['La carte','COMPOSER','Six combats : l’un place, l’autre répond.'],
    pret:['La carte est prête','LANCER','Les six combats vont se jouer.'],
    soiree:['La soirée','REPRENDRE',`Combat ${d.soiree?Math.min(6,d.soiree.i+1):1} sur 6.`],
    bilan:['Le bilan','VOIR','La super carte est jouée.']};
  const bloc=(lab,gros,txt,onclick)=>`<div class="jaune-bloc focus"${onclick?` onclick="${onclick}" style="cursor:pointer"`:''}><div class="lab">${lab}</div><div class="jb-l"><div class="T">${gros}</div><div class="k">Entrée</div></div><div class="jb-t">${txt}</div></div>`;
  let action;
  if(etat==='progression'){
    const depart=MGMT_DUO_QG.depart, total=Math.max(1,d.prochaine-depart);
    const pct=Math.max(0,Math.min(100,Math.round(100*(m.cal.jour-depart)/total)));
    action=`<div class="prog"><div class="lab">Les soirées des adjoints se jouent</div><div class="T prog-date">${duoEsc(mgmtJourDateTexte(m.cal.jour))}</div>
        <div class="prog-barre"><b style="width:${pct}%"></b></div>
        <div class="l2">${duoEsc(nomOrg(idDe('a')))} Fight Night ${m.eventsPlayed+1} · ${duoEsc(nomOrg(idDe('b')))} Fight Night ${mgmtDuoPartie(m,'b').eventsPlayed+1}</div></div>`;
  }else if(MGMT_DUO_QG.erreur){
    action=bloc('La progression s’est arrêtée','RÉESSAYER','Rien n’est perdu : la partie est sauvegardée.','CL.mgmtDuoAvancerReessayer()');
  }else if(d.etape==='attente'){
    action=bloc('La suite','AVANCER',`Jusqu’à la super carte du ${duoEsc(date.toLowerCase())}. Vos adjoints jouent les soirées.`,'CL.mgmtDuoAvancer()');
  }else{
    const t=textes[d.etape]||['','',''];
    action=bloc(t[0],t[1],t[2],SCREENS[ecrans[d.etape]]?`CL.go('${ecrans[d.etape]}')`:'');
  }
  const centre=duoPan('qg-centre',`<div class="lab qg-c-lab">Saison ${sc.saison}${nCartes?` · après la super carte ${nCartes}`:' · avant la première super carte'}</div>
      <div class="qg-gros"><span class="T j1c">${sc.a}</span><span class="T t2">–</span><span class="T j2c">${sc.b}</span></div>
      <div class="l2 qg-c-sous">${lectureDernier}</div>
      <div class="sep"></div>
      <div class="lab">Prochaine super carte</div><div class="T qg-date">${duoEsc(date)}</div>
      <div class="l2">${etat==='progression'||d.etape==='attente'?`Dans ${jours} jour${jours>1?'s':''}`:'Aujourd’hui'}</div>
      <div class="qg-action">${action}</div>
      ${nCartes?'<div class="bouton" onclick="CL.go(\'mgmt_duo_histo\')"><span class="T">SUPER CARTES PASSÉES</span><span class="k">H</span></div>':''}`);
  const versus=`${duoEsc(duoMaj(d.noms.a))} <span class="t2">×</span> ${duoEsc(duoMaj(d.noms.b))}`;
  const touches=duoTouches([[['1'],'Effectif '+duoEsc(mgmtDuoDe(d.noms.a)),false,"CL.mgmtDuoOuvrirEffectif('a')"],[['2'],'Effectif '+duoEsc(mgmtDuoDe(d.noms.b)),false,"CL.mgmtDuoOuvrirEffectif('b')"],
    [['H'],'Super cartes passées',false,nCartes?"CL.go('mgmt_duo_histo')":''],[['Échap'],'Menu principal',false,'CL.mgmtDuoQuitter()'],[['Entrée'],'Continuer',true,'CL.mgmtDuoQGAction()']]);
  return duoCadre(`${duoEntete(versus,duoDroiteSaison(sc.saison,sc.numero))}
  <main class="contenu large qg"><div class="qg-cols vis">${colonne('a')}${centre}${colonne('b')}</div></main>
  ${touches}`);
}
SCREENS.mgmt_duo=mgmtDuoQGHtml;
Object.assign(CL,{
  mgmtDuoOuvrirEffectif(cote){if(!MGMT_DUO_QG.enCours){MGMT_DUO_EFFECTIF_COTE=cote;CL.go('mgmt_duo_effectif');}},
  mgmtDuoAvancer(){
    if(MGMT_DUO_QG.enCours)return;
    MGMT_DUO_QG={enCours:true,erreur:false,depart:G.mgmt.cal.jour};
    const pas=()=>{
      try{
        const r=mgmtDuoAvancerPas(G.mgmt);
        saveMgmt();
        if(r.termine){MGMT_DUO_QG={};CL.go('mgmt_duo');return;}
        render();requestAnimationFrame(()=>setTimeout(pas,0));
      }catch(e){MGMT_DUO_QG={enCours:false,erreur:true};render();}
    };
    render();requestAnimationFrame(()=>setTimeout(pas,0));
  },
  mgmtDuoAvancerReessayer(){MGMT_DUO_QG={};CL.mgmtDuoAvancer();},
  mgmtDuoQuitter(){if(!MGMT_DUO_QG.enCours)CL.mgmtLeave();},
  /** Entrée au QG : l'action de l'étape en cours. */
  mgmtDuoQGAction(){
    const d=G.mgmt.duo;
    if(MGMT_DUO_QG.enCours) return;
    if(MGMT_DUO_QG.erreur){CL.mgmtDuoAvancerReessayer();return;}
    if(d.etape==='attente'){CL.mgmtDuoAvancer();return;}
    const ecrans={encheres:'mgmt_duo_encheres',draft:'mgmt_duo_draft',pret:'mgmt_duo_draft',soiree:'mgmt_duo_soiree',bilan:'mgmt_duo_bilan'};
    if(ecrans[d.etape]&&SCREENS[ecrans[d.etape]]) CL.go(ecrans[d.etape]);
  }
});
keysRegister('mgmt_duo',{Enter(){CL.mgmtDuoQGAction();},Escape(){CL.mgmtDuoQuitter();},'1'(){CL.mgmtDuoOuvrirEffectif('a');},'2'(){CL.mgmtDuoOuvrirEffectif('b');},h(){if(!MGMT_DUO_QG.enCours&&G.mgmt.duo.cartes&&G.mgmt.duo.cartes.length)CL.go('mgmt_duo_histo');}});

/* ==== [ANCRE: DUO_T3_ECRANS] — Monde lot 19 T10 ==== */
let MGMT_DUO_EFFECTIF_DIV=null;
/** L'effectif d'un joueur, au balisage exact de la planche DuoEffectif : onglets de catégorie, liste (rang, nom, bilan, âge, forme, état, contrat). */
function mgmtDuoEffectifHtml(){
  const m=G.mgmt,d=m.duo,cote=MGMT_DUO_EFFECTIF_COTE,orgId=cote==='a'?mgmtPredecesseurOrgId(m):d.b;
  const org=MGMT_ORGANISATIONS.find(o=>o.id===orgId)||{nom:''},divisions=allDivisions(),divId=MGMT_DUO_EFFECTIF_DIV||divisions[0].id;
  const divCourante=divisions.find(x=>x.id===divId)||divisions[0];
  const ETAT={dispo:'Disponible',blesse:'Blessé',libre:'Sans contrat',refuse:'Refuse de combattre'};
  const groupe=divisions.filter(x=>x.gender===divCourante.gender);
  const autreGroupe=divisions.filter(x=>x.gender!==divCourante.gender);
  const onglets=`<div class="onglets">${groupe.map(x=>`<div class="ong${x.id===divCourante.id?' on':''}" onclick="CL.mgmtDuoEffectifDivision('${duoEsc(x.id)}')" style="cursor:pointer">${duoEsc(duoMaj(String(mgmtDivisionLabel(x.id)).replace('Poids ','').replace(' féminin','')))}</div>`).join('')}${autreGroupe.length?`<div class="ong" onclick="CL.mgmtDuoEffectifDivision('${duoEsc(autreGroupe[0].id)}')" style="cursor:pointer">${divCourante.gender==='F'?'MASCULINS':'FÉMININES'} ›</div>`:''}</div>`;
  const lignes=mgmtDuoEffectif(m,cote,divCourante.id).slice(0,8).map(f=>`<div class="ef-l"><div class="ef-r T">${duoEsc(f.rang||'—')}</div><div class="ef-n l1">${duoEsc(f.name)}</div><div class="ef-b l1">${duoEsc(`${f.W}-${f.L}-${f.D}`)}</div><div class="ef-a l1 t2">${duoEsc(f.age)} ans</div>${duoForme(f.forme)}<div class="ef-e l2 ${duoEsc(f.etat)}">${ETAT[f.etat]||''}</div><div class="ef-c l2">${f.restants?`${duoEsc(f.restants)} combat${f.restants>1?'s':''} au contrat`:'—'}</div></div>`).join('');
  const autre=cote==='a'?'b':'a';
  const versus=`${duoEsc(duoMaj(d.noms.a))} <span class="t2">×</span> ${duoEsc(duoMaj(d.noms.b))}`;
  const vue=`<div class="ef ${cote==='a'?'j1':'j2'} vis">
      <div class="ef-tete"><div class="tour-mini ${cote==='a'?'j1':'j2'}">${duoEsc(duoMaj(d.noms[cote]))}</div><div class="T ef-org">${duoEsc(duoMaj(org.nom))}</div><div class="l2">Tab : l’effectif ${duoEsc(mgmtDuoDe(d.noms[autre]))}</div></div>
      ${onglets}
      ${duoPan('ef-pan',`<div class="ef-l ef-h"><div class="ef-r lab">Rang</div><div class="ef-n lab">Combattant</div><div class="ef-b lab">Bilan</div><div class="ef-a lab">Âge</div><div class="forme lab">Forme</div><div class="ef-e lab">État</div><div class="ef-c lab">Contrat</div></div>${lignes}`)}
    </div>`;
  const touches=duoTouches([[['←','→'],'Catégorie'],[['Tab'],'L’autre joueur',false,'CL.mgmtDuoEffectifAutre()'],[['Échap'],'Retour au QG',false,'CL.mgmtDuoEffectifRetour()']]);
  return duoCadre(`${duoEntete(`Effectif · ${versus}`,`<div class="plaque"><span class="T">${duoEsc(duoMaj(mgmtDivisionLabel(divCourante.id)))}</span></div>`)}
  <main class="contenu large">${vue}</main>
  ${touches}`);
}
SCREENS.mgmt_duo_effectif=mgmtDuoEffectifHtml;
Object.assign(CL,{mgmtDuoEffectifDivision(id){if(allDivisions().some(d=>d.id===id)){MGMT_DUO_EFFECTIF_DIV=id;render();}},mgmtDuoEffectifAutre(){MGMT_DUO_EFFECTIF_COTE=MGMT_DUO_EFFECTIF_COTE==='a'?'b':'a';render();},mgmtDuoEffectifRetour(){CL.go('mgmt_duo');}});
keysRegister('mgmt_duo_effectif',{Escape(){CL.mgmtDuoEffectifRetour();},Tab(){CL.mgmtDuoEffectifAutre();},ArrowLeft(){const a=allDivisions(),i=a.findIndex(d=>d.id===MGMT_DUO_EFFECTIF_DIV);CL.mgmtDuoEffectifDivision(a[(i-1+a.length)%a.length].id);},ArrowRight(){const a=allDivisions(),i=a.findIndex(d=>d.id===MGMT_DUO_EFFECTIF_DIV);CL.mgmtDuoEffectifDivision(a[(i+1)%a.length].id);}});

let MGMT_DUO_HISTO_I=0;
/** Les super cartes passées, au balisage du bilan (planche DuoBilan) : la carte choisie en liste de six combats, toutes les cartes à droite. */
function mgmtDuoHistoHtml(){
  const m=G.mgmt,d=m.duo,cartes=d.cartes.slice().reverse();
  const i=Math.max(0,Math.min(MGMT_DUO_HISTO_I,cartes.length-1)), c=cartes[i];
  const versus=`${duoEsc(duoMaj(d.noms.a))} <span class="t2">×</span> ${duoEsc(duoMaj(d.noms.b))}`;
  const sc=mgmtDuoScore(m);
  if(!c) return duoCadre(`${duoEntete(`Super cartes passées · ${versus}`,duoDroiteSaison(sc.saison,sc.numero))}<main class="contenu large"><div class="l1 t2">Aucune super carte jouée.</div></main>${duoTouches([[['Échap'],'Retour au QG',false,'CL.mgmtDuoHistoRetour()']])}`);
  const scoreA=c.combats.filter(x=>x.winner==='A').length, scoreB=c.combats.filter(x=>x.winner==='B').length;
  const g=c.gagnant==='a'||c.gagnant==='b'?c.gagnant:null;
  const orgA=mgmtOrgNom(m), orgB=mgmtOrgNom(mgmtDuoPartie(m,'b'));
  const lignes=c.combats.map((x,k)=>{
    const meth=mgmtSuMethodeFamille({nul:x.winner==='D',family:x.family,round:x.round,rounds:x.rounds});
    return `<div class="bi-l"><div class="lab bi-num">${k===5?'PRINCIPAL':'COMBAT '+(6-k)}</div><div class="bi-n l1 ${x.winner==='A'?'gagne':''}"><span class="pt j1"></span>${duoEsc(x.na)}</div><div class="bi-n l1 ${x.winner==='B'?'gagne':''}"><span class="pt j2"></span>${duoEsc(x.nb)}</div><div class="bi-m l2">${duoEsc(mgmtDivisionLabel(x.div))} · ${duoEsc(meth)}</div><div class="aller" onclick="CL.mgmtDuoHistoRevoir(${x.h})" style="cursor:pointer">Revoir ›</div></div>`;
  }).join('');
  const liste=cartes.map((k,n)=>{
    const a=k.combats.filter(x=>x.winner==='A').length, b=k.combats.filter(x=>x.winner==='B').length;
    return `<div class="ligne${n===i?' focus':''}" onclick="CL.mgmtDuoHistoCarte(${n})" style="cursor:pointer"><div class="l1">Super carte ${duoEsc(k.n)} · ${duoEsc(mgmtJourDateTexte(k.jour).toLowerCase())}</div><div class="l1">${a} – ${b}</div></div>`;
  }).join('');
  const corps=`${duoEntete(`Super cartes passées · ${versus}`,duoDroiteSaison(sc.saison,sc.numero))}
  <main class="contenu large bi"><div class="bi-bandeau ${g?g==='a'?'j1':'j2':'nul'}"><span class="T">${g?`${duoEsc(duoMaj(d.noms[g]))} REMPORTE LA SUPER CARTE ${duoEsc(c.n)}`:`ÉGALITÉ À LA SUPER CARTE ${duoEsc(c.n)}`}</span><span class="T bi-sc">${scoreA} – ${scoreB}</span></div>
    <div class="bi-cols">${duoPan('bi-liste',`${duoTitre('LES SIX COMBATS',duoEsc(mgmtJourDateTexte(c.jour)))}<div class="bi-l bi-h"><div class="lab bi-num"></div><div class="bi-n lab">${duoEsc(duoMaj(d.noms.a))} · ${duoEsc(duoMaj(orgA))}</div><div class="bi-n lab">${duoEsc(duoMaj(d.noms.b))} · ${duoEsc(duoMaj(orgB))}</div><div class="bi-m lab">Comment</div><div class="aller"></div></div>${lignes}`)}
      ${duoPan('bi-saison',`${duoTitre('LES SUPER CARTES',`${cartes.length} JOUÉE${cartes.length>1?'S':''}`)}${liste}`)}</div></main>
  ${duoTouches([[['↑','↓'],'Super carte'],[['Échap'],'Retour au QG',false,'CL.mgmtDuoHistoRetour()']])}`;
  return duoCadre(corps);
}
SCREENS.mgmt_duo_histo=mgmtDuoHistoHtml;
Object.assign(CL,{mgmtDuoHistoRevoir(h){const trace=G.mgmt.hist[h];if(trace)mgmtCombatOuvrir({trace,etiquette:'SUPER CARTE',retour:'mgmt_duo_histo',salle:{taux:1,prog:1}});},mgmtDuoHistoRetour(){CL.go('mgmt_duo');},
  mgmtDuoHistoCarte(n){const max=G.mgmt.duo.cartes.length-1;MGMT_DUO_HISTO_I=Math.max(0,Math.min(max,n));render();}});
keysRegister('mgmt_duo_histo',{Escape(){CL.mgmtDuoHistoRetour();},ArrowUp(){CL.mgmtDuoHistoCarte(MGMT_DUO_HISTO_I-1);},ArrowDown(){CL.mgmtDuoHistoCarte(MGMT_DUO_HISTO_I+1);}});

/** La création à deux, au balisage exact de la planche DuoCreation (maquettes/duo) : les noms, puis le choix de J1, puis celui de J2. */
function mgmtDuoNouvelleHtml(){
  const s=MGMT_DUO_NOUVELLE;
  const nomJ=cote=>s.noms[cote]||(cote==='a'?'Joueur 1':'Joueur 2');
  const carte=(o,i)=>{
    const ident=mgmtOrgIdentite(o.id)||{}, atouts=mgmtOrgAtouts(o.profil);
    const choisie=s.i===i&&!(s.etape==='b'&&i===s.a), prise=s.etape==='b'&&i===s.a;
    const lignes=[...atouts.plus.map(t=>['plus',t]),...atouts.moins.map(t=>['moins',t])]
      .map(([k,t])=>`<div class="org-l"><span class="${k}">${k==='plus'?'+':'−'}</span><span>${duoEsc(t)}</span></div>`).join('');
    return duoPan(`org${choisie?' choisi':''}${prise?' prise':''}`,`<div class="org-tete${choisie?' on':''}"><div class="T" style="font-size:${o.nom.length>18?30:44}px">${duoEsc(duoMaj(o.nom))}</div>${choisie?'<div class="lab noir">CHOISIE</div>':''}${prise?`<span class="tag j1">${duoEsc(duoMaj(nomJ('a')))}</span>`:''}</div>
      <div class="org-corps"><div class="lab">${duoEsc(duoMaj(ident.ville||''))} · DEPUIS ${duoEsc(ident.annee||'')}</div><div class="org-rep">${duoEsc(ident.reputation||'')}</div><div>${lignes}</div></div>`,
      ` role="button" aria-label="${duoEsc(o.nom)}"${prise?' aria-disabled="true"':` onclick="CL.mgmtDuoNouvelleChoisir(${i})"`}`);
  };
  const champ=(cote,lab,sous)=>`<label class="champ ${cote==='a'?'j1':'j2'}"><span class="lab">${lab}</span><span class="saisie"><input id="mf-duo-nom-${cote}" maxlength="16" value="${duoEsc(s.noms[cote])}" placeholder="${cote==='a'?'Joueur 1':'Joueur 2'}" style="all:unset;width:100%;font:inherit;color:inherit" onkeydown="if(event.key==='Enter'){event.preventDefault();CL.mgmtDuoNouvelleContinuer()}else if(event.key==='Escape'){event.preventDefault();CL.mgmtDuoNouvelleEchapper()}"></span><span class="l2">${sous}</span></label>`;
  const pied=(qui,bouton)=>`<div class="cr-pied"><div class="l1">${qui}</div><div class="bouton jaune" onclick="CL.mgmtDuoNouvelleValider()"><span class="T">${bouton}</span><span class="k">Entrée</span></div></div>`;
  let contenu;
  if(s.etape==='noms'){
    contenu=duoPan('cr-carte',`${duoTitre('QUI JOUE ?','DEUX JOUEURS, UN PC')}
        <div class="cr-champs">${champ('a','JOUEUR 1','Choisit son organisation en premier')}${champ('b','JOUEUR 2','Choisit parmi les sept autres')}</div>
        <div class="cr-regle">
          <div class="l1">Chacun son organisation. Vos adjoints jouent les soirées ordinaires.</div>
          <div class="l1">Tous les 3 mois, une super carte : six combats, tes combattants contre les siens.</div>
        </div>
        <div class="cr-bas"><div class="l2">16 caractères au plus. Vide : « Joueur 1 », « Joueur 2 ».</div><div class="bouton jaune" onclick="CL.mgmtDuoNouvelleContinuer()"><span class="T">CONTINUER</span><span class="k">Entrée</span></div></div>`);
    contenu=`<div class="cr-noms vis">${contenu}</div>`;
  }else{
    const orgChoisie=MGMT_ORGANISATIONS[s.i];
    const grille=`<div class="org-grille">${MGMT_ORGANISATIONS.map((o,i)=>carte(o,i)).join('')}</div>`;
    const cote=s.etape==='a'?'a':'b';
    const qui=`<span class="tour-mini ${cote==='a'?'j1':'j2'}">${duoEsc(duoMaj(nomJ(cote)))}</span> choisis ton organisation${s.etape==='b'?` · ${duoEsc(MGMT_ORGANISATIONS[s.a].nom)} est prise par ${duoEsc(nomJ('a'))}`:''}`;
    contenu=`<div class="vis">${grille}${pied(qui,s.etape==='a'?`CHOISIR ${duoEsc(duoMaj(orgChoisie.nom))}`:'CRÉER LA PARTIE')}</div>`;
  }
  const touches=duoTouches([[['↑','↓','←','→'],'Choisir'],[['Échap'],'Retour',false,'CL.mgmtDuoNouvelleEchapper()'],[['Entrée'],'Valider',true,s.etape==='noms'?'CL.mgmtDuoNouvelleContinuer()':'CL.mgmtDuoNouvelleValider()']]);
  return duoCadre(`${duoEntete('Nouvelle partie à deux',`<div class="plaque"><span class="lab">EMPLACEMENT ${duoEsc(s.slot)}</span></div>`)}
  <main class="contenu large">${contenu}</main>
  ${touches}`);
}
SCREENS.mgmt_duo_nouvelle=mgmtDuoNouvelleHtml;
Object.assign(CL,{
  mgmtDuoNouvelle(slot){MGMT_DUO_NOUVELLE={slot,etape:'noms',noms:{a:'',b:''},a:null,i:0};CL.go('mgmt_duo_nouvelle');},
  mgmtDuoNouvelleContinuer(){const a=document.getElementById('mf-duo-nom-a'),b=document.getElementById('mf-duo-nom-b');if(a)MGMT_DUO_NOUVELLE.noms.a=a.value.slice(0,16);if(b)MGMT_DUO_NOUVELLE.noms.b=b.value.slice(0,16);MGMT_DUO_NOUVELLE.etape='a';MGMT_DUO_NOUVELLE.i=0;render();},
  mgmtDuoNouvelleChoisir(i){const s=MGMT_DUO_NOUVELLE;if(!Number.isSafeInteger(i)||!MGMT_ORGANISATIONS[i]||(s.etape==='b'&&i===s.a))return;s.i=i;render();},
  mgmtDuoNouvelleDeplacer(dx,dy){const s=MGMT_DUO_NOUVELLE,n=MGMT_ORGANISATIONS.length;let i=s.i;for(let tries=0;tries<n;tries++){i=(i+(dx||dy*4)+n)%n;if(!(s.etape==='b'&&i===s.a)){s.i=i;break;}}render();},
  mgmtDuoNouvelleValider(){const s=MGMT_DUO_NOUVELLE;if(s.etape==='a'){s.a=s.i;s.etape='b';s.i=s.i===0?1:0;render();return;}if(s.etape!=='b'||s.i===s.a)return;MGMT_NOUVELLE={gen:null,slot:s.slot,i:s.a,duo:{b:MGMT_ORGANISATIONS[s.i].id,noms:{...s.noms}}};CL.go('mgmt_nouvelle');CL.mgmtNouvelleLancer();},
  mgmtDuoNouvelleEchapper(){const s=MGMT_DUO_NOUVELLE;if(s.etape==='b'){s.etape='a';s.i=s.a;render();}else if(s.etape==='a'){s.etape='noms';render();}else CL.go('mgmt_parties');}
});
keysRegister('mgmt_duo_nouvelle',{
  ArrowLeft(){CL.mgmtDuoNouvelleDeplacer(-1,0);},ArrowRight(){CL.mgmtDuoNouvelleDeplacer(1,0);},ArrowUp(){CL.mgmtDuoNouvelleDeplacer(0,-1);},ArrowDown(){CL.mgmtDuoNouvelleDeplacer(0,1);},
  Enter(){if(MGMT_DUO_NOUVELLE.etape==='noms')CL.mgmtDuoNouvelleContinuer();else CL.mgmtDuoNouvelleValider();},Escape(){CL.mgmtDuoNouvelleEchapper();}
});
