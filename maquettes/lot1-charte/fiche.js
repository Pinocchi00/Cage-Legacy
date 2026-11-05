"use strict";
/* Maquette lot 1 — fiche du combattant (R16) en panneau par-dessus l'Effectif (T7), réglages de maquette, lancement. */

/* ---- Combats passés (fictifs, stables) ---- */
const ADV=['Kévin Darras','Rui Carvalho','Sofiane Belkacem','Anton Kessler','Marek Hrubý','Lucas Ferreira','Kenji Mori','Pavel Sokolov','Diego Morales','Oumar Diallo','Liam Byrne','Tariq Haddou','Zviad Lomidze','Mateus Prado','Ilya Borissov','Hugo Ferrand','Rafael Lima','Bruno Silveira','Arman Tsarukyan','Jalen Moore','Amir Saïd','Yoann Petit'];
function graine(s){let h=2166136261;for(const ch of s)h=Math.imul(h^ch.charCodeAt(0),16777619);return()=>((h=Math.imul(h^(h>>>15),2246822507)>>>0)%10000)/10000;}
function historique(c){
  if(c._h)return c._h;
  const r=graine(c.id),n=c.v+c.d+c.n,res=[],pool=[...ADV].sort(()=>r()-.5);let d=new Date(c.dernier),v=c.v,dd=c.d;const rec=[...c.serie].reverse();
  for(let i=0;i<n;i++){
    let x=i<rec.length?rec[i]:(dd>0&&r()<dd/(v+dd)?'d':'v');if(x==='v'&&!v)x='d';if(x==='d'&&!dd)x='v';x==='v'?v--:dd--;
    const m=r(),meth=x==='v'?(m<.4?['KO','coups de poing']:m<.62?['Soumission','étranglement arrière']:m<.9?['Décision','unanime']:['Décision','partagée'])
      :(m<.5?['Décision','unanime']:m<.75?['KO','coups de poing']:m<.92?['Soumission','clé de bras']:['Arrêt du médecin','coupure']);
    const rd=meth[0]==='Décision'?3:1+Math.floor(r()*3);
    res.push({date:new Date(d),soiree:r()<.85?`Split Fight Night ${62-i*3}`:'Pure Impact 22',adv:pool[i%pool.length],advR:5+Math.floor(r()*30),res:x,meth,rd,tps:meth[0]==='Décision'?'5:00':`${1+Math.floor(r()*4)}:${String(Math.floor(r()*60)).padStart(2,'0')}`});
    d=new Date(d);d.setMonth(d.getMonth()-(4+Math.floor(r()*4)));d.setDate(1+Math.floor(r()*27));
  }
  if(c.id==='nana'){ /* Les traits disent : trois victoires au 3e round, une guerre dont on parle encore. */
    Object.assign(res[0],{adv:'Kévin Darras',meth:['Décision','unanime'],rd:3,tps:'5:00'});
    Object.assign(res[1],{adv:'Rui Carvalho',meth:['KO','coups de poing'],rd:3,tps:'2:14'});
    Object.assign(res[2],{adv:'Sofiane Belkacem',meth:['Décision','partagée'],rd:3,tps:'5:00',guerre:true});
    Object.assign(res[3],{adv:'Ilyas Mezouar',lien:'mezouar',meth:['Soumission','étranglement arrière'],rd:2,tps:'3:40'});
    Object.assign(res[4],{adv:'Anton Kessler',meth:['Décision','unanime'],rd:3,tps:'5:00'});
  }
  return c._h=res;
}
const advHtml=(f,c)=>`<b>${lien(parNom(f.adv,c.cat))}</b>`;

/* ---- Statistiques publiques, comparées à la moyenne de la catégorie à Split ---- */
const MOY={fpm:3.6,prec:45,enc:3.3,defF:55,am:1.4,amR:38,defA:63,sub:.5};
function stats(c){const r=graine(c.id+'s'),lut=/lutt|grappl|samb/i.test(c.style),k=(b,a)=>+(b*(1+(r()-.4)*a)).toFixed(1);
  return {fpm:k(lut?3:4.6,.3),prec:Math.round(k(lut?42:50,.18)),enc:k(c.id==='nana'?4.4:3.2,.2),defF:Math.round(k(52,.15)),am:k(lut?3.1:.8,.35),amR:Math.round(k(lut?48:31,.2)),defA:Math.round(k(lut?80:61,.12)),sub:k(lut?1.3:.2,.5),duree:c.id==='nana'?'12:40':'10:05'};}
