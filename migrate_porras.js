const fs = require('fs');

const jsFiles = ['app.js', 'draft2026/js/app.js'];
jsFiles.forEach(f => {
  if(!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');

  // 1. Change the savePrediccion logic to save to 'jugadores' instead of 'predicciones'
  const oldSave = `const docRef = window._doc(window._db, 'partidas', currentPartidaId, 'predicciones', window._authUser.uid);
  await window._setDoc(docRef, { matches: { [mId]: { h, a, ts: Date.now() } } }, { merge: true });
  alert(window.tr('porra_saved'));`;
  
  const newSave = `try {
    const docRef = window._doc(window._db, 'partidas', currentPartidaId, 'jugadores', window._authUser.uid);
    await window._setDoc(docRef, { predicciones: { matches: { [mId]: { h, a, ts: Date.now() } } } }, { merge: true });
    alert(window.tr('porra_saved') || 'Predicción Guardada');
  } catch (e) {
    alert("Error de permisos en BD: " + e.message);
  }`;
  
  if (code.includes(oldSave)) {
    code = code.replace(oldSave, newSave);
  } else if (!code.includes('await window._setDoc(docRef, { predicciones:')) {
    // If exact match fails, use regex
    code = code.replace(/const docRef = window\._doc\(window\._db, 'partidas', currentPartidaId, 'predicciones', window\._authUser\.uid\);\s*await window\._setDoc\(docRef, \{ matches: \{ \[mId\]: \{ h, a, ts: Date\.now\(\) \} \} \}, \{ merge: true \}\);\s*alert\(.*?\);/g, newSave);
  }

  // 2. Change the enterApp listener to listen to 'jugadores' instead of 'predicciones'
  const oldListener = `window.unsubPreds = window._onSnapshot(window._collection(window._db, 'partidas', partidaId, 'predicciones'), snap => {
        window._predicciones = {};
        snap.forEach(d => window._predicciones[d.id] = d.data());
        if (typeof getRanking === 'function') {
          try { renderHome(); renderYo(); renderSala(); } catch(e){}
        }
      });`;
  
  const newListener = `window.unsubPreds = window._onSnapshot(window._collection(window._db, 'partidas', partidaId, 'jugadores'), snap => {
        window._predicciones = {};
        currentPartidaJugadores = {};
        snap.forEach(d => {
          const data = d.data();
          currentPartidaJugadores[d.id] = data;
          if (data.predicciones) {
            window._predicciones[d.id] = data.predicciones;
          }
        });
        if (typeof getRanking === 'function') {
          try { renderHome(); renderYo(); renderClasificacion(); } catch(e){}
        }
      });`;
      
  if (code.includes(oldListener)) {
    code = code.replace(oldListener, newListener);
  } else if (!code.includes('currentPartidaJugadores[d.id] = data;')) {
    // regex replace
    code = code.replace(/window\.unsubPreds = window\._onSnapshot\(window\._collection\(window\._db, 'partidas', partidaId, 'predicciones'\), snap => \{[\s\S]*?\}\);/g, newListener);
  }

  fs.writeFileSync(f, code);
});

console.log('Migration to jugadores collection completed.');
