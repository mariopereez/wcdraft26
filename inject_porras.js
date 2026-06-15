const fs = require('fs');

const blockEs = `
    porra_title: "🔥 Partido del Día",
    porra_desc: "Acierta el resultado exacto y suma +2 puntos, o acierta la tendencia por +0.5 puntos.",
    porra_save: "Guardar",
    porra_saved: "¡Predicción guardada!",
    porra_invalid: "Introduce un resultado válido",
    porra_closed: "Partido cerrado",
    porra_pts_label: "Porras",
`;
const blockEn = `
    porra_title: "🔥 Match of the Day",
    porra_desc: "Guess the exact score for +2 points, or the correct trend for +0.5 points.",
    porra_save: "Save",
    porra_saved: "Prediction saved!",
    porra_invalid: "Enter a valid score",
    porra_closed: "Match closed",
    porra_pts_label: "Preds",
`;

let trans = fs.readFileSync('js/translations.js', 'utf8');
trans = trans.replace(/nav_home: "Inicio",/g, blockEs + ' nav_home: "Inicio",');
trans = trans.replace(/nav_home: "Home",/g, blockEn + ' nav_home: "Home",');
fs.writeFileSync('js/translations.js', trans);
fs.writeFileSync('draft2026/js/translations.js', trans);

const jsFiles = ['app.js', 'draft2026/js/app.js'];
jsFiles.forEach(f => {
  if(!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');

  // a. Listener in enterApp
  if(!code.includes('window.unsubPreds')) {
    code = code.replace(
      /currentPartidaConfig = cfgSnap\.data\(\);/,
      `currentPartidaConfig = cfgSnap.data();
    if(window.unsubPreds) { window.unsubPreds(); window.unsubPreds = null; }
    window._predicciones = {};
    if(partidaId !== '__DEMO__') {
      window.unsubPreds = window._onSnapshot(window._collection(window._db, 'partidas', partidaId, 'predicciones'), snap => {
        window._predicciones = {};
        snap.forEach(d => window._predicciones[d.id] = d.data());
        if (typeof getRanking === 'function') {
          try { renderHome(); renderYo(); renderSala(); } catch(e){}
        }
      });
    }`
    );
  }

  // b. Modify calcP
  const oldCalcP = `function calcP(p) {
  let grp=0, elim=0;
  (draft[p]||[]).forEach((t,i)=>{if(!t)return; grp+=teamGroupPts(t); elim+=teamElimRaw(t)*(MULTS[i]||1);});
  return {grp:Math.round(grp*10)/10, elim:Math.round(elim*10)/10, total:Math.round((grp+elim)*10)/10}
}`;
  const newCalcP = `function calcP(p) {
  let grp=0, elim=0, porras=0;
  (draft[p]||[]).forEach((t,i)=>{if(!t)return; grp+=teamGroupPts(t); elim+=teamElimRaw(t)*(MULTS[i]||1);});
  
  if (window._predicciones && typeof currentPartidaJugadores !== 'undefined' && currentPartidaJugadores) {
    const uid = Object.keys(currentPartidaJugadores).find(k => currentPartidaJugadores[k].name === p);
    if (uid && window._predicciones[uid] && window._predicciones[uid].matches) {
      Object.entries(window._predicciones[uid].matches).forEach(([mId, pred]) => {
         const rm = typeof matches !== 'undefined' ? matches.find(m => String(m.id) === String(mId)) : null;
         if (rm && rm.status === 'FINISHED') {
           const rh = rm.score?.fullTime?.home;
           const ra = rm.score?.fullTime?.away;
           if (rh !== undefined && ra !== undefined) {
             if (rh === pred.h && ra === pred.a) {
               porras += 2;
             } else {
               const pdiff = pred.h - pred.a;
               const rdiff = rh - ra;
               if ((pdiff>0&&rdiff>0) || (pdiff<0&&rdiff<0) || (pdiff===0&&rdiff===0)) {
                 porras += 0.5;
               }
             }
           }
         }
      });
    }
  }

  return {grp:Math.round(grp*10)/10, elim:Math.round(elim*10)/10, porras:porras, total:Math.round((grp+elim+porras)*10)/10}
}`;
  code = code.replace(oldCalcP, newCalcP);

  // c. Render Porra Card in renderHome()
  if(code.includes('myStatusWrap.innerHTML = `')) {
    code = code.replace(
      /myStatusWrap\.innerHTML = `[\s\S]*?<\/div>`;/,
      `$&
      if(window.renderPorraCardHtml) myStatusWrap.innerHTML += window.renderPorraCardHtml();`
    );
  }

  // d. Update Yo Tab stats
  code = code.replace(
    /<div class="yo-stat"><div class="v">\$\{myScore\.elim\}<\/div><div class="l">Pts elim ×mult<\/div><\/div>/,
    `<div class="yo-stat"><div class="v">\${myScore.elim}</div><div class="l">Pts elim ×mult</div></div>
     <div class="yo-stat"><div class="v">\${myScore.porras||0}</div><div class="l">\${window.tr("porra_pts_label")}</div></div>`
  );

  // e. Add functions
  if(!code.includes('window.getPartidoDelDia')) {
    code += `\n
window.getPartidoDelDia = function() {
  if (typeof matches === 'undefined' || !matches) return null;
  const hoyMs = matches.filter(m => {
    if (!m.utcDate) return false;
    const d = new Date(m.utcDate);
    const today = new Date();
    return d.getDate()===today.getDate() && d.getMonth()===today.getMonth() && d.getFullYear()===today.getFullYear();
  });
  const candidates = hoyMs.length > 0 ? hoyMs : matches.filter(m => m.status === 'SCHEDULED' || m.status === 'TIMED');
  if (candidates.length === 0) return null;
  
  const spainMatch = candidates.find(m => m.homeTeam?.name==='Spain' || m.awayTeam?.name==='Spain');
  if(spainMatch) return spainMatch;

  const topTeams = ['France', 'Portugal', 'Argentina', 'Germany', 'England'];
  const topMatches = candidates.filter(m => topTeams.includes(m.homeTeam?.name) || topTeams.includes(m.awayTeam?.name));
  if(topMatches.length > 0) return topMatches[0];

  return candidates[0];
};

window.savePrediccion = async function(mId) {
  const hVal = document.getElementById('porra-h').value;
  const aVal = document.getElementById('porra-a').value;
  if(!hVal || !aVal) { alert(window.tr('porra_invalid')); return; }
  const h = parseInt(hVal); const a = parseInt(aVal);
  if(isNaN(h) || isNaN(a)) { alert(window.tr('porra_invalid')); return; }
  
  if(typeof window._authUser === 'undefined' || !window._authUser || typeof currentPartidaId === 'undefined' || !currentPartidaId) return;
  const docRef = window._doc(window._db, 'partidas', currentPartidaId, 'predicciones', window._authUser.uid);
  await window._setDoc(docRef, { matches: { [mId]: { h, a, ts: Date.now() } } }, { merge: true });
  alert(window.tr('porra_saved'));
};

window.renderPorraCardHtml = function() {
  const m = window.getPartidoDelDia();
  if(!m) return '';
  const isClosed = m.status === 'IN_PLAY' || m.status === 'PAUSED' || m.status === 'FINISHED';
  
  let userPred = null;
  if(typeof window._authUser !== 'undefined' && window._authUser && window._predicciones && window._predicciones[window._authUser.uid] && window._predicciones[window._authUser.uid].matches) {
    userPred = window._predicciones[window._authUser.uid].matches[m.id];
  }
  
  const hName = window.tr("country_" + (typeof nameES !== 'undefined' ? nameES(m.homeTeam?.name||'') : m.homeTeam?.name));
  const aName = window.tr("country_" + (typeof nameES !== 'undefined' ? nameES(m.awayTeam?.name||'') : m.awayTeam?.name));

  const hImg = typeof flagImg !== 'undefined' ? flagImg((typeof nameES !== 'undefined' ? nameES(m.homeTeam?.name||'') : m.homeTeam?.name), 'md') : '';
  const aImg = typeof flagImg !== 'undefined' ? flagImg((typeof nameES !== 'undefined' ? nameES(m.awayTeam?.name||'') : m.awayTeam?.name), 'md') : '';

  const hVal = userPred ? userPred.h : '';
  const aVal = userPred ? userPred.a : '';

  return \`
  <div style="background:linear-gradient(135deg, rgba(230,183,17,0.1) 0%, rgba(30,41,59,0) 100%), var(--surface);border:1px solid rgba(230,183,17,0.3);border-radius:13px;padding:1.2rem;margin-bottom:1.5rem">
    <div style="font-family:'Bebas Neue';font-size:1.4rem;color:var(--gold);letter-spacing:1px;margin-bottom:.3rem">\${window.tr("porra_title")}</div>
    <div style="font-family:'Barlow Condensed';font-size:.8rem;color:var(--muted);margin-bottom:1rem;line-height:1.3">\${window.tr("porra_desc")}</div>
    
    <div style="display:flex;align-items:center;justify-content:center;gap:1rem;background:rgba(0,0,0,0.2);padding:1rem;border-radius:9px;margin-bottom:1rem">
      <div style="display:flex;flex-direction:column;align-items:center;gap:.3rem;flex:1">
        \${hImg}
        <span style="font-family:'Barlow Condensed';font-weight:700;font-size:.9rem;text-align:center;color:var(--white)">\${hName}</span>
      </div>
      
      <div style="display:flex;align-items:center;gap:.5rem">
        <input type="number" id="porra-h" value="\${hVal}" \${isClosed?'disabled':''} style="width:45px;height:45px;text-align:center;font-family:'Bebas Neue';font-size:1.5rem;background:var(--surf2);border:1px solid var(--border);color:var(--white);border-radius:8px">
        <span style="font-family:'Barlow Condensed';color:var(--muted)">-</span>
        <input type="number" id="porra-a" value="\${aVal}" \${isClosed?'disabled':''} style="width:45px;height:45px;text-align:center;font-family:'Bebas Neue';font-size:1.5rem;background:var(--surf2);border:1px solid var(--border);color:var(--white);border-radius:8px">
      </div>
      
      <div style="display:flex;flex-direction:column;align-items:center;gap:.3rem;flex:1">
        \${aImg}
        <span style="font-family:'Barlow Condensed';font-weight:700;font-size:.9rem;text-align:center;color:var(--white)">\${aName}</span>
      </div>
    </div>
    
    \${isClosed ? 
      \`<div style="text-align:center;font-family:'Barlow Condensed';font-weight:700;color:var(--muted)">\${window.tr("porra_closed")}</div>\` : 
      \`<button class="btn btn-gold" style="width:100%" onclick="window.savePrediccion('\${m.id}')">\${window.tr("porra_save")}</button>\`
    }
  </div>\`;
};
`;
  }

  fs.writeFileSync(f, code);
});

console.log('Porras inyectadas con éxito.');
