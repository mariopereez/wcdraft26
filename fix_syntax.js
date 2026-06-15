const fs = require('fs');

const jsFiles = ['app.js', 'draft2026/js/app.js'];
jsFiles.forEach(f => {
  if(!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');

  // Fix the syntax error caused by single quotes
  code = code.replace(
    /'<div style="font-size:\.7rem;color:var\(--muted2\);margin-top:\.4rem;font-family:Barlow Condensed">\$\{window\.tr\('yo_no_elim_progress'\)\|\|'No elimination progress yet'\}<\/div>'/g,
    "'<div style=\"font-size:.7rem;color:var(--muted2);margin-top:.4rem;font-family:Barlow Condensed\">' + (window.tr('yo_no_elim_progress')||'No elimination progress yet') + '</div>'"
  );

  fs.writeFileSync(f, code);
});

console.log('Syntax error fixed.');
