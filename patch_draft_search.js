const fs = require('fs');

const jsFiles = ['app.js', 'draft2026/js/app.js'];

jsFiles.forEach(file => {
  if(!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  // Find the exact line and remove .slice(0,15)
  if(code.includes('filtered.slice(0,15).map(')) {
    code = code.replace('filtered.slice(0,15).map(', 'filtered.map(');
    fs.writeFileSync(file, code);
    console.log('Removed slice(0,15) from ' + file);
  }
});

// Cache Busting
const swFiles = ['sw.js', 'draft2026/sw.js'];
swFiles.forEach(f => {
  if(!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');
  code = code.replace(/draft2026-v16/g, 'draft2026-v17');
  fs.writeFileSync(f, code);
});
