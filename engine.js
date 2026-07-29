"use strict";
/* =========================================================================
   CAGE LEGACY — MOTEUR v2 (reconstruction)
   30 attributs (Technique/Mental/Physique) internes /100, AFFICHÉS /20.
   Génération profonde (origine + motivation + potentiel caché). Combat qui
   produit de vraies statistiques de round + log lisible. Échelle d'orgs.
   Classement/GOAT corrigés (les défaites pèsent lourd). Pas d'argent.
   Cadre de compétences uniques. Aucune dépendance externe (Node pur).
   ========================================================================= */
/* Dépend de : data-skills.js (SKILLS), data-content.js (ORIGINS, MOTIVATIONS).
   Doit être chargé après ces deux fichiers. */
let SEED=(Date.now()^0x9e3779b9)>>>0;
function setSeed(s){ SEED=(s>>>0)||1; }
function rnd(){ SEED=(SEED*1664525+1013904223)>>>0; return SEED/4294967296; }
const RI=(a,b)=>Math.floor(rnd()*(b-a+1))+a;
const R=(a,b)=>a+rnd()*(b-a);
const pick=a=>a[Math.floor(rnd()*a.length)];
const clamp=(v,lo=1,hi=100)=>v<lo?lo:v>hi?hi:v;
function gauss(m,sd,lo,hi){ let u=0,v=0; while(!u)u=rnd(); while(!v)v=rnd(); let g=Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); let x=Math.round(m+g*sd); if(lo!=null)x=Math.max(lo,x); if(hi!=null)x=Math.min(hi,x); return x; }
const sigmoid=x=>1/(1+Math.exp(-x));
const d20=v=>Math.max(1,Math.min(20,Math.round(v/5)));   // /100 -> /20 affiché

/* --------------------------- 30 ATTRIBUTS --------------------------------- */
const ATTR={
  tech:[['jab','Jab'],['cross','Direct'],['hook','Crochets'],['kick','Coups de pied'],['clinchStr','Lutte debout'],
        ['takedown','Amenées au sol'],['tdd','Défense lutte'],['topControl','Contrôle au sol'],['gnp','Sol offensif'],
        ['submission','Soumissions'],['guardWork','Jeu de garde']],
  ment:[['fightIQ','Intelligence'],['composure','Sang-froid'],['aggression','Agressivité'],['heart','Cœur'],
        ['discipline','Discipline'],['adaptability','Adaptation'],['killer','Instinct de finition'],['focus','Concentration'],['confidence','Confiance']],
  phys:[['power','Puissance'],['handSpeed','Vitesse des mains'],['footSpeed','Jeu de jambes'],['cardio','Cardio'],
        ['strength','Force'],['chin','Menton'],['recovery','Récupération'],['explosiveness','Explosivité'],['flexibility','Souplesse'],['durability','Résistance']],
};
const ALL_ATTR=[].concat(ATTR.tech,ATTR.ment,ATTR.phys);
const ATTR_KEYS=ALL_ATTR.map(a=>a[0]);
const CHIN='chin';                                  // ne monte jamais
const TRAINABLE=ATTR_KEYS.filter(k=>k!==CHIN);
const attrLabel=k=>(ALL_ATTR.find(a=>a[0]===k)||[k,k])[1];

/* ------------------------- DIVISIONS & STYLES ----------------------------- */
const DIVISIONS={
 H:[{id:'H-fly',name:'Poids mouche',h:168,r:170,kg:56.7},{id:'H-bantam',name:'Poids coq',h:171,r:173,kg:61.2},
    {id:'H-feather',name:'Poids plume',h:173,r:175,kg:65.8},{id:'H-light',name:'Poids léger',h:175,r:178,kg:70.3},
    {id:'H-welter',name:'Poids mi-moyen',h:180,r:184,kg:77.1},{id:'H-middle',name:'Poids moyen',h:184,r:189,kg:83.9},
    {id:'H-lheavy',name:'Poids mi-lourd',h:188,r:193,kg:93.0},{id:'H-heavy',name:'Poids lourd',h:191,r:196,kg:120.2}],
 F:[{id:'F-straw',name:'Poids paille',h:163,r:164,kg:52.2},{id:'F-fly',name:'Poids mouche',h:165,r:166,kg:56.7},
    {id:'F-bantam',name:'Poids coq',h:168,r:169,kg:61.2},{id:'F-feather',name:'Poids plume',h:170,r:172,kg:65.8}],
};
DIVISIONS.H.forEach(d=>d.gender='H'); DIVISIONS.F.forEach(d=>d.gender='F');
const allDivisions=()=>DIVISIONS.H.concat(DIVISIONS.F);
const divById=id=>allDivisions().find(d=>d.id===id);

/* biais de style : quels attributs sont naturellement plus hauts au départ */
const STYLES={
  boxer:{label:'Boxe',b:{jab:8,cross:9,hook:8,handSpeed:8,footSpeed:5,power:4,tdd:3},grap:0.15},
  kickboxer:{label:'Kickboxing',b:{kick:11,cross:8,clinchStr:7,footSpeed:6,power:5,tdd:4},grap:0.2},
  muayThai:{label:'Muay-thaï',b:{kick:11,clinchStr:11,hook:6,strength:5,durability:5,power:4,tdd:4},grap:0.3},
  karate:{label:'Karaté',b:{footSpeed:11,kick:8,jab:6,handSpeed:6,fightIQ:5,tdd:3},grap:0.15},
  wrestler:{label:'Lutte',b:{takedown:9,tdd:9,topControl:8,strength:7,cardio:5},grap:0.77},
  bjj:{label:'Jiu-jitsu',b:{submission:12,guardWork:10,gnp:7,flexibility:6,composure:5,tdd:4,takedown:4},grap:0.72},
  sambo:{label:'Sambo',b:{takedown:8,submission:9,topControl:7,strength:6,heart:5,tdd:4},grap:0.66},
  mma:{label:'MMA complet',b:{fightIQ:7,adaptability:7,cardio:7,tdd:8,cross:7,hook:5,takedown:4,kick:5},grap:0.5},
};
const STYLE_KEYS=Object.keys(STYLES);
const styleLabel=s=>(STYLES[s]||{label:s}).label;

