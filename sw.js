// ═══════════════════════════════════════════════════════
//  Draft 2026 — Service Worker
//  Soporte offline básico + cache de assets estáticos
// ═══════════════════════════════════════════════════════

const CACHE_NAME = 'draft2026-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/main.css',
  '/app.js',
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  // Fuentes de Google (se cachean en runtime)
];

// ── INSTALL: cachear assets estáticos ──────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: limpiar caches antiguas ──────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH: Network-first para Firebase/API, Cache-first para estáticos ──
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Firebase, APIs externas y fonts → siempre red (no cachear en SW)
  if (
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('gstatic.com') ||
    url.hostname.includes('football-data.org') ||
    url.hostname.includes('flagcdn.com') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  ) {
    // Para fonts de Google, intentar red y cachear el resultado
    if (url.hostname.includes('fonts.gstatic.com') || url.hostname.includes('fonts.googleapis.com')) {
      event.respondWith(
        caches.open('google-fonts-v1').then(cache =>
          cache.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(response => {
              cache.put(event.request, response.clone());
              return response;
            }).catch(() => cached);
          })
        )
      );
    }
    // El resto de APIs: pasar directo a la red
    return;
  }

  // Navegación (HTML) → Network-first con fallback a cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Assets estáticos (CSS, JS, imágenes) → Cache-first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Solo cachear respuestas válidas de nuestro propio origen
        if (response.ok && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Si es una imagen y no hay cache, devolver SVG placeholder
        if (event.request.destination === 'image') {
          return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="32"><rect width="48" height="32" fill="#1a2235"/></svg>',
            { headers: { 'Content-Type': 'image/svg+xml' } }
          );
        }
      });
    })
  );
});
