const CACHE_NAME = 'konecta-partner-v12';
const ASSETS = [
  './?ativar=1',
  './index.html',
  './css/style.css',
  './js/app.js?v=19',
  './js/matrix.js?v=19',
  './js/franchisee.js?v=13',
  './js/clients.js?v=13',
  './js/proposals.js?v=13',
  './js/materials.js?v=13',
  './js/checklist.js?v=13',
  './js/utils.js?v=13',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-icon.png',
  './icons/konecta-icon-v2-192.png',
  './icons/konecta-icon-v2-512.png',
  './icons/konecta-maskable-v2-512.png',
  './icons/konecta-icon-v3-192.png',
  './icons/konecta-icon-v3-512.png',
  './icons/konecta-maskable-v3-512.png',
  './icons/apple-touch-icon.png',
  './favicon.png',
  './assets/konecta-symbol.png',
  './public/franqueados.json'
];

// Instalação
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Ativação
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys.map(key => caches.delete(key)));
    }).then(() => self.clients.claim())
  );
});

// Interceptação de requisições
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => caches.match(event.request).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
