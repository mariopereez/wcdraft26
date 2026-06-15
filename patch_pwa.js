const fs = require('fs');

const jsFiles = ['app.js', 'draft2026/js/app.js'];

jsFiles.forEach(file => {
  if(!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  // Replace PWA condition logic
  const oldLogicStart = code.indexOf('let pwaSection = \'\';');
  const oldLogicEnd = code.indexOf('cont.innerHTML=', oldLogicStart);

  if(oldLogicStart > -1 && oldLogicEnd > -1) {
    const newLogic = `let pwaSection = '';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (!isStandalone && isMobile) {
    if (deferredPrompt) {
      pwaSection = \`<div class="section-title" style="margin-top:1.5rem">📱 <span class="accent">\${window.tr("yo_app_title")}</span> \${window.tr("yo_app_mobile")}</div><div style="background:var(--surface);border:1px solid var(--border);border-radius:13px;padding:1rem;margin-bottom:1.5rem;display:flex;flex-direction:column;gap:.6rem"><div style="font-family:'Barlow Condensed';font-weight:700;font-size:1rem;color:var(--white)">\${window.tr("yo_app_install_title")}</div><div style="font-size:.85rem;color:var(--muted);line-height:1.4">\${window.tr("yo_app_install_desc1")}</div><button class="btn btn-gold btn-sm" onclick="doInstallApp()" style="margin-top:.4rem;padding:.6rem;font-size:1rem;font-family:'Bebas Neue';letter-spacing:1px">\${window.tr("yo_app_install_btn")}</button></div>\`;
    } else if (isIOS) {
      pwaSection = \`<div class="section-title" style="margin-top:1.5rem">📱 <span class="accent">\${window.tr("yo_app_title")}</span> \${window.tr("yo_app_mobile")}</div><div style="background:var(--surface);border:1px solid var(--border);border-radius:13px;padding:1rem;margin-bottom:1.5rem;display:flex;flex-direction:column;gap:.6rem"><div style="font-family:'Barlow Condensed';font-weight:700;font-size:1rem;color:var(--white)">\${window.tr("yo_app_install_title")}</div><div style="font-size:.85rem;color:var(--muted);line-height:1.4">\${window.tr("yo_app_install_desc2")}</div><div style="font-size:.85rem;color:var(--muted);line-height:1.4;background:rgba(255,255,255,0.05);padding:.8rem;border-radius:8px;display:flex;flex-direction:column;gap:.8rem"><div style="display:flex;gap:.5rem"><div style="font-weight:bold;color:var(--gold);font-family:'Bebas Neue';font-size:1.1rem">1.</div><div>\${window.tr("yo_app_install_step1")}<div style="font-size:.75rem;color:var(--muted2);margin-top:.3rem;line-height:1.5">• <b>Safari:</b> Abajo en el centro <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-bottom:2px"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg><br>• <b>Chrome:</b> Arriba a la derecha en el buscador</div></div></div><div style="display:flex;gap:.5rem"><div style="font-weight:bold;color:var(--gold);font-family:'Bebas Neue';font-size:1.1rem">2.</div><div>\${window.tr("yo_app_install_step2")}</div></div></div></div>\`;
    } else {
      pwaSection = \`<div class="section-title" style="margin-top:1.5rem">📱 <span class="accent">\${window.tr("yo_app_title")}</span> \${window.tr("yo_app_mobile")}</div><div style="background:var(--surface);border:1px solid var(--border);border-radius:13px;padding:1rem;margin-bottom:1.5rem"><div style="font-family:'Barlow Condensed';font-weight:700;font-size:1rem;color:var(--white)">\${window.tr("yo_app_install_title")}</div><div style="font-size:.85rem;color:var(--muted);line-height:1.4;margin-top:.4rem">\${window.tr("yo_app_install_desc3")}</div></div>\`;
    }
  }
  `;
    code = code.substring(0, oldLogicStart) + newLogic + code.substring(oldLogicEnd);
  }

  // Move pwaSection injection
  // Find where it's currently injected at the end
  code = code.replace("}</div>`${pwaSection}<!-- FIX 3:", "}</div>`<!-- FIX 3:");
  
  // Inject before yo-sim-wrap
  code = code.replace("</div></div><div id=\"yo-sim-wrap\">", "</div></div>${pwaSection}<div id=\"yo-sim-wrap\">");

  fs.writeFileSync(file, code);
  console.log('PWA section logic updated in ' + file);
});

// Cache Busting
const swFiles = ['sw.js', 'draft2026/sw.js'];
swFiles.forEach(f => {
  if(!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');
  code = code.replace(/draft2026-v17/g, 'draft2026-v18');
  fs.writeFileSync(f, code);
});
