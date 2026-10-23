"use strict";
/* ==== [ANCRE: SAUVEGARDE_COMPRESSION] — Monde lot 52 T1 ====
   Compression sans perte, synchrone et sans dépendance, de la sauvegarde du mode management.

   Principe (LZW à alphabet transmis) :
   - Format : MGMT_COMPRESSION_MARQUE (un caractère de contrôle, jamais le début d'un JSON qui commence par « { ») puis une suite de caractères
     UTF-16 portant chacun 15 bits (valeur + 32 : jamais de substitut isolé ni de caractère de contrôle autre que le marqueur).
   - Flux de bits : A (17 bits) = nombre de caractères distincts de l'entrée ; les A caractères (16 bits chacun, triés) ; puis les codes LZW ;
     le dernier code est la fin de flux (EOF = A).
   - Codes : 0..A-1 = les caractères de l'alphabet, A = fin de flux, A+1... = les entrées ajoutées au fil de l'eau (une par code émis).
     Le k-ième code émis (k à partir de 0) s'écrit sur longueurBits(A + k) bits : l'encodeur et le décodeur partagent cette formule, sans décalage.
   Aucun appel à rnd(), aucun accès au DOM. */
const MGMT_COMPRESSION_MARQUE='\u0001';
const MGMT_COMPRESSION_DECALAGE=32;

function mgmtCompressionBits(n){ return n<=0?1:Math.floor(Math.log2(n))+1; }

/** Écrivain de bits : empile des valeurs de 1 à 24 bits, rend des caractères de 15 bits. */
function mgmtCompressionEcrivain(){
  const sortie=[]; let acc=0, nb=0;
  return {
    ecrire(v,bits){
      acc=acc*Math.pow(2,bits)+v; nb+=bits;
      while(nb>=15){
        const reste=Math.pow(2,nb-15), haut=Math.floor(acc/reste);
        sortie.push(String.fromCharCode(haut+MGMT_COMPRESSION_DECALAGE));
        acc-=haut*reste; nb-=15;
      }
    },
    fin(){
      if(nb>0){ sortie.push(String.fromCharCode(acc*Math.pow(2,15-nb)+MGMT_COMPRESSION_DECALAGE)); acc=0; nb=0; }
      return sortie.join('');
    }
  };
}

/** Lecteur de bits symétrique. Rend -1 quand le flux est épuisé ou invalide. */
function mgmtCompressionLecteur(chaine,debut){
  let pos=debut, acc=0, nb=0;
  return {
    lire(bits){
      while(nb<bits){
        if(pos>=chaine.length) return -1;
        const v=chaine.charCodeAt(pos++)-MGMT_COMPRESSION_DECALAGE;
        if(v<0||v>=32768) return -1;
        acc=acc*32768+v; nb+=15;
      }
      const reste=Math.pow(2,nb-bits), valeur=Math.floor(acc/reste);
      acc-=valeur*reste; nb-=bits;
      return valeur;
    }
  };
}

/** Compresse une chaîne. @param {string} s @returns {string} chaîne UTF-16 sûre pour localStorage. */
function mgmtCompresser(s){
  s=String(s);
  const alphabet=[...new Set(s.split(''))].sort();   /* unités UTF-16, pas points de code */
  const A=alphabet.length, w=mgmtCompressionEcrivain();
  w.ecrire(A,17);
  for(const c of alphabet) w.ecrire(c.charCodeAt(0),16);
  const dico=new Map(); alphabet.forEach((c,i)=>dico.set(c,i));
  let suivant=A+1, k=0, courant='';
  const emettre=code=>{ w.ecrire(code,mgmtCompressionBits(A+k)); k++; };
  for(let i=0;i<s.length;i++){
    const c=s[i], wc=courant+c;
    if(dico.has(wc)){ courant=wc; continue; }
    emettre(dico.get(courant));
    dico.set(wc,suivant++);
    courant=c;
  }
  if(courant!=='') emettre(dico.get(courant));
  emettre(A);   /* fin de flux */
  return MGMT_COMPRESSION_MARQUE+w.fin();
}

