/* sw-demo.js — Service Worker EXCLUSIVO del modo demo.
   Toma el control de inmediato (skipWaiting + clients.claim) reemplazando
   al Service Worker antiguo, y NO cachea nada: todo se sirve siempre fresco
   desde la red. Así nunca te dará versiones viejas mientras grabas. */

self.addEventListener('install', function (e) {
  // Activarse sin esperar a que el SW viejo se libere
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    Promise.all([
      // Borrar TODAS las cachés del SW anterior (tiles, imgs, libs, tracks…)
      caches.keys().then(function (keys) {
        return Promise.all(keys.map(function (k) { return caches.delete(k); }));
      }),
      // Tomar el control de las pestañas abiertas ahora mismo
      self.clients.claim()
    ])
  );
});

self.addEventListener('fetch', function (e) {
  // Sin caché: siempre red. Si la red falla, deja pasar el error normal.
  // (En modo demo hay conexión, así que esto es lo que queremos.)
  e.respondWith(fetch(e.request));
});
