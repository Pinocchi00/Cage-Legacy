"use strict";
/* ==== [ANCRE: LOT4_T8A_VERIFICATION] — vérification dans Chromium réel.
   Contraste mesuré sur le fond rendu (capture sans texte), polices, tailles,
   débordements et parcours souris/clavier. Aucun changement du moteur. ==== */
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
const output=path.join(root,'tools','reports','lot-4-fidelite');
const url=file=>pathToFileURL(path.join(root,file)).href;
const phase=process.argv[2]||'da';

async function pair(page,context,label,mock){
  await page.evaluate(()=>document.fonts.ready);
  const game=await page.screenshot({path:path.join(output,`${label}-jeu-1920.png`)});
  const sample=await context.newPage();
  await sample.goto(url(mock),{waitUntil:'load'});
  // Les maquettes utilisent Google ; la référence charge les mêmes fontes
  // locales que le jeu, y compris sans réseau, sans modifier ses textes.
  const faces=[500,600,700,800].map(w=>`@font-face{font-family:'Saira Condensed';src:url('${url(`fonts/condensed-${w}-latin.woff2`)}');font-weight:${w}}`).join('');
  await sample.addStyleTag({content:`@font-face{font-family:'Saira';src:url('${url('fonts/saira-latin.woff2')}');font-weight:300 600}${faces}`});
  await sample.evaluate(()=>document.fonts.ready);
  const reference=await sample.screenshot({path:path.join(output,`${label}-maquette-1920.png`)});
  await sample.close();
  const compare=await context.newPage();
  await compare.setViewportSize({width:3840,height:1080});
  await compare.setContent(`<html><body style="margin:0;display:flex"><img width="1920" height="1080" src="data:image/png;base64,${game.toString('base64')}"><img width="1920" height="1080" src="data:image/png;base64,${reference.toString('base64')}"></body></html>`);
  await compare.screenshot({path:path.join(output,`${label}-comparaison-1920.png`)});
  await compare.close();
}

async function accueil(page,context,errors){
  const reports=[];
  if(await page.locator('.title-aside').count()) throw Error('Partie neuve : reprise fictive');
  reports.push(await audit(page,'accueil sans partie'));
  await page.getByRole('button',{name:/^Management/}).click();
  await page.evaluate(()=>{
    const m=G.mgmt;
    for(const a of m.roster){
      const b=m.roster.find(b=>b.id!==a.id&&b.div===a.div&&mgmtAvailable(m,b)&&!mgmtEngaged(m,b));
      if(b) mgmtBookMain(m,a.id,b.id);
      if(m.card.main.length===m.card.sizeMain) break;
    }
    m.pile=[];m.open=null;
    mgmtClosePile(m);
    const bulk=m.pile.find(a=>a.kind==='leila_bulk'&&a.status==='open');
    if(!bulk||!mgmtDecide(m,bulk.id,'validate')||!mgmtRunEvent(m)) throw Error('Préparer une vraie soirée');
    MGMT_SOIREE.index=m.lastEvent.fights.length;
    CL.mgmtSoireeNext();
    if(G.screen==='mgmt_lendemain') CL.mgmtLendemainNext();
    CL.mgmtLeave();
  });
  for(const width of [1920,1440,1280]){
    await page.setViewportSize({width,height:1080});
    reports.push(await audit(page,`accueil ${width}`));
    if(width===1920) await pair(page,context,'t8a-accueil','maquettes/01-accueil.html');
  }
  await page.setViewportSize({width:1920,height:1080});
  await page.locator('.title-event summary').click();
  if(await page.locator('.title-event li:visible').count()!==await page.evaluate(()=>G.mgmt.lastEvent.fights.length)) throw Error('Tous les résultats doivent être accessibles');
  await page.locator('.title-event summary').click();
  // Une activation native au clavier et une reprise persistée après rechargement.
  await page.locator('.title-mode').nth(1).focus();await page.keyboard.press('Enter');
  if(await page.evaluate(()=>G.screen)!=='intro') throw Error('Entrée carrière au clavier');
  await page.evaluate(()=>CL.go('title'));
  await page.reload({waitUntil:'load'});
  await page.locator('.title-resume').click();
  if(await page.evaluate(()=>G.screen)!=='mgmt_bureau') throw Error('Reprise management à froid');
  if(errors.length) throw Error(errors.join('\n'));
  fs.writeFileSync(path.join(output,'t8a-accueil-audit.json'),JSON.stringify({reports,consoleErrors:errors,mouseAndKeyboard:true,coldResume:true},null,2)+'\n');
}

