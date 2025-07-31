
const CACHE_NAME = 'clickcode-v2'; // Increment version to force cache update
const urlsToCache = [
  '/',
  '/restaurant/login',
  '/restaurant/dashboard',
  '/static/css/main.css',
  '/static/js/main.js',
  '/lovable-uploads/36e1cb40-c662-4f71-b6de-5d764404f504.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching resources');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Force activation of new service worker
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all pages immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - network first for HTML, cache first for assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-HTTP requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Network first strategy for HTML files and API calls
  if (event.request.headers.get('accept')?.includes('text/html') || 
      url.pathname.includes('/api/') || 
      url.pathname.includes('/supabase/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the response if it's successful
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(event.request);
        })
    );
  } 
  // Stale-while-revalidate for static assets
  else if (url.pathname.includes('/assets/') || 
           url.pathname.includes('/static/') ||
           url.pathname.includes('.css') ||
           url.pathname.includes('.js') ||
           url.pathname.includes('.png') ||
           url.pathname.includes('.jpg') ||
           url.pathname.includes('.svg')) {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          // Update cache in background
          const fetchPromise = fetch(event.request)
            .then((response) => {
              if (response.ok) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(event.request, responseClone);
                  });
              }
              return response;
            });
          
          // Return cached version immediately, update in background
          return cachedResponse || fetchPromise;
        })
    );
  }
  // Default behavior for other requests
  else {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(event.request);
        })
    );
  }
});

// Handle PWA launch - redirect to restaurant login if launched from home screen
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CHECK_PWA_LAUNCH') {
    const isPWA = event.data.isPWA;
    if (isPWA) {
      event.ports[0].postMessage({ redirect: '/restaurant/login' });
    }
  }
  
  // Handle skip waiting message
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