/* ------------------------------ NOMS -------------------------------------- */
const COUNTRIES={
 FR:{name:'France',flag:'🇫🇷',last:['Moreau','Lefevre','Dubois','Girard','Faure','Roussel','Blanc','Mercier']},
 BR:{name:'Brésil',flag:'🇧🇷',last:['Silva','Souza','Oliveira','Costa','Almeida','Pereira','Lima','Rocha']},
 US:{name:'États-Unis',flag:'🇺🇸',last:['Johnson','Williams','Brown','Miller','Davis','Wilson','Carter','Reed']},
 DAG:{name:'Daghestan',flag:'🏔️',last:['Nurmagomedov','Aliev','Magomedov','Gadzhiev','Ramazanov','Shamilov','Umarov']},
 JP:{name:'Japon',flag:'🇯🇵',last:['Sato','Suzuki','Takahashi','Tanaka','Watanabe','Kobayashi','Nakamura']},
 NG:{name:'Nigéria',flag:'🇳🇬',last:['Adeyemi','Okafor','Balogun','Eze','Okoye','Abubakar','Nwosu']},
 GB:{name:'Royaume-Uni',flag:'🇬🇧',last:['Smith','Taylor','Walker','Wright','Hughes','Ward','Bennett']},
 RU:{name:'Russie',flag:'🇷🇺',last:['Volkov','Petrov','Sokolov','Ivanov','Popov','Kozlov','Orlov']},
 MX:{name:'Mexique',flag:'🇲🇽',last:['Hernández','García','Martínez','López','Ramírez','Torres','Flores']},
 IE:{name:'Irlande',flag:'🇮🇪',last:['Murphy','Kelly','OBrien','Byrne','Ryan','Walsh','McCarthy']},
 TH:{name:'Thaïlande',flag:'🇹🇭',last:['Sittichai','Petchyindee','Kiatmoo','Sor','Rungravee']},
 KR:{name:'Corée',flag:'🇰🇷',last:['Kim','Lee','Park','Choi','Jung','Kang','Yoon']},
 CM:{name:'Cameroun',flag:'🇨🇲',last:['Ngannou','Mbappe','Etoo','Nkemdirim','Fotso','Biya']},
 GE:{name:'Géorgie',flag:'🇬🇪',last:['Dvalishvili','Beridze','Kvaratskhelia','Chikadze','Gogitidze']},
};
const COUNTRY_KEYS=Object.keys(COUNTRIES);
/* ==== [ANCRE: COUNTRY_MMA_PREFIX] — 1re lettre du nom FR, 2 lettres si collision
   (Royaume-Uni/Russie et Corée/Cameroun partagent leur 1re lettre). ==== */
const COUNTRY_MMA_PREFIX={FR:'F',BR:'B',US:'E',DAG:'D',JP:'J',NG:'N',GB:'RO',RU:'RU',MX:'M',IE:'I',TH:'T',KR:'CO',CM:'CA',GE:'G'};
/* ==== [FIN ANCRE] ==== */
const FIRST_M=['Alex','Marcus','Diego','Ivan','Kenji','Samuel','Leon','Rashid','Tariq','Bruno','Kai','Omar','Noah','Yuki','Malik','Hugo','Sean','Nikolai','Andre','Felix','Jamal','Ravi','Enzo','Kofi','Dante'];
const FIRST_F=['Amara','Lena','Sofia','Nadia','Yuki','Maya','Zara','Ana','Ines','Kira','Fatima','Nina','Rosa','Aiko','Elena','Sara','Leïla','Tara','Bianca','Hana'];
function makeName(gender,ck,firstOverride){ const c=COUNTRIES[ck]; const first=firstOverride||pick(gender==='F'?FIRST_F:FIRST_M); const last=pick(c.last); return {first,last,name:first+' '+last,flag:c.flag,countryKey:ck}; }