const STATS=[['fpm','Frappes significatives par minute','',1],['prec','Précision des frappes','%',1],['enc','Frappes encaissées par minute','',-1],['defF','Frappes évitées','%',1],
  ['am','Amenées au sol par 15 minutes','',1],['amR','Amenées réussies','%',1],['defA','Amenées repoussées','%',1],['sub','Soumissions tentées par 15 minutes','',1]];
const virg=x=>String(x).replace('.',',');

/* ---- « Dans la cage » : l'octogone rempli, trois versions (Q16c) ---- */
const oPts=(cx,cy,h)=>{const a=h*.4142;return [[cx-a,cy-h],[cx+a,cy-h],[cx+h,cy-a],[cx+h,cy+a],[cx+a,cy+h],[cx-a,cy+h],[cx-h,cy+a],[cx-h,cy-a]].map(p=>p.map(v=>v.toFixed(1)).join(',')).join(' ');};
function cage(c){
  const s=stats(c);
  if(S.octo==='cage') return {t:'Dans la cage',svg:`<svg viewBox="0 0 320 320" style="width:100%;max-height:330px"><defs><radialGradient id="g"><stop offset="0" stop-color="#E23A2B"/><stop offset=".55" stop-color="#E23A2B" stop-opacity=".85"/><stop offset="1" stop-color="#E23A2B" stop-opacity="0"/></radialGradient></defs>
      <polygon points="${oPts(160,160,150)}" fill="#E9E6E1"/><polygon points="${oPts(160,160,141)}" fill="#3a3333"/>
      <polygon points="${oPts(160,160,104)}" fill="url(#g)"/><polygon points="${oPts(160,160,104)}" fill="none" stroke="#0D0B0B" stroke-opacity=".35" stroke-width="2"/></svg>`,
    leg:`<span><i style="display:inline-block;width:18px;height:18px;background:var(--rouge-vif);vertical-align:-3px;margin-right:8px"></i>Il impose son combat</span><span><i style="display:inline-block;width:18px;height:18px;background:#3a3333;vertical-align:-3px;margin-right:8px"></i>Il le subit</span>`,
    cap:'Au centre de la cage'};
  if(S.octo==='radar'){
    const ax=STATS.map(([k,,,sens])=>Math.max(.25,Math.min(1.25,(sens>0?s[k]/MOY[k]:MOY[k]/s[k])*.7)));
    const pt=(i,r)=>{const a=-Math.PI/2+i*Math.PI/4;return [160+Math.cos(a)*r*108,160+Math.sin(a)*r*108];};
    const poly=v=>v.map((r,i)=>pt(i,r).map(x=>x.toFixed(1)).join(',')).join(' ');
    const court=['Frappes/min','Précision','Encaissées','Évitées','Amenées','Réussies','Repoussées','Soumissions'];
    return {t:'Son combat en chiffres',svg:`<svg viewBox="-40 0 400 320" style="width:100%;max-height:330px">${[.35,.7,1.05].map(r=>`<polygon points="${poly(Array(8).fill(r))}" fill="none" stroke="#E9E6E1" stroke-opacity=".14"/>`).join('')}
      <polygon points="${poly(Array(8).fill(.7))}" fill="none" stroke="#E9E6E1" stroke-width="2" stroke-dasharray="6 5"/>
      <polygon points="${poly(ax)}" fill="#E23A2B" fill-opacity=".7" stroke="#E23A2B" stroke-width="3"/>
      ${court.map((l,i)=>{const [x,y]=pt(i,1.36);return `<text x="${x}" y="${y-5}" text-anchor="middle" font-size="14" fill="rgba(233,230,225,.7)" font-family="Saira Condensed">${l}</text><text x="${x}" y="${y+13}" text-anchor="middle" font-size="17" font-weight="700" fill="#E9E6E1" font-family="Saira Condensed">${virg(s[STATS[i][0]])}${STATS[i][2]}</text>`;}).join('')}</svg>`,
      leg:`<span><i style="display:inline-block;width:18px;height:18px;background:var(--rouge-vif);vertical-align:-3px;margin-right:8px"></i>Lui</span><span>- - - Moyenne des ${esc(pluriel(c.cat).toLowerCase())}</span>`,cap:''};
  }
  const h=historique(c).filter(x=>x.res==='v'),ko=h.filter(x=>x.meth[0]==='KO').length,sub=h.filter(x=>x.meth[0]==='Soumission').length,dec=h.length-ko-sub,t=h.length||1,H=288,b=304;
  const y1=b-H*ko/t,y2=y1-H*sub/t,y3=y2-H*dec/t;
  return {t:'Comment il gagne',svg:`<svg viewBox="0 0 320 320" style="width:100%;max-height:330px"><defs><clipPath id="oc"><polygon points="${oPts(160,160,141)}"/></clipPath></defs>
    <polygon points="${oPts(160,160,150)}" fill="#E9E6E1"/><g clip-path="url(#oc)"><rect width="320" height="320" fill="#3a3333"/><rect y="${y1}" width="320" height="320" fill="#E23A2B"/><rect y="${y2}" width="320" height="${y1-y2}" fill="#F0B220"/><rect y="${y3}" width="320" height="${y2-y3}" fill="#8a8580"/></g>
    <text x="160" y="178" text-anchor="middle" font-size="60" font-weight="800" fill="#0D0B0B" font-family="Saira Extra Condensed">${c.v} V</text></svg>`,
    leg:`<span><b style="color:var(--rouge-vif)">■</b> KO ${ko}</span><span><b style="color:var(--jaune)">■</b> Soumission ${sub}</span><span><b style="color:#8a8580">■</b> Décision ${dec}</span>`,cap:''};
}

