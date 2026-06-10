const fs = require('fs');

const blockEs = `
    draft_pending_title: "Draft pendiente",
    draft_wait_admin: "Esperando al admin...",
    draft_admin_start: "Inicia el draft cuando todos estén listos",
    draft_share_link: "Compartir enlace de invitación",
    draft_no_picks: "Sin elecciones aún",
    draft_pending_pick: "pendiente",
    draft_wait_pick: "Esperando su elección...",
    draft_confirm_btn: "Confirmar selección",
    draft_your_turn: "✨ ¡ES TU TURNO!",
    draft_current_turn: "Turno actual",
    draft_search_placeholder: "🔍 Buscar selección...",
    lobby_players: "jugadores",
    lobby_picks: "selecciones",
    lobby_code_label: "Código",
`;
const blockEn = `
    draft_pending_title: "Draft Pending",
    draft_wait_admin: "Waiting for admin...",
    draft_admin_start: "Start draft when everyone is ready",
    draft_share_link: "Share invite link",
    draft_no_picks: "No picks yet",
    draft_pending_pick: "pending",
    draft_wait_pick: "Waiting for pick...",
    draft_confirm_btn: "Confirm Pick",
    draft_your_turn: "✨ YOUR TURN!",
    draft_current_turn: "Current Turn",
    draft_search_placeholder: "🔍 Search team...",
    lobby_players: "players",
    lobby_picks: "picks",
    lobby_code_label: "Code",
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

  // Draft pending strings
  code = code.replace(/Draft pendiente/g, '${window.tr("draft_pending_title")}');
  code = code.replace(/Esperando al admin…/g, '${window.tr("draft_wait_admin")}');
  code = code.replace(/Inicia el draft cuando todos estén listos/g, '${window.tr("draft_admin_start")}');
  code = code.replace(/Compartir enlace de invitación/g, '${window.tr("draft_share_link")}');
  code = code.replace(/Sin elecciones aún/g, '${window.tr("draft_no_picks")}');
  
  // Draft active strings
  code = code.replace(/\$\{flagImg\(tp\)\} \$\{tp\}/g, '${flagImg(tp)} ${window.tr("country_" + tp)}');
  code = code.replace(/<div style="font-size:\.58rem;color:var\(--muted2\)">pendiente<\/div>/g, '<div style="font-size:.58rem;color:var(--muted2)">${window.tr("draft_pending_pick")}</div>');
  code = code.replace(/Esperando su elección…/g, '${window.tr("draft_wait_pick")}');
  code = code.replace(/Confirmar selección/g, '${window.tr("draft_confirm_btn")}');
  code = code.replace(/✨ ¡ES TU TURNO!/g, '${window.tr("draft_your_turn")}');
  code = code.replace(/Turno actual/g, '${window.tr("draft_current_turn")}');
  
  // Search dropdown countries
  code = code.replace(/\$\{flagImg\(t\)\} \$\{t\}/g, '${flagImg(t)} ${window.tr("country_" + t)}');
  code = code.replace(/\$\{flagImg\(team,'md'\)\} \$\{team\}/g, '${flagImg(team,\'md\')} ${window.tr("country_" + team)}');
  code = code.replace(/🔍 Buscar selección…/g, '${window.tr("draft_search_placeholder")}');
  
  // Lobby strings
  code = code.replace(/jugadores ·/g, '${window.tr("lobby_players")} ·');
  code = code.replace(/\$\{config\.maxJugadores\} jugadores/g, '${config.maxJugadores} ${window.tr("lobby_players")}');
  code = code.replace(/selecciones<\/div><\/div>/g, '${window.tr("lobby_picks")}</div></div>');
  code = code.replace(/Código:/g, '${window.tr("lobby_code_label")}:');

  fs.writeFileSync(f, code);
});

console.log('Draft and Lobby localized successfully.');
