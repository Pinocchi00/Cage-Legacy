"use strict";
/* Maquette lot 1 — écran Messages (R13, R17, T10, Q5a). Deux colonnes : la liste à gauche, le message ouvert au centre.
   Retours du 09/11 : titre « Messages », plus de filtres ni de mentions, un point jaune seulement, ligne choisie octogonale
   et encadrée, suppression (avertissement si le message attend une décision), plus de « Ta réponse », chaque message
   montre ses propres données.
   Préfixe ms- (scope global partagé avec cadre.js, fiche.js, effectif.js, fiche2.js, affiche.js : aucun nom réutilisé). */

const msJ=(j,m=0)=>new Date(2027,m,j);

/* ---- Pièces ---- */
const msCase=(t,c,cls='')=>`<div class="ms-case oct ${cls}"><div class="oct">${t?`<div class="etiq ms-ct">${t}</div>`:''}${c}</div></div>`;
const msJauge=(k,col='var(--blanc)')=>`<div class="jauge ms-j"><i style="width:${Math.round(k*100)}%;background:${col}"></i></div>`;
const msFait=(l,v)=>`<div class="ms-f"><span class="sous">${l}</span><span>${v}</span></div>`;
const msFaitH=(l,v)=>`<div class="ms-f h"><span class="sous">${l}</span><span>${v}</span></div>`;
const msGros=(v,l,col='')=>`<div class="ms-gros"><span class="T" style="${col?`color:${col}`:''}">${v}</span>${l?`<span class="sous">${l}</span>`:''}</div>`;
const msOui=(l,a)=>`<button class="bouton jaune cj ms-b" ${a}>${esc(l)}</button>`;
const msNon=(l,a)=>`<button class="bb oct" ${a}><span class="oct">${l}</span></button>`;
const msInfirmerie=()=>`<button class="bb oct petit" data-mseff="infirmerie"><span class="oct"><span style="color:var(--neg);display:flex">${ico('medical',22)}</span>Infirmerie</span></button>`;
const msTag=t=>`<span class="ms-tag oct"><span class="oct">${esc(t)}</span></span>`;
const MS_POUBELLE='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg>';
const msGravite=(n,t)=>`<span class="ms-grav">${[0,1,2].map(i=>`<i class="octr ${i<n?'on':''}"></i>`).join('')}<span>${t}</span></span>`;
const msNom=c=>`<span class="nom" data-fiche="${c.id}">${esc(c.nom)}</span>`;
const msCombat=k=>{const f=S.af.m[+k.slice(1)],a=f.a&&parId(f.a),b=f.b&&parId(f.b),libre='<span class="ms-libre">Libre</span>';
  return `<div class="ms-cb" data-go="carte"><span class="sous">${afRole(k)}</span><span class="ms-cb-n">${a?msNom(a):libre}<span class="ms-vs">contre</span>${b?msNom(b):libre}</span>${a&&a.rang==='C'?'<span class="ms-titre-j">Titre</span>':''}</div>`;};
/** Frise d'un retour de blessure : du jour de la blessure au retour, aujourd'hui marqué. */
function msFrise(d0,d1,etiq0,etiq1){
  const k=Math.max(.02,Math.min(1,(S.date-d0)/(d1-d0)));
  return `<div class="ms-frise"><div class="ms-fr-l"><i style="width:${k*100}%"></i><b class="octr" style="left:${k*100}%"></b></div>
    <div class="ms-fr-e"><span class="sous">${etiq0}</span><span class="sous">${etiq1}</span></div></div>`;
}
const msChamp=cat=>COMBATTANTS.find(c=>c.cat===cat&&c.rang==='C');
const msMois=d=>{const m=Math.round((S.date-d)/864e5/30.44);return m<1?'moins d’un mois':m+' mois';};
/* Une championne crédible face à une n° 1 invaincue depuis cinq combats. */
Object.assign(msChamp('Poids paille F'),{v:12,d:2,n:0,serie:'vvdvv',mondial:7});
const msMeilleur=f=>COMBATTANTS.filter(f).sort((a,b)=>a.mondial-b.mondial)[0];
/** Les trois catégories où le meilleur challenger de Split est le plus loin au classement mondial. */
function msFaibles(){
  const cats=[...new Set(COMBATTANTS.map(c=>c.cat))].map(cat=>({cat,m:msMeilleur(c=>c.cat===cat&&c.rang!=='C')})).filter(x=>x.m).sort((a,b)=>b.m.mondial-a.m.mondial).slice(0,3);
  return cats.map(x=>msFait(esc(x.cat),`meilleur challenger : n° ${x.m.mondial} mondial`)).join('');
}
/** Les quatre combattants disponibles, hors carte, dont le dernier combat est le plus ancien. */
function msAttente(){
  const pris=new Set([...S.af.m,...S.af.p].flatMap(f=>[f.a,f.b]).filter(Boolean));
  return COMBATTANTS.filter(c=>c.statut==='dispo'&&!pris.has(c.id)).sort((a,b)=>a.dernier-b.dernier).slice(0,4);
}
const msJours=d=>Math.round((d-S.date)/864e5);

