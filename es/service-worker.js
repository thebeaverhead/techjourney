let cacheName = "0.0.2";

let filesToCache = [
  './',
  './style.css',
  './index.html',
  './logo-tbh-red.svg',
  './data.json',
  './bundle.js',

  './fonts/Roboto-Light.ttf',
  './fonts/Roboto-Regular.ttf',
  './fonts/Roboto-Bold.ttf',

  './fonts/MaterialIcons-Regular.eot',
  './fonts/MaterialIcons-Regular.ttf',
  './fonts/MaterialIcons-Regular.woff',
  './fonts/MaterialIcons-Regular.woff2',

  './logos/springlogo.png',
  './logos/reactlogo.png',
  './logos/phplogo.png',
  './logos/jslogo.png',
  './logos/chromelogo.png',
];

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});


self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  console.log('[ServiceWorker] Fetch', e.request.url);
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});
