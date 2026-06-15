const fs = require('fs');

const jsFiles = ['app.js', 'draft2026/js/app.js'];

jsFiles.forEach(file => {
  if(!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  // Regex to remove the errant line
  code = code.replace(/}\)\.join\(''\)}<\/div>`;\r?\n?/g, '');

  fs.writeFileSync(file, code);
  console.log('Regex fix applied to ' + file);
});
