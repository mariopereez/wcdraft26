// ═══════════════════════════════════════════════════════
//  Draft 2026 — Service Worker
//  Estrategia: Cache-First para shell estático,
//  Network-First para Firebase y Football API.
// ═══════════════════════════════════════════════════════

const CACHE_NAME = 'draft2026-v18';

// Recursos del shell que se cachean en la instalación
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/css/main.css',
  '/js/app.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// ── INSTALL: precachear el shell ──────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(SHELL_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: limpiar caches viejos ──────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH ─────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // No interceptar requests de Firebase, Football API, ni Google Fonts
  if (
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('firebase') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('api.football-data.org') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('gstatic.com')
  ) {
    return; // dejar pasar sin cachear
  }

  // Navegación (HTML), Scripts (JS) y Estilos (CSS) → Network-First
  const isDocOrCode = event.request.mode === 'navigate' ||
                      event.request.destination === 'script' ||
                      event.request.destination === 'style' ||
                      url.pathname.endsWith('.js') ||
                      url.pathname.endsWith('.css');

  if (isDocOrCode) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok && url.origin === self.location.origin) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then(cached => {
            if (cached) return cached;
            if (event.request.mode === 'navigate') return caches.match('/index.html');
          });
        })
    );
    return;
  }

  // Otros assets (imágenes, iconos, etc.) → Cache-First
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
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

// ── PUSH NOTIFICATIONS ─────────────────────────────────
self.addEventListener('push', event => {
  let data = { title: 'Mundial Draft 2026', body: '¡Nuevo evento en tu liga!' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Mundial Draft 2026', body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});

