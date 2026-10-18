"use strict";
/* Captures des planches Duo à 1280×720, 1440×900, 1920×1080 et contrôle ?audit=1 (taille < 22 px, débordement, chevauchement).
   node maquettes/duo/src/capturer.js [Planche…] [--1440]  →  maquettes/duo/captures/<Planche>-<état>-<largeur>.png + audit.txt */
const path=require('path'), fs=require('fs'), http=require('http');
const pw=require(process.env.PW||'/home/claude/.npm-global/lib/node_modules/@playwright/mcp/node_modules/playwright');
const ICI=path.join(__dirname,'..'), CAP=path.join(ICI,'captures');
const PLANCHES={DuoCreation:'noms j1 j2',DuoQG:'attente progression arrivee',DuoEffectif:'j1 j2',DuoEncheres:'ouverture caisse mise adjuge',DuoDraft:'place reponse pret',DuoSoiree:'avant resultat principal',DuoBilan:'carte saison'};
const args=process.argv.slice(2), seul1440=args.includes('--1440'), choix=args.filter(a=>!a.startsWith('--'));
const TYPES={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.jpg':'image/jpeg','.woff2':'font/woff2','.ttf':'font/ttf'};
const srv=http.createServer((q,r)=>{ const f=path.join(ICI,decodeURIComponent(q.url.split('?')[0])); if(!f.startsWith(ICI)||!fs.existsSync(f)){r.statusCode=404;return r.end();}
  r.setHeader('content-type',TYPES[path.extname(f)]||'application/octet-stream'); fs.createReadStream(f).pipe(r); }).listen(0);
(async()=>{
  const port=srv.address().port, b=await pw.chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  fs.mkdirSync(CAP,{recursive:true}); const lignes=[];
  for(const [P,etats] of Object.entries(PLANCHES)){ if(choix.length&&!choix.includes(P)) continue;
    for(const e of etats.split(' ')){
      for(const [w,h] of seul1440?[[1440,900]]:[[1280,720],[1440,900],[1920,1080]]){
        const pg=await b.newPage({viewport:{width:w,height:h}});
        await pg.goto(`http://127.0.0.1:${port}/${P}.html?etat=${e}`); await pg.evaluate(()=>document.fonts.ready); await pg.waitForTimeout(80);
        await pg.screenshot({path:path.join(CAP,`${P}-${e}-${w}.png`)}); await pg.close(); }
      const pg=await b.newPage({viewport:{width:1920,height:1080}});
      await pg.goto(`http://127.0.0.1:${port}/${P}.html?etat=${e}&audit=1`); await pg.evaluate(()=>document.fonts.ready); await pg.waitForTimeout(150);
      const a=await pg.evaluate(()=>window.__audit||(window.PLANCHE&&window.PLANCHE.audit()));
      lignes.push(`${P} ${e} : ${a.textes} textes, ${a.erreurs.length} erreur(s)`+(a.erreurs.length?'\n  '+a.erreurs.join('\n  '):''));
      await pg.close(); } }
  await b.close(); srv.close();
  const txt=lignes.join('\n')+'\n'; if(!choix.length) fs.writeFileSync(path.join(CAP,'audit.txt'),txt); process.stdout.write(txt);
})().catch(e=>{console.error(e);process.exit(1);});
