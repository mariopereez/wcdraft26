const fs = require('fs');

const localBlock = `
    lang_alert: "El idioma ha cambiado. Recargando la página...",
    yo_hero_change_pic: "📷 Cambiar foto",
    yo_stats_total: "Puntos totales",
    yo_sim_title: "🔮 ¿Qué puedes ganar aún?",
    yo_sim_desc: "Simula hasta dónde llegan tus equipos",
    yo_teams_accent: "Mis",
    yo_teams_title: "Selecciones",
    install_app: "Instalar App",
`;

const localBlockEn = `
    lang_alert: "Language changed. Reloading page...",
    yo_hero_change_pic: "📷 Change photo",
    yo_stats_total: "Total points",
    yo_sim_title: "🔮 What can you still earn?",
    yo_sim_desc: "Simulate how far your teams will advance",
    yo_teams_accent: "My",
    yo_teams_title: "Teams",
    install_app: "Install App",
`;

// 1. Update translations.js
let trans = fs.readFileSync('js/translations.js', 'utf8');
trans = trans.replace(/nav_home: "Inicio",/g, localBlock + ' nav_home: "Inicio",');
trans = trans.replace(/nav_home: "Home",/g, localBlockEn + ' nav_home: "Home",');
fs.writeFileSync('js/translations.js', trans);
fs.writeFileSync('draft2026/js/translations.js', trans);

// 2. Update app.js 
const files = ['app.js', 'draft2026/js/app.js'];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');

  // Dates formatting
  code = code.replace(/toLocaleDateString\('es-ES'/g, "toLocaleDateString(currentLang === 'en' ? 'en-US' : 'es-ES'");
  code = code.replace(/toLocaleString\('es-ES'\)/g, "toLocaleString(currentLang === 'en' ? 'en-US' : 'es-ES')");

  // Reload on language change
  if (code.includes('window.setLanguage = function(lang) {') && !code.includes('lang_alert')) {
    code = code.replace(
      /window\.setLanguage = function\(lang\) \{([\s\S]*?)\};/,
      `window.setLanguage = function(lang) {
        currentLang = lang;
        localStorage.setItem('app_lang', lang);
        alert(window.tr('lang_alert'));
        location.reload();
      };`
    );
  }

  // Admin last update text
  code = code.replace(/'🕓 Última actualización: '/g, "(currentLang==='en'?'🕓 Last update: ':'🕓 Última actualización: ')");
  code = code.replace(/' por '/g, "(currentLang==='en'?' by ':' por ')");
  code = code.replace(/'Sin actualizar aún'/g, "(currentLang==='en'?'Not updated yet':'Sin actualizar aún')");

  // Yo Tab fixes
  code = code.replace(/📷 Cambiar foto/g, '${window.tr("yo_hero_change_pic")}');
  code = code.replace(/Puntos totales/g, '${window.tr("yo_stats_total")}');
  code = code.replace(/🔮 ¿Qué puedes ganar aún\?/g, '${window.tr("yo_sim_title")}');
  code = code.replace(/Simula hasta dónde llegan tus equipos/g, '${window.tr("yo_sim_desc")}');
  code = code.replace(/<span class="accent">Mis<\/span> Selecciones/g, '<span class="accent">${window.tr("yo_teams_accent")}</span> ${window.tr("yo_teams_title")}');
  code = code.replace(/>Instalar App</g, '>${window.tr("install_app")}<');
  code = code.replace(/>Instalar App 📱</g, '>${window.tr("install_app")} 📱<');

  // Any remaining generic PWA strings
  code = code.replace(/Tu dispositivo no admite la instalación/g, '${window.tr("app_not_installed_other")}');

  // Draft text fixes (if missed)
  // "Selecciones disponibles"
  code = code.replace(/>Selecciones disponibles</g, '>${window.tr("draft_avail")}<');
  code = code.replace(/>Elecciones por jugador</g, '>${window.tr("draft_picks_log")}<');
  code = code.replace(/>Historial<\/span> del Draft/g, '>${window.tr("draft_timeline_accent")}</span> ${window.tr("draft_timeline_title")}');
  
  // Any "Pick" literals that might be missed
  // The prefix is draft_pick_prefix
  code = code.replace(/Pick \$\{/g, '${window.tr("draft_pick_prefix")} ${');

  // Write changes
  fs.writeFileSync(f, code);
});

console.log('Final missing strings have been updated and date formatting applied.');
