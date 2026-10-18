"use strict";
/* ==== [ANCRE: DUO_T4_ECRANS] — Monde lot 19 T14, docs/lots/DUO-T4.md §4 ==== */
/* Le bilan d'une super carte : le bandeau du vainqueur (ou l'égalité), le score des six combats, ce qu'a rapporté la
   carte à chaque joueur, les recrues des enchères et, à la quatrième carte, la saison. Tout vient de mgmt-duo.js ;
   cet écran ne mute rien : seul le retour au QG passe par mgmtDuoTerminer (l'étape repasse à `attente`).
   Les planches maquettes/duo/DuoBilan.html priment pour tout ce qui se voit ; les valeurs sont portées dans
   ui-duo-bilan.css sous l'ancre DUO_T4_ECRANS. Aucun texte sous 22 px, esc() sur tout nom.
   Tous les textes visibles sont relu:false (à relire par Anthony). */

/** La classe de couleur d'un côté : J1 le rouge vif, J2 le bleu-vert. @returns {string} */
function mgmtDuoBilanCote(cote){
  return cote==='a'?'j1':cote==='b'?'j2':'';
}

/** Le libellé d'une place dans la soirée : le premier joué en haut (COMBAT 6) jusqu'au principal (i = 5). @returns {string} */
function mgmtDuoBilanPlace(i){
  const n=MGMT_DUO_COMBATS;
  return i===n-1?'COMBAT PRINCIPAL':'COMBAT '+(n-i);
}

/** Le nombre de combats gagnés par un côté dans une carte. @returns {number} */
function mgmtDuoBilanVictoires(carte,cote){
  const g=cote==='a'?'A':cote==='b'?'B':null;
  return carte&&Array.isArray(carte.combats)?carte.combats.filter(c=>c.winner===g).length:0;
}

/** L'argent d'une carte pour un côté. @returns {number} */
function mgmtDuoBilanGain(carte,cote){
  return carte&&carte.gains&&Number.isFinite(carte.gains[cote])?carte.gains[cote]:0;
}

/** Une ligne d'argent : le joueur (étiquette), son organisation et la somme. @returns {string} */
function mgmtDuoBilanLigneArgent(m,cote,montant){
  const nom=cote==='a'?m.duo.noms.a:m.duo.noms.b;
  const org=mgmtOrgNom(cote==='a'?m:mgmtDuoPartie(m,'b'));
  return `<div class="mf-duo-bi-ligne"><div class="mf-duo-bi-l1"><span class="mf-duo-tag ${mgmtDuoBilanCote(cote)}">${esc(nom)}</span> ${esc(org)}</div><div class="mf-duo-bi-t mf-duo-bi-g">+ ${esc(mgmtEuros(montant))}</div></div>`;
}

/** Une ligne de combat du bilan, six fois. @returns {string} */
function mgmtDuoBilanCombatHtml(i,c){
  const gain=c.winner==='A'?' gagne':'', gagnb=c.winner==='B'?' gagne':'';
  const meth=mgmtSuMethodeFamille({nul:c.winner==='D',family:c.family,round:c.round,rounds:c.rounds});
  return `<div class="mf-duo-bi-l" data-duo-combat="${i}">`
    +`<div class="mf-duo-bi-num">${mgmtDuoBilanPlace(i)}</div>`
    +`<div class="mf-duo-bi-n${gain}"><span class="mf-duo-bi-pt j1"></span>${esc(c.na)}</div>`
    +`<div class="mf-duo-bi-n${gagnb}"><span class="mf-duo-bi-pt j2"></span>${esc(c.nb)}</div>`
    +`<div class="mf-duo-bi-m">${esc(mgmtDivisionLabel(c.div))} · ${esc(meth)}</div>`
    +`<button type="button" class="mf-duo-bi-aller" onclick="CL.mgmtDuoBilanRevoir(${i})">Revoir ›</button>`
    +`</div>`;
}

/** Le panneau des six combats. @returns {string} */
function mgmtDuoBilanListeHtml(m,carte){
  const noms=m.duo.noms, orgA=mgmtOrgNom(m), orgB=mgmtOrgNom(mgmtDuoPartie(m,'b'));
  const tete=`<div class="mf-duo-bi-tete"><div class="mf-duo-bi-titre"><div class="mf-duo-bi-t">Les six combats</div><div class="mf-duo-bi-trait"></div></div><div class="mf-duo-bi-lab">${esc(mgmtJourDateTexte(carte.jour))}</div></div>`;
  const entete=`<div class="mf-duo-bi-l mf-duo-bi-h"><div class="mf-duo-bi-num"></div>`
    +`<div class="mf-duo-bi-n mf-duo-bi-lab">${esc(noms.a)} · ${esc(orgA)}</div>`
    +`<div class="mf-duo-bi-n mf-duo-bi-lab">${esc(noms.b)} · ${esc(orgB)}</div>`
    +`<div class="mf-duo-bi-m mf-duo-bi-lab">Comment</div><div class="mf-duo-bi-num"></div></div>`;
  const lignes=carte.combats.map((c,i)=>mgmtDuoBilanCombatHtml(i,c)).join('');
  return mfPanneau(tete+entete+lignes,'normal','mf-duo-bi-liste');
}

