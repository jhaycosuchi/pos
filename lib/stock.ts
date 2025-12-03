import { getDb } from './db';

export interface ItemStock {
  id: number;
  menu_item_id: number;
  disponible: boolean;
  razon: string | null;
  marcado_por: number | null;
  fecha_marcado: string;
  fecha_expiracion: string | null;
}

/**
 * Marcar un producto como fuera de stock
 */
export async function marcarFueraDeStock(
  menu_item_id: number,
  razon: string = 'Temporalmente no disponible',
  duracion_horas: number = 24,
  usuario_id?: number
): Promise<void> {
  const db = await getDb();

  try {
    const fecha_expiracion = new Date();
    fecha_expiracion.setHours(fecha_expiracion.getHours() + duracion_horas);

    await db.run(
      `INSERT OR REPLACE INTO item_stock (
        menu_item_id, disponible, razon, marcado_por, fecha_expiracion
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        menu_item_id,
        0, // no disponible
        razon,
        usuario_id || null,
        fecha_expiracion.toISOString()
      ]
    );

    console.log(`Producto ${menu_item_id} marcado como fuera de stock hasta ${fecha_expiracion.toISOString()}`);
  } catch (error) {
    console.error('Error marcando producto como fuera de stock:', error);
    throw error;
  }
}

/**
 * Restaurar disponibilidad de un producto
 */
export async function restaurarStock(menu_item_id: number): Promise<void> {
  const db = await getDb();

  try {
    await db.run(
      `UPDATE item_stock SET disponible = 1, fecha_expiracion = NULL WHERE menu_item_id = ?`,
      [menu_item_id]
    );

    console.log(`Producto ${menu_item_id} restaurado a disponible`);
  } catch (error) {
    console.error('Error restaurando stock:', error);
    throw error;
  }
}

/**
 * Obtener estado de disponibilidad de un producto
 */
export async function obtenerDisponibilidad(menu_item_id: number): Promise<boolean> {
  const db = await getDb();

  try {
    const stock = await db.get(
      `SELECT disponible, fecha_expiracion FROM item_stock WHERE menu_item_id = ?`,
      [menu_item_id]
    );

    // Si no hay registro, está disponible
    if (!stock) return true;

    // Si está marcado como disponible, retornar true
    if (stock.disponible === 1) return true;

    // Verificar si la fecha de expiración ya pasó
    if (stock.fecha_expiracion) {
      const ahora = new Date();
      const expiracion = new Date(stock.fecha_expiracion);

      if (ahora > expiracion) {
        // La restricción expiró, restaurar disponibilidad automáticamente
        await restaurarStock(menu_item_id);
        return true;
      }
    }

    // No disponible
    return false;
  } catch (error) {
    console.error('Error obteniendo disponibilidad:', error);
    return true; // Por defecto disponible si hay error
  }
}

/**
 * Obtener información de un producto sin stock
 */
export async function obtenerInfoStock(menu_item_id: number): Promise<ItemStock | null> {
  const db = await getDb();

  try {
    const stock = await db.get(
      `SELECT * FROM item_stock WHERE menu_item_id = ?`,
      [menu_item_id]
    );

    return stock || null;
  } catch (error) {
    console.error('Error obteniendo info de stock:', error);
    return null;
  }
}

/**
 * Obtener lista de productos sin stock
 */
export async function obtenerProductosSinStock(): Promise<Array<any>> {
  const db = await getDb();

  try {
    const ahora = new Date().toISOString();

    // Eliminar automáticamente las restricciones expiradas
    await db.run(
      `DELETE FROM item_stock WHERE disponible = 0 AND fecha_expiracion <= ?`,
      [ahora]
    );

    // Obtener los productos actualmente sin stock
    const productos = await db.all(
      `SELECT 
        s.id,
        s.menu_item_id,
        mi.nombre,
        mc.nombre as categoria,
        s.razon,
        s.fecha_marcado,
        s.fecha_expiracion,
        u.nombre as marcado_por_nombre
      FROM item_stock s
      LEFT JOIN menu_items mi ON s.menu_item_id = mi.id
      LEFT JOIN menu_categorias mc ON mi.categoria_id = mc.id
      LEFT JOIN usuarios u ON s.marcado_por = u.id
      WHERE s.disponible = 0 AND s.fecha_expiracion > ?
      ORDER BY s.fecha_expiracion ASC`,
      [ahora]
    );

    return productos;
  } catch (error) {
    console.error('Error obteniendo productos sin stock:', error);
    return [];
  }
}

/**
 * Limpiar restricciones de stock expiradas
 */
export async function limpiarStockExpirado(): Promise<number> {
  const db = await getDb();

  try {
    const ahora = new Date().toISOString();

    const result = await db.run(
      `DELETE FROM item_stock WHERE disponible = 0 AND fecha_expiracion <= ?`,
      [ahora]
    );

    console.log(`Stock expirado limpiado: ${result.changes || 0} registros`);
    return result.changes || 0;
  } catch (error) {
    console.error('Error limpiando stock expirado:', error);
    return 0;
  }
}
