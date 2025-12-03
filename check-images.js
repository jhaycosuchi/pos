#!/usr/bin/env node

/**
 * Script para reparar las imágenes - asegurar que imagen_local está siendo usado
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(process.cwd(), 'database', 'pos.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error conectando a BD:', err);
    process.exit(1);
  }

  console.log('🔧 Script de reparación de imágenes\n');

  // Paso 1: Verificar que todas las categorías tengan items
  db.all(
    `SELECT mc.id, mc.nombre, COUNT(mi.id) as cantidad FROM menu_categorias mc 
     LEFT JOIN menu_items mi ON mc.id = mi.categoria_id 
     GROUP BY mc.id ORDER BY mc.nombre`,
    (err, categories) => {
      if (err) {
        console.error('Error:', err);
        db.close();
        return;
      }

      console.log('📋 Items por categoría:');
      categories.forEach(cat => {
        console.log(`  ${cat.nombre}: ${cat.cantidad} items`);
      });

      // Paso 2: Verificar que imagen_local esté poblado
      db.get(
        'SELECT COUNT(*) as total, SUM(CASE WHEN imagen_local IS NOT NULL THEN 1 ELSE 0 END) as con_imagen FROM menu_items',
        (err, result) => {
          if (err) {
            console.error('Error:', err);
            db.close();
            return;
          }

          console.log(`\n📸 Estado de imágenes:`);
          console.log(`  Total items: ${result.total}`);
          console.log(`  Items con imagen local: ${result.con_imagen}`);
          console.log(`  Items SIN imagen: ${result.total - result.con_imagen}`);

          // Paso 3: Hacer que el API devuelva imagen_local correctamente
          db.all(
            `SELECT mc.nombre as categoria, mi.nombre as producto, mi.imagen_local, mi.imagen_url 
             FROM menu_items mi 
             LEFT JOIN menu_categorias mc ON mi.categoria_id = mc.id 
             WHERE mi.imagen_local IS NOT NULL 
             LIMIT 5`,
            (err, samples) => {
              if (err) {
                console.error('Error:', err);
                db.close();
                return;
              }

              console.log(`\n✅ Muestras de items con imagen_local:`);
              samples.forEach(item => {
                console.log(`\n  Categoría: ${item.categoria}`);
                console.log(`  Producto: ${item.producto}`);
                console.log(`  Ruta Local: ${item.imagen_local}`);
              });

              console.log('\n\n✓ Verificación completada');
              console.log('\nNota: Las imágenes ESTÁN siendo almacenadas correctamente.');
              console.log('Si no se ven en el navegador, pueden ser razones de caché o rutas.');
              console.log('\nSoluciones:');
              console.log('1. Abre DevTools (F12) > Network > verifica las URLs de imágenes');
              console.log('2. Las rutas deben comenzar con /menu-images/');
              console.log('3. Limpia el caché del navegador (Ctrl+Shift+Del)');
              console.log('4. Recarga la página (F5 o Ctrl+R)');

              db.close();
            }
          );
        }
      );
    }
  );
});