/* ------------------------- CRÉATION D'UN COMBATTANT ----------------------- */
let _id=1;
function makePhysical(div){ const D=div||pick(allDivisions());
  let height=gauss(D.h,4,D.h-9,D.h+11);
  // Allonge découplée de la taille (indice de singe), plutôt que dérivée de D.h/D.r directement
  let apeIndex=gauss(0,5,-8,12); let reach=Math.round(height+apeIndex); if(reach<height-1)reach=height-1;
  const tags=[]; if(apeIndex>=7)tags.push('allonge hors-norme'); if(rnd()<0.02)tags.push('densité rare (type Ngannou)'); if(rnd()<0.02)tags.push('explosivité rare (type Cormier)');
  // Poids de forme (walk weight) fixé à la création : génère un % de coupe typique
  // (moyenne ~9%, quelques profils extrêmes jusqu'à ~24%) converti en kg absolus via
  // la limite de la division de DÉPART. Le % de coupe réel se recalcule ensuite
  // dynamiquement contre la division ACTUELLE (weightCutInfo) — une montée de
  // catégorie forcée (botchedWeightCuts) allège donc mécaniquement la coupe future.
  const cutPct0=gauss(9,5,0,24);
  const walkWeightKg=+(D.kg/(1-cutPct0/100)).toFixed(1);
  return {height,reach,tags,walkWeightKg};
}
/* ------------------ CUTTING — % réel contre la division actuelle ---------------- */
function weightCutInfo(f){ const D=divById(f.div); const limit=D?D.kg:70;
  const walk=(f.phys&&f.phys.walkWeightKg)?f.phys.walkWeightKg:limit;
  const cutKg=Math.max(0,walk-limit); const cutPct=walk>0?(cutKg/walk)*100:0;
  return {limit,walk,cutKg:+cutKg.toFixed(1),cutPct};
}
function baseAttrs(style,level,predis){ const o={}; const bias=(STYLES[style]||{b:{}}).b;
  for(const k of ATTR_KEYS){ let v=gauss(level, 9, 6, 96); if(bias[k])v=clamp(v+bias[k]); o[k]=v; }
  if(predis){ if(predis.includes('densité'))o.power=clamp(o.power+RI(8,16)); if(predis.includes('explosivité')){o.explosiveness=clamp(o.explosiveness+RI(8,14));o.takedown=clamp(o.takedown+RI(5,10));} }
  return o;
}
function makeFighter(opt={}){ const gender=opt.gender||pick(['H','F']);
  const div=divById(opt.div)|| (gender==='H'?pick(DIVISIONS.H):pick(DIVISIONS.F));
  const style=opt.style||pick(STYLE_KEYS); const ck=opt.countryKey||pick(COUNTRY_KEYS);
  const nm=makeName(gender,ck,opt.first);
  const phys=makePhysical(div);
  const level=opt.level!=null?opt.level:gauss(46,10,20,80);
  const attrs=baseAttrs(style,level,phys.tags.join(' '));
  const potential=opt.potential!=null?opt.potential:gauss(64,12,34,97);   // caché
  const dynamic=0;                                                         // moral/forme caché ±
  const mot=pick(MOTIVATIONS); const origin=pick(ORIGINS);
  const f={ id:_id++, gender, div:div.id, divName:div.name, style, styleLabel:styleLabel(style),
    first:nm.first,last:nm.last,name:nm.name,flag:nm.flag,countryKey:ck,
    phys, attrs, potential, dynamic, morale:60, form:55,
    stage:'amateur', org:0, orgWins:0, age:opt.age!=null?opt.age:RI(18,22),
    W:0,L:0,D:0,ko:0,sub:0,dec:0,koLoss:0,streak:0, champion:null, titles:0, defenses:0,
    skills:[], history:[], origin, motivation:mot.short, drive:mot.drive, amaRec:null, amaTitle:false, nick:null, epithets:[] };
  f.overall=overall(f);
  // ==== [ANCRE: GENETIQUE] — jet unique à la création, jamais via rollSkill ====
  const GENETIC_CHANCE=0.10;
  if(rnd()<GENETIC_CHANCE){
    const genPool=SKILLS.filter(s=>s.fam==='gen');
    if(genPool.length>0) grantSkill(f, genPool[Math.floor(rnd()*genPool.length)]);
  }
  // ==== [FIN ANCRE] ====
  return f;
}

/* ------------------- canaux de combat dérivés des 30 attributs ------------ */
function eff(f){ const a=f.attrs; const dyn=(f.morale-50)*0.10+(f.form-50)*0.10; // moral/forme -> ±
  const ch={
    striking: a.jab*0.24+a.cross*0.24+a.hook*0.2+a.kick*0.18+a.clinchStr*0.14 + a.fightIQ*0.06,
    power:    a.power + a.strength*0.12,
    handSpeed:a.handSpeed*0.85 + a.footSpeed*0.15,
    footwork: a.footSpeed*0.8 + a.flexibility*0.2,
    clinch:   a.clinchStr*0.8 + a.strength*0.2,
    takedown: a.takedown*0.78 + a.strength*0.12 + a.explosiveness*0.08,
    tdd:      a.tdd*0.88 + a.strength*0.08 + a.flexibility*0.06 + 2,
    topControl:a.topControl*0.82 + a.strength*0.18,
    ground:   a.gnp*0.82 + a.power*0.18,
    submission:a.submission*0.9 + a.flexibility*0.1,
    guard:    a.guardWork*0.85 + a.flexibility*0.15,
    cardio:   a.cardio*0.82 + a.recovery*0.18,
    chin:     a.chin*0.72 + a.durability*0.28,
    fightIQ:  a.fightIQ*0.7 + a.composure*0.18 + a.adaptability*0.12,
    killer:   a.killer, heart:a.heart, aggression:a.aggression,
  };
  for(const k in ch){ if(k!=='chin'&&k!=='killer'&&k!=='heart'&&k!=='aggression') ch[k]=clamp(ch[k]+dyn,1,100); }
  // bonus de compétences débloquées
  for(const sid of f.skills){ const S=SKILLS.find(s=>s.id===sid); if(S&&S.fx){} }
  return ch;
}
function overall(f){ const a=f.attrs;
  // récompense la spécialisation : le coeur des meilleurs attributs pèse plus
  const vals=ATTR_KEYS.map(k=>a[k]).sort((x,y)=>y-x);
  const top=vals.slice(0,10), topAvg=top.reduce((s,v)=>s+v,0)/top.length;
  const allAvg=vals.reduce((s,v)=>s+v,0)/vals.length;
  let ov=topAvg*0.68+allAvg*0.32 + (f.dynamic||0)*0.3;
  return clamp(Math.round(ov),1,100);
}
function groupAvg(f){ const a=f.attrs; const g=k=>Math.round(k.reduce((s,x)=>s+a[x[0]],0)/k.length);
  return {tech:g(ATTR.tech),ment:g(ATTR.ment),phys:g(ATTR.phys)}; }
