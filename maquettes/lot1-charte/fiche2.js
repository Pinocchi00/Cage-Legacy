"use strict";
/* Maquette lot 1 — fiche du combattant, retours du 07/11 : bannière (flèches à part, accents), Statistiques (points vert / jaune / rouge),
   Combats et Contrat refaits, « On en dit » devient Échos, « Lui et Split » devient Relation, case Style de combat dans l'Aperçu.
   Chargé après fiche.js : ses fonctions remplacent celles du même nom. */

ONGLETS.splice(0,ONGLETS.length,'Aperçu','Statistiques','Combats','Contrat','Échos','Relation');
if(!ONGLETS.includes(S.onglet))S.onglet='Aperçu';
S.echosVus=new Set();
/* Un combattant a du nouveau dans ses échos tant que tu ne les as pas ouverts. */
/* Soirées cohérentes avec son histoire : la ceinture et la défense se sont jouées chez Split. */
(function(){const h=historique(parId('nana'));Object.assign(h[0],{soiree:'Split Fight Night 62'});Object.assign(h[1],{soiree:'Split Fight Night 59'});Object.assign(h[2],{soiree:'Split Fight Night 56'});})();
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
function styleCombat(c,k){
  const t=STYLES_PROPRES[c.id]||STYLES[c.art]||STYLES['Boxe'];
  return pan(titre('Style de combat',esc(artCourt(c.art)))+`<div class="cage-svg">${k.svg}</div><div class="cage-leg">${k.leg}</div>
    <div class="style-l">${[['Comment il combat',t[0]],['Comment il gagne',t[1]],['Ce qui le rend à part',t[2]]].map(([l,x])=>`<div><div class="etiq">${l}</div><div>${esc(x)}</div></div>`).join('')}</div>`,'height:100%');
}

