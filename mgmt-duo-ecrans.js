"use strict";
/* ==== [ANCRE: MONDE_LOT_19_T8_CREATION] — Monde lot 19 T8 ==== */
let MGMT_DUO_NOUVELLE={slot:0,etape:'noms',noms:{a:'',b:''},a:null,i:0};
let MGMT_DUO_QG={};

/* ==== [ANCRE: MONDE_LOT_19_T9_QG] — Monde lot 19 T9 ==== */
function mgmtDuoQGHtml(){
  const m=G.mgmt,d=m.duo,score=mgmtDuoScore(m);
  const nomOrg=cote=>MGMT_ORGANISATIONS.find(o=>o.id===(cote==='a'?mgmtPredecesseurOrgId(m):d.b))?.nom||'';
  const coteHtml=cote=>{
    const partie=mgmtDuoPartie(m,cote),resume=mgmtDuoResume(m,cote),rang=mgmtOrgClassement(m).find(x=>x.id===(cote==='a'?mgmtPredecesseurOrgId(m):d.b))?.rang;
    const combats=resume.combats.slice(0,6).map(c=>{
      const vainqueur=c.winner==='D'?'Égalité':(c.winner==='a'?c.a:c.b),perdant=c.winner==='a'?c.b:c.a;
      const methode=mgmtSuMethodeFamille({nul:c.winner==='D',family:c.family,round:c.round,rounds:c.rounds});
      return `<div class="mf-duo-qg-combat">${esc(vainqueur)} ${c.winner==='D'?'fait match nul contre':'bat'} ${esc(perdant)} · ${esc(mgmtDivisionLabel(c.div))} · ${esc(methode)}</div>`;
    }).join('')||'<div class="mf-duo-qg-combat">Rien encore</div>';
    const champions=resume.champions.filter(x=>x.id).length;
    return `<section class="mf-duo-qg-cote"><h2>${esc(nomOrg(cote))}</h2><div class="mf-duo-qg-joueur">${esc(d.noms[cote])}</div><div class="mf-duo-qg-score">${score[cote]}</div><div class="mf-duo-qg-tuiles"><div>En caisse<strong>${esc(mgmtEuros(partie.treasury))}</strong></div><div>Classement des organisations<strong>${rang||'—'}</strong></div><div>Champions<strong>${champions}</strong></div></div><div class="mf-duo-qg-recent">Depuis la dernière super carte · ${resume.soirees} soirées${combats}</div><button class="mf-duo-qg-effectif" onclick="CL.go('mgmt_duo_effectif')">Effectif de ${esc(d.noms[cote])}</button></section>`;
  };
  const actions={attente:['Avancer jusqu’à la super carte','CL.mgmtDuoAvancer()'],encheres:['Ouvrir les enchères',"CL.go('mgmt_duo_encheres')"],draft:['Composer la super carte',"CL.go('mgmt_duo_draft')"],pret:['Lancer la super carte',"CL.go('mgmt_duo_draft')"],soiree:['Reprendre la soirée',"CL.go('mgmt_duo_soiree')"],bilan:['Voir le bilan',"CL.go('mgmt_duo_bilan')"]};
  const action=actions[d.etape],cible=SCREENS[action&&d.etape==='attente'?'__absent__':({encheres:'mgmt_duo_encheres',draft:'mgmt_duo_draft',pret:'mgmt_duo_draft',soiree:'mgmt_duo_soiree',bilan:'mgmt_duo_bilan'}[d.etape]||'__absent__')];
  const bouton=action&&(!cible||d.etape==='attente')?mfBouton(action[0],{touche:'Entrée',jaune:true,onclick:action[1]}):'';
  const progression=MGMT_DUO_QG.enCours?`<div class="mf-duo-qg-progress"><div>Les soirées des adjoints se jouent · ${esc(mgmtJourDateTexte(m.cal.jour))}</div><progress max="${Math.max(1,d.prochaine-MGMT_DUO_QG.depart)}" value="${Math.max(0,m.cal.jour-MGMT_DUO_QG.depart)}"></progress></div>`:'';
  const erreur=MGMT_DUO_QG.erreur?`<div>La progression s'est arrêtée. ${mfBouton('Réessayer',{jaune:true,onclick:'CL.mgmtDuoAvancerReessayer()'})}</div>`:'';
  const centre=`<div class="mf-duo-qg-centre"><div>Score de la saison</div><strong>${score.a} – ${score.b}</strong><p>Prochaine super carte : ${esc(mgmtJourDateTexte(d.prochaine))}</p><div>${esc(action?action[0]:d.etape)}</div>${MGMT_DUO_QG.enCours||MGMT_DUO_QG.erreur?'':bouton}${progression}${erreur}</div>`;
  return mfEcran(`<div class="mf-duo-qg">${coteHtml('a')}${centre}${coteHtml('b')}</div>`,{barre:'logo',plaque:'Duo',libelle:`${esc(d.noms.a)} × ${esc(d.noms.b)}`,droite:`Saison ${score.saison} · super carte ${score.numero} sur 4`,touches:[{ks:['Échap'],t:'Quitter'},{ks:['1'],t:`Effectif de ${esc(d.noms.a)}`},{ks:['2'],t:`Effectif de ${esc(d.noms.b)}`}]});
}
SCREENS.mgmt_duo=mgmtDuoQGHtml;
Object.assign(CL,{
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
  mgmtDuoQuitter(){if(!MGMT_DUO_QG.enCours)CL.mgmtLeave();}
});
keysRegister('mgmt_duo',{Escape(){CL.mgmtDuoQuitter();},'1'(){if(!MGMT_DUO_QG.enCours)CL.go('mgmt_duo_effectif');},'2'(){if(!MGMT_DUO_QG.enCours)CL.go('mgmt_duo_effectif');}});

