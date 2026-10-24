
const CACHE_NAME = "ds-practical-programs-v1";
const PAGE_URL = new URL("./ds.html", self.registration.scope).href;

self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.add(PAGE_URL);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function(cacheName) {
            return cacheName.startsWith("ds-practical-programs-") &&
              cacheName !== CACHE_NAME;
          })
          .map(function(cacheName) {
            return caches.delete(cacheName);
          })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function(event) {
  const request = event.request;

  if (
    request.method !== "GET" ||
    new URL(request.url).origin !== self.location.origin
  ) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).then(function(response) {
        if (response.ok) {
          const copy = response.clone();

          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(PAGE_URL, copy);
          });
        }

        return response;
      }).catch(function() {
        return caches.open(CACHE_NAME).then(function(cache) {
          return cache.match(request, { ignoreSearch: true }).then(function(cachedPage) {
            return cachedPage || cache.match(PAGE_URL);
          });
        }).then(function(cachedPage) {
          return cachedPage || new Response(
            "Offline: Please open the website online once before using it offline.",
            { headers: { "Content-Type": "text/plain" } }
          );
        });
      })
    );
  }
});
