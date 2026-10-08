"use strict";
/* ==== [ANCRE: MGMT_BRIEF_LOT9_ECRAN_CONTRATS] — Brief du 06/10/2026, lot 9 : les écrans « Contrats » et « Contrats —
   Le recrutement » (planches du canvas), réunis dans une section (R bascule). Sous contrat : chaque combattant avec sa
   catégorie, son rang, ses combats signés et restants, sa situation ; pour un renouvellement, le nombre de combats (1 à 8,
   ← →) et la bourse par combat (+ −), puis « Proposer ce contrat ». Recrutement : les sans-contrat (anciens de la partie,
   débutants, fins de contrat ailleurs) avec âge, palmarès, d'où ils viennent et si le joueur les a déjà vus. Une offre est
   jugée par mgmtContratReponse (le combattant peut refuser) ; la prime de signature est débitée à l'acceptation. La presse
   (« Cage Hebdo en dit ») est d'auteur, lot 10 : absente de la fiche d'offre tant qu'elle n'existe pas. ==== */

let MGMT_CONTRATS={mode:'contrats',sexe:'H',div:'',curseur:0,n:3,b:null,msg:''};
const MGMT_CONTRATS_LIGNES=9;

const MGMT_CT_REFUS_TEXTES={'trop-bas':'Refusé : il demande plus par combat.','trop-grand':'Refusé : il vise plus haut que l’organisation.',
  caisse:'La caisse ne permet pas la prime de signature.',offre:'Offre incomplète.',inconnu:'Introuvable.','sous-contrat':'Il est sous contrat.',inactif:'Pas de contrats avant le calendrier.',carte:'Il est sur la carte : retire-le d’abord.'};

/** Les lignes de l'écran selon le mode : sous contrat (l'effectif) ou sans contrat (le marché). Pur. */
function mgmtContratsLignes(m){
  const F=MGMT_CONTRATS, d=F.div?divById(F.div):null, out=[];
  const garde=div=>{ const dd=divById(div); if(!dd||dd.gender!==F.sexe) return false; return !d||d.id===div; };
  if(F.mode==='contrats'){
    for(const f of m.roster||[]){ if(f.retired||!garde(f.div)) continue; out.push({f,id:f.id,propre:true}); }
    const ordre=allDivisions().map(x=>x.id);
    out.sort((a,b)=>ordre.indexOf(a.f.div)-ordre.indexOf(b.f.div)||(mgmtDivisionRank(m,a.f)||999)-(mgmtDivisionRank(m,b.f)||999)||(a.id<b.id?-1:1));
  }else{
    for(const f of m.roster||[]){ if(f.retired||!f.libre||!garde(f.div)) continue; out.push({f,id:f.id,propre:true,ancien:true}); }
    for(const dd of allDivisions()){
      if(dd.gender!==F.sexe||(d&&d.id!==dd.id)) continue;
      for(const x of mgmtRecrutables(m,dd.id)){
        const ligne=(m.exterieur||[]).find(e=>e.id===x.id); const trace=ligne?mgmtExteriorTrace(ligne,m.cycle):null;
        out.push({f:{id:x.id,name:x.name,first:(trace&&trace.first)||'',last:(trace&&trace.last)||x.name,age:x.age,W:x.W,L:x.L,D:0,div:dd.id},id:x.id,propre:false,
          orig:mgmtContratsOrigine(x,trace),rang:x.rang});
      }
    }
  }
  return out;
}
/** D'où il vient : débutant, ou la dernière organisation dont il sort. */
function mgmtContratsOrigine(x,trace){
  if(trace&&Math.floor(trace.age)<=MGMT_CT_DEBUTANT_AGE&&(trace.pro.W+trace.pro.L)<=MGMT_CT_DEBUTANT_COMBATS) return 'Débute chez les pros';
  return x.derniere?`Fin de contrat chez ${x.derniere}`:'Fin de contrat ailleurs';
}

function mgmtContratsSituation(m,x){
  const f=x.f;
  if(!x.propre) return {texte:x.orig,classe:'libre'};
  if(f.libre) return {texte:'Sans contrat',classe:'blesse'};
  const p=mgmtContratPalier(m,f);
  if(p>=1) return {texte:MGMT_CT_PALIERS[p],classe:p>=3?'blesse':'libre'};
  if(mgmtContratRestants(f)===1) return {texte:'Fin de contrat',classe:'jaune'};
  if(mgmtEngaged(m,f)) return {texte:'Sur la carte',classe:'carte'};
  if(!mgmtAvailable(m,f)) return {texte:'Blessé',classe:'blesse'};
  return {texte:'Libre',classe:'libre'};
}