function mgmtDuoNouvelleHtml(){
  const s=MGMT_DUO_NOUVELLE;
  const titre=s.etape==='noms'?'Duo':`${s.noms[s.etape==='a'?'a':'b']||`Joueur ${s.etape==='a'?1:2}`} · choisis ton organisation`;
  let contenu;
  if(s.etape==='noms'){
    contenu=`<div class="mf-duo-noms"><h2>Deux joueurs, un PC</h2><div class="mf-duo-champs"><label>Joueur 1<input id="mf-duo-nom-a" maxlength="16" value="${esc(s.noms.a)}" onkeydown="if(event.key==='Enter'){event.preventDefault();CL.mgmtDuoNouvelleContinuer()}else if(event.key==='Escape'){event.preventDefault();CL.mgmtDuoNouvelleEchapper()}"></label><label>Joueur 2<input id="mf-duo-nom-b" maxlength="16" value="${esc(s.noms.b)}" onkeydown="if(event.key==='Enter'){event.preventDefault();CL.mgmtDuoNouvelleContinuer()}else if(event.key==='Escape'){event.preventDefault();CL.mgmtDuoNouvelleEchapper()}"></label></div><div class="mf-duo-regles"><p>Chacun son organisation. Vos adjoints jouent les soirées ordinaires.</p><p>Tous les 3 mois, une super carte : six combats, tes combattants contre les siens.</p></div>${mfBouton('Continuer',{touche:'Entrée',jaune:true,onclick:'CL.mgmtDuoNouvelleContinuer()'})}</div>`;
  }else{
    const cartes=MGMT_ORGANISATIONS.map((o,i)=>{
      const prise=s.etape==='b'&&i===s.a;
      const html=mgmtNouvelleOrgHtml(o,i,s.i===i&&!prise).replace(`onclick="CL.mgmtNouvelleChoisir(${i})"`,`onclick="CL.mgmtDuoNouvelleChoisir(${i})"`);
      return `<div class="mf-duo-org ${prise?'mf-duo-prise':''}" ${prise?'aria-disabled="true" tabindex="-1"':''} data-duo-index="${i}">${html}${prise?`<span class="mf-duo-prise-nom">${esc(s.noms.a||'Joueur 1')}</span>`:''}</div>`;
    }).join('');
    contenu=`<div class="mf-nouvelle mf-duo-grille"><div class="mf-org-grille">${cartes}</div>${mgmtNouvelleApercuHtml(MGMT_ORGANISATIONS[s.i])}<div class="mf-duo-pied">${mfBouton(s.etape==='a'?`Choisir ${esc(MGMT_ORGANISATIONS[s.i].nom)}`:'Créer la partie',{touche:'Entrée',jaune:true,onclick:'CL.mgmtDuoNouvelleValider()'})}</div></div>`;
  }
  const ecran=mfEcran(contenu,{barre:'logo',plaque:'Duo',libelle:titre,droite:`Emplacement ${s.slot}`,touches:[{ks:['Échap'],t:'Retour'},{ks:['↑','↓','←','→'],t:'Choisir'},{ks:['Entrée'],t:s.etape==='noms'?'Continuer':'Valider',jaune:true}]});
  return ecran;
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