/* ---- Les messages ----
   txt : ce que dit l'auteur, court. vue() : les cases de données. rep : décisions [libellé, ce qui se passe] (première = jaune).
   act() : boutons qui mènent ailleurs, jamais obligatoires. attend : une décision est attendue (point jaune). */
const MS_BOITE=[
  {id:'leila-carte',tag:'Leïla',qui:'Leïla Malika',role:'ton adjointe',date:msJ(12),lu:false,
   t:'Il manque deux combats pour <b>Split Fight Night 63</b>',
   txt:'Lille, c’est dans 35 jours. Nana contre Mezouar et Rachidi contre Meziane sont prêts. Belkacem n’a pas encore d’adversaire, et le quatrième combat reste à construire. Tant que l’affiche n’est pas complète, la presse n’en parle pas.',
   vue:()=>`<div class="ms-cases g2b">
      ${msCase(`La carte principale · ${S.af.m.filter(f=>f.a&&f.b).length} / 4`,['m0','m1','m2','m3'].map(msCombat).join(''))}
      ${msCase('Le Forum de Lille',`${msGros(`<span data-mscompte="${S.preventes}">${nb(S.preventes)}</span>`,'places vendues sur 4 000')}${msJauge(S.preventes/4000)}
        ${msFait('Vendues cette semaine','<span style="color:var(--vert)">+ 412</span>')}${msFait('Le jour du combat','Mardi 16 février')}
        <div class="ms-cite">« Nana–Mezouar fait parler, le reste attend. »<span class="sous">Cage Hebdo, 9 janvier</span></div>`)}
      ${S.ms.idees?msCase('Les idées de Leïla',`
        <div class="ms-idee" data-msidee="m2:bello"><span class="ms-cb-n">${lien(parId('belkacem'))}<span class="ms-vs">contre</span>${lien(parId('bello'))}</span><span class="sous">Belkacem veut un adversaire du top 3. Bello est n° 3.</span><span class="lecture">›</span></div>
        <div class="ms-idee" data-msidee="m3:labbe"><span class="ms-cb-n">${lien(parId('labbe'))}<span class="ms-vs">contre</span>${lien(parId('darras'))}</span><span class="sous">Darras est de Lille : la salle sera pour lui.</span><span class="lecture">›</span></div>`,'large apparait'):''}
      ${msCase('Ils attendent un combat',`<div class="ms-att3">${msAttente().map(c=>{
          return `<div><div class="ms-qui">${lien(c)}</div><div class="sous">${esc(c.cat)} · ${bilan(c)}</div><div class="ms-dep">Dernier combat il y a <b>${msMois(c.dernier)}</b></div></div>`;}).join('')}</div>`,'large')}
    </div>`,
   act:()=>msOui('Ouvrir la carte','data-msgo="carte"')+(S.ms.idees?'':msNon('Les idées de Leïla','data-msidees'))},

  {id:'rizzo-blesse',tag:'Médecin',qui:'Dr Hélène Roux',role:'médecin de Split',date:msJ(11),lu:false,
   t:'<span class="nom" data-fiche="rizzo">Paolo Rizzo</span> s’est blessé au camp',
   txt:'Paolo s’est tordu la cheville gauche à l’entraînement. Ce n’est pas grave, et il n’est pas à l’affiche du 16 février.',
   vue:()=>`<div class="ms-cases g3">
      ${msCase('Diagnostic',`${msFaitH('Blessure','Entorse de la cheville gauche')}${msFait('Gravité',msGravite(1,'Légère'))}${msFaitH('Soins','Repos, kiné trois fois par semaine')}`)}
      ${msCase('Retour',`${msGros('2 février',`dans ${msJours(msJ(2,1))} jours`)}${msFrise(msJ(11),msJ(2,1),'11 janvier','2 février')}`)}
      ${msCase('',`<div class="ms-qui">${lien(parId('rizzo'))}</div><div class="sous">Poids mouche · 23 ans</div><div class="sous">n° 4 Split · n° 30 mondial</div>
        <div class="ms-l2"><span class="T ms-bil">6-0-0</span>${serie('vvvvv')}</div>${msFaitH('Il peut combattre','à la soirée du 23 mars')}`)}
      ${msCase('Les autres absents',COMBATTANTS.filter(c=>c.id!=='rizzo'&&/blesse|pause|susp/.test(c.statut)).slice(0,4).map(c=>
        `<div class="ms-inf"><span class="ms-qui">${lien(c)}</span><span class="sous">${esc(c.cat)}</span>${etat(c)}</div>`).join(''),'large')}
    </div>`,
   act:msInfirmerie},

  {id:'palier',tag:'Palier',qui:'Split',role:'',date:msJ(10),lu:true,
   t:'Palier franchi : les diffuseurs nationaux regardent Split',
   txt:'Split atteint le palier « Diffusion nationale » : une chaîne nationale peut désormais retransmettre tes grandes soirées.',
   vue:()=>`<div class="ms-cases g2">
      ${msCase('Les paliers de Split · 41 200 fans',`<div class="ms-paliers">${['Local','Régional','Diffusion nationale','Rayonnement européen','Référence mondiale'].map((p,i)=>
        `<div class="ms-pal ${i<2?'fait':i===2?'neuf':''}"><i class="octr">${i<3?ico('ok',18,3):''}</i><span>${p}</span></div>`).join('')}</div>`,'large')}
      ${msCase('Ce qui change',`${msFait('Part de la télé dans la recette','18 % → <b style="color:var(--vert)">26 %</b>')}${msFaitH('Soirées retransmises','Une sur trois → <b style="color:var(--vert)">toutes les grandes</b>')}${msFait('Ce que demandent les agents','<b style="color:var(--neg)">+ 10 % sur les cachets</b>')}`)}
      ${msCase('Le prochain : Rayonnement européen',`
        ${msFait('Une soirée à guichets fermés','68 %, ton record')}${msJauge(.68)}
        ${(()=>{const m=msMeilleur(()=>true);return msFaitH('Un combattant dans le top 5 mondial',`Le meilleur : ${lien(m)}, n° ${m.mondial}`);})()}
        ${msFait('60 000 fans','41 200')}${msJauge(.69)}`)}
    </div>`},

  {id:'presse',tag:'Presse',qui:'Cage Hebdo',role:'',date:msJ(9),lu:true,
   t:'« Split a un nouveau matchmaker. Il a 38 jours pour remplir le Forum. »',
   txt:'Cage Hebdo te consacre sa une cette semaine.',
   vue:()=>`<div class="ms-cases g2b">
      ${msCase('Ce qu’écrit Cage Hebdo',`<p class="ms-art">L’an dernier, Split n’a rempli que 46 % du Forum de Lille. Le nouveau matchmaker hérite d’un champion de 37 ans, <span class="nom" data-fiche="nana">Parfait Nana</span>, et d’une division des légers qui attend un vrai choc.</p>
        <p class="ms-art">« Le 16 février dira s’il sait construire une soirée. »</p>`)}
      ${msCase('Depuis la parution',`${msFait('Lecteurs du numéro','18 400')}${msFait('Places vendues pour Lille','<span style="color:var(--vert)">+ 214</span>')}${msFaitH('Le ton de l’article','Curieux, pas encore convaincu')}`)}
      ${msCase('Ce qu’en disent les autres',`<div class="ms-echos">
        <div><span class="etiq">Tableau Noir</span><p>« Nana à 37 ans en tête d’affiche : courage ou entêtement ? »</p></div>
        <div><span class="etiq">Les fans, en ligne</span><p>« Mezouar contre Nana, enfin. Le reste, on verra. »</p></div></div>`,'large')}
    </div>`,
   act:()=>msNon('Presse ›','data-mstoast="Écran Presse, hors de cette maquette."')},

  {id:'recruteur',tag:'Recruteur',qui:'Marco Ferri',role:'ton recruteur',date:msJ(8),lu:true,
   t:'Ton recruteur est disponible',
   txt:'',
   vue:()=>`<div class="ms-cases g2">
      ${msCase('Marco Ferri',`<div class="ms-dispo"><span class="point octr pulse" style="background:var(--vert)"></span><span class="T">Disponible</span></div>
        ${msFait('Où il est','À Lyon, depuis le 8 janvier')}${msFait('Son dernier voyage','Turin, 6 jours, 4 profils')+msFait('Signé après ce voyage',lien(parId('musaev')))}`)}
      ${msCase('Là où l’effectif est le plus faible',msFaibles())}
      ${msCase('Un voyage, selon sa durée',`<div class="ms-chiffres q3">${msGros('2','profils en 3 jours')}${msGros('4','profils en 7 jours')}${msGros('6','profils en 14 jours')}</div>
        <div class="sous" style="margin-top:4px">Il part de Lyon et cherche dans toutes les catégories. Pendant le voyage, il n’est pas joignable.</div>`,'large')}
    </div>`,
   act:()=>msOui('Ouvrir le recrutement','data-mstoast="Écran Recrutement, hors de cette maquette."')},

  {id:'vanbelle',tag:'Agent',qui:'Luc Verhaegen',role:'agent de Jens Van Belle',date:msJ(7),lu:true,attend:true,
   t:'L’agent de <span class="nom" data-fiche="vanbelle">Jens Van Belle</span> veut prolonger',
   txt:'Il reste un combat à Jens. Il se plaît chez Split, mais d’autres organisations l’ont contacté. Voici sa demande pour prolonger.',
   vue:()=>`<div class="ms-cases g3b">
      ${msCase('Le contrat',`<div class="ms-t"><span></span><span class="etiq">Aujourd’hui</span><span class="etiq">Demandé</span>
        <span class="sous">Combats</span><span>1 restant</span><b>4</b>
        <span class="sous">Par combat</span><span>9 000 €</span><b>15 000 €</b>
        <span class="sous">Si victoire</span><span>+ 9 000 €</span><b>+ 15 000 €</b>
        <span class="sous">Au plus</span><span>18 000 €</span><b>120 000 €</b></div>`)}
      ${msCase('',`<div class="ms-qui">${lien(parId('vanbelle'))}</div><div class="sous">Poids léger · 26 ans</div><div class="sous">n° 8 Split · n° 52 mondial</div>
        <div class="ms-l2"><span class="T ms-bil">9-2-0</span>${serie('vvdvv')}</div>${msFait('Dernier combat','3 octobre')}`)}
      ${msCase('Ailleurs',`${msFaitH('Ils l’ont contacté','MMA Korner et Pure Impact')}${msFaitH('Son agent','Il négocie dur et fait jouer la concurrence')}`)}
      ${msCase('Chez Split depuis 2023',`<div class="ms-chiffres q4">${msGros('5','combats')}${msGros('4','victoires')}${msGros('1','bonus de la soirée')}${msGros('2 400','places en moyenne')}</div>`,'large')}
    </div>`,
   rep:[['Négocier',null,'Écran Contrats, hors de cette maquette.'],['Après le 16 février','L’agent attendra. D’ici là, il écoutera les autres offres.']]},

  {id:'rachidi',tag:'Combattante',qui:'Hajar Rachidi',role:'',date:msJ(6),lu:true,attend:true,
   t:'<span class="nom" data-fiche="rachidi">Hajar Rachidi</span> veut une chance au titre',
   txt:'« Cinq victoires de suite. Si je bats Meziane le 16 février, je veux ma chance pour la ceinture avant l’été. Je ne demande pas plus d’argent. Je veux juste savoir si Split croit en moi. »',
   vue:()=>{const r=parId('rachidi'),v=msChamp('Poids paille F'),col=(c,t)=>`<div class="ms-duo-c"><span class="etiq">${t}</span><div class="ms-qui">${lien(c)}</div>
        <div class="ms-l2 col"><span class="T ms-bil">${bilan(c)}</span>${serie(c.serie)}</div><div class="sous">${c.rang==='C'?'Championne':'n° '+c.rang+' Split'} · n° ${c.mondial} mondial</div></div>`;
     return `<div class="ms-cases g2b">
      ${msCase('Poids pailles',`<div class="ms-duo">${col(r,'Elle')}<span class="ms-duo-vs T">VS</span>${col(v,'La championne')}</div>`)}
      ${msCase('Sa demande',`<div class="ms-dem">Un combat pour la ceinture <b>avant le 30 juin</b>, si elle bat ${lien(parId('meziane'))} le 16 février.</div>
        ${msFaitH('Si tu acceptes','C’est noté sur sa fiche, dans « Ses demandes »')}${msFait('Si tu tiens parole','Elle te fera confiance')}${msFait('Sinon','<span style="color:var(--neg)">Elle le prendra mal</span>')}`)}
      ${msCase('Ses trois derniers combats',`<div class="ms-echos">${[['8 décembre','Soumission, étranglement arrière','R2 · 3:41'],['14 septembre','Décision unanime','30-27 ×3'],['22 juin','KO technique, coups au sol','R1 · 4:12']].map(([d,m,t])=>
        `<div><span class="etiq">${d} · ${t}</span><p><b style="color:var(--vert)">Victoire</b> · ${m}</p></div>`).join('')}</div>`,'large')}
    </div>`;},
   rep:[['C’est d’accord','Noté sur sa fiche, dans « Ses demandes ». À tenir avant le 30 juin.'],['Pas maintenant','Elle n’insiste pas. Elle t’en reparlera si elle bat Meziane.']]},

  {id:'patron',tag:'Organisation',qui:'Gérard Vasseur',role:'le patron de Split',date:msJ(5),lu:true,
   t:'Ce que le patron attend de ta saison',
   txt:'« Je ne te demande pas de miracle. Je veux voir où tu emmènes Split. »',
   vue:()=>`<div class="ms-cases g2b">
      ${msCase('Tes objectifs 2027',`
        ${msFait('Rester dans les deux premières organisations','<b style="color:var(--vert)">2e, à garder</b>')}${msJauge(.92,'var(--vert)')}
        ${(()=>{const m=msMeilleur(c=>c.cat==='Poids lourd');return msFait('Un poids lourd de Split dans le top 5 mondial',`<b style="color:var(--jaune)">meilleur : n° ${m.mondial}</b>`)+msJauge(Math.min(.95,5/m.mondial),'var(--jaune)');})()}
        ${msFait('Remplir le Forum de Lille',`${Math.round(S.preventes/40)} %`)}${msJauge(S.preventes/4000)}`)}
      ${msCase('Le patron',`${msGros('Il attend de voir')}${msFait('Ce qu’il regarde en premier','Les préventes de Lille')}${msFait('Il a fondé Split','En 2004')}`)}
      ${msCase('Ce qu’il surveille',`<div class="ms-chiffres q4">${msGros('13,4 M€','masse salariale par an')}${msGros('182 000 €','recette à Lille l’an dernier')}${msGros('1 830','places vendues l’an dernier')}${msGros('+ 6 %','abonnés télé en 2026')}</div>`,'large')}
    </div>`},

  {id:'bienvenue',tag:'Leïla',qui:'Leïla Malika',role:'ton adjointe',date:msJ(4),lu:true,
   t:'Bienvenue chez Split',
   txt:'Je suis Leïla, ton adjointe. Je connais les combattants, les agents et les salles de la région. Quand tu veux un avis, demande-moi : je ne choisis jamais à ta place.',
   vue:()=>`<div class="ms-cases g2b">
      ${msCase('Split aujourd’hui',`<div class="ms-chiffres">${msGros(COMBATTANTS.length,'combattants')}${msGros(COMBATTANTS.filter(c=>c.rang==='C').length,'champions')}${msGros('62','soirées')}${msGros('<span style="text-transform:none">2e</span>','des 8 organisations')}</div>`)}
      ${msCase('Par où commencer',`<div class="ligne" data-go="effectif"><span style="flex:1">Connaître l’effectif</span><span class="lecture">›</span></div><div class="ligne" data-go="carte"><span style="flex:1">Finir la carte du 16 février</span><span class="lecture">›</span></div>`)}
      ${msCase('Tes deux têtes d’affiche',`<div class="ms-echos">${['nana','mezouar'].map(id=>{const c=parId(id);
        return `<div><div class="ms-qui">${lien(c,true)}</div><div class="sous">${esc(c.cat)} · ${c.rang==='C'?'champion':'n° '+c.rang+' Split'} · n° ${c.mondial} mondial</div><div class="ms-l2"><span class="T ms-bil">${bilan(c)}</span>${serie(c.serie)}</div></div>`;}).join('')}</div>`,'large')}
    </div>`},
];
S.ms={sel:'leila-carte',suppr:null,idees:false};