/** Les recrues des enchères de cette carte, ou rien. @returns {string} */
function mgmtDuoBilanRecruesHtml(m,carte){
  const noms={a:m.duo.noms.a,b:m.duo.noms.b};
  const lignes=(m.duo.recrues||[]).filter(r=>r&&r.n===carte.n);
  if(!lignes.length) return '';
  const corps=lignes.map(r=>`<div class="mf-duo-bi-l1"><span class="mf-duo-tag ${mgmtDuoBilanCote(r.cote)}">${esc(noms[r.cote]||'')}</span> signe ${esc(r.name)} · ${esc(mgmtEuros(r.prix))}</div>`).join('');
  return mfPanneau(`<div class="mf-duo-bi-sous">Recrues des enchères</div>${corps}`,'normal','mf-duo-bi-rec');
}

/** Le bloc de la quatrième carte : la saison, son vainqueur et les quatre cartes. @returns {string} */
function mgmtDuoBilanSaisonHtml(m,carte){
  const score=mgmtDuoScore(m);
  const titre=score.a===score.b?`Saison ${score.saison} : égalité`:`${esc(m.duo.noms[score.a>score.b?'a':'b'])} remporte la saison ${score.saison}`;
  const cls=score.a===score.b?'':mgmtDuoBilanCote(score.a>score.b?'a':'b');
  const debut=Math.max(0,carte.n-MGMT_DUO_CARTES_SAISON);
  const cartes=m.duo.cartes.slice(debut).map(c=>`<div class="mf-duo-bi-ligne"><div class="mf-duo-bi-l1">Super carte ${c.n} · ${esc(mgmtJourDateTexte(c.jour))}</div><div class="mf-duo-bi-l1">${mgmtDuoBilanVictoires(c,'a')} – ${mgmtDuoBilanVictoires(c,'b')}</div></div>`).join('');
  return `<div class="mf-duo-bi-sw ${cls}">${titre}</div>${cartes}`;
}

/** Le panneau de droite : le score de saison, l'argent, les recrues. @returns {string} */
function mgmtDuoBilanSaison(m,carte){
  const score=mgmtDuoScore(m);
  const derniere=carte.n%MGMT_DUO_CARTES_SAISON===0;
  const gros=`<div class="mf-duo-bi-gros"><span class="mf-duo-bi-t mf-duo-bi-j1">${score.a}</span><span class="mf-duo-bi-t mf-duo-bi-t2">–</span><span class="mf-duo-bi-t mf-duo-bi-j2">${score.b}</span></div>`;
  const milieu=derniere
    ?mgmtDuoBilanSaisonHtml(m,carte)
    :`<div class="mf-duo-bi-l1 mf-duo-bi-t2">Prochaine super carte : ${esc(mgmtJourDateTexte(m.duo.prochaine))}</div>`;
  let argentA,argentB,titre;
  if(derniere){
    const debut=Math.max(0,carte.n-MGMT_DUO_CARTES_SAISON);
    const saison=m.duo.cartes.slice(debut);
    argentA=saison.reduce((s,c)=>s+mgmtDuoBilanGain(c,'a'),0);
    argentB=saison.reduce((s,c)=>s+mgmtDuoBilanGain(c,'b'),0);
    titre='Gagné sur la saison';
  }else{
    argentA=mgmtDuoBilanGain(carte,'a');
    argentB=mgmtDuoBilanGain(carte,'b');
    titre="L'argent de la super carte";
  }
  const argent=`<div class="mf-duo-bi-argent"><div class="mf-duo-bi-sous">${titre}</div>`
    +mgmtDuoBilanLigneArgent(m,'a',argentA)+mgmtDuoBilanLigneArgent(m,'b',argentB)+`</div>`;
  return mfPanneau(gros+milieu+argent+mgmtDuoBilanRecruesHtml(m,carte),'normal','mf-duo-bi-saison');
}

