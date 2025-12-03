const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'pos.db');
const db = new sqlite3.Database(dbPath);

// Verificar estructura de detalle_pedidos
db.all("PRAGMA table_info(detalle_pedidos)", (err, rows) => {
  if (err) {
    console.error('Error:', err);
    process.exit(1);
  }
  
  console.log('Estructura actual de detalle_pedidos:');
  rows.forEach(row => {
    console.log(`  ${row.name}: ${row.type} (nullable: ${!row.notnull})`);
  });
  
  db.close();
  process.exit(0);
});
