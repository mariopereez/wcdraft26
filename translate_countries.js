const fs = require('fs');

const blockEs = `
    bracket_tbd: "Por determinar",
`;
const blockEn = `
    bracket_tbd: "TBD",
`;

let trans = fs.readFileSync('js/translations.js', 'utf8');
trans = trans.replace(/nav_home: "Inicio",/g, blockEs + ' nav_home: "Inicio",');
trans = trans.replace(/nav_home: "Home",/g, blockEn + ' nav_home: "Home",');
fs.writeFileSync('js/translations.js', trans);
fs.writeFileSync('draft2026/js/translations.js', trans);

const files = ['app.js', 'draft2026/js/app.js'];
files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');

  // Match: Por determinar
  code = code.replace(/Por determinar/g, '${window.tr("bracket_tbd")}');

  // Match: renderRes() "Por equipo"
  code = code.replace(/<span>\$\{opp\}<\/span>/g, '<span>${window.tr("country_" + opp)}</span>');
  
  // Match: Bracket
  code = code.replace(/\$\{flagImg\(h\)\} \$\{h\}/g, '${flagImg(h)} ${window.tr("country_" + h)}');
  code = code.replace(/\$\{flagImg\(a\)\} \$\{a\}/g, '${flagImg(a)} ${window.tr("country_" + a)}');

  // Match: Admin matches
  code = code.replace(/<span>\$\{m\.home\}<\/span>/g, '<span>${window.tr("country_" + m.home)}</span>');
  code = code.replace(/<span>\$\{m\.away\}<\/span>/g, '<span>${window.tr("country_" + m.away)}</span>');

  // Match: Clasificacion teams
  code = code.replace(/>\$\{t\}</g, '>${window.tr("country_" + t)}<');
  
  // Match: "Todos" in renderRes daily loop
  code = code.replace(/<span style="font-family:'Barlow Condensed';font-weight:700;font-size:.9rem">\$\{h\}<\/span>/g, '<span style="font-family:\\\'Barlow Condensed\\\';font-weight:700;font-size:.9rem">${window.tr("country_" + h)}</span>');
  code = code.replace(/<span style="font-family:'Barlow Condensed';font-weight:700;font-size:.9rem">\$\{a\}<\/span>/g, '<span style="font-family:\\\'Barlow Condensed\\\';font-weight:700;font-size:.9rem">${window.tr("country_" + a)}</span>');
  
  // Actually, I'll just use a safer regex for h and a if they are followed by '</span>'
  code = code.replace(/>\$\{h\}<\/span>/g, '>${window.tr("country_" + h)}</span>');
  code = code.replace(/>\$\{a\}<\/span>/g, '>${window.tr("country_" + a)}</span>');

  fs.writeFileSync(f, code);
});
console.log('Country names in renders updated successfully.');
