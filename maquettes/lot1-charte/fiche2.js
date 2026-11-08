"use strict";
/* Maquette lot 1 — fiche du combattant, retours du 07/11 : bannière (flèches à part, accents), Statistiques (points vert / jaune / rouge),
   Combats et Contrat refaits, « On en dit » devient Échos, « Lui et Split » devient Relation, case Style de combat dans l'Aperçu.
   Chargé après fiche.js : ses fonctions remplacent celles du même nom. */

ONGLETS.splice(0,ONGLETS.length,'Aperçu','Statistiques','Combats','Contrat','Échos','Relation');
if(!ONGLETS.includes(S.onglet))S.onglet='Aperçu';
S.echosVus=new Set();
/* Un combattant a du nouveau dans ses échos tant que tu ne les as pas ouverts. */
/* Soirées cohérentes avec son histoire : la ceinture et la défense se sont jouées chez Split. */
/* Combats pour le titre et combats principaux en 5 rounds : une décision s'y rend au 5e round. */
(function(){const h=historique(parId('nana'));[0,2].forEach(k=>Object.assign(h[k],{rd:5,tps:'5:00'}));Object.assign(h[0],{soiree:'Split Fight Night 62'});Object.assign(h[1],{soiree:'Split Fight Night 59'});Object.assign(h[2],{soiree:'Split Fight Night 56'});})();
/* Mezouar a battu Nana par soumission en 2025 : le combat figure aussi dans son historique, à la même date. */
(function(){const hn=historique(parId('nana')),hm=historique(parId('mezouar')),f=hn[3];
  let i=hm.findIndex(x=>x.date<=f.date);if(i<2)i=2;
  Object.assign(hm[i],{adv:'Parfait Nana',res:'v',meth:['Soumission','étranglement arrière'],rd:2,tps:'3:40',date:new Date(f.date),soiree:f.soiree,advR:4});
  hm.forEach((x,k)=>{if(k!==i&&x.soiree===f.soiree)x.soiree='Split Fight Night 54';});})();
const ECHOS_NOUVEAUX=new Set(['nana','mezouar','rizzo']);
const echosNouveau=c=>ECHOS_NOUVEAUX.has(c.id)&&!S.echosVus.has(c.id);

/* ---- Bannière : les flèches ont leur bande à elles, le contenu ne passe jamais dessous ---- */
const accentHaut=t=>/[ÀÂÄÉÈÊËÎÏÔÖÙÛÜ]/.test(t.toUpperCase());
function banniere(c){
  const champ=c.rang==='C';
  return `<div class="ban-contenu" id="banC"><i class="fb-img ${champ?'or':''}"></i>
    <div class="fb-nom ${accentHaut(c.nom)?'accent':''}"><span style="font-size:64px">${esc(c.prenom)}${c.surnom?`<em class="s">« ${esc(c.surnom)} »</em>`:''}</span><span style="font-size:${c.nom.length>8?150:200}px">${esc(c.nom)}</span></div>
    <div class="fb-pal"><div style="display:flex;flex-direction:column;gap:14px"><span style="font-weight:600;font-size:22px;letter-spacing:.04em;color:var(--texte2)">PALMARÈS</span>
      <b class="T" style="font-size:116px;line-height:.69">${bilan(c)}</b><div style="margin-top:4px">${serie(c.serie)}</div></div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:14px">
        ${champ?'<span class="rang-c octr"><span class="octr"><b class="octr">C</b></span></span>':`<span class="marque octr" style="width:84px;height:84px;font-size:46px;background:var(--blanc)">${esc(c.rang)}</span>`}
        <span class="T" style="font-size:30px;text-align:center;line-height:1.1">${esc(c.cat).replace(' ','<br>')}</span></div></div>
  </div>
  <button class="fl-nav g" data-fnav="-1" title="Combattant précédent">${ico('retour',30,3)}</button><button class="fl-nav d" data-fnav="1" title="Combattant suivant">${ico('avant',30,3)}</button>`;
}

function ficheHtml(c){
  if(S.onglet==='Échos')S.echosVus.add(c.id);
  const vues={'Aperçu':apercu,'Statistiques':statsHtml,'Combats':combatsHtml,'Contrat':contratHtml,'Échos':echos,'Relation':relation};
  return `<div class="banniere" id="ban" style="height:260px">${banniere(c)}</div>
    <div style="display:flex;align-items:center;gap:12px;margin:18px 0">${ONGLETS.map(o=>`<button class="onglet oct ${S.onglet===o?'ouvert':''}" data-onglet="${o}">${o}${o==='Échos'&&echosNouveau(c)?'<span class="onglet-mq octr"></span>':''}</button>`).join('')}
      <span style="margin-left:auto"></span>
      <button class="bb oct ${S.panCat?'on':''}" data-cat title="Effectif de la catégorie" aria-label="Ouvrir l’effectif de la catégorie"><span class="oct" style="padding:0 16px;gap:10px">${ico('effectif',30)}<svg width="16" height="26" viewBox="0 0 16 26" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="M3 9l5-5 5 5M3 17l5 5 5-5"/></svg></span></button>
      <button class="bb oct" title="Suivre ce combattant"><span class="oct">Suivre</span></button></div>
    ${S.panCat?panneauCat(c):''}
    <div class="apparait" style="height:calc(100% - 352px)">${vues[S.onglet](c)}</div>`;
}

