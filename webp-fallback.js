// webp-fallback.js — Safari ≤13 (Catalina) no soporta WebP.
// Este script se ejecuta (defer) justo después de pois.js y antes de app.js.
// Detecta soporte WebP con canvas; si falla, reescribe las URLs en PUNTOS
// y en la tabla interna de imágenes de app.js antes de que se rendericen.
// En navegadores con soporte WebP el bloque completo se salta en <1 ms.

(function () {
  // Detección síncrona vía canvas (la más fiable, sin petición de red)
  function soportaWebP() {
    try {
      var c = document.createElement('canvas');
      c.width = 1; c.height = 1;
      return c.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    } catch (e) { return false; }
  }

  if (soportaWebP()) return; // La mayoría de usuarios: salir inmediatamente

  // Mapa webp → fallback jpg/png para todas las imágenes sustituidas
  var FALLBACK = {
    'https://i.postimg.cc/Kjb8LscZ/bembrive.webp':               'https://i.postimg.cc/rmV1NVKY/bembrive.jpg',
    'https://i.postimg.cc/zvNGWPz6/casaceta.webp':               'https://i.postimg.cc/VvhdYTFW/casaceta.jpg',
    'https://i.postimg.cc/L5S8f09r/concatedral.webp':            'https://i.postimg.cc/W3NGwNdL/concatedral.jpg',
    'https://i.postimg.cc/5yJ2vk9j/descrip.webp':               'https://i.postimg.cc/0NmcSJk6/descrip.png',
    'https://i.postimg.cc/nrxh7wVC/escudoamorcortes.webp':       'https://i.postimg.cc/yxxDCB0Z/escudoamorcortes.jpg',
    'https://i.postimg.cc/nzBLXtx8/fortalezacastro.webp':        'https://i.postimg.cc/Hnnr1HbB/fortalezacastro.jpg',
    'https://i.postimg.cc/rsTwWYVf/freixo.webp':                 'https://i.postimg.cc/7ZQcGRh2/freixo.jpg',
    'https://i.postimg.cc/T1x3mHdk/graffiticoia.webp':           'https://i.postimg.cc/D00S3F1Q/graffiticoia.jpg',
    'https://i.postimg.cc/J08zJd7W/iglesiabembrive.webp':        'https://i.postimg.cc/j22DYKyM/iglesiabembrive.jpg',
    'https://i.postimg.cc/qqrvnZBT/iglesiacastrelos.webp':       'https://i.postimg.cc/ZnG2R7cm/iglesiacastrelos.jpg',
    'https://i.postimg.cc/D0hwsYfv/iglesiateis.webp':            'https://i.postimg.cc/x88XVYL3/iglesiateis.jpg',
    'https://i.postimg.cc/RFK0WzBw/IMG-0229.webp':               'https://i.postimg.cc/1XdXBwx5/IMG-0229.jpg',
    'https://i.postimg.cc/1twz8ZQr/IMG-0859.webp':               'https://i.postimg.cc/85qh3dYg/IMG-0859.jpg',
    'https://i.postimg.cc/wvLB1dpf/IMG-1026.webp':               'https://i.postimg.cc/L5HDVXtt/IMG-1026.jpg',
    'https://i.postimg.cc/NMm0Kwc7/IMG-1120.webp':               'https://i.postimg.cc/RVZ22Wdx/IMG-1120.jpg',
    'https://i.postimg.cc/63nQ8NXh/IMG-1179.webp':               'https://i.postimg.cc/Hnnjb3Nk/IMG-1179.jpg',
    'https://i.postimg.cc/TwgPKX6N/IMG-2940.webp':               'https://i.postimg.cc/Xq5nND5x/IMG-2940.jpg',
    'https://i.postimg.cc/Bb3nDwZj/IMG-4705.webp':               'https://i.postimg.cc/JhxGVc20/IMG-4705.png',
    'https://i.postimg.cc/DZLzSKTR/IMG-E1212.webp':              'https://i.postimg.cc/qqFzkYGD/IMG-E1212.jpg',
    'https://i.postimg.cc/XqWYFDN4/laxe.webp':                   'https://i.postimg.cc/gJzVHzxW/laxe.jpg',
    'https://i.postimg.cc/vBfm4dsN/losaestrelladavid.webp':      'https://i.postimg.cc/6p1S2PqR/losaestrelladavid.jpg',
    'https://i.postimg.cc/Hnmk5PWk/olivo.webp':                  'https://i.postimg.cc/xThPVV4d/olivo.jpg',
    'https://i.postimg.cc/T1x3mHdB/santacristinalavadores.webp': 'https://i.postimg.cc/QCGTS8Fv/santacristinalavadores.jpg',
    'https://i.postimg.cc/brPwbFyF/santamariadeguizan.webp':     'https://i.postimg.cc/J0VkKrsg/santamariadeguizan.jpg',
    'https://i.postimg.cc/nr1c1YMZ/santiagodeparada.webp':       'https://i.postimg.cc/zBRhnbGj/santiagodeparada.jpg',
    'https://i.postimg.cc/RhmZfbSk/torrelavandeira.webp':        'https://i.postimg.cc/Ssz9W2Kq/torrelavandeira.jpg',
    'https://i.postimg.cc/kGCg8hM7/torrepadin.webp':             'https://i.postimg.cc/nzQmvjhN/torrepadin.jpg',
    'https://i.postimg.cc/prBXBYyr/real.webp':                   'https://i.postimg.cc/wTzh0rXs/Captura-de-pantalla-2026-05-31-a-las-14-09-56.png',
    'https://i.postimg.cc/tJzCzt7q/escudos.webp':                'https://i.postimg.cc/wB9NkRLk/Captura-de-pantalla-2026-05-31-a-las-14-14-50.png',
    'https://i.postimg.cc/90BFBtzW/bouzas.webp':                 'https://i.postimg.cc/sfSQF2nR/Captura-de-pantalla-2026-05-31-a-las-13-32-32.png',
    'https://i.postimg.cc/d39t9mDw/coiai.webp':                  'https://i.postimg.cc/QMTbR3vh/Captura-de-pantalla-2026-05-31-a-las-13-52-42.png'
  };

  function aplicarFallback(url) {
    return FALLBACK[url] || url;
  }

  // Parchear PUNTOS (pois.js ya ejecutado, app.js aún no)
  if (window.PUNTOS && Array.isArray(window.PUNTOS)) {
    window.PUNTOS.forEach(function (p) {
      if (p.imagen) p.imagen = aplicarFallback(p.imagen);
      if (p.imagen2) p.imagen2 = aplicarFallback(p.imagen2);
      if (p.icon) p.icon = aplicarFallback(p.icon);
    });
  }

  // Parchear GALERIA_IMGS (galería hero de escritorio, definida en app.js).
  // app.js es defer y se ejecuta después de este script, así que esperamos
  // a DOMContentLoaded para que ambos hayan corrido ya.
  document.addEventListener('DOMContentLoaded', function () {
    if (window.GALERIA_IMGS && Array.isArray(window.GALERIA_IMGS)) {
      window.GALERIA_IMGS.forEach(function (item) {
        if (item.src) item.src = aplicarFallback(item.src);
      });
    }
  });

  // Exponer el helper por si app.js lo necesita para URLs puntuales
  window._webpFallback = aplicarFallback;
})();
