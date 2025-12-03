import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';

// Obtener fecha en zona horaria de México (Querétaro)
function getMexicoDate(): Date {
  const now = new Date();
  return new Date(now.toLocaleString('en-US', { timeZone: 'America/Mexico_City' }));
}

function generateNumeroPedido(): string {
  const db = getDb();
  const mexicoDate = getMexicoDate();
  const today = mexicoDate.toISOString().split('T')[0];

  // Contar pedidos de hoy
  const result = db.prepare(`
    SELECT COUNT(*) as count FROM pedidos
    WHERE DATE(creado_en) = DATE(?)
  `).get(today) as { count: number };

  let nextNumber = (result.count || 0) + 1;
  let numeroPedido = `Pedido ${nextNumber.toString().padStart(3, '0')}`;

  // Verificar si el número ya existe y encontrar uno único
  while (true) {
    const existing = db.prepare(`
      SELECT id FROM pedidos WHERE numero_pedido = ?
    `).get(numeroPedido);

    if (!existing) {
      return numeroPedido;
    }

    nextNumber++;
    numeroPedido = `Pedido ${nextNumber.toString().padStart(3, '0')}`;
  }
}

// Obtener o crear cuenta para una mesa
function getOrCreateCuenta(db: any, mesa_numero: string, mesero_id: number): number {
  const mexicoDate = getMexicoDate();
  const today = mexicoDate.toISOString().split('T')[0];

  // Buscar cuenta abierta para esta mesa hoy
  const cuentaExistente = db.prepare(`
    SELECT id FROM cuentas
    WHERE mesa_numero = ?
      AND estado = 'abierta'
      AND DATE(fecha_apertura) = DATE(?)
  `).get(mesa_numero, today);

  if (cuentaExistente) {
    return cuentaExistente.id;
  }

  // Usar transacción para asegurar atomicidad
  const transaction = db.transaction(() => {
    // Contar cuentas del día actual dentro de la transacción
    const countResult = db.prepare(`
      SELECT COUNT(*) as count FROM cuentas
      WHERE DATE(fecha_apertura) = DATE(?)
    `).get(today);

    const nextNumber = (countResult?.count || 0) + 1;
    const numeroCuenta = `Cuenta ${String(nextNumber).padStart(3, '0')}`;

    // Intentar insertar, si falla por UNIQUE constraint, reintentar con número incrementado
    let attempts = 0;
    let inserted = false;
    let result;

    while (!inserted && attempts < 10) {
      try {
        result = db.prepare(`
          INSERT INTO cuentas (numero_cuenta, mesa_numero, mesero_id, estado, total, fecha_apertura)
          VALUES (?, ?, ?, 'abierta', 0, datetime('now'))
        `).run(numeroCuenta.replace(/\d+$/, String(nextNumber + attempts).padStart(3, '0')), mesa_numero, mesero_id);
        inserted = true;
      } catch (error: any) {
        if (error.message.includes('UNIQUE constraint failed')) {
          attempts++;
        } else {
          throw error;
        }
      }
    }

    if (!inserted) {
      throw new Error('No se pudo generar un número de cuenta único');
    }

    return result.lastInsertRowid as number;
  });

  return transaction();
}