/* L'Accueil reprend le titre de la une, daté du 9 janvier. */
MESSAGES.forEach(a=>{a.t=a.t.replace('Il a 35 jours','Il a 38 jours');});

/* ---- Outils ---- */
const msPar=id=>MS_BOITE.find(m=>m.id===id);
const msAttend=m=>!!(m.attend&&m.choisi==null);
const msQuand=d=>{const j=Math.round((S.date-d)/864e5);return j<=0?'aujourd’hui':j===1?'hier':`${d.getDate()} ${MOIS[d.getMonth()]}`;};
const msBloquant=()=>MS_BOITE.find(m=>m.important&&msAttend(m));
/** L'Accueil garde sa propre liste (MESSAGES, cadre.js) : on la tient à jour à partir de la boîte. */
function msSync(){
  MESSAGES.forEach(a=>{if(!MS_BOITE.some(m=>m.t===a.t)&&!(S.ms.supprimes||[]).includes(a.t))MS_BOITE.unshift({id:'a'+a.id,tag:a.tag,qui:a.tag==='Médecin'?'Dr Hélène Roux':a.tag,role:a.tag==='Médecin'?'médecin de Split':'',date:new Date(S.date),lu:a.lu,t:a.t,
    txt:/reprend la course/.test(a.t)?'Il a repris la course ce matin, sans douleur. Le retour est toujours prévu le 2 février.':esc(a.de),act:/rizzo/.test(a.t)?msInfirmerie:null});});
  MESSAGES.forEach(a=>{const m=MS_BOITE.find(x=>x.t===a.t);if(m)a.lu=m.lu;});
  const it=ITEMS.find(i=>i[0]==='messages');if(it)it[2]=MS_BOITE.some(m=>!m.lu||msAttend(m))?1:0;
}
function msLire(id){const m=msPar(id)||MS_BOITE[0];if(!m)return;m.lu=true;S.ms.sel=m.id;S.ms.suppr=null;msSync();}

