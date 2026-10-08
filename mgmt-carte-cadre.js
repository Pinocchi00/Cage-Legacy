"use strict";
/* ==== [ANCRE: MGMT_BRIEF_LOT7B_CARTE_CADRE] — Brief du 06/10/2026, lot 7 : la Carte dans le cadre
   (planche « Management — Booking »). À gauche, les cinq combats de la carte principale — chacun
   « confirmé », « à confirmer » (le combat que le joueur prépare : son premier choix et l'adversaire
   visé) ou « à composer » ; au centre le face-à-face avec les mêmes lignes de comparaison pour les
   deux ; à droite les adversaires de la catégorie. AUCUNE règle de composition ne change : mêmes
   gardes (mgmtSelectable, mgmtBookMain), même geste (premier choix, puis Entrée sur l'adversaire).
   Un combat n'entre sur la carte que par ce geste : aucun combat n'est posé, donc joué, sans que
   le joueur l'ait confirmé. L'état « à confirmer » est une trace de rendu, jamais persistée.
   Contrat restant (lot 9) et enjeux (presse, public — lots 8 et 10) : « — » tant qu'ils n'existent pas. ==== */

const MGMT_CARTE_LIGNES=6;
const MGMT_CARTE_NOMS=['Combat principal','Co-principal','Combat 3','Combat 4','Combat 5'];
const MF_SVG_CONFIRME='<svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true" style="flex:none"><path d="M4 14l6 6L22 6" stroke="#E9E6E1" stroke-width="4"></path></svg>';

/** La catégorie affichée : celle du premier choix, sinon celle choisie avec C, sinon la première où quelqu'un est disponible. */
function mgmtCarteDiv(m){
  const pick=MGMT_CART.pick?mgmtFighterById(m,MGMT_CART.pick):null;
  if(pick) return pick.div;
  const rows=mgmtCartRows(m);
  if(MGMT_CART.div&&rows.some(f=>f.div===MGMT_CART.div)) return MGMT_CART.div;
  const f=rows.find(x=>mgmtSelectable(m,x,null))||rows[0];
  return f?f.div:(allDivisions()[0]||{}).id;
}

/** La liste de droite : la catégorie, sans le premier choix, dans l'ordre du classement. */
function mgmtCarteListe(m){
  const div=mgmtCarteDiv(m);
  return mgmtCartRows(m).filter(f=>f.div===div&&f.id!==MGMT_CART.pick);
}

/** Le libellé court d'une catégorie : « LÉGER », « MOUCHE F ». */
function mgmtCarteCourt(div){ return mfNet(mgmtDivisionLabel(div)).replace(/^POIDS /,'').replace(/ FÉMININ$/,' F'); }

function mgmtCarteLigneComp(a,b,c){ return `<div class="mf-car-comp"><div>${a}</div><span>${esc(c)}</span><div>${b}</div></div>`; }

function mgmtCarteFormeHtml(m,f){
  const l=f?mgmtEffectifForme(m,f):[];
  return l.length?`<div class="mf-eff-forme">${l.map(mfMarque).join('')}</div>`:'<b>—</b>';
}

/** Le contrat restant, tel que l'écran Contrats le donne (corrections du 08/10, 2.1) : le même nombre, jamais écrit en dur. */
function mgmtCarteContratTexte(f){
  if(!f) return '?';
  if(f.libre) return 'LIBRE';
  if(!f.ct) return '—';
  const n=mgmtContratRestants(f);
  return n+' COMBAT'+(n>1?'S':'');
}

function mgmtCarteColonne(m,f){
  if(!f) return {rang:'?',contrat:'?',bilan:'?',allonge:'?',style:'?',forme:'<b>?</b>'};
  const phys=mgmtCombatProfile(f).phys||{};
  return {rang:mgmtRangTexte(m,f),contrat:mgmtCarteContratTexte(f),bilan:`${f.W}-${f.L}-${f.D||0}`,
    allonge:Number.isFinite(phys.reach)?(phys.reach/100).toFixed(2).replace('.',',')+' m':'?',
    style:mfNet(mgmtEffectifFacon(m,f)||'?'),forme:mgmtCarteFormeHtml(m,f)};
}

