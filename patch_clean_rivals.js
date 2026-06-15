const fs = require('fs');

const jsFiles = ['app.js', 'draft2026/js/app.js'];

jsFiles.forEach(file => {
  if(!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  const lines = code.split('\n');
  const newLines = [];
  let found = false;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('yo_rivals') && lines[i].includes('rival-card')) {
      // This is the line to remove.
      // We will replace it with just `;` to close the preceding template literal, 
      // but wait, let's see if the line itself contains the opening or if it just appends.
      // It's part of `yoHtml += ` or just `yoHtml` string from before?
      // Looking closely at line 2144, it is part of `document.getElementById('yo-wrap').innerHTML = ...`
      // So replacing it with just `;` will close the string.
      newLines.push('`;');
      found = true;
    } else {
      newLines.push(lines[i]);
    }
  }

  if (found) {
    fs.writeFileSync(file, newLines.join('\n'));
    console.log('Removed Mis Rivales cleanly from ' + file);
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
