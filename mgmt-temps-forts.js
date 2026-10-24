"use strict";
/* ==== [ANCRE: P7_T2_TEMPS_FORTS] — Monde lot 49 T1 ==== */
const MGMT_TF_TYPES=['ko','knockdown','soumission','coup-lourd','reprise','finition'];
const MGMT_TF_VITESSE=8;
function mgmtTempsFortsLargeur(nombre,duree){return Math.max(3,Math.min(6,(45-duree/MGMT_TF_VITESSE)*MGMT_TF_VITESSE/(Math.max(1,nombre)*(MGMT_TF_VITESSE-1))));}
const MGMT_TF_TEXTES={relu:false, debut:['Le combat s’ouvre','Les deux combattants prennent place','La première reprise commence'],ko:['Le KO met fin au combat','Le KO conclut l’échange','Le KO change la soirée'],knockdown:['Un knockdown fait basculer le round','Le knockdown envoie son adversaire au tapis','Un knockdown marque le combat'],soumission:['La soumission force l’arrêt','La tentative de soumission devient décisive','La soumission trouve son issue'], 'coup-lourd':['Un coup lourd secoue le combat','Le coup lourd fait reculer son adversaire','Un impact lourd marque l’échange'],reprise:['La reprise relance le combat','Les combattants repartent pour un round','La reprise ouvre une nouvelle séquence'],finition:['La finition arrête le combat','La finition scelle l’issue','Le combat s’achève sur cette finition']};
function mgmtTempsFortsChoisir(m,combat){
  const trace=combat&&combat.trace?combat.trace:combat;
  const result=trace&&typeof mgmtReplayFight==='function'?mgmtReplayFight(trace):null;
  const rounds=Math.max(1,Number.isSafeInteger(combat&&combat.rounds)?combat.rounds:Number.isSafeInteger(trace&&trace.rounds)?trace.rounds:3);
  const beats=result&&Array.isArray(result.log)?result.log:[];
  const candidates=[{t:0,round:1,type:'debut',poids:10}];
  for(const b of beats){
    if(!b||typeof b!=='object') continue;
    const round=Number.isSafeInteger(b.r)&&b.r>0?b.r:1;
    const tm=typeof areneTempsCombat==='function'?areneTempsCombat(b,0,1):0;
    const t=Math.max(0,Math.round((round-1)*300+tm));
    let type=null;
    if(b.finish){type=/ko|knockout/i.test(String(b.method||b.text))?'ko':b.sub||/sub|soumiss/i.test(String(b.method||b.text))?'soumission':'finition';}
    else if(/knockdown|knocked down|au tapis/i.test(String(b.kind||b.text))) type='knockdown';
    else if(b.sub||/soumission|submission/i.test(String(b.text))) type='soumission';
    else if(/heavy|lourd|KO/i.test(String(b.kind||b.text))) type='coup-lourd';
    if(type) candidates.push({t,round,type,poids:b.finish?100:60});
  }
  for(let r=2;r<=rounds;r++) candidates.push({t:(r-1)*300,round:r,type:'reprise',poids:20});
  const end=candidates.find(x=>x.type==='ko'||x.type==='soumission'||x.type==='finition')||{t:rounds*300,round:rounds,type:'finition',poids:100};
  const pool=candidates.filter(x=>x!==end&&x.t<end.t).sort((a,b)=>b.poids-a.poids||a.t-b.t);
  const kept=[candidates[0]];
  for(const c of pool){if(kept.length>=6)break;if(kept.every(x=>Math.abs(x.t-c.t)>=8))kept.push(c);}
  if(kept.every(x=>Math.abs(x.t-end.t)>=8)) kept.push(end); else kept[kept.length-1]=end;
  while(kept.length<4){const t=Math.max(0,end.t-8*(4-kept.length));if(kept.every(x=>Math.abs(x.t-t)>=8))kept.splice(kept.length-1,0,{t,round:Math.max(1,Math.floor(t/300)+1),type:'reprise',poids:10});else break;}
  kept.sort((a,b)=>a.t-b.t); kept[kept.length-1]=end;
  return kept.slice(0,8).map((x,i)=>{const type=x.type==='debut'?'reprise':x.type;const bank=MGMT_TF_TEXTES[type]||MGMT_TF_TEXTES.reprise;return {t:x.t,round:x.round,type:x.type,poids:x.poids,raison:MGMT_TF_TEXTES[x.type==='debut'?'debut':type][i%bank.length]};});
}
/* ==== [ANCRE: P7_T2_DUREE_TEMPS_FORTS] — Monde lot 49 T1 ==== */
function mgmtTempsFortsDuree(m,combat){
  const moments=mgmtTempsFortsChoisir(m,combat);
  const trace=combat&&combat.trace?combat.trace:combat;
  const replay=trace&&typeof mgmtReplayFight==='function'?mgmtReplayFight(trace):null;
  const scale=typeof MGMT_COMBAT_ECHELLE==='number'&&MGMT_COMBAT_ECHELLE>0?MGMT_COMBAT_ECHELLE:7;
  let duree=Number.isFinite(combat&&combat.dureeAffichage)?combat.dureeAffichage:Number.isFinite(trace&&trace.dureeAffichage)?trace.dureeAffichage:0;
  if(!duree&&replay&&typeof areneConstruire==='function'){
    const session=areneConstruire(replay,{a:trace.a.name,b:trace.b.name},{echelle:scale,pause:0});
    duree=session.dureeAffichage;
  }
  if(!duree)duree=moments[moments.length-1].t/scale;
  const fenetre=mgmtTempsFortsLargeur(moments.length,duree);
  const debut=moments.map(x=>Math.max(0,x.t/scale-fenetre/2)).sort((a,b)=>a-b);
  let temps=0, curseur=0;
  for(const start of debut){
    if(start>curseur) temps+=(start-curseur)/MGMT_TF_VITESSE;
    const end=Math.min(duree,start+fenetre);
    if(end>curseur){temps+=end-Math.max(curseur,start);curseur=end;}
  }
  if(duree>curseur)temps+=(duree-curseur)/MGMT_TF_VITESSE;
  return Math.round(temps);
}
/* ==== [ANCRE: P7_T2_DUREE_SOIREE] — Monde lot 53 T1 ==== */
/** Estimation pure du temps de lecture d'une carte, en secondes. */
function mgmtSoireeDureeEstimee(m){
  const prog=typeof mgmtSoireeProgramme==='function'?mgmtSoireeProgramme(m):[];
  return prog.reduce((total,p)=>{
    const vue=mgmtVueDuCombat(m,p.i);
    let duree=vue==='forts'?45:vue==='resultat'?5:0;
    if(vue==='complet'){
      const t=p.trace;
      const replay=t&&typeof mgmtReplayFight==='function'?mgmtReplayFight(t):null;
      if(replay&&typeof areneConstruire==='function'){
        const s=areneConstruire(replay,{a:t.a.name,b:t.b.name},{echelle:MGMT_COMBAT_ECHELLE,pause:MGMT_COMBAT_PAUSE});
        duree=s&&Number.isFinite(s.dureeAffichage)?s.dureeAffichage:0;
      }
    }
    return total+duree+10;
  },0);
}
function mgmtVueDuCombat(m,i){
  const options=typeof MGMT_REGLAGES!=='undefined'?MGMT_REGLAGES:null;
  const v=m&&m.vues&&m.vues[i]; if(['complet','forts','resultat'].includes(v))return v;
  if(options&&options.soiree&&options.soiree.vue==='entier')return 'complet';
  if(options&&options.soiree&&options.soiree.vue==='resultat')return 'resultat';
  const p=typeof mgmtSoireeProgramme==='function'?mgmtSoireeProgramme(m)[i]:null;
  return p&&p.nom===MGMT_SOIREE_TEXTES.principal||p&&p.nom===MGMT_SOIREE_TEXTES.coprincipal?'complet':'forts';
}
/* ==== [ANCRE: P7_T2_REGLAGE_VUE] — Monde lot 49 T1 ==== */
function mgmtVueCombatChoisir(i,vue){
  if(!G||!G.mgmt||!Number.isSafeInteger(i)||i<0||!['complet','forts','resultat'].includes(vue))return false;
  const m=G.mgmt;
  if(!m.vues)m.vues={};
  m.vues[i]=vue;
  if(typeof saveMgmt==='function')saveMgmt();
  if(typeof render==='function')render();
  return true;
}
/* ==== [FIN ANCRE] ==== */