/* ------------------ MENACE DE FINITION (remplace "Danger") ---------------- */
function getMenace(f){ const a=f.attrs;
  const menaceScore=(a.power*0.4)+(a.submission*0.4)+(a.killer*0.2);
  return clamp(Math.round(menaceScore),1,100);
}

/* ------------------------------- COMBAT ----------------------------------- */
function reachEdge(A,B){ return clamp((A.phys.reach-B.phys.reach)*0.14,-6,6); }
/* ==== [ANCRE: EQUILIBRAGE_MC] - recalibrage Monte-Carlo (audit d'equilibrage).
   Mesure avant/apres sur 10000+ combats simules : victoire ecrasante a 97%
   des un ecart de niveau modere, soumissions quasi jamais declenchees (4%).
   4 leviers touches : seuil/probabilite de mise au sol, sensibilite du KO
   debout, bruit du score par round, chance de soumission au sol - plus une
   modulation par categorie de poids basee sur la vraie taille des divisions
   (pas une liste de noms). Le filtre par style (kickboxer vs kickboxer ne va
   quasiment jamais au sol, wrestler vs wrestler si) etait DEJA correct et n'a
   pas eu besoin d'etre touche - verifie explicitement avant d'y toucher.
   Complété ici par un journal granulaire (plusieurs lignes de texte par
   round, momentum, dégâts par zone tête/corps/jambes) lu par l'arène —
   AUCUNE formule de résolution du combat n'est modifiée, uniquement des
   sous-événements narratifs générés en plus, pour l'affichage. ==== */
function weightFactor(f){ const divs=DIVISIONS[f.gender]||DIVISIONS.H; const d=divById(f.div);
  if(!d) return 0.5;
  const heights=divs.map(x=>x.h); const min=Math.min(...heights), max=Math.max(...heights);
  return max>min ? (d.h-min)/(max-min) : 0.5; }
