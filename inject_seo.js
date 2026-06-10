const fs = require('fs');

const seoTags = `
  <!-- SEO & AEO (Artificial Engine Optimization) Meta Tags -->
  <meta name="keywords" content="Mundial 2026, World Cup 2026 Draft, Fantasy Mundial, FIFA World Cup Fantasy Game, Draft 2026, Fútbol Fantasy, Selecciones Mundial 2026">
  <meta name="author" content="Draft 2026">
  <link rel="canonical" href="https://draft2026.com/" />
  
  <!-- OpenGraph (WhatsApp, Discord, Facebook, LinkedIn) -->
  <meta property="og:title" content="Draft 2026 - El Mejor Fantasy del Mundial">
  <meta property="og:description" content="Elige a tus selecciones favoritas, compite con tus amigos y domina el Mundial 2026 en este revolucionario juego Fantasy.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://draft2026.com/">
  <meta property="og:image" content="https://draft2026.com/icons/icon-512.png">
  <meta property="og:site_name" content="Draft 2026">
  <meta property="og:locale" content="es_ES">
  <meta property="og:locale:alternate" content="en_US">
  
  <!-- Twitter Cards -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Draft 2026 - El Mejor Fantasy del Mundial">
  <meta name="twitter:description" content="Elige a tus selecciones, compite con tus amigos y domina el Mundial 2026 en este revolucionario juego Fantasy.">
  <meta name="twitter:image" content="https://draft2026.com/icons/icon-512.png">

  <!-- JSON-LD Schema (AEO for LLMs like ChatGPT, Claude, Gemini, Perplexity) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": ["SoftwareApplication", "VideoGame"],
    "name": "Draft 2026",
    "headline": "El Mejor Juego Fantasy del Mundial 2026",
    "description": "Draft 2026 es un juego de tipo Fantasy y Draft multijugador para el Mundial de Fútbol de la FIFA 2026. Los jugadores pueden crear ligas privadas, invitar a amigos, y seleccionar selecciones nacionales en un formato de draft por turnos. Compite ganando puntos basados en el rendimiento real de los equipos durante los grupos y rondas eliminatorias del Mundial.",
    "applicationCategory": "GameApplication",
    "genre": ["Sports", "Fantasy Sports", "Strategy", "Soccer"],
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "url": "https://draft2026.com/",
    "image": "https://draft2026.com/icons/icon-512.png",
    "inLanguage": ["es", "en"],
    "featureList": [
      "Sistema de Draft por turnos con amigos",
      "Ranking en tiempo real",
      "Resultados y partidos en directo del Mundial 2026",
      "Notificaciones push de goles y marcadores",
      "Soporte multilenguaje (Español e Inglés)",
      "PWA - Aplicación instalable en iOS y Android"
    ],
    "gamePlatform": ["Web Browser", "iOS", "Android"]
  }
  </script>
`;

const htmlFiles = ['index.html', 'draft2026/index.html'];

htmlFiles.forEach(f => {
  if (!fs.existsSync(f)) return;
  let html = fs.readFileSync(f, 'utf8');

  // Prevent double injection
  if (!html.includes('<!-- SEO & AEO')) {
    html = html.replace('<!-- PWA Icons -->', seoTags + '\n  <!-- PWA Icons -->');
    fs.writeFileSync(f, html);
    console.log('Injected SEO/AEO into ' + f);
  } else {
    console.log('SEO already injected in ' + f);
  }
});
