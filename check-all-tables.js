const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/pos.db');

// Listar todas las tablas
db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", (err, rows) => {
  if(err) {
    console.error('Error:', err);
  } else {
    console.log('Tablas en la base de datos:');
    rows.forEach(r => console.log('  ' + r.name));
  }
  
  // Después verificar si hay foreign keys en detalle_pedidos
  console.log('\nForeign keys de detalle_pedidos:');
  db.all('PRAGMA foreign_key_list(detalle_pedidos)', (err, rows) => {
    if(err) {
      console.error('Error:', err);
    } else {
      if(rows.length === 0) {
        console.log('  No hay foreign keys definidas');
      } else {
        rows.forEach(r => console.log('  Column ' + r.from + ' -> ' + r.table + '(' + r.to + ')'));
      }
    }
    db.close();
  });
});
