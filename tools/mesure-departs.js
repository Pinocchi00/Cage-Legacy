"use strict";
/* CAGE LEGACY - mesure du lot 2B T3 : les departs (T3 bis comprise).
   Charge le jeu dans l'ordre reel d'index.html et mesure une fois :
   1. la correspondance publiee du niveau de degradation du menton (T3) :
      perte de chin (declin d'age + traumatisme) -> niveau 0..3 -> age de
      retraite, sur le roster d'ouverture et sur des cas diriges ;
   2. le monde exterieur : ages vivants (médiane, percentiles) aux cycles
      0, 10, 30, 60, 120 et 240, moins de 25 ans par categorie a 240,
      lignes totales (rien n'est supprime), departs cumules (T3 bis :
      les fondateurs reçoivent un passé, les premiers departs tombent dans
      la premiere annee de jeu).
   Aucune ecriture hors tools/reports : le rapport LOT-2B-T3-LES-DEPARTS.md
   cite ces chiffres. */
const { newGameWindow } = require('../tests/helpers/loadGame');

const SEED=20260922;
const CHECKPOINTS=[0,10,30,60,120,240];

function mediane(a){ const s=a.slice().sort((x,y)=>x-y); return s.length?s[Math.floor(s.length/2)]:null; }
function percentile(a,p){ const s=a.slice().sort((x,y)=>x-y); return s.length?s[Math.floor(p*(s.length-1))]:null; }

function measure(){
  const win=newGameWindow();
  const raw=win.eval(`(function(){
    setSeed(${SEED});
    const m=mgmtDefault(); mgmtNewRoster(m); mgmtExteriorEnsure(m);

    /* ---- 1. Correspondance : roster d'ouverture ---- */
    const roster=m.roster.map(f=>{
      const t=mgmtTrauma(f,m.cycle);
      const wear=mgmtAgingWear(f);
      const p=mgmtCombatProfile(f);
      const chin=p&&p.attrs?p.attrs.chin:0;
      const eff=Math.max(1,Math.round(chin*mgmtTraumaFactor(t)));
      const perte=(wear.attrs.chin||0)+Math.max(0,chin-eff);
      return {niveau:mgmtChinDegradationLevel(f,m.cycle),retraite:mgmtRetireAge(f,m.cycle),perte:perte,trauma:t};
    });
    const parNiveau=[0,1,2,3].map(n=>{
      const g=roster.filter(x=>x.niveau===n);
      return {niveau:n,lignes:g.length,
        perteMin:g.length?Math.round(Math.min(...g.map(x=>x.perte))*10)/10:null,
        perteMax:g.length?Math.round(Math.max(...g.map(x=>x.perte))*10)/10:null,
        retraite:g.length?g[0].retraite:null};
    });
    /* Cas diriges : la loi appliquee a des corps types (trauma 0/30/50/70/95). */
    const diriges=[0,30,50,70,95].map(t=>{
      const f={id:'dirige'+t,name:'Dirige Test',first:'Dirige',last:'Test',W:12,L:6,D:0,
        age:27,div:'H-light',divName:'Poids leger',org:'Split',level:1,raison:null,interactions:0};
      if(t>0){ f.trauma=t; f.traumaFloor=t; f.lastCycle=0; }
      return {trauma:t,niveau:mgmtChinDegradationLevel(f,0),retraite:mgmtRetireAge(f,0)};
    });

    /* ---- 2. Le monde exterieur ---- */
    const tri=(a)=>a.slice().sort((x,y)=>x-y);
    const mediane=(a)=>{ const s=tri(a); return s.length?s[Math.floor(s.length/2)]:null; };
    const percentile=(a,p)=>{ const s=tri(a); return s.length?s[Math.floor(p*(s.length-1))]:null; };
    const monde=()=>{
      const ages=[];
      for(const o of m.exterieur){ if(!mgmtExteriorRetired(o,m.cycle)) ages.push(mgmtExteriorTrace(o,m.cycle).age); }
      ages.sort((x,y)=>x-y);
      return {vivants:ages.length,lignes:m.exterieur.length,
        departures:m.exterieur.length-lignesOuverture,
        median:mediane(ages),p10:percentile(ages,0.1),p90:percentile(ages,0.9),
        min:ages[0],max:ages[ages.length-1],
        moins25:ages.filter(a=>a<25).length,partMoins25:Math.round(1000*ages.filter(a=>a<25).length/ages.length)/10};
    };
    const lignesOuverture=m.exterieur.length;
    const fondateurs=m.exterieur.length;
    const fondatricesParties=m.exterieur.filter(o=>o.born<0&&mgmtExteriorRetired(o,0)).length;
    const bornesOuverture=[Math.min.apply(null,m.exterieur.map(o=>o.born)),Math.max.apply(null,m.exterieur.map(o=>o.born))];
    const checkpoints={};
    checkpoints[0]=monde();
    for(let c=1;c<=${CHECKPOINTS[CHECKPOINTS.length-1]};c++){
      m.cycle=c; mgmtExteriorArrive(m);
      if(${JSON.stringify(CHECKPOINTS)}.includes(c)) checkpoints[c]=monde();
    }
    const parCategorie=allDivisions().map(d=>{
      const vivants=m.exterieur.filter(o=>o.div===d.id&&!mgmtExteriorRetired(o,m.cycle));
      const ages=vivants.map(o=>mgmtExteriorTrace(o,m.cycle).age).sort((x,y)=>x-y);
      return {div:d.id,vivants:vivants.length,moins25:ages.filter(a=>a<25).length,
        median:ages.length?ages[Math.floor(ages.length/2)]:null};
    });
    /* Ages vivants du roster a chaque checkpoint (la retraite d'age du
       roster ne survient pas dans la fenetre mesuree : roster 22-35 ans). */
    const rosterAges=m.roster.map(o=>o.age);
    return JSON.stringify({rosterN:m.roster.length,parNiveau,diriges,
      fondateurs:fondateurs,fondatricesParties:fondatricesParties,
      bornesOuverture:bornesOuverture,rosterAgesMin:Math.min.apply(null,rosterAges),
      rosterAgesMax:Math.max.apply(null,rosterAges),
      checkpoints,parCategorie,cycle:m.cycle});
  })()`);
  return JSON.parse(raw);
}

const r=measure();
console.log(JSON.stringify(r,null,2));
/* Garde de sortie : le monde se renouvelle (cohortes fondatrices passées,
   quota tenu, moins de 25 ans a tout point de mesure, médiane entre 28 et
   34 ans sans vague, premiers departs dans la premiere annee — T3 bis) ;
   la correspondance est monotone. */
const monotone=r.diriges.every((d,i)=>i===0||d.retraite<=r.diriges[i-1].retraite);
const quotaOK=r.parCategorie.every(d=>d.vivants===30);
const checkpoints=[0,10,30,60,120,240];
const jeunesToutCycle=checkpoints.every(c=>r.checkpoints[c].moins25>0);
const medianeStable=checkpoints.every(c=>r.checkpoints[c].median>=28&&r.checkpoints[c].median<=34);
const departsPrecoces=r.checkpoints[10].departures>0;
if(!monotone||!quotaOK||!jeunesToutCycle||!medianeStable||!departsPrecoces) process.exitCode=1;
