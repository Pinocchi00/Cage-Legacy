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
function mgmtDuoEffectifHtml(){
  const m=G.mgmt,d=m.duo,cote=MGMT_DUO_EFFECTIF_COTE,orgId=cote==='a'?mgmtPredecesseurOrgId(m):d.b;
  const org=MGMT_ORGANISATIONS.find(o=>o.id===orgId),divisions=allDivisions(),divId=MGMT_DUO_EFFECTIF_DIV||divisions[0].id;
  const effectif=mgmtDuoEffectif(m,cote,divId);
  const lignes=effectif.map(f=>`<div class="mf-duo-effectif-ligne"><strong>${esc(f.rang||'—')}</strong><span>${esc(f.name)}</span><span>${esc(`${f.W}-${f.L}-${f.D}`)}</span><span>${esc(`${f.age} ans`)}</span><span>${f.forme.map(x=>`<i>${esc(x==='v'?'V':x==='d'?'D':'N')}</i>`).join('')}</span><span>${esc(({dispo:'Disponible',blesse:'Blessé',libre:'Sans contrat',refuse:'Refuse de combattre'})[f.etat]||'')}</span><span>${esc(`${f.restants} combats au contrat`)}</span></div>`).join('')||'<p>Aucun combattant</p>';
  const onglets=divisions.map((x,i)=>`<button class="${x.id===divId?'actif':''}" onclick="CL.mgmtDuoEffectifDivision('${esc(x.id)}')">${esc(mgmtDivisionLabel(x.id))}</button>`).join('');
  return mfEcran(`<div class="mf-duo-effectif"><div class="mf-duo-effectif-tete"><strong>${esc(d.noms[cote])}</strong><span>${esc(org&&org.nom||'')}</span></div><nav>${onglets}</nav><div class="mf-duo-effectif-liste"><div class="mf-duo-effectif-ligne mf-duo-effectif-entete"><strong>Rang</strong><strong>Combattant</strong><strong>Bilan</strong><strong>Âge</strong><strong>Forme</strong><strong>État</strong><strong>Contrat</strong></div>${lignes}</div></div>`,{barre:'logo',plaque:'Effectif',libelle:`${esc(org&&org.nom||'')} · ${esc(d.noms[cote])}`,touches:[{ks:['Tab'],t:'Autre effectif'},{ks:['Échap'],t:'Retour'}]});
}
SCREENS.mgmt_duo_effectif=mgmtDuoEffectifHtml;
Object.assign(CL,{mgmtDuoEffectifDivision(id){if(allDivisions().some(d=>d.id===id)){MGMT_DUO_EFFECTIF_DIV=id;render();}},mgmtDuoEffectifAutre(){MGMT_DUO_EFFECTIF_COTE=MGMT_DUO_EFFECTIF_COTE==='a'?'b':'a';render();},mgmtDuoEffectifRetour(){CL.go('mgmt_duo');}});
keysRegister('mgmt_duo_effectif',{Escape(){CL.mgmtDuoEffectifRetour();},Tab(){CL.mgmtDuoEffectifAutre();},ArrowLeft(){const a=allDivisions(),i=a.findIndex(d=>d.id===MGMT_DUO_EFFECTIF_DIV);CL.mgmtDuoEffectifDivision(a[(i-1+a.length)%a.length].id);},ArrowRight(){const a=allDivisions(),i=a.findIndex(d=>d.id===MGMT_DUO_EFFECTIF_DIV);CL.mgmtDuoEffectifDivision(a[(i+1)%a.length].id);}});

function mgmtDuoHistoHtml(){
  const m=G.mgmt,d=m.duo,cartes=(d.cartes||[]).slice().reverse();
  const html=cartes.map(c=>`<article class="mf-duo-histo-carte"><h2>Super carte ${esc(c.n)} · ${esc(mgmtJourDateTexte(c.jour))} · ${esc(d.noms.a)} ${esc(c.combats.filter(x=>x.winner==='A').length)} – ${esc(c.combats.filter(x=>x.winner==='B').length)} ${esc(d.noms.b)}</h2>${c.combats.map(x=>`<div>${esc(x.na)} – ${esc(x.nb)} · ${esc(mgmtDivisionLabel(x.div))} · ${esc(x.winner==='A'?d.noms.a:x.winner==='B'?d.noms.b:'Égalité')} · ${esc(mgmtSuMethodeFamille({nul:x.winner==='D',family:x.family,round:x.round,rounds:x.rounds}))} · R${esc(x.round)}<button onclick="CL.mgmtDuoHistoRevoir(${esc(x.h)})">Revoir</button></div>`).join('')}</article>`).join('')||'<p>Aucune super carte passée</p>';
  return mfEcran(`<div class="mf-duo-histo">${html}</div>`,{barre:'logo',plaque:'Super cartes passées',libelle:`${esc(d.noms.a)} × ${esc(d.noms.b)}`,touches:[{ks:['Échap'],t:'Retour'}]});
}
SCREENS.mgmt_duo_histo=mgmtDuoHistoHtml;
Object.assign(CL,{mgmtDuoHistoRevoir(h){const trace=G.mgmt.hist[h];if(trace)mgmtCombatOuvrir({trace,etiquette:'SUPER CARTE',retour:'mgmt_duo_histo',salle:{taux:1,prog:1}});},mgmtDuoHistoRetour(){CL.go('mgmt_duo');}});
keysRegister('mgmt_duo_histo',{Escape(){CL.mgmtDuoHistoRetour();}});

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