function simulateFight(A,B,rounds=3,plan=null){ const a=eff(A),b=eff(B);
  const wf=weightFactor(A);
  const koWeightMult=1+(wf-0.5)*0.5;
  const noiseWeightMult=1+(wf-0.5)*0.4;
  // ==== [FIN ANCRE] ====
  // ==== [ANCRE: PLAN_TACTIQUE] — modificateurs du vestiaire (audit §11), appliqués
  // une seule fois sur les canaux de A avant la boucle des rounds. Clés vérifiées
  // contre les canaux réels de eff() : striking, power, footwork/fightIQ (def),
  // takedown (td), tdd, submission (sub), ground (gnp), topControl (ctrl). ====
  let myGi=STYLES[A.style].grap;
  if(plan){
    if(plan.gi) myGi*=plan.gi;
    if(plan.td) a.takedown*=plan.td;
    if(plan.tdd) a.tdd*=plan.tdd;
    if(plan.str) a.striking*=plan.str;
    if(plan.ko) a.power*=plan.ko;
    if(plan.sub) a.submission*=plan.sub;
    if(plan.gnp) a.ground*=plan.gnp;
    if(plan.ctrl) a.topControl*=plan.ctrl;
    if(plan.def){ a.footwork*=plan.def; a.fightIQ*=plan.def; }
    for(const k in a){ if(typeof a[k]==='number') a[k]=clamp(a[k],1,150); }
  }
  const giA=myGi, giB=STYLES[B.style].grap; const rEdge=reachEdge(A,B);
  let sa=0,sb=0,dmgA=0,dmgB=0,finish=null; const log=[];
  const st={ // statistiques de combat (dmgHead/Body/Legs : purement narratif, additif)
    A:{sig:0,td:0,tdAtt:0,ctrl:0,sub:0,kd:0,dmgHead:0,dmgBody:0,dmgLegs:0},
    B:{sig:0,td:0,tdAtt:0,ctrl:0,sub:0,kd:0,dmgHead:0,dmgBody:0,dmgLegs:0} };
  let momentum=50; // jauge narrative (50=neutre), n'influence aucun calcul de combat
  const formatTime=(k,tot)=>{ let sec=300-Math.floor((k/tot)*300); let m=Math.floor(sec/60); let s=sec%60; return `${m<10?'0':''}${m}:${s<10?'0':''}${s}`; };
  const getTags=f=>(f.skills||[]).map(id=>{ const s=SKILLS.find(x=>x.id===id); return s?(s.tags||[]):[]; }).flat();
  const tagsA=getTags(A), tagsB=getTags(B);
  for(let r=1;r<=rounds && !finish;r++){
    const fatA=clamp((dmgA-a.cardio)*0.06,0,18), fatB=clamp((dmgB-b.cardio)*0.06,0,18);
    const attA=giA*(0.55+rnd()*0.45), attB=giB*(0.55+rnd()*0.45);
    if(attA>0.14)st.A.tdAtt++; if(attB>0.14)st.B.tdAtt++;
    const tdA=attA>0.14?sigmoid((a.takedown-b.tdd)/15)*attA:0;
    const tdB=attB>0.14?sigmoid((b.takedown-a.tdd)/15)*attB:0;
    let grounded=false,topIsA=false; const gTop=Math.max(tdA,tdB);
    if(gTop>0.10 && rnd()<clamp(gTop*1.5,0,0.85)){ grounded=true; topIsA=tdA>=tdB; if(topIsA)st.A.td++; else st.B.td++; }
    if(grounded){ const top=topIsA?a:b, bot=topIsA?b:a, topF=topIsA?A:B, botF=topIsA?B:A, topFat=topIsA?fatA:fatB;
      const control=clamp((top.topControl-bot.guard)*0.32,0,11);
      const gnp=clamp((top.ground*0.5+top.power*0.45)-bot.guard*0.55-topFat,0,45);
      const subTop=clamp(top.submission-bot.guard*0.85,0,45)*(1+top.killer*0.004);
      const subBot=clamp(bot.submission-top.topControl*0.7-top.ground*0.4,0,35);
      const topPts=6+control*0.5+gnp*0.46+subTop*0.22; const botPts=subBot*0.9+clamp(bot.guard-top.topControl,0,22)*0.16+3;
      if(topIsA){sa+=topPts;sb+=botPts;dmgB+=gnp*0.32;st.A.ctrl+=1;st.A.sig+=Math.round(gnp*0.4);} else {sb+=topPts;sa+=botPts;dmgA+=gnp*0.32;st.B.ctrl+=1;st.B.sig+=Math.round(gnp*0.4);}
      const heartR=1-(bot.heart*0.0016);
      const koGnp=clamp((top.power-bot.chin)/56,0,.72)*clamp(gnp/22,0,1)*0.62*(1-bot.fightIQ*0.0022)*heartR;
      const subChT=clamp((top.submission-bot.guard)/17,0,.84)*0.68*(1-bot.fightIQ*0.0022);
      const subChB=clamp((bot.submission-top.guard)/42,0,.7)*0.44*(1-top.fightIQ*0.0022);
      if(rnd()<subChT){finish={by:topF,loser:botF,method:'Soumission',round:r};(topIsA?st.A:st.B).sub++;}
      else if(rnd()<koGnp){finish={by:topF,loser:botF,method:'KO/TKO',round:r,detail:'coups au sol'};(topIsA?st.B:st.A).kd++;}
      else if(rnd()<subChB){finish={by:botF,loser:topF,method:'Soumission',round:r,detail:'par le bas'};(topIsA?st.B:st.A).sub++;}
      // ==== journal granulaire (sol) — 4 sous-événements narratifs, aucun impact sur le calcul ci-dessus ====
      for(let k=0;k<4;k++){
        const isMe=(k===0)?(tdA>=tdB):topIsA;
        momentum=clamp(momentum+(isMe?RI(3,8):-RI(3,8)),5,95);
        const atk=isMe?A:B, def=isMe?B:A, tgs=isMe?tagsA:tagsB;
        const tgt=isMe?st.B:st.A;
        tgt.dmgBody+=RI(0,2); tgt.dmgHead+=RI(0,1);
        let txtPool=k===0?[`Amenée au sol de ${atk.name}.`,`Takedown validé par ${atk.name}.`]:[`${atk.name} consolide son contrôle.`,`${atk.name} maintient une lourde pression.`];
        if(k!==0 && tgs.includes('GNP')) txtPool.push(`${atk.name} fait pleuvoir un lourd Ground & Pound.`);
        if(k!==0 && tgs.includes('Soumission')) txtPool.push(`${atk.name} cherche l\u2019ouverture pour soumettre.`);
        if(k===0 && tgs.includes('Judo')) txtPool.push(`${atk.name} fauche ${def.name} avec un balayage net.`);
        if(plan && isMe){
          if(plan.sub>1.2) txtPool.push(`${atk.name} priorise ouvertement la recherche de soumission.`);
          else if(plan.ctrl>1.2) txtPool.push(`Fidèle à son plan, ${atk.name} consolide sans prendre de risque.`);
          else if(plan.gnp>1.2) txtPool.push(`${atk.name} applique la consigne : frapper à tout prix au sol.`);
        }
        log.push({r,phase:'sol',top:topIsA?'A':'B',by:isMe?'me':'op',text:`[${formatTime(k,4)}] `+pick(txtPool),momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
      }
      if(finish){ const last=log[log.length-1]; last.finish=true; last.method=finish.method;
        last.text=`[00:00] [CRITIQUE] L\u2019arbitre s\u2019interpose ! Victoire par ${finish.method} de ${finish.by.name}.`; }
    } else {
      const offA=a.striking*0.72+a.power*0.35+a.handSpeed*0.22+a.footwork*0.14+a.clinch*0.14+rEdge-b.footwork*0.2-b.fightIQ*0.14-fatA;
      const offB=b.striking*0.72+b.power*0.35+b.handSpeed*0.22+b.footwork*0.14+b.clinch*0.14-rEdge-a.footwork*0.2-a.fightIQ*0.14-fatB;
      const noiseAmt=Math.round(18*noiseWeightMult); const pA=clamp(offA*0.42,0,70)+RI(-noiseAmt,noiseAmt), pB=clamp(offB*0.42,0,70)+RI(-noiseAmt,noiseAmt);
      sa+=pA;sb+=pB;dmgA+=clamp(offB*0.22,0,22);dmgB+=clamp(offA*0.22,0,22);
      st.A.sig+=clamp(Math.round(pA*0.5),0,40); st.B.sig+=clamp(Math.round(pB*0.5),0,40);
      const koA=clamp((a.power-b.chin)/62,0,.93)*clamp((offA-offB)/62+0.46,0,1)*0.6*koWeightMult*(1-b.fightIQ*0.0022)*(1+a.killer*0.003)*(1-b.heart*0.0016);
      const koB=clamp((b.power-a.chin)/62,0,.93)*clamp((offB-offA)/62+0.46,0,1)*0.6*koWeightMult*(1-a.fightIQ*0.0022)*(1+b.killer*0.003)*(1-a.heart*0.0016);
      if(rnd()<koA){finish={by:A,loser:B,method:'KO/TKO',round:r};st.A.kd++;}
      else if(rnd()<koB){finish={by:B,loser:A,method:'KO/TKO',round:r};st.B.kd++;}
      // ==== journal granulaire (debout) — 5 sous-événements narratifs, aucun impact sur le calcul ci-dessus ====
      for(let k=0;k<5;k++){
        const isMe=rnd()<(offA/(offA+offB+1));
        momentum=clamp(momentum+(isMe?RI(4,9):-RI(4,9)),5,95);
        const atk=isMe?A:B, def=isMe?B:A, tgs=isMe?tagsA:tagsB;
        const tgt=isMe?st.B:st.A;
        const rDmg=rnd(); if(rDmg<0.4) tgt.dmgHead+=RI(1,4); else if(rDmg<0.7) tgt.dmgBody+=RI(1,4); else tgt.dmgLegs+=RI(1,4);
        let txtPool=[`${atk.name} touche avec une belle combinaison.`,`${atk.name} trouve l\u2019ouverture en striking.`];
        if(tgs.includes('Kick')) txtPool.push(`${atk.name} claque un lourd kick.`);
        if(tgs.includes('Blitz')) txtPool.push(`${atk.name} explose en blitz !`);
        if(tgs.includes('Sniper')) txtPool.push(`${atk.name} pique à distance avec précision.`);
        if(tgs.includes('Teep')) txtPool.push(`${atk.name} repousse l\u2019assaut d\u2019un teep.`);
        if(plan && isMe){
          if(plan.ko>1.2) txtPool.push(`Conformément au plan, ${atk.name} plante ses appuis pour chercher le coup dur.`);
          else if(plan.def>1.2) txtPool.push(`${atk.name} respecte la consigne : gérer la distance, refuser la guerre.`);
          else if(plan.gi>1.2) txtPool.push(`${atk.name} utilise sa boxe uniquement pour masquer une entrée en lutte.`);
          else if(plan.str>1.2 && (plan.ko||1)<=1.0) txtPool.push(`${atk.name} mise sur un volume de frappes méthodique.`);
        }
        log.push({r,phase:'debout',by:isMe?'me':'op',text:`[${formatTime(k,5)}] `+pick(txtPool),momentum,snapA:{h:st.A.dmgHead,b:st.A.dmgBody,l:st.A.dmgLegs},snapB:{h:st.B.dmgHead,b:st.B.dmgBody,l:st.B.dmgLegs}});
      }
      if(finish){ const last=log[log.length-1]; last.finish=true; last.method=finish.method;
        last.text=`[00:00] [CRITIQUE] KO foudroyant de ${finish.by.name} !`; }
    }
    if(dmgA>45&&rnd()<.4)A.attrs.chin=clamp(A.attrs.chin-1,1);
    if(dmgB>45&&rnd()<.4)B.attrs.chin=clamp(B.attrs.chin-1,1);
  }
  let res;
  if(finish){ finish.moveName=pickFinishMove(finish.by, finish.method==='Soumission'?'sub':'ko');
    res={winner:finish.by===A?'A':'B',method:finish.method,round:finish.round,detail:finish.detail||'',moveName:finish.moveName}; }
  else { const d=sa-sb; res=(Math.abs(d)<5&&rnd()<.5)?{winner:rnd()<.5?'A':'B',method:'Décision partagée'}:{winner:d>=0?'A':'B',method:'Décision'}; }
  res.scoreA=Math.round(sa); res.scoreB=Math.round(sb); res.log=log; res.stats=st; return res;
}
function applyResult(F,opp,res,side){ const win=res.winner===side; const m=res.method;
  if(win){ F.W++; F.streak=Math.max(1,F.streak+1); if(m.startsWith('KO'))F.ko++; else if(m.startsWith('Soum'))F.sub++; else F.dec++; F.morale=clamp(F.morale+RI(6,12),0,100); }
  else { F.L++; F.streak=Math.min(-1,F.streak-1); if(m.startsWith('KO'))F.koLoss++; F.morale=clamp(F.morale-RI(8,16),0,100); }
  F.form=clamp(F.form+(win?RI(3,8):-RI(5,12)),0,100);
  // ==== [ANCRE: META04_06] — planchers de moral. Le jeu n'a pas de système de
  // popularité distinct : ces deux compétences sont adaptées sur `morale`,
  // le champ existant le plus proche (au lieu d'un f.pop qui n'existe pas). ====
  if(F.skills&&F.skills.includes('meta06')){ if(F.morale<75) F.morale=75; }
  else if(F.skills&&F.skills.includes('meta04')){ if(F.morale<45) F.morale=45; }
  // ==== [FIN ANCRE] ====
  F.history.push({res:win?'win':'loss',method:m,round:res.round||null,oppId:opp&&opp.id});
  if(F.history.length>60)F.history=F.history.slice(-60);
  return win;
}
/* ------------------ FINISHERS SIGNATURE — noms de finish débloqués par compétence ---------------- */
const FINISH_MOVES={
 sub:[
  {id:'bjj29',name:'étranglement Anaconda'},{id:'bjj30',name:'Peruvian Necktie'},
  {id:'bjj35',name:'clé de cheville éclair'},{id:'bjj36',name:'Twister'},
  {id:'bjj39',name:'étranglement invisible'},{id:'bjj40',name:'toile de soumissions sans fin'},
  {id:'sambo29',name:'clé arrachée à la force brute'},{id:'sambo35',name:'clé de jambe fatale'},
  {id:'sambo38',name:'broyage articulaire'},{id:'sambo40',name:'double clé du Dernier Empereur'},
 ],
 ko:[
  {id:'karate28',name:'direct du samouraï'},{id:'karate20',name:'coup de pied en crochet à l\u2019angle mort'},
  {id:'boxer28',name:'crochet qui termine tout'},{id:'boxer33',name:'uppercut surgi de nulle part'},
  {id:'boxer36',name:'frappe qu\u2019on ne voit jamais partir'},{id:'boxer40',name:'coup de l\u2019Interrupteur'},
  {id:'kb28',name:'high kick mortel'},{id:'kb40',name:'tibia du Cro Cop'},
  {id:'mt30',name:'coude du chirurgien'},{id:'mt35',name:'genou assassin'},{id:'mt40',name:'tibia de l\u2019Héritier de Buakaw'},
  {id:'wrestler40',name:'takedown destructeur'},{id:'sambo37',name:'enclume du Tsar'},
  {id:'mma30',name:'Ground and Pound de l\u2019enfer'},{id:'mma37',name:'instinct de destruction'},
 ]
};
const GENERIC_SUB=['étranglement arrière (rear-naked choke)','guillotine','kimura','clé de bras (armbar)','triangle','clé de cheville','étranglement de côté (arm-triangle)'];
const GENERIC_KO=['crochet au menton','direct explosif','uppercut','coup de pied à la tête','genou en clinch','coude au sol','enchaînement de coups au sol'];
function pickFinishMove(winner,type){ // type: 'sub' ou 'ko' — priorité aux compétences signature possédées
  const owned=(winner.skills||[]).filter(id=>FINISH_MOVES[type].some(m=>m.id===id));
  if(owned.length){ const chosenId=pick(owned); return FINISH_MOVES[type].find(m=>m.id===chosenId).name; }
  return pick(type==='sub'?GENERIC_SUB:GENERIC_KO);
}
function winProbEstimate(A,B){ const a=eff(A),b=eff(B);
  const oa=A.overall+a.killer*0.05+reachEdge(A,B), ob=B.overall+b.killer*0.05;
  let p=sigmoid((oa-ob)/12); p=clamp(p*100+RI(-8,8),3,97)/100; return p; // bruit volontaire
}

/* ------------------------- ORGS / CLASSEMENT / ÂGE ------------------------ */
const ORGS=['Amateur','Circuit local','Circuit régional','Circuit national','Continentale','Pacific Championship (Gloire)','Ultimate Rim (Argent)'];
const ORG_PROMO_SCORE=[0,100,250,450,650,900,900]; // score ELO requis par palier
/* ==== [ANCRE: ORG_FLAVOR] — Version A validée : cosmétique uniquement, aucune
   incidence mécanique. Amateur (0) et Pacific Championship/Ultimate Rim (5/6, déjà nommés)
   n'ont pas de variante. Noms négociables. ==== */
const ORG_FLAVORS=[
 null,
 ['Octogone MMA','Waouh FC','PVM'],
 ['Calathea','Monstera','Arboricola'],
 ['Philestine','U-Krenne','Konn GO'],
 ['Constrictor','Iguana Iguana','Spatule'],
 null, null
];
function orgDisplayName(f){ if(f.org===0||f.org>=5) return ORGS[f.org]; return f.orgFlavor||ORGS[f.org]; }
/* ==== [FIN ANCRE] ==== */
function canPromote(f){ const n=f.org+1; return n<ORGS.length && (f.orgWins||0)>=3 && p4pScore(f)>=ORG_PROMO_SCORE[n]; }
function p4pScore(f){ const fights=f.W+f.L+f.D;
  if(fights===0) return 0; // statut "non classé" (NR)
  let base=(f.W*45)+(f.ko*20)+(f.sub*20)-(f.L*35)-(f.koLoss*15);
  base+=Math.max(0,f.streak)*12;
  base+=f.defenses*30;
  base+=(f.champion?50:0);
  const leapfrog=f.rankBoost||0;
  if(f.org===5) base*=1.4;
  return Math.max(1, base+leapfrog);
}
function rankPool(list){ return list.slice().sort((x,y)=>p4pScore(y)-p4pScore(x)); }
function isDeclining(f){ return f.age>=(isHeavy(f)?35:33); }
function isHeavy(f){ return f.div==='H-heavy'||f.div==='H-lheavy'; }
function applyAging(f){ const A=f.age; if(isDeclining(f)){ // déclin, poids lourds plus tardif
    const dec=k=>f.attrs[k]=clamp(f.attrs[k]-RI(0,2),1,100);
    dec('footSpeed');dec('handSpeed');dec('cardio');dec('explosiveness'); if(A>=36){dec('power');dec('recovery');} f.attrs.chin=clamp(f.attrs.chin-(A>=35?RI(0,2):0),1,100);
    if(rnd()<0.3) f.morale=clamp(f.morale-5,0,100); // voir ses capacités chuter mine le moral
  } else if(A>=27){ /* pic : stable */ }
  f.age++; f.overall=overall(f);
}
/* ------------------ INFIRMERIE — catalogue de blessures ---------------- */
const INJURY_TYPES=[
 {name:'Déchirure ligamentaire (genou)',fights:5},
 {name:'Fracture orbitale',fights:4},
 {name:'Fracture de la main',fights:3},
 {name:'Commotion cérébrale sévère',fights:3},
 {name:'Entorse grave à la cheville',fights:2},
];
function rollInjury(){ return pick(INJURY_TYPES); }
/* progression BORNÉE : un choix applique un delta net d'attributs ( up/down),
   plafonné par le potentiel — pas d'amélioration infinie. */
function applyDeltas(f,deltas){ const applied=[]; for(const [k,dv] of deltas){
    if(k==='morale'){ f.morale=clamp(f.morale+dv,0,100); applied.push(['Moral',dv]); continue; }
    if(k==='form'){ f.form=clamp(f.form+dv,0,100); applied.push(['Forme',dv]); continue; }
    const before=f.attrs[k]; let after=before+dv;
    if(dv>0) after=Math.min(after, f.potential+4);   // borne haute = potentiel
    f.attrs[k]=clamp(after,1,100); const real=Math.round(f.attrs[k]-before);
    if(real!==0) applied.push({key:k,label:attrLabel(k),delta:real,before,after:f.attrs[k]});
  } f.overall=overall(f); return applied;
}
/* ==== [ANCRE: TIRAGE] — moteur de compétences en deux temps (plan §6/§18).
   Corrigé par rapport à la version brute reçue : les attributs vivent dans
   f.attrs (pas f.stats), le pays est f.countryKey (pas f.country), et le
   générateur aléatoire doit être rnd() (seedé, reproductible) et non
   Math.random(). Bornes /1-100 et recalcul de l'overall ajoutés, comme le
   faisait l'ancien rollSkill(). ==== */
const SKILL_CONSTANTS = {
  BASE_RATE: 0.042, DROUGHT_INC: 0.005, MYTHIC_CHANCE: 0.0009,
  MAX_CAREER_SKILLS: 5, AGE_META: 34,
};
function tirerRarete(){ const roll=rnd()*100;
  if(roll<58.3) return 'C'; if(roll<87.4) return 'R'; if(roll<97.1) return 'E'; return 'L';
}
function poolEligible(f, isEndOfCareer, isCapped){
  return SKILLS.filter(s=>{
    if(f.skills && f.skills.includes(s.id)) return false;
    if(s.fam==='gen') return false;                 // jamais tiré en carrière, seulement à la création
    if(s.fam==='meta') return isEndOfCareer;
    if(isCapped) return false;
    if(s.fam==='style' && s.key===f.style) return true;
    if(s.fam==='country' && s.key===f.countryKey) return true;
    return false;
  });
}
function getFallbackSkill(pool, baseRarity){ const hierarchy=['L','E','R','C'];
  let startIndex=hierarchy.indexOf(baseRarity); if(startIndex===-1) startIndex=0;
  for(let i=startIndex;i<hierarchy.length;i++){ const available=pool.filter(s=>s.rar===hierarchy[i]);
    if(available.length>0) return available[Math.floor(rnd()*available.length)]; }
  return null;
}
function grantSkill(f, skill){ if(!f.skills) f.skills=[]; f.skills.push(skill.id);
  if(skill.fx){ for(const stat in skill.fx){ if(f.attrs && f.attrs[stat]!==undefined) f.attrs[stat]=clamp(f.attrs[stat]+skill.fx[stat],1,100); } }
  f.overall=overall(f); return skill;
}
function rollSkill(f){
  if(!f._drought) f._drought=0; if(!f.skills) f.skills=[];
  let careerCount=0, hasMythic=false;
  f.skills.forEach(skillId=>{ const s=SKILLS.find(x=>x.id===skillId); if(s){ if(s.fam==='style'||s.fam==='country') careerCount++; if(s.rar==='M') hasMythic=true; } });
  const isCapped=careerCount>=SKILL_CONSTANTS.MAX_CAREER_SKILLS;
  const isEndOfCareer=(f.age>=SKILL_CONSTANTS.AGE_META);
  // 1) Jet Mythique — entièrement séparé, testé à CHAQUE combat, indépendant
  //    du plafond et de la sécheresse (sinon il ne se déclenche presque jamais,
  //    comme observé lors des tests : 0% au lieu des ~4%/carrière visés).
  if(!hasMythic && rnd()<SKILL_CONSTANTS.MYTHIC_CHANCE){
    const mythics=SKILLS.filter(s=>s.rar==='M' && s.fam==='style' && s.key===f.style && !(f.skills||[]).includes(s.id));
    if(mythics.length>0) return grantSkill(f, mythics[Math.floor(rnd()*mythics.length)]);
  }
  // 2) Pool éligible pour le tirage normal (style/pays/méta selon contexte)
  const pool=poolEligible(f, isEndOfCareer, isCapped);
  if(pool.length===0) return null;
  const unlockChance=SKILL_CONSTANTS.BASE_RATE + (f._drought*SKILL_CONSTANTS.DROUGHT_INC);
  if(rnd()>unlockChance){ f._drought++; return null; }
  f._drought=0;
  if(isEndOfCareer){ const metaPool=pool.filter(s=>s.fam==='meta');
    if(metaPool.length>0 && rnd()<0.25) return grantSkill(f, metaPool[Math.floor(rnd()*metaPool.length)]); }
  if(isCapped) return null;
  const rarityDrawn=tirerRarete(); const finalSkill=getFallbackSkill(pool, rarityDrawn);
  if(finalSkill) return grantSkill(f, finalSkill);
  return null;
}
/* ==== [FIN ANCRE] ==== */
/* épithètes de fin de carrière (uniques, certains liés à la catégorie) */
function epithets(f){ const e=[]; const fights=f.W+f.L+f.D; const wr=f.W/Math.max(1,fights);
  if(f.ko>=12)e.push('Machine à KO'); if(f.sub>=12)e.push('Le chasseur de cou');
  if(f.titles>=1&&f.L===0)e.push('L\u2019Invaincu'); if(f.defenses>=5)e.push('Le monarque');
  if(f.attrs.power>=92&&/plume|paille|mouche|coq/i.test(f.divName))e.push('Le Ngannou des petits gabarits');
  if(f.skills.includes('bjj29'))e.push('L\u2019Anaconda'); if(f.skills.includes('bjj36'))e.push('Le Tordeur');
  if(f.morale>=85&&f.titles>=1)e.push('Le favori du public'); if(wr>=0.85&&fights>=15)e.push('Le prodige');
  if(f.koLoss>=6)e.push('La guerre l\u2019a marqué'); if(!e.length)e.push('L\u2019artisan de la cage');
  return e;
}