/* ---- Bannière : les images du jeu (tunnel-or.jpg pour un champion, accueil-octogones.jpg sinon), même cadrage que .mf-fb ---- */
function banniere(c){
  const champ=c.rang==='C';
  return `<div class="ban-contenu" id="banC"><i class="fb-img ${champ?'or':''}"></i>
    <div class="fb-nom"><span style="font-size:64px">${esc(c.prenom)}${c.surnom?`<em class="s">« ${esc(c.surnom)} »</em>`:''}</span><span style="font-size:${c.nom.length>8?150:200}px">${esc(c.nom)}</span></div>
    <div class="fb-pal"><div style="display:flex;flex-direction:column;gap:14px"><span style="font-weight:600;font-size:22px;letter-spacing:.04em;color:var(--texte2)">PALMARÈS</span>
      <b class="T" style="font-size:116px;line-height:.69">${bilan(c)}</b><div style="margin-top:4px">${serie(c.serie)}</div></div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:14px">
        ${champ?'<span class="rang-c octr"><span class="octr"><b class="octr">C</b></span></span>':`<span class="marque octr" style="width:84px;height:84px;font-size:46px;background:var(--blanc)">${esc(c.rang)}</span>`}
        <span class="T" style="font-size:30px;text-align:center;line-height:1.1">${esc(c.cat).replace(' ','<br>')}</span></div></div>
  </div>
  <button class="fl-nav g" data-fnav="-1" title="Combattant précédent">${ico('retour',30,3)}</button><button class="fl-nav d" data-fnav="1" title="Combattant suivant">${ico('avant',30,3)}</button>`;
}

/* ---- Onglets (R16) : Style fondu dans Aperçu et Statistiques ; « Ce qu'il pense de toi » dans Lui et Split ---- */
const ONGLETS=['Aperçu','Statistiques','Combats','Contrat','On en dit','Lui et Split'];
function ficheHtml(c){
  const i=COMBATTANTS.findIndex(x=>x.id===c.id);
  return `<div class="banniere oct" id="ban" style="--c:18px;height:260px">${banniere(c)}</div>
    <div style="display:flex;align-items:center;gap:12px;margin:18px 0">${ONGLETS.map(o=>`<button class="onglet oct ${S.onglet===o?'ouvert':''}" data-onglet="${o}">${o}${o==='On en dit'?'<span class="onglet-mq octr"></span>':''}</button>`).join('')}
      <span style="margin-left:auto"></span>
      <button class="bb oct ${S.panCat?'on':''}" data-cat title="Effectif de la catégorie" aria-label="Ouvrir l’effectif de la catégorie"><span class="oct" style="padding:0 16px;gap:10px">${ico('effectif',30)}<svg width="16" height="26" viewBox="0 0 16 26" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="M3 9l5-5 5 5M3 17l5 5 5-5"/></svg></span></button>
      <button class="bb oct" title="Suivre ce combattant"><span class="oct">Suivre</span></button></div>
    ${S.panCat?panneauCat(c):''}
    <div class="apparait" style="height:calc(100% - 352px)">${({'Aperçu':apercu,'Statistiques':statsHtml,'Combats':combatsHtml,'Contrat':contratHtml,'On en dit':onEnDit,'Lui et Split':luiHtml})[S.onglet](c)}</div>`;
}

