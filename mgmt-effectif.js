"use strict";
/* ==== [ANCRE: MGMT_BRIEF_LOT6_EFFECTIF] — Brief du 06/10/2026, lot 6 : l'Effectif
   (planches « Effectif — Hommes, poids léger » et « Effectif — Femmes, poids paille »
   du canvas), qui REMPLACE le vestiaire. Les combattants d'une catégorie, hommes ou
   femmes, du champion au dernier classé, et l'aperçu de celui qui est choisi.
   Rien d'une note : le palmarès, les trois derniers résultats, la situation (libre, sur la
   carte, blessé…), et — pour l'aperçu — ce que le joueur a vu de lui. Le contrat arrive
   au lot 9 : sa colonne et sa ligne attendent. Le cercle et les suivis du lot 5 H6 sont
   conservés (ils servent de base à la réservation du lot 7). Tout texte injecté passe
   par esc(). Rien n'est stocké : l'état de l'écran vit en mémoire. ==== */

let MGMT_EFFECTIF={sexe:'H',div:'',curseur:0};
/** Combien de lignes tiennent dans la liste (planche : neuf). */
const MGMT_EFFECTIF_LIGNES=9;

/** Le libellé court d'une catégorie, comme les puces de la planche : « LÉGER », « MI-MOYEN ». */
function mgmtEffectifPuce(d){ return String(d.name).replace(/^Poids /,'').toUpperCase(); }

/** La catégorie affichée : celle de l'état si elle est du bon sexe, sinon la première du sexe qui a des combattants. */
function mgmtEffectifDiv(m){
  const F=MGMT_EFFECTIF;
  const duSexe=allDivisions().filter(d=>d.gender===F.sexe);
  if(F.div&&duSexe.some(d=>d.id===F.div)) return F.div;
  const pref=F.sexe==='F'?'F-straw':'H-light';
  if(duSexe.some(d=>d.id===pref)) return pref;
  return (duSexe[0]||allDivisions()[0]).id;
}

/** Les lignes d'une catégorie, du champion au dernier classé. @returns {Array<{f,rang,champion}>} */
function mgmtEffectifLignes(m,divId){
  const classement=mgmtDivisionRanking(m,divId,'organization');
  const belt=typeof mgmtSplitTitle==='function'?mgmtSplitTitle(m,divId):{id:null};
  const vivants=new Map(m.roster.filter(f=>f.div===divId&&!mgmtIsRetired(f)).map(f=>[f.id,f]));
  const out=[]; let n=0;
  const champion=belt.id&&vivants.get(belt.id);
  if(champion) out.push({f:champion,rang:0,champion:true});
  for(const r of classement){
    const f=vivants.get(r.id);
    if(!f||f===champion) continue;
    out.push({f,rang:++n,champion:false});
  }
  /* Ceux que le classement ne porte pas (jamais classés) viennent après, par nom. */
  const dedans=new Set(out.map(x=>x.f.id));
  for(const f of [...vivants.values()].filter(f=>!dedans.has(f.id)).sort((a,b)=>a.name.localeCompare(b.name,'fr'))) out.push({f,rang:++n,champion:false});
  return out;
}

/** Les trois derniers résultats, du plus ancien au plus récent : 'v', 'd' ou 'n'. */
function mgmtEffectifForme(m,f){
  return mgmtResultatsDetail(m,f).slice(0,3).reverse().map(x=>x.issue==='win'?'v':(x.issue==='loss'?'d':'n'));
}

const MF_SVG_COCHE='<svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true" style="flex:none"><path d="M4 14l6 6L22 6" stroke="#E9E6E1" stroke-width="4"></path></svg>';
const MF_SVG_QUESTION='<div class="mf-eff-q" aria-hidden="true">?</div>';
const MF_SVG_BLESSE='<svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true" style="flex:none"><path d="M13 4v18M4 13h18" stroke="#E23A2B" stroke-width="4" transform="rotate(45 13 13)"></path></svg>';

