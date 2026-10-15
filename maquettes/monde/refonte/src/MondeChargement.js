"use strict";
/* Planche « Chargement des six ans » : la vraie séquence d'une création de Split (graine 20261008), relevée pas à pas
   avec les fonctions du jeu (scratchpad extraire.js). [k, année, combats, champions couronnés, retraites, dernier fait]. */
(function(){
  const PAS=[[0,2021,0,0,0,""],[1,2021,9,2,0,"Musa Batirov|Poids coq|1"],[2,2021,18,2,0,"Musa Batirov|Poids coq|1"],[3,2021,27,3,0,"Marc Pottier|Poids moyen|3"],[4,2021,36,4,0,"Saoirse Fahey|Poids plume féminin|4"],[5,2021,45,4,0,"Saoirse Fahey|Poids plume féminin|4"],[6,2021,54,4,0,"Saoirse Fahey|Poids plume féminin|4"],[7,2021,63,5,0,"Agnieszka Wesołowska|Poids paille féminin|7"],[8,2021,72,5,0,"Agnieszka Wesołowska|Poids paille féminin|7"],[9,2021,81,7,0,"Lola Konaté|Poids mouche féminin|9"],[10,2022,90,8,0,"Michał Król|Poids léger|10"],[11,2022,99,10,0,"Shane Maguire|Poids coq|11"],[12,2022,108,10,0,"Shane Maguire|Poids coq|11"],[13,2022,117,11,0,"Grégoire Zanetti|Poids mouche|13"],[14,2022,126,11,0,"Grégoire Zanetti|Poids mouche|13"],[15,2022,135,12,0,"Kai Mahoney|Poids mi-moyen|15"],[16,2022,144,13,0,"Thomas Courtois|Poids plume|16"],[17,2022,153,13,0,"Thomas Courtois|Poids plume|16"],[18,2022,162,13,0,"Thomas Courtois|Poids plume|16"],[19,2022,171,13,0,"Thomas Courtois|Poids plume|16"],[20,2023,180,13,0,"Thomas Courtois|Poids plume|16"],[21,2023,189,13,0,"Thomas Courtois|Poids plume|16"],[22,2023,198,15,0,"Gwendoline Fontana|Poids plume féminin|22"],[23,2023,207,16,0,"Musa Batirov|Poids coq|23"],[24,2023,216,18,0,"Saoirse Fahey|Poids plume féminin|24"],[25,2023,225,18,0,"Saoirse Fahey|Poids plume féminin|24"],[26,2023,234,18,0,"Saoirse Fahey|Poids plume féminin|24"],[27,2023,243,19,0,"Didier Philippe|Poids moyen|27"],[28,2023,252,20,0,"Sofiane Bertin|Poids mi-lourd|28"],[29,2023,261,20,0,"Sofiane Bertin|Poids mi-lourd|28"],[30,2023,270,22,0,"Musa Batirov|Poids coq|30"],[31,2024,279,23,0,"Grégoire Zanetti|Poids mouche|31"],[32,2024,288,24,0,"Fernanda Galván|Poids mouche féminin|32"],[33,2024,297,25,0,"Agnieszka Wesołowska|Poids paille féminin|33"],[34,2024,306,26,0,"Anton Sorokin|Poids mouche|34"],[35,2024,315,26,0,"Anton Sorokin|Poids mouche|34"],[36,2024,324,27,0,"Grégoire Zanetti|Poids mouche|36"],[37,2024,333,28,0,"Alibek Sarsenbaev|Poids coq|37"],[38,2024,342,29,0,"Eli Drake|Poids mi-lourd|38"],[39,2024,351,29,0,"Eli Drake|Poids mi-lourd|38"],[40,2024,360,31,0,"Ekaterine Janelidze|Poids mouche féminin|40"],[41,2025,369,31,0,"Ekaterine Janelidze|Poids mouche féminin|40"],[42,2025,378,32,0,"Alice Hughes|Poids paille féminin|42"],[43,2025,387,33,0,"Olivia Gill|Poids mouche féminin|43"],[44,2025,396,33,0,"Olivia Gill|Poids mouche féminin|43"],[45,2025,405,33,0,"Olivia Gill|Poids mouche féminin|43"],[46,2025,414,33,0,"Olivia Gill|Poids mouche féminin|43"],[47,2025,423,33,0,"Olivia Gill|Poids mouche féminin|43"],[48,2025,432,33,0,"Olivia Gill|Poids mouche féminin|43"],[49,2025,441,34,0,"Enzo Morel|Poids mi-moyen|49"],[50,2025,450,34,0,"Enzo Morel|Poids mi-moyen|49"],[51,2025,459,36,0,"Kai Mahoney|Poids mi-moyen|51"],[52,2026,468,37,0,"Nolan Fontaine|Poids lourd|52"],[53,2026,477,38,0,"Ekaterine Janelidze|Poids mouche féminin|53"],[54,2026,486,38,0,"Ekaterine Janelidze|Poids mouche féminin|53"],[55,2026,495,38,0,"Ekaterine Janelidze|Poids mouche féminin|53"],[56,2026,504,38,0,"Ekaterine Janelidze|Poids mouche féminin|53"],[57,2026,513,39,0,"Julie Pagès|Poids coq féminin|57"],[58,2026,522,40,0,"Musa Batirov|Poids coq|58"],[59,2026,531,40,0,"Musa Batirov|Poids coq|58"],[60,2026,540,40,0,"Musa Batirov|Poids coq|58"],[61,2026,549,40,0,"Musa Batirov|Poids coq|58"],[62,2026,558,40,0,"Musa Batirov|Poids coq|58"]];
  /* Les cinq cartons : textes de MGMT_NOUVELLE_LECTURES (mgmt-nouvelle.js), relu:false. Le prénom de l'adjointe vient de l'identité. */
  const CARTONS=[
    ['Tu es le matchmaker.','Tu ne diriges pas l’organisation : tu composes ses soirées. Tu choisis qui combat qui, et tu en réponds devant tout le monde.'],
    ['Leïla t’aide.','Ton assistante te propose des combats et dit pourquoi. Tu acceptes, tu refuses, ou tu choisis toi-même dans la liste complète.'],
    ['Rien n’est inventé.','Ces six années sont jouées par le même moteur que tes soirées. Les champions, les rivalités, les blessés : tout ce que tu vas lire a eu lieu.'],
    ['Les marques te guident.','Un point à côté d’un nom dit qu’il lui est arrivé quelque chose depuis ta dernière visite. Ouvre sa fiche : la marque s’éteint.'],
    ['Une soirée toutes les cinq semaines.','Une carte principale de cinq combats, quatre préliminaires. Quand la carte est complète, tu poses la soirée et tu la lances.'],
  ];
  const N=62, DEBUTS={2021:0,2022:9,2023:19,2024:30,2025:40,2026:51};   /* indice de la première soirée de chaque année */
  const $=id=>document.getElementById(id);
  const calme=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  function poser(k){
    const p=PAS[k];
    $('c1').textContent=p[0]; $('c2').textContent=p[2]; $('c3').textContent=p[3]; $('c4').textContent=p[4];
    $('k').textContent=p[0]; $('fn').textContent=Math.max(1,p[0]);
    const an=$('annee').querySelector('.vis'); if(an) an.textContent=p[1];
    $('barre').style.width=(100*k/N).toFixed(2)+'%';
    document.querySelector('.ch-barre').setAttribute('aria-valuenow',k);
    for(const s of $('ans').children){ const y=+s.textContent; s.className=(k>=N||y<p[1])?'fait':(y===p[1]?'cours':''); }
    if(p[5]){ const [nom,div,c]=p[5].split('|'); $('fait').textContent=nom+' prend la ceinture'; $('fait2').textContent=div+' · Split Fight Night '+c; }
  }
  let lec=0;
  function carton(i,fondu){
    lec=(i%5+5)%5;
    $('ct').textContent=CARTONS[lec][0]; $('cx').textContent=CARTONS[lec][1]; $('num').textContent='Carton '+(lec+1)+' sur 5';
    [...$('pastilles').querySelectorAll('button')].forEach((b,j)=>b.classList.toggle('on',j===lec));
    if(fondu&&!calme()) for(const el of [$('ct'),$('cx')]) el.animate([{opacity:0},{opacity:1}],{duration:300,easing:'ease-out'});
  }
  [...$('pastilles').querySelectorAll('button')].forEach((b,j)=>b.addEventListener('click',()=>{ carton(j,true); armer(); }));
  addEventListener('keydown',e=>{ if(e.key==='ArrowRight'){ carton(lec+1,true); armer(); } if(e.key==='ArrowLeft'){ carton(lec-1,true); armer(); } });
  let minuteur=null;
  function armer(){ if(minuteur) clearInterval(minuteur); if(PLANCHE.q.get('demo')==='1') minuteur=setInterval(()=>carton(lec+1,true),7000); }

  const e=PLANCHE.etat;
  const barre=$('barre');
  barre.style.transition='none';
  if(e==='debut') poser(0);
  else if(e==='fin'){ poser(62); barre.classList.remove('anime'); }
  else if(e==='erreur'){ poser(24); barre.classList.remove('anime'); barre.classList.add('barre-err'); }
  else poser(24);
  void barre.offsetWidth; barre.style.transition='';

  /* ?demo=1 : la séquence réelle rejouée, une soirée par demi-seconde, puis l'état de fin. */
  if(PLANCHE.q.get('demo')==='1'&&(e==='chargement'||e==='debut')){
    armer();
    const montrer=et=>{ for(const el of document.querySelectorAll('[data-etat]')) el.classList.toggle('vis',el.dataset.etat.split(' ').includes(et)); };
    montrer('debut'); poser(0);
    let k=0;
    const t=setInterval(()=>{
      k++;
      if(k===1){ montrer('chargement'); }
      poser(k);
      if(k>=N){ clearInterval(t); setTimeout(()=>{ montrer('fin'); poser(N); barre.classList.remove('anime'); },600); }
    },500);
  }
})();
