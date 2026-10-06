"use strict";
/* ==== [ANCRE: MGMT_LOT3_T5_HISTORIQUE] — Lot 3 T5 : fiche consultable,
   combats passés et rejeu à partir de leurs traces auto-portantes. ==== */
let MGMT_FICHE={id:null,retour:'mgmt_carte',cursor:0};
/* ==== [ANCRE: MGMT_LOT4_T5_FICHE] — Lot 4 T5 : lecture dérivée, rejeux
   gardés seulement en mémoire par identité de trace ; jamais en sauvegarde. ==== */
const MGMT_FICHE_REJEUX=new WeakMap();
function mgmtFicheRejeu(t){
  if(!MGMT_FICHE_REJEUX.has(t)) MGMT_FICHE_REJEUX.set(t,{replay:mgmtReplayFight(t)});
  return MGMT_FICHE_REJEUX.get(t).replay;
}
function mgmtFicheLigne(m,id){
  const f=mgmtFighterById(m,id);
  if(f) return {f,trace:null};
  const line=Array.isArray(m.exterieur)&&m.exterieur.find(o=>o.id===id);
  if(!line) return null;
  const trace=mgmtExteriorTrace(line,m.cycle);
  if(!trace) return null;
  return {f:{id:line.id,div:line.div,divName:divById(line.div).name,ck:line.ck,generation:line.generation,
    name:trace.name,first:trace.first,last:trace.last,age:trace.age,
    W:trace.pro.W,L:trace.pro.L,D:0},trace};
}
function mgmtFicheSituation(m,f,scope){
  const rank=mgmtDivisionRank(m,f,scope);
  if(rank===null) return 'Hors classement';
  return rank===16?'Aux portes du top 15':mgmtRankLabel(rank,f.div);
}
function mgmtFicheZones(m,f){
  /* La carte décrit sa forme récente : dix combats au plus, sans limiter
     l'historique ni les liens Revoir. */
  const hist=mgmtFightHistory(m,f).slice(-10), zones=mgmtFicheZonesVides();
  for(const t of hist){
    const side=t.a.id===f.id?'A':'B';
    const part=mgmtFicheZonesCombat(t,side);
    for(let i=0;i<3;i++) zones.rings[i]+=part.rings[i];
    for(let i=0;i<8;i++){
      zones.bord[i]+=part.bord[i];
      zones.pin[i].count+=part.pin[i].count;
      zones.pin[i].x+=part.pin[i].x;
      zones.pin[i].y+=part.pin[i].y;
    }
  }
  return zones;
}
/* Trois couronnes selon le rayon physique (mètres) : centre < 38 % du
   rayon inscrit de l'arène, mi-espace < 74 %, bord au-delà. Huit angles
   ÉGAUX ne servent qu'à situer le rouge ; ils ne pondèrent pas la présence.
   Les positions proviennent exclusivement d'areneMoment (lot 3 T3). */
