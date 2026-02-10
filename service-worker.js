/* 手書きメモ PWA - service worker */
const CACHE_NAME = "simple-memo-stable-20260210064734";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./service-worker.js",
  "./favicon-32.png",
  "./apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-192.png",
  "./icons/maskable-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : Promise.resolve())))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  // GETだけ対象
  if (req.method !== "GET") return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req).then((res) => {
        // 同一オリジンのファイルはキャッシュ
        const url = new URL(req.url);
        if (url.origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return res;
      }).catch(() => {
        // ネットが無いときはトップを返す
        return caches.match("./index.html");
      });
    })
  );
});
