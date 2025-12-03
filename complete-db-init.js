const Database = require('better-sqlite3');
const db = new Database('./database/pos.db');

console.log('Creando tablas faltantes...');

// Crear tabla menu_items si no existe
try {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS menu_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            descripcion TEXT,
            precio DECIMAL(10,2) NOT NULL,
            categoria_id INTEGER,
            imagen_url TEXT,
            disponible INTEGER DEFAULT 1,
            creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();
    console.log('✓ Tabla menu_items creada');
} catch (error) {
    console.error('Error:', error);
}

// Crear tabla categorias si no existe
try {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS categorias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT UNIQUE NOT NULL,
            descripcion TEXT,
            creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();
    console.log('✓ Tabla categorias creada');
} catch (error) {
    console.error('Error:', error);
}

// Crear tabla stock si no existe
try {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS stock (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            producto_id INTEGER NOT NULL,
            cantidad INTEGER DEFAULT 0,
            cantidad_minima INTEGER DEFAULT 0,
            actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (producto_id) REFERENCES menu_items(id)
        )
    `).run();
    console.log('✓ Tabla stock creada');
} catch (error) {
    console.error('Error:', error);
}

// Verificar tablas creadas
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('\nTablas en la base de datos:', tables.map(t => t.name).join(', '));

db.close();
console.log('\n✓ Base de datos completada');
