const CACHE_NAME = 'ze-praga-public-v3';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => {
 event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('ze-praga-') && k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
 const request = event.request, url = new URL(request.url);
 // Dados autenticados, navegações e URLs assinadas nunca entram no cache.
 if(request.method !== 'GET' || url.origin !== self.location.origin || request.headers.has('Authorization') || url.search || !/^\/static\/.+\.[a-f0-9]{8,}\.[^/]+$/i.test(url.pathname)) return;
 event.respondWith(caches.open(CACHE_NAME).then(async cache => {
   const cached = await cache.match(request); if(cached) return cached;
   const response = await fetch(request); if(response.ok && response.type === 'basic') await cache.put(request,response.clone());
   return response;
 }));
});