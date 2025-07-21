
const CACHE_NAME = 'clickcode-v1';
const urlsToCache = [
  '/',
  '/restaurant/login',
  '/restaurant/dashboard',
  '/static/css/main.css',
  '/static/js/main.js',
  '/lovable-uploads/36e1cb40-c662-4f71-b6de-5d764404f504.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Handle PWA launch - redirect to restaurant login if launched from home screen
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CHECK_PWA_LAUNCH') {
    // Check if this is a PWA launch (standalone mode)
    const isPWA = event.data.isPWA;
    if (isPWA) {
      event.ports[0].postMessage({ redirect: '/restaurant/login' });
    }
  }
});
