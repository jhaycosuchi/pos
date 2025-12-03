import { getDb } from './db';

export async function migrateReportsTables(): Promise<void> {
  const db = await getDb();

  try {
    console.log('Iniciando migración de tablas de reportes...');

    // Tabla de ventas diarias consolidadas
    await db.exec(`
      CREATE TABLE IF NOT EXISTS ventas_diarias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha DATE UNIQUE NOT NULL,
        cantidad_pedidos INTEGER DEFAULT 0,
        venta_total DECIMAL(10,2) DEFAULT 0,
        promedio_pedido DECIMAL(10,2) DEFAULT 0,
        cantidad_clientes INTEGER DEFAULT 0,
        metodo_pago_efectivo DECIMAL(10,2) DEFAULT 0,
        metodo_pago_tarjeta DECIMAL(10,2) DEFAULT 0,
        metodo_pago_transferencia DECIMAL(10,2) DEFAULT 0,
        tipo_entrega_mesa DECIMAL(10,2) DEFAULT 0,
        tipo_entrega_llevar DECIMAL(10,2) DEFAULT 0,
        tipo_entrega_domicilio DECIMAL(10,2) DEFAULT 0,
        actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabla de ventas por producto
    await db.exec(`
      CREATE TABLE IF NOT EXISTS ventas_productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha DATE NOT NULL,
        producto_id INTEGER NOT NULL,
        cantidad INTEGER DEFAULT 0,
        ingresos DECIMAL(10,2) DEFAULT 0,
        actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(producto_id) REFERENCES productos(id),
        UNIQUE(fecha, producto_id)
      );
    `);

    // Tabla de ventas por categoría
    await db.exec(`
      CREATE TABLE IF NOT EXISTS ventas_categorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha DATE NOT NULL,
        categoria TEXT NOT NULL,
        cantidad_items INTEGER DEFAULT 0,
        ingresos DECIMAL(10,2) DEFAULT 0,
        actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(fecha, categoria)
      );
    `);

    // Tabla de KPIs mensuales
    await db.exec(`
      CREATE TABLE IF NOT EXISTS kpis_mensuales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        anio INTEGER NOT NULL,
        mes INTEGER NOT NULL,
        venta_total DECIMAL(10,2) DEFAULT 0,
        cantidad_pedidos INTEGER DEFAULT 0,
        promedio_pedido DECIMAL(10,2) DEFAULT 0,
        cantidad_clientes INTEGER DEFAULT 0,
        crecimiento_anterior DECIMAL(10,2) DEFAULT 0,
        producto_top TEXT,
        categoria_top TEXT,
        metodo_pago_preferido TEXT,
        tipo_entrega_preferido TEXT,
        actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(anio, mes)
      );
    `);

    // Tabla de performance por mesero
    await db.exec(`
      CREATE TABLE IF NOT EXISTS performance_meseros (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha DATE NOT NULL,
        usuario_id INTEGER NOT NULL,
        cantidad_pedidos INTEGER DEFAULT 0,
        venta_total DECIMAL(10,2) DEFAULT 0,
        promedio_pedido DECIMAL(10,2) DEFAULT 0,
        calificacion_promedio DECIMAL(3,2) DEFAULT 0,
        actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(usuario_id) REFERENCES usuarios(id),
        UNIQUE(fecha, usuario_id)
      );
    `);

    // Tabla de evaluaciones de pedidos (para calificaciones)
    await db.exec(`
      CREATE TABLE IF NOT EXISTS evaluaciones_pedidos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pedido_id INTEGER NOT NULL,
        calificacion INTEGER CHECK (calificacion BETWEEN 1 AND 5),
        comentario TEXT,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(pedido_id) REFERENCES pedidos(id)
      );
    `);

    // Crear índices para optimizar consultas
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_ventas_diarias_fecha ON ventas_diarias(fecha);
      CREATE INDEX IF NOT EXISTS idx_ventas_productos_fecha ON ventas_productos(fecha);
      CREATE INDEX IF NOT EXISTS idx_ventas_categorias_fecha ON ventas_categorias(fecha);
      CREATE INDEX IF NOT EXISTS idx_kpis_mensuales_anio_mes ON kpis_mensuales(anio, mes);
      CREATE INDEX IF NOT EXISTS idx_performance_meseros_fecha ON performance_meseros(fecha);
    `);

    console.log('Tablas de reportes creadas exitosamente');

  } catch (error) {
    console.error('Error en migración de reportes:', error);
    throw error;
  }
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
  migrateReportsTables()
    .then(() => {
      console.log('Migración de reportes finalizada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error en migración de reportes:', error);
      process.exit(1);
    });
}