/** La situation d'un combattant : l'icône, le texte, et si elle est « active ». */
function mgmtEffectifSituation(m,f){
  if(f.libre) return {icone:'<div class="mf-eff-vide"></div>',texte:'Sans contrat',classe:'libre'};
  if(typeof mgmtContratPalier==='function'&&mgmtContratPalier(m,f)>=4) return {icone:MF_SVG_BLESSE,texte:MGMT_CT_PALIERS[4],classe:'blesse'};
  if(!mgmtAvailable(m,f)){
    const sem=Number.isSafeInteger(f.susp)&&f.susp>m.cycle?(f.susp-m.cycle)*MGMT_EVENT_WEEKS:0;
    return {icone:MF_SVG_BLESSE,texte:sem?`Blessé, ${sem} semaine${sem>1?'s':''}`:'Indisponible',classe:'blesse'};
  }
  if(mgmtEngaged(m,f)) return {icone:MF_SVG_COCHE,texte:'Sur la carte',classe:'carte'};
  return {icone:'<div class="mf-eff-vide"></div>',texte:'Libre',classe:'libre'};
}

/** Ce que le joueur sait de la façon de combattre : celle de son profil dès qu'il l'a vu une fois, sinon rien. */
function mgmtEffectifFacon(m,f){
  return m.effectifs===1&&mgmtConnaissance(m,f).combat?mgmtCommentIlCombat(f).style:'';
}

/** Le prochain combat d'un combattant : sur la carte contre qui, ou rien. */
function mgmtEffectifProchain(m,f){
  const cf=typeof mgmtCardFights==='function'?mgmtCardFights(m).find(x=>x.a===f.id||x.b===f.id):null;
  if(!cf) return null;
  const adv=mgmtFighterById(m,cf.a===f.id?cf.b:cf.a);
  return {adv:adv?adv.name:'',slot:cf.slot};
}

function mgmtEffectifLigneHtml(m,x,i,choisi){
  const f=x.f, s=mgmtEffectifSituation(m,f);
  const rang=x.champion?`<div class="mf-eff-c" role="img" aria-label="Champion">C</div>`:`<div class="mf-eff-rang">${esc(x.rang)}</div>`;
  const lien=mgmtLien(m,f.id);
  const nom=mfNet(f.last||f.name), prenom=f.first||'';
  return `<button type="button" class="mf-eff-ligne${choisi?' choisie':''}${lien?' lien':''}" data-id="${esc(f.id)}" onclick="CL.mgmtEffectifChoisir(${i})" ondblclick="CL.mgmtFiche('${esc(f.id)}')">`
    +rang+`<div class="mf-eff-nom"><b>${esc(nom)}</b><span>${esc(prenom)}</span></div>`
    +`<div class="mf-eff-bilan">${esc(f.W)}-${esc(f.L)}-${esc(f.D||0)}</div>`
    +`<div class="mf-eff-forme">${mgmtEffectifForme(m,f).map(mfMarque).join('')}</div>`
    +`<div class="mf-eff-sit ${esc(s.classe)}">${s.icone}<span>${esc(s.texte)}</span></div>`
    +`<div class="mf-eff-contrat">—</div></button>`;
}

