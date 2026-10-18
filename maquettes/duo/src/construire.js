"use strict";
/* Assemble les planches du mode Duo en pages autonomes : commun.css + duo.css + corps + commun.js.
   Les noms et les chiffres viennent de donnees.json (extraire.js : une vraie partie Split × Garden of Blood).
   node maquettes/duo/src/construire.js  →  maquettes/duo/Duo*.html */
const fs=require('fs'), path=require('path');
const ICI=__dirname, OUT=path.join(ICI,'..');
const lire=f=>fs.readFileSync(path.join(ICI,f),'utf8');
const D=JSON.parse(lire('donnees.json'));
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const MAJ=s=>String(s).toUpperCase();

/* ---- Les données de la partie ---- */
const ORG=id=>D.orgs.find(o=>o.id===id);
const A=ORG(D.j1), B=ORG(D.j2), NA=D.noms.a, NB=D.noms.b;
const C1=D.cartes[0], C2=D.cartes[1], C4=D.cartes[3], DIVS=C1.divisions;
/* Décision du 18/10 (16 h 08) : l'ouverture des enchères = la valeur du contrat, 3 × la bourse ; palier de 10 %. */
const eurosK=k=>{ const v=Math.round(k*1000), t=String(Math.abs(v)).replace(/\B(?=(\d{3})+(?!\d))/g,'\u202f'); return (v<0?'−':'')+t+'\u00a0€'; };
for(const c of D.cartes) for(const l of c.lots){ l.ouverture=3*l.b; l.pas=Math.max(1,Math.ceil(l.ouverture*0.1));
  l.ouvertureTxt=eurosK(l.ouverture); l.pasTxt=eurosK(l.pas); l.deux=eurosK(l.ouverture+l.pas); l.trois=eurosK(l.ouverture+2*l.pas); }
const cote=c=>c==='a'?{org:A,nom:NA,cls:'j1'}:{org:B,nom:NB,cls:'j2'};
const DIV=id=>(DIVS.find(d=>d.id===id)||{}).label||id;
const rec=f=>`${f.W}-${f.L}-${f.D}`;
const euros=k=>{ const v=Math.round(k*1000), t=String(Math.abs(v)).replace(/\B(?=(\d{3})+(?!\d))/g,'\u202f'); return (v<0?'−':'')+t+'\u00a0€'; };
const ord=n=>n===1?'1er':n+'e';
const rangTxt=r=>r?(r===1?'N° 1':'N° '+r):'—';
const scoreSaison=k=>{ let a=0,b=0; for(const c of D.cartes.slice(0,k)){ if(c.score.a>c.score.b) a++; else if(c.score.b>c.score.a) b++; } return {a,b}; };

/* ---- Les morceaux ---- */
const OCT=t=>`<svg width="${t}" height="${t}" viewBox="0 0 400 400" fill="none" role="img" aria-label="L’octogone rouge gravé" style="flex:none"><path d="M292.0 238.1L238.1 292.0L161.9 292.0L108.0 238.1L108.0 161.9L161.9 108.0L238.1 108.0L292.0 161.9Z" stroke="#E23A2B" stroke-width="15.0"/><path d="M331.0 254.3L254.3 331.0L145.7 331.0L69.0 254.3L69.0 145.7L145.7 69.0L254.3 69.0L331.0 145.7Z" stroke="#E23A2B" stroke-width="21.0"/><path d="M371.0 270.8L270.8 371.0L129.2 371.0L29.0 270.8L29.0 129.2L129.2 29.0L270.8 29.0L371.0 129.2Z" stroke="#E23A2B" stroke-width="12.0"/></svg>`;
const LOGO=t=>`<div class="logo">${OCT(t)}<div class="logo-mots"><b>CAGE</b><i>LEGACY</i></div></div>`;
const entete=(lib,droite)=>`<div class="logo-seul">${LOGO(64)}</div>
  <div class="entete"><div class="entete-g"><div class="plaque"><span class="T">DUO</span></div><div class="entete-lib">${lib}</div></div>
  <div class="entete-d">${droite||''}</div></div>`;
