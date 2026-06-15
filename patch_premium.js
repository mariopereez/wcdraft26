const fs = require('fs');

const jsFiles = ['app.js', 'draft2026/js/app.js'];

jsFiles.forEach(file => {
  if(!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  // 1. Refactor renderHome to unify Podium and My Status
  const s1 = code.indexOf('// 2. El Podio');
  const s2 = code.indexOf('// 3. Tus Próximos Partidos');

  if(s1 > -1 && s2 > -1) {
    // Instead of messing with the inner HTML replacements which are fragile, let's rewrite the renderHome function layout completely from `const myStatusWrap` down to `s2`.
    const renderHomeStart = code.indexOf("const myStatusWrap = document.getElementById('home-my-status-wrap');");
    
    if(renderHomeStart > -1) {
      const newLayoutCode = `
  const podiumWrap = document.getElementById('home-podium-wrap');
  const myStatusWrap = document.getElementById('home-my-status-wrap');
  const matchDayWrap = document.getElementById('home-match-day-wrap');

  if(myStatusWrap) myStatusWrap.innerHTML = ''; // We won't use this separately anymore

  if(podiumWrap) {
    let combinedHtml = \`<div class="premium-dashboard-card" style="background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); margin-top: 1rem; overflow: hidden; position: relative">\`;
    
    // Background glow
    combinedHtml += \`<div style="position:absolute; top:-50px; left:50%; transform:translateX(-50%); width:250px; height:120px; background:radial-gradient(ellipse, rgba(230,183,17,0.15) 0%, rgba(0,0,0,0) 70%); border-radius:50%; z-index:0; pointer-events:none"></div>\`;

    // 1. PODIUM
    if(ranking.length > 0) {
      const p1 = ranking[0]; const p2 = ranking[1]; const p3 = ranking[2];
      let podiumHtml = \`<div class="podium-wrap">\`;
      if(p2) podiumHtml += \`<div class="podium-step p2"><div class="podium-avatar">\${avatarEl(p2.name,'',44)}</div><div class="podium-name">\${p2.name}</div><div class="podium-pts">\${p2.total}</div><div class="podium-base"><div class="podium-rank-num">2</div></div></div>\`;
      if(p1) podiumHtml += \`<div class="podium-step p1"><div class="podium-avatar">\${avatarEl(p1.name,'',52)}</div><div class="podium-name">\${p1.name}</div><div class="podium-pts">\${p1.total}</div><div class="podium-base"><div class="podium-rank-num">1</div></div></div>\`;
      if(p3) podiumHtml += \`<div class="podium-step p3"><div class="podium-avatar">\${avatarEl(p3.name,'',44)}</div><div class="podium-name">\${p3.name}</div><div class="podium-pts">\${p3.total}</div><div class="podium-base"><div class="podium-rank-num">3</div></div></div>\`;
      podiumHtml += \`</div>\`;
      combinedHtml += \`<div style="position:relative; z-index:1; padding: 1.5rem 1rem 0.5rem 1rem">\${podiumHtml}</div>\`;
    }

    // 2. MY STATUS (Integrated)
    const myRankIdx = ranking.findIndex(r=>r.name===myName);
    if(myRankIdx !== -1) {
      const myData = ranking[myRankIdx];
      let gapHtmlBlock = '';
      if(myRankIdx > 0) {
        const nextPlayer = ranking[myRankIdx - 1];
        const diff = Math.round((nextPlayer.total - myData.total)*10)/10;
        const pillText = window.tr("home_pts_diff").replace("{diff}", diff).replace("{name}", nextPlayer.name);
        gapHtmlBlock = \`<div style="text-align:center; margin-top:1rem; position:relative; z-index:2"><div style="display:inline-block; background:rgba(230,57,70,0.15); border:1px solid rgba(230,57,70,0.3); color:#e63946; padding:0.4rem 1rem; border-radius:30px; font-size:0.75rem; font-family:'Barlow Condensed'; font-weight:700; box-shadow:0 0 15px rgba(230,57,70,0.2)">\${pillText}</div></div>\`;
      } else if (ranking.length > 1) {
        const second = ranking[1];
        const diff = Math.round((myData.total - second.total)*10)/10;
        const pillText = \`Le sacas \${diff} pts a \${second.name}\`;
        gapHtmlBlock = \`<div style="text-align:center; margin-top:1rem; position:relative; z-index:2"><div style="display:inline-block; background:rgba(46,196,182,0.15); border:1px solid rgba(46,196,182,0.3); color:var(--cyan); padding:0.4rem 1rem; border-radius:30px; font-size:0.75rem; font-family:'Barlow Condensed'; font-weight:700; box-shadow:0 0 15px rgba(46,196,182,0.2)">\${pillText}</div></div>\`;
      }

      combinedHtml += \`
      <div style="height: 1px; background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0) 100%); margin: 0.5rem 1.5rem;"></div>
      <div style="position:relative; z-index:1; padding: 1.2rem; background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(0,0,0,0.2) 100%); display:flex; justify-content:center; align-items:center;">
          <div style="display:flex; align-items:center; gap:3.5rem">
              <div style="text-align:center">
                  <div style="font-family:'Barlow Condensed';font-size:.75rem;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1px">\${window.tr("home_your_pos")}</div>
                  <div style="font-family:'Bebas Neue';font-size:2.8rem;color:var(--gold);line-height:1;margin-top:.1rem;text-shadow: 0 0 15px rgba(230,183,17,0.3)">\${myRankIdx + 1}º</div>
              </div>
              <div style="width:1px;height:45px;background:rgba(255,255,255,0.1)"></div>
              <div style="text-align:center">
                  <div style="font-family:'Barlow Condensed';font-size:.75rem;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1px">PUNTOS</div>
                  <div style="font-family:'Bebas Neue';font-size:2.2rem;color:var(--white);line-height:1;margin-top:.1rem">\${myData.total}</div>
              </div>
          </div>
      </div>
      \`;
      combinedHtml += \`</div>\`; // End of premium card
      combinedHtml += gapHtmlBlock; // Pill outside card
      
      podiumWrap.innerHTML = combinedHtml;
    } else {
      podiumWrap.innerHTML = '';
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
      code = code.substring(0, renderHomeStart) + newLayoutCode + code.substring(s2);
    }
  }

  // 2. Refactor renderPorraCardHtml
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

  const hImgRaw = typeof flagImg !== 'undefined' ? flagImg((typeof nameES !== 'undefined' ? nameES(m.homeTeam?.name||'') : m.homeTeam?.name), 'md') : '';
  const aImgRaw = typeof flagImg !== 'undefined' ? flagImg((typeof nameES !== 'undefined' ? nameES(m.awayTeam?.name||'') : m.awayTeam?.name), 'md') : '';
  const hImg = hImgRaw.replace('width="40" height="40"', 'width="50" height="50" style="box-shadow:0 5px 15px rgba(0,0,0,0.5); border-radius:50%"');
  const aImg = aImgRaw.replace('width="40" height="40"', 'width="50" height="50" style="box-shadow:0 5px 15px rgba(0,0,0,0.5); border-radius:50%"');

  const isClosed = isTimeClosed || !!userPred;
  const hVal = userPred ? userPred.h : '';
  const aVal = userPred ? userPred.a : '';

  return \`
  <div class="premium-porra-card" style="background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(230,183,17,0.25); border-radius: 16px; padding: 1.8rem 1.2rem; margin-top: 1rem; margin-bottom: 2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.3), inset 0 0 40px rgba(230,183,17,0.05); position:relative; overflow:hidden">
    
    <div style="position:absolute; top:0; left:0; width:100%; height:4px; background:linear-gradient(90deg, transparent, var(--gold), transparent)"></div>

    <div style="text-align:center; margin-bottom:2rem">
        <div style="font-family:'Bebas Neue';font-size:1.6rem;color:var(--gold);letter-spacing:2px; text-shadow: 0 0 10px rgba(230,183,17,0.4)">🔥 \${window.tr("porra_title")}</div>
        <div style="font-family:'Barlow Condensed';font-size:.85rem;color:rgba(255,255,255,0.6);margin-top:.4rem;line-height:1.4;max-width:280px;margin:0 auto">\${window.tr("porra_desc")}</div>
    </div>
    
    <div style="display:flex;align-items:center;justify-content:center;gap:1.5rem;position:relative">
      
      <!-- VS Badge -->
      <div style="position:absolute; left:50%; top:45%; transform:translate(-50%, -50%); z-index:2; width:36px; height:36px; border-radius:50%; background:var(--gold); display:flex; justify-content:center; align-items:center; box-shadow: 0 0 15px rgba(230,183,17,0.6); animation: heartbeat 2s infinite">
          <span style="font-family:'Bebas Neue';font-size:1rem;color:#000;margin-top:2px">VS</span>
      </div>

      <!-- Home Team -->
      <div style="display:flex;flex-direction:column;align-items:center;gap:.6rem;flex:1">
        \${hImg}
        <span style="font-family:'Barlow Condensed';font-weight:700;font-size:1rem;text-align:center;color:var(--white);letter-spacing:1px">\${hName}</span>
        <input type="number" id="porra-h" value="\${hVal}" \${isClosed?'disabled':''} style="width:50px;height:55px;text-align:center;font-family:'Bebas Neue';font-size:1.8rem;background:rgba(0,0,0,0.4);border:2px solid rgba(255,255,255,0.1);color:var(--white);border-radius:10px;box-shadow:inset 0 3px 10px rgba(0,0,0,0.5);transition:border-color 0.3s;margin-top:.4rem">
      </div>
      
      <!-- Away Team -->
      <div style="display:flex;flex-direction:column;align-items:center;gap:.6rem;flex:1">
        \${aImg}
        <span style="font-family:'Barlow Condensed';font-weight:700;font-size:1rem;text-align:center;color:var(--white);letter-spacing:1px">\${aName}</span>
        <input type="number" id="porra-a" value="\${aVal}" \${isClosed?'disabled':''} style="width:50px;height:55px;text-align:center;font-family:'Bebas Neue';font-size:1.8rem;background:rgba(0,0,0,0.4);border:2px solid rgba(255,255,255,0.1);color:var(--white);border-radius:10px;box-shadow:inset 0 3px 10px rgba(0,0,0,0.5);transition:border-color 0.3s;margin-top:.4rem">
      </div>
    </div>
    
    <div style="margin-top:2rem">
      \${isClosed && !userPred ? 
        \`<div style="text-align:center;font-family:'Barlow Condensed';font-weight:700;color:var(--muted);background:rgba(255,255,255,0.05);padding:1rem;border-radius:10px;border:1px solid rgba(255,255,255,0.05)">\${window.tr("porra_closed")}</div>\` : 
      userPred ? 
        \`<div style="text-align:center;font-family:'Barlow Condensed';font-weight:700;color:var(--cyan);background:rgba(46,196,182, 0.1);padding:1rem;border-radius:10px;border:1px solid rgba(46,196,182, 0.3);box-shadow:0 0 15px rgba(46,196,182,0.15)">✓ \${window.tr("porra_done")}</div>\` :
        \`<button class="btn btn-gold" style="width:100%;padding:1rem;font-size:1.3rem;letter-spacing:2px;box-shadow:0 5px 20px rgba(230,183,17,0.4);border-radius:10px" onclick="window.savePrediccion('\${m.id}')">\${window.tr("porra_save")}</button>\`
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
  code = code.replace(/draft2026-v9/g, 'draft2026-v10');
  if(!code.includes('draft2026-v10')) {
      code = code.replace(/draft2026-v8/g, 'draft2026-v10');
  }
  fs.writeFileSync(f, code);
});

console.log('Premium Redesign App.js patched.');