function mgmtFicheZonesVides(){
  return {rings:[0,0,0],bord:Array(8).fill(0),
    pin:Array.from({length:8},()=>({count:0,x:0,y:0}))};
}
function mgmtFicheZoneAjouter(z,own,opp,phase,posClinch){
  const r=Math.hypot(own.x,own.y);
  const ring=r<ARENE_RS*0.38?0:r<ARENE_RS*0.74?1:2;
  z.rings[ring]++;
  if(ring!==2) return;
  const angle=(Math.atan2(own.y,own.x)+Math.PI*2)%(Math.PI*2);
  const sector=Math.floor(angle*8/(Math.PI*2));
  z.bord[sector]++;
  if((phase==='clinch'&&posClinch==='cage'||phase==='debout')
    &&areneBordDist(own)<0.75&&areneBordDist(own)<areneBordDist(opp)){
    z.pin[sector].count++;
    z.pin[sector].x+=own.x;
    z.pin[sector].y+=own.y;
  }
}
function mgmtFicheZonesCombat(t,side){
  const replay=mgmtFicheRejeu(t), cached=MGMT_FICHE_REJEUX.get(t);
  if(cached[side]) return cached[side];
  const zones=mgmtFicheZonesVides();
  if(replay&&areneVerdictFidele(t,replay)){
    const session=areneConstruire(replay,{a:t.a.name,b:t.b.name});
    // L'arène fournit les coordonnées : on ne recalcule aucune trajectoire.
    for(let sec=5;sec<=session.dureeCombat;sec+=5){
      const e=areneMoment(session,sec), own=side==='A'?{x:e.ax,y:e.ay}:{x:e.bx,y:e.by};
      const opp=side==='A'?{x:e.bx,y:e.by}:{x:e.ax,y:e.ay};
      mgmtFicheZoneAjouter(zones,own,opp,e.phase,e.posClinch);
    }
  }
  cached[side]=zones;
  return cached[side];
}
function mgmtFicheOctogone(m,f){
  return mgmtFicheOctogoneZones(mgmtFicheZones(m,f));
}
function mgmtFicheOctogoneZones(zones){
  const total=zones.rings.reduce((sum,n)=>sum+n,0);
  if(!total) return '<div class="mgmt-fiche-empty">Aucune trajectoire enregistrée.</div>';
  /* Trois anneaux pleins, sans direction jaune arbitraire. La lumière
     reflète la part de temps réellement passée dans chaque couronne. */
  const light=n=>n?(0.16+0.6*n/total).toFixed(2):'0';
  const marks=`<circle cx="100" cy="100" r="80" fill="none" stroke="var(--mgmt-yellow)" stroke-width="20" opacity="${light(zones.rings[2])}"/>`
    +`<circle cx="100" cy="100" r="52" fill="none" stroke="var(--mgmt-yellow)" stroke-width="35" opacity="${light(zones.rings[1])}"/>`
    +`<circle cx="100" cy="100" r="34" fill="var(--mgmt-yellow)" opacity="${light(zones.rings[0])}"/>`;
  /* Rouge : au moins 3 instants, 25 % du temps sur CET angle du bord et
     5 % de tout le temps au bord. La direction est la moyenne des vraies
     coordonnées d'enfermement, jamais le centre d'une case. */
  const borderTotal=zones.rings[2];
  const eligible=zones.pin.map((p,i)=>({p,i})).filter(({p,i})=>p.count>=3
    &&p.count/zones.bord[i]>=0.25&&p.count/borderTotal>=0.05);
  let danger='';
  if(eligible.length){
    /* Des angles à égalité se combinent : un départage par numéro de
       secteur ferait pencher la carte d'un côté même sur son miroir. */
    const max=Math.max(...eligible.map(({p})=>p.count));
    const {x,y}=eligible.filter(({p})=>p.count===max)
      .reduce((sum,{p})=>({x:sum.x+p.x,y:sum.y+p.y}),{x:0,y:0});
    const len=Math.hypot(x,y);
    if(len>0){
      const cx=(100+83*x/len).toFixed(1),cy=(100+83*y/len).toFixed(1);
      danger=`<circle class="mgmt-fiche-pin" cx="${cx}" cy="${cy}" r="15" fill="var(--mgmt-red)" opacity="0.9"/>`;
    }
  }
  return `<div class="mgmt-fiche-map"><svg viewBox="0 0 200 200" role="img" aria-label="Zones de combat : jaune, présence ; rouge, enfermé contre le grillage">`
    +`<defs><clipPath id="mgmt-fiche-oct"><polygon points="62,8 138,8 192,62 192,138 138,192 62,192 8,138 8,62"/></clipPath></defs>`
    +`<polygon points="62,8 138,8 192,62 192,138 138,192 62,192 8,138 8,62" fill="var(--mgmt-plum-deep)" stroke="var(--mgmt-edge)" stroke-width="2"/>`
    +`<g clip-path="url(#mgmt-fiche-oct)">${marks}${danger}</g></svg><span>Jaune : zones de combat.<br>Rouge : contre le grillage.</span></div>`;
}
function mgmtFicheParcours(trace){
  if(!trace) return '';
  const duration=o=>{
    if(o.from===null||o.to===null) return '';
    const weeks=(o.to-o.from+1)*MGMT_EVENT_WEEKS;
    const span=weeks<MGMT_EXT_YEAR_WEEKS
      ?`${Math.max(1,Math.round(weeks*12/MGMT_EXT_YEAR_WEEKS))} mois`
      :`${(weeks/MGMT_EXT_YEAR_WEEKS).toFixed(1).replace('.',',')} ans`;
    const when=o.to<0?'Avant l’ouverture':o.from<0?'Avant et depuis l’ouverture':'Depuis l’ouverture';
    return ` · ${when}, environ ${span}`;
  };
  const orgs=trace.orgs.map(o=>`<div class="mgmt-fiche-org"><strong>${o.name?esc(o.name):''}</strong>`
    +`${o.fights?` · ${esc(o.fights)} ${o.fights===1?'combat':'combats'}`:''}`
    +`${duration(o)}</div>`).join('');
  return `<aside class="mgmt-fiche-side"><h3>Sa trajectoire</h3><div class="mgmt-fiche-org">Amateur · ${esc(trace.amateur.W)}-${esc(trace.amateur.L)}</div>`
    +orgs+`<div class="mgmt-fiche-org">Professionnel · ${esc(trace.pro.W)}-${esc(trace.pro.L)}</div></aside>`;
}
function mgmtBureauFicheCard(m,f){
  if(!f) return '';
  return `<div class="opp" style="cursor:default">${mgmtLineCard(f)}`
    +`<button class="mgmt-next" style="width:auto;padding:6px 12px;margin:8px 0 0;font-size:13px" onclick="CL.mgmtFicheParIndex(${m.roster.indexOf(f)})">Voir la fiche</button></div>`;
}
function mgmtHistoriqueHtml(m,f){
  const history=mgmtFightHistory(m,f).slice().reverse();
  if(!history.length) return `<div class="mgmt-meta">Aucun combat enregistré.</div>`;
  return history.map((t,k)=>{
    const i=m.hist.indexOf(t), side=t.a.id===f.id?'A':'B';
    const adversaire=side==='A'?t.b:t.a;
    const issue=t.winner==='D'?'Nul':(t.winner===side?'Victoire':'Défaite');
    /* La trace ne garde que la famille ; le moteur reconstitue le libellé
       exact. En cas de divergence après évolution du moteur, l'issue stockée
       prévaut et aucun résultat rejoué contradictoire n'est affiché. */
    const replay=mgmtFicheRejeu(t);
    const methode=(replay&&areneVerdictFidele(t,replay))?replay.method:(MGMT_FAMILY_LABELS[t.family]||t.family);
    return `<div class="mgmt-fiche-fight${k===MGMT_FICHE.cursor?' selected':''}">`
      +`<div><strong>${esc(issue)} · ${esc(adversaire.name)}</strong>`
      +`<div class="mgmt-fiche-detail">${esc(methode)} · Round ${esc(t.round)} · Cycle ${esc(t.c)}</div></div>`
      +`<button class="mgmt-next" onclick="CL.mgmtHistoriqueRevoir(${i})">Revoir</button>`
      +`</div>`;
  }).join('');
}
/* ==== [ANCRE: MGMT_LOT5_H5_FICHE_VIE] — « Sa vie » : les moments que la
   presse ou lui-même relaie, du plus récent au plus ancien, libellé du
   catalogue tel quel. Aucun relais, aucune ligne : « On ne sait pas encore ».
   Pas de charge, pas de jauge. ==== */
