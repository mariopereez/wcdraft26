const fs = require('fs');

const jsFiles = ['app.js', 'draft2026/js/app.js'];

jsFiles.forEach(file => {
  if(!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  const oldRenderStatus = `myStatusWrap.innerHTML = \`
        <div class="my-status-card">
          <div class="msc-info">
            <div class="msc-label">\${window.tr("home_your_pos")}</div>
            <div class="msc-pos">\${myRankIdx + 1}º</div>
            \${gapHtml}
          </div>
          <div style="text-align:right">
            <div class="msc-label">Puntos</div>
            <div class="msc-pts">\${myData.total}</div>
          </div>
        </div>\`;
      if(window.renderPorraCardHtml) myStatusWrap.innerHTML += window.renderPorraCardHtml();`;

  const newRenderStatus = `myStatusWrap.innerHTML = \`
        <div style="background:var(--surf2); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:0.8rem 1.2rem; display:flex; justify-content:space-between; align-items:center; max-width:280px; margin:0 auto; box-shadow:0 8px 24px rgba(0,0,0,0.2)">
          <div style="display:flex; align-items:center; gap:1.2rem; margin:0 auto">
            <div style="text-align:center">
              <div style="font-family:'Barlow Condensed';font-size:.75rem;color:var(--muted);text-transform:uppercase">\${window.tr("home_your_pos")}</div>
              <div style="font-family:'Bebas Neue';font-size:2.2rem;color:var(--gold);line-height:1">\${myRankIdx + 1}º</div>
            </div>
            <div style="width:1px;height:35px;background:rgba(255,255,255,0.1)"></div>
            <div style="text-align:center">
              <div style="font-family:'Barlow Condensed';font-size:.75rem;color:var(--muted);text-transform:uppercase">PUNTOS</div>
              <div style="font-family:'Bebas Neue';font-size:1.8rem;color:var(--white);line-height:1">\${myData.total}</div>
            </div>
          </div>
        </div>
        \${gapHtml ? \\\`<div style="text-align:center; margin-top:.6rem">\\\${gapHtml}</div>\\\` : ''}
      \`;

      const matchDayWrap = document.getElementById('home-match-day-wrap');
      if (matchDayWrap && window.renderPorraCardHtml) {
        matchDayWrap.innerHTML = window.renderPorraCardHtml();
      }`;

  code = code.replace(oldRenderStatus, newRenderStatus);
  fs.writeFileSync(file, code);
});

// Cache Busting
const swFiles = ['sw.js', 'draft2026/sw.js'];
swFiles.forEach(f => {
  if(!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');
  code = code.replace(/draft2026-v5/g, 'draft2026-v6');
  fs.writeFileSync(f, code);
});

console.log('Tu posicion y Porra separados');
