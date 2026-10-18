"use strict";
/* ==== [ANCRE: DUO_UI_PLANCHES] — Mode Duo : le balisage commun des planches (maquettes/duo/src/construire.js), porté tel quel. Les écrans du Duo
   émettent EXACTEMENT le balisage de leur planche, sous le conteneur `.duo-s` dont la feuille `ui-duo.css` est générée par tools/duo-css.js. ==== */

/** Échappe un texte pour le HTML. @returns {string} */
function duoEsc(s){ return esc(s==null?'':s); }
/** Majuscules (les noms de joueurs et de combattants gardent leurs accents). @returns {string} */
function duoMaj(s){ return String(s==null?'':s).toUpperCase(); }
/** Un montant en k€ : « 57 000 € » (espaces fines). @returns {string} */
function duoEuros(k){
  const v=Math.round((Number.isFinite(k)?k:0)*1000);
  const t=String(Math.abs(v)).replace(/\B(?=(\d{3})+(?!\d))/g,' ');
  return (v<0?'−':'')+t+' €';
}
/** L'octogone gravé du logo, à la taille `t`. @returns {string} */
function duoOct(t){
  return `<svg width="${t}" height="${t}" viewBox="0 0 400 400" fill="none" role="img" aria-label="L’octogone rouge gravé" style="flex:none"><path d="M292.0 238.1L238.1 292.0L161.9 292.0L108.0 238.1L108.0 161.9L161.9 108.0L238.1 108.0L292.0 161.9Z" stroke="#E23A2B" stroke-width="15.0"/><path d="M331.0 254.3L254.3 331.0L145.7 331.0L69.0 254.3L69.0 145.7L145.7 69.0L254.3 69.0L331.0 145.7Z" stroke="#E23A2B" stroke-width="21.0"/><path d="M371.0 270.8L270.8 371.0L129.2 371.0L29.0 270.8L29.0 129.2L129.2 29.0L270.8 29.0L371.0 129.2Z" stroke="#E23A2B" stroke-width="12.0"/></svg>`;
}
/** Le logo de l'écran d'arrivée (octogone et mots). @returns {string} */
function duoLogo(t){
  return `<div class="logo">${duoOct(t)}<div class="logo-mots"><b>CAGE</b><i>LEGACY</i></div></div>`;
}
/** L'en-tête de planche : logo seul, plaque « DUO », libellé, et le bloc de droite. @returns {string} */
function duoEntete(lib,droite){
  return `<div class="logo-seul">${duoLogo(64)}</div>
  <div class="entete"><div class="entete-g"><div class="plaque"><span class="T">DUO</span></div><div class="entete-lib">${lib}</div></div>
  <div class="entete-d">${droite||''}</div></div>`;
}
/** La droite de l'en-tête : saison et numéro de la super carte (sur quatre). @returns {string} */
function duoDroiteSaison(s,n){
  return `<div class="plaque"><span class="T">SAISON ${duoEsc(s)}</span></div><div class="plaque"><span class="T">SUPER CARTE</span><span class="T rouge">${duoEsc(n)}</span><span class="lab">SUR 4</span></div>`;
}
/** Un panneau à triple filet (p2, p3) de classe `cls`. @returns {string} */
function duoPan(cls,inner,attr){
  return `<div class="pan ${cls}"${attr||''}><div class="p2"><div class="p3">${inner}</div></div></div>`;
}
/** L'en-tête d'un panneau : titre, trait rouge, libellé facultatif. @returns {string} */
function duoTitre(t,lab){
  return `<div class="pan-tete"><div class="pan-titre"><div class="T">${t}</div><div class="trait"></div></div>${lab?`<div class="lab">${lab}</div>`:''}</div>`;
}
/** Les trois dernières issues d'un combattant (v, d, n). @returns {string} */
function duoForme(f){
  return `<div class="forme">${(f||[]).map(x=>`<i class="f-${x}">${x==='v'?'V':x==='d'?'D':'N'}</i>`).join('')}</div>`;
}
/** Le nom d'un joueur dans sa couleur (`cote` : 'a' ou 'b'). @returns {string} */
function duoTag(m,cote){
  return `<span class="tag ${cote==='a'?'j1':'j2'}">${duoEsc(duoMaj(m.duo.noms[cote]))}</span>`;
}
/** La barre des touches de planche ; `liste` : [[touches],libellé,jaune?,onclick?]. @returns {string} */
function duoTouches(liste){
  return `<div class="touches large">${liste.map(([k,t,j,oc])=>`<div class="tg"${oc?` onclick="${oc}" style="cursor:pointer"`:''}>${k.map(x=>`<span class="k${j?' j':''}">${x}</span>`).join('')}<span>${t}</span></div>`).join('')}</div>`;
}
/** L'écran Duo complet : le cadre du jeu (fond, échelle) portant le balisage de la planche. @returns {string} */
function duoCadre(corps){
  return `<div class="mf-ecran${typeof mfEntreeClasse==='function'?mfEntreeClasse():''}"><div class="mf-stage"><div class="mf-fond"></div><div class="duo-s">${corps}</div></div></div>`;
}
