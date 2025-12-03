const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../database/pos.db');
const schemaPath = path.join(__dirname, '../database/schema.sql');

// Crear directorio si no existe
if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

const db = new sqlite3.Database(dbPath);

console.log('Inicializando base de datos...');

fs.readFile(schemaPath, 'utf8', (err, sql) => {
  if (err) {
    console.error('Error leyendo schema:', err);
    return;
  }

  db.exec(sql, (err) => {
    if (err) {
      console.error('Error ejecutando schema:', err);
      return;
    }
    console.log('Base de datos inicializada correctamente');
    db.close();
  });
});