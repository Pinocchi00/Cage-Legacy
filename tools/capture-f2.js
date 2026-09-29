"use strict";
/* Captures du jeu réel et de la maquette en 1920×1080, côte à côte.
   Exécution : node tools/capture-f2.js semaine|booker|fiche|organisation */
const {chromium}=require('playwright');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
const url=p=>pathToFileURL(path.join(root,p)).href;
const screens={
  semaine:['02-semaine.html',()=>{}],
  booker:['04-booker-un-combat.html',()=>{CL.mgmtCarte();const m=G.mgmt;
    const a=mgmtCartRows(m).find(f=>mgmtSelectable(m,f,null)&&mgmtCartRows(m).some(b=>b.div===f.div&&b.id!==f.id&&mgmtSelectable(m,b,f.id)));
    CL.mgmtPick(a.id);
    MGMT_CART.cursor=mgmtCartRows(m).filter(f=>f.div===a.div).findIndex(f=>f.id!==a.id&&mgmtSelectable(m,f,a.id));
    render();}],
  fiche:['03-fiche-combattant.html',()=>{CL.mgmtFiche(G.mgmt.roster[0].id);}],
  organisation:['08-organisation.html',()=>{CL.go('mgmt_organisation');}]
};
async function main(){
  const label=process.argv[2], entry=screens[label];
  if(!entry) throw Error('Choisir semaine, booker, fiche ou organisation');
  const browser=await chromium.launch({headless:true});
  try{
    const ctx=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1});
    const game=await ctx.newPage(), errors=[];
    game.on('pageerror',e=>errors.push(e.message));
    await game.goto(url('index.html'),{waitUntil:'load'});
    await game.evaluate(()=>{setSeed(11);CL.mgmtEnter();});
    await game.evaluate(entry[1]);
    await game.evaluate(()=>document.fonts.ready);
    const shot=await game.screenshot();
    const sample=await ctx.newPage();
    await sample.goto(url('maquettes/'+entry[0]),{waitUntil:'load'});
    await sample.addStyleTag({content:`@font-face{font-family:'Saira';src:url('${url('fonts/saira-latin.woff2')}');font-weight:300 600}@font-face{font-family:'Saira Condensed';src:url('${url('fonts/condensed-700-latin.woff2')}');font-weight:700}@font-face{font-family:'Saira Condensed';src:url('${url('fonts/condensed-800-latin.woff2')}');font-weight:800}@font-face{font-family:'Saira Condensed';src:url('${url('fonts/condensed-600-latin.woff2')}');font-weight:600}`});
    await sample.evaluate(()=>document.fonts.ready);
    const reference=await sample.screenshot();
    const compare=await ctx.newPage({viewport:{width:3840,height:1080}});
    await compare.setContent(`<body style="margin:0;display:flex"><img width="1920" height="1080" src="data:image/png;base64,${shot.toString('base64')}"><img width="1920" height="1080" src="data:image/png;base64,${reference.toString('base64')}"></body>`);
    const out=path.join(root,'tools','reports','lot-4-fidelite','f2-'+label+'-vs-'+entry[0].slice(0,2)+'.png');
    await compare.screenshot({path:out});
    if(errors.length) throw Error(errors.join('\n'));
    console.log(out);
  }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
