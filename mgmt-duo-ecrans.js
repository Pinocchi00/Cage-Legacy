"use strict";
/* ==== [ANCRE: MONDE_LOT_19_T8_CREATION] — Monde lot 19 T8 ==== */
let MGMT_DUO_NOUVELLE={slot:0,etape:'noms',noms:{a:'',b:''},a:null,i:0};
let MGMT_DUO_QG={};

function mgmtDuoNouvelleHtml(){
  const s=MGMT_DUO_NOUVELLE;
  const titre=s.etape==='noms'?'Nouvelle partie à deux':`${s.noms[s.etape==='a'?'a':'b']||`Joueur ${s.etape==='a'?1:2}`} · choisis ton organisation`;
  let contenu;
  if(s.etape==='noms'){
    contenu=`<div class="mf-duo-noms"><h2>Qui joue ?</h2><div class="mf-duo-champs"><label>Joueur 1<input id="mf-duo-nom-a" maxlength="16" value="${esc(s.noms.a)}" onkeydown="if(event.key==='Enter'){event.preventDefault();CL.mgmtDuoNouvelleContinuer()}else if(event.key==='Escape'){event.preventDefault();CL.mgmtDuoNouvelleEchapper()}"></label><label>Joueur 2<input id="mf-duo-nom-b" maxlength="16" value="${esc(s.noms.b)}" onkeydown="if(event.key==='Enter'){event.preventDefault();CL.mgmtDuoNouvelleContinuer()}else if(event.key==='Escape'){event.preventDefault();CL.mgmtDuoNouvelleEchapper()}"></label></div><p>16 caractères au plus. Vide : « Joueur 1 », « Joueur 2 ».</p>${mfBouton('Continuer',{touche:'Entrée',jaune:true,onclick:'CL.mgmtDuoNouvelleContinuer()'})}</div>`;
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
