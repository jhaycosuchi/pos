const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Crear directorio de base de datos si no existe
const dbDir = path.join(__dirname, 'database');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database('./database/pos.db');
db.pragma('journal_mode = WAL');

console.log('Inicializando base de datos...');

// Crear tabla de usuarios si no existe
try {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            rol TEXT NOT NULL DEFAULT 'mesero',
            nombre TEXT NOT NULL,
            estado INTEGER DEFAULT 1,
            creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
            actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();
    console.log('✓ Tabla usuarios creada');

    // Crear usuario admin por defecto
    const adminPassword = bcrypt.hashSync('admin123', 10);
    db.prepare(`
        INSERT OR REPLACE INTO usuarios (id, username, password, rol, nombre, estado)
        VALUES (1, 'admin', ?, 'admin', 'Administrador', 1)
    `).run(adminPassword);
    console.log('✓ Usuario admin creado (username: admin, password: admin123)');

    // Crear usuario mesero por defecto
    const meseroPassword = bcrypt.hashSync('mesero123', 10);
    db.prepare(`
        INSERT OR REPLACE INTO usuarios (id, username, password, rol, nombre, estado)
        VALUES (2, 'mesero', ?, 'mesero', 'Mesero Principal', 1)
    `).run(meseroPassword);
    console.log('✓ Usuario mesero creado (username: mesero, password: mesero123)');

} catch (error) {
    console.error('Error creando tabla usuarios:', error);
}

// Crear tabla de pedidos si no existe
try {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS pedidos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            numero_pedido TEXT UNIQUE NOT NULL,
            usuario_id INTEGER,
            mesero_id INTEGER,
            mesa_numero TEXT NOT NULL,
            comensales INTEGER DEFAULT 1,
            es_para_llevar INTEGER DEFAULT 0,
            total DECIMAL(10,2) NOT NULL,
            estado TEXT DEFAULT 'pendiente',
            creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
            actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
            FOREIGN KEY (mesero_id) REFERENCES usuarios(id)
        )
    `).run();
    console.log('✓ Tabla pedidos creada');
} catch (error) {
    console.error('Error creando tabla pedidos:', error);
}

// Crear tabla detalle_pedidos si no existe
try {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS detalle_pedidos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pedido_id INTEGER NOT NULL,
            menu_item_id INTEGER,
            producto_nombre TEXT NOT NULL,
            cantidad INTEGER NOT NULL,
            especificaciones TEXT,
            notas TEXT,
            precio_unitario DECIMAL(10,2) NOT NULL,
            subtotal DECIMAL(10,2) NOT NULL,
            creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
        )
    `).run();
    console.log('✓ Tabla detalle_pedidos creada');
} catch (error) {
    console.error('Error creando tabla detalle_pedidos:', error);
}

// Verificar que las tablas se crearon correctamente
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('\nTablas en la base de datos:', tables.map(t => t.name).join(', '));

// Verificar usuarios
const users = db.prepare('SELECT id, username, rol, nombre FROM usuarios').all();
console.log('\nUsuarios en la base de datos:');
users.forEach(user => {
    console.log(`- ID: ${user.id}, Username: ${user.username}, Rol: ${user.rol}, Nombre: ${user.nombre}`);
});

db.close();
console.log('\n✓ Base de datos inicializada correctamente');