/** Décompresse un flux, ou plusieurs flux mis bout à bout (chacun commence par le marqueur, que ses caractères ne contiennent jamais : ils valent tous 32 ou plus).
 *  @param {string} z @returns {string|null} la chaîne d'origine, ou null si l'entrée est corrompue (jamais d'exception). */
function mgmtDecompresser(z){
  try{
    if(typeof z!=='string'||z.charAt(0)!==MGMT_COMPRESSION_MARQUE) return null;
    const flux=z.split(MGMT_COMPRESSION_MARQUE), sortie=[];
    for(let i=1;i<flux.length;i++){
      const t=mgmtDecompresserFlux(MGMT_COMPRESSION_MARQUE+flux[i]);
      if(t===null) return null;
      sortie.push(t);
    }
    return sortie.join('');
  }catch(e){ return null; }
}

function mgmtDecompresserFlux(z){
  try{
    const r=mgmtCompressionLecteur(z,1);
    const A=r.lire(17);
    if(A<0||A>65536) return null;
    const dico=[];
    for(let i=0;i<A;i++){ const v=r.lire(16); if(v<0) return null; dico.push(String.fromCharCode(v)); }
    dico.push(null);   /* l'indice A est la fin de flux */
    const sortie=[]; let k=0, precedent=null;
    for(;;){
      const code=r.lire(mgmtCompressionBits(A+k)); k++;
      if(code<0) return null;
      if(code===A) return sortie.join('');
      let entree;
      if(precedent===null){
        if(code>=A) return null;
        entree=dico[code];
      }else if(code<dico.length){
        entree=dico[code];
        dico.push(precedent+entree.charAt(0));
      }else if(code===dico.length){
        entree=precedent+precedent.charAt(0);
        dico.push(entree);
      }else return null;
      sortie.push(entree); precedent=entree;
    }
  }catch(e){ return null; }
}

/* Vitesse : un gros morceau qui ne change pas d'une sauvegarde à l'autre (le passé généré d'avance, les sept autres organisations) n'est compressé qu'une fois.
   Le mémo est indexé par le texte même du morceau (comparaison exacte, aucune empreinte à tromper) ; au-delà de MGMT_COMPRESSION_MEMO_MAX entrées, les plus anciennes
   (non relues depuis le plus longtemps) sortent. Les petits morceaux voisins sont regroupés avant d'être compressés : un flux a son alphabet à payer. */
const MGMT_COMPRESSION_MEMO_MIN=20000;
const MGMT_COMPRESSION_MEMO_MAX=48;
const mgmtCompressionMemo=new Map();

/** Compresse une suite de morceaux dont la concaténation est le texte à sauvegarder : des flux mis bout à bout, que mgmtDecompresser relit.
 *  @param {string[]} morceaux @returns {string} */
function mgmtCompresserMorceaux(morceaux){
  const sortie=[]; let tampon='';
  const viderTampon=()=>{ if(tampon!==''){ sortie.push(mgmtCompresser(tampon)); tampon=''; } };
  for(const t of morceaux){
    if(t.length<MGMT_COMPRESSION_MEMO_MIN){ tampon+=t; continue; }
    viderTampon();
    let z=mgmtCompressionMemo.get(t);
    if(z===undefined) z=mgmtCompresser(t); else mgmtCompressionMemo.delete(t);
    mgmtCompressionMemo.set(t,z);
    while(mgmtCompressionMemo.size>MGMT_COMPRESSION_MEMO_MAX) mgmtCompressionMemo.delete(mgmtCompressionMemo.keys().next().value);
    sortie.push(z);
  }
  viderTampon();
  return sortie.join('');
}
/* ==== [FIN ANCRE] ==== */
