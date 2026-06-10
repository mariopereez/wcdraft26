const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Insert the translations script tag before app.js
if (!html.includes('js/translations.js')) {
  html = html.replace('<script src="/app.js?v=3"></script>', '<script src="js/translations.js"></script>\n<script src="/app.js?v=3"></script>');
}

// Nav
html = html.replace(/>Inicio</g, ' data-i18n="nav_home">Inicio<');
html = html.replace(/>Draft</g, ' data-i18n="nav_draft">Draft<');
html = html.replace(/>Partidos</g, ' data-i18n="nav_matches">Partidos<');
html = html.replace(/>Grupos</g, ' data-i18n="nav_groups">Grupos<');
html = html.replace(/>Clasificación</g, ' data-i18n="nav_table">Clasificación<');
html = html.replace(/>Predicciones</g, ' data-i18n="nav_predictions">Predicciones<');
html = html.replace(/>Yo</g, ' data-i18n="nav_me">Yo<');
html = html.replace(/>Reglas</g, ' data-i18n="nav_rules">Reglas<');
html = html.replace(/>⚙ Admin</g, ' data-i18n="nav_admin">⚙ Admin<');
html = html.replace(/>SUPER ADMIN</g, ' data-i18n="nav_admin_badge">SUPER ADMIN<');

// Auth
html = html.replace(/Crea tu torneo · Elige tus selecciones/g, '<span data-i18n="auth_sub\">Crea tu torneo · Elige tus selecciones</span>');
html = html.replace(/>Entrar</g, ' data-i18n="auth_login_tab">Entrar<');
html = html.replace(/>Registrarse</g, ' data-i18n="auth_register_tab">Registrarse<');
html = html.replace(/>Tu nombre en el torneo</g, ' data-i18n="auth_name">Tu nombre en el torneo<');
html = html.replace(/>Repetir contraseña</g, ' data-i18n="auth_repeat">Repetir contraseña<');
html = html.replace(/>Crear cuenta</g, ' data-i18n="auth_register_btn">Crear cuenta<');
html = html.replace(/¿Olvidaste la contraseña\? <span>Recupérala<\/span>/g, '<span data-i18n="auth_forgot">¿Olvidaste la contraseña? <span>Recupérala</span></span>');

// Lobby
html = html.replace(/>Hola</g, ' data-i18n="lobby_welcome">Hola<');
html = html.replace(/>Gestiona tus torneos de Draft 2026</g, ' data-i18n="lobby_sub">Gestiona tus torneos de Draft 2026<');
html = html.replace(/>Crear torneo</g, ' data-i18n="lobby_create_btn">Crear torneo<');
html = html.replace(/>Nuevo grupo de amigos</g, ' data-i18n="lobby_create_desc">Nuevo grupo de amigos<');
html = html.replace(/>Unirse</g, ' data-i18n="lobby_join_btn">Unirse<');
html = html.replace(/>Entra con código de invitación</g, ' data-i18n="lobby_join_desc">Entra con código de invitación<');
html = html.replace(/>Nombre del torneo</g, ' data-i18n="lobby_name_label">Nombre del torneo<');
html = html.replace(/>Número de jugadores \(2-16\)</g, ' data-i18n="lobby_players_label">Número de jugadores (2-16)<');
html = html.replace(/>Selecciones por jugador</g, ' data-i18n="lobby_picks_label">Selecciones por jugador<');
html = html.replace(/>3 selecciones</g, ' data-i18n="lobby_picks_3">3 selecciones<');
html = html.replace(/>4 selecciones</g, ' data-i18n="lobby_picks_4">4 selecciones<');
html = html.replace(/>5 selecciones</g, ' data-i18n="lobby_picks_5">5 selecciones<');
html = html.replace(/>6 selecciones \(recomendado\)</g, ' data-i18n="lobby_picks_6">6 selecciones (recomendado)<');
html = html.replace(/>Cancelar</g, ' data-i18n="lobby_cancel">Cancelar<');
html = html.replace(/>Código de invitación \(6 letras\)</g, ' data-i18n="lobby_code_label">Código de invitación (6 letras)<');
html = html.replace(/>Unirse al torneo</g, ' data-i18n="lobby_join_submit">Unirse al torneo<');
html = html.replace(/>Mis torneos</g, ' data-i18n="lobby_my_tournaments">Mis torneos<');
html = html.replace(/>Ver demo</g, ' data-i18n="lobby_demo_btn">Ver demo<');
html = html.replace(/>Explora la app con datos de ejemplo</g, ' data-i18n="lobby_demo_desc">Explora la app con datos de ejemplo<');
html = html.replace(/>Cerrar sesión</g, ' data-i18n="lobby_logout">Cerrar sesión<');

// Sala
html = html.replace(/>SALA DE ESPERA</g, ' data-i18n="sala_title">SALA DE ESPERA<');
html = html.replace(/>Comparte el código con tus amigos:</g, ' data-i18n="sala_code_label">Comparte el código con tus amigos:<');
html = html.replace(/>Jugadores</g, ' data-i18n="sala_players_label">Jugadores<');
html = html.replace(/>Esperando jugadores…</g, ' data-i18n="sala_status_waiting">Esperando jugadores…<');
html = html.replace(/>Iniciar Draft</g, ' data-i18n="draft_start_btn">Iniciar Draft<');
html = html.replace(/>Eliminar torneo</g, ' data-i18n="sala_delete_btn">Eliminar torneo<');
html = html.replace(/>Volver a mis torneos</g, ' data-i18n="sala_back_btn">Volver a mis torneos<');

// Nickname
html = html.replace(/>Cambiar apodo</g, ' data-i18n="nick_title">Cambiar apodo<');
html = html.replace(/>Nuevo apodo</g, ' data-i18n="nick_label">Nuevo apodo<');
html = html.replace(/>El apodo no afecta a torneos ya iniciados.</g, ' data-i18n="nick_note">El apodo no afecta a torneos ya iniciados.<');
html = html.replace(/>Guardar</g, ' data-i18n="nick_save">Guardar<');

// Home
html = html.replace(/>Partido<\/span> del día</g, ' data-i18n="home_hot_accent">Partido</span> <span data-i18n="home_hot_title">del día</span><');
html = html.replace(/>Próximos<\/span> de tus equipos</g, ' data-i18n="home_my_accent">Próximos</span> <span data-i18n="home_my_title">de tus equipos</span><');
html = html.replace(/>Partidos<\/span></g, ' data-i18n="home_all_accent">Partidos</span><');

fs.writeFileSync('index.html', html);

// Prepare PWA version
let pwaHtml = html;
pwaHtml = pwaHtml.replace(/href="css\/main\.css"/g, 'href="/css/main.css"');
pwaHtml = pwaHtml.replace(/src="\/app\.js\?v=3"/g, 'src="js/app.js"');
pwaHtml = pwaHtml.replace(/href="manifest\.json"/g, 'href="/manifest.json"');
pwaHtml = pwaHtml.replace(/href="icons\//g, 'href="/icons/');

fs.writeFileSync('draft2026/index.html', pwaHtml);
console.log('HTML files localized successfully.');
