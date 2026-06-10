const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const s = code.indexOf('window.updateLanguageUI');
const e = code.indexOf('};', s) + 2;

const newCode = `window.updateLanguageUI = function() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.innerHTML = window.tr(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = window.tr(el.getAttribute('data-i18n-placeholder'));
  });
};`;

code = code.substring(0, s) + newCode + code.substring(e);

fs.writeFileSync('app.js', code);
fs.writeFileSync('draft2026/js/app.js', code);
console.log('Placeholders officially patched.');
