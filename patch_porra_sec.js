const fs = require('fs');

const jsFiles = ['app.js', 'draft2026/js/app.js'];

jsFiles.forEach(file => {
  if(!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  const securityCheck = `
  const m = window.getPartidoDelDia();
  if(!m || String(m.id) !== String(mId) || m.status === 'IN_PLAY' || m.status === 'PAUSED' || m.status === 'FINISHED') {
    alert(window.tr ? window.tr('porra_closed') : 'El partido ya ha comenzado o finalizado. No se aceptan más predicciones.');
    return;
  }
  `;

  if(!code.includes('m.status === \'IN_PLAY\' || m.status === \'PAUSED\' || m.status === \'FINISHED\') {')) {
    // Inject the check inside window.savePrediccion, right before the confirm box
    const targetFn = 'const msg = window.tr ? window.tr(\'porra_confirm\') : \'¿Estás seguro? Solo puedes guardar la predicción una vez.\';';
    if(code.includes(targetFn)) {
      code = code.replace(targetFn, securityCheck + targetFn);
      fs.writeFileSync(file, code);
      console.log('Injected security check into ' + file);
    }
  }
});

// Cache Busting
const swFiles = ['sw.js', 'draft2026/sw.js'];
swFiles.forEach(f => {
  if(!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');
  code = code.replace(/draft2026-v20/g, 'draft2026-v21');
  fs.writeFileSync(f, code);
});
