import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { estado, metodo_pago, items } = body;
    const pedidoId = parseInt(params.id);

    if (!pedidoId) {
      return NextResponse.json(
        { message: 'ID de pedido inválido' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Verificar que el pedido existe
    const existingPedido = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(pedidoId);
    if (!existingPedido) {
      return NextResponse.json(
        { message: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    // Si se proporcionan nuevos items, agregarlos al pedido
    if (items && Array.isArray(items) && items.length > 0) {
      let newTotal = existingPedido.total || 0;

      for (const item of items) {
        // Insertar nuevo item
        db.prepare(`
          INSERT INTO detalle_pedidos (
            pedido_id, menu_item_id, producto_nombre, cantidad,
            especificaciones, notas, precio_unitario, subtotal, creado_en
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `).run(
          pedidoId,
          item.menu_item_id || 1,
          item.producto_nombre,
          item.cantidad,
          item.especificaciones || '',
          item.notas || '',
          item.precio_unitario,
          item.subtotal
        );

        newTotal += item.subtotal;
      }

      // Actualizar total del pedido
      db.prepare('UPDATE pedidos SET total = ? WHERE id = ?').run(newTotal, pedidoId);
    }

    // Actualizar estado del pedido si se proporciona
    if (estado) {
      db.prepare("UPDATE pedidos SET estado = ? WHERE id = ?").run(estado, pedidoId);
    }

    // Si se proporciona método de pago, también actualizar
    if (metodo_pago) {
      db.prepare('UPDATE pedidos SET metodo_pago = ? WHERE id = ?').run(metodo_pago, pedidoId);
    }

    return NextResponse.json({
      message: 'Pedido actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando pedido:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // PUT es equivalente a PATCH en este caso
  return PATCH(request, { params });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pedidoId = parseInt(params.id);

    if (!pedidoId) {
      return NextResponse.json(
        { message: 'ID de pedido inválido' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Obtener pedido
    const pedido = db.prepare(
      `SELECT p.*, u.nombre as mesero_nombre
       FROM pedidos p
       LEFT JOIN usuarios u ON p.mesero_id = u.id
       WHERE p.id = ?`
    ).get(pedidoId);

    if (!pedido) {
      return NextResponse.json(
        { message: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    // Obtener items
    const items = db.prepare(
      `SELECT dp.*, COALESCE(dp.producto_nombre, mi.nombre, 'Producto sin nombre') as nombre_final
       FROM detalle_pedidos dp
       LEFT JOIN menu_items mi ON dp.menu_item_id = mi.id
       WHERE dp.pedido_id = ?`
    ).all(pedidoId);

    return NextResponse.json({
      ...pedido,
      items: items.map((item: any) => ({
        id: item.id,
        nombre: item.nombre_final,
        cantidad: item.cantidad,
        especificaciones: item.especificaciones || '',
        notas: item.notas || '',
        precio_unitario: item.precio_unitario,
        subtotal: item.subtotal
      }))
    });
  } catch (error) {
    console.error('Error fetching pedido:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
