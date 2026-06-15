const fs = require('fs');

// 1. Fix translations.js
const transFiles = ['js/translations.js', 'draft2026/js/translations.js'];
transFiles.forEach(f => {
  if(!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');

  // We need to carefully target the English section which starts with `en: {`
  const enStart = code.indexOf('en: {');
  if (enStart !== -1) {
    let enSection = code.substring(enStart);
    
    enSection = enSection.replace(/yo_teams_none:\s*"No tienes selecciones asignadas aún"/g, 'yo_teams_none: "You don\'t have any teams yet"');
    enSection = enSection.replace(/yo_no_elim_progress:\s*"Sin progreso eliminatorio aún"/g, 'yo_no_elim_progress: "No elimination progress yet"');
    enSection = enSection.replace(/yo_rivals:\s*"Rivales"/g, 'yo_rivals: "Rivals"');
    enSection = enSection.replace(/yo_active_settings:\s*"Ajustes activos:"/g, 'yo_active_settings: "Active settings:"');
    enSection = enSection.replace(/yo_stats_grp:\s*"Grupos"/g, 'yo_stats_grp: "Groups"');
    
    // Inject the SIM labels into EN
    if(!enSection.includes('sim_none:')) {
      enSection = enSection.replace(
        /yo_stats_elim: "Elim",?/g, 
        'yo_stats_elim: "Elim",\n    sim_none: "No advance", sim_r16: "R32", sim_r8: "R16", sim_r4: "Quarter finals", sim_semi: "Semi finals", sim_final: "Finalist", sim_winner: "🥇 Winner",'
      );
    }
    
    code = code.substring(0, enStart) + enSection;
  }
  
  // Inject the SIM labels into ES
  const esStart = code.indexOf('es: {');
  if (esStart !== -1 && !code.substring(esStart, enStart).includes('sim_none:')) {
    let esSection = code.substring(esStart, enStart);
    esSection = esSection.replace(
      /yo_stats_elim: "Elim",?/g, 
      'yo_stats_elim: "Elim",\n    sim_none: "Sin avance", sim_r16: "16avos", sim_r8: "Octavos", sim_r4: "Cuartos", sim_semi: "Semis", sim_final: "Finalista", sim_winner: "🥇 Campeón",'
    );
    code = code.substring(0, esStart) + esSection + code.substring(enStart);
  }

  fs.writeFileSync(f, code);
});

// 2. Fix app.js SIM_STAGES
const jsFiles = ['app.js', 'draft2026/js/app.js'];
jsFiles.forEach(f => {
  if(!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');

  const oldSim = "const SIM_STAGES = [{value:'none',label:'Sin avance'},{value:'r16',label:'16avos (5 pts)'},{value:'r8',label:'Octavos (+8)'},{value:'r4',label:'Cuartos (+10)'},{value:'semi',label:'Semis (+11)'},{value:'final',label:'Finalista (+12)'},{value:'ganador',label:'🥇 Campeón (+10)'}];";
  const newSim = `const SIM_STAGES = [
  {value:'none',label:window.tr('sim_none')||'No advance'},
  {value:'r16',label:(window.tr('sim_r16')||'R32')+' (5 pts)'},
  {value:'r8',label:(window.tr('sim_r8')||'R16')+' (+8)'},
  {value:'r4',label:(window.tr('sim_r4')||'Quarter finals')+' (+10)'},
  {value:'semi',label:(window.tr('sim_semi')||'Semi finals')+' (+11)'},
  {value:'final',label:(window.tr('sim_final')||'Finalist')+' (+12)'},
  {value:'ganador',label:(window.tr('sim_winner')||'🥇 Winner')+' (+10)'}
];`;

  code = code.replace(oldSim, newSim);

  fs.writeFileSync(f, code);
});

console.log('Final translations applied successfully.');