/* ---- Liste ---- */
function msListe(){
  return pan(titre('Messages')+`<div class="defile ms-liste">${MS_BOITE.length?MS_BOITE.map(m=>{const vif=!m.lu||msAttend(m);
    return `<div class="ms-l oct ${m.id===S.ms.sel?'sel':''} ${m.id===S.ms.nouveau?'apparait':''}" data-msg="${m.id}"><div class="ms-li oct">
      <span class="point octr ${vif?'':'lu'} ${!m.lu?'pulse':''}"></span>
      <div class="ms-l-t"><div class="ms-titre ${vif?'vif':''}">${m.t}</div><div class="sous">${esc(m.qui)} · ${msQuand(m.date)}</div></div>
      ${msTag(m.tag)}</div></div>`;}).join(''):`<div class="ms-vide">Aucun message.</div>`}</div>`,'','ms-g');
}

/* ---- Message ouvert ---- */
function msBas(m){
  let h='';
  if(m.rep){
    if(m.choisi==null)h=m.rep.map((r,i)=>i===0?msOui(r[0],`data-msrep="${i}"`):msNon(esc(r[0]),`data-msrep="${i}"`)).join('');
    else h=`<div class="ms-ok ${S.ms.juste?'apparait':''}"><span style="color:var(--vert);display:flex">${ico('ok',24,3)}</span>${m.rep[m.choisi][1]}</div>`;
  }
  const a=m.act?m.act():'';
  return h||a?`<div class="ms-bas">${h}${a?`<span class="ms-act">${a}</span>`:''}</div>`:'';
}
function msOuvert(){
  const m=msPar(S.ms.sel);
  if(!m)return pan(`<div class="ms-vide">Aucun message.</div>`,'','ms-g');
  const avert=S.ms.suppr===m.id?`<div class="ms-avert oct apparait"><div class="oct"><span>${m.important?esc(m.alerte)+' Supprimer ce message laisse les choses en l’état.':'Ce message attend ta décision.'} Le supprimer quand même ?</span>
      ${msOui('Supprimer','data-mssok')}${msNon('Garder','data-mssnon')}</div></div>`:'';
  return pan(`<div class="ms-tete">${msTag(m.tag)}<span class="ms-de">${esc(m.qui)}${m.role?`<span class="sous"> · ${esc(m.role)}</span>`:''}</span>
      <span class="sous" style="margin-left:auto">${dLong(m.date)}</span>
      ${msAttend(m)?'':`<button class="bb oct petit ms-sup" data-mssuppr title="Supprimer ce message"><span class="oct">${MS_POUBELLE}</span></button>`}</div>
    <div class="pt ms-pt"><h2>${m.t}</h2></div>${avert}
    <div class="defile ms-corps ${S.ms.anim?'ms-anim':''}">${m.txt?`<p class="ms-txt">${m.txt}</p>`:''}${m.vue?m.vue():''}</div>
    ${msBas(m)}`,'','ms-g');
}
/** Petits compteurs qui montent à l'ouverture d'un message (mouvement discret). */
function msCompteurs(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  document.querySelectorAll('[data-mscompte]').forEach(e=>{const v=+e.dataset.mscompte,t0=performance.now();
    const f=t=>{const k=Math.min(1,(t-t0)/700),q=1-Math.pow(1-k,3);e.textContent=nb(v*q);if(k<1)requestAnimationFrame(f);};requestAnimationFrame(f);});
}