function mgmtEffectifApercuHtml(m,x){
  if(!x) return `<div class="mf-eff-apercu-vide">Personne dans cette catégorie.</div>`;
  const f=x.f, prochain=mgmtEffectifProchain(m,f), facon=mgmtEffectifFacon(m,f), phys=mgmtCombatProfile(f).phys||{};
  const nom=mfNet(f.last||f.name), prenom=mfNet(f.first||'');
  const rang=x.champion?'C':'N°'+x.rang;
  const ligne=(k,v)=>`<div class="mf-eff-fiche-l"><span>${esc(k)}</span><b>${esc(v)}</b></div>`;
  const banniere=`<div class="mf-eff-banniere"><div class="mf-eff-b2"><div class="mf-eff-b3"><div class="mf-eff-banniere-nom"><span style="font-size:34px">${esc(prenom)}</span><span style="font-size:${mfCorps(nom,380,92,46)}px">${esc(nom)}</span></div></div></div></div>`;
  const marque=x.champion?`<div class="mf-eff-badge champion" role="img" aria-label="Champion">C</div>`:`<div class="mf-eff-badge">${esc(rang)}</div>`;
  const corps=`<div class="mf-eff-fiche-t"><div><div class="mf-eff-fiche-s">Palmarès</div><div class="mf-eff-fiche-rec">${esc(f.W)}-${esc(f.L)}-${esc(f.D||0)}</div></div>${marque}</div>`
    +`<div class="mf-eff-fiche-ls">${ligne('Façon',facon||'?')}${Number.isFinite(phys.reach)?ligne('Allonge',(phys.reach/100).toFixed(2).replace('.',',')+' m'):''}`
    +ligne('Âge',f.age+' ans')+ligne('Prochain combat',prochain?(prochain.adv?'Contre '+prochain.adv:'Sur la carte'):'—')+`</div>`
    +`<div class="mf-eff-fiche-pied">${mfBouton('Ouvrir sa fiche',{touche:'Entrée',jaune:true,onclick:`CL.mgmtFiche('${esc(f.id)}')`})}</div>`;
  return banniere+mfPanneau(corps,'normal','mf-eff-fiche');
}

function scr_mgmt_effectif(){
  if(!G||!G.mgmt) return scr_mgmt_bureau();
  const m=G.mgmt, F=MGMT_EFFECTIF, div=mgmtEffectifDiv(m);
  F.div=div;
  const lignes=mgmtEffectifLignes(m,div);
  if(F.curseur>=lignes.length) F.curseur=Math.max(0,lignes.length-1);
  if(F.curseur<0) F.curseur=0;
  /* La fenêtre de neuf lignes suit le curseur. */
  const debut=Math.min(Math.max(0,F.curseur-MGMT_EFFECTIF_LIGNES+1),Math.max(0,lignes.length-MGMT_EFFECTIF_LIGNES));
  const fenetre=lignes.slice(debut,debut+MGMT_EFFECTIF_LIGNES);
  const sexe=`<div class="mf-eff-sexe"><button type="button" class="${F.sexe==='H'?'on':''}" onclick="CL.mgmtEffectifSexe('H')">HOMMES</button><button type="button" class="${F.sexe==='F'?'on':''}" onclick="CL.mgmtEffectifSexe('F')">FEMMES</button></div>`;
  const puces=allDivisions().filter(d=>d.gender===F.sexe).map(d=>`<button type="button" class="${d.id===div?'on':''}" aria-pressed="${d.id===div}" onclick="CL.mgmtEffectifDiv('${esc(d.id)}')">${esc(mgmtEffectifPuce(d))}</button>`).join('');
  const entete=['Rang','Combattant','Palmarès','3 derniers','Situation','Contrat'].map((t,k)=>`<div${k===5?' style="text-align:right"':''}>${esc(t)}</div>`).join('');
  const rangees=fenetre.map((x,k)=>mgmtEffectifLigneHtml(m,x,debut+k,debut+k===F.curseur)).join('');
  const ascenseur=lignes.length>MGMT_EFFECTIF_LIGNES
    ?`<div class="mf-eff-asc"><div style="height:${Math.round(100*MGMT_EFFECTIF_LIGNES/lignes.length)}%;margin-top:${Math.round(100*debut/lignes.length)}%"></div></div>`:'';
  const liste=mfPanneau(`<div class="mf-eff-liste"><div class="mf-eff-entete">${entete}</div>${rangees||'<div class="mf-eff-aucun">Personne dans cette catégorie.</div>'}${ascenseur}`
    +`<div class="mf-eff-pied"><span>${esc(fenetre.length)} AFFICHÉS SUR ${esc(lignes.length)}</span><span>TRI : CLASSEMENT</span></div></div>`,'normal','mf-eff-panneau');
  const contenu=`<div class="mf-eff-barre">${sexe}<div class="mf-eff-trait"></div><div class="mf-eff-puces">${puces}</div></div>`
    +`<div class="mf-eff-corps">${liste}<div class="mf-eff-aside">${mgmtEffectifApercuHtml(m,lignes[F.curseur])}</div></div>`;
  const d=divById(div);
  return mfEcran(`<main class="mf-contenu mf-effectif">${contenu}</main>`,
    {barre:'jeu',courant:'effectif',m,plaque:'Effectif',libelle:`${lignes.length} combattants en ${String(d.name).toLowerCase()}`,
      droite:`${mgmtOrgNom(m)} Fight Night ${(m.eventsPlayed||0)+1}`,
      touches:[{ks:['Échap'],t:'Retour',onclick:"CL.go('mgmt_bureau')"},{ks:['↑','↓'],t:'Choisir'},{ks:['G'],t:'Hommes ou femmes',onclick:'CL.mgmtEffectifSexe()'},
        {ks:['Tab'],t:'Catégorie',onclick:'CL.mgmtEffectifCategorie(1)'},{ks:['A','E'],t:'Section'},{ks:['Entrée'],t:'Ouvrir sa fiche',jaune:true,onclick:'CL.mgmtEffectifOuvrir()'}]});
}
SCREENS.mgmt_effectif=scr_mgmt_effectif;

