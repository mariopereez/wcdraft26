const fs = require('fs');

const localBlock = `
    home_your_pos: "Tu Posición",
    home_pts_diff: "A {diff} pts de {name}",
    draft_ronda: "RONDA {round}",
    draft_pts: "pts",
    draft_alive: "Sigue vivo",
    draft_with_pts: "Con puntos",
    tip_1: "Consejo: Las selecciones favoritas suman muchos puntos en eliminatorias, pero ¡cuidado con las sorpresas!",
    tip_2: "Consejo: ¿Sabías que el tercer puesto también otorga puntos extra? Asegúrate de animar a tus selecciones.",
    match_status_fin: "FINAL",
    match_status_live: "EN JUEGO",
    res_tab_dates: "Fechas",
    stage_groups: "Fase de Grupos",
    stage_r32: "Dieciseisavos de Final",
    stage_r16: "Octavos de Final",
    stage_r8: "Cuartos de Final",
    stage_semi: "Semifinales",
    stage_third: "Tercer Puesto",
    stage_final: "Gran Final",
    res_btn_simulate: "Simular",
`;

const localBlockEn = `
    home_your_pos: "Your Rank",
    home_pts_diff: "{diff} pts away from {name}",
    draft_ronda: "ROUND {round}",
    draft_pts: "pts",
    draft_alive: "Still alive",
    draft_with_pts: "With points",
    tip_1: "Tip: Favorites score a lot of points in knockouts, but watch out for upsets!",
    tip_2: "Tip: Did you know third place also awards extra points? Keep cheering for your teams.",
    match_status_fin: "FULL TIME",
    match_status_live: "LIVE",
    res_tab_dates: "Dates",
    stage_groups: "Group Stage",
    stage_r32: "Round of 32",
    stage_r16: "Round of 16",
    stage_r8: "Quarter-Finals",
    stage_semi: "Semi-Finals",
    stage_third: "Third Place Play-off",
    stage_final: "Grand Final",
    res_btn_simulate: "Simulate",
`;

let trans = fs.readFileSync('js/translations.js', 'utf8');
trans = trans.replace(/nav_home: "Inicio",/g, localBlock + ' nav_home: "Inicio",');
trans = trans.replace(/nav_home: "Home",/g, localBlockEn + ' nav_home: "Home",');
fs.writeFileSync('js/translations.js', trans);
fs.writeFileSync('draft2026/js/translations.js', trans);

const files = ['app.js', 'draft2026/js/app.js'];
files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');

  // Home missing keys
  code = code.replace(/<div class="msc-label">Tu Posición<\/div>/g, '<div class="msc-label">${window.tr("home_your_pos")}</div>');
  code = code.replace(/A \$\{diff\} pts de \$\{nextPlayer\.name\}/g, '${window.tr("home_pts_diff").replace("{diff}", diff).replace("{name}", nextPlayer.name)}');
  code = code.replace(/RONDA \$\{o\.round\+1\}/g, '${window.tr("draft_ronda").replace("{round}", o.round+1)}');
  code = code.replace(/<div style="font-size:\.58rem;color:var\(--muted\);font-family:Barlow Condensed">pts<\/div>/g, '<div style="font-size:.58rem;color:var(--muted);font-family:Barlow Condensed">${window.tr("draft_pts")}</div>');
  code = code.replace(/>Sigue vivo</g, '>${window.tr("draft_alive")}<');
  code = code.replace(/>Con puntos</g, '>${window.tr("draft_with_pts")}<');
  code = code.replace(/"Consejo: Las selecciones favoritas suman muchos puntos en eliminatorias, pero ¡cuidado con las sorpresas!"/g, 'window.tr("tip_1")');
  code = code.replace(/"Consejo: ¿Sabías que el tercer puesto también otorga puntos extra\? Asegúrate de animar a tus selecciones\."/g, 'window.tr("tip_2")');
  code = code.replace(/<span class="accent">Próximos<\/span> de tus equipos/g, '<span class="accent">${window.tr("home_my_accent")}</span> ${window.tr("home_my_title")}');

  // Match renders
  code = code.replace(/<div class="tm-name">\$\{m\.l\}<\/div>/g, '<div class="tm-name">${window.tr("country_" + m.l)}</div>');
  code = code.replace(/<div class="tm-name">\$\{m\.v\}<\/div>/g, '<div class="tm-name">${window.tr("country_" + m.v)}</div>');
  code = code.replace(/<span class="res-match-team">\$\{m\.l\}<\/span>/g, '<span class="res-match-team">${window.tr("country_" + m.l)}</span>');
  code = code.replace(/<span class="res-match-team">\$\{m\.v\}<\/span>/g, '<span class="res-match-team">${window.tr("country_" + m.v)}</span>');
  
  // Results tabs & filters
  code = code.replace(/>Fechas</g, '>${window.tr("res_tab_dates")}<');
  code = code.replace(/>EN JUEGO</g, '>${window.tr("match_status_live")}<');
  code = code.replace(/>FINAL</g, '>${window.tr("match_status_fin")}<');

  // Group names and Stages
  code = code.replace(/Fase de Grupos/g, '${window.tr("stage_groups")}');
  code = code.replace(/Octavos de Final/g, '${window.tr("stage_r16")}');
  code = code.replace(/Cuartos de Final/g, '${window.tr("stage_r8")}');
  code = code.replace(/Semifinales/g, '${window.tr("stage_semi")}');
  code = code.replace(/Tercer Puesto/g, '${window.tr("stage_third")}');
  code = code.replace(/Gran Final/g, '${window.tr("stage_final")}');

  fs.writeFileSync(f, code);
});
console.log('Successfully injected additional dynamic translations.');