function mgmtContratsPips(f){
  if(!f.ct) return '<div class="mf-ct-pips"></div>';
  const p=[]; for(let i=0;i<Math.min(8,f.ct.n);i++) p.push(`<i class="${i<f.ct.f?'fait':''}"></i>`);
  return `<div class="mf-ct-pips" aria-hidden="true">${p.join('')}</div>`;
}

function mgmtContratsLigneHtml(m,x,i,choisi){
  const f=x.f, nom=mfNet(f.last||f.name), prenom=mfNet(f.first||''), s=mgmtContratsSituation(m,x);
  const dv=divById(f.div);
  const milieu=MGMT_CONTRATS.mode==='contrats'
    ?`<div class="mf-eff-bilan">${esc(mgmtRangAffichable(m,f)||'—')}</div>${mgmtContratsPips(f)}<div class="mf-ct-reste">${f.ct?esc(mgmtContratRestants(f))+' COMBAT'+(mgmtContratRestants(f)>1?'S':''):'—'}</div>`
    :`<div class="mf-eff-bilan">${esc(Math.floor(f.age))}</div><div class="mf-eff-bilan">${esc(f.W)}-${esc(f.L)}-${esc(f.D||0)}</div><div class="mf-ct-reste">${esc(x.ancien?'DÉJÀ':(mgmtContratsVu(m,f)?'DÉJÀ':'JAMAIS'))}</div>`;
  return `<button type="button" class="mf-ct-ligne${choisi?' choisie':''}" onclick="CL.mgmtContratsVa(${i})">`
    +`<div class="mf-eff-nom"><b>${esc(nom)}</b><span>${esc(prenom)}</span></div><div class="mf-ct-div">${esc(mgmtCarteCourt(f.div))}</div>${milieu}`
    +`<div class="mf-eff-sit ${s.classe}">${esc(s.texte)}</div></button>`;
}
/** Le joueur l'a-t-il déjà vu combattre ? Seulement s'il a combattu pour lui. */
function mgmtContratsVu(m,f){ return (m.hist||[]).some(t=>t.a.id===f.id||t.b.id===f.id); }

