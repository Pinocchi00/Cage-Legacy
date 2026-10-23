"use strict";
/* ==== [ANCRE: P3_T2_ACTUALITES] — Monde lot 33 T2 ==== */
const MGMT_ACTU_SOURCES=[];
const MGMT_ACTU_LIBELLES={resultat:'RÉSULTAT',blessure:'BLESSURE',contrat:'CONTRAT',trait:'TRAIT',surnom:'SURNOM',record:'RECORD',rumeur:'RUMEUR',classement:'CLASSEMENT',espoir:'ESPOIR',rivale:'RIVALE'};
function mgmtActuSourceAjouter(src){
  if(!src||typeof src.type!=='string'||typeof src.lire!=='function'||MGMT_ACTU_SOURCES.some(x=>x.type===src.type)) return false;
  MGMT_ACTU_SOURCES.push(src); return true;
}
const MGMT_ACTU_RESULTATS={
win:{ko:['{n} met {a} K.-O. au round {r}','{p} arrête {a} avant la fin du round {r}','Round {r} : {p} envoie {a} au tapis pour de bon','{n} finit {a} par K.-O.','{p} n’a pas besoin de la fin : {a} s’écroule au round {r}','{a} ne se relève pas : {p} gagne par K.-O.'],sub:['{n} soumet {a} au round {r}','{p} fait abandonner {a} au round {r}','{a} tape : {p} l’emporte par soumission','Au sol, {p} ne lâche pas {a} et gagne par soumission','{n} met la main sur {a} et finit le travail au round {r}','{a} cède au round {r} : victoire de {p} par soumission'],stop:['{n} gagne : {a} ne peut pas continuer','Le médecin arrête le combat : {p} bat {a}','{a} est stoppé au round {r} : victoire de {p}','{p} l’emporte sur arrêt du combat contre {a}','Le combat s’arrête au round {r}, {p} est déclaré vainqueur','{a} ne repartira pas : {n} gagne'],dec:['{n} bat {a} aux points','{p} gagne à la décision contre {a}','{p} s’impose aux juges face à {a}','Décision pour {n} contre {a}','{p} va au bout et bat {a} aux points','Trois rounds, cinq rounds, peu importe : {p} gagne aux points contre {a}']},
loss:{ko:['{a} met {n} K.-O. au round {r}','{p} est arrêté par {a} au round {r}','Round {r} : {a} envoie {p} au tapis pour de bon','{a} finit {n} par K.-O.','{p} ne se relève pas : {a} gagne par K.-O.','{p} s’écroule face à {a} au round {r}'],sub:['{a} soumet {n} au round {r}','{p} abandonne face à {a} au round {r}','{p} tape : {a} l’emporte par soumission','Au sol, {a} ne lâche pas {p} et gagne par soumission','{a} met la main sur {n} et finit le travail au round {r}','{p} cède au round {r} : victoire de {a} par soumission'],stop:['{n} perd : il ne peut pas continuer','Le médecin arrête le combat : {a} bat {p}','{p} est stoppé au round {r} : victoire de {a}','{a} l’emporte sur arrêt du combat contre {p}','Le combat s’arrête au round {r}, {a} est déclaré vainqueur','{p} ne repartira pas : {a} gagne'],dec:['{a} bat {n} aux points','{p} s’incline à la décision contre {a}','{a} s’impose aux juges face à {p}','Décision pour {a} contre {n}','{p} va au bout mais {a} gagne aux points','Les juges donnent le combat à {a} contre {n}']},draw:{draw:['{n} et {a} se quittent sur un nul','Match nul entre {p} et {a}','Rien ne sépare {p} et {a} : nul','Les juges ne départagent pas {p} et {a}','{p} et {a} : égalité','Nul pour {p} face à {a}']}};
const MGMT_ACTU_BLESSURES=['{n} se blesse : {b}','{p} est touché : {b}','Mauvaise nouvelle pour {p} : {b}','{p} s’arrête : {b}','{n} passera un moment à l’écart : {b}','Infirmerie pour {p} : {b}'];
const MGMT_ACTU_CONTRATS={fin_contrat:['Le contrat de {n} arrive à son terme','{p} n’a plus de combat au contrat','Contrat terminé pour {p}','{n} finit son contrat','Plus rien au contrat de {p}','{p} arrive au bout de son contrat'],libere:['{n} est libre','{p} quitte l’effectif','{p} n’est plus sous contrat','{n} est sans contrat','{p} reprend sa liberté','Le contrat de {p} est rompu']};
function mgmtActuHash(s){let h=2166136261; for(const c of String(s)) h=Math.imul(h^c.charCodeAt(0),16777619); return h>>>0;}
function mgmtActuVariante(cle,type,sous,banque){
  const a=Array.isArray(banque)?banque:[]; if(!a.length)return '';
  const match=String(cle).match(/\|(\d+)$/),rang=match?Number(match[1]):0;
  let i=(mgmtActuHash(String(cle).replace(/\|\d+$/,''))+rang)%a.length;
  if(typeof sous==='string'&&sous.startsWith('prev:')&&a.length>1&&a[i]===sous.slice(5))i=(i+1)%a.length;
  return a[i];
}
function mgmtActuNom(m,id){const f=mgmtFighterById(m,id)||mgmtExteriorCombattant(m,id); if(f)return {n:f.name,p:f.first||f.name,org:f.org||null,div:f.div||null}; for(const t of m.hist||[]){for(const x of [t&&t.a,t&&t.b])if(x&&x.id===id)return {n:x.name||id,p:x.first||x.name||id,org:null,div:x.div||null};}for(const o of Object.values(m.orgs||{})){for(const t of o.hist||[])for(const x of [t&&t.a,t&&t.b])if(x&&x.id===id)return {n:x.name||id,p:x.first||x.name||id,org:null,div:x.div||null};}return null;}
mgmtActuSourceAjouter({type:'resultat',lire(m,ids,depuis){const out=[];const historiques=[...(m.hist||[]).map((t,i)=>({t,i})),...(m.mondeVivant?Object.values(m.orgs||{}).flatMap(o=>(o.hist||[]).map((t,i)=>({t,i}))):[])];const vus=new Set();for(const {t,i} of historiques){if(!t||!Number.isSafeInteger(t.c)||t.c<depuis||!t.a||!t.b)continue;for(const id of ids){const moi=t.a.id===id?t.a:t.b.id===id?t.b:null;if(moi){const uniq=t.c+'|'+i+'|'+id;if(vus.has(uniq))continue;vus.add(uniq);out.push({type:'resultat',c:t.c,id,adv:(moi===t.a?t.b:t.a).id,donnees:{combat:t,index:i}});}}}return out;} });
mgmtActuSourceAjouter({type:'blessure',lire(m,ids,depuis){return (m.facts||[]).filter(x=>x&&x.k==='injury'&&ids.includes(x.a)&&Number.isSafeInteger(x.c)&&x.c>=depuis).map(x=>({type:'blessure',c:x.c,id:x.a,donnees:x}));}});
mgmtActuSourceAjouter({type:'contrat',lire(m,ids,depuis){return (m.facts||[]).filter(x=>x&&['fin_contrat','libere','contrat'].includes(x.k)&&ids.includes(x.a)&&Number.isSafeInteger(x.c)&&x.c>=depuis).map(x=>({type:'contrat',c:x.c,id:x.a,donnees:x,sous:x.k}));}});
/* ==== [ANCRE: P2_T5_SURNOMS_GAGNES_ACTUALITES] — Monde lot 40 T1 ==== */
mgmtActuSourceAjouter({type:'surnom',lire(m,ids,depuis){return (m.facts||[]).filter(x=>x&&x.k==='surnom'&&ids.includes(x.a)&&Number.isSafeInteger(x.c)&&x.c>=depuis).map(x=>({type:'surnom',c:x.c,id:x.a,donnees:x}));}});
/* ==== [ANCRE: P10_T1_ACTUALITE_RIVALE] — Monde lot 45 T1 ==== */
mgmtActuSourceAjouter({type:'rivale',lire(m,ids,depuis){
  if(!m||!m.guerre||!m.guerre.rival||!ids.length||!Number.isSafeInteger(m.guerre.depuis)||m.guerre.depuis<depuis) return [];
  return [{type:'rivale',c:m.guerre.depuis,id:ids[0],donnees:{org:m.guerre.rival}}];
}});
function mgmtActualites(m,opts){
  if(!m||!Array.isArray(m.suivis)||!m.suivis.length)return [];
  opts=opts||{}; const ids=mgmtSuivis(m), cycles=Number.isSafeInteger(opts.cycles)&&opts.cycles>=0?opts.cycles:8, depuis=Math.max(0,(Number.isSafeInteger(m.cycle)?m.cycle:0)-cycles+1), brut=[];
  for(const s of MGMT_ACTU_SOURCES){try{brut.push(...s.lire(m,ids,depuis));}catch(e){}}
  const rang=new Map(), rows=[];
  const dernier=new Map();
   for(const x of brut){if(!x||!ids.includes(x.id)||!Number.isSafeInteger(x.c))continue; const moi=mgmtActuNom(m,x.id);if(!moi)continue;const k=x.type+'|'+x.c+'|'+x.id,n=(rang.get(k)||0)+1;rang.set(k,n);const cle=k+'|'+n, adversaire=mgmtActuNom(m,x.adv||''),a=adversaire?adversaire.n:(x.adv||''),d=x.donnees||{};let banque,vars,detail='';
     if(x.type==='resultat'){const t=d.combat||{},win=t.winner==='D'?'draw':((t.winner==='A'?t.a&&t.a.id:t.b&&t.b.id)===x.id?'win':'loss'),fam=t.family==='ko'?'ko':t.family==='sub'?'sub':t.family==='dec'?'dec':'stop'; banque=MGMT_ACTU_RESULTATS[win][win==='draw'?'draw':fam]; vars={n:moi.n,p:moi.p,a,r:t.round||1};detail='Soirée '+(t.event||t.soiree||m.eventsPlayed||1)+', '+(t.slot==='main'?'principal':'préliminaire')+' de la carte.'; if(t.title_fight){const champ=t.champion===x.id||t.title_holder===x.id;detail+=' '+(win==='draw'?'Une ceinture était en jeu.':win==='win'?(champ?'Il gardait sa ceinture.':'Il devient champion.'):'Il perd sa ceinture.');}}
    else if(x.type==='blessure'){banque=MGMT_ACTU_BLESSURES;vars={n:moi.n,p:moi.p,b:typeof d.nom==='string'?d.nom:''};detail='Il ne combattra pas tant qu’il n’est pas rétabli.';}
      else if(x.type==='surnom'){const type=d.t,info=MGMT_SURNOMS_GAGNES[type];if(!info)continue;const medias=Array.isArray(MGMT_MEDIAS)?MGMT_MEDIAS:[],media=medias.length?medias[Math.floor(mgmtIdentiteStream(x.id,'presse-surnom',m)()*medias.length)]:null;banque=info.voix;vars={n:moi.n,surnom:d.nom,raison:info.raison};detail='Donné par '+(media?media.nom:'la presse')+' après '+info.raison+'.';}
      else if(x.type==='espoir'){banque=[''];vars={};detail='';}
      else if(x.type==='rivale'){const rival=MGMT_ORGANISATIONS.find(o=>o.id===d.org);if(!rival)continue;banque=[''];vars={org:rival.nom};detail='La rivalité se joue soirée après soirée.';}
     else {if(d.k==='contrat')continue;banque=MGMT_ACTU_CONTRATS[d.k];if(!banque)continue;vars={n:moi.n,p:moi.p};detail=d.k==='libere'?'Il peut signer ailleurs.':'C’est le moment de lui parler.';}
    const groupe=x.type+'|'+x.id,phraseBrute=mgmtActuVariante(cle,x.type,'prev:'+String(dernier.get(groupe)||''),banque),phrase=phraseBrute.replace(/\{(\w+)\}/g,(_,key)=>vars[key]===undefined?'':String(vars[key]));dernier.set(groupe,phraseBrute);
     if(x.type==='espoir'){banque=null;}
      rows.push({cle,type:x.type,c:x.c,id:x.id,nom:moi.n,org:moi.org,div:moi.div,titre:x.type==='espoir'?'Leïla te donne des nouvelles de '+moi.n:x.type==='surnom'?'La presse l’appelle désormais « '+d.nom+' »':x.type==='rivale'?vars.org+' devient ta rivale du moment':phrase,texte:x.type==='espoir'?'Il a combattu ce soir.':detail,sous:typeof mgmtEstEspoir==='function'&&mgmtEstEspoir(m,x.id)?'Ton espoir':null,lu:Array.isArray(m.actuLu)&&m.actuLu.includes(cle)});
  }
  rows.sort((a,b)=>b.c-a.c||b.cle.localeCompare(a.cle)); return rows.slice(0,Number.isSafeInteger(opts.max)?Math.max(0,opts.max):60);
}
function mgmtActuLire(m,cle){if(!m||typeof cle!=='string')return false;if(!Array.isArray(m.actuLu))m.actuLu=[];if(m.actuLu.includes(cle))return false;m.actuLu.push(cle);m.actuLu=m.actuLu.slice(-300);return true;}
function mgmtActuToutLire(m){if(!m)return 0;const l=mgmtActualites(m);for(const x of l)mgmtActuLire(m,x.cle);return l.length;}
function mgmtActuNonLues(m){return mgmtActualites(m).filter(x=>!x.lu).length;}
