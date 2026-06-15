const fs = require('fs');

const jsFiles = ['app.js', 'draft2026/js/app.js'];

jsFiles.forEach(file => {
  if(!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  const s1 = code.indexOf("const podiumWrap = document.getElementById('home-podium-wrap');");
  const s2 = code.indexOf("// 3. Match of the Day (Rendered in its wrap)");

  if(s1 > -1 && s2 > -1) {
    const newRenderHome = `const podiumWrap = document.getElementById('home-podium-wrap');
  const myStatusWrap = document.getElementById('home-my-status-wrap');
  const matchDayWrap = document.getElementById('home-match-day-wrap');

  if(myStatusWrap) myStatusWrap.innerHTML = ''; // We won't use this separately anymore

  if(podiumWrap) {
    let combinedHtml = \`<div style="background:var(--surf2); border:1px solid var(--border); border-radius:14px; box-shadow:0 4px 12px rgba(0,0,0,0.1)">\`;

    // 1. PODIUM
    if(ranking.length > 0) {
      const p1 = ranking[0]; const p2 = ranking[1]; const p3 = ranking[2];
      let podiumHtml = \`<div class="podium-wrap" style="border:none; background:transparent; padding:1.5rem 0 1rem; margin-top:0; box-shadow:none; border-radius:0">\`;
      if(p2) podiumHtml += \`<div class="podium-step p2"><div class="podium-avatar">\${avatarEl(p2.name,'',44)}</div><div class="podium-name">\${p2.name}</div><div class="podium-pts">\${p2.total}</div><div class="podium-base"><div class="podium-rank-num">2</div></div></div>\`;
      if(p1) podiumHtml += \`<div class="podium-step p1"><div class="podium-avatar">\${avatarEl(p1.name,'',52)}</div><div class="podium-name">\${p1.name}</div><div class="podium-pts">\${p1.total}</div><div class="podium-base"><div class="podium-rank-num">1</div></div></div>\`;
      if(p3) podiumHtml += \`<div class="podium-step p3"><div class="podium-avatar">\${avatarEl(p3.name,'',44)}</div><div class="podium-name">\${p3.name}</div><div class="podium-pts">\${p3.total}</div><div class="podium-base"><div class="podium-rank-num">3</div></div></div>\`;
      podiumHtml += \`</div>\`;
      combinedHtml += podiumHtml;
    }

    // Divider
    combinedHtml += \`<div style="height:1px; background:var(--border); margin:0 1.5rem"></div>\`;

    // 2. MY STATUS
    const myRankIdx = ranking.findIndex(r=>r.name===myName);
    if(myRankIdx !== -1) {
      const myData = ranking[myRankIdx];
      let gapHtmlBlock = '';
      if(myRankIdx > 0) {
        const nextPlayer = ranking[myRankIdx - 1];
        const diff = Math.round((nextPlayer.total - myData.total)*10)/10;
        const pillText = window.tr("home_pts_diff").replace("{diff}", diff).replace("{name}", nextPlayer.name);
        gapHtmlBlock = \`<div style="text-align:center; margin-top:0.6rem"><div style="display:inline-block; background:rgba(230,57,70,0.1); border:1px solid rgba(230,57,70,0.2); color:#e63946; padding:0.3rem 0.8rem; border-radius:20px; font-size:0.75rem; font-family:'Barlow Condensed'; font-weight:700">\${pillText}</div></div>\`;
      } else if (ranking.length > 1) {
        const second = ranking[1];
        const diff = Math.round((myData.total - second.total)*10)/10;
        const pillText = \`Le sacas \${diff} pts a \${second.name}\`;
        gapHtmlBlock = \`<div style="text-align:center; margin-top:0.6rem"><div style="display:inline-block; background:rgba(46,196,182,0.1); border:1px solid rgba(46,196,182,0.2); color:var(--cyan); padding:0.3rem 0.8rem; border-radius:20px; font-size:0.75rem; font-family:'Barlow Condensed'; font-weight:700">\${pillText}</div></div>\`;
      }

      combinedHtml += \`
        <div style="padding:1.2rem 1rem; display:flex; justify-content:center; align-items:center; width:100%">
          <div style="display:flex; align-items:center; gap:3rem">
              <div style="text-align:center">
                  <div style="font-family:'Barlow Condensed';font-size:.75rem;color:var(--muted);text-transform:uppercase;letter-spacing:1px">\${window.tr("home_your_pos")}</div>
                  <div style="font-family:'Bebas Neue';font-size:2.5rem;color:var(--gold);line-height:1;margin-top:.2rem">\${myRankIdx + 1}º</div>
              </div>
              <div style="width:1px;height:40px;background:var(--border)"></div>
              <div style="text-align:center">
                  <div style="font-family:'Barlow Condensed';font-size:.75rem;color:var(--muted);text-transform:uppercase;letter-spacing:1px">PUNTOS</div>
                  <div style="font-family:'Bebas Neue';font-size:2.2rem;color:var(--white);line-height:1;margin-top:.2rem">\${myData.total}</div>
              </div>
          </div>
        </div>
      </div> \${gapHtmlBlock}
      \`;
    } else {
      combinedHtml += \`</div>\`;
    }
    
    podiumWrap.innerHTML = combinedHtml;
  } else if (podiumWrap) {
    podiumWrap.innerHTML = '';
  }

  // 3. Match of the Day (Rendered in its wrap)
  `;
    code = code.substring(0, s1) + newRenderHome + code.substring(s2);
  }

  fs.writeFileSync(file, code);
});

// Cache Busting
const swFiles = ['sw.js', 'draft2026/sw.js'];
swFiles.forEach(f => {
  if(!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');
  code = code.replace(/draft2026-v11/g, 'draft2026-v12');
  fs.writeFileSync(f, code);
});

console.log('Integrated Podium and Status');
