const fs = require('fs');

const jsFiles = ['app.js', 'draft2026/js/app.js'];

jsFiles.forEach(file => {
  if(!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  const patch = `
    // Backward compatibility auto-fix
    if(partidaId !== '__DEMO__' && currentUser) {
      try {
        const jugRef = window._doc(window._db,'partidas',partidaId,'jugadores',currentUser.uid);
        const jSnap = await window._getDoc(jugRef);
        if(!jSnap.exists()) {
          await window._setDoc(jugRef, {displayName:currentProfile.displayName, joinedAt:Date.now(), uid:currentUser.uid}, {merge:true});
        }
        if(isAdmin()) {
          const dRef = window._doc(window._db,'partidas',partidaId,'draftState','data');
          if(!(await window._getDoc(dRef)).exists()) await window._setDoc(dRef, {phase:'pending',orders:[],currentPick:0});
          const rRef = window._doc(window._db,'partidas',partidaId,'results','data');
          if(!(await window._getDoc(rRef)).exists()) {
            const emptyResults = {};
            ALL_TEAMS.forEach(t => { emptyResults[t] = {pg:0,pe:0,pd:0,r16:0,r8:0,r4:0,semi:0,final:0,ganador:0,bronce:0}; });
            await window._setDoc(rRef, emptyResults);
          }
        }
      } catch(e) { console.warn('Backward compat patch failed:', e); }
    }
    `;

  if(!code.includes('// Backward compatibility auto-fix')) {
    code = code.replace("if(currentPartidaConfig.estado==='eliminada')", patch + "if(currentPartidaConfig.estado==='eliminada')");
    fs.writeFileSync(file, code);
    console.log('Applied backward compat to ' + file);
  }
});

// Cache Busting
const swFiles = ['sw.js', 'draft2026/sw.js'];
swFiles.forEach(f => {
  if(!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');
  code = code.replace(/draft2026-v18/g, 'draft2026-v19');
  fs.writeFileSync(f, code);
});