function scr_mgmt_contrats(){
  if(!G||!G.mgmt) return scr_mgmt_bureau();
  /* Avant le calendrier du joueur (lot 7), les contrats n'existent pas : l'ancien écran de recrutement reste. */
  if(!mgmtContratsActif(G.mgmt)) return SCREENS.mgmt_recrutement();
  const m=G.mgmt, F=MGMT_CONTRATS, lignes=mgmtContratsLignes(m);
  if(F.curseur>=lignes.length) F.curseur=Math.max(0,lignes.length-1);
  if(F.curseur<0) F.curseur=0;
  const debut=Math.min(Math.max(0,F.curseur-MGMT_CONTRATS_LIGNES+1),Math.max(0,lignes.length-MGMT_CONTRATS_LIGNES));
  const fen=lignes.slice(debut,debut+MGMT_CONTRATS_LIGNES);
  const choisi=lignes[F.curseur]||null;
  const sexe=`<div class="mf-eff-sexe"><button type="button" class="${F.sexe==='H'?'on':''}" onclick="CL.mgmtContratsSexe('H')">HOMMES</button><button type="button" class="${F.sexe==='F'?'on':''}" onclick="CL.mgmtContratsSexe('F')">FEMMES</button></div>`;
  const puces=`<button type="button" class="${F.div===''?'on':''}" onclick="CL.mgmtContratsDiv('')">TOUTES</button>`
    +allDivisions().filter(d=>d.gender===F.sexe).map(d=>`<button type="button" class="${d.id===F.div?'on':''}" onclick="CL.mgmtContratsDiv('${esc(d.id)}')">${esc(mgmtEffectifPuce(d))}</button>`).join('');
  const entete=(F.mode==='contrats'?['Combattant','Catégorie','Rang','Contrat','Reste','Situation']:['Combattant','Catégorie','Âge','Palmarès','Tu l’as vu','D’où il vient']);
  const rangees=fen.map((x,k)=>mgmtContratsLigneHtml(m,x,debut+k,debut+k===F.curseur)).join('');
  const liste=mfPanneau(`<div class="mf-eff-liste"><div class="mf-ct-entete">${entete.map(t=>`<div>${esc(t)}</div>`).join('')}</div>${rangees||'<div class="mf-eff-aucun">Personne dans cette catégorie.</div>'}`
    +`<div class="mf-eff-pied"><span>${esc(fen.length)} AFFICHÉS SUR ${esc(lignes.length)}</span><span>${F.mode==='contrats'?'SOUS CONTRAT':'SANS CONTRAT'}</span></div></div>`,'normal','mf-eff-panneau');
  const contenu=`<div class="mf-eff-barre">${sexe}<div class="mf-eff-trait"></div><div class="mf-eff-puces">${puces}</div></div><div class="mf-eff-corps">${liste}<div class="mf-eff-aside">${mgmtContratsOffreHtml(m,choisi)}</div></div>`;
  return mfEcran(`<main class="mf-contenu mf-effectif">${contenu}</main>`,{barre:'jeu',courant:'contrats',m,plaque:'Contrats',
    onglets:[{t:'Sous contrat',on:F.mode==='contrats',onclick:"CL.mgmtContratsMode('contrats')"},{t:'Recrutement',on:F.mode!=='contrats',onclick:"CL.mgmtContratsMode('recrutement')"}],droite:`${mgmtOrgNom(m)} Fight Night ${(m.eventsPlayed||0)+1}`,
    touches:[{ks:['Échap'],t:'Retour',onclick:"CL.go('mgmt_bureau')"},{ks:['↑','↓'],t:'Choisir'},{ks:['←','→'],t:'Combats'},{ks:['+','−'],t:'Bourse'},
      {ks:['R'],t:'Recrutement',onclick:'CL.mgmtContratsMode()'},{ks:['G'],t:'H ou F',onclick:'CL.mgmtContratsSexe()'},{ks:['Tab'],t:'Catégorie',onclick:'CL.mgmtContratsCategorie(1)'},
      {ks:['L'],t:'Libérer',onclick:'CL.mgmtContratsLiberer()'},{ks:['Entrée'],t:'Proposer',jaune:true,onclick:'CL.mgmtContratsPropose()'}]});
}
SCREENS.mgmt_contrats=scr_mgmt_contrats;

/** Lot 10 : ce qu'on dit de lui — sa parole (dans sa voix) et la ligne de média la plus récente (« Cage Hebdo en dit »). */
function mgmtContratsDitHtml(m,x){
  const f=x.f; let h='';
  const p=x.propre&&typeof mgmtParoleRecente==='function'?mgmtParoleRecente(m,f):null;
  if(p) h+=`<div class="mf-ct-dit"><b>Il dit</b><span>« ${esc(p.texte)} »</span></div>`;
  const l=(m.fil||[]).filter(y=>y.k==='presse'&&y.w==='media'&&y.t&&y.a===f.id).pop();
  const md=l&&typeof mgmtMediaDe==='function'?mgmtMediaDe(l.x):null;
  if(l&&md) h+=`<div class="mf-ct-dit"><b>${esc(md.nom)} en dit</b><span>${esc(l.t)}</span></div>`;
  return h;
}

