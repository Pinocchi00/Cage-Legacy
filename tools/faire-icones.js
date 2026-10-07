"use strict";
/* Génère les icônes de la version installable (icons/icone-192.png et icone-512.png) : le logo de la planche « Logo » (version A) : trois octogones rouges sur le noir.
   Dessin 100 % calculé, aucune image tierce : voir docs/SONS-ORIGINE.md (section Images). Usage : node tools/faire-icones.js */
const zlib=require('zlib'), fs=require('fs'), path=require('path');
function crc32(buf){ let c, crc=0xFFFFFFFF; for(let n=0;n<buf.length;n++){ c=(crc^buf[n])&0xFF; for(let k=0;k<8;k++) c=c&1?(c>>>1)^0xEDB88320:c>>>1; crc=(crc>>>8)^c; } return (crc^0xFFFFFFFF)>>>0; }
function chunk(type,data){
  const len=Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td=Buffer.concat([Buffer.from(type),data]); const crc=Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len,td,crc]);
}
/* Le logo de la planche « Logo » (version A, pour l'icône du jeu) : trois octogones rouges concentriques sur le noir. Les trois bandes sont celles du dessin
   (viewBox 400 : demi-largeur 92 / 131 / 171, traits de 15 / 21 / 12) ; la distance au contour d'un octogone régulier se calcule sans tracé. */
const BANDES=[{ap:92,d:130.1,w:15},{ap:131,d:185.3,w:21},{ap:171,d:241.8,w:12}];
function rouge(x,y){
  const dx=Math.abs(x-200), dy=Math.abs(y-200);
  for(const b of BANDES){
    const dist=Math.min(b.ap-Math.max(dx,dy),(b.d-(dx+dy))/Math.SQRT2);
    if(Math.abs(dist)<=b.w/2) return true;
  }
  return false;
}
function png(n){
  const raw=Buffer.alloc((n*4+1)*n), S=3, marge=0.06;
  for(let y=0;y<n;y++){
    raw[y*(n*4+1)]=0;
    for(let x=0;x<n;x++){
      let r=0;
      for(let i=0;i<S;i++) for(let j=0;j<S;j++){
        const u=((x+(i+0.5)/S)/n-0.5)/(1-2*marge)*400+200, v=((y+(j+0.5)/S)/n-0.5)/(1-2*marge)*400+200;
        if(rouge(u,v)) r++;
      }
      const t=r/(S*S), o=y*(n*4+1)+1+x*4;
      raw[o]=Math.round(13+(226-13)*t); raw[o+1]=Math.round(11+(58-11)*t); raw[o+2]=Math.round(11+(43-11)*t); raw[o+3]=255;
    }
  }
  const ihdr=Buffer.alloc(13); ihdr.writeUInt32BE(n,0); ihdr.writeUInt32BE(n,4); ihdr[8]=8; ihdr[9]=6;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(raw,{level:9})),chunk('IEND',Buffer.alloc(0))]);
}
const dir=path.join(__dirname,'..','icons'); fs.mkdirSync(dir,{recursive:true});
for(const n of [192,512]) fs.writeFileSync(path.join(dir,'icone-'+n+'.png'),png(n));
console.log('icônes écrites dans',dir);