/* ---- Branchement dans le cadre ---- */
function msAlerte(){
  const b=msBloquant(),v=4-S.af.m.filter(x=>x.a&&x.b).length;
  $('#alerte').innerHTML=`<span class="tag-j oct cj fin">Prochaine étape</span><span style="font-size:22px">${b?`Réponds au médecin : ${b.alerte}`:v?`Il manque ${v} combat${v>1?'s':''} en carte principale.`:'La carte est complète : tu peux la valider.'}</span>`;
}
const msRendreBase=rendre;
rendre=function(){
  if(S.ecran!=='messages'){msRendreBase();return;}
  msSync();rendreBarre();rendreEntete('Messages');msAlerte();
  const l=$('.ms-liste'),y=l?l.scrollTop:0,anim=S.ms.anim;
  $('#corps').style.top='152px';
  $('#corps').innerHTML=`<div class="ms">${msListe()}${msOuvert()}</div>`;
  const l2=$('.ms-liste');if(l2)l2.scrollTop=y;
  $('#zone').classList.toggle('fiche-ouverte',!!S.fiche);
  if(anim)msCompteurs();
  S.ms.anim=false;S.ms.juste=false;S.ms.nouveau=null;
};
const msAllerBase=aller;
aller=function(ec){
  if(ec!=='messages'){msAllerBase(ec);return;}
  if(S.fiche)fermerFiche(false);
  if(S.ecran!=='messages'){S.hist.push(S.ecran);S.futur=[];}
  S.ecran='messages';msLire(S.ms.sel);S.ms.anim=true;rendre();
};
/* La fiche s'ouvre par-dessus les messages, sans les quitter. */
const msOuvrirBase=ouvrirFiche;
ouvrirFiche=function(id,garderFutur=false){
  if(S.ecran!=='messages'){msOuvrirBase(id,garderFutur);return;}
  if(!garderFutur)S.futur=[];
  if(S.fiche&&S.fiche!==id)S.ficheHist.push(S.fiche);
  S.fiche=id;S.panCat=false;rendre();rendreFiche();setTimeout(()=>$('#fiche').classList.add('ouverte'),30);
};
function msSupprimer(id){
  const i=MS_BOITE.findIndex(m=>m.id===id);if(i<0)return;const m=MS_BOITE[i];
  if(m.important)m.choisi=0;
  (S.ms.supprimes=S.ms.supprimes||[]).push(m.t);
  MS_BOITE.splice(i,1);const j=MESSAGES.findIndex(a=>a.t===m.t);if(j>=0)MESSAGES.splice(j,1);
  const n=MS_BOITE[Math.min(i,MS_BOITE.length-1)];S.ms.suppr=null;if(n)msLire(n.id);else S.ms.sel=null;
  S.ms.anim=true;rendre();toast('Message supprimé.');
}

