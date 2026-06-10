const fs = require('fs');

const blockEs = `
    yo_change_nick: "Cambiar apodo",
    yo_my_tournaments: "Mis torneos",
    yo_logout: "Cerrar sesión",
    yo_notifications: "Notificaciones",
    yo_notif_blocked: "Notificaciones bloqueadas",
    yo_notif_blocked_desc: "Has desactivado las notificaciones para esta web. Habilítalas en la configuración de tu navegador o dispositivo para no perderte nada.",
    yo_notif_unsupported: "Tu navegador o dispositivo no soporta notificaciones push en este momento. Si estás en iOS, asegúrate de añadir la web a tu pantalla de inicio.",
    yo_notif_enable: "Habilitar notificaciones",
    yo_notif_disabled: "Notificaciones desactivadas",
    yo_app_title: "App",
    yo_app_mobile: "Móvil",
    yo_app_installed: "App instalada correctamente",
    yo_app_installed_desc: "Gracias por usar la app nativa.",
    yo_app_install_title: "Instala la App Oficial",
    yo_app_install_desc1: "Mejora tu experiencia añadiendo Draft 2026 a tu pantalla de inicio. Funcionará a pantalla completa y más rápido.",
    yo_app_install_btn: "🚀 Instalar App",
    yo_app_install_desc2: "Para una experiencia óptima a pantalla completa:",
    yo_app_install_step1: "Pulsa el botón de <b>Compartir</b> de tu navegador:",
    yo_app_install_step2: "En el menú, baja y pulsa:<br><b style=\\"color:var(--white)\\">\\"Añadir a pantalla de inicio\\"</b> ➕",
    yo_app_install_desc3: "Para mejor experiencia, abre esta web en tu navegador móvil (Chrome/Safari) e instálala en la pantalla de inicio.",
    yo_card: "🃏 Tarjeta",
`;

const blockEn = `
    yo_change_nick: "Change nickname",
    yo_my_tournaments: "My tournaments",
    yo_logout: "Log out",
    yo_notifications: "Notifications",
    yo_notif_blocked: "Notifications blocked",
    yo_notif_blocked_desc: "You have disabled notifications for this site. Enable them in your browser or device settings so you don't miss anything.",
    yo_notif_unsupported: "Your browser or device does not support push notifications at this time. If you are on iOS, make sure to add the web to your home screen.",
    yo_notif_enable: "Enable notifications",
    yo_notif_disabled: "Notifications disabled",
    yo_app_title: "App",
    yo_app_mobile: "Mobile",
    yo_app_installed: "App installed successfully",
    yo_app_installed_desc: "Thanks for using the native app.",
    yo_app_install_title: "Install the Official App",
    yo_app_install_desc1: "Improve your experience by adding Draft 2026 to your home screen. It will run full screen and faster.",
    yo_app_install_btn: "🚀 Install App",
    yo_app_install_desc2: "For an optimal full-screen experience:",
    yo_app_install_step1: "Tap your browser\\'s <b>Share</b> button:",
    yo_app_install_step2: "In the menu, scroll down and tap:<br><b style=\\"color:var(--white)\\">\\"Add to Home Screen\\"</b> ➕",
    yo_app_install_desc3: "For the best experience, open this web in your mobile browser (Chrome/Safari) and install it on the home screen.",
    yo_card: "🃏 Card",
`;

// 1. Update translations.js
let trans = fs.readFileSync('js/translations.js', 'utf8');
trans = trans.replace(/nav_home: "Inicio",/g, blockEs + ' nav_home: "Inicio",');
trans = trans.replace(/nav_home: "Home",/g, blockEn + ' nav_home: "Home",');
fs.writeFileSync('js/translations.js', trans);
fs.writeFileSync('draft2026/js/translations.js', trans);

// 2. Update app.js
const jsFiles = ['app.js', 'draft2026/js/app.js'];
jsFiles.forEach(f => {
  if (!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');

  // Fix draft no picks quotes issue
  code = code.replace(
    /innerHTML='<div style="color:var\(--muted\);font-size:\.82rem;text-align:center;padding:1\.5rem">\$\{window\.tr\("draft_no_picks"\)\}<\/div>';/g,
    'innerHTML=`<div style="color:var(--muted);font-size:.82rem;text-align:center;padding:1.5rem">${window.tr("draft_no_picks")}</div>`;'
  );

  // Profile actions
  code = code.replace(/Cambiar apodo/g, '${window.tr("yo_change_nick")}');
  code = code.replace(/>Cerrar sesión</g, '>${window.tr("yo_logout")}<');
  code = code.replace(/Mis torneos/g, '${window.tr("yo_my_tournaments")}');
  code = code.replace(/🃏 Tarjeta/g, '${window.tr("yo_card")}');

  // Notifications
  code = code.replace(/>Notificaciones</g, '>${window.tr("yo_notifications")}<');
  code = code.replace(/Notificaciones bloqueadas/g, '${window.tr("yo_notif_blocked")}');
  code = code.replace(/Has desactivado las notificaciones para esta web\. Habilítalas en la configuración de tu navegador o dispositivo para no perderte nada\./g, '${window.tr("yo_notif_blocked_desc")}');
  code = code.replace(/Tu navegador o dispositivo no soporta notificaciones push en este momento\. Si estás en iOS, asegúrate de añadir la web a tu pantalla de inicio\./g, '${window.tr("yo_notif_unsupported")}');
  code = code.replace(/Habilitar notificaciones/g, '${window.tr("yo_notif_enable")}');
  code = code.replace(/Notificaciones desactivadas/g, '${window.tr("yo_notif_disabled")}');

  // Mobile App
  code = code.replace(/App<\/span> Móvil/g, '${window.tr("yo_app_title")}</span> ${window.tr("yo_app_mobile")}');
  code = code.replace(/App instalada correctamente/g, '${window.tr("yo_app_installed")}');
  code = code.replace(/Gracias por usar la app nativa\./g, '${window.tr("yo_app_installed_desc")}');
  code = code.replace(/Instala la App Oficial/g, '${window.tr("yo_app_install_title")}');
  code = code.replace(/Mejora tu experiencia añadiendo Draft 2026 a tu pantalla de inicio\. Funcionará a pantalla completa y más rápido\./g, '${window.tr("yo_app_install_desc1")}');
  code = code.replace(/🚀 Instalar App/g, '${window.tr("yo_app_install_btn")}');
  code = code.replace(/Para una experiencia óptima a pantalla completa:/g, '${window.tr("yo_app_install_desc2")}');
  code = code.replace(/Pulsa el botón de <b>Compartir<\/b> de tu navegador:/g, '${window.tr("yo_app_install_step1")}');
  code = code.replace(/En el menú, baja y pulsa:<br><b style="color:var\(--white\)">"Añadir a pantalla de inicio"<\/b> ➕/g, '${window.tr("yo_app_install_step2")}');
  code = code.replace(/Para mejor experiencia, abre esta web en tu navegador móvil \(Chrome\/Safari\) e instálala en la pantalla de inicio\./g, '${window.tr("yo_app_install_desc3")}');

  fs.writeFileSync(f, code);
});

console.log('Fixed Yo tab translations and draft log syntax issue.');
