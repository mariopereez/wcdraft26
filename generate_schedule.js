const fs = require('fs');
const code = fs.readFileSync('app.js', 'utf8');

const s = code.indexOf('function buildInitialAdminMatches() {');
const e = code.indexOf('return data;', s) + 12;
const fnCode = code.substring(s, e) + '\n}';

const groupsMatch = code.match(/const GROUPS = \{[\s\S]*?\};/);
const koMatch = code.match(/const KNOCKOUT_PHASES = \[[^\]]+\];/);

const script = `
${groupsMatch ? groupsMatch[0] : ''}
${koMatch ? koMatch[0] : ''}
${fnCode}
const data = buildInitialAdminMatches();

const groupMatches = [];
Object.keys(data.groups).forEach(g => {
  data.groups[g].forEach(m => {
    groupMatches.push({
      date: new Date(m.date),
      home: m.home,
      away: m.away
    });
  });
});

groupMatches.sort((a,b) => a.date - b.date);

const byDay = {};
groupMatches.forEach(m => {
  const dStr = m.date.toISOString().split('T')[0];
  if(!byDay[dStr]) byDay[dStr] = [];
  byDay[dStr].push(m);
});

const topTeams = ['France', 'Portugal', 'Argentina', 'Germany', 'England'];

const schedule = [];
Object.keys(byDay).sort().forEach(day => {
  const dayMatches = byDay[day];
  const spainMatch = dayMatches.find(m => m.home === 'Spain' || m.away === 'Spain');
  let chosen = null;
  if (spainMatch) {
    chosen = spainMatch;
  } else {
    const topMatches = dayMatches.filter(m => topTeams.includes(m.home) || topTeams.includes(m.away));
    if (topMatches.length > 0) chosen = topMatches[0];
    else chosen = dayMatches[0];
  }
  schedule.push(\`- **\${day}**: \${chosen.home} vs \${chosen.away}\`);
});

fs.writeFileSync('schedule.txt', schedule.join('\\n'));
`;

fs.writeFileSync('schedule_gen.js', script);
