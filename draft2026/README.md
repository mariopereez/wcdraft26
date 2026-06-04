# Football Draft 2026 — Despliegue en Netlify

## Estructura de archivos

```
draft2026/
├── index.html          ← App principal (corregido)
├── manifest.json       ← Config PWA
├── sw.js               ← Service Worker (cache + offline)
├── netlify.toml        ← Config Netlify (rutas + headers)
├── css/
│   └── main.css
├── js/
│   └── app.js
└── icons/
    ├── icon-192.png    ← Icono PWA
    └── icon-512.png    ← Icono PWA grande
```

## Cómo desplegar en Netlify

### Opción A — Drag & Drop (más fácil)
1. Ve a [app.netlify.com](https://app.netlify.com)
2. Inicia sesión o crea cuenta
3. En el dashboard, arrastra la **carpeta `draft2026/` entera** al área de deploy
4. En 30 segundos tendrás la URL para compartir con tus amigos

### Opción B — Git (recomendado para actualizaciones)
1. Sube los archivos a un repositorio GitHub
2. En Netlify → "Import from Git" → selecciona el repo
3. Build command: (dejar vacío)
4. Publish directory: `.`
5. Deploy site

## ¿Qué se arregló?

1. **Rutas absolutas** (`/css/main.css`, `/js/app.js`): en Netlify los paths
   relativos a veces fallan dependiendo de la URL. Ahora usan `/`.

2. **Loading screen**: el `display:none` inline impedía que el CSS lo mostrara.
   Ahora el CSS lo controla (por defecto `display:flex`).

3. **PWA completa**:
   - `manifest.json`: hace la app instalable en móvil
   - `sw.js`: permite uso offline básico y carga más rápida
   - Meta tags de iOS/Android para comportamiento nativo

4. **netlify.toml**:
   - Redirect `/*` → `index.html` (necesario para que Firebase Auth no dé 404)
   - Headers de caché optimizados (CSS/JS en caché larga, sw.js sin caché)
   - El service worker sin caché es crítico para que las actualizaciones lleguen

## Firebase — Dominios autorizados

En la consola de Firebase → Authentication → Settings → Authorized domains,
añade tu dominio de Netlify (ej: `tu-app.netlify.app`) para que el login funcione.

## Para instalar la PWA en móvil

- **Android (Chrome)**: aparecerá automáticamente el banner "Añadir a inicio"
- **iOS (Safari)**: botón Compartir → "Añadir a pantalla de inicio"