const pluriel=t=>t.replace(/^Poids ([^ ]+)/,"Poids $1s");
const memeCat=c=>COMBATTANTS.filter(x=>x.cat===c.cat);
/** Les combattants de la catégorie, par-dessus les cases : minimaliste, l'essentiel par ligne, défilement à la molette. */
function panneauCat(c){
  const l=memeCat(c).sort((a,b)=>(a.rang==='C'?0:a.rang)-(b.rang==='C'?0:b.rang));
  return `<div class="panneau-cat">${pan(titre(esc(pluriel(c.cat)),`${l.length} combattants à Split`)+`<div class="defile" style="padding-right:10px">${l.map(x=>`<div class="lc oct ${x.id===c.id?'cur':''}" data-lc="${x.id}">
      ${x.rang==='C'?'<span class="rang-c octr" style="width:44px;height:44px;padding:2px"><span class="octr" style="padding:2px"><b class="octr" style="font-size:26px">C</b></span></span>':`<span class="T" style="font-size:30px;color:${x.id===c.id?'var(--noir)':'var(--texte2)'}">${x.rang}</span>`}
      <span style="min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;flex-direction:column;gap:4px"><span class="T" style="font-size:32px">${esc(x.prenom)} ${esc(x.nom)}</span><span style="font-size:19px;opacity:.75">${x.surnom?`« ${esc(x.surnom)} »`:'Sans surnom'}</span></span>
      <span class="T" style="font-size:32px">${bilan(x)}</span><span class="sous">n° ${x.mondial} mondial</span><span>${serie(x.serie)}</span><span style="font-size:20px;line-height:1.15"><span class="sous" style="${x.id===S.fiche?'color:var(--noir)':''}">Dernier combat</span><br>il y a ${depuis(x.dernier)}</span><span style="font-size:20px">${x.id===c.id?'Fiche ouverte':etat(x)}</span></div>`).join('')}</div>`,'height:100%')}</div>`;
}

function apercu(c){
  const h=historique(c).slice(0,5),k=cage(c);
  const traits=c.traits||[['+','Régulier','Jamais deux défaites de suite','Il revient toujours plus fort après un revers.']];
  const fait=(l,v)=>`<div class="oct" style="--c:8px;background:var(--ligne);padding:10px 14px"><div class="sous">${l}</div><div class="T" style="font-size:34px;margin-top:4px;white-space:nowrap">${v}</div></div>`;
  return `<div style="display:grid;grid-template-columns:1.1fr .95fr 1.15fr;gap:20px;height:100%">
    ${pan(titre('Ce qui le distingue',`${traits.length} traits`)+traits.map(([s,n,d,t])=>`<div class="oct" style="--c:10px;background:var(--ligne);padding:12px 16px;display:flex;gap:16px;align-items:center;margin-bottom:10px">
        <span class="octr" style="width:44px;height:44px;flex:none;display:grid;place-items:center;background:${s==='+'?'var(--blanc)':'var(--neg)'};color:var(--noir);font-weight:800;font-size:28px">${s}</span>
        <div style="flex:1;min-width:0"><div style="display:flex;align-items:baseline;gap:14px"><span class="T" style="font-size:32px">${n}</span><span class="sous" style="margin-left:auto;white-space:nowrap">${d}</span></div><div style="font-size:22px">${t}</div></div></div>`).join('')
      +`<div class="etiq" style="margin:12px 0 2px">Derniers combats</div><div class="defile">${h.map(f=>`<div style="display:flex;gap:12px;align-items:center;padding:6px 0;border-bottom:2px solid var(--sep)">
        <span class="marque octr ${f.res}" style="width:28px;height:28px;font-size:20px">${f.res.toUpperCase()}</span>
        <span style="flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:21px">${f.res==='v'?'bat':'battu par'} ${advHtml(f,c)} <span class="sous">· ${f.meth[0]==='Soumission'?'Soum.':f.meth[0]==='Arrêt du médecin'?'Médecin':f.meth[0]} R${f.rd}</span></span>
        <span class="sous" style="white-space:nowrap">${f.date.getDate()} ${['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'][f.date.getMonth()]} ${f.date.getFullYear()}</span></div>`).join('')}</div>`,'height:100%')}
    ${pan(titre(k.t)+`<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;min-height:0">${k.svg}
        ${k.cap?`<div class="T" style="font-size:28px">${k.cap}</div>`:''}<div style="display:flex;gap:22px;font-size:20px;flex-wrap:wrap;justify-content:center">${k.leg}</div></div>`,'height:100%')}
    <div style="display:flex;flex-direction:column;gap:18px;min-height:0">
      ${pan(`<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">${fait('Âge',c.age+' ans')}${fait('Taille',c.taille)}${fait('Allonge',c.allonge)}${fait('Garde',c.garde)}
        ${fait('Chez Split','Depuis '+c.depuis)}${fait('Contrat',c.contrat[0]+' combat'+(c.contrat[0]>1?'s':''))}${fait('Mondial','n° '+c.mondial)}${fait('Style',c.style.split(',')[0])}</div>`,'flex:none')}
      ${pan(`<div class="etiq">En ce moment</div><div style="font-size:26px;margin-top:10px">${etat(c)}</div>
        <div class="sous" style="margin-top:6px">Dernier combat le ${dCourt(c.dernier)}, il y a ${depuis(c.dernier)}</div>`,'flex:none')}
      ${pan(`<div style="display:flex;align-items:center;gap:20px;height:100%"><div style="flex:1"><div class="etiq">Prochain combat</div><div class="T" style="font-size:34px;margin-top:8px">Aucun combat prévu</div></div>
        <button class="bouton jaune oct cj" data-action="proposer">Proposer un combat</button></div>`,'flex:1')}
    </div></div>`;
}