/* ---- Style de combat : comment il combat, comment il gagne, ce qui le rend à part ---- */
const STYLES={
  'Boxe':['Debout, garde haute, il cherche l’échange au centre de la cage.','Aux poings : sur un enchaînement, ou aux points quand l’autre refuse l’échange.','Il coupe la cage mieux que la plupart des boxeurs de sa catégorie.'],
  'Lutte':['Il ferme la distance, colle l’adversaire au grillage et l’amène au sol.','Au contrôle : il gagne les rounds au sol, rarement avant la limite.','Son cardio : le même rythme du premier au dernier round.'],
  'Kickboxing':['Il travaille de loin, avec beaucoup de coups de pied au corps et aux jambes.','À l’usure, puis par KO quand la garde de l’autre commence à baisser.','Il change de garde en plein échange, ce qui dérègle ses adversaires.'],
  'Jiu-jitsu brésilien':['Il cherche le sol à tout prix, quitte à tirer l’adversaire dans sa garde.','Par soumission : étranglements et clés de bras.','Aussi dangereux sur le dos que par-dessus.'],
  'Karaté':['Il reste loin, de profil, et entre et sort de la distance très vite.','Sur un contre : un coup de pied ou un direct que l’autre ne voit pas partir.','Presque impossible à toucher proprement.'],
  'Muay-thaï':['Il cherche le corps-à-corps debout pour placer genoux et coudes.','Par arrêt : coupures, genoux au corps.','Le clinch : c’est là que les autres le craignent le plus.'],
  'Sambo':['Il projette debout, puis enchaîne au sol sans laisser respirer.','Par soumission, souvent sur une clé de jambe.','Ses projections partent de nulle part.'],
  'Judo':['Il attend le contact pour projeter, puis contrôle au sol.','Aux points, en gagnant chaque phase au corps-à-corps.','Presque personne ne le fait tomber.'],
};
const STYLES_PROPRES={
  nana:['Il avance sans arrêt, enferme l’autre contre le grillage et accepte d’en prendre pour placer ses crochets.','Au troisième round : il use l’autre, puis il le finit ou gagne aux points.','Peu de boxeurs frappent aussi fort au corps : c’est ce qui casse les autres.'],
  mezouar:['Il amène au sol dès le premier échange et passe la garde en force.','Par soumission, surtout l’étranglement arrière.','Il a soumis Parfait Nana, ce que personne d’autre n’a réussi.'],
};
/* L'art martial écrit simplement (la spécialité reste dans l'Effectif, au clic). */
const artCourt=a=>({'Jiu-jitsu brésilien':'Jiu-jitsu'})[a]||a||'Boxe';
/* Style de combat (refait le 08/11, sans octogone) : où se passe le combat, ses armes, puis comment il combat et gagne. */
const ZONES={'Boxe':[55,35,10],'Lutte':[20,35,45],'Kickboxing':[65,25,10],'Jiu-jitsu brésilien':[20,25,55],'Karaté':[70,20,10],'Muay-thaï':[40,50,10],'Sambo':[25,35,40],'Judo':[20,45,35]};
const ZONES_PROPRES={nana:[30,60,10],mezouar:[20,25,55]};
const ARMES={'Boxe':['Crochets','Jab','Coups au corps'],'Lutte':['Double jambe','Contrôle au sol','Coups au sol'],'Kickboxing':['Low kick','Coup de pied au corps','Direct'],
  'Jiu-jitsu brésilien':['Étranglement arrière','Triangle','Passage de garde'],'Karaté':['Contre','Coup de pied circulaire','Déplacements'],'Muay-thaï':['Genoux','Coudes','Clinch'],
  'Sambo':['Projections','Clé de jambe','Contrôle'],'Judo':['Projections','Contrôle au sol','Clinch']};
const ARMES_PROPRES={nana:['Crochet du droit','Coups au corps','Pression contre le grillage'],mezouar:['Double jambe','Étranglement arrière','Passage de garde']};
/* Parcours avant le MMA : spécialité, amateur, autre sport, ceinture ou titre. */
const BG={nana:[['Spécialité','Boxe anglaise'],['Amateur','12-3, champion de France 2017'],['Autre sport','Boxe thaï'],['Titre','Champion des poids légers Split']],
  mezouar:[['Spécialité','Jiu-jitsu brésilien'],['Amateur','8-0, huit finitions'],['Autre sport','Lutte gréco-romaine'],['Ceinture','Noire de jiu-jitsu, vice-champion d’Europe']]};
const BG_ART={'Boxe':['Boxe anglaise','Kickboxing'],'Lutte':['Lutte libre','Judo'],'Kickboxing':['Kickboxing','Boxe anglaise'],'Jiu-jitsu brésilien':['Jiu-jitsu brésilien','Lutte'],
  'Karaté':['Karaté','Taekwondo'],'Muay-thaï':['Muay-thaï','Boxe anglaise'],'Sambo':['Sambo','Judo'],'Judo':['Judo','Lutte']};
function bgDe(c){if(BG[c.id])return BG[c.id];const a=BG_ART[c.art]||BG_ART['Boxe'],r=graine('bg'+c.id);
  return [['Spécialité',a[0]],['Amateur',`${6+Math.floor(r()*8)}-${Math.floor(r()*3)}`],['Autre sport',a[1]],[/Jiu|Judo|Karaté/.test(a[0])?'Ceinture':'Titre',/Jiu/.test(a[0])?'Ceinture noire':/Judo|Karaté/.test(a[0])?'Ceinture noire, 2e dan':'Champion régional amateur']];}
/* Chiffres tirés de ses combats : temps dans la cage, plus longue série, finitions au 1er round, KO subis, primes. */
function chiffresDe(c){
  const h=historique(c),sec=f=>(f.rd-1)*300+(+f.tps.split(':')[0])*60+(+f.tps.split(':')[1]);
  const tot=h.reduce((t,f)=>t+sec(f),0),hh=Math.floor(tot/3600),mm=Math.round(tot%3600/60);
  let best=0,cur=0;[...h].reverse().forEach(f=>{cur=f.res==='v'?cur+1:0;best=Math.max(best,cur);});
  const r1=h.filter(f=>f.res==='v'&&f.rd===1&&finDe(f)[0]!=='Décision').length;
  const ko=h.filter(f=>f.res==='d'&&!['Décision','Soumission'].includes(finDe(f)[0])).length;
  return [['Temps dans la cage',`${hh} h ${String(mm).padStart(2,'0')}`],['Plus longue série',`${best} V`],['KO subis',ko],['Primes de soirée',perfDe(c,[]).length]];
}
/* Spécialité précise dans son art martial (à droite du titre Style). */
const SPECIALITES={
  'Boxe':['Boxe anglaise','Boxe de puissance','Boxe en contre','Boxe de pression','Boxe à distance','Boxe au corps'],
  'Kickboxing':['Kickboxing','Boxe française','Kickboxing à distance','Low-kicks','Kickboxing japonais'],
  'Muay-thaï':['Boxe thaï','Boxe thaï au clinch','Boxe thaï, genoux et coudes'],
  'Lutte':['Lutte libre','Lutte gréco-romaine','Lutte de contrôle','Lutte contre le grillage','Lutte et frappe au sol'],
  'Jiu-jitsu brésilien':['Jiu-jitsu, jeu de garde','Jiu-jitsu, jeu du dessus','Jiu-jitsu, clés de jambe','Jiu-jitsu, étranglements'],
  'Karaté':['Karaté Shotokan','Karaté Kyokushin','Karaté en contre'],
  'Sambo':['Sambo de combat','Sambo sportif'],
  'Judo':['Judo, projections','Judo, contrôle au sol']};
