"use strict";
/* ==== [ANCRE: P7_T4_DISCOURS] — Monde lot 50 T1 ==== */
function mgmtDiscoursNom(m,id){const f=(m.roster||[]).find(x=>x&&x.id===id)||((m.mondeVivant&&Object.values(m.orgs||{}).flatMap(o=>o.roster||[]).find(x=>x&&x.id===id))||null);if(f)return f;for(const t of m.hist||[])for(const x of [t&&t.a,t&&t.b])if(x&&x.id===id)return x;return null;}
function mgmtDiscoursEligibilite(m,combat){
  if(!m||!combat||!combat.a||!combat.b||!['A','B'].includes(combat.winner)||!combat.s)return null;
  let motif=null;
  if(combat.slot==='main'){const rang=Number.isSafeInteger(combat.position)?combat.position:(Number.isSafeInteger(combat.cartePosition)?combat.cartePosition:null); if(rang===0)motif='principal';else if(rang===1)motif='co-principal';}
  const ca=mgmtReleveCoin(combat.s,'A'),cb=mgmtReleveCoin(combat.s,'B');
  const pct=(id)=>{const fn=globalThis.mgmtClassementCategorie;if(typeof fn!=='function')return null;const c=fn(m,combat.a.div);const rows=Array.isArray(c)?c:(c&&c.rows)||[];const ra=rows.findIndex(x=>(x.id||x[0])===id);if(ra<0)return null;return 1/(ra+1);};
  const winner=combat.winner==='A'?combat.a:combat.b, winChance=pct(winner.id);
  if(!motif&&winChance!==null&&winChance<0.25)motif='surprise';
  const finish=combat.family&&combat.family!=='dec';
  const limite=(Number.isSafeInteger(combat.round)?combat.round:1)*300;
  const dernieres=finish&&Number.isFinite(combat.s.d)&&combat.s.d>=limite-10;
  const retournement=finish&&combat.round>=2&&Number.isFinite(combat.scoreAvantDernier)&&combat.scoreAvantDernier<0;
  if(!motif&&((ca&&ca.kd>0&&cb&&cb.kd>0)||dernieres||retournement))motif='combat-fou';
  return motif?{motif,force:motif==='principal'||motif==='co-principal'}:null;
}
function mgmtDiscoursComposer(m,combat){
  const e=mgmtDiscoursEligibilite(m,combat);if(!e)return null;
  const auteur=combat.winner==='A'?combat.a:combat.b, adversaire=combat.winner==='A'?combat.b:combat.a;
  const riv=typeof mgmtRivalites==='function'?mgmtRivalites(m):[];
  const nomInter=Array.isArray(riv)?riv.find(x=>x&&[x.a,x.b].includes(auteur.id)&&[x.a,x.b].includes(adversaire.id)):null;
  const classement=typeof globalThis.mgmtClassementCategorie==='function'?globalThis.mgmtClassementCategorie(m,auteur.div):null;
  const rows=Array.isArray(classement)?classement:(classement&&classement.rows)||[];
  const premier=rows.find(x=>(x.id||x[0])!==auteur.id);
  const interpelle=nomInter?adversaire.id:premier?(premier.id||premier[0]):null;
  const ton=e.motif==='surprise'?'emu':nomInter?'provocateur':e.motif==='principal'||e.motif==='co-principal'?'humble':'fier';
  const banques=MGMT_DISCOURS_DATA.tons[ton], hash=(String(m.graine||'')+'|'+(m.eventsPlayed||0)+'|'+auteur.id+'|'+adversaire.id).split('').reduce((h,c)=>(Math.imul(h^c.charCodeAt(0),16777619)>>>0),2166136261);
  const nomCible=interpelle?(mgmtDiscoursNom(m,interpelle)||{}).name||interpelle:adversaire.name||adversaire.id;
  const historique=(Array.isArray(m.facts)?m.facts:[]).filter(f=>f&&f.k==='discours'&&f.a===auteur.id);
  const rang=historique.length;
  const phrase=(fam,n)=>banques[fam][(hash+n+rang)%banques[fam].length].replaceAll('{nom}',auteur.name||auteur.id).replaceAll('{adversaire}',adversaire.name||adversaire.id).replaceAll('{interpelle}',nomCible).replaceAll('{ville}',m.ville||'').replace(/\{[^}]+\}/g,'');
  const annonce=phrase('annonces',3);
  return {auteur:auteur.id,lignes:[phrase('ouvertures',0),phrase('remerciements',1),phrase('appels',2),annonce],interpelle,annonce,ton,motif:e.motif,adversaire:adversaire.id};
}