/* ---- Continuer (T10) : jour par jour, s'arrête sur le premier message important ; refuse tant qu'il bloque ---- */
const msContinuerBase=continuer;
continuer=function(){
  const b=msBloquant();
  if(b){toast(`Impossible de continuer : ${b.alerte} Choisis quoi faire.`);if(S.ecran!=='messages')aller('messages');msLire(b.id);rendre();return;}
  if(S.ecran!=='messages'||S._msFait){msContinuerBase();if(S.ecran==='messages')setTimeout(()=>{if(S.ecran==='messages')rendre();},1000);return;}
  if(S._enCours)return;S._enCours=true;let n=0;
  const tic=()=>{S.date.setDate(S.date.getDate()+1);S.jours--;n++;S.preventes+=48+n*17;
    const e=$('#dateH');if(e){e.textContent=dCourt(S.date);e.animate([{opacity:.2,transform:'translateY(-6px)'},{opacity:1,transform:'none'}],{duration:280});}
    if(n<2){setTimeout(tic,650);return;}
    S._enCours=false;S._msFait=true;
    Object.assign(parId('belkacem'),{statut:'blesse',retour:'à confirmer le 5 février'});
    const m={id:'belkacem-blesse',tag:'Médecin',qui:'Dr Hélène Roux',role:'médecin de Split',date:new Date(S.date),lu:true,important:true,attend:true,
      alerte:'Sofiane Belkacem est blessé et il est à l’affiche.',
      t:'<span class="nom" data-fiche="belkacem">Sofiane Belkacem</span> est blessé, et il est à l’affiche',
      txt:'Sofiane s’est ouvert l’arcade gauche à l’entraînement : six points de suture. S’il cicatrise bien, il pourra combattre. Je te donne mon avis définitif le 5 février.',
      vue:()=>`<div class="ms-cases g3">
        ${msCase('Diagnostic',`${msFaitH('Blessure','Coupure à l’arcade gauche, six points')}${msFait('Gravité',msGravite(2,'Moyenne'))}${msFaitH('Le risque','Que la plaie se rouvre en combat')}`)}
        ${msCase('Avis définitif',`${msGros('5 février',`dans ${msJours(msJ(5,1))} jours`)}${msFrise(msJ(14),msJ(5,1),'14 janvier','5 février')}${msFait('Le combat','16 février')}`)}
        ${msCase('À l’affiche',`${msCombat('m2')}${msFait('Si tu le retires','sa place se libère')}${msFait('Combat dans','33 jours')}`,'etroit')}
      </div>`,
      act:msInfirmerie,
      rep:[['Le garder à l’affiche','Belkacem reste à l’affiche. Le médecin te répond le 5 février.'],
        ['Le retirer de la carte','Belkacem quitte la carte : sa place est libre.',null,'belkacem']]};
    MS_BOITE.unshift(m);MESSAGES.unshift({id:Date.now(),lu:true,t:m.t,de:`Le médecin · ${dLong(S.date).toLowerCase()}`,tag:'Médecin'});
    S.ms.sel=m.id;S.ms.nouveau=m.id;S.ms.anim=true;S.ms.suppr=null;rendre();
    toast(`Le temps s’arrête, ${dLong(S.date).toLowerCase()} : message important du médecin.`);
  };tic();
};