export async function POST(request: NextRequest) {
  try {
    const {
      mesero_id,
      mesa_numero,
      comensales,
      es_para_llevar,
      items,
      total,
      estado = 'pendiente',
      cuenta_id: providedCuentaId
    } = await request.json();

    console.log('Datos recibidos:', { mesero_id, mesa_numero, comensales, es_para_llevar, items, total, estado });

    if (!mesero_id || !mesa_numero || !items || items.length === 0) {
      return NextResponse.json(
        { message: 'Datos incompletos - Se requiere: mesero_id, mesa_numero, items' },
        { status: 400 }
      );
    }

    const db = getDb();
    const numeroPedido = generateNumeroPedido();

    console.log('Creando pedido con número:', numeroPedido);

    // Para pedidos de mesa, obtener o crear cuenta
    let cuentaId = providedCuentaId;
    if (!es_para_llevar && !cuentaId) {
      cuentaId = getOrCreateCuenta(db, mesa_numero, mesero_id);
      console.log('Cuenta ID:', cuentaId);
    }

    // Crear pedido
    const result = db.prepare(
      `INSERT INTO pedidos (numero_pedido, usuario_id, mesa_numero, comensales, es_para_llevar, total, estado, creado_en, mesero_id, cuenta_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, ?)`
    ).run(numeroPedido, mesero_id, mesa_numero, comensales || 1, es_para_llevar ? 1 : 0, total, estado, mesero_id, cuentaId || null);

    const pedidoId = result.lastInsertRowid;
    console.log('Pedido creado con ID:', pedidoId);

    // Insertar items del pedido
    for (const item of items) {
      console.log('Insertando item:', item);
      db.prepare(
        `INSERT INTO detalle_pedidos (pedido_id, menu_item_id, producto_nombre, cantidad, especificaciones, notas, precio_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        pedidoId,
        item.menu_item_id || 1,
        item.producto_nombre,
        item.cantidad,
        item.especificaciones || '',
        item.notas || '',
        item.precio_unitario || 0,
        (item.precio_unitario || 0) * item.cantidad
      );
    }

    // Marcar la mesa como ocupada si no es para llevar
    if (!es_para_llevar && mesa_numero) {
      db.prepare('UPDATE mesas SET estado = ? WHERE numero = ?').run('ocupada', mesa_numero);
      console.log(`Mesa ${mesa_numero} marcada como ocupada`);
    }

    // Actualizar total de la cuenta si existe
    if (cuentaId) {
      const totalCuenta = db.prepare(`
        SELECT SUM(total) as total FROM pedidos WHERE cuenta_id = ?
      `).get(cuentaId);
      db.prepare('UPDATE cuentas SET total = ? WHERE id = ?').run(totalCuenta?.total || 0, cuentaId);
    }

    console.log('Pedido creado exitosamente');

    return NextResponse.json({
      message: 'Pedido creado exitosamente',
      pedido: {
        id: pedidoId,
        numero_pedido: numeroPedido,
        cuenta_id: cuentaId,
        total
      }
    });
  } catch (error) {
    console.error('Error creando pedido:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor', error: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const url = new URL(request.url);
    const estado = url.searchParams.get('estado');

    let query = `
      SELECT p.*, u.nombre as mesero_nombre
      FROM pedidos p
      LEFT JOIN usuarios u ON p.mesero_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    // Filtrar por estado si se proporciona
    if (estado) {
      const estados = estado.split(',').map(e => e.trim());
      const placeholders = estados.map(() => '?').join(',');
      query += ` AND p.estado IN (${placeholders})`;
      params.push(...estados);
    } else {
      // Si no se especifica estado, excluir pedidos completamente pagados
      // 'entregado' significa entregado al cliente pero pendiente de pago
      query += ` AND p.estado NOT IN ('completado', 'pagado')`;
    }

    query += ` ORDER BY p.creado_en DESC LIMIT 100`;

    const pedidos = db.prepare(query).all(...params);

    // Obtener items de cada pedido
    const pedidosConItems = pedidos.map((pedido) => {
      const items = db.prepare(
        `SELECT dp.*, COALESCE(dp.producto_nombre, mi.nombre, 'Producto sin nombre') as nombre_final
         FROM detalle_pedidos dp
         LEFT JOIN menu_items mi ON dp.menu_item_id = mi.id
         WHERE dp.pedido_id = ?`
      ).all(pedido.id);
      return {
        ...pedido,
        items: items.map(item => ({
          id: item.id,
          nombre: item.nombre_final,
          cantidad: item.cantidad,
          especificaciones: item.especificaciones || '',
          notas: item.notas || '',
          precio_unitario: item.precio_unitario,
          subtotal: item.subtotal
        }))
      };
    });

    return NextResponse.json(pedidosConItems);
  } catch (error) {
    console.error('Error fetching pedidos:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}