function mgmtCarteBanniere(a,b,div){
  const nom=f=>f?{p:mfNet(f.first||''),n:mfNet(f.last||f.name)}:{p:'',n:'?'};
  const A=nom(a), B=nom(b);
  return `<div class="mf-car-ban"><div class="mf-car-ban-a"><div class="mf-car-ban-nom"><b style="font-size:${mfCorps(A.n,300,96,40)}px">${esc(A.n)}</b><span>${esc(A.p)}</span></div></div>`
    +`<div class="mf-car-ban-b"><div class="mf-car-ban-nom d"><span>${esc(B.p)}</span><b style="font-size:${mfCorps(B.n,300,96,40)}px">${esc(B.n)}</b></div></div>`
    +`<div class="mf-car-vs">VS</div>`
    +`<div class="mf-car-ban-tag"><div>${esc(mfNet(mgmtDivisionLabel(div)))}</div></div></div>`;
}

function mgmtCarteCombatLigne(m,i,fight,etatMain){
  const nom=MGMT_CARTE_NOMS[i]||('Combat '+(i+1));
  const cur=etatMain.courant===i;
  if(fight){
    const fa=mgmtFighterById(m,fight.a), fb=mgmtFighterById(m,fight.b);
    const titre=fight.title===true;
    return `<div class="mf-car-slot confirme${cur?' choisi':''}"><div class="mf-car-num">${i+1}</div><div class="mf-car-slot-c">`
      +`<div class="mf-car-slot-t"><span>${esc(nom.toUpperCase())}</span><em>${esc(mgmtCarteCourt(fa?fa.div:''))}</em>${(titre||mgmtCanTitle(m,fight))?`<button type="button" class="mf-car-titre${titre?' on':''}" aria-pressed="${titre}" onclick="CL.mgmtTitle(${i},${!titre})">${titre?'TITRE EN JEU':'SANS TITRE'}</button>`:''}</div>`
      +`<div class="mf-car-slot-n"><b>${esc(mfNet(fa?(fa.last||fa.name):'?'))}</b><span>contre</span><b>${esc(mfNet(fb?(fb.last||fb.name):'?'))}</b></div></div>`
      +`<div class="mf-car-slot-s">${MF_SVG_CONFIRME}<button type="button" class="mf-car-retire" aria-label="Retirer ce combat" onclick="CL.mgmtUnbook(${i})">×</button></div></div>`;
  }
  const pre=etatMain.pre===i;
  const pa=pre?mgmtFighterById(m,MGMT_CART.pick):null, pb=pre?etatMain.vise:null;
  if(pre&&pa){
    return `<div class="mf-car-slot apreparer choisi"><div class="mf-car-num">${i+1}</div><div class="mf-car-slot-c">`
      +`<div class="mf-car-slot-t"><span>${esc(nom.toUpperCase())}</span><em>${esc(mgmtCarteCourt(pa.div))}</em></div>`
      +`<div class="mf-car-slot-n"><b>${esc(mfNet(pa.last||pa.name))}</b><span>contre</span><b>${esc(pb?mfNet(pb.last||pb.name):'?')}</b></div></div>`
      +`<div class="mf-car-slot-s"><div class="mf-eff-q" aria-hidden="true">?</div></div></div>`;
  }
  return `<div class="mf-car-slot vide${cur?' choisi':''}"><div class="mf-car-num">${i+1}</div><div class="mf-car-slot-c">`
    +`<div class="mf-car-slot-t"><span>${esc(nom.toUpperCase())}</span></div><div class="mf-car-slot-v">À composer</div></div></div>`;
}