/* ---- Clics ---- */
document.addEventListener('click',e=>{
  const t=e.target;let el;
  /* Accueil : un message s'ouvre dans l'écran Messages (Q5a). */
  if((el=t.closest('#msgs .ligne'))&&!t.closest('[data-fiche]')&&el.dataset.go==='messages'){
    const i=[...el.parentNode.children].indexOf(el),m=MS_BOITE.find(x=>x.t===MESSAGES[i].t);
    if(m){e.stopImmediatePropagation();S.ms.sel=m.id;aller('messages');}return;}
  if(S.ecran!=='messages'||t.closest('#fiche'))return;
  if(t.closest('[data-fiche]'))return;
  const stop=()=>e.stopImmediatePropagation();
  if((el=t.closest('[data-msg]'))){stop();if(el.dataset.msg!==S.ms.sel){msLire(el.dataset.msg);S.ms.anim=true;rendre();}return;}
  if(t.closest('[data-mssuppr]')){stop();const m=msPar(S.ms.sel);if(!msAttend(m))msSupprimer(m.id);return;}
  if(t.closest('[data-mssok]')){stop();msSupprimer(S.ms.sel);return;}
  if(t.closest('[data-mssnon]')){stop();S.ms.suppr=null;rendre();return;}
  if(t.closest('[data-msidees]')){stop();S.ms.idees=true;rendre();return;}
  if((el=t.closest('[data-msidee]'))){stop();const [k,id]=el.dataset.msidee.split(':');
    Object.assign(S.af,{sel:k,tab:'m',vue:'liste',cat:parId(id).cat,apercu:id,leila:false});aller('carte');return;}
  if((el=t.closest('[data-msrep]'))){stop();const m=msPar(S.ms.sel),r=m.rep[+el.dataset.msrep];
    if(r[1]==null){toast(r[2]);return;}
    m.choisi=+el.dataset.msrep;S.ms.juste=true;
    if(r[3]){const f=S.af.m.find(x=>x.a===r[3]||x.b===r[3]);if(f){f.a===r[3]?f.a=null:f.b=null;Object.assign(S.af,{sel:'m'+S.af.m.indexOf(f),tab:'m',vue:'liste',cat:parId(r[3]).cat});}}
    rendre();return;}
  if((el=t.closest('[data-msgo]'))){stop();aller(el.dataset.msgo);return;}
  if((el=t.closest('[data-mseff]'))){stop();S.eff.onglet=el.dataset.mseff;aller('effectif');return;}
  if((el=t.closest('[data-mstoast]'))){stop();toast(el.dataset.mstoast);return;}
},true);

/* ---- Lancement : ?ecran=messages, options msg=<id>, rep=<n>, idees=1, suppr=1, bloque=1 (après Continuer) ---- */
window.addEventListener('DOMContentLoaded',()=>{
  const q=new URLSearchParams(location.search);
  if(q.get('ecran')!=='messages')return;
  S.ecran='messages';S.hist=['accueil'];
  if(q.get('msg'))S.ms.sel=q.get('msg');
  msLire(S.ms.sel);
  if(q.get('rep')){const m=msPar(S.ms.sel);if(m&&m.rep)m.choisi=+q.get('rep');}
  if(q.get('idees'))S.ms.idees=true;
  if(q.get('suppr'))S.ms.suppr=S.ms.sel;
  S.ms.anim=true;rendre();
  if(q.get('bloque'))setTimeout(continuer,200);
});
