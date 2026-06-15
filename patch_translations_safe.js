const fs = require('fs');

const transFiles = ['js/translations.js', 'draft2026/js/translations.js'];
transFiles.forEach(f => {
  if(!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');

  // We split by 'en: {' to isolate the English section
  let parts = code.split('en: {');
  if (parts.length === 2) {
    let esPart = parts[0];
    let enPart = parts[1];

    // Fix English
    enPart = enPart.replace(/yo_teams_none:\s*"No tienes selecciones asignadas aún"/g, 'yo_teams_none: "You don\'t have any teams yet"');
    enPart = enPart.replace(/yo_no_elim_progress:\s*"Sin progreso eliminatorio aún"/g, 'yo_no_elim_progress: "No elimination progress yet"');
    enPart = enPart.replace(/yo_rivals:\s*"Rivales"/g, 'yo_rivals: "Rivals"');
    enPart = enPart.replace(/yo_active_settings:\s*"Ajustes activos:"/g, 'yo_active_settings: "Active settings:"');
    enPart = enPart.replace(/yo_stats_grp:\s*"Grupos"/g, 'yo_stats_grp: "Groups"');
    
    // English SIM
    enPart = enPart.replace(
      /sim_none: "Sin avance", sim_r16: "16avos", sim_r8: "Octavos", sim_r4: "Cuartos", sim_semi: "Semis", sim_final: "Finalista", sim_winner: "🥇 Campeón"/g,
      'sim_none: "No advance", sim_r16: "R32", sim_r8: "R16", sim_r4: "Quarter finals", sim_semi: "Semi finals", sim_final: "Finalist", sim_winner: "🥇 Winner"'
    );
    
    // Reconstruct
    code = esPart + 'en: {' + enPart;
    fs.writeFileSync(f, code);
  }
});

console.log('Safe translation patch completed.');
