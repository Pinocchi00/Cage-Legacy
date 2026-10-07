"use strict";
/* Génère les icônes de la version installable (icons/icone-192.png et icone-512.png) : un fond noir, une bande rouge en biais et un cadre blanc.
   Dessin 100 % calculé, aucune image tierce : voir docs/SONS-ORIGINE.md (section Images). Usage : node tools/faire-icones.js */
const zlib=require('zlib'), fs=require('fs'), path=require('path');
function crc32(buf){ let c, crc=0xFFFFFFFF; for(let n=0;n<buf.length;n++){ c=(crc^buf[n])&0xFF; for(let k=0;k<8;k++) c=c&1?(c>>>1)^0xEDB88320:c>>>1; crc=(crc>>>8)^c; } return (crc^0xFFFFFFFF)>>>0; }
function chunk(type,data){
  const len=Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td=Buffer.concat([Buffer.from(type),data]); const crc=Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len,td,crc]);
}
function png(n){
  const raw=Buffer.alloc((n*4+1)*n);
  for(let y=0;y<n;y++){
    raw[y*(n*4+1)]=0;
    for(let x=0;x<n;x++){
      const u=x/n, v=y/n; let c=[13,11,11];
      const cadre=Math.min(u,v,1-u,1-v)<0.06&&Math.min(u,v,1-u,1-v)>0.03;
      const bande=Math.abs((u-v)-0)<0.17&&Math.min(u,v,1-u,1-v)>0.09;
      if(bande) c=[226,58,43];
      if(cadre) c=[233,230,225];
      const o=y*(n*4+1)+1+x*4; raw[o]=c[0]; raw[o+1]=c[1]; raw[o+2]=c[2]; raw[o+3]=255;
    }
  }
  const ihdr=Buffer.alloc(13); ihdr.writeUInt32BE(n,0); ihdr.writeUInt32BE(n,4); ihdr[8]=8; ihdr[9]=6;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(raw,{level:9})),chunk('IEND',Buffer.alloc(0))]);
}
const dir=path.join(__dirname,'..','icons'); fs.mkdirSync(dir,{recursive:true});
for(const n of [192,512]) fs.writeFileSync(path.join(dir,'icone-'+n+'.png'),png(n));
console.log('icônes écrites dans',dir);
