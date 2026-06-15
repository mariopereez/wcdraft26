const fs = require('fs');

const jsFiles = ['app.js', 'draft2026/js/app.js'];

jsFiles.forEach(file => {
  if(!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  // We are looking for:
  // <div class="section-title"><span class="accent">${window.tr("yo_teams_accent")||"Mis"}</span> ${window.tr("yo_rivals")||"Rivales"}</div><div class="yo-rivals">...</div>`;
  // which precedes: const simWrap=document.getElementById('yo-sim-wrap');
  
  const startTarget = '<div class="section-title"><span class="accent">${window.tr("yo_teams_accent")||"Mis"}</span> ${window.tr("yo_rivals")||"Rivales"}</div><div class="yo-rivals">';
  const s1 = code.indexOf(startTarget);
  if (s1 > -1) {
    const s2 = code.indexOf('</div>`;', s1) + 8; // length of '</div>`;'
    if (s2 > s1 + 8) {
      code = code.substring(0, s1) + '`;\n' + code.substring(s2);
      fs.writeFileSync(file, code);
      console.log('Removed Mis Rivales from ' + file);
    }
  }
});

// Cache Busting
const swFiles = ['sw.js', 'draft2026/sw.js'];
swFiles.forEach(f => {
  if(!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');
  code = code.replace(/draft2026-v15/g, 'draft2026-v16');
  fs.writeFileSync(f, code);
});
