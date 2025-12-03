const Database = require('better-sqlite3');

const db = new Database('./database/pos.db');

const mesas = [
  { numero: 1, capacidad: 2, ubicacion: 'Ventana 1' },
  { numero: 2, capacidad: 2, ubicacion: 'Ventana 2' },
  { numero: 3, capacidad: 4, ubicacion: 'Centro 1' },
  { numero: 4, capacidad: 4, ubicacion: 'Centro 2' },
  { numero: 5, capacidad: 4, ubicacion: 'Centro 3' },
  { numero: 6, capacidad: 6, ubicacion: 'Fondo 1' },
  { numero: 7, capacidad: 6, ubicacion: 'Fondo 2' },
  { numero: 8, capacidad: 4, ubicacion: 'Bar 1' },
  { numero: 9, capacidad: 2, ubicacion: 'Bar 2' },
  { numero: 10, capacidad: 8, ubicacion: 'Salón privado' },
  { numero: 11, capacidad: 2, ubicacion: 'Entrada' },
  { numero: 12, capacidad: 4, ubicacion: 'Centro 4' },
  { numero: 13, capacidad: 4, ubicacion: 'Centro 5' },
  { numero: 14, capacidad: 6, ubicacion: 'Fondo 3' },
  { numero: 15, capacidad: 2, ubicacion: 'Terraza 1' },
  { numero: 16, capacidad: 2, ubicacion: 'Terraza 2' },
  { numero: 17, capacidad: 4, ubicacion: 'Terraza 3' },
  { numero: 18, capacidad: 6, ubicacion: 'Terraza 4' },
  { numero: 19, capacidad: 8, ubicacion: 'Salón grande' },
  { numero: 20, capacidad: 4, ubicacion: 'Esquina' }
];

const stmt = db.prepare(
  'INSERT OR IGNORE INTO mesas (numero, capacidad, estado, ubicacion) VALUES (?, ?, ?, ?)'
);

console.log('Poblando mesas...');
let count = 0;
mesas.forEach(mesa => {
  const result = stmt.run(mesa.numero, mesa.capacidad, 'disponible', mesa.ubicacion);
  if (result.changes) {
    console.log(`✓ Mesa ${mesa.numero} - Capacidad: ${mesa.capacidad} - ${mesa.ubicacion}`);
    count++;
  }
});

console.log(`\n✅ ${count} mesas creadas exitosamente`);
db.close();
