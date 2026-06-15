const fs = require('fs');

const jsFiles = ['app.js', 'draft2026/js/app.js'];
jsFiles.forEach(f => {
  if(!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');

  // 1. Podium wrapping
  const s1 = code.indexOf("podiumHtml += `</div>`;");
  if(s1 > -1) {
    const s2 = code.indexOf("podiumWrap.innerHTML = podiumHtml;", s1);
    if(s2 > -1) {
      code = code.substring(0, s2) + "podiumWrap.innerHTML = `<div style=\"background:var(--surf2); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:1.5rem 1rem; box-shadow:0 8px 24px rgba(0,0,0,0.2); margin-top:0.5rem\">${podiumHtml}</div>`;" + code.substring(s2 + 34);
    }
  }

  // 2. Tu Posición layout
  const statusStart = code.indexOf("myStatusWrap.innerHTML = `");
  const matchDayWrap = code.indexOf("const matchDayWrap =", statusStart);
  if(statusStart > -1 && matchDayWrap > -1) {
    // Before replacement, we must rewrite gapHtml calculation
    const gapStart = code.lastIndexOf("let gapHtml = '';", statusStart);
    if(gapStart > -1) {
      const gapReplace = `let gapHtmlBlock = '';
      if(myRankIdx > 0) {
        const nextPlayer = ranking[myRankIdx - 1];
        const diff = Math.round((nextPlayer.total - myData.total)*10)/10;
        const pillText = window.tr("home_pts_diff").replace("{diff}", diff).replace("{name}", nextPlayer.name);
        gapHtmlBlock = \`<div style="text-align:center; margin-top:.8rem"><div style="display:inline-block; background:rgba(230,57,70,0.15); color:#e63946; padding:0.3rem 0.8rem; border-radius:20px; font-size:0.75rem; font-family:'Barlow Condensed'; font-weight:700">\${pillText}</div></div>\`;
      } else if (ranking.length > 1) {
        const second = ranking[1];
        const diff = Math.round((myData.total - second.total)*10)/10;
        const pillText = \`Le sacas \${diff} pts a \${second.name}\`;
        gapHtmlBlock = \`<div style="text-align:center; margin-top:.8rem"><div style="display:inline-block; background:rgba(46,196,182,0.15); color:var(--cyan); padding:0.3rem 0.8rem; border-radius:20px; font-size:0.75rem; font-family:'Barlow Condensed'; font-weight:700">\${pillText}</div></div>\`;
      }`;
      code = code.substring(0, gapStart) + gapReplace + code.substring(statusStart);
    }

    const newStatusStart = code.indexOf("myStatusWrap.innerHTML = `");
    const newMatchDayWrap = code.indexOf("const matchDayWrap =", newStatusStart);
    
    const newLayout = `myStatusWrap.innerHTML = \`
        <div style="background:var(--surf2); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:1.2rem 1rem; display:flex; justify-content:center; align-items:center; max-width:100%; margin:0 auto; box-shadow:0 8px 24px rgba(0,0,0,0.2)">
          <div style="display:flex; align-items:center; gap:2.5rem; margin:0 auto">
            <div style="text-align:center">
              <div style="font-family:'Barlow Condensed';font-size:.75rem;color:var(--muted);text-transform:uppercase;letter-spacing:1px">\${window.tr("home_your_pos")}</div>
              <div style="font-family:'Bebas Neue';font-size:2.8rem;color:var(--gold);line-height:1;margin-top:.2rem">\${myRankIdx + 1}º</div>
            </div>
            <div style="width:1px;height:45px;background:rgba(255,255,255,0.1)"></div>
            <div style="text-align:center">
              <div style="font-family:'Barlow Condensed';font-size:.75rem;color:var(--muted);text-transform:uppercase;letter-spacing:1px">PUNTOS</div>
              <div style="font-family:'Bebas Neue';font-size:2.2rem;color:var(--white);line-height:1;margin-top:.2rem">\${myData.total}</div>
            </div>
          </div>
        </div>
        \${gapHtmlBlock}
      \`;

      `;
    
    code = code.substring(0, newStatusStart) + newLayout + code.substring(newMatchDayWrap);
  }

  // 3. Fire emoji in Porra
  code = code.replace(
    /\$\{window\.tr\("porra_title"\)\}/g,
    '🔥 ${window.tr("porra_title")}'
  );

  fs.writeFileSync(f, code);
});

// Cache Busting
const swFiles = ['sw.js', 'draft2026/sw.js'];
swFiles.forEach(f => {
  if(!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');
  code = code.replace(/draft2026-v8/g, 'draft2026-v9');
  fs.writeFileSync(f, code);
});

console.log('Mockup applied');
