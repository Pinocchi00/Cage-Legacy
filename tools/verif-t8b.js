"use strict";
/* ==== [ANCRE: LOT4_T8B_PREUVES] — Chromium réel, carrière jouée par les
   actions existantes, préparation sauvegardée puis reprise, comparaison 10,
   mesures sur les pixels du fond et parcours souris / clavier. ==== */
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
const output=path.join(root,'tools','reports','lot-4-fidelite');
const url=file=>pathToFileURL(path.join(root,file)).href;

async function audit(page,label){
  await page.mouse.move(0,0);
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(400);
  const geometry=await page.evaluate(()=>{
    const screen=document.querySelector('.career-screen'),columns=document.querySelector('.career-columns');
    const texts=[],overflow=[];
    for(const el of screen.querySelectorAll('*')){
      if(el.closest('details:not([open])')&&!el.closest('summary')) continue;
      const cs=getComputedStyle(el),r=el.getBoundingClientRect();
      if(!r.width||!r.height||cs.visibility==='hidden'||cs.display==='none') continue;
      if(r.left<0||r.right>innerWidth+1||(!el.children.length&&el.scrollWidth>el.clientWidth+1)) overflow.push({tag:el.tagName,text:el.textContent});
      for(const node of el.childNodes){
        if(node.nodeType!==3||!node.textContent.trim()) continue;
        const range=document.createRange();range.selectNodeContents(node);
        for(const r of range.getClientRects()){
          if(r.top>=innerHeight||r.bottom<0) continue;
          texts.push({text:node.textContent.trim(),color:cs.color,size:parseFloat(cs.fontSize),font:cs.fontFamily,
            rect:{x:r.x,y:r.y,width:r.width,height:r.height}});
        }
      }
    }
    return {padding:getComputedStyle(screen).padding,columns:columns&&getComputedStyle(columns).gridTemplateColumns,
      title:getComputedStyle(screen.querySelector('h1')).fontSize,
      history:[...screen.querySelectorAll('.career-history-row')].map(e=>getComputedStyle(e).gridTemplateColumns),
      horizontalScroll:document.documentElement.scrollWidth>innerWidth,overflow,texts};
  });
  const hidden=await page.addStyleTag({content:'.career-screen *{transition:none!important;color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important}'});
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
      let contrast=Infinity;
      for(const px of [.15,.5,.85]) for(const py of [.25,.5,.75]){
        const x=Math.max(0,Math.min(cv.width-1,Math.floor(row.rect.x+row.rect.width*px)));
        const y=Math.max(0,Math.min(cv.height-1,Math.floor(row.rect.y+row.rect.height*py)));
        const n=(y*cv.width+x)*4,bg=[...pixels.slice(n,n+3)],a=lum(fg),b=lum(bg);
        contrast=Math.min(contrast,(Math.max(a,b)+.05)/(Math.min(a,b)+.05));
      }
      return {...row,contrast:Number(contrast.toFixed(2))};
    });
  },{texts:geometry.texts,image:'data:image/png;base64,'+background.toString('base64')});
  const failures=measured.filter(r=>r.contrast<4.5||r.size<18||!/Saira/.test(r.font));
  const report={label,...geometry,texts:measured,minimumContrast:Math.min(...measured.map(r=>r.contrast)),failures};
  if(geometry.horizontalScroll||geometry.overflow.length||failures.length) throw Error(JSON.stringify(report,null,2));
  console.log(JSON.stringify({label,columns:report.columns,padding:report.padding,title:report.title,minimumContrast:report.minimumContrast}));
  return report;
}

async function pair(page,context,width,reference){
  const game=await page.screenshot({path:path.join(output,`t8b-carriere-jeu-${width}.png`)});
  const compare=await context.newPage();
  await compare.setViewportSize({width:width*2,height:1080});
  // À 1920, deux vues natives ; aux autres tailles la référence 1920 est
  // réduite proportionnellement, car la maquette n'a pas de responsive.
  await compare.setContent(`<html><body style="margin:0;display:flex;background:#211B1E"><img width="${width}" height="1080" src="data:image/png;base64,${game.toString('base64')}"><img style="align-self:flex-start" width="${width}" src="data:image/png;base64,${reference.toString('base64')}"></body></html>`);
  await compare.screenshot({path:path.join(output,`t8b-carriere-comparaison-${width}.png`)});
  await compare.close();
}

