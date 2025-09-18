// Service Worker for Anjaneya Borewells Website
// Provides offline functionality and caching

const CACHE_NAME = 'anjaneya-borewells-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/admin.html',
    '/styles.css',
    '/script.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Install event - cache resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                return response || fetch(event.request);
            }
        )
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Background sync for form submissions
self.addEventListener('sync', event => {
    if (event.tag === 'contact-form') {
        event.waitUntil(syncContactForm());
    }
    if (event.tag === 'callback-request') {
        event.waitUntil(syncCallbackRequest());
    }
});

// Sync contact form data when back online
async function syncContactForm() {
    try {
        const formData = await getStoredFormData('contact-form');
        if (formData) {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                await clearStoredFormData('contact-form');
                console.log('Contact form synced successfully');
            }
        }
    } catch (error) {
        console.error('Failed to sync contact form:', error);
    }
}

// Sync callback request data when back online
async function syncCallbackRequest() {
    try {
        const callbackData = await getStoredFormData('callback-request');
        if (callbackData) {
            const response = await fetch('/api/callback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(callbackData)
            });
            
            if (response.ok) {
                await clearStoredFormData('callback-request');
                console.log('Callback request synced successfully');
            }
        }
    } catch (error) {
        console.error('Failed to sync callback request:', error);
    }
}

// Store form data for offline sync
function storeFormData(key, data) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('anjaneya-borewells-forms', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['forms'], 'readwrite');
            const store = transaction.objectStore('forms');
            store.put(data, key);
            resolve();
        };
        
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('forms')) {
                db.createObjectStore('forms');
            }
        };
    });
}

// Get stored form data
function getStoredFormData(key) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('anjaneya-borewells-forms', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['forms'], 'readonly');
            const store = transaction.objectStore('forms');
            const getRequest = store.get(key);
            
            getRequest.onsuccess = () => resolve(getRequest.result);
            getRequest.onerror = () => reject(getRequest.error);
        };
    });
}

// Clear stored form data
function clearStoredFormData(key) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('anjaneya-borewells-forms', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['forms'], 'readwrite');
            const store = transaction.objectStore('forms');
            store.delete(key);
            resolve();
        };
    });
}

// Push notification handling (for future use)
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'New update available',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Details',
                icon: '/icon-192x192.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/icon-192x192.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Anjaneya Borewells', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message handling for communication with main thread
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Update available notification
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(CACHE_NAME)
                .then(cache => cache.addAll(event.data.urls))
        );
    }
});
