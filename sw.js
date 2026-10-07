const VERSION='1.3.0',CACHE=`ors-shell-${VERSION}`;
const ROOT=new URL('./',self.location.href);
const FILES=['./','./index.html','./app.js?v=1.3.0','./model.js?v=1.3.0','./style.css?v=1.3.0','./tokens.css?v=1.3.0','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png','./data/recipes-v2.json'];
const absolute=p=>new URL(p,ROOT).href;
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES.map(absolute))));});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('ors-shell-')&&key!==CACHE)await caches.delete(key);await self.clients.claim();})());});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();if(event.data?.type==='CHECK_READY')event.waitUntil((async()=>{const cache=await caches.open(CACHE);const results=await Promise.all(FILES.map(p=>cache.match(absolute(p))));event.ports[0]?.postMessage({ready:results.every(Boolean),version:VERSION});})());});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);if(request.method!=='GET'||url.origin!==ROOT.origin||!url.pathname.startsWith(ROOT.pathname))return;
 event.respondWith((async()=>{
 const recipe=url.pathname===new URL('data/recipes-v2.json',ROOT).pathname;
 const cache=await caches.open(CACHE);
 // Requests try the network first. Recipe responses are cached only after application validation.
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),1800);
 try{const response=await fetch(request,{signal:controller.signal});if(!response.ok||response.redirected)throw Error('Unavailable');
  if(!recipe&&FILES.some(p=>absolute(p)===request.url)){await cache.put(request,response.clone());}
  return response;
 }catch{
  let saved;if(recipe)saved=await(await caches.open('ors-validated-recipes')).match(request,{ignoreSearch:true});
  saved=saved||await cache.match(request)|| (request.mode==='navigate'?await cache.match(absolute('./index.html')):null);
  if(saved&&recipe){const headers=new Headers(saved.headers);headers.set('X-ORS-Cache','fallback');return new Response(await saved.arrayBuffer(),{status:200,headers});}
  return saved||new Response('Offline: this resource has not been saved.',{status:503,headers:{'Content-Type':'text/plain'}});
 }finally{clearTimeout(timer);}
 })());
});
