"use strict";
/* Monte le ?v= de chaque fichier donné dans index.html et SW_VERSION dans sw.js (outil temporaire). */
const fs=require('fs');
let h=fs.readFileSync('index.html','utf8');
for(const f of process.argv.slice(2)){
  const re=new RegExp(f.replace(/[.]/g,'[.]')+'[?]v=([A-Za-z0-9_-]+)');
  if(!re.test(h)) throw new Error('absent '+f);
  h=h.replace(re,(m,v)=>f+'?v='+v+'x');
}
fs.writeFileSync('index.html',h);
let w=fs.readFileSync('sw.js','utf8');
w=w.replace(/SW_VERSION='b(\d+)'/,(m,n)=>"SW_VERSION='b"+(+n+1)+"'");
fs.writeFileSync('sw.js',w);
