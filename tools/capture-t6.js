"use strict";
/* Capture T6 : jeu réel à 1920×1080 (1280, 1440 et 1920 pour l'audit de
   recouvrement), échantillon des classements. Outil de relecture
   (playwright-core installé --no-save, Chromium du système). */
const {chromium}=require('playwright-core');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
const output=path.join(root,'tools','reports','lot-4-t6-classements');
(async()=>{
  fs.mkdirSync(output,{recursive:true});
  const browser=await chromium.launch({headless:true,executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'});
  try{
    const context=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1});
    const page=await context.newPage();
    const errs=[];
    page.on('pageerror',e=>errs.push(e.message));
    await page.goto(pathToFileURL(path.join(root,'index.html')).href,{waitUntil:'load'});
    await page.evaluate(async()=>{ await document.fonts.ready; setSeed(11);
      CL.mgmtEnter();
      for(let c=0;c<9&&!G.mgmt.hist.some(()=>true);c++){
        const m=G.mgmt;
        m.card.main=[]; m.card.prelims=[];
        const dispo=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o));
        for(let i=0;i<5&&i*2+1<dispo.length;i++) m.card.main.push({a:dispo[2*i].id,b:dispo[2*i+1].id,cycle:m.cycle,slot:'main'});
        for(let i=0;i<4&&i*2+1<dispo.length-10;i++) m.card.prelims.push({a:dispo[10+2*i].id,b:dispo[11+2*i].id,cycle:m.cycle,slot:'prelim'});
        if(!mgmtCardFull(m)) break;
        if(!mgmtRunEvent(m)) break;
        mgmtNewPile(m);
      }
      CL.go('mgmt_classements');
    });
    await page.evaluate(()=>document.fonts.ready);

    /* Audit de recouvrement (point 2 de la reprise) : deux lignes de
       classement ne peuvent pas se chevaucher, à 1280, 1440 et 1920 —
       et chaque ligne contient son contenu (une cellule compressée qui
       déborde visuellement ne se voit pas sur les rects des lignes). */
    async function auditRecouvrement(largeur){
      await page.setViewportSize({width:largeur,height:1080});
      await page.evaluate(()=>render());
      const r=await page.evaluate(()=>{
        function chevauche(){
          const rows=[...document.querySelectorAll('.mgmt-cl-row')]
            .filter(a=>a.getBoundingClientRect().height>0);
          for(let i=0;i<rows.length-1;i++){
            const a=rows[i].getBoundingClientRect(), b=rows[i+1].getBoundingClientRect();
            if(a.bottom>b.top+0.5) return {quoi:'ligne sur ligne',i:i,ecart:+(a.bottom-b.top).toFixed(1)};
          }
          for(const row of rows){
            const R=row.getBoundingClientRect();
            for(const child of row.children){
              const c=child.getBoundingClientRect();
              if(c.bottom>R.bottom+0.5) return {quoi:'contenu hors de sa ligne',i:rows.indexOf(row),
                cell:child.className,deborde:+(c.bottom-R.bottom).toFixed(1)};
            }
          }
          return null;
        }
        return chevauche();
      });
      return {largeur,echec:r};
    }
    const recouvrements=[];
    const divIds=await page.evaluate(()=>allDivisions().map(d=>d.id));
    for(const L of [1280,1440,1920]){
      for(const d of divIds){
        await page.evaluate(dd=>{ CL.mgmtClassementsTab(dd); CL.mgmtClassementsScope('world'); },d);
        recouvrements.push(await auditRecouvrement(L));
      }
    }
    const echecs=recouvrements.filter(x=>x.echec);
    if(echecs.length) console.log('RECOUVREMENTS : '+JSON.stringify(echecs));
    else console.log('recouvrement : aucun contenu hors de sa ligne, aucune ligne sur une autre, à 1280/1440/1920 ('+recouvrements.length+' audits)');

    await page.setViewportSize({width:1920,height:1080});
    await page.evaluate(()=>{ CL.mgmtClassementsTab('H-fly'); });
    await page.screenshot({path:path.join(output,'classements-mondial-1920.png')});
    await page.evaluate(()=>CL.mgmtClassementsTab('H-light'));
    await page.screenshot({path:path.join(output,'classements-legere-1920.png')});
    await page.evaluate(()=>CL.mgmtClassementsScope('split'));
    await page.screenshot({path:path.join(output,'classements-split-1920.png')});
    // Contrastes et tailles utiles (charte L2/L3).
    const audit=await page.evaluate(()=>{
      const sels=['.mgmt-cl-rank','.mgmt-cl-nm','.mgmt-cl-rec','.mgmt-cl-org','.mgmt-cl-trend','.mgmt-cl-move','.mgmt-cl-hd','.mgmt-cl-tab'];
      return sels.flatMap(sel=>[...document.querySelectorAll(sel)].map(el=>({sel,color:getComputedStyle(el).color,size:parseFloat(getComputedStyle(el).fontSize)})));
    });
    console.log(JSON.stringify({ges:errs.length,auditNu:audit.length}));
    fs.writeFileSync(path.join(output,'audit.json'),JSON.stringify(audit,null,1));
    console.log('captures : '+output);
    if(errs.length) console.log('ERREURS PAGE : '+errs.join(' | '));
    if(echecs.length) process.exitCode=1;
  }finally{ await browser.close(); }
})();
