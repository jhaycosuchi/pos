#!/usr/bin/env node

/**
 * Script para limpiar y preparar la base de datos para sincronización
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(process.cwd(), 'database', 'pos.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error:', err);
    process.exit(1);
  }

  console.log('🧹 Limpiando base de datos...\n');

  // Paso 1: Eliminar items huérfanos (sin categoría)
  db.run('DELETE FROM menu_items WHERE categoria_id NOT IN (SELECT id FROM menu_categorias)', function(err) {
    if (err) {
      console.error('Error eliminando items huérfanos:', err);
      db.close();
      return;
    }

    console.log(`✓ Items huérfanos eliminados: ${this.changes} registros`);

    // Paso 2: Eliminar categorías antiguas vacías
    db.run('DELETE FROM menu_categorias WHERE id NOT IN (SELECT DISTINCT categoria_id FROM menu_items)', function(err) {
      if (err) {
        console.error('Error eliminando categorías:', err);
        db.close();
        return;
      }

      console.log(`✓ Categorías vacías eliminadas: ${this.changes} registros`);

      // Paso 3: Verificar estado final
      db.all('SELECT COUNT(*) as total FROM menu_items', (err, result) => {
        console.log(`\n📊 Estado final:`);
        console.log(`  Items en BD: ${result[0].total}`);

        db.all('SELECT COUNT(*) as total FROM menu_categorias', (err, result) => {
          console.log(`  Categorías en BD: ${result[0].total}`);

          console.log('\n✅ Base de datos limpiada');
          console.log('\nProximo paso:');
          console.log('1. Levanta el servidor: npm run dev');
          console.log('2. Ve a http://localhost:3000/dashboard/menu');
          console.log('3. Haz click en "Sincronizar con Google Sheets"');
          console.log('4. Las imágenes deberían aparecer correctamente');

          db.close();
        });
      });
    });
  });
});
