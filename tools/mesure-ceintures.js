"use strict";
/* Lot 5 T1 : vingt vraies soirées enchaînées par graine. Le joueur-type
   ne lit que disponibilités, classement, champion et défenses ; il choisit
   les titres explicitement par mgmtSetTitle, puis valide Leïla. Aucun
   attribut caché pour choisir, aucun reset du corps ni recrutement fictif.
   Usage : node tools/mesure-ceintures.js [--seed=20261002] [--n=3]
           [--soirees=20] [--out=tools/reports/LOT-5-T1-CEINTURES.md]
   Le JSON voisin garde les chiffres par soirée ; --save=chemin exporte
   la première partie mesurée pour la capture du vrai écran. */
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
const cfg={seed:20261002,n:3,soirees:20,out:'tools/reports/LOT-5-T1-CEINTURES.md',save:null};
for(const arg of process.argv.slice(2)){
  const match=/^--(seed|n|soirees|out|save)=(.+)$/.exec(arg);
  if(!match) throw new Error('Argument inconnu : '+arg);
  const key=match[1],value=match[2];
  cfg[key]=['out','save'].includes(key)?value:Number(value);
}
for(const key of ['seed','n','soirees']){
  if(!Number.isSafeInteger(cfg[key])||cfg[key]<1) throw new Error('Argument entier positif requis : '+key);
}

// Même sémantique de scripts classiques que le navigateur, ordre réel lu.
const dom=new JSDOM('<!doctype html><div id="app"></div>',{
  url:'https://cage-legacy.test/',runScripts:'dangerously',pretendToBeVisual:true,
});
const win=dom.window;
win.scrollTo=()=>{};
win.alert=()=>{};
win.confirm=()=>true;
win.TextEncoder=TextEncoder; win.TextDecoder=TextDecoder;
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const match of html.matchAll(/<script src="([^"]+)"><\/script>/g)){
  const file=match[1].split('?')[0];
  if(file==='main.js') continue;
  const script=win.document.createElement('script');
  script.textContent=fs.readFileSync(path.join(root,file),'utf8');
  win.document.body.appendChild(script);
}

