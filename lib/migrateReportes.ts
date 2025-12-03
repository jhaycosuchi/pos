import { getDb } from '../lib/db';

function migrateReportesTables() {
  const db = getDb();

  try {
    console.log('Iniciando migración de tablas de reportes...');

    // Crear tabla de KPIs mensuales
    db.prepare(`
      CREATE TABLE IF NOT EXISTS kpis_mensuales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mes INTEGER NOT NULL,
        anio INTEGER NOT NULL,
        total_pedidos INTEGER DEFAULT 0,
        total_ventas DECIMAL(12,2) DEFAULT 0,
        ticket_promedio DECIMAL(10,2) DEFAULT 0,
        pedidos_completados INTEGER DEFAULT 0,
        pedidos_cancelados INTEGER DEFAULT 0,
        tiempo_promedio_pedido INTEGER DEFAULT 0,
        creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
        actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(mes, anio)
      )
    `).run();

    // Crear tabla de evaluaciones de pedidos
    db.prepare(`
      CREATE TABLE IF NOT EXISTS evaluaciones_pedidos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pedido_id INTEGER NOT NULL,
        mesero_id INTEGER NOT NULL,
        cliente_id INTEGER,
        calificacion INTEGER DEFAULT 5,
        comentario TEXT,
        velocidad_servicio INTEGER DEFAULT 5,
        calidad_comida INTEGER DEFAULT 5,
        amabilidad INTEGER DEFAULT 5,
        creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(pedido_id) REFERENCES pedidos(id),
        FOREIGN KEY(mesero_id) REFERENCES usuarios(id)
      )
    `).run();

    // Crear tabla de ventas por producto
    db.prepare(`
      CREATE TABLE IF NOT EXISTS ventas_productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        menu_item_id INTEGER NOT NULL,
        cantidad_vendida INTEGER DEFAULT 0,
        ingresos_totales DECIMAL(12,2) DEFAULT 0,
        mes INTEGER NOT NULL,
        anio INTEGER NOT NULL,
        creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(menu_item_id) REFERENCES menu_items(id),
        UNIQUE(menu_item_id, mes, anio)
      )
    `).run();

    // Crear tabla de performance de meseros
    db.prepare(`
      CREATE TABLE IF NOT EXISTS performance_meseros (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mesero_id INTEGER NOT NULL,
        mes INTEGER NOT NULL,
        anio INTEGER NOT NULL,
        pedidos_totales INTEGER DEFAULT 0,
        calificacion_promedio DECIMAL(3,2) DEFAULT 0,
        velocidad_promedio DECIMAL(3,2) DEFAULT 0,
        calidad_promedio DECIMAL(3,2) DEFAULT 0,
        amabilidad_promedio DECIMAL(3,2) DEFAULT 0,
        ingresos_generados DECIMAL(12,2) DEFAULT 0,
        creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
        actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(mesero_id) REFERENCES usuarios(id),
        UNIQUE(mesero_id, mes, anio)
      )
    `).run();

    console.log('Tablas de reportes creadas exitosamente');
    console.log('Migración de reportes completada');

  } catch (error) {
    console.error('Error en migración de reportes:', error);
    throw error;
  }
}

export { migrateReportesTables };
