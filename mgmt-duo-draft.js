"use strict";
/* ==== [ANCRE: DUO_T4_ECRANS] — Monde lot 19 T12 ==== */
/* ==== [ANCRE: MONDE_LOT_19_T53_DRAFT] — Monde lot 19 T53 ==== */
function mgmtDuoDraftHtml(){
  const m=G.mgmt;
  const d=m&&m.duo&&m.duo.draft;
  if(!d) return '';
  const etat=m.duo.etape==='pret'?'pret':(d.attente==='reponse'?'reponse':'place');
  const divs=allDivisions(), categories=divs.map(x=>x.id);
  const dispo=cote=>mgmtDuoDisponibles(m,cote).filter(f=>!d.combats.some(c=>c.a===f.id||c.b===f.id));
  const placeur=i=>d.combats[i]&&d.combats[i].place;
  const dernier=d.combats[d.combats.length-1];
  const tour=etat==='place'?d.tour:(etat==='reponse'?(dernier.place==='a'?'b':'a'):null);
  const autre=tour?(tour==='a'?'b':'a'):'a';
  const slots=Array.from({length:6},(_,i)=>{
    const rep=etat==='reponse'&&i===3, c=d.combats[i]||(rep?d.combats[d.combats.length-1]:null), vu=!!c&&(etat==='pret'||i<3), principal=i===5;
    const num=principal?'COMBAT PRINCIPAL · 5 ROUNDS':`COMBAT ${6-i}`;
    if(!vu&&!rep)return `<div class="dr-slot vide"><div class="lab">${num}</div><div class="l2">à placer</div></div>`;
    const a=c&&mgmtFighterById(mgmtDuoPartie(m,'a'),c.a), b=c&&mgmtFighterById(mgmtDuoPartie(m,'b'),c.b);
    const nomA=rep&&c.place!=='a'?'<span class="t2">à répondre</span>':duoEsc(a&&a.name||'à placer');
    const nomB=rep&&c.place!=='b'?'<span class="t2">à répondre</span>':duoEsc(b&&b.name||'à répondre');
    const div=mgmtDivisionLabel(c.div);
    return `<div class="dr-slot ${c.place==='a'?'j1':'j2'}${rep?' actif':''}"><div class="lab">${num} · ${duoEsc(duoMaj(div.replace('Poids ','')))}</div><div class="dr-noms"><span class="l1 j1t">${nomA}</span><span class="l1 j2t">${nomB}</span></div></div>`;
  }).join('');
  const choix=etat==='pret'?`<div class="dr-pret"><div class="T">LA CARTE EST FAITE</div><div class="l1 t2">Six combats. Tout se joue d’un coup, puis vous regardez combat par combat.</div><div class="bouton jaune" onclick="CL.mgmtDuoDraftJouer()"><span class="T">LANCER LA SUPER CARTE</span><span class="k">Entrée</span></div></div>`:(()=>{
    const candidats=etat==='reponse'?dispo(tour).filter(f=>f.div===dernier.div):dispo(tour).filter(f=>dispo(autre).some(x=>x.div===f.div));
    const liste=etat==='reponse'?candidats:candidats.filter(f=>MGMT_DUO_DRAFT_UI.categorie<6?f.div===categories[MGMT_DUO_DRAFT_UI.categorie]:categories.slice(6).includes(f.div));
    const div=dernier&&dernier.div;
    const ent=etat==='reponse'?`<div class="dr-filtre l1">Seulement les combattants de la catégorie « ${duoEsc(mgmtDivisionLabel(div))} » · en face : <span class="nom">${duoEsc(mgmtFighterById(mgmtDuoPartie(m,tour==='a'?'b':'a'),dernier[tour==='a'?'b':'a'])?.name||'')}</span></div>`:`<div class="onglets petits">${divs.slice(0,6).map((x,i)=>`<div class="ong${i===MGMT_DUO_DRAFT_UI.categorie?' on':''}" onclick="CL.mgmtDuoDraftCategorie(${i})">${duoEsc(duoMaj(mgmtDivisionLabel(x.id).replace('Poids ','')))}</div>`).join('')}<div class="ong" onclick="CL.mgmtDuoDraftCategorie(6)">AUTRES ›</div></div>`;
    return `${ent}<div class="dr-l dr-h"><div class="ef-r lab">Rang</div><div class="dr-n lab">Combattant</div><div class="ef-b lab">Bilan</div><div class="ef-a lab">Âge</div><div class="dr-d lab">Catégorie</div></div>${liste.slice(0,8).map((f,i)=>`<div class="dr-l${i===MGMT_DUO_DRAFT_UI.selection?' on':''}" onclick="CL.mgmtDuoDraftChoisir('${duoEsc(f.id)}')"><div class="ef-r T">${duoEsc(f.rang||'—')}</div><div class="dr-n l1">${duoEsc(f.name)}</div><div class="ef-b l1">${f.W}-${f.L}-${f.D}</div><div class="ef-a l1 t2">${f.age} ans</div><div class="dr-d l2">${duoEsc(mgmtDivisionLabel(f.div))}</div></div>`).join('')}`;
  })();
  const disponibleFace=dispo(autre);
  const enFace=`<div class="sous">Chez ${duoEsc(m.duo.noms[autre])}</div><div class="l2">disponibles par catégorie</div>`+divs.map(x=>{const n=disponibleFace.filter(f=>f.div===x.id).length;return `<div class="ef-mini${n?'':' zero'}"><span class="l2">${duoEsc(mgmtDivisionLabel(x.id).replace('Poids ','').replace(' féminin',' F'))}</span><b class="l1">${n}</b></div>`;}).join('');
  const bandeau=tour?`<div class="tour ${tour==='a'?'j1':'j2'}"><span class="T">À ${duoEsc(duoMaj(m.duo.noms[tour]))} DE ${etat==='reponse'?'RÉPONDRE':'PLACER'}</span><span class="l1">${etat==='reponse'?'à répondre · '+duoEsc(mgmtDivisionLabel(dernier.div)):'dans une catégorie où l’autre peut répondre'}</span></div>`:`<div class="tour pret"><span class="T">SUPER CARTE ${m.duo.cartes.length+1} · ${duoEsc(duoMaj(m.duo.noms.a))} × ${duoEsc(duoMaj(m.duo.noms.b))}</span></div>`;
  const sc=mgmtDuoScore(m), touches=duoTouches([[['←','→'],'Catégorie'],[['↑','↓'],'Combattant'],[['F'],'Fiche',false,'CL.mgmtDuoDraftFiche()'],[['Retour'],'Annuler le dernier choix',false,'CL.mgmtDuoAnnuler()'],[['Échap'],'Retour au QG',false,"CL.go('mgmt_duo')"],[['Entrée'],etat==='pret'?'Lancer la super carte':'Choisir',true,etat==='pret'?'CL.mgmtDuoDraftJouer()':'']]);
  return duoCadre(`${duoEntete(`Super carte · ${duoEsc(duoMaj(m.duo.noms.a))} <span class="t2">×</span> ${duoEsc(duoMaj(m.duo.noms.b))}`,duoDroiteSaison(sc.saison,sc.numero))}<main class="contenu large"><div class="dr">${duoPan('dr-carte',`${duoTitre('LA CARTE','6 COMBATS')}${slots}`)}<div class="dr-milieu">${bandeau}${duoPan('dr-liste',choix)}</div>${duoPan('dr-face',enFace)}</div></main>${touches}`);
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
  ,mgmtDuoDraftFiche(){const m=G.mgmt,d=m&&m.duo&&m.duo.draft;if(!d)return;const tour=d.tour;const l=d.attente==='reponse'?mgmtDuoDisponibles(m,tour).filter(x=>x.div===d.combats.at(-1).div):mgmtDuoPlacables(m,tour);const f=l[MGMT_DUO_DRAFT_UI.selection];if(f)CL.mgmtDuoFiche(f.id,'mgmt_duo_draft');}
});
keysRegister('mgmt_duo_draft',{ArrowLeft(){CL.mgmtDuoDraftCategorie(MGMT_DUO_DRAFT_UI.categorie-1);},ArrowRight(){CL.mgmtDuoDraftCategorie(MGMT_DUO_DRAFT_UI.categorie+1);},ArrowUp(){MGMT_DUO_DRAFT_UI.selection=Math.max(0,MGMT_DUO_DRAFT_UI.selection-1);render();},ArrowDown(){MGMT_DUO_DRAFT_UI.selection++;render();},f(){CL.mgmtDuoDraftFiche();},F(){CL.mgmtDuoDraftFiche();},Enter(){const m=G.mgmt;if(m.duo.etape==='pret')CL.mgmtDuoDraftJouer();else{const f=(m.duo.draft.attente==='reponse'?mgmtDuoDisponibles(m,m.duo.draft.tour).filter(x=>x.div===m.duo.draft.combats.at(-1).div):mgmtDuoPlacables(m,m.duo.draft.tour))[MGMT_DUO_DRAFT_UI.selection];if(f)CL.mgmtDuoDraftChoisir(f.id);}},Backspace(){CL.mgmtDuoAnnuler();},Escape(){CL.go('mgmt_duo');}});