/** La fiche d'offre : le combattant choisi, ce que le joueur sait de lui, le contrat en cours, l'offre. */
function mgmtContratsOffreHtml(m,x){
  if(!x) return `<div class="mf-eff-apercu-vide">Personne dans cette catégorie.</div>`;
  const F=MGMT_CONTRATS, f=x.f, nom=mfNet(f.last||f.name), prenom=mfNet(f.first||'');
  const ligne=(k,v)=>`<div class="mf-eff-fiche-l"><span>${esc(k)}</span><b>${esc(v)}</b></div>`;
  const ban=`<div class="mf-eff-banniere"><div class="mf-eff-b2"><div class="mf-eff-b3"><div class="mf-eff-banniere-nom"><span style="font-size:34px">${esc(prenom)}</span><span style="font-size:${mfCorps(nom,380,92,46)}px">${esc(nom)}</span></div></div></div></div>`;
  const cible=x.propre?f:mgmtExteriorPourOffre(m,x.id)||f;
  const reno=x.propre&&!!f.ct;
  const demande=mgmtBourseSouhaitee(m,cible,reno), b=Number.isFinite(F.b)?F.b:demande;
  const n=Math.max(MGMT_CT_MIN,Math.min(MGMT_CT_MAX,F.n));
  const pips=[]; for(let i=1;i<=8;i++) pips.push(`<button type="button" class="${i<=n?'on':''}" onclick="CL.mgmtContratsN(${i})">${i}</button>`);
  const actuel=reno?ligne('Contrat en cours',`${mgmtContratRestants(f)} restant${mgmtContratRestants(f)>1?'s':''} · ${mgmtEuros(f.ct.b)} par combat`):'';
  const prime=mgmtContratPrime(n,b);
  /* Corrections du 08/10, lot 8 : au dernier palier il refuse tout combat sauf contre un nom moins connu, et il finit par partir ; le joueur peut aussi le libérer. */
  const palier4=reno&&mgmtContratPalier(m,f)>=4;
  const depart=palier4?ligne('Il refuse tout combat',`sauf contre un nom moins connu · part dans ${Math.max(0,MGMT_CT_ATTENTE[3]+MGMT_CT_DEPART_SOIREES-mgmtContratAttente(m,f))} soirée${MGMT_CT_ATTENTE[3]+MGMT_CT_DEPART_SOIREES-mgmtContratAttente(m,f)>1?'s':''}`):'';
  const libere=reno?mfBouton('Libérer · '+mgmtEuros(mgmtContratIndemnite(f)),{touche:'L',onclick:'CL.mgmtContratsLiberer()'}):'';
  const corps=`<div class="mf-ct-offre"><div class="mf-eff-fiche-s">TON OFFRE</div>`
    +actuel+depart
    +ligne('Nombre de combats',n+' COMBAT'+(n>1?'S':''))+`<div class="mf-ct-n">${pips.join('')}</div>`
    +ligne('Il demande, par combat',mgmtEuros(demande))+ligne('Tu proposes, par combat',mgmtEuros(b))+ligne('Prime de signature',mgmtEuros(prime))
    +mgmtContratsDitHtml(m,x)
    +(F.msg?`<div class="mf-ct-msg">${esc(F.msg)}</div>`:'')+`</div>`
    +`<div class="mf-eff-fiche-pied">${libere}${mfBouton(reno?'Proposer ce contrat':(x.propre?'Reprendre':'Proposer ce contrat'),{touche:'Entrée',jaune:true,onclick:'CL.mgmtContratsPropose()'})}</div>`;
  return ban+mfPanneau(corps,'normal','mf-eff-fiche mf-ct-fiche');
}

