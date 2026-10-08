"use strict";
/* ==== [ANCRE: MGMT_FIDELITE_FICHE] — Reprise de fidélité du 07/10/2026 : la Fiche du combattant telle que ses planches (FicheFinal, FicheStyle, FicheCombats,
   FicheContrat, FicheOnEnDit, FicheChampion). Une bannière de 260 px sur le tunnel d'octogones (rouge ; jaune pour un champion) avec son nom, son palmarès et son
   rang ; la rangée des cinq onglets ; puis, selon l'onglet : l'aperçu (ce que tu as vu, la cage, ses chiffres, son prochain combat), le style (la cage et les
   lignes façon / force / faille / inconnu / allonge), les combats (les combats vus, du plus récent au plus ancien), le contrat, ce qu'on en dit.
   Rien de nouveau dans le jeu : tout se lit dans les systèmes existants (mgmtObservation de l'avant-combat, les rejeux d'arène, le contrat, le fil). Les phrases
   écrites ici sont du texte généré : `relu:false`. ==== */

/** Ce que disent les lignes de l'observation (clé de MGMT_AVANT_TEXTES.lignes) : signe, titre de planche, phrase. relu:false */
const MGMT_FICHE_TEXTES={
  relu:false,
  profils:{
    'CONTRE À DISTANCE':'{Il} laisse venir et frappe quand l’autre avance.',
    'FRAPPE ET SORT':'{Il} touche et se dégage avant la réponse.',
    'AVANCE SANS ARRÊT':'{Il} avance sans cesse et use l’autre sous le volume.',
    'AMÈNE AU SOL':'{Il} cherche l’amenée dès que l’occasion se présente.',
    'ÉTOUFFE AU CLINCH':'{Il} colle l’adversaire et le travaille au corps à corps.',
    'SANS SIGNATURE':'Aucun trait ne ressort de ses combats vus.',
    'PAS ENCORE VU':'Tu ne l’as pas encore vu combattre.',
  },
  lignes:{
    initiative:{s:'+',t:'PREND L’INITIATIVE',p:'{Il} lance les échanges et impose le rythme.'},
    attend:{s:'+',t:'TIENT LE CENTRE',p:'{Il} reste au milieu de la cage et attend l’erreur.'},
    loinJuste:{s:'+',t:'FRAPPE JUSTE DE LOIN',p:'{Il} touche de loin, au moment où l’autre s’avance.'},
    loinVide:{s:'−',t:'FRAPPE DANS LE VIDE',p:'De loin, beaucoup de ses coups ne touchent rien.'},
    corps:{s:'+',t:'CHERCHE LE CORPS À CORPS',p:'{Il} colle l’adversaire dès qu’{il} le peut.'},
    amenee:{s:'+',t:'CHERCHE L’AMENÉE',p:'{Il} tente l’amenée au sol à chaque occasion.'},
    controleSol:{s:'+',t:'CONTRÔLE AU SOL',p:'Une fois au sol, {il} garde sa position.'},
    defendAmenee:{s:'+',t:'DÉFEND LES AMENÉES',p:'{Il} reste debout quand on tente de l’amener au sol.'},
    subitSol:{s:'−',t:'PERD SES MOYENS AU SOL',p:'Au sol, {il} se fait dominer.'},
    soumission:{s:'+',t:'CHERCHE LA SOUMISSION',p:'{Il} enchaîne les tentatives de soumission.'},
    vacille:{s:'−',t:'VACILLE QUAND ON LE TOUCHE',p:'Un coup net le fait chanceler.'},
    poidsClinch:{s:'+',t:'IMPOSE SON POIDS',p:'Au clinch, {il} pèse sur l’adversaire.'},
    subitCage:{s:'−',t:'PERD SES MOYENS CONTRE LA CAGE',p:'Pressé contre le grillage, {il} ne trouve plus ses coups.'},
    rien:{s:'',t:'RIEN DE MARQUANT',p:'Rien de net ne ressort de ses combats vus.'},
  },
  inconnus:{
    sol:'AU SOL',cage:'CONTRE LA CAGE',rounds:'SUR LA DISTANCE',style:'SON STYLE',faille:'SA FAILLE',
  },
  inconnuPhrase:'Tu ne l’as jamais vu y combattre.',
  allonge:{max:'La plus grande de la catégorie. Elle l’aide à garder la distance.',haut:'Plus grande que la moyenne de la catégorie.',moy:'Dans la moyenne de la catégorie.',bas:'Plus courte que la moyenne de la catégorie.'},
};
/** La lecture d'un combattant pour la fiche : la même que l'avant-combat de la soirée (tout ce que le joueur a vu, rien de plus). */
function mgmtFicheLecture(m,f){
  if(!m||!f||typeof mgmtObservation!=='function') return {vus:0,n:0,profil:MGMT_AVANT_TEXTES.profils.inconnu,lignes:[],inconnus:[],zones:{}};
  const o=mgmtObservation(m,f.id,Array.isArray(m.hist)?m.hist.length:0,0);
  const L=MGMT_AVANT_TEXTES.lignes, cles=Object.keys(L);
  o.detail=o.lignes.map(txt=>{ const k=cles.find(c=>L[c]===txt); return Object.assign({k:k||'rien',txt},MGMT_FICHE_TEXTES.lignes[k||'rien']); });
  const I=MGMT_AVANT_TEXTES.inconnus, ik=Object.keys(I);
  o.detailInconnus=o.inconnus.map(txt=>{ const k=ik.find(c=>I[c]===txt); return {k:k||'style',txt,t:(MGMT_FICHE_TEXTES.inconnus[k||'style']||'').toUpperCase()}; });
  return o;
}

