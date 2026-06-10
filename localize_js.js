const fs = require('fs');

const localBlock = `
// ── LOCALIZATION (i18n) ────────────────────────────────────
let currentLang = localStorage.getItem('app_lang') || (navigator.language.startsWith('es') ? 'es' : 'en');
if (!window.translations) window.translations = { es: {}, en: {} };

window.tr = function(key) {
  const langDict = window.translations[currentLang] || window.translations['es'];
  return langDict[key] || window.translations['es'][key] || key;
};

window.updateLanguageUI = function() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.innerHTML = window.tr(el.getAttribute('data-i18n'));
  });
};

window.setLanguage = function(lang) {
  currentLang = lang;
  localStorage.setItem('app_lang', lang);
  updateLanguageUI();
  if (typeof renderYo === 'function') renderYo();
  if (typeof currentPartidaId !== 'undefined' && currentPartidaId && typeof renderDraft === 'function' && typeof renderSala === 'function') {
    if (draftState.phase === 'active' || draftState.phase === 'complete') renderDraft();
    else if (draftState.phase === 'pending') renderSala();
  }
};
`;

const selectHtml = `
<div class="section-title"><span class="accent" data-i18n="yo_acc_accent">\${window.tr('yo_acc_accent')}</span> <span data-i18n="yo_acc_title">\${window.tr('yo_acc_title')}</span></div>
<div style="background:var(--surface);border:1px solid var(--border);border-radius:13px;overflow:hidden;margin-bottom:1.5rem">
  <div style="display:flex;align-items:center;gap:.8rem;padding:.85rem 1rem;border-bottom:1px solid rgba(42,54,80,.4);">
    <span style="font-size:1.2rem">🌐</span>
    <span style="font-family:'Barlow Condensed';font-size:.88rem;font-weight:700;flex:1" data-i18n="profile_language_title">\${window.tr('profile_language_title')}</span>
    <select onchange="window.setLanguage(this.value)" style="background:rgba(255,255,255,.05);color:var(--white);border:1px solid var(--border);border-radius:6px;padding:.3rem .5rem;font-family:'Barlow Condensed';font-size:.85rem;cursor:pointer">
      <option value="es" \${currentLang === 'es' ? 'selected' : ''}>Español</option>
      <option value="en" \${currentLang === 'en' ? 'selected' : ''}>English</option>
    </select>
  </div>`;

const files = ['app.js', 'draft2026/js/app.js'];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');

  // Insert localization block
  if (!code.includes('window.tr = function(key)')) {
    code = code.replace('let deferredPrompt = null;', localBlock + '\nlet deferredPrompt = null;');
  }

  // Hook to DOMContentLoaded
  code = code.replace("document.addEventListener('DOMContentLoaded', () => { startCountdown(); });", "document.addEventListener('DOMContentLoaded', () => { window.updateLanguageUI(); startCountdown(); });");

  // Draft texts
  code = code.replace(/'✨ ¡ES TU TURNO!'/g, "window.tr('draft_your_turn')");
  code = code.replace(/'Turno actual'/g, "window.tr('draft_current_turn')");
  code = code.replace(/'Esperando su elección…'/g, "window.tr('draft_waiting_pick')");
  code = code.replace(/'¡DRAFT COMPLETADO!'/g, "window.tr('draft_completed_excl')");
  code = code.replace(/'Draft no iniciado'/g, "window.tr('draft_status_not_started')");
  code = code.replace(/>Completado</g, ">${window.tr('draft_status_completed')}<");
  code = code.replace(/>Disponible</g, ">${window.tr('available_label')}<");

  // Country dynamic renders (we use window.tr to avoid t shadowing)
  code = code.replace(/<span class="sim-team-name">\$\{t\}<\/span>/g, '<span class="sim-team-name">${window.tr(\'country_\' + t)}</span>');
  code = code.replace(/<div class="yo-eq-name">\$\{t\}<\/div>/g, '<div class="yo-eq-name">${window.tr(\'country_\' + t)}</div>');
  code = code.replace(/<div class="draft-avail-name">\$\{c\}<\/div>/g, '<div class="draft-avail-name">${window.tr(\'country_\' + c)}</div>');
  code = code.replace(/\{o\.player\} → \$\{team!==\'—\'\?flagImg\(team\)\+\' \':\'\'\} \$\{team\}/g, '{o.player} → ${team!==\'—\'?flagImg(team)+\' \':\'\'} ${team!==\'—\'?window.tr(\'country_\'+team):\'\'}');
  
  // Insert <select> into Yo tab
  code = code.replace(/<div class="section-title"><span class="accent">Mi<\/span> cuenta<\/div>\s*<div style="background:var\(--surface\);border:1px solid var\(--border\);border-radius:13px;overflow:hidden;margin-bottom:1\.5rem">/g, selectHtml);

  fs.writeFileSync(f, code);
});
console.log('JS files localized successfully.');
