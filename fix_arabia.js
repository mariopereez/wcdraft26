const fs = require('fs');

// 1. Fix translations.js
let trans = fs.readFileSync('js/translations.js', 'utf8');
trans = trans.replace(/country_Arabia_Saudita/g, '"country_Arabia Saudita"');
fs.writeFileSync('js/translations.js', trans);
fs.writeFileSync('draft2026/js/translations.js', trans);

// 2. Fix app.js
const files = ['app.js', 'draft2026/js/app.js'];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');

  // a) "Partidos Calientes" (Home slider)
  // <div class="hmc-team-name">${hES}</div>
  code = code.replace(/<div class="hmc-team-name">\$\{hES\}<\/div>/g, '<div class="hmc-team-name">${window.tr("country_" + hES)}</div>');
  code = code.replace(/<div class="hmc-team-name">\$\{aES\}<\/div>/g, '<div class="hmc-team-name">${window.tr("country_" + aES)}</div>');

  // b) "Matches" general (renderMatchCard)
  // <span class="match-name">${h}
  code = code.replace(/<span class="match-name">\$\{h\}/g, '<span class="match-name">${window.tr("country_" + h)}');
  code = code.replace(/<span class="match-name away">\$\{a\}/g, '<span class="match-name away">${window.tr("country_" + a)}');
  
  // c) renderGrupos()
  code = code.replace(/<div class="gr-team-name">\$\{t\}<\/div>/g, '<div class="gr-team-name">${window.tr("country_" + t)}</div>');
  
  // d) Draft available selection (just in case)
  code = code.replace(/<div class="draft-avail-name">\$\{c\}<\/div>/g, '<div class="draft-avail-name">${window.tr("country_" + c)}</div>');

  fs.writeFileSync(f, code);
});

console.log('Fixes applied successfully.');