const droiteSaison=(s,n)=>`<div class="plaque"><span class="T">SAISON ${s}</span></div><div class="plaque"><span class="T">SUPER CARTE</span><span class="T rouge">${n}</span><span class="lab">SUR 4</span></div>`;
const versus=`${esc(MAJ(NA))} <span class="t2">×</span> ${esc(MAJ(NB))}`;
const touches=l=>`<div class="touches large">${l.map(([k,t,j])=>`<div class="tg">${k.map(x=>`<span class="k${j?' j':''}">${x}</span>`).join('')}<span>${t}</span></div>`).join('')}</div>`;
const pan=(cls,inner,attr)=>`<div class="pan ${cls}"${attr||''}><div class="p2"><div class="p3">${inner}</div></div></div>`;
const titre=(t,lab)=>`<div class="pan-tete"><div class="pan-titre"><div class="T">${t}</div><div class="trait"></div></div>${lab?`<div class="lab">${lab}</div>`:''}</div>`;
const forme=f=>`<div class="forme">${(f||[]).map(x=>`<i class="f-${x}">${x==='v'?'V':x==='d'?'D':'N'}</i>`).join('')}</div>`;
const tag=c=>`<span class="tag ${cote(c).cls}">${esc(MAJ(cote(c).nom))}</span>`;
/* Les polices sont incluses dans la page : ouverte d'un double-clic (file://), le navigateur refuse de charger une police d'un fichier voisin. */
const POLICES=css=>css.replace(/url\('support\/([^']+\.(woff2|ttf))'\)/g,(_,f,ext)=>`url('data:font/${ext};base64,${fs.readFileSync(path.join(OUT,'support',f)).toString('base64')}')`);
const page=(nom,titreP,etats,corps)=>{
  const html=`<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${titreP}</title>
<style>
${POLICES(lire('commun.css'))}
${lire('duo.css')}
</style>
</head>
<body data-etats="${etats}">
<div class="ecran"><div class="stage">
${corps}
</div></div>
<script>
${lire('commun.js')}
</script>
</body>
</html>
`;
  fs.writeFileSync(path.join(OUT,nom+'.html'),html);
  console.log(nom+'.html',html.length);
};

/* ======================================================================================
   1. DuoCreation — noms · j1 · j2
   ====================================================================================== */
{
  const carte=(o,etat)=>{
    const prise=etat==='prise', choisie=etat==='choisie';
    const lignes=[...o.plus.map(t=>['plus',t]),...o.moins.map(t=>['moins',t])].map(([k,t])=>`<div class="org-l"><span class="${k}">${k==='plus'?'+':'−'}</span><span>${esc(t)}</span></div>`).join('');
    return pan(`org${choisie?' choisi':''}${prise?' prise':''}`,`<div class="org-tete${choisie?' on':''}"><div class="T" style="font-size:${o.nom.length>18?30:44}px">${esc(MAJ(o.nom))}</div>${choisie?'<div class="lab noir">CHOISIE</div>':''}${prise?`${tag('a')}`:''}</div>
      <div class="org-corps"><div class="lab">${esc(MAJ(o.ville))} · DEPUIS ${o.annee}</div><div class="org-rep">${esc(o.reputation)}</div><div>${lignes}</div></div>`);
  };
  const grille=(choisie,prise)=>`<div class="org-grille">${D.orgs.map(o=>carte(o,o.id===prise?'prise':(o.id===choisie?'choisie':''))).join('')}</div>`;
  const pied=(qui,org)=>`<div class="cr-pied"><div class="l1">${qui}</div>${`<div class="bouton jaune"><span class="T">${org}</span><span class="k">Entrée</span></div>`}</div>`;
  const corps=`${entete('Nouvelle partie à deux',`<div class="plaque"><span class="lab">EMPLACEMENT 2</span></div>`)}
  <main class="contenu large">
    <div data-etat="noms" class="cr-noms">
      ${pan('cr-carte',`${titre('QUI JOUE ?','DEUX JOUEURS, UN PC')}
        <div class="cr-champs">
          <label class="champ j1"><span class="lab">JOUEUR 1</span><span class="saisie"><span>${esc(NA)}</span><i class="curseur"></i></span><span class="l2">Choisit son organisation en premier</span></label>
          <label class="champ j2"><span class="lab">JOUEUR 2</span><span class="saisie"><span>${esc(NB)}</span></span><span class="l2">Choisit parmi les sept autres</span></label>
        </div>
        <div class="cr-regle">
          <div class="l1">Chacun son organisation. Vos adjoints jouent les soirées ordinaires.</div>
          <div class="l1">Tous les 3 mois, une super carte : six combats, tes combattants contre les siens.</div>
        </div>
        <div class="cr-bas"><div class="l2">16 caractères au plus. Vide : « Joueur 1 », « Joueur 2 ».</div><div class="bouton jaune"><span class="T">CONTINUER</span><span class="k">Entrée</span></div></div>`)}
    </div>
    <div data-etat="j1">${grille(D.j1,null)}${pied(`<span class="tour-mini j1">${esc(MAJ(NA))}</span> choisis ton organisation`,'CHOISIR SPLIT')}</div>
    <div data-etat="j2">${grille(D.j2,D.j1)}${pied(`<span class="tour-mini j2">${esc(MAJ(NB))}</span> choisis ton organisation · Split est prise par ${esc(NA)}`,'CRÉER LA PARTIE')}</div>
  </main>
  ${touches([[['↑','↓','←','→'],'Choisir'],[['Échap'],'Retour'],[['Entrée'],'Valider',true]])}`;
  page('DuoCreation','Duo — la création à deux','noms j1 j2',corps);
}

