const CACHE_NAME = 'anjaneya-borewells-cache-v6.3.3';
const ASSETS = [
  './',
  './index.html',
  './privacy.html',
  './styles.css?v=4.2.8',
  './script.js?v=4.3.0',
  './site-config.json',
  './manifest.json',
  './logo.webp',
  './logo.png',
  './logo.jpg',
  './welcoming-people.webp',
  './welcoming-people.png',
  './rig-illustration.webp',
  './rig-illustration.png',
  './logo_blue_watermark.webp',
  './scenic-rural-track.webp',
  './valluvar-with-bg.webp',
  './slogan-right-leaves.webp',
  './images/1.webp',
  './images/2.webp',
  './images/3.webp',
  './images/4.webp',
  './images/5.webp',
  './images/6.webp',
  './favicon.ico',
  './favicon.png',
  './favicon-16x16.png',
  './favicon-32x32.png',
  './favicon-48x48.png',
  './apple-touch-icon.png',
  './android-chrome-192x192.png',
  './android-chrome-512x512.png',
  './favicon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => {
        console.log('[SW] Auto-purging obsolete cache bucket:', k);
        return caches.delete(k);
      })
    )).then(() => self.clients.claim())
  );
});

// Network-First for core dynamic files, Cache-First for static media assets
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isCodeOrDoc = event.request.mode === 'navigate' || 
                      url.pathname.endsWith('.html') || 
                      url.pathname.endsWith('.js') || 
                      url.pathname.endsWith('.css') || 
                      url.pathname.endsWith('.json') ||
                      url.pathname === '/' ||
                      url.pathname === '';

  if (isCodeOrDoc) {
    // Network-First: Fetch freshest copy from server, fallback to cache if offline
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Cache-First with background revalidation for static media assets
    event.respondWith(
      caches.match(event.request).then(cached => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return networkResponse;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
  }
});