function statsHtml(c){
  const s=stats(c),h=historique(c),V=h.filter(x=>x.res==='v'),D=h.filter(x=>x.res==='d'),n=(l,m)=>l.filter(x=>x.meth[0]===m).length;
  const barre=([k,l,u,sens])=>{const max=u==='%'?100:MOY[k]*2.2,mieux=sens>0?s[k]>MOY[k]:s[k]<MOY[k];
    return `<div style="margin-bottom:18px"><div style="display:flex;align-items:baseline;gap:20px"><span style="font-size:22px">${l}</span>
      <span class="T" style="margin-left:auto;font-size:36px;display:flex;align-items:center;gap:10px">${mieux?'<i class="octr" style="width:12px;height:12px;background:var(--vert);display:inline-block"></i>':''}${virg(s[k])}${u}</span></div>
      <div class="jauge" style="margin-top:8px;overflow:visible"><i style="width:${Math.min(100,s[k]/max*100)}%;background:rgba(233,230,225,.8)"></i><span style="position:absolute;left:${MOY[k]/max*100}%;top:-6px;bottom:-6px;width:3px;background:var(--blanc)"></span></div>
      <div class="sous" style="font-size:17px;margin-top:4px;padding-left:max(0px,calc(${MOY[k]/max*100}% - 40px))">moyenne ${virg(MOY[k])}${u}</div></div>`;};
  const fin=l=>l.map(([a,b])=>`<div style="display:flex;padding:7px 0;border-bottom:2px solid var(--sep)"><span>${a}</span><span class="T" style="margin-left:auto;font-size:30px">${b}</span></div>`).join('');
  return `<div style="display:grid;grid-template-columns:1fr 1fr .85fr;gap:20px;height:100%">
    ${pan(titre('Debout')+`<div class="defile">${STATS.slice(0,4).map(barre).join('')}</div>`,'height:100%')}
    ${pan(titre('Lutte et sol',`<span style="display:inline-flex;gap:8px;align-items:center;text-transform:none;letter-spacing:0"><i style="width:3px;height:18px;background:var(--blanc)"></i>moyenne des ${esc(pluriel(c.cat).toLowerCase())}</span>`)+`<div class="defile">${STATS.slice(4).map(barre).join('')}</div>`,'height:100%')}
    ${pan(titre('Ses fins de combat')+`<div class="defile"><div class="etiq" style="color:var(--vert)">Victoires · ${V.length}</div>${fin([['KO, ou arrêt de l’arbitre sur coups',n(V,'KO')],['Soumission',n(V,'Soumission')],['Décision des juges',n(V,'Décision')]])}
      <div class="etiq" style="color:var(--neg);margin-top:18px">Défaites · ${D.length}</div>${fin([['KO, ou arrêt de l’arbitre sur coups',n(D,'KO')],['Soumission',n(D,'Soumission')],['Décision des juges',n(D,'Décision')],['Arrêt du médecin',n(D,'Arrêt du médecin')]])}
      <div style="display:flex;margin-top:16px"><span class="sous">Durée moyenne d’un combat</span><span class="T" style="margin-left:auto;font-size:30px">${s.duree}</span></div></div>`,'height:100%')}</div>`;
}

