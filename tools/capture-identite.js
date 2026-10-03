"use strict";
/* Lot 5 H3 : fiches réelles Split et extérieur, longs noms existants,
   origine/surnom, retour souris et clavier, aucun réseau. */
const {chromium}=require('playwright-core');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
const output=path.join(root,'tools','reports','lot-5-h3-identite');
(async()=>{
  if(!fs.existsSync(path.dirname(output))) throw new Error('Dossier de rapport absent');
  fs.mkdirSync(output,{recursive:true});
  const browser=await chromium.launch({headless:true,executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'});
  try{
    const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1,reducedMotion:'reduce'});
    const errors=[],audits=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('console',m=>{if(m.type()==='error') errors.push(m.text());});
    await page.route(/^https?:/,r=>r.abort());
    await page.goto(pathToFileURL(path.join(root,'index.html')).href,{waitUntil:'load'});
    await page.evaluate(()=>{setSeed(20261003);CL.mgmtEnter();CL.mgmtCarte();});
    await page.evaluate(()=>{
      const f=G.mgmt.roster.slice().sort((a,b)=>b.name.length-a.name.length)[0];
      CL.mgmtFicheParIndex(G.mgmt.roster.indexOf(f));
    });
    await page.evaluate(()=>document.fonts.ready);
    for(const width of [1280,1440,1920]){
      await page.setViewportSize({width,height:1080});
      const audit=await page.evaluate(()=>{
        const retour=document.querySelector('.mgmt-fiche-retour'),r=retour.getBoundingClientRect();
        const nick=document.querySelector('.mgmt-fiche-surnom'),cs=getComputedStyle(nick);
        const rgb=s=>(s.match(/[\d.]+/g)||[]).map(Number).slice(0,3);
        const lum=c=>c.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4)
          .reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
        const a=lum(rgb(cs.color)),b=lum(rgb(getComputedStyle(document.querySelector('.mgmt-wrap')).backgroundColor));
        return {width:innerWidth,horizontal:document.documentElement.scrollWidth>innerWidth,
          retourAccessible:document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===retour,
          surnom:nick.textContent,taille:parseFloat(cs.fontSize),contraste:(Math.max(a,b)+.05)/(Math.min(a,b)+.05),
          origine:document.querySelector('.mgmt-fiche-origine').textContent};
      });
      audits.push(audit);
      await page.screenshot({path:path.join(output,'fiche_split_'+width+'.png')});
    }
    await page.locator('.mgmt-fiche-retour').click();
    if(!await page.evaluate(()=>G.screen==='mgmt_carte')) throw new Error('Retour souris incorrect');
    await page.evaluate(()=>{
      CL.go('mgmt_classements');
      const f=G.mgmt.exterieur.slice().sort((a,b)=>
        mgmtExteriorTrace(b,G.mgmt.cycle).name.length-mgmtExteriorTrace(a,G.mgmt.cycle).name.length)[0];
      MGMT_FICHE={id:f.id,retour:'mgmt_classements',cursor:0};CL.go('mgmt_fiche');
    });
    await page.screenshot({path:path.join(output,'fiche_exterieur_1920.png')});
    await page.keyboard.press('Escape');
    if(!await page.evaluate(()=>G.screen==='mgmt_classements')) throw new Error('Retour clavier incorrect');
    await page.goto(pathToFileURL(path.join(root,'maquettes','03-fiche-combattant.html')).href,{waitUntil:'load'});
    await page.evaluate(()=>document.fonts.ready);
    await page.screenshot({path:path.join(output,'maquette_fiche_1920.png')});
    fs.writeFileSync(path.join(output,'audit.json'),JSON.stringify({errors,audits,souris:true,clavier:true},null,2)+'\n');
    if(errors.length||audits.some(a=>a.horizontal||!a.retourAccessible||a.taille<13||a.contraste<4.5))
      throw new Error(JSON.stringify({errors,audits}));
    console.log(JSON.stringify({errors,audits,souris:true,clavier:true},null,2));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
