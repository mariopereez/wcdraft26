const fs = require('fs');

const jsFiles = ['app.js', 'draft2026/js/app.js'];
jsFiles.forEach(f => {
  if(!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');

  // a. Listener for global porra in enterApp
  if(!code.includes('window.unsubPorra')) {
    code = code.replace(
      /if\(window\.unsubPreds\)/,
      `if(window.unsubPorra) { window.unsubPorra(); window.unsubPorra = null; }
    window.unsubPorra = window._onSnapshot(window._doc(window._db, 'cache', 'porra'), snap => {
      if(snap.exists()) window._globalPorraMatchId = snap.data().matchId;
      else window._globalPorraMatchId = null;
      if (typeof getRanking === 'function') {
        try { renderHome(); renderYo(); renderClasificacion(); } catch(e){}
      }
    });
    if(window.unsubPreds)`
    );
  }

  // b. Modify calcP to remove +0.5 logic
  const oldCalcP = `const pdiff = pred.h - pred.a;
               const rdiff = rh - ra;
               if ((pdiff>0&&rdiff>0) || (pdiff<0&&rdiff<0) || (pdiff===0&&rdiff===0)) {
                 porras += 0.5;
               }`;
  code = code.replace(oldCalcP, `// Sólo puntos por resultado exacto (quitado +0.5)`);

  // c. Modify getPartidoDelDia to use override
  const oldGetPartido = `window.getPartidoDelDia = function() {
  if (typeof matches === 'undefined' || !matches) return null;
  const hoyMs`;
  const newGetPartido = `window.getPartidoDelDia = function() {
  if (typeof matches === 'undefined' || !matches) return null;
  if (window._globalPorraMatchId) {
    const override = matches.find(m => String(m.id) === String(window._globalPorraMatchId));
    if (override) return override;
  }
  const hoyMs`;
  if(!code.includes('if (window._globalPorraMatchId) {')) {
    code = code.replace(oldGetPartido, newGetPartido);
  }

  // d. Inject SuperAdmin HTML in renderAdminGroups and renderAdminKnockout
  const saInjection = `
  let superAdminHtml = '';
  if (isSuperAdmin() && typeof window.renderSuperAdminPorraHtml === 'function') {
    superAdminHtml = window.renderSuperAdminPorraHtml();
  }
  cont.innerHTML = superAdminHtml + html;`;
  
  if (!code.includes('superAdminHtml = window.renderSuperAdminPorraHtml()')) {
    code = code.replace(/cont\.innerHTML = html;/g, saInjection);
  }

  // e. Add Super Admin Functions and update Porra Card margin
  if (!code.includes('window.renderSuperAdminPorraHtml')) {
    code += `\n
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
    const h = window.tr("country_" + (m.homeTeam?.name||''));
    const a = window.tr("country_" + (m.awayTeam?.name||''));
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
  }

  // f. Increase spacing of the porra card (from margin-bottom:1.5rem to margin-top:2.5rem; margin-bottom:2rem)
  code = code.replace(
    /margin-bottom:1\.5rem">[\s\n]*<div style="font-family:'Bebas Neue';font-size:1\.4rem;color:var\(--gold\)/,
    'margin-top:2.5rem; margin-bottom:2rem">\n    <div style="font-family:\'Bebas Neue\';font-size:1.4rem;color:var(--gold)'
  );

  fs.writeFileSync(f, code);
});

console.log('Super Admin features inyectadas con éxito.');
