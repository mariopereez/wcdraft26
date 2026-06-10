const fs = require('fs');

const blockEs = `
    home_hot_accent: "Partidos",
    home_hot_title: "Calientes",
    home_hot_none: "Sin partidos calientes disponibles",
    country_TBD: "TBD",
    yo_notif_config: "Configurar alertas y avisos",
    yo_notif_prompt_desc: "Mantente al día de tu liga: Recibe alertas al instante cuando haya goles, cambios en el podio o cierren las jornadas.",
    yo_notif_prompt_btn: "🔔 Habilitar alertas",
    yo_notif_opt1_title: "⚽ Goles y Marcadores",
    yo_notif_opt1_desc: "Alertas en tiempo real de goles y resultados de tus equipos.",
    yo_notif_opt2_title: "🏆 Cambios en la Clasificación",
    yo_notif_opt2_desc: "Avisos cuando subas o bajes de posición en la tabla.",
    yo_notif_opt3_title: "⏰ Recordatorios de Jornada",
    yo_notif_opt3_desc: "Avisos antes del inicio de los partidos de tus equipos.",
    yo_notif_unsupported_title: "No soportado",
    yo_no_teams: "No tienes selecciones asignadas aún",
`;

const blockEn = `
    home_hot_accent: "Hot",
    home_hot_title: "Matches",
    home_hot_none: "No hot matches available",
    country_TBD: "TBD",
    yo_notif_config: "Configure alerts and notifications",
    yo_notif_prompt_desc: "Stay up to date with your league: Receive instant alerts when there are goals, podium changes or matchdays close.",
    yo_notif_prompt_btn: "🔔 Enable alerts",
    yo_notif_opt1_title: "⚽ Goals and Scores",
    yo_notif_opt1_desc: "Real-time alerts for goals and results of your teams.",
    yo_notif_opt2_title: "🏆 Standings Changes",
    yo_notif_opt2_desc: "Alerts when you move up or down the table.",
    yo_notif_opt3_title: "⏰ Matchday Reminders",
    yo_notif_opt3_desc: "Alerts before the start of your teams' matches.",
    yo_notif_unsupported_title: "Unsupported",
    yo_no_teams: "You do not have any teams assigned yet",
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

  // "No tienes selecciones asignadas aún" in Yo tab
  code = code.replace(/No tienes selecciones asignadas aún/g, '${window.tr("yo_no_teams")}');

  // "Partidos calientes" 
  code = code.replace(/sectionLabel = `<span class="accent">Partidos<\/span> Calientes`;/g, 'sectionLabel = `<span class="accent">${window.tr("home_hot_accent")}</span> ${window.tr("home_hot_title")}`;');
  code = code.replace(/Sin partidos calientes disponibles/g, '${window.tr("home_hot_none")}');
  code = code.replace(/>🔥 \$\{stN\[m\.stage\]\|\|'Partido'\}<\/div>/g, '>🔥 ${stN[m.stage]||window.tr("match_default_label")}</div>');

  // Replace missing 'Grupos' map inside renderTodosMatches
  code = code.replace(
    /const stN=\{'FINAL':'🏆 Final','THIRD_PLACE':'🥉 3er','SEMI_FINALS':'Semis','QUARTER_FINALS':'Cuartos','LAST_16':'Octavos','LAST_32':'Dieciseisavos','GROUP_STAGE':'Grupos'\};/g,
    "const stN={'FINAL':'🏆 '+window.tr('stage_final'),'THIRD_PLACE':'🥉 '+window.tr('stage_third'),'SEMI_FINALS':window.tr('stage_semi'),'QUARTER_FINALS':window.tr('stage_r8'),'LAST_16':window.tr('stage_r16'),'LAST_32':window.tr('stage_r32'),'GROUP_STAGE':window.tr('stage_groups')};"
  );

  // Translate Notifications block
  code = code.replace(/Configurar alertas y avisos/g, '${window.tr("yo_notif_config")}');
  code = code.replace(/Mantente al día de tu liga: Recibe alertas al instante cuando haya goles, cambios en el podio o cierren las jornadas\./g, '${window.tr("yo_notif_prompt_desc")}');
  code = code.replace(/🔔 Habilitar alertas/g, '${window.tr("yo_notif_prompt_btn")}');
  code = code.replace(/⚽ Goles y Marcadores/g, '${window.tr("yo_notif_opt1_title")}');
  code = code.replace(/Alertas en tiempo real de goles y resultados de tus equipos\./g, '${window.tr("yo_notif_opt1_desc")}');
  code = code.replace(/🏆 Cambios en la Clasificación/g, '${window.tr("yo_notif_opt2_title")}');
  code = code.replace(/Avisos cuando subas o bajes de posición en la tabla\./g, '${window.tr("yo_notif_opt2_desc")}');
  code = code.replace(/⏰ Recordatorios de Jornada/g, '${window.tr("yo_notif_opt3_title")}');
  code = code.replace(/Avisos antes del inicio de los partidos de tus equipos\./g, '${window.tr("yo_notif_opt3_desc")}');
  code = code.replace(/>No soportado</g, '>${window.tr("yo_notif_unsupported_title")}<');

  fs.writeFileSync(f, code);
});

console.log('Final missing strings localized.');