Object.assign(CL,{
  mgmtEffectifChoisir(i){
    const lignes=mgmtEffectifLignes(G.mgmt,mgmtEffectifDiv(G.mgmt));
    MGMT_EFFECTIF.curseur=Math.max(0,Math.min(lignes.length-1,i)); render();
  },
  mgmtEffectifDeplacer(delta){ CL.mgmtEffectifChoisir(MGMT_EFFECTIF.curseur+delta); },
  /** Hommes ou femmes (G) : sans argument, on bascule. */
  mgmtEffectifSexe(sexe){
    const F=MGMT_EFFECTIF;
    F.sexe=sexe==='H'||sexe==='F'?sexe:(F.sexe==='H'?'F':'H'); F.div=''; F.curseur=0; render();
  },
  mgmtEffectifDiv(id){ if(divById(id)){ MGMT_EFFECTIF.sexe=divById(id).gender; MGMT_EFFECTIF.div=id; MGMT_EFFECTIF.curseur=0; render(); } },
  /** Tab : la catégorie suivante du même sexe. */
  mgmtEffectifCategorie(delta){
    const m=G.mgmt, liste=allDivisions().filter(d=>d.gender===MGMT_EFFECTIF.sexe).map(d=>d.id);
    const i=liste.indexOf(mgmtEffectifDiv(m));
    CL.mgmtEffectifDiv(liste[(i+(delta||1)+liste.length)%liste.length]);
  },
  mgmtEffectifOuvrir(){
    const lignes=mgmtEffectifLignes(G.mgmt,mgmtEffectifDiv(G.mgmt)), x=lignes[MGMT_EFFECTIF.curseur];
    if(x) CL.mgmtFiche(x.f.id);
  },
});
keysRegister('mgmt_effectif',{
  ArrowUp(){ CL.mgmtEffectifDeplacer(-1); },
  ArrowDown(){ CL.mgmtEffectifDeplacer(1); },
  g(){ CL.mgmtEffectifSexe(); },
  G(){ CL.mgmtEffectifSexe(); },
  Tab(){ CL.mgmtEffectifCategorie(1); },
  Enter(){ CL.mgmtEffectifOuvrir(); },
  Escape(){ CL.go('mgmt_bureau'); },
});
/* ==== [FIN ANCRE] ==== */
