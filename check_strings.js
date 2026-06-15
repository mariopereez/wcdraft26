const fs = require('fs');
const code = fs.readFileSync('app.js', 'utf8');

const strings = [
  'Los resultados son actualizados',
  'Bracket actualizado automaticamente',
  'Dieciseisavos',
  'Octavos',
  'sin progreso',
  'Ajustes activos',
  'mis rivales',
  'posicion',
  'mis selecciones',
  'INAUGURAL_DATE',
  'grupos',
  'elim'
];

strings.forEach(s => {
  const i = code.indexOf(s);
  console.log(s + ': ' + (i !== -1 ? 'FOUND' : 'NOT FOUND'));
});