/** Les noms de famille portés par plusieurs combattants de la liste (corrections du 08/10, 2.6) : on y ajoute l'initiale du prénom. */
function mgmtCarteHomonymes(liste){
  const n=new Map();
  for(const f of liste){ const k=mfNet(f.last||f.name); n.set(k,(n.get(k)||0)+1); }
  return new Set([...n].filter(([,c])=>c>1).map(([k])=>k));
}
function mgmtCarteAdvLigne(m,f,i,choisi,homo){
  const sel=mgmtSelectable(m,f,MGMT_CART.pick);
  const raison=!mgmtAvailable(m,f)?'Indisponible':(mgmtEngaged(m,f)?'Sur la carte':'');
  const rg=mgmtRangAffichable(m,f);
  return `<button type="button" class="mf-car-adv${choisi?' choisi':''}${sel?'':' off'}" onclick="CL.mgmtCarteVise('${esc(f.id)}')">`
    +`<span class="mf-car-adv-r">${esc(rg||'—')}</span><span class="mf-car-adv-c"><span class="mf-car-adv-nb"><b style="font-size:${mfCorps(f.last||f.name,200,34,24)}px">${esc(homo&&homo.has(mfNet(f.last||f.name))&&f.first?mfNet(f.first).charAt(0)+'. ':'')}${esc(mfNet(f.last||f.name))}</b>`
    +`<i>${esc(f.W)}-${esc(f.L)}-${esc(f.D||0)}</i></span><span class="mf-car-adv-s">${esc(raison||' ')}</span></span></button>`;
}

