const fs = require('fs');

const jsFiles = ['app.js', 'draft2026/js/app.js'];
jsFiles.forEach(f => {
  if(!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');

  // 1. Bracket names
  code = code.replace(/label:'Dieciseisavos'/g, "label:'R32'");
  code = code.replace(/label:'Octavos'/g, "label:'R16'");
  code = code.replace(/label:'Cuartos'/g, "label:'Quarter finals'");
  code = code.replace(/label:'Semifinales'/g, "label:'Semi finals'");
  code = code.replace(/label:'3er y 4o'/g, "label:'Third place'");
  code = code.replace(/label:'Final'/g, "label:'Final'");
  
  code = code.replace(/label: '🏟️ DIECISEISAVOS'/g, "label: '🏟️ R32'");
  code = code.replace(/label: '🏟️ OCTAVOS'/g, "label: '🏟️ R16'");
  code = code.replace(/label: '🏟️ CUARTOS'/g, "label: '🏟️ QUARTER FINALS'");
  code = code.replace(/label: '🏟️ SEMIFINALES'/g, "label: '🏟️ SEMI FINALS'");
  code = code.replace(/label: '🏟️ 3ER Y 4O PUESTO'/g, "label: '🏟️ THIRD PLACE'");
  code = code.replace(/label: '🏟️ FINAL'/g, "label: '🏟️ FINAL'");

  code = code.replace(
    /const stN=\{'FINAL':'🏆 Final','THIRD_PLACE':'🥉 3er','SEMI_FINALS':'Semis','QUARTER_FINALS':'Cuartos','LAST_16':'Octavos','LAST_32':'Dieciseisavos','GROUP_STAGE':'Grupos'\};/g,
    "const stN={'FINAL':'🏆 Final','THIRD_PLACE':'🥉 Third place','SEMI_FINALS':'Semi finals','QUARTER_FINALS':'Quarter finals','LAST_16':'R16','LAST_32':'R32','GROUP_STAGE':'Group stage'};"
  );

  // 2. Remove banner
  code = code.replace(
    /if\(banner\) banner\.innerHTML=`<div style="background:rgba\(74,85,104,\.1\);border:1px solid var\(--border\);border-radius:8px;padding:\.35rem \.7rem;font-size:\.7rem;color:var\(--muted\);font-family:'Barlow Condensed';margin-bottom:\.7rem">👁️ Los resultados son actualizados por la organización en tiempo real<\/div>`;/g,
    "if(banner) banner.innerHTML='';"
  );

  // 3. Translations in Yo tab
  code = code.replace(
    /Grupos: \$\{grp\} · Elim: \$\{er\}×\$\{MULTS\[i\]\|\|1\}=\$\{em\}/g,
    "${window.tr('yo_stats_grp')||'Grupos'}: ${grp} · ${window.tr('yo_stats_elim')||'Elim'}: ${er}×${MULTS[i]||1}=${em}"
  );
  code = code.replace(
    /Sin progreso eliminatorio aún/g,
    "${window.tr('yo_no_elim_progress')||'No elimination progress yet'}"
  );
  code = code.replace(
    /Posición #\$\{myRank\} de \$\{PARTICIPANTES\.length\}/g,
    "${window.tr('yo_hero_pos')||'Position'} #${myRank} ${window.tr('yo_hero_of')||'of'} ${PARTICIPANTES.length}"
  );
  
  // Canvas replacement
  code = code.replace(
    /ctx\.fillText\(`\$\{window\.tr\('yo_hero_pos'\)\|\|'Position'\} #\$\{myRank\} \$\{window\.tr\('yo_hero_of'\)\|\|'of'\} \$\{PARTICIPANTES\.length\}`/g,
    "ctx.fillText((window.tr('yo_hero_pos')||'Position') + ' #' + myRank + ' ' + (window.tr('yo_hero_of')||'of') + ' ' + PARTICIPANTES.length"
  );
  // Just in case it wasn't replaced by the previous global replace
  code = code.replace(
    /ctx\.fillText\(`Posición #\$\{myRank\} de \$\{PARTICIPANTES\.length\}`/g,
    "ctx.fillText((window.tr('yo_hero_pos')||'Position') + ' #' + myRank + ' ' + (window.tr('yo_hero_of')||'of') + ' ' + PARTICIPANTES.length"
  );

  code = code.replace(
    /<div class="section-title"><span class="accent">Mis<\/span> Rivales<\/div>/g,
    '<div class="section-title"><span class="accent">${window.tr("yo_teams_accent")||"Mis"}</span> ${window.tr("yo_rivals")||"Rivales"}</div>'
  );
  
  code = code.replace(
    /summaryEl\.textContent = `Ajustes activos: \$\{active\.join\(' '\)\}`;/g,
    "summaryEl.textContent = `${window.tr('yo_active_settings')||'Ajustes activos:'} ${active.join(' ')}`;"
  );

  // 4. Countdown fix
  code = code.replace(
    /const INAUGURAL_DATE = new Date\('2026-06-11T18:00:00Z'\);/g,
    "const INAUGURAL_DATE = new Date('2026-06-11T19:00:00Z');"
  );
  // In draft.txt and other files? Let's just fix it globally here
  fs.writeFileSync(f, code);
});

// Update index.html
const htmlFiles = ['index.html', 'draft2026/index.html'];
htmlFiles.forEach(f => {
  if(!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');
  
  code = code.replace(
    /<div class="notice warn">Bracket actualizado automáticamente desde la API<\/div>/g,
    ""
  );

  code = code.replace(
    /<div class="section-title" style="margin-bottom:\.7rem"><span class="accent">Mis<\/span> Selecciones<\/div>/g,
    '<div class="section-title" style="margin-bottom:.7rem"><span class="accent" data-i18n="yo_teams_accent">Mis</span> <span data-i18n="yo_teams_title">Selecciones</span></div>'
  );

  fs.writeFileSync(f, code);
});

// Update translations.js
const transFiles = ['js/translations.js', 'draft2026/js/translations.js'];
transFiles.forEach(f => {
  if(!fs.existsSync(f)) return;
  let t = fs.readFileSync(f, 'utf8');
  if(!t.includes('yo_no_elim_progress:')) {
    t = t.replace(/yo_teams_none: "No tienes selecciones asignadas aún",/g, 'yo_teams_none: "No tienes selecciones asignadas aún",\n    yo_no_elim_progress: "Sin progreso eliminatorio aún",\n    yo_rivals: "Rivales",\n    yo_active_settings: "Ajustes activos:",\n    yo_stats_grp: "Grupos",\n    yo_stats_elim: "Elim",');
    
    // English replacements
    t = t.replace(/yo_teams_none: "You don't have any teams yet",/g, 'yo_teams_none: "You don\'t have any teams yet",\n    yo_no_elim_progress: "No elimination progress yet",\n    yo_rivals: "Rivals",\n    yo_active_settings: "Active settings:",\n    yo_stats_grp: "Groups",\n    yo_stats_elim: "Elim",');
    fs.writeFileSync(f, t);
  }
});

console.log('UI Patches applied successfully.');