const SPEC_PROPRES={nana:'Boxe de puissance',mezouar:'Jiu-jitsu, jeu du dessus'};
const specialiteDe=c=>{if(SPEC_PROPRES[c.id])return SPEC_PROPRES[c.id];const l=SPECIALITES[c.art]||SPECIALITES['Boxe'];return l[Math.floor(graine('sp'+c.id)()*l.length)];};
function styleCombat(c){
  const t=STYLES_PROPRES[c.id]||STYLES[c.art]||STYLES['Boxe'],z=ZONES_PROPRES[c.id]||ZONES[c.art]||ZONES['Boxe'],a=ARMES_PROPRES[c.id]||ARMES[c.art]||ARMES['Boxe'];
  const ZN=['À distance','Au corps-à-corps','Au sol'],fort=z.indexOf(Math.max(...z));
  /* Profil en 4 cases (finitions, profil, rythme, défense), zones, niveaux en 5 crans, puis son plan. */
  const h=historique(c),V=h.filter(f=>f.res==='v'),fin=V.filter(f=>finDe(f)[0]!=='Décision').length,ko=h.filter(f=>f.res==='d'&&finDe(f)[0]!=='Décision'&&finDe(f)[0]!=='Soumission').length;
  const prof=z[2]>=45?'Grappler':z[1]>=50?'Cogneur':z[0]>=55?'Frappeur':'Complet';
  const ry={nana:'Diesel',mezouar:'Explosif'}[c.id]||(V.filter(f=>f.rd===1).length*2>V.length?'Explosif':'Régulier');
  const def=ko>=3?'Fragile':ko>=1?'Solide':'Forteresse';
  const NIV={nana:[4,2,2],mezouar:[3,4,5]}[c.id]||(prof==='Grappler'?[2,4,4]:prof==='Frappeur'?[4,2,2]:[3,3,3]);
  const tu=(l,v)=>`<div class="sc-tu oct"><div class="sous">${l}</div><div class="T">${v}</div></div>`;
  /* Niveaux dits en un mot, sans cran : on devine le combattant sans lire son potentiel. */
  const MOT=n=>n>=4?['Sa force','f']:n<=2?['Son point faible','p']:['Il se défend','m'];
  return pan(titre('Style',esc(specialiteDe(c)))+`
    <div class="sc-tus">${tu('Finitions',Math.round(fin/(V.length||1)*100)+' %')}${tu('Profil',prof)}${tu('Rythme',ry)}${tu('Défense',def)}</div>
    <div class="sc-st">Zones</div>
    <div class="sc-bar">${z.map((v,i)=>`<i class="z${i} ${i===fort?'on':''}" style="flex:${v}"></i>`).join('')}</div>
    <div class="sc-z">${z.map((v,i)=>`<div class="sc-zc ${i===fort?'on':''}"><i class="z${i}"></i><b class="T">${v} %</b><span>${ZN[i]}</span></div>`).join('')}</div>
    <div class="sc-ch">${chiffresDe(c).map(([l,v])=>`<div><span class="etiq">${l}</span><b class="T">${v}</b></div>`).join('')}</div>`,'height:100%');
}

