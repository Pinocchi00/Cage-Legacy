"use strict";
/* ==== [ANCRE: SAUVEGARDE_COMPRESSION] — Monde lot 52 T1 ==== */
const MGMT_COMPRESSION_MARQUEUR='\u0001';
function mgmtCompresser(chaine){
  if(typeof chaine!=='string') throw new TypeError('Chaîne requise');
  const bytes=unescape(encodeURIComponent(chaine)), dict=new Map(); let next=256, w='', codes=[];
  for(let i=0;i<bytes.length;i++){
    const c=bytes.charAt(i), wc=w+c;
    if(dict.has(wc)) w=wc;
    else{ codes.push(w.length>1?dict.get(wc.slice(0,-1)):w? w.charCodeAt(0):bytes.charCodeAt(i)); dict.set(wc,next++); w=c; }
  }
  if(w) codes.push(w.length>1?dict.get(w):w.charCodeAt(0));
  let bits='', out='';
  for(const code of codes){ bits+=code.toString(2).padStart(16,'0'); while(bits.length>=15){out+=String.fromCharCode(parseInt(bits.slice(0,15),2)+32);bits=bits.slice(15);} }
  if(bits) out+=String.fromCharCode(parseInt(bits.padEnd(15,'0'),2)+32);
  return MGMT_COMPRESSION_MARQUEUR+out;
}
function mgmtDecompresser(chaine){
  try{
    if(typeof chaine!=='string'||chaine.charAt(0)!==MGMT_COMPRESSION_MARQUEUR) return null;
    if(chaine.length===1) return '';
    const bits=Array.from(chaine.slice(1),c=>{const n=c.charCodeAt(0)-32;if(n<0||n>32767)throw Error();return n.toString(2).padStart(15,'0');}).join('');
    let codes=[]; for(let i=0;i+16<=bits.length;i+=16) codes.push(parseInt(bits.slice(i,i+16),2));
    const dict=Array.from({length:256},(_,i)=>String.fromCharCode(i)); let next=256, w=String.fromCharCode(codes.shift()); if(w.charCodeAt(0)>255)return null;
    let out=w;
    for(const k of codes){let entry;if(k<dict.length&&dict[k]!==undefined)entry=dict[k];else if(k===next)entry=w+w.charAt(0);else return null;out+=entry;dict[next++]=w+entry.charAt(0);w=entry;}
    if(!out)return '';
    return decodeURIComponent(escape(out));
  }catch(e){return null;}
}
