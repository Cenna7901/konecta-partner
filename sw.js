const CACHE_NAME = 'konecta-partner-v30';
const ASSETS = [
  './?ativar=1',
  './index.html',
  './adm.html?adm=1',
  './css/style.css',
  './js/app.js?v=30',
  './js/admin.js?v=1',
  './js/matrix.js?v=19',
  './js/franchisee.js?v=13',
  './js/clients.js?v=13',
  './js/proposals.js?v=13',
  './js/materials.js?v=13',
  './js/checklist.js?v=13',
  './js/utils.js?v=13',
  './icons/konecta-icon-v3-192.png',
  './icons/konecta-icon-v3-512.png',
  './icons/konecta-maskable-v3-512.png',
  './icons/apple-touch-icon.png',
  './favicon.png',
  './assets/konecta-symbol.png',
  './public/franqueados.json'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => {
      if (url.pathname.endsWith('/adm.html')) return caches.match('./adm.html?adm=1');
      return caches.match('./?ativar=1') || caches.match('./index.html');
    }));
    return;
  }
  event.respondWith(fetch(event.request).then(response => {
    if (!response || response.status !== 200 || response.type !== 'basic') return response;
    const clone = response.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
    return response;
  }).catch(() => caches.match(event.request)));
});