function combatsHtml(c){
  const h=historique(c);
  const th=t=>`<th style="text-align:left;padding:4px 12px 10px;font-weight:600;font-size:18px;letter-spacing:.07em;text-transform:uppercase;color:var(--texte2);border-bottom:2px solid var(--bord);white-space:nowrap">${t}</th>`;
  return pan(`<div class="defile"><table style="width:100%;border-collapse:collapse;font-size:22px"><thead><tr>${['Date','Soirée','Adversaire','','Méthode','Fin','Revoir'].map(th).join('')}</tr></thead><tbody>
    <tr><td colspan="7" class="etiq" style="padding:12px;color:var(--jaune)">Avant ton arrivée</td></tr>
    ${h.map(f=>`<tr><td style="padding:9px 12px;border-bottom:2px solid var(--sep);white-space:nowrap">${dCourt(f.date)}</td><td class="sous" style="padding:9px 12px;border-bottom:2px solid var(--sep);white-space:nowrap">${esc(f.soiree)}</td>
      <td style="padding:9px 12px;border-bottom:2px solid var(--sep);white-space:nowrap">${advHtml(f,c)} <span class="sous">n° ${f.advR}</span>${f.guerre?' <span class="tag" style="height:28px;font-size:15px;border-color:var(--jaune);color:var(--jaune)">On en parle encore</span>':''}</td>
      <td style="padding:9px 12px;border-bottom:2px solid var(--sep)"><span class="marque octr ${f.res}" style="width:30px;height:30px;font-size:21px">${f.res.toUpperCase()}</span></td>
      <td style="padding:9px 12px;border-bottom:2px solid var(--sep);white-space:nowrap">${f.meth[0]} <span class="sous">${f.meth[1]}</span></td><td style="padding:9px 12px;border-bottom:2px solid var(--sep);white-space:nowrap">R${f.rd} · ${f.tps}</td>
      <td style="padding:6px 12px;border-bottom:2px solid var(--sep)"><button class="bouton petit oct" style="height:38px;font-size:22px" data-action="recit">${ico('livre',18)} Récit</button></td></tr>`).join('')}</tbody></table></div>`,'height:100%');
}

