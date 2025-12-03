import { getDb } from '../lib/db';

function migratePedidosTable() {
  const db = getDb();

  try {
    console.log('Verificando estructura de tabla pedidos...');

    // Verificar y agregar columnas si no existen
    const info = db.prepare("PRAGMA table_info(pedidos)").all() as any[];
    const columnNames = info.map((col: any) => col.name);

    // Agregar columnas faltantes
    if (!columnNames.includes('mesero_id')) {
      db.prepare(`ALTER TABLE pedidos ADD COLUMN mesero_id INTEGER REFERENCES usuarios(id)`).run();
      console.log('Agregada columna mesero_id');
    }

    if (!columnNames.includes('mesa_numero')) {
      db.prepare(`ALTER TABLE pedidos ADD COLUMN mesa_numero INTEGER`).run();
      console.log('Agregada columna mesa_numero');
    }

    if (!columnNames.includes('comensales')) {
      db.prepare(`ALTER TABLE pedidos ADD COLUMN comensales INTEGER DEFAULT 1`).run();
      console.log('Agregada columna comensales');
    }

    if (!columnNames.includes('es_para_llevar')) {
      db.prepare(`ALTER TABLE pedidos ADD COLUMN es_para_llevar BOOLEAN DEFAULT 0`).run();
      console.log('Agregada columna es_para_llevar');
    }

    if (!columnNames.includes('estado')) {
      db.prepare(
        `ALTER TABLE pedidos ADD COLUMN estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'preparacion', 'listo', 'entregado', 'cancelado'))`
      ).run();
      console.log('Agregada columna estado');
    }

    if (!columnNames.includes('actualizado_en')) {
      db.prepare(`ALTER TABLE pedidos ADD COLUMN actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP`).run();
      console.log('Agregada columna actualizado_en');
    }

    // Ahora actualizar detalle_pedidos para usar menu_item_id en lugar de producto_id
    const detalleInfo = db.prepare("PRAGMA table_info(detalle_pedidos)").all() as any[];
    const detalleColumnNames = detalleInfo.map((col: any) => col.name);

    if (!detalleColumnNames.includes('menu_item_id')) {
      db.prepare(`ALTER TABLE detalle_pedidos ADD COLUMN menu_item_id INTEGER REFERENCES menu_items(id)`).run();
      console.log('Agregada columna menu_item_id a detalle_pedidos');
    }

    if (!detalleColumnNames.includes('especificaciones')) {
      db.prepare(`ALTER TABLE detalle_pedidos ADD COLUMN especificaciones TEXT`).run();
      console.log('Agregada columna especificaciones a detalle_pedidos');
    }

    if (!detalleColumnNames.includes('notas')) {
      db.prepare(`ALTER TABLE detalle_pedidos ADD COLUMN notas TEXT`).run();
      console.log('Agregada columna notas a detalle_pedidos');
    }

    console.log('Migración de pedidos completada');

  } catch (error) {
    console.error('Error en migración de pedidos:', error);
    throw error;
  }
}

export { migratePedidosTable };