function scr_mgmt_carte_cadre(){
  if(!G||!G.mgmt) return scr_mgmt_bureau();
  const m=G.mgmt;
  if(MGMT_CART.pick){ const pf=mgmtFighterById(m,MGMT_CART.pick); if(!pf||!mgmtSelectable(m,pf,null)) MGMT_CART.pick=null; }
  const pickF=MGMT_CART.pick?mgmtFighterById(m,MGMT_CART.pick):null;
  const liste=mgmtCarteListe(m);
  const cur=Math.max(0,Math.min(MGMT_CART.cursor||0,Math.max(0,liste.length-1))); MGMT_CART.cursor=cur;
  const vise=liste[cur]||null;
  const main=Array.isArray(m.card.main)?m.card.main:[];
  const taille=(Number.isSafeInteger(m.card.sizeMain)&&m.card.sizeMain>0)?m.card.sizeMain:MGMT_MAIN_SIZE;
  const plein=main.length>=taille;
  const etat={courant:plein?-1:main.length,pre:(pickF&&!plein)?main.length:-1,vise:(pickF&&vise&&vise.id!==pickF.id)?vise:null};
  const slots=[]; for(let i=0;i<taille;i++) slots.push(mgmtCarteCombatLigne(m,i,main[i]||null,etat));
  const legende=`<div class="mf-car-legende"><span>${MF_SVG_CONFIRME}Confirmé</span><span><i class="mf-eff-q">?</i>À confirmer</span><span>À composer</span></div>`;
  const gauche=mfPanneau(`<div class="mf-car-t">LA CARTE</div><div class="mf-car-slots">${slots.join('')}</div>${legende}`,'normal','mf-car-g');

  /* Le centre : le combat visé, ou le combattant que le curseur désigne. */
  const A=pickF||vise, B=pickF?etat.vise:null;
  const ca=mgmtCarteColonne(m,A), cb=mgmtCarteColonne(m,B);
  const duo=!!(A&&B);
  const rounds=duo?(main.length===0?5:3):'';
  const peutTitre=duo&&typeof mgmtCanTitle==='function'&&mgmtCanTitle(m,{a:A.id,b:B.id});
  const enjeux=[]; if(peutTitre) enjeux.push('Titre possible'); if(rounds) enjeux.push(rounds+' rounds');
  /* Corrections du 08/10, 2.3 et 2.4 : ce que le booking sait de la paire, dit avant la confirmation. */
  if(duo){
    if(typeof mgmtPublicReclame==='function'&&mgmtPublicReclame(m).some(r=>(r.a===A.id&&r.b===B.id)||(r.a===B.id&&r.b===A.id))) enjeux.push('Combat réclamé');
    if(typeof mgmtMemeCamp==='function'&&m.effectifs===1&&mgmtMemeCamp(m,A,B)) enjeux.push('Même camp : les opposer les contrarie');
    if(typeof mgmtFratrie==='function'&&m.effectifs===1&&mgmtFratrie(m,A).includes(B.id)) enjeux.push('Frère et sœur : les opposer les contrarie');
  }
  const comp=duo
    ?mgmtCarteLigneComp(esc(ca.rang),esc(cb.rang),'Classement')+mgmtCarteLigneComp(esc(ca.bilan),esc(cb.bilan),'Palmarès')
      +mgmtCarteLigneComp(esc(ca.allonge),esc(cb.allonge),'Allonge')+mgmtCarteLigneComp(esc(ca.style),esc(cb.style),'Style')
      +mgmtCarteLigneComp(ca.forme,cb.forme,'3 derniers combats')+mgmtCarteLigneComp(`<b>${esc(ca.contrat)}</b>`,`<b>${esc(cb.contrat)}</b>`,'Contrat restant')
    :`<div class="mf-car-aide">${esc(plein?'La carte principale est complète.':(A?'Choisis son adversaire dans la liste.':'Aucun combattant disponible dans cette catégorie.'))}</div>`;
  const faits=duo&&enjeux.length?`<div class="mf-car-enjeux"><div class="mf-cal-lib">Enjeux</div><div>${enjeux.map(e=>`<span>${esc(e)}</span>`).join('')}</div></div>`:'';
  const prop=typeof mgmtPropositionHtml==='function'?mgmtPropositionHtml(m):'';
  const peutConf=pickF&&etat.vise&&mgmtSelectable(m,etat.vise,pickF.id)&&!plein;
  const boutons=`<div class="mf-car-boutons">`
    +(peutConf?mfBouton('Confirmer le combat',{touche:'Entrée',jaune:true,onclick:`CL.mgmtPick('${esc(etat.vise.id)}')`})
      :(!pickF&&vise&&mgmtSelectable(m,vise,null)&&!plein?mfBouton('Choisir ce combattant',{touche:'Entrée',jaune:true,onclick:`CL.mgmtPick('${esc(vise.id)}')`}):''))
    +(pickF&&mgmtAgendaActif(m)?mfBouton('Proposer',{touche:'D',onclick:'CL.mgmtCarteProposer()'}):'')
    +(A?mfBouton('Sa fiche',{touche:'F',onclick:`CL.mgmtCarteFiche()`}):'')+`</div>`;
  const centre=`<div class="mf-car-c">${mgmtCarteBanniere(A,B,A?A.div:mgmtCarteDiv(m))}`
    +mfPanneau(`<div class="mf-car-comp-l">${comp}</div>${prop?`<div class="mf-car-prop mf-ancien">${prop}</div>`:''}${faits}${boutons}`,'normal','mf-car-cmp')+`</div>`;

  /* La droite : les adversaires, six lignes qui suivent le curseur. */
  const debut=Math.min(Math.max(0,cur-MGMT_CARTE_LIGNES+1),Math.max(0,liste.length-MGMT_CARTE_LIGNES));
  const homo=mgmtCarteHomonymes(liste);
  const lignes=liste.slice(debut,debut+MGMT_CARTE_LIGNES).map((f,k)=>mgmtCarteAdvLigne(m,f,debut+k,debut+k===cur,homo)).join('');
  const libres=liste.filter(f=>mgmtSelectable(m,f,MGMT_CART.pick)).length;
  const droite=mfPanneau(`<div class="mf-car-t">${pickF?'ADVERSAIRES':'COMBATTANTS'}</div>`
    +`<div class="mf-car-tri"><span>${libres} libres sur ${liste.length}</span><span>Tri : classement</span></div>`
    +`<div class="mf-car-advs">${lignes||'<div class="mf-eff-aucun">Personne dans cette catégorie.</div>'}</div>`
    +mfBouton('Catégorie : '+mfNet(mgmtDivisionLabel(mgmtCarteDiv(m))),{touche:'C',onclick:'CL.mgmtCarteCategorie(1)',classe:'mf-car-cat'}),'normal','mf-car-d');
  const contenu=`<main class="mf-contenu mf-carte">${gauche}${centre}${droite}</main>`;
  return mfEcran(contenu,{barre:'jeu',courant:'carte',m,plaque:'Carte',libelle:`${main.length} / ${taille}`,tuiles:[main.length,taille],droite:`${mgmtOrgNom(m)} Fight Night ${(m.eventsPlayed||0)+1}`,
    touches:[{ks:['Échap'],t:'Retour',onclick:'CL.mgmtCarteLeave()'},{ks:['↑','↓'],t:'Choisir'},{ks:['A','E'],t:'Section'},{ks:['C'],t:'Catégorie',onclick:'CL.mgmtCarteCategorie(1)'},
      {ks:['F'],t:'Fiche',onclick:'CL.mgmtCarteFiche()'},{ks:['Entrée'],t:pickF?'Confirmer':'Choisir',jaune:true,onclick:'CL.mgmtCarteEntree()'}]});
}
SCREENS.mgmt_carte=scr_mgmt_carte_cadre;

