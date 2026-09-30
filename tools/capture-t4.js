"use strict";
/* Captures du jeu réel et de la maquette 06 en 1920×1080, côte à côte.
   Exécution : node tools/capture-t4.js lendemain
   (même motif que tools/capture-f2.js, lot 4 F2). */
const {chromium}=require('playwright-core');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
const url=p=>pathToFileURL(path.join(root,p)).href;
const screens={
  lendemain:['06-le-lendemain.html',function(){
    /* Une vraie soirée puis l'écran du lendemain. */
    const m=G.mgmt;
    mgmtNewPile(m);
    m.card.main=[];
    const dispo=m.roster.filter(o=>mgmtAvailable(m,o)&&!mgmtEngaged(m,o));
    if(dispo.length<10) throw new Error('fixture : roster trop court');
    for(let i=0;i<5;i++) m.card.main.push({a:dispo[2*i].id,b:dispo[2*i+1].id,cycle:m.cycle,slot:'main'});
    m.pile=[]; m.open=null;
    if(mgmtClosePile(m)!=='refill') throw new Error('pas de proposition en bloc');
    const bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open');
    if(!bulk||!mgmtDecide(m,bulk.id,'validate')) throw new Error('pas de proposition en bloc');
    if(!mgmtRunEvent(m)) throw new Error('soirée non jouée');
    CL.go('mgmt_lendemain');
  }]
};
async function main(){
  const label=process.argv[2], entry=screens[label];
  if(!entry) throw Error('Choisir lendemain');
  const browser=await chromium.launch({headless:true});
  try{
    const ctx=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1});
    const game=await ctx.newPage(), errors=[];
    game.on('pageerror',e=>errors.push(e.message));
    await game.goto(url('index.html'),{waitUntil:'domcontentloaded',timeout:60000});
    await game.evaluate(()=>{setSeed(11);CL.mgmtEnter();});
    await game.evaluate(entry[1]);
    await game.evaluate(()=>document.fonts.ready);
    const shot=await game.screenshot();
    const sample=await ctx.newPage();
    await sample.goto(url('maquettes/'+entry[0]),{waitUntil:'domcontentloaded',timeout:60000});
    await sample.addStyleTag({content:`@font-face{font-family:'Saira';src:url('${url('fonts/saira-latin.woff2')}');font-weight:300 600}@font-face{font-family:'Saira Condensed';src:url('${url('fonts/condensed-700-latin.woff2')}');font-weight:700}@font-face{font-family:'Saira Condensed';src:url('${url('fonts/condensed-800-latin.woff2')}');font-weight:800}@font-face{font-family:'Saira Condensed';src:url('${url('fonts/condensed-600-latin.woff2')}');font-weight:600}`});
    await sample.evaluate(()=>document.fonts.ready);
    const reference=await sample.screenshot();
    const compare=await ctx.newPage({viewport:{width:3840,height:1080}});
    await compare.setContent(`<body style="margin:0;display:flex"><img width="1920" height="1080" src="data:image/png;base64,${shot.toString('base64')}"><img width="1920" height="1080" src="data:image/png;base64,${reference.toString('base64')}"></body>`);
    const out=path.join(root,'tools','reports','lot-4-fidelite','t4-lendemain-vs-06.png');
    await compare.screenshot({path:out});
    for(const width of [1440,1280]){
      await game.setViewportSize({width,height:1080});
      const layout=await game.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth,
        nav:document.querySelector('.mgmt-nav').getBoundingClientRect().top}));
      if(layout.document>width) throw Error(label+' à '+width+'px : défilement horizontal '+layout.document+'px');
      if(Math.abs(layout.nav-40)>2) throw Error(label+' à '+width+'px : navigation à '+layout.nav+'px au lieu de 40px');
    }
    if(errors.length) throw Error(errors.join('\n'));
    console.log(out);
  }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