function mgmtFicheVie(m,f){
  const lignes=mgmtVieRelayes(m,f).slice(0,8);
  const corps=lignes.length
    ?`<ul class="mgmt-fiche-vie-liste">${lignes.map(x=>`<li>${esc(x.moment.libelle)} <span class="mgmt-fiche-vie-relais">${esc(x.moment.relais.join(' · '))}</span></li>`).join('')}</ul>`
    :'<p>On ne sait pas encore.</p>';
  return `<h3 class="mgmt-fiche-vie">Sa vie</h3>${corps}`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: MGMT_LOT5_H6_FICHE_ATTENTION] — Le rôle en un mot, ton cercle
   et tes suivis, la connaissance progressive (« Comment il combat » une fois
   vu, « Sa faille » après deux combats vus, sinon « On ne sait pas encore »).
   Ni jauge ni pourcentage. ==== */
function mgmtFicheLien(m,f){
  const lien=mgmtLien(m,f.id), id=esc(f.id);
  const cercle=lien==='cercle', suivi=lien==='suivi';
  return `<div class="mgmt-fiche-lien">`
    +`<button class="mgmt-fiche-lien-cercle${cercle?' on':''}" aria-pressed="${cercle}" onclick="CL.mgmtCercle('${id}')">Ton cercle · ${esc(mgmtCercle(m).length)}/${MGMT_CERCLE_MAX}</button>`
    +(cercle?'':`<button class="mgmt-fiche-lien-suivi${suivi?' on':''}" aria-pressed="${suivi}" onclick="CL.mgmtSuivre('${id}')">Tes suivis · ${esc(mgmtSuivis(m).length)}/${MGMT_SUIVIS_MAX}</button>`)
    +`</div>`;
}
function mgmtFicheConnaissance(m,f){
  const k=mgmtConnaissance(m,f);
  const inconnu='<p>On ne sait pas encore.</p>';
  let combat=inconnu, faille=inconnu;
  if(k.combat){ const c=mgmtCommentIlCombat(f); combat=`<p>${esc(c.style)} · garde ${esc(c.garde)}</p>`; }
  if(k.faille){ faille=`<p>${esc(mgmtSaFaille(f))}</p>`; }
  return `<h3>Comment il combat</h3>${combat}<h3>Sa faille</h3>${faille}`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: MGMT_LOT5_H7_FICHE_PROMESSES] — Le mot du combattant, ce qu'il
   demande (promettre ou refuser), ses promesses et leur état. Jamais un chiffre. ==== */
