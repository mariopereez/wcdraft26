const fs = require('fs');

const jsFiles = ['app.js', 'draft2026/js/app.js'];

jsFiles.forEach(file => {
  if(!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  const s1 = code.indexOf("const podiumWrap = document.getElementById('home-podium-wrap');");
  const s2 = code.indexOf("// 3. Tus Próximos Partidos");

  if(s1 > -1 && s2 > -1) {
    const newRenderHome = `const podiumWrap = document.getElementById('home-podium-wrap');
  const myStatusWrap = document.getElementById('home-my-status-wrap');
  const matchDayWrap = document.getElementById('home-match-day-wrap');

  // 1. PODIUM
  if(podiumWrap) {
    if(ranking.length > 0) {
      const p1 = ranking[0]; const p2 = ranking[1]; const p3 = ranking[2];
      let podiumHtml = \`<div class="podium-wrap" style="background:var(--surf2); border:1px solid var(--border); border-radius:14px; padding:1.5rem 0 0; margin-top:0.5rem; box-shadow:0 4px 12px rgba(0,0,0,0.1)">\`;
      if(p2) podiumHtml += \`<div class="podium-step p2"><div class="podium-avatar">\${avatarEl(p2.name,'',44)}</div><div class="podium-name">\${p2.name}</div><div class="podium-pts">\${p2.total}</div><div class="podium-base"><div class="podium-rank-num">2</div></div></div>\`;
      if(p1) podiumHtml += \`<div class="podium-step p1"><div class="podium-avatar">\${avatarEl(p1.name,'',52)}</div><div class="podium-name">\${p1.name}</div><div class="podium-pts">\${p1.total}</div><div class="podium-base"><div class="podium-rank-num">1</div></div></div>\`;
      if(p3) podiumHtml += \`<div class="podium-step p3"><div class="podium-avatar">\${avatarEl(p3.name,'',44)}</div><div class="podium-name">\${p3.name}</div><div class="podium-pts">\${p3.total}</div><div class="podium-base"><div class="podium-rank-num">3</div></div></div>\`;
      podiumHtml += \`</div>\`;
      podiumWrap.innerHTML = podiumHtml;
    } else {
      podiumWrap.innerHTML = '';
    }
  }

  // 2. MY STATUS
  if(myStatusWrap) {
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

      myStatusWrap.innerHTML = \`
        <div style="background:var(--surf2); border:1px solid var(--border); border-radius:12px; padding:1.2rem 1rem; display:flex; justify-content:center; align-items:center; width:100%; margin-top:0.5rem; box-shadow:0 4px 12px rgba(0,0,0,0.1)">
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
        \${gapHtmlBlock}
      \`;
    } else {
      myStatusWrap.innerHTML = '';
    }
  }

  // 3. Match of the Day (Rendered in its wrap)
  if (matchDayWrap) {
    if (window.renderPorraCardHtml) {
      matchDayWrap.innerHTML = window.renderPorraCardHtml();
    } else {
      matchDayWrap.innerHTML = '';
    }
  }

  `;
    code = code.substring(0, s1) + newRenderHome + code.substring(s2);
  }

  // Refactor renderPorraCardHtml back to a cleaner look
  const porraStart = code.indexOf('window.renderPorraCardHtml = function() {');
  const porraEnd = code.indexOf('};', porraStart);
  if(porraStart > -1 && porraEnd > -1) {
    const newPorra = `window.renderPorraCardHtml = function() {
  const m = window.getPartidoDelDia();
  if(!m) return '';
  const isTimeClosed = m.status === 'IN_PLAY' || m.status === 'PAUSED' || m.status === 'FINISHED';
  
  let userPred = null;
  if(typeof window._authUser !== 'undefined' && window._authUser && window._predicciones && window._predicciones[window._authUser.uid] && window._predicciones[window._authUser.uid].matches) {
    userPred = window._predicciones[window._authUser.uid].matches[m.id];
  }
  
  const hName = window.tr("country_" + (typeof nameES !== 'undefined' ? nameES(m.homeTeam?.name||'') : m.homeTeam?.name));
  const aName = window.tr("country_" + (typeof nameES !== 'undefined' ? nameES(m.awayTeam?.name||'') : m.awayTeam?.name));

  const hImg = typeof flagImg !== 'undefined' ? flagImg((typeof nameES !== 'undefined' ? nameES(m.homeTeam?.name||'') : m.homeTeam?.name), 'md') : '';
  const aImg = typeof flagImg !== 'undefined' ? flagImg((typeof nameES !== 'undefined' ? nameES(m.awayTeam?.name||'') : m.awayTeam?.name), 'md') : '';

  const isClosed = isTimeClosed || !!userPred;
  const hVal = userPred ? userPred.h : '';
  const aVal = userPred ? userPred.a : '';

  return \`
  <div style="background:var(--surf2); border:1px solid var(--border); border-radius:14px; padding:1.5rem 1.2rem; margin-top:1rem; margin-bottom:1rem; box-shadow:0 4px 12px rgba(0,0,0,0.1)">
    
    <div style="text-align:center; margin-bottom:1.5rem">
        <div style="font-family:'Bebas Neue';font-size:1.4rem;color:var(--gold);letter-spacing:1px">🔥 \${window.tr("porra_title")}</div>
        <div style="font-family:'Barlow Condensed';font-size:.8rem;color:var(--muted);margin-top:.3rem;line-height:1.4;max-width:280px;margin:0 auto">\${window.tr("porra_desc")}</div>
    </div>
    
    <div style="display:flex;align-items:center;justify-content:center;gap:1rem">
      
      <!-- Home Team -->
      <div style="display:flex;flex-direction:column;align-items:center;gap:.4rem;flex:1">
        \${hImg}
        <span style="font-family:'Barlow Condensed';font-weight:700;font-size:.9rem;text-align:center;color:var(--white)">\${hName}</span>
      </div>

      <div style="display:flex;align-items:center;gap:.5rem">
        <input type="number" id="porra-h" value="\${hVal}" \${isClosed?'disabled':''} style="width:45px;height:45px;text-align:center;font-family:'Bebas Neue';font-size:1.5rem;background:var(--surface);border:1px solid var(--border);color:var(--white);border-radius:8px">
        <span style="font-family:'Barlow Condensed';color:var(--muted);font-weight:700">-</span>
        <input type="number" id="porra-a" value="\${aVal}" \${isClosed?'disabled':''} style="width:45px;height:45px;text-align:center;font-family:'Bebas Neue';font-size:1.5rem;background:var(--surface);border:1px solid var(--border);color:var(--white);border-radius:8px">
      </div>
      
      <!-- Away Team -->
      <div style="display:flex;flex-direction:column;align-items:center;gap:.4rem;flex:1">
        \${aImg}
        <span style="font-family:'Barlow Condensed';font-weight:700;font-size:.9rem;text-align:center;color:var(--white)">\${aName}</span>
      </div>
    </div>
    
    <div style="margin-top:1.5rem">
      \${isClosed && !userPred ? 
        \`<div style="text-align:center;font-family:'Barlow Condensed';font-weight:700;color:var(--muted);background:var(--surface);padding:.8rem;border-radius:8px;border:1px solid var(--border)">\${window.tr("porra_closed")}</div>\` : 
      userPred ? 
        \`<div style="text-align:center;font-family:'Barlow Condensed';font-weight:700;color:var(--cyan);background:rgba(46,196,182, 0.1);padding:.8rem;border-radius:8px;border:1px solid rgba(46,196,182, 0.3)">✓ \${window.tr("porra_done")}</div>\` :
        \`<button class="btn btn-gold" style="width:100%;padding:.8rem;font-size:1.1rem;letter-spacing:1px;border-radius:8px" onclick="window.savePrediccion('\${m.id}')">\${window.tr("porra_save")}</button>\`
      }
    </div>
  </div>\`;
`;
    code = code.substring(0, porraStart) + newPorra + code.substring(porraEnd);
  }

  fs.writeFileSync(file, code);
});

// Cache Busting
const swFiles = ['sw.js', 'draft2026/sw.js'];
swFiles.forEach(f => {
  if(!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');
  code = code.replace(/draft2026-v10/g, 'draft2026-v11');
  fs.writeFileSync(f, code);
});

console.log('Clean Native Redesign applied.');