function apercu(c){
  const h=historique(c).slice(0,5),k=cage(c);
  const traits=c.traits||[['+','Régulier','Jamais deux défaites de suite','Il revient toujours plus fort après un revers.']];
  const fait=(l,v)=>`<div class="oct" style="--c:8px;background:var(--ligne);padding:10px 14px;min-width:0"><div class="sous">${l}</div><div class="T" style="font-size:30px;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${v}</div></div>`;
  return `<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,1.45fr);gap:20px;height:100%">
    ${pan(titre('Ce qui le distingue',`${traits.length} trait${traits.length>1?'s':''}`)+traits.map(([s,n,d,t])=>`<div class="oct" style="--c:10px;background:var(--ligne);padding:12px 16px;display:flex;gap:16px;align-items:center;margin-bottom:10px">
        <span class="octr" style="width:44px;height:44px;flex:none;display:grid;place-items:center;background:${s==='+'?'var(--blanc)':'var(--neg)'};color:var(--noir);font-weight:800;font-size:28px">${s}</span>
        <div style="flex:1;min-width:0"><span class="T" style="font-size:32px">${n}</span><div style="font-size:21px">${t}</div><div class="sous" style="font-size:18px">${d}</div></div></div>`).join('')
      +`<div class="etiq" style="margin:12px 0 2px">Derniers combats</div><div class="defile">${h.map(f=>`<div style="display:flex;gap:12px;align-items:center;padding:6px 0;border-bottom:2px solid var(--sep)">
        <span class="marque octr ${f.res}" style="width:28px;height:28px;font-size:20px">${f.res.toUpperCase()}</span>
        <span style="flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:21px">${f.res==='v'?'bat':'battu par'} ${advHtml(f,c)} <span class="sous">· ${methCourte(f)} R${f.rd}</span></span>
        <span class="sous" style="white-space:nowrap">${dMois(f.date)}</span></div>`).join('')}</div>`,'height:100%')}
    ${styleCombat(c,k)}
    <div style="display:flex;flex-direction:column;gap:18px;min-height:0">
      ${pan(`<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px">${fait('Âge',c.age+' ans')}${fait('Taille',c.taille)}${fait('Allonge',c.allonge)}${fait('Garde',c.garde)}
        ${fait('Chez Split','Depuis '+c.depuis)}${fait('Contrat',c.contrat[0]+' combat'+(c.contrat[0]>1?'s':''))}${fait('Mondial','n° '+c.mondial)}${fait('Art martial',esc(artCourt(c.art)))}</div>`,'flex:none')}
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
  const fins=l=>['KO, TKO ou arrêt','Soumission','Décision'].map(m=>`<div style="display:flex;padding:7px 0;border-bottom:2px solid var(--sep)"><span>${m}</span><span class="T" style="margin-left:auto;font-size:30px">${l.filter(f=>famille(f)===m).length}</span></div>`).join('');
  return `<div style="display:grid;grid-template-columns:1fr 1fr .85fr;gap:20px;height:100%">
    ${pan(titre('Debout')+`<div class="defile">${STATS.slice(0,4).map(barre).join('')}</div>`,'height:100%')}
    ${pan(titre('Lutte et sol')+`<div class="defile">${STATS.slice(4).map(barre).join('')}</div>`,'height:100%')}
    ${pan(titre('Ses fins de combat')+`<div class="defile"><div class="etiq" style="color:var(--vert)">Victoires · ${V.length}</div>${fins(V)}
      <div class="etiq" style="color:var(--neg);margin-top:18px">Défaites · ${D.length}</div>${fins(D)}
      <div style="display:flex;margin-top:16px"><span class="sous">Durée moyenne d’un combat</span><span class="T" style="margin-left:auto;font-size:30px">${s.duree}</span></div></div>`,'height:100%')}</div>`;
}

/* ---- Combats : un bilan en tête, puis les combats par année, du plus récent au plus ancien ; plus de « Récit » ---- */
function titreDe(c,f){return c.id==='nana'&&f.guerre;} /* Nana a pris la ceinture contre Belkacem (mars 2026) */
function combatsHtml(c){
  const h=historique(c),V=h.filter(f=>f.res==='v'),fin=V.filter(f=>f.meth[0]!=='Décision').length;
  let serieN=0;const r0=h[0]&&h[0].res;for(const f of h){if(f.res===r0)serieN++;else break;}
  const tuile=(l,v,s,col)=>`<div class="cb-tu"><div class="etiq">${l}</div><div class="T" style="${col?`color:${col}`:''}">${v}</div>${s?`<div class="sous">${s}</div>`:''}</div>`;
  const meth=f=>f.meth[0]==='KO'?['KO',f.meth[1]]:f.meth[0]==='Arrêt du médecin'?['Arrêt du médecin',f.meth[1]]:[f.meth[0],f.meth[1]];
  let an=null;
  const lignes=h.map(f=>{const y=f.date.getFullYear(),tete=y!==an?`<div class="cb-an">${y}</div>`:'';an=y;const [m,d]=meth(f),adv=parNom(f.adv,c.cat);
    return tete+`<div class="cb-l ${f.res}">
      <span class="marque octr ${f.res}">${f.res.toUpperCase()}</span>
      <div class="eff-nom">${lien(adv)}<span class="sous">n° ${f.advR} à l’époque${adv.surnom?` · « ${esc(adv.surnom)} »`:''}</span></div>
      <div class="eff-nom"><b>${m}</b><span class="sous">${esc(d)}</span></div>
      <div class="eff-nom"><b>Round ${f.rd}</b><span class="sous">${f.tps}</span></div>
      <div class="eff-nom"><span>${esc(f.soiree)}</span><span class="sous">${f.date.getDate()} ${MOIS[f.date.getMonth()]}</span></div>
      <div class="cb-tag">${titreDe(c,f)?`<span style="color:var(--jaune)">${ico('ceintures',20)} Ceinture</span>`:f.guerre?'Combat de l’année':''}</div></div>`;}).join('');
  return `<div style="display:flex;flex-direction:column;gap:18px;height:100%">
    <div class="cb-bilan">${tuile('Bilan',bilan(c))}${tuile('Série en cours',`${serieN} ${r0==='v'?'victoire':'défaite'}${serieN>1?'s':''}`,'',r0==='v'?'var(--vert)':'var(--neg)')}
      ${tuile('Finitions',`${Math.round(fin/(V.length||1)*100)} %`,'des victoires avant la limite')}${tuile('Dernier combat',dMois(c.dernier))}</div>
    ${pan(`<div class="defile">${lignes}</div>`,'flex:1;min-height:0')}</div>`;
}

/* ---- Contrat : ce qu'il reste, ce qu'il coûte, quand il finit ; puis sa place parmi les salaires de la catégorie ---- */
const euros=t=>+String(t).replace(/\D/g,'');
function contratHtml(c){
  const champ=c.rang==='C',[n,b]=c.contrat,total=n+2,fin=new Date(S.date);fin.setMonth(fin.getMonth()+n*4);
  const l=memeCat(c).map(x=>({x,e:euros(x.contrat[1])})).sort((a,z)=>z.e-a.e),pos=l.findIndex(o=>o.x.id===c.id),max=l[0].e;
  const vus=l.slice(0,7);if(pos>=7)vus.push(l[pos]);
  const pips=Array.from({length:total},(_,i)=>`<i class="octr ${i<total-n?'fait':''}"></i>`).join('');
  const petit=(l,v)=>`<div><div class="etiq">${l}</div><div class="ct-v">${v}</div></div>`;
  return `<div style="display:grid;grid-template-columns:1.1fr 1fr;gap:20px;height:100%">
    ${pan(titre('Son contrat',`signé en ${+c.depuis+Math.max(0,Math.floor((2026-c.depuis)/2)*2)}`)+`
      <div class="ct-haut"><div><div class="etiq">Combats restants</div><div class="T ct-n">${n}<span> sur ${total}</span></div><div class="ct-pips">${pips}</div></div>
        <div class="ct-sep"></div>
        <div><div class="etiq">Bourse par combat</div><div class="T ct-b">${esc(b)}</div><div class="sous">et autant s’il gagne</div></div></div>
      <div class="ct-bas">${petit('Fin prévue',`${MOIS[fin.getMonth()]} ${fin.getFullYear()}`)}${petit('Chez Split',`depuis ${c.depuis}`)}${petit('Clause',champ?'Titre en jeu à chaque combat':'Aucune')}</div>
      <div style="display:flex;gap:12px;margin-top:auto"><button class="bouton jaune oct cj">Prolonger</button><button class="bouton oct">Libérer</button></div>`,'height:100%')}
    ${pan(titre('Les salaires des '+esc(pluriel(c.cat).toLowerCase()),`${pos+1}<sup>${pos?'e':'er'}</sup> sur ${l.length}`)+`<div class="defile">${vus.map(o=>{const k=l.indexOf(o);return `<div class="sal ${o.x.id===c.id?'cur':''}">
        <span class="T" style="font-size:26px;color:${o.x.id===c.id?'var(--noir)':'var(--texte2)'}">${k+1}</span><span class="eff-nom" style="min-width:0">${o.x.id===c.id?`<b>${esc(o.x.prenom)} ${esc(o.x.nom)}</b>`:lien(o.x)}</span>
        <span class="sal-b"><i style="width:${o.e/max*100}%"></i></span><b style="white-space:nowrap">${esc(o.x.contrat[1])}</b></div>`;}).join('')}</div>`,'height:100%')}</div>`;
}

/* ---- Échos (ex « On en dit ») : qui parle, d'où, quand, et le ton (mot + couleur : positif, négatif, une info) ---- */
function echosDe(c){
  const st=stats(c),nana=c.id==='nana';
  const l=nana?[
    ['pos','Cage Hebdo','Presse','À 37 ans, Nana n’a jamais été aussi dangereux dans le troisième round. Ses adversaires le savent, et ça ne change rien.','il y a 2 semaines'],
    ['info','Tableau Noir','Statistiques',`${virg(st.enc)} frappes encaissées par minute pour ${virg(st.fpm)} données : il accepte d’en prendre pour en placer.`,'il y a 1 mois'],
    ['pos','Le Forum','Supporters','Belkacem contre Nana, j’y étais. Je n’ai jamais entendu Lyon aussi fort.','il y a 5 jours',1],
    ['neg','Son entraîneur','Entourage','Il récupère moins vite qu’avant. On allège les sparrings, pas l’envie.','il y a 3 semaines'],
    ['info','Hors de la cage','Portrait','Le surnom vient de son premier métier : il passe encore à la boutique familiale entre deux camps.','']]
  :[
    ['pos','Cage Hebdo','Presse',`${c.prenom} ${c.nom} n’a pas encore eu de grand soir. Split aurait tort d’attendre trop longtemps.`,'il y a 2 semaines'],
    ['info','Tableau Noir','Statistiques',`${virg(st.fpm)} frappes données par minute, pour ${virg(st.enc)} encaissées.`,'il y a 1 mois'],
    ['neg','Le Forum','Supporters',`${c.nom} ? Vu une fois en préliminaires. J’attends de le revoir plus haut sur la carte.`,'il y a 5 jours',ECHOS_NOUVEAUX.has(c.id)],
    ['pos','Son entraîneur','Entourage','Il travaille plus que les autres. Il lui manque un combat qui compte.','il y a 3 semaines'],
    ['info','Hors de la cage','Portrait','Discret en dehors de la salle. Presque jamais d’interview avant un combat.','']];
  return l.sort((a,z)=>z[3].length-a[3].length); /* les phrases les plus longues dans les plus grandes cases */
}
const TON={pos:['var(--vert)','Positif'],neg:['var(--neg)','Négatif'],info:['var(--jaune)','Une info']};
function echos(c){
  const l=echosDe(c),nouveau=echosNouveau(c);
  const carte=([t,src,genre,txt,date,neuf],i)=>{const [col,mot]=TON[t];
    return pan(`<div class="ec-tete"><div><div class="T ec-src">${esc(src)}</div><div class="sous ec-genre">${genre}${date?` · ${date}`:''}</div></div>
        <span class="ec-ton" style="color:${col}"><i class="octr" style="background:${col}"></i>${mot}</span></div>
      <p class="${i===0?'ec-g':'ec-p'}">${esc(txt)}</p>${neuf&&nouveau?'<div class="ec-neuf">Nouveau</div>':''}`,(i===0?'grid-column:span 2;':'')+`--ton:${col}`,'ec-c');};
  return `<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-template-rows:1fr 1fr;gap:20px;height:100%">${l.map(carte).join('')}</div>`;
}