/* ======================================================================================
   2. DuoQG — attente · progression · arrivee
   ====================================================================================== */
{
  const c=C2;   /* entre la super carte 1 et la super carte 2 */
  const colonne=(k,etat)=>{
    const s=cote(k), r=c.resume[k];
    const caisse=etat==='attente'?c.avant.caisse[k]:r.caisse, rang=etat==='attente'?c.avant.rang[k]:c.rang[k], champ=etat==='attente'?c.avant.champions[k]:r.champions;
    const sc=scoreSaison(1);
    const lignes=etat==='attente'?`<div class="vide l1 t2">Rien encore depuis la super carte 1.</div>`
      :r.combats.slice(0,6).map(x=>{ const w=x.winner==='A'?x.a:x.b, l=x.winner==='A'?x.b:x.a;
        return `<div class="ligne"><div class="col"><div class="l1">${x.winner==='D'?`${esc(x.a)} et ${esc(x.b)}`:`<span class="nom">${esc(w)}</span> bat ${esc(l)}`}</div><div class="l2">${esc(x.div)} · ${esc(x.methode)}</div></div></div>`; }).join('');
    const n=etat==='attente'?0:r.soirees;
    return pan(`qg-cote ${s.cls}`,`<div class="bande"></div>
      <div class="qg-tete"><div class="col"><div class="T qg-org">${esc(MAJ(s.org.nom))}</div><div class="lab">${esc(MAJ(s.nom))} · ${esc(MAJ(s.org.ville))} · DEPUIS ${s.org.annee}</div></div><div class="qg-score T">${k==='a'?sc.a:sc.b}</div></div>
      <div class="qg-tuiles">
        <div class="tuile"><div class="lab">En caisse</div><div class="T">${esc(caisse)}</div></div>
        <div class="tuile"><div class="lab">Organisations</div><div class="T">${rang}<small>e sur ${c.nOrgs}</small></div></div>
        <div class="tuile"><div class="lab">Champions</div><div class="T">${champ}<small> sur 12</small></div></div>
      </div>
      <div class="sous">Depuis la dernière super carte · ${n} soirée${n>1?'s':''}</div>
      <div class="qg-lignes">${lignes}</div>
      <div class="bouton qg-eff"><span class="T">EFFECTIF ${k==='a'?'D’':'DE '}${esc(MAJ(s.nom))}</span><span class="k">${k==='a'?'1':'2'}</span></div>`);
  };
  const centre=etat=>{
    const sc=scoreSaison(1);
    const action={
      attente:`<div class="jaune-bloc focus"><div class="lab">La suite</div><div class="jb-l"><div class="T">AVANCER</div><div class="k">Entrée</div></div><div class="jb-t">Jusqu’à la super carte du ${esc(c.superDate.toLowerCase())}. Vos adjoints jouent les soirées.</div></div>`,
      progression:`<div class="prog"><div class="lab">Les soirées des adjoints se jouent</div><div class="T prog-date">${esc(c.pas[0].date)}</div>
        <div class="prog-barre"><b style="width:${Math.round(100*(c.pas[0].jour-c.avant.jour)/91)}%"></b></div>
        <div class="l2">${esc(A.nom)} Fight Night ${c.pas[0].fnA} · ${esc(B.nom)} Fight Night ${c.pas[0].fnB}</div></div>`,
      arrivee:`<div class="jaune-bloc focus"><div class="lab">C’est le jour</div><div class="jb-l"><div class="T">LES ENCHÈRES</div><div class="k">Entrée</div></div><div class="jb-t">${c.lots.length} combattants libres, puis la composition de la carte.</div></div>`,
    }[etat];
    return pan('qg-centre',`<div class="lab qg-c-lab">Saison 1 · après la super carte 1</div>
      <div class="qg-gros"><span class="T j1c">${sc.a}</span><span class="T t2">–</span><span class="T j2c">${sc.b}</span></div>
      <div class="l2 qg-c-sous">${C1.score.a===C1.score.b?`Super carte 1 : égalité ${C1.score.a}–${C1.score.b}`:`Super carte 1 : ${C1.score.a}–${C1.score.b}`}</div>
      <div class="sep"></div>
      <div class="lab">Prochaine super carte</div><div class="T qg-date">${esc(c.superDate)}</div>
      <div class="l2">${etat==='arrivee'?'Aujourd’hui':(etat==='progression'?'Dans '+(c.avant.jour+91-c.pas[0].jour)+' jours':'Dans 91 jours')}</div>
      <div class="qg-action">${action}</div>
      <div class="bouton"><span class="T">SUPER CARTES PASSÉES</span><span class="k">H</span></div>`);
  };
  const corps=`${entete(versus,droiteSaison(1,2))}
  <main class="contenu large qg">
    ${['attente','progression','arrivee'].map(e=>`<div class="qg-cols" data-etat="${e}">${colonne('a',e)}${centre(e)}${colonne('b',e)}</div>`).join('')}
  </main>
  ${touches([[['1'],'Effectif d’'+NA],[['2'],'Effectif de '+NB],[['H'],'Super cartes passées'],[['Échap'],'Menu principal'],[['Entrée'],'Continuer',true]])}`;
  page('DuoQG','Duo — le QG','attente progression arrivee',corps);
}

