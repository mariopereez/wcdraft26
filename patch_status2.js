const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const s1 = code.indexOf('myStatusWrap.innerHTML = `');
const s2 = code.indexOf('if(window.renderPorraCardHtml)', s1);
const s3 = code.indexOf(';', s2) + 1;

if(s1 > -1 && s3 > -1) {
  const newStatus = `myStatusWrap.innerHTML = \`
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
      if (matchDayWrap) {
        if (window.renderPorraCardHtml) {
          matchDayWrap.innerHTML = window.renderPorraCardHtml();
        } else {
          matchDayWrap.innerHTML = '';
        }
      }`;

  code = code.substring(0, s1) + newStatus + code.substring(s3);
  fs.writeFileSync('app.js', code);
  fs.writeFileSync('draft2026/js/app.js', code);
  console.log('App JS rewritten');
} else {
  console.log('Could not find bounds');
}

// Increment sw.js again
const swFiles = ['sw.js', 'draft2026/sw.js'];
swFiles.forEach(f => {
  if(!fs.existsSync(f)) return;
  let sw = fs.readFileSync(f, 'utf8');
  sw = sw.replace(/draft2026-v6/g, 'draft2026-v7');
  if(!sw.includes('draft2026-v7')) {
      sw = sw.replace(/draft2026-v5/g, 'draft2026-v7');
  }
  fs.writeFileSync(f, sw);
});