function mgmtContratsClamp(){ const m=G.mgmt, F=MGMT_CONTRATS, l=mgmtContratsLignes(m); F.curseur=Math.max(0,Math.min(F.curseur,l.length-1)); return l; }
Object.assign(CL,{
  mgmtContratsVa(i){ if(Number.isSafeInteger(i)&&i>=0){ MGMT_CONTRATS.curseur=i; MGMT_CONTRATS.b=null; MGMT_CONTRATS.msg=''; render(); } },
  mgmtContratsBouge(d){ const n=mgmtContratsLignes(G.mgmt).length; if(!n) return; MGMT_CONTRATS.curseur=((MGMT_CONTRATS.curseur||0)+d+n)%n; MGMT_CONTRATS.b=null; MGMT_CONTRATS.msg=''; render(); },
  mgmtContratsN(n){ if(Number.isSafeInteger(n)&&n>=MGMT_CT_MIN&&n<=MGMT_CT_MAX){ MGMT_CONTRATS.n=n; MGMT_CONTRATS.msg=''; render(); } },
  mgmtContratsNBouge(d){ CL.mgmtContratsN(Math.max(MGMT_CT_MIN,Math.min(MGMT_CT_MAX,MGMT_CONTRATS.n+d))); },
  mgmtContratsBourse(d){
    const m=G.mgmt, l=mgmtContratsLignes(m), x=l[MGMT_CONTRATS.curseur]; if(!x) return;
    const cible=x.propre?x.f:(mgmtExteriorPourOffre(m,x.id)||x.f), dem=mgmtBourseSouhaitee(m,cible,x.propre&&!!x.f.ct);
    MGMT_CONTRATS.b=Math.max(1,(Number.isFinite(MGMT_CONTRATS.b)?MGMT_CONTRATS.b:dem)+d); MGMT_CONTRATS.msg=''; render();
  },
  mgmtContratsMode(x){ const veut=(x==='contrats'||x==='recrutement')?x:(MGMT_CONTRATS.mode==='contrats'?'recrutement':'contrats'); if(veut===MGMT_CONTRATS.mode&&x) return; MGMT_CONTRATS.mode=veut; MGMT_CONTRATS.curseur=0; MGMT_CONTRATS.b=null; MGMT_CONTRATS.msg=''; render(); },
  mgmtContratsSexe(s){ MGMT_CONTRATS.sexe=(s==='H'||s==='F')?s:(MGMT_CONTRATS.sexe==='H'?'F':'H'); MGMT_CONTRATS.div=''; MGMT_CONTRATS.curseur=0; MGMT_CONTRATS.msg=''; render(); },
  mgmtContratsDiv(id){ if(id===''||divById(id)){ if(id) MGMT_CONTRATS.sexe=divById(id).gender; MGMT_CONTRATS.div=id; MGMT_CONTRATS.curseur=0; MGMT_CONTRATS.msg=''; render(); } },
  mgmtContratsCategorie(delta){
    const ids=['',...allDivisions().filter(d=>d.gender===MGMT_CONTRATS.sexe).map(d=>d.id)], i=ids.indexOf(MGMT_CONTRATS.div);
    CL.mgmtContratsDiv(ids[(i+(delta<0?-1:1)+ids.length)%ids.length]);
  },
  /** L : libérer le combattant choisi en lui payant le reste de son contrat. */
  mgmtContratsLiberer(){
    const m=G.mgmt, F=MGMT_CONTRATS, x=mgmtContratsLignes(m)[F.curseur]; if(!x||!x.propre||!x.f.ct) return;
    const r=mgmtContratLiberer(m,x.id);
    F.msg=r.ok?`Libéré : ${mgmtEuros(r.indemnite)} versés pour le reste de son contrat.`:(MGMT_CT_REFUS_TEXTES[r.raison]||'Refusé.');
    if(r.ok){ saveMgmt(); F.b=null; }
    render();
  },
  /** Entrée : renouveler (sous contrat), reprendre un ancien ou signer un combattant du marché. */
  mgmtContratsPropose(){
    const m=G.mgmt, F=MGMT_CONTRATS, l=mgmtContratsLignes(m), x=l[F.curseur]; if(!x) return;
    const cible=x.propre?x.f:(mgmtExteriorPourOffre(m,x.id)||x.f);
    const reno=x.propre&&!!x.f.ct, b=Number.isFinite(F.b)?F.b:mgmtBourseSouhaitee(m,cible,reno);
    const r=reno?mgmtContratRenouveler(m,x.id,F.n,b):mgmtContratSigner(m,x.id,F.n,b);
    F.msg=r.ok?`Signé : ${F.n} combat${F.n>1?'s':''}, prime de ${mgmtEuros(r.prime)}.`:(MGMT_CT_REFUS_TEXTES[r.raison]||'Refusé.');
    if(r.ok){ saveMgmt(); F.b=null; }
    render();
  },
});
keysRegister('mgmt_contrats',{
  ArrowUp(){ CL.mgmtContratsBouge(-1); },
  ArrowDown(){ CL.mgmtContratsBouge(1); },
  ArrowLeft(){ CL.mgmtContratsNBouge(-1); },
  ArrowRight(){ CL.mgmtContratsNBouge(1); },
  '+'(){ CL.mgmtContratsBourse(1); },
  '-'(){ CL.mgmtContratsBourse(-1); },
  r(){ CL.mgmtContratsMode(); },
  R(){ CL.mgmtContratsMode(); },
  g(){ CL.mgmtContratsSexe(); },
  G(){ CL.mgmtContratsSexe(); },
  Tab(){ CL.mgmtContratsCategorie(1); },
  l(){ CL.mgmtContratsLiberer(); },
  L(){ CL.mgmtContratsLiberer(); },
  Enter(){ CL.mgmtContratsPropose(); },
  Escape(){ CL.go('mgmt_bureau'); },
});
/* ==== [FIN ANCRE] ==== */
