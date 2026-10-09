"use strict";
/* ==== [ANCRE: MGMT_BRIEF_LOT12_PC] — Brief du 06/10/2026, lot 12 : la version PC installable, qui marche hors ligne.
   Le service worker garde en cache tous les fichiers listés par index.html (scripts, feuilles de style, polices) et les sert d'abord depuis le cache,
   puis les rafraîchit en arrière-plan : une mise à jour arrive au lancement suivant. Les SAUVEGARDES ne passent jamais par ici : elles vivent dans le
   localStorage de la page (même origine), que ni l'installation ni une nouvelle version ne touchent. Monter SW_VERSION à chaque livraison. ==== */
const SW_VERSION='b66';
const SW_CACHE='cage-legacy-sw-'+SW_VERSION;
const SW_BASE=['./','./index.html','./manifest.webmanifest','./icons/icone-192.png','./icons/icone-512.png','./images/cendre.jpg','./images/accueil-octogones.jpg','./images/tunnel-or.jpg'];

/** Les fichiers que la page demande (src= et href= de index.html), sans les liens externes. */
function swListerFichiers(html){
  const out=new Set(SW_BASE);
  const re=/(?:src|href)="([^"#]+)"/g; let m;
  while((m=re.exec(html))){
    const u=m[1]; if(/^(?:[a-z]+:)?\/\//i.test(u)||/^(?:data|mailto):/i.test(u)) continue;
    out.add('./'+u.replace(/^\.\//,''));
  }
  /* Les polices sont appelées depuis le CSS en ligne de index.html (url('fonts/…')). */
  const rf=/url\('([^')]+\.woff2[^')]*)'\)/g;
  while((m=rf.exec(html))) out.add('./'+m[1]);
  return Array.from(out);
}
self.addEventListener('install',e=>{
  e.waitUntil((async()=>{
    const cache=await caches.open(SW_CACHE);
    const rep=await fetch('./index.html',{cache:'reload'});
    const html=await rep.clone().text();
    await cache.put('./index.html',rep);
    /* Un fichier manquant ne doit pas empêcher l'installation des autres. */
    await Promise.all(swListerFichiers(html).filter(u=>u!=='./index.html').map(u=>cache.add(new Request(u,{cache:'reload'})).catch(()=>{})));
    self.skipWaiting();
  })());
});
self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    for(const k of await caches.keys()) if(k.indexOf('cage-legacy-sw-')===0&&k!==SW_CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||new URL(r.url).origin!==self.location.origin) return;
  e.respondWith((async()=>{
    const cache=await caches.open(SW_CACHE);
    const garde=await cache.match(r,{ignoreSearch:false})||(r.mode==='navigate'?await cache.match('./index.html'):null);
    const reseau=fetch(r).then(rep=>{ if(rep&&rep.ok) cache.put(r,rep.clone()); return rep; }).catch(()=>null);
    if(garde){ e.waitUntil(reseau); return garde; }
    return (await reseau)||new Response('Hors ligne',{status:503,statusText:'Hors ligne'});
  })());
});
/* ==== [FIN ANCRE] ==== */