function contratHtml(c){
  const champ=c.rang==='C',[n,b]=c.contrat;
  return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;height:100%">
    ${pan(titre('Son contrat')+`<div style="display:grid;grid-template-columns:auto 1fr;gap:16px 30px;font-size:24px;align-items:baseline">
      <span class="etiq">Combats restants</span><span class="T" style="font-size:40px">${n}</span><span class="etiq">Bourse</span><span class="T" style="font-size:40px">${b}</span>
      <span class="etiq">Si victoire</span><span class="T" style="font-size:40px">+ ${b}</span><span class="etiq">Fin</span><span>dans ${n} combat${n>1?'s':''}</span></div>
      <div style="display:flex;gap:12px;margin-top:auto"><button class="bouton jaune oct">Prolonger</button><button class="bouton oct">Libérer</button></div>`,'height:100%')}
    ${pan(titre('Les bourses à Split')+[['Champions','100 000 – 150 000 €',champ],['Classés 1 à 5','35 000 – 60 000 €',!champ&&c.rang<=5],['Classés 6 à 15','15 000 – 30 000 €',!champ&&c.rang>5],['Non classés','8 000 – 14 000 €',false]]
      .map(([a,v,on])=>`<div class="oct" style="--c:8px;display:flex;padding:12px 16px;margin-bottom:8px;background:${on?'var(--blanc)':'var(--ligne)'};color:${on?'var(--noir)':'inherit'};font-weight:${on?700:500}"><span>${a}</span><span style="margin-left:auto">${v}</span></div>`).join('')
      +`<div class="sous" style="margin-top:6px">Bourse par combat, la même somme en cas de victoire.</div>`,'height:100%')}</div>`;
}

function onEnDit(c){
  const nana=c.id==='nana',st=stats(c);
  const q=[['Cage Hebdo',nana?'« À 37 ans, Nana n’a jamais été aussi dangereux dans le troisième round. Ses adversaires le savent et ça ne change rien. »':`« ${c.prenom} ${c.nom} n’a pas encore eu de grand soir. Split aurait tort d’attendre trop longtemps. »`,'il y a 2 semaines'],
    ['Tableau Noir',`« ${virg(st.enc)} frappes encaissées par minute, pour ${virg(st.fpm)} données. ${st.enc>st.fpm?'Il prend des coups pour en donner : ça marche, jusqu’au jour où ça ne marche plus.':'Il touche plus qu’il ne prend, et c’est rarement un hasard.'} »`,'il y a 1 mois'],
    ['Le Forum',nana?'« Belkacem – Nana, j’y étais. Je n’ai jamais entendu le public de Lyon aussi fort. »':`« ${c.nom} ? Je l’ai vu une fois en préliminaires. J’attends de le revoir plus haut sur la carte. »`,'il y a 5 jours']];
  const voix=nana?['<span class="nom" data-fiche="mezouar" style="text-transform:none;letter-spacing:0">Ilyas Mezouar</span>, qui l’a battu','« Il m’a obligé à aller le chercher au sol. Debout, personne ne veut de lui. »']:['son entraîneur','« Il travaille plus que les autres. Il lui manque un combat qui compte. »'];
  return `<div style="display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:auto 1fr;gap:20px;height:100%">
    ${q.map(([m,t,d])=>pan(`<div class="T" style="font-size:34px">${m}</div><p style="font-size:24px;line-height:1.4;font-style:italic;margin:14px 0 8px">${esc(t)}<span class="relire">à relire</span></p><div class="sous" style="margin-top:auto">${d}</div>`)).join('')}
    ${pan(`<div class="etiq">Ce qu’en dit ${voix[0]}</div><p class="T" style="font-size:44px;line-height:1;margin:16px 0 0;text-transform:none">${voix[1]}<span class="relire">à relire</span></p>`,'grid-column:span 2')}
    ${pan(`<div class="etiq">Hors de la cage</div><p style="font-size:22px;line-height:1.45;margin:12px 0 0">${nana?'Le surnom vient de son premier métier. Il passe encore à la boutique familiale entre deux camps.':'Discret en dehors de la salle. Ne donne presque jamais d’interview avant un combat.'}<span class="relire">à relire</span></p>`)}</div>`;
}

function luiHtml(c){
  return `<div style="display:grid;grid-template-columns:1.25fr 1fr;gap:20px;height:100%">
    ${pan(titre('Ce qu’il pense de toi')+`<p class="T" style="font-size:52px;line-height:1;text-transform:none;margin:0">« On ne se connaît pas encore. Trouve-moi un nom et on parlera. »<span class="relire">à relire</span></p>`,'height:100%')}
    ${pan(titre('Lui et Split')+`<div style="display:grid;grid-template-columns:auto 1fr;gap:12px 26px;font-size:24px"><span class="etiq">Arrivé</span><span>En ${c.depuis}, sous ton prédécesseur</span>
      <span class="etiq">Combats à Split</span><span>9</span>${c.rang==='C'?'<span class="etiq">Ceinture</span><span>Depuis mars 2026 · 1 défense</span>':''}</div>
      <div class="etiq" style="margin-top:26px">${esc(S.nomDemandes)} <span class="relire">nom à choisir</span></div><div style="font-size:22px;margin-top:8px;color:var(--texte2)">Aucune pour l’instant.</div>`,'height:100%')}</div>`;
}

/* ---- Ouvrir, naviguer, glisser (cliquer-tirer, T1) ---- */
function ouvrirFiche(id,garderFutur=false){
  if(!garderFutur)S.futur=[];
  if(S.ecran!=='effectif'){S.hist.push(S.ecran);S.ecran='effectif';}
  if(S.fiche&&S.fiche!==id)S.ficheHist.push(S.fiche);
  S.fiche=id;S.panCat=false;rendre();rendreFiche();setTimeout(()=>$('#fiche').classList.add('ouverte'),30);
}
function fermerFiche(r=true){S.fiche=null;S.ficheHist=[];S.panCat=false;$('#fiche').classList.remove('ouverte');if(r)rendre();}
function retour(){
  if(S.fiche){S.futur.push({fiche:S.fiche});if(S.ficheHist.length){S.fiche=S.ficheHist.pop();rendre();rendreFiche(-1);}else fermerFiche();return;}
  if(S.hist.length){S.futur.push({ecran:S.ecran});S.ecran=S.hist.pop();rendre();}
}
function avant(){
  const p=S.futur.pop();if(!p)return;
  if(p.fiche)ouvrirFiche(p.fiche,true);else{S.hist.push(S.ecran);S.ecran=p.ecran;rendre();}
}
function rendreFiche(dir=0){
  $('#fiche').innerHTML=ficheHtml(parId(S.fiche));
  const n=$('.ent-n');if(n)n.textContent=`${COMBATTANTS.findIndex(c=>c.id===S.fiche)+1} / ${COMBATTANTS.length}`;
  if(dir)$('#banC').animate([{transform:`translateX(${dir*160}px)`,opacity:0},{transform:'none',opacity:1}],{duration:320,easing:'cubic-bezier(.2,.8,.2,1)'});
  const ban=$('#ban'),el=$('#banC');let x0=null,dx=0,k=1;
  ban.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;k=$('.scene').getBoundingClientRect().width/1920;x0=e.clientX;dx=0;ban.setPointerCapture(e.pointerId);el.style.transition='none';});
  ban.addEventListener('pointermove',e=>{if(x0===null)return;dx=(e.clientX-x0)/k;el.style.transform=`translateX(${dx}px)`;el.style.opacity=1-Math.min(.7,Math.abs(dx)/600);});
  const fin=()=>{if(x0===null)return;x0=null;el.style.transition='';
    if(Math.abs(dx)>110){const d=dx<0?1:-1;el.style.transform=`translateX(${-d*600}px)`;el.style.opacity=0;setTimeout(()=>{S.fiche=voisin(d);rendreFiche(d);},200);}else{el.style.transform='';el.style.opacity='';}};
  ban.addEventListener('pointerup',fin);ban.addEventListener('pointercancel',fin);
}
const voisin=d=>{const c=parId(S.fiche),l=c.ext?[c]:memeCat(c),i=l.findIndex(x=>x.id===S.fiche);return l[(i+d+l.length)%l.length].id;};

/* ---- Choix à faire sur la maquette ---- */
const REGLAGES=[
  ['fond','Fond (le cendré est retiré, C1)',[['arene','Arène','matière proche'],['cage','Lumière de cage',''],['sobre','Noir sobre',''],['cendre','Cendré','actuel, pour comparer']]],
  ['police','Police des titres',[['saira','Saira','actuelle'],['barlow','Barlow',''],['bigshoulders','Big Shoulders',''],['oswald','Oswald','']]],
  ['octo','Octogone de la fiche',[['cage','Dans la cage','rempli'],['radar','En chiffres','8 statistiques'],['fins','Comment il gagne','rempli par méthode']]],
  ['recruteur','Recruteur (accueil)',[['dispo','Disponible',''],['voyage','En voyage','']]],
  ['nomDemandes','Nom des demandes (sans « promesse »)',[['Ses demandes','Ses demandes',''],['Engagements','Engagements',''],['Parole donnée','Parole donnée','']]],
];
S.nomDemandes='Ses demandes';
const reglagesHtml=()=>`<div class="oct"><div class="etiq" style="color:var(--jaune);margin-bottom:10px">Choix à faire sur cette maquette</div>${REGLAGES.map(([k,l,o])=>`<div class="sous">${l}</div><div class="choix">${o.map(([v,t,s])=>`<button class="oct ${S[k]===v?'cur':''}" style="--c:6px" data-reglage="${k}" data-val="${esc(v)}">${esc(t)}${s?`<small>${esc(s)}</small>`:''}</button>`).join('')}</div>`).join('')}</div>`;

/* ---- Lancement ---- */
function echelle(){const s=Math.min(innerWidth/1920,innerHeight/1080),sc=$('.scene');sc.style.transform=`scale(${s})`;sc.style.left=(innerWidth-1920*s)/2+'px';sc.style.top=(innerHeight-1080*s)/2+'px';}
document.addEventListener('click',e=>{
  const t=e.target;let el;
  if(t.closest('#bRepli')){document.body.classList.toggle('repliee');return;}
  if(t.closest('#bRetour')){retour();return;}
  if(t.closest('#bAvant')){avant();return;}
  if(t.closest('[data-cat]')){S.panCat=!S.panCat;rendreFiche();return;}
  if((el=t.closest('[data-lc]'))){if(el.dataset.lc!==S.fiche)ouvrirFiche(el.dataset.lc);else{S.panCat=false;rendreFiche();}return;}
  if(S.panCat&&!t.closest('.panneau-cat')&&t.closest('#fiche')){S.panCat=false;rendreFiche();}
  if(t.closest('#bContinuer')){continuer();return;}
  if(t.closest('#bReglages')){$('#reglages').classList.toggle('on');return;}
  if((el=t.closest('[data-reglage]'))){S[el.dataset.reglage]=el.dataset.val;document.body.dataset.fond=S.fond;document.body.dataset.police=S.police;$('#reglages').innerHTML=reglagesHtml();if(S.fiche)rendreFiche();else rendre();return;}
  if((el=t.closest('[data-fiche]'))){e.stopPropagation();ouvrirFiche(el.dataset.fiche);return;}
  if((el=t.closest('[data-fnav]'))){const d=+el.dataset.fnav;S.fiche=voisin(d);S.panCat=false;rendreFiche(d);return;}
  if((el=t.closest('[data-onglet]'))){S.onglet=el.dataset.onglet;rendreFiche();return;}
  if((el=t.closest('[data-tri]'))){const k=el.dataset.tri;S.tri=S.tri.col===k?{col:k,sens:-S.tri.sens}:{col:k,sens:1};rendre();return;}
  if((el=t.closest('[data-action]'))){const a=el.dataset.action;
    if(a==='proposer')toast('Ouvre la carte avec lui déjà posé : écran Carte, hors de cette maquette.');
    if(a==='recit')toast('Relire le récit et les temps forts (Q39b). L’arène n’existe que pour tes soirées.');return;}
  if((el=t.closest('[data-go]'))){aller(el.dataset.go);return;}
});
window.addEventListener('resize',echelle);
window.addEventListener('DOMContentLoaded',()=>{
  document.body.dataset.fond=S.fond;document.body.dataset.police=S.police;echelle();
  const q=new URLSearchParams(location.search);
  if(q.get('octo'))S.octo=q.get('octo');if(q.get('onglet'))S.onglet=q.get('onglet');
  rendre();
  if(q.get('fiche'))ouvrirFiche(q.get('fiche'));
  if(q.get('cat')){S.panCat=true;rendreFiche();}
});