/** L'écran du bilan : le bandeau, les six combats, la saison, le retour au QG. @returns {string} */
function mgmtDuoBilanHtml(){
  const m=G&&G.mgmt;
  const cartes=mgmtDuoActif(m)&&Array.isArray(m.duo.cartes)?m.duo.cartes:[];
  const carte=cartes[cartes.length-1];
  const opts={barre:'logo',plaque:'Duo',libelle:`${m&&m.duo?m.duo.noms.a:'Joueur 1'} × ${m&&m.duo?m.duo.noms.b:'Joueur 2'}`,droite:'',touches:[{ks:['Entrée'],t:'Retour au QG',jaune:true,onclick:'CL.mgmtDuoBilanRetour()'}]};
  if(!carte){
    return mfEcran(`<main class="mf-duo-bi"><div class="mf-duo-bi-l1">Aucune super carte jouée.</div></main>`,opts);
  }
  const scoreA=mgmtDuoBilanVictoires(carte,'a'), scoreB=mgmtDuoBilanVictoires(carte,'b');
  const bandeau=carte.gagnant==='nul'
    ?`<span class="mf-duo-bi-t">Égalité</span>`
    :`<span class="mf-duo-bi-t">${esc(m.duo.noms[carte.gagnant])} remporte la super carte ${carte.n}</span>`;
  const cls=mgmtDuoBilanCote(carte.gagnant);
  opts.droite='Saison '+mgmtDuoScore(m).saison+' · super carte '+((carte.n-1)%MGMT_DUO_CARTES_SAISON+1)+' sur '+MGMT_DUO_CARTES_SAISON;
  const contenu=`<main class="mf-duo-bi">`
    +`<div class="mf-duo-bi-bandeau ${cls}">${bandeau}<span class="mf-duo-bi-sc">${scoreA} – ${scoreB}</span></div>`
    +`<div class="mf-duo-bi-cols">${mgmtDuoBilanListeHtml(m,carte)}${mgmtDuoBilanSaison(m,carte)}</div>`
    +`<div class="mf-duo-bi-bas">${mfBouton('Retour au QG',{touche:'Entrée',jaune:true,onclick:'CL.mgmtDuoBilanRetour()'})}</div>`
    +`</main>`;
  return mfEcran(contenu,opts);
}

SCREENS.mgmt_duo_bilan=mgmtDuoBilanHtml;

Object.assign(CL,{
  /** Le bouton du QG « Voir le bilan » : ouvre l'écran du bilan de la dernière super carte. */
  mgmtDuoBilan(){ CL.go('mgmt_duo_bilan'); },
  /** Revoir un des six combats de la carte affichée : le même rejeu que les écrans de résultats (l'arène d'avant pour
   *  une trace sans agenda, l'écran animé sinon). */
  mgmtDuoBilanRevoir(i){
    const m=G&&G.mgmt;
    const cartes=mgmtDuoActif(m)&&Array.isArray(m.duo.cartes)?m.duo.cartes:[];
    const carte=cartes[cartes.length-1];
    const c=carte&&carte.combats[i];
    const t=c&&m.hist?m.hist[c.h]:null;
    if(t) mgmtRevoirCombat(t,'mgmt_duo_bilan',null);
  },
  /** Le retour au QG : referme le bilan (l'étape repasse à `attente`) puis ouvre le QG. */
  mgmtDuoBilanRetour(){ mgmtDuoTerminer(G.mgmt); CL.go('mgmt_duo'); }
});

/* Le clavier du bilan : Entrée seulement (récapitulatif de DUO-T4). */
keysRegister('mgmt_duo_bilan',{Enter(){CL.mgmtDuoBilanRetour();}});

/* ==== [ANCRE: DUO_T4_CLAVIER] — Monde lot 19 T14 : le clavier des quatre écrans de la super carte, au même endroit
   (récapitulatif de DUO-T4). Les écrans eux-mêmes sont écrits dans mgmt-duo-ecrans.js (tranches voisines) : leur
   clavier dépend de leur état d'interface (curseur de liste, onglet de catégorie, combattant déjà regardé), que je
   ne peux pas atteindre d'ici. Je ne pose donc une carte de secours que là où elle est libre et où DUO-T4 nomme les
   méthodes : les enchères. Le draft et la soirée gardent la leur, posée par leur propre écran. ==== */
if(!KEYS.maps['mgmt_duo_encheres']){
  keysRegister('mgmt_duo_encheres',{
    Enter(){CL.mgmtDuoMiser();},
    m(){CL.mgmtDuoMiser();},
    M(){CL.mgmtDuoMiser();},
    p(){CL.mgmtDuoPasser();},
    P(){CL.mgmtDuoPasser();},
    Escape(){CL.go('mgmt_duo');}
  });
}