/* ---- La cage vue du dessus ---------------------------------------------------------------------------------- */

const MGMT_FICHE_PTS=new WeakMap();
/** La position moyenne d'un combattant dans un combat, dans le repère de l'arène (mètres), ou null si le combat ne se rejoue pas à l'identique. */
function mgmtFichePointCombat(t,side){
  let c=MGMT_FICHE_PTS.get(t); if(!c){ c={}; MGMT_FICHE_PTS.set(t,c); }
  if(Object.prototype.hasOwnProperty.call(c,side)) return c[side];
  let p=null;
  try{
    const replay=mgmtFicheRejeu(t);
    if(replay&&areneVerdictFidele(t,replay)){
      const session=areneConstruire(replay,{a:t.a.name,b:t.b.name});
      let sx=0,sy=0,n=0;
      for(let sec=5;sec<=session.dureeCombat;sec+=5){ const e=areneMoment(session,sec); sx+=side==='A'?e.ax:e.bx; sy+=side==='A'?e.ay:e.by; n++; }
      if(n) p={x:sx/n,y:sy/n};
    }
  }catch(e){ p=null; }
  c[side]=p; return p;
}
/** Un octogone régulier de demi-largeur h centré en (cx,cy), en tracé SVG. */
function mgmtFicheOcto(cx,cy,h){
  const k=h*0.2929*2, x0=cx-h, x1=cx+h, y0=cy-h, y1=cy+h;
  return `M${(x0+k).toFixed(2)} ${y0.toFixed(2)}H${(x1-k).toFixed(2)}L${x1.toFixed(2)} ${(y0+k).toFixed(2)}V${(y1-k).toFixed(2)}L${(x1-k).toFixed(2)} ${y1.toFixed(2)}H${(x0+k).toFixed(2)}L${x0.toFixed(2)} ${(y1-k).toFixed(2)}V${(y0+k).toFixed(2)}Z`;
}
/** La carte de la planche : en rouge là où il impose son combat, en hachuré là où il le subit, en numéros ses combats. Pur sur la partie. */
function mgmtFicheCageHtml(m,f,taille){
  const t=taille||330, hist=m&&f?mgmtFightHistory(m,f).slice().reverse().slice(0,4):[];
  let zones=null; try{ zones=mgmtFicheZones(m,f); }catch(e){ zones=null; }
  const total=zones?zones.rings.reduce((a,b)=>a+b,0):0;
  const presence=total?(zones.rings[0]+zones.rings[1])/total:0;
  const ext=118, cx=125, cy=125, int=Math.round(ext*(total?Math.max(0.35,Math.min(0.75,0.3+0.5*presence)):0.45)*10)/10;
  /* « Il le subit » : seulement quand un secteur du bord l'a vu enfermé contre le grillage (la règle de la fiche d'origine). */
  let subit=false;
  if(total){ const bordTotal=zones.rings[2]; subit=zones.pin.some((p,i)=>p.count>=3&&zones.bord[i]>0&&p.count/zones.bord[i]>=0.25&&bordTotal>0&&p.count/bordTotal>=0.05); }
  const pts=hist.map((tr,i)=>{ const p=mgmtFichePointCombat(tr,tr.a.id===f.id?'A':'B'); return p?{n:i+1,x:cx+(p.x/ARENE_RS)*ext*0.9,y:cy+(p.y/ARENE_RS)*ext*0.9}:null; }).filter(Boolean);
  const marques=pts.map(p=>`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="12.7" fill="#E9E6E1" stroke="#0D0B0B" stroke-width="3"/><text x="${p.x.toFixed(1)}" y="${(p.y+6.36).toFixed(2)}" text-anchor="middle" fill="#0D0B0B" style="font-family:'Saira Extra Condensed','Arial Narrow',sans-serif;font-weight:800;font-size:18.7px">${p.n}</text>`).join('');
  const rouge=total?`<path d="${mgmtFicheOcto(cx,cy,int)}" fill="#B32A1E"/>`:'';
  return `<svg class="mf-fi-cage" width="${t}" height="${t}" viewBox="0 0 250 250" fill="none" role="img" aria-label="La cage vue du dessus : en rouge là où {il} impose son combat, en hachuré là où {il} le subit">`
    +`<defs><pattern id="mf-fi-ha" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="9" height="9" fill="#252121"/><rect width="3" height="9" fill="#E9E6E1" fill-opacity="0.55"/></pattern></defs>`
    +`<path d="${mgmtFicheOcto(cx,cy,ext)}" fill="${subit?'url(#mf-fi-ha)':'#252121'}"/>${rouge}`
    +`<path d="${mgmtFicheOcto(cx,cy,ext)}" stroke="#E9E6E1" stroke-width="4"/>${total?`<path d="${mgmtFicheOcto(cx,cy,int)}" stroke="#E9E6E1" stroke-width="2"/>`:''}${marques}</svg>`;
}
function mgmtFicheLegendeHtml(){
  return `<div class="mf-fi-leg"><div><i class="rouge"></i><span>{Il} impose</span></div><div><i class="hache"></i><span>{Il} subit</span></div><div><i class="rond">1</i><span>Ses combats</span></div></div>`;
}

