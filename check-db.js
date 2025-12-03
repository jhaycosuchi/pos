#!/usr/bin/env node

/**
 * Script para verificar datos en la base de datos
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(process.cwd(), 'database', 'pos.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error conectando a BD:', err);
    process.exit(1);
  }

  console.log('📊 Verificando datos en base de datos...\n');

  // Verificar categorías
  db.all('SELECT * FROM menu_categorias LIMIT 5', (err, rows) => {
    if (err) {
      console.error('Error:', err);
      db.close();
      return;
    }

    console.log('📁 Categorías (primeras 5):');
    if (rows && rows.length > 0) {
      rows.forEach(row => {
        console.log(`  - ${row.nombre} (ID: ${row.id})`);
      });
    } else {
      console.log('  (sin categorías)');
    }

    // Verificar items
    db.all(
      'SELECT mi.id, mi.nombre, mi.precio, mi.imagen_url, mi.imagen_local, mc.nombre as categoria FROM menu_items mi LEFT JOIN menu_categorias mc ON mi.categoria_id = mc.id LIMIT 10',
      (err, rows) => {
        if (err) {
          console.error('Error:', err);
          db.close();
          return;
        }

        console.log('\n🍜 Items del menú (primeros 10):');
        if (rows && rows.length > 0) {
          rows.forEach(row => {
            console.log(`\n  Nombre: ${row.nombre}`);
            console.log(`  Categoría: ${row.categoria}`);
            console.log(`  Precio: $${row.precio}`);
            console.log(`  URL Google: ${row.imagen_url ? row.imagen_url.substring(0, 60) + '...' : 'N/A'}`);
            console.log(`  Ruta Local: ${row.imagen_local || 'NO TIENE'}`);
          });
        } else {
          console.log('  (sin items)');
        }

        // Contar totales
        db.get('SELECT COUNT(*) as total FROM menu_items', (err, result) => {
          if (result) {
            console.log(`\n📈 Total de items en base de datos: ${result.total}`);
          }

          db.close();
        });
      }
    );
  });
});
