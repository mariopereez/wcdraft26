const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The file got messed up with multiple duplicate IDs. 
// We will manually chop from the first <!-- Mi Estado --> to <!-- Partidos Calientes -->
const s1 = html.indexOf('<!-- Mi Estado -->');
const end = html.indexOf('<!-- Partidos Calientes -->');

const newLayout = `<!-- El Podio -->
        <div id="home-podium-wrap" style="margin-bottom:1.5rem; margin-top: 1.5rem"></div>

        <!-- Mi Estado -->
        <div id="home-my-status-wrap" style="margin-bottom:1.5rem"></div>

        <!-- Partido del Dia -->
        <div id="home-match-day-wrap" style="margin-bottom:1.5rem"></div>

        `;

html = html.substring(0, s1) + newLayout + html.substring(end);
fs.writeFileSync('index.html', html);
console.log('Fixed index.html structure');