const ORIGINES={nana:['Lyon','France'],mezouar:['Marseille','France']};
const VILLES=[['Lyon','France'],['Bordeaux','France'],['Liège','Belgique'],['Genève','Suisse'],['Casablanca','Maroc'],['Lisbonne','Portugal'],['Tbilissi','Géorgie'],['Dakar','Sénégal'],['Lille','France'],['Montréal','Canada']];
const origineDe=c=>ORIGINES[c.id]||VILLES[Math.floor(graine('o'+c.id)()*VILLES.length)];
function apercu(c){
  const h=historique(c).slice(0,5);
  const traits=c.traits||[['+','Régulier','Jamais deux défaites de suite','Il revient toujours plus fort après un revers.']];
  const fait=(l,v)=>`<div class="oct" style="--c:8px;background:var(--ligne);padding:10px 14px;min-width:0"><div class="sous">${l}</div><div class="T" style="font-size:30px;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${v}</div></div>`;
  return `<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,1.45fr);gap:20px;height:100%">
    ${pan(titre('Ses traits')+traits.map(([s,n,d,t])=>`<div class="oct" style="--c:10px;background:var(--ligne);padding:12px 16px;display:flex;gap:16px;align-items:center;margin-bottom:10px">
        <span class="octr tr-sg ${s==='+'?'plus':'moins'}"><i></i>${s==='+'?'<i class="v"></i>':''}</span>
        <div style="flex:1;min-width:0"><span class="T" style="font-size:32px">${n}</span><div style="font-size:21px">${t}</div><div class="sous" style="font-size:18px">${d}</div></div></div>`).join('')
      +`<div class="etiq" style="margin:12px 0 2px">Derniers combats</div><div class="defile">${h.map(f=>`<div style="display:flex;gap:12px;align-items:center;padding:6px 0;border-bottom:2px solid var(--sep)">
        <span class="marque octr ${f.res}" style="width:28px;height:28px;font-size:20px">${f.res.toUpperCase()}</span>
        <span style="flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:21px">${f.res==='v'?'bat':'battu par'} ${advHtml(f,c)} <span class="sous">· ${methCourte(f)} R${f.rd}</span></span>
        <span class="sous" style="white-space:nowrap">${dMois(f.date)}</span></div>`).join('')}</div>`,'height:100%')}
    ${styleCombat(c)}
    <div style="display:flex;flex-direction:column;gap:18px;min-height:0">
      ${pan(`<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px">${fait('Âge',c.age+' ans')}${fait('Taille',c.taille)}${fait('Allonge',c.allonge)}${fait('Garde',c.garde)}
        ${fait(origineDe(c)[1],origineDe(c)[0])}${fait('Contrat',c.contrat[0]+' combat'+(c.contrat[0]>1?'s':''))}${fait('Mondial','n° '+c.mondial)}${fait('Art martial',esc(artCourt(c.art)))}</div>`,'flex:none')}
      ${pan(`<div class="etiq">En ce moment</div><div style="font-size:26px;margin-top:10px">${etat(c)}</div>
        <div class="sous" style="margin-top:6px">Dernier combat le ${dCourt(c.dernier)}, il y a ${depuis(c.dernier)}</div>`,'flex:none')}
      ${pan(`<div style="display:flex;align-items:center;gap:20px;height:100%"><div style="flex:1"><div class="etiq">Prochain combat</div><div class="T" style="font-size:34px;margin-top:8px">${c.statut==='affiche'?'16 février':'Aucun combat prévu'}</div>${c.statut==='affiche'?`<div class="sous" style="margin-top:6px">${esc(c.affiche)}</div>`:''}</div>
        ${c.statut==='affiche'?'':'<button class="bouton jaune oct cj" data-action="proposer">Proposer un combat</button>'}</div>`,'flex:1')}
    </div></div>`;
}
const MOIS_C=['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
const dMois=d=>`${d.getDate()} ${MOIS_C[d.getMonth()]} ${d.getFullYear()}`;
/* Fins de combat : trois familles, comme le demandent les retours (KO, TKO ou arrêt / Soumission / Décision). */
const famille=f=>f.meth[0]==='Soumission'?'Soumission':f.meth[0]==='Décision'?'Décision':'KO, TKO ou arrêt';
const methCourte=f=>f.meth[0]==='Soumission'?'Soum.':f.meth[0]==='Décision'?'Décision':f.meth[0]==='KO'?'KO':'Arrêt';

/* ---- Statistiques : point vert au-dessus de la moyenne, jaune dans la moyenne, rouge en dessous ---- */
function statsHtml(c){
  const s=stats(c),h=historique(c),V=h.filter(x=>x.res==='v'),D=h.filter(x=>x.res==='d');
  const barre=([k,l,u,sens])=>{const max=u==='%'?100:MOY[k]*2.2,ec=(s[k]-MOY[k])/MOY[k]*sens;
    const [col,mot]=ec>.08?['var(--vert)','au-dessus de la moyenne']:ec<-.08?['var(--neg)','en dessous de la moyenne']:['var(--jaune)','dans la moyenne'];
    return `<div style="margin-bottom:18px"><div style="display:flex;align-items:baseline;gap:20px"><span style="font-size:22px">${l}</span>
      <span class="T" style="margin-left:auto;font-size:36px;display:flex;align-items:center;gap:10px" title="${mot}"><i class="octr" style="width:13px;height:13px;background:${col};display:inline-block"></i>${virg(s[k])}${u}</span></div>
      <div class="jauge" style="margin-top:8px;overflow:visible"><i style="width:${Math.min(100,s[k]/max*100)}%;background:rgba(233,230,225,.8)"></i><span style="position:absolute;left:${MOY[k]/max*100}%;top:-6px;bottom:-6px;width:3px;background:var(--blanc)"></span></div>
      <div class="sous" style="font-size:17px;margin-top:4px;padding-left:max(0px,calc(${MOY[k]/max*100}% - 40px))">moyenne ${virg(MOY[k])}${u}</div></div>`;};
  /* Méthodes : une ligne victoires et une ligne défaites par famille, la barre découpée par round (R1 foncé, R2, R3 et plus clair). */
  const fam=f=>{const m=finDe(f)[0];return m==='Soumission'?'Soumission':m==='Décision'?'Décision':'KO / TKO';};
  const FAM=['KO / TKO','Soumission','Décision'],maxN=Math.max(1,...FAM.map(m=>Math.max(V.filter(f=>fam(f)===m).length,D.filter(f=>fam(f)===m).length)));
  const ligne=(l,tot,res,m)=>{const q=l.filter(f=>fam(f)===m),n=q.length;
    const parts=m==='Décision'?[n,0,0]:[1,2,3].map(r=>q.filter(f=>r<3?f.rd===r:f.rd>=3).length);
    return `<div class="mt-l ${res}"><span class="mt-r">${res==='v'?'V':'D'}</span><span class="mt-b">${n?parts.map((k,i)=>k?`<i class="t${i}" style="width:${k/maxN*100}%" title="${m==='Décision'?'':['Round 1','Round 2','Round 3 et plus'][i]+' : '+k}"></i>`:'').join(''):''}</span>
      <span class="mt-p">${n?`${Math.round(n/(tot||1)*100)} %`:''}</span></div>`;};
  const fins=()=>FAM.map(m=>{const nv=V.filter(f=>fam(f)===m).length,nd=D.filter(f=>fam(f)===m).length;
    return `<div class="mt"><div class="mt-n"><b class="T">${m}</b><span class="sous">${nv} V · ${nd} D</span></div>
      <div class="mt-g">${ligne(V,V.length,'v',m)}${ligne(D,D.length,'d',m)}</div></div>`;}).join('');
  return `<div style="display:grid;grid-template-columns:1fr 1fr 1.05fr;gap:20px;height:100%">
    ${pan(titre('Debout')+`<div class="defile">${STATS.slice(0,4).map(barre).join('')}</div>`,'height:100%')}
    ${pan(titre('Lutte et sol')+`<div class="defile">${STATS.slice(4).map(barre).join('')}</div>`,'height:100%')}
    ${pan(titre('Méthodes',`${V.length} V · ${D.length} D`)+`<div class="defile ct7-defile">${fins()}
      <div class="mt-leg"><span><i class="t0"></i>Round 1</span><span><i class="t1"></i>Round 2</span><span><i class="t2"></i>Round 3 et plus</span></div>
      <div class="mt-du"><span class="sous">Durée moyenne d’un combat</span><span class="T">${s.duree}</span></div></div>`,'height:100%')}</div>`;
}

/* ---- Combats : un bilan en tête, puis les combats par année, du plus récent au plus ancien ; plus de « Récit » ---- */
function titreDe(c,f){return c.id==='nana'&&f.guerre;} /* Nana a pris la ceinture contre Belkacem (mars 2026) */
/* Combats pour le titre : Nana l'a pris contre Belkacem, puis l'a défendu deux fois. */
/* Par position dans l'historique (0 = le plus récent) : [libellé, rang de l'adversaire ce jour-là] */
const TITRES={nana:[['Défense n° 2',3],['Défense n° 1',2],['Pour le titre','C']]};
const ABSENCES={nana:{'Sofiane Belkacem':'Opéré de l’épaule'}};
const virgJuges=(f,gagne)=>{const g=f.meth[1]==='partagée'?['29-28','28-29','29-28']:f.rd===3&&f.meth[1]==='unanime'?['30-27','29-28','29-28']:['29-28','29-28','29-28'];
  return (gagne?g:g.map(x=>x.split('-').reverse().join('-'))).join(' · ');};
/* Détail de la fin du combat : KO, TKO (arrêt de l'arbitre), arrêt du médecin, soumission, décision. Fictif et stable. */
const FINS={
  KO:['Crochet du droit','Crochet du gauche','Direct du droit','Uppercut','Coup de genou','Coup de pied à la tête','Coude en remontant'],
  TKO:['Coups au sol','Enchaînement debout','Coups de coude au sol','Coups de pied au corps'],
  Soumission:['Étranglement arrière','Guillotine','Triangle','Clé de bras','D’Arce','Kimura','Clé de talon'],
  Médecin:['Coupure à l’arcade','Œil fermé','Nez cassé'],
  Décision:['Unanime','Unanime','Partagée','Majoritaire']};
const FINS_FIXES={'Rui Carvalho|Split Fight Night 59':['KO','Crochet du droit'],'Kévin Darras|Split Fight Night 62':['Décision','Unanime'],'Sofiane Belkacem|Split Fight Night 56':['Décision','Partagée'],'Ilyas Mezouar|Split Fight Night 53':['Soumission','Étranglement arrière'],'Parfait Nana|Split Fight Night 53':['Soumission','Étranglement arrière']};
function finDe(f){
  const fx=FINS_FIXES[f.adv+'|'+f.soiree];if(fx)return fx;
  const r=graine('fin'+f.adv+f.date.getTime()),pick=l=>l[Math.floor(r()*l.length)];
  if(f.meth[0]==='KO')return r()<.45?['TKO',pick(FINS.TKO)]:['KO',pick(FINS.KO)];
  if(f.meth[0]==='Arrêt du médecin')return ['Arrêt du médecin',pick(FINS.Médecin)];
  if(f.meth[0]==='Soumission')return ['Soumission',pick(FINS.Soumission)];
  return ['Décision',pick(FINS.Décision)];
}
const cartesJuges=(t,gagne,r5)=>{const g=r5?(t==='Partagée'?['48-47','47-48','48-47']:t==='Majoritaire'?['48-47','48-47','47-47']:['50-45','49-46','48-47'])
    :t==='Partagée'?['29-28','28-29','29-28']:t==='Majoritaire'?['29-28','29-28','28-28']:['30-27','29-28','29-28'];
  return (gagne?g:g.map(x=>x.split('-').reverse().join('-'))).join(' · ');};
/* Combats annulés (gardés dans la liste, en gris) */
const ANNULES={nana:[{apres:'Ilyas Mezouar',adv:'Hugo Ferrand',raison:'Forfait de Nana, blessé à l’épaule à l’entraînement',mois:3}]};
/* Bilan de l'adversaire au moment du combat (fictif, stable) */
const bilanAdv=f=>{const r=graine(f.adv+f.date.getTime()),v=6+Math.round((36-Math.min(f.advR==='C'?1:f.advR,35))*0.45+r()*4),d=1+Math.floor(r()*6),n=r()<.2?1:0;return rec(v,d,n||undefined);};
function combatsHtml(c){
  const h=historique(c),V=h.filter(f=>f.res==='v'),fin=V.filter(f=>f.meth[0]!=='Décision').length;
  let serieN=0;const r0=h[0]&&h[0].res;for(const f of h){if(f.res===r0)serieN++;else break;}
  const tuile=(l,v,s,col)=>`<div class="cb-tu-b oct"><div class="cb-tu oct"><div class="etiq">${l}</div><div class="T" style="${col?`color:${col}`:''}">${v}</div>${s?`<div class="sous">${s}</div>`:''}</div></div>`;
  const horsSplit=f=>f.soiree&&!/^Split/.test(f.soiree);
  const TT=TITRES[c.id]||[],T=f=>{const k=h.indexOf(f);return TT[k]&&TT[k][0];},tit=h.filter(f=>T(f)),titV=tit.filter(f=>f.res==='v').length;
  const rangDe=f=>{const k=h.indexOf(f);return TT[k]?TT[k][1]:f.advR;};
  const top=h.filter(f=>!horsSplit(f)&&(rangDe(f)==='C'||rangDe(f)<=15)),tv=top.filter(f=>f.res==='v').length;
  const perf=perfDe(c,[]),COURT={soiree:'Combat de la soirée',perf:'Performance',fin:'Finition'};
  const vus={};h.forEach(f=>{vus[f.adv]=(vus[f.adv]||0)+1;});
  const place=f=>f.advR<=10?'Co-principal':f.advR<=20?'Carte principale':'Préliminaires';
  const PROCH={nana:'Ilyas Mezouar',mezouar:'Parfait Nana'}[c.id];
  const ABR={KO:'KO',TKO:'TKO',Soumission:'SOUM.',Décision:'DÉC.','Arrêt du médecin':'MÉD.'};
  /* Badge du rang de l'adversaire ce jour-là : C (champion), n° 1 à 15, ou NC (non classé) */
  const badge=f=>{if(horsSplit(f))return '<span class="cb-rg nc">Hors Split</span>';const r=rangDe(f);
    return r==='C'?'<span class="cb-rg ch octr">C</span>':r<=15?`<span class="cb-rg oct">n° ${r}</span>`:'<span class="cb-rg nc">NC</span>';};
  const dateCol=d=>`<div class="cb-dt"><span>${d.getDate()} ${MOIS_C[d.getMonth()]}</span></div>`;
  const parAn={};h.forEach(f=>{const y=f.date.getFullYear();parAn[y]=parAn[y]||[0,0];parAn[y][f.res==='v'?0:1]++;});
  let anCour=null;
  const ann=ANNULES[c.id]||[];
  let prec=null;
  const lignes=h.map((f,i)=>{const adv=parNom(f.adv,c.cat),hs=horsSplit(f),ti=T(f);
    let trou='';if(prec){const mois=Math.round((prec.date-f.date)/864e5/30.44);const raison=(ABSENCES[c.id]||{})[prec.adv];if(mois>=7&&raison)trou=`<div class="cb-trou"><span class="cb-trou-l"></span><span>${mois} mois sans combattre · ${esc(raison)}</span><span class="cb-trou-l"></span></div>`;}
    /* combat annulé placé quelques mois après le combat indiqué */
    const an=ann.filter(x=>x.apres===f.adv).map(x=>{const d=new Date(f.date);d.setMonth(d.getMonth()+x.mois);const a2=parNom(x.adv,c.cat);
      return `<div class="cb-l annule"><div class="cb-res"><span class="marque octr">–</span><span class="cb-abr">ANNULÉ</span></div>
        <div class="cb-c">${lien(a2)}<span class="sous">Combat annulé</span></div>
        <div class="cb-c cb-large"><span class="sous" style="font-size:19px">${esc(x.raison)}</span></div>${dateCol(d)}</div>`;}).join('');
    prec=f;
    const pr=hs?[]:perf.filter(x=>x[1]===f.adv&&x[2]===dMois(f.date));
    const [fm,fd]=finDe(f),dec=fm==='Décision';
    const prem=h.findIndex(g=>g.adv===f.adv)===i;
    const rv=prem&&f.adv===PROCH?'Revanche le 16 févr.':prem&&vus[f.adv]>1?'Revanche':'';
    const methL1=`${esc(fm)} · ${esc(fd)}`;
    const methL2=dec?cartesJuges(fd,f.res==='v',f.rd===5):`Round ${f.rd} · ${f.tps}`;
    const y=f.date.getFullYear(),tete=y!==anCour?`<div class="cb-an"><span>${y}</span><span class="cb-an-b">Bilan ${rec(parAn[y][0],parAn[y][1])}</span></div>`:'';anCour=y;
    return trou+tete+an+`<div class="cb-l ${f.res} ${hs?'hs':''} ${ti?'titre':''}">
      <div class="cb-res"><span class="marque octr ${f.res}">${f.res.toUpperCase()}</span><span class="cb-abr">${ABR[fm]||''}</span></div>
      <div class="cb-c"><span class="cb-nom">${lien(adv)}${badge(f)}</span><span class="sous">${adv.surnom?`« ${esc(adv.surnom)} » · `:''}Bilan ${bilanAdv(f)}${rv?` · <span class="cb-rv">${rv}</span>`:''}</span></div>
      <div class="cb-c"><b>${methL1}</b><span class="sous">${methL2}</span></div>
      <div class="cb-c"><span>${esc(f.soiree)}</span><span class="sous">${ti?`<span class="cb-ti">${ico('ceintures',16)} ${ti}</span>`:hs?'Hors Split':place(f)}</span></div>
      <div class="cb-tags">${pr.map(x=>`<span class="cb-pr oct">${COURT[x[0]]}</span>`).join('')}</div>
      ${dateCol(f.date)}</div>`;}).join('');
  return `<div style="display:flex;flex-direction:column;gap:18px;height:100%">
    <div class="cb-bilan">${tuile('Contre le top 15',top.length?rec(tv,top.length-tv):'Aucun combat',top.length?'victoires et défaites':'')}
      ${tuile('Combats pour le titre',tit.length?rec(titV,tit.length-titV):'Aucun',tit.length?(()=>{const d=tit.filter(f=>/^Défense/.test(T(f))).length;return d?`dont ${d} défense${d>1?'s':''}`:'';})():'')}
      ${tuile('Série en cours',`${serieN} ${r0==='v'?'victoire':'défaite'}${serieN>1?'s':''}`)}
      ${tuile('Finitions',`${Math.round(fin/(V.length||1)*100)} %`,'des victoires avant la limite')}</div>
    ${pan(`<div class="defile ct7-defile ct8-fondu cb-liste">${lignes}</div>`,'flex:1;min-height:0')}</div>`;
}

/* ---- Contrat : ce qu'il reste, ce qu'il coûte, quand il finit ; puis sa place parmi les salaires de la catégorie ---- */
const euros=t=>+String(t).replace(/\D/g,'');
/* Primes de performance : montants fixés par le joueur pour toute l'organisation (1 000 à 100 000 €). */
const PRIMES_ORGA={soiree:50000,perf:50000,fin:20000};
const PERF_TYPES=[['soiree','Combat de la soirée'],['perf','Performance de la soirée'],['fin','Prime de finition']];
const PERF_FIXES={nana:[
  ['soiree','Kévin Darras','8 déc. 2026',50000],['perf','Rui Carvalho','19 juil. 2026',50000],['fin','Rui Carvalho','19 juil. 2026',20000],
  ['soiree','Sofiane Belkacem','20 mars 2026',50000],['perf','Anton Kessler','14 sept. 2024',30000],['fin','Anton Kessler','14 sept. 2024',15000],
  ['soiree','Thomas Labbé','2 mars 2023',25000],['fin','Gaël Mendes','11 juin 2022',15000]]};
function perfDe(c,faits){
  if(PERF_FIXES[c.id])return PERF_FIXES[c.id];
  /* Générique : chaque finition donne la prime de finition, une sur trois aussi la performance de la soirée ; une victoire aux points sur cinq est le combat de la soirée. */
  const out=[];let nf=0,nd=0;
  historique(c).filter(f=>f.res==='v'&&f.date.getFullYear()>=+c.depuis).forEach(f=>{const dt=dMois(f.date);
    if(f.meth[0]!=='Décision'){out.push(['fin',f.adv,dt,PRIMES_ORGA.fin]);if(nf++%3===0)out.push(['perf',f.adv,dt,PRIMES_ORGA.perf]);}
    else if(nd++%5===0)out.push(['soiree',f.adv,dt,PRIMES_ORGA.soiree]);});
  return out;
}
function contratHtml(c){
  const [n,bs]=c.contrat,b=euros(bs),total=n+2;
  const l=memeCat(c).map(x=>({x,e:euros(x.contrat[1])})).sort((a,z)=>z.e-a.e),pos=l.findIndex(o=>o.x.id===c.id),max=l[0].e;
  const faits=historique(c).filter(f=>!f.soiree||/^Split/.test(f.soiree)).slice(0,total-n).reverse();
  const perf=perfDe(c,faits),perfTot=perf.reduce((t,x)=>t+x[3],0);
  const pips=faits.map(f=>`<i class="octr ${f.res}">${f.res==='v'?'V':'D'}</i>`).join('')+Array.from({length:n},()=>'<i class="octr reste"></i>').join('');
  const fr=v=>String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g,'\u202f')+'\u00a0€';
  const COURT={soiree:'Combat',perf:'Performance',fin:'Finition'};
  /* Moyennes de la catégorie (par combattant) : repère pour lire ses primes */
  const cat=memeCat(c).map(x=>perfDe(x,[])),nb=Math.max(1,cat.length),virg=v=>String(Math.round(v*10)/10).replace('.',',');
  const moyTot=Math.round(cat.reduce((t,q)=>t+q.reduce((u,x)=>u+x[3],0),0)/nb/1000)*1000;
  const moyNb=k=>cat.reduce((t,q)=>t+q.filter(x=>x[0]===k).length,0)/nb;
  const ecart=(v,m)=>v>m?`<span class="ct8-up">▲</span>`:v<m?`<span class="ct8-down">▼</span>`:'';
  const chiffre=(lab,val,extra='')=>`<div class="ct8-c"><div class="etiq">${lab}</div><div class="T">${val}</div>${extra}</div>`;
  const gauche=pan(`<div class="pt"><h2>Son contrat</h2><div class="ct8-bts"><button class="bouton jaune oct cj ct7-bt">Prolonger</button><button class="bouton oct ct7-bt">Libérer</button></div></div>
    <div class="ct8-chiffres">
      ${chiffre('Combats restants',`${n} <span class="ct8-sur">sur ${total}</span>`,`<div class="ct7-pips">${pips}</div>`)}
      ${chiffre('Bourse fixe',fr(b/2),'<div class="sous">par combat</div>')}
      ${chiffre('Prime de victoire',fr(b/2),'<div class="sous">par victoire</div>')}
    </div>
    <div class="ct8-perf">
      <div class="ct8-ph"><h3>Primes de performance</h3>${perf.length?`<span class="sous">depuis ${esc(c.depuis)}</span><span class="ct8-moy">moyenne des ${esc(pluriel(c.cat).toLowerCase())} : <b>${fr(moyTot)}</b></span><b class="T">${ecart(perfTot,moyTot)} ${fr(perfTot)}</b>`:''}</div>
      ${perf.length?`<div class="ct8-corps">
        <div class="ct8-types">${PERF_TYPES.map(([k,lab])=>{const q=perf.filter(x=>x[0]===k);return `<div class="ct8-ty ${q.length?'':'vide'}"><span>${lab}</span><b class="T">${ecart(q.length,moyNb(k))} ${q.length}</b><span class="ct8-m">${q.length?fr(q.reduce((t,x)=>t+x[3],0)):'aucune'}<span class="ct8-mc">moyenne ${virg(moyNb(k))}</span></span></div>`;}).join('')}</div>
        <div class="defile ct7-defile ct8-liste ct8-fondu">${perf.map(([k,adv,dt,m])=>`<div class="ct8-li"><span class="ct8-d">${esc(dt)}</span><span class="ct8-tag oct">${COURT[k]}</span><span class="ct8-adv">${lien(parNom(adv,c.cat))}</span><b>${fr(m)}</b></div>`).join('')}</div>
      </div>`:'<div class="ct8-aucune">Aucune prime de performance pour l’instant.</div>'}
    </div>`,'height:100%');
  const droite=pan(titre('Classement des salaires',`${pos+1}<sup>${pos?'e':'er'}</sup> sur ${l.length}`)+`<div class="defile ct7-defile ct8-fondu">${l.map((o,k)=>`<div class="sal ct8-sal">
      <span class="T">${k+1}</span><span class="eff-nom" style="min-width:0">${o.x.id===c.id?`<b>${esc(o.x.prenom)} ${esc(o.x.nom)}</b>`:lien(o.x)}</span>
      <span class="sal-b"><i style="width:${o.e/max*100}%;left:0"></i></span><b>${fr(o.e)}</b></div>`).join('')}</div>`,'height:100%');
  return `<div style="display:grid;grid-template-columns:1.5fr 1fr;gap:20px;height:100%">${gauche}${droite}</div>`;
}

