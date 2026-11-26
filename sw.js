// Service worker: permette l'uso completamente offline.
// Se modifichi i file dell'app, cambia il numero di versione qui sotto.
const CACHE = 'fisiolog-v11';
const FILES = [
  './',
  './index.html',
  './tailwind.css',
  './fonts.css',
  './lucide.min.js',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Risponde subito dalla copia salvata e intanto aggiorna la copia in background
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(req, { ignoreSearch: true }).then(cached => {
        const network = fetch(req)
          .then(res => { if (res && res.ok) cache.put(req, res.clone()); return res; })
          .catch(() => cached || cache.match('./index.html'));
        return cached || network;
      })
    )
  );
});