function mgmtFichePromesses(m,f){
  if(m.effectifs!==1) return '';
  const demandes=mgmtDemandesOuvertes(m).filter(d=>d.a===f.id);
  const prom=mgmtPromesses(m,f);
  if(!demandes.length&&!prom.length) return '';
  const lib=w=>MGMT_DEMANDES[w]?MGMT_DEMANDES[w].libelle:'';
  const nom=id=>{ const o=id&&mgmtFighterById(m,id); return o?o.name:''; };
  const etats={tenue:'Promesse tenue',rompue:'Promesse rompue','en cours':'Promesse en cours'};
  return `<h3>Ce qu'il demande</h3>`
    +(demandes.length?demandes.map(d=>`<p>${esc(lib(d.want))}${d.target?' — '+esc(nom(d.target)):''}</p>`
      +`<div class="mgmt-fiche-lien"><button onclick="CL.mgmtDemande(${esc(d.i)},'promettre')">Promettre</button>`
      +`<button onclick="CL.mgmtDemande(${esc(d.i)},'refuser')">Refuser</button></div>`).join('')
      :'<p>Rien pour le moment.</p>')
    +(prom.length?`<ul class="mgmt-fiche-vie-liste">${prom.map(p=>`<li>${esc(etats[p.etat])} : ${esc(lib(p.want))}${p.target?' — '+esc(nom(p.target)):''}</li>`).join('')}</ul>`:'');
}
/* ==== [FIN ANCRE] ==== */
/* ==== [ANCRE: MGMT_LOT5_H8_FICHE_ETENDUE] — La fiche devient l'écran le plus
   riche (contrat §4) : son histoire (milieu, ancien métier — le catalogue tel
   quel) et son corps (disponibilité, blessures et suspensions gardées comme
   faits). Ni jauge ni chiffre. ==== */