/* ---- Les pièces communes -------------------------------------------------------------------------------------------- */

/** Un panneau de la planche : titre (44 px) avec sa barre rouge, mention à droite, contenu. */
function mgmtFichePanneau(titre,mention,contenu,classe){
  return mfPanneau(`<div class="mf-fi-p"><div class="mf-fi-ph"><div><div class="mf-fi-pt">${esc(titre)}</div><i class="mf-fi-barre"></i></div>${mention?`<span class="mf-fi-pm">${esc(mention)}</span>`:''}</div>${contenu}</div>`,'normal','mf-fi-pan'+(classe?' '+classe:''));
}
function mgmtFicheSigne(s){
  if(s==='+') return '<svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true" style="flex:none"><path d="M13 4v18M4 13h18" stroke="#E9E6E1" stroke-width="4"/></svg>';
  if(s==='−') return '<svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true" style="flex:none"><path d="M4 13h18" stroke="#E23A2B" stroke-width="4"/></svg>';
  return '<span class="mf-fi-sg"></span>';
}
const MGMT_FICHE_CONTRAT_OCTO='M12.6 2.5h14.8l10.1 10.1v14.8L27.4 37.5H12.6L2.5 27.4V12.6z';

/** La bannière : le tunnel (rouge, jaune pour un champion), le nom, le palmarès, le rang. */
function mgmtFicheBanniereHtml(m,f,champion){
  const nom=mfNet(f.last||f.name), prenom=mfNet(f.first||''), sur=mgmtSurnomDe(m,f.id);
  const rang=mgmtRangTexte(m,f);
  const forme=mgmtEffectifForme(m,f);
  const d=divById(f.div), cat=d?String(mgmtDivisionLabel(d)).toUpperCase().split(' '):[];
  return `<div class="mf-fb${champion?' or':''}" data-m="head"><i class="mf-fb-img" aria-hidden="true"></i>`
    +`<div class="mf-fb-nom"><span class="p">${esc(prenom)}${sur?` <em class="s">« ${esc(mfNet(sur))} »</em>`:''}</span><span class="n" style="font-size:${mfCorps(nom,1000,200,90)}px">${esc(nom)}</span></div>`
    +`<div class="mf-fb-pal"><div class="mf-fb-pg"><span class="mf-fb-pl">PALMARÈS</span><b>${esc(f.W)}-${esc(f.L)}-${esc(f.D||0)}</b><div class="mf-fb-forme">${forme.map(mfMarque).join('')}</div></div>`
    +`<div class="mf-fb-pd"><div class="mf-fb-rang${champion?' or':''}">${esc(rang)}</div><div class="mf-fb-cat">${cat.map(x=>`<div>${esc(x)}</div>`).join('')}</div></div></div></div>`;
}

