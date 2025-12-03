const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'pos.db');
const db = new Database(dbPath);

console.log('🔧 Inicializando base de datos completa del POS...\n');

const tables = [
  {
    name: 'usuarios',
    sql: `CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      nombre TEXT,
      rol TEXT DEFAULT 'mesero',
      activo INTEGER DEFAULT 1,
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    seed: false
  },
  {
    name: 'menu_categorias',
    sql: `CREATE TABLE IF NOT EXISTS menu_categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE,
      descripcion TEXT,
      imagen_url TEXT,
      imagen_local TEXT,
      orden INTEGER DEFAULT 0,
      activo INTEGER DEFAULT 1,
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    seed: true,
    seedData: [
      { nombre: 'Entradas', orden: 1 },
      { nombre: 'Rolls', orden: 2 },
      { nombre: 'Nigiri', orden: 3 },
      { nombre: 'Platillos', orden: 4 },
      { nombre: 'Bebidas', orden: 5 }
    ]
  },
  {
    name: 'menu_items',
    sql: `CREATE TABLE IF NOT EXISTS menu_items (
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
    )`,
    seed: false
  },
  {
    name: 'pedidos',
    sql: `CREATE TABLE IF NOT EXISTS pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_pedido TEXT NOT NULL UNIQUE,
      usuario_id INTEGER,
      mesero_id INTEGER,
      mesa_numero TEXT,
      comensales INTEGER DEFAULT 1,
      es_para_llevar INTEGER DEFAULT 0,
      cuenta_id INTEGER,
      estado TEXT DEFAULT 'pendiente',
      total DECIMAL(10,2) DEFAULT 0,
      observaciones TEXT,
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
      actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
      FOREIGN KEY (mesero_id) REFERENCES usuarios(id),
      FOREIGN KEY (cuenta_id) REFERENCES cuentas(id)
    )`,
    seed: false
  },
  {
    name: 'detalle_pedidos',
    sql: `CREATE TABLE IF NOT EXISTS detalle_pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pedido_id INTEGER NOT NULL,
      menu_item_id INTEGER,
      producto_nombre TEXT,
      cantidad INTEGER NOT NULL,
      especificaciones TEXT,
      notas TEXT,
      precio_unitario DECIMAL(10,2),
      subtotal DECIMAL(10,2),
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
      FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
    )`,
    seed: false
  },
  {
    name: 'categorias',
    sql: `CREATE TABLE IF NOT EXISTS categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE,
      descripcion TEXT,
      activo INTEGER DEFAULT 1,
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    seed: false
  },
  {
    name: 'stock',
    sql: `CREATE TABLE IF NOT EXISTS stock (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      menu_item_id INTEGER NOT NULL,
      cantidad_disponible INTEGER DEFAULT 0,
      cantidad_minima INTEGER DEFAULT 0,
      ultima_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
    )`,
    seed: false
  },
  {
    name: 'caja',
    sql: `CREATE TABLE IF NOT EXISTS caja (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      fecha_apertura DATETIME DEFAULT CURRENT_TIMESTAMP,
      fecha_cierre DATETIME,
      monto_inicial DECIMAL(10,2) DEFAULT 0,
      monto_final DECIMAL(10,2),
      total_ventas DECIMAL(10,2) DEFAULT 0,
      estado TEXT DEFAULT 'abierta',
      observaciones TEXT,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )`,
    seed: false
  },
  {
    name: 'productos',
    sql: `CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      precio DECIMAL(10,2) NOT NULL,
      costo DECIMAL(10,2),
      cantidad_stock INTEGER DEFAULT 0,
      activo INTEGER DEFAULT 1,
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    seed: false
  },
  {
    name: 'meseros',
    sql: `CREATE TABLE IF NOT EXISTS meseros (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      numero_mesero TEXT UNIQUE,
      activo INTEGER DEFAULT 1,
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )`,
    seed: false
  },
  {
    name: 'cuentas',
    sql: `CREATE TABLE IF NOT EXISTS cuentas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_cuenta TEXT NOT NULL UNIQUE,
      mesa_numero TEXT,
      mesero_id INTEGER,
      estado TEXT DEFAULT 'abierta',
      total DECIMAL(10,2) DEFAULT 0,
      fecha_apertura DATETIME DEFAULT CURRENT_TIMESTAMP,
      fecha_cierre DATETIME,
      metodo_pago TEXT,
      total_cobrado DECIMAL(10,2),
      FOREIGN KEY (mesero_id) REFERENCES usuarios(id)
    )`,
    seed: false
  },
  {
    name: 'modificaciones_pedidos',
    sql: `CREATE TABLE IF NOT EXISTS modificaciones_pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo TEXT NOT NULL,
      pedido_id INTEGER NOT NULL,
      cuenta_id INTEGER NOT NULL,
      solicitado_por TEXT NOT NULL,
      detalles TEXT,
      cambios TEXT,
      estado TEXT DEFAULT 'pendiente',
      autorizado_por TEXT,
      fecha_solicitud DATETIME DEFAULT CURRENT_TIMESTAMP,
      fecha_autorizacion DATETIME,
      FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
      FOREIGN KEY (cuenta_id) REFERENCES cuentas(id)
    )`,
    seed: false
  },
];

try {
  // Crear todas las tablas
  for (const table of tables) {
    db.exec(table.sql);
    console.log(`✅ Tabla '${table.name}' creada/verificada`);

    // Insertar datos de seed si aplica
    if (table.seed && table.seedData) {
      const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
      if (count.count === 0) {
        const stmt = db.prepare(
          `INSERT INTO ${table.name} (${Object.keys(table.seedData[0]).join(', ')}) VALUES (${Object.keys(table.seedData[0]).map(() => '?').join(', ')})`
        );

        for (const data of table.seedData) {
          stmt.run(...Object.values(data));
        }

        console.log(`   └─ ${table.seedData.length} registros de seed insertados`);
      }
    }
  }

  // Verificar y crear usuarios si no existen
  const userCount = db.prepare("SELECT COUNT(*) as count FROM usuarios").get();
  if (userCount.count === 0) {
    const bcrypt = require('bcryptjs');
    const saltRounds = 10;

    const users = [
      { username: 'admin', password: 'admin', nombre: 'Administrador', rol: 'admin' },
      { username: 'mesero', password: 'mesero', nombre: 'Mesero', rol: 'mesero' }
    ];

    const stmt = db.prepare(
      "INSERT INTO usuarios (username, password, nombre, rol) VALUES (?, ?, ?, ?)"
    );

    for (const user of users) {
      const hashedPassword = bcrypt.hashSync(user.password, saltRounds);
      stmt.run(user.username, hashedPassword, user.nombre, user.rol);
    }

    console.log(`\n✅ ${users.length} usuarios de prueba creados`);
  } else {
    console.log(`\n✅ ${userCount.count} usuarios ya existen`);
  }

  console.log('\n✨ Base de datos completamente inicializada');
  console.log('📊 Tablas creadas:', tables.length);
  console.log('\n✅ El POS está listo para usar');

  db.close();
  process.exit(0);
} catch (error) {
  console.error('❌ Error:', error.message);
  db.close();
  process.exit(1);
}
