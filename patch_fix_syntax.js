const fs = require('fs');

const jsFiles = ['app.js', 'draft2026/js/app.js'];

jsFiles.forEach(file => {
  if(!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  // Fix the syntax error by removing the leftover line
  code = code.replace("}).join('')}</div>`;\n", "");

  fs.writeFileSync(file, code);
  console.log('Fixed syntax error in ' + file);
});