function mgmtFicheHistoire(identite){
  return `<h3>Son histoire</h3><p>Milieu : ${esc(identite.milieu)}</p><p>Ancien métier : ${esc(identite.metier)}</p>`;
}
function mgmtFicheCorps(m,f){
  const ligne=m.roster.find(o=>o.id===f.id);
  if(!ligne) return '';
  const faits=(m.facts||[]).filter(x=>x&&x.a===f.id&&(x.k==='injury'||x.k==='susp'||x.k==='retired'))
    .sort((a,b)=>b.c-a.c).slice(0,5);
  const dispo=mgmtAvailable(m,ligne)?'Disponible':'Indisponible';
  return `<h3>Son corps</h3><p>${esc(dispo)}</p>`
    +(faits.length?`<ul class="mgmt-fiche-vie-liste">${faits.map(x=>`<li>${esc(MGMT_FACT_LABELS[x.k])} <span class="mgmt-fiche-vie-relais">cycle ${esc(x.c)}</span></li>`).join('')}</ul>`:'');
}
/* ==== [FIN ANCRE] ==== */
function scr_mgmt_fiche(){
  const m=G&&G.mgmt, line=m&&mgmtFicheLigne(m,MGMT_FICHE.id);
  if(!line) return scr_mgmt_bureau();
  const {f,trace}=line;
  const identite=mgmtIdentite(m,f),pays=COUNTRIES[mgmtIdentitePays(f)],role=mgmtRole(m,f),mot=(m.effectifs===1&&mgmtConnaissance(m,f).combat)?mgmtTraitMot(m,f):null;
  const profile=mgmtCombatProfile(f).phys, org=trace?(trace.orgs[trace.orgs.length-1].name||''):mgmtOrgNom(m);
  const record=`${f.W}-${f.L}${f.D?'-'+f.D:''}`;
   const mondial=divById(f.div)?.gender==='F'?'mondiale':'mondial';
   const worldRank=mgmtFicheSituation(m,f,'world');
   const worldText=/^\d/.test(worldRank)?`${worldRank} ${mondial}`:`${mondial} : ${worldRank}`;
   const ranks=trace?worldText
         :`Chez ${mgmtOrgNom(m)} : ${mgmtFicheSituation(m,f,'organization')} · ${worldText}`;
  const attrs=[['Bilan',record],['Taille',`${(profile.height/100).toFixed(2).replace('.',',')} m`],
    ['Allonge',`${(profile.reach/100).toFixed(2).replace('.',',')} m`]];
   return `<div class="scr mgmt-wrap mgmt-fiche"><div class="mgmt-head bar">`
     +`<h2 class="disp">La fiche</h2><span class="mgmt-week-event">${esc(mgmtOrgNom(m))} ${esc(m.eventsPlayed+1)}</span></div>`
     +`<button class="mgmt-fiche-retour" onclick="CL.mgmtFicheRetour()">← Retour</button>`
      +`<div class="mgmt-fiche-hero"><div><h2 class="disp">${esc(f.name)} <span class="mgmt-fiche-surnom">« ${esc(identite.surnom)} »</span>${role?` <span class="mgmt-fiche-role">${esc(role.libelle)}</span>`:''}${mot?` <span class="mgmt-fiche-mot">${esc(mot)}</span>`:''}</h2>`
     +`<p><span class="mgmt-fiche-origine">de ${esc(identite.ville)} · ${esc(pays.name)}</span><br>${esc(mgmtDivisionLabel(f.div))}${org?' · '+esc(org):''} · ${esc(f.age)} ans · garde ${profile.stance==='southpaw'?'gaucher':'orthodoxe'}<br>${esc(ranks)}</p>${mgmtFicheLien(m,f)}</div>`
     +`<div class="mgmt-fiche-attrs">${attrs.map(([label,value])=>`<div><strong>${esc(value)}</strong><span>${label}</span></div>`).join('')}</div></div>`
     +`<div class="mgmt-cols mgmt-fiche-cols${trace?'':' mgmt-fiche-no-trace'}"><section class="mgmt-fiche-side"><h3>Où il combat</h3>${mgmtFicheOctogone(m,f)}</section>`
    +`<section class="mgmt-fiche-history"><h3>Ses derniers combats</h3>${mgmtHistoriqueHtml(m,f)}${mgmtFicheHistoire(identite)}${mgmtFicheCorps(m,f)}${mgmtFicheCamp(m,f)}${mgmtFicheConnaissance(m,f)}${mgmtFichePromesses(m,f)}${mgmtFicheRivaux(m,f)}${mgmtFicheParole(m,f)}${mgmtFicheVie(m,f)}</section>`
    +`${mgmtFicheParcours(trace)}</div></div>`;
}
/* ==== [FIN ANCRE] ==== */
/* ==== [FIN ANCRE] ==== */
