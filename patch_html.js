const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const oldHtml = `        <!-- Mi Estado -->
        <div id="home-my-status-wrap"></div>
        
        <!-- El Podio -->
        <div id="home-podium-wrap"></div>`;

const newHtml = `        <!-- El Podio -->
        <div class="section-title" style="margin-bottom:.7rem; margin-top:1.5rem">🏆 <span class="accent">Top</span> 3</div>
        <div id="home-podium-wrap" style="margin-bottom:1.5rem"></div>

        <!-- Mi Estado -->
        <div id="home-my-status-wrap" style="margin-bottom:1.5rem"></div>`;

code = code.replace(oldHtml, newHtml);
fs.writeFileSync('index.html', code);
console.log('index.html updated');