Object.assign(CL,{
  /** Un clic sur la liste : sans premier choix il choisit ; avec un premier choix il VISE (la confirmation se fait au bouton ou à Entrée). */
  mgmtCarteVise(id){
    const m=G.mgmt, f=mgmtFighterById(m,id); if(!f) return;
    if(!MGMT_CART.pick){ CL.mgmtPick(id); return; }
    const i=mgmtCarteListe(m).findIndex(x=>x.id===id); if(i>=0) MGMT_CART.cursor=i;
    render();
  },
  mgmtCarteCategorie(delta){
    const m=G.mgmt; if(MGMT_CART.pick) return;
    const ids=[...new Set(mgmtCartRows(m).map(f=>f.div))]; if(!ids.length) return;
    const i=ids.indexOf(mgmtCarteDiv(m));
    MGMT_CART.div=ids[(i+(delta<0?-1:1)+ids.length)%ids.length]; MGMT_CART.cursor=0; render();
  },
  /** La préparation à la demande : l'assistante propose un adversaire au premier choix posé — le curseur s'y place, le joueur confirme. */
  mgmtCarteProposer(){
    const m=G.mgmt; if(!MGMT_CART.pick||!mgmtAgendaActif(m)) return;
    const o=mgmtAgendaProposer(m,MGMT_CART.pick); if(!o) return;
    const i=mgmtCarteListe(m).findIndex(x=>x.id===o.id); if(i>=0){ MGMT_CART.cursor=i; render(); }
  },
  mgmtCarteFiche(){
    const m=G.mgmt, f=(MGMT_CART.pick&&mgmtFighterById(m,MGMT_CART.pick))||mgmtCarteListe(m)[MGMT_CART.cursor||0];
    if(f) CL.mgmtFicheParIndex(m.roster.indexOf(f));
  },
  mgmtCarteEntree(){
    const m=G.mgmt, l=mgmtCarteListe(m), f=l[MGMT_CART.cursor||0]; if(f) CL.mgmtPick(f.id);
  },
});
keysRegister('mgmt_carte',{
  ArrowUp(){ const n=mgmtCarteListe(G.mgmt).length; if(n){ MGMT_CART.cursor=((MGMT_CART.cursor||0)-1+n)%n; render(); } },
  ArrowDown(){ const n=mgmtCarteListe(G.mgmt).length; if(n){ MGMT_CART.cursor=((MGMT_CART.cursor||0)+1)%n; render(); } },
  Enter(){ CL.mgmtCarteEntree(); },
  c(){ CL.mgmtCarteCategorie(1); },
  C(){ CL.mgmtCarteCategorie(1); },
  d(){ CL.mgmtCarteProposer(); },
  D(){ CL.mgmtCarteProposer(); },
  f(){ CL.mgmtCarteFiche(); },
  F(){ CL.mgmtCarteFiche(); },
  '1'(){ CL.mgmtUnbook(0); },
  '2'(){ CL.mgmtUnbook(1); },
  '3'(){ CL.mgmtUnbook(2); },
  '4'(){ CL.mgmtUnbook(3); },
  '5'(){ CL.mgmtUnbook(4); },
  Escape(){ CL.mgmtCarteLeave(); },
});
/* ==== [FIN ANCRE] ==== */