/* ---- Échos (ex « On en dit ») : qui parle, d'où, quand, et le ton (mot + couleur : positif, négatif, une info) ---- */
/* Échos : [ton, source, genre, titre, citation, date, nouveau, signature]. La presse en grand, puis les autres voix.
   Chaque voix a son ton : la presse titre, les statistiques constatent, le forum parle, l'entraîneur confie. Textes à relire. */
function echosDe(c){
  const st=stats(c),nana=c.id==='nana',pr=st.fpm>=st.enc;
  return nana?[
    ['pos','Cage Hebdo','Presse','Les derniers rounds lui appartiennent','À 37 ans, il gagne encore quand les autres faiblissent. Ses trois dernières victoires se sont jouées après le deuxième round.','il y a 2 semaines',0,'Julien Morel'],
    ['info','Tableau Noir','Statistiques','Il prend pour donner',`${virg(st.enc)} frappes reçues par minute, ${virg(st.fpm)} données. Il accepte l’échange, et pour l’instant ça lui réussit.`,'il y a 1 mois',0,''],
    ['pos','Le Forum','Supporters','',`Belkacem contre Nana, j’y étais. Je n’avais jamais entendu la salle aussi fort.`,'il y a 5 jours',1,'Gones69'],
    ['neg','Son entraîneur','Entourage','','Il récupère moins vite qu’avant. On a réduit les sparrings, pas l’envie.','il y a 3 semaines',0,'Karim Ouali'],
    ['info','Hors de la cage','Portrait','Boucher le jour, champion le soir','Son surnom vient de son premier métier. Entre deux camps, il passe encore à la boucherie familiale.','',0,'']]
  :[
    ['pos','Cage Hebdo','Presse',`${c.nom} attend son grand soir`,`Il gagne, mais toujours loin de la tête d’affiche. Split aurait tort d’attendre trop longtemps.`,'il y a 2 semaines',0,'Julien Morel'],
    ['info','Tableau Noir','Statistiques',pr?'Il touche plus qu’il ne prend':'Il prend plus qu’il ne touche',`${virg(st.fpm)} frappes données par minute, ${virg(st.enc)} reçues.`,'il y a 1 mois',0,''],
    ['neg','Le Forum','Supporters','',`${c.nom} ? Vu une fois en préliminaires. J’attends de le voir plus haut sur la carte.`,'il y a 5 jours',ECHOS_NOUVEAUX.has(c.id),'Ring_Side'],
    ['pos','Son entraîneur','Entourage','','Il travaille plus que tout le monde. Il lui manque un combat qui compte.','il y a 3 semaines',0,'Samir Haddad'],
    ['info','Hors de la cage','Portrait','Loin des micros','Discret hors de la salle, il ne donne presque jamais d’interview avant un combat.','',0,'']];
}
const TON={pos:['var(--vert)','Positif'],neg:['var(--neg)','Négatif'],info:['var(--jaune)','Une info']};
function echos(c){
  const l=echosDe(c),nouveau=echosNouveau(c);
  const carte=([t,src,genre,tit,txt,date,neuf,sig],i)=>{const [col]=TON[t],parle=!tit;
    return pan(`<div class="ec-tete"><span class="etiq">${esc(src)}</span><span class="sous">${genre}${date?` · ${date}`:''}</span>${neuf&&nouveau?'<span class="ec-neuf">Nouveau</span>':''}</div>
      <div class="ec-corps">${tit?`<div class="T ec-titre ${i===0?'g':''}">${esc(tit)}</div>`:''}
        <p class="ec-txt ${i===0?'g':''} ${parle?'ec-parole':''}">${parle?`« ${esc(txt)} »`:esc(txt)}</p>
        ${sig?`<div class="ec-sig">${parle?'':'Par '}${esc(sig)}</div>`:''}</div>
      `,(i===0?'grid-column:span 2;':'')+`--ton:${col}`,'ec-c');};
  return `<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-template-rows:1fr 1fr;gap:20px;height:100%">${l.map(carte).join('')}</div>`;
}

