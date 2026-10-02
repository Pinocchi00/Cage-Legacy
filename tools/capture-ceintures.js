"use strict";
/* Lot 5 T1 : écran réel à 1920, vérification 1280/1440/1920, parcours
   souris puis clavier du titre explicite. Playwright-core et Chrome local,
   même outillage que capture-t6.js. Aucune requête réseau nécessaire.
   Usage : node tools/mesure-ceintures.js --save=tools/reports/lot-5-t1-capture-save.json
           node tools/capture-ceintures.js */
const {chromium}=require('playwright-core');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
const output=path.join(root,'tools','reports','lot-5-t1-ceintures');
const state=JSON.parse(fs.readFileSync(path.join(root,'tools','reports','lot-5-t1-capture-save.json'),'utf8'));

(async()=>{
  fs.mkdirSync(output,{recursive:true});
  const browser=await chromium.launch({headless:true,executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'});
  try{
    const context=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1,reducedMotion:'reduce'});
    const page=await context.newPage(),errors=[],audits=[],memory={};
    page.on('pageerror',e=>errors.push(e.message));
    page.on('console',msg=>{ if(msg.type()==='error') errors.push(msg.text()); });
    await page.route(/^https?:/,route=>route.abort());
    await page.goto(pathToFileURL(path.join(root,'index.html')).href,{waitUntil:'load'});
    // Reprise T1 : les attributions initiales ne font aucune ligne joueur.
    await page.evaluate(()=>{ setSeed(20261002); CL.mgmtEnter(); });
    await page.evaluate(()=>document.fonts.ready);
    await page.locator('.mgmt-week-memo > summary').click();
    if(await page.locator('.mgmt-week-memo > summary').textContent()!=='Mémoire · 0 faits'){
      throw new Error('Les attributions initiales sont comptées dans la Mémoire');
    }
    memory.fresh=await page.locator('.mgmt-week-memo .mgmt-week-fact').count();
    if(memory.fresh!==0) throw new Error('Une partie neuve affiche des lignes de Mémoire');
    await page.locator('.mgmt-week-memo').evaluate(el=>el.scrollIntoView({block:'start'}));
    await page.screenshot({path:path.join(output,'semaine_memoire_neuve_1920.png')});
    await page.evaluate(raw=>{
      G={theme:'dark'};
      localStorage.setItem(MGMT_KEY,JSON.stringify(raw));
      CL.mgmtEnter();
      const belt=allDivisions().map(d=>mgmtSplitTitle(G.mgmt,d.id)).filter(b=>b.id)
        .sort((a,b)=>b.defenses-a.defenses)[0];
      MGMT_CLASSEMENTS={div:belt.div,scope:'world'};
      CL.go('mgmt_classements');
    },state);
    await page.evaluate(()=>document.fonts.ready);

    for(const width of [1280,1440,1920]){
      await page.setViewportSize({width,height:1080});
      for(const scope of ['world','split']){
        await page.evaluate(s=>CL.mgmtClassementsScope(s),scope);
        audits.push(await page.evaluate(()=>{
          const rgb=s=>(s.match(/[\d.]+/g)||[]).map(Number);
          const lum=c=>c.slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4)
            .reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
          const blend=(base,top)=>base.slice(0,3).map((v,i)=>v*(1-(top[3]??1))+top[i]*(top[3]??1));
          const contrast=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
          const measured=[];
          for(const el of document.querySelectorAll('.mgmt-cl-champion-label,.mgmt-cl-champion-name,.mgmt-cl-champion-meta')){
            const cs=getComputedStyle(el),parent=getComputedStyle(el.closest('.mgmt-cl-champion'));
            const overlay=rgb(parent.backgroundImage.match(/rgba?\([^)]+\)/)[0]);
            const bg=blend(rgb(parent.backgroundColor),overlay);
            measured.push({class:el.className,size:parseFloat(cs.fontSize),contrast:contrast(rgb(cs.color),bg)});
          }
          const failures=[];
          for(const row of document.querySelectorAll('.mgmt-cl-champion')){
            const r=row.getBoundingClientRect(),children=[...row.children];
            for(const child of children){
              const c=child.getBoundingClientRect();
              if(c.right>r.right+1||c.bottom>r.bottom+1) failures.push('contenu hors du bloc Champion');
            }
            for(let i=0;i<children.length;i++) for(let j=i+1;j<children.length;j++){
              const a=children[i].getBoundingClientRect(),b=children[j].getBoundingClientRect();
              if(Math.min(a.right,b.right)>Math.max(a.left,b.left)+1&&Math.min(a.bottom,b.bottom)>Math.max(a.top,b.top)+1)
                failures.push('chevauchement dans le bloc Champion');
            }
          }
          if(document.documentElement.scrollWidth>innerWidth) failures.push('défilement horizontal');
          if(measured.some(m=>m.size<13||m.contrast<4.5)) failures.push('L2 : taille ou contraste insuffisant');
          return {width:innerWidth,scope:MGMT_CLASSEMENTS.scope,champions:document.querySelectorAll('.mgmt-cl-champion').length,
            measured,failures};
        }));
        if(scope==='world'&&width!==1920){
          await page.screenshot({path:path.join(output,'classements_mondial_'+width+'.png')});
        }
      }
    }
    await page.evaluate(()=>CL.mgmtClassementsScope('world'));
    await page.screenshot({path:path.join(output,'classements_mondial_1920.png')});
    await page.evaluate(()=>CL.mgmtClassementsScope('split'));
    await page.screenshot({path:path.join(output,'classements_split_1920.png')});
    // Champion -> fiche -> retour, souris réelle.
    await page.locator('button.mgmt-cl-champion').click();
    await page.evaluate(()=>document.fonts.ready);
    await page.waitForTimeout(400);
    const reachable=await page.locator('.mgmt-fiche-retour').evaluate(el=>{
      const r=el.getBoundingClientRect();
      return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===el;
    });
    if(!reachable) throw new Error('Le nom du champion masque le bouton Retour');
    await page.locator('.mgmt-fiche-retour').click();
    const returned=await page.evaluate(()=>({screen:G.screen,retour:MGMT_FICHE.retour}));
    if(returned.screen!=='mgmt_classements') throw new Error('Retour fiche incorrect : '+JSON.stringify(returned));

    // La partie réellement mesurée : titre et autres faits, Mémoire ouverte.
    await page.evaluate(()=>CL.go('mgmt_bureau'));
    await page.locator('.mgmt-week-memo > summary').click();
    memory.played=await page.locator('.mgmt-week-memo').evaluate(el=>({
      summary:el.querySelector(':scope > summary').textContent,
      rows:el.querySelectorAll('.mgmt-week-fact').length,
      titles:[...el.querySelectorAll('.mgmt-week-fact')].filter(row=>row.textContent.includes('Ceinture ')).length,
      initialFacts:G.mgmt.facts.filter(f=>f.k==='title_initial').length,
    }));
    if(Number(memory.played.summary.match(/· (\d+) fait/)[1])!==memory.played.rows||!memory.played.titles){
      throw new Error('Compteur ou lignes de titre incorrects : '+JSON.stringify(memory.played));
    }
    await page.locator('.mgmt-week-memo').evaluate(el=>el.scrollIntoView({block:'start'}));
    await page.screenshot({path:path.join(output,'semaine_memoire_1920.png')});

    // Carte de la prochaine soirée, créée par les vrais gestes de booking.
    await page.evaluate(()=>{
      const m=G.mgmt; mgmtNewPile(m);
      const rows=mgmtCartRows(m);
      for(const f of rows){
        const champ=mgmtSplitTitle(m,f.div);
        if(champ.id!==f.id||!mgmtAvailable(m,f)) continue;
        const b=rows.find(x=>x.id!==f.id&&x.div===f.div&&mgmtAvailable(m,x));
        if(b&&mgmtBookMain(m,f.id,b.id)) break;
      }
      saveMgmt(); CL.mgmtCarte();
    });
    const box=page.locator('#mgmt-title-0');
    await box.check();
    if(!await page.evaluate(()=>G.mgmt.card.main[0].title===true)) throw new Error('Titre souris absent');
    await page.keyboard.press('Space');
    if(!await page.evaluate(()=>G.mgmt.card.main[0].title===false)) throw new Error('Titre clavier non annulé');
    await page.keyboard.press('Space');
    if(!await page.evaluate(()=>G.mgmt.card.main[0].title===true)) throw new Error('Titre clavier absent');
    await page.screenshot({path:path.join(output,'booking_titre_1920.png')});
    await page.reload({waitUntil:'load'});
    await page.evaluate(()=>{ CL.mgmtEnter(); CL.mgmtCarte(); });
    if(!await page.locator('#mgmt-title-0').isChecked()) throw new Error('Choix de titre perdu au rechargement');

    await page.goto(pathToFileURL(path.join(root,'maquettes','04b-combat-de-titre.html')).href,{waitUntil:'load'});
    await page.screenshot({path:path.join(output,'maquette_titre_1920.png')});
    fs.writeFileSync(path.join(output,'audit.json'),JSON.stringify({errors,audits,memory,mouse:true,keyboard:true,reload:true},null,2));
    if(errors.length||audits.some(a=>a.failures.length)) throw new Error(JSON.stringify({errors,failures:audits.filter(a=>a.failures.length)}));
    console.log(JSON.stringify({captures:output,errors:errors.length,audits:audits.length,
      minContrast:Math.min(...audits.flatMap(a=>a.measured.map(m=>m.contrast))),memory,mouse:true,keyboard:true,reload:true},null,2));
  }finally{ await browser.close(); }
})().catch(error=>{ console.error(error); process.exitCode=1; });
