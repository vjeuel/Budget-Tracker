const FILES_TO_CACHE = [
   "/",
   "/icons/new-icon-144x115.png",
   "/icons/new-icon-192x154.png",
   "/icons/new-icon-512x410.png",
   "/img/logo.png",
   "/index.html",
   "/index.js",
   "/indexedDB.js",
   "/manifest.webmanifest",
   "/styles.css",
   "https://cdn.jsdelivr.net/npm/chart.js@2.8.0",
   "https://fonts.googleapis.com/css2?family=Antic+Slab&family=Righteous&display=swap"
];

const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

// Install
self.addEventListener("install", evt => {
   evt.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
         console.log("Your files were pre-cached successfully!");
         return cache.addAll(FILES_TO_CACHE);
      })
   );
   self.skipWaiting();
});

// activate
self.addEventListener("activate", evt => {
   evt.waitUntil(
      caches.keys().then(keyList => {
         return Promise.all(
            keyList.map(key => {
               if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                  console.log("Removing old cache data", key);
                  return caches.delete(key);
               }
            })
         );
      })
   );
   self.clients.claim();
});

//fetch
self.addEventListener("fetch", evt => {
   if (evt.request.url.includes("/api/")) {
      evt.respondWith(
         caches.open(DATA_CACHE_NAME).then(cache => {
            return fetch(evt.request).then(response => {
               if (response.status === 200) {
                  cache.put(evt.request.url, response.clone());
               }
               return response;
            })
               .catch(err => {
                  return cache.match(evt.request);
               });
         }).catch(err => console.log(err))
      );
      return;
   }
   evt.respondWith(
      caches.match(evt.request).then(response => {
         return response || fetch(evt.request);
      })
   );
});