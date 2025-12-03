#!/usr/bin/env node

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(process.cwd(), 'database', 'pos.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error:', err);
    process.exit(1);
  }

  console.log('🔍 Verificando categoría_id en items...\n');

  db.all('SELECT DISTINCT categoria_id FROM menu_items ORDER BY categoria_id', (err, rows) => {
    if (err) {
      console.error('Error:', err);
      db.close();
      return;
    }

    console.log('categoria_id únicos en menu_items:');
    rows.forEach(row => {
      console.log(`  - ${row.categoria_id}`);
    });

    db.all('SELECT id, nombre FROM menu_categorias ORDER BY id', (err, cats) => {
      if (err) {
        console.error('Error:', err);
        db.close();
        return;
      }

      console.log('\nID de categorías en menu_categorias:');
      cats.forEach(cat => {
        console.log(`  - ID ${cat.id}: ${cat.nombre}`);
      });

      console.log('\n✓ Conclusión:');
      const itemCats = rows.map(r => r.categoria_id);
      const dbCats = cats.map(c => c.id);
      
      const missing = itemCats.filter(x => !dbCats.includes(x));
      if (missing.length > 0) {
        console.log(`  ⚠️  Items con categoria_id que NO existen: ${missing.join(', ')}`);
        console.log('  Solución: Necesitamos ejecutar una sincronización completa');
      } else {
        console.log('  ✓ Todos los items tienen categorías válidas');
      }

      db.close();
    });
  });
});
