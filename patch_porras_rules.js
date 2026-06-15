const fs = require('fs');

// 1. Translations
const transFiles = ['js/translations.js', 'draft2026/js/translations.js'];
transFiles.forEach(f => {
  if(fs.existsSync(f)) {
    let t = fs.readFileSync(f, 'utf8');
    t = t.replace(
      /porra_desc: "Acierta el resultado exacto y suma \+2 puntos, o acierta la tendencia por \+0\.5 puntos\.",/g,
      'porra_desc: "Acierta el resultado exacto de este partido destacado y suma +2 puntos extra en la clasificación general.",'
    );
    t = t.replace(
      /porra_desc: "Guess the exact score for \+2 points, or the correct trend for \+0\.5 points\.",/g,
      'porra_desc: "Guess the exact score of this featured match and earn +2 extra points in the general standings.",'
    );
    
    // Add new translations
    if(!t.includes('porra_confirm:')) {
      t = t.replace(/porra_pts_label: "Porras",/g, 'porra_pts_label: "Porras",\n    porra_confirm: "¿Estás seguro? Solo puedes guardar la predicción una vez y no podrás modificarla.",\n    porra_done: "Predicción Registrada",');
      t = t.replace(/porra_pts_label: "Preds",/g, 'porra_pts_label: "Preds",\n    porra_confirm: "Are you sure? You can only save the prediction once and cannot change it later.",\n    porra_done: "Prediction Saved",');
    }
    fs.writeFileSync(f, t);
  }
});

// 2. app.js
const jsFiles = ['app.js', 'draft2026/js/app.js'];
jsFiles.forEach(f => {
  if(!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');

  // a. Update renderSuperAdminPorraHtml to sort matches
  const saOld = `  matches.forEach(m => {
    const hName`;
  const saNew = `  const sortedMatches = [...matches].sort((a,b) => {
    const dA = a.utcDate ? new Date(a.utcDate).getTime() : 0;
    const dB = b.utcDate ? new Date(b.utcDate).getTime() : 0;
    if (dA === dB) return String(a.id).localeCompare(String(b.id));
    return dA - dB;
  });
  sortedMatches.forEach(m => {
    const hName`;
  if(code.includes(saOld) && !code.includes('const sortedMatches = [...matches].sort')) {
    code = code.replace(saOld, saNew);
  }

  // b. Update savePrediccion for confirm
  const spOld = `if(isNaN(h) || isNaN(a)) { alert(window.tr('porra_invalid')); return; }`;
  const spNew = `if(isNaN(h) || isNaN(a)) { alert(window.tr('porra_invalid')); return; }
  
  const msg = window.tr ? window.tr('porra_confirm') : '¿Estás seguro? Solo puedes guardar la predicción una vez.';
  if(!confirm(msg)) return;`;
  if(code.includes(spOld) && !code.includes('if(!confirm(msg))')) {
    code = code.replace(spOld, spNew);
  }

  // c. Update renderPorraCardHtml for lock logic
  const lockOld1 = `const isClosed = m.status === 'IN_PLAY' || m.status === 'PAUSED' || m.status === 'FINISHED';`;
  const lockNew1 = `const isTimeClosed = m.status === 'IN_PLAY' || m.status === 'PAUSED' || m.status === 'FINISHED';`;
  code = code.replace(lockOld1, lockNew1);

  const lockOld2 = `const hVal = userPred ? userPred.h : '';`;
  const lockNew2 = `const isClosed = isTimeClosed || !!userPred;
  const hVal = userPred ? userPred.h : '';`;
  if(!code.includes('const isClosed = isTimeClosed || !!userPred;')) {
    code = code.replace(lockOld2, lockNew2);
  }

  const btnOld = `\${isClosed ? 
      \`<div style="text-align:center;font-family:'Barlow Condensed';font-weight:700;color:var(--muted)">\${window.tr("porra_closed")}</div>\` : 
      \`<button class="btn btn-gold" style="width:100%" onclick="window.savePrediccion('\${m.id}')">\${window.tr("porra_save")}</button>\`
    }`;
  
  const btnNew = `\${isTimeClosed ? 
      \`<div style="text-align:center;font-family:'Barlow Condensed';font-weight:700;color:var(--muted);background:rgba(255,255,255,0.05);padding:.8rem;border-radius:8px">\${window.tr("porra_closed")}</div>\` : 
      (userPred ? 
        \`<div style="text-align:center;font-family:'Barlow Condensed';font-weight:700;color:var(--cyan);background:rgba(0, 255, 255, 0.05);padding:.8rem;border-radius:8px;border:1px solid rgba(0, 255, 255, 0.2)">✓ \${window.tr("porra_done")}</div>\` :
        \`<button class="btn btn-gold" style="width:100%" onclick="window.savePrediccion('\${m.id}')">\${window.tr("porra_save")}</button>\`
      )
    }`;

  if(code.includes('isClosed ?') && !code.includes('isTimeClosed ?')) {
    // Replace the old block. Note: we need to use a regex because the formatting might vary slightly.
    code = code.replace(/\$\{isClosed \?[\s\S]*?<\/button>`\n\s*\}/, btnNew);
  }

  fs.writeFileSync(f, code);
});

console.log('Patch completed.');
