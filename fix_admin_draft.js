const fs = require('fs');

const blockEs = `
    draft_start_btn: "Iniciar draft",
    draft_restart_btn: "Reiniciar",
    draft_random_btn: "Aleatorio",
    draft_test_exit: "Salir test",
    draft_test: "Test",
    draft_confirm_restart: "¿Reiniciar draft? Se borran todas las elecciones.",
    draft_confirm_random: "¿Asignación aleatoria?",
    draft_status_not_started: "Draft no iniciado",
    draft_completed_excl: "¡DRAFT COMPLETADO!",
    draft_admin_title: "⚙️ Admin",
`;

const blockEn = `
    draft_start_btn: "Start Draft",
    draft_restart_btn: "Restart",
    draft_random_btn: "Random Assign",
    draft_test_exit: "Exit Test",
    draft_test: "Test",
    draft_confirm_restart: "Restart draft? All picks will be deleted.",
    draft_confirm_random: "Random assignment?",
    draft_status_not_started: "Draft not started",
    draft_completed_excl: "DRAFT COMPLETED!",
    draft_admin_title: "⚙️ Admin",
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

  // Fix broken syntax in renderSala/renderDraft
  code = code.replace(/\'\$\{window\.tr\(\"draft_admin_start\"\)\}\'/g, 'window.tr("draft_admin_start")');
  code = code.replace(/\'\$\{window\.tr\(\"draft_wait_admin\"\)\}\'/g, 'window.tr("draft_wait_admin")');

  // Admin buttons in renderDraft
  code = code.replace(/🎲 Iniciar draft/g, '🎲 ${window.tr("draft_start_btn")}');
  code = code.replace(/🔄 Reiniciar/g, '🔄 ${window.tr("draft_restart_btn")}');
  code = code.replace(/🎲 Aleatorio/g, '🎲 ${window.tr("draft_random_btn")}');
  code = code.replace(/Salir test/g, '${window.tr("draft_test_exit")}');
  code = code.replace(/'Test'/g, 'window.tr("draft_test")');
  code = code.replace(/>Test</g, '>${window.tr("draft_test")}<');

  code = code.replace(/⚙️ Admin ·/g, '${window.tr("draft_admin_title")} ·');

  // Confirms
  code = code.replace(/'¿Reiniciar draft\? Se borran todas las elecciones\.'/g, 'window.tr("draft_confirm_restart")');
  code = code.replace(/'¿Asignación aleatoria\?'/g, 'window.tr("draft_confirm_random")');
  
  // Completed Draft text
  code = code.replace(/¡DRAFT COMPLETADO!/g, '${window.tr("draft_completed_excl")}');

  fs.writeFileSync(f, code);
});

// 3. Update index.html
const htmlFiles = ['index.html', 'draft2026/index.html'];
htmlFiles.forEach(f => {
  if (!fs.existsSync(f)) return;
  let html = fs.readFileSync(f, 'utf8');
  
  html = html.replace(/<div class="draft-picks-title">Elecciones por jugador<\/div>/g, '<div class="draft-picks-title" data-i18n="draft_picks_log">Elecciones por jugador</div>');

  fs.writeFileSync(f, html);
});

console.log('Admin draft elements and broken string fixed.');
