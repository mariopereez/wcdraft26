const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Find the start of the sections we want to replace
let start = html.indexOf('<!-- El Podio -->');
if (start === -1) start = html.indexOf('<!-- Mi Estado -->');

const end = html.indexOf('<!-- Partidos Calientes -->');

const newLayout = `<!-- El Podio -->
        <div class="section-title" style="margin-bottom:.7rem; margin-top:1.5rem">🏆 <span class="accent">Top</span> 3</div>
        <div id="home-podium-wrap" style="margin-bottom:1.5rem"></div>

        <!-- Mi Estado -->
        <div id="home-my-status-wrap" style="margin-bottom:1.5rem"></div>

        <!-- Partido del Dia -->
        <div id="home-match-day-wrap" style="margin-bottom:1.5rem"></div>

        `;

html = html.substring(0, start) + newLayout + html.substring(end);
fs.writeFileSync('index.html', html);
console.log('index.html updated successfully.');