/* ======================================================================================
   3. DuoEffectif — j1 · j2
   ====================================================================================== */
{
  const c=C2, divId='H-light';
  const ETAT={dispo:'Disponible',blesse:'Blessé',libre:'Sans contrat',refuse:'Refuse de combattre'};
  const liste=k=>{
    const rows=c.effectif[k][divId].slice(0,8);
    return rows.map(f=>`<div class="ef-l"><div class="ef-r T">${f.rang||'—'}</div><div class="ef-n l1">${esc(f.name)}</div><div class="ef-b l1">${rec(f)}</div><div class="ef-a l1 t2">${f.age} ans</div>${forme(f.forme)}<div class="ef-e l2 ${f.etat}">${ETAT[f.etat]}</div><div class="ef-c l2">${f.restants?f.restants+' combat'+(f.restants>1?'s':'')+' au contrat':'—'}</div></div>`).join('');
  };
  const onglets=`<div class="onglets">${DIVS.slice(0,8).map(d=>`<div class="ong${d.id===divId?' on':''}">${esc(MAJ(d.label.replace('Poids ','')))}</div>`).join('')}<div class="ong">FÉMININES ›</div></div>`;
  const vue=k=>{ const s=cote(k);
    return `<div class="ef ${s.cls}" data-etat="${k==='a'?'j1':'j2'}">
      <div class="ef-tete"><div class="tour-mini ${s.cls}">${esc(MAJ(s.nom))}</div><div class="T ef-org">${esc(MAJ(s.org.nom))}</div><div class="l2">Tab : l’effectif ${k==='a'?'de '+esc(NB):'d’'+esc(NA)}</div></div>
      ${onglets}
      ${pan('ef-pan',`<div class="ef-l ef-h"><div class="ef-r lab">Rang</div><div class="ef-n lab">Combattant</div><div class="ef-b lab">Bilan</div><div class="ef-a lab">Âge</div><div class="forme lab">Forme</div><div class="ef-e lab">État</div><div class="ef-c lab">Contrat</div></div>${liste(k)}`)}
    </div>`; };
  const corps=`${entete(`Effectif · ${versus}`,`<div class="plaque"><span class="T">POIDS LÉGER</span></div>`)}
  <main class="contenu large">${vue('a')}${vue('b')}</main>
  ${touches([[['←','→'],'Catégorie'],[['Tab'],'L’autre joueur'],[['Échap'],'Retour au QG']])}`;
  page('DuoEffectif','Duo — l’effectif d’un joueur','j1 j2',corps);
}

