import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { message: 'ID de modificación requerido' },
        { status: 400 }
      );
    }

    const { estado, autorizado_por } = await request.json();

    if (!estado) {
      return NextResponse.json(
        { message: 'Datos incompletos - Se requiere: estado' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Verificar que la modificación existe
    const modificacion = db.prepare('SELECT * FROM modificaciones_pedidos WHERE id = ?').get(id);
    if (!modificacion) {
      return NextResponse.json(
        { message: 'Modificación no encontrada' },
        { status: 404 }
      );
    }

    if (modificacion.estado !== 'pendiente') {
      return NextResponse.json(
        { message: 'Esta modificación ya ha sido procesada' },
        { status: 400 }
      );
    }

    // Si se aprueba y es eliminación, eliminar el pedido primero
    if (estado === 'aprobada' && modificacion.tipo === 'eliminacion') {
      try {
        console.log(`Eliminando pedido ${modificacion.pedido_id}...`);
        
        // Usar transacción para mantener integridad
        const deleteTransaction = db.transaction(() => {
          // 1. Eliminar TODAS las modificaciones de este pedido
          db.prepare('DELETE FROM modificaciones_pedidos WHERE pedido_id = ?').run(modificacion.pedido_id);
          console.log(`Modificaciones del pedido eliminadas`);
          
          // 2. Eliminar items del pedido
          db.prepare('DELETE FROM detalle_pedidos WHERE pedido_id = ?').run(modificacion.pedido_id);
          console.log(`Items del pedido eliminados`);
          
          // 3. Eliminar el pedido
          db.prepare('DELETE FROM pedidos WHERE id = ?').run(modificacion.pedido_id);
          console.log(`Pedido eliminado`);
        });
        
        deleteTransaction();
        console.log(`Pedido ${modificacion.pedido_id} eliminado completamente`);
        
        return NextResponse.json({
          message: `Pedido eliminado exitosamente`,
          modificacion_id: id,
          estado: 'aprobada'
        });
      } catch (deleteError) {
        console.error(`Error al eliminar pedido: ${deleteError}`);
        throw deleteError;
      }
    }

    // Actualizar el estado de la modificación
    db.prepare(`
      UPDATE modificaciones_pedidos
      SET estado = ?, autorizado_por = ?, fecha_autorizacion = datetime('now')
      WHERE id = ?
    `).run(estado, autorizado_por || 'Caja', id);

    console.log(`Modificación ${id} ${estado} por ${autorizado_por}`);

    return NextResponse.json({
      message: `Modificación ${estado} exitosamente`,
      modificacion_id: id,
      estado,
      autorizado_por: autorizado_por || 'Caja'
    });
  } catch (error) {
    console.error('Error actualizando modificación:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor', error: String(error) },
      { status: 500 }
    );
  }
}
