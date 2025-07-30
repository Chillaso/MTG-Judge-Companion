const CACHE_NAME = 'mtg-rules-v1';
const BASE_URL = '/mtg-rules/';

// Resources to cache on install
const STATIC_RESOURCES = [
  BASE_URL,
  BASE_URL + 'categories',
  BASE_URL + 'glossary',
  BASE_URL + 'rules.json',
  BASE_URL + 'rules-index.json',
  BASE_URL + 'glossary.json',
  BASE_URL + 'mtg-16.png',
  BASE_URL + 'mtg-32.png',
  BASE_URL + 'mtg-180.png',
  BASE_URL + 'mtg-192.png',
  BASE_URL + 'mtg-512.png',
  BASE_URL + 'mtg-judge.png',
  BASE_URL + 'favicon.ico'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static resources...');
        return cache.addAll(STATIC_RESOURCES);
      })
      .then(() => {
        console.log('Service Worker: Static resources cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static resources:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cache);
              return caches.delete(cache);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache first, fallback to network
self.addEventListener('fetch', (event) => {
  // Only handle requests within our scope
  if (!event.request.url.includes(BASE_URL)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('Service Worker: Serving from cache:', event.request.url);
          return cachedResponse;
        }

        // Fetch from network and cache the response
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response before caching
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                console.log('Service Worker: Caching new resource:', event.request.url);
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch((error) => {
            console.error('Service Worker: Fetch failed:', error);
            
            // Return a basic offline message for HTML pages
            if (event.request.headers.get('accept').includes('text/html')) {
              return new Response(`
                <!DOCTYPE html>
                <html>
                <head>
                  <title>MTG Rules - Offline</title>
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <style>
                    body { font-family: sans-serif; text-align: center; padding: 50px; }
                    .offline { color: #666; }
                  </style>
                </head>
                <body>
                  <h1>MTG Rules</h1>
                  <p class="offline">You're currently offline. Some content may not be available.</p>
                  <p><a href="${BASE_URL}">Go to Home</a></p>
                </body>
                </html>
              `, {
                headers: { 'Content-Type': 'text/html' }
              });
            }
            
            throw error;
          });
      })
  );
});

// Handle background sync for future offline functionality
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync:', event.tag);
});

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
});