/* ======================================================================================
   4. DuoEncheres — ouverture · mise · adjuge · caisse
   ====================================================================================== */
{
  const c=C2, L=c.lots[0], premier=C1.score.a>C1.score.b?'b':(C1.score.b>C1.score.a?'a':'b');
  const second=premier==='a'?'b':'a';
  const caisse=k=>{ const s=cote(k), dispo=(k==='a'?c.caisses.aK+c.caisses.capA:c.caisses.bK+c.caisses.capB);
    return pan(`en-caisse ${s.cls}`,`<div class="bande"></div><div class="lab">${esc(MAJ(s.org.nom))}</div><div class="T en-nom">${esc(MAJ(s.nom))}</div>
      <div class="sep"></div><div class="lab">En caisse</div><div class="T en-v">${esc(c.caisses[k])}</div>
      <div class="sep"></div><div class="lab">Peut miser</div><div class="l1">${dispo>0?'jusqu’à '+euros(dispo):'rien : la caisse est à découvert'}</div>`); };
  const peut=k=>(k==='a'?c.caisses.aK+c.caisses.capA:c.caisses.bK+c.caisses.capB)>=L.ouverture;
  const meneur=`<div class="l2">${tag(second)} mène · palier ${esc(L.pasTxt)}</div>`;
  const etatBloc={
    ouverture:{tour:premier,prix:`<div class="lab">Ouverture</div><div class="T en-prix">${esc(L.ouvertureTxt)}</div><div class="l2">Personne n’a encore misé · palier ${esc(L.pasTxt)}</div>`,mise:L.ouvertureTxt,
      refus:peut(premier)?'':`Pas assez en caisse pour miser ${L.ouvertureTxt}.`,cache:true},
    caisse:{tour:premier,prix:`<div class="lab">Ouverture</div><div class="T en-prix">${esc(L.ouvertureTxt)}</div><div class="l2">Personne n’a encore misé · palier ${esc(L.pasTxt)}</div>`,mise:L.ouvertureTxt,refus:`Pas assez en caisse pour miser ${L.ouvertureTxt}.`},
    mise:{tour:premier,prix:`<div class="lab">Prix actuel</div><div class="T en-prix">${esc(L.ouvertureTxt)}</div>${meneur}`,mise:L.deux},
    adjuge:{tour:null,prix:`<div class="lab">Adjugé</div><div class="T en-prix">${esc(L.ouvertureTxt)}</div><div class="l2">${esc(cote(premier).nom)} a passé</div>`},
  };
  const vue=e=>{ const x=etatBloc[e];
    const bandeau=x.tour?`<div class="tour ${cote(x.tour).cls}"><span class="T">À ${esc(MAJ(cote(x.tour).nom))} DE MISER</span></div>`
      :`<div class="tour ${cote(second).cls}"><span class="T">${esc(MAJ(cote(second).nom))} SIGNE ${esc(MAJ(L.name))}</span></div>`;
    const boutons=x.tour?`<div class="en-boutons"><div class="bouton jaune"><span class="T">MISER ${esc(x.mise)}</span><span class="k">Entrée</span></div><div class="bouton"><span class="T">PASSER</span><span class="k">P</span></div></div>${x.refus&&!x.cache?`<div class="en-refus l1">${esc(x.refus)}</div>`:''}`
      :`<div class="en-boutons"><div class="bouton jaune"><span class="T">COMBATTANT SUIVANT</span><span class="k">Entrée</span></div></div><div class="l1 t2 en-sous">Contrat de 3 combats chez ${esc(cote(second).org.nom)}.</div>`;
    return `<div class="en" data-etat="${e}">${caisse('a')}
      ${pan('en-centre',`<div class="en-lots">${c.lots.map((l,i)=>`<span class="en-pt${i===0?' on':''}">${i+1}</span>`).join('')}<span class="lab">Combattant 1 sur ${c.lots.length}</span></div>
        <div class="lab">${esc(MAJ(L.div))} · LIBRE · VIENT DE ${esc(MAJ(L.org))}</div>
        <div class="T en-cb">${esc(MAJ(L.name))}</div>
        <div class="en-tuiles"><div class="tuile"><div class="lab">Bilan</div><div class="T">${L.W}-${L.L}-${L.D}</div></div><div class="tuile"><div class="lab">Âge</div><div class="T">${L.age} ANS</div></div><div class="tuile"><div class="lab">Mondial</div><div class="T">${ord(L.rang)}</div></div></div>
        <div class="en-prixbloc">${x.prix}</div>
        ${bandeau}${boutons}`)}
      ${caisse('b')}</div>`; };
  const ETATS_EN=['ouverture'].concat(peut(premier)&&peut(second)?[]:['caisse'],['mise','adjuge']);
  const corps=`${entete(`Enchères · ${versus}`,droiteSaison(1,2))}
  <main class="contenu large">${ETATS_EN.map(vue).join('')}</main>
  ${touches([[['Entrée'],'Miser',true],[['P'],'Passer'],[['Échap'],'Retour au QG']])}`;
  page('DuoEncheres','Duo — les enchères',ETATS_EN.join(' '),corps);
  fs.writeFileSync(path.join(ICI,'etats-encheres.txt'),ETATS_EN.join(' '));
}

