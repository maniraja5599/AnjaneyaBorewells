const CACHE_NAME = 'anjaneya-borewells-cache-v2.9.6';
const ASSETS = [
  './',
  './index.html',
  './styles.css?v=2.9.6',
  './script.js?v=2.9.6',
  './site-config.json',
  './manifest.json',
  './logo.png',
  './logo.jpg',
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
