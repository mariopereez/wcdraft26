const fs = require('fs');

const jsFiles = ['app.js', 'draft2026/js/app.js'];

jsFiles.forEach(file => {
  if(!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  // Remove the broken patch completely
  const startBroken = code.indexOf('// Backward compatibility auto-fix');
  if(startBroken > -1) {
    const endBroken = code.indexOf('    if(currentPartidaConfig.estado===\'eliminada\') { alert(', startBroken);
    if(endBroken > -1) {
      code = code.substring(0, startBroken) + code.substring(endBroken);
    } else {
       // if different layout
       const altEnd = code.indexOf('if(currentPartidaConfig.estado===\'eliminada\')', startBroken);
       code = code.substring(0, startBroken) + code.substring(altEnd);
    }
  }

  // Inject correctly inside enterApp
  // find: `async function enterApp(partidaId) {`
  // find inside it: `currentPartidaConfig = cfgSnap.data();`
  // and inject after it.
  const targetFn = 'async function enterApp(partidaId) {';
  const targetIdx = code.indexOf(targetFn);
  if (targetIdx > -1) {
    const targetInject = code.indexOf('currentPartidaConfig = cfgSnap.data();', targetIdx);
    if (targetInject > -1) {
      const injectPoint = targetInject + 'currentPartidaConfig = cfgSnap.data();'.length;
      
      const safePatch = `
    // Backward compatibility auto-fix
    if(partidaId !== '__DEMO__' && typeof currentUser !== 'undefined' && currentUser) {
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
      code = code.substring(0, injectPoint) + safePatch + code.substring(injectPoint);
      fs.writeFileSync(file, code);
      console.log('Fixed and safely injected patch into ' + file);
    }
  }
});

// Cache Busting
const swFiles = ['sw.js', 'draft2026/sw.js'];
swFiles.forEach(f => {
  if(!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');
  code = code.replace(/draft2026-v19/g, 'draft2026-v20');
  fs.writeFileSync(f, code);
});