try{
  const raw=win.eval(`JSON.stringify((()=>{
    const results=[],BASE=${cfg.seed},N=${cfg.n},K=${cfg.soirees};
    function compose(m){
      const groups=allDivisions().map(d=>({div:d.id,belt:mgmtSplitTitle(m,d.id),
        ranked:mgmtDivisionRanking(m,d.id,'organization').map(r=>mgmtFighterById(m,r.id))}));
      // Faire tourner les catégories, sans choisir un résultat ou un style.
      groups.sort((a,b)=>{
        const last=x=>x.belt.id?mgmtFighterById(m,x.belt.id).lastCycle??-1:-1;
        return last(a)-last(b)||a.div.localeCompare(b.div);
      });
      for(const group of groups){
        if(m.card.main.length>=m.card.sizeMain) break;
        const available=group.ranked.filter(f=>mgmtSelectable(m,f,null));
        const champion=group.belt.id?available.find(f=>f.id===group.belt.id):available[0];
        if(!champion) continue;
        const challenger=available.find(f=>f.id!==champion.id);
        if(!challenger) continue;
        const fight=mgmtBookMain(m,champion.id,challenger.id);
        if(fight&&!mgmtSetTitle(m,m.card.main.indexOf(fight),true)) throw new Error('Titre refusé');
      }
      while(m.card.main.length<m.card.sizeMain){
        const rows=mgmtCartRows(m).filter(f=>mgmtSelectable(m,f,null));
        let booked=false;
        for(const a of rows){
          const b=rows.find(f=>f.id!==a.id&&f.div===a.div);
          if(b&&mgmtBookMain(m,a.id,b.id)){ booked=true; break; }
        }
        if(!booked) return false;
      }
      mgmtOfferBulk(m,true);
      const bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open');
      return !!(bulk&&mgmtDecide(m,bulk.id,'validate')&&mgmtCardFull(m));
    }
    for(let i=0;i<N;i++){
      const seed=BASE+i; setSeed(seed);
      const m=mgmtDefault(); mgmtNewRoster(m); G=null;
      const evenings=[],split={changes:0,defenses:0,awards:0,draws:0,vacancies:0};
      let skipped=0;
      for(let attempt=0;attempt<K*10&&evenings.length<K;attempt++){
        mgmtNewPile(m);
        for(const aff of m.pile.slice()){
          if(aff.status==='open'&&aff.kind==='leila_propose') mgmtIgnore(m,aff.id);
        }
        m.card.main=[]; m.card.prelims=[];
        if(!compose(m)){ skipped++; continue; }
        const before=allDivisions().map(d=>mgmtSplitTitle(m,d.id));
        const first=m.hist.length,event=mgmtRunEvent(m);
        if(!event) throw new Error('Soirée complète refusée');
        const row={n:evenings.length+1,cycle:m.cycle,titles:0,changes:0,defenses:0,awards:0,draws:0,vacancies:0};
        for(const fact of m.facts.filter(f=>f.k==='title_fight'&&f.fight>=first)){
          const trace=m.hist[fact.fight],old=before.find(b=>b.div===fact.div);
          const winner=trace.winner==='A'?trace.a.id:(trace.winner==='B'?trace.b.id:null);
          row.titles++;
          if(!winner) row.draws++;
          else if(winner===old.id) row.defenses++;
          else if(old.id) row.changes++;
          else row.awards++;
        }
        row.vacancies=before.filter(b=>b.id&&!mgmtSplitTitle(m,b.div).id).length;
        for(const key of Object.keys(split)) split[key]+=row[key];
        evenings.push(row);
        if(!validateMgmt(m)) throw new Error('Sauvegarde invalide après soirée');
      }
      const exterior=MGMT_EXT_ORGS.map(org=>({org,changes:0,defenses:0,losses:0,transfers:0,retirements:0,awards:0,vacant:0}));
      for(const div of allDivisions()){
        const titles=mgmtExteriorTitles(m,div.id),pending=new Map();
        for(const event of titles.history){
          const row=exterior[event.orgIdx];
          if(event.type==='award'){
            if(event.c>0){
              if(pending.get(event.orgIdx)==='loss') row.changes++;
              else row.awards++;
            }
            pending.delete(event.orgIdx);
          }else{
            pending.set(event.orgIdx,event.type);
            if(event.c<=0) continue;
            if(event.type==='defense'){ row.defenses++; pending.delete(event.orgIdx); }
            else if(event.type==='loss') row.losses++;
            else if(event.type==='transfer') row.transfers++;
            else if(event.type==='retired') row.retirements++;
          }
        }
        for(const belt of titles.belts){ if(!belt.id) exterior[belt.orgIdx].vacant++; }
      }
      results.push({seed,played:evenings.length,cycle:m.cycle,skipped,split,exterior,evenings});
      if(i===0) window.__measuredSave=JSON.stringify(m);
    }
    return results;
  })())`);
  const results=JSON.parse(raw);
  const all=results.flatMap(r=>r.evenings);
  const totals=all.reduce((out,row)=>{
    for(const key of ['titles','changes','defenses','awards','draws','vacancies']) out[key]=(out[key]||0)+row[key];
    return out;
  },{});
  const lines=[
    '# Lot 5 T1 — Ceintures et combats de titre',
    '', '## Contrat et décisions', '',
    'Contrat : `docs/LOT-5-LE-MONDE-QUI-PARLE.md` §T1, repris au §7 du monde humain.',
    'Décisions d’Anthony du 02/10/2026 : premier classé champion initial de Split, zéro défense ; titre explicitement choisi ; premier combat de carte principale en cinq rounds ; extérieur dérivé des résultats existants, titre vacant attribué au premier classé actif, départ du champion = vacance.',
    'Maquette du nouveau geste validée : `maquettes/04b-combat-de-titre.html`.',
    'Cas limites validés le même jour : un nul conserve le titre sans défense gagnée ; un nul pour un titre vacant le laisse vacant. À l’extérieur, le champion battu ne reprend pas le titre pendant le même cycle, même s’il reste premier classé.',
    '', '## Protocole reproductible', '',
    '`node tools/mesure-ceintures.js --seed='+cfg.seed+' --n='+cfg.n+' --soirees='+cfg.soirees+'`',
    'Ordre des scripts lu dans index.html. Le moteur de combat reste intact. Chaque partie enchaîne les vraies soirées et leurs blessures, suspensions, bilans, vieillissement et retraites. Le joueur-type privilégie le champion disponible et le meilleur challenger classé disponible ; titre choisi par mgmtSetTitle ; préliminaires validés par le vrai geste de Leïla. Les catégories tournent par date du dernier combat du champion. Aucun résultat ne sert à choisir les paires.',
    'Une carte impossible attend un nouveau cycle : aucun corps réinitialisé ni combattant ajouté artificiellement. Les cycles d’attente sont publiés. Les extérieurs ne sont pas simulés par le moteur : les défenses sont leurs victoires de carrière déjà dérivées ; une défaite libère le titre, qui va au premier classé actif restant. Aucun adversaire de titre fictif n’est nommé.',
    '', '## Split — vingt soirées par partie', '',
  ];
  for(const result of results){
    const s=result.split;
    lines.push('- Graine '+result.seed+' : '+result.played+' soirées, jusqu’au cycle '+result.cycle
      +' ('+result.skipped+' cycles sans carte complète) ; '+s.changes+' changements, '+s.defenses
      +' défenses gagnées, '+s.awards+' titres vacants attribués, '+s.draws+' nuls, '+s.vacancies+' vacances après soirée.');
  }
  lines.push('', 'Total : '+totals.titles+' combats de titre, '+totals.changes+' changements de champion, '
    +totals.defenses+' défenses gagnées. Parmi les titres avec un champion et un vainqueur : '
    +(100*totals.changes/(totals.changes+totals.defenses)).toFixed(1)+' % de changements.',
    'Les attributions vacantes et retraites ne sont pas comptées comme des défaites de champion ; un nul ne gagne pas de défense.',
    '', '## Extérieur — même période de calendrier', '');
  for(let org=0;org<results[0].exterior.length;org++){
    const sums=results.reduce((out,r)=>{
      for(const key of ['changes','defenses','losses','transfers','retirements','awards','vacant']) out[key]=(out[key]||0)+r.exterior[org][key];
      return out;
    },{});
    lines.push('- '+results[0].exterior[org].org+' : '+sums.changes+' successions après défaite, '+sums.defenses
      +' défenses gagnées, '+sums.losses+' défaites de champion, '+sums.transfers+' départs vers une autre organisation, '
      +sums.retirements+' retraites, '+sums.awards+' autres attributions. '+sums.vacant+' ceintures vacantes au dernier cycle (sur '+cfg.n*12+' observations).');
  }
  const complete=results.every(r=>r.played===cfg.soirees);
  const balance=totals.changes>0&&totals.defenses>0;
  lines.push('', '## Verdict de la mesure', '',
    complete?'Les vingt soirées sont atteintes sur chaque graine.':'ÉCHEC : au moins une partie n’a pas atteint vingt soirées.',
    balance?'La mesure contient des champions battus et des défenses réussies : ni chute systématique, ni invincibilité systématique.':'ÉCHEC : une des deux issues sportives manque.',
    'Les chiffres détaillés par soirée et par graine sont conservés dans le JSON voisin. Le test de fidélité compare aussi le déroulé complet du rejeu en cinq rounds à l’original.',
    '', '## Persistance et intégration', '',
    '- Split : faits `title_initial` datés et `title_fight` référant le combat de `m.hist`. Aucun historique tronqué ; compteur et détenteur relus depuis ces faits.',
    '- Extérieur : seuls les cinq champs d’identité existants sont sauvegardés ; ceintures, défenses et chronologie sont éphémères.',
    '- Migration 10 → 11 : ceintures attribuées au classement courant, aucun ancien combat requalifié ; anciennes traces conservées avec leurs trois rounds.',
    '- **Intégration H3** : la version 11 est désormais prise par T1. La migration d’identité prévue 10 → 11 au contrat H3 devra partir de 11 → 12 après intégration de cette branche.',
    '- Charte : R1/H4, libellés factuels ; R4, case absente pour un titre impossible ; S5/S6, case native et retour immédiat avec focus conservé ; L2/L4, noms enroulés et texte lisible.',
    '',
  );
  const out=path.resolve(root,cfg.out);
  if(!fs.existsSync(path.dirname(out))) throw new Error('Répertoire de rapport absent');
  fs.writeFileSync(out,lines.join('\n'),'utf8');
  fs.writeFileSync(out.replace(/\.md$/i,'.json'),JSON.stringify({config:cfg,totals,results},null,2),'utf8');
  if(cfg.save){
    const save=path.resolve(root,cfg.save);
    if(!fs.existsSync(path.dirname(save))) throw new Error('Répertoire de sauvegarde de capture absent');
    fs.writeFileSync(save,win.__measuredSave,'utf8');
  }
  console.log(JSON.stringify({totals,parties:results.map(r=>({seed:r.seed,played:r.played,cycle:r.cycle})),rapport:cfg.out},null,2));
  if(!complete||!balance) process.exitCode=1;
}finally{ win.close(); }
