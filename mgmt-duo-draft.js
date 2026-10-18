"use strict";
/* ==== [ANCRE: DUO_T4_ECRANS] — Monde lot 19 T12 ==== */
function mgmtDuoDraftHtml(){
  const m=G.mgmt;
  const d=m&&m.duo&&m.duo.draft;
  if(!d) return '';
  const tour=d.tour;
  const nom=m.duo.noms[tour];
  const autre=mgmtDuoAutre(tour);
  const divisions=allDivisions();
  const categories=divisions.map(x=>x.id);
  const courant=d.combats[d.combats.length-1];
  const reponse=m.duo.etape==='draft'&&d.attente==='reponse';
  const divReponse=reponse&&courant?courant.div:null;
  const disponibles=reponse?mgmtDuoDisponibles(m,tour).filter(x=>x.div===divReponse):mgmtDuoPlacables(m,tour).filter(x=>x.div===categories[MGMT_DUO_DRAFT_UI.categorie]);
  const selection=MGMT_DUO_DRAFT_UI.selection;
  const lignes=disponibles.map((f,i)=>`<button class="mf-duo-ligne ${i===selection?'active':''}" data-id="${esc(f.id)}" onclick="CL.mgmtDuoDraftChoisir('${esc(f.id)}')"><b>${esc(f.rang===null?'—':String(f.rang))}</b><span>${esc(f.name)}</span><span>${esc(`${f.W}-${f.L}-${f.D}`)}</span><span>${esc(String(f.age))} ans</span><span>${esc(mgmtDivisionLabel(f.div))}</span></button>`).join('');
  const carte=d.combats.map((c,i)=>{
    const a=mgmtFighterById(mgmtDuoPartie(m,'a'),c.a);
    const b=mgmtFighterById(mgmtDuoPartie(m,'b'),c.b);
    return `<article class="mf-duo-slot ${c.place==='a'?'j1':'j2'}"><strong>${i===5?'COMBAT PRINCIPAL · 5 ROUNDS':`COMBAT ${6-i}`} · ${esc(mgmtDivisionLabel(c.div))}</strong><span>${esc(a?a.name:'à placer')}</span><span>${esc(b?b.name:'à répondre')}</span></article>`;
  }).join('');
  const effectif=mgmtDuoDisponibles(m,autre);
  const enFace=categories.map(id=>`<p>${esc(mgmtDivisionLabel(id))}<b>${effectif.filter(f=>f.div===id).length} disponibles</b></p>`).join('');
  const principal=m.duo.etape==='pret'?`<button class="mf-duo-lancer" onclick="CL.mgmtDuoDraftJouer()">Lancer la super carte</button>`:`<div class="mf-duo-liste">${reponse?`<p>Seulement ${esc(mgmtDivisionLabel(divReponse))} disponibles</p>`:`<nav>${categories.map((id,i)=>`<button class="${i===MGMT_DUO_DRAFT_UI.categorie?'active':''}" onclick="CL.mgmtDuoDraftCategorie(${i})">${esc(mgmtDivisionLabel(id))}</button>`).join('')}</nav>`}${lignes||'<p>Aucun combattant disponible.</p>'}</div>`;
  return `<main class="mf-duo-draft"><header><h1>La carte</h1><p class="mf-duo-tour ${tour==='a'?'j1':'j2'}">À ${esc(nom)} de ${reponse?'répondre':'placer'}</p></header><section class="mf-duo-carte">${carte}</section><section class="mf-duo-choix">${principal}${MGMT_DUO_DRAFT_UI.erreur?'<p>Un combat ne peut plus se jouer : annule-le et refais-le.</p>':''}<button onclick="CL.mgmtDuoAnnuler()">Annuler le dernier choix</button></section><aside class="mf-duo-face"><h2>Chez ${esc(m.duo.noms[autre])}</h2>${enFace}</aside></main>`;
}
SCREENS.mgmt_duo_draft=mgmtDuoDraftHtml;
let MGMT_DUO_DRAFT_UI={categorie:0,selection:0,erreur:false};
Object.assign(CL,{
  mgmtDuoPlacer(id){return mgmtDuoPlacer(G.mgmt,id);},
  mgmtDuoRepondre(id){return mgmtDuoRepondre(G.mgmt,id);},
  mgmtDuoAnnuler(){const ok=mgmtDuoAnnuler(G.mgmt);MGMT_DUO_DRAFT_UI.selection=0;render();return ok;},
  mgmtDuoDraftCategorie(i){MGMT_DUO_DRAFT_UI.categorie=(i+allDivisions().length)%allDivisions().length;MGMT_DUO_DRAFT_UI.selection=0;render();},
  mgmtDuoDraftChoisir(id){const m=G.mgmt,d=m.duo.draft;if(d.attente==='reponse')CL.mgmtDuoRepondre(id);else CL.mgmtDuoPlacer(id);MGMT_DUO_DRAFT_UI.selection=0;render();},
  mgmtDuoDraftJouer(){const r=mgmtDuoJouer(G.mgmt);MGMT_DUO_DRAFT_UI.erreur=!r;if(r&&typeof SCREENS.mgmt_duo_soiree==='function')CL.go('mgmt_duo_soiree');else if(r)CL.go('mgmt_duo');else render();}
});
keysRegister('mgmt_duo_draft',{ArrowLeft(){CL.mgmtDuoDraftCategorie(MGMT_DUO_DRAFT_UI.categorie-1);},ArrowRight(){CL.mgmtDuoDraftCategorie(MGMT_DUO_DRAFT_UI.categorie+1);},ArrowUp(){MGMT_DUO_DRAFT_UI.selection=Math.max(0,MGMT_DUO_DRAFT_UI.selection-1);render();},ArrowDown(){MGMT_DUO_DRAFT_UI.selection++;render();},Enter(){const m=G.mgmt;if(m.duo.etape==='pret')CL.mgmtDuoDraftJouer();else{const f=(m.duo.draft.attente==='reponse'?mgmtDuoDisponibles(m,m.duo.draft.tour).filter(x=>x.div===m.duo.draft.combats.at(-1).div):mgmtDuoPlacables(m,m.duo.draft.tour))[MGMT_DUO_DRAFT_UI.selection];if(f)CL.mgmtDuoDraftChoisir(f.id);}},Backspace(){CL.mgmtDuoAnnuler();},Escape(){CL.go('mgmt_duo');}});