/* ======================================================================================
   5. DuoDraft — place · reponse · pret
   ====================================================================================== */
{
  const c=C2, d=c.draft;
  const placeur=i=>d[i].place;
  /* Le milieu du draft : trois combats posés, le 4e à placer. Disponibles = l'effectif du jour moins les combattants déjà sur la carte. */
  const pris=new Set(d.slice(0,3).flatMap(x=>[x.a.id,x.b.id]));
  const dispo=k=>Object.values(c.effectif[k]).flat().filter(f=>f.etat==='dispo'&&!pris.has(f.id));
  const divsPrises=new Set(d.slice(0,3).map(x=>x.divId));
  const fait=(etat)=>etat==='place'?3:(etat==='reponse'?3:6);
  const slots=etat=>{ const n=fait(etat);
    return [...Array(6)].map((_,i)=>{ const x=d[i], vu=i<n, rep=etat==='reponse'&&i===3, princ=i===5;
      const num=princ?'COMBAT PRINCIPAL · 5 ROUNDS':'COMBAT '+(6-i);
      if(!vu&&!rep) return `<div class="dr-slot vide"><div class="lab">${num}</div><div class="l2">à placer</div></div>`;
      const pa=x.place, s=cote(pa);
      const nomA=(rep&&pa!=='a')?'<span class="t2">à répondre</span>':esc(x.a.name), nomB=(rep&&pa!=='b')?'<span class="t2">à répondre</span>':esc(x.b.name);
      return `<div class="dr-slot ${s.cls}${rep?' actif':''}"><div class="lab">${num} · ${esc(MAJ(x.div.replace('Poids ','')))}</div><div class="dr-noms"><span class="l1 j1t">${nomA}</span><span class="l1 j2t">${nomB}</span></div></div>`; }).join(''); };
  const tourDe=etat=>etat==='place'?placeur(3):(etat==='reponse'?(placeur(3)==='a'?'b':'a'):null);
  const liste=etat=>{
    if(etat==='pret') return `<div class="dr-pret"><div class="T">LA CARTE EST FAITE</div><div class="l1 t2">Six combats. Tout se joue d’un coup, puis vous regardez combat par combat.</div><div class="bouton jaune"><span class="T">LANCER LA SUPER CARTE</span><span class="k">Entrée</span></div></div>`;
    const t=tourDe(etat);
    let rows;
    if(etat==='reponse'){ const div=d[3].divId; rows=dispo(t).filter(f=>f.div===div).slice(0,8).map(f=>({name:f.name,rang:f.rang,rec:rec(f),age:f.age,forme:f.forme,div:DIV(div)})); }
    else { const autre=t==='a'?'b':'a', en=new Set(dispo(autre).map(f=>f.div));
      rows=dispo(t).filter(f=>en.has(f.div)&&f.div===DIVS.find(x=>en.has(x.id)).id).slice(0,8).map(f=>({name:f.name,rang:f.rang,rec:rec(f),age:f.age,div:DIV(f.div)})); }
    const ent=etat==='reponse'?`<div class="dr-filtre l1">Seulement les ${esc(d[3].div.toLowerCase())}s disponibles · en face : <span class="nom">${esc(t==='a'?d[3].b.name:d[3].a.name)}</span></div>`
      :`<div class="onglets petits">${DIVS.slice(0,6).map((x,i)=>`<div class="ong${i===0?' on':''}">${esc(MAJ(x.label.replace('Poids ','')))}</div>`).join('')}<div class="ong">AUTRES ›</div></div>`;
    return `${ent}<div class="dr-l dr-h"><div class="ef-r lab">Rang</div><div class="dr-n lab">Combattant</div><div class="ef-b lab">Bilan</div><div class="ef-a lab">Âge</div><div class="dr-d lab">Catégorie</div></div>`
      +rows.map((f,i)=>`<div class="dr-l${i===0?' on':''}"><div class="ef-r T">${f.rang||'—'}</div><div class="dr-n l1">${esc(f.name)}</div><div class="ef-b l1">${f.rec}</div><div class="ef-a l1 t2">${f.age} ans</div><div class="dr-d l2">${esc(f.div)}</div></div>`).join(''); };
  const enFace=etat=>{ const t=tourDe(etat)||'a', autre=t==='a'?'b':'a';
    const n=dv=>dispo(autre).filter(f=>f.div===dv).length;
    return `<div class="sous">Chez ${esc(cote(autre).nom)}</div><div class="l2">disponibles par catégorie</div>`+DIVS.map(x=>`<div class="ef-mini${n(x.id)?'':' zero'}"><span class="l2">${esc(x.label.replace('Poids ','').replace(' féminin',' F'))}</span><b class="l1">${n(x.id)}</b></div>`).join(''); };
  const vue=etat=>{ const t=tourDe(etat);
    const bandeau=t?`<div class="tour ${cote(t).cls}"><span class="T">À ${esc(MAJ(cote(t).nom))} DE ${etat==='reponse'?'RÉPONDRE':'PLACER'}</span>${etat==='reponse'?`<span class="l1">à ${esc(d[3].place==='a'?d[3].a.name:d[3].b.name)} · ${esc(d[3].div)}</span>`:'<span class="l1">dans une catégorie où l’autre peut répondre</span>'}</div>`
      :`<div class="tour pret"><span class="T">SUPER CARTE ${2} · ${esc(MAJ(A.nom))} × ${esc(MAJ(B.nom))}</span></div>`;
    return `<div class="dr" data-etat="${etat}">
      ${pan('dr-carte',`${titre('LA CARTE','6 COMBATS')}${slots(etat)}`)}
      <div class="dr-milieu">${bandeau}${pan('dr-liste',liste(etat))}</div>
      ${pan('dr-face',enFace(etat))}</div>`; };
  const corps=`${entete(`Super carte · ${versus}`,droiteSaison(1,2))}
  <main class="contenu large">${['place','reponse','pret'].map(vue).join('')}</main>
  ${touches([[['←','→'],'Catégorie'],[['↑','↓'],'Combattant'],[['Retour'],'Annuler le dernier choix'],[['Échap'],'Retour au QG'],[['Entrée'],'Choisir',true]])}`;
  page('DuoDraft','Duo — le draft de la super carte','place reponse pret',corps);
}

