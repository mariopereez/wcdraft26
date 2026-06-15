const fs = require('fs');

const jsFiles = ['app.js', 'draft2026/js/app.js'];
jsFiles.forEach(f => {
  if(!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');

  // Margins
  code = code.replace(
    /margin-top:2\.5rem; margin-bottom:2rem/g,
    'margin-top:1.5rem; margin-bottom:1.5rem'
  );

  // Title size
  code = code.replace(
    /<div style="font-family:'Bebas Neue';font-size:1\.4rem;color:var\(--gold\);/g,
    '<div style="font-family:\\\'Bebas Neue\\\';font-size:1.2rem;color:var(--gold);'
  );

  // Input size
  code = code.replace(
    /style="width:45px;height:45px;text-align:center;font-family:'Bebas Neue';font-size:1\.5rem;/g,
    'style="width:40px;height:40px;text-align:center;font-family:\\\'Bebas Neue\\\';font-size:1.3rem;'
  );

  fs.writeFileSync(f, code);
});

// Increment sw.js again
const swFiles = ['sw.js', 'draft2026/sw.js'];
swFiles.forEach(f => {
  if(!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');
  code = code.replace(/draft2026-v4/g, 'draft2026-v5');
  fs.writeFileSync(f, code);
});

console.log('Visual tweaks applied.');