/* ---- Relation (ex « Lui et Split ») : ce qu'il pense de toi et ce qui compte pour lui, son parcours à Split, ses demandes ---- */
function relation(c){
  const nana=c.id==='nana',h=historique(c),refus=c.statut==='refus';
  const avis=nana?['À construire','var(--jaune)','On ne se connaît pas encore. Trouve-moi un nom, et on parlera.']:refus?['Tendue','var(--neg)','Je veux savoir où je vais avant de remonter dans la cage.']:['À construire','var(--jaune)','Je ne demande qu’à combattre. Mets-moi sur une carte.'];
  const compte=nana?['Garder sa ceinture','Être payé comme un champion','Combattre devant le public de Lyon']:refus?['La sécurité d’un contrat','Être payé à sa valeur','Combattre souvent']:['Combattre souvent','Monter au classement','Un premier combat en carte principale'];
  const best=h.filter(f=>f.res==='v').sort((a,z)=>a.advR-z.advR)[0];
  const etapes=[[`${c.depuis}`,'Arrivée à Split','sous Kader Malika']];
  if(nana)etapes.push(['20 mars 2026','Champion des poids légers','contre Sofiane Belkacem, en cinq rounds'],['8 déc. 2026','Première défense','contre Kévin Darras, aux points']);
  else if(best)etapes.push([dMois(best.date),'Sa plus belle victoire',`contre ${best.adv}, n° ${best.advR}`]);
  etapes.push(c.statut==='affiche'?['16 févr. 2027','Prochain combat',esc(c.affiche)]:[dMois(c.dernier),'Dernier combat','']);
  const dem=nana?[['Défendre sa ceinture avant l’été','Il veut remettre son titre en jeu avant juin.','tenue','Déjà prévu : le 16 février.'],
    ['Une prime à la hauteur','Il attend une prime de performance s’il gagne le 16 février.','attente','']]
    :refus?[['Être prolongé','Il ne signera plus de combat sans prolongation.','attente','']]:[];
  return `<div style="display:grid;grid-template-columns:1fr 1fr 1.1fr;gap:20px;height:100%">
    ${pan(titre('Ce qu’il pense de toi')+`<div class="rel-avis" style="color:${avis[1]}"><i class="octr" style="background:${avis[1]}"></i>${avis[0]}</div>
      <p class="rel-cit">« ${avis[2]} »</p>
      <div class="etiq" style="margin-top:auto">Ce qui compte pour lui</div>${compte.map((t,i)=>`<div class="rel-c"><span class="T">${i+1}</span>${t}</div>`).join('')}`,'height:100%')}
    ${pan(titre('Son parcours à Split')+`<div class="rel-tl">${etapes.map(([d,t,s],i)=>`<div class="${i===etapes.length-1?'der':''}"><i class="octr"></i><div class="sous">${d}</div><div class="T" style="font-size:28px">${t}</div>${s?`<div style="font-size:20px">${s}</div>`:''}</div>`).join('')}</div>`,'height:100%')}
    ${pan(titre(esc(S.nomDemandes),dem.length?`${dem.length} en cours`:'')+(dem.length?dem.map(([t,d,e,note])=>`<div class="dem oct">
        <div class="T" style="font-size:30px">${t}</div>
        <div style="font-size:21px;margin-top:6px">${d}</div>
        <div style="display:flex;align-items:center;gap:12px;margin-top:12px">${e==='tenue'?`<span style="color:var(--vert);font-weight:700;display:inline-flex;gap:8px;align-items:center">${ico('ok',18)}En bonne voie</span><span class="sous">${note}</span>`
          :`<span class="sous">Sans réponse de ta part</span><button class="bb oct petit" style="margin-left:auto" data-action="engager"><span class="oct">S’engager</span></button>`}</div></div>`).join('')
      :'<div class="sous" style="font-size:22px">Aucune demande pour l’instant.</div>'),'height:100%')}</div>`;
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