/* ---- Relation (v3, 08/11) : rapport avec l'organisation sur 5 crans (Neutre au milieu) et moments marquants de sa carrière à Split ;
   son entourage et le vestiaire ; sa carrière (objectifs, progression au classement mondial). ---- */
const RAPPORTS=['Hostile','Tendu','Neutre','Bon','Excellent'];
const RAPPORT_COL=['var(--neg)','var(--neg)','var(--blanc)','var(--vert)','var(--vert)'];
const RELATION={
  nana:{rapport:3,
    moments:[['2019','Signe chez Split','Premier contrat, en préliminaires'],['2020','Première victoire chez Split','Par KO au premier round'],['2021','Premier combat principal','À Lyon, contre Gaël Mendes'],['2022','Premier combat de la soirée','Sa première prime chez Split'],['2023','Entre dans le top 5','Après quatre victoires de suite'],['2024','Prolonge pour quatre combats','Sans passer par le marché'],['mars 2026','Champion des poids légers','Contre Sofiane Belkacem'],['déc. 2026','Deuxième défense réussie','Contre Kévin Darras']],
    entourage:[['Agent','Marc Ferrand','Dur en affaires'],['Entraîneur','Karim Ouali','Depuis ses débuts'],['Préparateur','Lucie Garnier','Depuis 2024'],['Salle','Lyon Fight Club','Lyon']],
    vestiaire:[['Partenaire','Thomas Labbé','Refuse de l’affronter'],['Rival','Ilyas Mezouar','Revanche le 16 févr.'],['Respect','Sofiane Belkacem','Depuis leur guerre']],
    objectifs:[['Devenir champion','atteint','Mars 2026'],['Défendre sa ceinture trois fois','cours','2 sur 3'],['Entrer dans le top 10 mondial','cours','17e aujourd’hui']],
    mondial:[['2019',null],['2021',68],['2023',41],['2025',26],['2026',17]]}
};
function relationDe(c){
  if(RELATION[c.id])return RELATION[c.id];
  const refus=c.statut==='refus',cat=memeCat(c).filter(x=>x.id!==c.id),pick=k=>cat[k%cat.length],dep=+c.depuis||2022,m=c.mondial||40,r=+c.rang||20;
  return {rapport:refus?1:2,
    moments:[[String(dep),'Signe chez Split','Premier contrat, en préliminaires'],[String(Math.min(2025,dep+2)),'Entre dans le top 15','Après trois victoires de suite'],['2025','Premier combat en carte principale',''],...(r<=5?[['2026',`${r===1?'N° 1':`${r}e`} de la catégorie`,'Sa meilleure place']]:[])],
    entourage:[['Agent','Sans agent','Négocie seul'],['Entraîneur','Samir Haddad','Depuis 2022'],['Préparateur','Hugo Brissac','Depuis 2025'],['Salle','Team Rhône MMA','Villeurbanne']],
    vestiaire:[['Partenaire',`${pick(3).prenom} ${pick(3).nom}`,'Même salle'],['Rival',`${pick(7).prenom} ${pick(7).nom}`,'Guerre des mots'],['Ami',`${pick(9).prenom} ${pick(9).nom}`,'Arrivés la même année']],
    objectifs:[[c.id==='mezouar'?'Devenir champion':'Obtenir un combat pour le titre','cours',c.id==='mezouar'?'Combat pour le titre le 16 févr.':''],['Entrer dans le top 15 mondial',m<=15?'atteint':'cours',m<=15?'':`${m}e aujourd’hui`],['Rester invaincu sur une année','atteint','2025']],
    mondial:[[String(dep),null],['2023',m+38],['2024',m+21],['2025',m+8],['2026',m]]};
}
/* Classement mondial dans le temps : 1 en haut ; « NC » (non classé) posé en bas. */
function courbeMondial(v){
  const W=520,H=150,px=30,py=26,n=v.length,rs=v.map(x=>x[1]).filter(Boolean),pire=Math.max(...rs)+10,bas=H-22;
  const X=i=>px+i*(W-2*px)/(n-1),Y=r=>r==null?bas-4:py+(r-1)/(pire-1)*(bas-py-10);
  const pts=v.map((x,i)=>[X(i),Y(x[1])]),d=pts.map((q,i)=>`${i?'L':'M'}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' ');
  return `<svg class="rl-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Progression au classement mondial">
    <line x1="${px}" x2="${W-px}" y1="${bas}" y2="${bas}" class="ax"/>
    <path d="${d} L${pts[n-1][0].toFixed(1)} ${bas} L${pts[0][0].toFixed(1)} ${bas} Z" class="aire"/><path d="${d}" class="tr"/>
    ${pts.map((q,i)=>`<g transform="translate(${q[0].toFixed(1)} ${q[1].toFixed(1)})"><circle r="5" class="pt ${i===n-1?'cur':''}"/><text y="-13" class="rk">${v[i][1]==null?'NC':'n° '+v[i][1]}</text></g>
      <text x="${q[0].toFixed(1)}" y="${H-4}" class="an">${v[i][0]}</text>`).join('')}
  </svg>`;
}
function relation(c){
  const R=relationDe(c);
  const lien2=n=>{const x=parNom(n,c.cat);return x&&x.id?lien(x):esc(n);};
  const ligneE=(r,n,d,l)=>`<div class="rl-e"><span class="etiq">${r}</span><div><b>${l?lien2(n):esc(n)}</b><span class="sous">${esc(d)}</span></div></div>`;
  const echelle=`<div class="rl-ech">${RAPPORTS.map((m,i)=>`<div class="rl-cr ${i===R.rapport?'on':''}" style="--k:${RAPPORT_COL[i]}"><i class="oct"></i><span>${m}</span></div>`).join('')}</div>`;
  const gauche=pan(titre('Rapport avec l’organisation')+echelle+`
    <div class="rl-st">Moments marquants</div>
    <div class="rl-tl2 defile ct7-defile ct8-fondu">${[...R.moments].reverse().map(([d,t,s])=>`<div class="rl-mm"><span class="rl-md">${esc(d)}</span><i class="octr"></i><div><b>${esc(t)}</b>${s?`<span class="sous">${esc(s)}</span>`:''}</div></div>`).join('')}</div>`,'height:100%');
  const milieu=pan(titre('Son entourage')+`<div class="rl-col">
    ${R.entourage.map(([r,n,d])=>ligneE(r,n,d,false)).join('')}
    <div class="rl-st">Dans le vestiaire</div>
    ${R.vestiaire.map(([r,n,d])=>ligneE(r,n,d,true)).join('')}</div>`,'height:100%');
  const ETAT={atteint:['Atteint','var(--blanc)',ico('ok',16)],cours:['En cours','var(--jaune)','']};
  const mv=R.mondial,cur=mv[mv.length-1][1],prev=mv[mv.length-2][1],gain=prev==null?null:prev-cur;
  const droite=pan(titre('Sa carrière')+`
    <div class="rl-st" style="margin-top:0">Objectifs de carrière</div>
    ${R.objectifs.map(([t,e,note])=>`<div class="rl-o ${e}"><span>${esc(t)}</span><span class="rl-oe" style="color:${ETAT[e][1]}">${ETAT[e][2]}${ETAT[e][0]}${note?` <span class="sous">· ${esc(note)}</span>`:''}</span></div>`).join('')}
    <div class="rl-st">Classement mondial <span class="rl-v">${cur}<sup>e</sup> aujourd’hui${gain?` · <span style="color:${gain>0?'var(--vert)':'var(--neg)'}">${gain>0?'▲':'▼'} ${Math.abs(gain)} places en un an</span>`:''}</span></div>
    ${courbeMondial(mv)}`,'height:100%');
  return `<div style="display:grid;grid-template-columns:1fr .95fr 1.15fr;gap:20px;height:100%">${gauche}${milieu}${droite}</div>`;
}

/* ---- Flèches de la bannière : dans l'ordre du classement de la catégorie, et Retour revient au précédent ---- */
const parRang=c=>memeCat(c).sort((a,b)=>rangN(a)-rangN(b));
const voisinRang=d=>{const c=parId(S.fiche),l=c.ext?[c]:parRang(c),i=l.findIndex(x=>x.id===S.fiche);return l[(i+d+l.length)%l.length].id;};
function allerVoisin(d){S.futur=[];S.ficheHist.push(S.fiche);S.fiche=voisinRang(d);S.panCat=false;rendreFiche(d);}
document.addEventListener('click',e=>{const el=e.target.closest('[data-fnav]');if(!el)return;e.stopImmediatePropagation();allerVoisin(+el.dataset.fnav);},true);
function rendreFiche(dir=0){
  $('#fiche').innerHTML=ficheHtml(parId(S.fiche));
  if(dir)$('#banC').animate([{transform:`translateX(${dir*160}px)`,opacity:0},{transform:'none',opacity:1}],{duration:320,easing:'cubic-bezier(.2,.8,.2,1)'});
  const ban=$('#ban'),el=$('#banC');let x0=null,dx=0,k=1;
  ban.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;k=$('.scene').getBoundingClientRect().width/1920;x0=e.clientX;dx=0;ban.setPointerCapture(e.pointerId);el.style.transition='none';});
  ban.addEventListener('pointermove',e=>{if(x0===null)return;dx=(e.clientX-x0)/k;el.style.transform=`translateX(${dx}px)`;el.style.opacity=1-Math.min(.7,Math.abs(dx)/600);});
  const fin=()=>{if(x0===null)return;x0=null;el.style.transition='';
    if(Math.abs(dx)>110){const d=dx<0?1:-1;el.style.transform=`translateX(${-d*600}px)`;el.style.opacity=0;setTimeout(()=>allerVoisin(d),200);}else{el.style.transform='';el.style.opacity='';}};
  ban.addEventListener('pointerup',fin);ban.addEventListener('pointercancel',fin);
}

document.addEventListener('click',e=>{
  if(e.target.closest('[data-action="engager"]'))toast('Tu t’engages : la demande passe « en cours », et il s’en souviendra.');
});
window.addEventListener('DOMContentLoaded',()=>{const q=new URLSearchParams(location.search);if(q.get('onglet')&&ONGLETS.includes(q.get('onglet'))&&S.fiche){S.onglet=q.get('onglet');rendreFiche();}});
/* Fondu des listes sans barre : retiré quand on arrive en bas ou quand tout tient. */
const majFondu=el=>el.classList.toggle('fin',el.scrollTop+el.clientHeight>=el.scrollHeight-4);
document.addEventListener('scroll',e=>{if(e.target.classList&&e.target.classList.contains('ct8-fondu'))majFondu(e.target);},true);
new MutationObserver(()=>document.querySelectorAll('.ct8-fondu:not([data-vu])').forEach(el=>{el.dataset.vu=1;majFondu(el);})).observe(document.body,{childList:true,subtree:true});
