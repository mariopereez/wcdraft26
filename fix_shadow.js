const fs = require('fs');
const files = ['app.js', 'draft2026/js/app.js'];
files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');
  code = code.replace(/t\('country_'/g, "window.t('country_'");
  fs.writeFileSync(f, code);
});
console.log('Fixed variable shadowing in map loops.');
