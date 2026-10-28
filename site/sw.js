var CACHE = "mesa-v1";
var URLS = [
  "/aprender/mesa/",
  "/en/learn/table/",
  "/ast/deprender/mesa/",
  "/css/mesa.css",
  "/js/mesa.js",
  "/favicon.png",
  "/apple-touch-icon.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(URLS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) {
        return k !== CACHE;
      }).map(function (k) {
        return caches.delete(k);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

// Network first, so updates arrive. Cache is the fallback when offline.
self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== location.origin || URLS.indexOf(url.pathname) === -1) return;
  event.respondWith(
    fetch(req).then(function (res) {
      if (res.ok) {
        var copy = res.clone();
        caches.open(CACHE).then(function (cache) {
          cache.put(url.pathname, copy);
        });
      }
      return res;
    }).catch(function () {
      return caches.match(url.pathname);
    })
  );
});