async function audit(page,label){
  await page.mouse.move(0,0);
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(450);
  // Chromium finalise aussi les métriques des contrôles natifs à la capture.
  await page.screenshot();
  const texts=await page.evaluate(()=>{
    const result=[];
    for(const el of document.querySelectorAll('#app *')){
      if(el.closest('[disabled],.locked,.ach.lk,.ach.prog')) continue;
      if(el.closest('details:not([open])')&&!el.closest('summary')) continue;
      const cs=getComputedStyle(el);
      let opacity=1;
      for(let p=el;p;p=p.parentElement) opacity*=Number(getComputedStyle(p).opacity);
      if(opacity<.4||cs.visibility!=='visible'||cs.display==='none') continue;
      for(const node of el.childNodes){
        if(node.nodeType!==3||!node.textContent.trim()) continue;
        const range=document.createRange();range.selectNodeContents(node);
        for(const r of range.getClientRects()){
          if(r.width<2||r.height<2||r.bottom<0||r.top>innerHeight||r.left<0||r.right>innerWidth) continue;
          result.push({text:node.textContent.trim(),color:cs.color,opacity,size:parseFloat(cs.fontSize),font:cs.fontFamily,
            rect:{x:r.x,y:r.y,width:r.width,height:r.height}});
        }
      }
    }
    return result;
  });
  const hidden=await page.addStyleTag({content:'#app *{transition:none!important;color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important}'});
  const background=await page.screenshot();
  await hidden.evaluate(el=>el.remove());
  const measured=await page.evaluate(async({texts,image})=>{
    const img=new Image();img.src=image;await img.decode();
    const cv=document.createElement('canvas');cv.width=img.width;cv.height=img.height;
    const cx=cv.getContext('2d');cx.drawImage(img,0,0);
    const pixels=cx.getImageData(0,0,cv.width,cv.height).data;
    const colorCanvas=document.createElement('canvas');colorCanvas.width=colorCanvas.height=1;
    const cc=colorCanvas.getContext('2d');
    const lum=rgb=>rgb.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4)
      .reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
    return texts.map(row=>{
      cc.clearRect(0,0,1,1);cc.fillStyle=row.color;cc.fillRect(0,0,1,1);
      const fg=[...cc.getImageData(0,0,1,1).data].slice(0,3);
      let contrast=Infinity,backgroundRGB=null;
      for(const px of [.15,.5,.85]) for(const py of [.25,.5,.75]){
        const x=Math.max(0,Math.min(cv.width-1,Math.floor(row.rect.x+row.rect.width*px)));
        const y=Math.max(0,Math.min(cv.height-1,Math.floor(row.rect.y+row.rect.height*py)));
        const n=(y*cv.width+x)*4,bg=[...pixels.slice(n,n+3)];
        const a=lum(fg.map((v,i)=>v*row.opacity+bg[i]*(1-row.opacity))),b=lum(bg);
        const value=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
        if(value<contrast){contrast=value;backgroundRGB=bg;}
      }
      return {...row,foregroundRGB:fg,backgroundRGB,contrast:Number(contrast.toFixed(2))};
    });
  },{texts,image:'data:image/png;base64,'+background.toString('base64')});
  const failures=measured.filter(r=>r.contrast<4.5||r.size<13||/Oswald|Fraunces|JetBrains/.test(r.font));
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  const report={label,texts:measured.length,minimumContrast:Math.min(...measured.map(r=>r.contrast)),minimumSize:Math.min(...measured.map(r=>r.size)),overflow,failures};
  console.log(JSON.stringify(report));
  if(overflow||failures.length) throw Error(`${label} : audit échoué`);
  return report;
}

async function main(){
  if(!fs.existsSync(output)) throw Error('Le dossier de rapports doit exister');
  const browser=await chromium.launch({headless:true});
  try{
    const context=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1});
    await context.route(/^https?:/,route=>route.abort());
    const page=await context.newPage(),errors=[],reports=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(url('index.html'),{waitUntil:'load'});
    if(phase==='accueil'){await accueil(page,context,errors);return;}
    await page.evaluate(()=>{setSeed(11);CL.newCareer();});
    reports.push(await audit(page,'création'));
    await page.evaluate(()=>{G.draft.first='Anthony';CL.create();});
    for(const screen of ['hub','profile','rankings','history','beltLineage','retire']){
      await page.evaluate(s=>CL.go(s),screen);
      reports.push(await audit(page,screen));
    }
    await page.evaluate(()=>{CL.go('hub');CL.fightSelect();});
    reports.push(await audit(page,'sélection'));
    await page.evaluate(()=>{CL.toLegacy();CL.exitLegacy();CL.duelEnter();});
    reports.push(await audit(page,'duel'));
    if(errors.length) throw Error(errors.join('\n'));
    fs.writeFileSync(path.join(output,'t8a-da-audit.json'),JSON.stringify({viewport:1920,reports,consoleErrors:errors},null,2)+'\n');
  }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
