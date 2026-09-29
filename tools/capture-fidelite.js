"use strict";
/* Captures de vérification du lot 4 : jeu réel et maquette, chacun à
   1920×1080, assemblés côte à côte en 3840×1080. Exécuter depuis la racine :
   node tools/capture-fidelite.js (Playwright/Chromium requis). */
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');

const root=path.resolve(__dirname,'..');
const output=path.join(root,'captures');
const file=p=>pathToFileURL(path.join(root,p)).href;

async function main(){
  const browser=await chromium.launch({headless:true,executablePath:chromium.executablePath()});
  try{
    const context=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1});
    const game=await context.newPage();
    const errors=[];
    game.on('pageerror',error=>errors.push(error.message));
    await game.goto(file('index.html'),{waitUntil:'load'});
    await game.evaluate(async()=>{ await document.fonts.ready; setSeed(11); CL.mgmtEnter(); });

    async function pair(label,mock,setup){
      await setup();
      await game.evaluate(()=>document.fonts.ready);
      const shot=await game.screenshot();
      const sample=await context.newPage();
      await sample.goto(file(mock),{waitUntil:'load'});
      // Les liens Google des maquettes demandent un italique absent de la
      // famille publiée ; la capture utilise le même fichier local embarqué.
      await sample.addStyleTag({content:`@font-face{font-family:'Saira';src:url('${file('fonts/saira-latin.woff2')}');font-weight:300 600}@font-face{font-family:'Saira Condensed';src:url('${file('fonts/condensed-700-latin.woff2')}');font-weight:700}@font-face{font-family:'Saira Condensed';src:url('${file('fonts/condensed-800-latin.woff2')}');font-weight:800}@font-face{font-family:'Saira Condensed';src:url('${file('fonts/condensed-600-latin.woff2')}');font-weight:600}`});
      await sample.evaluate(()=>document.fonts.ready);
      const reference=await sample.screenshot();
      await sample.close();
      const compare=await context.newPage({viewport:{width:3840,height:1080}});
      await compare.setViewportSize({width:3840,height:1080});
      await compare.setContent(`<html><body style="margin:0;display:flex;background:#211B1E"><img width="1920" height="1080" src="data:image/png;base64,${shot.toString('base64')}"><img width="1920" height="1080" src="data:image/png;base64,${reference.toString('base64')}"></body></html>`);
      await compare.screenshot({path:path.join(output,label+'.png')});
      await compare.close();
      console.log(label+': '+path.join(output,label+'.png'));
    }
    await pair('semaine-vs-02','maquettes/02-semaine.html',async()=>{});
    const audit=await game.evaluate(()=>{
      const selectors=['.mgmt-nav button','.mgmt-week h3','.mgmt-week-card>p',
        '.mgmt-week-slot','.mgmt-week-meta','.mgmt-week-names',
        '.mgmt-week-free','.mgmt-week-book','.mgmt-week-news',
        '.mgmt-say','.mgmt-rep','.mgmt-cycle'];
      return selectors.flatMap(sel=>[...document.querySelectorAll(sel)].map(el=>({
        sel,color:getComputedStyle(el).color,size:parseFloat(getComputedStyle(el).fontSize),
        yellow:el.classList.contains('mgmt-week-book')
      })));
    });
    const luminance=hex=>{
      const rgb=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255)
        .map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4);
      return rgb[0]*0.2126+rgb[1]*0.7152+rgb[2]*0.0722;
    };
    const ratio=(a,b)=>{
      const x=luminance(a),y=luminance(b);
      return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);
    };
    let min=Infinity;
    for(const row of audit){
      const channels=row.color.match(/\d+/g);
      const hex='#'+channels.slice(0,3).map(v=>(+v).toString(16).padStart(2,'0')).join('');
      // Pire fond de la maquette sous la lumière zénithale, et son panneau
      // translucide à 7 % ; le bouton jaune utilise son vrai aplat.
      const bg=row.yellow?'#FFC83D':'#493E42';
      const value=ratio(hex,bg);
      min=Math.min(min,value);
      if(row.size<13||value<4.5) throw Error(`Contraste/taille ${row.sel} : ${row.size}px, ${value.toFixed(2)}:1`);
    }
    console.log(`Semaine : ${audit.length} textes utiles contrôlés, contraste minimum ${min.toFixed(2)}:1 (≥4,5:1), taille ≥13px`);
    await pair('carte-vs-04','maquettes/04-booker-un-combat.html',async()=>{
      await game.evaluate(()=>CL.mgmtCarte());
    });
    const card=await game.evaluate(()=>[...document.querySelectorAll('.mgmt-book-nm,.mgmt-book-meta,.mgmt-book-list .opp-nm,.mgmt-book-list .mgmt-meta,.mgmt-book-sub,.mgmt-nav button')]
      .map(el=>({color:getComputedStyle(el).color,size:parseFloat(getComputedStyle(el).fontSize)})));
    let cardMin=Infinity;
    for(const row of card){
      const channels=row.color.match(/\d+/g);
      const hex='#'+channels.slice(0,3).map(v=>(+v).toString(16).padStart(2,'0')).join('');
      const value=ratio(hex,'#493E42');
      cardMin=Math.min(cardMin,value);
      if(row.size<13||value<4.5) throw Error(`Carte : contraste/taille ${row.size}px, ${value.toFixed(2)}:1`);
    }
    console.log(`Carte : ${card.length} textes utiles contrôlés, contraste minimum ${cardMin.toFixed(2)}:1 (≥4,5:1), taille ≥13px`);
    await pair('arene-vs-05','maquettes/05-la-soiree.html',async()=>{
      const scene=await game.evaluate(()=>{
        let segment=null;
        for(let i=0;i<24;i++){
          CL.areneSocle();
          const s=ARENE_ECRAN.session;
          segment=s.segs.find(g=>{
            if(g.phase!=='clinch'||g.posClinch!=='cage') return false;
            const e=areneMoment(s,g.t0+0.2);
            return Math.max(e.ax,e.bx)>1&&e.texte;
          });
          if(segment) break;
        }
        const ec=ARENE_ECRAN, session=ec.session;
        if(!segment) segment=session.segs.find(s=>s.phase==='clinch'&&s.posClinch==='cage')
          ||session.segs.find(s=>session.momentsCles[0]&&s.t0>session.momentsCles[0].t);
        if(segment){
          const entry=session.montage.find(m=>m.genre==='combat'&&m.t0<=segment.t0&&m.t1>segment.t0);
          if(entry) ec.d=entry.d0+segment.t0-entry.t0+0.2;
        }
        ec.pause=true;
        return {moments:session.momentsCles.length,segment:segment&&segment.phase,d:ec.d};
      });
      console.log('Scène arène :',scene);
      await game.waitForTimeout(250);
    });
    await context.close();
    if(errors.length) throw Error(errors.join('\n'));
  }finally{ await browser.close(); }
}
if(!fs.existsSync(output)) throw Error('Créer le dossier captures/ avant de lancer les captures');
main().catch(error=>{ console.error(error); process.exitCode=1; });
