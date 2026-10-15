"use strict";
/* Planche « Résultats » : les données sont celles d'une vraie partie (Split, graine 20261008, six ans puis une soirée jouée),
   relevées avec les fonctions du jeu (scratchpad extraire.js, extraire2.js). Le rendu ci-dessous suit les règles de
   la note « ce que le code devra lire » : mêmes phrases, mêmes ordres, mêmes cas. */
(function(){
  const E=PLANCHE.etat, $=id=>document.getElementById(id);
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  /* [vainqueur, perdant, famille, round, rounds, méthode fine, geste, catégorie, ceinture, défense, rangV avant, après, rangP avant, après, bilans, corps, contrat] */
  const C=(g,p,fam,r,rs,meth,geste,cat,ceint,def,rg,rp,bil,corps,contrat)=>({g,p,fam,r,rs,meth,geste,cat,ceint,def,rg,rp,bil,corps,contrat});
  const F63={n:63,date:'Mardi 16 février 2027',court:'16 février 2027',salle:'Forum de Montpellier',spect:'2 265 spectateurs',joueur:true,
    main:[C(['Ekaterine','Janelidze'],['Guadalupe','Bautista'],'ko',3,5,'KO/TKO','Uppercut','Poids mouche féminin','garde',4,['C','C'],[1,8],['28-3','14-3']),
      C(['Adam','Holmes'],['Kai','Mahoney'],'dec',5,5,'Décision unanime','','Poids mi-moyen','prend',0,[12,'C'],['C',13],['20-6','31-6']),
      C(['Artem','Stepanov'],['Malik','Lewis'],'ko',1,3,'KO/TKO','Direct puissant','Poids léger',null,null,[1,1],[2,11],['23-8-1','6-3'],null,'p'),
      C(['Shota','Mchedlishvili'],['Angus','Long'],'ko',2,3,'KO/TKO','Crochet au foie','Poids moyen',null,null,[1,1],[9,13],['17-9','10-6']),
      C(['Landry','Ekani'],['Pedro','Lira'],'ko',2,3,'KO/TKO','Uppercut','Poids lourd',null,null,[1,1],[2,13],['5-2','27-5'])],
    prel:[C(['Ifeoma','Abdullahi'],['Isabelle','Bellanger'],'sub',1,3,'Soumission','Kimura','Poids coq féminin',null,null,[12,7],[11,17],['0-0','3-4-1']),
      C(['Gérard','Zimmer'],['Caleb','Martin'],'sub',2,3,'Soumission','Rear Naked Choke','Poids lourd',null,null,[15,8],[12,20],['5-3','7-3'],'p'),
      C(['Éric','Atangana'],['Paolo','Rizzo'],'ko',1,3,'KO/TKO','Crochet','Poids moyen',null,null,[11,3],[12,17],['7-3','8-0'],null,'g'),
      C(['Ryan','Mitchell'],['Taiga','Fujita'],'dec',3,3,'Décision unanime','','Poids mi-moyen',null,null,[14,4],[13,22],['1-1','4-2'])]};
  const F62={n:62,date:'Mardi 8 décembre 2026',court:'8 décembre 2026',salle:'Halle de Toulouse',spect:'',joueur:false,
    main:[C(['Ekaterine','Janelidze'],['Róisín','McCarthy'],'ko',3,5,'KO','','Poids mouche féminin','garde',3,['C','C'],[5,9],['27-3','13-11']),
      C(['Artem','Stepanov'],['Tom','Dupré'],'ko',1,3,'KO','','Poids léger',null,null,[1,1],[29,29],['22-8-1','26-11'],'p'),
      C(['Marc','Pottier'],['Kader','Duval'],'ko',2,5,'KO','','Poids moyen','garde',3,['C','C'],[23,27],['21-4','22-10']),
      C(['Pedro','Lira'],['Blair','Reeves'],'dec',3,3,'Décision','','Poids lourd',null,null,[3,2],[18,23],['26-5','15-6']),
      C(['Guadalupe','Bautista'],['Ketevan','Gelashvili'],'ko',1,3,'KO','','Poids mouche féminin',null,null,[6,1],[7,12],['13-3','14-4'])],
    prel:[C(['Flynn','Williams'],['Carlos','Ruiz'],'dec',3,3,'Décision','','Poids mouche',null,null,[16,6],[17,20],['12-4','10-4']),
      C(['Jimena','Jiménez'],['Ling','Zhao'],'dec',3,3,'Décision','','Poids paille féminin',null,null,[16,10],[17,21],['0-0','0-0'],'p'),
      C(['Ruby','Mitchell'],['Sokhna','Samb'],'ko',3,3,'KO','','Poids mouche féminin',null,null,[9,3],[8,14],['5-5','8-1']),
      C(['Chad','Young'],['Anis','Benali'],'ko',1,3,'KO','','Poids mi-lourd',null,null,[9,5],[10,18],['7-2','4-2'])]};
  const AVANT=[[62,'8 décembre 2026','Janelidze bat McCarthy'],[61,'3 novembre 2026','Mercier bat Pedrosa'],[60,'29 septembre 2026','Ramazanov bat Cortez'],
    [59,'25 août 2026','Craig bat Clément'],[58,'21 juillet 2026','Kondo bat Daniel'],[57,'16 juin 2026','Fahey bat Clément'],[56,'12 mai 2026','Fahey bat Rigaud'],[55,'7 avril 2026','Janelidze bat Gill']];

  /* ---- Les phrases (les mêmes que la note) ---- */
  const ord=n=>n===1?'1re':n+'e';
  const roundTxt=r=>r===1?'1er round':r+'e round';
  const famille=c=>c.fam==='ko'?'KO au '+roundTxt(c.r):c.fam==='sub'?'Soumission au '+roundTxt(c.r):c.fam==='draw'?'Match nul après '+c.rs+' rounds':'Décision après '+c.rs+' rounds';
  const fine=c=>c.fam==='dec'?c.meth+' après '+c.rs+' rounds':famille(c);
  const nomC=x=>x.join(' '), nomL=x=>x[1];
  function changements(c,soiree){
    const out=[], G=nomL(c.g), P=nomL(c.p);
    if(c.ceint==='garde') out.push(['ceint',`${G} garde sa ceinture : ${ord(c.def)} défense`]);
    if(c.ceint==='prend') out.push(['ceint',`${G}, ${ord(c.rg[0])}, prend la ceinture`]);
    if(c.ceint==='vacant') out.push(['ceint',`${G} prend la ceinture vacante`]);
    if(c.ceint==='prend'&&c.rp[0]==='C') out.push(['recule',`${P} perd sa ceinture et passe à la ${ord(c.rp[1])} place`]);
    for(const [qui,r,nom] of [['g',c.rg,G],['p',c.rp,P]]){
      if(r[0]==='C'||r[1]==='C') continue;
      if(r[0]===r[1]) out.push(['reste',`${nom} garde la ${ord(r[0])} place`]);
      else if(r[1]<r[0]) out.push(['monte',`${nom} monte de la ${ord(r[0])} à la ${ord(r[1])} place`]);
      else out.push(['recule',`${nom} recule de la ${ord(r[0])} à la ${ord(r[1])} place`]);
    }
    if(c.corps) out.push(['corps',`Blessure pour ${c.corps==='g'?G:P}`]);
    if(c.contrat&&soiree.joueur) out.push(['contrat',`${c.contrat==='g'?G:P} : un dernier combat à son contrat`]);
    return out;
  }
  const place=(k,slot)=>slot==='main'?(k===0?'Combat principal':k===1?'Co-principal':'Carte principale · '+(k+1)+'e combat'):'Préliminaire '+(k+1);

  /* ---- Ce que montre chaque état ---- */
  const S={
    joueur:{soiree:F63,slot:'main',k:0,tes:true,jaune:['Poser une soirée','Aucune soirée n’est posée.'],prochaine:64},
    passe:{soiree:F62,slot:'main',k:0,tes:true,jaune:['Poser une soirée','Aucune soirée n’est posée.'],prochaine:64},
    blessure:{soiree:F63,slot:'prel',k:1,tes:true,jaune:['Poser une soirée','Aucune soirée n’est posée.'],prochaine:64},
    contrat:{soiree:F63,slot:'main',k:2,tes:true,jaune:['Poser une soirée','Aucune soirée n’est posée.'],prochaine:64},
    'premier-jour':{soiree:F62,slot:'main',k:0,tes:false,jaune:['Ouvrir la carte','Kader Malika a signé 2 combats. Il en manque 3 en carte principale.'],prochaine:63},
    vide:{soiree:null,jaune:['Ouvrir la carte','Il manque 5 combats en carte principale.'],prochaine:1},
  }[E];

  const pan=(cls,inner)=>`<div class="pan ${cls}"><div class="p2"><div class="p3">${inner}</div></div></div>`;
  const tete=(t,droite)=>`<div class="pan-tete"><div class="pan-titre"><div class="T">${t}</div><div class="trait"></div></div>${droite?`<div class="lab">${droite}</div>`:''}</div>`;
  const jaune=`<div class="jaune-bloc"><div class="lab">La prochaine chose à faire</div><div style="display:flex;justify-content:space-between;align-items:center;gap:16px"><div class="T">${esc(S.jaune[0])}</div><div class="k" style="font-size:24px">Entrée</div></div><div style="font-size:24px;line-height:1.1">${esc(S.jaune[1])}</div></div>`;

  /* La colonne des soirées */
  const ligneSo=(n,date,princ,sel)=>`<button type="button" class="so${sel?' sel':''}" aria-pressed="${sel}"><div class="so-h"><div class="T">Fight Night ${n}</div><span>${esc(date)}</span></div><div class="l2">${esc(princ)}</div></button>`;
  let liste='';
  if(E==='vide'){
    liste=`<div class="sous">Tes soirées · 0</div><div class="so-a-venir"><div class="l1">Ta première soirée</div><div class="l2">Split Fight Night 1 · dans 35 jours</div></div>`;
  }else{
    const sel63=S.soiree===F63;
    liste=(S.tes?`<div class="sous">Tes soirées · 1</div>`+ligneSo(63,'16 février 2027','Janelidze bat Bautista',sel63)
      :`<div class="sous">Tes soirées · 0</div><div class="so-a-venir"><div class="l1">Ta première soirée</div><div class="l2">Split Fight Night 63 · dans 35 jours</div></div>`)
      +`<div class="sous" style="margin-top:8px">Avant ton arrivée · 62</div>`
      +AVANT.slice(0,6).map(x=>ligneSo(x[0],x[1],x[2],!sel63&&x[0]===62)).join('')
      +`<div class="re-plus"><div class="l2">56 soirées plus anciennes</div><div class="aller">↓</div></div>`;
  }
  const colG=`<div class="re-g">${pan('',tete('LES SOIRÉES')+liste)}</div>`;

  let html;
  if(E==='vide'){
    html=colG+`<div class="re-plein">${pan('',tete('AUCUNE SOIRÉE JOUÉE')+`<div class="vide-t">Les résultats de Split Fight Night 1 arriveront ici, le soir même.</div><div class="l2" style="font-size:24px">Chaque combat dira qui a gagné, comment, et ce que ça change au classement, aux ceintures et aux contrats.</div>`)}${jaune}</div>`;
  }else{
    const s=S.soiree;
    const rangee=(c,k,slot)=>{
      const sel=slot===S.slot&&k===S.k;
      const qui=c.fam==='draw'?`<span>${esc(nomL(c.g))}</span><span class="b"> et </span><span>${esc(nomL(c.p))}</span><span class="b"> : match nul</span>`
        :`<span class="g">${esc(nomL(c.g))}</span><span class="b"> bat </span><span>${esc(nomL(c.p))}</span>`;
      return `<button type="button" class="cb${sel?' sel':''}" aria-pressed="${sel}"><div class="cb-n">${k+1}</div><div class="col"><div class="l1">${qui}</div>`
        +`<div class="l2">${c.ceint?'<span class="ceinture"><span class="oct"></span>Ceinture</span><span>·</span>':''}<span>${esc(famille(c))} · ${esc(c.cat)}</span></div></div></button>`;
    };
    const tab=`<div class="gr"><div class="sous">Carte principale</div><div class="sous">${s.main.length} combats</div></div>`+s.main.map((c,k)=>rangee(c,k,'main')).join('')
      +`<div class="gr" style="margin-top:6px"><div class="sous">Carte préliminaire</div><div class="sous">${s.prel.length} combats</div></div>`+s.prel.map((c,k)=>rangee(c,k,'prel')).join('');
    const quiSoiree=s.joueur?'Ta soirée':'Soirée de Kader Malika';
    const lieu=[s.date,s.salle,s.spect].filter(Boolean).join(' · ');
    const colM=`<div class="re-m"><div class="re-tete"><div class="re-tete-h"><div class="T">Split Fight Night ${s.n}</div><div class="puce${s.joueur?' a-toi':''}">${quiSoiree}</div></div><div class="l1">${esc(lieu)}</div></div>${pan('re-tab',tab)}</div>`;
    const c=(S.slot==='main'?s.main:s.prel)[S.k];
    const ch=changements(c,s).map(([i,t])=>`<div class="chg"><i class="${i}"></i><span>${esc(t)}</span></div>`).join('');
    const actions=(s.joueur?`<button type="button" class="bouton"><span class="T">Revoir le combat</span><span class="k">R</span></button>`
      :`<div class="l2" style="font-size:22px;line-height:1.15">Combat d’avant ton arrivée : on lit le résultat, il ne se revoit pas.</div>`)
      +`<button type="button" class="bouton"><span class="T">Fiche de ${esc(nomL(c.g))}</span><span class="k">F</span></button>`;
    const det=`<div class="lab">${esc(place(S.k,S.slot))}</div><div class="T det-g">${esc(nomC(c.g))}</div><div class="det-p">bat ${esc(nomC(c.p))}</div>`
      +`<div class="l2" style="font-size:24px;color:var(--blanc)">${esc(fine(c))}${c.geste?' · '+esc(c.geste):''}</div>`
      +`<div class="l2">${esc(c.cat)} · en ${c.rs} rounds</div><div class="l2">Bilans avant le combat : ${c.bil[0]} et ${c.bil[1]}</div>`
      +`<div class="sous" style="margin-top:8px">Ce que ça change</div>${ch}<div class="det-actions">${actions}</div>`;
    html=colG+colM+`<div class="re-d">${pan('re-det',det)}${jaune}</div>`;
  }
  $('re').innerHTML=html;
  $('lib').textContent=S.soiree?('Split Fight Night '+S.soiree.n+' · '+S.soiree.date):'Aucune soirée jouée';
  $('prochaine').textContent=S.prochaine;
  const t=(ks,txt,j)=>`<div class="tg">${ks.map(k=>`<span class="k${j?' j':''}">${k}</span>`).join('')}<span>${esc(txt)}</span></div>`;
  $('touches').innerHTML=E==='vide'?t(['Échap'],'Retour')+t(['A','E'],'Section')+t(['Entrée'],S.jaune[0],true)
    :t(['Échap'],'Retour')+t(['←','→'],'Soirée')+t(['↑','↓'],'Combat')+(S.soiree.joueur?t(['R'],'Revoir'):'')+t(['F'],'Fiche')+t(['A','E'],'Section')+t(['Entrée'],S.jaune[0],true);
})();