/* ======================================================================================
   6. DuoSoiree — avant · resultat · principal
   ====================================================================================== */
{
  const c=C2;
  const face=(i,etat)=>{
    const x=c.draft[i], r=c.resultats[i], avant=i>0?c.resultats[i-1]:{sa:0,sb:0};
    const vu=etat==='resultat';
    const sa=vu?r.sa:avant.sa, sb=vu?r.sb:avant.sb;
    const cot=(k)=>{ const s=cote(k), f=k==='a'?x.a:x.b, gagne=vu&&r.winner===(k==='a'?'A':'B'), perd=vu&&r.winner===(k==='a'?'B':'A');
      return `<div class="so-cote ${s.cls}${gagne?' gagne':''}${perd?' perd':''}"><div class="bande"></div><div class="lab">${esc(MAJ(s.org.nom))} · ${esc(MAJ(s.nom))}</div>
        <div class="T so-nom">${esc(MAJ(f.name.split(' ').slice(-1)[0]))}</div><div class="so-prenom l1">${esc(f.name.split(' ').slice(0,-1).join(' '))}</div>
        <div class="so-rec"><div class="lab">Bilan avant le combat</div><div class="T">${f.rec.split('-').map((v,j)=>`<span>${v}</span>`).join('<i>-</i>')}</div></div>
        <div class="so-tuiles"><div class="tuile"><div class="lab">Chez ${esc(s.org.nom)}</div><div class="T">${f.rang===1?'N° 1':(f.rang?ord(f.rang)+' de sa catégorie':'Hors classement')}</div></div><div class="tuile"><div class="lab">Âge</div><div class="T">${f.age} ANS</div></div></div>
        ${gagne?'<div class="so-verdict T">VAINQUEUR</div>':''}</div>`; };
    const num=i===5?'COMBAT PRINCIPAL':'COMBAT '+(6-i);
    const bas=vu?`<div class="so-res"><div class="T">${esc(MAJ((r.winner==='A'?x.a:x.b).name))} BAT ${esc(MAJ((r.winner==='A'?x.b:x.a).name))}</div><div class="l1">${esc(r.methode)}</div></div>
        <div class="so-boutons"><div class="bouton jaune"><span class="T">${i===5?'LE BILAN':'COMBAT SUIVANT'}</span><span class="k">Entrée</span></div><div class="bouton"><span class="T">REVOIR</span><span class="k">R</span></div></div>`
      :`<div class="so-boutons"><div class="bouton jaune"><span class="T">REGARDER</span><span class="k">Entrée</span></div><div class="bouton"><span class="T">RÉSULTAT</span><span class="k">P</span></div></div>`;
    return `<div class="so" data-etat="${etat==='resultat'?'resultat':(i===5?'principal':'avant')}">
      <div class="so-haut"><div class="col"><div class="lab">Super carte 2 · ${esc(c.superDate.toLowerCase())}</div><div class="T so-num">${num}</div><div class="l2">${esc(x.div)} · ${i===5?'5 rounds':'3 rounds'}</div></div>
        <div class="so-score"><span class="lab">${esc(MAJ(NA))}</span><span class="T j1c">${sa}</span><span class="T t2">–</span><span class="T j2c">${sb}</span><span class="lab">${esc(MAJ(NB))}</span></div></div>
      <div class="so-face">${cot('a')}<div class="so-vs T">VS</div>${cot('b')}</div>
      <div class="so-pied">${bas}</div></div>`; };
  const corps=`${entete(`La super carte · ${versus}`,droiteSaison(1,2))}
  <main class="contenu large">${face(2,'avant')}${face(2,'resultat')}${face(5,'principal')}</main>
  ${touches([[['Entrée'],'Regarder',true],[['P'],'Résultat'],[['Échap'],'Retour au QG']])}`;
  page('DuoSoiree','Duo — la soirée de la super carte','avant resultat principal',corps);
}

