// Cache version - update this when deploying new versions
const CACHE_VERSION = '2';
const CACHE_NAME = `24toolhub-v${CACHE_VERSION}`;
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/main.js',
  '/favicon.ico',
  '/images/logo.png'
];

// Install Event
self.addEventListener('install', (event) => {
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  // Take control of all pages immediately
  event.waitUntil(
    Promise.all([
      // Claim all clients
      self.clients.claim(),
      // Delete old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME && cache.startsWith('24toolhub-')) {
              console.log('Deleting old cache:', cache);
              return caches.delete(cache);
            }
          })
        );
      })
    ])
  );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  // API calls and dynamic content -> Network First
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('/ip-info') || 
      event.request.url.includes('/ping') ||
      event.request.url.includes('/chat') ||
      event.request.url.includes('/health')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Static Assets -> Stale While Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Update the cache with the fresh response
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);
      
      // Return cached response immediately, then update cache in background
      return cachedResponse || fetchPromise;
    })
  );
});

