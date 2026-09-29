"use strict";
/* Reprise F2 : même partie neuve pour les captures avant/après ; le booking
   choisit les deux noms les plus longs compatibles, sans changer le jeu. */
const {chromium}=require('playwright');
const path=require('node:path');
const {pathToFileURL}=require('node:url');

const root=path.resolve(__dirname,'..');
const url=file=>pathToFileURL(path.join(root,file)).href;
const phase=process.argv[2];
if(phase!=='avant'&&phase!=='apres') throw Error('Usage : node tools/capture-f2-reprise.js avant|apres');

async function main(){
  const browser=await chromium.launch({headless:true});
  try{
    const context=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1});
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(url('index.html'),{waitUntil:'load'});
    await page.evaluate(()=>{setSeed(11);CL.mgmtEnter();});
    await page.evaluate(()=>document.fonts.ready);
    const output=(screen)=>path.join(root,'tools','reports','lot-4-fidelite',`f2-reprise-${screen}-${phase}.png`);
    await page.screenshot({path:output('semaine')});
    const pair=await page.evaluate(()=>{
      const m=G.mgmt, rows=mgmtCartRows(m);
      const pairs=[];
      for(const a of rows){
        if(!mgmtSelectable(m,a,null)) continue;
        for(const b of rows){
          if(b.id===a.id||b.div!==a.div||!mgmtSelectable(m,b,a.id)) continue;
          pairs.push([a,b]);
        }
      }
      pairs.sort((x,y)=>Math.min(y[0].name.length,y[1].name.length)-Math.min(x[0].name.length,x[1].name.length)
        ||y[0].name.length+y[1].name.length-x[0].name.length-x[1].name.length);
      const [a,b]=pairs[0];
      /* Allonger les deux noms uniquement dans cette partie de capture :
         composants déjà générés par le jeu, aucune donnée de maquette. */
      const others=m.roster.filter(f=>f.id!==a.id&&f.id!==b.id).sort((x,y)=>y.name.length-x.name.length);
      for(const [f,x,y] of [[a,others[0],others[1]],[b,others[2],others[3]]]){
        f.first+='-'+x.first;
        f.last+='-'+y.last;
        f.name=f.first+' '+f.last;
      }
      CL.mgmtCarte();CL.mgmtPick(a.id);
      MGMT_CART.cursor=mgmtCartRows(m).filter(f=>f.div===a.div).findIndex(f=>f.id===b.id);
      render();
      return [a.name,b.name];
    });
    const intersects=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
    for(const width of [1920,1440,1280]){
      await page.setViewportSize({width,height:1080});
      const geometry=await page.evaluate(()=>{
        const box=selector=>{
          const r=document.querySelector(selector).getBoundingClientRect();
          return {left:r.left,right:r.right,top:r.top,bottom:r.bottom};
        };
        const names=[...document.querySelectorAll('.mgmt-book-nm')];
        return {back:box(document.querySelector('.mgmt-book-return')?'.mgmt-book-return':'.mgmt-head .btn'),left:box('.mgmt-book-a .mgmt-book-nm'),
          right:box('.mgmt-book-b .mgmt-book-nm'),overflow:names.some(n=>n.scrollWidth>n.clientWidth+1)};
      });
      if(phase==='apres'&&(intersects(geometry.back,geometry.left)||intersects(geometry.back,geometry.right)||geometry.overflow)){
        throw Error(`Chevauchement à ${width}px : ${JSON.stringify(geometry)}`);
      }
      console.log(width,geometry);
      if(width===1920) await page.screenshot({path:output('booker')});
    }
    if(errors.length) throw Error(errors.join('\n'));
    console.log(phase,pair,output('semaine'),output('booker'));
  }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
