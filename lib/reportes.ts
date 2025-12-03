import { getDb } from './db';

// Tipos de reportes
export interface VentaDiaria {
  fecha: string;
  cantidad_pedidos: number;
  venta_total: number;
  promedio_pedido: number;
  cantidad_clientes: number;
  metodo_pago_efectivo: number;
  metodo_pago_tarjeta: number;
  metodo_pago_transferencia: number;
}

export interface KpiMensual {
  anio: number;
  mes: number;
  venta_total: number;
  cantidad_pedidos: number;
  promedio_pedido: number;
  cantidad_clientes: number;
  crecimiento_anterior: number;
  producto_top: string;
  categoria_top: string;
  metodo_pago_preferido: string;
  tipo_entrega_preferido: string;
}

export interface VentaProducto {
  producto: string;
  categoria: string;
  cantidad: number;
  ingresos: number;
}

export interface PerformanceMesero {
  usuario_id: number;
  nombre: string;
  cantidad_pedidos: number;
  venta_total: number;
  promedio_pedido: number;
  calificacion_promedio: number;
}

/**
 * Calcular y guardar ventas diarias
 */
export function calcularVentasDiarias(fecha?: string): void {
  const db = getDb();
  const f = fecha || new Date().toISOString().split('T')[0];

  try {
    // Obtener datos de pedidos completados del día
    const pedidos = db.prepare(
      `SELECT p.*, u.nombre as usuario_nombre
       FROM pedidos p
       LEFT JOIN usuarios u ON p.usuario_id = u.id
       WHERE DATE(p.creado_en) = ? AND p.estado IN ('listo', 'entregado')`
    ).all(f);

    if (pedidos.length === 0) {
      return;
    }

    // Calcular métricas
    const venta_total = pedidos.reduce((sum: number, p: any) => sum + p.total, 0);
    const promedio_pedido = venta_total / pedidos.length;
    const cantidad_clientes = new Set(pedidos.map((p: any) => p.cliente_nombre)).size;

    // Agrupar por método de pago
    let metodo_pago_efectivo = 0,
      metodo_pago_tarjeta = 0,
      metodo_pago_transferencia = 0;
    pedidos.forEach((p: any) => {
      const monto = p.total;
      if (p.metodo_pago === 'efectivo') metodo_pago_efectivo += monto;
      else if (p.metodo_pago === 'tarjeta') metodo_pago_tarjeta += monto;
      else if (p.metodo_pago === 'transferencia') metodo_pago_transferencia += monto;
    });

    // Agrupar por tipo de entrega
    let tipo_entrega_mesa = 0,
      tipo_entrega_llevar = 0,
      tipo_entrega_domicilio = 0;
    pedidos.forEach((p: any) => {
      const monto = p.total;
      if (p.tipo_entrega === 'mesa') tipo_entrega_mesa += monto;
      else if (p.tipo_entrega === 'llevar') tipo_entrega_llevar += monto;
      else if (p.tipo_entrega === 'domicilio') tipo_entrega_domicilio += monto;
    });

    // Guardar o actualizar ventas diarias
    db.prepare(
      `INSERT OR REPLACE INTO ventas_diarias (
        fecha, cantidad_pedidos, venta_total, promedio_pedido, cantidad_clientes,
        metodo_pago_efectivo, metodo_pago_tarjeta, metodo_pago_transferencia,
        tipo_entrega_mesa, tipo_entrega_llevar, tipo_entrega_domicilio,
        actualizado_en
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
    ).run(
        f,
        pedidos.length,
        venta_total,
        promedio_pedido,
        cantidad_clientes,
        metodo_pago_efectivo,
        metodo_pago_tarjeta,
        metodo_pago_transferencia,
        tipo_entrega_mesa,
        tipo_entrega_llevar,
        tipo_entrega_domicilio
    );

    // Calcular ventas por producto
    const detalles = db.prepare(
      `SELECT dp.*, prod.nombre, prod.categoria
       FROM detalle_pedidos dp
       JOIN productos prod ON dp.producto_id = prod.id
       JOIN pedidos p ON dp.pedido_id = p.id
       WHERE DATE(p.fecha) = ? AND p.estado IN ('listo', 'entregado')`,
      [f]
    );

    for (const detalle of detalles) {
      db.prepare(
        `INSERT OR REPLACE INTO ventas_productos (fecha, producto_id, cantidad, ingresos, actualizado_en)
         VALUES (?, ?, ?, ?, datetime('now'))`,
        [f, detalle.producto_id, detalle.cantidad, detalle.subtotal]
      );
    }

    console.log(`Ventas diarias calculadas para ${f}`);
  } catch (error) {
    console.error('Error calculando ventas diarias:', error);
    throw error;
  }
}

/**
 * Obtener reporte de ventas por rango de fechas
 */
export function obtenerReporteVentas(
  fechaInicio: string,
  fechaFin: string
): VentaDiaria[] {
  const db = getDb();

  try {
    const ventas = db.prepare(
      `SELECT * FROM ventas_diarias 
       WHERE fecha BETWEEN ? AND ? 
       ORDER BY fecha DESC`
    ).all(fechaInicio, fechaFin);

    return ventas;
  } catch (error) {
    console.error('Error obteniendo reporte de ventas:', error);
    throw error;
  }
}

/**
 * Calcular y guardar KPIs mensuales
 */
export function calcularKpisMensuales(anio: number, mes: number): void {
  const db = getDb();

  try {
    const mesStr = String(mes).padStart(2, '0');
    const inicio = `${anio}-${mesStr}-01`;
    const fin = `${anio}-${mesStr}-31`;

    // Obtener ventas del mes
    const ventasMes = db.prepare(
      `SELECT * FROM ventas_diarias WHERE fecha BETWEEN ? AND ?`
    ).all(inicio, fin);

    if (ventasMes.length === 0) {
      return;
    }

    // Calcular totales
    const venta_total = ventasMes.reduce((sum, v) => sum + v.venta_total, 0);
    const cantidad_pedidos = ventasMes.reduce((sum, v) => sum + v.cantidad_pedidos, 0);
    const promedio_pedido = venta_total / cantidad_pedidos;
    const cantidad_clientes = ventasMes.reduce((sum, v) => sum + v.cantidad_clientes, 0);

    // Producto más vendido
    const productosVentas = db.prepare(
      `SELECT p.nombre, SUM(dp.cantidad) as total_cantidad
       FROM detalle_pedidos dp
       JOIN productos p ON dp.producto_id = p.id
       JOIN pedidos pd ON dp.pedido_id = pd.id
       WHERE DATE(pd.fecha) BETWEEN ? AND ?
       GROUP BY dp.producto_id
       ORDER BY total_cantidad DESC
       LIMIT 1`
    ).all(inicio, fin);

    const producto_top = productosVentas[0]?.nombre || 'N/A';

    // Categoría más vendida
    const categoriasVentas = db.prepare(
      `SELECT categoria, SUM(cantidad) as total_cantidad
       FROM (
         SELECT prod.categoria, COUNT(*) as cantidad
         FROM detalle_pedidos dp
         JOIN productos prod ON dp.producto_id = prod.id
         JOIN pedidos p ON dp.pedido_id = p.id
         WHERE DATE(p.fecha) BETWEEN ? AND ? AND p.estado IN ('listo', 'entregado')
         GROUP BY prod.categoria
       )
       GROUP BY categoria
       ORDER BY total_cantidad DESC
       LIMIT 1`,
      [inicio, fin]
    );

    const categoria_top = categoriasVentas[0]?.categoria || 'N/A';

    // Método de pago preferido
    let metodo_pago_preferido = 'efectivo';
    const maxMetodoPago = Math.max(
      ventasMes.reduce((sum, v) => sum + v.metodo_pago_efectivo, 0),
      ventasMes.reduce((sum, v) => sum + v.metodo_pago_tarjeta, 0),
      ventasMes.reduce((sum, v) => sum + v.metodo_pago_transferencia, 0)
    );

    if (maxMetodoPago === ventasMes.reduce((sum, v) => sum + v.metodo_pago_tarjeta, 0)) {
      metodo_pago_preferido = 'tarjeta';
    } else if (
      maxMetodoPago === ventasMes.reduce((sum, v) => sum + v.metodo_pago_transferencia, 0)
    ) {
      metodo_pago_preferido = 'transferencia';
    }

    // Tipo de entrega preferido
    let tipo_entrega_preferido = 'mesa';
    const maxTipoEntrega = Math.max(
      ventasMes.reduce((sum, v) => sum + v.tipo_entrega_mesa, 0),
      ventasMes.reduce((sum, v) => sum + v.tipo_entrega_llevar, 0),
      ventasMes.reduce((sum, v) => sum + v.tipo_entrega_domicilio, 0)
    );

    if (maxTipoEntrega === ventasMes.reduce((sum, v) => sum + v.tipo_entrega_llevar, 0)) {
      tipo_entrega_preferido = 'llevar';
    } else if (
      maxTipoEntrega === ventasMes.reduce((sum, v) => sum + v.tipo_entrega_domicilio, 0)
    ) {
      tipo_entrega_preferido = 'domicilio';
    }

    // Calcular crecimiento respecto al mes anterior
    let crecimiento_anterior = 0;
    const mesAnterior = mes === 1 ? 12 : mes - 1;
    const anioAnterior = mes === 1 ? anio - 1 : anio;
    const mesAnteriorStr = String(mesAnterior).padStart(2, '0');
    const inicioAnterior = `${anioAnterior}-${mesAnteriorStr}-01`;
    const finAnterior = `${anioAnterior}-${mesAnteriorStr}-31`;

    const ventasMesAnterior = db.prepare(
      `SELECT * FROM ventas_diarias WHERE fecha BETWEEN ? AND ?`,
      [inicioAnterior, finAnterior]
    );

    if (ventasMesAnterior.length > 0) {
      const ventaTotalAnterior = ventasMesAnterior.reduce((sum, v) => sum + v.venta_total, 0);
      crecimiento_anterior = ((venta_total - ventaTotalAnterior) / ventaTotalAnterior) * 100;
    }

    // Guardar KPIs mensuales
    db.prepare(
      `INSERT OR REPLACE INTO kpis_mensuales (
        anio, mes, venta_total, cantidad_pedidos, promedio_pedido, cantidad_clientes,
        crecimiento_anterior, producto_top, categoria_top, metodo_pago_preferido,
        tipo_entrega_preferido, actualizado_en
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [
        anio,
        mes,
        venta_total,
        cantidad_pedidos,
        promedio_pedido,
        cantidad_clientes,
        crecimiento_anterior,
        producto_top,
        categoria_top,
        metodo_pago_preferido,
        tipo_entrega_preferido,
      ]
    );

    console.log(`KPIs mensuales calculados para ${anio}-${mesStr}`);
  } catch (error) {
    console.error('Error calculando KPIs mensuales:', error);
    throw error;
  }
}

/**
 * Obtener KPIs mensuales
 */
export function obtenerKpisMensuales(anio: number, mes?: number): KpiMensual[] {
  const db = getDb();

  try {
    let query = 'SELECT * FROM kpis_mensuales WHERE anio = ?';
    const params: any[] = [anio];

    if (mes) {
      query += ' AND mes = ?';
      params.push(mes);
    }

    query += ' ORDER BY mes DESC';

    const kpis = db.prepare(query).all(...params);
    return kpis;
  } catch (error) {
    console.error('Error obteniendo KPIs mensuales:', error);
    throw error;
  }
}

/**
 * Obtener performance de meseros en un período
 */
export function obtenerPerformanceMeseros(
  fechaInicio: string,
  fechaFin: string
): PerformanceMesero[] {
  const db = getDb();

  try {
    // Obtener meseros
    const meseros = db.prepare(
      `SELECT id, nombre FROM usuarios WHERE rol = 'mesero' ORDER BY nombre`
    ).all();

    const performance: PerformanceMesero[] = [];

    for (const mesero of meseros) {
      // Obtener pedidos del mesero en el período
      const pedidos = db.prepare(
        `SELECT id, total FROM pedidos 
         WHERE usuario_id = ? AND DATE(creado_en) BETWEEN ? AND ? AND estado IN ('listo', 'entregado')`
      ).all(mesero.id, fechaInicio, fechaFin);

      const cantidad_pedidos = pedidos.length;
      const venta_total = pedidos.reduce((sum: number, p: any) => sum + (p.total || 0), 0);
      const promedio_pedido = cantidad_pedidos > 0 ? venta_total / cantidad_pedidos : 0;

      // Obtener calificación promedio
      const calificacion = db.prepare(
        `SELECT AVG(e.calificacion) as promedio FROM evaluaciones_pedidos e
         JOIN pedidos p ON e.pedido_id = p.id
         WHERE p.usuario_id = ? AND DATE(p.creado_en) BETWEEN ? AND ?`
      ).get(mesero.id, fechaInicio, fechaFin);

      performance.push({
        usuario_id: mesero.id,
        nombre: mesero.nombre,
        cantidad_pedidos,
        venta_total,
        promedio_pedido,
        calificacion_promedio: calificacion?.promedio ? parseFloat(calificacion.promedio) : 0,
      });
    }

    return performance;
  } catch (error) {
    console.error('Error obteniendo performance de meseros:', error);
    return [];
  }
}

/**
 * Obtener productos más vendidos
 */
export function obtenerProductosMasVendidos(
  fechaInicio: string,
  fechaFin: string,
  limit: number = 10
): VentaProducto[] {
  const db = getDb();

  try {
    // Obtener productos más vendidos desde detalle_pedidos
    const productosVentas = db.prepare(
      `SELECT p.nombre, p.categoria, SUM(dp.cantidad) as cantidad, 
              SUM(dp.cantidad * dp.precio_unitario) as ingresos
       FROM detalle_pedidos dp
       JOIN productos p ON dp.producto_id = p.id
       JOIN pedidos pd ON dp.pedido_id = pd.id
       WHERE DATE(pd.fecha) BETWEEN ? AND ?
         AND pd.estado NOT IN ('cancelado')
       GROUP BY dp.producto_id
       ORDER BY cantidad DESC
       LIMIT ?`
    ).all(fechaInicio, fechaFin, limit);

    if (productosVentas.length > 0) {
      return productosVentas.map((p: any) => ({
        producto: p.nombre || 'Desconocido',
        categoria: p.categoria || 'Otros',
        cantidad: p.cantidad || 0,
        ingresos: p.ingresos || 0,
      }));
    }

    // Si no hay datos, retornar array vacío
    return [];
  } catch (error) {
    console.error('Error obteniendo productos más vendidos:', error);
    return [];
  }
}

/**
 * Guardar evaluación de pedido (calificación)
 */
export function guardarEvaluacionPedido(
  pedido_id: number,
  calificacion: number,
  comentario?: string
): void {
  const db = getDb();

  try {
    if (calificacion < 1 || calificacion > 5) {
      throw new Error('Calificación debe estar entre 1 y 5');
    }

    db.prepare(
      `INSERT INTO evaluaciones_pedidos (pedido_id, calificacion, comentario)
       VALUES (?, ?, ?)`,
      [pedido_id, calificacion, comentario || null]
    );
  } catch (error) {
    console.error('Error guardando evaluación:', error);
    throw error;
  }
}
