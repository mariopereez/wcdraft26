const fs = require('fs');

const missingFuncs = `
window.renderSuperAdminPorraHtml = function() {
  if (typeof matches === 'undefined' || !matches || !matches.length) return '';
  const currentVal = window._globalPorraMatchId || '';
  
  let html = \`<div style="background:linear-gradient(to right, #2a3650, #151d2f); border:1px solid var(--gold); border-radius:12px; padding:1.2rem; margin-bottom:1.5rem">
    <div style="font-family:'Bebas Neue'; color:var(--gold); font-size:1.4rem; margin-bottom:.5rem">👑 CONTROL SUPER-ADMIN: PORRA DEL DÍA</div>
    <div style="font-size:.8rem; color:var(--muted); font-family:'Barlow Condensed'; margin-bottom:1rem">Este partido se fijará como la predicción diaria para TODAS las ligas. Si no eliges ninguno, el sistema usará la lógica automática.</div>
    <div style="display:flex; gap:.5rem">
      <select id="super-admin-porra-select" style="flex:1; background:var(--surf2); color:var(--white); border:1px solid var(--border); border-radius:8px; padding:.5rem; font-family:'Barlow Condensed'">
        <option value="">-- Automático --</option>\`;
        
  matches.forEach(m => {
    const hName = typeof nameES !== 'undefined' ? nameES(m.homeTeam?.name||'') : m.homeTeam?.name;
    const aName = typeof nameES !== 'undefined' ? nameES(m.awayTeam?.name||'') : m.awayTeam?.name;
    const h = window.tr("country_" + hName) || hName;
    const a = window.tr("country_" + aName) || aName;
    const dStr = m.utcDate ? new Date(m.utcDate).toLocaleDateString() : 'Sin Fecha';
    html += \`<option value="\${m.id}" \${currentVal === String(m.id) ? 'selected' : ''}>\${dStr} | \${h} vs \${a} (\${m.status})</option>\`;
  });
  
  html += \`</select>
      <button class="btn btn-gold" onclick="window.saveSuperAdminPorra()">FIJAR PARTIDO</button>
    </div>
  </div>\`;
  return html;
};

window.saveSuperAdminPorra = async function() {
  const val = document.getElementById('super-admin-porra-select').value;
  try {
    await window._setDoc(window._doc(window._db, 'cache', 'porra'), { matchId: val, updatedAt: Date.now() }, { merge: true });
    alert('Partido fijado correctamente para todas las ligas.');
  } catch(e) { alert('Error: ' + e.message); }
};
`;

const jsFiles = ['app.js', 'draft2026/js/app.js'];
jsFiles.forEach(f => {
  if(!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');
  if (!code.includes('window.saveSuperAdminPorra = async function() {')) {
    code += missingFuncs;
    fs.writeFileSync(f, code);
  }
});

console.log('Fixed missing functions.');
