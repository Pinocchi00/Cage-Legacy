"use strict";
/* ==== [ANCRE: MGMT_LOT5_H10_RIVALITES] — Lot 5 H10, contrat §5 et §6 : la
   mémoire des affrontements. Le combattant se souvient de qui l'a battu et
   comment ; ce souvenir est l'historique des combats (m.hist) — AUCUNE
   mémoire parallèle : tout se lit, rien ne se stocke.
   Premier groupe de scénarios :
   - n° 1 la rivalité : une défaite humiliante (KO ou soumission au premier
     round, contre un adversaire au bilan moins bon — le favori écrasé) ; la
     revanche est due tant qu'elle n'a pas eu lieu ;
   - n° 2 la trilogie : une victoire partout entre deux combattants, le
     troisième combat est réclamé ;
   - n° 6 le tueur de hype : un combattant bat un invaincu.
   Le joueur décide par les demandes de H7 (promettre, refuser) : la défaite
   humiliante fait demander la revanche à coup sûr, la victoire partout fait
   demander le troisième combat. Aucun texte d'auteur : étiquettes
   fonctionnelles et noms des combattants. Parties neuves seulement. ==== */

/** Round d'une défaite humiliante : la finition tombe dès le premier. Mesuré le
 *  03/10 : 67 % des combats finissent dans les deux premiers rounds, 45 % au
 *  premier — d'où l'exigence en plus d'un bilan meilleur chez le perdant. */
const MGMT_HUMILIATION_ROUND=1;
/** Une rivalité ou une trilogie s'éteint si le dernier combat date de plus de N cycles. */
const MGMT_RIVALITE_CYCLES=12;
const MGMT_TUEUR_MIN_VICTOIRES=5;

/** Les affrontements de Split, par paire (ids triés) : chaque rencontre dit
 *  qui a gagné et comment. Lu sur la trace, rien n'est stocké.
 *  @returns {Map<string,Array>} */
function mgmtAffrontements(m){
  const out=new Map();
  (m.hist||[]).forEach((t,i)=>{
    if(!t||!t.a||!t.b) return;
    const cle=[t.a.id,t.b.id].sort().join('|');
    const gagnant=t.winner==='A'?t.a.id:(t.winner==='B'?t.b.id:null);
    const perdant=t.winner==='A'?t.b.id:(t.winner==='B'?t.a.id:null);
    if(!out.has(cle)) out.set(cle,[]);
    const [g,p]=t.winner==='A'?[t.a,t.b]:[t.b,t.a];
    const ratio=s=>(s.W||0)/Math.max(1,(s.W||0)+(s.L||0));
    out.get(cle).push({i,c:t.c,gagnant,perdant,family:t.family,round:t.round,rounds:t.rounds,
      favoriEcrase:t.winner!=='D'&&ratio(p)>ratio(g)});
  });
  return out;
}

/** Les rivalités et trilogies vivantes. Dérivé de m.hist. @returns {Array<{k:string,a:string,b:string,c:number}>}
 *  — rivalite : a = le perdant (qui demande la revanche), b = le gagnant ;
 *    trilogie : a = celui qui a perdu en dernier, b = l'autre. */
function mgmtRivalites(m){
  const out=[];
  for(const [cle,rencontres] of mgmtAffrontements(m)){
    const dernier=rencontres[rencontres.length-1];
    if(m.cycle-dernier.c>MGMT_RIVALITE_CYCLES) continue;
    const [x,y]=cle.split('|');
    const vivants=[x,y].every(id=>{ const f=mgmtFighterById(m,id); return f&&!mgmtIsRetired(f); });
    if(!vivants||!dernier.gagnant) continue;
    const finale=(dernier.family==='ko'||dernier.family==='sub')&&dernier.round<=MGMT_HUMILIATION_ROUND&&dernier.favoriEcrase;
    if(rencontres.length===1&&finale){
      out.push({k:'rivalite',a:dernier.perdant,b:dernier.gagnant,c:dernier.c});
    }else if(rencontres.length===2&&rencontres[0].gagnant&&rencontres[0].gagnant!==dernier.gagnant){
      out.push({k:'trilogie',a:dernier.perdant,b:dernier.gagnant,c:dernier.c});
    }
  }
  return out;
}

/** Les rivalités d'un combattant, vues de son côté. */
function mgmtRivauxDe(m,f){
  return mgmtRivalites(m).filter(r=>r.a===f.id||r.b===f.id).map(r=>({k:r.k,autre:r.a===f.id?r.b:r.a,c:r.c,perdant:r.a===f.id}));
}

/** Le tueur de hype (scénario 6) : un combattant bat un invaincu qui comptait
 *  au moins MGMT_TUEUR_MIN_VICTOIRES victoires. Dérivé de la trace d'avant combat. */
function mgmtTueursDeHype(m,cycle){
  const out=[];
  for(const t of m.hist||[]){
    if(!t||t.c!==cycle||t.winner==='D') continue;
    const [g,p]=t.winner==='A'?[t.a,t.b]:[t.b,t.a];
    if(p.L===0&&p.W>=MGMT_TUEUR_MIN_VICTOIRES) out.push({gagnant:g.id,perdant:p.id,c:t.c});
  }
  return out;
}

/** Les lignes que la semaine raconte : la rivalité née du dernier combat, la
 *  trilogie à jouer, le tueur de hype. Étiquettes fonctionnelles, noms des
 *  combattants. @returns {Array<{type:string,text:string,id:string}>} */
function mgmtRivalitesLignes(m){
  const nom=id=>{ const f=mgmtFighterById(m,id); return f?f.name:''; };
  const out=[];
  for(const r of mgmtRivalites(m)){
    if(m.cycle-r.c>2) continue;
    out.push({type:'rivalite',id:r.a,text:r.k==='rivalite'
      ?`${nom(r.a)} et ${nom(r.b)} : revanche due`
      :`${nom(r.a)} et ${nom(r.b)} : le troisième combat`});
  }
  for(const t of mgmtTueursDeHype(m,m.cycle-1)){
    out.push({type:'rivalite',id:t.gagnant,text:`${nom(t.gagnant)} bat ${nom(t.perdant)}, invaincu jusque-là`});
  }
  return out;
}

/** Les demandes que l'histoire impose : la revanche après une défaite
 *  humiliante, le troisième combat après une victoire partout — à coup sûr,
 *  pour le combattant qui vient de perdre. @returns {Array<{a:string,want:string,target:string}>} */
function mgmtDemandesImposees(m){
  const out=[];
  for(const r of mgmtRivalites(m)){
    if(m.cycle-r.c>1) continue;
    out.push({a:r.a,want:r.k==='rivalite'?'revanche':'trilogie',target:r.b});
  }
  return out;
}

/** « Ses rivaux » sur la fiche : l'adversaire et ce qui les lie, sans chiffre. */
function mgmtFicheRivaux(m,f){
  if(m.effectifs!==1) return '';
  const rivaux=mgmtRivauxDe(m,f);
  if(!rivaux.length) return '';
  const etiquette={rivalite:'Revanche due',trilogie:'Le troisième combat'};
  return `<h3>Ses rivaux</h3><ul class="mgmt-fiche-vie-liste">`
    +rivaux.map(r=>{ const o=mgmtFighterById(m,r.autre); return `<li>${esc(o?o.name:'')} <span class="mgmt-fiche-vie-relais">${esc(etiquette[r.k])}</span></li>`; }).join('')
    +`</ul>`;
}
/* ==== [FIN ANCRE] ==== */