/* ---- Les onglets ---------------------------------------------------------------------------------------------------------- */

/** Aperçu : ce que tu as vu, la cage, ses chiffres, son prochain combat. */
function mgmtFicheApercuHtml(m,f,line){
  const lec=mgmtFicheLecture(m,f), phys=mgmtCombatProfile(f).phys||{}, prochain=mgmtEffectifProchain(m,f), inf=mfSoireeInfos(m);
  const profil=lec.profil, phrase=MGMT_FICHE_TEXTES.profils[profil]||'';
  const lignes=lec.detail.slice(0,3).map(l=>`<div class="mf-fi-lg">${mgmtFicheSigne(l.s)}<div>${esc(l.txt)}</div></div>`).join('');
  const inconnus=lec.detailInconnus.slice(0,3).map(l=>`<div class="mf-fi-lg"><b class="q">?</b><div>${esc(l.txt)}</div></div>`).join('');
  const vus=lec.vus;
  const p1=mgmtFichePanneau('Ce que tu as vu',vus+' combat'+(vus>1?'s':''),
    `<div class="mf-fi-profil">${esc(profil)}</div><div class="mf-fi-lgs">${lignes}</div>`
    +`<div class="mf-fi-bas"><div class="mf-fi-bt">CE QUE TU NE SAIS PAS</div>${inconnus||'<div class="mf-fi-lg"><b class="q">?</b><div>Rien de plus à savoir pour l’instant</div></div>'}</div>`);
  const p2=mgmtFichePanneau('Dans la cage','',`<div class="mf-fi-cagebox">${mgmtFicheCageHtml(m,f,330)}</div>${mgmtFicheLegendeHtml()}`);
  const taille=Number.isFinite(phys.height)?(phys.height/100).toFixed(2).replace('.',',')+' m':'?';
  const allonge=Number.isFinite(phys.reach)?(phys.reach/100).toFixed(2).replace('.',',')+' m':'?';
  const depuis=f.ct&&Number.isFinite(f.ct.since)?(f.ct.since===0?'LE DÉBUT':'SOIRÉE '+f.ct.since):'—';
  const restant=f.libre?'LIBRE':(f.ct?mgmtContratRestants(f)+' COMBAT'+(mgmtContratRestants(f)>1?'S':''):'—');
  const cases=[['Âge',f.age+' ANS'],['Garde',phys.stance==='southpaw'?'GAUCHER':'ORTHODOXE'],['Taille',taille],['Allonge',allonge],['Chez '+mgmtOrgNom(m)+' depuis',depuis],['Contrat restant',restant]];
  const p3=mfPanneau(`<div class="mf-fi-grille">${cases.map(([k,v])=>`<div class="mf-fi-case"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}</div>`,'normal','mf-fi-pan');
  const suite=prochain
    ?`<div class="mf-fi-pc"><div class="mf-fi-pch"><span>PROCHAIN COMBAT</span><span class="mf-fi-pcs"><b class="q">?</b>À confirmer</span></div><div class="mf-fi-pcn">${esc(String(mgmtOrgNom(m)).toUpperCase())} FIGHT NIGHT ${esc((m.eventsPlayed||0)+1)}</div><div class="mf-fi-pcd">${esc((inf.date?inf.date.toLowerCase()+' · ':'')+(prochain.adv?'contre '+prochain.adv:'sur la carte'))}</div></div>`
    :`<div class="mf-fi-pc"><div class="mf-fi-pch"><span>PROCHAIN COMBAT</span></div><div class="mf-fi-pcn">AUCUN COMBAT PRÉVU</div><div class="mf-fi-pcd">{Il} ne figure pas encore sur la carte.</div></div>`;
  const p4=mfPanneau(`${suite}<div class="mf-fi-pcb">${mfBouton('Préparer son combat',{touche:'Entrée',jaune:true,onclick:'CL.mgmtFicheCarte()'})}</div>`,'normal','mf-fi-pan mf-fi-prochain');
  void phrase; void line;
  return `<div class="mf-fi-ligne"><div class="mf-fi-c1">${p1}</div><div class="mf-fi-c1">${p2}</div><div class="mf-fi-c1 mf-fi-col">${p3}${p4}</div></div>`;
}

/** Style : la cage et les lignes façon, force, faille, inconnu, allonge. */
function mgmtFicheStyleHtml(m,f){
  const lec=mgmtFicheLecture(m,f), T=MGMT_FICHE_TEXTES, vu=lec.n?`Vu dans ses ${lec.n} combat${lec.n>1?'s':''}`:'Jamais vu';
  const rows=[];
  rows.push({lab:'FAÇON',signe:'',t:lec.profil,src:lec.n?vu:'',p:T.profils[lec.profil]||''});
  const forces=lec.detail.filter(l=>l.s==='+').slice(0,2), failles=lec.detail.filter(l=>l.s==='−').slice(0,1);
  forces.forEach(l=>rows.push({lab:'FORCE',signe:'+',t:l.t,src:vu,p:l.p}));
  failles.forEach(l=>rows.push({lab:'FAILLE',signe:'−',t:l.t,src:vu,p:l.p}));
  /* Demande d'Anthony du 08/10/2026 : ce que ses anciens combats disent de lui comble ce que le joueur n'a pas vu lui-même. */
  const bilan=mgmtAnciensBilan(m,f);
  if(forces.length<1) bilan.filter(x=>x.s==='+').slice(0,1).forEach(x=>rows.push({lab:'FORCE',signe:'+',t:x.t,src:'D’après son bilan',p:x.p}));
  if(failles.length<1) bilan.filter(x=>x.s==='−').slice(0,1).forEach(x=>rows.push({lab:'FAILLE',signe:'−',t:x.t,src:'D’après son bilan',p:x.p}));
  const xp=typeof mgmtExperience==='function'?mgmtExperience(m,f,m.cycle):null;
  if(xp&&xp.n>0) rows.push({lab:'PROGRESSION',signe:'+',t:xp.points>=1?'+'+Math.round(xp.points)+' points':'En progrès',src:xp.n+' combat'+(xp.n>1?'s':'')+' chez '+mgmtOrgNom(m),p:'Chaque combat joué chez nous fait progresser, d’autant plus vite que l’on est jeune.'});
  lec.detailInconnus.slice(0,1).forEach(l=>rows.push({lab:'INCONNU',signe:'?',t:l.t,src:'Jamais vu',p:T.inconnuPhrase}));
  /* L'allonge, lue sur sa catégorie. */
  const phys=mgmtCombatProfile(f).phys||{}, cat=mgmtEffectifLignes?mgmtEffectifLignes(m,f.div).map(x=>mgmtAllongeCm(x.f)).filter(x=>x>0):[];
  if(Number.isFinite(phys.reach)&&cat.length){
    const moy=cat.reduce((a,b)=>a+b,0)/cat.length, max=Math.max.apply(null,cat);
    const p=phys.reach>=max?T.allonge.max:(phys.reach>moy*1.02?T.allonge.haut:(phys.reach<moy*0.98?T.allonge.bas:T.allonge.moy));
    rows.push({lab:'ALLONGE',signe:'',t:(phys.reach/100).toFixed(2).replace('.',',')+' m',src:'',p});
  }
  const lignes=rows.slice(0,6).map(r=>`<div class="mf-fi-row"><div class="mf-fi-rl">${r.signe==='+'?mgmtFicheSigne('+'):(r.signe==='−'?mgmtFicheSigne('−'):(r.signe==='?'?'<b class="q">?</b>':'<span class="mf-fi-sg"></span>'))}<span>${r.lab}</span></div>`
    +`<div class="mf-fi-rc"><div class="mf-fi-rt"><b>${esc(r.t)}</b><span>${esc(r.src)}</span></div><div class="mf-fi-rp">${esc(r.p)}</div></div></div>`).join('');
  const gauche=mfPanneau(`<div class="mf-fi-p mf-fi-cage-p"><div class="mf-fi-cagebox">${mgmtFicheCageHtml(m,f,330)}</div><div class="mf-fi-legv"><div><i class="rouge"></i><span>Rouge : là où {il} impose son combat</span></div><div><i class="hache"></i><span>Hachuré : là où {il} le subit</span></div><div><i class="rond">1</i><span>Numéros : ses quatre combats</span></div></div></div>`,'normal','mf-fi-pan mf-fi-cage-pan');
  const droite=mfPanneau(`<div class="mf-fi-rows">${lignes}</div>`,'normal','mf-fi-pan mf-fi-fill');
  return `<div class="mf-fi-ligne">${gauche}${droite}</div>`;
}

/** Le palmarès amateur de la fiche : le bilan, les finitions, les débuts, les titres. Rien n'est stocké (mgmtPalmaresAmateur). */
function mgmtFichePalmaresAmateurHtml(m,f){
  const p=mgmtPalmaresAmateur(m,f); if(!p) return '';
  const fin=[p.fin.ko?p.fin.ko+(p.fin.ko>1?' KO':' KO'):'',p.fin.sub?p.fin.sub+(p.fin.sub>1?' soumissions':' soumission'):'',p.fin.dec?p.fin.dec+(p.fin.dec>1?' décisions':' décision'):''].filter(Boolean).join(' · ');
  const titres=p.titres.length?p.titres.map(t=>`<div class="mf-fi-co autres mgmt-fiche-amateur"><strong>${esc(t)}</strong></div>`).join(''):'<div class="mf-fi-co autres mgmt-fiche-amateur"><span>Aucun titre amateur</span></div>';
  return `<div class="mf-fi-cth"><span>SON PALMARÈS AMATEUR</span><span>DÉBUTS À ${esc(p.debuts)} ANS</span></div>`
    +`<div class="mf-fi-co autres mgmt-fiche-amateur"><strong>${esc(p.W)}-${esc(p.L)}</strong><span>Fins de combat : ${esc(fin)}</span></div>${titres}`;
}

/** La trajectoire d'un combattant extérieur (sa trace) : amateur, organisations traversées, professionnel. Rien n'est stocké. */
function mgmtFicheParcoursHtml(trace){
  const duree=o=>{
    if(o.from===null||o.to===null) return '';
    const sem=(o.to-o.from+1)*MGMT_EVENT_WEEKS;
    const span=sem<MGMT_EXT_YEAR_WEEKS?`${Math.max(1,Math.round(sem*12/MGMT_EXT_YEAR_WEEKS))} mois`:`${(sem/MGMT_EXT_YEAR_WEEKS).toFixed(1).replace('.',',')} ans`;
    return ` · ${o.to<0?'Avant l’ouverture':o.from<0?'Avant et depuis l’ouverture':'Depuis l’ouverture'}, environ ${span}`;
  };
  const orgs=trace.orgs.map(o=>`<div class="mf-fi-co autres mgmt-fiche-org"><strong>${o.name?esc(o.name):''}</strong><span>${o.fights?`${esc(o.fights)} ${o.fights===1?'combat':'combats'}`:''}${esc(duree(o))}</span></div>`).join('');
  return `<div class="mf-fi-cth"><span>SA TRAJECTOIRE</span></div>${orgs}<div class="mf-fi-co autres mgmt-fiche-org"><span>Professionnel · ${esc(trace.pro.W)}-${esc(trace.pro.L)}</span></div>`;
}

/** Combats : tous ses combats, du plus récent au plus ancien — ceux joués sous les yeux du joueur (rejouables), puis ceux d'avant la partie (dérivés, mgmt-anciens.js) —
 *  chacun avec ce qu'il dit de lui, une force ou une faille (demande d'Anthony du 08/10/2026 : « remplir chaque case de ses anciens combats »). */
function mgmtFicheCombatsHtml(m,f,line){
  const hist=mgmtFightHistory(m,f).slice().reverse(), curseur=MGMT_FICHE.cursor||0;
  const anciens=mgmtAnciensCombats(m,f), total=hist.length+anciens.length;
  const marque=tag=>tag?`<i class="mf-fi-tag ${tag==='FORCE'?'f':'x'}">${tag}</i>`:'';
  const rows=hist.map((t,k)=>{
    const i=m.hist.indexOf(t), side=t.a.id===f.id?'A':'B', adv=side==='A'?t.b:t.a;
    const issue=t.winner==='D'?'n':(t.winner===side?'v':'d');
    const d=mgmtResultatDetail(m,i);
    const methode=d&&d.methode?d.methode:(MGMT_FAMILY_LABELS[t.family]||t.family);
    const rnd=(t.family==='dec'||t.family==='draw')?'':(d?mgmtRoundTexte(d):'');
    const geste=d&&d.geste?d.geste:'';
    const lec=mgmtCombatLecon(m,f,t);
    return `<div class="mf-fi-co${k===curseur?' choisie':''}" onclick="CL.mgmtHistoriqueRevoir(${i})"><div class="mf-fi-cn">${k+1}</div>`
      +`<div class="mf-fi-ct"><b>${esc(mfNet(adv.name))}</b><span>${esc(methode)}${rnd?', '+esc(rnd):''} · ${esc(mgmtSoireeNomDate(m,t.c))}</span></div>`
      +`<div class="mf-fi-cg">${marque(lec.tag)} ${esc(lec.phrase)}${geste?' <em>Finition : '+esc(geste)+'.</em>':''}</div><div class="mf-fi-cm">${mfMarque(issue)}</div></div>`;
  }).join('');
  const vieux=anciens.map((x,k)=>`<div class="mf-fi-co ancien"><div class="mf-fi-cn">${hist.length+k+1}</div>`
    +`<div class="mf-fi-ct"><b>${esc(mfNet(x.adv))}</b><span>${esc(x.methode)}${x.round?', '+esc(x.round===1?'1er round':x.round+'e round'):''} · à ${esc(x.age)} ans</span></div>`
    +`<div class="mf-fi-cg">${marque(x.tag)} ${esc(x.phrase)}</div><div class="mf-fi-cm">${mfMarque(x.issue)}</div></div>`).join('');
  const parcours=mgmtFichePalmaresAmateurHtml(m,f)+(line&&line.trace?mgmtFicheParcoursHtml(line.trace):'');
  const gauche=mfPanneau(`<div class="mf-fi-p mf-fi-cage-p"><div class="mf-fi-cagebox">${mgmtFicheCageHtml(m,f,330)}</div>${`<div class="mf-fi-legv"><div><i class="rouge"></i><span>Rouge : là où {il} impose son combat</span></div><div><i class="hache"></i><span>Hachuré : là où {il} le subit</span></div><div><i class="rond">1</i><span>Numéros : ses combats vus</span></div></div>`}</div>`,'normal','mf-fi-pan mf-fi-cage-pan');
  const droite=mfPanneau(`<div class="mf-fi-p"><div class="mf-fi-cth"><span>DU PLUS RÉCENT AU PLUS ANCIEN</span><span>${total} COMBAT${total>1?'S':''}</span></div>`
    +`<div class="mf-fi-cos mf-fi-defile">${rows+vieux||'<div class="mf-fi-co autres"><b class="q">?</b><span>Aucun combat professionnel.</span></div>'}${parcours}</div></div>`,'normal','mf-fi-pan mf-fi-fill');
  return `<div class="mf-fi-ligne">${gauche}${droite}</div>`;
}

/** Contrat : le contrat en cours, ses combats, et les six lignes. */
function mgmtFicheContratPlanche(m,f){
  const ct=f.ct, org=mgmtOrgNom(m);
  if(f.libre||!ct){
    const texte=f.libre?'Sans contrat : {il} ne se book plus. {Il} figure au recrutement.':'Pas de contrat suivi pour ce combattant.';
    return `<div class="mf-fi-ligne">${mfPanneau(`<div class="mf-fi-p"><div class="mf-fi-rp" style="font-size:30px">${esc(texte)}</div></div>`,'normal','mf-fi-pan mf-fi-fill')}</div>`;
  }
  const restant=mgmtContratRestants(f), faits=ct.f;
  const cases=Array.from({length:ct.n},(_,i)=>{ const etat=i<faits?'fait':(i===faits?'prochain':'avenir'); return `<div class="mf-fi-cc ${etat}">${i+1}</div>`; }).join('');
  const gauche=mfPanneau(`<div class="mf-fi-p"><div class="mf-fi-ctl">CONTRAT EN COURS</div><div class="mf-fi-ctn"><b>${esc(restant)}</b><span>COMBAT${restant>1?'S':''}<br>RESTANT${restant>1?'S':''}</span></div>`
    +`<div class="mf-fi-bas"><div class="mf-fi-bt">LES ${esc(ct.n)} COMBATS DU CONTRAT</div><div class="mf-fi-ccs">${cases}</div><div class="mf-fi-ccl"><span><i class="fait"></i>Fait</span><span><i class="prochain"></i>Le prochain</span><span><i class="avenir"></i>À venir</span></div></div></div>`,'normal','mf-fi-pan mf-fi-contrat-pan');
  const n=(m.eventsPlayed||0)+1, palier=typeof mgmtContratPalier==='function'?mgmtContratPalier(m,f):0;
  const rows=[
    ['DURÉE',ct.n+' COMBAT'+(ct.n>1?'S':''),`Un contrat se signe pour ${MGMT_CT_MIN} à ${MGMT_CT_MAX} combats.`],
    ['FAIT',faits+' COMBAT'+(faits>1?'S':''),`${faits>1?'Des combats déjà disputés':'Un combat déjà disputé'} sur ce contrat.`],
    ['RESTE',restant+' COMBAT'+(restant>1?'S':''),`Le prochain serait ${org} Fight Night ${n}, s’il est confirmé.`],
    ['BOURSE',mgmtEuros(ct.b),'Fixée à la signature, la même à chaque combat.'],
    ['ARRIVÉE',ct.since===0?'LE DÉBUT':'SOIRÉE '+ct.since,`{Il} combat chez ${org} depuis ce moment.`],
    ['ENSUITE',restant>1?'LE CONTRAT SE POURSUIT':'LIBRE',restant>1?'Le renouvellement se propose dans Contrats.':'Sans nouveau contrat, {il} pourra partir.'],
  ];
  void palier;
  const droite=mfPanneau(`<div class="mf-fi-rows">${rows.map(r=>`<div class="mf-fi-row"><div class="mf-fi-rl"><span class="mf-fi-sg"></span><span>${r[0]}</span></div><div class="mf-fi-rc"><div class="mf-fi-rt"><b>${esc(r[1])}</b></div><div class="mf-fi-rp">${esc(r[2])}</div></div></div>`).join('')}</div>`,'normal','mf-fi-pan mf-fi-fill');
  return `<div class="mf-fi-ligne">${gauche}${droite}</div>`;
}

/** On en dit : la presse, un défi, le public, un combattant, puis ce que la fiche d'origine sait de lui. */
function mgmtFicheOnEnDitHtml(m,f){
  let fil=[]; try{ fil=(typeof mgmtFilListe==='function'?mgmtFilListe(m):[]).filter(x=>x&&(x.a===f.id||x.b===f.id)).slice(0,3); }catch(e){ fil=[]; }
  const rows=fil.map(x=>{
    const lib=(MGMT_FIL_LIBELLES[x.k]||'').toUpperCase(), titre=mgmtFilTitre(m,x), age=mgmtFilAge(m,x);
    const nom=x.k==='presse'?'LA PRESSE':(x.k==='public'?'LES FANS':mfNet(mgmtNomParId(m,x.a).name));
    const citation=x.t?`« ${x.t} »`:titre;
    return `<div class="mf-fi-oc"><div class="mf-fi-ocq"><span>${esc(lib)}</span><b>${esc(nom)}</b></div><div class="mf-fi-oct"><div class="mf-fi-ocp">${esc(citation)}</div><div class="mf-fi-rp">${esc(x.t?titre:age)}</div></div></div>`;
  }).join('');
  const identite=mgmtIdentite(m,f);
  const reste=`<div class="mf-fi-ancien mf-ancien">${mgmtFicheVie(m,f)}${mgmtFichePromesses(m,f)}${mgmtFicheRivaux(m,f)}${mgmtFicheParole(m,f)}${mgmtFicheLien(m,f)}<h3>Son histoire</h3><p>Milieu : ${esc(identite.milieu)}</p><p>Ancien métier : ${esc(identite.metier)}</p></div>`;
  return `<div class="mf-fi-ligne">${mfPanneau(`<div class="mf-fi-p mf-fi-scroll">${rows}${reste}</div>`,'normal','mf-fi-pan mf-fi-fill')}</div>`;
}
/* ==== [FIN ANCRE] ==== */
