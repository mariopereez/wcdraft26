const fs = require('fs');

// 1. Fix app.js
const jsFiles = ['app.js', 'draft2026/js/app.js'];
jsFiles.forEach(f => {
  if(!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');

  // SIM_STAGES array to getSimStages() function
  const oldSim = `const SIM_STAGES = [
  {value:'none',label:window.tr('sim_none')||'No advance'},
  {value:'r16',label:(window.tr('sim_r16')||'R32')+' (5 pts)'},
  {value:'r8',label:(window.tr('sim_r8')||'R16')+' (+8)'},
  {value:'r4',label:(window.tr('sim_r4')||'Quarter finals')+' (+10)'},
  {value:'semi',label:(window.tr('sim_semi')||'Semi finals')+' (+11)'},
  {value:'final',label:(window.tr('sim_final')||'Finalist')+' (+12)'},
  {value:'ganador',label:(window.tr('sim_winner')||'🥇 Winner')+' (+10)'}
];`;
  
  const newSim = `const getSimStages = () => [
  {value:'none',label:window.tr('sim_none')||'No advance'},
  {value:'r16',label:(window.tr('sim_r16')||'R32')+' (5 pts)'},
  {value:'r8',label:(window.tr('sim_r8')||'R16')+' (+8)'},
  {value:'r4',label:(window.tr('sim_r4')||'Quarter finals')+' (+10)'},
  {value:'semi',label:(window.tr('sim_semi')||'Semi finals')+' (+11)'},
  {value:'final',label:(window.tr('sim_final')||'Finalist')+' (+12)'},
  {value:'ganador',label:(window.tr('sim_winner')||'🥇 Winner')+' (+10)'}
];`;

  code = code.replace(oldSim, newSim);
  code = code.replace(/SIM_STAGES\.map\(/g, "getSimStages().map(");

  // Fix hardcoded elimination tags
  const oldTags = "if(r.r16)st.push('16avos');if(r.r8)st.push('Octavos');if(r.r4)st.push('Cuartos');if(r.semi)st.push('Semis');if(r.final)st.push('Final');if(r.ganador)st.push('🥇 CAMPEÓN');";
  const newTags = "if(r.r16)st.push(window.tr('sim_r16')||'R32');if(r.r8)st.push(window.tr('sim_r8')||'R16');if(r.r4)st.push(window.tr('sim_r4')||'Quarter finals');if(r.semi)st.push(window.tr('sim_semi')||'Semi finals');if(r.final)st.push(window.tr('sim_final')||'Finalist');if(r.ganador)st.push(window.tr('sim_winner')||'🥇 Winner');";
  
  code = code.replace(oldTags, newTags);

  // One more thing just to ensure the translation works correctly, if 'yo_active_settings' wasn't picking up because of timing, making the dictionary bust cache is enough.
  fs.writeFileSync(f, code);
});

// 2. Fix sw.js
const swFiles = ['sw.js', 'draft2026/sw.js'];
swFiles.forEach(f => {
  if(!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');
  
  code = code.replace(/draft2026-v2/g, 'draft2026-v3');
  
  fs.writeFileSync(f, code);
});

console.log('App logic and cache buster applied.');
