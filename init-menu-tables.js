const Database = require('better-sqlite3');
const path = require('path');

// Crear o abrir la base de datos
const dbPath = path.join(__dirname, 'database', 'pos.db');
const db = new Database(dbPath);

console.log('🔧 Inicializando tablas de menú...\n');

// Crear tabla menu_categorias
const createCategorias = `
CREATE TABLE IF NOT EXISTS menu_categorias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  imagen_url TEXT,
  imagen_local TEXT,
  orden INTEGER DEFAULT 0,
  activo INTEGER DEFAULT 1,
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
)
`;

// Crear tabla menu_items actualizada
const createMenuItems = `
CREATE TABLE IF NOT EXISTS menu_items_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  categoria_id INTEGER,
  imagen_url TEXT,
  imagen_local TEXT,
  disponible INTEGER DEFAULT 1,
  activo INTEGER DEFAULT 1,
  nuevo INTEGER DEFAULT 0,
  vegetariano INTEGER DEFAULT 0,
  picante INTEGER DEFAULT 0,
  favorito INTEGER DEFAULT 0,
  destacado INTEGER DEFAULT 0,
  promomiercoles INTEGER DEFAULT 0,
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES menu_categorias(id)
)
`;

try {
  // Crear tabla categorías
  db.exec(createCategorias);
  console.log('✅ Tabla menu_categorias creada/verificada');

  // Migrar datos de menu_items si existen
  const itemsExist = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='menu_items'").get();
  
  if (itemsExist) {
    // Verificar si menu_items_new ya existe
    const newItemsExist = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='menu_items_new'").get();
    
    if (!newItemsExist) {
      // Crear tabla nueva
      db.exec(createMenuItems);
      
      // Copiar datos de la tabla antigua
      db.exec(`
        INSERT INTO menu_items_new 
        SELECT id, nombre, descripcion, precio, categoria_id, imagen_url, NULL, disponible, 1, 0, 0, 0, 0, 0, 0, creado_en
        FROM menu_items
      `);
      
      // Eliminar tabla antigua
      db.exec('DROP TABLE menu_items');
      
      // Renombrar tabla nueva
      db.exec('ALTER TABLE menu_items_new RENAME TO menu_items');
      
      console.log('✅ Tabla menu_items migrada con nuevas columnas');
    } else {
      console.log('✅ Tabla menu_items_new ya existe');
    }
  } else {
    // Crear tabla desde cero si no existe
    db.exec(createMenuItems);
    console.log('✅ Tabla menu_items creada');
  }

  // Insertar categorías de ejemplo
  const categoriaCount = db.prepare("SELECT COUNT(*) as count FROM menu_categorias").get();
  
  if (categoriaCount.count === 0) {
    const categorias = [
      { nombre: 'Entradas', orden: 1 },
      { nombre: 'Rolls', orden: 2 },
      { nombre: 'Nigiri', orden: 3 },
      { nombre: 'Platillos', orden: 4 },
      { nombre: 'Bebidas', orden: 5 }
    ];
    
    const stmt = db.prepare("INSERT INTO menu_categorias (nombre, orden) VALUES (?, ?)");
    
    for (const cat of categorias) {
      stmt.run(cat.nombre, cat.orden);
    }
    
    console.log(`✅ ${categorias.length} categorías de ejemplo insertadas`);
  } else {
    console.log(`✅ ${categoriaCount.count} categorías existentes`);
  }

  // Verificar tabla productos
  const itemsCount = db.prepare("SELECT COUNT(*) as count FROM menu_items").get();
  console.log(`✅ ${itemsCount.count} productos en la base de datos`);

  console.log('\n✨ Tablas de menú inicializadas correctamente');
  
  db.close();
  process.exit(0);
  
} catch (error) {
  console.error('❌ Error:', error.message);
  db.close();
  process.exit(1);
}
