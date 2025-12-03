import { getDb } from '../lib/db';

function migrateMenuTables() {
  const db = getDb();

  try {
    console.log('Iniciando migración de tablas del menú...');

    // Crear tabla de categorías del menú
    db.prepare(`
      CREATE TABLE IF NOT EXISTS menu_categorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT UNIQUE NOT NULL,
        orden INTEGER DEFAULT 0,
        activo BOOLEAN DEFAULT 1,
        creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    // Crear tabla de items del menú
    db.prepare(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        categoria_id INTEGER NOT NULL,
        nombre TEXT NOT NULL,
        descripcion TEXT,
        precio DECIMAL(10,2) NOT NULL,
        imagen_url TEXT,
        imagen_local TEXT,
        nuevo BOOLEAN DEFAULT 0,
        vegetariano BOOLEAN DEFAULT 0,
        picante BOOLEAN DEFAULT 0,
        favorito BOOLEAN DEFAULT 0,
        destacado BOOLEAN DEFAULT 0,
        promomiercoles BOOLEAN DEFAULT 0,
        activo BOOLEAN DEFAULT 1,
        ultima_sync DATETIME DEFAULT CURRENT_TIMESTAMP,
        creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
        actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(categoria_id) REFERENCES menu_categorias(id),
        UNIQUE(categoria_id, nombre)
      )
    `).run();

    // Crear tabla de control de stock (productos fuera de disponibilidad)
    db.prepare(`
      CREATE TABLE IF NOT EXISTS item_stock (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        menu_item_id INTEGER NOT NULL,
        disponible BOOLEAN DEFAULT 1,
        razon TEXT,
        marcado_por INTEGER,
        fecha_marcado DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_expiracion DATETIME,
        creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(menu_item_id) REFERENCES menu_items(id),
        FOREIGN KEY(marcado_por) REFERENCES usuarios(id),
        UNIQUE(menu_item_id)
      )
    `).run();

    console.log('Tablas del menú creadas exitosamente');

    // Insertar categorías por defecto
    const categoriasDefault = [
      'Entradas',
      'Arroces',
      'Rollos_Naturales',
      'Rollos_Empanizados',
      'Rollos_Especiales',
      'Rollos_Horneados',
      'Bebidas',
      'Postres',
      'Extras'
    ];

    const insertStmt = db.prepare('INSERT OR IGNORE INTO menu_categorias (nombre, orden) VALUES (?, ?)');
    
    for (let i = 0; i < categoriasDefault.length; i++) {
      insertStmt.run(categoriasDefault[i], i);
    }

    console.log('Categorías por defecto insertadas');

    console.log('Migración completada exitosamente');

  } catch (error) {
    console.error('Error en migración:', error);
    throw error;
  }
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
  try {
    migrateMenuTables();
    console.log('Migración finalizada');
    process.exit(0);
  } catch (error) {
    console.error('Error en migración:', error);
    process.exit(1);
  }
}

export { migrateMenuTables };