async function walkthrough(browser,storage){
  const context=await browser.newContext({viewport:{width:1440,height:1080},deviceScaleFactor:1,
    recordVideo:{dir:'C:\\Users\\antho\\AppData\\Local\\Temp\\opencode',size:{width:1440,height:1080}}});
  await context.route(/^https?:/,route=>route.abort());
  await context.addInitScript(items=>{for(const [key,value] of items) localStorage.setItem(key,value);},storage);
  const page=await context.newPage(),errors=[],video=page.video();
  page.on('pageerror',e=>errors.push(e.message));
  try{
    await page.goto(url('index.html'),{waitUntil:'load'});
    await page.getByRole('button',{name:/^Carrière/}).click();
    await page.getByRole('button',{name:'Reprendre le dossier'}).click();
    await page.waitForTimeout(700);
    await page.locator('.career-dossier summary').click();await page.waitForTimeout(500);
    await page.getByRole('button',{name:'Classements',exact:true}).click();await page.waitForTimeout(500);
    await page.locator('[onclick^="CL.viewCareerOpponent"]').first().click();await page.waitForTimeout(700);
    if(await page.evaluate(()=>G.screen)!=='opponent_card') throw Error('Vidéo : fiche à la souris');
    await page.locator('.career-header button').click();
    await page.getByRole('button',{name:'← Revenir au hub'}).click();await page.waitForTimeout(500);
    await page.locator('.career-home').focus();
    for(let i=0;i<4;i++){await page.keyboard.press('Tab');await page.waitForTimeout(350);}
    if(!await page.locator('.career-next button').evaluate(e=>e===document.activeElement)) throw Error('Vidéo : étude atteinte par Tab');
    await page.keyboard.press('Enter');await page.waitForTimeout(700);
    if(await page.evaluate(()=>G.screen)!=='opponent_card') throw Error('Vidéo : fiche au clavier');
    await page.keyboard.press('Tab');await page.keyboard.press('Enter');await page.waitForTimeout(500);
    if(await page.evaluate(()=>G.screen)!=='hub') throw Error('Vidéo : retour au clavier');
    if(errors.length) throw Error(errors.join('\n'));
    await page.close();await context.close();
    await video.saveAs(path.join(output,'t8b-carriere-souris-clavier-1440.webm'));
  }finally{await context.close();}
}

