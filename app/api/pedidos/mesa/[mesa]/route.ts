import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../../lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { mesa: string } }
) {
  try {
    const mesaNumero = params.mesa;

    if (!mesaNumero) {
      return NextResponse.json(
        { message: 'Número de mesa requerido' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Buscar pedido activo para esta mesa (no entregado ni completado)
    const pedido = db.prepare(
      `SELECT p.*, u.nombre as mesero_nombre
       FROM pedidos p
       LEFT JOIN usuarios u ON p.mesero_id = u.id
       WHERE p.mesa_numero = ? AND p.estado NOT IN ('entregado', 'cancelado', 'completado')
       ORDER BY p.creado_en DESC
       LIMIT 1`
    ).get(mesaNumero);

    if (!pedido) {
      return NextResponse.json({
        pedido: null,
        message: 'No hay pedido activo para esta mesa'
      });
    }

    // Obtener items
    const items = db.prepare(
      `SELECT dp.*, COALESCE(dp.producto_nombre, mi.nombre, 'Producto sin nombre') as nombre_final
       FROM detalle_pedidos dp
       LEFT JOIN menu_items mi ON dp.menu_item_id = mi.id
       WHERE dp.pedido_id = ?`
    ).all(pedido.id);

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
    console.error('Error fetching pedido por mesa:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}