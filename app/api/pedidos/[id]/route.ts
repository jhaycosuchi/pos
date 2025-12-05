import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { estado, metodo_pago, items, observaciones } = body;
    const pedidoId = parseInt(params.id);

    if (!pedidoId) {
      return NextResponse.json(
        { message: 'ID de pedido inválido' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Verificar que el pedido existe
    const existingPedido = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(pedidoId) as any;
    if (!existingPedido) {
      return NextResponse.json(
        { message: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    // Si se proporcionan nuevos items, reemplazar completamente los items del pedido
    if (items && Array.isArray(items)) {
      // Eliminar items anteriores
      db.prepare('DELETE FROM detalle_pedidos WHERE pedido_id = ?').run(pedidoId);

      let newTotal = 0;

      for (const item of items) {
        if (item.cantidad > 0) {
          const subtotal = item.cantidad * item.precio_unitario;
          
          // Insertar nuevo item
          db.prepare(`
            INSERT INTO detalle_pedidos (
              pedido_id, menu_item_id, producto_nombre, cantidad,
              especificaciones, notas, precio_unitario, subtotal
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            pedidoId,
            item.menu_item_id || null,
            item.producto_nombre || item.nombre,
            item.cantidad,
            item.especificaciones || null,
            item.notas || null,
            item.precio_unitario,
            subtotal
          );

          newTotal += subtotal;
        }
      }

      // Actualizar total del pedido
      db.prepare('UPDATE pedidos SET total = ?, actualizado_en = CURRENT_TIMESTAMP WHERE id = ?')
        .run(newTotal, pedidoId);

      // Actualizar total de la cuenta
      const pedidoData = db.prepare('SELECT cuenta_id FROM pedidos WHERE id = ?').get(pedidoId) as any;
      if (pedidoData && pedidoData.cuenta_id) {
        db.prepare(`
          UPDATE cuentas 
          SET total = (SELECT COALESCE(SUM(total), 0) FROM pedidos WHERE cuenta_id = ?)
          WHERE id = ?
        `).run(pedidoData.cuenta_id, pedidoData.cuenta_id);
      }
    }

    // Actualizar estado del pedido si se proporciona
    if (estado) {
      db.prepare("UPDATE pedidos SET estado = ?, actualizado_en = CURRENT_TIMESTAMP WHERE id = ?")
        .run(estado, pedidoId);
    }

    // Actualizar observaciones si se proporcionan
    if (observaciones !== undefined) {
      db.prepare("UPDATE pedidos SET observaciones = ?, actualizado_en = CURRENT_TIMESTAMP WHERE id = ?")
        .run(observaciones || null, pedidoId);
    }

    // Si se proporciona método de pago, también actualizar
    if (metodo_pago) {
      db.prepare('UPDATE pedidos SET metodo_pago = ?, actualizado_en = CURRENT_TIMESTAMP WHERE id = ?')
        .run(metodo_pago, pedidoId);
    }

    return NextResponse.json({
      success: true,
      message: 'Pedido actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando pedido:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor', error: String(error) },
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

export async function DELETE(
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

    // Obtener info del pedido antes de eliminarlo
    const pedido = db.prepare('SELECT cuenta_id FROM pedidos WHERE id = ?').get(pedidoId) as any;

    if (!pedido) {
      return NextResponse.json(
        { message: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar detalle_pedidos
    db.prepare('DELETE FROM detalle_pedidos WHERE pedido_id = ?').run(pedidoId);

    // Eliminar pedido
    db.prepare('DELETE FROM pedidos WHERE id = ?').run(pedidoId);

    // Actualizar total de la cuenta
    if (pedido.cuenta_id) {
      db.prepare(`
        UPDATE cuentas 
        SET total = (SELECT COALESCE(SUM(total), 0) FROM pedidos WHERE cuenta_id = ?)
        WHERE id = ?
      `).run(pedido.cuenta_id, pedido.cuenta_id);
    }

    return NextResponse.json({
      success: true,
      message: 'Pedido eliminado correctamente'
    });
  } catch (error) {
    console.error('Error deleting pedido:', error);
    return NextResponse.json(
      { message: 'Error al eliminar el pedido', error: String(error) },
      { status: 500 }
    );
  }
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
