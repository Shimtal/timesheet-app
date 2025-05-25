const CACHE_NAME = 'timesheet-app-v1.0';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// התקנת Service Worker
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

// טעינת קבצים מהמטמון
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // החזר מהמטמון אם קיים
        if (response) {
          return response;
        }
        
        // אחרת נסה לטעון מהאינטרנט
        return fetch(event.request).then(
          function(response) {
            // בדוק שהתגובה תקינה
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // שמור עותק במטמון
            var responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});

// עדכון Service Worker
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
