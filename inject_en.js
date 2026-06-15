const fs = require('fs');

const transFiles = ['js/translations.js', 'draft2026/js/translations.js'];
transFiles.forEach(f => {
  if(!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');

  let parts = code.split('en: {');
  if (parts.length === 2) {
    let esPart = parts[0];
    let enPart = parts[1];

    if (!enPart.includes('yo_active_settings:')) {
      enPart = enPart.replace(
        /country_Alemania: "Germany",/g,
        'yo_no_elim_progress: "No elimination progress yet",\n    yo_rivals: "Rivals",\n    yo_active_settings: "Active settings:",\n    yo_stats_grp: "Groups",\n    yo_stats_elim: "Elim",\n    sim_none: "No advance", sim_r16: "R32", sim_r8: "R16", sim_r4: "Quarter finals", sim_semi: "Semi finals", sim_final: "Finalist", sim_winner: "🥇 Winner",\n    country_Alemania: "Germany",'
      );
    }
    
    code = esPart + 'en: {' + enPart;
    fs.writeFileSync(f, code);
  }
});

console.log('Injected missing EN translations.');
