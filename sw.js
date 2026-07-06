const CACHE_NAME = 'konecta-partner-v11';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/matrix.js',
  './js/franchisee.js',
  './js/clients.js',
  './js/proposals.js',
  './js/materials.js',
  './js/checklist.js',
  './js/utils.js',
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
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
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
            cache.put('./index.html', responseToCache);
          });
          return response;
        })
        .catch(() => caches.match('./index.html'))
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
