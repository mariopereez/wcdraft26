const fs = require('fs');

const jsFiles = ['app.js', 'draft2026/js/app.js'];

jsFiles.forEach(file => {
  if(!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  // 1. Refactor renderPorraCardHtml to use gold highlight style
  const s1 = code.indexOf('window.renderPorraCardHtml = function() {');
  const s2 = code.indexOf('};', s1);

  if(s1 > -1 && s2 > -1) {
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
  <div style="background:linear-gradient(135deg, rgba(230,183,17,0.08) 0%, var(--surf2) 100%); border:1px solid rgba(230,183,17,0.4); border-radius:14px; padding:1.5rem 1.2rem; margin-top:0.5rem; margin-bottom:1rem; box-shadow:0 4px 12px rgba(0,0,0,0.15)">
    
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
        <input type="number" id="porra-h" value="\${hVal}" \${isClosed?'disabled':''} style="width:45px;height:45px;text-align:center;font-family:'Bebas Neue';font-size:1.5rem;background:var(--surface);border:1px solid rgba(230,183,17,0.3);color:var(--white);border-radius:8px;box-shadow:inset 0 2px 4px rgba(0,0,0,0.2)">
        <span style="font-family:'Barlow Condensed';color:var(--gold);font-weight:700">-</span>
        <input type="number" id="porra-a" value="\${aVal}" \${isClosed?'disabled':''} style="width:45px;height:45px;text-align:center;font-family:'Bebas Neue';font-size:1.5rem;background:var(--surface);border:1px solid rgba(230,183,17,0.3);color:var(--white);border-radius:8px;box-shadow:inset 0 2px 4px rgba(0,0,0,0.2)">
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
    code = code.substring(0, s1) + newPorra + code.substring(s2);
  }

  fs.writeFileSync(file, code);
});

// Cache Busting
const swFiles = ['sw.js', 'draft2026/sw.js'];
swFiles.forEach(f => {
  if(!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');
  code = code.replace(/draft2026-v12/g, 'draft2026-v13');
  fs.writeFileSync(f, code);
});

console.log('Match of the day highlighted.');