async function main(){
  if(!fs.existsSync(output)) throw Error('Dossier de rapports absent');
  const browser=await chromium.launch({headless:true});
  try{
    const context=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1});
    await context.route(/^https?:/,route=>route.abort());
    const page=await context.newPage(),errors=[],reports=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('console',m=>{if(m.type()==='error') errors.push(m.text());});
    await page.goto(url('index.html'),{waitUntil:'load'});
    await page.getByRole('button',{name:/^Carrière/}).click();
    await page.getByRole('button',{name:'Jouer une future légende'}).click();
    await page.getByRole('button',{name:'Débuter la carrière'}).click();
    const initialState=await page.evaluate(()=>`Moral ${d20(G.f.morale)}/20 · Forme ${d20(G.f.form)}/20`);
    if(await page.locator('.career-aside .career-block p').textContent()!==initialState) throw Error('Carrière neuve : moral et forme en texte');
    reports.push(await audit(page,'carrière neuve'));
    await page.screenshot({path:path.join(output,'t8b-carriere-neuve-1920.png')});
    const career=await page.evaluate(()=>{
      setSeed(120);CL.newCareer();CL.create();
      let screen=G.screen,tried=new Set();
      for(let step=0;step<2000&&!G.f.retired;step++){
        if(G.screen==='hub'&&G.f.history.length>=8&&!G.f.injury) break;
        if(G.screen==='arena'){CL.skipArena();continue;}
        if(G.screen!==screen){screen=G.screen;tried=new Set();}
        const el=[...document.querySelectorAll('#app [onclick]')].find(el=>!el.matches('.eyebrow.x,.career-home')
          &&!el.disabled&&!tried.has(el.getAttribute('onclick')));
        if(!el) throw Error(`Carrière bloquée : ${G.screen}`);
        const action=el.getAttribute('onclick');el.click();
        if(G.screen===screen) tried.add(action);
      }
      if(G.screen!=='hub'||G.f.retired||G.f.history.length<8) throw Error('Huit combats réels nécessaires');
      return {name:G.f.name,age:G.f.age,W:G.f.W,L:G.f.L,history:G.f.history};
    });
    await page.locator('.career-primary').click();
    await page.locator('[onclick="CL.opp(0)"]').click();
    if(await page.evaluate(()=>G.screen)==='press_conf') await page.getByRole('button',{name:'Continuer vers le camp d’entraînement'}).click();
    await page.evaluate(()=>save());
    await page.reload({waitUntil:'load'});
    await page.getByRole('button',{name:/^Carrière/}).click();
    await page.getByRole('button',{name:'Reprendre le dossier'}).click();
    if(!await page.locator('.career-camp').count()) throw Error('Reprise du vrai camp sur le hub');
    reports.push(await audit(page,'camp repris'));
    await page.screenshot({path:path.join(output,'t8b-carriere-camp-1920.png')});
    await page.locator('.career-next button').click();
    if(await page.evaluate(()=>G.screen)!=='opponent_card') throw Error('Étude à la souris');
    reports.push(await audit(page,'fiche adversaire'));
    await page.locator('.career-header button').click();
    // Le joueur choisit le camp gratuit existant : aucune donnée fabriquée.
    await page.locator('.career-primary').click();
    // Le PRNG carrière n'est pas sauvegardé ; une reprise à froid réinitialise
    // sa graine. Fixer ce point de contrôle rend la preuve reproductible.
    await page.evaluate(()=>setSeed(1209));
    await page.locator('[onclick="CL.train(0)"]').click();
    for(let step=0;step<10&&await page.evaluate(()=>G.screen)==='event';step++){
      await page.locator('[onclick^="CL.handleEvent"]').first().click();
    }
    if(await page.evaluate(()=>G.screen)!=='plan') throw Error(`Camp sans plan : ${await page.evaluate(()=>G.screen)}`);
    await page.evaluate(()=>save());
    await page.reload({waitUntil:'load'});
    await page.getByRole('button',{name:/^Carrière/}).click();
    await page.getByRole('button',{name:'Reprendre le dossier'}).click();
    if(!await page.locator('.career-next').count()||!await page.locator('.career-aside').count()) throw Error('Préparation et poids réels du plan');
    const mock=await context.newPage();
    await mock.goto(url('maquettes/10-carriere.html'),{waitUntil:'load'});
    const faces=[500,600,700,800].map(w=>`@font-face{font-family:'Saira Condensed';src:url('${url(`fonts/condensed-${w}-latin.woff2`)}');font-weight:${w}}`).join('');
    await mock.addStyleTag({content:`@font-face{font-family:'Saira';src:url('${url('fonts/saira-latin.woff2')}');font-weight:300 600}${faces}`});
    await mock.evaluate(()=>document.fonts.ready);
    const reference=await mock.screenshot({path:path.join(output,'t8b-carriere-maquette-1920.png')});
    await mock.close();
    for(const width of [1920,1280,1440]){
      await page.setViewportSize({width,height:1080});
      const report=await audit(page,`carrière ${width}`);
      if(width===1920&&report.columns!=='560px 708px 420px') throw Error(`Grille de 10 : ${report.columns}`);
      if(report.padding!=='40px 64px 48px'||report.title!=='76px') throw Error('Dimensions de 10');
      reports.push(report);await pair(page,context,width,reference);
    }
    await page.locator('.career-dossier summary').click();
    if(!await page.getByRole('button',{name:'Classements',exact:true}).isVisible()) throw Error('Dossier à la souris');
    await page.getByRole('button',{name:'Classements',exact:true}).click();
    for(const tab of ['div','p4p']){
      await page.evaluate(t=>CL.setRankingsTab(t),tab);
      await page.locator('[onclick^="CL.viewCareerOpponent"]').first().click();
      if(await page.evaluate(()=>G.screen)!=='opponent_card') throw Error(`Classement ${tab} à la souris`);
      await page.locator('.career-header button').click();
      await page.locator('[onclick^="CL.viewCareerOpponent"]').first().focus();
      await page.keyboard.press('Enter');
      if(await page.evaluate(()=>G.screen)!=='opponent_card') throw Error(`Classement ${tab} au clavier`);
      await page.locator('.career-header button').focus();await page.keyboard.press('Enter');
    }
    await page.getByRole('button',{name:'← Revenir au hub'}).click();
    await page.locator('.career-dossier summary').focus();await page.keyboard.press('Enter');
    if(!await page.getByRole('button',{name:'Bilan technique',exact:true}).isVisible()) throw Error('Dossier au clavier');
    await page.keyboard.press('Enter');
    await page.locator('.career-home').focus();
    // Parcours natif Tab -> action principale -> lien d'étude.
    await page.keyboard.press('Tab');
    if(!await page.locator('.career-primary').evaluate(e=>e===document.activeElement)) throw Error('Ordre de focus');
    await page.keyboard.press('Tab');await page.keyboard.press('Tab');await page.keyboard.press('Tab');
    // Lien d'étude ciblé après les accès conservés ; activation et retour natifs.
    await page.locator('.career-next button').focus();
    await page.waitForTimeout(450);
    await page.screenshot({path:path.join(output,'t8b-carriere-focus-1440.png')});
    await page.keyboard.press('Enter');
    if(await page.evaluate(()=>G.screen)!=='opponent_card') throw Error('Étude au clavier');
    await page.locator('.career-header button').focus();await page.keyboard.press('Enter');
    if(errors.length) throw Error(errors.join('\n'));
    await walkthrough(browser,await page.evaluate(()=>Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)])));
    fs.writeFileSync(path.join(output,'t8b-carriere-audit.json'),JSON.stringify({career,reports,consoleErrors:errors,
      mouseAndKeyboard:true,coldPreparationResume:true,referenceAtSmallSizes:'Maquette 1920 réduite proportionnellement'},null,2)+'\n');
    await context.close();
  }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
