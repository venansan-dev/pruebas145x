// ===== demo-sw.js =====================================================
// Service worker EXCLUSIVO de demo.html. Scope '/demo.html', cachés
// propias (demo-*) para no interferir con la app real (index.html / sw.js).
// Estrategia: navegación network-first (demo siempre fresco); tiles, imágenes
// y librerías cache-first para que la grabación vaya fluida.
const DEMO_HTML  = 'demo-html-v1';
const DEMO_TILE  = 'demo-tiles-v1';
const DEMO_IMG   = 'demo-imgs-v1';
const DEMO_LIB   = 'demo-libs-v1';

self.addEventListener('install', function(e){
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        // Solo borra cachés propias del demo; NUNCA las de la app (guia-*).
        if (k.indexOf('demo-') === 0 &&
            k !== DEMO_HTML && k !== DEMO_TILE && k !== DEMO_IMG && k !== DEMO_LIB) {
          return caches.delete(k);
        }
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  var url = e.request.url;

  // Tiles OSM → cache-first
  if (url.includes('tile.openstreetmap.org')) {
    e.respondWith(caches.open(DEMO_TILE).then(function(c){
      return c.match(e.request).then(function(hit){
        if (hit) return hit;
        return fetch(e.request).then(function(res){
          if (res && res.status === 200) c.put(e.request, res.clone());
          return res;
        }).catch(function(){ return new Response('', {status:503}); });
      });
    }));
    return;
  }

  // Imágenes postimg → cache-first
  if (url.includes('postimg.cc') || url.includes('postimg.io')) {
    e.respondWith(caches.open(DEMO_IMG).then(function(c){
      return c.match(e.request).then(function(hit){
        if (hit) return hit;
        return fetch(e.request).then(function(res){
          if (res && res.status === 200) c.put(e.request, res.clone());
          return res;
        }).catch(function(){ return new Response('', {status:404}); });
      });
    }));
    return;
  }

  // Librerías externas (Leaflet, markercluster, Firebase, fuentes) → cache-first
  if (url.includes('unpkg.com') || url.includes('gstatic.com') || url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
    e.respondWith(caches.open(DEMO_LIB).then(function(c){
      return c.match(e.request).then(function(hit){
        if (hit) return hit;
        return fetch(e.request).then(function(res){
          if (res && res.status === 200) c.put(e.request, res.clone());
          return res;
        }).catch(function(){ return new Response('', {status:503}); });
      });
    }));
    return;
  }

  // Navegación / HTML del demo → network-first (siempre fresco)
  if (e.request.mode === 'navigate' || e.request.destination === 'document' || url.endsWith('/demo.html')) {
    e.respondWith(
      fetch(e.request).then(function(res){
        if (res && res.status === 200) {
          var copia = res.clone();
          caches.open(DEMO_HTML).then(function(c){ c.put(e.request, copia); });
        }
        return res;
      }).catch(function(){
        return caches.match(e.request, { ignoreSearch:true }).then(function(hit){
          return hit || caches.match('/demo.html', { ignoreSearch:true });
        });
      })
    );
    return;
  }

  // Resto → network-first, fallback caché
  e.respondWith(fetch(e.request).catch(function(){ return caches.match(e.request); }));
});
