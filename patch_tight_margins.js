const fs = require('fs');

// 1. Fix index.html margins
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace('<div id="home-podium-wrap" style="margin-bottom:0.8rem; margin-top:0.5rem"></div>', '<div id="home-podium-wrap" style="margin-bottom:0.4rem; margin-top:0.2rem"></div>');
html = html.replace('<div id="home-my-status-wrap" style="margin-bottom:0.8rem"></div>', '<div id="home-my-status-wrap" style="margin-bottom:0.4rem"></div>');
html = html.replace('<div id="home-match-day-wrap" style="margin-bottom:0.8rem"></div>', '<div id="home-match-day-wrap" style="margin-bottom:0.4rem"></div>');
html = html.replace('<div id="home-hot-matches-wrap" style="margin-bottom:0.8rem">', '<div id="home-hot-matches-wrap" style="margin-bottom:0.4rem">');
fs.writeFileSync('index.html', html);

// 2. Fix app.js margins
const jsFiles = ['app.js', 'draft2026/js/app.js'];
jsFiles.forEach(file => {
  if(!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  // Podium Card inner margins
  code = code.replace(
    'let combinedHtml = `<div style="background:var(--surf2); border:1px solid var(--border); border-radius:14px; box-shadow:0 4px 12px rgba(0,0,0,0.1); margin-top:0.5rem">`;',
    'let combinedHtml = `<div style="background:var(--surf2); border:1px solid var(--border); border-radius:14px; box-shadow:0 4px 12px rgba(0,0,0,0.1); margin-top:0.2rem">`;'
  );

  // Gap Pill margin
  code = code.replace(
    'margin-top:0.6rem"><div style="display:inline-block; background:rgba(230,57,70,0.1);',
    'margin-top:0.3rem"><div style="display:inline-block; background:rgba(230,57,70,0.1);'
  );
  code = code.replace(
    'margin-top:0.6rem"><div style="display:inline-block; background:rgba(46,196,182,0.1);',
    'margin-top:0.3rem"><div style="display:inline-block; background:rgba(46,196,182,0.1);'
  );

  // Divider margin in unified card
  code = code.replace(
    '<div style="height:1px; background:var(--border); margin:0 1.5rem"></div>',
    '<div style="height:1px; background:var(--border); margin:0 1.2rem"></div>'
  );
  
  // Padding of status part
  code = code.replace(
    '<div style="padding:1.2rem 1rem; display:flex;',
    '<div style="padding:0.8rem 1rem; display:flex;'
  );

  // Porra Card padding (reduce internal whitespace to make it look tighter)
  code = code.replace(
    'padding:1.5rem 1.2rem; margin:0; box-shadow:0 4px 12px rgba(0,0,0,0.15)">',
    'padding:1rem 1rem; margin:0; box-shadow:0 4px 12px rgba(0,0,0,0.15)">'
  );

  fs.writeFileSync(file, code);
});

// Cache Busting
const swFiles = ['sw.js', 'draft2026/sw.js'];
swFiles.forEach(f => {
  if(!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');
  code = code.replace(/draft2026-v14/g, 'draft2026-v15');
  fs.writeFileSync(f, code);
});

console.log('Mobile margins tightened.');
