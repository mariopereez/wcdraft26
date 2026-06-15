const fs = require('fs');

const jsFiles = ['app.js', 'draft2026/js/app.js'];
jsFiles.forEach(f => {
  if(!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');

  // 1. Fix calcP
  const calcPRegex = /function calcP\(p\) \{\s*let grp=0, elim=0;\s*\(draft\[p\]\|\|\[\]\)\.forEach\(\(t,i\)=>\{if\(!t\)return; grp\+=teamGroupPts\(t\); elim\+=teamElimRaw\(t\)\*\(MULTS\[i\]\|\|1\);\}\);\s*return \{grp:Math\.round\(grp\*10\)\/10, elim:Math\.round\(elim\*10\)\/10, total:Math\.round\(\(grp\+elim\)\*10\)\/10\};\s*\}/;

  const newCalcP = `function calcP(p) {
  let grp=0, elim=0, porra_pts=0;
  (draft[p]||[]).forEach((t,i)=>{if(!t)return; grp+=teamGroupPts(t); elim+=teamElimRaw(t)*(MULTS[i]||1);});

  const uid = Object.keys(PARTICIPANTES_BY_UID).find(k => PARTICIPANTES_BY_UID[k] === p);
  const pData = (uid && typeof currentPartidaJugadores !== 'undefined' && currentPartidaJugadores[uid]) ? currentPartidaJugadores[uid].predicciones?.matches || {} : {};
  Object.entries(pData).forEach(([mid, pred]) => {
    const m = typeof matches !== 'undefined' ? matches.find(x => String(x.id) === String(mid)) : null;
    if (m && m.status === 'FINISHED' && m.score?.fullTime?.home != null) {
      if (m.score.fullTime.home === pred.h && m.score.fullTime.away === pred.a) {
        porra_pts += 2;
      }
    }
  });

  return {grp:Math.round(grp*10)/10, elim:Math.round(elim*10)/10, porras: porra_pts, total:Math.round((grp+elim+porra_pts)*10)/10};
}`;

  code = code.replace(calcPRegex, newCalcP);

  // 2. Fix u6 missing refreshCurrentPage
  const u6Regex = /const u6 = window\._onSnapshot\(window\._doc\(window\._db, 'cache', 'admin_matches'\), s => \{\s*if \(s\.exists\(\)\) \{\s*adminMatchesData = s\.data\(\);\s*matches = applyAdminDataToMatches\(adminMatchesData\);\s*autoSyncFromMatches\(\);\s*if \(document\.getElementById\('page-admin'\)\?\.classList\.contains\('active'\)\) renderAdminPanel\(\);\s*\}\s*\}\);/;

  const newU6 = `const u6 = window._onSnapshot(window._doc(window._db, 'cache', 'admin_matches'), s => {
    if (s.exists()) {
      adminMatchesData = s.data();
      matches = applyAdminDataToMatches(adminMatchesData);
      autoSyncFromMatches();
      refreshCurrentPage();
      if (document.getElementById('page-admin')?.classList.contains('active')) renderAdminPanel();
    }
  });`;

  code = code.replace(u6Regex, newU6);

  fs.writeFileSync(f, code);
});

// 3. Increment SW Cache Version
const swFiles = ['sw.js', 'draft2026/sw.js'];
swFiles.forEach(f => {
  if(!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');
  
  code = code.replace(/draft2026-v3/g, 'draft2026-v4');
  
  fs.writeFileSync(f, code);
});

console.log('Patches applied successfully.');