/* ======================================================================================
   7. DuoBilan — carte · saison
   ====================================================================================== */
{
  const bilan=(c,n,etat)=>{
    const g=c.score.a>c.score.b?'a':(c.score.b>c.score.a?'b':null);
    const ligne=(x,i)=>{ const r=c.resultats[i], w=r.winner;
      return `<div class="bi-l"><div class="lab bi-num">${i===5?'PRINCIPAL':'COMBAT '+(6-i)}</div><div class="bi-n l1 ${w==='A'?'gagne':''}"><span class="pt j1"></span>${esc(x.a.name)}</div><div class="bi-n l1 ${w==='B'?'gagne':''}"><span class="pt j2"></span>${esc(x.b.name)}</div><div class="bi-m l2">${esc(x.div)} · ${esc(r.methode)}</div><div class="aller">Revoir ›</div></div>`; };
    const s4=scoreSaison(4), gs=s4.a>s4.b?'a':(s4.b>s4.a?'b':null);
    const saison=etat==='saison'?pan('bi-saison',`${titre('LA SAISON 1','4 SUPER CARTES')}
      <div class="bi-gros"><span class="T j1c">${s4.a}</span><span class="T t2">–</span><span class="T j2c">${s4.b}</span></div>
      <div class="T bi-sw ${gs?cote(gs).cls+'c':''}">${gs?esc(MAJ(cote(gs).nom))+' REMPORTE LA SAISON 1':'SAISON 1 : ÉGALITÉ'}</div>
      ${D.cartes.map((k,i)=>`<div class="ligne"><div class="l1">Super carte ${i+1} · ${esc(k.superDate.toLowerCase())}</div><div class="l1">${k.score.a} – ${k.score.b}</div></div>`).join('')}
      <div class="bi-argent"><div class="sous">Gagné sur la saison</div>
        <div class="ligne"><div class="l1">${tag('a')} ${esc(A.nom)}</div><div class="T bi-g">+ ${euros(D.cartes.reduce((t,k)=>t+k.gains.aK,0))}</div></div>
        <div class="ligne"><div class="l1">${tag('b')} ${esc(B.nom)}</div><div class="T bi-g">+ ${euros(D.cartes.reduce((t,k)=>t+k.gains.bK,0))}</div></div></div>`)
      :pan('bi-saison',`${titre('LA SAISON 1',`APRÈS ${n} SUPER CARTE${n>1?'S':''}`)}
      <div class="bi-gros"><span class="T j1c">${scoreSaison(n).a}</span><span class="T t2">–</span><span class="T j2c">${scoreSaison(n).b}</span></div>
      <div class="l1 t2">Prochaine super carte : ${esc(c.superProchaine.toLowerCase())}</div>
      <div class="bi-argent"><div class="sous">L’argent de la super carte</div>
        <div class="ligne"><div class="l1">${tag('a')} ${esc(A.nom)}</div><div class="T bi-g">+ ${esc(c.gains.a)}</div></div>
        <div class="ligne"><div class="l1">${tag('b')} ${esc(B.nom)}</div><div class="T bi-g">+ ${esc(c.gains.b)}</div></div></div>
      ${pan('bi-rec',`<div class="sous">Recrues des enchères</div><div class="l1">${(()=>{ const L=c.lots[0], pr=C1.score.a>C1.score.b?'b':(C1.score.b>C1.score.a?'a':'b'), w=pr==='a'?'b':'a'; return `${tag(w)} signe <span class="nom">${esc(L.name)}</span> · ${esc(L.ouvertureTxt)}`; })()}</div>`)}`);
    return `<div class="bi" data-etat="${etat}">
      <div class="bi-bandeau ${g?cote(g).cls:'nul'}"><span class="T">${g?esc(MAJ(cote(g).nom))+' REMPORTE LA SUPER CARTE '+n:'ÉGALITÉ À LA SUPER CARTE '+n}</span><span class="T bi-sc">${c.score.a} – ${c.score.b}</span></div>
      <div class="bi-cols">${pan('bi-liste',`${titre('LES SIX COMBATS',esc(c.superDate))}<div class="bi-l bi-h"><div class="lab bi-num"></div><div class="bi-n lab">${esc(MAJ(NA))} · ${esc(MAJ(A.nom))}</div><div class="bi-n lab">${esc(MAJ(NB))} · ${esc(MAJ(B.nom))}</div><div class="bi-m lab">Comment</div><div></div></div>${c.draft.map(ligne).join('')}`)}${saison}</div>
      <div class="bi-bas"><div class="bouton jaune"><span class="T">RETOUR AU QG</span><span class="k">Entrée</span></div></div></div>`; };
  const corps=`${entete(`Le bilan · ${versus}`,droiteSaison(1,2).replace('<span class="T rouge">2</span>','<span class="T rouge" data-etat="carte">2</span><span class="T rouge" data-etat="saison">4</span>'))}
  <main class="contenu large">${bilan(C2,2,'carte')}${bilan(C4,4,'saison')}</main>
  ${touches([[['↑','↓'],'Combat'],[['R'],'Revoir'],[['Entrée'],'Retour au QG',true]])}`;
  page('DuoBilan','Duo — le bilan de la super carte','carte saison',corps);
}
