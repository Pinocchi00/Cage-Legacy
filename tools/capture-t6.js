"use strict";
/* Capture T6 : jeu r�el � 1920x1080, �chantillon des classements. Outil de
   relecture (playwright-core install� --no-save, Chromium du syst�me). */
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
    const lum=hex=>{const rgb=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4);return rgb[0]*0.2126+rgb[1]*0.7152+rgb[2]*0.0722;};
    const ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
    console.log(JSON.stringify({ges:errs.length,auditNu:audit.length}));
    fs.writeFileSync(path.join(output,'audit.json'),JSON.stringify(audit,null,1));
    console.log('captures : '+output);
    if(errs.length) console.log('ERREURS PAGE : '+errs.join(' | '));
  }finally{ await browser.close(); }
})();
